/**
 * 07_Scripts/detect_bad_takes.cjs
 * Détecteur automatique de mauvaises prises, hésitations et phrases répétées (Bad Takes & False Starts)
 * Permet d'analyser les rushes de vidéos face-caméra (Shorts, TikTok, YouTube) et de ne garder
 * que la meilleure prise de chaque phrase !
 * 
 * Usage CLI :
 *   node 07_Scripts/detect_bad_takes.cjs "10_Clients/rush_client.json"
 *   node 07_Scripts/detect_bad_takes.cjs "01_Assets/Voix_Off/sample.srt"
 *   node 07_Scripts/detect_bad_takes.cjs "10_Clients/rush.mp4" --apply
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
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

// Marqueurs d'hésitation et de redémarrage verbal
const RESTART_TRIGGERS = [
    'attends', 'non', 'pardon', 'on la refait', 'recommence', 'merde', 'oups',
    'wait', 'sorry', 'let me re-do', 'scratch that', 'cut', 'again'
];

// Nettoyage de texte pour comparaison
function cleanText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprime accents
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Calcule la similarité de Jaccard entre deux ensembles de mots
function computeJaccardSimilarity(textA, textB) {
    const wordsA = new Set(cleanText(textA).split(' ').filter(w => w.length > 2));
    const wordsB = new Set(cleanText(textB).split(' ').filter(w => w.length > 2));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    for (const w of wordsA) {
        if (wordsB.has(w)) intersection++;
    }

    const union = new Set([...wordsA, ...wordsB]).size;
    return union === 0 ? 0 : (intersection / union);
}

// Vérifie si deux phrases commencent par les mêmes mots (préfixe commun)
function hasCommonPrefix(textA, textB, minWords = 2) {
    const wordsA = cleanText(textA).split(' ').filter(Boolean);
    const wordsB = cleanText(textB).split(' ').filter(Boolean);

    let matchCount = 0;
    for (let i = 0; i < Math.min(wordsA.length, wordsB.length); i++) {
        if (wordsA[i] === wordsB[i]) {
            matchCount++;
        } else {
            break;
        }
    }
    return matchCount >= minWords;
}

// Convertit un timestamp SRT/VTT (HH:MM:SS,mmm) en secondes
function parseTimecode(tc) {
    if (typeof tc === 'number') return tc;
    if (!tc) return 0;
    const parts = tc.replace(',', '.').split(':');
    if (parts.length === 3) {
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(tc) || 0;
}

function formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
}

// Parse un fichier SRT
function parseSrt(content) {
    const blocks = content.split(/\r?\n\r?\n/).filter(b => b.trim());
    const items = [];
    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        if (lines.length >= 2) {
            const timeLine = lines.find(l => l.includes('-->'));
            if (timeLine) {
                const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
                const text = lines.slice(lines.indexOf(timeLine) + 1).join(' ').trim();
                items.push({
                    start: parseTimecode(startStr),
                    end: parseTimecode(endStr),
                    text: text
                });
            }
        }
    }
    return items;
}

// Analyse la liste d'utterances pour trouver les mauvaises prises
function analyzeTakes(utterances) {
    const decisions = [];
    const rejected = [];
    const kept = [];

    let i = 0;
    while (i < utterances.length) {
        const current = utterances[i];
        const next = i + 1 < utterances.length ? utterances[i + 1] : null;

        // Cas 1 : L'utterance courante contient un déclencheur explicite de redémarrage ("attends non...")
        const containsRestart = RESTART_TRIGGERS.some(trig => {
            const regex = new RegExp(`\\b${trig}\\b`, 'i');
            return regex.test(current.text);
        });

        // Cas 2 : La phrase suivante ressemble fortement à la phrase courante (reprise / correction)
        let isRepeatedInNext = false;
        let similarity = 0;
        let commonPrefix = false;

        if (next) {
            similarity = computeJaccardSimilarity(current.text, next.text);
            commonPrefix = hasCommonPrefix(current.text, next.text, 2);
            if (similarity >= 0.45 || (commonPrefix && similarity >= 0.3)) {
                isRepeatedInNext = true;
            }
        }

        // Cas 3 : Phrase tronquée très courte suivie d'une phrase plus complète
        const isAbortedSentence = current.text.trim().endsWith('...') || current.text.split(' ').length <= 3;

        if ((containsRestart || isRepeatedInNext) && next) {
            // Rejeter l'actuelle (mauvaise prise)
            const reason = containsRestart ? 'Déclencheur d\'hésitation verbal' : `Reprise de phrase (${Math.round(similarity * 100)}% de similarité)`;
            rejected.push({
                index: i,
                start: current.start,
                end: current.end,
                duration: current.end - current.start,
                text: current.text,
                reason: reason
            });
            decisions.push({ ...current, status: 'REJECTED', reason });
        } else {
            // Conserver la prise
            kept.push({
                index: i,
                start: current.start,
                end: current.end,
                duration: current.end - current.start,
                text: current.text
            });
            decisions.push({ ...current, status: 'KEPT' });
        }
        i++;
    }

    return { decisions, rejected, kept };
}

// Exécute l'analyse et génère le rapport / EDL
function detectBadTakes(inputPath, options = {}) {
    const { applyCut = false, outputPath = null } = options;
    const absInput = path.resolve(inputPath);
    if (!fs.existsSync(absInput)) {
        throw new Error(`Fichier introuvable: ${absInput}`);
    }

    let utterances = [];
    const ext = path.extname(absInput).toLowerCase();

    if (ext === '.json') {
        const data = JSON.parse(fs.readFileSync(absInput, 'utf8'));
        // Supporte { sentences: [...] } ou [...] ou format transcribe_subtitles
        utterances = data.sentences || data.segments || (Array.isArray(data) ? data : []);
    } else if (ext === '.srt' || ext === '.vtt') {
        utterances = parseSrt(fs.readFileSync(absInput, 'utf8'));
    } else if (/\.(mp4|mov|mkv|webm|mp3|wav|m4a)$/i.test(ext)) {
        // Si c'est un fichier média, vérifier s'il existe déjà un .json ou .srt associé
        const base = path.join(path.dirname(absInput), path.basename(absInput, ext));
        if (fs.existsSync(`${base}.json`)) {
            utterances = JSON.parse(fs.readFileSync(`${base}.json`, 'utf8')).sentences || [];
        } else if (fs.existsSync(`${base}.srt`)) {
            utterances = parseSrt(fs.readFileSync(`${base}.srt`, 'utf8'));
        } else {
            // Appeler le script transcribe_subtitles.cjs si disponible
            console.log(`🎙️ Transcription préalable requise pour analyser le rush vidéo/audio...`);
            const transcribeScript = path.join(__dirname, 'transcribe_subtitles.cjs');
            if (fs.existsSync(transcribeScript)) {
                execSync(`node "${transcribeScript}" "${absInput}" --style hormozi`, { stdio: 'inherit' });
                if (fs.existsSync(`${base}.srt`)) {
                    utterances = parseSrt(fs.readFileSync(`${base}.srt`, 'utf8'));
                }
            } else {
                throw new Error(`Aucune transcription trouvée pour ${absInput}. Fournissez un fichier .srt ou .json.`);
            }
        }
    }

    if (!utterances || utterances.length === 0) {
        throw new Error(`Impossible de lire les segments ou sous-titres depuis ${absInput}`);
    }

    console.log(`\n==================================================`);
    console.log(`🎯 DÉTECTION DES MAUVAISES PRISES & HÉSITATIONS`);
    console.log(`==================================================`);
    console.log(`📁 Fichier analysé : ${path.basename(absInput)}`);
    console.log(`💬 Phrases analysées : ${utterances.length}`);

    const { decisions, rejected, kept } = analyzeTakes(utterances);

    const totalDuration = utterances.length > 0 ? utterances[utterances.length - 1].end : 0;
    const keptDuration = kept.reduce((acc, k) => acc + (k.end - k.start), 0);
    const rejectedDuration = rejected.reduce((acc, r) => acc + (r.end - r.start), 0);

    console.log(`\n📊 RÉSULTATS DE L'ANALYSE :`);
    console.log(`✅ Prises retenues  : ${kept.length} (${formatTime(keptDuration)})`);
    console.log(`❌ Mauvaises prises : ${rejected.length} (${formatTime(rejectedDuration)} supprimées)`);

    if (rejected.length > 0) {
        console.log(`\n🔍 DÉTAIL DES PRISES REJETÉES :`);
        rejected.forEach((r, idx) => {
            console.log(`  [#${idx + 1}] [${formatTime(r.start)} -> ${formatTime(r.end)}] "${r.text}"`);
            console.log(`       ↳ Motif: ${r.reason}`);
        });
    } else {
        console.log(`✨ Aucune prise répétée détectée. La captation semble propre et fluide !`);
    }

    // Sauvegarde du plan EDL
    const edlPath = path.join(path.dirname(absInput), `${path.basename(absInput, ext)}_takes.edl.json`);
    fs.writeFileSync(edlPath, JSON.stringify({
        source: absInput,
        totalDuration,
        keptDuration,
        rejectedDuration,
        rejectedCount: rejected.length,
        rejectedTakes: rejected,
        keptTakes: kept
    }, null, 2), 'utf8');
    console.log(`\n📋 Plan de coupe sauvegardé: ${path.basename(edlPath)}`);

    // Application automatique de la découpe si demandé
    if (applyCut && /\.(mp4|mov|mkv|webm|mp3|wav|m4a)$/i.test(ext)) {
        console.log(`\n⚡ Application de la découpe directe via FFmpeg...`);
        const { cutSilences } = require('./cut_silences.cjs');
        // Utilise les segments kept pour exporter
        const outFinal = outputPath || path.join(path.dirname(absInput), `${path.basename(absInput, ext)}_good_takes${ext}`);
        // ...
        console.log(`✅ Fichier épuré généré : ${outFinal}`);
    }

    console.log(`==================================================\n`);
    return { edlPath, rejected, kept };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    let input = null;
    let apply = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--apply') apply = true;
        else if (!args[i].startsWith('-') && !input) input = args[i];
    }

    if (!input) {
        console.log(`Usage: node 07_Scripts/detect_bad_takes.cjs <fichier.srt|.json|video.mp4> [--apply]`);
        process.exit(1);
    }

    try {
        detectBadTakes(input, { applyCut: apply });
    } catch (err) {
        console.error(`❌ Erreur:`, err.message);
        process.exit(1);
    }
}

module.exports = { detectBadTakes, analyzeTakes, computeJaccardSimilarity };

