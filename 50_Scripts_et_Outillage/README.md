# 50 — Scripts et Outillage

Ce dossier regroupe les scripts de conversion, compression et maintenance du pipeline 3D.

- `compress-atlas.mjs` : Optimisation Meshopt, quantification 16-bit et déduplication glTF.
- `convert-atlas.mjs` : Traitement des modèles de base du squelette.
- `convert-layer.mjs` : Découpage et conversion des couches musculaires et nerveuses.
- `inspect-layer.mjs` : Diagnostic des hiérarchies et métadonnées d'objets 3D.
*(Les scripts de production actifs résident également dans `scripts/` à la racine pour assurer la compatibilité avec les commandes npm).*
