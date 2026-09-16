# Règles Spécifiques du Développeur

1. **Vérification Systématique :** Toujours exécuter `npm run check` après modification de script JS.
2. **Gestion d'Erreurs :** Envelopper les accès au DOM et au `localStorage` dans des blocs `try/catch` explicites informant l'utilisateur via l'élément d'état (`role="status"`).
3. **Style de Code :** Adopter un code lisible, documenté et aéré (bannir les lignes ultra-longues non commentées).
