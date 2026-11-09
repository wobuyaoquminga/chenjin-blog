(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.cjn-header');
  const progress = document.querySelector('.cjn-progress > span');
  const menuButton = document.querySelector('button[data-cjn-menu-toggle][aria-controls="cjn-nav"]');
  const nav = document.getElementById('cjn-nav');
  const searchButton = document.querySelector('button[data-cjn-search][aria-controls="cjn-search"]');
  const search = document.getElementById('cjn-search');
  document.querySelectorAll('.ws-project-card, .entries .entry-card').forEach(item => item.setAttribute('data-reveal', ''));
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  let scrollFrame = 0;
  let observer;
  body.classList.add('cjn-ready');

  function updateScroll() {
    scrollFrame = 0;
    if (header) header.classList.toggle('is-scrolled', scrollY > 12);
    if (progress) {
      const extent = document.documentElement.scrollHeight - innerHeight;
      const fraction = extent > 0 ? Math.min(1, Math.max(0, scrollY / extent)) : 0;
      progress.style.transform = `scaleX(${fraction})`;
    }
  }

  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }

  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  scheduleScroll();

  function closeMenu(restoreFocus = false) {
    if (!menuButton || !nav) return;
    const hadFocus = nav.contains(document.activeElement);
    body.classList.remove('is-menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航菜单');
    if (restoreFocus || hadFocus) menuButton.focus();
    nav.inert = mobile.matches;
  }

  if (menuButton && nav) {
    nav.inert = mobile.matches;
    menuButton.addEventListener('click', () => {
      if (body.classList.contains('is-menu-open')) {
        closeMenu(true);
        return;
      }
      body.classList.add('is-menu-open');
      closeSearch();
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', '关闭导航菜单');
      nav.inert = false;
      nav.querySelector('a[href]')?.focus();
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a[href]')) closeMenu();
    });
    mobile.addEventListener('change', () => closeMenu());
  }

  function closeSearch(restoreFocus = false) {
    if (!search || !searchButton) return;
    const hadFocus = search.contains(document.activeElement);
    search.hidden = true;
    searchButton.setAttribute('aria-expanded', 'false');
    searchButton.setAttribute('aria-label', '搜索文章');
    if (restoreFocus || hadFocus) searchButton.focus();
  }

  if (searchButton && search) {
    searchButton.addEventListener('click', () => {
      if (!search.hidden) {
        closeSearch(true);
        return;
      }
      closeMenu();
      search.hidden = false;
      searchButton.setAttribute('aria-expanded', 'true');
      searchButton.setAttribute('aria-label', '关闭搜索');
      search.querySelector('input[type="search"]')?.focus();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (search && !search.hidden) {
      closeSearch(true);
      event.preventDefault();
    } else if (body.classList.contains('is-menu-open')) {
      closeMenu(true);
      event.preventDefault();
    }
  });

  function showAll() {
    observer?.disconnect();
    body.classList.remove('cjn-motion');
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  function startReveals() {
    if (reduceMotion.matches || !('IntersectionObserver' in window) || !revealItems.length) {
      showAll();
      return;
    }
    try {
      observer?.disconnect();
      observer = new IntersectionObserver(entries => {
        try {
          entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
          });
        } catch (_) {
          showAll();
        }
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      body.classList.add('cjn-motion');
      revealItems.forEach(item => observer.observe(item));
    } catch (_) {
      showAll();
    }
  }

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      showAll();
    } else {
      startReveals();
    }
  });
  addEventListener('pageshow', event => {
    scheduleScroll();
    if (event.persisted) startReveals();
  });
  startReveals();
})();
