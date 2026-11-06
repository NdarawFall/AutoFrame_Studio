---
name: exploded_teardown
description: Direction artistique et règles techniques pour créer une vue éclatée (exploded view / teardown) 2.5D et 3D de composants, cartes électroniques ou objets matériels. Décomposition ordonnée sur l'axe Z, lignes de rappel vectorielles, callouts techniques et étiquetage de haute précision.
---

# Skill : Exploded Teardown (Vue Éclatée & Décomposition Matérielle)

Ce skill formalise la grammaire de réalisation et les règles de rendu pour décomposer un objet, un composant matériel ou une interface physique couche par couche avec une précision d'ingénierie et un éclairage packshot de studio.

---

## 🎯 1. Principes Fondamentaux de la Vue Éclatée

* **Décomposition sur un seul axe principal (Axe Z)** :
  * Les couches de l'objet se séparent le long d'un axe logique avec des espacements constants et lisibles.
  * Chaque couche conserve son orientation d'assemblage sans déformation fantaisiste.
* **Séparation ordonnée (Stagger & Easing)** :
  * Ordre d'ouverture : les couches extérieures partent en premier, espacées de 0.15s à 0.20s.
  * Easing mécanique : départ fluide, accélération centrale, longue décélération amortie (`power3.inOut` ou `cubic-bezier(0.65, 0, 0.35, 1)`).
  * Fermeture (Closing) : les pièces de base s'ancrent d'abord, la dernière couche atterrit avec un impact mécanique sec sans rebond élastique de dessin animé.
* **Typographie & Callouts Techniques** :
  * **Leader lines (Lignes de rappel)** : un point d'ancrage minuscule sur la pièce, une ligne brisée fine (1 px) et un encart textuel sur le côté.
  * **Hiérarchie de données** : Index à deux chiffres (`01`, `02`), nom du composant en `Inter` ou `Noto Sans`, et spécifications chiffrées en police monospace (`JetBrains Mono` ou `IBM Plex Mono`).

---

## 🎨 2. Palette & Éclairage Studio

* **Fond & Ambiance** :
  * Dégradé radial graphite très sombre : `#34363a` au centre vers `#0d0e10` sur les bords.
  * Le sol est invisible : seules les ombres de contact douces des pièces au repos y apparaissent.
* **Couleur du produit & Encre** :
  * L'objet apporte sa propre matérialité (plastique mat, cuivre, aluminium brossé).
  * Encre d'interface : blanc chaud `#f1efe9` (100% pour les titres, 60% pour les sous-titres).
  * **Accent unique** : réservé aux mesures et aux index actifs (ex: orange signal `#ff6b3d` ou cyan électrique `#00f2fe`).

---

## 🎥 3. Grammaire de Caméra

| Mouvement | Intention Narrative | Utilisation Idéale |
| :--- | :--- | :--- |
| **Orbite 3/4 plongeante** | Montre la structure globale et l'ordre de montage | Révélation d'ouverture (0-3s) |
| **Plongée entre les couches (Dive)** | Immersion au cœur de l'objet | Découverte d'un composant caché (puce, capteur) |
| **Travelling macro rasant** | Met en valeur les textures et finitions | Gros plan sur un connecteur ou une gravure |
| **Recul rapide (Snap out)** | Synthèse et reconstitution | Fermeture finale de l'objet |

---

## 💻 4. Implémentation Type (Three.js / Canvas / GSAP)

```javascript
// Structure de décomposition de couches Z dans Three.js / Canvas
const layers = [
    { id: 'chassis', zOffset: 0, delay: 0 },
    { id: 'pcb', zOffset: 60, delay: 0.15 },
    { id: 'battery', zOffset: 120, delay: 0.30 },
    { id: 'display', zOffset: 180, delay: 0.45 },
    { id: 'glass_cover', zOffset: 240, delay: 0.60 }
];

// Animation d'ouverture ordonnée avec GSAP
layers.forEach(layer => {
    gsap.to(meshMap[layer.id].position, {
        z: layer.zOffset,
        duration: 1.8,
        delay: layer.delay,
        ease: "power3.inOut"
    });
});

// Projection des lignes de rappel 3D vers l'écran 2D
function updateLeaderLine(worldPoint, labelElement, svgLine) {
    const screenPos = worldPoint.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
    
    // Positionner le label et la ligne SVG
    labelElement.style.transform = `translate(${x + 40}px, ${y}px)`;
    svgLine.setAttribute('x1', x);
    svgLine.setAttribute('y1', y);
    svgLine.setAttribute('x2', x + 35);
    svgLine.setAttribute('y2', y);
}
```

---

## 🔊 5. Sound Design Associé
* **Foley mécanique sec** : clics de plastique rigide (`click`), bruits d'enclenchement (`clack`), et résonances métalliques courtes.
* **Transitions de couches** : légers whooshes d'air (`whoosh`) à chaque fois que la caméra plonge entre deux tranches.
* **Impact final** : thud feutré et mat (`thump`) lors du verrouillage de la dernière pièce.

