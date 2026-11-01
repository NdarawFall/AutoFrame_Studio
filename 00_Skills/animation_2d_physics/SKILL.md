---
name: animation_2d_physics
description: Règles fondamentales et mathématiques pour l'animation 2D, la gestion infaillible des points d'ancrage (transformOrigin / svgOrigin), l'usage raisonné des mouvements de caméra sans débordement, et l'éradication définitive des titrages scolaires "IA slop".
---

# Skill : Animation 2D, Physique & Précision Géométrique

Ce skill formalise les règles indispensables pour concevoir des animations 2D sans défauts mécaniques, sans dérive de points d'ancrage et sans titrages didactiques stéréotypés.

---

## 🎯 1. La Règle d'Or des Points d'Ancrage SVG & 2D (Anchor Points)

### Le Piège Absolu : L'Aiguille qui Voltige Hors du Cadran
* **Erreur CATASTROPHIQUE fréquente :** Écrire `svgOrigin: "0 0"` en pensant que cela correspond au centre local d'un groupe.
* **Pourquoi l'aiguille s'envole :** Dans GSAP, **`svgOrigin` opère TOUJOURS dans le repère global du viewBox SVG racine** ! Si votre cadran est centré à `(180, 180)` et que vous mettez `svgOrigin: "0 0"`, GSAP fait tourner l'aiguille autour du coin supérieur gauche (0, 0) du SVG. Résultat : dès le début de la rotation, l'aiguille est éjectée à des centaines de pixels en orbite et quitte le cadran !

### La Solution Mathématique Infaillible : Coordonnées Réelles `svgOrigin: "cx cy"`
1. Le centre du cadran ou de l'horloge est défini à `(cx, cy)` dans le `viewBox` (ex: `viewBox="0 0 360 360"`, centre = `180, 180`).
2. L'aiguille est dessinée avec sa base exactement ancrée au centre `(cx, cy)` :
```html
<svg viewBox="0 0 360 360">
    <!-- Cadran centré à (180, 180) -->
    <circle cx="180" cy="180" r="140" fill="none" stroke="#333" stroke-width="12"/>
    <circle cx="180" cy="180" r="8" fill="#fff"/>
    <!-- Groupe de l'aiguille : base à (180, 180), pointe vers le haut à (180, 70) -->
    <g id="clockHand">
        <line x1="180" y1="180" x2="180" y2="70" stroke="#06b6d4" stroke-width="5" stroke-linecap="round"/>
        <circle cx="180" cy="180" r="6" fill="#06b6d4"/>
    </g>
</svg>
```
3. Dans GSAP, l'origine de rotation DOIT IMPÉRATIVEMENT être les coordonnées réelles du centre `"cx cy"` (ex: `"180 180"`) :
```javascript
// OBLIGATOIRE : svgOrigin DOIT être égal aux coordonnées exactes du centre "180 180"
gsap.set('#clockHand', {
    svgOrigin: "180 180"
});

// L'aiguille pivote alors avec une perfection absolue sur son centre sans dévier d'un cheveu :
gsap.to('#clockHand', {
    rotation: 360,
    duration: 10,
    ease: "none",
    repeat: -1
});
```

#### Solution B : Le Pivot HTML/CSS (Axe Absolu avec `transform-origin: 50% 100%`)

---

## 🚫 1.1 BANNISSEMENT STRICT DES TEXTES ET BADGES AUX 4 COINS DE L'ÉCRAN
* ❌ **INTERDICTION ABSOLUE :** Ne JAMAIS placer de textes, badges, timecodes, résolutions ou fausses métadonnées HUD collées dans les 4 coins du cadre (`top-left`, `top-right`, `bottom-left`, `bottom-right` du type `.hud-telemetry`, `VIBE ENGINE // v1.0`, `TEMPO 120 BPM`, `RES 1080p`, etc.).
* **Pourquoi :** Cela donne un aspect amateur, didactique et surchargé de type "diaporama PowerPoint". Une vidéo de calibre professionnel (type Vox, pub Apple, documentaire de cinéma) respire. Le regard du spectateur doit être guidé vers le sujet narratif et le centre focal, pas distrait par des parasites textuels aux 4 coins.
* ✅ **Règle d'Or :** Les 4 coins du cadre doivent rester 100% vides, épurés et respirer. Tout texte affiché doit avoir une justification narrative directe dans la scène en cours.

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

---

## 📈 7. SUIVI CONTINU DE COURBE SVG (PATH TRACKING) : FIN DES SAUTS DE POINTS

### Le Problème Fréquent
* Tenter d'animer un point ou un curseur le long d'une courbe en déclenchant des `tl.to(point, { cx: x1, cy: y1 })` successifs entre des points arbitraires.
* **Résultat disgracieux :** Le point se déplace en ligne droite entre chaque étape et fait des sauts visibles, déconnecté du tracé bezier réel de la courbe.

### La Règle d'Or : `path.getPointAtLength()` Sub-pixel
Toujours dériver la position du point traceur mathématiquement de la longueur réelle du path SVG :
```javascript
const curve = document.getElementById('myCurve');
const curveLen = curve.getTotalLength();
const tracker = { progress: 0 };

tl.to(tracker, {
    progress: 1,
    duration: 3.5,
    ease: "power1.inOut",
    onUpdate: () => {
        const p = tracker.progress;
        // 1. Remplir le tracé exactement
        curve.style.strokeDashoffset = curveLen * (1 - p);
        // 2. Ancrer le point sur le tracé au millième de pixel près
        const pt = curve.getPointAtLength(p * curveLen);
        const pointEl = document.getElementById('myPoint');
        if (pointEl) {
            pointEl.setAttribute('cx', pt.x);
            pointEl.setAttribute('cy', pt.y);
        }
    }
});
```
* **Résultat :** Le point colle de manière organique et continue à la pointe du tracé, sans aucun à-coup ni saut rectiligne.

---

## 📐 8. CENTRAGE STRICT DES GRILLES DE CARDS (ZÉRO DÉCALAGE LATÉRAL)

### Le Piège du Décalage à Droite ou à Gauche
* Dans une flexbox `.scene`, attribuer à un conteneur de grille `width: 100%; max-width: 1480px;` sans spécifier `margin: 0 auto; justify-content: center;` peut provoquer un alignement asymétrique vers la droite ou la gauche.

### La Règle Infaillible pour 3 Cards Alignées
```html
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; width: 100%; max-width: 1480px; margin: 0 auto; justify-content: center; align-items: stretch;">
    <div class="glass-card" style="width: 100%; max-width: 460px; margin: 0 auto;">Card 1</div>
    <div class="glass-card" style="width: 100%; max-width: 460px; margin: 0 auto;">Card 2</div>
    <div class="glass-card" style="width: 100%; max-width: 460px; margin: 0 auto;">Card 3</div>
</div>
```
* Chaque carte a une largeur équilibrée (~460px), les marges gauche et droite du canvas sont strictement égales (`(1920 - 1480) / 2 = 220px`), garantissant un centrage parfait au pixel près.

---

## 🎭 9. DIVERSITÉ DES CINÉMATIQUES D'ENTRÉE (BANNIR LE SLIDE/FONDU RÉPÉTITIF)

Il est formellement interdit d'utiliser la même transition `tl.from({ y: 30, opacity: 0 })` sur toutes les scènes consécutives. Une vraie direction artistique varie les mécaniques :

1. **3D Perspective Unfolding / Drop :**
   ```javascript
   tl.from(card, { transformPerspective: 1000, rotateX: -25, y: -60, scale: 0.9, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
   ```
2. **Masked Clip-Path Wipe :**
   ```javascript
   tl.fromTo(element, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut" });
   ```
3. **Blur-To-Focus Kinetic Snap :**
   ```javascript
   tl.fromTo(element, { filter: "blur(20px)", scale: 0.95, opacity: 0 }, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" });
   ```
4. **Radial Aperture Expand (Circle Wipe) :**
   ```javascript
   tl.fromTo(container, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(120% at 50% 50%)", duration: 0.9, ease: "power2.out" });
   ```
5. **Elastic Domino Cascade :**
   ```javascript
   tl.from(cardsArray, { y: 70, rotation: (i) => [-4, 0, 4][i], scale: 0.88, opacity: 0, stagger: 0.18, ease: "back.out(1.6)" });
   ```

---

## 🎵 10. COMPOSITION MUSICALE SUR MESURE DE TOUTE PIÈCE

* Ne jamais recycler indéfiniment la même boucle musicale préexistante.
* Utiliser les générateurs procéduraux intégrés (`00_Skills/reconstruction_documentary/scripts/music.py`) pour composer un morceau 100% original adapté au tempo exact (BPM), à la progression dramatique et à l'identité visuelle de la composition.


