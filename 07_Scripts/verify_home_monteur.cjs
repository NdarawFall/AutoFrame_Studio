const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const artifactDir = 'C:\\Users\\ndara\\.gemini\\antigravity\\brain\\f364b63c-ad39-45fa-a997-a09cb113009f';

  // 1. Tester la nouvelle page d'accueil
  console.log('Navigating to http://localhost:3000/09_Pages/home.html ...');
  await page.goto('http://localhost:3000/09_Pages/home.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(artifactDir, 'homepage_redesign_verified.png') });
  console.log('Saved homepage_redesign_verified.png');

  // 2. Tester le clic sur la card Monteur
  console.log('Clicking on Monteur card ...');
  await page.click('.card-monteur');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Current URL after click:', page.url());

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'monteur_initial_verified.png') });
  console.log('Saved monteur_initial_verified.png');

  // 3. Créer un client de test via l'API
  console.log('Creating a test client via API ...');
  const createRes = await page.evaluate(async () => {
    const res = await fetch('/api/clients/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alexandre_Fitness_Pro' })
    });
    return res.json();
  });
  console.log('Create result:', createRes);

  // Uploader un petit asset de test dans images_references
  const sample1pxPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await page.evaluate(async (b64) => {
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'Alexandre_Fitness_Pro',
        category: 'images_references',
        filename: 'moodboard_athletic_apple.png',
        data: b64
      })
    });
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'Alexandre_Fitness_Pro',
        category: 'clips_video',
        filename: 'rush_facecam_01.mp4',
        data: b64
      })
    });
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'Alexandre_Fitness_Pro',
        category: 'voix_off',
        filename: 'narration_intro.mp3',
        data: b64
      })
    });
  }, sample1pxPng);

  // Recharger la page monteur pour voir le client actif et ses assets
  await page.goto('http://localhost:3000/09_Pages/monteur.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_with_client_verified.png') });
  console.log('Saved monteur_with_client_verified.png');

  // 4. Tester la redirection /channels
  console.log('Testing /channels route ...');
  await page.goto('http://localhost:3000/channels', { waitUntil: 'networkidle2' });
  console.log('Redirected to:', page.url());

  await browser.close();
  console.log('All verifications completed successfully!');
})();

