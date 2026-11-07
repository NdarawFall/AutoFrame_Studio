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

  const url = 'http://localhost:3000/09_Pages/studio.html?video=marvidflow_saas_showcase.html';
  console.log('Loading Studio URL:', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2000));

  // Hit Space key to trigger play
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = 'C:\\Users\\ndara\\.gemini\\antigravity\\brain\\f364b63c-ad39-45fa-a997-a09cb113009f';
  await page.screenshot({ path: path.join(artifactDir, 'marvid_studio_playback_verified.png') });
  console.log('Saved marvid_studio_playback_verified.png');

  await browser.close();
})();

