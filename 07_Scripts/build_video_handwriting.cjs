const fs = require('fs');
const path = require('path');

const svgTitle = fs.readFileSync('01_Assets/handwriting/titre_art.svg', 'utf8')
  .replace('<svg ', '<svg id="svg-title" class="handwriting-svg" ')
  .replace(/tk-m/g, 't1-m')
  .replace(/tk-clip/g, 't1-clip');

const svgSubtitle = fs.readFileSync('01_Assets/handwriting/sous_titre_motion.svg', 'utf8')
  .replace('<svg ', '<svg id="svg-subtitle" class="handwriting-svg" ')
  .replace(/tk-m/g, 't2-m')
  .replace(/tk-clip/g, 't2-clip');

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0">
  <title>Vidéo Démo - Animation Manuscrite Tegaki</title>
  <style>
    :root {
      --bg: #07090e;
      --primary: #818cf8;
      --accent: #c084fc;
      --glow: rgba(99, 102, 241, 0.35);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body, html {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: var(--bg);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
    }

    #stage {
      width: 1920px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      background: radial-gradient(circle at 50% 45%, #151828 0%, #080911 70%, #030407 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    /* Lumières d'ambiance */
    .glow-orb-1 {
      position: absolute;
      top: 20%;
      left: 25%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%);
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      transform: translate(-50%, -50%);
    }

    .glow-orb-2 {
      position: absolute;
      bottom: 15%;
      right: 25%;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(192, 132, 252, 0.15) 0%, rgba(192, 132, 252, 0) 70%);
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      transform: translate(50%, 50%);
    }

    /* Grille décorative */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 80px 80px;
      mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%);
      -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%);
      pointer-events: none;
    }

    /* Conteneur principal */
    .content-card {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 60px 100px;
      border-radius: 32px;
      background: rgba(18, 21, 35, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      width: 1400px;
    }

    /* Badge supérieur */
    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(165, 180, 252, 0.25);
      color: #c7d2fe;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 40px;
      opacity: 0;
      transform: translateY(-20px);
    }

    .tag-badge .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #818cf8;
      box-shadow: 0 0 12px #818cf8;
    }

    /* Zone de titre manuscrit */
    .title-wrapper {
      position: relative;
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      filter: drop-shadow(0 10px 25px rgba(255, 255, 255, 0.2));
    }

    #svg-title {
      width: 1100px;
      height: auto;
      max-height: 220px;
    }

    /* Séparateur */
    .divider {
      width: 0px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(165, 180, 252, 0.8), transparent);
      margin: 10px 0 35px 0;
    }

    /* Zone de sous-titre */
    .subtitle-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      filter: drop-shadow(0 8px 20px rgba(129, 140, 248, 0.35));
    }

    #svg-subtitle {
      width: 1000px;
      height: auto;
      max-height: 180px;
    }

    /* Accents de signature en bas */
    .footer-note {
      margin-top: 40px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 16px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(15px);
    }
  </style>
</head>
<body>

  <div id="stage" data-duration="5.5">
    <div class="glow-orb-1" id="orb1"></div>
    <div class="glow-orb-2" id="orb2"></div>
    <div class="grid-overlay"></div>

    <div class="content-card" id="card">
      <div class="tag-badge" id="badge">
        <span class="dot"></span>
        Tegaki Motion System
      </div>

      <div class="title-wrapper">
        ${svgTitle}
      </div>

      <div class="divider" id="divider"></div>

      <div class="subtitle-wrapper">
        ${svgSubtitle}
      </div>

      <div class="footer-note" id="footerNote">
        Rendu Vectoriel HD • Zéro Perte • 60 FPS Ready
      </div>
    </div>
  </div>

  <script>
    const badge = document.getElementById('badge');
    const divider = document.getElementById('divider');
    const footerNote = document.getElementById('footerNote');
    const card = document.getElementById('card');
    const orb1 = document.getElementById('orb1');
    const orb2 = document.getElementById('orb2');
    const svg1 = document.getElementById('svg-title');
    const svg2 = document.getElementById('svg-subtitle');

    function updateScene(t) {
      // 1. Badge Apparition (t = 0.1s -> 0.6s)
      if (t >= 0.1) {
        const pBadge = Math.min(1, (t - 0.1) / 0.5);
        badge.style.opacity = pBadge;
        badge.style.transform = 'translateY(' + ((1 - pBadge) * -20) + 'px)';
      } else {
        badge.style.opacity = 0;
        badge.style.transform = 'translateY(-20px)';
      }

      // 2. SVG 1 Titre (t = 0.4s)
      if (svg1 && typeof svg1.setCurrentTime === 'function') {
        const t1 = Math.max(0, t - 0.4);
        try {
          if (typeof svg1.pauseAnimations === 'function' && !svg1.animationsPaused?.()) {
            svg1.pauseAnimations();
          }
          svg1.setCurrentTime(t1);
        } catch (e) {}
      }

      // 3. Divider Déploiement (t = 1.6s -> 2.4s)
      if (t >= 1.6) {
        const pDiv = Math.min(1, (t - 1.6) / 0.8);
        divider.style.width = (pDiv * 650) + 'px';
      } else {
        divider.style.width = '0px';
      }

      // 4. SVG 2 Sous-titre (t = 2.0s)
      if (svg2 && typeof svg2.setCurrentTime === 'function') {
        const t2 = Math.max(0, t - 2.0);
        try {
          if (typeof svg2.pauseAnimations === 'function' && !svg2.animationsPaused?.()) {
            svg2.pauseAnimations();
          }
          svg2.setCurrentTime(t2);
        } catch (e) {}
      }

      // 5. Footer Note (t = 3.8s -> 4.5s)
      if (t >= 3.8) {
        const pFoot = Math.min(1, (t - 3.8) / 0.7);
        footerNote.style.opacity = pFoot;
        footerNote.style.transform = 'translateY(' + ((1 - pFoot) * 15) + 'px)';
      } else {
        footerNote.style.opacity = 0;
        footerNote.style.transform = 'translateY(15px)';
      }

      // 6. Camera Slow Zoom In (t = 0s -> 5.5s)
      const zoom = 1 + (t / 5.5) * 0.04;
      card.style.transform = 'scale(' + zoom + ')';

      // 7. Ambiance Orbs floating
      orb1.style.transform = 'translate(' + (-50 + Math.sin(t * 1.2) * 20) + '%, ' + (-50 + Math.cos(t * 1.2) * 20) + '%)';
      orb2.style.transform = 'translate(' + (50 - Math.sin(t * 1.0) * 20) + '%, ' + (50 - Math.cos(t * 1.0) * 20) + '%)';
    }

    // Initialisation immédiate : figer les animations SVG et synchroniser à t = 0
    function initScene() {
      try {
        if (svg1 && typeof svg1.pauseAnimations === 'function') svg1.pauseAnimations();
        if (svg2 && typeof svg2.pauseAnimations === 'function') svg2.pauseAnimations();
      } catch (e) {}
      updateScene(0);
    }
    initScene();
    window.addEventListener('DOMContentLoaded', initScene);
    window.addEventListener('load', initScene);

    // Objet timeline pour le studio et le moteur de rendu Chrome CDP (render.cjs)
    window.__timeline = {
      duration: () => 5.5,
      seek: (t) => {
        updateScene(t);
      }
    };
  </script>
</body>
</html>`;

fs.writeFileSync('04_Videos/video_handwriting_demo.html', html, 'utf8');
console.log('Video HTML successfully created: 04_Videos/video_handwriting_demo.html');
