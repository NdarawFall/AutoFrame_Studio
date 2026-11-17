/**
 * ELECTRON-MAIN.CJS — Point d'entrée de l'application de bureau Windows MarvidFlow
 * Démarre le serveur local en arrière-plan, gère la fenêtre native et les mises à jour directes via GitHub Releases.
 */
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

// Indique au serveur studio-server qu'il s'exécute dans Electron (évite d'ouvrir le navigateur externe)
process.env.IS_ELECTRON = '1';

// Détermine le répertoire de données de l'utilisateur (dossier avec pleins droits de lecture/écriture)
// Les clients, chaînes et vidéos créés par l'utilisateur sont stockés dans Documents/MarvidFlow
const oldDataDir = path.join(app.getPath('documents'), 'AutoFrame');
const defaultDataDir = path.join(app.getPath('documents'), 'MarvidFlow');
const userDataDir = fs.existsSync(oldDataDir) && !fs.existsSync(defaultDataDir) ? oldDataDir : defaultDataDir;
process.env.VIBE_USER_DATA = userDataDir;

// S'assurer que les sous-dossiers existent pour l'utilisateur
try {
    ['Clients', '03_Chaines', '04_Videos', '08_Rendus'].forEach(folder => {
        const p = path.join(userDataDir, folder);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
} catch(e) {}

// Ignore silencieusement si le port 3000 est déjà occupé par un serveur existant
process.on('uncaughtException', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.log('ℹ️ Port 3000 déjà actif, connexion transparente.');
        return;
    }
    console.error('Erreur inattendue :', err);
});

// Lancement automatique du serveur Node.js studio-server
try {
    require('./07_Scripts/studio-server.cjs');
} catch (err) {
    console.error('Erreur démarrage studio-server dans Electron :', err);
}

let mainWindow = null;

// -----------------------------------------------------------------------------
// SYSTÈME DE MISE À JOUR DIRECT VIA L'API GITHUB RELEASES (SANS LATEST.YML)
// -----------------------------------------------------------------------------
let updateDownloadProcess = null;

global.triggerElectronUpdateCheck = () => {
    if (global.setAppUpdateState) {
        global.setAppUpdateState({ status: 'checking', progress: 0, error: null });
    }

    const reqOpts = {
        hostname: 'api.github.com',
        path: '/repos/NdarawFall/MarvidFlow/releases/latest',
        headers: { 'User-Agent': 'MarvidFlow-Studio-Desktop' }
    };

    https.get(reqOpts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                if (res.statusCode === 200) {
                    const release = JSON.parse(data);
                    const latestTag = release.tag_name ? release.tag_name.replace(/^v/, '') : null;
                    const currentVersion = app.getVersion();

                    // Trouver le fichier .exe dans les assets de la release
                    let exeAsset = null;
                    if (Array.isArray(release.assets)) {
                        exeAsset = release.assets.find(a => a.name && a.name.endsWith('.exe'));
                    }

                    const downloadUrl = exeAsset ? exeAsset.browser_download_url : release.html_url;

                    if (latestTag && latestTag !== currentVersion) {
                        console.log(`[MarvidFlow Update] Nouvelle version trouvée : v${latestTag} (actuelle: v${currentVersion})`);
                        if (global.setAppUpdateState) {
                            global.setAppUpdateState({
                                status: 'available',
                                latestVersion: latestTag,
                                releaseNotes: release.body || '',
                                downloadUrl: downloadUrl,
                                progress: 0
                            });
                        }
                    } else {
                        console.log(`[MarvidFlow Update] Application à jour (v${currentVersion}).`);
                        if (global.setAppUpdateState) {
                            global.setAppUpdateState({
                                status: 'up-to-date',
                                latestVersion: currentVersion,
                                progress: 100
                            });
                        }
                    }
                } else {
                    if (global.setAppUpdateState) {
                        global.setAppUpdateState({ status: 'up-to-date', progress: 100 });
                    }
                }
            } catch (err) {
                console.error('[MarvidFlow Update] Erreur parsing release :', err);
                if (global.setAppUpdateState) {
                    global.setAppUpdateState({ status: 'error', error: err.message });
                }
            }
        });
    }).on('error', (err) => {
        console.error('[MarvidFlow Update] Erreur réseau vérification :', err);
        if (global.setAppUpdateState) {
            global.setAppUpdateState({ status: 'error', error: err.message });
        }
    });
};

global.triggerElectronInstallUpdate = () => {
    const state = typeof global.getAppUpdateState === 'function' ? global.getAppUpdateState() : null;
    const downloadUrl = state && state.downloadUrl ? state.downloadUrl : null;

    if (!downloadUrl) {
        shell.openExternal('https://github.com/NdarawFall/MarvidFlow/releases/latest');
        return;
    }

    // Si c'est un lien direct vers le fichier .exe, on le télécharge dans le dossier temporaire
    if (downloadUrl.endsWith('.exe')) {
        const tempPath = path.join(app.getPath('temp'), `MarvidFlow-Setup-v${state.latestVersion || 'update'}.exe`);
        console.log(`[MarvidFlow Update] Téléchargement de ${downloadUrl} vers ${tempPath}...`);

        if (global.setAppUpdateState) {
            global.setAppUpdateState({ status: 'downloading', progress: 10 });
        }

        const file = fs.createWriteStream(tempPath);
        
        const downloadFile = (url) => {
            https.get(url, (res) => {
                // Suivre les redirections GitHub (302 vers AWS S3)
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    downloadFile(res.headers.location);
                    return;
                }

                const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
                let receivedBytes = 0;

                res.on('data', (chunk) => {
                    receivedBytes += chunk.length;
                    if (totalBytes > 0 && global.setAppUpdateState) {
                        const pct = Math.round((receivedBytes / totalBytes) * 100);
                        global.setAppUpdateState({ status: 'downloading', progress: pct });
                    }
                });

                res.pipe(file);

                file.on('finish', () => {
                    file.close(() => {
                        console.log("[MarvidFlow Update] Téléchargement terminé. Lancement de l'installeur...");
                        if (global.setAppUpdateState) {
                            global.setAppUpdateState({ status: 'downloaded', progress: 100 });
                        }
                        
                        // Lancer l'installeur téléchargé et fermer l'app actuelle
                        try {
                            const installer = spawn(tempPath, [], { detached: true, stdio: 'ignore' });
                            installer.unref();
                            app.quit();
                        } catch (err) {
                            shell.openPath(tempPath);
                            app.quit();
                        }
                    });
                });
            }).on('error', (err) => {
                fs.unlink(tempPath, () => {});
                console.error('[MarvidFlow Update] Erreur téléchargement :', err);
                shell.openExternal(downloadUrl);
            });
        };

        downloadFile(downloadUrl);
    } else {
        // Redirection vers la page GitHub
        shell.openExternal(downloadUrl);
    }
};

function createWindow() {
    // Chemin de l'icône de l'application (Logo tête de robot rouge et blanc)
    const iconPath = path.join(__dirname, '01_Assets', 'Logos', 'autoframe_robot_logo.jpg');

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 1080,
        minHeight: 720,
        backgroundColor: '#050507',
        title: 'MarvidFlow Studio',
        icon: fs.existsSync(iconPath) ? iconPath : undefined,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        show: false
    });

    const startUrl = 'http://localhost:3000/09_Pages/home.html';
    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Vérification silencieuse de mise à jour 4 secondes après ouverture
        setTimeout(() => {
            if (global.triggerElectronUpdateCheck) {
                global.triggerElectronUpdateCheck();
            }
        }, 4000);
    });

    // Ouvre les liens externes (GitHub, LinkedIn, sites web) dans le vrai navigateur
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (!url.startsWith('http://localhost:3000')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Empêche plusieurs instances simultanées de l'application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
