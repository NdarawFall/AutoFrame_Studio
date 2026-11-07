const fs = require('fs');
const path = require('path');

const orbB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/ai_energy_orb.b64'), 'utf8').trim();

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design — AI Voice Assistant Smartphone Showcase (10s)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
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
    <div id="stage" data-duration="10.0">
        <canvas id="mainCanvas" width="1920" height="1080"></canvas>
    </div>

    <audio id="audioBgm" src="../01_Assets/Musiques/Wallpaper.mp3" preload="auto" loop></audio>

<script>
// ==============================================================================
// VIBEEDITOR 1.0 — ANIMATED AI SMARTPHONE VOICE ASSISTANT (10s)
// Rendu Canvas 2D Déterministe 60 FPS — Caméra Dynamique, Zoom Haptique & UI Chat
// ==============================================================================
const canvas = document.getElementById('mainCanvas');
const g = canvas.getContext('2d');
const audioBgm = document.getElementById('audioBgm');

const DURATION = 10.0;
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

// Orbe d'énergie holographique
const orbImg = new Image();
orbImg.src = 'data:image/png;base64,${orbB64}';

// -----------------------------------------------------------------------------
// DESSIN DU TÉLÉPHONE (SMARTPHONE TITANE + DYNAMIC ISLAND + BOUTONS)
// -----------------------------------------------------------------------------
function drawPhoneFrame(ctx, w, h, r) {
    // Boutons physiques latéraux
    ctx.fillStyle = '#22232a';
    // Bouton Power à droite
    roundRect(ctx, w / 2 + 1, -h / 2 + 160, 5, 80, 2.5);
    ctx.fill();
    // Boutons Volume à gauche
    roundRect(ctx, -w / 2 - 6, -h / 2 + 130, 5, 52, 2.5);
    ctx.fill();
    roundRect(ctx, -w / 2 - 6, -h / 2 + 195, 5, 52, 2.5);
    ctx.fill();
    // Action button
    roundRect(ctx, -w / 2 - 6, -h / 2 + 85, 5, 32, 2.5);
    ctx.fill();

    // Châssis extérieur titane avec ombre portée profonde
    ctx.save();
    roundRect(ctx, -w / 2, -h / 2, w, h, r);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 85;
    ctx.shadowOffsetY = 38;
    ctx.fillStyle = '#0f1015';
    ctx.fill();
    ctx.restore();

    // Bordure métallique biseautée avec reflets spéculaires
    const rimGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    rimGrad.addColorStop(0, '#525461');
    rimGrad.addColorStop(0.25, '#23242c');
    rimGrad.addColorStop(0.5, '#424450');
    rimGrad.addColorStop(0.75, '#1e1f26');
    rimGrad.addColorStop(1, '#474957');
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    // Bord intérieur fin
    roundRect(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 5);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
}

// -----------------------------------------------------------------------------
// DESSIN DU CONTENU DE L'ÉCRAN SMARTPHONE
// -----------------------------------------------------------------------------
function drawPhoneScreen(ctx, sw, sh, sr, t) {
    ctx.save();
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, sr);
    ctx.clip();

    // 1. Fond d'écran sombre pur
    ctx.fillStyle = '#000000';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // 2. Halo d'ambiance bleu royal / cyan rayonnant en bas de l'écran
    const auraPulse = 1.0 + Math.sin(t * 2.2) * 0.05;
    const auraY = sh / 2 - 30;
    const auraGrad = ctx.createRadialGradient(0, auraY, 40, 0, auraY - 140, 420 * auraPulse);
    auraGrad.addColorStop(0, 'rgba(59, 130, 246, 0.55)');
    auraGrad.addColorStop(0.35, 'rgba(37, 99, 235, 0.35)');
    auraGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.14)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, auraY, 450 * auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------------------------------------------------------
    // 3. ORBE D'ÉNERGIE HOLOGRAPHIQUE (EN HAUT DE L'ÉCRAN)
    // -------------------------------------------------------------------------
    const orbCenterY = -sh / 2 + 200;
    const orbSize = 135;
    const orbRotate = t * 0.45;
    const orbBreath = 1.0 + Math.sin(t * 3.0) * 0.04;

    ctx.save();
    ctx.translate(0, orbCenterY);
    ctx.scale(orbBreath, orbBreath);

    // Lueur diffuse d'ambiance bleue sous l'orbe
    const orbGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
    orbGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    orbGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.18)');
    orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.fill();

    // Image réelle de l'orbe avec rotation douce et découpe circulaire douce
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

    // Rubans de lumière tournoyants procéduraux pour donner vie à l'orbe
    ctx.rotate(-orbRotate * 2.2);
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.beginPath();
    ctx.arc(0, 0, orbSize * 0.42, 0, Math.PI * 1.4);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, orbSize * 0.36, Math.PI * 0.6, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();

    // -------------------------------------------------------------------------
    // 4. TEXTES D'ACCUEIL : "Hello Robin" + "How can I help you today?"
    // -------------------------------------------------------------------------
    // S'estompent lors de l'affichage du résultat (après t = 6.2s)
    const welcomeAlpha = clamp(1.0 - (t - 6.0) / 0.6, 0, 1);

    if (welcomeAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = welcomeAlpha;

        // Subtitle "Hello Robin"
        ctx.font = '500 17px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hello Robin', 0, -sh / 2 + 300);

        // Heading "How can I help you today?"
        ctx.font = '800 29px "Inter", sans-serif';
        ctx.letterSpacing = '-0.6px';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('How can I help', 0, -sh / 2 + 342);
        ctx.fillText('you today?', 0, -sh / 2 + 378);

        ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 5. PHASE 4 : QUESTION DE L'UTILISATEUR & RÉSULTAT IA (t >= 6.2s)
    // -------------------------------------------------------------------------
    if (t >= 6.2) {
        // Apparition de la question utilisateur
        const userQAlpha = clamp((t - 6.2) / 0.5, 0, 1);
        const userQSlide = ease.out(userQAlpha) * 12;

        ctx.save();
        ctx.globalAlpha = userQAlpha;

        // Bulle de question utilisateur
        const qW = 320;
        const qH = 54;
        const qX = sw / 2 - 24 - qW;
        const qY = -sh / 2 + 285 - userQSlide;

        roundRect(ctx, qX, qY, qW, qH, 18);
        ctx.fillStyle = 'rgba(30, 58, 138, 0.45)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
        ctx.stroke();

        ctx.font = '600 13px "Inter", sans-serif';
        ctx.fillStyle = '#e0f2fe';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Show quarterly performance review', qX + 16, qY + qH / 2);
        ctx.restore();

        // Apparition de la carte réponse IA (t >= 7.2s)
        if (t >= 7.2) {
            const aiCardP = ease.spring(clamp((t - 7.2) / 0.9, 0, 1));
            const cardW = sw - 48;
            const cardH = 205;
            const cardX = -cardW / 2;
            const cardY = lerp(-sh / 2 + 500, -sh / 2 + 370, aiCardP);

            ctx.save();
            ctx.globalAlpha = clamp((t - 7.2) / 0.4, 0, 1);

            // Ombre et fond de la carte résultat
            roundRect(ctx, cardX, cardY, cardW, cardH, 22);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fill();

            // Bordure brillante avec dégradé cyan
            const cardBorder = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
            cardBorder.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
            cardBorder.addColorStop(1, 'rgba(99, 102, 241, 0.25)');
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = cardBorder;
            ctx.stroke();

            // En-tête de la carte : Badge "AI Analysis"
            roundRect(ctx, cardX + 18, cardY + 16, 96, 24, 12);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.stroke();

            ctx.font = '700 11px "Inter", sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦ AI Analysis', cardX + 66, cardY + 28);

            // Métrique de croissance (+34.8%)
            ctx.font = '800 28px "Inter", sans-serif';
            ctx.fillStyle = '#4ade80';
            ctx.textAlign = 'left';
            ctx.fillText('+34.8%', cardX + 18, cardY + 74);

            ctx.font = '500 12px "Inter", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.fillText('Q3 Net Revenue Growth', cardX + 135, cardY + 74);

            // Mini graphique en courbe de croissance interactif
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            const graphX = cardX + 20;
            const graphY = cardY + 120;
            const graphW = cardW - 40;
            const pts = [
                { x: 0, y: 30 },
                { x: graphW * 0.2, y: 22 },
                { x: graphW * 0.4, y: 26 },
                { x: graphW * 0.6, y: 14 },
                { x: graphW * 0.8, y: 16 },
                { x: graphW, y: 4 }
            ];

            const drawProgress = clamp((t - 7.5) / 1.0, 0, 1);
            ctx.moveTo(graphX, graphY + pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                if (i / (pts.length - 1) <= drawProgress) {
                    ctx.lineTo(graphX + pts[i].x, graphY + pts[i].y);
                }
            }
            ctx.stroke();

            // Texte de synthèse IA
            ctx.font = '500 12px "Inter", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillText('Revenue surpassed expectations at $148.2K.', cardX + 20, cardY + 182);

            ctx.restore();
        }
    }

    // -------------------------------------------------------------------------
    // 6. BARRE DE CHAT / CAPSULE VOCALE INTERACTIVE (ANIMATION CENTRALE)
    // -------------------------------------------------------------------------
    // Détermination de l'état morphing de la barre :
    // t < 3.0s  : Pleine largeur (420px) avec "Ask anything..." et waveform
    // t = 3.0s..3.7s : Se rétrécit vers capsule compacte centrée (130px)
    // t = 3.7s..4.8s : Utilisateur parle, l'onde s'anime avec puissance
    // t = 4.8s..6.0s : La capsule se détend et se replace
    let barWidth = 420;
    let isCompactVoice = false;

    if (t >= 3.0 && t <= 5.8) {
        isCompactVoice = true;
        if (t < 3.6) {
            const shrinkP = ease.inOut((t - 3.0) / 0.6);
            barWidth = lerp(420, 134, shrinkP);
        } else if (t > 5.0) {
            const expandP = ease.inOut((t - 5.0) / 0.8);
            barWidth = lerp(134, 420, expandP);
        } else {
            barWidth = 134;
        }
    } else {
        barWidth = 420;
    }

    const barH = 68;
    const barR = barH / 2;
    const barY = sh / 2 - 82;

    ctx.save();
    ctx.translate(0, barY);

    // Ondes sonores qui irradient de la capsule compacte lors de la parole (t = 3.5s - 4.8s)
    if (t >= 3.5 && t <= 4.8) {
        const pulseCycle = (t * 4.5) % 1;
        const ringR = barR + pulseCycle * 40;
        const ringAlpha = (1 - pulseCycle) * 0.45;
        ctx.save();
        roundRect(ctx, -barWidth / 2 - pulseCycle * 20, -barH / 2 - pulseCycle * 10, barWidth + pulseCycle * 40, barH + pulseCycle * 20, ringR);
        ctx.strokeStyle = \`rgba(56, 189, 248, \${ringAlpha})\`;
        ctx.lineWidth = 2.0;
        ctx.stroke();
        ctx.restore();
    }

    // Ombre douce de la barre
    roundRect(ctx, -barWidth / 2, -barH / 2, barWidth, barH, barR);
    ctx.shadowColor = 'rgba(2, 6, 23, 0.7)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    // Fond en verre givré
    const barGlass = ctx.createLinearGradient(0, -barH / 2, 0, barH / 2);
    barGlass.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    barGlass.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    barGlass.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = barGlass;
    ctx.fill();

    // Bordure spéculaire fine
    const barBorder = ctx.createLinearGradient(-barWidth / 2, -barH / 2, barWidth / 2, barH / 2);
    barBorder.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    barBorder.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    barBorder.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = barBorder;
    ctx.stroke();

    // Contenu intérieur : Texte "Ask anything..." (s'estompe en mode compact)
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

    // Icône Audio Waveform (5 barres verticales)
    // En mode pleine largeur : à droite (x = barWidth / 2 - 46)
    // En mode compact : parfaitement centrée (x = 0) !
    const waveTargetX = isCompactVoice && barWidth < 200 ? 0 : barWidth / 2 - 46;
    const waveX = lerp(barWidth / 2 - 46, 0, clamp((420 - barWidth) / (420 - 134), 0, 1));

    ctx.save();
    ctx.translate(waveX, 0);

    // Dessin des 5 barres verticales animées
    const barW = 4;
    const barGap = 8;
    const barHeights = [10, 22, 34, 22, 10];
    const isSpeaking = t >= 3.6 && t <= 5.0;

    for (let i = -2; i <= 2; i++) {
        const idx = i + 2;
        const bx = i * barGap;

        let dynamicH = barHeights[idx];
        if (isSpeaking) {
            // Animation vocale vivante et puissante quand le user parle
            const freq = t * 14 + idx * 1.5;
            dynamicH = barHeights[idx] * (0.6 + 0.9 * Math.abs(Math.sin(freq))) * 1.4;
        }

        roundRect(ctx, bx - barW / 2, -dynamicH / 2, barW, dynamicH, barW / 2);
        ctx.fillStyle = isSpeaking ? '#38bdf8' : '#ffffff';
        ctx.shadowColor = isSpeaking ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = isSpeaking ? 12 : 4;
        ctx.fill();
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // INDICATEUR DE TAP TACTILE DU USER (À t = 2.7s - 3.1s)
    // -------------------------------------------------------------------------
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
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore(); // Fin barre de chat

    // -------------------------------------------------------------------------
    // 7. DYNAMIC ISLAND (EN HAUT DE L'ÉCRAN)
    // -------------------------------------------------------------------------
    const diW = 114;
    const diH = 32;
    const diY = -sh / 2 + 18;
    roundRect(ctx, -diW / 2, diY, diW, diH, diH / 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Lentille caméra frontale discrète
    ctx.beginPath();
    ctx.arc(diW / 2 - 18, diY + diH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#090a10';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(diW / 2 - 18, diY + diH / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1c2438';
    ctx.fill();

    ctx.restore(); // Fin clipping écran
}

// -----------------------------------------------------------------------------
// BOUCLE PRINCIPALE DE RENDU CANVAS
// -----------------------------------------------------------------------------
function drawScene(t) {
    g.clearRect(0, 0, 1920, 1080);

    // Fond global sombre
    g.fillStyle = '#000000';
    g.fillRect(0, 0, 1920, 1080);

    if (t <= 0.05) return; // Départ sur écran totalement noir

    // -------------------------------------------------------------------------
    // CHORÉGRAPHIE CAMÉRA CINÉMATOGRAPHIQUE (ZOOM / DÉZOOM / TRAVELLING)
    // -------------------------------------------------------------------------
    let camZoom = 1.0;
    let camY = 0;

    if (t < 2.0) {
        // Phase 1 : Entrée du téléphone depuis le haut
        camZoom = 1.0;
        camY = 0;
    } else if (t >= 2.0 && t < 3.2) {
        // Phase 2 : Zoom puissant sur la barre de chat
        const zoomP = ease.inOut((t - 2.0) / 1.2);
        camZoom = lerp(1.0, 2.35, zoomP);
        camY = lerp(0, -820, zoomP);
    } else if (t >= 3.2 && t < 4.8) {
        // Maintien zoom sur l'onde parlée
        camZoom = 2.35;
        camY = -820;
    } else if (t >= 4.8 && t < 6.2) {
        // Phase 3 : Dézoom cinématographique vers vue d'ensemble
        const dezoomP = ease.inOut((t - 4.8) / 1.4);
        camZoom = lerp(2.35, 1.0, dezoomP);
        camY = lerp(-820, 0, dezoomP);
    } else {
        // Phase 4 : Vue complète stabilisée
        camZoom = 1.0;
        camY = 0;
    }

    // Position Y du téléphone (descente depuis le haut à t < 1.8s)
    let phoneY = 0;
    if (t < 1.8) {
        const enterP = ease.snappy(clamp(t / 1.6, 0, 1));
        phoneY = lerp(-600, 0, enterP);
    } else {
        phoneY = Math.sin(t * 1.5) * 5; // Flottement organique subtil
    }

    // Application de la caméra dynamique
    g.save();
    g.translate(960, 540 + camY);
    g.scale(camZoom, camZoom);
    g.translate(0, phoneY);

    // Dimensions du téléphone
    const phoneW = 500;
    const phoneH = 980;
    const phoneR = 62;

    // Dimensions de l'écran
    const screenW = 480;
    const screenH = 960;
    const screenR = 52;

    // Dessin du châssis titane
    drawPhoneFrame(g, phoneW, phoneH, phoneR);

    // Dessin du contenu de l'écran avec animations
    drawPhoneScreen(g, screenW, screenH, screenR, t);

    g.restore(); // Fin caméra
}

// Rendu déterministe pour studio et export
window.renderAt = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    drawScene(playbackTime);
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
    drawScene(playbackTime);

    if (playbackTime >= DURATION) {
        playbackTime = 0; // Boucle fluide 10s
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

orbImg.onload = () => {
    window.renderAt(0);
};

window.addEventListener('DOMContentLoaded', () => {
    window.renderAt(0);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isPlaying ? pause() : play();
    }
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../04_Videos/design_ai_phone_voice_10s.html'), htmlContent, 'utf8');
console.log('✅ 04_Videos/design_ai_phone_voice_10s.html successfully generated with embedded orb!');
