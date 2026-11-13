# 🎬 AutoFrame Studio — Moteur Autonome de Création Vidéo IA

> **Studio vidéo automatisé pour générer, animer et exporter des vidéos percutantes (HTML5, GSAP, Three.js, ElevenLabs, Gemini).**

---

## 🚀 Démarrage Rapide

### 1. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/NdarawFall/Vibe_Editor_App.git
cd Vibe_Editor_App
npm install
```

### 2. Configuration des Clés API (100% Automatique & Visuelle)

Le projet est configuré pour ne **jamais commiter vos clés secrètes** sur GitHub grâce au `.gitignore`.

1. Lancez le studio :
   ```bash
   npm start
   # OU
   npm run studio
   ```
2. Ouvrez la page **Paramètres** : [http://localhost:3000/09_Pages/settings.html](http://localhost:3000/09_Pages/settings.html)
3. Collez vos clés d'API personnelles :
   - **Google AI Studio (Gemini)** : pour l'analyse scénaristique et la direction artistique ([Obtenir une clé gratuite](https://aistudio.google.com/app/apikey))
   - **ElevenLabs** : pour la voix off ultra-réaliste ([Obtenir une clé](https://elevenlabs.io/))
   - **Pixabay / Coverr / Brandfetch / Remove.bg** (Optionnels)
4. Cliquez sur **« Enregistrer les Paramètres »**. Le fichier de configuration local sera créé et géré automatiquement par le serveur en toute sécurité (aucun fichier à créer manuellement, aucune ligne de commande).

---

## 🛠️ Commandes Disponibles

| Commande | Action |
| :--- | :--- |
| `npm start` ou `npm run studio` | Démarre le serveur local AutoFrame sur `http://localhost:3000` |
| `npm run render` | Lance le moteur de rendu vidéo headless (Puppeteer + FFmpeg) |

---

## 📂 Architecture du Projet

```text
├── 00_Skills/          # Directives de design, physique d'animation et narration
├── 01_Assets/          # Ressources multimédias (Voix off, SFX, Musiques, Logos, Images)
├── 02_Composants/      # Composants modulaires (Sous-titres, Badges, Split screens, Cartes)
├── 03_Chaines/         # Projets groupés par chaîne / thématique
├── 04_Videos/          # Pages HTML interactives des vidéos prêtes à l'export
├── 05_Scenes/          # Fragments de scènes générés par l'orchestrateur IA
├── 06_Templates/       # Modèles scénographiques réutilisables
├── 07_Scripts/         # Moteurs d'orchestration (ai_director, TTS, Coverr, studio-server)
│   ├── api_config.example.json  # Gabarit public des paramètres API
│   ├── api_config.json          # Fichier privé local (ignoré par Git)
│   ├── studio-server.cjs        # Serveur de gestion du studio
│   ├── cut_silences.cjs         # Jump-cut & découpage automatique de silences
│   ├── detect_bad_takes.cjs     # Détection de mauvaises prises & répétitions
│   ├── auto_reframe.cjs         # Recadrage automatique 16:9 vers 9:16 vertical
│   ├── fetch_football_logo.cjs  # Téléchargement autonome de logos de football
│   ├── fetch_sportsdb.cjs       # Téléchargement de portraits joueurs détourés (PNG) & badges (TheSportsDB)
│   └── fetch_music.cjs          # Téléchargement de musiques libres de droit par genre/mood (Incompetech)
├── 08_Rendus/          # Dossier d'exportation des vidéos finales MP4 (ignoré par Git)
├── 09_Pages/           # Interface utilisateur web du studio (Home, Création, Paramètres)
├── Clients/            # Rushes & vidéos brutes non montées des clients (éditeur Short / Reel / TikTok)
└── .gitignore          # Filtres Git stricts pour la confidentialité et le poids
```

---

## 🛡️ Sécurité & Bonnes Pratiques GitHub

- ❌ **Aucun secret dans le code** : les clés API ne sont jamais envoyées sur GitHub.
- 📦 **Rendus vidéo exclus** : les fichiers exportés dans `08_Rendus/` dépassent souvent les limites de GitHub et sont exclus pour garder un historique léger.
- 🔄 **Multi-utilisateurs prêt** : tout nouveau collaborateur peut cloner le projet, exécuter `npm install`, lancer `npm start` et saisir ses propres clés instantanément sans modifier le code source.

