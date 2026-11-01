/**
 * 07_Scripts/coverr.cjs
 * Intégration officielle de l'API Coverr (https://coverr.co/)
 * Permet de rechercher et télécharger des vidéos de stock cinéma HD/4K & B-roll.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = process.env.VIBE_USER_DATA 
    ? path.join(process.env.VIBE_USER_DATA, 'api_config.json') 
    : path.join(ROOT_DIR, '07_Scripts', 'api_config.json');

/**
 * Récupère la clé API Coverr depuis api_config.json ou variable d'environnement
 */
function getCoverrApiKey() {
    if (process.env.COVERR_API_KEY) {
        return process.env.COVERR_API_KEY.trim();
    }
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            if (cfg.coverr_api_key) return cfg.coverr_api_key.trim();
        }
    } catch (e) {}
    return '';
}

/**
 * Teste la validité d'une clé API Coverr
 */
async function testCoverrKey(apiKey) {
    const key = (apiKey || getCoverrApiKey()).trim();
    if (!key) {
        return { valid: false, error: 'Aucune clé API Coverr fournie ou configurée.' };
    }

    try {
        const url = `https://api.coverr.co/videos?query=nature&page_size=1&urls=true`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VibeEditor/1.0'
            }
        });

        if (res.status === 401 || res.status === 403) {
            return { valid: false, error: 'Clé API Coverr invalide ou non autorisée (401/403).' };
        }

        if (!res.ok) {
            const txt = await res.text();
            return { valid: false, error: `Erreur API Coverr (${res.status}): ${txt}` };
        }

        const data = await res.json();
        return {
            valid: true,
            message: 'Connexion réussie à Coverr.co !',
            totalAvailable: data.total || (data.hits ? data.hits.length : 0)
        };
    } catch (err) {
        return { valid: false, error: `Erreur de connexion à Coverr: ${err.message}` };
    }
}

/**
 * Recherche des vidéos sur Coverr.co
 * @param {string} query - Mot-clé (ex: "business", "technology", "drone", "sunset")
 * @param {object} options - Options de pagination et de filtre
 */
async function searchCoverrVideos(query, options = {}) {
    const apiKey = (options.apiKey || getCoverrApiKey()).trim();
    if (!apiKey) {
        throw new Error('Clé API Coverr manquante. Configurez-la dans les Paramètres.');
    }

    const pageSize = options.pageSize || options.page_size || 15;
    const page = options.page || 0;
    const isVertical = options.isVertical !== undefined ? options.isVertical : (options.is_vertical !== undefined ? options.is_vertical : null);

    let apiUrl = `https://api.coverr.co/videos?query=${encodeURIComponent(query || 'popular')}&urls=true&page_size=${pageSize}&page=${page}`;
    if (isVertical !== null) {
        apiUrl += `&filter=is_vertical:${isVertical ? 'true' : 'false'}`;
    }

    const res = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VibeEditor/1.0'
        }
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Coverr API error (${res.status}): ${txt}`);
    }

    const data = await res.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];

    const videos = hits.map(hit => {
        const urls = hit.urls || {};
        const mp4Url = urls.mp4_download || urls.mp4 || urls.mp4_preview || '';
        const previewUrl = urls.mp4_preview || urls.mp4 || '';
        const isVert = !!hit.is_vertical;
        const aspect = hit.aspect_ratio || (isVert ? '9:16' : '16:9');

        return {
            id: hit.id,
            title: hit.title || 'Vidéo Coverr',
            description: hit.description || '',
            poster: hit.poster || hit.thumbnail || '',
            thumbnail: hit.thumbnail || hit.poster || '',
            duration: hit.duration || 0,
            aspect_ratio: aspect,
            is_vertical: isVert,
            tags: hit.tags || [],
            url_download: mp4Url,
            url_preview: previewUrl,
            source: 'coverr.co'
        };
    });

    return {
        query,
        page: data.page || page,
        pages: data.pages || 1,
        pageSize: data.page_size || pageSize,
        total: data.total || videos.length,
        videos
    };
}

/**
 * Télécharge une vidéo Coverr vers un fichier local
 */
async function downloadCoverrVideo(videoUrl, destinationPath) {
    if (!videoUrl) throw new Error('URL de vidéo manquante.');
    const targetDir = path.dirname(destinationPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const client = videoUrl.startsWith('https') ? https : http;
        const request = client.get(videoUrl, response => {
            // Suivre les redirections si nécessaire (301, 302, 307)
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return downloadCoverrVideo(response.headers.location, destinationPath).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                return reject(new Error(`Échec du téléchargement (${response.statusCode})`));
            }

            const fileStream = fs.createWriteStream(destinationPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve({ success: true, path: destinationPath });
            });

            fileStream.on('error', err => {
                fs.unlink(destinationPath, () => {});
                reject(err);
            });
        });

        request.on('error', err => {
            reject(err);
        });
    });
}

// Mode CLI
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        if (args.includes('--test')) {
            const key = args[args.indexOf('--test') + 1];
            console.log('Test de la clé API Coverr...');
            const result = await testCoverrKey(key);
            console.log(result);
            process.exit(result.valid ? 0 : 1);
        }

        if (args.includes('--search')) {
            const query = args[args.indexOf('--search') + 1] || 'nature';
            const isVertical = args.includes('--vertical');
            try {
                console.log(`Recherche Coverr pour : "${query}" (vertical: ${isVertical})`);
                const results = await searchCoverrVideos(query, { isVertical });
                console.log(`Trouvé ${results.total} vidéos (${results.videos.length} affichées) :`);
                results.videos.forEach(v => {
                    console.log(`- [${v.aspect_ratio}] ${v.title} (${v.duration}s) -> ${v.url_preview || v.url_download}`);
                });
            } catch (err) {
                console.error('Erreur:', err.message);
            }
        }
    })();
}

module.exports = {
    getCoverrApiKey,
    testCoverrKey,
    searchCoverrVideos,
    downloadCoverrVideo
};

