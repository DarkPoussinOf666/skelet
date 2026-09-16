import { describe, it, expect, beforeEach } from 'vitest';
import { validateNote, getEOSClinicalNote, NotesManager, STORAGE_KEY } from '../src/observations/notes.js';

describe('Modèle d’Observations & Validation (notes.js)', () => {
  beforeEach(() => {
    // Mock simple de localStorage en environnement Node
    const store = new Map();
    globalThis.localStorage = {
      getItem: key => store.get(key) || null,
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: key => store.delete(key),
      clear: () => store.clear()
    };
  });

  it('valide une note conforme', () => {
    const valid = {
      id: 'uuid-1',
      boneId: 'za-Vertebra_T7',
      boneLabel: 'Vertèbre thoracique T7',
      point: [0.1, 1.2, -0.05],
      kind: 'Douleur ressentie',
      intensity: 7,
      date: '2026-03-15',
      text: 'Douleur vive après posture assise prolongée.'
    };
    expect(validateNote(valid)).toBe(true);
  });

  it('rejette une note avec sévérité hors bornes ou non entière', () => {
    const invalidIntensity = {
      id: 'uuid-1',
      boneId: 'za-Femur',
      boneLabel: 'Fémur',
      point: [0, 0, 0],
      kind: 'Douleur ressentie',
      intensity: 11, // > 10
      date: '2026-03-15',
      text: 'Trop intense'
    };
    expect(validateNote(invalidIntensity)).toBe(false);
  });

  it('rejette une note avec type non autorisé', () => {
    const invalidKind = {
      id: 'uuid-1',
      boneId: 'za-Femur',
      boneLabel: 'Fémur',
      point: [0, 0, 0],
      kind: 'Diagnostic inconnu',
      intensity: 3,
      date: '2026-03-15',
      text: 'Test'
    };
    expect(validateNote(invalidKind)).toBe(false);
  });

  it('rejette une note avec coordonnées 3D invalides ou NaN', () => {
    const invalidCoords = {
      id: 'uuid-1',
      boneId: 'za-Femur',
      boneLabel: 'Fémur',
      point: [0, NaN, 0],
      kind: 'Observation personnelle',
      intensity: 0,
      date: '2026-03-15',
      text: 'Coordonnée NaN'
    };
    expect(validateNote(invalidCoords)).toBe(false);
  });

  it('génère la note clinique EOS 2025 conforme', () => {
    const eos = getEOSClinicalNote(null);
    expect(validateNote(eos)).toBe(true);
    expect(eos.kind).toBe('Trouble diagnostiqué');
    expect(eos.boneLabel).toContain('T7 (Apex)');
    expect(eos.text).toContain('Bilan EOS (14/01/2025)');
  });

  it('gère le CRUD et l’annulation (Undo) avec NotesManager', () => {
    const mgr = new NotesManager();
    expect(mgr.notes.length).toBe(0);

    const note1 = {
      id: 'n-1',
      boneId: 'bone-1',
      boneLabel: 'Scapula',
      point: [1, 2, 3],
      kind: 'Douleur ressentie',
      intensity: 4,
      date: '2026-01-01',
      text: 'Gêne'
    };

    expect(mgr.saveNote(note1)).toBe(true);
    expect(mgr.notes.length).toBe(1);

    // Suppression
    expect(mgr.deleteNote('n-1')).toBe(true);
    expect(mgr.notes.length).toBe(0);

    // Annulation de la suppression
    expect(mgr.undoDelete()).toBe(true);
    expect(mgr.notes.length).toBe(1);
    expect(mgr.notes[0].id).toBe('n-1');
  });
});
