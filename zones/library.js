/* The Grand Library · Documents and KPIs, as a Seljuk / Anatolian turquoise-tile medrese: a ribbed turquoise dome over
   a tiled iwan portal (muqarnas niche, 8-pointed stars, square Kufic and knotwork), two tiled minarets, the archive
   arcade (west, book cabinets under small domes), the KPI gallery (east, charts as tile panels and an illuminated page,
   Seljuk kümbet), a star-tiled court with a şadırvan, and miniature-style gardens: calligrapher, çini painter, weaver,
   readers and a teacher on kilims among cypresses, a palm and tulips. No lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.library = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  // Local ramps, dark → light.
  const TQ = ['#063a40', '#0a5d63', '#0f8c8f', '#1fb5b0', '#33c9c2', '#7fe0d6', '#d2f6ef'];   // Turkish turquoise
  const CB = ['#0e1c4a', '#1c3f8f', '#2c5cbf', '#5a86d8', '#9cb8ee'];                         // cobalt
  const GL = ['#b9c9c4', '#e2ebe5', '#f8fbf5'];                                               // white glaze
  const SD = ['#6e5636', '#9a7c50', '#c4a574', '#dfc796', '#f1e3c0', '#fbf3dc'];               // cream sandstone
  const BR = ['#6a3a22', '#94552f', '#b9774a', '#d49a66'];                                    // brick
  const OR = ['#8e3318', '#c4502a', '#e8743c', '#f5a066'];                                    // coral / orange
  const LEATHER = ['#8e3a2a', CB[1], TQ[2], '#b98a2c', '#3d6a3a', OR[1], '#5a2a4a'];
  const F = { x: 0, y: 50 };                             // şadırvan centre
  const GX = [96, 117], GS = -50, PX = 134;              // KPI arcade bay centres, arch spring line, passage
  const SUN = { x: 222, y: 4 };                           // marble sundial gauge by the Greek steps
  const AX = [-173, -148, -123, -98];                    // archive bays
  const LAMPS = [[0, -54], ...AX.map(x => [x, -55])];    // hanging kandils
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const BY = [.125, .625, .875, .375], bay = (x, y) => BY[((y & 1) << 1) | (x & 1)];
  const tone = (r, v, x, y) => r[clamp(Math.floor(v + bay(x, y)), 0, r.length - 1)];
  const LIT = '#ffffff2a', DK = '#04202a38', DK2 = '#04202a60';

  /* ---------- Geometry and tile patterns ---------- */
  // Two-centred pointed arch (R = 1.4·hw): half-width at dy above the spring line, and apex height.
  const archW = (hw, dy) => { const R = hw * 1.4; return hw - R + Math.sqrt(Math.max(0, R * R - dy * dy)); };
  const archH = hw => hw * 1.3416;
  function archPts(cx, ys, hw, yb) {
    const H = archH(hw), p = [[cx - hw, yb]];
    for (let i = 0; i <= 14; i++) { const dy = H * i / 14; p.push([cx - archW(hw, dy), ys - dy]); }
    for (let i = 14; i >= 0; i--) { const dy = H * i / 14; p.push([cx + archW(hw, dy), ys - dy]); }
    p.push([cx + hw, yb]); return p;
  }
  // 8-pointed star lattice, period p: 0 field, 1 star, 2 star rim, 3 star core, 4 cross knot.
  const inStar = (u, v, a) => Math.max(u, v) <= a || u + v <= a * 1.414;
  function star(px, py, p, ox = 0, oy = 0) {
    const gx = px - ox + .5, gy = py - oy + .5, i = Math.floor(gx / p), j = Math.floor(gy / p);
    const u = Math.abs(gx - (i + .5) * p), v = Math.abs(gy - (j + .5) * p), a = p * .3;
    if (inStar(u, v, a)) return !inStar(u + 1, v, a) || !inStar(u, v + 1, a) ? 2 : Math.max(u, v) < a * .45 ? 3 : 1;
    return (p / 2 - u < 1.2 && p / 2 - v < 1.2) ? 4 : 0;
  }
  const lattice = (px, py, p) => { const a = ((px + py) % p + p) % p, b = ((px - py) % p + p) % p; return a === 0 || b === 0 ? 1 : (a === p / 2 && b === p / 2) ? 2 : 0; };
  function starField(k, x, y, w, h, p, c) { k.rectTex(x, y, w, h, (px, py) => c[star(px, py, p, x, y)]); }
  // Square Kufic inscription band: baseline, rising stems and square hooks.
  function kufic(k, x, y, w, fg, bg, seed = 0, h = 7) {
    k.rect(x, y, w, h, bg); const b = y + h - 2, hh = h - 3;
    for (let i = 1; i < w - 1; i++) {
      const s = (i + seed) % 12, word = Math.floor((i + seed) / 12); if (s === 11) continue;
      k.px(x + i, b, fg);
      if (i % 2) { const r = P.hash(i + seed * 7, word), sh = r < .4 ? hh : r < .62 ? 2 : r < .78 ? 1 : 0; if (sh) k.rect(x + i, b - sh, 1, sh, fg); if (sh === hh && s < 9 && P.hash(word, i) > .45) k.rect(x + i, b - hh, 3, 1, fg); }
    }
  }
  // Knotwork: two interlaced strands along a band (vertical when v).
  function braid(k, x, y, len, v, c1, c2, bg) {
    if (bg) k.rect(x, y, v ? 5 : len, v ? len : 5, bg);
    for (let i = 0; i < len; i++) {
      const s = Math.sin(i * Math.PI / 4), a = Math.round(2 - 2 * s), b = Math.round(2 + 2 * s), over = Math.floor((i + 2) / 4) % 2;
      const put = (o, c) => v ? k.px(x + o, y + i, c) : k.px(x + i, y + o, c);
      if (over) { put(b, c2); put(a, c1); } else { put(a, c1); put(b, c2); }
    }
  }
  const KUFI = ['#############', '#.....#.....#', '#.###.#.###.#', '#.#...#...#.#', '#.#.#####.#.#', '#.#.......#.#', '#.#########.#', '#...........#', '###.#####.###', '#...#...#...#', '#############'];
  const bitmap = (k, rows, x, y, c) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') k.px(x + i, y + j, c); });
  // Rumi scroll: a tightening spiral with a split-leaf tip (s = ±1 mirrors it).
  function rumi(k, cx, cy, r, s, col, leaf) {
    for (let i = 0; i <= 34; i++) { const a = i / 34 * Math.PI * 2.1, rr = r * (1 - i / 42); k.px(cx + s * Math.cos(a) * rr, cy - Math.sin(a) * rr, col); }
    k.poly([[cx + s * r, cy], [cx + s * (r + 4), cy + 3], [cx + s * (r + 1), cy + 1]], leaf); k.px(cx + s * (r + 3), cy - 1, leaf);
  }
  // Seljuk griffin (lion body, eagle wing, palmette tail) facing right, cut in turquoise with a cobalt outline.
  const griffin = () => P.sprite('lib|griffin', 22, 15, 0, 0, q => {
    const c = TQ[3], d = TQ[2], l = TQ[5];
    q.ellipse(9, 9, 5, 3, c); q.circle(14, 7, 3, c); q.circle(17, 4, 2, c); q.rect(18, 4, 2, 1, c); q.px(20, 5, c); q.px(16, 1, c); q.px(15, 2, c);
    q.line(13, 10, 14, 14, c, 2); q.line(16, 9, 18, 13, c, 2); q.line(6, 11, 4, 14, c, 2); q.line(9, 11, 9, 14, c, 2);
    q.poly([[7, 8], [6, 3], [8, 0], [13, 1], [12, 6]], c); q.line(8, 2, 11, 5, d); q.line(7, 4, 10, 7, d); q.px(9, 1, l);
    q.path([[4, 8], [2, 6], [1, 3], [3, 1], [5, 2], [4, 4]], c); q.poly([[3, 1], [0, 0], [2, 3]], c);
    q.px(17, 3, CB[0]); q.px(12, 8, l); q.px(8, 8, l); q.px(10, 10, d); q.px(14, 5, l);
  }, CB[1]);

  /* ---------- Buildings ---------- */
  // Ribbed melon dome (Samarkand): base half-width b, bulge R, height H.
  function dome(k, cx, yb, b, R, H, ribs) {
    const W = v => v < .3 ? b + (R - b) * Math.sin(v / .3 * Math.PI / 2) : R * Math.pow(Math.max(0, 1 - ((v - .3) / .7) ** 2), .6);
    const pts = []; for (let i = 0; i <= 30; i++) pts.push([cx - W(i / 30), yb - H * i / 30]); for (let i = 30; i >= 0; i--) pts.push([cx + W(i / 30), yb - H * i / 30]);
    k.polyTex(pts, (x, y) => {
      const v = clamp((yb - y - .5) / H, 0, 1), w = Math.max(.6, W(v)), u = clamp((x + .5 - cx) / w, -.97, .97);
      const rp = ((Math.asin(u) / Math.PI + .5) * ribs) % 1, vy = v > .3 ? (v - .3) / .7 : 0;
      const nx = u * Math.sqrt(1 - vy * vy * .8) + (rp - .5) * .9, ny = -vy * .9 - .1, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      let I = Math.max(0, -nx * .6 - ny * .55 + nz * .58);
      if (rp < .14 || rp > .9) I *= .5;
      if (I > 1.02 && rp > .25 && rp < .5) return TQ[6];
      return TQ[clamp(Math.floor(.55 + I * 5.2 + (bay(x, y) - .5) * .45), 0, 6)];
    });
    k.rect(cx - b, yb - 1, b * 2 + 1, 1, GL[1]);
  }
  // Drum under the dome: Kufic band and a turquoise diamond band, lit as a cylinder.
  function drum(k, cx, y0, hw, h) {
    k.rect(cx - hw, y0, hw * 2 + 1, h, TQ[2]); k.rect(cx - hw, y0, hw * 2 + 1, 1, GL[2]);
    kufic(k, cx - hw, y0 + 1, hw * 2 + 1, GL[2], CB[1], 3);
    k.rect(cx - hw, y0 + 8, hw * 2 + 1, 1, TQ[4]);
    for (let x = cx - hw; x <= cx + hw; x++) { const m = (x - cx + 40) % 4; if (m === 0) k.px(x, y0 + 10, GL[2]); if (m === 1 || m === 3) { k.px(x, y0 + 9, TQ[4]); k.px(x, y0 + 11, TQ[4]); } }
    for (let x = cx - hw + 3; x < cx + hw - 2; x += 6) { k.rect(x, y0 + 12, 2, h - 12, CB[0]); k.px(x, y0 + 12, TQ[1]); }
    k.rect(cx - hw, y0, 3, h, LIT); k.rect(cx + hw - 5, y0, 6, h, DK); k.rect(cx + hw - 1, y0, 2, h, DK);
  }
  // Glazed brick (banna'i): brick courses with a turquoise diamond lattice laid in glazed bricks.
  function bannai(k, x, y, w, h, p = 8) {
    k.rectTex(x, y, w, h, (px, py) => {
      const ry = py - y, row = ry >> 1, bx = px - x + (row % 2) * 2;
      const l = lattice(px - x, ry, p); if (l === 1) return (ry % 2) ? TQ[2] : TQ[3]; if (l === 2) return CB[2];
      if (ry % 2 === 1 || bx % 4 === 3) return BR[1];
      return P.hash(bx >> 2, row) < .2 ? BR[3] : BR[2];
    });
  }
  // A frame of turquoise tile around a pointed arch opening.
  function archFrame(k, cx, ys, hw, yb) { k.poly(archPts(cx, ys, hw + 2, yb), TQ[2]); k.poly(archPts(cx, ys, hw + 1, yb), GL[2]); k.poly(archPts(cx, ys, hw + 1, yb).map(([x, y]) => [x + 1, y]), TQ[1]); }
  // Hanging kandil (oil lamp) on a chain.
  function kandil(k, x, y, top) { k.rect(x, top, 1, y - top - 2, C.gold0); k.rect(x - 2, y - 2, 5, 1, C.gold1); k.rect(x - 2, y - 1, 5, 3, C.glassLit); k.px(x - 1, y, C.gold4); k.rect(x - 1, y + 2, 3, 1, C.gold1); k.px(x, y + 3, C.gold2); }
  function minaret(k, cx, base) {
    const x0 = cx - 5, y1 = base - 12;
    // Plinth.
    k.rect(cx - 5, base, 18, 3, C.shadow);
    k.rect(cx - 7, y1, 15, 12, SD[3]); k.rect(cx - 7, y1, 15, 2, SD[4]); k.rect(cx - 7, base - 2, 15, 2, SD[1]); k.rect(cx + 6, y1, 2, 12, SD[1]);
    for (let x = cx - 5; x < cx + 6; x += 4) { k.rect(x, y1 + 4, 3, 5, CB[1]); k.px(x + 1, y1 + 6, TQ[4]); }
    // Shaft bands, bottom to top.
    bannai(k, x0, y1 - 14, 10, 14, 6);
    kufic(k, x0, y1 - 21, 10, GL[2], CB[1], cx);
    k.rect(x0, y1 - 23, 10, 2, GL[2]); k.rect(x0, y1 - 22, 10, 1, TQ[3]);
    k.rectTex(x0, y1 - 45, 10, 22, (x, y) => { const z = (y + Math.abs(((x - x0) % 6) - 3)) % 6; return z < 2 ? TQ[4] : z < 4 ? TQ[2] : z === 4 ? GL[2] : TQ[1]; });
    braid(k, x0, y1 - 50, 10, false, GL[2], TQ[4], CB[1]);
    k.rectTex(x0, y1 - 70, 10, 20, (x, y) => { const s = star(x, y, 10, x0, y1 - 70); return [GL[1], TQ[3], CB[1], CB[2], TQ[4]][s]; });
    kufic(k, x0, y1 - 77, 10, GL[2], CB[1], cx + 3);
    k.rectTex(x0, y1 - 93, 10, 16, (x, y) => { const l = lattice(x - x0, y, 4); return l === 1 ? CB[1] : l === 2 ? GL[2] : (y % 2 ? TQ[3] : TQ[2]); });
    // Muqarnas balcony (şerefe) and railing.
    const by = y1 - 99;
    k.rect(cx - 6, by + 4, 13, 2, TQ[1]); for (let x = cx - 6; x < cx + 7; x += 2) { k.px(x, by + 4, GL[2]); k.px(x + 1, by + 5, CB[1]); }
    k.rect(cx - 7, by, 15, 4, TQ[3]); for (let x = cx - 7; x < cx + 8; x += 3) { k.rect(x, by + 2, 2, 2, TQ[1]); k.px(x, by + 2, GL[2]); }
    k.rect(cx - 7, by - 3, 15, 3, SD[4]); for (let x = cx - 6; x < cx + 7; x += 2) k.px(x, by - 2, CB[1]); k.rect(cx - 7, by - 3, 15, 1, GL[2]);
    // Upper shaft with arched openings, cone cap and gold alem.
    k.rect(cx - 4, by - 13, 8, 10, TQ[3]); k.rect(cx - 4, by - 13, 8, 1, GL[2]);
    for (const x of [cx - 3, cx + 1]) { k.rect(x, by - 10, 2, 5, CB[0]); k.px(x, by - 11, CB[0]); }
    k.rect(cx - 4, by - 13, 2, 10, LIT); k.rect(cx + 2, by - 13, 2, 10, DK);
    k.rect(cx - 5, by - 15, 11, 2, CB[1]); k.rect(cx - 5, by - 15, 11, 1, CB[3]);
    k.polyTex([[cx - 5, by - 15], [cx + 6, by - 15], [cx + .5, by - 26]], (x, y) => (x - cx + 20) % 3 === 0 ? TQ[1] : x < cx ? TQ[4] : x < cx + 3 ? TQ[3] : TQ[2]);
    k.rect(cx, by - 29, 1, 4, C.gold1); k.px(cx, by - 30, C.gold3); k.px(cx - 1, by - 28, C.gold2); k.px(cx + 1, by - 28, C.gold2);
    // Cylinder light over the lower shaft.
    k.rect(x0, y1 - 93, 2, 93, LIT); k.rect(x0 + 7, y1 - 93, 3, 93, DK); k.rect(x0 + 9, y1 - 93, 1, 93, DK);
  }
  // Seljuk kümbet (octagonal tomb-tower form) with a pleated cone roof: the archive's record tower.
  function kumbet(k, cx, yb, w, h, ch) {
    const y0 = yb - h;
    k.rect(cx - w + 3, yb, w * 2 + 2, 3, C.shadow);
    k.rect(cx - w, y0, w * 2 + 1, h, SD[3]); k.rect(cx - w, y0, 4, h, SD[4]); k.rect(cx + w - 4, y0, 5, h, SD[2]); k.rect(cx + w, y0, 1, h, SD[1]);
    for (const x of [cx - 6, cx + 6]) k.rect(x, y0, 1, h, SD[1]);
    kufic(k, cx - w, y0 + 1, w * 2 + 1, GL[2], CB[1], 5, 7); braid(k, cx - w, y0 + 8, w * 2 + 1, false, GL[2], TQ[4], TQ[1]);
    k.rect(cx - 5, y0 + 15, 11, 11, TQ[2]); k.rectTex(cx - 4, y0 + 16, 9, 9, (x, y) => [GL[2], TQ[3], CB[1], CB[2], TQ[4]][star(x, y, 9, cx - 4, y0 + 16)]);
    k.poly(archPts(cx, yb - 9, 5, yb), TQ[2]); k.poly(archPts(cx, yb - 9, 4, yb), CB[0]); k.rect(cx - 3, yb - 4, 7, 4, '#2a1c12'); k.rect(cx - 2, yb - 3, 2, 2, C.paper); k.rect(cx + 1, yb - 3, 2, 2, C.paper2);
    k.rect(cx - w + 2, y0 + 30, 3, 6, CB[0]); k.rect(cx + w - 4, y0 + 30, 3, 6, CB[0]);
    k.rect(cx - w - 1, y0 - 2, w * 2 + 3, 3, TQ[1]); k.rect(cx - w - 1, y0 - 2, w * 2 + 3, 1, TQ[4]);
    k.polyTex([[cx - w - 1, y0 - 2], [cx + w + 2, y0 - 2], [cx + .5, y0 - 2 - ch]], (x, y) => { const m = (x - cx + 44) % 4; return m === 0 ? TQ[1] : x < cx - 4 ? TQ[4] : x < cx + 4 ? TQ[3] : TQ[2]; });
    k.rect(cx, y0 - ch - 6, 1, 4, C.gold1); k.px(cx, y0 - ch - 7, C.gold3);
  }
  /* ---------- The Greek partner: a marble library in the manner of Celsus ---------- */
  const MB = ['#7e7a74', '#a9a39a', '#cbc5ba', '#e4dfd4', '#f4f1ea', '#fffdf8'];      // marble
  const GK = { cx: 196, x0: 150, x1: 242 };
  function ionic(k, cx, y0, y1, w) {         // y0 = shaft top (capital above it), y1 = floor
    const x = cx - (w >> 1), h = y1 - y0 - 2;
    k.rect(x + w, y0, 2, h, DK); k.rect(x - 1, y1 - 2, w + 2, 2, MB[4]); k.rect(x - 1, y1 - 1, w + 2, 1, MB[1]);
    k.rect(x, y0, w, h, MB[3]); k.rect(x, y0, 1, h, MB[5]); k.rect(x + w - 1, y0, 1, h, MB[1]); for (let i = 2; i < w - 1; i += 2) k.rect(x + i, y0 + 1, 1, h - 2, MB[2]);
    k.rect(x - 2, y0 - 3, w + 4, 3, MB[4]); k.rect(x - 2, y0 - 4, w + 4, 1, MB[5]); k.rect(x - 1, y0 - 1, w + 2, 1, MB[2]);
    for (const vx of [x - 2, x + w]) { k.rect(vx, y0 - 3, 2, 2, MB[3]); k.px(vx + (vx < x ? 0 : 1), y0 - 2, MB[0]); }
  }
  function statue(k, cx, y) {                // marble figure holding a scroll, feet at y
    k.rect(cx - 4, y - 3, 9, 3, MB[3]); k.rect(cx - 4, y - 3, 9, 1, MB[5]);
    k.poly([[cx - 2, y - 17], [cx + 2, y - 17], [cx + 3, y - 3], [cx - 3, y - 3]], MB[3]); k.rect(cx - 2, y - 17, 1, 14, MB[5]); k.rect(cx + 2, y - 14, 1, 11, MB[1]);
    k.line(cx - 2, y - 16, cx + 2, y - 8, MB[2]); k.circle(cx, y - 20, 2, MB[4]); k.px(cx - 1, y - 21, MB[5]); k.rect(cx + 1, y - 13, 3, 2, MB[5]); k.px(cx + 3, y - 12, MB[1]);
  }
  function greekLibrary(k) {
    const { cx, x0, x1 } = GK;
    // Roof ridge running back behind the pediment.
    k.polyTex([[x0 + 2, -118], [cx, -136], [x1 - 2, -118], [x1 - 2, -124], [cx, -142], [x0 + 2, -124]], (x, y) => (y + Math.abs(x - cx) * .4) % 3 < 1 ? C.terra1 : x < cx ? C.terra3 : C.terra2);
    // Pediment with a relief: the seated Muse of wisdom with a scroll, her owl, reclining readers.
    k.poly([[x0, -117], [cx, -135], [x1, -117]], MB[4]); k.poly([[x0 + 8, -118], [cx, -132], [x1 - 8, -118]], MB[2]);
    k.line(x0, -117, cx, -135, MB[5]); k.line(cx, -135, x1, -117, MB[1]);
    k.rect(cx - 3, -127, 6, 8, MB[4]); k.circle(cx, -128, 2, MB[5]); k.rect(cx + 3, -123, 5, 2, MB[5]); k.rect(cx - 5, -120, 11, 2, MB[3]);
    k.ellipse(cx + 12, -121, 2, 3, MB[4]); k.px(cx + 11, -123, MB[0]); k.px(cx + 13, -123, MB[0]);
    for (const s of [-1, 1]) { k.ellipse(cx + s * 26, -120, 8, 2, MB[4]); k.circle(cx + s * 34, -121, 2, MB[5]); k.rect(cx + s * 20 - 2, -122, 4, 2, MB[5]); }
    for (const [x, y] of [[cx, -139], [x0 + 1, -120], [x1 - 1, -120]]) { k.rect(x - 1, y, 3, 3, C.gold1); k.px(x, y - 1, C.gold3); k.px(x - 1, y - 1, C.gold2); k.px(x + 1, y - 1, C.gold2); }
    // Upper entablature with the turquoise tile trim of the Seljuk partner.
    k.rect(x0, -117, x1 - x0, 4, MB[4]); k.rect(x0, -117, x1 - x0, 1, MB[5]); for (let x = x0 + 1; x < x1; x += 2) k.px(x, -116, MB[1]); k.rect(x0, -114, x1 - x0, 1, TQ[3]);
    // Upper storey: scroll shelves (armaria) between small Ionic columns.
    k.rectTex(x0 + 6, -113, x1 - x0 - 12, 21, (x, y) => (y + 113) % 5 === 4 || (x + ((y + 113) / 5 | 0) * 4) % 11 === 0 ? MB[2] : MB[3]);
    for (const [a, b] of [[166, 176], [186, 207], [216, 226]]) {
      k.rect(a - 1, -111, b - a + 2, 18, MB[1]);
      k.rectTex(a, -110, b - a, 16, (x, y) => { const ly = (y + 110) % 4; if (ly === 3) return C.wood2; const lx = (x - a) % 3; return lx === 2 ? '#2a1c12' : ly === 0 ? '#3a2a1c' : P.hash(x, y) < .15 ? C.paper2 : C.paper; });
      k.rect(a, -110, b - a, 2, '#1a120c80');
    }
    for (const x of [161, 181, 211, 231]) ionic(k, x, -106, -92, 4);
    k.rect(x0 + 6, -94, x1 - x0 - 12, 2, MB[4]);
    // Lower entablature: cornice with dentils, a turquoise meander frieze, the architrave.
    k.rect(x0 - 4, -92, x1 - x0 + 8, 2, MB[5]); for (let x = x0 - 3; x < x1 + 4; x += 2) k.px(x, -90, MB[1]);
    k.rect(x0 - 3, -89, x1 - x0 + 6, 4, TQ[3]); for (let x = x0 - 3; x < x1 + 3; x++) { const m = (x + 200) % 6; k.px(x, -88 + (m < 3 ? 0 : 2) - (m === 1 || m === 4 ? 0 : 0), m === 0 || m === 3 ? GL[2] : TQ[3]); if (m === 1 || m === 2) k.px(x, -88, GL[2]); if (m === 4 || m === 5) k.px(x, -86, GL[2]); }
    k.rect(x0 - 3, -85, x1 - x0 + 6, 1, CB[1]); k.rect(x0 - 2, -84, x1 - x0 + 4, 3, MB[4]); k.rect(x0 - 2, -82, x1 - x0 + 4, 1, MB[2]);
    // Lower storey: ashlar, statue niches, bronze doors, Ionic columns.
    k.rectTex(x0, -81, x1 - x0, 41, (x, y) => { const ry = y + 81, row = ry / 6 | 0, rx = x - x0 + (row % 2) * 7; return ry % 6 === 5 || rx % 14 === 13 ? MB[2] : ry % 6 === 0 ? MB[4] : P.hash(rx / 14 | 0, row) < .3 ? MB[4] : MB[3]; });
    for (const nx of [166, 226]) { k.rect(nx - 6, -76, 13, 32, MB[4]); k.rect(nx - 5, -72, 11, 28, MB[1]); k.ellipse(nx, -72, 5, 4, MB[1]); k.rect(nx - 4, -72, 9, 28, MB[0]); k.ellipse(nx, -72, 4, 3, MB[0]); statue(k, nx, -46); k.rect(nx - 6, -44, 13, 2, MB[4]); }
    k.rect(cx - 10, -76, 21, 3, MB[5]); k.poly([[cx - 11, -76], [cx, -81], [cx + 11, -76]], MB[4]); k.rect(cx - 9, -73, 19, 33, MB[4]);
    k.rect(cx - 7, -71, 15, 31, C.gold0); k.rect(cx - 7, -71, 7, 31, C.glassLit); k.rect(cx - 7, -71, 7, 3, C.gold2);
    for (let y = -66; y < -42; y += 4) { k.rect(cx - 6, y, 5, 2, C.paper); k.px(cx - 2, y, C.paper2); }
    k.rect(cx + 1, -71, 7, 31, C.gold1); k.rect(cx + 1, -71, 1, 31, C.gold3); for (let y = -68; y < -42; y += 5) for (const x of [cx + 3, cx + 6]) k.px(x, y, C.gold3); k.rect(cx + 2, -58, 5, 1, C.gold0);
    for (const x of [157, 176, 216, 235]) ionic(k, x, -78, -40, 6);
    k.rect(x1 - 2, -81, 2, 41, DK);
    // Stepped stylobate.
    for (let i = 0; i < 3; i++) { const hw = 50 + i * 2 + (i ? 1 : 0), y = -40 + i * 4; k.rect(cx - hw, y, hw * 2, 4, i % 2 ? MB[3] : MB[4]); k.rect(cx - hw, y, hw * 2, 1, MB[5]); k.rect(cx - hw, y + 3, hw * 2, 1, MB[1]); }
  }
  // Scholar in a chiton and himation. pose: read (standing, open scroll), sit (on a step, scroll on the lap).
  function drawGreek(q, o, pose, f) {
    const W = '#f4efe2', Wd = '#d2c8b2', H = o.cloak, Hd = S(H, -.3), y = pose === 'sit' ? 4 : 0, sl = pose === 'sleep';
    if (pose === 'sit' || sl) { q.rect(-3, -6, 9, 3, W); q.rect(4, -6, 2, 6, Wd); q.rect(4, -1, 3, 1, C.wood1); q.rect(-4, -4, 3, 4, Wd); }
    else { q.rect(-2, -1, 2, 1, C.wood1); q.rect(1, -1, 3, 1, C.wood1); }
    const top = -18 + y;
    q.poly([[-3, top + 4], [3, top + 4], [pose === 'read' ? 4 : 3, -1 - (y ? 5 : 0)], [pose === 'read' ? -4 : -3, -1 - (y ? 5 : 0)]], W);
    q.rect(-3, top + 4, 1, 10, '#fffaf0'); q.rect(2, top + 5, 1, 9, Wd); for (let j = top + 7; j < -3 - y; j += 2) q.px(0, j, Wd);
    q.line(-3, top + 4, 3, top + 11, H, 2); q.rect(-4, top + 5, 2, 9 - (y ? 3 : 0), H); q.rect(-4, top + 12, 2, 1, Hd);
    const hy = sl ? 2 : 0, hx = sl ? 1 : 0;
    q.rect(-1 + hx, top + hy, 4, 4, o.skin); q.rect(-1 + hx, top - 1 + hy, 4, 2, o.hair); q.rect(-2 + hx, top + hy, 1, 3, o.hair); q.rect(1 + hx, top + 3 + hy, 3, 2, o.hair);
    if (sl) q.rect(1 + hx, top + 1 + hy, 2, 1, S(o.skin, -.35)); else q.px(2 + hx, top + 1, C.ink);
    q.px(-1 + hx, top - 1 + hy, C.leaf3); q.px(1 + hx, top - 2 + hy, C.leaf3); q.px(3 + hx, top - 1 + hy, C.leaf3);
    const sy = top + (pose === 'read' ? 7 : 9) + (f % 2);
    if (!sl) { q.line(-1, top + 5, 3, sy, Hd, 2); q.rect(3, sy - 1, 6, 3, C.paper); q.rect(3, sy - 1, 1, 3, C.wood2); q.rect(8, sy - 1, 1, 3, C.wood2); q.px(5, sy, C.stone3); q.px(6, sy + 1, C.stone3); }
  }
  const GREEKS = [{ cloak: CB[2], hair: '#3a2a20', skin: C.skin2 }, { cloak: OR[1], hair: '#b8b0a4', skin: C.skin3 }];
  const greek = (id, pose, f) => P.sprite(`lib|greek|${id}|${pose}|${f}`, 20, 26, 9, 24, q => drawGreek(q, GREEKS[id], pose, f));

  /* ---------- Ground props ---------- */
  function carpet(k, x, y, w, h, f, b, m, seed = 0) {
    k.rect(x + 1, y + h, w, 1, C.shadow);
    for (let j = 0; j < h; j += 2) { k.px(x - 1, y + j, C.paper); k.px(x + w, y + j, C.paper); }
    const cx = (w - 1) / 2, cy = (h - 1) / 2;
    k.rectTex(x, y, w, h, (px, py) => {
      const i = px - x, j = py - y, e = Math.min(i, j, w - 1 - i, h - 1 - j);
      if (e === 0 || e === 3) return S(b, -.4);
      if (e <= 2) return (i + j) % 4 === 0 ? C.paper : e === 1 && (i + j) % 4 === 2 ? S(b, .3) : b;
      const d = Math.abs(i - cx) / (w * .2) + Math.abs(j - cy) / (h * .34);
      if (d < .34) return C.paper; if (d < .5) return S(m, .35); if (d < .92) return m; if (d < 1.04) return S(m, -.45);
      const ci = Math.min(i - 3, w - 4 - i), cj = Math.min(j - 3, h - 4 - j);
      if (ci + cj < 4) return ci + cj < 2 ? S(m, .3) : m;
      return (i * 3 + j * 5 + seed) % 11 === 0 ? S(f, .4) : (i + j) % 2 && P.hash(i, j + seed) < .08 ? S(f, -.25) : f;
    });
  }
  const tulip = (k, x, y, c = OR[1]) => { k.rect(x, y - 3, 1, 3, C.leaf2); k.px(x - 1, y - 1, C.leaf3); k.rect(x - 1, y - 5, 3, 2, c); k.px(x - 1, y - 6, c); k.px(x + 1, y - 6, c); k.px(x - 1, y - 5, S(c, .35)); };
  function vase(k, x, y, tulips = true) {
    if (tulips) { k.line(x, y - 6, x - 2, y - 11, C.leaf2); k.line(x, y - 6, x + 2, y - 12, C.leaf2); k.line(x, y - 6, x, y - 13, C.leaf1); tulip(k, x - 2, y - 10, OR[2]); tulip(k, x + 2, y - 11, C.red2); tulip(k, x, y - 12, OR[1]); }
    k.ellipse(x, y - 3, 3, 3, GL[2]); k.rect(x - 1, y - 7, 3, 2, GL[1]); k.rect(x - 2, y - 7, 5, 1, CB[1]);
    k.rect(x - 3, y - 3, 7, 1, CB[1]); k.px(x - 1, y - 4, TQ[3]); k.px(x + 1, y - 2, TQ[3]); k.px(x + 2, y - 4, GL[0]); k.rect(x - 1, y, 3, 1, CB[0]);
  }
  const plate = (k, x, y, up) => { if (up) { k.circle(x, y, 3, CB[1]); k.circle(x, y, 2, GL[2]); k.px(x, y, TQ[3]); k.px(x - 1, y - 1, TQ[4]); k.px(x + 1, y + 1, CB[2]); } else { k.ellipse(x, y, 3, 1, CB[1]); k.rect(x - 2, y, 5, 1, GL[2]); k.px(x, y, TQ[3]); } };
  const jar = (k, x, y, c) => { k.ellipse(x + 1, y + 1, 3, 1, C.shadow); k.ellipse(x, y - 3, 3, 3, c); k.rect(x - 1, y - 7, 3, 2, S(c, -.2)); k.px(x - 1, y - 5, S(c, .4)); k.rect(x - 2, y - 3, 5, 1, GL[2]); k.rect(x - 1, y, 3, 1, S(c, -.4)); };
  function books(k, x, y, n, seed = 0) { for (let i = 0; i < n; i++) { const c = LEATHER[(i + seed) % LEATHER.length], w = 7 - (i % 2), o = (i * 3 + seed) % 2; k.rect(x + o, y - 2 - i * 2, w, 2, c); k.rect(x + o, y - 2 - i * 2, w, 1, S(c, .3)); k.px(x + o + w - 1, y - 1 - i * 2, C.paper); k.px(x + o + 2, y - 2 - i * 2, C.gold3); } }
  const scroll = (k, x, y, w = 7) => { k.rect(x, y - 2, w, 2, C.paper); k.rect(x, y - 1, w, 1, C.paper2); k.rect(x - 1, y - 2, 1, 2, C.wood2); k.rect(x + w, y - 2, 1, 2, C.wood2); };
  function rahle(k, x, y) {   // X-shaped folding book stand with an open book
    k.line(x - 3, y, x + 2, y - 6, C.wood3); k.line(x + 3, y, x - 2, y - 6, C.wood1); k.px(x, y - 3, C.wood4);
    k.poly([[x - 5, y - 9], [x, y - 7], [x + 5, y - 9], [x + 5, y - 7], [x, y - 5], [x - 5, y - 7]], C.paper); k.rect(x, y - 7, 1, 2, C.paper2);
    k.line(x - 4, y - 8, x - 1, y - 7, C.stone3); k.line(x + 1, y - 7, x + 4, y - 8, C.stone3); k.px(x - 5, y - 7, OR[1]); k.px(x + 5, y - 7, OR[1]);
  }
  const cypress = h => P.sprite('lib|cyp|' + h, 10, h + 3, 5, h + 1, q => {
    const rnd = P.rng(h * 7);
    q.rect(-1, -3, 2, 3, C.wood1);
    for (let y = 0; y < h - 2; y++) {
      const v = y / (h - 2), hw = Math.max(0, Math.round(4.2 * Math.pow(v, .55) * (1 - .45 * v * v))), yy = -h + y;
      if (!hw) { q.px(0, yy, C.leaf1); continue; }
      q.rect(-hw, yy, hw * 2, 1, C.leaf1); q.px(-hw, yy, C.leaf2); q.rect(1, yy, hw - 1, 1, C.leaf0);
      if (rnd() < .6) q.px(-hw + 1 + Math.floor(rnd() * hw), yy, C.leaf3); if (rnd() < .3) q.px(Math.floor(rnd() * hw), yy, '#1a3a26');
    }
  }, '#10251a');
  const palm = () => P.sprite('lib|palm', 40, 40, 20, 38, q => {
    for (let i = 0; i < 26; i++) { const y = -i, x = Math.round(Math.sin(i / 26 * 1.6) * 5); q.rect(x - 1, y, 3, 1, i % 3 ? C.wood2 : C.wood1); q.px(x - 1, y, C.wood3); }
    const tx = 5, ty = -26;
    for (let f = 0; f < 9; f++) {
      const a = -Math.PI + f / 8 * Math.PI + .08, len = 13 + (f % 3) * 2, col = [C.leaf2, C.leaf3, C.leaf1][f % 3];
      let lx = tx, ly = ty;
      for (let s = 1; s <= len; s++) { const x = tx + Math.cos(a) * s, y = ty + Math.sin(a) * s * .7 + (s / len) ** 2 * 7; q.line(lx, ly, x, y, col); if (s % 2 === 0) { q.px(x, y + 1, S(col, -.2)); q.px(x - Math.sign(Math.cos(a)), y + 2, col); } lx = x; ly = y; }
    }
    q.circle(tx, ty + 1, 2, OR[1]); q.px(tx - 1, ty, OR[3]); q.px(tx + 2, ty + 2, C.gold2);
  }, '#14291c');
  // Tulip bed with rows of red, coral and white tulips.
  function tulipBed(k, x, y, w, h, seed) {
    k.rect(x - 1, y - 1, w + 2, h + 2, TQ[1]); k.rect(x - 1, y - 1, w + 2, 1, TQ[4]); k.rect(x, y, w, h, C.dirt1); k.dither(x, y, w, h, C.dirt0, 1);
    for (let yy = y + 5; yy < y + h; yy += 4) for (let xx = x + 2 + (yy % 3); xx < x + w - 1; xx += 3) tulip(k, xx, yy, [OR[1], C.red2, OR[2], GL[2], C.red1][Math.floor(P.hash(xx, seed) * 5)]);
  }

  /* ---------- Miniature-style people (cached sprites) ---------- */
  const ROBES = [
    { robe: CB[2], trim: C.gold3, sash: OR[2], cap: OR[1], skin: C.skin2, beard: '#3a2a20' },
    { robe: OR[2], trim: C.gold4, sash: CB[1], cap: TQ[3], skin: C.skin1, beard: '#2a1c16' },
    { robe: TQ[3], trim: GL[2], sash: OR[1], cap: CB[1], skin: C.skin2, beard: '#8a8278' },
    { robe: '#9a3a2c', trim: C.gold3, sash: TQ[3], cap: TQ[2], skin: C.skin1, beard: '#1e1a18' },
    { robe: '#3f7a4a', trim: C.gold3, sash: C.gold2, cap: OR[1], skin: C.skin3, beard: '#5a3a26' },
    { robe: CB[1], trim: TQ[4], sash: C.gold2, cap: C.red1, skin: C.skin2, beard: '#4a3226' }
  ];
  function turban(q, x, y, cap) {   // x = centre, y = brow line
    q.rect(x - 3, y - 4, 7, 4, GL[1]); q.rect(x - 2, y - 5, 5, 1, GL[1]); q.rect(x - 3, y - 4, 2, 3, GL[2]); q.px(x - 2, y - 5, GL[2]);
    q.rect(x + 3, y - 3, 1, 3, GL[0]); q.rect(x - 2, y - 1, 6, 1, GL[0]); q.px(x - 1, y - 2, GL[0]); q.px(x, y - 3, GL[0]); q.px(x + 1, y - 4, GL[0]);
    q.rect(x, y - 6, 2, 1, cap); q.px(x + 1, y - 5, S(cap, -.2));
  }
  // Seated cross-legged, facing right. pose: write paint read rest talk sleep.
  function drawSitter(q, o, pose, f) {
    const R = o.robe, Rl = S(R, .28), Rd = S(R, -.3), sl = pose === 'sleep', hy = sl ? 2 : 0, hx = sl ? 1 : 0;
    q.rect(-5, -3, 12, 3, Rd); q.rect(-4, -4, 11, 1, R); q.rect(4, -4, 4, 2, R); q.px(8, -2, C.gold2); q.px(8, -1, OR[0]);
    for (let i = -4; i < 7; i += 2) q.px(i, -1, o.trim);
    q.rect(-3, -10, 6, 7, R); q.rect(-3, -10, 1, 7, Rl); q.rect(2, -10, 1, 7, Rd); q.rect(1, -10, 1, 5, o.trim);
    q.rect(-3, -6, 6, 1, o.sash); q.px(-1, -8, o.trim); q.px(0, -4 - 1, o.trim);
    q.rect(-1 + hx, -14 + hy, 4, 4, o.skin); q.rect(-1 + hx, -13 + hy, 1, 3, S(o.skin, -.15));
    q.rect(1 + hx, -11 + hy, 3, 2, o.beard); q.px(3 + hx, -12 + hy, o.beard); q.px(2 + hx, -10 + hy, o.beard);
    if (sl) q.rect(1 + hx, -13 + hy, 2, 1, S(o.skin, -.35)); else q.px(2 + hx, -13 + hy, C.ink);
    turban(q, 1 + hx, -14 + hy, o.cap);
    const arm = (x1, y1) => { q.line(1, -9, x1, y1, Rd, 2); q.rect(x1, y1, 2, 2, o.skin); };
    if (pose === 'write') { q.rect(3, -5, 5, 1, C.white); q.px(7, -5, C.paper2); const hxp = 3 + [0, 1, 2, 1][f]; arm(hxp, -7 + (f % 2)); q.px(hxp + 2, -6 + (f % 2), C.ink); q.px(hxp + 2, -8 + (f % 2), C.wood1); }
    else if (pose === 'paint') { q.line(1, -8, 4, -6, Rd, 2); plateQ(q, 6, -8); const b = [0, 1, 0, -1][f]; q.line(-2, -9, 3 + b, -11, R, 2); q.rect(3 + b, -12, 2, 2, o.skin); q.line(5 + b, -12, 6 + b, -9, C.wood1); q.px(6 + b, -8, CB[1]); }
    else if (pose === 'read') { arm(5, -7 - (f % 2)); }
    else if (pose === 'talk') { arm(4 + (f % 2), -12 + (f === 1 ? -1 : 0)); }
    else { q.line(1, -8, 3, -5, Rd, 2); q.rect(3, -5, 2, 1, o.skin); }
  }
  function plateQ(q, x, y) { q.ellipse(x, y, 2, 3, CB[1]); q.ellipse(x, y, 1, 2, GL[2]); q.px(x, y, TQ[3]); }
  // Weaver at the loom, seen from behind.
  function drawWeaver(q, o, f, sl) {
    const R = o.robe, Rd = S(R, -.3);
    q.rect(-6, -3, 13, 3, Rd); q.rect(-5, -4, 11, 1, R); for (let i = -5; i < 7; i += 2) q.px(i, -1, o.trim);
    q.rect(-3, -10, 7, 7, R); q.rect(-3, -10, 1, 7, S(R, .28)); q.rect(3, -10, 1, 7, Rd); q.rect(-3, -6, 7, 1, o.sash); q.px(0, -8, o.trim);
    q.rect(-1, -12, 4, 2, S(o.skin, -.2));
    const hy = sl ? 2 : 0; q.rect(-3, -16 + hy, 7, 4, GL[1]); q.rect(-2, -17 + hy, 5, 1, GL[1]); q.rect(-3, -16 + hy, 2, 3, GL[2]); q.rect(3, -15 + hy, 1, 3, GL[0]); q.line(-2, -13 + hy, 3, -16 + hy, GL[0]); q.rect(0, -18 + hy, 2, 1, o.cap);
    if (sl) { q.line(-3, -9, -4, -5, Rd, 2); q.line(4, -9, 5, -5, Rd, 2); return; }
    const a = [0, 1, 2, 1][f];
    q.line(-3, -9, -5 + a, -15, Rd, 2); q.rect(-5 + a, -16, 2, 2, o.skin); q.line(4, -9, 5 + a, -14, Rd, 2); q.rect(5 + a, -15, 2, 2, o.skin);
  }
  // Standing / walking scholar in a long kaftan, facing right. carry: books scroll plate ''.
  function drawWalker(q, o, f, carry, walk) {
    const R = o.robe, Rd = S(R, -.3), st = walk ? [1, 0, -1, 0][f] : 0, y = walk && f % 2 ? -1 : 0;
    q.rect(-3 - st, -1, 3, 1, OR[0]); q.rect(1 + st, -1, 3, 1, C.gold1);
    q.poly([[-3, -14 + y], [3, -14 + y], [4, -1], [-4, -1]], R); q.rect(-3, -14 + y, 1, 13, S(R, .28)); q.rect(3, -12 + y, 1, 11, Rd);
    q.rect(1, -13 + y, 1, 12, o.trim); q.rect(-4, -2, 8, 1, S(o.trim, -.15)); q.rect(-3, -9 + y, 7, 1, o.sash);
    for (let j = -12; j < -3; j += 3) q.px(-1 + (j % 2), j + y, o.trim);
    q.rect(-1, -18 + y, 4, 4, o.skin); q.rect(-1, -17 + y, 1, 3, S(o.skin, -.15)); q.rect(1, -15 + y, 3, 2, o.beard); q.px(3, -16 + y, o.beard); q.px(2, -17 + y, C.ink);
    turban(q, 1, -18 + y, o.cap);
    if (carry === 'books') { q.line(1, -13 + y, 4, -10 + y, Rd, 2); for (let i = 0; i < 3; i++) { const c = LEATHER[(i * 2 + o.robe.length) % LEATHER.length]; q.rect(3, -11 - i * 2 + y, 5, 2, c); q.px(3, -11 - i * 2 + y, S(c, .35)); q.px(7, -10 - i * 2 + y, C.paper); } q.rect(6, -9 + y, 2, 2, o.skin); }
    else if (carry === 'scroll') { q.line(1, -13 + y, 4, -10 + y, Rd, 2); q.rect(4, -14 + y, 2, 7, C.paper); q.px(4, -14 + y, C.wood2); q.px(5, -8 + y, C.wood2); q.rect(4, -10 + y, 2, 2, o.skin); }
    else if (carry === 'plate') { q.line(1, -13 + y, 4, -10 + y, Rd, 2); plateQ(q, 6, -11 + y); q.rect(4, -10 + y, 2, 2, o.skin); }
    else { q.line(1, -13 + y, 2 + st, -7 + y, Rd, 2); q.rect(2 + st, -7 + y, 2, 2, o.skin); }
  }
  const sitter = (id, pose, f) => P.sprite(`lib|sit|${id}|${pose}|${f}`, 22, 24, 10, 22, q => drawSitter(q, ROBES[id], pose, f));
  const weaver = (id, f, sl) => P.sprite(`lib|weave|${id}|${f}|${sl}`, 20, 22, 9, 20, q => drawWeaver(q, ROBES[id], f, sl));
  const walker = (id, carry, f, walk) => P.sprite(`lib|walk|${id}|${carry}|${f}|${walk}`, 20, 28, 9, 26, q => drawWalker(q, ROBES[id], f, carry, walk));
  // State marks over custom figures (same language as the crew).
  function mark(k, x, y, t, st, ph) {
    if (st === 'off') { const q = (t * .4 + ph) % 1; k.alpha(1 - q, () => k.text('z', x + 3 + q * 5, y - 4 - q * 10, '#c8d4ff')); }
    else if (st === 'waiting') { k.rect(x - 2, y - 7, 5, 7, C.ink); k.rect(x - 1, y - 6, 3, 5, C.waiting); k.px(x, y - 5, C.ink); k.px(x, y - 3, C.ink); }
    else if (st === 'error' && Math.floor(t * 3 + ph) % 2) { k.rect(x - 1, y - 7, 3, 6, C.ink); k.rect(x, y - 6, 1, 3, C.error); k.px(x, y - 2, C.error); }
  }
  function gstep(k, t, state, x, y, id, pose, flip, ph) {
    const f = Math.floor(t * 1.5 + ph * 7) % 2, sh = state === 'error' ? [0, 1, 0, -1][Math.floor(t * 12 + ph * 3) % 4] : 0;
    if (pose !== 'sit') k.ellipse(x + 1, y, 4, 1, C.shadow);
    k.blit(greek(id, state === 'off' ? 'sleep' : pose, state === 'working' ? f : 0), x + sh, y, flip); mark(k, x, y - 20, t, state, ph);
  }
  function seat(k, t, state, x, y, id, pose, flip, ph, fps = 4) {
    const sl = state === 'off', f = Math.floor(t * fps + ph * 7) % 4, sh = state === 'error' ? [0, 1, 0, -1][Math.floor(t * 12 + ph * 3) % 4] : 0;
    k.blit(sitter(id, sl ? 'sleep' : pose, pose === 'rest' || pose === 'sleep' ? 0 : f), x + sh, y, flip);
    mark(k, x, y - 18, t, state, ph);
  }

  return {
    paint(k) {
      /* Ground: meadow grass. */
      k.rectTex(-250, -190, 500, 330, (x, y) => { const h = P.hash(x, y); return h < .1 ? C.grass2 : h > .9 ? C.grass4 : C.grass3; });
      for (let i = 0; i < 60; i++) Props.tuft(k, -246 + P.hash(i, 51) * 492, -186 + P.hash(i, 52) * 316, C.grass1, C.grass4);

      /* Cypresses and palms behind the buildings. */
      for (const [x, y, h] of [[-244, -118, 34], [-200, -104, 30], [-240, -150, 30], [-190, -140, 36], [-150, -128, 30], [-182, -84, 30], [-160, -88, 36], [-134, -92, 30], [-98, -90, 34], [98, -90, 34], [124, -92, 30], [104, -130, 36], [132, -138, 30], [150, -150, 28], [246, -140, 32], [226, -156, 28], [244, -104, 30]]) k.blit(cypress(h), x, y);
      k.blit(palm(), -114, -96); k.blit(palm(), -205, -150); k.blit(palm(), 116, -98);

      /* Great dome on its drum. */
      drum(k, 0, -122, 26, 20);
      dome(k, 0, -122, 24, 32, 36, 18);
      k.rect(0, -166, 1, 8, C.gold1); k.circle(0, -161, 1, C.gold2); k.px(0, -162, C.gold4); k.px(-1, -166, C.gold2); k.px(1, -167, C.gold2);

      /* West wing: the archive arcade under three small domes. */
      const WX = -186, WW = 100, WB = -34, WT = -80;
      k.rect(WX, WT - 8, WW, 8, SD[4]); k.dither(WX, WT - 8, WW, 8, SD[3], 1); k.rect(WX, WT - 8, WW, 1, SD[5]);
      for (const x of [-161, -136, -111]) { k.rect(x - 8, WT - 12, 17, 6, TQ[2]); k.rect(x - 8, WT - 12, 17, 1, GL[2]); for (let i = x - 7; i < x + 9; i += 3) k.px(i, WT - 9, CB[1]); k.rect(x + 5, WT - 12, 4, 6, DK); dome(k, x, WT - 12, 7, 9, 11, 8); k.rect(x, WT - 26, 1, 3, C.gold1); k.px(x, WT - 27, C.gold3); }
      bannai(k, WX, WT, WW, WB - WT);
      kufic(k, WX, WT, WW, GL[2], CB[1], 1); braid(k, WX, WT + 7, WW, false, GL[2], TQ[4], TQ[1]);
      for (const cx of AX) {
        archFrame(k, cx, GS, 9, WB - 4);
        k.polyTex(archPts(cx, GS, 9, WB - 4), (x, y) => {
          const ry = y - (GS - 12), row = Math.floor((y + 60) / 7), ly = (y + 60) % 7;
          if (ry < 3) return '#1e140e';
          if (ly === 6) return C.wood3; if (ly === 0) return C.wood1;
          const cub = Math.floor((x - cx + 10) / 6), lx = (x - cx + 10) % 6;
          if (lx === 5) return C.wood2;
          if ((cub + row) % 3 === 0) { const d = (lx - 2) ** 2 + (ly - 3) ** 2; return d < 2 ? C.paper : d < 4 ? C.paper2 : '#2a1c12'; }
          if (ly === 1) return '#2a1c12';
          return LEATHER[Math.floor(P.hash(x, row) * LEATHER.length)];
        });
        k.polyTex(archPts(cx, GS, 9, WB - 4), (x, y) => (x - cx > 5 || y < GS - 6) && (x + y) % 2 ? '#1a0e0880' : null);
        kandil(k, cx, -55, GS - 12);
        k.rect(cx - 12, WB - 4, 24, 4, SD[3]); k.rect(cx - 12, WB - 4, 24, 1, SD[5]);
      }
      k.rect(WX, WB - 4, WW, 4, SD[3]); k.rect(WX, WB - 4, WW, 1, SD[4]); k.rect(WX, WB - 1, WW, 1, SD[1]);
      k.rect(WX + WW - 2, WT - 8, 2, WB - WT + 8, DK);

      /* Kümbet record tower closing the archive at the west end. */
      kumbet(k, -222, -34, 15, 50, 28);

      /* East link: the KPI arcade (two chart bays and a through passage) fusing the hall with the Greek library. */
      const EX = 84, EW = 58;
      k.rect(EX, WT - 8, EW, 8, SD[4]); k.dither(EX, WT - 8, EW, 8, SD[3], 1); k.rect(EX, WT - 8, EW, 1, SD[5]);
      for (let x = EX; x < EX + EW - 2; x += 5) { k.rect(x, WT - 12, 3, 4, TQ[3]); k.px(x, WT - 12, TQ[5]); k.rect(x + 2, WT - 11, 1, 3, TQ[1]); }
      bannai(k, EX, WT, EW, WB - WT);
      kufic(k, EX, WT, EW, GL[2], CB[1], 7); braid(k, EX, WT + 7, EW, false, GL[2], TQ[4], TQ[1]);
      k.rect(EX + 8, WT - 8, 21, 9, C.gold0); k.rect(EX + 9, WT - 7, 19, 7, CB[1]); k.textCenter('KPI', EX + 18, WT - 6, C.gold3);
      for (const cx of GX) {
        archFrame(k, cx, GS, 9, WB - 4);
        k.poly(archPts(cx, GS, 9, WB - 4), '#1c1410');
        k.polyTex(archPts(cx, GS, 8, WB - 4), (x, y) => [TQ[1], TQ[2], CB[0], CB[1], TQ[3]][star(x, y, 8, cx - 12, GS - 16)]);
        k.rect(cx - 8, -58, 17, 18, C.gold1); k.rect(cx - 7, -57, 15, 17, GL[2]); k.rect(cx - 7, -57, 15, 1, C.white);
        k.rect(cx + 9, -57, 1, 17, DK2); k.rect(cx - 11, WB - 4, 23, 4, SD[3]); k.rect(cx - 11, WB - 4, 23, 1, SD[5]);
      }
      // Passage through to the Greek court: a lit corridor with steps.
      archFrame(k, PX, GS + 4, 5, WB - 4); k.poly(archPts(PX, GS + 4, 5, WB - 4), '#2a1c12');
      k.rect(PX - 3, -44, 7, 8, C.glassLit); k.rect(PX - 2, -47, 5, 3, C.gold3); k.rect(PX - 4, -38, 9, 1, SD[4]); k.rect(PX - 4, -36, 9, 1, SD[3]); kandil(k, PX, -54, GS - 2);
      // Chart furniture: tile baseline, an illuminated page with gold margins.
      k.rect(GX[0] - 6, -42, 13, 1, CB[1]);
      const pg = GX[1]; k.rect(pg - 6, -56, 13, 15, C.paper); k.rect(pg - 6, -56, 13, 1, C.gold2); k.rect(pg - 6, -42, 13, 1, C.gold2); k.rect(pg - 6, -56, 1, 15, C.gold2); k.rect(pg + 6, -56, 1, 15, C.gold2);
      for (let y = -53; y < -44; y += 3) for (let x = pg - 4; x < pg + 5; x += 2) k.px(x, y, C.paper2);
      k.rect(pg - 4, -55, 9, 1, CB[2]); k.px(pg, -56, OR[1]);
      k.rect(EX, WB - 4, EW, 4, SD[3]); k.rect(EX, WB - 4, EW, 1, SD[4]); k.rect(EX, WB - 1, EW, 1, SD[1]);
      // The seam: a turquoise tile pilaster where the Seljuk brick meets the Greek marble.
      k.rect(142, WT - 12, 8, WB - WT + 12, MB[4]); k.rectTex(143, WT - 8, 6, WB - WT + 4, (x, y) => [GL[2], TQ[3], CB[1], CB[2], TQ[4]][star(x, y, 6, 143, WT - 8)]);
      k.rect(141, WT - 13, 10, 2, MB[5]); k.rect(141, WB - 4, 10, 4, MB[3]); k.rect(148, WT - 8, 2, WB - WT + 8, DK);
      greekLibrary(k);

      /* Main hall: sandstone flanks with square-Kufic and griffin panels, flat roof with merlons. */
      const HB = -34, HT = -86;
      k.rect(-62, HT - 6, 124, 6, SD[4]); k.dither(-62, HT - 6, 124, 6, SD[3], 1); k.rect(-62, HT - 6, 124, 1, SD[5]);
      for (let x = -62; x < 62; x += 5) { k.rect(x, HT - 9, 3, 3, TQ[3]); k.px(x, HT - 9, TQ[5]); }
      for (const s of [-1, 1]) {
        const x0 = s < 0 ? -62 : 28, cx = x0 + 17;
        k.rectTex(x0, HT, 34, HB - HT, (x, y) => { const ry = y - HT, row = Math.floor(ry / 5), rx = x - x0 + (row % 2 ? 4 : 0); return ry % 5 === 4 || rx % 9 === 8 ? SD[2] : ry % 5 === 0 ? SD[4] : P.hash(rx >> 3, row) < .25 ? SD[4] : SD[3]; });
        kufic(k, x0, HT, 34, GL[2], CB[1], s > 0 ? 9 : 2);
        k.rect(x0 + 2, HT + 9, 30, 20, TQ[2]); k.rect(x0 + 3, HT + 10, 28, 18, GL[2]);
        k.poly(archPts(cx, HT + 27, 11, HT + 28), CB[1]); k.poly(archPts(cx, HT + 27, 10, HT + 28), CB[0]);
        bitmap(k, KUFI, cx - 6, HT + 16, GL[2]); for (let i = 0; i < 5; i++) k.px(cx - 4 + i * 2, HT + 14, TQ[4]);
        k.rect(x0 + 3, HT + 10, 3, 3, TQ[3]); k.rect(x0 + 28, HT + 10, 3, 3, TQ[3]);
        braid(k, x0 + 3, HT + 30, 28, false, TQ[4], CB[2], GL[1]);
        k.rect(x0 + 5, HT + 36, 24, 14, CB[1]); k.rect(x0 + 6, HT + 37, 22, 12, GL[2]);
        k.blit(griffin(), cx + (s < 0 ? -11 : 11), HT + 36, s > 0);
        k.rect(x0, HB - 4, 34, 4, SD[2]); k.rect(x0, HB - 4, 34, 1, SD[4]);
      }
      k.rect(60, HT - 6, 2, HB - HT + 6, DK);

      /* Iwan portal (taç kapı): knotwork frame, star tiles, Kufic band, Rumi spandrels, muqarnas niche, open door. */
      const PT = -102;
      k.rect(-29, PT - 4, 58, 4, SD[4]); k.rect(-29, PT - 4, 58, 1, SD[5]);
      for (let x = -28; x < 28; x += 4) { k.poly([[x, PT - 4], [x + 3, PT - 4], [x + 1.5, PT - 8]], TQ[3]); k.px(x + 1, PT - 6, GL[2]); }
      starField(k, -28, PT, 56, HB - PT, 10, [GL[1], TQ[3], CB[1], CB[2], TQ[4]]);
      braid(k, -28, PT, 56, false, GL[2], TQ[4], CB[1]); braid(k, -28, PT + 5, HB - PT - 5, true, GL[2], TQ[4], CB[1]); braid(k, 23, PT + 5, HB - PT - 5, true, GL[2], TQ[4], CB[1]);
      kufic(k, -22, PT + 7, 45, GL[2], CB[1], 4);
      k.rect(-20, PT + 15, 41, HB - PT - 15, TQ[3]); k.rect(-19, PT + 16, 39, HB - PT - 16, CB[1]);
      rumi(k, -14, PT + 22, 3, 1, TQ[4], TQ[5]); rumi(k, 15, PT + 22, 3, -1, TQ[4], TQ[5]);
      k.px(-18, PT + 17, GL[2]); k.px(19, PT + 17, GL[2]); k.line(-18, PT + 30, -12, PT + 26, TQ[3]); k.line(19, PT + 30, 13, PT + 26, TQ[3]);
      const NS = -64, NH = 15;
      k.poly(archPts(0, NS, NH + 1, HB), GL[2]); k.poly(archPts(0, NS, NH, HB), TQ[1]);
      // Muqarnas: stepped rows of little pointed cells, darker deeper in the half-dome.
      const ap = NS - archH(NH);
      k.polyTex(archPts(0, NS, NH, NS + 4), (x, y) => {
        const ry = y - Math.ceil(ap), row = Math.floor(ry / 4), ly = ry % 4, lx = ((x + 60 + (row % 2) * 3) % 6);
        const r = row % 2 ? TQ : CB, dk = row < 2;
        if (ly === 3) return row % 2 ? GL[2] : GL[1];                     // lit ledge under each tier
        const pocket = Math.abs(lx - 2.5) < ly * 1.1 + .6;                   // pointed cell opening
        if (!pocket) return lx === 0 ? GL[1] : r[dk ? 2 : 3];
        return ly === 0 ? r[0] : lx < 3 ? r[dk ? 1 : 2] : r[dk ? 0 : 1];
      });
      k.rect(-NH, NS + 4, NH * 2 + 1, HB - NS - 4, TQ[2]);
      starField(k, -NH + 1, NS + 5, NH * 2 - 1, HB - NS - 5, 8, [GL[1], TQ[3], CB[1], CB[2], TQ[4]]);
      for (const x of [-NH, NH - 1]) for (let y = NS; y < HB; y++) k.rect(x, y, 2, 1, (y + (x > 0 ? 1 : 0)) % 3 ? GL[2] : TQ[3]);
      // Door: bronze frame, warm interior with shelves.
      k.poly(archPts(0, -50, 8, HB), C.gold1); k.poly(archPts(0, -50, 7, HB), '#3a2414');
      k.polyTex(archPts(0, -50, 6, HB), (x, y) => { if (y > -40) return (x + y) % 3 ? C.gold3 : C.gold2; const row = (y + 60) % 5; if (row === 4) return C.wood2; return P.hash(x, Math.floor((y + 60) / 5)) < .75 ? LEATHER[Math.floor(P.hash(x * 3, y >> 2) * 7)] : C.glassLit; });
      k.rect(-6, -40, 13, 1, C.wood3); k.rect(-1, -38, 3, 4, C.gold4);
      kandil(k, 0, -54, -61);
      k.rect(-8, -58, 2, 2, C.gold2); k.rect(7, -58, 2, 2, C.gold2);
      // Portal shadow falls on the right flank; top of the portal catches light.
      k.rect(29, PT + 2, 3, HB - PT - 2, DK); k.rect(-28, PT, 56, 1, GL[2]); k.rect(27, PT, 1, HB - PT, DK2);
      // Steps.
      for (let i = 0; i < 3; i++) { const hw = 24 + i * 3, y = HB + i * 2; k.rect(-hw, y, hw * 2, 2, i % 2 ? SD[3] : SD[4]); k.rect(-hw, y, hw * 2, 1, SD[5]); }

      /* Minarets between the hall and the wings. */
      minaret(k, -74, HB); minaret(k, 74, HB);

      /* Terrace along the facades, then the star-tiled court. */
      k.rectTex(-250, -28, 500, 6, (x, y) => (y === -23 || (x + 200 + (y + 28 > 2 ? 4 : 0)) % 9 === 0) ? SD[2] : P.hash(Math.floor((x + 200) / 9), y > -26) < .2 ? SD[4] : SD[3]);
      k.rect(-250, -22, 500, 1, SD[1]);
      k.rectTex(-72, -21, 144, 141, (x, y) => { const ry = y + 21, row = Math.floor(ry / 7), rx = x + 72 + (row % 2) * 6; if (ry % 7 === 6 || rx % 12 === 11) return SD[2]; if (ry % 7 === 0) return SD[5]; return P.hash(Math.floor(rx / 12), row) < .3 ? SD[3] : SD[4]; });
      // Star-and-cross tile carpets: the axial walk and the square around the şadırvan.
      const TILE = [GL[2], TQ[4], TQ[1], CB[2], CB[1]];
      const panel = (x, y, w, h) => { k.rect(x - 3, y - 3, w + 6, h + 6, CB[1]); k.rect(x - 2, y - 2, w + 4, h + 4, TQ[3]); k.rect(x - 1, y - 1, w + 2, h + 2, GL[2]); starField(k, x, y, w, h, 12, TILE); };
      for (let y = -14; y < 118; y += 14) for (let x = -64; x < 66; x += 24) { const xx = x + ((y + 14) / 14 % 2) * 12; if (Math.abs(xx) < 20 || (y > 10 && y < 88 && Math.abs(xx) < 54)) continue; k.rect(xx - 1, y, 3, 1, TQ[3]); k.rect(xx, y - 1, 1, 3, TQ[3]); k.px(xx, y, CB[1]); }
      panel(-12, -18, 24, 138); panel(-46, 18, 92, 62); k.rect(-12, 15, 24, 3, TQ[3]); k.rect(-12, 83, 24, 3, TQ[3]); starField(k, -12, 14, 24, 5, 12, TILE); starField(k, -12, 79, 24, 8, 12, TILE);
      k.rect(-74, -21, 2, 141, TQ[2]); k.rect(72, -21, 2, 141, TQ[2]); k.rect(-74, -21, 1, 141, CB[1]); k.rect(73, -21, 1, 141, CB[1]);

      /* Şadırvan: octagonal tiled basin with a bowl on a column. */
      const oct = (rx, ry, dy = 0) => { const p = []; for (let i = 0; i < 8; i++) { const a = (i + .5) * Math.PI / 4; p.push([F.x + Math.cos(a) * rx, F.y + dy + Math.sin(a) * ry]); } return p; };
      k.poly(oct(34, 17, 3).map(([x, y]) => [x + 3, y + 2]), C.shadow);
      const top = oct(32, 15), WH = 7;
      for (let i = 0; i < 4; i++) {
        const a = top[i], b = top[(i + 1) % 8], col = [TQ[1], TQ[2], TQ[3], TQ[2]][i];
        if (a[1] < F.y - 1 && b[1] < F.y - 1) continue;
        k.poly([a, b, [b[0], b[1] + WH], [a[0], a[1] + WH]], col);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 3; k.rect(mx - 1, my, 3, 2, GL[2]); k.px(mx, my - 1, CB[1]); k.px(mx, my + 2, CB[1]);
      }
      k.poly(oct(32, 15), GL[1]); k.poly(oct(31, 14, -1), GL[2]); k.poly(oct(28, 12), TQ[0]); k.poly(oct(27, 11, 1), '#0d4f5a'); k.poly(oct(24, 9, 1), '#146a74');
      k.ellipse(F.x - 8, F.y - 2, 8, 2, '#1f8590');
      k.rect(F.x - 2, F.y - 14, 5, 14, GL[1]); k.rect(F.x - 2, F.y - 14, 2, 14, GL[2]); k.rect(F.x + 2, F.y - 14, 1, 14, GL[0]); k.rect(F.x - 2, F.y - 9, 5, 1, TQ[2]);
      k.ellipse(F.x, F.y - 15, 7, 2, TQ[2]); k.ellipse(F.x, F.y - 16, 7, 2, TQ[4]); k.ellipse(F.x, F.y - 16, 5, 1, '#146a74');
      k.rect(F.x - 1, F.y - 21, 3, 5, TQ[3]); k.circle(F.x, F.y - 22, 2, TQ[4]); k.px(F.x - 1, F.y - 23, TQ[6]); k.px(F.x, F.y - 25, C.gold2);
      // Cypresses in tiled planters at the corners of the court.
      for (const [x, y] of [[-56, 8], [56, 8], [-56, 100], [56, 100]]) { k.rect(x - 6, y - 5, 13, 6, TQ[2]); k.rect(x - 6, y - 5, 13, 1, GL[2]); k.rect(x - 4, y - 3, 3, 3, CB[1]); k.rect(x + 2, y - 3, 3, 3, CB[1]); k.rect(x + 5, y - 5, 2, 6, DK); k.blit(cypress(28), x, y - 5); }

      /* West garden: the scriptorium kilim (calligrapher and çini painter), the loom and the kiln. */
      k.rectTex(-250, -21, 176, 144, (x, y) => (x * 3 + y * 7) % 23 === 0 ? C.grass4 : null);
      k.rect(-250, 16, 176, 5, SD[3]); k.dither(-250, 16, 176, 5, SD[2], 1);
      k.rect(-108, 21, 6, 102, SD[3]); k.dither(-108, 21, 6, 102, SD[2], 1);
      carpet(k, -184, -16, 80, 26, '#9a2f2a', CB[1], TQ[3], 3);
      books(k, -184, -8, 4, 1); books(k, -176, -10, 3, 4); scroll(k, -183, 6); scroll(k, -181, 3, 6);
      k.rect(-160, 4, 9, 4, C.wood2); k.rect(-160, 4, 9, 1, C.wood4); k.rect(-158, 2, 2, 2, C.ink); k.px(-158, 1, C.stone3); k.rect(-155, 3, 3, 1, C.paper); k.px(-153, 1, OR[1]);
      for (const [x, y] of [[-136, 0], [-130, -4], [-124, 0]]) plate(k, x, y, true);
      for (const x of [-140, -118]) plate(k, x, 6, false);
      vase(k, -144, 2); vase(k, -112, -6); jar(k, -106, 0, CB[2]); jar(k, -118, -8, TQ[3]);
      // Loom with a half-woven carpet.
      k.rect(-184, 26, 30, 3, C.wood2); k.rect(-184, 26, 30, 1, C.wood4); k.rect(-184, 26, 2, 34, C.wood1); k.rect(-156, 26, 2, 34, C.wood1); k.rect(-184, 58, 30, 3, C.wood2);
      for (let x = -181; x < -156; x++) k.rect(x, 29, 1, 14, x % 2 ? C.paper : C.paper2);
      k.rectTex(-181, 43, 25, 15, (x, y) => { const d = Math.abs(x + 169) + Math.abs(y - 51) * 1.4; return d < 3 ? C.paper : d < 6 ? CB[1] : d < 7 ? C.gold2 : (y === 44 || y === 57 || x === -181 || x === -157) ? CB[1] : (x + y) % 4 === 0 ? OR[3] : '#9a2f2a'; });
      k.rect(-181, 42, 25, 1, C.gold2); for (let i = 0; i < 4; i++) k.rect(-178 + i * 7, 60, 2, 3, [OR[1], TQ[3], CB[2], C.gold2][i]);
      k.rect(-186, 60, 34, 2, C.shadow);
      // Çini kiln: domed brick oven with a firing mouth; glazed wares drying on a shelf.
      const KX = -128, KY = 58;
      k.ellipse(KX + 3, KY + 1, 14, 3, C.shadow); k.rect(KX - 11, KY - 10, 22, 10, BR[2]); k.ellipse(KX, KY - 10, 11, 8, BR[2]); k.ellipse(KX - 3, KY - 13, 6, 4, BR[3]);
      k.rectTex(KX - 11, KY - 18, 22, 18, (x, y) => ((y % 3 === 0) || (x + (Math.floor(y / 3) % 2) * 2) % 5 === 0) && P.hash(x, y) < .6 ? BR[1] : null);
      k.rect(KX + 6, KY - 14, 5, 14, DK); k.rect(KX - 2, KY - 20, 4, 4, BR[1]); k.rect(KX - 2, KY - 20, 4, 1, BR[3]);
      k.poly(archPts(KX, KY - 3, 4, KY), '#2a120a'); k.poly(archPts(KX, KY - 2, 3, KY), OR[1]); k.rect(KX - 2, KY - 2, 5, 2, C.gold3);
      k.rect(-112, 34, 20, 2, C.wood3); k.rect(-112, 36, 2, 10, C.wood1); k.rect(-94, 36, 2, 10, C.wood1); k.rect(-112, 42, 20, 2, C.wood2);
      for (let i = 0; i < 4; i++) plate(k, -108 + i * 5, 31, true); jar(k, -106, 42, TQ[3]); jar(k, -100, 42, CB[2]); jar(k, -95, 42, GL[2]);
      carpet(k, -246, 28, 50, 26, CB[1], OR[1], TQ[3], 5);
      books(k, -245, 38, 3, 2); scroll(k, -244, 51, 6); scroll(k, -205, 38, 6);
      for (const x of [-241, -203]) { k.ellipse(x, 48, 4, 2, C.wood1); k.rect(x - 4, 44, 9, 4, C.wood3); k.rect(x - 4, 44, 9, 1, C.wood4); for (let i = -3; i < 4; i += 2) k.rect(x + i, 41, 1, 3, C.paper); }
      k.rect(-219, 46, 9, 3, C.wood2); k.rect(-219, 46, 9, 1, C.wood4); k.rect(-217, 45, 5, 1, C.paper); k.rect(-214, 44, 2, 2, C.ink);
      k.blit(cypress(30), -244, 118); k.blit(cypress(28), -206, 118); tulipBed(k, -244, 88, 50, 14, 8);
      tulipBed(k, -184, 88, 70, 14, 3); tulipBed(k, -98, 88, 20, 14, 5);
      k.blit(cypress(30), -182, 118); k.blit(cypress(26), -118, 120); k.blit(cypress(30), -86, 118);
      Props.bench(k, -168, 116, 18);

      /* East garden: the reading kilim, the teaching kilim under a palm, and a tulip bar chart. */
      k.rectTex(74, -21, 176, 144, (x, y) => (x * 3 + y * 7) % 23 === 0 ? C.grass4 : null);
      k.rect(74, 16, 176, 5, SD[3]); k.dither(74, 16, 176, 5, SD[2], 1);
      carpet(k, 96, -16, 60, 24, CB[1], '#9a2f2a', OR[2], 7);
      rahle(k, 124, 6); books(k, 98, -4, 4, 3); books(k, 146, -6, 3, 5); scroll(k, 99, 5); jar(k, 150, 6, TQ[3]);
      carpet(k, 96, 28, 76, 26, TQ[1], CB[1], OR[1], 11);
      rahle(k, 118, 50); rahle(k, 138, 50); books(k, 164, 34, 2, 2); vase(k, 100, 40);
      k.blit(palm(), 168, 46);
      // Tulip bar chart: five rows rising left to right, with a gold trend cord on stakes.
      // Tulip bar chart: five tiled planters rising left to right, each crowned with tulips, a gold trend cord above.
      const TB = 106;
      [5, 8, 11, 14, 18].forEach((h, i) => {
        const x = 94 + i * 18, w = 14;
        k.rect(x + 2, TB, w, 2, C.shadow); k.rect(x, TB - h, w, h, TQ[3]); k.rect(x, TB - h, 2, h, TQ[4]); k.rect(x + w - 2, TB - h, 2, h, TQ[1]); k.rect(x, TB - 1, w, 1, CB[1]);
        for (let yy = TB - h + 3; yy < TB - 2; yy += 4) { k.rect(x + 5, yy, 4, 2, GL[2]); k.px(x + 6, yy, CB[1]); }
        k.rect(x, TB - h - 3, w, 3, C.dirt1); k.rect(x, TB - h - 3, w, 1, GL[2]);
        for (let c = 0; c < 4; c++) tulip(k, x + 2 + c * 3, TB - h - 2, [C.red2, OR[2], OR[1], GL[2]][(c + i) % 4]);
      });
      k.path([[95, TB - 16], [113, TB - 19], [131, TB - 22], [149, TB - 25], [167, TB - 29], [176, TB - 32]], C.gold2); k.px(176, TB - 32, C.gold4);
      k.blit(cypress(30), 86, 118); k.blit(cypress(30), 186, 118);
      Props.bench(k, 140, 116, 18);
      // Greek corner: a marble hemicycle sundial (the gauge), an olive tree, a herm and a marble bench.
      const SX = SUN.x, SY = SUN.y;
      k.ellipse(SX + 3, SY + 1, 11, 3, C.shadow); k.rect(SX - 4, SY - 8, 9, 8, MB[3]); k.rect(SX - 4, SY - 8, 2, 8, MB[5]); k.rect(SX + 3, SY - 8, 2, 8, MB[1]); k.rect(SX - 6, SY - 2, 13, 2, MB[4]);
      k.ellipse(SX, SY - 12, 9, 6, MB[4]); k.ellipse(SX, SY - 11, 8, 5, MB[2]); k.rect(SX - 9, SY - 11, 19, 5, MB[4]); k.rect(SX - 9, SY - 11, 19, 1, MB[5]);
      for (let i = 0; i < 7; i++) { const a = Math.PI + (i + .5) / 7 * Math.PI; k.rect(SX + Math.round(Math.cos(a) * 7), SY - 12 + Math.round(Math.sin(a) * 5), 2, 1, i < 2 ? OR[1] : i < 4 ? C.gold2 : TQ[3]); }
      k.rect(SX - 9, SY - 9, 19, 1, TQ[3]);
      Props.tree(k, 236, 60, 'birch', 1, 3); k.rect(206, 76, 22, 3, MB[4]); k.rect(206, 76, 22, 1, MB[5]); k.rect(208, 79, 3, 3, MB[2]); k.rect(223, 79, 3, 3, MB[2]);
      k.rect(196, 44, 6, 16, MB[3]); k.rect(196, 44, 2, 16, MB[5]); k.circle(199, 41, 3, MB[4]); k.px(198, 40, MB[5]); k.rect(194, 60, 10, 2, MB[2]);
      for (let i = 0; i < 8; i++) tulip(k, 196 + (i % 4) * 12, 100 + (i >> 2) * 10, [C.red2, OR[2], GL[2]][i % 3]);
      for (let i = 0; i < 14; i++) tulip(k, 78 + P.hash(i, 7) * 12, 30 + i * 6, [OR[1], C.red2, GL[2]][i % 3]);
      for (let i = 0; i < 12; i++) tulip(k, -94 + P.hash(i, 9) * 10, 30 + i * 5, [C.red2, OR[2], GL[2]][i % 3]);

      /* Garden wall with tiled coping and a gate of two small kümbet posts. */
      for (const [x, w] of [[-250, 230], [20, 230]]) { k.rect(x, 124, w, 8, SD[3]); k.rect(x, 124, w, 2, TQ[3]); k.rect(x, 124, w, 1, TQ[5]); k.rect(x, 131, w, 1, SD[1]); for (let i = x + 3; i < x + w; i += 8) { k.rect(i, 127, 3, 3, CB[1]); k.px(i + 1, 128, TQ[4]); } k.rect(x + 2, 132, w, 2, C.shadow); }
      k.rectTex(-18, 120, 36, 20, (x, y) => [SD[4], GL[1], TQ[2], CB[1], TQ[3]][star(x, y, 12, -18, 120)]);
      for (const s of [-1, 1]) {
        const x = s * 22;
        k.rect(x - 5, 116, 11, 18, SD[3]); k.rect(x - 5, 116, 3, 18, SD[4]); k.rect(x + 3, 116, 3, 18, SD[2]); k.rect(x - 5, 116, 11, 2, TQ[3]);
        k.poly(archPts(x, 126, 2, 131), CB[0]); k.rect(x - 6, 114, 13, 2, TQ[1]);
        k.polyTex([[x - 6, 114], [x + 7, 114], [x + .5, 104]], (xx, yy) => (xx - x + 20) % 3 === 0 ? TQ[1] : xx < x ? TQ[4] : TQ[2]); k.px(x, 102, C.gold3); k.px(x, 103, C.gold1);
        k.rect(x + 2, 134, 8, 2, C.shadow);
      }
    },
    front(k) {},
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error', calm = state === 'idle';
      const blink = Math.floor(t * 4) % 2;

      /* KPI gallery: tile bars, an ink line on the page, a gauge needle. */
      const b0 = GX[0];
      [.4, .6, .5, .8].forEach((v, i) => {
        const wob = run ? Math.sin(t * 1.4 + i * 1.7) * .15 : 0, n = live ? clamp(Math.round((v + wob) * 6), 1, 6) : 1, x = b0 - 5 + i * 3;
        for (let j = 0; j < n; j++) { const bad = err && i === 2, top = j === n - 1; const c = bad ? (blink ? C.error : C.red1) : wait && i === 3 && top ? C.waiting : top ? TQ[5] : j % 2 ? CB[2] : TQ[3]; k.rect(x, -44 - j * 2, 2, 2, c); k.px(x, -44 - j * 2, S(c, .3)); }
      });
      const pg = GX[1];
      if (live) {
        const pts = []; for (let i = 0; i < 6; i++) { const s = run ? t * 1.5 : 0, drop = err && i > 3 ? (i - 3) * 3 : 0; pts.push([pg - 5 + i * 2, -45 - Math.round(3 + Math.sin((i + s) * .9) * 2 + i * .9) + drop]); }
        const nv = run ? 1 + Math.floor(t * 3) % 6 : 6; k.path(pts.slice(0, Math.max(2, nv)), err ? (blink ? C.error : C.red1) : C.red2);
        const e = pts[Math.max(1, nv - 1)]; k.px(e[0], e[1], C.gold3);
        if (wait) { k.circle(pg + 5, -47, 2, C.waiting); k.px(pg + 5, -47, C.gold0); k.rect(pg + 4, -45, 1, 3, C.red1); }
      }
      const gz = SUN.x, gy = SUN.y - 12, na = Math.PI + (live ? (run ? .7 + Math.sin(t * .9) * .15 : wait ? .5 : err ? .12 + Math.sin(t * 9) * .05 : .68) : .02) * Math.PI;
      k.line(gz, gy, gz + Math.cos(na) * 6, gy + Math.sin(na) * 6, C.gold0); k.rect(gz - 1, gy - 1, 3, 2, C.gold2);

      /* Kandils: warm glow, amber while waiting, a blinking red lamp on error, dark when off. */
      if (!live) { k.alpha(.7, () => k.rect(-5, -58, 11, 18, '#141c34')); for (const [x, y] of LAMPS) k.rect(x - 2, y - 1, 5, 3, C.glassDark); }
      else if (z.detail) LAMPS.forEach(([x, y], i) => k.alpha(.22 + Math.sin(t * 3 + i * 1.3) * .07, () => k.circle(x, y, 4, C.glassLit)));
      if (wait) k.alpha(.45 + Math.sin(t * 4) * .2, () => { k.circle(0, -53, 4, C.waiting); k.rect(-2, -54, 5, 3, C.waiting); });
      if (err && blink) { k.circle(0, -53, 4, C.error); k.rect(-1, -54, 3, 3, '#ffd0c0'); }

      /* Pennants on the minaret balconies. */
      for (const cx of [-74, 74]) {
        const y = -145, c = wait ? C.waiting : err ? C.error : live ? OR[1] : C.slate2, w = live ? Math.round(Math.sin(t * 5 + cx) * 1.5) : 0, d = cx < 0 ? -1 : 1;
        k.rect(cx + d * 7, y - 9, 1, 9, C.wood1); k.poly([[cx + d * 7, y - 9], [cx + d * (15 + w), y - 7 + w * .5], [cx + d * 7, y - 5]], c); k.px(cx + d * 8, y - 8, S(c, .4));
      }

      /* Şadırvan: jets from the bowl, falling drops and ripples. */
      const flow = run ? 1 : calm ? .7 : wait ? .7 : err ? (Math.floor(t * 2) % 3 ? 0 : 1) : 0;
      if (flow) {
        for (const s of [-1, 1]) for (let j = 0; j < 6; j++) { const p = (t * 1.3 + j / 6) % 1, x = F.x + s * (6 + p * 12), y = F.y - 16 - p * 4 + p * p * 18; k.rect(x, y, 1, 2, j % 2 ? TQ[5] : TQ[6]); }
        for (let j = 0; j < 4; j++) { const p = (t * 1.1 + j / 4) % 1; k.px(F.x + (j % 2 ? 1 : -1) * (2 + p * 3), F.y - 26 + p * p * 10, TQ[6]); }
        if (z.detail) for (let i = 0; i < 2; i++) { const p = (t * .5 * flow + i * .5) % 1; k.alpha(1 - p, () => k.ring(F.x + (i ? 14 : -14), F.y + 2, 2 + p * 6, 1 + p * 2.5, TQ[5])); }
      }
      if (live && z.detail) for (let i = 0; i < 4; i++) if (Math.floor(t * 2 + i * 1.7) % 3 === 0) k.px(F.x - 18 + i * 11, F.y + 1 + (i % 2) * 3, TQ[6]);

      /* Kiln: flicker in the firing mouth, smoke while firing. */
      if (live) { k.alpha(.4 + Math.sin(t * 7) * .2, () => k.rect(-130, 55, 5, 3, run ? C.gold4 : OR[2])); if (run) Props.smoke(k, -128, 37, t * .6, 2, '#d8d0c4'); }
      else k.rect(-130, 56, 5, 2, '#2a120a');

      /* Miniature scenes: the calligrapher, the çini painter, the weaver, readers and the teacher with students. */
      const pose = (p, alt = 'rest') => run ? p : alt;
      seat(k, t, state, -168, 8, 0, pose('write', wait ? 'rest' : 'read'), false, .1, 3);
      seat(k, t, state, -126, 10, 1, pose('paint', 'rest'), true, .4, 3);
      const wf = run ? Math.floor(t * 5) % 4 : 0, sh = err ? [0, 1, 0, -1][Math.floor(t * 12) % 4] : 0;
      k.blit(weaver(3, wf, !live), -169 + sh, 74); mark(k, -169, 54, t, state, .7);
      if (run) { const p = (t * .8) % 1, sx = -180 + Math.round((p < .5 ? p * 2 : 2 - p * 2) * 22); k.rect(sx, 42, 4, 1, C.wood4); k.px(sx + 4, 42, OR[2]); }
      seat(k, t, state, 112, 6, 2, run || calm ? 'read' : 'rest', false, .2, 1.5);
      seat(k, t, state, 140, 6, 5, run ? 'talk' : 'rest', true, .5, 2);
      seat(k, t, state, 107, 50, 4, run || calm ? 'read' : 'rest', false, .3, 1.2);
      seat(k, t, state, 127, 50, 0, run || calm ? 'read' : 'rest', false, .8, 1.2);
      seat(k, t, state, 160, 50, 3, run || wait ? 'talk' : 'rest', true, .6, 2);
      seat(k, t, state, -229, 50, 5, pose('write', 'read'), false, .9, 3);
      // Greek scholars in chitons read scrolls on the marble steps.
      gstep(k, t, state, 168, -32, 0, 'sit', false, .3); gstep(k, t, state, 214, -24, 1, 'read', true, .6);
      // Pages turn on the reading stands.
      if (live && z.detail && !err) for (const [x, y, o] of [[124, 6, 0], [118, 50, 1.3], [138, 50, 2.1]]) { const p = (t * .35 + o) % 1; if (p < .2) { const u = Math.round(Math.cos(p / .2 * Math.PI) * 4); k.line(x, y - 7, x + u, y - 9, C.white); } }

      if (live) {
        /* Scholars carry books from the archive to the hall and walk back; a courier brings a scroll to the gallery. */
        if (run) {
          for (let i = 0; i < 2; i++) {
            const p = (t * .06 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = Math.round(-123 + q * 108), f = Math.floor(t * 7 + i * 2) % 4;
            k.ellipse(x + 1, -24, 4, 1, C.shadow); k.blit(walker(i ? 4 : 1, back ? '' : 'books', f, true), x, -24, back);
          }
          const p = (t * .05) % 1, f = Math.floor(t * 7) % 4; let x, y, fl = false;
          if (p < .6) { x = 34; y = Math.round(134 - p / .6 * 158); } else { x = Math.round(34 + (p - .6) / .4 * 88); y = -24; }
          if (p < .6) { k.ellipse(x + 1, y, 4, 1, C.shadow); k.blit(walker(2, 'scroll', f, true), x, y, fl); } else { k.ellipse(x + 1, y, 4, 1, C.shadow); k.blit(walker(2, 'scroll', f, true), x, y); }
          // A potter carries fresh plates to the kiln shelf.
          const q = (t * .09) % 1, bk = q > .5, qq = bk ? (1 - q) * 2 : q * 2, px = Math.round(-120 + qq * 18);
          k.ellipse(px + 1, 30, 4, 1, C.shadow); k.blit(walker(5, bk ? '' : 'plate', Math.floor(t * 7) % 4, true), px, 30, bk);
        } else if (wait) {
          // Manuscripts await sign-off: a sealed pile at the portal and scholars queueing with scrolls.
          books(k, -12, -20, 4, 2); books(k, -4, -20, 3, 5); scroll(k, -12, -26, 8); k.circle(-1, -30, 2, C.waiting); k.px(-1, -30, C.gold0);
          for (let i = 0; i < 3; i++) { const x = 16 + i * 12; k.ellipse(x + 1, -18, 4, 1, C.shadow); k.blit(walker([1, 3, 4][i], 'scroll', 0, false), x, -18, true); mark(k, x, -44, t, state, i * .3); }
        } else if (calm) {
          // A scholar rests by the şadırvan; a cat naps on the warm terrace.
          seat(k, t, state, 40, 72, 4, 'rest', true, .2);
          k.rect(-44, -26, 7, 3, OR[3]); k.rect(-38, -28, 3, 3, OR[3]); k.px(-38, -29, OR[3]); k.px(-36, -29, OR[3]); k.px(-44 - (Math.floor(t) % 3 ? 0 : 1), -24, OR[2]);
        } else if (err) {
          // Loose pages blow across the court; ink spilt on the kilim; a scholar runs after them.
          for (let i = 0; i < 9; i++) { const q = (t * .3 + i / 9) % 1, x = -60 + q * 130 + Math.sin(t * 3 + i) * 6, y = -8 + i * 13 - Math.sin(q * Math.PI) * 16; k.rect(x - 1, y - 1, 6, 5, C.ink); k.rect(x, y, 4, 3, C.paper); k.px(x + 1, y + 1, C.stone3); }
          k.ellipse(-154, 8, 4, 1, C.ink); k.px(-150, 9, C.ink);
          const p = (t * .12) % 1, x = Math.round(-40 + p * 90); k.ellipse(x + 1, 108, 4, 1, C.shadow); k.blit(walker(0, '', Math.floor(t * 10) % 4, true), x, 108); mark(k, x, 82, t, state, 0);
        }
      }

      /* Doves circle the dome; perch on the drum when calm or off. */
      if (z.detail) {
        if (run || err || wait) for (let i = 0; i < 3; i++) { const a = t * .5 + i * 2.1; Props.bird(k, Math.cos(a) * 46, -132 + Math.sin(a) * 7 + i * 3, t + i, '#f7f7f0'); }
        else for (const x of [-18, -9, 12]) { k.rect(x, -120, 3, 2, GL[2]); k.px(x + 2, -121, GL[2]); k.px(x + 3, -121, C.gold2); }
      }
    }
  };
})();
