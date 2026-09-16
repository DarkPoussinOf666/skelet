/**
 * @file Module d'internationalisation et taxonomie anatomique (FR/EN)
 * Pré-compilation des expressions régulières pour éliminer toute allocation dynamique au chargement.
 */

/** @type {Array<[string, string, string, (s: string) => boolean]>} */
export const regionDefs = [
  ['all', '◎', 'Corps entier', () => true],
  ['head', '◉', 'Crâne et mâchoire', s => /skull|mandible|hyoid/i.test(s)],
  ['spine', '⌇', 'Colonne vertébrale', s => /vertebra|sacrum|coccyx/i.test(s)],
  ['thorax', '⊞', 'Thorax', s => /rib|sternum/i.test(s)],
  ['arms', '⌁', 'Épaules, bras et mains', s => /clavicle|scapula|humerus|radius|ulna|carp|capitate|hamate|lunate|pisiform|scaphoid|trapez|triquetr|hand|finger/i.test(s)],
  ['pelvis', '◇', 'Bassin', s => /hip.bone|sacrum|coccyx/i.test(s)],
  ['legs', '⋮', 'Jambes et pieds', s => /femur|patella|tibia|fibula|tars|talus|calcane|cuneiform|cuboid|navicular|toe|foot/i.test(s)]
];

const ORDINAL_MAP = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12
};

const RIB_REGEX = /(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib/i;
const METACARPAL_REGEX = /(first|second|third|fourth|fifth) (metacarpal|metatarsal) bone/i;
const FINGER_TOE_REGEX = /of (first|second|third|fourth|fifth) finger of (foot|hand)/i;

/** @type {Array<[string, string]>} */
export const FRENCH_BASE_PAIRS = [
  ['Cervical vertebra', 'Vertèbre cervicale'],
  ['Thoracic vertebra', 'Vertèbre thoracique'],
  ['Lumbar vertebra', 'Vertèbre lombaire'],
  ['Hip bone', 'Os coxal'],
  ['Skull', 'Crâne'],
  ['Mandible', 'Mandibule'],
  ['Hyoid bone', 'Os hyoïde'],
  ['Clavicle', 'Clavicule'],
  ['Scapula', 'Scapula'],
  ['Humerus', 'Humérus'],
  ['Radius', 'Radius'],
  ['Ulna', 'Ulna'],
  ['Femur', 'Fémur'],
  ['Patella', 'Patella (rotule)'],
  ['Tibia', 'Tibia'],
  ['Fibula', 'Fibula (péroné)'],
  ['Sternum', 'Sternum'],
  ['Sacrum', 'Sacrum'],
  ['Coccyx', 'Coccyx'],
  ['Rib', 'Côte'],
  ['Calcaneus', 'Calcanéus'],
  ['Talus', 'Talus'],
  ['Metacarpal', 'Métacarpien'],
  ['Metatarsal', 'Métatarsien'],
  ['Proximal phalanx', 'Phalange proximale'],
  ['Middle phalanx', 'Phalange moyenne'],
  ['Distal phalanx', 'Phalange distale']
];

const STATIC_BONES_DICT = {
  'Body of sternum': 'Corps du sternum',
  'Manubrium of sternum': 'Manubrium du sternum',
  'Xiphoid process': 'Processus xiphoïde',
  'Capitate bone': 'Os capitatum',
  'Hamate bone': 'Os hamatum',
  'Lunate bone': 'Os lunatum',
  'Pisiform bone': 'Os pisiforme',
  'Scaphoid bone': 'Os scaphoïde',
  'Trapezium bone': 'Trapèze',
  'Trapezoid bone': 'Trapézoïde',
  'Triquetrum bone': 'Os triquétrum',
  'Cuboid bone': 'Os cuboïde',
  'Navicular bone': 'Os naviculaire',
  'Intermediate cuneiform bone': 'Cunéiforme intermédiaire',
  'Lateral cuneiform bone': 'Cunéiforme latéral',
  'Medial cuneiform bone': 'Cunéiforme médial',
  'Sesamoid bones of foot': 'Os sésamoïdes du pied',
  'Vertebra': 'Vertèbre'
};

const STATIC_SOFT_TISSUES_DICT = {
  'sciatic nerve': 'Nerf sciatique',
  'femoral nerve': 'Nerf fémoral',
  'obturator nerve': 'Nerf obturateur',
  'pudendal nerve': 'Nerf pudendal',
  'tibial nerve': 'Nerf tibial',
  'common fibular nerve': 'Nerf fibulaire commun',
  'superficial fibular nerve': 'Nerf fibulaire superficiel',
  'deep fibular nerve': 'Nerf fibulaire profond',
  'sural nerve': 'Nerf sural',
  'radial nerve': 'Nerf radial',
  'median nerve': 'Nerf médian',
  'ulnar nerve': 'Nerf ulnaire',
  'axillary nerve': 'Nerf axillaire',
  'musculocutaneous nerve': 'Nerf musculocutané',
  'brachial plexus': 'Plexus brachial',
  'spinal cord': 'Moelle épinière',
  'spinal nerve': 'Nerf spinal',
  'cauda equina': 'Queue de cheval',
  'intercostal nerves': 'Nerfs intercostaux',
  'trigeminal nerve': 'Nerf trijumeau',
  'vagus nerve': 'Nerf vague',
  'accessory nerve': 'Nerf accessoire',
  'suprascapular nerve': 'Nerf suprascapulaire',
  'saphenous nerve': 'Nerf saphène',
  'gluteus maximus': 'Grand fessier',
  'gluteus medius': 'Moyen fessier',
  'gluteus minimus': 'Petit fessier',
  'piriformis': 'Piriforme',
  'psoas major': 'Grand psoas',
  'iliacus': 'Iliaque',
  'quadratus lumborum': 'Carré des lombes',
  'latissimus dorsi': 'Grand dorsal',
  'trapezius': 'Trapèze',
  'deltoid': 'Deltoïde',
  'biceps brachii': 'Biceps brachial',
  'triceps brachii': 'Triceps brachial',
  'pectoralis major': 'Grand pectoral',
  'pectoralis minor': 'Petit pectoral',
  'rectus abdominis': 'Grand droit de l’abdomen',
  'rectus femoris': 'Droit fémoral',
  'vastus medialis': 'Vaste médial',
  'vastus lateralis': 'Vaste latéral',
  'vastus intermedius': 'Vaste intermédiaire',
  'biceps femoris': 'Biceps fémoral',
  'semitendinosus': 'Semi-tendineux',
  'semimembranosus': 'Semi-membraneux',
  'sartorius': 'Sartorius',
  'gastrocnemius': 'Gastrocnémien',
  'soleus': 'Soléaire',
  'sternocleidomastoid': 'Sterno-cléido-mastoïdien',
  'scalenus anterior': 'Scalène antérieur',
  'scalenus medius': 'Scalène moyen',
  'scalenus posterior': 'Scalène postérieur',
  'tibialis anterior': 'Tibial antérieur',
  'tibialis posterior': 'Tibial postérieur',
  'multifidus': 'Multifide',
  'iliotibial tract': 'Tractus ilio-tibial',
  'tensor fasciae latae': 'Tenseur du fascia lata',
  'parietal bone': 'Os pariétal',
  'frontal bone': 'Os frontal',
  'occipital bone': 'Os occipital',
  'temporal bone': 'Os temporal',
  'sphenoid bone': 'Os sphénoïde',
  'ethmoid bone': 'Os ethmoïde',
  'palatine bone': 'Os palatin',
  'zygomatic bone': 'Os zygomatique',
  'maxilla': 'Maxillaire',
  'nasal bone': 'Os nasal',
  'lacrimal bone': 'Os lacrymal',
  'costal cartilage of': 'Cartilage costal de',
  'corniculate cartilage': 'Cartilage corniculé',
  'arytenoid cartilage': 'Cartilage aryténoïde',
  'thyroid cartilage': 'Cartilage thyroïde',
  'cricoid cartilage': 'Cartilage cricoïde'
};

const COMPILED_BONES_REGEXES = Object.entries(STATIC_BONES_DICT).map(([en, fr]) => [new RegExp(en, 'gi'), fr]);
const COMPILED_BASE_REGEXES = FRENCH_BASE_PAIRS.map(([en, fr]) => [new RegExp(en, 'gi'), fr]);
const COMPILED_SOFT_REGEXES = Object.entries(STATIC_SOFT_TISSUES_DICT).map(([en, fr]) => [new RegExp(en, 'gi'), fr]);

const QUALIFIER_REGEXES = [
  [/ muscle\b/gi, ''],
  [/Long head of /gi, 'Chef long du '],
  [/Short head of /gi, 'Chef court du '],
  [/Lateral head of /gi, 'Chef latéral du '],
  [/Medial head of /gi, 'Chef médial du '],
  [/Descending part of /gi, 'Faisceau supérieur du '],
  [/Ascending part of /gi, 'Faisceau inférieur du '],
  [/Transverse part of /gi, 'Faisceau moyen du '],
  [/Roots of /gi, 'Racines du '],
  [/Vome\.r/g, 'Vomer']
];

/**
 * Formate et traduit un nom de structure squelettique anglaise en français.
 * @param {string} source
 * @returns {string}
 */
export function label(source) {
  if (!source) return '';
  let s = source.replaceAll('_', ' ');

  s = s.replace(RIB_REGEX, (_, n) => 'Côte ' + (ORDINAL_MAP[n.toLowerCase()] || n))
       .replace(METACARPAL_REGEX, (_, n, t) => (t.toLowerCase() === 'metacarpal' ? 'Métacarpien ' : 'Métatarsien ') + (ORDINAL_MAP[n.toLowerCase()] || n))
       .replace(FINGER_TOE_REGEX, (_, n, t) => 'du ' + (t.toLowerCase() === 'foot' ? 'pied' : 'doigt') + ' ' + (ORDINAL_MAP[n.toLowerCase()] || n));

  for (const [re, fr] of COMPILED_BASE_REGEXES) {
    s = s.replace(re, fr);
  }

  for (const [re, fr] of COMPILED_BONES_REGEXES) {
    s = s.replace(re, fr);
  }

  return s.replace(/\.l$/i, ' · gauche').replace(/\.r$/i, ' · droit');
}

/**
 * Formate et traduit l'ensemble des structures (squelette, muscles, nerfs, cartilages).
 * @param {string} source
 * @returns {string}
 */
export function displayLabel(source) {
  if (!source) return '';
  let s = label(source);

  for (const [re, fr] of COMPILED_SOFT_REGEXES) {
    s = s.replace(re, fr);
  }

  for (const [re, repl] of QUALIFIER_REGEXES) {
    s = s.replace(re, repl);
  }

  return s;
}
