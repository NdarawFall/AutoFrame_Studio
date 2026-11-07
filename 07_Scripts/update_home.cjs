const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '09_Pages', 'home.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ajouter le lien Monteur dans la top-nav
const oldNav = `<a href="channels.html" class="nav-btn">`;
const newNav = `<a href="monteur.html" class="nav-btn" style="color: #60a5fa; border-color: rgba(59, 130, 246, 0.35);">
                <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>Espace Monteur</span>
            </a>
            <a href="channels.html" class="nav-btn">`;

if (!content.includes('Espace Monteur') && content.includes(oldNav)) {
    content = content.replace(oldNav, newNav);
    console.log('Top nav updated with Monteur link');
}

// 2. Remplacer les styles .stats-bar par les styles des 2 cards
const statsCssIndex = content.indexOf('/* --- STATS BAR CENTRÉE --- */');
const avatarCssIndex = content.indexOf('/* --- AVATARS DE FOND HOMEPAGE');

if (statsCssIndex !== -1 && avatarCssIndex !== -1) {
    const newCardsCss = `/* --- 2 GRANDES CARDS D'ESPACES DE TRAVAIL (CRÉATEUR & MONTEUR) --- */
        .workspace-cards-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: clamp(14px, 2.2vw, 24px);
            width: 100%;
            max-width: 860px;
            margin-top: 6px;
            z-index: 10;
        }

        @media (max-width: 768px) {
            .workspace-cards-container {
                grid-template-columns: 1fr;
            }
        }

        .workspace-card {
            background: rgba(14, 16, 22, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: var(--radius-lg);
            padding: clamp(18px, 2.2vh, 24px);
            text-decoration: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: left;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: var(--transition-smooth);
            cursor: pointer;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
        }

        .workspace-card:hover {
            transform: translateY(-4px);
            background: rgba(20, 24, 34, 0.98);
        }

        /* Card Créateur : Lueur Rouge Studio */
        .card-creator:hover {
            border-color: rgba(239, 68, 68, 0.55);
            box-shadow: 0 18px 45px rgba(220, 38, 38, 0.28), 0 0 0 1px rgba(239, 68, 68, 0.35);
        }

        /* Card Monteur : Lueur Bleue Électrique */
        .card-monteur:hover {
            border-color: rgba(59, 130, 246, 0.55);
            box-shadow: 0 18px 45px rgba(37, 99, 235, 0.28), 0 0 0 1px rgba(59, 130, 246, 0.35);
        }

        .workspace-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .workspace-card-icon {
            width: 44px;
            height: 44px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition-smooth);
        }

        .workspace-card-icon svg {
            width: 22px;
            height: 22px;
        }

        .icon-creator {
            background: rgba(220, 38, 38, 0.16);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .card-creator:hover .icon-creator {
            background: #dc2626;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
        }

        .icon-monteur {
            background: rgba(37, 99, 235, 0.16);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .card-monteur:hover .icon-monteur {
            background: #2563eb;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);
        }

        .workspace-card-tag {
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .tag-creator {
            background: rgba(220, 38, 38, 0.12);
            color: #f87171;
            border: 1px solid rgba(220, 38, 38, 0.25);
        }

        .tag-monteur {
            background: rgba(37, 99, 235, 0.12);
            color: #93c5fd;
            border: 1px solid rgba(37, 99, 235, 0.25);
        }

        .workspace-card-body {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .workspace-card-title {
            font-size: clamp(16px, 1.8vh, 18px);
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.3px;
        }

        .workspace-card-desc {
            font-size: clamp(12px, 1.4vh, 13px);
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .workspace-card-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 700;
            margin-top: auto;
            padding-top: 6px;
            transition: var(--transition-smooth);
        }

        .card-creator .workspace-card-footer { color: #f87171; }
        .card-monteur .workspace-card-footer { color: #60a5fa; }

        .workspace-card:hover .workspace-card-footer svg {
            transform: translateX(4px);
        }

        `;
    content = content.slice(0, statsCssIndex) + newCardsCss + content.slice(avatarCssIndex);
    console.log('CSS updated successfully');
}

// 3. Remplacer les boutons et le texte superflu du bas dans le Hero HTML
const heroActionsStart = content.indexOf('<div class="hero-actions">');
const heroSectionEnd = content.indexOf('</section>\n    </main>') !== -1
    ? content.indexOf('</section>\n    </main>')
    : content.indexOf('</section>');

if (heroActionsStart !== -1 && heroSectionEnd !== -1) {
    const newHeroBottom = `<div class="hero-actions">
                <!-- 1. BOUTON SUIVRE LE TUTO (Grand bouton épuré fond blanc, texte noir) -->
                <button type="button" class="btn-hero-tuto" onclick="openTutorialModal()" title="Visionner le tutoriel vidéo">
                    <svg class="icon" viewBox="0 0 24 24" style="fill: currentColor; width: 18px; height: 18px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>Suivre le tuto</span>
                </button>
            </div>

            <!-- 2 GRANDES CARDS D'ACCÈS : CRÉATEUR DE CONTENU & MONTEUR VIDÉO -->
            <div class="workspace-cards-container">
                <!-- CARD 1 : CRÉATEUR DE CONTENU (Redirection vers channels.html) -->
                <a href="channels.html" class="workspace-card card-creator" title="Accéder à l'espace Créateur de Contenu">
                    <div class="workspace-card-top">
                        <div class="workspace-card-icon icon-creator">
                            <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        </div>
                        <span class="workspace-card-tag tag-creator">Créateur de Contenu</span>
                    </div>
                    <div class="workspace-card-body">
                        <h3 class="workspace-card-title">Gérer mes Chaînes & Vidéos</h3>
                        <p class="workspace-card-desc">Pilotez vos chaînes YouTube & TikTok, générez des scripts automatisés et produisez des formats courts percutants.</p>
                    </div>
                    <div class="workspace-card-footer">
                        <span>Ouvrir les Chaînes</span>
                        <svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </a>

                <!-- CARD 2 : MONTEUR VIDÉO (Redirection vers monteur.html) -->
                <a href="monteur.html" class="workspace-card card-monteur" title="Accéder à l'espace Monteur Vidéo & Clients">
                    <div class="workspace-card-top">
                        <div class="workspace-card-icon icon-monteur">
                            <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <span class="workspace-card-tag tag-monteur">Monteur Vidéo</span>
                    </div>
                    <div class="workspace-card-body">
                        <h3 class="workspace-card-title">Espace Clients & Rushes</h3>
                        <p class="workspace-card-desc">Créez vos dossiers clients et centralisez les 5 types d'assets essentiels : rushes bruts, voix off, musiques, clips et références.</p>
                    </div>
                    <div class="workspace-card-footer">
                        <span>Gérer les Clients</span>
                        <svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </a>
            </div>
        `;
    content = content.slice(0, heroActionsStart) + newHeroBottom + content.slice(heroSectionEnd);
    console.log('HTML updated successfully');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('09_Pages/home.html saved!');
