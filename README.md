# Skelet

Application personnelle en français pour explorer un squelette 3D et conserver des observations localement dans le navigateur.

## Démarrage

Node.js 20+ : `npm install`, puis `npm run dev`. Ouvrir http://127.0.0.1:5173.
L’application publiée est statique : `dist/` contient aussi le moteur et les modèles ; aucune requête à un fournisseur de modèles n’est nécessaire.

## Fonctions

- Rotation, zoom, vues face/dos/profil, navigation par région, recherche et sélection de structures.
- Couches squelette, muscles/tendons et nerfs ; activation, opacité individuelle et vues rapides. Filtre de sélection pour atteindre un nerf à travers les tissus visibles.
- Centrage et isolation d’un os ; repères de douleur avec intensité, date, description et catégorie.
- Journal local, modification, retrait avec annulation immédiate, export JSON.
- Les données personnelles sont dans localStorage, sans serveur et sans synchronisation. Une suppression des données du navigateur les efface. Les origines locale et publiée possèdent des stockages distincts.

## Modèle

1 004 structures issues des FBX originaux Z-Anatomy : 271 os/dents/cartilages, 482 structures musculaires, 251 structures nerveuses. Les triangles ne sont pas décimés ; positions quantifiées sur 16 bits et compression Meshopt pour environ 27 Mo de modèles. Voir `dist/models/ATTRIBUTION.md` et `dist/models/SOURCE-LICENSE.txt`.

Reproduction : télécharger les trois fichiers source depuis les URL créditées vers `sources/`, puis exécuter `node scripts/convert-atlas.mjs`, `node scripts/convert-layer.mjs muscles`, `node scripts/convert-layer.mjs nerves`, et `node scripts/compress-atlas.mjs`. La compression conserve une copie de ses entrées sous `sources/exports/` pour permettre une répétition sans quantification cumulative. Actualiser ces sauvegardes uniquement si les sources changent.

Ce premier atlas permet d’annoter des troubles, pas de simuler une déformation individuelle ou d’identifier la cause d’une douleur. La personnalisation morphologique nécessite des données anatomiques et une validation appropriée.

## Vérification

`npm run check` vérifie la syntaxe. Le parcours 3D et la persistance doivent également être vérifiés dans un navigateur WebGL.
