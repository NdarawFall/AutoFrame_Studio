/**
 * 07_Scripts/generate_saas_bg.cjs
 * Générateur de Backgrounds Animés SaaS Premium pour Vidéos & Templates (VibeEditor)
 * 
 * Styles disponibles :
 *  1. 'aurora'       : Volutes dégradées néons (SaaS moderne type Linear / Vercel)
 *  2. 'matrix-grid'  : Grille perspective 3D animée avec pulsation néon (Dark Tech / Keynote)
 *  3. 'mesh-gradient': Orbes fluides floutées en mouvement organique continu
 *  4. 'particles'    : Constellations de particules géométriques connectées
 *  5. 'cyber-dots'   : Matrice de points réactifs avec vague lumineuse
 * 
 * Usage CLI :
 *   node 07_Scripts/generate_saas_bg.cjs --style aurora [--palette orange|violet|cyan|emerald|monochrome] [--out 05_Scenes/bg_aurora.html]
 *   node 07_Scripts/generate_saas_bg.cjs --style matrix-grid --format 16:9
 *   node 07_Scripts/generate_saas_bg.cjs --style mesh-gradient --format 9:16 --palette emerald
 *   node 07_Scripts/generate_saas_bg.cjs --list
 */

const fs = require('fs');
const path = require('path');

const PALETTES = {
    orange: {
        name: 'Orange Hot & Amber (Vibe Neon)',
        bg: '#0A0A0F',
        c1: 'rgba(255, 107, 0, 0.65)',
        c2: 'rgba(255, 61, 0, 0.45)',
        c3: 'rgba(255, 179, 0, 0.50)',
        accent: '#FF6B00',
        grid: 'rgba(255, 107, 0, 0.06)'
    },
    violet: {
        name: 'Electric Violet & Cyber Cyan (Linear / Stripe)',
        bg: '#0B0B14',
        c1: 'rgba(99, 102, 241, 0.60)',
        c2: 'rgba(168, 85, 247, 0.50)',
        c3: 'rgba(6, 182, 212, 0.45)',
        accent: '#8B5CF6',
        grid: 'rgba(139, 92, 246, 0.06)'
    },
    cyan: {
        name: 'Deep Oceanic & Neon Cyan',
        bg: '#050D1A',
        c1: 'rgba(6, 182, 212, 0.65)',
        c2: 'rgba(14, 165, 233, 0.50)',
        c3: 'rgba(59, 130, 246, 0.40)',
        accent: '#06B6D4',
        grid: 'rgba(6, 182, 212, 0.06)'
    },
    emerald: {
        name: 'OpenAI Mint & Matrix Emerald',
        bg: '#06120E',
        c1: 'rgba(16, 163, 127, 0.65)',
        c2: 'rgba(5, 150, 105, 0.50)',
        c3: 'rgba(52, 211, 153, 0.40)',
        accent: '#10A37F',
        grid: 'rgba(16, 163, 127, 0.06)'
    },
    monochrome: {
        name: 'Minimal Luxury Dark & Light Gray',
        bg: '#09090B',
        c1: 'rgba(255, 255, 255, 0.22)',
        c2: 'rgba(161, 161, 170, 0.18)',
        c3: 'rgba(212, 212, 216, 0.14)',
        accent: '#E4E4E7',
        grid: 'rgba(255, 255, 255, 0.04)'
    }
};

function generateBackgroundSnippet({ style = 'aurora', paletteKey = 'orange', format = '16:9', duration = 20, grid = false }) {
    const pal = PALETTES[paletteKey] || PALETTES.orange;
    const isVertical = format === '9:16';
    const W = isVertical ? 1080 : 1920;
    const H = isVertical ? 1920 : 1080;

    let specificCss = '';
    let specificHtml = '';
    let specificJs = '';

    if (style === 'aurora' || style === 'mesh-gradient') {
        specificCss = `
        .saas-bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${pal.bg};
            perspective: 1000px;
        }
        .aurora-orb {
            position: absolute; border-radius: 50%; filter: blur(140px); will-change: transform;
            opacity: 0.85; pointer-events: none;
        }
        .orb-1 {
            width: ${Math.round(W * 0.55)}px; height: ${Math.round(W * 0.55)}px;
            background: radial-gradient(circle, ${pal.c1} 0%, transparent 70%);
            top: -15%; left: -10%;
        }
        .orb-2 {
            width: ${Math.round(W * 0.60)}px; height: ${Math.round(W * 0.60)}px;
            background: radial-gradient(circle, ${pal.c2} 0%, transparent 70%);
            bottom: -20%; right: -15%;
        }
        .orb-3 {
            width: ${Math.round(W * 0.45)}px; height: ${Math.round(W * 0.45)}px;
            background: radial-gradient(circle, ${pal.c3} 0%, transparent 70%);
            top: 40%; left: 35%;
        }
        .vignette-overlay {
            position: absolute; inset: 0;
            background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%);
            pointer-events: none;
        }
        ${grid ? `
        .subtle-grid {
            position: absolute; inset: 0;
            background-image: 
                linear-gradient(${pal.grid} 1px, transparent 1px),
                linear-gradient(90deg, ${pal.grid} 1px, transparent 1px);
            background-size: 80px 80px;
            pointer-events: none;
        }` : ''}
        .grain-layer {
            position: absolute; inset: 0; opacity: 0.035; pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }`;

        specificHtml = `
        <div class="saas-bg-container">
            ${grid ? '<div class="subtle-grid"></div>' : ''}
            <div class="aurora-orb orb-1"></div>
            <div class="aurora-orb orb-2"></div>
            <div class="aurora-orb orb-3"></div>
            <div class="vignette-overlay"></div>
            <div class="grain-layer"></div>
        </div>`;

        specificJs = `
        // Animation continue seek-safe des orbes néons
        tl.to('.orb-1', {
            x: ${Math.round(W * 0.12)}, y: ${Math.round(H * 0.10)}, scale: 1.15,
            duration: ${duration / 2}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);
        tl.to('.orb-2', {
            x: -${Math.round(W * 0.14)}, y: -${Math.round(H * 0.12)}, scale: 1.20,
            duration: ${duration * 0.6}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);
        tl.to('.orb-3', {
            x: ${Math.round(W * 0.08)}, y: -${Math.round(H * 0.08)}, scale: 0.90,
            duration: ${duration * 0.45}, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);`;
    } else if (style === 'matrix-grid') {
        specificCss = `
        .saas-bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${pal.bg};
            perspective: 600px;
        }
        .grid-plane {
            position: absolute; width: 200%; height: 200%; left: -50%; top: -20%;
            background-image: 
                linear-gradient(${pal.accent}33 1.5px, transparent 1.5px),
                linear-gradient(90deg, ${pal.accent}33 1.5px, transparent 1.5px);
            background-size: 80px 80px;
            transform: rotateX(65deg);
            transform-origin: center center;
            mask-image: linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 80%);
            -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 80%);
        }
        .horizon-glow {
            position: absolute; left: 0; right: 0; top: 40%; height: 280px;
            background: radial-gradient(ellipse at center, ${pal.c1} 0%, transparent 75%);
            filter: blur(80px); opacity: 0.75;
            pointer-events: none;
        }`;

        specificHtml = `
        <div class="saas-bg-container">
            <div class="horizon-glow"></div>
            <div class="grid-plane" id="gridPlane"></div>
        </div>`;

        specificJs = `
        // Défilement infini de la grille 3D
        tl.to('#gridPlane', {
            backgroundPosition: '0px 800px',
            duration: ${duration},
            ease: 'none',
            repeat: -1
        }, 0);
        tl.to('.horizon-glow', {
            opacity: 0.95, scaleY: 1.15,
            duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
        }, 0);`;
    } else {
        // Fallback particles / dots
        specificCss = `
        .saas-bg-container {
            position: absolute; inset: 0; overflow: hidden; background: ${pal.bg};
        }
        .dot-matrix {
            position: absolute; inset: 0;
            background-image: radial-gradient(${pal.accent}44 1.5px, transparent 1.5px);
            background-size: 40px 40px;
        }
        .light-sweep {
            position: absolute; width: 600px; height: 600px; border-radius: 50%;
            background: radial-gradient(circle, ${pal.c1} 0%, transparent 70%);
            filter: blur(90px); pointer-events: none;
        }`;

        specificHtml = `
        <div class="saas-bg-container">
            <div class="dot-matrix"></div>
            <div class="light-sweep" id="lightSweep"></div>
        </div>`;

        specificJs = `
        tl.fromTo('#lightSweep', 
            { x: -200, y: -200 },
            { x: ${W + 200}, y: ${H + 200}, duration: ${duration}, ease: 'sine.inOut', repeat: -1 }
        , 0);`;
    }

    return {
        W, H, pal, specificCss, specificHtml, specificJs
    };
}

// Génère un fichier HTML complet et autonome prêt à être visualisé ou rendu
function buildFullHtmlPage(options) {
    const { W, H, pal, specificCss, specificHtml, specificJs } = generateBackgroundSnippet(options);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>SaaS Premium Animated Background - ${options.style || 'aurora'}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%; height: 100%; overflow: hidden; background: #000;
            display: flex; align-items: center; justify-content: center;
        }
        #stage {
            width: ${W}px; height: ${H}px;
            position: absolute; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
            background: ${pal.bg};
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
        console.log(`\n🎨 STYLES ET PALETTES DISPONIBLES :`);
        console.log(`=======================================================`);
        console.log(`Styles :`);
        console.log(`  - aurora        : Volutes néons floutées (Linear / Vercel style) [Défaut]`);
        console.log(`  - matrix-grid   : Grille perspective 3D défilante (Dark Tech)`);
        console.log(`  - cyber-dots    : Matrice de points avec balayage lumineux`);
        console.log(`\nPalettes :`);
        Object.entries(PALETTES).forEach(([k, v]) => {
            console.log(`  - ${k.padEnd(12)}: ${v.name}`);
        });
        console.log(`=======================================================\n`);
        process.exit(0);
    }

    const style = getArg('--style') || 'aurora';
    const palette = getArg('--palette') || 'orange';
    const format = getArg('--format') || '16:9';
    const duration = parseFloat(getArg('--duration') || '20');
    const grid = args.includes('--grid');
    let out = getArg('--out');

    if (!out) {
        const scenesDir = path.join(__dirname, '..', '05_Scenes');
        if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });
        out = path.join(scenesDir, `bg_saas_${style}_${palette}.html`);
    } else if (!path.isAbsolute(out)) {
        out = path.join(__dirname, '..', out);
    }

    const htmlContent = buildFullHtmlPage({ style, paletteKey: palette, format, duration, grid });
    fs.writeFileSync(out, htmlContent, 'utf8');

    const rel = path.relative(path.join(__dirname, '..'), out).replace(/\\/g, '/');
    console.log(`\n✨ Background SaaS généré avec succès !`);
    console.log(`   🎨 Style    : ${style.toUpperCase()}`);
    console.log(`   🌈 Palette  : ${palette} (${PALETTES[palette]?.name || 'Custom'})`);
    console.log(`   📐 Format   : ${format}`);
    console.log(`   📁 Fichier  : ${rel}\n`);
}

module.exports = {
    generateBackgroundSnippet,
    buildFullHtmlPage,
    PALETTES
};

