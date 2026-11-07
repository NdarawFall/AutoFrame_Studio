const fs = require('fs');
const path = require('path');

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Top 10 Meilleurs Joueurs du Monde (2024-2025) — 16:9 Broadcast</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
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
            font-family: 'Montserrat', 'Inter', -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        #stage {
            width: 1920px;
            height: 1080px;
            position: relative;
            background: #02040a;
            overflow: hidden;
            aspect-ratio: 16 / 9;
            max-width: 100vw;
            max-height: 100vh;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.98);
        }

        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>
</head>
<body>
    <div id="stage" data-duration="18.5">
        <canvas id="mainCanvas" width="1920" height="1080"></canvas>
    </div>

    <!-- Pistes Audio : Voix off HeyGen officielle complète (10 à 1) + Beat dynamique Kevin MacLeod -->
    <audio id="audioVoice" src="/01_Assets/Voix_Off/top10_official_2024.wav" preload="auto"></audio>
    <audio id="audioBgm" src="/01_Assets/Musiques/Hitman.mp3" preload="auto" loop></audio>

<script>
// ==============================================================================
// VIBEEDITOR 1.0 — TOP 10 OFFICIEL FOOTBALL MONDIAL (16:9 BROADCAST 1920x1080)
// Moteur Canvas 2D Déterministe • Synchronisation Précise Voix Off HeyGen
// ==============================================================================
const canvas = document.getElementById('mainCanvas');
const g = canvas.getContext('2d');
const audioVoice = document.getElementById('audioVoice');
const audioBgm = document.getElementById('audioBgm');

const DURATION = 18.5;
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
    }
};

function roundRect(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    r = Math.min(Math.max(0, r), Math.min(w / 2, h / 2));
    if (r <= 0) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// -----------------------------------------------------------------------------
// LE VRAI CLASSEMENT MONDIAL ACTUEL (OFFICIEL BALLON D'OR / FIFA 2024-2025)
// Timings calibrés à la milliseconde près sur la voix off HeyGen
// -----------------------------------------------------------------------------
const top10Players = [
    {
        rank: 10,
        name: "HARRY KANE",
        number: "9",
        club: "BAYERN MUNICH",
        country: "ANGLETERRE",
        role: "BUTEUR D'ÉLITE",
        stats: [
            { label: "BUTS 2024", val: "44 BUTS" },
            { label: "TITRE", val: "SOULIER D'OR" },
            { label: "NOTE", val: "90 OVR" }
        ],
        themeColor: "#dc2626",
        glowColor: "rgba(220, 38, 38, 0.7)",
        playerImgSrc: "/01_Assets/Illustrations/Players/harry-kane.png",
        clubLogoSrc: "/01_Assets/Logos/Football/bayern-munchen.png",
        start: 2.3,
        end: 3.7
    },
    {
        rank: 9,
        name: "PHIL FODEN",
        number: "47",
        club: "MANCHESTER CITY",
        country: "ANGLETERRE",
        role: "MEILLEUR JOUEUR DE PREMIER LEAGUE",
        stats: [
            { label: "G/A", val: "39 G/A" },
            { label: "PREMIER LEAGUE", val: "CHAMPION" },
            { label: "NOTE", val: "88 OVR" }
        ],
        themeColor: "#38bdf8",
        glowColor: "rgba(56, 189, 248, 0.7)",
        playerImgSrc: "/01_Assets/Illustrations/Players/phil-foden.png",
        clubLogoSrc: "/01_Assets/Logos/Football/manchester-city.png",
        start: 3.7,
        end: 5.2
    },
    {
        rank: 8,
        name: "LAMINE YAMAL",
        number: "19",
        club: "FC BARCELONE",
        country: "ESPAGNE",
        role: "PRODIGE MONDIAL & VAINQUEUR EURO 2024",
        stats: [
            { label: "EURO 2024", val: "CHAMPION" },
            { label: "TROPHÉE", val: "KOPA 2024" },
            { label: "ÂGE", val: "17 ANS" }
        ],
        themeColor: "#a855f7",
        glowColor: "rgba(168, 85, 247, 0.75)",
        playerImgSrc: "/01_Assets/Illustrations/Players/lamine-yamal.png",
        clubLogoSrc: "/01_Assets/Logos/Football/barcelona.png",
        start: 5.2,
        end: 6.7
    },
    {
        rank: 7,
        name: "LAUTARO MARTÍNEZ",
        number: "10",
        club: "INTER MILAN",
        country: "ARGENTINE",
        role: "CAPITAINE & MEILLEUR BUTEUR DE SERIE A",
        stats: [
            { label: "COPA AMERICA", val: "CHAMPION" },
            { label: "SERIE A", val: "MEILLEUR BUTEUR" },
            { label: "NOTE", val: "89 OVR" }
        ],
        themeColor: "#2563eb",
        glowColor: "rgba(37, 99, 235, 0.7)",
        playerImgSrc: "/01_Assets/Illustrations/Players/lautaro-martinez.png",
        clubLogoSrc: "/01_Assets/Logos/Football/inter.png",
        start: 6.7,
        end: 8.3
    },
    {
        rank: 6,
        name: "KYLIAN MBAPPÉ",
        number: "9",
        club: "REAL MADRID",
        country: "FRANCE",
        role: "ATTAQUANT GÉNÉTIQUE & FLASH DU FOOTBALL",
        stats: [
            { label: "BUTS 2024", val: "44 BUTS" },
            { label: "VITESSE", val: "38.0 KM/H" },
            { label: "NOTE", val: "91 OVR" }
        ],
        themeColor: "#3b82f6",
        glowColor: "rgba(59, 130, 246, 0.8)",
        playerImgSrc: "/01_Assets/Illustrations/Players/kylian-mbappe.png",
        clubLogoSrc: "/01_Assets/Logos/Football/real-madrid.png",
        start: 8.3,
        end: 9.8
    },
    {
        rank: 5,
        name: "ERLING HAALAND",
        number: "9",
        club: "MANCHESTER CITY",
        country: "NORVÈGE",
        role: "LE CYBORG • MACHINE À BUTS INARRÊTABLE",
        stats: [
            { label: "BUTS/2 ANS", val: "90 BUTS" },
            { label: "GOLDEN BOOT", val: "PREMIER LEAGUE" },
            { label: "NOTE", val: "91 OVR" }
        ],
        themeColor: "#0284c7",
        glowColor: "rgba(2, 132, 199, 0.8)",
        playerImgSrc: "/01_Assets/Illustrations/Players/erling-haaland.png",
        clubLogoSrc: "/01_Assets/Logos/Football/manchester-city.png",
        start: 9.8,
        end: 11.3
    },
    {
        rank: 4,
        name: "DANI CARVAJAL",
        number: "2",
        club: "REAL MADRID",
        country: "ESPAGNE",
        role: "LE LATÉRAL LE PLUS TITRÉ DE L'HISTOIRE",
        stats: [
            { label: "UCL + EURO", val: "DOUBLE SACRE" },
            { label: "FINALE UCL", val: "BUTEUR DÉCISIF" },
            { label: "NOTE", val: "87 OVR" }
        ],
        themeColor: "#f59e0b",
        glowColor: "rgba(245, 158, 11, 0.75)",
        playerImgSrc: "/01_Assets/Illustrations/Players/daniel-carvajal.png",
        clubLogoSrc: "/01_Assets/Logos/Football/real-madrid.png",
        start: 11.3,
        end: 12.9
    },
    {
        rank: 3,
        name: "JUDE BELLINGHAM",
        number: "5",
        club: "REAL MADRID",
        country: "ANGLETERRE",
        role: "🥉 PODIUM MONDIAL #3 • GOLDEN BOY SUPRÊME",
        stats: [
            { label: "SAISON 1", val: "23 BUTS" },
            { label: "LIGA & UCL", val: "DOUBLE CHAMPION" },
            { label: "NOTE", val: "90 OVR" }
        ],
        themeColor: "#d97706",
        glowColor: "rgba(217, 119, 6, 0.85)",
        playerImgSrc: "/01_Assets/Illustrations/Players/jude-bellingham.png",
        clubLogoSrc: "/01_Assets/Logos/Football/real-madrid.png",
        start: 12.9,
        end: 14.3
    },
    {
        rank: 2,
        name: "VINÍCIUS JÚNIOR",
        number: "7",
        club: "REAL MADRID",
        country: "BRÉSIL",
        role: "🥈 PODIUM MONDIAL #2 • VIRTUOSE DE LA FINALE",
        stats: [
            { label: "FINALE UCL", val: "BUTEUR DÉCISIF" },
            { label: "CHAMPIONS LEAGUE", val: "MEILLEUR JOUEUR" },
            { label: "NOTE", val: "90 OVR" }
        ],
        themeColor: "#e2e8f0",
        glowColor: "rgba(226, 232, 240, 0.85)",
        playerImgSrc: "/01_Assets/Illustrations/Players/vinicius-junior.png",
        clubLogoSrc: "/01_Assets/Logos/Football/real-madrid.png",
        start: 14.3,
        end: 15.9
    },
    {
        rank: 1,
        name: "RODRI",
        number: "16",
        club: "MANCHESTER CITY",
        country: "ESPAGNE",
        role: "🥇 BALLON D'OR 2024 • NUMÉRO 1 MONDIAL INCONTESTÉ",
        stats: [
            { label: "BALLON D'OR", val: "VAINQUEUR 2024" },
            { label: "EURO 2024", val: "MEILLEUR JOUEUR" },
            { label: "NOTE", val: "91 OVR" }
        ],
        themeColor: "#fbbf24",
        glowColor: "rgba(251, 191, 36, 0.95)",
        playerImgSrc: "/01_Assets/Illustrations/Players/rodri.png",
        clubLogoSrc: "/01_Assets/Logos/Football/manchester-city.png",
        start: 15.9,
        end: 17.7
    }
];

// Préchargement des images détourées et logos de clubs
top10Players.forEach(p => {
    p.playerImg = new Image();
    p.playerImg.src = p.playerImgSrc;
    p.clubLogoImg = new Image();
    p.clubLogoImg.src = p.clubLogoSrc;
});

// -----------------------------------------------------------------------------
// FOND CINÉMATIQUE 16:9 STADIUM BROADCAST
// -----------------------------------------------------------------------------
function drawBroadcastBackground(t, activeColor) {
    // 1. Fond sombre carbone
    const bgGrad = g.createRadialGradient(960, 540, 250, 960, 540, 1200);
    bgGrad.addColorStop(0.0, '#0a101f');
    bgGrad.addColorStop(0.5, '#04070d');
    bgGrad.addColorStop(1.0, '#010205');
    g.fillStyle = bgGrad;
    g.fillRect(0, 0, 1920, 1080);

    // 2. Grilles hexagonales et faisceaux sportifs de studio
    g.save();
    g.globalAlpha = 0.22;
    g.filter = 'blur(70px)';

    // Faisceau lumineux gauche (Spotlight)
    const beamAngleL = Math.sin(t * 1.6) * 0.12;
    g.save();
    g.translate(300, 0);
    g.rotate(0.4 + beamAngleL);
    const gradL = g.createLinearGradient(0, 0, 500, 1200);
    gradL.addColorStop(0.0, activeColor || 'rgba(59, 130, 246, 0.8)');
    gradL.addColorStop(1.0, 'transparent');
    g.fillStyle = gradL;
    g.fillRect(-150, 0, 300, 1400);
    g.restore();

    // Faisceau lumineux droit derrière le joueur
    const beamAngleR = Math.cos(t * 1.6) * 0.12;
    g.save();
    g.translate(1620, 0);
    g.rotate(-0.4 + beamAngleR);
    const gradR = g.createLinearGradient(0, 0, -500, 1200);
    gradR.addColorStop(0.0, activeColor || 'rgba(245, 158, 11, 0.8)');
    gradR.addColorStop(1.0, 'transparent');
    g.fillStyle = gradR;
    g.fillRect(-150, 0, 300, 1400);
    g.restore();

    g.restore();

    // 3. Lignes décoratives d'arène sportives
    g.save();
    g.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
        const lx = 200 + i * 260;
        g.beginPath();
        g.moveTo(lx, 0);
        g.lineTo(lx - 200, 1080);
        g.stroke();
    }
    g.restore();
}

// -----------------------------------------------------------------------------
// SCÈNE 0 : INTRO HOOK (0.0s - 2.3s)
// "Top dix des meilleurs joueurs actuels."
// -----------------------------------------------------------------------------
function drawIntroScene16x9(t) {
    const p = clamp(t / 2.3, 0, 1);
    const zoom = 1.0 + (1 - ease.out(p)) * 0.15;

    g.save();
    g.translate(960, 540);
    g.scale(zoom, zoom);
    g.translate(-960, -540);

    g.textAlign = 'center';
    g.textBaseline = 'middle';

    // Badge officiel Ballon d'Or / FIFA
    const badgeW = 420;
    const badgeH = 56;
    roundRect(g, 960 - badgeW / 2, 340 - badgeH / 2, badgeW, badgeH, 28);
    g.fillStyle = 'rgba(245, 158, 11, 0.15)';
    g.fill();
    g.strokeStyle = '#f59e0b';
    g.lineWidth = 2;
    g.stroke();

    g.font = '800 22px "Montserrat", sans-serif';
    g.letterSpacing = '3px';
    g.fillStyle = '#f59e0b';
    g.fillText('⚽ BALLON D\\'OR & FIFA 2024 / 2025', 960, 340);

    // Titre Géant "TOP 10 MONDIAL"
    g.font = '900 125px "Montserrat", sans-serif';
    g.letterSpacing = '-2px';
    g.fillStyle = '#ffffff';
    g.shadowColor = 'rgba(245, 158, 11, 0.85)';
    g.shadowBlur = 40;
    g.fillText('TOP 10 MONDIAL', 960, 480);

    // Sous-titre
    g.font = '900 46px "Montserrat", sans-serif';
    g.letterSpacing = '6px';
    g.fillStyle = '#f59e0b';
    g.shadowBlur = 20;
    g.fillText('LES MEILLEURS JOUEURS DE LA PLANÈTE', 960, 580);

    // Description du Countdown
    g.font = '600 26px "Inter", sans-serif';
    g.letterSpacing = '2px';
    g.fillStyle = 'rgba(255, 255, 255, 0.85)';
    g.shadowBlur = 0;
    g.fillText('DU N°10 JUSQU\\'AU BALLON D\\'OR INCONTESTÉ', 960, 660);

    g.restore();
}

// -----------------------------------------------------------------------------
// SCÈNE JOUEUR 16:9 : TYPOGRAPHIE À GAUCHE & HERO + CARTE SOCLE À DROITE
// -----------------------------------------------------------------------------
function drawPlayerScene16x9(t, player) {
    const segT = t - player.start;
    const segDur = player.end - player.start;
    const progress = clamp(segT / segDur, 0, 1);

    // Animation d'entrée : Glissement dynamique depuis la droite avec ressort
    const enterProgress = clamp(segT / 0.35, 0, 1);
    const enterSlideX = (1 - ease.out(enterProgress)) * 320;
    const enterFade = ease.out(enterProgress);

    // Halo circulaire vibrant aux couleurs du club derrière le joueur
    g.save();
    const haloGrad = g.createRadialGradient(1450, 480, 100, 1450, 480, 600);
    haloGrad.addColorStop(0.0, player.glowColor);
    haloGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
    haloGrad.addColorStop(1.0, 'transparent');
    g.fillStyle = haloGrad;
    g.fillRect(800, 0, 1120, 1080);
    g.restore();

    // =========================================================================
    // SECTION DROITE : JOUEUR EN GRAND DÉTOURÉ + SOCLE CARD QUI CACHE LA COUPE
    // =========================================================================
    const playerBaseX = 1440 + enterSlideX;
    const playerBaseY = 160;

    // 1. Image détourée haute résolution
    if (player.playerImg && player.playerImg.complete && player.playerImg.naturalWidth > 0) {
        g.save();
        g.globalAlpha = enterFade;

        // Micro-flottement subtil
        const floatY = Math.sin(t * 3.5) * 8;

        g.translate(playerBaseX, playerBaseY + floatY);

        // Ombre portée profonde
        g.shadowColor = 'rgba(0, 0, 0, 0.95)';
        g.shadowBlur = 40;
        g.shadowOffsetX = -15;
        g.shadowOffsetY = 25;

        // Ratio hauteur préservé (ne jamais étirer ni déformer)
        const nw = player.playerImg.naturalWidth;
        const nh = player.playerImg.naturalHeight;
        const targetH = 820;
        const targetW = (nw / nh) * targetH;

        g.drawImage(player.playerImg, -targetW / 2, 0, targetW, targetH);
        g.restore();
    }

    // 2. CARTE ÉLÉGANTE QUI CACHE LE BAS COUPÉ DU JOUEUR (BASE CARD / EA SPORTS STYLE)
    const baseCardX = 1120;
    const baseCardY = 820;
    const baseCardW = 680;
    const baseCardH = 190;

    g.save();
    g.globalAlpha = enterFade;

    // Fond glassmorphism sombre avec bordure accentuée
    roundRect(g, baseCardX, baseCardY, baseCardW, baseCardH, 24);
    const cardBgGrad = g.createLinearGradient(baseCardX, baseCardY, baseCardX + baseCardW, baseCardY + baseCardH);
    cardBgGrad.addColorStop(0.0, 'rgba(15, 23, 42, 0.96)');
    cardBgGrad.addColorStop(1.0, 'rgba(8, 12, 22, 0.98)');
    g.fillStyle = cardBgGrad;
    g.fill();

    g.strokeStyle = player.themeColor;
    g.lineWidth = 2.5;
    g.shadowColor = player.glowColor;
    g.shadowBlur = 18;
    g.stroke();
    g.shadowBlur = 0;

    // Logo du club officiel à gauche de la carte
    if (player.clubLogoImg && player.clubLogoImg.complete && player.clubLogoImg.naturalWidth > 0) {
        const logoSize = 100;
        const logoX = baseCardX + 35;
        const logoY = baseCardY + (baseCardH - logoSize) / 2;

        // Cercle décoratif sous le logo
        g.beginPath();
        g.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 10, 0, Math.PI * 2);
        g.fillStyle = 'rgba(255, 255, 255, 0.06)';
        g.fill();
        g.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        g.lineWidth = 1.2;
        g.stroke();

        g.drawImage(player.clubLogoImg, logoX, logoY, logoSize, logoSize);
    }

    // Nom et Club dans la carte de socle
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';

    g.font = '900 42px "Montserrat", sans-serif';
    g.fillStyle = '#ffffff';
    g.fillText(player.name, baseCardX + 175, baseCardY + 75);

    g.font = '700 22px "Inter", sans-serif';
    g.letterSpacing = '1px';
    g.fillStyle = player.themeColor;
    g.fillText(\`\${player.club} • \${player.country}\`, baseCardX + 175, baseCardY + 118);

    g.font = '600 18px "Inter", sans-serif';
    g.letterSpacing = '0.5px';
    g.fillStyle = 'rgba(255, 255, 255, 0.75)';
    g.fillText(\`Dossard #\${player.number} • Saison 2024 / 2025\`, baseCardX + 175, baseCardY + 155);

    g.restore();

    // =========================================================================
    // SECTION GAUCHE (16:9) : TYPOGRAPHIE GÉANTE, RANG & STATS OFFICIELLES
    // =========================================================================
    g.save();
    g.globalAlpha = enterFade;

    const leftX = 140;

    // 1. Watermark Rank Chiffre Géant en arrière plan
    g.font = '900 320px "Montserrat", sans-serif';
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = 'rgba(255, 255, 255, 0.035)';
    g.fillText(\`#\${player.rank}\`, leftX, 150);

    // 2. Badge de Podium / Rang
    const rankBadgeW = 380;
    const rankBadgeH = 54;
    roundRect(g, leftX, 230, rankBadgeW, rankBadgeH, 27);
    g.fillStyle = (player.rank === 1) ? '#fbbf24' : (player.rank <= 3 ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)');
    g.shadowColor = (player.rank === 1) ? 'rgba(251, 191, 36, 0.8)' : 'transparent';
    g.shadowBlur = (player.rank === 1) ? 25 : 0;
    g.fill();
    g.shadowBlur = 0;

    g.strokeStyle = player.themeColor;
    g.lineWidth = 2;
    if (player.rank > 1) g.stroke();

    g.font = '900 20px "Montserrat", sans-serif';
    g.letterSpacing = '2px';
    g.fillStyle = (player.rank === 1) ? '#000000' : (player.rank <= 3 ? '#000000' : player.themeColor);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText((player.rank === 1) ? '👑 BALLON D\\'OR 2024 • N°1' : (player.rank <= 3 ? \`PODIUM MONDIAL #\${player.rank}\` : \`CLASSEMENT OFFICIEL #\${player.rank}\`), leftX + rankBadgeW / 2, 230 + rankBadgeH / 2);

    // 3. Numéro de Rang Principal "#10" à "#1"
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.font = '900 110px "Montserrat", sans-serif';
    g.letterSpacing = '-3px';
    g.fillStyle = player.themeColor;
    g.shadowColor = player.glowColor;
    g.shadowBlur = 30;
    g.fillText(\`#\${player.rank}\`, leftX, 420);
    g.shadowBlur = 0;

    // Nom du joueur en titre géant
    g.font = '900 78px "Montserrat", sans-serif';
    g.letterSpacing = '-1px';
    g.fillStyle = '#ffffff';
    g.fillText(player.name, leftX + 220, 420);

    // Titre / Rôle
    g.font = '800 28px "Inter", sans-serif';
    g.letterSpacing = '1px';
    g.fillStyle = player.themeColor;
    g.fillText(player.role, leftX, 480);

    // 4. Cartouches de Statistiques Clés (3 colonnes)
    const statBoxY = 540;
    const statBoxW = 260;
    const statBoxH = 120;
    const statGap = 25;

    for (let s = 0; s < player.stats.length; s++) {
        const sx = leftX + s * (statBoxW + statGap);
        roundRect(g, sx, statBoxY, statBoxW, statBoxH, 20);
        g.fillStyle = 'rgba(255, 255, 255, 0.05)';
        g.fill();
        g.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        g.lineWidth = 1.2;
        g.stroke();

        g.textAlign = 'center';
        g.font = '700 16px "Inter", sans-serif';
        g.letterSpacing = '1.5px';
        g.fillStyle = 'rgba(255, 255, 255, 0.65)';
        g.fillText(player.stats[s].label, sx + statBoxW / 2, statBoxY + 42);

        g.font = '900 26px "Montserrat", sans-serif';
        g.letterSpacing = '0.5px';
        g.fillStyle = '#ffffff';
        g.fillText(player.stats[s].val, sx + statBoxW / 2, statBoxY + 86);
    }

    g.restore();
}

// -----------------------------------------------------------------------------
// SCÈNE DE FIN / OUTRO (17.7s - 18.5s)
// -----------------------------------------------------------------------------
function drawOutroScene16x9(t) {
    const fade = clamp((t - 17.7) / 0.8, 0, 1);
    g.save();
    g.fillStyle = \`rgba(0, 0, 0, \${fade * 0.95})\`;
    g.fillRect(0, 0, 1920, 1080);

    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '900 68px "Montserrat", sans-serif';
    g.fillStyle = '#fbbf24';
    g.fillText('RODRI EST-IL TON N°1 MONDIAL ?', 960, 500);

    g.font = '800 34px "Inter", sans-serif';
    g.fillStyle = '#ffffff';
    g.fillText('DONNE TON TOP 3 EN COMMENTAIRE ! 💬👇', 960, 590);
    g.restore();
}

// -----------------------------------------------------------------------------
// BARRE DE PROGRESSION & EN-TÊTE 16:9
// -----------------------------------------------------------------------------
function drawHeader16x9(t) {
    g.save();

    // 1. Barre de progression supérieure dynamique
    const progressW = (t / DURATION) * 1720;
    roundRect(g, 100, 50, 1720, 8, 4);
    g.fillStyle = 'rgba(255, 255, 255, 0.12)';
    g.fill();

    // Barre active dorée avec reflet néon
    roundRect(g, 100, 50, progressW, 8, 4);
    const gradProg = g.createLinearGradient(100, 0, 100 + progressW, 0);
    gradProg.addColorStop(0.0, '#3b82f6');
    gradProg.addColorStop(0.5, '#f59e0b');
    gradProg.addColorStop(1.0, '#fbbf24');
    g.fillStyle = gradProg;
    g.shadowColor = 'rgba(245, 158, 11, 0.8)';
    g.shadowBlur = 12;
    g.fill();
    g.shadowBlur = 0;

    // 2. Labels d'en-tête Broadcast
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.font = '800 18px "Montserrat", sans-serif';
    g.letterSpacing = '3px';
    g.fillStyle = 'rgba(255, 255, 255, 0.8)';
    g.fillText('✦ CLASSEMENT MONDIAL DES JOUEURS ✦', 100, 95);

    g.textAlign = 'right';
    g.font = '700 16px "Inter", sans-serif';
    g.letterSpacing = '1px';
    g.fillStyle = '#f59e0b';
    g.fillText('BALLON D\\'OR 2024 OFFICIAL TOP 10', 1820, 95);

    g.restore();
}

// -----------------------------------------------------------------------------
// MOTEUR PRINCIPAL DE RENDU FRAME PAR FRAME
// -----------------------------------------------------------------------------
function renderFrame(t) {
    g.clearRect(0, 0, 1920, 1080);

    // Joueur actif selon le temps exact
    let activeColor = '#3b82f6';
    const activePlayer = top10Players.find(p => t >= p.start && t < p.end);
    if (activePlayer) {
        activeColor = activePlayer.themeColor;
    }

    // 1. Fond d'ambiance stadium broadcast
    drawBroadcastBackground(t, activeColor);

    // 2. Rendu de la scène appropriée
    if (t < 2.3) {
        drawIntroScene16x9(t);
    } else if (t >= 17.7) {
        drawOutroScene16x9(t);
    } else if (activePlayer) {
        drawPlayerScene16x9(t, activePlayer);
    }

    // 3. En-tête global et timeline supérieure
    drawHeader16x9(t);
}

// =============================================================================
// INTERFACE VIBEEDITOR STUDIO (CONTRAT DE LECTURE TIMELINE DÉTERMINISTE 18.5s)
// =============================================================================
window.renderAt = function(timeInSeconds) {
    playbackTime = clamp(timeInSeconds, 0, DURATION);
    renderFrame(playbackTime);
};

window.timelineSeek = function(timeInSeconds) {
    window.renderAt(timeInSeconds);
    if (audioVoice) {
        audioVoice.currentTime = Math.min(playbackTime, 17.6);
    }
    if (audioBgm) {
        audioBgm.currentTime = playbackTime % (audioBgm.duration || 60);
    }
};

window.syncAudioTimeline = function(timeInSeconds, playing) {
    window.renderAt(timeInSeconds);
    if (playing) {
        if (audioVoice && Math.abs(audioVoice.currentTime - timeInSeconds) > 0.15) {
            audioVoice.currentTime = timeInSeconds;
        }
        if (audioVoice && audioVoice.paused && timeInSeconds < 17.6) {
            audioVoice.play().catch(() => {});
        }
        if (audioBgm && audioBgm.paused) {
            audioBgm.play().catch(() => {});
        }
    } else {
        if (audioVoice && !audioVoice.paused) audioVoice.pause();
        if (audioBgm && !audioBgm.paused) audioBgm.pause();
    }
};

function loop(timestamp) {
    if (!isPlaying) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    playbackTime += delta;
    if (playbackTime > DURATION) {
        playbackTime = DURATION;
        pause();
    }

    renderFrame(playbackTime);

    if (isPlaying) {
        rafId = requestAnimationFrame(loop);
    }
}

function play() {
    if (isPlaying) return;
    if (playbackTime >= DURATION) playbackTime = 0;
    isPlaying = true;
    lastTimestamp = 0;

    if (audioVoice && playbackTime < 17.6) {
        audioVoice.currentTime = playbackTime;
        audioVoice.play().catch(() => {});
    }
    if (audioBgm) {
        audioBgm.currentTime = playbackTime % (audioBgm.duration || 60);
        audioBgm.play().catch(() => {});
    }

    rafId = requestAnimationFrame(loop);
}

function pause() {
    isPlaying = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (audioVoice) audioVoice.pause();
    if (audioBgm) audioBgm.pause();
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

// Premier rendu initial
window.renderAt(0);
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../04_Videos/top10_football_15s.html'), html, 'utf-8');
console.log('✅ 04_Videos/top10_football_15s.html (16:9 Broadcast) generated successfully!');
