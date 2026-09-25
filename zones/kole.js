/* Köle · Workshop & living quarters: water-driven forge, materials yard with hoist, repair shed,
   a haul track where an overseer's whip drives a rope crew dragging cut stone, a cutaway bunkhouse
   and an open dining pergola. Crews leave south for the lumberyard, mine and farm. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.kole = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: -98, y: -2 };                   // hammering at the anvil in the forge yard
  const ANVIL = { x: -76, y: -6 };
  const WHEEL = { x: -162, y: -68, r: 17 };
  const FORGE = { x: -150, y: -48, w: 92, h: 44 };
  const MOUTH = { x: -142, y: -82, w: 38, h: 34 };  // open forge front
  const HOIST = { x: 34, y: -60 };
  const GRIND = { x: 144, y: -64 };
  const REST = { x: -22, y: 84 };                   // the lead dozes by the bunkhouse when off
  const BH = { x0: -190, x1: -46, y0: 34, y1: 134 }; // cutaway bunkhouse interior
  const PG = { x0: 44, x1: 190, y0: 30, y1: 138 };   // dining pergola
  const BEDS = [[-172, 36], [-148, 36], [-124, 36], [-100, 36], [-76, 36], [-146, 100], [-122, 100]];   // seven bunks inside the hexagon's slanted wall
  const BLANKET = ['#6a7ab0', '#a85a6a', '#5a8a5a', '#c8a04a', '#8a6a9a', '#6a8a9a', '#b8683a', '#5a6a8a'];
  const ROUTE = [[30, -22], [6, 22], [2, 90], [0, 146]];   // tool rack -> south exit
  const SLEEPERS = { working: [2], idle: [0, 3, 6], waiting: [1, 4], error: [5], off: [0, 1, 2, 3, 4, 5, 6] };

  // Cached water-wheel frames (6 spokes, 12 paddles; 8 frames cover one 60° step).
  const wheel = f => P.sprite(`kole|wheel|${f}`, 42, 42, 21, 21, q => {
    const r = WHEEL.r, off = f / 8 * Math.PI / 3;
    for (let i = 0; i < 12; i++) { const a = off + i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a); q.line(c * (r - 4), s * (r - 4), c * (r + 2), s * (r + 2), i % 2 ? C.wood2 : C.wood3, 2); }
    q.ring(0, 0, r, r, C.wood1); q.ring(0, 0, r - 1, r - 1, C.wood3); q.ring(0, 0, r - 2, r - 2, C.wood2);
    for (let i = 0; i < 6; i++) { const a = off + i * Math.PI / 3; q.line(0, 0, Math.cos(a) * (r - 2), Math.sin(a) * (r - 2), C.wood2, 1); }
    q.circle(0, 0, 3, C.stone1); q.circle(0, 0, 2, C.stone3); q.px(-1, -1, C.stone5);
  }, C.wood0);
  const grindstone = f => P.sprite(`kole|grind|${f}`, 16, 16, 8, 8, q => {
    q.circle(0, 0, 6, C.stone2); q.circle(0, 0, 5, C.stone3); q.ring(0, 0, 3, 3, C.stone2);
    const a = f / 4 * Math.PI; q.line(Math.cos(a) * 5, Math.sin(a) * 5, -Math.cos(a) * 5, -Math.sin(a) * 5, C.stone1); q.circle(0, 0, 1, C.wood1);
  });
  const along = (pts, p) => {
    const segs = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
    let d = p * L; for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
    return pts[pts.length - 1];
  };
  const anvil = (k, x, y) => {
    k.ellipse(x + 3, y + 1, 12, 3, C.shadow);
    k.rect(x - 7, y - 8, 14, 9, C.wood2); k.rect(x - 7, y - 8, 3, 9, C.wood3); k.rect(x + 5, y - 8, 2, 9, C.wood1); k.ellipse(x, y - 8, 7, 2, C.wood4); k.ring(x, y - 8, 4, 1, C.wood2);
    k.rect(x - 4, y - 14, 8, 6, C.slate1); k.rect(x - 4, y - 14, 2, 6, C.slate2);
    k.poly([[x - 12, y - 18], [x + 9, y - 18], [x + 9, y - 14], [x - 5, y - 14], [x - 9, y - 16]], C.slate1); k.rect(x - 9, y - 19, 18, 2, C.slate3); k.rect(x - 6, y - 19, 12, 1, C.slate4); k.px(x - 12, y - 18, C.slate3);
  };
  const tool = (k, x, y, kind) => {
    if (kind === 'saw') { k.rect(x, y, 3, 4, C.wood2); k.poly([[x + 3, y], [x + 14, y + 1], [x + 14, y + 4], [x + 3, y + 4]], C.stone3); for (let i = 4; i < 14; i += 2) k.px(x + i, y + 4, C.stone1); return; }
    k.rect(x, y, 1, 12, C.wood3); k.px(x, y + 11, C.wood1);
    if (kind === 'hammer') { k.rect(x - 2, y - 1, 5, 3, C.slate2); k.px(x - 2, y - 1, C.slate4); }
    if (kind === 'axe') { k.poly([[x, y], [x + 4, y - 2], [x + 4, y + 4], [x, y + 3]], C.stone3); k.px(x + 4, y - 1, C.white); }
    if (kind === 'pick') { k.line(x - 4, y + 1, x + 4, y - 1, C.stone2); k.px(x + 4, y - 1, C.white); }
    if (kind === 'hoe') { k.rect(x - 3, y, 4, 2, C.stone2); }
    if (kind === 'tongs') { k.line(x, y, x + 2, y + 12, C.slate1); k.rect(x - 1, y, 3, 2, C.slate2); }
  };
  const lampPost = (k, x, y) => { k.ellipse(x + 1, y, 3, 1, C.shadow); k.rect(x - 1, y - 1, 4, 2, C.stone1); k.rect(x, y - 16, 2, 16, C.slate1); k.rect(x - 2, y - 21, 6, 5, C.slate0); k.rect(x - 1, y - 20, 4, 3, C.glassDark); k.rect(x - 3, y - 22, 8, 1, C.slate1); };

  /* ---- Haul yard: an overseer cracks his whip over a rope crew dragging a cut block on rollers ---- */
  const OVS = { x: 68, y: -4 };                               // overseer's feet
  const BLK = { x: 84, y: -13 };                              // block front-bottom-left; rollers sit below
  const HAUL = [[128, -16], [150, -16], [138, -5], [160, -5]]; // back pair on rope A, front pair on rope B
  const HAULER = [{ look: 0, hat: 'bandana', hc: C.red2 }, { look: 3, hat: 'cap', hc: C.slate2 }, { look: 5, hat: 'none' }, { look: 2, hat: 'straw' }];
  const TGT = [72, -39], WL = 60, WT = 1.8, CRACK_AT = .625, NF = 40, NW = 18;
  const OV = { hood: '#3b3533', hoodL: '#5e5650', hoodD: '#221e1c', vest: '#5a3a24', vestL: '#7a5232', vestD: '#3a2616', shirt: '#c4b089', shirtD: '#9a8662',
    pants: '#48403a', pantsD: '#2f2a26', boot: '#2a1e16', bootL: '#58422e', belt: '#241810', skin: C.skin1, skinD: C.skin0, lash: '#2a1810', lashL: '#6a4428' };
  const HAND = { low: [9, -13], back: [-5, -31], up: [2, -35], fwd: [12, -29], snap: [15, -22], tap0: [10, -20], tap1: [9, -16], tangle: [10, -31] };
  const ELBOW = { low: [8, -17], back: [4, -27], up: [6, -29], fwd: [9, -24], snap: [10, -21], tap0: [10, -17], tap1: [10, -16], tangle: [9, -25] };
  const coil = (q, x, y) => { q.ellipse(x, y, 3, 3, OV.lash); q.ring(x, y, 2, 2, OV.lashL); q.px(x, y, OV.lashL); q.rect(x + 2, y + 2, 2, 4, C.wood3); q.px(x + 2, y + 5, C.gold2); };
  // Overseer: broad, hooded, leather vest and boots. ~29 px tall, facing right. Poses carry the whip arm.
  const overseer = pose => P.sprite(`kole|ovs|${pose}`, 44, 46, 20, 42, q => {
    if (pose === 'sleep') {
      coil(q, -12, -4);
      q.rect(-1, -5, 10, 4, OV.pants); q.rect(-1, -5, 10, 1, S(OV.pants, .18)); q.rect(8, -9, 4, 8, OV.boot); q.rect(8, -9, 4, 1, OV.bootL);
      q.rect(-7, -16, 12, 11, OV.vest); q.rect(-2, -16, 3, 11, OV.shirt); q.rect(-7, -16, 1, 11, OV.vestL); q.rect(-7, -7, 12, 2, OV.belt); q.rect(-1, -7, 2, 2, C.gold2);
      q.rect(-4, -13, 10, 3, OV.shirtD); q.rect(4, -13, 3, 3, OV.skin);
      q.rect(-7, -18, 13, 3, OV.hood); q.rect(-7, -18, 13, 1, OV.hoodL);
      q.rect(-3, -24, 9, 7, OV.hood); q.rect(-2, -25, 7, 1, OV.hood); q.rect(-2, -25, 3, 1, OV.hoodL); q.rect(-3, -24, 1, 5, OV.hoodL);
      q.rect(2, -19, 4, 2, OV.skin); q.dither(2, -19, 4, 2, OV.skinD); q.rect(1, -21, 6, 2, OV.hoodD); q.px(6, -19, OV.skin);
      return;
    }
    const tap = pose === 'tap0' || pose === 'tap1', lunge = pose === 'snap' || pose === 'fwd' ? 1 : 0;
    // Back arm, behind the body: fist on the hip, or thrown up when tangled.
    if (pose === 'tangle') { q.line(-6, -20, -10, -25, OV.shirtD, 3); q.line(-10, -25, -9, -30, OV.skinD, 2); q.rect(-10, -32, 3, 3, OV.skinD); }
    else if (!tap) { q.line(-6, -20, -10, -17, OV.shirtD, 3); q.line(-10, -17, -7, -13, OV.skinD, 2); q.rect(-8, -14, 3, 3, OV.skinD); }
    // Legs and heavy boots.
    q.rect(-6, -11, 5, 7, OV.pantsD); q.rect(1 + lunge, -11, 5, 7, OV.pants); q.rect(1 + lunge, -11, 1, 7, S(OV.pants, .18));
    q.rect(-7, -4, 6, 4, OV.boot); q.rect(-7, -4, 6, 1, OV.bootL); q.rect(1 + lunge, -4, 7, 4, OV.boot); q.rect(1 + lunge, -4, 5, 1, OV.bootL); q.px(7 + lunge, -2, OV.bootL);
    // Linen shirt under a laced leather vest; wide belt with a brass buckle.
    q.rect(-7, -21, 15, 8, OV.vest); q.rect(-1, -21, 4, 8, OV.shirt); q.rect(2, -21, 1, 8, OV.shirtD);
    q.rect(-7, -21, 1, 8, OV.vestL); q.rect(6, -21, 2, 8, OV.vestD); for (let y = -20; y < -14; y += 2) { q.px(-1, y, OV.vestD); q.px(3, y, OV.vestD); }
    q.rect(-7, -13, 15, 2, OV.belt); q.rect(0, -13, 3, 2, C.gold2); q.px(0, -13, C.gold4);
    // Hood with capelet; a scowling, stubbled face in the opening.
    q.rect(-7, -23, 14, 3, OV.hood); q.rect(-7, -23, 14, 1, OV.hoodL); q.rect(5, -22, 2, 2, OV.hoodD);
    q.rect(-4, -30, 9, 8, OV.hood); q.rect(-3, -31, 7, 1, OV.hood); q.rect(-3, -31, 3, 1, OV.hoodL); q.rect(-4, -30, 1, 5, OV.hoodL); q.rect(-5, -27, 1, 4, OV.hoodD);
    q.rect(0, -28, 5, 5, OV.skin); q.rect(0, -28, 5, 1, OV.skinD); q.rect(0, -28, 1, 5, OV.hoodD);
    q.rect(1, -27, 4, 1, C.ink); q.px(3, -26, C.ink); q.px(5, -26, OV.skin); q.dither(1, -25, 4, 2, OV.skinD); q.rect(2, -24, 3, 1, S(OV.skinD, -.25));
    if (pose === 'idle') { q.line(5, -20, 9, -17, OV.shirt, 3); q.line(9, -17, 6, -13, OV.skin, 2); q.rect(5, -14, 3, 3, OV.skin); coil(q, 3, -8); return; }
    if (tap) { q.line(-5, -19, 0, -14, OV.shirtD, 3); q.line(0, -14, 5, -13, OV.skinD, 2); q.rect(4, -14, 5, 2, OV.skin); q.px(4, -14, C.skin2); }
    if (pose === 'tangle') {
      // Whip wound round his own chest and legs, knotted at the fist.
      q.line(-7, -19, 7, -15, OV.lash); q.line(-7, -18, 7, -14, OV.lashL); q.line(-6, -9, 6, -6, OV.lash); q.line(-6, -6, 6, -9, OV.lash); q.line(-7, -3, 8, -2, OV.lash);
    }
    const e = ELBOW[pose], h = HAND[pose];
    q.line(5, -20, e[0], e[1], OV.shirt, 3); q.line(e[0], e[1], h[0], h[1], OV.skin, 2); q.rect(h[0] - 1, h[1] - 1, 3, 3, OV.skin); q.px(h[0] - 1, h[1] - 1, C.skin2);
    if (tap) coil(q, h[0] + 2, h[1] - 2);
    if (pose === 'tangle') { q.ring(12, -34, 2, 2, OV.lash); q.ring(14, -32, 2, 1, OV.lash); q.line(12, -33, 9, -22, OV.lash); q.line(14, -31, 16, -24, OV.lash); q.px(16, -23, C.paper); }
  });
  const block = () => P.sprite('kole|block', 29, 20, 0, 19, q => {
    q.rect(0, -19, 28, 7, C.stone4); q.rect(0, -19, 28, 1, C.stone5); q.rect(0, -19, 1, 7, C.stone5); q.dither(2, -17, 24, 4, C.stone3, 1);
    q.rect(0, -12, 28, 12, C.stone2); q.rect(0, -12, 28, 1, C.stone3); q.rect(0, -12, 1, 12, C.stone3); q.rect(25, -12, 3, 12, C.stone1); q.rect(0, -1, 28, 1, C.stone1);
    for (let i = 0; i < 5; i++) { q.px(3 + i * 4, -9 + (i % 2) * 4, C.stone1); q.px(4 + i * 4, -8 + (i % 2) * 4, C.stone3); }
    q.rect(19, -19, 3, 19, C.wood3); q.rect(19, -19, 1, 19, C.wood4); q.rect(21, -19, 1, 19, C.wood1); q.rect(18, -16, 5, 2, C.wood2); q.px(22, -15, C.wood4);
  }, C.stone0);
  const roller = f => P.sprite(`kole|roll|${f}`, 8, 8, 4, 4, q => {
    q.circle(0, 0, 3, C.wood2); q.circle(0, 0, 2, C.wood4); q.px(-1, -1, C.wood5);
    const a = f / 4 * Math.PI, cx = Math.round(Math.cos(a) * 2), cy = Math.round(Math.sin(a) * 2); q.line(cx, cy, -cx, -cy, C.wood1);
  }, C.wood0);
  const burst = f => P.sprite(`kole|burst|${f}`, 22, 22, 11, 11, q => {
    if (f === 0) { q.rect(-4, 0, 9, 1, C.gold4); q.rect(0, -4, 1, 9, C.gold4); q.rect(-1, -1, 3, 3, C.white); return; }
    if (f === 1) {
      q.rect(-8, 0, 17, 1, C.gold3); q.rect(0, -8, 1, 17, C.gold3); q.rect(-5, 0, 11, 1, C.white); q.rect(0, -5, 1, 11, C.white);
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let i = 2; i < 6; i++) q.px(dx * i, dy * i, i < 4 ? C.gold4 : C.gold2);
      q.rect(-1, -1, 3, 3, C.white); return;
    }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; q.rect(Math.round(Math.cos(a) * 8), Math.round(Math.sin(a) * 8), 2, 1, i % 2 ? C.gold2 : C.gold4); }
    q.px(0, 0, C.gold4);
  }, C.ink);
  const crackText = () => P.sprite('kole|crack', 22, 8, 0, 0, q => { q.text('CRACK', 1, 1, C.red2); q.text('CRACK', 0, 0, C.gold4); }, C.ink);

  // Whip curves: hand-placed keyframes plus an "unrolling loop" generator, resampled to NW points and
  // interpolated into NF precomputed frames per crack cycle. Coordinates are relative to the overseer's feet.
  const spline = pts => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let s = 0; s < 8; s++) { const u = s / 8, u2 = u * u, u3 = u2 * u; out.push([0, 1].map(j => .5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    out.push(pts[pts.length - 1]); return out;
  };
  const resample = pts => {
    const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = d[d.length - 1], out = []; let j = 0;
    for (let n = 0; n < NW; n++) { const s = L * n / (NW - 1); while (j < pts.length - 2 && d[j + 1] < s) j++; const f = (s - d[j]) / ((d[j + 1] - d[j]) || 1); out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]); }
    return out;
  };
  const unroll = (h, a) => {
    const dx = TGT[0] - h[0], dy = TGT[1] - h[1], dl = Math.hypot(dx, dy), d = [dx / dl, dy / dl], n = [d[1], -d[0]], r = 4, pts = [];
    for (let s = 0; s <= a; s += 2) pts.push([h[0] + d[0] * s, h[1] + d[1] * s]);
    const F = [h[0] + d[0] * a, h[1] + d[1] * a], c = [F[0] + n[0] * r, F[1] + n[1] * r];
    for (let i = 1; i <= 6; i++) { const g = Math.PI * i / 6; pts.push([c[0] - n[0] * r * Math.cos(g) + d[0] * r * Math.sin(g), c[1] - n[1] * r * Math.cos(g) + d[1] * r * Math.sin(g)]); }
    const rest = WL - a - Math.PI * r, top = [F[0] + n[0] * 2 * r, F[1] + n[1] * 2 * r];
    for (let s = 2; s <= rest; s += 2) { const f = s / rest; pts.push([top[0] - d[0] * s, top[1] - d[1] * s + f * f * 8]); }
    return pts;
  };
  const REST_CURVE = [[9, -13], [13, -6], [20, -2], [30, -1], [40, -1], [48, -2], [52, -4]];
  const KEYS = [
    [0, 'low', REST_CURVE],
    [.15, 'back', [[-5, -31], [1, -26], [10, -19], [21, -12], [32, -6], [43, -3], [50, -2]]],
    [.25, 'up', [[2, -35], [7, -43], [8, -52], [3, -59], [-6, -62], [-16, -60], [-24, -55]]],
    [.35, 'up', [[2, -35], [-6, -39], [-16, -41], [-27, -39], [-36, -34], [-43, -27], [-47, -20]]],
    [.425, 'fwd', unroll(HAND.fwd, 10), 1],
    [.5, 'fwd', unroll(HAND.fwd, 26), 1],
    [.55, 'snap', unroll(HAND.snap, 38), 1],
    [.6, 'snap', unroll(HAND.snap, 47), 1],
    [CRACK_AT, 'snap', [[15, -22], [30, -27], [45, -31], [60, -35], [70, -38], [73, -41]]],
    [.7, 'snap', [[15, -22], [27, -28], [39, -32], [50, -34], [59, -33], [64, -28]]],
    [.825, 'low', [[9, -13], [19, -22], [30, -27], [40, -24], [46, -15], [49, -6], [50, -3]]],
    [1, 'low', REST_CURVE]
  ].map(([p, pose, pts, dense]) => ({ p, pose, pts: resample(dense ? pts : spline(pts)) }));
  const WHIP = [];
  for (let i = 0; i < NF; i++) {
    const p = i / NF; let j = 0; while (KEYS[j + 1].p <= p) j++;
    const A = KEYS[j], B = KEYS[j + 1], u = (p - A.p) / (B.p - A.p), pose = u < .5 ? A.pose : B.pose, h = HAND[pose];
    const pts = A.pts.map((a, n) => [a[0] + (B.pts[n][0] - a[0]) * u, a[1] + (B.pts[n][1] - a[1]) * u]);
    const dx = h[0] - pts[0][0], dy = h[1] - pts[0][1];
    WHIP.push({ pose, pts: pts.map(([x, y], n) => { const f = (1 - n / (NW - 1)) ** 2; return [Math.round(x + dx * f), Math.round(y + dy * f)]; }) });
  }
  const drawWhip = (k, pts, x, y) => {
    k.line(x + pts[0][0], y + pts[0][1], x + pts[1][0], y + pts[1][1], C.wood1, 2); k.px(x + pts[0][0], y + pts[0][1], C.gold2);
    for (let i = 1; i < pts.length - 1; i++) k.line(x + pts[i][0], y + pts[i][1], x + pts[i + 1][0], y + pts[i + 1][1], i < 6 ? OV.lash : '#4a2e1c');
    const tp = pts[pts.length - 1]; k.px(x + tp[0], y + tp[1], C.paper);
  };
  const slackRope = (k, x0, y0, x1, y1) => k.path([[x0, y0], [x0 + 3, y0 + 7], [x0 + 10, Math.max(y0, y1) + 9], [(x0 + x1) / 2 + 6, Math.max(y0, y1) + 10], [x1 - 4, Math.max(y0, y1) + 6], [x1, y1]], C.wood4);

  return {
    paint(k) {
      /* ---- Ground: packed-earth yard, cobbled forge pad, south road ---- */
      k.poly([[-192, -44], [192, -44], [194, 30], [60, 32], [40, 150], [-40, 150], [-44, 30], [-194, 30]], C.dirt2);
      k.ditherPoly([[-192, -44], [192, -44], [194, 30], [60, 32], [40, 150], [-40, 150], [-44, 30], [-194, 30]], C.dirt3, 1);
      for (let i = 0; i < 90; i++) { const x = -190 + P.hash(i, 3) * 380, y = -42 + P.hash(i, 5) * 70; k.px(x, y, P.hash(i, 9) > .5 ? C.dirt1 : C.dirt4); if (i % 4 === 0) k.px(x + 1, y, C.dirt1); }
      // Road south with cart ruts.
      k.polyTex([[-20, 24], [22, 24], [20, 151], [-20, 151]], (x, y) => (x === -14 || x === -13 || x === 11 || x === 12) ? C.dirt2 : (P.hash(x >> 1, y >> 1) < .12 ? C.dirt5 : C.dirt3));
      // Cobbled pad around the anvil and forge mouth, stained with soot.
      k.polyTex([[-150, -46], [-50, -46], [-44, 14], [-136, 16], [-156, 0]], (x, y) => {
        const row = Math.floor((y + 200) / 4), off = row % 2 * 3;
        if ((y + 200) % 4 === 0 || (x + 300 + off) % 6 === 0) return C.stone1;
        const h = P.hash(Math.floor((x + off) / 6), row), soot = Math.hypot(x - ANVIL.x, (y - ANVIL.y) * 1.6) < 20;
        return soot ? (h < .5 ? C.stone0 : C.stone1) : h < .2 ? C.stone3 : C.stone2;
      });
      for (let i = 0; i < 60; i++) { const x = -194 + P.hash(i, 13) * 388, y = -152 + P.hash(i, 17) * 300; if (y > -46 && y < 32) continue; if (x > BH.x0 - 2 && x < BH.x1 + 6 && y > 10) continue; if (x > PG.x0 - 2 && y > 20) continue; Props.tuft(k, x, y, C.grass1, C.grass4); }

      /* ---- Flume and water wheel (top left) ---- */
      // Stone wheel pit with a pool that spills away to the west.
      k.at(10, 0, () => {   // under the wheel, moved in from the hexagon edge
      k.rect(-194, -56, 44, 14, C.stone1); k.rect(-192, -54, 40, 10, C.water1); k.rect(-192, -54, 40, 2, C.water0); k.dither(-192, -50, 40, 6, C.water2, 1);
      k.rect(-194, -58, 44, 3, C.stone3); k.rect(-194, -58, 44, 1, C.stone4); for (let x = -194; x < -150; x += 6) k.px(x, -57, C.stone1);
      k.rect(-194, -43, 44, 3, C.stone2); k.rect(-194, -43, 44, 1, C.stone4);
      });
      // Wooden flume on trestles from the upland stream to the top of the wheel.
      k.poly([[-195, -148], [-184, -150], [-180, -138], [-195, -134]], C.water1); k.ditherPoly([[-195, -148], [-184, -150], [-180, -138], [-195, -134]], C.water3, 1);
      for (const [x, y, h] of [[-189, -126, 30], [-181, -106, 16]]) { k.rect(x, y, 2, h, C.wood1); k.rect(x, y, 1, h, C.wood3); k.rect(x + 7, y + 2, 2, h - 2, C.wood0); k.line(x + 1, y + h, x + 8, y + 3, C.wood1); k.rect(x - 1, y + h, 11, 2, C.stone2); k.rect(x - 1, y, 11, 2, C.wood2); }
      k.poly([[-193, -140], [-183, -140], [-156, -88], [-166, -88]], C.wood1); k.poly([[-192, -141], [-184, -141], [-158, -90], [-165, -90]], C.wood3);
      k.poly([[-190, -141], [-185, -141], [-160, -91], [-164, -91]], C.water2); k.line(-188, -141, -162, -91, C.water4);
      for (let i = 0; i < 5; i++) { const y = -134 + i * 10; k.line(-193 + i * 3.4, y, -183 + i * 3.4, y, C.wood0); }
      // Axle shaft into the forge wall, with a bearing block.
      k.rect(-162, -70, 12, 4, C.wood1); k.rect(-162, -70, 12, 1, C.wood3); k.rect(-156, -76, 6, 10, C.stone2); k.rect(-156, -76, 6, 2, C.stone4);

      /* ---- Forge hall (top left) ---- */
      const fb = Props.building(k, FORGE.x, FORGE.y, { w: FORGE.w, h: FORGE.h, roofH: 26, roof: C.slate2, wall: C.stone3, mat: 'stone', foundation: 5,
        door: { x: 64, w: 12, h: 16, color: C.wood2 }, windows: [{ x: 48, y: 8, w: 7, h: 8 }] });
      // Tall brick chimney.
      k.rect(-88, -150, 14, 50, C.terra1); k.rect(-88, -150, 4, 50, C.terra3); k.rect(-76, -150, 2, 50, C.terra0); k.rect(-86, -100, 14, 2, C.shadow);
      for (let y = -148; y < -102; y += 4) { k.rect(-88, y, 14, 1, C.terra0); k.px(-84 + (y % 8 ? 0 : 5), y + 2, C.terra0); }
      k.rect(-90, -152, 18, 4, C.stone3); k.rect(-90, -152, 18, 1, C.stone5); k.rect(-86, -151, 10, 1, C.ink);
      // Wide open forge mouth: brick hearth, hood, bellows and racks inside.
      k.rect(MOUTH.x - 3, MOUTH.y - 3, MOUTH.w + 6, MOUTH.h + 3, C.wood1); k.rect(MOUTH.x - 3, MOUTH.y - 3, MOUTH.w + 6, 2, C.wood3);
      k.rect(MOUTH.x, MOUTH.y, MOUTH.w, MOUTH.h, '#2a1e18'); k.dither(MOUTH.x, MOUTH.y, MOUTH.w, 10, '#3a2a20', 1);
      k.poly([[MOUTH.x + 8, MOUTH.y], [MOUTH.x + 26, MOUTH.y], [MOUTH.x + 23, MOUTH.y + 10], [MOUTH.x + 11, MOUTH.y + 10]], C.stone1); k.rect(MOUTH.x + 11, MOUTH.y + 9, 12, 2, C.stone0);
      k.rect(MOUTH.x + 6, MOUTH.y + 20, 22, 14, C.terra1); k.rect(MOUTH.x + 6, MOUTH.y + 20, 22, 2, C.terra3); for (let x = MOUTH.x + 6; x < MOUTH.x + 28; x += 4) k.px(x, MOUTH.y + 26, C.terra0);
      k.rect(MOUTH.x + 10, MOUTH.y + 16, 14, 5, '#3a1a12');
      // Bellows (they pump in animate) and a tool rack on the inner wall.
      k.rect(MOUTH.x + 29, MOUTH.y + 24, 8, 3, C.wood1); k.line(MOUTH.x + 28, MOUTH.y + 25, MOUTH.x + 25, MOUTH.y + 22, C.stone1);
      for (let i = 0; i < 4; i++) tool(k, MOUTH.x + 2 + i * 2, MOUTH.y + 4, i % 2 ? 'tongs' : 'hammer');
      k.rect(FORGE.x, FORGE.y - 1, 1, 1, C.stone1);
      Props.hangingSign(k, FORGE.x + 58, fb.top + 5, 'FORGE', C.terra1);
      // Iron stock leaning by the forge and a quench trough in the yard.
      for (let i = 0; i < 5; i++) k.line(FORGE.x + FORGE.w + 2 + i * 2, FORGE.y - 2, FORGE.x + FORGE.w + 4 + i * 2, FORGE.y - 20, i % 2 ? C.slate2 : C.slate3);
      k.ellipse(-52, -2, 12, 3, C.shadow); k.rect(-62, -12, 22, 9, C.wood1); k.rect(-62, -12, 22, 2, C.wood3); k.rect(-60, -10, 18, 3, C.water1); k.rect(-60, -10, 18, 1, C.water3);
      k.rect(-62, -8, 2, 6, C.wood0); k.rect(-42, -8, 2, 6, C.wood0);
      anvil(k, ANVIL.x, ANVIL.y);
      // Coal bucket, ingot rack and a grinding block.
      k.rect(-130, 4, 9, 7, C.slate1); k.rect(-130, 4, 9, 2, C.slate2); for (let i = 0; i < 4; i++) k.px(-129 + i * 2, 4, C.ink);
      k.rect(-146, -10, 16, 8, C.wood2); k.rect(-146, -10, 16, 1, C.wood4); for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { k.rect(-145 + i * 4 + r * 2, -14 - r * 2, 3, 2, r ? C.gold1 : C.slate3); k.px(-145 + i * 4 + r * 2, -14 - r * 2, r ? C.gold3 : C.slate4); }

      /* ---- Materials yard (top centre): coal bunker, bar rack, timber and hoist ---- */
      k.rect(-50, -66, 24, 18, C.stone1); k.rect(-50, -66, 24, 3, C.stone3); k.rect(-48, -63, 20, 8, '#2a2a2e'); for (let i = 0; i < 12; i++) k.px(-47 + P.hash(i, 40) * 18, -63 + P.hash(i, 41) * 7, i % 3 ? '#4a4a52' : '#6a6a72'); k.ellipse(-38, -63, 8, 3, '#2a2a2e');
      k.ellipse(-36, -46, 14, 2, C.shadow);
      for (const x of [-20, 6]) { k.rect(x, -84, 3, 36, C.wood2); k.rect(x, -84, 1, 36, C.wood4); }
      for (let r = 0; r < 3; r++) { k.rect(-22, -76 + r * 10, 32, 2, C.wood1); for (let i = 0; i < 7; i++) { k.rect(-18 + i * 3.5, -80 + r * 10, 2, 4, r === 1 ? C.terra2 : C.slate2); k.px(-18 + i * 3.5, -80 + r * 10, r === 1 ? C.terra4 : C.slate4); } }
      k.ellipse(-4, -46, 16, 2, C.shadow);
      // Timber stack on trestles.
      for (let r = 0; r < 4; r++) { const y = -58 - r * 5; k.rect(14 + r, y, 34 - r * 2, 4, r % 2 ? C.wood3 : C.wood4); k.rect(14 + r, y, 34 - r * 2, 1, C.wood5); for (let i = 0; i < 4 - (r >> 1); i++) { k.circle(15 + r + i * 9, y + 2, 2, C.wood2); k.px(15 + r + i * 9, y + 2, C.wood4); } }
      k.rect(16, -54, 3, 6, C.wood1); k.rect(42, -54, 3, 6, C.wood1); k.rect(12, -48, 36, 2, C.shadow);
      // Hoist gantry (hook and load animate).
      k.line(HOIST.x - 14, HOIST.y + 12, HOIST.x - 6, HOIST.y - 62, C.wood2, 2); k.line(HOIST.x + 14, HOIST.y + 12, HOIST.x + 6, HOIST.y - 62, C.wood1, 2);
      k.rect(HOIST.x - 10, HOIST.y - 64, 20, 3, C.wood3); k.rect(HOIST.x - 10, HOIST.y - 64, 20, 1, C.wood4); k.circle(HOIST.x, HOIST.y - 60, 2, C.slate1);
      k.line(HOIST.x - 12, HOIST.y - 20, HOIST.x + 12, HOIST.y - 20, C.wood1);
      k.rect(HOIST.x + 12, HOIST.y - 4, 6, 6, C.slate1); k.circle(HOIST.x + 15, HOIST.y - 1, 2, C.slate2);
      Props.tree(k, -14, -112, 'oak', 1, 2);

      /* ---- Repair shed (top right) ---- */
      const sx0 = 52, sx1 = 160, sb = -50;   // kept inside the hexagon edge
      k.rect(sx0 + 4, sb, sx1 - sx0, 3, C.shadow);
      Props.planks(k, sx0, sb - 48, sx1 - sx0, 48, C.wood2);
      k.rect(sx0, sb - 48, sx1 - sx0, 48, '#00000030');
      // Pegboard of tools.
      k.rect(sx0 + 8, sb - 44, 58, 20, C.wood1); k.rect(sx0 + 9, sb - 43, 56, 18, C.wood3);
      for (let y = sb - 41; y < sb - 26; y += 4) for (let x = sx0 + 11; x < sx0 + 64; x += 4) k.px(x, y, C.wood1);
      ['saw', 'hammer', 'axe', 'tongs', 'pick', 'hammer', 'hoe'].forEach((kind, i) => tool(k, sx0 + 12 + i * 7 + (kind === 'saw' ? 0 : 3), sb - 41 + (kind === 'saw' ? 12 : 0), kind));
      // Workbench with vise, clamped board and loose parts.
      k.rect(sx0 + 6, sb - 20, 60, 5, C.wood4); k.rect(sx0 + 6, sb - 20, 60, 1, C.wood5); k.rect(sx0 + 6, sb - 15, 60, 2, C.wood1);
      k.rect(sx0 + 8, sb - 13, 3, 13, C.wood1); k.rect(sx0 + 61, sb - 13, 3, 13, C.wood1); k.rect(sx0 + 8, sb - 6, 56, 2, C.wood2);
      k.rect(sx0 + 12, sb - 24, 6, 4, C.slate2); k.rect(sx0 + 11, sb - 25, 8, 1, C.slate3); k.rect(sx0 + 20, sb - 23, 22, 3, C.wood3); k.rect(sx0 + 20, sb - 23, 22, 1, C.wood5);
      for (let i = 0; i < 5; i++) k.px(sx0 + 46 + i * 3, sb - 21, i % 2 ? C.slate3 : C.gold2);
      k.rect(sx0 + 14, sb - 5, 8, 5, C.wood3); k.rect(sx0 + 40, sb - 5, 10, 5, C.slate1);
      // A broken cart wheel leaning on the wall, and spare spokes.
      k.ring(sx0 + 76, sb - 22, 11, 11, C.wood1); k.ring(sx0 + 76, sb - 22, 10, 10, C.wood3); for (let i = 0; i < 5; i++) { const a = i * 1.26 + .3; k.line(sx0 + 76, sb - 22, sx0 + 76 + Math.cos(a) * 9, sb - 22 + Math.sin(a) * 9, C.wood2); } k.circle(sx0 + 76, sb - 22, 2, C.slate2);
      for (let i = 0; i < 4; i++) k.line(sx0 + 100 + i * 2, sb - 2, sx0 + 102 + i * 2, sb - 18, C.wood4);
      // Grindstone frame (the stone spins in animate).
      k.rect(GRIND.x - 8, GRIND.y + 2, 2, 12, C.wood1); k.rect(GRIND.x + 6, GRIND.y + 2, 2, 12, C.wood1); k.rect(GRIND.x - 8, GRIND.y + 8, 16, 2, C.wood2); k.rect(GRIND.x - 6, GRIND.y + 7, 12, 4, C.water1);
      // Shed roof slab and posts.
      k.rect(sx0 - 4, sb - 64, sx1 - sx0 + 6, 16, C.terra1);
      for (let x = sx0 - 4; x < sx1 + 2; x += 5) { k.rect(x, sb - 64, 3, 14, C.terra2); k.px(x, sb - 64, C.terra4); k.px(x + 1, sb - 58, C.terra3); }
      k.rect(sx0 - 4, sb - 64, sx1 - sx0 + 6, 1, C.terra4); k.rect(sx0 - 4, sb - 50, sx1 - sx0 + 6, 2, C.terra0);
      for (const x of [sx0 - 2, sx0 + 70, sx1 - 3]) { k.rect(x, sb - 48, 3, 48, C.wood2); k.rect(x, sb - 48, 1, 48, C.wood4); k.rect(x + 2, sb - 48, 1, 48, C.wood0); }
      Props.hangingSign(k, sx0 + 88, sb - 48, 'FIX', C.teal1);
      
      // Tool rack for the field crews, by the road.
      k.rect(22, -42, 34, 3, C.wood2); k.rect(22, -42, 34, 1, C.wood4); for (const x of [22, 53]) k.rect(x, -42, 3, 16, C.wood1);
      ['axe', 'axe', 'pick', 'pick', 'hoe', 'hoe'].forEach((kind, i) => tool(k, 26 + i * 5, -40, kind));
      k.rect(20, -26, 38, 2, C.shadow);

      /* ---- Haul track (middle right): timber skids where the rope crew drags cut stone ---- */
      k.ditherPoly([[70, -22], [190, -22], [190, -2], [66, -2]], C.dirt1, 1);
      for (let i = 0; i < 14; i++) k.px(76 + P.hash(i, 71) * 110, -21 + P.hash(i, 72) * 18, i % 3 ? C.stone3 : C.stone4);
      for (let x = 76; x < 190; x += 9) { k.rect(x, -17, 3, 11, C.wood1); k.px(x, -17, C.wood3); k.rect(x + 3, -16, 1, 10, C.shadow); }
      k.rect(74, -17, 116, 2, C.wood2); k.rect(74, -17, 116, 1, C.wood4);
      k.rect(75, -5, 115, 1, C.shadow); k.rect(74, -8, 116, 3, C.wood3); k.rect(74, -8, 116, 1, C.wood5); k.rect(74, -6, 116, 1, C.wood1);
      // Finished blocks stacked at the end of the track, with mallet and chisel.
      k.rect(174, -21, 18, 3, C.shadow);
      for (const [x, y, w] of [[172, -22, 18], [175, -32, 13]]) { k.rect(x, y - 10, w, 10, C.stone2); k.rect(x, y - 10, w, 3, C.stone4); k.rect(x, y - 10, w, 1, C.stone5); k.rect(x + w - 2, y - 7, 2, 7, C.stone1); k.rect(x, y - 1, w, 1, C.stone1); k.px(x + 4, y - 4, C.stone1); k.px(x + 9, y - 5, C.stone1); }
      k.rect(160, -40, 3, 5, C.wood3); k.rect(158, -42, 7, 3, C.wood2); k.line(166, -38, 170, -36, C.slate3);
      // Water bucket and ladle for the haulers.
      k.ellipse(183, -1, 5, 1, C.shadow); k.rect(179, -8, 8, 7, C.wood2); k.rect(179, -8, 8, 1, C.wood4); k.rect(179, -5, 8, 1, C.slate1); k.rect(180, -8, 6, 1, C.water2); k.line(184, -9, 188, -13, C.wood4);

      /* ---- Cutaway bunkhouse (bottom left) ---- */
      // Back wall inner face (roof removed), side walls and the low cut front wall.
      k.rect(BH.x0 - 5, 12, BH.x1 - BH.x0 + 10, 3, C.plaster3);
      k.rect(BH.x0 - 5, 15, BH.x1 - BH.x0 + 10, BH.y0 - 15, C.plaster1);
      for (let x = BH.x0; x < BH.x1; x += 18) k.rect(x, 15, 2, BH.y0 - 15, C.wood1);
      k.rect(BH.x0 - 5, 15, BH.x1 - BH.x0 + 10, 2, C.wood1); k.rect(BH.x0 - 5, BH.y0 - 2, BH.x1 - BH.x0 + 10, 2, C.wood0);
      for (const x of [-170, -116, -62]) { k.rect(x, 18, 10, 9, C.wood0); k.rect(x + 1, 19, 8, 7, C.glass); k.rect(x + 1, 19, 8, 2, C.white); k.rect(x + 5, 19, 1, 7, C.wood0); k.rect(x - 1, 27, 12, 1, C.wood3); }
      k.rect(-146, 18, 8, 10, C.wood2); for (let i = 0; i < 4; i++) k.rect(-145 + i * 2, 20, 1, 7, BLANKET[i]);
      Props.planks(k, BH.x0, BH.y0, BH.x1 - BH.x0, BH.y1 - BH.y0, C.wood3);
      k.rect(BH.x0, BH.y0, BH.x1 - BH.x0, 3, '#00000030');
      for (const x of [BH.x0 - 5, BH.x1]) { k.rect(x, 12, 5, BH.y1 - 8, C.plaster1); k.rect(x, 12, 5, 1, C.plaster3); k.rect(x + 1, 13, 3, BH.y1 - 10, C.plaster3); k.rect(x, 12, 1, BH.y1 - 8, C.plaster0); k.rect(x + 4, 12, 1, BH.y1 - 8, C.plaster0); }
      k.rect(BH.x1 + 5, 16, 3, BH.y1 - 6, C.shadow);
      // The west wall runs along the hexagon's slanted edge (half-width 204 - 0.4 y below the side point).
      for (let y = 12; y < BH.y1 + 8; y++) { const x = Math.round(-(204 - .4 * y)) + 1; k.rect(x, y, 6, 1, C.plaster1); k.px(x, y, C.plaster0); k.rect(x + 1, y, 3, 1, C.plaster3); k.px(x + 5, y, C.plaster0); k.px(x + 6, y, '#00000030'); }
      const door = [-84, -66];
      for (const [a, b] of [[BH.x0 - 5, door[0]], [door[1], BH.x1 + 5]]) { k.rect(a, BH.y1, b - a, 3, C.plaster3); k.rect(a, BH.y1 + 3, b - a, 5, C.plaster1); k.rect(a, BH.y1 + 3, b - a, 1, C.plaster0); for (let x = a + 6; x < b; x += 14) k.rect(x, BH.y1 + 3, 2, 5, C.wood1); k.rect(a, BH.y1 + 8, b - a, 2, C.stone2); }
      k.rect(door[0], BH.y1 + 2, door[1] - door[0], 8, C.wood2); k.rect(door[0], BH.y1 + 2, door[1] - door[0], 1, C.wood4);
      Props.hangingSign(k, -124, BH.y1 + 2, 'BUNKS', C.wood1);
      // Beds: headboard, sheets, pillow, blanket, footboard.
      BEDS.forEach(([x, y], i) => {
        k.rect(x + 2, y + 25, 18, 2, '#00000030');
        k.rect(x, y, 18, 5, C.wood1); k.rect(x, y, 18, 1, C.wood3); k.rect(x + 1, y + 1, 1, 3, C.wood4);
        k.rect(x + 1, y + 5, 16, 20, C.paper); k.rect(x + 1, y + 5, 1, 20, C.white);
        k.rect(x + 4, y + 6, 10, 4, C.white); k.rect(x + 4, y + 9, 10, 1, C.paper2);
        const b = BLANKET[i]; k.rect(x + 1, y + 12, 16, 12, b); k.rect(x + 1, y + 12, 16, 2, S(b, .35)); k.rect(x + 16, y + 12, 1, 12, S(b, -.3)); for (let j = 0; j < 16; j += 4) k.px(x + 2 + j, y + 18, S(b, -.2));
        k.rect(x, y + 24, 18, 3, C.wood2); k.rect(x, y + 24, 18, 1, C.wood4);
      });
      // Foot lockers, boots, a stove with pipe, a table and a rag rug in the aisle.
      for (let i = 0; i < 5; i++) { const x = -170 + i * 24; k.rect(x, 66, 14, 6, C.wood2); k.rect(x, 66, 14, 1, C.wood4); k.px(x + 7, 68, C.gold2); if (i % 2) { k.rect(x + 16, 68, 2, 3, C.wood0); k.rect(x + 19, 69, 2, 2, C.wood0); } }
      k.ellipse(-130, 86, 30, 6, '#8a4a3a'); k.ring(-130, 86, 26, 5, C.gold1); k.ring(-130, 86, 20, 4, '#6a7ab0'); k.ellipse(-130, 86, 12, 2, '#a85a6a');
      Props.table(k, -118, 94, 16, 8, C.wood3); k.rect(-112, 82, 3, 4, C.paper); k.px(-111, 81, C.gold3);
      k.rect(-98, 96, 20, 22, C.stone1); k.rect(-98, 96, 20, 3, C.stone3); k.rect(-94, 104, 12, 8, '#2a1a14'); k.rect(-90, 80, 4, 16, C.slate1); k.rect(-90, 80, 1, 16, C.slate3);
      k.rect(-72, 100, 18, 30, C.wood1); k.rect(-71, 101, 16, 28, C.wood2); k.rect(-64, 101, 1, 28, C.wood1); k.px(-66, 114, C.gold3); k.px(-62, 114, C.gold3);
      for (let i = 0; i < 2; i++) { k.rect(-142 + i * 24, 128, 3, 3, C.wood0); k.rect(-138 + i * 24, 129, 3, 2, C.wood0); }

      /* ---- Water pump and noticeboard between the quarters ---- */
      k.rect(-38, 30, 10, 6, C.stone2); k.rect(-38, 30, 10, 1, C.stone4); k.rect(-37, 31, 8, 3, C.water2);
      k.rect(-32, 12, 4, 18, C.slate1); k.rect(-32, 12, 1, 18, C.slate3); k.line(-30, 14, -22, 10, C.slate2, 2); k.rect(-34, 18, 2, 4, C.slate1);
      k.rect(24, 4, 3, 26, C.wood1); k.rect(36, 4, 3, 26, C.wood1); k.rect(20, -2, 23, 14, C.wood2); k.rect(21, -1, 21, 12, C.wood4);
      for (let i = 0; i < 4; i++) { k.rect(22 + i * 5, 0 + (i % 2) * 3, 4, 5, i % 2 ? C.paper : C.paper2); k.px(23 + i * 5, 0 + (i % 2) * 3, C.red2); }
      k.ellipse(34, 31, 9, 2, C.shadow);
      // Direction sign to the southern work sites.
      k.rect(-30, 104, 2, 30, C.wood1); k.rect(-30, 104, 1, 30, C.wood3);
      [['WOOD', 106, C.leaf1], ['MINE', 114, C.slate1], ['FARM', 122, C.gold0]].forEach(([s, y, c], i) => { const x = i === 1 ? -44 : -28; k.rect(x, y, 18, 7, C.wood0); k.rect(x + 1, y + 1, 16, 5, C.wood4); if (i === 1) k.px(x - 1, y + 3, C.wood0); else k.px(x + 18, y + 3, C.wood0); k.text(s, x + 2, y + 1, c); });
      k.ellipse(-28, 134, 5, 1, C.shadow);
      lampPost(k, 26, 128); lampPost(k, -34, 50);

      /* ---- Dining pergola (bottom right) ---- */
      Props.tiles(k, PG.x0, PG.y0 + 14, PG.x1 - PG.x0, PG.y1 - PG.y0 - 14, C.terra3, S(C.terra3, -.1), 6);
      for (let y = PG.y0 + 14; y < PG.y1; y += 6) k.rect(PG.x0, y, PG.x1 - PG.x0, 1, C.terra2);
      // Kitchen along the back: dresser of crockery, brick range with a cauldron, water barrel.
      k.rect(52, 22, 56, 30, C.wood1); k.rect(53, 23, 54, 28, C.wood3);
      for (let r = 0; r < 3; r++) { k.rect(53, 31 + r * 8, 54, 2, C.wood1); for (let i = 0; i < 9; i++) { const x = 56 + i * 6; if (r === 2) { k.rect(x, 43 + 2, 4, 3, i % 2 ? C.terra2 : C.stone4); k.px(x, 45, C.white); } else { k.ellipse(x + 2, 27 + r * 8, 2, 3, i % 3 ? C.stone5 : '#8fb0d8'); k.px(x + 1, 25 + r * 8, C.white); } } }
      k.rect(52, 52, 56, 2, C.shadow);
      k.rect(142, 22, 38, 32, C.terra1); k.rect(142, 22, 38, 3, C.terra3); for (let y = 27; y < 54; y += 4) { k.rect(142, y, 38, 1, C.terra0); k.px(146 + (y % 8 ? 0 : 6), y + 2, C.terra0); }
      k.rect(148, 36, 12, 12, '#2a1a14'); k.rect(147, 35, 14, 1, C.stone2); k.rect(162, 16, 6, 10, C.slate1); k.rect(162, 16, 2, 10, C.slate3); k.rect(161, 14, 8, 2, C.slate2);
      k.ellipse(170, 24, 8, 3, C.slate0); k.ellipse(170, 23, 6, 2, '#b8683a'); k.rect(164, 24, 12, 5, C.slate0); k.rect(164, 24, 2, 5, C.slate2);
      k.rect(112, 38, 30, 6, C.wood4); k.rect(112, 38, 30, 1, C.wood5); k.rect(114, 44, 2, 8, C.wood1); k.rect(138, 44, 2, 8, C.wood1);
      k.circle(120, 36, 3, '#d8a86a'); k.px(119, 35, C.wood5); k.rect(126, 34, 6, 4, C.leaf3); k.px(127, 33, C.leaf4); k.rect(134, 33, 4, 5, C.stone3);
      Props.barrel(k, 108, 50);
      // Front bench (empty) in front of the long table.
      Props.bench(k, 64, 112, 90);
      // Pergola posts, back beam and vines (the front-right post stands on the hexagon edge).
      for (const [x, y] of [[PG.x0, PG.y0 + 14], [PG.x1 - 9, PG.y0 + 14], [PG.x0, PG.y1], [140, PG.y1]]) { k.rect(x, y - 38, 4, 38, C.wood2); k.rect(x, y - 38, 1, 38, C.wood4); k.rect(x + 3, y - 38, 1, 38, C.wood0); k.rect(x - 1, y - 2, 6, 2, C.stone2); }
      k.rect(PG.x0 - 4, PG.y0 - 26, PG.x1 - PG.x0 + 8, 4, C.wood3); k.rect(PG.x0 - 4, PG.y0 - 26, PG.x1 - PG.x0 + 8, 1, C.wood5); k.rect(PG.x0 - 4, PG.y0 - 22, PG.x1 - PG.x0 + 8, 1, C.wood0);
      for (let x = PG.x0 - 2; x < PG.x1 + 4; x += 10) { k.rect(x, PG.y0 - 29, 3, 3, C.wood3); k.px(x, PG.y0 - 29, C.wood5); }
      for (let i = 0; i < 30; i++) { const x = PG.x0 - 2 + i * 5, y = PG.y0 - 24 + Math.round(Math.sin(i * 1.7) * 2); k.rect(x, y, 3, 2, i % 3 ? C.leaf2 : C.leaf3); if (i % 4 === 0) k.rect(x + 1, y + 2, 1, 3 + (i % 3), C.leaf1); if (i % 7 === 3) k.px(x + 1, y, '#e98aa0'); }
      for (const [x, y1] of [[PG.x0 + 1, PG.y1 - 4], [PG.x1 - 8, PG.y0 + 10]]) for (let y = PG.y0 - 18; y < y1; y += 5) k.px(x + (y % 2), y, y % 3 ? C.leaf2 : C.leaf4);
      Props.flowerBed(k, 50, 142, 44, 7, ['#f2c14e', '#e46c52', '#f6ecd0'], 11); Props.flowerBed(k, 98, 142, 40, 7, ['#c3a2c0', '#f2c14e', '#f6ecd0'], 12);

      /* ---- Trees and margins ---- */
      Props.tree(k, 186, -126, 'oak', 1, 1); Props.tree(k, 120, -126, 'dark', 0, 2); Props.tree(k, -50, -120, 'pine', 0, 1);
      Props.bush(k, -40, -30, 0); Props.bush(k, 188, 30, 2); Props.bush(k, -52, 144, 1);
      Props.logPile(k, -186, 4, 4);
    },
    front(k) {
      // The long mess table sits in front of the diners on the back bench.
      const x = 62, y = 88, w = 104;
      k.rect(x + 2, y + 13, w, 2, C.shadow);
      k.rect(x, y, w, 8, C.wood4); k.rect(x, y, w, 1, C.wood5); k.rect(x, y + 8, w, 3, C.wood2); k.rect(x, y + 10, w, 1, C.wood0);
      for (let i = 0; i < w; i += 13) k.rect(x + i, y + 1, 1, 7, C.wood3);
      k.rect(x + 2, y + 11, 3, 4, C.wood1); k.rect(x + w - 5, y + 11, 3, 4, C.wood1); k.rect(x + w / 2 - 1, y + 11, 3, 4, C.wood1);
      for (let i = 0; i < 6; i++) { const px = x + 8 + i * 17; k.ellipse(px, y + 3, 4, 2, C.stone5); k.ellipse(px, y + 3, 2, 1, i % 2 ? '#b8683a' : C.leaf3); k.rect(px + 5, y + 1, 2, 3, i % 2 ? C.stone3 : C.wood3); }
      k.rect(x + 46, y + 1, 12, 5, C.slate0); k.rect(x + 46, y + 1, 12, 1, C.slate2); k.ellipse(x + 52, y + 1, 5, 1, '#c8844a');
      k.ellipse(x + 30, y + 6, 5, 2, '#d8a86a'); k.px(x + 28, y + 5, C.wood5); k.rect(x + 74, y, 3, 5, C.terra2); k.px(x + 74, y, C.terra4);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting', idle = state === 'idle';

      /* Flume water and the wheel: turning while working, still when idle, jammed when broken. */
      const flow = run ? 1 : idle || wait ? .35 : err ? .6 : 0;
      if (flow) { for (let i = 0; i < 4; i++) { const p = (t * .9 * flow + i / 4) % 1; k.px(-188 + p * 25, -139 + p * 47, C.water5); } }
      const wf = run ? Math.floor(t * 10) % 8 : err ? Math.floor(t * 6) % 2 : 0;
      k.blit(wheel(wf), WHEEL.x, WHEEL.y);
      if (err) { k.line(WHEEL.x - 4, WHEEL.y - 12, WHEEL.x + 6, WHEEL.y - 20, C.wood0, 2); if (Math.floor(t * 3) % 2) k.rect(WHEEL.x - 2, WHEEL.y - 30, 4, 4, C.error); }
      if (flow) {
        const n = run ? 6 : 3;
        for (let i = 0; i < n; i++) { const p = (t * 1.6 + i / n) % 1; k.rect(-160 + (err ? p * 12 : p * 3), -90 + p * (err ? 40 : 14), 2, 2, i % 2 ? C.water4 : C.foam); }
        if (run) for (let i = 0; i < 3; i++) { const q = (t * 1.2 + i / 3) % 1; k.alpha(1 - q, () => k.ring(WHEEL.x + 4, -50, 3 + q * 8, 1 + q * 2, C.foam)); }
        if (err) k.ellipse(-140, -40, 8, 2, C.water3);
      }

      /* Forge mouth: roaring, banked, flaring or cold. */
      const hx = MOUTH.x + 17, hy = MOUTH.y + 20;
      if (run) { k.alpha(.3 + Math.sin(t * 11) * .08, () => k.rect(MOUTH.x + 2, MOUTH.y + 8, MOUTH.w - 4, MOUTH.h - 8, C.gold2)); Props.fire(k, hx, hy, t, 1.2); k.rect(MOUTH.x + 10, MOUTH.y + 16, 14, 2, C.gold3); }
      else if (idle || wait) { k.rect(MOUTH.x + 10, MOUTH.y + 17, 14, 3, C.red1); for (let i = 0; i < 4; i++) k.px(MOUTH.x + 11 + i * 3, MOUTH.y + 17 + (i % 2), Math.floor(t * 2 + i) % 3 ? C.red3 : C.gold2); }
      else if (err) { Props.fire(k, hx, hy, t * 1.5, 1.5); for (let i = 0; i < 6; i++) { const q = (t * 1.4 + i / 6) % 1; k.px(hx + Math.sin(i * 2.7) * q * 24, hy - 4 - q * 18 + q * q * 20, q < .6 ? C.gold4 : C.red3); } }
      // Bellows pump.
      const bl = run ? Math.round(Math.abs(Math.sin(t * 4)) * 3) : 0;
      k.poly([[MOUTH.x + 28, MOUTH.y + 24], [MOUTH.x + 37, MOUTH.y + 21 - bl], [MOUTH.x + 37, MOUTH.y + 27]], C.wood3); k.line(MOUTH.x + 28, MOUTH.y + 24, MOUTH.x + 37, MOUTH.y + 21 - bl, C.wood1);
      // Chimney smoke.
      if (run) Props.smoke(k, -81, -154, t, 5);
      else if (idle || wait) Props.smoke(k, -81, -154, t * .4, 2, '#c8c4bc');
      else if (err) { Props.smoke(k, -81, -154, t * 1.3, 7, '#3e3a38'); Props.smoke(k, MOUTH.x + 18, MOUTH.y, t * 1.1, 3, '#5a5652'); }
      // Workpiece glowing on the anvil.
      if (run) { k.rect(ANVIL.x - 5, ANVIL.y - 21, 9, 2, Math.floor(t * 9) % 2 ? C.gold3 : '#f07a32'); k.px(ANVIL.x - 5, ANVIL.y - 21, C.gold4); }
      else if (live) k.rect(ANVIL.x - 5, ANVIL.y - 21, 9, 2, C.slate2);
      // Quench trough steam after strikes.
      if (run && Math.floor(t * .7) % 2) Props.smoke(k, -52, -14, t * 1.5, 3, '#e8ecef');

      /* Hoist: a crate of bars rises and lowers while working. */
      const hookY = run ? HOIST.y - 42 + Math.round((Math.sin(t * .9) * .5 + .5) * 30) : HOIST.y - 26;
      k.line(HOIST.x, HOIST.y - 58, HOIST.x, hookY, C.stone1); k.rect(HOIST.x - 1, hookY, 3, 2, C.slate2); k.px(HOIST.x + 1, hookY + 2, C.slate2);
      if (run || wait) { k.rect(HOIST.x - 6, hookY + 3, 12, 8, C.wood3); k.rect(HOIST.x - 6, hookY + 3, 12, 1, C.wood5); k.rect(HOIST.x - 6, hookY + 7, 12, 1, C.wood1); k.line(HOIST.x, hookY + 2, HOIST.x - 6, hookY + 3, C.stone1); k.line(HOIST.x, hookY + 2, HOIST.x + 5, hookY + 3, C.stone1); }
      else if (err) { k.rect(HOIST.x - 7, HOIST.y + 4, 12, 7, C.wood3); k.line(HOIST.x - 9, HOIST.y + 12, HOIST.x + 10, HOIST.y + 8, C.slate3); k.line(HOIST.x - 4, HOIST.y + 14, HOIST.x + 12, HOIST.y + 12, C.slate2); }
      k.px(HOIST.x + 15, HOIST.y - 1 - (run ? Math.floor(t * 6) % 2 : 0), C.slate4);

      /* Grindstone in the repair shed. */
      k.blit(grindstone(run ? Math.floor(t * 12) % 4 : 0), GRIND.x, GRIND.y);
      if (run && z.detail) for (let i = 0; i < 4; i++) { const q = (t * 3 + i / 4) % 1; k.px(GRIND.x - 6 - q * 10, GRIND.y - 3 + q * 6 - Math.sin(q * 3) * 3, q < .5 ? C.gold4 : C.gold2); }

      /* Bunkhouse sleepers: heads on pillows, blankets pulled up. */
      (SLEEPERS[state] || []).forEach(i => {
        const [x, y] = BEDS[i], b = BLANKET[i], br = Math.floor(t * 1.2 + i) % 2;
        k.rect(x + 6, y + 5, 6, 5, [C.skin1, C.skin2, C.skin3][i % 3]); k.rect(x + 6, y + 5, 6, 2, ['#4a3226', '#2a1c16', '#8a5a2a', '#c4652e'][i % 4]); k.px(x + 7, y + 8, C.ink); k.px(x + 10, y + 8, C.ink);
        k.rect(x + 2, y + 10, 14, 4, S(b, .2)); k.rect(x + 3, y + 13, 12, 8 + br, S(b, .1)); k.rect(x + 2, y + 10, 14, 1, S(b, .45));
        if (!live || state === 'idle') { const q = (t * .4 + i * .3) % 1; k.alpha(1 - q, () => k.text('z', x + 13 + q * 4, y + 2 - q * 8, '#c8d4ff')); }
      });

      /* Kitchen: stew steam and stove glow; lamps and string lights. */
      if (live && !err) { k.rect(149, 44, 10, 3, run ? C.gold2 : C.red1); Props.smoke(k, 170, 20, t * (run ? 1 : .5), run ? 3 : 2, '#eef0ee'); }
      if (live) Props.smoke(k, 165, 12, t * .6, run ? 3 : 1, err ? '#4a4642' : '#cfcac2');
      if (live) { k.line(PG.x0 + 2, PG.y1 - 36, 160, PG.y1 - 36, C.ink); for (let i = 0; i < 8; i++) { const x = PG.x0 + 8 + i * 14; k.rect(x, PG.y1 - 35 + (i % 2), 2, 2, (!err || Math.floor(t * 4 + i) % 2) ? (i % 3 ? C.glassLit : '#ffb870') : C.glassDark); } }
      for (const [x, y] of [[26, 128], [-34, 50]]) k.rect(x - 1, y - 20, 4, 3, live && !run ? C.glassLit : live ? S(C.glassLit, -.2) : C.glassDark);

      /* Status lamp on the forge corner and the waiting pile. */
      const lampOn = live && (!err || Math.floor(t * 4) % 2);
      k.rect(-62, -72, 6, 6, C.ink); k.rect(-61, -71, 4, 4, lampOn ? C[state] : C.slate1); if (lampOn && run && Math.floor(t * 2) % 2) k.px(-60, -70, C.white);
      if (wait) {
        // Finished parts crated and stacked by the road, tagged HOLD, waiting for sign-off.
        for (let i = 0; i < 3; i++) Props.crate(k, -30 + i * 10, -22, 9); Props.crate(k, -25, -31, 9); Props.crate(k, -15, -31, 8);
        k.line(-30, -26, -2, -26, C.waiting); k.rect(-28, -44, 24, 9, C.ink); k.rect(-27, -43, 22, 7, C.waiting); k.text('HOLD', -24, -42, C.ink);
        Props.banner(k, -58, -48, C.waiting, t, 10);
      }
      if (err) {
        // Tools and scrap scattered across the yard.
        for (let i = 0; i < 5; i++) { const x = -60 + i * 19, y = 10 + (i % 2) * 8; k.line(x, y, x + 8, y - 3 + (i % 3), C.wood3); k.rect(x + 7, y - 4 + (i % 3), 3, 3, C.slate2); }
        k.rect(-12, 14, 6, 3, C.slate2); k.rect(-26, 20, 4, 2, C.gold1);
      }

      /* Haul yard: overseer, block on rollers and the rope crew. */
      let fx = null;
      const hauler = (i, x, y, o) => z.crew(x, y, { look: HAULER[i].look, hat: HAULER[i].hat, hatColor: HAULER[i].hc, ...o });
      if (run) {
        const cyc = t / WT - CRACK_AT, nCr = Math.floor(cyc), tc = (cyc - nCr) * WT;   // seconds since the last crack
        const ph = (t / WT) % 1, fi = Math.floor(ph * NF) % NF, fr = WHIP[fi];
        const hv = Math.round(tc < .15 ? tc / .15 * 3 : Math.max(0, 3 - (tc - .15) * 2.4)); // heave after each crack
        const flinch = tc < .1 ? 2 : tc < .22 ? 1 : 0, boost = nCr * .3 + Math.min(.3, tc * .6), bx = BLK.x + hv;
        const rf = Math.floor((t + boost * 2) * 8) % 4;
        for (const dx of [4, 14, 24]) k.blit(roller(rf), bx + dx, -10);
        k.blit(roller(rf), bx - 6, -10);
        k.blit(block(), bx, BLK.y);
        if (z.detail && tc < .5) { const u = tc / .5; k.alpha((1 - u) * .7, () => { for (let i = 0; i < 3; i++) k.circle(bx - 3 - u * 6 - i * 3, -9 - u * 4 + i, 1 + u * 2, C.dirt4); }); }
        // Taut ropes run over the haulers' shoulders.
        for (const [r, ry] of [[0, -24], [2, -19]]) { const y1 = HAUL[r][1] - flinch - 11, x1 = HAUL[r + 1][0] + hv - 2; k.line(bx + 28, ry + 1, x1, y1 + 1, C.wood0); k.line(bx + 28, ry, x1, y1, '#ecd8a0'); }
        HAUL.forEach(([x, y], i) => hauler(i, x + hv, y - flinch, { anim: 'walk', facing: 1, phase: i * .3 + boost * 8 / 7 }));
        // Sweat: a steady drip, and a spray on every crack.
        if (z.detail) HAUL.forEach(([x, y], i) => {
          const q = (t * 1.1 + i * .37) % 1;
          if (q < .5) { const u = q / .5, sx = x + hv - 2 - u * 5, sy = y - flinch - 20 - Math.sin(u * Math.PI) * 3 + u * 9; k.px(sx, sy, C.water5); k.px(sx, sy + 1, C.water3); }
          if (tc < .4) { const u = tc / .4; for (const s of [-1, 1]) { const sx = x + hv + 1 + s * (3 + u * 5), sy = y - flinch - 21 - Math.sin(u * Math.PI) * 5 + u * 6; k.px(sx, sy, C.white); k.px(sx, sy + 1, C.water4); } }
        });
        k.ellipse(OVS.x + 2, OVS.y, 9, 2, C.shadow);
        k.blit(overseer(fr.pose), OVS.x, OVS.y);
        // Swoosh trail behind the tip while the lash unrolls forward.
        if (z.detail && ph > .4 && ph < CRACK_AT + .01) k.alpha(.55, () => { const a = WHIP[(fi + NF - 2) % NF].pts[NW - 1], b = WHIP[(fi + NF - 1) % NF].pts[NW - 1], c = fr.pts[NW - 1]; k.line(OVS.x + a[0], OVS.y + a[1], OVS.x + b[0], OVS.y + b[1], C.white); k.line(OVS.x + b[0], OVS.y + b[1], OVS.x + c[0], OVS.y + c[1], C.white); });
        drawWhip(k, fr.pts, OVS.x, OVS.y);
        // The crack: a burst in the air above the crew and a pop of text.
        const cp = KEYS[8].pts[NW - 1], cx = OVS.x + Math.round(cp[0]), cy = OVS.y + Math.round(cp[1]);
        fx = () => {   // drawn last so the shed crew never hides it
          if (tc < .13) k.blit(burst(Math.min(2, Math.floor(tc / .045))), cx, cy);
          if (tc < .5) k.blit(crackText(), cx - 10, cy - 13 - Math.round(tc * 10), false, tc > .35 ? (.5 - tc) / .15 : 1);
        };
      } else if (live) {
        const bx = err ? BLK.x - 9 : BLK.x;
        if (err) { k.blit(roller(1), bx + 8, -10); k.blit(roller(2), bx + 20, -10); k.blit(roller(3), 104, -4); k.blit(roller(0), 118, -6); }
        else for (const dx of [-6, 4, 14, 24]) k.blit(roller(0), bx + dx, -10);
        k.blit(block(), bx, BLK.y);
        if (idle) {
          slackRope(k, bx + 28, -24, 146, -8); slackRope(k, bx + 28, -16, 166, -4);
          hauler(0, bx + 8, BLK.y - 18, { anim: 'sit' }); hauler(1, bx + 20, BLK.y - 18, { anim: 'sit', facing: -1 });
          hauler(2, 124, -4, { anim: 'sit', facing: -1 }); hauler(3, 146, -8, { anim: 'idle', facing: -1 });
          k.ellipse(OVS.x + 2, OVS.y, 9, 2, C.shadow); k.blit(overseer('idle'), OVS.x, OVS.y);
        } else if (wait) {
          // Block halted under an amber flag; ropes slack in the crew's hands; the overseer taps his coiled whip.
          k.rect(bx + 24, -46, 1, 16, C.wood1); const fw = Math.floor(t * 3) % 2;
          k.poly([[bx + 25, -46], [bx + 33, -43 + fw], [bx + 25, -40]], C.waiting); k.rect(bx + 25, -46, 3, 1, S(C.waiting, .4)); k.px(bx + 24, -47, C.gold3);
          HAUL.forEach(([x, y], i) => { slackRope(k, bx + 28, i < 2 ? -24 : -16, x - 4, y - 9); hauler(i, x, y, { anim: 'idle', facing: -1, phase: i * .4 }); });
          k.ellipse(OVS.x + 2, OVS.y, 9, 2, C.shadow); k.blit(overseer(Math.floor(t * 2.5) % 2 ? 'tap1' : 'tap0'), OVS.x, OVS.y);
        } else {
          // Rope snapped, the block slid back off its rollers, the whip tangled round the overseer.
          Props.smoke(k, bx - 2, -10, t * 1.4, 3, '#8a8478');
          k.path([[bx + 28, -24], [bx + 31, -19], [bx + 32, -13]], C.wood4); k.px(bx + 31, -12, C.wood5); k.px(bx + 33, -12, C.wood5);
          k.path([[118, -9], [126, -11], [136, -10], [152, -9]], C.wood4); k.px(117, -10, C.wood5); k.px(117, -8, C.wood5);
          HAUL.forEach(([x, y], i) => hauler(i, x + 4, y, { anim: i === 2 ? 'sit' : 'idle', facing: -1, phase: i * .4 }));
          if (Math.floor(t * 4) % 2) { k.rect(bx + 11, -46, 7, 11, C.ink); k.rect(bx + 12, -45, 5, 9, C.error); k.rect(bx + 14, -44, 1, 4, C.white); k.px(bx + 14, -38, C.white); }
          const sh = [0, 1, 0, -1][Math.floor(t * 12) % 4];
          k.ellipse(58, OVS.y, 9, 2, C.shadow); k.blit(overseer('tangle'), 56 + sh, OVS.y);
          k.path([[62, -3], [70, -1], [76, -4], [72, -7], [68, -3], [80, -2]], OV.lash);
        }
      } else {
        for (const dx of [-6, 4, 14, 24]) k.blit(roller(0), BLK.x + dx, -10);
        k.blit(block(), BLK.x, BLK.y);
        slackRope(k, BLK.x + 28, -24, 146, -8); slackRope(k, BLK.x + 28, -16, 166, -4);
        hauler(0, BLK.x + 12, BLK.y - 18, {}); hauler(1, 124, -4, { facing: -1, phase: .3 }); hauler(2, 142, -6, { phase: .6 }); hauler(3, 160, -4, { facing: -1, phase: .9 });
        k.ellipse(OVS.x + 3, OVS.y, 10, 2, C.shadow); k.blit(overseer('sleep'), OVS.x, OVS.y);
        const q = (t * .4 + .5) % 1; k.alpha(1 - q, () => k.text('z', OVS.x + 6 + q * 5, OVS.y - 28 - q * 10, '#c8d4ff'));
      }

      /* Crew. Field crews shuttle along the south road; the rest work, eat, rest or wait. */
      const kinds = [{ tool: 'axe', carry: 'wood', look: 1, hat: 'cap', hc: C.leaf1 }, { tool: 'pick', carry: 'ore', look: 5, hat: 'helmet' }, { tool: 'hoe', carry: 'food', look: 3, hat: 'straw' }];
      if (run) {
        kinds.forEach((c, i) => {
          const p = (t * .045 + i / 3) % 1, out = p < .5, q = out ? p * 2 : (1 - p) * 2, [x, y] = along(ROUTE, q);
          const fade = Math.min(1, (1 - q) * 8);
          k.alpha(fade, () => z.crew(x + (out ? 3 : -3), y, { look: c.look, hat: c.hat, hatColor: c.hc, anim: 'walk', tool: out ? c.tool : '', carry: out ? '' : c.carry, facing: out ? (q < .3 ? -1 : 1) : (q < .3 ? 1 : -1), phase: i * .3 }));
        });
        z.crew(100, -56, { look: 4, hat: 'bandana', hatColor: C.teal2, anim: 'work', tool: 'saw', phase: .2, speed: 5 });
        z.crew(GRIND.x - 12, -50, { look: 2, hat: 'cap', hatColor: C.slate2, anim: 'work', tool: 'axe', phase: .7, speed: 3 });
        z.crew(142, 64, { look: 0, hat: 'none', anim: 'work', tool: 'broom', facing: 1, phase: .5, speed: 3 });
        const p = (t * .08) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        z.crew(-20 + q * 40, -38 + q * 4, { look: 3, hat: 'cap', hatColor: C.terra1, anim: 'walk', carry: back ? '' : 'box', facing: back ? -1 : 1, phase: .4 });
        z.crew(88, 86, { look: 2, hat: 'cap', hatColor: C.slate2, anim: 'sit', state: 'idle' });
      } else if (idle) {
        [[80, 86, 0], [104, 86, 2], [130, 86, 4], [150, 86, 1]].forEach(([x, y, l], i) => z.crew(x, y, { look: l, hat: ['cap', 'straw', 'helmet', 'none'][i], hatColor: C.leaf1, anim: 'sit', facing: i % 2 ? -1 : 1 }));
        z.crew(144, 64, { look: 0, anim: 'idle', facing: 1 });
        z.crew(100, -56, { look: 4, hat: 'bandana', hatColor: C.teal2, anim: 'sit' });
      } else if (wait) {
        z.crew(8, -8, { look: 1, hat: 'cap', hatColor: C.leaf1, anim: 'idle', tool: 'axe', facing: -1 });
        z.crew(-4, 22, { look: 5, hat: 'helmet', anim: 'idle', tool: 'pick', facing: -1 });
        z.crew(34, -8, { look: 3, hat: 'straw', anim: 'idle', tool: 'hoe', facing: -1 });
        z.crew(100, 86, { look: 2, hat: 'cap', hatColor: C.slate2, anim: 'sit' });
        z.crew(100, -56, { look: 4, hat: 'bandana', hatColor: C.teal2, anim: 'idle' });
      } else if (err) {
        z.crew(-150, -30, { look: 1, hat: 'cap', hatColor: C.leaf1, anim: 'idle', facing: -1 });
        z.crew(24, -30, { look: 5, hat: 'helmet', anim: 'idle', facing: 1 });
        z.crew(-2, 30, { look: 3, hat: 'straw', anim: 'idle' });
        z.crew(142, 64, { look: 0, anim: 'idle' });
      } else {
        z.crew(100, -56, { look: 4, hat: 'bandana', hatColor: C.teal2, anim: 'sit' });
        z.crew(130, 86, { look: 4, hat: 'helmet', anim: 'sit' });
      }

      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});

      if (live && !err && z.detail) for (let i = 0; i < 2; i++) { const p = (t * .05 + i * .5) % 1; Props.bird(k, -190 + p * 380, -138 + i * 10 + Math.sin(p * 9) * 3, t + i); }
      if (fx) fx();
    }
  };
})();
