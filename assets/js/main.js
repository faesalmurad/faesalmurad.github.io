/* Faesal Murad — interactive layer
   Vanilla JS, no dependencies.                              */

(function () {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  const THEME_KEY = 'fm-theme';
  const themeToggle = document.getElementById('theme-toggle');

  const getStoredTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
  };
  const storeTheme = (t) => {
    try { localStorage.setItem(THEME_KEY, t); } catch (_) { /* noop */ }
  };

  const applyTheme = (theme) => {
    doc.setAttribute('data-theme', theme);
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      }
      themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  };

  const initialTheme =
    getStoredTheme() ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------- Preload removal ---------- */
  window.addEventListener('load', () => {
    requestAnimationFrame(() => body.classList.remove('is-preload'));
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Count-up ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1100;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(eased * target).toString();
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cIo.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cIo.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  const cursor = document.querySelector('.cursor-glow');
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && fineHover && !reduceMotion) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = null;

    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add('is-active');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
    });
  }

  /* ---------- Subtle 3D tilt on cards ---------- */
  const tiltEls = document.querySelectorAll('[data-tilt]');
  if (fineHover && !reduceMotion) {
    tiltEls.forEach((card) => {
      let rect;
      const max = 6; // degrees

      const onEnter = () => { rect = card.getBoundingClientRect(); };
      const onMove = (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-8px)`;
      };
      const onLeave = () => {
        card.style.transform = '';
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------- Smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
