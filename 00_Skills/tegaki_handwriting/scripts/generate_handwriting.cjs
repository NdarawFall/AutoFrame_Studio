/**
 * Script utilitaire Tegaki Handwriting (Zéro Dépendance Locale)
 * 
 * Permet de générer des SVGs d'écriture manuscrite vectorielle animée
 * sans installer de package dans node_modules (utilise npx à la volée).
 * 
 * Usage :
 *   node 00_Skills/tegaki_handwriting/scripts/generate_handwriting.cjs "Mon Titre" --font caveat --color "#ffffff" --mode once
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Répertoire racine du projet
const ROOT_DIR = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(ROOT_DIR, '01_Assets', 'handwriting');

// Arguments par défaut
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`\nUsage: node generate_handwriting.cjs "Texte à animer" [options]`);
  console.log(`Options :`);
  console.log(`  --font <name>       Police : caveat (défaut), tangerine, italianno, parisienne, amiri...`);
  console.log(`  --color <hex>       Couleur du trait (défaut: "#ffffff")`);
  console.log(`  --size <num>        Taille de la police (défaut: 80)`);
  console.log(`  --mode <mode>       loop (défaut), once, static`);
  console.log(`  --output, -o <file> Nom du fichier SVG de sortie (défaut: basé sur le texte)`);
  process.exit(1);
}

const text = args[0];
let font = 'caveat';
let color = '#ffffff';
let size = '80';
let mode = 'once';
let customOutput = null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--font' && args[i + 1]) font = args[++i];
  else if (args[i] === '--color' && args[i + 1]) color = args[++i];
  else if (args[i] === '--size' && args[i + 1]) size = args[++i];
  else if (args[i] === '--mode' && args[i + 1]) mode = args[++i];
  else if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) customOutput = args[++i];
}

// S'assurer que le dossier 01_Assets/handwriting existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Définir le nom du fichier de sortie
const safeName = text.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30) || 'handwriting';
const finalFileName = customOutput ? customOutput : `${safeName}.svg`;
const outputPath = path.isAbsolute(finalFileName) ? finalFileName : path.join(OUTPUT_DIR, finalFileName);

console.log(`\n🖋️  Génération de l'animation d'écriture manuscrite...`);
console.log(`   Texte  : "${text}"`);
console.log(`   Fonte  : ${font}`);
console.log(`   Couleur: ${color}`);
console.log(`   Mode   : ${mode}`);
console.log(`   Sortie : ${outputPath}\n`);

const cmd = `npx -y tegaki "${text.replace(/"/g, '\\"')}" --font ${font} --color "${color}" --size ${size} --mode ${mode} -o "${outputPath}"`;

try {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT_DIR });
  console.log(`\n✅ SVG généré avec succès dans : ${outputPath}`);
} catch (error) {
  console.error(`\n❌ Erreur lors de la génération :`, error.message);
  process.exit(1);
}
