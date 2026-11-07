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

  // 1. Ouvrir la page monteur vide (zéro template)
  console.log('Navigating to http://localhost:3000/monteur ...');
  await page.goto('http://localhost:3000/monteur', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_clean_empty.png') });
  console.log('Saved monteur_clean_empty.png');

  // 2. Créer un client réel
  console.log('Creating client via API ...');
  const clientName = 'Client_Test_Redesign';
  await page.evaluate(async (name) => {
    await fetch('/api/clients/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  }, clientName);

  // Uploader un asset dans images_references, effets_sonores et images_illustrations
  const sample1pxPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await page.evaluate(async ({ client, b64 }) => {
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'images_references',
        filename: 'palette_moodboard.png',
        data: b64
      })
    });
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'effets_sonores',
        filename: 'whoosh_cinematic_fast.mp3',
        data: b64
      })
    });
    await fetch('/api/clients/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client,
        category: 'images_illustrations',
        filename: 'sticker_verified_badge.png',
        data: b64
      })
    });
  }, { client: clientName, b64: sample1pxPng });

  // Recharger pour voir le workspace avec le client
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_compact_separated_verified.png') });
  console.log('Saved monteur_compact_separated_verified.png');

  // Nettoyer le client de test après vérification pour que la page reste propre
  await page.evaluate(async (name) => {
    await fetch('/api/clients/delete-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: name })
    });
  }, clientName);
  console.log('Cleaned up test client from disk');

  await browser.close();
  console.log('All verifications finished!');
})();

