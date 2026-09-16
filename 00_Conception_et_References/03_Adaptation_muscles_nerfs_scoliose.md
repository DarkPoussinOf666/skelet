# Adaptation des muscles et nerfs à la scoliose — étude de faisabilité

Étude initiale du 16 septembre 2026, fondée sur le code et les GLB avant implémentation. Les constats ci-dessous décrivent cet état initial.

Suite mise en œuvre : une première adaptation visuelle est désormais intégrée dans `src/biometrics/tissue-deformation.js`, avec armature partagée, poids spatiaux interpolés, règles pour les intercostaux/structures rachidiennes, couplage du crâne et ancrages de surface pour les nouveaux repères. Les poids sont estimés automatiquement ; les insertions annotées, contraintes de trajet explicites et résolution des collisions proposées dans cette étude restent des améliorations ultérieures. Voir le README pour le périmètre courant.

## Décision proposée

L'adaptation géométrique interactive est faisable avec Three.js et les modèles actuels. Je recommande une armature de contrôle commune, une déformation progressive par sommet et des règles d'attache propres aux familles anatomiques. Commencer par le rachis et le thorax, puis traiter les raccords vers le cou, les épaules et le bassin.

Il faut distinguer trois objectifs :

| Objectif | Faisabilité avec les données actuelles |
|---|---|
| Faire suivre visuellement la déformation du squelette | Bonne, après ajout de contrôleurs et de poids de déformation |
| Préserver des attaches et des trajets anatomiquement plausibles | Possible avec un travail d'annotation et de vérification anatomique |
| Prédire tension musculaire, compression nerveuse ou douleur individuelles | Non démontrable à partir du seul atlas et du curseur de Cobb ; nécessite un autre niveau de données et de validation |

## Constats vérifiés dans le projet

- `src/biometrics/scoliosis.js` applique un profil prédéfini de rotations et translations, multiplié par `Cobb / 32`. Il indexe 25 éléments du sacrum à C1 et 47 pièces thoraciques couplées dans les modèles actuels. Les transformations mises à disposition dans `vertTransforms` ne couvrent que T1–T12.
- `src/main.js`, méthode `loadAtlas()`, charge des maillages indépendants et conserve leur position et quaternion initiaux. Aucune liaison muscle–os ou nerf–vertèbre n'est créée.
- Lecture des en-têtes de tous les GLB : aucune armature glTF (`skins`), aucune animation et aucun attribut `JOINTS_0` ou `WEIGHTS_0`. Les métadonnées donnent des noms, identifiants et régions, sans insertions musculaires ni trajets nerveux.
- Les muscles comptent 482 maillages, 1 180 621 sommets et 1 982 970 triangles ; les nerfs 251 maillages, 598 807 sommets et 1 172 626 triangles. Le total des tissus mous atteint donc 1 779 428 sommets.
- Les intercostaux et plusieurs racines nerveuses sont regroupés dans des objets couvrant plusieurs niveaux. Par exemple, `Intercostal_nervesl` ne désigne pas un seul nerf intercostal. Une attribution par nom de maillage ne suffit pas.
- Le GLB nerveux contient des racines, ganglions et la queue de cheval, mais aucun nœud nommé `Spinal_cord`. Vérifier les sources avant de prévoir une adaptation de la moelle elle-même ; elle n'est pas identifiée comme structure indépendante dans l'export actuel.
- Les translations et échelles des nœuds GLB participent au décodage des géométries quantifiées. Il faut travailler dans un repère commun et préserver ces transformations, plutôt que supposer que les sommets sont déjà en coordonnées anatomiques globales.

Un diagnostic Node utilisant les transformations des vrais nœuds GLB et le moteur actuel donne, au réglage 32°, un déplacement latéral de T8 d'environ 17 mm, tandis que les omoplates et clavicules restent fixes. C1 se déplace également, mais le crâne n'est pas couplé par ce moteur. Le retour à 0° restaure exactement les positions initiales dans ce diagnostic. Ces résultats vérifient le comportement du code, pas sa validité anatomique.

Le profil actuel n'est pas une reconstruction individuelle complète : les translations ajoutées n'ont pas de composante antéropostérieure et le moteur n'utilise pas les valeurs de cyphose/lordose présentes dans la note EOS. Les tissus pourront suivre fidèlement ce profil synthétique, avec les mêmes limites. Déduire une géométrie individuelle complète d'un seul angle de Cobb serait insuffisant ; les travaux de personnalisation utilisent notamment une géométrie issue d'images biplanaires calibrées [4].

## Méthode recommandée

### 1. Une référence neutre et des contrôleurs communs

Conserver les géométries originales immuables et capturer les matrices globales au repos. Créer des contrôleurs pour les vertèbres, les côtes et les autres points d'attache nécessaires. Exposer les transformations cervicales et lombaires, en plus des thoraciques.

Pour un contrôleur i, le déplacement à appliquer à un point exprimé dans le repère global est :

`D_i = M_i_pose × inverse(M_i_repos)`

Une première déformation pondérée est :

`p_pose = somme_i(w_i × D_i × p_repos)`, avec `w_i ≥ 0` et `somme_i(w_i) = 1`.

Reconstruire chaque pose depuis le repos évite toute dérive lors des allers-retours du curseur. Utiliser les matrices complètes permet de respecter les parents, échelles et orientations initiales. Une armature technique peut copier les poses calculées par le moteur existant : il n'est pas nécessaire de modifier sa cinématique pour commencer.

Prévoir explicitement les raccords crâne–cou, thorax–épaules et lombaires–bassin. La pose des épaules ne se déduit pas automatiquement de Cobb : décider d'une règle d'illustration, ou la calibrer à partir de repères disponibles. Les extrémités d'un muscle attachées à un os laissé fixe doivent conserver cette attache.

### 2. Muscles : plusieurs influences et des attaches conservées

Pour chaque famille, définir les os autorisés à l'influencer, ses zones d'attache et les régions qui restent fixes. Initialiser les poids avec la position au repos, les niveaux vertébraux et le côté anatomique, puis lisser les influences à l'intérieur du tissu. Ne pas utiliser seulement « l'os le plus proche » : il peut être voisin sans être un point d'insertion.

| Famille | Règle proposée |
|---|---|
| Muscles paravertébraux | Répartir les influences sur les niveaux parcourus ; conserver les attaches identifiées |
| Intercostaux | Relier localement le tissu aux deux côtes qui encadrent chaque espace intercostal |
| Trapèzes et muscles reliant plusieurs régions | Combiner attaches rachidiennes et attaches scapulaires, claviculaires ou crâniennes selon le muscle |
| Muscles reliant lombaires et bassin/membre inférieur | Combiner contrôleurs mobiles et contrôleurs fixes, sans faire glisser les insertions |

Le principe des attaches et points de passage guidant un trajet musculaire est documenté par OpenSim [2]. Il peut guider l'annotation de l'atlas ; cela ne fournit pas automatiquement la déformation volumique de ses surfaces.

Commencer avec deux à quatre influences par sommet et le skinning linéaire de Three.js. Examiner les pertes de volume et plis dans les zones de rotation. Si nécessaire, améliorer les poids ou ajouter des corrections locales ; les poids biharmoniques constituent une piste de prétraitement plus avancée [3]. Le skinning seul ne garantit ni conservation du volume ni absence de pénétration des os.

### 3. Nerfs : continuité et points de passage

Les nerfs demandent des contraintes de trajet, et pas seulement les mêmes poids que les muscles :

- Les racines et ganglions doivent suivre des repères de sortie vertébrale explicitement identifiés.
- Les trajets intercostaux doivent accompagner les côtes correspondantes, avec un raccord continu aux racines.
- Les plexus nécessitent une transition entre rachis, cou/épaule ou bassin, puis membre.
- Les jonctions entre objets nerveux séparés doivent partager des contraintes afin de ne pas s'écarter sous la déformation.

Pour la première version, appliquer un champ de déformation cohérent, contraint par ces repères. Pour les trajets qui se plient ou s'aplatissent, une version ultérieure pourra employer une courbe centrale et transporter les sections du nerf le long de cette courbe. L'extraction de courbes et de leurs branches n'est pas fournie par les GLB : c'est un travail supplémentaire, à tester sur quelques structures.

Un contact apparent dans le rendu ne permet pas de conclure à une compression nerveuse. Les études calculant les contraintes nerveuses emploient des modèles mécaniques dédiés, notamment par éléments finis [5].

### 4. Intégration et performances

Utiliser `THREE.SkinnedMesh` et une armature partagée, avec des matrices de liaison correctement définies pour chaque maillage. Three.js prend en charge les indices et poids de skinning [1] ; la version locale 0.180.0 a aussi été inspectée pour le calcul des positions déformées lors de la sélection.

Calculer les poids au chargement pour le prototype, puis les précalculer pour la version distribuée. Éviter une réécriture CPU de tous les sommets à chaque mouvement du curseur. Quatre indices Uint16 et quatre poids Float32 pour tous les tissus représenteraient environ 40,7 Mio supplémentaires avant compression et hors autres buffers ; limiter le premier périmètre au tronc réduit ce coût. Aucun gain de fréquence d'affichage n'est affirmé sans mesure sur la machine cible.

Points d'intégration à prévoir :

- `scoliosis.js` : publier toutes les poses de contrôleurs, puis déclencher une mise à jour unique après changement d'angle.
- Nouveau module de déformation : liaison au repos, poids, poses et règles anatomiques.
- `loadAtlas()` : capturer le repos et lier les tissus avant la première application de la scoliose.
- Sélection et cadrage : mettre à jour les volumes englobants après changement de pose, ou employer des bornes conservatrices vérifiées. Un shader personnalisé seul laisserait le raycasting standard sur la géométrie initiale.
- Notes : les marqueurs sont aujourd'hui enfants des maillages ; cela suit leur transformation rigide, mais pas la déformation de leurs sommets. Prévoir un ancrage par triangle et coordonnées barycentriques pour les nouvelles notes sur tissus, ainsi qu'une migration conservatrice des anciennes coordonnées globales. Ne pas déplacer silencieusement les observations existantes.
- Export : `convert-layer.mjs` supprime les attributs autres que positions/normales avant de recréer les couleurs. Une armature ajoutée dans un outil externe serait perdue sans adaptation de ce pipeline. Les poids précalculés doivent correspondre à l'ordre final des sommets : compression et réordonnancement doivent préserver leur association. Versionner les données d'attache avec les modèles.

## Déroulement et critères de réussite

1. **Prototype ciblé** : paravertébraux, intercostaux et racines thoraciques, sur la plage actuelle 0–35°. Valider repères, influences et performance avant généralisation.
2. **Raccords et attaches** : traiter épaules, cou, bassin et continuité nerveuse ; examiner face, dos, profil et vues internes. Corriger les intersections nouvelles et les attaches qui glissent.
3. **Intégration complète** : sélection, surbrillance, opacité, isolation, notes, chargement partiel et fichiers compressés.

Critères mesurables : retour au neutre dans une tolérance numérique définie ; absence de dérive après cycles 0→32→0 ; poids normalisés ; attaches respectées dans une tolérance exprimée dans l'unité du modèle ; jonctions nerveuses continues ; absence de triangles dégénérés et de nouvelles pénétrations significatives dans le périmètre validé ; sélection conforme à l'image ; marqueurs attachés ; temps de mise à jour et mémoire mesurés. Comparer aussi les poses 22°, 32° et 35°. Distinguer les intersections préexistantes de l'atlas de celles introduites par la méthode.

Ordre de grandeur de planification, sans engagement et à réviser après le prototype : quelques jours pour une preuve visuelle ciblée ; plusieurs semaines pour des attaches, raccords et annotations fiables sur un périmètre étendu. L'annotation anatomique et la validation sont les principales inconnues, davantage que le calcul des matrices.

## Sources

1. [Three.js — SkinnedMesh](https://threejs.org/docs/pages/SkinnedMesh.html) : armature, attributs, matrices de liaison et volumes englobants. Les détails d'implémentation doivent rester compatibles avec la version locale 0.180.0.
2. [OpenSim — Muscle Editor](https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53090145/Muscle%2BEditor) : attaches, points de passage et surfaces de contournement.
3. [Jacobson et al. — Bounded Biharmonic Weights for Real-Time Deformation](https://igl.ethz.ch/projects/bbw/) : poids lisses précalculés pour la déformation interactive.
4. [Schmid et al. — Spinal Compressive Forces in Adolescent Idiopathic Scoliosis With and Without Carrying Loads](https://arxiv.org/abs/1912.07893) : modèles individualisés à partir de radiographies biplanaires et validation des prédictions musculaires.
5. [Biomechanical Simulation of Stresses and Strains Exerted on the Spinal Cord and Nerves During Scoliosis Correction Maneuvers](https://pubmed.ncbi.nlm.nih.gov/29287811/) : modèle hybride cinématique/éléments finis pour les structures nerveuses.

Vérifications réalisées pour cette étude : lecture du moteur, du chargement, des scripts d'export et de compression, de la sélection et des notes ; inventaire des en-têtes GLB ; diagnostic des transformations du moteur à partir des nœuds osseux réels. Aucune déformation des tissus n'a encore été implémentée ou évaluée visuellement ; aucune mesure de performance WebGL n'a été réalisée.
