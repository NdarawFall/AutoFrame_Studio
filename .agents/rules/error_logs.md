# Registre des Erreurs et Pièges Évités (Error Logs)

Ce document répertorie les erreurs, pièges et régressions commis par l'IA sur ce projet afin de ne plus jamais les reproduire.

---

## 📌 Consignes pour l'IA

1. **Consultation obligatoire** : L'IA doit toujours prendre en compte les leçons consignées ici avant de générer du code ou modifier la structure du projet.
2. **Auto-alimentation** : Dès qu'une erreur récurrente, un bug de conception ou une correction importante est soulevée par l'utilisateur ou constatée lors des tests, l'IA doit **immédiatement ajouter une entrée** dans ce document selon le modèle ci-dessous.

---

## 📝 Modèle d'entrée

```markdown
### [YYYY-MM-DD] — Titre court de l'erreur
* **Problème / Symptôme** : Ce qui ne fonctionnait pas ou ce qui a été mal fait.
* **Cause technique** : La raison pour laquelle l'erreur est survenue.
* **Règle à respecter impérativement** : Ce qu'il faut faire / ne pas faire pour l'éviter définitivement.
```

---

## 🗂️ Historique des Erreurs Recensées

### [2026-10-27] — Rigueur 2D : Géométrie des Ballons, Continuité du Terrain & Symétrie des Cartes
* **Problème / Symptôme** :
  1. Ballon de football 2D déformé avec des polygones mal placés et une physique de rebond molle.
  2. Scène 2 : terrain affiché sous forme d'un fragment partiel sans transition claire, avec lignes disjointes.
  3. Scène 2 (s=11) : cartes de tailles asymétriques, surcharge de couleurs et fond sans contraste franc.
  4. Scène 3 : remplacement brutal du terrain de football par un rectangle gris générique ("carré pourri") et passe mal alignée.
* **Cause technique** :
  - Manque de rigueur géométrique dans les polygones SVG et coordonnées calculées approximativement.
  - Rupture de continuité scénique : réinvention d'un conteneur différent pour chaque scène au lieu de réutiliser le même terrain de football.
  - Mauvaise gestion de la symétrie des cartes UI (largeurs et hauteurs disparates, couleurs non harmonisées).
* **Règle à respecter impérativement** :
  - **Géométrie SVG & Physique 2D** : Les objets emblématiques (comme un ballon de football) doivent être construits avec une géométrie vectorielle mathématiquement exacte (pentagone central régulier, pièces rayonnantes symétriques, ombrage sphérique 3D réaliste). L'animation de chute doit respecter la gravité (`power2.in`) avec squash & stretch franc à l'impact (`scaleX: 1.25, scaleY: 0.75`) et synchronisation de l'ombre au sol.
  - **Terrain de football** : Toujours partir du **rectangle vert pelouse** complet aux vraies proportions (~105m x 68m) avec bandes de tonte, puis animer les **lignes BLANCHES** à l'intérieur. Toutes les lignes doivent se toucher avec une précision millimétrique (périmètre fermé, médiane qui touche les deux bords, surfaces raccordées à la ligne de but).
  - **Continuité scénographique** : Si une vidéo traite d'un sujet comme le football, **réutiliser le MÊME terrain vert** d'une scène à l'autre plutôt que de basculer sur des boîtes grises disparates.
  - **Symétrie & Contraste des Cartes UI** : Deux cartes comparatives doivent être **rigoureusement jumelles** (mêmes dimensions en pixels, même padding, même border-radius). Leur fond doit trancher nettement avec le fond global de la vidéo et du terrain (fond sombre `#0f172a` sur vidéo blanche/verte), avec une palette de couleurs sobre et unifiée.
  - **Trajectoires vectorielles** : Les lignes de passe ou de tir doivent relier au pixel près les centres des pions/joueurs, avec animation du ballon qui roule réellement le long du vecteur.

---

### [2026-10-27] — Verrouillage et Neutralisation Totale des Animations et Balises Vidéo/Audio dans le Studio
* **Problème / Symptôme** : Des animations GSAP, vidéos HTML5 ou sons démarraient automatiquement sans appui sur "Play", ou reprenaient leur course folle pendant le déplacement du curseur de la timeline (scrubbing), écrasant le contrôle du Studio.
* **Cause technique** :
  1. Les timelines GSAP créées avec `paused: false` ou sans paramètre possèdent leur propre ticker 60 FPS autonome qui redémarrait dès un appel `seek()`.
  2. Les balises `<video>` et `<audio>` avec attribut `autoplay` ou déclenchées par script n'étaient pas interceptées par le Studio.
  3. `seekVideoInIframe()` ne mettait pas en pause les balises `<video>` ni `gsap.globalTimeline`.
* **Règle à respecter impérativement** :
  - **Dans `studio.html`** :
    - Utiliser `freezeIframe(targetTime)` pour forcer la pause de `win.gsap.globalTimeline`, de toute timeline active, de toutes les balises `<video>` et `<audio>`, des Web Animations (`doc.getAnimations()`) et des animations SVG SMIL.
    - Intercepter `HTMLMediaElement.prototype.play` dans l'iframe pour interdire formellement tout démarrage audio/vidéo tant que `isPlaying === false`.
    - Placer des gardes-fous répétés (à 60ms, 150ms, 300ms, 600ms, 1000ms, 1500ms) lors du chargement de l'iframe pour neutraliser tout script tiers asynchrone qui tenterait de lancer la lecture de son propre chef.
    - Lors du scrubbing (`handleScrub`, `mousedown`, `mousemove`, `mouseup`) et des sauts de frames, forcer l'état paused et geler immédiatement l'iframe à la position demandée.
  - **Dans les compositions HTML** :
    - Les timelines GSAP doivent être initialisées avec `{ paused: isIframeMode }` (`const isIframeMode = window.self !== window.top;`).
    - Exposer `window.__timeline` avec `seek(t)`, `play()`, `pause()`, et `duration()`.

---

### [2026-10-27] — Interdiction Formelle de Déclencher le Rendu Vidéo MP4 Sans Autorisation Explicite
* **Problème / Symptôme** : L'IA a lancé d'elle-même la commande de rendu `render.cjs` en arrière-plan sans que l'utilisateur ne l'ait expressément demandé.
* **Cause technique** : Zèle de l'IA voulant tester la chaîne complète jusqu'au fichier MP4.
* **Règle à respecter impérativement** :
  - **INTERDICTION STRICTE ET ABSOLUE DE DÉCLENCHER LE RENDU VIDÉO (`render.cjs` ou API de rendu)** sans l'ordre direct et explicite de l'utilisateur.
  - L'utilisateur effectue lui-même ses rendus directement depuis le Studio / Chrome via le bouton "Rendu", ou demande expressément à l'IA d'en lancer un par écrit.
  - L'IA doit uniquement créer et tester le code de la composition HTML dans `04_Videos/` ou `03_Chaines/`.

---

### [2026-10-27] — Débordement et Décalage du Cadre 16:9 dans le Player du Studio
* **Problème / Symptôme** : La composition vidéo HTML dépassait du cadre du lecteur et était tronquée/décentrée.
* **Cause technique** :
  1. Manque de `left: 50%; top: 50%;` sur `#stage` couplé à un `transform: translate(-50%, -50%)`, ce qui décalait le canvas de -960px et -540px vers le coin haut-gauche.
  2. Le lecteur du Studio applique déjà la résolution native (1920x1080) sur l'iframe et gère lui-même la mise à l'échelle via `previewFrame.style.transform = scale(...)`.
* **Règle à respecter impérativement** :
  - Dans les compositions vidéo HTML :
    - `#stage` doit avoir `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 1920px; height: 1080px; overflow: hidden;`.
    - La fonction d'auto-scale `handleResize()` ne doit modifier que le facteur `scale()` en préservant scrupuleusement `translate(-50%, -50%)`.
    - `html, body` doivent avoir `width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden;`.

---

### [2026-10-26] — Auto-play spontané des compositions vidéo HTML (Handwriting & SVG)
* **Problème / Symptôme** : La vidéo démarrait et s'animait d'elle-même dans le Studio dès son chargement, sans que l'utilisateur n'ait cliqué sur "Play".
* **Cause technique** :
  1. Présence d'une boucle `previewLoop` avec `requestAnimationFrame` autonome active dès le chargement du script.
  2. Les balises SVG SMIL (`<animate>`) s'exécutent par défaut dès le chargement du DOM si elles ne sont pas figées.
* **Règle à respecter impérativement** :
  - **Ne jamais insérer de boucle d'animation automatique autonome (`requestAnimationFrame`)** dans les compositions vidéo HTML.
  - Le contrôle temporel doit être **100% passif et déterministe**, piloté uniquement par les appels `window.__timeline.seek(t)`.
  - Pour les SVG avec SMIL (`<animate>`), exécuter immédiatement `svg.pauseAnimations()` et `svg.setCurrentTime(0)` au chargement de la page.
  - Bannir les transitions CSS (`transition: all ...`) sur les propriétés directement interpolées par la timeline (pour garantir un rendu frame-by-frame exact à 60 FPS).

---

### [2026-10-26] — Emplacement des Skills vs Règles dans `.agents`
* **Problème / Symptôme** : Création d'un dossier `skills/` à l'intérieur de `.agents/`.
* **Cause technique** : Confusion sur l'emplacement réservé aux compétences personnalisées.
* **Règle à respecter impérativement** :
  - Le dossier `.agents/` est **strictement réservé aux règles** (`.agents/rules/`).
  - Aucun skill ne doit être placé dans `.agents/`. Tous les skills du projet doivent se trouver exclusivement dans [`00_Skills/`](../../00_Skills).

---

### [2026-10-26] — Bouton "Créer une Vidéo" dans les menus de navigation
* **Problème / Symptôme** : Le bouton "Créer une Vidéo" n'était pas situé en dernier à droite et n'avait pas sa couleur distinctive rouge.
* **Cause technique** : Ordre non uniforme des liens de navigation selon les pages.
* **Règle à respecter impérativement** :
  - Sur toutes les barres de menu et de navigation (`home.html`, `channels.html`, `channel.html`, `create_video.html`, `settings.html`, `studio.html`), le bouton **"Créer une Vidéo" doit TOUJOURS être positionné en dernier à droite**.
  - Son apparence doit obligatoirement avoir un **fond rouge (`#dc2626`)** et un **texte blanc (`#ffffff`)** avec les classes `.btn-create-video` ou `.btn-create-video-studio`.

---

### [2026-10-26] — Modal de confirmation affiché par défaut en bas de page
* **Problème / Symptôme** : Un modal de confirmation apparaissait en bas de la page `channel.html` dès son ouverture sans aucun clic.
* **Cause technique** : Omission des styles CSS pour `.modal-overlay` (`display: none`, `position: fixed`, etc.), laissant le modal dans le flux normal du document.
* **Règle à respecter impérativement** :
  - Tout modal personnalisé doit systématiquement avoir sa classe de base `.modal-overlay { display: none; position: fixed; inset: 0; ... }` et ne devenir visible que par ajout de la classe `.open` (`display: flex`).

---

### [2026-10-26] — Timecode et lecture fantôme dans le Studio sans vidéo chargée
* **Problème / Symptôme** : En ouvrant le Studio sans aucune vidéo active, le timecode affichait 40 secondes et appuyer sur Play faisait défiler le curseur sur un écran vide.
* **Cause technique** : Variables globales `duration` et `totalFrames` initialisées avec des valeurs en dur (`duration = 40.0; totalFrames = 1200;`) et timecode HTML hardcodé.
* **Règle à respecter impérativement** :
  - Sans vidéo active ou chargée, `duration` et `totalFrames` doivent valoir `0`.
  - Le timecode doit afficher `00:00:00 / 00:00:00` et `Frame 0 / 0`.
  - La fonction de lecture (`step`, `togglePlayPause`) doit bloquer tout défilement si `totalFrames <= 0` ou si aucune vidéo n'est chargée.

---

### [2026-10-26] — Ségrégation des vidéos avec chaîne (`03_Chaines/`) vs sans chaîne (`04_Videos/`)
* **Problème / Symptôme** : Toutes les vidéos étaient mélangées dans un seul dossier, rendant difficile la gestion par chaîne.
* **Cause technique** : Absence d'un dossier racine dédié aux chaînes utilisateurs.
* **Règle à respecter impérativement** :
  - Les vidéos rattachées à une chaîne sont enregistrées dans `03_Chaines/<channelId>/`.
  - Les vidéos rapides sans chaîne sont enregistrées dans `04_Videos/`.
  - L'API `/api/files` et les scripts doivent scanner les deux emplacements pour alimenter la bibliothèque du Studio et les filtres de la page chaînes.

---

### [2026-10-27] — Liste des vidéos vide dans le Studio (ReferenceError escapeHtml)
* **Problème / Symptôme** : L'utilisateur ouvre le Studio et ne voit aucune vidéo dans l'onglet "Mes Vidéos", l'écran reste noir ou sur skeleton.
* **Cause technique** :
  1. Utilisation de la fonction helper `escapeHtml(...)` dans le rendu JS (`renderVideosUI`, `renderRendusUI`) sans qu'elle ne soit définie dans le script de `studio.html`.
  2. L'erreur `ReferenceError: escapeHtml is not defined` interrompait silencieusement la boucle de construction des cartes vidéo et la sélection automatique dans le lecteur.
  3. Le panneau droit était masqué avec la classe `collapsed` par défaut et le bouton s'appelait "Compositions" au lieu de "Vidéos".
* **Règle à respecter impérativement** :
  - Toujours s'assurer que les fonctions utilitaires globales comme `escapeHtml` sont déclarées en tête de script dans **tous** les fichiers HTML qui l'utilisent.
  - Le volet latéral des vidéos du Studio doit être ouvert par défaut (`sidePanelRight` sans `collapsed`) et le bouton d'en-tête doit porter le libellé explicite **"Vidéos"**.

---

### [2026-10-27] — Absence d'audio dans le lecteur du Studio lors de la prévisualisation
* **Problème / Symptôme** : En jouant la vidéo HTML dans le Studio via le bouton "Play" ou la barre d'espace, les animations et sous-titres défilent mais aucun son / aucune voix off n'est audible.
* **Cause technique** :
  1. L'iframe du lecteur (`<iframe id="previewFrame">`) ne possédait pas l'attribut `allow="autoplay"`. Les navigateurs modernes (Chrome, Edge) bloquent strictement toute lecture sonore issue d'une iframe sans cette politique.
  2. Le moteur de lecture de `studio.html` (`startPlayback`) avançait le timecode et appelait `seek(t)` sur la timeline GSAP, mais n'ordonnait pas à l'élément `<audio>` ou à la fonction `window.play()` de l'iframe de démarrer la lecture.
  3. Le serveur local `studio-server.cjs` ne déclarait pas `.mp3` dans ses `MIME_TYPES` et ne gérait pas les en-têtes HTTP 206 Range (`Accept-Ranges: bytes`), bloquant le décodage et le streaming par le navigateur.
* **Règle à respecter impérativement** :
  - **Iframe de prévisualisation** : Toujours inclure `<iframe id="previewFrame" src="about:blank" allow="autoplay"></iframe>`.
  - **Contrôle audio Studio ↔ Iframe** : Lors du clic sur Play / Pause dans le Studio, notifier obligatoirement l'iframe (`win.play()`, `win.pause()`, et `win.syncAudioTimeline(time, isPlaying)`).
  - **Compositions vidéo HTML avec audio** : Exposer `window.syncAudioTimeline = (t, isPlaying) => ...` et veiller à ce que `tl.seek(t)` synchronise la piste audio de manière non-bloquante avec `audio.play().catch(() => {})`.
  - **Serveur local de développement** : Supporter obligatoirement les types MIME audio (`.mp3`: `audio/mpeg`, `.wav`: `audio/wav`) et le streaming partiel HTTP 206 (`Range: bytes=start-end`) indispensable pour les balises HTML5 `<audio>` et `<video>`.

---

### [2026-10-27] — Latence d'affichage des chaînes et des logos (Base64 lourd & attente window.load)
* **Problème / Symptôme** : Temps de latence perceptible au clic sur la page "Chaînes" et lors de l'ouverture d'une chaîne spécifique (logo et cartes qui tardent à apparaître).
* **Cause technique** :
  1. **Taille démesurée de `channels.json` (4 Mo)** : L'avatar d'une chaîne était stocké sous forme de chaîne Base64 brute 4K (~4 Mo) directement dans le fichier JSON. Chaque requête réseau et chaque `JSON.parse` bloquait le thread principal du navigateur.
  2. **Attente de l'événement `window.load`** : L'exécution du script attendait la fin du téléchargement complet des polices distantes Google Fonts avant de commencer à charger les données.
  3. **Requêtes séquentielles au lieu de parallèles** : `fetch('/api/channels')` puis `fetch('/api/files')` étaient appelés à la suite avec deux `await` au lieu d'un `Promise.all`.
  4. **Absence d'hydratation immédiate** : Les pages n'affichaient rien avant le retour de la requête réseau au lieu d'utiliser le cache `localStorage`.
* **Règle à respecter impérativement** :
  - **Jamais de gros Base64 dans les JSON de métadonnées** : Extraire automatiquement les avatars et images téléversés sous forme de fichiers réels dans `01_Assets/Images/channels/` et ne stocker que leur chemin relatif dans `channels.json`.
  - **Hydratation instantanée (0 ms)** : Toujours injecter immédiatement les données depuis `localStorage` dès la première ligne du `<script>`, puis rafraîchir en tâche de fond.
  - **Ne pas attendre `window.load`** pour les initialisations de données UI.
  - **Requêtes réseau parallèles** : Toujours regrouper les appels de données avec `Promise.all([fetch(...), fetch(...)])`.

---

### [2026-10-28] — Points d'Ancrage 2D SVG, Zooms Hors-Cadre & Éradication des Titrages Didactiques IA Slop
* **Problème / Symptôme** :
  1. Dans les animations 2D SVG (ex: aiguilles d'horloge), les éléments subissent des dérives ou volent dans tous les sens au lieu de pivoter autour du centre exact.
  2. Présence de zooms de caméra surdimensionnés sur des panneaux complets ou des cartes avec texte, coupant le texte hors de l'écran 9:16 ou débordant du cadre.
  3. Titres et badges au style "IA Slop" didactique et scolaire (ex: `[ PSYCHOLOGIE DU TEMPS ]`, `[ THÉORIE DE PAUL JANET ]`, `[ NEUROSCIENCES & COGNITION ]`, `[ L'ANTIDOTE PRATIQUE ]`) dégradant l'impact narratif et la crédibilité visuelle.
* **Cause technique** :
  1. En SVG standard, transformer un `<line>` vertical (`x1="160" x2="160"`) avec un `transform-origin: 160px 160px` ou `50% 50%` échoue car une ligne droite a une bounding-box de largeur 0 (`width: 0`). GSAP ou le moteur CSS calcule mal ou réinitialise le centre de rotation relatif.
  2. Un `scale` appliqué sur un conteneur UI plein écran dépasse la hauteur maximale autorisée de l'écran (1920px), rognant les textes en haut et en bas.
  3. L'IA générative produit par défaut des titres descriptifs façon PowerPoint/exposé scolaire plutôt que du storytelling percutant orienté rétention courte (Shorts).
* **Règle à respecter impérativement** :
  - **Points d'Ancrage SVG 100% Infaillibles** :
    - Encadrer tout élément rotatif SVG dans un groupe pivot maître : `<g transform="translate(centerX, centerY)">`.
    - Placer l'élément enfant relativement à `(0, 0)` : `<g id="secondHand"><line x1="0" y1="20" x2="0" y2="-120" ... /></g>`.
    - Dans GSAP, animer le groupe enfant avec `transformOrigin: "0px 0px"`. Zéro décalage, pivot mathématique absolu.
  - **Gestion Rapprochée / Zoom Caméra** :
    - Ne JAMAIS zoomer sur un bloc UI complet qui occupe déjà > 60% de la hauteur de l'écran sous peine de masquer du texte.
    - Pour mettre en valeur un détail (ex: une ligne spécifique), animer un highlight localisé (halo lumineux, bordure néon, scale localisé de 1.04 max) SANS zoom de conteneur global.
  - **Éradication Totale des Titrages IA Slop** :
    - Bannir formellement les pilules thématiques didactiques (`tag-pill`) du type `[ THEME ]`, `[ PSYCHOLOGIE DU TEMPS ]`, `[ THÉORIE DE X ]`.
    - Utiliser un copywriting viscéral, direct et axé sur le spectateur (ex: "À 8 ANS, L'ÉTÉ EST INFINI. À 30 ANS, L'ANNÉE S'ÉVAPORE.").

---

### [2026-10-28] — Reflow Typographique du Titre, Bâtons Parasites d'Horloge, Centrage Carte Finale & Charte 3 Couleurs
* **Problème / Symptôme** :
  1. En début de vidéo, le titre s'affiche sur 3 lignes puis repasse sur 2 lignes pendant l'animation avec un sursaut visuel très visible.
  2. Présence de traits parasites ("d'autres bâtons qui s'envolent") dans l'horloge vectorielle.
  3. Dans la scène finale, la carte de conclusion avec sous-titre apparaît décentrée vers le bas au lieu d'être au milieu de l'écran.
  4. Manque d'harmonie colorimétrique : multiplicité de couleurs changeant à chaque scène (jaune, bleu cyan, violet, vert).
* **Cause technique** :
  1. Utilisation de `scale: 0.92` et `letterSpacing: 0.04em` animés vers `-0.01em` sur un titre multiligne avec taille de police hétérogène (6.2rem et 0.72em). L'écartement temporaire forçait le dernier mot à passer à la ligne suivante avant de revenir en arrière (reflow intempestif).
  2. Présence d'un groupe `#s1SpeedRays` avec des balises `<line>` animées en rotation qui donnaient l'illusion de bâtons détachés volant dans l'horloge.
  3. Les éléments précédents de la scène (`.action-pillars-column`) étaient masqués avec `opacity: 0` sans `display: none`, occupant toute la hauteur et repoussant la carte finale vers le bas.
  4. Absence d'une charte stricte limitée à 3 couleurs uniques (60-30-10).
* **Règle à respecter impérativement** :
  - **Titres Cinétiques Sans Reflow** :
    - Définir une taille unique et homogène pour le titre (`font-size: 5.0rem`).
    - Structurer explicitement chaque ligne dans un `span` bloc : `<span class="title-line">` avec `display: block; white-space: nowrap;`.
    - Ne JAMAIS animer `scale` ou `letterSpacing` sur un titre multiligne textuel : n'animer que `opacity` et `y` (translation verticale).
  - **Horloge Vectorielle & Aiguilles Propres** :
    - Supprimer tout rayon ou trait parasite décentré (`speedRays`). L'horloge ne contient QUE les 3 aiguilles pures.
    - Toutes les aiguilles partent de `(0, 0)` : `x1="0" y1="0" x2="0" y2="-longueur"`.
    - Recouvrir l'axe `(0, 0)` par un capuchon solide (`circle r="13"`) pour qu'aucun ergot ou base d'aiguille ne dépasse.
    - Toutes les aiguilles tournent dès le début autour de l'axe central (`svgOrigin: "0 0"`).
  - **Centrage Absolu des Cartes de Révélation Finale** :
    - Encapsuler la carte et son sous-titre dans un conteneur positionné en absolu au centre géométrique du canvas : `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);`.
  - **Charte Stricte des 3 Couleurs Max Uniques (Règle 60-30-10)** :
    - Toute vidéo doit utiliser strictement 3 couleurs du début à la fin :
      - 60% Couleur Primaire : Fond sombre `#0a0f1d`.
      - 30% Couleur Secondaire : Surfaces de cartes `#131b2e` / bordures `#1e293b`, texte `#ffffff` & `#94a3b8`.
      - 10% Couleur d'Accent UNIQUE : ex. Ambre Doré `#f59e0b` / `#fbbf24` pour TOUS les reflets, mots-clés, lueurs et icônes.





