# Architecture de Référence du Projet VibeEditor

> [!IMPORTANT]
> **NATURE DU PROJET & PHILOSOPHIE UTILISATEUR** :
> 1. **Studio Web Local Autonome** : VibeEditor est un **studio de création vidéo web/local** propulsé par un serveur Node.js (`07_Scripts/studio-server.cjs`). Il n'est **PAS** une application de bureau installable (.exe, Electron, installeur Windows).
> 2. **Interface Studio Interactive** : L'accès, la création et la prévisualisation se font directement via le navigateur web sur `http://localhost:3000` (`npm start` ou `npm run studio`).
> 3. **Gestion Transparente des Paramètres & Clés API** :
>    - Toute la configuration se fait exclusivement à travers l'interface graphique ([`09_Pages/settings.html`](../../09_Pages/settings.html)).
>    - Les clés et réglages sont persistés dans `07_Scripts/api_config.json` (qui reste strictement exclu de Git).
>    - Si une clé API est manquante lors d'une tentative de création vidéo, l'application le signale par une modale claire invitant l'utilisateur à coller sa clé dans l'écran des Paramètres.
> 4. **Règle d'or d'économie de tokens & lecture préalable** : L'IA doit consulter ce document pour connaître la topologie exacte sans jamais fouiller aveuglément les répertoires.

---

## 1. Arborescence Globale du Projet

```text
heygen-new/
├── package.json                # Dépendances & scripts ("npm start", "npm run studio", "npm run render")
├── .agents/
│   └── rules/                  # Règles strictes de gouvernance pour l'IA
│       ├── project-architecture.md         # Ce document maître d'architecture
│       ├── no-unprompted-rendering.md      # INTERDICTION ABSOLUE de rendre en MP4 sans demande explicite
│       ├── no-inner-player-controls.md     # INTERDICTION des barres de contrôle de lecture dans les vidéos HTML
│       ├── html5-video-broll-studio-contract.md # Contrat vidéo HTML5 & B-Roll (data-start/data-end & synchronisation Studio)
│       ├── no-reading-existing-videos.md   # Originalité visuelle & interdiction de copie
│       ├── video_create_process.md         # Processus autonome de fabrication vidéo
│       ├── error_logs.md                   # Journalisation des erreurs
│       └── structure-skills-and-rules.md   # Structure de séparation règles / skills
├── 00_Skills/                  # Compétences et savoir-faire autonomes de l'IA
│   ├── tegaki_handwriting/     # Moteur d'animation d'écriture manuscrite vectorielle SVG
│   ├── video_design_mastery/   # 17 principes de design vidéo (typographie 80/20, 60/30/10, contrastes)
│   ├── animation_2d_physics/   # Lois physiques du motion design (inertie, squash & stretch, rebonds)
│   └── reconstruction_documentary/ # Guides et moteurs de reconstitution documentaire animée
├── 01_Assets/                  # Bibliothèque statique et répertoires de stockage des médias
│   ├── Avatars/                # Portraits et présentateurs
│   ├── Audio_Mix/              # Bandes sonores finales mixées
│   ├── Effets_Sonores/         # Bruitages d'impact et transitions (SFX : whoosh, pop, hit, pass)
│   ├── Flags/                  # Drapeaux nationaux vectoriels SVG / PNG
│   ├── handwriting/            # Tracés SVG manuscrits générés par le skill Tegaki
│   ├── Icones/                 # Pictogrammes UI et icônes vectorielles
│   ├── Illustrations/          # Éléments graphiques et visuels d'habillage
│   ├── Images/                 # Visuels fixes (inclut /channels/ pour les logos de chaînes)
│   ├── Logos/                  # Logos officiels de marques récupérés via brandfetch.cjs
│   ├── Maps/                   # Cartes géographiques générées par fetch_map.cjs
│   ├── Musiques/               # Pistes audio d'ambiance et thèmes musicaux
│   ├── Videos/                 # Clips B-Roll et extraits vidéo
│   └── Voix_Off/               # Narrations vocales synthétisées (ElevenLabs / TTS)
├── 02_Composants/              # Briques UI et animations visuelles prêtes à l'emploi
│   ├── Audio_Visualizer/       # Barres de fréquences et ondes sonores réactives
│   ├── Background/             # Arrière-plans variés et textures
│   ├── Callouts_Badges/        # Badges, notifications toasts & stacks
│   ├── Card/                   # Cartes stylisées Shadcn
│   ├── Charts_Data/            # Graphiques de données animés (Chart.js / SVG)
│   ├── Counter/                # Compteurs numériques dynamiques (CountUp.js)
│   ├── Lower_Thirds/           # Bandeaux d'identification cinématiques
│   ├── Mockups_Devices/        # Gabarits d'écrans (iPhone, MacBook, navigateurs)
│   ├── Progress_Bar/           # Barres de progression et jauges temporelles
│   ├── Quotes_Citations/       # Encadrés de citation & avis clients
│   ├── Split_Screen/           # Écrans partagés modulaires
│   ├── Subtitle/               # Styles de sous-titrage dynamique mot-à-mot (style Hormozi)
│   ├── Text animation/         # Effets typographiques cinétiques
│   └── Visual_Effect/          # Effets visuels (halos, particules, reflets)
├── 03_Chaines/                 # [Organisationnel] Sous-dossiers de chaque chaîne (<channelId>/...)
├── 04_Videos/                  # [Éphémère] Compositions HTML finales autonomes (sans chaîne)
├── 05_Scenes/                  # [Éphémère] Scènes modulaires unitaires générées par l'IA
├── 06_Templates/               # Gabarits maîtres pour la production rapide
├── 07_Scripts/                 # Boîte à outils et utilitaires d'automatisation exécutables
│   ├── studio-server.cjs       # Serveur Node.js local de l'application Studio (port 3000)
│   ├── ai_director.cjs         # Moteur orchestrateur autonome de création vidéo par IA
│   ├── render.cjs              # Moteur de capture headless Puppeteer & rendu MP4 FFmpeg
│   ├── generate_voice.cjs      # Synthèse vocale IA réaliste (ElevenLabs)
│   ├── coverr.cjs              # Moteur de recherche et téléchargement de vidéos B-Roll HD/4K
│   ├── transcribe_subtitles.cjs# Calage temporel mot-à-mot des sous-titres
│   ├── brandfetch.cjs          # Extraction automatique de logos officiels de marques (SVG/PNG)
│   ├── fetch_map.cjs           # Génération de cartes géographiques et tracés d'itinéraires
│   ├── fetch_flag.cjs          # Téléchargement de drapeaux mondiaux HD
│   ├── fetch_football_logo.cjs # Téléchargement autonome de logos de clubs/sélections de foot (football-logos.cc)
│   ├── cut_silences.cjs        # Découpe automatique des silences (jump-cut) pour rushes 10_Clients/
│   ├── detect_bad_takes.cjs    # Détection automatique des mauvaises prises, hésitations et répétitions
│   ├── auto_reframe.cjs        # Recadrage automatique 16:9 -> 9:16 vertical (crop, blur background, split)
│   ├── normalize_audio.cjs     # Normalisation sonore professionnelle EBU R128 (-14 LUFS)
│   ├── remove_bg.cjs           # Détourage et suppression du fond d'images
│   └── api_config.json         # Stockage local des clés API (ignoré par Git)
├── 08_Rendus/                  # [Éphémère] Sorties finales vidéo MP4 (ignoré par Git)
├── 09_Pages/                   # Interface utilisateur web du studio (Home, Studio Player, Paramètres)
    ├── home.html               # Page d'accueil et tableau de bord principal
    ├── studio.html             # Studio de montage (player, timeline, onglets Vidéos, Rendus)
    ├── create_video.html       # Formulaire de brief et configuration de création vidéo
    ├── video_processus.html    # Suivi visuel et terminal des étapes de fabrication de la vidéo
    ├── channels.html           # Bibliothèque des chaînes et des vidéos sans chaîne
    ├── channel.html            # Vue détaillée d'une chaîne spécifique avec ses vidéos
    ├── channel_settings.html   # Paramètres d'une chaîne (Brand Kit, couleurs, typographies)
    └── settings.html           # Paramètres généraux de l'application et gestion des clés API
└── 10_Clients/                 # [Clients] Rushes & vidéos brutes non montées des clients (éditeur Short / Reel / TikTok)
    ├── .gitkeep                # Dossier vide par défaut sur Git pour la confidentialité et le stockage
    └── README.md               # Guide d'organisation des rushes par client
```

---

## 2. Règle Stricte de Rendu Vidéo (Interdiction d'Initiative IA)

> [!CAUTION]
> **L'IA NE DOIT JAMAIS DÉCLENCHER DE RENDU MP4 SANS DEMANDE EXPLICITE DE L'UTILISATEUR.**
> Consultez obligatoirement la règle dédiée : [`.agents/rules/no-unprompted-rendering.md`](no-unprompted-rendering.md).
> - La création de vidéo consiste à concevoir la composition HTML interactive (GSAP, Three.js, CSS), à générer les assets audio/images et à mettre à disposition le lien interactif dans le Studio.
> - Le script `render.cjs` ou l'appel `/api/render` ne doit être exécuté **QUE** si l'utilisateur ordonne expressément : *« Lance le rendu »*, *« Exporte en MP4 »*, etc.

---

## 3. Règle Stricte de Nommage des Fichiers & Suffixes Identiques

Afin d'éviter tout conflit et d'assurer une traçabilité totale entre une vidéo et ses médias :

### Cas 1 : Vidéo créée au sein d'une Chaîne (`03_Chaines/<channelId>/`)
* **Le fichier vidéo et TOUS ses assets dédiés doivent impérativement partager le même suffixe alphanumérique unique** (généré au départ, ex: `-12ABC`) :
  - Fichier vidéo HTML : `03_Chaines/ch_tech/story_nike-12ABC.html`
  - Image de la vidéo : `01_Assets/Images/ch_tech/chaussure-12ABC.png`
  - Voix off de la vidéo : `01_Assets/Voix_Off/ch_tech/narration-12ABC.mp3`
  - Sous-titres de la vidéo : `01_Assets/Voix_Off/ch_tech/subtitles-12ABC.json`
  - Musique de la vidéo : `01_Assets/Musiques/ch_tech/ambiance-12ABC.mp3`

### Cas 2 : Vidéo créée hors chaîne (Autonome dans `04_Videos/`)
* **Même règle avec un suffixe unique à 4 chiffres généré** (ex: `-2899`) :
  - Fichier vidéo HTML : `04_Videos/presentation_ia-2899.html`
  - Image liée : `01_Assets/Images/homme_bureau-2899.png`
  - Audio lié : `01_Assets/Voix_Off/voix_adam-2899.mp3`

---

## 4. Statut & Cycle de Vie du Fichier Vidéo

1. **Création préalable immédiate** : Dès la soumission d'une demande, le fichier HTML de destination est créé avec le statut `status: "processing"`.
2. **Affichage dans `channels.html` / `channel.html`** : La vidéo apparaît tout de suite avec le badge 🟡 *« En cours de création... »*.
3. **Redirection conditionnelle** :
   - Si `status === "processing"` : Le clic redirige vers [`09_Pages/video_processus.html?video=...`](../../09_Pages/video_processus.html) pour visualiser la progression en direct.
   - Si `status === "completed"` : Le clic ouvre la vidéo dans le lecteur interactif [`09_Pages/studio.html?video=...`](../../09_Pages/studio.html).

---

## 5. Résumé des Responsabilités par Dossier

| Dossier | Nature | Rôle Principal | Droit de Modification IA |
| :--- | :--- | :--- | :--- |
| **`00_Skills/`** | Pérenne | Guides et skills spécialisés réutilisables (design, physique 2D, narration). | Lecture seule (sauf ajout d'un nouveau skill). |
| **`01_Assets/`** | Pérenne | Rangement de tous les médias utilisés par les vidéos. | Ajout de fichiers avec le suffixe unique. |
| **`02_Composants/`**| Pérenne | Éléments graphiques, transitions et blocs HTML/CSS prêts. | Lecture et réutilisation dans les scènes. |
| **`03_Chaines/`** | Données | Dossiers personnels de chaque chaîne de l'utilisateur. | Création des vidéos finales de chaîne. |
| **`04_Videos/`** | Éphémère | Vidéos créées sans chaîne (autonomes). | Création de nouvelles vidéos avec suffixe à 4 chiffres. |
| **`05_Scenes/`** | Éphémère | Scènes modulaires unitaires générées par l'IA. | Écriture des scènes intermédiaires. |
| **`06_Templates/`** | Pérenne | Modèles maîtres de structures vidéo. | Lecture et duplication comme base de montage. |
| **`07_Scripts/`** | Pérenne | Moteurs d'orchestration et scripts utilitaires (`ai_director`, `tts`, `coverr`...). | Exécution et maintenance. |
| **`08_Rendus/`** | Éphémère | Sorties finales vidéo MP4. | Écriture exclusive par `render.cjs` **sur ordre utilisateur**. |
| **`09_Pages/`** | Pérenne | Écrans et interfaces utilisateur du Studio web. | Maintenance et affichage UI. |
| **`10_Clients/`** | Données locales | Rushes et vidéos brutes non montées déposées par l'utilisateur pour ses clients (édition Short / Reel / TikTok). | Lecture par l'IA lors du montage, ignoré par Git pour la confidentialité et le stockage. |
