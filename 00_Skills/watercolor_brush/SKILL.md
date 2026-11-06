---
name: watercolor_brush
description: Rendu d'aquarelle organique, carnet naturaliste, encres animées, papier chiffon texturé, diffusion de pigments (wash & bleed) et écriture manuscrite élégante. Idéal pour documentaires poétiques, nature, histoire et storytelling sensible.
---

# Skill : Watercolor Brush (Aquarelle Vivante & Carnet de Voyage)

Ce skill formalise les techniques pour créer l'illusion d'une page de carnet d'artiste ou d'aquarelle vivante qui **se peint d'elle-même**, avec des touches de pinceau transparentes, des effets de séchage et des annotations manuscrites.

---

## 🎯 1. Principes Fondamentaux de l'Aquarelle Numérique

* **Le papier est la lumière** :
  * On ne peint jamais en blanc pur : le blanc, c'est le **papier coton non peint** (`#fbf8f1` ou `#f5ede0`).
  * Texture de papier granuleuse (bruit à plusieurs octaves, fibres visibles, léger vignetage périphérique).
* **Superposition translucide & Pigmentation** :
  * Les couleurs ne sont pas opaques : chaque coup de pinceau est un ruban semi-transparent (opacité 0.4 à 0.6).
  * Là où deux coups de pinceau se croisent, la couleur se densifie naturellement.
  * **Pooled edges (Bords d'accumulation)** : l'eau accumule les pigments sur les contours du tracé, créant un cerne légèrement plus sombre.
* **Ordre de dessin organique** :
  * Tout se peint couche après couche : d'abord la structure générale (le lavis), puis les ombres, enfin les détails et accents sombres.
  * Les annotations manuscrites (police type plume ou manuscrite fine) apparaissent comme tracées à l'encre avec une fine ligne de rappel.

---

## 🎨 2. Palette & Couleurs Organiques

* **Fond de papier** : crème chaud `#f9f6ef` avec fibres subtiles.
* **Encres de dessin & lettrage** : brun sépia sombre `#2b2520` ou encre de Chine atténuée `#1e1e1e`.
* **Exemples de palettes naturelles** :
  * *Terre & Végétal* : ocre rouge `#c2593f`, vert sauge `#8ea860`, paille `#e8e0c0`, vert mousse `#4e6e3c`.
  * *Aube & Marine* : ciel pêche pâle `#f3e2c8`, eau bleutée `#9fb4c4`, coque de bateau `#5f7486`, accent bouée vermillon `#c8442a`.
* **Accent unique** : une pointe de couleur vive (rouge vermillon ou bleu outremer) réservée au sujet principal ou au tampon final.

---

## 🎥 3. Grammaire de Caméra & Transitions

| Mouvement | Émotion / Rôle | Cas d'Usage |
| :--- | :--- | :--- |
| **Travelling horizontal lent (Pan)** | Déroulé d'un paysage ou d'une frise chronologique | Récit de voyage, panorama |
| **Plan fixe observant la peinture se former** | Contemplation, découverte posée | Gros plan sur une fleur, un schéma ou une recette |
| **Zoom avant doux sur une annotation** | Intimité, lecture d'un détail personnel | Zoom sur une note manuscrite ou un chiffre |
| **Effacement par brume (Mist wash)** | Transition douce sans coupure brutale | Changement de scène ou d'époque |

---

## 💻 4. Algorithme de Tracé de Pinceau (HTML5 Canvas 2D)

```javascript
// Reproduction d'un trait d'aquarelle avec dispersion de poils de pinceau
function drawWatercolorStroke(ctx, points, color, baseWidth, progress) {
    const totalPoints = Math.floor(points.length * Math.min(1, Math.max(0, progress)));
    if (totalPoints < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Corps principal du lavis semi-transparent
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < totalPoints; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.strokeStyle = color; // ex: "rgba(142, 168, 96, 0.45)"
    ctx.lineWidth = baseWidth;
    ctx.stroke();

    // 2. Fibres et poils secs (Dry brush bristles)
    const bristlesCount = 5;
    for (let b = 0; b < bristlesCount; b++) {
        const offset = (b - bristlesCount / 2) * (baseWidth * 0.18);
        ctx.beginPath();
        ctx.moveTo(points[0].x + offset, points[0].y + offset);
        for (let i = 1; i < totalPoints; i++) {
            ctx.lineTo(points[i].x + offset, points[i].y + offset);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
    }

    ctx.restore();
}
```

---

## 🔊 5. Sound Design Associé
* **Frottement de papier** : léger crissement de poils de pinceau sur grain de papier (`brush rustle`).
* **Tracé de plume** : gratouillis délicat d'encre lors de l'apparition des textes manuscrits.
* **Musique** : piano feutré, guitare acoustique picking, flûtes en bois et kalimba.

