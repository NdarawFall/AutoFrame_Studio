/**
 * 07_Scripts/fetch_flag.cjs
 * Téléchargeur de drapeaux nationaux et territoriaux haute résolution (SVG vectoriel & PNG)
 * 100% GRATUIT, ILLIMITÉ et SANS CLÉ D'API (Source: FlagCDN / ISO 3166-1)
 * 
 * Usage CLI :
 *   node 07_Scripts/fetch_flag.cjs France
 *   node 07_Scripts/fetch_flag.cjs "Etats-Unis" Japon Allemagne Brésil
 *   node 07_Scripts/fetch_flag.cjs --code fr
 * 
 * Usage programmatique :
 *   const { fetchFlag } = require('./fetch_flag.cjs');
 *   const res = await fetchFlag('France');
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const FLAGS_DIR = path.join(ROOT_DIR, '01_Assets', 'Flags');

// Dictionnaire bilingue étendu (Français / Anglais / Abréviations) -> Code ISO alpha-2
const COUNTRY_CODES = {
    // Europe
    'france': 'fr', 'french': 'fr', 'fr': 'fr',
    'allemagne': 'de', 'germany': 'de', 'de': 'de', 'deutschland': 'de',
    'italie': 'it', 'italy': 'it', 'it': 'it', 'italia': 'it',
    'espagne': 'es', 'spain': 'es', 'es': 'es', 'espana': 'es',
    'royaume-uni': 'gb', 'royaume uni': 'gb', 'united kingdom': 'gb', 'uk': 'gb', 'gb': 'gb', 'angleterre': 'gb', 'england': 'gb', 'grande-bretagne': 'gb',
    'portugal': 'pt', 'pt': 'pt',
    'belgique': 'be', 'belgium': 'be', 'be': 'be',
    'suisse': 'ch', 'switzerland': 'ch', 'ch': 'ch', 'schweiz': 'ch',
    'pays-bas': 'nl', 'pays bas': 'nl', 'netherlands': 'nl', 'hollande': 'nl', 'nl': 'nl',
    'suede': 'se', 'sweden': 'se', 'se': 'se',
    'norvege': 'no', 'norway': 'no', 'no': 'no',
    'danemark': 'dk', 'denmark': 'dk', 'dk': 'dk',
    'finlande': 'fi', 'finland': 'fi', 'fi': 'fi',
    'irlande': 'ie', 'ireland': 'ie', 'ie': 'ie',
    'grece': 'gr', 'greece': 'gr', 'gr': 'gr',
    'pologne': 'pl', 'poland': 'pl', 'pl': 'pl',
    'autriche': 'at', 'austria': 'at', 'at': 'at',
    'ukraine': 'ua', 'ua': 'ua',
    'russie': 'ru', 'russia': 'ru', 'ru': 'ru',
    'turquie': 'tr', 'turkey': 'tr', 'tr': 'tr', 'turkiye': 'tr',
    'monaco': 'mc', 'mc': 'mc',
    'luxembourg': 'lu', 'lu': 'lu',
    'roumanie': 'ro', 'romania': 'ro', 'ro': 'ro',
    'republique tcheque': 'cz', 'czech republic': 'cz', 'czechia': 'cz', 'cz': 'cz',
    'hongrie': 'hu', 'hungary': 'hu', 'hu': 'hu',

    // Amériques
    'etats-unis': 'us', 'etats unis': 'us', 'usa': 'us', 'united states': 'us', 'us': 'us', 'amerique': 'us', 'america': 'us',
    'canada': 'ca', 'ca': 'ca',
    'bresil': 'br', 'brazil': 'br', 'brasil': 'br', 'br': 'br',
    'mexique': 'mx', 'mexico': 'mx', 'mx': 'mx',
    'argentine': 'ar', 'argentina': 'ar', 'ar': 'ar',
    'colombie': 'co', 'colombia': 'co', 'co': 'co',
    'chili': 'cl', 'chile': 'cl', 'cl': 'cl',
    'perou': 'pe', 'peru': 'pe', 'pe': 'pe',
    'venezuela': 've', 've': 've',
    'cuba': 'cu', 'cu': 'cu',

    // Asie & Moyen-Orient
    'japon': 'jp', 'japan': 'jp', 'jp': 'jp', 'nippon': 'jp',
    'chine': 'cn', 'china': 'cn', 'cn': 'cn',
    'inde': 'in', 'india': 'in', 'in': 'in',
    'coree du sud': 'kr', 'south korea': 'kr', 'korea': 'kr', 'kr': 'kr',
    'coree du nord': 'kp', 'north korea': 'kp', 'kp': 'kp',
    'taiwan': 'tw', 'tw': 'tw',
    'singapour': 'sg', 'singapore': 'sg', 'sg': 'sg',
    'emirats arabes unis': 'ae', 'uae': 'ae', 'dubai': 'ae', 'ae': 'ae',
    'arabie saoudite': 'sa', 'saudi arabia': 'sa', 'sa': 'sa',
    'israel': 'il', 'il': 'il',
    'qatar': 'qa', 'qa': 'qa',
    'vietnam': 'vn', 'vn': 'vn',
    'thailande': 'th', 'thailand': 'th', 'th': 'th',
    'indonesie': 'id', 'indonesia': 'id', 'id': 'id',
    'philippines': 'ph', 'ph': 'ph',
    'malaisie': 'my', 'malaysia': 'my', 'my': 'my',
    'pakistan': 'pk', 'pk': 'pk',
    'iran': 'ir', 'ir': 'ir',
    'liban': 'lb', 'lebanon': 'lb', 'lb': 'lb',

    // Afrique
    'maroc': 'ma', 'morocco': 'ma', 'ma': 'ma',
    'algerie': 'dz', 'algeria': 'dz', 'dz': 'dz',
    'tunisie': 'tn', 'tunisia': 'tn', 'tn': 'tn',
    'egypte': 'eg', 'egypt': 'eg', 'eg': 'eg',
    'senegal': 'sn', 'sn': 'sn',
    'cote d\'ivoire': 'ci', 'cote d ivoire': 'ci', 'ivory coast': 'ci', 'ci': 'ci',
    'cameroun': 'cm', 'cameroon': 'cm', 'cm': 'cm',
    'afrique du sud': 'za', 'south africa': 'za', 'za': 'za',
    'nigeria': 'ng', 'ng': 'ng',
    'ghana': 'gh', 'gh': 'gh',
    'kenya': 'ke', 'ke': 'ke',
    'mali': 'ml', 'ml': 'ml',
    'rdc': 'cd', 'congo': 'cg', 'congo rdc': 'cd', 'cd': 'cd', 'cg': 'cg',
    'madagascar': 'mg', 'mg': 'mg',

    // Océanie
    'australie': 'au', 'australia': 'au', 'au': 'au',
    'nouvelle-zelande': 'nz', 'new zealand': 'nz', 'nz': 'nz',

    // Organisations internationales
    'union europeenne': 'eu', 'europe': 'eu', 'ue': 'eu', 'eu': 'eu',
    'nations unies': 'un', 'onu': 'un', 'un': 'un'
};

// Nettoyage et normalisation des textes
function normalizeQuery(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Téléchargement HTTP sécurisé avec redirection automatique
function downloadBuffer(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            family: 4,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VibeEditor/1.0'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadBuffer(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} sur ${url}`));
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        req.setTimeout(12000, () => {
            req.destroy();
            reject(new Error(`Timeout de téléchargement sur ${url}`));
        });
    });
}

// Résolution du code pays ISO alpha-2
async function resolveCountryCode(input) {
    const raw = (input || '').trim().toLowerCase();
    if (/^[a-z]{2}$/.test(raw)) {
        return raw; // Code direct 2 lettres (ex: "fr", "us")
    }

    const norm = normalizeQuery(raw);
    if (COUNTRY_CODES[norm]) {
        return COUNTRY_CODES[norm];
    }

    // Recherche par inclusion dans notre dictionnaire
    for (const [key, code] of Object.entries(COUNTRY_CODES)) {
        if (norm.includes(key) || key.includes(norm)) {
            return code;
        }
    }

    // Requête fallback sur la liste officielle en ligne de FlagCDN
    try {
        const codesBuf = await downloadBuffer('https://flagcdn.com/en/codes.json');
        const allCodes = JSON.parse(codesBuf.toString('utf8'));
        for (const [c, name] of Object.entries(allCodes)) {
            const normName = normalizeQuery(name);
            if (normName === norm || normName.includes(norm) || norm.includes(normName)) {
                return c.toLowerCase();
            }
        }
    } catch (e) {
        // En cas d'erreur réseau, continuer
    }

    return null;
}

/**
 * Télécharge le drapeau (SVG et PNG) pour un pays donné
 * @param {string} countryQuery - Nom du pays ou code ISO
 * @param {object} options - Options { outDir, prefix }
 */
async function fetchFlag(countryQuery, options = {}) {
    if (!fs.existsSync(FLAGS_DIR)) {
        fs.mkdirSync(FLAGS_DIR, { recursive: true });
    }

    const targetDir = options.outDir || FLAGS_DIR;
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const code = await resolveCountryCode(countryQuery);
    if (!code) {
        throw new Error(`Code pays introuvable pour "${countryQuery}"`);
    }

    const slug = normalizeQuery(countryQuery).replace(/\s+/g, '_') || code;
    const svgFileName = `${slug}.svg`;
    const pngFileName = `${slug}.png`;
    const svgDest = path.join(targetDir, svgFileName);
    const pngDest = path.join(targetDir, pngFileName);

    // 1. Télécharger le SVG vectoriel officiel
    const svgUrl = `https://flagcdn.com/${code}.svg`;
    const svgBuf = await downloadBuffer(svgUrl);
    fs.writeFileSync(svgDest, svgBuf);

    // Créer aussi un alias avec le code court (ex: fr.svg)
    const shortSvgDest = path.join(targetDir, `${code}.svg`);
    if (shortSvgDest !== svgDest) {
        fs.writeFileSync(shortSvgDest, svgBuf);
    }

    // 2. Télécharger la version PNG haute définition (w640)
    let hasPng = false;
    try {
        const pngUrl = `https://flagcdn.com/w640/${code}.png`;
        const pngBuf = await downloadBuffer(pngUrl);
        fs.writeFileSync(pngDest, pngBuf);
        hasPng = true;
    } catch(e) {
        console.warn(`[Flag Warning] Impossible de récupérer le PNG pour ${code} (${e.message})`);
    }

    const relSvgPath = `01_Assets/Flags/${svgFileName}`;
    const relPngPath = hasPng ? `01_Assets/Flags/${pngFileName}` : relSvgPath;

    return {
        success: true,
        query: countryQuery,
        code: code.toUpperCase(),
        svgPath: svgDest,
        pngPath: hasPng ? pngDest : null,
        relSvgPath: relSvgPath,
        relPngPath: relPngPath,
        urlSvg: svgUrl
    };
}

// Exécution directe en ligne de commande
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(`\n======================================================`);
        console.log(`🚩 FETCH_FLAG — TÉLÉCHARGEUR DE DRAPEAUX GRATUIT & SANS CLÉ`);
        console.log(`======================================================`);
        console.log(`Usage : node 07_Scripts/fetch_flag.cjs <nom_pays_ou_code> [pays2...]`);
        console.log(`\nExemples :`);
        console.log(`  node 07_Scripts/fetch_flag.cjs France`);
        console.log(`  node 07_Scripts/fetch_flag.cjs "Etats-Unis" Japon Allemagne Brésil`);
        console.log(`  node 07_Scripts/fetch_flag.cjs --code us\n`);
        process.exit(0);
    }

    console.log(`\n======================================================`);
    console.log(`🚩 TÉLÉCHARGEMENT DE DRAPEAUX NATIONAUX`);
    console.log(`======================================================\n`);

    const queries = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--code' && args[i + 1]) {
            queries.push(args[++i]);
        } else if (!args[i].startsWith('--')) {
            queries.push(args[i]);
        }
    }

    for (const q of queries) {
        try {
            console.log(`🔍 Recherche du drapeau pour : "${q}"...`);
            const res = await fetchFlag(q);
            console.log(`✅ [OK] ${res.code} trouvé !`);
            console.log(`   - SVG : ${res.relSvgPath}`);
            if (res.pngPath) console.log(`   - PNG : ${res.relPngPath}`);
        } catch (e) {
            console.error(`❌ Échec pour "${q}" : ${e.message}`);
        }
    }
    console.log(`\n🎉 Terminé ! Les drapeaux sont disponibles dans 01_Assets/Flags/\n`);
}

if (require.main === module) {
    main();
}

module.exports = {
    fetchFlag,
    resolveCountryCode
};

