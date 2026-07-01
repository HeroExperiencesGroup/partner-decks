/* convert-image.js — used by save-server.py's /replace-image endpoint.
 *
 * Converts one input image into WebP + optimised JPG at <=1920px wide,
 * matching the deck's image convention (WebP + JPG fallback).
 *
 * Usage:  node tools/convert-image.js <input> <outDir> <baseName>
 * Prints: JSON { ok, webp, jpg, width, height }  (paths absolute)
 */

const sharp = require('sharp');
const path  = require('path');

async function main() {
  const [input, outDir, base] = process.argv.slice(2);
  if (!input || !outDir || !base) {
    console.log(JSON.stringify({ ok: false, error: 'usage: convert-image.js <input> <outDir> <baseName>' }));
    process.exit(1);
  }

  const webpPath = path.join(outDir, base + '.webp');
  const jpgPath  = path.join(outDir, base + '.jpg');

  try {
    const img  = sharp(input).rotate();               // respect EXIF orientation
    const meta = await img.metadata();
    const resize = { width: 1920, withoutEnlargement: true };

    const [webpInfo] = await Promise.all([
      sharp(input).rotate().resize(resize).webp({ quality: 82 }).toFile(webpPath),
      sharp(input).rotate().resize(resize).jpeg({ quality: 82, mozjpeg: true }).toFile(jpgPath)
    ]);

    console.log(JSON.stringify({
      ok: true,
      webp: webpPath,
      jpg: jpgPath,
      width: webpInfo.width,
      height: webpInfo.height,
      sourceWidth: meta.width || null,
      sourceHeight: meta.height || null
    }));
  } catch (e) {
    console.log(JSON.stringify({ ok: false, error: String(e.message || e) }));
    process.exit(1);
  }
}

main();
