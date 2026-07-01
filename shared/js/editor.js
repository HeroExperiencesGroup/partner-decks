/* editor.js — personal in-browser slide editor
 *
 * Served by tools/save-server.py. Toggle with E.
 *
 * Floating panel — drag by its header, snaps to the nearest corner,
 * position + collapsed state remembered. Sections reveal contextually.
 *
 * Selection:
 *   Click text          — select element
 *   Shift+click         — multi-select
 *   "Edit Text"         — enter typing mode
 *   Click image         — select image → brief panel
 *   Esc                 — step back (typing → image → selection)
 *   Alt+↑↓←→            — nudge selected (2px; Shift = 10px)
 *   Ctrl+Z / Ctrl+⇧+Z   — undo / redo
 *   P                   — pin mode; click slide to drop coord marker
 *
 * Git (branches): pick a branch to switch (page reloads), or "+" to create.
 *   Switching is blocked if there are uncommitted edits — Save first.
 *
 * Save & Commit — writes DOM to natgeo/index.html, commits, pushes.
 * Export Brief  — image replacements + pins + notes → editor-brief.json.
 *
 * TO DISABLE FOR CLIENT: remove the two lines tagged
 * data-editor-remove in natgeo/index.html.
 */

(function () {
  'use strict';

  /* Same-origin relative endpoints — work on whatever port save-server uses */
  var SAVE_URL     = '/save';
  var BRIEF_URL    = '/brief';
  var REPLACE_URL  = '/replace-image';
  var BRANCHES_URL = '/git/branches';
  var SWITCH_URL   = '/git/switch';
  var NEWBR_URL    = '/git/branch';

  var STORE_KEY = 'partner-decks:editor-v1';
  var PANEL_KEY = 'partner-decks:editor-panel';

  var doc   = document;
  var body  = doc.body;
  var store = {};
  var originals = {};
  var panel = null;
  var isOn  = false;

  /* Text selection */
  var activeEl    = null;
  var selectedEls = [];
  var isTyping    = false;
  var typingSnap  = null;

  /* Image brief */
  var activeImg  = null;
  var briefItems = [];

  /* Pins */
  var pinMode  = false;
  var pins     = [];
  var pinCount = 0;

  /* Undo / redo */
  var undoStack = [];
  var redoStack = [];
  var MAX_HISTORY = 60;

  var EDITABLE = [
    '.section-label', '.headline', '.subhead',
    '.body p', '.pull', '.caption', '.declaration',
    '.close-line', '.landscape-tab__caption', '.cover-label',
    '.overlay h2', '.overlay p',
    '.splash__title', '.splash__subtitle'
  ].join(', ');

  /* ================================================
   * Helpers
   * ================================================ */

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }
  function qs(sel, root) { return (root || doc).querySelector(sel); }

  function loadLS(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function saveLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function load() { store = loadLS(STORE_KEY, {}); }
  function save() { saveLS(STORE_KEY, store); }

  /* ================================================
   * Element IDs
   * ================================================ */

  function assignIds() {
    qsa('.section').forEach(function (section) {
      var sid = section.id || 'global';
      qsa(EDITABLE, section).forEach(function (el, i) {
        el.dataset.eid = sid + ':' + i;
        originals[el.dataset.eid] = el.innerHTML;
        el.addEventListener('mousedown', function (e) {
          if (isOn && !isTyping && !pinMode) e.preventDefault();
        });
      });
    });
  }

  /* Placeholder image slots — coloured/gradient blocks awaiting a photo.
   * Matched: any *--placeholder element, or a .swap-panel with no <picture>. */
  var PLACEHOLDER_SEL = '[class*="--placeholder"], .swap-panel';

  function assignImgIds() {
    qsa('.section').forEach(function (section) {
      var sid = section.id || 'global';

      /* Real images */
      qsa('picture', section).forEach(function (pic, i) {
        tagSlot(pic, sid + ':pic:' + i, section);
      });

      /* Empty placeholder slots (no <picture> inside) */
      qsa(PLACEHOLDER_SEL, section).forEach(function (el, i) {
        if (el.querySelector('picture')) return;      /* already has an image */
        if (el.closest('picture')) return;            /* part of a picture */
        el.dataset.iidPlaceholder = 'true';
        tagSlot(el, sid + ':ph:' + i, section);
      });
    });
  }

  function tagSlot(el, iid, section) {
    el.dataset.iid         = iid;
    el.dataset.iidSelector = buildSlotSelector(el);
    el.dataset.iidSection  = section.id || 'global';
    el.dataset.iidSlide    = section.dataset.slide || '';
    var tp = el.closest('[data-tab]');
    el.dataset.iidTab = tp ? tp.getAttribute('data-tab') : '';
  }

  function buildSlotSelector(el) {
    var section  = el.closest('.section');
    var tabPanel = el.closest('[data-tab]');
    var base     = section && section.id ? '#' + section.id : '';
    if (tabPanel) base += ' [data-tab="' + tabPanel.getAttribute('data-tab') + '"]';
    var swap = el.getAttribute && el.getAttribute('data-swap-panel');
    if (swap) return base + ' [data-swap-panel="' + swap + '"]';
    if (el.tagName === 'PICTURE') {
      var ctx = tabPanel || section || doc;
      var idx = qsa('picture', ctx).indexOf(el);
      return base + ' picture' + (idx > 0 ? ':nth-of-type(' + (idx + 1) + ')' : '');
    }
    var cls = (el.className || '').trim().split(/\s+/)[0];
    return base + (cls ? ' .' + cls : '');
  }

  function isPlaceholderSlot(el) {
    return !!(el && el.dataset && el.dataset.iidPlaceholder);
  }

  function getImgSrc(slot) {
    var img = slot.querySelector ? slot.querySelector('img') : null;
    return img ? (img.getAttribute('src') || '') : '';
  }
  function getImgSources(slot) {
    return qsa('source', slot).map(function (s) {
      return { type: s.getAttribute('type'), srcset: s.getAttribute('srcset') };
    });
  }

  /* ================================================
   * Coordinates
   * ================================================ */

  function screenToCanvas(section, sx, sy) {
    var r = section.getBoundingClientRect();
    return {
      x: Math.round(Math.max(0, Math.min(1920, (sx - r.left) * 1920 / r.width))),
      y: Math.round(Math.max(0, Math.min(1080, (sy - r.top)  * 1080 / r.height)))
    };
  }
  function updateCoordDisplay(x, y) {
    var el = qs('#etb-coords');
    if (el) el.textContent = x !== null ? 'x ' + x + '  y ' + y : '— —';
  }

  /* ================================================
   * Pins
   * ================================================ */

  function setPinMode(on) {
    pinMode = on;
    body.setAttribute('data-editor-pin', on ? 'true' : 'false');
    var btn = qs('#etb-pin-toggle');
    if (btn) {
      btn.textContent = on ? '📍 Pinning…' : '📍 Pin';
      btn.classList.toggle('etb-btn-active', on);
    }
  }

  function dropPin(section, sx, sy) {
    var c  = screenToCanvas(section, sx, sy);
    var n  = ++pinCount;
    var el = doc.createElement('div');
    el.className  = 'editor-pin';
    el.style.left = c.x + 'px';
    el.style.top  = c.y + 'px';
    el.innerHTML  =
      '<div class="editor-pin__cross"></div>' +
      '<div class="editor-pin__label"><span class="editor-pin__num">' +
      n + '</span> ' + c.x + ', ' + c.y + '</div>';
    el.title = 'Pin ' + n + ' — ' + c.x + ', ' + c.y + ' (click to remove)';
    el.addEventListener('click', function (e) { e.stopPropagation(); removePin(el); });
    section.appendChild(el);
    pins.push({ el: el, num: n, sectionId: section.id,
                slide: parseInt(section.dataset.slide) || 0, cx: c.x, cy: c.y });
    updatePinBtn();
  }

  function removePin(el) {
    pins = pins.filter(function (p) {
      if (p.el === el) { el.parentNode && el.parentNode.removeChild(el); return false; }
      return true;
    });
    updatePinBtn();
  }

  function clearAllPins() {
    pins.forEach(function (p) { p.el.parentNode && p.el.parentNode.removeChild(p.el); });
    pins = []; pinCount = 0;
    updatePinBtn();
  }

  function updatePinBtn() {
    var btn = qs('#etb-pin-clear');
    if (btn) { btn.hidden = !pins.length; btn.textContent = 'Clear (' + pins.length + ')'; }
  }

  /* ================================================
   * State snapshot + undo/redo
   * ================================================ */

  function snapState(el) {
    var d = store[el.dataset.eid] || {};
    return { html: el.innerHTML, fontSize: el.style.fontSize || null,
             nudgeX: d.nudgeX || 0, nudgeY: d.nudgeY || 0 };
  }

  function applyState(eid, s) {
    var el = qs('[data-eid="' + eid + '"]'); if (!el) return;
    el.innerHTML = s.html;
    el.style.fontSize = s.fontSize || '';
    applyTransform(el, s.nudgeX || 0, s.nudgeY || 0);
    var d = store[eid] || {};
    d.html = s.html; d.fontSize = s.fontSize;
    d.nudgeX = s.nudgeX || 0; d.nudgeY = s.nudgeY || 0;
    store[eid] = d; save(); refreshPanel();
  }

  function applyTransform(el, x, y) {
    if (x === 0 && y === 0) { el.style.position = ''; el.style.transform = ''; }
    else { el.style.position = 'relative'; el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
  }

  function pushHistory(entries) {
    var changed = entries.filter(function (e) {
      return JSON.stringify(e.before) !== JSON.stringify(e.after);
    });
    if (!changed.length) return;
    undoStack.push(changed);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    refreshUndoButtons();
  }
  function undo() {
    var e = undoStack.pop(); if (!e) return;
    e.forEach(function (i) { applyState(i.eid, i.before); });
    redoStack.push(e); refreshUndoButtons();
  }
  function redo() {
    var e = redoStack.pop(); if (!e) return;
    e.forEach(function (i) { applyState(i.eid, i.after); });
    undoStack.push(e); refreshUndoButtons();
  }
  function refreshUndoButtons() {
    var u = qs('#etb-undo'); var r = qs('#etb-redo');
    if (u) u.disabled = !undoStack.length;
    if (r) r.disabled = !redoStack.length;
  }

  function applyAll() {
    Object.keys(store).forEach(function (eid) {
      var el = qs('[data-eid="' + eid + '"]'); if (!el) return;
      var d = store[eid];
      if (d.html     != null) el.innerHTML = d.html;
      if (d.fontSize != null) el.style.fontSize = d.fontSize;
      applyTransform(el, d.nudgeX || 0, d.nudgeY || 0);
    });
  }

  /* ================================================
   * Edit mode
   * ================================================ */

  function setMode(on) {
    isOn = on;
    body.setAttribute('data-editor', on ? 'true' : 'false');
    var banner = qs('#editor-banner');
    if (banner) banner.hidden = !on;
    if (panel) panel.hidden = !on;
    if (on && !panel._branchesLoaded) loadBranches();
    if (!on) { deactivateAll(); deselectImage(); setPinMode(false); }
  }

  /* ================================================
   * Text selection
   * ================================================ */

  function isSelected(el) { return selectedEls.indexOf(el) !== -1; }

  function selectPrimary(el) {
    deselectImage();
    if (isTyping) exitTyping();
    selectedEls.forEach(function (s) {
      s.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = [el]; activeEl = el;
    el.classList.add('editor-selected');
    refreshPanel();
  }

  function toggleSecondary(el) {
    if (el === activeEl) return;
    if (isSelected(el)) {
      selectedEls = selectedEls.filter(function (e) { return e !== el; });
      el.classList.remove('editor-in-selection');
    } else {
      selectedEls.push(el); el.classList.add('editor-in-selection');
    }
    refreshPanel();
  }

  function deactivateAll() {
    if (isTyping) exitTyping();
    selectedEls.forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = []; activeEl = null;
    refreshPanel();
  }

  /* ================================================
   * Typing mode
   * ================================================ */

  function enterTyping() {
    if (!activeEl || isTyping) return;
    isTyping = true; typingSnap = snapState(activeEl);
    activeEl.contentEditable = 'true';
    activeEl.classList.add('editor-typing');
    activeEl.focus();
    activeEl._edMD = function (e) { e.stopPropagation(); };
    activeEl.addEventListener('mousedown', activeEl._edMD);
    activeEl._edIn = function () {
      var d = store[activeEl.dataset.eid] || {};
      d.html = activeEl.innerHTML; store[activeEl.dataset.eid] = d; save();
    };
    activeEl.addEventListener('input', activeEl._edIn);
    refreshPanel();
  }

  function exitTyping() {
    if (!isTyping || !activeEl) return;
    pushHistory([{ eid: activeEl.dataset.eid, before: typingSnap, after: snapState(activeEl) }]);
    typingSnap = null;
    activeEl.contentEditable = 'false';
    activeEl.classList.remove('editor-typing');
    if (activeEl._edMD) { activeEl.removeEventListener('mousedown', activeEl._edMD); delete activeEl._edMD; }
    if (activeEl._edIn) { activeEl.removeEventListener('input', activeEl._edIn); delete activeEl._edIn; }
    isTyping = false; refreshPanel();
  }

  function toggleTyping() { if (isTyping) exitTyping(); else enterTyping(); }

  /* ================================================
   * Font size + nudge + reset
   * ================================================ */

  function getSize(el) {
    var v = parseFloat(el.style.fontSize);
    return isNaN(v) ? parseFloat(window.getComputedStyle(el).fontSize) : v;
  }

  function stepSize(el, dir) {
    var before = snapState(el);
    var cur = getSize(el);
    var step = cur >= 48 ? 4 : cur >= 24 ? 2 : 1;
    el.style.fontSize = Math.max(6, Math.round(cur + dir * step)) + 'px';
    var d = store[el.dataset.eid] || {};
    d.fontSize = el.style.fontSize; store[el.dataset.eid] = d; save();
    pushHistory([{ eid: el.dataset.eid, before: before, after: snapState(el) }]);
    refreshPanel();
  }

  function nudgeAll(dx, dy) {
    if (!selectedEls.length) return;
    var entries = selectedEls.map(function (el) {
      return { eid: el.dataset.eid, before: snapState(el), el: el };
    });
    selectedEls.forEach(function (el) {
      var d = store[el.dataset.eid] || {};
      d.nudgeX = (d.nudgeX || 0) + dx; d.nudgeY = (d.nudgeY || 0) + dy;
      store[el.dataset.eid] = d; applyTransform(el, d.nudgeX, d.nudgeY);
    });
    save();
    pushHistory(entries.map(function (e) {
      return { eid: e.eid, before: e.before, after: snapState(e.el) };
    }));
    refreshPanel();
  }

  function getNudge(el) {
    var d = store[el.dataset.eid] || {};
    return { x: d.nudgeX || 0, y: d.nudgeY || 0 };
  }

  function resetSelection() {
    if (!selectedEls.length) return;
    if (isTyping) exitTyping();
    var entries = selectedEls.map(function (el) {
      return { eid: el.dataset.eid, before: snapState(el), el: el };
    });
    selectedEls.forEach(function (el) {
      var eid = el.dataset.eid; delete store[eid];
      el.innerHTML = originals[eid] != null ? originals[eid] : el.innerHTML;
      el.style.fontSize = ''; el.style.position = ''; el.style.transform = '';
    });
    save();
    pushHistory(entries.map(function (e) {
      return { eid: e.eid, before: e.before, after: snapState(e.el) };
    }));
    refreshPanel();
  }

  function resetAll() {
    if (!confirm('Reset ALL edits and reload?')) return;
    store = {}; save(); location.reload();
  }

  /* ================================================
   * Image brief
   * ================================================ */

  function selectImage(pic) {
    deactivateAll();
    if (activeImg) activeImg.classList.remove('editor-img-selected');
    activeImg = pic;
    pic.classList.add('editor-img-selected');
    refreshPanel();
    setTimeout(function () { var n = qs('#etb-img-note'); if (n) n.focus(); }, 50);
  }

  function deselectImage() {
    if (activeImg) { activeImg.classList.remove('editor-img-selected'); activeImg = null; }
    refreshPanel();
  }

  function addToBrief() {
    if (!activeImg) return;
    var note  = (qs('#etb-img-note') || {}).value || '';
    var iid   = activeImg.dataset.iid;
    var found = briefItems.filter(function (b) { return b.iid === iid; })[0];
    if (found) {
      found.note = note.trim();
    } else {
      briefItems.push({
        iid:         iid,
        slideNumber: parseInt(activeImg.dataset.iidSlide) || null,
        sectionId:   activeImg.dataset.iidSection || '',
        tabContext:  activeImg.dataset.iidTab || null,
        currentFile: 'natgeo/' + getImgSrc(activeImg).replace(/^\//, ''),
        imgSelector: activeImg.dataset.iidSelector + ' img',
        picSelector: activeImg.dataset.iidSelector,
        sources:     getImgSources(activeImg),
        note:        note.trim()
      });
    }
    refreshBriefBadge();
    var btn = qs('#etb-img-add');
    if (btn) {
      var o = btn.textContent;
      btn.textContent = '✓ Added'; btn.classList.add('etb-btn-active');
      setTimeout(function () { btn.textContent = o; btn.classList.remove('etb-btn-active'); }, 1400);
    }
  }

  function removeFromBrief(iid) {
    briefItems = briefItems.filter(function (b) { return b.iid !== iid; });
    refreshBriefBadge(); refreshPanel();
  }
  function isInBrief(pic) {
    return pic && briefItems.some(function (b) { return b.iid === pic.dataset.iid; });
  }
  function refreshBriefBadge() {
    var badge = qs('#etb-brief-badge');
    if (badge) { badge.hidden = !briefItems.length; badge.textContent = briefItems.length; }
    var btn = qs('#etb-export-brief');
    if (btn) btn.classList.toggle('etb-has-items', briefItems.length > 0);
    renderBriefList();
  }

  function renderBriefList() {
    var sec  = qs('#ep-sec-brief');
    var list = qs('#ep-brief-list');
    var cnt  = qs('#ep-brief-count');
    if (!sec || !list) return;
    sec.hidden = briefItems.length === 0;
    if (cnt) cnt.textContent = briefItems.length;
    list.innerHTML = '';
    briefItems.forEach(function (b) {
      var row = doc.createElement('div');
      row.className = 'ep-brief-item';
      var meta = 'S' + (b.slideNumber || '?') +
                 (b.tabContext ? ' · ' + b.tabContext : '') +
                 ' · ' + (b.currentFile || '').split('/').pop();
      row.innerHTML =
        '<div class="ep-brief-item__head">' +
          '<span class="ep-brief-item__meta">' + escapeHtml(meta) + '</span>' +
          '<span class="ep-brief-item__actions">' +
            '<button data-brief-revise="' + b.iid + '" title="Revise (select this image)">✎</button>' +
            '<button data-brief-del="' + b.iid + '" title="Delete from brief" class="etb-btn-danger">✕</button>' +
          '</span>' +
        '</div>' +
        '<div class="ep-brief-item__note">' + (escapeHtml(b.note) || '<em>(no note)</em>') + '</div>';
      list.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function reviseBriefItem(iid) {
    var pic = qs('[data-iid="' + iid + '"]');
    if (!pic) { setStatus('That image is no longer on the page', 'error'); return; }
    selectImage(pic);
    pic.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var note = qs('#etb-img-note');
    var item = briefItems.filter(function (b) { return b.iid === iid; })[0];
    if (note && item) note.value = item.note || '';
  }

  /* ================================================
   * Drop-to-replace — convert + place via save-server,
   * then swap the live <picture> sources for THIS image only.
   * ================================================ */

  function initDropzone(p) {
    var dz = qs('#ep-dropzone', p);
    var fi = qs('#ep-file-input', p);
    if (!dz || !fi) return;

    dz.addEventListener('click', function () { fi.click(); });
    fi.addEventListener('change', function () {
      if (fi.files && fi.files[0]) replaceImageFromFile(fi.files[0]);
      fi.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (evt) {
      dz.addEventListener(evt, function (e) {
        e.preventDefault(); e.stopPropagation();
        dz.classList.add('is-dragover');
      });
    });
    ['dragleave', 'dragend'].forEach(function (evt) {
      dz.addEventListener(evt, function (e) {
        e.preventDefault(); e.stopPropagation();
        dz.classList.remove('is-dragover');
      });
    });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation();
      dz.classList.remove('is-dragover');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) replaceImageFromFile(f);
    });
  }

  function replaceImageFromFile(file) {
    if (!activeImg) { setStatus('Select an image first', 'error'); return; }
    if (!/^image\//.test(file.type)) { setStatus('Not an image file', 'error'); return; }

    var targetPic = activeImg;                 /* lock the target now */
    var src         = getImgSrc(targetPic);
    var currentFile = src ? 'natgeo/' + src.replace(/^\//, '') : '';
    var targetDir   = currentFile ? currentFile.substring(0, currentFile.lastIndexOf('/'))
                                  : 'natgeo/assets/images';

    setStatus('Converting ' + file.name + '…', 'pending');
    var dz = qs('#ep-dropzone'); if (dz) dz.classList.add('is-busy');

    var reader = new FileReader();
    reader.onload = function () {
      fetch(REPLACE_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: reader.result, targetDir: targetDir, baseName: file.name })
      })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (dz) dz.classList.remove('is-busy');
        if (!r.ok) { setStatus('✗ ' + (r.error || 'Replace failed'), 'error'); return; }
        updatePictureSources(targetPic, r.webp, r.jpg, r.width, r.height);
        setStatus('✓ Replaced → ' + r.base + '.webp (Save & Commit to keep)', 'ok');
        if (targetPic === activeImg) refreshPanel();
      })
      .catch(function () {
        if (dz) dz.classList.remove('is-busy');
        setStatus('✗ Server unreachable — run save-server.py', 'error');
      });
    };
    reader.readAsDataURL(file);
  }

  function makeSources(webpRel, jpgRel) {
    var sWebp = doc.createElement('source');
    sWebp.setAttribute('type', 'image/webp');
    sWebp.setAttribute('srcset', webpRel);
    var sJpg = doc.createElement('source');
    sJpg.setAttribute('type', 'image/jpeg');
    sJpg.setAttribute('srcset', jpgRel);
    return [sWebp, sJpg];
  }

  function updatePictureSources(slot, webpRel, jpgRel, w, h) {
    var bust = '?v=' + Date.now();

    if (slot.tagName === 'PICTURE') {
      /* Existing image — swap sources + img in place. */
      qsa('source', slot).forEach(function (s) { s.parentNode.removeChild(s); });
      var img = slot.querySelector('img');
      var src = makeSources(webpRel, jpgRel);
      if (img) {
        slot.insertBefore(src[0], img);
        slot.insertBefore(src[1], img);
        img.setAttribute('src', jpgRel + bust);
        img.removeAttribute('srcset');
        if (w) img.setAttribute('width', w);
        if (h) img.setAttribute('height', h);
      } else {
        slot.appendChild(src[0]); slot.appendChild(src[1]);
      }
      return;
    }

    /* Placeholder container — inject a fresh <picture>, drop the gradient. */
    var pic = doc.createElement('picture');
    pic.className = 'responsive-image';
    var s = makeSources(webpRel, jpgRel);
    var newImg = doc.createElement('img');
    newImg.setAttribute('src', jpgRel + bust);
    newImg.setAttribute('alt', '');
    newImg.setAttribute('loading', 'lazy');
    newImg.setAttribute('decoding', 'async');
    if (w) newImg.setAttribute('width', w);
    if (h) newImg.setAttribute('height', h);
    pic.appendChild(s[0]); pic.appendChild(s[1]); pic.appendChild(newImg);

    slot.innerHTML = '';                       /* drop gradient div + note */
    slot.appendChild(pic);
    slot.style.background = '';
    /* strip any *--placeholder classes so the slot styles as a real image */
    slot.className = (slot.className || '').split(/\s+/)
      .filter(function (c) { return c && c.indexOf('--placeholder') === -1; }).join(' ');

    /* Hand identity to the new <picture> so it stays selectable as an image */
    pic.dataset.iid         = slot.dataset.iid;
    pic.dataset.iidSelector = slot.dataset.iidSelector;
    pic.dataset.iidSection  = slot.dataset.iidSection;
    pic.dataset.iidSlide    = slot.dataset.iidSlide;
    pic.dataset.iidTab      = slot.dataset.iidTab;
    ['iid','iidSelector','iidSection','iidSlide','iidTab','iidPlaceholder'].forEach(function (k) {
      delete slot.dataset[k];
    });
    slot.classList.remove('editor-img-selected');
    pic.classList.add('editor-img-selected');
    activeImg = pic;
  }

  function exportBrief() {
    var notes = (qs('#etb-brief-notes') || {}).value || '';
    var brief = {
      meta: { generated: new Date().toISOString(), deck: 'natgeo/index.html',
        guide: [
          'For each imageReplacement: find/download the image in "note",',
          'compress to .jpg + .webp, place beside currentFile, update',
          'imgSelector src and picSelector source srcsets in index.html,',
          'then commit + push. Use pin canvasX/canvasY as position refs.'
        ] },
      imageReplacements: briefItems,
      pins: pins.map(function (p) {
        return { num: p.num, sectionId: p.sectionId, slideNumber: p.slide, canvasX: p.cx, canvasY: p.cy };
      }),
      notes: notes.trim() || null
    };
    var json = JSON.stringify(brief, null, 2);
    fetch(BRIEF_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r.ok) setStatus('Brief saved to editor-brief.json', 'ok');
                           else downloadJSON(json); })
      .catch(function () { downloadJSON(json); });
  }

  function downloadJSON(text) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'editor-brief.json';
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    setStatus('Brief downloaded ↓', 'ok');
  }

  /* ================================================
   * Save & Commit
   * ================================================ */

  function saveAndCommit() {
    if (isTyping) exitTyping();
    var msgInput = qs('#etb-commit-msg');
    var message  = msgInput ? msgInput.value.trim() : '';
    if (!message) {
      var ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      message = 'Editor: visual save ' + ts;
    }
    var html = buildCleanHTML();
    setStatus('Saving…', 'pending');
    fetch(SAVE_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: html, message: message })
    })
    .then(function (r) { return r.json(); })
    .then(function (r) {
      if (r.ok) { setStatus('✓ ' + (r.message || 'Saved & committed'), 'ok'); if (msgInput) msgInput.value = ''; }
      else      { setStatus('✗ ' + (r.error || r.step || 'Error'), 'error'); }
    })
    .catch(function () { setStatus('✗ Server unreachable — run save-server.py', 'error'); });
  }

  function buildCleanHTML() {
    var clone = doc.documentElement.cloneNode(true);
    /* Keep [data-editor-remove] tags so the working file stays editable. */
    var attrs = ['eid','iid','iidSelector','iidSection','iidSlide','iidTab','iidPlaceholder'];
    clone.querySelectorAll('[data-eid],[data-iid],[data-iid-placeholder]').forEach(function (el) {
      attrs.forEach(function (k) { delete el.dataset[k]; });
    });
    clone.querySelectorAll('.editor-selected,.editor-in-selection,.editor-typing,.editor-img-selected').forEach(function (el) {
      el.classList.remove('editor-selected','editor-in-selection','editor-typing','editor-img-selected');
    });
    clone.querySelectorAll('.editor-pin,#editor-panel,#editor-banner').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    /* Strip live-view cache-busters from any drop-replaced images */
    clone.querySelectorAll('img[src*="?v="]').forEach(function (img) {
      img.setAttribute('src', img.getAttribute('src').replace(/\?v=\d+$/, ''));
    });
    clone.removeAttribute('data-editor');
    clone.removeAttribute('data-editor-pin');
    return '<!doctype html>\n' + clone.outerHTML;
  }

  /* ================================================
   * Git branches
   * ================================================ */

  function loadBranches() {
    var sel = qs('#ep-branch');
    if (!sel) return;
    fetch(BRANCHES_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        panel._branchesLoaded = true;
        if (!data.ok) { setBranchUnavailable(); return; }
        sel.innerHTML = '';
        data.branches.forEach(function (b) {
          var o = doc.createElement('option');
          o.value = b; o.textContent = b;
          if (b === data.current) o.selected = true;
          sel.appendChild(o);
        });
        sel.disabled = false;
        sel.dataset.current = data.current;
        var dot = qs('#ep-branch-clean');
        if (dot) {
          dot.textContent = data.clean ? '●' : '○';
          dot.title = data.clean ? 'Working tree clean' : 'Uncommitted changes';
          dot.classList.toggle('is-dirty', !data.clean);
        }
      })
      .catch(function () { setBranchUnavailable(); });
  }

  function setBranchUnavailable() {
    var sel = qs('#ep-branch');
    if (sel) {
      sel.innerHTML = '<option>— save-server not running —</option>';
      sel.disabled = true;
    }
    var newBtn = qs('#ep-branch-new-btn');
    if (newBtn) newBtn.disabled = true;
  }

  function onBranchPick() {
    var sel = qs('#ep-branch');
    if (!sel) return;
    var target = sel.value;
    var current = sel.dataset.current;
    if (target === current) return;
    if (!confirm('Switch to branch "' + target + '"?\n\nThe page will reload to show that branch\'s content.')) {
      sel.value = current;   /* revert dropdown */
      return;
    }
    setStatus('Switching to ' + target + '…', 'pending');
    fetch(SWITCH_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch: target })
    })
    .then(function (r) { return r.json(); })
    .then(function (r) {
      if (r.ok) { setStatus('✓ Switched — reloading…', 'ok'); setTimeout(function () { location.reload(); }, 500); }
      else { setStatus('✗ ' + (r.error || 'Switch failed'), 'error'); sel.value = current; }
    })
    .catch(function () { setStatus('✗ Server unreachable', 'error'); sel.value = current; });
  }

  function createBranch() {
    var input = qs('#ep-newbranch-name');
    var name  = input ? input.value.trim() : '';
    if (!name) { setStatus('Enter a branch name', 'error'); return; }
    setStatus('Creating ' + name + '…', 'pending');
    fetch(NEWBR_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    })
    .then(function (r) { return r.json(); })
    .then(function (r) {
      if (r.ok) { setStatus('✓ Created — reloading…', 'ok'); setTimeout(function () { location.reload(); }, 500); }
      else { setStatus('✗ ' + (r.error || 'Create failed'), 'error'); }
    })
    .catch(function () { setStatus('✗ Server unreachable', 'error'); });
  }

  function toggleNewBranchRow(show) {
    var row = qs('#ep-newbranch-row');
    if (!row) return;
    row.hidden = show === undefined ? !row.hidden : !show;
    if (!row.hidden) { var i = qs('#ep-newbranch-name'); if (i) i.focus(); }
  }

  /* ================================================
   * Status readout
   * ================================================ */

  var statusTimer = null;
  function setStatus(msg, state) {
    var el = qs('#etb-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'etb-status etb-status--' + (state || 'ok');
    el.hidden = false;
    clearTimeout(statusTimer);
    if (state !== 'pending') statusTimer = setTimeout(function () { el.hidden = true; }, 4500);
  }

  /* ================================================
   * Panel — floating, draggable, collapsible
   * ================================================ */

  function buildPanel() {
    var p = doc.createElement('div');
    p.id = 'editor-panel';
    p.className = 'editor-panel';
    p.hidden = true;

    p.innerHTML =
      '<div class="ep-header" id="ep-header">' +
        '<span class="ep-title">✏ Editor</span>' +
        '<div class="ep-header-btns">' +
          '<button id="etb-undo" data-ea="undo" title="Ctrl+Z" disabled>↩</button>' +
          '<button id="etb-redo" data-ea="redo" title="Ctrl+Shift+Z" disabled>↪</button>' +
          '<button id="ep-collapse" data-ea="collapse" title="Collapse">▾</button>' +
        '</div>' +
      '</div>' +

      '<div class="ep-body" id="ep-body">' +

        /* Branch row */
        '<div class="ep-row ep-branch-row">' +
          '<span class="ep-icon" title="Branch">⎇</span>' +
          '<select id="ep-branch" title="Switch branch" disabled><option>loading…</option></select>' +
          '<span id="ep-branch-clean" class="ep-branch-clean" title="">●</span>' +
          '<button id="ep-branch-new-btn" data-ea="branch-new" title="New branch">+</button>' +
        '</div>' +
        '<div class="ep-row" id="ep-newbranch-row" hidden>' +
          '<input id="ep-newbranch-name" type="text" placeholder="new-branch-name" autocomplete="off">' +
          '<button data-ea="branch-create" class="etb-btn-save">Create</button>' +
          '<button data-ea="branch-cancel">✕</button>' +
        '</div>' +

        /* Save row */
        '<div class="ep-row">' +
          '<input id="etb-commit-msg" type="text" placeholder="commit message (optional)" autocomplete="off">' +
        '</div>' +
        '<div class="ep-row">' +
          '<button id="etb-save" data-ea="save" class="etb-btn-save ep-wide">💾 Save &amp; Commit</button>' +
        '</div>' +
        '<div id="etb-status" class="etb-status" hidden></div>' +

        /* Contextual hint */
        '<div class="ep-hint" id="etb-hint">Click text or an image to begin.</div>' +

        /* Selection section */
        '<div class="ep-section" id="ep-sec-selection" hidden>' +
          '<div class="ep-section-title">Selection · <span id="etb-el-name">—</span></div>' +
          '<div class="ep-section-body">' +
            '<button id="etb-edit-text" data-ea="edit-text">Edit Text</button>' +
            '<div class="etb-row" id="etb-size-row" hidden>' +
              '<span class="etb-section-label">Size</span>' +
              '<button data-ea="size-down">−</button>' +
              '<span id="etb-size-val">—</span>' +
              '<button data-ea="size-up">+</button>' +
            '</div>' +
            '<div class="etb-row" id="etb-nudge-row" hidden>' +
              '<span class="etb-section-label">Nudge</span>' +
              '<button data-ea="nudge-left"  title="Alt+←">←</button>' +
              '<button data-ea="nudge-up"    title="Alt+↑">↑</button>' +
              '<button data-ea="nudge-down"  title="Alt+↓">↓</button>' +
              '<button data-ea="nudge-right" title="Alt+→">→</button>' +
              '<span id="etb-nudge-val">0, 0</span>' +
            '</div>' +
            '<button class="etb-btn-danger" data-ea="reset" id="etb-reset">Reset element</button>' +
          '</div>' +
        '</div>' +

        /* Image section */
        '<div class="ep-section" id="ep-sec-image" hidden>' +
          '<div class="ep-section-title">🖼 <span id="etb-img-filename">image</span></div>' +
          '<div class="ep-section-body">' +
            '<div class="ep-dropzone" id="ep-dropzone">' +
              '<span class="ep-dropzone__label">⬇ Drop image to replace</span>' +
              '<span class="ep-dropzone__hint">converts to WebP + JPG · this image only</span>' +
              '<input type="file" id="ep-file-input" accept="image/*" hidden>' +
            '</div>' +
            '<div class="ep-or">— or brief it for Claude —</div>' +
            '<input id="etb-img-note" type="text" placeholder="describe the replacement…" autocomplete="off">' +
            '<div class="etb-row">' +
              '<button id="etb-img-add" data-ea="img-add" class="ep-wide">Add to Brief</button>' +
              '<button id="etb-img-remove" data-ea="img-remove" class="etb-btn-danger" hidden>Remove</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Brief list (note-based requests) */
        '<div class="ep-section" id="ep-sec-brief" hidden>' +
          '<div class="ep-section-title">Brief · <span id="ep-brief-count">0</span> to source</div>' +
          '<div class="ep-brief-list" id="ep-brief-list"></div>' +
        '</div>' +

        /* Pins + coords */
        '<div class="ep-section" id="ep-sec-pins">' +
          '<div class="ep-section-title">Pins · <span id="etb-coords" class="etb-coords">— —</span></div>' +
          '<div class="ep-section-body">' +
            '<div class="etb-row">' +
              '<button id="etb-pin-toggle" data-ea="pin-toggle">📍 Pin</button>' +
              '<button id="etb-pin-clear" data-ea="pin-clear" hidden>Clear</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Footer */
        '<div class="ep-footer">' +
          '<button id="etb-export-brief" data-ea="export-brief" class="etb-btn-brief">' +
            'Export Brief <span id="etb-brief-badge" class="etb-badge" hidden>0</span></button>' +
          '<button class="etb-btn-danger" data-ea="reset-all">Reset all</button>' +
        '</div>' +
      '</div>';

    /* Don't steal focus from inputs; block default on buttons */
    p.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.target.closest('#ep-header')) return; /* drag handles its own */
      e.preventDefault();
    });

    p.addEventListener('click', function (e) {
      /* Brief-list row actions (revise / delete) */
      var del = e.target.closest('[data-brief-del]');
      if (del) { removeFromBrief(del.getAttribute('data-brief-del')); return; }
      var rev = e.target.closest('[data-brief-revise]');
      if (rev) { reviseBriefItem(rev.getAttribute('data-brief-revise')); return; }

      var btn = e.target.closest('[data-ea]');
      if (!btn) return;
      var step = e.shiftKey ? 10 : 2;
      switch (btn.dataset.ea) {
        case 'undo':          undo(); break;
        case 'redo':          redo(); break;
        case 'collapse':      toggleCollapse(); break;
        case 'edit-text':     toggleTyping(); break;
        case 'size-up':       if (activeEl) stepSize(activeEl,  1); break;
        case 'size-down':     if (activeEl) stepSize(activeEl, -1); break;
        case 'nudge-left':    nudgeAll(-step, 0); break;
        case 'nudge-right':   nudgeAll( step, 0); break;
        case 'nudge-up':      nudgeAll(0, -step); break;
        case 'nudge-down':    nudgeAll(0,  step); break;
        case 'reset':         resetSelection(); break;
        case 'reset-all':     resetAll(); break;
        case 'save':          saveAndCommit(); break;
        case 'export-brief':  exportBrief(); break;
        case 'pin-toggle':    setPinMode(!pinMode); break;
        case 'pin-clear':     clearAllPins(); break;
        case 'img-add':       addToBrief(); break;
        case 'img-remove':    if (activeImg) removeFromBrief(activeImg.dataset.iid); break;
        case 'branch-new':    toggleNewBranchRow(); break;
        case 'branch-create': createBranch(); break;
        case 'branch-cancel': toggleNewBranchRow(false); break;
      }
    });

    /* Inputs: stop editor shortcuts; branch select change */
    p.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Enter') {
          if (inp.id === 'ep-newbranch-name') createBranch();
          if (inp.id === 'etb-commit-msg')    saveAndCommit();
        }
      });
    });
    var branchSel = p.querySelector('#ep-branch');
    if (branchSel) branchSel.addEventListener('change', onBranchPick);

    initDropzone(p);

    doc.body.appendChild(p);
    initDrag(p);
    restorePanelPos(p);
    return p;
  }

  /* ---- Collapse ---- */
  function toggleCollapse() {
    var collapsed = panel.classList.toggle('editor-panel--collapsed');
    var btn = qs('#ep-collapse');
    if (btn) { btn.textContent = collapsed ? '▸' : '▾'; btn.title = collapsed ? 'Expand' : 'Collapse'; }
    var pos = loadLS(PANEL_KEY, {});
    pos.collapsed = collapsed; saveLS(PANEL_KEY, pos);
  }

  /* ---- Drag + snap to corner ---- */
  function initDrag(p) {
    var header = qs('#ep-header', p);
    if (!header) return;
    var dragging = false, offX = 0, offY = 0;

    header.addEventListener('mousedown', function (e) {
      if (e.target.closest('button')) return; /* header buttons still work */
      dragging = true;
      var r = p.getBoundingClientRect();
      offX = e.clientX - r.left;
      offY = e.clientY - r.top;
      p.classList.add('editor-panel--dragging');
      p.style.left = r.left + 'px';
      p.style.top  = r.top + 'px';
      p.style.right = 'auto';
      p.style.bottom = 'auto';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      p.style.left = (e.clientX - offX) + 'px';
      p.style.top  = (e.clientY - offY) + 'px';
    });

    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      p.classList.remove('editor-panel--dragging');
      snapToCorner(p);
    });
  }

  function snapToCorner(p) {
    var r  = p.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var corner = (cy < window.innerHeight / 2 ? 't' : 'b') +
                 (cx < window.innerWidth  / 2 ? 'l' : 'r');
    applyCorner(p, corner);
    var pos = loadLS(PANEL_KEY, {});
    pos.corner = corner; saveLS(PANEL_KEY, pos);
  }

  function applyCorner(p, corner) {
    p.style.left = ''; p.style.top = ''; p.style.right = ''; p.style.bottom = '';
    p.classList.remove('editor-panel--tl','editor-panel--tr','editor-panel--bl','editor-panel--br');
    p.classList.add('editor-panel--' + corner);
  }

  function restorePanelPos(p) {
    var pos = loadLS(PANEL_KEY, { corner: 'br', collapsed: false });
    applyCorner(p, pos.corner || 'br');
    if (pos.collapsed) {
      p.classList.add('editor-panel--collapsed');
      var btn = qs('#ep-collapse', p);
      if (btn) { btn.textContent = '▸'; btn.title = 'Expand'; }
    }
  }

  /* ================================================
   * Refresh panel (contextual visibility)
   * ================================================ */

  function refreshPanel() {
    if (!panel) return;

    var count  = selectedEls.length;
    var hasEl  = count > 0;
    var multi  = count > 1;
    var hasImg = !!activeImg;

    var hint    = qs('#etb-hint');
    var selSec  = qs('#ep-sec-selection');
    var imgSec  = qs('#ep-sec-image');

    if (hint)   hint.hidden   = hasEl || hasImg;
    if (selSec) selSec.hidden = !hasEl;
    if (imgSec) imgSec.hidden = !hasImg;

    /* Selection controls */
    if (hasEl) {
      var elName      = qs('#etb-el-name');
      var editTextBtn = qs('#etb-edit-text');
      var sizeRow     = qs('#etb-size-row');
      var nudgeRow    = qs('#etb-nudge-row');
      var sizeVal     = qs('#etb-size-val');
      var nudgeVal    = qs('#etb-nudge-val');

      if (elName) {
        if (multi) elName.textContent = count + ' selected';
        else if (activeEl) {
          var cls = (activeEl.className || '')
            .replace(/editor-selected|editor-in-selection|editor-typing/g, '').trim().split(/\s+/)[0];
          elName.textContent = cls || activeEl.tagName.toLowerCase();
        }
      }
      if (editTextBtn) {
        editTextBtn.hidden = multi;
        editTextBtn.textContent = isTyping ? '✓ Done Editing' : 'Edit Text';
        editTextBtn.classList.toggle('etb-btn-active', isTyping);
      }
      if (sizeRow)  sizeRow.hidden  = multi || isTyping;
      if (nudgeRow) nudgeRow.hidden = isTyping;
      if (!multi && activeEl && !isTyping) {
        if (sizeVal) sizeVal.textContent = Math.round(getSize(activeEl)) + 'px';
        var n = getNudge(activeEl);
        if (nudgeVal) nudgeVal.textContent = n.x + ', ' + n.y;
      }
    }

    /* Image controls */
    if (hasImg) {
      var imgFilename = qs('#etb-img-filename');
      var imgNote     = qs('#etb-img-note');
      var imgAdd      = qs('#etb-img-add');
      var imgRemove   = qs('#etb-img-remove');
      if (imgFilename) {
        var isrc = getImgSrc(activeImg);
        imgFilename.textContent = isrc ? isrc.split('/').pop() : '(empty placeholder)';
      }
      var inBrief = isInBrief(activeImg);
      if (imgAdd)    imgAdd.textContent = inBrief ? 'Update Note' : 'Add to Brief';
      if (imgRemove) imgRemove.hidden   = !inBrief;
      if (imgNote && inBrief && !imgNote.value) {
        var ex = briefItems.filter(function (b) { return b.iid === activeImg.dataset.iid; })[0];
        if (ex) imgNote.value = ex.note || '';
      } else if (imgNote && !inBrief && !imgNote.value) {
        imgNote.value = '';
      }
    }

    refreshUndoButtons();
    refreshBriefBadge();
  }

  /* ================================================
   * Banner
   * ================================================ */

  function buildBanner() {
    var b = doc.createElement('div');
    b.id = 'editor-banner';
    b.hidden = true;
    b.innerHTML =
      '<span>✏ <strong>Edit mode</strong> — ' +
      'click text / image &nbsp;|&nbsp; <kbd>Shift+click</kbd> multi &nbsp;|&nbsp; ' +
      '<kbd>Alt+↑↓←→</kbd> nudge &nbsp;|&nbsp; <kbd>P</kbd> pin &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+Z</kbd> undo &nbsp;|&nbsp; <kbd>Esc</kbd> back &nbsp;|&nbsp; ' +
      '<kbd>E</kbd> exit &nbsp;·&nbsp; drag panel header to move</span>';
    doc.body.appendChild(b);
  }

  /* ================================================
   * Coordinate tracking + pin drops
   * ================================================ */

  function initCoordTracking() {
    qsa('.section').forEach(function (section) {
      section.addEventListener('mousemove', function (e) {
        if (!isOn) return;
        var c = screenToCanvas(section, e.clientX, e.clientY);
        updateCoordDisplay(c.x, c.y);
      });
      section.addEventListener('mouseleave', function () {
        if (isOn) updateCoordDisplay(null, null);
      });
      section.addEventListener('click', function (e) {
        if (!isOn || !pinMode) return;
        if (e.target.dataset.eid || e.target.dataset.iid) return;
        if (e.target.closest('#editor-panel,#editor-banner,.editor-pin')) return;
        dropPin(section, e.clientX, e.clientY);
      });
    });
  }

  /* ================================================
   * Keyboard
   * ================================================ */

  function onKey(e) {
    var tag     = (e.target.tagName || '').toUpperCase();
    var inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (e.ctrlKey && !e.altKey && isOn && !inField) {
      if (e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (e.key === 'y' && !e.shiftKey) { e.preventDefault(); redo(); return; }
    }

    if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!inField && !isTyping) { setMode(!isOn); return; }
    }

    if (!isOn) return;

    if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!inField && !isTyping) { setPinMode(!pinMode); return; }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (pinMode)   { setPinMode(false);  return; }
      if (isTyping)  { exitTyping();       return; }
      if (activeImg) { deselectImage();    return; }
      deactivateAll(); return;
    }

    if (!isTyping && selectedEls.length && e.altKey && !e.ctrlKey && !e.metaKey) {
      var step = e.shiftKey ? 10 : 2;
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); nudgeAll(0, -step); return;
        case 'ArrowDown':  e.preventDefault(); nudgeAll(0,  step); return;
        case 'ArrowLeft':  e.preventDefault(); nudgeAll(-step, 0); return;
        case 'ArrowRight': e.preventDefault(); nudgeAll( step, 0); return;
      }
    }
  }

  /* ================================================
   * Click handling
   * ================================================ */

  function onEditableClick(el, e) {
    if (!isOn || pinMode) return;
    if (e.shiftKey) {
      if (!activeEl) { selectPrimary(el); return; }
      if (el === activeEl) return;
      toggleSecondary(el);
    } else {
      selectPrimary(el);
    }
  }

  function onDocClick(e) {
    if (!isOn) return;
    if (panel && panel.contains(e.target)) return;

    var pic = e.target.closest('picture[data-iid], [data-iid-placeholder]');
    if (pic && !e.target.dataset.eid) { deactivateAll(); selectImage(pic); return; }

    if (activeImg && !activeImg.contains(e.target)) deselectImage();

    if (selectedEls.length) {
      if (isTyping && activeEl && activeEl.contains(e.target)) return;
      if (!selectedEls.some(function (el) { return el.contains(e.target); })) deactivateAll();
    }
  }

  /* ================================================
   * Init
   * ================================================ */

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    load();
    assignIds();
    assignImgIds();
    applyAll();

    panel = buildPanel();
    buildBanner();
    initCoordTracking();

    qsa(EDITABLE).forEach(function (el) {
      el.addEventListener('click', function (e) { onEditableClick(el, e); });
    });

    window.addEventListener('keydown', onKey);
    doc.addEventListener('click', onDocClick);

    window.__editor = {
      undo: undo, redo: redo, resetAll: resetAll,
      saveAndCommit: saveAndCommit, exportBrief: exportBrief,
      loadBranches: loadBranches, store: store, brief: briefItems, pins: pins
    };
  });

})();
