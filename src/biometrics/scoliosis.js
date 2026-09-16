/**
 * @file Pose rachidienne illustrative : scoliose et cyphose EOS T1–T12.
 * Profil cinématique illustratif ; poses partagées avec les tissus mous.
 */
import * as THREE from 'three';

export const SPINE_CHAIN_CONFIG = [
  { name: 'Sacrum', tiltZ: 0, rotY: 0 },
  { name: 'Vertebra_L5', tiltZ: 0.5, rotY: 0 },
  { name: 'Vertebra_L4', tiltZ: 1.5, rotY: 0 },
  { name: 'Vertebra_L3', tiltZ: 2.5, rotY: 0 },
  { name: 'Vertebra_L2', tiltZ: 2, rotY: 0 },
  { name: 'Vertebra_L1', tiltZ: 0.5, rotY: 0 },
  { name: 'Vertebra_T12', tiltZ: -3, rotY: 0 },
  { name: 'Vertebra_T11', tiltZ: -8, rotY: -1.5 },
  { name: 'Vertebra_T10', tiltZ: -15.5, rotY: -3.5 },
  { name: 'Vertebra_T9', tiltZ: -11, rotY: -7 },
  { name: 'Vertebra_T8', tiltZ: -3, rotY: -10 },
  { name: 'Vertebra_T7', tiltZ: 6, rotY: -9 },
  { name: 'Vertebra_T6', tiltZ: 16.5, rotY: -5 },
  { name: 'Vertebra_T5', tiltZ: 12, rotY: -2 },
  { name: 'Vertebra_T4', tiltZ: 6, rotY: 0 },
  { name: 'Vertebra_T3', tiltZ: 1, rotY: 0 },
  { name: 'Vertebra_T2', tiltZ: -2.5, rotY: 0 },
  { name: 'Vertebra_T1', tiltZ: -3.5, rotY: 0 },
  { name: 'Vertebra_C7', tiltZ: -2, rotY: 0 },
  { name: 'Vertebra_C6', tiltZ: -1, rotY: 0 },
  { name: 'Vertebra_C5', tiltZ: 0, rotY: 0 },
  { name: 'Vertebra_C4', tiltZ: 0, rotY: 0 },
  { name: 'Vertebra_C3', tiltZ: 0, rotY: 0 },
  { name: 'Axis_(C2)', tiltZ: 0, rotY: 0 },
  { name: 'Atlas_(C1)', tiltZ: 0, rotY: 0 }
];

export const RIB_LEVEL_MAP = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12
};

// Objets temporaires statiques réutilisés (Object Pooling)
const _tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const _tmpQuat = new THREE.Quaternion();
const _tmpDelta = new THREE.Vector3();
const _tmpRel = new THREE.Vector3();

export class ScoliosisEngine {
  constructor() {
    this.currentCobb = 32;
    this.currentKyphosis = 45;
    this.isKyphosisActive = true;
    this.restKyphosis = null;
    this.isActive = true;

    /** @type {Array<{ item: any, mesh: THREE.Mesh, prevMesh: THREE.Mesh | null, tLevel: number | null }>} */
    this.indexedVertebrae = [];

    /** @type {Array<{ mesh: THREE.Mesh, level: number }>} */
    this.indexedCoupledBones = [];
    this.indexedHeadBones = [];
    this.availableThoracicLevels = new Set();
    this.onPoseChange = null;
    this.isBinding = false;
    this._headDelta = new THREE.Matrix4();
    this._headLocal = new THREE.Matrix4();

    /** @type {Map<number, { delta: THREE.Vector3, quat: THREE.Quaternion, restPosition: THREE.Vector3 }>} */
    this.vertTransforms = new Map();
    for (let i = 1; i <= 12; i++) {
      this.vertTransforms.set(i, {
        delta: new THREE.Vector3(),
        quat: new THREE.Quaternion(),
        restPosition: new THREE.Vector3()
      });
    }
  }

  /**
   * Pré-indexation des vertèbres et des os thoraciques couplés au chargement initial.
   * Conserve les références utiles sans rechercher les structures à chaque pose.
   * @param {Array<THREE.Mesh>} bones
   */
  initIndex(bones) {
    this.indexedVertebrae = [];
    this.indexedCoupledBones = [];
    this.indexedHeadBones = [];
    this.availableThoracicLevels.clear();
    this.restKyphosis = null;

    const boneByName = new Map();
    for (const b of bones) {
      boneByName.set(b.name, b);
    }

    // 1. Indexation de la chaîne rachidienne
    for (let i = 0; i < SPINE_CHAIN_CONFIG.length; i++) {
      const item = SPINE_CHAIN_CONFIG[i];
      let mesh = boneByName.get(item.name);
      if (!mesh) {
        if (item.name.includes('Axis')) {
          mesh = bones.find(b => /Axis/i.test(b.name));
        } else if (item.name.includes('Atlas')) {
          mesh = bones.find(b => /Atlas/i.test(b.name));
        }
      }

      if (mesh && mesh.userData.restPosition) {
        const prevItem = i > 0 ? SPINE_CHAIN_CONFIG[i - 1] : null;
        const prevMesh = prevItem ? (boneByName.get(prevItem.name) || null) : null;
        const tMatch = item.name.match(/Vertebra_T(\d+)/);
        const tLevel = tMatch ? Number(tMatch[1]) : null;
        if (tLevel !== null) this.availableThoracicLevels.add(tLevel);

        this.indexedVertebrae.push({
          item,
          mesh,
          prevMesh,
          tLevel
        });
      }
    }

    // Estimate the existing sagittal bend from atlas origins, NOT endplates.
    // This geometric proxy prevents adding the entire target to an already
    // curved atlas. Missing thoracic levels disable sagittal calibration.
    if (this.availableThoracicLevels.size === 12) {
      const position = level => boneByName.get(`Vertebra_T${level}`).userData.restPosition;
      const lower = position(11).clone().sub(position(12));
      const upper = position(1).clone().sub(position(2));
      if (lower.y > 0 && upper.y > 0) {
        this.restKyphosis = THREE.MathUtils.radToDeg(Math.atan2(upper.z, upper.y) - Math.atan2(lower.z, lower.y));
      }
    }
    const t12 = boneByName.get('Vertebra_T12')?.userData.restPosition;
    const t1 = boneByName.get('Vertebra_T1')?.userData.restPosition;
    for (const entry of this.indexedVertebrae) {
      entry.sagittalWeight = 0;
      if (this.restKyphosis === null) continue;
      if (entry.tLevel !== null) {
        entry.sagittalWeight = (entry.mesh.userData.restPosition.y - t12.y) / (t1.y - t12.y) - .5;
      } else {
        // Ease back to the resting cervical orientation; C1 carries the skull.
        entry.sagittalWeight = { Vertebra_C7: .3, Vertebra_C6: .15 }[entry.item.name] || 0;
      }
    }
    // The measured proxy uses segment tangents (midpoints of these weights).
    // Normalize so a pure sagittal pose reaches the requested proxy angle.
    if (this.restKyphosis !== null) {
      const weight = level => this.indexedVertebrae.find(v => v.tLevel === level).sagittalWeight;
      const span = (weight(1) + weight(2) - weight(11) - weight(12)) / 2;
      for (const entry of this.indexedVertebrae) entry.sagittalWeight /= span;
    }

    // 2. Indexation des côtes et du sternum
    for (const b of bones) {
      if (b.userData.layer !== 'skeleton' || !b.userData.restPosition) continue;
      const name = b.name.toLowerCase();

      const ribMatch = name.match(/(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_rib/);
      if (ribMatch) {
        const level = RIB_LEVEL_MAP[ribMatch[1]];
        if (level) {
          this.indexedCoupledBones.push({ mesh: b, level });
        }
        continue;
      }

      if (/sternum|xiphoid/i.test(name)) {
        const level = /manubrium/i.test(name) ? 3 : /xiphoid/i.test(name) ? 10 : 7;
        this.indexedCoupledBones.push({ mesh: b, level });
      }
    }

    const atlas = this.indexedVertebrae.find(v => /Atlas/i.test(v.item.name))?.mesh;
    this.headDriver = atlas || null;
    if (atlas) {
      atlas.updateWorldMatrix(true, false);
      this.headRestInverse = atlas.matrixWorld.clone().invert();
      for (const mesh of bones) {
        if (mesh.userData.layer !== 'skeleton' || mesh.userData.region !== 'head') continue;
        mesh.updateWorldMatrix(true, false);
        this.indexedHeadBones.push({ mesh, restWorld: mesh.matrixWorld.clone() });
      }
    }
  }

  /**
   * Applique une pose depuis le repos puis synchronise les tissus et repères.
   * @param {number} [cobbDeg]
   * @param {boolean} [active]
   * @param {number} [kyphosisDeg] Cible géométrique illustrative, 0–70°.
   */
  apply(cobbDeg, active, kyphosisDeg) {
    if (Number.isFinite(cobbDeg)) this.currentCobb = Math.max(0, Math.min(35, cobbDeg));
    if (Number.isFinite(kyphosisDeg)) this.currentKyphosis = Math.max(0, Math.min(70, kyphosisDeg));
    if (typeof active === 'boolean') this.isActive = active;
    if (this.isBinding) return;

    const effCobb = this.isActive ? Number(this.currentCobb) : 0;
    const factor = effCobb / 32;
    const sagittalCorrection = this.isActive && this.isKyphosisActive && this.restKyphosis !== null
      ? THREE.MathUtils.degToRad(this.currentKyphosis - this.restKyphosis) : 0;

    let curX = 0;
    let curY = 0;
    let curZ = 0;

    // Mise à jour de la chaîne vertébrale
    for (let i = 0; i < this.indexedVertebrae.length; i++) {
      const { item, mesh, prevMesh, tLevel, sagittalWeight } = this.indexedVertebrae[i];

      if (i > 0 && prevMesh && prevMesh.userData.restPosition) {
        _tmpRel.copy(mesh.userData.restPosition).sub(prevMesh.userData.restPosition);
        const previousWeight = this.indexedVertebrae[i - 1].sagittalWeight;
        const rx = sagittalCorrection * (sagittalWeight + previousWeight) / 2;
        const tz = item.tiltZ * factor * (Math.PI / 180);
        const y = _tmpRel.y * Math.cos(rx) - _tmpRel.z * Math.sin(rx);
        const z = _tmpRel.y * Math.sin(rx) + _tmpRel.z * Math.cos(rx);
        curX += _tmpRel.x * Math.cos(tz) - y * Math.sin(tz) - _tmpRel.x;
        curY += _tmpRel.x * Math.sin(tz) + y * Math.cos(tz) - _tmpRel.y;
        curZ += z - _tmpRel.z;
      }

      const rotZ = item.tiltZ * factor * (Math.PI / 180);
      const rotY = item.rotY * factor * (Math.PI / 180);

      _tmpEuler.set(sagittalCorrection * sagittalWeight, rotY, rotZ, 'YXZ');
      _tmpQuat.setFromEuler(_tmpEuler);
      mesh.quaternion.copy(_tmpQuat);
      if (mesh.userData.restQuaternion) mesh.quaternion.multiply(mesh.userData.restQuaternion);

      _tmpDelta.set(curX, curY, curZ);
      mesh.position.copy(mesh.userData.restPosition).add(_tmpDelta);
      mesh.updateMatrixWorld(true);

      if (tLevel !== null && this.vertTransforms.has(tLevel)) {
        const record = this.vertTransforms.get(tLevel);
        record.delta.copy(_tmpDelta);
        record.quat.copy(_tmpQuat);
        record.restPosition.copy(mesh.userData.restPosition);
      }
    }

    // Mise à jour des côtes et du sternum couplés
    for (let i = 0; i < this.indexedCoupledBones.length; i++) {
      const { mesh, level } = this.indexedCoupledBones[i];
      const vt = this.vertTransforms.get(level);
      if (vt && this.availableThoracicLevels.has(level)) {
        _tmpRel.copy(mesh.userData.restPosition).sub(vt.restPosition).applyQuaternion(vt.quat);
        mesh.position.copy(vt.restPosition).add(vt.delta).add(_tmpRel);
        mesh.quaternion.copy(vt.quat);
        if (mesh.userData.restQuaternion) mesh.quaternion.multiply(mesh.userData.restQuaternion);
        mesh.updateMatrixWorld(true);
      }
    }

    if (this.headDriver) {
      this.headDriver.updateWorldMatrix(true, false);
      this._headDelta.multiplyMatrices(this.headDriver.matrixWorld, this.headRestInverse);
      for (const { mesh, restWorld } of this.indexedHeadBones) {
        if (mesh.parent) mesh.parent.updateWorldMatrix(true, false);
        this._headLocal.copy(mesh.parent?.matrixWorld || new THREE.Matrix4()).invert()
          .multiply(this._headDelta).multiply(restWorld);
        this._headLocal.decompose(mesh.position, mesh.quaternion, mesh.scale);
        mesh.updateMatrixWorld(true);
      }
    }

    if (this.onPoseChange) this.onPoseChange();
    this.updateUI(effCobb);
  }

  /**
   * Synchronise les éléments d'interface du panneau scoliose.
   * @param {number} effCobb
   */
  updateUI(effCobb) {
    if (typeof document === 'undefined') return;
    const slider = document.getElementById('scoliosis-slider');
    const sliderVal = document.getElementById('scoliosis-slider-val');
    const toggleBtn = document.getElementById('scoliosis-toggle-btn');
    const cobbVal = document.getElementById('scoliosis-cobb-val');
    const kyphosisSlider = document.getElementById('kyphosis-slider');
    const kyphosisValue = document.getElementById('kyphosis-slider-val');
    const kyphosisMetric = document.getElementById('kyphosis-angle-val');
    const kyphosisToggle = document.getElementById('kyphosis-enabled');
    const kyphosisApplied = this.isActive && this.isKyphosisActive && this.restKyphosis !== null;
    if (kyphosisSlider) kyphosisSlider.value = String(this.currentKyphosis);
    if (kyphosisValue) kyphosisValue.textContent = `${this.currentKyphosis}°`;
    if (kyphosisMetric) kyphosisMetric.textContent = kyphosisApplied ? `${this.currentKyphosis}°` : 'Atlas';
    if (kyphosisToggle) kyphosisToggle.checked = this.isKyphosisActive;
    const status = document.getElementById('kyphosis-status');
    if (status) status.textContent = this.restKyphosis === null
      ? 'Cyphose indisponible : chaîne T1–T12 incomplète.'
      : kyphosisApplied ? 'Cible EOS du 14/01/2025 : 45°. Forme de profil approximative.'
        : 'Courbure de profil de l’atlas conservée.';

    if (slider) slider.value = String(effCobb);
    if (sliderVal) sliderVal.textContent = effCobb + '°';
    if (cobbVal) cobbVal.textContent = effCobb + '°';

    if (toggleBtn) {
      const isPressed = this.isActive;
      toggleBtn.setAttribute('aria-pressed', String(isPressed));
      toggleBtn.textContent = isPressed ? 'Profil personnalisé' : 'Atlas de référence';
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      const angle = Number(btn.getAttribute('data-angle'));
      btn.classList.toggle('active', angle === 0 ? !this.isActive
        : this.isActive && angle === effCobb && (angle !== 32 || (kyphosisApplied && this.currentKyphosis === 45)));
    });
  }

  /**
   * Initialise les écouteurs d'événements du composant UI Scoliose.
   * @param {(cobb: number) => void} onRequestRender
   */
  setupUI(onRequestRender) {
    const slider = document.getElementById('scoliosis-slider');
    const toggleBtn = document.getElementById('scoliosis-toggle-btn');

    if (slider) {
      slider.oninput = e => {
        const val = Number(e.target.value);
        this.currentCobb = val;
        this.isActive = true;
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    }

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.isActive = !this.isActive;
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        const angle = Number(btn.getAttribute('data-angle'));
        this.currentCobb = angle;
        this.isActive = angle > 0;
        if (angle === 32) {
          this.currentKyphosis = 45;
          this.isKyphosisActive = true;
        }
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    });
    const kyphosisSlider = document.getElementById('kyphosis-slider');
    const kyphosisToggle = document.getElementById('kyphosis-enabled');
    if (kyphosisSlider) kyphosisSlider.oninput = e => {
      this.isKyphosisActive = true;
      this.apply(undefined, true, Number(e.target.value));
      if (onRequestRender) onRequestRender(this.currentCobb);
    };
    if (kyphosisToggle) kyphosisToggle.onchange = e => {
      this.isKyphosisActive = e.target.checked;
      this.apply(undefined, true);
      if (onRequestRender) onRequestRender(this.currentCobb);
    };
  }
}
