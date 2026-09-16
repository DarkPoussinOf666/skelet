/**
 * @file Gestionnaire de la sélection 3D, du Raycasting et de la mise en surbrillance émissive
 */
import * as THREE from 'three';
import { materialsOf, layerOf, matchesPickLayer } from '../layers/layers.js';
import { muscleDepthOf, MUSCLE_DEPTHS } from '../layers/muscle-depth.js';
import { createSurfaceAnchor, resolveSurfaceAnchor } from '../observations/surface-anchor.js';

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
  constructor({ camera, renderer, getBones, getPickLayer, onSelect, isPainZone = () => false }) {
    this.camera = camera;
    this.renderer = renderer;
    this.getBones = getBones;
    this.getPickLayer = getPickLayer;
    this.onSelect = onSelect;
    this.isPainZone = isPainZone;
    this.originalEmissive = new WeakMap();

    this.selected = null;
    this.selectedPoint = null;
    this.selectedAnchor = null;
    this.isolated = false;

    this.setupPointerEvents();
  }

  setupPointerEvents() {
    let down = null;
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', e => {
      down = e.isPrimary !== false && e.button === 0 ? [e.clientX, e.clientY, e.pointerId] : null;
    });

    dom.addEventListener('pointercancel', () => { down = null; });

    dom.addEventListener('pointerup', e => {
      const start = down;
      down = null;
      if (!start || e.pointerId !== start[2] || Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 5) return;
      const rect = dom.getBoundingClientRect();
      _mouseCoord.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      _raycaster.setFromCamera(_mouseCoord, this.camera);

      const pickLayer = this.getPickLayer();
      const candidates = this.getBones().filter(b => b.visible && matchesPickLayer(b, pickLayer));
      const hit = _raycaster.intersectObjects(candidates, false)[0];

      if (hit) {
        this.onSelect(hit.object, hit.point, hit.face);
      }
    });
  }

  /**
   * Sélectionne un os, applique le surlignage émissif et met à jour l'UI.
   * @param {THREE.Mesh} bone
   * @param {THREE.Vector3} [point]
   * @param {any} layers
   */
  select(bone, point, layers, face) {
    const previous = this.selected;
    this.selected = bone;
    if (previous) this.updateHighlight(previous);
    const layerKey = layerOf(bone);
    const layer = layers[layerKey];
    if (layer) {
      layer.enabled = true;
      if (layer.opacity === 0) layer.opacity = 0.65;
      if (layerKey === 'muscles' && layer.sublayers) {
        const depth = muscleDepthOf(bone);
        if (depth && layer.sublayers[depth]) {
          layer.sublayers[depth].enabled = true;
          if (layer.sublayers[depth].opacity === 0) layer.sublayers[depth].opacity = 0.65;
        }
      }
    }

    this.selectedPoint = point ? point.clone() : new THREE.Box3().setFromObject(bone).getCenter(new THREE.Vector3());
    this.selectedAnchor = createSurfaceAnchor(bone, this.selectedPoint, face);
    this.updatePoint();

    this.updateHighlight(bone);

    const nameEl = document.getElementById('selected-name');
    if (nameEl) nameEl.textContent = bone.userData.label || bone.name;

    const detailEl = document.getElementById('selected-detail');
    if (detailEl) {
      const layerTitle = layers[layerKey]?.title || layerKey;
      const depth = layerKey === 'muscles' ? muscleDepthOf(bone) : null;
      const depthLabel = depth && MUSCLE_DEPTHS[depth] ? ` (${MUSCLE_DEPTHS[depth].title.toLowerCase()})` : '';
      detailEl.textContent = `${layerTitle}${depthLabel} · ${bone.userData.sourceName || bone.name}. Une douleur localisée ici peut aussi concerner les tissus voisins.`;
    }

    for (const id of ['focus', 'isolate', 'save-note']) {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = false;
    }
  }

  updatePoint() {
    if (this.selected && this.selectedAnchor) resolveSurfaceAnchor(this.selected, this.selectedAnchor, this.selectedPoint);
  }

  updateHighlight(bone) {
    for (const mat of materialsOf(bone)) {
      if (!mat.emissive) continue;
      if (!this.originalEmissive.has(mat)) {
        this.originalEmissive.set(mat, { color: mat.emissive.clone(), intensity: mat.emissiveIntensity });
      }
      const original = this.originalEmissive.get(mat);
      if (this.isPainZone(bone)) {
        mat.emissive.set(0xff392b);
        mat.emissiveIntensity = 0.85;
      } else if (bone === this.selected) {
        mat.emissive.set(layerOf(bone) === 'nerves' ? 0xb46a0a : 0x277550);
        mat.emissiveIntensity = 0.65;
      } else {
        mat.emissive.copy(original.color);
        mat.emissiveIntensity = original.intensity;
      }
    }
  }

  clear() {
    const previous = this.selected;
    this.selected = null;
    this.selectedPoint = null;
    this.selectedAnchor = null;
    if (previous) this.updateHighlight(previous);
  }
}
