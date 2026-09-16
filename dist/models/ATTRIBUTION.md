# Modèle anatomique de Skelet

Source : Z-Anatomy, SkeletalSystem100.fbx, MuscularSystem100.fbx et NervousSystem100.fbx, dépôt de Lluís Vinent Juanico.
https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/SkeletalSystem100.fbx

Z-Anatomy — The open source atlas of anatomy — CC BY-SA 4.0.
Gauthier Kervyn et les contributeurs de Z-Anatomy.
https://creativecommons.org/licenses/by-sa/4.0/

BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan (crédit conservé du fichier source).
La base BodyParts3D est désormais diffusée sous CC BY 4.0, selon https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html.
Les fichiers dérivés Z-Anatomy ici restent sous CC BY-SA 4.0.

Adaptations réalisées pour Skelet : sélection des géométries osseuses, dentaires et cartilagineuses par leurs matériaux ; exclusion des objets d’annotation ; conversion FBX vers GLB ; transformations appliquées aux sommets ; conversion des centimètres en mètres ; indexation des sommets identiques ; suppression des textures ; séparation du crâne pour le chargement web. Aucun filtre de décimation des triangles. Les matériaux sont remplacés par un matériau uniforme pour la lecture.

Les 271 objets de la couche squelettique ne correspondent pas à un décompte de 271 os : ils incluent des dents, cartilages et surfaces internes. Les couches supplémentaires contiennent 482 structures musculaires (avec des tendons et portions de muscles) et 251 structures nerveuses (avec racines, plexus et branches). L’atlas est un modèle générique ; il n’est ni une reconstruction du corps de l’utilisateur ni un dispositif de diagnostic. L’exactitude clinique et l’exhaustivité des détails ne sont pas certifiées par Skelet.

Licence source complète : SOURCE-LICENSE.txt. Tous les modèles adaptés GLB : CC BY-SA 4.0. Les notices du dépôt signalent aussi « Cranial Nerves and Foramina » — University of Dundee, CAHID — CC BY 4.0 ; ce crédit est conservé pour la couche des nerfs crâniens. Les modèles du cerveau, de l’oreille interne et des organes ne sont pas intégrés.

Compression web : Meshoptimizer, quantification des positions sur 16 bits par maillage, normales sur 12 bits, couleurs sur 8 bits. La compression n’est donc pas numériquement sans perte ; aucun filtre de simplification des triangles n’est appliqué. Les nombres de triangles et identifiants anatomiques ont été comparés avant/après conversion ; voir compression-report.json. Les couleurs distinguent les muscles des tendons. Les coordonnées communes aux trois fichiers source sont conservées, sans recalage manuel.

SHA256 des fichiers source :
- SkeletalSystem100.fbx : 294A649765CD060A62A4095DA52B9C8EF2D97769AA447E196448AA5F7D596DEA
- MuscularSystem100.fbx : 4C19DF534D5D84AABBCE08604306AA0485B43E8A2483C72A95B569E1DFEA2279
- NervousSystem100.fbx : 3EA1AAD64956CAD27348A27B8FB50494B7CC307C6BC77BEE0810EC2A67DFF2B1

Moteur : Three.js 0.180.0, MIT ; licence incluse dans /vendor/LICENSE.
