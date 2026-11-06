/**
 * FETCH_3D_MODEL.CJS — Téléchargeur Universel de Modèles 3D Réalistes
 * Formats supportés : .glb (recommandé Three.js), .gltf, .obj
 * Sources avec priorité demandée :
 *   1. Khronos glTF CDN (100% gratuit, direct .glb, ultra fiable sans clé)
 *   2. Poly Haven API (100% gratuit CC0, modèles scannés réalistes avec textures 1k/2k)
 *   3. Sketchfab API (Dernier recours pour cas rares ou demande explicite --source sketchfab)
 * 
 * Usage :
 *   node 07_Scripts/fetch_3d_model.cjs --query "camera"
 *   node 07_Scripts/fetch_3d_model.cjs --query "chair" --out 01_Assets/3D/chair.glb
 *   node 07_Scripts/fetch_3d_model.cjs --list
 *   node 07_Scripts/fetch_3d_model.cjs --query "car" --source sketchfab
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ASSETS_3D_DIR = path.resolve(__dirname, '..', '01_Assets', '3D');
const CONFIG_PATH = path.join(__dirname, 'api_config.json');

if (!fs.existsSync(ASSETS_3D_DIR)) {
    fs.mkdirSync(ASSETS_3D_DIR, { recursive: true });
}

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {}
    return {};
}

function parseArgs() {
    const args = process.argv.slice(2);
    const params = { query: '', out: '', source: 'all', list: false };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--query' || args[i] === '-q') {
            params.query = args[i + 1] || '';
            i++;
        } else if (args[i] === '--out' || args[i] === '-o') {
            params.out = args[i + 1] || '';
            i++;
        } else if (args[i] === '--source' || args[i] === '-s') {
            params.source = (args[i + 1] || 'all').toLowerCase();
            i++;
        } else if (args[i] === '--list' || args[i] === '-l') {
            params.list = true;
        }
    }
    return params;
}

// Téléchargement direct d'un flux vers un fichier local avec suivi de progression
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} sur ${url}`));
            }

            const total = parseInt(res.headers['content-length'] || '0', 10);
            let downloaded = 0;

            const fileStream = fs.createWriteStream(destPath);
            res.on('data', (chunk) => {
                downloaded += chunk.length;
                if (total > 0) {
                    const pct = Math.round((downloaded / total) * 100);
                    process.stdout.write(`\r   ⏳ Téléchargement : ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB)`);
                }
            });

            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                process.stdout.write('\n');
                resolve(destPath);
            });
            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        });
        req.on('error', reject);
    });
}

// ---------------------------------------------------------------------
// 1. PRIORITÉ 1 : KHRONOS glTF SAMPLE ASSETS (Direct CDN, 100% Gratuit)
// ---------------------------------------------------------------------
async function searchKhronos(query) {
    const listUrl = 'https://api.github.com/repos/KhronosGroup/glTF-Sample-Assets/contents/Models';
    try {
        const res = await fetch(listUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) return [];
        const items = await res.json();
        const q = query.toLowerCase();

        const matches = items
            .filter(item => item.type === 'dir' && item.name.toLowerCase().includes(q))
            .map(item => ({
                name: item.name,
                source: 'Khronos glTF CDN',
                url: `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/${item.name}/glTF-Binary/${item.name}.glb`,
                format: 'glb'
            }));
        return matches;
    } catch (e) {
        return [];
    }
}

// ---------------------------------------------------------------------
// 2. PRIORITÉ 2 : POLY HAVEN (API REST Publique, 100% Gratuit CC0)
// ---------------------------------------------------------------------
async function searchPolyHaven(query) {
    const listUrl = 'https://api.polyhaven.com/assets?type=models';
    try {
        const res = await fetch(listUrl);
        if (!res.ok) return [];
        const assets = await res.json();
        const q = query.toLowerCase();

        const matches = [];
        for (const [id, meta] of Object.entries(assets)) {
            const name = meta.name || id;
            const tags = (meta.tags || []).join(' ').toLowerCase();
            const categories = (meta.categories || []).join(' ').toLowerCase();

            if (id.toLowerCase().includes(q) || name.toLowerCase().includes(q) || tags.includes(q) || categories.includes(q)) {
                matches.push({
                    name: id,
                    displayName: name,
                    source: 'Poly Haven (CC0)',
                    format: 'gltf/glb',
                    id: id
                });
            }
        }
        return matches;
    } catch (e) {
        return [];
    }
}

async function getPolyHavenDownloadUrl(modelId) {
    try {
        const fileUrl = `https://api.polyhaven.com/files/${modelId}`;
        const res = await fetch(fileUrl);
        if (!res.ok) return null;
        const data = await res.json();

        // Texture normale (1k ou 2k, pas de 4k pour alléger les assets vidéo)
        const gltf = data.gltf;
        if (gltf) {
            const resChoice = gltf['1k'] || gltf['2k'] || gltf['raw'];
            if (resChoice && resChoice.gltf && resChoice.gltf.url) {
                return {
                    url: resChoice.gltf.url,
                    include: resChoice.gltf.include || {}
                };
            }
        }
    } catch (e) {}
    return null;
}

// ---------------------------------------------------------------------
// 3. PRIORITÉ 3 : SKETCHFAB (Dernier recours pour cas rares ou demande explicite)
// ---------------------------------------------------------------------
async function searchSketchfab(query, token) {
    const searchUrl = `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) return [];
        const data = await res.json();
        const results = data.results || [];

        return results.map(item => ({
            name: item.name,
            uid: item.uid,
            source: 'Sketchfab',
            format: 'glb/gltf',
            hasToken: !!token
        }));
    } catch (e) {
        return [];
    }
}

async function getSketchfabDownloadUrl(uid, token) {
    if (!token) return null;
    try {
        const dlApi = `https://api.sketchfab.com/v3/models/${uid}/download`;
        const res = await fetch(dlApi, {
            headers: {
                'Authorization': `Token ${token}`,
                'User-Agent': 'Mozilla/5.0'
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.glb && data.glb.url) return { url: data.glb.url, format: 'glb' };
        if (data.gltf && data.gltf.url) return { url: data.gltf.url, format: 'zip' };
    } catch (e) {}
    return null;
}

// ---------------------------------------------------------------------
// ORCHESTRATEUR PRINCIPAL AVEC ORDRE DE PRIORITÉ
// ---------------------------------------------------------------------
async function main() {
    const params = parseArgs();
    const config = loadConfig();
    const sketchfabToken = config.sketchfab_api_token || process.env.SKETCHFAB_API_TOKEN || '';

    console.log(`\n======================================================`);
    console.log(`📦 FETCH 3D MODEL (Modèles Réalistes pour Three.js)`);
    console.log(`📁 Dossier Cible : 01_Assets/3D/`);
    console.log(`🔍 Requête       : "${params.query || 'Tous'}"`);
    console.log(`🎯 Priorité      : 1. Khronos glTF → 2. Poly Haven → 3. Sketchfab (rare)`);
    console.log(`======================================================\n`);

    if (params.list) {
        console.log(`📋 Récupération du catalogue des modèles disponibles...`);
        const khronos = await searchKhronos('');
        console.log(`\n🔹 Khronos glTF CDN (${khronos.length} modèles directs .glb) :`);
        khronos.slice(0, 15).forEach(m => console.log(`   - ${m.name}`));

        const poly = await searchPolyHaven('');
        console.log(`\n🔹 Poly Haven (${poly.length} modèles scannés réalistes 1k) :`);
        poly.slice(0, 15).forEach(m => console.log(`   - ${m.id} (${m.displayName})`));
        return;
    }

    if (!params.query) {
        console.log(`⚠️  Veuillez spécifier un modèle à rechercher :`);
        console.log(`   Exemple : node 07_Scripts/fetch_3d_model.cjs --query "camera"`);
        console.log(`   Pour voir la liste : node 07_Scripts/fetch_3d_model.cjs --list`);
        return;
    }

    let chosenModel = null;
    let chosenSource = '';

    // Si l'utilisateur demande explicitement Sketchfab (--source sketchfab)
    if (params.source === 'sketchfab') {
        console.log(`🔍 Recherche explicite demandée sur Sketchfab...`);
        if (!sketchfabToken) {
            console.log(`⚠️  Aucun token Sketchfab configuré dans api_config.json.`);
            return;
        }
        const sfResults = await searchSketchfab(params.query, sketchfabToken);
        if (sfResults.length > 0) {
            console.log(`   ✨ Trouvé sur Sketchfab : "${sfResults[0].name}"`);
            const dlInfo = await getSketchfabDownloadUrl(sfResults[0].uid, sketchfabToken);
            if (dlInfo && dlInfo.url) {
                chosenModel = { name: sfResults[0].name, url: dlInfo.url, format: dlInfo.format };
                chosenSource = 'Sketchfab';
            }
        }
    } else {
        // -----------------------------------------------------------------
        // PRIORITÉ 1 : KHRONOS glTF CDN (Direct .glb, ultra rapide et fiable)
        // -----------------------------------------------------------------
        console.log(`🔍 1. Recherche sur Khronos glTF CDN (priorité 1)...`);
        const khResults = await searchKhronos(params.query);
        if (khResults.length > 0) {
            console.log(`   ✨ Trouvé sur Khronos glTF CDN : "${khResults[0].name}"`);
            chosenModel = khResults[0];
            chosenSource = 'Khronos glTF';
        }

        // -----------------------------------------------------------------
        // PRIORITÉ 2 : POLY HAVEN (Scans physiques réalistes CC0, textures 1k)
        // -----------------------------------------------------------------
        if (!chosenModel) {
            console.log(`🔍 2. Recherche sur Poly Haven (priorité 2, scans réalistes)...`);
            const phResults = await searchPolyHaven(params.query);
            if (phResults.length > 0) {
                console.log(`   ✨ Trouvé sur Poly Haven : "${phResults[0].id}"`);
                const dlInfo = await getPolyHavenDownloadUrl(phResults[0].id);
                if (dlInfo && dlInfo.url) {
                    chosenModel = { name: phResults[0].id, url: dlInfo.url, format: 'gltf', include: dlInfo.include };
                    chosenSource = 'Poly Haven';
                }
            }
        }

        // -----------------------------------------------------------------
        // PRIORITÉ 3 : SKETCHFAB (Uniquement en dernier recours si token disponible)
        // -----------------------------------------------------------------
        if (!chosenModel && sketchfabToken) {
            console.log(`🔍 3. Fallback en dernier recours sur Sketchfab...`);
            const sfResults = await searchSketchfab(params.query, sketchfabToken);
            if (sfResults.length > 0) {
                console.log(`   ✨ Trouvé sur Sketchfab : "${sfResults[0].name}"`);
                const dlInfo = await getSketchfabDownloadUrl(sfResults[0].uid, sketchfabToken);
                if (dlInfo && dlInfo.url) {
                    chosenModel = { name: sfResults[0].name, url: dlInfo.url, format: dlInfo.format };
                    chosenSource = 'Sketchfab';
                }
            }
        }
    }

    if (!chosenModel) {
        console.log(`\n❌ Aucun modèle trouvé pour "${params.query}".`);
        console.log(`💡 Essayez un mot-clé en anglais (ex: "camera", "chair", "bottle", "helmet", "laptop", "shoe").`);
        return;
    }

    // TÉLÉCHARGEMENT DU MODÈLE
    const sanitizedName = chosenModel.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const targetFile = params.out 
        ? path.resolve(process.cwd(), params.out)
        : path.join(ASSETS_3D_DIR, `${sanitizedName}.${chosenModel.format === 'glb' ? 'glb' : 'gltf'}`);

    console.log(`\n📥 Téléchargement depuis [${chosenSource}] vers :`);
    console.log(`   ${targetFile}`);

    try {
        await downloadFile(chosenModel.url, targetFile);

        // Si Poly Haven a des dépendances bin/textures 1k associées
        if (chosenModel.include && Object.keys(chosenModel.include).length > 0) {
            const baseDir = path.dirname(targetFile);
            console.log(`📥 Téléchargement des dépendances textures 1k associées...`);
            for (const [relPath, fileInfo] of Object.entries(chosenModel.include)) {
                const subDest = path.join(baseDir, relPath);
                const subDir = path.dirname(subDest);
                if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
                await downloadFile(fileInfo.url, subDest);
            }
        }

        const stats = fs.statSync(targetFile);
        console.log(`\n✅ MODÈLE 3D PRÊT !`);
        console.log(`   Taille : ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Chemin : ${targetFile}`);
        console.log(`\n💡 Intégration dans Three.js :`);
        console.log(`   import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';`);
        console.log(`   const loader = new GLTFLoader();`);
        console.log(`   loader.load('../01_Assets/3D/${path.basename(targetFile)}', (gltf) => {`);
        console.log(`       scene.add(gltf.scene);`);
        console.log(`   });`);

    } catch (err) {
        console.error(`\n❌ Erreur lors du téléchargement :`, err.message);
    }
}

main();
