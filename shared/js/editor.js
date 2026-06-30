/* editor.js — personal in-browser slide editor
 *
 * Toggle with E key.
 *
 * Selection model:
 *   Click            — select element (no text editing yet)
 *   Shift+click      — add / remove from multi-selection
 *   Toolbar "Edit Text" button — enter typing mode on primary element
 *   Esc (while typing)  — exit typing mode, keep selection
 *   Esc (not typing)    — deselect all
 *   Alt+↑↓←→            — nudge all selected (2px; Shift = 10px)
 *   Ctrl+Z / Ctrl+Shift+Z — undo / redo
 *
 * TO DISABLE FOR CLIENT: remove the two lines tagged
 * data-editor-remove in natgeo/index.html.
 */

(function () {
  'use strict';

  var STORE_KEY  = 'partner-decks:editor-v1';
  var doc        = document;
  var body       = doc.body;
  var store      = {};
  var originals  = {};
  var toolbar    = null;
  var isOn       = false;

  /* Selection */
  var activeEl    = null;   /* primary selected element */
  var selectedEls = [];     /* full set; nudge applies to all */
  var isTyping    = false;  /* whether activeEl is contentEditable */

  /* Undo/redo — each entry is an ARRAY of { eid, before, after } */
  var undoStack = [];
  var redoStack = [];
  var MAX_HISTORY = 60;

  /* Snapshot captured when entering typing mode, for content undo */
  var typingSnap = null;

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
   * Element identification
   * ---------------------------------------------- */

  function assignIds() {
    qsa('.section').forEach(function (section) {
      var sid = section.id || 'global';
      qsa(EDITABLE, section).forEach(function (el, i) {
        var eid = sid + ':' + i;
        el.dataset.eid = eid;
        originals[eid] = el.innerHTML;
        /* Prevent browser text-selection on click while in edit mode */
        el.addEventListener('mousedown', function (e) {
          if (isOn && !isTyping) e.preventDefault();
        });
      });
    });
  }

  /* ------------------------------------------------
   * State snapshot
   * ---------------------------------------------- */

  function snapState(el) {
    var d = store[el.dataset.eid] || {};
    return {
      html:     el.innerHTML,
      fontSize: el.style.fontSize || null,
      nudgeX:   d.nudgeX || 0,
      nudgeY:   d.nudgeY || 0
    };
  }

  function applyState(eid, state) {
    var el = qs('[data-eid="' + eid + '"]');
    if (!el) return;
    el.innerHTML       = state.html;
    el.style.fontSize  = state.fontSize || '';
    applyTransform(el, state.nudgeX || 0, state.nudgeY || 0);
    var d = store[eid] || {};
    d.html = state.html; d.fontSize = state.fontSize;
    d.nudgeX = state.nudgeX || 0; d.nudgeY = state.nudgeY || 0;
    store[eid] = d;
    save();
    refreshToolbar();
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
    var entries = undoStack.pop();
    if (!entries) return;
    entries.forEach(function (e) { applyState(e.eid, e.before); });
    redoStack.push(entries);
    refreshUndoButtons();
  }

  function redo() {
    var entries = redoStack.pop();
    if (!entries) return;
    entries.forEach(function (e) { applyState(e.eid, e.after); });
    undoStack.push(entries);
    refreshUndoButtons();
  }

  function refreshUndoButtons() {
    var u = qs('#etb-undo');
    var r = qs('#etb-redo');
    if (u) u.disabled = !undoStack.length;
    if (r) r.disabled = !redoStack.length;
  }

  /* ------------------------------------------------
   * Apply saved state on page load
   * ---------------------------------------------- */

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
      el.style.position = ''; el.style.transform = '';
    } else {
      el.style.position = 'relative';
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
  }

  /* ------------------------------------------------
   * Edit mode on / off
   * ---------------------------------------------- */

  function setMode(on) {
    isOn = on;
    body.setAttribute('data-editor', on ? 'true' : 'false');
    var banner = qs('#editor-banner');
    if (banner) banner.hidden = !on;
    if (toolbar) toolbar.hidden = !on;
    if (!on) deactivateAll();
  }

  /* ------------------------------------------------
   * Selection
   * ---------------------------------------------- */

  function isSelected(el) { return selectedEls.indexOf(el) !== -1; }

  /* Set primary selection (single click) */
  function selectPrimary(el) {
    if (isTyping) exitTyping();
    /* Clear all existing highlights */
    selectedEls.forEach(function (s) {
      s.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = [el];
    activeEl = el;
    el.classList.add('editor-selected');
    refreshToolbar();
  }

  /* Toggle secondary selection (shift+click) */
  function toggleSecondary(el) {
    if (el === activeEl) return;
    if (isSelected(el)) {
      selectedEls = selectedEls.filter(function (e) { return e !== el; });
      el.classList.remove('editor-in-selection');
    } else {
      selectedEls.push(el);
      el.classList.add('editor-in-selection');
    }
    refreshToolbar();
  }

  /* Deselect everything */
  function deactivateAll() {
    if (isTyping) exitTyping();
    selectedEls.forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = [];
    activeEl = null;
    refreshToolbar();
  }

  /* ------------------------------------------------
   * Text editing (explicit opt-in from toolbar)
   * ---------------------------------------------- */

  function enterTyping() {
    if (!activeEl || isTyping) return;
    isTyping    = true;
    typingSnap  = snapState(activeEl);
    activeEl.contentEditable = 'true';
    activeEl.classList.add('editor-typing');
    activeEl.focus();

    /* Restore normal cursor/text-selection while typing */
    activeEl._edMouseDown = function (e) { e.stopPropagation(); };
    activeEl.addEventListener('mousedown', activeEl._edMouseDown);

    /* Auto-save on every keystroke */
    activeEl._edInput = function () {
      var d = store[activeEl.dataset.eid] || {};
      d.html = activeEl.innerHTML;
      store[activeEl.dataset.eid] = d;
      save();
    };
    activeEl.addEventListener('input', activeEl._edInput);

    refreshToolbar();
  }

  function exitTyping() {
    if (!isTyping || !activeEl) return;
    var after = snapState(activeEl);
    pushHistory([{ eid: activeEl.dataset.eid, before: typingSnap, after: after }]);
    typingSnap = null;

    activeEl.contentEditable = 'false';
    activeEl.classList.remove('editor-typing');

    if (activeEl._edMouseDown) {
      activeEl.removeEventListener('mousedown', activeEl._edMouseDown);
      delete activeEl._edMouseDown;
    }
    if (activeEl._edInput) {
      activeEl.removeEventListener('input', activeEl._edInput);
      delete activeEl._edInput;
    }
    isTyping = false;
    refreshToolbar();
  }

  function toggleTyping() {
    if (isTyping) exitTyping(); else enterTyping();
  }

  /* ------------------------------------------------
   * Font size (primary element only)
   * ---------------------------------------------- */

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
    var d = store[el.dataset.eid] || {};
    d.fontSize = next + 'px';
    store[el.dataset.eid] = d;
    save();
    pushHistory([{ eid: el.dataset.eid, before: before, after: snapState(el) }]);
    refreshToolbar();
  }

  /* ------------------------------------------------
   * Nudge — all selected elements
   * ---------------------------------------------- */

  function nudgeAll(dx, dy) {
    if (!selectedEls.length) return;
    var entries = selectedEls.map(function (el) {
      return { eid: el.dataset.eid, before: snapState(el), el: el };
    });
    selectedEls.forEach(function (el) {
      var d = store[el.dataset.eid] || {};
      d.nudgeX = (d.nudgeX || 0) + dx;
      d.nudgeY = (d.nudgeY || 0) + dy;
      store[el.dataset.eid] = d;
      applyTransform(el, d.nudgeX, d.nudgeY);
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
      var eid = el.dataset.eid;
      delete store[eid];
      el.innerHTML       = originals[eid] != null ? originals[eid] : el.innerHTML;
      el.style.fontSize  = '';
      el.style.position  = '';
      el.style.transform = '';
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
   * Export
   * ---------------------------------------------- */

  function exportHTML() {
    if (isTyping) exitTyping();
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
    clone.querySelectorAll('.editor-selected,.editor-in-selection,.editor-typing').forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection', 'editor-typing');
    });
    clone.querySelectorAll('#editor-toolbar,#editor-banner').forEach(function (el) {
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

  /* ------------------------------------------------
   * Toolbar
   * ---------------------------------------------- */

  function buildToolbar() {
    var t = doc.createElement('div');
    t.id = 'editor-toolbar';
    t.hidden = true;
    t.innerHTML =
      '<span class="etb-label">✏ Editor</span>' +

      '<div class="etb-group">' +
        '<button id="etb-undo" data-ea="undo" title="Ctrl+Z" disabled>↩ Undo</button>' +
        '<button id="etb-redo" data-ea="redo" title="Ctrl+Shift+Z" disabled>↪ Redo</button>' +
      '</div>' +

      '<div class="etb-group">' +
        '<span class="etb-hint" id="etb-hint">click text to select</span>' +
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
        case 'undo':        undo();  break;
        case 'redo':        redo();  break;
        case 'edit-text':   toggleTyping(); break;
        case 'size-up':     if (activeEl) stepSize(activeEl,  1); break;
        case 'size-down':   if (activeEl) stepSize(activeEl, -1); break;
        case 'nudge-left':  nudgeAll(-step, 0); break;
        case 'nudge-right': nudgeAll( step, 0); break;
        case 'nudge-up':    nudgeAll(0, -step); break;
        case 'nudge-down':  nudgeAll(0,  step); break;
        case 'reset':       resetSelection(); break;
        case 'reset-all':   resetAll(); break;
        case 'export':      exportHTML(); break;
      }
    });

    doc.body.appendChild(t);
    return t;
  }

  function refreshToolbar() {
    if (!toolbar) return;
    var hint        = qs('#etb-hint');
    var elName      = qs('#etb-el-name');
    var editTextBtn = qs('#etb-edit-text');
    var sizeRow     = qs('#etb-size-row');
    var nudgeRow    = qs('#etb-nudge-row');
    var resetBtn    = qs('#etb-reset');
    var sizeVal     = qs('#etb-size-val');
    var nudgeVal    = qs('#etb-nudge-val');

    var count  = selectedEls.length;
    var hasAny = count > 0;
    var multi  = count > 1;

    if (hint)        hint.hidden        = hasAny;
    if (elName)      elName.hidden      = !hasAny;
    if (editTextBtn) editTextBtn.hidden = !hasAny || multi; /* single selection only */
    if (sizeRow)     sizeRow.hidden     = !hasAny || multi || isTyping;
    if (nudgeRow)    nudgeRow.hidden    = !hasAny || isTyping;
    if (resetBtn)    resetBtn.hidden    = !hasAny;

    /* Edit Text button label and state */
    if (editTextBtn && !multi) {
      editTextBtn.textContent = isTyping ? '✓ Done Editing' : 'Edit Text';
      editTextBtn.classList.toggle('etb-btn-active', isTyping);
    }

    if (!hasAny) { refreshUndoButtons(); return; }

    if (elName) {
      if (multi) {
        elName.textContent = count + ' elements selected';
      } else if (activeEl) {
        var cls = (activeEl.className || '')
          .replace(/editor-selected|editor-in-selection|editor-typing/g, '')
          .trim().split(/\s+/)[0];
        elName.textContent = cls || activeEl.tagName.toLowerCase();
      }
    }

    if (!multi && activeEl && !isTyping) {
      if (sizeVal)  sizeVal.textContent  = Math.round(getSize(activeEl)) + 'px';
      var n = getNudge(activeEl);
      if (nudgeVal) nudgeVal.textContent = n.x + ', ' + n.y;
    }

    refreshUndoButtons();
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
      'click to select &nbsp;|&nbsp; <kbd>Shift+click</kbd> multi-select &nbsp;|&nbsp; ' +
      '"Edit Text" button to type &nbsp;|&nbsp; ' +
      '<kbd>Alt+↑↓←→</kbd> nudge &nbsp;|&nbsp; <kbd>Shift</kbd> ×5 &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+Z</kbd> undo &nbsp;|&nbsp; <kbd>Ctrl+⇧+Z</kbd> redo &nbsp;|&nbsp; ' +
      '<kbd>Esc</kbd> deselect &nbsp;|&nbsp; <kbd>E</kbd> exit</span>';
    doc.body.appendChild(b);
  }

  /* ------------------------------------------------
   * Keyboard
   * ---------------------------------------------- */

  function onKey(e) {
    var tag     = (e.target.tagName || '').toUpperCase();
    var inField = tag === 'INPUT' || tag === 'TEXTAREA';

    /* Ctrl+Z undo / Ctrl+Shift+Z or Ctrl+Y redo */
    if (e.ctrlKey && !e.altKey && isOn && !inField) {
      if (e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (e.key === 'y' && !e.shiftKey) {
        e.preventDefault(); redo(); return;
      }
    }

    /* E — toggle edit mode (only when not typing) */
    if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!inField && !isTyping) { setMode(!isOn); return; }
    }

    if (!isOn) return;

    /* Escape */
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isTyping) exitTyping();    /* first Esc exits typing */
      else          deactivateAll(); /* second Esc deselects */
      return;
    }

    /* Alt+Arrow nudge — only when not typing */
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
    if (!isOn) return;
    /* mousedown already called e.preventDefault() when not typing,
       so no text selection happens. We just handle the selection here. */
    if (e.shiftKey) {
      if (el === activeEl) return;
      /* If there's no primary yet, make this the primary */
      if (!activeEl) { selectPrimary(el); return; }
      toggleSecondary(el);
    } else {
      selectPrimary(el);
    }
  }

  function onDocClick(e) {
    if (!isOn || !selectedEls.length) return;
    /* If typing, clicks inside the element are handled by the browser */
    if (isTyping && activeEl && activeEl.contains(e.target)) return;
    var inAny = selectedEls.some(function (el) { return el.contains(e.target); });
    if (inAny) return;
    if (toolbar && toolbar.contains(e.target)) return;
    deactivateAll();
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
    applyAll();

    toolbar = buildToolbar();
    buildBanner();

    qsa(EDITABLE).forEach(function (el) {
      el.addEventListener('click', function (e) { onEditableClick(el, e); });
    });

    window.addEventListener('keydown', onKey);
    doc.addEventListener('click', onDocClick);

    window.__editor = {
      undo: undo, redo: redo, resetAll: resetAll, export: exportHTML,
      store: store, history: { undo: undoStack, redo: redoStack }
    };
  });

})();
