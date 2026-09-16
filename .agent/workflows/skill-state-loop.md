# Boucle d'Exécution Procédurale SKILL.state (skill-state-loop.md)

1. **Chargement de l'état $\Sigma_t$** : Récupérer l'état courant depuis `20_Data_et_Bases/state_schema.json`.
2. **Évaluation contextuelle** : Recevoir le triplet $A_t = (P, \Sigma_t, O_t)$.
3. **Calcul de la transition** : Générer le patch $\Delta\Sigma_t$ et l'action atomique $a_t$.
4. **Application déterministe** : $\Sigma_{t+1} \leftarrow \Sigma_t \oplus \Delta\Sigma_t$.
5. **Purge du raisonnement éphémère** : Détruire $R_t$ pour maintenir l'empreinte de prompt en $O(1)$.
