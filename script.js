/* Portfolio behaviors — a plain-JS port of the artifact's DCLogic component.
   Responsive nav, scroll-reveal, active-nav highlight, and diagram flow
   animation. No dependencies; loaded with `defer`. */

(function () {
  'use strict';

  var WIDE_BREAKPOINT = 860;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* — Responsive nav — */
  var wideNav = document.querySelector('[data-nav-wide]');
  var toggleBtn = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-nav-mobile]');
  var menuLinks = document.querySelectorAll('[data-menu-close]');

  var isWide = true;
  var menuOpen = false;

  function renderNav() {
    if (wideNav) wideNav.hidden = !isWide;
    if (toggleBtn) toggleBtn.hidden = isWide;
    if (mobileNav) mobileNav.hidden = isWide || !menuOpen;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(!isWide && menuOpen));
  }

  function syncWidth() {
    var wide = window.innerWidth >= WIDE_BREAKPOINT;
    if (wide !== isWide) {
      isWide = wide;
      menuOpen = false;
      renderNav();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      menuOpen = !menuOpen;
      renderNav();
    });
  }
  Array.prototype.forEach.call(menuLinks, function (link) {
    link.addEventListener('click', function () {
      menuOpen = false;
      renderNav();
    });
  });

  isWide = window.innerWidth >= WIDE_BREAKPOINT;
  renderNav();
  window.addEventListener('resize', syncWidth);

  /* — Scroll-reveal — */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal]')
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-revealed'); });
  } else {
    var toObserve = [];
    revealTargets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-revealed');
      } else {
        toObserve.push(el);
      }
    });
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        revealObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    toObserve.forEach(function (el) { revealObs.observe(el); });
  }

  /* — Active-nav highlight — */
  if ('IntersectionObserver' in window) {
    var sections = ['work', 'experience', 'about', 'contact']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = document.querySelector('[data-navlink="' + e.target.id + '"]');
        if (!link) return;
        if (e.isIntersecting) {
          link.style.color = 'var(--color-accent)';
          link.setAttribute('aria-current', 'location');
        } else {
          link.style.color = 'var(--color-text)';
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-84px 0px -70% 0px' });

    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* — Diagram flow animation — */
  var flowLines = document.querySelectorAll('[data-flow]');
  Array.prototype.forEach.call(flowLines, function (el) {
    if (reduceMotion) {
      el.style.animationPlayState = 'paused';
      el.style.strokeDashoffset = '0';
    } else {
      el.style.animationPlayState = 'running';
    }
  });
})();
