---
name: ascii_crt_terminal
description: Style terminal informatique rétro des années 1970-1980. Grille de caractères ASCII pure, phosphore ambre P3 ou vert P1, balayage de scanlines CRT, courbure de verre bombé (barrel distortion) et écriture au curseur clignotant.
---

# Skill : ASCII / CRT Terminal (Moniteur Rétro & Grille de Glyphes)

Ce skill formalise la création d'animations et de visualisations entièrement composées de **caractères typographiques monospace sur grille**, reproduisant fidèlement l'esthétique et la physique d'un écran cathodique monochrome des années 1980.

---

## 🎯 1. Principes Fondamentaux du Terminal ASCII / CRT

* **Vraie grille de caractères (Pas de faux filtre flou)** :
  * Chaque image, titre, visage ou schéma est construit avec de **vrais caractères Unicode/ASCII** (`.`, `:`, `*`, `#`, `@`, `%`, `█`) choisis selon leur densité d'encre réelle.
  * Les caractères s'alignent rigoureusement sur une grille stricte (ratio 1:2, police bitmap monospace type `VT323` ou `JetBrains Mono`).
* **L'espace négatif fait la lisibilité** :
  * Ne pas remplir tout l'écran : les zones sombres restent vides ou ponctuées d'un simple point discret (`.`).
* **Physique de l'Écran CRT monochrome** :
  * **Courbure du verre (Barrel distortion)** : les bords de l'écran sont légèrement bombés vers l'extérieur.
  * **Lignes de balayage (Scanlines)** : lignes horizontales régulières, plus nettes dans les zones lumineuses.
  * **Persistance du phosphore (Afterglow)** : rémanence lumineuse de 0.1s lorsque les caractères disparaissent ou défilent.
  * **Pas de grille RVB** : les tubes monochromes (ambre ou vert) n'ont pas de triolets rouge/vert/bleu, la lumière est continue.

---

## 🎨 2. Palette & Phosphores Électroniques

* **Fond** : verre noir chaud non excité (`#0a0806` pour l'ambre, `#040a06` pour le vert).
* **Phosphore Ambre (Type P3)** :
  * Faible intensité : orange cuivré sombre `#7a3500`.
  * Intensité standard : ambre éclatant `#ff9f1c` ou `#ffb000`.
  * Surtension (points chauds) : jaune-blanc éblouissant `#fff3d1`.
* **Phosphore Vert (Type P1)** :
  * Vert terminal classique `#22c55e` à `#39ff14`.
* **Règle absolue** : un seul phosphore dominant par séquence. Si une seconde couleur apparaît (ex: bleu cyan ou rouge d'alerte), c'est un événement rare et narratif.

---

## 🎥 3. Grammaire de Caméra & Mouvements

Dans un terminal CRT, la caméra principale **est la taille de la grille** :

| Mouvement | Technique | Effet Produit |
| :--- | :--- | :--- |
| **Terminal fixe 80 colonnes** | Défilement texte ligne par ligne | Attente clinique, procédure système |
| **Zoom avant (Push in)** | La police s'agrandit, la grille grossit | Intimité dramatique sur une seule ligne ou un mot |
| **Dézoom (Pull out)** | Les caractères rétrécissent, devenant une image | Passage d'un texte à une carte ou silhouette |
| **Degauss / Flash d'allumage** | Déformation magnétique brutale et retour | Allumage de la machine ou choc narratif |

---

## 💻 4. Rendu de Scanlines & Courbure CRT (Shader GLSL / Canvas)

```glsl
// Shader de distorsion cathodique et balayage de scanlines
uniform sampler2D uScreenTexture;
varying vec2 vUv;

vec2 curveCoordinates(vec2 uv) {
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
    uv = (uv / 2.0) + 0.5;
    return uv;
}

void main() {
    vec2 curvedUv = curveCoordinates(vUv);
    
    // Découpage du masque bombé
    if (curvedUv.x < 0.0 || curvedUv.x > 1.0 || curvedUv.y < 0.0 || curvedUv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    vec4 baseColor = texture2D(uScreenTexture, curvedUv);
    
    // Scanlines horizontales
    float scanline = sin(curvedUv.y * 800.0) * 0.12;
    baseColor.rgb -= scanline;
    
    // Léger bloom / lueur ambre
    vec3 amberGlow = vec3(1.0, 0.65, 0.1) * baseColor.r;
    gl_FragColor = vec4(amberGlow, 1.0);
}
```

---

## 🔊 5. Sound Design Associé
* **Frappe de clavier mécanique lourd** : cliquetis plastique et rebond de ressort métallique (`click`, `clack`).
* **Bips système** : onde carrée pure 1000 Hz courte (`beep` / `quindar`).
* **Ambiance électronique** : ronronnement doux du ventilateur, transitoire de relais à l'allumage et sifflement subtil du transformateur très haute fréquence.

