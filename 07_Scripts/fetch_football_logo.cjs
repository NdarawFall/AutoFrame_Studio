/**
 * 07_Scripts/fetch_football_logo.cjs
 * Téléchargeur automatique de logos de football haute résolution (PNG transparent & SVG)
 * Source officielle : football-logos.cc / assets.football-logos.cc (5,900+ clubs & équipes nationales, 220+ pays)
 * 100% GRATUIT, ILLIMITÉ, SANS CLÉ D'API !
 * 
 * Usage CLI :
 *   node 07_Scripts/fetch_football_logo.cjs "Real Madrid"
 *   node 07_Scripts/fetch_football_logo.cjs "PSG" "Arsenal" "Barcelona" "Bayern Munich"
 *   node 07_Scripts/fetch_football_logo.cjs "France" --kind national-team
 *   node 07_Scripts/fetch_football_logo.cjs --search "milan"
 *   node 07_Scripts/fetch_football_logo.cjs "Real Madrid" --size 1500
 * 
 * Usage programmatique :
 *   const { fetchFootballLogo, searchFootballLogos } = require('./fetch_football_logo.cjs');
 *   const logo = await fetchFootballLogo('Real Madrid');
 *   console.log(logo.localPath); // "01_Assets/Logos/Football/real-madrid.png"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const footballLogos = require('football-logos');

const ROOT_DIR = path.resolve(__dirname, '..');
const FOOTBALL_LOGOS_DIR = path.join(ROOT_DIR, '01_Assets', 'Logos', 'Football');

// S'assure que le dossier de destination existe
if (!fs.existsSync(FOOTBALL_LOGOS_DIR)) {
    fs.mkdirSync(FOOTBALL_LOGOS_DIR, { recursive: true });
}

// Dictionnaire de synonymes / abréviations populaires
const ALIASES = {
    'psg': { country: 'france', slug: 'paris-saint-germain' },
    'paris': { country: 'france', slug: 'paris-saint-germain' },
    'om': { country: 'france', slug: 'marseille' },
    'ol': { country: 'france', slug: 'lyon' },
    'barca': { country: 'spain', slug: 'barcelona' },
    'barça': { country: 'spain', slug: 'barcelona' },
    'real': { country: 'spain', slug: 'real-madrid' },
    'atletico': { country: 'spain', slug: 'atletico-madrid' },
    'bayern': { country: 'germany', slug: 'bayern-munchen' },
    'dortmund': { country: 'germany', slug: 'borussia-dortmund' },
    'juve': { country: 'italy', slug: 'juventus' },
    'inter': { country: 'italy', slug: 'inter' },
    'milan': { country: 'italy', slug: 'milan' },
    'ac milan': { country: 'italy', slug: 'milan' },
    'city': { country: 'england', slug: 'manchester-city' },
    'man city': { country: 'england', slug: 'manchester-city' },
    'united': { country: 'england', slug: 'manchester-united' },
    'man united': { country: 'england', slug: 'manchester-united' },
    'man u': { country: 'england', slug: 'manchester-united' },
    'chelsea': { country: 'england', slug: 'chelsea' },
    'arsenal': { country: 'england', slug: 'arsenal' },
    'liverpool': { country: 'england', slug: 'liverpool' },
    'tottenham': { country: 'england', slug: 'tottenham' }
};

// Normalise une chaîne pour la recherche
function normalize(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Télécharge un fichier binaire depuis une URL HTTPS
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
                return reject(new Error(`HTTP ${res.statusCode} en téléchargeant ${url}`));
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

// Recherche des logos correspondant à un terme
function searchFootballLogos(query, maxResults = 10) {
    const qNorm = normalize(query);
    const qRaw = query.toLowerCase().trim();

    // Vérifier d'abord les alias
    if (ALIASES[qRaw]) {
        const alias = ALIASES[qRaw];
        try {
            const resolved = footballLogos.resolveFootballLogo({ country: alias.country, club: alias.slug });
            return [resolved];
        } catch (e) {}
    }

    const results = [];
    const countries = footballLogos.listCountries();

    for (const c of countries) {
        const logos = footballLogos.listLogos(c.slug);
        for (const item of logos) {
            const nameNorm = normalize(item.name);
            const slugNorm = normalize(item.slug);

            if (slugNorm === qNorm || nameNorm === qNorm) {
                // Correspondance exacte -> priorité maximale
                return [item];
            } else if (slugNorm.includes(qNorm) || nameNorm.includes(qNorm) || qNorm.includes(slugNorm)) {
                results.push(item);
                if (results.length >= maxResults * 2) break;
            }
        }
    }

    // Trier par pertinence (les plus courts d'abord)
    results.sort((a, b) => {
        const lenA = Math.abs(a.slug.length - qNorm.length);
        const lenB = Math.abs(b.slug.length - qNorm.length);
        return lenA - lenB;
    });

    return results.slice(0, maxResults);
}

// Télécharge le logo d'un club ou d'une sélection
async function fetchFootballLogo(query, options = {}) {
    const {
        size = 512, // 64, 128, 256, 512, 700, 1500, 3000
        country = null,
        force = false,
        outputDir = FOOTBALL_LOGOS_DIR
    } = options;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let match = null;
    const qRaw = query.toLowerCase().trim();

    // 1. Alias connus
    if (ALIASES[qRaw]) {
        match = { country: ALIASES[qRaw].country, slug: ALIASES[qRaw].slug, kind: 'club' };
    }

    // 2. Si le pays est spécifié
    if (!match && country) {
        const cLogos = footballLogos.listLogos(country);
        const qNorm = normalize(query);
        match = cLogos.find(l => normalize(l.slug) === qNorm || normalize(l.name) === qNorm)
             || cLogos.find(l => normalize(l.slug).includes(qNorm) || normalize(l.name).includes(qNorm));
    }

    // 3. Recherche globale
    if (!match) {
        const searchRes = searchFootballLogos(query, 1);
        if (searchRes.length > 0) {
            match = searchRes[0];
        }
    }

    if (!match) {
        throw new Error(`Aucun logo trouvé pour le club ou l'équipe: "${query}"`);
    }

    // Résolution de l'URL via la bibliothèque football-logos
    let resolved;
    try {
        if (match.kind === 'league') {
            resolved = footballLogos.resolveFootballLogo({ country: match.country, league: match.slug, size });
        } else {
            resolved = footballLogos.resolveFootballLogo({ country: match.country, club: match.slug, size });
        }
    } catch (e) {
        // Fallback direct sur l'URL d'actifs standard
        const assetUrl = `https://assets.football-logos.cc/logos/${match.country}/${size}x${size}/${match.slug}.${match.hash || 'png'}`;
        resolved = { url: assetUrl, ...match };
    }

    const fileName = `${match.slug}.png`;
    const destPath = path.join(outputDir, fileName);

    // Vérifier si déjà présent en cache local
    if (fs.existsSync(destPath) && !force) {
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) {
            return {
                name: match.name || match.slug,
                slug: match.slug,
                country: match.country,
                localPath: destPath,
                relPath: path.relative(ROOT_DIR, destPath).replace(/\\/g, '/'),
                url: resolved.url,
                fromCache: true,
                size: stats.size
            };
        }
    }

    // Télécharger le logo depuis assets.football-logos.cc
    await downloadFile(resolved.url, destPath);
    const stats = fs.statSync(destPath);

    return {
        name: match.name || match.slug,
        slug: match.slug,
        country: match.country,
        localPath: destPath,
        relPath: path.relative(ROOT_DIR, destPath).replace(/\\/g, '/'),
        url: resolved.url,
        fromCache: false,
        size: stats.size
    };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    let size = 512;
    let country = null;
    let searchOnly = false;
    let force = false;
    const queries = [];

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--size' || a === '-s') {
            size = parseInt(args[++i], 10);
        } else if (a === '--country' || a === '-c') {
            country = args[++i];
        } else if (a === '--search') {
            searchOnly = true;
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                queries.push(args[++i]);
            }
        } else if (a === '--force' || a === '-f') {
            force = true;
        } else if (!a.startsWith('-')) {
            queries.push(a);
        }
    }

    if (queries.length === 0) {
        console.log(`⚽ Usage CLI :`);
        console.log(`  node 07_Scripts/fetch_football_logo.cjs "Real Madrid"`);
        console.log(`  node 07_Scripts/fetch_football_logo.cjs "PSG" "Arsenal" "Barcelona"`);
        console.log(`  node 07_Scripts/fetch_football_logo.cjs --search "milan"`);
        console.log(`  node 07_Scripts/fetch_football_logo.cjs "Bayern" --size 1500`);
        process.exit(0);
    }

    (async () => {
        try {
            if (searchOnly) {
                console.log(`\n🔍 Recherche dans le catalogue football-logos.cc pour "${queries[0]}"...`);
                const results = searchFootballLogos(queries[0], 10);
                if (results.length === 0) {
                    console.log(`❌ Aucun résultat trouvé.`);
                } else {
                    console.log(`\nRésultats trouvés (${results.length}) :`);
                    results.forEach((r, idx) => {
                        console.log(`  ${idx + 1}. [${r.country.toUpperCase()}] ${r.name || r.slug} (slug: ${r.slug}, kind: ${r.kind})`);
                    });
                }
                return;
            }

            console.log(`\n==================================================`);
            console.log(`⚽ TÉLÉCHARGEMENT DE LOGOS DE FOOTBALL (football-logos.cc)`);
            console.log(`==================================================`);

            for (const q of queries) {
                try {
                    process.stdout.write(`⏳ Récupération de "${q}"... `);
                    const res = await fetchFootballLogo(q, { size, country, force });
                    console.log(`✅ [${res.fromCache ? 'CACHE' : 'TÉLÉCHARGÉ'}]`);
                    console.log(`   🏷️  Nom     : ${res.name} (${res.country})`);
                    console.log(`   📁 Fichier : ${res.relPath} (${Math.round(res.size / 1024)} Ko)`);
                    console.log(`   🌐 URL CDN : ${res.url}\n`);
                } catch (err) {
                    console.log(`❌ Erreur: ${err.message}\n`);
                }
            }
            console.log(`==================================================\n`);
        } catch (e) {
            console.error(`❌ Erreur fatale:`, e.message);
            process.exit(1);
        }
    })();
}

module.exports = { fetchFootballLogo, searchFootballLogos, FOOTBALL_LOGOS_DIR };
