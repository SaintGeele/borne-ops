/* ============================================
   BORNE SYSTEMS — MAIN JS
   Luxury motion: slow, deliberate, precise
   ============================================ */

(function () {
  'use strict';

  // --- Easing: smooth exponential decel ---
  function luxuryEase(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -12 * t);
  }

  // --- NAV SCROLL ---
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // --- MOBILE MENU ---
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- HERO STAGED REVEAL ---
  // Initial delay before anything appears (luxury feel)
  const heroLabel = document.querySelector('.hero-label');
  const heroHeadline = document.querySelector('.hero-headline');
  const heroSub = document.querySelector('.hero-sub');
  const heroActions = document.querySelector('.hero-actions');
  const heroScroll = document.querySelector('.hero-scroll');

  // Hero elements reveal in deliberate sequence
  setTimeout(function () {
    if (heroLabel) heroLabel.classList.add('visible');
  }, 300);

  setTimeout(function () {
    if (heroHeadline) {
      heroHeadline.classList.add('visible');
      // Trigger line-by-line stagger
      heroHeadline.classList.add('lines-visible');
    }
  }, 500);

  setTimeout(function () {
    if (heroSub) heroSub.classList.add('visible');
  }, 900);

  setTimeout(function () {
    if (heroActions) heroActions.classList.add('visible');
  }, 1100);

  setTimeout(function () {
    if (heroScroll) heroScroll.classList.add('visible');
  }, 1500);

  // --- SECTION REVEALS (IntersectionObserver) ---
  // Exclude hero reveals — those are timed above
  const sectionReveals = document.querySelectorAll(
    '.capabilities .reveal, .services .reveal, .proof .reveal, .about .reveal, .cta .reveal'
  );

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var section = entry.target.closest('section');
        if (!section) return;

        // Find all unrevealed siblings in this section for stagger calc
        var allReveals = Array.from(section.querySelectorAll('.reveal:not(.visible)'));
        var idx = allReveals.indexOf(entry.target);

        // Initial delay + stagger between elements (0.1s apart)
        var delay = 250 + Math.max(0, idx) * 100;

        entry.target.style.transitionDelay = delay + 'ms';

        setTimeout(function () {
          entry.target.classList.add('visible');
        }, 10); // Small RAF-like delay so transitionDelay is applied

        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  sectionReveals.forEach(function (el) {
    revealObserver.observe(el);
  });

  // --- COUNTER ANIMATION (slow, luxurious) ---
  var metrics = document.querySelectorAll('.metric-value[data-target]');

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Delay counter start to let the card reveal settle
        setTimeout(function () {
          animateCounter(entry.target);
        }, 500);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  metrics.forEach(function (el) {
    counterObserver.observe(el);
  });

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var isDecimal = target % 1 !== 0;
    var duration = 2400; // Slow, deliberate count
    var startTime = performance.now();

    function update(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = luxuryEase(progress);
      var current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // --- SMOOTH SCROLL (luxurious, 1.2s duration) ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }

      var offset = 80;
      var startY = window.scrollY;
      var endY = target.getBoundingClientRect().top + startY - offset;
      var dist = endY - startY;
      var dur = 1200; // Luxurious scroll duration
      var t0 = performance.now();

      function frame(now) {
        var p = Math.min((now - t0) / dur, 1);
        window.scrollTo(0, startY + dist * luxuryEase(p));
        if (p < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    });
  });

})();
