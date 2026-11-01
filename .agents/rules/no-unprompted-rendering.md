# Règle Absolue : Interdiction Formelle de Déclencher un Rendu Vidéo Sans Demande Explicite

> [!CAUTION]
> **RÈGLE CRITIQUE DE RESSOURCES & CYCLE DE VIE** :
> L'IA a l'interdiction formelle et absolue d'exécuter un rendu vidéo (`render.cjs`, appel API `/api/render`, capture headless Puppeteer ou encodage FFmpeg vers MP4) **sans que l'utilisateur n'ait formulé une demande explicite et directe**.

---

## 1. Ce qui est Strictement Interdit à l'IA

* ❌ **Ne JAMAIS exécuter `node 07_Scripts/render.cjs` de sa propre initiative** après avoir créé, modifié ou réparé une vidéo ou une scène HTML.
* ❌ **Ne JAMAIS appeler la route de rendu `/api/render`** de manière autonome en arrière-plan.
* ❌ **Ne JAMAIS présumer qu'une demande de création implique un rendu immédiat** :
  - Si l'utilisateur demande : *"Crée une vidéo sur...", "Fais-moi une vidéo...", "Ajoute une scène...", "Corrige l'animation..."* :
    ➡️ L'IA doit concevoir la composition HTML/CSS/GSAP/Three.js, générer les assets nécessaires (audio, images, données) et mettre à disposition la page interactive dans `04_Videos/` ou `03_Chaines/`.
    ➡️ **L'IA NE DOIT PAS lancer le rendu MP4 !**

---

## 2. Pourquoi cette Règle est Impérative

1. **Saturation CPU / GPU & Blocage de la Machine** :
   Le moteur de rendu lance un navigateur Chrome headless (Puppeteer), capture image par image à 60 FPS et encode via FFmpeg. Cela mobilise l'intégralité des processeurs et fige la réactivité de la machine pendant plusieurs minutes.
2. **Poids & Pollution Disque** :
   Chaque export MP4 pèse des dizaines voire des centaines de mégaoctets dans `08_Rendus/`. Générer un MP4 non demandé sature inutilement le stockage.
3. **Cycle d'Itération Rapide** :
   La force de l'architecture VibeEditor réside dans la prévisualisation instantanée dans le navigateur ou dans l'application Electron à 60 FPS avec timeline interactive. L'utilisateur doit pouvoir visualiser, ajuster la physique, peaufiner les animations et valider le résultat dans le player interactif **AVANT** de décider d'exporter.

---

## 3. Seules Situations Autorisant le Rendu

L'IA est autorisée à lancer `render.cjs` **UNIQUEMENT ET EXCLUSIVEMENT** si l'utilisateur formule un ordre clair et explicite tel que :
- *« Lance le rendu »*
- *« Exporte la vidéo en MP4 »*
- *« Fais le rendu de la vidéo X »*
- *« Convertis en MP4 »*

Dans tous les autres cas : **créer/éditer la composition HTML, vérifier son rendu dans le studio interactif, et fournir le lien ou chemin du fichier à l'utilisateur.**

