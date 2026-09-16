# Skelet

[![CI](https://github.com/DarkPoussinOf666/skelet/actions/workflows/ci.yml/badge.svg)](https://github.com/DarkPoussinOf666/skelet/actions/workflows/ci.yml)
[![Code License: MIT](https://img.shields.io/badge/Code_License-MIT-blue.svg)](LICENSE)
[![3D Models: CC BY-SA 4.0](https://img.shields.io/badge/3D_Models-CC_BY--SA_4.0-lightgrey.svg)](dist/models/ATTRIBUTION.md)
[![Three.js](https://img.shields.io/badge/Three.js-0.180-black.svg)](https://threejs.org/)
[![Privacy: Local-First](https://img.shields.io/badge/Privacy-100%25_Local_--_No_Server-brightgreen.svg)](#confidentialité)

Application web en français pour explorer un squelette 3D complet (1 004 structures anatomiques) et conserver des observations et zones douloureuses directement dans le navigateur.

> 🌐 **Démonstration en ligne** : [https://darkpoussinof666.github.io/skelet/](https://darkpoussinof666.github.io/skelet/)

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) 20+

### Installation & Lancement local
```bash
# Cloner le dépôt
git clone https://github.com/DarkPoussinOf666/skelet.git
cd skelet

# Installer les dépendances
npm install

# Démarrer le serveur local de développement
npm run dev
```
Ouvrir ensuite [http://127.0.0.1:5173](http://127.0.0.1:5173).

L’application publiée est 100 % statique : le dossier `dist/` embarque le moteur Three.js, l'interface et les modèles 3D compressés (aucune dépendance réseau ni API externe).

---

## ✨ Fonctionnalités Clés

- **Navigation 3D fluide & intuitive** : Rotation orbitale, zoom, vues directes (face, dos, profil, dessus), centrage et isolation d'une structure sélectionnée.
- **Organisation multicouche anatomique** :
  - **Squelette & Cartilages** (271 structures).
  - **Muscles & Tendons** (482 structures) avec dissection par profondeur : plans *Superficiel* (156 structures), *Intermédiaire* (92 structures) et *Profond* (234 structures).
  - **Système Nerveux** (251 structures) incluant nerfs crâniens, plexus et branches périphériques.
  - Opacité réglable par calque et par plan musculaire, filtres de raycasting sélectifs pour cibler des structures enfouies.
- **Biométrie & Cinématique du Rachis (Profil EOS)** :
  - Ajustement dynamique de la scoliose (courbure thoracique T6-T10, angle de Cobb de 0° à 35° calibré sur cliché EOS).
  - Modélisation de la cyphose sagittale physiologique et pathologique (0° à 70°, préréglage EOS 45°).
  - Adaptation dynamique des tissus mous : déformation par maillage écorché (*skinning* matriciel GPU) pour que les muscles et nerfs suivent les déplacements osseux en temps réel.
- **Carnet d'Observations & Cartographie des Douleurs** :
  - Mode **« Marquer les zones douloureuses »** : coloration sélective et cumulée des structures atteintes.
  - Notes cliniques et journal local : intensité (0 à 10), date, description, type d'observation.
  - Ancrage surfacique robuste : les repères restent solidaires des surfaces anatomiques même lors des déformations rachidiennes.
  - Export et import des données au format JSON.

---

## 🔒 Confidentialité & Souveraineté des Données

- **100 % Local (Local-First)** : Toutes les données personnelles et notes cliniques sont stockées exclusivement dans le `localStorage` de votre navigateur (`skelet.observations.v1`).
- **Zéro Télémétrie, Zéro Serveur** : Aucun cookie traceur, aucun appel analytique tiers.
- **Content Security Policy (CSP) stricte** : `default-src 'self'` interdisant tout contact réseau externe non désiré.

---

## 📐 Modèles Anatomiques & Optimisation

- **1 004 structures anatomiques** issues des modèles originaux Z-Anatomy (fichiers FBX de Lluís Vinent Juanico).
- **Compression Meshopt & Quantification 16-bit** : Les maillages originaux ne subissent aucune décimation de polygones ; les coordonnées sont compressées avec Meshoptimizer pour un poids total d'environ 27 Mo pour l'ensemble des couches.
- Voir [`dist/models/ATTRIBUTION.md`](dist/models/ATTRIBUTION.md) et [`dist/models/SOURCE-LICENSE.txt`](dist/models/SOURCE-LICENSE.txt) pour le détail des hachages SHA-256 et des règles de dérivation.

---

## 🛠️ Commandes Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur local de développement statique sur le port 5173 |
| `npm run build` | Compile et empaquète les modules ES de `src/` vers `dist/app.js` avec Vite |
| `npm run check` | Vérifie la syntaxe Node.js du bundle de production `dist/app.js` |
| `npm test` | Exécute la suite de tests unitaires et d'intégration Vitest (37 tests) |

---

## 📄 Licences & Crédits

Ce projet applique un modèle de double licence respectueux de l'écosystème open-source :

- **Code source applicatif** : Distribué sous licence **MIT** (Copyright © 2025-2026 DarkPoussinOf666). Voir [LICENSE](LICENSE).
- **Modèles 3D anatomiques (`dist/models/`)** : Dérivés de [Z-Anatomy](https://www.z-anatomy.net/) (Gauthier Kervyn, Lluís Vinent Juanico, contributeurs Z-Anatomy) et [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), sous licence **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International).
- **Moteur 3D & Décodeurs** :
  - [Three.js](https://threejs.org/) — MIT License
  - [meshoptimizer](https://github.com/zeux/meshoptimizer) — MIT License
