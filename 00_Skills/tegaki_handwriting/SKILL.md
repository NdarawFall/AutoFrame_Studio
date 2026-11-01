---
name: tegaki_handwriting
description: Création et animation d'écriture manuscrite (Handwriting animation) avec Tegaki et SVG vectoriel pour le rendu vidéo HTML/CSS/JS.
---

# Skill : Animation d'Écriture Manuscrite (Tegaki & SVG)

Ce skill permet de créer et animer des textes avec un effet de tracé manuscrit fluide (*stroke-by-stroke handwriting*), directement intégrable dans les scènes et vidéos HTML de ce projet avec le moteur de rendu vidéo (`07_Scripts/render.cjs`).

---

## 🛠️ Méthodes d'Utilisation

### Méthode 1 — Génération d'assets SVG via CLI (`npx tegaki` ou script dédié)
Permet de générer des fichiers SVG vectoriels haute fidélité avec polices manuscrites et gestion des ligatures :

```bash
node 00_Skills/tegaki_handwriting/scripts/generate_handwriting.cjs "Mon Titre" --font caveat --color "#ffffff" --size 90 --mode once
```
* Polices disponibles : `caveat`, `tangerine`, `italianno`, `parisienne`, `amiri`, etc.
* Le fichier est automatiquement déposé dans `01_Assets/handwriting/`.

---

### Méthode 2 — Installation via npm
Si vous souhaitez intégrer le package directement dans vos scripts ou composants :
```bash
npm install tegaki
```

---

### Méthode 3 — Intégration Vidéo & Synchronisation Déterministe (`window.__timeline`)

Pour animer le tracé manuscrit de façon parfaitement fluide et synchronisée avec le moteur de rendu (`render.cjs`) :

```javascript
window.__timeline = {
  duration: () => 5, // Durée totale en secondes
  seek: (t) => {
    // 1. Pour les SVG avec SMIL natif (<animate>) :
    const svg = document.getElementById('my-handwriting-svg');
    if (svg && typeof svg.setCurrentTime === 'function') {
      if (typeof svg.pauseAnimations === 'function' && !svg.animationsPaused?.()) {
        svg.pauseAnimations();
      }
      svg.setCurrentTime(Math.max(0, t - 1.0));
    }

    // 2. Ou pour les SVG avec stroke-dashoffset manuel :
    const path = document.querySelector('.handwriting-path');
    if (path) {
      const progress = Math.max(0, Math.min(1, (t - 1.0) / 2.5));
      const length = path.getTotalLength ? path.getTotalLength() : 1200;
      path.style.strokeDashoffset = length * (1 - progress);
    }
  }
};

// IMPORTANT : Figer immédiatement les animations SMIL natives au chargement pour éviter l'auto-play
const svg = document.getElementById('my-handwriting-svg');
if (svg && typeof svg.pauseAnimations === 'function') {
  svg.pauseAnimations();
  svg.setCurrentTime(0);
}
```
