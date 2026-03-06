/* ============================================
   BORNE SYSTEMS — Premium Engineering Animation
   Intelligent · Precise · Resilient
   ============================================ */

(function () {
  'use strict';

  // --- Mesh Background Animation ---
  const canvas = document.getElementById('mesh-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    const nodeCount = 45;
    const connectionDistance = 180;
    const nodeSpeed = 0.15;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * nodeSpeed,
          vy: (Math.random() - 0.5) * nodeSpeed,
          radius: Math.random() * 1.5 + 0.5
        });
      }
    }

    function drawMesh() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = 'rgba(43, 168, 219, 0.06)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(43, 168, 219, ${opacity * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = 'rgba(43, 168, 219, 0.25)';
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
      }

      animationId = requestAnimationFrame(drawMesh);
    }

    function initMesh() {
      resizeCanvas();
      createNodes();
      drawMesh();
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    // Start mesh animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
    } else {
      initMesh();
    }
  }

  // --- Easing Functions ---
  const ease = {
    expoOut: (t) => t === 1 ? 1 : 1 - Math.pow(2, -8 * t),
    softOut: (t) => 1 - Math.pow(1 - t, 3),
    gentle: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };

  // --- Scroll Reveal (Premium) ---
  const STAGGER_BASE = 80;
  const STAGGER_INCREMENT = 60;
  const REVEAL_THRESHOLD = 0.12;
  const REVEAL_OFFSET = '0px 0px -100px 0px';

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const staggerIndex = parseInt(el.dataset.stagger, 10) || index;
          const delay = staggerIndex * STAGGER_INCREMENT;
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    },
    {
      threshold: REVEAL_THRESHOLD,
      rootMargin: REVEAL_OFFSET
    }
  );

  document.querySelectorAll('.reveal').forEach((el, index) => {
    el.dataset.stagger = index;
    el.style.transitionProperty = 'opacity, transform';
    el.style.transitionDuration = '0.9s';
    el.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transitionDelay = '0ms';
    el.classList.add('reveal-ready');
    revealObserver.observe(el);
  });

  // --- Section Observer ---
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
  });

  // --- Premium Card Hover Interactions ---
  const cards = document.querySelectorAll('.cap-card');
  
  cards.forEach(card => {
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease, background 0.5s ease';
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // --- Button Hover Effects ---
  const buttons = document.querySelectorAll('.btn, .nav__cta');
  
  buttons.forEach(btn => {
    btn.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });

  // --- Link Hover ---
  const links = document.querySelectorAll('a:not(.btn):not(.nav__cta)');
  
  links.forEach(link => {
    link.style.transition = 'color 0.3s ease';
    
    link.addEventListener('mouseenter', () => {
      link.style.color = '#2BA8DB';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.color = '';
    });
  });

  // --- Navbar Scroll State ---
  const nav = document.querySelector('.nav');
  let lastScrollY = 0;
  let navVisible = true;

  function handleNavScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 80) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      if (navVisible) {
        nav.style.transform = 'translateY(-100%)';
        navVisible = false;
      }
    } else {
      if (!navVisible) {
        nav.style.transform = 'translateY(0)';
        navVisible = true;
      }
    }
    
    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  
  if (window.scrollY > 80) {
    nav.classList.add('is-scrolled');
  }

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 60;
        
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1200;
        let startTime = null;

        function smoothScroll(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easeProgress = ease.expoOut(progress);
          
          window.scrollTo(0, startPosition + distance * easeProgress);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(smoothScroll);
          }
        }
        
        requestAnimationFrame(smoothScroll);
      }
    });
  });

  // --- Animated Counters ---
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach((counter, index) => {
      if (counter.dataset.animated) return;
      
      const target = parseInt(counter.dataset.count, 10);
      const suffix = counter.dataset.suffix || '';
      const prefix = counter.dataset.prefix || '';
      const duration = 2800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = ease.expoOut(progress);
        const current = Math.floor(easedProgress * target);
        
        counter.textContent = prefix + current.toLocaleString() + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = prefix + target.toLocaleString() + suffix;
          counter.dataset.animated = 'true';
        }
      }
      
      setTimeout(() => {
        requestAnimationFrame(update);
      }, index * 200);
      
      counter.dataset.animated = 'true';
    });
  }

  // Observe proof section
  const proofSection = document.querySelector('.proof');
  if (proofSection) {
    const proofObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            proofObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    proofObserver.observe(proofSection);
  }

  // --- Hero Parallax Glow ---
  const heroGlow = document.querySelector('.hero__bg-glow');
  if (heroGlow) {
    let ticking = false;
    const maxOffset = 20;
    
    window.addEventListener(
      'mousemove',
      (e) => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth - 0.5) * maxOffset;
            const y = (e.clientY / window.innerHeight - 0.5) * maxOffset;
            heroGlow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.08)`;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // --- Current Year ---
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Reduced Motion Support ---
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, section, .cap-card, .btn').forEach(el => {
      el.style.transition = 'none';
      el.classList.add('is-visible');
    });
  }

})();