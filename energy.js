/* Energy for the villages: solar fields in forest clearings, buried cables that carry their power to the river,
   and a datacenter on an island in the river where the main street crosses. Hydro turbines under it feed the
   servers, and stone suspension bridges run from its sides to both banks.
   world.js bakes the static art: paintGround() before the trees and items() y-sorted with the trees. animate()
   runs every frame and front() after the strollers on the bridge. Both are culled to the view. Deterministic time math only. */
(() => {
  const P = window.Pixel, C = P.C;
  const T = {
    cell0: '#162a58', cell1: '#1d3a73', cell2: '#27508f', cell3: '#3a68aa', grid: '#4a67a0', sky: '#8db4e6', skyHi: '#e2f1ff',
    frame: '#c3cbd4', frameHi: '#eef2f6', frameLo: '#7d8794', under: '#262c38', leg: '#9aa2ad', legLo: '#5a616b',
    box: '#c9ced6', boxHi: '#e8ebef', boxLo: '#8e97a3', mesh: '#b8c2cc',
    n0: '#0d1018', n1: '#161a27', n2: '#1f2538', n3: '#2b334c', n4: '#3e4866', rack: '#1b2132', slot: '#262d42',
    pad0: '#484e5c', pad1: '#565d6d', pad2: '#666e80', walk: '#7a8294',
    cyan: '#4ff0ff', cyanHi: '#d8feff', cyanLo: '#1d8ea6', violet: '#b377ff', violetLo: '#5d3c9c', amber: '#ffc14a', red: '#ff4a3d', green: '#6dff9a',
    tank: '#6e7a78', tankHi: '#8d9a97', tankLo: '#56615e', porcelain: '#e6e0d4', band: '#8a5a3a'
  };
  const fade = (col, as) => as.map(a => P.alpha(col, a));

  function create(o) {
    const { M, RIVER, riverX, northStream: nS, southStream: sS } = o;
    const wet = (x, y) => Math.abs(y - nS(x)) < 27 || Math.abs(y - sS(x)) < 27 || Math.abs(x - riverX(y)) < 56;
    const nearBridge = (x, y) => o.bridges.some(b => Math.abs(x - b) < 21) && (Math.abs(y - nS(x)) < 46 || Math.abs(y - sS(x)) < 46);
    const onBank = (x, y) => Math.abs(y - nS(x)) < 37 || Math.abs(y - sS(x)) < 37 || Math.abs(x - riverX(y)) < 66;

    /* ---------- Paths (1 px samples) ---------- */
    function seg(pts, a, b, wob) {
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy); if (!len) return;
      const n = Math.ceil(len), nx = -dy / len, ny = dx / len;
      for (let i = 0; i < n; i++) { const f = i / n, w = wob ? Math.sin(f * Math.PI) * (Math.sin(f * len / 17 + a[0]) * 2 + Math.sin(f * len / 41 + a[1]) * 3) : 0; pts.push([Math.round(a[0] + dx * f + nx * w), Math.round(a[1] + dy * f + ny * w)]); }
    }
    function bank(pts, f, off, x0, x1) { const d = Math.sign(x1 - x0) || 1; for (let x = x0; d > 0 ? x <= x1 : x >= x1; x += d) pts.push([x, f(x) + off]); }
    function curve(pts, a, b, sag) { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(len); for (let i = 0; i < n; i++) { const u = i / n; pts.push([Math.round(a[0] + (b[0] - a[0]) * u), Math.round(a[1] + (b[1] - a[1]) * u + sag * 4 * u * (1 - u))]); } }
    function finalize(raw) {
      const pts = []; for (const p of raw) { const q = pts[pts.length - 1]; if (!q || q[0] !== p[0] || q[1] !== p[1]) pts.push(p); }
      const hid = new Uint8Array(pts.length); let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
      pts.forEach(([x, y], i) => { if (wet(x, y) || nearBridge(x, y)) hid[i] = 1; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
      return { pts, hid, box: { l, r, t, b } };
    }

    /* ---------- Solar fields (layout px before the margin shift) ---------- */
    const FIELDS = [
      { x: 270, y: 640, rows: 3, mods: 22, side: 1, stream: 'n', bank: 1 },                // above the Colosseum
      { x: 300, y: -60, rows: 3, mods: 22, side: 1, stream: 'n', bank: 1, cross: true },   // north-west woods
      { x: 236, y: 1400, rows: 3, mods: 22, side: 1, stream: 's', bank: -1 },              // below the Colosseum
      { x: 250, y: 2330, rows: 3, mods: 20, side: 1, stream: 's', bank: -1, cross: true }, // south-west woods
      { x: 2150, y: 1810, rows: 3, mods: 22, side: 1, river: 1 },                          // below GGI's orchard
      { x: 2912, y: 1810, rows: 3, mods: 22, side: -1, river: -1 },                        // below DGI's orchard
      { x: 2912, y: 580, rows: 4, mods: 24, side: -1, river: -1 },                         // by Daghan's Healing Gardens
      { x: 2130, y: 580, rows: 4, mods: 24, side: 1, river: 1 },                           // by GKTC's Healing Gardens
      { x: 4540, y: 1380, rows: 3, mods: 14, side: -1, stream: 's', bank: -1 }             // eastern woods
    ];
    const fields = FIELDS.map((f, i) => {
      const fx = f.x + M, fy = f.y + M, fw = f.mods * 10 + 38, fh = f.rows * 28 + 28;
      const px0 = fx + (f.side > 0 ? 12 : 26), px1 = px0 + f.mods * 10;
      const ix = f.side > 0 ? px1 + 6 : fx + 8, iy = fy + fh - 18, tx = ix + 6;
      const ry = [...Array(f.rows)].map((_, r) => fy + 8 + r * 28);
      const raw = [], s = [tx, iy + 3], out = [f.side > 0 ? fx + fw + 9 : fx - 9, iy + 3];
      seg(raw, s, out, false);
      if (f.river) { const ey = out[1] + 14; seg(raw, out, [riverX(ey) - f.river * 62, ey], true); }
      else {
        const fn = f.stream === 'n' ? nS : sS, off = f.bank * 31, near = f.cross ? -off : off, bx = out[0];
        seg(raw, out, [bx, fn(bx) + near], true);
        if (f.cross) seg(raw, [bx, fn(bx) + near], [bx, fn(bx) + off], false);
        const d = Math.sign(RIVER - bx); bank(raw, fn, off, bx, Math.round(riverX(fn(RIVER) + off) - d * 62));
      }
      return { ...f, i, fx, fy, fw, fh, px0, px1, ix, iy, tx, ry, cable: finalize(raw) };
    });


    /* ---------- The river datacenter: basin, island, stone suspension bridges ---------- */
    const R = RIVER, SY = o.street, GROW = 115;
    const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    const bs = y => Math.max(0, Math.min(sm((y - (SY - 52)) / 44), 1 - sm((y - (SY + 280)) / 85)));   // basin widening 0..1
    const bcx = y => riverX(y) + (R - riverX(y)) * Math.min(1, bs(y) * 2), bhw = y => 50 + GROW * bs(y);
    const B0 = SY - 60, B1 = SY + 372;
    const IX0 = R - 84, IX1 = R + 84, IY0 = SY - 22, IY1 = SY + 200;       // island (plan)
    const BY = SY + 196, BH = 62, BD = 80;                                 // datacenter front wall base, height, roof depth
    const DX0 = R - 200, DX1 = R + 200;                                    // stone deck
    // Suspension towers: [x, height]. The south pier stands at the deck's south edge, the north pier behind it.
    const towers = [[R - 172, 48], [R - 64, 84], [R + 64, 84], [R + 172, 48]];
    const topN = ([x, h]) => [x, SY - 17 - h - 5], topS = ([x, h]) => [x, SY + 17 - h - 5];
    function sagFor(a, b, low) { for (let s = 0; s < 300; s += .5) { const d = b[1] - a[1], u = Math.min(1, Math.max(0, (d + 4 * s) / (8 * s || 1))), y = a[1] + d * u + 4 * s * u * (1 - u); if (y >= low) return s; } return 0; }
    function cableAt(a, b, s, x) { const u = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u + 4 * s * u * (1 - u); }
    // Main cables: each runs from a bank tower to an island tower (so energy flows toward the datacenter).
    const spans = [];
    for (const [bi, ii] of [[0, 1], [3, 2]]) for (const side of ['N', 'S']) {
      const top = side === 'N' ? topN : topS, a = top(towers[bi]), b = top(towers[ii]), low = side === 'N' ? SY - 22 : SY + 9, s = sagFor(a, b, low);
      const pts = [], dir = Math.sign(b[0] - a[0]); for (let x = a[0]; x !== b[0] + dir; x += dir) pts.push([x, Math.round(cableAt(a, b, s, x))]);
      spans.push({ side, a, b, s, pts, deck: side === 'N' ? SY - 18 : SY + 12 });
    }
    const strips = [[DX0, R - 84, SY + 18], [DX1, R + 84, SY + 18], [DX0, R - 84, SY - 17], [DX1, R + 84, SY - 17]].map(([x0, x1, y]) => { const pts = [], d = Math.sign(x1 - x0); for (let x = x0; x !== x1; x += d) pts.push([x, y]); return { pts, front: y > SY }; });
    const conduits = [R - 65, R, R + 65].map(x => { const pts = []; for (let y = IY1 + 6; y >= BY - BH + 5; y--) pts.push([x, y]); return pts; });
    const arches = [R - 64, R, R + 64], RT = BY - BH - BD, fans = [[R - 48, RT + 20], [R - 24, RT + 20], [R - 48, RT + 44], [R - 24, RT + 44]];
    const riverBox = { l: DX0 - 10, r: DX1 + 10, t: SY - 130, b: B1 };
    const dry = (x, y) => (y > SY - 24 && y < IY1 + 14 && Math.abs(x - R) < 88) || (Math.abs(y - SY) < 24 && Math.abs(x - R) < 202);

    /* ---------- Tree exclusion ---------- */
    const cells = new Set(), key = (x, y) => (x >> 2) * 4096 + (y >> 2);
    for (const f of fields) f.cable.pts.forEach(([x, y]) => { for (let dx = -4; dx <= 4; dx += 4) for (let dy = -4; dy <= 4; dy += 4) cells.add(key(x + dx, y + dy)); });
    function blocks(x, y) {
      for (const f of fields) if (x > f.fx - 10 && x < f.fx + f.fw + 10 && y > f.fy - 4 && y < f.fy + f.fh + 24) return true;
      if (Math.abs(x - R) < 215 && y > B0 - 70 && y < B1 + 10) return true;
      return cells.has(key(x | 0, y | 0));
    }

    /* ---------- Static art ---------- */
    function paintField(k, f) {
      const { fx, fy, fw, fh } = f;
      k.rect(fx - 2, fy - 1, fw + 4, fh + 2, C.grass2); k.dither(fx - 2, fy - 1, fw + 4, fh + 2, C.grass3, 0);
      k.rect(fx, fy + 1, fw, fh - 2, C.grass3); k.dither(fx, fy + 1, fw, fh - 2, C.grass4, 1);
      for (let i = 0; i < fw * fh / 260; i++) Props.tuft(k, fx + 2 + P.hash(i, fx) * (fw - 6), fy + 3 + P.hash(fy, i) * (fh - 8), C.grass2, C.grass4);
      for (let i = 0; i < 5; i++) Props.flower(k, fx + 4 + P.hash(i, fy + 3) * (fw - 8), fy + fh - 4 - P.hash(i, fx + 5) * 6, ['#f6ecd0', '#f2c14e', '#c3a2c0'][i % 3]);
      // Ground shadows under the tilted rows.
      for (const y of f.ry) { k.rect(f.px0 + 2, y + 4, f.px1 - f.px0 + 1, 13, C.shadowSoft); k.rect(f.px0 + 3, y + 13, f.px1 - f.px0, 5, C.shadow); }
      // Maintenance path along the south edge.
      const py = fy + fh - 14; k.rect(fx + 3, py, fw - 6, 10, C.dirt2); k.rect(fx + 4, py + 1, fw - 8, 8, C.dirt3); k.dither(fx + 4, py + 1, fw - 8, 8, C.dirt4, 1);
      k.rect(fx + 6, py + 3, fw - 12, 1, C.dirt2); k.rect(fx + 6, py + 6, fw - 12, 1, C.dirt2);
      for (let i = 0; i < fw / 5; i++) k.px(fx + 5 + P.hash(i, py) * (fw - 10), py + 1 + P.hash(py, i) * 7, i % 2 ? C.stone3 : C.dirt1);
      // Cable trench from the combiner boxes down to the inverter, then out of the field.
      const t0 = f.ry[0] + 8, t1 = f.iy - 14;
      k.rect(f.tx - 1, t0, 3, t1 - t0, C.dirt1); k.rect(f.tx, t0, 1, t1 - t0, C.dirt0);
      for (let y = t0 + 1; y < t1; y += 3) k.px(f.tx - 1 + (y % 2) * 2, y, C.stone3);
      const ox = f.side > 0 ? f.fx + f.fw : f.fx, ex = f.side > 0 ? f.tx + 1 : ox, ew = Math.abs(ox - f.tx);
      k.rect(ex, f.iy + 2, ew, 3, C.dirt1); k.rect(ex, f.iy + 3, ew, 1, C.dirt0);
    }
    function paintCable(k, cab) {
      const { pts, hid } = cab; let lastMark = -99;
      pts.forEach(([x, y], i) => {
        if (hid[i]) return; const bankSide = onBank(x, y);
        k.px(x, y, bankSide ? C.dirt1 : '#4a733f');
        if (!bankSide && i - lastMark > 90 && i > 30) { lastMark = i; k.rect(x + 1, y - 3, 1, 3, C.paper); k.px(x + 1, y - 4, '#e07a2a'); k.px(x + 2, y, C.shadow); }
      });
      const [x, y] = pts[pts.length - 1]; k.rect(x - 2, y - 2, 5, 4, C.stone2); k.rect(x - 2, y - 2, 5, 1, C.stone4); k.px(x, y - 1, T.cyanLo);
    }
    function drawRow(k, f, r) {
      const y = f.ry[r], x0 = f.px0, n = f.mods, W = n * 10, band = (f.i * 53 + 20) % (W + 60);
      // Rear legs peek out under the raised back edge; front posts stand on the grass.
      for (let m = 0; m <= n; m += 3) { const lx = x0 + Math.min(m * 10, W - 2); k.rect(lx, y + 12, 1, 5, T.leg); k.px(lx + 1, y + 13, T.legLo); k.px(lx, y + 17, C.grass1); }
      k.rect(x0, y + 12, W, 1, T.under); k.rect(x0 + 1, y + 13, W - 1, 1, '#1a1f2a');
      // Cells: brighter toward the raised top edge (sky), darker at the low front edge; a diagonal sky reflection.
      const rowsC = [[1, 3, 0], [5, 2, 1], [8, 3, 2]];
      for (let m = 0; m < n; m++) {
        const mx = x0 + m * 10, d = (m * 10 - r * 16 - band + 800) % (W + 60), lit = d >= 0 && d < 26, hi = lit && d > 8 && d < 16;
        for (const [oy, h, tone] of rowsC) k.rect(mx + 1, y + oy, 8, h, lit ? [hi ? '#a8c8f0' : T.sky, '#5f8ccc', '#3b64a6'][tone] : ['#33609f', '#264a88', '#1b3670'][tone]);
        k.rect(mx + 1, y + 4, 8, 1, lit ? '#6f95cf' : T.grid); k.rect(mx + 1, y + 7, 8, 1, lit ? '#5d85c2' : '#3d5c98');
        k.rect(mx + 3, y + 1, 1, 10, lit ? '#6f95cf' : '#3f5f9c'); k.rect(mx + 6, y + 1, 1, 10, lit ? '#6f95cf' : '#3f5f9c');
        k.rect(mx, y + 1, 1, 10, '#8d9ab0'); k.rect(mx + 9, y, 1, 12, T.under);
        if (hi) k.px(mx + 2 + (d % 5), y + 2, T.skyHi);
      }
      k.rect(x0, y, W - 1, 1, T.frameHi); k.rect(x0, y + 11, W - 1, 1, T.frameLo);
      // End struts and the combiner box on the service side.
      k.rect(x0 - 1, y + 2, 1, 15, T.legLo); k.rect(x0 + n * 10 - 1, y + 2, 1, 15, T.legLo);
      const bx = f.side > 0 ? f.px1 + 1 : f.px0 - 7;
      k.rect(bx + 2, y + 8, 1, 9, T.legLo); k.rect(bx, y + 3, 6, 6, T.box); k.rect(bx, y + 3, 6, 1, T.boxHi); k.rect(bx + 5, y + 4, 1, 5, T.boxLo); k.px(bx + 1, y + 5, '#e07a2a');
      const cx0 = f.side > 0 ? bx + 6 : f.tx, cx1 = f.side > 0 ? f.tx : bx; k.rect(cx0, y + 7, cx1 - cx0, 1, T.under);
      for (let i = 0; i < n; i += 4) Props.tuft(k, x0 + i * 10 + 4 + (r % 2) * 3, y + 18, C.grass2, C.grass4);
    }
    function drawInverter(k, f) {
      const x = f.ix, y = f.iy;
      k.rect(x - 2, y - 1, 16, 3, C.stone3); k.rect(x - 2, y + 1, 16, 1, C.stone2); k.rect(x + 1, y + 2, 14, 2, C.shadow);
      k.rect(x, y - 12, 12, 12, T.box); k.rect(x, y - 12, 1, 12, T.boxHi); k.rect(x + 11, y - 12, 1, 12, T.boxLo); k.rect(x, y - 1, 12, 1, T.boxLo);
      k.rect(x, y - 16, 12, 4, T.boxHi); k.rect(x, y - 16, 12, 1, '#ffffff'); k.rect(x + 11, y - 15, 1, 3, T.box);
      for (let j = 0; j < 3; j++) k.rect(x + 2, y - 10 + j * 2, 5, 1, T.boxLo);
      k.rect(x + 8, y - 11, 3, 3, '#1c2b24'); k.rect(x + 2, y - 4, 3, 1, '#f2c14e'); k.px(x + 3, y - 5, '#f2c14e');
    }
    function paintBasin(k) {
      const layers = [[12, C.dirt2], [8, C.dirt3], [4, C.dirt4, 1], [0, C.water1], [-8, C.water2], [-20, C.water3, 1], [-34, C.water3]];
      for (const [d, col, dz] of layers) { const L = [], Rr = []; for (let y = B0; y <= B1; y += 3) { const w = bhw(y) + d, c = bcx(y); L.push([c - w, y]); Rr.push([c + w, y]); } const pts = [...L, ...Rr.reverse()]; if (dz) k.ditherPoly(pts, col); else k.poly(pts, col); }
      k.ditherEllipse(R, SY + 200, 118, 140, C.water2, 1);
      // Reeds and stones where the basin meets the trimmed orchards.
      for (let i = 0; i < 46; i++) { const y = SY + 30 + P.hash(i, 91) * 300, s = i % 2 ? 1 : -1, x = bcx(y) + s * (bhw(y) + 2 + P.hash(i, 92) * 6); if (i % 5 === 0) Props.rock(k, x, y, i % 3, i); else { k.rect(x, y - 5, 1, 6, C.leaf2); k.rect(x + 2, y - 7, 1, 8, C.leaf3); k.rect(x + 2, y - 8, 1, 2, C.wood2); } }
      for (let i = 0; i < 14; i++) { const y = SY + 60 + P.hash(i, 93) * 260, x = R + (i % 2 ? 1 : -1) * (100 + P.hash(i, 94) * 40); k.ellipse(x, y, 3, 2, C.leaf3); k.px(x - 1, y - 1, C.leaf4); if (i % 3 === 0) k.px(x + 1, y - 1, '#ffc6d8'); }
    }
    function paintIsland(k) {
      // Wake, shadow, quay walls with turbine arches, and the stone plaza.
      k.ditherEllipse(R, IY0 + 4, 70, 12, C.water5, 1); k.ditherEllipse(R, IY1 + 30, 90, 22, C.water4, 1);
      k.rect(IX0 + 5, IY1 + 12, IX1 - IX0, 5, C.shadow); k.rect(IX1, IY0 + 8, 5, IY1 - IY0 + 8, C.shadow);
      k.poly([[IX0 + 8, IY0], [IX1 - 8, IY0], [IX1, IY0 + 8], [IX1, IY1], [IX0, IY1], [IX0, IY0 + 8]], C.stone2);
      Props.cobbles(k, IX0 + 3, IY0 + 3, IX1 - IX0 - 6, IY1 - IY0 - 5, 11, C.stone3);
      k.rect(IX0, IY1 - 2, IX1 - IX0, 2, C.stone4); k.rect(IX0, IY0 + 8, 2, IY1 - IY0 - 8, C.stone4); k.rect(IX1 - 2, IY0 + 8, 2, IY1 - IY0 - 8, C.stone1);
      k.rect(IX0, IY1, IX1 - IX0, 12, C.stone2); k.rect(IX0, IY1, IX1 - IX0, 1, C.stone5); k.rect(IX0, IY1 + 11, IX1 - IX0, 1, C.stone0);
      for (let y = IY1 + 4; y < IY1 + 11; y += 4) for (let x = IX0 + ((y / 4) % 2) * 5; x < IX1; x += 10) k.rect(x, y, 1, 3, C.stone1);
      for (let y = IY1 + 3; y < IY1 + 11; y += 4) k.rect(IX0, y, IX1 - IX0, 1, C.stone1);
      for (const x of arches) {
        k.rect(x - 9, IY1 + 1, 18, 11, C.stone1); k.rect(x - 8, IY1 + 3, 16, 9, C.water0); k.rect(x - 6, IY1 + 2, 12, 1, C.water0); k.rect(x - 9, IY1, 18, 1, C.stone4);
        k.rect(x - 1, IY1 - 2, 3, 3, T.n2); k.px(x, IY1 - 1, T.cyanLo);
        k.dither(x - 8, IY1 + 12, 16, 4, C.foam, 0); k.dither(x - 10, IY1 + 16, 20, 6, C.water5, 1);
      }
      // Stone wings join the island towers to the datacenter; stairs lead down from the deck.
      for (const x of [R - 70, R + 58]) { k.rect(x, SY + 22, 12, BY - BH - BD - SY - 22 + 4, C.stone2); k.rect(x, SY + 22, 12, 2, C.stone4); k.rect(x, SY + 22, 1, BY - BH - BD - SY - 18, C.stone3); k.rect(x + 5, SY + 26, 2, BY - BH - BD - SY - 26, '#12394a'); k.rect(x + 6, SY + 26, 1, BY - BH - BD - SY - 26, T.cyanLo); }
      for (let i = 0; i < 5; i++) { k.rect(R - 16, SY + 22 + i * 3, 32, 3, i % 2 ? C.stone3 : C.stone4); k.rect(R - 16, SY + 24 + i * 3, 32, 1, C.stone2); }
      for (const [x, y] of [[IX0 + 6, IY1 - 4], [IX1 - 7, IY1 - 4], [IX0 + 6, SY + 34], [IX1 - 7, SY + 34]]) { k.rect(x, y - 14, 1, 14, T.frameLo); k.rect(x - 1, y - 16, 3, 2, T.n3); k.rect(x - 1, y - 15, 3, 1, T.cyanHi); }
    }
    function paintBuilding(k) {
      const x0 = R - 70, x1 = R + 70, wt = BY - BH, rt = wt - BD;
      k.rect(x1, rt + 8, 6, BH + BD - 4, C.shadow); k.rect(x0 + 4, BY, 140, 3, C.shadow);
      // Roof: dark panels, fans, skylight, dish and antenna. The hologram projector sits in the middle.
      k.poly([[x0, wt], [x0, rt + 8], [x0 + 8, rt], [x1 - 8, rt], [x1, rt + 8], [x1, wt]], T.n2);
      for (let x = x0 + 10; x < x1; x += 12) k.rect(x, rt + 1, 1, BD - 2, T.n1); for (let y = rt + 14; y < wt - 2; y += 14) k.rect(x0 + 1, y, 138, 1, T.n1);
      k.rect(x0 + 8, rt, 124, 1, T.n4); k.line(x0, rt + 8, x0 + 8, rt, T.n4); k.line(x1 - 8, rt, x1, rt + 8, T.n4); k.rect(x0, rt + 8, 1, BD - 8, T.n3); k.rect(x0, wt - 2, 140, 2, T.n3); k.rect(x0, wt - 3, 140, 1, '#23657a');
      for (const [fx, fy] of fans) { k.rect(fx - 10, fy - 8, 20, 16, T.n3); k.rect(fx - 10, fy - 8, 20, 1, T.n4); k.rect(fx - 10, fy - 8, 1, 16, T.n4); k.rect(fx + 9, fy - 7, 1, 15, T.n1); k.rect(fx - 10, fy + 7, 20, 1, T.n1); k.ellipse(fx, fy, 8, 6, T.n0); }
      k.ellipse(R, rt + 40, 9, 5, T.n3); k.ellipse(R, rt + 40, 6, 3, T.n0); k.ring(R, rt + 40, 6, 3, T.cyanLo);
      // A small solar array on the roof, like the fields in the woods.
      for (let r = 0; r < 2; r++) { const y = wt - 24 + r * 11; k.rect(R - 61, y + 8, 50, 2, T.under); for (let m = 0; m < 5; m++) { const mx = R - 61 + m * 10; k.rect(mx, y, 9, 8, '#264a88'); k.rect(mx, y, 9, 2, '#33609f'); k.rect(mx + 3, y, 1, 8, '#3f5f9c'); k.rect(mx + 6, y, 1, 8, '#3f5f9c'); k.rect(mx, y + 4, 9, 1, '#3d5c98'); k.rect(mx, y, 9, 1, T.frameHi); k.rect(mx + 9, y, 1, 8, T.under); } }
      k.rect(R + 14, wt - 22, 48, 7, T.n0); k.rect(R + 15, wt - 21, 46, 5, '#12394a'); for (let x = R + 17; x < R + 60; x += 4) k.px(x, wt - 19, '#1f6d80');
      k.rect(R + 34, rt + 30, 2, 6, T.frameLo); k.ellipse(R + 36, rt + 25, 8, 5, T.frameLo); k.ellipse(R + 35, rt + 24, 7, 4, T.frameHi); k.ellipse(R + 36, rt + 25, 4, 2, T.frame); k.line(R + 36, rt + 25, R + 41, rt + 19, T.frameLo); k.px(R + 41, rt + 18, T.cyan);
      k.rect(R + 52, rt + 14, 5, 4, T.n4); k.rect(R + 54, rt - 22, 1, 36, T.frame); for (const y of [rt - 12, rt - 2, rt + 6]) k.rect(R + 51, y, 7, 1, T.frameLo); k.line(R + 54, rt - 22, R + 49, rt + 6, T.frameLo); k.line(R + 54, rt - 22, R + 59, rt + 6, T.frameLo);
      // Facade: stone pilasters and cornice (the bridge's stone) framing dark glass, server racks and a glowing atrium.
      k.rect(x0, wt, 140, BH, T.n1);
      for (const px of [x0, x1 - 10]) { k.rect(px, wt - 4, 10, BH + 4, C.stone3); k.rect(px, wt - 4, 1, BH + 4, C.stone4); k.rect(px + 9, wt - 4, 1, BH + 4, C.stone1); for (let y = wt + 2; y < BY; y += 6) k.rect(px + 1, y, 8, 1, C.stone2); k.rect(px + 4, wt, 2, BH - 2, '#12394a'); k.rect(px + 5, wt, 1, BH - 2, T.cyanLo); }
      k.rect(x0 - 2, wt - 6, 144, 5, C.stone4); k.rect(x0 - 2, wt - 6, 144, 1, C.stone5); k.rect(x0 - 2, wt - 2, 144, 1, C.stone1); k.rect(x0 + 10, wt - 1, 120, 1, T.cyanLo);
      for (const wx of [R - 56, R - 34, R + 16, R + 38]) {
        k.rect(wx - 1, wt + 7, 20, 36, T.n3); k.rect(wx, wt + 8, 18, 34, T.n0);
        for (let r = 0; r < 3; r++) { const x = wx + 1 + r * 6; k.rect(x, wt + 9, 4, 32, T.rack); for (let y = wt + 9; y < wt + 41; y += 3) k.rect(x, y, 4, 1, T.slot); }
        k.line(wx + 1, wt + 40, wx + 14, wt + 10, '#26314e'); k.rect(wx - 1, wt + 43, 20, 1, T.n4);
      }
      k.rect(R - 11, wt, 22, BH - 4, T.n3); k.rect(R - 10, wt + 1, 20, BH - 6, '#0e1a26'); k.rect(R - 10, wt + 1, 20, 1, T.cyanLo); k.rect(R, wt + 1, 1, BH - 6, T.n2);
      const hx = [[0, -7], [6, -3], [6, 4], [0, 8], [-6, 4], [-6, -3]]; for (let i = 0; i < 6; i++) { const a = hx[i], b = hx[(i + 1) % 6]; k.line(R + a[0], wt + 20 + a[1], R + b[0], wt + 20 + b[1], T.cyanLo); }
      k.text('DC', R - 3, wt + 17, T.cyan);
      k.rect(x0, BY - 6, 140, 6, C.stone2); k.rect(x0, BY - 6, 140, 1, C.stone4); k.rect(x0 + 10, BY - 7, 120, 1, T.violetLo); for (let x = x0 + 4; x < x1; x += 8) k.rect(x, BY - 4, 1, 3, C.stone1);
    }
    function pier(k, x, top, base, far, crown) {
      const face = far ? C.stone2 : C.stone3, lite = far ? C.stone3 : C.stone4;
      k.rect(x - 6, top, 12, base - top, face); k.rect(x - 6, top, 1, base - top, lite); k.rect(x + 5, top, 1, base - top, C.stone1);
      for (let y = top + 6; y < base - 1; y += 6) k.rect(x - 5, y, 10, 1, far ? C.stone1 : C.stone2);
      k.rect(x - 1, top + 6, 2, base - top - 14, '#12394a'); k.rect(x, top + 6, 1, base - top - 14, T.cyanLo);
      k.rect(x - 8, top - 3, 16, 4, C.stone4); k.rect(x - 8, top - 3, 16, 1, C.stone5); k.rect(x - 8, top + 1, 16, 1, C.stone1); k.rect(x - 2, top - 5, 4, 2, T.frameLo);
      if (crown) { k.poly([[x - 6, top - 3], [x, top - 20], [x + 6, top - 3]], T.n2); k.poly([[x - 6, top - 3], [x, top - 20], [x, top - 3]], T.n4); k.line(x, top - 20, x, top - 4, T.cyanLo); }
    }
    function cable(k, sp) {
      const { pts } = sp; for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], ny = pts[i + 1] ? pts[i + 1][1] : y, y0 = Math.min(y, ny), h = Math.abs(ny - y) + 2; k.rect(x, y0, 1, h, '#454c58'); k.px(x, y0, '#a4adb8'); }
      for (const [x, y] of pts) if ((x - R) % 6 === 0 && Math.abs(x - sp.a[0]) > 7 && Math.abs(x - sp.b[0]) > 7 && sp.deck - y > 2) k.rect(x, y + 2, 1, sp.deck - y - 2, T.frameLo);
    }
    function backstays(k, side) {
      for (const [x] of [towers[0], towers[3]]) { const tp = (side === 'N' ? topN : topS)([x, 48]), ax = x < R ? DX0 + 4 : DX1 - 4, ay = side === 'N' ? SY - 17 : SY + 13; k.line(tp[0], tp[1], ax, ay, '#454c58'); }
    }
    function deck(k) {
      k.rect(DX0, SY - 19, DX1 - DX0, 5, C.stone3); k.rect(DX0, SY - 19, DX1 - DX0, 1, C.stone4); k.rect(DX0, SY - 15, DX1 - DX0, 1, C.stone1); k.rect(DX0, SY - 17, DX1 - DX0, 1, T.cyanLo);
      Props.cobbles(k, DX0, SY - 14, DX1 - DX0, 26, 7, C.stone3); k.rect(DX0, SY - 14, DX1 - DX0, 1, C.stone2);
      for (const [x0, x1] of [[R - 166, IX0], [IX1, R + 166]]) { k.rect(x0 + 3, SY + 22, x1 - x0, 7, C.shadow); k.rect(x0, SY + 21, x1 - x0, 3, C.stone1); for (let x = x0 + 6; x < x1 - 4; x += 14) k.rect(x, SY + 24, 3, 3, C.stone1); }
      for (const x of [DX0, DX1 - 8]) { k.rect(x, SY - 24, 8, 10, C.stone3); k.rect(x, SY - 24, 8, 2, C.stone5); k.rect(x + 3, SY - 30, 2, 6, T.frameLo); k.rect(x + 2, SY - 32, 4, 2, T.cyanHi); }
    }
    function frontParts(k) {
      // Everything on the deck's south side: the parapet, the south cables and hangers, and the south tower piers.
      backstays(k, 'S'); for (const sp of spans) if (sp.side === 'S') cable(k, sp);
      for (const [x0, x1] of [[DX0, R - 15], [R + 15, DX1]]) { const w = x1 - x0; k.rect(x0, SY + 12, w, 4, C.stone4); k.rect(x0, SY + 12, w, 1, C.stone5); k.rect(x0, SY + 16, w, 5, C.stone2); k.rect(x0, SY + 18, w, 1, T.cyanLo); k.rect(x0, SY + 20, w, 1, C.stone1); for (let x = x0 + 3; x < x1; x += 9) k.rect(x, SY + 16, 1, 2, C.stone1); }
      for (let i = 0; i < 4; i++) { k.rect(R - 15, SY + 11 + i * 3, 30, 3, i % 2 ? C.stone3 : C.stone4); k.rect(R - 15, SY + 13 + i * 3, 30, 1, C.stone2); }
      for (const [x0, x1] of [[DX0, R - 166], [R + 166, DX1]]) { k.rect(x0, SY + 21, x1 - x0, 4, C.stone2); k.rect(x0, SY + 24, x1 - x0, 1, C.stone1); }
      for (const [x0] of [[DX0], [DX1 - 8]]) { k.rect(x0, SY + 6, 8, 12, C.stone3); k.rect(x0, SY + 6, 8, 2, C.stone5); k.rect(x0 + 3, SY, 2, 6, T.frameLo); k.rect(x0 + 2, SY - 2, 4, 2, T.cyanHi); }
      for (const tw of towers) { const [x, h] = tw; pier(k, x, SY + 17 - h, SY + 17, false, false); k.rect(x - 8, SY + 17, 16, 8, C.stone2); k.rect(x - 8, SY + 17, 16, 1, C.stone4); k.rect(x - 8, SY + 24, 16, 1, C.stone0); }
      // A glass skybridge joins the two island towers above the datacenter.
      const a = topS(towers[1]), b = topS(towers[2]); for (let x = a[0] + 6; x <= b[0] - 6; x++) { const y = Math.round(cableAt(a, b, 5, x)) + 8; k.px(x, y, T.frameHi); k.px(x, y + 1, '#12394a'); k.px(x, y + 2, T.frameLo); }
    }
    let frontCv = null; const FX = DX0 - 4, FY = SY - 130, FW = DX1 - DX0 + 8, FH = 160;
    function paintRiverDC(k) {
      paintBasin(k); paintIsland(k); paintBuilding(k);
      backstays(k, 'N'); for (const sp of spans) if (sp.side === 'N') cable(k, sp);
      for (const tw of towers) { const [x, h] = tw; pier(k, x, SY - 17 - h, SY - 14, true, h > 60); }
      deck(k); frontParts(k);
      frontCv = document.createElement('canvas'); frontCv.width = FW; frontCv.height = FH; const fc = frontCv.getContext('2d'); fc.translate(-FX, -FY); frontParts(P.kit(fc));
    }
    function paintGround(k) {
      for (const f of fields) paintCable(k, f.cable);
      for (const f of fields) paintField(k, f);
      paintRiverDC(k);
    }
    function items() {
      const out = [];
      for (const f of fields) { f.ry.forEach((y, r) => out.push([f.fx + f.fw / 2, y + 17, 'fn', k => drawRow(k, f, r)])); out.push([f.ix, f.iy, 'fn', k => drawInverter(k, f)]); }
      return out;
    }
    // Hide cable samples that sit under a tree canopy, so pulses slip beneath the trees and come out again.
    function finish(trees) {
      const grid = new Map(); for (const t of trees) { if (t[2] === 'fn') continue; const g = (t[0] >> 5) * 1000 + (t[1] >> 5); (grid.get(g) || grid.set(g, []).get(g)).push(t); }
      for (const f of fields) {
        const { pts, hid } = f.cable;
        pts.forEach(([x, y], i) => {
          if (hid[i]) return; const gx = x >> 5, gy = y >> 5;
          for (let a = gx - 1; a <= gx + 1 && !hid[i]; a++) for (let b = gy; b <= gy + 2 && !hid[i]; b++) for (const t of grid.get(a * 1000 + b) || []) {
            const s = Math.min(3, t[3]), pine = t[2] === 'pine', r = pine ? 9 + s * 3 : [8, 11, 14, 18][s] + 1, hc = pine ? 29 + s * 9 : 2 * r + [6, 8, 10, 12][s] + (t[2] === 'birch' ? 5 : 0);
            if (Math.abs(x - t[0]) <= r * (y > t[1] - 6 ? .35 : 1) && y <= t[1] + 1 && y >= t[1] - hc) { hid[i] = 1; break; }
          }
        });
      }
    }

    /* ---------- Animation ---------- */
    const pvCol = [...Array(8)].map((_, q) => fade(P.mix('#ffe070', '#7ff2ff', q / 7), [.95, .55, .32, .16]));
    const hot = fade('#dffcff', [1, .6]), halo = fade(T.cyan, [.35, .18]), foam = fade(C.foam, [.9, .6, .35]);
    const strip = [...Array(8)].map((_, i) => P.alpha(T.cyan, .35 + i * .08)), vstrip = [...Array(8)].map((_, i) => P.alpha(T.violet, .35 + i * .08));
    const shimmer = fade('#e8f6ff', [.28, .16]), beam = P.alpha(T.cyan, .09);
    const fanSprite = i => P.sprite('energy-fan' + i, 18, 14, 9, 7, q => { q.ellipse(0, 0, 8, 6, T.n0); for (let b = 0; b < 4; b++) { const a = i * Math.PI / 6 + b * Math.PI / 2; q.line(0, 0, Math.round(Math.cos(a) * 7), Math.round(Math.sin(a) * 5), '#56648c'); } q.rect(-1, -1, 2, 2, T.frame); }, false);
    const turbineSprite = i => P.sprite('energy-turbine' + i, 16, 12, 8, 6, q => { q.ellipse(0, 0, 7, 4, C.water0); for (let b = 0; b < 3; b++) { const a = i * Math.PI / 6 + b * Math.PI * 2 / 3; q.line(0, 0, Math.round(Math.cos(a) * 6), Math.round(Math.sin(a) * 3), C.stone4); } q.rect(-1, -1, 2, 2, T.frameHi); }, false);
    const holoSprite = i => P.sprite('energy-holo' + i, 30, 30, 15, 15, q => {
      const a = i / 12 * Math.PI / 2 + .4, v = []; for (let n = 0; n < 8; n++) { const x = n & 4 ? 1 : -1, y = n & 2 ? 1 : -1, z = n & 1 ? 1 : -1, X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a); v.push([Math.round(X * 7), Math.round(-y * 7 + Z * 3), Z]); }
      for (let m = 0; m < 8; m++) for (const bit of [1, 2, 4]) { const n = m ^ bit; if (n > m) q.line(v[m][0], v[m][1], v[n][0], v[n][1], v[m][2] + v[n][2] < 0 ? '#2fb8d8' : '#6ff6ff'); }
      for (const p of v) if (p[2] >= 0) q.px(p[0], p[1], '#e0fdff');
      q.rect(-1, -1, 3, 3, T.violet); q.px(0, 0, '#f4e8ff');
      q.c.globalCompositeOperation = 'destination-out'; q.c.fillStyle = 'rgba(0,0,0,.5)'; for (let y = -15; y < 15; y += 3) q.c.fillRect(-15, y, 30, 1); q.c.globalCompositeOperation = 'source-over';
    }, false);
    const see = (v, b, pad = 0) => !(b.r + pad < v.l || b.l - pad > v.r || b.b + pad < v.t || b.t - pad > v.b);
    const cy = fade(T.cyan, [.9, .5, .25]);
    const leds = []; for (const wx of [R - 56, R - 34, R + 16, R + 38]) for (let r = 0; r < 3; r++) for (let j = 0; j < 10; j++) leds.push([wx + 2 + r * 6 + (j % 2), BY - BH + 10 + j * 3, wx * 3 + r * 7 + j]);
    // Bright pulses along a path: a white head, a cyan halo and a short tail.
    function run(c, v, pts, t, speed, sp, big) {
      const n = pts.length, off = (t * speed) % sp;
      for (let d = off; d < n; d += sp) {
        const i = d | 0, p = pts[i]; if (p[0] < v.l - 4 || p[0] > v.r + 4 || p[1] < v.t - 4 || p[1] > v.b + 4) continue;
        const q = pts[Math.max(0, i - 2)], q2 = pts[Math.max(0, i - 4)];
        c.fillStyle = halo[1]; c.fillRect(p[0] - 2, p[1] - 2, 5, 5); c.fillStyle = halo[0]; c.fillRect(p[0] - 1, p[1] - 1, 3, 3);
        c.fillStyle = cy[1]; c.fillRect(q[0], q[1], 1, 1); c.fillStyle = cy[2]; c.fillRect(q2[0], q2[1], 1, 1);
        c.fillStyle = hot[0]; c.fillRect(p[0], p[1], big ? 2 : 1, big ? 2 : 1);
      }
    }
    function riverPulses(k, t, v, side, big) {
      const c = k.c;
      for (const sp of spans) if (side === 'all' || (sp.side === 'S') === (side === 'S')) run(c, v, sp.pts, t, 34, 26, big);
      for (const st of strips) if (side === 'all' || st.front === (side === 'S')) run(c, v, st.pts, t, 24, 38, false);
    }
    function animRiver(k, t, v, scale) {
      const c = k.c, detail = scale >= .7, near = scale >= .45;
      // Basin glints and the turbine outflow.
      for (let i = 0; i < 44; i++) { const y = SY + 30 + ((i * 29 + t * 14) % 330), w = bhw(y) - 12, x = Math.round(bcx(y) + (P.hash(i, 95) - .5) * 2 * w); if (y < v.t || y > v.b || x < v.l || x > v.r || dry(x, y)) continue; c.fillStyle = i % 4 ? C.water4 : C.water5; c.fillRect(x, y, 3 + (i % 3), 1); }
      for (const ax of arches) {
        if (ax + 20 < v.l || ax - 20 > v.r) continue;
        k.blit(turbineSprite(Math.floor(t * 10 + ax) % 4), ax, IY1 + 7);
        for (let i = 0; i < 8; i++) { const ph = (t * 1.2 + P.hash(i, ax)) % 1; c.fillStyle = foam[Math.min(2, (ph * 3) | 0)]; c.fillRect(ax - 8 + ((P.hash(ax, i) * 16) | 0), IY1 + 12 + ((ph * 18) | 0), 2, 1); }
      }
      // Electricity from the turbines climbs the conduits into the datacenter.
      for (const pts of conduits) run(c, v, pts, t, 28, 16, false);
      riverPulses(k, t, v, detail ? 'N' : 'all', !near);
      // Datacenter lights: cornice and base strips, rack LEDs, fans, beacons and the hologram.
      const x0 = R - 70, wt = BY - BH, pulse = (Math.sin(t * 2) + 1) / 2;
      c.fillStyle = strip[Math.round(pulse * 7)]; c.fillRect(x0 + 10, wt - 1, 120, 1); c.fillRect(R - 10, wt + 1, 20, 1);
      c.fillStyle = vstrip[7 - Math.round(pulse * 7)]; c.fillRect(x0 + 10, BY - 7, 120, 1);
      const sx = ((t * 46) % 200) - 40; if (sx > -30 && sx < 130) { const a = Math.max(0, sx), b = Math.min(120, sx + 14); c.fillStyle = T.cyanHi; c.fillRect(x0 + 10 + a, wt - 1, b - a, 1); }
      if (near) for (const [x, y, sd] of leds) { const h = P.hash(sd, Math.floor(t * (1.5 + (sd % 5) * .7))); if (h < .42) continue; c.fillStyle = h > .95 ? T.amber : sd % 3 ? T.green : T.cyan; c.fillRect(x, y, 1, 1); }
      const fr = Math.floor(t * 14) % 3; fans.forEach(([fx, fy], i) => k.blit(fanSprite((fr + i) % 3), fx, fy));
      for (const [x, h] of [towers[1], towers[2]]) { const top = SY - 17 - h - 5 - 20; if ((t * .9 + x * .01) % 1 < .45) { c.fillStyle = T.red; c.fillRect(x - 1, top - 1, 2, 2); c.fillStyle = P.alpha(T.red, .3); c.fillRect(x - 3, top - 3, 6, 6); } }
      if (detail) for (const [fx, fy] of fans) for (let i = 0; i < 2; i++) { const ph = (t * .6 + i / 2 + fx * .01) % 1; c.fillStyle = shimmer[ph > .5 ? 1 : 0]; c.fillRect(fx - 2 + Math.round(Math.sin(t * 3 + i * 2 + fy) * 2) + i * 3, fy - 8 - ((ph * 20) | 0), 1, 2); }
      const bob = Math.round(Math.sin(t * 1.6) * 2), flick = P.hash(Math.floor(t * 8), 5) > .93 ? .35 : .85, hy = RT + 40;
      k.poly([[R - 3, hy], [R + 3, hy], [R + 11, hy - 26 + bob], [R - 11, hy - 26 + bob]], beam);
      k.blit(holoSprite(Math.floor(t * 8) % 12), R, hy - 38 + bob, false, flick); k.alpha(flick * .6, () => k.ring(R, hy - 26 + bob, 11, 3, T.cyan));
      c.fillStyle = halo[1]; c.fillRect(R - 3, hy - 2, 7, 3);
    }
    // After the strollers: the bridge's south side is redrawn in front of them, with its pulses.
    function front(k, t, v) {
      if (!frontCv || !see(v, { l: FX, r: FX + FW, t: FY, b: FY + FH })) return;
      k.c.drawImage(frontCv, FX, FY); riverPulses(k, t, v, 'S', false);
    }

    function animate(k, t, v, scale) {
      const c = k.c, detail = scale >= .7;
      // Faint solar pulses along the buried cables, yellow at the field fading to cyan at the river.
      if (detail) for (const f of fields) {
        const { pts, hid, box } = f.cable; if (!see(v, box, 6)) continue;
        const n = pts.length, SP = 64, off = (t * 22 + f.i * 17) % SP;
        for (let d = off; d < n; d += SP) {
          const i = d | 0, p = pts[i]; if (p[0] < v.l - 6 || p[0] > v.r + 6 || p[1] < v.t - 6 || p[1] > v.b + 6) continue;
          const col = pvCol[Math.min(7, (i / n * 8) | 0)];
          for (let j = 3; j >= 1; j--) { const ii = i - j * 2; if (ii < 0 || hid[ii]) continue; c.fillStyle = col[j]; c.fillRect(pts[ii][0], pts[ii][1], 1, 1); }
          if (hid[i]) continue; const pb = pts[Math.max(0, i - 1)]; c.fillStyle = col[3]; c.fillRect(p[0] - 1, p[1] - 1, 3, 3); c.fillStyle = col[0]; c.fillRect(p[0], p[1], 1, 1); if (!hid[i - 1]) c.fillRect(pb[0], pb[1], 1, 1);
        }
        const e = pts[n - 1], arrive = ((n - off) % SP) / SP; if (arrive > .9 || arrive < .08) { c.fillStyle = pvCol[7][0]; c.fillRect(e[0], e[1] - 1, 1, 1); c.fillStyle = pvCol[7][2]; c.fillRect(e[0] - 2, e[1] - 3, 5, 5); }
        if (see(v, { l: f.fx, r: f.fx + f.fw, t: f.fy, b: f.fy + f.fh })) {
          if ((t * 1.3 + f.i * .37) % 1 < .6) { c.fillStyle = T.green; c.fillRect(f.ix + 9, f.iy - 10, 1, 1); }
          f.ry.forEach((y, r) => { const gx = ((t * 11 + r * 23 + f.i * 41) % (f.mods * 10 + 90)) - 45; if (gx < 0 || gx > f.mods * 10 - 4) return; const x = f.px0 + gx; c.fillStyle = shimmer[0]; c.fillRect(x - 1, y + 2, 4, 3); c.fillStyle = hot[1]; c.fillRect(x, y + 3, 1, 1); c.fillRect(x + 1, y + 2, 1, 1); });
        }
      }
      if (see(v, riverBox)) animRiver(k, t, v, scale);
    }

    return { blocks, paintGround, items, finish, animate, front, dry, focus: { x: R, y: SY + 110 }, title: [R, IY1 + 46, 'THE DATACENTER', 'RIVER POWER · STONE BRIDGES'] };
  }
  window.Energy = { create };
})();
