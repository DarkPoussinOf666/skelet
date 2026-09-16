# Gouvernance de la Connaissance, Exécution SKILL.state & Architecture Cognitive

## 1. Architecture d'Exécution Procédurale SKILL.state (O(1) Prompt / O(T) Tokens)
- **Modèle de Transition d'État Explicite** : À l'étape $t$, l'agent reçoit uniquement le triplet immuable $A_t = (P, \Sigma_t, O_t)$.
- **Raisonnement Éphémère (Ephemeral CoT)** : Le bloc de réflexion pas-à-pas $R_t$ est détruit dès application du patch d'état $\Delta\Sigma_t$.
- **Opérateur de Fusion ($\oplus$)** : $\Sigma_{t+1} \leftarrow \Sigma_t \oplus \Delta\Sigma_t$ (suppression par assignation `null`).

## 2. Boucles Agentiques Déterministes
- Disjoncteur systématique pour éviter toute boucle infinie (`max_iterations`).

## 3. Graphes d'État (State Graphs)
- Suivi déterministe de la navigation anatomique (vues, couches actives, repères).

## 4. Graphes de Connaissances (GraphRAG)
- Relations anatomiques : rattachement des sous-structures aux régions principales (crâne, colonne, thorax, membres).
