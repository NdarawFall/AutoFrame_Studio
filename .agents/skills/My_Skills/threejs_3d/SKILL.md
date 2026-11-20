---
name: threejs_3d
description: Création de scènes 3D Three.js déterministes et seek-safe pour VibeEditor et le Studio (éclairage studio 3 points, ombres de contact, matériaux MeshStandard/Physical, mockups 3D, timelines de montage flottantes, caméra orbitale et synchronisation GSAP).
---

# THREE.JS 3D MASTERY — VibeEditor

Ce skill formalise les règles et templates de scènes 3D interactives créées avec **Three.js** dans les vidéos VibeEditor.
Il garantit un rendu 3D haute fidélité compatible avec le Studio, le scrubbing interactif, et le moteur d'exportation MP4.

---

## 📐 1. Contrat Technique & Rendu Déterministe

> 🚫 **RÈGLE CRITIQUE UTILISATEUR — INTERDICTION DU FOND "ESPACE" & 4 FONDS AUTORISÉS UNIQUEMENT :**
> L'IA a **l'interdiction formelle et absolue** de créer des arrière-plans de type « espace », « cosmos », « galaxie », nébuleuses ou particules cosmiques flottantes sur les scènes 3D.
> 
> **Les 4 seuls types d'arrière-plans 3D autorisés sont :**
> 1. **Fond Blanc Pur Studio** (`#ffffff` ou `#f8fafc`) avec ombre de contact douce au sol (`contact shadow`) — Style Apple Keynote / Design épuré.
> 2. **Fond Noir Pur Minimaliste** (`#000000` ou `#050505` net sans étoiles ni halos) — Style cinéma OLED contrasté.
> 3. **Fond Couleur Unie** (ex: vert menthe `#2a9d8f`, terracotta `#e07a5f`, bleu nuit `#0f172a`, crème chaud) — Style isométrique épuré.
> 4. **Fond Dégradé Lumineux** (ex: dégradé vertical doux studio blanc vers gris clair `#ffffff` -> `#e2e8f0`, ou dégradé clair pastel) — Ambiance studio daylight lumineuse.


Toute composition Three.js doit respecter scrupuleusement ces 4 impératifs :

1. **Rendu asservi à la timeline maîtresse GSAP** :
   - Ne **JAMAIS** faire dépendre les animations d'un `requestAnimationFrame` autonome en boucle libre.
   - La scène doit être une fonction pure du temps : `applyRigState()` ou `render()` est appelé via `onUpdate` de la timeline GSAP ou lors de `window.__timeline.seek(t)`.
   ```javascript
   const tl = gsap.timeline({
       paused: isIframeMode,
       onUpdate: () => renderer.render(scene, camera)
   });
   window.tl = tl;
   ```

2. **Configuration du WebGLRenderer (Standard Broadcast)** :
   ```javascript
   const renderer = new THREE.WebGLRenderer({
       canvas: document.getElementById('threeCanvas'),
       alpha: true,
       antialias: true,
       powerPreference: 'high-performance'
   });
   renderer.setSize(1920, 1080, false);
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   renderer.toneMapping = THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure = 1.15;
   ```

3. **Éclairage Studio 3 Points Haute Définition** :
   - **Key Light (Lumière Principale)** : `DirectionalLight` blanche chaude (`#ffffff`, intensité 1.8), positionnée en haut-droite avant, castShadow activé.
   - **Fill Light (Débouchage)** : `DirectionalLight` bleutée/cyan douce (`#38bdf8`, intensité 0.6) opposée à la Key Light.
   - **Rim Light (Contre-jour)** : `DirectionalLight` arrière vive (`#f43f5e`, intensité 1.4) pour découper la silhouette des objets du fond.
   - **Ambient Light** : `AmbientLight` douce (`#1e293b`, intensité 0.5) pour éviter les noirs bouchés à 100%.

4. **Ombres de Contact Douces au Sol (Contact Shadows)** :
   - Pour un look premium sans artefacts, placer un disque ou plan sous l'objet avec un dégradé radial d'opacité :
   ```javascript
   const shadowGeo = new THREE.PlaneGeometry(3, 3);
   const shadowMat = new THREE.MeshBasicMaterial({
       color: 0x000000,
       transparent: true,
       opacity: 0.35,
       depthWrite: false
   });
   const shadow = new THREE.Mesh(shadowGeo, shadowMat);
   shadow.rotation.x = -Math.PI / 2;
   shadow.position.y = 0.01;
   scene.add(shadow);
   ```

---

## 🗂️ 2. Composants 3D Prêts à l'Emploi

---

### A. Laptop Workstation 3D (Idéal Tutos, Montage & Tech)
Un ordinateur portable complet avec écran articulé et texture d'interface personnalisable.

```javascript
function createLaptopModel() {
    const laptopGroup = new THREE.Group();

    // 1. Base inférieure (Clavier + Trackpad)
    const baseGeo = new THREE.BoxGeometry(3.2, 0.12, 2.2);
    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25
    });
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.06;
    laptopGroup.add(base);

    // Clavier encastré
    const kbGeo = new THREE.PlaneGeometry(2.6, 1.1);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.rotation.x = -Math.PI / 2;
    kb.position.set(0, 0.125, -0.2);
    laptopGroup.add(kb);

    // 2. Charnière & Écran pivotant
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.12, -1.08);

    const lidGeo = new THREE.BoxGeometry(3.2, 2.1, 0.08);
    const lid = new THREE.Mesh(lidGeo, metalMat);
    lid.position.set(0, 1.05, 0);
    hinge.add(lid);

    // Dalle d'écran (Émissive / Affichage vidéo)
    const screenGeo = new THREE.PlaneGeometry(3.0, 1.9);
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x030712,
        emissive: 0x1e1b4b,
        emissiveIntensity: 0.4,
        roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.05, 0.045);
    hinge.add(screen);

    laptopGroup.add(hinge);
    return { laptopGroup, hinge, screen };
}
```

---

### B. Timeline de Montage Vidéo 3D en Lévitation (Tracks & Clips)
Représentation 3D isométrique ou perspective des pistes vidéo/audio avec clips multicolores stylisés.

```javascript
function createVideoTimelineReel() {
    const timelineGroup = new THREE.Group();

    // Socle / Fond de la timeline
    const bgGeo = new THREE.BoxGeometry(5.0, 0.05, 1.8);
    const bgMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.5,
        roughness: 0.4
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    timelineGroup.add(bg);

    // Piste Vidéo 1 (Cyan)
    const clip1Geo = new THREE.BoxGeometry(1.6, 0.08, 0.35);
    const clip1Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
    const clip1 = new THREE.Mesh(clip1Geo, clip1Mat);
    clip1.position.set(-1.2, 0.06, -0.4);
    timelineGroup.add(clip1);

    // Piste B-Roll (Rose/Rouge)
    const clip2Geo = new THREE.BoxGeometry(1.2, 0.08, 0.35);
    const clip2Mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const clip2 = new THREE.Mesh(clip2Geo, clip2Mat);
    clip2.position.set(0.4, 0.06, -0.4);
    timelineGroup.add(clip2);

    // Piste Audio Wave (Ambre)
    const audioGeo = new THREE.BoxGeometry(3.2, 0.08, 0.35);
    const audioMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const audio = new THREE.Mesh(audioGeo, audioMat);
    audio.position.set(-0.4, 0.06, 0.35);
    timelineGroup.add(audio);

    // Tête de lecture (Playhead rouge lumineuse)
    const playheadGeo = new THREE.BoxGeometry(0.06, 0.25, 1.6);
    const playheadMat = new THREE.MeshStandardMaterial({
        color: 0xff0033,
        emissive: 0xff0033,
        emissiveIntensity: 0.8
    });
    const playhead = new THREE.Mesh(playheadGeo, playheadMat);
    playhead.position.set(-2.0, 0.15, 0);
    timelineGroup.add(playhead);

    return { timelineGroup, playhead, clip1, clip2, audio };
}
```

---

### C. Badge Doré 3D (Revenus / Succès Financier)
Pièce ou écusson métallique doré avec reflets brillants.

```javascript
function createGoldenBadge() {
    const badgeGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.12, 32);
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.95,
        roughness: 0.18
    });
    const badge = new THREE.Mesh(badgeGeo, goldMat);
    badge.rotation.x = Math.PI / 2;
    return badge;
}
```

---

## 🎬 3. Intégration GSAP & Mouvements de Caméra

```javascript
// State objet pour interpoler les propriétés 3D avec GSAP
const sceneRig = {
    laptopRotY: -0.4,
    laptopHingeAngle: -0.2, // ouvert
    playheadX: -2.0,
    camPosZ: 7.0,
    camPosY: 2.2
};

// Animation dans tl
tl.to(sceneRig, {
    laptopRotY: 0.3,
    camPosZ: 5.5,
    playheadX: 1.8,
    duration: 3.5,
    ease: "power2.inOut"
}, t);
```

---

## 📦 4. Téléchargement Automatisé de Modèles 3D Réalistes

Pour ne pas limiter les vidéos à de simples primitives géométriques (cubes/sphères), utiliser le script universel de téléchargement dans `01_Assets/3D/` :

```bash
node 07_Scripts/fetch_3d_model.cjs --query "<mot-clé>"
```

### 🎯 Ordre de Priorité Obligatoire :
1. **Khronos glTF CDN (Priorité 1)** : 100% gratuit, modèles `.glb` officiels ultra-légers et optimisés sans clé API ni limitation (ex: `AntiqueCamera`, `BoomBox`, `DamagedHelmet`, `FlightHelmet`, `SciFiHelmet`, etc.).
2. **Poly Haven (Priorité 2)** : 100% gratuit licence CC0, modèles d'objets du quotidien scannés en haute fidélité avec textures réalistes 1k/2k (pas de 4k pour alléger la vidéo).
3. **Sketchfab (Priorité 3 - Dernier recours)** : Uniquement pour cas rares ou sur demande explicite (`--source sketchfab`), nécessite un token dans `api_config.json`.

### Intégration standard Three.js avec GLTFLoader :
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('../01_Assets/3D/mon_modele.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(model);
});
```

---

## 🐾 5. Règles Critiques d'Animation 3D, Pathfinding & Biomécanique (Zéro Clipping & Zéro Marche en Reculons)

### 5.1 Règle de Non-Traversée d'Objets (Zéro Clipping / Pathfinding Réaliste)
> 🚫 **INTERDICTION FORMELLE DE TRAVERSER DES MEUBLES OU DES MURS :**
> - Aucun personnage, animal ou objet mobile ne doit **JAMAIS traverser un meuble en ligne droite** (ex: un chien ou un humain passant à travers une table basse ou un canapé).
> - **Obligation de Waypoints & Contournement** : Si un meuble est sur le chemin, la trajectoire GSAP doit être découpée en étapes (`waypoints`) contournant l'obstacle avec une trajectoire courbe naturelle, OU l'agencement de la pièce doit laisser un couloir de passage large et dégagé.

### 5.2 Orientation Vectorielle du Regard et du Corps (Zéro Marche en Reculons)
> 🧭 **LE CORPS S'ORIENTE DANS LE SENS DU VECTEUR DÉPLACEMENT :**
> - Avant d'avancer vers une cible, le personnage ou l'animal **doit obligatoirement pivoter sur son axe Y** (`rotation.y = Math.atan2(dx, dz)`) pour lui faire face.
> - **Interdiction formelle de glisser ou de marcher en reculons** sans justification narrative explicite (peur/recul). Pour courir vers son maître, le chien pivote pour le regarder, puis court en marche avant dans l'axe de son museau.

### 5.3 Biomécanique Réaliste des Postures (S'accroupir / S'agenouiller)
> 🧎 **ANATOMIE COHÉRENTE DU CORPS HUMAIN :**
> - Lorsqu'un personnage s'agenouille ou s'accroupit pour caresser un animal :
>   - Le bassin descend verticalement vers le sol (`torso.position.y` descend de 1.7 à 0.85).
>   - Les cuisses plient vers l'avant, **mais les tibias et les pieds restent posés au sol ou partent vers l'arrière sous le corps**.
>   - **INTERDICTION FORMELLE** de faire pivoter les jambes entières rigides vers l'avant (ce qui ressemble à des jambes cassées flottant en l'air à l'horizontale).

