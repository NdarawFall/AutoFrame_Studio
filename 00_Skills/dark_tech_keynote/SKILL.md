---
name: dark_tech_keynote
description: Style keynote technologique haut de gamme (Apple Keynote, Linear, Stripe, Vercel). Fond noir abyssal, grille perspective 3D au sol, cartes d'interface avec bordures biseautées et reflets néon rasants, typographie ultra-nette et animations calées au milliseconde.
---

# Skill : Dark Tech Keynote (Keynote Tech Sombre & UI Élégante)

Ce skill formalise la création de vidéos de présentation logicielle haut de gamme, où **l'interface et les cartes de données deviennent les véritables héroïnes de la scène**, sur un fond sombre baigné de lumières rasantes.

---

## 🎯 1. Principes Fondamentaux du Style Dark Keynote

* **L'interface est le sujet héroïque** :
  * Pas de captures d'écran plates : chaque carte, fenêtre, graphique ou badge est un composant vectoriel autonome stylisé avec une profondeur 2.5D.
  * Angles légèrement arrondis (`border-radius: 12px à 20px`), bordures ultra-fines de 1 px avec reflets dégradés (liseré lumineux supérieur).
* **Rigueur de la Grille & Easing Snappy** :
  * Chaque élément s'aligne rigoureusement sur une grille modulaire (pas de positionnement approximatif).
  * Animations "snappy" : départ instantané avec un léger dépassement contrôlé (`back.out(1.4)` ou `cubic-bezier(0.16, 1, 0.3, 1)`), amortissement immédiat sans oscillation molle.
* **Le Chiffre Géant Isolé (Giant Stat)** :
  * Lorsqu'une statistique clé est annoncée, elle occupe l'écran à elle seule en typographie condensée massive (`Inter Tight` ou `SF Pro Display`, tracking serré).

---

## 🎨 2. Palette & Éclairage de Studio Tech

* **Fond Noir Profond & Grille 3D** :
  * Base sombre : `#090a0f` ou `#040405` avec un halo radial très discret au centre supérieur (`rgba(255, 255, 255, 0.04)`).
  * Grille filaire de perspective au sol (lignes d'1 px, opacité 4% à 8%) s'étendant vers l'horizon.
* **Surfaces des Cartes & Verre Fumé** :
  * Surface : fond noir translucide (`rgba(20, 24, 33, 0.7)`), flou d'arrière-plan (`backdrop-filter: blur(20px)`).
  * Bordure : liseré supérieur blanc rasant (`rgba(255, 255, 255, 0.18)`), côtés plus sombres (`rgba(255, 255, 255, 0.05)`).
* **Un Seul Accent de Marque Fort** :
  * Un accent éclatant réservé à l'action principale et aux indicateurs de succès :
    * Vert Lime futuriste : `#b7f34a`
    * Cyan Électrique : `#00f2fe`
    * Violet / Indigo : `#8b7cff`
    * Orange Signal : `#ff7a1a`

---

## 🎥 3. Grammaire de Caméra & Transitions

| Mouvement | Intention Narrative | Utilisation |
| :--- | :--- | :--- |
| **Gros plan verrouillé sur une action** | Précision d'une fonctionnalité unique | Clic, toggle d'un bouton ou badge validé |
| **Recul dynamique sur le beat** | Révélation d'un écosystème ou d'un dashboard complet | Déploiement multi-cartes ou synchronisation |
| **Balayage lumineux rasant (Light sweep)** | Présentation d'un produit neuf ou d'une carte clé | Reflet oblique illuminant le biseau de la carte |
| **Transition par expansion d'UI** | Fluidité sans coupure ni fondu noir | Une carte s'agrandit pour devenir le décor suivant |

---

## 💻 4. Structure CSS / HTML de Carte Keynote

```html
<div class="keynote-card">
    <div class="card-glow"></div>
    <div class="card-header">
        <span class="card-badge">STATUS // ACTIF</span>
        <span class="card-counter">99.98%</span>
    </div>
    <h3 class="card-title">Traitement Temps Réel</h3>
</div>

<style>
.keynote-card {
    position: relative;
    width: 380px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(25, 28, 38, 0.85) 0%, rgba(11, 13, 18, 0.95) 100%);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.22); /* Biseau supérieur lumineux */
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.05);
    backdrop-filter: blur(16px);
    transform-style: preserve-3d;
}

.card-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #00f2fe;
    letter-spacing: 0.08em;
}

.card-title {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin-top: 12px;
}
</style>
```

---

## 🔊 5. Sound Design Associé
* **Bruitages de surface feutrés** : taps feutrés en bois doux, clics légers de trackpad (`click`), et son de verre feutré (`ding`).
* **Balayages lumineux** : shimmer aérien très fin lors du passage des reflets.
* **Basses précises** : impact de sub-bass très court et sec lors de l'apparition des chiffres majeurs.

