/* The Castle · grand heart of the village, on the standard hex tile. The keep stands across the back between two
   great round towers (slate-blue cones), with trees and the rear curtain wall on the top edge behind its roof.
   In front of it, on a round paved plaza, stands the Atatürk equestrian statue between two Turkish flags; the
   keep's arched door shows between the horse's legs. West of the plaza is the fountain garden, east a parterre
   with a sundial; behind them, beside the towers, a bread oven (west) and a guards' weapon rack and dummy (east).
   Curtain walls run along the slanted hex edges, with small towers at the side points; the front edge has low
   balustrades and a gate with brazier piers at the bottom centre. The open ground in front of the plaza is kept
   free for the owners' avatars. A service place: no lead agent, guards and courtiers only. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.castle = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ROOF = '#4a5f8c';                          // royal slate-blue roofs (tinted from slate)
  const TR = '#e30a17';                            // Turkish flag red
  const SY = 90;                                   // statue: centre of the pedestal's front edge is (0, SY)
  const KX = -100, KW = 200, KB = -15, KT = -98;   // keep front wall: left x, width, ground line, wall top
  const TX = 118, TB = -10, TH = 106, TRH = 32;    // great towers at ±TX: base y, height, cone height
  const F = { x: -146, y: 26 };                    // garden fountain centre (basin water level)
  const POLE = { x: 104, y: 64, top: -40 };        // plaza flagpoles at ±x
  const KW_UP = [-88, -68, -48, 41, 61, 81];       // keep upper window columns (y -88)
  const KW_LOW = [-88, -68, 61, 81];               // keep lower window columns (y -50)
  // Lit windows that go dark when off: [x, y, w, h] of the glass (only those not behind the statue).
  const FLICKER = [-88, -68, 81];                  // upper keep windows (x) that flicker, clear of the statue
  const DARK = [
    ...FLICKER.map(x => [x, -88, 7, 11]), [-88, -50, 7, 8], [-68, -50, 7, 8], [37, -114, 6, 4], [67, -114, 6, 4],
    [-121, -94, 6, 7], [-121, -58, 6, 7], [115, -94, 6, 7], [115, -58, 6, 7]
  ];
  // Lamps: [x, y] feet.
  const LAMPS = [[-108, 130], [106, 130], [-96, -8], [94, -8]];

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
  const HW = y => 206 - .4 * Math.abs(y + 5);
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

  // Parterre: four embroidered beds (bw × bh) around a round centre.
  function parterre(k, x0, y0, flip, seed, bw = 44, bh = 48, gap = 12) {
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
    k.ellipse(cx, cy, 11, 7, C.leaf1); k.ellipse(cx, cy, 9, 6, C.dirt4); k.dither(cx - 9, cy - 6, 18, 12, C.dirt3, 1); k.ring(cx, cy, 9, 6, C.dirt2);
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
      /* Inner ward ground: fine gravel with speckles. */
      k.rectTex(-206, -152, 412, 302, (x, y) => { const h = P.hash(x, y); return h < .12 ? C.dirt3 : h > .93 ? C.dirt5 : C.dirt4; });

      /* Rear curtain wall on the top edge, the upper side walls, and trees behind the keep roof. */
      curtain(k, -148, -141, 296, 10);
      slantWalls(k, -152, -5);
      for (const [x, y, kind, sz, v] of [[-82, -122, 'pine', 1, 1], [-46, -126, 'oak', 1, 2], [48, -126, 'oak', 1, 0], [84, -122, 'pine', 1, 2]]) Props.tree(k, x, y, kind, sz, v);

      /* West strip beside the great tower: a domed bread oven, logs and stores. */
      Props.tree(k, -150, -86, 'pine', 0, 1);
      k.at(-10, 12, () => {
        k.ellipse(-149, -46, 9, 3, C.shadow); k.ellipse(-150, -52, 9, 8, C.terra1); k.ellipse(-151, -54, 7, 6, C.terra2); k.ellipse(-153, -56, 3, 2, C.terra3);
        k.rect(-158, -52, 16, 6, C.terra1); k.rect(-153, -52, 6, 5, C.ink); k.rect(-152, -50, 4, 2, '#8a3a1a');
      });
      Props.logPile(k, -180, -18, 3); Props.barrel(k, -158, -20); Props.sack(k, -146, -16, C.plaster1); Props.sack(k, -150, -12, '#b8a276');
      Props.crate(k, -174, -10); k.rect(-166, -6, 4, 3, C.gold1); k.rect(-166, -6, 4, 1, C.gold3);

      /* East strip: the guards' weapon rack, a training dummy and an archery target. */
      Props.tree(k, 150, -86, 'pine', 0, 2);
      k.at(-18, -190, () => {
        const wr = 160;
        k.rect(wr + 2, 164, 20, 2, C.shadow); k.rect(wr, 148, 2, 16, C.wood1); k.rect(wr + 18, 148, 2, 16, C.wood1); k.rect(wr, 150, 20, 2, C.wood2); k.rect(wr, 160, 20, 2, C.wood2);
        for (let i = 0; i < 4; i++) { k.rect(wr + 3 + i * 4, 140, 1, 22, C.wood3); k.rect(wr + 3 + i * 4, 138, 1, 3, C.stone4); }
        for (const x of [wr + 4, wr + 12]) { k.circle(x + 2, 164, 3, C.red1); k.px(x + 2, 164, C.gold3); }
      });
      k.at(-38, -176, () => { k.ellipse(212, 160, 6, 2, C.shadow); k.rect(211, 140, 2, 20, C.wood1); k.rect(204, 146, 16, 2, C.wood2); k.circle(212, 138, 4, C.plaster1); k.rect(209, 144, 7, 10, C.gold1); k.rect(209, 144, 2, 10, C.gold2); });
      k.at(-70, -196, () => {
        k.ellipse(231, 138, 5, 2, C.shadow); k.rect(228, 130, 1, 8, C.wood1); k.rect(233, 130, 1, 8, C.wood1);
        k.circle(230, 126, 6, C.gold1); k.circle(230, 126, 5, C.white); k.circle(230, 126, 3, TR); k.circle(230, 126, 1, C.gold3);
      });

      /* The keep: hipped slate roof with dormers, a tall ashlar front, a lighter frontispiece around the door. */
      hipRoof(k, KX - 2, KX + KW + 2, KT - 3, 24, 22, ROOF);
      for (const dx of [-70, -40, 40, 70]) {
        k.rect(dx - 6, -117, 12, 11, C.stone4); k.rect(dx - 6, -117, 1, 11, C.stone5); k.rect(dx + 5, -117, 1, 11, C.stone1);
        Props.window(k, dx - 3, -114, 6, 6, { lit: true, arch: true, frame: C.stone1 });
        k.poly([[dx - 8, -116], [dx, -123], [dx + 8, -116]], ROOF); k.poly([[dx - 8, -116], [dx, -123], [dx, -116]], S(ROOF, .22)); k.line(dx - 8, -116, dx, -123, S(ROOF, -.4)); k.line(dx, -123, dx + 8, -116, S(ROOF, -.4));
      }
      for (const x of [-80, 79]) { k.rect(x, -130, 2, 5, C.gold1); k.px(x, -131, C.gold3); }
      ashlar(k, KX, KT, KW, KB - KT, C.stone3);
      for (let y = KT; y < KB - 6; y += 5) { const w2 = (y / 5) % 2 ? 7 : 4; k.rect(KX, y, w2, 4, C.stone4); k.rect(KX, y + 4, w2, 1, C.stone1); k.rect(KX + KW - w2, y, w2, 4, C.stone2); k.rect(KX + KW - w2, y + 4, w2, 1, C.stone0); }
      k.rect(KX - 1, -60, KW + 2, 2, C.stone4); k.rect(KX - 1, -58, KW + 2, 1, C.stone1);
      k.rect(KX - 3, KT - 4, KW + 6, 4, C.stone4); k.rect(KX - 3, KT - 4, KW + 6, 1, C.stone5); k.rect(KX - 3, KT, KW + 6, 1, C.stone1);
      for (let x = KX - 1; x < KX + KW; x += 4) k.px(x, KT + 1, C.stone1);
      merlons(k, KX - 3, KT - 4, KW + 6, C.stone3);
      k.rect(KX - 2, KB - 7, KW + 4, 7, C.stone2); k.rect(KX - 2, KB - 7, KW + 4, 1, C.stone4); for (let x = KX; x < KX + KW; x += 6) k.px(x, KB - 4, C.stone1); k.rect(KX - 2, KB - 1, KW + 4, 1, C.stone1);
      for (const wx of KW_UP) Props.window(k, wx, -88, 7, 13, { lit: true, arch: true, frame: C.stone1 });
      for (const wx of KW_LOW) Props.window(k, wx, -50, 7, 10, { lit: true, frame: C.stone1, box: '#e98aa0' });
      // Frontispiece: a lighter projecting bay that rises above the cornice.
      ashlar(k, -28, KT - 10, 56, KB - KT + 10, C.stone4, 5, 10);
      k.rect(-28, KT - 10, 3, KB - KT + 10, C.stone5); k.rect(25, KT - 10, 3, KB - KT + 10, C.stone2);
      k.rect(-30, KT - 14, 60, 4, C.stone5); k.rect(-30, KT - 11, 60, 1, C.stone1); merlons(k, -30, KT - 14, 60, C.stone4);
      // Grand arched doorway (framed by the horse's legs when seen from the plaza).
      const dy = KB - 22;
      k.rect(-15, dy, 30, 22, C.stone5); k.ellipse(0, dy, 15, 12, C.stone5);
      for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; k.line(Math.cos(a) * 11, dy + Math.sin(a) * 9, Math.cos(a) * 15, dy + Math.sin(a) * 12, C.stone2); }
      k.rect(-11, dy, 22, 22, C.wood0); k.ellipse(0, dy, 11, 9, C.wood0); k.rect(-10, dy, 20, 22, C.wood2); k.ellipse(0, dy, 10, 8, C.wood2);
      for (let x = -8; x < 10; x += 3) k.rect(x, dy - 7, 1, 29, C.wood1); k.rect(0, dy - 8, 1, 30, C.wood0);
      for (const y of [dy - 2, dy + 12]) { k.rect(-10, y, 20, 2, C.stone0); for (let x = -9; x < 10; x += 3) k.px(x, y, C.stone3); }
      k.circle(-3, dy + 8, 1, C.gold2); k.circle(3, dy + 8, 1, C.gold2);
      k.rect(-17, KB, 34, 2, C.stone5); k.rect(-17, KB + 1, 34, 1, C.stone1);

      /* ===== Statue plaza: round radial paving with a red inlay ring, centred on the pedestal ===== */
      const pl = [[-108, -12], [108, -12], [114, -6], [114, 138], [108, 144], [-108, 144], [-114, 138], [-114, -6]];
      k.poly(pl.map(([x, y]) => [x + (x > 0 ? 2 : -2), y + (y > 60 ? 2 : -2)]), C.stone1);
      k.polyTex(pl, (x, y) => {
        const dx = x / 104, dy = (y - 84) / 56, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx);
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

      /* Great flanking towers overlap the keep's corners. */
      for (const s of [-1, 1]) { rtower(k, s * TX, TB, 19, TH, { roof: ROOF, roofH: TRH, slits: [30, 56], wins: [84, 48], band: 66 }); Props.door(k, s * TX - 5, TB, 10, 15, C.wood2, { arch: true }); }

      /* West: the fountain garden, hedged at the back, with a blossom tree, an orange tub and a bench. */
      Props.hedge(k, -176, 0, 26, 6); Props.hedge(k, -142, 0, 24, 6);
      radial(k, F.x, F.y + 2, 32, 17);
      fountain(k);
      Props.tree(k, -150, 74, 'blossom', 1, 0);
      orangeTub(k, -126, 88, 1);
      Props.bench(k, -150, 100, 14);
      /* East: a parterre of four embroidered beds around a sundial, an orange tub and a bench. */
      const R = parterre(k, 117, 2, true, 57, 22, 20, 7);
      k.ellipse(R.cx + 2, R.cy + 4, 7, 2, C.shadow); k.rect(R.cx - 3, R.cy - 6, 6, 9, C.stone4); k.rect(R.cx - 3, R.cy - 6, 2, 9, C.stone5); k.rect(R.cx + 2, R.cy - 6, 1, 9, C.stone2);
      k.ellipse(R.cx, R.cy - 7, 6, 2, C.gold1); k.ellipse(R.cx, R.cy - 8, 5, 2, C.gold2); k.line(R.cx, R.cy - 8, R.cx + 3, R.cy - 12, C.gold0);
      orangeTub(k, 126, 88, 2);
      Props.bench(k, 134, 100, 14);
      // Clipped hedges edge the plaza between the gardens and the esplanade.
      vhedge(k, -118, 54, 5, 66); vhedge(k, 113, 54, 5, 66);

      /* Red and white beds beside the pedestal, the flagpoles, and the statue itself (another module). */
      trBed(k, -100, 10, 12, 34); trBed(k, 88, 10, 12, 34);
      for (const s of [-1, 1]) flagpole(k, s * POLE.x, POLE.y, POLE.top);
      window.AtaturkStatue?.draw(k, 0, SY);
      // In front of the pedestal: low beds and the laurel wreath, and corner beds.
      trBed(k, -46, 96, 30, 7); trBed(k, 16, 96, 30, 7);
      wreath(k, 0, 102);
      trBed(k, -104, 98, 16, 10); trBed(k, 88, 98, 16, 10);

      /* Processional runner from the gate to the plaza ring. */
      k.rectTex(-14, 118, 28, 32, (x, y) => {
        const ry = y - 118, ax = Math.abs(x), r = Math.floor(ry / 6);
        if (ax >= 12) return ax === 12 ? S(TR, -.4) : C.stone2;
        if (ry % 6 === 5 || x === 0) return C.stone3;
        return P.hash(r, x > 0 ? 1 : 2) < .4 ? C.stone5 : C.stone4;
      });

      for (const [x, y] of LAMPS) Props.lamp(k, x, y, true);

      /* Lower side walls with towers at the side points; the front edge: low balustrades and the gate piers. */
      slantWalls(k, -5, 150);
      rtower(k, -188, 2, 9, 26, { slits: [14], edge: true }); rtower(k, 188, 2, 9, 26, { slits: [14], edge: true });
      for (const x of [-176, 172]) { k.rect(x, 60, 4, 10, C.leaf1); k.rect(x - 2, 62, 3, 4, C.leaf2); k.px(x + 4, 64, C.leaf3); k.px(x - 1, 61, C.leaf4); }
      balustrade(k, -118, 148, 88); balustrade(k, 30, 148, 88);
      pier(k, -28, 149); pier(k, 18, 149);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', calm = state === 'idle';
      /* The plaza flags are drawn last, over any crew behind them. */
      const plazaFlags = () => { for (const s of [-1, 1]) trFlag(k, s * POLE.x, POLE.top + 2, 18, t + (s > 0 ? .3 : 0), state, 1); };
      /* Pennants on the towers: royal red, amber while waiting, flashing in error. */
      const flagCol = state === 'waiting' ? C.waiting : state === 'error' ? (Math.floor(t * 4) % 2 ? C.error : C.ink) : C.red2;
      const wind = live ? (calm ? 2 : 4) : 0;
      const pennant = (x, y, len, col) => { k.rect(x, y, 1, 7, C.wood1); for (let i = 0; i < len; i++) { const wy = Math.round(Math.sin(t * wind - i * .7) * (live ? 1 : 0)), h = 5 - Math.floor(i * 3 / len); k.rect(x + 1 + i, y + wy + (live ? 0 : i >> 1), 1, h, i === 0 ? S(col, .2) : i % 3 === 2 ? S(col, -.15) : col); } };
      pennant(-TX, -158, 8, flagCol); pennant(TX, -158, 8, flagCol); pennant(-188, -37, 7, ROOF); pennant(188, -37, 7, ROOF);

      /* Windows dark when off, a warm flicker otherwise; lamps and braziers follow. */
      if (!live) { for (const [x, y, w, h] of DARK) k.rect(x, y, w, h, C.glassDark); for (const [x, y] of LAMPS) k.rect(x - 1, y - 20, 4, 3, C.glassDark); }
      else if (z.detail) {
        for (let i = 0; i < FLICKER.length; i++) if (Math.floor(t * .7 + i * 1.3) % 3 === 0) k.alpha(.3, () => k.rect(FLICKER[i] - 1, -89, 9, 15, C.gold4));
        for (const [x, y] of LAMPS) k.alpha(.22, () => k.circle(x + 1, y - 19, 5, C.glassLit));
      }
      for (const x of [-23, 23]) { if (live) Props.fire(k, x, 119, t + x, .7); else k.rect(x - 3, 118, 6, 1, C.stone0); }

      /* Garden fountain and bread-oven smoke. */
      fountainWater(k, t, run ? 1 : calm ? .6 : state === 'waiting' ? .8 : state === 'error' ? .7 : 0, state === 'error');
      if (live) Props.smoke(k, -162, -50, t * (run ? 1 : .5), run ? 4 : 2, state === 'error' ? '#5a5650' : '#dcd8cc');

      /* Birds circle over the keep roof. */
      if (live && z.detail) for (let i = 0; i < 3; i++) { const a = t * .5 + i * 2.1; Props.bird(k, Math.cos(a) * (80 + i * 22), -136 + Math.sin(a) * 6 + i * 4, t + i); }

      /* Guards pace the side-wall walkways, spears shouldered. */
      for (const s of [-1, 1]) {
        const move = run || calm, p = move ? (t * (run ? .05 : .02) + (s > 0 ? .5 : 0)) % 1 : .3, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        const y = Math.round(40 + q * 56), x = s * Math.round(HW(y) - 8), f = move ? (back ? s : -s) : -s;
        z.crew(x, y, { look: 5, hat: 'helmet', anim: move ? 'walk' : 'idle', facing: f, phase: s }); tabard(k, x, y); spear(k, x, y, f);
      }
      /* Gate guards inside the piers, and an honour guard in front of the pedestal. */
      for (const s of [-1, 1]) {
        z.crew(s * 38, 138, { look: 5, hat: 'helmet', anim: 'idle', facing: -s, phase: s }); tabard(k, s * 38, 138); spear(k, s * 38, 138, -s);
        z.crew(s * 54, 110, { look: 5, hat: 'helmet', hatColor: C.stone4, anim: 'idle', facing: -s, phase: s + 2, state: live ? 'idle' : 'off' }); tabard(k, s * 54, 110, TR); spear(k, s * 54, 110, -s);
      }

      if (!live) {
        // Night: courtiers asleep on the benches, a baker dozing by the oven.
        z.crew(-143, 99, { look: 2, anim: 'sit' }); z.crew(141, 99, { look: 4, anim: 'sit' }); z.crew(-150, -24, { look: 0, hat: 'bandana', hatColor: C.paper, anim: 'sit' });
        plazaFlags(); return;
      }
      /* Forecourt patrols pace before the great towers (clear of the statue). */
      for (const s of [-1, 1]) {
        if (run) {
          const p = (t * .06 + (s > 0 ? .5 : 0)) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = s * Math.round(92 + q * 36), f = (back ? -1 : 1) * s;
          z.crew(x, -2, { look: 3, hat: 'helmet', anim: 'walk', facing: f, phase: s }); tabard(k, x, -2, ROOF); spear(k, x, -2, f);
        } else { const x = s * (state === 'waiting' ? 132 : 100); z.crew(x, -2, { look: 3, hat: 'helmet', anim: 'idle', facing: -s }); tabard(k, x, -2, ROOF); spear(k, x, -2, -s); }
      }
      /* Bakers carry bread from the oven to the west tower door; a courtier strolls past the parterre. */
      if (run) {
        for (let i = 0; i < 2; i++) {
          const p = (t * .08 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = Math.round(-170 + q * 42);
          z.crew(x, -6, { look: i ? 0 : 3, hat: 'bandana', hatColor: C.paper, anim: 'walk', carry: back ? '' : (i ? 'food' : 'box'), facing: back ? -1 : 1, phase: i });
        }
        const m = (t * .05) % 1, back = m > .5, mx = Math.round(122 + (back ? 1 - m : m) * 2 * 36);
        z.crew(mx, 64, { look: 4, hat: 'scarf', hatColor: C.plum3, anim: 'walk', carry: 'paper', facing: back ? -1 : 1, phase: .3 });
      } else { z.crew(-172, -6, { look: 0, hat: 'bandana', hatColor: C.paper, anim: 'idle', facing: 1 }); z.crew(141, 99, { look: 4, hat: 'scarf', hatColor: C.plum3, anim: 'sit' }); }

      /* Gardeners tend the parterre and sweep the fountain garden. */
      z.crew(-128, 56, { look: 2, hat: 'straw', anim: run ? 'work' : 'idle', tool: 'broom', phase: .1, speed: 5 });
      z.crew(128, 60, { look: 1, hat: 'straw', anim: 'work', tool: 'hoe', phase: .3, speed: 4 });
      z.crew(158, 60, { look: 3, hat: 'straw', anim: run ? 'work' : 'idle', tool: 'watering', facing: -1, phase: .7, speed: 3 });
      if (run) for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(149 - i, 54 + q * 7, C.water4); }

      /* Fountain garden: courtiers stroll around the basin, or rest on the bench. */
      if (run) for (let i = 0; i < 2; i++) {
        const a = .12 * Math.PI + ((Math.sin(t * .2 + i * 2.4) + 1) / 2) * .76 * Math.PI, dir = Math.cos(t * .2 + i * 2.4) > 0 ? -1 : 1;
        z.crew(F.x + Math.cos(a) * 30, F.y + 10 + Math.sin(a) * 12, { look: i ? 4 : 2, hat: i ? 'scarf' : 'none', hatColor: C.plum3, anim: 'walk', facing: dir, phase: i * .6 });
      } else z.crew(-143, 99, { look: 2, anim: 'sit' });

      /* Training ground: a recruit strikes the dummy while a sergeant watches. */
      if (run) {
        z.crew(162, -12, { look: 5, hat: 'helmet', anim: 'work', tool: 'hammer', phase: .4, speed: 6 });
        z.crew(146, -4, { look: 5, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: 1, phase: .2 }); tabard(k, 146, -4);
      } else if (state !== 'error') {
        for (let i = 0; i < 2; i++) { const x = 150 + i * 12; z.crew(x, -6, { look: 5, hat: 'helmet', anim: 'idle', facing: -1, phase: i }); tabard(k, x, -6); }
      }

      /* Waiting: petitioners queue for an audience at the east tower door, an amber lantern above it. */
      if (state === 'waiting') {
        for (let i = 0; i < 4; i++) z.crew(92 + i * 9, -2 + (i % 2), { look: i + 1, anim: 'idle', carry: 'paper', facing: 1, phase: i * .3 });
        k.rect(TX - 4, -36, 9, 7, C.ink); k.rect(TX - 3, -35, 7, 5, C.waiting); k.alpha(.3, () => k.circle(TX, -32, 7, C.waiting));
      }
      if (state === 'error') {
        // A tower fire: black smoke pours from the east great tower; the training ground is in disarray.
        Props.fire(k, TX, -86, t, .6); Props.fire(k, TX, -52, t + .4, .5);
        Props.smoke(k, TX, -92, t, 6, '#3a3632'); Props.smoke(k, TX + 4, -150, t * 1.3, 5, '#2a2622'); Props.smoke(k, TX - 6, -146, t * .9, 4, '#6a6660');
        Props.crate(k, 150, -2, 7); Props.crate(k, 166, 4, 6); Props.barrel(k, 176, -8); k.rect(158, 8, 3, 2, C.red2);
        for (let i = 0; i < 2; i++) z.crew(148 + i * 18, 12, { look: 5, hat: 'helmet', anim: 'idle', facing: i ? -1 : 1, phase: i });
        if (Math.floor(t * 4) % 2) for (const s of [-1, 1]) { k.rect(s * TX - 3, -34, 7, 7, C.ink); k.rect(s * TX - 2, -33, 5, 5, C.error); }
      }
      plazaFlags();
    }
  };

  function ellPts(cx, cy, rx, ry) { const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
})();
