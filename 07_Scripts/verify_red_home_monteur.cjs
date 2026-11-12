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

  // 1. Snapshot Home Page (No right buttons, red cards)
  console.log('Loading Home page ...');
  await page.goto('http://localhost:3000/09_Pages/home.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'home_clean_no_nav_red_cards.png') });
  console.log('Saved home_clean_no_nav_red_cards.png');

  // 2. Snapshot Monteur Page (100% Red theme)
  console.log('Loading Monteur page ...');
  await page.goto('http://localhost:3000/monteur', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_100pct_red_theme.png') });
  console.log('Saved monteur_100pct_red_theme.png');

  await browser.close();
  console.log('Verification finished!');
})();

