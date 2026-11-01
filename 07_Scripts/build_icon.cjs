const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const resedit = require('resedit');

const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161722"/>
      <stop offset="50%" stop-color="#0E0F17"/>
      <stop offset="100%" stop-color="#07070B"/>
    </linearGradient>

    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>

    <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="45%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>

    <linearGradient id="ribbonGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="55%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Fond Squircle Sombre & Bordure Néon -->
  <rect x="24" y="24" width="464" height="464" rx="116" ry="116" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="12"/>

  <!-- Halo de lueur ambiant -->
  <g filter="url(#glow)" opacity="0.5">
    <path d="M 144 148 L 220 148 L 256 295 L 292 148 L 368 148 L 290 366 C 274 406 238 406 222 366 Z" fill="url(#ribbonGrad1)"/>
    <path d="M 236 210 L 306 256 L 236 302 Z" fill="#06B6D4"/>
  </g>

  <!-- Branche Gauche du V -->
  <path d="M 148 152 L 216 152 L 256 300 L 222 368 C 212 390 196 390 186 368 L 148 152 Z" fill="url(#ribbonGrad1)"/>
  
  <!-- Branche Droite du V -->
  <path d="M 364 152 L 296 152 L 256 300 L 290 368 C 300 390 316 390 326 368 L 364 152 Z" fill="url(#ribbonGrad2)"/>

  <!-- Flèche Play Centrale (Symbole Vidéo / Vibe) -->
  <path d="M 238 214 L 298 256 L 238 298 Z" fill="#FFFFFF" opacity="0.95"/>

  <!-- Pastille néon cyan -->
  <circle cx="256" cy="374" r="10" fill="#06B6D4"/>
  <circle cx="256" cy="374" r="4" fill="#FFFFFF"/>
</svg>`;

async function buildIcons() {
    const buildDir = path.resolve(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    const svgBuffer = Buffer.from(svgCode);

    // 1. Sauvegarder icon.png (512x512)
    const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
    fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);
    console.log('✓ build/icon.png généré (512x512)');

    // 2. Générer les différentes résolutions pour l'ICO Windows
    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const imageBuffers = [];

    for (const size of sizes) {
        const buf = await sharp(svgBuffer).resize(size, size).png().toBuffer();
        imageBuffers.push({ size, buffer: buf });
    }

    // 3. Encoder le fichier .ICO multi-résolutions (PNG compressé)
    const count = imageBuffers.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // 1 = ICO
    header.writeUInt16LE(count, 4); // Count

    let offset = 6 + (16 * count);
    const directoryEntries = [];

    for (const img of imageBuffers) {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // Width (0 = 256)
        entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // Height (0 = 256)
        entry.writeUInt8(0, 2); // Color palette
        entry.writeUInt8(0, 3); // Reserved
        entry.writeUInt16LE(1, 4); // Color planes
        entry.writeUInt16LE(32, 6); // Bits per pixel
        entry.writeUInt32LE(img.buffer.length, 8); // Size
        entry.writeUInt32LE(offset, 12); // Offset
        directoryEntries.push(entry);
        offset += img.buffer.length;
    }

    const icoBuffer = Buffer.concat([
        header,
        ...directoryEntries,
        ...imageBuffers.map(img => img.buffer)
    ]);

    const icoPath = path.join(buildDir, 'icon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✓ build/icon.ico multi-résolution généré (16 à 256px) :', icoBuffer.length, 'octets');

    // Vérification de compatibilité avec resedit
    try {
        const parsed = resedit.Data.IconFile.from(icoBuffer);
        console.log('✓ Validation resedit réussie, icônes reconnues :', parsed.icons.length);
    } catch (e) {
        console.error('Erreur resedit:', e.message);
    }
}

buildIcons().catch(err => {
    console.error('Erreur génération icônes:', err);
    process.exit(1);
});

