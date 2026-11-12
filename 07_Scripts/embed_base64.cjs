const fs = require('fs');
const path = require('path');

// 1. Terence Howard
const terencePath = path.join(__dirname, '../04_Videos/design_terence_music_player_5s.html');
const terenceB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/terence_card_perfect_580.jpg')).toString('base64');
let terenceHtml = fs.readFileSync(terencePath, 'utf8');
terenceHtml = terenceHtml.replace(
    "cardImg.src = '../01_Assets/Images/terence_card_perfect_580.jpg';",
    `cardImg.src = 'data:image/jpeg;base64,${terenceB64}';`
);
fs.writeFileSync(terencePath, terenceHtml, 'utf8');
console.log('Terence HTML updated with inline base64!');

// 2. Travel Cards
const travelPath = path.join(__dirname, '../04_Videos/design_travel_cards_carousel_5s.html');
const turkeyB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/travel_photo_turkey.jpg')).toString('base64');
const indoB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/travel_photo_indonesia.jpg')).toString('base64');
const dubaiB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/travel_photo_dubai.jpg')).toString('base64');
const vnB64 = fs.readFileSync(path.join(__dirname, '../01_Assets/Images/travel_photo_vietnam.jpg')).toString('base64');

let travelHtml = fs.readFileSync(travelPath, 'utf8');
travelHtml = travelHtml.replace(
    "imgTurkey.src = '../01_Assets/Images/travel_photo_turkey.jpg';",
    `imgTurkey.src = 'data:image/jpeg;base64,${turkeyB64}';`
);
travelHtml = travelHtml.replace(
    "imgIndonesia.src = '../01_Assets/Images/travel_photo_indonesia.jpg';",
    `imgIndonesia.src = 'data:image/jpeg;base64,${indoB64}';`
);
travelHtml = travelHtml.replace(
    "imgDubai.src = '../01_Assets/Images/travel_photo_dubai.jpg';",
    `imgDubai.src = 'data:image/jpeg;base64,${dubaiB64}';`
);
travelHtml = travelHtml.replace(
    "imgVietnam.src = '../01_Assets/Images/travel_photo_vietnam.jpg';",
    `imgVietnam.src = 'data:image/jpeg;base64,${vnB64}';`
);
fs.writeFileSync(travelPath, travelHtml, 'utf8');
console.log('Travel HTML updated with inline base64!');
