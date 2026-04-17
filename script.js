/* ==========================================================================
   CAFE ROMA — interactions
   Nav, reveal-on-scroll, mobile menu, active-section highlight, hero parallax
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ---------- Nav: solid-on-scroll ----------
  const nav = document.getElementById('nav');
  let ticking = false;
  const onScroll = () => {
    if (window.pageYOffset > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ---------- Smooth anchor scroll with nav offset ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Active nav link on scroll ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });
  sections.forEach(s => activeObserver.observe(s));

  // ---------- Verulamium Roman map: tooltip hotspots ----------
  (function romanMap() {
    const scene = document.querySelector('.map-scene');
    const tooltip = document.querySelector('#mapTooltip');
    if (!scene || !tooltip) return;

    const hotspots = scene.querySelectorAll('.hotspot');
    const data = {
      'cafe-roma':       { name: 'Cafe Roma',           latin: 'Caupona Romana',         desc: 'You are here. Serving St Peter\u2019s Street since 1996.' },
      'cathedral':       { name: 'St Albans Cathedral', latin: 'Abbatia Sancti Albani',  desc: 'Britain\u2019s oldest site of continuous Christian worship. A five-minute walk from the door.' },
      'clock-tower':     { name: 'The Clock Tower',     latin: 'Turris Horarii',         desc: 'The only remaining medieval town belfry in England, built around 1405.' },
      'verulamium-park': { name: 'Verulamium Park',     latin: 'Parcus Verulamii',       desc: 'Once the Roman city of Verulamium \u2014 Britain\u2019s third largest. Now green lawns over ancient mosaics.' },
      'abbey-gateway':   { name: 'Abbey Gateway',       latin: 'Porta Abbatiae',         desc: 'A 14th-century stone gatehouse, surviving relic of the medieval abbey precinct.' },
      'roman-theatre':   { name: 'Roman Theatre',       latin: 'Theatrum Verulamii',     desc: 'The only visible Roman theatre of its kind in Britain, built around 140 AD.' },
      'river-ver':       { name: 'River Ver',           latin: 'Flumen Ver',             desc: 'The chalk stream that gave the Roman city of Verulamium its name.' }
    };

    const elH = tooltip.querySelector('h4');
    const elL = tooltip.querySelector('.latin');
    const elP = tooltip.querySelector('p');

    function show(id, e) {
      const d = data[id];
      if (!d) return;
      elH.textContent = d.name;
      elL.textContent = d.latin;
      elP.textContent = d.desc;
      tooltip.classList.add('visible');
      tooltip.setAttribute('aria-hidden', 'false');
      position(e);
    }
    function hide() {
      tooltip.classList.remove('visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }
    function position(e) {
      const rect = scene.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      // Clamp so tooltip stays inside the scene
      const tw = tooltip.offsetWidth;
      x = Math.max(tw / 2 + 12, Math.min(rect.width - tw / 2 - 12, x));
      y = Math.max(tooltip.offsetHeight + 20, y);
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }

    hotspots.forEach(h => {
      const id = h.dataset.id;
      if (!id) return;
      h.addEventListener('mouseenter', (e) => show(id, e));
      h.addEventListener('mousemove', position);
      h.addEventListener('mouseleave', hide);
      h.addEventListener('touchstart', (e) => show(id, e), { passive: true });
    });
    // Hide on touch outside
    scene.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.hotspot')) hide();
    }, { passive: true });
    // Hide on scroll
    window.addEventListener('scroll', hide, { passive: true });
  })();

  // ---------- Hero time-of-day atmosphere ----------
  (function todAtmosphere() {
    const hero = document.querySelector('.hero');
    const pillLabel = document.querySelector('#todPill .tod-label');
    if (!hero) return;

    const phases = [
      { from: 0,  to: 5,  key: 'night',     label: 'Late Night' },
      { from: 5,  to: 7,  key: 'dawn',      label: 'Dawn' },
      { from: 7,  to: 11, key: 'morning',   label: 'Morning' },
      { from: 11, to: 15, key: 'midday',    label: 'Midday' },
      { from: 15, to: 18, key: 'afternoon', label: 'Afternoon' },
      { from: 18, to: 20, key: 'evening',   label: 'Evening' },
      { from: 20, to: 24, key: 'night',     label: 'Night' },
    ];

    function apply() {
      const h = new Date().getHours();
      const phase = phases.find(p => h >= p.from && h < p.to) || phases[0];
      hero.className = hero.className.replace(/\btod-\w+\b/g, '').trim() + ' tod-' + phase.key;
      if (pillLabel) pillLabel.textContent = phase.label;
    }

    apply();
    setInterval(apply, 5 * 60 * 1000); // refresh every 5 min
    document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  })();

  // ---------- Hero parallax (desktop only; respects reduced-motion) ----------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !prefersReduced && window.matchMedia('(min-width: 721px)').matches) {
    let parTick = false;
    window.addEventListener('scroll', () => {
      if (parTick) return;
      parTick = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const y = Math.min(window.pageYOffset, vh);
        heroBg.style.transform = `scale(1.12) translate3d(0, ${y * 0.08}px, 0)`;
        parTick = false;
      });
    }, { passive: true });
  }

});
