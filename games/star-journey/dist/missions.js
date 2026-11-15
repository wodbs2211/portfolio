/* R&R missions on top of the 28-day loop. Content: mission-data.js. Spec: docs/superpowers/specs/2026-11-14-star-journey-missions-design.md
 * The core (createEngine/buildSchedule) takes the game functions it needs, so check-missions.cjs can run it in Node.
 * In the browser it wraps the existing global functions (advance, interact, render, ending, renderOther) instead of editing them. */
(function (root) {
  'use strict';
  const STAGE_LEN = 21, LAST_TURN = 84, GAP = 4;

  function rng(seed) {
    let a = seed >>> 0 || 1;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 2~3 missions per stage (fewer if the stage has fewer scenarios), spread over slots 3..20 of the stage, ≥4 apart.
  function buildSchedule(seed, fromTurn, scenarios) {
    const rand = rng(seed), out = [];
    for (let stage = 0; stage < 4; stage++) {
      const pool = scenarios.filter((s) => s.stage === stage).map((s) => s.id);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const k = Math.min(pool.length, rand() < 0.5 ? 2 : 3);
      const start = stage * STAGE_LEN + 3, len = STAGE_LEN - 3;
      for (let i = 0; i < k; i++) {
        const center = start + Math.floor(((i + 0.5) * len) / k), jitter = Math.floor(rand() * 3) - 1;
        out.push({ id: pool[i], turn: Math.min(start + len - 1, center + jitter) });
      }
    }
    return out.filter((it) => it.turn > fromTurn && it.turn < LAST_TURN);
  }

  function createEngine(env) {
    const { data } = env;
    const S = () => env.getState();
    const company = () => (typeof env.company === 'function' ? env.company() : env.company);
    const orgById = (id) => company().organizations.find((o) => o.id === id);
    const nameOf = (id) =>
      [...company().organizations, ...company().workAreas, ...company().positions].find((e) => e.id === id)?.name || id;
    const scenario = (id) => data.scenarios.find((s) => s.id === id);
    const roleCfg = (m) => scenario(m.id).byRole[S().role];
    const step = (m) => roleCfg(m).steps.find((st) => st.id === m.stepId);
    const targetsOf = (m) => step(m).targets || roleCfg(m).targets;
    const clamp = () => {
      const s = S();
      for (const k of ['quality', 'stability', 'trust', 'fatigue']) s[k] = Math.max(0, Math.min(100, s[k]));
      s.money = Math.max(0, s.money);
    };
    const apply = (delta) => {
      for (const [k, v] of Object.entries(delta || {})) S()[k] += v;
      clamp();
    };
    const log = (text) => S().logs.unshift(`${Math.floor(S().turn / 3) + 1}일차 · [미션] ${text}`);
    const fmt = (delta) =>
      Object.entries(delta || {})
        .filter(([k]) => k !== 'xp')
        .map(([k, v]) => ({ quality: '완성도', stability: '안정성', trust: '신뢰', fatigue: '피로', money: '자금' })[k] + (v > 0 ? ' +' : ' ') + v)
        .join(' · ');

    function within(id, rootId) {
      for (let o = orgById(id); o; o = orgById(o.parentId)) if (o.id === rootId) return true;
      return false;
    }
    const matches = (unit, targets) => targets.some((t) => unit === t || within(unit, t));

    function resolveUnit(target) {
      if (!target || !target.entityType || !target.entityId) return null;
      if (target.entityType === 'jobRole') {
        const r = company().jobRoles.find((r) => r.id === target.entityId);
        return r ? r.workAreaId || r.organizationId : null;
      }
      return target.entityId;
    }

    function ensureState() {
      const s = S();
      if (!s || s.missions) return;
      const seed = Math.floor((env.random || Math.random)() * 2147483647) || 1;
      s.missions = { version: 1, seed, schedule: buildSchedule(seed, s.turn, data.scenarios), active: null, history: [], tutorialSeen: false };
    }
    const active = () => S()?.missions?.active || null;

    // Popups never stack on another dialog: wait until it closes.
    function whenFree(fn) {
      if (env.dialogOpen()) env.onDialogClosed(() => whenFree(fn));
      else fn();
    }

    function start(item) {
      const s = S(), sc = scenario(item.id);
      s.missions.active = {
        id: sc.id,
        stepId: sc.byRole[s.role].steps[0].id,
        phase: 'seeking',
        wrong: 0,
        guide: false,
        firstTry: null,
        overreach: 0,
        disabled: [],
        visited: [],
        startedTurn: s.turn,
      };
      log(`${sc.title} — 문제가 생겼다.`);
      env.save();
      const intro = s.missions.tutorialSeen
        ? ''
        : '<br><br><b>미션 진행 방법</b> 이 문제를 맡아야 할 담당 부서를 생각해 보고, 사무실에서 그 부서 사람에게 가서 Space(모바일은 대화 버튼)로 말을 걸어 보세요. 잘못 찾아가도 괜찮아요. 그 부서가 무슨 일을 하는지 알려 줄 거예요.';
      s.missions.tutorialSeen = true;
      env.show(`미션 · ${sc.title}`, `${sc.situation}${intro}<br><br>담당 부서를 찾아가 보세요. 기한: ${Math.ceil((sc.deadlineTurns || data.defaults.deadlineTurns) / 3)}일`, [
        { label: '담당 부서를 찾아갈게요', effect: '방향키로 이동 · Space(모바일은 대화 버튼)로 말 걸기', run: () => {} },
      ]);
    }

    function neglect(m, quiet) {
      const s = S(), sc = scenario(m.id);
      apply(sc.neglect?.delta);
      s.missions.history.push({ id: m.id, role: s.role, outcome: 'neglected', firstTry: m.firstTry, overreach: m.overreach, visited: m.visited, turn: s.turn });
      s.missions.active = null;
      log(sc.neglect?.log || `${sc.title} — 방치했다.`);
      env.save();
      if (!quiet)
        whenFree(() =>
          env.show(`미션 방치 · ${sc.title}`, `기한 안에 담당 부서와 해결하지 못해 문제를 방치했어요. ${sc.neglect?.log || ''} (${fmt(sc.neglect?.delta)})`, [
            { label: '확인', effect: '', run: () => {} },
          ]),
        );
    }

    function checkDeadline() {
      const m = active();
      if (!m) return;
      const sc = scenario(m.id);
      if (S().turn - m.startedTurn >= (sc.deadlineTurns || data.defaults.deadlineTurns)) neglect(m, false);
    }

    function afterAdvance() {
      const s = S();
      if (!s || s.done) return;
      ensureState();
      checkDeadline();
      if (active()) return;
      const doneIds = new Set(s.missions.history.map((h) => h.id));
      const due = s.missions.schedule.find((it) => it.turn <= s.turn && !doneIds.has(it.id) && scenario(it.id));
      if (due) whenFree(() => !active() && !s.done && start(due));
    }

    // Called before time passes: a mission still open when day 28 ends is neglected first, so the ending counts it once.
    function beforeAdvance(cost) {
      const s = S(), m = active();
      if (!s || !m || s.done) return;
      if (cost <= LAST_TURN - s.turn && s.turn + cost >= LAST_TURN) neglect(m, true);
    }

    // Display order is shuffled once per step (seeded, stored on the mission) so own-role options are not always first.
    // m.order holds option indices in display order; m.disabled and choose() always use option indices.
    function orderOf(m, st) {
      if (!Array.isArray(m.order) || m.order.length !== st.options.length) {
        let h = S().missions.seed >>> 0;
        for (const c of m.id + '/' + m.stepId) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
        const rand = rng(h), order = st.options.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        m.order = order;
        env.save();
      }
      return m.order;
    }

    function openChoice() {
      const m = active(), st = step(m);
      env.show(`미션 · ${scenario(m.id).title}`, st.prompt, orderOf(m, st).map((i) => ({
        label: st.options[i].label,
        effect: m.disabled.includes(i) ? '이미 고른 선택지예요' : '',
        disabled: m.disabled.includes(i),
        run: () => choose(i),
      })));
    }

    function handleInteract(target) {
      const m = active();
      if (!m || S().done) return false;
      const unit = resolveUnit(target);
      if (!unit) return false;
      const targets = targetsOf(m);
      if (m.phase === 'choosing') {
        if (!matches(unit, targets)) return false;
        openChoice();
        return true;
      }
      if (!m.visited.includes(unit)) m.visited.push(unit);
      if (matches(unit, targets)) {
        if (m.firstTry === null) m.firstTry = m.wrong === 0;
        m.phase = 'choosing';
        log(`${nameOf(unit)}에 찾아가 함께 문제를 살폈다.`);
        env.save();
        openChoice();
        return true;
      }
      m.wrong++;
      const turnedOn = m.wrong >= 2 && !m.guide;
      if (m.wrong >= 2) m.guide = true;
      env.save();
      const who = target.name && target.name !== '담당' ? `${nameOf(unit)} · ${target.name}` : nameOf(unit);
      env.show(who, `“${data.rnr[unit]?.summary || ''} 이 문제는 저희가 맡을 일은 아니에요.”<br><br>힌트: ${roleCfg(m).wrongHint}${turnedOn ? '<br><br><b>길 안내를 켰어요.</b> 화면의 화살표와 바닥 경로를 따라가 보세요.' : ''}`, [
        { label: '다른 부서를 찾아볼게요', effect: '', run: () => {} },
      ]);
      return true;
    }

    function choose(i) {
      const m = active(), st = step(m), o = st.options[i];
      if (!m || m.disabled.includes(i)) return;
      if (o.kind === 'other') {
        m.disabled.push(i);
        m.overreach++;
        apply(o.penalty || data.defaults.overreachPenalty);
        log(`"${o.label}" — 다른 직무의 일을 고르려 했다.`);
        env.save();
        env.show('그건 다른 직무의 일이에요', `${o.feedback}<br><br><small>${nameOf(o.owner)}의 R&R · ${fmt(o.penalty || data.defaults.overreachPenalty)}</small>`, [
          { label: '다시 고르기', effect: '', run: openChoice },
        ]);
        return;
      }
      const sc = scenario(m.id), next = o.next && roleCfg(m).steps.find((x) => x.id === o.next);
      const review = st.options
        .map((x) => `${x === o ? '▶ ' : ''}${x.kind === 'mine' ? '내 직무의 일' : '다른 직무의 일(' + nameOf(x.owner) + ')'} — ${x.label}`)
        .join('<br>');
      if (next) {
        m.stepId = next.id;
        m.phase = next.targets ? 'seeking' : 'choosing';
        m.disabled = [];
        m.order = null;
      } else {
        S().missions.history.push({ id: m.id, role: S().role, outcome: 'solved', pick: i, firstTry: m.firstTry, overreach: m.overreach, visited: m.visited, turn: S().turn });
        S().missions.active = null;
      }
      env.save();
      // The outcome applies when its dialog closes, whether by 확인, 닫기 or Esc, and only once.
      let applied = false;
      const finish = () => {
        if (applied) return;
        applied = true;
        env.advance(o.effect.cost, o.effect.delta, `[미션] ${sc.title} — ${o.result}`);
        if (next && !next.targets) whenFree(openChoice);
      };
      env.show(`미션 결과 · ${sc.title}`, `${o.result}<br><br><b>선택지 돌아보기</b><br>${review}`, [
        { label: '확인', effect: `${o.effect.cost}구간 · ${fmt(o.effect.delta)}`, run: finish },
      ]);
      env.onDialogClosed(finish);
    }

    function summary() {
      const h = S()?.missions?.history || [];
      const solved = h.filter((x) => x.outcome === 'solved');
      const tried = h.filter((x) => x.firstTry !== null && x.firstTry !== undefined);
      return {
        solved: solved.length,
        neglected: h.length - solved.length,
        firstTryRate: tried.length ? tried.filter((x) => x.firstTry).length / tried.length : null,
        overreach: h.reduce((n, x) => n + (x.overreach || 0), 0),
        departments: [...new Set(h.flatMap((x) => x.visited || []))].map(nameOf),
      };
    }

    // Fixed desks of every character in a target unit, with their floor. Empty unless guidance is on and the player is still looking.
    function guideCandidates() {
      const m = active();
      if (!m || !m.guide || m.phase !== 'seeking' || S().done) return [];
      const targets = targetsOf(m), c = company();
      return c.characters
        .filter((ch) => ch.active !== false && Number.isFinite(ch.x) && Number.isFinite(ch.y))
        .map((ch) => ({ ch, unit: resolveUnit(ch), floorId: c.spaces.find((s) => s.id === ch.spaceId)?.floorId }))
        .filter((x) => x.unit && x.floorId && matches(x.unit, targets))
        .map(({ ch, floorId }) => ({ x: ch.x, y: ch.y, floorId }));
    }

    function reopen() {
      const m = active();
      if (!m) return;
      if (m.phase === 'choosing') return openChoice();
      const sc = scenario(m.id);
      env.show(`미션 · ${sc.title}`, `${sc.situation}<br><br>힌트: ${roleCfg(m).wrongHint}`, [{ label: '찾아가 볼게요', effect: '', run: () => {} }]);
    }

    return { ensureState, afterAdvance, beforeAdvance, handleInteract, choose, active, summary, matches, resolveUnit, reopen, guideCandidates, targetsOf: () => (active() ? targetsOf(active()) : []), scenario, nameOf };
  }

  // Route guidance (spec §7.5). Shows the way only; the player still walks.
  // Goal: tiles within talking distance of a target desk on this floor, or of the elevator when every desk is on another floor.
  // 4-direction BFS on the collision grid, cached until the player's tile, the floor or the goals change.
  function createGuide(g) {
    const { tile: T, cols, rows } = g, REACH = 60, stats = { computed: 0 };
    let cacheKey = '', cached = { points: [], via: null, goal: null };
    function route(floorId, from) {
      const cands = g.candidates() || [];
      if (!cands.length || !from) return { points: [], via: null, goal: null };
      const here = cands.filter((c) => c.floorId === floorId);
      const via = here.length ? null : cands[0].floorId;
      const goals = here.length ? here : [g.elevator()];
      const sx = Math.floor(from.x / T), sy = Math.floor(from.y / T);
      const key = `${floorId}|${sx},${sy}|${goals.map((p) => p.x + ',' + p.y).join(';')}`;
      if (key === cacheKey) return cached;
      cacheKey = key;
      stats.computed++;
      const isGoal = new Set();
      for (const p of goals)
        for (let gy = Math.floor(p.y / T) - 3; gy <= Math.floor(p.y / T) + 3; gy++)
          for (let gx = Math.floor(p.x / T) - 3; gx <= Math.floor(p.x / T) + 3; gx++)
            if (gx >= 0 && gy >= 0 && gx < cols && gy < rows && g.walkable(gx, gy) && Math.hypot((gx + 0.5) * T - p.x, (gy + 0.5) * T - p.y) < REACH)
              isGoal.add(gy * cols + gx);
      const prev = new Map([[sy * cols + sx, -1]]), queue = [sy * cols + sx];
      let end = -1;
      for (let qi = 0; qi < queue.length; qi++) {
        const cur = queue[qi];
        if (isGoal.has(cur)) { end = cur; break; }
        const cx = cur % cols, cy = (cur - cx) / cols;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy, n = ny * cols + nx;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || prev.has(n) || !g.walkable(nx, ny)) continue;
          prev.set(n, cur);
          queue.push(n);
        }
      }
      const points = [];
      for (let k = end; k !== -1; k = prev.get(k)) points.unshift({ x: ((k % cols) + 0.5) * T, y: (Math.floor(k / cols) + 0.5) * T });
      const goal = end === -1
        ? goals.reduce((a, b) => (Math.hypot(b.x - from.x, b.y - from.y) < Math.hypot(a.x - from.x, a.y - from.y) ? b : a))
        : points.at(-1);
      cached = { points, via, goal };
      return cached;
    }
    return { route, stats };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createEngine, buildSchedule, createGuide };
    return;
  }

  // ----- Browser glue -------------------------------------------------------
  const detail = document.querySelector('#detail');
  const engine = createEngine({
    data: root.MissionData,
    company: () => root.CompanyUI.getSnapshot(),
    getState: () => state,
    advance: (cost, delta, text) => advance(cost, delta, text),
    show(title, body, options = []) {
      show(title, body, options);
      // Disabled choices stay visible but cannot be picked again.
      const buttons = detail.querySelectorAll('#options .option');
      options.forEach((o, i) => {
        if (o.disabled && buttons[i]) {
          buttons[i].disabled = true;
          buttons[i].classList.add('used');
        }
      });
    },
    dialogOpen: () => !!document.querySelector('dialog[open]'),
    // A click closes #detail and then runs the option, which may reopen it; that earlier close event lands
    // while the dialog is open again, so keep waiting until a close leaves it really closed.
    onDialogClosed: (fn) => {
      const d = document.querySelector('dialog[open]') || detail;
      const onClose = () => {
        if (d.open) return;
        d.removeEventListener('close', onClose);
        setTimeout(fn, 0);
      };
      d.addEventListener('close', onClose);
    },
    // Every mission state change saves, so the banner refreshes here too (a mission can start after a dialog closes).
    save: () => {
      if (state) save();
      updateBanner();
    },
    toast: (t) => toast(t),
  });

  const banner = document.createElement('button');
  banner.type = 'button';
  banner.id = 'missionBanner';
  banner.hidden = true;
  banner.onclick = () => engine.reopen();
  (document.querySelector('#officeView') || document.body).append(banner);
  function updateBanner() {
    const m = engine.active();
    banner.hidden = !m || view !== 'office';
    if (!m) return;
    const sc = engine.scenario(m.id), left = Math.max(0, (sc.deadlineTurns || root.MissionData.defaults.deadlineTurns) - (state.turn - m.startedTurn));
    banner.innerHTML = `<span class="mission-tag">미션</span><b>${sc.title}</b><small>${m.phase === 'choosing' ? '담당 부서와 해결 방법을 골라요' : '담당 부서를 찾아가세요'}${m.guide ? ' · 길 안내 중' : ''} · 남은 기한 ${left}구간</small>`;
  }

  const prevAdvance = advance;
  advance = function (cost, delta, text) {
    engine.beforeAdvance(cost);
    prevAdvance(cost, delta, text);
    engine.afterAdvance();
    updateBanner();
  };
  const prevInteract = interact;
  interact = function () {
    if (state && view === 'office' && !decorateMode) {
      const n = near();
      if (n && engine.handleInteract(n)) {
        keys.clear();
        updateBanner();
        return;
      }
    }
    prevInteract();
  };
  const prevRender = render;
  render = function () {
    engine.ensureState();
    prevRender();
    updateBanner();
  };
  const prevEnding = ending;
  ending = function () {
    prevEnding();
    const s = engine.summary(), p = document.createElement('p');
    p.className = 'mission-summary';
    p.innerHTML = `<b>R&R 이해</b> 해결한 미션 ${s.solved}개${s.neglected ? ` · 방치 ${s.neglected}개` : ''}${s.firstTryRate === null ? '' : ` · 첫 시도에 맞는 부서를 찾은 비율 ${Math.round(s.firstTryRate * 100)}%`} · 다른 직무의 일을 고른 횟수 ${s.overreach}번${s.departments.length ? `<br>만난 부서: ${s.departments.join(', ')}` : ''}`;
    document.querySelector('#detailContent > p')?.after(p);
  };
  const prevRenderOther = renderOther;
  renderOther = function () {
    prevRenderOther();
    if (view !== 'project' || !state?.missions) return;
    const done = new Map(state.missions.history.map((h) => [h.id, h.outcome]));
    const rows = state.missions.schedule.map((it) => {
      const sc = engine.scenario(it.id);
      const status = done.get(it.id) === 'solved' ? '해결' : done.get(it.id) === 'neglected' ? '방치' : engine.active()?.id === it.id ? '진행 중' : '예정';
      return `<li><span>${status}</span> ${status === '예정' ? `${Math.floor(it.turn / 3) + 1}일차 무렵 · ???` : sc.title}</li>`;
    });
    const box = document.createElement('div');
    box.className = 'report mission-list';
    box.innerHTML = `<h3>이번 플레이의 미션</h3><ul>${rows.join('')}</ul>`;
    document.querySelector('#otherView').append(box);
  };
  document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => setTimeout(updateBanner, 0)));
  // Pick up a mission that is already due when the page loads (e.g. a save from before missions existed).
  if (state) {
    engine.ensureState();
    save();
    engine.afterAdvance();
    updateBanner();
  }

  // ----- Route guidance drawing (office.js calls these two hooks each frame) -----
  // Candidate desks come from a deep-copied snapshot, so they are cached per mission step instead of per frame.
  let candKey = '', candList = [];
  const candidates = () => {
    const m = engine.active();
    const key = m && m.guide && m.phase === 'seeking' && view === 'office' ? `${m.id}|${m.stepId}` : '';
    if (key !== candKey) {
      candKey = key;
      candList = key ? engine.guideCandidates() : [];
    }
    return candList;
  };
  const guide = createGuide({
    tile: T,
    cols: COLS,
    rows: ROWS,
    walkable,
    floor: () => root.CompanyUI.floorId,
    candidates,
    elevator: () => root.CompanyUI.activeFacilities().find((f) => f.id === 'elevator'),
  });
  const GOLD = '#d99a2b', INK = '#fffaf0';
  const floorNo = Object.fromEntries(root.CompanyUI.getSnapshot().floors.map((f) => [f.id, f.number]));
  const current = () => (state && !state.done && candidates().length ? guide.route(root.CompanyUI.floorId, player) : null);

  // Floor layer (above the floor art, below furniture fronts and characters): dashed path, goal ring, elevator sign.
  function drawFloorGuide(g, t) {
    const r = current();
    if (!r) return;
    // Zoomed out, world sizes grow so the guide keeps its on-screen size.
    const k = Math.max(1, 0.9 / camera.scale);
    const flow = reducedMotion ? 0 : (-(t / 45) % 44) * k;
    if (r.points.length > 1) {
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(player.x, player.y);
      for (const p of r.points) g.lineTo(p.x, p.y);
      g.strokeStyle = INK + 'cc';
      g.lineWidth = 9 * k;
      g.stroke();
      g.setLineDash([14 * k, 8 * k]);
      g.lineDashOffset = flow;
      g.strokeStyle = GOLD;
      g.lineWidth = 5 * k;
      g.stroke();
      g.restore();
    }
    const goal = r.goal;
    if (goal) {
      const pulse = reducedMotion ? 0 : Math.sin(t / 260) * 3;
      g.save();
      g.strokeStyle = GOLD;
      g.lineWidth = 3 * k;
      g.beginPath();
      g.ellipse(goal.x, goal.y, (26 + pulse) * k, (13 + pulse / 2) * k, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
    if (r.via) {
      const e = root.CompanyUI.activeFacilities().find((f) => f.id === 'elevator');
      const n = floorNo[r.via];
      if (e && n) outline(`엘리베이터로 ${n}층`, e.x, e.y + 48 * k, Math.round(19 * k), '#ffe7a8');
    }
  }

  // Overlay layer (above characters): arrow over the player's head toward the next turn, and an edge marker when the goal is off screen.
  function drawOverlayGuide(g, t) {
    const r = current();
    if (!r) return;
    let aim = r.goal;
    if (r.points.length) {
      let k = 0;
      for (let i = 1; i < r.points.length; i++)
        if (Math.hypot(r.points[i].x - player.x, r.points[i].y - player.y) < Math.hypot(r.points[k].x - player.x, r.points[k].y - player.y)) k = i;
      aim = r.points[Math.min(k + 3, r.points.length - 1)];
    }
    if (!aim) return;
    const ang = Math.atan2(aim.y - player.y, aim.x - player.x);
    const bob = reducedMotion ? 0 : Math.sin(t / 180) * 4;
    const near = Math.hypot(aim.x - player.x, aim.y - player.y) < 30;
    const k = Math.max(1, 0.9 / camera.scale);
    if (!near) arrow(g, player.x, player.y - 168 + bob, ang, k);
    // Off-screen goal: a marker on the view edge pointing at it.
    const s = camera.scale, vw = camera.width / s, vh = camera.playHeight / s, inset = 34 / s;
    const left = camera.x - vw / 2, top = camera.y - vh / 2;
    if (r.goal && (r.goal.x < left || r.goal.x > left + vw || r.goal.y < top || r.goal.y > top + vh)) {
      const ex = Math.max(left + inset, Math.min(left + vw - inset, r.goal.x));
      const ey = Math.max(top + inset, Math.min(top + vh - inset, r.goal.y));
      arrow(g, ex, ey, Math.atan2(r.goal.y - ey, r.goal.x - ex), 1 / s);
    }
  }

  function arrow(g, x, y, ang, k) {
    g.save();
    g.translate(x, y);
    g.scale(k, k);
    g.rotate(ang);
    g.beginPath();
    g.moveTo(18, 0);
    g.lineTo(-10, -14);
    g.lineTo(-4, 0);
    g.lineTo(-10, 14);
    g.closePath();
    g.fillStyle = GOLD;
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.lineJoin = 'round';
    g.stroke();
    g.fill();
    g.restore();
  }

  engine.route = (floorId, from) => guide.route(floorId, from).points;
  engine.drawFloorGuide = drawFloorGuide;
  engine.drawOverlayGuide = drawOverlayGuide;
  root.Missions = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
