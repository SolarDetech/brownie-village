/* The Castle · grand heart of the village: a tall keep between two great towers, a ring of curtain walls with
   ten towers, kitchen, chapel and guard barracks, two parterres, a fountain garden, and in the centre a formal
   statue plaza with Turkish flags. An open esplanade in front of the plaza leads to the gate.
   A service place: no lead agent, guards and courtiers only. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.castle = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ROOF = '#4a5f8c';                          // royal slate-blue roofs (tinted from slate)
  const TR = '#e30a17';                            // Turkish flag red
  const F = { x: -166, y: 124 };                   // garden fountain centre (basin water level)
  const WALK_Y = 176;                              // feet line on the front wall walkways
  const POLE = { x: 82, y: 46, top: -44 };         // plaza flagpoles at ±x
  const KW_UP = [-87, -67, -47, 40, 60, 80];       // keep upper window columns (y -124)
  const KW_LOW = [-87, -67, 60, 80];               // keep lower window columns (y -90), clear of the statue
  // Lit windows that go dark when off: [x, y, w, h] of the glass.
  const DARK = [
    ...KW_UP.map(x => [x, -124, 7, 11]), ...KW_LOW.map(x => [x, -90, 7, 8]), [-10, -122, 7, 14], [4, -122, 7, 14],
    ...[-70, -40, 34, 64].map(x => [x, -154, 6, 5]), [-121, -118, 6, 7], [115, -118, 6, 7], [-121, -88, 6, 7], [115, -88, 6, 7],
    [-208, -89, 8, 6], [-194, -89, 8, 6], [-158, -89, 8, 6], [-144, -89, 8, 6], [144, -92, 6, 12], [204, -92, 6, 12],
    [126, 100, 8, 5], [142, 100, 8, 5], [174, 100, 8, 5], [188, 100, 8, 5]
  ];
  // Lamps: [x, y] feet.
  const LAMPS = [[-106, 96], [104, 96], [-124, 132], [122, 132], [-118, 182], [116, 182], [-128, -20], [126, -20], [-194, 98], [-148, 92], [140, 124]];

  /* ---------- local architecture helpers ---------- */
  // Cut-stone face: staggered blocks with a lit top edge and dark mortar.
  function ashlar(k, x, y, w, h, base = C.stone3, bh = 5, bw = 12) {
    const d = S(base, -.24), m = S(base, -.09), l = S(base, .15);
    k.rectTex(x, y, w, h, (px, py) => {
      const ry = py - y, row = Math.floor(ry / bh), rx = px - x + (row % 2 ? bw >> 1 : 0), col = Math.floor(rx / bw);
      if (ry % bh === bh - 1 || rx % bw === bw - 1) return d;
      if (ry % bh === 0) return l;
      return P.hash(col, row * 3 + y) < .24 ? m : base;
    });
    k.rect(x, y, 1, h, l); k.rect(x + w - 2, y, 2, h, S(base, -.32));
  }
  const merlons = (k, x, top, w, base = C.stone3) => {
    for (let i = 0; i + 4 <= w; i += 8) { k.rect(x + i, top - 5, 5, 5, base); k.rect(x + i, top - 5, 5, 1, S(base, .35)); k.rect(x + i + 4, top - 4, 1, 4, S(base, -.35)); k.px(x + i, top - 4, S(base, .2)); }
  };
  // Straight curtain wall seen from the front: ashlar face, walkway and front merlons.
  function curtain(k, x, by, w, h, base = C.stone3) {
    const top = by - h;
    k.rect(x + 3, by, w, 3, C.shadow);
    ashlar(k, x, top, w, h, base);
    k.rect(x, top - 8, w, 8, C.stone2); k.rect(x, top - 9, w, 2, C.stone1);
    for (let i = 3; i < w; i += 7) k.rect(x + i, top - 6, 1, 5, S(C.stone2, -.12));
    k.rect(x, top - 1, w, 1, C.stone4); merlons(k, x, top, w, base);
    k.rect(x, by - 3, w, 3, S(base, -.18)); k.rect(x, by - 3, w, 1, S(base, .1));
  }
  // The plot is a flat-top hexagon (world.js): half-width HW(y), side points at y = -5. The side walls run
  // just inside its slanted edges, drawn row by row as a walkway strip with merlons on both edges.
  const HW = y => 262 - .4 * Math.abs(y + 5);
  function slantWalls(k, y0, y1) {
    for (const s of [-1, 1]) for (let y = y0; y < y1; y++) {
      const x = s < 0 ? Math.round(-HW(y)) + 2 : Math.round(HW(y)) - 14, m = (y - y0) % 8;
      if (y - y0 > 6) k.rect(s < 0 ? x + 12 : x - 5, y, 5, 1, C.shadowSoft);
      k.rect(x, y, 12, 1, C.stone2); if ((y - y0) % 6 === 2) k.rect(x + 3, y, 6, 1, S(C.stone2, -.14));
      if (m >= 2 && m < 7) for (const ex of [x, x + 9]) { k.rect(ex, y, 3, 1, m === 2 ? C.stone5 : C.stone3); if (m > 2) k.px(ex + 2, y, C.stone1); }
      k.px(x - 1, y, C.stone1); k.px(x + 12, y, C.stone0);
    }
  }
  // Round tower with cylindrical shading; either a cone roof (o.roof) or a crenellated parapet.
  // o.edge keeps the cast shadow short so towers on the plot edge stay inside the footprint.
  function rtower(k, cx, by, r, h, o = {}) {
    const base = o.base || C.stone3, ry = Math.max(3, Math.round(r * .38)), top = by - h;
    const T = [S(base, .26), S(base, .13), base, S(base, -.12), S(base, -.26), S(base, -.4)];
    const tone = u => u < -.62 ? 0 : u < -.25 ? 1 : u < .15 ? 2 : u < .48 ? 3 : u < .78 ? 4 : 5;
    if (o.edge) k.ellipse(cx + 2, by + 2, r + 1, ry + 1, C.shadow);
    else { k.ellipse(cx + 6, by + 2, r + 4, ry + 2, C.shadow); k.poly([[cx + r, by], [cx + r + 9, by - 3], [cx + r + 9, top + 14], [cx + r, top + 8]], C.shadowSoft); }
    k.ellipse(cx, by + 1, r + 2, ry + 1, S(base, -.3));
    const pts = [[cx - r, top], [cx + r, top]];
    for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; pts.push([cx + Math.cos(a) * r, by + Math.sin(a) * ry]); }
    const ang = x => Math.asin(Math.max(-1, Math.min(1, (x + .5 - cx) / r)));
    k.polyTex(pts, (x, y) => {
      const u = Math.max(-1, Math.min(1, (x + .5 - cx) / r)), q = Math.round(y - ry * Math.sqrt(1 - u * u) - top), ti = tone(u);
      const row = Math.floor(q / 5);
      if (((q % 5) + 5) % 5 === 4) return T[Math.min(5, ti + 2)];
      const off = (row & 1) * .23;
      if (Math.floor((ang(x) + off) / .46) !== Math.floor((ang(x - 1) + off) / .46)) return T[Math.min(5, ti + 2)];
      if (((q % 5) + 5) % 5 === 0) return T[Math.max(0, ti - 1)];
      return T[ti];
    });
    for (let i = 0; i < r; i += 3) k.px(cx - r + 1 + i * 2, by + Math.round(Math.sin(Math.acos(Math.min(1, Math.abs(-r + 1 + i * 2) / r))) * ry) - 1, C.leaf2);
    (o.slits || []).forEach(s => { k.rect(cx - 1, by - s, 2, 7, C.ink); k.px(cx - 2, by - s + 1, T[4]); k.px(cx + 1, by - s + 7, T[0]); });
    (o.wins || []).forEach(s => Props.window(k, cx - 3, by - s, 6, 9, { arch: true, lit: true, frame: C.stone1 }));
    if (o.band) { k.rect(cx - r, by - o.band, r * 2, 2, T[0]); k.rect(cx - r, by - o.band + 2, r * 2, 1, T[5]); }
    if (o.roof) {
      const rh = o.roofH || Math.round(r * 2.1), rr = r + 3, col = o.roof, er = ry + 1;
      const RT = [S(col, .32), S(col, .16), col, S(col, -.15), S(col, -.3), S(col, -.44)];
      const cp = [[cx, top - rh]];
      for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; cp.push([cx + Math.cos(a) * rr, top + 2 + Math.sin(a) * er]); }
      k.polyTex(cp, (x, y) => {
        const f = Math.max(.05, (y - (top - rh)) / rh), u = Math.max(-1, Math.min(1, (x + .5 - cx) / (rr * f))), ti = tone(u);
        const yc = Math.round(y - er * f * Math.sqrt(1 - u * u) - (top - rh)), band = Math.floor(yc / 3);
        if (yc % 3 === 0) return RT[Math.min(5, ti + 1)];
        if ((x + band * 2) % 4 === 0) return RT[Math.min(5, ti + 1)];
        return RT[ti];
      });
      const arc = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; arc.push([cx + Math.cos(a) * rr, top + 2 + Math.sin(a) * er]); }
      k.path(arc, S(col, -.5)); k.line(cx - 1, top - rh + 2, cx - rr * .55, top + er * .5, S(col, .4));
      k.rect(cx - 1, top - rh - 4, 2, 5, C.gold1); k.px(cx - 1, top - rh - 5, C.gold3);
      if (o.pole) { k.rect(cx, top - rh - 4 - o.pole, 1, o.pole, C.wood1); k.px(cx, top - rh - 5 - o.pole, C.gold3); }
      return top - rh;
    }
    const R2 = r + 2, pt = top - 6;
    k.ellipse(cx, top + 2, R2, ry + 1, T[4]);
    k.rectTex(cx - R2, pt, R2 * 2 + 1, 8, x => T[tone((x + .5 - cx) / R2)]);
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; k.px(cx + Math.cos(a) * R2, top + 2 + Math.sin(a) * (ry + 1) + 1, T[5]); }
    k.ellipse(cx, pt, R2, ry + 1, C.stone5); k.ellipse(cx, pt + 1, R2 - 2, ry - 1, C.stone1); k.ellipse(cx + 1, pt + 2, R2 - 4, ry - 2, C.stone0);
    for (let i = 1; i < 8; i++) { const a = Math.PI + i / 8 * Math.PI, x = Math.round(cx + Math.cos(a) * (R2 - 1)), y = Math.round(pt + Math.sin(a) * ry); k.rect(x - 1, y - 3, 3, 3, T[2]); k.rect(x - 1, y - 3, 3, 1, C.stone5); }
    for (let i = 0; i <= 6; i++) { const a = .12 * Math.PI + i / 6 * .76 * Math.PI, x = Math.round(cx + Math.cos(a) * (R2 - 1)), y = Math.round(pt + Math.sin(a) * (ry + 1)); k.rect(x - 1, y - 4, 3, 4, T[tone((x - cx) / R2)]); k.rect(x - 1, y - 4, 3, 1, C.stone5); }
    return pt;
  }
  // Hipped slate roof front slope.
  function hipRoof(k, x0, x1, base, rh, inset, col) {
    const T = [S(col, .3), S(col, .14), col, S(col, -.18), S(col, -.34), S(col, -.48)];
    k.polyTex([[x0, base], [x1, base], [x1 - inset, base - rh], [x0 + inset, base - rh]], (x, y) => {
      const r = base - y, lx = x0 + inset * r / rh, rx = x1 - inset * r / rh, row = Math.floor(y / 3);
      let ti = x < lx + 5 ? 0 : x > rx - 5 ? 4 : r > rh - 3 ? 1 : 2;
      if (r < 3) ti = 5; else if (y % 3 === 0 || (x + row * 2) % 5 === 0) ti = Math.min(5, ti + 1);
      return T[ti];
    });
    k.rect(x0 + inset, base - rh - 1, x1 - x0 - inset * 2, 1, S(col, .45)); k.line(x0, base, x0 + inset, base - rh, S(col, .4)); k.line(x1, base, x1 - inset, base - rh, S(col, -.55));
  }
  function shield(k, cx, y, w, h, field = C.red1) {
    const pts = o => [[cx - w / 2 - o, y - o], [cx + w / 2 + o, y - o], [cx + w / 2 + o, y + h * .5], [cx, y + h + o], [cx - w / 2 - o, y + h * .5]];
    k.poly(pts(2), C.ink); k.poly(pts(1), C.gold1); k.poly(pts(0), field);
    k.poly([[cx - w / 2, y], [cx, y], [cx, y + h], [cx - w / 2, y + h * .5]], S(field, .15));
    k.rect(cx - 3, y + 6, 7, 3, C.gold2); k.rect(cx - 3, y + 8, 7, 1, C.gold0); for (const d of [-3, 0, 3]) k.rect(cx + d, y + 4, 1, 2, C.gold3); k.px(cx, y + 7, C.red3);
    k.rect(cx - 2, y + 11, 5, 1, C.gold2); k.px(cx, y + 12, C.gold2);
  }
  const tapestry = (k, cx, y, h) => {
    k.rect(cx - 5, y - 1, 11, 2, C.gold1); k.px(cx - 6, y - 1, C.gold3); k.px(cx + 6, y - 1, C.gold3);
    k.rect(cx - 4, y + 1, 9, h, C.red1); k.rect(cx - 4, y + 1, 2, h, C.red2); k.rect(cx + 3, y + 1, 2, h, C.red0);
    k.poly([[cx - 4, y + h + 1], [cx + 5, y + h + 1], [cx + 5, y + h + 5], [cx, y + h + 2], [cx - 4, y + h + 5]], C.red1);
    k.rect(cx - 4, y + 3, 9, 1, C.gold2); k.rect(cx - 4, y + h - 1, 9, 1, C.gold2);
    k.rect(cx - 2, y + 8, 5, 2, C.gold2); for (const d of [-2, 0, 2]) k.px(cx + d, y + 7, C.gold3); k.rect(cx - 1, y + 12, 3, 5, C.gold1); k.px(cx, y + 13, C.gold3);
  };
  // Topiary cone in a tub, or a clipped ball.
  const topiary = (k, x, y, tall = true) => {
    k.ellipse(x + 3, y + 1, 6, 2, C.shadow);
    if (tall) {
      k.rect(x - 3, y - 4, 7, 4, C.terra2); k.rect(x - 4, y - 5, 9, 2, C.terra3); k.rect(x + 2, y - 3, 1, 3, C.terra1);
      k.poly([[x - 5, y - 6], [x + 1, y - 24], [x + 6, y - 6]], C.leaf1); k.poly([[x - 4, y - 7], [x + 1, y - 23], [x, y - 7]], C.leaf3);
      for (let i = 0; i < 5; i++) { k.px(x - 2 + (i % 2), y - 9 - i * 3, C.leaf4); k.px(x + 3, y - 8 - i * 3, C.leaf0); }
    } else { k.circle(x, y - 4, 4, C.leaf1); k.circle(x - 1, y - 5, 3, C.leaf2); k.px(x - 2, y - 7, C.leaf4); k.px(x + 2, y - 2, C.leaf0); }
  };
  const vhedge = (k, x, y, w, h) => { k.rect(x + 2, y + 2, w, h, C.shadowSoft); k.rect(x, y, w, h, C.leaf1); k.rect(x, y, 1, h, C.leaf3); k.rect(x + w - 1, y, 1, h, C.leaf0); for (let i = 1; i < h; i += 3) { k.px(x + 1 + (i % 2), i + y, C.leaf4); k.px(x + w - 2, y + i + 1, C.leaf0); } k.rect(x, y, w, 1, C.leaf4); k.rect(x, y + h - 1, w, 1, C.leaf0); };
  const spear = (k, x, y, f = 1) => { const sx = x + (f > 0 ? 6 : -5); k.rect(sx, y - 27, 1, 26, C.wood2); k.rect(sx, y - 31, 1, 4, C.stone4); k.px(sx - 1, y - 28, C.stone3); k.px(sx + 1, y - 28, C.stone3); };
  const tabard = (k, x, y, col = C.red2) => { k.rect(x - 1, y - 12, 3, 6, col); k.px(x, y - 10, C.gold3); };
  const orangeTub = (k, x, y, v) => { k.rect(x - 4, y, 9, 6, C.wood2); k.rect(x - 5, y - 1, 11, 2, C.wood4); k.rect(x + 3, y + 1, 1, 5, C.wood1); Props.tree(k, x, y, 'orange', 0, v); };
  // Radial paving inside an ellipse, with an optional inlay band.
  function radial(k, cx, cy, rx, ry, rings = 7) {
    k.ellipse(cx, cy, rx + 2, ry + 2, C.stone1); k.ellipse(cx, cy, rx + 1, ry + 1, C.stone2);
    k.polyTex(ellPts(cx, cy, rx, ry), (x, y) => {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, r = Math.sqrt(dx * dx + dy * dy), band = Math.floor(r * rings), a = Math.atan2(dy, dx), seg = Math.floor((a + 4) * (4 + band * 3));
      if (Math.floor(r * rings + .08) !== band) return C.stone2;
      if (Math.floor((a + 4 + .03) * (4 + band * 3)) !== seg) return C.stone2;
      return band === rings - 2 ? (seg % 2 ? C.stone4 : C.terra4) : P.hash(seg, band) < .3 ? C.stone4 : C.stone3;
    });
  }

  // Parterre: four embroidered beds around a round centre.
  function parterre(k, x0, y0, flip, seed) {
    const bw = 44, bh = 48, gap = 12;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const x = x0 + i * (bw + gap), y = y0 + j * (bh + gap + 2);
      k.rect(x + 2, y + 2, bw, bh, C.shadowSoft);
      Props.flowerBed(k, x + 3, y + 3, bw - 6, bh - 6, flip ? ['#e98aa0', C.plum4, C.paper, '#f2c14e'] : ['#e46c52', '#f2c14e', C.paper, '#f09a2a'], seed + i + j * 2);
      const cx = x + bw / 2, cy = y + bh / 2;
      for (const [a, b] of [[[x + 3, cy], [cx, y + 3]], [[cx, y + 3], [x + bw - 4, cy]], [[x + bw - 4, cy], [cx, y + bh - 4]], [[cx, y + bh - 4], [x + 3, cy]]]) { k.line(a[0], a[1], b[0], b[1], C.leaf1, 3); k.line(a[0], a[1] - 1, b[0], b[1] - 1, C.leaf3); }
      k.rect(x, y, bw, 3, C.leaf3); k.rect(x, y, bw, 1, C.leaf4); k.rect(x, y + bh - 3, bw, 3, C.leaf1); k.rect(x, y + bh - 1, bw, 1, C.leaf0);
      k.rect(x, y, 3, bh, C.leaf2); k.rect(x, y, 1, bh, C.leaf4); k.rect(x + bw - 3, y, 3, bh, C.leaf1); k.rect(x + bw - 1, y, 1, bh, C.leaf0);
      for (let q = 3; q < bw - 3; q += 4) k.px(x + q, y + 1, C.leaf5);
      topiary(k, cx, cy + 3, false);
      for (const [tx, ty] of [[x + 1, y + 2], [x + bw - 2, y + 2]]) { k.circle(tx, ty, 3, C.leaf2); k.px(tx - 1, ty - 2, C.leaf4); }
    }
    const cx = x0 + bw + gap / 2, cy = y0 + bh + gap / 2 + 1;
    k.ellipse(cx, cy, 15, 9, C.leaf1); k.ellipse(cx, cy, 13, 8, C.dirt4); k.dither(cx - 13, cy - 8, 26, 16, C.dirt3, 1); k.ring(cx, cy, 13, 8, C.dirt2);
    return { cx, cy };
  }

  /* ---------- statue plaza pieces ---------- */
  // Formal bed in the national colours: stone kerb and diagonal bands of red and white tulips.
  function trBed(k, x, y, w, h) {
    k.rect(x + 1, y + h, w + 1, 2, C.shadowSoft);
    k.rect(x - 1, y - 1, w + 2, h + 2, C.stone2); k.rect(x - 1, y - 1, w + 2, 1, C.stone5); k.rect(x - 1, y + h, w + 2, 1, C.stone1); k.rect(x + w, y, 1, h, C.stone1);
    k.rect(x, y, w, h, C.leaf1); k.dither(x, y, w, h, C.leaf0, 1);
    for (let yy = y + 1; yy < y + h - 1; yy += 2) for (let xx = x + 1 + ((yy - y) >> 1) % 2; xx < x + w - 1; xx += 2) {
      const red = xx > x + 2 && xx < x + w - 3 && yy > y + 1 && yy < y + h - 3, col = red ? TR : C.white;
      k.px(xx, yy + 1, C.leaf3); k.px(xx, yy, col); if (xx + 1 < x + w - 1) k.px(xx + 1, yy, red ? S(TR, -.3) : C.stone4);
    }
  }
  // Laurel wreath on a small tripod, with a red and white sash and bow.
  function wreath(k, cx, cy) {
    k.ellipse(cx + 2, cy + 10, 10, 2, C.shadow);
    k.line(cx - 7, cy + 9, cx - 3, cy - 3, C.wood1); k.line(cx + 7, cy + 9, cx + 3, cy - 3, C.wood1); k.line(cx, cy + 9, cx, cy + 2, C.wood0);
    k.ellipse(cx, cy, 9, 8, C.leaf0); k.ellipse(cx, cy, 5, 4, C.stone4);
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * Math.PI * 2, x = Math.round(cx + Math.cos(a) * 7.5), y = Math.round(cy + Math.sin(a) * 6.5), lit = Math.cos(a) + Math.sin(a) < -.2;
      k.rect(x - 1, y, 2, 1, lit ? C.leaf4 : C.leaf2); k.px(x + (i % 2 ? 1 : -1), y - 1, lit ? C.leaf3 : C.leaf1);
      if (i % 5 === 2) k.px(x, y + 1, C.gold2);
    }
    k.ring(cx, cy, 5, 4, C.leaf1);
    // Sash across the wreath and a bow at the bottom with two tails.
    k.rect(cx - 4, cy + 5, 3, 3, TR); k.rect(cx + 2, cy + 5, 3, 3, TR); k.rect(cx - 1, cy + 6, 3, 2, S(TR, -.25));
    k.line(cx - 1, cy + 8, cx - 4, cy + 13, TR, 2); k.line(cx + 1, cy + 8, cx + 4, cy + 13, C.white, 2); k.px(cx - 4, cy + 5, S(TR, .3));
  }
  function flagpole(k, x, y, top) {
    k.ellipse(x + 3, y + 2, 9, 2, C.shadow);
    k.rect(x - 6, y - 4, 13, 5, C.stone2); k.rect(x - 6, y - 4, 13, 1, C.stone5); k.rect(x - 6, y, 13, 1, C.stone1);
    k.rect(x - 4, y - 7, 9, 3, C.stone4); k.rect(x - 4, y - 7, 9, 1, C.stone5); k.rect(x + 4, y - 7, 1, 3, C.stone1);
    k.rect(x - 1, top, 2, y - 7 - top, C.stone4); k.rect(x, top, 1, y - 7 - top, C.stone2); k.rect(x - 1, top, 1, y - 7 - top, C.stone5);
    k.rect(x - 2, top - 3, 4, 3, C.gold2); k.px(x - 2, top - 3, C.gold4); k.rect(x - 1, top - 4, 2, 1, C.gold1);
    k.rect(x - 2, y - 30, 4, 1, C.stone1); // halyard cleat
  }
  // Low stone balustrade: plinth, turned balusters and a rail. y is the ground line.
  function balustrade(k, x, y, w) {
    k.rect(x + 2, y, w, 2, C.shadow);
    k.rect(x, y - 2, w, 2, C.stone2); k.rect(x, y - 1, w, 1, C.stone1);
    k.rect(x, y - 7, w, 5, S(C.stone1, -.2));
    for (let i = 1; i < w - 1; i += 3) { k.rect(x + i, y - 7, 2, 5, C.stone4); k.px(x + i, y - 5, C.stone5); k.px(x + i + 1, y - 4, C.stone2); }
    k.rect(x, y - 9, w, 3, C.stone4); k.rect(x, y - 9, w, 1, C.stone5); k.rect(x, y - 6, w, 1, C.stone1);
  }
  // Gate pier with a brazier bowl on top (fire is animated). x is the left edge, 10 px wide.
  function pier(k, x, y) {
    k.rect(x + 3, y, 12, 1, C.shadow);
    ashlar(k, x, y - 22, 10, 22, C.stone4, 4, 5);
    k.rect(x - 1, y - 25, 12, 3, C.stone5); k.rect(x - 1, y - 23, 12, 1, C.stone1);
    k.rect(x + 2, y - 28, 6, 3, C.slate0); k.rect(x, y - 30, 10, 2, C.slate1); k.rect(x + 1, y - 30, 8, 1, C.slate3);
    k.rect(x - 1, y - 4, 12, 4, C.stone2); k.rect(x - 1, y - 4, 12, 1, C.stone4);
  }

  // Turkish flag: red field with the white crescent and star, waving. Anchor = top of the hoist.
  const SUB = [[.25, .25], [.75, .25], [.25, .75], [.75, .75]];
  const STAR = G => { const p = [], cx = G * .8208, cy = G / 2, R = G * .14; for (let i = 0; i < 10; i++) { const a = Math.PI + i * Math.PI / 5, r = i % 2 ? R * .382 : R; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  function inPoly(pts, x, y) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  // Coverage of a pixel by the crescent (0-4 subsamples) or the star (any subsample counts: it is tiny).
  function trWhite(i, j, G, star) {
    let n = 0, m = 0;
    for (const [du, dv] of SUB) {
      const u = i + du, v = j + dv, b = v - G / 2, a = u - G * .5, c = u - G * .5625;
      if (a * a + b * b <= (G * .25) ** 2 && c * c + b * b > (G * .2) ** 2) n++;
      if (inPoly(star, u, v)) m++;
    }
    return n >= 2 || m >= 1;
  }
  function flagSprite(G, f, N) {
    const W = Math.round(G * 1.5), A = 2;
    return P.sprite(`castle-trflag|${G}|${f}|${N}`, W, G + A * 2, 0, A, q => {
      const ph = f / N * Math.PI * 2, star = STAR(G);
      for (let i = 0; i < W; i++) {
        const amp = Math.min(1, i / W * 1.4) * 1.5, s = ph - i * .42, wy = Math.round(Math.sin(s) * amp), sl = Math.cos(s);
        const red = sl > .5 ? S(TR, .12) : sl < -.5 ? S(TR, -.22) : TR, wh = sl < -.5 ? C.stone4 : C.white;
        q.rect(i, wy, 1, G, red);
        for (let j = 0; j < G; j++) if (trWhite(i, j, G, star)) q.px(i, j + wy, wh);
      }
      q.rect(0, 0, 1, G, S(TR, -.1));
    }, S(TR, -.6));
  }
  // Windless: the flag hangs in folds along the pole.
  const limpSprite = G => P.sprite(`castle-trlimp|${G}`, 5, G + 2, 0, 0, q => {
    for (let i = 0; i < 5; i++) q.rect(i, 0, 1, G + (i % 2 ? 2 : 0) - i, [S(TR, .1), TR, S(TR, -.25), TR, S(TR, -.35)][i]);
    q.px(1, 3, C.white); q.px(1, 5, C.white);
  }, S(TR, -.6));
  function trFlag(k, x, y, G, t, state, dir) {
    if (state === 'off') { k.blit(limpSprite(G), x + (dir < 0 ? -1 : 1), y, dir < 0); return; }
    const N = 8, fps = state === 'working' ? 10 : state === 'idle' ? 5 : state === 'error' ? 13 : 7;
    k.blit(flagSprite(G, ((Math.floor(t * fps) % N) + N) % N, N), x + (dir < 0 ? -1 : 1), y, dir < 0);
  }

  // Fountain water: arcs, sheets and ripples. Cheap rects only.
  function fountainWater(k, t, flow, sputter) {
    const { x, y } = F;
    for (let i = 0; i < 6; i++) { const p = (t * .3 * (flow || .2) + i / 6) % 1, sx = x - 20 + p * 40; k.rect(sx, y - 3 + (i % 3) * 3, 3, 1, i % 2 ? C.water4 : C.water5); }
    if (!flow) return;
    const jh = sputter ? [2, 7, 1, 5][Math.floor(t * 7) % 4] : Math.round(8 * flow);
    k.rect(x, y - 38 - jh, 1, jh, C.water5); k.px(x, y - 39 - jh, C.foam);
    for (const s of [-1, 1]) { const p = (t * 2 + (s > 0 ? .5 : 0)) % 1; k.px(x + s * (1 + p * 4), y - 39 - jh + p * p * (jh + 4), C.water5); }
    for (const s of [-5, 5]) { k.rect(x + s, y - 35, 1, 8, C.water4); k.px(x + s, y - 35 + Math.floor(t * 18 + s) % 8, C.foam); }
    if (sputter && Math.floor(t * 3) % 2) return;
    for (const s of [-1, 1]) for (const lane of [0, 1]) {
      const sx = x + s * (lane ? 8 : 12), sy = y - 25 + lane * 2, dx = s * (lane ? 5 : 8) * flow, dy = 24 - lane * 4;
      for (let j = 0; j < 6; j++) { const p = (t * 1.7 + j / 6 + lane * .3) % 1; k.rect(sx + dx * p, sy + p * p * dy, 1, 2, j % 2 ? C.water4 : C.water5); }
      const rp = (t * 1.2 + lane * .5 + (s > 0 ? .25 : 0)) % 1, rw = 1 + Math.round(rp * 4);
      k.alpha(1 - rp, () => k.rect(sx + dx - rw, sy + dy, rw * 2 + 1, 1, C.foam));
    }
  }
  function fountain(k) {
    k.ellipse(F.x + 4, F.y + 7, 32, 10, C.shadow);
    k.ellipse(F.x, F.y + 4, 30, 12, C.stone1); k.ellipse(F.x, F.y + 3, 30, 12, C.stone2);
    for (let i = 0; i < 12; i++) { const a = .1 * Math.PI + i / 11 * .8 * Math.PI; k.rect(F.x + Math.cos(a) * 29, F.y + 3 + Math.sin(a) * 11, 1, 3, C.stone1); }
    k.ellipse(F.x, F.y, 30, 12, C.stone4); k.ellipse(F.x - 3, F.y - 1, 26, 10, C.stone5);
    k.ellipse(F.x, F.y, 26, 9, C.water0); k.ellipse(F.x, F.y + 1, 25, 8, C.water1); k.ellipse(F.x - 1, F.y + 1, 22, 6, C.water2); k.ellipse(F.x - 8, F.y - 1, 9, 2, C.water3);
    k.ellipse(F.x, F.y, 6, 2, C.stone2);
    k.rect(F.x - 3, F.y - 26, 7, 26, C.stone3); k.rect(F.x - 3, F.y - 26, 2, 26, C.stone4); k.rect(F.x + 2, F.y - 26, 2, 26, C.stone1); k.rect(F.x - 4, F.y - 12, 9, 2, C.stone4);
    k.ellipse(F.x, F.y - 24, 13, 4, C.stone1); k.ellipse(F.x, F.y - 26, 13, 4, C.stone4); k.ellipse(F.x, F.y - 26, 11, 3, C.water1); k.ellipse(F.x - 1, F.y - 26, 8, 2, C.water3);
    k.rect(F.x - 1, F.y - 36, 3, 10, C.stone3); k.px(F.x - 1, F.y - 36, C.stone5);
    k.ellipse(F.x, F.y - 35, 6, 2, C.stone4); k.ellipse(F.x, F.y - 35, 4, 1, C.water3);
    k.rect(F.x - 1, F.y - 38, 2, 2, C.gold2); k.px(F.x - 1, F.y - 38, C.gold4);
  }

  return {
    paint(k) {
      /* Meadow flowers outside the rear wall. */
      for (let i = 0; i < 34; i++) Props.flower(k, -246 + P.hash(i, 21) * 492, -208 + P.hash(i, 22) * 8, ['#f2c14e', C.paper, '#e98aa0'][i % 3]);

      /* Inner ward ground: fine gravel with speckles. */
      k.rectTex(-240, -136, 480, 330, (x, y) => { const h = P.hash(x, y); return h < .12 ? C.dirt3 : h > .93 ? C.dirt5 : C.dirt4; });

      /* Woods behind the castle give the silhouette depth. */
      for (const [x, y, kind, sz, v] of [[-214, -160, 'dark', 1, 1], [-188, -164, 'pine', 2, 0], [-160, -158, 'oak', 2, 2], [-136, -166, 'pine', 1, 1], [212, -160, 'dark', 1, 3], [186, -164, 'pine', 2, 1], [160, -158, 'oak', 2, 0], [138, -166, 'pine', 1, 2], [-240, -168, 'pine', 0, 3], [240, -168, 'pine', 0, 2]]) Props.tree(k, x, y, kind, sz, v);
      /* Rear curtain wall and its corner towers. */
      curtain(k, -198, -136, 396, 18);
      slantWalls(k, -150, -5);
      for (let i = 0; i < 12; i++) { const x = -236 + i * 42 + (i % 2) * 7; if (Math.abs(x) > 140 && Math.abs(x) < 186) { k.rect(x, -150, 2, 10, C.leaf1); k.rect(x - 2, -146, 6, 3, C.leaf2); k.px(x - 1, -147, C.leaf4); k.px(x + 3, -144, C.leaf1); } }
      rtower(k, -180, -132, 13, 40, { roof: ROOF, roofH: 24, slits: [18, 32], edge: true });
      rtower(k, 180, -132, 13, 40, { roof: ROOF, roofH: 24, slits: [18, 32], edge: true });

      /* West: kitchen and servants' hall with a busy yard. */
      k.at(14, 0, () => {   // kept clear of the slanted west wall
      Props.cobbles(k, -236, -66, 100, 22, 11, C.stone3);
      Props.building(k, -228, -66, { w: 82, h: 32, roofH: 20, roof: C.terra2, wall: C.plaster2, mat: 'timber', windows: [{ x: 6, y: 9, w: 8, h: 8, lit: true, shutters: C.teal1 }, { x: 20, y: 9, w: 8, h: 8, lit: true, shutters: C.teal1 }, { x: 56, y: 9, w: 8, h: 8, lit: true, shutters: C.teal1 }, { x: 70, y: 9, w: 8, h: 8, lit: true, shutters: C.teal1 }], door: { x: 35, w: 12, h: 16, color: C.wood2, open: true }, chimney: { x: 60, h: 12 } });
      k.rect(-199, -100, 26, 6, C.wood1); k.rect(-198, -99, 24, 4, C.wood3); k.text('KITCH', -197, -99, C.paper);
      Props.barrel(k, -236, -60); Props.barrel(k, -226, -56); Props.sack(k, -214, -52, C.plaster1); Props.sack(k, -207, -50, '#b8a276');
      });
      Props.crate(k, -172, -56); Props.crate(k, -163, -52, 7); Props.logPile(k, -166, -62, 3);
      k.rect(-200, -46, 4, 3, C.gold1); k.rect(-200, -46, 4, 1, C.gold3);
      // Bread oven: a small domed brick oven by the yard.
      k.ellipse(-149, -46, 9, 3, C.shadow); k.ellipse(-150, -52, 9, 8, C.terra1); k.ellipse(-151, -54, 7, 6, C.terra2); k.ellipse(-153, -56, 3, 2, C.terra3);
      k.rect(-158, -52, 16, 6, C.terra1); k.rect(-153, -52, 6, 5, C.ink); k.rect(-152, -50, 4, 2, '#8a3a1a');
      /* East: royal chapel with rose window and bell-cote. */
      k.at(-10, 0, () => {   // kept clear of the slanted east wall
      Props.cobbles(k, 136, -66, 100, 22, 12, C.stone3);
      Props.building(k, 148, -66, { w: 78, h: 36, style: 'peak', roofH: 26, depth: 12, roof: ROOF, wall: C.stone4, mat: 'stone', door: { x: 33, w: 12, h: 17, color: C.wood2, arch: true }, windows: [{ x: 6, y: 10, w: 6, h: 14, arch: true, lit: true, frame: C.stone1 }, { x: 66, y: 10, w: 6, h: 14, arch: true, lit: true, frame: C.stone1 }], vent: false });
      const rx = 187, ry = -112;
      k.circle(rx, ry, 7, C.stone1); k.circle(rx, ry, 6, C.stone5); k.circle(rx, ry, 5, C.plum2);
      for (let a = 0; a < 8; a++) k.px(rx + Math.round(Math.cos(a * .785) * 3), ry + Math.round(Math.sin(a * .785) * 3), [C.gold3, C.red3, C.teal4, C.gold3][a % 4]);
      k.px(rx, ry, C.gold4); k.line(rx - 5, ry, rx + 5, ry, C.stone1); k.line(rx, ry - 5, rx, ry + 5, C.stone1);
      k.rect(rx - 5, -152, 11, 13, C.stone4); k.rect(rx - 5, -152, 1, 13, C.stone5); k.rect(rx + 5, -152, 1, 13, C.stone1); k.rect(rx - 3, -149, 7, 7, C.ink); k.rect(rx - 2, -147, 5, 4, C.gold2); k.px(rx - 2, -147, C.gold4);
      k.poly([[rx - 7, -152], [rx, -161], [rx + 8, -152]], ROOF); k.poly([[rx - 7, -152], [rx, -161], [rx, -152]], S(ROOF, .2)); k.rect(rx, -166, 1, 5, C.gold2); k.rect(rx - 1, -165, 3, 1, C.gold2);
      for (const x of [140, 230]) Props.pot(k, x, -60); Props.bench(k, 152, -46, 16); Props.bench(k, 206, -46, 16);
      });

      /* The keep: hipped roof with dormers and belfry, tall ashlar front, a central frontispiece. */
      const kx = -96, kw = 192, kb = -56, kt = -134;
      hipRoof(k, kx - 2, kx + kw + 2, kt - 3, 30, 28, ROOF);
      for (const dx of [-67, -37, 37, 67]) {
        k.rect(dx - 6, -158, 12, 12, C.stone4); k.rect(dx - 6, -158, 1, 12, C.stone5); k.rect(dx + 5, -158, 1, 12, C.stone1);
        Props.window(k, dx - 3, -154, 6, 7, { lit: true, arch: true, frame: C.stone1 });
        k.poly([[dx - 8, -157], [dx, -165], [dx + 8, -157]], ROOF); k.poly([[dx - 8, -157], [dx, -165], [dx, -157]], S(ROOF, .22)); k.line(dx - 8, -157, dx, -165, S(ROOF, -.4)); k.line(dx, -165, dx + 8, -157, S(ROOF, -.4));
      }
      ashlar(k, -8, -183, 16, 16, C.stone4, 4, 8);
      for (const dx of [-6, 2]) { k.rect(dx, -180, 4, 9, C.ink); k.rect(dx, -181, 4, 1, C.stone1); } k.rect(-5, -175, 9, 3, C.gold2); k.px(-5, -175, C.gold4);
      rtowerCone(k, 0, -183, 11, 14);
      k.rect(0, -208, 1, 7, C.wood1); k.px(0, -209, C.gold3);
      ashlar(k, kx, kt, kw, kb - kt, C.stone3);
      for (let y = kt; y < kb - 6; y += 5) { const w2 = (y / 5) % 2 ? 7 : 4; k.rect(kx, y, w2, 4, C.stone4); k.rect(kx, y + 4, w2, 1, C.stone1); k.rect(kx + kw - w2, y, w2, 4, C.stone2); k.rect(kx + kw - w2, y + 4, w2, 1, C.stone0); }
      k.rect(kx - 1, -99, kw + 2, 2, C.stone4); k.rect(kx - 1, -97, kw + 2, 1, C.stone1);
      k.rect(kx - 3, kt - 4, kw + 6, 4, C.stone4); k.rect(kx - 3, kt - 4, kw + 6, 1, C.stone5); k.rect(kx - 3, kt, kw + 6, 1, C.stone1);
      for (let x = kx - 1; x < kx + kw; x += 4) k.px(x, kt + 1, C.stone1);
      merlons(k, kx - 3, kt - 4, kw + 6, C.stone3);
      k.rect(kx - 2, kb - 7, kw + 4, 7, C.stone2); k.rect(kx - 2, kb - 7, kw + 4, 1, C.stone4); for (let x = kx; x < kx + kw; x += 6) k.px(x, kb - 4, C.stone1); k.rect(kx - 2, kb - 1, kw + 4, 1, C.stone1);
      for (const wx of KW_UP) Props.window(k, wx, -124, 7, 13, { lit: true, arch: true, frame: C.stone1 });
      for (const wx of KW_LOW) Props.window(k, wx, -90, 7, 10, { lit: true, frame: C.stone1, box: '#e98aa0' });
      tapestry(k, -33, -128, 22); tapestry(k, 33, -128, 22);
      // Frontispiece: a lighter projecting bay rising above the cornice.
      ashlar(k, -28, -146, 56, 90, C.stone4, 5, 10);
      k.rect(-28, -146, 3, 90, C.stone5); k.rect(25, -146, 3, 90, C.stone2);
      k.rect(-30, -150, 60, 4, C.stone5); k.rect(-30, -147, 60, 1, C.stone1); merlons(k, -30, -150, 60, C.stone4);
      shield(k, 0, -145, 14, 16, C.red1);
      for (const x of [-10, 4]) Props.window(k, x, -122, 7, 16, { lit: true, arch: true, frame: C.stone1 });
      // Balcony on corbels.
      k.rect(-22, -102, 44, 2, C.stone5); for (let x = -21; x < 21; x += 3) k.rect(x, -100, 2, 4, C.stone4); k.rect(-22, -96, 44, 2, C.stone2); for (const x of [-18, -6, 6, 18]) k.rect(x - 1, -94, 3, 3, C.stone1);
      // Grand arched doorway.
      k.rect(-15, -78, 30, 22, C.stone5); k.ellipse(0, -78, 15, 12, C.stone5);
      for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; k.line(Math.cos(a) * 11, -78 + Math.sin(a) * 9, Math.cos(a) * 15, -78 + Math.sin(a) * 12, C.stone2); }
      k.rect(-11, -78, 22, 22, C.wood0); k.ellipse(0, -78, 11, 9, C.wood0); k.rect(-10, -78, 20, 22, C.wood2); k.ellipse(0, -78, 10, 8, C.wood2);
      for (let x = -8; x < 10; x += 3) k.rect(x, -85, 1, 29, C.wood1); k.rect(0, -86, 1, 30, C.wood0);
      for (const y of [-80, -66]) { k.rect(-10, y, 20, 2, C.stone0); for (let x = -9; x < 10; x += 3) k.px(x, y, C.stone3); }
      k.circle(-3, -70, 1, C.gold2); k.circle(3, -70, 1, C.gold2);
      // Great flanking towers overlap the keep's corners.
      for (const s of [-1, 1]) { rtower(k, s * 118, -46, 21, 108, { roof: ROOF, roofH: 40, slits: [28, 48], wins: [72, 42], band: 60, pole: 8 }); Props.door(k, s * 118 - 5, -46, 10, 15, C.wood2, { arch: true }); }

      /* Forecourt: flagstones, grand steps, lions and urns. */
      k.rectTex(-130, -56, 260, 41, (x, y) => { const row = Math.floor((y + 56) / 6), off = row % 2 * 5, cx = (x + 200 + off) % 10; if ((y + 56) % 6 === 5 || cx === 9) return C.stone2; return P.hash(Math.floor((x + off) / 10), row) < .25 ? C.stone4 : C.stone3; });
      k.rect(-130, -16, 260, 1, C.stone1);
      for (let i = 0; i < 3; i++) { const w2 = 34 + i * 10, y = -56 + i * 4; k.rect(-w2 / 2, y, w2, 4, C.stone4); k.rect(-w2 / 2, y, w2, 1, C.stone5); k.rect(-w2 / 2, y + 3, w2, 1, C.stone1); }
      k.rect(-8, -56, 16, 40, P.alpha(C.red1, .9)); k.rect(-8, -56, 1, 40, C.gold2); k.rect(7, -56, 1, 40, C.gold2);
      for (const s of [-1, 1]) {
        const x = s * 76;
        k.rect(x - 7, -40, 14, 8, C.stone2); k.rect(x - 8, -41, 16, 2, C.stone4); k.rect(x - 7, -33, 14, 1, C.stone1);
        k.rect(x - 5, -48, 10, 7, C.gold1); k.rect(x - 5, -48, 10, 1, C.gold3); k.rect(x + s * 5 - (s > 0 ? 1 : 0), -50, 2, 3, C.gold0);
        k.circle(x - s * 2, -50, 4, P.alpha(C.gold1, .8)); k.circle(x - s * 3, -51, 3, C.gold2); k.px(x - s * 4, -52, C.ink); k.px(x - s * 2, -52, C.gold4);
        Props.pot(k, s * 50 - 3, -40); Props.pot(k, s * 100 - 3, -34);
      }

      /* Side walls with mid towers enclose the ward. */
      // (The side walls follow the hexagon edge: slantWalls() above the side points, and below them before the front wall.)

      /* Formal parterres on both sides of the plaza. */
      const L = parterre(k, -222, -38, false, 31), R = parterre(k, 122, -38, true, 57);
      k.ellipse(L.cx, L.cy, 11, 6, C.stone4); k.ellipse(L.cx, L.cy + 1, 9, 4, C.water1); k.ellipse(L.cx - 1, L.cy, 7, 3, C.water2);
      k.ellipse(L.cx + 3, L.cy + 1, 2, 1, C.leaf3); k.px(L.cx + 3, L.cy, '#ffc6d8'); k.ellipse(L.cx - 4, L.cy + 2, 2, 1, C.leaf2);
      // Sundial on a column.
      k.ellipse(R.cx + 2, R.cy + 4, 7, 2, C.shadow); k.rect(R.cx - 3, R.cy - 6, 6, 9, C.stone4); k.rect(R.cx - 3, R.cy - 6, 2, 9, C.stone5); k.rect(R.cx + 2, R.cy - 6, 1, 9, C.stone2);
      k.ellipse(R.cx, R.cy - 7, 6, 2, C.gold1); k.ellipse(R.cx, R.cy - 8, 5, 2, C.gold2); k.line(R.cx, R.cy - 8, R.cx + 3, R.cy - 12, C.gold0);

      /* Avenues between parterres and plaza: orange trees in tubs, benches. */
      for (const s of [-1, 1]) {
        orangeTub(k, s * 116, -8, 1); orangeTub(k, s * 116, 84, 2);
        Props.bench(k, s > 0 ? 108 : -124, 44, 16);
      }

      /* ===== Statue plaza ===== */
      const pl = [[-94, -15], [94, -15], [100, -9], [100, 89], [94, 95], [-94, 95], [-100, 89], [-100, -9]];
      k.poly(pl.map(([x, y]) => [x + (x > 0 ? 2 : -2), y + (y > 40 ? 2 : -2)]), C.stone1);
      k.polyTex(pl, (x, y) => {
        const dx = x / 88, dy = (y - 44) / 44, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx);
        if (r < .88) {
          const band = Math.floor(r * 6), seg = Math.floor((a + 4) * (5 + band * 4));
          if (Math.floor(r * 6 + .06) !== band || Math.floor((a + 4 + .025) * (5 + band * 4)) !== seg) return C.stone2;
          return P.hash(seg, band + 9) < .3 ? C.stone5 : C.stone4;
        }
        if (r < .95) { if (r < .895 || r > .943) return C.stone5; return (Math.floor((a + 4) * 20) % 2 ? S(TR, -.38) : S(TR, -.46)); }
        const d1 = ((x + y) % 10 + 10) % 10, d2 = ((x - y) % 10 + 10) % 10;
        if (d1 === 0 || d2 === 0) return C.stone2;
        return (Math.floor((x + y) / 10) + Math.floor((x - y) / 10)) % 2 ? C.stone3 : C.stone4;
      });
      k.path([...pl, pl[0]], C.stone5);
      // Raised marble platform for the pedestal: a chamfered slab that also carries the flagpoles.
      const oct = (w, t, b, c) => [[-w + c, t], [w - c, t], [w, t + c], [w, b - c], [w - c, b], [-w + c, b], [-w, b - c], [-w, t + c]];
      k.poly(oct(91, 38, 79, 6).map(([x, y]) => [x + 2, y + 2]), C.shadowSoft); k.poly(oct(90, 37, 77, 6), C.stone1); k.poly(oct(90, 36, 75, 6), C.stone4);
      k.poly(oct(88, 37, 73, 5), C.stone5); k.ditherPoly(oct(84, 42, 71, 4), C.stone4, 1); k.path([...oct(90, 36, 75, 6), [-84, 36]], C.stone2);
      // Low clipped hedges frame the back and sides.
      Props.hedge(k, -96, -12, 34, 6); Props.hedge(k, 62, -12, 34, 6);
      vhedge(k, -97, -4, 5, 88); vhedge(k, 92, -4, 5, 88);
      // Red and white beds along the sides, behind the flagpoles.
      trBed(k, -88, 2, 18, 30); trBed(k, 70, 2, 18, 30);
      for (const s of [-1, 1]) flagpole(k, s * POLE.x, POLE.y, POLE.top);
      // The statue itself (another module, 1.5× size); it overlaps the keep and plaza behind it.
      window.AtaturkStatue?.draw(k, 0, 66);
      // In front of the pedestal: low beds and the laurel wreath, and the corner beds behind the honour guard.
      trBed(k, -46, 81, 30, 7); trBed(k, 16, 81, 30, 7);
      wreath(k, 0, 79);
      trBed(k, -92, 80, 22, 12); trBed(k, 70, 80, 22, 12);
      for (const [x, y] of [[-101, 94], [99, 94]]) { k.rect(x - 1, y - 3, 4, 4, C.stone2); }

      /* ===== Esplanade: open paved ground from the plaza to the gate ===== */
      // Large square slabs in a grid, a border course, and a lighter processional runner to the gate.
      const warm = S(C.stone4, -.04), cool = S(C.stone3, .06);
      k.rectTex(-128, 96, 256, 100, (x, y) => {
        const ax = Math.abs(x), ry = y - 96;
        if (ax > 119 || ry < 5) { if (ax === 120 || ry === 5) return C.stone2; return (Math.floor((x + 200) / 6) + Math.floor(ry / 5)) % 2 ? C.stone2 : S(C.stone2, .1); }
        if (ax < 16) { const r = Math.floor((ry - 6) / 6); if ((ry - 6) % 6 === 5 || x === 0) return C.stone3; return P.hash(r, x > 0 ? 1 : 2) < .4 ? C.stone5 : C.stone4; }
        if (ax < 19) return ax === 17 ? S(TR, -.4) : C.stone2;
        const gx = x + 200, gy = ry - 6, cx = Math.floor(gx / 16), cy = Math.floor(gy / 11);
        if (gx % 16 === 15 || gy % 11 === 10) return S(C.stone2, .05);
        const h = P.hash(cx, cy + 50), sp = P.hash(x, y);
        if (sp < .04) return S(C.stone3, -.1);
        if (gy % 11 === 0 || gx % 16 === 0) return h < .5 ? S(C.stone4, .1) : C.stone4;
        return h < .3 ? warm : h < .6 ? C.stone3 : h < .85 ? cool : S(C.plaster1, .2);
      });
      k.rect(-129, 96, 1, 100, C.stone1); k.rect(128, 96, 1, 100, C.stone1);
      for (let i = 0; i < 14; i++) { const x = -116 + Math.floor(P.hash(i, 5) * 232), y = 104 + Math.floor(P.hash(i, 6) * 86); if (Math.abs(x) > 24) k.px(x, y, C.leaf2); }

      /* West garden: the fountain in a ring of hedges and blossom trees. */
      Props.hedge(k, -210, 80, 34, 6); Props.hedge(k, -172, 80, 38, 6);
      radial(k, F.x, F.y + 2, 36, 19);
      fountain(k);
      for (const [x, y, v] of [[-198, 102, 0], [-140, 100, 1]]) Props.tree(k, x, y, 'blossom', 1, v);
      Props.bench(k, -180, 156, 16); Props.bench(k, -150, 156, 16);
      Props.flowerBed(k, -176, 161, 20, 8, ['#e98aa0', C.paper, '#f2c14e'], 7); Props.flowerBed(k, -152, 161, 22, 8, ['#e98aa0', C.paper, C.plum4], 8);

      /* East: guard barracks and training yard. */
      k.at(-28, 0, () => {   // kept clear of the slanted east wall
      k.rectTex(136, 118, 100, 52, (x, y) => { const h = P.hash(x * 3, y); return h < .15 ? C.dirt2 : h > .9 ? C.dirt4 : C.dirt3; });
      Props.building(k, 146, 118, { w: 84, h: 26, roofH: 16, roof: ROOF, wall: C.stone3, mat: 'stone', windows: [{ x: 8, y: 8, w: 8, h: 7, lit: true }, { x: 24, y: 8, w: 8, h: 7, lit: true }, { x: 56, y: 8, w: 8, h: 7, lit: true }, { x: 70, y: 8, w: 8, h: 7, lit: true }], door: { x: 38, w: 10, h: 14, color: C.wood2, open: true }, sign: { x: 49, y: 5, text: 'GUARD', color: C.red1 } });
      // Weapon rack with spears and shields.
      const wr = 160;
      k.rect(wr + 2, 164, 20, 2, C.shadow); k.rect(wr, 148, 2, 16, C.wood1); k.rect(wr + 18, 148, 2, 16, C.wood1); k.rect(wr, 150, 20, 2, C.wood2); k.rect(wr, 160, 20, 2, C.wood2);
      for (let i = 0; i < 4; i++) { k.rect(wr + 3 + i * 4, 140, 1, 22, C.wood3); k.rect(wr + 3 + i * 4, 138, 1, 3, C.stone4); }
      for (const x of [wr + 4, wr + 12]) { k.circle(x + 2, 164, 3, C.red1); k.px(x + 2, 164, C.gold3); }
      // Training dummy and archery target.
      k.ellipse(212, 160, 6, 2, C.shadow); k.rect(211, 140, 2, 20, C.wood1); k.rect(204, 146, 16, 2, C.wood2); k.circle(212, 138, 4, C.plaster1); k.rect(209, 144, 7, 10, C.gold1); k.rect(209, 144, 2, 10, C.gold2);
      k.ellipse(231, 138, 5, 2, C.shadow); k.rect(228, 130, 1, 8, C.wood1); k.rect(233, 130, 1, 8, C.wood1);
      k.circle(230, 126, 6, C.gold1); k.circle(230, 126, 5, C.white); k.circle(230, 126, 3, TR); k.circle(230, 126, 1, C.gold3);
      Props.barrel(k, 186, 156); Props.crate(k, 196, 160, 8);
      });

      for (const [x, y] of LAMPS) Props.lamp(k, x, y, true);

      /* Front: curtain walls, corner and gate towers, the open gate with balustrade and piers. */
      slantWalls(k, -5, 196);
      rtower(k, -241, 2, 9, 26, { slits: [14], edge: true }); rtower(k, 240, 2, 9, 26, { slits: [14], edge: true });
      curtain(k, -172, 196, 32, 18); curtain(k, 140, 196, 32, 18);
      for (const x of [-166, 158]) { k.rect(x, 184, 4, 10, C.leaf1); k.rect(x - 2, 186, 3, 4, C.leaf2); k.px(x + 4, 188, C.leaf3); k.px(x - 1, 185, C.leaf4); }
      for (const s of [-1, 1]) {
        rtower(k, s * 140, 191, 14, 50, { roof: ROOF, roofH: 28, slits: [20, 36], pole: 8 });
        Props.door(k, s * 140 - 5, 191, 10, 13, C.wood2, { arch: true });
      }
      Props.cobbles(k, -18, 186, 36, 14, 5, C.stone3);
      balustrade(k, -125, 198, 97); balustrade(k, 28, 198, 97);
      pier(k, -28, 199); pier(k, 18, 199);
    },
    front(k) {
      // Front merlons of the wall walkways sit in front of the patrolling guards' feet.
      for (const x0 of [-172, 140]) merlons(k, x0, 178, 32);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', calm = state === 'idle';
      /* National flags on the keep belfry and (drawn last, over the forecourt crew behind them) the plaza poles. */
      trFlag(k, 0, -207, 10, t, state, 1);
      const plazaFlags = () => { for (const s of [-1, 1]) trFlag(k, s * POLE.x, POLE.top + 2, 18, t + (s > 0 ? .3 : 0), state, 1); };
      /* Pennants on the towers: royal red, amber while waiting, flashing in error. */
      const flagCol = state === 'waiting' ? C.waiting : state === 'error' ? (Math.floor(t * 4) % 2 ? C.error : C.ink) : C.red2;
      const wind = live ? (calm ? 2 : 4) : 0;
      const pennant = (x, y, len, col) => { for (let i = 0; i < len; i++) { const wy = Math.round(Math.sin(t * wind - i * .7) * (live ? 1 : 0)), h = 5 - Math.floor(i * 3 / len); k.rect(x + 1 + i, y + wy + (live ? 0 : i >> 1), 1, h, i === 0 ? S(col, .2) : i % 3 === 2 ? S(col, -.15) : col); } };
      pennant(-118, -206, 9, flagCol); pennant(118, -206, 9, flagCol); pennant(-140, 102, 8, ROOF); pennant(140, 102, 8, ROOF);

      /* Windows dark when off, a warm flicker otherwise; lamps and braziers follow. */
      if (!live) { for (const [x, y, w, h] of DARK) k.rect(x, y, w, h, C.glassDark); for (const [x, y] of LAMPS) k.rect(x - 1, y - 20, 4, 3, C.glassDark); }
      else if (z.detail) {
        for (let i = 0; i < KW_UP.length; i++) if (Math.floor(t * .7 + i * 1.3) % 3 === 0) k.alpha(.3, () => k.rect(KW_UP[i] - 1, -125, 9, 15, C.gold4));
        for (const [x, y] of LAMPS) k.alpha(.22, () => k.circle(x + 1, y - 19, 5, C.glassLit));
      }
      for (const x of [-23, 23]) { if (live) Props.fire(k, x, 169, t + x, .7); else k.rect(x - 3, 168, 6, 1, C.stone0); }

      /* Garden fountain and kitchen smoke. */
      fountainWater(k, t, run ? 1 : calm ? .6 : state === 'waiting' ? .8 : state === 'error' ? .7 : 0, state === 'error');
      if (live) Props.smoke(k, -151, -132, t * (run ? 1 : .5), run ? 4 : 2, state === 'error' ? '#5a5650' : '#dcd8cc');

      /* Birds circle the keep. */
      if (live && z.detail) for (let i = 0; i < 3; i++) { const a = t * .5 + i * 2.1; Props.bird(k, Math.cos(a) * (120 + i * 26), -196 + Math.sin(a) * 8 + i * 5, t + i); }

      /* Guards on the front walkways, spears shouldered. */
      for (let i = 0; i < 4; i += 2) {
        const side = i < 2 ? -1 : 1, x0 = side * 158;
        if (run || calm) {
          const p = (t * (run ? .07 : .03) + i * .29) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = x0 + (i % 2 ? -1 : 1) * side * q * 10, f = ((back ? -1 : 1) * (i % 2 ? -1 : 1) * side);
          z.crew(x, WALK_Y, { look: 5, hat: 'helmet', anim: run ? 'walk' : 'idle', facing: f, phase: i * .4 }); tabard(k, x, WALK_Y); spear(k, x, WALK_Y, f);
        } else { z.crew(x0, WALK_Y, { look: 5, hat: 'helmet', anim: 'idle', facing: -side, phase: i }); tabard(k, x0, WALK_Y); spear(k, x0, WALK_Y, -side); }
      }
      /* Gate guards outside the piers, and an honour guard at the plaza front. */
      for (const s of [-1, 1]) {
        z.crew(s * 36, 199, { look: 5, hat: 'helmet', anim: 'idle', facing: -s, phase: s }); tabard(k, s * 36, 199); spear(k, s * 36, 199, -s);
        z.crew(s * 64, 90, { look: 5, hat: 'helmet', hatColor: C.stone4, anim: 'idle', facing: -s, phase: s + 2, state: live ? 'idle' : 'off' }); tabard(k, s * 64, 90, TR); spear(k, s * 64, 90, -s);
      }

      if (!live) {
        // Night: courtiers asleep on the benches, a servant dozing by the oven.
        z.crew(-116, 44, { look: 2, anim: 'sit' }); z.crew(-174, 154, { look: 4, anim: 'sit' }); z.crew(-176, -46, { look: 0, hat: 'bandana', hatColor: C.paper, anim: 'sit' });
        plazaFlags(); return;
      }
      /* Forecourt patrols pace before the great towers. */
      for (const s of [-1, 1]) {
        if (run) {
          const p = (t * .06 + (s > 0 ? .5 : 0)) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = s * (72 + q * 52), f = (back ? -1 : 1) * s;
          z.crew(x, -20, { look: 3, hat: 'helmet', anim: 'walk', facing: f, phase: s }); tabard(k, x, -20, ROOF); spear(k, x, -20, f);
        } else { z.crew(s * 100, -20, { look: 3, hat: 'helmet', anim: 'idle', facing: -s }); tabard(k, s * 100, -20, ROOF); spear(k, s * 100, -20, -s); }
      }
      /* Servants carry dishes from the kitchen to the west tower door; a courtier walks to the chapel. */
      if (run) {
        for (let i = 0; i < 2; i++) {
          const p = (t * .07 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = -188 + q * 58;
          z.crew(x, -44, { look: i ? 0 : 3, hat: 'bandana', hatColor: C.paper, anim: 'walk', carry: back ? '' : (i ? 'food' : 'box'), facing: back ? -1 : 1, phase: i });
        }
        const m = (t * .05) % 1, mx = 130 + m * 46;
        z.crew(mx, -42, { look: 4, hat: 'scarf', hatColor: C.plum3, anim: 'walk', carry: 'paper', facing: 1, phase: .3 });
      } else { z.crew(-196, -46, { look: 0, hat: 'bandana', hatColor: C.paper, anim: 'idle', facing: 1 }); z.crew(196, -46, { look: 4, hat: 'scarf', hatColor: C.plum3, anim: 'sit' }); }

      /* Gardeners tend the parterres. */
      z.crew(-160, 20, { look: 1, hat: 'straw', anim: 'work', tool: 'hoe', phase: .3, speed: 4 });
      z.crew(204, 20, { look: 3, hat: 'straw', anim: run ? 'work' : 'idle', tool: 'watering', facing: -1, phase: .7, speed: 3 });
      z.crew(-204, 76, { look: 2, hat: 'straw', anim: run ? 'work' : 'idle', tool: 'broom', phase: .1, speed: 5 });
      if (run) for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(195 - i, 14 + q * 7, C.water4); }

      /* Fountain garden: courtiers stroll around the basin, or rest on the benches. */
      if (run) for (let i = 0; i < 2; i++) {
        const a = .12 * Math.PI + ((Math.sin(t * .2 + i * 2.4) + 1) / 2) * .76 * Math.PI, dir = Math.cos(t * .2 + i * 2.4) > 0 ? -1 : 1;
        z.crew(F.x + Math.cos(a) * 30, F.y + 10 + Math.sin(a) * 12, { look: i ? 4 : 2, hat: i ? 'scarf' : 'none', hatColor: C.plum3, anim: 'walk', facing: dir, phase: i * .6 });
      } else { z.crew(-174, 154, { look: 2, anim: 'sit' }); z.crew(-144, 154, { look: 4, hat: 'scarf', hatColor: C.plum3, anim: 'sit' }); }
      if (calm) z.crew(-116, 44, { look: 1, anim: 'sit' });

      /* Barracks yard: a drill squad marches, a recruit strikes the dummy. */
      if (run) {
        const p = (t * .08) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        for (let i = 0; i < 3; i++) { const x = 134 + q * 22 + i * 10; z.crew(x, 132 + i * 2, { look: 5, hat: 'helmet', anim: 'walk', facing: back ? -1 : 1, phase: i * .1 }); tabard(k, x, 132 + i * 2); }
        z.crew(174, 160, { look: 5, hat: 'helmet', anim: 'work', tool: 'hammer', phase: .4, speed: 6 });
      } else if (state !== 'error') {
        for (let i = 0; i < 3; i++) { const x = 140 + i * 12; z.crew(x, 134, { look: 5, hat: 'helmet', anim: 'idle', facing: 1, phase: i }); tabard(k, x, 134); }
      }

      /* Waiting: petitioners queue for an audience at the east tower door, an amber lantern above it. */
      if (state === 'waiting') {
        for (let i = 0; i < 4; i++) z.crew(84 + i * 11, -24 + (i % 2) * 2, { look: i + 1, anim: 'idle', carry: 'paper', facing: 1, phase: i * .3 });
        k.rect(114, -66, 9, 7, C.ink); k.rect(115, -65, 7, 5, C.waiting); k.alpha(.3, () => k.circle(118, -62, 7, C.waiting));
      }
      if (state === 'error') {
        // A tower fire: black smoke pours from the east great tower; the barracks yard is in disarray.
        Props.fire(k, 118, -109, t, .6); Props.fire(k, 118, -79, t + .4, .5);
        Props.smoke(k, 118, -116, t, 6, '#3a3632'); Props.smoke(k, 122, -188, t * 1.3, 5, '#2a2622'); Props.smoke(k, 110, -182, t * .9, 4, '#6a6660');
        Props.crate(k, 140, 136, 7); Props.crate(k, 156, 142, 6); Props.barrel(k, 168, 130); k.rect(148, 150, 3, 2, C.red2);
        for (let i = 0; i < 2; i++) z.crew(144 + i * 20, 162, { look: 5, hat: 'helmet', anim: 'idle', facing: i ? -1 : 1, phase: i });
        if (Math.floor(t * 4) % 2) for (const s of [-1, 1]) { k.rect(s * 140 - 3, 120, 7, 7, C.ink); k.rect(s * 140 - 2, 121, 5, 5, C.error); }
      }
      plazaFlags();
    }
  };

  function ellPts(cx, cy, rx, ry) { const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
  // Small cone spire on a square belfry.
  function rtowerCone(k, cx, top, rr, rh) {
    const col = ROOF;
    k.poly([[cx - rr, top + 1], [cx, top - rh], [cx + rr, top + 1]], S(col, -.25));
    k.poly([[cx - rr, top + 1], [cx, top - rh], [cx, top + 1]], S(col, .2));
    for (let y = top - rh + 3; y < top; y += 3) { const w2 = Math.round((y - top + rh) / rh * rr); k.rect(cx - w2, y, w2 * 2, 1, S(col, -.4)); }
    k.rect(cx - rr - 1, top, rr * 2 + 2, 2, S(col, -.5)); k.rect(cx - 1, top - rh - 3, 2, 4, C.gold1); k.px(cx - 1, top - rh - 4, C.gold3);
  }
})();
