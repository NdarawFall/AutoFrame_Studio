# Architecture & Matrice des Étapes de Création Vidéo (IA Pipeline)

## 1. Principes Fondamentaux & Règles d'Or

1. **Moteur d'Intelligence Artificielle** :
   - L'IA utilisée pour l'analyse narrative, la planification des outils et la génération du code est **Google Gemini**, configuré avec la clé **Google AI Studio** (`google_api_key` stockée dans `07_Scripts/api_config.json`).
2. **Pas de génération d'images par l'IA** :
   - **L'IA ne doit JAMAIS générer d'images.** Toutes les images d'illustration nécessaires doivent être **fournies au départ par l'utilisateur** via l'interface d'upload.
3. **Téléchargement externe & B-Roll strictement limité à YouTube** :
   - **Aucun autre B-Roll externe que YouTube** n'est autorisé.
   - Cette étape est entièrement **modulable et non-fixe** : elle n'est déclenchée que si le prompt ou les paramètres requièrent explicitement un extrait YouTube via `07_Scripts/youtube_clip.cjs`.
4. **Options Audio autorisées** :
   - L'ancienne option « Voix off + Musiques » est **supprimée**.
   - Les 4 seules options audio autorisées sont :
     - `voice_only` : Voix off seulement (narration pure).
     - `music_only` : Musique seulement (bande-son d'ambiance).
     - `full_mix` : **Mix avec tout** (Voix off + Musique de fond + Effets sonores SFX) — *Option par défaut*.
     - `none` : Sans audio (vidéo muette).
5. **Gestion et cloisonnement des Assets** :
   - **Assets d'une chaîne** : Pour identifier qu'un asset appartient à une chaîne, on se base exclusivement sur **le dossier** dans lequel il réside, qui porte le nom / ID de la chaîne (ex: `01_Assets/Images/<channelId>/`, `01_Assets/Voix_Off/<channelId>/`, etc.).
   - **Assets des vidéos sans chaîne (autonomes)** : Lors de l'upload d'un média pour une vidéo autonome, un **suffixe aléatoire identique à 4 chiffres** est automatiquement généré pour la vidéo et apposé à la fin du nom de chaque fichier avant son extension (ex: `image_homme-2899.png`, `voiture_jaune-2899.mp4`, etc.) pour garantir la traçabilité et éviter toute collision.
   - **Rushes & Vidéos Brutes Clients (`10_Clients/`)** : En tant qu'éditeur de formats courts (Shorts, Reels, TikTok), l'utilisateur dépose les vidéos brutes non montées de ses clients dans `10_Clients/<nom_client>/`. Ce dossier est ignoré par Git pour la confidentialité et le stockage. L'IA source directement les rushs clients depuis cet emplacement lors de l'assemblage et du montage.
6. **Emplacement de Création des Vidéos (`04_Videos/` ou `03_Chaines/`) & Rôle de `05_Scenes/`** :
   - Quand l'IA génère une vidéo, le fichier complet est enregistré **directement dans `04_Videos/<nom_video>.html` (vidéo autonome) ou dans `03_Chaines/<channelId>/<nom_video>.html` (vidéo de chaîne)**.
   - **Il n'y a PAS besoin de décomposer une vidéo normale en fichiers de scènes dans `05_Scenes/`**. L'IA ne doit pas polluer `05_Scenes/` avec des fichiers individuels `scene_1_...html`, `scene_2_...html`.
   - **Usage exclusif de `05_Scenes/`** : Le dossier `05_Scenes/` est réservé **uniquement** aux projets multi-séquences où plusieurs sous-vidéos ou plans distincts sont produits pour être assemblés en une vidéo maîtresse. Dans ce cas spécifique, un sous-dossier dédié est créé dans `05_Scenes/<nom_projet>/`.
7. **Barre de Progression Dynamique** :
   - La barre de progression sur `video_processus.html` n'est pas figée sur 8 étapes : elle s'adapte en temps réel au nombre effectif $N$ d'étapes actives :
     $$\text{Progression (\%)} = \text{round}\left(\frac{\text{Index Étape Active} + 1}{\text{Total d'Étapes Actives}} \times 100\right)$$
8. **Organisation de l'Application & Dossier `09_Pages/`** :
   - Toutes les pages de l'application web sont désormais centralisées dans `09_Pages/` (`home.html`, `create_video.html`, `studio.html`, `channel.html`, `channels.html`, `channel_settings.html`, `settings.html`, `video_processus.html`).
   - La commande `npm run studio` (ou `npm start`) lance le serveur local et ouvre automatiquement la page d'accueil `http://localhost:3000/09_Pages/home.html` au lieu de `studio.html`.
   - Le serveur local (`07_Scripts/studio-server.cjs`) route intelligemment les requêtes racine et de pages vers `09_Pages/` avec réacheminement transparent des assets.
9. **Interdiction d'Overlay Parasite (Progress Bar & Timecode dans la vidéo)** :
   - **Ne JAMAIS incruster de barre de progression (`progress bar`) ni de timecode/timeline dans le coin de la vidéo**.
   - Le Studio ([`studio.html`](../../09_Pages/studio.html)) intègre déjà l'interface de contrôle universelle (scrubber, timer, play/pause). L'espace de la composition doit rester 100% pur et prêt à la diffusion.
10. **Zéro Copie Visuelle — Créativité 100% Originale** :
   - **Ne JAMAIS recopier visuellement une vidéo ou un composant existant sur le projet**.
   - Pour chaque sujet demandé, concevoir des graphismes 2D, des animations de texte, des icônes SVG animées, des dynamiques spatiales et des palettes colorimétriques sur mesure adaptées au thème.
11. **Interdiction des Titrages Didactiques, Badges Type "PowerPoint" & Textes aux 4 Coins** :
   - **Ne JAMAIS ajouter d'étiquettes scolaires ou de pilules didactiques** (ex: `[ Règle 01 ]`, `[ Chapitre 1 ]`, `[ Étape 01 ]`, conteneurs `.tag-pill`).
   - **BANNISSEMENT ABSOLU DES TEXTES AUX 4 COINS DU CADRE** : Ne jamais coller de textes, timecodes, résolutions ou faux indicateurs HUD aux 4 coins de l'écran (top-left, top-right, bottom-left, bottom-right type `.hud-telemetry`, `VIBE ENGINE // v1.0`, `TEMPO 120 BPM`, `RES 1080p`, etc.). Les 4 coins du cadre doivent impérativement rester 100% vides et dégagés pour bannir l'effet "diaporama PowerPoint".
   - Une vidéo n'est pas un diaporama PowerPoint ni un cours magistral. Les titrages doivent être narratifs, percutants et intégrés au storytelling vidéo (façon Vox, documentaire ou pub dynamique) avec du copywriting axé sur le spectateur.
12. **Interdiction du Fond "Cliché IA" Répétitif (Grille + Halo Sombre)** :
   - **Ne JAMAIS systématiser le même fond stéréotypé** : quadrillage de lignes transparentes (`.grid-backdrop`) sur fond noir/sombre avec halo radial flou vert/cyan.
   - Varier impérativement les textures de fond, les éclairages, les aplats de couleurs, le grain, ou les ambiances visuelles selon l'univers thématique de chaque vidéo.
13. **Mouvement de Caméra Continu & Cadrage Dynamique Sans Zoom Débordant** :
   - Ne jamais laisser de plans fixes statiques sans vie. Intégrer un travelling lent continu (`push-in` ou `pan`), des zooms tactiques dynamiques (`scale: 1.35` sur l'action clé comme un hors-jeu ou un focus produit) et dézoomer à la fin de l'action.
   - **INTERDIT : Les zooms démesurés qui rognent le texte ou débordent du cadre.** Si un tableau ou un panneau UI occupe déjà la majorité de la hauteur verticale (ex: Short 9:16), ne JAMAIS appliquer de zoom d'échelle global qui coupe le texte hors de l'écran. Utiliser des accents de lumière localisés (lueur, bordure néon) sans modifier l'échelle du conteneur.
14. **Animations Différenciées par Typologie d'Élément** :
   - Bannir l'animation unique répétitive (fade-slide générique sur tout). Donner une signature propre à chaque élément : kinetic text pour les titres, smooth fade pour les sous-titres, perspective tilt 3D et pop élastique pour les cartes, rotation élastique pour les icônes, tracé séquentiel pour les graphismes vectoriels.
15. **Rigueur de la Physique 2D & Points d'Ancrage SVG Infaillibles** :
   - Pour les objets tournants et rebondissants (ballon, pièce), séparer le conteneur de translation $Y$ (rebond + squash & stretch) de l'élément SVG interne (rotation axiale à `center center`). L'ombre au sol doit rester strictement au sol sous le point de contact.
   - **Pour tout élément vectoriel rotatif SVG (aiguilles d'horloge, jauges, boussoles)** : Les balises `<line>` ont une bounding box de largeur nulle. Toujours ancrer la ligne à son centre réel `(cx, cy)` et animer dans GSAP en fournissant les coordonnées réelles du centre : `svgOrigin: "${cx} ${cy}"` (ex: `svgOrigin: "180 180"`). INTERDICTION FORMELLE d'écrire `svgOrigin: "0 0"`, qui fait voltiger l'aiguille hors du cadran.
16. **Charte Stricte : 3 Couleurs Max Uniques (Règle 60-30-10)** :
   - Toute vidéo doit respecter une palette de 3 couleurs uniques maximales : 60% Primaire (fond sombre), 30% Secondaire (cartes `#131b2e` / bordures `#1e293b`, texte blanc & gris), 10% Accent Unique (ex: Ambre Doré `#f59e0b` / `#fbbf24`) appliqué à tous les dégradés, icônes, jauges et surbrillances.
17. **Typographie Stable (Zéro Reflow) & Centrage Carte Finale** :
   - Utiliser une taille de police unique pour les titres (`font-size: 5.0rem`) avec des spans découpés en blocs `white-space: nowrap`. Ne jamais animer `scale` ou `letter-spacing` sur un titre multiligne pour bannir tout saut de ligne (passage de 2 à 3 lignes).
   - La carte finale de conclusion doit être centrée au milieu absolu du viewport (`position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);`).
18. **Isolation Stricte des Scènes (Zéro Superposition) & Interdiction de `!important` sur `#scene_1`** :
   - **NE JAMAIS mettre `!important` sur `#scene_1`** dans le CSS ou dans les attributs `style=""` en ligne. Le mot-clé `!important` bloque GSAP et force la scène 1 à rester affichée en permanence sur tout le long de la vidéo.
   - **Masquage physique obligatoire (`display: none`) lors des transitions** :
     Chaque scène sortante doit recevoir `tl.to('#scene_1', { opacity: 0, duration: 0.4 }, timeCut - 0.4).set('#scene_1', { display: 'none', visibility: 'hidden' }, timeCut)`.
   - **Initialisation GSAP à t=0** :
     `tl.set('#scene_1', { display: 'flex', opacity: 1, visibility: 'visible' }, 0).set(['#scene_2', '#scene_3'], { display: 'none', opacity: 0, visibility: 'hidden' }, 0);`
     Cela garantit qu'aucun résidu de la scène 1 ne reste affiché derrière les scènes 2 ou 3.
19. **Centrage Géométrique des Grilles de Cartes & Suivi SVG Sub-Pixel (`path.getPointAtLength`)** :
    - Pour les conteneurs de cartes en grille (notamment 3 cartes), toujours spécifier `margin: 0 auto; justify-content: center;` avec une largeur maximale explicite (`max-width: 1480px`). Ne jamais laisser de décalage vers la droite ou la gauche.
    - Pour les graphiques avec point traceur le long d'une courbe SVG, **interdiction absolue d'interpoler des points linéaires disjoints qui font des "sauts"**. Toujours utiliser `path.getPointAtLength(p * totalLength)` pour un ancrage continu et fluide au millième de pixel près.
20. **Animation des Cards (Fondus Directionnels Purs & Séquentiel) & Musique Créée de Toute Pièce** :
    - Pour les cartes (cards), bannir formellement les rotations 3D déformantes ou les inclinaisons agressives. Utiliser des fondus directionnels purs (haut, bas, côtés). Si plusieurs cartes sont présentes dans une même scène, elles doivent impérativement s'animer **une à une à la suite de façon séquentielle distincte**.
    - Les néons/gradients d'arrière-plan doivent avoir une opacité marquée (~0.45 à 0.55) et un mouvement dynamique organique continu.
    - Ne jamais réutiliser la même boucle musicale préexistante. Composer une bande-son originale sur mesure adaptée au sujet et au rythme (via `music.py`).
21. **Intégration Vidéo HTML5 & B-Roll : Contrat Studio, Attributs Déclaratifs (`data-start`, `data-end`) et Zéro Saccade** :
    - Toute balise `<video>` insérée dans une scène DOIT OBLIGATOIREMENT porter ses attributs temporels natifs : `<video id="..." src="..." data-start="T_DEBUT" data-end="T_FIN" data-duration="DUREE" muted loop playsinline preload="auto"></video>`.
    - **Ne JAMAIS omettre `data-start`** : sans lui, le Studio calcule un décalage erroné depuis $t = 0$ et force `video.currentTime` 60 fois par seconde, ce qui gèle la vidéo ou la fait sauter en boucle !
    - **Non-ingérence JS en mode Studio (`isIframeMode === true`)** : le Studio pilote automatiquement la lecture et l'arrêt dès que la tête de lecture passe sur la scène. Le script de composition ne doit JAMAIS appeler `video.play()`, `video.pause()` ni modifier `video.currentTime` quand `isIframeMode` est vrai.
    - **B-roll d'action réelle continue (60 FPS)** : Bannir impérativement les clips promotionnels ou institutionnels qui sont en réalité des diaporamas de photos fixes découpées. Exiger une vraie prise de vue continue avec mouvement physique (athlètes, véhicules, caméra).
    - **Interdiction formelle des étiquettes factices / AI Slop** : Ne jamais ajouter de stickers « LIVE BROADCAST », « DIRECT TV » ou faux logos télévisés non demandés.

---

## 2. Boîte à Outils de l'IA (`07_Scripts/`)

L'IA s'appuie sur la suite de scripts utilitaires disponibles localement dans `07_Scripts/` :

| Script | Fonctionnalité & Cas d'Usage | Déclencheur / Condition |
| :--- | :--- | :--- |
| **`youtube_clip.cjs`** | Téléchargement et découpage précis d'un extrait vidéo YouTube ciblé. | Présence d'un lien YouTube ou mention d'un clip YouTube dans le prompt. |
| **`brandfetch.cjs`** | Récupération de logos d'entreprises ou de marques (SVG / PNG transparents). | Mention d'un logo de marque ou d'entreprise dans le prompt. |
| **`fetch_map.cjs`** | Génération de cartes géographiques interactives / statiques et tracés d'itinéraires. | Mots-clés géographiques : *carte, map, itinéraire, pays, ville, trajet*. |
| **`remove_bg.cjs`** | Détourage et suppression automatique de l'arrière-plan sur les images fournies. | Directive utilisateur : *détourer, fond transparent, sans fond, remove bg*. |
| **`generate_voice.cjs`** | Synthèse vocale de haute qualité (ElevenLabs / Gemini TTS). | Option audio avec voix (`voice_only`, `full_mix`) et absence de voix uploadée. |
| **`transcribe_subtitles.cjs`** | Transcription audio mot-à-mot et alignement temporel des sous-titres. | Sous-titres activés et présence d'une piste vocale narrative. |
| **`build_video_handwriting.cjs`** | Animation de texte à effet écriture manuscrite réaliste. | Style whiteboard ou directive d'écriture manuscrite. |
| **`render.cjs`** | Rendu MP4 headless via Puppeteer et assemblage FFmpeg. | Exportation finale de la composition vidéo. |

---

## 3. Matrice Exhaustive des Étapes Conditionnelles du Pipeline

Toutes les étapes du pipeline sont modulables et évaluées dynamiquement selon les facteurs du projet :

| ID Étape | Intitulé & Description | Facteur Déclencheur / Condition d'Activation |
| :--- | :--- | :--- |
| **`step_prompt`** | 🧠 **Analyse sémantique par Gemini (Google AI Studio)**<br>Découpage narratif des scènes, analyse du rythme et sélection des outils requis. | **Toujours actif** |
| **`step_template`** | 📐 **Inspection du Template & Extraction des Patterns**<br>Lecture des règles de mise en page dans `06_Templates/`. | **Actif si** `useTemplate === true` ou style $\neq$ `none` |
| **`step_brandkit`** | 🏷️ **Application du Brand Kit de la Chaîne**<br>Couleurs de marque, typographies locales/système et logo de la chaîne. | **Actif si** `channelId` est présent (vidéo rattachée à une chaîne) |
| **`step_youtube`** | 📹 **Téléchargement d'extrait YouTube (`youtube_clip.cjs`)**<br>Extraction et découpage du seul type de B-Roll autorisé (YouTube). | **Actif si** lien YouTube ou demande explicite de clip YouTube |
| **`step_logo`** | 🏢 **Extraction de Logo Officiel (`brandfetch.cjs`)**<br>Récupération automatique du logo vectoriel ou HD d'une marque. | **Actif si** le prompt mentionne un logo d'entreprise ou de marque |
| **`step_map`** | 🗺️ **Génération de Carte Géographique (`fetch_map.cjs`)**<br>Création d'une carte ou d'un tracé d'itinéraire dynamique. | **Actif si** le prompt requiert une carte, un trajet ou une localisation |
| **`step_rembg`** | ✂️ **Détourage d'Image (`remove_bg.cjs`)**<br>Suppression du fond sur les visuels importés pour isoler les sujets. | **Actif si** détourage demandé (*fond transparent, sans fond*) |
| **`step_user_assets`** | 📂 **Indexation des Assets Utilisateur**<br>Vérification et liaison des images fournies au départ (**l'IA ne crée pas d'images**). | **Toujours actif** (les images doivent être fournies au départ) |
| **`step_voice_tts`** | 🎙️ **Synthèse Vocale IA (`generate_voice.cjs`)**<br>Génération vocale ElevenLabs / Gemini avec le timbre configuré. | **Actif si** audio = `voice_only` ou `full_mix` **ET** aucune voix utilisateur uploadée |
| **`step_voice_user`** | 🎧 **Calage & Normalisation de la Voix Off Fournie**<br>Mesure de la durée exacte, filtrage et calage de la voix uploadée. | **Actif si** un fichier voix off utilisateur est présent |
| **`step_music`** | 🎵 **Composition & Mixage de la Musique d'Ambiance**<br>Sélection, ducking automatique sous la narration et fondus. | **Actif si** audio = `music_only` ou `full_mix` |
| **`step_sfx`** | 🔊 **Sound Design & Bruitages de Transition (SFX)**<br>Whooshes, impacts et ponctuations sonores dynamiques. | **Actif si** audio = `full_mix` ou demande de SFX dans le prompt |
| **`step_subtitles`** | 📝 **Synchronisation des Sous-Titres (`transcribe_subtitles.cjs`)**<br>Alignement temporel mot-à-mot et habillage typographique. | **Actif si** `subtitles === true` **ET** voix présente (`voice_only` ou `full_mix`) |
| **`step_scenes`** | 🧩 **Génération des Scènes Modulaires (`05_Scenes/`)**<br>Conception et écriture indépendante de chaque scène de la timeline. | **Toujours actif** |
| **`step_gsap_code`** | 🎬 **Assemblage Final dans la Vidéo Unique (GSAP / Canvas)**<br>Compilation de toutes les scènes de `05_Scenes/` en une seule vidéo finale fluide. | **Toujours actif** |
| **`step_disk_save`** | 💾 **Enregistrement physique dans l'Arborescence**<br>Écriture dans `03_Chaines/<channelId>/` ou `04_Videos/` (avec suffixe à 4 chiffres si autonome). | **Toujours actif** |
| **`step_studio_ready`** | 🚀 **Initialisation & Ouverture dans le Studio**<br>Préparation de la session de prévisualisation et transition vers `studio.html`. | **Toujours actif** |

---

## 4. Exemples Concrets de Flux Modulaires

### Scénario 1 : Vidéo Autonome Silencieuse avec Images Fournies
- **Paramètres** : Sans chaîne, `audioSetup: 'none'`, `subtitles: false`, images uploadées (`homme-2899.png`, `bureau-2899.png`).
- **Étapes déclenchées (6 étapes)** :
  1. `step_prompt` (Analyse Gemini)
  2. `step_user_assets` (Indexation des assets avec suffixe `-2899`)
  3. `step_scenes` (Génération des scènes dans `05_Scenes/`)
  4. `step_gsap_code` (Assemblage en vidéo finale)
  5. `step_disk_save` (Écriture dans `04_Videos/`)
  6. `step_studio_ready` (Studio Ready)
- **Barre de progression** : Incrément de **~16.6%** par étape.

### Scénario 2 : Vidéo YouTube avec Extrait Vidéo, Logo & Voix IA
- **Paramètres** : Rattachée à la chaîne `ch_tech`, prompt contenant un lien YouTube et le logo de Google, `audioSetup: 'full_mix'`, `subtitles: true`.
- **Étapes déclenchées (12 étapes)** :
  1. `step_prompt` (Analyse Gemini)
  2. `step_brandkit` (Brand Kit de la chaîne `ch_tech`)
  3. `step_youtube` (Téléchargement de l'extrait YouTube via `youtube_clip.cjs`)
  4. `step_logo` (Récupération du logo Google via `brandfetch.cjs`)
  5. `step_user_assets` (Indexation des médias dans `01_Assets/.../ch_tech/`)
  6. `step_voice_tts` (Synthèse vocale IA ElevenLabs)
  7. `step_music` (Mixage de la musique d'ambiance avec ducking)
  8. `step_sfx` (Sound design & bruitages de transition)
  9. `step_subtitles` (Sous-titres mot-à-mot synchronisés)
  10. `step_scenes` (Génération des scènes dans `05_Scenes/`)
  11. `step_gsap_code` (Assemblage dans la vidéo unique)
  12. `step_disk_save` & `step_studio_ready` (Sauvegarde dans `03_Chaines/ch_tech/` et ouverture Studio)
- **Barre de progression** : Incrément de **~8.3%** par étape.