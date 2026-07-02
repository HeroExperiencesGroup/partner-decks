/* deck.js — content interactions for the presentation deck.
 *
 * Navigation, scaling, splash, and fullscreen are handled by
 * presentation.js. This file keeps only the in-slide interactions:
 *   - editorial tabs (Slide 11 — Abu Dhabi gallery)
 *   - swap gallery  (Slide 12 — Expedition experience list)
 *   - compare grid  (hover/tap expand)
 *   - review mode   (R key + body[data-review]) for image-direction notes
 *   - lazy image "is-loaded" hook
 *
 * Vanilla JS, no dependencies.
 */
(function () {
  "use strict";

  var REVIEW_KEY = "partner-decks:review";
  var doc  = document;
  var body = doc.body;

  function ready(fn) {
    if (doc.readyState !== "loading") fn();
    else doc.addEventListener("DOMContentLoaded", fn);
  }
  function qs(sel, root) { return (root || doc).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
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
   * Swap gallery — [data-swap-gallery] containers
   * ------------------------------------------------- */
  function initSwapGallery() {
    qsa("[data-swap-gallery]").forEach(function (gallery) {
      var triggers = qsa("[data-swap]", gallery);
      var panels   = qsa(".swap-panel[data-swap-panel]", gallery);
      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var key = trigger.getAttribute("data-swap");
          triggers.forEach(function (t) { t.classList.remove("is-active"); });
          panels.forEach(function (p)   { p.classList.remove("is-active"); });
          trigger.classList.add("is-active");
          var target = gallery.querySelector(".swap-panel[data-swap-panel='" + key + "']");
          if (target) target.classList.add("is-active");
        });
      });
    });
  }

  /* -------------------------------------------------
   * Compare grid — hover/tap expand
   * ------------------------------------------------- */
  function initCompareGrid() {
    var grids = qsa("[data-compare-grid]");
    if (!grids.length) return;
    grids.forEach(function (grid) {
      var thumbs     = qsa(".compare-grid__thumb", grid);
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
   * Review mode — body[data-review], toggled with R
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
  function toggleReview() { setReview(body.getAttribute("data-review") !== "true"); }
  function initReviewMode() {
    var qsHas = /[?&]review=1\b/.test(location.search);
    var stored = false;
    try { stored = localStorage.getItem(REVIEW_KEY) === "1"; } catch (e) {}
    if (qsHas || stored) setReview(true);

    qsa("[data-review-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); toggleReview(); });
    });

    window.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
      if (e.key === "r" || e.key === "R") toggleReview();
    });
  }

  /* -------------------------------------------------
   * Lazy image loaded hook
   * ------------------------------------------------- */
  function initLazyImages() {
    qsa("img[loading='lazy']").forEach(function (img) {
      if (img.complete) { img.classList.add("is-loaded"); return; }
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
    });
  }

  ready(function () {
    initEditorialTabs();
    initSwapGallery();
    initCompareGrid();
    initReviewMode();
    initLazyImages();
  });
})();
