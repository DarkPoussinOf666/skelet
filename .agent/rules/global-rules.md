# Règles Globales du Projet Skelet (Global Rules)

## ⛔ Garde-fou Stricte : Bloquer les ajouts de code avant PRD
- **Interdiction Formelle** : Il est interdit de refondre ou de créer de nouveaux modules applicatifs tant que le fichier `00_Conception_et_References/01_PRD.md` n'est pas validé par l'utilisateur.
- **Obligation d'Information** : Si une consigne prématurée demande une altération profonde, rappeler poliment le verrou et proposer la validation du PRD.

## 📐 Standards Qualité & Architecture
- **Séparation des Responsabilités** : Pas de logique monolithique. Séparer l'affichage Three.js, les modèles de données, et l'interface utilisateur.
- **Performance WebGL** : Surveiller le nombre de géométries instanciées et préserver les buffers Meshopt.
- **Conventional Commits** : Messages clairs à l'impératif (`feat:`, `fix:`, `refactor:`, `docs:`).
- **Zéro Secret** : Données 100% locales, aucun appel externe non consenti.
