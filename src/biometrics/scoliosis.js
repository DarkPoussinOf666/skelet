/**
 * @file Moteur biomécanique de modélisation rachidienne (Scoliose EOS T6-T10, 22°-32°)
 * Optimisation Staff Engineer : Indexation O(1) et Object Pooling pour zéro allocation mémoire (GC-free) à l'exécution.
 */
import * as THREE from 'three';

export const SPINE_CHAIN_CONFIG = [
  { name: 'Sacrum', tiltZ: 0, rotY: 0 },
  { name: 'Vertebra_L5', tiltZ: -0.5, rotY: 0 },
  { name: 'Vertebra_L4', tiltZ: -1.5, rotY: 0 },
  { name: 'Vertebra_L3', tiltZ: -2.5, rotY: 0 },
  { name: 'Vertebra_L2', tiltZ: -2, rotY: 0 },
  { name: 'Vertebra_L1', tiltZ: -0.5, rotY: 0 },
  { name: 'Vertebra_T12', tiltZ: 3, rotY: 0 },
  { name: 'Vertebra_T11', tiltZ: 8, rotY: 1.5 },
  { name: 'Vertebra_T10', tiltZ: 15.5, rotY: 3.5 },
  { name: 'Vertebra_T9', tiltZ: 11, rotY: 7 },
  { name: 'Vertebra_T8', tiltZ: 3, rotY: 10 },
  { name: 'Vertebra_T7', tiltZ: -6, rotY: 9 },
  { name: 'Vertebra_T6', tiltZ: -16.5, rotY: 5 },
  { name: 'Vertebra_T5', tiltZ: -12, rotY: 2 },
  { name: 'Vertebra_T4', tiltZ: -6, rotY: 0 },
  { name: 'Vertebra_T3', tiltZ: -1, rotY: 0 },
  { name: 'Vertebra_T2', tiltZ: 2.5, rotY: 0 },
  { name: 'Vertebra_T1', tiltZ: 3.5, rotY: 0 },
  { name: 'Vertebra_C7', tiltZ: 2, rotY: 0 },
  { name: 'Vertebra_C6', tiltZ: 1, rotY: 0 },
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
    this.isActive = true;

    /** @type {Array<{ item: any, mesh: THREE.Mesh, prevMesh: THREE.Mesh | null, tLevel: number | null }>} */
    this.indexedVertebrae = [];

    /** @type {Array<{ mesh: THREE.Mesh, level: number }>} */
    this.indexedCoupledBones = [];

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
   * Réduit la complexité de chaque mise à jour de O(50 000) à O(52).
   * @param {Array<THREE.Mesh>} bones
   */
  initIndex(bones) {
    this.indexedVertebrae = [];
    this.indexedCoupledBones = [];

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

        this.indexedVertebrae.push({
          item,
          mesh,
          prevMesh,
          tLevel
        });
      }
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
  }

  /**
   * Applique le profil de déformation scoliotique 3D sans allocation mémoire.
   * @param {number} [cobbDeg]
   * @param {boolean} [active]
   */
  apply(cobbDeg, active) {
    if (typeof cobbDeg === 'number') this.currentCobb = cobbDeg;
    if (typeof active === 'boolean') this.isActive = active;

    const effCobb = this.isActive ? Number(this.currentCobb) : 0;
    const factor = effCobb / 32;

    let curX = 0;
    let curY = 0;

    // Mise à jour de la chaîne vertébrale
    for (let i = 0; i < this.indexedVertebrae.length; i++) {
      const { item, mesh, prevMesh, tLevel } = this.indexedVertebrae[i];

      if (i > 0 && prevMesh && prevMesh.userData.restPosition) {
        const h = mesh.userData.restPosition.y - prevMesh.userData.restPosition.y;
        const tz = item.tiltZ * factor * (Math.PI / 180);
        curX -= h * Math.sin(tz);
        curY += h * (Math.cos(tz) - 1);
      }

      const rotZ = item.tiltZ * factor * (Math.PI / 180);
      const rotY = item.rotY * factor * (Math.PI / 180);

      _tmpEuler.set(0, rotY, rotZ, 'YXZ');
      _tmpQuat.setFromEuler(_tmpEuler);
      mesh.quaternion.copy(_tmpQuat);

      _tmpDelta.set(curX, curY, 0);
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
      if (vt) {
        _tmpRel.copy(mesh.userData.restPosition).sub(vt.restPosition).applyQuaternion(vt.quat);
        mesh.position.copy(vt.restPosition).add(vt.delta).add(_tmpRel);
        mesh.quaternion.copy(vt.quat);
        mesh.updateMatrixWorld(true);
      }
    }

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

    if (slider) slider.value = String(effCobb);
    if (sliderVal) sliderVal.textContent = effCobb + '°';
    if (cobbVal) cobbVal.textContent = effCobb + '°';

    if (toggleBtn) {
      const isPressed = this.isActive && effCobb > 0;
      toggleBtn.setAttribute('aria-pressed', String(isPressed));
      toggleBtn.textContent = isPressed ? `Rachis EOS (${effCobb}°)` : 'Rachis neutre';
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      const angle = Number(btn.getAttribute('data-angle'));
      btn.classList.toggle('active', this.isActive && angle === effCobb);
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
        this.isActive = val > 0;
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    }

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.isActive = !this.isActive;
        if (this.isActive && this.currentCobb === 0) this.currentCobb = 32;
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        const angle = Number(btn.getAttribute('data-angle'));
        this.currentCobb = angle;
        this.isActive = angle > 0;
        this.apply(this.currentCobb, this.isActive);
        if (onRequestRender) onRequestRender(this.currentCobb);
      };
    });
  }
}
