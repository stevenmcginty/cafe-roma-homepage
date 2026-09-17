/* ==========================================================================
   CAFE ROMA — interactions
   "Blue Hour Trattoria"

   Nav · mobile menu · scroll reveal · headline clip-reveal · scroll progress
   live open/closed status · time-of-day hero · live "A Day at Roma" timeline
   count-ups · magnetic CTAs · mobile action dock
   ========================================================================== */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  /* ------------------------------------------------------------------
     Opening hours — single source of truth.
     Keyed by JS day index (0 = Sunday). [openMinutes, closeMinutes]
     ------------------------------------------------------------------ */
  const HOURS = {
    0: [7 * 60 + 30, 16 * 60 + 30],   // Sunday
    1: [6 * 60 + 30, 17 * 60 + 30],   // Monday
    2: [6 * 60 + 30, 17 * 60 + 30],
    3: [6 * 60 + 30, 17 * 60 + 30],
    4: [6 * 60 + 30, 17 * 60 + 30],
    5: [6 * 60 + 30, 17 * 60 + 30],   // Friday
    6: [7 * 60,      17 * 60 + 30]    // Saturday
  };
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* Shop-local time. Pinned to Europe/London so the status is still correct
     for someone browsing from another timezone. Falls back to device time. */
  function shopNow() {
    try {
      const parts = {};
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date()).forEach(p => { parts[p.type] = p.value; });

      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const day = map[parts.weekday];
      const hour = parseInt(parts.hour, 10) % 24;
      const minute = parseInt(parts.minute, 10);
      if (day === undefined || isNaN(hour) || isNaN(minute)) throw new Error('bad parts');
      return { day: day, hour: hour, mins: hour * 60 + minute };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), hour: d.getHours(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  function humanDuration(m) {
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60), r = m % 60;
    return r ? h + 'h ' + r + 'm' : h + 'h';
  }

  function openStatus() {
    const now = shopNow();
    const today = HOURS[now.day];

    if (today && now.mins >= today[0] && now.mins < today[1]) {
      const left = today[1] - now.mins;
      return {
        open: true,
        short: left <= 45 ? 'Closing soon' : 'Open now',
        state: left <= 45 ? 'Closing soon' : 'Open now',
        detail: 'Closes ' + hhmm(today[1]) + ' · in ' + humanDuration(left)
      };
    }
    if (today && now.mins < today[0]) {
      return {
        open: false, short: 'Closed',
        state: 'Closed right now',
        detail: 'Opens ' + hhmm(today[0]) + ' · in ' + humanDuration(today[0] - now.mins)
      };
    }
    // After closing — find the next day we open.
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      const h = HOURS[d];
      if (h) {
        return {
          open: false, short: 'Closed',
          state: 'Closed for today',
          detail: 'Opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' at ' + hhmm(h[0])
        };
      }
    }
    return { open: false, short: 'Closed', state: 'Closed', detail: '' };
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ================================================================
       Scroll reveal
       ================================================================ */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }

    /* ================================================================
       Hero headline clip-reveal
       ================================================================ */
    const rises = $$('[data-rise]');
    if (reduced) {
      rises.forEach(el => el.classList.add('in'));
    } else {
      rises.forEach(function (el, i) {
        setTimeout(function () { el.classList.add('in'); }, 140 + i * 130);
      });
    }

    /* ================================================================
       Nav — solid on scroll, scroll progress hairline
       ================================================================ */
    const nav = $('#nav');
    const progress = $('#scrollProgress');
    const dock = $('#dock');
    let ticking = false;

    function onScroll() {
      const y = window.pageYOffset || document.documentElement.scrollTop;

      if (nav) nav.classList.toggle('scrolled', y > 50);

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      }

      if (dock) dock.classList.toggle('up', y > window.innerHeight * 0.55);

      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    /* ================================================================
       Mobile menu
       ================================================================ */
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        const open = links.classList.toggle('open');
        toggle.classList.toggle('active', open);
        if (nav) nav.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
        if (dock) dock.style.visibility = open ? 'hidden' : '';
      });
      $$('.nav-link', links).forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          toggle.classList.remove('active');
          if (nav) nav.classList.remove('menu-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          if (dock) dock.style.visibility = '';
        });
      });
      // Escape closes it
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && links.classList.contains('open')) toggle.click();
      });
    }

    /* ================================================================
       Smooth anchor scroll with nav offset
       ================================================================ */
    $$('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = anchor.getAttribute('href');
        if (!href || href.length <= 1) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    /* ================================================================
       Active nav link
       ================================================================ */
    const navLinks = $$('.nav-link');
    // Only meaningful when the nav actually points at in-page anchors. On the
    // menu page every link is index.html#… so the observer would just strip
    // .active off "Menu".
    const hasHashNav = navLinks.some(l => (l.getAttribute('href') || '').charAt(0) === '#');
    if (hasHashNav && 'IntersectionObserver' in window) {
      const activeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(function (l) {
              l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' });
      $$('section[id]').forEach(s => activeObserver.observe(s));
    }

    /* ================================================================
       Live open / closed status
       Feeds the nav chip, the hero rail, and today's row in the hours table.
       ================================================================ */
    (function liveStatus() {
      const navStatus  = $('#navStatus');
      const navText    = navStatus ? $('.nav-status-text', navStatus) : null;
      const statusCell = $('#statusCell');
      const openState  = $('#openState');
      const openDetail = $('#openDetail');
      const hoursRows  = $$('#hoursTable .hours-row');

      function paint() {
        const s = openStatus();

        if (navStatus && navText) {
          navStatus.classList.toggle('is-open', s.open);
          navText.textContent = s.short;
          navStatus.setAttribute('title', s.detail);
        }
        if (statusCell) statusCell.classList.toggle('is-open', s.open);
        if (openState)  openState.textContent = s.state;
        if (openDetail) openDetail.textContent = s.detail || ' ';

        const today = shopNow().day;
        hoursRows.forEach(function (row) {
          row.classList.toggle('today', Number(row.dataset.day) === today);
        });

        // Expose for analytics + anything else that wants it.
        window.CAFE_ROMA_STATUS = s;
      }

      paint();
      setInterval(paint, 30000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) paint(); });
    })();

    /* ================================================================
       Hero time-of-day atmosphere
       ================================================================ */
    (function todAtmosphere() {
      const hero = $('.hero');
      const pillLabel = $('#todPill .tod-label');
      if (!hero) return;

      const phases = [
        { from: 0,  to: 5,  key: 'night',     label: 'Late night' },
        { from: 5,  to: 7,  key: 'dawn',      label: 'Dawn · first pot on' },
        { from: 7,  to: 11, key: 'morning',   label: 'Flat white weather' },
        { from: 11, to: 15, key: 'midday',    label: 'Midday · lunch on' },
        { from: 15, to: 18, key: 'afternoon', label: 'Cake o’clock' },
        { from: 18, to: 20, key: 'evening',   label: 'Evening' },
        { from: 20, to: 24, key: 'night',     label: 'Night' }
      ];

      function apply() {
        const h = shopNow().hour;
        const phase = phases.find(p => h >= p.from && h < p.to) || phases[0];
        hero.className = hero.className.replace(/\btod-\w+\b/g, '').replace(/\s+/g, ' ').trim() + ' tod-' + phase.key;
        if (pillLabel) pillLabel.textContent = phase.label;
      }

      apply();
      setInterval(apply, 5 * 60 * 1000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) apply(); });
    })();

    /* ================================================================
       A Day at Roma — light the slot matching the real St Albans clock
       ================================================================ */
    (function dayTimeline() {
      const rail  = $('#dayRail');
      const badge = $('#dayNow');
      const label = $('#dayNowText');
      if (!rail) return;

      const slots = $$('.day-slot', rail);
      let centredOnce = false;

      function paint() {
        const now = shopNow();
        const status = openStatus();
        let current = null;

        slots.forEach(function (slot) {
          const from = Number(slot.dataset.from);
          const to   = Number(slot.dataset.to);
          // Only light a slot while we're actually trading.
          const on = status.open && now.mins >= from && now.mins < to;
          slot.classList.toggle('now', on);
          if (on) current = slot;
        });

        rail.classList.toggle('has-now', !!current);

        if (badge && label) {
          badge.classList.toggle('is-open', !!current);
          if (current) {
            const h3 = $('h3', current);
            label.textContent = 'Right now · ' + (h3 ? h3.textContent : '');
          } else {
            label.textContent = status.detail
              ? status.short + ' · ' + status.detail.toLowerCase()
              : status.short;
          }
        }

        // Bring the live slot into view once — mostly for phones, where the
        // rail is one slot wide.
        if (current && !centredOnce) {
          centredOnce = true;
          if (rail.scrollWidth > rail.clientWidth + 4) {
            const left = current.offsetLeft - rail.offsetLeft
                       - (rail.clientWidth - current.offsetWidth) / 2;
            rail.scrollTo({ left: Math.max(0, left), behavior: reduced ? 'auto' : 'smooth' });
          }
        }
      }

      paint();
      setInterval(paint, 60000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) paint(); });
    })();

    /* ================================================================
       App showcase — the live phone walks through the four steps.
       The step cards are the controls: hover holds a beat, click or
       Enter jumps to it. Plays only while on screen; never under
       prefers-reduced-motion (each beat then shows its finished frame).
       ================================================================ */
    (function showcase() {
      const stage = $('#appShow');
      if (!stage) return;

      const shots   = $$('.shot', stage);
      const steps   = $$('[data-step]');
      const caption = $('#showCaption');
      const toggle  = $('#showToggle');
      if (!shots.length || shots.length !== steps.length) return;

      let beat = 0, elapsed = 0, lastTick = 0, raf = 0;
      let visible = false, holding = false, paused = reduced, running = false;

      function bar(k) { return $('.step-bar b', steps[k]); }

      function go(n) {
        beat = ((n % shots.length) + shots.length) % shots.length;
        elapsed = 0;
        shots.forEach((s, k) => s.classList.toggle('on', k === beat));
        steps.forEach(function (s, k) {
          const on = k === beat;
          s.classList.toggle('lit', on);
          const btn = $('.step-btn', s);
          if (btn) btn.setAttribute('aria-pressed', String(on));
          const b = bar(k);
          if (b) b.style.transform = 'scaleX(0)';
        });
        stage.dataset.beat = String(beat + 1);
        if (caption) {
          const title = $('.step-btn', steps[beat]);
          if (title) caption.textContent = title.textContent;
        }
      }

      function frame(now) {
        if (!running) return;
        const dt = Math.min(64, now - lastTick);
        lastTick = now;
        if (visible && !paused && !holding && !document.hidden) {
          elapsed += dt;
          const dur = Number(shots[beat].dataset.dur) || 4500;
          const b = bar(beat);
          if (b) b.style.transform = 'scaleX(' + Math.min(1, elapsed / dur).toFixed(3) + ')';
          if (elapsed >= dur) go(beat + 1);
        }
        raf = requestAnimationFrame(frame);
      }

      function sync() {
        const live = visible && !paused && !document.hidden;
        // Under reduced motion the keyframes are already instant; freezing
        // them would pin every beat at its first frame instead of its last.
        stage.classList.toggle('is-paused', (!visible || document.hidden) && !reduced);
        // Paused by the visitor: beats settle to their finished frame instead.
        stage.classList.toggle('is-still', paused && !reduced);
        if (live && !running) { running = true; lastTick = performance.now(); raf = requestAnimationFrame(frame); }
        if (!live && running) { running = false; cancelAnimationFrame(raf); }
      }

      steps.forEach(function (s, k) {
        const btn = $('.step-btn', s);
        if (btn) btn.addEventListener('click', function () { go(k); });
        if (finePointer) {
          s.addEventListener('mouseenter', function () { if (k !== beat) go(k); holding = true; });
          s.addEventListener('mouseleave', function () { holding = false; });
        }
      });

      if (toggle) {
        const text = $('.show-toggle-text', toggle);
        toggle.addEventListener('click', function () {
          paused = !paused;
          toggle.setAttribute('aria-pressed', String(paused));
          if (text) text.textContent = paused ? 'Play the demo' : 'Pause the demo';
          sync();
        });
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          sync();
        }, { threshold: 0.2 }).observe(stage);
      } else {
        visible = true;
      }
      document.addEventListener('visibilitychange', sync);

      go(0);
      sync();
    })();

    /* ================================================================
       Count-ups
       ================================================================ */
    (function counters() {
      const nodes = $$('[data-count]');
      if (!nodes.length) return;

      function render(el, value) {
        const dec = Number(el.dataset.decimals || 0);
        el.textContent = value.toFixed(dec) + (el.dataset.suffix || '');
      }
      function run(el) {
        const target = Number(el.dataset.count);
        if (isNaN(target)) return;
        if (reduced) { render(el, target); return; }

        const dur = 1400;
        const start = performance.now();
        (function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          render(el, target * eased);
          if (t < 1) requestAnimationFrame(tick);
          else render(el, target);
        })(start);
      }

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
          });
        }, { threshold: 0.5 });
        nodes.forEach(n => io.observe(n));
      } else {
        nodes.forEach(n => render(n, Number(n.dataset.count)));
      }
    })();

    /* ================================================================
       Magnetic CTAs (desktop only)
       ================================================================ */
    if (finePointer && !reduced) {
      const magnets = $$('[data-magnetic]').map(function (el) {
        return { el: el, x: 0, y: 0, tx: 0, ty: 0 };
      });

      if (magnets.length) {
        let pointerX = 0, pointerY = 0, running = false;

        window.addEventListener('mousemove', function (e) {
          pointerX = e.clientX; pointerY = e.clientY;
          if (!running) { running = true; requestAnimationFrame(loop); }
        }, { passive: true });

        function loop() {
          let moving = false;
          magnets.forEach(function (m) {
            const r = m.el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = pointerX - cx;
            const dy = pointerY - cy;
            const dist = Math.hypot(dx, dy);
            const radius = Math.max(r.width, 130);

            if (dist < radius) { m.tx = dx * 0.22; m.ty = dy * 0.3; }
            else { m.tx = 0; m.ty = 0; }

            m.x += (m.tx - m.x) * 0.14;
            m.y += (m.ty - m.y) * 0.14;

            if (Math.abs(m.x) > 0.05 || Math.abs(m.y) > 0.05) moving = true;
            m.el.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)';
          });

          if (moving) requestAnimationFrame(loop);
          else { running = false; magnets.forEach(m => { m.el.style.transform = ''; }); }
        }
      }
    }

    /* ------------------------------------------------------------------
       Careers form — posts to /api/apply, which emails the cafe
       ------------------------------------------------------------------ */
    const careersForm = $('#careersForm');
    if (careersForm) {
      const status = $('#careersStatus');
      const submit = $('#careersSubmit');
      const cvInput = $('#careersCv');
      const cvName = $('#careersCvName');
      const MAX_CV = 4 * 1024 * 1024;

      const say = (msg, kind) => {
        status.textContent = msg;
        status.className = 'careers-status' + (kind ? ' ' + kind : '');
      };

      if (cvInput) {
        cvInput.addEventListener('change', function () {
          const f = cvInput.files && cvInput.files[0];
          if (!f) { cvName.textContent = 'No file chosen'; cvName.classList.remove('has-file'); return; }
          cvName.textContent = f.name;
          cvName.classList.add('has-file');
          if (f.size > MAX_CV) say('That file is over 4 MB. Please choose a smaller one.', 'err');
          else say('', '');
        });
      }

      careersForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = careersForm.name.value.trim();
        const email = careersForm.email.value.trim();
        const phone = careersForm.phone.value.trim();
        const mobile = careersForm.mobile.value.trim();
        const note = careersForm.note.value.trim();
        const cv = cvInput && cvInput.files && cvInput.files[0];

        if (!name) return say('Please tell us your name.', 'err');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('Please enter a valid email address.', 'err');
        if (!phone && !mobile) return say('Please give us a phone or mobile number.', 'err');
        if (!note && !cv) return say('Please attach a CV or write a short note.', 'err');
        if (cv && cv.size > MAX_CV) return say('That file is over 4 MB. Please choose a smaller one.', 'err');

        submit.disabled = true;
        say('Sending…', '');

        fetch(careersForm.action, { method: 'POST', body: new FormData(careersForm) })
          .then(r => r.json().catch(() => ({ ok: false })).then(data => ({ status: r.status, data })))
          .then(function (res) {
            if (res.data && res.data.ok) {
              careersForm.classList.add('sent');
              say('Thank you, ' + name.split(' ')[0] + '. We have your application and we will be in touch soon.', 'ok');
              if (window.gtag) gtag('event', 'careers_apply', { has_cv: !!cv });
            } else {
              submit.disabled = false;
              say((res.data && res.data.error) || 'Something went wrong. Please try again, or call us on 07938 311828.', 'err');
            }
          })
          .catch(function () {
            submit.disabled = false;
            say('We could not send that. Check your connection and try again.', 'err');
          });
      });
    }

  });
})();
