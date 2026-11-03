# Matrice Complète de Création Vidéo, Direction Artistique & Règles d'Or

Ce document réunit l'ensemble des règles fondamentales de conception vidéo, de motion design et de direction artistique appliquées par l'IA.

---

## 1. Principes Fondamentaux & Règles d'Or (Les 22 Règles)

1. **Moteur d'Intelligence Artificielle** :
   - L'IA utilisée pour l'analyse narrative, la planification des outils et la génération du code est **Google Gemini**, configuré avec la clé **Google AI Studio** (`google_api_key` stockée dans `07_Scripts/api_config.json`).
2. **Pas de génération d'images par l'IA** :
   - **L'IA ne doit JAMAIS générer d'images.** Toutes les images d'illustration nécessaires doivent être **fournies au départ par l'utilisateur** via l'interface d'upload.
3. **Téléchargement externe & B-Roll strictement limité à YouTube** :
   - **Aucun autre B-Roll externe que YouTube** n'est autorisé.
   - Cette étape est entièrement **modulable et non-fixe** : elle n'est déclenchée que si le prompt ou les paramètres requièrent explicitement un extrait YouTube via `07_Scripts/youtube_clip.cjs`.
4. **Options Audio autorisées** :
   - Les 4 seules options audio autorisées sont :
     - `voice_only` : Voix off seulement (narration pure).
     - `music_only` : Musique seulement (bande-son d'ambiance).
     - `full_mix` : **Mix avec tout** (Voix off + Musique de fond + Effets sonores SFX) — *Option par défaut*.
     - `none` : Sans audio (vidéo muette).
5. **Gestion et cloisonnement des Assets** :
   - **Assets d'une chaîne** : Dossier dédié portant le nom / ID de la chaîne (ex: `01_Assets/Images/<channelId>/`).
   - **Assets des vidéos autonomes** : Suffixe aléatoire identique à 4 chiffres (ex: `image_homme-2899.png`, `voiture_jaune-2899.mp4`).
   - **Rushes clients (`10_Clients/`)** : Sourcing direct des rushes non montés dans `10_Clients/<nom_client>/`.
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
10. **Zéro Copie Visuelle — Créativité 100% Originale (Anti-Plagiat)** :
    - **NE JAMAIS inspecter ou lire les fichiers HTML existants dans `04_Videos/` ou `03_Chaines/`** lors de la création d'une nouvelle vidéo.
    - **NE JAMAIS recopier visuellement une vidéo ou un composant préexistant.**
    - Chaque nouvelle composition doit avoir sa propre direction artistique, ses propres scènes, ses propres visuels vectoriels et sa typographie originale créée de A à Z.
11. **Interdiction des Titrages Didactiques, Badges "PowerPoint" & Textes aux 4 Coins** :
    - **Bannissement définitif des étiquettes scolaires** : `[ Règle 01 ]`, `[ Chapitre 1 ]`, `[ Étape 01 ]`, conteneurs `.tag-pill`. Une vidéo n'est pas une présentation PowerPoint.
    - **Bannissement absolu des faux textes HUD aux 4 coins du cadre** (`.hud-telemetry`, `1080p`, `TEMPO 120 BPM`, `VIBE ENGINE`). Les 4 coins du cadre doivent impérativement rester vides et dégagés.
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
20. **Animation des Cards (Fondus Directionnels Purs & Séquentiel) & Musique Sur-Mesure** :
    - Cartes animées de façon séquentielle une à une à la suite avec fondus directionnels épurés.
    - Ne jamais réutiliser la même boucle musicale préexistante ; composer une bande-son originale sur mesure adaptée au rythme.
21. **Intégration Vidéo HTML5 & B-Roll (Contrat Studio & Zéro Saccade)** :
    - Toute balise `<video>` DOIT comporter `data-start="T_DEBUT" data-end="T_FIN" data-duration="DUREE" muted loop playsinline preload="auto"`.
    - Non-ingérence JS en mode Studio (`isIframeMode === true`) : le Studio gère automatiquement `play()`, `pause()` et le scrubbing.
22. **Interdiction Formelle de Dessiner un Logo (Obligation de Téléchargement Officiel)** :
    - **L'IA ne doit JAMAIS dessiner ou inventer un logo de marque en code** (aucun bricolage ou approximation SVG faite maison).
    - Tout logo doit être **téléchargé sous sa forme officielle** (SVG vectoriel officiel ou PNG transparent haute définition) dans `01_Assets/Logos/` via `node 07_Scripts/brandfetch.cjs <domaine>` ou sourcing officiel certifié.
    - **Si le téléchargement est impossible**, l'IA doit impérativement **s'arrêter et prévenir l'utilisateur** afin que celui-ci fournisse lui-même l'asset logo officiel.

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
| `fetch_music.cjs` | Téléchargement de musiques libres de droit par genre / ambiance | `node 07_Scripts/fetch_music.cjs <genre> <dossier_sortie>` |
| `normalize_audio.cjs` | Normalisation sonore aux normes broadcast (-14 LUFS) | `node 07_Scripts/normalize_audio.cjs <entree> <sortie>` |
| `remove_bg.cjs` | Détourage automatique d'images | `node 07_Scripts/remove_bg.cjs <image>` |
