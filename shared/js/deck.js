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
      if (p && typeof p.then === "function") p.catch(function () {});
    } catch (e) {
      // iOS Safari < 16.4 and some others don't support fullscreen on
      // arbitrary elements. Silently ignore — user-gesture dismiss the
      // overlay regardless.
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
    setupSectionObserver();
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
