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
  const tiltItems = [...document.querySelectorAll('[data-tilt], .ws-project-card, .entry-card')];
  const magneticItems = [...document.querySelectorAll('[data-magnetic]')];
  const orbit = document.querySelector('.cjn-orbit');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
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
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        } catch (_) {
          showAll();
        }
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      body.classList.add('cjn-motion');
      revealItems.forEach(item => {
        if (!item.classList.contains('is-visible')) observer.observe(item);
      });
    } catch (_) {
      showAll();
    }
  }

  function resetPointer() {
    tiltItems.forEach(item => {
      item.style.setProperty('--tilt-x', '0deg');
      item.style.setProperty('--tilt-y', '0deg');
    });
    magneticItems.forEach(item => {
      item.style.setProperty('--magnet-x', '0px');
      item.style.setProperty('--magnet-y', '0px');
    });
    if (orbit) {
      orbit.style.setProperty('--pointer-x', '0deg');
      orbit.style.setProperty('--pointer-y', '0deg');
    }
  }

  function attachPointer(items, onMove, onLeave) {
    items.forEach(item => {
      let frame = 0;
      let lastEvent;
      item.addEventListener('pointermove', event => {
        if (reduceMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
        lastEvent = event;
        if (!frame) frame = requestAnimationFrame(() => {
          frame = 0;
          if (!reduceMotion.matches && finePointer.matches) onMove(item, lastEvent);
        });
      }, { passive: true });
      item.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        onLeave(item);
      });
    });
  }

  function position(event, item) {
    const rect = item.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5
    };
  }

  attachPointer(tiltItems, (item, event) => {
    if (item.querySelector('details[open]')) {
      item.style.setProperty('--tilt-x', '0deg');
      item.style.setProperty('--tilt-y', '0deg');
      return;
    }
    const { x, y } = position(event, item);
    item.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`);
    item.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
  }, item => {
    item.style.setProperty('--tilt-x', '0deg');
    item.style.setProperty('--tilt-y', '0deg');
  });

  attachPointer(magneticItems, (item, event) => {
    const { x, y } = position(event, item);
    item.style.setProperty('--magnet-x', `${(x * 12).toFixed(2)}px`);
    item.style.setProperty('--magnet-y', `${(y * 12).toFixed(2)}px`);
  }, item => {
    item.style.setProperty('--magnet-x', '0px');
    item.style.setProperty('--magnet-y', '0px');
  });

  if (orbit) attachPointer([orbit], (item, event) => {
    const { x, y } = position(event, item);
    item.style.setProperty('--pointer-x', `${(-y * 8).toFixed(2)}deg`);
    item.style.setProperty('--pointer-y', `${(x * 8).toFixed(2)}deg`);
  }, item => {
    item.style.setProperty('--pointer-x', '0deg');
    item.style.setProperty('--pointer-y', '0deg');
  });

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      resetPointer();
      showAll();
    } else {
      startReveals();
    }
  });
  finePointer.addEventListener('change', () => {
    if (!finePointer.matches) resetPointer();
  });
  addEventListener('pageshow', event => {
    scheduleScroll();
    if (event.persisted) showAll();
  });
  startReveals();
})();
