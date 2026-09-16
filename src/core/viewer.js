/**
 * @file Module Viewer 3D (Three.js, Caméra, Lumières, OrbitControls & Rendu à la Demande)
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

export class Viewer {
  /**
   * @param {HTMLElement} hostElement
   */
  constructor(hostElement) {
    this.host = hostElement;
    this.isDirty = true;

    // 1. Scène
    this.scene = new THREE.Scene();

    // 2. Moteur WebGL
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.error('Échec d’initialisation WebGL:', e);
      throw e;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.append(this.renderer.domElement);

    // 3. Caméra
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.005, 100);
    this.camera.position.set(0, 0.88, 3.3);

    // 4. Contrôles Orbitaux
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.86, 0);
    this.controls.enableDamping = true;
    this.controls.minDistance = 0.08;
    this.controls.maxDistance = 7;

    this.controls.addEventListener('change', () => this.requestRender());

    // 5. Éclairage
    this.setupLights();

    // 6. Gestion du redimensionnement réactif
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.host);
    this.onResize();

    // 7. Boucle d'animation optimisée (Render on Demand)
    this.renderer.setAnimationLoop(() => this.renderLoop());
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xc6e8ed, 0x45534a, 2));

    const key = new THREE.DirectionalLight(0xfff1d9, 3.1);
    key.position.set(-2, 4, 4);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xb1d8e2, 1.9);
    fill.position.set(3, 2, -3);
    this.scene.add(fill);
  }

  onResize() {
    const width = this.host.clientWidth || 1;
    const height = this.host.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  }

  requestRender() {
    this.isDirty = true;
  }

  renderLoop() {
    // Si l'amortissement orbital bouge encore, controls.update() retourne true
    const isMoving = this.controls.update();
    if (isMoving || this.isDirty) {
      this.renderer.render(this.scene, this.camera);
      this.isDirty = false;
    }
  }

  /**
   * Cadre la caméra sur une Bounding Box avec orientation optionnelle.
   * @param {THREE.Box3} box
   * @param {THREE.Vector3} [preferredDir]
   */
  frameBox(box, preferredDir) {
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const dist = Math.max(size.y, size.x / this.camera.aspect) / 2 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 1.35;

    let dir = preferredDir || this.camera.position.clone().sub(this.controls.target);
    if (dir.lengthSq() < 1e-4) dir = new THREE.Vector3(0, 0, 1);
    dir.normalize();

    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(dir, Math.max(dist, 0.18));
    this.controls.update();
    this.requestRender();
  }

  /**
   * Recadre la vue sur l'ensemble des structures visibles.
   * @param {Array<THREE.Mesh>} bones
   * @param {THREE.Vector3} [preferredDir]
   */
  frameVisible(bones, preferredDir) {
    const box = new THREE.Box3();
    for (const b of bones) {
      if (b.visible) {
        b.updateMatrixWorld(true);
        box.expandByObject(b);
      }
    }
    this.frameBox(box, preferredDir);
  }

  /**
   * Modifie le zoom d'un facteur donné.
   * @param {number} factor
   */
  zoom(factor) {
    this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);
    this.controls.update();
    this.requestRender();
  }

  dispose() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
