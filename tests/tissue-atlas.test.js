import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { TissueDeformation } from '../src/biometrics/tissue-deformation.js';
import { ScoliosisEngine } from '../src/biometrics/scoliosis.js';

it('adapte les GLB distribués, garde leurs IDs et borne leurs sommets à toutes les poses', async () => {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const root = new THREE.Group(), meshes = [];
  const muscleFiles = JSON.parse(readFileSync('dist/models/muscles-files.json'));
  for (const file of ['skeleton', 'head', ...muscleFiles, 'nerves']) {
    const data = readFileSync(`dist/models/${file}.glb`);
    const gltf = await loader.parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), '');
    root.add(gltf.scene);
    gltf.scene.traverse(mesh => {
      if (!mesh.isMesh) return;
      mesh.userData.layer = file.startsWith('muscles') ? 'muscles' : file === 'nerves' ? 'nerves' : 'skeleton';
      mesh.userData.restPosition = mesh.position.clone();
      mesh.userData.restQuaternion = mesh.quaternion.clone();
      meshes.push(mesh);
    });
  }
  const engine = new ScoliosisEngine();
  engine.initIndex(meshes);
  const rig = new TissueDeformation();
  const ids = meshes.map(m => m.userData.anatomyId);
  const start = performance.now();
  await rig.init(root, meshes, engine, async () => {});
  const bindMs = performance.now() - start;
  engine.onPoseChange = () => rig.update();
  expect(meshes.map(m => m.userData.anatomyId)).toEqual(ids);
  expect(meshes).toHaveLength(1004);
  const samples = [];
  let weightError = 0;
  for (const { mesh } of rig.records) {
    const pos = mesh.geometry.attributes.position;
    const weights = mesh.geometry.attributes.skinWeight;
    for (let i = 0; i < pos.count; i += Math.max(1, Math.floor(pos.count / 40))) {
      const sum = weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i);
      weightError = Math.max(weightError, Math.abs(sum - 1));
      const rest = mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
      const source = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      expect(rest.distanceTo(source), mesh.name).toBeLessThan(1e-6);
      samples.push({ mesh, i, rest });
    }
  }
  expect(weightError).toBeLessThan(1e-6);
  const updates = [];
  for (const [angle, kyphosis, active] of [[0, 45, false], [22, 45, true], [32, 45, true], [35, 70, true], [0, 0, true], [0, 45, true], [0, 45, false]]) {
    const t = performance.now();
    engine.apply(angle, active, kyphosis);
    updates.push(performance.now() - t);
    for (const { mesh, i, rest } of samples) {
      const local = mesh.getVertexPosition(i, new THREE.Vector3());
      expect(mesh.boundingBox.containsPoint(local), `${angle}° ${mesh.name}`).toBe(true);
      if (!active) expect(local.applyMatrix4(mesh.matrixWorld).distanceTo(rest)).toBeLessThan(1e-6);
    }
  }
  const targets = ['Longissimus_thoracis_muscler', 'Intercostal_nervesl', 'Posterior_root_of_spinal_nervel'];
  engine.apply(32, true);
  for (const name of targets) {
    const relevant = samples.filter(s => s.mesh.name === name);
    expect(relevant.length, name).toBeGreaterThan(0);
    const displacement = Math.max(...relevant.map(({ mesh, i, rest }) => mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld).distanceTo(rest)));
    expect(displacement, name).toBeGreaterThan(.001);
    expect(displacement, name).toBeLessThan(.1);
  }
  // Distal structures stay rigid; the thoracic curve must not drag the feet.
  const foot = meshes.find(m => /Flexor_hallucis_longus/i.test(m.name));
  expect(foot).toBeDefined();
  expect(foot.isSkinnedMesh).not.toBe(true);
  console.log('Atlas tissue audit', { ...rig.stats, bindMs: Math.round(bindMs), updateMs: updates.map(v => +v.toFixed(2)), checkedVertices: samples.length });
}, 60000);
