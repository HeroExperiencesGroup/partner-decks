/* deck.js — partner-decks scrolling deck behaviour
 *
 * Vanilla JS, no dependencies. Mobile-first.
 *
 * Responsibilities:
 *   1. Wrap each .section in a .slide-viewport for letterboxing.
 *   2. Lock layout: scale each section (fixed 1920×1080 design ref) to fit
 *      the viewport uniformly — same appearance on every screen size.
 *   3. Pinch-to-zoom: zoom into any slide, pan around, pinch back to default.
 *      Double-tap toggles 2.5× zoom at the tap point.
 *   4. Keyboard navigation between sections (Arrow keys, Page Up/Down,
 *      Home/End, j/k as fallback).
 *   5. Track the current section and update aria-current on the
 *      progress dots + page-meta page-number readout.
 *   6. Toggle review mode (body[data-review="true"]) on `R` keypress
 *      and `?review=1` query string. Persisted in localStorage.
 *   7. Lazy-load below-the-fold images via IntersectionObserver.
 *   8. Briefly show then fade the keyboard-hint chip on first load.
 *   9. Splash screen — progress bar while opening imagery loads, Begin button triggers fullscreen.
 *  10. Compare-grid hover interaction for Slide 8.
 */

(function () {
  "use strict";

  var REVIEW_KEY  = "partner-decks:review";
  var DESIGN_W    = 1920;   /* design reference width  (px) */
  var DESIGN_H    = 1080;   /* design reference height (px) */
  var doc = document;
  var html = doc.documentElement;
  var body = doc.body;
  var deck;
  var sections  = [];   /* .section elements — content / observation */
  var viewports = [];   /* .slide-viewport elements — scroll / snap */
  var progressLinks = [];
  var sectionBaseScales = [];  /* letterbox scale per section, set by updateSectionScales */

  function ready(fn) {
    if (doc.readyState !== "loading") fn();
    else doc.addEventListener("DOMContentLoaded", fn);
  }

  function qs(sel, root) { return (root || doc).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  /* -------------------------------------------------
   * Layout lock — scale each section to fit its viewport.
   *
   * The section is fixed at DESIGN_W × DESIGN_H in CSS.
   * JS calculates a uniform scale factor so the entire design
   * fits within the viewport (letterbox / pillarbox bars are
   * handled by the slide-viewport's ink background). This means
   * every screen sees an identical layout, just scaled.
   * ------------------------------------------------- */

  function setSectionTransform(section, lbScale, userZoom, tx, ty, animate) {
    var combined = lbScale * userZoom;
    var xform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + combined + ')';
    if (animate) {
      section.style.transition = 'transform 300ms ease-out';
      section.style.transform = xform;
      setTimeout(function () { section.style.transition = ''; }, 320);
    } else {
      section.style.transition = '';
      section.style.transform = xform;
    }
  }

  function updateSectionScales() {
    if (!viewports.length) return;
    viewports.forEach(function (vp, i) {
      var s = sections[i];
      if (!s) return;
      var scale = Math.min(vp.clientWidth / DESIGN_W, vp.clientHeight / DESIGN_H);
      sectionBaseScales[i] = scale;
      var userZoom = parseFloat(s.dataset.userZoom || '1');
      var tx = parseFloat(s.dataset.userTx || '0');
      var ty = parseFloat(s.dataset.userTy || '0');
      setSectionTransform(s, scale, userZoom, tx, ty, false);
    });
  }

  /* -------------------------------------------------
   * Pinch-to-zoom — per slide-viewport touch handler.
   *
   * Pinch-out  → zoom in around the pinch centroid.
   * 1-finger   → pan while zoomed; navigation while not.
   * Pinch-in / zoom < 1.1 → snap back to letterbox scale.
   * Double-tap → toggle 2.5× zoom at tap point / reset.
   *
   * While zoomed, touchmove preventDefault stops the deck's
   * scroll-snap from triggering slide navigation.
   * ------------------------------------------------- */

  function initPinchZoom(vp, sectionIdx) {
    var section = sections[sectionIdx];
    if (!section) return;

    var startDist = 0, startZoom = 1, startTx = 0, startTy = 0;
    var startCx = 0, startCy = 0;
    var isPinching = false, isPanning = false;
    var lastPanX = 0, lastPanY = 0;
    var lastTapEndTime = 0;

    function getZoom() { return parseFloat(section.dataset.userZoom || '1'); }
    function getTx()   { return parseFloat(section.dataset.userTx   || '0'); }
    function getTy()   { return parseFloat(section.dataset.userTy   || '0'); }
    function getLb()   { return sectionBaseScales[sectionIdx] || 1; }
    function isZoomed(){ return getZoom() > 1.05; }

    function applyZoom(zoom, tx, ty, animate) {
      var lb   = getLb();
      var vpW  = vp.clientWidth;
      var vpH  = vp.clientHeight;
      zoom = Math.max(1, Math.min(zoom, 8));
      /* Clamp translation so the scaled slide never drifts fully off-screen */
      var maxTx = Math.max(0, (DESIGN_W * lb * zoom - vpW)  / 2);
      var maxTy = Math.max(0, (DESIGN_H * lb * zoom - vpH)  / 2);
      tx = Math.max(-maxTx, Math.min(maxTx, tx));
      ty = Math.max(-maxTy, Math.min(maxTy, ty));
      section.dataset.userZoom = zoom;
      section.dataset.userTx   = tx;
      section.dataset.userTy   = ty;
      setSectionTransform(section, lb, zoom, tx, ty, animate);
    }

    function resetZoom() {
      section.dataset.userZoom = '1';
      section.dataset.userTx   = '0';
      section.dataset.userTy   = '0';
      setSectionTransform(section, getLb(), 1, 0, 0, true);
    }

    function touchDist(t) {
      var dx = t[1].clientX - t[0].clientX;
      var dy = t[1].clientY - t[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function touchMid(t) {
      return {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2
      };
    }

    vp.addEventListener('touchstart', function (e) {
      var t = e.touches;
      if (t.length === 2) {
        isPinching = true;
        isPanning  = false;
        startDist  = touchDist(t);
        startZoom  = getZoom();
        startTx    = getTx();
        startTy    = getTy();
        var m = touchMid(t);
        startCx = m.x;
        startCy = m.y;
      } else if (t.length === 1) {
        isPinching = false;
        lastPanX   = t[0].clientX;
        lastPanY   = t[0].clientY;
        isPanning  = isZoomed();
        /* double-tap detection: compare against last touchend time */
        var now = Date.now();
        if (now - lastTapEndTime < 280) {
          lastTapEndTime = 0; /* reset so triple-tap doesn't fire again */
          if (isZoomed()) {
            resetZoom();
          } else {
            /* Zoom 2.5× around the tap point */
            var cx = t[0].clientX, cy = t[0].clientY;
            var vpW = vp.clientWidth, vpH = vp.clientHeight;
            var z   = 2.5;
            applyZoom(z, (cx - vpW / 2) * (1 - z), (cy - vpH / 2) * (1 - z), true);
          }
        }
      }
    }, { passive: true });

    vp.addEventListener('touchmove', function (e) {
      var t = e.touches;
      if (t.length === 2 && isPinching) {
        e.preventDefault(); /* stop scroll-snap during pinch */
        var d     = touchDist(t);
        var zoom  = startZoom * (d / startDist);
        var ratio = zoom / startZoom;
        var vpW   = vp.clientWidth, vpH = vp.clientHeight;
        /* Zoom around the initial pinch centroid */
        var tx = startTx * ratio + (startCx - vpW / 2) * (1 - ratio);
        var ty = startTy * ratio + (startCy - vpH / 2) * (1 - ratio);
        applyZoom(zoom, tx, ty, false);
      } else if (t.length === 1 && isPanning) {
        e.preventDefault(); /* stop scroll-snap while panning a zoomed slide */
        var dx = t[0].clientX - lastPanX;
        var dy = t[0].clientY - lastPanY;
        lastPanX = t[0].clientX;
        lastPanY = t[0].clientY;
        applyZoom(getZoom(), getTx() + dx, getTy() + dy, false);
      }
    }, { passive: false });

    vp.addEventListener('touchend', function (e) {
      if (e.touches.length < 2) { isPinching = false; }
      if (e.touches.length === 0) {
        isPanning      = false;
        lastTapEndTime = Date.now(); /* record for double-tap detection */
        if (getZoom() < 1.1) { resetZoom(); }
      }
    }, { passive: true });
  }

  /* -------------------------------------------------
   * 16:9 viewport wrappers
   *
   * Wraps every .section in a .slide-viewport div.
   * The viewport is the scroll-snap target (100dvh).
   * The section inside is fixed at 1920×1080 and scaled
   * by updateSectionScales() to fit the current viewport.
   * ------------------------------------------------- */

  function wrapSections() {
    sections.forEach(function (s, i) {
      var vp = doc.createElement("div");
      vp.className = "slide-viewport";
      s.parentNode.insertBefore(vp, s);
      vp.appendChild(s);
    });
    viewports = qsa(".slide-viewport", deck);
    viewports.forEach(function (vp, i) {
      initPinchZoom(vp, i);
    });
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
    /* Supports multiple [data-compare-grid] instances (e.g. Atmosphere tab
     * and Practice tab in the same section). Each grid is independent. */
    var grids  = qsa("[data-compare-grid]");
    if (!grids.length) return;

    var hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    grids.forEach(function (grid) {
      var thumbs     = qsa(".compare-grid__thumb",      grid);
      var largeCells = qsa(".compare-grid__large-cell", grid);

      function showPair(pair) {
        thumbs.forEach(function (t) {
          t.classList.toggle("is-active", t.getAttribute("data-pair") === pair);
        });
        largeCells.forEach(function (c) {
          c.classList.toggle("is-active", c.getAttribute("data-pair") === pair);
        });
      }

      thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          showPair(thumb.getAttribute("data-pair"));
        });
      });
    });
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
   * Splash screen — blocks interaction until opening imagery is ready,
   * then lets the user choose to enter fullscreen via the button.
   * ------------------------------------------------- */

  function initSplash() {
    var splash   = doc.getElementById("splash");
    var btn      = doc.getElementById("splashBtn");
    var bar      = doc.getElementById("splashLoaderBar");
    var label    = doc.getElementById("splashLoadingLabel");
    if (!splash || !btn) return;

    var imgs  = qsa("img[loading='eager'], img[data-splash-preload='true']", doc.body);
    var total = imgs.length || 1;
    var done  = 0;
    var ready = false;

    function enable() {
      if (ready) return;
      ready = true;
      btn.disabled = false;
      btn.removeAttribute("aria-disabled");
      if (label) label.textContent = "Ready";
      if (bar)   bar.style.width = "100%";
    }

    function tick() {
      done++;
      var pct = Math.min(100, Math.round((done / total) * 100));
      if (bar)   bar.style.width = pct + "%";
      if (label && !ready) label.textContent = "Loading… " + pct + "%";
      if (done >= total) enable();
    }

    /* Wait only for the opening image set. Below-fold imagery must stay
     * lazy; otherwise a 21-slide deck pays the full image cost up front. */
    if (!imgs.length) enable();
    imgs.forEach(function (img) {
      var settled = false;
      function settle() { tick(); }
      function settleOnce() {
        if (settled) return;
        settled = true;
        settle();
      }

      if (typeof img.decode === "function") {
        img.decode().then(settleOnce, function () {
          /* decode() can reject before load resolves or on detached nodes;
           * fall back to the load/error events. */
          if (img.complete) { settleOnce(); return; }
          img.addEventListener("load",  settleOnce, { once: true });
          img.addEventListener("error", settleOnce, { once: true });
        });
      } else if (img.complete) {
        settleOnce();
      } else {
        img.addEventListener("load",  settleOnce, { once: true });
        img.addEventListener("error", settleOnce, { once: true });
      }
    });

    /* Safety net — never trap the user behind a slow/failed opening asset. */
    var fallback = setTimeout(enable, 3000);

    btn.addEventListener("click", function () {
      clearTimeout(fallback);
      requestFullscreenSafe();
      splash.classList.add("is-hidden");
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 750);
    });
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
    updateSectionScales();         /* apply initial letterbox scale to every section */

    /* Re-scale on viewport resize (orientation change, browser resize, etc.) */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSectionScales, 80);
    });

    window.addEventListener("keydown", handleKey);
    initTopNav();
    setupSectionObserver();
    initEditorialTabs();
    initCompareGrid();
    initReviewMode();
    initRotateHint();
    initSplash();
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
