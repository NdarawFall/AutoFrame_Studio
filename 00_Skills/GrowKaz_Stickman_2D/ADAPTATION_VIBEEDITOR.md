# Guide d'Intégration & d'Adaptation : GrowKaz Stickman 2D + ScriptForge dans VibeEditor

Ce dossier `00_Skills/GrowKaz_Stickman_2D/` réunit le kit complet d'animation 2D procédurale (Stickman / Rim light / 2.5D / Three.js) ainsi que le framework de rédaction narratif **ScriptForge** (issu du document `2D_Niche_Prompt_for_Claude.pdf`).

Ce guide détaille comment ce plugin externe pour Claude est adapté à 100% avec l'architecture, les scripts et les outils de ton projet local **VibeEditor**.

---

## 🎯 1. Vue d'Ensemble & Synergie des Outils

Dans Claude pur, ce plugin nécessitait une suite d'étapes manuelles et des outils limités.
Dans **VibeEditor**, nous combinons la puissance des moteurs graphiques Stickman avec notre écosystème automatisé de production vidéo :

| Étape du Plugin | Approche d'Origine (Claude) | Adaptation Directe VibeEditor |
| :--- | :--- | :--- |
| **Idéation / Script (PDF)** | ScriptForge manuel en chat | Intégration via notre matrice de création (`02-video-creation-matrix.md`) & `ai_director.cjs` |
| **Génération Voix Off** | Fichier audio externe à importer manuellement | Automatisé via `node 07_Scripts/generate_voice.cjs` (ElevenLabs / HeyGen) |
| **Normalisation Audio** | Aucune (fait en post-production externe) | Automatisé via `node 07_Scripts/normalize_audio.cjs --preset youtube` (-14 LUFS) |
| **Sous-titres & Timestamps** | `transcribe.py` avec Whisper local | `node 07_Scripts/transcribe_subtitles.cjs` ou `transcribe.py` avec modèle optimisé |
| **Musique & Sound FX** | Moteur synthétique `audio/music.py` / `sfx.py` | Nos générateurs `07_Scripts/generate_music.py` + `07_Scripts/sfx.py` + `fetch_music.cjs` |
| **Assets & Objets 3D** | Low-poly basique Three.js | `07_Scripts/fetch_3d_model.cjs` (Khronos / Poly Haven / Sketchfab) + `fetch_football_logo.cjs` / `brandfetch.cjs` |
| **Rendu & Preview** | Puppeteer local Chromium | `node render.cjs` et interface interactive temps réel dans `09_Pages/` / `studio-server.cjs` |

---

## 📖 2. Le Framework "ScriptForge" (Adapté du PDF)

Le fichier `2D_Niche_Prompt_for_Claude.pdf` définit un persona d'écriture vidéo à haute rétention pour chaînes YouTube "faceless" :

### Les 5 Niches Principales :
1. **Self-Improvement / Productivité** : Ton mentor stoïque, direct, seconde personne ("tu"), orienté passage à l'action.
2. **Psychologie & Dynamiques Sociales** : Mystérieux, révélateur de vérités cachées, exemples concrets ("As-tu déjà remarqué...").
3. **What If (Science & Futur)** : Cinématique, escalade dramatique, ligne temporelle ("Imagine que tu te réveilles...").
4. **Science & Univers** : Émerveillement documentaire, analogies limpides, rigueur factuelle.
5. **Histoire & Mystères** : Conteur immersif, in media res (départ au cœur de l'action), tension dramatique.

### Structure Narrée Obligatoire :
- **0:00 - 0:15 (Hook)** : Question paradoxale, fait choquant ou rupture de pattern.
- **0:15 - 0:45 (Le Problème / Le Contexte)** : Pourquoi 99% des gens se trompent ou ce qui se passe réellement.
- **Corps (Développement par Blocs)** : 3 à 5 révélations ou étapes concrètes, illustrées mot par mot.
- **Climax & Conclusion** : Résolution forte + Call To Action (CTA) assumé.

---

## 🛠️ 3. Workflow Opérationnel VibeEditor

Pour produire une vidéo d'animation 2D Stickman complète :

### Étape 1 : Génération du Script
Rédiger le script en suivant les règles de `ScriptForge` (Hook percutant, écriture pour l'oreille, découpage en scènes).

### Étape 2 : Création de la Voix Off & Normalisation
```bash
# Générer la voix off via ElevenLabs
node 07_Scripts/generate_voice.cjs --provider elevenlabs --voice "pNInz6obpgDQGcFmaJgB" --text "Ton script ici..." --out "01_Assets/Voix_Off/nom_video_vo.mp3"

# Calibrer le volume à la norme broadcast (-14 LUFS)
node 07_Scripts/normalize_audio.cjs --input "01_Assets/Voix_Off/nom_video_vo.mp3" --preset youtube
```

### Étape 3 : Musique & Ambiances
```bash
# Générer une musique procédurale adaptée au mood (ex: tech, suspense, chill...)
python 07_Scripts/generate_music.py --style tech --duration 60 --out "01_Assets/Musiques/nom_video_music.wav"

# Ou télécharger un morceau libre de droit du catalogue Incompetech
node 07_Scripts/fetch_music.cjs --mood suspense
```

### Étape 4 : Utilisation du Moteur 2D Stickman
Le moteur extrait se trouve dans :
`00_Skills/GrowKaz_Stickman_2D/skills/make-2d-video/kit/`

Il met à disposition :
- `engine/rig2d.js` : Rig squelettique pour animer le personnage stickman (marche, gestes, poses de réflexion, réactions).
- `engine/styles.js` : 5 styles visuels instantanés (`emerald`, `ember`, `arctic`, `sakura`, `retro`).
- `engine/three-kit.js` : Prise en charge des scènes de caméra 3D / orbites.
- `engine/fx2d.js` & `ui2d.js` : Particules, halos néons, blueprints et schémas dynamiques.

---

## 🎨 4. Respect du Design System & Règles Caméra de VibeEditor

Lorsque le moteur génère ou anime des scènes :
1. **Interdiction Absolue des Étiquettes Diaporama / Debug** :
   - **JAMAIS** d'étiquette, de pastille ou de badge affichant `"SCÈNE 1 : ..."`, `"SLIDE 2"`, ou un intitulé de séquence en coin d'écran.
   - VibeEditor produit des films et vidéos immersifs à haute rétention, **JAMAIS des diaporamas PowerPoint**.
2. **Zéro Débordement & Largeur Dynamique de Texte** :
   - Tout texte situé à l'intérieur d'un bouton, d'une card, d'un badge ou d'une pilule CTA **DOIT** calculer dynamiquement la largeur de son conteneur via `ctx.measureText(txt).width`.
   - **Padding de sécurité obligatoire** : ajouter au minimum 32px à 40px de marge intérieure de chaque côté (`cardW = textW + 72px à 80px`).
   - Le texte ne doit sous aucun prétexte effleurer ou déborder des bords de sa boîte.
3. **Zéro Collision & Espacement Aéré (Distance Minimale > 100px)** :
   - Respect strict de la règle des tiers et des zones de respiration.
   - Les éléments graphiques (gros plan de visage `bigFace`, cadrans circulaires, graphiques, personnages) doivent maintenir un espace vide libre d'au moins 100px à 150px entre eux.
   - Bannir les cadres rectangulaires gigantesques qui traversent ou enferment les éléments au risque de créer une sensation d'étouffement visuel.
4. **Marges et Cadrage** : Respect strict du padding cadre standardisé (80px latéral en 16:9 et 9:16).
5. **Mouvements de Caméra Contextuels** (issus de notre skill Camera) :
   - Zoom centré sur la première card / élément d'une liste puis glissement continu en tracking.
   - Zoom gauche sur les barres de texte en cours de frappe, suivi vers la droite, puis dézoom final de révélation.
   - Slow push-in sur les moments forts et switch rapide (split-screen / plein écran).

---

## 📂 Contenu du Dossier `00_Skills/GrowKaz_Stickman_2D/`

- `2D_Niche_Prompt_for_Claude.pdf` : Le document source original de stratégie de contenu ScriptForge.
- `skills/` :
  - `make-2d-video/` : Le pipeline complet, avec toute la bibliothèque de code (`kit/`) et la documentation technique (`references/`).
  - `new-video/` : Guide d'ingestion et de découpage des plans.
  - `video-styles/` : Gestion des 5 palettes de couleurs et de l'éclairage cinématique.
  - `video-sound/` : Synchronisation du son, bruitages et ducking.
  - `render-video/` : Moteur de rendu frame-par-frame et contrôle qualité.
- `README.md` : Guide d'origine du créateur du plugin (GrowKaz).
- `ADAPTATION_VIBEEDITOR.md` : Ce document.

