const fs = require('fs');
const path = require('path');

// =============================================================================
// 1. MISE À JOUR DE 09_Pages/home.html
// =============================================================================
const homePath = path.join(__dirname, '..', '09_Pages', 'home.html');
let homeContent = fs.readFileSync(homePath, 'utf8');

// A. Supprimer tous les boutons à droite dans la top-nav (<nav class="nav-links">...</nav>)
const navLinksRegex = /<nav class="nav-links">[\s\S]*?<\/nav>/;
if (navLinksRegex.test(homeContent)) {
    homeContent = homeContent.replace(navLinksRegex, '');
    console.log('Removed top-nav right buttons on home.html');
}

// B. Harmoniser la card Monteur en ROUGE sur home.html
homeContent = homeContent.replace(
    /\.card-monteur:hover \{[\s\S]*?\}/,
    `.card-monteur:hover {
            border-color: rgba(239, 68, 68, 0.55);
            box-shadow: 0 18px 45px rgba(220, 38, 38, 0.28), 0 0 0 1px rgba(239, 68, 68, 0.35);
        }`
);

homeContent = homeContent.replace(
    /\.icon-monteur \{[\s\S]*?\}/,
    `.icon-monteur {
            background: rgba(220, 38, 38, 0.16);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }`
);

homeContent = homeContent.replace(
    /\.card-monteur:hover \.icon-monteur \{[\s\S]*?\}/,
    `.card-monteur:hover .icon-monteur {
            background: #dc2626;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
        }`
);

homeContent = homeContent.replace(
    /\.tag-monteur \{[\s\S]*?\}/,
    `.tag-monteur {
            background: rgba(220, 38, 38, 0.12);
            color: #f87171;
            border: 1px solid rgba(220, 38, 38, 0.25);
        }`
);

homeContent = homeContent.replace(
    /\.card-monteur \.workspace-card-footer \{ color: #60a5fa; \}/,
    `.card-monteur .workspace-card-footer { color: #f87171; }`
);

fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('Saved home.html successfully');

// =============================================================================
// 2. MISE À JOUR DE 09_Pages/monteur.html (PASSAGE EN 100% THÈME ROUGE)
// =============================================================================
const monteurPath = path.join(__dirname, '..', '09_Pages', 'monteur.html');
let monteurContent = fs.readFileSync(monteurPath, 'utf8');

// A. Remplacer les dégradés et badges bleus par du rouge
monteurContent = monteurContent.replace(
    /background: linear-gradient\(135deg, #ffffff 15%, #60a5fa 55%, #3b82f6 100%\);/g,
    'background: linear-gradient(135deg, #ffffff 15%, #ff7b8a 52%, #ff2e43 100%);'
);

monteurContent = monteurContent.replace(
    /\.badge-monteur \{[\s\S]*?\}/,
    `.badge-monteur {
            background: rgba(220, 38, 38, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.35);
            font-size: 11px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }`
);

// B. Bouton Nouveau Client en ROUGE
monteurContent = monteurContent.replace(
    /\.btn-create-client \{[\s\S]*?\}/,
    `.btn-create-client {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #dc2626;
            border: 1px solid #ef4444;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            padding: 9px 18px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
        }`
);

monteurContent = monteurContent.replace(
    /\.btn-create-client:hover \{[\s\S]*?\}/,
    `.btn-create-client:hover {
            transform: translateY(-1px);
            background: #b91c1c;
            border-color: #f87171;
            box-shadow: 0 6px 18px rgba(220, 38, 38, 0.5);
        }`
);

// C. Carte client active en ROUGE
monteurContent = monteurContent.replace(
    /\.client-card\.active \{[\s\S]*?\}/,
    `.client-card.active {
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(30, 20, 24, 0.4));
            border-color: #ef4444;
            box-shadow: 0 0 0 1px #ef4444, 0 6px 18px rgba(220, 38, 38, 0.22);
        }`
);

monteurContent = monteurContent.replace(
    /\.client-card\.active \.client-asset-count \{[\s\S]*?\}/,
    `.client-card.active .client-asset-count {
            background: rgba(220, 38, 38, 0.25);
            color: #fca5a5;
        }`
);

// D. Avatar client en ROUGE
monteurContent = monteurContent.replace(
    /\.client-avatar-large \{[\s\S]*?\}/,
    `.client-avatar-large {
            width: 38px;
            height: 38px;
            border-radius: 8px;
            background: linear-gradient(135deg, #991b1b, #ef4444);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 15px;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }`
);

// E. Dropzone hover en ROUGE
monteurContent = monteurContent.replace(
    /\.dropzone:hover, \.dropzone\.dragover \{[\s\S]*?\}/,
    `.dropzone:hover, .dropzone.dragover {
            border-color: #ef4444;
            background: rgba(220, 38, 38, 0.08);
        }`
);

monteurContent = monteurContent.replace(
    /\.dropzone:hover \.dropzone-icon \{[\s\S]*?\}/,
    `.dropzone:hover .dropzone-icon {
            color: #f87171;
        }`
);

// F. Input focus en ROUGE
monteurContent = monteurContent.replace(
    /\.form-input:focus \{[\s\S]*?\}/,
    `.form-input:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
        }`
);

// G. Code tag modal color
monteurContent = monteurContent.replace(
    /color:#60a5fa;/g,
    'color:#f87171;'
);

fs.writeFileSync(monteurPath, monteurContent, 'utf8');
console.log('Saved monteur.html in 100% red theme successfully');
