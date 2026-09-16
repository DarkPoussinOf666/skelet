# 80 — Tests et Déploiement

Ce dossier regroupe les suites de tests, scénarios de validation et configurations de déploiement.

## Tests Prévus
- **Syntaxe & Typage** : `node --check dist/app.js` (ou TypeScript check à terme).
- **Validation 3D** : Vérification des polygones et structures après compression glTF (`scripts/compress-atlas.mjs`).
- **Persistance LocalStorage** : Tests d'intégrité JSON sur les imports/exports de notes.
- **Serveur de développement** : [server.mjs](file:///e:/01%20-%20PROJETS/skelet/server.mjs).
