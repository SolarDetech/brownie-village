/* The village atlas: layout, baked terrain and the per-frame renderer.
   World units are art pixels. Zoomed in, frames render into a low-res pixel buffer that is scaled up
   (crisp and cheap). Zoomed out, everything draws straight to the screen. */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  // M is the forest margin around the whole map: every layout coordinate below is shifted by it.
  const M = 180, W = 4810 + M * 2, H = 2430 + M * 2, RIVER = 2660 + M, MIRROR = RIVER * 2;
  // Each village is a Civ-style honeycomb: every district is one flat-top hex tile, and a 44 px lane (a cobbled road
  // lined with trees) runs between neighbouring tiles. Column c (0 = west, 3 = by the river) steps TX west of the
  // riverside column X3; odd columns sit half a tile lower. Y0 is the mid-height of row 0 in the even columns.
  // Daghan's village mirrors GKTC's across the river.
  const TX = 390, TY = 354, X3 = RIVER - 425, Y0 = 598;
  const tile = (c, r) => [X3 - (3 - c) * TX, Y0 + r * TY + (c % 2) * TY / 2 + 5];   // zone centre (the hex mid-height is 5 px above it)
  const SY = Y0 + 2 * TY + TY / 2;                                                  // the HQ's centre row: the stone bridges cross the river here
  const WEST = X3 - 3 * TX - 144, CX = X3 - 1.5 * TX, TOP = Y0 - 155, BOT = Y0 + 4 * TY + TY / 2 + 155;   // top and bottom of the honeycomb
  const northStream = x => 120 + M + Math.round(Math.sin((x - M) / 210) * 10 + Math.sin((x - M) / 67) * 3);
  const southStream = x => 2310 + M + Math.round(Math.sin((x - M) / 190 + 1) * 10 + Math.sin((x - M) / 59) * 3);
  const riverX = y => RIVER + Math.round(Math.sin((y - M) / 170) * 16 + Math.sin((y - M) / 53) * 4);

  // [role, agent, name, tile column, tile row, description]
  const roles = [
    ['sekreter', 'Sekreter', 'Postal courtyard', 0, 1, 'A posthouse, sorting pavilion, pigeon loft and courier yard carry messages across the village.'],
    ['text-writer', 'Text Writer', 'Scriptorium gardens', 1, 1, 'A scriptorium and quiet editorial gardens, where drafts become stories.'],
    ['gazeteci', 'Gazeteci', 'The news district', 2, 1, 'Source towers, a newsroom, archives and a working printing yard. News arrives from every direction.'],
    ['girard', 'Girard', 'Merchant quarter', 0, 2, 'Market stalls, a trade hall and a prospecting court bring new opportunities together.'],
    ['bayes', 'Bayes', 'Observatory hill', 3, 1, 'An observatory, experiment gardens and a sky full of patterns.'],
    ['kandinsky', 'Kandinsky', 'The artists’ grove', 0, 3, 'Studios, sculptures, pigments and canvases form an open-air creative district.'],
    ['kole', 'Köle', 'The slave camp', 1, 3, 'A Mordor-style slave camp: a spiked forge tower, slave pens and a mess pit. The dark overlord’s overseers drive shackled crews out to the lumberyard, mine and farm.'],
    ['scum-master', 'Head Chef', 'The Sprint Kitchen', 3, 3, 'An open kitchen, a pantry, a grand döner stand and a sunny terrace, where order tickets ride the rail from TODO to DOING, REVIEW and DONE and the head chef checks every plate at the pass.']
  ];
  const services = [
    ['hq', 'HQ', 'Palace & operations campus', 1, 2, 'The heart of the village, three tiles wide: a palace behind the Atatürk statue, and teams at work on computers, VR, drones, solar panels and robots.', 'modal', 'village'],
    ['inbox', 'GGI', 'Inbox & approvals', 3, 2, 'Sealed dispatches, watchful couriers and decisions that need your attention.', 'drawer', 'village'],
    ['military', 'Command Grounds', 'Tasks · Workflows · Runs', 0, 0, 'Drill grounds and an operations keep. Plan tasks, follow workflows and inspect runs.', 'page', 'civic'],
    ['library', 'The Grand Library', 'Documents & KPIs', 1, 0, 'A great archive of documents and knowledge, with a gallery of village metrics.', 'page', 'civic'],
    ['hospital', 'Healing Gardens', 'Health & diagnostics', 2, 0, 'A peaceful hospital, medicinal garden and a view into the health of your village.', 'modal', 'civic']
  ];
  const resources = [
    ['lumberyard', 'Lumberyard', 'Felling ground', 0, 4, 'An Isengard-style felling ground: orcs and goblins fell the dead black forest under the Uruk-hai’s whips and feed the logs to a fire pit.'],
    ['mine', 'Stone & ore mine', 'Mining & hauling', 1, 4, 'A Moria-style hell mine: goblins, hollows and chained zombies dig glowing ore and push carts past the lava under a demon’s flaming whip.'],
    ['farm', 'Village farm', 'The slave fields', 2, 4, 'The slave fields of Nurn: orcs and hollows hoe thorn crops in the ash while a Nazgûl watches and chained goblins turn the water wheel.']
  ];
  const defaults = { gktc: { girard: 'waiting', 'scum-master': 'error' }, daghan: { girard: 'waiting', bayes: 'idle', kandinsky: 'off' } };
  // The HQ covers three tiles that meet at one corner; its centre (the statue) is that shared corner.
  const HQ_CELLS = [[1, 2], [2, 2], [2, 3]];
  const zones = ['gktc', 'daghan'].flatMap((v, vi) => {
    const at = (c, r) => { const [x, y] = tile(c, r); return { x: vi ? MIRROR - x : x, y, col: c, row: r }; };
    return [
      ...roles.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, ...at(r[3], r[4]), description: r[5], kind: 'agent', action: 'drawer', state: defaults[v][r[0]] || 'working' })),
      ...services.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, ...at(r[3], r[4]), description: r[5], kind: 'place', action: r[6], state: 'working' })),
      ...resources.map(r => ({ id: `${v}-${r[0]}`, role: r[0], agent: r[1], name: r[2], village: v, ...at(r[3], r[4]), description: r[5], kind: 'resource', action: 'drawer', state: 'working' }))
    ];
  });
  const arena = { id: 'commons-colosseum', role: 'colosseum', agent: 'The Colosseum', name: 'The founders’ dice duel', village: 'commons', x: 400 + M, y: SY - 250, description: 'A Roman-style arena in the western woods. GKTC and Daghan duel turn by turn on 2d6 rolls; then you decide the loser’s fate.', kind: 'arena', band: 'wilds', action: 'modal', state: 'working' };
  // Each village's inbox is its own post office and court: GGI for GKTC, DGI for Daghan.
  for (const z of zones) if (z.role === 'inbox') { const g = z.village === 'gktc'; z.agent = g ? 'GGI' : 'DGI'; z.name = (g ? 'GKTC' : 'Daghan') + ' Gelenler ve İzinler'; z.description = 'Post office and court in one. Letters arrive at the ' + (g ? 'GGI' : 'DGI') + ' counters, then go before the judge, who waits for your approval.'; }
  zones.push(arena);
  // Plot extents (zone-local): w = half-width at the side points, t = top, b = bottom.
  const half = z => footprint(z.kind === 'arena' ? 'colosseum' : z.role);
  function footprint(role) {
    if (role === 'hq') { const o = hqLocal.gktc; return { w: Math.ceil(Math.max(...o.map(p => Math.abs(p[0])))), t: Math.ceil(-Math.min(...o.map(p => p[1]))), b: Math.ceil(Math.max(...o.map(p => p[1]))) }; }
    return role === 'colosseum' ? { w: 300, t: 225, b: 225 } : { w: 206, t: 160, b: 150 };
  }
  // Every plot is a flat-top hexagon: short top and bottom edges, side points at mid-height. The slanted edges
  // share one slope (0.4 px across per px down), so all plots have the same angles. The HQ's outline (three tiles,
  // mirrored in Daghan's village) is traced from the honeycomb below.
  function hexOf(role, village = 'gktc') { if (role === 'hq') return hqLocal[village]; const h = footprint(role), ym = (h.b - h.t) / 2, a = Math.round(h.w - .4 * (h.t + h.b) / 2); return [[-a, -h.t], [a, -h.t], [h.w, ym], [a, h.b], [-a, h.b], [-h.w, ym]]; }
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
  const clips = {}, TILE_HEX = hexOf('tile'), hqLocal = {};
  // The honeycomb cells: one per district, three for the HQ. Edge i of a hexagon (vertex i to i + 1) faces the cell at
  // SIDE[i]; an edge with no cell behind it is on the village rim.
  const SIDE = [[0, -TY], [TX, -TY / 2], [TX, TY / 2], [0, TY], [-TX, TY / 2], [-TX, -TY / 2]];
  const cellAt = (zone, x, y) => { const hex = TILE_HEX.map(([hx, hy]) => [x + hx, y + hy]), keepOut = grow(hex, 23).map(([hx, hy], i) => [hx, i === 3 || i === 4 ? hy + 22 : hy]); return { zone, x, y, hex, keepOut, plot: { x: x - 206, y: y - 160, w: 412, h: 310 } }; };
  // Forest keeps out of keepOut: the lane width around each cell, 22 px more below (tree canopies rise over the bottom edge).
  const cells = zones.filter(z => z.kind !== 'arena').flatMap(z => z.role !== 'hq' ? [cellAt(z, z.x, z.y)] : HQ_CELLS.map(([c, r]) => { const [x, y] = tile(c, r); return cellAt(z, z.village === 'daghan' ? MIRROR - x : x, y); }));
  const tileKey = (x, y) => Math.round(x) + ',' + Math.round(y), byPos = new Map(cells.map(q => [tileKey(q.x, q.y), q]));
  cells.forEach(q => { q.next = SIDE.map(([dx, dy]) => byPos.get(tileKey(q.x + dx, q.y + dy)) || null); });
  // The HQ outline: each cell's outer edges in turn, bridged straight across the lanes the HQ swallows.
  // Its centre is the corner where its three cells meet (where the Atatürk statue stands).
  for (const z of zones.filter(q => q.role === 'hq')) {
    const own = cells.filter(q => q.zone === z), inner = (q, i) => q.next[i]?.zone === z, out = [];
    let q = own[0], i = [0, 1, 2, 3, 4, 5].find(j => !inner(q, j) && inner(q, (j + 5) % 6));
    for (let n = 0; n < own.length; n++) { while (!inner(q, i)) { out.push(q.hex[i]); i = (i + 1) % 6; } out.push(q.hex[i]); const nx = q.next[i]; i = [0, 1, 2, 3, 4, 5].find(j => !inner(nx, j) && inner(nx, (j + 5) % 6)); q = nx; }
    const mx = own.reduce((a, c) => a + c.x, 0) / 3, my = own.reduce((a, c) => a + c.y, 0) / 3;
    const corner = own.map(c => c.hex.reduce((b, p) => Math.hypot(p[0] - mx, p[1] - my) < Math.hypot(b[0] - mx, b[1] - my) ? p : b));
    z.x = Math.round(corner.reduce((a, p) => a + p[0], 0) / 3); z.y = Math.round(corner.reduce((a, p) => a + p[1], 0) / 3);
    z.hex = out; hqLocal[z.village] = out.map(([x, y]) => [x - z.x, y - z.y]);
    const low = own.reduce((a, c) => c.y > a.y ? c : a); z.labelX = low.x;
  }
  zones.forEach(z => {
    const h = half(z); z.plot = { x: z.x - h.w, y: z.y - h.t, w: h.w * 2, h: h.t + h.b }; z.labelY = z.y + h.b - (z.kind === "arena" ? 34 : 20);
    if (z.kind === 'arena') return;
    z.hexL = hexOf(z.role, z.village); z.hex = z.hexL.map(([x, y]) => [z.x + x, z.y + y]); z.clip = clips[z.role === 'hq' ? z.id : z.role] ||= stairPath(z.hexL);
  });
  // The lanes: one per shared edge between two districts, along the centre line between the two cells. u runs along
  // the lane and nrm points from the first cell to the second. Junctions are where lane ends meet.
  const lanes = [];
  for (const z of cells) z.hex.forEach((a, i) => {
    const n = z.next[i]; if (!n || n.zone === z.zone || cells.indexOf(n) < cells.indexOf(z)) return; const b = z.hex[(i + 1) % 6], na = n.hex[(i + 4) % 6], nb = n.hex[(i + 3) % 6];
    const A = [(a[0] + na[0]) / 2, (a[1] + na[1]) / 2], B = [(b[0] + nb[0]) / 2, (b[1] + nb[1]) / 2], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    lanes.push({ A, B, L, u: [dx / L, dy / L], nrm: [dy / L, -dx / L] });
  });
  const junctions = [];
  for (const p of lanes.flatMap(l => [l.A, l.B])) { const j = junctions.find(q => Math.hypot(q.x - p[0], q.y - p[1]) < 30); if (j) { j.sx += p[0]; j.sy += p[1]; j.n++; } else junctions.push({ x: p[0], y: p[1], sx: p[0], sy: p[1], n: 1 }); }
  junctions.forEach(j => { j.x = j.sx / j.n; j.y = j.sy / j.n; });

  // Solar fields in the woods, and the river datacenter with its stone suspension bridges on the main street (energy.js).
  const energy = window.Energy?.create({ M, RIVER, riverX, northStream, southStream, street: SY, bridges: [] });

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
    // The woodland track from the Colosseum gate to the honeycomb.
    if (Math.abs(y - SY) < 28 && x > arena.x - 20 && x < WEST + 10) return false; if (Math.abs(x - arena.x) < 28 && y > arena.y + 150 && y < SY + 28) return false;
    return true;
  }
  // Inside a tile or its forest-free margin.
  function nearPlot(x, y) { for (const z of cells) { const p = z.plot; if (x > p.x - 16 && x < p.x + p.w + 16 && y > p.y - 16 && y < p.y + p.h + 38 && inPoly(z.keepOut, x, y)) return true; } return false; }
  // A stone kerb around a polygon (a single plot, or a whole village's outline), lit on the top-left edges and
  // shaded on the bottom-right, with a soft dark rim on the grass outside.
  function kerb(k, hx) {
    const sh = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]), g3 = grow(hx, 3);
    k.poly(grow(hx, 5), S(C.grass1, -.08));
    k.poly(sh(g3, 1, 1), C.stone1); k.poly(sh(g3, -1, -1), C.stone5); k.poly(g3, C.stone3);
    // Kerb joints every few px along each edge.
    for (let i = 0; i < g3.length; i++) { const [x0, y0] = g3[i], [x1, y1] = g3[(i + 1) % g3.length], L = Math.hypot(x1 - x0, y1 - y0); for (let s = 5; s < L - 2; s += 9) k.px(x0 + (x1 - x0) * s / L, y0 + (y1 - y0) * s / L, C.stone2); }
  }
  // The tile's trimmed lawn, filling its hexagon exactly.
  function lawn(k, z) {
    const hx = z.hex; k.poly(hx, C.grass3); k.ditherPoly(hx, C.grass2, 1);
    const p = z.plot, inner = grow(hx, -6); for (let i = 0; i < 140; i++) { const x = p.x + P.hash(i, p.x) * p.w, y = p.y + P.hash(p.y, i) * p.h; if (inPoly(inner, x, y)) Props.tuft(k, x, y, C.grass2, C.grass4); }
  }
  // A single plot on its own (the zone preview): kerb, a lit and shaded inner edge, lawn.
  function plotGround(k, z) {
    const hx = z.hex, sh = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
    kerb(k, hx); k.poly(sh(hx, -1, -1), C.grass4); k.poly(sh(hx, 1, 1), S(C.grass3, -.14)); lawn(k, z);
  }
  // A lane's road as a quad, w px either side of its centre line and ext px past each end (into the junctions).
  function laneQuad(l, w, ext) {
    const [ux, uy] = l.u, [nx, ny] = l.nrm, a = [l.A[0] - ux * ext, l.A[1] - uy * ext], b = [l.B[0] + ux * ext, l.B[1] + uy * ext];
    return [[a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w, b[1] + ny * w], [b[0] - nx * w, b[1] - ny * w], [a[0] - nx * w, a[1] - ny * w]];
  }
  // The cobbled roads between the tiles, with a dark edging, and round junctions.
  function paintLanes(k) {
    const pat = cobblePat(k);
    for (const l of lanes) k.poly(laneQuad(l, 10, 6), C.stone1); for (const j of junctions) k.circle(j.x, j.y, 13, C.stone1);
    for (const l of lanes) { const q = laneQuad(l, 8, 6); k.poly(q, C.stone3); k.poly(q, pat); } for (const j of junctions) { k.circle(j.x, j.y, 11, C.stone3); k.circle(j.x, j.y, 11, pat); }
    for (const l of lanes) for (let d = 4; d < l.L; d += 5) { const x = l.A[0] + l.u[0] * d, y = l.A[1] + l.u[1] * d, h = P.hash(x, y); if (h < .3) k.px(x + l.nrm[0] * (h * 40 - 6), y + l.nrm[1] * (h * 40 - 6), C.stone4); }
    // Flowers on the upper verge (the lower verge holds the avenue trees).
    for (const l of lanes) { const s = l.nrm[1] > 0 ? -1 : 1; for (let d = 10; d < l.L - 6; d += 13) { const x = l.A[0] + l.u[0] * d + l.nrm[0] * s * 15, y = l.A[1] + l.u[1] * d + l.nrm[1] * s * 15; if (P.hash(x, y) < .5) Props.flower(k, x, y, ['#f6ecd0', '#f2c14e', '#c3a2c0', '#e98aa0'][(d / 13 | 0) % 4]); else Props.tuft(k, x, y, C.grass1, C.grass3); } }
  }
  // Avenue trees, lamps and bushes on each lane's lower verge, so they overlap the road rather than a district.
  function laneItems() {
    const out = [];
    for (const l of lanes) { const s = l.nrm[1] > 0 ? 1 : -1; for (let d = 20, j = 0; d < l.L - 16; d += 30, j++) {
      const x = Math.round(l.A[0] + l.u[0] * d + l.nrm[0] * s * 15), y = Math.round(l.A[1] + l.u[1] * d + l.nrm[1] * s * 15), h = P.hash(x, y);
      if (j % 4 === 2) out.push([x, y, 'fn', q => Props.lamp(q, x, y, true)]);
      else if (j % 4 === 3) out.push([x, y, 'fn', q => Props.bush(q, x, y, (x + y) & 3)]);
      else out.push([x, y, h < .35 ? 'birch' : h < .5 ? 'blossom' : 'oak', 0, Math.floor(h * 97)]);
    } }
    return out;
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
    // The honeycombs: every tile's lawn inside a stone kerb, and the lanes between the tiles.
    for (const z of zones) if (z.hex) plotGround(k, z);
    paintLanes(k);
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
    // Roads: only a woodland track from the Colosseum gate to the honeycomb, and the stubs onto the datacenter bridges.
    road(k, arena.x, arena.y + 210, arena.x, SY, 26, false); road(k, arena.x, SY, WEST, SY, 26, false);
    for (const x of [X3 + 180, MIRROR - X3 - 180]) road(k, x, SY, x + Math.sign(RIVER - x) * 50, SY, 26, true);
    if (!energy) bridge(k, riverX(SY), SY, 150, false); // energy.js builds the stone suspension bridges instead
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
    // Solar rows and inverters are y-sorted with the trees so the canopy overlaps them correctly.
    trees.push(...laneItems());
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
    // The worksites border Köle's tile. Out of Köle's gate onto the lane below, along it to the corner junction,
    // and into the worksite (the mine is straight across the lane).
    const home = zones.find(q => q.id === z.village + '-kole'), s = Math.sign(z.x - home.x), gate = [home.x, home.y + 140], lane = home.y + 150 + (TY - 310) / 2;
    return s ? [gate, [home.x, lane], [home.x + s * 157, lane], [z.x - s * 150, z.y - 5]] : [gate, [z.x, z.y - 110]];
  }
  function along(pts, p) { const L = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])); let d = p * L.reduce((a, b) => a + b, 0); for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const f = L[i] ? d / L[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, Math.sign(pts[i + 1][0] - pts[i][0])]; } d -= L[i]; } return pts[pts.length - 1]; }

  // Marching dashes around the selected plot (the arena keeps its rectangle).
  function selectRing(c, z, t) {
    const off = Math.floor(t * 10) % 8; c.fillStyle = '#fff2b0';
    if (!z.hex) { const p = z.plot; for (let i = -off; i < p.w; i += 8) { c.fillRect(p.x + i, p.y - 3, 4, 2); c.fillRect(p.x + p.w - i - 4, p.y + p.h + 1, 4, 2); } for (let i = -off; i < p.h; i += 8) { c.fillRect(p.x + p.w + 1, p.y + i, 2, 4); c.fillRect(p.x - 3, p.y + p.h - i - 4, 2, 4); } return; }
    const g = grow(z.hex, 3); let s = 0;
    for (let i = 0; i < g.length; i++) { const [x0, y0] = g[i], [x1, y1] = g[(i + 1) % g.length], n = Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))); for (let j = 0; j < n; j++, s++) if ((s + 8 - off) % 8 < 4) c.fillRect(Math.round(x0 + (x1 - x0) * j / n) - 1, Math.round(y0 + (y1 - y0) * j / n) - 1, 2, 2); }
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
        else { let leads = 0; d.animate(k, t, state, { lead: (x, y, o) => { if (!leads++ && !window.Avatars?.leadHook(z, x, y, o, t, state)) AgentCharacters.lead(k, z.role, x, y, t, state, o); }, crew: (x, y, o = {}) => AgentCharacters.crew(k, x, y, t, { state, ...o }), detail, village: z.village, id: z.id, x: z.x, y: z.y }); }
      } catch (e) { if (!z._err) { console.error(z.role, e); z._err = true; } }
      c.restore();
      const f = fronts[frontKey(z)]; if (f) c.drawImage(f.cv, z.x - f.ox, z.y - f.oy);
      if (z.kind === 'agent' || z.kind === 'resource') flagPost(k, z, t, state);
      if (sel === z.id) selectRing(c, z, t);
    }
    // Köle crews commute between the workshop and the resource fields.
    for (const z of zones) {
      if (z.kind !== 'resource') continue; const state = stateOf(z, states), route = kolePath(z);
      // Three shackled workers (orcs, goblins or hollows) walk out and haul loads back; an overseer walks behind the first.
      const worker = { lumberyard: 'orc', mine: 'goblin', farm: 'hollow' }[z.role], boss = { lumberyard: 'uruk', mine: 'demon', farm: 'wraith' }[z.role];
      for (let i = 0; i < 4; i++) {
        const lead = i === 3, ph = ((state === 'working' ? t / 80 : 0) + (lead ? -.035 : i / 3) + z.x * .001 + 1) % 1, back = ph > .5, [x, y, dir] = along(route, back ? 2 - ph * 2 : ph * 2);
        if (x < v.l - 20 || x > v.r + 20 || y < v.t - 40 || y > v.b + 10) continue;
        const carry = back && !lead ? { lumberyard: 'wood', mine: 'ore', farm: 'food' }[z.role] : '';
        AgentCharacters.crew(k, Math.round(x + (lead ? 0 : i % 2 ? 6 : -6)), Math.round(y), t, { kind: lead ? boss : worker, look: i, anim: state === 'working' ? (lead ? 'walk' : carry ? 'carry' : 'chained') : 'idle', carry, chains: !lead, facing: back ? -dir : dir, phase: i, state, mark: false });
      }
    }
    if (detail) {
      // Villagers stroll across the river bridge and along the main street.
      for (let i = 0; i < 10; i++) { const ph = (t * .012 + i / 10) % 1, dir = i % 2 ? 1 : -1, x = dir > 0 ? RIVER - 220 + ph * 440 : RIVER + 220 - ph * 440, y = SY + (i % 3 - 1) * 6; if (x < v.l || x > v.r || y < v.t || y > v.b + 30) continue; AgentCharacters.crew(k, x, y + 4, t, { look: i, hat: ['none', 'hood', 'scarf', 'cap'][i % 4], hatColor: ['#c3a2c0', '#6a7ab0', C.red2][i % 3], anim: 'walk', facing: dir, phase: i, state: 'working' }); }
      energy?.front(k, t, v); // the bridge's south cables and tower piers pass in front of the strollers
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
  const titles = [[CX, TOP - 46, 'GKTC’S VILLAGE', 'THE WESTERN REALM'], [MIRROR - CX, TOP - 46, 'DAGHAN’S VILLAGE', 'ACROSS THE RIVER'], [arena.x, arena.y - 262, 'THE WESTERN WOODS', 'THE COLOSSEUM'], ...(energy ? [energy.title] : [])];

  window.VillageWorld = { width: W, height: H, zones, render, renderView, hitTest, footprint, hexOf, stairPath, plotGround, trimmed, minimapCanvas, titles, stateOf, home: { gktc: [CX, (TOP + BOT) / 2], daghan: [MIRROR - CX, (TOP + BOT) / 2] }, energy: energy?.focus, ready: () => { if (!ground) ground = bake(); } };
})();
