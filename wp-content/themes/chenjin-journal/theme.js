(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
      toggle.title = dark ? '切换浅色模式' : '切换深色模式';
    };
    sync();
    toggle.addEventListener('click', () => {
      const dark = root.dataset.theme !== 'dark';
      root.dataset.theme = dark ? 'dark' : 'light';
      try { localStorage.setItem('ws-journal-theme', dark ? 'dark' : 'light'); } catch (e) {}
      sync();
    });
  }

  const content = document.querySelector('#article-content');
  const toc = document.querySelector('.toc');
  if (!content) return;
  const headings = [...content.querySelectorAll('h2, h3')];
  if (toc && headings.length) {
    const list = toc.querySelector('ol');
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const item = document.createElement('li');
      if (heading.tagName === 'H3') item.className = 'toc__sub';
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent.trim();
      item.append(link);
      list.append(item);
    });
    toc.hidden = false;
  }
  content.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code || !navigator.clipboard) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制';
    button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = '已复制';
        setTimeout(() => { button.textContent = '复制'; }, 2000);
      } catch (e) { button.textContent = '复制失败'; }
    });
    pre.append(button);
  });
})();
