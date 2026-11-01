---
name: text_animation
description: Animations de texte premium en GSAP seek-safe (reveal masqué, cascade, slam kinétique, typewriter, scramble, highlight, soulignement SVG, compteur, glitch, flip 3D, sous-titres karaoké) avec règles de timing, easing, lisibilité et pièges de rendu headless.
---

# TEXT ANIMATION — VibeEditor

## 0. Contrat technique (non négociable)
Le rendu est frame par frame (Puppeteer). Toute animation DOIT être une fonction pure du temps de la timeline.

- Tout vit dans UNE timeline maître en pause : `window.__tl = gsap.timeline({ paused: true })`. (Adapter le nom si `render.cjs` en utilise un autre.)
- Interdits : `setTimeout`, `setInterval`, `requestAnimationFrame` pour animer, `Math.random()`, `Date.now()`, `repeat: -1`, `onComplete` qui change l'état, CSS `animation`/`transition`.
- Aléatoire → PRNG seedé (`mulberry32`) ou valeurs précalculées.
- `repeat` fini uniquement (calculer le nombre de répétitions : `Math.ceil(dur / cycle)`).
- Chaque fonction ci-dessous : `fn(tl, el, t, opts)` → ajoute à la timeline à la position `t` et **retourne le temps de fin**. On peut donc chaîner : `t = maskReveal(tl, h1, t)`.
- Après construction de la timeline : `await document.fonts.ready` AVANT de découper le texte, puis `tl.seek(tl.duration()).seek(0)` (pré-chauffe) pour que le scrub arrière et le rendu ne dépendent pas de l'ordre de lecture.
- Texte en français : normaliser `text.normalize('NFC')` avant découpe. Arabe / écritures liées : découper par MOTS uniquement, jamais par caractères.

## 1. Règles d'or de timing
| Élément | Valeur |
|---|---|
| Entrée titre | 0.5–0.8 s (long) · 0.3–0.5 s (short) |
| Sortie | 60 % de l'entrée, ease `power2.in`. Aucune sortie si un cut suit : le cut EST la sortie |
| Stagger caractères | 0.02–0.04 s · mots : 0.07–0.12 s |
| Temps de lecture minimum affiché | `max(0.8 s, nbMots × 0.3 s)` après la fin de l'entrée |
| Mots max à l'écran | short : 6 · long : 12 (hors sous-titres) |
| Sous-titres | 2–4 mots/bloc (short) · 6–9 mots, 2 lignes max (long) |
| Texte avant la voix | le texte apparaît 0–0.15 s AVANT le mot prononcé, jamais après |

Easing : entrée = `expo.out` / `power3.out` (premium, net) ; impact = `back.out(1.7)` ; sortie = `power2.in` ; mouvement continu (zoom lent) = `none`. Pas de `bounce` ni `elastic` sauf style fun/TikTok explicitement demandé.

Cohérence : UNE animation « de base » pour tous les titres d'une vidéo + UNE animation « signature » réservée aux moments d'impact (hook, chiffre choc, chute). Jamais plus de 2 familles.

## 2. Quand utiliser quoi

### 🌟 LES ANIMATIONS PAR DÉFAUT (Standards Obligatoires)
| Rôle Typographique | Condition / Structure | Animation Recommandée | Comportement |
|---|---|---|---|
| **Titre Monopoliche (DÉFAUT)** | **1 seule police sur tout le titre** (ex: *"Le Grand Écart Mondial"*) | `titleFadeWordsUp` ou `titleFadeWordsDown` | **Mot par mot** avec fondu vers le haut ou bas. Alignement strict garanti sans briser le layout. |
| **Titre Multipolice** | **Contient un mot dans un autre font** (accent serif / script dual-font) | `titleMultiFontSlide` | **Bloc entier ou ligne par ligne**. ⚠️ **INTERDICTION du mot par mot** pour préserver la baseline ! |
| **Sous-titre (DÉFAUT n°1)** | 1 à 3 lignes descriptives | `subtitleSlideUp` | **Slide vers le haut** du texte entier (ou ligne par ligne avec conteneur masqué si multiligne). |
| **Sous-titre (DÉFAUT n°2)** | Phrase d'accroche / rythme cinétique | `subtitleWordsSlideRightToLeft` | **Mot par mot de droite à gauche** : chaque mot glisse à sa place et s'y fige définitivement. |

### 🎨 Animations d'Impact & Styles Spécialisés
| Intention | Animation |
|---|---|
| Titre de chapitre / sérieux / docu | `maskReveal` |
| Hook / mot-choc / négation | `slam` (+ SFX hit) |
| Mot-clé dans une phrase | `highlight` (1 par phrase max) |
| Chiffre, stat, prix | `counter` |
| Tech / hack / secret / IA | `scramble`, `glitch` |
| Récit, liste, étapes | `charCascade` ou `flip3D` par mots |
| Citation, message, code | `typewriter` |
| Insister sur un nom/lieu | `underline` SVG |
| Voix off continue | `buildSubtitles` (karaoké) |

## 3. Helpers (à inclure une seule fois)
```css
/* Wrappers mot par mot stables (Zéro Layout Shift) */
.w-wrap { display: inline-block; white-space: nowrap; margin-right: 0.28em; }
.w-wrap:last-child { margin-right: 0; }
.w-wrap-mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; margin-right: 0.28em; }
.w-wrap-mask:last-child { margin-right: 0; }
.w-inner { display: inline-block; will-change: transform, opacity; }

/* Conteneur de ligne pour sous-titres multilignes */
.line-wrap { display: block; overflow: hidden; }

/* Styles historiques VibeEditor */
.w{display:inline-block;white-space:nowrap}
.w-mask{overflow:hidden;vertical-align:top;padding:.08em .04em .18em;margin:-.08em -.04em -.18em}
.wi,.c{display:inline-block;will-change:transform}
.caret{display:inline-block;margin-left:.05em}
.mark{background:linear-gradient(var(--accent),var(--accent)) no-repeat 0 90%/0% 38%;
      -webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .08em}
.num{font-variant-numeric:tabular-nums}
```
```js
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* Découpage mot par mot propre sans destruction de layout */
function splitWordsClean(el, { masked = false } = {}) {
  const text = el.textContent.normalize('NFC').trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const ws = text.split(/\s+/);
  return ws.map((w, i) => {
    const wrap = document.createElement('span');
    wrap.className = masked ? 'w-wrap-mask' : 'w-wrap';
    if (i === ws.length - 1) wrap.style.marginRight = '0';
    const inner = document.createElement('span');
    inner.className = 'w-inner';
    inner.textContent = w;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    return inner;
  });
}

function splitWords(el,{mask=false}={}){
  const text=el.textContent.normalize('NFC').trim();
  el.setAttribute('aria-label',text); el.textContent='';
  const ws=text.split(/\s+/);
  return ws.map((w,i)=>{
    const o=document.createElement('span'); o.className=mask?'w w-mask':'w';
    const n=document.createElement('span'); n.className='wi'; n.textContent=w;
    o.appendChild(n); el.appendChild(o);
    if(i<ws.length-1) el.appendChild(document.createTextNode(' '));
    return n;
  });
}
function splitChars(el){
  const words=splitWords(el), chars=[];
  words.forEach(n=>{const t=n.textContent;n.textContent='';
    [...t].forEach(ch=>{const s=document.createElement('span');s.className='c';s.textContent=ch;n.appendChild(s);chars.push(s)})});
  return {words,chars};
}
```
Le parent d'un texte animé en transform doit avoir `display:inline-block` ou `block` (les `inline` ignorent `transform`).

## 4. Catalogue d'animations

### 4.0 ANIMATIONS PAR DÉFAUT (Règles Fondamentales VibeEditor)

#### 4.0.1 Titre Monopoliche — `titleFadeWordsUp` & `titleFadeWordsDown`
**Quand l'utiliser :** Titre dont l'intégralité du texte partage la même police (ex: *"Le Grand Écart Mondial"* en Outfit 800).  
**Comportement :** Chaque mot apparaît l'un après l'autre avec une translation verticale douce et un fondu d'opacité.
- **Règle absolue de layout :** Le texte reste parfaitement aligné sur sa ligne de base. Les retours à la ligne naturels sont respectés sans aucun reflow pendant la transition.
- **Interdiction formelle :** Ne jamais utiliser sur un titre contenant un mot dans une autre police !
```js
function titleFadeWordsUp(tl, el, t = 0, { dur = 0.65, stagger = 0.1, y = 28, ease = 'power2.out' } = {}) {
  const words = splitWordsClean(el, { masked: false });
  tl.fromTo(words,
    { y: y, opacity: 0 },
    { y: 0, opacity: 1, duration: dur, stagger: stagger, ease: ease },
    t
  );
  return t + dur + (words.length - 1) * stagger;
}

function titleFadeWordsDown(tl, el, t = 0, { dur = 0.65, stagger = 0.1, y = -28, ease = 'power2.out' } = {}) {
  const words = splitWordsClean(el, { masked: false });
  tl.fromTo(words,
    { y: y, opacity: 0 },
    { y: 0, opacity: 1, duration: dur, stagger: stagger, ease: ease },
    t
  );
  return t + dur + (words.length - 1) * stagger;
}
```

#### 4.0.2 Titre Multipolice — `titleMultiFontSlide`
**Quand l'utiliser :** Titre associant deux polices (ex: Sans-Serif + mot en Serif italique ou Script manuscrit type `<span class="editorial-accent">...</span>`).  
**Pourquoi interdire le mot par mot ici ?** Découper des mots ayant des tailles de corps, des hauteurs d'x et des chasses dissemblables crée des ruptures visuelles disgracieuses et déforme la perception du titre.  
**Comportement :** Le titre entre en bloc entier ou ligne par ligne avec un glissement vertical élégant.
```js
function titleMultiFontSlide(tl, el, t = 0, { dur = 0.75, y = 30, ease = 'power2.out' } = {}) {
  tl.fromTo(el,
    { y: y, opacity: 0 },
    { y: 0, opacity: 1, duration: dur, ease: ease },
    t
  );
  return t + dur;
}
```

#### 4.0.3 Sous-titre par Défaut n°1 — `subtitleSlideUp` (Texte entier ou ligne par ligne)
**Quand l'utiliser :** Sous-titres, explications et descriptions sous un titre.  
**Comportement :** Le texte entier (ou chaque ligne successivement si le texte est sur plusieurs lignes) glisse vers le haut avec un fondu doux.
```js
function subtitleSlideUp(tl, el, t = 0, { dur = 0.7, y = 22, ease = 'power2.out' } = {}) {
  tl.fromTo(el,
    { y: y, opacity: 0 },
    { y: 0, opacity: 1, duration: dur, ease: ease },
    t
  );
  return t + dur;
}
```

#### 4.0.4 Sous-titre par Défaut n°2 — `subtitleWordsSlideRightToLeft`
**Quand l'utiliser :** Sous-titres dynamiques où l'on souhaite une cadence rythmée mot par mot.  
**Comportement :** Chaque mot glisse de droite à gauche (`x: 35 -> 0`) vers sa place exacte et s'y fige définitivement. Le premier mot arrive, reste immobile, puis le second arrive et se colle à sa suite, sans jamais bousculer les mots déjà posés.
```js
function subtitleWordsSlideRightToLeft(tl, el, t = 0, { dur = 0.5, stagger = 0.08, distance = 35, ease = 'power2.out' } = {}) {
  const words = splitWordsClean(el, { masked: false });
  tl.fromTo(words,
    { x: distance, opacity: 0 },
    { x: 0, opacity: 1, duration: dur, stagger: stagger, ease: ease },
    t
  );
  return t + dur + (words.length - 1) * stagger;
}
```

### 4.1 maskReveal — premium par défaut
```js
function maskReveal(tl,el,t=0,{dur=.7,stagger=.08,ease='expo.out'}={}){
  const w=splitWords(el,{mask:true});
  tl.fromTo(w,{yPercent:115,rotate:4,transformOrigin:'0% 100%'},
              {yPercent:0,rotate:0,duration:dur,stagger,ease},t);
  return t+dur+(w.length-1)*stagger;
}
```

### 4.2 charCascade — blur → net
```js
function charCascade(tl,el,t=0,{dur=.6,stagger=.03,y='.45em',blur=10}={}){
  const {chars}=splitChars(el);   // < 40 caractères si blur (coût GPU en headless)
  tl.fromTo(chars,{opacity:0,y,filter:`blur(${blur}px)`},
                  {opacity:1,y:0,filter:'blur(0px)',duration:dur,stagger,ease:'power3.out'},t);
  return t+dur+(chars.length-1)*stagger;
}
```

### 4.3 slam — mot-choc (hook)
```js
function slam(tl,el,t=0,{from=1.9,dur=.2,shake=8}={}){
  gsap.set(el,{display:'inline-block',transformOrigin:'50% 60%'});
  tl.fromTo(el,{scale:from,opacity:0},{scale:1,opacity:1,duration:dur,ease:'power4.in'},t)
    .to(el,{x:shake,duration:.04,yoyo:true,repeat:5,ease:'none'},t+dur)      // secousse finie
    .set(el,{x:0},t+dur+.26);
  return t+dur+.26;
}
```
Toujours couplé à un SFX `hit` pile à `t+dur` (voir `sound_design`).

### 4.4 typewriter
```js
function typewriter(tl,el,t=0,{cps=22}={}){
  const full=el.textContent, txt=document.createElement('span'), car=document.createElement('span');
  car.className='caret'; car.textContent='▍'; el.textContent=''; el.append(txt,car);
  const o={n:0}, dur=full.length/cps;
  tl.to(o,{n:full.length,duration:dur,ease:'none',onUpdate:()=>{txt.textContent=full.slice(0,Math.round(o.n))}},t);
  tl.fromTo(car,{opacity:1},{opacity:0,duration:.001,repeat:7,repeatDelay:.45,yoyo:true},t+dur);
  return t+dur;
}
```
Règle : cps 18–28. Plus lent = ennuyeux, plus rapide = illisible.

### 4.5 scramble (décodage) — précalculé donc déterministe
```js
function scramble(tl,el,t=0,{dur=.9,seed=7,set='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@'}={}){
  const full=el.textContent, rnd=mulberry32(seed), steps=Math.max(8,Math.round(dur*30)), frames=[];
  for(let s=0;s<=steps;s++){const k=Math.floor(full.length*s/steps);let out=full.slice(0,k);
    for(let i=k;i<full.length;i++) out+= full[i]===' '?' ':set[Math.floor(rnd()*set.length)];
    frames.push(out)}
  const o={p:0}; el.style.fontVariantNumeric='tabular-nums';
  tl.to(o,{p:steps,duration:dur,ease:'none',onUpdate:()=>{el.textContent=frames[Math.round(o.p)]}},t);
  return t+dur;
}
```
Utiliser une police monospace ou une largeur fixe (`min-width`) pour éviter que la mise en page saute.

### 4.6 highlight — surligneur
```js
function highlight(tl,mark,t=0,{dur=.5}={}){          // <span class="mark">mot</span>
  tl.to(mark,{backgroundSize:'100% 38%',duration:dur,ease:'power3.inOut'},t); return t+dur;
}
```
Variante « boîte pleine » : `backgroundPosition:0 50%` + `backgroundSize:100% 100%`, texte en couleur contrastée.

### 4.7 underline — trait SVG (sans bounding box)
```html
<svg class="ul" viewBox="0 0 300 20" preserveAspectRatio="none"><path pathLength="1" d="M4 12 C80 2,160 20,296 8" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
```
```js
function underline(tl,path,t=0,{dur=.55}={}){
  tl.fromTo(path,{strokeDashoffset:1},{strokeDashoffset:0,duration:dur,ease:'power2.inOut'},t); return t+dur;
}
```
`pathLength="1"` évite `getTotalLength()` (qui renvoie 0 si l'élément est `display:none`).

### 4.8 counter
```js
function counter(tl,el,t=0,{from=0,to,dur=1.4,prefix='',suffix='',decimals=0,ease='power2.out'}={}){
  const o={v:from}, f=new Intl.NumberFormat('fr-FR',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  const set=()=>{el.textContent=prefix+f.format(o.v).replace(/\u202f/g,'\u00a0')+suffix};
  set(); el.classList.add('num'); tl.to(o,{v:to,duration:dur,ease,onUpdate:set},t); return t+dur;
}
```
Finir par un petit `scale 1→1.08→1` + SFX `tick` pendant le comptage, `ding` à la fin.

### 4.9 flip3D (par mots)
```js
function flip3D(tl,el,t=0,{dur=.6,stagger:s=.09}={}){
  el.style.perspective='900px'; const w=splitWords(el);
  tl.fromTo(w,{rotationX:-90,opacity:0,transformOrigin:'50% 0%'},{rotationX:0,opacity:1,duration:dur,stagger:s,ease:'back.out(1.4)'},t);
  return t+dur+(w.length-1)*s;
}
```

### 4.10 glitch (déterministe)
```js
function glitch(tl,el,t=0,{dur=.4}={}){
  const seq=[[-6,3],[5,-2],[-3,0],[8,-4],[0,0]], d=dur/seq.length;
  seq.forEach(([x,k],i)=>tl.set(el,{x,skewX:k*2,
    textShadow:`${-x}px 0 #ff2d55,${x}px 0 #00e5ff`},t+i*d));
  tl.set(el,{x:0,skewX:0,textShadow:'none'},t+dur); return t+dur;
}
```

### 4.11 gradient shine
```css
.shine{background:linear-gradient(100deg,var(--ink) 40%,#fff 50%,var(--ink) 60%) 150% 0/250% 100%;
       -webkit-background-clip:text;background-clip:text;color:transparent}
```
```js
tl.to(el,{backgroundPosition:'-50% 0',duration:1.2,ease:'power2.inOut'},t);
```

### 4.12 Sortie propre
```js
function exitUp(tl,targets,t,{dur=.35}={}){
  tl.to(targets,{yPercent:-60,opacity:0,duration:dur,ease:'power2.in',stagger:.03},t); return t+dur;
}
```

## 5. Sous-titres karaoké (voix off + cues Whisper/ElevenLabs)
Format d'entrée : `cues = [{w:'Bonjour', s:0.12, e:0.48}, …]` (secondes, déjà remappées après coupes, voir `sound_design`).
```js
function chunkCues(cues,maxWords,maxChars){
  const out=[]; let cur=[]; const len=a=>a.reduce((n,c)=>n+c.w.length+1,0);
  cues.forEach(c=>{const p=cur[cur.length-1]; const gap=p?c.s-p.e:0;
    if(cur.length&&(cur.length>=maxWords||len(cur)+c.w.length>maxChars||gap>.4||/[.!?…]$/.test(p.w))){out.push(cur);cur=[]}
    cur.push(c)});
  if(cur.length) out.push(cur); return out;
}
function buildSubtitles(tl,box,cues,{maxWords=3,maxChars=22,active='#FFE600'}={}){
  chunkCues(cues,maxWords,maxChars).forEach(ch=>{
    const line=document.createElement('div'); line.className='sub-line'; box.appendChild(line);
    const sp=ch.map(c=>{const s=document.createElement('span');s.className='sub-w';s.textContent=c.w;line.append(s,' ');return s});
    const start=ch[0].s, end=Math.max(ch.at(-1).e,start+.35)+.08;
    tl.set(line,{autoAlpha:0},0).set(line,{autoAlpha:1},start)
      .fromTo(line,{y:14,scale:.92},{y:0,scale:1,duration:.18,ease:'back.out(2)'},start)
      .set(line,{autoAlpha:0},end);
    ch.forEach((c,i)=>{tl.to(sp[i],{color:active,scale:1.12,duration:.08,ease:'power2.out'},c.s)
                        .to(sp[i],{color:'#fff',scale:1,duration:.12},c.e)});
  });
}
```
Styles CSS (voir `design_composition` pour tailles/positions) : style « contour » `-webkit-text-stroke:.6u #000;paint-order:stroke fill`, style « boîte » `background:rgba(0,0,0,.55);border-radius:1.4u;padding:.4u 1.2u`.
Majuscules : réserver aux shorts. Ponctuation : retirer virgules/points finaux à l'affichage (pas à la logique de chunk).

## 6. Pièges fréquents → parades
| Problème | Cause | Parade |
|---|---|---|
| Lettres décalées / sauts de ligne à l'animation | Polices pas chargées au moment du split | `await document.fonts.ready` avant `split*` |
| Texte rogné en bas (g, y, p) dans un masque | `overflow:hidden` trop serré | `padding-bottom:.18em` + marge négative (`.w-mask`) |
| Rotation autour du mauvais point | `transformOrigin` par défaut | Le fixer dans `fromTo` ; SVG : `transformBox:'fill-box'` + `transformOrigin:'50% 50%'` |
| Saccades en rendu | `filter:blur` sur 100+ éléments | Blur sur le conteneur, ou sur ≤ 40 spans |
| Animation fausse au scrub arrière | état initial non enregistré | Pré-chauffe `tl.seek(end).seek(0)` ; `fromTo` plutôt que `from` |
| Texte flou | `scale` > 1 sur texte bitmap, `will-change` partout | Animer en `scale` ≤ 1 vers 1 ; `will-change` uniquement sur `.wi,.c` |
| Chiffres qui « tremblent » | police proportionnelle | `font-variant-numeric:tabular-nums` |
| Espaces fines bizarres dans les nombres | `Intl` fr-FR utilise U+202F | `.replace(/\u202f/g,'\u00a0')` |
| Texte qui déborde en 9:16 | longueur fixe | `fitText` (voir `design_composition`) |
| Émojis différents entre aperçu et rendu | police emoji système | Éviter dans les titres animés ou utiliser des SVG |

## 7. Checklist avant de rendre
- [ ] Aucune API temps réel (`setTimeout`, `random`, `Date`).
- [ ] Chaque texte reste lisible ≥ `max(0.8 s, mots×0.3 s)`.
- [ ] 1 animation de base + 1 signature maximum.
- [ ] Un seul mot surligné par phrase, un seul `slam` par scène.
- [ ] Texte jamais dans les zones UI de la plateforme (voir `design_composition`).
- [ ] Scrub aller-retour en prévisualisation : état identique à t donné.
