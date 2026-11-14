# 🔒 RÈGLES DE SÉCURITÉ ABSOLUES & AUDIT DU PACKAGING (AUTOFRAME STUDIO)

## ⚠️ RÈGLE FONDAMENTALE : ZÉRO SECRET, ZÉRO DONNÉE PERSONNELLE DANS LES BUILDS

Aucune version distribuée (installeur Windows `.exe`, archive `app.asar`, dossier `dist/`) ne doit JAMAIS contenir les données personnelles, clients, vidéos, rendus ou clés API privées du développeur.

---

### 1. SÉPARATION TOTALE DU CODE ET DES DONNÉES UTILISATEUR

1. **L'application distribuée est 100 % vierge** :
   - Tout utilisateur qui installe AutoFrame démarre avec une application vide.
   - Les dossiers `Clients/`, `03_Chaines/`, `04_Videos/`, `08_Rendus/` créés par l'utilisateur final sont stockés dans son dossier personnel Windows :
     `%USERPROFILE%\Documents\AutoFrame\` (ou `%APPDATA%\AutoFrame\Data\`).
   - L'archive de l'application (`app.asar`) ne contient QUE le code d'exécution et les assets publics de l'interface.

2. **Résolution dynamique des clés API (`api_config.json`)** :
   - `api_config.json` est résolu via `getResolvedConfigPath()`.
   - Sur l'application installée, il pointe dans le dossier utilisateur Windows.
   - Si l'utilisateur n'a pas configuré ses clés dans la page Paramètres, l'application ne fait aucun appel payant et l'invite poliment à entrer ses propres clés.
   - **INTERDICTION FORMELLE** d'embarquer les clés API personnelles du développeur dans l'application compilée.

---

### 2. EXCLUSIONS OBLIGATOIRES ET INVIOLABLES DANS `package.json`

Le bloc `build.files` de `package.json` DOIT contenir impérativement toutes ces règles d'exclusion :
```json
"files": [
  "**/*",
  "!Clients/**/*",
  "!03_Chaines/**/*",
  "!04_Videos/**/*",
  "!08_Rendus/**/*",
  "!Docs/**/*",
  "!07_Scripts/api_config.json",
  "!07_Scripts/api_config*.json",
  "!api_config.json",
  "!user_settings.json",
  "!.env*",
  "!dist/**/*",
  "!.git/**/*",
  "!.agents/**/*",
  "!scratch/**/*"
]
```

---

### 3. BARRIÈRE TECHNIQUE AUTOMATIQUE (PRE-BUILD HOOK)

Avant toute commande de packaging (`npm run dist` ou `electron-builder`), le script d'audit de sécurité s'exécute automatiquement :
```powershell
node 07_Scripts/audit-build-security.cjs
```
Si l'une des conditions suivantes est détectée, **la compilation est avortée immédiatement** avec un code d'erreur `1` :
1. Une règle d'exclusion obligatoire manque dans `package.json`.
2. Un fichier de configuration de clés API est inclus dans les fichiers du build.
3. Une clé API en clair (pattern Google `AIza...`, ElevenLabs, etc.) est détectée dans un fichier source embarqué.
4. L'isolation des données utilisateur (`process.env.VIBE_USER_DATA`) est désactivée.

---

### 4. VÉRIFICATION AVANT TOUT PUSH SUR GITHUB

- `git status` et `git diff` doivent être audités avant tout commit.
- `.gitignore` doit continuer de bloquer `api_config.json`, `.env`, `dist/`, `Clients/**`, `03_Chaines/*`, `04_Videos/*`, `08_Rendus/*`, et `Docs/*`.
