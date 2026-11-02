# Règle Absolue : Interdiction des Barres de Contrôle Vidéo Internes dans les Compositions

> [!CAUTION]
> **RÈGLE CRITIQUE D'INTÉGRATION UI & LECTEUR VIDÉO** :
> Les compositions vidéo HTML générées (dans `04_Videos/`, `05_Scenes/` ou `03_Chaines/`) ont l'interdiction formelle et absolue d'intégrer une barre de contrôle de lecture interne (bouton play/pause, slider de timeline, bouton plein écran, affichage de timecode ou bouton mute).

---

## 1. Pourquoi cette Interdiction est Impérative

1. **Suppression de l'Anti-Pattern "Lecteur dans le Lecteur"** :
   L'interface Studio ([`09_Pages/studio.html`](../../09_Pages/studio.html)) possède déjà son propre lecteur vidéo maître externe (timeline, bouton lecture/pause, scrubber, timecode, gestion des pistes V1/CC/A1/A2/A3).
   Intégrer des boutons de lecture ou un slider dans le fichier HTML de la vidéo crée un dédoublement parasite (*"un player dans le player"*), masque la partie inférieure de la vidéo et perturbe la synchronisation des événements.

2. **Rendu MP4 Final Inexploitable** :
   Lors de l'exportation vidéo par Puppeteer & FFmpeg (`render.cjs`), chaque frame de l'écran est capturée. Si des boutons play/pause ou un curseur de timeline sont présents dans le HTML, ils sont gravés définitivement dans le fichier MP4 final comme des éléments d'interface indésirables.

---

## 2. Ce qu'une Composition Vidéo Doit Contenir

* ✅ **Une Toile Vidéo Pure 16:9 ou 9:16** : Un conteneur responsive plein cadre (Three.js canvas, conteneurs GSAP, SVG).
* ✅ **Uniquement des Overlays Graphiques Narratifs** :
  - Badges thématiques, citations, titrages animés, sous-titres dynamiques.
  - Overlays narratifs directement intégrés au sujet (ex: compteur de vitesse au sein du tachymètre, citations, badges de comparaison).
* ❌ **Interdiction Formelle des Textes aux 4 Coins** : Ne jamais afficher de faux indicateurs HUD collés aux 4 coins du cadre (.hud-telemetry, "1080p", "TEMPO", "VIBE ENGINE"). Les 4 coins doivent impérativement rester vides et épurés pour bannir l'effet "diapositive PowerPoint".
* ✅ **Une Timeline Maîtresse GSAP Exposée** :
  ```javascript
  const tl = gsap.timeline({ paused: false, onUpdate: () => renderAt(tl.time()) });
  window.tl = tl;
  window.__timeline = tl;
  window.__timelines = { main: tl };
  ```
  Le Studio et le moteur de rendu pilotent directement cette timeline externe sans aucune interface parasite.

---

## 3. Gestion des Clips Vidéo & B-Roll Intégrés

1. **Aucun contrôle interne sur la balise `<video>`** :
   - Attribut `controls` formellement interdit sur toute balise `<video>`.
   - Attributs obligatoires : `muted loop playsinline preload="auto"`.

2. **Attributs Temporels Obligatoires pour la Synchronisation Studio** :
   - Toute balise `<video>` doit déclarer ses bornes de scène :
     ```html
     <video id="brollVideo" src="..." data-start="23.0" data-end="35.0" data-duration="12.0" muted loop playsinline preload="auto"></video>
     ```
   - **En mode Studio (`isIframeMode === true`)**, le Studio démarre et arrête automatiquement la vidéo à 60 FPS sans coupure. Le code JS de la composition a l'interdiction formelle d'appeler `play()`, `pause()` ou de forcer `currentTime`.
   - Se référer au contrat dédié : [`.agents/rules/html5-video-broll-studio-contract.md`](html5-video-broll-studio-contract.md).
