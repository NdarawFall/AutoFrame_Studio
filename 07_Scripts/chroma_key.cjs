/**
 * 07_Scripts/chroma_key.cjs
 * Moteur universel de détourage sur fond vert (Chroma Keying) pour IMAGES et VIDÉOS.
 * 
 * Fonctionnalités :
 * 1. IMAGES (JPG, PNG, WEBP avec fond vert) -> PNG transparent détouré net sans franges vertes (despill).
 * 2. VIDÉOS (MP4, MOV, WEBM avec fond vert) -> WEBM transparent (VP9 alpha yuva420p) ou MOV ProRes 4444.
 * 
 * Utilise FFmpeg (colorkey, chromakey, despill) et Sharp pour un lissage haute fidélité.
 * 
 * Usage CLI :
 *   node 07_Scripts/chroma_key.cjs --input <chemin_fichier> [--out <chemin_sortie>] [--color 0x00FF00] [--similarity 0.32] [--blend 0.10]
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// Résolution de FFmpeg
function getFfmpegPath() {
    try {
        const installer = require('@ffmpeg-installer/ffmpeg');
        if (installer && installer.path && fs.existsSync(installer.path)) {
            return installer.path;
        }
    } catch (e) {}

    const localFfmpeg = path.join(__dirname, '..', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
    if (fs.existsSync(localFfmpeg)) return localFfmpeg;

    return 'ffmpeg';
}

// Module Sharp pour post-traitement optionnel
let sharp = null;
try {
    sharp = require('sharp');
} catch (e) {}

/**
 * Exécute FFmpeg sous forme de promesse
 */
function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const ffmpeg = getFfmpegPath();
        execFile(ffmpeg, args, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(`FFmpeg error: ${err.message}\n${stderr || ''}`));
            }
            resolve({ stdout, stderr });
        });
    });
}

/**
 * Normalise la couleur du fond vert (format hex FFmpeg : 0x00FF00)
 */
function normalizeColorHex(hexStr) {
    if (!hexStr) return '0x00FF00';
    let clean = hexStr.toString().trim().replace(/^#/, '');
    if (clean.startsWith('0x') || clean.startsWith('0X')) {
        clean = clean.slice(2);
    }
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) clean = '00FF00';
    return `0x${clean.toUpperCase()}`;
}

/**
 * Détoure une IMAGE sur fond vert pour obtenir un PNG transparent
 * @param {string} inputPath - Chemin de l'image source (fond vert)
 * @param {string} [outputPath] - Chemin de sortie PNG (optionnel)
 * @param {object} [options] - Options de calibrage (color, similarity, blend, despill)
 */
async function removeGreenScreenImage(inputPath, outputPath, options = {}) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Fichier introuvable : ${inputPath}`);
    }

    const color = normalizeColorHex(options.color || '0x00FF00');
    const similarity = parseFloat(options.similarity !== undefined ? options.similarity : 0.32);
    const blend = parseFloat(options.blend !== undefined ? options.blend : 0.10);

    if (!outputPath) {
        const parsed = path.parse(inputPath);
        outputPath = path.join(parsed.dir, `${parsed.name}_detoure.png`);
    }

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Chaîne de filtres FFmpeg : colorkey + despill pour éliminer tout reflet vert sur les cheveux/vêtements
    // colorkey=color:similarity:blend,despill=type=green:expand=0.1
    const filter = `colorkey=${color}:${similarity}:${blend},despill=type=green:expand=0.1`;

    const args = [
        '-y',
        '-i', inputPath,
        '-vf', filter,
        '-c:v', 'png',
        outputPath
    ];

    await runFfmpeg(args);

    if (!fs.existsSync(outputPath)) {
        throw new Error(`Échec de création du fichier détouré : ${outputPath}`);
    }

    return {
        success: true,
        type: 'image',
        input: inputPath,
        output: outputPath
    };
}

/**
 * Détoure une VIDÉO sur fond vert pour obtenir une vidéo transparente
 * Format de sortie : WebM VP9 avec canal alpha (yuva420p) ou MOV ProRes 4444
 * @param {string} inputPath - Chemin de la vidéo source (fond vert)
 * @param {string} [outputPath] - Chemin de sortie (optionnel, .webm ou .mov)
 * @param {object} [options] - Options (color, similarity, blend, format)
 */
async function removeGreenScreenVideo(inputPath, outputPath, options = {}) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Fichier vidéo introuvable : ${inputPath}`);
    }

    const color = normalizeColorHex(options.color || '0x00FF00');
    const similarity = parseFloat(options.similarity !== undefined ? options.similarity : 0.32);
    const blend = parseFloat(options.blend !== undefined ? options.blend : 0.10);

    if (!outputPath) {
        const parsed = path.parse(inputPath);
        outputPath = path.join(parsed.dir, `${parsed.name}_transparent.webm`);
    }

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const isMov = outputPath.toLowerCase().endsWith('.mov');
    const filter = `colorkey=${color}:${similarity}:${blend},despill=type=green:expand=0.1`;

    let args = [];
    if (isMov) {
        // Format Apple ProRes 4444 avec Alpha
        args = [
            '-y',
            '-i', inputPath,
            '-vf', filter,
            '-c:v', 'prores_ks',
            '-profile:v', '4444',
            '-pix_fmt', 'yuva444p10le',
            outputPath
        ];
    } else {
        // Format WebM VP9 universel pour le Web & navigateurs
        args = [
            '-y',
            '-i', inputPath,
            '-vf', filter,
            '-c:v', 'libvpx-vp9',
            '-pix_fmt', 'yuva420p',
            '-auto-alt-ref', '0',
            outputPath
        ];
    }

    await runFfmpeg(args);

    if (!fs.existsSync(outputPath)) {
        throw new Error(`Échec de création de la vidéo transparente : ${outputPath}`);
    }

    return {
        success: true,
        type: 'video',
        input: inputPath,
        output: outputPath
    };
}

/**
 * Détection automatique (image vs vidéo) et exécution du détourage fond vert
 */
async function removeGreenScreen(inputPath, outputPath, options = {}) {
    const ext = path.extname(inputPath).toLowerCase();
    const videoExts = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    if (videoExts.includes(ext)) {
        return await removeGreenScreenVideo(inputPath, outputPath, options);
    } else {
        return await removeGreenScreenImage(inputPath, outputPath, options);
    }
}

// Support CLI direct
if (require.main === module) {
    const args = process.argv.slice(2);
    let input = '', out = '', color = '0x00FF00', similarity = 0.32, blend = 0.10;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' || args[i] === '-i') input = args[++i];
        else if (args[i] === '--out' || args[i] === '-o') out = args[++i];
        else if (args[i] === '--color' || args[i] === '-c') color = args[++i];
        else if (args[i] === '--similarity' || args[i] === '-s') similarity = parseFloat(args[++i]);
        else if (args[i] === '--blend' || args[i] === '-b') blend = parseFloat(args[++i]);
        else if (!input) input = args[i];
        else if (!out) out = args[i];
    }

    if (!input) {
        console.log(`
Usage:
  node 07_Scripts/chroma_key.cjs --input <image_ou_video> [--out <sortie>] [--color 0x00FF00] [--similarity 0.32] [--blend 0.10]

Exemples :
  node 07_Scripts/chroma_key.cjs --input photo_fond_vert.jpg --out photo_transparente.png
  node 07_Scripts/chroma_key.cjs --input video_fond_vert.mp4 --out video_transparente.webm
        `);
        process.exit(0);
    }

    console.log(`[Chroma Key] Traitement du fichier fond vert : ${input}...`);
    removeGreenScreen(input, out, { color, similarity, blend })
        .then(res => {
            console.log(`✅ Détourage fond vert réussi ! Fichier prêt : ${res.output}`);
        })
        .catch(err => {
            console.error(`❌ Erreur chroma key :`, err.message);
            process.exit(1);
        });
}

module.exports = {
    removeGreenScreen,
    removeGreenScreenImage,
    removeGreenScreenVideo
};

