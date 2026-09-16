import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ScoliosisEngine, SPINE_CHAIN_CONFIG } from '../src/biometrics/scoliosis.js';

describe('Moteur Biomécanique Scoliose EOS (scoliosis.js)', () => {
  it('définit la chaîne rachidienne complète (25 segments de Sacrum à Atlas)', () => {
    expect(SPINE_CHAIN_CONFIG.length).toBe(25);
    const names = SPINE_CHAIN_CONFIG.map(s => s.name);
    expect(names[0]).toBe('Sacrum');
    expect(names[names.length - 1]).toBe('Atlas_(C1)');
  });

  it('place l’apex de la scoliose thoracique en T7-T8 avec rotation axiale maximale', () => {
    const t8 = SPINE_CHAIN_CONFIG.find(s => s.name === 'Vertebra_T8');
    const t7 = SPINE_CHAIN_CONFIG.find(s => s.name === 'Vertebra_T7');
    expect(t8).toBeDefined();
    expect(t7).toBeDefined();
    expect(t8.rotY).toBe(-10); // Sommet de rotation axiale (convexité gauche)
    expect(t7.rotY).toBe(-9);
  });

  it('applique les transformations non-destructives et préserve le neutre à 0°', () => {
    const engine = new ScoliosisEngine();

    // Création d'os factices avec userData.restPosition et restQuaternion
    const mockBones = SPINE_CHAIN_CONFIG.map((item, idx) => {
      const mesh = new THREE.Mesh();
      mesh.name = item.name;
      mesh.position.set(0, idx * 0.03, 0);
      mesh.quaternion.identity();
      mesh.userData = {
        layer: 'skeleton',
        restPosition: mesh.position.clone(),
        restQuaternion: mesh.quaternion.clone()
      };
      return mesh;
    });

    engine.initIndex(mockBones);

    // Test à 32°
    engine.apply(32, true);
    const t8Mesh = mockBones.find(b => b.name === 'Vertebra_T8');
    expect(t8Mesh.quaternion.y).not.toBe(0); // Rotation axiale présente
    expect(t8Mesh.position.x).toBeGreaterThan(0.01); // Déviation vers la gauche anatomique (+X)

    // Test à 0° (Neutre)
    engine.apply(0, false);
    expect(t8Mesh.quaternion.y).toBeCloseTo(0, 5);
    expect(t8Mesh.quaternion.z).toBeCloseTo(0, 5);
    expect(t8Mesh.position.x).toBeCloseTo(t8Mesh.userData.restPosition.x, 5);
    expect(t8Mesh.position.y).toBeCloseTo(t8Mesh.userData.restPosition.y, 5);
  });

  it('conserve les orientations initiales et couple le crâne à C1', () => {
    const engine = new ScoliosisEngine();
    const bones = SPINE_CHAIN_CONFIG.map((item, index) => {
      const mesh = new THREE.Mesh();
      mesh.name = item.name;
      mesh.position.set(0, index * .03, 0);
      mesh.rotation.x = .1;
      mesh.userData = { layer: 'skeleton', restPosition: mesh.position.clone(), restQuaternion: mesh.quaternion.clone() };
      return mesh;
    });
    const skull = new THREE.Mesh();
    skull.position.set(0, .78, 0);
    skull.userData = { layer: 'skeleton', region: 'head' };
    bones.push(skull);
    engine.initIndex(bones);
    const rest = skull.position.clone();
    engine.apply(32, true);
    expect(skull.position.distanceTo(rest)).toBeGreaterThan(.001);
    engine.apply(32, false);
    expect(skull.position.distanceTo(rest)).toBeLessThan(1e-10);
    for (const bone of bones.slice(0, -1)) expect(bone.quaternion.angleTo(bone.userData.restQuaternion)).toBeLessThan(1e-6);
  });

  it('ne déplace pas une côte dont la vertèbre manque dans un chargement partiel', () => {
    const engine = new ScoliosisEngine();
    const rib = new THREE.Mesh();
    rib.name = 'First_ribl';
    rib.position.set(.1, 1.5, .05);
    rib.userData = { layer: 'skeleton', restPosition: rib.position.clone() };
    engine.initIndex([rib]);
    engine.apply(32, true);
    expect(rib.position.equals(rib.userData.restPosition)).toBe(true);
  });
});

describe('Cyphose sagittale indépendante', () => {
  function fixture() {
    const bones = SPINE_CHAIN_CONFIG.map((item, i) => {
      const mesh = new THREE.Mesh();
      mesh.name = item.name;
      // An already curved atlas, with anterior +Z.
      mesh.position.set(0, i * .03, .03 * Math.cos((i - 6) / 11 * Math.PI * 2));
      mesh.userData = { layer: 'skeleton', restPosition: mesh.position.clone(), restQuaternion: mesh.quaternion.clone() };
      return mesh;
    });
    const rib = new THREE.Mesh();
    rib.name = 'Seventh_ribl';
    rib.position.copy(bones.find(b => b.name === 'Vertebra_T7').position).add(new THREE.Vector3(.1, 0, .1));
    rib.userData = { layer: 'skeleton', restPosition: rib.position.clone(), restQuaternion: rib.quaternion.clone() };
    bones.push(rib);
    const engine = new ScoliosisEngine();
    engine.initIndex(bones);
    return { engine, bones, rib };
  }

  it('atteint la cible géométrique sans cumuler la courbure de repos', () => {
    const { engine, bones } = fixture();
    expect(Math.abs(engine.restKyphosis)).toBeGreaterThan(1);
    const p = level => bones.find(b => b.name === `Vertebra_T${level}`).position;
    for (const target of [0, 30, 45, 70]) {
      engine.apply(0, true, target);
      const lower = p(11).clone().sub(p(12));
      const upper = p(1).clone().sub(p(2));
      const angle = THREE.MathUtils.radToDeg(Math.atan2(upper.z, upper.y) - Math.atan2(lower.z, lower.y));
      expect(angle).toBeCloseTo(target, 8);
    }
    engine.apply(0, true, engine.restKyphosis);
    for (const bone of bones) expect(bone.position.distanceTo(bone.userData.restPosition)).toBeLessThan(1e-10);
  });

  it('combine les deux courbures, préserve les distances et entraîne les côtes', () => {
    const { engine, bones, rib } = fixture();
    engine.apply(32, true, 45);
    const t7 = bones.find(b => b.name === 'Vertebra_T7');
    expect(t7.position.x).toBeGreaterThan(.01);
    expect(Math.abs(t7.position.z - t7.userData.restPosition.z)).toBeGreaterThan(.001);
    expect(rib.position.distanceTo(t7.position)).toBeCloseTo(rib.userData.restPosition.distanceTo(t7.userData.restPosition), 10);
    for (let i = 1; i < SPINE_CHAIN_CONFIG.length; i++) {
      expect(bones[i].position.distanceTo(bones[i - 1].position)).toBeCloseTo(
        bones[i].userData.restPosition.distanceTo(bones[i - 1].userData.restPosition), 10);
    }
    for (let i = 0; i < 5; i++) {
      engine.apply(35, true, 70);
      engine.apply(undefined, false);
      for (const bone of bones) {
        expect(bone.position.distanceTo(bone.userData.restPosition)).toBeLessThan(1e-10);
        expect(bone.quaternion.angleTo(bone.userData.restQuaternion)).toBeLessThan(1e-6);
      }
    }
  });

  it('permet la cyphose seule, la désactivation indépendante et borne les entrées', () => {
    const { engine, bones } = fixture();
    const t7 = bones.find(b => b.name === 'Vertebra_T7');
    engine.apply(0, true, 45);
    expect(t7.position.x).toBe(0);
    expect(t7.position.distanceTo(t7.userData.restPosition)).toBeGreaterThan(.001);
    engine.isKyphosisActive = false;
    engine.apply(32, true);
    expect(t7.position.z).toBe(t7.userData.restPosition.z);
    engine.apply(undefined, undefined, 999);
    expect(engine.currentKyphosis).toBe(70);
    engine.apply(undefined, undefined, NaN);
    expect(engine.currentKyphosis).toBe(70);
    engine.apply(undefined, undefined, -1);
    expect(engine.currentKyphosis).toBe(0);
  });

  it('désactive le profil sagittal si une vertèbre thoracique manque', () => {
    const { engine, bones } = fixture();
    engine.initIndex(bones.filter(b => b.name !== 'Vertebra_T6'));
    expect(engine.restKyphosis).toBeNull();
    engine.apply(0, true, 45);
    for (const bone of bones) expect(bone.position.distanceTo(bone.userData.restPosition)).toBeLessThan(1e-10);
  });
});
