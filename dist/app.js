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
		tiltZ: .5,
		rotY: 0
	},
	{
		name: "Vertebra_L4",
		tiltZ: 1.5,
		rotY: 0
	},
	{
		name: "Vertebra_L3",
		tiltZ: 2.5,
		rotY: 0
	},
	{
		name: "Vertebra_L2",
		tiltZ: 2,
		rotY: 0
	},
	{
		name: "Vertebra_L1",
		tiltZ: .5,
		rotY: 0
	},
	{
		name: "Vertebra_T12",
		tiltZ: -3,
		rotY: 0
	},
	{
		name: "Vertebra_T11",
		tiltZ: -8,
		rotY: -1.5
	},
	{
		name: "Vertebra_T10",
		tiltZ: -15.5,
		rotY: -3.5
	},
	{
		name: "Vertebra_T9",
		tiltZ: -11,
		rotY: -7
	},
	{
		name: "Vertebra_T8",
		tiltZ: -3,
		rotY: -10
	},
	{
		name: "Vertebra_T7",
		tiltZ: 6,
		rotY: -9
	},
	{
		name: "Vertebra_T6",
		tiltZ: 16.5,
		rotY: -5
	},
	{
		name: "Vertebra_T5",
		tiltZ: 12,
		rotY: -2
	},
	{
		name: "Vertebra_T4",
		tiltZ: 6,
		rotY: 0
	},
	{
		name: "Vertebra_T3",
		tiltZ: 1,
		rotY: 0
	},
	{
		name: "Vertebra_T2",
		tiltZ: -2.5,
		rotY: 0
	},
	{
		name: "Vertebra_T1",
		tiltZ: -3.5,
		rotY: 0
	},
	{
		name: "Vertebra_C7",
		tiltZ: -2,
		rotY: 0
	},
	{
		name: "Vertebra_C6",
		tiltZ: -1,
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
		this.currentCobb = 32, this.currentKyphosis = 45, this.isKyphosisActive = !0, this.restKyphosis = null, this.isActive = !0, this.indexedVertebrae = [], this.indexedCoupledBones = [], this.indexedHeadBones = [], this.availableThoracicLevels = /* @__PURE__ */ new Set(), this.onPoseChange = null, this.isBinding = !1, this._headDelta = new e.Matrix4(), this._headLocal = new e.Matrix4(), this.vertTransforms = /* @__PURE__ */ new Map();
		for (let t = 1; t <= 12; t++) this.vertTransforms.set(t, {
			delta: new e.Vector3(),
			quat: new e.Quaternion(),
			restPosition: new e.Vector3()
		});
	}
	initIndex(t) {
		this.indexedVertebrae = [], this.indexedCoupledBones = [], this.indexedHeadBones = [], this.availableThoracicLevels.clear(), this.restKyphosis = null;
		let n = /* @__PURE__ */ new Map();
		for (let e of t) n.set(e.name, e);
		for (let e = 0; e < a.length; e++) {
			let r = a[e], i = n.get(r.name);
			if (i || (r.name.includes("Axis") ? i = t.find((e) => /Axis/i.test(e.name)) : r.name.includes("Atlas") && (i = t.find((e) => /Atlas/i.test(e.name)))), i && i.userData.restPosition) {
				let t = e > 0 ? a[e - 1] : null, o = t && n.get(t.name) || null, s = r.name.match(/Vertebra_T(\d+)/), c = s ? Number(s[1]) : null;
				c !== null && this.availableThoracicLevels.add(c), this.indexedVertebrae.push({
					item: r,
					mesh: i,
					prevMesh: o,
					tLevel: c
				});
			}
		}
		if (this.availableThoracicLevels.size === 12) {
			let t = (e) => n.get(`Vertebra_T${e}`).userData.restPosition, r = t(11).clone().sub(t(12)), i = t(1).clone().sub(t(2));
			r.y > 0 && i.y > 0 && (this.restKyphosis = e.MathUtils.radToDeg(Math.atan2(i.z, i.y) - Math.atan2(r.z, r.y)));
		}
		let r = n.get("Vertebra_T12")?.userData.restPosition, i = n.get("Vertebra_T1")?.userData.restPosition;
		for (let e of this.indexedVertebrae) e.sagittalWeight = 0, this.restKyphosis !== null && (e.sagittalWeight = e.tLevel === null ? {
			Vertebra_C7: .3,
			Vertebra_C6: .15
		}[e.item.name] || 0 : (e.mesh.userData.restPosition.y - r.y) / (i.y - r.y) - .5);
		if (this.restKyphosis !== null) {
			let e = (e) => this.indexedVertebrae.find((t) => t.tLevel === e).sagittalWeight, t = (e(1) + e(2) - e(11) - e(12)) / 2;
			for (let e of this.indexedVertebrae) e.sagittalWeight /= t;
		}
		for (let e of t) {
			if (e.userData.layer !== "skeleton" || !e.userData.restPosition) continue;
			let t = e.name.toLowerCase(), n = t.match(/(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_rib/);
			if (n) {
				let t = o[n[1]];
				t && this.indexedCoupledBones.push({
					mesh: e,
					level: t
				});
				continue;
			}
			if (/sternum|xiphoid/i.test(t)) {
				let n = /manubrium/i.test(t) ? 3 : /xiphoid/i.test(t) ? 10 : 7;
				this.indexedCoupledBones.push({
					mesh: e,
					level: n
				});
			}
		}
		let s = this.indexedVertebrae.find((e) => /Atlas/i.test(e.item.name))?.mesh;
		if (this.headDriver = s || null, s) {
			s.updateWorldMatrix(!0, !1), this.headRestInverse = s.matrixWorld.clone().invert();
			for (let e of t) e.userData.layer === "skeleton" && e.userData.region === "head" && (e.updateWorldMatrix(!0, !1), this.indexedHeadBones.push({
				mesh: e,
				restWorld: e.matrixWorld.clone()
			}));
		}
	}
	apply(t, n, r) {
		if (Number.isFinite(t) && (this.currentCobb = Math.max(0, Math.min(35, t))), Number.isFinite(r) && (this.currentKyphosis = Math.max(0, Math.min(70, r))), typeof n == "boolean" && (this.isActive = n), this.isBinding) return;
		let i = this.isActive ? Number(this.currentCobb) : 0, a = i / 32, o = this.isActive && this.isKyphosisActive && this.restKyphosis !== null ? e.MathUtils.degToRad(this.currentKyphosis - this.restKyphosis) : 0, d = 0, f = 0, p = 0;
		for (let e = 0; e < this.indexedVertebrae.length; e++) {
			let { item: t, mesh: n, prevMesh: r, tLevel: i, sagittalWeight: m } = this.indexedVertebrae[e];
			if (e > 0 && r && r.userData.restPosition) {
				u.copy(n.userData.restPosition).sub(r.userData.restPosition);
				let i = o * (m + this.indexedVertebrae[e - 1].sagittalWeight) / 2, s = t.tiltZ * a * (Math.PI / 180), c = u.y * Math.cos(i) - u.z * Math.sin(i), l = u.y * Math.sin(i) + u.z * Math.cos(i);
				d += u.x * Math.cos(s) - c * Math.sin(s) - u.x, f += u.x * Math.sin(s) + c * Math.cos(s) - u.y, p += l - u.z;
			}
			let h = t.tiltZ * a * (Math.PI / 180), g = t.rotY * a * (Math.PI / 180);
			if (s.set(o * m, g, h, "YXZ"), c.setFromEuler(s), n.quaternion.copy(c), n.userData.restQuaternion && n.quaternion.multiply(n.userData.restQuaternion), l.set(d, f, p), n.position.copy(n.userData.restPosition).add(l), n.updateMatrixWorld(!0), i !== null && this.vertTransforms.has(i)) {
				let e = this.vertTransforms.get(i);
				e.delta.copy(l), e.quat.copy(c), e.restPosition.copy(n.userData.restPosition);
			}
		}
		for (let e = 0; e < this.indexedCoupledBones.length; e++) {
			let { mesh: t, level: n } = this.indexedCoupledBones[e], r = this.vertTransforms.get(n);
			r && this.availableThoracicLevels.has(n) && (u.copy(t.userData.restPosition).sub(r.restPosition).applyQuaternion(r.quat), t.position.copy(r.restPosition).add(r.delta).add(u), t.quaternion.copy(r.quat), t.userData.restQuaternion && t.quaternion.multiply(t.userData.restQuaternion), t.updateMatrixWorld(!0));
		}
		if (this.headDriver) {
			this.headDriver.updateWorldMatrix(!0, !1), this._headDelta.multiplyMatrices(this.headDriver.matrixWorld, this.headRestInverse);
			for (let { mesh: t, restWorld: n } of this.indexedHeadBones) t.parent && t.parent.updateWorldMatrix(!0, !1), this._headLocal.copy(t.parent?.matrixWorld || new e.Matrix4()).invert().multiply(this._headDelta).multiply(n), this._headLocal.decompose(t.position, t.quaternion, t.scale), t.updateMatrixWorld(!0);
		}
		this.onPoseChange && this.onPoseChange(), this.updateUI(i);
	}
	updateUI(e) {
		if (typeof document > "u") return;
		let t = document.getElementById("scoliosis-slider"), n = document.getElementById("scoliosis-slider-val"), r = document.getElementById("scoliosis-toggle-btn"), i = document.getElementById("scoliosis-cobb-val"), a = document.getElementById("kyphosis-slider"), o = document.getElementById("kyphosis-slider-val"), s = document.getElementById("kyphosis-angle-val"), c = document.getElementById("kyphosis-enabled"), l = this.isActive && this.isKyphosisActive && this.restKyphosis !== null;
		a && (a.value = String(this.currentKyphosis)), o && (o.textContent = `${this.currentKyphosis}°`), s && (s.textContent = l ? `${this.currentKyphosis}°` : "Atlas"), c && (c.checked = this.isKyphosisActive);
		let u = document.getElementById("kyphosis-status");
		if (u && (u.textContent = this.restKyphosis === null ? "Cyphose indisponible : chaîne T1–T12 incomplète." : l ? "Cible EOS du 14/01/2025 : 45°. Forme de profil approximative." : "Courbure de profil de l’atlas conservée."), t && (t.value = String(e)), n && (n.textContent = e + "°"), i && (i.textContent = e + "°"), r) {
			let e = this.isActive;
			r.setAttribute("aria-pressed", String(e)), r.textContent = e ? "Profil personnalisé" : "Atlas de référence";
		}
		document.querySelectorAll(".preset-btn").forEach((t) => {
			let n = Number(t.getAttribute("data-angle"));
			t.classList.toggle("active", n === 0 ? !this.isActive : this.isActive && n === e && (n !== 32 || l && this.currentKyphosis === 45));
		});
	}
	setupUI(e) {
		let t = document.getElementById("scoliosis-slider"), n = document.getElementById("scoliosis-toggle-btn");
		t && (t.oninput = (t) => {
			let n = Number(t.target.value);
			this.currentCobb = n, this.isActive = !0, this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
		}), n && (n.onclick = () => {
			this.isActive = !this.isActive, this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
		}), document.querySelectorAll(".preset-btn").forEach((t) => {
			t.onclick = () => {
				let n = Number(t.getAttribute("data-angle"));
				this.currentCobb = n, this.isActive = n > 0, n === 32 && (this.currentKyphosis = 45, this.isKyphosisActive = !0), this.apply(this.currentCobb, this.isActive), e && e(this.currentCobb);
			};
		});
		let r = document.getElementById("kyphosis-slider"), i = document.getElementById("kyphosis-enabled");
		r && (r.oninput = (t) => {
			this.isKyphosisActive = !0, this.apply(void 0, !0, Number(t.target.value)), e && e(this.currentCobb);
		}), i && (i.onchange = (t) => {
			this.isKyphosisActive = t.target.checked, this.apply(void 0, !0), e && e(this.currentCobb);
		});
	}
};
//#endregion
//#region src/biometrics/tissue-deformation.js
function f(e, t = 0) {
	if (!e.length) return null;
	let n = t % 3;
	e.sort((e, t) => e[n] - t[n]);
	let r = e.length >> 1;
	return {
		point: e[r],
		axis: n,
		left: f(e.slice(0, r), t + 1),
		right: f(e.slice(r + 1), t + 1)
	};
}
function p(e, t, n, r = 16) {
	if (!e) return;
	let i = e.point, a = (i[0] - t.x) ** 2 + (i[1] - t.y) ** 2 + (i[2] - t.z) ** 2;
	if (n.length < r || a < n[n.length - 1].distance) {
		let e = n.length;
		for (; e && n[e - 1].distance > a;) e--;
		n.splice(e, 0, {
			index: i[3],
			distance: a
		}), n.length > r && n.pop();
	}
	let o = t.getComponent(e.axis) - i[e.axis];
	p(o < 0 ? e.left : e.right, t, n, r), (n.length < r || o * o <= n[n.length - 1].distance) && p(o < 0 ? e.right : e.left, t, n, r);
}
function m(e) {
	return /intercostal/i.test(e) ? "ribs" : /root_of_spinal|spinal_ganglion|cauda_equina|multifidus|rotatores|interspinal|intertransvers/i.test(e) ? "spine" : "all";
}
function h(t) {
	let n = /* @__PURE__ */ new Map(), r = .008, i = new e.Vector3(), a = [], o = /* @__PURE__ */ new Map();
	function s(e, s, c) {
		let l = `${e},${s},${c}`;
		if (n.has(l)) return n.get(l);
		i.set(e * r, s * r, c * r), a.length = 0, o.clear(), p(t, i, a, 24);
		for (let e of a) o.has(e.index) || o.set(e.index, e.distance);
		let u = a[a.length - 1].distance + 1e-10, d = [...o].sort((e, t) => e[1] - t[1]).slice(0, 4).map(([e, t]) => [e, (1 - t / u) ** 2 / (t + .004 ** 2) ** 2]), f = d.reduce((e, [, t]) => e + t, 0);
		for (let e of d) e[1] /= f;
		return n.set(l, d), d;
	}
	return (e) => {
		let t = Math.floor(e.x / r), n = Math.floor(e.y / r), i = Math.floor(e.z / r), a = e.x / r - t, o = e.y / r - n, c = e.z / r - i, l = /* @__PURE__ */ new Map();
		for (let e = 0; e < 2; e++) for (let r = 0; r < 2; r++) for (let u = 0; u < 2; u++) {
			let d = (e ? a : 1 - a) * (r ? o : 1 - o) * (u ? c : 1 - c);
			if (d !== 0) for (let [a, o] of s(t + e, n + r, i + u)) l.set(a, (l.get(a) || 0) + d * o);
		}
		let u = [...l].sort((e, t) => t[1] - e[1]).slice(0, 4), d = u.reduce((e, [, t]) => e + t, 0);
		for (let e of u) e[1] /= d;
		return u;
	};
}
var g = class {
	constructor() {
		this.records = [], this.controls = [], this.replacements = /* @__PURE__ */ new Map(), this.stats = {
			meshes: 0,
			vertices: 0
		}, this._matrix = new e.Matrix4(), this._box = new e.Box3(), this._inverse = new e.Matrix4();
	}
	async init(t, n, r, i = () => new Promise((e) => setTimeout(e, 0))) {
		t.updateMatrixWorld(!0);
		let a = /* @__PURE__ */ new Set([
			...r.indexedVertebrae.filter((e) => e.item.name !== "Sacrum").map((e) => e.mesh),
			...r.indexedCoupledBones.map((e) => e.mesh),
			...r.indexedHeadBones.map((e) => e.mesh)
		]);
		if (r.indexedVertebrae.length < 2) return;
		let o = {
			all: [],
			spine: [],
			ribs: []
		}, s = new e.Vector3();
		for (let t of n) {
			if (t.userData.layer !== "skeleton" || !t.geometry.attributes.position) continue;
			let n = this.controls.length, r = new e.Bone();
			r.matrixAutoUpdate = !1, r.matrixWorld.copy(t.matrixWorld), this.controls.push({
				mesh: t,
				bone: r,
				moving: a.has(t),
				restInverse: t.matrixWorld.clone().invert()
			});
			let i = /vertebra|sacrum|coccyx|atlas|axis/i.test(t.name), c = i || /rib|sternum|xiphoid/i.test(t.name), l = t.geometry.attributes.position, u = /* @__PURE__ */ new Set(), d = Math.max(1, Math.floor(l.count / 700));
			for (let e = 0; e < l.count; e += d) {
				s.fromBufferAttribute(l, e).applyMatrix4(t.matrixWorld);
				let r = `${Math.round(s.x / .002)},${Math.round(s.y / .002)},${Math.round(s.z / .002)}`;
				if (u.has(r)) continue;
				u.add(r);
				let a = [
					s.x,
					s.y,
					s.z,
					n
				];
				o.all.push(a), i && o.spine.push(a), c && o.ribs.push(a);
			}
		}
		if (!o.all.length) return;
		let c = Object.fromEntries(Object.entries(o).map(([e, t]) => [e, f(t)])), l = Object.fromEntries(Object.entries(c).filter(([, e]) => e).map(([e, t]) => [e, h(t)]));
		this.skeleton = new e.Skeleton(this.controls.map((e) => e.bone), this.controls.map((e) => e.restInverse.clone()));
		for (let t = 0; t < n.length; t++) {
			let r = n[t];
			if (!["muscles", "nerves"].includes(r.userData.layer)) continue;
			let a = r.geometry.attributes.position, o = new Uint16Array(a.count * 4), c = new Float32Array(a.count * 4), u = /* @__PURE__ */ new Map(), d = l[m(r.name)] || l.all, f = !1;
			for (let t = 0; t < a.count; t++) {
				s.fromBufferAttribute(a, t).applyMatrix4(r.matrixWorld);
				let n = d(s);
				for (let r = 0; r < n.length; r++) {
					let i = n[r][0];
					o[t * 4 + r] = i, c[t * 4 + r] = n[r][1], f ||= this.controls[i].moving && n[r][1] > 0, u.has(i) || u.set(i, new e.Box3()), u.get(i).expandByPoint(s);
				}
				t && t % 16e3 == 0 && await i();
			}
			if (f) {
				let i = new e.BufferGeometry();
				for (let [e, t] of Object.entries(r.geometry.attributes)) i.setAttribute(e, t);
				i.setIndex(r.geometry.index), i.groups = r.geometry.groups.map((e) => ({ ...e })), i.setDrawRange(r.geometry.drawRange.start, r.geometry.drawRange.count), i.setAttribute("skinIndex", new e.Uint16BufferAttribute(o, 4)), i.setAttribute("skinWeight", new e.Float32BufferAttribute(c, 4));
				let s = new e.SkinnedMesh(i, r.material);
				e.Mesh.prototype.copy.call(s, r, !1), s.geometry = i, s.userData = r.userData, s.bind(this.skeleton, r.matrixWorld), s.boundingBox = new e.Box3(), s.boundingSphere = new e.Sphere();
				let l = r.parent;
				if (l) {
					let e = l.children.indexOf(r);
					l.remove(r), l.add(s), l.children.splice(l.children.indexOf(s), 1), l.children.splice(e, 0, s);
				}
				for (let e of [...r.children]) s.add(e);
				n[t] = s, this.replacements.set(r, s), this.records.push({
					mesh: s,
					boxes: u
				}), this.stats.meshes++, this.stats.vertices += a.count;
			}
			t % 8 == 0 && await i();
		}
		this.update();
	}
	update() {
		if (this.skeleton) {
			for (let e of this.controls) e.mesh.updateWorldMatrix(!0, !1), e.bone.matrixWorld.copy(e.mesh.matrixWorld);
			this.skeleton.update();
			for (let { mesh: e, boxes: t } of this.records) {
				e.updateWorldMatrix(!0, !1), e.bindMatrixInverse.copy(e.matrixWorld).invert(), this._inverse.copy(e.matrixWorld).invert(), e.boundingBox.makeEmpty();
				for (let [n, r] of t) {
					let t = this.controls[n];
					this._matrix.multiplyMatrices(t.bone.matrixWorld, t.restInverse).premultiply(this._inverse), this._box.copy(r).applyMatrix4(this._matrix), e.boundingBox.union(this._box);
				}
				e.boundingBox.expandByScalar(2e-6 * this._inverse.getMaxScaleOnAxis()), e.boundingBox.getBoundingSphere(e.boundingSphere);
			}
		}
	}
}, _ = new e.Vector3(), v = new e.Vector3(), y = new e.Vector3(), b = new e.Vector3(), x = new e.Vector3();
function S(e) {
	return `za-v1:${e.geometry.attributes.position.count}:${e.geometry.index?.count || 0}`;
}
function C(e) {
	return e?.type === "surface" && typeof e.topology == "string" && Array.isArray(e.vertices) && e.vertices.length === 3 && e.vertices.every((e) => Number.isInteger(e) && e >= 0) && Array.isArray(e.weights) && e.weights.length === 3 && e.weights.every((e) => Number.isFinite(e) && e >= 0 && e <= 1) && Math.abs(e.weights.reduce((e, t) => e + t, 0) - 1) < 1e-6;
}
function w(t, n, r) {
	if (!t.geometry?.attributes.position) return null;
	if (t.updateWorldMatrix(!0, !1), b.copy(n), t.worldToLocal(b), r && (t.getVertexPosition(r.a, _), t.getVertexPosition(r.b, v), t.getVertexPosition(r.c, y), e.Triangle.getBarycoord(b, _, v, y, x))) return x.set(Math.max(0, x.x), Math.max(0, x.y), Math.max(0, x.z)), x.multiplyScalar(1 / (x.x + x.y + x.z)), {
		type: "surface",
		topology: S(t),
		vertices: [
			r.a,
			r.b,
			r.c
		],
		weights: x.toArray()
	};
	let i = 0, a = Infinity;
	for (let e = 0; e < t.geometry.attributes.position.count; e++) {
		t.getVertexPosition(e, _);
		let n = _.distanceToSquared(b);
		n < a && (a = n, i = e);
	}
	return {
		type: "surface",
		topology: S(t),
		vertices: [
			i,
			i,
			i
		],
		weights: [
			1,
			0,
			0
		]
	};
}
function T(t, n, r = new e.Vector3()) {
	if (!C(n) || n.topology !== S(t) || n.vertices.some((e) => e >= t.geometry.attributes.position.count)) return null;
	r.set(0, 0, 0);
	for (let e = 0; e < 3; e++) n.weights[e] && r.addScaledVector(t.getVertexPosition(n.vertices[e], _), n.weights[e]);
	return t.localToWorld(r);
}
//#endregion
//#region src/layers/muscle-depth.js
var E = {
	superficial: {
		title: "Superficiels",
		description: "Muscles de surface"
	},
	intermediate: {
		title: "Intermédiaires",
		description: "Plan musculaire intermédiaire"
	},
	deep: {
		title: "Profonds",
		description: "Plan musculaire profond"
	}
}, ee = [
	["deep", /deep (part|head)|innermost intercostal|transversus (abdominis|thoracis)|multifidus|rotatores|interspinal|intertransvers|semispinalis|iliocostalis|longissimus|spinalis|splenius|rectus (posterior|anterior|lateralis) capitis|rectus posterior (major|minor) capitis|obliquus (superior|inferior) capitis|longus (colli|capitis)|scalenus|quadratus lumborum|psoas|iliacus|diaphragm/],
	["deep", /gluteus minimus|gemellus|obturator|quadratus femoris|piriformis|adductor (magnus|minimus)|vastus intermedius|popliteus|tibialis posterior|flexor (digitorum|hallucis) longus|plantar interosse|dorsal interosse|adductor hallucis|opponens|palmar interosse|adductor pollicis|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|extensor (pollicis|indicis)|abductor pollicis longus|supinator|subscapularis|subclavius|medial head of triceps/],
	["deep", /pterygoid|genioglossus|hyoglossus|palatopharyngeus|pharyngeal constrictor|stylopharyngeus|geniohyoid|thyrohyoid|sternothyroid|arytenoid|ary-epiglottic|thyro-arytenoid|crico-arytenoid|cricothyroid|trochlea|tarsus|tendinous ring|levator palpebrae|(superior|inferior|medial|lateral) (rectus|oblique) muscle|pubo-analis|pubococcygeus|iliococcygeus|coccygeus|levator ani|levatores (breves|longi) costarum/],
	["intermediate", /gluteus medius|adductor brevis|pectineus|short head of biceps femoris|semimembranosus|soleus|plantaris|fibularis brevis|extensor hallucis longus|quadratus plantae|lumbrical|flexor hallucis brevis|flexor digiti minimi of foot|extensor (hallucis|digitorum) brevis|rhomboid|levator scapulae|serratus posterior|brachialis|coracobrachialis|flexor digitorum superficialis|supraspinatus|infraspinatus|teres (major|minor)|pectoralis minor|serratus anterior|internal intercostal|internal abdominal oblique|pyramidalis/],
	["intermediate", /temporalis|bucinator|buccinator|levator anguli oris|corrugator|stylohyoid|mylohyoid|digastric|sternohyoid|omohyoid/],
	["superficial", /gluteus maximus|tensor fasciae latae|iliotibial|fibularis (tertius|longus)|extensor digitorum longus|tibialis anterior|flexor digitorum brevis|abductor (digiti minimi|hallucis)|adductor longus|gracilis|semitendinosus|long head of biceps femoris|gastrocnemius|calcaneal tendon|vastus (medialis|lateralis)|sartorius|rectus femoris|epicranial|frontalis|occipitalis|temporoparietalis|orbicularis|procerus|zygomaticus|nasalis|levator labii|depressor|risorius|levator nasolabialis|mentalis|superficial part of masseter|external anal sphincter/],
	["superficial", /latissimus dorsi|trapezius|biceps brachii|flexor carpi|superficial head of pronator|palmaris longus|anconeus|extensor carpi|extensor digiti minimi|brachioradialis|extensor digitorum|deltoid|superficial head of flexor pollicis brevis|flexor digiti minimi of hand|abductor pollicis brevis|(lateral|long) head of triceps|external intercostal|pectoralis major|sternocleidomastoid|platysma|external abdominal oblique|rectus abdominis/]
];
function D(e = "") {
	let t = e.toLowerCase().replaceAll("_", " ");
	return ee.find(([, e]) => e.test(t))?.[0] || null;
}
function O(e) {
	return e.userData.muscleDepth || D(e.userData.sourceName || e.name);
}
//#endregion
//#region src/layers/layers.js
function k() {
	return {
		skeleton: {
			title: "Squelette",
			enabled: !0,
			opacity: 1
		},
		muscles: {
			title: "Muscles",
			enabled: !0,
			opacity: .3,
			sublayers: {
				superficial: {
					title: "Superficiels (surface)",
					enabled: !0,
					opacity: .3
				},
				intermediate: {
					title: "Intermédiaires",
					enabled: !0,
					opacity: .3
				},
				deep: {
					title: "Profonds",
					enabled: !0,
					opacity: .3
				}
			}
		},
		nerves: {
			title: "Nerfs",
			enabled: !0,
			opacity: 1
		}
	};
}
var A = (e) => Array.isArray(e.material) ? e.material : [e.material], j = (e) => e.userData.layer || "skeleton";
function M(e, t) {
	let n = j(e), r = t[n];
	if (!r || !r.enabled) return !1;
	if (n === "muscles" && r.sublayers) {
		let t = O(e);
		if (t && r.sublayers[t] && !r.sublayers[t].enabled) return !1;
	}
	return !0;
}
function N(e, t) {
	let n = j(e), r = t[n];
	if (!r) return 1;
	if (n === "muscles" && r.sublayers) {
		let t = O(e);
		if (t && r.sublayers[t] && typeof r.sublayers[t].opacity == "number") return r.sublayers[t].opacity;
	}
	return r.opacity ?? 1;
}
function P(e, t) {
	if (!t || t === "all") return !0;
	let n = j(e);
	if (t === n) return !0;
	if (n === "muscles") {
		if (t === "muscles_superficial") return O(e) === "superficial";
		if (t === "muscles_intermediate") return O(e) === "intermediate";
		if (t === "muscles_deep") return O(e) === "deep";
	}
	return !1;
}
function te(e, t, n) {
	if (t === "all") return !0;
	if (e.userData.regions) return e.userData.regions.includes(t);
	if (t === "head") return e.userData.region === "head";
	let r = e.userData.sourceName || e.name;
	if (t === "spine") return /vertebra|sacrum|coccyx|atlas|axis|intervertebral/i.test(r);
	if (t === "arms" && /foot/.test(r)) return !1;
	let i = n.find((e) => e[0] === t);
	return !i || i[3](r);
}
function F(t, n, { region: r, regionDefs: i, isolated: a, selected: o }, s = []) {
	for (let s of t) {
		let t = M(s, n), c = N(s, n);
		s.visible = t && c > 0 && (a ? s === o : te(s, r, i));
		for (let t of A(s)) {
			let n = a && s === o ? 1 : c;
			t.opacity = n, t.transparent !== n < 1 && (t.needsUpdate = !0), t.transparent = n < 1, t.depthWrite = n >= .95, t.side = n < 1 ? e.FrontSide : e.DoubleSide;
		}
	}
	for (let e of s) e.userData.bone && (e.visible = e.userData.bone.visible);
}
function I(e, t, n) {
	for (let [n, r] of Object.entries(e)) {
		let e = document.getElementById("layer-" + n);
		if (!e) continue;
		e.checked = r.enabled;
		let i = document.getElementById("opacity-" + n);
		i && (i.value = String(Math.round(r.opacity * 100)));
		let a = document.getElementById("opacity-value-" + n);
		a && (a.textContent = Math.round(r.opacity * 100) + " %");
		let o = document.getElementById("layer-count-" + n);
		if (o && (o.textContent = String(t.filter((e) => j(e) === n).length || "…")), n === "muscles" && r.sublayers) for (let [e, n] of Object.entries(r.sublayers)) {
			let i = document.getElementById("sublayer-muscles-" + e);
			i && (i.checked = r.enabled && n.enabled);
			let a = document.getElementById("sublayer-opacity-" + e);
			a && (a.value = String(Math.round(n.opacity * 100)));
			let o = document.getElementById("sublayer-opacity-val-" + e);
			o && (o.textContent = Math.round(n.opacity * 100) + " %");
			let s = document.getElementById("sublayer-count-" + e);
			s && (s.textContent = String(t.filter((t) => j(t) === "muscles" && O(t) === e).length || "…"));
		}
	}
	let r = document.getElementById("pick-layer");
	r && (r.value = n);
}
//#endregion
//#region src/selection/selection.js
var L = new e.Raycaster(), R = new e.Vector2(), ne = class {
	constructor({ camera: e, renderer: t, getBones: n, getPickLayer: r, onSelect: i, isPainZone: a = () => !1 }) {
		this.camera = e, this.renderer = t, this.getBones = n, this.getPickLayer = r, this.onSelect = i, this.isPainZone = a, this.originalEmissive = /* @__PURE__ */ new WeakMap(), this.selected = null, this.selectedPoint = null, this.selectedAnchor = null, this.isolated = !1, this.setupPointerEvents();
	}
	setupPointerEvents() {
		let e = null, t = this.renderer.domElement;
		t.addEventListener("pointerdown", (t) => {
			e = t.isPrimary !== !1 && t.button === 0 ? [
				t.clientX,
				t.clientY,
				t.pointerId
			] : null;
		}), t.addEventListener("pointercancel", () => {
			e = null;
		}), t.addEventListener("pointerup", (n) => {
			let r = e;
			if (e = null, !r || n.pointerId !== r[2] || Math.hypot(n.clientX - r[0], n.clientY - r[1]) > 5) return;
			let i = t.getBoundingClientRect();
			R.set((n.clientX - i.left) / i.width * 2 - 1, -((n.clientY - i.top) / i.height) * 2 + 1), L.setFromCamera(R, this.camera);
			let a = this.getPickLayer(), o = this.getBones().filter((e) => e.visible && P(e, a)), s = L.intersectObjects(o, !1)[0];
			s && this.onSelect(s.object, s.point, s.face);
		});
	}
	select(t, n, r, i) {
		let a = this.selected;
		this.selected = t, a && this.updateHighlight(a);
		let o = j(t), s = r[o];
		if (s && (s.enabled = !0, s.opacity === 0 && (s.opacity = .65), o === "muscles" && s.sublayers)) {
			let e = O(t);
			e && s.sublayers[e] && (s.sublayers[e].enabled = !0, s.sublayers[e].opacity === 0 && (s.sublayers[e].opacity = .65));
		}
		this.selectedPoint = n ? n.clone() : new e.Box3().setFromObject(t).getCenter(new e.Vector3()), this.selectedAnchor = w(t, this.selectedPoint, i), this.updatePoint(), this.updateHighlight(t);
		let c = document.getElementById("selected-name");
		c && (c.textContent = t.userData.label || t.name);
		let l = document.getElementById("selected-detail");
		if (l) {
			let e = r[o]?.title || o, n = o === "muscles" ? O(t) : null;
			l.textContent = `${e}${n && E[n] ? ` (${E[n].title.toLowerCase()})` : ""} · ${t.userData.sourceName || t.name}. Une douleur localisée ici peut aussi concerner les tissus voisins.`;
		}
		for (let e of [
			"focus",
			"isolate",
			"save-note"
		]) {
			let t = document.getElementById(e);
			t && (t.disabled = !1);
		}
	}
	updatePoint() {
		this.selected && this.selectedAnchor && T(this.selected, this.selectedAnchor, this.selectedPoint);
	}
	updateHighlight(e) {
		for (let t of A(e)) {
			if (!t.emissive) continue;
			this.originalEmissive.has(t) || this.originalEmissive.set(t, {
				color: t.emissive.clone(),
				intensity: t.emissiveIntensity
			});
			let n = this.originalEmissive.get(t);
			this.isPainZone(e) ? (t.emissive.set(16726315), t.emissiveIntensity = .85) : e === this.selected ? (t.emissive.set(j(e) === "nerves" ? 11823626 : 2585936), t.emissiveIntensity = .65) : (t.emissive.copy(n.color), t.emissiveIntensity = n.intensity);
		}
	}
	clear() {
		let e = this.selected;
		this.selected = null, this.selectedPoint = null, this.selectedAnchor = null, e && this.updateHighlight(e);
	}
}, z = "skelet.pain-zones.v1", B = (e) => e.userData.anatomyId || e.name, V = class {
	constructor() {
		this.ids = /* @__PURE__ */ new Set(), this.storageAvailable = !0;
		try {
			let e = JSON.parse(localStorage.getItem("skelet.pain-zones.v1") || "[]");
			Array.isArray(e) && (this.ids = new Set(e.filter((e) => typeof e == "string" && e)));
		} catch {
			this.storageAvailable = !1;
		}
	}
	has(e) {
		return this.ids.has(B(e));
	}
	toggle(e) {
		let t = B(e);
		this.ids.has(t) ? this.ids.delete(t) : this.ids.add(t), this.persist();
	}
	remove(e) {
		this.ids.delete(e), this.persist();
	}
	clear() {
		this.ids.clear(), this.persist();
	}
	persist() {
		try {
			localStorage.setItem(z, JSON.stringify([...this.ids])), this.storageAvailable = !0;
		} catch {
			this.storageAvailable = !1;
		}
	}
}, H = "skelet.observations.v1", U = [
	"Douleur ressentie",
	"Trouble diagnostiqué",
	"Observation personnelle"
];
function W(e) {
	return !(!e || typeof e != "object" || typeof e.id != "string" || !e.id.trim() || typeof e.boneId != "string" || !e.boneId.trim() || typeof e.boneLabel != "string" || !Array.isArray(e.point) || e.point.length !== 3 || !e.point.every(Number.isFinite) || e.anchor != null && !C(e.anchor) || !U.includes(e.kind) || typeof e.intensity != "number" || !Number.isInteger(e.intensity) || e.intensity < 0 || e.intensity > 10 || typeof e.date != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || typeof e.text != "string" || !e.text.trim() || e.text.length > 2e3);
}
function G(e) {
	let t = e ? e.position.toArray() : [
		.014,
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
		text: "Bilan EOS (14/01/2025) : Scoliose thoracique à convexité gauche, angle de Cobb T6-T10 de 32° (22° à 32° selon les plateaux de repère T6-T7). Sommet / apex de courbure en T7-T8 avec rotation axiale des corps vertébraux (gibbosité costale gauche). Cyphose thoracique T1-T12 : 45°. Lordose lombaire L1-S1 : 59°. Équilibre coronal préservé (C7-CSL : 3 mm, obliquité pelvienne : 3 mm)."
	};
}
var K = new e.SphereGeometry(.008, 12, 8), q = new e.MeshBasicMaterial({
	color: 11837951,
	depthTest: !1,
	transparent: !0,
	opacity: .9
}), J = new e.MeshBasicMaterial({
	color: 15900781,
	depthTest: !1,
	transparent: !0,
	opacity: .9
}), Y = class {
	constructor() {
		this.notes = [], this.isStorageHealthy = !0, this.editingId = null, this.lastDeleted = null, this.noteMarkers = [], this.loadNotes();
	}
	loadNotes() {
		try {
			let e = localStorage.getItem(H);
			if (e) {
				let t = JSON.parse(e);
				Array.isArray(t) && (this.notes = t.filter(W));
			}
		} catch (e) {
			console.warn("Erreur lors du chargement des notes depuis localStorage:", e), this.isStorageHealthy = !1;
		}
	}
	persist(e) {
		if (!this.isStorageHealthy) return !1;
		try {
			return localStorage.setItem(H, JSON.stringify(e)), this.notes = e, !0;
		} catch (e) {
			return console.error("Erreur d’écriture dans localStorage (quota dépassé ou accès refusé):", e), !1;
		}
	}
	saveNote(e) {
		if (!W(e)) return !1;
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
			let i = n.kind === "Trouble diagnostiqué" ? q : J, a = new e.Mesh(K, i), o = n.anchor && T(r, n.anchor) || new e.Vector3().fromArray(n.point), s = r.worldToLocal(o);
			a.position.copy(s), a.renderOrder = 10, a.userData.bone = r, a.userData.anchor = n.anchor, a.visible = r.visible, r.add(a), this.noteMarkers.push(a);
		}
		this.updateMarkerPositions();
	}
	updateMarkerPositions() {
		let t = new e.Vector3(), n = new e.Vector3();
		for (let e of this.noteMarkers) {
			let r = e.userData.bone;
			e.userData.anchor && T(r, e.userData.anchor, t) && e.position.copy(r.worldToLocal(t)), r.getWorldScale(n), e.scale.set(1 / Math.abs(n.x || 1), 1 / Math.abs(n.y || 1), 1 / Math.abs(n.z || 1)), e.updateMatrixWorld(!0);
		}
	}
}, X = [
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
], Z = {
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
}, re = /(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib/i, ie = /(first|second|third|fourth|fifth) (metacarpal|metatarsal) bone/i, ae = /of (first|second|third|fourth|fifth) finger of (foot|hand)/i, oe = [
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
], se = {
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
}, ce = {
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
}, le = Object.entries(se).map(([e, t]) => [new RegExp(e, "gi"), t]), ue = oe.map(([e, t]) => [new RegExp(e, "gi"), t]), Q = Object.entries(ce).map(([e, t]) => [new RegExp(e, "gi"), t]), de = [
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
function fe(e) {
	if (!e) return "";
	let t = e.replaceAll("_", " ");
	t = t.replace(re, (e, t) => "Côte " + (Z[t.toLowerCase()] || t)).replace(ie, (e, t, n) => (n.toLowerCase() === "metacarpal" ? "Métacarpien " : "Métatarsien ") + (Z[t.toLowerCase()] || t)).replace(ae, (e, t, n) => "du " + (n.toLowerCase() === "foot" ? "pied" : "doigt") + " " + (Z[t.toLowerCase()] || t));
	for (let [e, n] of ue) t = t.replace(e, n);
	for (let [e, n] of le) t = t.replace(e, n);
	return t.replace(/\.l$/i, " · gauche").replace(/\.r$/i, " · droit");
}
function pe(e) {
	if (!e) return "";
	let t = fe(e);
	for (let [e, n] of Q) t = t.replace(e, n);
	for (let [e, n] of de) t = t.replace(e, n);
	return t;
}
//#endregion
//#region src/main.js
var $ = (e) => document.getElementById(e), me = class {
	constructor() {
		this.region = "all", this.pickLayer = "all", this.bones = [], this.model = null, this.painZones = new V(), this.painMode = !1, this.layers = k(), this.viewer = new i($("canvas")), this.scoliosis = new d(), this.tissues = new g(), this.notesManager = new Y(), this.selectionManager = new ne({
			camera: this.viewer.camera,
			renderer: this.viewer.renderer,
			getBones: () => this.bones,
			getPickLayer: () => this.pickLayer,
			onSelect: (e, t, n) => this.pickBone(e, t, n),
			isPainZone: (e) => this.painZones.has(e)
		}), this.scoliosis.onPoseChange = () => {
			this.tissues.update(), this.selectionManager.updatePoint(), this.notesManager.updateMarkerPositions(), this.viewer.requestRender();
		}, this.setupUI(), this.loadAtlas();
	}
	status(e) {
		let t = $("save-status");
		t && (t.textContent = e);
	}
	updateVisibility() {
		F(this.bones, this.layers, {
			region: this.region,
			regionDefs: X,
			isolated: this.selectionManager.isolated,
			selected: this.selectionManager.selected
		}, this.notesManager.noteMarkers), this.viewer.requestRender();
	}
	selectBone(e, t, n) {
		this.selectionManager.select(e, t, this.layers, n), this.updateVisibility(), I(this.layers, this.bones, this.pickLayer), this.renderBones(), this.viewer.requestRender();
	}
	pickBone(e, t, n) {
		this.painMode && this.painZones.toggle(e), this.selectBone(e, t, n), this.renderPainZones();
	}
	refreshPainZones() {
		for (let e of this.bones) this.selectionManager.updateHighlight(e);
		this.renderPainZones(), this.renderBones(), this.viewer.requestRender();
	}
	renderPainZones() {
		let e = this.painZones.ids.size;
		$("pain-count").textContent = `${e} zone${e === 1 ? "" : "s"}`, $("clear-pain").disabled = e === 0, $("pain-storage").textContent = this.painZones.storageAvailable ? "Zones conservées dans ce navigateur, séparément du journal." : "Sauvegarde indisponible : les changements restent dans cette session uniquement.";
		let t = new Map(this.bones.map((e) => [B(e), e]));
		$("pain-zones").replaceChildren(...[...this.painZones.ids].map((e) => {
			let n = t.get(e)?.userData.label || e, r = document.createElement("button");
			return r.type = "button", r.textContent = `${n} ×`, r.setAttribute("aria-label", `Retirer ${n} des zones douloureuses`), r.onclick = () => {
				this.painZones.remove(e), this.refreshPainZones();
			}, r;
		}));
	}
	renderRegions() {
		let e = $("regions");
		e && e.replaceChildren(...X.map(([e, t, n]) => {
			let r = document.createElement("button");
			return r.className = e === this.region ? "active" : "", r.innerHTML = `<span>${t}</span>${n}`, r.setAttribute("aria-pressed", String(e === this.region)), r.onclick = () => {
				this.region = e, this.selectionManager.isolated = !1;
				let t = $("isolate");
				t && (t.textContent = "Isoler"), this.renderRegions(), this.renderBones(), this.updateVisibility(), this.viewer.frameVisible(this.bones);
			}, r;
		}));
	}
	renderBones() {
		let e = $("search"), t = e ? e.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "", n = this.bones.filter((e) => {
			let n = this.region === "all" || e.userData.regions && e.userData.regions.includes(this.region) || this.region === "head" && e.userData.region === "head" || X.find((e) => e[0] === this.region)?.[3](e.userData.sourceName || e.name), r = M(e, this.layers), i = P(e, this.pickLayer), a = (e.userData.label + " " + e.userData.sourceName).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(t);
			return n && r && i && a;
		}), r = $("count");
		r && (r.textContent = String(n.length));
		let i = $("bones");
		if (i) {
			if (!n.length) {
				i.textContent = "Aucune structure dans cette sélection.";
				return;
			}
			i.replaceChildren(...n.map((e) => {
				let t = document.createElement("button");
				t.textContent = e.userData.label;
				let n = this.painZones.has(e);
				return t.className = (e === this.selectionManager.selected ? "active " : "") + (n ? "painful " : "") + "structure-" + j(e), t.setAttribute("aria-pressed", String(this.painMode ? n : e === this.selectionManager.selected)), n && t.setAttribute("aria-label", `${e.userData.label} — zone douloureuse`), t.onclick = () => this.pickBone(e), t;
			}));
		}
	}
	renderNotesList() {
		let t = $("note-count");
		t && (t.textContent = String(this.notesManager.notes.length));
		let n = $("notes");
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
				if (t.text && t.text.includes("Bilan EOS") && (this.scoliosis.isActive = !0, this.scoliosis.currentCobb = 32, this.scoliosis.isKyphosisActive = !0, this.scoliosis.apply(32, !0, 45)), this.region = "all", this.selectionManager.isolated = !1, this.updateVisibility(), this.renderRegions(), this.selectBone(n, t.anchor && T(n, t.anchor) || new e.Vector3().fromArray(t.point)), this.selectionManager.selectedAnchor = t.anchor || null, this.selectionManager.selectedPoint.copy(t.anchor && T(n, t.anchor) || new e.Vector3().fromArray(t.point)), t.text && t.text.includes("Bilan EOS")) {
					let e = n.position.clone();
					this.viewer.controls.target.copy(e), this.viewer.camera.position.set(e.x, e.y, e.z - .72), this.viewer.controls.update();
					let t = $("views");
					if (t) for (let e of t.children) e.classList.toggle("active", e.dataset.view === "back");
					$("model-status").textContent = "Vue postérieure · T7 (Apex)";
					let r = document.querySelector(".orientation");
					r && (r.style.visibility = "visible", r.firstElementChild.textContent = "G", r.lastElementChild.textContent = "D");
				} else this.viewer.frameBox(new e.Box3().setFromObject(n));
				this.viewer.requestRender();
			};
			let u = document.createElement("button");
			u.textContent = "Modifier", u.onclick = () => {
				let n = this.bones.find((e) => (e.userData.anatomyId || e.name) === t.boneId);
				n && (this.selectBone(n, t.anchor && T(n, t.anchor) || new e.Vector3().fromArray(t.point)), this.selectionManager.selectedAnchor = t.anchor || null, this.selectionManager.selectedPoint.copy(t.anchor && T(n, t.anchor) || new e.Vector3().fromArray(t.point)), this.notesManager.editingId = t.id, $("note-kind").value = t.kind, $("note-kind").dispatchEvent(new Event("change")), $("intensity").value = String(t.intensity), $("intensity").dispatchEvent(new Event("input")), $("note-date").value = t.date, $("note-text").value = t.text, $("save-note").textContent = "Enregistrer les modifications", $("note-form").scrollIntoView({
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
					}, $("save-status").append(e);
				}
			}, c.append(l, u, d), n.append(r, o, s, c), n;
		}));
	}
	setupUI() {
		$("pain-mode").onchange = (e) => {
			this.painMode = e.target.checked, $("pain-instructions").textContent = this.painMode ? "Clique sur le modèle ou dans la liste pour ajouter ou retirer autant de zones que tu veux." : "Active le marquage pour sélectionner plusieurs zones. Elles restent en rouge quand tu explores le modèle.", this.renderBones();
		}, $("clear-pain").onclick = () => {
			this.painZones.clear(), this.refreshPainZones();
		}, this.renderPainZones(), this.renderRegions();
		let t = $("search");
		t && (t.oninput = () => this.renderBones());
		let n = $("focus");
		n && (n.onclick = () => {
			this.selectionManager.selected && this.viewer.frameBox(new e.Box3().setFromObject(this.selectionManager.selected));
		});
		let r = $("isolate");
		r && (r.onclick = () => {
			this.selectionManager.isolated = !this.selectionManager.isolated, r.textContent = this.selectionManager.isolated ? "Tout réafficher" : "Isoler", this.updateVisibility();
		});
		let i = $("views");
		if (i) for (let t of i.children) t.onclick = () => {
			let n = t.dataset.view;
			for (let e of i.children) e.classList.toggle("active", e === t);
			if (n === "reset") {
				this.region = "all", this.selectionManager.isolated = !1;
				let e = $("isolate");
				e && (e.textContent = "Isoler"), this.renderRegions(), this.renderBones(), this.updateVisibility();
			}
			let r = n === "back" ? new e.Vector3(0, 0, -1) : n === "side" ? new e.Vector3(-1, 0, 0) : new e.Vector3(0, 0, 1);
			this.viewer.frameVisible(this.bones, r), $("model-status").textContent = n === "back" ? "Vue postérieure" : n === "side" ? "Profil droit" : "Vue antérieure";
			let a = document.querySelector(".orientation");
			a && (a.style.visibility = n === "side" ? "hidden" : "visible", a.firstElementChild.textContent = n === "back" ? "G" : "D", a.lastElementChild.textContent = n === "back" ? "D" : "G");
		};
		let a = $("zoom-in");
		a && (a.onclick = () => this.viewer.zoom(.8));
		let o = $("zoom-out");
		o && (o.onclick = () => this.viewer.zoom(1.25));
		let s = $("note-date");
		s && (s.value = (/* @__PURE__ */ new Date(Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4)).toISOString().slice(0, 10));
		let c = $("intensity");
		c && (c.oninput = () => {
			let e = $("intensity-value");
			e && (e.textContent = `${c.value} / 10`);
		});
		let l = $("note-kind");
		l && (l.onchange = () => {
			let e = $("intensity").closest("label");
			e && (e.hidden = l.value !== "Douleur ressentie");
		});
		let u = $("note-form");
		u && (u.onsubmit = (e) => {
			e.preventDefault();
			let t = this.selectionManager.selected, n = this.selectionManager.selectedPoint;
			if (!t || !n) return;
			let r = $("note-text").value.trim(), i = $("note-date").value, a = {
				id: this.notesManager.editingId || crypto.randomUUID(),
				boneId: t.userData.anatomyId || t.name,
				boneLabel: t.userData.label,
				point: n.toArray(),
				anchor: this.notesManager.editingId ? this.notesManager.notes.find((e) => e.id === this.notesManager.editingId)?.anchor : this.selectionManager.selectedAnchor,
				kind: $("note-kind").value,
				intensity: Number($("intensity").value),
				date: i,
				text: r
			};
			this.notesManager.saveNote(a) ? ($("note-text").value = "", $("save-note").textContent = "＋ Enregistrer le repère", this.notesManager.updateMarkers(this.bones), this.renderNotesList(), this.viewer.requestRender(), this.status("Repère enregistré sur cet appareil.")) : this.status("Erreur de validation ou espace de stockage saturé.");
		});
		let d = $("export");
		d && (d.onclick = () => this.notesManager.exportJSON());
		let f = $("load-eos-note");
		f && (f.onclick = () => {
			let e = G(this.bones.find((e) => /vertebra_t7/i.test(e.name)));
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
          ${e === "muscles" && t.sublayers ? `
            <div class="muscle-sublayers" id="muscle-sublayers">
              ${Object.entries(t.sublayers).map(([e, t]) => `
                <div class="sublayer-row ${e}">
                  <label>
                    <input id="sublayer-muscles-${e}" type="checkbox" checked>
                    <span class="sublayer-dot"></span>${t.title}
                    <small id="sublayer-count-${e}">…</small>
                  </label>
                  <div class="layer-opacity sublayer-opacity">
                    <input id="sublayer-opacity-${e}" type="range" min="0" max="100" value="${Math.round(t.opacity * 100)}" aria-label="Opacité ${t.title}">
                    <output id="sublayer-opacity-val-${e}">${Math.round(t.opacity * 100)} %</output>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      `).join("")}
      <label class="pick-label">Sélectionner dans
        <select id="pick-layer">
          <option value="all">Toutes les couches visibles</option>
          <option value="skeleton">Squelette</option>
          <option value="muscles">Muscles (tous)</option>
          <option value="muscles_superficial">Muscles superficiels (surface)</option>
          <option value="muscles_intermediate">Muscles intermédiaires</option>
          <option value="muscles_deep">Muscles profonds</option>
          <option value="nerves">Nerfs</option>
        </select>
      </label>
    `, e.insertBefore(n, e.querySelector(".section-label"));
		for (let [e, t] of Object.entries(this.layers)) if ($("layer-" + e).onchange = (n) => {
			if (t.enabled = n.target.checked, t.enabled && t.opacity === 0 && (t.opacity = .5), e === "muscles" && t.sublayers) {
				let e = Object.values(t.sublayers).some((e) => e.enabled);
				t.enabled && !e && Object.values(t.sublayers).forEach((e) => {
					e.enabled = !0;
				});
			}
			this.updateVisibility(), this.renderBones(), I(this.layers, this.bones, this.pickLayer);
		}, $("opacity-" + e).oninput = (n) => {
			t.opacity = Number(n.target.value) / 100, e === "muscles" && t.sublayers && Object.values(t.sublayers).forEach((e) => {
				e.opacity = t.opacity;
			}), this.updateVisibility(), I(this.layers, this.bones, this.pickLayer);
		}, e === "muscles" && t.sublayers) for (let [e, n] of Object.entries(t.sublayers)) {
			let r = $("sublayer-muscles-" + e);
			r && (r.onchange = (e) => {
				n.enabled = e.target.checked, n.enabled && !t.enabled && (t.enabled = !0), n.enabled && n.opacity === 0 && (n.opacity = t.opacity || .5), this.updateVisibility(), this.renderBones(), I(this.layers, this.bones, this.pickLayer);
			});
			let i = $("sublayer-opacity-" + e);
			i && (i.oninput = (e) => {
				n.opacity = Number(e.target.value) / 100, this.updateVisibility(), I(this.layers, this.bones, this.pickLayer);
			});
		}
		$("pick-layer").onchange = (e) => {
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
					e.enabled = t[n] > 0, e.opacity = t[n], e.sublayers && Object.values(e.sublayers).forEach((e) => {
						e.enabled = t[n] > 0, e.opacity = t[n];
					});
				}), this.pickLayer = n, this.selectionManager.isolated = !1, $("isolate").textContent = "Isoler", this.updateVisibility(), this.renderBones(), I(this.layers, this.bones, this.pickLayer);
				for (let e of r.children) e.classList.toggle("active", e === i);
			}, r.append(i);
		}
		document.querySelector(".viewer").append(r), document.querySelector(".pill").textContent = "ATLAS 3D";
	}
	async loadAtlas() {
		this.scoliosis.isBinding = !0;
		let r = document.querySelectorAll("#scoliosis-slider, #kyphosis-slider, #kyphosis-enabled, #scoliosis-toggle-btn, .preset-btn");
		r.forEach((e) => {
			e.disabled = !0;
		});
		let i = new t().setMeshoptDecoder(n);
		this.model = new e.Group(), this.viewer.scene.add(this.model);
		let a = [
			["skeleton", "skeleton"],
			["head", "skeleton"],
			["muscles", "muscles"],
			["nerves", "nerves"]
		], o = [];
		for (let [t, n] of a) try {
			$("model-status").textContent = `Chargement : ${this.layers[n].title.toLowerCase()}…`;
			let r = t === "muscles" ? await fetch("./models/muscles-files.json").then((e) => {
				if (!e.ok) throw Error("Couche indisponible");
				return e.json();
			}) : [t], a = { scene: new e.Group() };
			for (let e of r) {
				let t = await i.loadAsync(`./models/${e}.glb`);
				a.scene.add(t.scene);
			}
			this.model.add(a.scene), a.scene.traverse((t) => {
				t.isMesh && (t.userData.layer = n, n === "muscles" && (t.userData.muscleDepth = D(t.userData.sourceName || t.name)), t.userData.restPosition = t.position.clone(), t.userData.restQuaternion = t.quaternion.clone(), t.material = n === "skeleton" ? new e.MeshStandardMaterial({
					color: 13947325,
					roughness: .68,
					metalness: .03,
					side: e.DoubleSide
				}) : Array.isArray(t.material) ? t.material.map((e) => e.clone()) : t.material.clone(), t.userData.sourceName = t.userData.sourceName || t.name, t.userData.label = pe(t.userData.sourceName), this.bones.push(t), this.selectionManager.updateHighlight(t));
			}), this.bones.sort((e, t) => e.userData.label.localeCompare(t.userData.label, "fr", { numeric: !0 })), $("loading").hidden = !0, this.updateVisibility(), t === "head" && this.viewer.frameVisible(this.bones), this.renderBones(), this.renderPainZones(), this.renderNotesList(), I(this.layers, this.bones, this.pickLayer);
		} catch (e) {
			console.error(e), o.push(this.layers[n].title);
		}
		this.scoliosis.initIndex(this.bones), $("model-status").textContent = "Adaptation des muscles et des nerfs…";
		try {
			await this.tissues.init(this.model, this.bones, this.scoliosis);
			let e = this.selectionManager.selected;
			this.tissues.replacements.has(e) && (this.selectionManager.selected = this.tissues.replacements.get(e)), this.renderBones(), this.renderPainZones();
		} catch (e) {
			console.error("Adaptation des tissus indisponible:", e), o.push("adaptation des tissus");
		}
		this.scoliosis.isBinding = !1, r.forEach((e) => {
			e.disabled = !1;
		}), this.scoliosis.apply(this.scoliosis.currentCobb, this.scoliosis.isActive), this.notesManager.updateMarkers(this.bones), this.renderNotesList(), $("model-status").textContent = o.length ? "Couche indisponible : " + [...new Set(o)].join(", ") + " · Recharger pour réessayer" : `${this.bones.length} structures · Atlas de référence`, $("tissue-status").textContent = this.tissues.stats.meshes ? `${this.tissues.stats.meshes} structures suivent le squelette · adaptation visuelle estimée, sans calcul de tension.` : "Adaptation des tissus indisponible pour les couches chargées.", this.viewer.requestRender(), this.setupAgentBridge(), window.__DEBUG__ && (window.__app = {
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
	new me();
});
//#endregion
