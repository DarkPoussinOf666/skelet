import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { TissueDeformation } from '../src/biometrics/tissue-deformation.js';
import { ScoliosisEngine } from '../src/biometrics/scoliosis.js';
import { createSurfaceAnchor, resolveSurfaceAnchor, isSurfaceAnchor } from '../src/observations/surface-anchor.js';
import { NotesManager, STORAGE_KEY } from '../src/observations/notes.js';

async function fixture() {
  const root = new THREE.Group();
  root.position.set(1, 2, 3);
  root.rotation.y = .2;
  const makeBone = (name, y, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.03, .025, .03));
    mesh.name = name;
    mesh.position.set(0, y, z);
    mesh.userData = { layer: 'skeleton', restPosition: mesh.position.clone(), restQuaternion: mesh.quaternion.clone() };
    root.add(mesh);
    return mesh;
  };
  const sacrum = makeBone('Sacrum', 0);
  const spine = makeBone('Vertebra_L5', .04);
  const fixed = makeBone('Scapulal', .1, .1);
  const geo = new THREE.BufferGeometry();
  // Normalized, quantized coordinates like the distributed GLBs.
  geo.setAttribute('position', new THREE.Int16BufferAttribute([0, 0, 0, 32767, 0, 0, 0, 32767, 0], 3, true));
  geo.computeVertexNormals();
  const tissue = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  tissue.name = 'Multifidus_lumborum_musclel';
  tissue.position.set(.017, .02, 0);
  tissue.scale.setScalar(.03);
  tissue.userData = { layer: 'muscles', anatomyId: 'test-muscle' };
  root.add(tissue);
  const limb = new THREE.Mesh(new THREE.BoxGeometry(.005, .005, .005));
  limb.position.set(0, .11, .1);
  limb.userData.layer = 'muscles';
  limb.name = 'Deltoid';
  root.add(limb);
  const meshes = [sacrum, spine, fixed, tissue, limb];
  const engine = new ScoliosisEngine();
  engine.initIndex(meshes);
  const rig = new TissueDeformation();
  await rig.init(root, meshes, engine, async () => {});
  engine.onPoseChange = () => rig.update();
  return { root, engine, rig, meshes, skin: meshes[3], fixed, limb, original: tissue };
}

describe('Déformation des tissus', () => {
  it('respecte la quantification, les parents et les géométries initiales ; restaure le neutre sans dérive', async () => {
    const { engine, skin, original } = await fixture();
    expect(skin.isSkinnedMesh).toBe(true);
    expect(original.geometry.getAttribute('skinWeight')).toBeUndefined();
    const rest = [0, 1, 2].map(i => skin.getVertexPosition(i, new THREE.Vector3()).clone());
    let moved = 0;
    for (let cycle = 0; cycle < 10; cycle++) {
      engine.apply(35, true);
      moved = skin.getVertexPosition(2, new THREE.Vector3()).distanceTo(rest[2]);
      engine.apply(0, true);
      for (let i = 0; i < 3; i++) expect(skin.getVertexPosition(i, new THREE.Vector3()).distanceTo(rest[i])).toBeLessThan(1e-5);
    }
    expect(moved).toBeGreaterThan(.001);
  });

  it('borne tous les sommets déformés et sélectionne la surface visible', async () => {
    const { engine, skin } = await fixture();
    engine.apply(32, true);
    const points = [0, 1, 2].map(i => skin.getVertexPosition(i, new THREE.Vector3()));
    for (const p of points) expect(skin.boundingBox.containsPoint(p)).toBe(true);
    const center = points.reduce((p, v) => p.add(v), new THREE.Vector3()).multiplyScalar(1 / 3);
    skin.localToWorld(center);
    const normal = new THREE.Triangle(...points).getNormal(new THREE.Vector3()).transformDirection(skin.matrixWorld);
    const hits = new THREE.Raycaster(center.clone().addScaledVector(normal, .1), normal.clone().negate()).intersectObject(skin, false);
    expect(hits).toHaveLength(1);
    expect(hits[0].point.distanceTo(center)).toBeLessThan(1e-6);
  });

  it('maintient les repères barycentriques après déformation et rejette une topologie incompatible', async () => {
    const { engine, skin } = await fixture();
    const center = [0, 1, 2].reduce((p, i) => p.add(skin.getVertexPosition(i, new THREE.Vector3())), new THREE.Vector3()).multiplyScalar(1 / 3);
    skin.localToWorld(center);
    const anchor = createSurfaceAnchor(skin, center, { a: 0, b: 1, c: 2 });
    expect(isSurfaceAnchor(anchor)).toBe(true);
    engine.apply(32, true);
    const expected = [0, 1, 2].reduce((p, i) => p.add(skin.getVertexPosition(i, new THREE.Vector3())), new THREE.Vector3()).multiplyScalar(1 / 3);
    skin.localToWorld(expected);
    expect(resolveSurfaceAnchor(skin, anchor).distanceTo(expected)).toBeLessThan(1e-6);
    expect(resolveSurfaceAnchor(skin, { ...anchor, topology: 'old' })).toBeNull();
    expect(isSurfaceAnchor({ ...anchor, weights: [NaN, 0, 1] })).toBe(false);
  });

  it('suit les changements de repère global après liaison', async () => {
    const { root, rig, skin } = await fixture();
    const before = skin.localToWorld(skin.getVertexPosition(0, new THREE.Vector3()));
    root.position.x += 2;
    rig.update();
    const after = skin.localToWorld(skin.getVertexPosition(0, new THREE.Vector3()));
    expect(after.distanceTo(before.add(new THREE.Vector3(2, 0, 0)))).toBeLessThan(1e-6);
  });

  it('ne lie rien quand la colonne est absente', async () => {
    const root = new THREE.Group();
    const engine = new ScoliosisEngine();
    const rig = new TissueDeformation();
    engine.initIndex([]);
    await rig.init(root, [], engine);
    rig.update();
    expect(rig.stats.meshes).toBe(0);
  });

  it('recharge les ancrages persistés et déplace leurs marqueurs sans réécrire les anciennes notes', async () => {
    const store = new Map();
    vi.stubGlobal('localStorage', { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value) });
    try {
      const { skin, engine, meshes } = await fixture();
      const point = skin.localToWorld(skin.getVertexPosition(1, new THREE.Vector3()));
      const note = { id: 'new', boneId: 'test-muscle', boneLabel: 'Test', point: point.toArray(), kind: 'Observation personnelle', intensity: 0, date: '2026-09-16', text: 'Test de surface' };
      const manager = new NotesManager();
      expect(manager.saveNote({ ...note, id: 'legacy' })).toBe(true);
      expect(manager.saveNote({ ...note, anchor: createSurfaceAnchor(skin, point) })).toBe(true);
      const persisted = store.get(STORAGE_KEY);
      const restored = new NotesManager();
      restored.updateMarkers(meshes);
      engine.apply(32, true);
      restored.updateMarkerPositions();
      const expected = resolveSurfaceAnchor(skin, restored.notes[0].anchor);
      expect(restored.noteMarkers[0].getWorldPosition(new THREE.Vector3()).distanceTo(expected)).toBeLessThan(1e-6);
      expect(store.get(STORAGE_KEY)).toBe(persisted);
      expect(restored.notes.find(n => n.id === 'legacy').anchor).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
