// convert-webp.js — convert all deck images to WebP, output flat to natgeo/assets/images/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'natgeo/assets/images');
const ARCHIVE_DIR = path.join(__dirname, 'natgeo/assets/Archive/originals');

// All images referenced in index.html, with their output filename
const images = [
  // Root images → same name, .webp
  { src: 'natgeo/assets/images/01-cover.jpg',             out: '01-cover.webp' },
  { src: 'natgeo/assets/images/02-paradox.jpg',           out: '02-paradox.webp' },
  { src: 'natgeo/assets/images/03-5-arabia.jpg',          out: '03-5-arabia.webp' },
  { src: 'natgeo/assets/images/03-vision.jpg',            out: '03-vision.webp' },
  { src: 'natgeo/assets/images/05a-hero.jpg',             out: '05a-hero.webp' },
  { src: 'natgeo/assets/images/07-solution.jpg',          out: '07-solution.webp' },
  { src: 'natgeo/assets/images/08-5-conservation.jpg',    out: '08-5-conservation.webp' },
  { src: 'natgeo/assets/images/08-5-culture.jpg',         out: '08-5-culture.webp' },
  { src: 'natgeo/assets/images/08-5-education.jpg',       out: '08-5-education.webp' },
  { src: 'natgeo/assets/images/11-horizon.jpg',           out: '11-horizon.webp' },
  { src: 'natgeo/assets/images/13-closing.jpg',           out: '13-closing.webp' },

  // Newly added photos → flatten to images root
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Left_Pair1_Heritage Arabic coffee welcome.jpg', out: 'Atmosphere_Left_Pair1.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Left_Pair2_Platinum.jpg',                       out: 'Atmosphere_Left_Pair2.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Left_Pair3_Heritage Dinner - Platinum Heritage (110).jpg', out: 'Atmosphere_Left_Pair3.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_left_Pair4_DrummingHeritage .jpg',              out: 'Atmosphere_Left_Pair4.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Right_Pair1.png',                               out: 'Atmosphere_Right_Pair1.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Right_Pair2.png',                               out: 'Atmosphere_Right_Pair2.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Right_Pair3.png',                               out: 'Atmosphere_Right_Pair3.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Atmosphere_Right_Pair4.png',                               out: 'Atmosphere_Right_Pair4.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Camels - Platinum Heritage (27).jpg',                      out: 'Camels-Platinum-27.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Campfire - Platinum Heritage (27).jpg',                    out: 'Campfire-Platinum-27.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Falcons - Platinum Heritage (100).png',                    out: 'Falcons-Platinum-100.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Pair 2 (Habitat).png',                                     out: 'Practice_Habitat.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Pair 3 (Evening).jpg',                                     out: 'Practice_Evening.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Place_Right_DDCR - Platinum Heritage (36).JPG',            out: 'Place_Right_DDCR.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Place_left.png',                                           out: 'Place_Left.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Practice_Right_Dune Bashing.png',                          out: 'Practice_DuneBashing.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Practice_left_Range Rovers - Platinum.jpg',                out: 'Practice_RangeRovers.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Slide10_Platinum Desert Oasis.jpg',                        out: 'Slide10_Platinum.webp' },
  { src: 'natgeo/assets/images/Newly added photos/Slide10_heritage.jpg',                                     out: 'Slide10_Heritage.webp' },
];

fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

async function convert() {
  let ok = 0, fail = 0;
  for (const { src, out } of images) {
    const srcPath = path.join(__dirname, src);
    const outPath = path.join(IMAGES_DIR, out);
    if (!fs.existsSync(srcPath)) { console.warn('MISSING:', src); fail++; continue; }
    try {
      await sharp(srcPath).webp({ quality: 82 }).toFile(outPath);
      const srcStat = fs.statSync(srcPath);
      const outStat = fs.statSync(outPath);
      const saving = Math.round((1 - outStat.size / srcStat.size) * 100);
      console.log(`✓ ${out}  (${Math.round(outStat.size/1024)}KB, ${saving > 0 ? '-'+saving+'%' : '+'+Math.abs(saving)+'%'})`);
      ok++;
    } catch (e) {
      console.error('FAIL:', src, e.message);
      fail++;
    }
  }

  // Archive original root jpgs (not the Newly added photos subfolder)
  const rootOriginals = images
    .filter(i => !i.src.includes('Newly added photos'))
    .map(i => path.join(__dirname, i.src));

  for (const p of rootOriginals) {
    if (fs.existsSync(p)) {
      const dest = path.join(ARCHIVE_DIR, path.basename(p));
      fs.renameSync(p, dest);
      console.log(`  archived: ${path.basename(p)}`);
    }
  }

  console.log(`\nDone: ${ok} converted, ${fail} failed.`);
}

convert().catch(console.error);
