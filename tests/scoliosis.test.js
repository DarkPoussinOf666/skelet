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
    expect(t8.rotY).toBe(10); // Sommet de rotation axiale
    expect(t7.rotY).toBe(9);
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

    // Test à 0° (Neutre)
    engine.apply(0, true);
    expect(t8Mesh.quaternion.y).toBeCloseTo(0, 5);
    expect(t8Mesh.quaternion.z).toBeCloseTo(0, 5);
    expect(t8Mesh.position.x).toBeCloseTo(t8Mesh.userData.restPosition.x, 5);
    expect(t8Mesh.position.y).toBeCloseTo(t8Mesh.userData.restPosition.y, 5);
  });
});
