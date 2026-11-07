# Matrice Complète de Création Vidéo, Direction Artistique & Règles d'Or

Ce document réunit l'ensemble des règles fondamentales de conception vidéo, de motion design et de direction artistique appliquées par l'IA.

---

## 1. Principes Fondamentaux & Règles d'Or (Les 25 Règles)

1. **Moteur d'Intelligence Artificielle** :
   - L'IA utilisée pour l'analyse narrative, la planification des outils et la génération du code est **Google Gemini**, configuré avec la clé **Google AI Studio** (`google_api_key` stockée dans `07_Scripts/api_config.json`).
2. **Pas de génération d'images par l'IA** :
   - **L'IA ne doit JAMAIS générer d'images.** Toutes les images d'illustration nécessaires doivent être **fournies au départ par l'utilisateur** via l'interface d'upload.
3. **Téléchargement externe & B-Roll strictement limité à YouTube** :
   - **Aucun autre B-Roll externe que YouTube** n'est autorisé.
   - Cette étape est entièrement **modulable et non-fixe** : elle n'est déclenchée que si le prompt ou les paramètres requièrent explicitement un extrait YouTube via `07_Scripts/youtube_clip.cjs`.
4. **Options Audio autorisées & Règle Anti-Saccade** :
   - Les 4 seules options audio autorisées sont :
     - `voice_only` : Voix off seulement (narration pure via ElevenLabs ou HeyGen).
     - `music_only` : Musique seulement (bande-son d'ambiance).
     - `full_mix` : **Mix avec tout** (Voix off + Musique de fond + Effets sonores SFX) — *Option par défaut*.
     - `none` : Sans audio (vidéo muette).
   - **Règle Anti-Saccade Audio** : Dans toute fonction `syncAudioTimeline(time, isPlaying)`, ne **JAMAIS** réassigner `audio.currentTime = expected` à chaque frame. Toujours vérifier la dérive : `if (Math.abs(audio.currentTime - expected) > 0.35) { audio.currentTime = expected; }`. Sinon le navigateur réinitialise le buffer audio 60 fois par seconde et le son devient haché/saccadé.
   - **Interdiction des Sous-Titres Non Demandés** : **Ne JAMAIS générer ni incruster de boîte ou conteneur de sous-titres** si l'utilisateur ne l'a pas explicitement demandé dans son prompt.
5. **Gestion et cloisonnement des Assets** :
   - **Assets d'une chaîne** : Dossier dédié portant le nom / ID de la chaîne (ex: `01_Assets/Images/<channelId>/`).
   - **Assets des vidéos autonomes** : Suffixe aléatoire identique à 4 chiffres (ex: `image_homme-2899.png`, `voiture_jaune-2899.mp4`).
   - **Rushes clients (`Clients/`)** : Sourcing direct des rushes non montés dans `Clients/<nom_client>/`.
6. **Emplacement de Création des Vidéos (`04_Videos/` ou `03_Chaines/`) & Rôle de `05_Scenes/`** :
   - Le fichier complet est enregistré **directement dans `04_Videos/<nom_video>.html` (vidéo autonome) ou `03_Chaines/<channelId>/<nom_video>.html` (vidéo de chaîne)**.
   - Ne pas polluer `05_Scenes/` avec des fichiers individuels `scene_1...html` sauf pour les projets multi-séquences (`05_Scenes/<nom_projet>/`).
7. **Barre de Progression Dynamique** :
   - Sur `video_processus.html`, la progression s'adapte en temps réel : $\text{Progression (\%)} = \text{round}\left(\frac{\text{Index Étape Active} + 1}{\text{Total d'Étapes Actives}} \times 100\right)$.
8. **Organisation de l'Application & Dossier `09_Pages/`** :
   - Toutes les pages web sont centralisées dans `09_Pages/` (`home.html`, `create_video.html`, `studio.html`, etc.).
   - Le serveur local (`07_Scripts/studio-server.cjs`) route automatiquement les requêtes vers `09_Pages/`.
9. **Interdiction d'Overlay Parasite (Progress Bar & Timecode dans la vidéo)** :
   - **Ne JAMAIS incruster de barre de progression (`progress bar`), timecode ou compteur de frames dans la composition vidéo.**
   - Le Studio dispose déjà de ses propres contrôles professionnels externes.
10. **Zéro Copie Visuelle — Créativité 100% Originale (Anti-Plagiat & Anti-Répétition)** :
    - **NE JAMAIS inspecter ou recopier paresseusement les fichiers HTML existants dans `04_Videos/` ou `03_Chaines/`** lors de la création d'une nouvelle vidéo.
    - **NE JAMAIS reproduire les mêmes scènes ou décors d'une vidéo à l'autre** (interdiction de refaire bureau/lampe, décompte blueprint avec cadran ou dominos).
    - Chaque nouvelle composition doit avoir sa propre direction artistique, ses propres scènes narratives, ses métaphores visuelles originales (labyrinthe, escalier d'énergie en lévitation, engrenages d'horlogerie, tir à l'arc néon, etc.) et sa typographie originale créée de A à Z.
11. **Interdiction des Titrages Didactiques, Badges "PowerPoint" & Textes aux 4 Coins** :
    - **Bannissement définitif des étiquettes scolaires et diaporama** : `[ Règle 01 ]`, `[ Chapitre 1 ]`, `[ Étape 01 ]`, `[ SCÈNE 1 : ... ]`, `[ SLIDE X ]`, conteneurs `.tag-pill`. L'IA réalise des **films et vidéos cinématographiques**, JAMAIS des présentations PowerPoint.
    - **Bannissement absolu des faux textes HUD aux 4 coins du cadre** (`.hud-telemetry`, `1080p`, `TEMPO 120 BPM`, `VIBE ENGINE`, badges debug). Les 4 coins du cadre doivent impérativement rester propres, aérés et dégagés.
12. **Interdiction du Fond "Cliché IA" Répétitif (Grille + Halo Sombre)** :
    - **Ne JAMAIS systématiser le même fond stéréotypé** : quadrillage de lignes transparentes (`.grid-backdrop`) avec halo radial flou vert/cyan.
    - Varier impérativement les textures, ambiances, aplats, grains argentiques et éclairages selon l'univers thématique de chaque vidéo.
13. **Mouvement de Caméra Continu & Cadrage Dynamique Sans Zoom Débordant** :
    - Pas de plans fixes statiques sans vie. Intégrer un travelling lent continu (`slow push-in` scale 1.0 -> 1.06).
    - Zooms tactiques ciblés (`scale: 1.35`) lors d'une action clé, puis dézoom fluide.
    - **Interdiction des zooms destructeurs qui coupent les textes ou débordent du cadre.** Lisibilité à 100% en permanence.
14. **Animations Différenciées par Typologie d'Élément** :
    - Bannir l'animation unique (fade-slide générique sur tout).
    - Titres : Kinetic typography, word-by-word reveal, tracking expand.
    - Sous-titres : Smooth fade-slide vertical, blur-to-focus cinématique.
    - Cartes UI : Roulis 3D perspective (`rotateX: 15deg`, `rotateY: -10deg`), pop élastique avec inertie (`back.out(1.5)`).
    - Icônes : Rotation élastique (`rotation: -25deg` vers `0deg`), cascades.
    - Graphiques & terrains : Tracé dynamique séquentiel (`strokeDashoffset`).
15. **Rigueur de la Physique 2D & Points d'Ancrage SVG Infaillibles** :
    - Pour les objets en mouvement/rebond : séparer le conteneur de translation $Y$ (rebond, squash & stretch) de l'élément SVG interne (rotation axiale à `center center`). L'ombre au sol doit rester strictement au sol.
    - Pour les éléments rotatifs (aiguilles, jauges) : encapsuler dans un groupe pivot maître centré `<g transform="translate(cx, cy)">` et animer avec `transformOrigin: "0px 0px"`. Ne jamais utiliser `svgOrigin: "0 0"`.
16. **Charte Stricte : 3 Couleurs Max Uniques (Règle 60-30-10)** :
    - 60% Primaire (fond sombre / ambiance dominante), 30% Secondaire (surfaces `#131b2e`, bordures, texte blanc/gris), 10% Accent Unique (ex: Ambre Doré `#f59e0b` ou Cyan Électrique) appliqué aux dégradés, jauges et surbrillances.
17. **Typographie Stable (Zéro Reflow) & Centrage Carte Finale** :
    - Titres stables avec blocs `white-space: nowrap`. Ne jamais animer `scale` ou `letter-spacing` sur un titre multiligne pour éviter les sauts de ligne.
    - Carte finale de conclusion centrée au milieu absolu du viewport (`left: 50%; top: 50%; transform: translate(-50%, -50%);`).
18. **Isolation Stricte des Scènes (Zéro Superposition) & Interdiction de `!important` sur `#scene_1`** :
    - **NE JAMAIS mettre `!important` sur `#scene_1`** (bloque GSAP et fige la scène 1).
    - Masquage physique obligatoire lors des transitions : `tl.to('#scene_1', { opacity: 0, duration: 0.4 }, t - 0.4).set('#scene_1', { display: 'none', visibility: 'hidden' }, t)`.
    - Initialisation GSAP stricte à $t = 0$.
19. **Centrage Géométrique des Grilles de Cartes & Suivi SVG Sub-Pixel (`path.getPointAtLength`)** :
    - Conteneurs de cartes centrés avec `margin: 0 auto; justify-content: center; max-width: 1480px`.
    - Points traceurs sur courbes animés via `path.getPointAtLength(p * totalLength)`.
20. **Templates GSAP Standardisés & Assemblage Modulaire (Lego Blocks)** :
    - **Interdiction de concevoir des cartes, boutons ou compteurs "from scratch" avec du design médiocre.** L'IA doit obligatoirement puiser dans la bibliothèque de templates GSAP (`.agents/skills/My_Skills/gsap_templates/SKILL.md`) :
      - *Bento Glass Cards (3D Tilt & Glow)* pour les arguments et caractéristiques.
      - *Metric Counter Cards* avec chiffres animés et micro-courbes SVG tracées.
      - *Shimmer Buttons* avec onde lumineuse rotative.
      - *Split-Words Kinetic Titles* pour les titres majeurs.
    - Cartes animées de façon séquentielle une à une à la suite avec fondus directionnels et easings calibrés (`power3.out`, `back.out(1.5)`).
    - Ne jamais réutiliser la même boucle musicale préexistante ; composer une bande-son originale sur mesure adaptée au rythme.
21. **Intégration Vidéo HTML5 & B-Roll (Contrat Studio & Zéro Saccade)** :
    - Toute balise `<video>` DOIT comporter `data-start="T_DEBUT" data-end="T_FIN" data-duration="DUREE" muted loop playsinline preload="auto"`.
    - Non-ingérence JS en mode Studio (`isIframeMode === true`) : le Studio gère automatiquement `play()`, `pause()` et le scrubbing.
22. **Interdiction Formelle de Dessiner un Logo (Obligation de Téléchargement Officiel)** :
    - **L'IA ne doit JAMAIS dessiner ou inventer un logo de marque en code** (aucun bricolage ou approximation SVG faite maison).
    - Tout logo doit être **téléchargé sous sa forme officielle** (SVG vectoriel officiel ou PNG transparent haute définition) dans `01_Assets/Logos/` via `node 07_Scripts/brandfetch.cjs <domaine>` ou sourcing officiel certifié.
    - **Si le téléchargement est impossible**, l'IA doit impérativement **s'arrêter et prévenir l'utilisateur** afin que celui-ci fournisse lui-même l'asset logo officiel.

23. **Règle Stricte des Couleurs de Texte & Titres à l'Écran (2 Couleurs Max)** :
    - **Le titre ou tout bloc de texte affiché à l'écran ne doit JAMAIS avoir plus de 2 couleurs.** Interdiction formelle d'utiliser 3 couleurs ou plus sur un même bloc typographique (bannissement du texte arc-en-ciel / multicolore).
    - **Palette typographique autorisée :**
      - Option A : **Texte bicolore contrasté** : Texte principal en blanc (ou teinte neutre) avec un mot-clé ou chiffre d'impact dans la couleur d'accent (ex: blanc + rouge, blanc + ambre, blanc + cyan).
      - Option B : **Dégradé bicolore** : Dégradé fluide entre 2 teintes uniquement (`background: linear-gradient(135deg, #ffffff 0%, #ef4444 100%)`).
    - Cette règle garantit un impact visuel net, professionnel et une lisibilité instantanée en moins de 100 ms.

24. **Bannissement Formel du Fond "Espace / Cosmique" en 3D & 4 Fonds Autorisés Uniquement** :
    - **INTERDICTION FORMELLE ET ABSOLUE** de générer des arrière-plans de type "espace", "cosmos", "galaxie", "particules cosmiques flottantes" ou halos sombres sci-fi sur les scènes 3D Three.js.
    - **Les 4 seuls types d'arrière-plans 3D autorisés sont :**
      1. **Fond Blanc Pur Studio** (`#ffffff` ou `#f8fafc`) avec ombre de contact douce (`contact shadow`) au sol — Style épuré Apple / Design produit haut de gamme.
      2. **Fond Noir Pur Minimaliste** (`#000000` ou `#050505` sans étoiles ni halos parasites) — Style cinéma OLED premium et contrasté.
      3. **Fond de Couleur Unie** (ex: vert menthe `#2a9d8f`, terracotta `#e07a5f`, bleu ardoise uni, crème chaud) — Style isométrique pop et contemporain.
      4. **Fond Dégradé Lumineux** (ex: dégradé doux vertical blanc vers gris perle `#ffffff` $\rightarrow$ `#e2e8f0`, ou dégradé clair pastel lumineux) — Ambiance studio daylight lumineuse et propre.
    - L'univers visuel 3D doit rester sobre, net, moderne et professionnel sans jamais tomber dans le cliché spatial.


25. **Design System Vidéo Universel, Padding Cadre Harmonisé (16:9 & 9:16) & Règle Anti-Chevauchement** :
    - **Zéro Chevauchement & Zéro Collision (Zero-Collision Layout)** : Un texte, une illustration, un sujet 2D/3D (comme la tête géante Stickman), un cadran, une carte Bento ou un bouton CTA ne doivent **JAMAIS se heurter, se chevaucher ou se couper accidentellement**. Chaque module a sa zone réservée avec un espace de respiration minimal de **48px à 120px** entre éléments distincts. Bannir tout contour rectangulaire massif qui enferme ou traverse les sujets visuels.
    - **Zéro Débordement de Texte & Largeur Dynamique des Conteneurs** : Tout texte logé dans un conteneur (bouton, card, pillule, badge, que ce soit en HTML ou Canvas 2D) **DOIT impérativement dimensionner sa largeur à son contenu** (`cardWidth = textWidth + padding * 2` avec au minimum 32px à 40px de marge interne de chaque côté). **Le texte ne doit sous aucun prétexte toucher ou déborder des limites de sa card.**
    - **Padding Cadre Harmonisé (80px Standard)** : Les marges de scène sont obligatoires et régulières quel que soit le format :
      - **16:9 Paysage (1920×1080)** : `padding: 60px 80px 70px 80px;` (marge latérale symétrique de 80px).
      - **9:16 Vertical (1080×1920)** : `padding: 140px 80px 180px 80px;` (même marge latérale de 80px + safe-zones UI plateformes).
    - **Design System Agnostique (Structure, Échelle et Cohérence sans imposer de couleur ou police)** :
      - *Architecture en 3 Slots verticaux* : Slot 1 (Haut / Hook), Slot 2 (Centre / Hero 3D ou Carte), Slot 3 (Bas / CTA ou Sous-titres).
      - *Spacing Scale modulaire* : basé sur une grille de 8px (8px, 16px, 24px, 32px, 48px, 64px, 80px). Zéro valeur au hasard.
      - *Hiérarchie Typographique à 3 niveaux* : Titre ($\\times 2.2$ à $\\times 2.8$ du sous-titre), Sous-titre ($\\times 1.4$ à $\\times 1.6$), Corps / Badges ($1\\times$).
      - *Rayon de courbure unique (`--radius-card`)* partagé par toutes les cartes de la vidéo (24px–32px ou 40px–48px). Badges à 999px.
      - *Règle 60-30-10 structurelle* : 60% surface neutre de fond, 30% cartes et structure, 10% accentuation unique. Maximum 2 couleurs par bloc de texte.

26. **Synchronisation Audio Stable & Anti-Saccades (Format MP3 & Zéro Seek en Pleine Lecture)** :
    - **Format Audio Obligatoire** : Toujours utiliser des fichiers audio compressés `.mp3` (192 kbps) mis en cache RAM intégrale par le navigateur. Bannir formellement les fichiers lourds `.wav` non compressés qui créent des stalls de streaming et des micro-coupures.
    - **Règle d'or de Lecture Continue (`playing === true`)** : **NE JAMAIS réassigner `audio.currentTime`** pour de simples micro-fluctuations d'horloge (< 1.2s). Réassigner `currentTime` pendant la lecture force Chromium à purger son buffer audio matériel, générant un micro-silence/saccade audible ! Ne réaligner en cours de lecture que si le drift dépasse **1.5 seconde** ou lors d'un saut explicite (`seek`).
    - **Pause & Scrubbing** : Lorsque l'utilisateur met en pause ou déplace manuellement le curseur de timeline, mettre à jour `audio.currentTime` immédiatement.

27. **Ancrage Physique Strict des Ombres Portées au Sol (Ground-Pinning & Zéro Ombre Flottante)** :
    - **L'Ombre reste au Sol** : Une ombre portée au sol doit **TOUJOURS rester ancrée sur le sol (`groundY = 820`)**.
    - **Zéro Rotation d'Ombre** : **INTERDICTION ABSOLUE** d'intégrer l'ombre à l'intérieur de la matrice de transformation (`ctx.rotate()`) d'un personnage qui saute ou pivote en l'air. L'ombre ne doit JAMAIS tourner avec le corps ni flotter dans les airs à l'envers sous les pieds d'un joueur en suspension ou lors d'un ciseau !
    - **Atténuation avec l'Altitude** : Lorsque le personnage s'élève en altitude, son ombre reste au sol à `(x, groundY)`, s'estompe en opacité (`alpha` décroît avec l'altitude) et diffuse en taille.

28. **Biomécanique & Cohérence Vectorielle du Geste Sportif (Retourné Acrobatique / Ciseau)** :
    - Pour toute figure acrobatique (ciseau retourné, bicyclette), la cinématique doit respecter l'orientation exacte du terrain et du but :
      - **Bascule de la Tête vers le But** : Si le but est à droite (+X), le joueur a le dos au but. Lors de l'impulsion, sa tête tombe **vers la droite** (rotation horaire du corps vers +X), et non vers la gauche à contresens.
      - **Trajectoire Horaire du Pied de Frappe ("Aiguille d'une Montre")** : Le pied de tir part d'en bas/gauche et effectue une rotation horaire de la gauche vers la droite pour fouetter le ballon et le catapulter vers la lucarne adverse.
      - **Retombée Complète & Atterrissage au Sol** : Un joueur en suspension ne doit JAMAIS rester figé en l'air après son tir ! Il retombe sur le terrain (altitude -> 0), atterrit sur le dos sur la pelouse (groundY = 820), amortit avec les bras puis célèbre au sol sur le gazon (buste redressé, poings levés au ciel) bien cadré sans chevauchement avec les bannières d'habillage.

29. **Ancrage Physique du Contact au Sol (Grounding Invariant & Zéro Vol en Course)** :
    - **Loi Inviolable du Contact au Sol** : Pour tout personnage debout, marchant ou courant sur la pelouse, **le pied d'appui (Stance Foot) DOIT obligatoirement être en contact direct avec la ligne de sol (`groundY = 820px`)**.
    - **Interdiction Formelle du "Vol en Courant"** :
      - Lors d'une course, l'altitude de vol est STRICTEMENT NULLE (`altitude = 0`). Le personnage court sur le gazon, et non dans les airs !
      - Calcul mathématique de l'origine : Avec un pivot de rotation au bassin (`translate(0, -65)`) et des jambes de hauteur 185px, la base au sol doit être `basePivotY = groundY - 120 = 700px` pour que les crampons touchent exactement la pelouse à `820px`.
    - **Cinématique d'Impulsion** : Le personnage ne peut décoller en altitude (> 0) qu'APRÈS sa phase d'appel au sol (flexion des genoux / impulsion musculaire).
    - **Cinématique d'Atterrissage** : Après tout saut ou figure aérienne, le personnage retombe au sol jusqu'à ce que son altitude revienne strictement à 0 sur la pelouse.

  * **Règle 30 : Fondu de Fin Obligatoire (Vidéo & Musique / Outro Fade Out)** :
    - **OBLIGATION SYSTÉMATIQUE SUR TOUTES LES VIDÉOS** : Chaque composition vidéo générée doit impérativement comporter un fondu de sortie (*Fade Out*) sur les 2.5 à 4 dernières secondes.
    - **Fondu Vidéo** : Fondu progressif vers le noir (`rgba(0, 0, 0, alpha)`) ou vers le blanc studio (`rgba(255, 255, 255, alpha)`) selon le mode, où `alpha = clamp((t - (duration - fadeTime)) / fadeTime, 0, 1)`.
    - **Fondu Audio Musical** : La piste musicale de fond (`audioBgm`) doit obligatoirement baisser son volume progressivement jusqu'à 0 (`audioBgm.volume = baseVol * clamp((duration - t) / fadeTime, 0, 1)`). Aucune vidéo ne doit se terminer par une coupure nette ou brutale du son ou de l'image.

---

## 2. Boîte à Outils de l'IA (`07_Scripts/`)

| Script | Rôle | Commande |
| :--- | :--- | :--- |
| `studio-server.cjs` | Serveur local de l'application Studio (port 3000) | `node 07_Scripts/studio-server.cjs` |
| `ai_director.cjs` | Orchestrateur IA du pipeline complet de création | `node 07_Scripts/ai_director.cjs --prompt "..."` |
| `render.cjs` | Rendu MP4 headless via Puppeteer et FFmpeg (**SUR DEMANDE EXPLICITE UNIQUEMENT**) | `node 07_Scripts/render.cjs <chemin_html> [format]` |
| `generate_voice.cjs` | Synthèse vocale IA ElevenLabs réaliste | `node 07_Scripts/generate_voice.cjs "<texte>" <sortie_mp3>` |
| `youtube_clip.cjs` | Recherche, extraction et transcription d'extraits vidéo YouTube | `node 07_Scripts/youtube_clip.cjs --download <url> --start 00:01:10 --end 00:01:25` |
| `transcribe_subtitles.cjs`| Calage temporel mot-à-mot des sous-titres | `node 07_Scripts/transcribe_subtitles.cjs <audio> <texte>` |
| `brandfetch.cjs` | Extraction de logos officiels de marques (SVG / PNG) | `node 07_Scripts/brandfetch.cjs <domaine>` |
| `fetch_map.cjs` | Génération de cartes géographiques HD sans watermark (5 styles: dark, voyager, light, satellite, osm) | `node 07_Scripts/fetch_map.cjs --query "Paris, France" [--style dark]` |
| `fetch_flag.cjs` | Téléchargement de drapeaux nationaux & territoriaux (SVG vectoriel & PNG gratuits) | `node 07_Scripts/fetch_flag.cjs <pays>` |
| `fetch_music.cjs` | Téléchargement de musiques libres de droit par genre / ambiance | `node 07_Scripts/fetch_music.cjs <genre> <dossier_sortie>` |
| `normalize_audio.cjs` | Normalisation sonore aux normes broadcast (-14 LUFS) | `node 07_Scripts/normalize_audio.cjs <entree> <sortie>` |
| `remove_bg.cjs` | Détourage automatique d'images | `node 07_Scripts/remove_bg.cjs <image>` |
| `fetch_3d_model.cjs` | Téléchargement de modèles 3D réalistes (.glb/.gltf) avec fallback multi-sources | `node 07_Scripts/fetch_3d_model.cjs --query "<mot_cle>"` |
