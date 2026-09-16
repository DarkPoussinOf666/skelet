import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { PainZones, PAIN_STORAGE_KEY } from '../src/selection/pain-zones.js';
import { SelectionManager } from '../src/selection/selection.js';
import { createDefaultLayers } from '../src/layers/layers.js';

let store;
const bone = id => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ emissive: 0x112233, emissiveIntensity: 0.2 }));
  mesh.name = id;
  return mesh;
};

beforeEach(() => {
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value)
  });
  vi.stubGlobal('document', { getElementById: () => null });
});
afterEach(() => vi.unstubAllGlobals());

describe('Zones douloureuses', () => {
  it('accumule les zones, retire une seule zone et restaure après rechargement', () => {
    const zones = new PainZones();
    const bones = Array.from({ length: 100 }, (_, i) => bone(`structure-${i}`));
    bones.forEach(b => zones.toggle(b));
    zones.toggle(bones[8]);
    const restored = new PainZones();
    expect(restored.ids.size).toBe(99);
    expect(restored.has(bones[8])).toBe(false);
    expect(restored.has(bones[99])).toBe(true);
    restored.clear();
    expect(new PainZones().ids.size).toBe(0);
  });

  it('supporte un stockage invalide ou indisponible sans perdre la sélection en mémoire', () => {
    store.set(PAIN_STORAGE_KEY, '{invalid');
    const zones = new PainZones();
    expect(zones.ids.size).toBe(0);
    localStorage.setItem = () => { throw Error('quota'); };
    const b = bone('A');
    zones.toggle(b);
    expect(zones.has(b)).toBe(true);
    expect(zones.storageAvailable).toBe(false);
  });

  it('préserve toutes les zones rouges quand la structure active change et restaure les matériaux', () => {
    const zones = new PainZones();
    const a = bone('A'), b = bone('B'), c = bone('C');
    const manager = new SelectionManager({
      renderer: { domElement: { addEventListener() {} } },
      isPainZone: mesh => zones.has(mesh)
    });
    const layers = createDefaultLayers();
    zones.toggle(a);
    manager.select(a, null, layers);
    zones.toggle(b);
    manager.select(b, null, layers);
    manager.select(c, null, layers);
    expect(a.material.emissive.getHex()).toBe(0xff392b);
    expect(b.material.emissive.getHex()).toBe(0xff392b);
    zones.remove('A');
    manager.updateHighlight(a);
    expect(a.material.emissive.getHex()).toBe(0x112233);
    expect(a.material.emissiveIntensity).toBe(0.2);
    manager.clear();
    expect(b.material.emissive.getHex()).toBe(0xff392b);
    expect(c.material.emissive.getHex()).toBe(0x112233);
  });

  it('ignore les glissements, clics secondaires et gestes annulés', () => {
    const listeners = {};
    const onSelect = vi.fn();
    new SelectionManager({ renderer: { domElement: {
      addEventListener: (name, fn) => { listeners[name] = fn; },
      getBoundingClientRect: () => { throw Error('Ne doit pas lancer de raycast'); }
    } }, onSelect });
    const down = { clientX: 10, clientY: 10, pointerId: 1, button: 0 };
    listeners.pointerdown(down);
    listeners.pointerup({ ...down, clientX: 30 });
    listeners.pointerdown({ ...down, button: 2 });
    listeners.pointerup(down);
    listeners.pointerdown(down);
    listeners.pointercancel();
    listeners.pointerup(down);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
