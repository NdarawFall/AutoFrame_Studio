// État Global
        let allAssets = [];
        let filteredAssets = [];
        let catalogStats = {};
        let activeType = 'all';
        let activeSubfolder = 'all';
        let searchQuery = '';
        let viewMode = 'grid'; // 'grid' | 'list'
        let currentModalAsset = null;

        // Gestionnaire Audio Global (Un seul audio ou vidéo en lecture à la fois)
        let activeAudioElement = null;
        let activePlayButton = null;
        let activeAudioCard = null;

        // Initialisation
        window.addEventListener('DOMContentLoaded', async () => {
            setupSearchListeners();
            await loadAssetsCatalog();
        });

        // 1. Chargement des Assets depuis le serveur
        async function loadAssetsCatalog() {
            try {
                const res = await fetch('/api/assets-catalog');
                if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
                const data = await res.json();
                
                if (data.success) {
                    allAssets = data.items || [];
                    catalogStats = data.stats || {};
                    renderStats();
                    renderCategoryCounts();
                    renderSubfoldersList();
                    applyFilters();
                } else {
                    showToast('Erreur : ' + (data.error || 'Impossible de lire les assets'));
                }
            } catch (err) {
                console.error('Erreur chargement assets :', err);
                showToast('Impossible de contacter le serveur local');
            }
        }

        // 2. Affichage des Statistiques
        function renderStats() {
            document.getElementById('statTotalCount').textContent = catalogStats.totalCount || allAssets.length;
            document.getElementById('statTotalSize').textContent = catalogStats.totalSizeFormatted || '--';
            document.getElementById('statImagesCount').textContent = (catalogStats.imagesCount || 0) + (catalogStats.vectorsCount || 0);
            document.getElementById('statVideosCount').textContent = catalogStats.videosCount || 0;
            document.getElementById('statAudiosCount').textContent = catalogStats.audiosCount || 0;
            document.getElementById('statVectorsCount').textContent = catalogStats.vectorsCount || 0;
        }

        // 3. Mise à jour des compteurs sur les onglets
        function renderCategoryCounts() {
            document.getElementById('tabCountAll').textContent = allAssets.length;
            document.getElementById('tabCountImage').textContent = allAssets.filter(a => a.type === 'image').length;
            document.getElementById('tabCountVideo').textContent = allAssets.filter(a => a.type === 'video').length;
            document.getElementById('tabCountAudio').textContent = allAssets.filter(a => a.type === 'audio').length;
            document.getElementById('tabCountVector').textContent = allAssets.filter(a => a.type === 'vector').length;
        }

        // 4. Construction des Chips de Sous-dossiers
        function renderSubfoldersList() {
            const container = document.getElementById('subfoldersChips');
            
            // Collecter tous les sous-dossiers pertinents
            const subfolderSet = new Set();
            allAssets.forEach(item => {
                // Si on a un filtre de type actif, filtrer aussi les sous-dossiers pertinents
                if (activeType === 'all' || item.type === activeType) {
                    const label = item.subfolder !== 'Racine' ? `${item.category}/${item.subfolder}` : item.category;
                    subfolderSet.add(label);
                }
            });

            const sortedList = Array.from(subfolderSet).sort();

            let html = `
                <button class="subfolder-chip ${activeSubfolder === 'all' ? 'active' : ''}" onclick="selectSubfolderFilter('all')">
                    Tous les dossiers
                </button>
            `;

            sortedList.forEach(folder => {
                const isSelected = activeSubfolder === folder;
                html += `
                    <button class="subfolder-chip ${isSelected ? 'active' : ''}" onclick="selectSubfolderFilter('${escapeHtml(folder)}')">
                        ${escapeHtml(folder)}
                    </button>
                `;
            });

            container.innerHTML = html;
        }

        // 5. Gestion des Filtres et Recherche
        function setupSearchListeners() {
            const input = document.getElementById('searchInput');
            const clearBtn = document.getElementById('searchClearBtn');

            input.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                clearBtn.style.display = searchQuery ? 'block' : 'none';
                applyFilters();
            });

            // Raccourci '/' pour focus rapide sur la recherche
            window.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== input) {
                    e.preventDefault();
                    input.focus();
                } else if (e.key === 'Escape') {
                    if (document.getElementById('previewModal').style.display === 'flex') {
                        closePreviewModal();
                    } else if (document.getElementById('uploadModal').style.display === 'flex') {
                        closeUploadModal();
                    } else if (searchQuery) {
                        clearSearch();
                    }
                }
            });
        }

        function clearSearch() {
            const input = document.getElementById('searchInput');
            input.value = '';
            searchQuery = '';
            document.getElementById('searchClearBtn').style.display = 'none';
            applyFilters();
            input.focus();
        }

        function selectTypeFilter(type) {
            activeType = type;
            document.querySelectorAll('#categoryTabs .tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === type);
            });
            activeSubfolder = 'all';
            renderSubfoldersList();
            applyFilters();
        }

        function selectSubfolderFilter(subfolder) {
            activeSubfolder = subfolder;
            document.querySelectorAll('#subfoldersChips .subfolder-chip').forEach(chip => {
                chip.classList.toggle('active', chip.textContent.trim() === (subfolder === 'all' ? 'Tous les dossiers' : subfolder));
            });
            applyFilters();
        }

        function resetFilters() {
            searchQuery = '';
            activeType = 'all';
            activeSubfolder = 'all';
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClearBtn').style.display = 'none';
            document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
            renderSubfoldersList();
            applyFilters();
        }

        // 6. Application des Filtres & Tri
        function applyFilters() {
            // Arrêter toute lecture en cours pour éviter les collisions audio orphelines
            stopCurrentAudio();

            filteredAssets = allAssets.filter(item => {
                // Filtre Type
                if (activeType !== 'all') {
                    if (activeType === 'image' && item.type !== 'image') return false;
                    if (activeType === 'video' && item.type !== 'video') return false;
                    if (activeType === 'audio' && item.type !== 'audio') return false;
                    if (activeType === 'vector' && item.type !== 'vector') return false;
                }

                // Filtre Sous-dossier
                if (activeSubfolder !== 'all') {
                    const currentFolderLabel = item.subfolder !== 'Racine' ? `${item.category}/${item.subfolder}` : item.category;
                    if (currentFolderLabel !== activeSubfolder) return false;
                }

                // Filtre Recherche
                if (searchQuery) {
                    const matchName = item.name.toLowerCase().includes(searchQuery);
                    const matchCat = item.category.toLowerCase().includes(searchQuery);
                    const matchSub = item.subfolder.toLowerCase().includes(searchQuery);
                    const matchExt = item.ext.toLowerCase().includes(searchQuery);
                    const matchPath = item.relativePath.toLowerCase().includes(searchQuery);
                    if (!matchName && !matchCat && !matchSub && !matchExt && !matchPath) return false;
                }

                return true;
            });

            // Tri
            const sortMode = document.getElementById('sortSelect').value;
            filteredAssets.sort((a, b) => {
                if (sortMode === 'date_desc') return new Date(b.mtime) - new Date(a.mtime);
                if (sortMode === 'date_asc') return new Date(a.mtime) - new Date(b.mtime);
                if (sortMode === 'name_asc') return a.name.localeCompare(b.name, undefined, { numeric: true });
                if (sortMode === 'name_desc') return b.name.localeCompare(a.name, undefined, { numeric: true });
                if (sortMode === 'size_desc') return b.size - a.size;
                if (sortMode === 'size_asc') return a.size - b.size;
                return 0;
            });

            renderAssets();
        }

        // 7. Rendu des Assets (Grille & Liste)
        function renderAssets() {
            const gridContainer = document.getElementById('assetsGrid');
            const tableContainer = document.getElementById('assetsTableWrap');
            const tableBody = document.getElementById('assetsTableBody');
            const emptyState = document.getElementById('emptyState');

            if (filteredAssets.length === 0) {
                gridContainer.style.display = 'none';
                tableContainer.style.display = 'none';
                emptyState.style.display = 'flex';
                document.getElementById('emptyStateDesc').textContent = searchQuery 
                    ? `Aucun asset ne correspond à la recherche "${searchQuery}".`
                    : 'Aucun asset ne correspond aux filtres sélectionnés.';
                return;
            }

            emptyState.style.display = 'none';

            if (viewMode === 'grid') {
                gridContainer.style.display = 'grid';
                tableContainer.style.display = 'none';
                gridContainer.innerHTML = filteredAssets.map(item => createCardHTML(item)).join('');
                bindCardMediaEvents();
            } else {
                gridContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                tableBody.innerHTML = filteredAssets.map(item => createTableRowHTML(item)).join('');
            }
        }

        // 8. Génération HTML de la Carte Asset
        function createCardHTML(item) {
            const safePath = escapeHtml(item.relativePath);
            const safeName = escapeHtml(item.name);
            const safeUrl = item.url;
            const subLabel = item.subfolder !== 'Racine' ? `${item.category}/${item.subfolder}` : item.category;

            let previewContent = '';

            if (item.type === 'image' || item.type === 'vector') {
                previewContent = `
                    <img class="asset-img" src="${safeUrl}" alt="${safeName}" loading="lazy">
                    <div class="preview-overlay">
                        <button class="overlay-btn" onclick="openPreviewModal('${escapeHtml(item.id)}')" title="Agrandir / Détails">
                            <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <button class="overlay-btn" onclick="copyAssetPath('${safePath}')" title="Copier le chemin">
                            <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <a class="overlay-btn" href="${safeUrl}" download="${safeName}" title="Télécharger">
                            <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <button class="overlay-btn danger" onclick="deleteAsset('${safePath}')" title="Supprimer">
                            <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            } else if (item.type === 'video') {
                previewContent = `
                    <video class="asset-video" src="${safeUrl}" preload="none" muted playsinline></video>
                    <span class="video-duration-badge" id="dur_${item.id}">--:--</span>
                    <div class="preview-overlay">
                        <button class="overlay-btn" onclick="openPreviewModal('${escapeHtml(item.id)}')" title="Lire / Inspecter">
                            <svg class="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </button>
                        <button class="overlay-btn" onclick="copyAssetPath('${safePath}')" title="Copier le chemin">
                            <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <a class="overlay-btn" href="${safeUrl}" download="${safeName}" title="Télécharger">
                            <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <button class="overlay-btn danger" onclick="deleteAsset('${safePath}')" title="Supprimer">
                            <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            } else if (item.type === 'audio') {
                // CARTE AUDIO INTERACTIVE AVEC PLAY / PAUSE / TIMELINE
                previewContent = `
                    <div class="asset-audio-preview" id="audioContainer_${item.id}">
                        <div class="audio-disc-icon" id="playBtn_${item.id}" onclick="togglePlayAudio('${escapeHtml(item.id)}', '${safeUrl}')" title="Écouter l'audio">
                            <svg class="icon play-icon" viewBox="0 0 24 24" style="width:22px; height:22px; fill:currentColor;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                        
                        <div class="equalizer-bars">
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                        </div>

                        <div class="audio-timeline-wrap">
                            <div class="audio-slider-row">
                                <input type="range" class="audio-scrubber" id="scrubber_${item.id}" min="0" max="100" value="0" oninput="seekAudio('${item.id}', this.value)">
                            </div>
                            <div class="audio-time-label">
                                <span id="curTime_${item.id}">00:00</span>
                                <span id="totTime_${item.id}">--:--</span>
                            </div>
                        </div>

                        <audio id="audioEl_${item.id}" src="${safeUrl}" preload="none"></audio>
                    </div>
                `;
            } else {
                previewContent = `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; color:var(--text-muted);">
                        <svg class="icon" style="width:40px; height:40px;" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                        <span style="font-size:11px; font-family:'JetBrains Mono',monospace;">${escapeHtml(item.ext.toUpperCase())}</span>
                    </div>
                `;
            }

            return `
                <div class="asset-card" data-id="${item.id}" data-type="${item.type}">
                    <div class="asset-preview">
                        ${previewContent}
                    </div>
                    <div class="asset-details">
                        <div class="asset-name-row">
                            <span class="asset-name" title="${safeName}">${safeName}</span>
                        </div>
                        <div class="asset-meta-tags">
                            <span class="badge-type ${item.type}">${item.type}</span>
                            <span class="badge-subfolder" title="${subLabel}">${escapeHtml(subLabel)}</span>
                            <span class="badge-size">${item.sizeFormatted}</span>
                        </div>
                        <div class="asset-path-action">
                            <span class="asset-path-text" title="${safePath}">${safePath}</span>
                            <button class="btn-copy-code" onclick="copyAssetPath('${safePath}')" title="Copier le chemin relatif">
                                <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copier</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 9. Génération HTML de la Vue Liste / Tableau
        function createTableRowHTML(item) {
            const safePath = escapeHtml(item.relativePath);
            const safeName = escapeHtml(item.name);
            const safeUrl = item.url;
            const subLabel = item.subfolder !== 'Racine' ? `${item.category}/${item.subfolder}` : item.category;

            let thumb = '';
            if (item.type === 'image' || item.type === 'vector') {
                thumb = `<img class="table-thumb" src="${safeUrl}" alt="" loading="lazy">`;
            } else if (item.type === 'video') {
                thumb = `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;color:#fbbf24;"><svg class="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>`;
            } else if (item.type === 'audio') {
                thumb = `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;color:#ff6b7a;"><svg class="icon" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
            } else {
                thumb = `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;color:#a78bfa;"><svg class="icon" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg></div>`;
            }

            const formattedDate = new Date(item.mtime).toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return `
                <tr>
                    <td>${thumb}</td>
                    <td>
                        <strong style="color:#fff; cursor:pointer;" onclick="openPreviewModal('${escapeHtml(item.id)}')">${safeName}</strong>
                        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-muted);">${safePath}</div>
                    </td>
                    <td><span class="badge-type ${item.type}">${item.category}</span></td>
                    <td><span class="badge-subfolder">${escapeHtml(subLabel)}</span></td>
                    <td><span style="font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--text-secondary);">${item.ext.toUpperCase()}</span></td>
                    <td><span style="font-family:'JetBrains Mono',monospace; font-size:11.5px;">${item.sizeFormatted}</span></td>
                    <td style="font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--text-muted);">${formattedDate}</td>
                    <td style="text-align:right;">
                        <button class="btn-action" style="padding:4px 8px;" onclick="copyAssetPath('${safePath}')" title="Copier chemin">
                            <svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button class="btn-action" style="padding:4px 8px;" onclick="openPreviewModal('${escapeHtml(item.id)}')">
                            <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        }

        // 10. Gestionnaires Vidéos & Audios
        function bindCardMediaEvents() {
            // Durée des vidéos
            document.querySelectorAll('.asset-video').forEach(vid => {
                const badge = vid.parentElement.querySelector('.video-duration-badge');
                vid.addEventListener('loadedmetadata', () => {
                    if (badge) badge.textContent = formatDuration(vid.duration);
                });
                // Survol lecture discrète
                vid.parentElement.addEventListener('mouseenter', () => {
                    vid.play().catch(() => {});
                });
                vid.parentElement.addEventListener('mouseleave', () => {
                    vid.pause();
                    vid.currentTime = 0;
                });
            });

            // Initialisation de la durée des audios
            document.querySelectorAll('.asset-audio-preview audio').forEach(aud => {
                const id = aud.id.replace('audioEl_', '');
                const totLabel = document.getElementById(`totTime_${id}`);
                aud.addEventListener('loadedmetadata', () => {
                    if (totLabel) totLabel.textContent = formatDuration(aud.duration);
                });
            });
        }

        // 11. Lecteur Audio Intéractif Personnalisé
        function togglePlayAudio(id, url) {
            const audio = document.getElementById(`audioEl_${id}`);
            const btn = document.getElementById(`playBtn_${id}`);
            const container = document.getElementById(`audioContainer_${id}`);
            const scrubber = document.getElementById(`scrubber_${id}`);
            const curTimeLabel = document.getElementById(`curTime_${id}`);
            const totTimeLabel = document.getElementById(`totTime_${id}`);

            if (!audio) return;

            // Si déjà en cours de lecture sur ce même audio : mettre en pause
            if (activeAudioElement === audio && !audio.paused) {
                audio.pause();
                stopCurrentAudio();
                return;
            }

            // Arrêter tout autre audio en cours
            stopCurrentAudio();

            // Lancer le nouvel audio
            activeAudioElement = audio;
            activePlayButton = btn;
            activeAudioCard = container;

            btn.classList.add('playing');
            container.classList.add('playing');
            btn.innerHTML = `<svg class="icon pause-icon" viewBox="0 0 24 24" style="width:22px; height:22px; fill:currentColor;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

            audio.play().catch(e => {
                console.warn('Lecture audio bloquée :', e);
                stopCurrentAudio();
            });

            audio.ontimeupdate = () => {
                if (audio.duration) {
                    const pct = (audio.currentTime / audio.duration) * 100;
                    if (scrubber) scrubber.value = pct;
                    if (curTimeLabel) curTimeLabel.textContent = formatDuration(audio.currentTime);
                    if (totTimeLabel && totTimeLabel.textContent === '--:--') {
                        totTimeLabel.textContent = formatDuration(audio.duration);
                    }
                }
            };

            audio.onended = () => {
                stopCurrentAudio();
                if (scrubber) scrubber.value = 0;
                if (curTimeLabel) curTimeLabel.textContent = '00:00';
            };
        }

        function seekAudio(id, percent) {
            const audio = document.getElementById(`audioEl_${id}`);
            if (audio && audio.duration) {
                audio.currentTime = (percent / 100) * audio.duration;
            }
        }

        function stopCurrentAudio() {
            if (activeAudioElement) {
                activeAudioElement.pause();
                activeAudioElement.ontimeupdate = null;
                activeAudioElement = null;
            }
            if (activePlayButton) {
                activePlayButton.classList.remove('playing');
                activePlayButton.innerHTML = `<svg class="icon play-icon" viewBox="0 0 24 24" style="width:22px; height:22px; fill:currentColor;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                activePlayButton = null;
            }
            if (activeAudioCard) {
                activeAudioCard.classList.remove('playing');
                activeAudioCard = null;
            }
        }

        // 12. Modal Lightbox & Détails
        function openPreviewModal(assetId) {
            const item = allAssets.find(a => a.id === assetId);
            if (!item) return;

            stopCurrentAudio();
            currentModalAsset = item;

            const modal = document.getElementById('previewModal');
            const fileNameEl = document.getElementById('modalFileName');
            const bodyEl = document.getElementById('modalBody');
            const metaGridEl = document.getElementById('modalMetaGrid');
            const downloadBtn = document.getElementById('modalDownloadBtn');

            fileNameEl.textContent = item.name;
            downloadBtn.href = item.url;
            downloadBtn.download = item.name;

            // Rendu Preview selon le type
            if (item.type === 'image' || item.type === 'vector') {
                bodyEl.innerHTML = `<img class="modal-preview-media" src="${item.url}" alt="${escapeHtml(item.name)}">`;
            } else if (item.type === 'video') {
                bodyEl.innerHTML = `
                    <video class="modal-preview-media" src="${item.url}" controls autoplay playsinline style="max-height:60vh; width:100%;"></video>
                `;
            } else if (item.type === 'audio') {
                bodyEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:20px; width:100%; max-width:480px; padding:30px;">
                        <div style="width:80px; height:80px; border-radius:50%; background:rgba(255,51,68,0.15); display:flex; align-items:center; justify-content:center; color:var(--accent-red); border:1px solid rgba(255,51,68,0.3);">
                            <svg class="icon" style="width:36px; height:36px;" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        </div>
                        <audio src="${item.url}" controls autoplay style="width:100%;"></audio>
                    </div>
                `;
            } else {
                bodyEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:12px; color:var(--text-muted);">
                        <svg class="icon" style="width:64px; height:64px;" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>
                        <span style="font-family:'JetBrains Mono',monospace;">Fichier binaire (${item.ext})</span>
                    </div>
                `;
            }

            const formattedDate = new Date(item.mtime).toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            metaGridEl.innerHTML = `
                <span><strong>Catégorie :</strong> ${escapeHtml(item.category)}</span>
                <span><strong>Sous-dossier :</strong> ${escapeHtml(item.subfolder)}</span>
                <span><strong>Taille :</strong> ${item.sizeFormatted}</span>
                <span><strong>Modifié le :</strong> ${formattedDate}</span>
            `;

            modal.style.display = 'flex';
        }

        function closePreviewModal() {
            const modal = document.getElementById('previewModal');
            const bodyEl = document.getElementById('modalBody');
            bodyEl.innerHTML = ''; // Arrête toute vidéo/audio
            modal.style.display = 'none';
            currentModalAsset = null;
        }

        function closeModalOnBackdrop(e) {
            if (e.target.id === 'previewModal') closePreviewModal();
        }

        function copyModalPath() {
            if (currentModalAsset) {
                copyAssetPath(currentModalAsset.relativePath);
            }
        }

        // 13. Copie dans le Presse-Papier
        function copyAssetPath(path) {
            navigator.clipboard.writeText(path).then(() => {
                showToast(`✓ Chemin copié : ${path}`);
            }).catch(() => {
                showToast(`Chemin : ${path}`);
            });
        }

        // 14. Suppression d'un Asset
        async function deleteAsset(relativePath) {
            if (!confirm(`Voulez-vous vraiment supprimer définitivement ce fichier ?\n\n${relativePath}`)) {
                return;
            }

            try {
                const res = await fetch('/api/delete-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ relativePath })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Fichier supprimé avec succès');
                    await loadAssetsCatalog();
                } else {
                    showToast('Erreur : ' + (data.error || 'Impossible de supprimer'));
                }
            } catch (err) {
                showToast('Erreur réseau lors de la suppression');
            }
        }

        // 15. Import / Upload d'Assets
        let uploadFileBuffer = null;
        let uploadFileName = '';

        function openUploadModal() {
            uploadFileBuffer = null;
            uploadFileName = '';
            document.getElementById('fileInputUpload').value = '';
            document.getElementById('uploadDropText').textContent = 'Glissez un fichier ici ou cliquez pour parcourir';
            document.getElementById('btnConfirmUpload').disabled = true;
            document.getElementById('uploadModal').style.display = 'flex';
        }

        function closeUploadModal() {
            document.getElementById('uploadModal').style.display = 'none';
        }

        function closeUploadOnBackdrop(e) {
            if (e.target.id === 'uploadModal') closeUploadModal();
        }

        function handleFileSelected(e) {
            const file = e.target.files[0];
            if (!file) return;
            processSelectedFile(file);
        }

        function processSelectedFile(file) {
            uploadFileName = file.name;
            document.getElementById('uploadDropText').textContent = `Fichier sélectionné : ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            
            // Auto-détecter catégorie par extension
            const ext = file.name.split('.').pop().toLowerCase();
            const catSelect = document.getElementById('uploadCategorySelect');
            if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
                catSelect.value = 'Voix_Off';
            } else if (['mp4', 'webm', 'mov'].includes(ext)) {
                catSelect.value = 'Videos';
            } else if (['svg'].includes(ext)) {
                catSelect.value = 'Logos';
            } else {
                catSelect.value = 'Images';
            }

            const reader = new FileReader();
            reader.onload = (evt) => {
                uploadFileBuffer = evt.target.result.split(',')[1]; // Base64 pure
                document.getElementById('btnConfirmUpload').disabled = false;
            };
            reader.readAsDataURL(file);
        }

        // Drag & Drop dans la dropzone
        const dropzone = document.getElementById('uploadDropzone');
        ['dragenter', 'dragover'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
            });
        });
        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length) {
                processSelectedFile(e.dataTransfer.files[0]);
            }
        });

        async function submitUpload() {
            if (!uploadFileBuffer || !uploadFileName) return;

            const category = document.getElementById('uploadCategorySelect').value;
            const subfolder = document.getElementById('uploadSubfolderInput').value.trim();
            const btn = document.getElementById('btnConfirmUpload');

            btn.disabled = true;
            btn.textContent = 'Téléversement...';

            try {
                const res = await fetch('/api/upload-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category,
                        subfolder,
                        filename: uploadFileName,
                        data: uploadFileBuffer
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`✓ Asset importé dans ${data.relativePath}`);
                    closeUploadModal();
                    await loadAssetsCatalog();
                } else {
                    showToast('Erreur : ' + (data.error || 'Échec de l\'upload'));
                }
            } catch (err) {
                showToast('Erreur réseau lors du téléversement');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Lancer l\'Importation';
            }
        }

        // 16. Mode d'affichage Grille / Tableau
        function setViewMode(mode) {
            viewMode = mode;
            document.getElementById('btnViewGrid').classList.toggle('active', mode === 'grid');
            document.getElementById('btnViewList').classList.toggle('active', mode === 'list');
            renderAssets();
        }

        // 17. Utilitaires
        function formatDuration(sec) {
            if (isNaN(sec) || !isFinite(sec)) return '--:--';
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        let toastTimer = null;
        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 3200);
        }

        // --- 18. GESTION DU STOCK VIDÉO COVERR.CO ---
        function openCoverrModal() {
            document.getElementById('coverrModal').style.display = 'flex';
            const input = document.getElementById('coverrSearchInput');
            if (input && !input.value.trim()) {
                input.value = 'nature';
                executeCoverrSearch();
            }
        }

        function closeCoverrModal() {
            document.getElementById('coverrModal').style.display = 'none';
        }

        function closeCoverrOnBackdrop(e) {
            if (e.target.id === 'coverrModal') closeCoverrModal();
        }

        function quickSearchCoverr(tag) {
            document.getElementById('coverrSearchInput').value = tag;
            executeCoverrSearch();
        }

        async function executeCoverrSearch() {
            const query = (document.getElementById('coverrSearchInput').value || 'popular').trim();
            const orient = document.getElementById('coverrOrientationSelect').value;
            const container = document.getElementById('coverrResultsBody');

            container.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 70px 20px;">
                    <div style="width: 38px; height: 38px; border: 3px solid rgba(220, 38, 38, 0.2); border-top-color: #ef4444; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px auto;"></div>
                    <p style="font-size: 14px; font-weight: 600; color: #fff;">Recherche sur Coverr.co en cours...</p>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Récupération des flux vidéo HD & 4K pour « ${escapeHtml(query)} »</p>
                </div>
            `;

            const serverOrigin = (window.location.protocol === 'file:') ? 'http://localhost:3000' : '';
            const storedKey = (localStorage.getItem('vibeeditor_api_coverr') || '').trim();

            let url = `${serverOrigin}/api/coverr/search?query=${encodeURIComponent(query)}&page_size=18`;
            if (orient === 'vertical') url += '&vertical=true';
            if (orient === 'horizontal') url += '&vertical=false';
            if (storedKey) url += `&key=${encodeURIComponent(storedKey)}`;

            try {
                let data = null;
                try {
                    const res = await fetch(url);
                    if (res.ok) data = await res.json();
                } catch (e) {
                    console.warn('Serveur local indisponible pour Coverr, tentative directe:', e);
                }

                // Fallback direct vers api.coverr.co si le serveur local est absent
                if (!data && storedKey) {
                    let directUrl = `https://api.coverr.co/videos?query=${encodeURIComponent(query)}&urls=true&page_size=18`;
                    if (orient === 'vertical') directUrl += '&filter=is_vertical:true';
                    if (orient === 'horizontal') directUrl += '&filter=is_vertical:false';
                    const directRes = await fetch(directUrl, {
                        headers: { 'Authorization': `Bearer ${storedKey}` }
                    });
                    if (directRes.ok) {
                        const directJson = await directRes.json();
                        const hits = Array.isArray(directJson.hits) ? directJson.hits : [];
                        data = {
                            videos: hits.map(hit => {
                                const urls = hit.urls || {};
                                return {
                                    id: hit.id,
                                    title: hit.title || 'Vidéo Coverr',
                                    poster: hit.poster || hit.thumbnail || '',
                                    thumbnail: hit.thumbnail || hit.poster || '',
                                    duration: hit.duration || 0,
                                    aspect_ratio: hit.aspect_ratio || (hit.is_vertical ? '9:16' : '16:9'),
                                    is_vertical: !!hit.is_vertical,
                                    url_download: urls.mp4_download || urls.mp4 || urls.mp4_preview || '',
                                    url_preview: urls.mp4_preview || urls.mp4 || ''
                                };
                            })
                        };
                    } else {
                        const errTxt = await directRes.text();
                        data = { error: `Erreur Coverr (${directRes.status}): ${errTxt}` };
                    }
                }

                if (!data || data.error) {
                    const errMsg = (data && data.error) || 'Impossible de contacter Coverr ou clé API manquante.';
                    container.innerHTML = `
                        <div style="text-align: center; color: var(--text-secondary); padding: 50px 20px; background: rgba(220, 38, 38, 0.05); border: 1px dashed rgba(239, 68, 68, 0.3); border-radius: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(220, 38, 38, 0.15); color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                                <svg class="icon" style="width: 22px; height: 22px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                            <p style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px;">Impossible de joindre Coverr</p>
                            <p style="font-size: 12px; color: var(--text-muted); max-width: 440px; margin: 0 auto 18px auto;">${escapeHtml(errMsg)}</p>
                            <a href="settings.html#sec-api" class="btn-action primary" style="display: inline-flex; text-decoration: none;">
                                <span>Configurer la clé Coverr dans les Paramètres</span>
                            </a>
                        </div>
                    `;
                    return;
                }

                const videos = data.videos || [];
                if (videos.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; color: var(--text-muted); padding: 60px 20px;">
                            <p style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;">Aucune vidéo trouvée</p>
                            <p style="font-size: 12px;">Essayez d'autres mots-clés en anglais ou français (ex: "landscape", "business", "city").</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px;">
                        ${videos.map(v => {
                            const isV = v.is_vertical;
                            const durStr = v.duration ? `${Math.round(v.duration)}s` : '';
                            return `
                                <div class="coverr-card" style="background: #141417; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease;">
                                    <div style="position: relative; width: 100%; height: 160px; background: #000; overflow: hidden;" onmouseenter="playCoverrPreview(this)" onmouseleave="stopCoverrPreview(this)">
                                        <img src="${escapeHtml(v.poster || v.thumbnail)}" style="width: 100%; height: 100%; object-fit: cover;" alt="${escapeHtml(v.title)}">
                                        <video src="${escapeHtml(v.url_preview || v.url_download)}" preload="none" muted loop playsinline style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: none;"></video>
                                        <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #fff; font-family: monospace;">${v.aspect_ratio}</span>
                                        ${durStr ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #fff; font-family: monospace;">${durStr}</span>` : ''}
                                    </div>
                                    <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between;">
                                        <div style="font-size: 12px; font-weight: 700; color: #fff; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(v.title)}</div>
                                        <button type="button" class="btn-action primary" onclick="downloadCoverrAsset('${escapeHtml(v.url_download)}', '${escapeHtml(v.title)}', this)" style="width: 100%; justify-content: center; padding: 7px 12px; font-size: 11.5px; border-radius: 6px;">
                                            <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            <span>Importer dans Assets</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } catch (err) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 50px 20px;">
                        <p style="font-size: 14px; color: #ef4444; margin-bottom: 6px;">Erreur de communication avec le serveur</p>
                        <p style="font-size: 12px;">${escapeHtml(err.message)}</p>
                    </div>
                `;
            }
        }

        function playCoverrPreview(wrap) {
            const vid = wrap.querySelector('video');
            if (vid && vid.getAttribute('src')) {
                vid.style.display = 'block';
                vid.play().catch(() => {});
            }
        }

        function stopCoverrPreview(wrap) {
            const vid = wrap.querySelector('video');
            if (vid) {
                vid.pause();
                vid.style.display = 'none';
            }
        }

        async function downloadCoverrAsset(downloadUrl, title, btn) {
            if (!downloadUrl) {
                showToast('Erreur: Lien de téléchargement Coverr introuvable');
                return;
            }
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span>⏳ Téléchargement...</span>`;
            }

            const cleanTitle = (title || 'coverr_video').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);
            const filename = `coverr_${cleanTitle}_${Date.now()}.mp4`;

            try {
                const serverOrigin = (window.location.protocol === 'file:') ? 'http://localhost:3000' : '';
                const res = await fetch(`${serverOrigin}/api/coverr/download`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: downloadUrl,
                        filename
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`✓ Vidéo Coverr importée dans 01_Assets/Videos/${filename}`);
                    if (btn) btn.innerHTML = `<span>✓ Importé</span>`;
                    await loadAssetsCatalog();
                } else {
                    showToast(`Erreur : ${data.error || 'Échec du téléchargement'}`);
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = `<span>Réessayer</span>`;
                    }
                }
            } catch (err) {
                showToast(`Erreur réseau : ${err.message}`);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<span>Réessayer</span>`;
                }
            }
        }
