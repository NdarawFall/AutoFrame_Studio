---
name: apple_design
description: Directives artistiques et standards de design Apple (Apple Keynote, Apple Card, Bento Grid, Dynamic Island, Typographie SF Pro, Squircles, Mode Studio Lumineux & Fond Dégradé Néon). Fondé sur les références visuelles officielles Apple et les principes d'excellence de composition vidéo.
---

# Skill : Apple Design Mastery (Direction Artistique & UI/UX Apple)

Ce skill formalise les **standards de design industriel et graphique d'Apple** pour la création de présentations de produits haut de gamme, de vidéos de lancement et d'animations publicitaires virales.

Il s'appuie directement sur l'analyse des assets de référence du dossier [`01_Assets/References/`](file:///c:/Users/ndara/heygen-new/01_Assets/References) :
* [`Apple Card is Here.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/Apple%20Card%20is%20Here.jpg) — Typographie pure, minimalisme et dégradés néon/pastel soyeux.
* [`card_design.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/card_design.jpg) — Squircles parfaits, padding aéré et boutons pilules.
* [`design_1.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/design_1.jpg) — Giant Stats monumentaux (`2X`) et profondeur 2.5D multi-plans.
* [`806285139576294015.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/806285139576294015.jpg) — Architecture Apple Bento Grid et hiérarchie dual-font.
* [`Instagram.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/Instagram.jpg) — Cartes Apple Wallet avec jauges et superpositions soignées.
* [`678143656457756602.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/678143656457756602.jpg) — Pilules avec anneaux d'activité Apple Watch néon.
* [`ui_design.jpg`](file:///c:/Users/ndara/heygen-new/01_Assets/References/ui_design.jpg) — Glassmorphism acrylique en mode clair avec ombres diffuses.

---

## 🎨 1. Palette Chromatique & Traitement des Arrière-Plans

Apple n'utilise **JAMAIS** de grilles filaires 3D de perspective ni de carrelages tranchants dans ses publicités produits. Le fond doit être pur, fluide et immersif.

### A. Mode Studio Lumineux (Light Studio Mode — Défaut Luxe)
* **Fond Primaire (60 %)** : Blanc soyeux pur (`#ffffff` vers `#fffdf7` ou `#fffbeb`).
* **Dégradés Néon Organiques Amorphes (Orbes Floues)** :
  * **Ambiance Or & Ambre Néon** : Orbes diffuses néon jaune foncé (`#f59e0b` / `rgba(245, 158, 11, 0.22)`) combinées à des éclats néon jaune clair (`#fef08a` / `rgba(254, 240, 138, 0.45)`).
  * **Ambiance Pastel Iridescente (Apple Card)** : Dégradé multi-chromatique subtil (rose poudré `#fbcfe8`, lavande `#e9d5ff`, bleu glacier `#cffafe`, vert menthe `#dcfce7`).
* **Ombre Portée au Sol (Ground Shadow)** :
  * Une ellipse douce et diffuse sous les appareils (`rgba(180, 83, 9, 0.08)` à `rgba(0, 0, 0, 0.04)`, `blur: 60px à 100px`) ancrant le produit dans l'espace tridimensionnel sans contact dur.

### B. Mode Keynote Sombre (Dark Pro Mode)
* **Fond Primaire** : Noir graphite sidéral (`#020306` vers `#060814`).
* **Accents** : Lueur rasante titane spéculaire (`#ffffff`), bleu cobalt (`#38bdf8`) ou or champagne (`#d4af37`).

---

## 📐 2. Géométrie des Composants : Squircles & Bento Grid

Apple se distingue par des courbures organiques continues (*Superellipses / Squircles*) supérieures aux simples coins arrondis circulaires.

### A. La Règle des Squircles
* **Grands Conteneurs / Cartes Produits** : `border-radius: 32px à 52px`.
* **Composants Internes / Médias** : `border-radius: 20px à 28px`.
* **Boutons d'Action & Badges d'État** : `border-radius: 999px` (forme de pilule parfaite).
* **Verre Fumé & Acrylic Glassmorphism** :
  * Mode Clair : Fond blanc translucide `rgba(255, 255, 255, 0.88)`, bordure ultra-fine `1px solid rgba(0, 0, 0, 0.08)`, liseré supérieur blanc pur `rgba(255, 255, 255, 0.95)`, flou d'arrière-plan `backdrop-filter: blur(24px)`.
  * Ombre portée d'élévation : `box-shadow: 0 30px 60px -15px rgba(180, 83, 9, 0.12), 0 10px 20px rgba(0, 0, 0, 0.04)`.

### B. Apple Bento Grid (Inspiré de `806285139576294015.jpg`)
* Structure modulaire asymétrique :
  * 1 Tuile héroïque occupant 50% à 60% de la surface (mise en avant de l'innovation majeure).
  * 2 à 3 Tuiles secondaires compactes avec chiffres clés, commutateurs ou badges.
* Espacement rigoureux (*Gaps*) : `16px à 24px` constants entre chaque tuile.
* **Zéro espace vide inutile au bas des cartes** : la hauteur d'une carte doit épouser son contenu au pixel près.

---

## 🔤 3. Typographie Apple & Le Principe du "Giant Stat"

La lisibilité Apple repose sur des contrastes d'échelle démesurés et un calibrage optique au micron.

### A. Polices Officielles & Hiérarchie
* **Police Universelle (80 %)** : `SF Pro Display`, `Inter` ou `Plus Jakarta Sans`.
  * Titres majeurs : Poids `800` ou `900` (Bold / Heavy), tracking resserré (`letter-spacing: -0.03em`).
  * En mode clair : Couleur `#09090b` (noir graphite absolu) pour un contraste d'attention maximal.
* **Police Monospace Technique (10 %)** : `JetBrains Mono` ou `SF Mono` pour les codes d'ingénierie, timestamps et fréquences (`120 HZ`, `38.4 TOPS`, `09:41`).
* **Accent Éditorial (10 %)** : *Serif italique* élégante pour des mots d'impact isolés (ex: *"Start diving Now"*).

### B. La Règle du Chiffre Géant Isolé (Giant Stat)
*(Inspiré de `design_1.jpg` avec `2X` et `téléchargement (2).jpg` avec `16%`)*
* Quand une métrique clé est annoncée (`-19%`, `3 000 NITS`, `48 MP`, `2X`), elle ne doit **JAMAIS** être noyée dans un paragraphe.
* **Taille d'impact** : `80px à 120px` en poids Heavy.
* **Coloration** : Dégradé néon à fort contraste (ambre foncé `#d97706` vers jaune éclatant `#eab308`).
* **Accompagnement** : Un sous-label technique épuré en capitales (`Inter 15px 700`, couleur `#334155`).

### C. Règle Anti-Débordement & Marges de Sécurité
* **Interdiction absolue de faire déborder un texte de son cadre**.
* Si un libellé technique est long :
  1. Réduire la taille de police (ex: `11px` au lieu de `14px`).
  2. Scinder sur 2 lignes équilibrées (ex: `3 NM NANO-ARCHITECTURE` au-dessus de `16-CORE NEURAL ENGINE`).
  3. Marge interne de sécurité de `24px` minimum par rapport aux bordures du composant.

---

## 📱 4. Composants Héroïques Apple Clés

### 1. Le Logo Officiel Apple (`01_Assets/Logos/apple.svg`)
* **Obligation d'Asset Officiel** : Interdiction totale de dessiner le logo à la main.
* **En Intro Héroïque** : Présenté en grand format (`220px à 260px`), centré, **seul sans texte parasite**, animé par balayage spéculaire.
* **Sur le Matériel** : Miroir discret de `48px à 56px` gravé au dos du verre saphir.

### 2. La Dynamic Island Active
* Pilule noire pure (`#000000`, `height: 30px`, `border-radius: 15px`).
* Indicateur caméra TrueDepth circulaire sombre à gauche.
* Barres d'ondes sonores dynamiques cyan/jaune animées en temps réel à droite (`Math.sin(t * 10)`).

### 3. L'Orbe Apple Intelligence (Inspiré de `AI assistant motion.jpg`)
* Sphère d'ondes de lumière holographiques en rotation multi-harmonique.
* Palette de 4 teintes spectrales Apple : rose néon (`#ec4899`), violet électrique (`#8b5cf6`), bleu cyan (`#38bdf8`), ambre chaud (`#facc15`).

### 4. Le HUD Viseur Caméra Broadcast
* Coins de cadrage cinématographiques en équerres `[ + ]`.
* Sélecteur de focales sous forme de pilules tactiles : `[ 13 mm ]`, `[ 24 mm ]`, `[ 120 mm ]` avec la focale active éclairée en ambre or.
* Badge de profil de couleur pro : `ProRes 4K 120 FPS Log (ACES)`.

