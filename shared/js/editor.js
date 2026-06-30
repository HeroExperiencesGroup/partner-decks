/* editor.js — personal in-browser slide editor
 *
 * Toggle with E key. Provides inline content editing, font-size
 * control, position nudging, multi-select move, and full undo/redo.
 *
 * Keyboard:
 *   E                    — toggle edit mode
 *   Click text           — select element, enable text editing
 *   Shift + Click text   — add / remove element from selection
 *   Esc                  — deselect all
 *   Alt + ↑↓←→          — nudge 2px (Shift = 10px); moves ALL selected
 *   Ctrl + Z             — undo
 *   Ctrl + Shift + Z / Y — redo
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

  /* Selection state
   * activeEl    — primary element (text-editable, size controls apply to this)
   * selectedEls — full set including activeEl; nudge applies to all */
  var activeEl    = null;
  var selectedEls = [];

  /* Undo / redo — each entry is an ARRAY of { eid, before, after }
   * so a multi-element nudge is one undo step. */
  var undoStack = [];
  var redoStack = [];
  var MAX_HISTORY = 60;

  /* Snapshot captured when activeEl is activated, for content-edit undo */
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
   * State snapshot
   * -------------------------------------------------- */

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
    var d      = store[eid] || {};
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
   * Each entry in the stack is an ARRAY of { eid, before, after }.
   * -------------------------------------------------- */

  function pushHistory(entries) {
    /* Drop entries where nothing changed */
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

  /* --------------------------------------------------
   * Apply saved state on page load
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
    if (!on) deactivateAll();
  }

  /* --------------------------------------------------
   * Selection management
   * -------------------------------------------------- */

  function isSelected(el) {
    return selectedEls.indexOf(el) !== -1;
  }

  /* Primary activate — makes element text-editable */
  function activate(el) {
    if (activeEl === el) return;

    /* Commit any in-flight content edits on the previous primary */
    if (activeEl) commitActive();

    activeEl       = el;
    activationSnap = snapState(el);

    el.contentEditable = 'true';
    el.classList.remove('editor-in-selection');
    el.classList.add('editor-selected');

    el._edInput = function () {
      var d = store[el.dataset.eid] || {};
      d.html = el.innerHTML;
      store[el.dataset.eid] = d;
      save();
    };
    el.addEventListener('input', el._edInput);

    /* Make sure it's in selectedEls */
    if (!isSelected(el)) selectedEls.push(el);

    refreshToolbar();
  }

  /* Add / remove a secondary element from the selection (Shift+click) */
  function toggleSecondary(el) {
    if (el === activeEl) return; /* primary handled by activate() */

    if (isSelected(el)) {
      /* Remove from selection */
      selectedEls = selectedEls.filter(function (e) { return e !== el; });
      el.classList.remove('editor-in-selection');
    } else {
      /* Add to selection */
      selectedEls.push(el);
      el.classList.add('editor-in-selection');
    }
    refreshToolbar();
  }

  /* Commit content edits on the active element and push history */
  function commitActive() {
    if (!activeEl) return;
    var after = snapState(activeEl);
    pushHistory([{ eid: activeEl.dataset.eid, before: activationSnap, after: after }]);
    activationSnap = null;

    activeEl.contentEditable = 'false';
    activeEl.classList.remove('editor-selected');
    if (activeEl._edInput) {
      activeEl.removeEventListener('input', activeEl._edInput);
      delete activeEl._edInput;
    }
    activeEl = null;
  }

  /* Clear everything */
  function deactivateAll() {
    commitActive();
    selectedEls.forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection');
    });
    selectedEls = [];
    refreshToolbar();
  }

  /* --------------------------------------------------
   * Font size (primary element only)
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
    var d = store[el.dataset.eid] || {};
    d.fontSize = next + 'px';
    store[el.dataset.eid] = d;
    save();
    pushHistory([{ eid: el.dataset.eid, before: before, after: snapState(el) }]);
    refreshToolbar();
  }

  /* --------------------------------------------------
   * Nudge — applies to ALL selected elements
   * -------------------------------------------------- */

  function nudgeAll(dx, dy) {
    if (!selectedEls.length) return;

    var entries = selectedEls.map(function (el) {
      return { eid: el.dataset.eid, before: snapState(el), el: el };
    });

    selectedEls.forEach(function (el) {
      var d    = store[el.dataset.eid] || {};
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

  /* --------------------------------------------------
   * Reset
   * -------------------------------------------------- */

  function resetEl(el) {
    var before = snapState(el);
    var eid    = el.dataset.eid;
    delete store[eid];
    save();
    el.innerHTML       = originals[eid] != null ? originals[eid] : el.innerHTML;
    el.style.fontSize  = '';
    el.style.position  = '';
    el.style.transform = '';
    pushHistory([{ eid: eid, before: before, after: snapState(el) }]);
    refreshToolbar();
  }

  function resetSelection() {
    if (!selectedEls.length) return;
    var entries = selectedEls.map(function (el) {
      return { eid: el.dataset.eid, before: snapState(el), el: el };
    });
    selectedEls.forEach(function (el) {
      var eid = el.dataset.eid;
      if (el === activeEl) {
        el.innerHTML = originals[eid] != null ? originals[eid] : el.innerHTML;
        activationSnap = snapState(el); /* update snap so commit doesn't override */
      } else {
        el.innerHTML = originals[eid] != null ? originals[eid] : el.innerHTML;
      }
      delete store[eid];
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
    store = {};
    save();
    location.reload();
  }

  /* --------------------------------------------------
   * Export
   * -------------------------------------------------- */

  function exportHTML() {
    if (activeEl) commitActive();

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
    clone.querySelectorAll('.editor-selected,.editor-in-selection').forEach(function (el) {
      el.classList.remove('editor-selected', 'editor-in-selection');
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

  /* --------------------------------------------------
   * Toolbar
   * -------------------------------------------------- */

  function buildToolbar() {
    var t = doc.createElement('div');
    t.id = 'editor-toolbar';
    t.hidden = true;
    t.innerHTML =
      '<span class="etb-label">✏ Editor</span>' +

      '<div class="etb-group">' +
        '<button id="etb-undo" data-ea="undo" title="Undo (Ctrl+Z)" disabled>↩ Undo</button>' +
        '<button id="etb-redo" data-ea="redo" title="Redo (Ctrl+Shift+Z)" disabled>↪ Redo</button>' +
      '</div>' +

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
        case 'size-up':     if (activeEl) stepSize(activeEl,  1);     break;
        case 'size-down':   if (activeEl) stepSize(activeEl, -1);     break;
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
    var hint     = qs('#etb-hint');
    var elName   = qs('#etb-el-name');
    var sizeRow  = qs('#etb-size-row');
    var nudgeRow = qs('#etb-nudge-row');
    var resetBtn = qs('#etb-reset');
    var sizeVal  = qs('#etb-size-val');
    var nudgeVal = qs('#etb-nudge-val');

    var count  = selectedEls.length;
    var hasAny = count > 0;
    var multi  = count > 1;

    if (hint)     hint.hidden     = hasAny;
    if (elName)   elName.hidden   = !hasAny;
    if (sizeRow)  sizeRow.hidden  = !hasAny || multi; /* size only for single */
    if (nudgeRow) nudgeRow.hidden = !hasAny;
    if (resetBtn) resetBtn.hidden = !hasAny;

    if (!hasAny) { refreshUndoButtons(); return; }

    if (elName) {
      if (multi) {
        elName.textContent = count + ' elements';
      } else if (activeEl) {
        var cls = (activeEl.className || '')
          .replace(/editor-selected|editor-in-selection/g, '').trim()
          .split(/\s+/)[0];
        elName.textContent = cls || activeEl.tagName.toLowerCase();
      }
    }

    if (!multi && activeEl) {
      if (sizeVal)  sizeVal.textContent = Math.round(getSize(activeEl)) + 'px';
      var n = getNudge(activeEl);
      if (nudgeVal) nudgeVal.textContent = n.x + ', ' + n.y;
    } else if (multi) {
      /* Show nudge of primary element as reference */
      if (nudgeVal && activeEl) {
        var nm = getNudge(activeEl);
        nudgeVal.textContent = nm.x + ', ' + nm.y;
      }
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
      '<span>✏ <strong>Edit mode</strong> — ' +
      'click text &nbsp;|&nbsp; <kbd>Shift+click</kbd> multi-select &nbsp;|&nbsp; ' +
      '<kbd>Alt+↑↓←→</kbd> nudge all &nbsp;|&nbsp; <kbd>Shift</kbd> ×5 &nbsp;|&nbsp; ' +
      '<kbd>Ctrl+Z</kbd> undo &nbsp;|&nbsp; <kbd>Ctrl+⇧+Z</kbd> redo &nbsp;|&nbsp; ' +
      '<kbd>Esc</kbd> deselect &nbsp;|&nbsp; <kbd>E</kbd> exit</span>';
    doc.body.appendChild(b);
  }

  /* --------------------------------------------------
   * Keyboard
   * -------------------------------------------------- */

  function onKey(e) {
    var tag     = (e.target.tagName || '').toUpperCase();
    var inField = tag === 'INPUT' || tag === 'TEXTAREA';

    /* Ctrl+Z undo / Ctrl+Shift+Z or Ctrl+Y redo */
    if (e.ctrlKey && !e.altKey && isOn) {
      if (e.key === 'z' && !inField) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (e.key === 'y' && !e.shiftKey && !inField) {
        e.preventDefault(); redo(); return;
      }
    }

    /* E — toggle edit mode */
    if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (!inField && !e.target.isContentEditable) {
        setMode(!isOn); return;
      }
    }

    if (!isOn) return;

    /* Escape — deselect all */
    if (e.key === 'Escape') { e.preventDefault(); deactivateAll(); return; }

    /* Alt + Arrow — nudge all selected */
    if (selectedEls.length && e.altKey && !e.ctrlKey && !e.metaKey) {
      var step = e.shiftKey ? 10 : 2;
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); nudgeAll(0, -step); return;
        case 'ArrowDown':  e.preventDefault(); nudgeAll(0,  step); return;
        case 'ArrowLeft':  e.preventDefault(); nudgeAll(-step, 0); return;
        case 'ArrowRight': e.preventDefault(); nudgeAll( step, 0); return;
      }
    }
  }

  /* --------------------------------------------------
   * Click handling
   * -------------------------------------------------- */

  function onEditableClick(el, e) {
    if (!isOn) return;
    e.stopPropagation();

    if (e.shiftKey) {
      /* Shift+click — toggle secondary selection */
      if (el === activeEl) return; /* can't secondary-select the primary */
      toggleSecondary(el);
    } else {
      /* Normal click — deselect others, activate this one */
      /* Keep secondary selections but remove their class */
      selectedEls.forEach(function (s) {
        if (s !== el) {
          s.classList.remove('editor-selected', 'editor-in-selection');
        }
      });
      selectedEls = [];
      activate(el);
    }
  }

  function onDocClick(e) {
    if (!isOn || !selectedEls.length) return;
    /* Clicked outside all selected elements and outside toolbar */
    var inAny = selectedEls.some(function (el) { return el.contains(e.target); });
    if (inAny) return;
    if (toolbar && toolbar.contains(e.target)) return;
    deactivateAll();
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
      el.addEventListener('click', function (e) { onEditableClick(el, e); });
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
