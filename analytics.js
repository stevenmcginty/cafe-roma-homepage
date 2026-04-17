/* ==========================================================================
   CAFE ROMA — analytics loader
   Loads GA4 + Microsoft Clarity only after the user accepts cookies.
   Also tracks key CTAs as custom events (sign in, order online, phone, etc.).
   ========================================================================== */

(function () {
  const CFG = window.CAFE_ROMA_ANALYTICS || {};
  const STORAGE_KEY = 'cr_consent';
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
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
    setTimeout(() => { banner.hidden = true; }, 300);
  }

  function loadGA4(id) {
    if (!id || id.indexOf('G-XXXX') === 0) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  function loadClarity(id) {
    if (!id || id.indexOf('XXXX') === 0) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', id);
  }

  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    if (typeof window.clarity === 'function') window.clarity('event', name);
  }

  function wireCtaEvents() {
    // Sign In / Loyalty
    document.querySelectorAll('a[href*="koraos.co.uk/cafe-roma"]').forEach(a => {
      a.addEventListener('click', () => {
        const isMenu = a.href.indexOf('/menu') !== -1;
        trackEvent(isMenu ? 'click_order_online' : 'click_sign_in', {
          link_url: a.href,
          link_text: (a.innerText || '').trim().slice(0, 60)
        });
      });
    });
    // Phone
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.addEventListener('click', () => trackEvent('click_phone', { number: a.getAttribute('href').replace('tel:', '') }));
    });
    // Social
    document.querySelectorAll('.social a').forEach(a => {
      a.addEventListener('click', () => trackEvent('click_social', {
        platform: (a.getAttribute('aria-label') || 'unknown').toLowerCase()
      }));
    });
    // Directions / map
    document.querySelectorAll('a[href*="google.com/maps"], iframe[src*="google.com/maps"]').forEach(el => {
      if (el.tagName === 'A') el.addEventListener('click', () => trackEvent('click_directions'));
    });
  }

  function enable() {
    loadGA4(CFG.GA4_ID);
    loadClarity(CFG.CLARITY_ID);
    // Give scripts a tick to register, then wire events.
    setTimeout(wireCtaEvents, 400);
  }

  function accept() { save('accepted'); hideBanner(); enable(); }
  function decline() { save('declined'); hideBanner(); }

  if (acceptBtn) acceptBtn.addEventListener('click', accept);
  if (declineBtn) declineBtn.addEventListener('click', decline);

  const prior = stored();
  if (prior === 'accepted') enable();
  else if (prior !== 'declined') showBanner();
})();
