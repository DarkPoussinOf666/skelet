import { describe, it, expect } from 'vitest';
import { label, displayLabel, regionDefs } from '../src/i18n/labels.js';

describe('i18n & Taxonomie Anatomique (labels.js)', () => {
  it('définit les 7 régions anatomiques canoniques', () => {
    expect(regionDefs.length).toBe(7);
    const regionKeys = regionDefs.map(r => r[0]);
    expect(regionKeys).toEqual(['all', 'head', 'spine', 'thorax', 'arms', 'pelvis', 'legs']);
  });

  it('traduit les os squelettiques correctement', () => {
    expect(label('Femur.l')).toBe('Fémur · gauche');
    expect(label('Femur.r')).toBe('Fémur · droit');
    expect(label('first_rib.l')).toBe('Côte 1 · gauche');
    expect(label('seventh_rib.r')).toBe('Côte 7 · droit');
    expect(label('twelfth_rib.r')).toBe('Côte 12 · droit');
    expect(label('Thoracic vertebra')).toBe('Vertèbre thoracique');
    expect(label('Body of sternum')).toBe('Corps du sternum');
  });

  it('traduit les tissus mous (nerfs, muscles, cartilages) via displayLabel', () => {
    expect(displayLabel('sciatic nerve.l')).toBe('Nerf sciatique · gauche');
    expect(displayLabel('brachial plexus.r')).toBe('Plexus brachial · droit');
    expect(displayLabel('gluteus maximus.l')).toBe('Grand fessier · gauche');
    expect(displayLabel('costal cartilage of first rib.l')).toBe('Cartilage costal de Côte 1 · gauche');
    expect(displayLabel('deltoid muscle.r')).toBe('Deltoïde · droit');
  });

  it('gère les entrées vides sans exception', () => {
    expect(label('')).toBe('');
    expect(displayLabel('')).toBe('');
    expect(label(null)).toBe('');
  });
});
