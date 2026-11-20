/**
 * 07_Scripts/build_ww2_documentary.cjs
 * Générateur du Master Documentaire Vidéo Vox "La Seconde Guerre Mondiale" (11 minutes)
 * 
 * Conception Vidéo Haute Fidélité (Conformité Joseph_Edit_Skills Règles 15, 16 & 17) :
 * - Découpage en 72 Séquences Rythmées (durée max 3 à 6s par plan, fin des plans morts qui s'éternisent)
 * - Concordance absolue mot-à-mot (quand on parle d'Hitler on montre Hitler, de Pétain on montre Pétain,
 *   des 8 millions on montre le compteur qui coupe dès la fin de la phrase)
 * - Effet Pendule & Flottement Continu (transform-origin: 50% 0%, oscillation cloche -2° / +2° seek-safe)
 * - Fond papier vélin chaud ultra-lumineux (#faf8f5 à #f4f0e6) avec grain papier subtil
 * - Contraste fort : Encre noir profond (#111110), surligneur jaune Vox (#ffe600), rouge tampon (#dc2626)
 * - Bannissement des drapeaux et widgets décoratifs parasites (zéro remplissage automatique)
 * - Audio MP3 léger (13.1 Mo) zéro-saccade (Règle 26) normalisé à -14 LUFS EBU R128
 * - Timeline GSAP déterministe (572.6s) avec moteur renderAt(t) instantané
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(ROOT_DIR, '04_Videos');
const TOTAL_DURATION = 572.6;

// 72 Séquences courtes et dynamiques minutieusement synchronisées sur la voix off
const SHOTS = [
    // =========================================================================
    // --- CHAPITRE 1 : L'ENGRENAGE EUROPÉEN & LA BLITZKRIEG (0.5s -> 55.5s) ---
    // =========================================================================
    {
        id: "1_1", start: 0.0, end: 4.5,
        format: "vox_solo_photo",
        tag: "1ER SEPTEMBRE 1939",
        title: "La Frontière Polonaise Franchie",
        image: "../01_Assets/Images/ww2/01_poland_1939.jpg",
        caption: "Soldats allemands brisant la barrière frontière polonaise à Danzig"
    },
    {
        id: "1_2", start: 4.5, end: 9.0,
        format: "vox_impact_text",
        tag: "1939 • L'ENGRENAGE",
        mainText: "L'ENGRENAGE",
        highlightWord: "CATACLYSME DU XXe SIÈCLE",
        author: "Plus de cinquante millions de destins sur le point de basculer"
    },
    {
        id: "1_3", start: 9.0, end: 13.0,
        format: "vox_tactical_map",
        tag: "SEPTEMBRE 1939 • EN 4 SEMAINES",
        title: "Le Partage Territorial de la Pologne",
        lead: "Prise en tenaille entre la Wehrmacht à l'Ouest et l'Armée rouge à l'Est, la Pologne est rayée de la carte.",
        mapType: "poland_split"
    },
    {
        id: "1_4", start: 13.0, end: 16.7,
        format: "vox_archival_paper",
        tag: "23 AOÛT 1939 • MOSCOU",
        title: "Le Pacte Molotov-Ribbentrop",
        lead: "Traité de non-agression germano-soviétique signé entre Berlin et Moscou.",
        highlight: "Clause secrète : Dépeçage territorial et partage immédiat de la Pologne",
        stamp: "TOP SECRET",
        stampColor: "red"
    },
    {
        id: "1_5", start: 16.7, end: 20.4,
        format: "vox_impact_text",
        tag: "3 SEPTEMBRE 1939",
        mainText: "DÉCLARATION DE GUERRE",
        highlightWord: "DÉCLARENT LA GUERRE",
        author: "Fidélité au traité d'assistance mutuelle envers la Pologne"
    },
    {
        id: "1_6", start: 20.4, end: 26.2,
        format: "vox_pure_video",
        tag: "HIVER 1939 — 1940",
        title: "La Drôle de Guerre & la Mobilisation",
        videoSrc: "../01_Assets/Videos/ww2/ww2_soldiers_infantry.mp4",
        caption: "Colonnes d'infanterie et mobilisation générale sur le front ouest"
    },
    {
        id: "1_7", start: 26.2, end: 31.3,
        format: "vox_impact_text",
        tag: "STRATÉGIE MAGINOT",
        mainText: "LIGNE MAGINOT",
        highlightWord: "ILLUSIONS",
        author: "L'état-major français reste persuadé que le conflit sera une guerre d'usure identique à 1914"
    },
    {
        id: "1_8", start: 31.3, end: 36.8,
        format: "vox_pure_video",
        tag: "10 MAI 1940 • L'OFFENSIVE",
        title: "La Blitzkrieg des Panzers & Stukas",
        videoSrc: "../01_Assets/Videos/ww2/ww2_planes_bombers.mp4",
        caption: "Escadrilles de bombardiers et choc blindé à travers les Ardennes"
    },
    {
        id: "1_9", start: 36.8, end: 41.5,
        format: "vox_monumental_stat",
        tag: "DÉBÂCLE ÉCLAIR",
        statNum: 6,
        statLabel: "Semaines pour anéantir l'armée française",
        statScale: "Réputée la première puissance militaire du continent européen, l'armée est disloquée en un mois et demi."
    },
    {
        id: "1_10", start: 41.5, end: 46.1,
        format: "vox_monumental_stat",
        tag: "L'EXODE CIVIL",
        statNum: 8000000,
        statLabel: "Réfugiés civils jetés sur les routes sous les mitraillages",
        statScale: "Des familles entières fuyant dans la panique la plus absolue vers le sud de la Loire."
    },
    {
        id: "1_11", start: 46.1, end: 50.0,
        format: "vox_solo_photo",
        tag: "22 JUIN 1940 • RETHONDES",
        title: "Hitler & l'Armistice dans le Wagon de Rethondes",
        image: "../01_Assets/Images/ww2/03_hitler_paris.jpg",
        caption: "Adolf Hitler sur l'esplanade du Trocadéro • Paris occupé, clairière de Rethondes"
    },
    {
        id: "1_12", start: 50.0, end: 57.5,
        format: "vox_archival_paper",
        tag: "FIN DE LA IIIe RÉPUBLIQUE",
        title: "L'Armistice du Maréchal Pétain",
        lead: "Capitulation militaire officielle et sabordage des institutions républicaines au profit de l'État Français.",
        highlight: "Le maréchal Pétain engage officiellement la France dans la collaboration avec le Reich",
        stamp: "ARMISTICE",
        stampColor: "red"
    },

    // ==================================================================================
    // --- CHAPITRE 2 : VICHY, LA COLLABORATION & LA RÉSISTANCE (57.5s -> 113.7s) ---
    // ==================================================================================
    {
        id: "2_1", start: 57.5, end: 61.5,
        format: "vox_paper_cutout",
        tag: "18 JUIN 1940 • LONDRES",
        title: "Général de Gaulle",
        image: "../01_Assets/Images/ww2/05_de_gaulle_1940.jpg",
        caption: "Le Général de Gaulle lance l'Appel à la BBC • Naissance de la France Libre"
    },
    {
        id: "2_2", start: 61.5, end: 67.0,
        format: "vox_impact_text",
        tag: "APPEL DU 18 JUIN",
        mainText: "« LA FRANCE A PERDU UNE BATAILLE ! MAIS LA FRANCE N'A PAS PERDU LA GUERRE ! »",
        highlightWord: "N'A PAS PERDU LA GUERRE",
        author: "Général Charles de Gaulle • Acte de naissance de la France Libre"
    },
    {
        id: "2_3", start: 67.0, end: 72.5,
        format: "vox_archival_paper",
        tag: "RÉGIME DE VICHY • ÉTÉ 1940",
        title: "L'Ordre Nouveau de Pétain",
        lead: "Régime autoritaire fondé sur les décombres de la défaite sous la devise Travail, Famille, Patrie.",
        highlight: "Abolition de la devise républicaine et mise en place d'une dictature corporatiste",
        stamp: "ÉTAT FRANÇAIS",
        stampColor: "red"
    },
    {
        id: "2_4", start: 72.5, end: 78.5,
        format: "vox_archival_paper",
        tag: "3 OCTOBRE 1940 • ANTISÉMITISME D'ÉTAT",
        title: "Promulgation du Statut des Juifs",
        lead: "De sa propre initiative et sans demande formelle de Berlin, Vichy promulgue les lois raciales.",
        highlight: "Exclusion totale des citoyens israélites de la fonction publique, de la presse et de la citoyenneté",
        stamp: "STATUT DES JUIFS",
        stampColor: "red"
    },
    {
        id: "2_5", start: 78.5, end: 85.0,
        format: "vox_paper_cutout",
        tag: "24 OCTOBRE 1940 • MONTOIRE",
        title: "Pétain et Hitler à Montoire",
        image: "../01_Assets/Images/ww2/06_petain_hitler.jpg",
        caption: "Poignée de main de Montoire • « J'entre aujourd'hui dans la voie de la collaboration »"
    },
    {
        id: "2_6", start: 85.0, end: 91.5,
        format: "vox_archival_paper",
        tag: "16 — 17 JUILLET 1942 • PARIS",
        title: "La Rafle du Vélodrome d'Hiver",
        lead: "Opération « Vent Printanier » menée par 9 000 policiers et gendarmes français sous les ordres de Bousquet.",
        highlight: "Arrestation systématique des familles juives parisiennes, parquées sans vivres ni eau",
        stamp: "ARRESTATION",
        stampColor: "red"
    },
    {
        id: "2_7", start: 91.5, end: 98.0,
        format: "vox_monumental_stat",
        tag: "LE BILAN DU VEL D'HIV",
        statNum: 13152,
        statLabel: "Hommes, femmes et 4 115 enfants livrés aux nazis",
        statScale: "Transférés au camp de Drancy puis déportés vers le centre d'extermination d'Auschwitz."
    },
    {
        id: "2_8", start: 98.0, end: 104.0,
        format: "vox_impact_text",
        tag: "L'ARMÉE DES OMBRES",
        mainText: "SABOTAGES, RENSEIGNEMENTS MILITAIRES ET JOURNAUX CLANDESTINS DANS LA NUIT DE L'OCCUPATION",
        highlightWord: "L'ARMÉE DES OMBRES",
        author: "Combat, Libération, Francs-Tireurs : les premiers réseaux anonymes se lèvent"
    },
    {
        id: "2_9", start: 104.0, end: 108.5,
        format: "vox_paper_cutout",
        tag: "JEAN MOULIN (MAX)",
        title: "L'Unificateur de la Résistance",
        image: "../01_Assets/Images/ww2/07_jean_moulin.jpg",
        caption: "Émissaire de De Gaulle parachuté en France • Fondateur du CNR"
    },
    {
        id: "2_10", start: 108.5, end: 115.7,
        format: "vox_archival_paper",
        tag: "27 MAI 1943 • PARIS CLANDESTIN",
        title: "Fondation du Conseil National de la Résistance",
        lead: "Première réunion clandestine rue du Four réunissant tous les mouvements, syndicats et partis politiques.",
        highlight: "Reconnaissance unanime du général de Gaulle comme unique chef légitime de la France en guerre",
        stamp: "CNR FONDÉ",
        stampColor: "blue"
    },

    // =========================================================================================
    // --- CHAPITRE 3 : L'OPÉRATION BARBAROSSA & LA GUERRE D'ANÉANTISSEMENT (115.7s -> 171.9s) ---
    // =========================================================================================
    {
        id: "3_1", start: 115.7, end: 120.0,
        format: "vox_impact_text",
        tag: "22 JUIN 1941",
        mainText: "LE CHOC DES TITANS",
        highlightWord: "VIOLENCE PAROXYSTIQUE",
        author: "Rupture unilatérale du pacte germano-soviétique par Adolf Hitler"
    },
    {
        id: "3_2", start: 120.0, end: 124.5,
        format: "vox_solo_photo",
        tag: "OPÉRATION BARBAROSSA",
        title: "Les Panzers Déferlent sur la Steppe",
        image: "../01_Assets/Images/ww2/08_barbarossa_tanks.jpg",
        caption: "Colonnes blindées Panzer III dans la poussière russe • L'assaut surprise à l'Est"
    },
    {
        id: "3_3", start: 124.5, end: 128.5,
        format: "vox_monumental_stat",
        tag: "LE PLUS GRAND FRONT TERRESTRE",
        statNum: 3000000,
        statLabel: "Soldats de l'Axe déferlent sur l'Union Soviétique",
        statScale: "150 divisions allemandes déployées sur une ligne de front titanesque de 3 000 kilomètres."
    },
    {
        id: "3_4", start: 128.5, end: 134.5,
        format: "vox_impact_text",
        tag: "IDÉOLOGIE RACIALE",
        mainText: "GUERRE D'ANÉANTISSEMENT",
        highlightWord: "GUERRE D'ANÉANTISSEMENT TOTALE",
        author: "Conquête du Lebensraum (espace vital) et réduction des peuples slaves en esclavage"
    },
    {
        id: "3_5", start: 134.5, end: 142.0,
        format: "vox_tactical_map",
        tag: "FRONT DE L'EST • 3 AXES",
        title: "Les Trois Armées de la Wehrmacht",
        lead: "Axe Nord vers Léningrad, Axe Centre vers Moscou, Axe Sud vers les champs de blé et de pétrole d'Ukraine.",
        mapType: "barbarossa_front"
    },
    {
        id: "3_6", start: 142.0, end: 148.5,
        format: "vox_archival_paper",
        tag: "MAI 1941 • DÉCRET MILITAIRE",
        title: "Le Décret de Juridiction Barbarossa",
        lead: "Ordre formel du haut commandement suspendant le droit de la guerre sur le front de l'Est.",
        highlight: "Exemption de poursuites judiciaires pour les troupes du Reich commettant des exactions contre les civils",
        stamp: "ORDRE CRIMINEL",
        stampColor: "red"
    },
    {
        id: "3_7", start: 148.5, end: 156.0,
        format: "vox_monumental_stat",
        tag: "LA FAMINE DÉLIBÉRÉE",
        statNum: 3300000,
        statLabel: "Prisonniers de guerre soviétiques affamés à mort",
        statScale: "Sur 5,7 millions capturés par la Wehrmacht : un crime de guerre planifié à l'échelle industrielle."
    },
    {
        id: "3_8", start: 156.0, end: 162.5,
        format: "vox_solo_photo",
        tag: "LÉNINGRAD • 900 JOURS",
        title: "Le Siège Tragique de Léningrad",
        image: "../01_Assets/Images/ww2/09_leningrad_winter.jpg",
        caption: "Habitants de Léningrad sous le blocus nazi • Un million de civils morts de famine et de froid"
    },
    {
        id: "3_9", start: 162.5, end: 171.9,
        format: "vox_pure_video",
        tag: "LE FRONT DE L'EST EN GUERRE",
        title: "L'Assaut des Blindés sur la Steppe",
        videoSrc: "../01_Assets/Videos/ww2/ww2_battle_tanks.mp4",
        caption: "Offensives blindées et artillerie lourde sur le Front de l'Est"
    },
    {
        id: "3_9", start: 162.5, end: 171.9,
        format: "vox_impact_text",
        tag: "HIVER 1941 • AUX PORTES DE MOSCOU",
        mainText: "À QUELQUES KILOMÈTRES DES FAUBOURGS DU KREMLIN, L'HIVER RUSSE PAR -40°C BRISE LA BLITZKRIEG",
        highlightWord: "BRISE LA BLITZKRIEG",
        author: "Contre-offensive foudroyante des divisions sibériennes du général Joukov"
    },

    // ==================================================================================
    // --- CHAPITRE 4 : PEARL HARBOR & LE FRONT DU PACIFIQUE (173.9s -> 228.4s) ---
    // ==================================================================================
    {
        id: "4_1", start: 173.9, end: 180.5,
        format: "vox_solo_photo",
        tag: "7 DÉCEMBRE 1941 • HAWAÏ",
        title: "Pearl Harbor : L'Attaque Surprise",
        image: "../01_Assets/Images/ww2/10_pearl_harbor.jpg",
        caption: "Le cuirassé USS Arizona explose sous les bombes japonaises à 07h55"
    },
    {
        id: "4_2", start: 180.5, end: 188.0,
        format: "vox_monumental_stat",
        tag: "LE CHOC AMÉRICAIN",
        statNum: 2403,
        statLabel: "Soldats et marins tués lors du raid matinal surprise",
        statScale: "Huit cuirassés américains coulés ou lourdement endommagés par l'aéronavale impériale."
    },
    {
        id: "4_3", start: 188.0, end: 195.0,
        format: "vox_solo_photo",
        tag: "8 DÉCEMBRE 1941 • CONGRÈS",
        title: "Le Discours de l'Infamie de Roosevelt",
        image: "../01_Assets/Images/ww2/12_fdr_speech.jpg",
        caption: "Le président Franklin D. Roosevelt signant la déclaration de guerre des États-Unis"
    },
    {
        id: "4_4", start: 195.0, end: 202.0,
        format: "vox_impact_text",
        tag: "11 DÉCEMBRE 1941",
        mainText: "HITLER ET MUSSOLINI DÉCLARENT LA GUERRE AUX ÉTATS-UNIS : LE CONFLIT EST DÉSORMAIS UNIVERSEL",
        highlightWord: "DÉSORMAIS UNIVERSEL",
        author: "La puissance industrielle américaine entre de plain-pied dans la coalition alliée"
    },
    {
        id: "4_5", start: 202.0, end: 209.0,
        format: "vox_tactical_map",
        tag: "ASIE DU SUD-EST",
        title: "L'Éclair Impérial Japonais",
        lead: "Chute de Singapour, des Philippines, de Hong Kong et conquête des gisements de pétrole d'Indonésie.",
        mapType: "pacific_theater"
    },
    {
        id: "4_6", start: 209.0, end: 215.0,
        format: "vox_solo_photo",
        tag: "JUIN 1942 • MIDWAY",
        title: "La Bataille Aéronavale de Midway",
        image: "../01_Assets/Images/ww2/11_midway_carrier.jpg",
        caption: "L'USS Yorktown bombardé à Midway • Chasseurs et bombardiers en piqué Dauntless"
    },
    {
        id: "4_7", start: 215.0, end: 221.0,
        format: "vox_monumental_stat",
        tag: "LE COUP D'ARRÊT DU PACIFIQUE",
        statNum: 4,
        statLabel: "Porte-avions lourds japonais coulés en quelques heures",
        statScale: "Akagi, Kaga, Soryu et Hiryu perdus : la marine impériale ne se relèvera jamais de cette débâcle."
    },
    {
        id: "4_8", start: 221.0, end: 228.4,
        format: "vox_impact_text",
        tag: "TOURNANT STRATÉGIQUE",
        mainText: "LE RAPPORT DE FORCE S'INVERSE DÉFINITIVEMENT DANS LE PACIFIQUE",
        highlightWord: "S'INVERSE DÉFINITIVEMENT",
        author: "Les États-Unis prennent l'initiative offensive et entament la reconquête d'île en île"
    },

    // ==================================================================================
    // --- CHAPITRE 5 : L'ÉCONOMIE DE GUERRE TOTALE (230.4s -> 282.0s) ---
    // ==================================================================================
    {
        id: "5_1", start: 230.4, end: 236.0,
        format: "vox_impact_text",
        tag: "GUERRE TOTALE",
        mainText: "LA VICTOIRE DÉPEND AUTANT DE LA PUISSANCE DES USINES QUE DU COURAGE AU FRONT",
        highlightWord: "PUISSANCE DES USINES",
        author: "Mobilisation absolue de l'économie, de la science et des populations civiles"
    },
    {
        id: "5_2", start: 236.0, end: 241.5,
        format: "vox_solo_photo",
        tag: "ROSIE LA RIVETEUSE",
        title: "L'Arsenal des Démocraties",
        image: "../01_Assets/Images/ww2/13_rosie_the_riveter.jpg",
        caption: "« We Can Do It! » • Six millions de femmes américaines rejoignent les usines d'armement"
    },
    {
        id: "5_3", start: 241.5, end: 249.0,
        format: "vox_monumental_stat",
        tag: "VICTORY PROGRAM",
        statNum: 300000,
        statLabel: "Avions militaires produits par l'industrie américaine",
        statScale: "Accompagnés de 100 000 blindés et 2 700 cargos Liberty ships assemblés en série."
    },
    {
        id: "5_4", start: 249.0, end: 255.0,
        format: "vox_solo_photo",
        tag: "CADENCE INDUSTRIELLE",
        title: "L'Usine Boeing de Seattle",
        image: "../01_Assets/Images/ww2/14_aircraft_factory.jpg",
        caption: "Lignes d'assemblage géantes des bombardiers B-17 Flying Fortress à Seattle"
    },
    {
        id: "5_5", start: 255.0, end: 262.5,
        format: "vox_archival_paper",
        tag: "ÉCONOMIE DU REICH • ALBERT SPEER",
        title: "L'Économie Nazie de Pillage",
        lead: "Pillage systématique des matières premières, du bétail et des devises de l'Europe occupée.",
        highlight: "Asservissement forcé des populations pour alimenter la machine de guerre de Berlin",
        stamp: "PILLAGE",
        stampColor: "red"
    },
    {
        id: "5_6", start: 262.5, end: 270.0,
        format: "vox_monumental_stat",
        tag: "TRAVAIL FORCÉ",
        statNum: 8000000,
        statLabel: "Travailleurs forcés et requis asservis dans les usines nazies",
        statScale: "Dont 650 000 jeunes Français contraints de partir dans le cadre du STO."
    },
    {
        id: "5_7", start: 270.0, end: 282.0,
        format: "vox_tactical_map",
        tag: "BATAILLE DE L'ATLANTIQUE",
        title: "Le Cordon Ombilical des Convois",
        lead: "Guerre sous-marine impitoyable des meutes d'U-Boote brisée par le radar et le décryptage d'Enigma à Bletchley Park.",
        mapType: "atlantic_convoys"
    },

    // =========================================================================================
    // --- CHAPITRE 6 : L'ABÎME MORAL : LA SHOAH ET LES GÉNOCIDES (284.0s -> 338.2s) ---
    // =========================================================================================
    {
        id: "6_1", start: 284.0, end: 289.5,
        format: "vox_impact_text",
        tag: "L'ABÎME MORAL",
        mainText: "LE GÉNOCIDE SYSTÉMATIQUE ET INDUSTRIALISÉ DES JUIFS D'EUROPE ET DES POPULATIONS ROMS",
        highlightWord: "GÉNOCIDE SYSTÉMATIQUE ET INDUSTRIALISÉ",
        author: "Le crime le plus sombre de toute l'histoire de l'humanité"
    },
    {
        id: "6_2", start: 289.5, end: 294.0,
        format: "vox_solo_photo",
        tag: "ÉTÉ 1941 • FRONT DE L'EST",
        title: "La Shoah par Balles",
        image: "../01_Assets/Images/ww2/15_einsatzgruppen.jpg",
        caption: "Document d'archive des unités mobiles d'extermination Einsatzgruppen à l'Est"
    },
    {
        id: "6_3", start: 294.0, end: 300.0,
        format: "vox_monumental_stat",
        tag: "FOSSES COMMUNES",
        statNum: 1500000,
        statLabel: "Juifs d'URSS fusillés au bord des ravins",
        statScale: "Massacres de masse à Babi Yar et Ponary exécutés avec l'appui logistique de la Wehrmacht."
    },
    {
        id: "6_4", start: 300.0, end: 306.0,
        format: "vox_archival_paper",
        tag: "20 JANVIER 1942 • PROTOCOLE",
        title: "La Conférence de Wannsee",
        lead: "Sous la présidence de Reinhard Heydrich, planification bureaucratique de la « Solution finale ».",
        highlight: "Coordination logistique continentale pour acheminer 11 millions de Juifs vers la mort",
        stamp: "ENDLÖSUNG",
        stampColor: "red"
    },
    {
        id: "6_5", start: 306.0, end: 313.0,
        format: "vox_solo_photo",
        tag: "AUSCHWITZ-BIRKENAU",
        title: "Les Usines de la Mort",
        image: "../01_Assets/Images/ww2/16_auschwitz_gate.jpg",
        caption: "Porte centrale de Birkenau • Voies ferrées de la déportation industrielle"
    },
    {
        id: "6_6", start: 313.0, end: 320.0,
        format: "vox_monumental_stat",
        tag: "LE BILAN DE LA SHOAH",
        statNum: 6000000,
        statLabel: "Victimes juives assassinées dans le génocide nazi",
        statScale: "Les deux tiers du judaïsme européen méthodiquement anéantis par le Troisième Reich."
    },
    {
        id: "6_7", start: 320.0, end: 328.0,
        format: "vox_impact_text",
        tag: "SAMUDARIPEN",
        mainText: "250 000 À 500 000 ROMS EXTERMINÉS DANS LE GÉNOCIDE DU SAMUDARIPEN PAR LE GAZ ET LES CRÉMATOIRES",
        highlightWord: "INDUSTRIALISATION DE LA MORT",
        author: "Gaz toxique Zyklon B et incinération continue dans les centres de mise à mort"
    },
    {
        id: "6_8", start: 328.0, end: 338.2,
        format: "vox_archival_paper",
        tag: "JUSTICE HISTORIQUE",
        title: "L'Anéantissement Moral",
        lead: "Un crime planifié par l'appareil d'un État moderne retournant sa bureaucratie contre ses propres semblables.",
        highlight: "Un crime sans précédent dans l'histoire de la civilisation humaine",
        stamp: "CRIME ABSOLU",
        stampColor: "red"
    },

    // =========================================================================================
    // --- CHAPITRE 7 : LE TOURNANT STRATÉGIQUE : STALINGRAD & EL ALAMEIN (340.2s -> 394.7s) ---
    // =========================================================================================
    {
        id: "7_1", start: 340.2, end: 346.0,
        format: "vox_solo_photo",
        tag: "HIVER 1942 — 1943 • SUR LA VOLGA",
        title: "La Bataille de Stalingrad",
        image: "../01_Assets/Images/ww2/17_stalingrad_ruins.jpg",
        caption: "Combats acharnés dans les ruines calcinées de Stalingrad • Automne-hiver 1942"
    },
    {
        id: "7_2", start: 346.0, end: 351.5,
        format: "vox_pure_video",
        tag: "ENFER URBAIN • RATTEKRIEG",
        title: "Stalingrad : La Cité en Ruines",
        videoSrc: "../01_Assets/Videos/ww2/ww2_ruins_city.mp4",
        caption: "Bataille d'anéantissement dans les ruines calcinées de Stalingrad"
    },
    {
        id: "7_3", start: 351.5, end: 359.0,
        format: "vox_tactical_map",
        tag: "19 NOVEMBRE 1942 • TENAILLES",
        title: "L'Opération Uranus",
        lead: "La contre-offensive géante soviétique referme son étau à Kalatch, encerclant la 6e armée allemande de Paulus.",
        mapType: "stalingrad_uranus"
    },
    {
        id: "7_4", start: 359.0, end: 367.0,
        format: "vox_monumental_stat",
        tag: "LE PIÈGE DU KESSEL",
        statNum: 300000,
        statLabel: "Soldats de l'Axe encerclés et privés de vivres sous -35°C",
        statScale: "Le pont aérien promis par Goering échoue : les troupes allemandes meurent de faim et de gelure."
    },
    {
        id: "7_5", start: 367.0, end: 374.0,
        format: "vox_paper_cutout",
        tag: "2 FÉVRIER 1943 • CAPITULATION",
        title: "Maréchal Paulus",
        image: "../01_Assets/Images/ww2/18_paulus_surrender.jpg",
        caption: "Le maréchal Friedrich Paulus capitule à Stalingrad • Tournant de la guerre"
    },
    {
        id: "7_6", start: 374.0, end: 382.0,
        format: "vox_impact_text",
        tag: "MYTHE BRISÉ",
        mainText: "LE MYTHE DE L'INVINCIBILITÉ DE LA WEHRMACHT S'EFFONDRE DÉFINITIVEMENT SUR LES RIVES DE LA VOLGA",
        highlightWord: "S'EFFONDRE DÉFINITIVEMENT",
        author: "91 000 survivants allemands partent en captivité : tournant psychologique mondial"
    },
    {
        id: "7_7", start: 382.0, end: 394.7,
        format: "vox_paper_cutout",
        tag: "SIR WINSTON CHURCHILL",
        title: "Le Lion Britannique",
        image: "../01_Assets/Images/ww2/04_churchill.jpg",
        caption: "Sir Winston Churchill • « Ce n'est pas la fin. Mais c'est peut-être la fin du début. »"
    },

    // =========================================================================================
    // --- CHAPITRE 8 : L'ÉTAU ALLIÉ : OVERLORD, BAGRATION & LIBÉRATION (396.7s -> 451.0s) ---
    // =========================================================================================
    {
        id: "8_1", start: 396.7, end: 402.5,
        format: "vox_impact_text",
        tag: "1944 • L'ANNÉE DE L'ÉTAU",
        mainText: "LES ALLIÉS RESSERRENT INEXORABLEMENT L'ÉTAU AUTOUR DU TROISIÈME REICH",
        highlightWord: "RESSERRENT L'ÉTAU",
        author: "Exigence absolue de la capitulation inconditionnelle des armées nazies"
    },
    {
        id: "8_2", start: 402.5, end: 408.0,
        format: "vox_fullscreen_kenburns",
        tag: "6 JUIN 1944 • OMAHA BEACH",
        title: "Le Débarquement de Normandie",
        image: "../01_Assets/Images/ww2/19_dday_landing.jpg",
        caption: "Barge de débarquement à Omaha Beach • L'ouverture du second front à l'Ouest"
    },
    {
        id: "8_3", start: 408.0, end: 415.0,
        format: "vox_monumental_stat",
        tag: "L'ARMADA DU D-DAY",
        statNum: 156000,
        statLabel: "Soldats alliés débarqués en 24h sur les 5 plages normandes",
        statScale: "Appuyés par 7 000 navires de guerre et 11 000 avions sous le commandement d'Eisenhower."
    },
    {
        id: "8_4", start: 415.0, end: 421.0,
        format: "vox_solo_photo",
        tag: "22 JUIN 1944 • BIÉLORUSSIE",
        title: "Opération Bagration à l'Est",
        image: "../01_Assets/Images/ww2/20_bagration_offensive.jpg",
        caption: "Chars soviétiques T-34 et infanterie chargeant à travers les forêts de Biélorussie"
    },
    {
        id: "8_5", start: 421.0, end: 427.5,
        format: "vox_monumental_stat",
        tag: "ÉCRASEMENT DU REICH",
        statNum: 28,
        statLabel: "Divisions du groupe d'armées Centre allemand pulvérisées",
        statScale: "La pire défaite de l'histoire militaire allemande : l'Armée rouge avance de 400 km vers Berlin."
    },
    {
        id: "8_6", start: 427.5, end: 436.0,
        format: "vox_tactical_map",
        tag: "ÉTÉ 1944 • DOUBLE FRONT",
        title: "L'Étau Convergent vers Berlin",
        lead: "Pris en tenaille entre l'Est et l'Ouest, écrasé sous les tapis de bombes stratégiques, le Reich agonise.",
        mapType: "double_pincer_1944"
    },
    {
        id: "8_7", start: 436.0, end: 443.0,
        format: "vox_solo_photo",
        tag: "25 AOÛT 1944 • PARIS",
        title: "La Libération de Paris",
        image: "../01_Assets/Images/ww2/21_paris_liberation.jpg",
        caption: "La foule en liesse et la 2e DB du général Leclerc sur les Champs-Élysées"
    },
    {
        id: "8_8", start: 443.0, end: 451.0,
        format: "vox_impact_text",
        tag: "HÔTEL DE VILLE DE PARIS",
        mainText: "« PARIS OUTRAGÉ ! PARIS BRISÉ ! PARIS MARTYRISÉ ! MAIS PARIS LIBÉRÉ ! »",
        highlightWord: "PARIS LIBÉRÉ !",
        author: "Général Charles de Gaulle • Restauration de la République et souveraineté retrouvée"
    },

    // =========================================================================================
    // --- CHAPITRE 9 : L'AGONIE DU REICH & LA CAPITULATION (453.0s -> 503.7s) ---
    // =========================================================================================
    {
        id: "9_1", start: 453.0, end: 459.5,
        format: "vox_impact_text",
        tag: "PRINTEMPS 1945",
        mainText: "LE TROISIÈME REICH N'EST PLUS QU'UN CHAMP DE DÉCOMBRES ASSIÉGÉ DE TOUTES PARTS",
        highlightWord: "CHAMP DE DÉCOMBRES",
        author: "Les armées alliées et soviétiques convergent vers le cœur de l'Allemagne"
    },
    {
        id: "9_2", start: 459.5, end: 467.0,
        format: "vox_solo_photo",
        tag: "25 AVRIL 1945 • TORGAU",
        title: "Jonction Historique sur l'Elbe",
        image: "../01_Assets/Images/ww2/22_torgau_elbe.jpg",
        caption: "Soldats américains et soviétiques se serrant la main sur les rives de l'Elbe"
    },
    {
        id: "9_3", start: 467.0, end: 474.0,
        format: "vox_fullscreen_kenburns",
        tag: "2 MAI 1945 • BERLIN",
        title: "Le Drapeau Rouge sur le Reichstag",
        image: "../01_Assets/Images/ww2/23_reichstag_flag.jpg",
        caption: "Soldat soviétique hissant le drapeau de la victoire sur le Reichstag en ruines"
    },
    {
        id: "9_4", start: 474.0, end: 481.5,
        format: "vox_archival_paper",
        tag: "30 AVRIL 1945 • LE BUNKER",
        title: "Le Suicide d'Adolf Hitler",
        lead: "Terré à huit mètres sous terre dans son Führerbunker dévasté sous les obus de l'Armée rouge.",
        highlight: "Suicide du dictateur nazi pour échapper au jugement de ses crimes",
        stamp: "FIN DU TYRAN",
        stampColor: "red"
    },
    {
        id: "9_5", start: 481.5, end: 492.0,
        format: "vox_solo_photo",
        tag: "8 MAI 1945 • BERLIN",
        title: "La Signature de la Capitulation",
        image: "../01_Assets/Images/ww2/24_keitel_surrender.jpg",
        caption: "Le maréchal Wilhelm Keitel signant la capitulation sans condition à Berlin-Karlshorst"
    },
    {
        id: "9_6", start: 492.0, end: 503.7,
        format: "vox_impact_text",
        tag: "8 MAI 1945 • 23H01",
        mainText: "LA GUERRE PREND OFFICIELLEMENT FIN SUR LE CONTINENT EUROPÉEN",
        highlightWord: "CAPITULATION SANS CONDITION",
        author: "Après cinq années d'effroi, de destructions et de barbarie totalitaire"
    },

    // =========================================================================================
    // --- CHAPITRE 10 : L'AUBE NUCLÉAIRE, LE BILAN & LE NOUVEL ORDRE (505.7s -> 568.1s) ---
    // =========================================================================================
    {
        id: "10_1", start: 505.7, end: 511.0,
        format: "vox_impact_text",
        tag: "PACIFIQUE • ÉTÉ 1945",
        mainText: "LA GUERRE SE PROLONGE DANS UN FANATISME MORTIFÈRE JUSQU'EN AOÛT 1945",
        highlightWord: "FANATISME MORTIFÈRE",
        author: "Refus obstiné de capitulation de l'état-major impérial japonais"
    },
    {
        id: "10_2", start: 511.0, end: 517.0,
        format: "vox_archival_paper",
        tag: "JUILLET 1945 • DÉCISION TRUMAN",
        title: "L'Ordre d'Emploi de la Bombe Atomique",
        lead: "Le président Harry Truman ordonne l'emploi de la nouvelle arme absolue développée par Manhattan.",
        highlight: "Objectif : Forcer la reddition immédiate et éviter un débarquement sanglant sur l'archipel",
        stamp: "TOP SECRET",
        stampColor: "red"
    },
    {
        id: "10_3", start: 517.0, end: 524.5,
        format: "vox_pure_video",
        tag: "6 & 9 AOÛT 1945 • HIROSHIMA & NAGASAKI",
        videoSrc: "../01_Assets/Videos/ww2/atomic_bomb.mp4",
        caption: "Détonation atomique réelle • Plus de 120 000 civils pulvérisés en quelques secondes"
    },
    {
        id: "10_4", start: 524.5, end: 530.0,
        format: "vox_solo_photo",
        tag: "2 SEPTEMBRE 1945 • USS MISSOURI",
        title: "Le Champignon Nucléaire & la Fin du Conflit",
        image: "../01_Assets/Images/ww2/25_hiroshima_mushroom.jpg",
        caption: "Le champignon atomique s'élevant à 15 000 mètres • Capitulation du Japon en baie de Tokyo"
    },
    {
        id: "10_5", start: 530.0, end: 539.0,
        format: "vox_monumental_stat",
        tag: "LE BILAN SIDÉRANT",
        statNum: 65000000,
        statLabel: "De vies anéanties au cours de la Seconde Guerre mondiale",
        statScale: "Dont plus de 60% de civils : le conflit le plus dévastateur de toute l'histoire de l'humanité."
    },
    {
        id: "10_6", start: 539.0, end: 548.0,
        format: "vox_solo_photo",
        tag: "1945 — 1946 • NUREMBERG",
        title: "Le Procès de Nuremberg",
        image: "../01_Assets/Images/ww2/26_nuremberg_trials.jpg",
        caption: "Le box des accusés à Nuremberg • Naissance juridique du Crime contre l'Humanité"
    },
    {
        id: "10_7", start: 548.0, end: 556.0,
        format: "vox_solo_photo",
        tag: "JUIN 1945 • SAN FRANCISCO",
        title: "La Fondation des Nations Unies",
        image: "../01_Assets/Images/ww2/27_un_charter.jpg",
        caption: "Cinquante nations signent solennellement la Charte fondatrice de l'ONU"
    },
    {
        id: "10_8", start: 556.0, end: 568.1,
        format: "vox_impact_text",
        tag: "L'AUBE DE LA GUERRE FROIDE",
        mainText: "SUR LES RUINES D'UN MONDE DÉVASTÉ, L'AFFRONTEMENT ENTRE L'AMÉRIQUE ET L'URSS DESSINE LE MONDE BIPOLAIRE",
        highlightWord: "MONDE BIPOLAIRE",
        author: "Fin de la Seconde Guerre mondiale et ouverture immédiate de la Guerre Froide"
    }
];

function renderSvgMap(mapType) {
    if (mapType === 'barbarossa_front') {
        return `
        <svg class="map-svg-element" viewBox="0 0 760 460">
            <rect width="760" height="460" fill="#f0ebd9" rx="10" />
            <path d="M 60 120 Q 220 80 400 130 T 700 200 L 700 420 L 60 420 Z" fill="#e2dac6" opacity="0.5"/>
            <path d="M 220 80 Q 240 240 220 400" stroke="#8c7e6c" stroke-width="3" stroke-dasharray="6,4" />
            <text x="90" y="240" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="900" fill="#991b1b" opacity="0.4">REICH</text>
            <text x="560" y="240" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="900" fill="#1e3a8a" opacity="0.4">U.R.S.S.</text>
            <path class="tactical-arrow-1" d="M 230 110 L 520 90" stroke="#dc2626" stroke-width="7" stroke-dasharray="320" stroke-dashoffset="320" marker-end="url(#arrowRed)" />
            <text x="535" y="95" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#111110">LÉNINGRAD</text>
            <path class="tactical-arrow-2" d="M 230 220 L 560 210" stroke="#dc2626" stroke-width="9" stroke-dasharray="340" stroke-dashoffset="340" marker-end="url(#arrowRed)" />
            <text x="575" y="215" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="900" fill="#dc2626">MOSCOU</text>
            <path class="tactical-arrow-3" d="M 230 330 L 510 340" stroke="#dc2626" stroke-width="7" stroke-dasharray="300" stroke-dashoffset="300" marker-end="url(#arrowRed)" />
            <text x="525" y="345" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#111110">KIEV</text>
            <defs>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                </marker>
            </defs>
        </svg>`;
    } else if (mapType === 'stalingrad_uranus') {
        return `
        <svg class="map-svg-element" viewBox="0 0 760 460">
            <rect width="760" height="460" fill="#f0ebd9" rx="10" />
            <path d="M 520 60 Q 500 220 540 400" stroke="#3b82f6" stroke-width="10" fill="none" opacity="0.6"/>
            <text x="560" y="120" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#1e40af">FLEUVE VOLGA</text>
            <ellipse cx="450" cy="230" rx="50" ry="38" fill="#fee2e2" stroke="#dc2626" stroke-width="3" stroke-dasharray="4,4" />
            <text x="415" y="235" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" fill="#991b1b">6e ARMÉE</text>
            <path class="tactical-arrow-1" d="M 280 120 Q 380 150 440 200" stroke="#1d4ed8" stroke-width="9" stroke-dasharray="240" stroke-dashoffset="240" marker-end="url(#arrowBlue)" />
            <path class="tactical-arrow-2" d="M 300 340 Q 390 310 445 260" stroke="#1d4ed8" stroke-width="9" stroke-dasharray="240" stroke-dashoffset="240" marker-end="url(#arrowBlue)" />
            <defs>
                <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#1d4ed8" />
                </marker>
            </defs>
        </svg>`;
    } else if (mapType === 'double_pincer_1944') {
        return `
        <svg class="map-svg-element" viewBox="0 0 760 460">
            <rect width="760" height="460" fill="#f0ebd9" rx="10" />
            <circle cx="380" cy="230" r="26" fill="#fee2e2" stroke="#dc2626" stroke-width="3" />
            <circle cx="380" cy="230" r="10" fill="#dc2626" />
            <text x="350" y="190" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="900" fill="#dc2626">BERLIN</text>
            <path class="tactical-arrow-1" d="M 100 230 L 320 230" stroke="#15803d" stroke-width="10" stroke-dasharray="240" stroke-dashoffset="240" marker-end="url(#arrowGreen)" />
            <text x="100" y="205" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#15803d">ALLIÉS DE L'OUEST</text>
            <path class="tactical-arrow-2" d="M 660 230 L 440 230" stroke="#dc2626" stroke-width="10" stroke-dasharray="240" stroke-dashoffset="240" marker-end="url(#arrowRed)" />
            <text x="500" y="205" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" fill="#dc2626">ARMÉE ROUGE</text>
            <defs>
                <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d" />
                </marker>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                </marker>
            </defs>
        </svg>`;
    } else {
        return `
        <svg class="map-svg-element" viewBox="0 0 760 460">
            <rect width="760" height="460" fill="#f0ebd9" rx="10" />
            <path d="M 80 120 Q 240 70 420 130 T 700 220 L 700 420 L 80 420 Z" fill="#e2dac6" opacity="0.5"/>
            <path class="tactical-arrow-1" d="M 140 200 L 380 230" stroke="#dc2626" stroke-width="8" stroke-dasharray="260" stroke-dashoffset="260" marker-end="url(#arrowRed)" />
            <path class="tactical-arrow-2" d="M 640 280 L 420 240" stroke="#1d4ed8" stroke-width="8" stroke-dasharray="260" stroke-dashoffset="260" marker-end="url(#arrowBlue)" />
            <circle class="tactical-pin" cx="400" cy="235" r="10" fill="#dc2626" />
            <defs>
                <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                </marker>
                <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#1d4ed8" />
                </marker>
            </defs>
        </svg>`;
    }
}

function generateHtmlComposition() {
    console.log('🎬 GÉNÉRATION DU DOCUMENTAIRE VOX EXPLAINER (72 PLANS DYNAMIQUES & EFFET PENDULE)...');
    const outFile = path.join(VIDEOS_DIR, 'ww2_vox_documentaire_11mn.html');

    const shotsHtml = SHOTS.map((s) => {
        let contentHtml = '';

        if (s.format === 'vox_impact_text') {
            let processedText = s.mainText;
            if (s.highlightWord) {
                processedText = s.mainText.replace(
                    s.highlightWord,
                    `<span class="vox-yellow-highlight">${s.highlightWord}</span>`
                );
            }
            contentHtml = `
            <div class="vox-format-impact">
                <div class="impact-tag">${s.tag}</div>
                <div class="impact-quote-mark">“</div>
                <h1 class="impact-headline">${processedText}</h1>
                ${s.author ? `<div class="impact-author">${s.author}</div>` : ''}
            </div>`;
        } else if (s.format === 'vox_solo_photo') {
            contentHtml = `
            <div class="vox-format-solo-photo">
                <div class="solo-top-tag">${s.tag}</div>
                <div class="solo-frame pendulum-frame">
                    <img class="solo-img" src="${s.image}" alt="${s.title}" />
                    <div class="solo-caption">${s.caption || ''}</div>
                </div>
            </div>`;
        } else if (s.format === 'vox_pure_video') {
            contentHtml = `
            <div class="vox-format-pure-video">
                <div class="video-top-tag">${s.tag}</div>
                <div class="video-frame pendulum-frame">
                    <video class="video-player" src="${s.videoSrc}" autoplay muted loop playsinline></video>
                    <div class="video-caption">${s.caption || ''}</div>
                    <div class="video-thermal-flash"></div>
                </div>
            </div>`;
        } else if (s.format === 'vox_archival_paper') {
            contentHtml = `
            <div class="vox-format-paper">
                <div class="paper-sheet pendulum-frame">
                    <div class="paper-top-tape"></div>
                    <div class="paper-header">
                        <span class="paper-tag">${s.tag}</span>
                        <span class="paper-ref">DOSSIER HISTORIQUE DÉCLASSIFIÉ</span>
                    </div>
                    <h2 class="paper-title">${s.title}</h2>
                    <p class="paper-lead">${s.lead}</p>
                    <div class="paper-highlight-box">
                        <span class="vox-yellow-highlight paper-highlighter">${s.highlight}</span>
                    </div>
                    <div class="paper-stamp stamp-${s.stampColor || 'red'}">${s.stamp}</div>
                    <div class="paper-footer">ARCHIVES OFFICIELLES • PROGRAMME HISTOIRE TERMINALE</div>
                </div>
            </div>`;
        } else if (s.format === 'vox_tactical_map') {
            contentHtml = `
            <div class="vox-format-map">
                <div class="map-sidebar">
                    <span class="map-tag">${s.tag}</span>
                    <h2 class="map-title">${s.title}</h2>
                    <p class="map-lead">${s.lead}</p>
                    <div class="map-legend">
                        <div class="leg-item"><span class="leg-dot red"></span> OFFENSIVES DE L'AXE</div>
                        <div class="leg-item"><span class="leg-dot blue"></span> CONTRE-ATTAQUES ALLIÉES</div>
                    </div>
                </div>
                <div class="map-board pendulum-frame">
                    ${renderSvgMap(s.mapType)}
                </div>
            </div>`;
        } else if (s.format === 'vox_monumental_stat') {
            contentHtml = `
            <div class="vox-format-stat">
                <div class="stat-top-tag">${s.tag}</div>
                <div class="stat-big-number pendulum-frame" data-target="${s.statNum}">0</div>
                <div class="stat-main-label">${s.statLabel}</div>
                <div class="stat-scale-divider"></div>
                <div class="stat-scale-text">${s.statScale}</div>
            </div>`;
        } else if (s.format === 'vox_fullscreen_kenburns') {
            contentHtml = `
            <div class="vox-format-kenburns">
                <img class="kenburns-img" src="${s.image}" alt="${s.title}" />
                <div class="kenburns-vignette"></div>
                <div class="kenburns-overlay">
                    <div class="kenburns-tag">${s.tag}</div>
                    <h2 class="kenburns-title">${s.title}</h2>
                    ${s.caption ? `<div class="kenburns-caption">${s.caption}</div>` : ''}
                </div>
            </div>`;
        } else if (s.format === 'vox_paper_cutout') {
            contentHtml = `
            <div class="vox-format-cutout">
                <div class="cutout-top-tag">${s.tag}</div>
                <div class="cutout-wrapper pendulum-frame">
                    <img class="vox-paper-cutout" src="${s.image}" alt="${s.title}" />
                    <div class="cutout-card-title">${s.title}</div>
                    ${s.caption ? `<div class="cutout-caption">${s.caption}</div>` : ''}
                </div>
            </div>`;
        } else if (s.format === 'vox_editorial_split') {
            contentHtml = `
            <div class="vox-format-split">
                <div class="split-left">
                    <span class="split-tag">${s.tag}</span>
                    <h2 class="split-title">${s.title}</h2>
                    <p class="split-lead">${s.lead}</p>
                    ${s.note ? `<div class="split-note-card">${s.note}</div>` : ''}
                </div>
                <div class="split-right">
                    <div class="split-photo-frame pendulum-frame">
                        <img class="split-img" src="${s.image}" alt="${s.title}" />
                        <div class="split-caption">${s.caption || ''}</div>
                    </div>
                </div>
            </div>`;
        }

        return `
        <!-- ================================================================= -->
        <!-- PLAN ${s.id} : ${s.format} (${s.start.toFixed(1)}s -> ${s.end.toFixed(1)}s) -->
        <!-- ================================================================= -->
        <div id="shot_${s.id}" class="shot-container" data-start="${s.start.toFixed(1)}" data-end="${s.end.toFixed(1)}" data-format="${s.format}" style="${s.id === '1_1' ? 'display:flex; opacity:1; visibility:visible;' : ''}">
            ${contentHtml}
        </div>`;
    }).join('\n\n');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Seconde Guerre Mondiale — Documentaire Vox (11mn)</title>
    
    <!-- Polices Typographiques Vox : Plus Jakarta Sans (Nette), Instrument Serif (Archival), JetBrains Mono (Données) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- GSAP 3.12 Core Local & CDN Fallback -->
    <script src="../node_modules/gsap/dist/gsap.min.js"></script>
    <script>
        if (typeof gsap === 'undefined') {
            document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"><\\/script>');
        }
    </script>

    <style>
        :root {
            --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-serif: 'Instrument Serif', Georgia, serif;
            --font-mono: 'JetBrains Mono', monospace;

            /* Direction Artistique Papier Vélin Lumineux (Beige virant au Blanc, Règle 15) */
            --paper-bg: #faf8f5;
            --paper-card: #ffffff;
            --ink-black: #111110;
            --ink-charcoal: #26201b;
            --ink-muted: #6b6257;

            /* Accents Authentiques Vox */
            --vox-yellow: #ffe600;
            --vox-yellow-soft: #fef08a;
            --accent-red: #dc2626;
            --accent-blue: #1d4ed8;

            --paper-shadow: 0 20px 45px rgba(35, 25, 15, 0.08), 0 4px 12px rgba(35, 25, 15, 0.04);
            --photo-shadow: 0 24px 50px rgba(25, 18, 12, 0.12), 0 4px 14px rgba(25, 18, 12, 0.06);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
            -webkit-font-smoothing: antialiased;
        }

        html, body {
            width: 100%;
            height: 100%;
            background: #0f0c09;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-sans);
        }

        #stage {
            position: absolute;
            width: 1920px;
            height: 1080px;
            background: var(--paper-bg);
            overflow: hidden;
            perspective: 1400px;
            transform-origin: center center;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
            background-image: 
                radial-gradient(circle at 50% 30%, #ffffff 0%, #faf8f5 60%, #f4f0e6 100%);
        }

        .stage-texture-grain {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 50;
            opacity: 0.035;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .shot-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: none;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            z-index: 10;
            align-items: center;
            justify-content: center;
            padding: 80px 110px;
        }

        /* Effet Pendule (Suspension par le haut pour oscillation naturelle comme une cloche) */
        .pendulum-frame {
            transform-origin: 50% 0%;
            will-change: transform;
        }

        /* Effet Surligneur Jaune Fluide Vox */
        .vox-yellow-highlight {
            background: linear-gradient(90deg, #ffe600, #ffe600) no-repeat;
            background-size: 0% 100%;
            padding: 2px 8px;
            border-radius: 4px;
            color: inherit;
        }

        /* 1. FORMAT : VOX IMPACT TEXT */
        .vox-format-impact {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            max-width: 1450px;
            margin: auto;
        }

        .impact-tag {
            font-family: var(--font-mono);
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--accent-red);
            margin-bottom: 24px;
        }

        .impact-quote-mark {
            font-family: var(--font-serif);
            font-size: 110px;
            line-height: 0.5;
            color: rgba(220, 38, 38, 0.25);
            font-style: italic;
            margin-bottom: 20px;
        }

        .impact-headline {
            font-size: 64px;
            font-weight: 900;
            line-height: 1.15;
            letter-spacing: -0.025em;
            color: var(--ink-black);
            margin-bottom: 30px;
        }

        .impact-author {
            font-family: var(--font-mono);
            font-size: 18px;
            font-weight: 700;
            color: var(--ink-muted);
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        /* 2. FORMAT : VOX SOLO PHOTO */
        .vox-format-solo-photo {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            justify-content: center;
        }

        .solo-top-tag {
            font-family: var(--font-mono);
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: var(--accent-red);
            text-transform: uppercase;
            margin-bottom: 20px;
            align-self: flex-start;
        }

        .solo-frame {
            background: #ffffff;
            padding: 18px 18px 24px 18px;
            border-radius: 12px;
            box-shadow: var(--photo-shadow);
            border: 1px solid rgba(45,32,20,0.10);
            max-width: 1250px;
            width: 100%;
        }

        .solo-img {
            width: 100%;
            height: 680px;
            object-fit: cover;
            border-radius: 6px;
            display: block;
        }

        .solo-caption {
            font-family: var(--font-mono);
            font-size: 14px;
            color: var(--ink-muted);
            margin-top: 14px;
            text-align: left;
            line-height: 1.4;
        }

        /* 3. FORMAT : VOX PURE VIDEO */
        .vox-format-pure-video {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            justify-content: center;
        }

        .video-top-tag {
            font-family: var(--font-mono);
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: var(--accent-red);
            text-transform: uppercase;
            margin-bottom: 20px;
            align-self: flex-start;
        }

        .video-frame {
            position: relative;
            background: #000000;
            padding: 16px;
            border-radius: 14px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.4);
            border: 1px solid rgba(45,32,20,0.15);
            max-width: 1250px;
            width: 100%;
            overflow: hidden;
        }

        .video-player {
            width: 100%;
            height: 660px;
            object-fit: cover;
            border-radius: 6px;
            display: block;
        }

        .video-caption {
            font-family: var(--font-mono);
            font-size: 14px;
            color: #d1c7bc;
            margin-top: 12px;
            text-align: left;
        }

        .video-thermal-flash {
            position: absolute;
            inset: 0;
            background: #ffffff;
            opacity: 0;
            pointer-events: none;
            z-index: 10;
        }

        /* 4. FORMAT : VOX ARCHIVAL PAPER */
        .vox-format-paper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        .paper-sheet {
            background: #ffffff;
            border: 1px solid rgba(45,32,20,0.12);
            border-radius: 16px;
            padding: 55px 70px;
            box-shadow: var(--paper-shadow);
            max-width: 1100px;
            width: 100%;
            position: relative;
        }

        .paper-top-tape {
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            width: 140px;
            height: 34px;
            background: rgba(225,215,195,0.7);
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .paper-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 18px;
            border-bottom: 2px dashed rgba(45,32,20,0.15);
            margin-bottom: 28px;
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 700;
        }

        .paper-tag {
            color: var(--accent-red);
            letter-spacing: 0.12em;
        }

        .paper-ref {
            color: var(--ink-muted);
            letter-spacing: 0.08em;
        }

        .paper-title {
            font-size: 48px;
            font-weight: 900;
            line-height: 1.15;
            color: var(--ink-black);
            margin-bottom: 18px;
            letter-spacing: -0.02em;
        }

        .paper-lead {
            font-size: 24px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--ink-charcoal);
            margin-bottom: 30px;
        }

        .paper-highlight-box {
            font-family: var(--font-mono);
            font-size: 21px;
            line-height: 1.6;
            margin-bottom: 34px;
            font-weight: 700;
        }

        .paper-stamp {
            position: absolute;
            right: 60px;
            top: 50px;
            font-family: var(--font-mono);
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 0.18em;
            padding: 8px 24px;
            border-radius: 8px;
            transform: rotate(-12deg);
            opacity: 0.95;
        }

        .paper-stamp.stamp-red {
            border: 5px solid var(--accent-red);
            color: var(--accent-red);
        }

        .paper-stamp.stamp-blue {
            border: 5px solid var(--accent-blue);
            color: var(--accent-blue);
        }

        .paper-footer {
            border-top: 1px solid rgba(45,32,20,0.12);
            padding-top: 20px;
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--ink-muted);
            letter-spacing: 0.08em;
        }

        /* 5. FORMAT : VOX TACTICAL MAP */
        .vox-format-map {
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            gap: 60px;
            align-items: center;
        }

        .map-sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .map-tag {
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: var(--accent-red);
            text-transform: uppercase;
        }

        .map-title {
            font-size: 52px;
            font-weight: 900;
            line-height: 1.1;
            color: var(--ink-black);
            letter-spacing: -0.025em;
        }

        .map-lead {
            font-size: 23px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--ink-charcoal);
        }

        .map-legend {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 700;
            color: var(--ink-muted);
        }

        .leg-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .leg-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .leg-dot.red { background: var(--accent-red); }
        .leg-dot.blue { background: var(--accent-blue); }

        .map-board {
            background: #ffffff;
            border: 1px solid rgba(45,32,20,0.12);
            border-radius: 16px;
            padding: 24px;
            box-shadow: var(--paper-shadow);
        }

        .map-svg-element {
            width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
        }

        /* 6. FORMAT : VOX MONUMENTAL STAT */
        .vox-format-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            max-width: 1300px;
            margin: auto;
        }

        .stat-top-tag {
            font-family: var(--font-mono);
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.18em;
            color: var(--accent-red);
            text-transform: uppercase;
            margin-bottom: 16px;
        }

        .stat-big-number {
            font-family: var(--font-mono);
            font-size: 120px;
            font-weight: 900;
            line-height: 0.95;
            letter-spacing: -0.04em;
            color: var(--accent-red);
            margin-bottom: 20px;
        }

        .stat-main-label {
            font-size: 32px;
            font-weight: 800;
            color: var(--ink-black);
            line-height: 1.25;
            max-width: 950px;
        }

        .stat-scale-divider {
            width: 120px;
            height: 4px;
            background: rgba(45,32,20,0.15);
            margin: 24px auto;
            border-radius: 2px;
        }

        .stat-scale-text {
            font-size: 22px;
            font-weight: 500;
            color: var(--ink-muted);
            line-height: 1.45;
            max-width: 1050px;
        }

        /* 8. FORMAT : VOX FULLSCREEN KEN BURNS (PLEIN ÉCRAN ANIMÉ) */
        .vox-format-kenburns {
            width: 100%;
            height: 100%;
            position: absolute;
            inset: 0;
            overflow: hidden;
            display: flex;
            align-items: flex-end;
        }

        .kenburns-img {
            position: absolute;
            inset: -5%;
            width: 110%;
            height: 110%;
            object-fit: cover;
            filter: contrast(1.08) brightness(0.95);
        }

        .kenburns-vignette {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(15,12,10,0.55) 100%),
                        linear-gradient(to top, rgba(15,12,10,0.85) 0%, rgba(0,0,0,0) 45%);
            pointer-events: none;
        }

        .kenburns-overlay {
            position: relative;
            z-index: 2;
            padding: 50px 70px;
            max-width: 1100px;
        }

        .kenburns-tag {
            font-family: var(--font-mono);
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.18em;
            color: #ffe600;
            text-transform: uppercase;
            text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }

        .kenburns-title {
            font-size: 52px;
            font-weight: 900;
            color: #ffffff;
            margin-top: 10px;
            letter-spacing: -0.025em;
            text-shadow: 0 3px 12px rgba(0,0,0,0.8);
        }

        .kenburns-caption {
            font-family: var(--font-mono);
            font-size: 16px;
            color: #e2e8f0;
            margin-top: 10px;
            line-height: 1.4;
            text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        }

        /* 9. FORMAT : VOX PAPER CUTOUT STICKER (CONTOUR BLANC PAPIER & EFFET PENDULE) */
        .vox-format-cutout {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            gap: 20px;
        }

        .cutout-top-tag {
            font-family: var(--font-mono);
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: var(--accent-red);
            text-transform: uppercase;
        }

        .cutout-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
        }

        .vox-paper-cutout {
            max-height: 520px;
            max-width: 820px;
            object-fit: contain;
            border-radius: 12px;
            border: 5px solid #ffffff;
            box-shadow: 0 16px 36px rgba(25, 20, 15, 0.28), 0 0 0 1px rgba(0,0,0,0.1);
            filter: drop-shadow(0 0 0 4px #ffffff) drop-shadow(0 14px 28px rgba(20,15,10,0.22));
            background: #ffffff;
        }

        .cutout-card-title {
            font-size: 34px;
            font-weight: 900;
            color: var(--ink-black);
            letter-spacing: -0.02em;
        }

        .cutout-caption {
            font-family: var(--font-mono);
            font-size: 14px;
            color: var(--ink-muted);
            max-width: 750px;
            text-align: center;
            line-height: 1.4;
        }

        /* 7. FORMAT : VOX EDITORIAL SPLIT */
        .vox-format-split {
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: 1fr 1.05fr;
            gap: 70px;
            align-items: center;
        }

        .split-left {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .split-tag {
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: var(--accent-red);
            text-transform: uppercase;
        }

        .split-title {
            font-size: 48px;
            font-weight: 900;
            line-height: 1.12;
            color: var(--ink-black);
            letter-spacing: -0.025em;
        }

        .split-lead {
            font-size: 22px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--ink-charcoal);
        }

        .split-note-card {
            background: #ffffff;
            border-left: 4px solid var(--accent-blue);
            border-radius: 0 10px 10px 0;
            padding: 18px 24px;
            font-size: 17px;
            line-height: 1.45;
            color: var(--ink-charcoal);
            box-shadow: 0 4px 14px rgba(35,25,15,0.04);
            margin-top: 8px;
        }

        .split-right {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .split-photo-frame {
            background: #ffffff;
            padding: 16px 16px 22px 16px;
            border-radius: 12px;
            box-shadow: var(--photo-shadow);
            border: 1px solid rgba(45,32,20,0.10);
            width: 100%;
        }

        .split-img {
            width: 100%;
            height: 520px;
            object-fit: cover;
            border-radius: 6px;
            display: block;
        }

        .split-caption {
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--ink-muted);
            margin-top: 12px;
            line-height: 1.4;
        }
    </style>
</head>
<body>

    <!-- Piste Audio Master MP3 (Légère 13.1 Mo, Zéro Saccade) -->
    <audio id="voiceTrack" src="../01_Assets/Audio_Mix/ww2_vox_documentaire_11mn_master_soundtrack.mp3" preload="auto"></audio>

    <div id="stage" data-duration="${TOTAL_DURATION.toFixed(1)}" data-format="16:9">
        <div class="stage-texture-grain"></div>
        ${shotsHtml}
    </div>

    <script>
        const DURATION = ${TOTAL_DURATION.toFixed(1)};
        const stage = document.getElementById('stage');
        const voiceAudio = document.getElementById('voiceTrack');

        // Contrat Studio VibeEditor & HyperFrames
        window.VIDEO_CONFIG = {
            title: "La Seconde Guerre Mondiale — Documentaire Vox (11mn)",
            duration: DURATION,
            fps: 30,
            format: "16:9",
            audio: {
                voice: "../01_Assets/Audio_Mix/ww2_vox_documentaire_11mn_master_soundtrack.mp3"
            }
        };
        window.DURATION = DURATION;
        window.duration = DURATION;

        function scaleStage() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const scale = Math.min(vw / 1920, vh / 1080);
            stage.style.transform = \`translate(-50%, -50%) scale(\${scale})\`;
            stage.style.left = '50%';
            stage.style.top = '50%';
        }
        window.addEventListener('resize', scaleStage);
        scaleStage();

        const shotsData = ${JSON.stringify(SHOTS)};

        let currentVisibleShotId = null;
        function updateShotVisibility(t) {
            let activeShot = shotsData.find(s => t >= s.start && t < s.end);
            if (!activeShot) {
                if (t <= shotsData[0].start) activeShot = shotsData[0];
                else activeShot = shotsData[shotsData.length - 1];
            }
            if (currentVisibleShotId === activeShot.id) return;
            currentVisibleShotId = activeShot.id;

            shotsData.forEach(s => {
                const el = document.getElementById(\`shot_\${s.id}\`);
                if (!el) return;
                if (s.id === activeShot.id) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                    el.style.display = 'flex';
                } else {
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    el.style.display = 'none';
                }
            });
        }

        // Timeline Principale GSAP
        const tl = gsap.timeline({
            paused: true,
            onUpdate: function() {
                updateShotVisibility(tl.time());
            }
        });
        window.tl = tl;
        window.__timeline = tl;

        shotsData.forEach((s) => {
            const id = \`#shot_\${s.id}\`;
            const dur = s.end - s.start;

            // 1. Apparition et visibilité du conteneur
            tl.set(id, { display: 'flex', opacity: 1, visibility: 'visible', pointerEvents: 'auto' }, s.start);

            // 2. EFFET PENDULE CONTINUE SUR LES ELEMENTS GRAPHIQUES (Règle 17)
            // Oscillation douce comme une cloche/enseigne suspendue par le haut
            const swingCycles = Math.max(1, Math.floor(dur / 1.8));
            tl.fromTo(\`\${id} .pendulum-frame\`,
                { rotate: -1.8, y: -4 },
                { rotate: 1.8, y: 4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: swingCycles },
                s.start + 0.1
            );

            // 3. Animation d'entrée spécifique au format
            if (s.format === 'vox_impact_text') {
                tl.fromTo(\`\${id} .impact-tag\`, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, s.start + 0.15)
                  .fromTo(\`\${id} .impact-headline\`, { scale: 0.94, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.6, ease: 'power3.out' }, s.start + 0.3);
                if (s.highlightWord) {
                    tl.to(\`\${id} .vox-yellow-highlight\`, { backgroundSize: '100% 100%', duration: 1.4, ease: 'power1.inOut' }, s.start + 0.8);
                }
                if (s.author) {
                    tl.fromTo(\`\${id} .impact-author\`, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, s.start + 1.2);
                }
            } else if (s.format === 'vox_solo_photo') {
                tl.fromTo(\`\${id} .solo-frame\`, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, s.start + 0.15)
                  .fromTo(\`\${id} .solo-img\`, { scale: 1.0 }, { scale: 1.05, duration: dur, ease: 'none' }, s.start);
            } else if (s.format === 'vox_pure_video') {
                tl.fromTo(\`\${id} .video-frame\`, { scale: 0.95, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.6, ease: 'power3.out' }, s.start + 0.15)
                  .fromTo(\`\${id} .video-thermal-flash\`, { opacity: 0 }, { opacity: 0.85, duration: 0.15, yoyo: true, repeat: 1, ease: 'power4.inOut' }, s.start + 3.0);
            } else if (s.format === 'vox_archival_paper') {
                tl.fromTo(\`\${id} .paper-sheet\`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, s.start + 0.15)
                  .to(\`\${id} .paper-highlighter\`, { backgroundSize: '100% 100%', duration: 1.5, ease: 'power1.inOut' }, s.start + 0.8)
                  .fromTo(\`\${id} .paper-stamp\`, { scale: 2.2, opacity: 0, rotate: -30 }, { scale: 1.0, opacity: 0.95, rotate: -12, duration: 0.4, ease: 'back.out(2)' }, s.start + 1.8);
            } else if (s.format === 'vox_tactical_map') {
                tl.fromTo(\`\${id} .map-sidebar\`, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, s.start + 0.15)
                  .fromTo(\`\${id} .map-board\`, { scale: 0.96, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 0.6, ease: 'power2.out' }, s.start + 0.2)
                  .to(\`\${id} .tactical-arrow-1\`, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, s.start + 0.8)
                  .to(\`\${id} .tactical-arrow-2\`, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, s.start + 1.4);
            } else if (s.format === 'vox_monumental_stat') {
                tl.fromTo(\`\${id} .stat-main-label\`, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, s.start + 0.2)
                  .fromTo(\`\${id} .stat-scale-text\`, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, s.start + 1.0);
                if (s.statNum) {
                    const counterObj = { val: 0 };
                    tl.to(counterObj, {
                        val: s.statNum,
                        duration: Math.min(2.0, dur * 0.5),
                        ease: 'power2.out',
                        onUpdate: () => {
                            const el = document.querySelector(\`\${id} .stat-big-number\`);
                            if (el) el.textContent = Math.round(counterObj.val).toLocaleString('fr-FR');
                        }
                    }, s.start + 0.3);
                }
            } else if (s.format === 'vox_editorial_split') {
                tl.fromTo(\`\${id} .split-left\`, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, s.start + 0.15)
                  .fromTo(\`\${id} .split-right\`, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, s.start + 0.25)
                  .fromTo(\`\${id} .split-img\`, { scale: 1.0 }, { scale: 1.05, duration: dur, ease: 'none' }, s.start);
            }

            // 4. Sortie cinématographique nette sans trou blanc (Coupure franche instantanée au cut point)
            tl.set(id, { display: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }, s.end);
        });

        // Verrouillage déterministe de la durée totale dans GSAP
        tl.set({}, {}, DURATION);

        /**
         * Moteur de Rendu Déterministe pour le Scrubbing du Studio (win.renderAt)
         * RÈGLE ABSOLUE ANTI-SACCADE (Règles 4 & 26) :
         * Ne JAMAIS réassigner voiceAudio.currentTime ni forcer tl.seek() si la vidéo est en cours de lecture continue !
         */
        window.renderAt = function(targetTime) {
            const t = Math.max(0, Math.min(DURATION, targetTime));
            updateShotVisibility(t);

            const isPlaying = !tl.paused();
            if (!isPlaying) {
                tl.seek(t, false);
                if (voiceAudio && Math.abs(voiceAudio.currentTime - t) > 0.05) {
                    voiceAudio.currentTime = t;
                }
            }
        };

        // Synchronisation Audio Anti-Saccades (Règle 4 & Règle 26)
        window.syncAudioTimeline = function(timeInSeconds, isPlaying) {
            if (!voiceAudio) return;
            updateShotVisibility(timeInSeconds);

            if (!isPlaying) {
                if (!voiceAudio.paused) voiceAudio.pause();
                voiceAudio.currentTime = timeInSeconds;
                if (!tl.paused()) tl.pause();
                tl.seek(timeInSeconds, false);
            } else {
                if (voiceAudio.paused) {
                    voiceAudio.play().catch(() => {});
                }
                if (tl.paused()) {
                    if (typeof gsap !== 'undefined' && gsap.globalTimeline && gsap.globalTimeline.paused()) {
                        gsap.globalTimeline.resume();
                    }
                    tl.play();
                }
                // Règle 26 : STRICTEMENT AUCUNE réassignation de currentTime pendant la lecture continue !
                const drift = Math.abs(voiceAudio.currentTime - timeInSeconds);
                if (drift > 1.5) {
                    voiceAudio.currentTime = timeInSeconds;
                }
            }
        };

        window.__timelineInterface = {
            duration: () => DURATION,
            seek: (t) => window.renderAt(t),
            pause: () => {
                tl.pause();
                window.syncAudioTimeline(tl.time(), false);
            },
            play: () => {
                if (typeof gsap !== 'undefined' && gsap.globalTimeline && gsap.globalTimeline.paused()) {
                    gsap.globalTimeline.resume();
                }
                tl.play();
                window.syncAudioTimeline(tl.time(), true);
            }
        };

        window.addEventListener('load', () => {
            scaleStage();
            window.renderAt(0);
        });

        const isIframeMode = window.self !== window.top;
        if (!isIframeMode) {
            stage.style.cursor = 'pointer';
            stage.addEventListener('click', () => {
                if (tl.paused()) {
                    window.syncAudioTimeline(tl.time(), true);
                } else {
                    window.syncAudioTimeline(tl.time(), false);
                }
            });
        }
    </script>
</body>
</html>`;

    fs.writeFileSync(outFile, html, 'utf8');
    console.log(`✓ Master Documentaire Vidéo HTML généré avec succès (72 Séquences Dynamiques) : ${outFile}`);
}

if (require.main === module) {
    generateHtmlComposition();
}

module.exports = { generateHtmlComposition, SHOTS };
