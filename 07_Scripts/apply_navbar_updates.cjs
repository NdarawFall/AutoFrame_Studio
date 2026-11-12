const fs = require('fs');
const path = require('path');

// 1. UPDATE 09_Pages/home.html
const homePath = path.join(__dirname, '../09_Pages/home.html');
let homeHtml = fs.readFileSync(homePath, 'utf8');

// Add social buttons styles to home.html if not already present
const socialStyles = `
        /* --- SOCIAL BUTTONS (GITHUB & LINKEDIN) --- */
        .nav-social-links {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .social-link-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-sm);
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition-smooth);
            cursor: pointer;
        }

        .social-link-btn svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
            transition: var(--transition-smooth);
        }

        .social-link-btn:hover {
            transform: translateY(-2px);
        }

        .social-link-btn.btn-github:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.45);
            box-shadow: 0 4px 14px rgba(255, 255, 255, 0.12);
        }

        .social-link-btn.btn-linkedin:hover {
            color: #38bdf8;
            background: rgba(14, 118, 168, 0.15);
            border-color: rgba(56, 189, 248, 0.55);
            box-shadow: 0 4px 16px rgba(14, 118, 168, 0.35);
        }
`;

if (!homeHtml.includes('.nav-social-links')) {
    homeHtml = homeHtml.replace('    </style>', `${socialStyles}\n    </style>`);
}

// Add the social links to top-nav on home.html
const socialNavHtml = `        <div class="nav-social-links">
            <a href="https://github.com/NdarawFall/Vibe_Editor_App" target="_blank" rel="noopener noreferrer" class="social-link-btn btn-github" title="Projet GitHub (Vibe_Editor_App)" aria-label="GitHub">
                <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/ndaraw-fall/" target="_blank" rel="noopener noreferrer" class="social-link-btn btn-linkedin" title="Profil LinkedIn (Ndaraw Fall)" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
        </div>`;

// Replace empty inside header
homeHtml = homeHtml.replace(
    /(<header class="top-nav">[\s\S]*?<div class="nav-left">[\s\S]*?<\/div>)([\s\S]*?)(<\/header>)/,
    `$1\n\n${socialNavHtml}\n    $3`
);

fs.writeFileSync(homePath, homeHtml, 'utf8');
console.log('✅ home.html updated with GitHub and LinkedIn social icons!');

// 2. UPDATE 09_Pages/monteur.html
const monteurPath = path.join(__dirname, '../09_Pages/monteur.html');
let monteurHtml = fs.readFileSync(monteurPath, 'utf8');

// Replace top-nav CSS in monteur.html with exact channels.html styling
const oldTopNavCssRegex = /\/\* --- TOP NAVIGATION BAR --- \*\/[\s\S]*?svg\.icon \{[\s\S]*?\}/;
const channelsNavbarCss = `/* --- TOP NAVIGATION BAR (IDENTIQUE À CHANNELS.HTML) --- */
        header.top-nav {
            height: 58px;
            background: rgba(10, 10, 10, 0.85);
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 28px;
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: blur(14px);
        }

        .nav-left {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .brand-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 900;
            font-size: 16px;
            letter-spacing: -0.4px;
            background: linear-gradient(135deg, #ffffff 15%, #ff7b8a 52%, #ff2e43 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-decoration: none;
            filter: drop-shadow(0 0 14px rgba(255, 51, 68, 0.3));
        }

        .badge-monteur {
            background: rgba(220, 38, 38, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.35);
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .nav-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            padding: 7px 14px;
            border-radius: var(--radius-sm);
            text-decoration: none;
            cursor: pointer;
            transition: var(--transition-smooth, all 0.25s cubic-bezier(0.16, 1, 0.3, 1));
        }

        .nav-btn:hover {
            color: var(--text-primary);
            background: var(--bg-hover);
            border-color: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
        }

        .nav-btn.active {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.4);
            color: #ffffff;
            font-weight: 600;
        }

        .nav-btn.btn-create-video {
            background: #dc2626;
            color: #ffffff !important;
            border-color: #ef4444;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
        }

        .nav-btn.btn-create-video:hover {
            background: #b91c1c;
            border-color: #f87171;
            color: #ffffff !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
        }

        svg.icon {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 2;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
            display: inline-block;
            vertical-align: middle;
            flex-shrink: 0;
        }`;

monteurHtml = monteurHtml.replace(oldTopNavCssRegex, channelsNavbarCss);

// Replace header HTML in monteur.html:
// Remove Chaines button completely, keep Studio, Assets, Paramètres, Créer une Vidéo matching channels.html
const oldHeaderRegex = /<!-- TOP NAVIGATION BAR -->[\s\S]*?<header class="top-nav">[\s\S]*?<\/header>/;
const channelsHeaderForMonteur = `<!-- TOP NAVIGATION BAR (DESIGN IDENTIQUE À CHANNELS, SANS BOUTON CHAÎNES) -->
    <header class="top-nav">
        <div class="nav-left">
            <a href="home.html" class="nav-btn" title="Accueil (Home)">
                <svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Accueil</span>
            </a>
            <a href="home.html" class="brand-badge">
                <span>VibeEditor 1.0</span>
            </a>
            <span class="badge-monteur">Espace Monteur</span>
        </div>

        <nav class="nav-links">
            <a href="studio.html" class="nav-btn">
                <svg class="icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line></svg>
                <span>Studio</span>
            </a>
            <a href="assets.html" class="nav-btn">
                <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>Assets</span>
            </a>
            <a href="settings.html" class="nav-btn">
                <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Paramètres</span>
            </a>
            <a href="create_video.html" class="nav-btn btn-create-video">
                <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Créer une Vidéo</span>
            </a>
        </nav>
    </header>`;

monteurHtml = monteurHtml.replace(oldHeaderRegex, channelsHeaderForMonteur);

fs.writeFileSync(monteurPath, monteurHtml, 'utf8');
console.log('✅ monteur.html updated with matching channels navbar without chaines button!');

