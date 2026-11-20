#!/usr/bin/env node
/**
 * CHECK-ARCHITECTURE.CJS — Gardien Automatisé de la Règle 6 de 01-project-architecture.md
 * Vérifie que chaque script, page ou règle pérenne du projet est bien référencé dans 01-project-architecture.md.
 * 
 * Usage :
 *   node 07_Scripts/check-architecture.cjs
 */

const fs = require('fs');
const path = require('path');

const ARCH_PATH = path.resolve(__dirname, '..', '.agents', 'rules', '01-project-architecture.md');

if (!fs.existsSync(ARCH_PATH)) {
    console.error('❌ Fichier introuvable: .agents/rules/01-project-architecture.md');
    process.exit(1);
}

const archContent = fs.readFileSync(ARCH_PATH, 'utf8');

const targets = [
    { dir: '07_Scripts', filter: f => !f.startsWith('.') && f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.py') },
    { dir: '09_Pages', filter: f => f.endsWith('.html') },
    { dir: '.agents/rules', filter: f => f.endsWith('.md') }
];

let hasErrors = false;
console.log('🔍 [check-architecture] Vérification de la traçabilité des fichiers dans 01-project-architecture.md...\n');

targets.forEach(({ dir, filter }) => {
    const fullDir = path.resolve(__dirname, '..', dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(filter);
    const missing = files.filter(f => !archContent.includes(f));

    if (missing.length > 0) {
        hasErrors = true;
        console.warn(`⚠️  Dossier "${dir}" : ${missing.length} fichier(s) manquant(s) dans 01-project-architecture.md :`);
        missing.forEach(f => console.warn(`   - ${f}`));
    } else {
        console.log(`✅ Dossier "${dir}" : Tous les fichiers (${files.length}) sont bien documentés.`);
    }
});

console.log('');
if (hasErrors) {
    console.error('❌ ÉCHEC DE CONFORMITÉ : Certains fichiers pérennes ne sont pas répertoriés dans 01-project-architecture.md.');
    process.exit(1);
} else {
    console.log('🎉 SUCCÈS : 01-project-architecture.md est parfaitement synchronisé avec le disque !');
    process.exit(0);
}
