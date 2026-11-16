/* Floor renderer and organization browser. Entity IDs never depend on physical placement. */
(function () {
  'use strict';
  const store = CompanyModel.createStore(localStorage),
    types = CompanyModel.typeNames;
  let currentFloor = store.data.session.floorId,
    hitBoxes = [],
    doorSpans = [],
    panelEntity = null,
    saveTimer;
  if (!store.data.floors.some((f) => f.id === currentFloor)) currentFloor = 'floor-1';
  const originalNPCs = npcs.map((n) => ({ ...n })),
    originalFacilities = facilities.map((f) =>
      f.id === 'lounge'
        ? { ...f, x: 1008, y: 1752 }
        : f.id === 'demo'
          ? { ...f, x: 1296, y: 1512 }
          : f.id === 'meeting'
            ? { ...f, x: 2208, y: 672 }
            : f.id === 'qa'
              ? { ...f, x: 864, y: 1272 }
              : { ...f },
    );
  const byId = (collection, id) => store.data[collection].find((o) => o.id === id);
  const active = (list) =>
    list.filter((o) => o.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const entity = (type, id) =>
    byId(
      { organization: 'organizations', position: 'positions', workArea: 'workAreas', jobRole: 'jobRoles' }[
        type
      ],
      id,
    );
  const placementFor = (type, id) =>
    store.data.placements.find((p) => p.active !== false && p.entityType === type && p.entityId === id);
  const spaceFor = (type, id) => {
    if (type === 'jobRole') {
      const r = entity(type, id);
      return spaceFor(r.workAreaId ? 'workArea' : 'organization', r.workAreaId || r.organizationId);
    }
    const p = placementFor(type, id);
    return p && byId('spaces', p.spaceId);
  };
  const floor = () => byId('floors', currentFloor);
  function persistPosition() {
    if (!state) return;
    store.data.session.floorId = currentFloor;
    store.data.session.positionsByFloor[currentFloor] = { x: player.x, y: player.y };
    try {
      store.save();
    } catch (e) {
      toast('층 위치를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');
    }
  }
  function announce() {
    const f = floor();
    $('#floorLabel').textContent = f.number + '층';
    $('#floorTitle').textContent = f.name;
    $('#floorSummary').textContent = f.summary;
    $('#floorLocation').textContent = names().company + ' · ' + f.number + '층';
    const room = store.data.spaces
      .filter(
        (s) =>
          s.active !== false &&
          s.floorId === currentFloor &&
          player.x >= s.rect.x &&
          player.x <= s.rect.x + s.rect.w &&
          player.y >= s.rect.y &&
          player.y <= s.rect.y + s.rect.h,
      )
      .sort((a, b) => a.rect.w * a.rect.h - b.rect.w * b.rect.h)[0];
    $('#roomName').textContent = (room?.name === 'StarJourney 라운지' ? names().studio + ' 라운지' : room?.name) || '공용 통로';
    $('.minimap span').textContent = names().company + ' · ' + f.number + 'F';
    document.querySelectorAll('[data-travel-floor]').forEach((b) => {
      b.classList.toggle('selected', b.dataset.travelFloor === currentFloor);
      b.setAttribute('aria-pressed', String(b.dataset.travelFloor === currentFloor));
    });
  }
  function switchFloor(id, { restore = false } = {}) {
    if (!byId('floors', id)) return;
    persistPosition();
    currentFloor = id;
    selected = null;
    placement = null;
    decorateMode = false;
    keys.clear();
    $('#decorate').classList.remove('selected');
    $('#taskPanel').hidden = true;
    if (view !== 'office') goOffice();
    const at = (restore && store.data.session.positionsByFloor[id]) || floor().spawn;
    buildFloor();
    player.x = at.x;
    player.y = at.y;
    if (!walkable(Math.floor(player.x / T), Math.floor(player.y / T))) {
      player.x = floor().spawn.x;
      player.y = floor().spawn.y;
    }
    camera.x = W / 2;
    camera.y = H / 2;
    camera.manual = false;
    camera.wheelScale = null;
    camera.zoom = 1;
    resize();
    announce();
    persistPosition();
    updateHUD();
    canvas.focus({ preventScroll: true });
    toast(floor().number + '층 · ' + floor().name + ' — 층 이동은 시간을 사용하지 않아요.');
  }
  function elevator() {
    show(
      '엘리베이터 · 층 선택',
      '키보드로 선택한 뒤 Space를 누르거나 층 버튼을 클릭하세요.',
      store.data.floors.map((f) => ({
        label: f.number + '층 — ' + f.name + (f.id === currentFloor ? ' · 현재 층' : ''),
        effect: f.summary + ' · 시간 소모 없음',
        run: () => switchFloor(f.id),
      })),
    );
  }
  function stairs() {
    const f = floor();
    const destinations = store.data.floors.filter((other) => Math.abs(other.number - f.number) === 1);
    show(
      '계단 · 층 이동',
      '연결된 위층이나 아래층으로 이동합니다.',
      destinations.map((other) => ({
        label: other.number + '층 — ' + other.name,
        effect: other.number > f.number ? '계단으로 올라가기' : '계단으로 내려가기',
        run: () => switchFloor(other.id, { restore: false }),
      })),
    );
  }
  function scopedNPCs() {
    return active(store.data.characters)
      .filter(
        (c) =>
          byId('spaces', c.spaceId)?.floorId === currentFloor &&
          entity(c.entityType, c.entityId)?.active !== false,
      )
      .map((c) => {
        const e = entity(c.entityType, c.entityId),
          legacy = originalNPCs.find((n) => n.name === c.legacyName),
          pos = c.memberId && store.data.positions.find((p) => p.holderMemberId === c.memberId);
        return {
          ...legacy,
          ...c,
          team: c.organizationId ? byId('organizations', c.organizationId)?.name : e.name,
          role: legacy?.role || null,
          status: c.memberId ? '본부장' : '업무 중',
          seated: c.seated !== false,
          face: c.face || 'up',
          action: () => {
            if (legacy) npcTalk(legacy);
            else openEntity(pos ? 'position' : c.entityType, pos?.id || c.entityId);
          },
        };
      });
  }
  function organizationPoints() {
    return active(store.data.placements)
      .filter((p) => byId('spaces', p.spaceId)?.floorId === currentFloor)
      .filter((p) => {
        const e = entity(p.entityType, p.entityId);
        return e?.active !== false && (p.entityType !== 'organization' || e.type !== 'part');
      })
      .map((p) => {
        const s = byId('spaces', p.spaceId),
          e = entity(p.entityType, p.entityId);
        return {
          id: p.id,
          name: e.name + ' · 정보 보기',
          x: s.interactionPoint.x,
          y: s.interactionPoint.y,
          entityType: p.entityType,
          entityId: p.entityId,
          action: () => openEntity(p.entityType, p.entityId),
        };
      });
  }
  function activeFacilities() {
    return [
      ...(currentFloor === 'floor-1' ? originalFacilities : []),
      ...organizationPoints(),
      ...roomFacilities(),
      ...dashboardScreens().map((d) => ({
        id: d.id,
        name: d.name,
        x: d.point.x,
        y: d.point.y,
        action: () => window.Dashboards?.open(d.kind),
      })),
      { id: 'elevator', name: '엘리베이터 · 1~3층 이동', x: 2808, y: 600, action: elevator },
      { id: 'stairs', name: '계단 · 층 이동', x: 3096, y: 708, action: stairs },
    ];
  }
  // Two big screens in the shared lobby on every floor, just inside the entrance from the work area. The floor spawn
  // (2880, 800, where the elevator and stairs drop you) sits between them, so they are the first thing you see.
  // You stand below a screen to open it.
  function dashboardScreens() {
    if (byId('spaces', 'space-' + currentFloor + '-transport')?.active === false) return [];
    return [
      { id: 'dashboard-dev', kind: 'dev', name: '개발 현황 대시보드', rect: { x: 2712, y: 740, w: 144, h: 80 }, point: { x: 2784, y: 856 } },
      { id: 'dashboard-biz', kind: 'biz', name: '사업 KPI 대시보드', rect: { x: 2912, y: 740, w: 144, h: 80 }, point: { x: 2984, y: 856 } },
    ];
  }
  function drawDashboardScreen(d) {
    const g = worldCtx,
      { x, y, w, h } = d.rect;
    g.fillStyle = '#2e3a3a40';
    g.fillRect(x + 6, y + 8, w, h);
    g.fillStyle = '#3d4a4b';
    g.fillRect(x, y, w, h);
    g.fillStyle = '#e9f0ea';
    g.fillRect(x + 5, y + 5, w - 10, h - 22);
    // A few static marks so the screen reads as a dashboard. The live numbers open in the dialog.
    const iw = w - 20,
      ih = h - 34;
    g.fillStyle = d.kind === 'dev' ? '#6f9b88' : '#c49a52';
    for (let i = 0; i < 5; i++) {
      const bh = ih * (0.35 + ((i * 37) % 60) / 100);
      g.fillRect(x + 10 + i * (iw / 5), y + 10 + ih - bh, iw / 5 - 4, bh);
    }
    g.fillStyle = '#f6f1d8';
    g.font = '700 14px "Noto Sans KR"';
    g.textAlign = 'center';
    g.fillText(d.kind === 'dev' ? '개발 현황' : '사업 KPI', x + w / 2, y + h - 3);
    g.fillStyle = '#596361';
    g.fillRect(x + w / 2 - 6, y + h, 12, 8);
    add('dashboardScreen', x, y, w, h + 8);
  }
  function roomFacilities() {
    return (store.data.officeRooms || [])
      .map((r) => ({ ...r, space: byId('spaces', r.spaceId) }))
      .filter((r) => r.space.floorId === currentFloor)
      .map((r) => ({
        id: r.id,
        name: r.space.name,
        ...r.space.interactionPoint,
        action: () =>
          r.kind === 'lounge' || r.kind === 'kitchen'
            ? startRest()
            : r.kind === 'meeting'
              ? openTask('manage')
              : show('화장실', names().company + ' · 공용 편의 공간. 업무 공간과 벽으로 분리되어 있어요.', [
                  { label: '돌아가기', effect: '시간 소모 없음', run: () => {} },
                ]),
      }));
  }
  function cluster(x, y, k) {
    const shape = (kind, a, b, w, h) => add(kind, x + a * k, y + b * k, w * k, h * k);
    shape('deskCluster', 98, 80, 600, 408);
    shape('chair', 345, 4, 96, 96);
    shape('chair', 2, 152, 96, 216);
    shape('chair', 698, 152, 96, 216);
    shape('chair', 338, 488, 96, 60);
  }
  function drawRoomBase() {
    const g = worldCtx;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#d5c7b8';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#e4cfb8';
    g.fillRect(48, 120, W - 96, H - 168);
    // Timber circulation routes and pale masonry give rooms a consistent scale.
    g.strokeStyle = '#c5ac8e55';
    g.lineWidth = 1;
    for (let y = 128; y < H - 48; y += 32) {
      g.beginPath();
      g.moveTo(48, y);
      g.lineTo(W - 48, y);
      g.stroke();
      for (let x = 48 + (Math.floor(y / 32) % 2) * 112; x < W - 48; x += 224) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + 32);
        g.stroke();
      }
    }
    g.fillStyle = '#faf8f0';
    g.fillRect(0, 0, W, 120);
    g.fillStyle = '#b5b4a8';
    g.fillRect(36, 118, W - 72, 12);
    g.fillRect(36, 120, 12, H - 156);
    g.fillRect(W - 48, 120, 12, H - 156);
    g.fillRect(36, H - 48, W - 72, 12);
    for (let x = 1100; x < W - 240; x += 300) {
      g.fillStyle = '#a9b2af';
      g.fillRect(x, 12, 240, 88);
      g.fillStyle = '#d3e6eb';
      g.fillRect(x + 6, 18, 228, 72);
      g.fillStyle = '#bacbd0';
      for (let i = 0; i < 6; i++) g.fillRect(x + 12 + i * 36, 50 - (i % 3) * 9, 27, 40 + (i % 3) * 9);
      g.fillStyle = '#eef7f5';
      g.fillRect(x + 118, 18, 5, 72);
      g.fillRect(x + 6, 82, 228, 6);
    }
    g.font = '700 20px "Noto Sans KR"';
    g.fillStyle = '#7b8b7a';
    g.textAlign = 'left';
    g.fillText(names().studio + '  /  ' + names().company, 110, 108);
  }

  function furniture(sx, sy, sw, sh, x, y, w, h) {
    worldCtx.drawImage(officeImage, sx, sy, sw, sh, x, y, w, h);
  }
  function drawCluster(x, y, k) {
    furniture(177, 148, 787, 545, x, y, 787 * k, 545 * k);
    cluster(x, y, k);
  }
  // Shared lobby: x 2640~3264, y 168~912, level with the 회의실 (y 168) since 2026-11-17 (user request).
  // The entrance on the left wall (y 768~896) stays lined up with the corridor from the work area, so the
  // elevator and stairs sit high and the two dashboard screens flank the arrival point (2880, 800) at the bottom,
  // leaving the column inside the entrance (x 2656~2712) open.
  function drawElevator() {
    const g = worldCtx;
    g.fillStyle = '#d6d3c9';
    g.fillRect(1848, 756, 816, 132);
    g.fillStyle = '#e0e5db';
    g.fillRect(2640, 168, 624, 744);
    g.strokeStyle = '#bac2bc';
    g.lineWidth = 1;
    for (let y = 192; y < 912; y += 48) {
      g.beginPath();
      g.moveTo(2640, y);
      g.lineTo(3264, y);
      g.stroke();
    }
    wall(2640, 168, 624, 24);
    wall(2640, 192, 16, 576);
    wall(3248, 192, 16, 720);
    wall(2640, 896, 624, 16);
    g.fillStyle = '#53675e';
    g.font = '700 27px "Noto Sans KR"';
    g.textAlign = 'center';
    g.fillText('공용 로비', 2952, 234);
    g.font = '500 18px "Noto Sans KR"';
    g.fillText('엘리베이터  ·  계단', 2952, 266);
    g.fillStyle = '#687775';
    g.fillRect(2700, 304, 216, 240);
    g.fillStyle = '#b5c3bf';
    g.fillRect(2710, 314, 196, 218);
    g.fillStyle = '#dce3dc';
    g.fillRect(2719, 322, 84, 202);
    g.fillRect(2810, 322, 87, 202);
    g.fillStyle = '#f7fbf4aa';
    g.fillRect(2725, 322, 12, 202);
    g.fillRect(2816, 322, 12, 202);
    g.fillStyle = '#8da69b44';
    g.fillRect(2794, 322, 7, 202);
    g.fillRect(2888, 322, 7, 202);
    g.fillStyle = '#70857c';
    g.fillRect(2764, 276, 88, 29);
    g.fillStyle = '#f5edc5';
    g.font = '700 21px sans-serif';
    g.fillText(floor().number + ' F', 2808, 298);
    g.fillStyle = '#8a957f';
    g.fillRect(2924, 412, 22, 48);
    g.fillStyle = '#f9e0a1';
    g.fillRect(2929, 421, 12, 12);
    add('elevator', 2700, 304, 216, 240);
    g.fillStyle = '#b8bdb2';
    g.fillRect(2992, 304, 208, 330);
    for (let i = 0; i < 10; i++) {
      g.fillStyle = i % 2 ? '#d7d9cf' : '#c4cabe';
      g.fillRect(3000, 314 + i * 30, 192, 26);
      g.fillStyle = '#929e92';
      g.fillRect(3000, 339 + i * 30, 192, 4);
    }
    g.fillStyle = '#65786b';
    g.fillRect(2980, 306, 10, 330);
    g.fillRect(3202, 306, 10, 330);
    add('stairwell', 2980, 304, 232, 336);
    g.font = '600 19px "Noto Sans KR"';
    g.fillStyle = '#52665c';
    g.fillText('엘리베이터', 2808, 576);
    g.fillText('계단 ↑ ↓', 3096, 676);
    g.font = '500 17px "Noto Sans KR"';
    g.textAlign = 'left';
    g.fillText('← 업무 공간', 2664, 722);
    g.textAlign = 'center';
    g.fillText(floor().number + '층 로비', 3170, 858);
  }
  function wrapped(g, text, width, font) {
    g.font = font;
    const lines = [];
    let line = '';
    for (const c of text) {
      if (g.measureText(line + c).width > width && line) {
        lines.push(line);
        line = c;
      } else line += c;
    }
    if (line) lines.push(line);
    return lines;
  }
  function plaque(type, id, x, y, w, { compact = false } = {}) {
    const e = entity(type, id);
    if (!e || e.active === false) return;
    const g = worldCtx;
    const sub =
      type === 'position'
        ? (e.level === 'headquarters_head' ? '본부장' : e.level) + ' · ' + (e.holderMemberId ? byId('members', e.holderMemberId)?.name : '담당자 등록 예정')
        : e.id === 'org-pmo'
          ? '소속·계층 미정'
          : '';
    g.font = compact ? '700 21px "Noto Sans KR"' : '700 26px "Noto Sans KR"';
    const titleW = g.measureText(e.name).width;
    g.font = type === 'position' ? '500 16px "Noto Sans KR"' : '500 15px "Noto Sans KR"';
    // A position shows its holder on a second line; the PMO note sits beside the title so the sign stays one line tall.
    const inline = sub && type !== 'position';
    const subW = sub ? g.measureText(sub).width : 0;
    w = Math.min(w, Math.ceil(inline ? titleW + 12 + subW : Math.max(titleW, subW)) + 30);
    // Keep clear of entrances: shrink to end before a door, or move past it.
    const pad = 8;
    for (const d of doorSpans) {
      if (y > d.y + 60 || y + 70 < d.y - 30 || x >= d.x + d.w + pad || x + w <= d.x - pad) continue;
      if (x < d.x && d.x - pad - x >= w) continue;
      if (x < d.x && d.x - pad - x >= Math.ceil(titleW) + 30) w = d.x - pad - x;
      else x = d.x + d.w + pad;
    }
    const title = wrapped(g, e.name, w - 30, compact ? '700 21px "Noto Sans KR"' : '700 26px "Noto Sans KR"');
    const rows = [];
    if (type === 'organization') {
    }
    const textLines = [];
    for (const row of rows) {
      const ls = wrapped(g, row.label, w - 30, '500 18px "Noto Sans KR"');
      textLines.push({ ...row, lines: ls });
    }
    const titleHeight = title.length * (compact ? 28 : 34),
      height =
        titleHeight +
        textLines.reduce((s, r) => s + r.lines.length * 25, 0) +
        (sub && !inline ? 36 : 16);
    g.fillStyle = type === 'position' ? '#dce8e4f2' : '#fcfff7f2';
    g.strokeStyle = type === 'position' ? '#8fa89c' : '#b3c7ad';
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, w, height, 8);
    g.fill();
    g.stroke();
    g.textAlign = 'left';
    g.fillStyle = '#425248';
    g.font = compact ? '700 21px "Noto Sans KR"' : '700 26px "Noto Sans KR"';
    title.forEach((l, i) => g.fillText(l, x + 15, y + 29 + i * (compact ? 28 : 34)));
    hitBoxes.push({ x, y, w, h: titleHeight + 20, type, id });
    let cy = y + titleHeight + 30;
    g.font = '500 18px "Noto Sans KR"';
    g.fillStyle = '#65705d';
    for (const row of textLines) {
      const start = cy;
      row.lines.forEach((l) => {
        g.fillText(l, x + 15, cy);
        cy += 25;
      });
      hitBoxes.push({
        x: x + 8,
        y: start - 20,
        w: w - 16,
        h: row.lines.length * 25,
        type: row.type,
        id: row.id,
      });
    }
    if (sub) {
      g.font = type === 'position' ? '500 16px "Noto Sans KR"' : '500 15px "Noto Sans KR"';
      g.fillStyle = type === 'position' ? '#6d7e7c' : '#8f7a57';
      if (inline) g.fillText(sub, x + 15 + titleW + 12, y + (compact ? 28 : 29));
      else g.fillText(sub, x + 15, y + titleHeight + 22);
      hitBoxes[hitBoxes.length - 1].h = height;
    }
  }
  function paintFloorLabels() {
    const g = worldCtx;
    hitBoxes = [];
    g.textAlign = 'left';
    g.font = '700 30px "Noto Sans KR"';
    g.fillStyle = '#627360';
    g.fillText(floor().number + '층  ' + floor().name, 110, 78);
    if (currentFloor === 'floor-3') {
      g.fillStyle = '#d2dbbf';
      g.fillRect(96, 785, 1700, 35);
    }
    for (const p of active(store.data.placements)) {
      const s = byId('spaces', p.spaceId),
        e = entity(p.entityType, p.entityId);
      if (
        s?.floorId !== currentFloor ||
        !e ||
        e.active === false ||
        (p.entityType === 'organization' && e.type === 'part')
      )
        continue;
      const d = s.display || { x: s.rect.x, y: s.rect.y, w: s.rect.w };
      if (d.header) {
        hitBoxes.push({ x: d.x, y: d.y, w: d.w, h: 48, type: p.entityType, id: e.id });
        continue;
      }
      if (d.minimal) {
        g.font = '700 24px "Noto Sans KR"';
        g.fillStyle = '#5c6e52';
        g.fillText(e.name + (e.id === 'org-support' ? ' · 팀 → 실' : ''), d.x, d.y + 27);
        hitBoxes.push({ x: d.x, y: d.y, w: d.w, h: 38, type: p.entityType, id: e.id });
      } else
        plaque(
          p.entityType,
          e.id,
          d.x,
          currentFloor === 'floor-3' || d.y >= 1200 ? d.y : d.y < 500 ? 165 : 840,
          d.w,
          { compact: d.compact },
        );
    }
    if (currentFloor === 'floor-2') {
      g.font = '500 20px "Noto Sans KR"';
      g.fillStyle = '#7d8173';
      // The note about 퍼블리싱본부's three work areas sits in the aisle under its rooms; 사업본부 now uses the room at x1104.
      g.textAlign = 'left';
      g.fillText('퍼블리싱본부의 세 영역은 업무 분류입니다. 조직 계층은 미정입니다.', 112, 1452);
    }
  }
  function workstation(c) {
    const g = worldCtx,
      x = c.x,
      y = c.y,
      e = entity(c.entityType, c.entityId);
    if (!e) return;
    // Complete desks, chairs and monitors are drawn individually, never cropped from a room image.
    g.save();
    g.shadowColor = '#413e3955';
    g.shadowBlur = 14;
    g.shadowOffsetY = 8;
    g.fillStyle = '#72645338';
    g.fillRect(x - 100, y - 159, 208, 108);
    g.restore();
    g.fillStyle = '#6c756a';
    g.fillRect(x - 96, y - 70, 10, 42);
    g.fillRect(x + 83, y - 70, 10, 42);
    g.fillStyle = '#8d9882';
    g.fillRect(x - 105, y - 176, 210, 17);
    g.fillStyle = '#c6d0b8';
    g.fillRect(x - 100, y - 174, 200, 10);
    g.fillStyle = '#858573';
    g.fillRect(x - 105, y - 159, 210, 93);
    g.fillStyle = '#f6f3e7';
    g.fillRect(x - 101, y - 157, 202, 84);
    g.fillStyle = '#ffffff99';
    g.fillRect(x - 101, y - 157, 202, 4);
    g.fillStyle = '#a99f8f';
    g.fillRect(x - 101, y - 77, 202, 5);
    g.strokeStyle = '#cbbfa444';
    for (let grain = 0; grain < 4; grain++) {
      g.beginPath();
      g.moveTo(x - 90, y - 145 + grain * 17);
      g.lineTo(x + 90, y - 145 + grain * 17);
      g.stroke();
    }
    g.fillStyle = '#a8b692';
    g.fillRect(x + 52, y - 153, 45, 75);
    g.fillStyle = '#d4c6a4';
    g.fillRect(x - 89, y - 146, 28, 46);
    g.fillStyle = '#eee5cf';
    g.fillRect(x - 86, y - 143, 23, 39);
    for (const offset of [-47, 47]) {
      const mx = x + offset;
      g.fillStyle = '#535e60';
      g.fillRect(mx - 43, y - 160, 86, 60);
      g.fillStyle = '#ced5ce';
      g.fillRect(mx - 39, y - 156, 78, 49);
      g.fillStyle = c.memberId ? '#728da2' : '#7e9f97';
      g.fillRect(mx - 34, y - 151, 68, 39);
      g.fillStyle = '#d1e2d6';
      g.fillRect(mx - 29, y - 146, 58, 4);
      if (offset < 0) {
        g.fillStyle = '#bad3c5';
        for (let line = 0; line < 3; line++) {
          g.fillRect(mx - 29 + line * 4, y - 136 + line * 8, 46 - line * 9, 3);
        }
      } else {
        g.fillStyle = '#c2d9be';
        for (let bar = 0; bar < 5; bar++) g.fillRect(mx - 29 + bar * 12, y - 116 - bar * 4, 7, 6 + bar * 4);
      }
      g.fillStyle = '#f1f5e9';
      g.fillRect(mx - 39, y - 156, 78, 2);
      g.fillStyle = '#596361';
      g.fillRect(mx - 7, y - 100, 14, 12);
      g.fillRect(mx - 23, y - 89, 46, 5);
    }
    g.fillStyle = '#c8c9c1';
    g.fillRect(x - 42, y - 80, 84, 10);
    g.fillStyle = '#778078';
    for (let i = 0; i < 12; i++) g.fillRect(x - 38 + i * 6, y - 78, 3, 5);
    g.fillStyle = '#444b4b';
    g.fillRect(x - 29, y - 80, 58, 62);
    g.fillStyle = '#656e6b';
    g.fillRect(x - 24, y - 75, 48, 47);
    g.fillStyle = '#394040';
    g.fillRect(x - 34, y - 33, 68, 14);
    g.fillStyle = '#8a928b';
    g.fillRect(x - 4, y - 18, 8, 25);
    g.fillRect(x - 31, y + 3, 62, 5);
    g.fillStyle = '#414b45';
    g.fillRect(x - 33, y + 5, 8, 8);
    g.fillRect(x + 25, y + 5, 8, 8);
    let name = e.name;
    // The lead desk sits right under its room sign; repeating the same name above the desk only crowds the sign.
    const home = byId('spaces', c.spaceId),
      d = home?.display;
    if (d && !d.minimal && !d.header && active(store.data.placements).some((p) => p.spaceId === c.spaceId && p.entityId === c.entityId)) {
      const signY = currentFloor === 'floor-3' || d.y >= 1200 ? d.y : d.y < 500 ? 165 : 840;
      if (y - 212 - signY < 110 && y - 212 > signY && d.x < x + 105 && d.x + d.w > x - 105) name = '';
    }
    if (currentFloor === 'floor-3' && c.entityId !== 'org-support') name = '';
    if (c.memberId) name = '퍼블리싱본부장 · 이쮸';
    // Break between words so a long title never leaves one syllable on its own line.
    g.font = '700 17px "Noto Sans KR"';
    const lines = [];
    for (const word of name.split(' ').filter(Boolean)) {
      const last = lines[lines.length - 1];
      if (last && g.measureText(last + ' ' + word).width <= 230) lines[lines.length - 1] = last + ' ' + word;
      else lines.push(...(g.measureText(word).width > 230 ? wrapped(g, word, 230, g.font) : [word]));
    }
    // The 경영지원실 room is too short for a label above the desk; it sits to the left of the desk instead.
    if (currentFloor === 'floor-3' && c.entityId === 'org-support') {
      g.textAlign = 'right';
      g.font = '700 17px "Noto Sans KR"';
      g.fillStyle = '#435448';
      g.fillText(name, x - 120, y - 120);
      lines.length = 0;
    }
    g.textAlign = 'center';
    g.font = '700 17px "Noto Sans KR"';
    g.fillStyle = '#435448';
    lines.forEach((l, i) => g.fillText(l, x, y - 197 - (lines.length - 1 - i) * 22));
    add('workstation', x - 105, y - 176, 210, 110);
    add('officeChair', x - 34, y - 84, 68, 98, { solid: false, seatOwnerId: c.id });
  }
  function officePlant(x, y) {
    const g = worldCtx;
    g.fillStyle = '#304c3228';
    g.beginPath();
    g.ellipse(x + 4, y + 28, 26, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#72664b';
    g.fillRect(x - 18, y, 36, 30);
    g.fillStyle = '#a79a7a';
    g.fillRect(x - 21, y - 4, 42, 10);
    g.fillStyle = '#466a43';
    g.fillRect(x - 3, y - 58, 6, 58);
    for (const [dx, dy] of [
      [-20, -20],
      [17, -34],
      [-17, -50],
      [11, -65],
    ]) {
      g.fillStyle = dx < 0 ? '#4b794b' : '#78945b';
      g.beginPath();
      g.ellipse(x + dx, y + dy, 22, 12, dx < 0 ? 0.5 : -0.5, 0, Math.PI * 2);
      g.fill();
    }
    add('plant', x - 18, y, 36, 30);
  }
  function filingCabinet(x, y) {
    const g = worldCtx;
    g.fillStyle = '#63746733';
    g.fillRect(x + 5, y + 6, 42, 90);
    g.fillStyle = '#7e897b';
    g.fillRect(x, y, 42, 90);
    g.fillStyle = '#f6f7e9';
    g.fillRect(x - 2, y - 3, 46, 6);
    g.fillStyle = '#e8e9dc';
    for (let i = 0; i < 3; i++) {
      g.fillRect(x + 3, y + 3 + i * 28, 36, 24);
      g.fillStyle = '#9eaa99';
      g.fillRect(x + 16, y + 10 + i * 28, 12, 3);
      g.fillStyle = '#e8e9dc';
    }
    add('cabinet', x, y, 42, 90);
  }
  function officeZone(x, y, w, h, executive = false) {
    const g = worldCtx;
    g.fillStyle = executive ? '#cdd7d230' : '#a6b28c20';
    g.fillRect(x, y, w, h);
    g.strokeStyle = executive ? '#9bb7b4' : '#b7bda1';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x, y);
    g.lineTo(x + w, y);
    g.lineTo(x + w, y + h * 0.5);
    g.stroke();
    g.strokeStyle = '#ffffff9c';
    g.lineWidth = 2;
    g.strokeRect(x + 5, y + 5, w - 10, 34);
  }
  function wall(x, y, w, h) {
    const g = worldCtx;
    g.fillStyle = '#53695724';
    g.fillRect(x + 5, y + 7, w, h);
    g.fillStyle = '#dce4db';
    g.fillRect(x, y, w, h);
    g.fillStyle = '#f8faf1';
    g.fillRect(x, y, w, Math.min(h, 4));
    g.fillStyle = '#7f9487';
    g.fillRect(x, y + h - 3, w, 3);
    block(x, y, w, h);
  }
  // Company and studio names typed at setup (app.js brand()); the checks load this file without app.js.
  function names() {
    return typeof brand === 'function' ? brand() : { company: '윤&쮸 컴퍼니', studio: 'StarJourney' };
  }
  // The 웹서비스팀 room when it is on the floor being drawn (2층 by default), else null.
  function webServiceRoom() {
    const s = byId('spaces', 'space-f2-webservice');
    return s && s.active !== false && s.floorId === currentFloor ? s.rect : null;
  }
  function roomShell(x, y, w, h, { door = 'bottom', tone = '#cfd8c9', title = '', doorAt = null } = {}) {
    const g = worldCtx;
    g.fillStyle = '#6a625c18';
    g.fillRect(x + 8, y + 8, w, h);
    g.fillStyle = tone;
    g.fillRect(x, y, w, h);
    g.save();
    g.strokeStyle = '#677d6510';
    g.lineWidth = 1;
    for (let xx = x + 48; xx < x + w; xx += 48) {
      g.beginPath();
      g.moveTo(xx, y);
      g.lineTo(xx, y + h);
      g.stroke();
    }
    g.fillStyle = '#ffffff30';
    g.fillRect(x + 12, y + 18, w - 24, 8);
    g.fillStyle = '#455d4514';
    g.fillRect(x + 12, y + 26, 8, h - 38);
    g.restore();
    g.strokeStyle = '#ffffff2e';
    g.lineWidth = 1;
    for (let yy = y + 32; yy < y + h; yy += 32) {
      g.beginPath();
      g.moveTo(x, yy);
      g.lineTo(x + w, yy);
      g.stroke();
    }
    const gap = 192,
      at = doorAt ?? x + w / 2 - gap / 2;
    doorSpans.push({ x: at, y: door === 'top' ? y : y + h - 12, w: gap, h: door === 'top' ? 18 : 12 });
    if (door === 'top') {
      wall(x, y, at - x, 18);
      wall(at + gap, y, x + w - at - gap, 18);
    } else wall(x, y, w, 18);
    wall(x, y + 18, 12, h - 18);
    wall(x + w - 12, y + 18, 12, h - 18);
    if (door === 'bottom') {
      wall(x, y + h - 12, at - x, 12);
      wall(at + gap, y + h - 12, x + w - at - gap, 12);
    } else wall(x, y + h - 12, w, 12);
    g.fillStyle = '#b39470';
    g.fillRect(at, door === 'top' ? y : y + h - 10, gap, 10);
    g.fillStyle = '#e3d1af';
    g.fillRect(at + 3, door === 'top' ? y + 2 : y + h - 8, gap - 6, 3);
    g.strokeStyle = '#76988988';
    g.lineWidth = 3;
    g.beginPath();
    const dy = door === 'top' ? y + 12 : y + h - 12;
    g.moveTo(at, dy);
    g.lineTo(at + 35, dy + (door === 'top' ? 28 : -28));
    g.moveTo(at + gap, dy);
    g.lineTo(at + gap - 35, dy + (door === 'top' ? 28 : -28));
    g.stroke();
    g.strokeStyle = '#8dadaf';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x + 8, y + 24);
    g.lineTo(x + w - 8, y + 24);
    g.stroke();
    if (title) {
      g.font = '700 23px "Noto Sans KR"';
      g.fillStyle = '#50605a';
      g.textAlign = 'center';
      g.fillText(title, x + w / 2, y + 58);
    }
  }
  function roomTable(x, y) {
    const g = worldCtx;
    g.fillStyle = '#574e4430';
    g.fillRect(x - 115, y - 95, 245, 205);
    g.fillStyle = '#55493e';
    g.fillRect(x - 94, y - 111, 188, 220);
    g.fillStyle = '#9b8161';
    g.fillRect(x - 88, y - 105, 176, 204);
    g.fillStyle = '#c9b28f';
    g.fillRect(x - 86, y - 103, 172, 4);
    g.strokeStyle = '#604a3528';
    for (let line = 0; line < 6; line++) {
      g.beginPath();
      g.moveTo(x - 75, y - 88 + line * 31);
      g.lineTo(x + 75, y - 88 + line * 31);
      g.stroke();
    }
    g.fillStyle = '#b4c5c1';
    g.fillRect(x - 54, y - 54, 60, 43);
    g.fillStyle = '#dce7de';
    g.fillRect(x + 24, y + 9, 37, 48);
    g.fillStyle = '#526c70';
    g.fillRect(x - 8, y - 14, 31, 15);
    add('conferenceTable', x - 94, y - 111, 188, 220);
    for (const dx of [-143, 143])
      for (const dy of [-70, 20, 90]) {
        g.fillStyle = '#6d7772';
        g.fillRect(x + dx - 5, y + dy, 10, 34);
        g.fillRect(x + dx - 26, y + dy + 27, 52, 5);
        g.fillStyle = '#cbd1c7';
        g.beginPath();
        g.roundRect(x + dx - 28, y + dy - 23, 56, 43, 12);
        g.fill();
        g.fillStyle = '#edf0e5';
        g.fillRect(x + dx - 20, y + dy - 17, 40, 22);
      }
  }
  function couch(x, y, w = 260, reverse = false) {
    const g = worldCtx;
    g.save();
    if (reverse) {
      g.translate(x * 2 + w, y * 2 + 68);
      g.rotate(Math.PI);
    }
    g.fillStyle = '#646f5b';
    g.fillRect(x - 7, y - 10, w + 14, 88);
    g.fillStyle = '#93a17e';
    g.fillRect(x, y, w, 72);
    g.fillStyle = '#b9c5a1';
    g.fillRect(x + 12, y + 28, w - 24, 34);
    g.strokeStyle = '#748c6944';
    for (let cushion = 1; cushion < 3; cushion++) {
      g.beginPath();
      g.moveTo(x + (cushion * w) / 3, y + 29);
      g.lineTo(x + (cushion * w) / 3, y + 61);
      g.stroke();
    }
    g.fillStyle = '#d4ddbb';
    g.fillRect(x + 19, y + 32, 31, 24);
    g.fillStyle = '#a4b895';
    g.fillRect(x + w - 51, y + 32, 31, 24);
    g.fillStyle = '#8a9874';
    g.fillRect(x + 6, y + 6, w - 12, 21);
    g.fillStyle = '#495746';
    g.fillRect(x + 9, y + 77, 15, 12);
    g.fillRect(x + w - 24, y + 77, 15, 12);
    g.restore();
    add('sofa', x - 7, y - 10, w + 14, 99);
  }
  function renderAmenities() {
    const g = worldCtx;
    roomShell(1944, 168, 576, 552, { title: '회의실', tone: '#d0d0c3' });
    roomTable(2232, 430);
    g.fillStyle = '#586d68';
    g.fillRect(2050, 239, 350, 65);
    g.fillStyle = '#f5f6eb';
    g.fillRect(2056, 245, 338, 53);
    g.fillStyle = '#91aa98';
    g.fillRect(2074, 258, 140, 6);
    g.fillRect(2074, 272, 230, 5);
    officePlant(2460, 648);
    roomShell(1944, 912, 576, 480, { title: '화장실', tone: '#d3dddc' });
    for (let x = 1992; x < 2460; x += 156) {
      g.fillStyle = '#a8bab8';
      g.fillRect(x, 1000, 126, 168);
      g.fillStyle = '#f1f3e9';
      g.beginPath();
      g.ellipse(x + 63, 1060, 30, 45, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#c8d3d0';
      g.fillRect(x + 29, 1012, 68, 33);
      wall(x - 5, 1000, 6, 182);
      wall(x, 1170, 16, 8);
      wall(x + 110, 1170, 16, 8);
      g.fillStyle = '#bd9d74';
      g.fillRect(x + 14, 1170, 95, 8);
      add('toilet', x + 29, 1012, 68, 94);
    }
    g.fillStyle = '#8faaa8';
    g.fillRect(1980, 1248, 455, 60);
    for (let x = 2010; x < 2420; x += 130) {
      g.fillStyle = '#f7faf1';
      g.beginPath();
      g.ellipse(x + 35, 1274, 40, 18, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#728f91';
      g.fillRect(x + 31, 1248, 8, 19);
    }
    add('washbasin', 1980, 1248, 455, 60);
    for (let mx = 2010; mx < 2420; mx += 130) {
      g.fillStyle = '#819d9a';
      g.fillRect(mx - 4, 1194, 80, 40);
      g.fillStyle = '#dcece8';
      g.fillRect(mx, 1198, 72, 32);
      g.fillStyle = '#ffffff99';
      g.fillRect(mx + 4, 1201, 5, 24);
    }
    roomShell(1944, 1488, 576, 360, { door: 'top', title: '탕비실', tone: '#e3ddce' });
    furniture(1076, 708, 430, 184, 2020, 1570, 387, 165.6);
    add('kitchenCounter', 2020, 1570, 387, 166);
    // 2층은 웹서비스팀 방(x1152~1920)이 생기면 라운지가 그 왼쪽(x96~1152)까지만 이어지고, 데모 화면과 화분도 함께 왼쪽으로 온다.
    const webRoom = webServiceRoom();
    const loungeW = webRoom ? webRoom.x - 96 : currentFloor === 'floor-1' ? 1272 : 1728,
      dx = webRoom ? -220 : 0;
    roomShell(96, 1488, loungeW, 360, {
      door: 'top',
      title: names().studio + ' 라운지',
      tone: '#d9d4c2',
    });
    g.fillStyle = '#a29b7e38';
    g.beginPath();
    g.roundRect(196, 1555, 370, 282, 14);
    g.fill();
    couch(225, 1575, 310);
    couch(225, 1730, 310, true);
    g.fillStyle = '#a38968';
    g.beginPath();
    g.roundRect(310, 1672, 140, 48, 12);
    g.fill();
    add('loungeTable', 310, 1672, 140, 48);
    officePlant(150, 1770);
    officePlant(webRoom ? 640 : 1200, 1770);
    g.fillStyle = '#536e71';
    g.fillRect(1230 + dx, 1515, 110, 80);
    g.fillStyle = '#dbe6d0';
    g.fillRect(1236 + dx, 1521, 98, 60);
    g.fillStyle = '#f6e9b0';
    // The studio name on the demo screen shrinks to fit the 98px screen.
    let size = 15;
    do g.font = `700 ${size}px sans-serif`;
    while (g.measureText(names().studio).width > 90 && --size > 9);
    g.textAlign = 'center';
    g.fillText(names().studio, 1285 + dx, 1554, 90);
    add('demoScreen', 1230 + dx, 1515, 110, 80);
  }
  function officeDetails() {
    const g = worldCtx;
    // Storage sits against room edges; circulation aisles and door thresholds stay clear.
    if (currentFloor !== 'floor-3') {
      filingCabinet(828, 1080);
      filingCabinet(1750, 340);
      filingCabinet(1750, 450);
      officePlant(1790, 660);
    }
    // A separate shared table gives the lounge both informal meetings and quiet seating.
    g.fillStyle = '#b49d7f';
    g.beginPath();
    g.ellipse(900, 1715, 100, 48, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#edf0e5';
    g.fillRect(870, 1699, 36, 24);
    g.fillStyle = '#627675';
    g.fillRect(912, 1702, 24, 17);
    add('sharedTable', 800, 1667, 200, 96);
    for (const x of [744, 1020]) {
      g.fillStyle = '#7c8c77';
      g.fillRect(x, 1695, 48, 47);
      g.fillStyle = '#b2c1a2';
      g.fillRect(x + 5, 1700, 38, 31);
      add('loungeChair', x, 1695, 48, 47);
    }
  }
  function buildFloor() {
    blocked.clear();
    objects.length = 0;
    doorSpans = [];
    block(0, 0, W, 120);
    block(0, H - 48, W, 48);
    block(0, 0, 48, H);
    block(W - 48, 0, 48, H);
    if (!artLoaded && !officeImage.complete) return;
    drawRoomBase();
    if (currentFloor === 'floor-1' || currentFloor === 'floor-2') {
      roomShell(96, 144, 792, 600, { tone: '#ccd5bf' });
      roomShell(1104, 144, 744, 600, { tone: currentFloor === 'floor-1' ? '#d4d8c8' : '#c4d4ce' });
      roomShell(96, 816, 792, 588, { door: 'top', tone: '#cbd5d1' });
      // 24px wider than the room above so three desks fit inside the walls with walkable aisles.
      roomShell(1104, 816, 768, 588, {
        door: 'top',
        tone: currentFloor === 'floor-1' ? '#d6cbd2' : '#cbd4c5',
      });
      if (currentFloor === 'floor-2') {
        roomTable(650, 1220);
      }
      // The corner below the shared lobby: 개발본부장실 (1층) and 퍼블리싱본부장실 (2층), with the head's storage.
      if (store.data.spaces.some((s) => s.floorId === currentFloor && (s.id === 'space-f1-director' || s.id === 'space-f2-head'))) {
        roomShell(2592, 1272, 672, 576, { door: 'top', tone: currentFloor === 'floor-1' ? '#cdd6d8' : '#d8d2c4' });
        filingCabinet(3196, 1336);
        filingCabinet(3196, 1446);
        officePlant(2656, 1790);
      }
    } else {
      for (const pos of active(store.data.positions)) {
        const s = spaceFor('position', pos.id);
        if (s?.floorId !== currentFloor) continue;
        const { x, y, w, h } = s.rect;
        roomShell(x, y, w, h - 24, { tone: '#c6d3cf', doorAt: x + 244 });
        filingCabinet(x + w - 58, y + 90);
      }
      for (const o of active(store.data.organizations).filter((o) => o.parentId === 'org-support')) {
        const s = spaceFor('organization', o.id),
          { x, y, w, h } = s.rect;
        roomShell(x, y, w, h - 24, { tone: '#d4d8c5', doorAt: x + 244 });
        filingCabinet(x + w - 58, y + 80);
      }
    }
    if (currentFloor === 'floor-3') roomShell(1260, 1120, 480, 216, { tone: '#d4d8c5', doorAt: 1509 });
    renderAmenities();
    officeDetails();
    // 개발지원팀 room (the 개발본부 desk used to be here); 96px wider than before so its two desks fit.
    if (currentFloor === 'floor-1') roomShell(1368, 1488, 552, 360, { door: 'top', tone: '#c8d4c2' });
    // 웹서비스팀 room on floor 2 (cut from the right end of the lounge), three desks like the 사업본부 room.
    const webRoom = webServiceRoom();
    if (webRoom) roomShell(webRoom.x, webRoom.y, webRoom.w, webRoom.h, { door: 'top', tone: '#cfd6cb' });
    for (const c of active(store.data.characters).filter(
      (c) => byId('spaces', c.spaceId)?.floorId === currentFloor,
    ))
      workstation(c);
    for (const [x, y] of [
      currentFloor === 'floor-3' ? [1130, 1440] : [950, 1380],
      [2470, 1770],
    ])
      officePlant(x, y);
    drawElevator();
    dashboardScreens().forEach(drawDashboardScreen); // after the lobby floor, which they stand on
    paintFloorLabels();
    if (!walkable(Math.floor(player.x / T), Math.floor(player.y / T))) {
      player.x = floor().spawn.x;
      player.y = floor().spawn.y;
    }
    artLoaded = true;
    drawMini();
  }

  function node(tag, text, cls) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  }
  function button(label, fn, cls = '') {
    const b = node('button', label, cls);
    b.type = 'button';
    b.onclick = fn;
    return b;
  }
  function link(type, id, label) {
    return button(label || entity(type, id)?.name || '미정', () => openEntity(type, id), 'entity-link');
  }
  function row(label, value) {
    const r = node('div', undefined, 'org-row');
    r.append(node('dt', label));
    const dd = node('dd');
    if (value instanceof Node) dd.append(value);
    else dd.textContent = value || '미정';
    r.append(dd);
    return r;
  }
  function typeLabel(type, e) {
    return type === 'organization'
      ? types[e.type]
      : type === 'position'
        ? '직책 · ' + (e.level === 'headquarters_head' ? '본부장' : e.level)
        : type === 'workArea'
          ? '업무 분류 · 조직 계층 미정'
          : '직무';
  }
  function renderTree() {
    const list = $('#organizationTree');
    list.replaceChildren();
    function item(type, e, depth) {
      const b = button(
        e.name,
        () => openEntity(type, e.id),
        'org-tree-item' + (panelEntity?.id === e.id ? ' selected' : ''),
      );
      b.style.setProperty('--depth', depth);
      b.append(node('small', typeLabel(type, e)));
      list.append(b);
    }
    function branch(o, depth) {
      item('organization', o, depth);
      active(store.data.positions)
        .filter((p) => p.organizationId === o.id)
        .forEach((p) => item('position', p, depth + 1));
      active(store.data.organizations)
        .filter((c) => c.parentId === o.id)
        .forEach((c) => branch(c, depth + 1));
      active(store.data.workAreas)
        .filter((a) => a.organizationId === o.id)
        .forEach((a) => {
          item('workArea', a, depth + 1);
          active(store.data.jobRoles)
            .filter((r) => r.workAreaId === a.id)
            .forEach((r) => item('jobRole', r, depth + 2));
        });
      active(store.data.jobRoles)
        .filter((r) => r.organizationId === o.id && !r.workAreaId)
        .forEach((r) => item('jobRole', r, depth + 1));
    }
    for (const f of store.data.floors) {
      list.append(node('h3', f.number + '층 · ' + f.name));
      const roots = active(store.data.organizations).filter(
        (o) => !o.parentId && spaceFor('organization', o.id)?.floorId === f.id,
      );
      if (f.id === 'floor-3') {
        list.append(node('p', '경영진 · 직책', 'tree-group'));
        active(store.data.positions)
          .filter((p) => spaceFor('position', p.id)?.floorId === f.id)
          .forEach((p) => item('position', p, 0));
      }
      roots.forEach((o) => branch(o, 0));
    }
  }
  function openEntity(type, id) {
    const e = entity(type, id);
    if (!e) return;
    keys.clear();
    panelEntity = { type, id };
    renderTree();
    const box = $('#organizationDetail');
    box.replaceChildren();
    box.append(node('span', typeLabel(type, e), 'org-kind'), node('h2', e.name));
    if (canEditOrg()) box.append(editBar(type, id));
    const s = spaceFor(type, id),
      f = s && byId('floors', s.floorId);
    const info = node('dl', undefined, 'org-facts');
    info.append(row('유형', typeLabel(type, e)), row('배치 공간', f ? f.number + '층 · ' + s.name : '미정'));
    if (type === 'organization') {
      info.append(row('상위 조직', e.parentId ? link('organization', e.parentId) : '미정'));
      if (e.id === 'org-pmo') info.append(row('개발본부 산하 여부', '미정'));
    }
    if (type === 'position') {
      info.append(
        row('담당자', e.holderMemberId ? byId('members', e.holderMemberId)?.name : '등록 예정'),
        row('담당 본부', e.organizationId ? link('organization', e.organizationId) : '미정'),
        row('보고 관계', e.reportsToPositionId ? link('position', e.reportsToPositionId) : '미정'),
        row('상세 담당 업무', e.responsibilities || '등록 예정'),
      );
    }
    if (type === 'workArea')
      info.append(
        row('소속 본부', link('organization', e.organizationId)),
        row('조직 계층', '미정 · 팀·실·부문으로 확정하지 않음'),
      );
    if (type === 'jobRole') {
      info.append(row('소속 조직', e.organizationId ? link('organization', e.organizationId) : '미정'));
      if (e.workAreaId) info.append(row('업무 분류', link('workArea', e.workAreaId)));
    }
    info.append(row('업무 설명', e.description || '등록 예정'));
    if (e.specialties?.length) info.append(row('세부 전문 분야', e.specialties.join(' / ')));
    box.append(info);
    const children =
        type === 'organization' ? active(store.data.organizations).filter((o) => o.parentId === id) : [],
      areas =
        type === 'organization' ? active(store.data.workAreas).filter((a) => a.organizationId === id) : [],
      roles = active(store.data.jobRoles).filter((r) =>
        type === 'workArea' ? r.workAreaId === id : type === 'organization' ? r.organizationId === id : false,
      );
    function section(title, items, t) {
      box.append(node('h3', title));
      const wrap = node('div', undefined, 'org-chip-list');
      if (items.length) items.forEach((c) => wrap.append(link(t, c.id)));
      else wrap.append(node('p', '등록 예정', 'org-empty'));
      box.append(wrap);
    }
    if (type === 'organization') {
      const positions = active(store.data.positions).filter((p) => p.organizationId === id);
      if (positions.length) section('소속 직책', positions, 'position');
      section('하위 조직', children, 'organization');
    }
    if (areas.length) section('업무 분류', areas, 'workArea');
    if (type !== 'position') section('소속 직무', roles, 'jobRole');
    if (type === 'organization' && e.specialties?.length)
      box.append(node('p', '2D와 3D는 이 파트의 세부 전문 분야입니다. 별도 조직이 아닙니다.', 'org-note'));
    const avatars = store.data.characters.filter((c) => c.entityType === type && c.entityId === id);
    if (avatars.length) {
      box.append(node('h3', '배치된 캐릭터'));
      for (const c of avatars) {
        const person = c.memberId && byId('members', c.memberId);
        box.append(
          node(
            'p',
            (person
              ? person.name
              : c.isPlaceholder
                ? '조직 담당 캐릭터 · 실제 인물 등록 예정'
                : c.name + ' · 게임 내 동료') +
              ' / ' +
              (f ? f.number + '층' : '배치 공간 확인 예정'),
            'org-person',
          ),
        );
      }
    }
    box.append(node('h3', '연결 데이터'));
    const counts = node('div', undefined, 'org-records');
    for (const [k, label] of [
      ['members', '구성원·담당자'],
      ['projects', '프로젝트'],
      ['tasks', '업무·진행 상태'],
      ['documents', '문서·가이드'],
      ['operationRecords', '개발·운영 기록'],
    ]) {
      const linked =
        store.data.entityLinks.filter((l) => l.sourceType === type && l.sourceId === id && l.targetType === k)
          .length +
        (k === 'members'
          ? store.data.members.filter((m) =>
              type === 'organization'
                ? m.organizationId === id
                : type === 'position'
                  ? m.positionId === id
                  : false,
            ).length
          : 0);
      counts.append(node('div', label + ' · ' + (linked ? linked + '건' : '등록 예정')));
    }
    box.append(counts);
    const footer = node(
      'p',
      '고유 ID: ' + e.id + ' · ' + (e.active === false ? '비활성' : '활성') + ' · 표시 순서 ' + e.sortOrder,
      'org-id',
    );
    box.append(footer);
    if (f)
      box.append(
        button(
          f.number + '층 공간 보기',
          () => {
            $('#companyPanel').close();
            switchFloor(f.id);
            selected = { name: e.name, ...s.interactionPoint };
            toast('위치를 표시했어요. 키보드로 이동해 Space를 누르세요.');
          },
          'org-locate',
        ),
      );
    if (!$('#companyPanel').open) $('#companyPanel').showModal();
    $('#companyPanelTitle').focus({ preventScroll: true });
  }
  // ----- Org chart editing -----
  // Anyone can edit for now. When admin roles arrive, canEditOrg() is the one place to check them.
  const canEditOrg = () => true;
  const COLLECTION = { organization: 'organizations', position: 'positions', workArea: 'workAreas', jobRole: 'jobRoles' };
  const ORG_TYPES = ['headquarters', 'division', 'office', 'team', 'part', 'unclassified'];
  const RANK = { part: 0, team: 1, office: 2, division: 3, headquarters: 4 };
  const ORG_ERRORS = [
    [/Invalid hierarchy/, '하위 조직은 상위 조직보다 낮은 계층이어야 해요. (파트 → 팀 → 실 → 부문 → 본부)'],
    [/Organization cycle/, '자기 자신이나 그 하위 조직을 상위 조직으로 고를 수 없어요.'],
  ];
  const orgError = (e) => ORG_ERRORS.find(([re]) => re.test(e.message))?.[1] || '저장하지 못했어요. 입력한 내용을 확인해 주세요.';
  const newId = (prefix) => prefix + '-custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nextOrder = (list) => Math.max(0, ...list.map((o) => o.sortOrder || 0)) + 1;
  // Saves through the validated store; a rejected change leaves the saved chart as it was.
  function commitOrg(fn) {
    store.update(fn);
    buildFloor();
    announce();
  }
  function descendants(id) {
    const out = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const o of store.data.organizations)
        if (o.parentId && out.has(o.parentId) && !out.has(o.id)) {
          out.add(o.id);
          grew = true;
        }
    }
    return out;
  }
  // Seeded units own desks, signs and missions in the office; only units without a seat can be removed.
  function deleteBlocker(type, id) {
    if (store.data.characters.some((c) => c.entityType === type && c.entityId === id) || placementFor(type, id))
      return '사무실에 자리나 표지판이 있는 항목은 삭제할 수 없어요. 이름과 설명을 수정해 주세요.';
    const d = store.data;
    const child =
      (type === 'organization' &&
        (active(d.organizations).some((o) => o.parentId === id) ||
          active(d.positions).some((p) => p.organizationId === id) ||
          active(d.workAreas).some((a) => a.organizationId === id) ||
          active(d.jobRoles).some((r) => r.organizationId === id))) ||
      (type === 'workArea' && active(d.jobRoles).some((r) => r.workAreaId === id));
    return child ? '하위 조직이나 직무가 있으면 삭제할 수 없어요. 먼저 하위 항목을 정리해 주세요.' : '';
  }
  function field(label, control) {
    const l = node('label', undefined, 'org-field');
    l.append(node('span', label), control);
    return l;
  }
  function input(name, value = '', { max = 40, required = false, placeholder = '' } = {}) {
    const el = node('input');
    Object.assign(el, { name, value: value || '', maxLength: max, required, placeholder, autocomplete: 'off' });
    return el;
  }
  function textarea(name, value = '', placeholder = '') {
    const el = node('textarea');
    Object.assign(el, { name, value: value || '', maxLength: 300, rows: 3, placeholder });
    return el;
  }
  function select(name, options, value) {
    const el = node('select');
    el.name = name;
    for (const [v, label] of options) {
      const o = node('option', label);
      o.value = v;
      el.append(o);
    }
    el.value = value;
    return el;
  }
  // One form for editing and adding: fields(form) builds the inputs, save(values) changes the draft data.
  function orgForm(title, fields, save, back) {
    const box = $('#organizationDetail');
    box.replaceChildren();
    const form = node('form', undefined, 'org-form');
    form.noValidate = false;
    form.append(node('h2', title));
    fields(form);
    const error = node('p', '', 'org-form-error');
    error.setAttribute('role', 'alert');
    const actions = node('div', undefined, 'org-form-actions');
    const submit = node('button', '저장', 'org-save');
    submit.type = 'submit';
    actions.append(submit, button('취소', back, 'org-cancel'));
    form.append(error, actions);
    form.onsubmit = (ev) => {
      ev.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      for (const k of Object.keys(values)) values[k] = String(values[k]).trim();
      if ('name' in values && !values.name) {
        error.textContent = '이름을 입력해 주세요.';
        return;
      }
      try {
        save(values);
      } catch (e) {
        error.textContent = orgError(e);
      }
    };
    box.append(form);
    form.querySelector('input,textarea,select')?.focus();
  }
  const specialtyText = (e) => (e.specialties || []).join(' / ');
  const specialtyList = (text) => (text || '').split('/').map((s) => s.trim()).filter(Boolean);
  function editEntity(type, id) {
    const e = entity(type, id);
    orgForm(
      e.name + ' 수정',
      (form) => {
        form.append(field('이름', input('name', e.name, { required: true })));
        if (type === 'organization') {
          form.append(field('조직 유형', select('type', ORG_TYPES.map((t) => [t, types[t]]), e.type)));
          const banned = descendants(id);
          const parents = active(store.data.organizations).filter((o) => !banned.has(o.id));
          // A unit without a parent needs its own room to appear on the chart, so only rooms keep "없음".
          const options = (e.parentId ? [] : [['', '없음 (최상위)']]).concat(parents.map((o) => [o.id, o.name + ' · ' + types[o.type]]));
          form.append(field('상위 조직', select('parentId', options, e.parentId || '')));
        }
        form.append(field('업무 설명', textarea('description', e.description, '이 조직이 맡는 일을 적어 주세요.')));
        if (type === 'position') form.append(field('상세 담당 업무', textarea('responsibilities', e.responsibilities)));
        if (type === 'organization' || type === 'jobRole')
          form.append(field('세부 전문 분야', input('specialties', specialtyText(e), { max: 120, placeholder: '예: 2D / 3D' })));
      },
      (v) => {
        commitOrg((db) => {
          const t = db[COLLECTION[type]].find((x) => x.id === id);
          t.name = v.name;
          t.description = v.description || null;
          if (type === 'organization') {
            t.type = v.type;
            if ('parentId' in v) {
              t.parentId = v.parentId || null;
              t.parentStatus = t.parentId ? 'confirmed' : 'undecided';
            }
          }
          if (type === 'position') t.responsibilities = v.responsibilities || null;
          if ('specialties' in v) t.specialties = specialtyList(v.specialties);
        });
        toast('조직도를 저장했어요.');
        openEntity(type, id);
      },
      () => openEntity(type, id),
    );
  }
  function addChild(parentType, parentId, kind) {
    const parent = entity(parentType, parentId);
    const isOrg = kind === 'organization';
    orgForm(
      parent.name + (isOrg ? ' · 하위 조직 추가' : ' · 직무 추가'),
      (form) => {
        form.append(field('이름', input('name', '', { required: true, placeholder: isOrg ? '예: 레벨디자인파트' : '예: 레벨 디자이너' })));
        if (isOrg) {
          const allowed = ORG_TYPES.filter((t) => RANK[parent.type] === undefined || RANK[t] === undefined || RANK[t] < RANK[parent.type]);
          form.append(field('조직 유형', select('type', allowed.map((t) => [t, types[t]]), allowed.includes('team') ? 'team' : allowed[0])));
        }
        form.append(field('업무 설명', textarea('description', '', '맡는 일을 적어 주세요.')));
      },
      (v) => {
        const id = newId(isOrg ? 'org' : 'role');
        commitOrg((db) => {
          if (isOrg)
            db.organizations.push({ id, name: v.name, type: v.type, parentId, parentStatus: 'confirmed', description: v.description || null, specialties: [], sortOrder: nextOrder(db.organizations), active: true });
          else
            db.jobRoles.push({
              id,
              name: v.name,
              organizationId: parentType === 'workArea' ? entity('workArea', parentId).organizationId : parentId,
              workAreaId: parentType === 'workArea' ? parentId : null,
              description: v.description || null,
              specialties: [],
              sortOrder: nextOrder(db.jobRoles),
              active: true,
            });
        });
        toast((isOrg ? '하위 조직' : '직무') + '을 추가했어요.');
        openEntity(isOrg ? 'organization' : 'jobRole', id);
      },
      () => openEntity(parentType, parentId),
    );
  }
  function removeEntity(type, id) {
    const e = entity(type, id);
    const parent = type === 'organization' ? e.parentId && ['organization', e.parentId] : type === 'jobRole' ? (e.workAreaId ? ['workArea', e.workAreaId] : ['organization', e.organizationId]) : null;
    if (!window.confirm(`'${e.name}'을(를) 조직도에서 삭제할까요?`)) return;
    // Soft delete: the record and its ID stay, so links and history keep pointing at it.
    commitOrg((db) => (db[COLLECTION[type]].find((x) => x.id === id).active = false));
    toast(`'${e.name}'을(를) 삭제했어요.`);
    if (parent) openEntity(...parent);
    else renderTree();
  }
  function editBar(type, id) {
    const bar = node('div', undefined, 'org-edit-bar');
    bar.append(button('수정', () => editEntity(type, id), 'org-edit'));
    if (type === 'organization') bar.append(button('하위 조직 추가', () => addChild(type, id, 'organization'), 'org-edit'));
    if (type === 'organization' || type === 'workArea') bar.append(button('직무 추가', () => addChild(type, id, 'jobRole'), 'org-edit'));
    const blocker = type === 'position' ? '직책은 삭제할 수 없어요.' : deleteBlocker(type, id);
    const del = button('삭제', () => removeEntity(type, id), 'org-edit org-delete');
    if (blocker) {
      del.disabled = true;
      del.title = blocker;
      del.setAttribute('aria-describedby', 'orgDeleteNote');
    }
    bar.append(del);
    if (blocker) {
      const note = node('p', blocker, 'org-edit-note');
      note.id = 'orgDeleteNote';
      bar.append(note);
    }
    return bar;
  }
  function hit(e) {
    const p = worldPoint(e);
    return hitBoxes
      .slice()
      .reverse()
      .find((h) => p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h);
  }
  canvas.addEventListener(
    'click',
    (e) => {
      if (performance.now() < (camera.suppressClickUntil || 0)) {
        e.stopImmediatePropagation();
        return;
      }
      if (decorateMode || view !== 'office') return;
      const point = worldPoint(e),
        avatar = scopedNPCs()
          .slice()
          .reverse()
          .find((n) => Math.abs(n.x - point.x) < 48 && point.y < n.y + 15 && point.y > n.y - 125);
      if (avatar) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const pos = avatar.memberId && store.data.positions.find((p) => p.holderMemberId === avatar.memberId);
        openEntity(pos ? 'position' : avatar.entityType, pos?.id || avatar.entityId);
        return;
      }
      const h = hit(e);
      if (h) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openEntity(h.type, h.id);
      }
    },
    true,
  );
  $('#companyToggle').onclick = () =>
    openEntity(
      'organization',
      currentFloor === 'floor-1' ? 'org-dev' : currentFloor === 'floor-2' ? 'org-publishing' : 'org-support',
    );
  $('#closeCompany').onclick = () => $('#companyPanel').close();
  document
    .querySelectorAll('[data-travel-floor]')
    .forEach((b) => (b.onclick = () => switchFloor(b.dataset.travelFloor)));
  document.addEventListener('keydown', (e) => {
    if (
      $('#companyPanel').open &&
      e.code === 'Space' &&
      !e.repeat &&
      !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
    ) {
      e.preventDefault();
      if (document.activeElement?.tagName === 'BUTTON') document.activeElement.click();
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(persistPosition, 600);
    }
  });
  window.addEventListener('beforeunload', persistPosition);
  window.addEventListener('office-move-end', persistPosition);
  window.addEventListener('pagehide', persistPosition);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) persistPosition();
  });
  // Clear example progress only when the user explicitly starts a new career; keep the company schema.
  const submit = $('#setupForm').onsubmit;
  $('#setupForm').onsubmit = (e) => {
    submit(e);
    switchFloor('floor-1', { restore: false });
  };
  visit = (id) => {
    if (currentFloor !== 'floor-1') switchFloor('floor-1');
    goOffice();
    const f = originalFacilities.find((f) => f.id === id);
    if (f) selectTarget(f);
  };
  selectNPC = (name) => {
    const c = store.data.characters.find((c) => c.legacyName === name || c.name === name);
    if (!c) return;
    const f = byId('spaces', c.spaceId)?.floorId;
    if (f && currentFloor !== f) switchFloor(f);
    goOffice();
    const n = scopedNPCs().find((n) => n.id === c.id);
    if (n) selectTarget(n);
  };
  const baseDecoration = placeDecoration;
  placeDecoration = () => {
    if (currentFloor === 'floor-1') {
      baseDecoration();
      return;
    }
    const original = state.decorations;
    state.decorations = store.data.session.decorationsByFloor[currentFloor] || [];
    baseDecoration();
    store.data.session.decorationsByFloor[currentFloor] = state.decorations;
    state.decorations = original;
    save();
    store.save();
  };
  window.CompanyUI = {
    get floorId() {
      return currentFloor;
    },
    get floorNumber() {
      return floor().number;
    },
    activeNPCs: scopedNPCs,
    activeFacilities,
    drawSeatFront: (n) => {
      const g = ctx,
        x = n.x,
        y = n.y;
      g.fillStyle = '#35494b';
      g.beginPath();
      g.roundRect(x - 29, y - 37, 58, 34, 9);
      g.fill();
      g.fillStyle = '#76938b';
      g.beginPath();
      g.roundRect(x - 24, y - 33, 48, 25, 6);
      g.fill();
      g.strokeStyle = '#b5c9bb99';
      g.lineWidth = 1;
      for (let mesh = 0; mesh < 3; mesh++) {
        g.beginPath();
        g.moveTo(x - 18, y - 27 + mesh * 7);
        g.lineTo(x + 18, y - 27 + mesh * 7);
        g.stroke();
      }
      g.fillStyle = '#51686a';
      g.fillRect(x - 3, y - 4, 6, 13);
      g.fillRect(x - 28, y + 7, 56, 4);
    },
    decorations: () =>
      currentFloor === 'floor-1'
        ? state?.decorations || []
        : store.data.session.decorationsByFloor[currentFloor] || [],
    updateHUD: announce,
    buildMap: buildFloor,
    openEntity,
    elevator,
    switchFloor,
    getSnapshot: () => JSON.parse(JSON.stringify(store.data)),
    transact: (fn) => {
      const result = store.update(fn);
      buildFloor();
      renderTree();
      announce();
      return result;
    },
  };
  buildMap = buildFloor;
  officeImage.onload = buildFloor;
  const saved = store.data.session.positionsByFloor[currentFloor];
  if (saved) {
    player.x = saved.x;
    player.y = saved.y;
  } else if (currentFloor !== 'floor-1') {
    player.x = floor().spawn.x;
    player.y = floor().spawn.y;
  }
  announce();
  if (officeImage.complete && officeImage.naturalWidth) buildFloor();
  if (!walkable(Math.floor(player.x / T), Math.floor(player.y / T))) {
    player.x = floor().spawn.x;
    player.y = floor().spawn.y;
  }
  if (store.warning) toast(store.warning);
})();
