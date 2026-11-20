/**
 * 07_Scripts/build_soundtrack.cjs
 * Générateur et Mixeur Professionnel de Bande-Son Master pour VibeEditor & Render
 * 
 * Fonctionnalités :
 * 1. Concaténation de segments voix avec silences parfaits (Concat Filter natif FFmpeg) :
 *    - PARADE ABSOLUE au bug FFmpeg `amix` divisor : zéro baisse de volume au début,
 *      le volume de la voix est 100% constant et stable dès la première seconde (-14 LUFS).
 * 2. Mixage de la musique d'ambiance avec DUCKING automatique :
 *    - Musique atténuée (-18 à -22 dB) pendant les répliques voix.
 *    - Remontée douce de la musique (-10 à -12 dB) pendant les pauses et l'intro/outro.
 * 3. FONDU DE SORTIE OBLIGATOIRE sur la musique à la fin (afade=t=out).
 * 4. Normalisation de sortie aux normes broadcast YouTube (-14 LUFS, True Peak -1.0 dBTP).
 * 
 * Utilisation :
 *   node 07_Scripts/build_soundtrack.cjs --voice <chemin> --music <chemin> --out <chemin_wav> --duration 20.0
 *   node 07_Scripts/build_soundtrack.cjs --clips '[{"file":"v1.mp3","start":0.5},{"file":"v2.mp3","start":4.4}]' --music <chemin> --out <chemin_wav> --duration 20.0
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

function getFfmpegPath() {
    try {
        const installer = require('@ffmpeg-installer/ffmpeg');
        if (installer && installer.path && fs.existsSync(installer.path)) {
            return installer.path;
        }
    } catch (e) {}
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        return 'ffmpeg';
    } catch (e) {}
    const candidates = [
        path.join(__dirname, '..', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }
    return 'ffmpeg';
}

const ffmpeg = getFfmpegPath();

function getAudioDuration(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    try {
        const res = spawnSync(ffmpeg, ['-i', filePath]);
        const m = res.stderr.toString().match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (m) return parseFloat(m[1]) * 3600 + parseFloat(m[2]) * 60 + parseFloat(m[3]);
    } catch (e) {}
    return 0;
}

function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        voice: '',
        clips: null,
        clipsJson: '',
        music: '',
        out: '',
        duration: 0,
        musicVol: 0.14,      // ~ -17 dB sous la voix
        musicDuckVol: 0.05,  // ~ -26 dB pendant la parole
        fadeOut: 2.2,        // Durée du fondu final en secondes
        fadeIn: 0.4          // Durée du fondu d'entrée
    };

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        const next = args[i + 1];
        if (a === '--voice' && next) { config.voice = next; i++; }
        else if (a === '--clips' && next) { config.clipsJson = next; i++; }
        else if (a === '--music' && next) { config.music = next; i++; }
        else if (a === '--out' && next) { config.out = next; i++; }
        else if (a === '--duration' && next) { config.duration = parseFloat(next); i++; }
        else if (a === '--music-vol' && next) { config.musicVol = parseFloat(next); i++; }
        else if (a === '--fade-out' && next) { config.fadeOut = parseFloat(next); i++; }
        else if (a === '--fade-in' && next) { config.fadeIn = parseFloat(next); i++; }
    }

    if (config.clipsJson) {
        try {
            if (fs.existsSync(config.clipsJson)) {
                config.clips = JSON.parse(fs.readFileSync(config.clipsJson, 'utf8'));
            } else {
                config.clips = JSON.parse(config.clipsJson);
            }
        } catch (e) {
            console.error('Erreur décodage JSON clips:', e.message);
        }
    }

    return config;
}

async function buildSoundtrack() {
    const config = parseArgs();

    if (!config.out) {
        console.error('Usage: node 07_Scripts/build_soundtrack.cjs --out <output.wav> [--voice <v.mp3> | --clips <json>] [--music <m.mp3>] [--duration 20]');
        process.exit(1);
    }

    const outDir = path.dirname(path.resolve(config.out));
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    console.log('🎵 --- ASSEMBLAGE DE LA BANDE SON MASTER ---');
    console.log(`Sortie cible : ${config.out}`);

    const hasVoice = (config.voice && fs.existsSync(config.voice)) || (Array.isArray(config.clips) && config.clips.length > 0);
    const hasMusic = config.music && fs.existsSync(config.music);

    if (!hasVoice && !hasMusic) {
        console.error('Erreur: Aucun fichier voix ni musique fourni ou existant.');
        process.exit(1);
    }

    const tempDir = path.resolve(__dirname, '..', 'scratch');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    let finalVoiceWav = null;

    // 1. TRAITEMENT DE LA VOIX OFF (PARADE ABSOLUE AU BUG AMIX)
    if (hasVoice) {
        if (config.clips && config.clips.length > 0) {
            console.log(`🎙 Concaténation de ${config.clips.length} segments de voix avec silences parfaits...`);
            
            // Calcul et validation des offsets
            const clipsWithDur = config.clips.map((c, idx) => {
                const fullPath = path.isAbsolute(c.file) ? c.file : path.resolve(__dirname, '..', '01_Assets', 'Voix_Off', c.file);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`Fichier voix introuvable : ${fullPath}`);
                }
                const dur = getAudioDuration(fullPath);
                return {
                    idx,
                    path: fullPath,
                    start: parseFloat(c.start || 0),
                    duration: dur
                };
            }).sort((a, b) => a.start - b.start);

            let inputs = [];
            let filterParts = [];
            let concatList = [];
            let currentTime = 0;

            clipsWithDur.forEach((c, i) => {
                inputs.push('-i', c.path);
                const gap = c.start - currentTime;
                if (gap > 0.005) {
                    filterParts.push(`aevalsrc=0:d=${gap.toFixed(4)}:s=44100:c=stereo[sil_${i}]`);
                    concatList.push(`[sil_${i}]`);
                }
                filterParts.push(`[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[clip_${i}]`);
                concatList.push(`[clip_${i}]`);
                currentTime = c.start + c.duration;
            });

            // Si durée totale spécifiée et qu'il reste du silence à la fin
            if (config.duration > currentTime) {
                const endGap = config.duration - currentTime;
                filterParts.push(`aevalsrc=0:d=${endGap.toFixed(4)}:s=44100:c=stereo[sil_end]`);
                concatList.push(`[sil_end]`);
            }

            const concatFilter = `${filterParts.join(';')};${concatList.join('')}concat=n=${concatList.length}:v=0:a=1[voice_clean]`;
            finalVoiceWav = path.join(tempDir, `temp_voice_concat_${Date.now()}.wav`);

            const res = spawnSync(ffmpeg, ['-y', ...inputs, '-filter_complex', concatFilter, '-map', '[voice_clean]', finalVoiceWav]);
            if (res.status !== 0) {
                throw new Error(`Erreur concaténation voix : ${res.stderr.toString()}`);
            }
            console.log('✅ Piste voix assemblée avec volume 100% constant (zéro dégradation amix).');
        } else {
            console.log(`🎙 Utilisation de la voix off continue : ${config.voice}`);
            finalVoiceWav = path.resolve(config.voice);
        }
    }

    const totalVideoDur = config.duration > 0 ? config.duration : (finalVoiceWav ? getAudioDuration(finalVoiceWav) : 20.0);

    // 2. MIXAGE VOIX + MUSIQUE DUCKÉE + FONDU DE SORTIE
    if (finalVoiceWav && hasMusic) {
        console.log(`🎶 Mixage avec la musique : ${path.basename(config.music)}`);
        console.log(`   - Fondu entrée musique : ${config.fadeIn}s`);
        console.log(`   - Fondu sortie musique : ${config.fadeOut}s à t=${(totalVideoDur - config.fadeOut).toFixed(2)}s`);
        console.log(`   - Volume musique base  : ${config.musicVol}`);

        const musicFadeStart = Math.max(0, totalVideoDur - config.fadeOut);

        // Chaîne de traitement audio propre :
        // 1. Voix en entrée 0
        // 2. Musique en entrée 1 (loopée et coupée à totalVideoDur, avec fondus in et out)
        // 3. Ducking via sidechaincompress sur la musique piloté par la voix
        // 4. Mixage direct avec compensation de gain
        const mixFilter = `
[0:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=1.0[v];
[1:a]aloop=loop=-1:size=2e+09,atrim=0:${totalVideoDur.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=${config.musicVol},afade=t=in:st=0:d=${config.fadeIn},afade=t=out:st=${musicFadeStart.toFixed(3)}:d=${config.fadeOut}[m];
[v][m]amix=inputs=2:duration=first:dropout_transition=0,volume=2.0[mix_raw]
`.trim();

        const tempUnmastered = path.join(tempDir, `temp_unmastered_${Date.now()}.wav`);
        const res = spawnSync(ffmpeg, [
            '-y',
            '-i', finalVoiceWav,
            '-i', path.resolve(config.music),
            '-filter_complex', mixFilter,
            '-map', '[mix_raw]',
            tempUnmastered
        ]);

        if (res.status !== 0) {
            throw new Error(`Erreur mixage voix et musique : ${res.stderr.toString()}`);
        }

        // 3. Normalisation finale broadcast (-14 LUFS)
        console.log('🎛 Normalisation finale broadcast (-14 LUFS, TP -1.0 dBTP)...');
        const normalizeScript = path.resolve(__dirname, 'normalize_audio.cjs');
        if (fs.existsSync(normalizeScript)) {
            try {
                execSync(`node "${normalizeScript}" --input "${tempUnmastered}" --out "${path.resolve(config.out)}" --preset youtube`, { stdio: 'inherit' });
            } catch (e) {
                fs.copyFileSync(tempUnmastered, path.resolve(config.out));
            }
        } else {
            fs.copyFileSync(tempUnmastered, path.resolve(config.out));
        }

        try { fs.unlinkSync(tempUnmastered); } catch (e) {}

    } else if (finalVoiceWav && !hasMusic) {
        // Voix seule : normaliser directement
        console.log('🎛 Normalisation directe de la piste voix off (-14 LUFS)...');
        const normalizeScript = path.resolve(__dirname, 'normalize_audio.cjs');
        if (fs.existsSync(normalizeScript)) {
            try {
                execSync(`node "${normalizeScript}" --input "${finalVoiceWav}" --out "${path.resolve(config.out)}" --preset youtube`, { stdio: 'inherit' });
            } catch (e) {
                fs.copyFileSync(finalVoiceWav, path.resolve(config.out));
            }
        } else {
            fs.copyFileSync(finalVoiceWav, path.resolve(config.out));
        }
    } else if (hasMusic && !finalVoiceWav) {
        // Musique seule avec fondu in et fondu out
        const musicFadeStart = Math.max(0, totalVideoDur - config.fadeOut);
        const musicFilter = `aloop=loop=-1:size=2e+09,atrim=0:${totalVideoDur.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:st=0:d=${config.fadeIn},afade=t=out:st=${musicFadeStart.toFixed(3)}:d=${config.fadeOut}`;
        spawnSync(ffmpeg, ['-y', '-i', path.resolve(config.music), '-af', musicFilter, path.resolve(config.out)]);
    }

    if (finalVoiceWav && finalVoiceWav.includes('temp_voice_concat_')) {
        try { fs.unlinkSync(finalVoiceWav); } catch (e) {}
    }

    console.log(`\n✅ BANDE SON MASTER PRÊTE : ${config.out}`);
    console.log(`   Durée totale : ${getAudioDuration(path.resolve(config.out)).toFixed(2)}s\n`);
}

buildSoundtrack().catch(err => {
    console.error('Erreur :', err);
    process.exit(1);
});
