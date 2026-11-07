const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ndara/.gemini/antigravity/brain/f364b63c-ad39-45fa-a997-a09cb113009f';

async function captureSceneSnapshots() {
    console.log('Launching browser to capture 4 scenes snapshots...');
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('http://localhost:3000/04_Videos/design_ai_phone_voice_10s.html', {
        waitUntil: 'networkidle0'
    });

    await page.waitForFunction(() => typeof window.renderAt === 'function');

    // 4 Scenes captures:
    // Scene 1 : 4.2s (AI Voice capsule + soundwave)
    // Scene 2 : 14.5s (Sienna Brooks Connected card)
    // Scene 3 : 24.5s (Apple Card is here aurora dark)
    // Scene 4 : 35.5s (3-Step Strategy glowing flowchart)
    const snapshots = [
        { time: 4.2, name: 'scene1_phone_ai_voice_4.2s.png' },
        { time: 14.8, name: 'scene2_sienna_member_card_14.8s.png' },
        { time: 24.5, name: 'scene3_apple_card_aurora_dark_24.5s.png' },
        { time: 35.5, name: 'scene4_strategy_glowing_flowchart_35.5s.png' }
    ];

    for (const snap of snapshots) {
        await page.evaluate((t) => window.renderAt(t), snap.time);
        await new Promise(r => setTimeout(r, 120));
        const outPath = path.join(ARTIFACT_DIR, snap.name);
        await page.screenshot({ path: outPath });
        console.log(`Saved ${snap.name}`);
    }

    await browser.close();
    console.log('All 4 scene verification snapshots captured successfully!');
}

captureSceneSnapshots().catch(err => {
    console.error(err);
    process.exit(1);
});
