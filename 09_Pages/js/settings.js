const PREF_KEY_TTS_ENGINE = 'vibeeditor_pref_tts_engine';
        const PREF_KEY_FORMAT = 'vibeeditor_pref_format';
        const PREF_KEY_FPS = 'vibeeditor_pref_fps';
        const PREF_KEY_QUALITY = 'vibeeditor_pref_quality';
        const PREF_KEY_TEMPLATE = 'vibeeditor_pref_template';
        const PREF_KEY_SUBTITLE_STYLE = 'vibeeditor_pref_subtitle_style';
        const API_KEY_GOOGLE = 'vibeeditor_api_google';

        const PREF_KEY_GEMINI_MODEL = 'vibeeditor_pref_gemini_model';

        function handleGeminiModelChange(val) {
            const wrap = document.getElementById('customGeminiModelWrapper');
            if (wrap) wrap.style.display = (val === 'custom') ? 'block' : 'none';
        }

        function setGeminiModelUI(modelName) {
            const sel = document.getElementById('prefGeminiModel');
            const wrap = document.getElementById('customGeminiModelWrapper');
            const customInput = document.getElementById('customGeminiModel');
            if (!sel) return;
            const clean = (modelName || 'gemini-3.5-flash-lite').trim();
            const exists = Array.from(sel.options).some(o => o.value === clean);
            if (exists) {
                sel.value = clean;
                if (wrap) wrap.style.display = 'none';
            } else {
                sel.value = 'custom';
                if (wrap) wrap.style.display = 'block';
                if (customInput) customInput.value = clean;
            }
        }

        const API_KEY_ELEVENLABS = 'vibeeditor_api_elevenlabs';
        const ELEVENLABS_VOICE_ID = 'vibeeditor_elevenlabs_voice_id';
        const ELEVENLABS_MODEL_ID = 'vibeeditor_elevenlabs_model_id';
        const API_KEY_PIXABAY = 'vibeeditor_api_pixabay';
        const API_KEY_COVERR = 'vibeeditor_api_coverr';
        const API_KEY_BRANDFETCH = 'vibeeditor_api_brandfetch';
        const API_KEY_BG_REMOVE = 'vibeeditor_api_bg_remove';
        const API_KEY_SKETCHFAB = 'vibeeditor_api_sketchfab';
        const API_KEY_HEYGEN = 'vibeeditor_api_heygen';
        const HEYGEN_VOICE_ID = 'vibeeditor_heygen_voice_id';

        // Caches et états
        let voicesCache = {};
        let heygenVoicesCache = {};
        let settingsHeygenRawList = [];
        let keyChangeTimeout = null;
        let heygenKeyChangeTimeout = null;
        let previewAudioInstance = null;

        
        // =========================================================================
        // GESTION DU KOMBO IA & DÉTECTION DES AGENTS LOCAUX
        // =========================================================================
        const API_KEY_GROQ = 'vibeeditor_api_key_groq';
        const API_KEY_OPENROUTER = 'vibeeditor_api_key_openrouter';

        let detectedAgents = { claude: { installed: false }, agy: { installed: false } };

        let defaultKomboOrder = [
            { id: 'gemini', name: 'Google Gemini', desc: 'Modèle IA polyvalent', model: 'gemini-3.5-flash-lite', enabled: true },
            { id: 'groq', name: 'Groq Cloud', desc: '', model: 'qwen/qwen3.8-27b', enabled: true },
            { id: 'openrouter', name: 'OpenRouter', desc: '', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', enabled: true },
            { id: 'claude_cli', name: 'Claude Code CLI (Local)', desc: 'Agent local Anthropic', model: 'local', enabled: true },
            { id: 'agy_cli', name: 'Antigravity CLI (Local)', desc: 'Agent local Google Antigravity', model: 'local', enabled: true }
        ];

        let currentKomboOrder = [...defaultKomboOrder];

        async function detectLocalAiAgentsUi(showToastMsg = false) {
            const badgeClaude = document.getElementById('badgeClaudeStatus');
            const badgeAgy = document.getElementById('badgeAgyStatus');
            const textClaude = document.getElementById('versionClaudeText');
            const textAgy = document.getElementById('versionAgyText');

            if (badgeClaude) badgeClaude.textContent = 'Détection...';
            if (badgeAgy) badgeAgy.textContent = 'Détection...';

            try {
                const res = await fetch('/api/ai/detect');
                if (!res.ok) {
                    throw new Error(`Serveur HTTP ${res.status}`);
                }
                const data = await res.json();
                if (data.success && data.agents) {
                    detectedAgents = data.agents;

                    // Mise à jour Claude Code
                    if (data.agents.claude && data.agents.claude.installed) {
                        if (badgeClaude) {
                            badgeClaude.className = 'agent-status-badge detected';
                            badgeClaude.innerHTML = '🔵 Détecté (À tester)';
                        }
                        if (textClaude) textClaude.textContent = (data.agents.claude.version || 'Claude Code CLI') + ' • Cliquez sur ⚡ Tester ci-dessous';
                    } else {
                        if (badgeClaude) {
                            badgeClaude.className = 'agent-status-badge not-detected';
                            badgeClaude.innerHTML = '⚪ Non détecté';
                        }
                        if (textClaude) textClaude.textContent = 'Non installé dans le PATH';
                    }

                    // Mise à jour Antigravity
                    if (data.agents.agy && data.agents.agy.installed) {
                        if (badgeAgy) {
                            badgeAgy.className = 'agent-status-badge detected';
                            badgeAgy.innerHTML = '🔵 Détecté (À tester)';
                        }
                        const v = data.agents.agy.version || 'Antigravity CLI';
                        if (textAgy) textAgy.textContent = (v.startsWith('Antigravity') ? v : `Antigravity ${v}`) + ' • Démarrage agent (~25-30s)';
                    } else {
                        if (badgeAgy) {
                            badgeAgy.className = 'agent-status-badge not-detected';
                            badgeAgy.innerHTML = '⚪ Non détecté';
                        }
                        if (textAgy) textAgy.textContent = 'Non installé dans le PATH';
                    }

                    renderKomboListUI();

                    if (showToastMsg && typeof showToast === 'function') {
                        const foundCount = (data.agents.claude.installed ? 1 : 0) + (data.agents.agy.installed ? 1 : 0);
                        showToast(`${foundCount} agent(s) local/locaux détecté(s) !`);
                    }
                }
            } catch (err) {
                console.warn('Détection agents locaux non disponible:', err.message);
                if (badgeClaude) {
                    badgeClaude.className = 'agent-status-badge not-detected';
                    badgeClaude.innerHTML = '⚠️ Redémarrer serveur';
                }
                if (textClaude) textClaude.textContent = 'Redémarrez le terminal serveur (node 07_Scripts/studio-server.cjs)';
                if (badgeAgy) {
                    badgeAgy.className = 'agent-status-badge not-detected';
                    badgeAgy.innerHTML = '⚠️ Redémarrer serveur';
                }
                if (textAgy) textAgy.textContent = 'Pour charger les nouvelles routes API';
            }
        }

        function renderKomboListUI() {
            const wrapper = document.getElementById('komboListWrapper');
            if (!wrapper) return;

            wrapper.innerHTML = '';

            currentKomboOrder.forEach((item, index) => {
                const card = document.createElement('div');
                const isPrimary = index === 0;
                card.className = `kombo-item-card ${item.enabled ? 'is-active' : 'is-disabled'} ${isPrimary ? 'is-primary' : ''}`;

                const priorityLabel = isPrimary 
                    ? '1️⃣ Prioritaire (Par défaut)' 
                    : `${index + 1}️⃣ Secours ${index}`;

                let modelSelectHtml = '';
                if (item.id === 'gemini') {
                    modelSelectHtml = `
                        <select class="kombo-model-select" onchange="onKomboModelChanged(${index}, this.value)" title="Choisir le modèle Gemini">
                            <option value="gemini-3.5-flash-lite" ${item.model === 'gemini-3.5-flash-lite' ? 'selected' : ''}>gemini-3.5-flash-lite (Gratuit standard)</option>
                            <option value="gemini-3.5-flash" ${item.model === 'gemini-3.5-flash' ? 'selected' : ''}>gemini-3.5-flash</option>
                            <option value="gemini-flash-latest" ${item.model === 'gemini-flash-latest' ? 'selected' : ''}>gemini-flash-latest</option>
                            <option value="gemini-3.7-flash" ${item.model === 'gemini-3.7-flash' ? 'selected' : ''}>gemini-3.7-flash</option>
                        </select>
                    `;
                } else if (item.id === 'groq') {
                    modelSelectHtml = `
                        <select class="kombo-model-select" onchange="onKomboModelChanged(${index}, this.value)" title="Choisir le modèle Groq">
                            <option value="qwen/qwen3.8-27b" ${item.model === 'qwen/qwen3.8-27b' ? 'selected' : ''}>qwen/qwen3.8-27b (Qwen 3.8)</option>
                            <option value="openai/gpt-oss-120b" ${item.model === 'openai/gpt-oss-120b' ? 'selected' : ''}>openai/gpt-oss-120b (GPT-OSS 120B)</option>
                        </select>
                    `;
                } else if (item.id === 'openrouter') {
                    modelSelectHtml = `
                        <select class="kombo-model-select" onchange="onKomboModelChanged(${index}, this.value)" title="Choisir le modèle OpenRouter">
                            <option value="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free" ${item.model === 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free' ? 'selected' : ''}>nvidia/nemotron-3-nano-omni-30b (Reasoning)</option>
                            <option value="recursive/flint-v1.0:free" ${item.model === 'recursive/flint-v1.0:free' ? 'selected' : ''}>recursive/flint-v1.0:free (Chat)</option>
                            <option value="inclusionai/ling-3.2-flash:free" ${item.model === 'inclusionai/ling-3.2-flash:free' ? 'selected' : ''}>inclusionai/ling-3.2-flash:free (Flash)</option>
                        </select>
                    `;
                } else if (item.id === 'claude_cli') {
                    const isInst = detectedAgents.claude && detectedAgents.claude.installed;
                    modelSelectHtml = `<span style="font-size: 11px; font-family:'JetBrains Mono',monospace; color: ${isInst ? '#38bdf8' : '#94a3b8'};">${isInst ? 'CLI Détecté' : 'Non détecté'}</span>`;
                } else if (item.id === 'agy_cli') {
                    const isInst = detectedAgents.agy && detectedAgents.agy.installed;
                    modelSelectHtml = `<span style="font-size: 11px; font-family:'JetBrains Mono',monospace; color: ${isInst ? '#38bdf8' : '#94a3b8'};">${isInst ? 'CLI Détecté' : 'Non détecté'}</span>`;
                }

                card.innerHTML = `
                    <div class="kombo-left-group">
                        <input type="checkbox" ${item.enabled ? 'checked' : ''} onchange="toggleKomboItem(${index})" style="accent-color: #3b82f6; width: 16px; height: 16px; cursor: pointer;" title="Activer / Désactiver ce modèle dans le Kombo">
                        <span class="kombo-priority-tag">${priorityLabel}</span>
                        <div class="kombo-name-block">
                            <span class="kombo-name">${item.name}</span>
                        </div>
                    </div>
                    <div class="kombo-right-group">
                        ${modelSelectHtml}
                        <button type="button" class="kombo-order-btn" onclick="moveKomboItem(${index}, -1)" ${index === 0 ? 'disabled' : ''} title="Monter la priorité d'un cran (vers le haut)">
                            ▲
                        </button>
                        <button type="button" class="kombo-order-btn" onclick="moveKomboItem(${index}, 1)" ${index === currentKomboOrder.length - 1 ? 'disabled' : ''} title="Descendre la priorité d'un cran (vers le bas)">
                            ▼
                        </button>
                        <button type="button" class="btn-secondary" onclick="testProviderQuick('${item.id}', this)" style="padding: 5px 10px; font-size: 11px; white-space: nowrap;">
                            <span>⚡ Tester</span>
                        </button>
                    </div>
                `;

                wrapper.appendChild(card);
            });
        }

        function moveKomboItem(index, direction) {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= currentKomboOrder.length) return;
            const temp = currentKomboOrder[index];
            currentKomboOrder[index] = currentKomboOrder[newIndex];
            currentKomboOrder[newIndex] = temp;
            try { localStorage.setItem('autoframe_ai_kombo_order', JSON.stringify(currentKomboOrder)); } catch (e) {}
            renderKomboListUI();
        }

        function toggleKomboItem(index) {
            currentKomboOrder[index].enabled = !currentKomboOrder[index].enabled;
            try { localStorage.setItem('autoframe_ai_kombo_order', JSON.stringify(currentKomboOrder)); } catch (e) {}
            renderKomboListUI();
        }

        function onKomboModelChanged(index, newModel) {
            currentKomboOrder[index].model = newModel;
            try { localStorage.setItem('autoframe_ai_kombo_order', JSON.stringify(currentKomboOrder)); } catch (e) {}
            if (currentKomboOrder[index].id === 'gemini') {
                const sel = document.getElementById('prefGeminiModel');
                if (sel) sel.value = newModel;
            }
        }

        async function testProviderQuick(providerId, btnEl) {
            const origHtml = btnEl ? btnEl.innerHTML : '';
            const isLocalAgent = providerId === 'agy_cli' || providerId === 'claude_cli';
            if (btnEl) {
                btnEl.disabled = true;
                btnEl.innerHTML = isLocalAgent ? '<span>⏳ CLI (~25s)...</span>' : '<span>Test...</span>';
            }

            try {
                const item = currentKomboOrder.find(k => k.id === providerId) || { model: '' };
                const res = await fetch('/api/ai/test-provider', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: providerId, model: item.model })
                });
                const data = await res.json();
                if (data.success) {
                    if (typeof showToast === 'function') showToast(`${item.name || providerId} : Connexion réussie (${data.latencyMs}ms) !`);
                    if (btnEl) btnEl.innerHTML = `<span style="color:#34d399;">✓ ${data.latencyMs}ms</span>`;
                    if (providerId === 'claude_cli') {
                        const badge = document.getElementById('badgeClaudeStatus');
                        if (badge) { badge.className = 'agent-status-badge detected'; badge.innerHTML = '🟢 Opérationnel'; }
                    } else if (providerId === 'agy_cli') {
                        const badge = document.getElementById('badgeAgyStatus');
                        if (badge) { badge.className = 'agent-status-badge detected'; badge.innerHTML = '🟢 Opérationnel'; }
                    }
                } else {
                    const errStr = data.error || 'Erreur inconnue';
                    if (providerId === 'claude_cli') {
                        const badge = document.getElementById('badgeClaudeStatus');
                        if (badge) { badge.className = 'agent-status-badge not-detected'; badge.innerHTML = '🔴 Échec test'; }
                    } else if (providerId === 'agy_cli') {
                        const badge = document.getElementById('badgeAgyStatus');
                        if (badge) { badge.className = 'agent-status-badge not-detected'; badge.innerHTML = '🔴 Échec test'; }
                    }
                    if (errStr.includes('401') || errStr.toLowerCase().includes('unauthorized')) {
                        if (typeof showToast === 'function') showToast(`${item.name || providerId} : Session ou clé non autorisée (401).`, 'error');
                        if (btnEl) btnEl.innerHTML = '<span style="color:#f87171;">Auth requise (401)</span>';
                    } else {
                        if (typeof showToast === 'function') showToast(`${item.name || providerId} : Échec (${errStr.slice(0, 100)})`, 'error');
                        if (btnEl) btnEl.innerHTML = '<span style="color:#f87171;">Échec</span>';
                    }
                }
            } catch (e) {
                if (typeof showToast === 'function') showToast(`Erreur test ${providerId}: ${e.message}`, 'error');
                if (btnEl) btnEl.innerHTML = '<span style="color:#f87171;">Erreur</span>';
            } finally {
                setTimeout(() => {
                    if (btnEl) {
                        btnEl.disabled = false;
                        btnEl.innerHTML = origHtml;
                    }
                }, 4000);
            }
        }

        async function testEntireKomboChain() {
            const btn = document.getElementById('btnTestEntireKombo');
            const box = document.getElementById('komboTestResultsBox');
            if (btn) btn.disabled = true;
            if (box) {
                box.style.display = 'block';
                box.innerHTML = '<div style="color:#60a5fa;">⚡ Lancement du test séquentiel du Kombo IA...</div>';
            }

            const activeItems = currentKomboOrder.filter(k => k.enabled);

            for (let i = 0; i < activeItems.length; i++) {
                const item = activeItems[i];
                const priorityText = i === 0 ? '1er Prioritaire' : `Secours ${i}`;
                box.innerHTML += `<div>→ Test de ${item.name} (${item.model})...</div>`;

                try {
                    const res = await fetch('/api/ai/test-provider', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ provider: item.id, model: item.model })
                    });
                    const data = await res.json();
                    if (data.success) {
                        box.innerHTML += `<div style="color:#34d399;">  ✓ [${priorityText}] ${item.name} : ${data.latencyMs}ms - Réponse valide reçue</div>`;
                    } else {
                        box.innerHTML += `<div style="color:#f87171;">  ✗ [${priorityText}] ${item.name} : ${data.error || 'Erreur'}</div>`;
                    }
                } catch (e) {
                    box.innerHTML += `<div style="color:#f87171;">  ✗ [${priorityText}] ${item.name} : ${e.message}</div>`;
                }
            }

            box.innerHTML += '<div style="margin-top:6px; color:#ffffff; font-weight:700;">Test du Kombo terminé.</div>';
            if (btn) btn.disabled = false;
        }

        function handleGroqKeyChange() {}
        function handleOpenRouterKeyChange() {}

        // CHARGEMENT INITIAL (LocalStorage + /api/settings api_config.json)
        window.addEventListener('load', async () => {
            // Initialisation synchrone immédiate du Kombo IA
            try {
                const savedKombo = localStorage.getItem('autoframe_ai_kombo_order');
                if (savedKombo) currentKomboOrder = JSON.parse(savedKombo);
            } catch (e) {}
            const openrouterItem = currentKomboOrder.find(k => k.id === 'openrouter');
            if (openrouterItem && (!openrouterItem.model || openrouterItem.model.includes('nemotron-4-340b') || openrouterItem.model.includes('embed') || openrouterItem.model.includes('rerank'))) {
                openrouterItem.model = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';
            }
            const geminiItem = currentKomboOrder.find(k => k.id === 'gemini');
            if (geminiItem && (geminiItem.model.includes('argon') || geminiItem.model.includes('pro'))) {
                geminiItem.model = 'gemini-3.5-flash-lite';
            }
            renderKomboListUI();
            detectLocalAiAgentsUi(false);
            // 1. LocalStorage
            const savedTtsEngine = localStorage.getItem(PREF_KEY_TTS_ENGINE);
            if (savedTtsEngine && document.getElementById('prefTtsEngine')) document.getElementById('prefTtsEngine').value = savedTtsEngine;
            const savedFormat = localStorage.getItem(PREF_KEY_FORMAT);
            const savedFps = localStorage.getItem(PREF_KEY_FPS);
            const savedQuality = localStorage.getItem(PREF_KEY_QUALITY);
            const savedTemplate = localStorage.getItem(PREF_KEY_TEMPLATE);
            const savedSubtitleStyle = localStorage.getItem(PREF_KEY_SUBTITLE_STYLE);
            const savedGoogle = localStorage.getItem(API_KEY_GOOGLE);

            let savedGeminiModel = localStorage.getItem(PREF_KEY_GEMINI_MODEL);
            if (savedGeminiModel && (savedGeminiModel.includes('argon') || savedGeminiModel.includes('pro'))) {
                savedGeminiModel = 'gemini-3.5-flash-lite';
                localStorage.setItem(PREF_KEY_GEMINI_MODEL, 'gemini-3.5-flash-lite');
            }
            if (savedGeminiModel) setGeminiModelUI(savedGeminiModel);

            const savedElevenlabs = localStorage.getItem(API_KEY_ELEVENLABS);
            let savedElevenVoice = localStorage.getItem(ELEVENLABS_VOICE_ID);
            const savedElevenModel = localStorage.getItem(ELEVENLABS_MODEL_ID);
            const savedPixabay = localStorage.getItem(API_KEY_PIXABAY);
            const savedCoverr = localStorage.getItem(API_KEY_COVERR);
            const savedBrandfetch = localStorage.getItem(API_KEY_BRANDFETCH);
            const savedBgRemove = localStorage.getItem(API_KEY_BG_REMOVE);
            const savedSketchfab = localStorage.getItem(API_KEY_SKETCHFAB);
            const savedHeygen = localStorage.getItem(API_KEY_HEYGEN);
            let savedHeygenVoice = localStorage.getItem(HEYGEN_VOICE_ID);

            if (savedFormat && document.getElementById('prefFormat')) document.getElementById('prefFormat').value = savedFormat;
            if (savedFps && document.getElementById('prefFps')) document.getElementById('prefFps').value = savedFps;
            if (savedQuality && document.getElementById('prefQuality')) document.getElementById('prefQuality').value = savedQuality;
            if (savedTemplate && document.getElementById('prefTemplate')) document.getElementById('prefTemplate').value = savedTemplate;
            if (savedSubtitleStyle && document.getElementById('prefSubtitleStyle')) document.getElementById('prefSubtitleStyle').value = savedSubtitleStyle;
            if (savedGoogle && document.getElementById('apiKeyGoogle')) document.getElementById('apiKeyGoogle').value = savedGoogle;
            if (savedElevenlabs && document.getElementById('apiKeyElevenlabs')) document.getElementById('apiKeyElevenlabs').value = savedElevenlabs;
            if (savedElevenModel && document.getElementById('elevenlabsModelId')) document.getElementById('elevenlabsModelId').value = savedElevenModel;
            if (savedPixabay && document.getElementById('apiKeyPixabay')) document.getElementById('apiKeyPixabay').value = savedPixabay;
            if (savedCoverr && document.getElementById('apiKeyCoverr')) document.getElementById('apiKeyCoverr').value = savedCoverr;
            if (savedBrandfetch && document.getElementById('apiKeyBrandfetch')) document.getElementById('apiKeyBrandfetch').value = savedBrandfetch;
            if (savedBgRemove && document.getElementById('apiKeyBgRemove')) document.getElementById('apiKeyBgRemove').value = savedBgRemove;
            if (savedSketchfab && document.getElementById('apiKeySketchfab')) document.getElementById('apiKeySketchfab').value = savedSketchfab;
            if (savedHeygen && document.getElementById('apiKeyHeygen')) document.getElementById('apiKeyHeygen').value = savedHeygen;

            // 2. Synchronisation complète depuis le serveur (/api/settings -> api_config.json)
            let activeElevenKey = savedElevenlabs || '';
            let activeHeyGenKey = savedHeygen || '';

            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const cfg = await res.json();
                    if (cfg.tts_engine && document.getElementById('prefTtsEngine')) {
                        document.getElementById('prefTtsEngine').value = cfg.tts_engine;
                        localStorage.setItem(PREF_KEY_TTS_ENGINE, cfg.tts_engine);
                    }
                    if (cfg.pref_format && !savedFormat && document.getElementById('prefFormat')) document.getElementById('prefFormat').value = cfg.pref_format;
                    if (cfg.pref_fps && !savedFps && document.getElementById('prefFps')) document.getElementById('prefFps').value = cfg.pref_fps;
                    if (cfg.pref_quality && !savedQuality && document.getElementById('prefQuality')) document.getElementById('prefQuality').value = cfg.pref_quality;
                    if (cfg.pref_template && !savedTemplate && document.getElementById('prefTemplate')) document.getElementById('prefTemplate').value = cfg.pref_template;
                    if (cfg.pref_subtitle_style && !savedSubtitleStyle && document.getElementById('prefSubtitleStyle')) document.getElementById('prefSubtitleStyle').value = cfg.pref_subtitle_style;

                    
                    
                    if (cfg.groq_api_key && document.getElementById('apiKeyGroq')) {
                        document.getElementById('apiKeyGroq').value = cfg.groq_api_key;
                        localStorage.setItem(API_KEY_GROQ, cfg.groq_api_key);
                    }
                    if (cfg.openrouter_api_key && document.getElementById('apiKeyOpenrouter')) {
                        document.getElementById('apiKeyOpenrouter').value = cfg.openrouter_api_key;
                        localStorage.setItem(API_KEY_OPENROUTER, cfg.openrouter_api_key);
                    }
                    if (Array.isArray(cfg.ai_kombo_order) && cfg.ai_kombo_order.length > 0) {
                        currentKomboOrder = cfg.ai_kombo_order;
                    }
                    renderKomboListUI();
                    detectLocalAiAgentsUi(false);

                    if (cfg.gemini_model) {
                        setGeminiModelUI(cfg.gemini_model);
                        localStorage.setItem(PREF_KEY_GEMINI_MODEL, cfg.gemini_model);
                    }

                    if (cfg.google_api_key && document.getElementById('apiKeyGoogle')) {
                        document.getElementById('apiKeyGoogle').value = cfg.google_api_key;
                        localStorage.setItem(API_KEY_GOOGLE, cfg.google_api_key);
                    }
                    if (cfg.elevenlabs_api_key && document.getElementById('apiKeyElevenlabs')) {
                        document.getElementById('apiKeyElevenlabs').value = cfg.elevenlabs_api_key;
                        activeElevenKey = cfg.elevenlabs_api_key;
                        localStorage.setItem(API_KEY_ELEVENLABS, cfg.elevenlabs_api_key);
                    }
                    if (cfg.elevenlabs_voice_id && !savedElevenVoice) {
                        savedElevenVoice = cfg.elevenlabs_voice_id;
                    }
                    if (cfg.elevenlabs_model_id && document.getElementById('elevenlabsModelId')) {
                        document.getElementById('elevenlabsModelId').value = cfg.elevenlabs_model_id;
                        localStorage.setItem(ELEVENLABS_MODEL_ID, cfg.elevenlabs_model_id);
                    }
                    if (cfg.pixabay_api_key && document.getElementById('apiKeyPixabay')) {
                        document.getElementById('apiKeyPixabay').value = cfg.pixabay_api_key;
                        localStorage.setItem(API_KEY_PIXABAY, cfg.pixabay_api_key);
                    }
                    if (cfg.coverr_api_key && document.getElementById('apiKeyCoverr')) {
                        document.getElementById('apiKeyCoverr').value = cfg.coverr_api_key;
                        localStorage.setItem(API_KEY_COVERR, cfg.coverr_api_key);
                    }
                    if (cfg.brandfetch_api_key && document.getElementById('apiKeyBrandfetch')) {
                        document.getElementById('apiKeyBrandfetch').value = cfg.brandfetch_api_key;
                        localStorage.setItem(API_KEY_BRANDFETCH, cfg.brandfetch_api_key);
                    }
                    if (cfg.bg_remove_api_key && document.getElementById('apiKeyBgRemove')) {
                        document.getElementById('apiKeyBgRemove').value = cfg.bg_remove_api_key;
                        localStorage.setItem(API_KEY_BG_REMOVE, cfg.bg_remove_api_key);
                    }
                    if (cfg.sketchfab_api_token && document.getElementById('apiKeySketchfab')) {
                        document.getElementById('apiKeySketchfab').value = cfg.sketchfab_api_token;
                        localStorage.setItem(API_KEY_SKETCHFAB, cfg.sketchfab_api_token);
                    }
                    if (cfg.heygen_api_key && document.getElementById('apiKeyHeygen')) {
                        document.getElementById('apiKeyHeygen').value = cfg.heygen_api_key;
                        activeHeyGenKey = cfg.heygen_api_key;
                        localStorage.setItem(API_KEY_HEYGEN, cfg.heygen_api_key);
                    }
                    if (cfg.heygen_voice_id && !savedHeygenVoice) {
                        savedHeygenVoice = cfg.heygen_voice_id;
                    }
                }
            } catch (e) {
                console.warn('Impossible de charger /api/settings:', e);
            }

            // 3. Initialisation ElevenLabs
            if (activeElevenKey && activeElevenKey.trim()) {
                await loadVoices(activeElevenKey.trim(), savedElevenVoice);
                loadElevenLabsSubscription(activeElevenKey.trim());
            }

            // 4. Initialisation HeyGen
            if (activeHeyGenKey && activeHeyGenKey.trim()) {
                loadHeyGenVoicesFromUi(savedHeygenVoice);
            }
        });

        // GESTION DU SÉLECTEUR MODERNE HEYGEN
        function getVoiceFlagUrl(voice) {
            const lang = ((voice && voice.language) || '').toLowerCase();
            const name = ((voice && voice.name) || '').toLowerCase();
            if (lang.includes('french') || lang.includes('français') || lang.includes('fr')) return 'https://flagcdn.com/fr.svg';
            if (lang.includes('english') || lang.includes('anglais') || lang.includes('en')) {
                if (name.includes('british') || name.includes('uk') || name.includes('london')) return 'https://flagcdn.com/gb.svg';
                if (name.includes('australian') || name.includes('au')) return 'https://flagcdn.com/au.svg';
                if (name.includes('canadian') || name.includes('ca')) return 'https://flagcdn.com/ca.svg';
                return 'https://flagcdn.com/us.svg';
            }
            if (lang.includes('spanish') || lang.includes('espagnol') || lang.includes('es')) return 'https://flagcdn.com/es.svg';
            if (lang.includes('german') || lang.includes('allemand') || lang.includes('de')) return 'https://flagcdn.com/de.svg';
            if (lang.includes('italian') || lang.includes('italien') || lang.includes('it')) return 'https://flagcdn.com/it.svg';
            if (lang.includes('portuguese') || lang.includes('portugais') || lang.includes('pt')) return 'https://flagcdn.com/pt.svg';
            if (lang.includes('japanese') || lang.includes('japonais') || lang.includes('ja')) return 'https://flagcdn.com/jp.svg';
            if (lang.includes('chinese') || lang.includes('chinois') || lang.includes('zh')) return 'https://flagcdn.com/cn.svg';
            if (lang.includes('arabic') || lang.includes('arabe') || lang.includes('ar')) return 'https://flagcdn.com/sa.svg';
            if (lang.includes('wolof') || name.includes('wolof') || name.includes('senegal')) return 'https://flagcdn.com/sn.svg';
            if (lang.includes('russian') || lang.includes('russe') || lang.includes('ru')) return 'https://flagcdn.com/ru.svg';
            if (lang.includes('dutch') || lang.includes('néerlandais') || lang.includes('nl')) return 'https://flagcdn.com/nl.svg';
            if (lang.includes('polish') || lang.includes('polonais') || lang.includes('pl')) return 'https://flagcdn.com/pl.svg';
            return 'https://flagcdn.com/us.svg';
        }

        function toggleSettingsVoiceDropdown(id) {
            const menu = document.getElementById(id);
            if (!menu) return;
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.voice-dropdown-menu').forEach(m => m.classList.remove('open'));
            if (!isOpen) {
                menu.classList.add('open');
                const inp = menu.querySelector('.voice-search-input');
                if (inp) setTimeout(() => inp.focus(), 60);
            }
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.modern-voice-picker')) {
                document.querySelectorAll('.voice-dropdown-menu').forEach(m => m.classList.remove('open'));
            }
        });

        function filterSettingsVoices(engine) {
            if (engine === 'heygen') {
                const query = (document.getElementById('settingsSearchHeygenInput').value || '').toLowerCase().trim();
                const filtered = settingsHeygenRawList.filter(v => 
                    (v.name || '').toLowerCase().includes(query) || 
                    (v.language || '').toLowerCase().includes(query)
                );
                renderSettingsHeygenRows(filtered);
            }
        }

        function renderSettingsHeygenRows(list) {
            const container = document.getElementById('settingsListHeygenItems');
            const currentSelected = document.getElementById('heygenVoiceId').value;
            if (!container) return;

            if (!list || list.length === 0) {
                container.innerHTML = '<div style="padding:14px; text-align:center; color:var(--text-muted); font-size:12px;">Aucune voix trouvée</div>';
                return;
            }

            let html = '';
            list.forEach(v => {
                const isSel = v.id === currentSelected ? 'selected' : '';
                const flagUrl = getVoiceFlagUrl(v);
                html += `
                    <div class="voice-item-row ${isSel}" onclick="selectSettingsHeygenVoice('${v.id}')">
                        <div class="voice-item-left">
                            <img class="voice-flag-img" src="${flagUrl}" alt="Flag">
                            <div class="voice-item-info">
                                <span class="voice-item-title">${v.name}</span>
                                <span class="voice-item-subtitle">${v.language || 'Français'} ${v.gender ? '• ' + v.gender : ''}</span>
                            </div>
                        </div>
                        <div class="voice-item-actions">
                            ${v.previewUrl ? `<button type="button" class="btn-inline-preview" onclick="event.stopPropagation(); playDirectPreviewSettings('${v.previewUrl}')" title="Écouter un extrait">▶</button>` : ''}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function selectSettingsHeygenVoice(voiceId) {
            const voice = heygenVoicesCache[voiceId];
            if (!voice) return;
            document.getElementById('heygenVoiceId').value = voice.id;
            document.getElementById('settingsNameHeygenSelected').textContent = voice.name;
            document.getElementById('settingsFlagHeygenSelected').src = getVoiceFlagUrl(voice);
            document.getElementById('settingsBadgeHeygenSelected').textContent = (voice.language || 'Turbo').toUpperCase();
            document.getElementById('settingsDropdownHeygen').classList.remove('open');
            renderSettingsHeygenRows(settingsHeygenRawList);

            const previewBtn = document.getElementById('btnPreviewHeyGenVoice');
            if (previewBtn) {
                previewBtn.style.display = voice.previewUrl ? 'inline-flex' : 'none';
                previewBtn.dataset.previewUrl = voice.previewUrl || '';
            }
        }

        function playDirectPreviewSettings(url) {
            if (!url) return;
            let audio = document.getElementById('audioPreview');
            if (!audio) {
                audio = new Audio();
            }
            audio.src = url;
            audio.play().catch(e => console.warn('Erreur preview:', e));
        }

        function onHeyGenVoiceSelected() {
            const selectEl = document.getElementById('heygenVoiceId');
            const previewBtn = document.getElementById('btnPreviewHeyGenVoice');
            const voiceId = selectEl ? selectEl.value : '';
            const voice = heygenVoicesCache[voiceId];

            if (previewBtn) {
                if (voice && voice.previewUrl) {
                    previewBtn.style.display = 'inline-flex';
                    previewBtn.dataset.previewUrl = voice.previewUrl;
                } else {
                    previewBtn.style.display = 'none';
                    previewBtn.dataset.previewUrl = '';
                }
            }
        }

        function playHeyGenVoicePreview() {
            const previewBtn = document.getElementById('btnPreviewHeyGenVoice');
            const url = previewBtn ? previewBtn.dataset.previewUrl : '';
            if (!url) return;

            let previewAudio = document.getElementById('audioPreview');
            if (!previewAudio) {
                previewAudio = new Audio();
            }
            previewAudio.src = url;
            previewAudio.play().catch(e => console.warn('Preview error:', e));
        }

        function handleHeyGenKeyChange() {
            clearTimeout(heygenKeyChangeTimeout);
            heygenKeyChangeTimeout = setTimeout(() => {
                const key = document.getElementById('apiKeyHeygen').value.trim();
                const statusEl = document.getElementById('heygenKeyStatus');
                if (key) {
                    loadHeyGenVoicesFromUi();
                } else {
                    if (statusEl) {
                        statusEl.innerHTML = `
                            <span style="color:var(--text-muted);">Synchronisez vos voix HeyGen officielles et personnalisées.</span>
                        `;
                    }
                }
            }, 600);
        }

        async function loadHeyGenVoicesFromUi(voiceToSelect = null) {
            const keyInput = document.getElementById('apiKeyHeygen');
            const key = keyInput ? keyInput.value.trim() : '';
            const statusEl = document.getElementById('heygenKeyStatus');
            if (statusEl) statusEl.innerHTML = `<span style="color:#ffbb00;">⏳ Chargement des voix HeyGen...</span>`;

            try {
                const url = key ? `/api/heygen/voices?key=${encodeURIComponent(key)}` : '/api/heygen/voices';
                const res = await fetch(url);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Erreur lors du chargement des voix HeyGen');
                }
                const data = await res.json();
                heygenVoicesCache = {};
                settingsHeygenRawList = [];

                if (data.frenchVoices) {
                    data.frenchVoices.forEach(v => {
                        heygenVoicesCache[v.id] = v;
                        settingsHeygenRawList.push(v);
                    });
                }
                if (data.englishVoices) {
                    data.englishVoices.slice(0, 30).forEach(v => {
                        heygenVoicesCache[v.id] = v;
                        settingsHeygenRawList.push(v);
                    });
                }

                renderSettingsHeygenRows(settingsHeygenRawList);

                const currentSaved = voiceToSelect || localStorage.getItem(HEYGEN_VOICE_ID);
                const initialVoice = (currentSaved && heygenVoicesCache[currentSaved])
                    ? currentSaved
                    : (settingsHeygenRawList.length > 0 ? settingsHeygenRawList[0].id : '');

                if (initialVoice) {
                    selectSettingsHeygenVoice(initialVoice);
                }
                if (statusEl) {
                    statusEl.innerHTML = `<span style="color:#10b981;">✅ ${data.total} voix HeyGen disponibles (${data.frenchVoices ? data.frenchVoices.length : 0} françaises).</span>`;
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.innerHTML = `<span style="color:#ff4444;">⚠️ ${err.message}</span>`;
                }
            }
        }

        function handleApiKeyChange() {
            clearTimeout(keyChangeTimeout);
            keyChangeTimeout = setTimeout(() => {
                const key = document.getElementById('apiKeyElevenlabs').value.trim();
                const statusEl = document.getElementById('elevenlabsKeyStatus');
                if (key) {
                    loadVoices(key);
                    loadElevenLabsSubscription(key);
                } else {
                    if (statusEl) {
                        statusEl.innerHTML = `
                            <span style="color:var(--text-muted);">Saisissez votre clé ElevenLabs pour synchroniser automatiquement vos voix.</span>
                        `;
                    }
                    const usageBox = document.getElementById('elevenlabsUsageBox');
                    if (usageBox) usageBox.style.display = 'none';
                }
            }, 600);
        }

        async function loadVoicesFromUi() {
            const key = document.getElementById('apiKeyElevenlabs').value.trim();
            const statusEl = document.getElementById('elevenlabsKeyStatus');
            if (!key) {
                if (statusEl) {
                    statusEl.innerHTML = `
                        <span style="color:#ff4444;">Veuillez renseigner votre clé API ElevenLabs ci-dessus d'abord.</span>
                    `;
                }
                return;
            }
            await loadVoices(key);
            loadElevenLabsSubscription(key);
        }

        async function loadVoices(key, voiceToSelect = null) {
            const statusEl = document.getElementById('elevenlabsKeyStatus');
            const selectEl = document.getElementById('elevenlabsVoiceId');
            if (statusEl) statusEl.innerHTML = `<span style="color:#ffbb00;">⏳ Chargement de vos voix ElevenLabs...</span>`;

            try {
                let data = null;
                try {
                    const res = await fetch(`/api/elevenlabs/voices?key=${encodeURIComponent(key)}`);
                    if (res.ok) data = await res.json();
                } catch (e) {}

                if (!data || !data.success) {
                    const directRes = await fetch('https://api.elevenlabs.io/v1/voices', {
                        headers: { 'xi-api-key': key }
                    });
                    if (!directRes.ok) {
                        const errTxt = await directRes.text();
                        throw new Error(`Erreur ElevenLabs (${directRes.status}) : ${errTxt}`);
                    }
                    const rawVoices = await directRes.json();
                    data = {
                        success: true,
                        total: rawVoices.voices ? rawVoices.voices.length : 0,
                        customVoices: (rawVoices.voices || []).filter(v => v.category === 'cloned' || v.category === 'generated'),
                        defaultVoices: (rawVoices.voices || []).filter(v => v.category !== 'cloned' && v.category !== 'generated')
                    };
                }

                voicesCache = {};
                selectEl.innerHTML = '';

                if (data.customVoices && data.customVoices.length > 0) {
                    const groupCustom = document.createElement('optgroup');
                    groupCustom.label = '⭐ Mes Clones & Voix Personnalisées';
                    data.customVoices.forEach(v => {
                        voicesCache[v.voice_id] = { id: v.voice_id, name: v.name, previewUrl: v.preview_url };
                        const opt = document.createElement('option');
                        opt.value = v.voice_id;
                        opt.textContent = `${v.name} (Clonée/Custom)`;
                        groupCustom.appendChild(opt);
                    });
                    selectEl.appendChild(groupCustom);
                }

                if (data.defaultVoices && data.defaultVoices.length > 0) {
                    const groupDefault = document.createElement('optgroup');
                    groupDefault.label = '🎙️ Voix Officielles ElevenLabs';
                    data.defaultVoices.forEach(v => {
                        voicesCache[v.voice_id] = { id: v.voice_id, name: v.name, previewUrl: v.preview_url };
                        const opt = document.createElement('option');
                        opt.value = v.voice_id;
                        const langInfo = (v.labels && v.labels.accent) ? ` (${v.labels.accent})` : '';
                        opt.textContent = `${v.name}${langInfo}`;
                        groupDefault.appendChild(opt);
                    });
                    selectEl.appendChild(groupDefault);
                }

                const currentSaved = voiceToSelect || localStorage.getItem(ELEVENLABS_VOICE_ID);
                if (currentSaved && voicesCache[currentSaved]) {
                    selectEl.value = currentSaved;
                } else if (selectEl.options.length > 0) {
                    selectEl.selectedIndex = 0;
                }

                onVoiceSelected();

                if (statusEl) {
                    statusEl.innerHTML = `
                        <span style="color:#10b981;">✅ ${data.total} voix disponibles (${data.customVoices ? data.customVoices.length : 0} personnalisées).</span>
                    `;
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.innerHTML = `
                        <span style="color:#ff4444;">❌ ${err.message || 'Impossible de joindre l\\\'API ElevenLabs.'}</span>
                    `;
                }
            }
        }

        async function loadElevenLabsSubscription(key) {
            const usageBox = document.getElementById('elevenlabsUsageBox');
            if (!usageBox) return;

            try {
                let data = null;
                (async () => {
                    try {
                        const res = await fetch(`/api/elevenlabs/subscription?key=${encodeURIComponent(key)}`);
                        if (res.ok) data = await res.json();
                    } catch (e) {}

                    if (!data || !data.success) {
                        try {
                            const directRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
                                headers: { 'xi-api-key': key }
                            });
                            if (directRes.ok) {
                                const raw = await directRes.json();
                                const limit = raw.character_limit || 10000;
                                const used = raw.character_count || 0;
                                const rem = Math.max(0, limit - used);
                                const pct = limit > 0 ? Math.min(100, Math.round((rem / limit) * 100)) : 0;
                                data = {
                                    success: true,
                                    tier: raw.tier || 'Gratuit',
                                    characterLimit: limit,
                                    characterCount: used,
                                    remainingCharacters: rem,
                                    percentRemaining: pct,
                                    resetDate: raw.next_character_count_reset_unix ? new Date(raw.next_character_count_reset_unix * 1000).toLocaleDateString('fr-FR') : 'Fin du mois'
                                };
                            }
                        } catch (err) {}
                    }

                    if (data && data.success) {
                        usageBox.style.display = 'flex';
                        const limit = data.characterLimit || 10000;
                        const remaining = (data.remainingCharacters !== undefined) ? data.remainingCharacters : Math.max(0, limit - (data.characterCount || 0));
                        const percent = (data.percentRemaining !== undefined) ? data.percentRemaining : ((data.remainingPercentage !== undefined) ? data.remainingPercentage : (limit > 0 ? Math.round((remaining / limit) * 100) : 0));
                        const tier = data.tier || 'Gratuit';
                        const resetDate = data.resetDate || (data.nextResetUnix ? new Date(data.nextResetUnix * 1000).toLocaleDateString('fr-FR') : 'Fin du mois');

                        const creditsBadge = document.getElementById('elevenlabsCreditsBadge');
                        if (creditsBadge) {
                            creditsBadge.textContent = `${remaining.toLocaleString('fr-FR')} / ${limit.toLocaleString('fr-FR')} car. (${percent}%)`;
                            creditsBadge.style.color = percent < 15 ? '#ff4444' : (percent < 40 ? '#ffbb00' : '#10b981');
                        }
                        const bar = document.getElementById('elevenlabsProgressBar');
                        if (bar) {
                            bar.style.width = `${percent}%`;
                            bar.style.background = percent < 15 ? '#ff4444' : (percent < 40 ? '#ffbb00' : '#10b981');
                        }
                        const tierText = document.getElementById('elevenlabsTierText');
                        if (tierText) {
                            tierText.textContent = `Formule : ${tier}`;
                        }
                        const resetText = document.getElementById('elevenlabsResetText');
                        if (resetText) {
                            resetText.textContent = `Renouvellement : ${resetDate}`;
                        }
                    }
                })();
            } catch (err) {
                console.error('Erreur chargement quotas ElevenLabs:', err);
            }
        }
        function onVoiceSelected() {
            const selectEl = document.getElementById('elevenlabsVoiceId');
            const btnPreview = document.getElementById('btnPreviewVoice');
            const vId = selectEl.value;
            const voice = voicesCache[vId];

            if (voice && voice.previewUrl) {
                btnPreview.style.display = 'inline-flex';
                btnPreview.dataset.previewUrl = voice.previewUrl;
            } else {
                btnPreview.style.display = 'none';
                btnPreview.dataset.previewUrl = '';
            }
        }

        function playVoicePreview() {
            const btnPreview = document.getElementById('btnPreviewVoice');
            const url = btnPreview.dataset.previewUrl;
            if (!url) return;

            if (previewAudioInstance) {
                previewAudioInstance.pause();
                previewAudioInstance = null;
            }

            previewAudioInstance = new Audio(url);
            btnPreview.innerHTML = `
                <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                <span>Lecture...</span>
            `;
            previewAudioInstance.play().catch(() => {});
            previewAudioInstance.onended = () => {
                btnPreview.innerHTML = `
                    <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>Écouter</span>
                `;
            };
        }

        function togglePasswordVisibility(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                input.type = 'password';
                btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        }

        function activateNav(link) {
            document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
        }

        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section.card');
            const atBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 70);

            if (atBottom) {
                // Dès que l'utilisateur atteint le bas de page, activer immédiatement la dernière section (Moteur de Rendu)
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#sec-render');
                });
                return;
            }

            // Seuil proportionnel dynamique à 35% de la hauteur écran
            const threshold = window.scrollY + (window.innerHeight * 0.35);
            let activeId = 'sec-general';
            sections.forEach(sec => {
                if (sec.offsetTop <= threshold) {
                    activeId = sec.getAttribute('id');
                }
            });

            if (activeId) {
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
                });
            }
        });

        async function saveSettings() {
            const ttsEngine = document.getElementById('prefTtsEngine') ? document.getElementById('prefTtsEngine').value : 'elevenlabs';
            localStorage.setItem(PREF_KEY_TTS_ENGINE, ttsEngine);
            const format = document.getElementById('prefFormat').value;
            const fps = document.getElementById('prefFps').value;
            const quality = document.getElementById('prefQuality').value;
            const template = document.getElementById('prefTemplate').value;
            const subtitleStyle = document.getElementById('prefSubtitleStyle') ? document.getElementById('prefSubtitleStyle').value : (localStorage.getItem(PREF_KEY_SUBTITLE_STYLE) || 'type-wordbyword');
            
            let geminiModel = document.getElementById('prefGeminiModel') ? document.getElementById('prefGeminiModel').value : 'gemini-3.5-flash-lite';
            if (geminiModel === 'custom') {
                const customVal = (document.getElementById('customGeminiModel')?.value || '').trim();
                if (customVal) geminiModel = customVal;
            }
            localStorage.setItem(PREF_KEY_GEMINI_MODEL, geminiModel);

            const googleKey = document.getElementById('apiKeyGoogle').value.trim();
            const elevenlabsKey = document.getElementById('apiKeyElevenlabs').value.trim();
            const elevenlabsVoice = document.getElementById('elevenlabsVoiceId').value.trim();
            const elevenlabsModel = document.getElementById('elevenlabsModelId').value.trim();
            const pixabayKey = document.getElementById('apiKeyPixabay').value.trim();
            const coverrKey = document.getElementById('apiKeyCoverr') ? document.getElementById('apiKeyCoverr').value.trim() : '';
            const brandfetchKey = document.getElementById('apiKeyBrandfetch').value.trim();
            const bgRemoveKey = document.getElementById('apiKeyBgRemove').value.trim();
            const sketchfabToken = document.getElementById('apiKeySketchfab') ? document.getElementById('apiKeySketchfab').value.trim() : '';
            const heygenKey = document.getElementById('apiKeyHeygen') ? document.getElementById('apiKeyHeygen').value.trim() : '';

            // LocalStorage
            localStorage.setItem(PREF_KEY_FORMAT, format);
            localStorage.setItem(PREF_KEY_FPS, fps);
            localStorage.setItem(PREF_KEY_QUALITY, quality);
            localStorage.setItem(PREF_KEY_TEMPLATE, template);
            localStorage.setItem(PREF_KEY_SUBTITLE_STYLE, subtitleStyle);
            localStorage.setItem(API_KEY_GOOGLE, googleKey);
            localStorage.setItem(API_KEY_ELEVENLABS, elevenlabsKey);
            localStorage.setItem(ELEVENLABS_VOICE_ID, elevenlabsVoice);
            localStorage.setItem(ELEVENLABS_MODEL_ID, elevenlabsModel);
            localStorage.setItem(API_KEY_PIXABAY, pixabayKey);
            localStorage.setItem(API_KEY_COVERR, coverrKey);
            localStorage.setItem(API_KEY_BRANDFETCH, brandfetchKey);
            localStorage.setItem(API_KEY_BG_REMOVE, bgRemoveKey);
            localStorage.setItem(API_KEY_SKETCHFAB, sketchfabToken);
            localStorage.setItem(API_KEY_HEYGEN, heygenKey);
            const heygenVoice = document.getElementById('heygenVoiceId') ? document.getElementById('heygenVoiceId').value : '';
            localStorage.setItem(HEYGEN_VOICE_ID, heygenVoice);

            // Synchronisation avec api_config.json via /api/settings
            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pref_format: format,
                        pref_fps: fps,
                        pref_quality: quality,
                        pref_template: template,
                        pref_subtitle_style: subtitleStyle,
                        tts_engine: ttsEngine,
                                                
                        groq_api_key: (document.getElementById('apiKeyGroq')?.value || '').trim(),
                        openrouter_api_key: (document.getElementById('apiKeyOpenrouter')?.value || '').trim(),
                        ai_kombo_order: currentKomboOrder,
                        ai_kombo_enabled: true,
                        gemini_model: geminiModel,
                        google_api_key: googleKey,
                        elevenlabs_api_key: elevenlabsKey,
                        elevenlabs_voice_id: elevenlabsVoice,
                        elevenlabs_model_id: elevenlabsModel,
                        pixabay_api_key: pixabayKey,
                        coverr_api_key: coverrKey,
                        brandfetch_api_key: brandfetchKey,
                        bg_remove_api_key: bgRemoveKey,
                    sketchfab_api_token: sketchfabToken,
                        heygen_api_key: heygenKey,
                        heygen_voice_id: heygenVoice
                    })
                });
            } catch (e) {
                console.warn('Erreur synchronisation /api/settings:', e);
            }

            // Si une clé ElevenLabs est renseignée, actualiser les voix
            if (elevenlabsKey) {
                loadVoices(elevenlabsKey, elevenlabsVoice);
            }
            if (heygenKey) {
                loadHeyGenVoicesFromUi(heygenVoice);
            }

            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2600);
        }

        async function testCoverrConnection() {
            const keyInput = document.getElementById('apiKeyCoverr');
            const statusEl = document.getElementById('coverrKeyStatus');
            const key = keyInput ? keyInput.value.trim() : '';

            if (!key) {
                if (statusEl) {
                    statusEl.style.display = 'flex';
                    statusEl.style.color = '#ef4444';
                    statusEl.innerHTML = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>Veuillez d'abord saisir une clé API Coverr.</span>`;
                }
                return;
            }

            if (statusEl) {
                statusEl.style.display = 'flex';
                statusEl.style.color = 'var(--text-secondary)';
                statusEl.innerHTML = `<span>⏳ Test de connexion à Coverr.co en cours...</span>`;
            }

            try {
                let data = null;
                const serverOrigin = (window.location.protocol === 'file:') ? 'http://localhost:3000' : '';
                
                try {
                    const res = await fetch(`${serverOrigin}/api/coverr/test`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key })
                    });
                    if (res.ok) {
                        data = await res.json();
                    }
                } catch (e) {
                    console.warn('Serveur local injoignable pour le test Coverr, bascule en direct:', e);
                }

                if (!data) {
                    const directRes = await fetch('https://api.coverr.co/videos?query=nature&page_size=1&urls=true', {
                        headers: {
                            'Authorization': `Bearer ${key}`
                        }
                    });
                    if (directRes.status === 401 || directRes.status === 403) {
                        data = { valid: false, error: 'Clé API Coverr invalide ou non autorisée (401/403).' };
                    } else if (!directRes.ok) {
                        const errTxt = await directRes.text();
                        data = { valid: false, error: `Erreur API Coverr (${directRes.status}): ${errTxt}` };
                    } else {
                        const directJson = await directRes.json();
                        data = { valid: true, totalAvailable: directJson.total || (directJson.hits ? directJson.hits.length : 0) };
                    }
                }

                if (data.valid) {
                    if (statusEl) {
                        statusEl.style.color = '#10b981';
                        statusEl.innerHTML = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Connexion réussie ! Clé Coverr.co valide (${data.totalAvailable || 0} vidéos accessibles).</span>`;
                    }
                    localStorage.setItem(API_KEY_COVERR, key);
                } else {
                    if (statusEl) {
                        statusEl.style.color = '#ef4444';
                        statusEl.innerHTML = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${data.error || 'Clé Coverr invalide.'}</span>`;
                    }
                }
            } catch (err) {
                if (statusEl) {
                    statusEl.style.color = '#ef4444';
                    statusEl.innerHTML = `<svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Erreur de test : ${err.message}</span>`;
                }
            }
        }

        async function testVoiceGeneration() {
            const btn = document.getElementById('btnTestVoice');
            const status = document.getElementById('testVoiceStatus');
            const audioPreview = document.getElementById('audioPreview');
            const text = document.getElementById('testVoiceText').value.trim();
            const apiKey = document.getElementById('apiKeyElevenlabs').value.trim();
            const voiceId = document.getElementById('elevenlabsVoiceId').value.trim();
            const modelId = document.getElementById('elevenlabsModelId').value.trim();

            if (!text) {
                status.innerHTML = `<span style="color:#ff4444;">Veuillez saisir un texte de test</span>`;
                return;
            }
            if (!apiKey) {
                status.innerHTML = `<span style="color:#ff4444;">Veuillez renseigner votre clé ElevenLabs ci-dessus d'abord.</span>`;
                return;
            }

            btn.disabled = true;
            status.innerHTML = `<span style="color:#ffbb00;">⏳ Synthèse en cours via ElevenLabs...</span>`;

            try {
                const response = await fetch('/api/tts/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        apiKey,
                        voiceId,
                        modelId,
                        filename: `test_voix_${Date.now()}.mp3`
                    })
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Erreur lors de la génération');
                }

                status.innerHTML = `<span style="color:#22c55e;">✅ Voix off générée avec succès (${Math.round(data.sizeBytes / 1024)} Ko) !</span>`;
                audioPreview.src = data.relativePath + '?t=' + Date.now();
                audioPreview.style.display = 'block';
                audioPreview.play().catch(() => {});
            } catch (err) {
                status.innerHTML = `<span style="color:#ff4444;">❌ ${err.message}</span>`;
            } finally {
                btn.disabled = false;
            }
        }
    // ── Test All API Keys ────────────────────────────────────────────────────
    async function testAllApiKeys() {
      const btn = document.getElementById('btnTestAllApis');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>⏳</span> Test en cours...'; }

      const tests = [
        {
          label: 'ElevenLabs',
          fieldId: 'apiKeyElevenlabs',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch('https://api.elevenlabs.io/v1/voices', {
              headers: { 'xi-api-key': key }
            });
            return r.ok;
          }
        },
        {
          label: 'HeyGen',
          fieldId: 'apiKeyHeygen',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch('https://api.heygen.com/v2/voices', {
              headers: { 'X-Api-Key': key }
            });
            return r.ok;
          }
        },
        {
          label: 'Google AI',
          fieldId: 'apiKeyGoogle',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
            );
            return r.ok;
          }
        },
        {
          label: 'Pixabay',
          fieldId: 'apiKeyPixabay',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch(
              `https://pixabay.com/api/?key=${key}&q=nature&per_page=3`
            );
            return r.ok;
          }
        },
        {
          label: 'Coverr',
          fieldId: 'apiKeyCoverr',
          test: async (key) => {
            if (!key) return null;
            // 1. Essai prioritaire via proxy local (contourne tout blocage CORS)
            try {
              const res = await fetch('/api/coverr/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.valid === true) return true;
              }
            } catch (e) {}

            // 2. Fallback direct avec le bon format Authorization: Bearer
            try {
              const direct = await fetch('https://api.coverr.co/videos?query=nature&page_size=1&urls=true', {
                headers: { 'Authorization': `Bearer ${key}` }
              });
              return direct.ok;
            } catch (e) {
              return false;
            }
          }
        },
        {
          label: 'Brandfetch',
          fieldId: 'apiKeyBrandfetch',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch('https://api.brandfetch.io/v2/brands/apple.com', {
              headers: { 'Authorization': `Bearer ${key}` }
            });
            return r.ok;
          }
        },
        {
          label: 'BgRemove (Clipdrop)',
          fieldId: 'apiKeyBgRemove',
          test: async (key) => {
            if (!key) return null;
            try {
              const fd = new FormData();
              const r = await fetch('https://clipdrop-api.co/remove-background/v1', {
                method: 'POST',
                headers: { 'x-api-key': key },
                body: fd
              });
              return r.status !== 401 && r.status !== 403;
            } catch { return false; }
          }
        },
        {
          label: 'Sketchfab',
          fieldId: 'apiKeySketchfab',
          test: async (key) => {
            if (!key) return null;
            const r = await fetch('https://api.sketchfab.com/v3/me', {
              headers: { 'Authorization': `Token ${key}` }
            });
            return r.ok;
          }
        }
      ];

      // Nettoyage des anciens badges de test
      document.querySelectorAll('.api-test-badge').forEach(el => el.remove());

      for (const t of tests) {
        const field = document.getElementById(t.fieldId);
        if (!field) continue;
        const key = field.value.trim();

        // Trouver le conteneur du titre du label pour placer l'icône DIRECTEMENT À CÔTÉ DU NOM
        const formRow = field.closest('.form-row');
        const labelTitle = formRow ? (formRow.querySelector('.form-label span') || formRow.querySelector('.form-label')) : field.parentElement;

        const badge = document.createElement('span');
        badge.className = 'api-test-badge';
        badge.style.cssText = 'margin-left: 8px; font-size: 15px; vertical-align: middle; transition: opacity 0.5s ease; display: inline-flex; align-items: center;';
        badge.textContent = '⏳';
        badge.title = `Test en cours pour ${t.label}...`;
        
        if (labelTitle) {
          labelTitle.appendChild(badge);
        } else {
          field.parentElement.appendChild(badge);
        }

        let result = null;
        try { result = await t.test(key); } catch { result = false; }

        if (result === null) {
          badge.textContent = '⬜';
          badge.title = `${t.label} : clé vide`;
        } else if (result === true) {
          badge.textContent = '✅';
          badge.title = `${t.label} : clé valide et fonctionnelle !`;
          badge.style.color = '#22c55e';
          // Disparaît au bout de 4 secondes
          setTimeout(() => {
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 500);
          }, 4000);
        } else {
          badge.textContent = '❌';
          badge.title = `${t.label} : échec du test ou clé invalide`;
          badge.style.color = '#ef4444';
        }

        await new Promise(r => setTimeout(r, 250));
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🔑</span> Tester toutes les clés API';
      }
    }
