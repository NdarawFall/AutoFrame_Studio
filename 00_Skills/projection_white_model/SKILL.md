---
name: projection_white_model
description: Rendu de maquette architecturale blanche (white clay model) avec projection lumineuse dynamique, vidéo-mapping de données, occlusion ambiante douce et éclairage zénithal. Parfait pour les études urbaines, l'immobilier, les flux de données et la géographie.
---

# Skill : Projection on White Model (Maquette Blanche & Projection Lumineuse)

Ce skill formalise la création de rendus visuels de type **maquette architecturale en plâtre blanc immaculé**, éclairée dans une pièce sombre, sur laquelle un projecteur vient peindre des flux de données, des zones de chaleur ou des lignes de force.

---

## 🎯 1. Principes Fondamentaux de la Maquette Blanche

* **La matière est blanche, la donnée est lumière** :
  * Les bâtiments et volumes sont constitués d'un matériau mat pur (craie / plâtre : `#f3f3f1`, rugosité $\approx 0.9$).
  * Aucune texture peinte ou couleur n'est fixée sur les objets : la couleur provient **exclusivement du faisceau lumineux projeté**.
  * Les surfaces faisant face au projecteur s'illuminent vivement ; les faces cachées restent dans une ombre douce et bleutée.
* **Arrivée progressive des couches de données (Layers)** :
  * Les données n'apparaissent pas toutes en même temps : chaque couche répond à une question précise (ex: dates de construction, densités, hauteurs, zones inondables, ensoleillement réel).
  * Gestuelle lumineuse douce : balayage lumineux doux, allumage en cascade des bâtiments, ou niveau d'eau/lumière qui monte sur les façades.

---

## 🎨 2. Palette & Éclairage

* **Environnement** :
  * Pièce sombre neutre (`#0a0a0c`).
  * Socle (plinth) noir satiné sur lequel repose la dalle de la maquette.
  * Eau / cours d'eau : incrustation satinée plus sombre sur la dalle de base.
* **Palette Lumineuse de Projection** :
  * **Une seule famille de teinte par couche** :
    * Évolution chronologique : bleu froid $\rightarrow$ cyan $\rightarrow$ blanc.
    * Données d'élévation ou de densité : violet $\rightarrow$ magenta $\rightarrow$ ambre chaleureux.
    * Exceptions / alertes : ambre unique (`#f59e0b`) ou rouge corail (`#ef4444`).
* **Ombres & Soleil Réel** :
  * Le soleil est une lumière directionnelle projetant des ombres portées nettes et calculées selon des angles réalistes (azimut et élévation).

---

## 🎥 3. Grammaire de Caméra

| Mouvement | Intention Narrative | Cas d'Usage |
| :--- | :--- | :--- |
| **Glissé macro rasant (Rooftop height)** | Rappelle la matérialité physique de la maquette | Découverte d'un quartier ou détail clé |
| **Grue ascendante vers vue zénithale** | Révélation d'un motif ou d'une frontière globale | Révélation d'une carte ou tracé d'ensemble |
| **Orbite lente ascendante** | Suivi de l'accumulation des données dans le temps | Évolution urbaine ou comparaison globale |
| **Recul progressif avec retour de la lumière ambiante** | Fin de la démonstration, retour à l'objet brut | Clôture de la séquence |

---

## 💻 4. Implémentation Shader / Three.js

```glsl
// Shader de projection lumineuse sur matériau blanc
uniform vec3 uProjectorPos;
uniform vec3 uDataColor;
uniform float uProjectionIntensity;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    // Éclairage studio neutre de base sur plâtre blanc
    vec3 basePlaster = vec3(0.95, 0.95, 0.94);
    
    // Calcul de l'incidence du projecteur
    vec3 toProjector = normalize(uProjectorPos - vWorldPosition);
    float NdotL = max(dot(vNormal, toProjector), 0.0);
    
    // Rendu du faisceau projeté : plus intense sur les surfaces perpendiculaires
    vec3 projectionTerm = uDataColor * (0.42 + 0.58 * NdotL) * uProjectionIntensity;
    
    // Couleur finale
    vec3 finalColor = basePlaster * 0.2 + projectionTerm;
    gl_FragColor = vec4(finalColor, 1.0);
}
```

---

## 🔊 5. Sound Design Associé
* **Ambiance de pièce feutrée** : léger souffle de projecteur et ventilation douce en fond sonore.
* **Allumage des données** : percussions de verre ou de maillets légers (`ding` ou vibraphone doux) lorsque les bâtiments s'illuminent un par un.
* **Montée de données** : riser d'air filtré lorsque la lumière grimpe le long des façades.

