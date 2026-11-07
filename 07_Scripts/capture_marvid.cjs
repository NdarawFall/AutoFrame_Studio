const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1600,1000']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
  await page.goto('https://www.marvidflow.com', { waitUntil: 'networkidle2' });

  // Dismiss cookie banner
  try {
    const btns = await page.$$('button');
    for (const b of btns) {
      const txt = await page.evaluate(el => el.innerText, b);
      if (txt.includes('Accepter') || txt.includes('Refuser')) {
        await b.click();
        break;
      }
    }
  } catch(e){}

  await new Promise(r => setTimeout(r, 1200));

  const outDir = path.resolve('01_Assets/Images/marvidflow');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Clean hero screenshot
  await page.screenshot({ path: path.join(outDir, 'marvid_hero_clean.png') });
  console.log('Saved marvid_hero_clean.png');

  // 2. Scroll to pipeline section
  await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    const target = h2s.find(el => el.innerText.includes('8 étapes'));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'marvid_pipeline.png') });
  console.log('Saved marvid_pipeline.png');

  // 3. Scroll to dashboard section
  await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    const target = h2s.find(el => el.innerText.includes('tableau de bord') || el.innerText.includes('pilot'));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'marvid_dashboard.png') });
  console.log('Saved marvid_dashboard.png');

  // 4. Logo / SVG extraction
  const navData = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('header svg, nav svg, .logo svg')).map(s => s.outerHTML);
    const logoImg = Array.from(document.querySelectorAll('header img, nav img')).map(i => i.src);
    return { svgs, logoImg };
  });
  fs.writeFileSync(path.join(outDir, 'branding.json'), JSON.stringify(navData, null, 2));

  await browser.close();
  console.log('Done capturing marvidflow!');
})();

