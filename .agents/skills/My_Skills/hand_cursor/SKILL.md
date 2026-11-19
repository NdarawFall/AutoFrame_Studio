---
name: hand_cursor_interaction
description: "Règles d'or et patterns d'animation GSAP pour les curseurs mains (openhand, closedhand, pointinghand). À utiliser SYSTÉMATIQUEMENT dès qu'une scène vidéo, mockup UI ou animation nécessite un curseur, un mouvement de saisie (grab), un déplacement de carte/objet par le centre haut, un clic sur un bouton centré au pixel près, un scroll, un câblage de flux, un slider ou une interaction humaine réaliste."
---

# Skill : Hand Cursor Interaction & Motion Mastery

Ce skill définit les **règles universelles d'animation et d'interaction des curseurs mains** pour toutes les vidéos de motion design et d'interface utilisateur (UI/UX) générées dans MarvidFlow.

> [!IMPORTANT]
> **Interdiction absolue d'inventer des curseurs.**
> L'IA ne doit **JAMAIS** dessiner ou improviser des formes de mains ou de curseurs personnalisés.
> Seules les **3 icônes officielles** fournies dans `01_Assets/Icones/` doivent être utilisées :
> - `01_Assets/Icones/openhand_100161.svg`
> - `01_Assets/Icones/closedhand_100189.svg`
> - `01_Assets/Icones/pointinghand_100160.svg`

---

## 🧠 1. Philosophie & Sens Logique de l'Apparition des Curseurs

Un curseur main n'est **JAMAIS un élément décoratif passif**. Il symbolise l'**intervention délibérée et utile d'un être humain** (l'utilisateur, le créateur, l'opérateur).

### 🎯 La Règle d'Or Fondamentale : Toute Action Doit Avoir une Raison Valable
> **Ne JAMAIS faire de geste ou de tracé gratuit sans utilité fonctionnelle.**
> Dans une interface logicielle, chaque action du curseur doit correspondre à une fonction réelle que ferait un vrai utilisateur :
> - Déplacer et agencer un bloc (drag & drop)
> - Brancher un câble de flux entre deux ports (câblage nodal / pipeline)
> - Glisser le bouton d'un curseur de réglage / slider (framerate, volume, durée)
> - Cliquer sur un bouton, un toggle switch ou un onglet

### 🚫 Interdictions Formelles d'Apparition :
- ❌ **JAMAIS de tracé de ligne arbitraire sur une UI** : Dessiner un trait horizontal aléatoire sur une interface sans raison fonctionnelle est formellement interdit. Sur un logiciel, un utilisateur n'utilise pas de feutre pour gribouiller sur les formulaires ou les cartes.
- ❌ **JAMAIS sur les graphiques statistiques (courbes de données boursières, barres analytiques, camemberts)** : Un graphique de données s'anime seul via ses axes et ses courbes (stroke-dashoffset, scaleY). Y mettre une main est absurde et non professionnel.
- ❌ **JAMAIS pour masquer un processus automatisé** : Les calculs GPU, les barres de progression système, les transitions d'écrans automatiques ne doivent pas avoir de curseur.
- ❌ **JAMAIS de curseur qui flotte au hasard dans le vide** : Chaque déplacement a une cible précise, une intention, et se retire du cadre dès l'action accomplie.

---

## 🖐️ 2. Le Triptyque des 3 Curseurs Officiels

| Type de Main | Fichier SVG Source | Rôle Principal | Exemple d'utilisation |
| :--- | :--- | :--- | :--- |
| **Open Hand** (Main Ouverte) | `01_Assets/Icones/openhand_100161.svg` | **Arrivée sur place / Repos / Relâchement** | Arrivée directement sur le bord d'une carte, lâcher-prise après déplacement, sortie d'écran. |
| **Closed Hand** (Main Fermée / Fist) | `01_Assets/Icones/closedhand_100189.svg` | **Saisie physique (Grab & Drag)** | Pincer et tenir fermement le bord d'une carte, glisser-déposer, manipuler la tête d'un slider. |
| **Pointing Hand** (Pointeur Index) | `01_Assets/Icones/pointinghand_100160.svg` | **Pression / Câblage / Clic / Scroll** | Clic sur un bouton centré au pixel, tirer un câble entre 2 blocs, swipe vertical tactile. |

---

## 📐 3. Structure HTML & CSS Standardisée

Pour toute scène nécessitant un curseur, injecter le bloc suivant dans le conteneur `#stage` :

```html
<!-- CONTENEUR UNIQUE DU CURSEUR MAIN -->
<div id="handCursorWrapper">
    <!-- 1. MAIN OUVERTE (Hover, Direct On-Place Arrival & Release) -->
    <svg id="handOpen" class="cursor-hand-svg active" viewBox="0 0 16 17" fill="none">
        <path d="M4.5557,8.5742 C4.4577,8.1992 4.3597,7.7272 4.1497,7.0222 C3.9827,6.4652 3.8077,6.1632 3.6797,5.7892 C3.5247,5.3342 3.3767,5.0682 3.1837,4.6082 C3.0447,4.2792 2.8197,3.5602 2.7267,3.1682 C2.6077,2.6592 2.7597,2.2442 2.9707,1.9622 C3.2237,1.6232 3.9327,1.4722 4.3277,1.6112 C4.6987,1.7412 5.0717,2.1232 5.2437,2.3992 C5.5317,2.8592 5.6007,3.0312 5.9607,3.9412 C6.3537,4.9332 6.5247,5.8592 6.5717,6.1722 L6.6567,6.6242 C6.6557,6.5842 6.6137,5.5022 6.6127,5.4622 C6.5777,4.4332 6.5527,3.6392 6.5747,2.5232 C6.5767,2.3972 6.6387,1.9362 6.6587,1.8082 C6.7367,1.3082 6.9637,1.0082 7.3317,0.8292 C7.7437,0.6282 8.2577,0.6142 8.7327,0.8122 C9.1557,0.9852 9.3587,1.3622 9.4197,1.8342 C9.4337,1.9432 9.5137,2.8212 9.5127,2.9412 C9.4997,3.9662 9.5187,4.5822 9.5277,5.1152 C9.5317,5.3462 9.5307,6.7402 9.5447,6.5842 C9.6057,5.9282 9.6387,3.3952 9.8887,2.6422 C10.0327,2.2092 10.2937,1.8962 10.6827,1.7132 C11.1137,1.5102 11.7957,1.6432 12.0867,1.9562 C12.3717,2.2612 12.5327,2.6482 12.5687,3.1092 C12.6007,3.5142 12.5497,4.0062 12.5487,4.3542 C12.5487,5.2212 12.5277,5.6782 12.5117,6.4752 C12.5107,6.5132 12.4967,6.7732 12.5347,6.6572 C12.6287,6.3772 12.7227,6.1152 12.8007,5.9122 C12.8497,5.7872 13.0417,5.2982 13.1597,5.0532 C13.2737,4.8192 13.3707,4.6842 13.5747,4.3652 C13.7747,4.0522 13.9897,3.9172 14.2427,3.8042 C14.7827,3.5692 15.3517,3.9162 15.5437,4.3952 C15.6297,4.6102 15.5527,5.1082 15.5157,5.5002 C15.4547,6.1472 15.2617,6.8062 15.1637,7.1482 C15.0357,7.5952 14.8897,8.3832 14.8237,8.7492 C14.7517,9.1432 14.5897,10.1312 14.4647,10.5692 C14.3787,10.8702 14.0937,11.5472 13.8127,11.9532 C13.8127,11.9532 12.7387,13.2032 12.6207,13.7652 C12.5037,14.3282 12.5427,14.3322 12.5197,14.7302 C12.4957,15.1292 12.6407,15.6532 12.6407,15.6532 C12.6407,15.6532 11.8387,15.7572 11.4067,15.6872 C11.0157,15.6252 10.5317,14.8462 10.4067,14.6092 C10.2347,14.2812 9.8677,14.3442 9.7247,14.5862 C9.4997,14.9692 9.0157,15.6562 8.6737,15.6992 C8.0057,15.7832 6.6197,15.7292 5.5347,15.7192 C5.5347,15.7192 5.7197,14.7082 5.3077,14.3612 C5.0027,14.1012 4.4777,13.5772 4.1637,13.3012 L3.3317,12.3802 C3.0477,12.0202 2.7027,11.2872 2.0887,10.3952 C1.7407,9.8912 1.0617,9.3102 0.8047,8.8162 C0.5817,8.3912 0.4737,7.8622 0.6147,7.4912 C0.8397,6.8972 1.2897,6.5942 1.9767,6.6592 C2.4957,6.7092 2.8247,6.8652 3.2147,7.1962 C3.4397,7.3862 3.7877,7.7302 3.9647,7.9442 C4.1277,8.1392 4.1677,8.2202 4.3417,8.4532 C4.5717,8.7602 4.6437,8.9122 4.5557,8.5742" fill="#FFFFFF" stroke="#000000" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.5664,12.7344 L11.5664,9.2754 M9.5508,12.7461 L9.5348,9.2731 M7.5547,9.3047 L7.5757,12.7307" stroke="#000000" stroke-width="0.75" stroke-linecap="round"/>
    </svg>

    <!-- 2. MAIN FERMÉE (Grab & Hold) -->
    <svg id="handClosed" class="cursor-hand-svg" viewBox="0 0 15 14" fill="none">
        <path d="M3.5732,1.0361 C4.0532,0.8581 5.0002,0.9671 5.2502,1.5091 C5.4632,1.9711 5.6462,2.7501 5.6562,2.5841 C5.6802,2.2151 5.6322,1.4171 5.7932,1.0001 C5.9102,0.6961 6.1402,0.4101 6.4792,0.3091 C6.7642,0.2231 7.0992,0.1931 7.3952,0.2541 C7.7082,0.3181 8.0372,0.5411 8.1602,0.7531 C8.5222,1.3761 8.5282,2.6521 8.5452,2.5841 C8.6092,2.3121 8.6152,1.3551 8.8282,1.0001 C8.9692,0.7651 9.3252,0.5551 9.5152,0.5211 C9.8092,0.4691 10.1712,0.4531 10.4792,0.5131 C10.7282,0.5621 11.0652,0.8571 11.1562,1.0001 C11.3752,1.3441 11.4982,2.3161 11.5352,2.6581 C11.5512,2.7991 11.6092,2.2651 11.8282,1.9221 C12.2342,1.2831 13.6722,1.1591 13.7262,2.5611 C13.7522,3.2151 13.7462,3.1851 13.7462,3.6251 C13.7462,4.1411 13.7342,4.4531 13.7062,4.8271 C13.6762,5.2261 13.5902,6.1311 13.4652,6.5691 C13.3792,6.8701 13.0942,7.5471 12.8122,7.9531 C12.8122,7.9531 11.7382,9.2031 11.6212,9.7651 C11.5042,10.3281 11.5432,10.3321 11.5192,10.7301 C11.4962,11.1291 11.6402,11.6531 11.6402,11.6531 C11.6402,11.6531 10.8392,11.7571 10.4062,11.6871 C10.0152,11.6251 9.5312,10.8471 9.4062,10.6091 C9.2342,10.2811 8.8672,10.3441 8.7242,10.5861 C8.5002,10.9691 8.0152,11.6561 7.6742,11.6991 C7.0052,11.7831 5.6192,11.7291 4.5342,11.7191 C4.5342,11.7191 4.7192,10.7081 4.3072,10.3611 C4.0022,10.1011 3.4772,9.5771 3.1632,9.3011 L2.3312,8.3801 C2.0482,8.0201 1.3292,7.4511 1.0882,6.3951 C0.8752,5.4591 0.8962,5.0001 1.1252,4.6251 C1.3572,4.2441 1.7952,4.0361 1.9792,4.0001 C2.1872,3.9581 2.6712,3.9611 2.8542,4.0621 C3.0772,4.1851 3.1672,4.2211 3.3422,4.4531 C3.5722,4.7601 3.6542,4.9091 3.5552,4.5741 C3.4792,4.3121 3.2332,3.9791 3.1212,3.6041 C3.0122,3.2431 2.7202,2.6611 2.7412,2.0781 C2.7492,1.8571 2.8442,1.3071 3.5732,1.0361 L3.5732,1.0361 Z" fill="#FFFFFF" stroke="#000000" stroke-width="0.75" stroke-linejoin="round"/>
        <path d="M10.5664,8.7344 L10.5664,5.2754 M8.5508,8.7461 L8.5348,5.2731 M6.5547,5.3047 L6.5757,8.7307" stroke="#000000" stroke-width="0.75" stroke-linecap="round"/>
    </svg>

    <!-- 3. MAIN POINTEUR (Click / Wire / Scroll) -->
    <svg id="handPointing" class="cursor-hand-svg" viewBox="0 0 16 17" fill="none">
        <path d="M3.3315,12.3799 C3.0475,12.0209 2.7025,11.2869 2.0885,10.3959 C1.7405,9.8919 0.8775,8.9429 0.6205,8.4609 C0.3975,8.0349 0.4215,7.8439 0.4745,7.4909 C0.5685,6.8629 1.2125,6.3739 1.8995,6.4399 C2.4185,6.4889 2.8585,6.8319 3.2545,7.1559 C3.4935,7.3509 3.7875,7.7299 3.9645,7.9439 C4.1275,8.1399 4.1675,8.2209 4.3415,8.4529 C4.5715,8.7599 4.6435,8.9119 4.5555,8.5739 C4.4845,8.0779 4.3685,7.2309 4.2005,6.4819 C4.0725,5.9139 4.0415,5.8249 3.9195,5.3889 C3.7905,4.9249 3.7245,4.5999 3.6035,4.1079 C3.5195,3.7599 3.3685,3.0489 3.3275,2.6489 C3.2705,2.1019 3.2405,1.2099 3.5915,0.7999 C3.8665,0.4789 4.4975,0.3819 4.8885,0.5799 C5.4005,0.8389 5.6915,1.5829 5.8245,1.8799 C6.0635,2.4139 6.2115,3.0309 6.3405,3.8409 C6.5045,4.8719 6.8065,6.3029 6.8165,6.6039 C6.8405,6.2349 6.7485,5.4579 6.8125,5.1039 C6.8705,4.7829 7.1405,4.4099 7.4785,4.3089 C7.7645,4.2239 8.0995,4.1929 8.3945,4.2539 C8.7075,4.3179 9.0375,4.5419 9.1605,4.7529 C9.5225,5.3769 9.5295,6.6519 9.5445,6.5839 C9.6305,6.2079 9.6155,5.3549 9.8285,4.9999 C9.9685,4.7659 10.3255,4.5549 10.5155,4.5209 C10.8095,4.4689 11.1705,4.4529 11.4795,4.5129 C11.7285,4.5619 12.0655,4.8579 12.1565,4.9999 C12.3745,5.3439 12.4985,6.3169 12.5355,6.6579 C12.5505,6.7989 12.6095,6.2659 12.8285,5.9219 C13.2345,5.2829 14.6715,5.1589 14.7265,6.5609 C14.7515,7.2149 14.7465,7.1849 14.7465,7.6249 C14.7465,8.1419 14.7345,8.4529 14.7065,8.8269 C14.6755,9.2269 14.5895,10.1309 14.4645,10.5689 C14.3785,10.8699 14.0935,11.5469 13.8125,11.9529 C13.8125,11.9529 12.7385,13.2029 12.6215,13.7659 C12.5035,14.3279 12.5425,14.3319 12.5195,14.7309 C12.4965,15.1289 12.6405,15.6529 12.6405,15.6529 C12.6405,15.6529 11.8385,15.7569 11.4065,15.6879 C11.0155,15.6249 10.5315,14.8469 10.4065,14.6089 C10.2345,14.2809 9.8675,14.3439 9.7245,14.5859 C9.4995,14.9689 9.0155,15.6559 8.6735,15.6989 C8.0055,15.7829 6.6195,15.7299 5.5345,15.7189 C5.5345,15.7189 5.7195,14.7079 5.3075,14.3609 C5.0025,14.1019 4.4775,13.5769 4.1635,13.3009 L3.3315,12.3799 Z" fill="#FFFFFF" stroke="#000000" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.5664,12.7344 L11.5664,9.2754 M9.5508,12.7461 L9.5348,9.2731 M7.5547,9.3047 L7.5757,12.7307" stroke="#000000" stroke-width="0.75" stroke-linecap="round"/>
    </svg>
</div>
```

### Style CSS Obligatoire

```css
#handCursorWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 52px;
    height: 52px;
    pointer-events: none;
    z-index: 100;
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    will-change: transform;
    transform-origin: 26px 26px; /* Centre par défaut pour openhand & closedhand */
}

.cursor-hand-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
}

.cursor-hand-svg.active {
    display: block;
}
```

---

## 🎯 Règle d'Or N°1 : Saisie de Carte / Objet par le Centre Haut ("Comme une Vraie Main")

Lorsqu'un curseur interagit avec une carte, une modale, un bloc ou un composant :

### 1. Arrivée DIRECTE SUR PLACE (Zéro Flottement Aérien)
- ❌ **INTERDIT** : Arriver à `cardTop - 40px` dans le vide avant de descendre.
- ✅ **OBLIGATOIRE** : Le curseur `openhand` doit se positionner **directement sur place** sur le centre du bord supérieur de l'objet :
  $$\text{Target } X = \text{cardCenterX} - 26\text{px}, \quad \text{Target } Y = \text{cardTop} - 18\text{px}$$
  La main repose directement au niveau de la bordure supérieure.

### 2. Saisie Ferme (Closed Hand) sur la bordure
- Basculer immédiatement sur `closedhand` :
  $$\text{Grab } Y = \text{cardTop} - 20\text{px}$$
  Les doigts de la main fermée enserrent physiquement le bord supérieur de la carte.

### 3. Pivot Pendulaire Gravitationnel (`transform-origin: center top`)
- L'élément déplacé **doit obligatoirement avoir `transform-origin: center top;`**.
- Lorsque la main déplace la carte vers la gauche ou la droite, le bas de la carte subit une inertie pendulaire naturelle (`rotation: -3.5° à -5°` en déplacement gauche, `+3.5° à +5°` en déplacement droite).

### 4. Élévation et Ombre portée dynamique
- Au moment du grab, la carte grossit légèrement (`scale: 1.03`) et son ombre portée s'étend considérablement (`box-shadow: 0 40px 80px -12px rgba(15, 23, 42, 0.24)`).

### 5. Relâchement (Drop)
- La main bascule en `openhand` sur place (`Y = cardTop - 18px`).
- La carte redescend avec un amorti élastique doux (`ease: 'back.out(2)'`, `scale: 1`, ombre normale).
- La main s'élève ensuite pour quitter la zone ou transitionner vers l'action suivante.

---

## ⚡ Règle d'Or N°2 : Câblage de Flux Nodal (Wire / Node Connection)

### Cas d'Usage Légitime :
- Relier la sortie (port output) d'une boîte A à l'entrée (port input) d'une boîte B dans un schéma fonctionnel (liaison de données, pipeline automatisé).

### 📐 Verrouillage Géométrique au Bout du Doigt
L'extrémité active de l'index (`pointinghand`) se situe exactement à :
$$\text{Fingertip } X = \text{wrapper } X + 15\text{px}, \quad \text{Fingertip } Y = \text{wrapper } Y + 2\text{px}$$

Pour tracer une ligne reliant le point $A(x_1, y_1)$ au point $B(x_2, y_2)$ :
1. L'index se pose sur le port $A$ :
   $$\text{wrapper } X = x_1 - 15, \quad \text{wrapper } Y = y_1 - 2$$
2. **Le câble SVG doit être physiquement attaché à l'index à tout instant !**
   Dans GSAP, piloter un objet proxy dont l'`onUpdate` met à jour simultanément le curseur et la coordonnée terminale du trait SVG :

```javascript
// Câblage parfait verrouillé au pixel
const wireProxy = { x: portA.x, y: portA.y };

masterTL.to(wireProxy, {
    x: portB.x,
    y: portB.y,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
        gsap.set(handCursor, { x: wireProxy.x - 15, y: wireProxy.y - 2 });
        // Mettre à jour le câble avec courbure caténaire réaliste
        updateCablePath(wireProxy.x, wireProxy.y);
    }
}, startTime);

// Arrivée au port B : Snap magnétique & onde de connexion
masterTL.set(portB_snapGlow, { opacity: 1, scale: 0 }, startTime + 1.4);
masterTL.to(portB_snapGlow, { duration: 0.4, scale: 2.5, opacity: 0, ease: 'power2.out' }, startTime + 1.4);
```

---

## 🎚️ Règle d'Or N°3 : Manipulation de Slider / Curseur de Réglage

Pour ajuster un paramètre fonctionnel réel (framerate, durée, volume, qualité) :

### 1. Prise en main du curseur (Slider Thumb) :
- `openhand` s'approche du thumb du slider.
- `closedhand` saisit la tête du slider :
  $$\text{Target } X = \text{thumbCenterX} - 26\text{px}, \quad \text{Target } Y = \text{thumbCenterY} - 20\text{px}$$

### 2. Glissement horizontal & Incrémentation en temps réel :
- La main glisse horizontalement vers la droite.
- Le thumb et la barre de progression (`sliderFill`) suivent la main au pixel près.
- Le texte de valeur (ex: `30 FPS ➔ 60 FPS`) s'actualise en direct.
- À la position cible, la main s'ouvre (`openhand`) et se dégage vers le bouton suivant.

### 3. Règle Cardinale de Design & Motion : Concision du Texte & Zéro Décalage de Layout (Layout Shift)
- ❌ **Interdiction absolue des fioritures textuelles inutiles** : Ne jamais ajouter de superlatifs bavards (« Ultra-Fluide », « Standard », etc.). **Aller droit à l'essentiel** : simplement `30 FPS` ➔ `60 FPS`.
- ❌ **Interdiction formelle de changement de texte provoquant un saut de layout (Layout Shift)** : Si un texte dynamique s'allonge et provoque un retour à la ligne (`wrap`), toute la structure interne de la carte saute, la hauteur change, et **la ligne du slider se décale verticalement pendant la trajectoire**. Résultat : la main ne suit plus la ligne et le design est détruit.
- ✅ **Prévoyance obligatoire dès le design** :
  - Textes d'état concis et de longueur strictement identique (`30 FPS` ➔ `60 FPS`, `⚡ 30 FPS` ➔ `⚡ 60 FPS`).
  - Verrouillage avec `white-space: nowrap;` et conteneurs stables.
  - La hauteur des blocs doit rester 100% rigide et immuable pendant toute la manipulation.

---

## 🔘 Règle d'Or N°4 : Clic Bouton Centré au Pixel Près

Le point de contact effectif du curseur index (`pointinghand`) est rigoureusement à :
$$\Delta X = 15\text{px}, \quad \Delta Y = 2\text{px}$$

### 1. Formule de Centrage Absolu sur un Bouton
```javascript
const btnCenterX = btnRect.x + (btnRect.width / 2);
const btnCenterY = btnRect.y + (btnRect.height / 2);

// Position exacte du wrapper :
const targetCursorX = btnCenterX - 15;
const targetCursorY = btnCenterY - 2;
```

### 2. Ancrage Dynamique du Doigt (`transform-origin: 15px 2px`)
Lors du passage en `pointinghand`, fixer impérativement :
```javascript
masterTL.set(handCursor, { transformOrigin: '15px 2px' }, time);
```
**Pourquoi :** Lorsque le doigt appuie (`scale: 0.88`), la pulpe de l'index reste **rigoureusement immobile au même pixel** sans jamais dériver ou glisser sur le bouton.

### 3. Effet d'Onde Ripple Centré
L'onde de clic circulaire s'étend depuis le centre exact du bouton, directement sous la pulpe de l'index.

---

## 📜 Règle d'Or N°5 : Défilement Tactile (Scroll & Swipe)

Pour simuler un défilement sur mobile ou desktop avec `pointinghand` :
1. **Prise de contact** : Le doigt arrive sur le tiers inférieur (`y: 650`), légère pression (`scale: 0.95`).
2. **Flick vers le haut** : Mouvement vif vers le haut (`y: 520`, durée 0.4s, `ease: 'power2.out'`). Le contenu défile simultanément vers le haut (`translateY: -120px`).
3. **Relèvement & Réarmement** : Le doigt se relève (`scale: 1.05`), puis redescend de façon fluide prêt pour un nouveau swipe.

---

## 🚫 Synthèse des Interdictions Absolues

1. ❌ **Ne jamais dessiner de trait arbitraire ou de ligne sans raison valable** : Tout mouvement de tracé doit représenter une action fonctionnelle indiscutable (relier deux ports, régler un slider).
2. ❌ **Ne jamais flotter 40px au-dessus de la carte avant de l'attraper** : Arriver directement SUR PLACE sur le bord supérieur (`cardTop - 18px`).
3. ❌ **Ne jamais placer la main fermée au milieu de la carte** : La main doit **toujours pincer le centre du bord supérieur**.
4. ❌ **Ne jamais faire pivoter la carte depuis son centre (`transform-origin: center`) pendant le déplacement** : Une carte tenue par le haut tourne depuis son point d'attache (`transform-origin: center top`).
5. ❌ **Ne jamais mettre de main sur un graphique de données statistiques** : Les courbes et charts s'animent seuls.
6. ❌ **Ne jamais désynchroniser un tracé et le bout du doigt** : Verrouillage mathématique à 100% à chaque frame.
7. ❌ **Ne jamais cliquer avec des coordonnées arbitraires** : Toujours calculer le centre du bouton et soustraire l'offset de l'index (`-15px, -2px`).
8. ❌ **Ne jamais oublier `transformOrigin: '15px 2px'` au clic** : Évite toute dérive lors de la pression.
9. ❌ **Ne jamais changer un texte dynamique au risque de provoquer un saut de layout (Layout Shift)** : Éviter les superlatifs inutiles (« Ultra-Fluide »), aller droit à l'essentiel (`30 FPS` ➔ `60 FPS`), et s'assurer que le texte ne provoque aucun retour à la ligne décalant les éléments sous la main du curseur.
