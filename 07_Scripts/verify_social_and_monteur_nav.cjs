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

  // 1. Snapshot Home Page with GitHub & LinkedIn icons on navbar right
  console.log('Loading Home page...');
  await page.goto('http://localhost:3000/09_Pages/home.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'home_with_social_nav_icons.png') });
  console.log('Saved home_with_social_nav_icons.png');

  // Also take close-up screenshot of the header
  const headerElem = await page.$('header.top-nav');
  if (headerElem) {
    await headerElem.screenshot({ path: path.join(artifactDir, 'home_header_closeup.png') });
    console.log('Saved home_header_closeup.png');
  }

  // 2. Snapshot Monteur Page with matching channels navbar (without chaines)
  console.log('Loading Monteur page...');
  await page.goto('http://localhost:3000/monteur', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(artifactDir, 'monteur_channels_style_navbar.png') });
  console.log('Saved monteur_channels_style_navbar.png');

  const monteurHeader = await page.$('header.top-nav');
  if (monteurHeader) {
    await monteurHeader.screenshot({ path: path.join(artifactDir, 'monteur_header_closeup.png') });
    console.log('Saved monteur_header_closeup.png');
  }

  // 3. Snapshot Channels Page for comparison
  console.log('Loading Channels page...');
  await page.goto('http://localhost:3000/09_Pages/channels.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  const channelsHeader = await page.$('header.top-nav');
  if (channelsHeader) {
    await channelsHeader.screenshot({ path: path.join(artifactDir, 'channels_header_comparison.png') });
    console.log('Saved channels_header_comparison.png');
  }

  await browser.close();
  console.log('Verification successfully completed!');
})();
