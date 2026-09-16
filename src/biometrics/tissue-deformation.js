import * as THREE from 'three';

// A spatial index of the resting bone surfaces. No dependency on quantized local
// coordinates, mesh origins, or screen-space distances.
function buildTree(points, depth = 0) {
  if (!points.length) return null;
  const axis = depth % 3;
  points.sort((a, b) => a[axis] - b[axis]);
  const mid = points.length >> 1;
  return { point: points[mid], axis, left: buildTree(points.slice(0, mid), depth + 1), right: buildTree(points.slice(mid + 1), depth + 1) };
}

function nearest(tree, point, result, limit = 16) {
  if (!tree) return;
  const p = tree.point;
  const d = (p[0] - point.x) ** 2 + (p[1] - point.y) ** 2 + (p[2] - point.z) ** 2;
  if (result.length < limit || d < result[result.length - 1].distance) {
    let i = result.length;
    while (i && result[i - 1].distance > d) i--;
    result.splice(i, 0, { index: p[3], distance: d });
    if (result.length > limit) result.pop();
  }
  const delta = point.getComponent(tree.axis) - p[tree.axis];
  nearest(delta < 0 ? tree.left : tree.right, point, result, limit);
  if (result.length < limit || delta * delta <= result[result.length - 1].distance) {
    nearest(delta < 0 ? tree.right : tree.left, point, result, limit);
  }
}

function family(name) {
  if (/intercostal/i.test(name)) return 'ribs';
  if (/root_of_spinal|spinal_ganglion|cauda_equina|multifidus|rotatores|interspinal|intertransvers/i.test(name)) return 'spine';
  return 'all';
}

// Interpolate a shared field instead of choosing neighbors independently at
// every vertex. Adjacent pieces in the same family see the same smooth field.
function createWeightField(tree) {
  const cache = new Map();
  const step = .008;
  const point = new THREE.Vector3();
  const neighbors = [];
  const distances = new Map();
  function corner(x, y, z) {
    const key = `${x},${y},${z}`;
    if (cache.has(key)) return cache.get(key);
    point.set(x * step, y * step, z * step);
    neighbors.length = 0;
    distances.clear();
    nearest(tree, point, neighbors, 24);
    for (const hit of neighbors) if (!distances.has(hit.index)) distances.set(hit.index, hit.distance);
    const support = neighbors[neighbors.length - 1].distance + 1e-10;
    const weights = [...distances].sort((a, b) => a[1] - b[1]).slice(0, 4)
      .map(([index, d]) => [index, (1 - d / support) ** 2 / (d + .004 ** 2) ** 2]);
    const sum = weights.reduce((total, [, w]) => total + w, 0);
    for (const pair of weights) pair[1] /= sum;
    cache.set(key, weights);
    return weights;
  }
  return p => {
    const x = Math.floor(p.x / step), y = Math.floor(p.y / step), z = Math.floor(p.z / step);
    const fx = p.x / step - x, fy = p.y / step - y, fz = p.z / step - z;
    const combined = new Map();
    for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) {
      const factor = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
      if (factor === 0) continue;
      for (const [index, weight] of corner(x + dx, y + dy, z + dz)) {
        combined.set(index, (combined.get(index) || 0) + factor * weight);
      }
    }
    const result = [...combined].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const sum = result.reduce((total, [, w]) => total + w, 0);
    for (const pair of result) pair[1] /= sum;
    return result;
  };
}

/** Visual approximation, not a model of tissue mechanics or clinical attachments. */
export class TissueDeformation {
  constructor() {
    this.records = [];
    this.controls = [];
    this.replacements = new Map();
    this.stats = { meshes: 0, vertices: 0 };
    this._matrix = new THREE.Matrix4();
    this._box = new THREE.Box3();
    this._inverse = new THREE.Matrix4();
  }

  async init(root, meshes, engine, yieldTask = () => new Promise(resolve => setTimeout(resolve, 0))) {
    root.updateMatrixWorld(true);
    const moving = new Set([
      ...engine.indexedVertebrae.filter(x => x.item.name !== 'Sacrum').map(x => x.mesh),
      ...engine.indexedCoupledBones.map(x => x.mesh),
      ...engine.indexedHeadBones.map(x => x.mesh)
    ]);
    // Without a loaded spine there is no meaningful deformation to bind.
    if (engine.indexedVertebrae.length < 2) return;
    const clouds = { all: [], spine: [], ribs: [] };
    const point = new THREE.Vector3();
    for (const mesh of meshes) {
      if (mesh.userData.layer !== 'skeleton' || !mesh.geometry.attributes.position) continue;
      const index = this.controls.length;
      const bone = new THREE.Bone();
      bone.matrixAutoUpdate = false;
      bone.matrixWorld.copy(mesh.matrixWorld);
      this.controls.push({ mesh, bone, moving: moving.has(mesh), restInverse: mesh.matrixWorld.clone().invert() });
      const isSpine = /vertebra|sacrum|coccyx|atlas|axis/i.test(mesh.name);
      const isRib = isSpine || /rib|sternum|xiphoid/i.test(mesh.name);
      const positions = mesh.geometry.attributes.position;
      // Spatially deduplicate after sampling: seam vertices must not receive
      // more influence merely because the source has duplicated normals.
      const seen = new Set();
      const step = Math.max(1, Math.floor(positions.count / 700));
      for (let v = 0; v < positions.count; v += step) {
        point.fromBufferAttribute(positions, v).applyMatrix4(mesh.matrixWorld);
        const key = `${Math.round(point.x / .002)},${Math.round(point.y / .002)},${Math.round(point.z / .002)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const sample = [point.x, point.y, point.z, index];
        clouds.all.push(sample);
        if (isSpine) clouds.spine.push(sample);
        if (isRib) clouds.ribs.push(sample);
      }
    }
    if (!clouds.all.length) return;
    const trees = Object.fromEntries(Object.entries(clouds).map(([key, cloud]) => [key, buildTree(cloud)]));
    const fields = Object.fromEntries(Object.entries(trees).filter(([, tree]) => tree).map(([key, tree]) => [key, createWeightField(tree)]));
    this.skeleton = new THREE.Skeleton(this.controls.map(c => c.bone), this.controls.map(c => c.restInverse.clone()));
    for (let m = 0; m < meshes.length; m++) {
      const mesh = meshes[m];
      if (!['muscles', 'nerves'].includes(mesh.userData.layer)) continue;
      const positions = mesh.geometry.attributes.position;
      const indices = new Uint16Array(positions.count * 4);
      const weights = new Float32Array(positions.count * 4);
      const boxes = new Map();
      const weightsAt = fields[family(mesh.name)] || fields.all;
      let affected = false;
      for (let v = 0; v < positions.count; v++) {
        point.fromBufferAttribute(positions, v).applyMatrix4(mesh.matrixWorld);
        const influences = weightsAt(point);
        for (let k = 0; k < influences.length; k++) {
          const index = influences[k][0];
          indices[v * 4 + k] = index;
          weights[v * 4 + k] = influences[k][1];
          affected ||= this.controls[index].moving && influences[k][1] > 0;
          if (!boxes.has(index)) boxes.set(index, new THREE.Box3());
          boxes.get(index).expandByPoint(point);
        }
        // Keep interaction/painting responsive during large layer binding.
        if (v && v % 16000 === 0) await yieldTask();
      }
      if (affected) {
        const geometry = new THREE.BufferGeometry();
        // Existing attributes stay immutable, including normalized integers.
        for (const [name, attribute] of Object.entries(mesh.geometry.attributes)) geometry.setAttribute(name, attribute);
        geometry.setIndex(mesh.geometry.index);
        geometry.groups = mesh.geometry.groups.map(g => ({ ...g }));
        geometry.setDrawRange(mesh.geometry.drawRange.start, mesh.geometry.drawRange.count);
        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
        const skin = new THREE.SkinnedMesh(geometry, mesh.material);
        THREE.Mesh.prototype.copy.call(skin, mesh, false);
        skin.geometry = geometry;
        skin.userData = mesh.userData;
        skin.bind(this.skeleton, mesh.matrixWorld);
        skin.boundingBox = new THREE.Box3();
        skin.boundingSphere = new THREE.Sphere();
        const parent = mesh.parent;
        if (parent) {
          const slot = parent.children.indexOf(mesh);
          parent.remove(mesh);
          parent.add(skin);
          parent.children.splice(parent.children.indexOf(skin), 1);
          parent.children.splice(slot, 0, skin);
        }
        for (const child of [...mesh.children]) skin.add(child);
        meshes[m] = skin;
        this.replacements.set(mesh, skin);
        this.records.push({ mesh: skin, boxes });
        this.stats.meshes++;
        this.stats.vertices += positions.count;
      }
      if (m % 8 === 0) await yieldTask();
    }
    this.update();
  }

  update() {
    if (!this.skeleton) return;
    for (const control of this.controls) {
      control.mesh.updateWorldMatrix(true, false);
      control.bone.matrixWorld.copy(control.mesh.matrixWorld);
    }
    this.skeleton.update();
    for (const { mesh, boxes } of this.records) {
      mesh.updateWorldMatrix(true, false);
      mesh.bindMatrixInverse.copy(mesh.matrixWorld).invert();
      this._inverse.copy(mesh.matrixWorld).invert();
      mesh.boundingBox.makeEmpty();
      // Every blended vertex is a convex combination of transformed vertices.
      // Union of per-control boxes therefore bounds the skin, without a CPU
      // pass over millions of vertices on every slider input.
      for (const [index, box] of boxes) {
        const control = this.controls[index];
        this._matrix.multiplyMatrices(control.bone.matrixWorld, control.restInverse).premultiply(this._inverse);
        this._box.copy(box).applyMatrix4(this._matrix);
        mesh.boundingBox.union(this._box);
      }
      // Float32 skin weights can sum slightly above/below one. Express the
      // rounding allowance in world units, including very small GLB scales.
      mesh.boundingBox.expandByScalar(2e-6 * this._inverse.getMaxScaleOnAxis());
      mesh.boundingBox.getBoundingSphere(mesh.boundingSphere);
    }
  }
}
