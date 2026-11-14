/**
 * ELECTRON-MAIN.CJS — Point d'entrée de l'application de bureau Windows AutoFrame
 * Démarre le serveur local en arrière-plan, gère la fenêtre native et les mises à jour automatiques via GitHub Releases.
 */
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Indique au serveur studio-server qu'il s'exécute dans Electron (évite d'ouvrir le navigateur externe)
process.env.IS_ELECTRON = '1';

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

// Configuration de l'auto-updater (GitHub Releases)
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Écouteurs de mise à jour pour notifier le frontend via l'état global
autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Vérification des mises à jour sur GitHub...');
    if (global.setAppUpdateState) {
        global.setAppUpdateState({ status: 'checking', progress: 0, error: null });
    }
});

autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Mise à jour disponible :', info.version);
    if (global.setAppUpdateState) {
        global.setAppUpdateState({
            status: 'available',
            latestVersion: info.version,
            releaseNotes: info.releaseNotes || '',
            progress: 0
        });
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Application à jour.');
    if (global.setAppUpdateState) {
        global.setAppUpdateState({
            status: 'up-to-date',
            latestVersion: info ? info.version : app.getVersion(),
            progress: 100
        });
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent || 0);
    console.log(`[AutoUpdater] Téléchargement : ${percent}%`);
    if (global.setAppUpdateState) {
        global.setAppUpdateState({
            status: 'downloading',
            progress: percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total
        });
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Mise à jour téléchargée prête à installer :', info.version);
    if (global.setAppUpdateState) {
        global.setAppUpdateState({
            status: 'downloaded',
            latestVersion: info.version,
            progress: 100
        });
    }
});

autoUpdater.on('error', (err) => {
    console.log('[AutoUpdater] Info / Note :', err ? err.message : 'Notice');
    if (global.setAppUpdateState) {
        global.setAppUpdateState({
            status: 'error',
            error: err ? err.message : 'Erreur'
        });
    }
});

// Fonctions exposées au serveur local pour répondre aux requêtes HTTP de l'interface
global.triggerElectronUpdateCheck = () => {
    if (app.isPackaged) {
        autoUpdater.checkForUpdates().catch(err => {
            console.log('[AutoUpdater] Check :', err.message);
        });
    } else {
        console.log('[AutoUpdater Dev Mode] Vérification simulée');
        autoUpdater.checkForUpdates().catch(err => {
            console.log('[AutoUpdater Dev Mode Note] Pas de release packagée en local :', err.message);
        });
    }
};

global.triggerElectronInstallUpdate = () => {
    console.log('[AutoUpdater] Redémarrage pour installation de la mise à jour...');
    autoUpdater.quitAndInstall(false, true);
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 1080,
        minHeight: 720,
        backgroundColor: '#050507',
        title: 'AutoFrame 1.0',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        show: false
    });

    const startUrl = 'http://localhost:3000/09_Pages/home.html';

    // Chargement de la page d'accueil de l'application
    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Vérification automatique en tâche de fond après démarrage
        setTimeout(() => {
            if (global.triggerElectronUpdateCheck) {
                global.triggerElectronUpdateCheck();
            }
        }, 5000);
    });

    // Ouvre les liens externes (GitHub, LinkedIn, sites web) dans le navigateur par défaut
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
