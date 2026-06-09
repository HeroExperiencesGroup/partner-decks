/* deck.js — partner-decks scrolling deck behaviour
 *
 * Vanilla JS, no dependencies. Mobile-first.
 *
 * Responsibilities:
 *   1. Wrap each .section in a .slide-viewport for 16:9 letterboxing.
 *   2. Keyboard navigation between sections (Arrow keys, Page Up/Down,
 *      Home/End, j/k as fallback).
 *   3. Track the current section and update aria-current on the
 *      progress dots + page-meta page-number readout.
 *   4. Toggle review mode (body[data-review="true"]) on `R` keypress
 *      and `?review=1` query string. Persisted in localStorage.
 *   5. Lazy-load below-the-fold images via IntersectionObserver.
 *   6. Briefly show then fade the keyboard-hint chip on first load.
 *   7. Auto-fullscreen on first user gesture (click / key / touch).
 *   8. Compare-grid hover interaction for Slide 8.
 */

(function () {
  "use strict";

  var REVIEW_KEY = "partner-decks:review";
  var doc = document;
  var html = doc.documentElement;
  var body = doc.body;
  var deck;
  var sections  = [];   /* .section elements — content / observation */
  var viewports = [];   /* .slide-viewport elements — scroll / snap */
  var progressLinks = [];

  function ready(fn) {
    if (doc.readyState !== "loading") fn();
    else doc.addEventListener("DOMContentLoaded", fn);
  }

  function qs(sel, root) { return (root || doc).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  /* -------------------------------------------------
   * 16:9 viewport wrappers
   *
   * Wraps every .section in a .slide-viewport div.
   * The viewport is the scroll-snap target (100dvh).
   * The section inside is sized to 16:9 via CSS.
   * ------------------------------------------------- */

  function wrapSections() {
    sections.forEach(function (s) {
      var vp = doc.createElement("div");
      vp.className = "slide-viewport";
      s.parentNode.insertBefore(vp, s);
      vp.appendChild(s);
    });
    viewports = qsa(".slide-viewport", deck);
  }

  /* -------------------------------------------------
   * Section navigation
   * ------------------------------------------------- */

  function currentSectionIndex() {
    var targets = viewports.length ? viewports : sections;
    if (!targets.length) return 0;
    var scroll = deck.scrollTop;
    var bestIdx = 0;
    var bestDist = Infinity;
    for (var i = 0; i < targets.length; i++) {
      var d = Math.abs(targets[i].offsetTop - scroll);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return bestIdx;
  }

  function goTo(index) {
    var targets = viewports.length ? viewports : sections;
    if (index < 0) index = 0;
    if (index >= targets.length) index = targets.length - 1;
    var target = targets[index];
    if (!target) return;
    deck.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  }

  function handleKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    var idx = currentSectionIndex();
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
      case "j":
        e.preventDefault(); goTo(idx + 1); break;
      case "ArrowUp":
      case "PageUp":
      case "k":
        e.preventDefault(); goTo(idx - 1); break;
      case "Home":
        e.preventDefault(); goTo(0); break;
      case "End":
        e.preventDefault(); goTo(sections.length - 1); break;
      case "r":
      case "R":
        toggleReview(); break;
      case "v":
      case "V":
        toggleParadoxImage(); break;
      default:
        return;
    }
  }

  /* -------------------------------------------------
   * Section 2 image variant toggle (B1 visual-review aid)
   * ------------------------------------------------- */

  function toggleParadoxImage() {
    var s = doc.getElementById("sec-paradox");
    if (!s) return;
    var next = s.getAttribute("data-image") === "sparse" ? "none" : "sparse";
    s.setAttribute("data-image", next);
  }

  /* -------------------------------------------------
   * Progress dots + page-meta sync via IntersectionObserver
   * ------------------------------------------------- */

  function setupSectionObserver() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.intersectionRatio < 0.5) return;
        var id = entry.target.id;
        markCurrent(id);
      });
    }, { root: deck, threshold: [0.5, 0.75] });
    sections.forEach(function (s) { io.observe(s); });
  }

  function markCurrent(id) {
    progressLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    syncTopNav(id);
  }

  /* -------------------------------------------------
   * Top-right nav widget
   * ------------------------------------------------- */

  var topNavEl, topNavStatic, topNavFull, topNavCounter, topNavCounterStatic,
      topNavDotsEl, topNavPrev, topNavNext;
  var topNavDots = [];
  var TOP_NAV_PROXIMITY_PX = 220;

  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  function buildTopNavDots() {
    if (!topNavDotsEl) return;
    topNavDotsEl.innerHTML = "";
    topNavDots = [];
    sections.forEach(function (s, i) {
      var b = doc.createElement("button");
      b.className = "top-nav__dot";
      b.type = "button";
      var label = s.getAttribute("aria-labelledby");
      var labelText = "Slide " + (i + 1);
      if (label) {
        var labelEl = doc.getElementById(label);
        if (labelEl && labelEl.textContent) {
          labelText = labelEl.textContent.trim().slice(0, 60);
        }
      }
      b.setAttribute("aria-label", labelText);
      b.setAttribute("data-slide-number", i + 1);  /* hover tooltip */
      b.addEventListener("click", function () { goTo(i); });
      topNavDotsEl.appendChild(b);
      topNavDots.push(b);
    });
  }

  function syncTopNav(id) {
    if (!topNavEl) return;
    var idx = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].id === id) { idx = i; break; }
    }
    if (idx < 0) idx = currentSectionIndex();
    if (idx < 0) return;

    var counterText = pad2(idx + 1) + " / " + pad2(sections.length);
    if (topNavCounter) topNavCounter.textContent = counterText;
    if (topNavCounterStatic) topNavCounterStatic.textContent = counterText;

    topNavDots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === idx);
      if (i === idx) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });

    var mode = sections[idx].getAttribute("data-mode");
    topNavEl.setAttribute("data-theme", mode === "immersive" ? "dark" : "light");
  }

  function initTopNav() {
    topNavEl = qs(".top-nav");
    if (!topNavEl) return;
    topNavStatic        = qs(".top-nav__static", topNavEl);
    topNavFull          = qs(".top-nav__full", topNavEl);
    topNavCounter       = qs(".top-nav__counter", topNavEl);
    topNavCounterStatic = qs("[data-top-nav-counter-static]", topNavEl);
    topNavDotsEl        = qs(".top-nav__dots", topNavEl);
    topNavPrev          = qs("[data-top-nav-prev]", topNavEl);
    topNavNext          = qs("[data-top-nav-next]", topNavEl);

    buildTopNavDots();

    if (topNavPrev) topNavPrev.addEventListener("click", function () {
      goTo(currentSectionIndex() - 1);
    });
    if (topNavNext) topNavNext.addEventListener("click", function () {
      goTo(currentSectionIndex() + 1);
    });

    var hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (hoverMq.matches && topNavFull) {
      window.addEventListener("mousemove", function (e) {
        var r = topNavFull.getBoundingClientRect();
        var dx = Math.max(0, Math.max(r.left - e.clientX, e.clientX - r.right));
        var dy = Math.max(0, Math.max(r.top  - e.clientY, e.clientY - r.bottom));
        var dist = Math.sqrt(dx * dx + dy * dy);
        topNavEl.classList.toggle("is-near", dist < TOP_NAV_PROXIMITY_PX);
      });
    }
  }

  /* -------------------------------------------------
   * Editorial tabs — [data-tabs-editorial] containers
   * ------------------------------------------------- */

  function initEditorialTabs() {
    qsa("[data-tabs-editorial]").forEach(function (group) {
      var scope = group.closest(".section") || doc;
      var buttons = qsa(".tab-btn-editorial[data-tab]", group);
      var panels  = qsa(".tab-panel-editorial[data-tab]", scope);
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-tab");
          buttons.forEach(function (b) {
            var on = b === btn;
            b.classList.toggle("is-active", on);
            b.setAttribute("aria-selected", on ? "true" : "false");
          });
          panels.forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-tab") === key);
          });
        });
      });
    });
  }

  /* -------------------------------------------------
   * Compare grid — Slide 8 hover-expand interaction
   *
   * Hovering any cell expands that cell and its counterpart
   * (same data-pair index, other half). All other cells
   * compress. Caption fades in on the active pair.
   * Touch: tap to toggle the pair.
   * ------------------------------------------------- */

  function initCompareGrid() {
    var grid = qs("[data-compare-grid]");
    if (!grid) return;

    var cells = qsa(".compare-grid__cell", grid);

    function activate(pair) {
      grid.setAttribute("data-active-pair", pair);
      cells.forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-pair") === pair);
      });
    }

    function deactivate() {
      grid.removeAttribute("data-active-pair");
      cells.forEach(function (c) { c.classList.remove("is-active"); });
    }

    var hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (hoverMq.matches) {
      cells.forEach(function (cell) {
        cell.addEventListener("mouseenter", function () {
          activate(cell.getAttribute("data-pair"));
        });
        cell.addEventListener("mouseleave", deactivate);
      });
    } else {
      /* Touch / coarse pointer: tap to reveal, tap again to dismiss */
      cells.forEach(function (cell) {
        cell.addEventListener("click", function () {
          var pair = cell.getAttribute("data-pair");
          if (grid.getAttribute("data-active-pair") === pair) {
            deactivate();
          } else {
            activate(pair);
          }
        });
      });
    }
  }

  /* -------------------------------------------------
   * Review mode
   * ------------------------------------------------- */

  function setReview(on) {
    if (on) {
      body.setAttribute("data-review", "true");
      try { localStorage.setItem(REVIEW_KEY, "1"); } catch (e) {}
    } else {
      body.removeAttribute("data-review");
      try { localStorage.removeItem(REVIEW_KEY); } catch (e) {}
    }
  }

  function toggleReview() {
    setReview(body.getAttribute("data-review") !== "true");
  }

  function initReviewMode() {
    var qsHas = /[?&]review=1\b/.test(location.search);
    var stored = false;
    try { stored = localStorage.getItem(REVIEW_KEY) === "1"; } catch (e) {}
    if (qsHas || stored) setReview(true);

    qsa("[data-review-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggleReview();
      });
    });
  }

  /* -------------------------------------------------
   * Auto-fullscreen on first user gesture
   *
   * Browsers require a user gesture to enter fullscreen.
   * We listen for the first meaningful interaction and
   * request it then. Fires once; listener self-removes.
   * ------------------------------------------------- */

  function initAutoFullscreen() {
    var done = false;
    function attempt() {
      if (done) return;
      done = true;
      requestFullscreenSafe();
    }
    window.addEventListener("click",    attempt, { once: true });
    window.addEventListener("keydown",  attempt, { once: true });
    window.addEventListener("touchend", attempt, { once: true, passive: true });
  }

  /* -------------------------------------------------
   * Lazy image loading
   * ------------------------------------------------- */

  function initLazyImages() {
    qsa("img[loading='lazy']").forEach(function (img) {
      if (img.complete) { img.classList.add("is-loaded"); return; }
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
    });
  }

  /* -------------------------------------------------
   * Rotate-to-landscape hint + post-rotation fullscreen prompt
   * ------------------------------------------------- */

  var ROTATE_HINT_KEY = "partner-decks:rotate-hint-dismissed";

  function isMobile() {
    return window.matchMedia("(max-width: 48em)").matches;
  }
  function isPortrait() {
    return window.matchMedia("(orientation: portrait)").matches;
  }

  function dismissRotateHint() {
    body.removeAttribute("data-rotate-hint");
    try { sessionStorage.setItem(ROTATE_HINT_KEY, "1"); } catch (e) {}
  }

  function requestFullscreenSafe() {
    var el = doc.documentElement;
    var req = el.requestFullscreen ||
              el.webkitRequestFullscreen ||
              el.mozRequestFullScreen ||
              el.msRequestFullscreen;
    if (!req) return;
    try {
      var p = req.call(el);
      var lockLandscape = function () {
        if (screen.orientation && screen.orientation.lock) {
          try {
            var lp = screen.orientation.lock("landscape");
            if (lp && lp.catch) lp.catch(function () {});
          } catch (e) {}
        }
      };
      if (p && typeof p.then === "function") {
        p.then(lockLandscape).catch(function () {});
      } else {
        setTimeout(lockLandscape, 100);
      }
    } catch (e) {}
  }

  function initRotateHint() {
    var hint = qs(".rotate-hint");
    if (!hint) return;

    var dismissed = false;
    try { dismissed = sessionStorage.getItem(ROTATE_HINT_KEY) === "1"; } catch (e) {}

    if (!dismissed && isMobile() && isPortrait()) {
      body.setAttribute("data-rotate-hint", "portrait");
    }

    qsa("[data-rotate-hint-dismiss]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        dismissRotateHint();
      });
    });

    qsa("[data-rotate-hint-fullscreen]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        requestFullscreenSafe();
        dismissRotateHint();
      });
    });

    var landscapeMq = window.matchMedia("(orientation: landscape)");
    function onOrient() {
      var state = body.getAttribute("data-rotate-hint");
      if (state === "portrait" && landscapeMq.matches && isMobile()) {
        body.setAttribute("data-rotate-hint", "landscape");
      }
    }
    if (landscapeMq.addEventListener) {
      landscapeMq.addEventListener("change", onOrient);
    } else if (landscapeMq.addListener) {
      landscapeMq.addListener(onOrient);
    }
  }

  /* -------------------------------------------------
   * Keyboard hint chip
   * ------------------------------------------------- */

  function initKbdHint() {
    var hint = qs(".kbd-hint");
    if (!hint) return;
    var hasInteracted = false;
    function dismiss() {
      if (hasInteracted) return;
      hasInteracted = true;
      hint.setAttribute("data-hidden", "true");
    }
    window.addEventListener("keydown", dismiss, { once: true });
    deck.addEventListener("scroll", dismiss, { once: true, passive: true });
    setTimeout(dismiss, 6000);
  }

  /* -------------------------------------------------
   * Init
   * ------------------------------------------------- */

  ready(function () {
    deck = qs(".deck");
    if (!deck) return;
    sections      = qsa(".section", deck);
    progressLinks = qsa(".deck-progress a");

    wrapSections();                /* must run before nav setup */

    window.addEventListener("keydown", handleKey);
    initTopNav();
    setupSectionObserver();
    initEditorialTabs();
    initCompareGrid();
    initReviewMode();
    initRotateHint();
    initAutoFullscreen();
    initLazyImages();
    initKbdHint();

    if (sections.length) markCurrent(sections[0].id);

    window.__deck = {
      goTo:         goTo,
      next:         function () { goTo(currentSectionIndex() + 1); },
      prev:         function () { goTo(currentSectionIndex() - 1); },
      toggleReview: toggleReview,
      sections:     sections
    };
  });
})();
