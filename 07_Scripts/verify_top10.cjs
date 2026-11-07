const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ndara/.gemini/antigravity/brain/f364b63c-ad39-45fa-a997-a09cb113009f';

async function verifyTop10() {
    console.log('Launching browser to capture Top 10 Football 15s snapshots...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // 9:16 Vertical viewport
    await page.setViewport({ width: 1080, height: 1920 });

    await page.goto('http://localhost:3000/04_Videos/top10_football_15s.html', {
        waitUntil: 'networkidle0'
    });

    await page.waitForFunction(() => typeof window.renderAt === 'function');
    // Laisser un petit temps pour que les images se décodent
    await new Promise(r => setTimeout(r, 600));

    const snapshots = [
        { time: 0.6, name: 'top10_01_intro_hook_0.6s.png' },
        { time: 3.1, name: 'top10_02_ronaldo_al_nassr_3.1s.png' },
        { time: 7.9, name: 'top10_03_kane_bayern_7.9s.png' },
        { time: 12.5, name: 'top10_04_mbappe_real_madrid_12.5s.png' },
        { time: 14.1, name: 'top10_05_vinicius_n1_champion_14.1s.png' }
    ];

    for (const snap of snapshots) {
        await page.evaluate((t) => window.renderAt(t), snap.time);
        await new Promise(r => setTimeout(r, 200));
        const outPath = path.join(ARTIFACT_DIR, snap.name);
        await page.screenshot({ path: outPath });
        console.log(`Saved ${snap.name}`);
    }

    await browser.close();
    console.log('All Top 10 Football verification snapshots captured successfully!');
}

verifyTop10().catch(err => {
    console.error(err);
    process.exit(1);
});

