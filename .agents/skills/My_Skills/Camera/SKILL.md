---
name: Camera
description: Mouvements de caméra cinématographiques, transitions de scènes et navigation 3D Three.js en GSAP seek-safe (slow push-in, crash zoom, whip pan, pull-back, dolly parallaxe 3D, camera shake d'impact, orbital 3D, vertigo effect).
---

# CAMERA & DYNAMIC MOVEMENTS — VibeEditor

Ce skill est divisé en **deux guides spécialisés** :

1. 👉 **Transitions 2D & Mouvements dans la Scène : [`camera_transition.md`](./camera_transition.md)**
   - Explique en détail **quand zoomer** (slow push-in, crash zoom, macro focus), **quand dézoomer** (pull-back, respiration), **quand glisser/pan** et **quand déclencher une transition**.
   - Contient le catalogue des **5 grands types de transitions** : Whip Pan cinétique, Zoom-Through Portal, Directional Slide masqué, Flash Cut d'impact et Cut Franc.

2. 👉 **Navigation & Espace 3D Three.js : [`camera_3D.md`](./camera_3D.md)**
   - Explique tout ce qui concerne les **scènes Three.js / WebGL**, les coordonnées spatiales ($X, Y, Z$), les angles d'Euler et la perspective.
   - Contient les **6 mouvements majeurs de caméra 3D** : Travelling orbital 360°, Dolly In avec profondeur, Effet Vertigo (Dolly Zoom), Dutch Angle roulis, Fly-Through de traversée et Shake 3D déterministe.
   - Intègre les règles d'éclairage studio daylight synchronisé et le respect strict des 4 fonds autorisés.

---

## 📐 Règle d'Or Technique (Seek-Safety & Déterminisme)

Tout mouvement de caméra (2D ou 3D) doit impérativement être piloté par la **timeline maîtresse GSAP (`tl`)** :
- **Interdiction formelle** de `requestAnimationFrame` autonome, de `setTimeout` ou d'oscillateurs aléatoires `Math.random()`.
- Les caméras doivent être prédictives et réversibles pour garantir un scrubbing parfait dans le Studio et un rendu frame-by-frame exact sous Puppeteer (`render.cjs`).
