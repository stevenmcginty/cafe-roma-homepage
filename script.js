/* ========================================
   CAFE ROMA — Interactive Script
   Scroll animations, tooltips, nav, parallax
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========== SCROLL ANIMATIONS ==========
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // ========== NAVBAR SCROLL ==========
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // ========== MOBILE NAV TOGGLE ==========
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ========== TOOLTIPS ==========
  const tooltip = document.getElementById('tooltip');
  const tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      tooltip.textContent = el.getAttribute('data-tooltip');
      tooltip.classList.add('visible');
      positionTooltip(e);
    });

    el.addEventListener('mousemove', (e) => {
      positionTooltip(e);
    });

    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });

  function positionTooltip(e) {
    const x = e.clientX + 15;
    const y = e.clientY - 40;
    
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - tooltipRect.width - 20;
    const maxY = window.innerHeight - tooltipRect.height - 20;
    
    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.max(10, Math.min(y, maxY)) + 'px';
  }

  // ========== STAGGER ANIMATIONS ==========
  document.querySelectorAll('.about-features .feature-item').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });
  document.querySelectorAll('.experience-grid .exp-card').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });
  document.querySelectorAll('.testimonial-grid .testimonial-card').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });

  // ========== LOYALTY DOTS ANIMATION ==========
  const loyaltyDots = document.querySelectorAll('.dot.filled');
  const dotsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loyaltyDots.forEach((dot, i) => {
          setTimeout(() => {
            dot.style.transform = 'scale(1.3)';
            dot.style.boxShadow = '0 0 12px rgba(201, 168, 76, 0.6)';
            setTimeout(() => {
              dot.style.transform = 'scale(1)';
              dot.style.boxShadow = '';
            }, 250);
          }, i * 120);
        });
        dotsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const phoneSection = document.querySelector('.phone-mockup');
  if (phoneSection) dotsObserver.observe(phoneSection);

  // ========== PARALLAX HERO ==========
  const heroBg = document.querySelector('.hero-parallax-bg');
  const heroOrbs = document.querySelectorAll('.hero-gradient-orb');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    if (heroBg && scrolled < window.innerHeight * 1.5) {
      heroBg.style.transform = `translateY(${scrolled * 0.15}px) scale(1.1)`;
    }
    
    heroOrbs.forEach((orb, i) => {
      const rate = (i + 1) * 0.08;
      orb.style.transform = `translateY(${scrolled * rate}px)`;
    });
  }, { passive: true });

  // ========== ACTIVE NAV LINK HIGHLIGHT ==========
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 120;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { passive: true });

  // ========== GALLERY MARQUEE - pause on hover ==========
  const galleryTrack = document.querySelector('.gallery-track');
  if (galleryTrack) {
    galleryTrack.addEventListener('mouseenter', () => {
      galleryTrack.style.animationPlayState = 'paused';
    });
    galleryTrack.addEventListener('mouseleave', () => {
      galleryTrack.style.animationPlayState = 'running';
    });
  }

  // ========== SMOOTH CARD TILT EFFECT ==========
  const tiltCards = document.querySelectorAll('.exp-card, .testimonial-card');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (y - centerY) / centerY * 2;
      const tiltY = (centerX - x) / centerX * 2;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});
