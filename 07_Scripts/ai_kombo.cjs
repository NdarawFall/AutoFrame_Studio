/**
 * AutoFrame Studio — Module Kombo IA & Détection d'Agents Locaux
 * Supporte :
 *  1. Google Gemini API (IPv4 forcé, timeout, candidate models)
 *  2. Groq Cloud API (Inférence ultra-rapide, Llama 3.3, Mixtral)
 *  3. OpenRouter API (Modèles gratuits Nvidia Nemotron, Meta Llama, etc.)
 *  4. Claude Code CLI local (`claude -p "..."`)
 *  5. Antigravity CLI local (`agy -p "..."`)
 * 
 * Pipeline Kombo : Exécute les modèles dans l'ordre de priorité configuré par l'utilisateur.
 * Si le modèle 1 échoue (quota 429, panne, timeout), le modèle 2 prend le relais automatiquement.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync, exec, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const USER_DATA_DIR = process.env.VIBE_USER_DATA || ROOT_DIR;

function getResolvedConfigPath() {
    const userConfig = path.join(USER_DATA_DIR, 'api_config.json');
    if (fs.existsSync(userConfig)) return userConfig;
    const scriptsConfig = path.join(ROOT_DIR, '07_Scripts', 'api_config.json');
    return scriptsConfig;
}

function loadApiConfig() {
    try {
        const p = getResolvedConfigPath();
        if (fs.existsSync(p)) {
            return JSON.parse(fs.readFileSync(p, 'utf8'));
        }
    } catch (e) {
        console.warn('[AI Kombo] Erreur lecture api_config.json:', e.message);
    }
    return {};
}

// -----------------------------------------------------------------------------
// 1. DÉTECTEUR D'AGENTS IA LOCAUX (Claude Code CLI & Antigravity)
// -----------------------------------------------------------------------------
function findClaudeBinary() {
    const candidates = [
        path.join(process.env.APPDATA || '', 'npm', 'claude.cmd'),
        path.join(process.env.APPDATA || '', 'npm', 'claude'),
        path.join(process.env.LOCALAPPDATA || '', 'npm', 'claude.cmd'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'claude', 'claude.exe')
    ];
    for (const c of candidates) {
        if (c && fs.existsSync(c)) return c;
    }
    try {
        const out = execSync('where.exe claude', { windowsHide: true, timeout: 1500, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        const firstLine = out.split(/\r?\n/)[0]?.trim();
        if (firstLine && fs.existsSync(firstLine)) return firstLine;
    } catch (e) {}
    return 'claude';
}

function findAgyBinary() {
    const candidates = [
        path.join(process.env.LOCALAPPDATA || '', 'agy', 'bin', 'agy.EXE'),
        path.join(process.env.LOCALAPPDATA || '', 'agy', 'bin', 'agy.exe'),
        path.join(process.env.APPDATA || '', 'agy', 'bin', 'agy.EXE'),
        path.join(process.env.APPDATA || '', 'agy', 'bin', 'agy.exe')
    ];
    for (const c of candidates) {
        if (c && fs.existsSync(c)) return c;
    }
    try {
        const out = execSync('where.exe agy', { windowsHide: true, timeout: 1500, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        const firstLine = out.split(/\r?\n/)[0]?.trim();
        if (firstLine && fs.existsSync(firstLine)) return firstLine;
    } catch (e) {}
    return 'agy';
}

let cachedDetection = null;
let lastDetectionTime = 0;

function detectLocalAiAgents(forceRefresh = false) {
    if (!forceRefresh && cachedDetection && (Date.now() - lastDetectionTime < 30000)) {
        return cachedDetection;
    }

    const results = {
        claude: { installed: false, version: '', command: 'claude', path: '' },
        agy: { installed: false, version: '', command: 'agy', path: '' }
    };

    // 1. Détection Claude Code CLI
    const claudeBin = findClaudeBinary();
    const claudeExists = fs.existsSync(claudeBin) || claudeBin === 'claude';
    if (claudeExists) {
        results.claude.installed = true;
        results.claude.path = claudeBin;
        results.claude.command = claudeBin;
        try {
            const v = execSync(`"${claudeBin}" --version`, {
                timeout: 3000,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'ignore']
            }).toString().trim();
            results.claude.version = v || 'Claude Code CLI';
        } catch (e) {
            results.claude.version = 'Claude Code CLI (Détecté)';
        }
    }

    // 2. Détection Antigravity CLI
    const agyBin = findAgyBinary();
    const agyExists = fs.existsSync(agyBin) || agyBin === 'agy';
    if (agyExists) {
        results.agy.installed = true;
        results.agy.path = agyBin;
        results.agy.command = agyBin;
        try {
            const v = execSync(`"${agyBin}" --version`, {
                timeout: 3000,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'ignore']
            }).toString().trim();
            results.agy.version = v ? `Antigravity ${v}` : 'Antigravity CLI';
        } catch (e) {
            results.agy.version = 'Antigravity CLI (Détecté)';
        }
    }

    cachedDetection = results;
    lastDetectionTime = Date.now();
    return results;
}

// -----------------------------------------------------------------------------
// 2. EXTRACTION ROBUSTE DE JSON DANS LES RÉPONSES IA
// -----------------------------------------------------------------------------
function cleanAndParseJson(text) {
    if (!text || typeof text !== 'string') {
        throw new Error("Réponse textuelle vide de l'IA");
    }

    // Nettoyer les balises Markdown éventuelles ```json ... ```
    let candidate = text.trim();
    const mdMatch = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (mdMatch) {
        candidate = mdMatch[1].trim();
    }

    try {
        return JSON.parse(candidate);
    } catch (e1) {
        // Trouver le premier { ou [ et le dernier } ou ]
        const firstBrace = candidate.indexOf('{');
        const lastBrace = candidate.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
                return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
            } catch (e2) {}
        }

        const firstBracket = candidate.indexOf('[');
        const lastBracket = candidate.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            try {
                return JSON.parse(candidate.slice(firstBracket, lastBracket + 1));
            } catch (e3) {}
        }

        throw new Error(`Échec parsing JSON IA: ${e1.message}. Extrait: ${candidate.slice(0, 150)}...`);
    }
}

// -----------------------------------------------------------------------------
// 3. FOURNISSEURS INDIVIDUELS
// -----------------------------------------------------------------------------

// 3a. Google Gemini API
async function callGeminiProvider(systemPrompt, userPrompt, temperature = 0.7, preferredModel = '') {
    const config = loadApiConfig();
    const apiKey = (config.google_api_key || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error("Clé API Google Gemini manquante dans api_config.json");
    }

    const candidateModels = [
        ...(preferredModel ? [preferredModel] : []),
        ...(config.gemini_model ? [config.gemini_model] : []),
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-3.5-flash-lite',
        'gemini-flash-latest'
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    let lastError = null;

    for (const model of candidateModels) {
        try {
            const postData = JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: temperature
                }
            });

            const result = await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    method: 'POST',
                    family: 4, // Force IPv4
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    },
                    timeout: 25000
                };

                const req = https.request(options, (res) => {
                    let body = '';
                    res.on('data', chunk => { body += chunk; });
                    res.on('end', () => {
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            return reject(new Error(`Gemini HTTP ${res.statusCode} (${model}): ${body.slice(0, 200)}`));
                        }
                        try {
                            const data = JSON.parse(body);
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (!text) return reject(new Error(`Réponse Gemini vide (${model})`));
                            resolve(cleanAndParseJson(text));
                        } catch (e) {
                            reject(e);
                        }
                    });
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error(`Timeout (25s) Gemini (${model})`));
                });
                req.on('error', reject);
                req.write(postData);
                req.end();
            });

            return result;
        } catch (err) {
            lastError = err;
            console.warn(`[Gemini Fallback] Modèle ${model} échoué: ${err.message}`);
        }
    }

    throw lastError || new Error("Tous les modèles Gemini ont échoué");
}

// 3b. Groq Cloud API
async function callGroqProvider(systemPrompt, userPrompt, temperature = 0.7, preferredModel = '', apiKeyOverride = '') {
    const config = loadApiConfig();
    let apiKey = (apiKeyOverride || config.groq_api_key || process.env.GROQ_API_KEY || '').trim();
    const secondGsk = apiKey.indexOf('gsk_', 4);
    if (secondGsk !== -1) {
        apiKey = apiKey.slice(0, secondGsk).trim();
    }
    if (!apiKey) {
        throw new Error("Clé API Groq manquante dans api_config.json");
    }

    const model = preferredModel || config.groq_model || 'llama-3.3-70b-versatile';

    const postData = JSON.stringify({
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: temperature,
        max_tokens: 4096
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            family: 4,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 25000
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error(`Groq HTTP ${res.statusCode} (${model}): ${body.slice(0, 200)}`));
                }
                try {
                    const data = JSON.parse(body);
                    const content = data.choices?.[0]?.message?.content;
                    if (!content) return reject(new Error(`Réponse Groq vide (${model})`));
                    resolve(cleanAndParseJson(content));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Timeout (25s) Groq (${model})`));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 3c. OpenRouter API
async function callOpenRouterProvider(systemPrompt, userPrompt, temperature = 0.7, preferredModel = '') {
    const config = loadApiConfig();
    const apiKey = (config.openrouter_api_key || process.env.OPENROUTER_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error("Clé API OpenRouter manquante dans api_config.json");
    }

    const model = preferredModel || config.openrouter_model || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

    const postData = JSON.stringify({
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: temperature,
        max_tokens: 4096
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            family: 4,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AutoFrame Studio',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error(`OpenRouter HTTP ${res.statusCode} (${model}): ${body.slice(0, 200)}`));
                }
                try {
                    const data = JSON.parse(body);
                    const content = data.choices?.[0]?.message?.content;
                    if (!content) return reject(new Error(`Réponse OpenRouter vide (${model})`));
                    resolve(cleanAndParseJson(content));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Timeout (30s) OpenRouter (${model})`));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 3d. Claude Code CLI local
async function callClaudeCliProvider(systemPrompt, userPrompt) {
    const claudeBin = findClaudeBinary();
    const agents = detectLocalAiAgents();
    if (!agents.claude.installed && !fs.existsSync(claudeBin)) {
        throw new Error("Claude Code CLI n'est pas installé sur cet ordinateur");
    }

    const combinedPrompt = `${systemPrompt}\n\nIMPORTANT: Tu dois STRICTEMENT retourner un JSON valide sans aucun formatage Markdown ni texte conversationnel autour.\n\nDemande utilisateur:\n${userPrompt}`;

    return new Promise((resolve, reject) => {
        let isDone = false;
        const finish = (err, res) => {
            if (isDone) return;
            isDone = true;
            clearTimeout(timer);
            try { child.kill(); } catch (e) {}
            if (err) reject(err);
            else resolve(res);
        };

        const cleanEnv = { ...process.env };
        if (cleanEnv.ANTHROPIC_BASE_URL && cleanEnv.ANTHROPIC_BASE_URL.includes('agentrouter.org')) {
            delete cleanEnv.ANTHROPIC_BASE_URL;
            delete cleanEnv.ANTHROPIC_API_KEY;
            delete cleanEnv.ANTHROPIC_MODEL;
        }

        const child = spawn('cmd.exe', ['/c', claudeBin, '--bare', '--tools', '""', '-p', combinedPrompt], {
            env: cleanEnv,
            windowsHide: true,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Fermer immédiatement stdin pour éviter que Claude n'attende 3s
        try { child.stdin.end(); } catch (e) {}

        let stdout = '';
        let stderr = '';

        const checkStreamErrors = (chunkStr) => {
            if (chunkStr.includes('unauthorized client detected') || chunkStr.includes('unauthorized_client_error') || chunkStr.includes('UNAUTHENTICATED')) {
                finish(new Error("Passerelle agentrouter.org : Client non autorisé (401). Votre clé proxy est rejetée."));
            }
        };

        child.stdout.on('data', d => {
            const str = d.toString();
            stdout += str;
            checkStreamErrors(str);
        });
        child.stderr.on('data', d => {
            const str = d.toString();
            stderr += str;
            checkStreamErrors(str);
        });

        const timer = setTimeout(() => {
            finish(new Error("Timeout (35s) dépassé pour Claude Code CLI."));
        }, 35000);

        child.on('close', code => {
            const combined = (stdout || '') + '\n' + (stderr || '');
            if (combined.includes('unauthorized') || combined.includes('401') || combined.includes('UNAUTHENTICATED')) {
                return finish(new Error("Claude Code CLI: Session expirée ou client non autorisé (401 sur agentrouter.org)."));
            }
            if (code !== 0 && !stdout) {
                return finish(new Error(`Claude Code CLI code ${code}: ${(stderr || 'Erreur exécution').slice(0, 200)}`));
            }
            try {
                const parsed = cleanAndParseJson(stdout || stderr);
                finish(null, parsed);
            } catch (pe) {
                finish(new Error(`Claude Code CLI n'a pas renvoyé de JSON valide: ${pe.message}. Sortie: ${(stdout || stderr).slice(0, 150)}`));
            }
        });

        child.on('error', err => {
            finish(new Error(`Erreur lancement Claude Code CLI (${claudeBin}): ${err.message}`));
        });
    });
}

// 3e. Antigravity CLI local
async function callAgyCliProvider(systemPrompt, userPrompt) {
    const agyBin = findAgyBinary();
    const agents = detectLocalAiAgents();
    if (!agents.agy.installed && !fs.existsSync(agyBin)) {
        throw new Error("Antigravity CLI (agy) n'est pas installé sur cet ordinateur");
    }

    const combinedPrompt = `${systemPrompt}\n\nIMPORTANT: Tu dois STRICTEMENT retourner un JSON valide sans aucun formatage Markdown ni texte conversationnel autour.\n\nDemande utilisateur:\n${userPrompt}`;

    return new Promise((resolve, reject) => {
        const args = ['--disable-slash-commands', '--effort', 'low', '-p', combinedPrompt];
        const child = spawn(agyBin, args, {
            shell: false,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', d => { stdout += d.toString(); });
        child.stderr.on('data', d => { stderr += d.toString(); });

        const timer = setTimeout(() => {
            child.kill();
            reject(new Error("Timeout (45s) dépassé pour Antigravity CLI"));
        }, 45000);

        child.on('close', code => {
            clearTimeout(timer);
            if (code !== 0 && !stdout) {
                return reject(new Error(`Antigravity CLI code ${code}: ${(stderr || 'Erreur exécution').slice(0, 200)}`));
            }
            try {
                const parsed = cleanAndParseJson(stdout || stderr);
                resolve(parsed);
            } catch (pe) {
                reject(new Error(`Antigravity CLI n'a pas renvoyé de JSON valide: ${pe.message}. Sortie: ${(stdout || stderr).slice(0, 150)}`));
            }
        });

        child.on('error', err => {
            clearTimeout(timer);
            reject(new Error(`Erreur lancement Antigravity CLI (${agyBin}): ${err.message}`));
        });
    });
}

// -----------------------------------------------------------------------------
// 4. MOTEUR DU KOMBO IA (ORCHESTRATION & BASCULE AUTOMATIQUE)
// -----------------------------------------------------------------------------
async function callAiKombo(systemPrompt, userPrompt, temperature = 0.7, preferredAi = null) {
    const config = loadApiConfig();

    // 0. Si une IA spécifique est demandée par l'utilisateur (ex: 'gemini', 'claude_cli', 'agy_cli')
    if (preferredAi && preferredAi !== 'kombo' && preferredAi !== 'auto') {
        const pId = String(preferredAi).toLowerCase().trim();
        console.log(`[IA Spécifique] Exécution directe demandée pour : ${pId}`);
        try {
            if (pId === 'gemini') {
                return await callGeminiProvider(systemPrompt, userPrompt, temperature, config.gemini_model || 'gemini-3.5-flash-lite');
            } else if (pId === 'claude_cli' || pId === 'claude') {
                return await callClaudeCliProvider(systemPrompt, userPrompt);
            } else if (pId === 'agy_cli' || pId === 'antigravity') {
                return await callAgyCliProvider(systemPrompt, userPrompt);
            } else if (pId === 'groq') {
                return await callGroqProvider(systemPrompt, userPrompt, temperature, config.groq_model || 'llama-3.3-70b-versatile');
            } else if (pId === 'openrouter') {
                return await callOpenRouterProvider(systemPrompt, userPrompt, temperature, config.openrouter_model || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free');
            }
        } catch (specErr) {
            console.warn(`[IA Spécifique] Échec direct de ${pId} (${specErr.message}). Bascule automatique sur le Kombo IA de secours...`);
        }
    }

    // 1. Déterminer l'ordre des modèles du Kombo
    // Par défaut de base : Gemini est sélectionné en priorité 1, avec fallback sur les autres
    let komboList = [];

    if (Array.isArray(config.ai_kombo_order) && config.ai_kombo_order.length > 0) {
        // L'utilisateur a personnalisé son kombo
        komboList = config.ai_kombo_order.filter(item => item && item.enabled !== false);
    }

    // Si aucune liste configurée, créer le Kombo par défaut intelligent
    if (komboList.length === 0) {
        komboList = [
            { id: 'gemini', name: 'Google Gemini', model: config.gemini_model || 'gemini-2.5-flash', enabled: true },
            { id: 'groq', name: 'Groq Cloud AI', model: config.groq_model || 'llama-3.3-70b-versatile', enabled: Boolean(config.groq_api_key) },
            { id: 'claude_cli', name: 'Claude Code CLI (Local)', model: 'local', enabled: true },
            { id: 'openrouter', name: 'OpenRouter (Modèles gratuits / Nvidia)', model: config.openrouter_model || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', enabled: Boolean(config.openrouter_api_key) },
            { id: 'agy_cli', name: 'Antigravity CLI (Local)', model: 'local', enabled: true }
        ].filter(item => item.enabled);
    }

    const errors = [];

    for (let i = 0; i < komboList.length; i++) {
        const provider = komboList[i];
        const providerId = provider.id;
        const providerName = provider.name || providerId;
        const modelName = provider.model || '';

        console.log(`[Kombo IA] Étape ${i + 1}/${komboList.length} : Tentative avec ${providerName} (${modelName})...`);

        try {
            let result = null;
            if (providerId === 'gemini') {
                result = await callGeminiProvider(systemPrompt, userPrompt, temperature, modelName);
            } else if (providerId === 'groq') {
                result = await callGroqProvider(systemPrompt, userPrompt, temperature, modelName);
            } else if (providerId === 'openrouter') {
                result = await callOpenRouterProvider(systemPrompt, userPrompt, temperature, modelName);
            } else if (providerId === 'claude_cli') {
                result = await callClaudeCliProvider(systemPrompt, userPrompt);
            } else if (providerId === 'agy_cli') {
                result = await callAgyCliProvider(systemPrompt, userPrompt);
            } else {
                throw new Error(`Fournisseur IA inconnu: ${providerId}`);
            }

            console.log(`[Kombo IA] SUCCÈS avec ${providerName} !`);
            return result;
        } catch (err) {
            console.warn(`[Kombo IA Fallback] Échec de ${providerName} (${err.message}).`);
            errors.push({ provider: providerName, error: err.message });
            // Continue la boucle vers le modèle de secours suivant
        }
    }

    const summaryErrors = errors.map(e => `• ${e.provider}: ${e.error}`).join('\n');
    throw new Error(`Tous les modèles de votre Kombo IA ont échoué :\n${summaryErrors}`);
}

// -----------------------------------------------------------------------------
// 5. TESTEUR DE PROVIDER EN DIRECT
// -----------------------------------------------------------------------------
async function testSingleProvider(providerId, customConfig = {}) {
    const systemPrompt = "Tu es un assistant IA de test pour AutoFrame Studio. Réponds UNIQUEMENT avec un objet JSON valide.";
    const userPrompt = "Réponds avec exactement ce format: {\"status\": \"ok\", \"message\": \"Connexion réussie\", \"provider\": \"" + providerId + "\"}";

    const t0 = Date.now();
    try {
        let res = null;
        if (providerId === 'gemini') {
            res = await callGeminiProvider(systemPrompt, userPrompt, 0.2, customConfig.model);
        } else if (providerId === 'groq') {
            res = await callGroqProvider(systemPrompt, userPrompt, 0.2, customConfig.model, customConfig.apiKey);
        } else if (providerId === 'openrouter') {
            res = await callOpenRouterProvider(systemPrompt, userPrompt, 0.2, customConfig.model);
        } else if (providerId === 'claude_cli') {
            res = await callClaudeCliProvider(systemPrompt, userPrompt);
        } else if (providerId === 'agy_cli') {
            res = await callAgyCliProvider(systemPrompt, userPrompt);
        } else {
            throw new Error(`Provider inconnu: ${providerId}`);
        }
        const latency = Date.now() - t0;
        return { success: true, latencyMs: latency, provider: providerId, data: res };
    } catch (e) {
        const latency = Date.now() - t0;
        return { success: false, latencyMs: latency, provider: providerId, error: e.message };
    }
}

module.exports = {
    detectLocalAiAgents,
    callAiKombo,
    testSingleProvider,
    callGeminiProvider,
    callGroqProvider,
    callOpenRouterProvider,
    callClaudeCliProvider,
    callAgyCliProvider
};
