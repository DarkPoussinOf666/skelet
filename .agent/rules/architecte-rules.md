# Règles Spécifiques de l'Architecte

1. **Modularité Stricte :** Tout nouveau composant doit avoir une responsabilité unique.
2. **WebGL Prudence :** Libérer systématiquement les géométries et matériaux supprimés (`geometry.dispose()`, `material.dispose()`) pour éviter les fuites de mémoire GPU.
3. **Pérennité du Stockage :** Valider tout changement de clé ou de format dans `localStorage` par une stratégie de rétro-compatibilité.
