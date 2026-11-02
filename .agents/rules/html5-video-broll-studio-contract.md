# Règle Absolue : Contrat d'Intégration Vidéo HTML5 & B-Roll dans le Studio

> [!CAUTION]
> **RÈGLE CRITIQUE D'INTÉGRATION DES CLIPS VIDÉO & B-ROLL DANS LES COMPOSITIONS** :
> Toute balise `<video>` insérée dans une composition HTML (dans `04_Videos/`, `05_Scenes/` ou `03_Chaines/`) doit impérativement respecter les règles de synchronisation déclarative avec le Studio (`studio.html`).
> Le non-respect de ces règles entraîne des saccades violentes, des blocages sur la dernière frame ou des conflits 60 Hz détruisant la lecture.

---

## 1. Attributs Déclaratifs Obligatoires (`data-start`, `data-end`, `data-duration`)

Le moteur universel du Studio ([`09_Pages/studio.html`](../../09_Pages/studio.html)) synchronise automatiquement les éléments `<video>` de l'iframe à chaque frame via `v.dataset.start` et `v.dataset.end`.

Toute balise `<video>` **DOIT OBLIGATOIREMENT** comporter ses bornes temporelles exactes en secondes :

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

### ❌ Le Piège Fatal (Si `data-start` est omis) :
Si `data-start` est absent, le Studio prend `vStart = 0`. Dès que la timeline atteint la scène (ex: `t = 24.0s`), le Studio calcule un décalage de `24.0s` (`time - 0`), ce qui dépasse la durée du fichier vidéo (ex: 15s). Le Studio force alors `video.currentTime = 15.0s` **à chaque frame (60 FPS)**. La vidéo reste alors totalement figée sur sa dernière frame ou saute en boucle !

---

## 2. Non-Ingérence JS en Mode Studio (`isIframeMode === true`)

Le Studio est le **seul et unique maître de lecture** de la composition :
* Dès que la tête de lecture franchit `data-start`, le Studio appelle automatiquement `video.play()`.
* Dès que la tête de lecture quitte `data-end`, le Studio appelle automatiquement `video.pause()`.
* Lors du déplacement manuel du curseur (scrubbing), le Studio synchronise `video.currentTime = time - data-start`.

### 🚫 Interdictions formelles dans le code JS de la composition :
1. **NE JAMAIS** appeler `video.play()` ou `video.pause()` dans la timeline GSAP (`tl.call()`) en mode Studio.
2. **NE JAMAIS** modifier `video.currentTime` dans `window.__timeline.seek()` en mode Studio.
3. Tout pilotage JS de secours doit impérativement être protégé par `if (!isIframeMode)` pour le mode autonome hors-Studio :

```javascript
const isIframeMode = window.self !== window.top;
const tl = gsap.timeline({ paused: isIframeMode, defaults: { ease: 'power3.out' } });

// En mode autonome hors-Studio UNIQUEMENT :
if (!isIframeMode) {
    tl.call(() => { if (brollEl) { brollEl.currentTime = 0; brollEl.play().catch(() => {}); } }, null, 23.0);
    tl.call(() => { if (brollEl) brollEl.pause(); }, null, 35.0);
}

window.__timeline = {
    duration: () => 52.0,
    seek: (t) => {
        tl.seek(t, false);
        // Le Studio gère nativement le calage de la vidéo ; on n'intervient que hors-Studio
        if (!isIframeMode && brollEl) {
            if (t >= 23.0 && t <= 35.0) {
                const targetT = t - 23.0;
                if (Math.abs(brollEl.currentTime - targetT) > 0.4) brollEl.currentTime = targetT;
                if (brollEl.paused && !tl.paused()) brollEl.play().catch(() => {});
            } else {
                if (!brollEl.paused) brollEl.pause();
                brollEl.currentTime = 0;
            }
        }
    },
    play: () => {
        tl.play();
        if (!isIframeMode && brollEl && tl.time() >= 23.0 && tl.time() <= 35.0) {
            brollEl.play().catch(() => {});
        }
    },
    pause: () => {
        tl.pause();
        if (!isIframeMode && brollEl) brollEl.pause();
    }
};
```

---

## 3. Qualité du B-Roll : Mouvement Physique Continu (Bannissement des Teasers Diaporamas)

1. **Vraie vidéo d'action en continu** :
   - Tout B-roll doit être une séquence filmée réelle avec mouvement continu (caméra, athlètes, circulation, foule) encodée à **60 FPS fluide** (H.264, GOP régulier `-g 25`, `-movflags +faststart`).
   - **INTERDICTION FORMELLE** d'utiliser des teasers promotionnels institutionnels qui sont en fait des diaporamas de photos fixes découpées avec des cuts rapides.

2. **Éradication Totale des Badges Factices / AI Slop** :
   - **INTERDICTION STRICTE** d'ajouter des étiquettes arbitraires (« LIVE BROADCAST », « DIRECT TV », « BREAKING NEWS ») ou de faux logos de chaînes télévisées sur le player vidéo. Le player doit être épuré, propre et sans surcouche parasite.
