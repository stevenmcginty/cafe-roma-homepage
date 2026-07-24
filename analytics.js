/* ==========================================================================
   CAFE ROMA — analytics

   TWO providers, one file. Edit CONFIG below — nothing else.

   1. Vercel Web Analytics  — cookieless, no ID needed, works the moment you
                              flick it on in the Vercel dashboard. Gives you
                              visitors / page views / referrers / countries /
                              devices. Loads WITHOUT consent (no cookies, no
                              personal data), which is why you get numbers even
                              from people who ignore the banner.
   2. Google Analytics 4    — full audience + acquisition reporting.
                              CONSENT-GATED: gtag.js sets cookies, so it only
                              loads after the visitor accepts the banner.

   Setup instructions: see ANALYTICS.md in this folder.
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     CONFIG — the only bit you need to change
     ====================================================================== */
  const CONFIG = Object.assign({
    // Google Analytics 4 — property "Cafe Roma", stream "website".
    GA4_ID: 'G-RSD4FTLCTB',

    // Vercel Web Analytics — leave true. Enable it once in the Vercel
    // dashboard: Project → Analytics → Enable Web Analytics.
    VERCEL: true,

    // Vercel Speed Insights — real-world page-speed scores from your visitors.
    // Enable in Vercel dashboard the same way, then set this to true.
    VERCEL_SPEED: false
  }, window.CAFE_ROMA_ANALYTICS || {});

  const STORAGE_KEY = 'cr_consent';
  const isPlaceholder = v => !v || /^G?-?X{4,}/i.test(String(v)) || String(v).indexOf('XXXX') !== -1;

  /* ======================================================================
     Consent storage + banner
     ====================================================================== */
  const banner     = document.getElementById('cookieBanner');
  const acceptBtn  = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');

  function stored() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function save(v)  { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('visible'));
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('visible');
    setTimeout(function () { banner.hidden = true; }, 320);
  }

  /* ======================================================================
     Providers
     ====================================================================== */

  // --- Vercel Web Analytics (cookieless — loads immediately) ---------------
  function loadVercel() {
    if (!CONFIG.VERCEL) return;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    const s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
  }

  function loadVercelSpeed() {
    if (!CONFIG.VERCEL_SPEED) return;
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    const s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(s);
  }

  // --- Google Analytics 4 (consent-gated) ---------------------------------
  function loadGA4(id) {
    if (isPlaceholder(id)) return false;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    return true;
  }

  /* ======================================================================
     Unified event tracking — fans out to whichever providers are live
     ====================================================================== */
  function track(name, params) {
    const data = params || {};
    try { if (typeof window.gtag === 'function') window.gtag('event', name, data); } catch (e) {}
    try { if (typeof window.va === 'function') window.va('event', { name: name, data: data }); } catch (e) {}
  }
  window.crTrack = track;   // available to the rest of the site

  /* ======================================================================
     Event wiring — delegated, so it also covers content rendered later
     (menu categories, map chips, etc.)
     ====================================================================== */
  function page() {
    return (location.pathname.indexOf('menu') !== -1) ? 'menu' : 'home';
  }

  function wireEvents() {
    document.addEventListener('click', function (e) {
      const t = e.target;
      if (!t || !t.closest) return;

      // Mobile action dock
      const dockItem = t.closest('[data-dock]');
      if (dockItem) {
        track('dock_tap', { action: dockItem.dataset.dock, page: page() });
        return;
      }

      // KoraOS — sign in / order online
      const kora = t.closest('a[href*="koraos.co.uk"]');
      if (kora) {
        const label = (kora.innerText || '').trim().toLowerCase();
        track(label.indexOf('order') !== -1 ? 'click_order_online' : 'click_sign_in', {
          page: page(),
          link_text: (kora.innerText || '').trim().slice(0, 60)
        });
        return;
      }

      // Menu page
      const menuLink = t.closest('a[href$="menu.html"], a[href="/menu"]');
      if (menuLink) { track('click_menu', { page: page() }); return; }

      // Phone
      const tel = t.closest('a[href^="tel:"]');
      if (tel) { track('click_phone', { page: page() }); return; }

      // Directions / map
      const dir = t.closest('a[href*="google.com/maps"]');
      if (dir) { track('click_directions', { page: page() }); return; }

      // Social
      const social = t.closest('.social a');
      if (social) {
        track('click_social', { platform: (social.getAttribute('aria-label') || 'unknown').toLowerCase() });
        return;
      }

      // Menu page: category chip
      const chip = t.closest('.cat-chip');
      if (chip) { track('menu_category', { category: (chip.textContent || '').trim().slice(0, 40) }); return; }

      // Menu page: allergen filter opened
      if (t.closest('#allergenToggle')) { track('allergen_filter_open', {}); return; }
    }, true);

    // "A Day at Roma" — which part of the day people swipe to
    const dayRail = document.getElementById('dayRail');
    if (dayRail) {
      let swiped = false;
      dayRail.addEventListener('scroll', function () {
        if (swiped) return;
        swiped = true;   // once per visit; we only care that they engaged
        track('day_timeline_swipe', { page: page() });
      }, { passive: true });
    }

    // Scroll depth — tells you how far down people actually get
    const marks = [25, 50, 75, 100];
    const fired = {};
    let ticking = false;
    function checkDepth() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round(((window.pageYOffset || doc.scrollTop) / max) * 100) : 100;
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          track('scroll_depth', { percent: m, page: page() });
        }
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(checkDepth); ticking = true; }
    }, { passive: true });

    // Was the shop open when they visited? Useful context on every session.
    setTimeout(function () {
      const s = window.CAFE_ROMA_STATUS;
      if (s) track('visit_context', { shop_open: !!s.open, page: page() });
    }, 1200);
  }

  /* ======================================================================
     Boot
     ====================================================================== */

  // Cookieless providers run regardless of the banner.
  loadVercel();
  loadVercelSpeed();

  function enableConsented() {
    loadGA4(CONFIG.GA4_ID);
  }

  function accept()  { save('accepted'); hideBanner(); enableConsented(); track('consent', { choice: 'accepted' }); }
  function decline() { save('declined'); hideBanner(); track('consent', { choice: 'declined' }); }

  if (acceptBtn)  acceptBtn.addEventListener('click', accept);
  if (declineBtn) declineBtn.addEventListener('click', decline);

  const prior = stored();
  if (prior === 'accepted') {
    enableConsented();
  } else if (prior !== 'declined') {
    // Nothing to consent to while GA4 is still a placeholder — don't nag.
    if (!isPlaceholder(CONFIG.GA4_ID)) showBanner();
  }

  wireEvents();
})();
