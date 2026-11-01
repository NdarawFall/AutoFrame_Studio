/**
 * GENERATE_VOICE.CJS — Générateur de Voix Off Ultra-Réalistes
 * Moteur exclusif : ElevenLabs (API v1 - Text to Speech & Voix Personnalisées)
 * 
 * Usage CLI :
 *   node 05_Scripts/generate_voice.cjs --text "Bienvenue sur la chaîne" --out 01_Assets/Voix_Off/intro.mp3
 *   node 05_Scripts/generate_voice.cjs --list-voices
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
 * Récupère la liste des voix utilisables par l'API ElevenLabs :
 * 1. Les voix personnalisées / créées par l'utilisateur (cloned, generated)
 * 2. Les voix officielles par défaut (premade)
 * Note : les voix partagées/communauté (shared/community/professional) sont filtrées.
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

/**
 * Récupère le statut d'abonnement et les crédits restants ElevenLabs
 */
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

/**
 * Génération vocale ElevenLabs
 */
async function generateElevenLabs({ text, apiKey, voiceId, modelId, outputPath }) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY || loadConfig().elevenlabs_api_key;
    if (!key) {
        throw new Error("Clé API ElevenLabs manquante. Renseignez-la dans Paramètres ou via l'option --key / variable ELEVENLABS_API_KEY.");
    }

    const voice = voiceId || loadConfig().elevenlabs_voice_id || '21m00Tcm4TlvDq8ikWAM'; // Rachel (par défaut)
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

function ensureDirExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Fonction principale
async function generateVoice(options) {
    const text = options.text;
    if (!text || !text.trim()) {
        throw new Error("Veuillez fournir un texte à lire via l'option --text");
    }

    let defaultOut = path.join(ROOT_DIR, '01_Assets', 'Voix_Off', `voix_off_${Date.now()}.mp3`);
    let outputPath = options.out ? path.resolve(options.out) : defaultOut;

    return await generateElevenLabs({
        text,
        apiKey: options.key,
        voiceId: options.voice,
        modelId: options.model,
        outputPath
    });
}

// Mode CLI
if (require.main === module) {
    (async () => {
        try {
            const args = parseArgs();

            if (args['list-voices']) {
                console.log("🔍 Récupération des voix ElevenLabs...");
                const { customVoices, defaultVoices } = await fetchElevenLabsVoices(args.key);
                console.log(`\n✨ Mes Voix Créées (${customVoices.length}) :`);
                customVoices.forEach(v => console.log(`  - [${v.id}] ${v.name} (${v.category})`));
                console.log(`\n🎙️ Voix Par Défaut ElevenLabs (${defaultVoices.length}) :`);
                defaultVoices.forEach(v => console.log(`  - [${v.id}] ${v.name}`));
                return;
            }

            if (!args.text) {
                console.log(`
Usage :
  node 05_Scripts/generate_voice.cjs --text "Texte à générer" [--out <fichier.mp3>] [--key <cle>] [--voice <id>]
  node 05_Scripts/generate_voice.cjs --list-voices [--key <cle>]

Exemples :
  node 05_Scripts/generate_voice.cjs --text "Bonjour et bienvenue sur la chaîne" --out 01_Assets/Voix_Off/intro.mp3
  node 05_Scripts/generate_voice.cjs --list-voices
                `);
                return;
            }

            console.log(`🎙️ Génération de la voix off via ElevenLabs...`);
            const res = await generateVoice(args);
            console.log(`✅ Voix générée avec succès !`);
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
    fetchElevenLabsSubscription
};
