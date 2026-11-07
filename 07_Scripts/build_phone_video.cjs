const fs = require('fs');
const path = require('path');

// Lecture de l'orbe en base64
const orbB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/ai_energy_orb.b64'), 'utf-8').trim();

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design AI Phone Voice Showcase — VibeEditor</title>
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
    <div id="stage" data-duration="10.0">
        <canvas id="mainCanvas" width="1920" height="1080"></canvas>
    </div>

    <audio id="audioBgm" src="../01_Assets/Musiques/Wallpaper.mp3" preload="auto" loop></audio>

<script>
// ==============================================================================
// VIBEEDITOR 1.0 — ANIMATED AI SMARTPHONE VOICE ASSISTANT (10s)
// Rendu Canvas 2D Déterministe 60 FPS — Studio Timeline Standard Interface
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

    // 1. Fond d'écran noir absolu OLED
    ctx.fillStyle = '#000000';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // 2. Halo d'ambiance bleu royal ultra-fondu (sans aucune bordure ni coupure)
    // Rendu pleine largeur/hauteur avec dégradé radial étendu et multi-stops logarithmiques
    const auraPulse = 1.0 + Math.sin(t * 2.2) * 0.03;
    const auraCenterY = sh / 2 + 60; // Émission depuis la base inférieure
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
    // Remplissage complet du rectangle de l'écran (évite tout arc de cercle géométrique visible)
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // Lueur d'appoint ultra-douce diffuse
    const softGlow = ctx.createRadialGradient(0, sh / 2 - 80, 10, 0, sh / 2 - 140, 420);
    softGlow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    softGlow.addColorStop(0.4, 'rgba(37, 99, 235, 0.08)');
    softGlow.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = softGlow;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // -------------------------------------------------------------------------
    // 3. ORBE D'ÉNERGIE HOLOGRAPHIQUE (EN HAUT DE L'ÉCRAN)
    // DISPARAÎT COMPLÈTEMENT LORS DE L'AFFICHAGE DU RÉSULTAT (t >= 5.5s)
    // -------------------------------------------------------------------------
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

        // Lueur diffuse d'ambiance bleue sous l'orbe
        const orbGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
        orbGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        orbGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.18)');
        orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.fill();

        // Image réelle de l'orbe avec rotation douce et découpe circulaire propre
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
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.beginPath();
        ctx.arc(0, 0, orbSize * 0.42, 0, Math.PI * 1.4);
        ctx.stroke();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, orbSize * 0.36, Math.PI * 0.6, Math.PI * 1.9);
        ctx.stroke();
        ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 4. TEXTES D'ACCUEIL : "Hello Robin" + "How can I help you today?"
    // Disparaissent à t >= 5.3s
    // -------------------------------------------------------------------------
    const welcomeAlpha = clamp(1.0 - (t - 5.3) / 0.6, 0, 1);

    if (welcomeAlpha > 0.01) {
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
        ctx.fillText('How can I help', 0, -sh / 2 + 344);
        ctx.fillText('you today?', 0, -sh / 2 + 380);

        ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 5. PHASE 4 : QUESTION UTILISATEUR & RÉSULTAT TYPOGRAPHIQUE PUR (SANS CARTE)
    // -------------------------------------------------------------------------
    if (t >= 6.1) {
        // A. Question utilisateur (t >= 6.1s)
        const qProgress = clamp((t - 6.1) / 0.5, 0, 1);
        const qSlide = (1 - ease.out(qProgress)) * 14;

        ctx.save();
        ctx.globalAlpha = qProgress;
        ctx.translate(0, qSlide);

        // Header question
        ctx.font = '600 12px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText('YOU', -sw / 2 + 32, -sh / 2 + 130);

        // Texte question
        ctx.font = '600 18px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('"Show quarterly performance review"', -sw / 2 + 32, -sh / 2 + 158);

        // Séparateur fin
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-sw / 2 + 32, -sh / 2 + 185);
        ctx.lineTo(sw / 2 - 32, -sh / 2 + 185);
        ctx.stroke();

        ctx.restore();

        // B. Résultat IA (t >= 6.8s) : Typographie animée, streaming fluide, zéro carte !
        if (t >= 6.8) {
            const aiProgress = clamp((t - 6.8) / 0.5, 0, 1);
            const aiSlide = (1 - ease.out(aiProgress)) * 16;

            ctx.save();
            ctx.globalAlpha = aiProgress;
            ctx.translate(0, aiSlide);

            const startY = -sh / 2 + 225;

            // Badge / Tag IA
            ctx.font = '700 12px "Inter", sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'left';
            ctx.fillText('✦ AI ASSISTANT', -sw / 2 + 32, startY);

            // Titre impactant : "Revenue grew by +34.8%"
            if (t >= 7.1) {
                const titleP = clamp((t - 7.1) / 0.4, 0, 1);
                ctx.save();
                ctx.globalAlpha = titleP;
                ctx.font = '800 24px "Inter", sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Revenue grew by ', -sw / 2 + 32, startY + 36);

                // Highlight vert néon émeraude
                const baseWidth = ctx.measureText('Revenue grew by ').width;
                ctx.fillStyle = '#34d399';
                ctx.fillText('+34.8%', -sw / 2 + 32 + baseWidth, startY + 36);
                ctx.restore();
            }

            // Streaming fluide du texte explicatif avec découpage multi-lignes soigné
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

                // Curseur de frappe cyan pulsant
                if (streamRatio < 1.0 || Math.floor(t * 3.5) % 2 === 0) {
                    const lastLine = lines[lines.length - 1] || '';
                    const cursorX = -sw / 2 + 32 + ctx.measureText(lastLine).width + 3;
                    const cursorY = lineY - 23;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(cursorX, cursorY - 11, 2.2, 14);
                }
            }

            // Stat métriques minimalistes en bas du texte (t >= 8.2s)
            if (t >= 8.2) {
                const statsP = clamp((t - 8.2) / 0.5, 0, 1);
                ctx.save();
                ctx.globalAlpha = statsP;

                const statY = startY + 185;

                // Stat 1 : $148.2K
                ctx.font = '800 22px "Inter", sans-serif';
                ctx.fillStyle = '#38bdf8';
                ctx.fillText('$148.2K', -sw / 2 + 32, statY);
                ctx.font = '500 12px "Inter", sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillText('Total Net Revenue', -sw / 2 + 32, statY + 20);

                // Stat 2 : 94.6%
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

    // -------------------------------------------------------------------------
    // 6. BARRE DE CHAT / CAPSULE VOCALE INTERACTIVE (ANIMATION CENTRALE)
    // -------------------------------------------------------------------------
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
        ctx.lineWidth = 1.8;
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

    // -------------------------------------------------------------------------
    // ICÔNE AUDIO WAVEFORM FINE & ÉLÉGANTE (NON GRASSE)
    // 5 barres verticales élancées et précises
    // -------------------------------------------------------------------------
    const waveTargetX = isCompactVoice && barWidth < 200 ? 0 : barWidth / 2 - 46;
    const waveX = lerp(barWidth / 2 - 46, 0, clamp((420 - barWidth) / (420 - 134), 0, 1));

    ctx.save();
    ctx.translate(waveX, 0);

    // Paramètres fins et élancés
    const barW = 2.2;        // Ultra fin & net (vs 4px auparavant)
    const barGap = 6.2;      // Espacement soigné
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

    // Indicateur de tap tactile utilisateur (à t = 2.6s - 3.2s)
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

    if (t <= 0.05) return; // Démarrage sur noir pur

    // -------------------------------------------------------------------------
    // CHORÉGRAPHIE TÉLÉPHONE & CAMÉRA
    // - t = 0..1.8s : Le téléphone descend partiellement, le bas du téléphone
    //                 arrive au milieu de l'écran (phoneY = -470)
    // - t = 2.0..3.2s : Zoom sur la barre de chat
    // - t = 3.0..4.8s : Rétrécissement en capsule, user parle (audio animé fin)
    // - t = 4.8..6.2s : Dézoom caméra ET descente du téléphone vers phoneY = 0
    //                   pour dévoiler TOUT le téléphone centré !
    // - t = 6.2..10.0s : L'orbe disparaît, la question et le résultat texte pur apparaissent
    // -------------------------------------------------------------------------

    let camZoom = 1.0;
    let camY = 0;
    let phoneY = -470;

    if (t < 1.8) {
        // Descente initiale partielle : le bas du téléphone s'arrête au milieu de l'écran
        const enterP = ease.snappy(clamp(t / 1.6, 0, 1));
        phoneY = lerp(-1300, -470, enterP);
        camZoom = 1.0;
        camY = 0;
    } else if (t >= 1.8 && t < 2.2) {
        // Attente avant zoom
        phoneY = -470;
        camZoom = 1.0;
        camY = 0;
    } else if (t >= 2.2 && t < 3.2) {
        // Zoom caméra sur la barre de chat
        const zoomP = ease.inOut((t - 2.2) / 1.0);
        camZoom = lerp(1.0, 2.2, zoomP);
        camY = lerp(0, -90, zoomP);
        phoneY = -470;
    } else if (t >= 3.2 && t < 4.8) {
        // Maintien zoom lors de la prise de parole
        camZoom = 2.2;
        camY = -90;
        phoneY = -470;
    } else if (t >= 4.8 && t < 6.2) {
        // Dézoom caméra ET descente du téléphone pour révéler l'appareil entier !
        const transitionP = ease.inOut((t - 4.8) / 1.4);
        camZoom = lerp(2.2, 1.0, transitionP);
        camY = lerp(-90, 0, transitionP);
        phoneY = lerp(-470, 0, transitionP);
    } else {
        // Vue complète stabilisée avec flottement organique subtil
        camZoom = 1.0;
        camY = 0;
        phoneY = Math.sin((t - 6.2) * 1.5) * 4;
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

// =============================================================================
// CONTRAT DE LECTURE VIBEEDITOR STUDIO (TIMELINE EXTERNE)
// =============================================================================
window.renderAt = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    drawScene(playbackTime);
};

window.timelineSeek = function(timeInSeconds) {
    window.renderAt(timeInSeconds);
};

window.syncAudioTimeline = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    audioBgm.volume = 0.35 * clamp((DURATION - playbackTime) / 0.8, 0, 1);
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

window.addEventListener('DOMContentLoaded', () => {
    window.renderAt(0);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isPlaying ? pause() : play();
    }
});

// Initialisation au chargement de l'orbe
orbImg.onload = function() {
    window.renderAt(0);
};
if (orbImg.complete) {
    window.renderAt(0);
}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'build_phone_video.cjs'), fs.readFileSync(__filename));
fs.writeFileSync(path.join(__dirname, '../04_Videos/design_ai_phone_voice_10s.html'), html, 'utf-8');
console.log('✅ 04_Videos/design_ai_phone_voice_10s.html updated: 0 UI buttons inside video, pure seamless gradient background!');
