/* Muse visual effects adapted to WordPress pages. Content and navigation stay native. */
(() => {
  'use strict';

  function init() {
    const canvas = document.getElementById('dust');
    const context = canvas?.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    let disposed = false;

    // Keep the complete, server-rendered site title available to assistive technology.
    const title = document.getElementById('heroTitle');
    if (title && !title.children.length && title.textContent.trim()) {
      const label = title.textContent.trim();
      title.setAttribute('aria-label', title.getAttribute('aria-label') || label);
      const segmenter = typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(document.documentElement.lang || 'zh', { granularity: 'grapheme' })
        : null;
      const chars = segmenter ? [...segmenter.segment(label)].map(part => part.segment) : Array.from(label);
      const fragment = document.createDocumentFragment();
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--i', String(index));
        if (/^\s+$/.test(char)) span.style.whiteSpace = 'pre';
        span.textContent = char;
        fragment.append(span);
      });
      title.replaceChildren(fragment);
      title.classList.add('shine-target');
    }

    // Muse's card light follows the pointer; tilt is limited to fine pointers.
    const cards = [...document.querySelectorAll('.card.tilt, .ws-project-card')];
    const cardHandlers = [];
    cards.forEach(card => {
      const move = event => {
        if (reduceMotion.matches) return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        if (!coarsePointer.matches && event.pointerType !== 'touch') {
          card.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 3.4).toFixed(2)}deg) rotateY(${((x - 0.5) * 4.2).toFixed(2)}deg) translateY(-2px)`;
        }
      };
      const leave = () => { card.style.transform = ''; };
      card.addEventListener('pointermove', move, { passive: true });
      card.addEventListener('pointerleave', leave);
      cardHandlers.push([card, move, leave]);
    });

    const warp = document.getElementById('warp');
    const playWarp = () => {
      if (!warp || reduceMotion.matches || document.hidden) return;
      warp.classList.remove('go');
      void warp.offsetWidth;
      warp.classList.add('go');
    };
    playWarp();

    if (!context) {
      document.body.dataset.museEffects = 'ready';
      return;
    }

    const dust = { stars: [], meteors: [], parts: [], width: 0, height: 0, raf: 0 };
    let dpr = 1;
    let lastMeteor = 0;
    let nextMeteor = 7000 + Math.random() * 6000;
    let lastPointer = 0;

    function resize() {
      dust.width = Math.max(1, window.innerWidth);
      dust.height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1.25 : 1.5);
      canvas.width = Math.round(dust.width * dpr);
      canvas.height = Math.round(dust.height * dpr);
      canvas.style.width = `${dust.width}px`;
      canvas.style.height = `${dust.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const layers = coarsePointer.matches
        ? [{ n: 40, s: 1.6, p: .012, a: .85 }, { n: 60, s: 1.05, p: .03, a: .6 }, { n: 50, s: .6, p: .06, a: .42 }]
        : [{ n: 70, s: 1.6, p: .012, a: .85 }, { n: 110, s: 1.05, p: .03, a: .6 }, { n: 90, s: .6, p: .06, a: .42 }];
      dust.stars = layers.flatMap(layer => Array.from({ length: layer.n }, () => ({
        x: Math.random() * dust.width, y: Math.random() * dust.height,
        r: Math.random() * layer.s + .3, p: layer.p,
        a: layer.a * (.5 + Math.random() * .5), tw: Math.random() * 6.28,
        hue: Math.random() < .14 ? '234,181,79' : (Math.random() < .3 ? '143,201,242' : '230,238,255')
      })));
      if (reduceMotion.matches || document.hidden) draw(performance.now(), false);
    }

    function draw(time, animate) {
      context.clearRect(0, 0, dust.width, dust.height);
      const scroll = animate ? window.scrollY || 0 : 0;
      dust.stars.forEach(star => {
        let y = star.y - (scroll * star.p) % (dust.height + 10);
        if (y < -6) y += dust.height + 12;
        const twinkle = animate ? .72 + .28 * Math.sin(time / 1400 + star.tw) : 1;
        context.beginPath();
        context.arc(star.x, y, star.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${star.hue},${(star.a * twinkle).toFixed(3)})`;
        context.fill();
      });
      if (!animate) return;

      if (time - lastMeteor > nextMeteor && dust.meteors.length < 1) {
        lastMeteor = time;
        nextMeteor = 7000 + Math.random() * 6000;
        dust.meteors.push({
          x: dust.width * (.35 + Math.random() * .6), y: dust.height * Math.random() * .3,
          vx: -(5 + Math.random() * 3), vy: 3 + Math.random() * 1.6, life: 1
        });
      }
      dust.meteors = dust.meteors.filter(meteor => meteor.life > 0);
      dust.meteors.forEach(meteor => {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= .016;
        const trail = context.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 11, meteor.y - meteor.vy * 11);
        trail.addColorStop(0, `rgba(255,246,220,${Math.max(0, .85 * meteor.life)})`);
        trail.addColorStop(1, 'rgba(255,246,220,0)');
        context.strokeStyle = trail;
        context.lineWidth = 1.6;
        context.beginPath();
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(meteor.x - meteor.vx * 11, meteor.y - meteor.vy * 11);
        context.stroke();
      });
      dust.parts = dust.parts.filter(part => part.life > 0);
      dust.parts.forEach(part => {
        part.x += part.vx;
        part.y += part.vy;
        part.vy += part.gravity || 0;
        part.life -= part.decay;
        context.beginPath();
        context.arc(part.x, part.y, part.radius * Math.max(0, part.life), 0, Math.PI * 2);
        context.fillStyle = `rgba(${part.color},${(.8 * Math.max(0, part.life)).toFixed(3)})`;
        context.fill();
      });
    }

    function stop() {
      if (dust.raf) cancelAnimationFrame(dust.raf);
      dust.raf = 0;
      canvas.dataset.dustRunning = 'false';
    }

    function frame(time) {
      dust.raf = 0;
      if (disposed || document.hidden || reduceMotion.matches) return;
      draw(time, true);
      dust.raf = requestAnimationFrame(frame);
    }

    function start() {
      if (disposed || document.hidden || reduceMotion.matches || dust.raf) return;
      lastMeteor = performance.now();
      dust.raf = requestAnimationFrame(frame);
      canvas.dataset.dustRunning = 'true';
    }

    function burstAt(element) {
      if (reduceMotion.matches || document.hidden || !element) return;
      const rect = element.getBoundingClientRect();
      for (let i = 0; i < 26; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3.2;
        dust.parts.push({
          x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .6,
          radius: 1.2 + Math.random() * 1.8, life: 1, decay: .016, gravity: .02,
          color: Math.random() < .6 ? '234,181,79' : '247,217,139'
        });
      }
      if (dust.parts.length > 120) dust.parts.splice(0, dust.parts.length - 120);
    }

    function pointerTrail(event) {
      if (disposed || reduceMotion.matches || coarsePointer.matches || document.hidden || event.pointerType === 'touch') return;
      const time = performance.now();
      if (time - lastPointer < 26 || event.target?.closest?.('input,textarea,select,[contenteditable]')) return;
      lastPointer = time;
      dust.parts.push({
        x: event.clientX, y: event.clientY,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5 - .25,
        radius: 1.4 + Math.random() * 1.4, life: 1, decay: .028,
        color: Math.random() < .5 ? '234,181,79' : '143,201,242'
      });
      if (dust.parts.length > 110) dust.parts.splice(0, dust.parts.length - 110);
    }

    function clickBurst(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest('a.btn[href], a.cjn-section-link[href]') : null;
      if (target) burstAt(target);
    }

    function motionChanged() {
      if (reduceMotion.matches) {
        stop();
        dust.meteors.length = 0;
        dust.parts.length = 0;
        cards.forEach(card => { card.style.transform = ''; });
        warp?.classList.remove('go');
        draw(performance.now(), false);
      } else {
        start();
      }
    }

    function visibilityChanged() { document.hidden ? stop() : motionChanged(); }
    function pageShown(event) { if (event.persisted) motionChanged(); }
    function pageHidden(event) {
      stop();
      if (event.persisted) return;
      disposed = true;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointerTrail);
      document.removeEventListener('click', clickBurst);
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pageshow', pageShown);
      window.removeEventListener('pagehide', pageHidden);
      reduceMotion.removeEventListener('change', motionChanged);
      cardHandlers.forEach(([card, move, leave]) => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      });
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', pointerTrail, { passive: true });
    document.addEventListener('click', clickBurst);
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pageshow', pageShown);
    window.addEventListener('pagehide', pageHidden);
    reduceMotion.addEventListener('change', motionChanged);
    motionChanged();
    document.body.dataset.museEffects = 'ready';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
