/**
 * 07_Scripts/generate_bg.cjs
 * Générateur Universel d'Arrière-Plans Animés pour Vidéos & Templates (VibeEditor)
 * 
 * Styles disponibles :
 *  1. 'saas'        : Fond uni (noir, blanc, etc.) + néons animés avec couleurs d'harmonisation
 *                     dégradées pour lisser les transitions et éliminer tout trait dur.
 *  2. 'aurora'      : Volutes néons floutées organiques (Linear / Vercel style).
 *  3. 'gradients'   : Mesh gradient dynamique multicouche à points d'ancrage oscillants.
 *  4. 'waves'       : Vagues sinusoïdales fluides animées en parallaxe (SVG / CSS).
 *  5. 'grid'        : Grille perspective 3D ou dot-matrix avec balayage lumineux.
 * 
 * Usage CLI :
 *   node 07_Scripts/generate_bg.cjs --style saas --bg "#ffffff" --accent "#e11d48" --soft "#fb7185" --out 05_Scenes/bg_saas_white.html
 *   node 07_Scripts/generate_bg.cjs --style saas --bg "#09090b" --accent "#10a37f" --format 16:9
 *   node 07_Scripts/generate_bg.cjs --style waves --bg "#050d1a" --accent "#06b6d4" --format 9:16
 *   node 07_Scripts/generate_bg.cjs --style gradients --palette violet
 *   node 07_Scripts/generate_bg.cjs --list
 */

const fs = require('fs');
const path = require('path');

const PRESET_PALETTES = {
    red: {
        name: 'Crimson & Soft Rose (Keynote Red)',
        bg: '#ffffff',
        accent: '#e11d48',
        soft: '#fb7185',
        c3: '#fda4af'
    },
    dark_red: {
        name: 'OLED Dark & Neon Crimson',
        bg: '#09090b',
        accent: '#e11d48',
        soft: '#9f1239',
        c3: '#f43f5e'
    },
    emerald: {
        name: 'OpenAI Mint & Emerald Glow',
        bg: '#09090b',
        accent: '#10a37f',
        soft: '#34d399',
        c3: '#059669'
    },
    cyan: {
        name: 'Electric Cyan & Sky Blue',
        bg: '#050d1a',
        accent: '#06b6d4',
        soft: '#38bdf8',
        c3: '#0284c7'
    },
    violet: {
        name: 'Cyber Violet & Lavender Glow',
        bg: '#09090b',
        accent: '#8b5cf6',
        soft: '#c084fc',
        c3: '#6366f1'
    },
    amber: {
        name: 'Warm Gold & Amber Sun',
        bg: '#09090b',
        accent: '#f59e0b',
        soft: '#fbbf24',
        c3: '#d97706'
    },
    white_minimal: {
        name: 'Pure White Studio & Slate Glow',
        bg: '#ffffff',
        accent: '#64748b',
        soft: '#cbd5e1',
        c3: '#94a3b8'
    }
};

function hexToRgba(hex, alpha = 1) {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isLightColor(hex) {
    const clean = hex.replace('#', '').trim();
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    // Formule de luminance relative standard ITU-R BT.709
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 140;
}

function generateBackgroundSnippet({
    style = 'saas',
    bg = '#09090b',
    accent = '#e11d48',
    soft = '',
    format = '16:9',
    duration = 20,
    grid = true
}) {
    const isVertical = format === '9:16';
    const W = isVertical ? 1080 : 1920;
    const H = isVertical ? 1920 : 1080;
    const lightMode = isLightColor(bg);

    // Calcul de la couleur d'harmonisation douce si non fournie
    const softColor = soft || (lightMode ? hexToRgba(accent, 0.45) : hexToRgba(accent, 0.75));

    let specificCss = '';
    let specificHtml = '';
    let specificJs = '';

    const gridLineColor = lightMode ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.035)';

    // =========================================================================
    // STYLE 1 : SAAS (FOND UNI + NÉONS HARMONISÉS MULTI-COUCHES SANS TRAIT DUR)
    // =========================================================================
    if (style === 'saas') {
        const cCore = hexToRgba(accent, lightMode ? 0.18 : 0.28);
        const cSoft = hexToRgba(softColor, lightMode ? 0.12 : 0.18);
        const cOuter = hexToRgba(softColor, lightMode ? 0.04 : 0.06);

        specificCss = `
        .bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${bg};
            perspective: 1000px;
        }
        /* Orbes avec double halo dégradé pour faire fondre les bords et éviter tout trait net */
        .saas-light-cluster {
            position: absolute; border-radius: 50%; pointer-events: none;
            will-change: transform;
        }
        .light-1 {
            width: ${Math.round(W * 0.48)}px; height: ${Math.round(W * 0.48)}px;
            top: 10%; left: 15%;
            background: radial-gradient(circle, ${cCore} 0%, ${cSoft} 45%, ${cOuter} 70%, transparent 85%);
            filter: blur(100px);
        }
        .light-2 {
            width: ${Math.round(W * 0.52)}px; height: ${Math.round(W * 0.52)}px;
            bottom: 12%; right: 18%;
            background: radial-gradient(circle, ${cCore} 0%, ${cSoft} 40%, ${cOuter} 68%, transparent 85%);
            filter: blur(110px);
        }
        .light-3 {
            width: ${Math.round(W * 0.38)}px; height: ${Math.round(W * 0.38)}px;
            top: 45%; left: 52%;
            background: radial-gradient(circle, ${cSoft} 0%, ${cOuter} 55%, transparent 80%);
            filter: blur(90px);
        }
        ${grid ? `
        .bg-subtle-grid {
            position: absolute; inset: 0;
            background-image: 
                linear-gradient(${gridLineColor} 1px, transparent 1px),
                linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px);
            background-size: 64px 64px;
            pointer-events: none;
        }` : ''}`;

        specificHtml = `
        <div class="bg-container">
            ${grid ? '<div class="bg-subtle-grid"></div>' : ''}
            <div class="saas-light-cluster light-1"></div>
            <div class="saas-light-cluster light-2"></div>
            <div class="saas-light-cluster light-3"></div>
        </div>`;

        specificJs = `
        // Mouvement continu et sinusoïdal des orbes néons
        tl.to('.light-1', {
            x: ${Math.round(W * 0.08)}, y: ${Math.round(H * 0.07)}, scale: 1.10,
            duration: ${duration / 2}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);
        tl.to('.light-2', {
            x: -${Math.round(W * 0.09)}, y: -${Math.round(H * 0.06)}, scale: 1.14,
            duration: ${duration * 0.55}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);
        tl.to('.light-3', {
            x: ${Math.round(W * 0.06)}, y: -${Math.round(H * 0.08)}, scale: 0.92,
            duration: ${duration * 0.42}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);`;

    // =========================================================================
    // STYLE 2 : WAVES (VAGUES SINUSOÏDALES FLUIDES MULTICOUCHES)
    // =========================================================================
    } else if (style === 'waves') {
        const w1 = hexToRgba(accent, lightMode ? 0.15 : 0.25);
        const w2 = hexToRgba(softColor, lightMode ? 0.10 : 0.18);
        const w3 = hexToRgba(accent, lightMode ? 0.06 : 0.12);

        specificCss = `
        .bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${bg};
        }
        .wave-svg {
            position: absolute; width: 220%; height: 60%; left: -60%; bottom: -5%;
            pointer-events: none; will-change: transform;
        }
        .wave-top { bottom: 15%; opacity: 0.7; }
        .wave-mid { bottom: 5%; opacity: 0.85; }
        .wave-back { bottom: -2%; opacity: 0.5; }`;

        specificHtml = `
        <div class="bg-container">
            <svg class="wave-svg wave-back" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="${w3}" d="M0,192L60,186.7C120,181,240,171,360,176C480,181,600,203,720,197.3C840,192,960,160,1080,149.3C1200,139,1320,149,1380,154.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
            <svg class="wave-svg wave-mid" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="${w2}" d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,149.3C840,139,960,149,1080,165.3C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
            <svg class="wave-svg wave-top" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="${w1}" d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,192C840,203,960,181,1080,160C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
        </div>`;

        specificJs = `
        tl.to('.wave-top', { x: 180, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);
        tl.to('.wave-mid', { x: -160, duration: 8.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);
        tl.to('.wave-back', { x: 120, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);`;

    // =========================================================================
    // STYLE 3 : AURORA (VOLUTES NÉON LINÉAIRES ET ORGANIQUES)
    // =========================================================================
    } else if (style === 'aurora') {
        const c1 = hexToRgba(accent, lightMode ? 0.22 : 0.45);
        const c2 = hexToRgba(softColor, lightMode ? 0.16 : 0.35);

        specificCss = `
        .bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${bg};
        }
        .aurora-beam {
            position: absolute; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            filter: blur(120px); opacity: 0.85; pointer-events: none;
            will-change: transform;
        }
        .beam-1 {
            width: ${Math.round(W * 0.70)}px; height: ${Math.round(H * 0.65)}px;
            background: linear-gradient(135deg, ${c1} 0%, ${c2} 100%);
            top: -20%; left: -10%;
        }
        .beam-2 {
            width: ${Math.round(W * 0.65)}px; height: ${Math.round(H * 0.70)}px;
            background: linear-gradient(225deg, ${c2} 0%, ${c1} 100%);
            bottom: -25%; right: -15%;
        }`;

        specificHtml = `
        <div class="bg-container">
            <div class="aurora-beam beam-1"></div>
            <div class="aurora-beam beam-2"></div>
        </div>`;

        specificJs = `
        tl.to('.beam-1', {
            x: ${Math.round(W * 0.12)}, y: ${Math.round(H * 0.10)}, rotation: 25,
            duration: ${duration / 2}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);
        tl.to('.beam-2', {
            x: -${Math.round(W * 0.14)}, y: -${Math.round(H * 0.10)}, rotation: -20,
            duration: ${duration * 0.6}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);`;

    // =========================================================================
    // STYLE 4 : GRADIENTS (MESH GRADIENT LIQUIDE AVEC POINTS OSCILLANTS)
    // =========================================================================
    } else if (style === 'gradients' || style === 'mesh') {
        const c1 = hexToRgba(accent, lightMode ? 0.20 : 0.40);
        const c2 = hexToRgba(softColor, lightMode ? 0.15 : 0.30);
        const c3 = hexToRgba(accent, lightMode ? 0.10 : 0.20);

        specificCss = `
        .bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${bg};
        }
        .mesh-blob {
            position: absolute; border-radius: 50%; filter: blur(130px);
            pointer-events: none; will-change: transform;
        }
        .blob-1 { top: 15%; left: 20%; width: 600px; height: 600px; background: ${c1}; }
        .blob-2 { bottom: 15%; right: 20%; width: 680px; height: 680px; background: ${c2}; }
        .blob-3 { top: 40%; right: 40%; width: 520px; height: 520px; background: ${c3}; }`;

        specificHtml = `
        <div class="bg-container">
            <div class="mesh-blob blob-1"></div>
            <div class="mesh-blob blob-2"></div>
            <div class="mesh-blob blob-3"></div>
        </div>`;

        specificJs = `
        tl.to('.blob-1', { x: 120, y: 90, scale: 1.15, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);
        tl.to('.blob-2', { x: -140, y: -80, scale: 0.90, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);
        tl.to('.blob-3', { x: 80, y: -100, scale: 1.20, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0);`;

    // =========================================================================
    // STYLE 5 : GRID / MATRIX-GRID (GRILLE 3D AVEC HORIZON LUMINEUX)
    // =========================================================================
    } else {
        const cGlow = hexToRgba(accent, lightMode ? 0.15 : 0.35);
        const gridColor = hexToRgba(accent, lightMode ? 0.08 : 0.18);

        specificCss = `
        .bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${bg};
            perspective: 600px;
        }
        .grid-horizon {
            position: absolute; left: 0; right: 0; top: 42%; height: 260px;
            background: radial-gradient(ellipse at center, ${cGlow} 0%, transparent 75%);
            filter: blur(85px); pointer-events: none;
        }
        .grid-plane-3d {
            position: absolute; width: 200%; height: 200%; left: -50%; top: -20%;
            background-image: 
                linear-gradient(${gridColor} 1.5px, transparent 1.5px),
                linear-gradient(90deg, ${gridColor} 1.5px, transparent 1.5px);
            background-size: 72px 72px;
            transform: rotateX(65deg);
            transform-origin: center center;
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 80%);
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 80%);
        }`;

        specificHtml = `
        <div class="bg-container">
            <div class="grid-horizon"></div>
            <div class="grid-plane-3d" id="gridPlane"></div>
        </div>`;

        specificJs = `
        tl.to('#gridPlane', {
            backgroundPosition: '0px 720px',
            duration: ${duration},
            ease: 'none',
            repeat: -1
        }, 0);
        tl.to('.grid-horizon', {
            opacity: 0.9, scaleY: 1.15,
            duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);`;
    }

    return {
        W, H, bg, accent, soft: softColor, specificCss, specificHtml, specificJs
    };
}

function buildFullHtmlPage(options) {
    const { W, H, bg, specificCss, specificHtml, specificJs } = generateBackgroundSnippet(options);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Animated Background - ${options.style || 'saas'}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%; height: 100%; overflow: hidden; background: ${bg};
            display: flex; align-items: center; justify-content: center;
        }
        #stage {
            width: ${W}px; height: ${H}px;
            position: absolute; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
            background: ${bg};
        }
        ${specificCss}
    </style>
</head>
<body>
    <div id="stage">
        ${specificHtml}
    </div>

    <script>
        const DURATION = ${options.duration || 20};
        const tl = gsap.timeline({ paused: false });

        ${specificJs}

        // Interface Timeline Studio VibeEditor
        window.__timeline = {
            duration: () => DURATION,
            seek: (t) => tl.seek(t, false),
            pause: () => tl.pause(),
            play: () => tl.play()
        };
    </script>
</body>
</html>`;
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);

    const getArg = (flag) => {
        const idx = args.indexOf(flag);
        return (idx >= 0 && args[idx + 1]) ? args[idx + 1] : null;
    };

    if (args.includes('--list') || args.includes('-l')) {
        console.log(`\n🎨 STYLES ET PALETTES DISPONIBLES (generate_bg.cjs) :`);
        console.log(`=======================================================`);
        console.log(`Styles :`);
        console.log(`  - saas        : Fond uni (blanc/noir) + néons harmonisés multi-couches [Défaut]`);
        console.log(`  - waves       : Vagues sinusoïdales fluides animées en parallaxe`);
        console.log(`  - aurora      : Volutes néon floutées organiques (Linear / Vercel style)`);
        console.log(`  - gradients   : Mesh gradient liquide dynamique à points oscillants`);
        console.log(`  - grid        : Grille perspective 3D animée avec horizon néon`);
        console.log(`\nPalettes prédéfinies :`);
        Object.entries(PRESET_PALETTES).forEach(([k, v]) => {
            console.log(`  - ${k.padEnd(14)}: ${v.name} (bg: ${v.bg}, accent: ${v.accent}, soft: ${v.soft})`);
        });
        console.log(`=======================================================\n`);
        process.exit(0);
    }

    const paletteKey = getArg('--palette');
    const preset = paletteKey && PRESET_PALETTES[paletteKey] ? PRESET_PALETTES[paletteKey] : null;

    const style = getArg('--style') || 'saas';
    const bg = getArg('--bg') || (preset ? preset.bg : '#09090b');
    const accent = getArg('--accent') || (preset ? preset.accent : '#e11d48');
    const soft = getArg('--soft') || (preset ? preset.soft : '');
    const format = getArg('--format') || '16:9';
    const duration = parseFloat(getArg('--duration') || '20');
    const grid = !args.includes('--no-grid');
    let out = getArg('--out');

    if (!out) {
        const scenesDir = path.join(__dirname, '..', '05_Scenes');
        if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });
        const cleanBg = bg.replace('#', '');
        const cleanAccent = accent.replace('#', '');
        out = path.join(scenesDir, `bg_${style}_${cleanBg}_${cleanAccent}.html`);
    } else if (!path.isAbsolute(out)) {
        out = path.join(__dirname, '..', out);
    }

    const htmlContent = buildFullHtmlPage({ style, bg, accent, soft, format, duration, grid });
    fs.writeFileSync(out, htmlContent, 'utf8');

    const rel = path.relative(path.join(__dirname, '..'), out).replace(/\\/g, '/');
    console.log(`\n✨ Background animé généré avec succès !`);
    console.log(`   🎨 Style    : ${style.toUpperCase()}`);
    console.log(`   🎨 Fond     : ${bg}`);
    console.log(`   🌈 Accent   : ${accent}`);
    console.log(`   ✨ Adouci   : ${soft || 'Auto-calculé pour transition fondue sans trait dur'}`);
    console.log(`   📐 Format   : ${format}`);
    console.log(`   📁 Fichier  : ${rel}\n`);
}

module.exports = {
    generateBackgroundSnippet,
    buildFullHtmlPage,
    PRESET_PALETTES
};
