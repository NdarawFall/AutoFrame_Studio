/**
 * 07_Scripts/auto_reframe.cjs
 * Recadreur automatique de vidéos horizontales (16:9 / 4:3) vers le format vertical 9:16 (1080x1920)
 * Idéal pour adapter des rushes clients ou des vidéos YouTube en Shorts, TikTok et Reels.
 * 
 * Modes disponibles :
 *   1. 'crop'   (par défaut) : Recadrage 9:16 centré direct en pleine hauteur (parfait pour face-caméra)
 *   2. 'blur'   : Vidéo centrée avec fond d'arrière-plan flouté & assombri (look pro pour tutos/podcast)
 *   3. 'fit'    : Vidéo entière avec bordures unies (noir ou blanc)
 *   4. 'split'  : Écran divisé 2 zones (Haut: Caméra 1080x960, Bas: Écran/B-Roll 1080x960)
 * 
 * Usage CLI :
 *   node 07_Scripts/auto_reframe.cjs "10_Clients/rush_16_9.mp4"
 *   node 07_Scripts/auto_reframe.cjs "10_Clients/rush_16_9.mp4" --mode blur
 *   node 07_Scripts/auto_reframe.cjs "10_Clients/rush_16_9.mp4" "04_Videos/output_9_16.mp4" --mode crop
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT_DIR, '10_Clients');

// Détection de FFmpeg
function getFfmpegPath() {
    try {
        const installer = require('@ffmpeg-installer/ffmpeg');
        if (installer && installer.path && fs.existsSync(installer.path)) {
            return installer.path;
        }
    } catch (e) {}
    return 'ffmpeg';
}
const FFMPEG_BIN = getFfmpegPath();

// Détecte la résolution et le ratio de la vidéo source via FFmpeg
function probeVideo(filePath) {
    const result = spawnSync(FFMPEG_BIN, ['-i', filePath, '-f', 'null', '-'], { encoding: 'utf8' });
    const output = (result.stderr || '') + (result.stdout || '');

    const resMatch = output.match(/Stream #.*Video:.*,\s*(\d{3,5})x(\d{3,5})/);
    let width = 1920;
    let height = 1080;
    if (resMatch) {
        width = parseInt(resMatch[1], 10);
        height = parseInt(resMatch[2], 10);
    }

    const durationMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
    let duration = 0;
    if (durationMatch) {
        duration = parseFloat(durationMatch[1]) * 3600 + parseFloat(durationMatch[2]) * 60 + parseFloat(durationMatch[3]);
    }

    return { width, height, duration, aspectRatio: width / height };
}

// Construit le filtre FFmpeg selon le mode choisi
function buildFilterComplex(mode, targetW = 1080, targetH = 1920, offsetX = 0.5) {
    switch (mode) {
        case 'blur':
        case 'pillarbox':
            // Arrière-plan flou + Avant-plan net centré
            return `[0:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},boxblur=25:5,eq=brightness=-0.12[bg]; [0:v]scale=${targetW}:-2[fg]; [bg][fg]overlay=(W-w)/2:(H-h)/2[outv]`;

        case 'fit':
        case 'letterbox':
            // Format complet avec marges noires
            return `[0:v]scale=${targetW}:-2,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black[outv]`;

        case 'split':
            // Écran scindé haut/bas (2 x 1080x960)
            const halfH = Math.floor(targetH / 2);
            return `[0:v]crop=ih*(9/16):ih:(iw-ow)*${offsetX}:0,scale=${targetW}:${halfH}[top]; [0:v]scale=${targetW}:${halfH}:force_original_aspect_ratio=increase,crop=${targetW}:${halfH}[bot]; [top][bot]vstack[outv]`;

        case 'crop':
        default:
            // Crop centré 9:16 direct en pleine hauteur
            // Formule : crop=w:h:x:y
            // target aspect = 9/16 = 0.5625
            return `[0:v]crop=ih*(9/16):ih:(iw-ow)*${offsetX}:0,scale=${targetW}:${targetH}:flags=lanczos[outv]`;
    }
}

// Fonction principale de recadrage
function autoReframe(inputPath, options = {}) {
    const {
        outputPath = null,
        mode = 'crop',
        targetResolution = '1080x1920',
        offsetX = 0.5 // 0.5 = centré, 0 = calé à gauche, 1 = calé à droite
    } = options;

    const absInput = path.resolve(inputPath);
    if (!fs.existsSync(absInput)) {
        throw new Error(`Fichier introuvable: ${absInput}`);
    }

    const [targetW, targetH] = targetResolution.split('x').map(n => parseInt(n, 10));

    console.log(`\n==================================================`);
    console.log(`📱 RECADRAGE AUTOMATIQUE 9:16 (AUTO-REFRAME)`);
    console.log(`==================================================`);
    console.log(`📁 Fichier source : ${path.basename(absInput)}`);

    const info = probeVideo(absInput);
    console.log(`📐 Résolution initiale : ${info.width}x${info.height} (ratio ${(info.aspectRatio).toFixed(2)})`);
    console.log(`🎯 Format cible        : ${targetW}x${targetH} (9:16 Vertical)`);
    console.log(`🎨 Mode sélectionné    : ${mode.toUpperCase()}`);

    const ext = path.extname(absInput);
    const baseName = path.basename(absInput, ext);
    const defaultOut = path.join(path.dirname(absInput), `${baseName}_9x16_${mode}${ext}`);
    const finalOut = path.resolve(outputPath || defaultOut);

    const filterString = buildFilterComplex(mode, targetW, targetH, offsetX);

    const ffmpegArgs = [
        '-y',
        '-i', absInput,
        '-filter_complex', filterString,
        '-map', '[outv]',
        '-map', '0:a?', // Garde l'audio s'il existe
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '18',
        '-c:a', 'aac',
        '-b:a', '192k',
        finalOut
    ];

    console.log(`⚡ Encodage haute qualité en cours...`);
    const res = spawnSync(FFMPEG_BIN, ffmpegArgs, { stdio: 'inherit' });

    if (res.status !== 0) {
        throw new Error(`FFmpeg a échoué avec le code ${res.status}`);
    }

    console.log(`\n🎉 RECADRAGE TERMINÉ AVEC SUCCÈS !`);
    console.log(`✅ Fichier vertical 9:16 généré: ${finalOut}`);
    console.log(`==================================================\n`);

    return { input: absInput, output: finalOut, mode, resolution: `${targetW}x${targetH}` };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    let input = null;
    let output = null;
    let mode = 'crop';
    let target = '1080x1920';

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--mode' || a === '-m') {
            mode = args[++i];
        } else if (a === '--target' || a === '-t') {
            target = args[++i];
        } else if (!a.startsWith('-')) {
            if (!input) input = a;
            else if (!output) output = a;
        }
    }

    if (!input) {
        // Recherche dans 10_Clients
        if (fs.existsSync(CLIENTS_DIR)) {
            const files = fs.readdirSync(CLIENTS_DIR)
                .filter(f => /\.(mp4|mov|mkv|webm)$/i.test(f) && !f.includes('9x16'))
                .map(f => path.join(CLIENTS_DIR, f));
            if (files.length > 0) input = files[0];
        }
    }

    if (!input) {
        console.log(`Usage : node 07_Scripts/auto_reframe.cjs <input_video.mp4> [output.mp4] [--mode crop|blur|fit|split] [--target 1080x1920]`);
        process.exit(1);
    }

    try {
        autoReframe(input, { outputPath: output, mode, targetResolution: target });
    } catch (err) {
        console.error(`❌ Erreur:`, err.message);
        process.exit(1);
    }
}

module.exports = { autoReframe, probeVideo, buildFilterComplex };
