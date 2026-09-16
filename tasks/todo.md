# Plan d'Action — Initialisation et Restructuration du Projet Skelet

## Statut Global : INITIALISÉ

### Phase 1 : Initialisation du Socle Méthodologique & Agentique (Skill antigravity-initializer)
- [x] Créer l'infrastructure de gouvernance locale `tasks/todo.md` et `tasks/lessons.md`
- [x] Créer l'arborescence numérotée thématique (00 à 99)
- [x] Générer les documents de cadrage : `01_PRD.md`, `02_Contexte.md`, `gemini.md`, `design.md`
- [x] Mettre en place le socle agentique `.agent/` (agents, rules, workflows)
- [x] Définir le schéma d'état et persistance dans `20_Data_et_Bases/`

### Phase 2 : Validation & Alignement du Cadrage
- [x] Revue du PRD Skelet par l'utilisateur
- [x] Approbation de l'Approche A (Module dynamique non-destructif + observation EOS)

### Phase 3 : Modélisation Morphologique de la Scoliose EOS (T6-T10, 22°-32°)
- [x] Modélisation mathématique du profil de déformation rachidienne 3D (Cobb, apex T7-T8, rotation axiale, contre-courbures C7-CSL)
- [x] Création du composant UI "Mon Profil Rachis (EOS 2025)" (Toggle Squelette neutre / Mon rachis, slider 0° à 35° pré-réglé à 32° et repère 22°)
- [x] Implémentation du moteur de morphing/déformation Three.js (application sur vertèbres et côtes thoraciques/lombaires)
- [x] Intégration automatique de la fiche d'observation clinique EOS dans le carnet local (`skelet.observations.v1`)
- [x] Vérification du rendu 3D, non-régression du raycaster/marquage et cohérence anatomique

### Phase 4 : Audit Global 360° du Projet Skelet
- [x] Réalisation d'un audit de conformité globale (Architecture logicielle, Moteur 3D/WebGL, Sécurité/Données de santé, Maintenabilité)
- [x] Cartographie de la dette technique du monolithe `dist/app.js` (~30 Ko, 65 lignes condensées, 18 variables d'état éparpillées)
- [x] Détection des goulots d'étranglement WebGL (boucle 60 FPS inconditionnelle, allocations mémoire éphémères dans `applyScoliosis`, requêtes $O(N)$ non indexées)
- [x] Analyse de sécurité & conformité santé (exposition `window.__app`, absence de CSP, note clinique EOS hardcodée)
- [x] Élaboration de la matrice des risques et du plan d'action hiérarchisé (P0 Sécurité & Découpage, P1 Optimisations 3D, P2 Tests & Tooling)

### Phase 5 : Plan d'Action Recommandé (Feuille de route P0 / P1 / P2)
- [x] **P0.1 - Assainissement Confidentialité & Sécurité** : Découpler la note EOS individuelle de `dist/app.js` (accessible via bouton optionnel `+ Fiche EOS`), implémenter une CSP stricte dans `index.html` avec support `wasm-unsafe-eval`, supprimer l'exposition systématique de `window.__app`.
- [x] **P0.2 - Découpage Modulaire `src/` (ou `90_Code_Source/src/`)** : Scinder le monolithe en 6 sous-modules découplés (`src/core/viewer.js`, `src/biometrics/scoliosis.js`, `src/layers/layers.js`, `src/selection/selection.js`, `src/observations/notes.js`, `src/i18n/labels.js`, `src/main.js`).
- [x] **P1.1 - Optimisation Moteur 3D & GC** : Remplacer les boucles $O(N)$ de `applyScoliosis` par des indexations `Map<string, Mesh>` ($O(1)$), recycler les vecteurs Three.js (`_tmpEuler`, `_tmpQuat`, `_tmpDelta`, zéro allocation GC), implémenter un rendu à la demande (Render-on-Demand avec `isDirty` et `OrbitControls.change`).
- [x] **P1.2 - Typage Statique & Schéma Strict** : Typage JSDoc strict et validation exhaustive du schéma des observations `localStorage` (`validateNote` avec bornes de sévérité 0-10, type de note autorisé, date ISO).
- [x] **P2.1 - Infrastructure de Tests Automatisés** : Déployer Vitest pour les tests unitaires (13 tests au vert : cinématique rachidienne, CRUD observations, annulation/undo, taxonomie anatomique).
- [x] **P2.2 - Modernisation du Build** : Intégrer Vite (`vite.config.js`) pour le packaging instantané de `src/main.js` vers `dist/app.js` en 32ms.

### Phase 6 : Correction de l'Inversion Latérale Scoliose EOS (Lévoscoliose)
- [x] Identification de l'inversion gauche/droite entre la convention radiologique AP EOS ('G' à droite de l'image) et le repère 3D (+X = gauche anatomique)
- [x] Inversion des angles coronaux `tiltZ` et de rotation axiale `rotY` dans `SPINE_CHAIN_CONFIG` (`src/biometrics/scoliosis.js`)
- [x] Mise à jour des coordonnées de référence et du texte clinique dans `src/observations/notes.js` (scoliose thoracique à convexité gauche, gibbosité gauche)
- [x] Actualisation des tests unitaires `tests/scoliosis.test.js` (26/26 tests Vitest passés avec succès)
- [x] Recompilation du bundle de production `dist/app.js` via Vite et validation syntaxique `node --check`
- [x] Validation visuelle et capture comparative sous Chrome DevTools MCP (vues de face et de dos conformes au cliché EOS)

### Phase 7 : Intégration de la Cyphose Thoracique T1–T12 (45° EOS)
- [x] Modélisation géométrique de la courbure sagittale (correction angulaire relative à la courbure de repos de l'atlas)
- [x] Couplage cinématique des vertèbres T1–T12, des côtes associées et de la chaîne céphalique (C1/crâne)
- [x] Composants UI dans le panneau Rachis (curseur cyphose 0°–70°, repère 45° EOS, case à cocher pour conserver la courbure d'origine)
- [x] Préréglage EOS combiné (Scoliose 32° + Cyphose 45°)
- [x] Tests unitaires Vitest de cinématique sagittale (`tests/scoliosis.test.js`)

### Phase 8 : Décomposition en Couches des Muscles (Superficiels / Intermédiaires / Profonds)
- [x] Classification anatomique exhaustive des 482 muscles du catalogue (`src/layers/muscle-depth.js`)
- [x] Extension du gestionnaire de calques `src/layers/layers.js` avec gestion des sous-couches musculaires
- [x] Intégration dans l'interface utilisateur (`src/main.js`) avec contrôles de visibilité, compteurs et sliders d'opacité
- [x] Mise à jour du sélecteur de raycasting `pick-layer` (ciblage fin d'une couche musculaire en vue 3D)
- [x] Stylisation CSS (`dist/layers.css`) pour une intégration soignée dans le volet d'exploration
- [x] Tests unitaires dédiés (`tests/muscle-depth.test.js`) et validation du build Vite + vérification visuelle Chrome DevTools

### Phase 9 : Préparation à la Publication GitHub
- [x] Renforcer `.gitignore` (ignorer caches, `.openai/`, OS files)
- [x] Compléter `package.json` (scripts build, licence, métadonnées, repo)
- [x] Rédiger `LICENSE` (double licence MIT code / CC BY-SA 4.0 modèles Z-Anatomy)
- [x] Mettre en place l'automatisation CI/CD `.github/workflows/` (CI tests + Pages)
- [x] Enrichir le `README.md` (badges, architecture, souveraineté locale, démo)
- [x] Structurer les commits git (Conventional Commits) et basculer sur la branche `main`

## Section Review & Validation
- **Moteur cinématique 3D non-destructif :** Chaîne vertébrale `spineChain` dynamique, préservation des poses initiales `restPosition` / `restQuaternion`, couplage rigide des 12 paires de côtes, cartilages et sternum.
- **Calibrage EOS 2025 conforme et orienté :** Différentiel angulaire coronal T6-T10 de 32° (réglable 0°-35°), apex T7-T8 avec translation latérale gauche de 17.4 mm ($+X$), gibbosité costale gauche postérieure via rotation axiale `rotY` négative (corps vertébral vers la gauche), préservation de l'équilibre coronal global (C7-CSL ~ 3 mm).
- **Cyphose sagittale T1–T12 (Phase 7) :** Modélisation de la cyphose physiologique et pathologique (0° à 70°, calibrée à 45° EOS), rotation sagittale avec sommation pondérée et préservation de la courbure intrinsèque de l'atlas.
- **Dissection et filtrage musculaire multicouche (Phase 8) :**
  - Répartition exhaustive des 482 muscles de l'atlas en 3 plans anatomiques : Superficiels (156 structures), Intermédiaires (92 structures) et Profonds (234 structures).
  - Contrôle hiérarchique : bascule générale des muscles ou effeuillage sélectif par plan, avec curseurs d'opacité dédiés par sous-couche.
  - Raycasting de précision : filtre « Sélectionner dans » étendu aux plans musculaires (`muscles_superficial`, `muscles_intermediate`, `muscles_deep`), permettant de cibler les muscles profonds du rachis (multifides, rotateurs) au travers des couches externes masquées.
  - Couverture de tests automatisés : 37/37 tests Vitest réussis (7 suites).
  - Vérification visuelle et DOM en direct sur le serveur local sans aucune régression.


