---
name: design_composition
description: Psychologie et règles de composition vidéo pour VibeEditor — zones sûres 16:9/9:16/1:1, placement des textes et sous-titres, hiérarchie typographique, couleurs 60/30/10, split screens, couches de profondeur, point focal, lisibilité mobile, avec CSS responsive par format et pièges SVG/vidéo en rendu headless.
---

# DESIGN & COMPOSITION — VibeEditor

## 1. Principe central
Une scène = **une idée = un point focal = une hiérarchie à 3 niveaux**. Si le spectateur doit choisir où regarder, la scène est ratée. Le spectateur regarde sur un téléphone, parfois en plein soleil, souvent sans le son : la lisibilité prime sur l'esthétique.

Ordre d'attraction de l'œil (du plus fort au plus faible) : mouvement > visage/regard > contraste de luminosité > couleur saturée > grande taille > position haut-gauche. Ne mettre en mouvement QUE ce qui doit être lu.

## 2. Canvas, unité et zones sûres
Le canvas est fixe en pixels (jamais `vh/vw`, jamais `position:fixed`). On définit une unité `--u` = 1 % du petit côté (1080 px) : les tailles en `u` restent cohérentes entre formats.

```css
html[data-format="16x9"]{--W:1920px;--H:1080px;--u:10.8px;
  --safe-t:calc(var(--u)*5);--safe-b:calc(var(--u)*6);--safe-l:calc(var(--u)*9);--safe-r:calc(var(--u)*9);
  --title:calc(var(--u)*8);--sub:calc(var(--u)*5);--min:calc(var(--u)*2.8)}
html[data-format="9x16"]{--W:1080px;--H:1920px;--u:10.8px;
  --safe-t:calc(var(--u)*20);--safe-b:calc(var(--u)*40);--safe-l:calc(var(--u)*6);--safe-r:calc(var(--u)*13);
  --title:calc(var(--u)*9);--sub:calc(var(--u)*6.5);--min:calc(var(--u)*3.4)}
html[data-format="1x1"]{--W:1080px;--H:1080px;--u:10.8px;
  --safe-t:calc(var(--u)*6);--safe-b:calc(var(--u)*8);--safe-l:calc(var(--u)*7);--safe-r:calc(var(--u)*7);
  --title:calc(var(--u)*8);--sub:calc(var(--u)*5.5);--min:calc(var(--u)*3)}
html,body{margin:0;width:var(--W);height:var(--H);overflow:hidden;background:#000}
#stage{position:relative;width:var(--W);height:var(--H);overflow:hidden;background:var(--bg)}
.layer{position:absolute;inset:0}
.safe{position:absolute;top:var(--safe-t);bottom:var(--safe-b);left:var(--safe-l);right:var(--safe-r)}
```
**9:16** : les 20 % du haut (nom de compte, recherche) et les 22 % du bas (légende, boutons, barre) sont occupés par l'interface ; la colonne de droite (13 u ≈ 140 px) porte like/commentaire/partage. Rien d'important là.
**16:9** : respecter 5 % de marge (action safe) ; les sous-titres ne descendent jamais sous `--safe-b`.

## 3. Hiérarchie typographique
- **Niveau 1** : titre / mot-choc — `--title`, graisse 800–900, 1–6 mots.
- **Niveau 2** : sous-titre / info clé — `--sub`, graisse 600–700.
- **Niveau 3** : légende, source, date — jamais sous `--min` (illisible sur mobile).
- Ratio entre niveaux ≥ 1.5. Deux familles maximum (1 display + 1 texte). Interlignage titres 1.0–1.1, texte 1.25–1.4.
- Longueur de ligne : 9:16 → 18–26 caractères ; 16:9 → 32–42. 2 lignes maximum pour les sous-titres.
- Alignement : centré pour le hook et les mots-chocs ; aligné à gauche pour tout texte de lecture (listes, définitions).
- Contraste texte/fond ≥ 4.5:1 (≥ 7:1 pour les petites tailles). Texte sur image → toujours un scrim ou un contour, jamais « nu ».
```css
.scrim-b{background:linear-gradient(to top,rgba(0,0,0,.7),rgba(0,0,0,0) 55%)}
.t-stroke{-webkit-text-stroke:calc(var(--u)*.6) #000;paint-order:stroke fill}
.t-box{background:rgba(0,0,0,.55);border-radius:calc(var(--u)*1.4);padding:calc(var(--u)*.5) calc(var(--u)*1.4)}
```

## 4. Position des sous-titres
| Format | Zone | Détail |
|---|---|---|
| 9:16 | centre-bas, à ~60–66 % de la hauteur | au-dessus de la zone UI du bas, sous le visage du sujet. `top:60%` dans `.safe` |
| 16:9 | bas, ~10 u au-dessus du bord | `bottom:calc(var(--safe-b) + var(--u)*3)` |
| Si le sujet occupe cette zone | remonter à 50 % (9:16) ou passer en haut (16:9) | ne jamais couvrir une bouche ou un chiffre clé |
Un seul système de texte « parlé » à l'écran à la fois : si un titre apparaît, les sous-titres se déplacent ou se coupent.

## 5. Couleur
- **60 / 30 / 10** : 60 % neutre (fond), 30 % secondaire (cartes, surfaces), 10 % accent (mots-clés, chiffres, soulignements).
- Fond sombre : `#0B0B0F` ou `#101114`, pas du noir pur ; texte `#F5F5F7`, pas du blanc pur (fatigue + halos).
- UNE couleur d'accent par vidéo. Sémantique : rouge = danger/perte/urgence, vert = gain/validation, jaune/orange = attention, bleu = confiance/tech, violet = premium/IA.
- Chaînes finance : vert/or sur sombre. Docu : désaturé + 1 accent chaud. Tech/IA : sombre + néon cyan/violet. Shorts viraux : jaune vif + noir + blanc, saturation haute.
- Reproduire les couleurs de marque via `brandfetch.cjs` pour toute scène qui parle d'une entreprise.
- Contrer le soleil / les petits écrans : contraste franc, pas de gris sur gris, pas de fines polices claires.

## 6. Composition d'une scène : les 5 couches
1. `bg` — fond (dégradé, vidéo B-roll, carte). Toujours en lent mouvement (`scale 1→1.06–1.10` sur la durée de la scène, ease `none`).
2. `mid` — sujet / média principal (image détourée, capture web, logo, drapeau).
3. `fg` — éléments de profondeur (particules, formes floues, bords) — très discrets.
4. `ui` — texte, cartes, badges.
5. `fx` — vignette, grain, lueur, aberration (dernière couche, `pointer-events:none`).

Règles :
- Règle des tiers pour le sujet ; le regard du sujet regarde vers l'intérieur du cadre, le texte se place du côté qu'il regarde.
- Un visage : yeux sur la ligne du tiers supérieur, texte jamais sur le visage.
- Marges vides (≥ 8 u) : l'espace négatif est un outil, pas un manque.
- Proximité (Gestalt) : un chiffre et son unité sont collés ; un titre et sa source ne le sont pas.
- Une image fixe n'existe pas : toujours un Ken Burns (scale + pan 3–6 %).
- Profondeur : bg légèrement flou/sombre, sujet net, texte au-dessus. Parallax : fond ×0.6 de la vitesse du sujet.
- Vignette `radial-gradient(transparent 55%, rgba(0,0,0,.45))` + grain très léger (PNG tuilé, opacité .05–.08) pour unifier les sources hétérogènes (stock + captures + logos).

```html
<div id="stage" data-scene="s03">
  <div class="layer bg"><video src="…" muted playsinline></video></div>
  <div class="layer scrim-b"></div>
  <div class="layer mid"></div>
  <div class="layer safe ui"><h1 class="t t1"></h1><p class="t t2"></p></div>
  <div class="layer fx vignette"></div>
</div>
```
```js
// mouvement de fond permanent (jamais de plan statique)
tl.fromTo('.bg',{scale:1},{scale:1.08,duration:sceneDur,ease:'none',transformOrigin:'50% 40%'},t0);
```

## 7. Split screens
| Besoin | Layout | Ratio |
|---|---|---|
| Comparer A vs B | 50/50 + badge VS | 1:1 |
| Sujet + preuve | 60/40 (preuve = plus petit) | 3:2 |
| Réaction / commentaire | média 70 % + PIP 30 % en coin | 7:3 |
| Avant/après | 1 cadre + wipe vertical animé | — |
| Liste de 3 choix | triptyque | 1:1:1 |
- 16:9 → colonnes ; **9:16 → lignes** (haut/bas). Le panneau principal en haut.
- Gouttière 1.2 u, coins arrondis 2.2 u, chaque panneau avec son propre scrim et son label (1–2 mots, haut-gauche).
- Entrée : panneaux en `clipPath` (`inset(0 100% 0 0)` → `inset(0)`) décalés de 0.12 s ; le badge VS arrive en dernier avec un `slam`.
```css
.split{position:absolute;inset:var(--safe-t) var(--safe-r) var(--safe-b) var(--safe-l);display:grid;gap:calc(var(--u)*1.2)}
html[data-format="16x9"] .split{grid-template-columns:1fr 1fr}
html[data-format="9x16"] .split{grid-template-rows:1fr 1fr}
.panel{position:relative;overflow:hidden;border-radius:calc(var(--u)*2.2)}
.panel>.media{position:absolute;inset:0;object-fit:cover;width:100%;height:100%}
.vs{position:absolute;left:50%;top:50%;translate:-50% -50%;font:900 calc(var(--u)*6)/1 var(--display);
    background:var(--accent);color:#000;border-radius:50%;width:calc(var(--u)*11);height:calc(var(--u)*11);display:grid;place-items:center}
```
```js
tl.fromTo('.panel',{clipPath:'inset(0 100% 0 0 round 24px)'},{clipPath:'inset(0 0% 0 0 round 24px)',duration:.6,stagger:.12,ease:'expo.out'},t)
  .fromTo('.vs',{scale:0},{scale:1,duration:.35,ease:'back.out(2.2)'},t+.45);
```

## 8. Composition par type de scène
- **Hook (0–3 s)** : plein cadre, 1 mot-choc géant au centre-haut (9:16 : à 35 % de hauteur), mouvement immédiat, contraste maximal, zéro décor.
- **Chiffre** : le nombre à 2× la taille de tout le reste, unité plus petite alignée sur la ligne de base, label niveau 3 dessous, fond sobre.
- **Citation / preuve** : capture de l'article (`record_web.cjs`) à 85 % de la largeur, ombre portée, mot clé surligné avec `highlight`.
- **Lieu** : carte (`fetch_map.cjs`) avec zoom progressif, drapeau (`fetch_flag.cjs`) dans le coin, nom du lieu en niveau 1.
- **Entreprise** : logo vectoriel (`brandfetch.cjs`) centré sur fond de sa couleur de marque assombrie.
- **Personne** : image détourée (`remove_bg.cjs`) à gauche/droite, nom + rôle en niveau 2/3 de l'autre côté.
- **Liste** : 3 items max à l'écran, révélés un par un, l'item courant à 100 % et les autres à 45 %.
- **Fin / CTA** : texte court, un seul bouton visuel, rien dans la zone UI du bas.

## 9. Pièges techniques → parades
| Piège | Parade |
|---|---|
| `getBBox()` = 0 ou NaN → division par zéro | Ne jamais mesurer un élément `display:none` ; utiliser `visibility:hidden` + opacité, ou `pathLength="1"` pour les tracés |
| Rotation SVG autour de (0,0) | `transformBox:'fill-box'; transformOrigin:'50% 50%'` ou `svgOrigin:'x y'` |
| Texte qui déborde (titres longs, 9:16) | `fitText` ci-dessous, puis couper à 2 lignes |
| Vidéos B-roll désynchronisées en rendu | Piloter `video.currentTime` depuis la timeline (`onUpdate`) et attendre `seeked` ; `muted playsinline preload="auto"` ; l'audio vient du mixage FFmpeg, jamais de la balise |
| `object-fit` oublié → étirement | `object-fit:cover` partout sauf logos (`contain`) |
| Images énormes → rendu lent | `sharp` : max 2× la taille d'affichage, WebP/PNG |
| `backdrop-filter` en grand → lent | Limiter à 1–2 éléments ; sinon fond semi-opaque |
| Unités `vh/vw` ou `100%` de la fenêtre | Le canvas est fixe : tailles en `u` |
| Police absente au rendu | Inclure les polices en local (`@font-face`, fichiers dans `01_Assets`), `await document.fonts.ready` |
| Ombres/halos coupés | `overflow:visible` sur le parent animé ou marge interne |
```js
function fitText(el,maxW,maxH,{min=24,max=400}={}){
  let lo=min,hi=max; while(hi-lo>1){const m=(lo+hi)>>1; el.style.fontSize=m+'px';
    (el.scrollWidth<=maxW&&el.scrollHeight<=maxH)?lo=m:hi=m}
  el.style.fontSize=lo+'px';
}
```
(à appeler APRÈS `document.fonts.ready`, avant la construction de la timeline).

## 10. Psychologie : règles de décision
- **Contraste d'échelle** : l'important est 2–3× plus grand que le reste. Si tout est gros, rien n'est gros.
- **Rythme visuel** : ne jamais répéter le même layout 3 fois d'affilée (alterner plein cadre → split → carte → texte).
- **Densité** : > 12 mots à l'écran hors sous-titres = trop. Couper ou séparer en deux scènes.
- **Direction** : mouvement de gauche à droite = progression/futur ; droite à gauche = retour/passé ; montée = gain ; descente = perte. Aligner le mouvement avec le sens du récit.
- **Anticipation** : un léger mouvement inverse (3–5 %) avant tout mouvement important rend l'animation « physique ».
- **Cohérence** : mêmes marges, mêmes rayons, mêmes ombres, même accent dans toute la vidéo ; définir des variables CSS (`--accent`, `--bg`, `--ink`, `--radius`, `--display`) en tête de page.
- **Moins, mais mieux** : retirer un élément à chaque scène avant de valider.

## 11. Court vs long
| | Short 9:16 | Long 16:9 |
|---|---|---|
| Textes | gros, 1–4 mots, centrés | plus petits, hiérarchie riche |
| Sous-titres | permanents, karaoké, 2–3 mots | optionnels ou 2 lignes |
| Densité | 1 info / 1.5–3 s | 1 info / 4–8 s |
| Fond | saturé, mouvement fort | plus sobre, profondeur |
| Cadrage | sujet centré, plein cadre | règle des tiers, plus d'air |

## 12. Checklist avant rendu
- [ ] `data-format` posé sur `<html>` et variables `--u` utilisées partout.
- [ ] Rien d'important dans les zones UI (haut 20 %, bas 22 %, droite 13 u en 9:16).
- [ ] Un point focal par scène, niveau 1 ≥ 2× le niveau 3.
- [ ] Contraste vérifié (scrim/contour sur toute image).
- [ ] Aucun plan statique (zoom/pan permanent).
- [ ] Polices locales chargées, `fitText` appliqué aux titres variables.
- [ ] Aucun layout identique 3 fois de suite.
- [ ] Grilles de cartes (3 cards) rigoureusement centrées (`margin: 0 auto; justify-content: center;`).
- [ ] Pas de slide/fondu répétitif : transitions alternées (3D tilt, masked wipe, blur snap, radial wipe).
- [ ] Tracés de courbes avec curseur synchronisé sub-pixel via `path.getPointAtLength()` (zéro saut de point).
