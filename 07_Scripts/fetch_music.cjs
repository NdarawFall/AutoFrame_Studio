/**
 * 07_Scripts/fetch_music.cjs
 * Téléchargeur de musiques d'ambiance 100% libres de droit et gratuites (Incompetech / Kevin MacLeod / CC-BY)
 * Permet d'alimenter automatiquement 01_Assets/Musiques/ selon l'émotion ou le genre de la vidéo !
 * 
 * Genres / Moods supportés :
 *   - 'tech' / 'saas'       : Pistes modernes, synthétiques, épurées pour produits & tutos
 *   - 'suspense' / 'tension': Documentaire, storytelling captivant, révélations
 *   - 'dynamic' / 'sports'  : Énergie, percussions, tempo élevé pour shorts & top 10 foot
 *   - 'chill' / 'lofi'      : Ambiance détendue, fond sonore discret
 *   - 'funny' / 'meme'      : Vidéos courtes virales, humour, situations décalées
 * 
 * Usage CLI :
 *   node 07_Scripts/fetch_music.cjs --mood tech
 *   node 07_Scripts/fetch_music.cjs --mood sports
 *   node 07_Scripts/fetch_music.cjs "Sneaky Snitch"
 *   node 07_Scripts/fetch_music.cjs --list
 * 
 * Usage programmatique :
 *   const { fetchMusic, listCatalog } = require('./fetch_music.cjs');
 *   const track = await fetchMusic({ mood: 'tech' });
 *   console.log(track.localPath); // "01_Assets/Musiques/tech_ambiance.mp3"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const MUSIC_DIR = path.join(ROOT_DIR, '01_Assets', 'Musiques');

if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

// Catalogue curaté de pistes cultes libres de droit Incompetech (Kevin MacLeod)
const CATALOG = [
    // --- TECH / SAAS / FUTURISTIC ---
    {
        id: 'tech_modern',
        title: 'Modern Jazz Samba',
        artist: 'Kevin MacLeod',
        genre: 'tech',
        mood: 'chill',
        bpm: 110,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Modern%20Jazz%20Samba.mp3'
    },
    {
        id: 'tech_wallpaper',
        title: 'Wallpaper',
        artist: 'Kevin MacLeod',
        genre: 'tech',
        mood: 'corporate',
        bpm: 120,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3'
    },
    {
        id: 'tech_take_a_chance',
        title: 'Take a Chance',
        artist: 'Kevin MacLeod',
        genre: 'tech',
        mood: 'dynamic',
        bpm: 125,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Take%20a%20Chance.mp3'
    },

    // --- SUSPENSE / TENSION / STORYTELLING ---
    {
        id: 'suspense_hitman',
        title: 'Hitman',
        artist: 'Kevin MacLeod',
        genre: 'suspense',
        mood: 'tension',
        bpm: 90,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hitman.mp3'
    },
    {
        id: 'suspense_scheming_weasel',
        title: 'Scheming Weasel',
        artist: 'Kevin MacLeod',
        genre: 'suspense',
        mood: 'curious',
        bpm: 115,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel%20faster.mp3'
    },
    {
        id: 'suspense_sneaky_snitch',
        title: 'Sneaky Snitch',
        artist: 'Kevin MacLeod',
        genre: 'suspense',
        mood: 'mischief',
        bpm: 105,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3'
    },

    // --- DYNAMIC / SPORTS / ACTION (Top 10 Foot, Reels rythmés) ---
    {
        id: 'sports_volatile_reaction',
        title: 'Volatile Reaction',
        artist: 'Kevin MacLeod',
        genre: 'sports',
        mood: 'dynamic',
        bpm: 130,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Volatile%20Reaction.mp3'
    },
    {
        id: 'sports_the_builder',
        title: 'The Builder',
        artist: 'Kevin MacLeod',
        genre: 'sports',
        mood: 'upbeat',
        bpm: 120,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Builder.mp3'
    },

    // --- CHILL / EXPLAINER / LOFI ---
    {
        id: 'chill_carefree',
        title: 'Carefree',
        artist: 'Kevin MacLeod',
        genre: 'chill',
        mood: 'positive',
        bpm: 100,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3'
    },
    {
        id: 'chill_airport_lounge',
        title: 'Airport Lounge',
        artist: 'Kevin MacLeod',
        genre: 'chill',
        mood: 'relax',
        bpm: 95,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Airport%20Lounge.mp3'
    },
    {
        id: 'chill_local_forecast',
        title: 'Local Forecast',
        artist: 'Kevin MacLeod',
        genre: 'chill',
        mood: 'neutral',
        bpm: 105,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Local%20Forecast.mp3'
    },

    // --- FUNNY / CARTOON / MEME ---
    {
        id: 'funny_monkeys_spinning',
        title: 'Monkeys Spinning Monkeys',
        artist: 'Kevin MacLeod',
        genre: 'funny',
        mood: 'playful',
        bpm: 110,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3'
    },
    {
        id: 'funny_fluffing_duck',
        title: 'Fluffing a Duck',
        artist: 'Kevin MacLeod',
        genre: 'funny',
        mood: 'clumsy',
        bpm: 120,
        license: 'CC-BY 4.0 (Incompetech)',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fluffing%20a%20Duck.mp3'
    }
];

// Télécharge un fichier binaire avec gestion des redirections
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(destPath);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                try { fs.unlinkSync(destPath); } catch (e) {}
                return reject(new Error(`HTTP ${res.statusCode} lors du téléchargement de ${url}`));
            }
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close(() => resolve(destPath));
            });
        }).on('error', (err) => {
            fileStream.close();
            try { fs.unlinkSync(destPath); } catch (e) {}
            reject(err);
        });
    });
}

// Recherche une piste dans le catalogue
function findTrack(queryOrFilter) {
    if (typeof queryOrFilter === 'string') {
        const q = queryOrFilter.toLowerCase().trim();
        return CATALOG.find(t => 
            t.id.toLowerCase() === q ||
            t.title.toLowerCase().includes(q) ||
            t.genre.toLowerCase() === q ||
            t.mood.toLowerCase() === q
        );
    }

    const { genre, mood, title } = queryOrFilter || {};
    if (title) {
        const q = title.toLowerCase();
        return CATALOG.find(t => t.title.toLowerCase().includes(q));
    }
    if (genre) {
        const g = genre.toLowerCase();
        return CATALOG.find(t => t.genre === g) || CATALOG.find(t => t.mood === g);
    }
    if (mood) {
        const m = mood.toLowerCase();
        return CATALOG.find(t => t.mood === m) || CATALOG.find(t => t.genre === m);
    }
    return CATALOG[0];
}

// Télécharge la musique demandée
async function fetchMusic(queryOrOptions = {}, options = {}) {
    let filter = queryOrOptions;
    let opts = options;

    if (typeof queryOrOptions === 'string') {
        filter = queryOrOptions;
    }

    const track = findTrack(filter);
    if (!track) {
        throw new Error(`Aucune piste musicale trouvée pour "${JSON.stringify(filter)}"`);
    }

    const safeTitle = track.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeTitle}.mp3`;
    const destPath = path.join(MUSIC_DIR, fileName);
    const relPath = path.relative(ROOT_DIR, destPath).replace(/\\/g, '/');

    let fromCache = false;

    if (fs.existsSync(destPath) && !opts.force) {
        const stat = fs.statSync(destPath);
        if (stat.size > 10000) {
            fromCache = true;
        }
    }

    if (!fromCache) {
        await downloadFile(track.url, destPath);
    }

    const stat = fs.statSync(destPath);

    return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        mood: track.mood,
        bpm: track.bpm,
        license: track.license,
        localPath: destPath,
        relPath,
        fromCache,
        size: stat.size
    };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    let mood = null;
    let genre = null;
    let list = false;
    let query = null;
    let force = false;

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--mood' || a === '-m') {
            mood = args[++i];
        } else if (a === '--genre' || a === '-g') {
            genre = args[++i];
        } else if (a === '--list' || a === '-l') {
            list = true;
        } else if (a === '--force' || a === '-f') {
            force = true;
        } else if (!a.startsWith('-')) {
            query = a;
        }
    }

    if (list) {
        console.log(`\n🎵 CATALOGUE DE MUSIQUES LIBRES DE DROIT (INCOMPETECH / CC-BY) :`);
        console.log(`==================================================================`);
        CATALOG.forEach((t, idx) => {
            console.log(`  ${idx + 1}. "${t.title}" — Genre: ${t.genre} | Mood: ${t.mood} | BPM: ${t.bpm}`);
        });
        console.log(`==================================================================\n`);
        process.exit(0);
    }

    (async () => {
        try {
            console.log(`\n==================================================`);
            console.log(`🎵 TÉLÉCHARGEMENT DE MUSIQUE LIBRE DE DROIT`);
            console.log(`==================================================`);

            const target = query || { mood: mood || genre || 'tech' };
            process.stdout.write(`⏳ Téléchargement de la piste... `);

            const res = await fetchMusic(target, { force });
            console.log(`✅ [${res.fromCache ? 'CACHE' : 'TÉLÉCHARGÉ'}]`);
            console.log(`   🎼 Titre   : ${res.title} par ${res.artist}`);
            console.log(`   🏷️  Genre   : ${res.genre.toUpperCase()} | Ambiance: ${res.mood}`);
            console.log(`   📁 Fichier : ${res.relPath} (${Math.round(res.size / 1024)} Ko)`);
            console.log(`   ⚖️  Licence : ${res.license}`);
            console.log(`==================================================\n`);
        } catch (e) {
            console.error(`❌ Erreur:`, e.message);
            process.exit(1);
        }
    })();
}

module.exports = { fetchMusic, findTrack, listCatalog: () => CATALOG, MUSIC_DIR };

