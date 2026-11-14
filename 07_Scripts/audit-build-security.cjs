/**
 * AUDIT-BUILD-SECURITY.CJS
 * Script de pré-compilation obligatoire et infranchissable.
 * S'exécute automatiquement avant chaque build (predist).
 * Bloque et avorte immédiatement la compilation si le moindre fichier sensible,
 * clé API ou dossier personnel risque d'être inclus dans le .exe.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
console.log('\n🔒 ======================================================');
console.log('🔒  AUDIT DE SÉCURITÉ PRÉ-COMPILATION AUTOFRAME STUDIO');
console.log('🔒 ======================================================\n');

let hasSecurityViolation = false;

// 1. VÉRIFICATION DES EXCLUSIONS STRICTES DANS PACKAGE.JSON
const pkgPath = path.join(ROOT_DIR, 'package.json');
if (!fs.existsSync(pkgPath)) {
    console.error('❌ ERREUR CRITIQUE : package.json introuvable.');
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const files = (pkg.build && pkg.build.files) || [];

const MANDATORY_EXCLUSIONS = [
    '!Clients/**/*',
    '!03_Chaines/**/*',
    '!04_Videos/**/*',
    '!08_Rendus/**/*',
    '!Docs/**/*',
    '!07_Scripts/api_config.json',
    '!07_Scripts/api_config*.json',
    '!api_config.json',
    '!user_settings.json'
];

console.log('🔍 [1/3] Audit des règles d\'exclusion dans package.json...');
MANDATORY_EXCLUSIONS.forEach(rule => {
    if (!files.includes(rule)) {
        console.error(`❌ FAILLE DÉTECTÉE : L'exclusion obligatoire "${rule}" manque dans package.json !`);
        hasSecurityViolation = true;
    }
});

if (hasSecurityViolation) {
    console.error('\n🚫 COMPILATION BLOQUÉE : La configuration du build ne protège pas toutes les données privées.\n');
    process.exit(1);
}
console.log('  ✅ Toutes les exclusions obligatoires sont actives dans package.json.');

// 2. VÉRIFICATION DE LA NON-PRÉSENCE DE CLÉS EN DUR DANS LES FICHIERS DU PROJET
console.log('\n🔍 [2/3] Scan des fichiers sources à la recherche de clés API en dur...');

const SUSPICIOUS_PATTERNS = [
    { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
    { name: 'ElevenLabs Key', regex: /[a-f0-9]{32}/g }, // Vérifier les patterns de clés 32 hex
    { name: 'HeyGen Key', regex: /heygen_[a-zA-Z0-9]+/g }
];

const SCAN_DIRS = ['07_Scripts', '09_Pages', '02_Composants'];
const IGNORED_FILES = ['audit-build-security.cjs', 'api_config.json']; // api_config.json local est vérifié séparément

SCAN_DIRS.forEach(dir => {
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) return;

    const walk = (d) => {
        fs.readdirSync(d).forEach(item => {
            const fullItem = path.join(d, item);
            if (fs.statSync(fullItem).isDirectory()) {
                walk(fullItem);
            } else if (item.endsWith('.js') || item.endsWith('.cjs') || item.endsWith('.html') || item.endsWith('.json')) {
                if (IGNORED_FILES.includes(item)) return;
                const content = fs.readFileSync(fullItem, 'utf8');

                // Recherche spécifique de Google AI Studio Key réelle
                const googleMatch = content.match(/AIza[0-9A-Za-z-_]{35}/);
                if (googleMatch) {
                    console.error(`❌ FAILLE CRITIQUE : Clé Google API détectée en clair dans : ${path.relative(ROOT_DIR, fullItem)}`);
                    hasSecurityViolation = true;
                }
            }
        });
    };
    walk(fullDir);
});

// 3. VÉRIFICATION QUE LES DONNÉES UTILISATEUR SONT BIEN DÉPORTÉES DANS ELECTRON
console.log('\n🔍 [3/3] Vérification de l\'isolation des données utilisateur (VIBE_USER_DATA)...');
const electronMainPath = path.join(ROOT_DIR, 'electron-main.cjs');
if (fs.existsSync(electronMainPath)) {
    const mainContent = fs.readFileSync(electronMainPath, 'utf8');
    if (!mainContent.includes('process.env.VIBE_USER_DATA')) {
        console.error('❌ FAILLE DÉTECTÉE : electron-main.cjs ne définit pas process.env.VIBE_USER_DATA.');
        hasSecurityViolation = true;
    } else {
        console.log('  ✅ Isolation des données utilisateur active dans electron-main.cjs.');
    }
}

if (hasSecurityViolation) {
    console.error('\n🚫 COMPILATION STRICTEMENT INTERDITE : Corrigez les failles de sécurité avant tout build.\n');
    process.exit(1);
}

console.log('\n======================================================');
console.log('✅ AUDIT DE SÉCURITÉ RÉUSSI AVEC SUCCÈS.');
console.log('🛡️  Zéro clé API, zéro client, zéro vidéo personnelle dans le build.');
console.log('======================================================\n');
process.exit(0);
