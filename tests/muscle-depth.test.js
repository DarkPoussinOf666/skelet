import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { MUSCLE_DEPTHS, classifyMuscleDepth, muscleDepthOf } from '../src/layers/muscle-depth.js';
import {
  createDefaultLayers,
  isLayerEnabled,
  layerOpacityOf,
  matchesPickLayer,
  applyVisibility
} from '../src/layers/layers.js';

describe('muscle-depth', () => {
  it('définit les 3 plans musculaires requis', () => {
    expect(MUSCLE_DEPTHS).toHaveProperty('superficial');
    expect(MUSCLE_DEPTHS).toHaveProperty('intermediate');
    expect(MUSCLE_DEPTHS).toHaveProperty('deep');
    expect(MUSCLE_DEPTHS.superficial.title).toBe('Superficiels');
    expect(MUSCLE_DEPTHS.intermediate.title).toBe('Intermédiaires');
    expect(MUSCLE_DEPTHS.deep.title).toBe('Profonds');
  });

  it('classifie 100% des muscles du catalogue sans exception', () => {
    const catalog = JSON.parse(readFileSync('dist/models/muscles-catalog.json', 'utf-8'));
    expect(catalog.length).toBeGreaterThan(400);

    const counts = { superficial: 0, intermediate: 0, deep: 0 };
    const unclassified = [];

    for (const item of catalog) {
      const depth = classifyMuscleDepth(item.name);
      if (!depth) {
        unclassified.push(item.name);
      } else {
        counts[depth]++;
      }
    }

    expect(unclassified).toEqual([]);
    expect(counts.superficial).toBe(156);
    expect(counts.intermediate).toBe(92);
    expect(counts.deep).toBe(234);
    expect(counts.superficial + counts.intermediate + counts.deep).toBe(catalog.length);
  });

  it('identifie correctement la profondeur sur un objet Mesh Three.js', () => {
    const meshWithUserData = { userData: { muscleDepth: 'deep' } };
    expect(muscleDepthOf(meshWithUserData)).toBe('deep');

    const meshWithSourceName = { userData: { sourceName: 'trapezius' } };
    expect(muscleDepthOf(meshWithSourceName)).toBe('superficial');

    const meshWithName = { userData: {}, name: 'rhomboid_major.l' };
    expect(muscleDepthOf(meshWithName)).toBe('intermediate');

    const deepSpineMesh = { userData: {}, name: 'multifidus_lumborum.r' };
    expect(muscleDepthOf(deepSpineMesh)).toBe('deep');
  });

  it('intègre les sous-couches musculaires dans createDefaultLayers', () => {
    const layers = createDefaultLayers();
    expect(layers.muscles).toBeDefined();
    expect(layers.muscles.sublayers).toBeDefined();
    expect(layers.muscles.sublayers.superficial.enabled).toBe(true);
    expect(layers.muscles.sublayers.intermediate.enabled).toBe(true);
    expect(layers.muscles.sublayers.deep.enabled).toBe(true);
  });

  it('gère l activation et l opacité par sous-couche avec isLayerEnabled et layerOpacityOf', () => {
    const layers = createDefaultLayers();
    const superficialMesh = { userData: { layer: 'muscles', muscleDepth: 'superficial' } };
    const deepMesh = { userData: { layer: 'muscles', muscleDepth: 'deep' } };
    const skeletonMesh = { userData: { layer: 'skeleton' } };

    expect(isLayerEnabled(superficialMesh, layers)).toBe(true);
    expect(isLayerEnabled(deepMesh, layers)).toBe(true);
    expect(isLayerEnabled(skeletonMesh, layers)).toBe(true);

    // Désactivation du plan superficiel
    layers.muscles.sublayers.superficial.enabled = false;
    expect(isLayerEnabled(superficialMesh, layers)).toBe(false);
    expect(isLayerEnabled(deepMesh, layers)).toBe(true);

    // Ajustement de l'opacité spécifique du plan profond
    layers.muscles.sublayers.deep.opacity = 0.85;
    expect(layerOpacityOf(deepMesh, layers)).toBe(0.85);
    expect(layerOpacityOf(superficialMesh, layers)).toBe(0.3);

    // Désactivation globale des muscles
    layers.muscles.enabled = false;
    expect(isLayerEnabled(deepMesh, layers)).toBe(false);
  });

  it('filtre avec précision les structures selon matchesPickLayer', () => {
    const supMesh = { userData: { layer: 'muscles', muscleDepth: 'superficial' } };
    const interMesh = { userData: { layer: 'muscles', muscleDepth: 'intermediate' } };
    const deepMesh = { userData: { layer: 'muscles', muscleDepth: 'deep' } };
    const skelMesh = { userData: { layer: 'skeleton' } };

    expect(matchesPickLayer(supMesh, 'all')).toBe(true);
    expect(matchesPickLayer(supMesh, 'muscles')).toBe(true);
    expect(matchesPickLayer(supMesh, 'muscles_superficial')).toBe(true);
    expect(matchesPickLayer(supMesh, 'muscles_intermediate')).toBe(false);
    expect(matchesPickLayer(supMesh, 'muscles_deep')).toBe(false);
    expect(matchesPickLayer(supMesh, 'skeleton')).toBe(false);

    expect(matchesPickLayer(deepMesh, 'muscles_deep')).toBe(true);
    expect(matchesPickLayer(deepMesh, 'muscles_superficial')).toBe(false);

    expect(matchesPickLayer(skelMesh, 'skeleton')).toBe(true);
    expect(matchesPickLayer(skelMesh, 'muscles')).toBe(false);
  });

  it('applique correctement la visibilité et l opacité aux meshes Three.js dans applyVisibility', () => {
    const layers = createDefaultLayers();
    const supMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
    supMesh.userData = { layer: 'muscles', muscleDepth: 'superficial' };

    const deepMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
    deepMesh.userData = { layer: 'muscles', muscleDepth: 'deep' };

    applyVisibility([supMesh, deepMesh], layers, { region: 'all', regionDefs: [], isolated: false, selected: null });
    expect(supMesh.visible).toBe(true);
    expect(deepMesh.visible).toBe(true);
    expect(supMesh.material.opacity).toBe(0.3);

    // Effeuillage de la surface
    layers.muscles.sublayers.superficial.enabled = false;
    layers.muscles.sublayers.deep.opacity = 0.9;
    applyVisibility([supMesh, deepMesh], layers, { region: 'all', regionDefs: [], isolated: false, selected: null });
    expect(supMesh.visible).toBe(false);
    expect(deepMesh.visible).toBe(true);
    expect(deepMesh.material.opacity).toBe(0.9);
  });
});
