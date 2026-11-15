let allClients = [];
        let currentClient = null;
        let globalSkills = [];

        const ALL_CATEGORIES = [
            'images_references',
            'videos_references',
            'clips_video',
            'voix_off',
            'musiques',
            'effets_sonores',
            'images_illustrations',
            'skills'
        ];

        function showToast(msg, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${msg}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(6px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 2600);
        }

        function formatBytes(bytes) {
            if (!bytes || bytes === 0) return '0 O';
            const k = 1024;
            const sizes = ['O', 'Ko', 'Mo', 'Go'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }

        // =========================================================================
        // 1. PROFIL CLIENT (AVATAR ROND, UPLOAD IMAGE & SUPPRESSION ANCIENNE)
        // =========================================================================
        function triggerClientAvatarInput() {
            if (!currentClient) return;
            const input = document.getElementById('inputClientAvatar');
            if (input) input.click();
        }

        async function handleClientAvatarUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file || !currentClient) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result.split(',')[1];
                try {
                    const res = await fetch('/api/clients/avatar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client: currentClient.name,
                            filename: file.name,
                            data: base64Data
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        currentClient.avatarUrl = data.avatarUrl;
                        const avatarImg = document.getElementById('currentClientAvatarImg');
                        const avatarFallback = document.getElementById('currentClientAvatarFallback');
                        avatarImg.src = `/${data.avatarUrl}?t=${Date.now()}`;
                        avatarImg.style.display = 'block';
                        avatarFallback.style.display = 'none';
                        showToast(`Photo de profil du client "${currentClient.name}" mise à jour !`);
                        renderClientsList();
            updateMonteurAssetsSummary();
                    } else {
                        showToast(data.error || 'Erreur enregistrement photo client', 'error');
                    }
                } catch (err) {
                    console.error('Erreur client avatar:', err);
                    showToast('Échec mise à jour photo client', 'error');
                }
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        // =========================================================================
        // 2. RENOMMER LE CLIENT (MODAL MODERNE SANS PROMPT JS)
        // =========================================================================
        function openRenameClientModal() {
            if (!currentClient) return;
            const modal = document.getElementById('renameClientModal');
            const input = document.getElementById('inputRenameClient');
            input.value = currentClient.name;
            modal.classList.add('open');
            setTimeout(() => input.focus(), 80);
        }

        function closeRenameClientModal() {
            document.getElementById('renameClientModal').classList.remove('open');
        }

        async function submitRenameClient() {
            if (!currentClient) return;
            const input = document.getElementById('inputRenameClient');
            const newName = input.value.trim();
            if (!newName) {
                showToast('Veuillez entrer un nom valide', 'error');
                return;
            }

            try {
                const res = await fetch('/api/clients/rename', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client: currentClient.name, newName })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Client renommé en "${data.newName}" !`);
                    closeRenameClientModal();
                    await fetchClients();
                    const updated = allClients.find(c => c.name === data.newName);
                    if (updated) selectClient(updated);
                } else {
                    showToast(data.error || 'Erreur lors du renommage', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erreur serveur', 'error');
            }
        }

        document.getElementById('inputRenameClient').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitRenameClient();
            if (e.key === 'Escape') closeRenameClientModal();
        });

        // =========================================================================
        // 3. SUPPRESSION CLIENT (MODAL MODERNE SANS PROMPT/ALERT JS)
        // =========================================================================
        function openDeleteClientModal() {
            if (!currentClient) return;
            const modal = document.getElementById('confirmDeleteClientModal');
            const textEl = document.getElementById('deleteClientPromptText');
            textEl.innerHTML = `Voulez-vous vraiment supprimer définitivement le client <strong style="color:#ffffff;">"${currentClient.name}"</strong> et tous ses fichiers ?`;
            modal.classList.add('open');
        }

        function closeDeleteClientModal() {
            document.getElementById('confirmDeleteClientModal').classList.remove('open');
        }

        async function submitDeleteClient() {
            if (!currentClient) return;
            const clientNameToDelete = currentClient.name;
            try {
                const res = await fetch('/api/clients/delete-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client: clientNameToDelete })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Client "${clientNameToDelete}" supprimé.`);
                    closeDeleteClientModal();
                    currentClient = null;
                    await fetchClients();
                } else {
                    showToast(data.error || 'Erreur lors de la suppression', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erreur serveur', 'error');
            }
        }

        // =========================================================================
        // 4. SKILLS GLOBAUX DU MONTEUR (MODAL MODERNE 00_Skills/Monteur/)
        // =========================================================================
        function openGlobalSkillsModal() {
            const modal = document.getElementById('globalSkillsModal');
            modal.classList.add('open');
            fetchGlobalSkills();
        }

        function closeGlobalSkillsModal() {
            document.getElementById('globalSkillsModal').classList.remove('open');
        }

        async function fetchGlobalSkills() {
            const listEl = document.getElementById('globalSkillsList');
            const headerBadge = document.getElementById('headerSkillsCount');
            try {
                const res = await fetch('/api/skills/monteur');
                const data = await res.json();
                if (data.success) {
                    globalSkills = data.files || [];
                    if (headerBadge) headerBadge.textContent = globalSkills.length;

                    if (globalSkills.length === 0) {
                        listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; font-style: italic; padding: 16px; text-align: center;">Aucun skill global enregistré. Déposez vos fiches techniques et guides (.md, .pdf) ci-dessus.</div>';
                        return;
                    }

                    listEl.innerHTML = '';
                    globalSkills.forEach(file => {
                        const isPdf = file.ext === '.pdf';
                        const item = document.createElement('div');
                        item.className = 'file-item';
                        item.style.padding = '8px 12px';

                        item.innerHTML = `
                            <div class="file-info" style="cursor: pointer;" onclick="openMediaPreview('/${file.relativeUrl}', '${file.ext}', '${file.name}')" title="Cliquer pour consulter">
                                <div class="file-thumb-icon" style="color: ${isPdf ? '#f87171' : '#60a5fa'}; font-size: 14px;">${isPdf ? '📕' : '📘'}</div>
                                <div style="min-width: 0;">
                                    <div class="file-name" title="${file.name}">${file.name}</div>
                                    <div class="file-meta">${formatBytes(file.size)} • ${isPdf ? 'PDF' : 'Markdown'}</div>
                                </div>
                            </div>
                            <div class="file-actions">
                                <button type="button" class="btn-icon" onclick="openMediaPreview('/${file.relativeUrl}', '${file.ext}', '${file.name}')" title="Consulter">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <a href="/${file.relativeUrl}" download class="btn-icon" title="Télécharger">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                                <button type="button" class="btn-icon delete" onclick="deleteGlobalSkill('${file.name}')" title="Supprimer">
                                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        `;
                        listEl.appendChild(item);
                    });
                }
            } catch (err) {
                console.error('Erreur fetchGlobalSkills:', err);
            }
        }

        async function handleSkillUpload(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64Data = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                    reader.readAsDataURL(file);
                });

                try {
                    const res = await fetch('/api/skills/monteur/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: file.name,
                            data: base64Data
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(`Skill ajouté : ${file.name}`);
                    } else {
                        showToast(data.error || 'Erreur ajout skill', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast(`Échec upload ${file.name}`, 'error');
                }
            }

            event.target.value = '';
            await fetchGlobalSkills();
        }

        async function deleteGlobalSkill(filename) {
            try {
                const res = await fetch('/api/skills/monteur/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Skill "${filename}" supprimé.`);
                    await fetchGlobalSkills();
                } else {
                    showToast(data.error || 'Erreur suppression skill', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erreur serveur', 'error');
            }
        }

        // Configuration Drag and Drop pour la dropzone des skills globaux
        const dropSkills = document.getElementById('drop-global-skills');
        if (dropSkills) {
            dropSkills.addEventListener('dragover', (e) => { e.preventDefault(); dropSkills.classList.add('dragover'); });
            dropSkills.addEventListener('dragleave', () => { dropSkills.classList.remove('dragover'); });
            dropSkills.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropSkills.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (!files || files.length === 0) return;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const base64Data = await new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = (ev) => resolve(ev.target.result.split(',')[1]);
                        reader.readAsDataURL(file);
                    });
                    await fetch('/api/skills/monteur/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: file.name, data: base64Data })
                    });
                }
                showToast('Fichiers skills ajoutés !');
                await fetchGlobalSkills();
            });
        }

        // =========================================================================
        // 3. LECTEUR MEDIA INTEGRE & LIGHTBOX (PREVIEW EN GRAND / PLAYER DEDIE)
        // =========================================================================
        async function openMediaPreview(url, ext, name) {
            const modal = document.getElementById('mediaPreviewModal');
            const titleEl = document.getElementById('mediaPreviewName');
            const iconEl = document.getElementById('mediaPreviewIcon');
            const bodyEl = document.getElementById('mediaPreviewBody');
            const downloadBtn = document.getElementById('mediaDownloadBtn');

            titleEl.textContent = name;
            downloadBtn.href = url;
            downloadBtn.download = name;

            const lowerExt = (ext || '').toLowerCase();
            bodyEl.innerHTML = '';

            // 1. Vidéos
            if (['.mp4', '.mov', '.webm', '.mkv', '.m4v'].includes(lowerExt)) {
                iconEl.textContent = '🎬';
                bodyEl.innerHTML = `
                    <video src="${url}" controls autoplay playsinline style="max-width: 100%; max-height: 75vh; border-radius: 8px; outline: none; background: #000; box-shadow: 0 10px 40px rgba(0,0,0,0.9);">
                        Votre navigateur ne supporte pas la lecture de cette vidéo.
                    </video>
                `;
            }
            // 2. Images (Lightbox haute résolution)
            else if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp'].includes(lowerExt)) {
                iconEl.textContent = '🖼️';
                bodyEl.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                        <img src="${url}" alt="${name}" style="max-width: 100%; max-height: 78vh; object-fit: contain; border-radius: 8px; box-shadow: 0 15px 50px rgba(0,0,0,0.95); cursor: zoom-out;" onclick="closeMediaPreview()">
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Aperçu en taille réelle • Cliquez sur l'image pour fermer</div>
                    </div>
                `;
            }
            // 3. Audio (Player immersif avec commandes)
            else if (['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'].includes(lowerExt)) {
                iconEl.textContent = '🎵';
                bodyEl.innerHTML = `
                    <div class="media-preview-audio-container">
                        <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2)); border: 1px solid rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; font-size: 32px; box-shadow: 0 0 25px rgba(239, 68, 68, 0.3);">
                            🎧
                        </div>
                        <div>
                            <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${name}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Piste audio client / SFX</div>
                        </div>
                        <audio src="${url}" controls autoplay style="width: 100%; border-radius: 6px; outline: none;"></audio>
                    </div>
                `;
            }
            // 4. PDF (Viewer plein écran)
            else if (lowerExt === '.pdf') {
                iconEl.textContent = '📕';
                bodyEl.innerHTML = `
                    <iframe src="${url}#toolbar=1" style="width: 100%; height: 75vh; border: none; border-radius: 8px; background: #fff;"></iframe>
                `;
            }
            // 5. Markdown & Texte
            else if (['.md', '.txt', '.json', '.js', '.cjs'].includes(lowerExt)) {
                iconEl.textContent = '📘';
                bodyEl.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">Chargement du document...</div>`;
                try {
                    const res = await fetch(url);
                    const text = await res.text();
                    bodyEl.innerHTML = `<div class="media-preview-text-container">${escapeHtml(text)}</div>`;
                } catch (err) {
                    bodyEl.innerHTML = `<div style="color: #f87171;">Impossible de charger le contenu du fichier texte.</div>`;
                }
            } else {
                iconEl.textContent = '📁';
                bodyEl.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <div style="font-size: 40px; margin-bottom: 12px;">📄</div>
                        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">${name}</div>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Ce format ne supporte pas la prévisualisation directe.</p>
                        <a href="${url}" download class="btn-create-client" style="text-decoration: none;">Télécharger le fichier</a>
                    </div>
                `;
            }

            modal.classList.add('open');
        }

        function closeMediaPreview() {
            const modal = document.getElementById('mediaPreviewModal');
            modal.classList.remove('open');
            // Stopper la lecture audio/vidéo
            document.getElementById('mediaPreviewBody').innerHTML = '';
        }

        function handleMediaModalClick(e) {
            if (e.target.id === 'mediaPreviewModal') closeMediaPreview();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // =========================================================================
        // 4. GESTION DES CLIENTS & EXPLORATEUR D'ASSETS
        // =========================================================================
        async function fetchClients() {
            try {
                const res = await fetch('/api/clients');
                const data = await res.json();
                if (data.success) {
                    allClients = data.clients || [];
                    try { localStorage.setItem('autoframe_monteur_clients_cache', JSON.stringify(allClients)); } catch (e) {}
                    renderClientsList();
                    if (allClients.length > 0) {
                        const savedName = localStorage.getItem('autoframe_monteur_active_client_name');
                        const target = currentClient 
                            ? (allClients.find(c => c.name === currentClient.name) || allClients[0])
                            : ((savedName && allClients.find(c => c.name === savedName)) || allClients[0]);
                        selectClient(target, false);
                    } else {
                        document.getElementById('workspaceContainer').style.display = 'none';
                        document.getElementById('noClientWorkspace').style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Erreur fetchClients:', err);
            }
        }

        function renderClientsList() {
            const listEl = document.getElementById('clientsListContainer');
            const countEl = document.getElementById('clientsCount');
            countEl.textContent = allClients.length;

            if (allClients.length === 0) {
                listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; padding: 6px 0;">Aucun client enregistré.</div>';
                return;
            }

            if (allClients.length > 0) {
                const first = currentClient || allClients[0];
                document.querySelectorAll('a.btn-create-video').forEach(btn => {
                    btn.href = 'create_video.html?client=' + encodeURIComponent(first.name);
                });
            } else {
                document.querySelectorAll('a.btn-create-video').forEach(btn => {
                    btn.href = 'create_video.html?from=monteur';
                });
            }

            listEl.innerHTML = '';
            allClients.forEach(c => {
                const item = document.createElement('div');
                item.className = `client-circle-item ${currentClient && currentClient.name === c.name ? 'active' : ''}`;
                item.onclick = () => selectClient(c);

                const avatarThumb = c.avatarUrl 
                    ? `<img src="/${c.avatarUrl}" class="client-avatar-img" alt="${c.name}">`
                    : `<div class="client-avatar-fallback">${c.name.charAt(0).toUpperCase()}</div>`;

                const assetCount = c.totalAssets || 0;
                const countBadge = assetCount > 0 ? `<span class="client-circle-count">${assetCount}</span>` : '';

                item.innerHTML = `
                    <div class="client-avatar-ring">
                        ${avatarThumb}
                        ${countBadge}
                    </div>
                    <div class="client-circle-name" title="${c.name}">${c.name}</div>
                `;
                listEl.appendChild(item);
            });
        }

        function selectClient(client, shouldReRenderList = false) {
            currentClient = client;

            try {
                localStorage.setItem('autoframe_monteur_active_client_name', client.name);
                sessionStorage.setItem('vibeeditor_active_client', JSON.stringify({
                    name: client.name,
                    avatarUrl: client.avatarUrl || ''
                }));
            } catch (e) {}

            document.querySelectorAll('a.btn-create-video').forEach(btn => {
                btn.href = 'create_video.html?client=' + encodeURIComponent(client.name);
            });

            // Mettre à jour l'état actif sur les cercles clients
            document.querySelectorAll('.client-circle-item').forEach(el => {
                const nameEl = el.querySelector('.client-circle-name');
                el.classList.toggle('active', nameEl && nameEl.textContent === client.name);
            });

            document.getElementById('noClientWorkspace').style.display = 'none';
            document.getElementById('workspaceContainer').style.display = 'flex';

            document.getElementById('currentClientName').textContent = client.name;
            document.getElementById('currentClientPath').textContent = `Clients/${client.name}/`;
            const btnStudio = document.getElementById('btnOpenInStudio'); if (btnStudio) btnStudio.href = `studio.html?client=${encodeURIComponent(client.name)}`;

            // Mettre à jour l'avatar circulaire du client (avec fallback initial)
            const avatarImg = document.getElementById('currentClientAvatarImg');
            const avatarFallback = document.getElementById('currentClientAvatarFallback');

            if (client.avatarUrl) {
                avatarImg.src = `/${client.avatarUrl}?t=${Date.now()}`;
                avatarImg.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarFallback.style.display = 'flex';
                avatarFallback.textContent = client.name.charAt(0).toUpperCase();
            }

            if (shouldReRenderList) { renderClientsList(); }

            // Remplir les 8 catégories (incluant 'skills')
            ALL_CATEGORIES.forEach(cat => {
                const files = (client.folders && client.folders[cat]) || [];
                const countBadge = document.getElementById(`count-${cat}`);
                if (countBadge) countBadge.textContent = files.length;

                const listContainer = document.getElementById(`list-${cat}`);
                if (!listContainer) return;

                if (files.length === 0) {
                    listContainer.innerHTML = '<div class="empty-category-msg">Aucun fichier.</div>';
                } else {
                    listContainer.innerHTML = '';
                    files.forEach(f => {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';

                        let thumbHtml = '';
                        if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(f.ext)) {
                            thumbHtml = `<img src="/${f.relativeUrl}" class="file-thumb" alt="${f.name}">`;
                        } else if (['.mp4', '.mov', '.webm', '.mkv'].includes(f.ext)) {
                            thumbHtml = `<div class="file-thumb-icon"><svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></div>`;
                        } else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(f.ext)) {
                            thumbHtml = `<div class="file-thumb-icon"><svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`;
                        } else if (['.pdf', '.md', '.txt'].includes(f.ext)) {
                            thumbHtml = `<div class="file-thumb-icon"><svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>`;
                        } else {
                            thumbHtml = `<div class="file-thumb-icon"><svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>`;
                        }

                        fileItem.innerHTML = `
                            <div class="file-info" style="cursor: pointer;" onclick="openMediaPreview('/${f.relativeUrl}', '${f.ext}', '${f.name}')" title="Cliquer pour afficher / lire directement dans le lecteur">
                                ${thumbHtml}
                                <div class="file-name" title="${f.name}">${f.name}</div>
                                <div class="file-meta">${formatBytes(f.size)}</div>
                            </div>
                            <div class="file-actions">
                                <button type="button" class="btn-icon" onclick="openMediaPreview('/${f.relativeUrl}', '${f.ext}', '${f.name}')" title="Lire / Aperçu">
                                    <svg class="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                                <a href="/${f.relativeUrl}" download class="btn-icon" title="Télécharger">
                                    <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                                <button type="button" class="btn-icon delete" onclick="deleteAsset('${client.name}', '${cat}', '${f.name}')" title="Supprimer">
                                    <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        `;
                        listContainer.appendChild(fileItem);
                    });
                }
            });
        }

        // --- GESTION DES UPLOADS ---
        function triggerFileInput(cat) {
            const input = document.getElementById(`file-${cat}`);
            if (input) input.click();
        }

        async function handleFileSelect(category, event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            if (!currentClient) {
                showToast('Sélectionnez d\'abord un client.', 'error');
                return;
            }

            for (let i = 0; i < files.length; i++) {
                await uploadSingleFile(currentClient.name, category, files[i]);
            }

            event.target.value = '';
            await fetchClients();
        }

        function uploadSingleFile(clientName, category, file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64Data = e.target.result.split(',')[1];
                    try {
                        const res = await fetch('/api/clients/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                client: clientName,
                                category: category,
                                filename: file.name,
                                data: base64Data
                            })
                        });
                        const data = await res.json();
                        if (data.success) {
                            showToast(`Uploadé : ${file.name}`);
                        } else {
                            showToast(data.error || 'Erreur upload', 'error');
                        }
                    } catch (err) {
                        console.error('Erreur upload:', err);
                        showToast(`Échec upload ${file.name}`, 'error');
                    }
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }

        // Drag and Drop configuration sur chaque zone (les 8 catégories)
        ALL_CATEGORIES.forEach(cat => {
            const dropzone = document.getElementById(`drop-${cat}`);
            if (!dropzone) return;

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (!currentClient) {
                    showToast('Veuillez sélectionner un client.', 'error');
                    return;
                }
                const files = e.dataTransfer.files;
                if (!files || files.length === 0) return;

                for (let i = 0; i < files.length; i++) {
                    await uploadSingleFile(currentClient.name, cat, files[i]);
                }
                await fetchClients();
            });
        });

        // --- SUPPRESSION D'ASSET CLIENT (MODAL MODERNE SANS CONFIRM JS) ---
        let pendingAssetDelete = null;
        function deleteAsset(clientName, category, filename) {
            pendingAssetDelete = { clientName, category, filename };
            const modal = document.getElementById('confirmDeleteAssetModal');
            document.getElementById('deleteAssetPromptText').innerHTML = `Supprimer définitivement le fichier <strong style="color:#ffffff;">"${filename}"</strong> de la catégorie <em>${category}</em> ?`;
            modal.classList.add('open');
        }

        function closeDeleteAssetModal() {
            document.getElementById('confirmDeleteAssetModal').classList.remove('open');
            pendingAssetDelete = null;
        }

        async function submitDeleteAsset() {
            if (!pendingAssetDelete) return;
            const { clientName, category, filename } = pendingAssetDelete;
            try {
                const res = await fetch('/api/clients/delete-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client: clientName, category, filename })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Supprimé : ${filename}`);
                    closeDeleteAssetModal();
                    await fetchClients();
                } else {
                    showToast(data.error || 'Erreur', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erreur serveur', 'error');
            }
        }

        // --- GESTION DES CLICS SUR OVERLAY DES MODALES ---
        function handleModalOverlayClick(e) {
            if (e.target.id === 'createClientModal') closeCreateClientModal();
            if (e.target.id === 'renameClientModal') closeRenameClientModal();
            if (e.target.id === 'confirmDeleteClientModal') closeDeleteClientModal();
            if (e.target.id === 'confirmDeleteAssetModal') closeDeleteAssetModal();
            if (e.target.id === 'globalSkillsModal') closeGlobalSkillsModal();
        }

        // --- MODAL NOUVEAU CLIENT ---
        function openCreateClientModal() {
            const modal = document.getElementById('createClientModal');
            modal.classList.add('open');
            const input = document.getElementById('inputClientName');
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }

        function closeCreateClientModal() {
            document.getElementById('createClientModal').classList.remove('open');
        }

        async function submitCreateClient() {
            const input = document.getElementById('inputClientName');
            const name = input.value.trim();
            if (!name) {
                showToast('Veuillez saisir un nom', 'error');
                input.focus();
                return;
            }

            try {
                const res = await fetch('/api/clients/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Client "${data.client.name}" créé avec ses 8 sous-dossiers !`);
                    closeCreateClientModal();
                    await fetchClients();
                    const newClient = allClients.find(c => c.name === data.client.name);
                    if (newClient) selectClient(newClient);
                } else {
                    showToast(data.error || 'Impossible de créer le client', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erreur serveur', 'error');
            }
        }

        document.getElementById('inputClientName').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitCreateClient();
            if (e.key === 'Escape') closeCreateClientModal();
        });

        // Touche Échap pour fermer toutes les modales
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMediaPreview();
                closeCreateClientModal();
                closeRenameClientModal();
                closeDeleteClientModal();
                closeDeleteAssetModal();
                closeGlobalSkillsModal();
            }
        });

        // Initialisation globale ultra-rapide (Restauration instantanée 0ms depuis le cache local)
        try {
            const cachedClientsJson = localStorage.getItem('autoframe_monteur_clients_cache');
            if (cachedClientsJson) {
                allClients = JSON.parse(cachedClientsJson);
                if (allClients.length > 0) {
                    const savedClientName = localStorage.getItem('autoframe_monteur_active_client_name');
                    const target = (savedClientName && allClients.find(c => c.name === savedClientName)) || allClients[0];
                    renderClientsList();
                    selectClient(target, false);
                }
            }
            const cachedSkillsJson = localStorage.getItem('autoframe_monteur_skills_cache');
            if (cachedSkillsJson) {
                globalSkills = JSON.parse(cachedSkillsJson);
                renderGlobalSkills();
            }
        } catch (e) {
            console.warn('Erreur lecture cache local monteur:', e);
        }

        // Rafraîchissement silencieux en arrière-plan sans bloquer l'affichage
        fetchGlobalSkills();
        fetchClients();
    
        let monteurSelectedFormat = '9:16';

        function setMonteurVideoFormat(fmt, btnEl) {
            monteurSelectedFormat = fmt;
            document.querySelectorAll('.monteur-fmt-group .btn-fmt-pill').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
        }

        function toggleMonteurScriptBlock(active) {
            const wrapper = document.getElementById('monteurScriptCollapsibleWrapper');
            const chk = document.getElementById('monteurToggleScriptCheckbox');
            if (chk) chk.checked = active;
            if (wrapper) {
                if (active) {
                    wrapper.classList.add('open');
                    const scriptArea = document.getElementById('monteurVideoCustomScript');
                    if (scriptArea) setTimeout(() => scriptArea.focus(), 250);
                } else {
                    wrapper.classList.remove('open');
                }
            }
        }

        function updateMonteurAssetsSummary() {
            if (!currentClient || !currentClient.folders) return;
            const f = currentClient.folders;
            const clips = (f.clips_video || []).length;
            const voice = (f.voix_off || []).length;
            const music = (f.musiques || []).length;
            const sfx = (f.effets_sonores || []).length;
            const imgs = (f.images_illustrations || []).length + (f.images_references || []).length;
            const skills = (f.skills || []).length;

            const elClips = document.getElementById('pillCountClips'); if (elClips) elClips.textContent = clips;
            const elVoice = document.getElementById('pillCountVoice'); if (elVoice) elVoice.textContent = voice;
            const elMusic = document.getElementById('pillCountMusic'); if (elMusic) elMusic.textContent = music;
            const elSfx = document.getElementById('pillCountSfx'); if (elSfx) elSfx.textContent = sfx;
            const elImgs = document.getElementById('pillCountImages'); if (elImgs) elImgs.textContent = imgs;
            const elSkills = document.getElementById('pillCountSkills'); if (elSkills) elSkills.textContent = skills;
        }

        async function submitClientVideoCreation() {
            if (!currentClient || !currentClient.name) {
                alert('Veuillez sélectionner un client.');
                return;
            }
            const promptEl = document.getElementById('monteurVideoPrompt');
            const prompt = promptEl ? promptEl.value.trim() : '';
            if (!prompt) {
                alert('Veuillez renseigner les consignes ou le prompt de montage pour ce client.');
                if (promptEl) promptEl.focus();
                return;
            }

            const isScriptActive = Boolean(document.getElementById('monteurToggleScriptCheckbox')?.checked);
            const scriptEl = document.getElementById('monteurVideoCustomScript');
            const customScript = isScriptActive && scriptEl ? scriptEl.value.trim() : '';

            const btn = document.getElementById('btnSubmitClientVideo');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span>Préparation du montage IA...</span>`;
            }

            // Récupérer tous les assets du client
            const clientName = currentClient.name;
            const userUploadedAssets = [];
            const imageFiles = [];
            let voiceFile = '';
            let musicFile = '';

            if (currentClient.folders) {
                Object.keys(currentClient.folders).forEach(cat => {
                    (currentClient.folders[cat] || []).forEach(f => {
                        const relPath = `Clients/${clientName}/${cat}/${f.name}`;
                        userUploadedAssets.push({
                            category: cat,
                            name: f.name,
                            relativePath: relPath,
                            url: `/${relPath}`,
                            size: f.size || 0
                        });
                        if (['images_illustrations', 'images_references'].includes(cat) && !imageFiles.includes(f.name)) {
                            imageFiles.push(f.name);
                        }
                        if (cat === 'voix_off' && !voiceFile) {
                            voiceFile = f.name;
                        }
                        if (cat === 'musiques' && !musicFile) {
                            musicFile = f.name;
                        }
                    });
                });
            }

            const cleanPromptWords = prompt
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, ' ')
                .trim()
                .split(/\s+/)
                .filter(w => w.length > 2);
            
            let autoName = cleanPromptWords.slice(0, 3).join('_');
            if (!autoName || autoName.length < 2) {
                autoName = `client_${clientName.toLowerCase()}_${Date.now().toString().slice(-4)}`;
            }

            const payload = {
                fileName: autoName,
                prompt: prompt,
                preferredAi: localStorage.getItem('vibeeditor_preferred_ai') || 'kombo',
                format: monteurSelectedFormat || '9:16',
                useTemplate: false,
                template: 'none',
                style: 'none',
                backgroundType: 'black',
                backgroundColor: '#000000',
                audioSetup: voiceFile ? (musicFile ? 'full_mix' : 'voice_only') : (musicFile ? 'music_only' : 'full_mix'),
                subtitles: true,
                subtitleType: 'karaoke',
                subtitleFont: 'Montserrat',
                subtitleBaseColor: '#ffffff',
                subtitleAccentColor: '#38bdf8',
                channelId: clientName,
                subfolder: clientName,
                isClient: true,
                clientName: clientName,
                userUploadedAssets: userUploadedAssets,
                hasUserAssets: userUploadedAssets.length > 0,
                images: imageFiles,
                hasUserImages: imageFiles.length > 0,
                hasUserVoice: Boolean(voiceFile),
                hasUserMusic: Boolean(musicFile),
                voiceover: voiceFile,
                music: musicFile,
                hasCustomScript: isScriptActive && customScript.length > 0,
                customScript: customScript,
                script: customScript,
                timestamp: Date.now()
            };

            localStorage.setItem('vibeeditor_pending_creation', JSON.stringify(payload));
            window.location.href = `video_processus.html?client=${encodeURIComponent(clientName)}&channel=${encodeURIComponent(clientName)}`;
        }
