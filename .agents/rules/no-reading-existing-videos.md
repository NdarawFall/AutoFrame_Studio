# Règle : Originalité Totale, Direction Artistique & Anti-Patterns IA

Cette règle s'applique impérativement à toute IA assistant sur ce projet.

## 1. Interdiction stricte de lecture et de copie visuelle
* **NE JAMAIS inspecter, lire (`read_file`), prévisualiser ou fouiller (`run_command`, grep)** dans les fichiers HTML existants du dossier `04_Videos/` ou des sous-dossiers de `03_Chaines/`.
* **NE JAMAIS recopier visuellement une vidéo ou un composant déjà existant sur le projet** : Chaque nouvelle composition doit avoir sa propre direction artistique, ses propres scènes, ses propres visuels vectoriels/motion et sa typographie originale inventée de A à Z.
* Les dossiers `04_Videos/` et `03_Chaines/` sont **exclusivement des dossiers de dépôt** où enregistrer les nouvelles créations.

## 2. Interdiction Absolue des Titrages Scolaires, Badges "PowerPoint" & Tags Didactiques IA Slop
* **BANNISSEMENT DÉFINITIF des étiquettes didactiques, des tags de catégorie et de la numérotation scolaire des scènes** :
  - **INTERDIT** : Insérer en haut de scène des badges ou pilules comme `[ Règle Fondamentale • 01 ]`, `[ Lois du Jeu • 02 ]`, `[ Étape 01 ]`, `[ Chapitre 1 ]`, `[ Définition ]`, `[ PSYCHOLOGIE DU TEMPS ]`, `[ THÉORIE DE PAUL JANET ]`, `[ NEUROSCIENCES & COGNITION ]`, `[ L'ANTIDOTE PRATIQUE ]`, etc.
  - **INTERDIT** : Les conteneurs de type `.tag-pill` ou badges thématiques placés au-dessus du titre pour "expliquer" la matière académique.
  - **Raison** : Une vidéo n'est **PAS une présentation PowerPoint**, ni un cours magistral sur diapositives. Ce genre de titrage "scolaire/robotique" est une signature typique d'une IA paresseuse qui détruit l'immersion vidéo et fait chuter le taux de rétention sur TikTok/Shorts/Reels.
  - **Ce qu'il faut faire à la place** : Utiliser des accroches narratives percutantes, du storytelling visuel, des mots-clés cinétiques intégrés naturellement dans l'action, des titres de scènes immersifs (comme dans un documentaire Vox, une publicité Nike ou une vidéo YouTube de créateur de premier plan).

## 3. Interdiction du Fond "Cliché IA" Répétitif (Grille + Halo Sombre Vert/Cyan)
* **BANNISSEMENT DÉFINITIF du fond générique répétitif** :
  - **INTERDIT** : Utiliser systématiquement le même arrière-plan composé d'une grille CSS (`.grid-backdrop` avec traits 1px semi-transparents) superposée à un fond sombre (`#04070c` / `#090d16`) et à des halos radiaux floutés récurrents (`.ambient-glow` vert/cyan).
  - **Raison** : Cela donne l'impression que toutes les vidéos sortent du même moule stéréotypé et manquent d'identité visuelle.
  - **Ce qu'il faut faire à la place** : Chaque sujet doit avoir son identité scénographique propre :
    - Textures et motifs thématiques adaptés au sujet (grain argentique, aplats typographiques contrastés, éclairages studio de scène, silhouettes vectorielles, palettes colorimétriques chaudes, pastel, monochrome, néo-brutalisme ou minimalisme élégant).
    - Varier la luminosité, la profondeur, les contrastes et les atmosphères selon l'émotion du sujet traité.

## 4. Mouvement de Caméra Continu & Cadrage Dynamique (Continuous Camera Motion)
* **INTERDIT : Les plans fixes statiques sans vie.** Une scène où rien ne bouge au niveau du cadre est ennuyeuse.
* **INTERDIT : Les zooms destructeurs qui coupent les textes ou débordent du canevas.** Ne JAMAIS zoomer sur un grand tableau de bord, une liste de cartes ou un conteneur UI plein écran si cela fait sortir le texte de la zone visible (1080x1920 ou 1920x1080). Le zoom doit préserver 100% de la lisibilité des textes et l'intégrité du cadrage.
* **RÈGLE OBLIGATOIRE : La caméra doit être vivante et dynamique en permanence** :
  - **Zoom tactique / Macro-focus** : Lorsqu'une action clé a lieu (ex: un hors-jeu, une passe, une signature, un graphique), zoomer franchement sur la zone d'intérêt (`scale: 1.35` ou `1.5` avec `transformOrigin` ciblé), puis dézoomer de façon fluide à la fin de l'action.
  - **Mise en valeur sans zoom global** : Pour focaliser l'attention sur un élément d'une liste déjà serrée, animer un halo lumineux, une bordure néon, ou une micro-mise en avant locale (`scale: 1.04`), sans altérer l'échelle du conteneur parent.
  - **Travelling cinématique continu (Slow Push-in)** : Même lors d'un dialogue ou d'un affichage de titre, maintenir une très légère poussée continue de la caméra (`scale: 1.0` vers `1.06`) pour garder l'œil captivé.
  - **Pans & Shakes d'impact** : Accompagner les impacts forts (frappe en lucarne, explosion de texte, notification) d'un micro-recul ou d'une secousse de caméra (`camera shake` de 3-5px sur 0.15s).

## 5. Animations Différenciées par Typologie d'Élément (Finie l'Animation Unique)
* **INTERDIT : Appliquer la même animation générique (fade-in + slide-up) à tous les éléments de la scène.**
* **RÈGLE OBLIGATOIRE : Chaque typologie d'élément a sa signature d'animation propre** :
  - **Titres Principaux** : Kinetic typography percutante, word-by-word reveal, tracking/kerning expand, punchy scale + skew, slam/impact avec micro-secousse.
  - **Sous-titres & Narrations** : Smooth fade-slide vertical progressif, typewriter subtil, ou blur-to-focus cinématique épuré.
  - **Cartes & Surfaces UI** : Roulis 3D perspective (`rotateX: 15deg`, `rotateY: -10deg` $\rightarrow$ 0), pop élastique avec inertie (`back.out(1.5)`), ombre portée qui se détache du sol en même temps que la carte s'élève.
  - **Icônes & Badges** : Rotation élastique (`rotation: -25deg` vers `0deg`), pulse d'accentuation, micro-bounce en cascade.
  - **Éléments Vectoriels (Terrains, Graphiques, Schémas)** : Tracé dynamique séquentiel (`strokeDashoffset`), éclosion géométrique, déploiement mécanique coordonné.

## 6. Rigueur de la Physique 2D & Points d'Ancrage SVG Infaillibles
* **INTERDIT : Les aiguilles et vecteurs qui partent dans tous les sens à cause d'un point d'ancrage instable.**
  - En SVG, une balise `<line>` verticale a une largeur de boîte englobante de 0 (`width: 0`). Définir `transformOrigin` ou `transform-origin` sur la ligne provoque un échec géométrique systématique.
  - **Règle Pivot Obligatoire** : Encapsuler l'élément rotatif dans un groupe pivot maître centré `<g transform="translate(cx, cy)">`, puis tracer l'aiguille/élément dans un sous-groupe relatif à `(0, 0)`. Dans GSAP, animer le sous-groupe avec `transformOrigin: "0px 0px"`.
* **INTERDIT : Les flips chaotiques où l'ombre se retrouve au plafond ou le ballon tourne à l'envers.**
* **RÈGLE OBLIGATOIRE : Séparer strictement le conteneur de translation verticale du conteneur de rotation** :
  - L'animation de rotation (`rotation: 360`) doit s'appliquer **exclusivement sur l'élément SVG/graphique interne centré** (`transform-origin: center center`).
  - L'animation de chute et de rebond ($Y$, squash & stretch `scaleX`/`scaleY`) s'applique sur le conteneur parent.
  - L'ombre au sol **doit rester strictement sur le plan horizontal du sol** sous le point de contact, en s'élargissant et s'assombrissant à chaque impact, sans jamais se retourner ni se dissocier.

## 7. Interdiction Formelle des Barres de Progression et Timelines Incrustées
* **NE JAMAIS ajouter de barre de progression interne (progress bar) au bas ou en haut de la vidéo.**
* **NE JAMAIS ajouter de timecode, compteur de frames ou boîte de timeline incrustée dans un coin de la vidéo.**
* **Raison** : La composition HTML est une vidéo pure destinée à l'exportation et à la lecture dans le Studio ([`09_Pages/studio.html`](../../09_Pages/studio.html)). Le Studio dispose déjà de son propre scrubber, de sa timeline multipiste et de ses compteurs professionnels. Tout affichage de debug ou d'overlay interne pollue le cadrage et ruine le rendu final.

## 8. Architecture Technique des Compositions
* Pour une vidéo sans chaîne : écrire directement dans `04_Videos/<nom_de_la_nouvelle_video>.html`.
* Pour une vidéo rattachée à une chaîne : écrire dans `03_Chaines/<channelId>/<nom_de_la_nouvelle_video>.html`.
* Les animations doivent être pilotées par GSAP avec `const isIframeMode = window.self !== window.top; const tl = gsap.timeline({ paused: isIframeMode });` et exposer `window.__timeline = { duration: () => D, seek: (t) => tl.seek(t, false), pause: () => tl.pause(), play: () => tl.play() };`.

## 9. Charte Harmonique Stricte : 3 Couleurs Max Uniques (Règle 60-30-10)
* **INTERDIT : Changer de palette de couleurs d'une scène à l'autre** (ex: jaune puis cyan puis violet puis vert).
* **RÈGLE OBLIGATOIRE : Toute vidéo est construite sur exactement 3 couleurs uniques** :
  - **60% Couleur Primaire (Fond)** : Le fond sombre ou neutre dominant (ex: `#0a0f1d`).
  - **30% Couleur Secondaire (Surfaces & Textes)** : Cartes `#131b2e` / bordures `#1e293b`, texte principal blanc `#ffffff` et texte secondaire `#94a3b8`.
  - **10% Couleur d'Accent UNIQUE (Identité Visuelle)** : UNE seule couleur signature (ex: Ambre Doré `#f59e0b` / `#fbbf24`) pour TOUS les reflets, mots-clés, lueurs, icônes et jauges.

## 10. Typographie Stable (Zéro Reflow) & Centrage Absolu des Cartes Finales
* **INTERDIT : Animer `scale` ou `letterSpacing` sur des titres multilignes** car cela provoque un passage de 2 à 3 lignes puis un retour à 2 lignes (effet de saut disgracieux).
* **RÈGLE OBLIGATOIRE :**
  - Conserver une **taille unique et homogène** pour les titres (`font-size: 5.0rem`).
  - Découper chaque ligne dans un span bloc distinct : `<span class="title-line">` avec `display: block; white-space: nowrap;`.
  - Animer uniquement `opacity` et `y` (translation verticale).
* **Centrage de la Carte Finale :** Toujours positionner le conteneur de la carte de révélation finale au centre absolu de l'écran (`position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);`).
