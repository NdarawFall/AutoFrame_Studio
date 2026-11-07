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

  // 1. Aller sur http://localhost:3000/monteur (vérifie la redirection)
  console.log('Navigating to http://localhost:3000/monteur ...');
  await page.goto('http://localhost:3000/monteur', { waitUntil: 'networkidle2' });
  console.log('Page loaded URL:', page.url());

  // 2. Créer un client de test "Alexandre_Fit_Agency"
  const clientName = 'Alexandre_Fit_Agency';
  console.log('Creating client:', clientName);
  
  const createRes = await page.evaluate(async (name) => {
    const res = await fetch('/api/clients/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  }, clientName);
  console.log('Create client response:', createRes);

  // 3. Uploader des assets dans les 5 catégories
  const sample1pxPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  
  await page.evaluate(async ({ client, b64 }) => {
    // 1. images_references
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'images_references',
        filename: 'moodboard_athletic_apple.png',
        data: b64
      })
    });
    // 2. videos_references
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'videos_references',
        filename: 'reference_rythme_short.mp4',
        data: b64
      })
    });
    // 3. clips_video
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'clips_video',
        filename: 'rush_facecam_4k_01.mp4',
        data: b64
      })
    });
    // 4. voix_off
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'voix_off',
        filename: 'narration_voix_off_pro.mp3',
        data: b64
      })
    });
    // 5. musiques
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'musiques',
        filename: 'bgm_cinematic_pulse.mp3',
        data: b64
      })
    });
  }, { client: clientName, b64: sample1pxPng });

  // Recharger la page pour voir le rendu complet du client sélectionné
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_workspace_verified.png') });
  console.log('Saved monteur_workspace_verified.png');

  // Vérifier sur le disque les dossiers créés
  const clientDiskPath = path.join(__dirname, '..', 'Clients', clientName);
  console.log('Checking disk folder:', clientDiskPath);
  const subfolders = fs.readdirSync(clientDiskPath);
  console.log('Subfolders on disk:', subfolders);

  await browser.close();
  console.log('Monteur verification done!');
})();

