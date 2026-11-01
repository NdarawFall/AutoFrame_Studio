const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

function getChromePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) return p;
    }
    return null;
}

async function generateVoxThumbnail() {
    const chromePath = getChromePath();
    if (!chromePath) throw new Error('No Chrome/Edge found');

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 400, deviceScaleFactor: 2 });

    // HTML design for Vox Style:
    // Cream/white textured newsprint paper, newspaper columns, torn paper cutout photo of a figure,
    // vibrant yellow highlighter tape, red investigation arrow and "VOX INVESTIGATION" stamp.
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 720px;
            height: 400px;
            background: #f4efe6;
            font-family: 'Georgia', serif;
            overflow: hidden;
            position: relative;
            background-image: 
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(235, 227, 214, 0.95) 100%),
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px);
        }

        /* Subtle paper fiber & halftone grain texture */
        .paper-grain {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(#000000 0.75px, transparent 0.75px);
            background-size: 8px 8px;
            opacity: 0.08;
            pointer-events: none;
        }

        /* Newspaper Columns in background */
        .news-bg {
            position: absolute;
            top: 20px;
            left: 24px;
            right: 24px;
            height: 360px;
            display: flex;
            gap: 20px;
            opacity: 0.35;
            filter: contrast(110%);
        }

        .news-col {
            flex: 1;
            font-size: 8px;
            line-height: 1.45;
            color: #222;
            text-align: justify;
        }

        .news-headline {
            font-family: 'Impact', sans-serif;
            font-size: 28px;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: #111;
            margin-bottom: 10px;
            line-height: 0.95;
            border-bottom: 2px solid #111;
            padding-bottom: 6px;
        }

        /* Torn paper photo cutout on the right */
        .torn-photo-wrap {
            position: absolute;
            right: 40px;
            top: 35px;
            width: 250px;
            height: 320px;
            filter: drop-shadow(0 14px 25px rgba(0,0,0,0.35));
            transform: rotate(2.5deg);
        }

        /* Torn jagged edge effect */
        .torn-paper {
            width: 100%;
            height: 100%;
            background: #ffffff;
            padding: 10px 10px 18px 10px;
            clip-path: polygon(
                2% 0%, 15% 1.5%, 28% 0%, 42% 1.2%, 58% 0.3%, 72% 1.8%, 85% 0%, 98% 1.5%,
                100% 12%, 98.5% 26%, 100% 41%, 98.8% 57%, 100% 73%, 98.2% 88%, 100% 100%,
                87% 98.5%, 71% 100%, 55% 98.2%, 41% 100%, 26% 98.6%, 12% 100%, 0% 98.8%,
                1.5% 86%, 0% 71%, 1.8% 56%, 0.3% 40%, 1.6% 25%, 0% 10%
            );
            border: 1px solid rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
        }

        .torn-inner-img {
            flex: 1;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Halftone portrait silhouette */
        .portrait-svg {
            width: 170px;
            height: 220px;
            fill: #e2e8f0;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        }

        .tape-strip {
            position: absolute;
            top: -12px;
            left: 35%;
            width: 80px;
            height: 26px;
            background: rgba(254, 240, 138, 0.65);
            backdrop-filter: blur(2px);
            border-left: 2px dashed rgba(200, 180, 50, 0.5);
            border-right: 2px dashed rgba(200, 180, 50, 0.5);
            transform: rotate(-6deg);
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            z-index: 10;
        }

        /* Yellow Highlighter Strips */
        .highlight-bar {
            position: absolute;
            left: 36px;
            top: 135px;
            width: 320px;
            height: 38px;
            background: rgba(254, 240, 138, 0.92);
            mix-blend-mode: multiply;
            transform: rotate(-1.5deg) skewX(-4deg);
            box-shadow: 0 1px 3px rgba(234, 179, 8, 0.4);
            border-radius: 2px;
        }

        .highlight-bar-2 {
            position: absolute;
            left: 38px;
            top: 182px;
            width: 250px;
            height: 36px;
            background: rgba(254, 240, 138, 0.88);
            mix-blend-mode: multiply;
            transform: rotate(0.8deg);
            border-radius: 2px;
        }

        .highlight-text-1 {
            position: absolute;
            left: 45px;
            top: 137px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 22px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: #0f172a;
            z-index: 5;
        }

        .highlight-text-2 {
            position: absolute;
            left: 48px;
            top: 185px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: #0f172a;
            z-index: 5;
        }

        /* Hand-drawn Red Arrow & Circle */
        .red-arrow {
            position: absolute;
            left: 285px;
            top: 175px;
            z-index: 8;
            filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
        }

        /* Red Archival Stamp */
        .stamp-box {
            position: absolute;
            left: 42px;
            bottom: 35px;
            border: 3.5px solid #dc2626;
            color: #dc2626;
            font-family: 'Impact', sans-serif;
            font-size: 20px;
            letter-spacing: 2px;
            padding: 4px 14px;
            text-transform: uppercase;
            transform: rotate(-4deg);
            mask-image: radial-gradient(circle, rgba(0,0,0,1) 75%, rgba(0,0,0,0.6) 100%);
            opacity: 0.9;
        }

        /* Vox brand tag badge */
        .vox-badge {
            position: absolute;
            top: 25px;
            left: 36px;
            background: #ffe600;
            color: #000;
            font-family: 'Impact', sans-serif;
            font-size: 15px;
            letter-spacing: 1px;
            padding: 4px 12px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 2px 3px 0px #000;
            border: 1.5px solid #000;
            transform: rotate(-1deg);
        }
    </style>
    </head>
    <body>
        <div class="paper-grain"></div>

        <!-- Newsprint background -->
        <div class="news-bg">
            <div class="news-col">
                <div class="news-headline">THE INVESTIGATION</div>
                <p>Documents reveal unprecedented shifts in global geopolitical maps. Archival records from the 1960s declassified yesterday indicate that early strategic planning depended heavily on visual evidence and cartographic intelligence.</p>
                <p style="margin-top: 8px;">Analysis of secondary sources confirms the timeline established by international observers during the peak conflict years.</p>
            </div>
            <div class="news-col" style="display: none;"></div>
        </div>

        <!-- Vox Yellow Badge -->
        <div class="vox-badge">
            <span>VOX DOCUMENTARY</span>
        </div>

        <!-- Yellow highlighter bars & bold text -->
        <div class="highlight-bar"></div>
        <span class="highlight-text-1">DECLASSIFIED ARCHIVES</span>

        <div class="highlight-bar-2"></div>
        <span class="highlight-text-2">SECRET EVIDENCE FOUND</span>

        <!-- Hand-drawn red arrow pointing to cutout -->
        <svg class="red-arrow" width="85" height="65" viewBox="0 0 100 80" fill="none" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 10 50 Q 50 15 85 45" />
            <path d="M 68 35 L 85 45 L 80 62" />
        </svg>

        <!-- Red Forensic Stamp -->
        <div class="stamp-box">
            CONFIDENTIAL • DOSSIER
        </div>

        <!-- Torn photo collage -->
        <div class="torn-photo-wrap">
            <div class="tape-strip"></div>
            <div class="torn-paper">
                <div class="torn-inner-img">
                    <!-- Halftone silhouette portrait of historic figure with monocle / glasses -->
                    <svg class="portrait-svg" viewBox="0 0 200 240">
                        <defs>
                            <pattern id="halftone" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                                <circle cx="3" cy="3" r="1.8" fill="#94a3b8" />
                            </pattern>
                        </defs>
                        <!-- Head silhouette -->
                        <path d="M 60 230 C 60 180 70 160 80 150 C 65 140 55 120 55 95 C 55 50 85 20 120 20 C 155 20 180 50 180 95 C 180 120 170 140 155 150 C 165 160 175 180 175 230 Z" fill="#334155" />
                        <circle cx="120" cy="85" r="45" fill="url(#halftone)" />
                        <!-- Glasses / Eyes -->
                        <circle cx="102" cy="85" r="14" fill="none" stroke="#ffe600" stroke-width="4.5" />
                        <circle cx="138" cy="85" r="14" fill="none" stroke="#ffe600" stroke-width="4.5" />
                        <line x1="116" y1="85" x2="124" y2="85" stroke="#ffe600" stroke-width="4.5" />
                        <!-- Red pin tape on photo -->
                        <circle cx="120" cy="32" r="6" fill="#dc2626" />
                    </svg>
                </div>
                <div style="font-family:'Courier New',monospace; font-size:9.5px; font-weight:700; color:#333; margin-top:6px; letter-spacing:0.5px; text-align:center;">
                    DOC_REF #8942-B (1962)
                </div>
            </div>
        </div>

    </body>
    </html>
    `;

    await page.setContent(html);
    const dest = path.join(__dirname, '..', '01_Assets', 'Images', 'styles', 'style_story_vox.jpg');
    await page.screenshot({ path: dest, quality: 92, type: 'jpeg' });
    await browser.close();
    console.log('Successfully generated style_story_vox.jpg! Size:', fs.statSync(dest).size, 'bytes');
}

generateVoxThumbnail().catch(err => {
    console.error('Error generating vox thumb:', err);
    process.exit(1);
});

