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

  console.log('Loading AI Phone Voice Video...');
  await page.goto('http://localhost:3000/04_Videos/design_ai_phone_voice_10s.html', { waitUntil: 'networkidle2' });

  // 1. Snapshot at t = 1.8s (Arrival of phone, full screen UI)
  await page.evaluate(() => window.renderAt(1.8));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'phone_01_full_device_arrival_1.8s.png') });
  console.log('Saved phone_01_full_device_arrival_1.8s.png');

  // 2. Snapshot at t = 2.8s (Zoom in & user tapping audio icon)
  await page.evaluate(() => window.renderAt(2.8));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'phone_02_zoom_audio_tap_2.8s.png') });
  console.log('Saved phone_02_zoom_audio_tap_2.8s.png');

  // 3. Snapshot at t = 4.2s (Compact centered voice capsule speaking state)
  await page.evaluate(() => window.renderAt(4.2));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'phone_03_compact_voice_capsule_4.2s.png') });
  console.log('Saved phone_03_compact_voice_capsule_4.2s.png');

  // 4. Snapshot at t = 8.5s (Dezoom, user question and AI response card)
  await page.evaluate(() => window.renderAt(8.5));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'phone_04_dezoom_ai_result_card_8.5s.png') });
  console.log('Saved phone_04_dezoom_ai_result_card_8.5s.png');

  await browser.close();
  console.log('All verification snapshots captured successfully!');
})();

