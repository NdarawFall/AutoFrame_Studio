/**
 * STUDIO-SERVER.CJS — Serveur local avec support de rendu automatique
 * Gère les fichiers, le streaming statique et le déclenchement de rendu MP4.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.cjs': 'text/javascript; charset=UTF-8',
    '.mjs': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// État global du rendu
let renderState = {
    isRendering: false,
    videoName: null,
    progress: 0,
    statusText: 'Inactif',
    logs: []
};
let currentRenderProcess = null;

// Intégration du moteur Orchestrateur IA VibeEditor
const { runAiVideoPipeline } = require('./ai_director.cjs');

// Registre des tâches de création vidéo en cours
const activeCreationJobs = new Map();

// Détermination transparente du dossier de travail et de configuration :
// Dossier racine du projet
const USER_DATA_DIR = ROOT_DIR;

if (process.env.VIBE_USER_DATA) {
    ['01_Assets', '03_Chaines', '04_Videos', '08_Rendus', '10_Clients'].forEach(folder => {
        const full = path.join(USER_DATA_DIR, folder);
        if (!fs.existsSync(full)) {
            try { fs.mkdirSync(full, { recursive: true }); } catch (e) {}
        }
    });
}

function getResolvedConfigPath() {
    if (process.env.VIBE_USER_DATA) {
        const userDir = process.env.VIBE_USER_DATA;
        if (!fs.existsSync(userDir)) {
            try { fs.mkdirSync(userDir, { recursive: true }); } catch (e) {}
        }
        return path.join(userDir, 'api_config.json');
    }
    return path.join(ROOT_DIR, '07_Scripts', 'api_config.json');
}

const DEFAULT_CONFIG = {
    tts_engine: "elevenlabs",
    pref_format: "16:9",
    pref_fps: "60",
    pref_quality: "high",
    pref_template: "none",
    pref_subtitle_style: "type-wordbyword",
    google_api_key: "",
    elevenlabs_api_key: "",
    elevenlabs_voice_id: "N2lVS1w4EtoT3dr4eOWO",
    elevenlabs_model_id: "eleven_multilingual_v2",
    pixabay_api_key: "",
    brandfetch_api_key: "",
    bg_remove_api_key: "",
    coverr_api_key: ""
};

// Initialisation automatique transparente sans aucune manipulation technique de l'utilisateur
const activeConfigPath = getResolvedConfigPath();
if (!fs.existsSync(activeConfigPath)) {
    try {
        fs.writeFileSync(activeConfigPath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
        console.log('ℹ️  [VibeEditor] Configuration utilisateur initialisée :', activeConfigPath);
    } catch (err) {
        console.warn('⚠️  Impossible d\'initialiser la configuration utilisateur :', err.message);
    }
}

const server = http.createServer(async (req, res) => {
    const cleanUrl = req.url.split('?')[0];
    // Redirection racine immédiate
    if (cleanUrl === '/' || cleanUrl === '') {
        res.writeHead(302, { 'Location': '/09_Pages/home.html' });
        return res.end();
    }

    // 1. API pour lister les fichiers des dossiers
    if (cleanUrl === '/api/files' && req.method === 'GET') {
        const chainesDir = path.join(ROOT_DIR, '03_Chaines');
        const videosDir = path.join(ROOT_DIR, '04_Videos');
        const rendusDir = path.join(ROOT_DIR, '08_Rendus');
        const channelsPath = path.join(ROOT_DIR, '07_Scripts', 'channels.json');

        let channels = [];
        try {
            if (fs.existsSync(channelsPath)) {
                channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8') || '[]');
            }
        } catch (e) {}

        let videos = [];
        let rendus = [];

        function readVideoMetadata(filePath) {
            let status = 'completed';
            let duration = 20.0;
            let format = '16:9';
            try {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const head = content.slice(0, 2000);
                    const statusMatch = head.match(/status:\s*["']([^"']+)["']/i);
                    if (statusMatch) status = statusMatch[1];
                    
                    // Duration from stage data-duration or VIDEO_CONFIG
                    const stageMatch = content.match(/<div[^>]*id=["']stage["'][^>]*data-duration=["']([0-9.]+)["']/i);
                    if (stageMatch) {
                        duration = parseFloat(stageMatch[1]);
                    } else {
                        const durMatch = content.match(/duration:\s*([0-9.]+)/i);
                        if (durMatch) duration = parseFloat(durMatch[1]);
                    }

                    // Format
                    const fmtMatch = content.match(/format:\s*["']([^"']+)["']/i) || content.match(/data-format=["']([^"']+)["']/i);
                    if (fmtMatch) {
                        format = fmtMatch[1];
                    } else {
                        const fn = path.basename(filePath).toLowerCase();
                        if (fn.includes('short') || fn.includes('tiktok') || fn.includes('reels') || fn.includes('9-16') || fn.includes('portrait')) {
                            format = '9:16';
                        }
                    }
                }
            } catch (e) {}
            return { status, duration, format };
        }

        try {
            // A. Vidéos sans chaîne (04_Videos)
            if (fs.existsSync(videosDir)) {
                const standalone = fs.readdirSync(videosDir).filter(f => f.endsWith('.html'));
                standalone.forEach(file => {
                    const fullPath = path.join(videosDir, file);
                    const meta = readVideoMetadata(fullPath);
                    videos.push({
                        name: file,
                        file: file,
                        path: `04_Videos/${file}`,
                        isStandalone: true,
                        channelId: null,
                        channelName: null,
                        status: meta.status,
                        duration: meta.duration,
                        format: meta.format
                    });
                });
            }

            // B. Vidéos des chaînes (03_Chaines/<channelId>/...)
            if (fs.existsSync(chainesDir)) {
                const chFolders = fs.readdirSync(chainesDir, { withFileTypes: true }).filter(d => d.isDirectory());
                chFolders.forEach(chDir => {
                    const chFolderFull = path.join(chainesDir, chDir.name);
                    const chVids = fs.readdirSync(chFolderFull).filter(f => f.endsWith('.html'));
                    const chMeta = channels.find(c => c.id === chDir.name || c.name === chDir.name);
                    const chName = chMeta ? chMeta.name : chDir.name;
                    chVids.forEach(file => {
                        const fullPath = path.join(chFolderFull, file);
                        const meta = readVideoMetadata(fullPath);
                        videos.push({
                            name: file,
                            file: file,
                            path: `03_Chaines/${chDir.name}/${file}`,
                            isStandalone: false,
                            channelId: chDir.name,
                            channelName: chName,
                            status: meta.status,
                            duration: meta.duration,
                            format: meta.format
                        });
                    });
                });
            }

            // C. Rendus MP4 (08_Rendus)
            if (fs.existsSync(rendusDir)) {
                rendus = fs.readdirSync(rendusDir)
                    .filter(f => f.endsWith('.mp4'))
                    .map(name => {
                        const stats = fs.statSync(path.join(rendusDir, name));
                        return {
                            name,
                            size: Math.round(stats.size / 1024) + ' Ko',
                            date: stats.mtime.toLocaleTimeString()
                        };
                    });
            }
        } catch (e) {
            console.error('Erreur lecture dossiers :', e);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify({ videos, rendus }));
    }

    // 1-BIS. API pour lister les templates de 06_Templates
    if (cleanUrl === '/api/templates' && req.method === 'GET') {
        const tplDir = path.join(ROOT_DIR, '06_Templates');
        let templates = [];
        try {
            if (fs.existsSync(tplDir)) {
                const files = fs.readdirSync(tplDir).filter(f => f.endsWith('.html'));
                templates = files.map(file => {
                    const id = path.basename(file, '.html');
                    let name = id.replace(/_/g, ' ');
                    let desc = 'Template vidéo prêt pour la composition.';
                    let icon = '';
                    let image = '/01_Assets/Images/styles/template_stikman_history.jpg';
                    if (id === 'Stikman_history') {
                        name = 'Stikman History';
                        desc = 'Storytelling immersif, effet Ken Burns & zooms dynamiques.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_stikman_history.jpg';
                    } else if (id === 'Story_vox_style') {
                        name = 'Story Vox Style';
                        desc = 'Format explicatif visuel, infographies, schémas 2D & motion design.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_story_vox_style.jpg';
                    } else if (id === 'Tutoriel') {
                        name = 'Tutoriel';
                        desc = 'Guide pédagogique étape par étape, démonstration d\'écrans & focus UI.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_tutoriel.jpg';
                    } else if (id === 'Faceless_brand') {
                        name = 'Faceless Brand';
                        desc = 'Vidéos de marque sans visage, esthétique B-roll & branding moderne.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_faceless_brand.jpg';
                    } else if (id === 'Ego_lite') {
                        name = 'Ego Lite';
                        desc = 'Format court ultra-punchy, kinetic typography & accroches rythmées.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_ego_lite.jpg';
                    } else if (id === 'Saas_Motion_Design') {
                        name = 'Saas Motion Design';
                        desc = 'Présentation produit logiciel, interface moderne et focus features.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_saas_motion_design.jpg';
                    } else if (id === 'Top_10') {
                        name = 'Top 10';
                        desc = 'Compte à rebours dynamique, podium et classements viraux.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_top_10.jpg';
                    } else if (id === 'Tier_List') {
                        name = 'Tier List';
                        desc = 'Classement visuel par rangs S-A-B-C-D et comparatifs hiérarchiques.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_tier_list.jpg';
                    } else if (id === 'Iman_Gadzhi_Style') {
                        name = 'Iman Gadzhi Style';
                        desc = 'Esthétique documentaire sombre, découpages papier & storytelling business.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_iman_gadzhi_style.jpg';
                    } else if (id === 'trash_style') {
                        name = 'Trash Style';
                        desc = 'Montage chaotique, punk edit, découpages papier & effets grunge énergiques.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_trash_style.jpg';
                    } else if (id === '2D_explainer') {
                        name = '2D Explainer';
                        desc = 'Animation vectorielle 2D, infographies animées & mise en scène visuelle claire.';
                        icon = '';
                        image = '/01_Assets/Images/styles/template_2d_explainer.jpg';
                    }
                    return { id, name, file, desc, icon, image };
                });
            }
        } catch (e) {
            console.error('Erreur lecture templates :', e);
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify(templates));
    }

    // 2. API pour obtenir l'état du rendu
    if (cleanUrl === '/api/render-status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify(renderState));
    }

    // 3. API pour lancer un rendu
    if (cleanUrl === '/api/render' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let data = {};
            try { data = JSON.parse(body); } catch (e) {}
            const videoName = data.video || 'demo-video.html';

            if (renderState.isRendering) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: 'Un rendu est déjà en cours' }));
            }

            renderState = {
                isRendering: true,
                videoName,
                progress: 5,
                statusText: `Vérification de l'environnement...`,
                logs: [`Démarrage du rendu pour : ${videoName}`]
            };

            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            res.end(JSON.stringify({ message: 'Rendu démarré', video: videoName }));

            // Exécution asynchrone du rendu
            executeRender(videoName);
        });
        return;
    }

    // 4. API pour annuler un rendu en cours
    if (cleanUrl === '/api/cancel-render' && req.method === 'POST') {
        if (currentRenderProcess && renderState.isRendering) {
            try {
                if (process.platform === 'win32') {
                    exec(`taskkill /pid ${currentRenderProcess.pid} /T /F`);
                } else {
                    currentRenderProcess.kill('SIGKILL');
                }
            } catch (e) {}
            currentRenderProcess = null;
            renderState.isRendering = false;
            renderState.statusText = 'Rendu interrompu par l\'utilisateur';
            renderState.progress = 0;
            renderState.logs.push('⛔ Rendu arrêté.');
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            return res.end(JSON.stringify({ success: true, message: 'Rendu annulé' }));
        }
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ error: 'Aucun rendu en cours' }));
    }

    // 5. API pour supprimer une vidéo (avec nettoyage channels.json et anti-cache)
    if (cleanUrl === '/api/delete-video' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const rawTarget = decodeURIComponent(data.video || '').trim();
                const videoTarget = rawTarget.replace(/^[\\/\\]+/, '');
                if (!videoTarget) {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Chemin de vidéo manquant' }));
                }

                // Résolution sécurisée du fichier (tolérance relative, absolue et sous-dossiers)
                let filePath = path.join(ROOT_DIR, videoTarget);
                if (!fs.existsSync(filePath)) {
                    filePath = path.join(ROOT_DIR, '04_Videos', path.basename(videoTarget));
                }
                if (!fs.existsSync(filePath)) {
                    filePath = path.resolve(ROOT_DIR, videoTarget);
                }
                if (!fs.existsSync(filePath)) {
                    // Chercher dans 03_Chaines
                    const chainesDir = path.join(ROOT_DIR, '03_Chaines');
                    if (fs.existsSync(chainesDir)) {
                        const subs = fs.readdirSync(chainesDir);
                        for (const sub of subs) {
                            const candidate = path.join(chainesDir, sub, path.basename(videoTarget));
                            if (fs.existsSync(candidate)) {
                                filePath = candidate;
                                break;
                            }
                        }
                    }
                }

                if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
                    fs.unlinkSync(filePath);

                    // Synchroniser channels.json au cas où la vidéo appartenait à une chaîne
                    try {
                        const channelsPath = path.join(ROOT_DIR, '07_Scripts', 'channels.json');
                        if (fs.existsSync(channelsPath)) {
                            let channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8') || '[]');
                            let changed = false;
                            const baseFn = path.basename(filePath);
                            channels.forEach(ch => {
                                if (ch.videos && Array.isArray(ch.videos)) {
                                    const initialLen = ch.videos.length;
                                    ch.videos = ch.videos.filter(v => (v.file !== baseFn && v.path !== videoTarget));
                                    if (ch.videos.length !== initialLen) {
                                        ch.videoCount = ch.videos.length;
                                        changed = true;
                                    }
                                }
                            });
                            if (changed) {
                                fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2), 'utf8');
                            }
                        }
                    } catch (e) {}

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    });
                    return res.end(JSON.stringify({ success: true, message: 'Vidéo ' + videoTarget + ' supprimée' }));
                }
                res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: 'Fichier non trouvé' }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // 5b. API pour lister les assets existants (rétro-compatibilité)
    if (cleanUrl === '/api/assets-files' && req.method === 'GET') {
        const assetsDir = path.join(ROOT_DIR, '01_Assets');
        const getFiles = (dir) => {
            try {
                if (!fs.existsSync(dir)) return [];
                return fs.readdirSync(dir, { withFileTypes: true })
                    .filter(d => !d.isDirectory())
                    .map(d => d.name);
            } catch (e) { return []; }
        };
        const result = {
            images: getFiles(path.join(assetsDir, 'Images')),
            maps: getFiles(path.join(assetsDir, 'Maps')),
            voixOff: getFiles(path.join(assetsDir, 'Voix_Off')),
            musiques: getFiles(path.join(assetsDir, 'Musiques')),
            videos: getFiles(path.join(assetsDir, 'Videos'))
        };
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify(result));
    }

    // 5b-bis. API Catalogue Complet d'Assets Récursif (Médiathèque Avancée)
    if (cleanUrl === '/api/assets-catalog' && req.method === 'GET') {
        try {
            const assetsDir = path.join(ROOT_DIR, '01_Assets');
            const formatBytes = (bytes) => {
                if (!bytes || bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
            };

            const detectType = (ext) => {
                ext = (ext || '').toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif'].includes(ext)) return 'image';
                if (['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext)) return 'video';
                if (['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(ext)) return 'audio';
                if (['.svg'].includes(ext)) return 'vector';
                return 'other';
            };

            const items = [];
            let totalBytes = 0;
            let counter = 0;

            const walk = (currentDir, relFromAssets = '') => {
                if (!fs.existsSync(currentDir)) return;
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });

                for (const entry of entries) {
                    if (entry.name.startsWith('.') || entry.name === '.gitkeep') continue;
                    const fullPath = path.join(currentDir, entry.name);
                    const subRel = relFromAssets ? `${relFromAssets}/${entry.name}` : entry.name;

                    if (entry.isDirectory()) {
                        walk(fullPath, subRel);
                    } else if (entry.isFile()) {
                        try {
                            const stats = fs.statSync(fullPath);
                            const ext = path.extname(entry.name).toLowerCase();
                            const parts = subRel.split('/');
                            const category = parts[0] || 'Général';
                            const subfolder = parts.length > 2 ? parts.slice(1, -1).join('/') : '';
                            const type = detectType(ext);

                            totalBytes += stats.size;
                            counter++;

                            items.push({
                                id: `asset_${counter}_${path.basename(entry.name, ext)}`,
                                name: entry.name,
                                category: category,
                                subfolder: subfolder || 'Racine',
                                relativePath: `01_Assets/${subRel}`,
                                url: `/01_Assets/${subRel.split('/').map(encodeURIComponent).join('/')}`,
                                type: type,
                                ext: ext,
                                size: stats.size,
                                sizeFormatted: formatBytes(stats.size),
                                mtime: stats.mtime.toISOString()
                            });
                        } catch (err) {
                            // Ignorer les fichiers non lisibles
                        }
                    }
                }
            };

            walk(assetsDir, '');

            // Tri par date de modification descendante par défaut
            items.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

            // Agréger les catégories et sous-dossiers
            const catMap = {};
            items.forEach(it => {
                if (!catMap[it.category]) {
                    catMap[it.category] = {
                        name: it.category,
                        count: 0,
                        subfolders: new Set(),
                        types: new Set()
                    };
                }
                catMap[it.category].count++;
                if (it.subfolder && it.subfolder !== 'Racine') {
                    catMap[it.category].subfolders.add(it.subfolder);
                }
                catMap[it.category].types.add(it.type);
            });

            const categories = Object.keys(catMap).sort().map(cat => ({
                name: cat,
                count: catMap[cat].count,
                subfolders: Array.from(catMap[cat].subfolders).sort(),
                types: Array.from(catMap[cat].types)
            }));

            // Stats globales
            const stats = {
                totalCount: items.length,
                totalSize: totalBytes,
                totalSizeFormatted: formatBytes(totalBytes),
                imagesCount: items.filter(i => i.type === 'image').length,
                videosCount: items.filter(i => i.type === 'video').length,
                audiosCount: items.filter(i => i.type === 'audio').length,
                vectorsCount: items.filter(i => i.type === 'vector').length,
                othersCount: items.filter(i => i.type === 'other').length,
                categoriesCount: categories.length
            };

            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            return res.end(JSON.stringify({
                success: true,
                stats,
                categories,
                items
            }));
        } catch (err) {
            console.error('Erreur assets-catalog :', err);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify({ error: err.message }));
        }
    }

    // 5b-ter. API pour supprimer un asset dans 01_Assets
    if (cleanUrl === '/api/delete-asset' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { relativePath } = JSON.parse(body || '{}');
                if (!relativePath || typeof relativePath !== 'string') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Chemin relatif manquant' }));
                }

                // Normalisation et sécurisation absolue : doit résider strictement dans 01_Assets
                const normalized = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
                const targetPath = path.resolve(ROOT_DIR, normalized);
                const assetsBase = path.resolve(ROOT_DIR, '01_Assets');

                if (!targetPath.startsWith(assetsBase)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Action non autorisée en dehors de 01_Assets' }));
                }

                if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
                    fs.unlinkSync(targetPath);
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify({ success: true, message: 'Fichier supprimé avec succès' }));
                }

                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Fichier introuvable' }));
            } catch (err) {
                console.error('Erreur delete-asset :', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5c. API pour uploader un fichier directement dans 01_Assets
    if (cleanUrl === '/api/upload-asset' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body || '{}');
                const category = (payload.category || 'Images').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
                const subfolder = (payload.subfolder || payload.channelId || '').trim().replace(/[^a-zA-Z0-9_\-\/]/g, '_');
                const rawFilename = payload.filename || `asset_${Date.now()}`;
                const safeName = path.basename(rawFilename).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
                const base64Data = payload.data;

                if (!base64Data) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Données base64 manquantes' }));
                }

                const targetDir = subfolder 
                    ? path.join(ROOT_DIR, '01_Assets', category, subfolder) 
                    : path.join(ROOT_DIR, '01_Assets', category);

                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const targetFilePath = path.join(targetDir, safeName);
                const buffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(targetFilePath, buffer);

                const relativePath = subfolder 
                    ? `01_Assets/${category}/${subfolder}/${safeName}` 
                    : `01_Assets/${category}/${safeName}`;

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({ 
                    success: true, 
                    filename: safeName, 
                    category,
                    subfolder,
                    relativePath 
                }));
            } catch (err) {
                console.error('Erreur upload-asset :', err);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5c-bis. API pour détourer une image ou vidéo sur fond vert (Chroma Keying)
    if (cleanUrl === '/api/chroma-key' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body || '{}');
                const { removeGreenScreen } = require('./chroma_key.cjs');
                let targetInput = '';

                if (payload.filePath) {
                    targetInput = path.resolve(ROOT_DIR, payload.filePath);
                } else if (payload.data && payload.filename) {
                    const tempDir = path.join(ROOT_DIR, '01_Assets', 'Temp');
                    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                    targetInput = path.join(tempDir, `green_${Date.now()}_${path.basename(payload.filename)}`);
                    fs.writeFileSync(targetInput, Buffer.from(payload.data, 'base64'));
                }

                if (!targetInput || !fs.existsSync(targetInput)) {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Fichier source introuvable pour le détourage' }));
                }

                const ext = path.extname(targetInput).toLowerCase();
                const isVid = ['.mp4', '.mov', '.webm'].includes(ext);
                const outCat = isVid ? 'Videos' : 'Images';
                const outDir = path.join(ROOT_DIR, '01_Assets', outCat);
                if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

                const outExt = isVid ? '.webm' : '.png';
                const outName = `${path.basename(targetInput, ext)}_detoure_${Date.now().toString().slice(-4)}${outExt}`;
                const outputPath = path.join(outDir, outName);

                const result = await removeGreenScreen(targetInput, outputPath, {
                    color: payload.color || '0x00FF00',
                    similarity: payload.similarity !== undefined ? payload.similarity : 0.32,
                    blend: payload.blend !== undefined ? payload.blend : 0.10
                });

                const relOutPath = `01_Assets/${outCat}/${outName}`;
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({
                    success: true,
                    type: result.type,
                    outputPath: relOutPath,
                    filename: outName
                }));
            } catch (chromaErr) {
                console.error('Erreur chroma-key API :', chromaErr);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: chromaErr.message }));
            }
        });
        return;
    }

    // 5d. API pour démarrer la génération vidéo IA autonome en tâche de fond (Temps réel)
    if (cleanUrl === '/api/create-video-start' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

                const jobState = {
                    id: jobId,
                    status: 'processing',
                    currentStep: 'step_init',
                    phaseLabel: 'Initialisation du pipeline IA...',
                    progress: 5,
                    steps: [],
                    logs: [
                        { time: new Date().toTimeString().split(' ')[0], text: '[SYSTEM] Démarrage du pipeline IA...', type: 'info' }
                    ],
                    videoUrl: '',
                    fileName: '',
                    error: null
                };
                activeCreationJobs.set(jobId, jobState);

                // Lancement asynchrone autonome du pipeline IA (ne bloque pas le serveur HTTP)
                (async () => {
                    try {
                        const result = await runAiVideoPipeline(data, (stepId, phaseLabel, percent, logMsg, logType, extraData) => {
                            jobState.currentStep = stepId;
                            jobState.phaseLabel = phaseLabel;
                            jobState.progress = percent;
                            if (extraData && extraData.steps && Array.isArray(extraData.steps)) {
                                jobState.steps = extraData.steps;
                            }
                            jobState.logs.push({
                                time: new Date().toTimeString().split(' ')[0],
                                text: logMsg,
                                type: logType || 'info'
                            });
                        });

                        jobState.status = 'completed';
                        jobState.progress = 100;
                        jobState.phaseLabel = 'Vidéo prête à être montée !';
                        jobState.videoUrl = result.videoUrl;
                        jobState.fileName = result.fileName;
                        jobState.logs.push({
                            time: new Date().toTimeString().split(' ')[0],
                            text: `✓ Processus 100% terminé ! Accès au Studio prêt : ${result.videoUrl}`,
                            type: 'success'
                        });
                    } catch (pipelineErr) {
                        console.error('[AiVideoPipeline Error]:', pipelineErr);
                        jobState.status = 'error';
                        jobState.error = pipelineErr.message;
                        jobState.logs.push({
                            time: new Date().toTimeString().split(' ')[0],
                            text: `❌ Erreur du pipeline : ${pipelineErr.message}`,
                            type: 'error'
                        });
                    }
                })();

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({ 
                    success: true, 
                    jobId: jobId 
                }));
            } catch (err) {
                console.error('Erreur create-video-start :', err);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5e. API pour suivre le statut et les logs en direct de la génération vidéo (/api/creation-status?jobId=...)
    if (req.url.startsWith('/api/creation-status') && req.method === 'GET') {
        const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
        const jobId = parsedUrl.searchParams.get('jobId');
        const videoParam = parsedUrl.searchParams.get('video');

        let job = null;
        if (jobId && activeCreationJobs.has(jobId)) {
            job = activeCreationJobs.get(jobId);
        } else if (videoParam) {
            // Recherche par chemin relatif de vidéo
            for (const j of activeCreationJobs.values()) {
                if (j.videoUrl === videoParam || j.fileName === videoParam) {
                    job = j;
                    break;
                }
            }
        }

        if (!job) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            return res.end(JSON.stringify({ 
                success: true, 
                status: 'completed', 
                progress: 100, 
                phaseLabel: 'Vidéo disponible',
                logs: []
            }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify({
            success: true,
            status: job.status,
            currentStep: job.currentStep,
            phaseLabel: job.phaseLabel,
            progress: job.progress,
            steps: job.steps || [],
            logs: job.logs,
            videoUrl: job.videoUrl,
            error: job.error
        }));
    }

    // 5f. API synchrone de génération (rétrocompatibilité)
    if (cleanUrl === '/api/create-video' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const result = await runAiVideoPipeline(data, (stepId, phaseLabel, percent, logMsg) => {
                    console.log(`[AI Pipeline ${percent}%] ${logMsg}`);
                });

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({ 
                    success: true, 
                    fileName: result.fileName, 
                    videoUrl: result.videoUrl 
                }));
            } catch (err) {
                console.error('Erreur create-video synchrone :', err);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5e. API pour sauvegarder ou charger les clés & paramètres dans api_config.json
    if (cleanUrl === '/api/settings') {
        const configPath = getResolvedConfigPath();

        if (req.method === 'GET') {
            try {
                let cfg = {};
                if (fs.existsSync(configPath)) {
                    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                } else {
                    cfg = { ...DEFAULT_CONFIG };
                }
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(cfg));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    let existingCfg = {};
                    if (fs.existsSync(configPath)) {
                        existingCfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    } else {
                        existingCfg = { ...DEFAULT_CONFIG };
                    }
                    const incoming = JSON.parse(body || '{}');
                    const updated = { ...existingCfg, ...incoming };
                    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');

                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify({ success: true, settings: updated }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }
    }

    // 5e1. API d'intégration Coverr.co (Recherche, Test & Téléchargement)
    if (req.url.startsWith('/api/coverr')) {
        const coverrModule = require('./coverr.cjs');

        // Test de clé API Coverr
        if (cleanUrl === '/api/coverr/test' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body || '{}');
                    const testResult = await coverrModule.testCoverrKey(data.key);
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify(testResult));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ valid: false, error: e.message }));
                }
            });
            return;
        }

        // Recherche de vidéos Coverr
        if (req.url.startsWith('/api/coverr/search') && req.method === 'GET') {
            try {
                const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
                const query = parsedUrl.searchParams.get('query') || 'nature';
                const page = parseInt(parsedUrl.searchParams.get('page') || '0', 10);
                const pageSize = parseInt(parsedUrl.searchParams.get('page_size') || '15', 10);
                const verticalParam = parsedUrl.searchParams.get('vertical');
                const isVertical = verticalParam !== null ? (verticalParam === 'true' || verticalParam === '1') : null;
                const apiKey = parsedUrl.searchParams.get('key') || '';

                const searchResults = await coverrModule.searchCoverrVideos(query, {
                    apiKey,
                    page,
                    pageSize,
                    isVertical
                });

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(searchResults));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        }

        // Téléchargement d'une vidéo Coverr vers les assets locaux
        if (cleanUrl === '/api/coverr/download' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body || '{}');
                    if (!data.url) {
                        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        return res.end(JSON.stringify({ error: 'URL vidéo manquante' }));
                    }

                    const safeName = (data.filename || `coverr_${Date.now()}.mp4`).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
                    const targetSubDir = data.channelId ? path.join('01_Assets', 'Videos', data.channelId) : path.join('01_Assets', 'Videos');
                    const targetFullDir = path.join(ROOT_DIR, targetSubDir);
                    const destPath = path.join(targetFullDir, safeName);

                    await coverrModule.downloadCoverrVideo(data.url, destPath);

                    const relativePath = path.relative(ROOT_DIR, destPath).replace(/\\/g, '/');

                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify({
                        success: true,
                        message: 'Vidéo Coverr téléchargée avec succès dans les assets !',
                        path: relativePath,
                        filename: safeName
                    }));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
    }

    // 5e2. API pour gérer les chaînes utilisateur créées (channels.json & dossiers 03_Chaines)
    if (req.url.startsWith('/api/channels')) {
        const channelsPath = path.join(ROOT_DIR, '07_Scripts', 'channels.json');
        const chainesBaseDir = path.join(ROOT_DIR, '03_Chaines');
        if (!fs.existsSync(chainesBaseDir)) fs.mkdirSync(chainesBaseDir, { recursive: true });

        const readChannels = () => {
            let channels = [];
            try {
                if (fs.existsSync(channelsPath)) {
                    channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8') || '[]');
                }
            } catch (e) {}

            // Mettre à jour en direct les vidéos depuis les dossiers 03_Chaines/<channelId>
            channels.forEach(ch => {
                const chFolder = path.join(chainesBaseDir, ch.id);
                if (fs.existsSync(chFolder)) {
                    const files = fs.readdirSync(chFolder).filter(f => f.endsWith('.html'));
                    ch.videoCount = files.length;
                    ch.videos = files.map(f => ({
                        file: f,
                        path: `03_Chaines/${ch.id}/${f}`,
                        title: f.replace(/\.html$/, '').replace(/[-_]/g, ' ')
                    }));
                } else {
                    fs.mkdirSync(chFolder, { recursive: true });
                    ch.videoCount = ch.videoCount || 0;
                    ch.videos = ch.videos || [];
                }
            });

            return channels;
        };

        const avatarsBaseDir = path.join(ROOT_DIR, '01_Assets', 'Images', 'channels');
        if (!fs.existsSync(avatarsBaseDir)) fs.mkdirSync(avatarsBaseDir, { recursive: true });

        const processChannelAvatars = (channelsList) => {
            channelsList.forEach(ch => {
                if (ch.avatar && typeof ch.avatar === 'string' && ch.avatar.startsWith('data:image/')) {
                    try {
                        const matches = ch.avatar.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                        if (matches) {
                            const ext = (matches[1] === 'jpeg' ? 'jpg' : matches[1]).toLowerCase();
                            const fileName = `avatar_${ch.id}.${ext}`;
                            const filePath = path.join(avatarsBaseDir, fileName);
                            fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                            ch.avatar = `01_Assets/Images/channels/${fileName}`;
                        }
                    } catch(e) {}
                }
            });
        };

        const writeChannels = (channels) => {
            processChannelAvatars(channels);
            fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2), 'utf8');
        };

        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
            return res.end(JSON.stringify(readChannels()));
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body || '{}');
                    let channels = readChannels();

                    // Si c'est un tableau complet de remplacement
                    if (Array.isArray(data)) {
                        channels = data;
                        channels.forEach(ch => {
                            const dir = path.join(chainesBaseDir, ch.id);
                            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                        });
                    } else if (data.id) {
                        // Ajout ou mise à jour d'une chaîne
                        const existingIdx = channels.findIndex(c => c.id === data.id);
                        if (existingIdx >= 0) {
                            channels[existingIdx] = { ...channels[existingIdx], ...data };
                        } else {
                            channels.push(data);
                        }
                        const dir = path.join(chainesBaseDir, data.id);
                        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    }
                    writeChannels(channels);
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify({ success: true, channels }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }

        if (req.method === 'DELETE') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
                    const queryId = parsedUrl.searchParams.get('id');
                    let targetId = queryId;
                    if (!targetId && body) {
                        try { targetId = JSON.parse(body).id; } catch(e){}
                    }

                    if (!targetId) {
                        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        return res.end(JSON.stringify({ error: 'ID de chaîne manquant' }));
                    }

                    let channels = readChannels();
                    channels = channels.filter(c => c.id !== targetId);
                    writeChannels(channels);

                    // Supprimer également le dossier de la chaîne dans 03_Chaines
                    const chFolder = path.join(chainesBaseDir, targetId);
                    if (fs.existsSync(chFolder)) {
                        fs.rmSync(chFolder, { recursive: true, force: true });
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                    return res.end(JSON.stringify({ success: true, channels }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }
    }

    // 5e3. API pour ouvrir directement l'explorateur Windows dans le dossier sécurisé VibeEditor (%APPDATA%/VibeEditor)
    if (cleanUrl === '/api/open-projects-folder') {
        const targetOpen = USER_DATA_DIR;
        const { exec } = require('child_process');
        if (process.platform === 'win32') {
            exec(`explorer "${targetOpen.replace(/\//g, '\\')}"`);
        } else if (process.platform === 'darwin') {
            exec(`open "${targetOpen}"`);
        } else {
            exec(`xdg-open "${targetOpen}"`);
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        return res.end(JSON.stringify({ success: true, path: targetOpen }));
    }

    // 5f. API pour lister les voix ElevenLabs (créées et par défaut)
    if (req.url.startsWith('/api/elevenlabs/voices')) {
        const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
        let savedKey = '';
        try {
            const configPath = getResolvedConfigPath();
            if (fs.existsSync(configPath)) {
                savedKey = JSON.parse(fs.readFileSync(configPath, 'utf8')).elevenlabs_api_key || '';
            }
        } catch(e) {}
        const queryKey = parsedUrl.searchParams.get('key') || savedKey;

        const handleFetchVoices = async (keyToUse) => {
            try {
                const { fetchElevenLabsVoices } = require('./generate_voice.cjs');
                const result = await fetchElevenLabsVoices(keyToUse || savedKey);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        };

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                let data = {};
                try { data = JSON.parse(body || '{}'); } catch (e) {}
                handleFetchVoices(data.apiKey || queryKey);
            });
            return;
        } else {
            handleFetchVoices(queryKey);
            return;
        }
    }

    // 5f-bis. API pour obtenir le statut et crédits restants ElevenLabs
    if (req.url.startsWith('/api/elevenlabs/subscription')) {
        const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
        let savedKey = '';
        try {
            const configPath = getResolvedConfigPath();
            if (fs.existsSync(configPath)) {
                savedKey = JSON.parse(fs.readFileSync(configPath, 'utf8')).elevenlabs_api_key || '';
            }
        } catch(e) {}
        const queryKey = parsedUrl.searchParams.get('key') || savedKey;

        const handleFetchSub = async (keyToUse) => {
            try {
                const { fetchElevenLabsSubscription } = require('./generate_voice.cjs');
                const result = await fetchElevenLabsSubscription(keyToUse || savedKey);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        };

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                let data = {};
                try { data = JSON.parse(body || '{}'); } catch (e) {}
                handleFetchSub(data.apiKey || queryKey);
            });
            return;
        } else {
            handleFetchSub(queryKey);
            return;
        }
    }

    // 5g. API pour générer une voix off via ElevenLabs
    if (cleanUrl === '/api/tts/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { generateVoice } = require('./generate_voice.cjs');
                const data = JSON.parse(body || '{}');
                const { text, apiKey, voiceId, modelId, filename } = data;

                if (!text || !text.trim()) {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Texte manquant pour la voix off' }));
                }

                const safeName = filename 
                    ? path.basename(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '_')
                    : `voix_off_${Date.now()}.mp3`;

                const outPath = path.join(ROOT_DIR, '01_Assets', 'Voix_Off', safeName);

                const result = await generateVoice({
                    text: text.trim(),
                    key: apiKey,
                    voice: voiceId,
                    model: modelId,
                    out: outPath
                });

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({
                    success: true,
                    engine: 'elevenlabs',
                    voice: result.voice,
                    model: result.model,
                    filename: safeName,
                    relativePath: `01_Assets/Voix_Off/${safeName}`,
                    sizeBytes: result.sizeBytes
                }));
            } catch (err) {
                console.error('Erreur génération ElevenLabs :', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5h. API YouTube Clip & Transcription
    if (cleanUrl === '/api/youtube/info' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { getVideoInfo } = require('./youtube_clip.cjs');
                const data = JSON.parse(body || '{}');
                const info = await getVideoInfo(data.url);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify({ success: true, info }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (cleanUrl === '/api/youtube/transcript' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { getVideoTranscript } = require('./youtube_clip.cjs');
                const data = JSON.parse(body || '{}');
                const result = await getVideoTranscript(data.url, data.lang || 'fr');
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (cleanUrl === '/api/youtube/download' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { downloadClip } = require('./youtube_clip.cjs');
                const data = JSON.parse(body || '{}');
                const result = await downloadClip({
                    url: data.url,
                    start: data.start,
                    end: data.end,
                    outputPath: data.out
                });
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 5i. API Cartes (Maps HD sans watermark)
    if (cleanUrl === '/api/maps/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { captureMap } = require('./fetch_map.cjs');
                const data = JSON.parse(body || '{}');
                const isVertical = data.format === '9:16';
                const width = isVertical ? 1080 : (data.width || 1920);
                const height = isVertical ? 1920 : (data.height || 1080);

                const result = await captureMap({
                    query: data.query,
                    lat: data.lat !== undefined ? parseFloat(data.lat) : undefined,
                    lon: data.lon !== undefined ? parseFloat(data.lon) : undefined,
                    zoom: data.zoom ? parseInt(data.zoom, 10) : 12,
                    style: data.style || 'dark',
                    pin: !!data.pin,
                    pinColor: data.pinColor || '#ff3344',
                    width,
                    height,
                    outPath: data.out
                });
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
                return res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // 6. Gestion des requêtes de fichiers statiques
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/09_Pages/home.html';
    }

    // Réacheminement automatique des dossiers racine si demandés depuis 09_Pages
    if (reqPath.startsWith('/09_Pages/01_Assets/') || 
        reqPath.startsWith('/09_Pages/02_Composants/') || 
        reqPath.startsWith('/09_Pages/03_Chaines/') || 
        reqPath.startsWith('/09_Pages/04_Videos/') || 
        reqPath.startsWith('/09_Pages/05_Scenes/') || 
        reqPath.startsWith('/09_Pages/06_Templates/') || 
        reqPath.startsWith('/09_Pages/07_Scripts/') || 
        reqPath.startsWith('/09_Pages/08_Rendus/')) {
        reqPath = reqPath.replace('/09_Pages', '');
    }

    let filePath = path.join(ROOT_DIR, reqPath);

    // Vérifier dans les données utilisateur ou racine
    if (process.env.VIBE_USER_DATA) {
        const inUserData = path.join(process.env.VIBE_USER_DATA, reqPath);
        if (fs.existsSync(inUserData)) {
            filePath = inUserData;
        }
    }

    // Résolution intelligente : si non trouvé à la racine, vérifier dans 09_Pages/ (ex: /home.html ou /studio.html)
    if (!fs.existsSync(filePath)) {
        const inPages = path.join(ROOT_DIR, '09_Pages', reqPath);
        if (fs.existsSync(inPages)) {
            filePath = inPages;
        }
    }

    const isInsideRoot = filePath.startsWith(ROOT_DIR);
    const isInsideUserData = Boolean(process.env.VIBE_USER_DATA && filePath.startsWith(process.env.VIBE_USER_DATA));
    if (!isInsideRoot && !isInsideUserData) {
        res.writeHead(403);
        return res.end('Accès interdit');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            return res.end(`404: Fichier non trouvé (${reqPath})`);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Support HTTP 206 Partial Content pour audio et vidéo HTML5
        const range = req.headers.range;
        if (range && (ext === '.mp3' || ext === '.wav' || ext === '.mp4')) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunksize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            fileStream.pipe(res);
            return;
        }

        const isHtml = ext === '.html';
        const cacheControl = isHtml 
            ? 'no-cache, must-revalidate' 
            : 'public, max-age=86400, stale-while-revalidate=3600';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': cacheControl,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*'
        });

        if (req.method === 'HEAD') {
            return res.end();
        }

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });
});

function executeRender(videoName) {
    startNativeRender(videoName);
}

function startNativeRender(videoName) {
    renderState.statusText = 'Lancement de Chrome Headless & FFmpeg (Zéro Dépendance)...';
    renderState.progress = 20;
    renderState.logs.push('Démarrage de render.cjs...');

    const renderScript = path.join(ROOT_DIR, '07_Scripts', 'render.cjs');
    const child = spawn('node', [renderScript, videoName], { cwd: ROOT_DIR });
    currentRenderProcess = child;

    child.stdout.on('data', (d) => {
        const str = d.toString();
        renderState.logs.push(str.trim());
        
        // Détecter la progression dans la sortie console
        const match = str.match(/\[(\d+)%\]/);
        if (match) {
            renderState.progress = parseInt(match[1]);
            renderState.statusText = `Rendu en cours : ${renderState.progress}%`;
        }
    });

    child.stderr.on('data', (d) => {
        renderState.logs.push(d.toString().trim());
    });

    child.on('close', (code) => {
        currentRenderProcess = null;
        renderState.isRendering = false;
        if (code === 0) {
            renderState.progress = 100;
            renderState.statusText = 'Rendu terminé avec succès !';
            renderState.logs.push('✅ Rendu finalisé.');
        } else {
            renderState.statusText = 'Échec du rendu (Code: ' + code + ')';
            renderState.logs.push('❌ Le processus s\'est arrêté avec code ' + code);
        }
    });
}

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/09_Pages/home.html`;
    console.log(`\n======================================================`);
    console.log(`🎬  VIBEEDITOR LANCÉ AVEC SUCCÈS !`);
    console.log(`👉  URL : ${url}`);
    console.log(`📁  Racine : ${ROOT_DIR}`);
    console.log(`⌨️   Appuyez sur [Ctrl + C] pour arrêter le serveur.`);
    console.log(`======================================================\n`);

    const startCmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(startCmd, (err) => {
        if (err) console.log(`Ouvrez manuellement votre navigateur sur ${url}`);
    });
});
