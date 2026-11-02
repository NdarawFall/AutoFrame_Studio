# 📁 Dossier Clients — Vidéos Brutes & Rushes Non Montés

Ce dossier est dédié à la réception des **fichiers vidéos bruts (non montés)** fournis par vos clients pour vos prestations d'**éditeur de formats courts (Shorts, Reels, TikTok, YouTube Shorts)**.

---

## 🎯 Rôle & Philosophie
- **Dossier source brut** : Vous déposez ici les vidéos sources de vos clients (enregistrements facecam, podcasts bruts, démos d'écran, rushes 4K/HD).
- **Confidentialité & Stockage Git** : Ce dossier est strictement **exclu de Git** (via `.gitignore`) afin de protéger la confidentialité des données de vos clients et d'éviter de saturer le dépôt avec des fichiers vidéo volumineux.
- **Dossier vide par défaut** : Seul ce fichier `README.md` et `.gitkeep` sont suivis dans le dépôt.

---

## 📂 Organisation Recommandée par Client
Créez un sous-dossier par client ou par projet :
```text
10_Clients/
├── client_alpha/
│   ├── rush_interview_01.mp4
│   ├── rush_broll_02.mp4
│   └── brief_client.txt
├── client_saas/
│   ├── demo_ecran_brute.mov
│   └── voix_temoignage.mp3
└── client_coach/
    ├── live_partie_1.mp4
    └── live_partie_2.mp4
```

---

## ⚡ Utilisation par l'Éditeur & le Studio
1. Déposez vos rushes clients dans `10_Clients/<nom_client>/`.
2. Lors de la création du montage Short dans VibeEditor, l'IA et les scripts de découpe exploitent ces vidéos sources pour :
   - Élaguer les temps morts et silences.
   - Poser les sous-titres cinétiques mot par mot.
   - Intégrer les B-rolls, zooms dynamiques et effets de rétention.
3. Les compositions HTML finales sont générées dans `04_Videos/` ou `03_Chaines/` et rendues dans `08_Rendus/`.
