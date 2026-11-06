---
name: Joseph_Edit_Skills
description: Règles de design et de direction artistique vidéo professionnelles (17 principes de design par Joseph / Ultimate Editors : typographie 80/20, placement règle des tiers, équilibre, contraste 4 leviers, palette 60/30/10, script-to-design, habillage short-form 9:16 et long-form 16:9).
---

# Skill : Video Design Mastery (Les 17 Règles d'Or du Montage Viral)

Ce skill formalise les **17 principes de design fondamentaux** enseignés par Joseph (*Ultimate Editors*). Il sert de directive stricte pour l'IA et les scripts de composition lors de la génération de scènes, de templates et d'animations vidéo.

---

## 📐 1. Typographie 80/20 (Dual-Font Pairing)
* **Règle absolue :** Ne jamais utiliser plus de **deux familles de polices** dans une vidéo.
* **Police Principale (80 % du contenu) :** Une police **Sans-Serif** moderne, géométrique et lisible (`Inter`, `Plus Jakarta Sans`, `Outfit`, `SF Pro Display`). Utilisée pour tous les sous-titres, les textes d'interfaces (UI), les légendes et le corps de texte.
* **Police Secondaire d'Accent (20 % du contenu) :** Une police **Script manuscrite** (`Caveat`, `Italianno`, `Tegaki`) ou **Serif éditoriale** (`Playfair Display`, `Instrument Serif`) en italique. Réservée exclusivement aux mots-clés d'impact, chiffres clés et révélations.
* **Formule CSS / HTML :**
  ```html
  <h2 class="title-sans">Comment créer une offre à <span class="highlight-script">7 Chiffres</span></h2>
  ```
* ⚡ **Règles Fondamentales d'Animation de Texte (Monopoliche vs Multipolice) :**
  * **Titre Monopoliche (1 seule police sur tout le texte, ex: *"Le Grand Écart Mondial"*) :** Animation par défaut **mot par mot** avec fondu vers le haut ou vers le bas (`titleFadeWordsUp` / `titleFadeWordsDown`). Le texte doit rester rigoureusement aligné sur sa ligne de base sans déformation ni saut de ligne.
  * **Titre Multipolice (Sans-Serif + Accent Script/Serif) :** ⚠️ **Interdiction absolue du découpage mot par mot**. Le titre doit impérativement entrer en **bloc entier** ou **ligne par ligne** (`titleMultiFontSlide`) pour préserver les rapports de baseline et la cohérence optique des deux polices.
  * **Sous-titres & Paragraphes :** Animation par défaut n°1 en **slide vers le haut** du texte entier (ou ligne par ligne avec conteneur masqué si multiligne) ; ou animation par défaut n°2 en **slide de droite à gauche mot par mot** (`subtitleWordsSlideRightToLeft`, où chaque mot glisse à sa place et s'y fige sans décaler les mots précédents). Voir `.agents/skills/My_Skills/text_animation/SKILL.md`.

---

* 🎨 **Règle Stricte des Couleurs Typographiques (2 Couleurs Max) :**
  * Ne jamais dépasser **2 couleurs** sur un même titre ou texte (ex: texte blanc avec 1 mot d'accent rouge, ou dégradé blanc vers rouge). Interdiction formelle des titres à 3 couleurs ou plus.

* 🚫 **INTERDICTION FORMELLE DE DESSINER DES LOGOS OU ICÔNES (Obligation d'Assets Officiels) :**
  * **L'IA NE DOIT JAMAIS DESSINER, INVENTER OU APPROXIMER UN LOGO OU UNE ICÔNE EN CODE** (aucun bricolage SVG fait maison, aucune approximation vectorielle, aucun tracé manuel).
  * **TOUS LES LOGOS** doivent être récupérés sous leur forme officielle via `node 07_Scripts/brandfetch.cjs <domaine>` (SVG vectoriel officiel ou PNG transparent HD) et stockés dans `01_Assets/Logos/`.
  * **TOUS LES DRAPEAUX** doivent être récupérés via `node 07_Scripts/fetch_flag.cjs <pays>` et stockés dans `01_Assets/Flags/`.
  * **TOUTES LES CARTES/LOCALISATIONS** doivent être générées via `node 07_Scripts/fetch_map.cjs` (Leaflet + capture Chrome headless) — **100% gratuit, sans watermark, sans clé API**.
    - Styles disponibles : `dark` (cinématique, défaut), `voyager` (élégant, voyage), `light` (minimaliste blanc), `satellite` (vue réelle HD), `osm` (technique, data)
    - Formats : 16:9 (1920×1080) ou 9:16 (1080×1920) avec `--format 9:16`
    - Pin animé optionnel avec `--pin`
  * **TOUTES LES ICÔNES SYSTÈME/UI** doivent provenir de bibliothèques officielles (Heroicons, Lucide, Phosphor, Material Icons) importées localement — **jamais dessinées à la main**.
  * **SI LE TÉLÉCHARGEMENT EST IMPOSSIBLE** : l'IA doit **S'ARRÊTER IMMÉDIATEMENT** et demander à l'utilisateur de fournir l'asset officiel. Aucune alternative "dessiné par l'IA" n'est tolérée.

---

## 🎯 2. Règle des Tiers & Point Focal Central
* **Grille 3x3 :** L'écran (16:9 ou 9:16) est découpé par deux lignes horizontales et deux lignes verticales.
* **Le Point Focal (Carré Central) :** Réservé obligatoirement au sujet principal (visage du présentateur, produit vedette, graphique pivot).
* **Les Zones Secondaires :**
  * Tiers inférieur : Sous-titres dynamiques et widgets UI d'accompagnement.
  * Tiers latéraux (gauche/droite) : Cartes d'illustrations, B-Roll, métriques.

---

## ⚖️ 3. Équilibre Spatial des Masses (Visual Balance)
* Quand deux éléments coexistent dans la même scène (ex: illustration + texte) :
  * **Disposition horizontale :** Répartir un élément dans la moitié gauche et un dans la moitié droite, alignés sur le même axe horizontal.
  * **Disposition verticale :** Un élément en moitié haute, un en moitié basse.
  * **Disposition diagonale :** Haut-gauche opposé à bas-droite (idéal pour dynamiser les scènes sans visage).
* **Interdiction :** Ne jamais entasser deux éléments majeurs dans le même quadrant sans contrepoids visuel.

---

## ⚡ 4. Contraste : Les 4 Leviers d'Attention
Pour forcer l'œil du spectateur à regarder l'élément clé en moins de 100 ms :
1. **Contraste de Couleur :** Fond sombre (`#09090b`) avec élément clair, ou fond blanc studio avec élément sombre.
2. **Contraste de Texture :** Fond lisse associé à un élément texturé à trame *halftone* (grain tramé 20%).
3. **Contraste d'Échelle :** L'élément principal doit être au moins 1.8x à 2.5x plus grand que les éléments secondaires.
4. **Contraste de Forme :** Isoler l'élément dans un conteneur géométrique (carte aux coins arrondis *squircle* 14-16px, badge pilule).

---

## 🎨 5. Règle Chromatique 60 / 30 / 10
Toute composition de scène doit respecter ces proportions exactes :
* **60 % — Couleur Dominante :** L'atmosphère générale ou la couleur de fond (ex: noir profond, bleu marine sombre, blanc studio).
* **30 % — Couleur Secondaire :** Les conteneurs, cartes d'interfaces, textes descriptifs et bordures (`hsl(var(--secondary))`, blanc ou zinc).
* **10 % — Couleur d'Accentuation :** Teinte ultra-saturée réservée aux boutons CTA, badges de conversion, flèches de pointage et mots d'impact (ex: vert néon `#22c55e`, cyan `#06b6d4`, orange feu `#f97316`).

---

## 🏢 6. Les 5 Paramètres de Marque Client
Avant de composer une vidéo pour une chaîne ou un client :
1. **Palette 60/30/10 :** Pipeter la couleur dominante des rushes du client et décliner les 3 nuances.
2. **Duo Typographique :** 1 Sans-Serif + 1 Script/Serif adaptées à la niche (tech, finance, storytelling, fitness).
3. **Système de Grille :** Grille stricte pour business/éducatif, cadrage asymétrique pour vlog/lifestyle.
4. **Rayon de Courbure (Border Radius) :** Fixer un rayon unique (vif 0px, moderne 12-16px, ou pilule 99px).
5. **Courbe d'Animation :** Fluidité cinématique (`power2.out`, 0.8s) ou rythme punchy (`back.out(1.5)`, 0.4s).

---

## 🧠 7. Logique Script-to-Design
Le texte prononcé dicte automatiquement la disposition graphique :
* **Le script évoque 1 seul concept :** $\rightarrow$ Placement plein centre, taille imposante, couleur d'accent (10%).
* **Le script compare 2 concepts :** $\rightarrow$ Écran divisé (Split Screen) symétrique 50/50, couleur d'accent attribuée uniquement au concept gagnant ou mis en avant.

---

## 🖥️ 8. Compositions Horizontales (16:9)
* **Objet + Texte :** Moitié gauche = Objet / Mockup, Moitié droite = Texte explicatif. Marges latérales rigoureusement identiques mesurées au pixel près.
* **Intégration sur rush vidéo réel :** Le sujet parlant occupe un côté de l'écran. L'autre côté reçoit un **flou gaussien d'arrière-plan + assombrissement (backdrop blur 16px + noir 40%)** pour y poser l'UI en toute lisibilité.
* **Mode Long-Form Premium :** Utiliser des fonds clairs texturés (*Light Mode Studio*) avec du texte sombre, universellement perçus comme plus luxueux.

---

## 📱 9. Compositions Verticales (9:16 Shorts / Reels)
* **Hiérarchie d'empilement vertical :**
  1. **Tiers Supérieur :** Visage / Sujet principal de la vidéo.
  2. **Tiers Inférieur (Haut) :** Sous-titres dynamiques mot-à-mot (style Hormozi ou minimaliste).
  3. **Tiers Inférieur (Bas) :** Cartes et notifications UI (Stripe, WhatsApp, etc.).
* **Règle d'or de largeur :** La largeur de la carte UI doit être **égale ou inférieure** à la largeur du bloc de sous-titres, jamais plus large !
* **Fond des Shorts (Shorts Backdrop) :** Combiner systématiquement :
  * Dégradé radial subtil.
  * Grille vectorielle en pointillés fins (*Grid Lines*).
  * Trame de matière *Halftone* (opacité 15-20%).
  * Éléments d'ambiance floutés aux coins opposés pour habiller les zones mortes.

---

## 🧩 10. Déconstruction des Calques (Assets + Effects + Animation)
Tout habillage vidéo professionnel se compose de 3 couches chronologiques :
1. **Couche Assets :** Fichiers bruts (texte SVG, mockup téléphone PNG détouré, icônes).
2. **Couche Effects :** Flou d'arrière-plan, ombre portée 3D (`box-shadow: 0 20px 40px rgba(...)`), lueur interne.
3. **Couche Animation :** Transition d'entrée GSAP (`scale: 0.9 -> 1`, `opacity: 0 -> 1`, `ease: "power3.inOut"`), suivi d'un léger flottement (*idle float*).

---

## 🎬 11. Rythme de Réalisation : Règle Anti-PowerPoint & Enchaînement Immédiat
* **Une vidéo n'est JAMAIS un diaporama statique :** L'attention d'un spectateur moderne s'effondre au bout de 2 à 3 secondes d'immobilité.
* **Coupure dès fin d'animation :** Dès que la dernière animation ou action explicative d'une scène se termine, la scène **COUPE et enchaîne immédiatement sur la scène suivante**. Ne jamais laisser une scène stagner passivement en attendant la fin d'un timer arbitraire.
* **Scène longue = Volonté pédagogique explicite :** Une scène ne doit durer plus de 10 secondes QUE si elle sert à décomposer pas-à-pas un mécanisme ou un raisonnement complexe en plusieurs étapes interactives.
* **Découpage asservi au Script :** Le nombre de scènes n'est jamais réduit artificiellement. C'est le flux du texte et la densité des idées qui commandent le découpage (en moyenne 1 changement de visuel ou d'angle toutes les 3 à 5 secondes).

---

## 🎯 12. Synchronisation Script-to-Screen (Illustration Immédiate du Mot Dit)
* **Illustration au mot près :** Dès qu'un mot ou concept est évoqué par le script (lieu, personne, chiffre, pièce mécanique, alarme, document, courriel, logo), il doit être **instantanément illustré à la seconde exacte** à l'écran :
  * Un chiffre $\rightarrow$ Compteur tabulaire géant animé ou Hero Stat.
  * Un lieu $\rightarrow$ Carte radar ou vue satellite vectorielle.
  * Une citation $\rightarrow$ Fiche verbatim avec guillemets et tampon officiel.
  * Une pièce ou incident $\rightarrow$ Schéma 2D en écorché, vue technique ou reconstitution 3D.
  * Une révélation de presse $\rightarrow$ Article avec coup de surligneur jaune Vox.
* **Interdiction des tunnels vides :** Aucun temps mort où la voix parle sans support graphique direct lié au propos.

---

## 📈 13. Physique des Animations d'Apparition : La Courbe en S (Slow-Fast-Slow)
* **Bannir les animations paresseuses :** Interdiction des simples fondus d'opacité (`fade-in`) ou des simples translations linéaires ennuyeuses.
* **La Courbe Signature (Départ lent $\rightarrow$ Accélération $\rightarrow$ Arrivée lente) :**
  * Toute apparition de composant doit suivre une courbe sigmoïde avec amorti velouté :
    ```javascript
    // Formule GSAP standard pour les entrées de composants et textes
    gsap.from(element, {
        y: 60,
        scale: 0.92,
        opacity: 0,
        duration: 1.2,
        ease: "power3.inOut" // Départ doux -> accélération centrale -> atterrissage feutré
    });
    ```
* **Richesse et Variété permanente :**
  * Alterner systématiquement entre :
    1. *Kinetic S-Curve* (Translation Y + Scale dynamique).
    2. *Masked Stagger Reveal* (Découpe d'overflow avec apparition mot-par-mot).
    3. *Blur-to-Focus Converge* (Flou gaussien qui se nettit à l'arrivée).
    4. *3D Spatial Flip-In* (Perspective 3D `rotateX` ou `rotateY`).
    5. *Kinetic Letter-Spacing* (Expansion puis resserrement des caractères).
    6. *Diagonal Clip-Path Reveal* (Volet tranchant en biseau).

---

## ⏱️ 14. Architecture Technique Vidéo & Studio Player (Règle de la Timeline Unique et Déterministe)
Pour garantir une lecture fluide (sans blocage à la lecture ni textes figés) et un scrubbing bidirectionnel instantané dans le Studio et lors du rendu vidéo :

1. **Règle Absolue : Zéro sous-timeline orpheline ou dynamique :**
   * **INTERDICTION FORMELLE** d'instancier des `const subTl = gsap.timeline()` non rattachées ou dynamiques à l'intérieur de fonctions `onUpdate`, `updateStepForTime` ou `step.play()`.
   * **TOUS les tweens** (entrées, boucles, sorties, caméras) doivent être attachés **directement à la timeline maîtresse `window.tl`** à leur timestamp absolu précis :
     ```javascript
     // OBLIGATOIRE : Rattachement direct sur window.tl au timestamp exact
     tl.from('#element', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.inOut' }, 4.0);
     ```

2. **Déterminisme Absolu (Scrub & Seek-Safe) :**
   * L'appel `tl.seek(t)` doit être capable de reconstruire l'état visuel exact de la vidéo à la milliseconde près, en marche avant comme en marche arrière.
   * Les animations en boucle (`idle`) ne doivent pas être des boucles infinies non synchronisées : elles doivent être découpées en cycles déterministes sur la durée d'apparition de la scène (ex: 2 cycles de 2.5s pour une scène de 5s).

3. **Dégel du Ticker GSAP lors du Play (Contrat Studio Player) :**
   * En mode pause ou lors du scrubbing, le Studio gèle le ticker global GSAP (`gsap.globalTimeline.pause()`).
   * Tout objet `window.__timeline` doit défensivement réveiller le Ticker GSAP lors de l'appel à `.play()` :
     ```javascript
     window.__timeline = {
         duration: () => DURATION,
         seek: (t, isUserSeeking = false) => {
             updateHUDForTime(t);
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
             // Réveil obligatoire de la timeline globale GSAP
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

4. **Isolation DOM des scènes et slides :**
   * Chaque scène ou template d'animation possède son propre conteneur DOM dédié (`display: none; opacity: 0;`).
   * Le cycle de vie est piloté exclusivement par la timeline maîtresse :
     ```javascript
     tl.set('#demo_1', { display: 'flex', opacity: 1 }, 4.0);
     // ... tweens de la scène 1 ...
     tl.set('#demo_1', { display: 'none', opacity: 0 }, 9.0);
     ```

---

## 📁 Composants associés dans le projet
* Visualiseur Interactif d'Animations (Paramètres) : `09_Pages/animation_viewer.html`
* Bibliothèque d'Animations de Textes (Entrées, Sorties, Boucles) : `02_Composants/Text animation/mes_animations_textes.html`
* Dual-Font Typography : `02_Composants/Text animation/dual_font_typography.html`
* Fond Texturé Shorts (Grille + Halftone) : `02_Composants/Background/short_textured_backdrop.html`
* Split-Screen Horizontal avec flou : `02_Composants/Split_Screen/horizontal_side_by_side.html`
* Empilement Vertical Sous-titre + UI : `02_Composants/Callouts_Badges/vertical_subtitle_ui_stack.html`
* Suite de Notifications Vidéo : `02_Composants/Callouts_Badges/shadcn_notification_toast.html`

