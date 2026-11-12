# Manuel & Spécifications Officielles de Création Vidéo (VibeEditor)

> Ce document est la **référence technique absolue** de l'application VibeEditor. Il doit être mis à jour à chaque évolution du projet.
> **Pour l'utilisateur :** Vous pouvez copier-coller l'intégralité de ce document dans une IA externe (**Claude, Grok, ChatGPT ou Gemini**) pour brainstormer et générer un **script horodaté parfait**, prêt à être injecté dans VibeEditor.

---

## 1. Vue d'Ensemble de l'Architecture VibeEditor

VibeEditor est un studio de production vidéo automatisé et déterministe propulsé par le web moderne (**HTML5 / Canvas 2D / GSAP / Three.js / WebGL**) calculé à **60 FPS constants**.

### Principes d'Exécution :
1. **Contrat Déterministe Iframe / Studio** :
   - La vidéo ne contient **AUCUN bouton de lecture**, **AUCUNE barre de progression** et **AUCUN timecode incrusté**.
   - Elle est pilotée à 100% par la timeline externe du Studio via les API exposées :
     - `window.renderAt(timeInSeconds)` : Rendu instantané et déterministe à la milliseconde près.
     - `window.play()` / `window.pause()` : Lecture et mise en pause synchronisées.
     - `window.syncAudioTimeline(timeInSeconds, isPlaying)` : Synchronisation audio non-bloquante sans coupure ni hachage.
2. **Formats d'Affichage Supportés** :
   - **16:9 Paysage (1920x1080)** : Format broadcast TV, YouTube, documentaire, top 10, vidéos corporate.
   - **9:16 Vertical (1080x1920)** : Format TikTok, Instagram Reels, YouTube Shorts.
   - **1:1 Carré (1080x1080)** : Format posts réseaux sociaux / carrousels.

---

## 2. L'Arsenal des Outils & Scripts Intégrés

L'orchestrateur de VibeEditor (`07_Scripts/ai_director.cjs`) dispose d'outils automatisés activables selon le script :

### A. Voix Off & Traitement Audio
- **`generate_voice.cjs`** :
  - **HeyGen TTS** : Voix ultra-naturelles et posées (ex: voix masculine calme pour Top 10, voix féminine pour motivation).
  - **ElevenLabs** : Voix expressives haute fidélité avec gestion des intonations et accents.
  - Mise en cache automatique pour éviter la surconsommation d'API.
- **`normalize_audio.cjs` & `cut_silences.cjs`** :
  - Normalisation au standard broadcast EBU R128 (-14 à -16 LUFS).
  - Détection et rognage millimétré des blancs au début et à la fin des fichiers audio.
- **`sfx.py` / Sound Design** :
  - Banque d'impacts percutants (bass drop, boom, sub), de balayages (whoosh, sweep) et de retours haptiques (clicks, blips).

### B. Graphismes, Logos & Visuels Officiels
- **`brandfetch.cjs`** : Téléchargement direct des **vrais logos vectoriels officiels** de marques mondiales (Apple, Nike, Tesla, Google, Microsoft, Spotify, etc.) au format SVG ou PNG transparent HD.
- **`fetch_flag.cjs`** : Récupération des drapeaux officiels nationaux et territoriaux (SVG vectoriels parfaits).
- **`fetch_football_logo.cjs` & `fetch_sportsdb.cjs`** : Récupération automatique des blasons officiels de clubs de football (Real Madrid, Manchester City, Bayern Munich, etc.) et sélections.
- **`fetch_map.cjs` & `stitch_map.cjs`** : Cartographie vectorielle TopoJSON haute résolution sans watermark, avec tracés et zooms animés.
- **`fetch_3d_model.cjs`** : Intégration de modèles 3D WebGL (Three.js) avec rotations fluides et éclairages dynamiques.
- **`remove_bg.cjs` & `chroma_key.cjs`** : Détourage par IA ou suppression de fond vert pour détourer des sujets ou des visages.

### C. B-Roll, Vidéos & Métadonnées YouTube
- **`youtube_clip.cjs` (yt-dlp + ffmpeg)** :
  - **Téléchargement d'extraits calibrés** (`--download <url> [--start HH:MM:SS] [--end HH:MM:SS]`) : Découpe chirurgicale avec ré-encodage systématique en `libx264` à GOP régulier (`-g 25`), timestamps PTS/DTS monotones et `-movflags +faststart` pour une lecture 60 FPS fluide sans saccades.
  - **Téléchargement de miniatures HD** (`--thumbnail <url> [--out <chemin>]`) : Extraction directe de la miniature officielle en haute résolution (`maxresdefault.jpg`).
  - **Extraction des données complètes de la vidéo** (`--data <url> [--out <chemin.json>]`) : Récupération exhaustive des métadonnées (titre, description, tags, catégories, vues, likes, chaîne, durée, résolution).
  - **Transcription horodatée** (`--transcript <url> [--lang fr|en]`) : Récupération des sous-titres et timestamps précis pour repérer les séquences clés.
  - Endpoints Studio Server associés : `/api/youtube/info`, `/api/youtube/thumbnail`, `/api/youtube/data`, `/api/youtube/transcript`, `/api/youtube/download`.
- **`coverr.cjs`** : Banque de vidéos B-Roll cinématiques gratuites en libre de droits.

### D. Rendu Final MP4
- **`render.cjs`** : Moteur de capture frame par frame sous Chromium headless couplé à FFmpeg pour exporter un fichier MP4 final 1080p 60 FPS parfait.

---

## 3. Les 10 Règles de Design Non-Négociables

1. **Zéro look PowerPoint** :
   - Interdiction formelle d'ajouter une barre de progression en haut de la vidéo.
   - Interdiction d'ajouter des étiquettes scolaires (`[ Étape 1 ]`, `[ Chapitre 02 ]`, `[ SCÈNE 1 ]`).
   - Les 4 coins de l'écran doivent rester propres, aérés et dégagés (pas de badges parasites "Live", "Telemetry" ou "1080p").
2. **Pas d'images déformées ou étirées** :
   - Tout visuel doit conserver son ratio d'aspect naturel (1:1 carré, 16:9 ou 4:3).
   - Utilisation de `object-fit: cover` ou calcul mathématique Canvas pour préserver les proportions.
3. **Socle anti-coupure de buste** :
   - Si une photo de personnage/joueur est coupée au niveau du torse, placer un socle ou un panneau d'identité élégant en verre dépoli (`backdrop-filter: blur`) par-dessus la coupe avec le nom et le logo officiel.
4. **Vrais logos officiels** :
   - Toujours utiliser les véritables tracés SVG officiels (ex: pomme Apple officielle avec feuille détachée et courbe exacte).
5. **Palette 60/30/10 & Choix de Fond** :
   - 60% couleur primaire (fond noir pur `#000000`, blanc studio, ou mode **"Décision IA"** où Gemini crée une scénographie dynamique sur-mesure pour chaque scène).
   - Bannissement des fonds spatiaux avec étoiles ou nébuleuses (sauf demande expresse de l'utilisateur).
   - 30% couleur secondaire (surfaces de cartes `#111827`, texte blanc/gris).
   - 10% couleur d'accent unique (doré ambre, cyan électrique, vert émeraude).
6. **Mouvement de caméra continu** :
   - Intégrer un travelling subtil (*slow push-in* de 1.0 à 1.05) pour donner de la vie même aux plans calmes.
7. **Cinématique d'entrée et de sortie** :
   - Tout élément apparaît avec une transition fluide (inertie élastique `back.out`, fade progressif) et disparaît avant le plan suivant.
8. **Typographie cinétique mot-à-mot** :
   - Révélation dynamique des phrases importantes mot par mot ou par effet machine à écrire (*typewriter*) synchronisé.
9. **Synchronisation millimétrée** :
   - L'action visuelle doit concorder exactement avec la voix off au dixième de seconde près.
10. **Zéro boucle autonome non-contrôlée** :
    - Pas de `requestAnimationFrame` incontrôlé ; la vidéo doit être scrubbable et arrêtable à tout instant par la timeline du Studio.

---

## 4. Structure Obligatoire du Script Horodaté

Le script horodaté est la colonne vertébrale de la vidéo. Il découpe chaque séquence avec précision.

### Format Attendu :

```text
[00:00 - 00:03] Scène 1 : Titre / Hook Percutant
Voix off : "Voici l'annonce qui va transformer l'industrie."
Visuel : 
- Apparition cinétique du titre géant en blanc pur avec accent doré.
- Halo volumétrique subtil en arrière-plan.
- Léger slow push-in de caméra.
Assets : logo_officiel.svg

[00:03 - 00:07] Scène 2 : Démonstration / Illustration
Voix off : "Grâce à cette nouvelle architecture, la vitesse est multipliée par dix."
Visuel : 
- Entrée latérale d'une carte interface élégante en verre dépoli (ratio 1:1).
- Tracé vectoriel dynamique d'une jauge passant de 0 à 100%.
- Compteur de performance numérique vert émeraude.
Assets : mockup_interface.png

[00:07 - 00:10] Scène 3 : Conclusion & Call-To-Action
Voix off : "Et toi, quel est ton avis ? Dis-le en commentaire !"
Visuel : 
- Zoom arrière fluide avec centrage géométrique de la carte finale.
- Révélation d'un bouton d'action avec onde haptique animée.
- Fondu au noir élégant à 09.5s.
Assets : bouton_cta.png
```

---

## 5. Prompt Prêt à l'Emploi pour IA Externe (Claude / Grok / ChatGPT / Gemini)

Copiez le bloc ci-dessous dans votre IA préférée avec votre idée pour obtenir le script parfait :

```markdown
Tu es le Scénariste et Directeur Artistique de VibeEditor, un moteur de motion design vidéo 60 FPS basé sur Canvas 2D et GSAP.
Je souhaite créer une vidéo sur le sujet suivant :
« [INSÉRER LE SUJET DE LA VIDÉO ICI] »

Contraintes techniques de VibeEditor :
1. Format : [16:9 horizontal OU 9:16 vertical].
2. Durée totale : [ex: 15 secondes / 20 secondes / 30 secondes].
3. Style : [ex: Sport Broadcast, Minimaliste Tech, Growkaw Motivation, SaaS Explainer].
4. Règle anti-PowerPoint : Pas de barre de progression en haut, pas de badges d'écolier, design cinématographique épuré avec caméra dynamique.
5. Timing organique : Pas de découpage rigide (un hook de 2-3s, un cœur rythmé, une conclusion percutante).

Rédige-moi :
1. Le Prompt Général (synthèse en 2-3 phrases de l'angle éditorial et de la direction artistique).
2. Le Script Horodaté Détaillé respectant le format :
   [MM:SS - MM:SS] Scène X : [Nom de la Scène]
   Voix off : "[Texte exact mot pour mot]"
   Visuel : [Description précise des mouvements, animations de caméra, cartes, typographie cinétique]
   Assets : [Noms des images, logos ou illustrations à utiliser]
```

