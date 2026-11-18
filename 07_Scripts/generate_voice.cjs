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

let _elevenVoicesCache = null;
let _elevenCacheKey = '';
let _elevenCacheTimestamp = 0;
const ELEVEN_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 heures de cache

const FALLBACK_ELEVEN_VOICES = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Calm & Natural)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3", labels: { accent: "american", gender: "female" } },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Confident)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/506e7ce7-b08a-4370-9008-db230f822656.mp3", labels: { accent: "american", gender: "female" } },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Soft & Gentle)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/09d3b690-3b1a-45c1-8409-d5885c39a341.mp3", labels: { accent: "american", gender: "female" } },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Narrative & Warm)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f8f0-0417-48f4-b425-4c6e99e235e7.mp3", labels: { accent: "american", gender: "male" } },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (Emotional & Dynamic)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d89be768-4504-4537-83eb-598d933e1467.mp3", labels: { accent: "american", gender: "female" } },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (Deep & Engaging)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3a384317-10c0-4e45-a79a-471249e0e3fb.mp3", labels: { accent: "american", gender: "male" } },
    { id: "VR6AewLTigWG4nxSOuka", name: "Arnold (Crisp & Authoritative)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4nxSOuka/6429f55e-a0e2-4549-b54c-5353841a156e.mp3", labels: { accent: "american", gender: "male" } },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Dominant & Pro)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/673417e2-4014-48e0-a937-29d3c52a0a54.mp3", labels: { accent: "american", gender: "male" } },
    { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam (Dynamic Storyteller)", category: "premade", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/20e33425-f761-4fa1-840a-9d2979203ee3.mp3", labels: { accent: "american", gender: "male" } }
];

async function fetchElevenLabsVoices(apiKey, forceRefresh = false) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY || loadConfig().elevenlabs_api_key;
    const now = Date.now();
    const cacheFile = path.join(__dirname, '.elevenlabs_voices_cache.json');

    // 1. Retour instantané depuis le cache (mémoire ou disque) si la clé n'a pas changé
    if (!forceRefresh && key) {
        if (_elevenVoicesCache && _elevenCacheKey === key && (now - _elevenCacheTimestamp < ELEVEN_CACHE_TTL)) {
            return _elevenVoicesCache;
        }
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cached.key === key && cached.data && (now - (cached.timestamp || 0) < ELEVEN_CACHE_TTL)) {
                    _elevenVoicesCache = cached.data;
                    _elevenCacheKey = key;
                    _elevenCacheTimestamp = cached.timestamp || now;
                    return _elevenVoicesCache;
                }
            } catch(e) {}
        }
    }

    if (!key) {
        return {
            success: true,
            customVoices: [],
            defaultVoices: FALLBACK_ELEVEN_VOICES,
            total: FALLBACK_ELEVEN_VOICES.length,
            isFallback: true,
            message: "Clé API ElevenLabs non renseignée dans Paramètres."
        };
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': key },
            signal: AbortSignal.timeout(3500)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
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

        const result = {
            success: true,
            customVoices,
            defaultVoices: defaultVoices.length > 0 ? defaultVoices : FALLBACK_ELEVEN_VOICES,
            total: customVoices.length + (defaultVoices.length || FALLBACK_ELEVEN_VOICES.length)
        };

        // Sauvegarde dans le cache persistant
        _elevenVoicesCache = result;
        _elevenCacheKey = key;
        _elevenCacheTimestamp = now;
        try {
            fs.writeFileSync(cacheFile, JSON.stringify({ key, timestamp: now, data: result }), 'utf8');
        } catch(e) {}

        return result;
    } catch(err) {
        // En cas de lenteur réseau ou timeout, vérifier si un cache disque existe
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cached.data) return cached.data;
            } catch(e) {}
        }
        // Sinon renvoyer la liste officielle de secours instantanément
        return {
            success: true,
            customVoices: [],
            defaultVoices: FALLBACK_ELEVEN_VOICES,
            total: FALLBACK_ELEVEN_VOICES.length,
            isFallback: true,
            error: err.message
        };
    }
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

const FALLBACK_HEYGEN_VOICES = [
    { id: 'b11a7dbb250f483eadad9fb253e7d313', name: 'Solange', language: 'French', gender: 'female', previewUrl: '' },
    { id: '1e457f920f2648719bc5a691bcdd5fb6', name: 'Claude', language: 'French', gender: 'male', previewUrl: '' },
    { id: '924cf04218eb4ebdaeb024cf4fcb8c34', name: 'Marion', language: 'French', gender: 'female', previewUrl: '' },
    { id: '09cba1bb538d40beaf0b98f2441a75c4', name: 'Wayne', language: 'English', gender: 'male', previewUrl: '' },
    { id: '83fa1432f7034c549beea0e599988db2', name: 'Amber', language: 'English', gender: 'female', previewUrl: '' }
];

let _heygenVoicesCache = null;
let _heygenCacheKey = null;
let _heygenCacheTimestamp = 0;
const HEYGEN_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 heures de cache

async function fetchHeyGenVoices(apiKey, forceRefresh = false) {
    const key = apiKey || process.env.HEYGEN_API_KEY || loadConfig().heygen_api_key;
    const now = Date.now();
    const cacheFile = path.join(__dirname, '.heygen_voices_cache.json');

    // Vérification du cache mémoire ou disque (pour éviter de re-télécharger à chaque requête)
    if (!forceRefresh) {
        if (_heygenVoicesCache && _heygenCacheKey === key && (now - _heygenCacheTimestamp < HEYGEN_CACHE_TTL)) {
            return _heygenVoicesCache;
        }
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cached.key === key && cached.data && (now - (cached.timestamp || 0) < HEYGEN_CACHE_TTL)) {
                    _heygenVoicesCache = cached.data;
                    _heygenCacheKey = key;
                    _heygenCacheTimestamp = cached.timestamp || now;
                    return _heygenVoicesCache;
                }
            } catch (e) {}
        }
    }

    if (!key) {
        const frVoices = FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'French');
        const enVoices = FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'English');
        return {
            success: true,
            voices: FALLBACK_HEYGEN_VOICES,
            frenchVoices: frVoices,
            englishVoices: enVoices,
            otherVoices: [],
            total: FALLBACK_HEYGEN_VOICES.length,
            isFallback: true,
            message: "Clé API HeyGen non renseignée dans Paramètres."
        };
    }

    try {
        const response = await fetch('https://api.heygen.com/v2/voices', {
            headers: { 'X-Api-Key': key },
            signal: AbortSignal.timeout(4000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawVoices = (data.data && data.data.voices) || [];

        const voices = rawVoices.map(v => ({
            id: v.voice_id,
            name: v.name,
            language: v.language || 'Autre',
            gender: v.gender || 'unknown',
            previewUrl: v.preview_audio || v.preview_audio_url || ''
        }));

        const frenchVoices = voices.filter(v => (v.language || '').toLowerCase().includes('french') || (v.language || '').toLowerCase().includes('français'));
        const englishVoices = voices.filter(v => (v.language || '').toLowerCase().includes('english') || (v.language || '').toLowerCase().includes('anglais'));
        const otherVoices = voices.filter(v => !frenchVoices.includes(v) && !englishVoices.includes(v));

        const result = {
            success: true,
            voices,
            frenchVoices: frenchVoices.length > 0 ? frenchVoices : FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'French'),
            englishVoices: englishVoices.length > 0 ? englishVoices : FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'English'),
            otherVoices,
            total: voices.length
        };

        _heygenVoicesCache = result;
        _heygenCacheKey = key;
        _heygenCacheTimestamp = now;
        try {
            fs.writeFileSync(cacheFile, JSON.stringify({ key, timestamp: now, data: result }), 'utf8');
        } catch (e) {}

        return result;
    } catch(err) {
        // En cas de lenteur réseau ou timeout, vérifier si un cache disque existe
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (cached.data) return cached.data;
            } catch(e) {}
        }
        const frVoices = FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'French');
        const enVoices = FALLBACK_HEYGEN_VOICES.filter(v => v.language === 'English');
        return {
            success: true,
            voices: FALLBACK_HEYGEN_VOICES,
            frenchVoices: frVoices,
            englishVoices: enVoices,
            otherVoices: [],
            total: FALLBACK_HEYGEN_VOICES.length,
            isFallback: true,
            error: err.message
        };
    }
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
