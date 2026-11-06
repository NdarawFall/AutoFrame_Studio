/**
 * GENERATE_VOICE.CJS — Générateur de Voix Off Ultra-Réalistes
 * Moteurs supportés : ElevenLabs & HeyGen (Voice Turbo API)
 * 
 * Usage CLI :
 *   node 07_Scripts/generate_voice.cjs --text "Bienvenue" --engine heygen --out 01_Assets/Voix_Off/intro.wav
 *   node 07_Scripts/generate_voice.cjs --text "Bienvenue" --engine elevenlabs --out 01_Assets/Voix_Off/intro.mp3
 *   node 07_Scripts/generate_voice.cjs --list-voices [--engine heygen|elevenlabs]
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = process.env.VIBE_USER_DATA 
    ? path.join(process.env.VIBE_USER_DATA, 'api_config.json') 
    : path.join(__dirname, 'api_config.json');

// Lecture de la configuration sauvegardée
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        }
    } catch (e) {
        // silence
    }
    return {};
}

// Parse des arguments CLI simples (--key value)
function parseArgs() {
    const args = process.argv.slice(2);
    const params = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
            params[key] = val;
            if (val !== true) i++;
        }
    }
    return params;
}

/**
 * ==========================================
 * ELEVENLABS API
 * ==========================================
 */

async function fetchElevenLabsVoices(apiKey) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY || loadConfig().elevenlabs_api_key;
    if (!key) {
        throw new Error("Clé API ElevenLabs manquante. Renseignez-la dans Paramètres.");
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': key }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ElevenLabs [${response.status}] : ${errorText}`);
    }

    const data = await response.json();
    const all = data.voices || [];

    const excludedNames = ['ibrahima', 'khady'];

    const customVoices = all
        .filter(v => ['cloned', 'generated', 'custom'].includes(v.category))
        .filter(v => {
            const nameLower = (v.name || '').toLowerCase();
            return !excludedNames.some(ex => nameLower.includes(ex));
        })
        .map(v => ({
            id: v.voice_id,
            name: v.name,
            category: v.category,
            previewUrl: v.preview_url || '',
            labels: v.labels || {}
        }));

    const defaultVoices = all
        .filter(v => v.category === 'premade')
        .map(v => ({
            id: v.voice_id,
            name: v.name,
            category: v.category,
            previewUrl: v.preview_url || '',
            labels: v.labels || {}
        }));

    return {
        success: true,
        customVoices,
        defaultVoices,
        total: customVoices.length + defaultVoices.length
    };
}

async function fetchElevenLabsSubscription(apiKey) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY || loadConfig().elevenlabs_api_key;
    if (!key) {
        throw new Error("Clé API ElevenLabs manquante.");
    }

    const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
        headers: { 'xi-api-key': key }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ElevenLabs Subscription [${response.status}] : ${errorText}`);
    }

    const sub = await response.json();
    const characterCount = sub.character_count || 0;
    const characterLimit = sub.character_limit || 0;
    const remaining = Math.max(0, characterLimit - characterCount);
    const percentUsed = characterLimit > 0 ? Math.round((characterCount / characterLimit) * 100) : 0;

    return {
        success: true,
        tier: sub.tier || 'free',
        characterCount,
        characterLimit,
        remainingCharacters: remaining,
        percentRemaining: 100 - percentUsed,
        percentUsed,
        status: sub.status || 'active',
        nextResetUnix: sub.next_character_count_reset_unix || null
    };
}

async function generateElevenLabs({ text, apiKey, voiceId, modelId, outputPath }) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY || loadConfig().elevenlabs_api_key;
    if (!key) {
        throw new Error("Clé API ElevenLabs manquante. Renseignez-la dans Paramètres.");
    }

    const voice = voiceId || loadConfig().elevenlabs_voice_id || '21m00Tcm4TlvDq8ikWAM';
    const model = modelId || loadConfig().elevenlabs_model_id || 'eleven_multilingual_v2';

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': key
        },
        body: JSON.stringify({
            text: text,
            model_id: model,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ElevenLabs [${response.status}] : ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    ensureDirExists(outputPath);
    fs.writeFileSync(outputPath, buffer);

    return {
        success: true,
        engine: 'elevenlabs',
        voice,
        model,
        outputPath,
        sizeBytes: buffer.length
    };
}

/**
 * ==========================================
 * HEYGEN API (VOICE TURBO)
 * ==========================================
 */

let _heygenVoicesCache = null;
let _heygenCacheTimestamp = 0;
const HEYGEN_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 heures de cache

async function fetchHeyGenVoices(apiKey, forceRefresh = false) {
    const key = apiKey || process.env.HEYGEN_API_KEY || loadConfig().heygen_api_key;
    if (!key) {
        throw new Error("Clé API HeyGen manquante. Renseignez-la dans Paramètres.");
    }

    const now = Date.now();
    const cacheFile = path.join(__dirname, '.heygen_voices_cache.json');

    // Vérification du cache mémoire ou disque (pour éviter de re-télécharger 3000 voix à chaque requête)
    if (!forceRefresh) {
        if (_heygenVoicesCache && (now - _heygenCacheTimestamp < HEYGEN_CACHE_TTL)) {
            return _heygenVoicesCache;
        }
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cached.timestamp && (now - cached.timestamp < HEYGEN_CACHE_TTL) && cached.data) {
                    _heygenVoicesCache = cached.data;
                    _heygenCacheTimestamp = cached.timestamp;
                    return _heygenVoicesCache;
                }
            } catch (e) {}
        }
    }

    const response = await fetch('https://api.heygen.com/v2/voices', {
        headers: { 'X-Api-Key': key }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HeyGen [${response.status}] : ${errorText}`);
    }

    const data = await response.json();
    const rawVoices = (data.data && data.data.voices) || [];

    const voices = rawVoices.map(v => ({
        id: v.voice_id,
        name: v.name,
        language: v.language || 'Autre',
        gender: v.gender || 'unknown',
        previewUrl: v.preview_audio || ''
    }));

    const frenchVoices = voices.filter(v => (v.language || '').toLowerCase().includes('french') || (v.language || '').toLowerCase().includes('français'));
    const englishVoices = voices.filter(v => (v.language || '').toLowerCase().includes('english') || (v.language || '').toLowerCase().includes('anglais'));
    const otherVoices = voices.filter(v => !frenchVoices.includes(v) && !englishVoices.includes(v));

    const result = {
        success: true,
        voices,
        frenchVoices,
        englishVoices,
        otherVoices,
        total: voices.length
    };

    _heygenVoicesCache = result;
    _heygenCacheTimestamp = now;
    try {
        fs.writeFileSync(cacheFile, JSON.stringify({ timestamp: now, data: result }), 'utf8');
    } catch (e) {}

    return result;
}

async function generateHeyGen({ text, apiKey, voiceId, model, outputPath }) {
    const key = apiKey || process.env.HEYGEN_API_KEY || loadConfig().heygen_api_key;
    if (!key) {
        throw new Error("Clé API HeyGen manquante. Renseignez-la dans Paramètres.");
    }

    const selectedVoice = voiceId || loadConfig().heygen_voice_id || 'b11a7dbb250f483eadad9fb253e7d313'; // Solange (FR) par défaut
    const selectedModel = model || loadConfig().heygen_model_id || 'heygen-voice-1-turbo-free';

    const response = await fetch('https://api.heygen.com/v3/models/audio/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key
        },
        body: JSON.stringify({
            model: selectedModel,
            voice_id: selectedVoice,
            text: text
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HeyGen [${response.status}] : ${errorText}`);
    }

    const data = await response.json();
    const audioUrl = data.data && data.data.audio_url;
    if (!audioUrl) {
        throw new Error("Réponse HeyGen invalide : URL audio non reçue.");
    }

    // Télécharger le fichier audio résultant
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
        throw new Error(`Échec du téléchargement de l'audio généré par HeyGen (${audioRes.status})`);
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    ensureDirExists(outputPath);
    fs.writeFileSync(outputPath, buffer);

    return {
        success: true,
        engine: 'heygen',
        voice: selectedVoice,
        model: selectedModel,
        outputPath,
        duration: data.data.duration || null,
        sizeBytes: buffer.length
    };
}

function ensureDirExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Fonction principale universelle
async function generateVoice(options) {
    const text = options.text;
    if (!text || !text.trim()) {
        throw new Error("Veuillez fournir un texte à lire via l'option --text");
    }

    const cfg = loadConfig();
    const engine = (options.engine || cfg.tts_engine || 'elevenlabs').toLowerCase();

    let ext = engine === 'heygen' ? 'wav' : 'mp3';
    let defaultOut = path.join(ROOT_DIR, '01_Assets', 'Voix_Off', `voix_off_${Date.now()}.${ext}`);
    let outputPath = options.out ? path.resolve(options.out) : defaultOut;

    if (engine === 'heygen') {
        return await generateHeyGen({
            text,
            apiKey: options.key,
            voiceId: options.voice,
            model: options.model,
            outputPath
        });
    } else {
        return await generateElevenLabs({
            text,
            apiKey: options.key,
            voiceId: options.voice,
            modelId: options.model,
            outputPath
        });
    }
}

// Mode CLI
if (require.main === module) {
    (async () => {
        try {
            const args = parseArgs();
            const engine = (args.engine || 'elevenlabs').toLowerCase();

            if (args['list-voices']) {
                if (engine === 'heygen') {
                    console.log("🔍 Récupération des voix HeyGen...");
                    const res = await fetchHeyGenVoices(args.key);
                    console.log(`\n✨ Voix Françaises (${res.frenchVoices.length}) :`);
                    res.frenchVoices.forEach(v => console.log(`  - [${v.id}] ${v.name} (${v.gender})`));
                    console.log(`\nTotal voix disponibles : ${res.total}`);
                } else {
                    console.log("🔍 Récupération des voix ElevenLabs...");
                    const { customVoices, defaultVoices } = await fetchElevenLabsVoices(args.key);
                    console.log(`\n✨ Mes Voix Créées (${customVoices.length}) :`);
                    customVoices.forEach(v => console.log(`  - [${v.id}] ${v.name} (${v.category})`));
                    console.log(`\n🎙️ Voix Par Défaut ElevenLabs (${defaultVoices.length}) :`);
                    defaultVoices.forEach(v => console.log(`  - [${v.id}] ${v.name}`));
                }
                return;
            }

            if (!args.text) {
                console.log(`
Usage :
  node 07_Scripts/generate_voice.cjs --text "Texte à générer" [--engine heygen|elevenlabs] [--out <fichier>] [--key <cle>] [--voice <id>]
  node 07_Scripts/generate_voice.cjs --list-voices [--engine heygen|elevenlabs] [--key <cle>]
                `);
                return;
            }

            console.log(`🎙️ Génération de la voix off via ${engine.toUpperCase()}...`);
            const res = await generateVoice(args);
            console.log(`✅ Voix générée avec succès !`);
            console.log(`   Moteur  : ${res.engine}`);
            console.log(`   Fichier : ${res.outputPath}`);
            console.log(`   Taille  : ${Math.round(res.sizeBytes / 1024)} Ko`);
        } catch (err) {
            console.error(`❌ Erreur : ${err.message}`);
            process.exit(1);
        }
    })();
}

module.exports = {
    generateVoice,
    generateElevenLabs,
    fetchElevenLabsVoices,
    fetchElevenLabsSubscription,
    generateHeyGen,
    fetchHeyGenVoices
};
