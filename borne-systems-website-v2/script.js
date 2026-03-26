/* ============================================
   BORNE SYSTEMS — Minimal Interactions
   ============================================ */

(function () {
  'use strict';

  // --- Scroll Reveal ---
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // --- Navbar Scroll State ---
  const nav = document.querySelector('.nav');
  let lastScrollY = 0;
  let navHidden = false;

  function handleNavScroll() {
    const y = window.scrollY;

    // Add scrolled class for background
    if (y > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    // Hide/show on scroll direction
    if (y > lastScrollY && y > 200) {
      if (!navHidden) {
        nav.style.transform = 'translateY(-100%)';
        nav.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s ease, padding 0.4s ease, backdrop-filter 0.5s ease';
        navHidden = true;
      }
    } else {
      if (navHidden) {
        nav.style.transform = 'translateY(0)';
        navHidden = false;
      }
    }

    lastScrollY = y;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  if (window.scrollY > 60) {
    nav.classList.add('is-scrolled');
  }

  // --- Mobile Navigation ---
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(2px, 2px)';
        spans[1].style.transform = 'rotate(-45deg) translate(2px, -2px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.transform = 'none';
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.transform = 'none';
      });
    });
  }

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 40;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Year ---
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Reduced Motion ---
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

})();