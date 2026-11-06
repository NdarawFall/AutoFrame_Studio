---
name: scifi_hologram_hud
description: Interface holographique futuriste (HUD de science-fiction, Iron Man / Avengers / Oblivion). Réticules de visée 3D, télémétrie cyan et ambre, anneaux de rotation, scanners volumétriques et callouts dynamiques.
---

# Skill : Sci-Fi Hologram HUD (Interface Holographique & Télémétrie 3D)

Ce skill formalise la création d'interfaces holographiques et de HUDs (Heads-Up Displays) futuristes où **chaque donnée, objet ou composant est matérialisé par des lignes lumineuses cyan flottant dans l'espace**.

---

## 🎯 1. Principes Fondamentaux du HUD Holographique

* **Le sujet est fait de lumière pure (Wireframe volumétrique)** :
  * L'objet visualisé n'est pas une surface opaque avec des textures classiques : c'est un réseau de lignes lumineuses additives tracées en perspective 3D au-dessus d'un socle circulaire de projection.
  * Deux à trois niveaux de profondeur sont toujours perceptibles :
    1. La grille de points lointaine (parallaxe lente).
    2. Le sujet holographique central et son socle gyroscopique.
    3. Les éléments de premier plan (crochets de coin, règles graduées et réticules de ciblage).
* **Verrouillage de Cible (Target Lock)** :
  * Une boîte de ciblage pivotée à 45° rétrécit et s'aligne brusquement sur le composant visé en 0.2s (`power2.out`).
  * Un flash blanc pur de 2 à 3 frames marque l'instant exact du verrouillage sur le beat.
* **Défilement des Données (Rolling Numbers)** :
  * Les valeurs chiffrées ne s'affichent pas fixement : elles défilent frénétiquement en caractères aléatoires avant de se stabiliser sur le chiffre exact, qui passe alors en couleur d'accentuation.

---

## 🎨 2. Palette & Télémétrie Spatiale

* **Fond** : nuit sidérale / noir bleuté profond (`#030712` ou `#050814`).
* **Couleur Principale du Faisceau Holographique** :
  * Cyan / Bleu électrique : `#00f0ff` (ou vert menthe `#00ffcc`).
  * Lueur additive : intensité lumineuse renforcée aux intersections de lignes.
* **Couleur d'Accent Unique (Verrouillage)** :
  * Orange chaud ou Ambre `#ff9f1c` : réservé **exclusivement** aux données validées, aux coordonnées finales ou aux alertes de trajectoire.
* **Typographie** :
  * Police futuriste angulaire en majuscules : `Rajdhani` ou `Orbitron` pour les titres et grands indicateurs.
  * Police technique pour la télémétrie : `Share Tech Mono` ou `JetBrains Mono` pour les coordonnées spatiales et logs.

---

## 🎥 3. Grammaire de Caméra & Mouvements

| Mouvement | Intention Narrative | Utilisation |
| :--- | :--- | :--- |
| **Orbite 3/4 plongeante avec rotation du socle** | Examen d'un objet en lévitation sous tous les angles | Scan initial d'une structure ou drone |
| **Coup de fouet (Whip) vers une nouvelle cible** | Déplacement rapide du point focal de l'analyse | Transition d'un composant A vers un composant B |
| **Loupe / Iris holographique incrusté** | Zoom haute résolution sur un détail microscopique | Analyse d'un composant miniature sans quitter la vue large |
| **Balayage d'onde de scan (Laser plane)** | Numérisation ou matérialisation de l'objet | Arrivée ou disparition de l'hologramme |

---

## 💻 4. Réticule et Anneaux Gyroscopiques (SVG / Canvas)

```html
<svg viewBox="0 0 400 400" class="hud-reticle">
    <!-- Anneau extérieur pointillé -->
    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1.5" stroke-dasharray="6 8" class="spin-slow"/>
    
    <!-- Anneau intermédiaire avec encoches -->
    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0, 240, 255, 0.6)" stroke-width="2" stroke-dasharray="80 30 20 30" class="spin-reverse"/>
    
    <!-- Crochets de visée centraux -->
    <g stroke="#00f0ff" stroke-width="2" fill="none">
        <path d="M 170 170 L 180 170 M 170 170 L 170 180"/>
        <path d="M 230 170 L 220 170 M 230 170 L 230 180"/>
        <path d="M 170 230 L 180 230 M 170 230 L 170 220"/>
        <path d="M 230 230 L 220 230 M 230 230 L 230 220"/>
    </g>
    
    <!-- Télémétrie -->
    <text x="210" y="195" fill="#ff9f1c" font-family="'JetBrains Mono', monospace" font-size="11">TARGET_LOCKED // 94.2%</text>
</svg>

<style>
.hud-reticle {
    width: 340px;
    height: 340px;
    filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));
}
.spin-slow {
    transform-origin: 200px 200px;
    animation: spin 18s linear infinite;
}
.spin-reverse {
    transform-origin: 200px 200px;
    animation: spin-back 12s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-back { 100% { transform: rotate(-360deg); } }
</style>
```

---

## 🔊 5. Sound Design Associé
* **Télémétrie spatiale** : bips électroniques ultra-aigus et résonants (`quindar`, bips NASA).
* **Ciblage & Verrouillage** : sweep montant rapide suivi d'un double clic sec lors du verrouillage de la boîte.
* **Balayage d'ondes** : bourdonnement basse fréquence montant (`hum` / `ignite`) lors de la matérialisation du faisceau.

