const fs = require('fs');
const path = require('path');

// Lecture des images en base64
const orbB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/ai_energy_orb.b64'), 'utf-8').trim();
const siennaFaceB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/sienna_face.b64'), 'utf-8').trim();
const siennaAvatarB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/sienna_avatar.b64'), 'utf-8').trim();

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Showcase — 4 Dynamic Scenes (40s)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
        }
        html, body {
            width: 100%;
            height: 100%;
            background: #000000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        #stage {
            width: 1920px;
            height: 1080px;
            position: relative;
            background: #000000;
            overflow: hidden;
        }

        canvas {
            width: 1920px;
            height: 1080px;
            display: block;
        }
    </style>
</head>
<body>
    <div id="stage" data-duration="40.0">
        <canvas id="mainCanvas" width="1920" height="1080"></canvas>
    </div>

    <audio id="audioBgm" src="../01_Assets/Musiques/Wallpaper.mp3" preload="auto" loop></audio>

<script>
// ==============================================================================
// VIBEEDITOR 1.0 — 4-SCENE MASTER VIDEO (40s TOTAL / 10s PER SCENE)
// Scene 1 [0s - 10s]  : AI Phone Voice Assistant (Dark OLED, Haptic Chat Pill)
// Scene 2 [10s - 20s] : Sienna Brooks Connecting Member Card (Dark Frosted Glass)
// Scene 3 [20s - 30s] : Apple Card Typography Aurora (Black Background + Flowing Lights)
// Scene 4 [30s - 40s] : 3-Step Strategy Glowing Flowchart (Space Nebula, Animated Laser Flow)
// ==============================================================================
const canvas = document.getElementById('mainCanvas');
const g = canvas.getContext('2d');
const audioBgm = document.getElementById('audioBgm');

const DURATION = 40.0;
let isPlaying = false;
let playbackTime = 0;
let lastTimestamp = 0;
let rafId = null;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

const ease = {
    linear: t => t,
    out: t => 1 - Math.pow(1 - t, 3),
    snappy: t => 1 - Math.pow(1 - t, 4),
    inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    spring: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    smoothStep: t => t * t * (3 - 2 * t)
};

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Chargement des images réelles
const orbImg = new Image();
orbImg.src = 'data:image/png;base64,${orbB64}';

const siennaFaceImg = new Image();
siennaFaceImg.src = 'data:image/jpeg;base64,${siennaFaceB64}';

const siennaAvatarImg = new Image();
siennaAvatarImg.src = 'data:image/jpeg;base64,${siennaAvatarB64}';

// Véritable logo officiel Apple vectoriel (Path2D officiel viewBox 0 0 256 315)
const appleOfficialPath = new Path2D("M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615c-.35 1.116-6.599 22.563-21.757 44.716c-13.104 19.153-26.705 38.235-48.13 38.63c-21.05.388-27.82-12.483-51.888-12.483c-24.061 0-31.582 12.088-51.51 12.871c-20.68.783-36.428-20.71-49.64-39.793c-27-39.033-47.633-110.3-19.928-158.406c13.763-23.89 38.36-39.017 65.056-39.405c20.307-.387 39.475 13.662 51.889 13.662c12.406 0 35.699-16.895 60.186-14.414c10.25.427 39.026 4.14 57.503 31.186c-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199c-15.826.636-34.962 10.546-46.314 23.828c-10.173 11.763-19.082 30.589-16.678 48.633c17.64 1.365 35.66-8.964 46.64-22.262");

// =============================================================================
// SCENE 1 : SMARTPHONE AI VOICE ASSISTANT [0.0s - 10.0s]
// =============================================================================
function drawPhoneFrame(ctx, w, h, r) {
    ctx.fillStyle = '#22232a';
    roundRect(ctx, w / 2 + 1, -h / 2 + 160, 5, 80, 2.5);
    ctx.fill();
    roundRect(ctx, -w / 2 - 6, -h / 2 + 130, 5, 52, 2.5);
    ctx.fill();
    roundRect(ctx, -w / 2 - 6, -h / 2 + 195, 5, 52, 2.5);
    ctx.fill();
    roundRect(ctx, -w / 2 - 6, -h / 2 + 85, 5, 32, 2.5);
    ctx.fill();

    ctx.save();
    roundRect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 85;
    ctx.shadowOffsetY = 38;
    ctx.fillStyle = '#0f1015';
    ctx.fill();
    ctx.restore();

    const rimGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    rimGrad.addColorStop(0, '#525461');
    rimGrad.addColorStop(0.25, '#23242c');
    rimGrad.addColorStop(0.5, '#424450');
    rimGrad.addColorStop(0.75, '#1e1f26');
    rimGrad.addColorStop(1, '#474957');
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    roundRect(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 5);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
}

function drawPhoneScreen(ctx, sw, sh, sr, t) {
    ctx.save();
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, sr);
    ctx.clip();

    ctx.fillStyle = '#000000';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // Halo d'ambiance bleu royal ultra-fondu
    const auraPulse = 1.0 + Math.sin(t * 2.2) * 0.03;
    const auraCenterY = sh / 2 + 60;
    const auraRadius = 680 * auraPulse;

    const auraGrad = ctx.createRadialGradient(0, auraCenterY, 30, 0, auraCenterY - 120, auraRadius);
    auraGrad.addColorStop(0.0, 'rgba(45, 110, 235, 0.52)');
    auraGrad.addColorStop(0.18, 'rgba(30, 85, 210, 0.38)');
    auraGrad.addColorStop(0.38, 'rgba(18, 55, 150, 0.22)');
    auraGrad.addColorStop(0.58, 'rgba(10, 32, 95, 0.11)');
    auraGrad.addColorStop(0.78, 'rgba(4, 14, 45, 0.04)');
    auraGrad.addColorStop(0.92, 'rgba(1, 5, 18, 0.01)');
    auraGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    const softGlow = ctx.createRadialGradient(0, sh / 2 - 80, 10, 0, sh / 2 - 140, 420);
    softGlow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    softGlow.addColorStop(0.4, 'rgba(37, 99, 235, 0.08)');
    softGlow.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = softGlow;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // Orbe
    const orbAlpha = clamp(1.0 - (t - 5.4) / 0.7, 0, 1);
    const orbCenterY = -sh / 2 + 200;
    const orbSize = 135;
    const orbRotate = t * 0.45;
    const orbBreath = 1.0 + Math.sin(t * 3.0) * 0.04;

    if (orbAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = orbAlpha;
        ctx.translate(0, orbCenterY);
        ctx.scale(orbBreath * (0.3 + 0.7 * orbAlpha), orbBreath * (0.3 + 0.7 * orbAlpha));

        const orbGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
        orbGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        orbGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.18)');
        orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(orbRotate);
        if (orbImg.complete && orbImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, orbSize * 0.44, 0, Math.PI * 2);
            ctx.clip();
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(orbImg, -orbSize / 2, -orbSize / 2, orbSize, orbSize);
            ctx.restore();
        }

        ctx.rotate(-orbRotate * 2.2);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.beginPath();
        ctx.arc(0, 0, orbSize * 0.42, 0, Math.PI * 1.4);
        ctx.stroke();
        ctx.restore();
    }

    // Accueil
    const welcomeAlpha = clamp(1.0 - (t - 5.3) / 0.6, 0, 1);
    if (welcomeAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = welcomeAlpha;
        ctx.font = '500 17px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hello Robin', 0, -sh / 2 + 300);

        ctx.font = '800 29px "Inter", sans-serif';
        ctx.letterSpacing = '-0.6px';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('How can I help', 0, -sh / 2 + 344);
        ctx.fillText('you today?', 0, -sh / 2 + 380);
        ctx.restore();
    }

    // Question & Résultat Typographique
    if (t >= 6.1) {
        const qProgress = clamp((t - 6.1) / 0.5, 0, 1);
        const qSlide = (1 - ease.out(qProgress)) * 14;

        ctx.save();
        ctx.globalAlpha = qProgress;
        ctx.translate(0, qSlide);

        ctx.font = '600 12px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText('YOU', -sw / 2 + 32, -sh / 2 + 130);

        ctx.font = '600 18px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('"Show quarterly performance review"', -sw / 2 + 32, -sh / 2 + 158);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-sw / 2 + 32, -sh / 2 + 185);
        ctx.lineTo(sw / 2 - 32, -sh / 2 + 185);
        ctx.stroke();
        ctx.restore();

        if (t >= 6.8) {
            const aiProgress = clamp((t - 6.8) / 0.5, 0, 1);
            const aiSlide = (1 - ease.out(aiProgress)) * 16;

            ctx.save();
            ctx.globalAlpha = aiProgress;
            ctx.translate(0, aiSlide);

            const startY = -sh / 2 + 225;
            ctx.font = '700 12px "Inter", sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'left';
            ctx.fillText('✦ AI ASSISTANT', -sw / 2 + 32, startY);

            if (t >= 7.1) {
                const titleP = clamp((t - 7.1) / 0.4, 0, 1);
                ctx.save();
                ctx.globalAlpha = titleP;
                ctx.font = '800 24px "Inter", sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Revenue grew by ', -sw / 2 + 32, startY + 36);

                const baseWidth = ctx.measureText('Revenue grew by ').width;
                ctx.fillStyle = '#34d399';
                ctx.fillText('+34.8%', -sw / 2 + 32 + baseWidth, startY + 36);
                ctx.restore();
            }

            if (t >= 7.4) {
                const fullText = "Net revenue reached $148.2K this quarter,\\nsurpassing initial forecast targets by $32K.\\nMobile video engagement surged +142%\\nacross all active channels.";
                const streamDuration = 1.7;
                const streamRatio = clamp((t - 7.4) / streamDuration, 0, 1);
                const charCount = Math.floor(fullText.length * ease.out(streamRatio));
                const visibleText = fullText.slice(0, charCount);

                const lines = visibleText.split('\\n');
                ctx.font = '400 13.5px "Inter", sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

                let lineY = startY + 76;
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], -sw / 2 + 32, lineY);
                    lineY += 23;
                }

                if (streamRatio < 1.0 || Math.floor(t * 3.5) % 2 === 0) {
                    const lastLine = lines[lines.length - 1] || '';
                    const cursorX = -sw / 2 + 32 + ctx.measureText(lastLine).width + 3;
                    const cursorY = lineY - 23;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(cursorX, cursorY - 11, 2.2, 14);
                }
            }

            if (t >= 8.2) {
                const statsP = clamp((t - 8.2) / 0.5, 0, 1);
                ctx.save();
                ctx.globalAlpha = statsP;
                const statY = startY + 185;

                ctx.font = '800 22px "Inter", sans-serif';
                ctx.fillStyle = '#38bdf8';
                ctx.fillText('$148.2K', -sw / 2 + 32, statY);
                ctx.font = '500 12px "Inter", sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillText('Total Net Revenue', -sw / 2 + 32, statY + 20);

                const stat2X = -sw / 2 + 220;
                ctx.font = '800 22px "Inter", sans-serif';
                ctx.fillStyle = '#a855f7';
                ctx.fillText('94.6%', stat2X, statY);
                ctx.font = '500 12px "Inter", sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillText('Viewer Retention', stat2X, statY + 20);
                ctx.restore();
            }
            ctx.restore();
        }
    }

    // Chat pill
    let barWidth = 420;
    let isCompactVoice = false;
    if (t >= 3.0 && t <= 5.8) {
        isCompactVoice = true;
        if (t < 3.6) barWidth = lerp(420, 134, ease.inOut((t - 3.0) / 0.6));
        else if (t > 5.0) barWidth = lerp(134, 420, ease.inOut((t - 5.0) / 0.8));
        else barWidth = 134;
    }

    const barH = 68;
    const barR = barH / 2;
    const barY = sh / 2 - 82;

    ctx.save();
    ctx.translate(0, barY);

    if (t >= 3.5 && t <= 4.8) {
        const pulseCycle = (t * 4.5) % 1;
        const ringR = barR + pulseCycle * 40;
        const ringAlpha = (1 - pulseCycle) * 0.45;
        ctx.save();
        roundRect(ctx, -barWidth / 2 - pulseCycle * 20, -barH / 2 - pulseCycle * 10, barWidth + pulseCycle * 40, barH + pulseCycle * 20, ringR);
        ctx.strokeStyle = \`rgba(56, 189, 248, \${ringAlpha})\`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
    }

    roundRect(ctx, -barWidth / 2, -barH / 2, barWidth, barH, barR);
    ctx.shadowColor = 'rgba(2, 6, 23, 0.7)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    const barGlass = ctx.createLinearGradient(0, -barH / 2, 0, barH / 2);
    barGlass.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    barGlass.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    barGlass.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = barGlass;
    ctx.fill();

    const barBorder = ctx.createLinearGradient(-barWidth / 2, -barH / 2, barWidth / 2, barH / 2);
    barBorder.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    barBorder.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    barBorder.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = barBorder;
    ctx.stroke();

    const textAlpha = clamp((barWidth - 200) / 180, 0, 1);
    if (textAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.font = '500 17px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Ask anything...', -barWidth / 2 + 28, 0);
        ctx.restore();
    }

    // Audio Icon
    const waveTargetX = isCompactVoice && barWidth < 200 ? 0 : barWidth / 2 - 46;
    const waveX = lerp(barWidth / 2 - 46, 0, clamp((420 - barWidth) / (420 - 134), 0, 1));

    ctx.save();
    ctx.translate(waveX, 0);
    const barW = 2.2;
    const barGap = 6.2;
    const barHeights = [8, 17, 27, 17, 8];
    const isSpeaking = t >= 3.6 && t <= 5.0;

    for (let i = -2; i <= 2; i++) {
        const idx = i + 2;
        const bx = i * barGap;
        let dynamicH = barHeights[idx];
        if (isSpeaking) {
            const freq = t * 14 + idx * 1.5;
            dynamicH = barHeights[idx] * (0.6 + 0.9 * Math.abs(Math.sin(freq))) * 1.35;
        }
        roundRect(ctx, bx - barW / 2, -dynamicH / 2, barW, dynamicH, barW / 2);
        ctx.fillStyle = isSpeaking ? '#38bdf8' : '#ffffff';
        ctx.shadowColor = isSpeaking ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.35)';
        ctx.shadowBlur = isSpeaking ? 8 : 2;
        ctx.fill();
    }
    ctx.restore();

    if (t >= 2.6 && t <= 3.2) {
        const tapP = (t - 2.6) / 0.6;
        const tapX = 420 / 2 - 46;
        const tapR = 26 * tapP;
        const tapAlpha = (1 - tapP) * 0.75;
        ctx.save();
        ctx.beginPath();
        ctx.arc(tapX, 0, tapR, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255, 255, 255, \${tapAlpha * 0.5})\`;
        ctx.fill();
        ctx.strokeStyle = \`rgba(255, 255, 255, \${tapAlpha})\`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();

    // Dynamic Island
    const diW = 114;
    const diH = 32;
    const diY = -sh / 2 + 18;
    roundRect(ctx, -diW / 2, diY, diW, diH, diH / 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();
}

function renderScene1(t) {
    let camZoom = 1.0;
    let camY = 0;
    let phoneY = -470;

    if (t < 1.8) {
        const enterP = ease.snappy(clamp(t / 1.6, 0, 1));
        phoneY = lerp(-1300, -470, enterP);
    } else if (t >= 1.8 && t < 2.2) {
        phoneY = -470;
    } else if (t >= 2.2 && t < 3.2) {
        const zoomP = ease.inOut((t - 2.2) / 1.0);
        camZoom = lerp(1.0, 2.2, zoomP);
        camY = lerp(0, -90, zoomP);
        phoneY = -470;
    } else if (t >= 3.2 && t < 4.8) {
        camZoom = 2.2;
        camY = -90;
        phoneY = -470;
    } else if (t >= 4.8 && t < 6.2) {
        const transitionP = ease.inOut((t - 4.8) / 1.4);
        camZoom = lerp(2.2, 1.0, transitionP);
        camY = lerp(-90, 0, transitionP);
        phoneY = lerp(-470, 0, transitionP);
    } else {
        camZoom = 1.0;
        camY = 0;
        phoneY = Math.sin((t - 6.2) * 1.5) * 4;
    }

    g.save();
    g.translate(960, 540 + camY);
    g.scale(camZoom, camZoom);
    g.translate(0, phoneY);

    drawPhoneFrame(g, 500, 980, 62);
    drawPhoneScreen(g, 480, 960, 52, t);
    g.restore();
}

// =============================================================================
// SCENE 2 : SIENNA BROOKS MEMBER CARD [10.0s - 20.0s]
// Dark frosted card, aspect ratio 1:1 parfait sans déformation, espace aéré,
// avatar agrandi (64px) et textes généreux
// =============================================================================
function renderScene2(tRel) {
    // Fond sombre épuré professionnel sans bruit ni étoiles
    const bgGrad = g.createRadialGradient(960, 540, 50, 960, 540, 850);
    bgGrad.addColorStop(0, '#0d0f1a');
    bgGrad.addColorStop(0.6, '#06070c');
    bgGrad.addColorStop(1, '#000000');
    g.fillStyle = bgGrad;
    g.fillRect(0, 0, 1920, 1080);

    // Particules ambiantes subtiles
    for (let i = 0; i < 15; i++) {
        const px = (i * 131 + tRel * 12) % 1920;
        const py = (i * 73 + Math.sin(tRel * 0.7 + i) * 20) % 1080;
        const pAlpha = 0.08 + 0.08 * Math.sin(tRel * 1.8 + i);
        g.fillStyle = \`rgba(147, 197, 253, \${pAlpha})\`;
        g.beginPath();
        g.arc(px, py, 1.2, 0, Math.PI * 2);
        g.fill();
    }

    // Animation d'entrée de la carte (3D tilt & spring scale)
    const cardEntrance = ease.spring(clamp(tRel / 1.3, 0, 1));
    const cardScale = lerp(0.88, 1.0, cardEntrance) + Math.sin(tRel * 1.2) * 0.006;
    const cardY = lerp(600, 540, cardEntrance) + Math.sin(tRel * 1.4) * 4;
    const cardRotation = (1 - cardEntrance) * -0.04 + Math.sin(tRel * 0.9) * 0.008;

    // Dimensions géométriques optimales (hauteur ajustée pour un espace aéré parfait)
    const cardW = 560;
    const cardH = 710;
    const cardR = 54;

    g.save();
    g.translate(960, cardY);
    g.rotate(cardRotation);
    g.scale(cardScale, cardScale);

    // Ombre portée profonde et douce
    g.save();
    roundRect(g, -cardW / 2, -cardH / 2, cardW, cardH, cardR);
    g.shadowColor = 'rgba(0, 0, 0, 0.9)';
    g.shadowBlur = 80;
    g.shadowOffsetY = 38;
    g.fillStyle = '#11131c';
    g.fill();
    g.restore();

    // Fond de la carte en verre dépoli noir profond
    roundRect(g, -cardW / 2, -cardH / 2, cardW, cardH, cardR);
    const cardGrad = g.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
    cardGrad.addColorStop(0, '#1c1f2e');
    cardGrad.addColorStop(0.5, '#131520');
    cardGrad.addColorStop(1, '#0c0d14');
    g.fillStyle = cardGrad;
    g.fill();

    // Bordure spéculaire fine
    const borderGrad = g.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    g.lineWidth = 1.6;
    g.strokeStyle = borderGrad;
    g.stroke();

    // Titre "Sienna Brooks"
    g.font = '700 36px "Inter", sans-serif';
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('Sienna Brooks', 0, -cardH / 2 + 56);

    // Statut : "Connecting" avec spinner animé puis "Connected" à tRel >= 3.6s
    const isConnected = tRel >= 3.6;
    const statusY = -cardH / 2 + 96;

    if (!isConnected) {
        // Spinner Apple à 8 rayons
        const spinnerX = -48;
        const spinAngle = tRel * 9.0;
        g.save();
        g.translate(spinnerX, statusY);
        g.rotate(spinAngle);
        for (let i = 0; i < 8; i++) {
            const rayAngle = (i / 8) * Math.PI * 2;
            const rayAlpha = 0.2 + 0.8 * (i / 8);
            g.strokeStyle = \`rgba(255, 255, 255, \${rayAlpha})\`;
            g.lineWidth = 2.2;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(Math.cos(rayAngle) * 5, Math.sin(rayAngle) * 5);
            g.lineTo(Math.cos(rayAngle) * 9, Math.sin(rayAngle) * 9);
            g.stroke();
        }
        g.restore();

        g.font = '500 15px "Inter", sans-serif';
        g.fillStyle = 'rgba(255, 255, 255, 0.65)';
        g.textAlign = 'left';
        g.fillText('Connecting', -30, statusY);
    } else {
        // Badge vert "Connected"
        const badgeP = ease.spring(clamp((tRel - 3.6) / 0.8, 0, 1));
        g.save();
        g.scale(badgeP, badgeP);
        g.font = '600 15px "Inter", sans-serif';
        g.fillStyle = '#34d399';
        g.textAlign = 'center';
        g.fillText('● Connected', 0, statusY / badgeP);
        g.restore();
    }

    // Photo centrale de Sienna Brooks :
    // Format carré 1:1 STRICT (480px x 480px) pour préserver les proportions naturelles sans étirement
    const photoSize = 480;
    const photoX = -photoSize / 2;
    const photoY = -cardH / 2 + 124;
    const photoR = 36;

    g.save();
    roundRect(g, photoX, photoY, photoSize, photoSize, photoR);
    g.clip();

    g.fillStyle = '#1e2130';
    g.fillRect(photoX, photoY, photoSize, photoSize);

    if (siennaFaceImg.complete && siennaFaceImg.naturalWidth > 0) {
        const photoZoom = 1.0 + Math.sin(tRel * 0.8) * 0.012;
        g.save();
        g.translate(0, photoY + photoSize / 2);
        g.scale(photoZoom, photoZoom);
        // Dessin carré 1:1 strict : AUCUNE DÉFORMATION
        g.drawImage(siennaFaceImg, -photoSize / 2, -photoSize / 2, photoSize, photoSize);
        g.restore();
    }

    // Vignette douce sur les bords de la photo
    const photoVignette = g.createRadialGradient(0, photoY + photoSize / 2, photoSize * 0.4, 0, photoY + photoSize / 2, photoSize * 0.72);
    photoVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    photoVignette.addColorStop(1, 'rgba(8, 10, 18, 0.35)');
    g.fillStyle = photoVignette;
    g.fillRect(photoX, photoY, photoSize, photoSize);
    g.restore();

    // Bordure fine de la photo
    roundRect(g, photoX, photoY, photoSize, photoSize, photoR);
    g.lineWidth = 1.2;
    g.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    g.stroke();

    // Bas de carte : ESPACE AÉRÉ ÉQUILIBRÉ sous l'image (24px d'espace), avatar profil grand & généreux
    const footerY = photoY + photoSize + 46;

    // Avatar miniature rond agrandi (diamètre 60px, rayon 30px)
    const avX = -cardW / 2 + 62;
    const avR = 30;
    g.save();
    g.beginPath();
    g.arc(avX, footerY, avR, 0, Math.PI * 2);
    g.clip();
    if (siennaAvatarImg.complete && siennaAvatarImg.naturalWidth > 0) {
        g.drawImage(siennaAvatarImg, avX - avR, footerY - avR, avR * 2, avR * 2);
    } else {
        g.fillStyle = '#3b82f6';
        g.fillRect(avX - avR, footerY - avR, avR * 2, avR * 2);
    }
    g.restore();
    g.beginPath();
    g.arc(avX, footerY, avR, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    g.lineWidth = 2.0;
    g.stroke();

    // Point de présence vert
    g.beginPath();
    g.arc(avX + 20, footerY + 20, 6.5, 0, Math.PI * 2);
    g.fillStyle = '#22c55e';
    g.fill();
    g.strokeStyle = '#12141c';
    g.lineWidth = 2.2;
    g.stroke();

    // Textes @sienna32 & "12m ago" (très nets, grands et bien visibles)
    g.font = '700 20px "Inter", sans-serif';
    g.fillStyle = '#ffffff';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText('@sienna32', avX + 42, footerY - 11);

    g.font = '500 14px "Inter", sans-serif';
    g.fillStyle = 'rgba(255, 255, 255, 0.65)';
    g.fillText('12m ago', avX + 42, footerY + 14);

    // Bouton "+ Add member" avec haptique à tRel >= 6.0s
    const isBtnTapped = tRel >= 6.0 && tRel <= 6.7;
    const isAdded = tRel > 6.6;
    const btnScale = isBtnTapped ? 0.94 : 1.0;
    const btnW = 186;
    const btnH = 54;
    const btnX = cardW / 2 - 28 - btnW;

    g.save();
    g.translate(btnX + btnW / 2, footerY);
    g.scale(btnScale, btnScale);

    roundRect(g, -btnW / 2, -btnH / 2, btnW, btnH, 18);
    if (!isAdded) {
        g.fillStyle = isBtnTapped ? '#33374b' : '#222533';
        g.fill();
        g.strokeStyle = isBtnTapped ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)';
        g.lineWidth = 1.4;
        g.stroke();

        g.font = '600 16px "Inter", sans-serif';
        g.fillStyle = '#ffffff';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('+ Add member', 0, 0);
    } else {
        // État validé "✓ Member added"
        g.fillStyle = '#15803d';
        g.fill();
        g.strokeStyle = '#4ade80';
        g.lineWidth = 1.4;
        g.stroke();

        g.font = '600 16px "Inter", sans-serif';
        g.fillStyle = '#ffffff';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('✓ Member added', 0, 0);
    }
    g.restore();

    // Effet d'impulsion tactile au tap
    if (isBtnTapped) {
        const tapProgress = (tRel - 6.0) / 0.7;
        const tapR = 36 * tapProgress;
        const tapAlpha = (1 - tapProgress) * 0.75;
        g.save();
        g.translate(btnX + btnW / 2, footerY);
        g.beginPath();
        g.arc(0, 0, tapR, 0, Math.PI * 2);
        g.strokeStyle = \`rgba(96, 165, 250, \${tapAlpha})\`;
        g.lineWidth = 2.4;
        g.stroke();
        g.restore();
    }

    g.restore();
}

// =============================================================================
// SCENE 3 : APPLE CARD TYPOGRAPHY AURORA [20.0s - 30.0s]
// Dark Background + Dynamic Fluid Aurora Gradient (Pink, Orange, Yellow, Green)
// Kinetic Typography reveal: VRAI LOGO APPLE OFFICIEL (Path2D) + "Card is here."
// Rythme dynamique et percutant, sous-titre parfaitement centré & aligné
// =============================================================================
function renderScene3(tRel) {
    // 1. Fond noir pur
    g.fillStyle = '#000000';
    g.fillRect(0, 0, 1920, 1080);

    // 2. Dégradés nébuleux fluides animés (couleurs Apple Card sur fond noir)
    const auroraAlpha = clamp(tRel / 0.7, 0, 1) * clamp((10.0 - tRel) / 0.8, 0, 1);
    g.save();
    g.globalAlpha = 0.58 * auroraAlpha;

    // Orbe Rose / Violette (Haut gauche)
    const pX = 450 + Math.sin(tRel * 1.0) * 90;
    const pY = 320 + Math.cos(tRel * 1.2) * 70;
    const pGrad = g.createRadialGradient(pX, pY, 50, pX, pY, 580);
    pGrad.addColorStop(0, 'rgba(217, 70, 239, 0.75)');
    pGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = pGrad;
    g.fillRect(0, 0, 1920, 1080);

    // Orbe Orange / Pêche (Haut centre)
    const oX = 980 + Math.cos(tRel * 1.1) * 110;
    const oY = 280 + Math.sin(tRel * 0.9) * 60;
    const oGrad = g.createRadialGradient(oX, oY, 50, oX, oY, 620);
    oGrad.addColorStop(0, 'rgba(251, 146, 60, 0.75)');
    oGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)');
    oGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = oGrad;
    g.fillRect(0, 0, 1920, 1080);

    // Orbe Jaune solaire (Haut centre-droit)
    const yX = 1350 + Math.sin(tRel * 1.2) * 80;
    const yY = 340 + Math.cos(tRel * 1.0) * 80;
    const yGrad = g.createRadialGradient(yX, yY, 40, yX, yY, 560);
    yGrad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
    yGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.25)');
    yGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = yGrad;
    g.fillRect(0, 0, 1920, 1080);

    // Orbe Verte néon (Haut droite)
    const gX = 1680 + Math.cos(tRel * 1.15) * 70;
    const gY = 360 + Math.sin(tRel * 1.3) * 90;
    const gGrad = g.createRadialGradient(gX, gY, 50, gX, gY, 600);
    gGrad.addColorStop(0, 'rgba(74, 222, 128, 0.7)');
    gGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.25)');
    gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = gGrad;
    g.fillRect(0, 0, 1920, 1080);
    g.restore();

    // -------------------------------------------------------------------------
    // 3. Typographie Cinétique Iconique : VRAI Logo Apple officiel + "Card is here."
    // Cadencement rapide et dynamique (animé en moins de 1.8s au lieu de 3.6s)
    // -------------------------------------------------------------------------
    const textCenterY = 510;
    const totalBreath = 1.0 + Math.sin(tRel * 0.8) * 0.012;

    g.save();
    g.translate(960, textCenterY);
    g.scale(totalBreath, totalBreath);

    // Configuration typographique
    const fontSize = 138;
    g.font = \`800 \${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, sans-serif\`;
    g.letterSpacing = '-3.5px';
    g.textBaseline = 'middle';

    // Mesures précises pour centrage géométrique absolu de l'ensemble [Logo + "Card is here."]
    const appleLogoDisplayH = 118; // Hauteur équilibrée avec la majuscule 'C'
    const appleLogoDisplayW = (appleLogoDisplayH * 256) / 315; // ~96px
    const gapLogoText = 28;
    const cardTextWidth = g.measureText('Card').width;
    const spaceWidth = 24;
    const isTextWidth = g.measureText('is').width;
    const hereTextWidth = g.measureText('here.').width;

    const totalBlockWidth = appleLogoDisplayW + gapLogoText + cardTextWidth + spaceWidth + isTextWidth + spaceWidth + hereTextWidth;
    const startX = -totalBlockWidth / 2;

    // A. Dessin du VRAI Logo Apple Officiel (Path2D officiel SVG)
    const logoAnimP = clamp(tRel / 0.65, 0, 1);
    const logoScale = ease.spring(logoAnimP);
    const logoAlpha = clamp(tRel / 0.4, 0, 1);

    if (logoAlpha > 0) {
        g.save();
        g.globalAlpha = logoAlpha;
        const logoX = startX;
        const logoY = -appleLogoDisplayH / 2;

        g.translate(logoX + appleLogoDisplayW / 2, 0);
        g.scale(logoScale, logoScale);
        g.translate(-appleLogoDisplayW / 2, logoY);

        // Mise à l'échelle du viewBox 256x315 vers display
        const s = appleLogoDisplayH / 315;
        g.scale(s, s);

        // Ombre portée blanche lumineuse Apple
        g.shadowColor = 'rgba(255, 255, 255, 0.45)';
        g.shadowBlur = 28;
        g.fillStyle = '#ffffff';
        g.fill(appleOfficialPath);
        g.restore();
    }

    // Positions X des mots
    const cardX = startX + appleLogoDisplayW + gapLogoText;
    const isX = cardX + cardTextWidth + spaceWidth;
    const hereX = isX + isTextWidth + spaceWidth;

    // B. Mot 1 : "Card" (apparition dynamique à tRel >= 0.3s)
    const cardP = clamp((tRel - 0.3) / 0.55, 0, 1);
    if (cardP > 0) {
        const slideY = (1 - ease.out(cardP)) * 32;
        g.save();
        g.globalAlpha = cardP;
        g.translate(0, slideY);
        g.fillStyle = '#ffffff';
        g.shadowColor = 'rgba(255, 255, 255, 0.35)';
        g.shadowBlur = 24;
        g.fillText('Card', cardX, 0);
        g.restore();
    }

    // C. Mot 2 : "is" (apparition dynamique à tRel >= 0.6s)
    const isP = clamp((tRel - 0.6) / 0.55, 0, 1);
    if (isP > 0) {
        const slideY = (1 - ease.out(isP)) * 32;
        g.save();
        g.globalAlpha = isP;
        g.translate(0, slideY);
        g.fillStyle = '#ffffff';
        g.shadowColor = 'rgba(255, 255, 255, 0.35)';
        g.shadowBlur = 24;
        g.fillText('is', isX, 0);
        g.restore();
    }

    // D. Mot 3 : "here." (apparition percutante à tRel >= 0.9s)
    const hereP = clamp((tRel - 0.9) / 0.55, 0, 1);
    if (hereP > 0) {
        const slideY = (1 - ease.out(hereP)) * 32;
        g.save();
        g.globalAlpha = hereP;
        g.translate(0, slideY);

        // Reflet chromatique irisé subtil Apple Card
        const shimmerGrad = g.createLinearGradient(hereX, -40, hereX + hereTextWidth, 40);
        const shimmerOffset = (tRel * 0.5) % 1;
        shimmerGrad.addColorStop(0, '#ffffff');
        shimmerGrad.addColorStop(clamp(shimmerOffset, 0, 1), '#fbcfe8');
        shimmerGrad.addColorStop(clamp(shimmerOffset + 0.15, 0, 1), '#fed7aa');
        shimmerGrad.addColorStop(clamp(shimmerOffset + 0.3, 0, 1), '#bbf7d0');
        shimmerGrad.addColorStop(1, '#ffffff');

        g.fillStyle = shimmerGrad;
        g.shadowColor = 'rgba(244, 114, 182, 0.45)';
        g.shadowBlur = 28;
        g.fillText('here.', hereX, 0);
        g.restore();
    }

    // E. Sous-titre officiel élégant, centré avec précision (tRel >= 1.6s)
    if (tRel >= 1.6) {
        const subP = clamp((tRel - 1.6) / 0.65, 0, 1);
        const subSlide = (1 - ease.out(subP)) * 18;
        g.save();
        g.globalAlpha = subP;
        g.translate(0, subSlide);
        g.font = '500 23px "Inter", sans-serif';
        g.letterSpacing = '0.4px';
        g.fillStyle = 'rgba(255, 255, 255, 0.72)';
        g.textAlign = 'center';
        g.fillText('Created by Apple. Designed for iPhone.', 0, 126);
        g.restore();
    }

    g.restore();
}

// =============================================================================
// SCENE 4 : 3-STEP STRATEGY GLOWING FLOWCHART [30.0s - 40.0s]
// Fond noir pur professionnel (zéro étoiles / zéro bruit),
// Titre typographique net sans halo flou parasite,
// Arbre laser électrique animé et cartes lumineuses interactives
// =============================================================================
function renderScene4(tRel) {
    // 1. Fond sombre épuré professionnel (noir pur sans étoiles)
    const spaceGrad = g.createRadialGradient(960, 540, 100, 960, 540, 950);
    spaceGrad.addColorStop(0, '#0a0d18');
    spaceGrad.addColorStop(0.6, '#04060c');
    spaceGrad.addColorStop(1, '#000000');
    g.fillStyle = spaceGrad;
    g.fillRect(0, 0, 1920, 1080);

    // 2. Titre Principal : "3-STEP STRATEGY" (Typographie nette, zéro fond flou parasite)
    const titleEntrance = clamp(tRel / 0.8, 0, 1);
    const titleY = lerp(160, 195, ease.out(titleEntrance));

    g.save();
    g.globalAlpha = titleEntrance;
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    g.font = '900 66px "Inter", sans-serif';
    g.letterSpacing = '-1px';
    g.fillStyle = '#ffffff';
    g.shadowColor = 'rgba(96, 165, 250, 0.4)';
    g.shadowBlur = 18;
    g.fillText('3-STEP', 960, titleY - 40);
    g.fillText('STRATEGY', 960, titleY + 36);
    g.restore();

    // 3. Arbre de connexion laser électrique bleu (Flowchart tree)
    const treeYStart = titleY + 92;
    const treeYSplit = 415;
    const colXs = [460, 960, 1460];
    const cardTopY = 540;

    const lineProgress = clamp((tRel - 0.8) / 1.0, 0, 1);
    if (lineProgress > 0) {
        g.save();
        g.strokeStyle = '#3b82f6';
        g.lineWidth = 3.0;
        g.lineCap = 'round';
        g.shadowColor = '#60a5fa';
        g.shadowBlur = 20;

        // Tracé tronc vertical
        const currStemY = lerp(treeYStart, treeYSplit, clamp(lineProgress * 2, 0, 1));
        g.beginPath();
        g.moveTo(960, treeYStart);
        g.lineTo(960, currStemY);
        g.stroke();

        // Tracé branches horizontales vers gauche et droite
        if (lineProgress > 0.5) {
            const branchP = (lineProgress - 0.5) * 2;
            const leftBranchX = lerp(960, colXs[0], branchP);
            const rightBranchX = lerp(960, colXs[2], branchP);

            g.beginPath();
            g.moveTo(960, treeYSplit);
            g.lineTo(leftBranchX, treeYSplit);
            g.moveTo(960, treeYSplit);
            g.lineTo(rightBranchX, treeYSplit);
            g.stroke();

            // Descente vers chaque carte
            if (branchP >= 0.95) {
                const dropP = clamp((tRel - 1.8) / 0.7, 0, 1);
                for (let i = 0; i < 3; i++) {
                    const cx = colXs[i];
                    const dropY = lerp(treeYSplit, cardTopY, dropP);
                    g.beginPath();
                    g.moveTo(cx, treeYSplit);
                    g.lineTo(cx, dropY);
                    g.stroke();

                    // Impulsion de lumière électrique qui voyage
                    const laserCycle = (tRel * 2.5 + i * 0.4) % 1;
                    const pulseY = lerp(treeYSplit, cardTopY, laserCycle);
                    g.fillStyle = '#93c5fd';
                    g.shadowColor = '#ffffff';
                    g.shadowBlur = 16;
                    g.beginPath();
                    g.arc(cx, pulseY, 5, 0, Math.PI * 2);
                    g.fill();
                }
            }
        }
        g.restore();
    }

    // 4. Les 3 Cartes Stratégiques Lumineuses
    const cardData = [
        { step: 'Step 01:', label: 'RESEARCH & AUDIT', icon: 'lens', delay: 1.8 },
        { step: 'Step 02:', label: 'ROADMAP CREATION', icon: 'doc', delay: 2.4 },
        { step: 'Step 03:', label: 'SYSTEM EXECUTION', icon: 'gear', delay: 3.0 }
    ];

    const cW = 370;
    const cH = 340;
    const cR = 38;

    for (let i = 0; i < 3; i++) {
        const item = cardData[i];
        if (tRel < item.delay) continue;

        const cardP = ease.spring(clamp((tRel - item.delay) / 0.8, 0, 1));
        const cx = colXs[i];
        const cy = cardTopY + cH / 2 + (1 - cardP) * 45;

        g.save();
        g.translate(cx, cy);
        g.scale(cardP, cardP);
        g.globalAlpha = clamp((tRel - item.delay) / 0.35, 0, 1);

        // Halo lumineux électrique extérieur bleu autour de la carte
        roundRect(g, -cW / 2, -cH / 2, cW, cH, cR);
        g.shadowColor = 'rgba(59, 130, 246, 0.7)';
        g.shadowBlur = 40;
        g.fillStyle = 'rgba(10, 20, 45, 0.85)';
        g.fill();

        // Fond sombre contrasté
        const innerGrad = g.createLinearGradient(0, -cH / 2, 0, cH / 2);
        innerGrad.addColorStop(0, '#101b38');
        innerGrad.addColorStop(1, '#080d1e');
        g.fillStyle = innerGrad;
        g.fill();

        // Bordure bleu néon électrique
        g.lineWidth = 2.4;
        g.strokeStyle = '#3b82f6';
        g.stroke();

        // Texte "Step 01:" / "Step 02:" / "Step 03:"
        g.font = '700 25px "Inter", sans-serif';
        g.fillStyle = '#ffffff';
        g.textAlign = 'left';
        g.textBaseline = 'top';
        g.fillText(item.step, -cW / 2 + 36, -cH / 2 + 32);

        // Sous-titre stratégique
        g.font = '600 13px "Inter", sans-serif';
        g.letterSpacing = '0.8px';
        g.fillStyle = '#60a5fa';
        g.fillText(item.label, -cW / 2 + 36, -cH / 2 + 68);

        // ---------------------------------------------------------------------
        // Icône centrale haute fidélité animée
        // ---------------------------------------------------------------------
        const iconCenterY = 40;
        g.save();
        g.translate(0, iconCenterY);

        if (item.icon === 'lens') {
            // Loupe animée avec verre et rayon lumineux
            const lensZoom = 1.0 + Math.sin(tRel * 2.5) * 0.08;
            g.scale(lensZoom, lensZoom);
            g.shadowColor = 'rgba(255, 255, 255, 0.6)';
            g.shadowBlur = 24;

            // Verre loupe
            g.beginPath();
            g.arc(-16, -16, 44, 0, Math.PI * 2);
            g.fillStyle = 'rgba(255, 255, 255, 0.9)';
            g.fill();
            g.lineWidth = 7;
            g.strokeStyle = '#e2e8f0';
            g.stroke();

            // Reflet spéculaire sur la lentille
            g.beginPath();
            g.arc(-26, -26, 26, -Math.PI * 0.4, 0);
            g.lineWidth = 4;
            g.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            g.stroke();

            // Manche en angle
            g.beginPath();
            g.moveTo(18, 18);
            g.lineTo(54, 54);
            g.lineWidth = 14;
            g.lineCap = 'round';
            g.strokeStyle = '#475569';
            g.stroke();
            g.beginPath();
            g.moveTo(22, 22);
            g.lineTo(50, 50);
            g.lineWidth = 6;
            g.strokeStyle = '#94a3b8';
            g.stroke();
        } else if (item.icon === 'doc') {
            // Document avec lignes de texte et coin plié
            const docFloat = Math.sin(tRel * 2.0) * 4;
            g.translate(0, docFloat);
            g.shadowColor = 'rgba(255, 255, 255, 0.6)';
            g.shadowBlur = 24;

            const dW = 78;
            const dH = 106;
            // Corps feuille blanche
            roundRect(g, -dW / 2, -dH / 2, dW, dH, 8);
            g.fillStyle = '#ffffff';
            g.fill();
            g.lineWidth = 2;
            g.strokeStyle = '#cbd5e1';
            g.stroke();

            // Lignes de document animées
            g.fillStyle = '#64748b';
            for (let l = 0; l < 4; l++) {
                const lw = (l === 3) ? dW * 0.45 : dW * 0.68;
                roundRect(g, -dW / 2 + 12, -dH / 2 + 24 + l * 18, lw, 5, 2.5);
                g.fill();
            }

            // Coin plié stylisé
            g.beginPath();
            g.moveTo(dW / 2 - 22, -dH / 2);
            g.lineTo(dW / 2, -dH / 2 + 22);
            g.lineTo(dW / 2 - 22, -dH / 2 + 22);
            g.closePath();
            g.fillStyle = '#94a3b8';
            g.fill();
        } else if (item.icon === 'gear') {
            // Engrenage métallique tournant en continu
            const gearAngle = tRel * 1.8;
            g.rotate(gearAngle);
            g.shadowColor = 'rgba(255, 255, 255, 0.6)';
            g.shadowBlur = 24;

            const gearR = 50;
            const teeth = 8;
            g.fillStyle = '#e2e8f0';
            g.beginPath();
            for (let tooth = 0; tooth < teeth; tooth++) {
                const a = (tooth / teeth) * Math.PI * 2;
                const nextA = ((tooth + 1) / teeth) * Math.PI * 2;
                const rOut = gearR + 15;
                const rIn = gearR;
                g.lineTo(Math.cos(a - 0.15) * rIn, Math.sin(a - 0.15) * rIn);
                g.lineTo(Math.cos(a - 0.1) * rOut, Math.sin(a - 0.1) * rOut);
                g.lineTo(Math.cos(a + 0.1) * rOut, Math.sin(a + 0.1) * rOut);
                g.lineTo(Math.cos(a + 0.15) * rIn, Math.sin(a + 0.15) * rIn);
            }
            g.closePath();
            g.fill();

            // Trou central de l'engrenage
            g.beginPath();
            g.arc(0, 0, 21, 0, Math.PI * 2);
            g.fillStyle = '#0f172a';
            g.fill();
            g.lineWidth = 3;
            g.strokeStyle = '#94a3b8';
            g.stroke();
        }
        g.restore();

        g.restore();
    }
}

// =============================================================================
// GESTIONNAIRE DE TRANSITIONS & RENDU GLOBAL (0s -> 40s)
// =============================================================================
function drawMasterScene(globalTime) {
    g.clearRect(0, 0, 1920, 1080);
    g.fillStyle = '#000000';
    g.fillRect(0, 0, 1920, 1080);

    const t = clamp(globalTime, 0, DURATION);

    if (t < 10.0) {
        // Scene 1 [0s - 10s]
        renderScene1(t);
        // Fondu sortant vers Scene 2
        if (t > 9.4) {
            const fadeOut = (t - 9.4) / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeOut})\`;
            g.fillRect(0, 0, 1920, 1080);
        }
    } else if (t >= 10.0 && t < 20.0) {
        // Scene 2 [10s - 20s]
        const tRel = t - 10.0;
        renderScene2(tRel);
        // Fondu entrant / sortant
        if (tRel < 0.6) {
            const fadeIn = 1.0 - tRel / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeIn})\`;
            g.fillRect(0, 0, 1920, 1080);
        } else if (tRel > 9.4) {
            const fadeOut = (tRel - 9.4) / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeOut})\`;
            g.fillRect(0, 0, 1920, 1080);
        }
    } else if (t >= 20.0 && t < 30.0) {
        // Scene 3 [20s - 30s]
        const tRel = t - 20.0;
        renderScene3(tRel);
        // Fondu entrant / sortant
        if (tRel < 0.6) {
            const fadeIn = 1.0 - tRel / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeIn})\`;
            g.fillRect(0, 0, 1920, 1080);
        } else if (tRel > 9.4) {
            const fadeOut = (tRel - 9.4) / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeOut})\`;
            g.fillRect(0, 0, 1920, 1080);
        }
    } else {
        // Scene 4 [30s - 40s]
        const tRel = t - 30.0;
        renderScene4(tRel);
        // Fondu entrant
        if (tRel < 0.6) {
            const fadeIn = 1.0 - tRel / 0.6;
            g.fillStyle = \`rgba(0, 0, 0, \${fadeIn})\`;
            g.fillRect(0, 0, 1920, 1080);
        }
    }
}

// =============================================================================
// INTERFACE VIBEEDITOR STUDIO (CONTRAT DE LECTURE TIMELINE SANS BOUTON DANS LA VIDÉO)
// =============================================================================
window.renderAt = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    drawMasterScene(playbackTime);
};

window.timelineSeek = function(timeInSeconds) {
    window.renderAt(timeInSeconds);
};

window.syncAudioTimeline = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    audioBgm.volume = 0.35 * clamp((DURATION - playbackTime) / 1.0, 0, 1);
};

function loop(timestamp) {
    if (!isPlaying) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    playbackTime += dt;
    drawMasterScene(playbackTime);

    if (playbackTime >= DURATION) {
        playbackTime = 0; // Boucle fluide 40s
    }

    rafId = requestAnimationFrame(loop);
}

function play() {
    if (isPlaying) return;
    isPlaying = true;
    lastTimestamp = 0;
    audioBgm.volume = 0.35;
    audioBgm.play().catch(() => {});
    rafId = requestAnimationFrame(loop);
}

function pause() {
    isPlaying = false;
    if (rafId) cancelAnimationFrame(rafId);
    audioBgm.pause();
}

window.play = play;
window.pause = pause;
window.seek = function(t) { window.renderAt(t); };

window.addEventListener('DOMContentLoaded', () => {
    window.renderAt(0);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isPlaying ? pause() : play();
    }
});

// Initialisation au chargement des images
let loadedCount = 0;
function checkInit() {
    loadedCount++;
    if (loadedCount >= 3) {
        window.renderAt(0);
    }
}
orbImg.onload = checkInit;
siennaFaceImg.onload = checkInit;
siennaAvatarImg.onload = checkInit;
if (orbImg.complete) checkInit();
if (siennaFaceImg.complete) checkInit();
if (siennaAvatarImg.complete) checkInit();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'build_phone_video.cjs'), fs.readFileSync(__filename));
fs.writeFileSync(path.join(__dirname, '../04_Videos/design_ai_phone_voice_10s.html'), html, 'utf-8');
console.log('✅ 04_Videos/design_ai_phone_voice_10s.html updated with 4 full animated scenes (40s total)!');
