(() => {
  const content = document.querySelector('.single-post .entry-content');
  if (!content) return;
  const headings = [...content.querySelectorAll('h2,h3')];
  if (headings.length) {
    const toc = document.createElement('details');
    toc.className = 'chenjin-news-toc'; toc.open = true;
    const summary = document.createElement('summary'); summary.textContent = '文章目录';
    const list = document.createElement('ol');
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `chenjin-section-${index + 1}`;
      const item = document.createElement('li');
      if (heading.tagName === 'H3') item.className = 'toc__sub';
      const link = document.createElement('a'); link.href = '#' + encodeURIComponent(heading.id); link.textContent = heading.textContent.trim();
      item.append(link); list.append(item);
    });
    toc.append(summary, list); content.prepend(toc);
  }
  content.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code || !navigator.clipboard) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.textContent = '复制'; button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = '已复制'; setTimeout(() => { button.textContent = '复制'; }, 2000); }
      catch (_) { button.textContent = '复制失败'; }
    });
    pre.append(button);
  });
})();
