/* deck.js — partner-decks scrolling deck behaviour
 *
 * Vanilla JS, no dependencies. Mobile-first.
 *
 * Responsibilities:
 *   1. Keyboard navigation between sections (Arrow keys, Page Up/Down,
 *      Home/End, j/k as fallback).
 *   2. Track the current section and update aria-current on the
 *      progress dots + page-meta page-number readout.
 *   3. Toggle review mode (body[data-review="true"]) on `R` keypress
 *      and `?review=1` query string. Persisted in localStorage.
 *   4. Lazy-load below-the-fold images via IntersectionObserver.
 *   5. Briefly show then fade the keyboard-hint chip on first load.
 */

(function () {
  "use strict";

  var REVIEW_KEY = "partner-decks:review";
  var doc = document;
  var html = doc.documentElement;
  var body = doc.body;
  var deck;
  var sections = [];
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
   * Section navigation
   * ------------------------------------------------- */

  function currentSectionIndex() {
    if (!sections.length) return 0;
    var scroll = deck.scrollTop;
    var bestIdx = 0;
    var bestDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var d = Math.abs(sections[i].offsetTop - scroll);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return bestIdx;
  }

  function goTo(index) {
    if (index < 0) index = 0;
    if (index >= sections.length) index = sections.length - 1;
    var target = sections[index];
    if (!target) return;
    deck.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  }

  function handleKey(e) {
    // Ignore when modifier keys are held or the user is typing in a field
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
   *
   * Flips #sec-paradox between data-image="none" and "sparse"
   * so Jcamp can A/B the rhythm coming off the cover.
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
   *
   * Static counter pill (default) + proximity-revealed full nav (prev/next
   * + dots + counter). Theme-aware via data-theme attribute on the host
   * widget — flipped to "dark" when the visible section is data-mode
   * "immersive". Hidden on mobile (CSS handles the breakpoint).
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
    topNavStatic       = qs(".top-nav__static", topNavEl);
    topNavFull         = qs(".top-nav__full", topNavEl);
    topNavCounter      = qs(".top-nav__counter", topNavEl);
    topNavCounterStatic = qs("[data-top-nav-counter-static]", topNavEl);
    topNavDotsEl       = qs(".top-nav__dots", topNavEl);
    topNavPrev         = qs("[data-top-nav-prev]", topNavEl);
    topNavNext         = qs("[data-top-nav-next]", topNavEl);

    buildTopNavDots();

    if (topNavPrev) topNavPrev.addEventListener("click", function () {
      goTo(currentSectionIndex() - 1);
    });
    if (topNavNext) topNavNext.addEventListener("click", function () {
      goTo(currentSectionIndex() + 1);
    });

    /* Proximity detection — only on devices with hover. CSS already hides
     * the widget on coarse-pointer / no-hover devices, but we guard JS
     * too so we don't attach a mousemove listener on touch devices. */
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
   *
   * Buttons (.tab-btn-editorial[data-tab="X"]) toggle panels
   * (.tab-panel-editorial[data-tab="X"]) within the same section.
   * One container per section. Used on Slides 8, 14, 18.
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

    // wire any explicit review toggle buttons
    qsa("[data-review-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggleReview();
      });
    });
  }

  /* -------------------------------------------------
   * Lazy image loading (above-the-fold images use loading="eager")
   * ------------------------------------------------- */

  function initLazyImages() {
    // Native lazy-loading handles most browsers. This adds a small
    // fade-in once an image is decoded.
    qsa("img[loading='lazy']").forEach(function (img) {
      if (img.complete) { img.classList.add("is-loaded"); return; }
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
    });
  }

  /* -------------------------------------------------
   * Rotate-to-landscape hint + post-rotation fullscreen prompt
   *
   * State machine on body[data-rotate-hint]:
   *   "portrait"  — initial state on mobile portrait, asks user to rotate
   *   "landscape" — shown after user rotates from portrait → landscape,
   *                 offers fullscreen via tap (user-gesture requirement)
   *   (unset)     — dismissed
   *
   * Persistence: dismissal saved in sessionStorage; doesn't re-prompt
   * within the same session. Fullscreen requires a tap because every
   * major browser requires a user gesture to enter fullscreen.
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
        // Try to keep landscape after entering fullscreen so the
        // browser chrome can't reappear on orientation change.
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
        // older API returns undefined; lock after a tick
        setTimeout(lockLandscape, 100);
      }
    } catch (e) {
      // iOS Safari < 16.4 etc. don't support fullscreen on arbitrary
      // elements. Silently ignore — overlay still dismisses.
    }
  }

  function initRotateHint() {
    var hint = qs(".rotate-hint");
    if (!hint) return;

    var dismissed = false;
    try { dismissed = sessionStorage.getItem(ROTATE_HINT_KEY) === "1"; } catch (e) {}

    if (!dismissed && isMobile() && isPortrait()) {
      body.setAttribute("data-rotate-hint", "portrait");
    }

    // dismiss buttons (work in both views)
    qsa("[data-rotate-hint-dismiss]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        dismissRotateHint();
      });
    });

    // fullscreen button (landscape view only)
    qsa("[data-rotate-hint-fullscreen]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        requestFullscreenSafe();
        dismissRotateHint();
      });
    });

    // when user rotates from portrait → landscape while the rotate
    // prompt is showing, transition to the fullscreen prompt
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
      landscapeMq.addListener(onOrient); // older Safari
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
    sections = qsa(".section", deck);
    progressLinks = qsa(".deck-progress a");

    window.addEventListener("keydown", handleKey);
    initTopNav();
    setupSectionObserver();
    initEditorialTabs();
    initReviewMode();
    initRotateHint();
    initLazyImages();
    initKbdHint();

    // mark first section as current on load (observer may not fire immediately)
    if (sections.length) markCurrent(sections[0].id);

    // expose minimal API for future use
    window.__deck = {
      goTo: goTo,
      next: function () { goTo(currentSectionIndex() + 1); },
      prev: function () { goTo(currentSectionIndex() - 1); },
      toggleReview: toggleReview,
      sections: sections
    };
  });
})();
