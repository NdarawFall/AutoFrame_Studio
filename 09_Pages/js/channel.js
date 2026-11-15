const STORAGE_KEY_CHANNELS = 'vibeeditor_channels_data';

        let currentChannel = null;
        let deleteTarget = { type: null, id: null, fileName: null };

        function getChannelId() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        function applyChannelDataToUI(ch) {
            if (!ch) return;
            currentChannel = ch;

            // Mettre à jour l'en-tête instantanément
            document.title = `${ch.name} — AutoFrame 1.0`;
            const nameEl = document.getElementById('channelName');
            if (nameEl) nameEl.textContent = ch.name;
            
            let iconSvg = '';
            if (ch.platform === 'YouTube') {
                iconSvg = `<svg style="width:14px; height:14px; flex-shrink:0;" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
            } else if (ch.platform === 'TikTok') {
                iconSvg = `<svg style="width:13px; height:13px; flex-shrink:0;" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.5v-7.1a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.86.01z"/></svg>`;
            } else {
                iconSvg = `<svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
            }

            const formatLabel = ch.format === '1:1' ? '1:1 Carré' : (ch.format || '16:9');
            const platBadge = document.getElementById('channelPlatformBadge');
            if (platBadge) platBadge.innerHTML = `${iconSvg} <span>${escapeHtml(ch.platform)}</span>`;
            const fmtBadge = document.getElementById('channelFormatBadge');
            if (fmtBadge) fmtBadge.textContent = formatLabel;

            const avatarEl = document.getElementById('channelAvatar');
            const avatarText = document.getElementById('channelAvatarText');
            if (avatarEl) {
                if (ch.avatar) {
                    avatarEl.style.backgroundImage = `url('${ch.avatar}')`;
                    if (avatarText) avatarText.textContent = '';
                } else {
                    avatarEl.style.backgroundImage = 'none';
                    avatarEl.style.background = '#1c1c22';
                    avatarEl.style.color = '#ffffff';
                    if (avatarText) avatarText.textContent = (ch.name || 'C').charAt(0).toUpperCase();
                }
            }

            const btnCreate = document.getElementById('btnCreateVideoForChannel');
            if (btnCreate) btnCreate.href = `create_video.html?channel=${encodeURIComponent(ch.id)}`;
            document.querySelectorAll('nav.nav-links a.btn-create-video').forEach(btn => {
                btn.href = `create_video.html?channel=${encodeURIComponent(ch.id)}`;
            });
            try {
                sessionStorage.setItem('vibeeditor_active_channel', JSON.stringify({
                    id: ch.id,
                    name: ch.name,
                    avatar: ch.avatar || '',
                    platform: ch.platform || ''
                }));
            } catch (e) {}
            const btnSettings = document.getElementById('btnChannelSettings');
            if (btnSettings) {
                btnSettings.href = `channel_settings.html?id=${encodeURIComponent(ch.id)}`;
            }

            renderVideos();
        }

        // Hydratation immédiate à 0ms dès l'ouverture de la page
        (function hydrateChannelImmediately() {
            const channelId = getChannelId();
            if (!channelId) return;
            try {
                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    const channels = JSON.parse(raw);
                    const match = channels.find(c => c.id === channelId);
                    if (match) applyChannelDataToUI(match);
                }
            } catch(e) {}
        })();

        async function loadChannelDetails() {
            const channelId = getChannelId();
            if (!channelId) {
                renderNotFound();
                return;
            }

            try {
                const res = await fetch('/api/channels');
                if (res.ok) {
                    const channels = await res.json();
                    const match = channels.find(c => c.id === channelId);
                    if (match) {
                        applyChannelDataToUI(match);
                        return;
                    }
                }
            } catch(e) {}

            if (!currentChannel) {
                renderNotFound();
            }
        }

        function renderNotFound() {
            document.getElementById('channelHeaderCard').style.display = 'none';
            document.querySelector('.section-header').style.display = 'none';
            document.getElementById('channelVideosGrid').innerHTML = `
                <div style="grid-column: 1/-1; padding: 70px 24px; text-align: center; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
                    <p style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">Chaîne non trouvée</p>
                    <p style="font-size: 13px; margin-bottom: 20px; color: var(--text-muted);">Cette chaîne n'existe pas ou a été supprimée.</p>
                    <a href="createur.html" class="btn-cancel" style="display:inline-flex; align-items:center; gap:8px;">
                        <span>Retour aux chaînes</span>
                    </a>
                </div>
            `;
        }

        function renderVideos() {
            const videos = currentChannel.videos || [];
            document.getElementById('channelVideosCount').textContent = `${videos.length} vidéo${videos.length > 1 ? 's' : ''}`;

            const grid = document.getElementById('channelVideosGrid');
            if (videos.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
                        <p style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px;">Aucune vidéo dans cette chaîne</p>
                        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Générez votre première vidéo dédiée à cette chaîne.</p>
                        <a href="create_video.html?channel=${encodeURIComponent(currentChannel.id)}" class="btn-create-for-channel">
                            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>Créer une Vidéo</span>
                        </a>
                    </div>
                `;
                return;
            }

            grid.innerHTML = videos.map(vid => {
                const videoPath = vid.path || `03_Chaines/${currentChannel.id}/${vid.file}`;
                const isProcessing = (vid.status === 'processing');
                const clickTarget = isProcessing 
                    ? `video_processus.html?video=${encodeURIComponent(videoPath)}` 
                    : `studio.html?video=${encodeURIComponent(videoPath)}`;
                const thumbHtml = isProcessing
                    ? `<div style="width:100%; height:100%; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;"><svg class="icon spinner" style="width:32px; height:32px; color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle></svg><span style="font-size:11px; font-weight:700; color:#f59e0b;">Création IA en cours...</span></div>`
                    : (vid.thumb 
                        ? `<img src="${vid.thumb}" class="video-thumb-img" alt="Miniature">` 
                        : `<div style="width:100%; height:100%; background:#0a0a0a; display:flex; align-items:center; justify-content:center;"><svg class="icon" style="width:40px; height:40px; color:rgba(255,255,255,0.25);" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`);
                return `
                <div class="video-card ${isProcessing ? 'processing-card' : ''}" onclick="window.location.href='${clickTarget}'">
                    <div class="video-thumb-wrap">
                        ${thumbHtml}
                        ${!isProcessing ? `<div class="video-play-overlay"><svg class="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>` : ''}
                        <span class="video-duration-badge">${isProcessing ? '🟡 En cours' : (vid.duration || '00:30')}</span>
                    </div>
                    <div class="video-body">
                        <div class="video-title">${escapeHtml(vid.title || vid.file)}</div>
                        <div class="video-footer" onclick="event.stopPropagation()">
                            <span>${escapeHtml(vid.file)}</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <a href="${clickTarget}" class="open-in-studio-label">
                                    <span>${isProcessing ? 'Progression' : 'Studio'}</span>
                                    <svg class="icon" style="width:12px; height:12px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </a>
                                <button type="button" class="btn-delete-video" onclick="event.stopPropagation(); askDeleteVideo('${escapeHtml(vid.file)}', '${escapeHtml(vid.title || vid.file)}', '${escapeHtml(videoPath)}')" title="Supprimer cette vidéo" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; display:inline-flex; align-items:center; transition:var(--transition-smooth);">
                                    <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        }

        // --- POPUP PERSONNALISÉ DE SUPPRESSION ---
        function askDeleteCurrentChannel() {
            if (!currentChannel) return;
            deleteTarget = { type: 'channel', id: currentChannel.id };
            document.getElementById('confirmModalTitle').textContent = `Supprimer « ${currentChannel.name} »`;
            document.getElementById('confirmModalDesc').textContent = `Êtes-vous sûr de vouloir supprimer définitivement cette chaîne ? Cette action est irréversible.`;
            document.getElementById('confirmDeleteModal').classList.add('open');
        }

        function askDeleteVideo(fileName, title, fullPath) {
            deleteTarget = { type: 'video', fileName, fullPath: fullPath || fileName };
            document.getElementById('confirmModalTitle').textContent = `Supprimer la vidéo`;
            document.getElementById('confirmModalDesc').textContent = `Êtes-vous sûr de vouloir supprimer définitivement « ${title} » (${fileName}) ? Le fichier sera effacé du dossier de la chaîne.`;
            document.getElementById('confirmDeleteModal').classList.add('open');
        }

        function closeConfirmModal() {
            deleteTarget = { type: null, id: null, fileName: null };
            document.getElementById('confirmDeleteModal').classList.remove('open');
        }

        async function executeDeleteAction() {
            const target = { ...deleteTarget };
            closeConfirmModal();

            if (target.type === 'channel') {
                // Supprimer la chaîne
                try {
                    await fetch(`/api/channels?id=${encodeURIComponent(target.id)}`, { method: 'DELETE' });
                } catch(e) {}

                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    try {
                        let channels = JSON.parse(raw);
                        channels = channels.filter(c => c.id !== target.id);
                        localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
                    } catch(e) {}
                }
                window.location.href = 'createur.html';
                return;
            }

            if (target.type === 'video') {
                // 1. Supprimer le fichier HTML via l'API du serveur
                try {
                    await fetch('/api/delete-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ video: target.fullPath || target.fileName })
                    });
                } catch(e) {}

                // 2. Mettre à jour la liste des vidéos de la chaîne
                if (currentChannel && currentChannel.videos) {
                    currentChannel.videos = currentChannel.videos.filter(v => v.file !== target.fileName);
                    
                    // Sauvegarder la chaîne mise à jour
                    try {
                        await fetch('/api/channels', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(currentChannel)
                        });
                    } catch(e) {}

                    const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                    if (raw) {
                        try {
                            let channels = JSON.parse(raw);
                            const idx = channels.findIndex(c => c.id === currentChannel.id);
                            if (idx >= 0) {
                                channels[idx] = currentChannel;
                                localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
                            }
                        } catch(e) {}
                    }

                    renderVideos();
                }
            }
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

        function showToast(message) {
            const toast = document.getElementById('toastMsg');
            const text = document.getElementById('toastText');
            if (!toast) return;
            if (text && message) text.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2600);
        }

        async function handleChannelAvatarChange(input) {
            if (!input.files || !input.files[0] || !currentChannel) return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target.result;
                currentChannel.avatar = dataUrl;

                const avatarEl = document.getElementById('channelAvatar');
                const avatarText = document.getElementById('channelAvatarText');
                if (avatarEl) avatarEl.style.backgroundImage = `url('${dataUrl}')`;
                if (avatarText) avatarText.textContent = '';

                // 1. Sauvegarde localStorage
                try {
                    const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                    if (raw) {
                        let channels = JSON.parse(raw);
                        const idx = channels.findIndex(c => c.id === currentChannel.id);
                        if (idx >= 0) {
                            channels[idx].avatar = dataUrl;
                        } else {
                            channels.push(currentChannel);
                        }
                        localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
                    }
                } catch(err) {}

                // 2. Sauvegarde API serveur
                try {
                    await fetch('/api/channels', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentChannel)
                    });
                } catch(err) {
                    console.error('Erreur API sauvegarde avatar:', err);
                }

                showToast('✓ Photo de profil mise à jour avec succès !');
            };
            reader.readAsDataURL(file);
        }

        // Exécution immédiate sans attendre l'événement window.load
        loadChannelDetails();

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
