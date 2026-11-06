/**
 * 07_Scripts/cut_silences.cjs
 * Découpeur automatique de silences ultra-rapide (Jump-Cut Automatique)
 * Idéal pour le prémontage de rushes clients dans 10_Clients/ (Shorts, TikTok, Reels, Podcasts)
 * 
 * Usage CLI :
 *   node 07_Scripts/cut_silences.cjs "10_Clients/mon_rush.mp4"
 *   node 07_Scripts/cut_silences.cjs "01_Assets/Voix_Off/audio.mp3" "01_Assets/Voix_Off/audio_cut.mp3"
 *   node 07_Scripts/cut_silences.cjs "10_Clients/mon_rush.mp4" --noise -32dB --min-silence 0.3 --padding 0.08
 *   node 07_Scripts/cut_silences.cjs --scan   (traite le fichier le plus récent dans 10_Clients/)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync, execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT_DIR, 'Clients');

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

// Convertit des secondes en format lisible HH:MM:SS.mmm
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00.00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

// Analyse les silences d'un fichier audio ou vidéo via FFmpeg
function detectSilences(filePath, noiseThreshold = '-30dB', minSilenceDuration = 0.35) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier introuvable: ${filePath}`);
    }

    const args = [
        '-i', filePath,
        '-af', `silencedetect=noise=${noiseThreshold}:d=${minSilenceDuration}`,
        '-f', 'null',
        '-'
    ];

    const result = spawnSync(FFMPEG_BIN, args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    const output = (result.stderr || '') + (result.stdout || '');

    // Récupérer la durée totale
    let totalDuration = 0;
    const durationMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
    if (durationMatch) {
        const hours = parseFloat(durationMatch[1]);
        const mins = parseFloat(durationMatch[2]);
        const secs = parseFloat(durationMatch[3]);
        totalDuration = hours * 3600 + mins * 60 + secs;
    }

    // Détecter si le fichier a de la vidéo
    const hasVideo = output.includes('Stream #') && output.includes('Video:');

    // Extraire les silences
    const silences = [];
    const silenceRegex = /\[silencedetect[^\]]*\]\s*silence_(start|end):\s*([\d\.]+)/g;
    let match;
    let currentStart = null;

    while ((match = silenceRegex.exec(output)) !== null) {
        const type = match[1];
        const time = parseFloat(match[2]);

        if (type === 'start') {
            currentStart = time;
        } else if (type === 'end' && currentStart !== null) {
            silences.push({
                start: currentStart,
                end: time,
                duration: time - currentStart
            });
            currentStart = null;
        }
    }

    // Cas où le silence va jusqu'à la fin du fichier
    if (currentStart !== null && totalDuration > currentStart) {
        silences.push({
            start: currentStart,
            end: totalDuration,
            duration: totalDuration - currentStart
        });
    }

    return { totalDuration, silences, hasVideo };
}

// Calcule les segments de parole utiles avec marge de respiration (padding)
function computeSpeechSegments(totalDuration, silences, padding = 0.08) {
    if (silences.length === 0) {
        return [{ start: 0, end: totalDuration, duration: totalDuration }];
    }

    const rawSegments = [];
    let lastEnd = 0;

    for (const silence of silences) {
        if (silence.start > lastEnd) {
            rawSegments.push({
                start: lastEnd,
                end: silence.start
            });
        }
        lastEnd = silence.end;
    }

    if (lastEnd < totalDuration) {
        rawSegments.push({
            start: lastEnd,
            end: totalDuration
        });
    }

    // Appliquer le padding (garde un souffle naturel avant et après la parole)
    const padded = rawSegments.map((seg, i) => {
        const pStart = i === 0 && seg.start === 0 ? 0 : Math.max(0, seg.start - padding);
        const pEnd = i === rawSegments.length - 1 && seg.end === totalDuration 
            ? totalDuration 
            : Math.min(totalDuration, seg.end + padding);
        return { start: pStart, end: pEnd };
    });

    // Fusionner les segments qui se chevauchent après ajout du padding
    const merged = [];
    for (const seg of padded) {
        if (merged.length === 0) {
            merged.push({ ...seg });
            continue;
        }
        const prev = merged[merged.length - 1];
        if (seg.start <= prev.end + 0.05) {
            // Chevauchement ou séparation minuscule : on fusionne
            prev.end = Math.max(prev.end, seg.end);
        } else {
            merged.push({ ...seg });
        }
    }

    // Calculer les durées et filtrer les artefacts ultra-courts (< 0.1s)
    return merged
        .map(s => ({
            start: parseFloat(s.start.toFixed(3)),
            end: parseFloat(s.end.toFixed(3)),
            duration: parseFloat((s.end - s.start).toFixed(3))
        }))
        .filter(s => s.duration >= 0.1);
}

// Découpe et réassemble les segments parlés sans perte de synchro
function cutSilences(inputPath, options = {}) {
    const {
        outputPath = null,
        noise = '-30dB',
        minSilence = 0.35,
        padding = 0.08,
        writeEdlJson = true
    } = options;

    const absInput = path.resolve(inputPath);
    if (!fs.existsSync(absInput)) {
        throw new Error(`Fichier introuvable: ${absInput}`);
    }

    console.log(`\n==================================================`);
    console.log(`🎬 DÉCOUPE AUTOMATIQUE DE SILENCES (JUMP-CUT)`);
    console.log(`==================================================`);
    console.log(`📁 Fichier source : ${path.basename(absInput)}`);
    console.log(`⚙️  Paramètres     : Seuil=${noise} | SilenceMin=${minSilence}s | Marge=${padding}s`);

    // 1. Détection des silences
    process.stdout.write(`🔍 Analyse acoustique en cours... `);
    const { totalDuration, silences, hasVideo } = detectSilences(absInput, noise, minSilence);
    console.log(`OK!`);
    console.log(`⏱️  Durée initiale : ${formatTime(totalDuration)} (${totalDuration.toFixed(2)}s)`);
    console.log(`🔇 Silences trouvés: ${silences.length}`);

    if (silences.length === 0) {
        console.log(`✨ Aucun silence significatif détecté. Le fichier est déjà continu !`);
        return { input: absInput, output: absInput, cutCount: 0, timeSaved: 0 };
    }

    // 2. Calcul des segments utiles
    const segments = computeSpeechSegments(totalDuration, silences, padding);
    const finalDuration = segments.reduce((acc, s) => acc + s.duration, 0);
    const timeSaved = Math.max(0, totalDuration - finalDuration);
    const percentSaved = ((timeSaved / totalDuration) * 100).toFixed(1);

    console.log(`✂️  Segments parlés conservés : ${segments.length}`);
    console.log(`⏱️  Nouvelle durée estimée    : ${formatTime(finalDuration)} (${finalDuration.toFixed(2)}s)`);
    console.log(`🚀 Gain de temps             : -${timeSaved.toFixed(1)}s (-${percentSaved}%)`);

    // 3. Déterminer le fichier de sortie
    const ext = path.extname(absInput);
    const baseName = path.basename(absInput, ext);
    const defaultOut = path.join(path.dirname(absInput), `${baseName}_cut${ext}`);
    const finalOut = path.resolve(outputPath || defaultOut);

    // 4. Générer le script FFmpeg filter_complex
    // Pour éviter la limite de caractères de la ligne de commande Windows (8191 cars),
    // on écrit un fichier temporaire filter_complex_script
    const tmpFilterFile = path.join(os.tmpdir(), `cut_filter_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
    const filterParts = [];
    const vConcatInputs = [];
    const aConcatInputs = [];

    segments.forEach((seg, idx) => {
        if (hasVideo) {
            filterParts.push(`[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${idx}]`);
            vConcatInputs.push(`[v${idx}]`);
        }
        filterParts.push(`[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${idx}]`);
        aConcatInputs.push(`[a${idx}]`);
    });

    if (hasVideo) {
        filterParts.push(`${vConcatInputs.join('')}${aConcatInputs.join('')}concat=n=${segments.length}:v=1:a=1[outv][outa]`);
    } else {
        filterParts.push(`${aConcatInputs.join('')}concat=n=${segments.length}:v=0:a=1[outa]`);
    }

    fs.writeFileSync(tmpFilterFile, filterParts.join(';\n'), 'utf8');

    // 5. Exécution de FFmpeg
    console.log(`⚡ Exportation du fichier découpé...`);
    const ffmpegArgs = [
        '-y',
        '-i', absInput,
        '-filter_complex_script', tmpFilterFile
    ];

    if (hasVideo) {
        ffmpegArgs.push(
            '-map', '[outv]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '18',
            '-c:a', 'aac',
            '-b:a', '192k'
        );
    } else {
        ffmpegArgs.push(
            '-map', '[outa]',
            '-c:a', ext.toLowerCase() === '.mp3' ? 'libmp3lame' : 'aac',
            '-b:a', '192k'
        );
    }

    ffmpegArgs.push(finalOut);

    const runResult = spawnSync(FFMPEG_BIN, ffmpegArgs, { stdio: 'inherit' });

    // Nettoyage fichier temporaire
    try { fs.unlinkSync(tmpFilterFile); } catch (e) {}

    if (runResult.status !== 0) {
        throw new Error(`FFmpeg a échoué avec le code ${runResult.status}`);
    }

    // 6. Écriture du fichier EDL JSON (timestamps conservés et supprimés)
    if (writeEdlJson) {
        const edlPath = path.join(path.dirname(finalOut), `${baseName}_cut.edl.json`);
        fs.writeFileSync(edlPath, JSON.stringify({
            source: absInput,
            output: finalOut,
            initialDuration: totalDuration,
            finalDuration: finalDuration,
            timeSaved: timeSaved,
            percentSaved: `${percentSaved}%`,
            cutCount: silences.length,
            parameters: { noise, minSilence, padding },
            keptSegments: segments,
            removedSilences: silences
        }, null, 2), 'utf8');
        console.log(`📋 Plan de montage sauvegardé: ${path.basename(edlPath)}`);
    }

    console.log(`\n🎉 TERMINÉ AVEC SUCCÈS !`);
    console.log(`✅ Fichier généré: ${finalOut}`);
    console.log(`==================================================\n`);

    return {
        input: absInput,
        output: finalOut,
        initialDuration: totalDuration,
        finalDuration: finalDuration,
        timeSaved: timeSaved,
        cutCount: silences.length
    };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);

    let inputPath = null;
    let outputPath = null;
    let noise = '-30dB';
    let minSilence = 0.35;
    let padding = 0.08;

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--noise' || a === '-n') {
            noise = args[++i];
        } else if (a === '--min-silence' || a === '-d') {
            minSilence = parseFloat(args[++i]);
        } else if (a === '--padding' || a === '-p') {
            padding = parseFloat(args[++i]);
        } else if (a === '--scan') {
            // Scan 10_Clients pour le fichier le plus récent
            if (fs.existsSync(CLIENTS_DIR)) {
                const files = fs.readdirSync(CLIENTS_DIR)
                    .filter(f => !f.startsWith('.') && !f.endsWith('.json') && !f.endsWith('.md'))
                    .map(f => ({ name: f, path: path.join(CLIENTS_DIR, f), time: fs.statSync(path.join(CLIENTS_DIR, f)).mtimeMs }))
                    .sort((a, b) => b.time - a.time);
                if (files.length > 0) {
                    inputPath = files[0].path;
                }
            }
        } else if (!a.startsWith('-')) {
            if (!inputPath) inputPath = a;
            else if (!outputPath) outputPath = a;
        }
    }

    if (!inputPath) {
        // Recherche automatique d'un fichier vidéo/audio de test ou dans 10_Clients
        const candidateDirs = [CLIENTS_DIR, path.join(ROOT_DIR, '01_Assets', 'Voix_Off')];
        for (const dir of candidateDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir)
                    .filter(f => /\.(mp4|mov|mkv|webm|mp3|wav|m4a)$/i.test(f) && !f.includes('_cut'))
                    .map(f => path.join(dir, f));
                if (files.length > 0) {
                    inputPath = files[0];
                    break;
                }
            }
        }
    }

    if (!inputPath) {
        console.log(`Usage : node 07_Scripts/cut_silences.cjs <fichier_video_ou_audio> [sortie] [--noise -30dB] [--min-silence 0.35] [--padding 0.08]`);
        process.exit(1);
    }

    try {
        cutSilences(inputPath, { outputPath, noise, minSilence, padding });
    } catch (err) {
        console.error(`❌ Erreur:`, err.message);
        process.exit(1);
    }
}

module.exports = { cutSilences, detectSilences, computeSpeechSegments };

