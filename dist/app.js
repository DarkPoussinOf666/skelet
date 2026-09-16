import * as e from "three";
import { GLTFLoader as t } from "./vendor/GLTFLoader.js";
import { MeshoptDecoder as n } from "./vendor/meshopt_decoder.module.js";
import { OrbitControls as r } from "./vendor/OrbitControls.js";
//#region src/core/viewer.js
var i = class {
	constructor(t) {
		this.host = t, this.isDirty = !0, this.scene = new e.Scene();
		try {
			this.renderer = new e.WebGLRenderer({
				antialias: !0,
				alpha: !0
			});
		} catch (e) {
			throw console.error("Échec d’initialisation WebGL:", e), e;
		}
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.renderer.setClearColor(0, 0), this.renderer.outputColorSpace = e.SRGBColorSpace, this.host.append(this.renderer.domElement), this.camera = new e.PerspectiveCamera(35, 1, .005, 100), this.camera.position.set(0, .88, 3.3), this.controls = new r(this.camera, this.renderer.domElement), this.controls.target.set(0, .86, 0), this.controls.enableDamping = !0, this.controls.minDistance = .08, this.controls.maxDistance = 7, this.controls.addEventListener("change", () => this.requestRender()), this.setupLights(), this.resizeObserver = new ResizeObserver(() => this.onResize()), this.resizeObserver.observe(this.host), this.onResize(), this.renderer.setAnimationLoop(() => this.renderLoop());
	}
	setupLights() {
		this.scene.add(new e.HemisphereLight(13035757, 4543306, 2));
		let t = new e.DirectionalLight(16773593, 3.1);
		t.position.set(-2, 4, 4), this.scene.add(t);
		let n = new e.DirectionalLight(11655394, 1.9);
		n.position.set(3, 2, -3), this.scene.add(n);
	}
	onResize() {
		let e = this.host.clientWidth || 1, t = this.host.clientHeight || 1;
		this.camera.aspect = e / t, this.camera.updateProjectionMatrix(), this.renderer.setSize(e, t), this.requestRender();
	}
	requestRender() {
		this.isDirty = !0;
	}
	renderLoop() {
		(this.controls.update() || this.isDirty) && (this.renderer.render(this.scene, this.camera), this.isDirty = !1);
	}
	frameBox(t, n) {
		if (t.isEmpty()) return;
		let r = t.getCenter(new e.Vector3()), i = t.getSize(new e.Vector3()), a = Math.max(i.y, i.x / this.camera.aspect) / 2 / Math.tan(e.MathUtils.degToRad(this.camera.fov / 2)) * 1.35, o = n || this.camera.position.clone().sub(this.controls.target);
		o.lengthSq() < 1e-4 && (o = new e.Vector3(0, 0, 1)), o.normalize(), this.controls.target.copy(r), this.camera.position.copy(r).addScaledVector(o, Math.max(a, .18)), this.controls.update(), this.requestRender();
	}
	frameVisible(t, n) {
		let r = new e.Box3();
		for (let e of t) e.visible && (e.updateMatrixWorld(!0), r.expandByObject(e));
		this.frameBox(r, n);
	}
	zoom(e) {
		this.camera.position.sub(this.controls.target).multiplyScalar(e).add(this.controls.target), this.controls.update(), this.requestRender();
	}
	dispose() {
		this.resizeObserver && this.resizeObserver.disconnect(), this.renderer.setAnimationLoop(null), this.controls.dispose(), this.renderer.dispose();
	}
}, a = [
	{
		name: "Sacrum",
		tiltZ: 0,
		rotY: 0
	},
	{
		name: "Vertebra_L5",
		tiltZ: -.5,
		rotY: 0
	},
	{
		name: "Vertebra_L4",
		tiltZ: -1.5,
		rotY: 0
	},
	{
		name: "Vertebra_L3",
		tiltZ: -2.5,
		rotY: 0
	},
	{
		name: "Vertebra_L2",
		tiltZ: -2,
		rotY: 0
	},
	{
		name: "Vertebra_L1",
		tiltZ: -.5,
		rotY: 0
	},
	{
		name: "Vertebra_T12",
		tiltZ: 3,
		rotY: 0
	},
	{
		name: "Vertebra_T11",
		tiltZ: 8,
		rotY: 1.5
	},
	{
		name: "Vertebra_T10",
		tiltZ: 15.5,
		rotY: 3.5
	},
	{
		name: "Vertebra_T9",
		tiltZ: 11,
		rotY: 7
	},
	{
		name: "Vertebra_T8",
		tiltZ: 3,
		rotY: 10
	},
	{
		name: "Vertebra_T7",
		tiltZ: -6,
		rotY: 9
	},
	{
		name: "Vertebra_T6",
		tiltZ: -16.5,
		rotY: 5
	},
	{
		name: "Vertebra_T5",
		tiltZ: -12,
		rotY: 2
	},
	{
		name: "Vertebra_T4",
		tiltZ: -6,
		rotY: 0
	},
	{
		name: "Vertebra_T3",
		tiltZ: -1,
		rotY: 0
	},
	{
		name: "Vertebra_T2",
		tiltZ: 2.5,
		rotY: 0
	},
	{
		name: "Vertebra_T1",
		tiltZ: 3.5,
		rotY: 0
	},
	{
		name: "Vertebra_C7",
		tiltZ: 2,
		rotY: 0
	},
	{
		name: "Vertebra_C6",
		tiltZ: 1,
		rotY: 0
	},
	{
		name: "Vertebra_C5",
		tiltZ: 0,
		rotY: 0
	},
	{
		name: "Vertebra_C4",
		tiltZ: 0,
		rotY: 0
	},
	{
		name: "Vertebra_C3",
		tiltZ: 0,
		rotY: 0
	},
	{
		name: "Axis_(C2)",
		tiltZ: 0,
		rotY: 0
	},
	{
		name: "Atlas_(C1)",
		tiltZ: 0,
		rotY: 0
	}
], o = {
	first: 1,
	second: 2,
	third: 3,
	fourth: 4,
	fifth: 5,
	sixth: 6,
	seventh: 7,
	eighth: 8,
	ninth: 9,
	tenth: 10,
	eleventh: 11,
	twelfth: 12
}, s = new e.Euler(0, 0, 0, "YXZ"), c = new e.Quaternion(), l = new e.Vector3(), u = new e.Vector3(), d = class {
	constructor() {
		this.currentCobb = 32, this.isActive = !0, this.indexedVertebrae = [], this.indexedCoupledBones = [], this.vertTransforms = /* @__PURE__ */ new Map();
		for (let t = 1; t <= 12; t++) this.vertTransforms.set(t, {
			delta: new e.Vector3(),
			quat: new e.Quaternion(),
			restPosition: new e.Vector3()
		});
	}
	initIndex(e) {
		this.indexedVertebrae = [], this.indexedCoupledBones = [];
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.name, n);
		for (let n = 0; n < a.length; n++) {
			let r = a[n], i = t.get(r.name);
			if (i || (r.name.includes("Axis") ? i = e.find((e) => /Axis/i.test(e.name)) : r.name.includes("Atlas") && (i = e.find((e) => /Atlas/i.test(e.name)))), i && i.userData.restPosition) {
				let e = n > 0 ? a[n - 1] : null, o = e && t.get(e.name) || null, s = r.name.match(/Vertebra_T(\d+)/), c = s ? Number(s[1]) : null;
				this.indexedVertebrae.push({
					item: r,
					mesh: i,
					prevMesh: o,
					tLevel: c
				});
			}
		}
		for (let t of e) {
			if (t.userData.layer !== "skeleton" || !t.userData.restPosition) continue;
			let e = t.name.toLowerCase(), n = e.match(/(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_rib/);
			if (n) {
				let e = o[n[1]];
				e && this.indexedCoupledBones.push({
					mesh: t,
					level: e
				});
				continue;
			}
			if (/sternum|xiphoid/i.test(e)) {
				let n = /manubrium/i.test(e) ? 3 : /xiphoid/i.test(e) ? 10 : 7;
				this.indexedCoupledBones.push({
					mesh: t,
					level: n
				});
			}
		}
	}
	apply(e, t) {
		typeof e == "number" && (this.currentCobb = e), typeof t == "boolean" && (this.isActive = t);
		let n = this.isActive ? Number(this.currentCobb) : 0, r = n / 32, i = 0, a = 0;
		for (let e = 0; e < this.indexedVertebrae.length; e++) {
			let { item: t, mesh: n, prevMesh: o, tLevel: u } = this.indexedVertebrae[e];
			if (e > 0 && o && o.userData.restPosition) {
				let e = n.userData.restPosition.y - o.userData.restPosition.y, s = t.tiltZ * r * (Math.PI / 180);
				i -= e * Math.sin(s), a += e * (Math.cos(s) - 1);
			}
			let d = t.tiltZ * r * (Math.PI / 180), f = t.rotY * r * (Math.PI / 180);
			if (s.set(0, f, d, "YXZ"), c.setFromEuler(s), n.quaternion.copy(c), l.set(i, a, 0), n.position.copy(n.userData.restPosition).add(l), n.updateMatrixWorld(!0), u !== null && this.vertTransforms.has(u)) {
				let e = this.vertTransforms.get(u);
				e.delta.copy(l), e.quat.copy(c), e.restPosition.copy(n.userData.restPosition);
			}
		}
		for (let e = 0; e < this.indexedCoupledBones.length; e++) {
			let { mesh: t, level: n } = this.indexedCoupledBones[e], r = this.vertTransforms.get(n);
			r && (u.copy(t.userData.restPosition).sub(r.restPosition).applyQuaternion(r.quat), t.position.copy(r.restPosition).add(r.delta).add(u), t.quaternion.copy(r.quat), t.updateMatrixWorld(!0));
		}
		this.updateUI(n);
	}
	updateUI(e) {
		if (typeof document > "u") return;
		let t = document.getElementById("scoliosis-slider"), n = document.getElementById("scoliosis-slider-val"), r = document.getElementById("scoliosis-toggle-btn"), i = document.getElementById("scoliosis-cobb-val");
		if (t && (t.value = String(e)), n && (n.textContent = e + "°"), i && (i.textContent = e + "°"), r) {
			let t = this.isActive && e > 0;
			r.setAttribute("aria-pressed", String(t)), r.textContent = t ? `Rachis EOS (${e}°)` : "Rachis neutre";
		}
		document.querySelectorAll(".preset-btn").forEach((t) => {
			let n = Number(t.getAttribute("data-angle"));
			t.classList.toggle("active", this.isActive && n === e);
		});
	}
	setupUI(e) {
		let t = document.getElementById("scoliosis-slider"), n = document.getElementById("scoliosis-toggle-btn");
		t && (t.oninput = (t) => {
			let n = Number(t.target.value);
			this.currentCobb = n, this.isActive = n > 0, this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
		}), n && (n.onclick = () => {
			this.isActive = !this.isActive, this.isActive && this.currentCobb === 0 && (this.currentCobb = 32), this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
		}), document.querySelectorAll(".preset-btn").forEach((t) => {
			t.onclick = () => {
				let n = Number(t.getAttribute("data-angle"));
				this.currentCobb = n, this.isActive = n > 0, this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
			};
		});
	}
};
//#endregion
//#region src/layers/layers.js
function f() {
	return {
		skeleton: {
			title: "Squelette",
			enabled: !0,
			opacity: 1
		},
		muscles: {
			title: "Muscles",
			enabled: !0,
			opacity: .3
		},
		nerves: {
			title: "Nerfs",
			enabled: !0,
			opacity: 1
		}
	};
}
var p = (e) => Array.isArray(e.material) ? e.material : [e.material], m = (e) => e.userData.layer || "skeleton";
function h(e, t, n) {
	if (t === "all") return !0;
	if (e.userData.regions) return e.userData.regions.includes(t);
	if (t === "head") return e.userData.region === "head";
	let r = e.userData.sourceName || e.name;
	if (t === "spine") return /vertebra|sacrum|coccyx|atlas|axis|intervertebral/i.test(r);
	if (t === "arms" && /foot/.test(r)) return !1;
	let i = n.find((e) => e[0] === t);
	return !i || i[3](r);
}
function g(t, n, { region: r, regionDefs: i, isolated: a, selected: o }, s = []) {
	for (let s of t) {
		let t = n[m(s)];
		s.visible = t.enabled && t.opacity > 0 && (a ? s === o : h(s, r, i));
		for (let n of p(s)) {
			let r = a && s === o ? 1 : t.opacity;
			n.opacity = r, n.transparent !== r < 1 && (n.needsUpdate = !0), n.transparent = r < 1, n.depthWrite = r >= .95, n.side = r < 1 ? e.FrontSide : e.DoubleSide;
		}
	}
	for (let e of s) e.userData.bone && (e.visible = e.userData.bone.visible);
}
function _(e, t, n) {
	for (let [n, r] of Object.entries(e)) {
		let e = document.getElementById("layer-" + n);
		if (!e) continue;
		e.checked = r.enabled;
		let i = document.getElementById("opacity-" + n);
		i && (i.value = String(Math.round(r.opacity * 100)));
		let a = document.getElementById("opacity-value-" + n);
		a && (a.textContent = Math.round(r.opacity * 100) + " %");
		let o = document.getElementById("layer-count-" + n);
		o && (o.textContent = String(t.filter((e) => m(e) === n).length || "…"));
	}
	let r = document.getElementById("pick-layer");
	r && (r.value = n);
}
//#endregion
//#region src/selection/selection.js
var v = new e.Raycaster(), y = new e.Vector2(), b = class {
	constructor({ camera: e, renderer: t, getBones: n, getPickLayer: r, onSelect: i }) {
		this.camera = e, this.renderer = t, this.getBones = n, this.getPickLayer = r, this.onSelect = i, this.selected = null, this.selectedPoint = null, this.isolated = !1, this.setupPointerEvents();
	}
	setupPointerEvents() {
		let e = null, t = this.renderer.domElement;
		t.addEventListener("pointerdown", (t) => {
			e = [t.clientX, t.clientY];
		}), t.addEventListener("pointerup", (n) => {
			if (!e || Math.hypot(n.clientX - e[0], n.clientY - e[1]) > 5) return;
			let r = t.getBoundingClientRect();
			y.set((n.clientX - r.left) / r.width * 2 - 1, -((n.clientY - r.top) / r.height) * 2 + 1), v.setFromCamera(y, this.camera);
			let i = this.getPickLayer(), a = this.getBones().filter((e) => e.visible && (i === "all" || m(e) === i)), o = v.intersectObjects(a, !1)[0];
			o && this.onSelect(o.object, o.point);
		});
	}
	select(t, n, r) {
		if (this.selected) for (let e of p(this.selected)) e.emissive.set(0), e.emissiveIntensity = 1;
		this.selected = t;
		let i = m(t), a = r[i];
		a && (a.enabled = !0, a.opacity === 0 && (a.opacity = .65)), this.selectedPoint = n ? n.clone() : new e.Box3().setFromObject(t).getCenter(new e.Vector3());
		for (let e of p(t)) e.emissive.set(i === "nerves" ? 11823626 : 2585936), e.emissiveIntensity = .65;
		let o = document.getElementById("selected-name");
		o && (o.textContent = t.userData.label || t.name);
		let s = document.getElementById("selected-detail");
		s && (s.textContent = `${r[i]?.title || i} · ${t.userData.sourceName || t.name}. Une douleur localisée ici peut aussi concerner les tissus voisins.`);
		for (let e of [
			"focus",
			"isolate",
			"save-note"
		]) {
			let t = document.getElementById(e);
			t && (t.disabled = !1);
		}
	}
	clear() {
		if (this.selected) for (let e of p(this.selected)) e.emissive.set(0), e.emissiveIntensity = 1;
		this.selected = null, this.selectedPoint = null;
	}
}, x = "skelet.observations.v1", S = [
	"Douleur ressentie",
	"Trouble diagnostiqué",
	"Observation personnelle"
];
function C(e) {
	return !(!e || typeof e != "object" || typeof e.id != "string" || !e.id.trim() || typeof e.boneId != "string" || !e.boneId.trim() || typeof e.boneLabel != "string" || !Array.isArray(e.point) || e.point.length !== 3 || !e.point.every(Number.isFinite) || !S.includes(e.kind) || typeof e.intensity != "number" || !Number.isInteger(e.intensity) || e.intensity < 0 || e.intensity > 10 || typeof e.date != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || typeof e.text != "string" || !e.text.trim() || e.text.length > 2e3);
}
function w(e) {
	let t = e ? e.position.toArray() : [
		-.014,
		1.284,
		-.065
	];
	return {
		id: "note-eos-scoliosis-reference-2025",
		boneId: e ? e.userData.anatomyId || e.name : "za-Vertebra_T7",
		boneLabel: "Vertèbre thoracique T7 (Apex)",
		point: t,
		kind: "Trouble diagnostiqué",
		intensity: 5,
		date: "2025-01-14",
		text: "Bilan EOS (14/01/2025) : Scoliose thoracique droite, angle de Cobb T6-T10 de 32° (22° à 32° selon les plateaux de repère T6-T7). Sommet / apex de courbure en T7-T8 avec rotation axiale des corps vertébraux (gibbosité costale droite). Cyphose thoracique T1-T12 : 45°. Lordose lombaire L1-S1 : 59°. Équilibre coronal préservé (C7-CSL : 3 mm, obliquité pelvienne : 3 mm)."
	};
}
var T = new e.SphereGeometry(.008, 12, 8), E = new e.MeshBasicMaterial({
	color: 11837951,
	depthTest: !1,
	transparent: !0,
	opacity: .9
}), D = new e.MeshBasicMaterial({
	color: 15900781,
	depthTest: !1,
	transparent: !0,
	opacity: .9
}), O = class {
	constructor() {
		this.notes = [], this.isStorageHealthy = !0, this.editingId = null, this.lastDeleted = null, this.noteMarkers = [], this.loadNotes();
	}
	loadNotes() {
		try {
			let e = localStorage.getItem(x);
			if (e) {
				let t = JSON.parse(e);
				Array.isArray(t) && (this.notes = t.filter(C));
			}
		} catch (e) {
			console.warn("Erreur lors du chargement des notes depuis localStorage:", e), this.isStorageHealthy = !1;
		}
	}
	persist(e) {
		if (!this.isStorageHealthy) return !1;
		try {
			return localStorage.setItem(x, JSON.stringify(e)), this.notes = e, !0;
		} catch (e) {
			return console.error("Erreur d’écriture dans localStorage (quota dépassé ou accès refusé):", e), !1;
		}
	}
	saveNote(e) {
		if (!C(e)) return !1;
		let t;
		return this.editingId ? (t = this.notes.map((t) => t.id === this.editingId ? e : t), this.editingId = null) : t = [e, ...this.notes], this.persist(t);
	}
	deleteNote(e) {
		let t = this.notes.find((t) => t.id === e);
		if (!t) return !1;
		let n = this.notes.filter((t) => t.id !== e);
		return this.persist(n) ? (this.lastDeleted = t, !0) : !1;
	}
	undoDelete() {
		if (!this.lastDeleted) return !1;
		let e = [...this.notes, this.lastDeleted];
		return this.persist(e) ? (this.lastDeleted = null, !0) : !1;
	}
	exportJSON() {
		let e = {
			format: "skelet-observations",
			version: 1,
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			atlas: "Z-Anatomy",
			notes: this.notes
		}, t = new Blob([JSON.stringify(e, null, 2)], { type: "application/json" }), n = URL.createObjectURL(t), r = document.createElement("a");
		r.href = n, r.download = `skelet-observations-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, r.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
	}
	updateMarkers(t) {
		for (; this.noteMarkers.length;) {
			let e = this.noteMarkers.pop();
			e.parent && e.parent.remove(e);
		}
		for (let n of this.notes) {
			let r = t.find((e) => (e.userData.anatomyId || e.name) === n.boneId);
			if (!r) continue;
			let i = n.kind === "Trouble diagnostiqué" ? E : D, a = new e.Mesh(T, i), o = new e.Vector3().fromArray(n.point), s = r.worldToLocal(o);
			a.position.copy(s), a.renderOrder = 10, a.userData.bone = r, a.visible = r.visible, r.add(a), this.noteMarkers.push(a);
		}
	}
}, k = [
	[
		"all",
		"◎",
		"Corps entier",
		() => !0
	],
	[
		"head",
		"◉",
		"Crâne et mâchoire",
		(e) => /skull|mandible|hyoid/i.test(e)
	],
	[
		"spine",
		"⌇",
		"Colonne vertébrale",
		(e) => /vertebra|sacrum|coccyx/i.test(e)
	],
	[
		"thorax",
		"⊞",
		"Thorax",
		(e) => /rib|sternum/i.test(e)
	],
	[
		"arms",
		"⌁",
		"Épaules, bras et mains",
		(e) => /clavicle|scapula|humerus|radius|ulna|carp|capitate|hamate|lunate|pisiform|scaphoid|trapez|triquetr|hand|finger/i.test(e)
	],
	[
		"pelvis",
		"◇",
		"Bassin",
		(e) => /hip.bone|sacrum|coccyx/i.test(e)
	],
	[
		"legs",
		"⋮",
		"Jambes et pieds",
		(e) => /femur|patella|tibia|fibula|tars|talus|calcane|cuneiform|cuboid|navicular|toe|foot/i.test(e)
	]
], A = {
	first: 1,
	second: 2,
	third: 3,
	fourth: 4,
	fifth: 5,
	sixth: 6,
	seventh: 7,
	eighth: 8,
	ninth: 9,
	tenth: 10,
	eleventh: 11,
	twelfth: 12
}, j = /(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib/i, M = /(first|second|third|fourth|fifth) (metacarpal|metatarsal) bone/i, N = /of (first|second|third|fourth|fifth) finger of (foot|hand)/i, P = [
	["Cervical vertebra", "Vertèbre cervicale"],
	["Thoracic vertebra", "Vertèbre thoracique"],
	["Lumbar vertebra", "Vertèbre lombaire"],
	["Hip bone", "Os coxal"],
	["Skull", "Crâne"],
	["Mandible", "Mandibule"],
	["Hyoid bone", "Os hyoïde"],
	["Clavicle", "Clavicule"],
	["Scapula", "Scapula"],
	["Humerus", "Humérus"],
	["Radius", "Radius"],
	["Ulna", "Ulna"],
	["Femur", "Fémur"],
	["Patella", "Patella (rotule)"],
	["Tibia", "Tibia"],
	["Fibula", "Fibula (péroné)"],
	["Sternum", "Sternum"],
	["Sacrum", "Sacrum"],
	["Coccyx", "Coccyx"],
	["Rib", "Côte"],
	["Calcaneus", "Calcanéus"],
	["Talus", "Talus"],
	["Metacarpal", "Métacarpien"],
	["Metatarsal", "Métatarsien"],
	["Proximal phalanx", "Phalange proximale"],
	["Middle phalanx", "Phalange moyenne"],
	["Distal phalanx", "Phalange distale"]
], F = {
	"Body of sternum": "Corps du sternum",
	"Manubrium of sternum": "Manubrium du sternum",
	"Xiphoid process": "Processus xiphoïde",
	"Capitate bone": "Os capitatum",
	"Hamate bone": "Os hamatum",
	"Lunate bone": "Os lunatum",
	"Pisiform bone": "Os pisiforme",
	"Scaphoid bone": "Os scaphoïde",
	"Trapezium bone": "Trapèze",
	"Trapezoid bone": "Trapézoïde",
	"Triquetrum bone": "Os triquétrum",
	"Cuboid bone": "Os cuboïde",
	"Navicular bone": "Os naviculaire",
	"Intermediate cuneiform bone": "Cunéiforme intermédiaire",
	"Lateral cuneiform bone": "Cunéiforme latéral",
	"Medial cuneiform bone": "Cunéiforme médial",
	"Sesamoid bones of foot": "Os sésamoïdes du pied",
	Vertebra: "Vertèbre"
}, I = {
	"sciatic nerve": "Nerf sciatique",
	"femoral nerve": "Nerf fémoral",
	"obturator nerve": "Nerf obturateur",
	"pudendal nerve": "Nerf pudendal",
	"tibial nerve": "Nerf tibial",
	"common fibular nerve": "Nerf fibulaire commun",
	"superficial fibular nerve": "Nerf fibulaire superficiel",
	"deep fibular nerve": "Nerf fibulaire profond",
	"sural nerve": "Nerf sural",
	"radial nerve": "Nerf radial",
	"median nerve": "Nerf médian",
	"ulnar nerve": "Nerf ulnaire",
	"axillary nerve": "Nerf axillaire",
	"musculocutaneous nerve": "Nerf musculocutané",
	"brachial plexus": "Plexus brachial",
	"spinal cord": "Moelle épinière",
	"spinal nerve": "Nerf spinal",
	"cauda equina": "Queue de cheval",
	"intercostal nerves": "Nerfs intercostaux",
	"trigeminal nerve": "Nerf trijumeau",
	"vagus nerve": "Nerf vague",
	"accessory nerve": "Nerf accessoire",
	"suprascapular nerve": "Nerf suprascapulaire",
	"saphenous nerve": "Nerf saphène",
	"gluteus maximus": "Grand fessier",
	"gluteus medius": "Moyen fessier",
	"gluteus minimus": "Petit fessier",
	piriformis: "Piriforme",
	"psoas major": "Grand psoas",
	iliacus: "Iliaque",
	"quadratus lumborum": "Carré des lombes",
	"latissimus dorsi": "Grand dorsal",
	trapezius: "Trapèze",
	deltoid: "Deltoïde",
	"biceps brachii": "Biceps brachial",
	"triceps brachii": "Triceps brachial",
	"pectoralis major": "Grand pectoral",
	"pectoralis minor": "Petit pectoral",
	"rectus abdominis": "Grand droit de l’abdomen",
	"rectus femoris": "Droit fémoral",
	"vastus medialis": "Vaste médial",
	"vastus lateralis": "Vaste latéral",
	"vastus intermedius": "Vaste intermédiaire",
	"biceps femoris": "Biceps fémoral",
	semitendinosus: "Semi-tendineux",
	semimembranosus: "Semi-membraneux",
	sartorius: "Sartorius",
	gastrocnemius: "Gastrocnémien",
	soleus: "Soléaire",
	sternocleidomastoid: "Sterno-cléido-mastoïdien",
	"scalenus anterior": "Scalène antérieur",
	"scalenus medius": "Scalène moyen",
	"scalenus posterior": "Scalène postérieur",
	"tibialis anterior": "Tibial antérieur",
	"tibialis posterior": "Tibial postérieur",
	multifidus: "Multifide",
	"iliotibial tract": "Tractus ilio-tibial",
	"tensor fasciae latae": "Tenseur du fascia lata",
	"parietal bone": "Os pariétal",
	"frontal bone": "Os frontal",
	"occipital bone": "Os occipital",
	"temporal bone": "Os temporal",
	"sphenoid bone": "Os sphénoïde",
	"ethmoid bone": "Os ethmoïde",
	"palatine bone": "Os palatin",
	"zygomatic bone": "Os zygomatique",
	maxilla: "Maxillaire",
	"nasal bone": "Os nasal",
	"lacrimal bone": "Os lacrymal",
	"costal cartilage of": "Cartilage costal de",
	"corniculate cartilage": "Cartilage corniculé",
	"arytenoid cartilage": "Cartilage aryténoïde",
	"thyroid cartilage": "Cartilage thyroïde",
	"cricoid cartilage": "Cartilage cricoïde"
}, L = Object.entries(F).map(([e, t]) => [new RegExp(e, "gi"), t]), R = P.map(([e, t]) => [new RegExp(e, "gi"), t]), z = Object.entries(I).map(([e, t]) => [new RegExp(e, "gi"), t]), B = [
	[/ muscle\b/gi, ""],
	[/Long head of /gi, "Chef long du "],
	[/Short head of /gi, "Chef court du "],
	[/Lateral head of /gi, "Chef latéral du "],
	[/Medial head of /gi, "Chef médial du "],
	[/Descending part of /gi, "Faisceau supérieur du "],
	[/Ascending part of /gi, "Faisceau inférieur du "],
	[/Transverse part of /gi, "Faisceau moyen du "],
	[/Roots of /gi, "Racines du "],
	[/Vome\.r/g, "Vomer"]
];
function V(e) {
	if (!e) return "";
	let t = e.replaceAll("_", " ");
	t = t.replace(j, (e, t) => "Côte " + (A[t.toLowerCase()] || t)).replace(M, (e, t, n) => (n.toLowerCase() === "metacarpal" ? "Métacarpien " : "Métatarsien ") + (A[t.toLowerCase()] || t)).replace(N, (e, t, n) => "du " + (n.toLowerCase() === "foot" ? "pied" : "doigt") + " " + (A[t.toLowerCase()] || t));
	for (let [e, n] of R) t = t.replace(e, n);
	for (let [e, n] of L) t = t.replace(e, n);
	return t.replace(/\.l$/i, " · gauche").replace(/\.r$/i, " · droit");
}
function H(e) {
	if (!e) return "";
	let t = V(e);
	for (let [e, n] of z) t = t.replace(e, n);
	for (let [e, n] of B) t = t.replace(e, n);
	return t;
}
//#endregion
//#region src/main.js
var U = (e) => document.getElementById(e), W = class {
	constructor() {
		this.region = "all", this.pickLayer = "all", this.bones = [], this.model = null, this.layers = f(), this.viewer = new i(U("canvas")), this.scoliosis = new d(), this.notesManager = new O(), this.selectionManager = new b({
			camera: this.viewer.camera,
			renderer: this.viewer.renderer,
			getBones: () => this.bones,
			getPickLayer: () => this.pickLayer,
			onSelect: (e, t) => this.selectBone(e, t)
		}), this.setupUI(), this.loadAtlas();
	}
	status(e) {
		let t = U("save-status");
		t && (t.textContent = e);
	}
	updateVisibility() {
		g(this.bones, this.layers, {
			region: this.region,
			regionDefs: k,
			isolated: this.selectionManager.isolated,
			selected: this.selectionManager.selected
		}, this.notesManager.noteMarkers), this.viewer.requestRender();
	}
	selectBone(e, t) {
		this.selectionManager.select(e, t, this.layers), this.updateVisibility(), _(this.layers, this.bones, this.pickLayer), this.renderBones(), this.viewer.requestRender();
	}
	renderRegions() {
		let e = U("regions");
		e && e.replaceChildren(...k.map(([e, t, n]) => {
			let r = document.createElement("button");
			return r.className = e === this.region ? "active" : "", r.innerHTML = `<span>${t}</span>${n}`, r.setAttribute("aria-pressed", String(e === this.region)), r.onclick = () => {
				this.region = e, this.selectionManager.isolated = !1;
				let t = U("isolate");
				t && (t.textContent = "Isoler"), this.renderRegions(), this.renderBones(), this.updateVisibility(), this.viewer.frameVisible(this.bones);
			}, r;
		}));
	}
	renderBones() {
		let e = U("search"), t = e ? e.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "", n = this.bones.filter((e) => {
			let n = this.region === "all" || e.userData.regions && e.userData.regions.includes(this.region) || this.region === "head" && e.userData.region === "head" || k.find((e) => e[0] === this.region)?.[3](e.userData.sourceName || e.name), r = this.layers[m(e)]?.enabled, i = this.pickLayer === "all" || m(e) === this.pickLayer, a = (e.userData.label + " " + e.userData.sourceName).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(t);
			return n && r && i && a;
		}), r = U("count");
		r && (r.textContent = String(n.length));
		let i = U("bones");
		if (i) {
			if (!n.length) {
				i.textContent = "Aucune structure dans cette sélection.";
				return;
			}
			i.replaceChildren(...n.map((e) => {
				let t = document.createElement("button");
				return t.textContent = e.userData.label, t.className = (e === this.selectionManager.selected ? "active " : "") + "structure-" + m(e), t.setAttribute("aria-pressed", String(e === this.selectionManager.selected)), t.onclick = () => this.selectBone(e), t;
			}));
		}
	}
	renderNotesList() {
		let t = U("note-count");
		t && (t.textContent = String(this.notesManager.notes.length));
		let n = U("notes");
		if (!n) return;
		if (!this.notesManager.notes.length) {
			n.innerHTML = "\n        <div class=\"empty\">\n          <div>◎</div>\n          <strong>Ta première observation</strong>\n          <p>Sélectionne une structure et décris ce que tu ressens. Tes repères apparaîtront ici et sur le modèle.</p>\n        </div>";
			return;
		}
		let r = [...this.notesManager.notes].sort((e, t) => t.date.localeCompare(e.date));
		n.replaceChildren(...r.map((t) => {
			let n = document.createElement("article");
			n.className = "note";
			let r = document.createElement("header"), i = document.createElement("span");
			i.textContent = (/* @__PURE__ */ new Date(t.date + "T12:00:00")).toLocaleDateString("fr-FR");
			let a = document.createElement("span");
			a.className = "severity", a.textContent = t.kind === "Douleur ressentie" ? `${t.intensity} / 10` : t.kind, r.append(i, a);
			let o = document.createElement("h4");
			o.textContent = t.boneLabel;
			let s = document.createElement("p");
			s.textContent = t.text;
			let c = document.createElement("div");
			c.className = "note-actions";
			let l = document.createElement("button");
			l.textContent = "Voir", l.onclick = () => {
				let n = this.bones.find((e) => (e.userData.anatomyId || e.name) === t.boneId);
				if (!n) {
					this.status("Structure absente de cet atlas.");
					return;
				}
				if (t.text && t.text.includes("Bilan EOS") && (this.scoliosis.isActive = !0, this.scoliosis.currentCobb = 32, this.scoliosis.apply(32, !0)), this.region = "all", this.selectionManager.isolated = !1, this.updateVisibility(), this.renderRegions(), this.selectBone(n, new e.Vector3().fromArray(t.point)), t.text && t.text.includes("Bilan EOS")) {
					let e = n.position.clone();
					this.viewer.controls.target.copy(e), this.viewer.camera.position.set(e.x, e.y, e.z - .72), this.viewer.controls.update();
					let t = U("views");
					if (t) for (let e of t.children) e.classList.toggle("active", e.dataset.view === "back");
					U("model-status").textContent = "Vue postérieure · T7 (Apex)";
					let r = document.querySelector(".orientation");
					r && (r.style.visibility = "visible", r.firstElementChild.textContent = "G", r.lastElementChild.textContent = "D");
				} else this.viewer.frameBox(new e.Box3().setFromObject(n));
				this.viewer.requestRender();
			};
			let u = document.createElement("button");
			u.textContent = "Modifier", u.onclick = () => {
				let n = this.bones.find((e) => (e.userData.anatomyId || e.name) === t.boneId);
				n && (this.selectBone(n, new e.Vector3().fromArray(t.point)), this.notesManager.editingId = t.id, U("note-kind").value = t.kind, U("note-kind").dispatchEvent(new Event("change")), U("intensity").value = String(t.intensity), U("intensity").dispatchEvent(new Event("input")), U("note-date").value = t.date, U("note-text").value = t.text, U("save-note").textContent = "Enregistrer les modifications", U("note-form").scrollIntoView({
					behavior: "smooth",
					block: "nearest"
				}));
			};
			let d = document.createElement("button");
			return d.textContent = "Retirer", d.onclick = () => {
				if (this.notesManager.deleteNote(t.id)) {
					this.notesManager.updateMarkers(this.bones), this.renderNotesList(), this.viewer.requestRender(), this.status("Repère retiré. ");
					let e = document.createElement("button");
					e.textContent = "Annuler", e.onclick = () => {
						this.notesManager.undoDelete() && (this.notesManager.updateMarkers(this.bones), this.renderNotesList(), this.viewer.requestRender(), this.status("Repère restauré."));
					}, U("save-status").append(e);
				}
			}, c.append(l, u, d), n.append(r, o, s, c), n;
		}));
	}
	setupUI() {
		this.renderRegions();
		let t = U("search");
		t && (t.oninput = () => this.renderBones());
		let n = U("focus");
		n && (n.onclick = () => {
			this.selectionManager.selected && this.viewer.frameBox(new e.Box3().setFromObject(this.selectionManager.selected));
		});
		let r = U("isolate");
		r && (r.onclick = () => {
			this.selectionManager.isolated = !this.selectionManager.isolated, r.textContent = this.selectionManager.isolated ? "Tout réafficher" : "Isoler", this.updateVisibility();
		});
		let i = U("views");
		if (i) for (let t of i.children) t.onclick = () => {
			let n = t.dataset.view;
			for (let e of i.children) e.classList.toggle("active", e === t);
			if (n === "reset") {
				this.region = "all", this.selectionManager.isolated = !1;
				let e = U("isolate");
				e && (e.textContent = "Isoler"), this.renderRegions(), this.renderBones(), this.updateVisibility();
			}
			let r = n === "back" ? new e.Vector3(0, 0, -1) : n === "side" ? new e.Vector3(-1, 0, 0) : new e.Vector3(0, 0, 1);
			this.viewer.frameVisible(this.bones, r), U("model-status").textContent = n === "back" ? "Vue postérieure" : n === "side" ? "Profil droit" : "Vue antérieure";
			let a = document.querySelector(".orientation");
			a && (a.style.visibility = n === "side" ? "hidden" : "visible", a.firstElementChild.textContent = n === "back" ? "G" : "D", a.lastElementChild.textContent = n === "back" ? "D" : "G");
		};
		let a = U("zoom-in");
		a && (a.onclick = () => this.viewer.zoom(.8));
		let o = U("zoom-out");
		o && (o.onclick = () => this.viewer.zoom(1.25));
		let s = U("note-date");
		s && (s.value = (/* @__PURE__ */ new Date(Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4)).toISOString().slice(0, 10));
		let c = U("intensity");
		c && (c.oninput = () => {
			let e = U("intensity-value");
			e && (e.textContent = `${c.value} / 10`);
		});
		let l = U("note-kind");
		l && (l.onchange = () => {
			let e = U("intensity").closest("label");
			e && (e.hidden = l.value !== "Douleur ressentie");
		});
		let u = U("note-form");
		u && (u.onsubmit = (e) => {
			e.preventDefault();
			let t = this.selectionManager.selected, n = this.selectionManager.selectedPoint;
			if (!t || !n) return;
			let r = U("note-text").value.trim(), i = U("note-date").value, a = {
				id: this.notesManager.editingId || crypto.randomUUID(),
				boneId: t.userData.anatomyId || t.name,
				boneLabel: t.userData.label,
				point: n.toArray(),
				kind: U("note-kind").value,
				intensity: Number(U("intensity").value),
				date: i,
				text: r
			};
			this.notesManager.saveNote(a) ? (U("note-text").value = "", U("save-note").textContent = "＋ Enregistrer le repère", this.notesManager.updateMarkers(this.bones), this.renderNotesList(), this.viewer.requestRender(), this.status("Repère enregistré sur cet appareil.")) : this.status("Erreur de validation ou espace de stockage saturé.");
		});
		let d = U("export");
		d && (d.onclick = () => this.notesManager.exportJSON());
		let f = U("load-eos-note");
		f && (f.onclick = () => {
			let e = w(this.bones.find((e) => /vertebra_t7/i.test(e.name)));
			this.notesManager.notes.find((t) => t.id === e.id || t.text && t.text.includes("Bilan EOS")) ? this.status("La note EOS est déjà présente dans ton journal.") : (this.notesManager.notes.unshift(e), this.notesManager.persist(this.notesManager.notes), this.notesManager.updateMarkers(this.bones), this.renderNotesList(), this.viewer.requestRender(), this.status("Exemple EOS 2025 chargé dans ton journal."));
		}), this.initLayerControls(), this.scoliosis.setupUI(() => this.viewer.requestRender());
	}
	initLayerControls() {
		let e = document.querySelector(".anatomy"), t = document.querySelector(".layer-controls");
		t && t.remove();
		let n = document.createElement("section");
		n.className = "layer-controls", n.setAttribute("aria-label", "Couches anatomiques"), n.innerHTML = `
      <div class="section-label">COUCHES ANATOMIQUES</div>
      ${Object.entries(this.layers).map(([e, t]) => `
        <div class="layer-row ${e}">
          <label>
            <input id="layer-${e}" type="checkbox" checked>
            <span class="layer-dot"></span>${t.title}
            <small id="layer-count-${e}">…</small>
          </label>
          <div class="layer-opacity">
            <input id="opacity-${e}" type="range" min="0" max="100" value="${Math.round(t.opacity * 100)}" aria-label="Opacité ${t.title}">
            <output id="opacity-value-${e}">${Math.round(t.opacity * 100)} %</output>
          </div>
        </div>
      `).join("")}
      <label class="pick-label">Sélectionner dans
        <select id="pick-layer">
          <option value="all">Toutes les couches visibles</option>
          <option value="skeleton">Squelette</option>
          <option value="muscles">Muscles</option>
          <option value="nerves">Nerfs</option>
        </select>
      </label>
    `, e.insertBefore(n, e.querySelector(".section-label"));
		for (let [e, t] of Object.entries(this.layers)) U("layer-" + e).onchange = (e) => {
			t.enabled = e.target.checked, t.enabled && t.opacity === 0 && (t.opacity = .5), this.updateVisibility(), this.renderBones(), _(this.layers, this.bones, this.pickLayer);
		}, U("opacity-" + e).oninput = (e) => {
			t.opacity = Number(e.target.value) / 100, this.updateVisibility(), _(this.layers, this.bones, this.pickLayer);
		};
		U("pick-layer").onchange = (e) => {
			this.pickLayer = e.target.value, this.renderBones();
		};
		let r = document.createElement("div");
		r.className = "layer-presets", r.setAttribute("aria-label", "Vues par système");
		for (let [e, t, n] of [
			[
				"Ensemble",
				[
					1,
					.3,
					1
				],
				"all"
			],
			[
				"Squelette",
				[
					1,
					0,
					0
				],
				"skeleton"
			],
			[
				"Muscles",
				[
					1,
					1,
					0
				],
				"muscles"
			],
			[
				"Nerfs",
				[
					.18,
					.06,
					1
				],
				"nerves"
			]
		]) {
			let i = document.createElement("button");
			i.textContent = e, i.onclick = () => {
				Object.values(this.layers).forEach((e, n) => {
					e.enabled = t[n] > 0, e.opacity = t[n];
				}), this.pickLayer = n, this.selectionManager.isolated = !1, U("isolate").textContent = "Isoler", this.updateVisibility(), this.renderBones(), _(this.layers, this.bones, this.pickLayer);
				for (let e of r.children) e.classList.toggle("active", e === i);
			}, r.append(i);
		}
		document.querySelector(".viewer").append(r), document.querySelector(".pill").textContent = "ATLAS 3D";
	}
	async loadAtlas() {
		let r = new t().setMeshoptDecoder(n);
		this.model = new e.Group(), this.viewer.scene.add(this.model);
		let i = [
			["skeleton", "skeleton"],
			["head", "skeleton"],
			["muscles", "muscles"],
			["nerves", "nerves"]
		], a = [];
		for (let [t, n] of i) try {
			U("model-status").textContent = `Chargement : ${this.layers[n].title.toLowerCase()}…`;
			let i = t === "muscles" ? await fetch("/models/muscles-files.json").then((e) => {
				if (!e.ok) throw Error("Couche indisponible");
				return e.json();
			}) : [t], a = { scene: new e.Group() };
			for (let e of i) {
				let t = await r.loadAsync(`/models/${e}.glb`);
				a.scene.add(t.scene);
			}
			this.model.add(a.scene), a.scene.traverse((t) => {
				t.isMesh && (t.userData.layer = n, t.userData.restPosition = t.position.clone(), t.userData.restQuaternion = t.quaternion.clone(), t.material = n === "skeleton" ? new e.MeshStandardMaterial({
					color: 13947325,
					roughness: .68,
					metalness: .03,
					side: e.DoubleSide
				}) : Array.isArray(t.material) ? t.material.map((e) => e.clone()) : t.material.clone(), t.userData.sourceName = t.userData.sourceName || t.name, t.userData.label = H(t.userData.sourceName), this.bones.push(t));
			}), this.bones.sort((e, t) => e.userData.label.localeCompare(t.userData.label, "fr", { numeric: !0 })), U("loading").hidden = !0, this.updateVisibility(), t === "head" && this.viewer.frameVisible(this.bones), this.renderBones(), this.renderNotesList(), _(this.layers, this.bones, this.pickLayer);
		} catch (e) {
			console.error(e), a.push(this.layers[n].title);
		}
		this.scoliosis.initIndex(this.bones), this.scoliosis.apply(this.scoliosis.currentCobb, this.scoliosis.isActive), this.notesManager.updateMarkers(this.bones), this.renderNotesList(), U("model-status").textContent = a.length ? "Couche indisponible : " + [...new Set(a)].join(", ") + " · Recharger pour réessayer" : `${this.bones.length} structures · Atlas de référence`, this.viewer.requestRender(), this.setupAgentBridge(), window.__DEBUG__ && (window.__app = {
			viewer: this.viewer,
			scoliosis: this.scoliosis,
			notesManager: this.notesManager,
			bones: this.bones
		});
	}
	setupAgentBridge() {
		if (document.modelContext?.registerTool) try {
			Promise.resolve(document.modelContext.registerTool({
				name: "select_anatomical_structure",
				description: "Sélectionne une structure du squelette dans la vue 3D.",
				inputSchema: {
					type: "object",
					properties: { structureId: { type: "string" } },
					required: ["structureId"],
					additionalProperties: !1
				},
				execute: (e) => {
					if (!e || typeof e.structureId != "string") throw Error("Identifiant requis");
					let t = this.bones.find((t) => (t.userData.anatomyId || t.name) === e.structureId);
					if (!t) throw Error("Structure introuvable");
					return this.region = "all", this.selectionManager.isolated = !1, this.updateVisibility(), this.renderRegions(), this.selectBone(t), {
						selectedStructure: e.structureId,
						label: t.userData.label
					};
				}
			})).catch(() => {});
		} catch {}
	}
};
window.addEventListener("DOMContentLoaded", () => {
	new W();
});
//#endregion
