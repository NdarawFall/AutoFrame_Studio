const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ndara/.gemini/antigravity/brain/f364b63c-ad39-45fa-a997-a09cb113009f';

async function verifyTop10_16x9() {
    console.log('Launching browser to capture Top 10 Football 16:9 snapshots...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // 16:9 Horizontal viewport (1920 x 1080)
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('http://localhost:3000/04_Videos/top10_football_15s.html', {
        waitUntil: 'networkidle0'
    });

    await page.waitForFunction(() => typeof window.renderAt === 'function');
    // Laisser le temps au rendu initial et au chargement des images
    await new Promise(r => setTimeout(r, 600));

    const snapshots = [
        { time: 1.0, name: 'top10_16x9_01_intro_hook_1.0s.png' },
        { time: 3.0, name: 'top10_16x9_02_kane_10_3.0s.png' },
        { time: 6.0, name: 'top10_16x9_03_yamal_8_6.0s.png' },
        { time: 9.0, name: 'top10_16x9_04_mbappe_6_9.0s.png' },
        { time: 15.0, name: 'top10_16x9_05_vinicius_2_15.0s.png' },
        { time: 16.8, name: 'top10_16x9_06_rodri_1_ballon_dor_16.8s.png' }
    ];

    for (const snap of snapshots) {
        await page.evaluate((t) => window.renderAt(t), snap.time);
        await new Promise(r => setTimeout(r, 200));
        const outPath = path.join(ARTIFACT_DIR, snap.name);
        await page.screenshot({ path: outPath });
        console.log(`Saved ${snap.name}`);
    }

    await browser.close();
    console.log('All 16:9 Top 10 Football verification snapshots captured successfully!');
}

verifyTop10_16x9().catch(err => {
    console.error(err);
    process.exit(1);
});
