// Office HUD: keeps the screen quiet. Each panel shows a short button or chip first; the details open on hover
// (mouse) or on tap/click (touch, or to pin it open on PC). Also swaps the text glyphs for line icons and adds
// the controls help button. Loaded after the game scripts; it only changes presentation, not game logic.
(() => {
  // 20x20 line icons, drawn for this game (stroke uses currentColor).
  const PATHS = {
    office: 'M3 17h14M5 17V6l5-3 5 3v11M8 9h1M11 9h1M8 12h1M11 12h1M9 17v-2h2v2',
    project: 'M10 2.5 17.5 10 10 17.5 2.5 10ZM10 6.5 13.5 10 10 13.5 6.5 10Z',
    team: 'M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16c0-2.6 2-4.5 4.5-4.5s4.5 1.9 4.5 4.5M13.5 9a2 2 0 1 0 0-4M14.5 11.6c1.8.4 3 1.9 3 4.4',
    journal: 'M5 3h9a1.5 1.5 0 0 1 1.5 1.5v12H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 5 3ZM4.5 15A1.5 1.5 0 0 1 6 13.5h9.5M8 6.5h4.5M8 9h3',
    org: 'M8 2.5h4v3.5H8ZM3 14h4v3.5H3ZM13 14h4v3.5h-4ZM10 6v4M5 14v-4h10v4',
    desk: 'M2.5 8.5h15M4 8.5V16M16 8.5V16M6 8.5V5.5h5v3M12.5 8.5V12h3.5',
    meeting: 'M4 9.5h12v2.5H4ZM6 12v4M14 12v4M7 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM13 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    test: 'M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM12.5 12.5l4.5 4.5M6.5 8.5l1.5 1.5 3-3',
    lounge: 'M4 7.5h9.5v4A4.5 4.5 0 0 1 9 16H8.5A4.5 4.5 0 0 1 4 11.5ZM13.5 8.5h1a2 2 0 0 1 0 4h-1.2M7 2.5v2M10 2.5v2',
    decorate: 'M3.5 16.5c2.5 0 4-1 4-3a2 2 0 0 0-4 0c0 1.2-.5 2-1 3ZM7.5 11.5l8-8 1 1-8 8',
    emote: 'M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM7 11.5c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8M7.5 8h.01M12.5 8h.01',
    tasks: 'M8.5 5.5h8M8.5 10h8M8.5 14.5h8M3.5 5.5l1 1 2-2M3.5 10l1 1 2-2M3.5 14.5l1 1 2-2',
    help: 'M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM7.8 7.8A2.3 2.3 0 0 1 12.3 8.4c0 1.6-2.3 2-2.3 3.4M10 14.3h.01',
  };
  const icon = (name) =>
    `<svg class="hud-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;
  const setIcon = (el, name) => {
    if (!el) return;
    const glyph = el.querySelector('span:first-child') && el.matches('.hotbar button') ? el.querySelector('span:first-child') : null;
    if (glyph) glyph.outerHTML = icon(name);
    else {
      // Rail buttons start with a bare glyph text node; replace it.
      const first = el.firstChild;
      if (first && first.nodeType === 3) first.remove();
      el.insertAdjacentHTML('afterbegin', icon(name));
    }
  };
  const $ = (s) => document.querySelector(s);

  // Left rail and org chart button: icon + hover label.
  const rail = { office: ['office', '사무실 (M)'], project: ['project', '프로젝트'], team: ['team', '팀원'], journal: ['journal', '개발 일지'] };
  for (const [view, [name, tip]] of Object.entries(rail)) {
    const b = $(`.left nav [data-view="${view}"]`);
    if (!b) continue;
    setIcon(b, name);
    b.dataset.tip = tip;
    b.dataset.tipPos = 'right';
  }
  const org = $('#companyToggle');
  if (org) {
    setIcon(org, 'org');
    org.dataset.tip = '회사 조직도';
    org.dataset.tipPos = 'right';
  }

  // Hotbar: icon-only buttons, the name and shortcut show on hover.
  const hot = {
    '[data-place="desk"]': ['desk', '내 자리로 이동 · 1'],
    '[data-place="meeting"]': ['meeting', '회의실로 이동 · 2'],
    '[data-place="qa"]': ['test', '테스트 공간으로 이동 · 3'],
    '[data-place="lounge"]': ['lounge', '휴게실로 이동 · 4'],
    '#decorate': ['decorate', '사무실 꾸미기'],
    '#emote': ['emote', '인사하기'],
    '#taskToggle': ['tasks', '오늘의 업무'],
  };
  for (const [sel, [name, tip]] of Object.entries(hot)) {
    const b = $('.hotbar ' + sel);
    if (!b) continue;
    setIcon(b, name);
    b.dataset.tip = tip;
    b.setAttribute('aria-label', tip);
  }

  // Floor tabs: just "1층 2층 3층"; the department names show on hover.
  document.querySelectorAll('[data-travel-floor]').forEach((b) => {
    const name = b.querySelector('span')?.textContent;
    if (!name) return;
    b.dataset.tip = name;
    b.dataset.tipPos = 'below';
    b.setAttribute('aria-label', b.querySelector('b').textContent + ' · ' + name);
  });
  document.querySelectorAll('.map-tools button').forEach((b) => {
    b.dataset.tip = b.getAttribute('aria-label');
    b.dataset.tipPos = 'above';
  });

  // Controls help: a "?" button; opens by itself on the first visit until the player starts moving.
  const wrap = $('.canvas-wrap');
  if (wrap && !$('#hudHelp')) {
    wrap.insertAdjacentHTML(
      'beforeend',
      `<div class="hud-help hud-pop" id="hudHelp"><button type="button" class="hud-chip hud-help-btn" aria-expanded="false" aria-controls="hudHelpMore" aria-label="조작법">${icon('help')}<span>조작법</span></button>` +
        `<div class="hud-more" id="hudHelpMore" role="note"><b>조작법</b><dl>` +
        `<dt><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd></dt><dd>이동</dd>` +
        `<dt><kbd>Space</kbd></dt><dd>가까운 동료·시설과 상호작용</dd>` +
        `<dt><kbd>1</kbd>~<kbd>4</kbd></dt><dd>내 자리·회의실·테스트·휴게실로 이동</dd>` +
        `<dt><kbd>M</kbd></dt><dd>사무실 화면</dd>` +
        `<dt>마우스</dt><dd>클릭으로 선택 · 휠로 확대·축소 · 드래그로 화면 이동</dd></dl></div></div>`,
    );
  }

  // Hover labels for [data-tip]: one fixed element, so a parent with hidden overflow cannot cut it off.
  const tip = document.createElement('div');
  tip.className = 'hud-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);
  let tipFor = null;
  const showTip = (el) => {
    tipFor = el;
    tip.textContent = el.dataset.tip;
    tip.classList.add('show');
    const r = el.getBoundingClientRect(),
      t = tip.getBoundingClientRect(),
      pos = el.dataset.tipPos || 'above';
    let x = r.left + r.width / 2 - t.width / 2,
      y = r.top - t.height - 8;
    if (pos === 'right') (x = r.right + 10), (y = r.top + r.height / 2 - t.height / 2);
    if (pos === 'below') y = r.bottom + 8;
    tip.style.left = Math.max(8, Math.min(innerWidth - t.width - 8, x)) + 'px';
    tip.style.top = Math.max(8, y) + 'px';
  };
  const hideTip = () => {
    tipFor = null;
    tip.classList.remove('show');
  };
  document.addEventListener('pointerover', (e) => {
    const el = e.pointerType === 'mouse' && e.target.closest('[data-tip]');
    if (el && el !== tipFor) showTip(el);
    else if (!el) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-tip]');
    if (el && el.matches(':focus-visible')) showTip(el);
  });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip);
  addEventListener('scroll', hideTip, true);

  // Panels with details: the location chip, the stats bar, the sprint goal and the help button.
  const pops = () => [...document.querySelectorAll('.hud-pop')];
  const setOpen = (p, on) => {
    p.classList.toggle('open', on);
    p.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', String(on));
  };
  document.addEventListener('click', (e) => {
    const p = e.target.closest('.hud-pop');
    pops().forEach((q) => q !== p && setOpen(q, false));
    if (p && !e.target.closest('.hud-more a, .hud-more button')) setOpen(p, !p.classList.contains('open'));
    // A mouse click must not leave focus on the chip, or the next Space (the game's action key) would press it.
    if (p && e.detail) e.target.closest('button')?.blur();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') pops().forEach((q) => setOpen(q, false));
  });

  let seen = false;
  try {
    seen = localStorage.getItem('studio-days-help-seen') === '1';
  } catch (e) {}
  const help = $('#hudHelp');
  if (help && !seen) {
    setOpen(help, true);
    const moved = (e) => {
      if (!/^Arrow/.test(e.key)) return;
      setOpen(help, false);
      removeEventListener('keydown', moved);
      try {
        localStorage.setItem('studio-days-help-seen', '1');
      } catch (err) {}
    };
    addEventListener('keydown', moved);
    setTimeout(() => setOpen(help, false), 12000); // only a first-visit nudge; it stays one hover away
  }
})();
