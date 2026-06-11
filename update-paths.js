// update-paths.js — rewrite image src paths in index.html to WebP
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'natgeo/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const replacements = [
  // Root images
  ['assets/images/01-cover.jpg',          'assets/images/01-cover.webp'],
  ['assets/images/02-paradox.jpg',        'assets/images/02-paradox.webp'],
  ['assets/images/03-5-arabia.jpg',       'assets/images/03-5-arabia.webp'],
  ['assets/images/03-vision.jpg',         'assets/images/03-vision.webp'],
  ['assets/images/05a-hero.jpg',          'assets/images/05a-hero.webp'],
  ['assets/images/07-solution.jpg',       'assets/images/07-solution.webp'],
  ['assets/images/08-5-conservation.jpg', 'assets/images/08-5-conservation.webp'],
  ['assets/images/08-5-culture.jpg',      'assets/images/08-5-culture.webp'],
  ['assets/images/08-5-education.jpg',    'assets/images/08-5-education.webp'],
  ['assets/images/11-horizon.jpg',        'assets/images/11-horizon.webp'],
  ['assets/images/13-closing.jpg',        'assets/images/13-closing.webp'],

  // Newly added photos — flatten + new names
  ['assets/images/Newly added photos/Atmosphere_Left_Pair1_Heritage Arabic coffee welcome.jpg', 'assets/images/Atmosphere_Left_Pair1.webp'],
  ['assets/images/Newly added photos/Atmosphere_Left_Pair2_Platinum.jpg',                       'assets/images/Atmosphere_Left_Pair2.webp'],
  ['assets/images/Newly added photos/Atmosphere_Left_Pair3_Heritage Dinner - Platinum Heritage (110).jpg', 'assets/images/Atmosphere_Left_Pair3.webp'],
  ['assets/images/Newly added photos/Atmosphere_left_Pair4_DrummingHeritage .jpg',              'assets/images/Atmosphere_Left_Pair4.webp'],
  ['assets/images/Newly added photos/Atmosphere_Right_Pair1.png',                               'assets/images/Atmosphere_Right_Pair1.webp'],
  ['assets/images/Newly added photos/Atmosphere_Right_Pair2.png',                               'assets/images/Atmosphere_Right_Pair2.webp'],
  ['assets/images/Newly added photos/Atmosphere_Right_Pair3.png',                               'assets/images/Atmosphere_Right_Pair3.webp'],
  ['assets/images/Newly added photos/Atmosphere_Right_Pair4.png',                               'assets/images/Atmosphere_Right_Pair4.webp'],
  ['assets/images/Newly added photos/Camels - Platinum Heritage (27).jpg',                      'assets/images/Camels-Platinum-27.webp'],
  ['assets/images/Newly added photos/Campfire - Platinum Heritage (27).jpg',                    'assets/images/Campfire-Platinum-27.webp'],
  ['assets/images/Newly added photos/Falcons - Platinum Heritage (100).png',                    'assets/images/Falcons-Platinum-100.webp'],
  ['assets/images/Newly added photos/Pair 2 (Habitat).png',                                     'assets/images/Practice_Habitat.webp'],
  ['assets/images/Newly added photos/Pair 3 (Evening).jpg',                                     'assets/images/Practice_Evening.webp'],
  ['assets/images/Newly added photos/Place_Right_DDCR - Platinum Heritage (36).JPG',            'assets/images/Place_Right_DDCR.webp'],
  ['assets/images/Newly added photos/Place_left.png',                                           'assets/images/Place_Left.webp'],
  ['assets/images/Newly added photos/Practice_Right_Dune Bashing.png',                         'assets/images/Practice_DuneBashing.webp'],
  ['assets/images/Newly added photos/Practice_left_Range Rovers - Platinum.jpg',                'assets/images/Practice_RangeRovers.webp'],
  ['assets/images/Newly added photos/Slide10_Platinum Desert Oasis.jpg',                        'assets/images/Slide10_Platinum.webp'],
  ['assets/images/Newly added photos/Slide10_heritage.jpg',                                     'assets/images/Slide10_Heritage.webp'],
];

for (const [from, to] of replacements) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  html = html.replace(re, to);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Paths updated.');
