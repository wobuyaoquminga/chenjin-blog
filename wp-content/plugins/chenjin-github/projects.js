document.querySelectorAll('.ws-projects').forEach(root => {
  const search = root.querySelector('.ws-project-search');
  if (!search) return;
  const language = root.querySelector('.ws-project-language');
  const sort = root.querySelector('.ws-project-sort');
  const grid = root.querySelector('.ws-project-grid');
  const cards = Array.from(grid.querySelectorAll('.ws-project-card'));
  const empty = root.querySelector('.ws-project-filter-empty');
  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.sort((a, b) => sort.value === 'stars'
      ? Number(b.dataset.stars) - Number(a.dataset.stars)
      : sort.value === 'name'
        ? a.dataset.name.localeCompare(b.dataset.name)
        : b.dataset.updated.localeCompare(a.dataset.updated));
    cards.forEach(card => {
      card.hidden = (language.value && card.dataset.language !== language.value)
        || (query && !card.dataset.search.includes(query));
      if (!card.hidden) visible++;
      grid.append(card);
    });
    empty.hidden = visible !== 0;
  }
  [search, language, sort].forEach(control => control.addEventListener('input', update));
});
