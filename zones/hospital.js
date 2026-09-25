/* Healing Gardens · Health and diagnostics: a white infirmary with a leaf-cross emblem, a vine pergola ward with beds,
   a lily pond with a lotus fountain, glasshouse, medicinal herb garden with beehives, and a vitals board. No lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.hospital = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const POND = { x: 0, y: 66, rx: 38, ry: 16 };
  const VIT = { x: 116, y: -24, w: 58, h: 22 };              // vitals board screen
  const BEDS = [-172, -150, -128];                            // pergola bed left edges
  const BED_Y = -46;                                          // bed headboard top
  const PERG = { x0: -176, x1: -108, back: -76, front: -6, ground: 26 };
  const HERBS = [['#9d78c0', '#c3a2e0'], ['#f6ecd0', '#f2c14e'], [C.leaf3, C.leaf5], ['#f09a2a', '#f5c866'], ['#e98aa0', '#ffd0dc'], [C.leaf2, C.leaf4]];

  // Neutral healing emblem: a white rounded plus on a green roundel with a small leaf.
  function emblem(k, cx, cy, r = 7) {
    k.circle(cx, cy, r + 1, C.ink); k.circle(cx, cy, r, C.leaf2); k.circle(cx - 1, cy - 1, r - 2, C.leaf3);
    const a = Math.max(1, Math.round(r * .3)), l = Math.round(r * .75);
    k.rect(cx - a, cy - l, a * 2 + 1, l * 2 + 1, C.white); k.rect(cx - l, cy - a, l * 2 + 1, a * 2 + 1, C.white);
    k.px(cx + l - 1, cy - l + 1, C.leaf5); k.px(cx + l, cy - l, C.leaf5); k.px(cx + l - 1, cy - l, C.leaf4);
  }
  function picket(k, x0, x1, y) {
    k.rect(x0 + 2, y + 1, x1 - x0, 2, C.shadow);
    k.rect(x0, y - 7, x1 - x0, 2, C.plaster2); k.rect(x0, y - 3, x1 - x0, 2, C.plaster2);
    for (let x = x0; x < x1; x += 4) { k.rect(x, y - 10, 3, 10, C.white); k.px(x + 1, y - 11, C.white); k.rect(x + 2, y - 9, 1, 9, C.plaster1); }
  }
  function bed(k, x, y) {   // x,y = top-left of the headboard; bed runs downward
    k.rect(x + 2, y + 2, 16, 26, C.shadowSoft);
    k.rect(x, y, 16, 5, C.wood2); k.rect(x, y, 16, 1, C.wood4); k.rect(x, y + 4, 16, 1, C.wood0);
    k.rect(x + 1, y + 5, 14, 20, C.white); k.rect(x + 14, y + 5, 1, 20, C.stone3);
    k.rect(x + 3, y + 6, 10, 4, C.paper); k.rect(x + 3, y + 9, 10, 1, C.paper2);
    k.rect(x, y + 25, 16, 3, C.wood2); k.rect(x, y + 25, 16, 1, C.wood3); k.rect(x, y + 28, 2, 2, C.wood0); k.rect(x + 14, y + 28, 2, 2, C.wood0);
  }
  const herbBed = (k, x, y, w, cols, seed) => {
    k.rect(x + 2, y + 2, w, 12, C.shadowSoft); k.rect(x, y, w, 12, C.wood1); k.rect(x, y, w, 1, C.wood3); k.rect(x + 1, y + 1, w - 2, 9, C.dirt1); k.dither(x + 1, y + 1, w - 2, 9, C.dirt0, 1);
    for (let i = 0; i < w - 5; i += 5) { const px = x + 3 + i, py = y + 3 + (i % 2); k.rect(px, py, 3, 3, C.leaf1); k.px(px + 1, py - 1, C.leaf3); k.px(px, py, cols[0]); k.px(px + 2, py + 1, cols[1]); if (P.hash(i, seed) > .5) k.px(px + 1, py - 2, cols[0]); }
    k.rect(x + 2, y + 10, 5, 3, C.paper); k.px(x + 3, y + 11, C.ink); k.px(x + 5, y + 11, C.ink);
  };
  const hive = (k, x, y) => { k.ellipse(x + 5, y + 1, 7, 2, C.shadow); k.rect(x, y - 6, 11, 6, C.wood2); k.rect(x - 1, y - 12, 13, 6, C.gold2); k.rect(x - 1, y - 12, 13, 1, C.gold3); k.rect(x - 1, y - 7, 13, 1, C.gold0); k.rect(x, y - 16, 11, 4, C.gold1); k.rect(x + 1, y - 17, 9, 1, C.gold3); k.rect(x + 4, y - 3, 3, 1, C.ink); k.rect(x + 2, y, 2, 1, C.wood0); k.rect(x + 7, y, 2, 1, C.wood0); };
  const jar = (k, x, y, col) => { k.rect(x, y - 5, 4, 5, col); k.rect(x, y - 5, 1, 5, S(col, .35)); k.rect(x, y - 6, 4, 1, C.wood1); k.rect(x + 1, y - 3, 2, 1, C.paper); };
  const whiteCoat = (k, x, y) => { k.rect(x - 3, y - 12, 7, 7, C.white); k.rect(x + 3, y - 12, 1, 7, C.stone3); k.px(x, y - 10, C.leaf3); k.rect(x - 3, y - 5, 7, 1, C.stone3); };

  return {
    paint(k) {
      /* Soft lawn with clover. */
      k.rectTex(-190, -80, 380, 214, (x, y) => { const h = P.hash(x, y); return h < .1 ? C.grass2 : h > .9 ? C.grass5 : h > .75 ? C.grass4 : C.grass3; });
      for (let i = 0; i < 60; i++) Props.tuft(k, -186 + P.hash(i, 61) * 372, -76 + P.hash(i, 62) * 205, C.grass2, C.grass5);

      /* Shade trees behind. */
      for (const [x, y, kind, sz, v] of [[-176, -110, 'blossom', 1, 0], [-122, -112, 'birch', 1, 1], [128, -112, 'birch', 1, 2], [178, -112, 'blossom', 1, 3], [-60, -125, 'oak', 0, 1], [70, -125, 'oak', 0, 2]]) Props.tree(k, x, y, kind, sz, v);

      /* Infirmary: two white wings with window boxes and a tall central pavilion. */
      const wins = [6, 22, 42, 58].flatMap(x => [{ x, y: 8, w: 8, h: 9, lit: true, box: '#e98aa0' }, { x, y: 23, w: 8, h: 7, lit: true }]);
      Props.building(k, -102, -46, { w: 74, h: 38, roofH: 20, roof: C.teal2, wall: C.plaster3, mat: 'plaster', windows: wins, shutters: C.leaf2, chimney: { x: 12, h: 10 } });
      Props.building(k, 28, -46, { w: 74, h: 38, roofH: 20, roof: C.teal2, wall: C.plaster3, mat: 'plaster', windows: wins, shutters: C.leaf2, chimney: { x: 56, h: 10 } });
      Props.building(k, -32, -50, { w: 64, h: 52, style: 'peak', roofH: 28, depth: 14, roof: C.teal2, wall: C.plaster3, mat: 'plaster', vent: false,
        windows: [{ x: 8, y: 10, w: 9, h: 12, lit: true, arch: true }, { x: 47, y: 10, w: 9, h: 12, lit: true, arch: true }, { x: 8, y: 30, w: 9, h: 9, lit: true, box: '#f2c14e' }, { x: 47, y: 30, w: 9, h: 9, lit: true, box: '#f2c14e' }],
        door: { x: 23, w: 18, h: 20, color: C.teal1, arch: true } });
      k.rect(0, -69, 1, 19, C.teal0);
      emblem(k, 0, -113, 7);
      k.rect(-3, -140, 7, 6, C.plaster3); k.rect(-3, -140, 1, 6, C.white); k.rect(-1, -138, 3, 3, C.gold2); k.poly([[-5, -140], [0, -146], [6, -140]], C.teal1); k.rect(0, -149, 1, 3, C.gold2);
      // Porch: striped canopy on white posts, steps and planters.
      Props.awning(k, -28, -80, 56, C.leaf2, C.white, 6);
      for (const x of [-27, 25]) { k.rect(x, -73, 2, 23, C.white); k.rect(x + 1, -73, 1, 23, C.plaster1); }
      for (let i = 0; i < 2; i++) k.rect(-18 - i * 3, -50 + i * 3, 36 + i * 6, 3, i ? C.stone3 : C.stone4);
      for (const x of [-40, 33, -96, 90]) Props.pot(k, x, -44);
      k.rect(-20, -64, 1, 1, C.white);

      /* Glasshouse for tender herbs (east). */
      const gx = 102, gw = 76, gb = -40, gt = -66;
      k.rect(gx + 3, gb, gw + 4, 3, C.shadow); k.poly([[gx + gw, gb], [gx + gw + 7, gb - 4], [gx + gw + 7, gt - 8], [gx + gw, gt - 10]], C.shadowSoft);
      k.rect(gx, gb - 5, gw, 5, C.stone2); k.rect(gx, gb - 5, gw, 1, C.stone4);
      k.rect(gx, gt, gw, gb - gt - 5, C.glass); k.dither(gx, gt, gw, gb - gt - 5, '#a8d8dc', 0);
      for (let i = 0; i < 9; i++) { const px = gx + 4 + i * 8; k.circle(px, gb - 10, 3, i % 2 ? C.leaf2 : C.leaf3); k.px(px - 1, gb - 12, i % 3 ? C.leaf5 : '#e98aa0'); k.rect(px - 2, gb - 7, 5, 2, C.terra2); }
      k.poly([[gx - 2, gt], [gx + 10, gt - 16], [gx + gw - 10, gt - 16], [gx + gw + 2, gt]], '#b8e0e4'); k.dither(gx + 4, gt - 14, gw - 8, 13, C.glass, 1);
      for (let x = gx; x <= gx + gw; x += 12) { k.rect(x, gt, 1, gb - gt - 5, C.white); k.line(x, gt, gx + 10 + (x - gx) * (gw - 20) / gw, gt - 16, C.white); }
      k.rect(gx - 2, gt - 1, gw + 4, 2, C.white); k.rect(gx + 10, gt - 17, gw - 20, 2, C.white); k.rect(gx, gt + 10, gw, 1, C.white);
      k.px(gx + 14, gt - 10, C.white); k.px(gx + 15, gt - 11, C.white); k.px(gx + 38, gt - 6, C.white);
      Props.door(k, gx + 34, gb, 9, 14, C.white, { frame: C.stone3 }); k.rect(gx + 35, gb - 13, 7, 9, C.glass);

      /* Vitals board on posts beside the glasshouse. */
      const v = VIT;
      for (const x of [v.x + 4, v.x + v.w - 6]) { k.rect(x, v.y + v.h, 3, 12, C.wood1); k.rect(x, v.y + v.h, 1, 12, C.wood3); }
      k.rect(v.x - 4, v.y - 8, v.w + 8, v.h + 12, C.wood1); k.rect(v.x - 3, v.y - 7, v.w + 6, v.h + 10, C.wood3); k.rect(v.x - 3, v.y - 7, v.w + 6, 1, C.wood4);
      k.rect(v.x, v.y, v.w, v.h, '#16261e'); for (let x = v.x + 4; x < v.x + v.w; x += 6) for (let y = v.y + 2; y < v.y + v.h; y += 4) k.px(x, y, '#23382c');
      k.rect(v.x - 1, v.y - 6, 30, 5, C.wood2); k.text('VITALS', v.x, v.y - 6, C.paper);
      k.rect(v.x - 4, v.y + v.h + 4, v.w + 8, 2, C.wood0);

      /* Pergola ward: back posts and beam, beds with blankets, side tables with remedies. */
      const pg = PERG;
      k.rect(pg.x0, -52, pg.x1 - pg.x0, 80, C.stone3); k.polyTex([[pg.x0, -52], [pg.x1, -52], [pg.x1, 28], [pg.x0, 28]], (x, y) => ((x + 200) % 10 === 0 || (y + 200) % 8 === 0) ? C.stone2 : P.hash(x >> 2, y >> 2) < .15 ? C.stone4 : null);
      for (const x of [pg.x0 + 1, pg.x1 - 4]) { k.rect(x, pg.back, 3, -52 - pg.back, C.wood2); k.rect(x, pg.back, 1, -52 - pg.back, C.wood4); }
      k.rect(pg.x0 - 2, pg.back - 3, pg.x1 - pg.x0 + 4, 3, C.wood2); k.rect(pg.x0 - 2, pg.back - 3, pg.x1 - pg.x0 + 4, 1, C.wood4);
      for (let x = pg.x0; x < pg.x1; x += 6) { k.rect(x, pg.back, 3, 4 + (x % 4), C.leaf2); k.px(x + 1, pg.back + 3, C.leaf4); if (x % 12 === 0) k.px(x, pg.back + 5 + (x % 4), '#c3a2e0'); }
      BEDS.forEach((x, i) => { bed(k, x, BED_Y); const col = [C.teal3, '#8aa7d8', C.plum3][i]; k.rect(x + 1, BED_Y + 13, 14, 12, col); k.rect(x + 1, BED_Y + 13, 14, 1, S(col, .3)); for (let yy = BED_Y + 16; yy < BED_Y + 25; yy += 4) k.rect(x + 1, yy, 14, 1, S(col, -.15)); });
      for (const x of [-154, -132]) { k.rect(x - 1, BED_Y + 4, 5, 8, C.wood2); k.rect(x - 1, BED_Y + 4, 5, 1, C.wood4); jar(k, x, BED_Y + 4, C.teal3); }
      k.rect(-112, BED_Y + 2, 2, 20, C.stone1); k.rect(-114, BED_Y + 1, 6, 1, C.stone1); k.rect(-115, BED_Y + 2, 3, 5, '#bfe6ff'); k.px(-114, BED_Y + 7, C.stone1);   // drip stand
      Props.table(k, -180, 22, 20, 8, C.wood3); jar(k, -178, 14, C.red2); jar(k, -172, 14, C.gold2); jar(k, -166, 14, C.leaf3); k.rect(-167, 12, 4, 1, C.white);
      Props.bench(k, -140, 20, 22);

      /* Courtyard path and lily pond with a lotus fountain. */
      k.rectTex(-16, -44, 32, 184, (x, y) => { const row = Math.floor((y + 44) / 5), off = row % 2 * 4; if ((y + 44) % 5 === 4 || (x + 64 + off) % 8 === 7) return C.stone3; return P.hash((x + off) >> 3, row) < .2 ? C.stone5 : C.stone4; });
      k.rect(-60, -40, 120, 40, C.stone4); k.rectTex(-60, -40, 120, 40, (x, y) => ((x + y) % 12 === 0 || (x - y + 600) % 12 === 0) ? C.stone3 : null); k.rect(-60, 0, 120, 1, C.stone2);
      // Medicine trolley and planters on the front terrace.
      Props.cart(k, -56, -8, (q, x, y) => { q.rect(x + 2, y - 8, 18, 8, C.white); q.rect(x + 2, y - 8, 18, 1, C.stone4); emblem(q, x + 11, y - 4, 3); });
      for (const x of [-60, 52]) { k.rect(x, -36, 10, 6, C.stone2); k.rect(x, -36, 10, 1, C.stone4); Props.bush(k, x + 5, -36, 2); }
      Props.flowerBed(k, 28, -26, 28, 8, ['#f6ecd0', '#c3a2c0', '#8aa7d8'], 44);
      const pd = POND;
      k.ellipse(pd.x, pd.y, pd.rx + 12, pd.ry + 7, C.stone3); k.ellipse(pd.x, pd.y, pd.rx + 10, pd.ry + 6, C.stone4);
      for (let a = 0; a < 20; a++) { const an = a / 20 * Math.PI * 2; k.px(pd.x + Math.cos(an) * (pd.rx + 10), pd.y + Math.sin(an) * (pd.ry + 6), C.stone2); }
      k.ellipse(pd.x + 2, pd.y + 3, pd.rx + 4, pd.ry + 3, C.stone2); k.ellipse(pd.x, pd.y + 1, pd.rx + 3, pd.ry + 2, C.stone1);
      k.ellipse(pd.x, pd.y, pd.rx, pd.ry, C.water1); k.ellipse(pd.x - 1, pd.y + 1, pd.rx - 3, pd.ry - 3, C.water2); k.ellipse(pd.x - 12, pd.y - 5, 10, 3, C.water3);
      for (const [x, y, fl] of [[-26, 64, 1], [-18, 74, 0], [22, 58, 1], [28, 70, 0], [8, 76, 1], [-30, 58, 0]]) { k.ellipse(x, y, 3, 1, C.leaf2); k.px(x + 1, y, C.leaf4); k.px(x - 2, y + 1, C.leaf1); if (fl) { k.px(x, y - 1, '#ffd0dc'); k.px(x - 1, y - 1, C.white); } }
      for (const s of [-1, 1]) { k.rect(pd.x + s * (pd.rx + 2), pd.y - 8, 1, 8, C.leaf2); k.rect(pd.x + s * (pd.rx + 4), pd.y - 11, 1, 10, C.leaf3); k.rect(pd.x + s * (pd.rx + 4), pd.y - 12, 1, 3, C.wood2); }
      // Lotus fountain: petals of pale stone.
      k.ellipse(0, 66, 7, 3, C.stone2); k.rect(-2, 56, 5, 10, C.stone4); k.rect(-2, 56, 1, 10, C.stone5); k.rect(2, 56, 1, 10, C.stone2);
      for (const [dx, h] of [[-7, 4], [-4, 6], [0, 8], [4, 6], [7, 4]]) { k.poly([[dx - 3, 56], [dx, 56 - h], [dx + 3, 56]], dx < 0 ? '#f2d6de' : dx > 0 ? '#d8b0bc' : C.white); }
      k.ellipse(0, 56, 9, 2, '#e8c0cc');
      // Benches, lanterns and a stone bridge-stepping row.
      Props.bench(k, -58, 42, 16); Props.bench(k, 42, 42, 16); Props.bench(k, -58, 98, 16); Props.bench(k, 42, 98, 16);
      for (const [x, y] of [[-48, 24], [46, 24], [-50, 112], [48, 112]]) Props.lamp(k, x, y, true);
      for (let i = 0; i < 5; i++) { const x = -54 + i * 5, y = 70 + (i % 2); k.ellipse(x, y, 2, 1, C.stone3); }

      /* Resting lawn (south-west): wheelchair, loungers, well and flowers. */
      Props.tree(k, -138, 112, 'birch', 2, 1); Props.tree(k, -90, 128, 'blossom', 1, 2);
      for (const x of [-172, -128]) { k.rect(x + 2, 67, 22, 2, C.shadow); k.rect(x, 60, 22, 5, C.wood3); k.rect(x, 60, 22, 1, C.wood4); for (let i = 2; i < 22; i += 4) k.px(x + i, 62, C.wood1); k.line(x + 16, 60, x + 22, 54, C.wood3, 2); k.rect(x + 1, 65, 1, 3, C.wood1); k.rect(x + 20, 65, 1, 3, C.wood1); k.rect(x + 2, 60, 14, 2, x < -150 ? C.teal4 : '#f2c9a0'); }
      Props.well(k, -86, 58);
      Props.flowerBed(k, -162, 80, 36, 10, ['#f2c14e', '#f6ecd0', '#c3a2c0'], 13); Props.flowerBed(k, -120, 88, 22, 10, ['#e98aa0', '#f6ecd0'], 14);
      Props.bush(k, -64, 118, 2); Props.bush(k, -182, 128, 1);

      /* Medicinal herb garden (south-east): raised beds, beehives, apothecary cart. */
      k.rect(60, 16, 128, 4, C.dirt4); k.dither(60, 16, 128, 4, C.dirt3, 1);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) herbBed(k, 66 + c * 60, 26 + r * 20, c ? [52, 50, 42, 34][r] : 52, HERBS[(r * 2 + c) % HERBS.length], r * 2 + c);
      k.rect(118, 24, 8, 84, C.dirt4); k.dither(118, 24, 8, 84, C.dirt3, 1);
      hive(k, 140, 122); hive(k, 126, 118);
      Props.cart(k, 70, 124, (q, x, y) => { for (let i = 0; i < 5; i++) jar(q, x + 2 + i * 4, y + 1, [C.teal3, C.red2, C.gold2, C.leaf3, C.plum3][i]); });
      k.rect(96, 108, 2, 16, C.wood1); k.rect(92, 106, 26, 9, C.wood0); k.rect(93, 107, 24, 7, C.leaf2); k.text('HERBS', 95, 108, C.white);
      Props.barrel(k, 104, 118); k.rect(105, 117, 8, 1, C.water3);

      /* Picket fence and the garden gate at the bottom centre. */
      picket(k, -146, -22, 138); picket(k, 22, 146, 138);   // the fence ends at the hexagon's bottom corners
      for (const x of [-24, 20]) { k.rect(x, 118, 4, 22, C.white); k.rect(x + 3, 118, 1, 22, C.plaster1); k.rect(x - 1, 116, 6, 3, C.plaster2); }
      k.poly([[-24, 118], [-12, 108], [0, 105], [12, 108], [24, 118], [20, 118], [12, 111], [0, 108], [-12, 111], [-20, 118]], C.leaf2);
      for (const [x, y] of [[-18, 112], [-8, 107], [4, 106], [14, 109], [-2, 106]]) { k.px(x, y, '#ffd0dc'); k.px(x + 1, y, C.white); }
      emblem(k, 0, 100, 4);
    },
    front(k) {
      // Pergola rafters, front beam and hanging vines drawn over the healers.
      const pg = PERG;
      for (const x of [pg.x0 + 1, pg.x1 - 4]) { k.rect(x, pg.front, 3, pg.ground - pg.front, C.wood2); k.rect(x, pg.front, 1, pg.ground - pg.front, C.wood4); k.rect(x - 1, pg.ground - 1, 5, 2, C.stone2); }
      for (let x = pg.x0 + 12; x < pg.x1 - 4; x += 20) { k.line(x, pg.back, x, pg.front, C.wood2); k.line(x + 1, pg.back, x + 1, pg.front, C.wood1); for (let y = pg.back + 6; y < pg.front; y += 9) { k.rect(x - 1, y, 4, 2, C.leaf2); k.px(x - 2, y + 1, C.leaf3); k.px(x + 3, y, C.leaf4); } }
      k.rect(pg.x0 - 2, pg.front - 3, pg.x1 - pg.x0 + 4, 3, C.wood2); k.rect(pg.x0 - 2, pg.front - 3, pg.x1 - pg.x0 + 4, 1, C.wood4); k.rect(pg.x0 - 2, pg.front, pg.x1 - pg.x0 + 4, 1, C.wood0);
      for (let x = pg.x0; x < pg.x1; x += 5) { const h = 3 + (x * 7 % 5); k.rect(x, pg.front, 2, h, C.leaf2); k.px(x, pg.front + h, C.leaf3); if (x % 15 === 0) { k.px(x + 1, pg.front + h - 1, '#c3a2e0'); k.px(x + 1, pg.front + h, '#9d78c0'); } }
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error', calm = state === 'idle';
      /* Vitals board: scrolling heartbeat trace, pulsing heart and a rate readout. */
      const v = VIT, base = v.y + 12, beat = [0, 0, -1, 0, 0, 2, -8, 6, -2, 0, 0, -1, -2, -1, 0];
      if (live) {
        const col = err ? (Math.floor(t * 4) % 2 ? C.error : C.red1) : wait ? C.waiting : C.working;
        const rate = run ? 26 : calm ? 14 : wait ? 10 : 34, shift = Math.floor(t * rate);
        let py = base;
        for (let i = 0; i < 40; i++) {
          const n = (i + shift) % 22; let y = base + (n < beat.length ? beat[n] : 0);
          if (err) y = base + ((i + shift) % 9 < 2 ? ((i + shift) % 2 ? -6 : 4) : 0);
          if (wait) y = base + ((i + shift) % 30 === 0 ? -3 : 0);
          k.rect(v.x + 2 + i, Math.min(py, y), 1, Math.abs(y - py) + 1, i > 35 ? C.white : col); py = y;
        }
        const big = Math.floor(t * (run ? 1.6 : 1)) % 2 === 0;
        const hx = v.x + 47, hy = v.y + 5;
        k.rect(hx - 2, hy, 2, 2, C.red3); k.rect(hx + 1, hy, 2, 2, C.red3); k.rect(hx - 2, hy + 1, 5, 2, C.red3); k.rect(hx - 1, hy + 3, 3, 1, C.red3); k.px(hx, hy + 4, C.red3);
        if (big) { k.px(hx - 3, hy + 1, C.red2); k.px(hx + 3, hy + 1, C.red2); }
        k.text(err ? '!!' : wait ? '--' : run ? '72' : '64', v.x + 44, v.y + 13, col);
        [C.working, run || calm ? C.working : C.slate2, err ? C.error : wait ? C.waiting : C.working].forEach((c, i) => k.rect(v.x + 44 + i * 4, v.y + 19, 3, 2, c));
      } else k.rect(v.x + 2, base, 40, 1, '#23382c');

      /* Pond: koi circle, ripples; the lotus spouts a gentle jet. */
      const pd = POND;
      for (let i = 0; i < 3; i++) {
        const a = t * (live ? .35 : 0) + i * 2.1, x = pd.x + Math.cos(a) * (18 + i * 5), y = pd.y + 2 + Math.sin(a) * (7 + i), dir = -Math.sin(a) > 0 ? 1 : -1;
        k.rect(x - 2, y, 5, 2, i === 1 ? C.white : '#f09a2a'); k.px(x + (dir > 0 ? 3 : -3), y, i === 1 ? '#f09a2a' : C.gold3); k.px(x - dir * 3, y + 1, '#f09a2a'); if (i === 1) k.px(x, y, C.red2);
      }
      for (let i = 0; i < 5; i++) { const p = (t * .3 + i / 5) % 1; k.rect(pd.x - 28 + p * 56, pd.y - 5 + (i % 3) * 5, 3, 1, i % 2 ? C.water4 : C.water5); }
      if (live && !err) { const jh = run ? 8 : 5; k.rect(0, 48 - jh, 1, jh, C.water5); for (const s of [-1, 1]) for (let j = 0; j < 4; j++) { const p = (t * 1.5 + j / 4) % 1; k.px(s * (1 + p * 9), 48 - jh + p * p * (jh + 14), C.water4); } const rp = (t * .8) % 1; k.alpha(1 - rp, () => k.ring(0, 66, 9 + rp * 10, 3 + rp * 4, C.foam)); }

      /* Patients in the beds breathe slowly under their blankets. */
      BEDS.forEach((x, i) => {
        const br = live && Math.floor(t * .8 + i) % 2 ? 1 : 0, skin = [C.skin2, C.skin1, C.skin3][i], hair = ['#4a3226', '#c4652e', '#1e1a18'][i];
        k.circle(x + 8, BED_Y + 9, 3, skin); k.rect(x + 5, BED_Y + 6, 7, 2, hair); k.px(x + 7, BED_Y + 10, C.ink); k.px(x + 9, BED_Y + 10, C.ink);
        const col = [C.teal3, '#8aa7d8', C.plum3][i]; k.rect(x + 1, BED_Y + 13 - br, 14, 2, col); k.rect(x + 1, BED_Y + 13 - br, 14, 1, S(col, .3)); k.rect(x + 1, BED_Y + 15 - br, 14, 1, C.white);
        if (!live || calm || i === 1) { const q = (t * .4 + i * .3) % 1; k.alpha(1 - q, () => k.text('z', x + 12 + q * 4, BED_Y + 2 - q * 8, '#c8d4ff')); }
      });
      /* Drip bubbles. */
      if (live) k.px(-114, BED_Y + 3 + Math.floor(t * 3) % 4, C.white);

      /* Chimney smoke (warm kettles inside) and the glasshouse's misting. */
      if (live) { Props.smoke(k, -87, -110, t * (run ? .8 : .4), run ? 3 : 2); Props.smoke(k, 87, -110, t * (run ? .8 : .4) + .5, run ? 3 : 2); }
      // Door lamp over the porch shows the state.
      k.rect(-2, -86, 5, 4, C.ink); k.rect(-1, -85, 3, 2, live ? C[state] : C.slate1);

      if (!live) {
        for (const wx of [-102, 28]) for (const x of [6, 22, 42, 58]) { k.rect(wx + x, -76, 8, 7, C.glassDark); k.rect(wx + x, -61, 8, 5, C.glassDark); }
        for (const x of [-24, 15]) { k.rect(x, -92, 9, 10, C.glassDark); k.rect(x, -72, 9, 7, C.glassDark); }
        z.crew(-138, 16, { look: 5, hat: 'scarf', hatColor: C.white, anim: 'sit' }); whiteCoat(k, -138, 19);
        return;
      }
      /* Healers: one tends each bed in turn; one fetches remedies from the glasshouse. */
      if (run) {
        const p = (t * .05) % 1, stop = Math.floor(p * 3), q = p * 3 - stop, walk = q > .7, x = BEDS[stop] + 8 + (walk ? (q - .7) / .3 * (stop < 2 ? 24 : -48) : 0);
        z.crew(x, 10, { look: 2, hat: 'scarf', hatColor: C.white, anim: walk ? 'walk' : 'work', tool: walk ? '' : 'watering', facing: walk && stop === 2 ? -1 : 1, phase: .2, speed: 2 }); whiteCoat(k, x, 10);
        const r = (t * .06) % 1, back = r > .5, rq = back ? (1 - r) * 2 : r * 2, rx = 140 - rq * 110, ry = -32 + rq * 10;
        z.crew(rx, ry, { look: 4, hat: 'scarf', hatColor: C.white, anim: 'walk', carry: back ? 'water' : '', facing: back ? 1 : -1, phase: .6 }); whiteCoat(k, rx, ry);
        if (!back) { jar(k, rx - 2, ry - 21, C.teal3); }
        // A healer helps a recovering patient walk round the pond.
        const a = .2 * Math.PI + ((Math.sin(t * .15) + 1) / 2) * .6 * Math.PI, dir = Math.cos(t * .15) > 0 ? -1 : 1, wx = Math.cos(a) * 54, wy = 66 + Math.sin(a) * 24;
        z.crew(wx, wy, { look: 1, anim: 'walk', facing: dir, phase: .1 }); k.rect(wx + 5 * dir, wy - 10, 1, 10, C.wood3);
        z.crew(wx - 9 * dir, wy + 1, { look: 3, hat: 'scarf', hatColor: C.white, anim: 'walk', facing: dir, phase: .35 }); whiteCoat(k, wx - 9 * dir, wy + 1);
      } else {
        z.crew(-146, 10, { look: 2, hat: 'scarf', hatColor: C.white, anim: 'idle', facing: 1 }); whiteCoat(k, -146, 10);
        z.crew(-40, 42, { look: 4, hat: 'scarf', hatColor: C.white, anim: 'sit' }); whiteCoat(k, -40, 45);
      }
      /* Gardener waters the herbs; bees drift around the hives. */
      z.crew(122, 64, { look: 3, hat: 'straw', anim: run ? 'work' : 'idle', tool: 'watering', facing: -1, phase: .5, speed: 3 });
      if (run) for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(113 - i, 58 + q * 7, C.water4); }
      if (z.detail) for (let i = 0; i < 4; i++) { const a = t * (1.5 + i * .3) + i * 1.6; k.px(136 + Math.cos(a) * (8 + i * 3), 108 + Math.sin(a * 1.3) * 5, i % 2 ? C.gold3 : C.ink); }
      /* Resting patients on the loungers. */
      z.crew(-162, 60, { look: 0, anim: 'sit', state: 'idle' }); z.crew(-118, 60, { look: 5, anim: 'sit', state: err ? 'error' : 'idle' });

      if (wait) {
        // Patients wait on the steps to be seen.
        for (let i = 0; i < 4; i++) z.crew(-20 + i * 12, -12 + (i % 2) * 3, { look: i, anim: 'idle', carry: i % 2 ? 'paper' : '', facing: -1, phase: i * .3 });
        k.rect(24, -30, 22, 8, C.ink); k.rect(25, -29, 20, 6, C.waiting); k.text('WAIT', 27, -28, C.ink);
      } else if (run) z.crew(30, -14, { look: 5, hat: 'scarf', hatColor: C.white, anim: 'idle', carry: 'paper', facing: -1, phase: .8 });
      if (err) {
        // Alarm: a blinking lamp at the door, a healer rushing, spilled remedies by the cart.
        if (Math.floor(t * 4) % 2) { k.rect(-5, -96, 11, 8, C.ink); k.rect(-4, -95, 9, 6, C.error); k.px(0, -94, C.white); }
        for (let i = 0; i < 4; i++) { const x = 60 + i * 7, y = 118 + (i % 2) * 3; k.rect(x, y, 4, 2, [C.teal3, C.red2, C.gold2, C.leaf3][i]); }
        Props.smoke(k, 146, -70, t, 3, '#9a9488');
      }
      if (z.detail) for (let i = 0; i < 3; i++) { const p = (t * .07 + i / 3) % 1; Props.butterfly(k, -180 + p * 160 + i * 40, 90 + Math.sin(t * 2 + i) * 8 - i * 14, t + i, ['#f2c14e', '#c3a2c0', C.white][i]); }
    }
  };
})();
