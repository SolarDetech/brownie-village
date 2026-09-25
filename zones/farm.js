/* Farm · Growing & harvesting: red barn and silo, a tower windmill, a glasshouse, crop beds at every growth stage,
   a sheep and chicken paddock with coop, hay bales, orchard hives and a produce cart at the gate. Resource zone: no lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.farm = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const MILL = { x: -40, y: -46, hub: -102 };      // windmill base centre and sail hub height
  const WHEAT = { x: -176, y: 2, w: 158, h: 34 };  // ripe wheat field (animated sway)
  const PEN = { x0: -150, x1: -64, y0: 54, y1: 132 };
  const CARTP = { x: 26, y: 106 };
  const SHEEP = [[-110, 74], [-120, 98], [-96, 76], [-138, 120], [-86, 112]];
  const HENS = [[-136, 104], [-128, 118], [-110, 122], [-100, 90], [-128, 84]];
  const straw = look => ({ look, hat: 'straw' });
  const RED = ['#5e1c18', '#86281f', '#a8382c', '#c4533e'];

  /* ---------- Local helpers ---------- */
  const bed = (k, x, y, w, h, soil = C.dirt1) => {
    k.rect(x + 2, y + h + 1, w, 2, C.shadowSoft); k.rect(x - 1, y - 1, w + 2, h + 2, C.wood1); k.rect(x - 1, y - 1, w + 2, 1, C.wood3);
    k.rect(x, y, w, h, soil); for (let r = 2; r < h; r += 5) { k.rect(x, y + r, w, 1, S(soil, -.25)); k.rect(x, y + r + 1, w, 1, S(soil, .12)); }
    for (let i = 0; i < w * h / 30; i++) k.px(x + P.hash(i, x) * w, y + P.hash(y, i) * h, S(soil, -.35));
  };
  const cabbage = (k, x, y) => { k.ellipse(x, y, 3, 2, C.leaf1); k.ellipse(x - 1, y - 1, 2, 1, C.leaf3); k.px(x - 1, y - 2, C.leaf5); k.px(x + 2, y + 1, C.leaf0); k.px(x - 3, y, C.leaf2); };
  const carrot = (k, x, y) => { k.px(x, y, '#e8782a'); k.px(x + 1, y, '#c85a1e'); k.rect(x, y - 3, 1, 3, C.leaf3); k.px(x - 1, y - 3, C.leaf4); k.px(x + 1, y - 4, C.leaf4); k.px(x + 2, y - 2, C.leaf2); };
  const pumpkin = (k, x, y, s = 3) => { k.ellipse(x + 1, y + 1, s + 1, 1, C.shadow); k.ellipse(x, y - 1, s, s - 1, '#d8742a'); k.rect(x - 1, y - s, 1, s * 2 - 1, '#b85a1e'); k.px(x - s + 1, y - 2, '#f0a050'); k.rect(x, y - s - 1, 1, 2, C.leaf1); };
  const hen = f => P.sprite(`fm-hen|${f}`, 10, 9, 5, 8, q => {
    const peck = f === 1; q.rect(-3, -5, 6, 4, C.white); q.rect(-3, -5, 6, 1, '#fff8e8'); q.rect(-4, -5, 1, 2, '#e8e0d0'); q.px(-3, -2, '#d8d0c0');
    q.rect(peck ? 2 : 1, peck ? -4 : -7, 3, 3, C.white); q.px(peck ? 3 : 2, peck ? -5 : -8, C.red2); q.px(peck ? 5 : 4, peck ? -3 : -6, C.gold2); q.px(peck ? 3 : 2, peck ? -3 : -6, C.ink);
    q.px(-1, -1, C.gold1); q.px(1, -1, C.gold1);
  }, '#5a4a3a');
  const sheepSprite = (f, lie) => P.sprite(`fm-sheep|${f}|${lie}`, 16, 12, 8, 10, q => {
    const y = lie ? 2 : 0;
    if (!lie) for (const x of [-4, -1, 2, 4]) q.rect(x, -3, 1, 3, '#3a302a');
    q.ellipse(0, -6 + y, 6, 4, '#e8e2d2'); q.ellipse(-1, -7 + y, 5, 3, '#f6f2e6'); for (let i = 0; i < 5; i++) q.px(-4 + i * 2, -9 + y + (i % 2), C.white); q.px(3, -4 + y, '#c8c0b0'); q.px(-4, -4 + y, '#d0c8b8');
    const hy = (f && !lie ? -4 : -7) + y; q.rect(5, hy, 3, 4, '#3a302a'); q.px(5, hy - 1, '#e8e2d2'); q.px(7, hy + 1, C.ink); q.px(4, hy, '#2a221e');
  }, '#4a4038');
  // Tower-mill sails: four lattice sails, symmetric every 90 degrees -> 9 frames of 10 degrees.
  const sailSprite = f => P.sprite(`fm-sails|${f}`, 76, 76, 38, 38, q => {
    for (let i = 0; i < 4; i++) {
      const a = f * Math.PI / 18 + i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), T = (r, w) => [c * r - s * w, s * r + c * w];
      q.poly([T(8, 1), T(35, 1), T(35, 8), T(8, 8)], C.paper2);
      q.poly([T(8, 1), T(35, 1), T(35, 3), T(8, 3)], C.paper);
      for (let r = 11; r <= 35; r += 5) q.line(...T(r, 1), ...T(r, 8), C.wood2);
      q.line(...T(8, 8), ...T(35, 8), C.wood1); q.line(...T(2, 0), ...T(36, 0), C.wood1, 2);
    }
    q.circle(0, 0, 4, C.wood1); q.circle(0, 0, 3, C.wood3); q.px(-1, -1, C.wood5); q.px(0, 0, C.wood0);
  }, C.wood0);
  const scarecrow = () => P.sprite('fm-scarecrow', 24, 32, 12, 30, q => {
    const x = 0, y = 0; q.rect(x, y - 24, 2, 24, C.wood1); q.rect(x - 8, y - 18, 18, 2, C.wood1);
    q.rect(x - 4, y - 18, 10, 9, C.teal2); q.rect(x - 4, y - 18, 10, 1, C.teal3); q.rect(x - 10, y - 17, 3, 3, C.gold3); q.rect(x + 9, y - 17, 3, 3, C.gold3);
    q.rect(x - 2, y - 25, 6, 6, C.paper2); q.px(x - 1, y - 23, C.ink); q.px(x + 2, y - 23, C.ink); q.rect(x - 5, y - 27, 12, 2, C.gold2); q.rect(x - 2, y - 30, 6, 3, C.gold3); q.rect(x - 2, y - 28, 6, 1, C.red2);
  });
  // Ripe wheat field in four sway frames; drawn once each, blitted per frame.
  const wheatSprite = f => P.sprite(`fm-wheat|${f}`, WHEAT.w, WHEAT.h + 6, 0, 6, q => {
    for (let r = 0; r < WHEAT.h; r += 4) for (let x = 1 + (r % 8 ? 1 : 0); x < WHEAT.w - 1; x += 3) {
      const sway = Math.round(Math.sin(f * Math.PI / 2 + x * .09 + r * .3) * 1.2), h = 5 + Math.floor(P.hash(x, r) * 3), y = r + 4;
      q.rect(x, y - h + 2, 1, h - 2, r % 8 ? C.gold1 : '#a88428');
      q.rect(x + sway, y - h, 1, 3, C.gold2); q.px(x + sway, y - h, C.gold3); if (P.hash(r, x) > .7) q.px(x + sway + 1, y - h + 1, C.gold4);
    }
  }, null);

  return {
    paint(k) {
      /* ---- Ground: meadow edge, farmyard dirt, lanes ---- */
      k.polyTex([[-150, 42], [150, 42], [182, 60], [186, 136], [22, 136], [-22, 136], [-60, 136], [-60, 44]], (x, y) => {
        const h = P.hash(x * 5, y * 3); if (h < .07) return C.dirt1; if (h > .95) return C.stone3; if (h > .88) return C.dirt4; if (Math.abs(x) < 14 && y > 100) return (x + y) % 3 ? C.dirt3 : C.dirt4; return C.dirt3;
      });
      k.rect(-12, -42, 24, 86, C.dirt3); k.dither(-12, -42, 24, 86, C.dirt2, 1); k.rect(-12, -42, 1, 86, C.dirt2); k.rect(11, -42, 1, 86, C.dirt2);
      k.rect(-182, -40, 364, 6, C.dirt3); k.dither(-182, -40, 364, 6, C.dirt2, 1);
      for (let i = 0; i < 22; i++) { const x = -12 + P.hash(i, 7) * 24, y = -40 + P.hash(i, 8) * 84; k.px(x, y, C.dirt4); }

      /* ---- Red barn with hayloft and silo ---- */
      const bx = -162, by = -44, bw = 60;   // narrowed to clear the hexagon edge
      Props.building(k, bx, by, { w: bw, h: 42, roofH: 28, roof: C.slate1, wall: RED[2], mat: 'planks', foundation: 4 });
      for (let x = bx + 3; x < bx + bw - 2; x += 4) k.rect(x, by - 40, 1, 36, RED[1]);
      k.rect(bx, by - 42, bw, 2, C.paper); k.rect(bx, by - 42, 2, 38, C.paper); k.rect(bx + bw - 2, by - 42, 2, 38, C.paper2);
      // Big double door with white X braces.
      const dx = bx + 16, dw = 28, dh = 26; k.rect(dx - 2, by - dh - 2, dw + 4, dh + 2, C.paper); k.rect(dx, by - dh, dw, dh, RED[1]);
      for (const x0 of [dx, dx + dw / 2]) { k.rect(x0, by - dh, 1, dh, C.paper2); k.line(x0 + 1, by - dh + 1, x0 + dw / 2 - 2, by - 2, C.paper); k.line(x0 + dw / 2 - 2, by - dh + 1, x0 + 1, by - 2, C.paper); k.rect(x0, by - dh / 2 - 1, dw / 2, 1, C.paper); }
      k.rect(dx + dw / 2, by - dh, 1, dh, RED[0]); k.rect(dx - 3, by, dw + 6, 2, C.stone3);
      // Hayloft door, pulley beam and hay spilling out.
      k.rect(dx + 7, by - 40, 14, 10, C.paper); k.rect(dx + 8, by - 39, 12, 9, '#3a2418'); k.rect(dx + 8, by - 33, 12, 3, C.gold2); k.px(dx + 10, by - 34, C.gold3); k.px(dx + 15, by - 34, C.gold3);
      k.rect(dx + 12, by - 48, 3, 8, C.wood1); k.rect(dx + 12, by - 44, 8, 2, C.wood2); k.rect(dx + 18, by - 42, 1, 6, C.stone1); k.rect(dx + 17, by - 36, 3, 2, C.stone2);
      Props.window(k, bx + 4, by - 30, 8, 8, { frame: C.paper }); Props.window(k, bx + 48, by - 30, 8, 8, { frame: C.paper });
      // Silo: banded cylinder with a dome cap.
      const sx = -102, sw = 22, stop = -98;
      k.rect(sx + sw, stop + 4, 5, -44 - stop - 4, C.shadowSoft);
      k.rect(sx, stop, sw, -44 - stop, C.stone3); k.rect(sx, stop, 5, -44 - stop, C.stone4); k.rect(sx + sw - 5, stop, 5, -44 - stop, C.stone2); k.rect(sx + sw - 2, stop, 2, -44 - stop, C.stone1);
      for (let y = stop + 6; y < -46; y += 8) { k.rect(sx, y, sw, 1, C.stone1); k.rect(sx, y + 1, sw, 1, C.stone4); }
      k.ellipse(sx + sw / 2, stop, sw / 2, 7, C.slate2); k.ellipse(sx + sw / 2 - 3, stop - 3, 5, 3, C.slate3); k.rect(sx, stop, sw, 2, C.slate0); k.rect(sx + sw / 2 - 1, stop - 10, 2, 3, C.slate1);
      k.rect(sx + 4, stop + 6, 1, -50 - stop, C.wood1); for (let y = stop + 8; y < -48; y += 3) k.rect(sx + 3, y, 3, 1, C.wood2);

      /* ---- Tower windmill ---- */
      const mx = MILL.x, mb = MILL.y, mt = -98;
      k.poly([[mx + 13, mb], [mx + 21, mb - 3], [mx + 16, mt + 6], [mx + 8, mt]], C.shadow);
      k.polyTex([[mx - 13, mb], [mx + 13, mb], [mx + 8, mt], [mx - 8, mt]], (x, y) => {
        const f = (y - mt) / (mb - mt), half = 8 + 5 * f, u = (x - mx + half) / (half * 2);
        if (u < .18) return C.plaster3; if (u > .8) return u > .92 ? C.plaster0 : C.plaster1;
        return (y % 6 === 0 && (x + Math.floor(y / 6) * 3) % 6 !== 0) ? C.plaster1 : C.plaster2;
      });
      k.rect(mx - 14, mb - 4, 28, 4, C.stone2); k.rect(mx - 14, mb - 4, 28, 1, C.stone4);
      Props.door(k, mx - 4, mb, 9, 13, C.wood2, { arch: true });
      Props.window(k, mx - 3, mb - 32, 5, 6, { frame: C.wood1 }); Props.window(k, mx - 3, mb - 48, 5, 5, { frame: C.wood1 });
      k.rect(mx - 12, mb - 22, 24, 2, C.wood2); k.rect(mx - 12, mb - 22, 24, 1, C.wood4); for (let x = mx - 12; x < mx + 12; x += 4) k.rect(x, mb - 20, 1, 3, C.wood1);
      k.poly([[mx - 11, mt + 1], [mx + 11, mt + 1], [mx + 8, mt - 8], [mx, mt - 12], [mx - 8, mt - 8]], C.wood1);
      k.poly([[mx - 9, mt], [mx + 1, mt], [mx, mt - 11], [mx - 7, mt - 8]], C.wood3); k.rect(mx - 11, mt, 22, 2, C.wood0);
      for (let i = 0; i < 4; i++) Props.sack(k, mx + 16 + (i % 2) * 8, mb - 10 + Math.floor(i / 2) * 5, i % 2 ? C.plaster1 : C.paper2);

      /* ---- Glasshouse ---- */
      const gx = 18, gy = -50, gw = 100, gh = 26, gr = 16;
      k.rect(gx + 3, gy - gh - gr, gw + 4, gh + gr + 3, C.shadowSoft);
      k.rect(gx, gy - gh, gw, gh, '#2e4630');
      for (let i = 0; i < 12; i++) { const x = gx + 5 + i * 8; k.ellipse(x, gy - 10, 4, 5, i % 2 ? C.leaf2 : C.leaf3); k.px(x - 1, gy - 13, C.leaf5); if (i % 3 === 0) { k.px(x + 1, gy - 9, C.red2); k.px(x - 2, gy - 7, C.red3); } if (i % 3 === 1) k.px(x, gy - 8, C.gold2); }
      for (let i = 0; i < 6; i++) { const x = gx + 8 + i * 16; k.line(x, gy - gh + 2, x + 2, gy - 12, C.leaf1); k.px(x + 1, gy - gh + 6, C.leaf4); }
      k.rect(gx, gy - 6, gw, 6, C.terra1); for (let x = gx; x < gx + gw; x += 5) k.px(x, gy - 4, C.terra0); k.rect(gx, gy - 6, gw, 1, C.terra3);
      k.alpha(.45, () => { k.rect(gx, gy - gh, gw, gh - 6, C.glass); k.poly([[gx - 3, gy - gh], [gx + gw + 3, gy - gh], [gx + gw - 3, gy - gh - gr], [gx + 3, gy - gh - gr]], C.glass); });
      k.poly([[gx - 3, gy - gh], [gx + gw + 3, gy - gh], [gx + gw - 3, gy - gh - gr], [gx + 3, gy - gh - gr]], P.alpha(C.water4, .35));
      for (let x = gx; x <= gx + gw; x += 10) { k.rect(x, gy - gh, 1, gh - 6, C.white); k.line(x, gy - gh, x + (x - gx - gw / 2) * .06, gy - gh - gr, C.plaster3); }
      k.rect(gx - 3, gy - gh - 1, gw + 6, 2, C.white); k.rect(gx + 3, gy - gh - gr - 1, gw - 6, 2, C.plaster3); k.rect(gx, gy - gh + 9, gw, 1, C.plaster3);
      for (let i = 0; i < 6; i++) { const x = gx + 6 + i * 17; k.line(x, gy - gh - 3, x + 5, gy - gh - 12, C.white); k.line(x + 2, gy - 8, x + 6, gy - gh + 2, P.alpha(C.white, .6)); }
      Props.door(k, gx + gw / 2 - 5, gy, 10, 16, C.teal2, {}); k.rect(gx + gw / 2 - 4, gy - 15, 8, 6, C.glass);
      for (const x of [gx + 4, gx + gw - 10]) Props.pot(k, x, gy + 2);

      /* ---- Orchard corner with beehives ---- */
      Props.tree(k, 142, -98, 'fruit', 1, 1); Props.tree(k, 174, -104, 'blossom', 1, 2); Props.tree(k, 160, -72, 'orange', 1, 3); Props.tree(k, 178, -60, 'fruit', 0, 0);
      for (let i = 0; i < 3; i++) { const x = 130 + i * 12, y = -48; k.rect(x + 2, y + 1, 9, 2, C.shadow); k.rect(x, y - 10, 9, 10, C.gold2); k.rect(x, y - 10, 9, 1, C.gold4); k.rect(x, y - 6, 9, 1, C.gold1); k.rect(x - 1, y - 12, 11, 2, C.wood2); k.rect(x + 3, y - 3, 3, 1, C.ink); }

      /* ---- Crop beds, one per growth stage ---- */
      // Seed rows: freshly tilled with first sprouts.
      bed(k, -176, -30, 76, 24); for (let r = 0; r < 4; r++) for (let x = -172; x < -102; x += 5) { const y = -26 + r * 5 + 1; if (P.hash(x, r) > .35) { k.px(x, y, C.leaf3); k.px(x + 1, y - 1, C.leaf4); } }
      // Leafy greens: cabbages and lettuce.
      bed(k, -92, -30, 76, 24); for (let r = 0; r < 3; r++) for (let x = -87; x < -20; x += 9) cabbage(k, x + (r % 2) * 4, -24 + r * 8);
      // Root crop: carrots with feathery tops.
      bed(k, 18, -30, 76, 24); for (let r = 0; r < 4; r++) for (let x = 22; x < 92; x += 5) carrot(k, x + (r % 2) * 2, -23 + r * 5);
      // Pumpkin patch with vines.
      bed(k, 102, -30, 80, 24, C.dirt2); for (let i = 0; i < 6; i++) k.line(104 + i * 13, -26 + (i % 2) * 8, 114 + i * 13, -20 + (i % 3) * 3, C.leaf1);
      for (let i = 0; i < 10; i++) { const x = 106 + (i * 17) % 74, y = -24 + (i * 7) % 18; k.ellipse(x, y, 3, 2, C.leaf2); k.px(x - 1, y - 1, C.leaf4); }
      for (const [x, y, s] of [[112, -14, 4], [132, -22, 3], [150, -12, 4], [170, -20, 3], [124, -8, 3], [164, -8, 3]]) pumpkin(k, x, y, s);
      // Wheat field bed (the ears are animated), with a scarecrow.
      bed(k, WHEAT.x, WHEAT.y, WHEAT.w, WHEAT.h, '#9a7a44');
      // Tomatoes on stakes.
      bed(k, 18, 2, 76, 34); for (let i = 0; i < 8; i++) { const x = 24 + i * 9; k.rect(x, 6, 1, 26, C.wood3); for (let j = 0; j < 4; j++) { k.ellipse(x + (j % 2 ? 1 : -1), 12 + j * 6, 3, 3, j % 2 ? C.leaf2 : C.leaf1); k.px(x - 1, 11 + j * 6, C.leaf4); if ((i + j) % 2) { k.rect(x + 1, 13 + j * 6, 2, 2, C.red2); k.px(x + 1, 13 + j * 6, C.red3); } } }
      // Sweetcorn: tall stalks with tassels and cobs.
      bed(k, 102, 2, 80, 34); for (let r = 0; r < 3; r++) for (let x = 106 + r * 2; x < 180; x += 7) { const y = 14 + r * 10; k.rect(x, y - 12, 1, 12, C.leaf2); k.line(x, y - 5, x + 3, y - 8, C.leaf3); k.line(x, y - 8, x - 3, y - 10, C.leaf1); k.rect(x - 1, y - 14, 3, 2, C.gold3); if ((x + r) % 3 === 0) { k.rect(x + 1, y - 7, 2, 3, C.gold2); k.px(x + 1, y - 7, C.leaf4); } }
      // Irrigation channel and hand pump between the beds.
      k.rect(-176, -4, 176, 2, C.water1); k.rect(-176, -4, 176, 1, C.water3); k.rect(18, -4, 164, 2, C.water1); k.rect(18, -4, 164, 1, C.water3);

      /* ---- Paddock with coop, trough and animals ---- */
      k.rect(PEN.x0, PEN.y0, PEN.x1 - PEN.x0, PEN.y1 - PEN.y0, C.grass3); k.dither(PEN.x0, PEN.y0, PEN.x1 - PEN.x0, PEN.y1 - PEN.y0, C.grass4, 1);
      for (let i = 0; i < 18; i++) Props.tuft(k, PEN.x0 + 4 + P.hash(i, 71) * 110, PEN.y0 + 6 + P.hash(i, 72) * 70, C.grass1, C.grass5);
      k.ellipse(-126, 112, 14, 6, C.dirt2); k.dither(-140, 106, 28, 12, C.dirt3, 1);
      Props.building(k, -146, 96, { w: 30, h: 18, roofH: 12, roof: C.terra1, wall: C.wood3, mat: 'planks', door: { x: 10, w: 8, h: 9, color: C.wood1, open: true }, foundation: 2 });
      k.line(-132, 96, -126, 102, C.wood2, 2); for (let i = 0; i < 3; i++) k.rect(-131 + i * 2, 97 + i * 2, 1, 1, C.wood4);
      k.rect(-100, 58, 22, 6, C.wood1); k.rect(-99, 59, 20, 3, C.water2); k.rect(-99, 59, 20, 1, C.water4); k.rect(-100, 64, 2, 2, C.wood0); k.rect(-80, 64, 2, 2, C.wood0);
      Props.fence(k, PEN.x0, PEN.y0, PEN.x1 - PEN.x0); Props.fence(k, PEN.x0, PEN.y1, PEN.x1 - PEN.x0);
      Props.fence(k, PEN.x0, PEN.y0, PEN.y1 - PEN.y0, true); Props.fence(k, PEN.x1, PEN.y0, 36, true); Props.fence(k, PEN.x1, PEN.y0 + 54, PEN.y1 - PEN.y0 - 54, true);
      k.rect(-78, 76, 8, 5, C.gold2); k.rect(-78, 76, 8, 1, C.gold3); k.rect(-72, 80, 6, 4, C.gold1);

      /* ---- Farmyard: well, hay bales, produce stand, cart ---- */
      Props.well(k, -36, 88);
      const bale = (x, y) => { k.rect(x + 2, y + 1, 14, 2, C.shadow); k.rect(x, y - 8, 14, 8, C.gold2); k.rect(x, y - 8, 14, 1, C.gold3); k.rect(x, y - 1, 14, 1, C.gold0); k.rect(x + 4, y - 8, 1, 8, C.gold1); k.rect(x + 9, y - 8, 1, 8, C.gold1); for (let i = 0; i < 4; i++) k.px(x + 1 + i * 3, y - 5 + (i % 2), C.gold4); };
      for (const [x, y] of [[106, 128], [120, 128], [113, 120], [127, 120], [120, 112], [132, 104]]) bale(x, y);   // stacked inside the hexagon's cut corner
      const round = (x, y) => { k.ellipse(x + 2, y + 1, 9, 2, C.shadow); k.circle(x, y - 6, 7, C.gold1); k.circle(x - 1, y - 7, 5, C.gold2); k.ring(x - 1, y - 7, 3, 3, C.gold1); k.px(x - 3, y - 10, C.gold4); };
      round(118, 96); round(150, 92); round(102, 84);
      Props.cart(k, CARTP.x, CARTP.y, (q, x, y) => { for (let i = 0; i < 3; i++) { q.circle(x + 5 + i * 6, y - 1, 3, i === 1 ? C.red2 : '#d8742a'); q.px(x + 4 + i * 6, y - 3, C.white); } q.ellipse(x + 11, y - 5, 4, 3, C.leaf2); q.px(x + 10, y - 7, C.leaf4); });
      for (let i = 0; i < 4; i++) { const x = 64 + (i % 2) * 11, y = 118 - Math.floor(i / 2) * 9; Props.crate(k, x, y, 10); for (let j = 0; j < 3; j++) k.circle(x + 2 + j * 3, y, 1, [C.red2, '#d8742a', C.leaf3, C.gold2][i]); }
      for (const [x, y, s] of [[92, 128, 4], [100, 124, 3], [86, 122, 3], [96, 118, 3]]) pumpkin(k, x, y, s);
      Props.sack(k, 50, 124, C.plaster1); Props.sack(k, 42, 128, C.paper2); Props.barrel(k, 110, 98);
      // Scarecrow, lamp, gate sign and edging flowers.
      Props.sign(k, 28, 140, 'FARM', C.leaf1); Props.lamp(k, -22, 136, false); Props.lamp(k, 14, -44, false);
      Props.flowerBed(k, -56, 124, 28, 10, ['#f2c14e', '#e46c52', '#f6ecd0'], 5);
      for (const [x, y] of [[180, 40], [180, 80], [-180, 40], [-56, 50], [180, 134]]) Props.bush(k, x, y, 1);
      for (let i = 0; i < 16; i++) Props.flower(k, -186 + P.hash(i, 81) * 372, -140 + P.hash(i, 82) * 12, ['#f2c14e', '#f6ecd0', '#e98aa0'][i % 3]);
      for (let i = 0; i < 20; i++) Props.tuft(k, -120 + P.hash(i, 91) * 240, -140 + P.hash(i, 92) * 20, C.grass1, C.grass4);
      // Back boundary: herb beds, a duck pond with reeds, hedges and a split-rail fence.
      Props.fence(k, -150, -140, 114); Props.hedge(k, 100, -148, 46, 7);
      Props.flowerBed(k, -148, -134, 32, 12, ['#c3a2c0', '#f6ecd0', C.leaf4], 3); Props.flowerBed(k, -112, -134, 30, 12, ['#f2c14e', '#e46c52', C.leaf4], 4);
      Props.pond(k, 28, -128, 26, 9); k.rect(2, -120, 10, 2, C.wood2); k.rect(2, -120, 10, 1, C.wood4); for (const x of [3, 10]) k.rect(x, -118, 1, 4, C.wood1);
      for (let i = 0; i < 7; i++) { const x = -78 + i * 5; k.rect(x, -140, 1, 12, C.leaf1); k.line(x, -134, x + 2, -136, C.leaf3); k.circle(x, -142, 2, C.gold2); k.px(x, -142, C.wood1); }
      Props.tree(k, 76, -120, 'oak', 0, 2); Props.tree(k, 100, -116, 'birch', 0, 1); Props.bush(k, -94, -128, 2); Props.bush(k, 62, -136, 1);
      // Tool shed with hung hoes and watering cans in the east yard.
      Props.building(k, 122, 80, { w: 48, h: 22, roofH: 12, roof: C.terra1, wall: C.wood3, mat: 'planks', door: { x: 6, w: 12, h: 14, color: C.wood1, open: true }, windows: [{ x: 32, y: 6, w: 8, h: 7 }], foundation: 2 });
      for (let i = 0; i < 3; i++) { k.rect(142 + i * 4, 62, 1, 14, C.wood4); k.rect(141 + i * 4, 75, 3, 2, C.stone2); }
      k.rect(112, 72, 6, 5, '#6a8aa0'); k.line(118, 73, 121, 70, '#6a8aa0'); k.rect(112, 72, 6, 1, '#8aaac0');
      { const x = 72, y = 70; k.ellipse(x + 8, y + 1, 11, 2, C.shadow); k.line(x + 12, y - 4, x + 22, y - 1, C.wood1, 2); k.poly([[x - 2, y - 9], [x + 14, y - 9], [x + 12, y - 2], [x + 1, y - 2]], C.wood2); k.rect(x - 1, y - 9, 15, 1, C.wood4); pumpkin(k, x + 3, y - 9, 3); pumpkin(k, x + 9, y - 10, 3); k.circle(x + 2, y - 1, 3, C.wood0); k.circle(x + 2, y - 1, 2, C.stone1); }
      k.ellipse(40, 66, 12, 5, C.dirt1); k.ellipse(39, 64, 9, 4, '#5a4a2a'); for (let i = 0; i < 8; i++) k.px(30 + P.hash(i, 5) * 18, 61 + P.hash(i, 6) * 6, i % 2 ? C.leaf3 : '#d8742a');
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error';
      const dim = (s, x, y, flip) => { k.blit(s, x, y, flip); if (!live) k.blit(P.tint(s, '#141c3c'), x, y, flip, .4); };

      /* Wheat sways in the breeze (still when off). */
      dim(wheatSprite(live ? Math.floor(t * 2.5) % 4 : 0), WHEAT.x, WHEAT.y);
      dim(scarecrow(), -150, 24);
      // A cut swathe where the harvester is working.
      if (run) { const cut = Math.floor(((t * .04) % 1) * 40); k.rect(WHEAT.x + 118 - cut, WHEAT.y + 18, cut + 20, 14, '#9a7a44'); k.dither(WHEAT.x + 118 - cut, WHEAT.y + 18, cut + 20, 14, '#c4a060', 0); for (let x = WHEAT.x + 119 - cut; x < WHEAT.x + 138; x += 3) k.rect(x, WHEAT.y + 26, 1, 2, C.gold1); }

      /* Windmill sails: turning while working, braked otherwise, jammed and smoking on error. */
      const sf = run ? Math.floor(t * 8) % 9 : err ? 4 : 0;
      dim(sailSprite(sf), MILL.x, MILL.hub);
      if (err) { Props.smoke(k, MILL.x + 4, MILL.hub - 6, t, 5, '#5a5650'); for (let i = 0; i < 5; i++) { const q = (t * 3.5 + i / 5) % 1; k.px(MILL.x + 3 + Math.cos(i * 1.3) * q * 12, MILL.hub + Math.sin(i * 1.3) * q * 8 + q * q * 10, q < .5 ? C.gold4 : C.red3); } }
      if (run && z.detail) for (let i = 0; i < 3; i++) { const q = (t * .6 + i / 3) % 1; k.alpha((1 - q) * .8, () => k.px(MILL.x + 22 + q * 6, MILL.y - 18 - q * 10, C.paper)); }

      if (live) for (let i = 0; i < 3; i++) { const x = 28 + Math.round(Math.sin(t * .3 + i * 2.1) * 14), y = -129 + i * 3, fl = Math.cos(t * .3 + i * 2.1) < 0; k.rect(x - 2, y, 5, 2, i ? C.white : '#6a5a3a'); k.rect(fl ? x - 3 : x + 2, y - 2, 2, 2, i ? C.white : C.leaf1); k.px(fl ? x - 4 : x + 4, y - 1, C.gold2); k.rect(x - 2, y + 2, 5, 1, C.water4); }
      /* Animals. Off: sheep lie down and hens are in the coop. */
      SHEEP.forEach(([x, y], i) => {
        const dx = live ? Math.round(Math.sin(t * .25 + i * 2) * 4) : 0;
        dim(sheepSprite(live ? Math.floor(t * .8 + i * .7) % 2 : 0, !live || (state === 'idle' && i % 2 === 0)), x + dx, y, i % 2 === 1);
      });
      if (live) HENS.forEach(([x, y], i) => {
        let hx = x + Math.round(Math.sin(t * .6 + i * 1.7) * 6), hy = y, f = Math.floor(t * 3 + i) % 3 === 0 ? 1 : 0;
        if (err) { const q = (t * .15 + i / 5) % 1; hx = -60 + ((q * 240 + i * 31) % 240) - 20; hy = 42 + (i * 9) % 12; f = Math.floor(t * 8) % 2; } // escaped through the broken rail
        k.blit(hen(f), hx, hy, Math.sin(t * .6 + i * 1.7 + 1.57) < 0);
      });
      if (err) { k.rect(PEN.x1 - 2, PEN.y0 + 40, 12, 2, C.wood2); k.line(PEN.x1 + 2, PEN.y0 + 44, PEN.x1 + 12, PEN.y0 + 50, C.wood2, 2); }

      /* Waiting: harvest piled at the gate on hold. */
      if (wait) {
        for (let i = 0; i < 6; i++) { const x = 44 + (i % 3) * 11, y = 100 - Math.floor(i / 3) * 9; Props.crate(k, x, y, 10); k.circle(x + 4, y, 2, i % 2 ? C.red2 : '#d8742a'); }
        for (let i = 0; i < 4; i++) Props.sack(k, -60 + i * 9, 40 + (i % 2) * 3, C.plaster1);
        k.rect(CARTP.x + 2, CARTP.y - 30, 28, 11, C.ink); k.rect(CARTP.x + 3, CARTP.y - 29, 26, 9, C.waiting); k.text('HOLD', CARTP.x + 9, CARTP.y - 27, C.ink);
      }
      /* State lantern on the lane post and window glow in the glasshouse. */
      const sig = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      k.rect(13, -64, 6, 5, sig); if (live) k.px(13, -64, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(16, -62, 7, sig));
      if (live) k.rect(-23, 115, 4, 3, C.glassLit);

      /* Crew. */
      if (run) {
        z.crew(-138, -8, { ...straw(0), anim: 'work', tool: 'hoe', speed: 4, phase: .1 });
        z.crew(-54, -8, { ...straw(1), anim: 'work', tool: 'watering', speed: 3, phase: .5 });
        for (let i = 0; i < 4; i++) { const q = (t * 2 + i / 4) % 1; k.px(-45 + i, -18 + q * 8, C.water4); }
        const hx = WHEAT.x + 120 - Math.floor(((t * .04) % 1) * 40);
        z.crew(hx, WHEAT.y + 30, { ...straw(2), anim: 'work', tool: 'axe', facing: -1, speed: 5, phase: .3 });
        z.crew(50, 36, { ...straw(4), hat: 'scarf', hatColor: C.plum3, anim: 'work', phase: .7, speed: 3 });
        const cp = (t * .09) % 1, back = cp > .5, q = back ? (1 - cp) * 2 : cp * 2;
        z.crew(6 + q * 8, 40 + q * 56, { ...straw(3), anim: 'walk', carry: back ? '' : 'food', facing: back ? -1 : 1, phase: .2 });
        z.crew(-112, 104, { ...straw(5), anim: 'work', phase: .9, speed: 3 });
        if (z.detail) for (let i = 0; i < 5; i++) { const q2 = (t * 1.8 + i / 5) % 1; k.px(-106 + q2 * 10 + i, 90 + q2 * q2 * 12, C.gold3); }
      } else if (state === 'idle') {
        // Rest: crew sit on the hay bales and by the well; animals graze and butterflies drift.
        z.crew(124, 108, { ...straw(0), anim: 'sit', phase: .1 }); z.crew(138, 100, { ...straw(1), anim: 'sit', facing: -1, phase: .5 });
        z.crew(-22, 96, { ...straw(2), anim: 'sit', facing: -1, phase: .3 }); z.crew(50, 36, { ...straw(4), hat: 'scarf', hatColor: C.plum3, anim: 'idle', phase: .7 });
        z.crew(100, 94, { ...straw(3), anim: 'sit', phase: .2 }); z.crew(-112, 104, { ...straw(5), anim: 'idle', phase: .9 });
        if (z.detail) { Props.butterfly(k, -40 + Math.sin(t * .7) * 30, -20 + Math.cos(t * 1.3) * 8, t); Props.butterfly(k, 60 + Math.sin(t * .5 + 1) * 24, -40 + Math.sin(t * 1.1) * 6, t + 1, '#f6ecd0'); for (let i = 0; i < 2; i++) Props.bird(k, ((t * 14 + i * 150) % 360) - 180, -132 + i * 7, t + i); }
      } else if (live) {
        z.crew(-138, -8, { ...straw(0), anim: 'idle', tool: 'hoe', phase: .1 }); z.crew(-54, -8, { ...straw(1), anim: 'idle', phase: .5 });
        z.crew(-60, 34, { ...straw(2), anim: err ? 'cheer' : 'idle', phase: .3 }); z.crew(50, 36, { ...straw(4), hat: 'scarf', hatColor: C.plum3, anim: 'idle', phase: .7 });
        z.crew(10, 98, { ...straw(3), anim: 'idle', facing: 1, phase: .2 }); z.crew(-50, 60, { ...straw(5), anim: err ? 'cheer' : 'idle', facing: -1, phase: .9 });
      } else {
        z.crew(124, 108, { ...straw(0), phase: .1 }); z.crew(138, 100, { ...straw(1), facing: -1, phase: .5 }); z.crew(100, 94, { ...straw(3), phase: .2 });
        z.crew(-22, 96, { ...straw(2), facing: -1, phase: .3 }); z.crew(-166, -36, { ...straw(4), hat: 'scarf', hatColor: C.plum3, phase: .7 }); z.crew(-118, -36, { ...straw(5), phase: .9 });
      }
    }
  };
})();
