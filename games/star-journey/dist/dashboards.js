/* Department dashboards: 개발본부 shows development status, 사업본부 shows business KPIs for the first public demo.
 * 개발 현황 reads the career save and the mission history. 사업 KPI is a launch simulation computed from the same save
 * with fixed rules (bizModel) and is labeled as a simulation on screen.
 * Opened from the wall screens in each division room (company.js) or from the project tab. Loaded after missions.js. */
(function (root) {
  'use strict';
  const TURNS = 84, PER_STAGE = 21, BURN_PER_TURN = 20;
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dayOf = (turn) => Math.floor(turn / 3) + 1;

  // One snapshot per turn, so the trend lines have real points. Older saves start from their current values.
  function snapshot() {
    if (!state) return;
    const list = (state.metrics ||= []);
    const point = { turn: state.turn, quality: state.quality, stability: state.stability, trust: state.trust, fatigue: state.fatigue, money: state.money };
    const last = list[list.length - 1];
    if (last && last.turn === point.turn) list[list.length - 1] = point;
    else list.push(point);
    if (list.length > TURNS + 1) list.splice(0, list.length - TURNS - 1);
  }
  // A new career starts its trend at turn 0.
  const prevRender = render;
  render = function () {
    if (state && !state.metrics?.length) snapshot();
    prevRender();
  };
  const prevAdvance = advance;
  advance = function (cost, delta, text) {
    prevAdvance(cost, delta, text);
    snapshot();
    save();
  };

  // ----- Small view helpers -----
  // Single-series trend with a hover point per value. One series per chart, so the title names it and no legend is needed.
  function spark(points, key, { max = 100, unit = '', label }) {
    if (points.length < 2) return '<p class="dash-empty">하루 이상 진행하면 추세가 그려져요.</p>';
    const w = 220, h = 48, pad = 4;
    // Scaled to the data's own range (with a minimum span) so small changes stay visible. A line, not an area, so no zero baseline is implied.
    const vals = points.map((p) => p[key]), minSpan = max * 0.1;
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (hi - lo < minSpan) {
      const mid = (hi + lo) / 2;
      lo = mid - minSpan / 2;
      hi = mid + minSpan / 2;
    }
    const first = points[0].turn, span = Math.max(1, points[points.length - 1].turn - first);
    const xy = points.map((p) => [pad + ((p.turn - first) / span) * (w - pad * 2), h - pad - ((p[key] - lo) / (hi - lo || 1)) * (h - pad * 2)]);
    const dots = points
      .map((p, i) => `<circle class="dash-hit" cx="${xy[i][0].toFixed(1)}" cy="${xy[i][1].toFixed(1)}" r="9"><title>${dayOf(p.turn)}일차 ${['오전', '오후', '저녁'][p.turn % 3]} · ${label} ${p[key].toLocaleString()}${unit}</title></circle>`)
      .join('');
    const end = xy[xy.length - 1];
    return `<svg class="dash-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)} 추세"><polyline points="${xy.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}"/><circle class="dash-end" cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="4"/>${dots}</svg>`;
  }
  function change(points, key, sinceTurn) {
    const base = points.filter((p) => p.turn <= sinceTurn).pop() || points[0];
    if (!base) return '';
    const d = state[key] - base[key];
    if (!d) return '<small class="dash-delta">변화 없음</small>';
    return `<small class="dash-delta">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toLocaleString()} <span>이번 단계 시작 대비</span></small>`;
  }
  function tile(title, value, extra = '', note = '') {
    return `<div class="dash-tile"><span>${title}</span><b>${value}</b>${extra}${note ? `<small class="dash-note">${note}</small>` : ''}</div>`;
  }

  // ----- 개발 현황 -----
  const SLOT = ['오전', '오후', '저녁'];
  const when = (turn) => `${dayOf(turn)}일차 ${SLOT[turn % 3]}`;
  // Snapshots are saved per action (1~3 turns apart). Fill every turn with the last known value so x is real time.
  function perTurn(points) {
    if (!points.length) return [];
    const out = [];
    let j = 0;
    for (let turn = points[0].turn; turn <= points[points.length - 1].turn; turn++) {
      while (j + 1 < points.length && points[j + 1].turn <= turn) j++;
      out.push({ ...points[j], turn });
    }
    return out;
  }
  function evenTicks(n, count = 5) {
    if (n <= count) return Array.from({ length: n }, (_, i) => i);
    return [...new Set(Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1))))];
  }

  // Issue timeline: the whole 28 days on one axis, stage bands, today, and every scheduled issue by outcome.
  function issueTimeline(m, active) {
    const w = 680, h = 118, padL = 12, padR = 12, laneY = 74;
    const x = (turn) => padL + (clamp(turn, 0, TURNS) / TURNS) * (w - padL - padR);
    const f = (v) => v.toFixed(1);
    const outcome = new Map(m.history.map((it) => [it.id, it]));
    let svg = stages.map((name, i) => `<rect class="dash-band${i % 2 ? ' odd' : ''}" x="${f(x(i * PER_STAGE))}" y="10" width="${f(x((i + 1) * PER_STAGE) - x(i * PER_STAGE))}" height="${h - 34}"/><text class="dash-axis dash-band-label" x="${f(x(i * PER_STAGE) + 6)}" y="24">${i + 1}. ${esc(name)}</text>`).join('');
    svg += [0, 7, 14, 21, 28].map((d) => `<text class="dash-axis" x="${f(x(d * 3))}" y="${h - 8}" text-anchor="${d === 0 ? 'start' : d === 28 ? 'end' : 'middle'}">${d === 28 ? '공개' : `${d + 1}일`}</text>`).join('');
    svg += `<line class="dash-now" x1="${f(x(state.turn))}" x2="${f(x(state.turn))}" y1="10" y2="${h - 24}"/><text class="dash-now-label" x="${f(x(state.turn) + (state.turn > TURNS - 8 ? -5 : 5))}" y="${laneY - 24}" text-anchor="${state.turn > TURNS - 8 ? 'end' : 'start'}">오늘</text>`;
    svg += m.schedule.map((it) => {
      const done = outcome.get(it.id), isActive = active?.id === it.id;
      const kind = done ? (done.outcome === 'solved' ? 'solved' : 'neglected') : isActive ? 'active' : 'upcoming';
      const title = Missions?.scenario ? Missions.scenario(it.id)?.title || it.id : it.id;
      const status = done ? `${when(done.turn)} ${done.outcome === 'solved' ? '해결' : '방치'}` : isActive ? '진행 중' : '예정';
      return `<circle class="dash-issue-dot ${kind}" cx="${f(x(it.turn))}" cy="${laneY}" r="7"/><rect class="dash-col" x="${f(x(it.turn) - 10)}" y="${laneY - 12}" width="20" height="24" data-tip="${esc(`${when(it.turn)} 발생 · ${title} · ${status}`)}"/>`;
    }).join('');
    const legend = [['solved', '해결'], ['neglected', '방치'], ['active', '진행 중'], ['upcoming', '예정']].map(([k, l]) => `<span><i class="dash-issue-key ${k}"></i>${l}</span>`).join('');
    return `<figure class="dash-chart dash-chart-wide"><div class="dash-legend">${legend}</div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="28일 이슈 타임라인">${svg}</svg></figure>`;
  }

  function devDashboard() {
    const s = state, st = stage(), pts = s.metrics || [];
    const stageStart = st * PER_STAGE;
    const series = perTurn(pts);
    const labels = series.map((p) => when(p.turn));
    const trendChart = series.length < 2
      ? '<p class="dash-empty">하루 이상 진행하면 추세가 그려져요.</p>'
      : chart({
          series: [
            { label: '게임 완성도', values: series.map((p) => p.quality), fmt: (v) => `${v}%` },
            { label: '안정성', values: series.map((p) => p.stability), fmt: (v) => `${v}%` },
            { label: '팀 신뢰', values: series.map((p) => p.trust), fmt: (v) => `${v}` },
          ],
          labels, ticks: evenTicks(series.length), top: 100, yFmt: (v) => Math.round(v), wide: true, aria: '완성도·안정성·팀 신뢰 추이',
        });
    const fatigueChart = series.length < 2
      ? '<p class="dash-empty">하루 이상 진행하면 추세가 그려져요.</p>'
      : chart({ series: [{ label: '피로', values: series.map((p) => p.fatigue), fmt: (v) => `${v}` }], labels, ticks: evenTicks(series.length, 3), top: 100, yFmt: (v) => Math.round(v), ref: { value: 85, label: '85 이상 효과 감소' }, aria: '나의 피로 추이' });

    const m = s.missions || { history: [], schedule: [] };
    const sum = Missions?.summary ? Missions.summary() : null;
    const active = Missions?.active ? Missions.active() : null;
    const done = new Set(m.history.map((h) => h.id));
    const upcoming = m.schedule.filter((it) => !done.has(it.id) && it.id !== active?.id).length;
    let activeHtml = '<p class="dash-empty">지금 진행 중인 이슈가 없어요.</p>';
    if (active) {
      const sc = Missions.scenario(active.id);
      const left = Math.max(0, (sc.deadlineTurns || MissionData.defaults.deadlineTurns) - (s.turn - active.startedTurn));
      activeHtml = `<div class="dash-issue"><b>${esc(sc.title)}</b><small>${active.phase === 'choosing' ? '담당 부서에서 해결 방법을 고르는 중' : '담당 부서를 찾는 중'} · 남은 기한 ${left}구간${active.guide ? ' · 길 안내 중' : ''}</small></div>`;
    }
    // Department that solved each issue: the last desk visited is the one that took it.
    const byDept = new Map();
    for (const h of m.history.filter((h) => h.outcome === 'solved' && h.visited?.length)) {
      const name = Missions.nameOf(h.visited[h.visited.length - 1]);
      byDept.set(name, (byDept.get(name) || 0) + 1);
    }
    const deptHtml = byDept.size
      ? hbars([...byDept].sort((a, b) => b[1] - a[1]).map(([n, c]) => ({ label: esc(n), value: c, text: `${c}건` })), Math.max(...byDept.values()))
      : '<p class="dash-empty">아직 해결한 이슈가 없어요.</p>';
    const total = Math.max(1, m.schedule.length);
    const parts = [['dash-s1', '해결', sum?.solved ?? 0], ['dash-s2', '방치', sum?.neglected ?? 0], ['dash-s3', '진행 중', active ? 1 : 0], ['dash-s0', '예정', upcoming]];
    const statusBar = `<div class="dash-split" role="img" aria-label="${parts.map(([, l, n]) => `${l} ${n}건`).join(', ')}">${parts.filter(([, , n]) => n).map(([c, , n]) => `<i class="${c}" style="width:${((n / total) * 100).toFixed(1)}%"></i>`).join('')}</div>
      <div class="dash-legend">${parts.map(([c, l, n]) => `<span><i class="${c}"></i>${l} ${n}건</span>`).join('')}</div>`;
    const progress = Math.round((Math.min(s.turn, TURNS) / TURNS) * 100);

    return `
      <header class="dash-head"><div><small>개발본부 · 별빛 우체부</small><h2>개발 현황 대시보드</h2></div><p>${when(s.turn)} · 공개까지 D−${Math.max(0, 28 - Math.floor(s.turn / 3))}</p></header>
      <section><h3>개발 일정 <small>${s.turn} / ${TURNS}구간 진행 · ${progress}% · 지금 ${st + 1}단계 ${esc(stages[st])}</small></h3>${issueTimeline(m, active)}</section>
      <section class="dash-grid">
        ${tile('게임 완성도', `${s.quality}${unit('%')}`, change(pts, 'quality', stageStart))}
        ${tile('안정성', `${s.stability}${unit('%')}`, change(pts, 'stability', stageStart))}
        ${tile('팀 신뢰', `${s.trust}`, change(pts, 'trust', stageStart))}
        ${tile('나의 피로', `${s.fatigue}${unit(' / 100')}`, change(pts, 'fatigue', stageStart), s.fatigue >= 85 ? '⚠ 85 이상이면 업무 효과가 줄어요' : '')}
      </section>
      <section><h4>완성도 · 안정성 · 팀 신뢰 추이</h4>${trendChart}</section>
      <section class="dash-two">
        <div><h4>나의 피로</h4>${fatigueChart}</div>
        <div><h4>이슈 처리 현황 <small>전체 ${m.schedule.length}건 · 첫 시도 정답 ${sum?.firstTryRate == null ? '—' : Math.round(sum.firstTryRate * 100) + '%'}</small></h4>${statusBar}${activeHtml}</div>
      </section>
      <section class="dash-two">
        <div><h4>부서별 해결 이슈</h4>${deptHtml}</div>
        <div><h4>최근 개발 일지</h4><ul class="dash-log">${s.logs.slice(0, 4).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
      </section>`;
  }

  // ----- 사업 KPI: launch simulation -----
  // The game has not launched, so there are no real users yet. This projects the first 30 days after launch from the
  // current quality, stability, trust and money with fixed rules, so a player can see which work moves which KPI.
  // The same save always gives the same numbers, and the screen says plainly that they are a simulation.
  const DAYS = 30;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function bizModel(s) {
    const q = clamp(s.quality, 0, 100), st = clamp(s.stability, 0, 100), t = clamp(s.trust, 0, 100);
    // Acquisition: a quarter of the money funds the 30-day launch campaign. A better game makes cheaper ads.
    const uaBudget = Math.round(Math.max(0, s.money) * 0.25) * 10000; // 원
    const cpi = Math.round(3000 - q * 10 - t * 2); // 원
    const paidInstalls = Math.floor(uaBudget / cpi);
    const organicInstalls = Math.round(800 + t * 30 + q * 20); // store features and word of mouth
    const installs = paidInstalls + organicInstalls;
    // Retention: D1 first impression (quality), D7 settling in (stability), D30 core loop (quality, trust).
    const d1 = 0.22 + q * 0.0022 + st * 0.0012;
    const d7 = d1 * (0.3 + st * 0.0015 + t * 0.0008);
    const d30 = d7 * (0.3 + q * 0.0015 + t * 0.001);
    // A power curve through D1, D7 and D30 (straight segments on log-log axes), continued past D30 for the lifetime.
    const k1 = Math.log(d7 / d1) / Math.log(7), k2 = Math.log(d30 / d7) / Math.log(30 / 7);
    const r = (d) => (d <= 0 ? 1 : d <= 7 ? d1 * d ** k1 : d7 * (d / 7) ** k2);
    const retention = Array.from({ length: DAYS + 1 }, (_, d) => r(d));
    // New installs per day: a launch spike that decays.
    const weights = Array.from({ length: DAYS }, (_, d) => 0.88 ** d), wsum = weights.reduce((a, b) => a + b, 0);
    const daily = weights.map((w) => (installs * w) / wsum);
    const dau = daily.map((_, d) => daily.slice(0, d + 1).reduce((sum, n, k) => sum + n * r(d - k), 0));
    const last = DAYS - 1;
    // WAU: played at least once in the last 7 days, each day an independent chance to return.
    const wau = daily.reduce((sum, n, k) => {
      if (k > last - 7) return sum + n;
      let miss = 1;
      for (let d = last - 6; d <= last; d++) miss *= 1 - r(d - k);
      return sum + n * (1 - miss);
    }, 0);
    const mau = installs; // everyone who installed in these 30 days played on their first day
    const sessionMin = Math.round(8 + q * 0.1 + st * 0.04);
    const sessionsPerDay = Math.round((1.4 + st * 0.012 + q * 0.006) * 10) / 10;
    // Monetization: quality makes people want to pay, trust (a fair BM, honest notices) keeps them paying.
    const pur = (1.2 + q * 0.018 + t * 0.012) / 100;
    const pu = Math.round(mau * pur);
    const arppu = Math.round((12000 + t * 120 + q * 60) / 100) * 100;
    const revenue = pu * arppu;
    const dauSum = dau.reduce((a, b) => a + b, 0);
    const revenueDaily = dau.map((n) => (revenue * n) / dauSum);
    const arpdau = revenue / dauSum;
    let lifetime = 0;
    for (let d = 0; d < 365; d++) lifetime += r(d);
    const ltv = arpdau * lifetime;
    const cac = cpi / d1; // one user who installed from an ad and came back the next day
    // ROAS of the ad cohort: what ad-acquired users have paid by day N, over the ad spend.
    let cum = 0;
    const roas = retention.slice(0, DAYS).map((x) => {
      cum += paidInstalls * arpdau * x;
      return uaBudget ? cum / uaBudget : 0;
    });
    return {
      q, st, t, uaBudget, cpi, paidInstalls, organicInstalls, installs, d1, d7, d30, retention, daily, dau, wau, mau,
      dauEnd: dau[last], stickiness: dau[last] / mau, churn: 1 - d30, sessionMin, sessionsPerDay, pur, pu, arppu, revenue,
      revenueDaily, arpu: revenue / mau, arpdau, lifetime, ltv, cac, roas,
      roas7: uaBudget ? roas[6] : null, roas30: uaBudget ? roas[DAYS - 1] : null,
    };
  }

  const num = (v) => Math.round(v).toLocaleString();
  const unit = (u) => `<span class="dash-unit">${u}</span>`;
  const won = (v) => `${num(v)}${unit('원')}`;
  const pct = (v, digits = 1) => `${(v * 100).toFixed(digits)}${unit('%')}`;
  const pctText = (v, digits = 1) => `${(v * 100).toFixed(digits)}%`;
  const manText = (v) => `${num(v / 10000)}만 원`;
  function niceMax(v) {
    const p = 10 ** Math.floor(Math.log10(v || 1));
    return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * p).find((m) => m >= v) || 10 * p;
  }

  // Line or bar chart on a single y axis. Hovering a day column shows every series for that day.
  function chart({ series, labels, ticks, yFmt, bars = false, marks = [], ref, aria, yMax, top: fixedTop, wide = false }) {
    const w = wide ? 680 : 340, h = wide ? 190 : 160, padL = 44, padR = 12, padT = 14, padB = 22;
    const n = labels.length, iw = w - padL - padR, ih = h - padT - padB;
    const top = fixedTop || niceMax(Math.max(yMax || 0, ref?.value || 0, ...series.flatMap((s) => s.values)) * 1.05);
    const step = iw / n;
    const x = (i) => padL + (bars ? (i + 0.5) * step : (i / (n - 1)) * iw);
    const y = (v) => padT + ih - (v / top) * ih;
    const f = (v) => v.toFixed(1);
    let svg = [0, 0.5, 1].map((k) => `<line class="dash-gl" x1="${padL}" x2="${w - padR}" y1="${f(y(top * k))}" y2="${f(y(top * k))}"/><text class="dash-axis" x="${padL - 6}" y="${f(y(top * k) + 3)}" text-anchor="end">${yFmt(top * k)}</text>`).join('');
    svg += ticks.map((i) => `<text class="dash-axis" x="${f(x(i))}" y="${h - 6}" text-anchor="middle">${labels[i]}</text>`).join('');
    if (ref) svg += `<line class="dash-ref" x1="${padL}" x2="${w - padR}" y1="${f(y(ref.value))}" y2="${f(y(ref.value))}"/><text class="dash-axis dash-ref-label" x="${w - padR}" y="${f(y(ref.value) - 4)}" text-anchor="end">${ref.label}</text>`;
    series.forEach((s, si) => {
      if (bars) {
        const bw = Math.max(1, step - 2);
        svg += s.values.map((v, i) => `<rect class="dash-bar dash-s${si + 1}" x="${f(x(i) - bw / 2)}" y="${f(y(v))}" width="${f(bw)}" height="${f(Math.max(0, y(0) - y(v)))}" rx="1.5"/>`).join('');
      } else {
        svg += `<polyline class="dash-line dash-s${si + 1}" points="${s.values.map((v, i) => `${f(x(i))},${f(y(v))}`).join(' ')}"/>`;
      }
    });
    svg += marks.map((m) => `<circle class="dash-mark" cx="${f(x(m.i))}" cy="${f(y(series[0].values[m.i]))}" r="4"/><text class="dash-mark-label" x="${f(x(m.i))}" y="${f(y(series[0].values[m.i]) - 8)}" text-anchor="middle">${m.label}</text>`).join('');
    svg += labels.map((label, i) => {
      const left = bars ? x(i) - step / 2 : i === 0 ? padL : (x(i - 1) + x(i)) / 2;
      const right = bars ? x(i) + step / 2 : i === n - 1 ? w - padR : (x(i) + x(i + 1)) / 2;
      const tip = [label, ...series.map((s) => `${s.label} ${s.fmt(s.values[i])}`)].join(' · ');
      return `<rect class="dash-col" x="${f(left)}" y="${padT}" width="${f(right - left)}" height="${ih}" data-tip="${esc(tip)}"/>`;
    }).join('');
    const legend = series.length > 1 ? `<div class="dash-legend">${series.map((s, si) => `<span><i class="dash-s${si + 1}"></i>${s.label}</span>`).join('')}</div>` : '';
    return `<figure class="dash-chart${wide ? ' dash-chart-wide' : ''}">${legend}<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(aria)}">${svg}</svg></figure>`;
  }
  function hbars(rows, max) {
    return `<ul class="dash-bars">${rows.map((r) => `<li><span>${r.label}</span><div class="dash-meter"><i class="${r.cls || 'dash-s1'}" style="width:${max ? clamp((r.value / max) * 100, 0, 100) : 0}%"></i></div><b>${r.text}</b></li>`).join('')}</ul>`;
  }

  function bizDashboard() {
    const s = state, k = bizModel(s);
    const daysLeft = Math.max(0, 28 - Math.floor(s.turn / 3));
    const burnPerDay = BURN_PER_TURN * 3;
    const runway = Math.floor(s.money / burnPerDay), margin = runway - daysLeft;
    const days = Array.from({ length: DAYS }, (_, d) => `${d + 1}일`);
    const dayTicks = [0, 6, 13, 20, 29];
    // How the projection moved as development went on: re-run the same model on every saved turn.
    const trend = (s.metrics || []).map((p) => {
      const m = bizModel(p);
      return { turn: p.turn, ratio: Math.round((m.ltv / m.cac) * 100) / 100 };
    });
    const ratio = k.ltv / k.cac;
    const verdict = ratio >= 1
      ? `LTV가 CAC의 ${ratio.toFixed(2)}배예요. 광고로 데려온 유저가 들인 비용보다 많이 벌어 줘요.`
      : `⚠ LTV가 CAC의 ${ratio.toFixed(2)}배예요. 지금은 광고로 데려올수록 손해예요.`;
    const funnel = [
      { label: '설치', value: k.installs, text: `${num(k.installs)}명` },
      { label: 'D1 재방문', value: k.installs * k.d1, text: `${num(k.installs * k.d1)}명` },
      { label: 'D7 재방문', value: k.installs * k.d7, text: `${num(k.installs * k.d7)}명` },
      { label: 'D30 재방문', value: k.installs * k.d30, text: `${num(k.installs * k.d30)}명` },
      { label: '결제자(PU)', value: k.pu, text: `${num(k.pu)}명`, cls: 'dash-s2' },
    ];
    const unitCost = [
      { label: 'LTV 생애 가치', value: k.ltv, text: `${num(k.ltv)}원` },
      { label: 'CAC 안착 1명 비용', value: k.cac, text: `${num(k.cac)}원`, cls: 'dash-s2' },
      { label: 'CPI 설치 1건 비용', value: k.cpi, text: `${num(k.cpi)}원`, cls: 'dash-s2' },
    ];
    const paidShare = k.installs ? k.paidInstalls / k.installs : 0;
    const roasText = (v) => (v == null ? '—' : pct(v, 0));
    return `
      <header class="dash-head"><div><small>사업본부 · 별빛 우체부 출시 시뮬레이션</small><h2>사업 KPI 대시보드</h2></div>
        <p>운영 자금 ${s.money.toLocaleString()}만 · ${runway}일 운영 가능 · ${margin >= 0 ? `공개까지 ${daysLeft}일 · 여유 ${margin}일` : `⚠ 공개까지 ${daysLeft}일인데 ${-margin}일 부족해요`}</p></header>
      <p class="dash-sim">아직 출시 전이라 실제 이용자 데이터는 없어요. 지금의 완성도 ${k.q}% · 안정성 ${k.st}% · 팀 신뢰 ${k.t}와 운영 자금으로 <b>출시 후 30일</b>을 예측한 교육용 시뮬레이션이에요. 일을 할 때마다 숫자가 바뀌어요.</p>

      <section><h3>1. 사용자 규모 · 트래픽</h3>
        <div class="dash-grid">
          ${tile('DAU 30일차', `${num(k.dauEnd)}${unit('명')}`, '', '하루 접속한 순 이용자')}
          ${tile('WAU', `${num(k.wau)}${unit('명')}`, '', '최근 7일 접속한 순 이용자')}
          ${tile('MAU', `${num(k.mau)}${unit('명')}`, '', `30일 순 이용자 · DAU/MAU ${pctText(k.stickiness)}`)}
          ${tile('PU · PUR', `${num(k.pu)}${unit('명')}`, '', `결제자 비율 ${pctText(k.pur, 2)} (PU ÷ MAU)`)}
        </div>
        <h4>일간 활성 이용자와 신규 설치</h4>
        ${chart({ series: [{ label: 'DAU', values: k.dau, fmt: (v) => `${num(v)}명` }, { label: '신규 설치', values: k.daily, fmt: (v) => `${num(v)}명` }], labels: days, ticks: dayTicks, yFmt: num, wide: true, aria: '출시 후 30일 DAU와 신규 설치 추이' })}
      </section>

      <section><h3>2. 잔존율 · 참여도</h3>
        <div class="dash-grid">
          ${tile('D1 리텐션', pct(k.d1), '', '다음 날 다시 접속 · 첫인상')}
          ${tile('D7 리텐션', pct(k.d7), '', '7일 차 접속 · 재미 안착')}
          ${tile('D30 리텐션', pct(k.d30), '', '30일 차 접속 · 핵심 콘텐츠')}
          ${tile('월간 이탈률', pct(k.churn), '', '30일 차까지 돌아오지 않은 비율')}
        </div>
        <div class="dash-two">
          <div><h4>리텐션 곡선 <small>설치일 = 100%</small></h4>
            ${chart({ series: [{ label: '재방문율', values: k.retention, fmt: (v) => pctText(v) }], labels: k.retention.map((_, d) => `D${d}`), ticks: [0, 7, 14, 21, 30], yFmt: (v) => `${Math.round(v * 100)}%`, top: 1, marks: [{ i: 1, label: 'D1' }, { i: 7, label: 'D7' }, { i: 30, label: 'D30' }], aria: '설치 후 30일 리텐션 곡선' })}</div>
          <div><h4>설치에서 결제까지</h4>${hbars(funnel, k.installs)}
            <dl class="dash-counts dash-counts-3"><div><dt>평균 플레이</dt><dd>${k.sessionMin}분</dd></div><div><dt>하루 접속</dt><dd>${k.sessionsPerDay}회</dd></div><div><dt>DAU/MAU</dt><dd>${pctText(k.stickiness, 0)}</dd></div></dl></div>
        </div>
      </section>

      <section><h3>3. 수익화</h3>
        <div class="dash-grid">
          ${tile('ARPU', won(k.arpu), '', '30일 매출 ÷ MAU')}
          ${tile('ARPDAU', won(k.arpdau), '', '30일 매출 ÷ 일별 DAU 합')}
          ${tile('ARPPU', won(k.arppu), '', '30일 매출 ÷ 결제자')}
          ${tile('LTV', won(k.ltv), '', `예상 플레이 ${num(k.lifetime)}일 × ARPDAU`)}
        </div>
        <div class="dash-two">
          <div><h4>일 매출 <small>30일 합계 ${manText(k.revenue)}</small></h4>
            ${chart({ series: [{ label: '매출', values: k.revenueDaily, fmt: (v) => `${num(v)}원` }], labels: days, ticks: dayTicks, bars: true, yFmt: (v) => (v >= 10000 ? `${+(v / 10000).toFixed(1)}만` : num(v)), aria: '출시 후 30일 일 매출' })}</div>
          <div><h4>유저 1명의 가치와 비용</h4>${hbars(unitCost, Math.max(k.ltv, k.cac, k.cpi))}<p class="dash-verdict ${ratio >= 1 ? 'good' : 'bad'}">${verdict}</p></div>
        </div>
      </section>

      <section><h3>4. 마케팅 · 유저 획득</h3>
        <div class="dash-grid">
          ${tile('CPI', won(k.cpi), '', '광고로 설치 1건을 얻는 비용')}
          ${tile('CAC', won(k.cac), '', 'CPI ÷ D1 · 안착한 유저 1명 비용')}
          ${tile('ROAS D7', roasText(k.roas7), '', '광고 유저 7일 매출 ÷ 광고비')}
          ${tile('ROAS D30', roasText(k.roas30), '', '광고 유저 30일 매출 ÷ 광고비')}
        </div>
        <div class="dash-two">
          <div><h4>누적 ROAS <small>100%를 넘으면 광고비 회수</small></h4>
            ${k.uaBudget ? chart({ series: [{ label: 'ROAS', values: k.roas, fmt: (v) => pctText(v, 0) }], labels: days, ticks: dayTicks, yFmt: (v) => `${Math.round(v * 100)}%`, ref: { value: 1, label: '회수 100%' }, aria: '광고 유저 누적 ROAS' }) : '<p class="dash-empty">운영 자금이 없어 광고를 집행하지 않았어요.</p>'}</div>
          <div><h4>설치 경로 <small>광고비 ${manText(k.uaBudget)} (운영 자금의 25%)</small></h4>
            <div class="dash-split" role="img" aria-label="광고 설치 ${num(k.paidInstalls)}명, 자연 설치 ${num(k.organicInstalls)}명"><i class="dash-s1" style="width:${(paidShare * 100).toFixed(1)}%"></i><i class="dash-s2" style="width:${((1 - paidShare) * 100).toFixed(1)}%"></i></div>
            <div class="dash-legend"><span><i class="dash-s1"></i>광고 설치 ${num(k.paidInstalls)}명</span><span><i class="dash-s2"></i>자연 설치 ${num(k.organicInstalls)}명</span></div>
            <p class="dash-note">LTV &gt; CAC를 만드는 것이 사업 PM의 핵심 목표예요. CPI를 낮추거나(완성도·팀 신뢰), 리텐션과 결제를 올려 LTV를 키워요.</p></div>
        </div>
      </section>

      <section class="dash-two">
        <div><h3>개발 진행에 따른 LTV ÷ CAC</h3>${spark(trend, 'ratio', { max: 2, unit: '배', label: 'LTV ÷ CAC' })}</div>
        <div><h3>무엇이 무엇을 움직이나</h3><ul class="dash-drivers">
          <li><b>완성도</b> D1·D30 리텐션, CPI, 결제율, 플레이 시간</li>
          <li><b>안정성</b> D7 리텐션, 하루 접속 횟수</li>
          <li><b>팀 신뢰</b> 자연 설치, ARPPU, D30 리텐션</li>
          <li><b>운영 자금</b> 광고비(설치 수)</li></ul></div>
      </section>

      <details class="dash-table"><summary>30일 데이터 표로 보기</summary>
        <table><thead><tr><th>일</th><th>신규 설치</th><th>DAU</th><th>매출</th><th>누적 ROAS</th></tr></thead><tbody>
        ${days.map((d, i) => `<tr><td>${d}</td><td>${num(k.daily[i])}</td><td>${num(k.dau[i])}</td><td>${num(k.revenueDaily[i])}원</td><td>${k.uaBudget ? pctText(k.roas[i], 0) : '—'}</td></tr>`).join('')}
        </tbody></table></details>

      <section class="dash-defs"><h3>시뮬레이션 규칙</h3><ul>
        <li><b>광고비</b> 운영 자금의 25%를 출시 후 30일 캠페인에 쓴다고 가정해요. CPI는 3,000원에서 완성도·팀 신뢰가 높을수록 내려가요.</li>
        <li><b>리텐션</b> D1·D7·D30을 지나는 곡선으로 매일의 재방문율을 그리고, 같은 곡선을 1년까지 이어 LTV의 예상 플레이 일수를 구해요.</li>
        <li><b>설치</b> 출시일에 가장 많고 하루마다 12%씩 줄어요. DAU는 그날까지 설치한 사람 × 설치 후 경과일의 재방문율이에요.</li>
        <li><b>WAU</b> 최근 7일 중 하루라도 접속했을 확률로 추정해요. <b>MAU</b>는 30일 동안 설치한 사람 전체예요.</li>
        <li><b>매출</b> 결제자 × ARPPU를 날마다 DAU 비율로 나눠요. <b>ROAS</b>는 광고로 들어온 유저만의 누적 매출 ÷ 광고비예요.</li>
        <li>지표 정의 참고: <a href="https://unity.com/kr/blog/mobile-game-kpis-analytics-and-metrics" target="_blank" rel="noopener">Unity · 모바일 게임 KPI</a></li>
      </ul></section>`;
  }

  // ----- Dialog -----
  const dialog = document.createElement('dialog');
  dialog.id = 'dashboard';
  dialog.setAttribute('aria-labelledby', 'dashboardTitle');
  dialog.innerHTML = '<div id="dashboardContent"></div><button class="quiet" id="closeDashboard">닫기</button>';
  document.body.append(dialog);
  dialog.querySelector('#closeDashboard').onclick = () => dialog.close();
  // One tooltip for every chart: hovering a day column shows that day's values.
  const tip = document.createElement('div');
  tip.className = 'dash-tip';
  tip.hidden = true;
  dialog.append(tip);
  dialog.addEventListener('pointermove', (e) => {
    const t = e.target.closest?.('[data-tip]');
    if (!t) return void (tip.hidden = true);
    tip.textContent = t.dataset.tip;
    tip.hidden = false;
    const box = dialog.getBoundingClientRect(), x = e.clientX - box.left + dialog.scrollLeft, y = e.clientY - box.top + dialog.scrollTop;
    tip.style.left = Math.min(x + 12, dialog.scrollWidth - tip.offsetWidth - 8) + 'px';
    tip.style.top = y - tip.offsetHeight - 10 + 'px';
  });
  dialog.addEventListener('pointerleave', () => (tip.hidden = true));
  dialog.addEventListener('close', () => {
    tip.hidden = true;
    if (typeof canvas !== 'undefined' && view === 'office') canvas.focus({ preventScroll: true });
  });

  function open(kind) {
    if (!state) return;
    snapshot();
    const html = kind === 'biz' ? bizDashboard() : devDashboard();
    const content = dialog.querySelector('#dashboardContent');
    content.innerHTML = html;
    content.querySelector('h2').id = 'dashboardTitle';
    dialog.dataset.kind = kind;
    if (typeof keys !== 'undefined') keys.clear();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  // Project tab shortcuts, so the dashboards are reachable without walking (and on small screens).
  const prevRenderOther = renderOther;
  renderOther = function () {
    prevRenderOther();
    if (view !== 'project' || !state) return;
    const box = document.createElement('div');
    box.className = 'report dash-links';
    box.innerHTML = '<h3>대시보드</h3><p>사무실에서는 1층 개발본부와 2층 사업본부의 벽 화면에서 볼 수 있어요.</p><div><button class="quiet" data-dash="dev">개발 현황 대시보드</button><button class="quiet" data-dash="biz">사업 KPI 대시보드</button></div>';
    box.querySelectorAll('[data-dash]').forEach((b) => (b.onclick = () => open(b.dataset.dash)));
    document.querySelector('#otherView').append(box);
  };

  if (state) {
    snapshot();
    save();
  }
  root.Dashboards = { open, snapshot, bizModel };
})(typeof globalThis !== 'undefined' ? globalThis : this);
