/**
 * @file Module de capture d'image du viewport 3D et persistance locale
 */

export const CAPTURE_STORAGE_KEY = 'skelet.capture.latest';

/**
 * Capture le canvas WebGL sous forme de Data URL (PNG).
 * Compose optionnellement le modèle 3D sur le dégradé radial signature du viewport.
 * @param {import('three').WebGLRenderer} renderer
 * @param {import('three').Scene} [scene]
 * @param {import('three').Camera} [camera]
 * @param {object} [options]
 * @param {boolean} [options.compositeBackground=true] Si vrai, compose avec le fond dégradé
 * @returns {string} Data URL au format image/png
 */
export function captureViewport(renderer, scene, camera, { compositeBackground = true } = {}) {
  if (!renderer) {
    throw new Error('Renderer requis pour la capture');
  }

  // Rendu synchrone forcé pour s'assurer de la validité du buffer graphique WebGL
  if (scene && camera) {
    renderer.render(scene, camera);
  }

  const glCanvas = renderer.domElement;
  if (!glCanvas) {
    throw new Error('Canvas WebGL introuvable');
  }

  // Si l'environnement ne supporte pas la création de canvas 2D ou si la composition n'est pas demandée
  if (!compositeBackground || typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return typeof glCanvas.toDataURL === 'function' ? glCanvas.toDataURL('image/png') : '';
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = glCanvas.width;
    canvas.height = glCanvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return glCanvas.toDataURL('image/png');
    }

    // Reproduction du dégradé radial signature du viewer Skelet (.viewer)
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.44;
    const radius = Math.max(canvas.width, canvas.height) * 0.8;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, '#23363b');
    grad.addColorStop(0.45, '#14252c');
    grad.addColorStop(1, '#0b1920');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessin de la projection 3D par-dessus
    ctx.drawImage(glCanvas, 0, 0);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Erreur composition dégradé, repli sur capture directe:', err);
    return typeof glCanvas.toDataURL === 'function' ? glCanvas.toDataURL('image/png') : '';
  }
}

/**
 * Persiste la capture et ses métadonnées dans le localStorage du navigateur.
 * Gère gracieusement le dépassement éventuel de quota de stockage.
 * @param {string} dataUrl
 * @param {object} [metadata]
 * @returns {boolean}
 */
export function saveCaptureToLocalStorage(dataUrl, metadata = {}) {
  if (typeof localStorage === 'undefined') return false;

  const payload = {
    capturedAt: new Date().toISOString(),
    metadata,
    dataUrl
  };

  try {
    localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Quota localStorage atteint pour l’image complète, sauvegarde allégée des métadonnées:', err);
    try {
      localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify({
        capturedAt: payload.capturedAt,
        metadata,
        dataUrl: null,
        note: 'Image téléchargée sur le disque (quota stockage local atteint)'
      }));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Récupère les données de la dernière capture stockée.
 * @returns {object|null}
 */
export function getLatestCaptureFromLocalStorage() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CAPTURE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Déclenche le téléchargement d'une image Data URL sous forme de fichier image.
 * @param {string} dataUrl
 * @param {string} [filename]
 */
export function downloadDataUrl(dataUrl, filename) {
  if (typeof document === 'undefined' || !dataUrl) return;

  const name = filename || `skelet-vue-3d-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
  const link = document.createElement('a');
  link.download = name;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
