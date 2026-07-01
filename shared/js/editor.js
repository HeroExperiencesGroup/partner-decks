/* editor.js — personal in-browser slide editor
 *
 * Requires save-server.py running at localhost:8080.
 * Toggle with E key.
 *
 * Text edits  — edit natgeo/index.html directly in your editor.
 *               Nudge/size controls here are for visual tweaking only;
 *               they don't appear in the brief (you apply them manually).
 *
 * Image brief — click an image → describe the replacement → Add to Brief.
 *               "Export Brief" downloads editor-brief.json for Claude.
 *               Claude reads the brief, finds/converts/places images,
 *               updates index.html, commits, and pushes.
 *
 * Save & Commit — sends the current DOM (editor artifacts stripped) to
 *                 save-server.py which overwrites natgeo/index.html,
 *                 commits, and pushes. Use after visual nudge/size tweaks.
 *
 * TO DISABLE FOR CLIENT: remove the two lines tagged
 * data-editor-remove in natgeo/index.html.
 */

(function () {
  'use strict';

  var SAVE_URL  = 'http://localhost:8080/save';
  var BRIEF_URL = 'http://localhost:8080/brief';

  var STORE_KEY = 'partner-decks:editor-v1';
  var doc       = document;
  var body      = doc.body;
  var store     = {};
  var originals = {};
  var toolbar   = null;
  var isOn      = false;

  /* Text selection */
  var activeEl    = null;
  var selectedEls = [];
  var isTyping    = false;
  var typingSnap  = null;

  /* Image brief */
  var activeImg  = null;
  var briefItems = [];     /* image replacement requests */

  /* Pins */
  var pinMode  = false;
  var pins     = [];
  var pinCount = 0;

  /* Undo/redo */
  var undoStack   = [];
  var redoStack   = [];
  var MAX_HISTORY = 60;

  var EDITABLE = [
    '.section-label', '.headline', '.subhead',
    '.body p', '.pull', '.caption', '.declaration',
    '.close-line', '.landscape-tab__caption', '.cover-label',
    '.overlay h2', '.overlay p',
    '.splash__title', '.splash__subtitle'
  ].join(', ');

  /* ------------------------------------------------
   * Helpers
   * ---------------------------------------------- */

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }
  function qs(sel, root) { return (root || doc).querySelector(sel); }

  /* ------------------------------------------------
   * Storage
   * ---------------------------------------------- */

  function load() {
    try { store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { store = {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch (e) {}
  }

  /* ------------------------------------------------
   * Element IDs — text
   * ---------------------------------------------- */

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

  /* ------------------------------------------------
   * Element IDs — images
   * ---------------------------------------------- */

  function assignImgIds() {
    qsa('.section').forEach(function (section) {
      var sid = section.id || 'global';
      qsa('picture', section).forEach(function (pic, i) {
        pic.dataset.iid         = sid + ':pic:' + i;
        pic.dataset.iidSelector = buildPicSelector(pic);
        pic.dataset.iidSection  = sid;
        pic.dataset.iidSlide    = section.dataset.slide || '';
        var tp = pic.closest('[data-tab]');
        pic.dataset.iidTab = tp ? tp.getAttribute('data-tab') : '';
      });
    });
  }

  function buildPicSelector(pic) {
    var section  = pic.closest('.section');
    var tabPanel = pic.closest('[data-tab]');
    var base     = section && section.id ? '#' + section.id : '';
    if (tabPanel) base += ' [data-tab="' + tabPanel.getAttribute('data-tab') + '"]';
    var ctx  = tabPanel || section || doc;
    var pics = qsa('picture', ctx);
    var idx  = pics.indexOf(pic);
    base += ' picture' + (idx > 0 ? ':nth-of-type(' + (idx + 1) + ')' : '');
    return base;
  }

  function getImgSrc(pic) {
    var img = pic.querySelector('img');
    return img ? (img.getAttribute('src') || '') : '';
  }

  function getImgSources(pic) {
    return qsa('source', pic).map(function (s) {
      return { type: s.getAttribute('type'), srcset: s.getAttribute('srcset') };
    });
  }

  /* ------------------------------------------------
   * Coordinates
   * ---------------------------------------------- */

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

  /* ------------------------------------------------
   * Pins
   * ---------------------------------------------- */

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
      '<div class="editor-pin__label">' +
        '<span class="editor-pin__num">' + n + '</span> ' + c.x + ', ' + c.y +
      '</div>';
    el.title = 'Pin ' + n + ' — ' + c.x + ', ' + c.y + ' (click to remove)';
    el.addEventListener('click', function (e) { e.stopPropagation(); removePin(el); });
    section.appendChild(el);
    pins.push({ el: el, section: section, num: n,
                sectionId: section.id, slide: parseInt(section.dataset.slide) || 0,
                cx: c.x, cy: c.y });
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

  /* ------------------------------------------------
   * State snapshot
   * ---------------------------------------------- */

  function snapState(el) {
    var d = store[el.dataset.eid] || {};
    return { html: el.innerHTML, fontSize: el.style.fontSize || null,
             nudgeX: d.nudgeX || 0, nudgeY: d.nudgeY || 0 };
  }

  function applyState(eid, state) {
    var el = qs('[data-eid="' + eid + '"]'); if (!el) return;
    el.innerHTML = state.html;
    el.style.fontSize = state.fontSize || '';
    applyTransform(el, state.nudgeX || 0, state.nudgeY || 0);
    var d = store[eid] || {};
    d.html = state.html; d.fontSize = state.fontSize;
    d.nudgeX = state.nudgeX || 0; d.nudgeY = state.nudgeY || 0;
    store[eid] = d; save(); refreshToolbar();
  }

  function applyTransform(el, x, y) {
    if (x === 0 && y === 0) { el.style.position = ''; el.style.transform = ''; }
    else { el.style.position = 'relative'; el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
  }

  /* ------------------------------------------------
   * Undo / redo
   * ---------------------------------------------- */

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

  /* ------------------------------------------------
   * Apply saved state on load
   * ---------------------------------------------- */

  function applyAll() {
    Object.keys(store).forEach(function (eid) {
      var el = qs('[data-eid="' + eid + '"]'); if (!el) return;
      var d = store[eid];
      if (d.html     != null) el.innerHTML = d.html;
      if (d.fontSize != null) el.style.fontSize = d.fontSize;
      applyTransform(el, d.nudgeX || 0, d.nudgeY || 0);
    });
  }

  /* ------------------------------------------------
   * Edit mode
   * ---------------------------------------------- */

  function setMode(on) {
    isOn = on;
    body.setAttribute('data-editor', on ? 'true' : 'false');
    var banner = qs('#editor-banner');
    if (banner) banner.hidden = !on;
    if (toolbar) toolbar.hidden = !on;
    if (!on) { deactivateAll(); deselectImage(); setPinMode(false); }
  }

  /* ------------------------------------------------
   * Text selection
   * ---------------------------------------------- */

  function isSelected(el) { return selectedEls.indexOf(el) !== -1; }

  function selectPrimary(el) {
    deselectImage();
    if (isTyping) exitTyping();
    selectedEls.forEach(function (s) {
      s.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = [el]; activeEl = el;
    el.classList.add('editor-selected');
    refreshToolbar();
  }

  function toggleSecondary(el) {
    if (el === activeEl) return;
    if (isSelected(el)) {
      selectedEls = selectedEls.filter(function (e) { return e !== el; });
      el.classList.remove('editor-in-selection');
    } else {
      selectedEls.push(el); el.classList.add('editor-in-selection');
    }
    refreshToolbar();
  }

  function deactivateAll() {
    if (isTyping) exitTyping();
    selectedEls.forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = []; activeEl = null;
    refreshToolbar();
  }

  /* ------------------------------------------------
   * Typing mode
   * ---------------------------------------------- */

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
    refreshToolbar();
  }

  function exitTyping() {
    if (!isTyping || !activeEl) return;
    pushHistory([{ eid: activeEl.dataset.eid, before: typingSnap, after: snapState(activeEl) }]);
    typingSnap = null;
    activeEl.contentEditable = 'false';
    activeEl.classList.remove('editor-typing');
    if (activeEl._edMD) { activeEl.removeEventListener('mousedown', activeEl._edMD); delete activeEl._edMD; }
    if (activeEl._edIn) { activeEl.removeEventListener('input', activeEl._edIn); delete activeEl._edIn; }
    isTyping = false; refreshToolbar();
  }

  function toggleTyping() { if (isTyping) exitTyping(); else enterTyping(); }

  /* ------------------------------------------------
   * Font size
   * ---------------------------------------------- */

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
    refreshToolbar();
  }

  /* ------------------------------------------------
   * Nudge
   * ---------------------------------------------- */

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
    refreshToolbar();
  }

  function getNudge(el) {
    var d = store[el.dataset.eid] || {};
    return { x: d.nudgeX || 0, y: d.nudgeY || 0 };
  }

  /* ------------------------------------------------
   * Reset
   * ---------------------------------------------- */

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
    refreshToolbar();
  }

  function resetAll() {
    if (!confirm('Reset ALL edits and reload?')) return;
    store = {}; save(); location.reload();
  }

  /* ------------------------------------------------
   * Image selection + brief
   * ---------------------------------------------- */

  function selectImage(pic) {
    deactivateAll();
    if (activeImg) activeImg.classList.remove('editor-img-selected');
    activeImg = pic;
    pic.classList.add('editor-img-selected');
    refreshToolbar();
    setTimeout(function () { var n = qs('#etb-img-note'); if (n) n.focus(); }, 50);
  }

  function deselectImage() {
    if (activeImg) { activeImg.classList.remove('editor-img-selected'); activeImg = null; }
    refreshToolbar();
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
      var orig = btn.textContent;
      btn.textContent = '✓ Added'; btn.classList.add('etb-btn-active');
      setTimeout(function () { btn.textContent = orig; btn.classList.remove('etb-btn-active'); }, 1400);
    }
  }

  function removeFromBrief(iid) {
    briefItems = briefItems.filter(function (b) { return b.iid !== iid; });
    refreshBriefBadge(); refreshToolbar();
  }

  function isInBrief(pic) {
    if (!pic) return false;
    return briefItems.some(function (b) { return b.iid === pic.dataset.iid; });
  }

  function refreshBriefBadge() {
    var badge = qs('#etb-brief-badge');
    if (badge) { badge.hidden = !briefItems.length; badge.textContent = briefItems.length; }
    var btn = qs('#etb-export-brief');
    if (btn) btn.classList.toggle('etb-has-items', briefItems.length > 0);
  }

  /* ------------------------------------------------
   * Export Brief JSON (for Claude to action)
   * Contains: image replacements + pins + freeform notes.
   * Text edits are NOT included — edit index.html directly.
   * ---------------------------------------------- */

  function exportBrief() {
    var notes = (qs('#etb-brief-notes') || {}).value || '';
    var brief = {
      meta: {
        generated: new Date().toISOString(),
        deck:      'natgeo/index.html',
        guide: [
          'For each imageReplacement: find/download the image described in "note",',
          'compress to .jpg + .webp, place in the same folder as currentFile (or a',
          'descriptive new name), update imgSelector src and picSelector source srcsets',
          'in natgeo/index.html, then commit + push.',
          'Use pin canvasX/canvasY as position references when mentioned in notes.'
        ]
      },
      imageReplacements: briefItems,
      pins: pins.map(function (p) {
        return { num: p.num, sectionId: p.sectionId, slideNumber: p.slide,
                 canvasX: p.cx, canvasY: p.cy };
      }),
      notes: notes.trim() || null
    };

    var json = JSON.stringify(brief, null, 2);

    /* Try posting to save-server first; fall back to download */
    fetch(BRIEF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    }).then(function (res) { return res.json(); })
      .then(function (r) {
        if (r.ok) setStatus('Brief saved to editor-brief.json', 'ok');
        else      downloadJSON(json, 'editor-brief.json');
      })
      .catch(function () { downloadJSON(json, 'editor-brief.json'); });
  }

  function downloadJSON(text, filename) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    setStatus('Brief downloaded ↓', 'ok');
  }

  /* ------------------------------------------------
   * Save & Commit — sends DOM to save-server.py
   * ---------------------------------------------- */

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: html, message: message })
    })
    .then(function (res) { return res.json(); })
    .then(function (r) {
      if (r.ok) {
        setStatus('✓ Saved & committed', 'ok');
        if (msgInput) msgInput.value = '';
      } else {
        setStatus('✗ ' + (r.error || r.step || 'Error'), 'error');
      }
    })
    .catch(function (err) {
      setStatus('✗ Server unreachable — run save-server.py', 'error');
    });
  }

  function buildCleanHTML() {
    var clone = doc.documentElement.cloneNode(true);
    /* NOTE: we deliberately KEEP the [data-editor-remove] script + link
     * tags so the working file stays editable after save. They are only
     * removed manually for final client delivery. */
    /* Strip editor-specific runtime attributes */
    var editorAttrs = ['eid','iid','iidSelector','iidSection','iidSlide','iidTab'];
    clone.querySelectorAll('[data-eid],[data-iid]').forEach(function (el) {
      editorAttrs.forEach(function (k) { delete el.dataset[k]; });
    });
    /* Strip editor classes */
    clone.querySelectorAll('.editor-selected,.editor-in-selection,.editor-typing,.editor-img-selected').forEach(function (el) {
      el.classList.remove('editor-selected','editor-in-selection','editor-typing','editor-img-selected');
    });
    /* Remove injected UI */
    clone.querySelectorAll('.editor-pin,#editor-toolbar,#editor-banner').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    clone.removeAttribute('data-editor');
    clone.removeAttribute('data-editor-pin');
    return '<!doctype html>\n' + clone.outerHTML;
  }

  /* ------------------------------------------------
   * Status display
   * ---------------------------------------------- */

  var statusTimer = null;

  function setStatus(msg, state) {
    var el = qs('#etb-status');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'etb-status etb-status--' + (state || 'ok');
    el.hidden      = false;
    clearTimeout(statusTimer);
    if (state !== 'pending') {
      statusTimer = setTimeout(function () { el.hidden = true; }, 4000);
    }
  }

  /* ------------------------------------------------
   * Toolbar
   * ---------------------------------------------- */

  function buildToolbar() {
    var t = doc.createElement('div');
    t.id = 'editor-toolbar';
    t.hidden = true;
    t.innerHTML =
      '<span class="etb-label">✏ Editor</span>' +

      /* Undo/redo */
      '<div class="etb-group">' +
        '<button id="etb-undo" data-ea="undo" title="Ctrl+Z" disabled>↩</button>' +
        '<button id="etb-redo" data-ea="redo" title="Ctrl+Shift+Z" disabled>↪</button>' +
      '</div>' +

      /* Text element controls */
      '<div class="etb-group">' +
        '<span class="etb-hint" id="etb-hint">click text or image</span>' +
        '<span class="etb-el-name" id="etb-el-name" hidden></span>' +
        '<button id="etb-edit-text" data-ea="edit-text" hidden>Edit Text</button>' +
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
        '<button class="etb-btn-danger" data-ea="reset" id="etb-reset" hidden>Reset</button>' +
      '</div>' +

      /* Image brief */
      '<div class="etb-group etb-group--img" id="etb-img-group" hidden>' +
        '<span class="etb-section-label">🖼</span>' +
        '<span id="etb-img-filename" class="etb-img-filename"></span>' +
        '<input id="etb-img-note" class="etb-img-note" type="text" ' +
          'placeholder="describe the replacement…" autocomplete="off">' +
        '<button id="etb-img-add"    data-ea="img-add">Add to Brief</button>' +
        '<button id="etb-img-remove" data-ea="img-remove" hidden class="etb-btn-danger">Remove</button>' +
      '</div>' +

      /* Coords + pins */
      '<div class="etb-group">' +
        '<span id="etb-coords" class="etb-coords">— —</span>' +
        '<button id="etb-pin-toggle" data-ea="pin-toggle">📍 Pin</button>' +
        '<button id="etb-pin-clear"  data-ea="pin-clear" hidden>Clear</button>' +
      '</div>' +

      /* Save & Commit */
      '<div class="etb-group etb-group--save">' +
        '<input id="etb-commit-msg" class="etb-commit-msg" type="text" ' +
          'placeholder="commit message (optional)" autocomplete="off">' +
        '<button id="etb-save" data-ea="save" class="etb-btn-save">Save &amp; Commit</button>' +
        '<span id="etb-status" class="etb-status" hidden></span>' +
      '</div>' +

      /* Brief + reset */
      '<div class="etb-group">' +
        '<button class="etb-btn-danger" data-ea="reset-all">Reset all</button>' +
        '<button id="etb-export-brief" data-ea="export-brief" class="etb-btn-brief">' +
          'Export Brief <span id="etb-brief-badge" class="etb-badge" hidden>0</span>' +
        '</button>' +
      '</div>';

    t.addEventListener('mousedown', function (e) {
      /* Allow typing in text inputs without stealing focus */
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    });

    t.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ea]');
      if (!btn) return;
      var step = e.shiftKey ? 10 : 2;
      switch (btn.dataset.ea) {
        case 'undo':         undo();  break;
        case 'redo':         redo();  break;
        case 'edit-text':    toggleTyping(); break;
        case 'size-up':      if (activeEl) stepSize(activeEl,  1); break;
        case 'size-down':    if (activeEl) stepSize(activeEl, -1); break;
        case 'nudge-left':   nudgeAll(-step, 0); break;
        case 'nudge-right':  nudgeAll( step, 0); break;
        case 'nudge-up':     nudgeAll(0, -step); break;
        case 'nudge-down':   nudgeAll(0,  step); break;
        case 'reset':        resetSelection(); break;
        case 'reset-all':    resetAll(); break;
        case 'save':         saveAndCommit(); break;
        case 'export-brief': exportBrief(); break;
        case 'pin-toggle':   setPinMode(!pinMode); break;
        case 'pin-clear':    clearAllPins(); break;
        case 'img-add':      addToBrief(); break;
        case 'img-remove':   if (activeImg) removeFromBrief(activeImg.dataset.iid); break;
      }
    });

    /* Prevent editor shortcuts while typing in inputs */
    t.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) { e.stopPropagation(); });
    });

    doc.body.appendChild(t);
    return t;
  }

  function refreshToolbar() {
    if (!toolbar) return;

    var count  = selectedEls.length;
    var hasEl  = count > 0;
    var multi  = count > 1;
    var hasImg = !!activeImg;

    var hint        = qs('#etb-hint');
    var elName      = qs('#etb-el-name');
    var editTextBtn = qs('#etb-edit-text');
    var sizeRow     = qs('#etb-size-row');
    var nudgeRow    = qs('#etb-nudge-row');
    var resetBtn    = qs('#etb-reset');
    var sizeVal     = qs('#etb-size-val');
    var nudgeVal    = qs('#etb-nudge-val');

    if (hint)        hint.hidden        = hasEl || hasImg;
    if (elName)      elName.hidden      = !hasEl;
    if (editTextBtn) editTextBtn.hidden = !hasEl || multi;
    if (sizeRow)     sizeRow.hidden     = !hasEl || multi || isTyping;
    if (nudgeRow)    nudgeRow.hidden    = !hasEl || isTyping;
    if (resetBtn)    resetBtn.hidden    = !hasEl;

    if (editTextBtn && !multi) {
      editTextBtn.textContent = isTyping ? '✓ Done' : 'Edit Text';
      editTextBtn.classList.toggle('etb-btn-active', isTyping);
    }

    if (hasEl && elName) {
      if (multi) {
        elName.textContent = count + ' selected';
      } else if (activeEl) {
        var cls = (activeEl.className || '')
          .replace(/editor-selected|editor-in-selection|editor-typing/g, '').trim().split(/\s+/)[0];
        elName.textContent = cls || activeEl.tagName.toLowerCase();
      }
    }

    if (!multi && activeEl && !isTyping) {
      if (sizeVal) sizeVal.textContent = Math.round(getSize(activeEl)) + 'px';
      var n = getNudge(activeEl);
      if (nudgeVal) nudgeVal.textContent = n.x + ', ' + n.y;
    }

    /* Image brief panel */
    var imgGroup    = qs('#etb-img-group');
    var imgFilename = qs('#etb-img-filename');
    var imgNote     = qs('#etb-img-note');
    var imgAdd      = qs('#etb-img-add');
    var imgRemove   = qs('#etb-img-remove');

    if (imgGroup) imgGroup.hidden = !hasImg;
    if (hasImg) {
      var fname = getImgSrc(activeImg).split('/').pop();
      if (imgFilename) imgFilename.textContent = fname;
      var inBrief = isInBrief(activeImg);
      if (imgAdd)    imgAdd.textContent = inBrief ? 'Update' : 'Add to Brief';
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

  /* ------------------------------------------------
   * Banner
   * ---------------------------------------------- */

  function buildBanner() {
    var b = doc.createElement('div');
    b.id = 'editor-banner';
    b.hidden = true;
    b.innerHTML =
      '<span>✏ <strong>Edit mode</strong> — ' +
      'click text to select &nbsp;|&nbsp; click image to brief &nbsp;|&nbsp; ' +
      '<kbd>Shift+click</kbd> multi &nbsp;|&nbsp; ' +
      '"Edit Text" to type &nbsp;|&nbsp; ' +
      '<kbd>Alt+↑↓←→</kbd> nudge &nbsp;|&nbsp; <kbd>P</kbd> pin &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+Z</kbd> undo &nbsp;|&nbsp; <kbd>Esc</kbd> deselect &nbsp;|&nbsp; ' +
      '<kbd>E</kbd> exit</span>';
    doc.body.appendChild(b);
  }

  /* ------------------------------------------------
   * Coordinate tracking + pin drops
   * ---------------------------------------------- */

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
        if (e.target.closest('#editor-toolbar,#editor-banner,.editor-pin')) return;
        dropPin(section, e.clientX, e.clientY);
      });
    });
  }

  /* ------------------------------------------------
   * Keyboard
   * ---------------------------------------------- */

  function onKey(e) {
    var tag     = (e.target.tagName || '').toUpperCase();
    var inField = tag === 'INPUT' || tag === 'TEXTAREA';

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
      if (pinMode)  { setPinMode(false);  return; }
      if (isTyping) { exitTyping();       return; }
      if (activeImg){ deselectImage();    return; }
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

  /* ------------------------------------------------
   * Click handling
   * ---------------------------------------------- */

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
    if (toolbar && toolbar.contains(e.target)) return;

    var pic = e.target.closest('picture[data-iid]');
    if (pic && !e.target.dataset.eid) {
      deactivateAll(); selectImage(pic); return;
    }

    if (activeImg && !activeImg.contains(e.target)) deselectImage();

    if (selectedEls.length) {
      if (isTyping && activeEl && activeEl.contains(e.target)) return;
      if (!selectedEls.some(function (el) { return el.contains(e.target); })) deactivateAll();
    }
  }

  /* ------------------------------------------------
   * Init
   * ---------------------------------------------- */

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    load();
    assignIds();
    assignImgIds();
    applyAll();

    toolbar = buildToolbar();
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
      store: store, brief: briefItems, pins: pins
    };
  });

})();
