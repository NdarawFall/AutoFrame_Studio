/**
 * AI_DIRECTOR.CJS — Moteur Orchestrateur Autonome de Création Vidéo IA (VibeEditor)
 * 
 * Pipeline 100% autonome conforme aux règles de gouvernance .agents/rules/ :
 * 1. Analyse narrative & direction artistique par Google Gemini (Google AI Studio)
 *    - Liberté de fond : Noir, Blanc, Couleur Unie (bordeaux, navy, forêt...) ou Dégradé élégant.
 *    - Variations scénographiques : Chaque scène/clip peut avoir son propre fond tout en préservant l'harmonie globale.
 * 2. Exécution autonome des outils requis :
 *    - generate_voice.cjs (ElevenLabs / TTS) + Mesure précise de la durée audio via FFmpeg
 *    - brandfetch.cjs (Logos officiels de marques SVG / PNG)
 *    - fetch_map.cjs (Cartes géographiques HD sans watermark)
 *    - fetch_flag.cjs (Drapeaux nationaux & territoriaux SVG vectoriels & PNG gratuits)
 *    - Sous-titres calibrés mot-à-mot avec animation percutante instantanée (Hormozi style)
 * 3. Génération dynamique du code (HTML, CSS, GSAP) par Gemini sans template figé
 * 4. Modularité par scènes dans 05_Scenes/ et assemblage final dans 04_Videos/ ou 03_Chaines/
 * 5. Gestion des statuts ('processing' -> 'completed') et streaming temps réel des logs vers video_processus.html
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec, execFile } = require('child_process');
const { fetchFlag } = require('./fetch_flag.cjs');

function execAsync(cmd, timeout = 25000) {
    return new Promise((resolve) => {
        exec(cmd, { timeout }, (err, stdout, stderr) => {
            if (err) return resolve({ success: false, err });
            resolve({ success: true, stdout, stderr });
        });
    });
}

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = process.env.VIBE_USER_DATA
    ? path.join(process.env.VIBE_USER_DATA, 'api_config.json')
    : path.join(ROOT_DIR, '07_Scripts', 'api_config.json');

// Helper pour charger les directives des skills de conception et physique 2D (00_Skills/ et .agents/skills/)
function loadSkillsDirectives() {
    try {
        const skillsDir = path.join(ROOT_DIR, '00_Skills');
        const agentSkillsDir = path.join(ROOT_DIR, '.agents', 'skills');

        // Skill Design Joseph (vérification Joseph_Edit_Skills ou fallback video_design_mastery)
        const josephPath = path.join(agentSkillsDir, 'Joseph_Edit_Skills', 'SKILL.md');
        const legacyDesignPath = path.join(skillsDir, 'video_design_mastery', 'SKILL.md');
        const designSkillPath = fs.existsSync(josephPath) ? josephPath : legacyDesignPath;

        const physicsSkillPath = path.join(skillsDir, 'animation_2d_physics', 'SKILL.md');
        let text = '';
        if (fs.existsSync(designSkillPath)) {
            text += '\n=== DIRECTIVES SKILL: JOSEPH EDIT SKILLS (17 Règles d\'Or) ===\n' + fs.readFileSync(designSkillPath, 'utf8') + '\n';
        }
        if (fs.existsSync(physicsSkillPath)) {
            text += '\n=== DIRECTIVES SKILL: ANIMATION 2D & PHYSIQUE GÉOMÉTRIQUE ===\n' + fs.readFileSync(physicsSkillPath, 'utf8') + '\n';
        }

        // Chargement automatique des nouveaux skills personnalisés (.agents/skills/My_Skills/)
        const mySkillsDir = path.join(agentSkillsDir, 'My_Skills');
        if (fs.existsSync(mySkillsDir)) {
            for (const sub of fs.readdirSync(mySkillsDir)) {
                const subSkillPath = path.join(mySkillsDir, sub, 'SKILL.md');
                if (fs.existsSync(subSkillPath)) {
                    text += `\n=== DIRECTIVES SKILL: ${sub.toUpperCase()} ===\n` + fs.readFileSync(subSkillPath, 'utf8') + '\n';
                }
            }
        }
        return text;
    } catch (e) {
        console.warn('Erreur chargement skills:', e.message);
        return '';
    }
}

// Helper pour inspecter et charger les consignes du template sélectionné (06_Templates/)
function loadTemplateDirectives(chosenTemplate) {
    if (!chosenTemplate || chosenTemplate === 'none' || chosenTemplate === 'libre') return null;
    try {
        const templatesDir = path.join(ROOT_DIR, '06_Templates');
        if (!fs.existsSync(templatesDir)) return null;
        const files = fs.readdirSync(templatesDir);
        const norm = chosenTemplate.toLowerCase().replace(/[^a-z0-9]/g, '');
        const found = files.find(f => {
            const fNorm = f.toLowerCase().replace(/\.html$/i, '').replace(/[^a-z0-9]/g, '');
            return fNorm === norm || fNorm.includes(norm) || norm.includes(fNorm);
        });
        if (found) {
            const content = fs.readFileSync(path.join(templatesDir, found), 'utf8');
            const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/i);
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            return {
                fileName: found,
                styleSnippet: styleMatch ? styleMatch[1].trim() : '',
                htmlSnippet: bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim() : ''
            };
        }
    } catch (e) {
        console.warn('Erreur chargement template:', e.message);
    }
    return null;
}

// Helper pour charger les clés API
function loadApiConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {
        console.error('Erreur lecture api_config.json:', e);
    }
    return {};
}

// Extraction précise de la durée audio via FFmpeg
function getAudioDuration(filePath) {
    return new Promise((resolve) => {
        try {
            if (!filePath || !fs.existsSync(filePath)) return resolve(null);
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg')?.path || 'ffmpeg';
            execFile(ffmpegPath, ['-i', filePath], (err, stdout, stderr) => {
                const text = (stderr || '') + (stdout || '');
                const m = text.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
                if (m) {
                    const sec = parseFloat(m[1]) * 3600 + parseFloat(m[2]) * 60 + parseFloat(m[3]);
                    return resolve(Math.round(sec * 100) / 100);
                }
                resolve(null);
            });
        } catch (e) {
            resolve(null);
        }
    });
}

// Détection de la clarté d'une couleur (pour contraste automatique)
function isColorLight(colorStr) {
    if (!colorStr) return false;
    const clean = colorStr.toLowerCase().trim();
    if (clean === '#ffffff' || clean === 'white' || clean.includes('#f8') || clean.includes('#fa') || clean.includes('#f1') || clean.includes('#f5')) return true;
    if (clean === '#000000' || clean === 'black') return false;
    const m = clean.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
    if (m) {
        const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return luma > 140;
    }
    return false;
}

// Appel sécurisé à Google Gemini API (Multi-modèles, IPv4 forcé, timeout, retry)
async function callGeminiAPI(systemPrompt, userPrompt, temperature = 0.7) {
    const config = loadApiConfig();
    const apiKey = (config.google_api_key || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error("Clé API Google Gemini manquante. Veuillez la configurer dans Paramètres (settings.html) ou via la variable d'environnement GOOGLE_API_KEY.");
    }

    const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];
    let lastError = null;

    for (const model of candidateModels) {
        try {
            const result = await new Promise((resolve, reject) => {
                const postData = JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: userPrompt }]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: temperature
                    }
                });

                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    method: 'POST',
                    family: 4, // Forcer IPv4
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    },
                    timeout: 25000
                };

                const req = https.request(options, (res) => {
                    let body = '';
                    res.on('data', chunk => { body += chunk; });
                    res.on('end', () => {
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            return reject(new Error(`Gemini API HTTP ${res.statusCode} (${model}): ${body.slice(0, 200)}`));
                        }
                        try {
                            const data = JSON.parse(body);
                            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (!candidateText) {
                                return reject(new Error(`Réponse Gemini vide (${model})`));
                            }
                            const parsedJson = JSON.parse(candidateText);
                            resolve(parsedJson);
                        } catch (e) {
                            reject(new Error(`Erreur parsing JSON Gemini (${model}): ${e.message}`));
                        }
                    });
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error(`Timeout (25s) lors de l'appel Gemini (${model})`));
                });

                req.on('error', (err) => {
                    reject(err);
                });

                req.write(postData);
                req.end();
            });

            return result;
        } catch (err) {
            console.warn(`[Gemini Model Fallback] Échec avec ${model} (${err.message}). Tentative modèle suivant...`);
            lastError = err;
        }
    }

    throw lastError || new Error("Tous les modèles Gemini ont échoué.");
}

// Extraction d'un slug court, clair et pertinent (2 à 3 mots clés du sujet, max 4 mots)
function extractCleanSlug(text, maxWords = 3) {
    if (!text || typeof text !== 'string') return 'video';
    const stopWords = new Set([
        'concois', 'cree', 'creer', 'creez', 'generer', 'genere', 'faire', 'fais', 'fait', 'animation', 'motion', 'design',
        'video', 'clip', 'secondes', 'seconde', 'sec', 'pour', 'dans', 'avec', 'sur', 'au',
        'aux', 'style', 'de', 'du', 'des', 'un', 'une', 'le', 'la', 'les', 'et', 'en', 'par',
        'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
        'moi', 'toi', 'lui', 'nous', 'vous', 'leur', 'je', 'tu', 'il', 'elle', 'on', 'ils', 'elles', 'me', 'te', 'se',
        'qui', 'que', 'quoi', 'dont', 'ou', 'est', 'sont', 'comme', 'plus', 'tres', 'bien',
        'dune', 'dun', 'afin', 'vers', 'sous', 'sans', 'tout', 'tous', 'toute', 'toutes',
        'nouvelle', 'nouveau', 'presentation', 'presente', 'montre', 'montrer', 'illustre', 'affiche', 'donne', 'donner',
        'part', 'dure', 'durant', 'temps', 'autour', 'produis', 'produire', 'realise', 'realiser',
        'create', 'make', 'generate', 'video', 'for', 'with', 'about', 'from', 'into', 'the', 'a', 'an'
    ]);
    const clean = text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s_-]/g, ' ')
        .replace(/[-_\s]+/g, ' ')
        .trim();

    let words = clean.split(' ').filter(w => w.length > 1 && !stopWords.has(w) && !/^\d+s?$/.test(w));
    if (words.length === 0) {
        words = clean.split(' ').filter(w => w.length > 2);
    }
    const finalWords = words.slice(0, Math.min(words.length, Math.max(2, maxWords)));
    return (finalWords.length > 0 ? finalWords.join('_') : 'video').slice(0, 35);
}

function sanitizeFilename(name) {
    return extractCleanSlug(name, 3);
}

// Création récursive de dossiers
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * MOTEUR PRINCIPAL D'EXÉCUTION DU PIPELINE
 * @param {object} payload - Données du formulaire create_video.html
 * @param {function} onProgress - Callback (stepId, phaseLabel, percent, logMsg, logType)
 */
async function runAiVideoPipeline(payload, onProgress = () => { }) {
    const startTime = Date.now();
    const prompt = (payload.prompt || '').trim();
    const channelId = (payload.channelId || payload.channel || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const isChannel = Boolean(channelId);
    const format = ['16:9', '9:16', '1:1'].includes(payload.format) ? payload.format : '16:9';

    // Détection de durée demandée dans le brief (ex: "20 secondes", "30s", "15 sec")
    let promptDuration = null;
    const durMatch = prompt.match(/(\d+)\s*(?:secondes?|secs?|s)\b/i);
    if (durMatch) {
        const parsed = parseInt(durMatch[1], 10);
        if (parsed >= 4 && parsed <= 120) {
            promptDuration = parsed;
        }
    }

    // Prise en compte du script horodaté fourni par l'utilisateur
    const customScript = (payload.customScript || payload.script || '').trim();
    const hasCustomScript = Boolean(payload.hasCustomScript || customScript.length > 0);

    // Si une durée n'a pas été trouvée dans le prompt textuel mais qu'un script est fourni,
    // on déduit la durée à partir du dernier timestamp trouvé dans le script (ex: "[00:20 - 00:30]" => 30s)
    if (!promptDuration && hasCustomScript) {
        const tsMatches = [...customScript.matchAll(/\[?\s*(\d{1,2}):(\d{2})\s*(?:-|à|to)\s*(\d{1,2}):(\d{2})\s*\]?/gi)];
        if (tsMatches.length > 0) {
            const lastMatch = tsMatches[tsMatches.length - 1];
            const endMinutes = parseInt(lastMatch[3], 10) || 0;
            const endSeconds = parseInt(lastMatch[4], 10) || 0;
            const calculatedDuration = endMinutes * 60 + endSeconds;
            if (calculatedDuration >= 4 && calculatedDuration <= 180) {
                promptDuration = calculatedDuration;
            }
        }
    }

    // Préfixe relatif des assets selon l'emplacement du fichier généré
    const assetPrefix = isChannel ? '../../01_Assets' : '../01_Assets';

    // Génération du suffixe unique strict (règle .agents/rules/project-architecture.md)
    let suffix = '';
    if (isChannel) {
        suffix = channelId.includes('_') ? '_' + channelId.split('_').pop() : '-ch';
    } else {
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        suffix = `-${rand4}`;
    }

    // Nom de base court, percutant et propre (2 à 3 mots, max 4 mots) extrait directement du sujet complet
    let baseRawName = extractCleanSlug(prompt, 3);
    if (!baseRawName || baseRawName === 'video' || baseRawName.length < 3) {
        baseRawName = extractCleanSlug(payload.fileName || '', 3);
    }
    if (!baseRawName || baseRawName === 'video') baseRawName = `video_${Date.now().toString().slice(-4)}`;
    baseRawName = baseRawName.replace(/\.html$/i, '');
    let finalFileName = `${baseRawName}${suffix}.html`;

    // Chemins cibles
    const baseProjectDir = ROOT_DIR;
    const videosTargetDir = isChannel
        ? path.join(baseProjectDir, '03_Chaines', channelId)
        : path.join(baseProjectDir, '04_Videos');
    ensureDir(videosTargetDir);
    let finalFilePath = path.join(videosTargetDir, finalFileName);
    let relVideoPath = isChannel
        ? `03_Chaines/${channelId}/${finalFileName}`
        : `04_Videos/${finalFileName}`;

    // Dimensions
    let width = 1920, height = 1080;
    if (format === '9:16') { width = 1080; height = 1920; }
    else if (format === '1:1') { width = 1080; height = 1080; }

    const audioSetup = payload.audioSetup || 'full_mix';
    const hasVoice = (audioSetup === 'voice_only' || audioSetup === 'full_mix');
    const hasMusic = (audioSetup === 'music_only' || audioSetup === 'full_mix');
    const showSubtitles = payload.subtitles !== false && hasVoice;

    // Détection en amont des caractéristiques pour construire la matrice des étapes 100% réelles
    const chosenTemplate = payload.template || payload.style;
    const isUsingTemplate = Boolean(chosenTemplate && chosenTemplate !== 'none' && chosenTemplate !== 'libre');
    const normPromptPre = prompt.toLowerCase();
    const hasWebCapturePre = Boolean(prompt.match(/https?:\/\/[^\s\)\],;]+/i) || prompt.match(/\b([a-zA-Z0-9-]+\.(?:com|io|fr|org|net|co|ai|dev|app|tech|me))\b/i));
    const hasBrandPre = /logo|marque|apple|nike|tesla|google|meta|amazon|rolex|spotify|netflix|adidas|porsche|ferrari|bmw|audi/i.test(normPromptPre);
    const hasFlagPre = /france|français|japon|japan|usa|états-unis|suisse|switzerland|allemagne|germany|brésil|brazil|chine|china|italie|italy|espagne|spain|royaume-uni|angleterre|canada|maroc|algérie|sénégal|drapeau|pays|nation/i.test(normPromptPre);
    const hasMapPre = /carte|map|satellite|géographie|territoire|capitale|ville|localisation/i.test(normPromptPre);
    const hasChromaPre = (payload.images && payload.images.some(img => /green|vert|fond_vert|chroma/i.test(typeof img === 'string' ? img : img.name))) || /detour|fond vert|chroma/i.test(normPromptPre);

    // CONSTRUCTION DE LA MATRICE VÉRIDIQUE DES ÉTAPES ACTIVES (Zéro fake step)
    const pipelineSteps = [
        {
            id: 'step_init',
            title: isChannel ? `Initialisation de la vidéo pour la chaîne "${channelId}"` : "Initialisation du projet vidéo autonome (04_Videos/)",
            desc: `Attribution du nom "${finalFileName}" et calibrage ${format} (${width}x${height}).`
        },
        {
            id: 'step_skills',
            title: "Lecture & Intégration des Skills (00_Skills/)",
            desc: "Consultation des directives de design 80/20, 60/30/10, contraste et physique 2D."
        },
        {
            id: 'step_prompt',
            title: "Réflexion, Direction Artistique & Découpage Narratif (Gemini)",
            desc: "Gemini analyse le brief, conçoit le storyboard, choisit la palette et inventorie les besoins."
        }
    ];

    if (isUsingTemplate) {
        pipelineSteps.push({
            id: 'step_template',
            title: `Inspection des Consignes du Template (${chosenTemplate})`,
            desc: `Analyse des règles de style et des composants dans 06_Templates/${chosenTemplate}.`
        });
    }

    if (isChannel) {
        pipelineSteps.push({
            id: 'step_brandkit',
            title: `Application du Brand Kit de la Chaîne (${channelId})`,
            desc: "Harmonisation des polices primaires et des couleurs signatures de la chaîne."
        });
    }

    if (hasWebCapturePre) {
        pipelineSteps.push({
            id: 'step_web_record',
            title: "Capture d'écran HD du Site Web (07_Scripts/record_web.cjs)",
            desc: "Capture automatisée haute fidélité du site pour intégration au mockup."
        });
    }

    if (hasBrandPre) {
        pipelineSteps.push({
            id: 'step_logo',
            title: "Récupération du Logo Officiel (07_Scripts/brandfetch.cjs)",
            desc: "Téléchargement du logo officiel vectoriel SVG ou PNG haute définition."
        });
    }

    if (hasFlagPre) {
        pipelineSteps.push({
            id: 'step_flag',
            title: "Récupération du Drapeau Vectoriel (07_Scripts/fetch_flag.cjs)",
            desc: "Téléchargement du drapeau national officiel SVG sans watermark."
        });
    }

    if (hasMapPre) {
        pipelineSteps.push({
            id: 'step_map',
            title: "Génération de Carte Géographique (07_Scripts/fetch_map.cjs)",
            desc: "Rendu de la carte satellite et tracé territorial haute résolution."
        });
    }

    if (hasChromaPre) {
        pipelineSteps.push({
            id: 'step_chroma',
            title: "Détourage Fond Vert Chroma Key (07_Scripts/chroma_key.cjs)",
            desc: "Extraction du sujet transparent et suppression instantanée du fond vert."
        });
    }

    if (hasVoice) {
        if (payload.hasUserVoice && payload.voiceover) {
            pipelineSteps.push({
                id: 'step_voice_user',
                title: "Indexation & Mesure de la Voix Off Fournie",
                desc: "Mesure précise de la durée audio via FFmpeg et calage rythmique."
            });
        } else {
            pipelineSteps.push({
                id: 'step_voice_tts',
                title: "Synthèse Vocale IA ElevenLabs (07_Scripts/generate_voice.cjs)",
                desc: "Génération vocale haute expressivité et mesure exacte de la durée via FFmpeg."
            });
        }
    }

    if (hasMusic) {
        pipelineSteps.push({
            id: 'step_music',
            title: "Mixage de la Musique d'Ambiance & Ducking",
            desc: "Sélection de la piste d'ambiance et équilibrage automatique sous la voix."
        });
    }

    if (showSubtitles) {
        pipelineSteps.push({
            id: 'step_subtitles',
            title: "Synchronisation Dynamique des Sous-Titres Mot-à-Mot",
            desc: "Calage temporel exact pondéré sur la cadence vocale (style Hormozi)."
        });
    }

    pipelineSteps.push({
        id: 'step_gsap_code',
        title: "Génération Dynamique du Code (HTML, CSS & GSAP) par Gemini",
        desc: "Création autonome du design vectoriel, timeline GSAP fluide et scène 1 immédiatement visible."
    });

    pipelineSteps.push({
        id: 'step_disk_save',
        title: isChannel ? `Sauvegarde dans 03_Chaines/${channelId}/` : "Sauvegarde dans 04_Videos/",
        desc: "Enregistrement physique de la vidéo unique complète (aucun fichier loose dans 05_Scenes/)."
    });

    pipelineSteps.push({
        id: 'step_studio_ready',
        title: "Ouverture dans le Studio de Montage",
        desc: "Liaison au lecteur interactif et synchronisation des pistes audio."
    });

    // 1. Initialiser le fichier avec status: "processing"
    onProgress('step_init', 'Initialisation du pipeline IA...', 5, `Initialisation de la vidéo : ${finalFileName}`, 'info', { steps: pipelineSteps });

    const initialConfigHeader = `<!DOCTYPE html>
<!-- STATUT TEMPORAIRE : CRÉATION EN COURS PAR L'IA -->
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${baseRawName}</title>
</head>
<body>
    <script>
        window.VIDEO_CONFIG = {
            id: "vid_${Date.now()}",
            title: "${(prompt.slice(0, 40) || baseRawName).replace(/"/g, '\\"')}",
            suffix: "${suffix}",
            status: "processing",
            processUrl: "video_processus.html?video=${encodeURIComponent(relVideoPath)}",
            createdAt: ${Date.now()},
            format: "${format}",
            duration: ${(promptDuration || 20.0).toFixed(1)}
        };
        var VIDEO_CONFIG = window.VIDEO_CONFIG;
    </script>
</body>
</html>`;
    fs.writeFileSync(finalFilePath, initialConfigHeader, 'utf8');

    // 2. ÉTAPE : LECTURE DES SKILLS (00_Skills/)
    onProgress('step_skills', 'Chargement des Skills de design et physique 2D...', 10, 'Lecture approfondie de 00_Skills/video_design_mastery/ et 00_Skills/animation_2d_physics/...', 'info', { steps: pipelineSteps });
    const skillsDirectives = loadSkillsDirectives();

    // 3. ÉTAPE : INSPECTION DU TEMPLATE S'IL Y A LIEU (06_Templates/)
    let templateDirectives = null;
    if (isUsingTemplate) {
        onProgress('step_template', `Inspection du template "${chosenTemplate}"...`, 13, `Lecture des consignes architecturales de 06_Templates/ pour "${chosenTemplate}"...`, 'info', { steps: pipelineSteps });
        templateDirectives = loadTemplateDirectives(chosenTemplate);
    }

    // 4. ÉTAPE : Planification & Direction Artistique Gemini
    onProgress('step_prompt', 'Gemini analyse le brief et conçoit le storyboard...', 16, `Gemini (Google AI Studio) : analyse sémantique, direction artistique & inventaire des besoins...`, 'info', { steps: pipelineSteps });

    const systemPrompt = `Tu es le Directeur Créatif et Motion Designer en chef de VibeEditor.
Tu dois analyser le brief utilisateur, intégrer les skills professionnels et concevoir une vidéo d'une qualité cinématique exceptionnelle sans code dur ni solution stéréotypée.

${skillsDirectives ? `DIRECTIVES SKILLS OFFICIELS (00_Skills/) :\n${skillsDirectives}\n` : ''}

${templateDirectives ? `DIRECTIVES DU TEMPLATE CHOISI (${chosenTemplate}) - 06_Templates/${templateDirectives.fileName} :
Inspire-toi des principes structurels et visuels de ce template pour concevoir la vidéo sans pour autant reproduire de code rigide :
CSS du template :
${templateDirectives.styleSnippet.slice(0, 1000)}
` : ''}

RÈGLES CRÉATIVES ET DIRECTION ARTISTIQUE :
1. LIBERTÉ & MAÎTRISE DU FOND (Arrière-plans adaptés à chaque scène) :
   - Le fond de base N'EST PAS strictement limité au noir ou au blanc. Le noir et le blanc sont d'excellentes bases neutres et contrastées, mais le fond doit s'adapter à la dynamique de chaque scène et au style de la vidéo :
     * Fond Noir pur ou obsidienne (#000000, #08080a, #0c0c10)
     * Fond Blanc pur ou ivoire/studio (#ffffff, #f8fafc, #f5f5f7)
     * Fond de Couleur Unie spécifique au sujet (ex: bordeaux/rouge nuit #2b0b0b, vert forêt sombre #062016, terre brûlée #20120c, terracotta, beige chaud...)
     * Fond Dégradé élégant (dégradé linéaire studio 135deg, radial spotlight cinématique, subtil mesh gradient)
   - BANNISSEMENT ABSOLU DU FOND BLEU ARDOISE / NAVY (#0f172a, #1e293b, #0b1329) PAR DÉFAUT :
     Ne mets JAMAIS de fond bleu sauf si le prompt de l'utilisateur demande explicitement la couleur bleue ! Pour un univers technologique ou SaaS, utilise un Noir Pur (#000000) ou Noir Obsidienne (#08080a).
   - VARIATION PAR SCÈNE :
     Un clip ou une scène peut avoir son propre fond pour marquer une transition narrative (ex: Scène 1 fond sombre pour l'accroche mystérieuse, Scène 2 fond contrasté ou carte unie pour l'explication, Scène 3 fond dynamique pour la conclusion).
   - EXIGENCE DE COHÉRENCE GLOBALE :
     Toute la vidéo doit rester visuellement harmonieuse : même typographie (Dual-Font 80/20), même couleur d'accent signature (10%), et contraste impeccable (texte clair sur fond sombre, texte sombre sur fond clair).
   - BANNISSEMENT ABSOLU du fond cliché IA (la grille 1px avec halo vert/cyan répété partout).

2. CHARTE HARMONIQUE STRICTE : RÈGLE 60-30-10 :
   - 60% : Fond dominant (uni ou dégradé).
   - 30% : Surfaces, cartes, bordures et texte secondaire.
   - 10% : UNE SEULE couleur d'accent vive signature (ex: Ambre #f59e0b, Cyan électrique #06b6d4, Émeraude #10b981, Cramoisi #ef4444).

3. BANNISSEMENT ABSOLU DES TITRAGES SCOLAIRES / BADGES POWERPOINT :
   - INTERDIT formellement d'ajouter des étiquettes didactiques comme [ Règle Fondamentale • 01 ], [ Lois du Jeu ], [ Chapitre 1 ], [ Étape 01 ] ou des conteneurs .tag-pill.
   - Utilise un copywriting percutant, immersif et axé sur le spectateur.

4. DÉTECTION AUTONOME DES OUTILS REQUIS :
   - Si le sujet concerne une marque ou entreprise : brandLogo = true, brandDomain = "domaine.com".
   - Si le sujet concerne une ville, région ou localisation géographique : map = true, mapQuery = "Ville, Pays".
   - Si le sujet concerne un pays, une nationalité, un événement international, la géopolitique, une comparaison entre nations : flag = true, country = "Nom du pays (ex: France, Japon, Suisse, etc.)".

Tu dois répondre UNIQUEMENT par un objet JSON valide avec cette structure exacte :
{
  "title": "Titre percutant de la vidéo",
  "slug": "2 a 3 mots cles courts representant le sujet (ex: saas_dashboard, rolex_submariner, ferrari_italie)",
  "pitch": "Résumé en une phrase",
  "targetDuration": ${(promptDuration || 20.0).toFixed(1)},
  "background": {
    "type": "black", // "black" | "white" | "solid" | "gradient"
    "global": "#000000", // Couleur CSS ou dégradé (ex: #000000, #08080a, #ffffff - BANNIR les bleus #0f172a / #0b1329)
    "textMain": "#ffffff", // #ffffff sur fond sombre, #09090b sur fond clair
    "textMuted": "#94a3b8" // #94a3b8 sur fond sombre, #475569 sur fond clair
  },
  "theme": {
    "primaryColor": "#000000",
    "secondaryColor": "#111116",
    "accentColor": "#f59e0b",
    "fontTitle": "Outfit",
    "fontBody": "Inter"
  },
  "narration": "Texte complet de la voix off narrative en français, dynamique et captivant (environ 30 à 45 mots pour 15s)",
  "toolsNeeded": {
    "voiceTts": true,
    "brandLogo": false,
    "brandDomain": "",
    "map": false,
    "mapQuery": "",
    "flag": false,
    "country": "",
    "coverrBroll": false,
    "coverrQuery": ""
  },
  "scenes": [
    {
      "id": 1,
      "title": "Nom de la scène",
      "concept": "Idée visuelle originale adaptée au sujet",
      "headline": "TITRE PRINCIPAL",
      "headlineAccent": "MOT-CLÉ ACCENTUÉ",
      "subtitle": "Phrase secondaire d'accompagnement",
      "background": "" // Optionnel: fond CSS spécifique pour cette scène si différent du global
    }
  ]
}`;

    const userPromptText = `PROJET VIDÉO À CRÉER :
- Brief / Sujet : "${prompt}"
- Format demandé : ${format} (${width}x${height})
- Durée ciblée : ${promptDuration ? promptDuration + ' secondes (demandée explicitement dans le brief)' : '15 à 20 secondes'}
- Audio souhaité : ${audioSetup} (Voix: ${hasVoice ? 'OUI' : 'NON'}, Musique: ${hasMusic ? 'OUI' : 'NON'})
- Sous-titres demandés : ${showSubtitles ? 'OUI' : 'NON'}
- Images fournies par l'utilisateur : ${JSON.stringify(payload.images || [])}
- Style sélectionné : ${payload.template || payload.style || 'Libre (sans template)'}
- Chaîne associée : ${channelId || 'Aucune (vidéo autonome)'}
- Fond de base imposé par l'utilisateur : ${payload.backgroundType || 'black'} (${payload.backgroundType === 'white' ? 'Blanc pur #ffffff' : (payload.backgroundType === 'solid' ? (payload.backgroundColor || '#111827') : (payload.backgroundType === 'gradient' ? (payload.backgroundGradient || 'Dégradé') : 'Noir pur #000000'))})
${hasCustomScript ? `
- SCRIPT HORODATÉ FOURNI PAR L'UTILISATEUR (OBLIGATOIRE ET STRICTEMENT RESPECTÉ) :
"""
${customScript}
"""
CONSIGNE IMPÉRATIVE SUR LE SCRIPT :
L'utilisateur a fourni un script horodaté précis ci-dessus.
1. Tu DOIS découper les scènes dans "scenes" pour qu'elles correspondent exactement aux tranches horaires et aux concepts visuels du script.
2. Pour le champ "narration", rassemble et utilise fidèlement les répliques voix indiquées dans le script horodaté.
` : ''}

Conçois le plan narratif, la direction artistique et détermine les outils externes nécessaires (logos, drapeaux, cartes). Réponds UNIQUEMENT en JSON.`;

    let plan = null;
    try {
        plan = await callGeminiAPI(systemPrompt, userPromptText, 0.7);
        onProgress('step_prompt', 'Plan narratif validé par Gemini !', 25, `Plan généré : "${plan.title}" (${plan.scenes?.length || 3} scènes, fond : ${plan.background?.type || 'libre'})`, 'success');
    } catch (geminiError) {
        console.warn("[Gemini API Fallback] Erreur appel Gemini direct :", geminiError.message);
        onProgress('step_prompt', 'Génération du plan narratif en mode résilient...', 25, `Gemini fallback: ${geminiError.message}`, 'warning');

        let fallbackNarration = `${prompt}. Découvrez cette histoire fascinante en quelques secondes.`;
        if (hasCustomScript) {
            const voiceLines = customScript
                .split('\n')
                .filter(l => /^(?:voix|voice|narrateur)\s*:/i.test(l.trim()))
                .map(l => l.replace(/^(?:voix|voice|narrateur)\s*:\s*/i, '').trim());
            if (voiceLines.length > 0) {
                fallbackNarration = voiceLines.join(' ');
            }
        }

        plan = {
            title: prompt.slice(0, 45) || baseRawName,
            slug: baseRawName,
            pitch: prompt || 'Composition vidéo dynamique',
            targetDuration: promptDuration || 20.0,
            background: {
                type: payload.backgroundType || 'black',
                global: '#000000',
                textMain: '#ffffff',
                textMuted: '#94a3b8'
            },
            theme: {
                primaryColor: '#000000',
                secondaryColor: '#121217',
                accentColor: '#f59e0b',
                fontTitle: 'Outfit',
                fontBody: 'Inter'
            },
            narration: fallbackNarration,
            toolsNeeded: {
                voiceTts: hasVoice,
                brandLogo: /logo|marque|apple|nike|tesla|google|meta|amazon|rolex/i.test(prompt),
                brandDomain: /nike/i.test(prompt) ? 'nike.com' : (/rolex/i.test(prompt) ? 'rolex.com' : (/apple/i.test(prompt) ? 'apple.com' : '')),
                map: /carte|map|pays|ville|paris|tokyo|france/i.test(prompt),
                mapQuery: 'Paris, France',
                flag: /suisse|france|japon|etats-unis|usa|bresil|allemagne|chine/i.test(prompt),
                country: 'France',
                coverrBroll: false,
                coverrQuery: ''
            },
            scenes: [
                {
                    id: 1,
                    title: "L'Accroche",
                    concept: "Typographie monumentale et choc initial",
                    headline: "DÉCOUVREZ L'HISTOIRE",
                    headlineAccent: "L'HISTOIRE",
                    subtitle: "Ce que personne n'avait anticipé"
                },
                {
                    id: 2,
                    title: "Le Cœur du Sujet",
                    concept: "Infographie et mise en lumière des données",
                    headline: "L'IMPACT FONDAMENTAL",
                    headlineAccent: "FONDAMENTAL",
                    subtitle: "Une transformation radicale"
                },
                {
                    id: 3,
                    title: "La Révélation Finale",
                    concept: "Conclusion cinématique centrée",
                    headline: "LE FUTUR COMMENCE",
                    headlineAccent: "MAINTENANT",
                    subtitle: "La conclusion incontournable"
                }
            ]
        };
    }

    // Affinage du nom de fichier avec le slug court de Gemini si non imposé par l'utilisateur
    if (!payload.fileName && plan && plan.slug) {
        const geminiSlug = extractCleanSlug(plan.slug, 3);
        if (geminiSlug && geminiSlug !== 'video' && geminiSlug !== baseRawName) {
            const oldFilePath = finalFilePath;
            baseRawName = geminiSlug;
            finalFileName = `${baseRawName}${suffix}.html`;
            finalFilePath = path.join(videosTargetDir, finalFileName);
            relVideoPath = isChannel
                ? `03_Chaines/${channelId}/${finalFileName}`
                : `04_Videos/${finalFileName}`;
            if (fs.existsSync(oldFilePath) && oldFilePath !== finalFilePath) {
                try { fs.unlinkSync(oldFilePath); } catch (e) { }
            }
        }
    }

    // Heuristiques proactives pour s'assurer qu'aucun outil nécessaire n'est oublié
    const normPrompt = prompt.toLowerCase();

    // 3. ÉTAPE : BRAND KIT DE LA CHAÎNE (Si rattachée)
    if (isChannel) {
        onProgress('step_brandkit', 'Application du Brand Kit de la chaîne...', 32, `Application des couleurs et polices de la chaîne "${channelId}"`, 'info');
        try {
            const channelsFile = path.join(ROOT_DIR, '07_Scripts', 'channels.json');
            if (fs.existsSync(channelsFile)) {
                const channelsData = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
                const list = Array.isArray(channelsData) ? channelsData : (channelsData.channels || []);
                const myChan = list.find(c => c.id === channelId);
                if (myChan) {
                    const primary = myChan.colorPrimary || myChan.brandKit?.colorPrimary;
                    const fontTitle = myChan.fontPrimary || myChan.brandKit?.fontTitle;
                    if (primary) plan.theme.accentColor = primary;
                    if (fontTitle) plan.theme.fontTitle = fontTitle;
                }
            }
        } catch (e) { }
    }

    // 4. ÉTAPE : OUTILS EXTERNES (CAPTURE WEB, LOGOS, DRAPEAUX, CARTES)
    // 4.0 DÉTECTION DE SITES WEB & CAPTURE D'ÉCRAN HD (07_Scripts/record_web.cjs)
    let downloadedWebCapturePath = '';
    let detectedUrl = null;
    let detectedDomain = null;
    const urlMatch = prompt.match(/https?:\/\/[^\s\)\],;]+/i);
    if (urlMatch) {
        detectedUrl = urlMatch[0];
        try {
            detectedDomain = new URL(detectedUrl).hostname.replace(/^www\./, '').toLowerCase();
        } catch (e) { }
    } else {
        const domainMatch = prompt.match(/\b([a-zA-Z0-9-]+\.(?:com|io|fr|org|net|co|ai|dev|app|tech|me))\b/i);
        if (domainMatch) {
            detectedDomain = domainMatch[1].toLowerCase();
            detectedUrl = `https://${detectedDomain}`;
        }
    }

    if (detectedUrl) {
        onProgress('step_web_record', `Capture d'écran HD du site (${detectedUrl})...`, 35, `07_Scripts/record_web.cjs : capture en cours de ${detectedUrl}...`, 'info');
        try {
            const webSlug = extractCleanSlug(detectedDomain || 'website', 2);
            const webImgName = `web_${webSlug}${suffix}.png`;
            const webImgDir = isChannel ? path.join(ROOT_DIR, '01_Assets', 'Images', channelId) : path.join(ROOT_DIR, '01_Assets', 'Images');
            ensureDir(webImgDir);
            const webImgFull = path.join(webImgDir, webImgName);
            const recordScript = path.join(ROOT_DIR, '07_Scripts', 'record_web.cjs');
            await execAsync(`node "${recordScript}" --url "${detectedUrl}" --mode image --out "${webImgFull}"`, 35000);
            if (fs.existsSync(webImgFull)) {
                downloadedWebCapturePath = isChannel ? `${assetPrefix}/Images/${channelId}/${webImgName}` : `${assetPrefix}/Images/${webImgName}`;
                onProgress('step_web_record', 'Capture HD du site web prête !', 37, `Capture enregistrée : ${downloadedWebCapturePath}`, 'success');
            }
        } catch (webErr) {
            console.warn("Erreur record_web :", webErr.message);
        }
    }

    // 4.1 LOGOS DE MARQUES & SITES WEB (07_Scripts/brandfetch.cjs)
    let downloadedLogoPath = '';
    let brandDomain = plan.toolsNeeded?.brandDomain || detectedDomain;
    if (!brandDomain) {
        const brandDict = {
            'rolex': 'rolex.com', 'nike': 'nike.com', 'apple': 'apple.com', 'tesla': 'tesla.com',
            'google': 'google.com', 'amazon': 'amazon.com', 'meta': 'meta.com', 'microsoft': 'microsoft.com',
            'spotify': 'spotify.com', 'netflix': 'netflix.com', 'lego': 'lego.com', 'adidas': 'adidas.com',
            'porsche': 'porsche.com', 'ferrari': 'ferrari.com', 'bmw': 'bmw.com', 'audi': 'audi.com'
        };
        for (const [k, v] of Object.entries(brandDict)) {
            if (new RegExp(`\\b${k}\\b`, 'i').test(normPrompt)) { brandDomain = v; break; }
        }
    }

    if (brandDomain) {
        onProgress('step_logo', `Téléchargement du logo officiel pour ${brandDomain}...`, 38, `07_Scripts/brandfetch.cjs : récupération du logo ${brandDomain}...`, 'info');
        try {
            const brandScript = path.join(ROOT_DIR, '07_Scripts', 'brandfetch.cjs');
            await execAsync(`node "${brandScript}" ${brandDomain}`, 15000);
            const slug = brandDomain.replace(/\.com$|\.net$|\.org$|\.io$/, '').toLowerCase().replace(/[\s_]/g, '-');
            const cleanDomain = brandDomain.replace(/\./g, '_');

            // Chercher SVG ou Favicon PNG haute résolution
            const candidates = [
                path.join(ROOT_DIR, '01_Assets', 'Logos', `${slug}.svg`),
                path.join(ROOT_DIR, '01_Assets', 'Logos', `${slug}.png`),
                path.join(ROOT_DIR, '01_Assets', 'Logos', `${cleanDomain}_favicon.png`),
                path.join(ROOT_DIR, '01_Assets', 'Logos', `${slug}_favicon.png`)
            ];
            for (const cand of candidates) {
                if (fs.existsSync(cand)) {
                    downloadedLogoPath = `${assetPrefix}/Logos/${path.basename(cand)}`;
                    onProgress('step_logo', 'Logo récupéré avec succès !', 42, `Logo officiel trouvé : ${downloadedLogoPath}`, 'success');
                    break;
                }
            }
        } catch (e) {
            console.warn("Erreur brandfetch:", e.message);
        }
    }

    // 4.2 DRAPEAUX NATIONAUX & SYMBOLES
    let downloadedFlagPath = '';
    let flagTarget = plan.toolsNeeded?.country || plan.toolsNeeded?.flagCountry;
    if (!flagTarget) {
        const flagKeywords = [
            'france', 'français', 'japon', 'japan', 'usa', 'états-unis', 'suisse', 'switzerland',
            'allemagne', 'germany', 'brésil', 'brazil', 'chine', 'china', 'italie', 'italy',
            'espagne', 'spain', 'royaume-uni', 'angleterre', 'canada', 'maroc', 'algérie', 'sénégal'
        ];
        for (const fk of flagKeywords) {
            if (new RegExp(`\\b${fk}\\b`, 'i').test(normPrompt)) { flagTarget = fk; break; }
        }
    }

    if (flagTarget) {
        onProgress('step_flag', `Téléchargement du drapeau pour "${flagTarget}"...`, 45, `07_Scripts/fetch_flag.cjs : récupération du drapeau SVG...`, 'info');
        try {
            const flagRes = await fetchFlag(flagTarget);
            if (flagRes && (flagRes.svgPath || flagRes.pngPath)) {
                downloadedFlagPath = `${assetPrefix}/Flags/${path.basename(flagRes.svgPath)}`;
                onProgress('step_flag', 'Drapeau récupéré avec succès !', 48, `Drapeau (${flagRes.code}) prêt : ${flagRes.relSvgPath}`, 'success');
            }
        } catch (e) {
            console.warn("Erreur fetch_flag:", e.message);
        }
    }

    // 4.3 CARTES GÉOGRAPHIQUES
    let downloadedMapPath = '';
    let mapQuery = plan.toolsNeeded?.mapQuery;
    if (!mapQuery && /carte|map|satellite|géographie|pays|territoire|capitale|ville/i.test(normPrompt)) {
        mapQuery = flagTarget || prompt.split(/[,:.]/)[0];
    }

    if (mapQuery) {
        onProgress('step_map', 'Génération de la carte géographique haute résolution...', 50, `07_Scripts/fetch_map.cjs : carte pour "${mapQuery}"...`, 'info');
        try {
            const mapOut = path.join(ROOT_DIR, '01_Assets', 'Maps', `map_${sanitizeFilename(mapQuery)}${suffix}.png`);
            ensureDir(path.dirname(mapOut));
            const mapScript = path.join(ROOT_DIR, '07_Scripts', 'fetch_map.cjs');
            await execAsync(`node "${mapScript}" --query "${mapQuery}" --out "${mapOut}"`, 25000);
            if (fs.existsSync(mapOut)) {
                downloadedMapPath = `${assetPrefix}/Maps/${path.basename(mapOut)}`;
                onProgress('step_map', 'Carte satellite prête !', 54, `Carte enregistrée : 01_Assets/Maps/${path.basename(mapOut)}`, 'success');
            }
        } catch (e) {
            console.warn("Erreur fetch_map:", e.message);
        }
    }

    // 4.4 DÉTOURAGE FOND VERT (CHROMA KEY) DES IMAGES & VIDÉOS DU PROJET
    let processedChromaAssets = [];
    try {
        const { removeGreenScreen } = require('./chroma_key.cjs');
        const userImagesList = Array.isArray(payload.images) ? payload.images : [];
        for (const imgItem of userImagesList) {
            const imgName = typeof imgItem === 'string' ? imgItem : (imgItem.name || '');
            if (/green|vert|fond_vert|chroma/i.test(imgName) || /detour|fond vert|chroma/i.test(normPrompt)) {
                const rawImgPath = isChannel
                    ? path.join(ROOT_DIR, '01_Assets', 'Images', channelId, imgName)
                    : path.join(ROOT_DIR, '01_Assets', 'Images', imgName);

                if (fs.existsSync(rawImgPath)) {
                    onProgress('step_chroma', `Détourage fond vert de "${imgName}"...`, 56, `07_Scripts/chroma_key.cjs : suppression du fond vert...`, 'info');
                    const parsed = path.parse(rawImgPath);
                    const outChroma = path.join(parsed.dir, `${parsed.name}_detoure.png`);
                    await removeGreenScreen(rawImgPath, outChroma);
                    if (fs.existsSync(outChroma)) {
                        const relChroma = isChannel
                            ? `${assetPrefix}/Images/${channelId}/${path.basename(outChroma)}`
                            : `${assetPrefix}/Images/${path.basename(outChroma)}`;
                        processedChromaAssets.push(relChroma);
                        onProgress('step_chroma', 'Sujet fond vert détouré avec succès !', 57, `Sujet transparent prêt : ${relChroma}`, 'success');
                    }
                }
            }
        }
    } catch (chromaErr) {
        console.warn("Erreur pipeline chroma key :", chromaErr.message);
    }

    // 4.5 VIDÉOS DE STOCK B-ROLL (COVERR)
    let downloadedCoverrVideo = '';
    if (plan.toolsNeeded?.coverrBroll && plan.toolsNeeded?.coverrQuery) {
        try {
            const { searchAndDownloadCoverrVideo } = require('./coverr.cjs');
            const coverrDir = path.join(ROOT_DIR, '01_Assets', 'Videos');
            ensureDir(coverrDir);
            const coverrOut = path.join(coverrDir, `broll_${extractCleanSlug(plan.toolsNeeded.coverrQuery, 2)}${suffix}.mp4`);
            const brollRes = await searchAndDownloadCoverrVideo(plan.toolsNeeded.coverrQuery, coverrOut);
            if (brollRes && fs.existsSync(coverrOut)) {
                downloadedCoverrVideo = `${assetPrefix}/Videos/${path.basename(coverrOut)}`;
                onProgress('step_coverr', 'Vidéo stock B-roll téléchargée !', 57, `B-roll prêt : ${downloadedCoverrVideo}`, 'success');
            }
        } catch (coverrErr) {
            console.warn("Erreur téléchargement Coverr :", coverrErr.message);
        }
    }

    // 5. ÉTAPE : SYNTHÈSE VOCALE (VOICE TTS ELEVENLABS) + MESURE PRÉCISE FFmpeg
    let generatedVoiceRelPath = '';
    let voiceDurationSeconds = plan.targetDuration || 15.0;

    if (hasVoice) {
        if (payload.hasUserVoice && payload.voiceover) {
            onProgress('step_voice_user', 'Indexation de la voix off fournie...', 58, `Utilisation de la voix off fournie : ${payload.voiceover}`, 'info');
            generatedVoiceRelPath = isChannel
                ? `${assetPrefix}/Voix_Off/${channelId}/${payload.voiceover}`
                : `${assetPrefix}/Voix_Off/${payload.voiceover}`;

            const fullVoicePath = path.join(ROOT_DIR, isChannel ? `01_Assets/Voix_Off/${channelId}/${payload.voiceover}` : `01_Assets/Voix_Off/${payload.voiceover}`);
            const exactDur = await getAudioDuration(fullVoicePath);
            if (exactDur) voiceDurationSeconds = exactDur;
        } else {
            onProgress('step_voice_tts', 'Synthèse vocale IA ElevenLabs...', 58, `07_Scripts/generate_voice.cjs : synthèse de la narration ("${(plan.narration || '').slice(0, 35)}...")`, 'info');
            try {
                const voiceDir = isChannel
                    ? path.join(ROOT_DIR, '01_Assets', 'Voix_Off', channelId)
                    : path.join(ROOT_DIR, '01_Assets', 'Voix_Off');
                ensureDir(voiceDir);
                const voiceFile = `narration_${baseRawName}${suffix}.mp3`;
                const fullVoicePath = path.join(voiceDir, voiceFile);

                const { generateElevenLabs } = require('./generate_voice.cjs');
                const ttsRes = await generateElevenLabs({
                    text: plan.narration,
                    outputPath: fullVoicePath
                });

                if (ttsRes && fs.existsSync(fullVoicePath)) {
                    generatedVoiceRelPath = isChannel
                        ? `${assetPrefix}/Voix_Off/${channelId}/${voiceFile}`
                        : `${assetPrefix}/Voix_Off/${voiceFile}`;

                    // Mesure exacte de la durée via FFmpeg
                    const exactDur = await getAudioDuration(fullVoicePath);
                    if (exactDur && exactDur > 2.0) {
                        voiceDurationSeconds = exactDur;
                    } else {
                        const wordsCount = (plan.narration || '').split(/\s+/).length;
                        voiceDurationSeconds = Math.max(8.0, Math.round((wordsCount / 2.5) * 10) / 10);
                    }
                    onProgress('step_voice_tts', 'Voix off générée et mesurée !', 65, `Voix générée : ${voiceFile} (${voiceDurationSeconds.toFixed(1)}s)`, 'success');
                }
            } catch (voiceErr) {
                console.warn("[Voice TTS Warning] :", voiceErr.message);
                onProgress('step_voice_tts', 'Voix off prête en mode résilient.', 65, `Voix synthétisée en mode résilient.`, 'warning');
            }
        }
    }

    // 6. ÉTAPE : MUSIQUE D'AMBIANCE
    let musicRelPath = '';
    if (hasMusic) {
        onProgress('step_music', 'Mixage de la musique d\'ambiance et ducking...', 70, `Mixage musical : piste d'ambiance avec fondu sonore`, 'info');
        const defaultMusicFile = path.join(ROOT_DIR, '01_Assets', 'Musiques', 'Fresh___Funky.mp3');
        if (payload.music) {
            musicRelPath = isChannel ? `${assetPrefix}/Musiques/${channelId}/${payload.music}` : `${assetPrefix}/Musiques/${payload.music}`;
        } else if (fs.existsSync(defaultMusicFile)) {
            musicRelPath = `${assetPrefix}/Musiques/Fresh___Funky.mp3`;
        }
    }

    // Durée totale calculée avec précision (en tenant compte de la voix ou de la durée du brief)
    let totalVideoDuration = 20.0;
    if (hasVoice) {
        totalVideoDuration = Math.max(8.0, Math.ceil(voiceDurationSeconds + 1.0));
    } else {
        totalVideoDuration = promptDuration || plan.targetDuration || 20.0;
    }

    // 7. ÉTAPE : SOUS-TITRES DYNAMIQUES ULTRA-RÉACTIFS (CADENCE VOCALE CALIBRÉE)
    let subtitleCues = [];
    if (showSubtitles) {
        onProgress('step_subtitles', 'Calage temporel mot-à-mot des sous-titres...', 75, `Synchronisation vocale dynamique (style : ${payload.subtitleType || 'type-wordbyword'})`, 'info');

        const textToSub = plan.narration || `${prompt}. Composition générée par VibeEditor.`;
        const words = textToSub.split(/\s+/).filter(Boolean);
        const speechStart = 0.3; // Décalage naturel initial de la voix
        const speechEnd = Math.max(speechStart + 1.0, voiceDurationSeconds - 0.2);
        const availableSpeechDuration = speechEnd - speechStart;

        // Pondération intelligente par longueur de mot (un mot de 10 lettres dure plus qu'un mot de 2 lettres)
        const wordWeights = words.map(w => Math.max(1, Math.min(4, Math.ceil(w.replace(/[^a-zA-Z0-9]/g, '').length / 2.5))));
        const totalWeight = wordWeights.reduce((a, b) => a + b, 0);

        // Découpage en groupes percutants de 3 à 4 mots max
        const wordsPerGroup = 4;
        let wordIdx = 0;
        let currentSec = speechStart;

        while (wordIdx < words.length) {
            const groupWords = words.slice(wordIdx, wordIdx + wordsPerGroup);
            const groupWeights = wordWeights.slice(wordIdx, wordIdx + wordsPerGroup);

            const groupStart = Math.round(currentSec * 100) / 100;
            let runningWordTime = groupStart;

            const wordsWithTiming = groupWords.map((w, i) => {
                const wDuration = (groupWeights[i] / totalWeight) * availableSpeechDuration;
                const wStart = Math.round(runningWordTime * 100) / 100;
                const wEnd = Math.round((runningWordTime + wDuration) * 100) / 100;
                runningWordTime += wDuration;
                return {
                    word: w,
                    start: wStart,
                    end: wEnd
                };
            });

            const groupEnd = Math.round(runningWordTime * 100) / 100;
            currentSec = groupEnd;

            subtitleCues.push({
                start: groupStart,
                end: groupEnd,
                text: groupWords.join(' '),
                words: wordsWithTiming
            });

            wordIdx += wordsPerGroup;
        }
    }

    // 8. ÉTAPE : GESTION TEMPLATE vs CRÉATION LIBRE PAR L'IA (GÉNÉRATION DYNAMIQUE UNIFIÉE PAR GEMINI)
    onProgress('step_gsap_code', 'Génération dynamique du code (HTML, CSS, GSAP) par Gemini...', 85, isUsingTemplate ? `L'IA adapte l'archétype "${chosenTemplate}" au brief utilisateur...` : `L'IA conçoit une architecture visuelle sur-mesure pour "${prompt.slice(0, 30)}..."`, 'info');

    // Paramétrage flexible du fond (Blanc, Noir, Couleur unie, Dégradé)
    const userBgType = payload.backgroundType;
    const bgPlan = plan.background || {};
    let baseBg = bgPlan.global || plan.theme?.primaryColor || '#000000';
    if (userBgType === 'white') {
        baseBg = '#ffffff';
    } else if (userBgType === 'black') {
        baseBg = '#000000';
    } else if (userBgType === 'solid') {
        baseBg = payload.backgroundColor || '#111827';
    } else if (userBgType === 'gradient') {
        baseBg = payload.backgroundGradient || 'radial-gradient(ellipse at 50% 20%, #1c1d29 0%, #06070a 100%)';
    } else if (bgPlan.type === 'white') {
        baseBg = '#ffffff';
    } else if (bgPlan.type === 'black') {
        baseBg = '#000000';
    }

    // Neutraliser les bleus ardoise/navy indésirables non demandés seulement si l'utilisateur n'a pas explicitement choisi un fond uni ou dégradé
    if (!userBgType || userBgType === 'black') {
        if (typeof baseBg === 'string' && /#0f172a|#1e293b|#0b1329|#090d16|#071228/i.test(baseBg) && !/bleu|blue|cyan|navy/i.test(prompt)) {
            baseBg = '#000000';
        }
    }

    const isLight = isColorLight(baseBg);
    const mainTextColor = isLight ? '#09090b' : '#ffffff';
    const mutedTextColor = isLight ? '#475569' : '#94a3b8';
    const cardBgColor = isLight ? '#f8fafc' : '#0d1117';
    const cardBorderColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';
    const accentColor = plan.theme.accentColor || '#f59e0b';
    const fontTitle = plan.theme.fontTitle || 'Outfit';
    const fontBody = plan.theme.fontBody || 'Inter';

    // Configuration des sous-titres
    const subPos = payload.subtitlePosition || 'bottom';
    let subPosCss = 'bottom: 70px;';
    if (subPos === 'top') subPosCss = 'top: 80px;';
    else if (subPos === 'center') subPosCss = 'top: 50%; transform: translate(-50%, -50%);';

    const subFont = payload.subtitleCustomFont || payload.subtitleFont || 'Inter';
    const subBaseColor = payload.subtitleBaseColor || (isLight ? '#000000' : '#ffffff');
    const subAccentColor = payload.subtitleAccentColor || accentColor;
    const subBg = payload.subtitleBg !== false;
    const subBgColor = payload.subtitleBgColor || (isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)');
    const subRadius = payload.subtitleRadius !== undefined ? payload.subtitleRadius : 8;
    const subGlow = Boolean(payload.subtitleGlow);
    const subType = payload.subtitleType || 'type-wordbyword';

    const subBgStyle = subBg ? `background: ${subBgColor};` : 'background: transparent;';
    const subGlowStyle = subGlow ? `text-shadow: 0 0 16px ${subAccentColor};` : '';

    // Liste textuelle des assets disponibles pour le prompt
    const availableAssetsList = [];
    if (downloadedWebCapturePath) availableAssetsList.push(`- Capture d'écran HD du site/produit : "${downloadedWebCapturePath}" (à intégrer dans l'UI ou comme visuel principal)`);
    if (downloadedLogoPath) availableAssetsList.push(`- Logo officiel : "${downloadedLogoPath}" (format SVG vectoriel ou PNG haute résolution)`);
    if (downloadedFlagPath) availableAssetsList.push(`- Drapeau national officiel : "${downloadedFlagPath}" (format SVG vectoriel)`);
    if (downloadedMapPath) availableAssetsList.push(`- Carte géographique satellite : "${downloadedMapPath}" (format PNG HD)`);
    if (processedChromaAssets && processedChromaAssets.length > 0) availableAssetsList.push(`- Sujets détourés (sans fond vert, 100% transparents) : ${JSON.stringify(processedChromaAssets)}`);
    if (downloadedCoverrVideo) availableAssetsList.push(`- Vidéo de fond B-roll cinéma : "${downloadedCoverrVideo}"`);
    if (payload.images && payload.images.length > 0) availableAssetsList.push(`- Images fournies : ${JSON.stringify(payload.images)}`);

    // Instructions spécifiques de style selon le template choisi
    let templateInstructions = '';
    if (isUsingTemplate) {
        templateInstructions = `
7. RÈGLE MAÎTRESSE DE STYLE / TEMPLATE SÉLECTIONNÉ : "${chosenTemplate}"
L'utilisateur a explicitement sélectionné l'archétype visuel "${chosenTemplate}". Tu DOIS incarner ce style tout au long de la composition :
`;
        if (/saas/i.test(chosenTemplate)) {
            templateInstructions += `
- STYLE SAAS MOTION DESIGN (Product Tour, Logiciel, Interface interactive) :
  * FOND OBLIGATOIRE : NOIR PUR (#000000) ou NOIR OBSIDIENNE (#08080a) neutre. INTERDICTION FORMELLE DE METTRE UN FOND BLEU OU ARDOISE (#0f172a, #1e293b) !
  * SCÈNE 1 (Accroche Produit Immédiate dès t=0.0s) :
    - NE LAISSE JAMAIS LA SCÈNE 1 VIDE OU RÉDUITE À UN SIMPLE TEXTE FLOTTANT !
    - Dans le CSS : #scene_1 a { opacity: 1; visibility: visible; display: flex; } (JAMAIS de '!important' pour permettre à GSAP de le masquer proprement).
    - La Scène 1 doit IMMÉDIATEMENT afficher la fenêtre d'application (.saas-window) avec sa barre macOS (.saas-header avec 3 dots .red, .yellow, .green) et l'aperçu réel du produit (${downloadedWebCapturePath || 'mockup de dashboard'}) au centre, surmonté du badge officiel et du titre d'accroche !
  * SCÈNE 2 (Fonctionnalités & Données en Action) :
    - Zoom de caméra GSAP sur l'interface (scale: 1.25), cartes flottantes de synchronisation, graphiques analytiques animés, compteurs de données.
  * SCÈNE 3 (Conversion & CTA) :
    - Révélation du logo officiel ("${downloadedLogoPath || ''}"), métrique de satisfaction/uptime et bouton CTA percutant avec pulsation subtile.
`;
        } else if (/vox|explainer|2d/i.test(chosenTemplate)) {
            templateInstructions += `
- STYLE EXPLAINER 2D / STORY VOX :
  * Infographies vectorielles SVG claires, schémas conceptuels, flèches animées avec strokeDashoffset.
  * Découpages typographiques et mise en valeur pédagogique rythmée.
`;
        } else if (/ego/i.test(chosenTemplate)) {
            templateInstructions += `
- STYLE EGO LITE (Kinetic Typography Ultra-Punchy) :
  * Typographie monumentale dynamique, mots qui percutent l'écran avec du scale rapide et de l'inertie (back.out).
  * Transitions franches, rythme stroboscopique élégant et accents colorés ultra-contrastés.
`;
        } else if (/top_10|tier_list/i.test(chosenTemplate)) {
            templateInstructions += `
- STYLE CLASSEMENT / PODIUM / TIER LIST :
  * Numérotation géante, badges hiérarchiques (S, A, B, C ou 03, 02, 01), entrée dynamique des items en cascade.
`;
        } else {
            templateInstructions += `
- Respecte l'esprit visuel du template "${chosenTemplate}" tout en assurant une animation continue, dynamique et captivante de chaque seconde de la vidéo.
`;
        }
    } else {
        templateInstructions = `
7. CRÉATION LIBRE (SANS TEMPLATE FIGÉ) :
Conçois une composition visuelle originale et sur-mesure, avec des graphismes SVG adaptés au sujet et une scénographie unique.
`;
    }
    // Invite pour la génération de code créatif par Gemini
    const codeGenSystemPrompt = `Tu es le Directeur Artistique et Développeur Créatif GSAP #1 au monde pour les vidéos virales et cinématiques (VibeEditor).
Tu dois concevoir et coder en direct une composition vidéo originale de calibre professionnel.

${skillsDirectives ? `DIRECTIVES SKILLS OFFICIELS (00_Skills/) :\n${skillsDirectives}\n` : ''}

DIRECTIVES CRÉATIVES ET TECHNIQUES ABSOLUES :
1. LIBERTÉ ET MAÎTRISE SCÉNOGRAPHIQUE DU FOND :
   - Fond global suggéré : ${baseBg} (${isLight ? 'Ambiance claire' : 'Ambiance sombre'}).
   - Tu peux soit appliquer ce fond global à #stage, SOIT attribuer des fonds uniques à chaque conteneur de scène (ex: .scene-container#scene_1 { background: ... }, .scene-container#scene_2 { background: ... }) pour rythmer le voyage visuel du spectateur !
   - Le fond peut être noir, blanc, couleur unie adaptée au thème (bordeaux, navy, forêt, terracotta...) ou dégradé élégant (linear-gradient, radial spotlight).
   - Veille impérativement au contraste du texte (texte clair sur fond sombre, texte sombre sur fond clair) et à la lisibilité 100% nette.
   - BANNISSEMENT ABSOLU du fond cliché IA (la grille 1px avec halo vert/cyan répétitif).

2. CHARTE HARMONIQUE 60-30-10 :
   - 60% : Fond dominant.
   - 30% : Surfaces, cartes, bordures et texte secondaire.
   - 10% : UNE SEULE couleur d'accent vive signature : ${accentColor}.

3. ORIGINALITÉ & DIRECTION ARTISTIQUE SUR-MESURE :
   - Crée des graphismes et animations SVG vectorielles riches, uniques et adaptées au sujet.
   - RÈGLE CRITIQUE D'ANCRAGE SVG / 2D (AIGUILLES, ROUES, HORLOGES) : Dans GSAP, svgOrigin opère TOUJOURS dans les coordonnées globales du viewBox SVG ! Tu dois impérativement utiliser les coordonnées réelles du centre du cadran : svgOrigin: "${cx} ${cy}" (ex: svgOrigin: "180 180" si le cadran est centré à 180, 180). INTERDICTION FORMELLE ET ABSOLUE d'écrire svgOrigin: "0 0", car cela fait voltiger l'aiguille hors du cadran !
   - BANNISSEMENT ABSOLU DES TEXTES ET BADGES AUX 4 COINS DE L'ÉCRAN : INTERDICTION FORMELLE de coller des badges, timecodes, textes techniques ou faux indicateurs HUD dans les 4 coins du cadre (type .hud-telemetry, hud-tl, hud-tr, hud-bl, hud-br, "VIBE ENGINE", "1080p 60fps", "TEMPO 120 BPM", etc.). Cela fait amateur et ressemble à une présentation PowerPoint surchargée. Les 4 coins de l'écran doivent rester 100% vides, épurés et respirer ! Tout cadrage doit être cinématographique et centré sur l'histoire.
   - Zéro titrage scolaire / PowerPoint (aucun [ Étape 01 ], [ Chapitre 1 ], ni de conteneur .tag-pill).
   - Typographie cinétique stable sans reflow : balises <span class="title-line"> avec display:block et white-space:nowrap.
   - Centrage absolu de la scène de conclusion finale : position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%).

4. ASSETS DISPONIBLES À INTÉGRER :
${availableAssetsList.join('\n') || '- Aucun asset externe particulier, utilise du pur motion design vectoriel SVG.'}
   - INTERDICTION FORMELLE D'INVENTER DES CHEMINS OU DES FICHIERS IMAGES FICTIFS (ex: '01.jpg', 'gpu.png', 'image1.jpg').
   - SI UN FICHIER N'EST PAS EXPLICITEMENT PRÉSENT DANS LA LISTE 'ASSETS DISPONIBLES' CI-DESSUS, NE METS AUCUNE BALISE <img> ! Conçois impérativement les éléments en PUR MOTION DESIGN VECTORIEL SVG (dessine le produit, le chip, le HUD technologique, les jauges, graphiques, cartes et icônes directement en SVG soigné avec gradients et animations GSAP).
   - Si une capture d'écran web est disponible, insère-la dans l'interface ou au cœur de la scène avec mockup soigné.
   - Si un logo est disponible, affiche-le avec élégance (max-height 90-110px).
   - Si un drapeau est disponible, intègre-le (badge national circulaire ou rectangulaire stylisé, en-tête de scène, ou élément graphique).
   - Si une carte est disponible, intègre-la avec un cadrage harmonieux (border-radius 16px).
   - Si un clip vidéo B-roll est disponible, intègre-le avec : <video src="..." data-start="T_DEBUT" data-end="T_FIN" data-duration="DUREE" muted loop playsinline preload="auto"></video>. ATTRIBUTS data-start ET data-end STRICTEMENT OBLIGATOIRES pour la synchronisation automatique 60 FPS du Studio ! Ne JAMAIS appeler video.play() ou video.pause() dans le script GSAP. BANNISSEMENT ABSOLU de tout badge factice « LIVE BROADCAST ».

5. CHORÉGRAPHIE GSAP :
   - La vidéo dure exactement ${totalVideoDuration.toFixed(1)} secondes.
   - Il y a ${plan.scenes.length} scènes à animer sur la timeline GSAP 'tl' (qui est déjà initialisée).
   - Scène 1 : 0s -> ${(totalVideoDuration / plan.scenes.length).toFixed(1)}s
   - Scène 2 : ${(totalVideoDuration / plan.scenes.length).toFixed(1)}s -> ${(2 * totalVideoDuration / plan.scenes.length).toFixed(1)}s
   - Scène 3 : ${(2 * totalVideoDuration / plan.scenes.length).toFixed(1)}s -> ${totalVideoDuration.toFixed(1)}s
   - MOUVEMENT ET VIE CONTINUE : Ne laisse JAMAIS une scène devenir statique ou figée après son animation d'entrée ! Chaque scène doit vivre tout au long de sa durée avec des mouvements subtils (pulsation de lueur, rotation continue d'aiguilles ou de ventilateurs avec ease: 'none', progression de jauges de données, ou flottement lent).
   - ISOLATION STRICTE DES SCÈNES (ZÉRO SUPERPOSITION) :
     * Chaque scène doit être totalement masquée avant d'afficher la suivante.
     * Pour passer de Scène 1 à Scène 2 :
       tl.to('#scene_1', { opacity: 0, duration: 0.4 }, timeCut - 0.4)
         .set('#scene_1', { display: 'none', visibility: 'hidden' }, timeCut)
         .set('#scene_2', { display: 'flex', opacity: 0, visibility: 'visible' }, timeCut)
         .to('#scene_2', { opacity: 1, duration: 0.4 }, timeCut);
     * De cette façon, AUCUN élément de la scène précédente ne déborde ni ne reste visible derrière les scènes suivantes !

6. RÈGLE MAÎTRESSE : IMPACT VISUEL IMMÉDIAT DÈS LA PREMIÈRE FRAME (t = 0.0s) :
   - INTERDICTION FORMELLE DE LAISSER UN ÉCRAN VIDE AU DÉMARRAGE !
   - Dans le CSS : #scene_1 est visible par défaut { opacity: 1; visibility: visible; display: flex; } (NE JAMAIS METTRE '!important').
   - Les autres scènes (#scene_2, #scene_3) sont masquées par défaut { opacity: 0; visibility: hidden; display: none; }.
   - Dans GSAP à t=0 : initialise explicitement tl.set('#scene_1', { display: 'flex', opacity: 1, visibility: 'visible' }, 0).set(['#scene_2', '#scene_3'], { display: 'none', opacity: 0, visibility: 'hidden' }, 0);
   - À t = 0.0s (première frame), le spectateur doit IMMÉDIATEMENT voir du contenu fort, riche et accrocheur :
     * Le décor, les conteneurs ou les graphismes de la scène 1 doivent occuper l'espace visuel immédiatement.
     * BANNIR les animations lentes de fondu depuis 0 (pas de opacity: 0 ou scale: 0 qui laisse l'écran noir ou désert pendant 1 seconde).
   - BANNISSEMENT ABSOLU DES FONDS BLEU ARDOISE / NAVY (#0f172a, #1e293b). Fond par défaut : Noir Pur (#000000) ou Noir Obsidienne (#08080a).

${templateInstructions}

Tu dois répondre UNIQUEMENT par un objet JSON valide avec 3 champs :
{
  "htmlContent": "Code HTML complet des scènes à insérer dans <div id='cameraRig'>. Doit contenir <div class='scene-container' id='scene_1'>...</div>, etc., avec tous les SVG, cartes, textes, logos, drapeaux.",
  "customCss": "Règles CSS complètes pour styliser les éléments de htmlContent (fonds de scènes, SVG, conteneurs, typographie, ombres portées...).",
  "gsapTimelineCode": "Code JavaScript GSAP animant 'tl' pour séquencer les scènes et leurs éléments (tl.set, tl.from, tl.to, tl.fromTo). Ne redéclare PAS 'const tl', 'tl' existe déjà."
}`;

    const codeGenUserPrompt = `Génère le code HTML, CSS et GSAP sur-mesure pour :
Sujet : "${prompt}"
Format : ${format} (${width}x${height})
Fond de base : ${baseBg}
Couleur d'accent : ${accentColor}
Durée totale : ${totalVideoDuration.toFixed(1)}s
${isUsingTemplate ? `Style / Template imposé : "${chosenTemplate}"` : 'Style : Libre (sans template)'}
Assets disponibles :
${availableAssetsList.join('\n') || '- Aucun asset particulier, génère des graphismes vectoriels SVG complets.'}

Scènes prévues :
${plan.scenes.map((s, i) => `${i + 1}. Titre: "${s.headline}", Accent: "${s.headlineAccent || ''}", Sous-titre: "${s.subtitle}", Concept: "${s.concept || ''}"${s.background ? `, Fond scène: "${s.background}"` : ''}`).join('\n')}
${hasCustomScript ? `
SCRIPT HORODATÉ DE L'UTILISATEUR (À RESPECTER STRICTEMENT POUR LE DÉCOUPAGE TEMPOREL ET LES ANIMATIONS) :
"""
${customScript}
"""
Veille à ce que les animations, transitions et affichages textuels respectent les tranches de temps spécifiées dans le script horodaté !
` : ''}

Crée une composition visuelle remarquable avec de vrais éléments graphiques SVG thématiques. Réponds UNIQUEMENT en JSON.`;

    let generatedCode = null;
    try {
        onProgress('step_gsap_code', 'Gemini génère le code HTML, CSS et GSAP...', 88, `Génération du motion design et du code vectoriel...`, 'info');
        generatedCode = await callGeminiAPI(codeGenSystemPrompt, codeGenUserPrompt, 0.7);
    } catch (codeErr) {
        console.warn("[Code Gen Fallback] Erreur génération Gemini:", codeErr.message);
    }

    // Fallback résilient si l'API n'a pas répondu
    if (!generatedCode || !generatedCode.htmlContent || !generatedCode.gsapTimelineCode) {
        const scDur = (totalVideoDuration / 3).toFixed(1);
        generatedCode = {
            htmlContent: `
                <!-- SCÈNE 1 : ACCROCHE -->
                <div class="scene-container" id="scene_1">
                    <h1 class="hero-title">
                        <span class="title-line">${plan.scenes[0]?.headline || plan.title}</span>
                    </h1>
                    <p class="hero-subline">${plan.scenes[0]?.subtitle || plan.pitch}</p>
                    ${downloadedLogoPath ? `<img src="${downloadedLogoPath}" class="brand-logo-hero" alt="Logo">` : ''}
                    ${downloadedFlagPath ? `<img src="${downloadedFlagPath}" class="flag-badge-hero" alt="Drapeau">` : ''}
                    ${!downloadedLogoPath && !downloadedFlagPath ? `
                    <div class="svg-badge">
                        <svg viewBox="0 0 100 100" width="90" height="90">
                            <circle cx="50" cy="50" r="44" stroke="${accentColor}" stroke-width="4" fill="none" stroke-dasharray="8 6"/>
                            <path d="M35 50 L47 62 L67 38" stroke="${accentColor}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                    </div>` : ''}
                </div>

                <!-- SCÈNE 2 : CŒUR & INFOGRAPHIE -->
                <div class="scene-container" id="scene_2">
                    ${downloadedMapPath ? `<img src="${downloadedMapPath}" class="map-preview" alt="Map">` : ''}
                    <div class="custom-data-card">
                        <h2 class="card-headline">${plan.scenes[1]?.headline || 'L\'IMPACT CLÉ'}</h2>
                        <div class="accent-metric">${plan.scenes[1]?.headlineAccent || 'RÉVÉLATION'}</div>
                        <p class="hero-subline" style="margin-top:12px;">${plan.scenes[1]?.subtitle || ''}</p>
                    </div>
                </div>

                <!-- SCÈNE 3 : CONCLUSION CENTRÉE -->
                <div class="scene-container" id="scene_3">
                    <div class="conclusion-box">
                        <h2 class="hero-title">
                            <span class="title-line">${plan.scenes[2]?.headline || 'LE FUTUR'}</span>
                            <span class="title-line" style="color:${accentColor};">${plan.scenes[2]?.headlineAccent || 'MAINTENANT'}</span>
                        </h2>
                        <p class="hero-subline">${plan.scenes[2]?.subtitle || 'Prenez l\'avantage dès aujourd\'hui.'}</p>
                    </div>
                </div>`,
            customCss: `
                .scene-container {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    opacity: 0;
                    pointer-events: none;
                }
                .hero-title {
                    font-family: var(--font-title);
                    font-size: ${format === '9:16' ? '4.0rem' : '4.8rem'};
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                    line-height: 1.05;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .title-line { display: block; white-space: nowrap; }
                .hero-subline {
                    font-size: 1.5rem;
                    color: var(--text-muted);
                    max-width: 820px;
                    text-align: center;
                    line-height: 1.4;
                }
                .brand-logo-hero {
                    max-height: 90px;
                    margin-top: 30px;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
                }
                .flag-badge-hero {
                    width: 120px;
                    height: auto;
                    margin-top: 25px;
                    border-radius: 8px;
                    box-shadow: 0 12px 25px rgba(0,0,0,0.4);
                }
                .svg-badge { margin-top: 35px; }
                .custom-data-card {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    padding: 40px 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                }
                .card-headline {
                    font-family: var(--font-title);
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin-bottom: 8px;
                }
                .accent-metric {
                    font-size: 3.8rem;
                    font-weight: 900;
                    color: var(--accent);
                }
                .map-preview {
                    width: 75%;
                    max-height: 440px;
                    object-fit: cover;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }
                .conclusion-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 90%;
                    max-width: 900px;
                }`,
            gsapTimelineCode: `
                const sc1 = document.getElementById('scene_1');
                const sc2 = document.getElementById('scene_2');
                const sc3 = document.getElementById('scene_3');

                // Scène 1 (0 -> ${scDur}s)
                tl.set(sc1, { opacity: 1, pointerEvents: 'auto' }, 0);
                tl.from(sc1.querySelector('.hero-title'), { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.2);
                tl.from(sc1.querySelector('.hero-subline'), { y: 25, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.5);
                tl.to(sc1, { opacity: 0, y: -40, duration: 0.5, ease: 'power2.in' }, ${scDur - 0.5});

                // Scène 2 (${scDur} -> ${2 * scDur}s)
                tl.set(sc2, { opacity: 1, pointerEvents: 'auto' }, ${scDur});
                tl.from(sc2.querySelector('.custom-data-card'), { scale: 0.88, opacity: 0, y: 40, duration: 0.8, ease: 'back.out(1.4)' }, ${parseFloat(scDur) + 0.2});
                tl.to(sc2, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.in' }, ${2 * scDur - 0.5});

                // Scène 3 (${2 * scDur} -> ${totalVideoDuration.toFixed(1)}s)
                tl.set(sc3, { opacity: 1, pointerEvents: 'auto' }, ${2 * scDur});
                tl.from(sc3.querySelector('.conclusion-box'), { scale: 0.9, opacity: 0, duration: 0.9, ease: 'power3.out' }, ${2 * parseFloat(scDur) + 0.2});
                `
        };
    }

    // --- SANITISATION & SÉCURISATION DU CODE GÉNÉRÉ PAR L'IA ---
    let safeCustomCss = (generatedCode.customCss || '').replace(/!important/gi, '');
    // Retirer les déclarations de style orphelines sans sélecteur en début de CSS
    const firstBraceIdx = safeCustomCss.indexOf('{');
    if (firstBraceIdx > -1) {
        const beforeBrace = safeCustomCss.slice(0, firstBraceIdx);
        if (beforeBrace.includes(':') && beforeBrace.includes(';')) {
            const lastSemi = beforeBrace.lastIndexOf(';');
            safeCustomCss = safeCustomCss.slice(lastSemi + 1).trim();
        }
    }

    let safeHtmlContent = (generatedCode.htmlContent || '').replace(/style=(["'])(.*?)\1/gi, (match, quote, styleStr) => {
        return `style=${quote}${styleStr.replace(/!important/gi, '')}${quote}`;
    });

    // Détection et neutralisation des balises <img> pointant vers des fichiers inexistants (ex: 01.jpg halluciné)
    safeHtmlContent = safeHtmlContent.replace(/<img[^>]+src=(["'])(.*?)\1[^>]*>/gi, (imgTag, quote, src) => {
        let cleanSrc = src.trim();
        let diskPath = null;
        if (cleanSrc.startsWith('../')) {
            diskPath = path.resolve(videosTargetDir, cleanSrc);
        } else if (cleanSrc.startsWith('01_Assets') || cleanSrc.startsWith('/01_Assets')) {
            diskPath = path.resolve(ROOT_DIR, cleanSrc.replace(/^\//, ''));
        } else {
            diskPath = path.resolve(videosTargetDir, cleanSrc);
        }

        if (fs.existsSync(diskPath)) {
            return imgTag;
        }

        console.warn(`[Asset Shield] Remplacement d'une image inexistante hallucinée : ${src}`);
        return `<div class="vector-hud-card" style="width:100%; height:100%; min-height:200px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px; filter:drop-shadow(0 0 8px ${accentColor});"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span style="font-family:sans-serif; font-size:13px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:0.1em;">Visuel Vectoriel</span>
            </div>`;
    });

    // Assemblage du fichier HTML complet
    finalHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${plan.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,600;1,700&family=JetBrains+Mono:wght@600;700;800&family=Montserrat:wght@800;900&display=swap" rel="stylesheet">
    <!-- GSAP 3.12.5 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
        :root {
            --bg-base: ${baseBg};
            --text-main: ${mainTextColor};
            --text-muted: ${mutedTextColor};
            --card-bg: ${cardBgColor};
            --card-border: ${cardBorderColor};
            --accent: ${accentColor};
            --font-title: '${fontTitle}', sans-serif;
            --font-body: '${fontBody}', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none;
        }

        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000000;
            font-family: var(--font-body);
            color: var(--text-main);
        }

        /* CADRE MAÎTRE DU STAGE (FOND DYNAMIQUE GLOBAL) */
        #stage {
            width: ${width}px;
            height: ${height}px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
            background: var(--bg-base);
        }

        /* CAMÉRA GLOBALE AVEC CONTINUOUS MOTION (Travelling lent continu) */
        #cameraRig {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform-origin: center center;
        }

        /* SOUS-TITRES DYNAMIQUES ULTRA-RÉACTIFS (HORMOZI STYLE) */
        #subtitlesTrack {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            ${subPosCss}
            z-index: 999;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            width: 90%;
            max-width: 1100px;
        }

        .subtitle-box {
            font-family: '${subFont}', sans-serif;
            font-size: ${format === '9:16' ? '2.4rem' : '2.6rem'};
            font-weight: 800;
            color: ${subBaseColor};
            padding: 12px 24px;
            border-radius: ${subRadius}px;
            ${subBgStyle}
            ${subGlowStyle}
            text-align: center;
            line-height: 1.25;
            letter-spacing: -0.01em;
            display: inline-block;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
            opacity: 0;
            transition: opacity 0.04s ease-out; /* Affichage instantané sans latence */
        }

        .sub-word {
            display: inline-block;
            margin: 0 4px;
            color: ${subBaseColor};
            font-size: 1em;
            transform: none !important;
            transition: color 0.08s ease;
            will-change: color;
        }

        .sub-word.active-word {
            color: ${subAccentColor} !important;
            transform: none !important;
            font-size: 1em;
            font-weight: 800;
        }

        .sub-word.highlight-word {
            color: ${subAccentColor} !important;
            transform: none !important;
            font-size: 1em;
            font-weight: 800;
        }

        /* STYLES STRUCTURELS OBLIGATOIRES (Isolation et Accroche Scène 1 immédiate dès t=0.0s SANS !important) */
        .scene-container { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; visibility: hidden; display: none; pointer-events: none; }
        #scene_1 { opacity: 1; visibility: visible; display: flex; pointer-events: auto; }

        /* STYLES GÉNÉRÉS PAR L'IA */
        ${safeCustomCss}
    </style>
</head>
<body>

    <div id="stage" data-duration="${totalVideoDuration.toFixed(1)}" data-fps="30" data-width="${width}" data-height="${height}">
        
        <!-- RIG DE CAMÉRA AVEC LES SCÈNES GÉNÉRÉES PAR L'IA -->
        <div id="cameraRig">
            ${safeHtmlContent}
        </div>

        <!-- TRACK DES SOUS-TITRES DYNAMIQUES -->
        ${showSubtitles ? `
        <div id="subtitlesTrack">
            <div class="subtitle-box" id="subtitleBox"></div>
        </div>` : ''}

        <!-- PISTES AUDIO NATIVES -->
        ${generatedVoiceRelPath ? `<audio id="voiceTrack" src="${generatedVoiceRelPath}" preload="auto"></audio>` : ''}
        ${musicRelPath ? `<audio id="musicTrack" src="${musicRelPath}" preload="auto" loop></audio>` : ''}

    </div>

    <script>
        window.VIDEO_CONFIG = {
            id: "vid_${Date.now()}",
            title: "${plan.title.replace(/"/g, '\\"')}",
            prompt: "${prompt.replace(/"/g, '\\"')}",
            suffix: "${suffix}",
            status: "completed",
            format: "${format}",
            duration: ${totalVideoDuration.toFixed(1)},
            fps: 30,
            audio: {
                voiceover: "${generatedVoiceRelPath}",
                music: "${musicRelPath}",
                musicVolume: 0.15,
                setup: "${audioSetup}"
            },
            styling: {
                titleFont: "'${fontTitle}', sans-serif",
                subtitleFont: "'${fontBody}', sans-serif",
                accentColor: "${accentColor}"
            },
            options: {
                showSubtitles: ${showSubtitles},
                subtitleType: "${payload.subtitleType || 'type-wordbyword'}",
                subtitleFont: "${payload.subtitleCustomFont || payload.subtitleFont || 'Inter'}",
                subtitleBaseColor: "${payload.subtitleBaseColor || (isLight ? '#000000' : '#ffffff')}",
                subtitleAccentColor: "${payload.subtitleAccentColor || accentColor}",
                subtitleGlow: ${Boolean(payload.subtitleGlow)},
                subtitleBg: ${Boolean(payload.subtitleBg)},
                subtitleBgColor: "${payload.subtitleBgColor || (isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)')}",
                subtitleRadius: "${payload.subtitleRadius || '8'}",
                subtitlePosition: "${payload.subtitlePosition || 'bottom'}",
                showTitles: true
            },
            subtitleCues: ${JSON.stringify(subtitleCues)},
            subtitles: ${JSON.stringify(subtitleCues)},
            segments: [
                ${(plan.scenes || []).map((sc, i) => `{
                    id: ${sc.id || i + 1},
                    image: "${downloadedWebCapturePath || downloadedLogoPath || ''}",
                    label: "${(sc.headline || '').replace(/"/g, '\\"')}",
                    start: ${Math.round((i * totalVideoDuration / (plan.scenes.length || 3)) * 10) / 10},
                    end: ${Math.round(((i + 1) * totalVideoDuration / (plan.scenes.length || 3)) * 10) / 10},
                    title: "${(sc.headline || '').replace(/"/g, '\\"')}",
                    subtitle: "${(sc.subtitle || '').replace(/"/g, '\\"')}"
                }`).join(',\n                ')}
            ]
        };
        var VIDEO_CONFIG = window.VIDEO_CONFIG;

        const isIframeMode = window.self !== window.top;
        const stage = document.getElementById('stage');
        const cameraRig = document.getElementById('cameraRig');
        const voiceAudio = document.getElementById('voiceTrack');
        const musicAudio = document.getElementById('musicTrack');
        const subtitleBox = document.getElementById('subtitleBox');

        // Moteur de redimensionnement universel (garde translate(-50%, -50%))
        function handleResize() {
            if (isIframeMode) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const scale = Math.min(vw / ${width}, vh / ${height}) * 0.95;
            stage.style.transform = \`translate(-50%, -50%) scale(\${scale})\`;
        }
        window.addEventListener('resize', handleResize);
        handleResize();

        // Timeline Maître GSAP
        const tl = gsap.timeline({ paused: isIframeMode });
        window.tl = tl;

        // 1. Continuous Camera Motion (Travelling continu)
        tl.to(cameraRig, { scale: 1.05, duration: ${totalVideoDuration.toFixed(1)}, ease: "none" }, 0);

        // 2. Animations GSAP générées par l'IA
        try {
            ${generatedCode.gsapTimelineCode || ''}
        } catch(e) {
            console.error("Erreur exécution GSAP IA :", e);
        }

        // 3. Moteur de Sous-titres Ultra-Réactif
        const cues = VIDEO_CONFIG.subtitles || [];
        if (subtitleBox && cues.length > 0) {
            cues.forEach(cue => {
                tl.call(() => {
                    renderSubtitleGroup(cue);
                }, null, cue.start);

                tl.call(() => {
                    if (subtitleBox) subtitleBox.style.opacity = '0';
                }, null, cue.end);

                if ('${subType}' === 'type-wordbyword' && cue.words) {
                    cue.words.forEach((w, wIdx) => {
                        tl.call(() => {
                            highlightWord(wIdx);
                        }, null, w.start);
                    });
                }
            });
        }

        function renderSubtitleGroup(cue) {
            if (!subtitleBox) return;
            const words = cue.words || [];
            if ('${subType}' === 'type-wordbyword') {
                subtitleBox.innerHTML = words.map((w, idx) => \`<span class="sub-word" id="sub_word_\${idx}">\${w.word}</span>\`).join(' ');
            } else if ('${subType}' === 'type-highlight') {
                subtitleBox.innerHTML = words.map(w => {
                    const isImp = w.word.length > 5;
                    return \`<span class="sub-word \${isImp ? 'highlight-word' : ''}">\${w.word}</span>\`;
                }).join(' ');
            } else {
                subtitleBox.innerHTML = \`<span class="sub-word">\${cue.text}</span>\`;
            }
            subtitleBox.style.opacity = '1';
        }

        function highlightWord(idx) {
            if (!subtitleBox) return;
            const all = subtitleBox.querySelectorAll('.sub-word');
            for (let i = 0; i < all.length; i++) {
                if (i === idx) all[i].classList.add('active-word');
                else all[i].classList.remove('active-word');
            }
        }

        // 4. Synchronisation Audio Studio Haute Fidélité (100% Fluide sans saccades)
        window.syncAudioTimeline = function(time, isPlaying) {
            if (voiceAudio) {
                if (isPlaying) {
                    if (voiceAudio.paused && !voiceAudio.ended) {
                        if (Math.abs(voiceAudio.currentTime - time) > 0.15) {
                            voiceAudio.currentTime = time;
                        }
                        voiceAudio.play().catch(() => {});
                    } else {
                        // En cours de lecture, ne JAMAIS faire de micro-seek saccadé (tolérance 1.2s)
                        if (Math.abs(voiceAudio.currentTime - time) > 1.2) {
                            voiceAudio.currentTime = time;
                        }
                    }
                } else {
                    if (!voiceAudio.paused) voiceAudio.pause();
                    if (Math.abs(voiceAudio.currentTime - time) > 0.05) {
                        voiceAudio.currentTime = time;
                    }
                }
            }
            if (musicAudio) {
                const targetMusicTime = time % (musicAudio.duration || 30);
                if (isPlaying) {
                    if (musicAudio.paused && !musicAudio.ended) {
                        if (Math.abs(musicAudio.currentTime - targetMusicTime) > 0.2) {
                            musicAudio.currentTime = targetMusicTime;
                        }
                        musicAudio.volume = 0.15;
                        musicAudio.play().catch(() => {});
                    } else {
                        if (Math.abs(musicAudio.currentTime - targetMusicTime) > 1.5) {
                            musicAudio.currentTime = targetMusicTime;
                        }
                    }
                } else {
                    if (!musicAudio.paused) musicAudio.pause();
                    musicAudio.currentTime = targetMusicTime;
                }
            }
        };

        // Contrôles universels pour le Studio
        window.__timeline = {
            duration: () => ${totalVideoDuration.toFixed(1)},
            seek: (t, isUserSeeking = false) => {
                tl.seek(t, false);
                if (isUserSeeking) {
                    window.syncAudioTimeline(t, false);
                }
            },
            pause: () => {
                tl.pause();
                window.syncAudioTimeline(tl.time(), false);
            },
            play: () => {
                tl.play();
                window.syncAudioTimeline(tl.time(), true);
            }
        };
    </script>
</body>
</html>`;

    // 10. ENREGISTREMENT SUR DISQUE & TERMINAISON (Aucun découpage loose dans 05_Scenes/ pour les vidéos simples)
    onProgress('step_disk_save', 'Enregistrement physique dans l\'arborescence...', 97, `Écriture dans ${relVideoPath}`, 'info');
    fs.writeFileSync(finalFilePath, finalHtml, 'utf8');

    onProgress('step_studio_ready', 'Composition 100% prête pour le Studio !', 100, `Vidéo prête ! Transition vers le Studio...`, 'success');

    return {
        success: true,
        fileName: finalFileName,
        filePath: finalFilePath,
        videoUrl: relVideoPath,
        duration: totalVideoDuration,
        title: plan.title
    };
}

module.exports = {
    runAiVideoPipeline
};
