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
