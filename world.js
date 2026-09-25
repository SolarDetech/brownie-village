/* The village atlas: layout, baked terrain and the per-frame renderer.
   World units are art pixels. Zoomed in, frames render into a low-res pixel buffer that is scaled up
   (crisp and cheap). Zoomed out, everything draws straight to the screen. */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  // M is the forest margin around the whole map: every layout coordinate below is shifted by it.
  const M = 180, W = 4810 + M * 2, H = 2430 + M * 2, RIVER = 2660 + M, MIRROR = RIVER * 2;
  const COLS = [930, 1440, 1950].map(x => x + M), ROWS = [780, 1195, 1600].map(y => y + M), CIVIC_Y = 300 + M, RES_Y = 2090 + M, INBOX_X = 2370 + M;
  const LANES_H = [960, 1420, 1780].map(y => y + M), LANES_V = [1160, 1720].map(x => x + M), CIVIC_LANE = 468 + M, RES_LANE = 2268 + M;
  // Village extents: west edge of the streets, east edge by the river, the green's south edge.
  const VX0 = COLS[0] - 200, VX1 = INBOX_X + 205, GREEN_B = LANES_H[2] + 36, WORK_T = GREEN_B + 90;
  const northStream = x => 562 + M + Math.round(Math.sin((x - M) / 210) * 10 + Math.sin((x - M) / 67) * 3);
  const southStream = x => 1862 + M + Math.round(Math.sin((x - M) / 190 + 1) * 10 + Math.sin((x - M) / 59) * 3);
  const riverX = y => RIVER + Math.round(Math.sin((y - M) / 170) * 16 + Math.sin((y - M) / 53) * 4);

  const roles = [
    ['sekreter', 'Sekreter', 'Postal courtyard', 0, 0, 'A posthouse, sorting pavilion, pigeon loft and courier yard carry messages across the village.'],
    ['text-writer', 'Text Writer', 'Scriptorium gardens', 1, 0, 'A scriptorium and quiet editorial gardens, where drafts become stories.'],
    ['gazeteci', 'Gazeteci', 'The news district', 2, 0, 'Source towers, a newsroom, archives and a working printing yard. News arrives from every direction.'],
    ['girard', 'Girard', 'Merchant quarter', 0, 1, 'Market stalls, a trade hall and a prospecting court bring new opportunities together.'],
    ['bayes', 'Bayes', 'Observatory hill', 2, 1, 'An observatory, experiment gardens and a sky full of patterns.'],
    ['kandinsky', 'Kandinsky', 'The artists’ grove', 0, 2, 'Studios, sculptures, pigments and canvases form an open-air creative district.'],
    ['kole', 'Köle', 'Workshop & living quarters', 1, 2, 'The forge, bunkhouse and dining hall. Small Köle crews leave this base for the lumberyard, mine and farm.'],
    ['scum-master', 'Head Chef', 'The Sprint Kitchen', 2, 2, 'An open kitchen, a pantry and a sunny terrace, where order tickets ride the rail from TODO to DOING, REVIEW and DONE and the head chef checks every plate at the pass.']
  ];
  const services = [
    ['castle', 'The Castle', 'Keep, courtyard & royal gardens', COLS[1], ROWS[1], 'The heart of the village: a keep, courtyard, fountain and formal gardens.', 'modal', 'village'],
    ['inbox', 'GGI', 'Inbox & approvals', INBOX_X, ROWS[1], 'Sealed dispatches, watchful couriers and decisions that need your attention.', 'drawer', 'village'],
    ['military', 'Command Grounds', 'Tasks · Workflows · Runs', COLS[0], CIVIC_Y, 'Drill grounds and an operations keep. Plan tasks, follow workflows and inspect runs.', 'page', 'civic'],
    ['library', 'The Grand Library', 'Documents & KPIs', COLS[1], CIVIC_Y, 'A great archive of documents and knowledge, with a gallery of village metrics.', 'page', 'civic'],
    ['hospital', 'Healing Gardens', 'Health & diagnostics', COLS[2], CIVIC_Y, 'A peaceful hospital, medicinal garden and a view into the health of your village.', 'modal', 'civic']
  ];
  const resources = [
    ['lumberyard', 'Lumberyard', 'Timber & sawmill', COLS[0], 'Köle crews fell managed timber, run the sawmill and carry planks back to the workshop.'],
    ['mine', 'Stone & ore mine', 'Mining & hauling', COLS[1], 'Köle miners extract ore and stone, fill carts and haul supplies back to the forge.'],
    ['farm', 'Village farm', 'Growing & harvesting', COLS[2], 'Köle fieldhands tend crop rows, water seedlings and bring fresh produce to the dining hall.']
  ];
  const defaults = { gktc: { girard: 'waiting', 'scum-master': 'error' }, daghan: { girard: 'waiting', bayes: 'idle', kandinsky: 'off' } };
  const zones = ['gktc', 'daghan'].flatMap((v, vi) => {
    const mx = x => vi ? MIRROR - x : x;
    return [
      ...roles.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, x: mx(COLS[r[3]]), y: ROWS[r[4]], description: r[5], kind: 'agent', band: 'village', action: 'drawer', state: defaults[v][r[0]] || 'working' })),
      ...services.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, x: mx(r[3]), y: r[4], description: r[5], kind: 'place', band: r[7], action: r[6], state: 'working' })),
      ...resources.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, x: mx(r[3]), y: RES_Y, description: r[4], kind: 'resource', band: 'resource', action: 'drawer', state: 'working' }))
    ];
  });
  const arena = { id: 'commons-colosseum', role: 'colosseum', agent: 'The Colosseum', name: 'The founders’ dice duel', village: 'commons', x: 400 + M, y: ROWS[1], description: 'A Roman-style arena in the western woods. GKTC and Daghan duel turn by turn on 2d6 rolls; then you decide the loser’s fate.', kind: 'arena', band: 'wilds', action: 'modal', state: 'working' };
  // Each village's inbox is its own post office and court: GGI for GKTC, DGI for Daghan.
  for (const z of zones) if (z.role === 'inbox') { const g = z.village === 'gktc'; z.agent = g ? 'GGI' : 'DGI'; z.name = (g ? 'GKTC' : 'Daghan') + ' Gelenler ve İzinler'; z.description = 'Post office and court in one. Letters arrive at the ' + (g ? 'GGI' : 'DGI') + ' counters, then go before the judge, who waits for your approval.'; }
  zones.push(arena);
  // Plot extents (zone-local): w = half-width at the side points, t = top, b = bottom.
  const half = z => footprint(z.kind === 'arena' ? 'colosseum' : z.role);
  function footprint(role) { return role === 'colosseum' ? { w: 300, t: 225, b: 225 } : role === 'castle' ? { w: 262, t: 222, b: 212 } : role === 'library' ? { w: 280, t: 200, b: 150 } : { w: 206, t: 160, b: 150 }; }
  // Every plot is a flat-top hexagon: short top and bottom edges, side points at mid-height. The slanted edges
  // share one slope (0.4 px across per px down), so all plots have the same angles.
  function hexOf(role) { const h = footprint(role), ym = (h.b - h.t) / 2, a = Math.round(h.w - .4 * (h.t + h.b) / 2); return [[-a, -h.t], [a, -h.t], [h.w, ym], [a, h.b], [-a, h.b], [-h.w, ym]]; }
  // Grow a convex polygon outward by d px (vertices move along the corner bisectors).
  function grow(pts, d) {
    const n = pts.length, nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dy / l, -dx / l]; };
    return pts.map((p, i) => { const a = nrm(pts[(i + n - 1) % n], p), b = nrm(p, pts[(i + 1) % n]), f = d / (1 + a[0] * b[0] + a[1] * b[1]); return [p[0] + (a[0] + b[0]) * f, p[1] + (a[1] + b[1]) * f]; });
  }
  function inPoly(pts, x, y) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  // A pixel-exact clip path: the same scanline spans that k.poly fills, traced as one staircase outline.
  const scan = P.kit(document.createElement('canvas').getContext('2d'));
  function stairPath(pts) {
    const rows = []; scan.spans(pts, (y, x0, x1) => rows.push([y, x0, x1])); const p = new Path2D();
    rows.forEach(([y, x0], i) => { if (i) p.lineTo(x0, y); else p.moveTo(x0, y); p.lineTo(x0, y + 1); });
    for (let i = rows.length - 1; i >= 0; i--) { const [y, , x1] = rows[i]; p.lineTo(x1, y + 1); p.lineTo(x1, y); }
    p.closePath(); return p;
  }
  const clips = {};
  zones.forEach(z => {
    const h = half(z); z.plot = { x: z.x - h.w, y: z.y - h.t, w: h.w * 2, h: h.t + h.b }; z.labelY = z.y + h.b - (z.kind === "arena" ? 34 : 20);
    if (z.kind === 'arena') return;
    z.hexL = hexOf(z.role); z.hex = z.hexL.map(([x, y]) => [z.x + x, z.y + y]); z.clip = clips[z.role] ||= stairPath(z.hexL);
    // Forest keeps this far from the plot: 14 px around, 36 px below (tree canopies rise over the bottom edge).
    z.keepOut = grow(z.hex, 14).map(([x, y], i) => [x, i === 3 || i === 4 ? y + 22 : y]);
  });

  // Solar fields in the woods, and the river datacenter with its stone suspension bridges on the main street (energy.js).
  const energy = window.Energy?.create({ M, RIVER, riverX, northStream, southStream, street: LANES_H[1], bridges: [...LANES_V, ...LANES_V.map(x => MIRROR - x)] });

  /* ---------- Terrain bake ---------- */
  let ground = null, fronts = {}, minimap = null;
  const frontKey = z => window.ZoneDesigns?.[z.role]?.perVillage ? z.id : z.role;
  function grassTile() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 96; const k = P.kit(cv.getContext('2d'));
    k.rect(0, 0, 96, 96, C.grass2);
    for (let i = 0; i < 90; i++) { const x = P.hash(i, 1) * 96, y = P.hash(i, 2) * 96; Props.tuft(k, x, y, C.grass1, C.grass3); }
    for (let i = 0; i < 60; i++) k.px(P.hash(i, 5) * 96, P.hash(i, 6) * 96, i % 3 ? C.grass3 : C.grass1);
    for (let i = 0; i < 6; i++) Props.flower(k, P.hash(i, 8) * 92 + 2, P.hash(i, 9) * 92 + 2, ['#f6ecd0', '#f2c14e', '#c3a2c0', '#e98aa0'][i % 4]);
    return cv;
  }
  function road(k, x0, y0, x1, y1, w, paved) {
    const x = Math.min(x0, x1) - w / 2, y = Math.min(y0, y1) - w / 2, rw = Math.abs(x1 - x0) + w, rh = Math.abs(y1 - y0) + w;
    k.rect(x - 2, y - 2, rw + 4, rh + 4, paved ? C.stone1 : C.dirt1);
    k.rect(x, y, rw, rh, paved ? C.stone3 : C.dirt3);
    if (paved) { k.c.fillStyle = cobblePat(k); k.c.fillRect(Math.round(x), Math.round(y), Math.round(rw), Math.round(rh)); }
    else { k.dither(x, y, rw, rh, C.dirt2, 1); const hor = rw > rh; if (hor) { k.rect(x, y + w * .3, rw, 1, C.dirt2); k.rect(x, y + w * .7, rw, 1, C.dirt2); } else { k.rect(x + w * .3, y, 1, rh, C.dirt2); k.rect(x + w * .7, y, 1, rh, C.dirt2); } }
    for (let i = 0; i < (rw * rh) / 220; i++) k.px(x + P.hash(i, x + y) * rw, y + P.hash(y, i) * rh, paved ? C.stone4 : C.dirt4);
  }
  let cobble = null;
  function cobblePat(k) {
    if (cobble) return cobble; const cv = document.createElement('canvas'); cv.width = 16; cv.height = 8; const q = P.kit(cv.getContext('2d'));
    for (let y = 0; y < 8; y += 4) { q.rect(0, y + 3, 16, 1, C.stone2); for (let x = (y / 4) * 4; x < 16; x += 8) q.rect(x, y, 1, 3, C.stone2); q.px((y / 4) * 4 + 2, y + 1, C.stone4); q.px((y / 4) * 4 + 10, y + 1, C.stone4); }
    return cobble = k.c.createPattern(cv, 'repeat');
  }
  function water(k, pts, layers) {
    // pts: centre line; layers: [halfWidth, colour]. Filled as polygons (fast, crisp).
    for (const [hw, col, dz] of layers) { const left = pts.map(([x, y, nx, ny]) => [x + nx * hw, y + ny * hw]), right = pts.map(([x, y, nx, ny]) => [x - nx * hw, y - ny * hw]).reverse(); if (dz) k.ditherPoly([...left, ...right], col); else k.poly([...left, ...right], col); }
  }
  const riverPts = () => { const a = []; for (let y = -10; y <= H + 10; y += 6) a.push([riverX(y), y, 1, 0]); return a; };
  const streamPts = f => { const a = []; for (let x = -10; x <= W + 10; x += 6) a.push([x, f(x), 0, 1]); return a; };
  const bridge = (k, x, y, len, vertical) => {
    // A wooden plank bridge; vertical=true spans north-south.
    if (vertical) {
      k.rect(x - 16, y - len / 2 + 3, 36, len, C.shadow);
      k.rect(x - 15, y - len / 2, 30, len, C.wood1); for (let yy = 0; yy < len; yy += 4) { k.rect(x - 14, y - len / 2 + yy, 28, 3, (yy / 4) % 2 ? C.wood3 : C.wood4); k.px(x - 14 + (yy * 7) % 26, y - len / 2 + yy + 1, C.wood2); }
      for (const s of [-1, 1]) { k.rect(x + s * 15 - (s > 0 ? 2 : 0), y - len / 2 - 2, 3, len + 4, C.wood2); k.rect(x + s * 15 - (s > 0 ? 2 : 0), y - len / 2 - 2, 1, len + 4, C.wood4); for (let yy = 0; yy <= len; yy += 12) { k.rect(x + s * 15 - 2, y - len / 2 + yy - 5, 4, 7, C.wood1); k.rect(x + s * 15 - 2, y - len / 2 + yy - 5, 4, 1, C.wood4); } }
    } else {
      k.rect(x - len / 2 + 3, y - 12, len, 30, C.shadow);
      k.rect(x - len / 2, y - 14, len, 28, C.wood1); for (let xx = 0; xx < len; xx += 4) { k.rect(x - len / 2 + xx, y - 13, 3, 26, (xx / 4) % 2 ? C.wood3 : C.wood4); k.px(x - len / 2 + xx + 1, y - 13 + (xx * 5) % 24, C.wood2); }
      for (const s of [-1, 1]) { k.rect(x - len / 2 - 2, y + s * 14 - 2, len + 4, 3, C.wood2); k.rect(x - len / 2 - 2, y + s * 14 - 2, len + 4, 1, C.wood4); for (let xx = 0; xx <= len; xx += 12) { k.rect(x - len / 2 + xx - 2, y + s * 14 - 6, 4, 8, C.wood1); k.rect(x - len / 2 + xx - 2, y + s * 14 - 6, 4, 1, C.wood4); } }
    }
  };
  const shadowSprites = {};
  function treeAt(k, x, y, kind, size, variant) {
    const r = kind === 'pine' ? 8 + size * 3 : [8, 11, 14, 18][size], key = r;
    let sh = shadowSprites[key]; if (!sh) { const cv = document.createElement('canvas'); cv.width = r * 2 + 4; cv.height = 8; const q = P.kit(cv.getContext('2d')); q.ellipse(r + 2, 4, r * .9, Math.max(2, r * .3), C.shadow); sh = shadowSprites[key] = cv; }
    k.c.drawImage(sh, Math.round(x + 3 - r - 2), Math.round(y - 3)); k.blit(Props.treeSprite(kind, size, variant), x, y);
  }
  function clearOf(x, y) {
    // Areas that must stay free of forest.
    if (energy?.blocks(x, y)) return false;
    if (Math.abs(x - arena.x) < 340 && Math.abs(y - arena.y) < 270 && ((x - arena.x) / 330) ** 2 + ((y - arena.y - 10) / 250) ** 2 < 1) return false;
    if (nearPlot(x, y)) return false;
    if (Math.abs(x - riverX(y)) < 70) return false; if (Math.abs(y - northStream(x)) < 44 || Math.abs(y - southStream(x)) < 44) return false;
    // The forest grows into each hexagon's cut corners (clear of the streets), so every plot reads as a hexagon.
    for (const z of zones) { if (!z.hex) continue; const p = z.plot; if (x > p.x && x < p.x + p.w && y > p.y - 14 && y < p.y + p.h - 2) {
      if ([...LANES_H, CIVIC_LANE, RES_LANE].some(l => y > l - 16 && y < l + 30) || LANES_V.some(l => Math.abs(x - l) < 26 || Math.abs(x - (MIRROR - l)) < 26)) return false;
      return true; } }
    for (const v of [0, 1]) { const m = X => v ? MIRROR - X : X, xa = Math.min(m(VX0 - 20), m(VX1 + 15)), xb = Math.max(m(VX0 - 20), m(VX1 + 15));
      if (x > xa && x < xb && y > 600 + M && y < GREEN_B + 4) return false;                 // village streets
      const xc = Math.min(m(VX0 - 20), m(COLS[2] + 215)), xd = Math.max(m(VX0 - 20), m(COLS[2] + 215));
      if (x > xc && x < xd && y > 130 + M && y < 500 + M) return false;                  // civic grounds
      if (x > xc && x < xd && y > WORK_T + 4 && y < RES_LANE + 32) return false;                 // working lands
      for (const lx of LANES_V) if (Math.abs(x - m(lx)) < 30 && y > 440 + M && y < RES_LANE + 32) return false;
    }
    if (y > LANES_H[1] - 26 && y < LANES_H[1] + 26 && x > 600 + M && x < VX0 + 10) return false; if (y > LANES_H[1] - 26 && y < LANES_H[1] + 26 && x > MIRROR - VX0 - 10 && x < W) return false;
    return true;
  }
  // Inside a plot or its forest-free margin.
  function nearPlot(x, y) { for (const z of zones) { if (!z.hex) continue; const p = z.plot; if (x > p.x - 16 && x < p.x + p.w + 16 && y > p.y - 16 && y < p.y + p.h + 38 && inPoly(z.keepOut, x, y)) return true; } return false; }
  // The plot ground: trimmed lawn inside a stone kerb, lit on the top-left edges and shaded on the bottom-right.
  function plotGround(k, z) {
    const hx = z.hex, sh = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]), g3 = grow(hx, 3);
    k.poly(grow(hx, 5), S(C.grass1, -.08));                                   // soft dark rim on the surrounding grass
    k.poly(sh(g3, 1, 1), C.stone1); k.poly(sh(g3, -1, -1), C.stone5); k.poly(g3, C.stone3);
    // Kerb joints every few px along each edge.
    for (let i = 0; i < 6; i++) { const [x0, y0] = g3[i], [x1, y1] = g3[(i + 1) % 6], L = Math.hypot(x1 - x0, y1 - y0); for (let s = 5; s < L - 2; s += 9) k.px(x0 + (x1 - x0) * s / L, y0 + (y1 - y0) * s / L, C.stone2); }
    k.poly(sh(hx, -1, -1), C.grass4); k.poly(sh(hx, 1, 1), S(C.grass3, -.14)); k.poly(hx, C.grass3); k.ditherPoly(hx, C.grass2, 1);
    const p = z.plot, inner = grow(hx, -6); for (let i = 0; i < 140; i++) { const x = p.x + P.hash(i, p.x) * p.w, y = p.y + P.hash(p.y, i) * p.h; if (inPoly(inner, x, y)) Props.tuft(k, x, y, C.grass2, C.grass4); }
  }
  // While a zone paints, trees and bushes that would be cut by its hexagon edge are left out (the forest
  // around the plot takes their place). (ox, oy) is where the zone centre sits on the canvas being drawn.
  function trimmed(z, ox, oy, fn) {
    if (!z.hexL) return fn();
    const tree = Props.tree, bush = Props.bush;
    const fits = (k, x0, y0, x1, y1) => { const m = k.c.getTransform(); return [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].every(([x, y]) => inPoly(z.hexL, m.a * x + m.c * y + m.e - ox, m.b * x + m.d * y + m.f - oy)); };
    Props.tree = (k, x, y, kind = 'oak', size = 1, v = 0) => { const s = Math.max(0, Math.min(3, size | 0)), pine = kind === 'pine', r = pine ? 8 + s * 3 : [8, 11, 14, 18][s], h = pine ? 27 + s * 9 : r * 2 + [6, 8, 10, 12][s] + (kind === 'birch' ? 5 : 0); if (fits(k, x - r, y - h, x + r, y + 1)) tree(k, x, y, kind, size, v); };
    Props.bush = (k, x, y, ...a) => { if (fits(k, x - 7, y - 10, x + 7, y + 1)) bush(k, x, y, ...a); };
    try { fn(); } finally { Props.tree = tree; Props.bush = bush; }
  }
  function bake() {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), k = P.kit(c);
    c.fillStyle = c.createPattern(grassTile(), 'repeat'); c.fillRect(0, 0, W, H);
    // Large, soft meadow variation.
    for (let i = 0; i < 520; i++) { const x = P.hash(i, 11) * W, y = P.hash(i, 12) * H, r = 30 + P.hash(i, 13) * 90; k.ditherEllipse(x, y, r, r * .6, i % 3 ? C.grass3 : C.grass1, i % 2 ? 1 : 0); }
    // Village greens and district plots: trimmed lawn with a hedge-edged border.
    for (const v of [0, 1]) { const m = X => v ? MIRROR - X : X, xa = Math.min(m(VX0 - 10), m(VX1 + 7)), xb = Math.max(m(VX0 - 10), m(VX1 + 7));
      k.rect(xa, 604 + M, xb - xa, GREEN_B - 604 - M, C.grass3); k.dither(xa, 604 + M, xb - xa, GREEN_B - 604 - M, C.grass2, 1);
      k.rect(xa, 128 + M, xb - xa, 370, C.grass3); k.dither(xa, 128 + M, xb - xa, 370, C.grass2, 1);
      k.rect(xa, WORK_T, xb - xa, 390, S(C.grass3, -.05)); k.dither(xa, WORK_T, xb - xa, 390, C.dirt3, 1);
    }
    for (const z of zones) if (z.hex) plotGround(k, z);
    // Water: river, two streams, with banks, shallows and reeds.
    const bank = [[62, C.dirt2], [58, C.dirt3], [54, C.dirt4, 1], [50, C.water1], [42, C.water2], [30, C.water3, 1], [16, C.water3]];
    const sbank = [[34, C.dirt2], [31, C.dirt3], [28, C.dirt4, 1], [25, C.water1], [19, C.water2], [11, C.water3, 1]];
    water(k, streamPts(northStream), sbank); water(k, streamPts(southStream), sbank); water(k, riverPts(), bank);
    for (let i = 0; i < 700; i++) {
      const onRiver = i < 260, y = onRiver ? P.hash(i, 21) * H : 0, x = onRiver ? riverX(y) + (i % 2 ? 1 : -1) * (48 + P.hash(i, 22) * 8) : P.hash(i, 23) * W;
      const yy = onRiver ? y : (i % 2 ? northStream(x) : southStream(x)) + (i % 4 < 2 ? 1 : -1) * (24 + P.hash(i, 24) * 5);
      if (i % 5 === 0) Props.rock(k, x, yy, i % 3, i); else { k.rect(x, yy - 5, 1, 6, C.leaf2); k.rect(x + 2, yy - 7, 1, 8, C.leaf3); k.rect(x + 2, yy - 8, 1, 2, C.wood2); }
    }
    // Lily pads in the calm river bends.
    for (let i = 0; i < 40; i++) { const y = P.hash(i, 31) * H, x = riverX(y) + (P.hash(i, 32) - .5) * 60; k.ellipse(x, y, 3, 2, C.leaf3); k.px(x - 1, y - 1, C.leaf4); if (i % 4 === 0) k.px(x + 1, y - 1, '#ffc6d8'); }
    // Roads: cobbled streets inside the villages, dirt tracks outside.
    for (const v of [0, 1]) {
      const m = X => v ? MIRROR - X : X, xa = m(VX0), xb = m(VX1);
      for (const ly of LANES_H) road(k, xa, ly, xb, ly, 26, true);
      for (const lx of LANES_V) { road(k, m(lx), 610 + M, m(lx), GREEN_B - 16, 26, true); road(k, m(lx), CIVIC_LANE, m(lx), 610 + M, 22, false); road(k, m(lx), GREEN_B - 16, m(lx), RES_LANE, 22, false); }
      road(k, xa, CIVIC_LANE, m(COLS[2] + 200), CIVIC_LANE, 22, false); road(k, xa, RES_LANE, m(COLS[2] + 200), RES_LANE, 22, false);
      for (const z of zones.filter(q => q.village === (v ? 'daghan' : 'gktc') && q.kind !== 'arena')) { const lane = z.band === 'civic' ? CIVIC_LANE : z.band === 'resource' ? RES_LANE : LANES_H.find(l => l > z.y); road(k, z.x, z.plot.y + z.plot.h - 6, z.x, lane, 24, z.band === 'village'); }
    }
    road(k, arena.x, arena.y + 210, arena.x, LANES_H[1], 26, false); road(k, arena.x, LANES_H[1], VX0, LANES_H[1], 26, false);
    road(k, VX1, LANES_H[1], MIRROR - VX1, LANES_H[1], 30, true);
    road(k, MIRROR - VX0, LANES_H[1], W + 20, LANES_H[1], 24, false);
    // Bridges over every crossing.
    if (!energy) bridge(k, riverX(LANES_H[1]), LANES_H[1], 150, false); // energy.js builds the stone suspension bridges instead
    for (const v of [0, 1]) for (const lx of LANES_V) { const x = v ? MIRROR - lx : lx; bridge(k, x, northStream(x), 76, true); bridge(k, x, southStream(x), 76, true); }
    // Street furniture: lamps, benches, wells and planters along the lanes.
    for (const v of [0, 1]) {
      const m = X => v ? MIRROR - X : X;
      for (const ly of LANES_H) for (let x = VX0 + 40; x < VX1 - 15; x += 110) { if (LANES_V.some(l => Math.abs(l - x) < 30)) continue; Props.lamp(k, m(x), ly - 16, true); if ((x / 110 | 0) % 3 === 0) Props.pot(k, m(x) + 10, ly - 24); }
      for (const lx of LANES_V) for (const ly of LANES_H) { Props.well(k, m(lx) + 34, ly - 20); Props.flowerBed(k, m(lx) - 52, ly - 30, 22, 10, undefined, lx + ly); }
    }
    // Village parks fill the riverside corners: a pond park to the north, an orchard to the south.
    for (const v of [0, 1]) {
      const cx = v ? MIRROR - INBOX_X : INBOX_X;
      for (const [cy, kind] of [[ROWS[0], 'pond'], [ROWS[2], 'orchard']]) {
        // The orchards give up their riverside strip to the datacenter basin (pw is the park width, pc its path).
        const trim = kind === 'orchard' && energy ? 70 : 0, x0 = cx - 170 + (v ? trim : 0), y0 = cy - 150, pw = 340 - trim, pc = x0 + pw / 2;
        k.rect(x0 - 2, y0 - 2, pw + 4, 294, C.grass1); k.rect(x0, y0, pw, 290, C.grass3); k.dither(x0, y0, pw, 290, C.grass2, 1);
        Props.hedge(k, x0, y0, pw, 7); Props.hedge(k, x0, y0 + 283, pc - 20 - x0, 7); Props.hedge(k, pc + 20, y0 + 283, x0 + pw - pc - 20, 7);
        road(k, pc, cy + 20, pc, cy + 180, 18, false); road(k, x0 + 30, cy + 20, x0 + pw - 30, cy + 20, 16, false);
        if (kind === 'pond') {
          Props.pond(k, cx, cy - 45, 84, 46); k.ellipse(cx + 30, cy - 60, 10, 4, C.leaf3); k.ellipse(cx - 40, cy - 30, 8, 3, C.leaf3); k.px(cx - 40, cy - 31, '#ffc6d8');
          // A little gazebo on the far bank and a boat pier.
          k.rect(cx + 94, cy - 112, 44, 30, C.stone3); k.rect(cx + 96, cy - 110, 40, 26, C.stone4); for (const dx of [98, 132]) k.rect(cx + dx, cy - 132, 3, 24, C.plaster3);
          k.poly([[cx + 90, cy - 130], [cx + 116, cy - 150], [cx + 142, cy - 130]], C.teal2); k.rect(cx + 90, cy - 131, 52, 3, C.teal1); k.rect(cx + 114, cy - 154, 4, 5, C.gold2);
          Props.planks(k, cx - 12, cy - 4, 24, 26, C.wood3); k.rect(cx - 8, cy - 16, 16, 8, C.wood2); k.rect(cx - 8, cy - 16, 16, 2, C.wood4);
          for (const [x, y] of [[-150, -110], [-120, -130], [150, 40], [-160, 60], [130, 90], [-90, 100]]) Props.tree(k, cx + x, cy + y, x % 3 ? 'oak' : 'blossom', 2, Math.abs(x) % 4);
          for (const x of [-120, -60, 60, 120]) { Props.bench(k, cx + x, cy + 12, 16); Props.lamp(k, cx + x + 22, cy + 12, true); }
          Props.flowerBed(k, cx - 150, cy + 50, 60, 14, undefined, 5); Props.flowerBed(k, cx + 60, cy + 50, 60, 14, undefined, 6); Props.statue(k, cx - 100, cy - 40, C.stone5);
        } else {
          const cols = trim ? 5 : 6, beds = trim ? 3 : 4, step = trim ? 88 : 80, tx0 = trim ? 26 : 36;
          for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) Props.tree(k, x0 + tx0 + c * 54 + (r % 2) * 18, y0 + 50 + r * 44, c % 3 === 1 ? 'orange' : 'fruit', 1, r + c);
          for (let i = 0; i < beds; i++) Props.flowerBed(k, x0 + 20 + i * step, cy + 50, 60, 22, [['#e46c52', '#f2c14e'], ['#7fbb5a', '#a9d670'], ['#c3a2c0', '#f6ecd0'], ['#f09a2a', '#f2c14e']][i], 20 + i);
          for (let i = 0; i < 3; i++) { const bx = x0 + pw - 78 + i * 14; k.rect(bx, cy - 136, 10, 12, C.plaster3); k.rect(bx - 1, cy - 138, 12, 3, C.wood3); k.rect(bx, cy - 130, 10, 1, C.gold1); }
          Props.cart(k, pc - 60, cy + 104, (q, x, y) => { for (let i = 0; i < 5; i++) q.circle(x + 3 + i * 4, y - 2, 2, i % 2 ? '#f09a2a' : C.red2); });
          for (const x of [x0 + 30, x0 + pw - 50]) { Props.bench(k, x, cy + 12, 16); Props.lamp(k, x + 22, cy + 12, true); }
          Props.well(k, x0 + pw - 60, cy + 110); Props.fence(k, x0 + 10, cy + 136, 130);
        }
      }
    }
    energy?.paintGround(k);
    // Forest: dense, varied canopy everywhere outside the settlements.
    const trees = [];
    for (let y = -6; y < H + 30; y += 15) for (let x = -6; x < W + 20; x += 15) {
      const jx = x + (P.hash(x, y) - .5) * 14, jy = y + (P.hash(y, x) - .5) * 12; if (!clearOf(jx, jy)) continue;
      const n = Math.sin(jx * .006) + Math.cos(jy * .007) + Math.sin((jx + jy) * .011) * .6, edge = Math.min(jx, W - jx, jy, H - jy) < 120;
      if (!edge && n < -.5 && P.hash(jx, jy) > .2) continue; // meadow clearings
      const h = P.hash(jx * .7, jy * 1.3), kind = h < .22 ? 'pine' : h < .3 ? 'birch' : h < .34 ? 'autumn' : h < .36 ? 'fruit' : h < .5 ? 'dark' : 'oak';
      trees.push([jx, jy, kind, Math.floor(P.hash(jy, jx * 2) * 3.2) + (edge ? 1 : 0), Math.floor(h * 97)]);
    }
    // Sparse orchards and bushes inside the village greens.
    for (let i = 0; i < 260; i++) { const x = P.hash(i, 41) * W, y = P.hash(i, 42) * H; if (clearOf(x, y) || energy?.blocks(x, y)) continue; if (nearPlot(x, y) || LANES_H.some(l => Math.abs(y - l) < 30) || Math.abs(x - riverX(y)) < 80) continue; if (LANES_V.some(l => Math.abs(x - l) < 30 || Math.abs(x - (MIRROR - l)) < 30)) continue; if (i % 3) Props.bush(k, x, y, i); else trees.push([x, y, i % 2 ? 'fruit' : 'blossom', 1, i]); }
    // Low shrubs line each plot's lower slanted edges (tall trees there would hide the kerb).
    const kerbs = zones.filter(z => z.hex).map(z => grow(z.hex, 6)), lanesY = [...LANES_H, CIVIC_LANE, RES_LANE], lanesX = [...LANES_V, ...LANES_V.map(l => MIRROR - l)];
    for (const z of zones) { if (!z.hex) continue; for (const [a, b, dx] of [[z.hex[2], z.hex[3], 1], [z.hex[5], z.hex[4], -1]]) for (let s = .1; s < .95; s += .16) {
      const x = Math.round(a[0] + (b[0] - a[0]) * s + dx * 12), y = Math.round(a[1] + (b[1] - a[1]) * s + 4);
      if (kerbs.some(h => inPoly(h, x, y) || inPoly(h, x - 7, y - 10) || inPoly(h, x + 7, y - 10)) || lanesY.some(l => y > l - 14 && y < l + 26) || lanesX.some(l => Math.abs(x - l) < 22) || Math.abs(x - riverX(y)) < 70 || energy?.blocks(x, y)) continue;
      trees.push([x, y, 'fn', q => Props.bush(q, x, y, (x * 7 + y) & 3)]);
    } }
    // Solar rows and inverters are y-sorted with the trees so the canopy overlaps them correctly.
    if (energy) { trees.push(...energy.items()); energy.finish(trees); }
    trees.sort((a, b) => a[1] - b[1]).forEach(t => t[2] === 'fn' ? t[3](k) : treeAt(k, t[0], t[1], t[2], Math.min(3, t[3]), t[4]));
    // Zone modules paint their static art, clipped to the hexagon so the cut corners stay forest.
    for (const z of zones) { const d = window.ZoneDesigns?.[z.role]; if (!d) continue; c.save(); c.translate(z.x, z.y); if (z.clip) c.clip(z.clip); try { trimmed(z, z.x, z.y, () => d.paint(k, z)); } catch (e) { console.error(z.role, e); } c.restore(); }
    for (const z of zones) { const d = window.ZoneDesigns?.[z.role]; const fk = frontKey(z); if (!d?.front || fronts[fk]) continue; const f = document.createElement('canvas'), h = half(z); f.width = h.w * 2; f.height = h.t + h.b; const fc = f.getContext('2d'); fc.translate(h.w, h.t); if (z.clip) fc.clip(z.clip); try { trimmed(z, h.w, h.t, () => d.front(P.kit(fc), z)); } catch (e) { console.error(z.role, e); } fronts[fk] = { cv: f, ox: h.w, oy: h.t }; }
    return cv;
  }

  /* ---------- Per-frame rendering ---------- */
  let fb = null, fbc = null;
  const stateOf = (z, states) => states?.[z.id] || (z.kind === 'resource' ? states?.[z.village + '-kole'] : null) || (z.kind === 'resource' ? zones.find(q => q.id === z.village + '-kole').state : z.state);
  function flagPost(k, z, t, state) {
    // A roadside banner shows the state from afar: colour, icon and motion.
    const x = z.hex[4][0] + 12, y = z.hex[4][1] - 8, col = C[state] || C.idle;
    k.rect(x, y - 34, 2, 34, C.wood1); k.px(x, y - 35, C.gold3);
    const wave = state === 'off' ? 0 : Math.round(Math.sin(t * (state === 'error' ? 9 : 4)) * 1);
    for (let i = 0; i < 14; i++) { const wy = state === 'off' ? Math.min(i, 6) : Math.round(Math.sin(t * 4 - i * .5) * 1.2); k.rect(x + 2 + i, y - 33 + wy, 1, 11, i % 4 === 0 ? S(col, .2) : col); }
    k.rect(x + 2, y - 33 + wave, 14, 1, C.ink);
    const ix = x + 6, iy = y - 30 + (state === 'off' ? 3 : 0);
    if (state === 'working') { k.rect(ix, iy + 2, 5, 1, C.white); k.rect(ix + 2, iy, 1, 5, C.white); k.px(ix, iy, C.white); k.px(ix + 4, iy + 4, C.white); k.px(ix + 4, iy, C.white); k.px(ix, iy + 4, C.white); }
    else if (state === 'waiting') { k.rect(ix + 1, iy, 3, 1, C.ink); k.px(ix + 3, iy + 1, C.ink); k.px(ix + 2, iy + 2, C.ink); k.px(ix + 2, iy + 4, C.ink); }
    else if (state === 'error') { k.rect(ix + 2, iy, 1, 3, C.white); k.px(ix + 2, iy + 4, C.white); }
    else if (state === 'off') { k.rect(ix, iy, 3, 1, C.white); k.px(ix + 2, iy + 1, C.white); k.rect(ix, iy + 2, 3, 1, C.white); }
    else { k.px(ix, iy + 2, C.white); k.px(ix + 2, iy + 2, C.white); k.px(ix + 4, iy + 2, C.white); }
  }
  function kolePath(z) {
    // From Köle's workshop gate down the lane, over the southern bridge, to the worksite gate.
    const home = zones.find(q => q.id === z.village + '-kole'), lx = z.village === 'gktc' ? LANES_V[z.role === 'lumberyard' ? 0 : 1] : MIRROR - LANES_V[z.role === 'lumberyard' ? 0 : 1];
    return [[home.x, LANES_H[2]], [lx, LANES_H[2]], [lx, RES_LANE], [z.x, RES_LANE], [z.x, z.plot.y + z.plot.h - 4]];
  }
  function along(pts, p) { const L = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])); let d = p * L.reduce((a, b) => a + b, 0); for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const f = L[i] ? d / L[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, Math.sign(pts[i + 1][0] - pts[i][0])]; } d -= L[i]; } return pts[pts.length - 1]; }

  // Marching dashes around the selected plot (the arena keeps its rectangle).
  function selectRing(c, z, t) {
    const off = Math.floor(t * 10) % 8; c.fillStyle = '#fff2b0';
    if (!z.hex) { const p = z.plot; for (let i = -off; i < p.w; i += 8) { c.fillRect(p.x + i, p.y - 3, 4, 2); c.fillRect(p.x + p.w - i - 4, p.y + p.h + 1, 4, 2); } for (let i = -off; i < p.h; i += 8) { c.fillRect(p.x + p.w + 1, p.y + i, 2, 4); c.fillRect(p.x - 3, p.y + p.h - i - 4, 2, 4); } return; }
    const g = grow(z.hex, 7); let s = 0;
    for (let i = 0; i < 6; i++) { const [x0, y0] = g[i], [x1, y1] = g[(i + 1) % 6], n = Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))); for (let j = 0; j < n; j++, s++) if ((s + 8 - off) % 8 < 4) c.fillRect(Math.round(x0 + (x1 - x0) * j / n) - 1, Math.round(y0 + (y1 - y0) * j / n) - 1, 2, 2); }
  }
  function drawScene(c, t, v, opts, scale) {
    const k = P.kit(c), states = opts.states || {}, detail = scale >= .7, sel = opts.selectedId;
    energy?.animate(k, t, v, scale);
    // Moving water glints.
    for (let i = 0; i < 180; i++) { const y = ((i * 37 + t * 22) % (H + 40)) - 20; if (y < v.t - 10 || y > v.b + 10) continue; const x = riverX(y) + (P.hash(i, 3) - .5) * 70; if (energy?.dry(x, y)) continue; k.rect(x, y, 3 + (i % 3), 1, i % 4 ? C.water4 : C.water5); }
    for (const f of [northStream, southStream]) for (let i = 0; i < 120; i++) { const x = ((i * 53 + t * 16) % (W + 40)) - 20; if (x < v.l - 10 || x > v.r + 10) continue; const y = f(x) + (P.hash(i, f === northStream ? 4 : 5) - .5) * 30; k.rect(x, y, 3, 1, i % 3 ? C.water4 : C.water5); }
    // Zones.
    for (const z of zones) {
      const p = z.plot; if (p.x > v.r || p.x + p.w < v.l || p.y > v.b + 40 || p.y + p.h < v.t - 70) continue;
      const d = window.ZoneDesigns?.[z.role], state = z.kind === 'arena' ? 'working' : stateOf(z, states);
      if (state === 'off' && z.hex) k.alpha(.38, () => k.poly(z.hex, '#141c3c'));
      // The animated layer is not clipped: smoke, birds and sparks may rise past the plot edge (the art keeps inside).
      c.save(); c.translate(z.x, z.y);
      if (d) try {
        if (z.kind === 'arena') d.animate(k, t, window.Colosseum?.scene(t));
        else { let leads = 0; d.animate(k, t, state, { lead: (x, y, o) => { if (!leads++ && !window.Avatars?.leadHook(z, x, y, o, t, state)) AgentCharacters.lead(k, z.role, x, y, t, state, o); }, crew: (x, y, o = {}) => AgentCharacters.crew(k, x, y, t, { state, ...o }), detail, village: z.village }); }
      } catch (e) { if (!z._err) { console.error(z.role, e); z._err = true; } }
      c.restore();
      const f = fronts[frontKey(z)]; if (f) c.drawImage(f.cv, z.x - f.ox, z.y - f.oy);
      if (z.kind === 'agent' || z.kind === 'resource') flagPost(k, z, t, state);
      if (sel === z.id) selectRing(c, z, t);
    }
    // Köle crews commute between the workshop and the resource fields.
    for (const z of zones) {
      if (z.kind !== 'resource') continue; const state = stateOf(z, states), route = kolePath(z);
      for (let i = 0; i < 3; i++) {
        const ph = ((state === 'working' ? t / 80 : 0) + i / 3 + z.x * .001) % 1, back = ph > .5, [x, y, dir] = along(route, back ? 2 - ph * 2 : ph * 2);
        if (x < v.l - 20 || x > v.r + 20 || y < v.t - 30 || y > v.b + 10) continue;
        const carry = back ? { lumberyard: 'wood', mine: 'ore', farm: 'food' }[z.role] : '';
        AgentCharacters.crew(k, Math.round(x + (i % 2 ? 6 : -6)), Math.round(y), t, { look: i + (z.role === 'mine' ? 2 : 0), hat: { lumberyard: 'bandana', mine: 'helmet', farm: 'straw' }[z.role], anim: state === 'working' ? (carry ? 'carry' : 'walk') : 'idle', carry, facing: back ? -dir : dir, phase: i, state, mark: false });
      }
    }
    if (detail) {
      // Villagers stroll across the river bridge and along the main street.
      for (let i = 0; i < 10; i++) { const ph = (t * .012 + i / 10) % 1, dir = i % 2 ? 1 : -1, x = dir > 0 ? RIVER - 220 + ph * 440 : RIVER + 220 - ph * 440, y = LANES_H[1] + (i % 3 - 1) * 6; if (x < v.l || x > v.r || y < v.t || y > v.b + 30) continue; AgentCharacters.crew(k, x, y + 4, t, { look: i, hat: ['none', 'hood', 'scarf', 'cap'][i % 4], hatColor: ['#c3a2c0', '#6a7ab0', C.red2][i % 3], anim: 'walk', facing: dir, phase: i, state: 'working' }); }
      energy?.front(k, t, v); // the bridge's south cables and tower piers pass in front of the strollers
      for (const vi of [0, 1]) for (let i = 0; i < 6; i++) { const ph = (t * .01 + i / 6) % 1, dir = i % 2 ? 1 : -1, lx = VX0 + 20 + ph * (VX1 - VX0 - 60), x = vi ? MIRROR - lx : lx, ly = LANES_H[i % 3] + 6; const X = dir > 0 ? x : (vi ? MIRROR - (VX1 - 40 - ph * (VX1 - VX0 - 60)) : VX1 - 40 - ph * (VX1 - VX0 - 60)); if (X < v.l || X > v.r || ly < v.t || ly > v.b + 30) continue; AgentCharacters.crew(k, X, ly, t, { look: i + 2, hat: ['none', 'scarf', 'hood'][i % 3], anim: 'walk', facing: (vi ? -dir : dir), phase: i * 1.3, state: 'working' }); }
      // Birds and their shadows.
      for (let i = 0; i < 16; i++) { const ph = (t * .01 + i / 16) % 1, x = ph * (W + 400) - 200, y = 200 + P.hash(i, 51) * (H - 400) + Math.sin(t * .6 + i) * 20; if (x < v.l || x > v.r || y < v.t || y > v.b) continue; k.alpha(.25, () => k.rect(x + 18, y + 40, 4, 1, C.ink)); Props.bird(k, x, y, t + i, i % 3 ? '#f4ecd6' : '#40342c'); }
      // Butterflies over the meadows.
      for (let i = 0; i < 40; i++) { const bx = P.hash(i, 61) * W + Math.sin(t * .7 + i) * 18, by = P.hash(i, 62) * H + Math.cos(t * .9 + i * 2) * 10; if (bx < v.l || bx > v.r || by < v.t || by > v.b) continue; Props.butterfly(k, bx, by, t + i, ['#f2c14e', '#f6ecd0', '#e98aa0', '#8aa7d8'][i % 4]); }
      // Fish jumping in the river.
      for (let i = 0; i < 6; i++) { const cyc = (t * .25 + i * .37) % 3; if (cyc > 1) continue; const y = 200 + i * 360, x = riverX(y) + (i % 2 ? 14 : -14) + cyc * 12, h = Math.sin(cyc * Math.PI) * 10; if (y < v.t || y > v.b || energy?.dry(x, y)) continue; k.rect(x, y - h, 4, 2, '#c8d8d0'); k.px(x - 1, y - h + 1, '#a8b8b0'); if (cyc < .15 || cyc > .85) k.ring(x + 1, y + 1, 4, 2, C.water5); }
    }
    // The village owners' avatars and any leads walking with them.
    window.Avatars?.draw(k, t, v, { detail: scale >= .55, stateOf: z => stateOf(z, states) });
    // Drifting cloud shadows give the map depth and life.
    for (let i = 0; i < 7; i++) { const x = ((t * 6 + i * 900) % (W + 1400)) - 700, y = 150 + (i * 347) % (H - 300); if (x + 360 < v.l || x - 360 > v.r || y + 160 < v.t || y - 160 > v.b) continue; k.alpha(.07, () => { k.ellipse(x, y, 260, 90, '#1a2a3a'); k.ellipse(x + 140, y - 40, 150, 70, '#1a2a3a'); k.ellipse(x - 160, y + 20, 130, 60, '#1a2a3a'); }); }
  }

  // Draw the world into ctx for a camera {x, y, scale} (screen px of world origin), viewport size in CSS px.
  function render(ctx, t, opts) {
    if (!ground) ground = bake();
    const { camera: cam, width, height } = opts, dpr = opts.dpr || 1, s = cam.scale;
    const l = -cam.x / s, tp = -cam.y / s, r = l + width / s, b = tp + height / s;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1f3a2a'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (s >= 1) {
      const L = Math.floor(l), T = Math.floor(tp), Wv = Math.ceil(r - L) + 1, Hv = Math.ceil(b - T) + 1;
      if (!fb || fb.width < Wv || fb.height < Hv) { fb = document.createElement('canvas'); fb.width = Math.ceil(Wv / 64 + 1) * 64; fb.height = Math.ceil(Hv / 64 + 1) * 64; fbc = fb.getContext('2d'); }
      fbc.setTransform(1, 0, 0, 1, 0, 0); fbc.fillStyle = '#1f3a2a'; fbc.fillRect(0, 0, Wv, Hv);
      const sx = Math.max(0, L), sy = Math.max(0, T), sw = Math.min(W, L + Wv) - sx, sh = Math.min(H, T + Hv) - sy;
      if (sw > 0 && sh > 0) fbc.drawImage(ground, sx, sy, sw, sh, sx - L, sy - T, sw, sh);
      fbc.setTransform(1, 0, 0, 1, -L, -T); fbc.imageSmoothingEnabled = false;
      drawScene(fbc, t, { l, t: tp, r, b }, opts, s);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(fb, 0, 0, Wv, Hv, cam.x + L * s, cam.y + T * s, Wv * s, Hv * s);
    } else {
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * cam.x, dpr * cam.y); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
      const sx = Math.max(0, Math.floor(l)), sy = Math.max(0, Math.floor(tp)), sw = Math.min(W, Math.ceil(r)) - sx, sh = Math.min(H, Math.ceil(b)) - sy;
      if (sw > 0 && sh > 0) ctx.drawImage(ground, sx, sy, sw, sh, sx, sy, sw, sh);
      ctx.imageSmoothingEnabled = false;
      drawScene(ctx, t, { l, t: tp, r, b }, opts, s);
    }
  }
  // Render a region (art px, centre cx/cy, width w) into a canvas: drawer art, cards, the arena close-up.
  function renderView(canvas, t, opts) {
    const w = opts.w, h = w * canvas.height / canvas.width, s = canvas.width / w;
    render(canvas.getContext('2d'), t, { ...opts, camera: { x: canvas.width / 2 - opts.cx * s, y: canvas.height / 2 - opts.cy * s, scale: s }, width: canvas.width, height: canvas.height, dpr: 1 });
  }
  function minimapCanvas(w) {
    if (!ground) ground = bake();
    if (!minimap || minimap.width !== w) { minimap = document.createElement('canvas'); minimap.width = w; minimap.height = Math.round(w * H / W); const c = minimap.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(ground, 0, 0, minimap.width, minimap.height); }
    return minimap;
  }
  function hitTest(x, y) {
    if (((x - arena.x) / 300) ** 2 + ((y - arena.y - 10) / 220) ** 2 <= 1) return arena;
    return zones.find(z => z.hex && x >= z.plot.x && x <= z.plot.x + z.plot.w && y >= z.plot.y && y <= z.plot.y + z.plot.h && inPoly(z.hex, x, y));
  }
  const titles = [[COLS[1], 598 + M, 'GKTC’S VILLAGE', 'THE WESTERN REALM'], [MIRROR - COLS[1], 598 + M, 'DAGHAN’S VILLAGE', 'ACROSS THE RIVER'], [COLS[1], 58 + M, 'THE CIVIC GROUNDS', 'PLAN · KNOW · RESTORE'], [MIRROR - COLS[1], 58 + M, 'THE CIVIC GROUNDS', 'PLAN · KNOW · RESTORE'], [COLS[1], WORK_T - 4, 'THE WORKING LANDS', 'TIMBER · ORE · HARVEST'], [MIRROR - COLS[1], WORK_T - 4, 'THE WORKING LANDS', 'TIMBER · ORE · HARVEST'], [arena.x, arena.y - 262, 'THE WESTERN WOODS', 'THE COLOSSEUM'], ...(energy ? [energy.title] : [])];

  window.VillageWorld = { width: W, height: H, zones, render, renderView, hitTest, footprint, hexOf, stairPath, plotGround, trimmed, minimapCanvas, titles, stateOf, home: { gktc: [(VX0 + VX1) / 2, 1215 + M], daghan: [MIRROR - (VX0 + VX1) / 2, 1215 + M] }, energy: energy?.focus, ready: () => { if (!ground) ground = bake(); } };
})();
