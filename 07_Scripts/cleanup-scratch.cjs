/**
 * CLEANUP-SCRATCH.CJS — Nettoyage intelligent et automatique des scripts & résidus temporaires
 * 
 * Se déclenche automatiquement lorsqu'une vidéo est 100% terminée et finalisée.
 * Ne supprime rien tant qu'un processus de création ou de rendu est en cours.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const USER_DATA_DIR = process.env.VIBE_USER_DATA || ROOT_DIR;

/**
 * Détermine si une vidéo ou un rendu est actuellement en cours dans l'application.
 * Empêche toute suppression prématurée des scripts si la génération n'est pas achevée.
 */
function isVideoProcessRunning() {
    // 1. Vérification d'un indicateur de verrou global ou variable d'environnement
    if (global.__MARVIDFLOW_CREATION_ACTIVE === true || global.__MARVIDFLOW_RENDER_ACTIVE === true) {
        return true;
    }

    // 2. Vérification d'un fichier de lock temporaire
    const lockFiles = [
        path.join(ROOT_DIR, '.video_creation.lock'),
        path.join(USER_DATA_DIR, '.video_creation.lock'),
        path.join(ROOT_DIR, '.render.lock'),
        path.join(USER_DATA_DIR, '.render.lock')
    ];

    for (const lf of lockFiles) {
        if (fs.existsSync(lf)) {
            try {
                const stats = fs.statSync(lf);
                // Si le lock a moins de 30 minutes, on considère qu'une tâche tourne
                if (Date.now() - stats.mtimeMs < 30 * 60 * 1000) {
                    return true;
                } else {
                    // Lock obsolète, on peut l'ignorer
                    try { fs.unlinkSync(lf); } catch(e) {}
                }
            } catch(e) {}
        }
    }

    return false;
}

/**
 * Pose ou retire un verrou de génération vidéo
 */
function setVideoProcessLock(isRunning, lockType = 'creation') {
    const lockFileName = lockType === 'render' ? '.render.lock' : '.video_creation.lock';
    const lockPath = path.join(ROOT_DIR, lockFileName);
    const userLockPath = path.join(USER_DATA_DIR, lockFileName);

    if (isRunning) {
        if (lockType === 'render') global.__MARVIDFLOW_RENDER_ACTIVE = true;
        else global.__MARVIDFLOW_CREATION_ACTIVE = true;

        try { fs.writeFileSync(lockPath, JSON.stringify({ pid: process.pid, time: Date.now() }), 'utf8'); } catch(e) {}
        if (USER_DATA_DIR !== ROOT_DIR) {
            try { fs.writeFileSync(userLockPath, JSON.stringify({ pid: process.pid, time: Date.now() }), 'utf8'); } catch(e) {}
        }
    } else {
        if (lockType === 'render') global.__MARVIDFLOW_RENDER_ACTIVE = false;
        else global.__MARVIDFLOW_CREATION_ACTIVE = false;

        try { if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath); } catch(e) {}
        if (USER_DATA_DIR !== ROOT_DIR) {
            try { if (fs.existsSync(userLockPath)) fs.unlinkSync(userLockPath); } catch(e) {}
        }
    }
}

/**
 * Nettoie le dossier scratch et les fichiers temporaires résiduels.
 * @param {object} options
 * @param {boolean} options.force - Forcer le nettoyage même si un lock est présent
 * @param {function} options.logger - Fonction de log personnalisée
 */
function cleanupScratch(options = {}) {
    const { force = false, logger = console.log } = options;

    if (!force && isVideoProcessRunning()) {
        logger('⏳ [Cleanup Scratch] Une vidéo est actuellement en cours de création ou de rendu. Nettoyage différé.');
        return { success: false, reason: 'process_running', cleanedCount: 0 };
    }

    const targetDirs = [
        path.join(ROOT_DIR, 'scratch'),
        path.join(USER_DATA_DIR, 'scratch')
    ];

    // Inclure le dossier scratch de l'agent si configuré
    if (process.env.BRAIN_SCRATCH && fs.existsSync(process.env.BRAIN_SCRATCH)) {
        targetDirs.push(process.env.BRAIN_SCRATCH);
    }

    let totalDeleted = 0;
    let totalBytesReclaimed = 0;

    targetDirs.forEach(dir => {
        if (!fs.existsSync(dir)) return;

        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                // Toujours conserver le fichier repère .gitkeep
                if (file === '.gitkeep') return;

                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.statSync(fullPath);
                    if (stats.isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        totalDeleted++;
                    } else if (stats.isFile()) {
                        totalBytesReclaimed += stats.size;
                        fs.unlinkSync(fullPath);
                        totalDeleted++;
                    }
                } catch(fileErr) {
                    // Ignorer les éventuels fichiers temporairement verrouillés par l'OS
                }
            });
        } catch(dirErr) {
            // Ignorer si dossier inaccessible
        }
    });

    // Nettoyage optionnel des fichiers audio temporaires orphelins (_temp_*.wav dans Voix_Off)
    const voixOffDirs = [
        path.join(ROOT_DIR, '01_Assets', 'Voix_Off'),
        path.join(USER_DATA_DIR, '01_Assets', 'Voix_Off')
    ];

    voixOffDirs.forEach(vDir => {
        if (!fs.existsSync(vDir)) return;
        try {
            const audios = fs.readdirSync(vDir);
            const now = Date.now();
            audios.forEach(a => {
                if (a.startsWith('_temp_') && a.endsWith('.wav')) {
                    const aPath = path.join(vDir, a);
                    try {
                        const aStats = fs.statSync(aPath);
                        // Ne supprimer que si le fichier temp a plus de 5 minutes
                        if (now - aStats.mtimeMs > 5 * 60 * 1000) {
                            totalBytesReclaimed += aStats.size;
                            fs.unlinkSync(aPath);
                            totalDeleted++;
                        }
                    } catch(e) {}
                }
            });
        } catch(e) {}
    });

    const kbReclaimed = (totalBytesReclaimed / 1024).toFixed(1);
    if (totalDeleted > 0) {
        logger(`🧹 [Cleanup Scratch] ${totalDeleted} fichier(s) résiduel(s) supprimé(s) avec succès (${kbReclaimed} KB libérés).`);
    } else {
        logger('✨ [Cleanup Scratch] Dossier scratch propre, aucun résidu temporaire.');
    }

    return {
        success: true,
        cleanedCount: totalDeleted,
        bytesReclaimed: totalBytesReclaimed
    };
}

// Exécution directe en ligne de commande : node 07_Scripts/cleanup-scratch.cjs
if (require.main === module) {
    const isForce = process.argv.includes('--force');
    cleanupScratch({ force: isForce });
}

module.exports = {
    cleanupScratch,
    isVideoProcessRunning,
    setVideoProcessLock
};
