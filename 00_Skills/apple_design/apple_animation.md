# Moteur d'Animation Apple Keynote (Motion Design & Chorégraphie Cinématique)

Ce guide formalise l'ensemble des règles de **cinématique, d'interpolation et de chorégraphie temporelle** propres aux vidéos de présentation et publicités de style Apple.

Il complète le document principal [`SKILL.md`](file:///c:/Users/ndara/heygen-new/00_Skills/apple_design/SKILL.md) et détaille le comportement dynamique des composants, du logo héroïque, des appareils et du son.

---

## ⏱️ 1. Principes Fondamentaux de la Physique d'Animation Apple

### A. Les Courbes d'Interpolation (Easing Curves)
Apple n'utilise jamais d'animations linéaires mécaniques ni de rebonds mous de type cartoon. L'accélération est instantanée et la décélération est longue et soyeuse :

```javascript
const ease = {
    // Easing signature Apple Keynote (Snappy & Naturel)
    out: t => 1 - Math.pow(1 - t, 3), // cubic ease-out
    
    // Easing cinématique doux pour les rotations d'appareils et travellings
    inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    
    // Easing de précision pour les compteurs numériques
    smoothStep: t => t * t * (3 - 2 * t)
};
```

### B. Le Principe de la "Respiration Vivante" (Idle Breath Motion)
Un plan Apple n'est **JAMAIS parfaitement figé**. Même en phase de contemplation, un élément au premier plan conserve une micro-oscillation organique :
```javascript
// Déplacement vertical subtil de respiration
const breatheY = Math.sin(time * 1.8) * 8; // Amplitude 8px à basse fréquence

// Légère variation d'échelle vivante
const breatheScale = 1 + Math.sin(time * 2.2) * 0.015; // ±1.5%
```

---

## 🍏 2. Animation Héroïque du Logo Officiel Apple

Conformément aux standards de marque, l'ouverture d'une présentation ou publicité produit met en scène le logo Apple en grand format (`220px à 260px`), **seul au centre de l'écran sans texte parasite**, avec une animation de balayage spéculaire.

### Code de Rendu du Balayage Spéculaire (Canvas 2D) :
```javascript
function drawAnimatedHeroAppleLogo(ctx, cx, cy, h = 230, t = 0) {
    ctx.save();
    ctx.translate(cx, cy);

    // 1. Échelle d'entrée et micro-respiration
    const breath = 1 + Math.sin(t * 2.5) * 0.02;
    const s = (h * breath) / 315;
    ctx.scale(s, s);
    ctx.translate(-128, -157.5);

    // 2. Ombre de profondeur luxueuse
    ctx.shadowColor = 'rgba(180, 83, 9, 0.28)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 14;

    // 3. Remplissage graphite titane
    ctx.fillStyle = '#09090b';
    ctx.fill(appleSvgPath);

    // 4. Masquage pour le reflet de lumière (Light Sheen)
    ctx.save();
    ctx.clip(appleSvgPath);

    const sweepProgress = (t * 0.8) % 2.5;
    const sweepX = lerp(-100, 360, sweepProgress / 1.5);

    const sheen = ctx.createLinearGradient(sweepX - 60, 0, sweepX + 60, 315);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(0.4, 'rgba(254, 240, 138, 0.35)'); // Lueur jaune clair néon
    sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)'); // Cœur blanc étincelant
    sheen.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');  // Lueur jaune foncé néon
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheen;
    ctx.fillRect(-100, -50, 460, 420);
    ctx.restore();

    ctx.restore();
}
```

---

## 📱 3. Chorégraphie du Lineup Multi-Appareils (Anti-Statisme)

Pour éviter qu'une scène finale de catalogue ou de lineup ne paraisse statique ou morte :

### A. Entrée Échelonnée (Staggered Entry)
Les 3 finitions ne surgissent pas d'un bloc :
* **Appareil Gauche (ex: Titane Noir)** : Glisse depuis l'extérieur gauche ($x: 450 \rightarrow 610$) avec une légère inclinaison négative (`angle: -0.07`).
* **Appareil Droite (ex: Or Désert)** : Glisse depuis l'extérieur droit ($x: 1470 \rightarrow 1310$) avec une inclinaison positive (`angle: 0.07`).
* **Appareil Centre (ex: Titane Naturel face avant)** : S'élève du bas de l'écran en dernier ($y: 880 \rightarrow 720$) en position héroïque prédominante.

### B. Balayage Lumineux Traversant Continu
Un reflet spéculaire en faisceau oblique traverse l'ensemble des 3 téléphones de gauche à droite toutes les 3 secondes, mettant en valeur les reflets métalliques des bordures en titane.

### C. Parallaxe de Flottement Inverse
L'appareil de gauche et l'appareil de droite oscillent en opposition de phase verticale avec l'appareil central :
```javascript
const floatOffset = Math.sin(sT * 1.8) * 8;
const leftY = targetY + floatOffset * 0.7;
const centerY = targetCenterY + floatOffset;
const rightY = targetY - floatOffset * 0.7;
```

---

## ⚡ 4. Cinématique des Données UI & Giant Stats

### A. Compteurs de Giant Stats Animés
Lors de l'apparition d'un chiffre clé (`-19%`, `3 000 NITS`, `48 MP`), la valeur s'incrémente en direct sur les premières `1.5s` de la scène :
```javascript
const pStat = clamp(sceneTime / 1.8, 0, 1);
const currentVal = Math.round(lerp(initialVal, targetVal, ease.out(pStat)));
// Rendu : currentVal.toLocaleString('fr-FR')
```

### B. Barres de Benchmark Progressives
Les jauges de silicium (CPU, GPU, NPU) se remplissent avec un décalage temporel échelonné (*stagger*) de `0.6s` à `0.8s` entre chaque cœur :
* $t_0$ : La barre CPU commence à grandir.
* $t_0 + 0.7s$ : La barre GPU se déploie.
* $t_0 + 1.4s$ : La jauge Neural Engine atteint sa vitesse maximale avec une lueur à son extrémité.

### C. L'Orbe Apple Intelligence (Trigonométrie Fluide)
Le ruban Siri / IA ne tourne pas bêtement sur un cercle rigide : il se compose de 60 points trigonométriques dont le rayon oscille sous 4 harmoniques superposées :
```javascript
for (let i = 0; i <= 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const r = 200 + Math.sin(angle * 3 + time * 3.5 + colorIndex) * 32;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
}
```

---

## 🔊 5. Règle Universelle 30 : Fondu de Sortie (Vidéo & Musique)

> [!IMPORTANT]
> **Règle absolue sur toutes les compositions vidéo** :
> Aucune vidéo ne doit se terminer par un arrêt brutal ou une coupure sèche de l'image ou du son.

### A. Fondu Vidéo (Outro Fade)
* Sur les **2.5 à 3.0 dernières secondes** de la vidéo :
  * Mode Sombre : Fondu vers le noir absolu (`rgba(0, 0, 0, alpha)`).
  * Mode Studio Clair : Fondu vers le blanc pur (`rgba(255, 255, 255, alpha)`).
  * `alpha = clamp((time - (DURATION - fadeTime)) / fadeTime, 0, 1)`.

### B. Fondu Audio Musical (BGM Fade-Out)
* La piste musicale de fond (`audioBgm`) doit obligatoirement voir son volume descendre progressivement jusqu'à 0 sur les 4 dernières secondes :
```javascript
let masterBgmVol = 0.35; // Volume standard
if (playbackTime >= DURATION - 4.0) {
    masterBgmVol = 0.35 * clamp((DURATION - playbackTime) / 4.0, 0, 1);
}
audioBgm.volume = masterBgmVol;
```

