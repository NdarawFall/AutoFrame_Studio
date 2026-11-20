/**
 * 07_Scripts/roadmap_generator.cjs
 * Générateur et Gestionnaire de la Feuille de Route Unique MarvidFlow (Production IA)
 * 
 * RÈGLE D'OR : Un seul fichier unique "09_Pages/feuille_de_route.md".
 * 1. L'IA réfléchit, analyse le sujet et conçoit une feuille de route sur-mesure (scénario, 3-5s par plan, stickers, B-rolls).
 * 2. Visualisation et édition directe dans le grand modal ou dans un éditeur.
 * 3. Validation par l'utilisateur -> vidage automatique du fichier pour la session suivante.
 */

const fs = require('fs');
const path = require('path');
const { callAiKombo } = require('./ai_kombo.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const ROADMAP_PATH = path.join(ROOT_DIR, '09_Pages', 'feuille_de_route.md');

/**
 * Détecte la thématique dominante à partir du prompt et du style
 */
function detectTheme(prompt = '', style = '') {
    const text = `${prompt} ${style}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/\b(claude|anthropic|saas|ia|ai|code|dev|logiciel|software|terminal|tech|startup|api|application|app)\b/.test(text)) {
        return 'saas_tech';
    }
    if (/\b(histoire|guerre|vox|documentaire|militaire|empire|siecle|bataille|revolution|archive|enquete)\b/.test(text)) {
        return 'vox_documentary';
    }
    if (/\b(produit|ecommerce|e-commerce|boutique|vente|mode|shopping|marque|luxe|montre|sneakers)\b/.test(text)) {
        return 'ecommerce_product';
    }
    return 'modern_explainer';
}

/**
 * Génère une feuille de route de secours dynamique et intelligente adaptée au sujet
 */
function buildSmartFallbackRoadmap(payload) {
    const prompt = payload.prompt || 'Présentation Produit & Solution';
    const format = payload.format || '16:9';
    const style = payload.style || payload.template || 'saas';
    const audioSetup = payload.audioSetup || 'full_mix';
    const theme = detectTheme(prompt, style);
    const nowStr = new Date().toLocaleString('fr-FR', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'medium' });

    let title = '';
    let concept = '';
    let visualRules = [];
    let colorPalette = '';
    let scenes = [];
    let stickers = [];
    let brolls = [];
    let soundDesign = {};

    if (theme === 'saas_tech') {
        const isClaude = prompt.toLowerCase().includes('claude');
        const subjectName = isClaude ? 'Claude 3.5 Sonnet' : 'votre Solution SaaS';
        title = isClaude ? 'Claude 3.5 Sonnet — L’Intelligence Artificielle Nouvelle Génération' : `${prompt} — Plateforme SaaS Moderne`;
        concept = `Spot publicitaire tech épuré au rythme percutant démontrant la puissance, la rapidité et l'élégance de ${subjectName} dans le quotidien des développeurs et créateurs.`;
        visualRules = [
            'Cartes d’interface en verre dépoli (Glassmorphism sombre #111827 avec flou backdrop 16px et bordure subtile)',
            'Typographie tech géométrique 80/20 avec hiérarchie stricte et contrastes élevés',
            'Stickers d’icônes et fenêtres de terminal détourés avec contour blanc papier physique (3px) et effet pendule cloche',
            'Effet Pendule Continu (balancement doux ±1.8° sur transform-origin: 50% 0%)',
            'Continuité temporelle absolue (zéro temps mort, plans courts de 3 à 4.5s)'
        ];
        colorPalette = 'Dominante 60% Obsidian (#090d16), Secondaire 30% Slate Glass (#1e293b/80), Accent 10% Ambre Claude (#f59e0b) ou Cyan électrique (#38bdf8)';
        scenes = [
            { id: 1, start: '0.0s', end: '4.0s', dur: '4.0s', format: 'Mockup UI Glassmorphism & Terminal', voiceover: `Et si la programmation devenait aussi fluide et naturelle qu'une simple conversation ?`, animation: 'Zoom Ken Burns doux (1.0 -> 1.05) + Pulsation néon' },
            { id: 2, start: '4.0s', end: '8.0s', dur: '4.0s', format: 'Chiffre Clé Monumental & Badge', voiceover: `Découvrez la puissance brute d'une intelligence pensée pour résoudre les problèmes les plus complexes.`, animation: 'Compteur dynamique + Balancement pendulaire' },
            { id: 3, start: '8.0s', end: '12.2s', dur: '4.2s', format: 'B-Roll Vidéo Réel (Mains Dev & Clavier)', voiceover: `Une vitesse d'exécution fulgurante, une compréhension contextuelle hors pair, et zéro friction.`, animation: 'Transition Cut rythmée + Vignette cinéma sombre' },
            { id: 4, start: '12.2s', end: '16.5s', dur: '4.3s', format: 'Sticker Papier Découpé (Puce IA & Logo)', voiceover: `Des lignes de code générées avec une précision chirurgicale en une fraction de seconde.`, animation: 'Effet Pendule Cloche (rotate ±1.8°) + Contour blanc 3px' },
            { id: 5, start: '16.5s', end: '21.0s', dur: '4.5s', format: 'Capture UI Animée & Flux de Données', voiceover: `Adoptez le nouveau standard de productivité pour propulser vos projets à la vitesse supérieure.`, animation: 'Défilement fluide de code + reflets ambrés' },
            { id: 6, start: '21.0s', end: '25.0s', dur: '4.0s', format: 'Call to Action Monumental Glassmorphism', voiceover: `Passez à l'action dès aujourd'hui. L'avenir du code commence maintenant.`, animation: 'Zoom avant puissant + Flash lumineux final' }
        ];
        stickers = [
            { role: 'Badge Logo Claude / Sparkle IA', promptEn: 'Futuristic minimalist glowing Anthropic Claude spark emblem, modern tech aesthetic, sleek glass texture with vibrant amber and obsidian accents, solid bright green screen background (#00FF00), crisp white paper cutout sticker border outline (3px solid white stroke), subtle edge shadow --ar 1:1 --v 6.1', usage: 'Sticker découpé en haut d’écran avec balancement pendulaire doux.' },
            { role: 'Fenêtre de Terminal de Code Moderne', promptEn: 'Isometric floating dark code editor window terminal mockup, colorful syntax highlighting, glowing amber cursor, solid bright green screen background (#00FF00), clean white paper cutout sticker contour (4px white border), realistic drop shadow --ar 4:3 --v 6.1', usage: 'Apparition centrale avec zoom avant puis flottaison douce.' },
            { role: 'Badge Indicateur de Performance 10x', promptEn: 'Modern glowing badge sticker with typography 10x FASTER and glowing neon cybernetic circuit lines, solid bright green screen background (#00FF00), crisp white sticker border contour, vector 3D tech style --ar 1:1 --v 6.1', usage: 'Pop d’apparition dynamique en angle supérieur droit.' }
        ];
        brolls = [
            { plan: 'Plan 1 & 3', query: 'software developer typing mechanical keyboard dark room neon glow 4k', desc: 'Gros plan cinématographique de mains expertes tapant du code sur clavier rétroéclairé.' },
            { plan: 'Plan 2', query: 'abstract cyber data flow glowing digital network nodes 4k', desc: 'Flux abstrait de données lumineuses et de particules symbolisant la puissance de calcul.' },
            { plan: 'Plan 5', query: 'modern minimalist dual monitor tech workspace aesthetic setup', desc: 'Bureau de développeur moderne avec écran ultra-large affichant du code.' }
        ];
        soundDesign = {
            musicGenre: 'Tech Ambient Synthwave moderne & épuré (115 BPM, beat électronique subtil)',
            mixConfig: 'Voix normalisée à -14 LUFS, Ducking musical -18 dB sous la voix, Fondu de sortie 2.5s',
            sfx: ['Whoosh futuriste à l’apparition', 'Frappes de clavier mécanique discrètes', 'Swoosh fluide entre les plans', 'Carillon de validation final']
        };
    } else if (theme === 'vox_documentary') {
        title = `${prompt} — L'Enquête Documentaire Vox`;
        concept = `Format documentaire immersif style Vox combinant fonds papier vélin chaleureux, stickers découpés avec bordure blanche physique et analyse visuelle percutante.`;
        visualRules = [
            'Fond Papier Vélin Chaud (Dégradé #faf8f5 vers #f4f0e6 avec texture de fibre naturelle)',
            'Stickers Découpage Papier Blanc (.vox-paper-cutout avec bordure blanche 4px et ombre portée)',
            'Effet Pendule Continu (balancement cloche -1.8deg à +1.8deg sur transform-origin: 50% 0%)',
            'Texte Épuré au Strict Minimum (mots-clés, dates, pourcentages, zéro pavé)',
            'Continuité Temporelle Absolue (zéro écran blanc ni trou temporel)'
        ];
        colorPalette = 'Dominante 60% Papier Vélin (#faf8f5), Secondaire 30% Encre de Chine (#1e293b), Accent 10% Rouge Archives (#dc2626) ou Jaune Surligneur (#facc15)';
        scenes = [
            { id: 1, start: '0.0s', end: '4.2s', dur: '4.2s', format: 'Ken Burns Plein Écran & Carte', voiceover: `Derrière les apparences, un événement méconnu a totalement transformé le cours de cette histoire.`, animation: 'Zoom Ken Burns lent (1.0 -> 1.08) + Grain papier' },
            { id: 2, start: '4.2s', end: '8.5s', dur: '4.3s', format: 'Sticker Papier Découpé & Pendule', voiceover: `Voici les faits, les chiffres et les décisions qui ont tout changé.`, animation: 'Effet Pendule Cloche (rotate ±1.8°) + Contour blanc 4px' },
            { id: 3, start: '8.5s', end: '13.0s', dur: '4.5s', format: 'Document d’Archive Surligné', voiceover: `Des documents historiques authentiques révèlent ce qui s'est réellement passé en coulisses.`, animation: 'Trait de surligneur progressif jaune + tampon d’archive' },
            { id: 4, start: '13.0s', end: '17.5s', dur: '4.5s', format: 'B-Roll Vidéo Réel (yt-dlp)', voiceover: `Un bouleversement colossal dont les répercussions se font encore ressentir aujourd'hui.`, animation: 'Vidéo d’archive 60 FPS désaturée 15%' },
            { id: 5, start: '17.5s', end: '22.0s', dur: '4.5s', format: 'Chiffre Clé Monumental 2D', voiceover: `Une leçon fondamentale que l'histoire nous rappelle encore et toujours.`, animation: 'Compteur 2D monumental + dérive Ken Burns' }
        ];
        stickers = [
            { role: 'Figure Historique / Personnage Clé', promptEn: `Detailed illustration of key historical figure related to ${prompt}, dramatic chiaroscuro lighting, solid bright green screen background (#00FF00), crisp white paper cutout sticker border outline (4px solid white stroke), archival documentary art style --ar 1:1 --v 6.1`, usage: 'Sticker suspendu au sommet avec balancement pendulaire continu.' },
            { role: 'Objet Symbolique / Carte Vintage', promptEn: `Vintage symbolic artifact or historical map related to ${prompt}, aged parchment texture, solid bright green screen background (#00FF00), clean white paper cutout sticker contour, vector documentary style --ar 1:1 --v 6.1`, usage: 'Apparition centrale avec zoom progressif.' }
        ];
        brolls = [
            { plan: 'Plan 1 & 4', query: 'archival historical documentary footage vintage 1940s 1950s cinematic', desc: 'Extrait vidéo d’époque ou d’actualités avec patine et grain d’archive.' }
        ];
        soundDesign = {
            musicGenre: 'Documentaire journalistique introspectif (Cordes subtiles, piano acoustique, 95 BPM)',
            mixConfig: 'Voix normalisée à -14 LUFS, Ducking musical -18 dB sous la voix, Fondu de sortie 2.5s',
            sfx: ['Bruit de papier manipulé', 'Clic d’obturateur photo vintage', 'Graves d’impact documentaire']
        };
    } else {
        title = `${prompt} — Présentation Dynamique`;
        concept = `Vidéo explicative rythmée et moderne combinant graphismes contemporains, voix off percutante et animations fluides.`;
        visualRules = [
            'Typographie 80/20 avec contrastes nets',
            'Transitions franches et cadencées (3 à 5 secondes par plan)',
            'Stickers animés avec contour physique blanc et mouvement continu',
            'Animation sans discontinuité temporelle'
        ];
        colorPalette = 'Dominante 60% Neutre moderne (#0f172a), Secondaire 30% Carte contrastée (#1e293b), Accent 10% Couleur vive (#3b82f6)';
        scenes = [
            { id: 1, start: '0.0s', end: '4.0s', dur: '4.0s', format: 'Ken Burns Plein Écran', voiceover: `Vous êtes-vous déjà demandé comment transformer radicalement votre approche ?`, animation: 'Zoom Ken Burns doux (1.0 -> 1.06)' },
            { id: 2, start: '4.0s', end: '8.2s', dur: '4.2s', format: 'Sticker Papier Découpé Flottant', voiceover: `Voici la solution qui simplifie tout, étape par étape.`, animation: 'Effet Pendule Cloche (rotate ±1.8°)' },
            { id: 3, start: '8.2s', end: '12.5s', dur: '4.3s', format: 'Chiffre Clé & Graphique 2D', voiceover: `Des résultats mesurables, concrets et immédiatement visibles.`, animation: 'Apparition pop dynamique avec rebond' },
            { id: 4, start: '12.5s', end: '17.0s', dur: '4.5s', format: 'B-Roll Vidéo Réel', voiceover: `Une méthode éprouvée pour gagner du temps et démultiplier votre impact.`, animation: 'Dérive latérale vidéo HD' },
            { id: 5, start: '17.0s', end: '21.0s', dur: '4.0s', format: 'Call to Action Monumental', voiceover: `Prêt à franchir le pas ? Découvrez la différence dès aujourd'hui.`, animation: 'Zoom avant immersif + Accent lumineux' }
        ];
        stickers = [
            { role: 'Illustration Symbolique', promptEn: `Modern clean 3D illustration related to ${prompt}, solid bright green screen background (#00FF00), crisp white paper cutout sticker contour (3px solid white stroke), vibrant colors --ar 1:1 --v 6.1`, usage: 'Sticker découpé avec balancement pendulaire doux.' }
        ];
        brolls = [
            { plan: 'Plan 4', query: 'modern productivity collaboration creative workspace 4k', desc: 'Plan vidéo lumineux et professionnel illustrant le succès et la simplicité.' }
        ];
        soundDesign = {
            musicGenre: 'Corporate Upbeat & Électro douce (120 BPM, énergie positive)',
            mixConfig: 'Voix normalisée à -14 LUFS, Ducking musical -18 dB sous la voix, Fondu de sortie 2.5s',
            sfx: ['Whoosh fluide', 'Clic dynamique', 'Note de confirmation']
        };
    }

    return renderMarkdownDocument({
        title,
        concept,
        prompt,
        style,
        format,
        audioSetup,
        nowStr,
        visualRules,
        colorPalette,
        scenes,
        stickers,
        brolls,
        soundDesign
    });
}

/**
 * Transforme la structure générée par l'IA (JSON) en Markdown soigné
 */
function formatAiRoadmapToMarkdown(aiData, payload) {
    const prompt = payload.prompt || 'Sujet Vidéo';
    const format = payload.format || aiData.format || '16:9';
    const style = payload.style || payload.template || aiData.style || 'saas';
    const audioSetup = payload.audioSetup || 'full_mix';
    const nowStr = new Date().toLocaleString('fr-FR', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'medium' });

    const title = aiData.project_title || aiData.title || `${prompt} — Production Vidéo IA`;
    const concept = aiData.concept_summary || aiData.concept || aiData.pitch || `Concept créatif vidéo optimisé pour le format ${format} avec direction artistique ${style}.`;

    const visDir = aiData.visual_direction || {};
    let visualRules = Array.isArray(visDir.artistic_rules) ? visDir.artistic_rules : (Array.isArray(aiData.artistic_rules) ? aiData.artistic_rules : []);
    if (visualRules.length === 0) {
        visualRules = [
            'Hiérarchie visuelle 80/20 avec typographie épurée',
            'Stickers découpés avec bordure papier blanche (3-4px) et effet pendule cloche',
            'Rythme soutenu de 3 à 5 secondes par plan (aucun écran blanc ni scène statique)',
            'Continuité temporelle absolue démarrant à 0.00s pile'
        ];
    }
    const colorPalette = visDir.color_palette || aiData.color_palette || 'Dominante 60% Obsidian (#090d16), Secondaire 30% Slate (#1e293b), Accent 10% Vif (#f59e0b)';

    // Normalisation des scènes
    const rawScenes = Array.isArray(aiData.scenes) ? aiData.scenes : [];
    let currentTime = 0;
    const scenes = rawScenes.map((sc, idx) => {
        const id = sc.scene_number || sc.id || (idx + 1);
        let dur = parseFloat(sc.duration_sec || sc.duration || 4.0);
        if (isNaN(dur) || dur < 2.5 || dur > 7.0) dur = 4.0;
        const start = sc.timecode ? sc.timecode.split('-')[0].trim() : `${currentTime.toFixed(1)}s`;
        const end = sc.timecode && sc.timecode.includes('-') ? sc.timecode.split('-')[1].trim() : `${(currentTime + dur).toFixed(1)}s`;
        currentTime += dur;

        return {
            id,
            start,
            end,
            dur: `${dur.toFixed(1)}s`,
            format: sc.visual_format || sc.format || 'Mockup UI & Ken Burns',
            voiceover: sc.voice_over || sc.voiceover || sc.text || 'Texte de la voix off...',
            animation: sc.animation_active || sc.animation || 'Zoom Ken Burns doux + Balancement cloche',
            visualDesc: sc.visual_description || sc.visual || '',
            broll: sc.broll_suggestion || sc.broll || ''
        };
    });

    // Normalisation des stickers fond vert
    const rawStickers = Array.isArray(aiData.stickers_green_screen) ? aiData.stickers_green_screen : (Array.isArray(aiData.stickers) ? aiData.stickers : []);
    const stickers = rawStickers.map((stk, idx) => {
        if (typeof stk === 'string') {
            return {
                role: `Élément Graphique ${idx + 1}`,
                promptEn: `${stk}, solid bright green screen background (#00FF00), crisp white paper cutout sticker border outline (3px solid white stroke) --ar 1:1 --v 6.1`,
                usage: 'Sticker découpé avec effet pendule cloche flottant.'
            };
        }
        return {
            role: stk.role || `Sticker Graphique ${idx + 1}`,
            promptEn: stk.prompt_en || stk.promptEn || stk.prompt || `${prompt} graphic element, solid bright green screen background (#00FF00), crisp white paper cutout sticker contour --ar 1:1`,
            usage: stk.usage || 'Apparition dynamique et effet de balancier pendulaire au sommet.'
        };
    });

    // Normalisation des B-Rolls
    const rawBrolls = Array.isArray(aiData.brolls_needed) ? aiData.brolls_needed : (Array.isArray(aiData.brolls) ? aiData.brolls : []);
    const brolls = rawBrolls.map((br, idx) => {
        if (typeof br === 'string') {
            return { plan: `Plan ${idx + 1}`, query: br, desc: br };
        }
        return {
            plan: br.plan || (br.scene_number ? `Plan ${br.scene_number}` : `Plan ${idx + 1}`),
            query: br.search_query || br.query || br.keywords || `${prompt} b-roll footage`,
            desc: br.description || br.desc || 'Séquence vidéo réelle dynamique 60 FPS.'
        };
    });

    // Normalisation sound design
    const snd = aiData.sound_design || {};
    const soundDesign = {
        musicGenre: snd.music_genre || snd.musicMood || 'Tech Ambient dynamique moderne (115 BPM)',
        mixConfig: snd.audio_mix || 'Voix normalisée à -14 LUFS, Ducking musical -18 dB sous la voix, Fondu de sortie 2.5s',
        sfx: Array.isArray(snd.sound_effects) ? snd.sound_effects : (Array.isArray(snd.sfx) ? snd.sfx : ['Whoosh d’ouverture', 'Frappes subtiles', 'Carillon final'])
    };

    return renderMarkdownDocument({
        title,
        concept,
        prompt,
        style,
        format,
        audioSetup,
        nowStr,
        visualRules,
        colorPalette,
        scenes,
        stickers,
        brolls,
        soundDesign
    });
}

/**
 * Assemblage final du document Markdown de la feuille de route
 */
function renderMarkdownDocument(params) {
    const {
        title,
        concept,
        prompt,
        style,
        format,
        audioSetup,
        nowStr,
        visualRules,
        colorPalette,
        scenes,
        stickers,
        brolls,
        soundDesign
    } = params;

    let totalDurationSec = 0;
    scenes.forEach(s => {
        totalDurationSec += parseFloat(s.dur) || 4.0;
    });
    totalDurationSec = Math.max(15, Math.round(totalDurationSec));

    let scenesTable = `| N° | Timecode | Durée | Format Visuel Recommandé | Texte Voix Off (Percutant & Rythmé) | Animation Active |\n`;
    scenesTable += `| :--- | :--- | :---: | :--- | :--- | :--- |\n`;

    scenes.forEach(sc => {
        scenesTable += `| **${sc.id}** | \`${sc.start} - ${sc.end}\` | **${sc.dur}** | **${sc.format}** | ${sc.voiceover.replace(/\|/g, '-')} | \`${sc.animation}\` |\n`;
    });

    let stickersBlock = stickers.map((stk, idx) => `
#### ${idx + 1}. ${stk.role}
* **Usage dans le montage** : ${stk.usage}
* **Prompt Flow / Midjourney / FLUX (Fond vert + contour papier blanc)** :
\`\`\`text
${stk.promptEn}
\`\`\`
`).join('\n');

    let brollsBlock = brolls.map(br => `* **${br.plan}** : *${br.desc}* — Recherche : \`${br.query}\``).join('\n');

    let rulesBlock = visualRules.map((r, idx) => `${idx + 1}. **${r}**`).join('\n');
    let sfxList = Array.isArray(soundDesign.sfx) ? soundDesign.sfx.map(x => `\`${x}\``).join(', ') : 'Whoosh, Clavier, Swoosh';

    return `# 📋 FEUILLE DE ROUTE DE PRODUCTION IA — MARVIDFLOW
> **Document de cadrage unique généré par l'IA avant toute mise en production.**
> *Généré le : ${nowStr} (UTC)*  
> *Fichier unique : \`09_Pages/feuille_de_route.md\` — Modifiable directement par l'utilisateur.*

---

## 🎯 1. Spécifications Générales & Concept Créatif
* **Titre du Projet** : **${title}**
* **Sujet & Prompt** : « ${prompt} »
* **Concept & Vision** : ${concept}
* **Style Artistique** : **${String(style).toUpperCase()}**
* **Format & Ratio** : \`${format}\`
* **Configuration Audio** : \`${audioSetup}\` (${soundDesign.mixConfig})
* **Durée Totale Estimée** : **${totalDurationSec}s** (${Math.floor(totalDurationSec / 60)} min ${totalDurationSec % 60}s)
* **Nombre de Séquences Découpées** : **${scenes.length} plans** (Cadence vive : 3 à 5s par plan, **zéro écran blanc**)

---

## 🎨 2. Direction Artistique & Palette Visuelle
${rulesBlock}
* **Palette Chromatique 60/30/10** : ${colorPalette}

---

## 🎬 3. Découpage Séquentiel Plan par Plan (Cadence 3-5s)
${scenesTable}

---

## 🖼️ 4. Prompts d'Illustrations Fond Vert (Stickers Contour Papier Blanc)
*Générez ces éléments dans Flow, Midjourney ou Leonardo, téléchargez-les et déposez-les dans l'application :*
${stickersBlock}

---

## 📹 5. B-Rolls & Séquences Vidéos Requises
*Séquences dynamiques réelles à extraire via les banques intégrées (Coverr / Pixabay) ou \`07_Scripts/youtube_clip.cjs\` :*
${brollsBlock}

---

## 🔊 6. Conception Sonore & Voix Off
* **Style Musical Suggéré** : ${soundDesign.musicGenre}
* **Mixage & Normalisation** : ${soundDesign.mixConfig}
* **Effets Sonores (SFX Synchronisés)** : ${sfxList}

---

## ✅ 7. Validation & Mise en Production
* Vous pouvez modifier directement ce texte ou ajuster les répliques et timecodes ci-dessus.
* Cliquez sur **« Valider et Lancer la Production 🚀 »** dans l'application pour démarrer l'assemblage.
* Le présent fichier sera automatiquement réinitialisé dès la validation pour accueillir le prochain projet.
`;
}

/**
 * Génère la feuille de route via l'IA (Kombo Multi-modèles) et l'écrit dans le fichier unique 09_Pages/feuille_de_route.md
 */
async function generateRoadmap(payload) {
    let md = '';
    const promptText = payload.prompt || 'Vidéo de présentation';
    const styleText = payload.style || payload.template || 'saas';
    const formatText = payload.format || '16:9';
    const scriptText = payload.customScript || payload.script || '';

    try {
        const systemPrompt = `Tu es le Directeur Artistique et Réalisateur en chef de MarvidFlow (expert vidéo motion design, formats SaaS Commercials et documentaires Vox).
Ta mission est de concevoir une FEUILLE DE ROUTE DE PRODUCTION VIDÉO (Production Roadmap) complète, créative et ultra-détaillée.

IMPORTANT: Tu dois STRICTEMENT retourner un objet JSON valide conforme au schéma suivant (sans texte conversationnel ni bloc de code englobant):
{
  "project_title": "Titre percutant de la vidéo",
  "concept_summary": "Résumé captivant du concept et de l'approche créative",
  "style": "${styleText}",
  "format": "${formatText}",
  "duration_total": 24,
  "visual_direction": {
    "style_name": "Nom du style visuel",
    "artistic_rules": [
      "Règle 1 adaptée au sujet précis",
      "Règle 2 adaptée au sujet précis",
      "Règle 3 adaptée au sujet précis",
      "Règle 4 adaptée au sujet précis"
    ],
    "color_palette": "Palette 60/30/10 précise adaptée au sujet (codes HEX et description)"
  },
  "scenes": [
    {
      "scene_number": 1,
      "timecode": "0.0s - 4.0s",
      "duration_sec": 4.0,
      "visual_format": "Mockup UI Glassmorphism / Ken Burns Plein Écran / Sticker Flottant Pendule / B-Roll Pur",
      "visual_description": "Description concrète et précise des visuels affichés à l'écran",
      "voice_over": "Texte exact de la voix off pour cette scène (direct, percutant, humain)",
      "animation_active": "Effet d'animation précis (ex: Zoom Ken Burns doux + Balancement cloche)",
      "broll_suggestion": "Idée de vidéo réelle d'ambiance ou d'action"
    }
  ],
  "stickers_green_screen": [
    {
      "role": "Rôle de l'élément (ex: Badge Logo Claude / Terminal de code / Puce IA)",
      "prompt_en": "Prompt Midjourney/FLUX en anglais sur fond vert vif (#00FF00) avec contour papier blanc (3px solid white stroke)",
      "usage": "Utilisation dans le montage (ex: balancement pendulaire doux au sommet)"
    }
  ],
  "brolls_needed": [
    {
      "scene_number": 1,
      "search_query": "Mots-clés précis de recherche en anglais pour banques de vidéos (4k)",
      "description": "Description du plan vidéo réel"
    }
  ],
  "sound_design": {
    "music_genre": "Style musical suggéré (BPM, ambiance, instruments)",
    "audio_mix": "Voix normalisée à -14 LUFS, Ducking musical -18 dB sous la voix",
    "sound_effects": ["Whoosh", "Clavier", "Transition", "Carillon"]
  }
}

RÈGLES D'OR DE RÉALISATION :
1. Génère impérativement entre 5 et 7 scènes rythmées (durée totale 20s à 30s). Chaque scène DOIT durer entre 3 et 5 secondes maximum (aucun temps mort).
2. Le sujet exact est : "${promptText}". La vidéo doit être 100% pensée et rédigée autour de ce sujet précis (s'il s'agit de Claude / SaaS, parle de Claude AI, de productivité dev, d'interface moderne, de code, d'accélération 10x ; s'il s'agit d'un autre sujet, adapte scrupuleusement le contenu).
3. Voix off captivante, humaine et percutante. Zéro blabla creux.`;

        const userPrompt = `Conçois la feuille de route complète pour ce projet :
- Sujet / Prompt : "${promptText}"
- Style artistique : ${styleText}
- Format vidéo : ${formatText}
- Configuration audio : ${payload.audioSetup || 'Mix complet (Voix + Musique)'}
- Script fourni par l'utilisateur : ${scriptText ? `"${scriptText}"` : 'Aucun (l’IA doit rédiger le scénario intégral)'}

Génère l'objet JSON complet :`;

        const preferredAi = payload.preferredAi || 'kombo';
        const aiResponse = await callAiKombo(systemPrompt, userPrompt, 0.7, preferredAi);

        if (aiResponse && typeof aiResponse === 'object' && Array.isArray(aiResponse.scenes) && aiResponse.scenes.length > 0) {
            console.log(`[Roadmap AI] Feuille de route générée avec succès via l'IA (${aiResponse.scenes.length} scènes).`);
            md = formatAiRoadmapToMarkdown(aiResponse, payload);
        } else if (typeof aiResponse === 'string' && aiResponse.includes('# 📋 FEUILLE DE ROUTE')) {
            md = aiResponse.trim().replace(/^```markdown\s*/i, '').replace(/```$/i, '').trim();
        } else {
            console.warn('[Roadmap AI] Réponse IA non conforme au schéma, utilisation du fallback intelligent.');
            md = buildSmartFallbackRoadmap(payload);
        }
    } catch (e) {
        console.warn('[Roadmap AI] Échec appel IA, bascule sur fallback intelligent :', e.message);
        md = buildSmartFallbackRoadmap(payload);
    }

    // Assurer que le dossier 09_Pages existe
    const targetDir = path.dirname(ROADMAP_PATH);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(ROADMAP_PATH, md, 'utf8');
    return {
        success: true,
        filePath: '09_Pages/feuille_de_route.md',
        fullPath: ROADMAP_PATH,
        content: md
    };
}

/**
 * Sauvegarde le contenu modifié de la feuille de route
 */
function saveRoadmap(content) {
    fs.writeFileSync(ROADMAP_PATH, content || '', 'utf8');
    return { success: true, filePath: '09_Pages/feuille_de_route.md' };
}

/**
 * Valide et vide le fichier unique feuille_de_route.md pour la session suivante
 */
function validateAndClearRoadmap(content) {
    if (content && content.trim().length > 0) {
        fs.writeFileSync(ROADMAP_PATH, content, 'utf8');
    }

    const emptyPlaceholder = `<!-- FEUILLE DE ROUTE RÉINITIALISÉE LE ${new Date().toISOString()} — EN ATTENTE DE LA PROCHAINE CRÉATION -->\n`;
    fs.writeFileSync(ROADMAP_PATH, emptyPlaceholder, 'utf8');

    return {
        success: true,
        cleared: true,
        filePath: '09_Pages/feuille_de_route.md'
    };
}

/**
 * Lit le contenu actuel de la feuille de route
 */
function getRoadmap() {
    if (!fs.existsSync(ROADMAP_PATH)) {
        return { success: true, content: '', exists: false };
    }
    const content = fs.readFileSync(ROADMAP_PATH, 'utf8');
    return { success: true, content, exists: true };
}

module.exports = {
    generateRoadmap,
    saveRoadmap,
    validateAndClearRoadmap,
    getRoadmap,
    buildSmartFallbackRoadmap,
    ROADMAP_PATH
};
