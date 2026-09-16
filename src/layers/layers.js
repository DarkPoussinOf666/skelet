/**
 * @file Gestionnaire des couches anatomiques (Squelette, Muscles, Nerfs) et de leur visibilité / opacité
 */
import * as THREE from 'three';

export function createDefaultLayers() {
  return {
    skeleton: { title: 'Squelette', enabled: true, opacity: 1 },
    muscles: { title: 'Muscles', enabled: true, opacity: 0.3 },
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
    const layer = layers[layerOf(b)];
    const isVisible = layer.enabled && layer.opacity > 0 && (isolated ? b === selected : matchesRegion(b, region, regionDefs));
    b.visible = isVisible;

    for (const mat of materialsOf(b)) {
      const opacity = isolated && b === selected ? 1 : layer.opacity;
      mat.opacity = opacity;
      if (mat.transparent !== (opacity < 1)) mat.needsUpdate = true;
      mat.transparent = opacity < 1;
      mat.depthWrite = opacity >= 0.95;
      mat.side = opacity < 1 ? THREE.FrontSide : THREE.DoubleSide;
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
  }

  const pickEl = document.getElementById('pick-layer');
  if (pickEl) pickEl.value = pickLayer;
}
