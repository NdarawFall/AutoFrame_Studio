---
name: reconstruction_documentary
description: "Expertise complète, moteur 3D Three.js et composants graphiques d'investigation style Vox / documentaire de reconstruction médico-légale. Crée des animations vidéo immersives avec sets en clay ou réalistes, mannequins sans visage, surlignage animé d'articles de presse, fiches de preuves, time-chips horodatés, citations sourcées, plaques de statistiques géantes et score audio procédural."
metadata:
  version: "1.0.0"
  author: "aiTrends & Antigravity"
  category: "motion-design"
---

# Reconstruction Documentary & Vox Investigation Skill

Ce skill fournit l'ensemble des connaissances, des scripts, du moteur 3D (Three.js) et du kit d'habillage graphique nécessaires pour concevoir des vidéos d'investigation et de reconstruction médico-légale du calibre des plus grands documentaires d'enquête (Vox, Johnny Harris, Lemmino, aiTrends).

---

## 1. Philosophie Visuelle : Le "Forensic Look"

L'esthétique de reconstruction repose sur une approche **calme, clinique, crédible et rigoureusement sourcée**. On ne cherche pas l'effet "jeu vidéo" ou "bande-annonce sensationnaliste", mais la précision d'une reconstitution de musée ou d'un rapport d'experts.

### A. Les Deux Modes de Rendu 3D
1. **White Clay ("Le Modèle / La Maquette")** :
   - Fond neutre gris perle chaud (`#e7e7e5`).
   - Objets, pièces, décors, cabines et sièges en argile mate blanc cassé.
   - Éclairage doux du haut gauche avec forte occlusion ambiante (N8AO) dans les creux et fentes pour donner du relief tactile.
   - **Personnages :** Mannequins faceless identiques (`K.mannequin({style:'clay'})`). Une seule personne ou cible est isolée par une couleur d'accent (Bleu `#2f6fdb` ou Rouge d'alerte `#d7443b`).
   - Idéal pour : cockpits, intérieurs, chronologies des déplacements, actions sensibles (respect et abstraction).

2. **Full Colour ("Le Lieu Réel")** :
   - Miniature réaliste et physically lit de l'environnement réel (parcs, forêts, bâtiments, pistes, météo).
   - Ambiances pré-paramétrées : `day` (ciel bleu profond, soleil rasant chaud), `golden`, `dusk` (crépuscule), `night` (lampes sodium, halos lumineux).

### B. Typographie & Charte
- **Titres d'impact & Nombres :** `Archivo` (Black 800-900, uppercase serré) ou `Inter` (Bold).
- **Corps de texte / UI :** `Inter` (500-700, lisibilité absolue).
- **Données, Temps, Métadonnées, Coordonnées :** `IBM Plex Mono` (letter-spacing: 0.08em à 0.16em, chiffres tabulaires).
- **Articles de presse & Documents officiels :** `Source Serif 4` ou `Georgia` (romain éditorial).

---

## 2. Le Kit 2D d'Habillage d'Investigation (`engine/ui.js`)

Chaque élément graphique apporte une preuve visuelle calée au mot près sur la voix off :

| Composant | Rôle & Usage | Exemple Visuel |
|---|---|---|
| **Badge de statut** | Mention obligatoire en haut à droite indiquant la nature du plan. | `RECONSTRUCTION`, `ILLUSTRATION`, `RAPPORT OFFICIEL` |
| **Footnote** | Ligne mono discrète en bas à gauche sourçant l'information à l'écran. | `Source : Données ADS-B FlightAware · NTSB préliminaire` |
| **Time Chip / Stack** | Date, heure précise et localisation au moment des faits. | `08:21 · HEURE LOCALE` / `Lundi 12 Octobre` |
| **Article Highlight** | Extrait d'article de presse avec coup de surligneur jaune animé. | Balise `<mark>` animée de gauche à droite sur les mots cités. |
| **Quote Card** | Citation verbatim d'un témoin ou d'une autorité avec guillemets massifs. | `“Vous vous attendez toujours à revenir.”` — Passager, Rang 14 |
| **Hero Stat Plate** | Nombre géant au format tabulaire avec label monochrome. | `174` `PASSAGERS À BORD` / `FL350` |
| **Lower Third** | Identification formelle d'un intervenant (nom, fonction, affiliation). | `Dr. S. M. · Passager, rang 14` |
| **Telemetry / Pin** | Repères flottants sur les objets 3D avec ligne de rappel (leader). | `MANETTE DES GAZ`, `SIÈGE 12B`, `ALTITUDE 2 400 FT` |
| **Statement Wall** | Déclaration officielle sur fond sombre ou blanc en cas de fait non résolu. | Texte fort en 2 ou 3 lignes : `Aucune charge retenue à ce jour.` |

---

## 3. Architecture des Scripts & Outils Disponibles (`scripts/`)

Le dossier `scripts/` regroupe l'arsenal d'automatisation médico-légale :

- **Traitement de la Voix & Narration :**
  - `elevenlabs_tts.py` : Synthèse vocale de haute qualité via ElevenLabs.
  - `voice_import.py` : Importation et normalisation de fichiers audio locaux.
  - `pauses.py` : Mesure et suppression chirurgicale des pauses excessives.
  - `transcribe.py` : Alignement mot-à-mot via Whisper (`faster-whisper`), générant `words.json`.
- **Composition & Traitement Audio :**
  - `compose.py` / `music.py` : Génération procédurale d'un score musical original (piano, cordes froides, pads, sub-bass) adapté à la narration et aux battements dramatiques.
  - `dsp.py` / `mix.py` : Mixage audio, ducking automatique de la musique sous la voix et normalisation à −14 LUFS.
  - `sfx.py` : Effets sonores médico-légaux (risers, impacts sourds, bips télémétriques, clicks).
- **Collecte de Preuves & Contrôle Qualité :**
  - `capture_article.mjs` : Capture headless d'articles avec coordonnées exactes pour le surlignage.
  - `script_lint.py` : Vérification des règles éthiques (présomption d'innocence, protection des mineurs, sourcing obligatoire).
  - `qc_video.py` & `doctor.py` : Diagnostic du pipeline et de l'intégrité des assets.

---

## 4. Règles d'Intégration dans le Studio Vidéo HTML / GSAP

Lorsque ce style est utilisé dans un template HTML du studio (tel que `06_Templates/Story_vox_style.html`) :

1. **Isolation stricte des scènes :**
   - Toutes les scènes possèdent `display: none; position: absolute; inset: 0;`.
   - L'activation d'une scène se fait exclusivement via GSAP : `tl.set('#scene_X', { display: 'flex' })` et se termine impérativement par `tl.set('#scene_X', { display: 'none' })`.
   - **JAMAIS de `!important` sur `#scene_1`** ni en CSS ni en inline style.
2. **Synchronisation Studio & Règle de la Timeline Unique :**
   - Toutes les animations doivent être rattachées directement à `tl` aux timestamps absolus. Zéro sous-timeline orpheline.
   - Toujours initialiser la timeline GSAP avec détection du mode iframe et réveil défensif du Ticker global :
     ```javascript
     const isIframeMode = window.self !== window.top;
     const tl = gsap.timeline({ paused: isIframeMode });
     window.tl = tl;
     window.__timeline = {
         duration: () => 30.0,
         seek: (t, isUserSeeking = false) => {
             tl.seek(t, false);
             if (isUserSeeking && typeof window.syncAudioTimeline === 'function') {
                 window.syncAudioTimeline(t, false);
             }
         },
         pause: () => {
             tl.pause();
             if (typeof window.syncAudioTimeline === 'function') {
                 window.syncAudioTimeline(tl.time(), false);
             }
         },
         play: () => {
             if (typeof gsap !== 'undefined' && gsap.globalTimeline && gsap.globalTimeline.paused()) {
                 gsap.globalTimeline.resume();
             }
             tl.play();
             if (typeof window.syncAudioTimeline === 'function') {
                 window.syncAudioTimeline(tl.time(), true);
             }
         }
     };
     ```
3. **Effet de surlignage jaune Vox :**
   - En CSS :
     ```css
     mark.sweep {
         background: none;
         background-image: linear-gradient(#ffe94a, #ffe94a);
         background-repeat: no-repeat;
         background-position: 0 85%;
         background-size: 0% 75%;
     }
     ```
   - En GSAP :
     ```javascript
     tl.to('#hl_text mark', { backgroundSize: '100% 75%', duration: 1.4, ease: 'power1.inOut' });
     ```

4. **Rythme de Réalisation & Anti-PowerPoint :**
   - **Interdiction de l'immobilité :** Une vidéo de reconstitution n'est jamais un diaporama. Dès que la dernière animation d'une scène se termine, on **COUPE immédiatement** vers la scène suivante.
   - **Synchronisme Script-to-Screen :** Chaque mot fort du scénario (chiffre, lieu, composant, document, citation) déclenche une apparition visuelle dédiée à la seconde près.
   - **Courbe d'apparition en S obligatoire :** Les apparitions d'éléments graphiques doivent systématiquement suivre une courbe *départ lent -> accélération centrale -> arrivée lente* avec amorti (`ease: "power3.inOut"` ou `power4.inOut`). Jamais de simple slide linéaire ou fondu isolé.

---

## 5. Déontologie & Précision Factuelle
- **Jamais d'extrapolation :** Ce qui n'est pas établi par les rapports officiels est présenté sous le label `HYPOTHÈSE NON VALIDÉE` ou `NON DÉTERMINÉ`.
- **Respect absolu des personnes :** Aucune glorification ni diabolisation. Mannequins faceless pour préserver la dignité des personnes impliquées.
- **Sourcing systématique :** Chaque chiffre, citation ou tracé doit mentionner son origine (Footnote ou Quote Tag).

