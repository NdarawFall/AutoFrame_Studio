---
name: Camera
description: Mouvements de caméra cinématographiques et dynamiques en GSAP seek-safe (slow push-in, crash zoom, whip pan, dolly parallaxe 3D, camera shake d'impact, orbital 3D, focus racking, pedestal, dutch angle) avec rig de caméra, règles de perspective, inertie, easing et synchronisation narrative.
---

# CAMERA & DYNAMIC MOVEMENTS — VibeEditor

> **Principes directeurs** : Une caméra ne bouge jamais par hasard. Chaque mouvement guide le regard du spectateur, crée une tension émotionnelle ou apporte une sensation de volume 3D à des éléments 2D/UI. Le mouvement de caméra est le liant suprême du montage moderne.

---

## 0. Contrat Technique Caméra (Non Négociable)

Pour garantir un rendu 100% déterministe sous Puppeteer/Headless et un scrubbing fluide dans le studio :

1. **Architecture du Rig de Caméra (World vs Viewport)** :
   - `#stage` : conteneur racine fixe (1920x1080), `overflow: hidden`, `perspective: 1200px` (ou `1400px` pour un rendu plus téléobjectif).
   - `#world` : conteneur scène 3D (`transform-style: preserve-3d; width: 100%; height: 100%; transform-origin: center center;`).
   - Bouger la caméra revient à déplacer le `#world` dans le sens inverse :
     $$\text{Caméra va à droite} \implies \text{World bouge à gauche } (x < 0)$$
     $$\text{Caméra avance (zoom in)} \implies \text{World scale augmente ou } z > 0$$

2. **Déterminisme & Seek-Safety** :
   - Tout mouvement de caméra vit dans la timeline principale GSAP (`window.tl = tl`).
   - Interdiction de `requestAnimationFrame`, `setTimeout`, `setInterval` ou d'oscillateurs non déterministes.
   - Les vibrations (Camera Shakes) doivent utiliser des tables de valeurs précalculées ou un PRNG seedé (`mulberry32`), jamais de `Math.random()`.

3. **Inertie et Masse de Caméra** :
   - Une caméra physique a du poids. Les transitions brutales sans easing (`linear` sur des accélérations) sont formellement proscrites, sauf pour les cuts secs.
   - Easing d'impact : `power4.out` / `expo.out` (pour le snap zoom).
   - Easing cinématographique doux : `sine.inOut` / `power2.inOut` (pour les travellings et push lents).

---

## 1. Les 10 Mouvements de Caméra Fondamentaux

| Mouvement | Durée Recommandée | Easing | Intention Narrative & Cas d'Usage |
|---|---|---|---|
| **1. Slow Push-In (Creep)** | 3.0s – 6.0s (toute la scène) | `none` ou `sine.out` | Éliminer l'inertie statique, instaurer de la tension ou une écoute attentive. Subtil (`scale: 1.0` $\rightarrow$ `1.06` ou `z: 0` $\rightarrow$ `80px`). |
| **2. Crash Zoom (Snap Zoom)** | 0.20s – 0.35s | `power4.out` ou `back.out(1.4)` | Coup de poing visuel sur un chiffre choc, un mot clé décisif ou une révélation. |
| **3. Whip Pan (Swish Pan)** | 0.25s – 0.40s | `power3.inOut` ou `expo.inOut` | Transition cinétique ultra-rapide entre deux cartes ou deux sections opposées (+ flou directionnel). |
| **4. Pull-Back de Révélation** | 1.2s – 2.5s | `power2.out` | Dézoom arrière pour dévoiler l'image globale, un écosystème ou la conclusion d'un raisonnement. |
| **5. Dolly Parallaxe 3D** | 2.5s – 4.5s | `power2.inOut` | Translation horizontale ($x$) couplée à une contre-rotation ($rotY$). Crée un volume volumétrique saisissant. |
| **6. Camera Impact Shake** | 0.25s – 0.45s | Décroissance exponentielle | Secousse amortie lors d'un slam de texte, d'un coup de poing ou d'une explosion de statistiques. |
| **7. Pedestal & Tilt (Vertical)** | 1.5s – 3.0s | `power2.out` | Balayage de bas en haut (valorisation héroïque, prestige) ou de haut en bas (ancrage dans les détails). |
| **8. Orbital 3D (Arc Shot)** | 3.0s – 5.0s | `sine.inOut` | Rotation fluide en arc de cercle autour d'un mockup d'ordinateur, téléphone ou carte héroïque. |
| **9. Dutch Angle (Roll Néerlandais)** | 1.0s – 2.0s | `power2.out` | Inclinaison $rotZ$ de $3^\circ$ à $6^\circ$ pour briser la monotonie horizontale et dynamiser un plan tech. |
| **10. Vertigo Effect (Dolly Zoom)** | 2.0s – 3.5s | `power2.inOut` | Zoom avant du sujet pendant que l'arrière-plan s'écarte (dézoom inverse), sensation de choc mental. |

---

## 2. Structure HTML & CSS du Rig Caméra

```html
<div id="stage">
    <!-- Rig Caméra Principal -->
    <div id="camera-rig">
        <div id="world">
            <!-- Arrière-plan (Parallaxe lointaine) -->
            <div class="layer layer-bg" data-depth="0.2">...</div>
            
            <!-- Plan Médian (Cartes, Sujet principal, Contenu UI) -->
            <div class="layer layer-mid" data-depth="1.0">...</div>
            
            <!-- Avant-plan (Particules flottantes, reflets, overlay) -->
            <div class="layer layer-fg" data-depth="1.8">...</div>
        </div>
    </div>
</div>
```

```css
#stage {
    width: 1920px;
    height: 1080px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    perspective: 1200px; /* Profondeur focale */
}

#camera-rig {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
}

#world {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transform-origin: center center;
}

.layer {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
}
```

---

## 3. Helpers & Recettes GSAP Prêtes à l'Emploi

### 1. Slow Push-In Cinématographique
Maintient une vie constante sur l'écran pendant toute la durée de la scène :
```javascript
function cameraSlowPush(tl, worldSelector, startTime, duration, targetScale = 1.06) {
    tl.fromTo(worldSelector, 
        { scale: 1.0 },
        { scale: targetScale, duration: duration, ease: "none" },
        startTime
    );
}
```

### 2. Crash Zoom d'Impact (Snap Zoom)
Projection instantanée sur une zone spécifique ou un mot-clé :
```javascript
function cameraCrashZoom(tl, worldSelector, startTime, targetX = 0, targetY = 0, zoom = 1.45) {
    tl.to(worldSelector, {
        scale: zoom,
        x: -targetX * (zoom - 1),
        y: -targetY * (zoom - 1),
        duration: 0.30,
        ease: "power4.out"
    }, startTime);
}
```

### 3. Whip Pan (Transition par Balayage Rapide)
Glissement horizontal avec flou de mouvement :
```javascript
function cameraWhipPan(tl, worldSelector, startTime, direction = 'left', distance = 1920) {
    const mult = direction === 'left' ? -1 : 1;
    const dur = 0.35;
    
    // Déplacement rapide avec légère rotation dynamique
    tl.to(worldSelector, {
        x: `+=${mult * distance}`,
        rotationY: mult * -12,
        duration: dur,
        ease: "power3.inOut"
    }, startTime);
    
    // Rétablissement de l'angle droit
    tl.to(worldSelector, {
        rotationY: 0,
        duration: 0.2,
        ease: "power2.out"
    }, startTime + dur);
}
```

### 4. Dolly Parallaxe 3D (Volume & Profondeur)
Déplace la caméra latéralement tout en faisant pivoter subtilement l'angle de vue :
```javascript
function cameraDollyParallax(tl, worldSelector, startTime, duration, deltaX = 180, rotY = 8) {
    tl.fromTo(worldSelector,
        { x: -deltaX / 2, rotationY: -rotY },
        { x: deltaX / 2, rotationY: rotY, duration: duration, ease: "sine.inOut" },
        startTime
    );
}
```

### 5. Camera Impact Shake (Déterministe & Seek-Safe)
Secousse d'impact lors d'une explosion de statistiques ou d'un slam de texte (100% reproductible frame-by-frame) :
```javascript
function cameraImpactShake(tl, worldSelector, startTime, intensity = 18) {
    // Séquence déterministe pré-calculée (pas de Math.random)
    const offsets = [
        { x: -intensity, y: intensity * 0.7, rot: -1.2 },
        { x: intensity * 0.8, y: -intensity * 0.6, rot: 1.0 },
        { x: -intensity * 0.5, y: intensity * 0.4, rot: -0.6 },
        { x: intensity * 0.3, y: -intensity * 0.2, rot: 0.3 },
        { x: 0, y: 0, rot: 0 }
    ];
    
    const stepDur = 0.05;
    offsets.forEach((off, idx) => {
        tl.to(worldSelector, {
            x: off.x,
            y: off.y,
            rotationZ: off.rot,
            duration: stepDur,
            ease: "power1.out"
        }, startTime + (idx * stepDur));
    });
}
```

### 6. Orbital 3D Arc (Showcase Produit / Mockup)
Tourne gracieusement autour d'une interface ou d'un mockup en 3D :
```javascript
function cameraOrbit3D(tl, cardSelector, startTime, duration, angle = 18) {
    tl.fromTo(cardSelector,
        { rotationY: -angle, rotationX: 8, scale: 0.94 },
        { rotationY: angle, rotationX: -4, scale: 1.0, duration: duration, ease: "sine.inOut" },
        startTime
    );
}
```

---

## 4. Règles d'Or & Direction Artistique

1. **Règle de Motivation Narrativo-Visuelle** :
   - N'utilisez jamais un zoom ou un pan s'il n'est pas corrélé à une information clé.
   - Si la voix ou le texte aborde un détail $\rightarrow$ *Crash Zoom*.
   - Si la voix parle d'un ensemble / marché global $\rightarrow$ *Pull-Back*.
   - Si le ton monte en intensité dramatique $\rightarrow$ *Slow Push-In*.

2. **Préservation de la Lisibilité (Text Safety Zone)** :
   - Lorsqu'un texte important est lu, la vitesse angulaire de la caméra ($rotX, rotY$) ne doit pas dépasser $4^\circ$ sous peine d'altérer le confort de lecture.
   - Les Crash Zooms doivent TOUJOURS avoir leur point d'inflexion calé sur le mot ou chiffre focalisé.

3. **Gestion des Plans de Profondeur (Z-Layers)** :
   - Pour un rendu cinématographique, superposez toujours au moins 3 strates :
     1. Arrière-plan doux flouté ou ambiant (vitesse 0.3x)
     2. Contenu héroïque net (vitesse 1.0x)
     3. Particules / bokeh d'avant-plan (vitesse 1.8x)

4. **Combinaison Son & Mouvement** :
   - Tout *Whip Pan* doit être synchronisé avec un SFX *Whoosh* ou *Swoosh*.
   - Tout *Crash Zoom* gagne à être verrouillé sur un impact de basse (*Sub Boom / Hit*).
   - Tout *Camera Shake* s'accompagne d'un son d'impact puissant pour ancrer la physicalité.

---

## 5. Checklist Anti-Erreurs avant Rendu

- [ ] `#stage` a bien `overflow: hidden` et `perspective` définis ?
- [ ] Le `transform-origin` est-il positionné sur le point focal lors des zooms ?
- [ ] Zéro utilisation de `Math.random()` dans les secousses de caméra (reproductibilité garantie) ?
- [ ] Les mouvements de caméra respectent-ils les zones de sécurité (aucun élément critique rogné) ?
- [ ] La caméra s'immobilise-t-elle ou ralentit-elle lors des moments de lecture dense ?
- [ ] Le retour arrière (`seek(t)`) dans le studio reproduit-il fidèlement la position exacte de la caméra ?
