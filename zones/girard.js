/* Girard · Merchant quarter: warehouse and crane, colonnaded trade hall, a neon marketing agency (the old counting house gone cyberpunk), four market stalls, the deal court with its map table, and a caravan. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.girard = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: 76, y: 76 }, REST = { x: -112, y: 130 };   // at the map table on the deal court; bench when off
  const MAP = { x: 92, y: 62, w: 56 };                           // map table (bottom-left, width)
  const SCALE = { x: 170, y: 52 };                               // brass balance on its pedestal
  // Neon agency (the converted counting house): facade, holo billboard frame, desk screens.
  const AG = { x: 96, y: -38, w: 88, h: 52 }, BB = { x: 108, y: -138, w: 64, h: 34 };
  const N = { floor: '#1b1926', floor2: '#252336', wall: '#2c2838', steel: '#3a3850', steelHi: '#55526e', glass: '#0c1220', ink: '#121118',
    pink: '#ff4fa8', cyan: '#3ff0ff', violet: '#a86cff', amber: '#ffb938', red: '#ff3a3a' };
  const SCREENS = [{ x: 102, y: -15, w: 14, h: 9 }, { x: 122, y: -15, w: 11, h: 9, crt: true }, { x: 140, y: -18, w: 18, h: 11, big: true }, { x: 162, y: -15, w: 12, h: 9 }];
  const CRANE = { x: -100, y: -28, jib: -128 };
  const BURG = '#8c2f3a', SAFFRON = '#e07a2a';
  const STALLS = [
    { x: -182, y: 16, w: 40, col: C.red2, kind: 'fruit' }, { x: -132, y: 16, w: 40, col: C.gold1, kind: 'spice' },
    { x: -182, y: 76, w: 40, col: C.teal2, kind: 'cloth' }, { x: -132, y: 76, w: 40, col: C.plum2, kind: 'pots' }
  ];
  const HALL_WIN = [[-60, -72], [-40, -72], [26, -72], [46, -72]];
  const soot = (k, x, y, t, n, col) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1, r = 2 + q * 6, px = x + Math.sin(q * 4 + i * 2) * 4 + q * 8, py = y - q * 32; k.alpha((1 - q) * .9, () => { k.circle(px, py, r, col); k.circle(px - 1, py - 1, Math.max(1, r - 2), S(col, .15)); }); } };
  const coin = (k, x, y) => { k.rect(x, y, 3, 2, C.gold1); k.px(x, y, C.gold3); };
  const goods = {
    fruit: (k, x, y) => { for (let i = 0; i < 4; i++) { const bx = x + 5 + i * 9, c = [C.red2, SAFFRON, C.leaf3, C.plum2][i]; k.ellipse(bx, y - 1, 4, 2, C.wood3); k.rect(bx - 4, y - 1, 9, 1, C.wood1); for (const [dx, dy] of [[-3, -3], [0, -3], [3, -3], [-2, -6], [1, -6], [-1, -8]]) { k.circle(bx + dx, y + dy, 1, S(c, -.25)); k.px(bx + dx, y + dy, c); k.px(bx + dx - 1, y + dy - 1, S(c, .45)); } } },
    spice: (k, x, y) => { for (let i = 0; i < 5; i++) { const bx = x + 5 + i * 7, c = [C.red2, C.gold2, SAFFRON, C.leaf3, C.plum3][i]; k.ellipse(bx, y - 1, 3, 2, C.plaster1); k.ellipse(bx, y - 3, 3, 2, c); k.px(bx - 1, y - 4, S(c, .4)); k.rect(bx - 3, y, 7, 1, C.plaster0); } },
    cloth: (k, x, y) => { for (let i = 0; i < 4; i++) { const c = [C.red1, C.teal3, C.gold2, C.plum3][i], bx = x + 3 + i * 9; k.rect(bx, y - 5, 8, 5, c); k.rect(bx, y - 5, 8, 1, S(c, .3)); k.rect(bx + 7, y - 5, 1, 5, S(c, -.3)); k.px(bx + 3, y - 3, S(c, .5)); } for (let i = 0; i < 3; i++) { const c = [C.gold2, C.red2, C.teal2][i]; k.rect(x + 8 + i * 11, y - 24, 4, 14, c); k.rect(x + 8 + i * 11, y - 24, 1, 14, S(c, .3)); k.px(x + 9 + i * 11, y - 18, C.paper); } },
    pots: (k, x, y) => { for (let i = 0; i < 5; i++) { const bx = x + 5 + i * 7, c = i % 2 ? C.terra3 : C.teal3, h = 4 + (i % 3); k.ellipse(bx, y - h / 2 - 1, 3, h / 2 + 1, c); k.rect(bx - 1, y - h - 3, 3, 2, S(c, -.2)); k.px(bx - 2, y - h, S(c, .4)); k.rect(bx - 2, y - 2, 5, 1, S(c, -.35)); } }
  };
  const stall = (k, s) => {
    const { x, y, w, col } = s;
    k.rect(x + 2, y, w + 4, 3, C.shadow);
    k.rect(x + 1, y - 28, w - 2, 18, S(col, -.45)); k.dither(x + 1, y - 28, w - 2, 18, S(col, -.3), 1);
    for (const px of [x, x + w - 2]) { k.rect(px, y - 30, 2, 30, C.wood1); k.px(px, y - 30, C.wood4); }
    const hang = { fruit: i => { const hx = x + 6 + i * 10; k.rect(hx, y - 31, 1, 4, C.wood1); if (i % 2) { for (let j = 0; j < 3; j++) { k.rect(hx - 2 + j * 2, y - 27, 2, 5, C.gold2); k.px(hx - 2 + j * 2, y - 23, C.gold0); } } else { k.circle(hx, y - 25, 2, C.paper2); k.px(hx - 1, y - 26, C.white); k.circle(hx, y - 21, 1, C.paper2); } },
      spice: i => { const hx = x + 6 + i * 10; k.rect(hx, y - 31, 1, 12, C.wood1); for (let j = 0; j < 4; j++) { k.rect(hx - 1 - (j % 2), y - 28 + j * 3, 2, 2, i % 2 ? C.leaf2 : C.red2); k.px(hx + (j % 2), y - 27 + j * 3, i % 2 ? C.leaf4 : C.red3); } },
      pots: i => { if (i) return; k.rect(x + 3, y - 20, w - 6, 2, C.wood3); for (let j = 0; j < 5; j++) { const c = j % 2 ? C.teal3 : C.terra3, jx = x + 6 + j * 7; k.rect(jx, y - 25, 4, 5, c); k.rect(jx + 1, y - 26, 2, 1, S(c, -.3)); k.px(jx, y - 24, S(c, .4)); } },
      cloth: () => {} };
    for (let i = 0; i < 4; i++) hang[s.kind](i);
    if (s.kind === 'cloth') goods.cloth(k, x, y - 11);
    k.rect(x - 1, y - 11, w + 2, 11, C.wood2); k.rect(x - 1, y - 11, w + 2, 2, C.wood4); for (let i = 4; i < w; i += 6) k.rect(x + i, y - 9, 1, 9, C.wood1);
    k.rect(x + 2, y - 9, w - 4, 4, col); for (let i = 0; i < w - 4; i += 4) k.px(x + 3 + i, y - 5, S(col, -.3)); k.rect(x + 2, y - 9, w - 4, 1, S(col, .3));
    if (s.kind !== 'cloth') goods[s.kind](k, x, y - 11);
    k.rect(x - 4, y - 40, w + 8, 2, S(col, -.4));
    Props.awning(k, x - 3, y - 38, w + 6, col, C.paper, 7);
    for (let i = 0; i < w + 6; i += 8) { k.rect(x - 2 + i, y - 31, 1, 3, C.gold2); k.px(x - 2 + i, y - 28, C.gold3); }
  };
  const cover = (k, s) => { k.rect(s.x - 1, s.y - 18, s.w + 2, 8, '#8a7a5a'); k.rect(s.x - 1, s.y - 18, s.w + 2, 1, '#a8987a'); for (let i = 6; i < s.w; i += 12) k.rect(s.x + i, s.y - 18, 1, 8, C.wood1); };

  /* ---------- Neon agency: cached neon signs, marketers and drone; per-frame screens and hologram ---------- */
  // Neon sign plate with a soft halo. lit: 1 on, 0 dead tube. vertical stacks the letters.
  const neon = (text, col, lit, vertical = false, sc = 2) => {
    const cw = 3 * sc, ch = 5 * sc, gap = sc, n = text.length;
    const w = vertical ? cw + 6 : n * (cw + gap) - gap + 6, h = vertical ? n * (ch + gap) - gap + 6 : ch + 6;
    return P.sprite(`neon|${text}|${col}|${lit}|${vertical}|${sc}`, w + 4, h + 4, 2, 2, q => {
      if (lit) q.alpha(.22, () => q.rect(-2, -2, w + 4, h + 4, col));
      q.rect(0, 0, w, h, '#14121c'); q.rect(0, 0, w, 1, '#2e2c3e'); q.rect(0, h - 1, w, 1, '#0a0910');
      const tube = lit ? col : '#3a3848';
      for (let i = 0; i < n; i++) {
        const x = vertical ? 3 : 3 + i * (cw + gap), y = vertical ? 3 + i * (ch + gap) : 3;
        if (lit) q.alpha(.45, () => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) q.text(text[i], x + dx, y + dy, col, sc); });
        q.text(text[i], x, y, tube, sc);
        if (lit) q.text(text[i], x, y, S(col, .55), 1);
      }
    }, null);
  };
  const NS = [{ text: 'ADS', col: N.pink, x: 128, y: -79 }, { text: 'SEO', col: N.cyan, x: 83, y: -92, v: true }, { text: 'CTR', col: N.violet, x: 159, y: -64, sc: 1 }];
  // Marketers. view 'back' (at the desk, facing the screens) or 'side' (on a hard case with a laptop, facing right).
  function drawNerd(q, o, pose, f) {
    const H = o.hood, Hd = S(H, -.3), Hl = S(H, .25), sk = o.skin, pn = o.pants, sleep = pose === 'sleep';
    if (o.view === 'side') {
      q.rect(-5, -7, 10, 7, '#2e2c3c'); q.rect(-5, -7, 10, 1, '#4a4860'); q.rect(-4, -4, 8, 1, N.pink); q.px(3, -6, '#8a88a0');
      q.rect(-1, -10, 6, 2, pn); q.rect(4, -9, 2, 8, pn); q.rect(4, -1, 4, 1, '#f0f0f6'); q.px(5, -1, N.pink);
      q.rect(-4, -18, 2, 5, Hd); q.rect(-3, -17, 6, 8, H); q.rect(-3, -17, 1, 8, Hl); q.rect(2, -17, 1, 8, Hd); q.rect(0, -16, 1, 3, S(H, .4));
      const hx = sleep ? 1 : 0, hy = sleep ? 2 : 0;
      q.rect(-2 + hx, -24 + hy, 6, 7, sk); q.rect(3 + hx, -23 + hy, 1, 5, S(sk, -.15)); q.rect(-3 + hx, -25 + hy, 6, 2, o.hair); q.rect(-3 + hx, -23 + hy, 2, 3, o.hair); q.px(-1 + hx, -21 + hy, S(sk, -.2));
      const vc = sleep ? '#2a2838' : pose === 'err' ? N.red : N.cyan;
      q.rect(-3 + hx, -22 + hy, 3, 1, N.ink); q.rect(0 + hx, -22 + hy, 5, 2, vc); q.rect(0 + hx, -22 + hy, 5, 1, S(vc, .45)); q.px(3 + hx, -19 + hy, S(sk, -.35));
      q.rect(2, -12, 7, 1, '#9a9ab0'); q.rect(8, -18, 2, 6, '#b8b8c8'); q.px(9, -16, sleep ? '#6a6878' : N.pink);
      if (pose === 'sip') { q.rect(1, -16, 2, 3, H); q.rect(2, -18, 2, 3, H); q.rect(4, -21, 2, 3, N.pink); q.px(4, -21, C.white); }
      else if (pose === 'err') { q.line(1, -16, 3, -24, H, 2); q.rect(3, -26, 2, 2, sk); }
      else { q.rect(1, -15, 2, 3, H); q.rect(2, -13, 3, 2, H); q.rect(5 + (pose === 'type' ? f : 0), -13, 2, 1, sk); }
      return;
    }
    const seated = o.seat === 'stool', tt = seated ? -16 : -18, tb = -9;
    if (seated) { q.rect(-4, -6, 9, 2, N.steel); q.rect(-4, -6, 9, 1, N.steelHi); q.rect(0, -4, 1, 3, '#2a2838'); q.rect(-3, -1, 7, 1, '#2a2838'); q.rect(-3, -8, 7, 2, pn); }
    else { q.rect(-3, -8, 2, 7, S(pn, -.2)); q.rect(1, -8, 2, 7, pn); q.rect(-3, -1, 3, 1, '#f0f0f6'); q.rect(1, -1, 3, 1, '#f0f0f6'); q.px(3, -1, N.cyan); }
    const hy = tt - 7 + (sleep ? 3 : 0);
    // Arms behind the torso first (elbows), then the hoodie back with its hood, then the head.
    if (pose === 'type') { q.rect(-6, tt + 2 + f, 2, 3, Hd); q.rect(5, tt + 3 - f, 2, 3, Hd); }
    else if (pose === 'wait') { q.rect(-6, tt + 2, 2, 5, Hd); q.rect(5, tt + 2, 2, 5, Hd); q.px(-5, tt + 6, sk); q.px(5, tt + 6, sk); }
    else if (pose === 'sleep') { q.rect(-6, tt + 2, 2, 2, Hd); q.rect(5, tt + 2, 2, 2, Hd); }
    else if (pose === 'sip') { q.rect(-6, tt + 2, 2, 5, Hd); q.px(-5, tt + 7, sk); }
    else if (pose === 'point') q.rect(-6, tt + 2, 2, 3, Hd);
    q.rect(-4, tt, 9, tb - tt + 1, H); q.rect(-4, tt, 1, tb - tt + 1, Hl); q.rect(4, tt, 1, tb - tt + 1, Hd); q.rect(-4, tb, 9, 1, Hd);
    q.rect(-3, tt, 7, 3, Hd); q.rect(-2, tt + 1, 5, 1, S(H, -.15)); q.rect(0, tt + 4, 1, tb - tt - 4, Hd); q.px(-2, tt + 5, o.print); q.px(2, tt + 5, o.print); q.px(0, tt + 6, o.print);
    q.rect(-3, hy, 7, 7, o.hair); q.rect(-2, hy - 1, 5, 1, o.hair); q.px(-2, hy, S(o.hair, .3)); q.px(-1, hy - 1, S(o.hair, .3));
    if (o.gear === 'headset') { q.rect(-3, hy - 1, 7, 1, N.ink); q.px(-4, hy, N.ink); q.px(4, hy, N.ink); q.rect(-5, hy + 2, 2, 3, N.ink); q.rect(4, hy + 2, 2, 3, N.ink); q.px(-5, hy + 3, sleep ? '#3a3848' : o.gearCol); q.px(5, hy + 3, sleep ? '#3a3848' : o.gearCol); }
    else { q.px(-4, hy + 3, sk); q.px(4, hy + 3, sk); q.rect(-3, hy - 1, 7, 3, o.gearCol); q.rect(-3, hy - 1, 7, 1, S(o.gearCol, .3)); q.rect(-2, hy + 2, 5, 1, S(o.gearCol, -.3)); q.px(0, hy + 1, o.hair); }
    if (pose === 'point') { q.line(4, tt + 1, 7, tt - 4 - f, H, 2); q.rect(7, tt - 7 - f, 2, 2, sk); q.px(9, tt - 8 - f, sk); }
    else if (pose === 'sip') { q.rect(5, tt + 1, 2, 3, H); q.rect(5, tt - 3, 2, 4, H); q.rect(4, hy + 4, 3, 3, C.white); q.px(3, hy + 5, '#d8d4e0'); q.px(5, hy + 4, '#6a3a2a'); }
    else if (pose === 'err') { q.line(-4, tt + 1, -6, hy + 2, H, 2); q.line(4, tt + 1, 6, hy + 2, H, 2); q.rect(-6, hy, 2, 2, sk); q.rect(5, hy, 2, 2, sk); }
  }
  const MK = [
    { x: 112, y: 18, view: 'back', seat: 'stool', hood: '#c2327a', pants: '#2a2c44', skin: C.skin2, hair: '#2a1c16', gear: 'headset', gearCol: N.cyan, print: N.cyan, work: 'type' },
    { x: 150, y: 18, view: 'back', seat: 'stand', hood: '#1f7a8a', pants: '#2a2838', skin: C.skin1, hair: '#1e1a18', gear: 'cap', gearCol: N.pink, print: N.pink, work: 'point' },
    { x: 88, y: 16, view: 'side', hood: '#5a3a8a', pants: '#2e3a5c', skin: C.skin3, hair: '#e05aa0', work: 'type' }
  ];
  const nerdSprite = (i, pose, f) => P.sprite(`nerd|${i}|${pose}|${f}`, 22, 32, 10, 30, q => drawNerd(q, MK[i], pose, f));
  const droneSprite = (f, led) => P.sprite(`drone|${f}|${led}`, 17, 8, 8, 5, q => {
    q.rect(-6, -3, 13, 1, '#4a4860'); q.rect(-3, -3, 7, 3, '#2a2838'); q.rect(-2, -3, 5, 1, '#6e6a8a'); q.px(0, -1, led); q.px(1, 0, '#8a88a0');
    for (const x of [-6, 6]) { q.rect(x, -4, 1, 1, '#4a4860'); if (f) q.rect(x - 3, -5, 7, 1, '#b8b8c8'); else q.rect(x - 1, -5, 3, 1, '#b8b8c8'); }
  });
  function screen(k, s, i, t, state) {
    const { x, y, w, h } = s;
    if (state === 'off') return;
    if (state === 'error') {
      const fr = Math.floor(t * 12);
      k.rect(x, y, w, h, '#2a0608');
      for (let j = 0; j < 5; j++) { const r = P.hash(j + i * 7, fr), yy = y + Math.floor(P.hash(fr, j + i) * h), ww = 2 + Math.floor(r * (w - 2)); k.rect(x + Math.floor(P.hash(j, fr + i) * (w - ww)), yy, ww, 1, r > .5 ? N.red : '#ff9a9a'); }
      if (fr % 3 === 0) k.rect(x, y + (fr % h), w, 1, C.white);
      return;
    }
    if (state === 'waiting') {
      k.rect(x, y, w, h, '#1e1404');
      if (Math.floor(t * 2 + i) % 2) { if (s.big) k.text('HOLD', x + 1, y + 3, N.amber); else k.text('?', x + (w >> 1) - 1, y + 2, N.amber); }
      k.rect(x, y + h - 1, w, 1, S(N.amber, -.5));
      return;
    }
    if (state === 'idle') {
      // Screensaver: a slow bouncing logo dot per screen.
      k.rect(x, y, w, h, '#060914');
      const tri = v => { const m = v % 2; return m < 1 ? m : 2 - m; };
      const bx = x + Math.round(tri(t * .35 + i * .3) * (w - 3)), by = y + Math.round(tri(t * .5 + i * .7) * (h - 2));
      k.rect(bx, by, 3, 2, [N.pink, N.cyan, N.violet, N.cyan][i]); k.px(bx, by, C.white);
      return;
    }
    // Working: live dashboards.
    k.rect(x, y, w, h, '#071a24'); k.rect(x, y, w, 1, '#0e2e3c');
    if (s.crt) { for (let j = 0; j < 4; j++) { const ww = 3 + Math.floor(P.hash(j, Math.floor(t * 3) + j) * (w - 4)); k.rect(x + 1, y + 1 + j * 2, ww, 1, '#5aff8a'); } if (Math.floor(t * 4) % 2) k.rect(x + 1, y + 8, 2, 1, '#5aff8a'); return; }
    if (s.big) {
      for (let j = 0; j < 5; j++) { const bh = Math.max(1, Math.round(2 + j * 1.4 + Math.sin(t * 3 + j) * 1.2)); k.rect(x + 2 + j * 3, y + h - 1 - bh, 2, bh, j % 2 ? N.cyan : N.pink); }
      const q = (t * .5) % 1; k.line(x + 1, y + h - 3, x + 1 + Math.round(q * (w - 4)), y + h - 3 - Math.round(q * (h - 4)), N.amber); k.px(x + 1 + Math.round(q * (w - 4)), y + h - 3 - Math.round(q * (h - 4)), C.white);
      return;
    }
    const pts = []; for (let j = 0; j < 5; j++) pts.push([x + 1 + Math.round(j * (w - 3) / 4), y + h - 2 - Math.round((Math.sin(t * 2 + j * 1.3 + i) + 1) * (h - 4) / 2)]);
    k.path(pts, i === 0 ? N.cyan : N.violet); k.rect(x + 1, y + h - 1, w - 2, 1, '#123a48');
  }
  function agency(k, t, state, z) {
    const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting';
    // Neon signs: steady while working, flicker when idle/waiting, SEO tube dead and sparking on error, dark when off.
    NS.forEach((n, i) => {
      let lit = live ? 1 : 0;
      if (!run && live) { const fr = Math.floor(t * 12 + i * 17 + 7); if (fr % (29 + i * 6) < 2) lit = 0; }
      if (err) lit = i === 1 ? 0 : Math.floor(t * 7 + i) % 3 ? 1 : 0;
      k.blit(neon(n.text, n.col, lit, !!n.v, n.sc || 2), n.x, n.y);
    });
    if (err) { const fr = Math.floor(t * 10); if (fr % 3) for (let j = 0; j < 4; j++) { const a = P.hash(j, fr) * 6.28, d = 2 + P.hash(fr, j) * 6; k.px(92 + Math.cos(a) * d, -58 + Math.sin(a) * d + d * .5, j % 2 ? C.gold4 : C.white); } soot(k, 90, -60, t * 1.2, 3, '#3a363e'); }
    // Roofline tube and storefront glow.
    if (live) {
      const tube = err ? (Math.floor(t * 5) % 2 ? N.pink : '#5a2440') : N.pink;
      k.rect(94, -95, 92, 1, tube); k.alpha(.25, () => k.rect(94, -96, 92, 3, tube));
      for (const [wx, c] of [[100, N.cyan], [154, N.violet]]) k.alpha(err ? (Math.floor(t * 6) % 2 ? .35 : .1) : .22, () => { k.rect(wx, -58, 26, 14, err ? N.red : c); k.rect(wx + 3, -63, 8, 5, c); k.rect(wx + 16, -62, 7, 4, N.pink); });
      k.rect(132, -60, 1, 22, N.cyan); k.rect(147, -60, 1, 22, N.cyan); k.rect(98, 1, 78, 1, err ? N.red : wait ? N.amber : N.cyan); k.rect(90, 19, 98, 1, S(N.cyan, -.3));
    }
    // Status LED next to the door.
    const lc = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? C.waiting : run ? C.working : C.idle;
    k.rect(150, -58, 5, 5, N.ink); k.rect(151, -57, 3, 3, lc);
    // Rack LEDs and antenna beacon.
    if (live) for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) { const on = run ? (Math.floor(t * 8 + i * 3 + j * 5) % 3 !== 0) : !err || (i + Math.floor(t * 6)) % 2; k.px(184 + j * 2, -23 + i * 4, err ? N.red : wait ? N.amber : on ? (j ? N.cyan : '#5aff8a') : '#1a2a20'); }
    if (live && Math.floor(t * 2) % 2) k.px(180, -123, N.pink);
    // Holographic billboard: projector beam, translucent panel, growing bars and a growth arrow.
    if (live) {
      const B = BB, flick = err ? (Math.floor(t * 9) % 3 === 0 ? .1 : .3) : .28;
      k.alpha(.12, () => k.poly([[137, -101], [143, -101], [B.x + B.w - 2, B.y + B.h], [B.x + 2, B.y + B.h]], N.cyan));
      k.alpha(flick, () => k.rect(B.x, B.y, B.w, B.h, err ? N.red : wait ? N.amber : N.cyan));
      k.alpha(.5, () => { for (let y = B.y + 1; y < B.y + B.h; y += 3) k.rect(B.x, y, B.w, 1, '#0b0f1a'); });
      if (err) {
        const fr = Math.floor(t * 12);
        for (let j = 0; j < 6; j++) { const yy = B.y + Math.floor(P.hash(j, fr) * B.h), off = Math.round((P.hash(fr, j) - .5) * 10); k.rect(B.x + Math.max(0, off), yy, B.w - Math.abs(off), 2, j % 2 ? N.red : N.pink); }
        k.textBold('ERR', B.x + B.w / 2 + (fr % 3) - 1, B.y + 12, N.red, '#2a0608', 2);
      } else if (wait) {
        if (Math.floor(t * 2) % 2) k.textBold('HOLD', B.x + B.w / 2, B.y + 7, N.amber, '#2a1804', 2);
        k.textCenter('APPROVE?', B.x + B.w / 2, B.y + 24, S(N.amber, .3));
      } else {
        const g = run ? 1 : .55, ph = run ? t : 0;
        for (let j = 0; j < 6; j++) { const bh = Math.round((5 + j * 3.4 + Math.sin(ph * 2.4 + j * .9) * 2.5) * g); k.rect(B.x + 6 + j * 9, B.y + B.h - 3 - bh, 6, bh, [N.pink, N.cyan, N.violet][j % 3]); k.rect(B.x + 6 + j * 9, B.y + B.h - 3 - bh, 6, 1, C.white); }
        k.rect(B.x + 4, B.y + B.h - 3, B.w - 8, 1, S(N.cyan, .5));
        const q = run ? (t * .35) % 1 : 1, ex = B.x + 6 + Math.round(q * 50), ey = B.y + B.h - 8 - Math.round(q * 20);
        k.line(B.x + 6, B.y + B.h - 8, ex, ey, N.amber, 2); k.rect(ex - 1, ey - 2, 3, 3, N.amber); k.px(ex, ey - 3, N.amber); k.px(ex + 2, ey - 1, N.amber);
        k.text(run ? '+240' : 'ROI', B.x + 3, B.y + 3, C.white);
      }
    }
    // Desk screens.
    SCREENS.forEach((s, i) => screen(k, s, i, t, state));
    if (run) k.alpha(.18, () => k.rect(100, -3, 74, 3, N.cyan));
    // Marketers.
    MK.forEach((m, i) => {
      if (!live && i === 1) return;                                   // the pointer has gone home
      const f = Math.floor(t * (m.work === 'type' ? 8 : 3) + i * 3) % 2;
      const pose = !live ? 'sleep' : run ? m.work : state === 'idle' ? 'sip' : wait ? 'wait' : 'err';
      const sh = err ? [0, 1, 0, -1][Math.floor(t * 12 + i * 3) % 4] : 0;
      const idleSip = pose === 'sip' && Math.floor(t * .5 + i) % 3 === 0 ? 'wait' : pose;   // sip, then lower the mug
      k.ellipse(m.x + 1, m.y, 6, 2, C.shadow);
      k.blit(nerdSprite(i, m.view === 'side' && idleSip === 'wait' && state === 'idle' ? 'type' : idleSip, pose === 'type' || pose === 'point' ? f : 0), m.x + sh, m.y);
      const my = m.y - (m.view === 'side' ? 30 : m.seat === 'stool' ? 26 : 28);
      if (wait) { k.rect(m.x - 3, my - 2, 7, 9, N.ink); k.rect(m.x - 2, my - 1, 5, 7, C.waiting); k.text('?', m.x - 1, my, N.ink); }
      if (err && Math.floor(t * 3 + i) % 2) { k.rect(m.x - 1, my - 1, 3, 6, N.ink); k.rect(m.x, my, 1, 3, C.error); k.px(m.x, my + 4, C.error); }
      if (!live) { const q = (t * .4 + i * .3) % 1; k.alpha(1 - q, () => k.text('z', m.x + 3 + q * 5, my + 4 - q * 10, '#c8d4ff')); }
      if (run && pose === 'type' && z.detail && f) k.px(m.x + (m.view === 'side' ? 7 : 0), m.y - (m.view === 'side' ? 13 : 20), N.cyan);
    });
    // Drone: courier loop while working, hovering when idle/waiting, crashed on error, parked when off.
    const fr = Math.floor(t * 20) % 2;
    if (run) { const a = t * .6, dx = 140 + Math.round(Math.sin(a) * 38), dy = -50 + Math.round(Math.sin(a * 2) * 8); k.alpha(.35, () => k.ellipse(dx + 2, 14, 4, 1, C.shadow)); k.blit(droneSprite(fr, '#5aff8a'), dx, dy); k.rect(dx - 1, dy + 1, 3, 3, N.pink); k.px(dx, dy + 1, C.white); }
    else if (state === 'idle' || wait) { const dy = -106 + Math.round(Math.sin(t * 2) * 1.5); k.blit(droneSprite(fr, wait ? (Math.floor(t * 3) % 2 ? N.amber : '#4a3810') : N.cyan), 94, dy); }
    else if (err) { k.blit(droneSprite(0, N.red), 126, 16); k.line(119, 17, 122, 15, '#b8b8c8'); if (Math.floor(t * 8) % 2) { k.px(131, 12, C.gold4); k.px(133, 10, C.white); } soot(k, 128, 12, t, 3, '#4a4652'); }
    else k.blit(droneSprite(0, '#2a2838'), 172, -96);
  }

  return {
    paint(k) {
      // Ground: a tiled frontage, a warm sandstone market court and the entrance lane.
      k.rect(-188, -40, 376, 20, C.terra1); Props.tiles(k, -187, -39, 374, 18, C.plaster2, C.terra3, 4);
      k.poly([[-188, -22], [188, -22], [188, 98], [26, 106], [-26, 106], [-188, 98]], C.dirt2);
      k.polyTex([[-187, -21], [187, -21], [187, 96], [25, 104], [-25, 104], [-187, 96]], (x, y) => {
        const r = Math.floor((y + 300) / 7), o = (r % 2) * 6, cx = (x + 300 + o) % 12, cy = (y + 300) % 7;
        if (cy === 0 || cx === 0) return C.dirt2; if (cy === 1 && cx === 1) return C.dirt5;
        const h = P.hash(Math.floor((x + 300 + o) / 12), r); return h < .2 ? C.dirt3 : h > .88 ? S(C.dirt4, .15) : C.dirt4;
      });
      k.rect(-22, 104, 44, 36, C.dirt2); Props.cobbles(k, -20, 104, 40, 36, 7, C.dirt4);
      // Merchant's star inlaid in the court.
      const sx = -16, sy = 40;
      k.ellipse(sx, sy, 26, 11, C.dirt2); k.ellipse(sx, sy, 24, 10, C.plaster3);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 12 : 21; k.poly([[sx, sy], [sx + Math.cos(a - .3) * 6, sy + Math.sin(a - .3) * 3], [sx + Math.cos(a) * r, sy + Math.sin(a) * r * .42], [sx + Math.cos(a + .3) * 6, sy + Math.sin(a + .3) * 3]], i % 2 ? C.teal2 : C.terra2); }
      k.circle(sx, sy, 3, C.gold2); k.px(sx - 1, sy - 1, C.gold4);
      // Trees behind the rooftops.
      Props.tree(k, -150, -102, 'orange', 2, 0); Props.tree(k, 80, -104, 'oak', 1, 1); Props.tree(k, 178, -104, 'fruit', 1, 2); Props.tree(k, -92, -112, 'dark', 1, 3);
      for (let i = 0; i < 10; i++) Props.flower(k, -180 + P.hash(i, 2) * 360, -146 + P.hash(i, 5) * 10, ['#f2c14e', '#e46c52', '#f6ecd0'][i % 3]);

      // Warehouse: timber store with an open barn door, then cargo and a derrick crane.
      Props.building(k, -186, -40, { w: 72, h: 40, roofH: 22, roof: C.wood2, wall: C.plaster1, mat: 'timber', door: { x: 26, w: 20, h: 26, color: C.wood3, open: true }, windows: [{ x: 6, y: 8, w: 8, h: 7 }, { x: 58, y: 8, w: 8, h: 7 }] });
      k.rect(-158, -60, 18, 4, '#3a2c20'); Props.sack(k, -156, -64, C.plaster1); Props.crate(k, -148, -63, 7);
      k.rect(-172, -94, 32, 9, C.ink); k.rect(-171, -93, 30, 7, C.wood3); k.text('CARGO', -170, -92, C.paper);
      Props.crate(k, -112, -38); Props.crate(k, -112, -47, 8); Props.barrel(k, -92, -36); Props.sack(k, -80, -30, C.plaster1); Props.sack(k, -188, -28, '#b8a276');
      k.rect(CRANE.x - 1, CRANE.y - 70, 4, 70, C.wood2); k.rect(CRANE.x - 1, CRANE.y - 70, 1, 70, C.wood4); k.rect(CRANE.x - 5, CRANE.y - 2, 12, 3, C.wood1);
      k.rect(CRANE.jib - 2, CRANE.y - 70, CRANE.x - CRANE.jib + 6, 3, C.wood2); k.rect(CRANE.jib - 2, CRANE.y - 70, CRANE.x - CRANE.jib + 6, 1, C.wood4);
      k.line(CRANE.x, CRANE.y - 52, CRANE.x - 16, CRANE.y - 68, C.wood1, 2);
      k.circle(CRANE.x + 1, CRANE.y - 20, 4, C.wood1); k.circle(CRANE.x + 1, CRANE.y - 20, 2, C.wood3); k.rect(CRANE.jib - 1, CRANE.y - 67, 3, 2, C.stone1);

      // Trade hall: colonnaded exchange with a pediment, coin crest and clock cupola.
      Props.building(k, -74, -38, { w: 148, h: 46, roofH: 30, roof: C.terra2, wall: C.plaster3, mat: 'stone', windows: HALL_WIN.map(([x]) => ({ x: x + 74, y: 12, w: 8, h: 14, arch: true, shutters: C.teal2 })), door: { x: 62, w: 24, h: 26, color: C.teal1, arch: true } });
      k.rect(-1, -64, 1, 26, C.teal0);
      k.rect(-10, -134, 20, 20, C.plaster2); k.rect(-10, -134, 3, 20, C.plaster3); k.rect(7, -134, 3, 20, C.plaster0);
      k.ellipse(0, -136, 12, 6, C.teal1); k.ellipse(0, -137, 11, 5, C.teal2); k.ellipse(-3, -139, 4, 2, C.teal4); k.rect(-1, -147, 2, 6, C.gold1); k.px(-1, -148, C.gold3);
      k.circle(0, -124, 6, C.gold1); k.circle(0, -124, 5, C.white); k.rect(0, -128, 1, 4, C.ink); k.rect(0, -124, 3, 1, C.ink);
      k.poly([[-56, -84], [0, -110], [56, -84]], C.stone2); k.poly([[-50, -85], [0, -107], [50, -85]], C.plaster3); k.line(-50, -85, 0, -107, C.white); k.line(0, -107, 50, -85, C.plaster0);
      k.circle(0, -94, 7, C.gold0); k.circle(0, -94, 6, C.gold2); k.circle(0, -94, 4, C.gold1); k.rect(-1, -97, 2, 6, C.gold3); k.px(-2, -96, C.gold4);
      k.rect(-78, -88, 156, 5, C.stone4); k.rect(-78, -88, 156, 1, C.white); k.rect(-78, -84, 156, 1, C.stone2);
      for (const x of [-72, -52, -32, 24, 44, 64]) { k.rect(x + 7, -82, 2, 44, C.shadowSoft); k.rect(x, -82, 7, 44, C.stone4); k.rect(x, -82, 2, 44, C.white); k.rect(x + 5, -82, 2, 44, C.stone2); k.rect(x - 1, -84, 9, 3, C.stone5); k.rect(x - 1, -40, 9, 2, C.stone3); }
      for (let i = 0; i < 3; i++) k.rect(-80 + i * 2, -38 + i * 2, 160 - i * 4, 2, [C.stone4, C.stone3, C.stone2][i]);
      k.rect(-14, -79, 28, 9, C.ink); k.rect(-13, -78, 26, 7, BURG); k.text('BOURSE', -11, -77, C.gold3);

      // Neon marketing agency: the old counting house turned cyberpunk. Dark steel floor plates first.
      k.rect(90, -40, 98, 60, N.floor); for (let x = 90; x < 188; x += 12) k.rect(x, -40, 1, 60, N.floor2); for (let y = -40; y < 20; y += 10) k.rect(90, y, 98, 1, N.floor2);
      for (let x = 92; x < 188; x += 12) for (let y = -38; y < 20; y += 10) k.px(x, y, N.steel);
      k.rect(89, -40, 1, 61, N.ink); k.rect(90, 20, 98, 1, N.ink); k.rect(90, 19, 98, 1, '#1f5a66');
      Props.building(k, AG.x, AG.y, { w: AG.w, h: AG.h, style: 'flat', wall: N.wall, mat: 'brick', foundation: 3 });
      // Upper window band and two big storefronts (their glow animates), a steel ledge and a sliding glass door.
      k.rect(100, -86, 80, 8, N.steel); k.rect(101, -85, 78, 6, N.glass); for (let x = 110; x < 180; x += 10) k.rect(x, -85, 1, 6, N.steel); k.px(102, -84, '#3a4a66');
      for (const wx of [100, 154]) { k.rect(wx - 1, -67, 28, 24, N.steel); k.rect(wx, -66, 26, 22, N.glass); k.rect(wx + 13, -66, 1, 22, N.steel); k.rect(wx - 2, -43, 30, 2, N.steelHi); k.px(wx + 1, -65, '#3a4a66'); k.px(wx + 2, -65, '#2a3650'); }
      k.rect(98, -70, 84, 2, N.steel); k.rect(98, -70, 84, 1, N.steelHi);
      k.rect(131, -61, 18, 23, N.steel); k.rect(132, -60, 16, 22, N.glass); k.rect(139, -60, 2, 22, N.wall); k.px(137, -50, N.steelHi); k.px(142, -50, N.steelHi); k.rect(129, -38, 22, 2, N.steelHi);
      k.rect(84, -90, 2, 3, N.steel); k.rect(84, -56, 2, 3, N.steel);                                   // blade-sign brackets
      // Rooftop: AC unit, drone pad, antenna and the holographic billboard frame with its projector.
      k.rect(100, -99, 13, 9, N.steelHi); k.rect(100, -99, 13, 1, '#8a88a0'); for (let i = 0; i < 4; i++) k.rect(102 + i * 3, -97, 1, 6, N.steel);
      k.rect(166, -95, 12, 3, N.steel); k.rect(167, -95, 10, 1, N.steelHi); k.rect(171, -95, 2, 1, '#ffd84a');
      k.rect(180, -122, 1, 32, N.steel); k.rect(178, -112, 5, 1, N.steel); k.rect(177, -104, 7, 1, N.steel);
      k.rect(116, -101, 2, 11, N.steel); k.rect(162, -101, 2, 11, N.steel); k.rect(135, -101, 10, 4, N.steelHi); k.rect(137, -102, 6, 1, '#8a88a0');
      k.alpha(.55, () => k.rect(BB.x, BB.y, BB.w, BB.h, '#0b0f1a'));
      for (const [cx, cy, dx, dy] of [[BB.x - 1, BB.y - 1, 1, 1], [BB.x + BB.w, BB.y - 1, -1, 1], [BB.x - 1, BB.y + BB.h, 1, -1], [BB.x + BB.w, BB.y + BB.h, -1, -1]]) { k.rect(Math.min(cx, cx + dx * 5), cy, 6, 1, N.steelHi); k.rect(cx, Math.min(cy, cy + dy * 5), 1, 6, N.steelHi); }
      k.rect(185, -92, 1, 68, N.ink); k.rect(186, -92, 1, 68, N.steel);                                     // data cable up the facade
      // Server rack at the end of the desks.
      k.rect(179, 8, 10, 2, C.shadow); k.rect(177, -26, 11, 34, N.steel); k.rect(178, -25, 9, 32, '#15141c'); for (let i = 0; i < 7; i++) { k.rect(178, -24 + i * 4, 9, 3, N.wall); k.rect(179, -23 + i * 4, 4, 1, N.ink); }
      // Long steel desk with monitors (screens animate), keyboards, a mug and a potted fern.
      k.rect(100, 8, 78, 2, C.shadow); for (const x of [99, 136, 172]) k.rect(x, 1, 2, 7, N.steel);
      k.rect(98, -3, 78, 4, N.steelHi); k.rect(98, -3, 78, 1, '#6e6a8a'); k.rect(101, 2, 72, 4, N.wall); k.rect(98, 1, 78, 1, '#1f5a66');
      for (const s of SCREENS) {
        if (s.crt) { k.rect(s.x - 2, s.y - 2, s.w + 4, s.h + 5, '#6a6878'); k.rect(s.x - 2, s.y - 2, s.w + 4, 1, '#8e8ca0'); k.rect(s.x + s.w + 1, s.y - 1, 1, s.h + 4, '#4a4858'); k.rect(s.x - 1, s.y + s.h + 1, s.w + 2, 1, '#55536a'); k.px(s.x + s.w - 1, s.y + s.h + 1, C.red2); k.px(s.x + s.w - 3, s.y + s.h + 1, '#2a2838'); }
        else { const cx = s.x + (s.w >> 1); k.rect(s.x - 1, s.y - 1, s.w + 2, s.h + 2, N.ink); k.rect(s.x - 1, s.y + s.h, s.w + 2, 1, '#2a2838'); k.rect(cx - 1, s.y + s.h + 1, 2, -3 - (s.y + s.h + 1), N.steel); k.rect(cx - 3, -4, 6, 1, N.steel); }
        k.rect(s.x, s.y, s.w, s.h, '#070a12');
      }
      for (const [x, w] of [[103, 11], [121, 11], [141, 14], [162, 10]]) { k.rect(x, -2, w, 1, N.ink); for (let i = 1; i < w; i += 2) k.px(x + i, -2, '#3a3850'); }
      k.rect(134, -6, 3, 3, C.white); k.px(137, -5, '#d8d4e0'); k.rect(134, -6, 3, 1, '#6a3a2a');
      Props.pot(k, 92, -24, true);
      // Cables snake across the plates to the rack, the door and the laptop case.
      k.path([[102, 6], [97, 10], [93, 9], [90, 12]], N.ink); k.path([[103, 6], [98, 11], [94, 10], [91, 13]], '#2a4a58');
      k.path([[170, 6], [173, 12], [178, 11], [182, 9]], N.ink); k.path([[150, 6], [152, 13], [160, 15], [170, 12], [180, 10]], '#3a2448');
      k.path([[124, 6], [121, 12], [127, 15], [133, 13]], N.ink); k.path([[140, -38], [140, -33], [128, -28], [118, -22], [112, -10]], N.ink);
      k.circle(133, 14, 2, N.steel); k.px(133, 14, N.ink);
      for (const x of [80]) Props.pot(k, x, -30); Props.lamp(k, 86, -8, false);

      // Market stalls with striped awnings and goods, plus spare stock around them.
      STALLS.forEach(s => stall(k, s));
      Props.crate(k, -92, 8, 8); Props.sack(k, -186, 22, C.gold1); Props.sack(k, -92, 64, SAFFRON); Props.barrel(k, -186, 82); Props.crate(k, -88, 76, 8);
      k.rect(-176, 98, 30, 8, C.red1); k.rect(-175, 99, 28, 6, C.gold1); k.dither(-175, 99, 28, 6, C.red2, 1); k.rect(-126, 98, 30, 8, C.teal1); k.rect(-125, 99, 28, 6, C.teal3); k.dither(-125, 99, 28, 6, C.gold2, 1);
      Props.lamp(k, -70, 20, false); Props.lamp(k, 40, 20, false);
      Props.sign(k, 52, 8, 'SOUK', C.teal1); Props.barrel(k, 8, -14); Props.sack(k, 20, -10, C.gold1); for (let i = 0; i < 3; i++) { const ax = -58 + i * 8; k.ellipse(ax + 3, -12, 4, 1, C.shadow); k.ellipse(ax + 2, -17, 3, 5, C.terra2); k.rect(ax + 1, -24, 3, 3, C.terra1); k.px(ax, -19, C.terra4); }
      // Deal court: planked dais, patterned rug, map table, chairs and a brass balance.
      k.rect(60, 22, 128, 70, C.wood1); Props.planks(k, 61, 23, 126, 67, C.wood3); k.rect(60, 90, 128, 3, C.wood0);
      k.rect(70, 32, 108, 50, C.gold1); k.rect(71, 33, 106, 48, BURG); k.rect(74, 36, 100, 42, S(BURG, -.2)); k.dither(74, 36, 100, 42, BURG, 1);
      for (let i = 0; i < 106; i += 6) { k.px(71 + i, 34, C.gold2); k.px(74 + i, 79, C.gold2); }
      k.rect(76, 38, 96, 1, C.gold2); k.rect(76, 76, 96, 1, C.gold2);
      Props.table(k, MAP.x, MAP.y, MAP.w, 12, C.wood2);
      k.rect(MAP.x + 2, MAP.y - 16, MAP.w - 4, 8, C.paper); k.rect(MAP.x + 2, MAP.y - 16, 16, 8, C.water3); k.dither(MAP.x + 2, MAP.y - 16, 16, 8, C.water4, 1);
      k.path([[MAP.x + 18, MAP.y - 16], [MAP.x + 16, MAP.y - 13], [MAP.x + 19, MAP.y - 11], [MAP.x + 17, MAP.y - 8]], C.wood1);
      for (const [dx, dy] of [[26, -14], [34, -12], [42, -14]]) { k.px(MAP.x + dx, MAP.y + dy, C.stone1); k.px(MAP.x + dx - 1, MAP.y + dy + 1, C.stone1); k.px(MAP.x + dx + 1, MAP.y + dy + 1, C.stone1); }
      for (let i = 0; i < 6; i++) k.px(MAP.x + 20 + i * 5, MAP.y - 11 + (i % 2), C.red2);
      k.rect(MAP.x + 2, MAP.y - 17, MAP.w - 4, 1, C.paper2); k.rect(MAP.x + 40, MAP.y - 18, 10, 2, C.wood4);
      for (const x of [MAP.x - 6, MAP.x + MAP.w + 2]) { k.rect(x, MAP.y - 10, 5, 10, C.wood1); k.rect(x, MAP.y - 10, 5, 3, BURG); k.rect(x, MAP.y - 10, 5, 1, S(BURG, .3)); }
      k.rect(SCALE.x - 4, SCALE.y - 2, 9, 3, C.stone2); k.rect(SCALE.x - 1, SCALE.y - 20, 3, 18, C.gold1); k.rect(SCALE.x - 1, SCALE.y - 20, 1, 18, C.gold3); k.px(SCALE.x, SCALE.y - 23, C.gold3);
      for (let i = 0; i < 3; i++) Props.sack(k, 150 + i * 9, 84, [C.gold1, SAFFRON, C.plaster1][i]);

      // Caravan corner: covered wagon with rugs and jars, and a tethered donkey.
      Props.cart(k, 78, 126, (q, x, y) => { q.rect(x + 1, y - 8, 20, 8, C.teal2); q.rect(x + 1, y - 8, 20, 2, C.teal3); q.rect(x + 3, y - 12, 6, 4, C.red1); q.rect(x + 11, y - 13, 4, 5, C.terra3); q.ellipse(x + 13, y - 13, 2, 1, C.terra2); q.rect(x + 16, y - 11, 5, 3, C.gold2); });
      const dx = 142, dy = 128;
      k.ellipse(dx + 4, dy + 1, 12, 2, C.shadow);
      for (const lx of [-6, -3, 6, 9]) k.rect(dx + lx, dy - 7, 2, 7, lx % 2 ? '#6a625a' : '#7e766c');
      k.ellipse(dx + 1, dy - 10, 10, 5, '#8a8278'); k.ellipse(dx, dy - 12, 8, 3, '#a09888'); k.rect(dx - 4, dy - 16, 10, 3, C.red1); k.rect(dx - 4, dy - 16, 10, 1, C.gold2);
      k.rect(dx + 9, dy - 18, 4, 8, '#8a8278'); k.rect(dx + 10, dy - 20, 7, 5, '#8a8278'); k.rect(dx + 15, dy - 17, 3, 3, '#c8c0b0'); k.px(dx + 13, dy - 19, C.ink); k.rect(dx + 10, dy - 24, 2, 4, '#7e766c'); k.rect(dx + 13, dy - 24, 2, 4, '#6a625a');
      k.rect(dx - 10, dy - 11, 2, 5, '#5a524a'); k.rect(dx + 26, dy - 18, 2, 18, C.wood1); k.line(dx + 17, dy - 16, dx + 26, dy - 12, C.wood3);
      for (let i = 0; i < 3; i++) Props.sack(k, 168 + i * 7, 128 - (i % 2) * 5, [C.plaster1, C.gold1, '#b8a276'][i]);
      Props.tree(k, -176, 140, 'orange', 1, 1); Props.bench(k, -136, 132, 20); Props.bush(k, -64, 118, 1); Props.bush(k, -40, 132, 2); Props.bush(k, 36, 124, 0);
      Props.pot(k, -30, 108); Props.pot(k, 26, 108);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting';
      if (live) {
        for (const [x, y] of HALL_WIN) { k.rect(x, y, 4, 7, C.glassLit); k.rect(x + 5, y, 3, 7, C.glassLit); k.rect(x, y + 8, 4, 6, '#f0b862'); k.rect(x + 5, y + 8, 3, 6, '#f0b862'); }
        for (const [x, y] of [[-70, 20], [40, 20], [86, -8]]) k.rect(x - 1, y - 20, 4, 3, C.glassLit);
      }
      // Pennants over the deal court wave in the breeze (still when off).
      const wind = live ? t : 0;
      Props.banner(k, 62, 26, BURG, wind, 12); Props.banner(k, 176, 26, C.gold1, wind + 1, 12); Props.banner(k, -4, 102, C.teal2, wind + 2, 10);
      // Crane: the hoisted crate rises and falls while working; on error it has crashed to the ground.
      const hy = err ? null : run ? CRANE.y - 30 - Math.round((Math.sin(t * .9) + 1) * 14) : CRANE.y - 44;
      if (hy !== null) { k.rect(CRANE.jib, CRANE.y - 67, 1, hy - CRANE.y + 67, C.wood0); Props.crate(k, CRANE.jib - 4, hy, 9); }
      else { k.rect(CRANE.jib, CRANE.y - 67, 1, 14, C.wood0); k.poly([[CRANE.jib - 8, CRANE.y + 6], [CRANE.jib + 4, CRANE.y + 2], [CRANE.jib + 8, CRANE.y + 8], [CRANE.jib - 4, CRANE.y + 12]], C.wood3); k.line(CRANE.jib - 6, CRANE.y + 8, CRANE.jib + 6, CRANE.y + 5, C.wood1); for (const [fx, fy] of [[-14, 12], [12, 14], [-2, 16], [8, 4]]) k.rect(CRANE.jib + fx, CRANE.y + fy, 3, 2, [C.red2, SAFFRON, C.gold2, C.red3][Math.abs(fx) % 4]); soot(k, CRANE.jib, CRANE.y + 4, t, 5, '#6e665c'); if (Math.floor(t * 6) % 2) for (const [sx, sy] of [[-10, 0], [9, 2], [-4, -4]]) k.px(CRANE.jib + sx, CRANE.y + sy, C.gold4); }
      if (run && z.detail) Props.sparkle(k, MAP.x + 30, MAP.y - 20, t + .4, C.gold4);
      // Balance scale: weighing trades while working, level when calm, tipped hard on error.
      const tilt = run ? Math.round(Math.sin(t * 2) * 3) : err ? 5 : 0;
      k.line(SCALE.x - 11, SCALE.y - 20 + tilt, SCALE.x + 11, SCALE.y - 20 - tilt, C.gold2);
      for (const d of [-1, 1]) { const px = SCALE.x + d * 11, py = SCALE.y - 20 - d * tilt; k.line(px, py, px - 3, py + 6, C.gold1); k.line(px, py, px + 3, py + 6, C.gold1); k.rect(px - 4, py + 6, 9, 2, C.gold1); k.rect(px - 3, py + 6, 7, 1, C.gold3); }
      coin(k, SCALE.x - 12, SCALE.y - 16 + tilt);
      // Waiting: deal court roped off for approval, crates tagged HOLD at the hall steps.
      if (wait) {
        for (const x of [58, 84, 110]) { k.rect(x, 82, 2, 12, C.gold1); k.rect(x - 1, 81, 4, 2, C.gold3); }
        k.line(60, 86, 72, 89, BURG, 2); k.line(72, 89, 84, 86, BURG, 2); k.line(86, 86, 98, 89, BURG, 2); k.line(98, 89, 110, 86, BURG, 2);
        for (let i = 0; i < 4; i++) Props.crate(k, -30 + (i % 2) * 10, -8 - Math.floor(i / 2) * 9, 9);
        k.rect(-30, 2, 20, 8, C.ink); k.rect(-29, 3, 18, 6, C.waiting); k.text('HOLD', -28, 4, C.ink);
      }
      // The neon agency: signs, holo billboard, screens, marketers and the drone.
      agency(k, t, state, z);
      // Closed market: canvas covers over the goods when off.
      if (!live) STALLS.forEach(s => cover(k, s));
      if (err) { for (const [x, y, c] of [[-150, 26, C.red2], [-144, 30, SAFFRON], [-136, 24, C.red2], [-122, 32, C.leaf3], [-100, 28, C.gold2]]) { k.rect(x, y, 2, 2, c); k.px(x, y, S(c, .4)); } }

      // Crew: porter, shopper, trade partner and a hawker.
      if (run) {
        const p = (t * .08) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        z.crew(-146 + q * 56, -24, { look: 1, hat: 'bandana', hatColor: C.red2, anim: 'walk', carry: back ? '' : 'box', facing: back ? -1 : 1, phase: .2 });
        const p2 = (t * .06 + .3) % 1, b2 = p2 > .5, q2 = b2 ? (1 - p2) * 2 : p2 * 2;
        z.crew(-176 + q2 * 84, 40, { look: 4, hat: 'scarf', hatColor: C.gold2, anim: 'walk', carry: b2 ? 'food' : '', facing: b2 ? -1 : 1, phase: .6 });
        z.crew(158, 76, { look: 2, hat: 'none', anim: 'work', tool: 'pen', facing: -1, phase: .1 });
        z.crew(-78, 34, { look: 0, hat: 'straw', anim: 'cheer', phase: .5 });
        z.crew(-40 + Math.round(Math.sin(t * .3) * 20), 70, { look: 5, hat: 'hood', anim: 'walk', carry: 'food', facing: Math.cos(t * .3) > 0 ? 1 : -1, phase: .9 });
      } else if (live) {
        z.crew(-78, 34, { look: 0, hat: 'straw', anim: state === 'idle' ? 'sit' : 'idle' });
        z.crew(158, 76, { look: 2, hat: 'none', anim: state === 'idle' ? 'sit' : 'idle', facing: -1 });
        z.crew(state === 'idle' ? -128 : -100, state === 'idle' ? 130 : -24, { look: 1, hat: 'bandana', hatColor: C.red2, anim: state === 'idle' ? 'sit' : 'idle' });
        if (state === 'idle') for (let i = 0; i < 2; i++) Props.butterfly(k, -150 + Math.sin(t * .7 + i * 2) * 16, 110 + Math.cos(t + i) * 6, t + i, i ? '#e98aa0' : '#f2c14e');
      } else z.crew(158, 76, { look: 2, anim: 'sleep', facing: -1 });
      // Donkey flicks its tail.
      if (live) k.rect(132 - (Math.floor(t * 2) % 2), 117, 1, 5, '#5a524a');
      if (live && !err && z.detail) for (let i = 0; i < 2; i++) Props.bird(k, ((t * 15 + i * 170) % 360) - 180, -140 + i * 8 + Math.sin(t * 2 + i) * 3, t + i);

      // The market ambassador: flipping coins over the map table; on the bench when off.
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});
    }
  };
})();
