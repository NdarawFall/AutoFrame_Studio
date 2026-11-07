const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const artifactDir = 'C:\\Users\\ndara\\.gemini\\antigravity\\brain\\f364b63c-ad39-45fa-a997-a09cb113009f';

  // 1. Direct page render verification at different timestamps
  const fileUrl = 'http://localhost:3000/04_Videos/design_wallet_card_5s.html';
  console.log('Loading video directly:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.fonts.ready);

  // Snapshot at t = 2.0s (Wallet scene with grid and rotating stars)
  await page.evaluate(() => window.renderAt(2.0));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(artifactDir, 'grid_stars_01_wallet_2s.png') });
  console.log('Saved grid_stars_01_wallet_2s.png');

  // Snapshot at t = 4.8s (Camera swoop travelling)
  await page.evaluate(() => window.renderAt(4.8));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(artifactDir, 'grid_stars_02_travelling_4.8s.png') });
  console.log('Saved grid_stars_02_travelling_4.8s.png');

  // Snapshot at t = 7.2s (Scene 2 Publish)
  await page.evaluate(() => window.renderAt(7.2));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(artifactDir, 'grid_stars_03_scene2_7.2s.png') });
  console.log('Saved grid_stars_03_scene2_7.2s.png');

  // 2. Studio player verification
  const studioUrl = 'http://localhost:3000/09_Pages/studio.html?video=design_wallet_card_5s.html';
  console.log('Loading Studio:', studioUrl);
  await page.goto(studioUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    const v = window.__currentVideo;
    if (v && v.seek) v.seek(2.5);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'grid_stars_studio_verified.png') });
  console.log('Saved grid_stars_studio_verified.png');

  await browser.close();
  console.log('Verification complete!');
})();

