# 🎬 MarvidFlow Studio — Le Studio Tout-en-Un de Création Vidéo & Motion Design IA

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-FF3344?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![Electron](https://img.shields.io/badge/Electron-45.x-47848F?style=for-the-badge&logo=electron)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock)
![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=three.js)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

<p align="center">
  <strong>Transformez vos idées, scripts et rushes bruts en vidéos virales haute fidélité (Shorts, Reels, TikTok, YouTube).</strong><br>
  Motion design déterministe en HTML5 / GSAP / Three.js • Synthèse vocale IA • Jump-cut automatique • Brand Kits dédiés • Rendu 60 FPS.
</p>

</div>

---

## 🌟 Présentation de MarvidFlow

**MarvidFlow Studio** est une plateforme logicielle et web complète combinant le meilleur des technologies du web moderne (HTML5, GSAP, Three.js, CSS cinématique) avec la puissance des modèles d'intelligence artificielle (Gemini, Claude, Grok, ElevenLabs) pour automatiser la production vidéo de bout en bout.

Que vous soyez créateur de contenu solo, agence marketing ou monteur vidéo professionnel, MarvidFlow standardise vos processus créatifs et vous permet de monter, animer et exporter vos vidéos avec une précision chirurgicale au millième de seconde.

---

## ✨ Fonctionnalités Majeures

### 1. 📱 Player Universel Multi-Format & Mode Plein Écran
- **Multi-Ratio Natif** : Bascule instantanée entre **16:9** (YouTube standard, paysages), **9:16** (TikTok, Instagram Reels, YouTube Shorts) et **1:1** (Carré réseaux sociaux).
- **Mode Plein Écran Cinéma** : Agrandissement immersif sur la totalité de l'écran (Full Screen API) respectant scrupuleusement le ratio sans distorsion ni zoom excessif.
- **Timeline Précise** : Contrôles de lecture, scrub image par image, waveform audio réactive et sous-titres animés synchronisés.

### 2. ⚡ Médiathèque d'Assets Ultra-Rapide (Performance v2.0)
- **Mise en cache serveur RAM (< 1ms)** : Indexation instantanée de milliers d'assets (musiques, bruitages, vidéos, images, polices).
- **Pagination Progressive par Lots** : Affichage initial ultra-léger de 36 éléments avec bouton d'extension et observateur de scroll infini (*IntersectionObserver*).
- **Prévisualisation Vidéo au Survol** : Zéro coût processeur/mémoire au repos (placeholder vectoriel ultra-léger) avec déclenchement vidéo fluide au passage de la souris.
- **Lecteur Audio Intégré** : Écoute en 1-clic avec bouton de copie rapide du chemin relatif prêt pour l'intégration de script.

### 3. 🎨 Brand Kits & Gestion Avancée des Chaînes
- **Harmonie Visuelle (Règle 60/30/10)** : Définition par chaîne de la couleur dominante, secondaire et d'accentuation avec nuancier interactif.
- **Trio Typographique Pro** : Sélection et visualisation en direct des polices pour le Titre Principal, le Titre Secondaire et le Texte d'Accent/Corps.
- **Intégrations Externes** : Téléchargement automatique de logos vectoriels via **Brandfetch** et de portraits détourés de sportifs via **TheSportsDB**.

### 4. 🎙️ Moteur Audio & Traitement Intelligent des Silences
- **Voix Off Studio IA** : Synthèse vocale ultra-naturelle via **ElevenLabs** et **Kokoro TTS** local.
- **Jump-Cut Automatique (`cut_silences.cjs`)** : Détection et suppression des hésitations et silences sous un seuil paramétrable (ex: -12 dB).
- **Nettoyage des Prises (`detect_bad_takes.cjs`)** : Analyse acoustique pour supprimer les répétitions et bafouillages dans les rushes vocaux.

### 5. 🤖 Kombo IA & Script-to-Video
- **Orchestration Multi-Fournisseurs** : Prise en charge modulaire de **Google Gemini 2.0**, **Anthropic Claude 3.7**, **xAI Grok 3** et **OpenAI**.
- **Scénarisation & Direction Artistique** : Génération de découpages techniques conformes aux 17 règles de design professionnelles de Joseph (Ultimate Editors).

### 6. 💼 Espace Clients & Collaboration Monteur
- **Gestionnaire de Projets Clients** : Organisation étanche des rushes et des projets de chaque client (Alexandre, Fit_Coach, SaaS...).
- **Suivi de Production** : Statuts en temps réel (*Rushes importés, En cours de montage, Prêt pour validation, Livré*).

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- Google Chrome ou Microsoft Edge (utilisé pour le rendu headless)
- Système d'exploitation : Windows, macOS ou Linux

### 2. Installation
```bash
# Cloner le dépôt
git clone https://github.com/NdarawFall/MarvidFlow.git
cd MarvidFlow

# Installer les dépendances
npm install
```

### 3. Lancer le Studio
```bash
npm start
# OU
npm run studio
```
Le serveur démarre immédiatement et ouvre votre navigateur par défaut sur :
👉 **`http://localhost:3000/09_Pages/home.html`**

---

## 🔑 Configuration Sécurisée des Clés API

MarvidFlow intègre un gestionnaire visuel de clés API sans aucune ligne de commande :

1. Cliquez sur **« Paramètres »** dans le menu latéral gauche.
2. Saisissez vos clés selon vos besoins :
   - **Google AI Studio (Gemini)** : Génération de concepts, scripts et direction artistique ([Clé gratuite](https://aistudio.google.com/app/apikey))
   - **ElevenLabs** : Voix off studio haute fidélité ([Obtenir une clé](https://elevenlabs.io/))
   - **Brandfetch API** : Récupération de logos vectoriels de marques ([Obtenir une clé](https://brandfetch.com/developers))
   - **Pixabay / Coverr / Remove.bg** : B-rolls et détourages d'images automatiques
3. Cliquez sur **« Enregistrer les Paramètres »**. 

> [!IMPORTANT]
> Les clés sont sauvegardées localement dans un fichier privé non versionné (`07_Scripts/api_config.json`). **Elles ne sont JAMAIS envoyées sur GitHub.**

---

## 🛠️ Commandes Disponibles (NPM Scripts)

| Commande | Rôle |
| :--- | :--- |
| `npm start` ou `npm run studio` | Démarre le serveur local MarvidFlow sur le port 3000 |
| `npm run desktop` | Démarre MarvidFlow en **application de bureau native Windows** (Electron) |
| `npm run render` | Déclenche le pipeline de rendu vidéo headless (Puppeteer + FFmpeg vers MP4) |
| `npm run pack` | Prépare le paquet exécutable décompressé pour Windows |
| `npm run dist` | Génère l'installeur Windows `.exe` officiel (*MarvidFlow-Setup.exe*) |

---

## 📂 Architecture du Projet

```text
MarvidFlow/
├── 00_Skills/          # Directives de design, physique d'animation, typographie et narration
├── 01_Assets/          # Médiathèque locale (Musiques, SFX, Voix off, Logos, Fonts, Rushs)
├── 02_Composants/      # Blocs UI vidéo (Sous-titres dynamiques, Badges, Split screens, Cartes)
├── 03_Chaines/         # Configurations des chaînes et Brand Kits (couleurs, typographies)
├── 04_Videos/          # Compositions vidéo interactives HTML5 / GSAP prêtes au rendu
├── 05_Scenes/          # Fragments et plans vidéo modulaires
├── 06_Templates/       # Gabarits de montage réutilisables (Shorts, Explainers, Interviews)
├── 07_Scripts/         # Moteurs d'automatisation Node.js :
│   ├── studio-server.cjs        # Serveur web HTTP central & API REST (cache mémoire, routes)
│   ├── ai_director.cjs          # Orchestrateur de création de scènes par IA
│   ├── ai_kombo.cjs             # Pont multi-modèles (Claude, Gemini, Grok, GPT)
│   ├── cut_silences.cjs         # Découpage intelligent des silences audio (-12 dB)
│   ├── detect_bad_takes.cjs     # Détection et purge des répétitions orales
│   ├── auto_reframe.cjs         # Recadrage automatique 16:9 vers 9:16 vertical
│   ├── fetch_sportsdb.cjs       # Téléchargement de portraits joueurs détourés (PNG)
│   └── fetch_music.cjs          # Téléchargement de morceaux libres de droit
├── 08_Rendus/          # Dossier d'exportation des vidéos finales MP4 (60 FPS)
├── 09_Pages/           # Interface utilisateur web du studio (CSS cinématique, JS modulaire)
│   ├── home.html                # Tableau de bord principal tout-en-un
│   ├── monteur.html             # Espace de travail dédié aux clients et rushes
│   ├── assets.html              # Médiathèque globale avec lecteur audio et prévisualisation
│   ├── css/                     # Feuilles de style (home.css, assets.css...)
│   └── js/                      # Contrôleurs front-end (home.js, assets.js, monteur.js...)
├── Clients/            # Dossiers clients isolés contenant leurs rushs et livrables
├── electron-main.cjs   # Point d'entrée de l'application de bureau Electron
├── package.json        # Métadonnées, dépendances et configurations de compilation
└── README.md           # Documentation officielle du projet
```

---

## 🛡️ Sécurité & Bonnes Pratiques

- 🔒 **Zéro fuite d'identifiants** : `api_config.json`, `.env` et les tokens d'accès sont strictement exclus par le `.gitignore`.
- 📦 **Dépôt ultra-léger** : Les exports lourds (`08_Rendus/*.mp4`) et les caches temporaires sont automatiquement ignorés.
- 👥 **Prêt pour le travail d'équipe** : Tout développeur ou monteur peut cloner le projet, installer les dépendances et démarrer en quelques secondes sans configuration complexe.

---

## 👨‍💻 Auteur & Licence

Développé avec passion par **[Ndaraw Fall](https://github.com/NdarawFall)**.  
Distribué sous licence **ISC**.
