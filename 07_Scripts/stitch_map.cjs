/**
 * Stitch map tiles directly using sharp - no Chrome headless needed
 * Bypasses all browser rendering issues
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TILE_STYLES = {
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', subdomains: '', name: 'Esri World Imagery' },
    osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', subdomains: 'abc', name: 'OpenStreetMap Standard' }
};

// Convert lat/lon to tile coordinates
function latLonToTile(lat, lon, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lon + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x, y };
}

// Download a single tile
function downloadTile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

// Build tile URL
function buildTileUrl(template, zoom, x, y, subdomain = 'a') {
    return template
        .replace('{z}', zoom)
        .replace('{x}', x)
        .replace('{y}', y)
        .replace('{s}', subdomain);
}

// Main stitching function
async function stitchMap({ lat, lon, zoom = 12, style = 'dark', width = 1920, height = 1080, outPath }) {
    const tileConfig = TILE_STYLES[style] || TILE_STYLES.dark;
    const centerTile = latLonToTile(lat, lon, zoom);

    // Each tile is 256x256 @2x = 512x512 pixels
    const tileSize = 512;

    // Calculate how many tiles we need
    const tilesX = Math.ceil(width / tileSize) + 1;
    const tilesY = Math.ceil(height / tileSize) + 1;

    console.log(`[Stitch] Center tile: ${centerTile.x},${centerTile.y} at zoom ${zoom}`);
    console.log(`[Stitch] Need ${tilesX}x${tilesY} tiles (${tilesX * tilesY} total)`);
    console.log(`[Stitch] Output: ${width}x${height}px`);

    // Calculate top-left tile
    const startX = centerTile.x - Math.floor(tilesX / 2);
    const startY = centerTile.y - Math.floor(tilesY / 2);

    // Download all tiles
    const tilePromises = [];
    for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
            const tileX = startX + tx;
            const tileY = startY + ty;

            const subdomain = tileConfig.subdomains
                ? tileConfig.subdomains[(tileX + tileY) % tileConfig.subdomains.length]
                : '';
            const url = buildTileUrl(tileConfig.url, zoom, tileX, tileY, subdomain);

            tilePromises.push(
                downloadTile(url)
                    .then(buffer => ({ tx, ty, buffer }))
                    .catch(err => {
                        console.warn(`[Stitch] Tile ${tileX},${tileY} failed:`, err.message);
                        return { tx, ty, buffer: null };
                    })
            );
        }
    }

    const tiles = await Promise.all(tilePromises);

    // Create composite image using sharp
    console.log('[Stitch] Compositing tiles...');

    // Create a black background canvas
    const composite = sharp({
        create: {
            width: tilesX * tileSize,
            height: tilesY * tileSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
    });

    // Add each tile
    const inputs = [];
    for (const tile of tiles) {
        if (tile.buffer) {
            inputs.push({
                input: tile.buffer,
                left: tile.tx * tileSize,
                top: tile.ty * tileSize
            });
        }
    }

    const tempPath = outPath.replace('.png', '_temp.png');
    await composite.composite(inputs).png().toFile(tempPath);
    console.log(`[Stitch] Map saved to ${tempPath}`);

    // Now crop to exact dimensions
    const left = Math.max(0, (tilesX * tileSize - width) / 2);
    const top = Math.max(0, (tilesY * tileSize - height) / 2);

    await sharp(tempPath)
        .extract({ left: Math.round(left), top: Math.round(top), width, height })
        .toFile(outPath);

    // Clean up temp
    fs.unlinkSync(tempPath);

    console.log(`[Stitch] Cropped to ${width}x${height}`);
    return outPath;
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage:
  node stitch_map.cjs --query "<ville>" --style dark|voyager|light|satellite|osm --zoom 12 --out <fichier.png>
  node stitch_map.cjs --lat 48.85 --lon 2.35 --zoom 12 --style dark
        `);
        process.exit(0);
    }

    const getArg = (flag) => {
        const idx = args.indexOf(flag);
        return (idx >= 0 && args[idx + 1]) ? args[idx + 1] : null;
    };

    const query = getArg('--query');
    const lat = getArg('--lat') ? parseFloat(getArg('--lat')) : undefined;
    const lon = getArg('--lon') ? parseFloat(getArg('--lon')) : undefined;
    const style = getArg('--style') || 'dark';
    const zoom = getArg('--zoom') ? parseInt(getArg('--zoom'), 10) : 12;
    const width = getArg('--width') ? parseInt(getArg('--width'), 10) : 1920;
    const height = getArg('--height') ? parseInt(getArg('--height'), 10) : 1080;
    const out = getArg('--out');

    // Geocode if needed
    async function geocode(q) {
        return new Promise((resolve, reject) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
            https.get(url, { headers: { 'User-Agent': 'VibeEditor/1.0' } }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (!json.length) return reject(new Error('Not found'));
                        resolve({ lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) });
                    } catch (e) { reject(e); }
                });
            }).on('error', reject);
        });
    }

    (async () => {
        let finalLat = lat, finalLon = lon;
        if (query && (lat === undefined || lon === undefined)) {
            console.log(`[Stitch] Geocoding: ${query}`);
            const geo = await geocode(query);
            finalLat = geo.lat;
            finalLon = geo.lon;
            console.log(`[Stitch] Found: ${finalLat}, ${finalLon}`);
        }

        const mapsDir = path.join(__dirname, '..', '01_Assets', 'Maps');
        if (!fs.existsSync(mapsDir)) fs.mkdirSync(mapsDir, { recursive: true });

        const outPath = out || path.join(mapsDir, `map_${(query || 'custom').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${style}.png`);

        await stitchMap({ lat: finalLat, lon: finalLon, zoom, style, width, height, outPath });
        console.log('\n✅ Done!');
    })().catch(e => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    });
}

module.exports = { stitchMap, latLonToTile, TILE_STYLES };