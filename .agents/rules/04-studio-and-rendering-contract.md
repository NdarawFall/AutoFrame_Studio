# Contrat Technique Studio, Intégration Vidéo HTML5 & Politique de Rendu

Ce document rassemble les règles d'intégration technique entre les compositions vidéo HTML, le lecteur Studio et le moteur d'exportation MP4.

---

## 1. Interdiction des Barres de Contrôle Internes & UI Parasites

> [!CAUTION]
> **ZÉRO PLAYER DANS LE PLAYER & ZÉRO TIMELINE INCRUSTÉE** :
> Les compositions vidéo HTML (`04_Videos/`, `05_Scenes/`, `03_Chaines/`) ont l'interdiction formelle d'intégrer des barres de contrôle internes (boutons play/pause, sliders, timecodes incrustés, compteurs de frames ou boutons plein écran).

1. **Suppression de l'Anti-Pattern "Lecteur dans le Lecteur"** :
   - L'interface Studio ([`09_Pages/studio.html`](../../09_Pages/studio.html)) possède déjà son propre lecteur vidéo maître externe (scrubber, timer, play/pause, gestion multi-pistes).
   - Intégrer des boutons de lecture dans le fichier HTML de la vidéo crée un dédoublement parasite et masque la composition.
2. **Préservation du Rendu MP4** :
   - Tout contrôle ou timecode incrusté dans le DOM HTML est capturé et gravé définitivement dans la vidéo MP4 finale lors de l'exportation.
3. **Exposition Propre de la Timeline Maîtresse GSAP** :
   ```javascript
   const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
   window.tl = tl;
   window.__timeline = {
       duration: DUREE_TOTALE_SECONDES,
       seek: (t) => { tl.seek(t); },
       play: () => { tl.play(); },
       pause: () => { tl.pause(); },
       getCurrentTime: () => tl.time()
   };
   ```

---

## 2. Contrat d'Intégration Vidéo HTML5 & B-Roll dans le Studio

Toute balise `<video>` insérée dans une composition HTML doit respecter scrupuleusement la synchronisation déclarative avec le Studio :

### A. Attributs Déclaratifs Obligatoires (`data-start`, `data-end`, `data-duration`)
Le moteur universel du Studio synchronise automatiquement les éléments `<video>` de l'iframe à chaque frame via `dataset.start` et `dataset.end`.

```html
<!-- EXEMPLE CONFORME : VIDÉO DE LA SCÈNE 4 (DE 23.0s À 35.0s, DURÉE 12.0s) -->
<video id="brollVideo" 
       src="../01_Assets/Videos/mon_extrait.mp4" 
       data-start="23.0" 
       data-end="35.0" 
       data-duration="12.0" 
       muted loop playsinline preload="auto">
</video>
```

> [!WARNING]
> **Le Piège Fatal sans `data-start`** :
> Si `data-start` est omis, le Studio prend `start = 0`. Dès que la timeline atteint la scène (ex: `t = 24.0s`), le Studio calcule un décalage de `24.0s`, dépassant la durée du fichier. Le Studio force alors `video.currentTime` à chaque frame (60 FPS), ce qui fige la vidéo ou la fait saccader violemment.

### B. Non-Ingérence JS en Mode Studio (`isIframeMode === true`)
Le Studio est le **seul maître de lecture** de la composition :
* Dès que la tête de lecture franchit `data-start`, le Studio appelle automatiquement `video.play()`.
* Dès que la tête de lecture quitte `data-end`, le Studio appelle automatiquement `video.pause()`.
* Lors du déplacement manuel du curseur (scrubbing), le Studio synchronise `video.currentTime = time - data-start`.

**Interdictions formelles en mode Studio :**
1. **NE JAMAIS** appeler `video.play()` ou `video.pause()` dans la timeline GSAP (`tl.call()`) en mode Studio.
2. **NE JAMAIS** modifier `video.currentTime` dans `window.__timeline.seek()` en mode Studio.
3. Protéger tout pilotage JS de secours hors Studio par `if (!isIframeMode)` :
   ```javascript
   const isIframeMode = window.self !== window.top;
   if (!isIframeMode && brollEl) {
       // Pilotage de secours en mode autonome uniquement
   }
   ```

---

## 3. Politique Stricte de Rendu Vidéo (Interdiction d'Initiative IA)

> [!CAUTION]
> **INTERDICTION FORMELLE ET ABSOLUE D'EXÉCUTER UN RENDU MP4 SANS DEMANDE EXPLICITE** :
> L'IA a l'interdiction d'exécuter `node 07_Scripts/render.cjs` ou d'appeler l'API `/api/render` de sa propre initiative.

### A. Pourquoi cette règle est impérative
1. **Saturation CPU / GPU & Blocage de la Machine** :
   Le moteur de rendu lance un navigateur Chrome headless (Puppeteer), capture image par image à 60 FPS et encode via FFmpeg. Cela mobilise l'intégralité du processeur et bloque la machine pendant plusieurs minutes.
2. **Poids & Pollution Disque** :
   Chaque export MP4 pèse des dizaines voire des centaines de mégaoctets dans `08_Rendus/`.
3. **Cycle d'Itération Rapide Web** :
   La force de VibeEditor réside dans la prévisualisation instantanée dans le navigateur web à 60 FPS avec timeline interactive. L'utilisateur doit pouvoir visualiser et valider le résultat dans le player interactif **AVANT** de décider d'exporter.

### B. Seuls Ordres Autorisant le Rendu
L'IA est autorisée à lancer `render.cjs` **UNIQUEMENT** si l'utilisateur formule un ordre clair et explicite tel que :
- *« Lance le rendu »*
- *« Exporte la vidéo en MP4 »*
- *« Fais le rendu de la vidéo X »*
- *« Convertis en MP4 »*

Dans tous les autres cas : **créer/éditer la composition HTML, tester dans le Studio interactif, et fournir le lien ou chemin du fichier à l'utilisateur.**
