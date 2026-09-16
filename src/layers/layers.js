/**
 * @file Gestionnaire des couches anatomiques (Squelette, Muscles, Nerfs) et de leur visibilité / opacité
 */
import * as THREE from 'three';
import { muscleDepthOf } from './muscle-depth.js';

export function createDefaultLayers() {
  return {
    skeleton: { title: 'Squelette', enabled: true, opacity: 1 },
    muscles: {
      title: 'Muscles',
      enabled: true,
      opacity: 0.3,
      sublayers: {
        superficial: { title: 'Superficiels (surface)', enabled: true, opacity: 0.3 },
        intermediate: { title: 'Intermédiaires', enabled: true, opacity: 0.3 },
        deep: { title: 'Profonds', enabled: true, opacity: 0.3 }
      }
    },
    nerves: { title: 'Nerfs', enabled: true, opacity: 1 }
  };
}

/**
 * Retourne le tableau des matériaux d'un mesh Three.js.
 * @param {THREE.Mesh} b
 * @returns {Array<THREE.Material>}
 */
export const materialsOf = b => (Array.isArray(b.material) ? b.material : [b.material]);

/**
 * Retourne le calque associé à un mesh.
 * @param {THREE.Mesh} b
 * @returns {string}
 */
export const layerOf = b => b.userData.layer || 'skeleton';

/**
 * Détermine si le calque (et éventuellement la sous-couche) d'un maillage est activé.
 * @param {THREE.Mesh} b
 * @param {any} layers
 * @returns {boolean}
 */
export function isLayerEnabled(b, layers) {
  const layerKey = layerOf(b);
  const layer = layers[layerKey];
  if (!layer || !layer.enabled) return false;
  if (layerKey === 'muscles' && layer.sublayers) {
    const depth = muscleDepthOf(b);
    if (depth && layer.sublayers[depth] && !layer.sublayers[depth].enabled) {
      return false;
    }
  }
  return true;
}

/**
 * Retourne l'opacité effective d'un maillage selon son calque et sous-calque.
 * @param {THREE.Mesh} b
 * @param {any} layers
 * @returns {number}
 */
export function layerOpacityOf(b, layers) {
  const layerKey = layerOf(b);
  const layer = layers[layerKey];
  if (!layer) return 1;
  if (layerKey === 'muscles' && layer.sublayers) {
    const depth = muscleDepthOf(b);
    if (depth && layer.sublayers[depth] && typeof layer.sublayers[depth].opacity === 'number') {
      return layer.sublayers[depth].opacity;
    }
  }
  return layer.opacity ?? 1;
}

/**
 * Vérifie si un maillage correspond au filtre de sélection (pickLayer).
 * @param {THREE.Mesh} b
 * @param {string} pickLayer
 * @returns {boolean}
 */
export function matchesPickLayer(b, pickLayer) {
  if (!pickLayer || pickLayer === 'all') return true;
  const layerKey = layerOf(b);
  if (pickLayer === layerKey) return true;
  if (layerKey === 'muscles') {
    if (pickLayer === 'muscles_superficial') return muscleDepthOf(b) === 'superficial';
    if (pickLayer === 'muscles_intermediate') return muscleDepthOf(b) === 'intermediate';
    if (pickLayer === 'muscles_deep') return muscleDepthOf(b) === 'deep';
  }
  return false;
}

/**
 * Vérifie si un mesh correspond à la région anatomique sélectionnée.
 * @param {THREE.Mesh} b
 * @param {string} region
 * @param {Array<any>} regionDefs
 * @returns {boolean}
 */
export function matchesRegion(b, region, regionDefs) {
  if (region === 'all') return true;
  if (b.userData.regions) return b.userData.regions.includes(region);
  if (region === 'head') return b.userData.region === 'head';

  const source = b.userData.sourceName || b.name;
  if (region === 'spine') return /vertebra|sacrum|coccyx|atlas|axis|intervertebral/i.test(source);
  if (region === 'arms' && /foot/.test(source)) return false;

  const def = regionDefs.find(r => r[0] === region);
  return def ? def[3](source) : true;
}

/**
 * Applique les règles de visibilité et d'opacité à tous les maillages de la scène.
 * @param {Array<THREE.Mesh>} bones
 * @param {any} layers
 * @param {object} params
 * @param {string} params.region
 * @param {Array<any>} params.regionDefs
 * @param {boolean} params.isolated
 * @param {THREE.Mesh | null} params.selected
 * @param {Array<THREE.Mesh>} [noteMarkers]
 */
export function applyVisibility(bones, layers, { region, regionDefs, isolated, selected }, noteMarkers = []) {
  for (const b of bones) {
    const enabled = isLayerEnabled(b, layers);
    const opacity = layerOpacityOf(b, layers);
    const isVisible = enabled && opacity > 0 && (isolated ? b === selected : matchesRegion(b, region, regionDefs));
    b.visible = isVisible;

    for (const mat of materialsOf(b)) {
      const finalOpacity = isolated && b === selected ? 1 : opacity;
      mat.opacity = finalOpacity;
      if (mat.transparent !== (finalOpacity < 1)) mat.needsUpdate = true;
      mat.transparent = finalOpacity < 1;
      mat.depthWrite = finalOpacity >= 0.95;
      mat.side = finalOpacity < 1 ? THREE.FrontSide : THREE.DoubleSide;
    }
  }

  for (const m of noteMarkers) {
    if (m.userData.bone) {
      m.visible = m.userData.bone.visible;
    }
  }
}

/**
 * Synchronise l'état des calques avec les éléments du DOM.
 * @param {any} layers
 * @param {Array<THREE.Mesh>} bones
 * @param {string} pickLayer
 */
export function syncLayerControls(layers, bones, pickLayer) {
  for (const [id, layer] of Object.entries(layers)) {
    const toggle = document.getElementById('layer-' + id);
    if (!toggle) continue;
    toggle.checked = layer.enabled;

    const opInput = document.getElementById('opacity-' + id);
    if (opInput) opInput.value = String(Math.round(layer.opacity * 100));

    const opVal = document.getElementById('opacity-value-' + id);
    if (opVal) opVal.textContent = Math.round(layer.opacity * 100) + ' %';

    const countEl = document.getElementById('layer-count-' + id);
    if (countEl) countEl.textContent = String(bones.filter(b => layerOf(b) === id).length || '…');

    if (id === 'muscles' && layer.sublayers) {
      for (const [subId, sub] of Object.entries(layer.sublayers)) {
        const subToggle = document.getElementById('sublayer-muscles-' + subId);
        if (subToggle) subToggle.checked = layer.enabled && sub.enabled;

        const subOpInput = document.getElementById('sublayer-opacity-' + subId);
        if (subOpInput) subOpInput.value = String(Math.round(sub.opacity * 100));

        const subOpVal = document.getElementById('sublayer-opacity-val-' + subId);
        if (subOpVal) subOpVal.textContent = Math.round(sub.opacity * 100) + ' %';

        const subCountEl = document.getElementById('sublayer-count-' + subId);
        if (subCountEl) {
          subCountEl.textContent = String(bones.filter(b => layerOf(b) === 'muscles' && muscleDepthOf(b) === subId).length || '…');
        }
      }
    }
  }

  const pickEl = document.getElementById('pick-layer');
  if (pickEl) pickEl.value = pickLayer;
}
