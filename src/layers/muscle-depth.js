// Three display/dissection planes, relative to each body region. A whole mesh
// stays in one plane, including its tendon. These are not distances to skin.
// Back intrinsic muscles stay in the deep plane (including erector spinae).
// References and the display conventions are documented in README.md.
export const MUSCLE_DEPTHS = {
  superficial: { title: 'Superficiels', description: 'Muscles de surface' },
  intermediate: { title: 'Intermédiaires', description: 'Plan musculaire intermédiaire' },
  deep: { title: 'Profonds', description: 'Plan musculaire profond' }
};

const rules = [
  ['deep', /deep (part|head)|innermost intercostal|transversus (abdominis|thoracis)|multifidus|rotatores|interspinal|intertransvers|semispinalis|iliocostalis|longissimus|spinalis|splenius|rectus (posterior|anterior|lateralis) capitis|rectus posterior (major|minor) capitis|obliquus (superior|inferior) capitis|longus (colli|capitis)|scalenus|quadratus lumborum|psoas|iliacus|diaphragm/],
  ['deep', /gluteus minimus|gemellus|obturator|quadratus femoris|piriformis|adductor (magnus|minimus)|vastus intermedius|popliteus|tibialis posterior|flexor (digitorum|hallucis) longus|plantar interosse|dorsal interosse|adductor hallucis|opponens|palmar interosse|adductor pollicis|flexor digitorum profundus|flexor pollicis longus|pronator quadratus|extensor (pollicis|indicis)|abductor pollicis longus|supinator|subscapularis|subclavius|medial head of triceps/],
  ['deep', /pterygoid|genioglossus|hyoglossus|palatopharyngeus|pharyngeal constrictor|stylopharyngeus|geniohyoid|thyrohyoid|sternothyroid|arytenoid|ary-epiglottic|thyro-arytenoid|crico-arytenoid|cricothyroid|trochlea|tarsus|tendinous ring|levator palpebrae|(superior|inferior|medial|lateral) (rectus|oblique) muscle|pubo-analis|pubococcygeus|iliococcygeus|coccygeus|levator ani|levatores (breves|longi) costarum/],
  ['intermediate', /gluteus medius|adductor brevis|pectineus|short head of biceps femoris|semimembranosus|soleus|plantaris|fibularis brevis|extensor hallucis longus|quadratus plantae|lumbrical|flexor hallucis brevis|flexor digiti minimi of foot|extensor (hallucis|digitorum) brevis|rhomboid|levator scapulae|serratus posterior|brachialis|coracobrachialis|flexor digitorum superficialis|supraspinatus|infraspinatus|teres (major|minor)|pectoralis minor|serratus anterior|internal intercostal|internal abdominal oblique|pyramidalis/],
  ['intermediate', /temporalis|bucinator|buccinator|levator anguli oris|corrugator|stylohyoid|mylohyoid|digastric|sternohyoid|omohyoid/],
  ['superficial', /gluteus maximus|tensor fasciae latae|iliotibial|fibularis (tertius|longus)|extensor digitorum longus|tibialis anterior|flexor digitorum brevis|abductor (digiti minimi|hallucis)|adductor longus|gracilis|semitendinosus|long head of biceps femoris|gastrocnemius|calcaneal tendon|vastus (medialis|lateralis)|sartorius|rectus femoris|epicranial|frontalis|occipitalis|temporoparietalis|orbicularis|procerus|zygomaticus|nasalis|levator labii|depressor|risorius|levator nasolabialis|mentalis|superficial part of masseter|external anal sphincter/],
  ['superficial', /latissimus dorsi|trapezius|biceps brachii|flexor carpi|superficial head of pronator|palmaris longus|anconeus|extensor carpi|extensor digiti minimi|brachioradialis|extensor digitorum|deltoid|superficial head of flexor pollicis brevis|flexor digiti minimi of hand|abductor pollicis brevis|(lateral|long) head of triceps|external intercostal|pectoralis major|sternocleidomastoid|platysma|external abdominal oblique|rectus abdominis/]
];

export function classifyMuscleDepth(name = '') {
  const normalized = name.toLowerCase().replaceAll('_', ' ');
  return rules.find(([, pattern]) => pattern.test(normalized))?.[0] || null;
}

export function muscleDepthOf(mesh) {
  return mesh.userData.muscleDepth || classifyMuscleDepth(mesh.userData.sourceName || mesh.name);
}
