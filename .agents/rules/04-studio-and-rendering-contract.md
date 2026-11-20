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

Dans tous les autres cas : **créer/éditer la composition HTML, tester dans le Studio interactif, et fournir le lien ou chemin du fichier à l'utilisateur. Le Studio dispose déjà d'un bouton dédié "Lancer le Rendu MP4" que l'utilisateur utilise lui-même.**

### C. Interdiction Absolue du Git Push Automatique
> [!CAUTION]
> **ZÉRO PUSH GITHUB SANS DEMANDE EXPLICITE** :
> L'IA a l'interdiction formelle d'exécuter `git push` ou de synchroniser avec le dépôt distant sans un ordre écrit direct et intentionnel de l'utilisateur.

### D. Interdiction Stricte des Sous-Titres Non Demandés
> [!CAUTION]
> **ZÉRO SOUS-TITRE SANS DEMANDE EXPLICITE DU PROMPT** :
> L'IA ne doit **JAMAIS** générer de conteneur de sous-titres (`.subtitles-bar`, `#captionDisplay`, `captionsTrack`, barres de transcription dynamiques) sauf si l'utilisateur en fait la demande explicite dans son prompt (ex: "ajoute des sous-titres", "avec sous-titres dynamiques").
> Les compositions doivent rester épurées, cinématiques et focalisées sur le sujet principal.

### E. Interdiction des Boutons Flottants dans le Vide (Une Vidéo n'est PAS un Site Web)
> [!CAUTION]
> **ZÉRO BOUTON D'ACTION FLOTTANT** :
> Les vidéos ne sont pas des pages web cliquables. Ne JAMAIS insérer de bouton d'action flottant dans le vide (`.cta-action-pill`, bouton « Essayer maintenant », « En savoir plus »). Seuls les boutons légitimes intégrés à l'intérieur d'une maquette d'interface logicielle (UI mockup) sont autorisés. Pour les fins de vidéo, afficher uniquement la marque, l'accroche et l'URL textuelle épurée.

### F. Interdiction des Mentions de Bas de Page Web (« Tous droits réservés... »)
> [!CAUTION]
> **ZÉRO FOOTER OU MENTION LÉGALE WEB** :
> Ne JAMAIS insérer de mentions légales, copyright ou texte de footer type site web (`© 2026 OpenAI. Tous droits réservés...`). Le cadre de la vidéo doit rester cinématographique, propre et net.

### G. Interdiction des Étiquettes Marketing (Pill Badges) & Halos/Cercles sur les Logos
> [!CAUTION]
> **ZÉRO ÉTIQUETTE SCOLAIRE & LOGO PUR SANS ARTIFICE** :
> 1. Ne JAMAIS surmonter les titres de badges marketing ou de pilules textuelles (`.pill-badge`, « NOUVELLE GÉNÉRATION DE MODÈLE »).
> 2. Les logos officiels doivent être présentés sous leur forme SVG vectorielle pure : interdiction des anneaux orbitaux en pointillés (`.logo-orbital-ring`) et des halos radiaux flous (`.logo-backlight`).


---

## 3. Contrat d'Intégration Audio, Voix Off & Règle Anti-Saccades

> [!CRITICAL]
> **RÈGLE D'OR : ZÉRO MICRO-SEEK PENDANT LA LECTURE CONTINUE (Tolérance >= 0.8s)** :
> Lors de la lecture d'une vidéo avec voix off ou musique, la balise `<audio>` ne doit **JAMAIS** subir d'assignation `audio.currentTime = time` à 60 FPS.
> Toute réassignation de `currentTime` pendant la lecture force le décodeur audio du navigateur à vider son buffer et recharger le flux, produisant un hachage brutal ("voix saccadée").

### Règles de Gouvernance Audio & Gestion Déterministe de la Boucle (Loop) :
1. **Bannissement de l'attribut `loop` sur les balises `<audio>`** :
   - **INTERDICTION FORMELLE** d'écrire `<audio loop>` dans les compositions vidéo HTML.
   - *Pourquoi ?* L'attribut HTML `loop` boucle le fichier MP3 entier (pouvant durer 3 ou 4 minutes) au lieu de respecter la durée de la vidéo (ex: 10s). La musique continuerait hors de la vidéo.
   - Le bouclage est **exclusivement piloté par le Studio** (`studio.html`) et la timeline maîtresse.

2. **Coupure Nette à la Fin de la Timeline (`time >= duration`)** :
   - Dans le callback `syncAudioTimeline(time, isPlaying)`, vérifier impérativement si le temps a atteint la durée totale de la vidéo :
     ```javascript
     if (time >= videoDuration) {
         if (!musicAudio.paused) musicAudio.pause();
         return;
     }
     ```
   - La musique ou la voix s'arrête exactement à la dernière seconde du timecode.

3. **Rebouclage Déterministe ($t = 0$) & Détection des Sauts Temporels** :
   - Lorsque la lecture est en boucle (`isLooping === true`), la timeline revient à $t = 0$.
   - Si l'écart entre la tête de lecture et l'audio dépasse **0.3 seconde** (`Math.abs(audio.currentTime - time) > 0.3`), forcer le recalage immédiat :
     ```javascript
     if (Math.abs(audio.currentTime - time) > 0.3) {
         audio.currentTime = Math.max(0, Math.min(time, videoDuration));
     }
     ```
   - Ceci assure que lorsque la vidéo boucle à $0\text{s}$, l'audio repart instantanément du début au lieu d'attendre la fin de la chanson.

4. **Contrat `window.__timeline` Déterministe pour le Studio** :
   - Toute vidéo HTML doit exposer la timeline sous ce format exact :
     ```javascript
     window.__timeline = {
         duration: DUREE_TOTALE,
         seek: (t, isUserSeeking = false) => {
             tl.seek(t, false);
             if (isUserSeeking && window.syncAudioTimeline) {
                 window.syncAudioTimeline(t, false);
             }
         },
         play: () => {
             tl.play();
             if (window.syncAudioTimeline) window.syncAudioTimeline(tl.time(), true);
         },
         pause: () => {
             tl.pause();
             if (window.syncAudioTimeline) window.syncAudioTimeline(tl.time(), false);
         },
         getCurrentTime: () => tl.time()
     };
     ```
   - Lors d'une boucle dans le Studio, `studio.html` appelle `handleLoopRestart()` qui réenclenche `seek(0, false)` puis `play()`, relançant l'animation 3D/2D et l'audio sans jamais figer le player ni requérir un clic manuel.

5. **Tolérance Anti-Saccades pendant la lecture continue** :
   - Ne jamais forcer de `currentTime` si l'écart est inférieur à **0.3s**, pour laisser le décodeur audio jouer sans saccades.
   - En pause ou lors du scrub manuel (`isPlaying === false`), l'audio est mis en pause immédiatement et calé avec précision.

---

## 4. Contrat de Fidélité Absolue Texte / Voix Off / Sous-Titres

> [!CRITICAL]
> **ALIGNEMENT STRICT MOT-À-MOT (ZÉRO PARAPHRASE, ZÉRO DIVERGENCE)** :
> Le texte écrit dans les sous-titres (`subtitleCues`) doit correspondre **STRICTEMENT ET MOT POUR MOT** au texte prononcé par la voix off.
> Il est formellement interdit d'avoir une variante ou une paraphrase (ex: la voix dit *"d'analyser des centaines de pages"* alors que le sous-titre affiche *"d'analyser des documents"*).

### Règles de Gouvernance Sous-Titrage :
1. **Source Unique de Vérité (`officialNarration`)** :
   - Le texte envoyé au synthétiseur vocal TTS (HeyGen ou ElevenLabs) est la référence absolue.
   - La segmentation en sous-titres découpe ce texte exact, sans réécriture ni substitution de mots.
2. **Découpage Rythmé (3 à 4 mots max par groupe)** :
   - Couper systématiquement sur la ponctuation (`.`, `,`, `!`, `?`) ou par groupes fluides de 3 à 4 mots.
   - Éviter absolument les blocs massifs de 8+ mots qui s'accumulent à l'écran.
3. **Pondération Temporelle par Nombre de Caractères (`charWeight`)** :
   - Les mots courts (*« de », « la », « et »*) doivent défiler très vite (proportionnels à leur taille).
   - Les mots longs (*« artificielle », « interactives »*) reçoivent un temps plus long.
4. **Animation Mot-à-mot Coloré (`type-wordbyword`)** :
   - À l'apparition d'un segment, le **premier mot est allumé immédiatement** en couleur d'accent (`.active-word`).
   - La couleur passe ensuite de mot en mot au rythme vocal et s'éteint dès la fin de la phrase.
