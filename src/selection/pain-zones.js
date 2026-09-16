export const PAIN_STORAGE_KEY = 'skelet.pain-zones.v1';
export const structureId = bone => bone.userData.anatomyId || bone.name;

/** Independent of the active structure used by the observation form. */
export class PainZones {
  constructor() {
    this.ids = new Set();
    this.storageAvailable = true;
    try {
      const saved = JSON.parse(localStorage.getItem(PAIN_STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) this.ids = new Set(saved.filter(id => typeof id === 'string' && id));
    } catch {
      this.storageAvailable = false;
    }
  }

  has(bone) { return this.ids.has(structureId(bone)); }

  toggle(bone) {
    const id = structureId(bone);
    if (this.ids.has(id)) this.ids.delete(id);
    else this.ids.add(id);
    this.persist();
  }

  remove(id) {
    this.ids.delete(id);
    this.persist();
  }

  clear() {
    this.ids.clear();
    this.persist();
  }

  persist() {
    try {
      localStorage.setItem(PAIN_STORAGE_KEY, JSON.stringify([...this.ids]));
      this.storageAvailable = true;
    } catch {
      this.storageAvailable = false;
    }
  }
}
