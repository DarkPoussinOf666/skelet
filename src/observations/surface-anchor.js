import * as THREE from 'three';

const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
const local = new THREE.Vector3(), bary = new THREE.Vector3();

function topology(mesh) {
  return `za-v1:${mesh.geometry.attributes.position.count}:${mesh.geometry.index?.count || 0}`;
}

export function isSurfaceAnchor(anchor) {
  return anchor?.type === 'surface' && typeof anchor.topology === 'string'
    && Array.isArray(anchor.vertices) && anchor.vertices.length === 3
    && anchor.vertices.every(v => Number.isInteger(v) && v >= 0)
    && Array.isArray(anchor.weights) && anchor.weights.length === 3
    && anchor.weights.every(w => Number.isFinite(w) && w >= 0 && w <= 1)
    && Math.abs(anchor.weights.reduce((sum, w) => sum + w, 0) - 1) < 1e-6;
}

export function createSurfaceAnchor(mesh, worldPoint, face) {
  if (!mesh.geometry?.attributes.position) return null;
  mesh.updateWorldMatrix(true, false);
  local.copy(worldPoint);
  mesh.worldToLocal(local);
  if (face) {
    mesh.getVertexPosition(face.a, a);
    mesh.getVertexPosition(face.b, b);
    mesh.getVertexPosition(face.c, c);
    if (THREE.Triangle.getBarycoord(local, a, b, c, bary)) {
      bary.set(Math.max(0, bary.x), Math.max(0, bary.y), Math.max(0, bary.z));
      bary.multiplyScalar(1 / (bary.x + bary.y + bary.z));
      return { type: 'surface', topology: topology(mesh), vertices: [face.a, face.b, face.c], weights: bary.toArray() };
    }
  }
  // List selections have no picked triangle: anchor to the nearest vertex.
  let best = 0, distance = Infinity;
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    mesh.getVertexPosition(i, a);
    const d = a.distanceToSquared(local);
    if (d < distance) { distance = d; best = i; }
  }
  return { type: 'surface', topology: topology(mesh), vertices: [best, best, best], weights: [1, 0, 0] };
}

/** Return null for incompatible exports; never reinterpret stale vertex IDs. */
export function resolveSurfaceAnchor(mesh, anchor, target = new THREE.Vector3()) {
  if (!isSurfaceAnchor(anchor) || anchor.topology !== topology(mesh)
    || anchor.vertices.some(v => v >= mesh.geometry.attributes.position.count)) return null;
  target.set(0, 0, 0);
  for (let i = 0; i < 3; i++) {
    if (anchor.weights[i]) target.addScaledVector(mesh.getVertexPosition(anchor.vertices[i], a), anchor.weights[i]);
  }
  return mesh.localToWorld(target);
}
