const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ndara/.gemini/antigravity/brain/f364b63c-ad39-45fa-a997-a09cb113009f';

async function verifyGrowkaw() {
    console.log('Launching browser to capture Growkaw 20s snapshots...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // 9:16 Vertical viewport
    await page.setViewport({ width: 1080, height: 1920 });

    await page.goto('http://localhost:3000/04_Videos/growkaw_motivation_20s.html', {
        waitUntil: 'networkidle0'
    });

    await page.waitForFunction(() => typeof window.renderAt === 'function');

    // 4 snapshots à des moments clés :
    // 1. t = 1.0s : "CHAQUE MATIN, TU AS DEUX CHOIX"
    // 2. t = 5.2s : "OU BÂTIR TA VIE"
    // 3. t = 7.8s : "LA DISCIPLINE SILENCIEUSE BAT LE TALENT"
    // 4. t = 16.8s : "FAIS LE PREMIER PAS MAINTENANT"
    const snapshots = [
        { time: 1.1, name: 'growkaw_01_chaque_matin_1.1s.png' },
        { time: 5.3, name: 'growkaw_02_batir_ta_vie_5.3s.png' },
        { time: 7.9, name: 'growkaw_03_discipline_silencieuse_7.9s.png' },
        { time: 16.8, name: 'growkaw_04_premier_pas_16.8s.png' }
    ];

    for (const snap of snapshots) {
        await page.evaluate((t) => window.renderAt(t), snap.time);
        await new Promise(r => setTimeout(r, 120));
        const outPath = path.join(ARTIFACT_DIR, snap.name);
        await page.screenshot({ path: outPath });
        console.log(`Saved ${snap.name}`);
    }

    await browser.close();
    console.log('All Growkaw verification snapshots captured successfully!');
}

verifyGrowkaw().catch(err => {
    console.error(err);
    process.exit(1);
});

