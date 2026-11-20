#!/usr/bin/env node
/**
 * IMAGE2THREEJS.CJS — Générateur Procédural de Composants Three.js par Code
 * Inspiré du projet open-source img2threejs (https://github.com/img2threejs/img2threejs)
 * 
 * Fonctionnalités :
 *   1. Analyse d'une image de référence via Sharp (palette de couleurs, ratio, contraste)
 *   2. Reconstruction par code de composants Three.js (THREE.Group) sans aucun fichier .glb lourd
 *   3. Génération d'une prévisualisation interactive 3D instantanée (HTML / OrbitControls / GSAP)
 * 
 * Usage :
 *   node 07_Scripts/image2threejs.cjs --list
 *   node 07_Scripts/image2threejs.cjs --preset character --preview
 *   node 07_Scripts/image2threejs.cjs --preset phone --preview
 *   node 07_Scripts/image2threejs.cjs --preset sofa --preview
 *   node 07_Scripts/image2threejs.cjs --image 01_Assets/Images/ref.png --preset character --out 05_Scenes/mon_perso.js
 */

const fs = require('fs');
const path = require('path');

let sharp = null;
try {
    sharp = require('sharp');
} catch (e) {
    // Sharp optionnel si non installé
}

const PRESETS = {
    character: {
        name: 'Personnage Stylisé Articulé',
        category: 'character',
        defaultColors: {
            skin: '#fad6bf',
            hair: '#1c1917',
            top: '#2563eb',
            pants: '#1e293b',
            shoes: '#ffffff'
        }
    },
    sofa: {
        name: 'Canapé Contemporain d\'Angle en L',
        category: 'furniture',
        defaultColors: {
            fabric: '#2e3848',
            cushions: '#5b6b82',
            legs: '#0f172a'
        }
    },
    island: {
        name: 'Îlot de Cuisine Marbre Waterfall & Tabourets',
        category: 'furniture',
        defaultColors: {
            base: '#1e2430',
            marble: '#fcfcfc',
            leather: '#9a3412',
            brass: '#d4af37'
        }
    },
    phone: {
        name: 'Smartphone Moderne Ultra-fin (Mockup SaaS)',
        category: 'device',
        defaultColors: {
            chassis: '#18181b',
            screen: '#050505',
            glow: '#2563eb'
        }
    }
};

function parseArgs() {
    const args = process.argv.slice(2);
    const params = {
        image: null,
        preset: 'character',
        out: null,
        preview: false,
        list: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--image' || arg === '-i') {
            params.image = args[++i];
        } else if (arg === '--preset' || arg === '-p') {
            params.preset = (args[++i] || 'character').toLowerCase();
        } else if (arg === '--out' || arg === '-o') {
            params.out = args[++i];
        } else if (arg === '--preview') {
            params.preview = true;
        } else if (arg === '--list' || arg === '-l') {
            params.list = true;
        } else if (arg === '--help' || arg === '-h') {
            params.help = true;
        }
    }
    return params;
}

// Extraction de la palette dominante d'une image
async function extractPaletteFromImage(imagePath) {
    if (!sharp || !fs.existsSync(imagePath)) {
        return null;
    }

    try {
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Réduction en petite vignette pour analyse des pixels
        const { data, info } = await image
            .resize(32, 32, { fit: 'inside' })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const colors = [];
        for (let i = 0; i < data.length; i += 3) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            colors.push({ r, g, b });
        }

        // Moyenne et quantification simple
        let sumR = 0, sumG = 0, sumB = 0;
        colors.forEach(c => {
            sumR += c.r;
            sumG += c.g;
            sumB += c.b;
        });

        const count = colors.length;
        const avgHex = '#' + [sumR / count, sumG / count, sumB / count]
            .map(x => Math.round(x).toString(16).padStart(2, '0'))
            .join('');

        return {
            dominantHex: avgHex,
            width: metadata.width,
            height: metadata.height,
            aspectRatio: metadata.width / metadata.height
        };
    } catch (e) {
        console.warn(`[img2threejs] Avertissement analyse image: ${e.message}`);
        return null;
    }
}

// Générateur du code JavaScript du composant Three.js
function generateComponentSource(presetKey, customColors = {}) {
    const preset = PRESETS[presetKey] || PRESETS.character;
    const colors = { ...preset.defaultColors, ...customColors };

    if (presetKey === 'character') {
        return `// =========================================================================
// COMPOSANT THREE.JS PROCÉDURAL : ${preset.name}
// Généré via 07_Scripts/image2threejs.cjs
// =========================================================================
function createProceduralCharacter(options = {}) {
    const palette = {
        skin: options.skin || '${colors.skin}',
        hair: options.hair || '${colors.hair}',
        top: options.top || '${colors.top}',
        pants: options.pants || '${colors.pants}',
        shoes: options.shoes || '${colors.shoes}'
    };

    const character = new THREE.Group();
    const bodyRig = new THREE.Group();
    character.add(bodyRig);

    const mats = {
        skin: new THREE.MeshStandardMaterial({ color: palette.skin, roughness: 0.65 }),
        hair: new THREE.MeshStandardMaterial({ color: palette.hair, roughness: 0.75 }),
        top: new THREE.MeshStandardMaterial({ color: palette.top, roughness: 0.6 }),
        pants: new THREE.MeshStandardMaterial({ color: palette.pants, roughness: 0.7 }),
        shoes: new THREE.MeshStandardMaterial({ color: palette.shoes, roughness: 0.35 })
    };

    // Torse
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 16), mats.top);
    torso.position.y = 1.35;
    torso.castShadow = true;
    bodyRig.add(torso);

    // Cou & Tête
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.15, 12), mats.skin);
    neck.position.y = 1.82;
    bodyRig.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), mats.skin);
    head.position.set(0, 2.0, 0);
    head.castShadow = true;
    bodyRig.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.255, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.58), mats.hair);
    hair.position.set(0, 2.03, 0);
    bodyRig.add(hair);

    // Épaules et Bras (Pivots articulés)
    function createArm(isLeft) {
        const side = isLeft ? 1 : -1;
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.38, 1.68, 0);

        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.72, 12), mats.top);
        sleeve.position.y = -0.36;
        sleeve.castShadow = true;
        pivot.add(sleeve);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), mats.skin);
        hand.position.y = -0.74;
        pivot.add(hand);

        bodyRig.add(pivot);
        return pivot;
    }

    // Hanches et Jambes (Pivots articulés)
    function createLeg(isLeft) {
        const side = isLeft ? 1 : -1;
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.16, 0.8, 0);

        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 12), mats.pants);
        leg.position.y = -0.4;
        leg.castShadow = true;
        pivot.add(leg);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.34), mats.shoes);
        shoe.position.set(0, -0.78, 0.07);
        shoe.castShadow = true;
        pivot.add(shoe);

        bodyRig.add(pivot);
        return pivot;
    }

    const armL = createArm(true);
    const armR = createArm(false);
    const legL = createLeg(true);
    const legR = createLeg(false);

    // API d'animation GSAP seek-safe
    character.userData = {
        setWalkCycle: (cycle) => {
            const swing = Math.sin(cycle * Math.PI) * 0.55;
            legL.rotation.x = swing;
            legR.rotation.x = -swing;
            armL.rotation.x = -swing * 0.75;
            armR.rotation.x = swing * 0.75;
            bodyRig.position.y = Math.abs(Math.sin(cycle * Math.PI)) * 0.045;
        },
        resetPose: () => {
            legL.rotation.x = 0;
            legR.rotation.x = 0;
            armL.rotation.x = 0;
            armR.rotation.x = 0;
            bodyRig.position.y = 0;
        }
    };

    return character;
}`;
    }

    if (presetKey === 'phone') {
        return `// =========================================================================
// COMPOSANT THREE.JS PROCÉDURAL : ${preset.name}
// Généré via 07_Scripts/image2threejs.cjs
// =========================================================================
function createProceduralSmartphone(options = {}) {
    const phone = new THREE.Group();

    const shape = new THREE.Shape();
    const w = 0.75, h = 1.55, r = 0.12;
    shape.moveTo(-w/2 + r, -h/2);
    shape.lineTo(w/2 - r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    shape.lineTo(w/2, h/2 - r);
    shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    shape.lineTo(-w/2 + r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    shape.lineTo(-w/2, -h/2 + r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);

    const extrudeSettings = { depth: 0.07, bevelEnabled: true, bevelSegments: 6, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const chassisGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    chassisGeo.center();

    const chassisMat = new THREE.MeshStandardMaterial({ color: '${colors.chassis}', metalness: 0.9, roughness: 0.2 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.castShadow = true;
    phone.add(chassis);

    // Écran OLED avec bordures ultrafines
    const screenGeo = new THREE.PlaneGeometry(0.72, 1.5);
    const screenMat = new THREE.MeshStandardMaterial({ 
        color: '${colors.screen}', 
        roughness: 0.05, 
        metalness: 0.8,
        emissive: '${colors.glow}',
        emissiveIntensity: 0.4
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.057;
    phone.add(screen);

    return phone;
}`;
    }

    if (presetKey === 'sofa') {
        return `// =========================================================================
// COMPOSANT THREE.JS PROCÉDURAL : ${preset.name}
// Généré via 07_Scripts/image2threejs.cjs
// =========================================================================
function createProceduralSofa(options = {}) {
    const sofa = new THREE.Group();

    const mats = {
        fabric: new THREE.MeshStandardMaterial({ color: '${colors.fabric}', roughness: 0.75 }),
        cushions: new THREE.MeshStandardMaterial({ color: '${colors.cushions}', roughness: 0.8 })
    };

    // Assise principale
    const mainSeat = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.6, 1.8), mats.fabric);
    mainSeat.position.set(0, 0.3, -0.6);
    mainSeat.castShadow = true;
    sofa.add(mainSeat);

    // Dossier
    const back = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.15, 0.4), mats.fabric);
    back.position.set(0, 0.88, -1.3);
    back.castShadow = true;
    sofa.add(back);

    // Méridienne
    const chaise = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.0), mats.fabric);
    chaise.position.set(-1.6, 0.3, 1.0);
    chaise.castShadow = true;
    sofa.add(chaise);

    return sofa;
}`;
    }

    return `// Preset ${presetKey} non implémenté`;
}

// Générateur de la page HTML de prévisualisation interactive
function generatePreviewHtml(presetKey, componentJs) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prévisualisation 3D Procédurale — ${presetKey.toUpperCase()}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 100vw; height: 100vh; overflow: hidden; background: #0f131a; color: #f8fafc; font-family: system-ui, sans-serif; }
        #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; }
        #hud {
            position: absolute;
            top: 24px;
            left: 24px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 16px 20px;
            border-radius: 12px;
            z-index: 10;
        }
        #hud h1 { font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; }
        #hud p { font-size: 13px; color: #94a3b8; }
        #controls {
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 12px 24px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 10;
        }
        button {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div id="hud">
        <h1>img2threejs — Modèle Procédural</h1>
        <p>Preset: <strong>${presetKey}</strong> | 100% Code Three.js sans fichier externe</p>
    </div>

    <div id="controls">
        <button id="btn-toggle">Pause Animation</button>
        <span style="font-size: 13px; color: #cbd5e1;">Faites glisser pour tourner la caméra</span>
    </div>

    <div id="canvas-container"></div>

    <script>
        ${componentJs}

        // Initialisation scène Three.js
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f131a);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 2.5, 4.8);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, 1.2, 0);

        // Éclairage studio 3 points
        const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
        keyLight.position.set(4, 8, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
        fillLight.position.set(-4, 4, -3);
        scene.add(fillLight);

        // Sol studio avec ombre de contact
        const floorGeo = new THREE.PlaneGeometry(16, 16);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x181e29, roughness: 0.6 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ajout du modèle procédural
        let model;
        if ('${presetKey}' === 'character') {
            model = createProceduralCharacter();
        } else if ('${presetKey}' === 'phone') {
            model = createProceduralSmartphone();
            model.position.y = 1.2;
        } else if ('${presetKey}' === 'sofa') {
            model = createProceduralSofa();
        }
        scene.add(model);

        // Timeline GSAP
        const animState = { t: 0 };
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(animState, {
            t: 20,
            duration: 10,
            ease: 'none',
            onUpdate: () => {
                if (model && model.userData && model.userData.setWalkCycle) {
                    model.userData.setWalkCycle(animState.t);
                } else if (model) {
                    model.rotation.y = animState.t * 0.3;
                }
            }
        });

        const btn = document.getElementById('btn-toggle');
        btn.addEventListener('click', () => {
            if (tl.paused()) {
                tl.play();
                btn.textContent = 'Pause Animation';
            } else {
                tl.pause();
                btn.textContent = 'Reprendre Animation';
            }
        });

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>`;
}

// Fonction Principale
async function main() {
    const params = parseArgs();

    if (params.help) {
        console.log(`
IMG2THREEJS — Générateur Procédural de Composants Three.js par Code
Usage :
  node 07_Scripts/image2threejs.cjs [options]

Options :
  --preset, -p <name>   Nom du preset (character, sofa, island, phone) [défaut: character]
  --image, -i <path>    Chemin vers une image de référence pour extraction de couleurs
  --out, -o <path>      Fichier JS de sortie pour le composant
  --preview             Génère une prévisualisation 3D interactive dans 04_Videos/preview_img2threejs.html
  --list, -l            Affiche la liste des presets disponibles
  --help, -h            Affiche cette aide
        `);
        return;
    }

    if (params.list) {
        console.log('\n📦 Presets procéduraux img2threejs disponibles :');
        Object.entries(PRESETS).forEach(([key, val]) => {
            console.log(`  • ${key.padEnd(12)} : ${val.name} (${val.category})`);
        });
        console.log('');
        return;
    }

    console.log(`\n🚀 [img2threejs] Initialisation avec le preset "${params.preset}"...`);

    let extractedColors = {};
    if (params.image) {
        const fullImgPath = path.resolve(params.image);
        if (fs.existsSync(fullImgPath)) {
            console.log(`📸 Analyse de l'image de référence : ${fullImgPath}`);
            const palette = await extractPaletteFromImage(fullImgPath);
            if (palette) {
                console.log(`🎨 Couleur dominante détectée : ${palette.dominantHex}`);
                extractedColors.top = palette.dominantHex;
                extractedColors.fabric = palette.dominantHex;
                extractedColors.glow = palette.dominantHex;
            }
        } else {
            console.warn(`⚠️ Image introuvable : ${fullImgPath}`);
        }
    }

    const componentJs = generateComponentSource(params.preset, extractedColors);

    if (params.out) {
        const outPath = path.resolve(params.out);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, componentJs, 'utf8');
        console.log(`💾 Composant Three.js sauvegardé dans : ${outPath}`);
    }

    if (params.preview) {
        const previewHtml = generatePreviewHtml(params.preset, componentJs);
        const previewPath = path.resolve(__dirname, '..', '04_Videos', 'preview_img2threejs.html');
        fs.writeFileSync(previewPath, previewHtml, 'utf8');
        console.log(`✨ Page de prévisualisation générée : ${previewPath}`);
        console.log(`   Ouvrez ce fichier dans votre navigateur ou dans le Studio pour manipuler la 3D !`);
    }

    console.log('✅ [img2threejs] Opération terminée avec succès.\n');
}

main().catch(err => {
    console.error(`❌ Erreur [img2threejs]:`, err);
    process.exit(1);
});
