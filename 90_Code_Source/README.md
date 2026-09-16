# Architecture du Code Source — 90_Code_Source

## ⚠️ Garde-fou Important (PRD First)
> **RÈGLE STRICTE DE DÉVELOPPEMENT** :
> Les modifications structurelles et nouveaux modules de code dans ce dossier ou sous `dist/` sont assujettis à la validation préalable du document `00_Conception_et_References/01_PRD.md`.

## Statut de Modularisation : DÉPLOYÉ
L'architecture modulaire a été extraite du monolithe et structurée sous `src/` :
- `src/` :
  - `core/viewer.js` : Initialisation Three.js, caméra, renderer, lumières, boucle d'animation avec Rendu-à-la-Demande (*Render-on-Demand*).
  - `biometrics/scoliosis.js` : Modélisation biomécanique EOS T6-T10, indexation $O(1)$ par Map et Object Pooling sans allocation GC.
  - `layers/layers.js` : Gestionnaire multicouche (squelette, muscles, nerfs, opacités).
  - `selection/selection.js` : Raycasting optimisé, isolation, focus caméra.
  - `observations/notes.js` : Modèle de notes, validation stricte de schéma, CRUD, persistance localStorage, export JSON, fiche EOS à la demande.
  - `i18n/labels.js` : Dictionnaires anatomiques français avec regex pré-compilées.
  - `main.js` : Orchestrateur central et pont agentique `modelContext`.
