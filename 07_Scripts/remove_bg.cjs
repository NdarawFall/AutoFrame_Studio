/**
 * VibeEditor — Moteur de Détourage IA Local & Lissage Haute Fidélité pour l'Orchestrateur IA
 * 
 * Ce script est utilisé par l'IA et le moteur backend pour détourer automatiquement
 * des sujets (personnages, logos, avatars, objets) sans aucune intervention manuelle.
 * 
 * Pipeline complet :
 * 1. DÉTOURAGE PRIMAIRE (Défaut & Illimité) : Moteur local WASM/ONNX (@imgly/background-removal-node)
 *    - 100% gratuit, 100% autonome, zéro dépendance externe ni Python
 *    - Conserve 100% de vos crédits Clipdrop
 * 2. POST-PROCESSING STUDIO (Lissage, Érosion de contour & Dé-liserage) :
 *    - Érosion morphologique de l'alpha (2px) pour supprimer le halo de fond résiduel
 *    - Feathering / Lissage gaussien pour éliminer l'effet escalier
 *    - Décontamination de couleur (Despill) sur les bordures
 * 3. URGENCE SEULEMENT : API Cloud Clipdrop / Remove.bg
 *    - Utilisé UNIQUEMENT si l'option --emergency est activée OU en ultime secours si le moteur local échoue.
 * 
 * Usage CLI :
 *   node 05_Scripts/remove_bg.cjs <image_entree> [image_sortie.png] [--emergency] [--raw]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Moteur local ONNX / WASM
let imglyRemoveBg = null;
try {
    const imgly = require('@imgly/background-removal-node');
    imglyRemoveBg = imgly.removeBackground;
} catch (e) {
    console.warn('[Détourage IA] Module @imgly/background-removal-node non chargé :', e.message);
}

// Module de traitement d'image haute performance (Sharp)
let sharp = null;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('[Détourage IA] Module sharp non chargé (le lissage avancé sera désactivé) :', e.message);
}

/**
 * Fonction de lissage d'alpha et de suppression de contour parasite (halo / despill)
 * @param {Buffer|string} inputSource - Buffer PNG ou chemin du fichier détouré brut
 * @param {string} outputPath - Chemin final du fichier PNG lissé
 * @param {object} [options]
 */
async function refineMatteAndDefringe(inputSource, outputPath, options = {}) {
    if (!sharp) {
        if (Buffer.isBuffer(inputSource)) {
            fs.writeFileSync(outputPath, inputSource);
        }
        return outputPath;
    }

    const erodeRadius = options.erodeRadius !== undefined ? options.erodeRadius : 2;
    const featherRadius = options.featherRadius !== undefined ? options.featherRadius : 0.6;

    console.log('[Détourage IA] 🎨 Application du lissage studio & suppression des contours parasites...');

    const baseImg = sharp(inputSource);
    const { width, height } = await baseImg.metadata();

    // 1. Extraire canal Alpha brut (1 channel)
    const alphaRaw = await sharp(inputSource)
        .extractChannel(3)
        .raw()
        .toBuffer();

    // 2. Érosion morphologique de l'alpha (rétracte les bords de 1-2px pour éliminer le liseré de fond)
    const erodedAlpha = Buffer.from(alphaRaw);
    const r = erodeRadius;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const a = alphaRaw[idx];
            if (a === 0) continue;

            let minVal = a;
            for (let dy = -r; dy <= r; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= height) { minVal = 0; break; }
                for (let dx = -r; dx <= r; dx++) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= width) { minVal = 0; break; }
                    if (dx * dx + dy * dy <= r * r) {
                        const nVal = alphaRaw[ny * width + nx];
                        if (nVal < minVal) minVal = nVal;
                    }
                }
                if (minVal === 0) break;
            }
            erodedAlpha[idx] = minVal;
        }
    }

    // 3. Lissage doux progressif de l'alpha (Gaussian anti-aliasing)
    const smoothedAlpha = await sharp(erodedAlpha, {
        raw: { width, height, channels: 1 }
    })
    .toColourspace('b-w')
    .blur(featherRadius)
    .extractChannel(0)
    .raw()
    .toBuffer();

    // 4. Charger RGB brut
    const rgbRaw = await sharp(inputSource)
        .removeAlpha()
        .raw()
        .toBuffer();

    // 5. Décontamination des couleurs (Despill) sur les bordures extérieures
    const finalRgba = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pIdx = y * width + x;
            const rgbIdx = pIdx * 3;
            const rgbaIdx = pIdx * 4;

            let red = rgbRaw[rgbIdx];
            let green = rgbRaw[rgbIdx + 1];
            let blue = rgbRaw[rgbIdx + 2];
            let alpha = smoothedAlpha[pIdx];

            // Décontamination ciblée sur les pixels de bordure semi-transparents
            if (alpha > 0 && alpha < 240) {
                // Si couleur de fond résiduelle (ex: jaune vif / vert fond vert / blanc brûlé)
                if (red > 170 && green > 140 && blue < 65) {
                    alpha = Math.max(0, Math.round(alpha * 0.25));
                }
            }

            finalRgba[rgbaIdx] = red;
            finalRgba[rgbaIdx + 1] = green;
            finalRgba[rgbaIdx + 2] = blue;
            finalRgba[rgbaIdx + 3] = alpha;
        }
    }

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    await sharp(finalRgba, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

    console.log(`[Détourage IA] ✨ Lissage terminé : contours parfaits et fond résiduel éliminé.`);
    return outputPath;
}

/**
 * Fonction principale de détourage
 * @param {string} inputPath - Chemin absolu ou relatif de l'image source
 * @param {string} [outputPath] - Chemin de destination (.png)
 * @param {object} [options] - Options ({ emergency: boolean, raw: boolean })
 */
async function removeBackground(inputPath, outputPath, options = {}) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Fichier introuvable : ${inputPath}`);
    }

    if (!outputPath) {
        const parsed = path.parse(inputPath);
        outputPath = path.join(parsed.dir, `${parsed.name}_detoure.png`);
    }

    console.log(`[Détourage IA] Traitement de : ${inputPath}`);
    console.log(`[Détourage IA] Destination : ${outputPath}`);

    const isEmergencyRequested = options.emergency || process.argv.includes('--emergency') || process.argv.includes('--cloud');
    const isRawRequested = options.raw || process.argv.includes('--raw');

    let initialPngBuffer = null;

    // 1. Si urgence demandée explicitement, utiliser ClipDrop
    if (isEmergencyRequested) {
        const clipdropKey = process.env.CLIPDROP_API_KEY;
        const removeBgKey = process.env.REMOVE_BG_API_KEY;

        if (clipdropKey) {
            console.log('[Détourage IA] [MODE URGENCE] Utilisation de l\'API Clipdrop (consomme 1 crédit)...');
            initialPngBuffer = await fetchClipdropBuffer(inputPath, clipdropKey);
        } else if (removeBgKey) {
            console.log('[Détourage IA] [MODE URGENCE] Utilisation de l\'API Remove.bg...');
            initialPngBuffer = await fetchRemoveBgBuffer(inputPath, removeBgKey);
        } else {
            console.warn('[Détourage IA] [ATTENTION] Mode urgence demandé mais aucune clé Clipdrop/Remove.bg trouvée.');
        }
    }

    // 2. Moteur Local WASM / ONNX (@imgly/background-removal-node) — Gratuit & Illimité
    if (!initialPngBuffer && imglyRemoveBg) {
        try {
            console.log('[Détourage IA] Exécution du moteur local WASM/ONNX (Gratuit, Zéro crédit consommé)...');
            const startTime = Date.now();

            const { pathToFileURL } = require('url');
            const fileUrl = pathToFileURL(path.resolve(inputPath)).href;
            const blob = await imglyRemoveBg(fileUrl);
            const arrayBuffer = await blob.arrayBuffer();
            initialPngBuffer = Buffer.from(arrayBuffer);

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[Détourage IA] ✅ Détourage local brut réussi en ${duration}s.`);
        } catch (localErr) {
            console.error('[Détourage IA] ⚠️ Erreur du moteur local WASM :', localErr.message);
            console.log('[Détourage IA] Basculement de secours vers l\'API d\'urgence...');
        }
    }

    // 3. Secours automatique uniquement en cas d'échec du moteur local
    if (!initialPngBuffer) {
        const fallbackKey = process.env.CLIPDROP_API_KEY;
        if (fallbackKey) {
            console.warn('[Détourage IA] ⚡ Déclenchement de secours Clipdrop (consomme 1 crédit de votre quota)...');
            initialPngBuffer = await fetchClipdropBuffer(inputPath, fallbackKey);
        }
    }

    if (!initialPngBuffer) {
        throw new Error('Impossible de détourer : le moteur local a échoué et aucune clé de secours Clipdrop n\'est configurée.');
    }

    // 4. Étape de lissage & suppression des contours résiduels
    if (isRawRequested || !sharp) {
        const outDir = path.dirname(outputPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, initialPngBuffer);
        return outputPath;
    }

    return await refineMatteAndDefringe(initialPngBuffer, outputPath);
}

// Téléchargement buffer ClipDrop API
function fetchClipdropBuffer(inputPath, apiKey) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(inputPath);
        const boundary = '----VibeEditorBoundary' + Date.now();

        const postDataHeader = Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="image_file"; filename="${path.basename(inputPath)}"\r\n` +
            `Content-Type: image/png\r\n\r\n`
        );
        const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
        const payload = Buffer.concat([postDataHeader, fileData, postDataFooter]);

        const req = https.request({
            hostname: 'clipdrop-api.co',
            path: '/remove-background/v1',
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                let errData = '';
                res.on('data', chunk => errData += chunk);
                res.on('end', () => reject(new Error(`Clipdrop API error (${res.statusCode}): ${errData}`)));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Téléchargement buffer Remove.bg API
function fetchRemoveBgBuffer(inputPath, apiKey) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(inputPath);
        const boundary = '----VibeEditorBoundary' + Date.now();

        const postDataHeader = Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="image_file"; filename="${path.basename(inputPath)}"\r\n` +
            `Content-Type: image/png\r\n\r\n`
        );
        const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
        const payload = Buffer.concat([postDataHeader, fileData, postDataFooter]);

        const req = https.request({
            hostname: 'api.remove.bg',
            path: '/v1.0/removebg',
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                let errData = '';
                res.on('data', chunk => errData += chunk);
                res.on('end', () => reject(new Error(`Remove.bg API error (${res.statusCode}): ${errData}`)));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Exécution directe via CLI
if (require.main === module) {
    const rawArgs = process.argv.slice(2);
    const isEmergency = rawArgs.includes('--emergency');
    const isRaw = rawArgs.includes('--raw');
    const filteredArgs = rawArgs.filter(arg => !arg.startsWith('--'));

    if (filteredArgs.length === 0) {
        console.log("Usage: node 05_Scripts/remove_bg.cjs <image_input> [image_output.png] [--emergency] [--raw]");
        process.exit(1);
    }

    removeBackground(filteredArgs[0], filteredArgs[1], { emergency: isEmergency, raw: isRaw })
        .then(() => process.exit(0))
        .catch(err => {
            console.error('[Erreur Détourage]', err.message);
            process.exit(1);
        });
}

module.exports = { removeBackground, refineMatteAndDefringe };
