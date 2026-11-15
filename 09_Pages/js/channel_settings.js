const STORAGE_KEY_CHANNELS = 'vibeeditor_channels_data';
        let currentChannel = null;

        const SYSTEM_DEFAULT_FONTS = [
            'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Candara',
            'Century Gothic', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel',
            'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Georgia',
            'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console',
            'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya',
            'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa',
            'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti',
            'Mongolian Baiti', 'MS Gothic', 'MS PGothic', 'MS UI Gothic', 'MV Boli',
            'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe Print',
            'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol',
            'SimSun', 'Sitka Text', 'Sylfaen', 'Tahoma', 'Times New Roman',
            'Trebuchet MS', 'Verdana', 'Yu Gothic',
            // Polices modernes populaires
            'Montserrat', 'Inter', 'Outfit', 'Poppins', 'Roboto', 'Open Sans',
            'Plus Jakarta Sans', 'Bebas Neue', 'Caveat', 'Dancing Script', 'Patrick Hand', 'Kalam'
        ];

        let availableFonts = [...new Set(SYSTEM_DEFAULT_FONTS)].sort((a,b) => a.localeCompare(b));

        function populateSystemFontsDatalist() {
            const datalist = document.getElementById('systemFontsDatalist');
            if (!datalist) return;
            datalist.innerHTML = availableFonts.map(f => `<option value="${f}">${f}</option>`).join('');
            const badge = document.getElementById('fontsCountBadge');
            if (badge) {
                badge.textContent = `${availableFonts.length} polices disponibles`;
            }
        }

        async function scanMachineFonts() {
            const badge = document.getElementById('fontsCountBadge');
            if ('queryLocalFonts' in window) {
                try {
                    if (badge) badge.textContent = 'Scan en cours...';
                    const localFonts = await window.queryLocalFonts();
                    const machineFamilies = new Set(availableFonts);
                    for (const font of localFonts) {
                        if (font.family) {
                            machineFamilies.add(font.family);
                        }
                    }
                    availableFonts = Array.from(machineFamilies).sort((a,b) => a.localeCompare(b));
                    populateSystemFontsDatalist();
                    if (badge) {
                        badge.textContent = `✓ ${availableFonts.length} polices PC détectées`;
                        badge.style.color = '#10b981';
                    }
                } catch (err) {
                    console.warn('Scan local fonts refusé ou erreur:', err);
                    if (badge) {
                        badge.textContent = `${availableFonts.length} polices système standard`;
                    }
                }
            } else {
                alert('La détection automatique directe nécessite un navigateur basé sur Chromium (Chrome, Edge). La liste complète des polices standard Windows/Mac est déjà chargée.');
            }
        }

        function getChannelId() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        async function initPage() {
            populateSystemFontsDatalist();

            const channelId = getChannelId();
            if (!channelId) {
                alert('Aucune chaîne spécifiée.');
                window.location.href = 'createur.html';
                return;
            }

            // Met à jour les liens de retour
            document.getElementById('linkBackToChannel').href = `channel.html?id=${encodeURIComponent(channelId)}`;
            document.getElementById('btnCancelHeader').href = `channel.html?id=${encodeURIComponent(channelId)}`;
            document.getElementById('linkBackFooter').href = `channel.html?id=${encodeURIComponent(channelId)}`;

            // Charger les chaînes depuis l'API ou le localStorage
            let channels = [];
            try {
                const res = await fetch('/api/channels');
                if (res.ok) channels = await res.json();
            } catch (err) {}

            if (channels.length === 0) {
                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    try { channels = JSON.parse(raw); } catch(e){}
                }
            }

            currentChannel = channels.find(c => c.id === channelId);
            if (!currentChannel) {
                alert('Chaîne introuvable.');
                window.location.href = 'createur.html';
                return;
            }

            // Mettre à jour l'en-tête et le fil d'Ariane
            document.title = `Paramètres — ${currentChannel.name} — AutoFrame`;
            const bcName = document.getElementById('breadcrumbChannelName');
            bcName.textContent = currentChannel.name;
            bcName.href = `channel.html?id=${encodeURIComponent(channelId)}`;

            // Remplir les champs du formulaire
            document.getElementById('inputName').value = currentChannel.name || '';
            document.getElementById('inputPlatform').value = currentChannel.platform || 'YouTube';
            document.getElementById('inputFormat').value = currentChannel.format || '16:9';
            document.getElementById('inputDesc').value = currentChannel.description || '';

            // Couleurs
            const cPrim = currentChannel.colorPrimary || '#ff3344';
            const cSec = currentChannel.colorSecondary || '#6366f1';
            document.getElementById('nativeColorPrimary').value = cPrim;
            document.getElementById('hexColorPrimary').value = cPrim;
            document.getElementById('nativeColorSecondary').value = cSec;
            document.getElementById('hexColorSecondary').value = cSec;

            // Typographies
            document.getElementById('inputFontPrimary').value = currentChannel.fontPrimary || 'Montserrat';
            document.getElementById('inputFontSecondary').value = currentChannel.fontSecondary || 'Inter';
            document.getElementById('inputFontAccent').value = currentChannel.fontAccent || 'Caveat';

            updateLivePreview();
        }

        function autoSelectFormat() {
            const platform = document.getElementById('inputPlatform').value;
            const formatSelect = document.getElementById('inputFormat');
            if (platform === 'TikTok') {
                formatSelect.value = '9:16';
            } else if (platform === 'Instagram') {
                formatSelect.value = '1:1';
            } else {
                formatSelect.value = '16:9';
            }
        }

        function syncColorInput(sourceColorId, targetHexId) {
            const val = document.getElementById(sourceColorId).value;
            document.getElementById(targetHexId).value = val;
            updateLivePreview();
        }

        function syncHexInput(sourceHexId, targetColorId) {
            let val = document.getElementById(sourceHexId).value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                document.getElementById(targetColorId).value = val;
                updateLivePreview();
            }
        }

        function updateLivePreview() {
            const fPrim = (document.getElementById('inputFontPrimary').value || 'Montserrat').trim();
            const fSec = (document.getElementById('inputFontSecondary').value || 'Inter').trim();
            const fAcc = (document.getElementById('inputFontAccent').value || 'Caveat').trim();
            const cPrim = document.getElementById('nativeColorPrimary').value;
            const cSec = document.getElementById('nativeColorSecondary').value;

            // Tags labels
            const tagPrim = document.getElementById('tagFontPrimary');
            if (tagPrim) {
                tagPrim.textContent = fPrim;
                tagPrim.style.fontFamily = `"${fPrim}", sans-serif`;
                tagPrim.style.color = cPrim;
            }

            const tagSec = document.getElementById('tagFontSecondary');
            if (tagSec) {
                tagSec.textContent = fSec;
                tagSec.style.fontFamily = `"${fSec}", sans-serif`;
            }

            const tagAcc = document.getElementById('tagFontAccent');
            if (tagAcc) {
                tagAcc.textContent = fAcc;
                tagAcc.style.fontFamily = `"${fAcc}", cursive, sans-serif`;
                tagAcc.style.color = cSec;
            }

            // Specimens
            const spPrim = document.getElementById('specimenFontPrimary');
            if (spPrim) { spPrim.style.fontFamily = `"${fPrim}", sans-serif`; spPrim.style.color = '#ff3344'; }

            const spSec = document.getElementById('specimenFontSecondary');
            if (spSec) { spSec.style.fontFamily = `"${fSec}", sans-serif`; spSec.style.color = '#ff3344'; }

            const spAcc = document.getElementById('specimenFontAccent');
            if (spAcc) { spAcc.style.fontFamily = `"${fAcc}", cursive, sans-serif`; spAcc.style.color = '#ff3344'; }
        }

        async function saveSettings() {
            if (!currentChannel) return;

            const name = document.getElementById('inputName').value.trim();
            if (!name) {
                alert('Veuillez entrer un nom pour la chaîne.');
                document.getElementById('inputName').focus();
                return;
            }

            currentChannel.name = name;
            currentChannel.platform = document.getElementById('inputPlatform').value;
            currentChannel.format = document.getElementById('inputFormat').value;
            currentChannel.avatar = currentChannel.avatar || '';
            currentChannel.description = document.getElementById('inputDesc').value.trim();
            currentChannel.colorPrimary = document.getElementById('nativeColorPrimary').value;
            currentChannel.colorSecondary = document.getElementById('nativeColorSecondary').value;
            currentChannel.fontPrimary = document.getElementById('inputFontPrimary').value.trim() || 'Montserrat';
            currentChannel.fontSecondary = document.getElementById('inputFontSecondary').value.trim() || 'Inter';
            currentChannel.fontAccent = document.getElementById('inputFontAccent').value.trim() || 'Caveat';

            // 1. Sauvegarde sur le serveur backend
            try {
                await fetch('/api/channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentChannel)
                });
            } catch (err) {
                console.error('Erreur API sauvegarde:', err);
            }

            // 2. Sauvegarde dans localStorage
            try {
                const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
                if (raw) {
                    let allChans = JSON.parse(raw);
                    const idx = allChans.findIndex(c => c.id === currentChannel.id);
                    if (idx >= 0) {
                        allChans[idx] = currentChannel;
                    } else {
                        allChans.push(currentChannel);
                    }
                    localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(allChans));
                }
            } catch (err) {}

            // Afficher toast et rediriger
            const toast = document.getElementById('toastMsg');
            toast.classList.add('show');
            setTimeout(() => {
                window.location.href = `channel.html?id=${encodeURIComponent(currentChannel.id)}`;
            }, 700);
        }

        window.addEventListener('load', initPage);
