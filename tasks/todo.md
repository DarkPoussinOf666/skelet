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

## Section Review & Validation
- **Moteur cinématique 3D non-destructif :** Chaîne vertébrale `spineChain` dynamique, préservation des poses initiales `restPosition` / `restQuaternion`, couplage rigide des 12 paires de côtes, cartilages et sternum.
- **Calibrage EOS 2025 conforme :** Différentiel angulaire coronal T6-T10 de 32° (réglable 0°-35°), apex T7-T8 avec translation latérale droite de 13.8 mm, gibbosité costale droite via rotation axiale `rotY`, préservation de l'équilibre coronal global (C7-CSL ~ 3 mm).
- **Contrôles de navigation fiabilisés :** Cadrage automatique de la vue postérieure thoracique lors du clic sur le bouton "Voir" de la note clinique T7, synchronisation stricte des boutons Face / Dos et des repères latéraux 'D'/'G'.
- **Résultats de l'Audit 360° & Refactoring :**
  - Architecture modulaire propre sous `src/` (6 modules spécialisés + orchestrateur).
  - Confidentialité restaurée : démarrage sans observation médicale imposée, bouton d'importation volontaire de la fiche clinique EOS.
  - Zéro allocation GC lors de la déformation dynamique de scoliose (fluidité 60 FPS garantie).
  - Rendu à la demande (Render-on-Demand) : arrêt complet des calculs GPU en repos.
  - Sécurité CSP validée avec support WebAssembly (`wasm-unsafe-eval` pour MeshoptDecoder).
  - Suite de tests automatisés Vitest : 13/13 tests au vert en 367ms.
  - Validation visuelle et fonctionnelle Chrome DevTools MCP sans aucune erreur console.

