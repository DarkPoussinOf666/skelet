# Product Requirements Document (PRD) — Skelet

> **Statut du Garde-fou** : [x] PRD Validé (Cocher pour débloquer les refactorisations majeures dans 90_Code_Source/)

## 1. Contexte & Problématique
- **Problème à résoudre** : Fournir une interface 3D anatomique fluide, privée et locale pour explorer le corps humain (os, muscles, nerfs) et consigner précisément des observations corporelles et des douleurs sans dépendance à un cloud médical tiers.
- **Public cible / Personas** :
  - Particuliers souhaitant suivre et cartographier leurs douleurs musculaires, articulaires ou nerveuses.
  - Praticiens / thérapeutes pour illustrer des repères anatomiques lors d'échanges avec des patients.

## 2. Objectifs & Métriques de Succès
- **Objectif principal** : Atlas interactif fluide à 60 FPS dans le navigateur, fonctionnant hors ligne avec persistance locale sécurisée.
- **KPIs / Critères d'acceptation** :
  - [x] Rendu de 1 004 structures anatomiques optimisées via Three.js et Meshopt (< 30 Mo au chargement).
  - [x] Enregistrement d'une observation avec point 3D précis par Raycaster en < 2 secondes.
  - [x] Fonctionnement 100 % hors-ligne (zéro appel réseau pour les données de santé).
  - [ ] Découplage modulaire du code pour isoler moteur 3D, gestionnaire d'état et UI.

## 3. Scope & Fonctionnalités (MVP & Évolutions)
- **Fonctionnalités Clés (In-Scope)** :
  - [x] Navigation 3D : Rotation (OrbitControls), Zoom, cadrages prédéfinis (Face, Dos, Profil, Reset).
  - [x] Gestion multicouche : Squelette, Muscles, Nerfs avec contrôle d'opacité et visibilité indépendante.
  - [x] Filtrage et recherche textuelle des structures en français.
  - [x] Isolation et centrage sur une structure sélectionnée.
  - [x] Journal d'observations avec sévérité (0-10), typologie, date et coordonnées spatiales 3D.
  - [x] Export des données au format JSON (`skelet-observations-YYYY-MM-DD.json`).
  - [x] Intégration passerelle agentique via `document.modelContext.registerTool`.
- **Fonctionnalités Futures (Roadmap)** :
  - [ ] Import / Restauration de sauvegardes JSON.
  - [ ] Visualisation par carte de chaleur (heatmap de douleur).
  - [ ] Tests automatisés et typage TypeScript strict.

## 4. Contraintes Techniques & Dépendances
- **Stack** : Vanilla JS ES Modules, Three.js `0.180.0`, MeshoptDecoder, Node.js natif pour le serveur de développement.
- **Contraintes de sécurité** : Stockage exclusif dans `localStorage` (`skelet.observations.v1`), zéro secret, politique CSP stricte.
- **Modèle d'état SKILL.state** : Spécification formelle de l'état runtime dans `20_Data_et_Bases/state_schema.json`.
