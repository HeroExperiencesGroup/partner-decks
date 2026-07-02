/* to-presentation.js — one-shot restructure of natgeo/index.html into the
 * presentation kit shape. Keeps .slide-viewport wrappers as slide layers,
 * cleans baked-in runtime pollution, swaps chrome for splash + HUD, wires
 * presentation.css / presentation.js. Writes only if all assertions pass.
 *
 *   node tools/to-presentation.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'natgeo', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

const sectionsBefore = (html.match(/<section class="section/g) || []).length;
const wrapsBefore = (html.match(/<div class="slide-viewport">/g) || []).length;
if (sectionsBefore !== 18 || wrapsBefore !== 18) {
  console.error(`ABORT: expected 18 sections + 18 wrappers, found ${sectionsBefore} / ${wrapsBefore}`);
  process.exit(1);
}

const SPLASH = `<div id="splash">
  <p class="sp-label">National Geographic × Hero Experiences</p>
  <div class="sp-rule"></div>
  <h1 class="sp-title">The Spirit of Exploration in Arabia</h1>
  <p class="sp-sub">United Arab Emirates · 2026</p>
  <div class="sp-toggle">
    <div class="sp-toggle-row">
      <span class="sp-toggle-label">Progressive Reveals</span>
      <label class="switch"><input type="checkbox" id="progToggle"><span class="track"></span><span class="thumb"></span></label>
      <span class="sp-toggle-state" id="progState">Off</span>
    </div>
    <p class="sp-toggle-desc" id="progDesc">Reveal slide content step by step as you click. Off shows each slide in full.</p>
  </div>
  <button class="sp-btn" id="beginBtn">Begin Presentation</button>
  <p class="sp-hint">Right / Down / Space advance · Left / Up back · Esc returns here</p>
  <p class="sp-device-note">Desktop or laptop recommended. Mobile opens fullscreen landscape for review.</p>
</div>`;

const HUD = `<div id="hud"></div>
<div id="progress"></div>
<div id="dots"></div>
<div id="counter">1 / 1</div>
<div id="slideRail" aria-label="Slide navigation"></div>
<button id="exitFs">Exit fullscreen</button>`;

/* 1. Wrappers -> slide layers, carrying the section's data-slide up. */
html = html.replace(
  /<div class="slide-viewport">(<section class="section[^"]*"[^>]*?\bdata-slide="(\d+)"[^>]*?>)/g,
  '<div class="slide-viewport slide" data-slide="$2">$1'
);

/* 2. Strip baked-in runtime pollution. */
html = html.replace(/\s*transform:\s*translate\([^)]*\)\s+scale\([^)]*\);?/g, '');
html = html.replace(/(\sstyle="[^"]*?)\s+"/g, '$1"');   // trailing space in style
html = html.replace(/\sstyle="\s*;?\s*"/g, '');          // empty style
html = html.replace(/\sclass="is-loaded"/g, '');
html = html.replace(/(\sclass="[^"]*?)\s+is-loaded\b/g, '$1');
html = html.replace(/(\sclass=")is-loaded\s+/g, '$1');
html = html.replace(/\scontenteditable="(?:true|false)"/g, '');
html = html.replace(/(\ssrc="[^"]*?)\?v=\d+"/g, '$1"');
html = html.replace(/<body\s+data-editor="true"[^>]*>/g, '<body>');

/* 3. Head: add presentation.css after components.css. */
html = html.replace(
  /(<link rel="stylesheet" href="\.\.\/shared\/css\/components\.css">)/,
  '$1\n<link rel="stylesheet" href="../shared/css/presentation.css">'
);

/* 4. Chrome -> splash + open #deck > #stage (removes review-banner + rotate-hint). */
html = html.replace(
  /(<a href="#sec-cover" class="skip-link">Skip to deck<\/a>)[\s\S]*?<main class="deck" id="deck"[^>]*>/,
  `$1\n\n${SPLASH}\n\n<div id="deck">\n<div id="stage">\n`
);

/* 5. Close -> close #stage + HUD + close #deck (removes top-nav). */
html = html.replace(
  /<\/main>\s*<nav class="top-nav"[\s\S]*?<\/nav>/,
  `</div><!-- /#stage -->\n\n${HUD}\n</div><!-- /#deck -->`
);

/* 6. Add presentation.js before deck.js. */
html = html.replace(
  /(<script src="\.\.\/shared\/js\/deck\.js"[^>]*><\/script>)/,
  '<script src="../shared/js/presentation.js" defer></script>\n$1'
);

/* ---- Assertions ---- */
const checks = [
  ['18 slide layers', (html.match(/<div class="slide-viewport slide" data-slide="\d+">/g) || []).length === 18],
  ['18 sections kept', (html.match(/<section class="section/g) || []).length === 18],
  ['no section scaling transform', !/transform:\s*translate\([^)]*\)\s+scale\(/.test(html)],
  ['no is-loaded', !/\bis-loaded\b/.test(html)],
  ['no contenteditable', !/contenteditable=/.test(html)],
  ['no ?v= busters', !/\?v=\d+"/.test(html)],
  ['no review-banner', !/class="review-banner"/.test(html)],
  ['no rotate-hint', !/class="rotate-hint"/.test(html)],
  ['no top-nav', !/class="top-nav"/.test(html)],
  ['no <main', !/<main\b/.test(html)],
  ['#splash present', /id="splash"/.test(html)],
  ['#deck present', /id="deck"/.test(html)],
  ['#stage present', /id="stage"/.test(html)],
  ['#hud present', /id="hud"/.test(html)],
  ['beginBtn present', /id="beginBtn"/.test(html)],
  ['presentation.css linked', /shared\/css\/presentation\.css/.test(html)],
  ['presentation.js linked', /shared\/js\/presentation\.js/.test(html)],
  ['div balance', (html.match(/<div\b/g) || []).length === (html.match(/<\/div>/g) || []).length]
];
let ok = true;
checks.forEach(([name, pass]) => { console.log((pass ? 'PASS ' : 'FAIL ') + name); if (!pass) ok = false; });

if (!ok) { console.error('\nABORT: assertions failed, file NOT written.'); process.exit(1); }

fs.writeFileSync(FILE, html, 'utf8');
console.log('\nWritten: ' + FILE);
