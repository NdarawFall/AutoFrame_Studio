# GUIDE COMPLET : CAMÉRA 3D & SCÈNES THREE.JS (ESPACE VECTORIEL, FOV & RIGGING)

Ce guide formalise l'ensemble des règles de cadrage, de navigation et de mouvements de caméra dans les scènes **Three.js / WebGL 3D**.

---

## 📐 1. Les Coordonnées Spatiales et la Perspective 3D

Dans Three.js :
- Axe $+X$ : Droite | Axe $-X$ : Gauche
- Axe $+Y$ : Haut | Axe $-Y$ : Bas
- Axe $+Z$ : Vers la caméra (avant) | Axe $-Z$ : Loin dans la profondeur (arrière)

### Le Setup Standard Broadcast (Caméra Cinématique)
```javascript
// FOV 35° à 42° : Cadrage cinématographique sans déformation grand angle exagérée
const camera = new THREE.PerspectiveCamera(40, 1920 / 1080, 0.1, 100);
camera.position.set(0, 1.8, 7.5);
camera.lookAt(0, 0, 0);
```

---

## 🎬 2. Les 6 Mouvements Majeurs de Caméra 3D

---

### 1. Travelling Orbital 3D (Arc Shot autour d'un Objet ou Personnage)
> **Usage :** Présentation héroïque d'un produit 3D (laptop, sneaker, mascotte, badge) à 360° ou 90°.

```javascript
const camRig = {
    angle: -0.4,
    distance: 7.2,
    height: 1.8,
    targetY: 0
};

// Animation dans GSAP tl
tl.to(camRig, {
    angle: 0.5,           // Rotation orbitale en arc
    distance: 6.0,        // Rapprochement progressif
    height: 1.2,          // Abaissement de la perspective (contre-plongée)
    duration: 4.0,
    ease: "power2.inOut",
    onUpdate: () => {
        camera.position.x = Math.sin(camRig.angle) * camRig.distance;
        camera.position.z = Math.cos(camRig.angle) * camRig.distance;
        camera.position.y = camRig.height;
        camera.lookAt(0, camRig.targetY, 0);
    }
}, tStart);
```

---

### 2. Dolly In Cinématique (Travelling Avant 3D avec Profondeur)
> **Usage :** Plongée dans une pièce isométrique, focus sur un détail d'un objet ou traversée d'une porte.

```javascript
// La caméra avance en ligne droite sur l'axe Z tout en s'ajustant légèrement en Y
tl.to(camera.position, {
    z: 4.2,               // Rapprochement de 7.5 à 4.2
    y: 1.1,
    duration: 3.5,
    ease: "sine.out"
}, tStart);
```

---

### 3. Effet Vertigo 3D (Dolly Zoom / Trombone Shot)
> **Usage :** Sensation de vertige, choc psychologique, révélation soudaine. Le sujet garde exactement la même taille à l'écran pendant que l'arrière-plan s'étire violemment.

$$\text{Taille du sujet à l'écran} \propto 2 \times \text{distance} \times \tan\left(\frac{\text{FOV}}{2}\right) = \text{constante}$$

```javascript
const vertigoRig = {
    distance: 7.0,
    fov: 35
};

// La caméra avance mais le champ de vision (FOV) s'élargit simultanément
tl.to(vertigoRig, {
    distance: 3.5,
    fov: 65,
    duration: 2.5,
    ease: "power2.inOut",
    onUpdate: () => {
        camera.position.z = vertigoRig.distance;
        camera.fov = vertigoRig.fov;
        camera.updateProjectionMatrix(); // Obligatoire lors du changement de FOV
        camera.lookAt(0, 0, 0);
    }
}, tStart);
```

---

### 4. Dutch Angle 3D (Inclinaison Roulis / Roll)
> **Usage :** Dynamiser une composition tech ou souligner une situation instable.

```javascript
// Rotation sur l'axe Z de la caméra (en radians)
tl.to(camera.rotation, {
    z: -0.08,             // Inclinaison de ~4.5 degrés
    duration: 1.2,
    ease: "power2.out"
}, tStart);
```

---

### 5. Fly-Through 3D (Traversée de Scène d'un bout à l'autre)
> **Usage :** Visite immobilière, survol d'une timeline de montage ou exploration d'un environnement complet.

```javascript
tl.to(camera.position, {
    x: 4.5,
    y: 2.2,
    z: 3.0,
    duration: 5.0,
    ease: "none"          // Mouvement régulier pour fluidité visuelle
}, tStart);

// La cible du regard (lookAt) se déplace aussi
tl.to(camLookTarget, {
    x: 2.0,
    y: 0.5,
    z: -1.0,
    duration: 5.0,
    ease: "none"
}, tStart);
```

---

### 6. Shake 3D Déterministe (Secousse de Caméra lors d'un Impact)
> **Usage :** Impact au sol, explosion de stats, coupure brutale. Ne **JAMAIS** utiliser `Math.random()` pour préserver la seek-safety Studio.

```javascript
// Table d'offsets précalculés déterministes
const shakeOffsets = [
    { x: 0.12, y: -0.08, z: 0.05 },
    { x: -0.09, y: 0.06, z: -0.03 },
    { x: 0.05, y: -0.04, z: 0.02 },
    { x: -0.02, y: 0.01, z: 0 },
    { x: 0, y: 0, z: 0 }
];

shakeOffsets.forEach((sh, idx) => {
    tl.to(camera.position, {
        x: initialCamX + sh.x,
        y: initialCamY + sh.y,
        duration: 0.06,
        ease: "sine.inOut"
    }, tImpact + (idx * 0.06));
});
```

---

## 💡 3. Règles d'Éclairage Synchronisé avec la Caméra

1. **La Key Light doit accompagner le sujet** : Si la caméra effectue un tour à 180°, la Key Light doit légèrement tourner avec elle ou être complétée par un Fill Light pour ne jamais laisser le sujet plongé dans l'ombre totale.
2. **Contact Shadows toujours au sol** : La caméra ne doit jamais plonger sous l'axe $Y=0$ pour éviter de voir les ombres de contact par en dessous.
3. **Respect strict des 4 types de fonds autorisés** : Fond Blanc Studio (`#ffffff`), Fond Noir (`#000000`), Fond Couleur Unie ou Dégradé Lumineux Daylight. Jamais de fond spatial ou de particules cosmiques.

