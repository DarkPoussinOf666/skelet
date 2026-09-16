/**
 * @file Gestionnaire de la sélection 3D, du Raycasting et de la mise en surbrillance émissive
 */
import * as THREE from 'three';
import { materialsOf, layerOf } from '../layers/layers.js';

const _raycaster = new THREE.Raycaster();
const _mouseCoord = new THREE.Vector2();

export class SelectionManager {
  /**
   * @param {object} options
   * @param {THREE.Camera} options.camera
   * @param {THREE.WebGLRenderer} options.renderer
   * @param {() => Array<THREE.Mesh>} options.getBones
   * @param {() => string} options.getPickLayer
   * @param {(bone: THREE.Mesh, point: THREE.Vector3 | null) => void} options.onSelect
   */
  constructor({ camera, renderer, getBones, getPickLayer, onSelect }) {
    this.camera = camera;
    this.renderer = renderer;
    this.getBones = getBones;
    this.getPickLayer = getPickLayer;
    this.onSelect = onSelect;

    this.selected = null;
    this.selectedPoint = null;
    this.isolated = false;

    this.setupPointerEvents();
  }

  setupPointerEvents() {
    let down = null;
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', e => {
      down = [e.clientX, e.clientY];
    });

    dom.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const rect = dom.getBoundingClientRect();
      _mouseCoord.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      _raycaster.setFromCamera(_mouseCoord, this.camera);

      const pickLayer = this.getPickLayer();
      const candidates = this.getBones().filter(b => b.visible && (pickLayer === 'all' || layerOf(b) === pickLayer));
      const hit = _raycaster.intersectObjects(candidates, false)[0];

      if (hit) {
        this.onSelect(hit.object, hit.point);
      }
    });
  }

  /**
   * Sélectionne un os, applique le surlignage émissif et met à jour l'UI.
   * @param {THREE.Mesh} bone
   * @param {THREE.Vector3} [point]
   * @param {any} layers
   */
  select(bone, point, layers) {
    if (this.selected) {
      for (const mat of materialsOf(this.selected)) {
        mat.emissive.set(0);
        mat.emissiveIntensity = 1;
      }
    }

    this.selected = bone;
    const layerKey = layerOf(bone);
    const layer = layers[layerKey];
    if (layer) {
      layer.enabled = true;
      if (layer.opacity === 0) layer.opacity = 0.65;
    }

    this.selectedPoint = point ? point.clone() : new THREE.Box3().setFromObject(bone).getCenter(new THREE.Vector3());

    for (const mat of materialsOf(bone)) {
      mat.emissive.set(layerKey === 'nerves' ? 0xb46a0a : 0x277550);
      mat.emissiveIntensity = 0.65;
    }

    const nameEl = document.getElementById('selected-name');
    if (nameEl) nameEl.textContent = bone.userData.label || bone.name;

    const detailEl = document.getElementById('selected-detail');
    if (detailEl) {
      const layerTitle = layers[layerKey]?.title || layerKey;
      detailEl.textContent = `${layerTitle} · ${bone.userData.sourceName || bone.name}. Une douleur localisée ici peut aussi concerner les tissus voisins.`;
    }

    for (const id of ['focus', 'isolate', 'save-note']) {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = false;
    }
  }

  clear() {
    if (this.selected) {
      for (const mat of materialsOf(this.selected)) {
        mat.emissive.set(0);
        mat.emissiveIntensity = 1;
      }
    }
    this.selected = null;
    this.selectedPoint = null;
  }
}
