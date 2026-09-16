/**
 * @file Point d'entrée principal de l'application Skelet (Orchestrateur Modulaire)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/meshopt_decoder.module.js';

import { Viewer } from './core/viewer.js';
import { ScoliosisEngine } from './biometrics/scoliosis.js';
import { createDefaultLayers, applyVisibility, syncLayerControls, layerOf, materialsOf } from './layers/layers.js';
import { SelectionManager } from './selection/selection.js';
import { NotesManager, getEOSClinicalNote } from './observations/notes.js';
import { regionDefs, displayLabel } from './i18n/labels.js';

const $ = id => document.getElementById(id);

class SkeletApp {
  constructor() {
    this.region = 'all';
    this.pickLayer = 'all';
    this.bones = [];
    this.model = null;

    // Initialisation des gestionnaires
    this.layers = createDefaultLayers();
    this.viewer = new Viewer($('canvas'));
    this.scoliosis = new ScoliosisEngine();
    this.notesManager = new NotesManager();

    this.selectionManager = new SelectionManager({
      camera: this.viewer.camera,
      renderer: this.viewer.renderer,
      getBones: () => this.bones,
      getPickLayer: () => this.pickLayer,
      onSelect: (bone, point) => this.selectBone(bone, point)
    });

    this.setupUI();
    this.loadAtlas();
  }

  status(message) {
    const el = $('save-status');
    if (el) el.textContent = message;
  }

  updateVisibility() {
    applyVisibility(
      this.bones,
      this.layers,
      {
        region: this.region,
        regionDefs,
        isolated: this.selectionManager.isolated,
        selected: this.selectionManager.selected
      },
      this.notesManager.noteMarkers
    );
    this.viewer.requestRender();
  }

  selectBone(bone, point) {
    this.selectionManager.select(bone, point, this.layers);
    this.updateVisibility();
    syncLayerControls(this.layers, this.bones, this.pickLayer);
    this.renderBones();
    this.viewer.requestRender();
  }

  renderRegions() {
    const nav = $('regions');
    if (!nav) return;

    nav.replaceChildren(
      ...regionDefs.map(([id, icon, name]) => {
        const btn = document.createElement('button');
        btn.className = id === this.region ? 'active' : '';
        btn.innerHTML = `<span>${icon}</span>${name}`;
        btn.setAttribute('aria-pressed', String(id === this.region));
        btn.onclick = () => {
          this.region = id;
          this.selectionManager.isolated = false;
          const isoBtn = $('isolate');
          if (isoBtn) isoBtn.textContent = 'Isoler';
          this.renderRegions();
          this.renderBones();
          this.updateVisibility();
          this.viewer.frameVisible(this.bones);
        };
        return btn;
      })
    );
  }

  renderBones() {
    const searchInput = $('search');
    const query = searchInput ? searchInput.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

    const list = this.bones.filter(b => {
      const matchReg = this.region === 'all' || (b.userData.regions && b.userData.regions.includes(this.region)) || (this.region === 'head' && b.userData.region === 'head') || regionDefs.find(r => r[0] === this.region)?.[3](b.userData.sourceName || b.name);
      const layerActive = this.layers[layerOf(b)]?.enabled;
      const pickMatch = this.pickLayer === 'all' || layerOf(b) === this.pickLayer;
      const textMatch = (b.userData.label + ' ' + b.userData.sourceName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query);
      return matchReg && layerActive && pickMatch && textMatch;
    });

    const countEl = $('count');
    if (countEl) countEl.textContent = String(list.length);

    const bonesEl = $('bones');
    if (!bonesEl) return;

    if (!list.length) {
      bonesEl.textContent = 'Aucune structure dans cette sélection.';
      return;
    }

    bonesEl.replaceChildren(
      ...list.map(b => {
        const button = document.createElement('button');
        button.textContent = b.userData.label;
        button.className = (b === this.selectionManager.selected ? 'active ' : '') + 'structure-' + layerOf(b);
        button.setAttribute('aria-pressed', String(b === this.selectionManager.selected));
        button.onclick = () => this.selectBone(b);
        return button;
      })
    );
  }

  renderNotesList() {
    const countEl = $('note-count');
    if (countEl) countEl.textContent = String(this.notesManager.notes.length);

    const notesEl = $('notes');
    if (!notesEl) return;

    if (!this.notesManager.notes.length) {
      notesEl.innerHTML = `
        <div class="empty">
          <div>◎</div>
          <strong>Ta première observation</strong>
          <p>Sélectionne une structure et décris ce que tu ressens. Tes repères apparaîtront ici et sur le modèle.</p>
        </div>`;
      return;
    }

    const sortedNotes = [...this.notesManager.notes].sort((a, b) => b.date.localeCompare(a.date));

    notesEl.replaceChildren(
      ...sortedNotes.map(n => {
        const card = document.createElement('article');
        card.className = 'note';

        const top = document.createElement('header');
        const date = document.createElement('span');
        date.textContent = new Date(n.date + 'T12:00:00').toLocaleDateString('fr-FR');

        const intensity = document.createElement('span');
        intensity.className = 'severity';
        intensity.textContent = n.kind === 'Douleur ressentie' ? `${n.intensity} / 10` : n.kind;
        top.append(date, intensity);

        const name = document.createElement('h4');
        name.textContent = n.boneLabel;

        const text = document.createElement('p');
        text.textContent = n.text;

        const actions = document.createElement('div');
        actions.className = 'note-actions';

        // Bouton Voir
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'Voir';
        viewBtn.onclick = () => {
          const b = this.bones.find(x => (x.userData.anatomyId || x.name) === n.boneId);
          if (!b) {
            this.status('Structure absente de cet atlas.');
            return;
          }

          if (n.text && n.text.includes('Bilan EOS')) {
            this.scoliosis.isActive = true;
            this.scoliosis.currentCobb = 32;
            this.scoliosis.apply(32, true);
          }

          this.region = 'all';
          this.selectionManager.isolated = false;
          this.updateVisibility();
          this.renderRegions();
          this.selectBone(b, new THREE.Vector3().fromArray(n.point));

          if (n.text && n.text.includes('Bilan EOS')) {
            const tCenter = b.position.clone();
            this.viewer.controls.target.copy(tCenter);
            this.viewer.camera.position.set(tCenter.x, tCenter.y, tCenter.z - 0.72);
            this.viewer.controls.update();

            const viewsEl = $('views');
            if (viewsEl) {
              for (const c of viewsEl.children) c.classList.toggle('active', c.dataset.view === 'back');
            }
            $('model-status').textContent = 'Vue postérieure · T7 (Apex)';
            const orient = document.querySelector('.orientation');
            if (orient) {
              orient.style.visibility = 'visible';
              orient.firstElementChild.textContent = 'G';
              orient.lastElementChild.textContent = 'D';
            }
          } else {
            this.viewer.frameBox(new THREE.Box3().setFromObject(b));
          }
          this.viewer.requestRender();
        };

        // Bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifier';
        editBtn.onclick = () => {
          const b = this.bones.find(x => (x.userData.anatomyId || x.name) === n.boneId);
          if (!b) return;
          this.selectBone(b, new THREE.Vector3().fromArray(n.point));
          this.notesManager.editingId = n.id;
          $('note-kind').value = n.kind;
          $('note-kind').dispatchEvent(new Event('change'));
          $('intensity').value = String(n.intensity);
          $('intensity').dispatchEvent(new Event('input'));
          $('note-date').value = n.date;
          $('note-text').value = n.text;
          $('save-note').textContent = 'Enregistrer les modifications';
          $('note-form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        // Bouton Retirer
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Retirer';
        deleteBtn.onclick = () => {
          if (this.notesManager.deleteNote(n.id)) {
            this.notesManager.updateMarkers(this.bones);
            this.renderNotesList();
            this.viewer.requestRender();
            this.status('Repère retiré. ');

            const undo = document.createElement('button');
            undo.textContent = 'Annuler';
            undo.onclick = () => {
              if (this.notesManager.undoDelete()) {
                this.notesManager.updateMarkers(this.bones);
                this.renderNotesList();
                this.viewer.requestRender();
                this.status('Repère restauré.');
              }
            };
            $('save-status').append(undo);
          }
        };

        actions.append(viewBtn, editBtn, deleteBtn);
        card.append(top, name, text, actions);
        return card;
      })
    );
  }

  setupUI() {
    this.renderRegions();

    const searchEl = $('search');
    if (searchEl) searchEl.oninput = () => this.renderBones();

    const focusBtn = $('focus');
    if (focusBtn) {
      focusBtn.onclick = () => {
        if (this.selectionManager.selected) {
          this.viewer.frameBox(new THREE.Box3().setFromObject(this.selectionManager.selected));
        }
      };
    }

    const isolateBtn = $('isolate');
    if (isolateBtn) {
      isolateBtn.onclick = () => {
        this.selectionManager.isolated = !this.selectionManager.isolated;
        isolateBtn.textContent = this.selectionManager.isolated ? 'Tout réafficher' : 'Isoler';
        this.updateVisibility();
      };
    }

    // Orientation et cadrages
    const viewsEl = $('views');
    if (viewsEl) {
      for (const b of viewsEl.children) {
        b.onclick = () => {
          const v = b.dataset.view;
          for (const c of viewsEl.children) c.classList.toggle('active', c === b);

          if (v === 'reset') {
            this.region = 'all';
            this.selectionManager.isolated = false;
            const isoBtn = $('isolate');
            if (isoBtn) isoBtn.textContent = 'Isoler';
            this.renderRegions();
            this.renderBones();
            this.updateVisibility();
          }

          const dir = v === 'back' ? new THREE.Vector3(0, 0, -1) : v === 'side' ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(0, 0, 1);
          this.viewer.frameVisible(this.bones, dir);

          $('model-status').textContent = v === 'back' ? 'Vue postérieure' : v === 'side' ? 'Profil droit' : 'Vue antérieure';
          const orient = document.querySelector('.orientation');
          if (orient) {
            orient.style.visibility = v === 'side' ? 'hidden' : 'visible';
            orient.firstElementChild.textContent = v === 'back' ? 'G' : 'D';
            orient.lastElementChild.textContent = v === 'back' ? 'D' : 'G';
          }
        };
      }
    }

    // Zoom
    const zoomIn = $('zoom-in');
    if (zoomIn) zoomIn.onclick = () => this.viewer.zoom(0.8);
    const zoomOut = $('zoom-out');
    if (zoomOut) zoomOut.onclick = () => this.viewer.zoom(1.25);

    // Initialisation formulaire de notes
    const dateInput = $('note-date');
    if (dateInput) {
      dateInput.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    const intensityInput = $('intensity');
    if (intensityInput) {
      intensityInput.oninput = () => {
        const valEl = $('intensity-value');
        if (valEl) valEl.textContent = `${intensityInput.value} / 10`;
      };
    }

    const kindInput = $('note-kind');
    if (kindInput) {
      kindInput.onchange = () => {
        const row = $('intensity').closest('label');
        if (row) row.hidden = kindInput.value !== 'Douleur ressentie';
      };
    }

    const noteForm = $('note-form');
    if (noteForm) {
      noteForm.onsubmit = e => {
        e.preventDefault();
        const sel = this.selectionManager.selected;
        const pt = this.selectionManager.selectedPoint;
        if (!sel || !pt) return;

        const text = $('note-text').value.trim();
        const date = $('note-date').value;

        const note = {
          id: this.notesManager.editingId || crypto.randomUUID(),
          boneId: sel.userData.anatomyId || sel.name,
          boneLabel: sel.userData.label,
          point: pt.toArray(),
          kind: $('note-kind').value,
          intensity: Number($('intensity').value),
          date,
          text
        };

        if (this.notesManager.saveNote(note)) {
          $('note-text').value = '';
          $('save-note').textContent = '＋ Enregistrer le repère';
          this.notesManager.updateMarkers(this.bones);
          this.renderNotesList();
          this.viewer.requestRender();
          this.status('Repère enregistré sur cet appareil.');
        } else {
          this.status('Erreur de validation ou espace de stockage saturé.');
        }
      };
    }

    // Bouton Export
    const exportBtn = $('export');
    if (exportBtn) exportBtn.onclick = () => this.notesManager.exportJSON();

    // Bouton de chargement de l'exemple EOS (Optionnel & Respectueux de la Privacy)
    const loadEosBtn = $('load-eos-note');
    if (loadEosBtn) {
      loadEosBtn.onclick = () => {
        const t7Bone = this.bones.find(b => /vertebra_t7/i.test(b.name));
        const eosNote = getEOSClinicalNote(t7Bone);
        const existing = this.notesManager.notes.find(n => n.id === eosNote.id || (n.text && n.text.includes('Bilan EOS')));
        if (!existing) {
          this.notesManager.notes.unshift(eosNote);
          this.notesManager.persist(this.notesManager.notes);
          this.notesManager.updateMarkers(this.bones);
          this.renderNotesList();
          this.viewer.requestRender();
          this.status('Exemple EOS 2025 chargé dans ton journal.');
        } else {
          this.status('La note EOS est déjà présente dans ton journal.');
        }
      };
    }

    // Contrôles de calques
    this.initLayerControls();

    // Contrôles cinématique Scoliose
    this.scoliosis.setupUI(() => this.viewer.requestRender());
  }

  initLayerControls() {
    const anatomy = document.querySelector('.anatomy');
    const existing = document.querySelector('.layer-controls');
    if (existing) existing.remove();

    const controls = document.createElement('section');
    controls.className = 'layer-controls';
    controls.setAttribute('aria-label', 'Couches anatomiques');

    controls.innerHTML = `
      <div class="section-label">COUCHES ANATOMIQUES</div>
      ${Object.entries(this.layers).map(([id, l]) => `
        <div class="layer-row ${id}">
          <label>
            <input id="layer-${id}" type="checkbox" checked>
            <span class="layer-dot"></span>${l.title}
            <small id="layer-count-${id}">…</small>
          </label>
          <div class="layer-opacity">
            <input id="opacity-${id}" type="range" min="0" max="100" value="${Math.round(l.opacity * 100)}" aria-label="Opacité ${l.title}">
            <output id="opacity-value-${id}">${Math.round(l.opacity * 100)} %</output>
          </div>
        </div>
      `).join('')}
      <label class="pick-label">Sélectionner dans
        <select id="pick-layer">
          <option value="all">Toutes les couches visibles</option>
          <option value="skeleton">Squelette</option>
          <option value="muscles">Muscles</option>
          <option value="nerves">Nerfs</option>
        </select>
      </label>
    `;

    anatomy.insertBefore(controls, anatomy.querySelector('.section-label'));

    for (const [id, l] of Object.entries(this.layers)) {
      $('layer-' + id).onchange = e => {
        l.enabled = e.target.checked;
        if (l.enabled && l.opacity === 0) l.opacity = 0.5;
        this.updateVisibility();
        this.renderBones();
        syncLayerControls(this.layers, this.bones, this.pickLayer);
      };

      $('opacity-' + id).oninput = e => {
        l.opacity = Number(e.target.value) / 100;
        this.updateVisibility();
        syncLayerControls(this.layers, this.bones, this.pickLayer);
      };
    }

    $('pick-layer').onchange = e => {
      this.pickLayer = e.target.value;
      this.renderBones();
    };

    const presets = document.createElement('div');
    presets.className = 'layer-presets';
    presets.setAttribute('aria-label', 'Vues par système');

    const presetConfigs = [
      ['Ensemble', [1, 0.3, 1], 'all'],
      ['Squelette', [1, 0, 0], 'skeleton'],
      ['Muscles', [1, 1, 0], 'muscles'],
      ['Nerfs', [0.18, 0.06, 1], 'nerves']
    ];

    for (const [name, values, pick] of presetConfigs) {
      const b = document.createElement('button');
      b.textContent = name;
      b.onclick = () => {
        Object.values(this.layers).forEach((l, i) => {
          l.enabled = values[i] > 0;
          l.opacity = values[i];
        });
        this.pickLayer = pick;
        this.selectionManager.isolated = false;
        $('isolate').textContent = 'Isoler';
        this.updateVisibility();
        this.renderBones();
        syncLayerControls(this.layers, this.bones, this.pickLayer);
        for (const x of presets.children) x.classList.toggle('active', x === b);
      };
      presets.append(b);
    }

    document.querySelector('.viewer').append(presets);
    document.querySelector('.pill').textContent = 'ATLAS 3D';
  }

  async loadAtlas() {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    this.model = new THREE.Group();
    this.viewer.scene.add(this.model);

    const layerFiles = [
      ['skeleton', 'skeleton'],
      ['head', 'skeleton'],
      ['muscles', 'muscles'],
      ['nerves', 'nerves']
    ];

    const failures = [];

    for (const [file, layer] of layerFiles) {
      try {
        $('model-status').textContent = `Chargement : ${this.layers[layer].title.toLowerCase()}…`;

        const sourceFiles = file === 'muscles'
          ? await fetch('/models/muscles-files.json').then(r => {
              if (!r.ok) throw Error('Couche indisponible');
              return r.json();
            })
          : [file];

        const gltf = { scene: new THREE.Group() };
        for (const sourceFile of sourceFiles) {
          const part = await loader.loadAsync(`/models/${sourceFile}.glb`);
          gltf.scene.add(part.scene);
        }

        this.model.add(gltf.scene);

        gltf.scene.traverse(b => {
          if (!b.isMesh) return;
          b.userData.layer = layer;
          b.userData.restPosition = b.position.clone();
          b.userData.restQuaternion = b.quaternion.clone();

          if (layer === 'skeleton') {
            b.material = new THREE.MeshStandardMaterial({
              color: 0xd4d1bd,
              roughness: 0.68,
              metalness: 0.03,
              side: THREE.DoubleSide
            });
          } else {
            b.material = Array.isArray(b.material) ? b.material.map(m => m.clone()) : b.material.clone();
          }

          b.userData.sourceName = b.userData.sourceName || b.name;
          b.userData.label = displayLabel(b.userData.sourceName);
          this.bones.push(b);
        });

        this.bones.sort((a, b) => a.userData.label.localeCompare(b.userData.label, 'fr', { numeric: true }));

        $('loading').hidden = true;
        this.updateVisibility();
        if (file === 'head') this.viewer.frameVisible(this.bones);
        this.renderBones();
        this.renderNotesList();
        syncLayerControls(this.layers, this.bones, this.pickLayer);
      } catch (err) {
        console.error(err);
        failures.push(this.layers[layer].title);
      }
    }

    // Initialisation de l'index scoliotique O(1)
    this.scoliosis.initIndex(this.bones);
    this.scoliosis.apply(this.scoliosis.currentCobb, this.scoliosis.isActive);

    // Synchronisation des marqueurs de notes
    this.notesManager.updateMarkers(this.bones);
    this.renderNotesList();

    $('model-status').textContent = failures.length
      ? 'Couche indisponible : ' + [...new Set(failures)].join(', ') + ' · Recharger pour réessayer'
      : `${this.bones.length} structures · Atlas de référence`;

    this.viewer.requestRender();

    // Passerelle agentique sécurisée
    this.setupAgentBridge();

    // Exposition debug conditionnelle (uniquement si explicitement demandé)
    if (window.__DEBUG__) {
      window.__app = {
        viewer: this.viewer,
        scoliosis: this.scoliosis,
        notesManager: this.notesManager,
        bones: this.bones
      };
    }
  }

  setupAgentBridge() {
    if (document.modelContext?.registerTool) {
      try {
        Promise.resolve(
          document.modelContext.registerTool({
            name: 'select_anatomical_structure',
            description: 'Sélectionne une structure du squelette dans la vue 3D.',
            inputSchema: {
              type: 'object',
              properties: { structureId: { type: 'string' } },
              required: ['structureId'],
              additionalProperties: false
            },
            execute: input => {
              if (!input || typeof input.structureId !== 'string') throw Error('Identifiant requis');
              const b = this.bones.find(x => (x.userData.anatomyId || x.name) === input.structureId);
              if (!b) throw Error('Structure introuvable');
              this.region = 'all';
              this.selectionManager.isolated = false;
              this.updateVisibility();
              this.renderRegions();
              this.selectBone(b);
              return { selectedStructure: input.structureId, label: b.userData.label };
            }
          })
        ).catch(() => {});
      } catch {}
    }
  }
}

// Lancement automatique au chargement
window.addEventListener('DOMContentLoaded', () => {
  new SkeletApp();
});
