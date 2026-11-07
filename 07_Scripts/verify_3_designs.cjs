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

  // 1. Verify Design 1 - Ask Anything Pill
  console.log('Loading Design 1: Ask Anything Pill...');
  await page.goto('http://localhost:3000/04_Videos/design_ask_anything_pill_5s.html', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.renderAt(2.2));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'design1_ask_anything_pill_verified.png') });
  console.log('Saved design1_ask_anything_pill_verified.png');

  // 2. Verify Design 2 - Terence Howard Music Player
  console.log('Loading Design 2: Terence Howard Music Player...');
  await page.goto('http://localhost:3000/04_Videos/design_terence_music_player_5s.html', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.renderAt(2.6));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'design2_terence_music_player_verified.png') });
  console.log('Saved design2_terence_music_player_verified.png');

  // 3. Verify Design 3 - Travel Cards Carousel
  console.log('Loading Design 3: Travel Cards Carousel...');
  await page.goto('http://localhost:3000/04_Videos/design_travel_cards_carousel_5s.html', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.renderAt(2.2));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'design3_travel_cards_carousel_verified.png') });
  console.log('Saved design3_travel_cards_carousel_verified.png');

  await browser.close();
  console.log('All 3 designs verified and snapshotted successfully!');
})();
