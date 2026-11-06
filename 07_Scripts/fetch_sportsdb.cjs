/**
 * 07_Scripts/fetch_sportsdb.cjs
 * Téléchargeur de photos de joueurs détourées (PNG Cutouts sans fond) et de données sportives
 * Source : TheSportsDB API (Clé publique gratuite 123)
 * 100% GRATUIT & SANS CLÉ PAYANTE !
 * 
 * Usage CLI :
 *   node 07_Scripts/fetch_sportsdb.cjs "Kylian Mbappé"
 *   node 07_Scripts/fetch_sportsdb.cjs "Lionel Messi" "Cristiano Ronaldo" "Erling Haaland"
 *   node 07_Scripts/fetch_sportsdb.cjs --team "Arsenal"
 *   node 07_Scripts/fetch_sportsdb.cjs --player "Vinicius Junior" --thumb
 * 
 * Usage programmatique :
 *   const { fetchPlayer, fetchTeam } = require('./fetch_sportsdb.cjs');
 *   const player = await fetchPlayer('Kylian Mbappé');
 *   console.log(player.cutoutPath); // "01_Assets/Images/Players/kylian-mbappe.png"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const PLAYERS_DIR = path.join(ROOT_DIR, '01_Assets', 'Illustrations', 'Players');
const TEAMS_DIR = path.join(ROOT_DIR, '01_Assets', 'Logos', 'Sports');

// S'assurer que les dossiers de destination existent
[PLAYERS_DIR, TEAMS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const API_KEY = '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Normalise une chaîne pour le nom de fichier
function slugify(text) {
    if (!text) return 'unnamed';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Effectue une requête HTTP GET retournant du JSON
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Node.js/VibeEditor)' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchJson(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} lors de l'appel à ${url}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Réponse JSON invalide: ${data.slice(0, 100)}`));
                }
            });
        }).on('error', reject);
    });
}

// Télécharge un fichier binaire (image PNG / JPG)
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

// Recherche et télécharge les assets d'un joueur
async function fetchPlayer(playerName, options = {}) {
    const { force = false, preferThumb = false } = options;
    const query = encodeURIComponent(playerName.trim());
    const searchUrl = `${BASE_URL}/searchplayers.php?p=${query}`;

    const data = await fetchJson(searchUrl);
    if (!data.player || data.player.length === 0) {
        throw new Error(`Aucun joueur trouvé pour "${playerName}"`);
    }

    const p = data.player[0];
    const slug = slugify(p.strPlayer);

    // Choisir l'image : cutout détouré en priorité, sinon thumb photo
    let imageUrl = null;
    let isCutout = false;

    if (!preferThumb && p.strCutout) {
        imageUrl = p.strCutout;
        isCutout = true;
    } else if (p.strRender) {
        imageUrl = p.strRender;
        isCutout = true;
    } else if (p.strThumb) {
        imageUrl = p.strThumb;
        isCutout = false;
    } else if (p.strCutout) {
        imageUrl = p.strCutout;
        isCutout = true;
    }

    let localPath = null;
    let relPath = null;
    let fromCache = false;

    if (imageUrl) {
        const ext = path.extname(imageUrl.split('?')[0]) || (isCutout ? '.png' : '.jpg');
        const filename = `${slug}${ext}`;
        localPath = path.join(PLAYERS_DIR, filename);
        relPath = path.relative(ROOT_DIR, localPath).replace(/\\/g, '/');

        if (fs.existsSync(localPath) && !force) {
            fromCache = true;
        } else {
            await downloadFile(imageUrl, localPath);
        }
    }

    return {
        id: p.idPlayer,
        name: p.strPlayer,
        team: p.strTeam,
        nationality: p.strNationality,
        position: p.strPosition,
        number: p.strNumber,
        birthDate: p.dateBorn,
        birthPlace: p.strBirthLocation,
        height: p.strHeight,
        weight: p.strWeight,
        isCutout,
        imageUrl,
        localPath,
        relPath,
        fromCache
    };
}

// Recherche et télécharge les assets d'un club / équipe
async function fetchTeam(teamName, options = {}) {
    const { force = false } = options;
    const query = encodeURIComponent(teamName.trim());
    const searchUrl = `${BASE_URL}/searchteams.php?t=${query}`;

    const data = await fetchJson(searchUrl);
    if (!data.teams || data.teams.length === 0) {
        throw new Error(`Aucune équipe trouvée pour "${teamName}"`);
    }

    const t = data.teams[0];
    const slug = slugify(t.strTeam);

    let badgeLocal = null;
    let jerseyLocal = null;
    let bannerLocal = null;

    if (t.strBadge) {
        const dest = path.join(TEAMS_DIR, `${slug}-badge.png`);
        if (!fs.existsSync(dest) || force) {
            await downloadFile(t.strBadge, dest);
        }
        badgeLocal = path.relative(ROOT_DIR, dest).replace(/\\/g, '/');
    }

    if (t.strEquipment) {
        const dest = path.join(TEAMS_DIR, `${slug}-jersey.png`);
        if (!fs.existsSync(dest) || force) {
            await downloadFile(t.strEquipment, dest);
        }
        jerseyLocal = path.relative(ROOT_DIR, dest).replace(/\\/g, '/');
    }

    return {
        id: t.idTeam,
        name: t.strTeam,
        shortName: t.strTeamShort,
        league: t.strLeague,
        stadium: t.strStadium,
        country: t.strCountry,
        badgeUrl: t.strBadge,
        badgePath: badgeLocal,
        jerseyUrl: t.strEquipment,
        jerseyPath: jerseyLocal
    };
}

// Mode CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    let isTeam = false;
    let preferThumb = false;
    let force = false;
    const targets = [];

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--team' || a === '-t') {
            isTeam = true;
        } else if (a === '--thumb') {
            preferThumb = true;
        } else if (a === '--force' || a === '-f') {
            force = true;
        } else if (!a.startsWith('-')) {
            targets.push(a);
        }
    }

    if (targets.length === 0) {
        console.log(`Usage : node 07_Scripts/fetch_sportsdb.cjs "Nom du joueur"`);
        console.log(`Exemples :`);
        console.log(`  node 07_Scripts/fetch_sportsdb.cjs "Kylian Mbappé"`);
        console.log(`  node 07_Scripts/fetch_sportsdb.cjs "Messi" "Ronaldo" "Haaland"`);
        console.log(`  node 07_Scripts/fetch_sportsdb.cjs --team "Real Madrid"`);
        process.exit(0);
    }

    (async () => {
        try {
            console.log(`\n==================================================`);
            console.log(`⚽ THE SPORTS DB — ASSETS & PORTRAITS DÉTOURÉS`);
            console.log(`==================================================`);

            for (const item of targets) {
                if (isTeam) {
                    process.stdout.write(`⏳ Recherche club "${item}"... `);
                    const res = await fetchTeam(item, { force });
                    console.log(`✅ TROUVÉ !`);
                    console.log(`   🏷️  Nom     : ${res.name} (${res.country}) | Ligue: ${res.league}`);
                    if (res.badgePath) console.log(`   🛡️  Badge   : ${res.badgePath}`);
                    if (res.jerseyPath) console.log(`   👕 Maillot : ${res.jerseyPath}`);
                    console.log(``);
                } else {
                    process.stdout.write(`⏳ Recherche joueur "${item}"... `);
                    const res = await fetchPlayer(item, { force, preferThumb });
                    console.log(`✅ TROUVÉ !`);
                    console.log(`   👤 Joueur   : ${res.name} (${res.nationality})`);
                    console.log(`   🏟️  Club     : ${res.team || 'N/A'} | Poste: ${res.position || 'N/A'}`);
                    if (res.relPath) {
                        console.log(`   📸 Portrait : ${res.relPath} [${res.isCutout ? 'DÉTOURÉ SANS FOND (PNG)' : 'PHOTO'}] (${res.fromCache ? 'Cache' : 'Téléchargé'})`);
                    } else {
                        console.log(`   ⚠️  Aucun portrait disponible.`);
                    }
                    console.log(``);
                }
            }
            console.log(`==================================================\n`);
        } catch (err) {
            console.error(`❌ Erreur:`, err.message);
            process.exit(1);
        }
    })();
}

module.exports = { fetchPlayer, fetchTeam, PLAYERS_DIR, TEAMS_DIR };

