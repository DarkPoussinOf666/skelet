import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CAPTURE_STORAGE_KEY,
  saveCaptureToLocalStorage,
  getLatestCaptureFromLocalStorage,
  downloadDataUrl,
  captureViewport
} from '../src/capture/capture.js';

describe('Module Capture & Persistance Locale (capture.js)', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = new Map();
    globalThis.localStorage = {
      getItem: key => mockStorage.get(key) || null,
      setItem: (key, val) => mockStorage.set(key, String(val)),
      removeItem: key => mockStorage.delete(key),
      clear: () => mockStorage.clear()
    };
  });

  it('sauvegarde une capture et ses métadonnées dans localStorage', () => {
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const metadata = { angle: 'front', cobb: 32 };

    const success = saveCaptureToLocalStorage(fakeDataUrl, metadata);
    expect(success).toBe(true);

    const retrieved = getLatestCaptureFromLocalStorage();
    expect(retrieved).not.toBeNull();
    expect(retrieved.dataUrl).toBe(fakeDataUrl);
    expect(retrieved.metadata).toEqual(metadata);
    expect(retrieved.capturedAt).toBeDefined();
  });

  it('gère gracieusement le dépassement de quota localStorage en sauvegardant les métadonnées', () => {
    // Simule une exception QuotaExceededError lors du premier appel setItem
    let callCount = 0;
    globalThis.localStorage.setItem = vi.fn((key, val) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('QuotaExceededError');
      }
      mockStorage.set(key, String(val));
    });

    const fakeDataUrl = 'data:image/png;base64,largeImage...';
    const success = saveCaptureToLocalStorage(fakeDataUrl, { angle: 'side' });
    expect(success).toBe(true);
    expect(globalThis.localStorage.setItem).toHaveBeenCalledTimes(2);

    const retrieved = getLatestCaptureFromLocalStorage();
    expect(retrieved.dataUrl).toBeNull();
    expect(retrieved.note).toContain('quota stockage local atteint');
  });

  it('déclenche le téléchargement d’une image sans erreur en environnement DOM simulé', () => {
    const clickedLinks = [];
    const mockElement = {
      download: '',
      href: '',
      style: {},
      click: vi.fn(function () {
        clickedLinks.push({ download: this.download, href: this.href });
      }),
      remove: vi.fn()
    };

    globalThis.document = {
      createElement: vi.fn(() => mockElement),
      body: {
        appendChild: vi.fn()
      }
    };

    downloadDataUrl('data:image/png;base64,abc123', 'test-capture.png');

    expect(globalThis.document.createElement).toHaveBeenCalledWith('a');
    expect(globalThis.document.body.appendChild).toHaveBeenCalledWith(mockElement);
    expect(mockElement.click).toHaveBeenCalled();
    expect(mockElement.remove).toHaveBeenCalled();
    expect(clickedLinks[0]).toEqual({
      download: 'test-capture.png',
      href: 'data:image/png;base64,abc123'
    });
  });

  it('effectue la capture WebGL et utilise le fallback toDataURL', () => {
    const renderFn = vi.fn();
    const toDataURLFn = vi.fn(() => 'data:image/png;base64,canvasData');

    const fakeRenderer = {
      render: renderFn,
      domElement: {
        width: 800,
        height: 600,
        toDataURL: toDataURLFn
      }
    };
    const fakeScene = {};
    const fakeCamera = {};

    const result = captureViewport(fakeRenderer, fakeScene, fakeCamera, { compositeBackground: false });

    expect(renderFn).toHaveBeenCalledWith(fakeScene, fakeCamera);
    expect(toDataURLFn).toHaveBeenCalledWith('image/png');
    expect(result).toBe('data:image/png;base64,canvasData');
  });
});
