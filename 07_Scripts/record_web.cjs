/**
 * 07_Scripts/record_web.cjs
 * Outil universel de capture d'articles et pages web (Photo & Vidéo défilante MP4)
 * 100% GRATUIT, LOCAL & SANS AUCUN WATERMARK
 * 
 * Fonctionnalités :
 * - Mode Photo (capture HD / 4K / plein écran ou sélecteur spécifique)
 * - Mode Vidéo (défilement fluide / smooth scrolling cinématique encodé en MP4)
 * - Nettoyage automatique des bannières de cookies / popups RGPD
 * - Option de surlignage de texte (effet marqueur jaune documentaire)
 * - Support des formats Horizontal (16:9 - 1920x1080) et Vertical (Shorts/Reels 9:16 - 1080x1920)
 * - Cadre de navigateur moderne optionnel (--mockup)
 * 
 * Exemples d'utilisation :
 *   1. Capture photo d'un article :
 *      node 07_Scripts/record_web.cjs --url "https://fr.wikipedia.org/wiki/Intelligence_artificielle" --mode image
 * 
 *   2. Vidéo défilante de 6 secondes en 1080p :
 *      node 07_Scripts/record_web.cjs --url "https://techcrunch.com" --mode video --duration 6
 * 
 *   3. Vidéo verticale Shorts avec surlignage d'une citation :
 *      node 07_Scripts/record_web.cjs --url "https://..." --mode video --preset short --highlight "phrase importante"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

// ==========================================
// 1. Détection des exécutables (Chrome & FFmpeg)
// ==========================================
function getChromePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }
    return 'chrome';
}

function getFfmpegPath() {
    try {
        const installer = require('@ffmpeg-installer/ffmpeg');
        if (installer && installer.path && fs.existsSync(installer.path)) {
            return installer.path;
        }
    } catch (e) {}

    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        return 'ffmpeg';
    } catch (e) {}

    const candidates = [
        path.join(__dirname, '..', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe')
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }
    return null;
}

// ==========================================
// 2. Parsing des arguments CLI
// ==========================================
function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        url: '',
        mode: 'image', // 'image' ou 'video'
        out: '',
        preset: 'desktop', // 'desktop' (1920x1080), 'short' / 'mobile' (1080x1920), 'square' (1080x1080)
        width: 1920,
        height: 1080,
        duration: 5, // secondes pour le mode vidéo
        fps: 30,
        fullPage: false,
        selector: null,
        scrollDistance: null,
        clean: true,
        dark: false,
        delay: 1500,
        highlight: null,
        mockup: false,
        suffix: ''
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        if (arg === '--url' && next) { config.url = next; i++; }
        else if ((arg === '--mode' || arg === '-m') && next) { config.mode = next.toLowerCase(); i++; }
        else if ((arg === '--out' || arg === '-o') && next) { config.out = next; i++; }
        else if (arg === '--preset' && next) { config.preset = next.toLowerCase(); i++; }
        else if (arg === '--width' && next) { config.width = parseInt(next, 10); i++; }
        else if (arg === '--height' && next) { config.height = parseInt(next, 10); i++; }
        else if (arg === '--duration' && next) { config.duration = parseFloat(next); i++; }
        else if (arg === '--fps' && next) { config.fps = parseInt(next, 10); i++; }
        else if (arg === '--full-page' || arg === '--fullpage') { config.fullPage = true; }
        else if (arg === '--selector' && next) { config.selector = next; i++; }
        else if (arg === '--scroll-distance' && next) { config.scrollDistance = parseInt(next, 10); i++; }
        else if (arg === '--no-clean') { config.clean = false; }
        else if (arg === '--dark') { config.dark = true; }
        else if (arg === '--delay' && next) { config.delay = parseInt(next, 10); i++; }
        else if (arg === '--highlight' && next) { config.highlight = next; i++; }
        else if (arg === '--mockup') { config.mockup = true; }
        else if (arg === '--suffix' && next) { config.suffix = next; i++; }
        else if (!config.url && arg.startsWith('http')) { config.url = arg; }
    }

    // Application des présets de résolution
    if (config.preset === 'short' || config.preset === 'mobile' || config.preset === 'vertical') {
        config.width = 1080;
        config.height = 1920;
    } else if (config.preset === 'square') {
        config.width = 1080;
        config.height = 1080;
    } else if (config.preset === '4k') {
        config.width = 3840;
        config.height = 2160;
    }

    if (config.mode === 'photo' || config.mode === 'screenshot') config.mode = 'image';
    if (config.mode === 'scroll' || config.mode === 'rec') config.mode = 'video';

    return config;
}

// Fonction d'assouplissement pour le scroll cinématographique (Ease In Out Cubic)
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ==========================================
// 3. Script Principal
// ==========================================
async function main() {
    const config = parseArgs();

    if (!config.url) {
        console.error("❌ Erreur : Paramètre --url manquant.");
        console.log("Usage : node 07_Scripts/record_web.cjs --url <URL> [--mode image|video] [--duration 5] [--out chemin]");
        process.exit(1);
    }

    const chromePath = getChromePath();
    if (!chromePath || (!fs.existsSync(chromePath) && chromePath === 'chrome')) {
        console.error("❌ Erreur : Impossible de trouver Google Chrome ou Microsoft Edge.");
        process.exit(1);
    }

    const ffmpegPath = getFfmpegPath();
    if (config.mode === 'video' && !ffmpegPath) {
        console.error("❌ Erreur : FFmpeg est requis pour le mode vidéo.");
        process.exit(1);
    }

    // Détermination du nom de fichier de sortie par défaut
    let domain = 'webpage';
    try {
        domain = new URL(config.url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
    } catch (e) {}

    const timestamp = Date.now().toString().slice(-6);
    const suffixStr = config.suffix ? `_${config.suffix}` : '';

    if (!config.out) {
        if (config.mode === 'image') {
            const outDir = path.resolve(__dirname, '..', '01_Assets', 'Images');
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            config.out = path.join(outDir, `web_${domain}_${timestamp}${suffixStr}.png`);
        } else {
            const outDir = path.resolve(__dirname, '..', '01_Assets', 'Videos');
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            config.out = path.join(outDir, `web_${domain}_${timestamp}${suffixStr}.mp4`);
        }
    } else {
        config.out = path.resolve(process.cwd(), config.out);
        const parentDir = path.dirname(config.out);
        if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    }

    console.log(`\n======================================================`);
    console.log(`🌐 RECORD WEB (Capture Web Haute Définition)`);
    console.log(`🔗 URL         : ${config.url}`);
    console.log(`🎞️  Mode        : ${config.mode.toUpperCase()}`);
    console.log(`📐 Résolution  : ${config.width}x${config.height} (${config.preset})`);
    if (config.mode === 'video') {
        console.log(`⏱️  Durée       : ${config.duration}s @ ${config.fps} FPS`);
    }
    console.log(`💾 Sortie      : ${config.out}`);
    console.log(`======================================================\n`);

    console.log('🚀 Lancement du navigateur...');
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--hide-scrollbars',
            `--window-size=${config.width},${config.height}`
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: config.width,
            height: config.height,
            deviceScaleFactor: 1
        });

        // Simuler un navigateur complet pour éviter les détections de bots
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        if (config.dark) {
            await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
        }

        console.log(`🌐 Navigation vers ${config.url} ...`);
        await page.goto(config.url, {
            waitUntil: 'networkidle2',
            timeout: 45000
        }).catch(err => {
            console.warn(`⚠️ Avertissement délai de chargement : ${err.message}. Poursuite de la capture...`);
        });

        if (config.delay > 0) {
            await new Promise(r => setTimeout(r, config.delay));
        }

        // Nettoyage automatique des bandeaux de cookies / RGPD / popups
        if (config.clean) {
            console.log('🧹 Nettoyage des bandeaux cookies et popups...');
            await page.evaluate(() => {
                const selectorsToRemove = [
                    '#onetrust-consent-sdk', '#onetrust-banner-sdk', '.cookie-banner', '#cookie-banner',
                    '#cookie-notice', '.consent-banner', '.gdpr-banner', '[id*="cookie"]', '[class*="cookie"]',
                    '[id*="consent"]', '[class*="consent"]', '[class*="modal-backdrop"]', '.fc-consent-root',
                    '#sp_message_container', '.didomi-popup-container', '#cmpbox'
                ];
                selectorsToRemove.forEach(sel => {
                    try {
                        document.querySelectorAll(sel).forEach(el => {
                            const style = window.getComputedStyle(el);
                            if (style.position === 'fixed' || style.position === 'sticky' || parseInt(style.zIndex, 10) > 100) {
                                el.remove();
                            }
                        });
                    } catch (e) {}
                });

                // Débloquer le défilement si le body a été verrouillé
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
            });
        }

        // Surlignage d'un texte ou d'un sélecteur si demandé
        if (config.highlight) {
            console.log(`🖍️ Surlignage de l'élément / texte : « ${config.highlight} »`);
            await page.evaluate((highlightText) => {
                // Recherche par sélecteur CSS
                try {
                    const el = document.querySelector(highlightText);
                    if (el) {
                        el.style.backgroundColor = '#fff3a8';
                        el.style.color = '#000000';
                        el.style.padding = '4px 8px';
                        el.style.borderRadius = '4px';
                        el.style.boxShadow = '0 0 15px rgba(255, 235, 59, 0.7)';
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                    }
                } catch (e) {}

                // Recherche par texte dans le DOM
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let node;
                while ((node = walker.nextNode())) {
                    if (node.nodeValue && node.nodeValue.toLowerCase().includes(highlightText.toLowerCase())) {
                        const span = document.createElement('mark');
                        span.style.backgroundColor = '#ffe564';
                        span.style.color = '#111';
                        span.style.padding = '2px 6px';
                        span.style.borderRadius = '4px';
                        span.style.boxShadow = '0 0 10px rgba(255, 235, 59, 0.8)';
                        
                        const parent = node.parentNode;
                        const parts = node.nodeValue.split(new RegExp(`(${highlightText})`, 'gi'));
                        const frag = document.createDocumentFragment();
                        parts.forEach(part => {
                            if (part.toLowerCase() === highlightText.toLowerCase()) {
                                const m = span.cloneNode(true);
                                m.textContent = part;
                                frag.appendChild(m);
                            } else {
                                frag.appendChild(document.createTextNode(part));
                            }
                        });
                        parent.replaceChild(frag, node);
                        break;
                    }
                }
            }, config.highlight);
            await new Promise(r => setTimeout(r, 600));
        }

        // Ajout d'un cadre de navigateur élégant (--mockup)
        if (config.mockup) {
            await page.evaluate((currentUrl) => {
                let domainDisplay = 'https://...';
                try {
                    const u = new URL(currentUrl);
                    domainDisplay = u.hostname + u.pathname;
                    if (domainDisplay.length > 50) domainDisplay = domainDisplay.substring(0, 47) + '...';
                } catch(e) {}

                const bar = document.createElement('div');
                bar.id = '__vibe_browser_mockup_bar__';
                bar.style.position = 'fixed';
                bar.style.top = '0';
                bar.style.left = '0';
                bar.style.width = '100%';
                bar.style.height = '48px';
                bar.style.backgroundColor = '#18181b';
                bar.style.borderBottom = '1px solid #27272a';
                bar.style.zIndex = '99999999';
                bar.style.display = 'flex';
                bar.style.alignItems = 'center';
                bar.style.padding = '0 16px';
                bar.style.boxSizing = 'border-box';
                bar.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                bar.innerHTML = `
                    <div style="display:flex; gap:8px; align-items:center; margin-right:20px;">
                        <span style="width:12px; height:12px; border-radius:50%; background:#ef4444; display:inline-block;"></span>
                        <span style="width:12px; height:12px; border-radius:50%; background:#eab308; display:inline-block;"></span>
                        <span style="width:12px; height:12px; border-radius:50%; background:#22c55e; display:inline-block;"></span>
                    </div>
                    <div style="flex:1; max-width:600px; margin:0 auto; background:#27272a; height:30px; border-radius:6px; display:flex; align-items:center; padding:0 12px; color:#a1a1aa; font-size:13px;">
                        <span style="margin-right:8px; font-size:12px;">🔒</span>
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#e4e4e7;">${domainDisplay}</span>
                    </div>
                `;
                document.body.prepend(bar);
                document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0, 10) + 48) + 'px';
            }, config.url);
        }

        // ==========================================
        // MODE IMAGE (Capture Photo)
        // ==========================================
        if (config.mode === 'image') {
            console.log('📸 Enregistrement de la capture photo...');
            if (config.selector) {
                const element = await page.$(config.selector);
                if (element) {
                    await element.screenshot({ path: config.out });
                } else {
                    console.warn(`⚠️ Sélecteur « ${config.selector} » non trouvé, capture plein écran.`);
                    await page.screenshot({ path: config.out, fullPage: config.fullPage });
                }
            } else {
                await page.screenshot({
                    path: config.out,
                    fullPage: config.fullPage
                });
            }

            console.log(`\n✅ Capture photo réussie !`);
            console.log(`📁 Fichier créé : ${config.out}`);
            return;
        }

        // ==========================================
        // MODE VIDÉO (Smooth Scrolling Animé MP4)
        // ==========================================
        if (config.mode === 'video') {
            console.log(`🎬 Génération de la vidéo défilante (${config.duration}s @ ${config.fps} FPS)...`);

            // Calcul de la distance totale de scroll
            let maxScroll = config.scrollDistance;
            if (!maxScroll) {
                maxScroll = await page.evaluate(() => {
                    return Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    ) - window.innerHeight;
                });
            }
            if (maxScroll < 300) maxScroll = 600; // Défilement par défaut minimum

            console.log(`📏 Distance de défilement : ${maxScroll}px`);

            // Initialisation de l'encodeur FFmpeg
            const ffmpegArgs = [
                '-y',
                '-f', 'image2pipe',
                '-vcodec', 'mjpeg',
                '-r', String(config.fps),
                '-i', '-',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-preset', 'veryfast',
                '-movflags', '+faststart',
                config.out
            ];

            const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
            ffmpeg.stderr.on('data', () => {}); // Consommer les logs

            const totalFrames = Math.round(config.duration * config.fps);
            // Phases : 15% de pause au début, 70% de scrolling fluide, 15% de pause à la fin
            const startHoldFrames = Math.max(5, Math.round(totalFrames * 0.15));
            const endHoldFrames = Math.max(5, Math.round(totalFrames * 0.15));
            const scrollFrames = totalFrames - startHoldFrames - endHoldFrames;

            console.log(`🎞️ Capture des ${totalFrames} frames en cours...`);

            for (let i = 0; i < totalFrames; i++) {
                let currentY = 0;
                if (i < startHoldFrames) {
                    currentY = 0;
                } else if (i < startHoldFrames + scrollFrames) {
                    const progress = (i - startHoldFrames) / scrollFrames;
                    currentY = easeInOutCubic(progress) * maxScroll;
                } else {
                    currentY = maxScroll;
                }

                await page.evaluate((y) => {
                    window.scrollTo(0, y);
                }, currentY);

                const frameBuffer = await page.screenshot({
                    type: 'jpeg',
                    quality: 85
                });

                ffmpeg.stdin.write(frameBuffer);

                if ((i + 1) % 15 === 0 || i === totalFrames - 1) {
                    const percent = Math.round(((i + 1) / totalFrames) * 100);
                    process.stdout.write(`\r⏳ Encodage vidéo : ${percent}% (${i + 1}/${totalFrames} frames)`);
                }
            }

            ffmpeg.stdin.end();

            await new Promise((resolve, reject) => {
                ffmpeg.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`FFmpeg s'est arrêté avec le code d'erreur ${code}`));
                });
                ffmpeg.on('error', reject);
            });

            console.log(`\n\n✅ Vidéo MP4 générée avec succès !`);
            console.log(`📁 Fichier créé : ${config.out}`);
        }

    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error(`\n❌ Erreur fatale : ${err.message}`);
    process.exit(1);
});

