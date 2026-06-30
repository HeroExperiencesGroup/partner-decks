/* editor.js — personal in-browser slide editor
 *
 * Toggle with E key. Provides inline content editing, font-size
 * control, position nudging, and full undo/redo.
 *
 * Keyboard:
 *   E              — toggle edit mode
 *   Click text     — select element for editing
 *   Esc            — deselect
 *   Alt + ↑↓←→    — nudge 2px  (Shift = 10px)
 *   Ctrl + Z       — undo
 *   Ctrl + Shift + Z (or Ctrl+Y) — redo
 *
 * TO DISABLE FOR CLIENT: remove the two lines tagged
 * data-editor-remove in natgeo/index.html.
 */

(function () {
  'use strict';

  var STORE_KEY = 'partner-decks:editor-v1';
  var doc      = document;
  var body     = doc.body;
  var store    = {};
  var originals = {};
  var activeEl  = null;
  var toolbar   = null;
  var isOn      = false;

  /* Undo / redo stacks — each entry: { eid, before, after }
   * where before/after are { html, fontSize, nudgeX, nudgeY } */
  var undoStack = [];
  var redoStack = [];
  var MAX_HISTORY = 60;

  /* Snapshot of element state when activated (for content-edit undo) */
  var activationSnap = null;

  var EDITABLE = [
    '.section-label',
    '.headline',
    '.subhead',
    '.body p',
    '.pull',
    '.caption',
    '.declaration',
    '.close-line',
    '.landscape-tab__caption',
    '.cover-label',
    '.overlay h2',
    '.overlay p',
    '.splash__title',
    '.splash__subtitle'
  ].join(', ');

  /* --------------------------------------------------
   * Helpers
   * -------------------------------------------------- */

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }
  function qs(sel, root) { return (root || doc).querySelector(sel); }

  /* --------------------------------------------------
   * Storage
   * -------------------------------------------------- */

  function load() {
    try { store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { store = {}; }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch (e) {}
  }

  /* --------------------------------------------------
   * Element identification
   * -------------------------------------------------- */

  function assignIds() {
    qsa('.section').forEach(function (section) {
      var sid = section.id || 'global';
      qsa(EDITABLE, section).forEach(function (el, i) {
        var eid = sid + ':' + i;
        el.dataset.eid = eid;
        originals[eid] = el.innerHTML;
      });
    });
  }

  /* --------------------------------------------------
   * State snapshot helpers
   * -------------------------------------------------- */

  function snapState(el) {
    var eid = el.dataset.eid;
    var d   = store[eid] || {};
    return {
      html:     el.innerHTML,
      fontSize: el.style.fontSize  || null,
      nudgeX:   d.nudgeX || 0,
      nudgeY:   d.nudgeY || 0
    };
  }

  function applyState(eid, state) {
    var el = qs('[data-eid="' + eid + '"]');
    if (!el) return;
    el.innerHTML = state.html;
    el.style.fontSize = state.fontSize || '';
    applyTransform(el, state.nudgeX || 0, state.nudgeY || 0);
    var d = store[eid] || {};
    d.html     = state.html;
    d.fontSize = state.fontSize;
    d.nudgeX   = state.nudgeX || 0;
    d.nudgeY   = state.nudgeY || 0;
    store[eid] = d;
    save();
    refreshToolbar();
  }

  /* --------------------------------------------------
   * Undo / redo
   * -------------------------------------------------- */

  function pushHistory(eid, before, after) {
    /* Don't push if nothing actually changed */
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    undoStack.push({ eid: eid, before: before, after: after });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];  /* new action clears redo */
    refreshUndoButtons();
  }

  function undo() {
    var entry = undoStack.pop();
    if (!entry) return;
    applyState(entry.eid, entry.before);
    redoStack.push(entry);
    refreshUndoButtons();
  }

  function redo() {
    var entry = redoStack.pop();
    if (!entry) return;
    applyState(entry.eid, entry.after);
    undoStack.push(entry);
    refreshUndoButtons();
  }

  function refreshUndoButtons() {
    var uBtn = qs('#etb-undo');
    var rBtn = qs('#etb-redo');
    if (uBtn) uBtn.disabled = undoStack.length === 0;
    if (rBtn) rBtn.disabled = redoStack.length === 0;
  }

  /* --------------------------------------------------
   * Apply saved state on load
   * -------------------------------------------------- */

  function applyAll() {
    Object.keys(store).forEach(function (eid) {
      var el = qs('[data-eid="' + eid + '"]');
      if (!el) return;
      var d = store[eid];
      if (d.html     != null) el.innerHTML = d.html;
      if (d.fontSize != null) el.style.fontSize = d.fontSize;
      applyTransform(el, d.nudgeX || 0, d.nudgeY || 0);
    });
  }

  function applyTransform(el, x, y) {
    if (x === 0 && y === 0) {
      el.style.position  = '';
      el.style.transform = '';
    } else {
      el.style.position  = 'relative';
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
  }

  /* --------------------------------------------------
   * Edit mode on / off
   * -------------------------------------------------- */

  function setMode(on) {
    isOn = on;
    body.setAttribute('data-editor', on ? 'true' : 'false');
    var banner = qs('#editor-banner');
    if (banner) banner.hidden = !on;
    if (toolbar) toolbar.hidden = !on;
    if (!on && activeEl) deactivate();
  }

  /* --------------------------------------------------
   * Activate / deactivate element
   * -------------------------------------------------- */

  function activate(el) {
    if (activeEl === el) return;
    if (activeEl) deactivate();
    activeEl = el;
    activationSnap = snapState(el);  /* remember state before editing */
    el.contentEditable = 'true';
    el.classList.add('editor-selected');
    /* auto-save content to store on every keystroke */
    el._edInput = function () {
      var eid = el.dataset.eid;
      var d = store[eid] || {};
      d.html = el.innerHTML;
      store[eid] = d;
      save();
    };
    el.addEventListener('input', el._edInput);
    refreshToolbar();
  }

  function deactivate() {
    if (!activeEl) return;
    /* Push undo entry for content edits made during this session */
    var after = snapState(activeEl);
    pushHistory(activeEl.dataset.eid, activationSnap, after);
    activationSnap = null;

    activeEl.contentEditable = 'false';
    activeEl.classList.remove('editor-selected');
    if (activeEl._edInput) {
      activeEl.removeEventListener('input', activeEl._edInput);
      delete activeEl._edInput;
    }
    activeEl = null;
    refreshToolbar();
  }

  /* --------------------------------------------------
   * Font size
   * -------------------------------------------------- */

  function getSize(el) {
    var inline = parseFloat(el.style.fontSize);
    if (!isNaN(inline)) return inline;
    return parseFloat(window.getComputedStyle(el).fontSize);
  }

  function stepSize(el, dir) {
    var before = snapState(el);
    var cur    = getSize(el);
    var step   = cur >= 48 ? 4 : cur >= 24 ? 2 : 1;
    var next   = Math.max(6, Math.round(cur + dir * step));
    el.style.fontSize = next + 'px';
    var eid = el.dataset.eid;
    var d = store[eid] || {};
    d.fontSize = next + 'px';
    store[eid] = d;
    save();
    var after = snapState(el);
    pushHistory(eid, before, after);
    refreshToolbar();
  }

  /* --------------------------------------------------
   * Nudge
   * -------------------------------------------------- */

  function nudge(el, dx, dy) {
    var eid    = el.dataset.eid;
    var before = snapState(el);
    var d      = store[eid] || {};
    d.nudgeX   = (d.nudgeX || 0) + dx;
    d.nudgeY   = (d.nudgeY || 0) + dy;
    store[eid] = d;
    applyTransform(el, d.nudgeX, d.nudgeY);
    save();
    var after = snapState(el);
    pushHistory(eid, before, after);
    refreshToolbar();
  }

  function getNudge(el) {
    var eid = el ? el.dataset.eid : null;
    var d   = eid ? (store[eid] || {}) : {};
    return { x: d.nudgeX || 0, y: d.nudgeY || 0 };
  }

  /* --------------------------------------------------
   * Reset
   * -------------------------------------------------- */

  function resetEl(el) {
    var eid    = el.dataset.eid;
    var before = snapState(el);
    delete store[eid];
    save();
    el.innerHTML       = originals[eid] != null ? originals[eid] : el.innerHTML;
    el.style.fontSize  = '';
    el.style.position  = '';
    el.style.transform = '';
    var after = snapState(el);
    pushHistory(eid, before, after);
    refreshToolbar();
  }

  function resetAll() {
    if (!confirm('Reset ALL edits and reload?')) return;
    store = {};
    save();
    location.reload();
  }

  /* --------------------------------------------------
   * Export — download HTML with edits baked in, editor stripped
   * -------------------------------------------------- */

  function exportHTML() {
    /* Deactivate first so current edits are committed */
    if (activeEl) deactivate();

    var clone = doc.documentElement.cloneNode(true);

    clone.querySelectorAll('[data-editor-remove]').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    clone.querySelectorAll('[contenteditable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
    });
    clone.querySelectorAll('[data-eid]').forEach(function (el) {
      el.removeAttribute('data-eid');
    });
    clone.querySelectorAll('.editor-selected').forEach(function (el) {
      el.classList.remove('editor-selected');
    });
    clone.querySelectorAll('#editor-toolbar, #editor-banner').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    clone.removeAttribute('data-editor');

    var html = '<!doctype html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a    = doc.createElement('a');
    a.href   = URL.createObjectURL(blob);
    a.download = 'natgeo-edited.html';
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* --------------------------------------------------
   * Toolbar
   * -------------------------------------------------- */

  function buildToolbar() {
    var t = doc.createElement('div');
    t.id = 'editor-toolbar';
    t.hidden = true;
    t.innerHTML =
      '<span class="etb-label">✏ Editor</span>' +

      /* Undo / redo */
      '<div class="etb-group">' +
        '<button id="etb-undo" data-ea="undo" title="Undo (Ctrl+Z)" disabled>↩ Undo</button>' +
        '<button id="etb-redo" data-ea="redo" title="Redo (Ctrl+Shift+Z)" disabled>↪ Redo</button>' +
      '</div>' +

      /* Element controls — hidden until element selected */
      '<div class="etb-group" id="etb-el-group">' +
        '<span class="etb-hint" id="etb-hint">click text to select</span>' +
        '<span class="etb-el-name" id="etb-el-name" hidden></span>' +
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

      /* Global controls */
      '<div class="etb-group">' +
        '<button class="etb-btn-danger" data-ea="reset-all">Reset all</button>' +
        '<button class="etb-btn-export" data-ea="export">Export HTML ↓</button>' +
      '</div>';

    t.addEventListener('mousedown', function (e) { e.preventDefault(); });
    t.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ea]');
      if (!btn) return;
      var step   = e.shiftKey ? 10 : 2;
      var action = btn.dataset.ea;
      switch (action) {
        case 'undo':        undo(); break;
        case 'redo':        redo(); break;
        case 'size-up':     if (activeEl) stepSize(activeEl,  1);    break;
        case 'size-down':   if (activeEl) stepSize(activeEl, -1);    break;
        case 'nudge-left':  if (activeEl) nudge(activeEl, -step, 0); break;
        case 'nudge-right': if (activeEl) nudge(activeEl,  step, 0); break;
        case 'nudge-up':    if (activeEl) nudge(activeEl, 0, -step); break;
        case 'nudge-down':  if (activeEl) nudge(activeEl, 0,  step); break;
        case 'reset':       if (activeEl) resetEl(activeEl); break;
        case 'reset-all':   resetAll(); break;
        case 'export':      exportHTML(); break;
      }
    });

    doc.body.appendChild(t);
    return t;
  }

  function refreshToolbar() {
    if (!toolbar) return;
    var hint     = qs('#etb-hint');
    var elName   = qs('#etb-el-name');
    var sizeRow  = qs('#etb-size-row');
    var nudgeRow = qs('#etb-nudge-row');
    var resetBtn = qs('#etb-reset');
    var sizeVal  = qs('#etb-size-val');
    var nudgeVal = qs('#etb-nudge-val');

    var hasEl = !!activeEl;
    if (hint)     hint.hidden     = hasEl;
    if (elName)   elName.hidden   = !hasEl;
    if (sizeRow)  sizeRow.hidden  = !hasEl;
    if (nudgeRow) nudgeRow.hidden = !hasEl;
    if (resetBtn) resetBtn.hidden = !hasEl;

    if (hasEl) {
      var cls = (activeEl.className || '').replace('editor-selected', '').trim().split(/\s+/)[0];
      if (elName)   elName.textContent  = cls || activeEl.tagName.toLowerCase();
      if (sizeVal)  sizeVal.textContent = Math.round(getSize(activeEl)) + 'px';
      var n = getNudge(activeEl);
      if (nudgeVal) nudgeVal.textContent = n.x + ', ' + n.y;
    }

    refreshUndoButtons();
  }

  /* --------------------------------------------------
   * Banner
   * -------------------------------------------------- */

  function buildBanner() {
    var b = doc.createElement('div');
    b.id = 'editor-banner';
    b.hidden = true;
    b.innerHTML =
      '<span>✏ <strong>Edit mode</strong> — click text to edit &nbsp;|&nbsp; ' +
      '<kbd>Alt+↑↓←→</kbd> nudge &nbsp;|&nbsp; ' +
      '<kbd>Shift</kbd> ×5 &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+Z</kbd> undo &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+⇧+Z</kbd> redo &nbsp;|&nbsp; ' +
      '<kbd>Esc</kbd> deselect &nbsp;|&nbsp; ' +
      '<kbd>E</kbd> exit</span>';
    doc.body.appendChild(b);
  }

  /* --------------------------------------------------
   * Keyboard
   * -------------------------------------------------- */

  function onKey(e) {
    var tag = (e.target.tagName || '').toUpperCase();
    var inField = tag === 'INPUT' || tag === 'TEXTAREA';

    /* Ctrl+Z — undo (works outside and inside contenteditable) */
    if (e.ctrlKey && !e.altKey && e.key === 'z' && isOn) {
      if (!inField) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else            undo();
      }
      return;
    }

    /* Ctrl+Y — redo (Windows convention) */
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key === 'y' && isOn) {
      if (!inField) { e.preventDefault(); redo(); }
      return;
    }

    /* E — toggle edit mode (not while typing) */
    if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!inField && !e.target.isContentEditable) {
        setMode(!isOn);
        return;
      }
    }

    if (!isOn) return;

    /* Escape — deselect */
    if (e.key === 'Escape' && activeEl) {
      e.preventDefault();
      deactivate();
      return;
    }

    /* Alt + Arrow — nudge */
    if (activeEl && e.altKey && !e.ctrlKey && !e.metaKey) {
      var step = e.shiftKey ? 10 : 2;
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); nudge(activeEl, 0, -step); return;
        case 'ArrowDown':  e.preventDefault(); nudge(activeEl, 0,  step); return;
        case 'ArrowLeft':  e.preventDefault(); nudge(activeEl, -step, 0); return;
        case 'ArrowRight': e.preventDefault(); nudge(activeEl,  step, 0); return;
      }
    }
  }

  /* --------------------------------------------------
   * Click-outside to deselect
   * -------------------------------------------------- */

  function onDocClick(e) {
    if (!isOn || !activeEl) return;
    if (activeEl.contains(e.target)) return;
    if (toolbar && toolbar.contains(e.target)) return;
    deactivate();
  }

  /* --------------------------------------------------
   * Init
   * -------------------------------------------------- */

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    load();
    assignIds();
    applyAll();

    toolbar = buildToolbar();
    buildBanner();

    qsa(EDITABLE).forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (!isOn) return;
        e.stopPropagation();
        activate(el);
      });
    });

    window.addEventListener('keydown', onKey);
    doc.addEventListener('click', onDocClick);

    window.__editor = {
      undo: undo, redo: redo,
      resetAll: resetAll,
      export: exportHTML,
      store: store,
      history: { undo: undoStack, redo: redoStack }
    };
  });

})();
