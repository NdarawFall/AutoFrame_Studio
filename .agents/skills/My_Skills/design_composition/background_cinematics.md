# GUIDE OFFICIEL : ARRIÈRE-PLANS & BACKGROUNDS CINÉMATIQUES (MOTION DESIGN VIBEEDITOR)

L'arrière-plan fait partie intégrante de la narration et de la valeur de production d'une vidéo. Un fond ne doit jamais être un simple rectangle noir par défaut, ni une accumulation de clichés kitsch (interdiction de la grille à pois avec halos grossiers).

Ce guide formalise les **4 familles de backgrounds professionnels**, leur implémentation CSS/GSAP seek-safe, et la règle d'or d'intégration.

---

## 🎨 1. Les 4 Grandes Familles de Backgrounds

---

### Famille 1 : Le Dégradé Néon Liquide / Aurora Flouté Dynamique
> **Usage :** Vidéos Tech, SaaS, Keynotes, Intelligence Artificielle, Lancements de produits haut de gamme (Style Apple / Stripe / Vercel).

#### Concept Visuel :
Des orbes ou nappes de couleur néon (vert émeraude, cyan électrique, indigo profond) en lévitation lente au fond de la scène, adoucies par un **flou optique gaussien très lourd (80px à 130px)**. Le résultat simule un éclairage volumétrique doux ("Aurora Glow") qui respire imperceptiblement sans jamais distraire la lecture.

#### Implémentation CSS :
```css
.bg-aurora-container {
    position: absolute;
    inset: -100px;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
}

.aurora-mesh {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.35;
    will-change: transform;
}

.aurora-1 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(16, 163, 127, 0.45) 0%, transparent 70%);
    top: -100px;
    left: 20%;
}

.aurora-2 {
    width: 650px;
    height: 650px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%);
    bottom: -100px;
    right: 15%;
}
```

#### Animation GSAP Seek-Safe :
```javascript
// Respiration lente et continue sur toute la timeline (durée = DURATION)
tl.to('.aurora-1', {
    x: 80,
    y: 50,
    scale: 1.15,
    duration: DURATION,
    ease: 'sine.inOut'
}, 0);

tl.to('.aurora-2', {
    x: -70,
    y: -40,
    scale: 0.90,
    duration: DURATION,
    ease: 'sine.inOut'
}, 0);
```

---

### Famille 2 : Éléments Géométriques Diagonaux aux Coins Opposés (Étoiles / Formes Floutées Tronquées)
> **Usage :** Effet "Bokeh" de focale cinéma 35mm, branding cinématique, profondeur de champ graphique.

#### Concept Visuel :
Deux formes géométriques stylisées (ex: étoiles à 4 branches, polyèdres, croix cinématiques ou losanges) positionnées dans **deux coins diagonalement opposés** (Haut-Gauche et Bas-Droit).
- **Règle de troncature** : L'élément est placé à cheval sur le bord du cadre (`top: -180px; left: -180px;` et `bottom: -180px; right: -180px;`). On ne voit qu'une moitié ou un quart de l'élément à l'écran.
- **Règle optique** : L'élément tourne **très lentement** sur son propre axe (`rotation: 360` sur 25s–30s) avec un flou d'objectif (`filter: blur(45px - 60px)`) et une opacité feutrée (`0.15 - 0.28`).

#### Implémentation CSS & SVG :
```html
<div class="corner-accents">
    <!-- Étoile Haut-Gauche tronquée -->
    <svg class="corner-shape corner-top-left" viewBox="0 0 200 200">
        <path d="M100 0 C100 60, 140 100, 200 100 C140 100, 100 140, 100 200 C100 140, 60 100, 0 100 C60 100, 100 60, 100 0 Z" fill="var(--accent-color)"/>
    </svg>
    <!-- Étoile Bas-Droit tronquée -->
    <svg class="corner-shape corner-bottom-right" viewBox="0 0 200 200">
        <path d="M100 0 C100 60, 140 100, 200 100 C140 100, 100 140, 100 200 C100 140, 60 100, 0 100 C60 100, 100 60, 100 0 Z" fill="var(--secondary-color)"/>
    </svg>
</div>
```

```css
.corner-accents {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
}

.corner-shape {
    position: absolute;
    width: 480px;
    height: 480px;
    filter: blur(55px);
    opacity: 0.22;
    transform-origin: center center;
    will-change: transform;
}

.corner-top-left {
    top: -180px;
    left: -180px;
}

.corner-bottom-right {
    bottom: -180px;
    right: -180px;
}
```

#### Animation GSAP Seek-Safe :
```javascript
// Rotation continue déterministe sur la durée totale
tl.to('.corner-top-left', { rotation: 360, duration: DURATION, ease: 'none' }, 0);
tl.to('.corner-bottom-right', { rotation: -360, duration: DURATION, ease: 'none' }, 0);
```

---

### Famille 3 : Fond Uni Minimaliste & Haute Définition (Style Shadcn Zinc)
> **Usage :** Démonstrations techniques rigoureuses, comparatifs financiers, tutoriels pros, keynotes solennelles.

#### Concept Visuel :
Un aplat de couleur mat, ultra-propre, sans aucune distraction :
- **Zinc Dark (Shadcn UI)** : `#09090b` (Haut contraste avec bordures `1px solid rgba(255,255,255,0.08)` et texte `#fafafa`).
- **Studio Daylight (Apple Product)** : `#f8fafc` ou `#ffffff` avec ombres de contact douces au sol.
- **Noir Pur OLED** : `#040507` avec vignette radiale imperceptible (`radial-gradient(circle, transparent 65%, rgba(0,0,0,0.8) 100%)`).

---

### Famille 4 : Sub-Pixel Matrix & Fines Lignes Vectorielles
> **Usage :** Visualisation de données, dashboards analytiques, dev tools.
- Grille de lignes sub-pixel ultra-fines (0.5px) à 60px d'espacement avec opacité 0.05, masquée par un masque radial centré pour s'effacer doucement vers les bords.

---

## 🚫 2. Les Erreurs et Interdictions Absolues sur les Backgrounds

1. **Interdiction de la Grille à Gros Pois (Dots Kitsch)** :
   Ne jamais recouvrir toute la scène d'un fond de points opaques façon grille d'école primaire.
2. **Interdiction des Halos Baveux qui recouvrent le Texte** :
   Les lueurs d'ambiance doivent avoir un flou lourd (≥ 80px) et une opacité douce (≤ 0.35). Tout halo qui rend un texte illisible ou grisâtre est une faute éliminatoire.
3. **Zéro Concurrence Visuelle** :
   Le background ne doit **JAMAIS** voler la vedette au premier plan. Si l'œil est attiré par le fond avant le titre ou la démonstration produit, le fond est trop voyant.
