/**
 * @file Gestionnaire du journal d'observations, validation de schéma stricte et persistance locale
 */
import * as THREE from 'three';

export const STORAGE_KEY = 'skelet.observations.v1';

export const ALLOWED_KINDS = [
  'Douleur ressentie',
  'Trouble diagnostiqué',
  'Observation personnelle'
];

/**
 * Valide strictement la structure d'une observation de santé.
 * @param {any} n
 * @returns {boolean}
 */
export function validateNote(n) {
  if (!n || typeof n !== 'object') return false;
  if (typeof n.id !== 'string' || !n.id.trim()) return false;
  if (typeof n.boneId !== 'string' || !n.boneId.trim()) return false;
  if (typeof n.boneLabel !== 'string') return false;
  if (!Array.isArray(n.point) || n.point.length !== 3 || !n.point.every(Number.isFinite)) return false;
  if (!ALLOWED_KINDS.includes(n.kind)) return false;
  if (typeof n.intensity !== 'number' || !Number.isInteger(n.intensity) || n.intensity < 0 || n.intensity > 10) return false;
  if (typeof n.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(n.date)) return false;
  if (typeof n.text !== 'string' || !n.text.trim() || n.text.length > 2000) return false;
  return true;
}

/**
 * Retourne la note clinique de référence EOS 2025 (disponible à la demande).
 * @param {THREE.Mesh | null} [t7Bone]
 * @returns {object}
 */
export function getEOSClinicalNote(t7Bone) {
  const t7Pt = t7Bone ? t7Bone.position.toArray() : [-0.014, 1.284, -0.065];
  const boneIdentifier = t7Bone ? (t7Bone.userData.anatomyId || t7Bone.name) : 'za-Vertebra_T7';

  return {
    id: 'note-eos-scoliosis-reference-2025',
    boneId: boneIdentifier,
    boneLabel: 'Vertèbre thoracique T7 (Apex)',
    point: t7Pt,
    kind: 'Trouble diagnostiqué',
    intensity: 5,
    date: '2025-01-14',
    text: 'Bilan EOS (14/01/2025) : Scoliose thoracique droite, angle de Cobb T6-T10 de 32° (22° à 32° selon les plateaux de repère T6-T7). Sommet / apex de courbure en T7-T8 avec rotation axiale des corps vertébraux (gibbosité costale droite). Cyphose thoracique T1-T12 : 45°. Lordose lombaire L1-S1 : 59°. Équilibre coronal préservé (C7-CSL : 3 mm, obliquité pelvienne : 3 mm).'
  };
}

// Géométrie et matériaux partagés pour les marqueurs 3D
const _sharedSphereGeo = new THREE.SphereGeometry(0.008, 12, 8);
const _diagnosticMat = new THREE.MeshBasicMaterial({ color: 0xb4a1ff, depthTest: false, transparent: true, opacity: 0.9 });
const _painMat = new THREE.MeshBasicMaterial({ color: 0xf2a06d, depthTest: false, transparent: true, opacity: 0.9 });

export class NotesManager {
  constructor() {
    this.notes = [];
    this.isStorageHealthy = true;
    this.editingId = null;
    this.lastDeleted = null;
    /** @type {Array<THREE.Mesh>} */
    this.noteMarkers = [];

    this.loadNotes();
  }

  loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.notes = parsed.filter(validateNote);
        }
      }
    } catch (e) {
      console.warn('Erreur lors du chargement des notes depuis localStorage:', e);
      this.isStorageHealthy = false;
    }
  }

  /**
   * Persiste la liste courante des notes.
   * @param {Array<any>} nextNotes
   * @returns {boolean}
   */
  persist(nextNotes) {
    if (!this.isStorageHealthy) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotes));
      this.notes = nextNotes;
      return true;
    } catch (e) {
      console.error('Erreur d’écriture dans localStorage (quota dépassé ou accès refusé):', e);
      return false;
    }
  }

  /**
   * Ajoute ou met à jour une observation.
   * @param {object} noteData
   * @returns {boolean}
   */
  saveNote(noteData) {
    if (!validateNote(noteData)) return false;

    let updated;
    if (this.editingId) {
      updated = this.notes.map(n => (n.id === this.editingId ? noteData : n));
      this.editingId = null;
    } else {
      updated = [noteData, ...this.notes];
    }

    return this.persist(updated);
  }

  /**
   * Supprime une observation et conserve l'élément pour annulation.
   * @param {string} id
   * @returns {boolean}
   */
  deleteNote(id) {
    const target = this.notes.find(n => n.id === id);
    if (!target) return false;

    const filtered = this.notes.filter(n => n.id !== id);
    if (this.persist(filtered)) {
      this.lastDeleted = target;
      return true;
    }
    return false;
  }

  /**
   * Restaure la dernière observation supprimée.
   * @returns {boolean}
   */
  undoDelete() {
    if (!this.lastDeleted) return false;
    const restored = [...this.notes, this.lastDeleted];
    if (this.persist(restored)) {
      this.lastDeleted = null;
      return true;
    }
    return false;
  }

  /**
   * Exporte les observations au format JSON conforme.
   */
  exportJSON() {
    const payload = {
      format: 'skelet-observations',
      version: 1,
      exportedAt: new Date().toISOString(),
      atlas: 'Z-Anatomy',
      notes: this.notes
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skelet-observations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Synchronise les marqueurs 3D sphériques sur le squelette.
   * @param {Array<THREE.Mesh>} bones
   */
  updateMarkers(bones) {
    // Nettoyage des anciens marqueurs
    while (this.noteMarkers.length) {
      const m = this.noteMarkers.pop();
      if (m.parent) m.parent.remove(m);
    }

    for (const n of this.notes) {
      const bone = bones.find(b => (b.userData.anatomyId || b.name) === n.boneId);
      if (!bone) continue;

      const mat = n.kind === 'Trouble diagnostiqué' ? _diagnosticMat : _painMat;
      const marker = new THREE.Mesh(_sharedSphereGeo, mat);

      const worldPt = new THREE.Vector3().fromArray(n.point);
      const localPt = bone.worldToLocal(worldPt);

      marker.position.copy(localPt);
      marker.renderOrder = 10;
      marker.userData.bone = bone;
      marker.visible = bone.visible;

      bone.add(marker);
      this.noteMarkers.push(marker);
    }
  }
}
