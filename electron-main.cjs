const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}/09_Pages/home.html`;

// Vérifie si le serveur interne répond déjà sur le port 3000
function isServerRunning(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/files`, (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(800, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Démarre automatiquement le serveur interne si nécessaire
async function ensureServerRunning() {
    const alreadyRunning = await isServerRunning(SERVER_PORT);
    if (alreadyRunning) {
        console.log('[Electron] Serveur local déjà actif sur le port', SERVER_PORT);
        return;
    }

    console.log('[Electron] Lancement automatique du serveur VibeEditor...');
    const serverScript = path.join(__dirname, '07_Scripts', 'studio-server.cjs');
    const userDataPath = app.getPath('userData');
    console.log('[Electron] Dossier de configuration utilisateur :', userDataPath);
    
    // On lance le serveur interne avec transmission du dossier de configuration sécurisé
    serverProcess = spawn(process.execPath, [serverScript], {
        cwd: __dirname,
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            VIBE_USER_DATA: userDataPath,
            IS_ELECTRON: 'true'
        },
        stdio: 'inherit'
    });

    serverProcess.on('error', (err) => {
        console.error('[Electron] Erreur serveur :', err);
    });

    // Attente que le serveur soit prêt (max 6 secondes)
    let attempts = 0;
    while (attempts < 30) {
        await new Promise(r => setTimeout(r, 200));
        if (await isServerRunning(SERVER_PORT)) {
            console.log('[Electron] Serveur prêt et connecté !');
            return;
        }
        attempts++;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1420,
        height: 920,
        minWidth: 1040,
        minHeight: 680,
        backgroundColor: '#000000',
        title: 'VibeEditor 1.0 — Motion Design & Video Engine',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadURL(SERVER_URL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await ensureServerRunning();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        try {
            serverProcess.kill();
        } catch (e) {}
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (serverProcess) {
        try {
            serverProcess.kill();
        } catch (e) {}
    }
});
