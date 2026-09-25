/* Lumberyard · Timber & sawmill: managed pine forest with a felling clearing, water-powered saw shed and wheelhouse,
   log deck, plank drying yard, woodcutters' hut with a chopping yard, and a sapling nursery. Resource zone: no lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.lumberyard = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const FELL = { x: -54, y: -64 };              // the tree that is felled and regrows
  const WHEEL = { x: 169, y: -31, r: 17 };      // overshot waterwheel beside the wheelhouse
  const BLADE = { x: 72, y: -27 };              // circular saw in the open shed
  const BENCH = -23;                            // carriage bench top
  const CART = { x0: -124, x1: -86, y: -44 };   // log cart run from the clearing to the log deck
  const FIRE = { x: -72, y: 58 };               // break-time fire pit
  const PINE = ['#132a1e', '#1e3d2e', '#2b5a3a', '#3f7a4c', '#5a9a5c', '#7cbc6a'];
  const crewHat = (c) => ({ hat: c ? 'cap' : 'bandana', hatColor: c ? C.teal2 : C.red2 });

  /* ---------- Local helpers ---------- */
  const logEnd = (k, x, y, r) => { k.circle(x, y, r, C.wood1); k.circle(x, y, r - 1, C.wood4); if (r > 2) k.ring(x, y, r - 2, r - 2, C.wood3); k.px(x, y, C.wood2); k.px(x - 1, y - r + 1, C.wood5); };
  // A log lying left-right, with its cut end toward the left (light side).
  const logSide = (k, x, y, len, r = 3, end = true) => {
    k.rect(x + 2, y + r + 1, len, 1, C.shadowSoft);
    k.rect(x, y - r, len, r * 2 + 1, C.wood1); k.rect(x, y - r, len, 1, C.wood3); k.rect(x, y - r + 1, len, 1, C.wood2); k.rect(x, y + r, len, 1, C.wood0);
    for (let i = 3; i < len - 1; i += 3) { const h = P.hash(x + i, y); k.rect(x + i, y - r + 2 + Math.floor(h * (r * 2 - 2)), 2, 1, h > .5 ? C.wood0 : C.wood2); }
    k.rect(x + len, y - r + 1, 1, r * 2 - 1, C.wood0);
    if (end) { k.ellipse(x, y, Math.max(1, r - 1), r, C.wood1); k.ellipse(x, y, Math.max(0, r - 2), r - 1, C.wood4); k.px(x, y, C.wood3); k.px(x - 1, y - r + 1, C.wood5); }
  };
  // Stickered plank stack: layers of fresh boards with dark spacer ends, a board cover and weight stones. x,y = bottom-left.
  const plankStack = (k, x, y, w, layers, cover = true) => {
    const h = layers * 4, top = y - 3 - h, d = 8;
    k.rect(x + 3, y - 1, w + 3, 3, C.shadow); k.rect(x + w, top - d + 3, 4, h + d, C.shadowSoft);
    for (const bx of [x + 2, x + (w >> 1) - 2, x + w - 6]) { k.rect(bx, y - 3, 4, 3, C.wood1); k.px(bx, y - 3, C.wood2); }
    k.rect(x, top, w, h, C.wood4);
    for (let l = 0; l < layers; l++) {
      const ly = top + l * 4; k.rect(x, ly, w, 1, C.wood5); k.rect(x, ly + 3, w, 1, C.wood2);
      for (let i = 2; i < w - 2; i += 11) k.rect(x + i, ly + 3, 3, 1, C.wood0);
      for (let i = 7 + (l * 5) % 9; i < w; i += 13) k.px(x + i, ly + 1 + (i % 2), C.wood3);
    }
    k.rect(x + w - 1, top, 1, h, C.wood2); k.rect(x, top, 1, h, C.wood5);
    k.rect(x + 1, top - d, w, d, C.wood3); for (let r = 0; r < d; r += 2) k.rect(x + 1, top - d + r, w, 1, r % 4 ? C.wood4 : C.wood3);
    if (cover) {
      k.rect(x - 2, top - d - 2, w + 5, 3, C.wood1); k.rect(x - 2, top - d - 2, w + 5, 1, C.wood2); k.rect(x - 1, top - d - 4, w + 3, 2, S(C.wood2, -.1)); k.rect(x - 1, top - d - 4, w + 3, 1, C.wood3);
      for (const sx of [x + 4, x + w - 8]) { k.rect(sx, top - d - 7, 5, 3, C.stone2); k.rect(sx, top - d - 7, 3, 1, C.stone4); }
    }
  };
  const stump = (k, x, y, r = 4) => { k.ellipse(x + 2, y + 1, r + 2, 2, C.shadow); k.rect(x - r, y - 4, r * 2 + 1, 4, C.wood1); k.rect(x - r, y - 4, 1, 4, C.wood2); k.px(x - r - 1, y - 1, C.wood1); k.px(x + r + 1, y - 1, C.wood0); k.ellipse(x, y - 4, r, 2, C.wood4); k.ring(x, y - 4, r - 2, 1, C.wood3); k.px(x, y - 4, C.wood2); k.px(x - r + 1, y - 5, C.wood5); };
  const fern = (k, x, y) => { for (let i = -2; i <= 2; i++) k.line(x, y, x + i * 3, y - 4 + Math.abs(i), i < 0 ? C.leaf3 : C.leaf2); k.px(x - 6, y - 2, C.leaf4); k.px(x, y - 5, C.leaf4); };
  const mushroom = (k, x, y) => { k.rect(x, y - 2, 1, 2, C.paper); k.rect(x - 1, y - 3, 3, 1, C.red2); k.px(x - 1, y - 3, C.red3); k.rect(x + 3, y - 1, 1, 1, C.paper); k.rect(x + 2, y - 2, 3, 1, C.terra3); };
  const sapling = (k, x, y, n = 1) => {
    k.ellipse(x + 1, y, 3, 1, C.shadowSoft); k.rect(x, y - 3, 1, 3, C.wood2);
    for (let i = 0; i < 2 + n; i++) { const w = 3 - Math.floor(i * 3 / (2 + n)); k.rect(x - w, y - 3 - i * 2, w * 2 + 1, 2, i % 2 ? PINE[2] : PINE[3]); k.px(x - w, y - 3 - i * 2, PINE[4]); }
    k.px(x, y - 5 - (2 + n) * 2 + 2, PINE[5]);
  };

  /* ---------- Cached moving sprites ---------- */
  // A pine drawn along a rotated axis: step 0 is upright, 9 lies flat to the right. sc scales it (for regrowth).
  const fellSprite = (step, sc = 4) => P.sprite(`ly-fell|${step}|${sc}`, 112, 88, 24, 68, q => {
    const a = step * Math.PI / 18, s = [.3, .45, .6, .8, 1][sc], ca = Math.cos(a), sa = Math.sin(a);
    const T = (lx, ly) => [lx * s * ca - ly * s * sa, lx * s * sa + ly * s * ca];
    q.poly([T(-2.5, 0), T(2.5, 0), T(1.5, -48), T(-1.5, -48)], C.wood1);
    q.poly([T(-2.5, 0), T(-1, 0), T(-.5, -48), T(-1.5, -48)], C.wood3);
    for (const [by, w, h] of [[-10, 14, 20], [-20, 12, 19], [-30, 9.5, 17], [-39, 7, 15]]) {
      q.poly([T(-w - 1, by + 1), T(0, by - h), T(w + 1, by + 1)], PINE[1]);
      q.poly([T(-w, by), T(0, by - h), T(0, by)], PINE[3]);
      q.poly([T(0, by), T(0, by - h), T(w, by)], PINE[2]);
      q.poly([T(-w * .62, by - 1), T(-1, by - h + 3), T(-1, by - 2)], PINE[4]);
      for (let j = -w + 1; j < w; j += 3) { const [x, y] = T(j, by); q.px(x, y, j < 0 ? PINE[2] : PINE[1]); }
      const [hx, hy] = T(-w * .35, by - h * .45); q.px(hx, hy, PINE[5]);
    }
  }, PINE[0]);
  // Overshot waterwheel: 12 paddles, so 6 frames of 5 degrees loop seamlessly.
  const wheelSprite = f => P.sprite(`ly-wheel|${f}`, 44, 44, 22, 22, q => {
    const R = WHEEL.r, a0 = f * Math.PI / 36;
    for (let i = 0; i < 6; i++) { const b = a0 + i * Math.PI / 3; q.line(Math.cos(b) * 3, Math.sin(b) * 3, Math.cos(b) * (R - 3), Math.sin(b) * (R - 3), C.wood1, 2); }
    for (let i = 0; i < 12; i++) {
      const b = a0 + i * Math.PI / 6, c = Math.cos(b), s = Math.sin(b), tx = -s, ty = c;
      const pt = (r, t) => [c * r + tx * t, s * r + ty * t];
      q.poly([pt(R - 5, -2), pt(R + 3, -2), pt(R + 3, 2), pt(R - 5, 2)], i % 2 ? C.wood2 : C.wood3);
      q.line(...pt(R - 5, -2), ...pt(R + 3, -2), C.wood4);
    }
    q.ring(0, 0, R - 1, R - 1, C.wood1); q.ring(0, 0, R - 2, R - 2, C.wood3); q.ring(0, 0, R - 5, R - 5, C.wood1); q.ring(0, 0, R - 6, R - 6, C.wood2);
    q.circle(0, 0, 4, C.stone1); q.circle(0, 0, 3, C.stone2); q.px(-1, -1, C.stone4); q.px(0, 0, C.stone0);
  }, C.wood0);
  const bladeSprite = f => P.sprite(`ly-blade|${f}`, 22, 22, 11, 11, q => {
    for (let i = 0; i < 16; i++) { const b = (i + f / 4) * Math.PI / 8; q.px(Math.round(Math.cos(b) * 9), Math.round(Math.sin(b) * 9), C.stone2); }
    q.circle(0, 0, 8, C.stone3); q.circle(0, 0, 7, C.stone4); q.ring(0, 0, 5, 5, C.stone3);
    const g = f * Math.PI / 8; q.line(Math.cos(g) * 2, Math.sin(g) * 2, Math.cos(g) * 7, Math.sin(g) * 7, C.white); q.line(-Math.cos(g) * 2, -Math.sin(g) * 2, -Math.cos(g) * 6, -Math.sin(g) * 6, C.stone5);
    q.circle(0, 0, 2, C.stone1); q.px(0, 0, C.stone0);
  }, C.stone0);
  // Animated sprites are drawn over the dimmed terrain; darken them the same way when the district is off.
  const blitD = (k, s, x, y, off) => { k.blit(s, x, y); if (off) k.blit(P.tint(s, '#141c3c'), x, y, false, .4); };
  const cartSprite = loaded => P.sprite(`ly-cart|${loaded}`, 44, 22, 4, 16, q => {
    Props.cart(q, 0, 0, loaded ? (qq, x, y) => { logSide(qq, x - 3, y - 4, 27, 3); logSide(qq, x + 1, y - 9, 22, 3); } : null);
  });

  return {
    paint(k) {
      /* ---- Ground: forest floor, packed yard with sawdust, stream banks ---- */
      k.polyTex([[-190, -150], [150, -150], [146, -104], [124, -86], [80, -76], [30, -70], [-16, -58], [-90, -58], [-140, -50], [-190, -44]], (x, y) => {
        const h = P.hash(x, y); if (h < .05) return C.dirt1; if (h < .08) return '#7a5a34'; if (h > .95) return C.grass3; if (h > .9) return C.leaf1;
        return (x + y) % 2 ? C.grass1 : '#487540';
      });
      k.poly([[-150, -40], [-120, -52], [-40, -54], [20, -62], [140, -62], [150, -40], [148, 104], [110, 128], [22, 132], [-22, 132], [-110, 124], [-160, 96], [-176, 50], [-172, 0]], C.dirt2);
      k.polyTex([[-148, -38], [-118, -50], [-40, -52], [20, -60], [138, -60], [146, -40], [146, 102], [108, 126], [22, 130], [-22, 130], [-108, 122], [-157, 94], [-173, 50], [-169, 0]], (x, y) => {
        const h = P.hash(x * 3, y * 7), dust = x > -10 && x < 146 && y > -14 && y < 40;
        if (dust && h > .72) return h > .9 ? C.wood5 : C.dirt5;
        if (h < .07) return C.dirt1; if (h > .95) return C.stone3; if (h > .88) return C.dirt4;
        if (Math.abs(x) < 16 && y > 96 && (x + y) % 3 === 0) return C.dirt4;
        return C.dirt3;
      });
      // Cart ruts from the clearing to the log deck.
      for (const dy of [0, 5]) { k.rect(CART.x0 - 6, CART.y + 1 + dy, CART.x1 - CART.x0 + 50, 1, C.dirt1); k.rect(CART.x0 - 6, CART.y + 2 + dy, CART.x1 - CART.x0 + 50, 1, C.dirt4); }
      // Stream: pond at the top, tail race down the east edge.
      const bank = [[140, -150], [180, -150], [190, -144], [190, 140], [158, 140], [150, 110], [146, 70], [148, 30], [146, -10], [144, -62], [142, -96], [130, -104], [128, -124], [134, -142]];
      k.poly(bank, C.dirt1);
      k.polyTex([[144, -150], [178, -150], [190, -142], [190, 140], [161, 140], [153, 110], [149, 70], [151, 30], [149, -10], [147, -62], [145, -98], [133, -106], [131, -124], [137, -140]], (x, y) => {
        const h = P.hash(x, y * 3), edge = x < 152 + Math.sin(y * .07) * 3 || (y < -98 && x < 138);
        if (edge) return h > .5 ? C.water2 : C.water1;
        if (y < -98) return (y * 3 + x) % 23 === 0 ? C.water4 : h > .92 ? C.water3 : C.water1;
        return (Math.floor(y / 2) + x * 3) % 17 === 0 ? C.water4 : h > .85 ? C.water3 : C.water2;
      });
      for (let i = 0; i < 16; i++) { const y = -140 + i * 18, x = 146 + Math.sin(y * .07) * 3; Props.rock(k, x - 2, y + 4, i % 3 ? 0 : 1, i); if (i % 3 === 1) { k.rect(x - 6, y - 6, 1, 7, C.leaf2); k.rect(x - 4, y - 8, 1, 9, C.leaf3); k.rect(x - 4, y - 8, 1, 2, C.wood2); } }
      // Floating logs held in the mill pond.
      logSide(k, 142, -132, 20, 2); logSide(k, 150, -122, 18, 2); logSide(k, 138, -114, 16, 2);
      for (const [x, y] of [[140, -128], [148, -118], [136, -110]]) k.rect(x, y + 2, 26, 1, C.water4);
      // Plank dam with a sluice frame; the flume carries water down to the top of the wheel.
      k.rect(128, -104, 62, 9, C.wood1); for (let x = 128; x < 190; x += 4) { k.rect(x, -104, 3, 8, C.wood2); k.px(x, -104, C.wood4); }
      k.rect(128, -104, 62, 1, C.wood4); k.rect(128, -96, 62, 2, C.wood0);
      k.rect(157, -112, 2, 18, C.wood1); k.rect(169, -112, 2, 18, C.wood1); k.rect(156, -113, 16, 2, C.wood3); k.rect(156, -113, 16, 1, C.wood4);
      k.rect(184, -96, 6, 30, C.water4); k.dither(184, -96, 6, 30, C.foam, 1);
      k.rect(158, -94, 2, 44, C.wood1); k.rect(169, -94, 2, 44, C.wood1);
      k.rect(156, -96, 16, 44, C.wood2); k.rect(156, -96, 2, 44, C.wood4); k.rect(170, -96, 2, 44, C.wood0); k.rect(158, -96, 12, 44, C.water1);
      for (let y = -92; y < -54; y += 8) k.rect(156, y, 16, 1, C.wood1);

      /* ---- Forest edge (managed pine and oak stand) ---- */
      const back = [[-175, -112, 'pine', 1], [-166, -114, 'dark', 1], [-150, -113, 'pine', 1], [-132, -114, 'pine', 1], [-112, -114, 'oak', 1], [-92, -114, 'pine', 1], [-78, -113, 'dark', 1], [-32, -114, 'pine', 1], [-12, -114, 'birch', 1], [8, -113, 'pine', 1], [28, -114, 'dark', 1], [48, -114, 'pine', 1], [68, -114, 'pine', 1], [88, -113, 'oak', 1], [108, -114, 'pine', 1], [124, -112, 'pine', 0]];
      const mid = [[-172, -98, 'pine', 2], [-154, -94, 'oak', 2], [-136, -99, 'pine', 2], [-114, -94, 'pine', 2], [-96, -100, 'birch', 1], [-20, -98, 'pine', 2], [-4, -92, 'oak', 2], [20, -97, 'pine', 2], [44, -93, 'pine', 2], [68, -98, 'dark', 2], [92, -94, 'pine', 2], [114, -96, 'pine', 1]];
      const frontRow = [[-170, -74, 'pine', 3], [-146, -70, 'dark', 2], [-124, -76, 'pine', 2], [-100, -70, 'oak', 1], [16, -76, 'birch', 1], [38, -80, 'pine', 2], [62, -78, 'pine', 1], [86, -82, 'oak', 1], [108, -86, 'pine', 1]];
      for (const r of [back, mid]) for (const [x, y, kind, s] of r) Props.tree(k, x, y, kind, s, (x + 200) % 4);
      // Clearing: stumps with rings, felled-tree paint marks, ferns and mushrooms.
      k.ellipse(FELL.x + 4, FELL.y - 22, 24, 26, '#56763c'); k.ditherEllipse(FELL.x + 4, FELL.y - 22, 22, 24, C.grass2, 1); for (const [x, y] of [[-62, -104], [-44, -110], [-36, -96]]) stump(k, x, y, 3);
      k.ellipse(FELL.x + 16, FELL.y + 1, 46, 13, '#5a7a3e'); k.ditherEllipse(FELL.x + 16, FELL.y + 1, 44, 12, C.dirt2, 1); k.ellipse(FELL.x + 2, FELL.y + 2, 16, 6, C.dirt2); k.ditherEllipse(FELL.x + 2, FELL.y + 2, 15, 5, C.dirt3, 0);
      for (const [x, y, r] of [[-84, -80, 4], [-30, -80, 3], [-6, -74, 4], [-96, -58, 3]]) stump(k, x, y, r);
      stump(k, FELL.x, FELL.y, 4);
      for (const [x, y, kind, s] of frontRow) Props.tree(k, x, y, kind, s, (x + 300) % 4);
      for (const [x, y] of [[-124, -84], [38, -88], [-150, -79]]) { k.rect(x - 1, y, 3, 2, C.teal3); }
      for (let i = 0; i < 14; i++) fern(k, -186 + P.hash(i, 21) * 300, -62 - P.hash(i, 22) * 22);
      for (const [x, y] of [[-108, -62], [-160, -58], [4, -66], [-40, -62], [70, -70]]) mushroom(k, x, y);
      // Chips and a felling wedge around the working stump.
      for (let i = 0; i < 12; i++) k.px(FELL.x - 10 + P.hash(i, 4) * 26, FELL.y - 2 + P.hash(i, 5) * 8, i % 2 ? C.wood5 : C.wood4);
      k.poly([[FELL.x + 10, FELL.y + 4], [FELL.x + 16, FELL.y + 3], [FELL.x + 16, FELL.y + 5]], C.stone3);

      /* ---- Open saw shed ---- */
      const sx0 = 6, sx1 = 118;
      k.rect(sx0 + 4, -66, sx1 - sx0, 62, C.shadowSoft);
      k.rect(sx0, -66, sx1 - sx0, 54, '#5a4a38');
      for (let x = sx0 + 2; x < sx1; x += 5) { k.rect(x, -66, 1, 54, '#4a3c2e'); k.px(x + 2, -60 + (x * 7) % 40, '#6a5844'); }
      k.rect(sx0, -66, sx1 - sx0, 4, '#3a2e24');
      // Hanging crosscut saws, axes and a peavey on the back wall.
      for (const [x, y] of [[14, -54], [96, -56]]) { k.rect(x, y, 16, 3, C.stone3); k.rect(x, y, 16, 1, C.stone4); for (let i = 0; i < 16; i += 2) k.px(x + i, y + 3, C.stone2); k.rect(x - 2, y - 1, 2, 5, C.wood3); k.rect(x + 16, y - 1, 2, 5, C.wood3); }
      for (const x of [38, 44, 50]) { k.rect(x, -54, 1, 12, C.wood3); k.rect(x - 1, -55, 3, 4, C.stone3); k.px(x + 1, -55, C.white); }
      k.line(104, -44, 110, -30, C.wood3); k.rect(102, -46, 4, 2, C.stone2);
      // Line shaft from the wheelhouse with a pulley over the blade.
      k.rect(sx0 + 30, -61, sx1 - sx0 - 30, 2, C.stone1); k.rect(sx0 + 30, -61, sx1 - sx0 - 30, 1, C.stone3);
      k.rect(BLADE.x - 6, -65, 12, 9, C.wood1); k.rect(BLADE.x - 5, -64, 10, 7, C.wood3); k.rect(BLADE.x - 5, -64, 10, 1, C.wood4); k.px(BLADE.x, -61, C.stone0);
      for (const x of [44, 100]) { k.rect(x, -64, 3, 7, C.stone1); k.px(x, -64, C.stone3); }
      // Plank floor with sawdust, and the carriage bench.
      Props.planks(k, sx0, -14, sx1 - sx0, 10, C.wood2); k.dither(sx0 + 40, -14, 60, 10, C.wood5, 1);
      k.rect(sx0 - 2, BENCH, sx1 - sx0 + 4, 7, C.wood2); k.rect(sx0 - 2, BENCH, sx1 - sx0 + 4, 1, C.wood4); k.rect(sx0 - 2, BENCH + 6, sx1 - sx0 + 4, 1, C.wood0);
      k.rect(sx0 - 2, BENCH + 2, sx1 - sx0 + 4, 1, C.stone1);
      for (let x = sx0 + 2; x < sx1; x += 18) { k.rect(x, BENCH + 7, 3, 9, C.wood1); k.px(x, BENCH + 7, C.wood3); }
      // Out-feed table stacked with fresh boards.
      for (let i = 0; i < 3; i++) { k.rect(90, BENCH - 3 - i * 2, 26, 2, i % 2 ? C.wood4 : C.wood5); k.rect(90, BENCH - 2 - i * 2, 26, 1, C.wood3); }
      // Posts and the shingled roof slope.
      for (const x of [sx0 - 2, sx1 - 3]) { k.rect(x, -66, 4, 62, C.wood2); k.rect(x, -66, 1, 62, C.wood4); k.rect(x + 3, -66, 1, 62, C.wood0); k.rect(x - 1, -6, 6, 2, C.stone2); }
      k.polyTex([[sx0 - 8, -64], [sx1 + 4, -64], [sx1, -92], [sx0 - 4, -92]], (x, y) => {
        const r = y + 92; if (r < 2) return r ? '#9a7c56' : '#b8966a'; if (y >= -66) return '#3a2a1c';
        const row = Math.floor(r / 4); if (r % 4 === 0) return '#4a3626';
        if ((x + row * 3) % 7 === 0) return '#4a3626';
        const h = P.hash(Math.floor(x / 7) + row * 13, row), m = P.hash(x >> 1, y >> 1); if (m > .955 && r > 8) return m > .98 ? C.leaf3 : C.leaf2;
        return h < .3 ? '#6a5038' : '#7a5c40';
      });
      k.poly([[sx0 - 8, -64], [sx0 - 4, -92], [sx0, -92], [sx0 - 4, -64]], '#9a7c56');
      k.rect(sx0 - 4, -93, sx1 - sx0 + 4, 1, '#2e2016');
      Props.hangingSign(k, 22, -63, 'SAW', C.terra1);

      /* ---- Stone wheelhouse ---- */
      Props.building(k, 116, -6, { w: 36, h: 46, roofH: 16, style: 'gable', roof: C.slate2, wall: C.stone3, mat: 'stone', windows: [{ x: 5, y: 9, w: 7, h: 8 }, { x: 24, y: 9, w: 7, h: 8 }], door: { x: 12, w: 12, h: 16, color: C.wood2 }, chimney: null });
      k.rect(148, -35, 14, 7, C.wood1); k.rect(148, -35, 14, 2, C.wood3); k.rect(146, -37, 5, 11, C.stone1); k.rect(146, -37, 5, 2, C.stone3);

      /* ---- Log deck (rollway) at the mill's feed end ---- */
      k.line(-38, -8, 6, -18, C.wood0, 2); k.line(-38, -30, 6, -38, C.wood0, 2);
      for (const [x, y] of [[-34, -30], [-36, -22], [-38, -14], [-31, -27], [-33, -19], [-29, -24]]) logSide(k, x, y, 38, 3);
      for (const x of [-40, 4]) { k.rect(x, -16, 3, 10, C.wood1); k.px(x, -16, C.wood3); }

      /* ---- Woodcutters' log hut ---- */
      const hx = -186, hy = 6, hw = 58;
      Props.building(k, hx, hy, { w: hw, h: 32, roofH: 20, style: 'gable', roof: '#56744a', wall: C.wood2, mat: 'planks', chimney: { x: 44, h: 10 } });
      for (let y = hy - 30; y < hy - 4; y += 4) { k.rect(hx, y, hw, 3, C.wood2); k.rect(hx, y, hw, 1, C.wood3); k.rect(hx, y + 3, hw, 1, C.wood0); logEnd(k, hx, y + 1, 2); logEnd(k, hx + hw - 1, y + 1, 2); }
      Props.window(k, hx + 8, hy - 24, 9, 8, { lit: false, shutters: C.terra1 }); Props.window(k, hx + 42, hy - 24, 9, 8, { shutters: C.terra1 });
      Props.door(k, hx + 24, hy, 10, 17, C.wood1);
      // Axe rack and hung tools beside the door.
      k.rect(hx + 36, hy - 20, 2, 16, C.wood1); for (let i = 0; i < 3; i++) { k.rect(hx + 38 + i * 3, hy - 18, 1, 13, C.wood4); k.rect(hx + 37 + i * 3, hy - 19, 3, 3, C.stone3); }
      Props.logPile(k, hx + 2, hy + 18, 5); Props.logPile(k, hx + 32, hy + 18, 4);
      Props.barrel(k, hx + 58, hy - 8);

      /* ---- Chopping yard: block, split wood, sawbuck ---- */
      stump(k, -112, 34, 5); k.rect(-114, 26, 1, 4, C.wood4);
      for (let i = 0; i < 9; i++) { const x = -132 + (i % 3) * 5, y = 44 - Math.floor(i / 3) * 3; k.rect(x, y, 4, 3, C.wood4); k.rect(x, y, 4, 1, C.wood5); k.px(x + 3, y + 2, C.wood2); }
      for (let i = 0; i < 6; i++) k.px(-120 + P.hash(i, 7) * 18, 36 + P.hash(i, 9) * 8, C.wood5);
      k.line(-64, 22, -56, 34, C.wood1, 2); k.line(-56, 22, -64, 34, C.wood1, 2); k.line(-40, 22, -32, 34, C.wood1, 2); k.line(-32, 22, -40, 34, C.wood1, 2);
      logSide(k, -66, 25, 36, 3);
      // Break area: fire pit ring, log seats, kettle stand.
      k.ellipse(FIRE.x, FIRE.y, 8, 4, C.stone1); k.ellipse(FIRE.x, FIRE.y, 6, 3, C.stone1); k.ditherEllipse(FIRE.x, FIRE.y, 6, 3, '#4a403a', 0); k.line(FIRE.x - 4, FIRE.y + 1, FIRE.x + 3, FIRE.y - 1, '#2e2622', 2); k.px(FIRE.x - 1, FIRE.y + 1, C.stone3); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.rect(FIRE.x + Math.cos(a) * 8 - 1, FIRE.y + Math.sin(a) * 4 - 1, 3, 2, i % 2 ? C.stone3 : C.stone2); }
      k.rect(FIRE.x - 8, FIRE.y - 14, 1, 14, C.wood1); k.rect(FIRE.x + 7, FIRE.y - 14, 1, 14, C.wood1); k.rect(FIRE.x - 8, FIRE.y - 14, 16, 1, C.wood2);
      logSide(k, FIRE.x - 34, FIRE.y + 12, 20, 3); logSide(k, FIRE.x + 14, FIRE.y + 12, 20, 3);

      /* ---- Plank drying yard ---- */
      plankStack(k, 22, 86, 36, 5); plankStack(k, 66, 88, 36, 4); plankStack(k, 110, 86, 34, 6);
      k.rect(118, 40, 12, 3, C.wood1); for (let i = 0; i < 4; i++) { k.rect(116, 36 - i * 2, 20, 2, i % 2 ? C.wood4 : C.wood5); k.px(116, 36 - i * 2, C.wood3); }
      // Grading post with chalk marks.
      k.rect(8, 30, 3, 20, C.wood1); k.rect(8, 30, 1, 20, C.wood3); k.rect(4, 28, 11, 6, C.slate1); k.rect(5, 29, 9, 4, C.slate0); k.rect(6, 30, 4, 1, C.white); k.rect(6, 32, 6, 1, C.teal4);

      /* ---- Sapling nursery (south-west) ---- */
      k.rect(-178, 100, 104, 30, C.dirt1); k.rect(-178, 100, 104, 1, C.dirt0);
      for (let r = 0; r < 3; r++) { k.rect(-176, 106 + r * 9, 100, 2, C.dirt0); for (let i = 0; i < 9; i++) { const x = -172 + i * 11 + (r % 2) * 5, y = 107 + r * 9; sapling(k, x, y, (i + r) % 3); if ((i + r) % 4 === 0) { k.rect(x + 3, y - 8, 1, 8, C.wood3); k.px(x + 3, y - 8, C.wood4); } } }
      Props.fence(k, -180, 99, 108); Props.fence(k, -180, 133, 44); Props.fence(k, -118, 133, 46);
      Props.sign(k, -64, 118, 'NEW', C.leaf1);

      /* ---- South-east: firewood cords, sawdust heap, grindstone, entrance sign ---- */
      for (let c = 0; c < 2; c++) { const x = 34 + c * 40; k.rect(x + 2, 128, 34, 2, C.shadow); k.rect(x, 108, 2, 20, C.wood1); k.rect(x + 32, 108, 2, 20, C.wood1);
        for (let r = 0; r < 5; r++) for (let i = 0; i < 8; i++) logEnd(k, x + 5 + i * 4 - (r % 2) * 2, 125 - r * 4, 2); }
      k.ellipse(128, 124, 16, 7, C.dirt3); k.ellipse(126, 121, 13, 6, C.dirt4); k.ellipse(123, 118, 8, 4, C.dirt5); k.dither(114, 116, 28, 10, C.wood5, 1); k.line(138, 110, 132, 122, C.wood3); k.rect(137, 108, 4, 3, C.stone2);
      k.circle(-40, 104, 6, C.stone1); k.circle(-40, 104, 5, C.stone3); k.circle(-41, 103, 2, C.stone4); k.rect(-48, 108, 16, 3, C.wood1); k.rect(-47, 110, 2, 8, C.wood1); k.rect(-34, 110, 2, 8, C.wood1); k.rect(-41, 103, 10, 1, C.wood3);
      Props.sign(k, 26, 138, 'TIMBER', C.wood2);
      Props.lamp(k, -24, 132, false); Props.lamp(k, 140, 12, false);
      // Wheelbarrow of wood chips and a heap of peeled bark by the lane.
      { const x = -12, y = 76; k.ellipse(x + 8, y + 1, 11, 2, C.shadow); k.line(x + 12, y - 4, x + 22, y - 1, C.wood1, 2); k.poly([[x - 2, y - 9], [x + 14, y - 9], [x + 12, y - 2], [x + 1, y - 2]], C.stone2); k.poly([[x - 1, y - 8], [x + 13, y - 8], [x + 12, y - 5], [x, y - 5]], C.stone3);
        k.ellipse(x + 6, y - 9, 7, 2, C.wood4); for (let i = 0; i < 7; i++) k.px(x + P.hash(i, 3) * 12, y - 11 + P.hash(i, 4) * 3, i % 2 ? C.wood5 : C.wood3); k.circle(x + 2, y - 1, 3, C.wood0); k.circle(x + 2, y - 1, 2, C.stone1); k.rect(x + 9, y - 2, 1, 3, C.wood1); }
      for (let i = 0; i < 9; i++) { const x = -34 + (i % 5) * 5, y = 92 - Math.floor(i / 5) * 3; k.line(x, y, x + 6, y - 2, i % 2 ? C.wood1 : '#6a4a30', 2); }
      Props.barrel(k, -20, 40); Props.barrel(k, -8, 44); Props.crate(k, -28, 50); Props.sack(k, 138, 64, C.plaster1);
      // Grass tufts and flowers soften every edge.
      for (let i = 0; i < 40; i++) { const x = -188 + P.hash(i, 31) * 336, y = -40 + P.hash(i, 37) * 176; if (Math.abs(x) > 20 || y < 90) Props.tuft(k, x, y, C.grass1, C.grass4); }
      for (const [x, y] of [[-178, 60], [-178, 80], [-170, 136]]) Props.bush(k, x, y, x % 3 & 3);
      Props.tree(k, -180, 94, 'pine', 0, 2);
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error';

      /* Stream flow: moving foam dashes (still when off). */
      if (live) for (let i = 0; i < 10; i++) { const y = -90 + ((t * 26 + i * 23) % 228), x = 156 + (i * 7) % 26 + Math.sin(y * .07) * 2; k.rect(x, y, 3, 1, C.water4); k.px(x + 1, y + 1, C.water3); }

      /* Sluice gate and flume water: open and pouring only while working. */
      const gate = run ? -120 : -106; k.rect(159, gate, 10, 10, C.wood3); k.rect(159, gate, 10, 1, C.wood5); k.rect(163, gate - 3, 2, 3, C.stone1);
      if (run) {
        for (let i = 0; i < 5; i++) k.rect(159 + (i * 3) % 9, -94 + ((t * 60 + i * 9) % 42), 2, 3, C.water4);
        k.rect(159, -52, 10, 5, C.water3); for (let i = 0; i < 4; i++) k.px(159 + (i * 3 + Math.floor(t * 12)) % 10, -51 + i % 3, C.foam);
      } else if (err) {
        // Flume split: water sprays sideways out of the broken board.
        for (let i = 0; i < 4; i++) { const q = (t * 2 + i / 4) % 1; k.px(172 + q * 8, -78 + q * q * 14 + i, C.water4); k.px(173 + q * 6, -74 + q * q * 10, C.foam); }
        k.rect(170, -80, 3, 5, C.wood0);
      }

      /* Waterwheel: turns with the flow, stopped otherwise. */
      const wf = run ? Math.floor(t * 14) % 6 : 0;
      blitD(k, wheelSprite(wf), WHEEL.x, WHEEL.y, !live);
      if (run) { for (let i = 0; i < 5; i++) { const q = (t * 1.6 + i / 5) % 1; k.alpha(1 - q, () => k.px(WHEEL.x - 10 + i * 5, WHEEL.y + 16 + q * 6, C.foam)); } }

      /* Saw blade, belt and the log on the carriage. */
      const bf = run ? Math.floor(t * 20) % 4 : 0;
      for (const bx of [BLADE.x - 5, BLADE.x + 4]) { k.rect(bx, -58, 1, 30, '#2a1e14'); if (run) for (let y = 0; y < 30; y += 6) k.px(bx, -58 + ((bx < BLADE.x ? y + t * 40 : y - t * 40 + 600) % 30), C.wood4); }
      blitD(k, bladeSprite(bf), BLADE.x, BLADE.y, !live);
      k.rect(BLADE.x - 10, BENCH, 20, 7, C.wood2); k.rect(BLADE.x - 10, BENCH, 20, 1, C.wood4); k.rect(BLADE.x - 10, BENCH + 2, 20, 1, C.stone1); k.rect(BLADE.x - 10, BENCH + 6, 20, 1, C.wood0); k.rect(BLADE.x - 1, BENCH, 2, 3, '#2a1e14');
      const LOG = 34, ly = BENCH - 4;
      if (run) {
        const p = (t * .2) % 1, e = 18 + p * 70, cut = Math.max(0, e - BLADE.x);
        logSide(k, e - LOG, ly, LOG - Math.min(LOG, cut), 3);
        if (cut > 0) for (let i = 0; i < 3; i++) { k.rect(BLADE.x + 1, ly - 3 + i * 3, Math.min(cut, LOG) - 1, 2, i % 2 ? C.wood4 : C.wood5); k.rect(BLADE.x + 1, ly - 1 + i * 3, Math.min(cut, LOG) - 1, 1, C.wood3); }
        if (cut > 0 && cut < LOG) for (let i = 0; i < 6; i++) { const q = (t * 3 + i / 6) % 1; k.px(BLADE.x + 2 + q * 10, ly - 4 - Math.sin(q * 3) * 6 + q * 12, i % 2 ? C.wood5 : C.dirt5); }
      } else { logSide(k, 26, ly, LOG, 3); if (!live) k.alpha(.4, () => k.rect(24, ly - 4, LOG + 4, 9, '#141c3c')); }
      if (err) {
        // Jammed blade: sparks, a split log, grey smoke and scattered boards on the floor.
        for (let i = 0; i < 6; i++) { const q = (t * 4 + i / 6) % 1, a = -1.9 + i * .5; k.px(BLADE.x + Math.cos(a) * (6 + q * 12), BLADE.y + Math.sin(a) * (6 + q * 10) + q * q * 8, q < .5 ? C.gold4 : C.gold2); }
        Props.smoke(k, BLADE.x + 2, BLADE.y - 8, t, 5, '#77716a'); Props.smoke(k, 132, -76, t * 1.3, 3, '#5a5650');
        for (const [x, y, w] of [[88, -8, 20], [96, -4, 16], [30, 2, 18]]) { k.rect(x, y, w, 2, C.wood4); k.rect(x, y + 2, w, 1, C.wood2); }
      }
      if (wait) {
        // Loads on hold: overflowing out-feed, boards stacked in the lane, a HOLD board on the shed post.
        for (let i = 0; i < 4; i++) { k.rect(88, BENCH - 9 - i * 2, 28, 2, i % 2 ? C.wood4 : C.wood5); k.rect(88, BENCH - 8 - i * 2, 28, 1, C.wood3); }
        for (let i = 0; i < 5; i++) { k.rect(46, 40 - i * 3, 30, 3, i % 2 ? C.wood4 : C.wood5); k.rect(46, 42 - i * 3, 30, 1, C.wood2); } k.rect(48, 43, 4, 2, C.wood1); k.rect(70, 43, 4, 2, C.wood1);
        logSide(k, -44, -38, 34, 3); logSide(k, -40, -43, 30, 3);
        k.rect(-8, -52, 28, 11, C.ink); k.rect(-7, -51, 26, 9, C.waiting); k.text('HOLD', -1, -49, C.ink);
      }
      // State lantern on the wheelhouse corner: colour and blink per state.
      const lamp = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      k.rect(112, -36, 1, 6, C.stone0); k.rect(109, -30, 7, 7, C.ink); k.rect(110, -29, 5, 5, lamp); if (live) k.px(110, -29, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(112, -27, 7, lamp));

      /* Felling cycle: sapling regrows → chop → fall → lying and bucking → hauled away. */
      const fp = (t / 6) % 1;
      if (run) {
        if (fp < .15) { const g = fp / .15, sc = Math.min(4, Math.floor(g * 5)); k.blit(fellSprite(0, sc), FELL.x, FELL.y - 4); }
        else if (fp < .45) { k.blit(fellSprite(0), FELL.x, FELL.y - 4); const n = Math.floor((fp - .15) / .3 * 4); k.rect(FELL.x + 1, FELL.y - 7, 2 + n, 3, C.wood5); k.px(FELL.x + 1, FELL.y - 7, C.wood3);
          for (let i = 0; i < 3; i++) { const q = (t * 2.4 + i / 3) % 1; k.px(FELL.x - 4 - q * 8, FELL.y - 8 - Math.sin(q * 3) * 8 + q * 8, C.wood5); } }
        else if (fp < .55) { const g = (fp - .45) / .1; k.blit(fellSprite(Math.min(9, Math.floor(g * g * 10))), FELL.x, FELL.y - 4); }
        else if (fp < .8) { k.blit(fellSprite(9), FELL.x, FELL.y - 4); if (fp < .6) for (let i = 0; i < 5; i++) k.alpha(.6, () => k.circle(FELL.x + 10 + i * 9, FELL.y + 2, 3 - (fp - .55) * 40, C.dirt4)); }
      } else if (err) blitD(k, fellSprite(3), FELL.x, FELL.y - 4, false); // hung up, leaning into its neighbour
      else { blitD(k, fellSprite(0), FELL.x, FELL.y - 4, !live); if (wait) { k.rect(FELL.x + 1, FELL.y - 7, 4, 3, C.wood5); } }

      /* Log cart between the clearing and the deck. */
      const cp = (t * .09) % 1, out = cp < .5, cq = out ? cp * 2 : (1 - cp) * 2, cx = run ? CART.x0 + cq * (CART.x1 - CART.x0) : CART.x1;
      const cartLoaded = run ? out : wait;
      blitD(k, cartSprite(cartLoaded), cx, CART.y + 6, !live);

      /* Crew. */
      const L = (look, c) => ({ look, ...crewHat(c) });
      if (run) {
        const chop = fp >= .15 && fp < .45, felled = fp >= .55 && fp < .8, falling = fp >= .45 && fp < .55;
        if (felled) z.crew(FELL.x + 30, FELL.y + 12, { ...L(0, 0), anim: 'work', tool: 'saw', facing: -1, phase: .1 });
        else z.crew(FELL.x - 11, FELL.y + 8, { ...L(0, 0), anim: chop ? 'work' : falling ? 'cheer' : 'idle', tool: 'axe', phase: .1, speed: 5 });
        z.crew(cx + 36, CART.y + 6, { ...L(3, 1), anim: 'walk', facing: out ? 1 : -1, phase: .4 });
        z.crew(0, 0, { ...L(1, 1), anim: 'work', tool: 'hammer', phase: .6 });
        const sp = (t * .1) % 1, back = sp > .5, sq = back ? (1 - sp) * 2 : sp * 2;
        z.crew(106 - sq * 44, 4 + sq * 40, { ...L(2, 0), anim: 'walk', carry: back ? '' : 'wood', facing: back ? 1 : -1, phase: .2 });
        z.crew(-120, 36, { ...L(4, 1), anim: 'work', tool: 'axe', phase: .8, speed: 4 });
        z.crew(-124, 98, { ...L(5, 0), hat: 'straw', anim: 'work', tool: 'watering', phase: .5, speed: 3 });
        Props.smoke(k, -139, -38, t, 4);
        if (z.detail) for (let i = 0; i < 4; i++) { const q = (t * 2 + i / 4) % 1; k.px(-114 + Math.sin(i * 2) * q * 10, 30 - Math.sin(q * 3) * 8 + q * 6, C.wood5); }
      } else if (state === 'idle') {
        // Break time: crew sit by the kettle fire, machines stopped, birds and butterflies about.
        z.crew(FIRE.x - 24, FIRE.y + 12, { ...L(0, 0), anim: 'sit', phase: .1 });
        z.crew(FIRE.x + 24, FIRE.y + 12, { ...L(3, 1), anim: 'sit', facing: -1, phase: .4 });
        z.crew(FIRE.x + 2, FIRE.y + 22, { ...L(2, 0), anim: 'sit', phase: .7 });
        z.crew(0, 0, { ...L(1, 1), anim: 'idle', phase: .6 });
        z.crew(-120, 36, { ...L(4, 1), anim: 'sit', phase: .8 });
        z.crew(-124, 98, { ...L(5, 0), hat: 'straw', anim: 'idle', phase: .5 });
        Props.fire(k, FIRE.x, FIRE.y + 1, t, .7); k.rect(FIRE.x - 3, FIRE.y - 11, 6, 5, C.stone1); k.rect(FIRE.x - 3, FIRE.y - 11, 6, 1, C.stone3);
        Props.smoke(k, FIRE.x, FIRE.y - 12, t * .6, 3, '#e8e4dc'); Props.smoke(k, -139, -38, t * .5, 2);
        if (z.detail) { Props.butterfly(k, -140 + Math.sin(t * .8) * 20, 90 + Math.sin(t * 1.7) * 6, t); Props.butterfly(k, 60 + Math.sin(t * .6 + 2) * 24, 100 + Math.cos(t * 1.3) * 5, t + 1, '#f6ecd0'); for (let i = 0; i < 2; i++) Props.bird(k, -40 + ((t * 14 + i * 90) % 260) - 130, -130 + i * 8 + Math.sin(t + i) * 3, t + i); }
      } else if (live) {
        // Waiting and error: crew stand at their stations (state marks come from the crew sprite).
        z.crew(FELL.x - 11, FELL.y + 8, { ...L(0, 0), anim: 'idle', tool: 'axe', phase: .1 });
        z.crew(CART.x1 + 36, CART.y + 6, { ...L(3, 1), anim: 'idle', phase: .4 });
        z.crew(0, 0, { ...L(1, 1), anim: err ? 'cheer' : 'idle', phase: .6 });
        z.crew(84, 46, { ...L(2, 0), anim: 'idle', facing: -1, phase: .2 });
        z.crew(-120, 36, { ...L(4, 1), anim: 'idle', tool: 'axe', phase: .8 });
        z.crew(-124, 98, { ...L(5, 0), hat: 'straw', anim: 'idle', phase: .5 });
        if (wait) Props.smoke(k, -139, -38, t * .4, 2);
      } else {
        // Off: everyone asleep around the dead fire and the hut.
        z.crew(FIRE.x - 24, FIRE.y + 12, { ...L(0, 0), phase: .1 });
        z.crew(FIRE.x + 24, FIRE.y + 12, { ...L(3, 1), facing: -1, phase: .4 });
        z.crew(FIRE.x + 2, FIRE.y + 22, { ...L(2, 0), phase: .7 });
        z.crew(-148, 30, { ...L(4, 1), phase: .2 });
        z.crew(-4, 2, { ...L(1, 1), phase: .6 });
        z.crew(-124, 98, { ...L(5, 0), hat: 'straw', phase: .5 });
      }
      // Hut window and lamps glow in every live state except off.
      if (live) { Props.windowGlow(k, -144, -18, 9, 8, t); for (const [x, y] of [[-24, 132], [140, 12]]) k.rect(x - 1, y - 20, 4, 3, err ? C.red3 : C.glassLit); }
    }
  };
})();
