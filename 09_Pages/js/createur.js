const STORAGE_KEY_CHANNELS = 'vibeeditor_channels_data';

        let channelsCache = [];
        let serverVideosCache = [];
        let currentFilter = 'all';
        let deleteTarget = null; // { type: 'channel' | 'standalone_video', id: string, name: string }
        let uploadedAvatarData = '';

        // Hydratation immédiate à 0ms depuis le cache local pour éliminer toute latence d'affichage
        (function hydrateImmediately() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        channelsCache = parsed.filter(c => c.id !== 'ch_youtube_tech' && c.id !== 'ch_tiktok_story');
                        updateFilterCountsAndRender();
                    }
                }
            } catch (e) {}
        })();

        async function loadChannelsAndVideos() {
            let channels = [];
            
            // Chargement simultané en parallèle (0ms d'attente séquentielle)
            try {
                const [resChannels, resFiles] = await Promise.all([
                    fetch('/api/channels').catch(() => null),
                    fetch('/api/files').catch(() => null)
                ]);

                if (resChannels && resChannels.ok) {
                    channels = await resChannels.json();
                }
                if (resFiles && resFiles.ok) {
                    const filesData = await resFiles.json();
                    serverVideosCache = filesData.videos || [];
                }
            } catch (e) {}

            // Filtrer d'anciennes démos factices
            channels = (channels || []).filter(c => c.id !== 'ch_youtube_tech' && c.id !== 'ch_tiktok_story');

            // Synchronisation avec localStorage
            if (channels.length > 0) {
                channelsCache = channels;
                localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
            } else {
                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    try {
                        const localChannels = JSON.parse(raw);
                        const userLocal = localChannels.filter(c => c.id !== 'ch_youtube_tech' && c.id !== 'ch_tiktok_story');
                        if (userLocal.length > 0) {
                            channelsCache = userLocal;
                            fetch('/api/channels', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(userLocal)
                            }).catch(() => {});
                        }
                    } catch(e) {}
                }
            }

            updateFilterCountsAndRender();
        }

        // Trouver les vidéos sans chaîne (fichiers HTML dans 04_Videos non rattachés à une chaîne)
        function getStandaloneVideos() {
            const channelVideoFiles = new Set();
            channelsCache.forEach(ch => {
                if (Array.isArray(ch.videos)) {
                    ch.videos.forEach(v => {
                        const file = typeof v === 'string' ? v : (v.file || v.fileName);
                        if (file) channelVideoFiles.add(file);
                    });
                }
            });

            return serverVideosCache.filter(v => {
                if (typeof v === 'object' && v !== null) {
                    if (v.isStandalone !== undefined) return v.isStandalone;
                    return !channelVideoFiles.has(v.file || v.name);
                }
                return !channelVideoFiles.has(v);
            });
        }

        function setCategoryFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-pill').forEach(btn => {
                if (btn.getAttribute('data-filter') === filter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            renderGridContent();
        }

        function updateFilterCountsAndRender() {
            const countAll = channelsCache.length;
            const countYouTube = channelsCache.filter(c => c.platform === 'YouTube').length;
            const countTikTok = channelsCache.filter(c => c.platform === 'TikTok').length;
            const countInstagram = channelsCache.filter(c => c.platform === 'Instagram').length;
            const standaloneVideos = getStandaloneVideos();
            const countStandalone = standaloneVideos.length;

            document.getElementById('countAll').textContent = countAll;
            document.getElementById('countYouTube').textContent = countYouTube;
            document.getElementById('countTikTok').textContent = countTikTok;
            document.getElementById('countInstagram').textContent = countInstagram;
            document.getElementById('countStandalone').textContent = countStandalone;

            // Stats cards
            document.getElementById('totalChannelsCount').textContent = countAll;
            const totalChannelVids = channelsCache.reduce((acc, c) => acc + (c.videoCount || (c.videos ? c.videos.length : 0)), 0);
            const totalAllVids = totalChannelVids + countStandalone;
            const totalVidsEl = document.getElementById('totalVideosCount');
            if (totalVidsEl) totalVidsEl.textContent = totalAllVids;

            renderGridContent();
        }

        function renderGridContent() {
            const grid = document.getElementById('channelsGrid');

            // CAS 1 : Filtre "Vidéos sans chaîne"
            if (currentFilter === 'standalone_videos') {
                const standalone = getStandaloneVideos();
                if (standalone.length === 0) {
                    grid.innerHTML = `
                        <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
                            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: var(--text-secondary);">
                                <svg class="icon" style="width:26px; height:26px;" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                            <p style="font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 8px;">Aucune vidéo sans chaîne</p>
                            <p style="font-size: 13px; max-width: 480px; margin: 0 auto 22px auto; color: var(--text-muted); line-height: 1.5;">
                                Toutes les vidéos sont actuellement liées à des chaînes ou le dossier de vidéos est vide. Vous pouvez créer une nouvelle vidéo rapide directement depuis le bouton « Créer une Vidéo ».
                            </p>
                            <a href="create_video.html" class="btn-add-channel" style="text-decoration:none;">
                                <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span>Créer une Vidéo Rapide</span>
                            </a>
                        </div>
                    `;
                    return;
                }

                grid.innerHTML = standalone.map(item => {
                    const fileName = typeof item === 'string' ? item : (item.file || item.name);
                    const cleanName = fileName.replace(/\.html$/, '').replace(/[-_]/g, ' ');
                    const videoParam = typeof item === 'object' && item.path ? item.path : ('04_Videos/' + fileName);
                    const isProcessing = (typeof item === 'object' && item.status === 'processing');
                    const clickTarget = isProcessing 
                        ? `video_processus.html?video=${encodeURIComponent(videoParam)}`
                        : `studio.html?video=${encodeURIComponent(videoParam)}`;
                    const lower = fileName.toLowerCase();
                    const videoFormat = (typeof item === 'object' && item.format) 
                        ? item.format 
                        : ((lower.includes('short') || lower.includes('tiktok') || lower.includes('reels') || lower.includes('9-16') || lower.includes('9_16')) ? '9:16' : (lower.includes('carre') || lower.includes('1-1') || lower.includes('1_1') ? '1:1' : '16:9'));
                    return `
                        <div class="channel-card ${isProcessing ? 'processing-card' : ''}" onclick="window.location.href='${clickTarget}'">
                            <div class="channel-card-strip" style="background: ${isProcessing ? '#f59e0b' : '#dc2626'};"></div>
                            
                            <div class="channel-header">
                                <div class="channel-avatar" style="background: #141414; border: 1px solid rgba(255, 255, 255, 0.15);">
                                    ${isProcessing ? `<svg class="icon spinner" style="width:20px; height:20px; color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle></svg>` : `<svg class="icon" style="width:20px; height:20px; color:#ffffff;" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`}
                                </div>
                                <div class="channel-title-wrap">
                                    <div class="channel-name">${escapeHtml(cleanName)}</div>
                                    <div class="channel-meta-badges">
                                        ${isProcessing ? `<span class="channel-badge-pill" style="color:#f59e0b; border-color:rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.1);"><span>🟡 En création...</span></span>` : `<span class="channel-badge-pill" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08);"><span>Sans chaîne</span></span>`}
                                        <span class="channel-badge-pill" style="font-family:'JetBrains Mono', monospace; font-weight:700; color:#ffffff;">${videoFormat}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="channel-card-footer" onclick="event.stopPropagation()">
                                <a href="${clickTarget}" class="channel-open-label">
                                    <span>${isProcessing ? 'Voir la progression' : 'Ouvrir dans le Studio'}</span>
                                    <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </a>
                                <button class="btn-card-delete" onclick="askDeleteStandaloneVideo('${fileName}')" title="Supprimer la vidéo">
                                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                return;
            }

            // CAS 2 : Filtrer les chaînes par plateforme
            let filteredChannels = channelsCache;
            if (currentFilter !== 'all') {
                filteredChannels = channelsCache.filter(c => c.platform === currentFilter);
            }

            if (filteredChannels.length === 0) {
                const catLabel = currentFilter === 'all' ? 'Aucune chaîne créée' : `Aucune chaîne ${currentFilter}`;
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
                        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: var(--text-secondary);">
                            <svg class="icon" style="width:26px; height:26px;" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        </div>
                        <p style="font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 8px;">${catLabel}</p>
                        <p style="font-size: 13px; max-width: 480px; margin: 0 auto 22px auto; color: var(--text-muted); line-height: 1.5;">
                            ${currentFilter === 'all' 
                                ? "Vous n'avez pas encore créé de chaîne. Cliquez sur « Nouvelle Chaîne » pour configurer votre premier univers."
                                : `Aucune chaîne configurée pour la plateforme ${currentFilter}. Créez-en une en quelques secondes.`}
                        </p>
                        <button class="btn-add-channel" onclick="openAddModal()">
                            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>Créer une Chaîne</span>
                        </button>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filteredChannels.map(ch => {
                let iconSvg = '';
                if (ch.platform === 'YouTube') {
                    iconSvg = `<svg style="width:14px; height:14px; flex-shrink:0;" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
                } else if (ch.platform === 'TikTok') {
                    iconSvg = `<svg style="width:13px; height:13px; flex-shrink:0;" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.5v-7.1a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.86.01z"/></svg>`;
                } else {
                    iconSvg = `<svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
                }

                const cPrim = ch.colorPrimary || '#ef4444';
                const cSec = ch.colorSecondary || '#dc2626';
                const count = ch.videoCount || (ch.videos ? ch.videos.length : 0);
                const formatLabel = ch.format === '1:1' ? '1:1 Carré' : (ch.format || '16:9');

                const avatarStyle = ch.avatar 
                    ? `background-image: url('${ch.avatar}');` 
                    : `background: #1c1c22; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.15);`;

                return `
                    <div class="channel-card" onclick="window.location.href='channel.html?id=${encodeURIComponent(ch.id)}'">
                        <div class="channel-header">
                            <div class="channel-avatar" style="${avatarStyle}" onclick="event.stopPropagation(); triggerCardAvatarChange('${ch.id}')">
                                ${ch.avatar ? '' : ch.name.charAt(0).toUpperCase()}
                                <div class="avatar-hover-overlay">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </div>
                            </div>
                            <div class="channel-title-wrap">
                                <div class="channel-name">${escapeHtml(ch.name)}</div>
                                <div class="channel-meta-badges">
                                    <span class="channel-badge-pill">
                                        ${iconSvg}
                                        <span>${escapeHtml(ch.platform)}</span>
                                    </span>
                                    <span class="channel-badge-pill">${formatLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div class="channel-card-stats">
                            <span style="color:var(--text-secondary);">Vidéos publiées</span>
                            <span class="channel-videos-num">${count} vidéo${count > 1 ? 's' : ''}</span>
                        </div>

                        <div class="channel-card-footer" onclick="event.stopPropagation()">
                            <a href="channel.html?id=${encodeURIComponent(ch.id)}" class="channel-open-label">
                                <span>Ouvrir la Chaîne</span>
                                <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </a>
                            <button class="btn-card-delete" onclick="askDeleteChannel('${ch.id}')" title="Supprimer la chaîne">
                                <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function openAddModal() {
            uploadedAvatarData = '';
            document.getElementById('avatarPreviewBox').style.backgroundImage = 'none';
            document.getElementById('avatarPreviewBox').innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            document.getElementById('avatarUploadLabel').textContent = 'Cliquer pour choisir une photo de profil';
            document.getElementById('addChannelModal').classList.add('open');
            document.getElementById('channelNameInput').focus();
        }

        function closeAddModal() {
            document.getElementById('addChannelModal').classList.remove('open');
        }

        function autoSelectFormat() {
            const platform = document.getElementById('channelPlatformInput').value;
            const formatSelect = document.getElementById('channelFormatInput');
            if (platform === 'TikTok') {
                formatSelect.value = '9:16';
            } else if (platform === 'Instagram') {
                formatSelect.value = '1:1';
            } else {
                formatSelect.value = '16:9';
            }
        }

        function handleAvatarSelected(input) {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedAvatarData = e.target.result;
                const prev = document.getElementById('avatarPreviewBox');
                prev.innerHTML = '';
                prev.style.backgroundImage = `url('${uploadedAvatarData}')`;
                document.getElementById('avatarUploadLabel').textContent = `01_Assets/Avatars/${file.name}`;
            };
            reader.readAsDataURL(file);
        }

        async function handleCreateChannel(e) {
            e.preventDefault();
            const name = document.getElementById('channelNameInput').value.trim();
            const platform = document.getElementById('channelPlatformInput').value;
            const format = document.getElementById('channelFormatInput').value;

            if (!name) return;

            const newChannel = {
                id: 'ch_' + Date.now(),
                name,
                platform,
                format,
                colorPrimary: '#ff3344',
                colorSecondary: '#dc2626',
                fontPrimary: 'Montserrat',
                fontSecondary: 'Inter',
                fontAccent: 'Caveat',
                description: '',
                avatar: uploadedAvatarData || '',
                videos: []
            };

            channelsCache.push(newChannel);
            localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channelsCache));

            // Sauvegarde serveur
            try {
                await fetch('/api/channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newChannel)
                });
            } catch (err) {}

            closeAddModal();
            document.getElementById('channelNameInput').value = '';
            updateFilterCountsAndRender();
        }

        function askDeleteChannel(id) {
            const ch = channelsCache.find(c => c.id === id);
            const name = ch ? ch.name : 'cette chaîne';
            deleteTarget = { type: 'channel', id, name };
            document.getElementById('confirmModalTitle').textContent = `Supprimer la chaîne`;
            document.getElementById('confirmModalDesc').textContent = `Êtes-vous sûr de vouloir supprimer définitivement « ${name} » ? Toutes les configurations associées seront effacées.`;
            document.getElementById('confirmDeleteModal').classList.add('open');
        }

        function askDeleteStandaloneVideo(fileName) {
            deleteTarget = { type: 'standalone_video', id: fileName, name: fileName };
            document.getElementById('confirmModalTitle').textContent = `Supprimer la vidéo`;
            document.getElementById('confirmModalDesc').textContent = `Êtes-vous sûr de vouloir supprimer définitivement le fichier « ${fileName} » du dossier de vidéos ? Cette action est irréversible.`;
            document.getElementById('confirmDeleteModal').classList.add('open');
        }

        function closeConfirmModal() {
            deleteTarget = null;
            document.getElementById('confirmDeleteModal').classList.remove('open');
        }

        async function executeDeleteTarget() {
            if (!deleteTarget) return;
            const target = { ...deleteTarget };
            closeConfirmModal();

            if (target.type === 'channel') {
                try {
                    await fetch(`/api/channels?id=${encodeURIComponent(target.id)}`, { method: 'DELETE' });
                } catch (e) {}
                channelsCache = channelsCache.filter(c => c.id !== target.id);
                localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channelsCache));
            } else if (target.type === 'standalone_video') {
                try {
                    await fetch('/api/delete-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ video: target.id })
                    });
                } catch (e) {}
                serverVideosCache = serverVideosCache.filter(v => (typeof v === 'string' ? v : (v.file || v.name)) !== target.id);
            }

            updateFilterCountsAndRender();
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        let targetChannelIdForAvatar = null;

        function triggerCardAvatarChange(channelId) {
            targetChannelIdForAvatar = channelId;
            const input = document.getElementById('cardAvatarFileInput');
            if (input) {
                input.value = '';
                input.click();
            }
        }

        async function handleCardAvatarFileSelected(input) {
            if (!input.files || !input.files[0] || !targetChannelIdForAvatar) return;
            const file = input.files[0];
            const ch = channelsCache.find(c => c.id === targetChannelIdForAvatar);
            if (!ch) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target.result;
                ch.avatar = dataUrl;
                localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channelsCache));
                try {
                    await fetch('/api/channels', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ch)
                    });
                } catch(err) {
                    console.error('Erreur API avatar:', err);
                }
                renderGridContent();
            };
            reader.readAsDataURL(file);
        }

        // Exécution immédiate sans attendre l'événement window.load
        loadChannelsAndVideos();

        // Instant Navigation Hover Prefetch : élimine toute latence de changement de page
        document.addEventListener('mouseover', function(e) {
            const a = e.target.closest('a[href]');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('http')) return;
            if (!a.dataset.prefetched) {
                a.dataset.prefetched = 'true';
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = href;
                document.head.appendChild(link);
            }
        }, { passive: true });
