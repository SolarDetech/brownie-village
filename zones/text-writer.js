/* Text Writer · Scriptorium gardens: library lodge, reading loggia, ink house, manuscript drying lines, drafting plaza and fountain garden. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns['text-writer'] = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: -6, y: 70 }, REST = { x: -62, y: 128 };   // drafting desk on the plaza; garden bench when off
  const FT = { x: -118, y: 92 };                               // fountain centre
  const CAUL = { x: 146, y: -40 };                             // ink cauldron outside the ink house
  const LAMP = { x: 42, y: 60 };                               // signal lantern on its post
  const INK = '#2a2440', INKL = '#4a4060', VIOLET = '#5c5a8a';
  const BOOKS = [C.plum2, C.teal2, C.red1, C.gold1, C.slate2, VIOLET, C.wood2, C.leaf2, C.terra2, C.plum1];
  const WIN = [[-172, -66], [-154, -66], [-98, -66], [-80, -66]];          // lodge windows (8 x 12)
  const LINE_A = [108, 118, 128, 152, 162, 172], LINE_B = [114, 124, 136, 156, 166, 176];
  const flagTex = base => (x, y) => {
    const r = Math.floor((y + 300) / 6), o = (r % 2) * 5, cx = (x + 300 + o) % 10, cy = (y + 300) % 6;
    if (cy === 0 || cx === 0) return S(base, -.16);
    if (cy === 1 && cx === 1) return S(base, .22);
    const h = P.hash(Math.floor((x + 300 + o) / 10), r); return h < .22 ? S(base, .09) : h > .86 ? S(base, -.08) : base;
  };
  const gravelTex = (x, y) => { const h = P.hash(x * .7, y * 1.3); return h < .1 ? C.dirt3 : h > .94 ? C.dirt5 : h > .9 ? C.stone3 : C.dirt4; };
  const soot = (k, x, y, t, n, col) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1, r = 2 + q * 6, px = x + Math.sin(q * 4 + i * 2) * 4 + q * 8, py = y - q * 32; k.alpha((1 - q) * .9, () => { k.circle(px, py, r, col); k.circle(px - 1, py - 1, Math.max(1, r - 2), S(col, .15)); }); } };
  const cone = (k, x, y, h) => {
    k.ellipse(x + 3, y + 1, 7, 2, C.shadow); k.rect(x - 1, y - 3, 3, 3, C.wood1);
    for (let i = 0; i < 3; i++) { const b = y - 2 - i * (h / 3.4), w = 7 - i * 2, tp = b - h / 2.2; k.poly([[x - w - 1, b], [x, tp - 1], [x + w + 2, b]], C.leaf0); k.poly([[x - w, b - 1], [x, tp], [x + 1, b - 1]], C.leaf3); k.poly([[x + 1, b - 1], [x, tp], [x + w + 1, b - 1]], C.leaf1); k.px(x - 2, b - 3, C.leaf4); k.px(x - w + 2, b - 2, C.leaf2); }
  };
  const ball = (k, x, y, r, pot) => {
    k.ellipse(x + 3, y + 1, r + 2, 2, C.shadow);
    if (pot) { k.rect(x - 4, y - 6, 9, 6, C.terra2); k.rect(x - 5, y - 7, 11, 2, C.terra3); k.rect(x + 3, y - 5, 1, 5, C.terra1); }
    const cy = y - (pot ? 8 : 4) - r; k.rect(x, cy + r - 1, 2, pot ? 3 : 5, C.wood1);
    k.circle(x, cy, r + 1, C.leaf0); k.circle(x, cy, r, C.leaf1); k.circle(x - 1, cy - 1, r - 1, C.leaf2); k.circle(x - 2, cy - 2, Math.max(1, r - 3), C.leaf3); k.px(x - 3, cy - 3, C.leaf4); k.ditherEllipse(x + 2, cy + 2, r - 2, r - 3, C.leaf0);
  };
  const page = (k, x, y, sway, inked) => {
    k.rect(x - 1, y, 7, 5, C.ink); k.rect(x - 1 + sway, y + 4, 7, 5, C.ink);
    k.rect(x, y + 1, 5, 4, C.paper); k.rect(x + sway, y + 4, 5, 4, C.paper); k.rect(x + 4 + sway, y + 4, 1, 4, C.paper2);
    if (inked) { k.rect(x + 1, y + 2, 3, 1, INKL); k.rect(x + 1 + sway, y + 5, 3, 1, INKL); k.rect(x + 1 + sway, y + 7, 2, 1, INKL); }
    k.rect(x + 1, y - 1, 2, 2, C.wood3);
  };
  const flatPage = (k, x, y, tilt) => { k.rect(x - 1, y - 1, 8, 5, S(C.paper2, -.3)); k.rect(x, y, 6, 3, C.paper); k.px(x + (tilt ? 5 : 0), y, C.paper2); k.rect(x + 1, y + 1, 3, 1, INKL); };
  const flyPage = (k, x, y, f) => { if (f) { k.rect(x - 3, y, 7, 2, C.ink); k.rect(x - 2, y, 5, 1, C.paper); } else { k.rect(x - 2, y - 2, 5, 5, C.ink); k.rect(x - 1, y - 1, 3, 3, C.paper); k.px(x, y, INKL); } };
  const inkPot = (k, x, y) => { k.rect(x, y - 4, 5, 4, INK); k.rect(x + 1, y - 5, 3, 1, INK); k.px(x, y - 4, VIOLET); k.px(x + 1, y - 3, '#6a6890'); };

  return {
    paint(k) {
      // Lawn: mowing stripes and scattered clover give the garden texture.
      k.rectTex(-190, -150, 380, 290, (x, y) => { const s = Math.floor((x + 400 + y * .5) / 10) % 2; const h = P.hash(x, y); return h < .03 ? C.grass4 : h > .985 ? C.grass1 : s ? '#83ae60' : null; });
      // Stone terrace along the building fronts, flagged plaza and gravel walks.
      k.rect(-188, -32, 376, 20, C.stone2);
      k.rectTex(-186, -31, 372, 18, flagTex(C.stone3));
      const plaza = [[-78, -14], [82, -14], [88, 88], [24, 96], [-24, 96], [-84, 88]];
      k.poly([[-81, -14], [85, -14], [91, 90], [25, 99], [-25, 99], [-87, 90]], C.stone2);
      k.polyTex(plaza, flagTex(C.stone4));
      k.ellipse(FT.x, FT.y + 2, 45, 23, C.dirt2); k.ellipse(FT.x, FT.y + 1, 43, 21, C.dirt4);
      k.polyTex([[FT.x - 42, FT.y], [FT.x - 30, FT.y - 16], [FT.x, FT.y - 21], [FT.x + 30, FT.y - 16], [FT.x + 42, FT.y], [FT.x + 30, FT.y + 16], [FT.x, FT.y + 21], [FT.x - 30, FT.y + 16]], gravelTex);
      k.rect(-20, 96, 40, 44, C.dirt2); k.rectTex(-18, 96, 36, 44, gravelTex);
      k.poly([[88, -12], [188, -12], [188, 46], [90, 50]], C.dirt2); k.polyTex([[89, -12], [187, -12], [187, 44], [90, 48]], gravelTex);
      // Plaza inlay: an ink-drop mosaic in the centre.
      k.ellipse(0, 38, 20, 8, C.stone2); k.ellipse(0, 38, 18, 7, C.plaster3); k.ring(0, 38, 14, 5, C.stone2);
      k.poly([[0, 30], [4, 38], [0, 44], [-4, 38]], INK); k.px(-1, 36, VIOLET); k.rect(-17, 38, 34, 1, C.gold1); k.px(0, 38, C.gold3);

      // Trees and a hedge row behind the rooftops.
      Props.tree(k, -150, -106, 'dark', 2, 1); Props.tree(k, -52, -108, 'oak', 1, 2); Props.tree(k, 72, -104, 'blossom', 1, 0); Props.tree(k, 172, -96, 'pine', 2, 1); Props.tree(k, -184, -84, 'oak', 1, 3);
      Props.hedge(k, -36, -122, 96, 8);
      for (let i = 0; i < 14; i++) Props.flower(k, -180 + P.hash(i, 3) * 360, -146 + P.hash(i, 6) * 14, ['#e0cc92', '#c3a2c0', '#f6ecd0'][i % 3]);

      // Library lodge: stone hall, plum roof, arched windows and an open-book crest.
      Props.building(k, -182, -30, { w: 120, h: 48, roofH: 30, roof: C.plum2, wall: C.stone3, mat: 'stone', windows: WIN.map(([x]) => ({ x: x + 182, y: 12, w: 8, h: 12, arch: true, frame: C.wood0 })), door: { x: 50, w: 20, h: 22, color: C.plum1, arch: true }, chimney: { x: 96, h: 12 } });
      k.rect(-123, -52, 1, 22, C.plum0);
      k.rect(-135, -75, 26, 16, C.gold1); k.rect(-134, -74, 24, 14, C.plum1);
      k.poly([[-132, -71], [-122, -69], [-122, -61], [-132, -63]], C.paper); k.poly([[-122, -69], [-112, -71], [-112, -63], [-122, -61]], C.paper2); k.rect(-122, -70, 1, 9, C.wood1);
      for (let i = 0; i < 3; i++) { k.rect(-130, -68 + i * 2, 6, 1, INKL); k.rect(-120, -68 + i * 2, 6, 1, INKL); }
      // Ivy climbing the lodge corners.
      for (let i = 0; i < 26; i++) { const y = -32 - i * 2, x = -182 + Math.round(Math.sin(i * .7) * 2) + (i % 3); k.px(x, y, C.leaf1); k.px(x + 1, y - 1, i % 2 ? C.leaf3 : C.leaf2); if (i % 4 === 0) k.px(x + 2, y, C.leaf4); }
      for (let i = 0; i < 18; i++) { const y = -32 - i * 2, x = -64 - (i % 3) + Math.round(Math.sin(i) * 1); k.px(x, y, C.leaf1); k.px(x - 1, y - 1, C.leaf3); }
      // Door steps, planters and a manuscript cart by the lodge.
      k.rect(-136, -30, 28, 3, C.stone4); k.rect(-136, -28, 28, 1, C.stone1);
      Props.pot(k, -146, -28); Props.pot(k, -104, -28);
      Props.cart(k, -178, 8, (q, x, y) => { for (let i = 0; i < 3; i++) { q.rect(x + 2 + i * 6, y - 6, 5, 6, [C.plum2, C.teal2, C.red1][i]); q.rect(x + 2 + i * 6, y - 6, 5, 1, C.paper); q.rect(x + 4 + i * 6, y - 6, 1, 6, C.gold2); } });
      Props.crate(k, -176, 18); Props.sack(k, -164, 20, C.paper2);

      // Binding press between the lodge and the loggia (screw and wheel animate).
      k.ellipse(-49, -28, 10, 2, C.shadow); k.rect(-57, -52, 3, 24, C.wood1); k.rect(-43, -52, 3, 24, C.wood1); k.rect(-57, -52, 1, 24, C.wood3);
      k.rect(-59, -55, 21, 4, C.wood2); k.rect(-59, -55, 21, 1, C.wood4); k.rect(-58, -33, 19, 5, C.wood2); k.rect(-58, -33, 19, 1, C.wood4);
      k.rect(-55, -37, 13, 4, C.paper); k.rect(-55, -37, 13, 1, C.white); k.rect(-55, -35, 13, 1, C.paper2);

      // Reading loggia: plum canopy over tall bookshelves of varied volumes.
      const L0 = -36, L1 = 62;
      k.rect(L0 + 3, -86, L1 - L0, 56, C.shadowSoft);
      k.rect(L0, -88, L1 - L0, 58, C.wood1); k.rect(L0 + 2, -86, L1 - L0 - 4, 54, '#3e3024');
      for (let r = 0; r < 4; r++) {
        const sy = -75 + r * 13; let x = L0 + 3, i = 0;
        while (x < L1 - 5) {
          const h = P.hash(i + r * 31, r), bw = 2 + Math.floor(h * 2.2), bh = 7 + Math.floor(P.hash(r, i) * 4), col = BOOKS[Math.floor(P.hash(i, r * 7) * BOOKS.length)];
          if (h > .92) { x += 4; i++; continue; }
          if (h > .86 && x < L1 - 12) { k.poly([[x, sy], [x + 6, sy - 7], [x + 8, sy - 6], [x + 2, sy]], col); k.line(x + 1, sy - 1, x + 6, sy - 6, S(col, .25)); x += 9; i++; continue; }
          k.rect(x, sy - bh, bw, bh, col); k.rect(x, sy - bh, 1, bh, S(col, .22)); k.px(x + bw - 1, sy - bh, S(col, -.3));
          if (bh > 8) k.rect(x, sy - bh + 2, bw, 1, C.gold2);
          x += bw + (h < .12 ? 1 : 0); i++;
        }
        k.rect(L0 + 2, sy, L1 - L0 - 4, 2, C.wood3); k.rect(L0 + 2, sy, L1 - L0 - 4, 1, C.wood4); k.rect(L0 + 2, sy + 2, L1 - L0 - 4, 1, '#2a2018');
      }
      k.rect(L0 - 6, -104, L1 - L0 + 12, 16, C.plum1);
      for (let x = L0 - 6; x < L1 + 6; x += 4) { k.rect(x, -104, 2, 16, C.plum2); k.px(x, -104, C.plum3); }
      k.rect(L0 - 6, -104, L1 - L0 + 12, 2, C.plum4); k.rect(L0 - 6, -89, L1 - L0 + 12, 2, C.plum0);
      k.rect(L0 + 30, -102, 38, 11, C.wood1); k.rect(L0 + 31, -101, 36, 9, C.paper); k.text('LIBRI', L0 + 40, -99, C.plum1);
      for (const x of [L0 - 3, L1 + 1]) { k.rect(x, -88, 3, 60, C.wood2); k.rect(x, -88, 1, 60, C.wood4); k.rect(x - 1, -30, 5, 2, C.stone2); }
      // Reading nook on the terrace: rug, armchair, side table with candle, globe and book stacks.
      k.rect(-20, -27, 46, 12, C.gold1); k.rect(-19, -26, 44, 10, C.plum1); k.dither(-17, -24, 40, 6, C.plum2, 1); k.rect(-17, -22, 40, 1, C.gold2);
      k.rect(-18, -34, 12, 14, C.red0); k.rect(-17, -33, 10, 6, C.red1); k.rect(-19, -27, 3, 8, C.red1); k.rect(-8, -27, 3, 8, C.red0); k.rect(-16, -24, 9, 4, C.red2); k.rect(-16, -24, 9, 1, C.red3); k.rect(-18, -20, 1, 2, C.wood0); k.rect(-7, -20, 1, 2, C.wood0);
      Props.table(k, -2, -17, 10, 9, C.wood3); k.rect(1, -30, 2, 4, C.paper); k.px(1, -30, C.paper);
      for (let i = 0; i < 4; i++) k.rect(12 + (i % 2), -19 - i * 2, 8, 2, BOOKS[i + 2]);
      k.rect(33, -18, 2, 4, C.wood1); k.rect(29, -19, 10, 2, C.wood2); k.circle(34, -26, 5, C.teal2); k.rect(31, -28, 4, 3, C.leaf3); k.px(35, -24, C.leaf3); k.px(32, -29, C.teal4); k.ring(34, -26, 6, 6, C.gold1);

      // Ink house: plank workshop with a teal roof, then a stone hearth and pigment bench outside.
      Props.building(k, 78, -32, { w: 46, h: 34, style: 'peak', roofH: 18, depth: 10, roof: C.teal2, wall: C.plaster2, mat: 'planks', windows: [{ x: 5, y: 10, w: 7, h: 7 }, { x: 34, y: 10, w: 7, h: 7 }], door: { x: 18, w: 10, h: 15, color: C.teal1 }, chimney: { x: 30, h: 10 } });
      k.rect(94, -65, 15, 8, C.wood1); k.rect(95, -64, 13, 6, VIOLET); k.text('INK', 96, -63, C.paper);
      k.ellipse(CAUL.x + 1, CAUL.y + 3, 12, 4, C.shadow); k.ellipse(CAUL.x, CAUL.y + 1, 11, 4, C.stone1); k.ellipse(CAUL.x, CAUL.y, 10, 3, C.stone3);
      for (let i = -9; i < 10; i += 4) k.rect(CAUL.x + i, CAUL.y - 1, 2, 2, C.stone2);
      k.ellipse(CAUL.x, CAUL.y - 1, 6, 2, '#1a1410');
      k.ellipse(CAUL.x, CAUL.y - 6, 8, 5, '#1e1c22'); k.ellipse(CAUL.x - 2, CAUL.y - 7, 4, 3, '#3a3844'); k.ellipse(CAUL.x, CAUL.y - 10, 7, 2, '#2a2830'); k.ellipse(CAUL.x, CAUL.y - 10, 6, 1, INK);
      k.rect(CAUL.x - 13, CAUL.y - 18, 2, 20, C.wood1); k.rect(CAUL.x + 11, CAUL.y - 18, 2, 20, C.wood1); k.rect(CAUL.x - 13, CAUL.y - 18, 26, 2, C.wood2); k.line(CAUL.x, CAUL.y - 16, CAUL.x, CAUL.y - 12, C.stone0);
      Props.table(k, 162, -30, 26, 9, C.wood3);
      for (let i = 0; i < 4; i++) { const x = 165 + i * 6; k.ellipse(x, -40, 3, 2, C.plaster1); k.ellipse(x, -41, 2, 1, [C.red2, '#4a6ab0', C.gold2, INK][i]); }
      Props.barrel(k, 176, -50); Props.logPile(k, 124, -30, 3);

      // Manuscript drying lines: two rope lines on posts over the gravel yard.
      for (const [x0, x1, y] of [[102, 182, -12], [108, 186, 18]]) {
        for (const x of [x0, (x0 + x1) >> 1, x1]) { k.ellipse(x + 2, y + 25, 3, 1, C.shadow); k.rect(x - 1, y - 2, 3, 27, C.wood2); k.rect(x - 1, y - 2, 1, 27, C.wood4); k.rect(x - 2, y - 3, 5, 2, C.wood1); }
        k.line(x0, y - 1, (x0 + x1) >> 1, y + 1, C.paper2); k.line((x0 + x1) >> 1, y + 1, x1, y - 1, C.paper2);
      }
      Props.crate(k, 96, 36); k.rect(97, 33, 7, 3, C.paper); Props.sack(k, 176, 36, C.paper2);

      // Drafting plaza: two scribes' tables with stools, ink pots and draft piles.
      for (const [x, y] of [[-54, 30], [46, 30]]) {
        Props.table(k, x, y, 20, 10, C.wood3); k.poly([[x + 2, y - 10], [x + 18, y - 10], [x + 17, y - 14], [x + 3, y - 14]], C.paper); k.rect(x + 4, y - 13, 10, 1, INKL); k.rect(x + 4, y - 11, 7, 1, INKL);
        inkPot(k, x + 14, y - 10); k.line(x + 16, y - 15, x + 19, y - 21, C.white);
        k.rect(x + 22, y - 3, 7, 3, C.paper2); k.rect(x + 22, y - 5, 7, 2, C.paper); k.rect(x + 23, y - 6, 6, 1, C.white);
      }
      // The ink scholar's slanted desk: parchment, ink pots, candle, stacked drafts.
      const dx = LEAD.x + 12, dy = LEAD.y;
      Props.table(k, dx, dy, 28, 12, C.wood2);
      k.poly([[dx + 1, dy - 12], [dx + 27, dy - 12], [dx + 25, dy - 18], [dx + 3, dy - 18]], C.wood3); k.poly([[dx + 5, dy - 13], [dx + 20, dy - 13], [dx + 19, dy - 17], [dx + 6, dy - 17]], C.paper);
      for (let i = 0; i < 2; i++) k.rect(dx + 7, dy - 16 + i * 2, 10 - i * 3, 1, INKL);
      inkPot(k, dx + 21, dy - 12);
      k.rect(dx + 30, dy - 4, 8, 4, C.paper2); k.rect(dx + 30, dy - 6, 8, 2, C.paper); k.rect(dx + 31, dy - 8, 7, 2, C.white); k.rect(dx + 30, dy - 5, 8, 1, C.red2);
      // Signal lantern post.
      k.ellipse(LAMP.x + 2, LAMP.y, 3, 1, C.shadow); k.rect(LAMP.x, LAMP.y - 20, 2, 20, C.wood1); k.rect(LAMP.x, LAMP.y - 20, 1, 20, C.wood3); k.rect(LAMP.x, LAMP.y - 20, 7, 2, C.wood1); k.rect(LAMP.x + 4, LAMP.y - 18, 5, 7, C.slate0); k.rect(LAMP.x + 5, LAMP.y - 17, 3, 4, C.glassDark);

      // Fountain garden: tiered stone fountain, topiaries, hedges, beds and a bench.
      k.ellipse(FT.x + 3, FT.y + 5, 30, 10, C.shadow);
      k.ellipse(FT.x, FT.y + 2, 28, 11, C.stone1); k.ellipse(FT.x, FT.y, 28, 11, C.stone3); k.ellipse(FT.x, FT.y - 1, 26, 9, C.stone4);
      k.ellipse(FT.x, FT.y, 23, 7, C.water1); k.ellipse(FT.x - 1, FT.y - 1, 21, 6, C.water2); k.ellipse(FT.x - 7, FT.y - 2, 9, 2, C.water3);
      k.rect(FT.x - 3, FT.y - 18, 6, 18, C.stone3); k.rect(FT.x - 3, FT.y - 18, 2, 18, C.stone4); k.rect(FT.x + 2, FT.y - 18, 1, 18, C.stone1);
      k.ellipse(FT.x, FT.y - 18, 9, 3, C.stone2); k.ellipse(FT.x, FT.y - 19, 9, 3, C.stone4); k.ellipse(FT.x, FT.y - 19, 7, 2, C.water3);
      k.rect(FT.x - 1, FT.y - 25, 3, 6, C.stone4); k.circle(FT.x, FT.y - 26, 2, C.stone4); k.px(FT.x - 1, FT.y - 27, C.white);
      for (let i = 0; i < 3; i++) { k.ellipse(FT.x + 8 + i * 4, FT.y + 2, 2, 1, C.leaf3); } k.px(FT.x + 12, FT.y + 1, '#ffc6d8');
      cone(k, -176, 78, 24); cone(k, -60, 70, 18); cone(k, -176, 116, 18);
      ball(k, -30, 134, 5, true); ball(k, 30, 134, 5, true); ball(k, -84, 60, 4, false);
      Props.hedge(k, -188, 124, 52, 8); Props.flowerBed(k, -130, 124, 40, 12, ['#c3a2c0', '#f6ecd0', '#e0cc92'], 3);
      Props.bench(k, -148, 66, 18); Props.bench(k, -74, 128, 20); Props.lamp(k, -86, 110, false);
      // Herb garden and rose arbour: ingredients for the inks.
      for (let b = 0; b < 3; b++) {
        const x = 100 + (b % 2) * 6, y = 56 + b * 20;
        k.rect(x - 1, y - 1, 74, 14, C.wood1); k.rect(x, y, 72, 12, C.dirt1); k.dither(x, y, 72, 12, C.dirt0, 1);
        for (let i = 0; i < 12; i++) { const px = x + 3 + i * 6, py = y + 8; k.rect(px, py - 4, 1, 4, C.leaf2); k.px(px - 1, py - 3, C.leaf3); k.px(px + 1, py - 4, C.leaf4); k.px(px, py - 5, [C.plum3, '#4a6ab0', C.gold2][b]); }
      }
      // Rose arbour over a garden seat.
      k.ellipse(168, 139, 20, 2, C.shadow); Props.bench(k, 158, 136, 20);
      for (const x of [148, 186]) { k.rect(x, 124, 2, 15, C.wood1); k.rect(x, 124, 1, 15, C.wood3); }
      for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 - i / 20), x = 167 + Math.cos(a) * 19, y = 126 - Math.sin(a) * 10; k.rect(x - 1, y - 1, 3, 3, C.leaf1); k.px(x - 1, y - 1, C.leaf3); if (i % 3 === 0) { k.px(x + 1, y, '#e98aa0'); k.px(x, y + 1, '#c4485a'); } }
      for (const x of [148, 186]) for (let y = 127; y < 138; y += 3) { k.px(x + (y % 2 ? -1 : 2), y, C.leaf2); k.px(x + (y % 2 ? 2 : -1), y + 1, C.leaf3); if (y % 9 === 0) k.px(x + 2, y, '#e98aa0'); }
      Props.pot(k, 92, 116); Props.pot(k, 26, 104, true); Props.pot(k, -32, 104, true);
      Props.lamp(k, 80, 100, false); Props.sign(k, 44, 132, 'SCRIPT', C.plum1);
      Props.bush(k, -100, -2, 1); Props.bush(k, 188, 60, 2); Props.bush(k, 92, 60, 0);
      for (let i = 0; i < 10; i++) Props.flower(k, -186 + P.hash(i, 11) * 90, 30 + P.hash(i, 12) * 24, ['#c3a2c0', '#f6ecd0', '#e98aa0'][i % 3]);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting';
      // Warm lamplight in the lodge windows, the reading candle and garden lamps.
      if (live) {
        for (const [x, y] of WIN) { k.rect(x, y, 4, 6, C.glassLit); k.rect(x + 5, y, 3, 6, C.glassLit); k.rect(x, y + 7, 4, 3, C.glassLit); k.rect(x + 5, y + 7, 3, 3, C.glassLit); k.rect(x, y + 10, 4, 2, '#f0b862'); k.rect(x + 5, y + 10, 3, 2, '#f0b862'); k.px(x, y, C.white); }
        for (const [x, y] of [[-86, 110], [80, 100]]) k.rect(x - 1, y - 20, 4, 3, C.glassLit);
        const fl = Math.floor(t * 6) % 2; k.px(2, -32 - fl, C.gold3); k.px(2, -31, C.gold4);
        if (z.detail) k.alpha(.25, () => k.circle(2, -30, 4, C.glassLit));
      }
      // Fountain: tall arcs while working, a gentle overflow when calm, dry and sputtering on error.
      if (run) {
        k.rect(FT.x, FT.y - 32, 1, 6, C.water5); k.px(FT.x, FT.y - 33 - Math.floor(t * 8) % 2, C.foam);
        for (let i = 0; i < 10; i++) { const q = (t * 1.1 + i / 10) % 1, d = i % 2 ? 1 : -1, x = FT.x + d * q * 18, y = FT.y - 30 - Math.sin(q * Math.PI) * 6 + q * 28; k.px(x, y, q > .8 ? C.foam : C.water5); }
      } else if (live && !err) for (let i = 0; i < 4; i++) { const q = (t * .8 + i / 4) % 1; k.px(FT.x + (i % 2 ? 8 : -9), FT.y - 17 + q * 14, C.water4); }
      if (err && Math.floor(t * 3) % 2) { k.px(FT.x, FT.y - 29, C.water4); k.px(FT.x + 1, FT.y - 30, C.stone2); }
      if (live && !err && z.detail) { const q = (t * .6) % 1; k.alpha(1 - q, () => k.ring(FT.x - 4, FT.y + 1, 3 + q * 10, 1 + q * 3, C.water4)); }

      // Binding press: the wheel turns and the platen presses while working.
      const ang = run ? t * 3 : 0, down = run ? Math.round((Math.sin(t * 3) + 1) * 1.5) : 0;
      k.rect(-51, -62, 3, 7 + down, C.stone1); k.rect(-56, -40 + down, 15, 3, C.wood3); k.rect(-56, -40 + down, 15, 1, C.wood4); k.rect(-50, -51, 2, 11 + down, C.stone2);
      for (let i = 0; i < 2; i++) { const a = ang + i * Math.PI / 2, cx = -49, cy = -62; k.line(cx - Math.cos(a) * 7, cy - Math.sin(a) * 2, cx + Math.cos(a) * 7, cy + Math.sin(a) * 2, C.wood1); }
      k.rect(-50, -63, 3, 3, C.gold1);

      // Ink cauldron: fire, bubbles and violet steam while working; grey smoke and a spill on error.
      if (run) { Props.fire(k, CAUL.x, CAUL.y + 1, t, .6); for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(CAUL.x - 4 + i * 4, CAUL.y - 11 - Math.floor(q * 2), q > .7 ? '#8a86b0' : VIOLET); } Props.smoke(k, CAUL.x - 2, CAUL.y - 14, t, 3, '#b8b0d0'); }
      else if (live && !err) { k.px(CAUL.x - 1, CAUL.y - 1, C.red2); k.px(CAUL.x + 2, CAUL.y - 1, C.red3); }
      if (err) { soot(k, CAUL.x, CAUL.y - 14, t * 1.2, 5, '#3a3640'); soot(k, CAUL.x - 6, CAUL.y - 10, t + .5, 3, '#5e5a64');
        if (Math.floor(t * 5) % 2) for (const [sx, sy] of [[-9, -14], [8, -13], [-4, -17], [11, -9]]) k.px(CAUL.x + sx, CAUL.y + sy, C.gold3); k.ellipse(CAUL.x + 10, CAUL.y + 4, 9, 2, INK); k.px(CAUL.x + 6, CAUL.y + 3, VIOLET); }

      // Manuscripts on the drying lines: swaying in the breeze while working, some blown loose on error.
      const lines = [[LINE_A, -12], [LINE_B, 18]];
      lines.forEach(([xs, y], j) => xs.forEach((x, i) => {
        if (err && (i + j) % 2) return;
        if (!run && !err && (i + j * 2) % 5 === 4) return;
        const sway = run ? Math.round(Math.sin(t * 3 + i + j)) : 0; page(k, x, y + (i % 3 === 1 ? 1 : 0), sway, (i + j) % 3 !== 0);
      }));
      // New pages float from the scholar's desk to the lines.
      if (run) for (let i = 0; i < 3; i++) { const q = (t * .22 + i / 3) % 1, x = 20 + q * 110, y = 50 - q * 56 - Math.sin(q * Math.PI) * 34; flyPage(k, x, y, Math.floor(t * 6 + i) % 2); }

      // Waiting: finished manuscripts piled on hold beside the desk, with an amber ribbon board.
      if (wait) {
        for (let i = 0; i < 6; i++) { k.rect(28 + (i % 2), 88 - i * 2, 12, 2, i % 2 ? C.paper : C.paper2); k.px(28 + (i % 2), 88 - i * 2, C.ink); }
        k.rect(33, 77, 2, 13, C.waiting);
        k.rect(48, 70, 24, 10, C.ink); k.rect(49, 71, 22, 8, C.waiting); k.text('HOLD', 52, 72, C.ink); k.rect(59, 80, 2, 8, C.wood1);
      }
      // Error: a toppled ink pot, a spreading stain and pages scattered over the plaza.
      if (err) {
        k.ellipse(LEAD.x + 36, LEAD.y + 6, 14, 4, INK); k.ellipse(LEAD.x + 33, LEAD.y + 5, 6, 2, VIOLET); k.rect(LEAD.x + 30, LEAD.y - 1, 6, 4, INK); k.px(LEAD.x + 36, LEAD.y, VIOLET);
        for (const [x, y, r] of [[60, 86, 0], [74, 58, 1], [-30, 60, 1], [118, 30, 0], [150, 40, 1], [132, 6, 0], [-44, 82, 0], [96, 22, 1]]) flatPage(k, x, y, r);
        for (let i = 0; i < 4; i++) { const q = (t * .5 + i / 4) % 1; flyPage(k, 110 + i * 18 + Math.sin(q * 6 + i) * 10, 10 - q * 60, Math.floor(t * 8 + i) % 2); }
      }
      // Signal lantern shows the district state; blinks red on error.
      const lc = live ? (err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? C.waiting : run ? C.gold3 : C.idle) : C.slate1;
      k.rect(LAMP.x + 5, LAMP.y - 17, 3, 4, lc); if (live && (run || wait)) k.px(LAMP.x + 5, LAMP.y - 17, C.white);
      if (live && (err || wait) && z.detail) k.alpha(.3, () => k.circle(LAMP.x + 6, LAMP.y - 15, 5, lc));

      // Scribes and gardeners.
      if (run) {
        z.crew(-62, 32, { look: 2, hat: 'hood', anim: 'work', tool: 'pen', phase: .1 });
        z.crew(74, 32, { look: 5, hat: 'hood', anim: 'work', tool: 'pen', facing: -1, phase: .6 });
        const p = (t * .08) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        z.crew(84 + q * 58, 50 - q * 44, { look: 0, hat: 'scarf', hatColor: C.plum3, anim: 'walk', carry: back ? '' : 'paper', facing: back ? -1 : 1, phase: .3 });
        z.crew(130 + Math.round(Math.sin(t * .4) * 20), 80, { look: 1, hat: 'straw', anim: 'work', tool: 'watering', phase: .8, speed: 3 });
        z.crew(130, -20, { look: 3, hat: 'bandana', hatColor: VIOLET, anim: 'work', tool: 'hoe', phase: .4 });
      } else if (live) {
        z.crew(-140, 66, { look: 2, hat: 'hood', anim: 'sit' });
        z.crew(state === 'idle' ? -16 : 74, state === 'idle' ? -16 : 32, { look: 5, hat: 'hood', anim: state === 'idle' ? 'sit' : 'idle', facing: -1 });
        z.crew(err ? 128 : wait ? 19 : 22, err ? 30 : 94, { look: 0, hat: 'scarf', hatColor: C.plum3, anim: 'idle', facing: err || wait ? 1 : -1 });
        if (state === 'idle') { z.crew(120, 82, { look: 1, hat: 'straw', anim: 'idle' }); for (let i = 0; i < 3; i++) Props.butterfly(k, 124 + Math.sin(t * .7 + i * 2) * 30, 70 + i * 18 + Math.cos(t * 1.1 + i) * 6, t + i, ['#f2c14e', '#e98aa0', '#f6ecd0'][i]); }
      } else {
        z.crew(-140, 66, { look: 2, hat: 'hood', anim: 'sleep' }); z.crew(74, 32, { look: 5, hat: 'hood', anim: 'sleep', facing: -1 });
      }
      if (live && !err && z.detail) for (let i = 0; i < 2; i++) Props.bird(k, -60 + ((t * 14 + i * 150) % 320) - 100, -132 + i * 10 + Math.sin(t * 2 + i) * 3, t + i);

      // The ink scholar: writing at the slanted desk; asleep on the garden bench when off.
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});
      // Chimney smoke from the lodge and ink house.
      if (live) { Props.smoke(k, -83, -122, t * (run ? 1 : .5), run ? 4 : 2); if (run) Props.smoke(k, 111, -94, t * 1.2 + .3, 3); }
    }
  };
})();
