// Projects page: role filter chips show or hide case cards.
(function () {
  const chips = Array.from(document.querySelectorAll('.pj-chip'));
  const cards = Array.from(document.querySelectorAll('.pj-card'));
  const status = document.getElementById('pj-status');
  if (!chips.length || !cards.length) return;

  function apply(filter) {
    let shown = 0;
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.hidden = !match;
      if (match) shown += 1;
    });
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
    if (status) status.textContent = `프로젝트 ${shown}개를 표시합니다`;
  }

  chips.forEach(chip => chip.addEventListener('click', () => apply(chip.dataset.filter)));
})();
