---
name: animation_2d_physics
description: Règles fondamentales et mathématiques pour l'animation 2D, la gestion infaillible des points d'ancrage (transformOrigin / svgOrigin), l'usage raisonné des mouvements de caméra sans débordement, et l'éradication définitive des titrages scolaires "IA slop".
---

# Skill : Animation 2D, Physique & Précision Géométrique

Ce skill formalise les règles indispensables pour concevoir des animations 2D sans défauts mécaniques, sans dérive de points d'ancrage et sans titrages didactiques stéréotypés.

---

## 🎯 1. La Règle d'Or des Points d'Ancrage (Anchor Points)

### Le Piège SVG Classique : L'Effondrement de la Bounding Box
* **Erreur fréquente :** Appliquer une rotation (`rotation: 360`) directement sur une balise SVG `<line>` avec `transformOrigin: "160px 160px"` ou `transformOrigin: "50% 50%"`.
* **Pourquoi ça casse :** Dans le moteur de rendu SVG des navigateurs (Blink, WebKit, Gecko), une ligne verticale (`x1="160" x2="160"`) possède une boîte englobante (*bounding box*) de **largeur nulle (`width: 0`)**. 
  Lorsque CSS ou GSAP tente de calculer un `transform-origin` basé sur un pourcentage ou des pixels relatifs à la boîte de l'élément, le diviseur nul produit des aberrations géométriques : les aiguilles ou bâtons voltigent dans tous les sens au lieu de rester fixés au centre.

### Les 2 Solutions Mathématiques Infaillibles

#### Solution A : Le Pivot `<g>` Translate (Recommandée)
Au lieu de faire tourner la ligne elle-même, positionner un groupe `<g>` au centre exact du cadran `(cx, cy)` avec `transform="translate(cx, cy)"`.
L'aiguille est ensuite dessinée à l'intérieur du groupe par rapport à l'origine `(0, 0)` :
```html
<!-- Cadran au centre (160, 160) -->
<svg viewBox="0 0 320 320">
    <!-- Groupe pivot centré à (160, 160) -->
    <g id="secondHand" transform="translate(160, 160)">
        <!-- L'aiguille pointe vers le haut depuis le centre (0, 0) -->
        <line x1="0" y1="20" x2="0" y2="-120" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#ef4444"/>
    </g>
</svg>
```
En GSAP, animer directement la rotation du groupe en utilisant impérativement **`svgOrigin: "0 0"`** :
```javascript
// OBLIGATOIRE : svgOrigin: "0 0" ancre la rotation au (0, 0) du repère SVG parent
// (transformOrigin sur SVG calcule à partir de getBBox(), ce qui peut introduire un décalage si le sous-élément est asymétrique)
gsap.set(["#hourHand", "#minuteHand", "#secondHand"], {
    svgOrigin: "0 0"
});

gsap.to("#secondHand", {
    rotation: 360,
    duration: 2.0,
    ease: "linear"
});
```

#### Solution B : Le Pivot HTML/CSS (Axe Absolu)
Si l'objet est composé en HTML :
```html
<div class="clock-face" style="position: relative; width: 300px; height: 300px;">
    <!-- Pivot central 0x0 placé à 50% 50% -->
    <div class="hand-pivot" style="position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-origin: 0 0;">
        <div class="hand-line" style="position: absolute; bottom: 0; left: -2px; width: 4px; height: 120px; background: #ef4444; border-radius: 4px;"></div>
    </div>
</div>
```

---

## 📷 2. Usage Raisonné des Zooms de Caméra (Pas de Zoom Aveugle)

### Règle Fondamentale : Le Zoom a une Fonction Narrative, Pas Décorative
* **INTERDIT :** Zoomer arbitrairement sur une liste de cartes, un tableau de données, ou une interface qui remplit déjà l'écran.
* **Conséquences d'un mauvais zoom :**
  - Les éléments agrandis dépassent du cadre vidéo (`viewport 1080x1920` ou `1920x1080`).
  - Le texte d'en-tête ou de légende est masqué ou coupé.
  - L'écran devient illisible et confus.

### Quand le Zoom est-il Autorisé ?
1. **Sur une Image, un Plan Large ou une Carte Géographique :** Quand le décor est vaste et qu'il y a de l'espace vide pour cadrer un détail sans rogner d'information vitale.
2. **Sur une Action Vectorielle Dédiée (ex: Ligne de Hors-Jeu) :** UNIQUEMENT si le texte d'en-tête a été préalablement estompé (`opacity: 0`) et que l'élément zoomé reste parfaitement centré dans les marges de l'écran.

### Quand NE PAS Zoomer :
* Sur des barres de progression, des cartes de statistiques, des listes d'icônes ou des graphiques textuels.
* **Ce qu'il faut faire à la place :** Utiliser des **contrastes lumineux** (lumière néon, surbrillance de bordure, halo pulsant, agrandissement localisé d'une seule valeur sans toucher au cadre général).

---

## 🚫 3. BANNISSEMENT DÉFINITIF DES TITRES ET BADGES "IA SLOP"

### Qu'est-ce que le Titrage "IA Slop" ?
C'est la tendance automatique des modèles IA à coller des **étiquettes didactiques et scolaires** au-dessus de chaque scène :
* ❌ `[ PSYCHOLOGIE DU TEMPS ]`
* ❌ `[ THÉORIE DE PAUL JANET ]`
* ❌ `[ NEUROSCIENCES & COGNITION ]`
* ❌ `[ L'ANTIDOTE PRATIQUE ]`
* ❌ `[ Règle Fondamentale • 01 ]`
* ❌ `[ Chapitre 1 : Introduction ]`
* ❌ `[ Définition Principale ]`

### Pourquoi est-ce Strictement Interdit ?
1. Une vidéo n'est **PAS une présentation PowerPoint** ni un cours magistral d'université.
2. Ce genre d'étiquettes robotiques détruit la rétention d'un spectateur sur YouTube Shorts, TikTok ou Instagram en moins d'une demi-seconde.

### La Méthode Vidéo Virale (Copywriting Cinétique)
Remplacer systématiquement les étiquettes par des **punchlines narratives immersives** :
* ❌ `[ PSYCHOLOGIE DU TEMPS ]` $\rightarrow$ ✅ **« À 8 ANS, L'ÉTÉ EST INFINI. »**
* ❌ `[ THÉORIE DE PAUL JANET ]` $\rightarrow$ ✅ **« LE PIÈGE DES PROPORTIONS »**
* ❌ `[ NEUROSCIENCES & COGNITION ]` $\rightarrow$ ✅ **« TON CERVEAU EN PILOTE AUTOMATIQUE »**
* ❌ `[ L'ANTIDOTE PRATIQUE ]` $\rightarrow$ ✅ **« COMMENT CASSER LA BOUCLE »**

Chaque mot affiché à l'écran doit faire avancer l'histoire, captiver l'émotion ou frapper la curiosité de l'audience.

---

## 🎨 4. RÈGLE ABSOLUE DES 3 COULEURS MAX UNIQUES (CHARTE 60-30-10)

### Le Problème du "Sapin de Noël" Multicolore
* **INTERDIT FORMEL :** Changer la palette de couleurs d'une scène à l'autre (ex: jaune en scène 1, bleu cyan en scène 2, violet en scène 3, vert émeraude en scène 4).
* Une telle disparité visuelle ruine la direction artistique et fait amateur.

### La Charte Harmonique Universelle (3 Couleurs Max)
Toute vidéo doit obligatoirement être articulée autour de **3 couleurs uniques maximales** du début à la fin :
1. **Couleur Primaire (60%)** : Le fond de la vidéo (ex: `#0a0f1d` / sombre bleuté profond).
2. **Couleur Secondaire (30%)** : Les surfaces de cartes, conteneurs et typographies neutres (`#131b2e` pour les cartes, `#ffffff` pour les titres, `#94a3b8` pour les textes de soutien).
3. **Couleur d'Accent Unique (10%)** : L'unique signature chromatique de la vidéo (ex: Ambre Doré `#f59e0b` / `#fbbf24`).
   - Toutes les bordures d'accent, toutes les lueurs (glows), tous les dégradés de mots-clés, toutes les icônes et toutes les barres de progression partagent **cette même couleur d'accent**.
   - *Seule exception autorisée* : Éléments d'interface fonctionnelle stricte (ex: vert pour validation, rouge pour suppression/danger).

---

## ✍️ 5. TYPOGRAPHIE STABLE & ANTI-REFLOW (ZÉRO SAUT DE LIGNE)

### Pourquoi les Titres Changent de Lignes Pendant l'Animation ?
* **Erreur fréquente de l'IA :** Animer `scale` ou `letter-spacing` (ex: `letter-spacing: 0.04em` vers `-0.01em`) sur un titre `<h1>` ou `<h2>` multiligne.
* **Conséquence catastrophique :** Lorsque les lettres s'écartent ou s'agrandissent, le mot final dépasse la largeur du conteneur et est poussé à la ligne suivante (le titre passe de 2 à 3 lignes). Puis, quand l'animation se termine, le mot revient sur la ligne précédente (le titre repasse de 3 à 2 lignes avec un saut visuel désagréable).

### Les 3 Règles d'Or Typographiques :
1. **Taille de texte unique et homogène :** Ne jamais mélanger des tailles disproportionnées au sein d'un même titre qui risquent de forcer un retour à la ligne erratique.
2. **Structure en spans blocs explicites :** Découper les lignes en spans indépendants avec `display: block; white-space: nowrap;` :
   ```html
   <h1 id="s1Title" class="hero-title-short">
       <span class="title-line">À 8 ANS, L'ÉTÉ EST INFINI.</span>
       <span class="title-line highlight-accent">À 30 ANS, L'ANNÉE S'ÉVAPORE.</span>
   </h1>
   ```
3. **Animation cinétique pure par Opacity + Translation Y :**
   ```javascript
   // RECOMMANDÉ : Transition fluide sans altération géométrique des mots
   tl.fromTo("#s1Title",
       { opacity: 0, y: 30 },
       { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
       0.2
   );
   ```
   **Bannir strictement `scale` et `letter-spacing` sur les titres multilignes textuels.**

---

## 🎯 6. CENTRAGE GÉOMÉTRIQUE DES CARTES DE FIN DE SCÈNE

### Le Problème du Card Excentré / Repoussé en Bas
* Lorsque des éléments précédents (ex: liste de piliers, puces) sont masqués avec `opacity: 0`, ils occupent toujours leur hauteur dans le flux vertical flexbox (`height` restante). La carte de conclusion apparaît alors reléguée tout en bas de l'écran.

### La Solution Infaillible : Conteneur Absolu Centré
* Encapsuler la carte de fin et son sous-titre dans un conteneur dédié positionné au centre exact du canvas :
  ```css
  .s4-final-wrapper {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 960px;
      z-index: 10;
  }
  ```
* Cela garantit que la carte de conclusion percutante s'affiche **rigoureusement au centre géométrique de l'écran vertical (1080x1920) ou horizontal (1920x1080)**.

