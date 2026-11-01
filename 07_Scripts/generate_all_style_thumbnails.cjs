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

const STYLES_SPECS = [
    // 1. STORY VOX STYLE
    {
        filename: 'style_story_vox.jpg',
        name: 'Story Vox Style',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #f5f0e6;
                font-family: 'Georgia', serif; overflow: hidden; position: relative;
                background-image: 
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(230,222,208,0.95) 100%),
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px);
            }
            .paper-grain {
                position: absolute; inset: 0;
                background-image: radial-gradient(#000000 0.75px, transparent 0.75px);
                background-size: 8px 8px; opacity: 0.08; pointer-events: none;
            }
            .news-bg {
                position: absolute; top: 20px; left: 24px; right: 24px; height: 360px;
                display: flex; gap: 20px; opacity: 0.38; filter: contrast(110%);
            }
            .news-col { flex: 1; font-size: 8px; line-height: 1.45; color: #111; text-align: justify; }
            .news-headline {
                font-family: 'Impact', sans-serif; font-size: 32px; text-transform: uppercase;
                color: #111; margin-bottom: 8px; line-height: 0.95; border-bottom: 2.5px solid #111; padding-bottom: 5px;
            }
            .vox-badge {
                position: absolute; top: 22px; left: 32px; background: #ffe600; color: #000;
                font-family: 'Impact', sans-serif; font-size: 15px; letter-spacing: 1px;
                padding: 4px 12px; box-shadow: 3px 3px 0px #000; border: 1.5px solid #000; transform: rotate(-1deg);
            }
            .highlight-bar {
                position: absolute; left: 32px; top: 130px; width: 330px; height: 42px;
                background: #ffea00; mix-blend-mode: multiply; transform: rotate(-1.5deg) skewX(-4deg);
                box-shadow: 0 1px 3px rgba(234, 179, 8, 0.4); border-radius: 2px;
            }
            .highlight-bar-2 {
                position: absolute; left: 34px; top: 182px; width: 260px; height: 38px;
                background: #ffea00; mix-blend-mode: multiply; transform: rotate(0.8deg); border-radius: 2px;
            }
            .highlight-text-1 {
                position: absolute; left: 40px; top: 134px; font-family: 'Arial Black', sans-serif;
                font-size: 24px; text-transform: uppercase; color: #000; z-index: 5;
            }
            .highlight-text-2 {
                position: absolute; left: 42px; top: 185px; font-family: 'Arial Black', sans-serif;
                font-size: 21px; text-transform: uppercase; color: #000; z-index: 5;
            }
            .red-arrow { position: absolute; left: 285px; top: 175px; z-index: 8; filter: drop-shadow(0 2px 4px rgba(220,38,38,0.3)); }
            .stamp-box {
                position: absolute; left: 36px; bottom: 32px; border: 3.5px solid #dc2626; color: #dc2626;
                font-family: 'Impact', sans-serif; font-size: 21px; letter-spacing: 2px; padding: 4px 14px;
                text-transform: uppercase; transform: rotate(-4deg); opacity: 0.9;
            }
            .torn-photo-wrap {
                position: absolute; right: 35px; top: 30px; width: 260px; height: 335px;
                filter: drop-shadow(0 14px 25px rgba(0,0,0,0.35)); transform: rotate(2.5deg);
            }
            .torn-paper {
                width: 100%; height: 100%; background: #ffffff; padding: 10px 10px 18px 10px;
                clip-path: polygon(
                    2% 0%, 15% 1.5%, 28% 0%, 42% 1.2%, 58% 0.3%, 72% 1.8%, 85% 0%, 98% 1.5%,
                    100% 12%, 98.5% 26%, 100% 41%, 98.8% 57%, 100% 73%, 98.2% 88%, 100% 100%,
                    87% 98.5%, 71% 100%, 55% 98.2%, 41% 100%, 26% 98.6%, 12% 100%, 0% 98.8%,
                    1.5% 86%, 0% 71%, 1.8% 56%, 0.3% 40%, 1.6% 25%, 0% 10%
                );
                border: 1px solid rgba(0,0,0,0.15); display: flex; flex-direction: column;
            }
            .torn-inner-img {
                flex: 1; background: linear-gradient(135deg, #1e293b, #0f172a);
                position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
            }
            .tape-strip {
                position: absolute; top: -12px; left: 35%; width: 85px; height: 26px;
                background: rgba(254, 240, 138, 0.7); backdrop-filter: blur(2px);
                border-left: 2px dashed rgba(200, 180, 50, 0.5); border-right: 2px dashed rgba(200, 180, 50, 0.5);
                transform: rotate(-6deg); box-shadow: 0 2px 6px rgba(0,0,0,0.12); z-index: 10;
            }
        </style></head>
        <body>
            <div class="paper-grain"></div>
            <div class="news-bg">
                <div class="news-col">
                    <div class="news-headline">THE INVESTIGATION</div>
                    <p>Declassified archives from the 1960s indicate strategic planning depended heavily on visual cartographic intelligence and secondary source confirmation.</p>
                </div>
            </div>
            <div class="vox-badge">VOX DOCUMENTARY</div>
            <div class="highlight-bar"></div>
            <span class="highlight-text-1">DECLASSIFIED ARCHIVES</span>
            <div class="highlight-bar-2"></div>
            <span class="highlight-text-2">SECRET EVIDENCE FOUND</span>
            <svg class="red-arrow" width="85" height="65" viewBox="0 0 100 80" fill="none" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 10 50 Q 50 15 85 45" /><path d="M 68 35 L 85 45 L 80 62" />
            </svg>
            <div class="stamp-box">CONFIDENTIAL • DOSSIER</div>
            <div class="torn-photo-wrap">
                <div class="tape-strip"></div>
                <div class="torn-paper">
                    <div class="torn-inner-img">
                        <svg width="180" height="230" viewBox="0 0 200 240">
                            <defs><pattern id="ht" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.8" fill="#94a3b8"/></pattern></defs>
                            <path d="M 60 230 C 60 180 70 160 80 150 C 65 140 55 120 55 95 C 55 50 85 20 120 20 C 155 20 180 50 180 95 C 180 120 170 140 155 150 C 165 160 175 180 175 230 Z" fill="#334155" />
                            <circle cx="120" cy="85" r="45" fill="url(#ht)" />
                            <circle cx="102" cy="85" r="14" fill="none" stroke="#ffe600" stroke-width="4.5" />
                            <circle cx="138" cy="85" r="14" fill="none" stroke="#ffe600" stroke-width="4.5" />
                            <line x1="116" y1="85" x2="124" y2="85" stroke="#ffe600" stroke-width="4.5" />
                            <circle cx="120" cy="32" r="6" fill="#dc2626" />
                        </svg>
                    </div>
                    <div style="font-family:'Courier New',monospace; font-size:10px; font-weight:700; color:#333; margin-top:6px; letter-spacing:0.5px; text-align:center;">
                        DOC_REF #8942-B (1962)
                    </div>
                </div>
            </div>
        </body></html>
        `
    },

    // 2. STIKMAN HISTORY (OverSimplified / Sam O'Nella animated history)
    {
        filename: 'style_stikman_history.jpg',
        name: 'Stikman History',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px;
                background: #fbf5e8;
                background-image: 
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(230,215,190,0.95) 100%),
                    radial-gradient(#c2b59b 1px, transparent 1px);
                background-size: 100% 100%, 16px 16px;
                font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
                overflow: hidden; position: relative;
            }
            .title-banner {
                position: absolute; top: 18px; left: 32px; background: #ffffff; border: 3px solid #111;
                border-radius: 8px; padding: 6px 18px; box-shadow: 4px 5px 0px #111; transform: rotate(-2deg);
            }
            .title-text { font-size: 20px; font-weight: 900; color: #111; letter-spacing: 0.5px; }
            .speech-bubble {
                position: absolute; left: 40px; top: 110px; background: #ffffff; border: 3.5px solid #111;
                border-radius: 18px; padding: 12px 20px; max-width: 280px; box-shadow: 4px 5px 0px #111;
                font-size: 19px; font-weight: 800; color: #111; line-height: 1.25; transform: rotate(1deg);
            }
            .speech-bubble::after {
                content: ''; position: absolute; right: -18px; top: 40px;
                border-width: 10px 0 10px 18px; border-style: solid; border-color: transparent transparent transparent #ffffff;
            }
            .speech-bubble::before {
                content: ''; position: absolute; right: -23px; top: 38px;
                border-width: 12px 0 12px 23px; border-style: solid; border-color: transparent transparent transparent #111;
            }
            .map-sketch {
                position: absolute; left: 35px; bottom: 30px; width: 330px; height: 160px;
                background: rgba(255,255,255,0.6); border: 2.5px dashed #8b7355; border-radius: 8px;
                padding: 10px; display: flex; flex-direction: column; justify-content: space-between;
            }
            .map-title { font-family: 'Impact', sans-serif; font-size: 15px; color: #8b5a2b; letter-spacing: 1px; }
            .stickman-container {
                position: absolute; right: 40px; bottom: 20px; width: 320px; height: 350px;
            }
            .red-wax-seal {
                position: absolute; top: 22px; right: 35px; width: 56px; height: 56px;
                background: radial-gradient(circle, #e11d48, #9f1239); border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #fff;
                font-weight: 900; font-size: 22px; box-shadow: 2px 4px 8px rgba(0,0,0,0.3);
                border: 3px solid #fecdd3; transform: rotate(12deg);
            }
        </style></head>
        <body>
            <div class="title-banner"><span class="title-text">⚔️ HISTOIRE ANIMÉE</span></div>
            <div class="red-wax-seal">1804</div>
            <div class="speech-bubble">"Soldats ! Du haut de ces pyramides, 40 siècles vous contemplent !"</div>

            <div class="map-sketch">
                <div class="map-title">BATAILLE D'AUSTERLITZ — 1805</div>
                <svg width="300" height="90" viewBox="0 0 300 90">
                    <path d="M 20 60 Q 150 10 280 60" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6,4" />
                    <polygon points="280,60 268,52 272,66" fill="#2563eb" />
                    <text x="25" y="78" font-size="12" font-weight="bold" fill="#2563eb">FRANCE (Napoléon)</text>

                    <path d="M 280 30 Q 150 70 30 25" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="6,4" />
                    <polygon points="30,25 42,33 38,19" fill="#dc2626" />
                    <text x="170" y="24" font-size="12" font-weight="bold" fill="#dc2626">COALITION (Russie)</text>
                </svg>
            </div>

            <!-- Hand drawn stickman general with Napoleonic bicorne hat -->
            <div class="stickman-container">
                <svg width="320" height="350" viewBox="0 0 320 350" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                    <!-- Bicorne Hat -->
                    <path d="M 60 80 Q 140 20 220 80 Q 140 60 60 80 Z" fill="#1e293b" stroke="#111" stroke-width="4.5" />
                    <circle cx="140" cy="55" r="9" fill="#facc15" stroke="#111" stroke-width="3" />
                    <circle cx="140" cy="55" r="5" fill="#dc2626" />

                    <!-- Head -->
                    <circle cx="140" cy="115" r="34" fill="#ffffff" stroke="#111" stroke-width="5" />
                    <!-- Eyes & expressive mouth -->
                    <circle cx="128" cy="110" r="4.5" fill="#111" />
                    <circle cx="152" cy="110" r="4.5" fill="#111" />
                    <path d="M 130 130 Q 140 140 152 130" stroke="#111" stroke-width="4" fill="none" />

                    <!-- Body -->
                    <line x1="140" y1="150" x2="140" y2="250" stroke="#111" stroke-width="6" />

                    <!-- Left Arm pointing at map -->
                    <line x1="140" y1="175" x2="70" y2="155" stroke="#111" stroke-width="5.5" />
                    <line x1="70" y1="155" x2="25" y2="170" stroke="#111" stroke-width="5.5" />

                    <!-- Right Arm holding golden saber -->
                    <line x1="140" y1="175" x2="205" y2="150" stroke="#111" stroke-width="5.5" />
                    <line x1="205" y1="150" x2="250" y2="110" stroke="#111" stroke-width="5.5" />
                    <!-- Saber sword -->
                    <path d="M 245 115 L 295 65 Q 305 75 285 110 Z" fill="#e2e8f0" stroke="#f59e0b" stroke-width="4" />
                    <line x1="238" y1="122" x2="256" y2="104" stroke="#f59e0b" stroke-width="6" />

                    <!-- Legs -->
                    <line x1="140" y1="250" x2="95" y2="335" stroke="#111" stroke-width="6" />
                    <line x1="140" y1="250" x2="190" y2="335" stroke="#111" stroke-width="6" />

                    <!-- Red sash coat -->
                    <line x1="120" y1="170" x2="160" y2="230" stroke="#dc2626" stroke-width="8" />
                </svg>
            </div>
        </body></html>
        `
    },

    // 3. TUTORIEL (Clean Screencast / Software Walkthrough)
    {
        filename: 'style_tutoriel.jpg',
        name: 'Tutoriel',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #0b0f19;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
                background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.25) 0%, transparent 60%);
            }
            .window-mockup {
                width: 650px; height: 340px; background: #131b2e; border: 1.5px solid rgba(255,255,255,0.14);
                border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(59,130,246,0.25);
                display: flex; flex-direction: column; overflow: hidden; position: relative;
            }
            .window-header {
                height: 38px; background: #0c1222; border-bottom: 1px solid rgba(255,255,255,0.08);
                display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
            }
            .dots { display: flex; gap: 7px; }
            .dot { width: 11px; height: 11px; border-radius: 50%; }
            .window-title { font-size: 11.5px; color: #94a3b8; font-family: monospace; }
            .window-body { flex: 1; display: flex; padding: 16px; gap: 16px; position: relative; }
            .sidebar { width: 160px; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
            .side-item { height: 18px; border-radius: 4px; background: rgba(255,255,255,0.06); }
            .side-item.active { background: #2563eb; width: 85%; }
            .code-panel { flex: 1; background: #080c16; border-radius: 8px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.8; color: #e2e8f0; position: relative; }
            .line-hl { background: rgba(59, 130, 246, 0.15); border-left: 3px solid #3b82f6; padding-left: 8px; margin: 0 -16px; }
            .cursor-wrap { position: absolute; left: 320px; top: 180px; z-index: 50; }
            .cursor-pointer { width: 32px; height: 32px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6)); }
            .click-ripple {
                position: absolute; top: 0; left: 0; width: 44px; height: 44px; border-radius: 50%;
                border: 2px solid #38bdf8; animation: rip 1.5s infinite; opacity: 0.8; transform: translate(-8px, -8px);
            }
            .callout-box {
                position: absolute; right: 28px; bottom: 25px; background: #1e293b; border: 1.5px solid #38bdf8;
                border-radius: 8px; padding: 10px 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px;
            }
            .step-pill { background: #38bdf8; color: #000; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
            .shortcut-pill { position: absolute; top: 55px; right: 25px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 5px 12px; font-size: 11px; font-weight: 700; color: #fff; font-family: monospace; }
        </style></head>
        <body>
            <div class="window-mockup">
                <div class="window-header">
                    <div class="dots">
                        <div class="dot" style="background:#ef4444;"></div>
                        <div class="dot" style="background:#eab308;"></div>
                        <div class="dot" style="background:#22c55e;"></div>
                    </div>
                    <div class="window-title">EditorUI.tsx — Tutorial Project</div>
                    <div style="width:50px;"></div>
                </div>
                <div class="window-body">
                    <div class="sidebar">
                        <div class="side-item active"></div>
                        <div class="side-item" style="width:60%;"></div>
                        <div class="side-item" style="width:75%;"></div>
                        <div class="side-item" style="width:50%;"></div>
                    </div>
                    <div class="code-panel">
                        <div><span style="color:#f43f5e;">export function</span> <span style="color:#60a5fa;">renderTimeline</span>() {</div>
                        <div class="line-hl">&nbsp;&nbsp;<span style="color:#fbbf24;">await</span> studio.<span style="color:#38bdf8;">exportHighDefinition</span>();</div>
                        <div>&nbsp;&nbsp;<span style="color:#94a3b8;">// 🎯 Focus sur le bouton générer</span></div>
                        <div>&nbsp;&nbsp;<span style="color:#a78bfa;">return</span> &lt;<span style="color:#34d399;">VideoCanvas</span> resolution="4K" /&gt;;</div>
                        <div>}</div>
                    </div>
                </div>
                <div class="shortcut-pill">SHORTCUT : ⌘ + ENTER</div>
                <div class="cursor-wrap">
                    <div class="click-ripple"></div>
                    <svg class="cursor-pointer" viewBox="0 0 24 24" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5">
                        <path d="M4 2 L20 10 L12 13 L8 21 Z" />
                    </svg>
                </div>
                <div class="callout-box">
                    <span class="step-pill">ÉTAPE 1</span>
                    <span style="font-size:12px; font-weight:600; color:#fff;">Cliquer pour exporter en 4K Ultra HD</span>
                </div>
            </div>
        </body></html>
        `
    },

    // 4. FACELESS BRAND (Luxury Cinematic Aesthetic)
    {
        filename: 'style_faceless_brand.jpg',
        name: 'Faceless Brand',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #07090e;
                font-family: 'Cinzel', 'Playfair Display', 'Times New Roman', serif;
                overflow: hidden; position: relative; display: flex; flex-direction: column; justify-content: space-between;
                background-image: 
                    radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 70%),
                    linear-gradient(180deg, #020305 0%, #0c1017 50%, #020305 100%);
            }
            .cinematic-bar { height: 26px; background: #000; z-index: 20; }
            .content-center {
                flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                position: relative; text-align: center; padding: 0 40px;
            }
            .luxury-subtitle {
                font-family: -apple-system, sans-serif; font-size: 10.5px; font-weight: 700;
                letter-spacing: 5px; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px;
            }
            .luxury-title {
                font-size: 38px; font-weight: 400; color: #f8fafc; letter-spacing: 4px;
                text-transform: uppercase; line-height: 1.1; text-shadow: 0 4px 20px rgba(0,0,0,0.8);
            }
            .gold-line {
                width: 90px; height: 1.5px; background: linear-gradient(90deg, transparent, #fbbf24, transparent);
                margin: 16px 0;
            }
            .rolex-dial-mockup {
                width: 140px; height: 140px; border-radius: 50%;
                border: 2px solid rgba(251, 191, 36, 0.4);
                box-shadow: 0 0 35px rgba(245, 158, 11, 0.2), inset 0 0 25px rgba(0,0,0,0.8);
                position: absolute; right: 50px; top: 40px; opacity: 0.35;
                display: flex; align-items: center; justify-content: center;
            }
            .rolex-bezel { width: 110px; height: 110px; border-radius: 50%; border: 1px dashed rgba(251, 191, 36, 0.6); }
            .badge-4k {
                position: absolute; bottom: 35px; left: 45px;
                border: 1px solid rgba(251, 191, 36, 0.35); padding: 4px 12px; border-radius: 4px;
                font-family: monospace; font-size: 11px; color: #fef08a; letter-spacing: 2px;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            }
        </style></head>
        <body>
            <div class="cinematic-bar"></div>
            <div class="content-center">
                <div class="rolex-dial-mockup"><div class="rolex-bezel"></div></div>
                <div class="luxury-subtitle">ESTHÉTIQUE & B-ROLL CINÉMATIQUE</div>
                <div class="luxury-title">FACELESS LUXURY</div>
                <div class="gold-line"></div>
                <div style="font-family: -apple-system, sans-serif; font-size: 12px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase;">
                    DISCRETION • INFLUENCE • MINIMALISME
                </div>
            </div>
            <div class="badge-4k">4K UHD • 2.39:1 CINEMASCOPE</div>
            <div class="cinematic-bar"></div>
        </body></html>
        `
    },

    // 5. EGO LITE (Viral TikTok / Alex Hormozi Kinetic Subtitles)
    {
        filename: 'style_ego_lite.jpg',
        name: 'Ego Lite',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #080a0f;
                font-family: 'Impact', 'Montserrat', sans-serif;
                overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
                background-image: 
                    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.35) 0%, transparent 50%),
                    radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.25) 0%, transparent 50%);
            }
            .phone-mockup {
                width: 250px; height: 370px; background: #000; border: 3px solid rgba(255,255,255,0.2);
                border-radius: 28px; box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(168,85,247,0.3);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 20px; position: relative; overflow: hidden;
            }
            .hook-word {
                font-size: 28px; line-height: 1.15; text-transform: uppercase; text-align: center;
                letter-spacing: 0.5px; text-shadow: 0 3px 0 #000, 0 6px 12px rgba(0,0,0,0.9);
            }
            .word-white { color: #ffffff; }
            .word-yellow { color: #facc15; font-size: 34px; transform: scale(1.08); display: inline-block; filter: drop-shadow(0 0 10px rgba(250,204,21,0.6)); }
            .word-green { color: #22c55e; font-size: 36px; transform: scale(1.12); display: inline-block; filter: drop-shadow(0 0 12px rgba(34,197,94,0.7)); }
            .sticker-flame {
                position: absolute; top: 35px; right: 25px; font-size: 24px; filter: drop-shadow(0 0 8px rgba(239,68,68,0.8));
            }
            .soundwaves {
                position: absolute; bottom: 30px; display: flex; gap: 4px; align-items: flex-end; height: 26px;
            }
            .bar { width: 4px; background: #38bdf8; border-radius: 2px; }
            .side-badge {
                position: absolute; left: 40px; top: 50%; transform: translateY(-50%);
                display: flex; flex-direction: column; gap: 12px;
            }
            .pill-feature {
                background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
                padding: 8px 16px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700;
                display: flex; align-items: center; gap: 8px; font-family: -apple-system, sans-serif;
            }
        </style></head>
        <body>
            <div class="side-badge">
                <div class="pill-feature">⚡ VIRAL REELS & TIKTOK</div>
                <div class="pill-feature">🔥 ACCROCHE HORMOZI</div>
                <div class="pill-feature">🎯 100% MOT-À-MOT DYNAMIQUE</div>
            </div>

            <div class="phone-mockup">
                <div class="sticker-flame">🔥</div>
                <div class="hook-word word-white">STOP DOING</div>
                <div class="hook-word word-yellow">BORING</div>
                <div class="hook-word word-green">VIDEOS !</div>
                <div class="soundwaves">
                    <div class="bar" style="height:12px;"></div>
                    <div class="bar" style="height:22px;"></div>
                    <div class="bar" style="height:16px;"></div>
                    <div class="bar" style="height:26px;"></div>
                    <div class="bar" style="height:10px;"></div>
                    <div class="bar" style="height:18px;"></div>
                </div>
            </div>
        </body></html>
        `
    },

    // 6. SAAS MOTION DESIGN (Modern Product Demo / Stripe / Linear UI)
    {
        filename: 'style_saas_motion_design.jpg',
        name: 'SaaS Motion Design',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #060913;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
                overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
                background-image: 
                    radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 60%),
                    radial-gradient(circle at 75% 80%, rgba(6, 182, 212, 0.25) 0%, transparent 60%);
            }
            .dashboard-card {
                width: 620px; height: 320px;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(16px);
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
                padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
                position: relative;
            }
            .dash-header { display: flex; align-items: center; justify-content: space-between; }
            .dash-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; color: #fff; }
            .logo-icon { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #06b6d4); }
            .status-pill { background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
            .metrics-row { display: flex; gap: 20px; margin: 16px 0; }
            .metric-box { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; }
            .metric-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
            .metric-val { font-size: 24px; font-weight: 800; color: #fff; font-family: monospace; }
            .growth { font-size: 12px; color: #34d399; font-weight: 700; margin-left: 6px; }
            .chart-area { flex: 1; position: relative; display: flex; align-items: flex-end; }
        </style></head>
        <body>
            <div class="dashboard-card">
                <div class="dash-header">
                    <div class="dash-brand">
                        <div class="logo-icon"></div>
                        <span>LinearMotion SaaS</span>
                    </div>
                    <div class="status-pill">● LIVE PRODUCTION</div>
                </div>
                <div class="metrics-row">
                    <div class="metric-box">
                        <div class="metric-label">ARR Growth</div>
                        <div class="metric-val">$184,500 <span class="growth">+284%</span></div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Active Users</div>
                        <div class="metric-val">42,910 <span class="growth">+48%</span></div>
                    </div>
                </div>
                <div class="chart-area">
                    <svg width="570" height="110" viewBox="0 0 570 110">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.5"/>
                                <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0 90 Q 90 70 160 55 T 320 40 T 450 20 T 570 5 L 570 110 L 0 110 Z" fill="url(#chartGrad)" />
                        <path d="M 0 90 Q 90 70 160 55 T 320 40 T 450 20 T 570 5" fill="none" stroke="#22d3ee" stroke-width="3.5" />
                        <circle cx="570" cy="5" r="5" fill="#ffffff" stroke="#06b6d4" stroke-width="3" />
                    </svg>
                </div>
            </div>
        </body></html>
        `
    },

    // 7. TOP 10 (Dynamic Countdown / Leaderboard Podium)
    {
        filename: 'style_top_10.jpg',
        name: 'Top 10',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #070912;
                font-family: 'Impact', 'Bebas Neue', sans-serif;
                overflow: hidden; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
                background-image: 
                    radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.3) 0%, transparent 65%),
                    linear-gradient(180deg, #05060b 0%, #111528 60%, #05060b 100%);
            }
            .countdown-badge {
                background: #e11d48; color: #fff; font-size: 14px; letter-spacing: 2px;
                padding: 4px 16px; border-radius: 4px; box-shadow: 0 4px 15px rgba(225,29,72,0.5);
                margin-bottom: 8px; transform: rotate(-1deg);
            }
            .huge-number {
                font-size: 110px; line-height: 0.9;
                background: linear-gradient(180deg, #fff 0%, #fef08a 35%, #eab308 65%, #713f12 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                filter: drop-shadow(0 10px 30px rgba(234,179,8,0.5));
            }
            .sub-title {
                font-size: 26px; color: #ffffff; letter-spacing: 3px; text-transform: uppercase;
                margin-top: 6px; text-shadow: 0 2px 10px rgba(0,0,0,0.8);
            }
            .podium-row {
                display: flex; align-items: flex-end; gap: 14px; margin-top: 20px;
            }
            .podium-step {
                width: 90px; border-radius: 6px 6px 0 0; display: flex; align-items: center; justify-content: center;
                font-size: 22px; color: #fff; font-weight: 800; box-shadow: 0 8px 20px rgba(0,0,0,0.5);
            }
            .step-1 { height: 75px; background: linear-gradient(180deg, #eab308, #854d0e); }
            .step-2 { height: 55px; background: linear-gradient(180deg, #94a3b8, #475569); }
            .step-3 { height: 42px; background: linear-gradient(180deg, #d97706, #78350f); }
        </style></head>
        <body>
            <div class="countdown-badge">COUNTDOWN • CLASSEMENT</div>
            <div class="huge-number">#1</div>
            <div class="sub-title">TOP 10 OFFICIEL</div>
            <div class="podium-row">
                <div class="podium-step step-2">#2</div>
                <div class="podium-step step-1">#1</div>
                <div class="podium-step step-3">#3</div>
            </div>
        </body></html>
        `
    },

    // 8. TIER LIST (Iconic Tier Maker Grid S-A-B-C-D)
    {
        filename: 'style_tier_list.jpg',
        name: 'Tier List',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #0f131c;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden; position: relative; padding: 20px 30px; display: flex; flex-direction: column; justify-content: center;
            }
            .tier-table {
                width: 100%; border: 2px solid #2d3748; border-radius: 8px; overflow: hidden;
                box-shadow: 0 15px 35px rgba(0,0,0,0.6);
            }
            .tier-row {
                display: flex; height: 64px; border-bottom: 2px solid #1a202c; background: #1a202c;
            }
            .tier-row:last-child { border-bottom: none; }
            .tier-head {
                width: 70px; display: flex; align-items: center; justify-content: center;
                font-size: 28px; font-weight: 900; color: #000; font-family: 'Impact', sans-serif;
                flex-shrink: 0;
            }
            .head-s { background: #ff7f7f; }
            .head-a { background: #ffbf7f; }
            .head-b { background: #ffff7f; }
            .head-c { background: #7fff7f; }
            .head-d { background: #7fbfff; }
            .tier-slots {
                flex: 1; display: flex; align-items: center; padding: 0 12px; gap: 10px; overflow: hidden;
            }
            .tier-item {
                width: 48px; height: 48px; border-radius: 6px; background: #2d3748;
                border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 11px; color: #cbd5e1;
            }
            .tier-item.gold { background: linear-gradient(135deg, #f59e0b, #b45309); color: #fff; }
            .tier-item.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; }
            .tier-item.purple { background: linear-gradient(135deg, #a855f7, #6b21a8); color: #fff; }
        </style></head>
        <body>
            <div style="font-family:'Impact',sans-serif; font-size:16px; color:#f8fafc; letter-spacing:1px; margin-bottom:8px;">
                🏆 CLASSEMENT TIER LIST
            </div>
            <div class="tier-table">
                <div class="tier-row">
                    <div class="tier-head head-s">S</div>
                    <div class="tier-slots">
                        <div class="tier-item gold">GOAT</div>
                        <div class="tier-item gold">GOD</div>
                    </div>
                </div>
                <div class="tier-row">
                    <div class="tier-head head-a">A</div>
                    <div class="tier-slots">
                        <div class="tier-item blue">TOP</div>
                        <div class="tier-item blue">ELITE</div>
                        <div class="tier-item blue">PRO</div>
                    </div>
                </div>
                <div class="tier-row">
                    <div class="tier-head head-b">B</div>
                    <div class="tier-slots">
                        <div class="tier-item purple">GOOD</div>
                        <div class="tier-item purple">SOLID</div>
                    </div>
                </div>
                <div class="tier-row">
                    <div class="tier-head head-c">C</div>
                    <div class="tier-slots">
                        <div class="tier-item">MID</div>
                    </div>
                </div>
                <div class="tier-row">
                    <div class="tier-head head-d">D</div>
                    <div class="tier-slots">
                        <div class="tier-item" style="color:#ef4444;">TRASH</div>
                    </div>
                </div>
            </div>
        </body></html>
        `
    },

    // 9. IMAN GADZHI STYLE (Dark Noir Business Documentary & Red String)
    {
        filename: 'style_iman_gadzhi_style.jpg',
        name: 'Iman Gadzhi Style',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #0a0a0d;
                font-family: 'Times New Roman', serif; overflow: hidden; position: relative;
                background-image: 
                    radial-gradient(circle at 50% 50%, rgba(30, 20, 15, 0.4) 0%, #030305 90%),
                    radial-gradient(#222 1px, transparent 1px);
                background-size: 100% 100%, 6px 6px;
            }
            .money-stack {
                position: absolute; right: 40px; bottom: 20px; width: 280px; height: 210px;
                filter: drop-shadow(0 15px 30px rgba(0,0,0,0.85)); transform: rotate(-5deg);
            }
            .bill {
                width: 260px; height: 110px; background: #164e2e; border: 2px solid #22c55e;
                border-radius: 6px; padding: 10px; color: #86efac; font-family: monospace; font-size: 11px;
                box-shadow: 0 6px 15px rgba(0,0,0,0.7); display: flex; flex-direction: column; justify-content: space-between;
                position: absolute;
            }
            .cork-note {
                position: absolute; left: 45px; top: 40px; width: 260px; background: #fef08a; color: #111;
                padding: 16px; border-radius: 4px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); transform: rotate(-2deg);
                font-family: 'Courier New', monospace; font-weight: 700;
            }
            .red-pin {
                position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
                width: 16px; height: 16px; border-radius: 50%; background: #dc2626; border: 2px solid #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            }
            .pin-2 {
                position: absolute; right: 120px; bottom: 160px; width: 16px; height: 16px;
                border-radius: 50%; background: #dc2626; border: 2px solid #fff; z-index: 30;
            }
            .stamp-confidential {
                position: absolute; left: 50px; bottom: 40px; border: 3px solid #ef4444; color: #ef4444;
                font-family: 'Impact', sans-serif; font-size: 22px; padding: 4px 14px; letter-spacing: 2px;
                transform: rotate(8deg); opacity: 0.9;
            }
        </style></head>
        <body>
            <!-- Red investigation string -->
            <svg style="position:absolute; inset:0; z-index:20;" width="720" height="400">
                <line x1="175" y1="40" x2="600" y2="240" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
                <line x1="175" y1="40" x2="160" y2="340" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4" />
            </svg>
            <div class="pin-2"></div>

            <div class="cork-note">
                <div class="red-pin"></div>
                <div style="font-size:11px; color:#b45309; margin-bottom:4px;">DOSSIER : MONOPOLY</div>
                <div style="font-size:14px; line-height:1.3;">"Les règles de la finance ont été écrites par ceux qui possèdent les capitaux."</div>
            </div>

            <div class="money-stack">
                <div class="bill" style="top:40px; left:10px; transform:rotate(6deg);">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;"><span>100</span><span>FEDERAL RESERVE</span><span>100</span></div>
                    <div style="text-align:center; font-size:24px; font-weight:900;">$100,000,000</div>
                    <div style="font-size:9px; text-align:right;">SERIES 2026</div>
                </div>
                <div class="bill" style="top:10px; left:0px; transform:rotate(-4deg); background:#14532d; border-color:#4ade80;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;"><span>100</span><span>UNITED STATES</span><span>100</span></div>
                    <div style="text-align:center; font-size:24px; font-weight:900;">$500,000</div>
                    <div style="font-size:9px; text-align:right;">SECRET FUND</div>
                </div>
            </div>

            <div class="stamp-confidential">DOCUMENTAIRE NOIR</div>
        </body></html>
        `
    },

    // 10. TRASH STYLE (Punk Edit, Chaos, Ripped Paper & Duct Tape)
    {
        filename: 'style_trash_style.jpg',
        name: 'Trash Style',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px; background: #0c0d12;
                font-family: 'Impact', sans-serif; overflow: hidden; position: relative;
                background-image: 
                    radial-gradient(#fff 1px, transparent 1px),
                    repeating-linear-gradient(45deg, #111, #111 10px, #08080a 10px, #08080a 20px);
                background-size: 8px 8px, 100% 100%;
            }
            .hazard-tape {
                position: absolute; top: 15px; left: -30px; width: 350px; height: 36px;
                background: repeating-linear-gradient(-45deg, #facc15, #facc15 14px, #000 14px, #000 28px);
                transform: rotate(-10deg); box-shadow: 0 4px 15px rgba(0,0,0,0.6); z-index: 10;
            }
            .duct-tape {
                position: absolute; right: 40px; top: 30px; width: 140px; height: 40px;
                background: linear-gradient(180deg, #94a3b8, #64748b);
                transform: rotate(25deg); opacity: 0.85; border-left: 3px dashed #475569; border-right: 3px dashed #475569;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 10;
            }
            .ransom-box {
                position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(2deg);
                display: flex; gap: 8px; z-index: 20;
            }
            .letter-card {
                padding: 10px 18px; font-size: 48px; font-weight: 900; line-height: 1;
                box-shadow: 5px 6px 0px #000; border: 2px solid #000;
            }
            .c-yellow { background: #facc15; color: #000; transform: rotate(-5deg); }
            .c-white { background: #ffffff; color: #000; transform: rotate(3deg); }
            .c-red { background: #ef4444; color: #fff; transform: rotate(-2deg); }
            .c-pink { background: #ec4899; color: #fff; transform: rotate(6deg); }
            .punk-tag {
                position: absolute; bottom: 35px; right: 50px; background: #000; border: 2px dashed #facc15;
                color: #facc15; font-size: 16px; padding: 6px 16px; transform: rotate(-3deg);
            }
        </style></head>
        <body>
            <div class="hazard-tape"></div>
            <div class="duct-tape"></div>
            <div class="ransom-box">
                <div class="letter-card c-yellow">T</div>
                <div class="letter-card c-white">R</div>
                <div class="letter-card c-red">A</div>
                <div class="letter-card c-pink">S</div>
                <div class="letter-card c-yellow">H</div>
            </div>
            <div class="punk-tag">PUNK SCRAPBOOK EDIT</div>
        </body></html>
        `
    },

    // 11. 2D EXPLAINER (Flat Vector Infographics & Kurzgesagt)
    {
        filename: 'style_2d_explainer.jpg',
        name: '2D Explainer',
        html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                width: 720px; height: 400px;
                background: linear-gradient(135deg, #0b1329 0%, #172554 60%, #1e1b4b 100%);
                font-family: 'Outfit', -apple-system, sans-serif;
                overflow: hidden; position: relative; display: flex; align-items: center; justify-content: space-between;
                padding: 0 50px;
            }
            .left-info { display: flex; flex-direction: column; gap: 14px; max-width: 320px; }
            .badge-vector {
                background: #38bdf8; color: #082f49; font-weight: 800; font-size: 12px;
                padding: 4px 12px; border-radius: 20px; width: fit-content; letter-spacing: 0.5px;
            }
            .explainer-title {
                font-size: 34px; font-weight: 900; color: #ffffff; line-height: 1.15;
            }
            .explainer-desc {
                font-size: 13px; color: #94a3b8; line-height: 1.5;
            }
            .planet-visual {
                position: relative; width: 260px; height: 260px; display: flex; align-items: center; justify-content: center;
            }
            .planet-body {
                width: 150px; height: 150px; border-radius: 50%;
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                box-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
                position: relative; overflow: hidden;
            }
            .continent { position: absolute; border-radius: 50%; background: #22c55e; }
            .orbit-ring {
                position: absolute; width: 240px; height: 80px; border-radius: 50%;
                border: 2.5px dashed rgba(255,255,255,0.4); transform: rotate(-25deg);
            }
            .satellite-icon {
                position: absolute; top: 15px; right: 30px; width: 20px; height: 20px;
                background: #facc15; border-radius: 4px; box-shadow: 0 0 10px #facc15;
            }
        </style></head>
        <body>
            <div class="left-info">
                <div class="badge-vector">VECTOR INFOGRAPHIE 2D</div>
                <div class="explainer-title">2D EXPLAINER MOTION</div>
                <div class="explainer-desc">Animations vectorielles limpides, schémas épurés et vulgarisation visuelle percutante.</div>
            </div>
            <div class="planet-visual">
                <div class="orbit-ring"></div>
                <div class="satellite-icon"></div>
                <div class="planet-body">
                    <div class="continent" style="width:70px; height:50px; top:20px; left:20px;"></div>
                    <div class="continent" style="width:60px; height:40px; bottom:25px; right:20px;"></div>
                </div>
            </div>
        </body></html>
        `
    }
];

async function generateAll() {
    const chromePath = getChromePath();
    if (!chromePath) throw new Error('No Chrome / Edge executable found');

    console.log('Using browser at:', chromePath);
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 400, deviceScaleFactor: 2 });

    const outDir = path.join(__dirname, '..', '01_Assets', 'Images', 'styles');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (const spec of STYLES_SPECS) {
        const dest = path.join(outDir, spec.filename);
        await page.setContent(spec.html);
        await page.screenshot({ path: dest, quality: 92, type: 'jpeg' });
        const sz = fs.statSync(dest).size;
        console.log(`Generated ${spec.filename} (${spec.name}) -> ${sz} bytes`);
    }

    await browser.close();
    console.log('ALL 11 STYLE THUMBNAILS GENERATED SUCCESSFULLY!');
}

generateAll().catch(err => {
    console.error('Fatal error generating thumbnails:', err);
    process.exit(1);
});

