# Règle d'Or : Politique Stricte sur les Logos de Marques

> **RÈGLE CRITIQUE & MÉMOIRE PERMANENTE DE L'AGENT**

## 1. Interdiction Absolue de Dessiner un Logo
- **L'IA ne doit JAMAIS dessiner un logo de toute pièce en code** (aucun bricolage SVG approximatif, aucune imitation dessinée à la main ou inventée avec des `<path>`, `<polygon>` ou formes géométriques).
- Un logo approximatif ou « fait maison » nuit gravement à la crédibilité visuelle et à la qualité professionnelle de la vidéo.

## 2. Obligation de Téléchargement de l'Asset Officiel
- Tout logo nécessaire dans une vidéo (entreprises, marques, réseaux sociaux, plateformes, clubs) **doit obligatoirement être téléchargé** sous sa forme officielle originale (SVG vectoriel officiel ou PNG transparent haute définition).
- Outils et sources prioritaires :
  1. **Script local** : `node 07_Scripts/brandfetch.cjs <domaine>` (ex: `nvidia.com`, `apple.com`, `tiktok.com`) qui sauvegarde directement les SVG/PNG officiels dans `01_Assets/Logos/`.
  2. **Sources officielles vectorielles** : SimpleIcons, Wikimedia Commons (logos SVG officiels), ou API Brandfetch / Iconify.

## 3. Règle de Blocage et Signalement à l'Utilisateur
- Si un logo est introuvable, privé, spécifique ou ne peut pas être téléchargé automatiquement :
  - **INTERDICTION FORMELLE de bricoler une alternative dessinée.**
  - **L'IA doit obligatoirement s'arrêter et le signaler à l'utilisateur :**
    > *"Je ne parviens pas à télécharger le logo officiel de [Nom de la Marque]. Conformément à la règle, je ne le dessine pas. Peux-tu déposer le fichier officiel (SVG ou PNG transparent) dans `01_Assets/Logos/` pour que je l'intègre ?"*
  - C'est l'utilisateur qui fournit le logo en cas d'impossibilité de téléchargement.
