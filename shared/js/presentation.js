/* presentation.js — click-through presentation engine
 *
 * Adapted from the reusable splash + navigation kit. Changes from stock:
 *   1. No click-to-advance ("clicker mode" off) — clicks stay free for the
 *      in-browser editor and content interactions.
 *   2. Keydown ignores Alt/Ctrl/Meta so editor shortcuts (Alt+arrows nudge,
 *      Ctrl+Z undo, etc.) don't also navigate slides.
 *   3. Esc returns to the splash only when the editor is NOT active, so it
 *      defers to the editor's own Esc handling while you're editing.
 *
 * Navigation keys: Right / Down / Space / Enter / PageDown = next;
 *                  Left / Up / PageUp / Backspace = back; Home/End; Esc.
 *
 * Expected structure:
 *   #splash, #deck > #stage > .slide[data-slide], plus HUD elements.
 */
(() => {
  function initPresentation(){
    const CONFIG = {
      designWidth:1920,
      designHeight:1080,
      storageKey:'pitch-deck-progressive',
      mobileMaxSmallSide:920,
      zoomMax:3.25,
      clickIgnore:'a,button,input,select,textarea,label,[contenteditable="true"],[data-no-slide-nav]'
    };

    const splash = document.getElementById('splash');
    const deck = document.getElementById('deck');
    const stage = document.getElementById('stage');
    const dotsWrap = document.getElementById('dots');
    const counter = document.getElementById('counter');
    const progress = document.getElementById('progress');
    const exitFsBtn = document.getElementById('exitFs');
    const beginBtn = document.getElementById('beginBtn');
    const progToggle = document.getElementById('progToggle');
    const progState = document.getElementById('progState');
    const slideRail = document.getElementById('slideRail');

    if (!splash || !deck || !stage || !dotsWrap || !counter || !progress || !beginBtn || !slideRail) {
      console.warn('Presentation: required splash/deck/navigation elements were not found.');
      return;
    }

    function editorActive(){ return document.body.getAttribute('data-editor') === 'true'; }

    const slides = Array.from(stage.querySelectorAll('.slide'));
    slides.forEach((slide,index) => {
      if (!slide.dataset.slide) slide.dataset.slide = String(index + 1);
    });
    const TOTAL = slides.length;
    if (!TOTAL) {
      console.warn('Presentation: no .slide elements were found inside #stage.');
      return;
    }

    const maxSteps = {};
    slides.forEach(slide => {
      const n = Number(slide.dataset.slide);
      const explicit = parseInt(slide.dataset.steps || '', 10);
      if (!Number.isNaN(explicit)) { maxSteps[n] = explicit; return; }
      const steps = Array.from(slide.querySelectorAll('[data-step]'))
        .map(el => parseInt(el.dataset.step || '0', 10))
        .filter(Number.isFinite);
      maxSteps[n] = steps.length ? Math.max(...steps) : 0;
    });

    let cur = 1;
    let step = 0;
    let inSplash = true;
    let progressive = localStorage.getItem(CONFIG.storageKey);
    progressive = progressive === null ? false : progressive === 'true';

    const coarsePointer = window.matchMedia ? window.matchMedia('(hover: none) and (pointer: coarse)') : null;
    let baseScale = 1;
    let mobileZoom = 1;
    let mobilePanX = 0;
    let mobilePanY = 0;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let panStartX = 0;
    let panStartY = 0;
    let panTouchX = 0;
    let panTouchY = 0;
    let pinchAnchor = {x:CONFIG.designWidth / 2,y:CONFIG.designHeight / 2};
    let isPinching = false;
    let isPanning = false;
    let suppressClickUntil = 0;
    let suppressTouchNavUntil = 0;
    let pinchReleaseGuard = false;

    function clamp(value,min,max){ return Math.max(min, Math.min(max, value)); }
    function viewportSize(){
      const vv = window.visualViewport;
      return {width:vv ? vv.width : window.innerWidth,height:vv ? vv.height : window.innerHeight};
    }
    function isMobileLike(){
      const vp = viewportSize();
      const coarse = (coarsePointer && coarsePointer.matches) || navigator.maxTouchPoints > 1;
      return coarse && Math.min(vp.width, vp.height) <= CONFIG.mobileMaxSmallSide;
    }
    function isMobilePresenting(){ return document.body.classList.contains('mobile-presenting'); }
    function isMobilePortrait(){
      const vp = viewportSize();
      return isMobilePresenting() && vp.height > vp.width;
    }
    function mobileZoomLocked(){ return isMobilePresenting() && mobileZoom > 1.02; }
    function suppressGestureNavigation(ms = 650){
      const until = Date.now() + ms;
      suppressClickUntil = Math.max(suppressClickUntil, until);
      suppressTouchNavUntil = Math.max(suppressTouchNavUntil, until);
    }

    function stagePlacement(zoomValue = mobileZoom, panX = mobilePanX, panY = mobilePanY){
      const vp = viewportSize();
      const rotated = isMobilePortrait();
      const scale = baseScale * zoomValue;
      const visualWidth = (rotated ? CONFIG.designHeight : CONFIG.designWidth) * scale;
      const visualHeight = (rotated ? CONFIG.designWidth : CONFIG.designHeight) * scale;
      return {
        x:(vp.width - visualWidth) / 2 + (rotated ? visualWidth : 0) + panX,
        y:(vp.height - visualHeight) / 2 + panY,
        scale,
        rotated
      };
    }
    function screenFromDesign(point, zoomValue = mobileZoom, panX = mobilePanX, panY = mobilePanY){
      const place = stagePlacement(zoomValue, panX, panY);
      if (place.rotated) return {x:place.x - point.y * place.scale,y:place.y + point.x * place.scale};
      return {x:place.x + point.x * place.scale,y:place.y + point.y * place.scale};
    }
    function designFromScreen(point){
      const place = stagePlacement();
      if (place.rotated) {
        return {
          x:clamp((point.y - place.y) / place.scale, 0, CONFIG.designWidth),
          y:clamp((place.x - point.x) / place.scale, 0, CONFIG.designHeight)
        };
      }
      return {
        x:clamp((point.x - place.x) / place.scale, 0, CONFIG.designWidth),
        y:clamp((point.y - place.y) / place.scale, 0, CONFIG.designHeight)
      };
    }
    function clampMobilePan(){
      const vp = viewportSize();
      const rotated = isMobilePortrait();
      const visualWidth = (rotated ? CONFIG.designHeight : CONFIG.designWidth) * baseScale * mobileZoom;
      const visualHeight = (rotated ? CONFIG.designWidth : CONFIG.designHeight) * baseScale * mobileZoom;
      const limitX = Math.max(0, (visualWidth - vp.width) / 2);
      const limitY = Math.max(0, (visualHeight - vp.height) / 2);
      mobilePanX = clamp(mobilePanX, -limitX, limitX);
      mobilePanY = clamp(mobilePanY, -limitY, limitY);
    }
    function applyMobileZoom(){
      if (mobileZoom <= 1.02) { mobileZoom = 1; mobilePanX = 0; mobilePanY = 0; }
      clampMobilePan();
      const place = stagePlacement();
      stage.style.setProperty('--stage-x', place.x.toFixed(1) + 'px');
      stage.style.setProperty('--stage-y', place.y.toFixed(1) + 'px');
      stage.style.setProperty('--stage-scale', place.scale.toFixed(6));
      stage.style.setProperty('--stage-rotate', place.rotated ? '90deg' : '0deg');
      document.body.classList.toggle('mobile-zoomed', mobileZoomLocked());
    }
    function resetMobileZoom(){
      mobileZoom = 1; mobilePanX = 0; mobilePanY = 0;
      isPinching = false; isPanning = false; pinchReleaseGuard = false;
      document.body.classList.remove('mobile-zooming','mobile-zoomed');
      applyMobileZoom();
    }
    function prepareMobilePresentation(){
      document.body.classList.toggle('mobile-presenting', isMobileLike());
      resetMobileZoom();
      fitStage();
    }
    function fitStage(){
      const vp = viewportSize();
      const rotate = isMobilePortrait();
      baseScale = Math.min(
        vp.width / (rotate ? CONFIG.designHeight : CONFIG.designWidth),
        vp.height / (rotate ? CONFIG.designWidth : CONFIG.designHeight)
      );
      stage.style.setProperty('--scale', baseScale);
      document.body.classList.toggle('mobile-portrait', rotate);
      applyMobileZoom();
    }

    window.addEventListener('resize', fitStage);
    window.addEventListener('orientationchange', () => setTimeout(fitStage, 220));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitStage);
    fitStage();

    dotsWrap.replaceChildren();
    for (let i = 1; i <= TOTAL; i++) {
      const d = document.createElement('div');
      d.className = 'dot'; d.id = 'dot' + i;
      dotsWrap.appendChild(d);
    }

    slideRail.replaceChildren();
    const railItems = [];
    for (let i = 1; i <= TOTAL; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rail-item';
      btn.dataset.slide = String(i);
      btn.style.setProperty('--rail-y', ((i - 0.5) / TOTAL * 100) + '%');
      btn.setAttribute('aria-label', 'Go to slide ' + i);
      btn.innerHTML = '<span class="rail-num">' + String(i).padStart(2, '0') + '</span><span class="rail-tick"></span>';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (mobileZoomLocked()) return;
        show(i, {dir:i < cur ? 'back' : 'fwd'});
        hideSlideRail();
      });
      slideRail.appendChild(btn);
      railItems.push(btn);
    }

    function syncSlideRail(){
      railItems.forEach(btn => btn.classList.toggle('cur', Number(btn.dataset.slide) === cur));
    }
    function hideSlideRail(){
      if (slideRail.contains(document.activeElement)) document.activeElement.blur();
      railItems.forEach(btn => {
        btn.classList.remove('is-visible','is-hot');
        btn.style.setProperty('--rail-opacity', '0');
        btn.style.setProperty('--rail-scale', '.4');
        btn.style.setProperty('--rail-shift', '10px');
      });
    }
    function updateSlideRail(e){
      if (inSplash) { hideSlideRail(); return; }
      const edgeReach = 170;
      const verticalReach = 48;
      const edgeFactor = Math.max(0, 1 - ((window.innerWidth - e.clientX) / edgeReach));
      if (edgeFactor <= 0) { hideSlideRail(); return; }
      railItems.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const verticalFactor = Math.max(0, 1 - (Math.abs(e.clientY - center) / verticalReach));
        const strength = Math.pow(edgeFactor * verticalFactor, 1.08);
        const opacity = strength < .04 ? 0 : Math.min(1, strength);
        btn.classList.toggle('is-visible', opacity > .08);
        btn.classList.toggle('is-hot', opacity > .62);
        btn.style.setProperty('--rail-opacity', opacity.toFixed(3));
        btn.style.setProperty('--rail-scale', (.45 + opacity * .9).toFixed(3));
        btn.style.setProperty('--rail-shift', (10 - opacity * 14).toFixed(2) + 'px');
      });
    }

    function syncToggleUI(){
      if (!progToggle || !progState) return;
      progToggle.checked = progressive;
      progState.textContent = progressive ? 'On' : 'Off';
    }
    if (progToggle) {
      progToggle.addEventListener('change', () => {
        progressive = progToggle.checked;
        localStorage.setItem(CONFIG.storageKey, progressive);
        syncToggleUI();
      });
    }
    syncToggleUI();

    function slideFor(n){ return slides.find(s => Number(s.dataset.slide) === n); }
    function applySteps(section, activeStep){
      if (!section) return;
      section.querySelectorAll('[data-step]').forEach(el => {
        el.classList.toggle('shown', parseInt(el.dataset.step || '0', 10) <= activeStep);
      });
    }
    function show(n, opts){
      opts = opts || {};
      n = Math.max(1, Math.min(TOTAL, n));
      if (n !== cur && mobileZoomLocked()) resetMobileZoom();
      cur = n;
      const section = slideFor(n);
      slides.forEach(s => s.classList.toggle('active', s === section));
      const mx = maxSteps[n] || 0;
      if (!progressive) step = mx;
      else if (opts.dir === 'back') step = mx;
      else if (opts.keepStep) step = Math.min(step, mx);
      else step = 0;
      applySteps(section, step);
      for (let i = 1; i <= TOTAL; i++) {
        const d = document.getElementById('dot' + i);
        if (d) d.className = 'dot' + (i === n ? ' cur' : i < n ? ' done' : '');
      }
      syncSlideRail();
      counter.textContent = n + ' / ' + TOTAL;
      progress.style.width = TOTAL > 1 ? ((n - 1) / (TOTAL - 1) * 100) + '%' : '100%';
      updateHash();
    }
    function fwd(){
      if (mobileZoomLocked()) return;
      if (inSplash) { startPresentation(); return; }
      if (progressive && step < (maxSteps[cur] || 0)) {
        step++; applySteps(slideFor(cur), step); updateHash(); return;
      }
      if (cur < TOTAL) show(cur + 1, {dir:'fwd'});
    }
    function bwd(){
      if (mobileZoomLocked() || inSplash) return;
      if (cur > 1) show(cur - 1, {dir:'back'});
    }

    let hashLock = false;
    function updateHash(){
      if (inSplash) return;
      hashLock = true;
      location.hash = '/' + cur + '/' + step;
      setTimeout(() => hashLock = false, 0);
    }
    function readHash(){
      const m = (location.hash || '').match(/^#\/(\d+)(?:\/(\d+))?/);
      if (!m) return null;
      return {slide:Math.max(1, Math.min(TOTAL, +m[1])),step:m[2] ? +m[2] : 0};
    }
    function jumpTo(slide,targetStep){
      show(slide, {dir:'fwd'});
      step = Math.min(targetStep, maxSteps[slide] || 0);
      if (!progressive) step = maxSteps[slide] || 0;
      applySteps(slideFor(slide), step);
      updateHash();
    }
    window.addEventListener('hashchange', () => {
      if (hashLock || inSplash) return;
      const h = readHash();
      if (h) jumpTo(h.slide, h.step);
    });

    async function lockLandscape(){
      if (!screen.orientation || !screen.orientation.lock) return;
      try { await screen.orientation.lock('landscape'); } catch (err) {}
    }
    function unlockLandscape(){
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (err) {}
      }
    }
    async function enterFS(){
      if (document.documentElement.requestFullscreen) {
        try { await document.documentElement.requestFullscreen({navigationUI:'hide'}); } catch (err) {}
      }
      await lockLandscape();
    }
    function exitFS(){
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
    if (exitFsBtn) exitFsBtn.addEventListener('click', exitFS);
    document.addEventListener('fullscreenchange', () => {
      if (exitFsBtn) exitFsBtn.style.display = document.fullscreenElement ? 'block' : 'none';
      fitStage();
    });

    async function startPresentation(){
      prepareMobilePresentation();
      await enterFS();
      begin();
    }
    function begin(){
      prepareMobilePresentation();
      inSplash = false;
      splash.classList.add('out');
      setTimeout(() => splash.style.display = 'none', 620);
      deck.classList.add('active');
      fitStage();
      history.replaceState(null, '', location.pathname + location.search);
      show(1, {dir:'fwd'});
    }
    function returnSplash(){
      inSplash = true;
      if (document.fullscreenElement) exitFS();
      unlockLandscape();
      resetMobileZoom();
      document.body.classList.remove('mobile-presenting','mobile-portrait','mobile-zooming','mobile-zoomed');
      splash.style.display = '';
      requestAnimationFrame(() => splash.classList.remove('out'));
      deck.classList.remove('active');
      cur = 1; step = 0;
      history.replaceState(null, '', location.pathname + location.search);
    }

    beginBtn.addEventListener('click', e => { e.stopPropagation(); startPresentation(); });

    document.addEventListener('keydown', e => {
      if (e.target && e.target.closest && e.target.closest('input,select,textarea,[contenteditable="true"]')) return;
      /* Let editor shortcuts (Alt+arrows, Ctrl+Z, …) through untouched. */
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const navKey = ['ArrowRight','ArrowDown','PageDown',' ','Enter','ArrowLeft','ArrowUp','PageUp','Backspace','Home','End'].includes(e.key);
      if (mobileZoomLocked() && navKey) { e.preventDefault(); return; }
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault(); fwd(); break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault(); bwd(); break;
        case 'Home':
          if (!inSplash) { e.preventDefault(); show(1, {dir:'fwd'}); }
          break;
        case 'End':
          if (!inSplash) { e.preventDefault(); show(TOTAL, {dir:'back'}); }
          break;
        case 'Escape':
          /* Defer to the editor's Esc handling while editing. */
          if (!inSplash && !editorActive()) returnSplash();
          break;
      }
    });

    deck.addEventListener('mousemove', updateSlideRail, {passive:true});
    deck.addEventListener('mouseleave', hideSlideRail);
    window.addEventListener('blur', hideSlideRail);

    /* NOTE: click-to-advance ("clicker mode") intentionally omitted so clicks
     * remain free for the editor and content interactions. */

    let tx = 0;
    let ty = 0;
    function touchDistance(touches){
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }
    function touchCenter(touches){
      return {
        x:(touches[0].clientX + touches[1].clientX) / 2,
        y:(touches[0].clientY + touches[1].clientY) / 2
      };
    }
    function startPan(touch){
      isPanning = true;
      panStartX = mobilePanX; panStartY = mobilePanY;
      panTouchX = touch.clientX; panTouchY = touch.clientY;
    }
    deck.addEventListener('touchstart', e => {
      if (inSplash) return;
      if (isMobilePresenting() && e.touches.length === 2) {
        e.preventDefault();
        isPinching = true; isPanning = false; pinchReleaseGuard = true;
        pinchStartDistance = Math.max(1, touchDistance(e.touches));
        pinchStartZoom = mobileZoom;
        pinchAnchor = designFromScreen(touchCenter(e.touches));
        suppressGestureNavigation();
        document.body.classList.add('mobile-zooming');
        return;
      }
      if (mobileZoomLocked() && e.touches.length === 1) {
        e.preventDefault(); startPan(e.touches[0]); return;
      }
      tx = e.changedTouches[0].clientX;
      ty = e.changedTouches[0].clientY;
    }, {passive:false});
    deck.addEventListener('touchmove', e => {
      if (inSplash) return;
      if (isPinching && e.touches.length >= 2) {
        e.preventDefault();
        suppressGestureNavigation();
        const center = touchCenter(e.touches);
        const nextZoom = clamp(pinchStartZoom * (touchDistance(e.touches) / pinchStartDistance), 1, CONFIG.zoomMax);
        mobileZoom = nextZoom <= 1.02 ? 1 : nextZoom;
        if (mobileZoom > 1) {
          const unpanned = screenFromDesign(pinchAnchor, mobileZoom, 0, 0);
          mobilePanX = center.x - unpanned.x;
          mobilePanY = center.y - unpanned.y;
        }
        applyMobileZoom();
        return;
      }
      if (mobileZoomLocked() && e.touches.length === 1) {
        e.preventDefault();
        if (!isPanning) startPan(e.touches[0]);
        mobilePanX = panStartX + (e.touches[0].clientX - panTouchX);
        mobilePanY = panStartY + (e.touches[0].clientY - panTouchY);
        applyMobileZoom();
      }
    }, {passive:false});
    deck.addEventListener('touchend', e => {
      if (inSplash) return;
      if (isPinching) {
        e.preventDefault();
        suppressGestureNavigation();
        if (e.touches.length < 2) {
          isPinching = false;
          document.body.classList.remove('mobile-zooming');
          if (mobileZoomLocked() && e.touches.length === 1) startPan(e.touches[0]);
          if (e.touches.length === 0) pinchReleaseGuard = false;
        }
        return;
      }
      if (pinchReleaseGuard || Date.now() < suppressTouchNavUntil) {
        e.preventDefault();
        suppressGestureNavigation();
        if (e.touches.length === 0) pinchReleaseGuard = false;
        return;
      }
      if (isPanning || mobileZoomLocked()) {
        e.preventDefault();
        suppressGestureNavigation();
        if (e.touches.length === 0) isPanning = false;
        return;
      }
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) fwd(); else bwd();
      }
    }, {passive:false});
    deck.addEventListener('touchcancel', () => {
      isPinching = false; isPanning = false; pinchReleaseGuard = false;
      suppressGestureNavigation();
      document.body.classList.remove('mobile-zooming');
    }, {passive:true});

    window.Presentation = { show, next:fwd, previous:bwd, start:startPresentation, returnSplash, fit:fitStage };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresentation);
  } else {
    initPresentation();
  }
})();
