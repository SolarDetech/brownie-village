/* Gazeteci · The news district: wire tower and telegraph hut, newsroom, archive shed, pigeon loft, printing yard and a street kiosk. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.gazeteci = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: -22, y: 64 }, REST = { x: -122, y: 128 };   // story board on the plaza; kiosk bench when off
  const PR = { x: 72, y: 70 };                                   // printing press (front-left of its plinth)
  const FW = { x: PR.x + 12, y: PR.y - 24 };                     // flywheel hub
  const GEAR = { x: PR.x + 59, y: PR.y - 27 };
  const MAST = { x: -170, y: -140 }, AER = { x: 54, y: -136 };   // wire tower mast and newsroom aerial
  const LOFT = { x: 146, y: -64 };
  const MUSTARD = '#c29a48', IRON = '#2e3240', IRON2 = '#454a5c', IRON3 = '#62687c';
  const UPPER = [[-58, -80], [-38, -80], [22, -80], [42, -80]];   // newsroom upper windows (12 x 12)
  const roll = (k, x, y, len) => { k.rect(x + 1, y, len, 2, C.shadow); k.rect(x, y - 9, len, 9, C.paper); k.rect(x, y - 9, len, 2, C.white); k.rect(x, y - 3, len, 3, C.paper2); k.rect(x, y - 1, len, 1, S(C.paper2, -.2)); k.ellipse(x + len, y - 5, 2, 4, C.paper2); k.ellipse(x + len, y - 5, 1, 3, S(C.paper2, -.12)); k.px(x + len, y - 5, C.wood1); };
  const bundle = (k, x, y) => { k.rect(x - 1, y - 7, 14, 8, C.ink); k.rect(x, y - 6, 12, 6, C.paper); k.rect(x, y - 6, 12, 1, C.white); k.rect(x, y - 1, 12, 1, C.paper2); k.rect(x + 1, y - 4, 4, 1, C.stone1); k.rect(x + 7, y - 4, 4, 1, C.stone1); k.rect(x + 5, y - 6, 1, 6, C.wood2); k.rect(x, y - 3, 12, 1, C.wood2); };
  const sheet = (k, x, y, f) => { if (f) { k.rect(x - 3, y, 7, 2, C.ink); k.rect(x - 2, y, 5, 1, C.paper); } else { k.rect(x - 3, y - 2, 7, 5, C.ink); k.rect(x - 2, y - 1, 5, 3, C.paper); k.rect(x - 1, y, 3, 1, C.stone1); } };
  const crumple = (k, x, y) => { k.rect(x - 1, y - 3, 5, 4, C.ink); k.rect(x, y - 2, 3, 2, C.paper); k.px(x + 1, y - 2, C.paper2); };
  const soot = (k, x, y, t, n, col) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1, r = 2 + q * 6, px = x + Math.sin(q * 4 + i * 2) * 4 + q * 8, py = y - q * 32; k.alpha((1 - q) * .9, () => { k.circle(px, py, r, col); k.circle(px - 1, py - 1, Math.max(1, r - 2), S(col, .15)); }); } };
  const pigeon = (k, x, y, t, fly) => {
    if (fly) { const up = Math.floor(t * 10) % 2; k.rect(x - 1, y, 4, 2, '#d8d8d0'); k.px(x + 3, y, '#9a9a94'); k.rect(x - 4, y - up * 2, 3, 1, '#c8c8c0'); k.rect(x + 2, y - up * 2, 3, 1, '#c8c8c0'); return; }
    k.rect(x, y - 3, 4, 3, '#b8bcc4'); k.px(x + 3, y - 4, '#8a90a0'); k.px(x + 4, y - 4, C.gold2); k.px(x, y - 2, '#6e7480'); k.px(x + 1, y, C.terra3);
  };

  return {
    paint(k) {
      // Street: a cobbled frontage, the central plaza, the oily slabs of the printing yard and the entrance lane.
      k.rect(-188, -38, 376, 20, C.stone2); Props.cobbles(k, -187, -37, 374, 18, 3, C.stone3);
      k.poly([[-100, -20], [52, -20], [56, 98], [22, 106], [-22, 106], [-104, 92]], C.stone2);
      k.polyTex([[-98, -19], [50, -19], [54, 96], [21, 104], [-21, 104], [-102, 90]], (x, y) => {
        const row = Math.floor((y + 300) / 5), off = row % 2 * 3, cx = (x + 300 + off) % 6;
        if ((y + 300) % 5 === 0 || cx === 0) return C.stone2;
        const h = P.hash(Math.floor((x + off) / 6), row); if ((y + 300) % 5 === 1 && cx === 1) return C.stone4; return h < .16 ? C.stone4 : h > .9 ? S(C.stone3, -.06) : C.stone3;
      });
      k.rect(-21, 100, 42, 40, C.stone2); Props.cobbles(k, -19, 100, 38, 40, 5, C.stone3);
      k.rect(54, -19, 134, 142, S(C.stone2, -.08));
      k.rectTex(55, -18, 132, 140, (x, y) => { if ((y + 300) % 12 === 0 || (x + 300 + (Math.floor((y + 300) / 12) % 2) * 8) % 16 === 0) return C.stone1; const h = P.hash(Math.floor(x / 16), Math.floor(y / 12)); return h < .2 ? S(C.stone2, .08) : null; });
      for (const [x, y, rx] of [[112, 84, 10], [150, 20, 6], [80, 104, 7], [170, 96, 5]]) k.ditherEllipse(x, y, rx, rx * .4, '#2a2a30', 1);
      // Plaza inlay: a compass of printers' rules.
      k.ellipse(-22, 30, 16, 6, C.stone1); k.ellipse(-22, 30, 14, 5, C.stone4); k.rect(-34, 30, 25, 1, C.slate2); k.rect(-22, 26, 1, 9, C.slate2); k.px(-22, 30, C.red2);

      // Trees and hedges behind the rooftops.
      Props.tree(k, -120, -104, 'oak', 2, 1); Props.tree(k, 116, -108, 'dark', 1, 2); Props.tree(k, -84, -112, 'autumn', 1, 0);
      Props.hedge(k, 70, -122, 34, 8);
      for (let i = 0; i < 12; i++) Props.flower(k, -150 + P.hash(i, 4) * 320, -146 + P.hash(i, 7) * 10, ['#f2c14e', '#f6ecd0', '#e98aa0'][i % 3]);

      // Wire tower: stone signal tower with a mast and insulators.
      Props.tower(k, -184, -38, { w: 30, h: 62, roofH: 24, roof: C.slate2, windows: [{ x: 11, y: 8, w: 7, h: 9, arch: true, frame: C.wood0 }, { x: 11, y: 30, w: 7, h: 9, arch: true, frame: C.wood0 }], door: { x: 10, w: 10, h: 14, color: C.slate1, arch: true } });
      k.rect(MAST.x - 1, MAST.y, 2, 18, IRON2); k.rect(MAST.x - 1, MAST.y, 1, 18, IRON3);
      for (const [y, w] of [[MAST.y + 3, 12], [MAST.y + 9, 8]]) { k.rect(MAST.x - w / 2, y, w, 1, IRON2); k.px(MAST.x - w / 2, y - 1, C.teal4); k.px(MAST.x + w / 2 - 1, y - 1, C.teal4); }
      // Telegraph hut with a flat roof and a wire sign.
      Props.building(k, -148, -38, { w: 40, h: 28, style: 'flat', wall: C.plaster2, windows: [{ x: 5, y: 8, w: 10, h: 8, frame: C.wood0 }], door: { x: 24, w: 9, h: 14, color: C.teal2 } });
      k.rect(-146, -72, 26, 8, C.ink); k.rect(-145, -71, 24, 6, C.teal2); k.text('WIRE', -141, -70, C.paper);
      k.rect(-116, -76, 2, 12, IRON2); k.rect(-119, -76, 8, 1, IRON2);

      // Newsroom: brick hall, slate roof, clock, upper windows, shop-front display windows and a roof sign.
      Props.building(k, -66, -36, { w: 128, h: 50, roofH: 28, roof: C.slate2, wall: '#b0674a', mat: 'brick', windows: UPPER.map(([x]) => ({ x: x + 66, y: 6, w: 12, h: 12, frame: C.wood0 })), door: { x: 54, w: 20, h: 24, color: C.teal1, arch: true }, chimney: { x: 104, h: 10 } });
      k.rect(-3, -60, 1, 24, C.teal0);
      Props.awning(k, -64, -64, 48, C.red2, C.paper, 6); Props.awning(k, 16, -64, 48, C.red2, C.paper, 6);
      for (const x of [-60, -40, 20, 40]) { k.rect(x - 1, -55, 18, 12, C.wood0); k.rect(x, -54, 16, 10, '#4a5a64'); k.rect(x + 2, -53, 5, 7, C.paper); k.rect(x + 9, -52, 5, 7, C.paper2); k.rect(x + 3, -52, 3, 1, C.ink); k.rect(x + 10, -51, 3, 1, C.ink); k.rect(x + 3, -50, 3, 2, C.stone2); k.px(x, -54, '#8aa0aa'); k.rect(x - 2, -43, 20, 1, C.stone4); }
      k.circle(-2, -74, 5, C.wood0); k.circle(-2, -74, 4, C.white); k.rect(-2, -77, 1, 3, C.ink); k.rect(-2, -74, 3, 1, C.ink); k.px(-2, -78, C.red2);
      k.rect(AER.x - 1, AER.y, 2, 22, IRON2); k.rect(AER.x - 1, AER.y, 1, 22, IRON3); k.rect(AER.x - 5, AER.y + 4, 10, 1, IRON2); k.rect(AER.x - 3, AER.y + 9, 6, 1, IRON2);
      Props.hangingSign(k, 12, -58, 'NEWS', C.red1);
      // The wires: tower mast to newsroom aerial, sagging slightly.
      for (const dy of [3, 9]) { k.line(MAST.x + 5, MAST.y + dy, -60, MAST.y + dy + 10, '#2a2420'); k.line(-60, MAST.y + dy + 10, AER.x - 4, AER.y + dy - 5, '#2a2420'); }
      k.rect(-30, -124, 2, 10, C.wood1); k.rect(24, -124, 2, 10, C.wood1);
      k.rect(-34, -137, 64, 15, C.ink); k.rect(-33, -136, 62, 13, C.paper); k.rect(-33, -136, 62, 1, C.white); k.rect(-33, -124, 62, 1, C.paper2); k.textCenter('GAZETE', -2, -134, C.red1, 2); k.rect(-24, -134, 46, 0, C.red1);

      // Archive shed: open-sided plank store with shelves of box files and ledgers.
      Props.building(k, 72, -36, { w: 62, h: 40, roofH: 18, roof: C.teal2, wall: C.wood3, mat: 'planks', foundation: 3 });
      k.rect(76, -73, 54, 34, '#2e241c');
      for (let r = 0; r < 3; r++) {
        const sy = -63 + r * 11;
        for (let i = 0; i < 9; i++) { const x = 78 + i * 6, h = P.hash(i, r + 3), col = h < .3 ? '#8a6a48' : h < .6 ? '#a8845c' : h < .8 ? C.slate2 : C.teal2; if (h > .93) continue; k.rect(x, sy - 8, 5, 8, col); k.rect(x, sy - 8, 1, 8, S(col, .25)); k.rect(x + 1, sy - 6, 3, 2, C.paper); }
        k.rect(77, sy, 52, 2, C.wood4); k.rect(77, sy + 2, 52, 1, C.wood0);
      }
      for (const x of [72, 131]) { k.rect(x, -76, 3, 40, C.wood2); k.rect(x, -76, 1, 40, C.wood4); }
      k.rect(78, -40, 52, 4, '#3a2c20');
      Props.crate(k, 80, -34, 8); Props.crate(k, 90, -32, 7); k.rect(120, -34, 10, 5, '#8a6a48'); k.rect(121, -38, 9, 4, '#a8845c'); k.rect(123, -37, 4, 2, C.paper);

      // Pigeon loft on stilts, with landing board, ladder and pigeonholes.
      for (const x of [LOFT.x + 2, LOFT.x + 32]) { k.rect(x, LOFT.y, 3, 26, C.wood1); k.rect(x, LOFT.y, 1, 26, C.wood3); k.ellipse(x + 2, LOFT.y + 26, 3, 1, C.shadow); }
      k.line(LOFT.x + 4, LOFT.y + 2, LOFT.x + 33, LOFT.y + 22, C.wood1); k.line(LOFT.x + 33, LOFT.y + 2, LOFT.x + 4, LOFT.y + 22, C.wood1);
      k.rect(LOFT.x + 4, LOFT.y + 26, 34, 2, C.shadow);
      Props.building(k, LOFT.x, LOFT.y, { w: 36, h: 24, style: 'peak', roofH: 14, depth: 8, roof: C.terra2, wall: C.plaster1, mat: 'planks', foundation: 0, vent: false });
      for (let i = 0; i < 3; i++) { const x = LOFT.x + 4 + i * 11; k.rect(x, LOFT.y - 18, 7, 8, C.wood0); k.rect(x + 1, LOFT.y - 17, 5, 7, '#1e1814'); k.rect(x - 1, LOFT.y - 10, 9, 2, C.wood3); }
      k.rect(LOFT.x - 4, LOFT.y - 2, 44, 2, C.wood3); k.rect(LOFT.x - 4, LOFT.y, 44, 1, C.wood1);
      for (let y = LOFT.y + 2; y < LOFT.y + 26; y += 4) k.rect(LOFT.x + 14, y, 8, 1, C.wood3); k.rect(LOFT.x + 14, LOFT.y, 1, 26, C.wood2); k.rect(LOFT.x + 21, LOFT.y, 1, 26, C.wood2);

      // Printing yard: the press, paper rolls, type case, ink barrels, bundle stacks and a delivery cart.
      k.rect(PR.x - 2, PR.y + 1, 88, 3, C.shadow);
      k.rect(PR.x - 2, PR.y - 7, 86, 8, IRON); k.rect(PR.x - 2, PR.y - 7, 86, 2, IRON3); k.rect(PR.x - 2, PR.y - 1, 86, 1, '#1a1c24');
      for (let i = 0; i < 6; i++) k.px(PR.x + 4 + i * 15, PR.y - 4, C.gold1);
      // Flywheel rim and support.
      k.rect(FW.x - 2, FW.y, 5, 18, IRON2); k.rect(FW.x - 2, FW.y, 1, 18, IRON3);
      for (const r of [14, 13]) k.ring(FW.x, FW.y, r, r, r === 14 ? IRON : IRON3);
      k.ring(FW.x, FW.y, 12, 12, IRON2);
      // Main frame, drum, ink rollers and delivery tray.
      for (const x of [PR.x + 26, PR.x + 56]) { k.rect(x, PR.y - 46, 6, 40, IRON2); k.rect(x, PR.y - 46, 2, 40, IRON3); k.rect(x + 5, PR.y - 46, 1, 40, IRON); }
      k.rect(PR.x + 24, PR.y - 50, 40, 6, IRON2); k.rect(PR.x + 24, PR.y - 50, 40, 1, IRON3); k.rect(PR.x + 24, PR.y - 45, 40, 1, IRON);
      for (let i = 0; i < 16; i++) k.rect(PR.x + 32, PR.y - 34 + i, 24, 1, [C.stone4, C.stone4, C.stone3, C.stone3, C.stone3, C.stone2, C.stone2, C.stone2, C.stone2, C.stone1, C.stone1, C.stone1, C.stone0, C.stone0, IRON, IRON][i]);
      k.rect(PR.x + 32, PR.y - 42, 24, 5, '#1a1a20'); k.rect(PR.x + 32, PR.y - 42, 24, 1, '#4a4a58'); k.rect(PR.x + 32, PR.y - 18, 24, 4, '#1a1a20');
      k.poly([[PR.x + 14, PR.y - 38], [PR.x + 32, PR.y - 34], [PR.x + 32, PR.y - 31], [PR.x + 14, PR.y - 35]], C.wood2);
      for (let i = 0; i < 4; i++) k.rect(PR.x + 16 + i, PR.y - 40 - i, 10, 1, i % 2 ? C.paper : C.white);
      k.line(FW.x, FW.y - 14, PR.x + 36, PR.y - 42, '#3a2c20'); k.line(FW.x, FW.y + 14, PR.x + 36, PR.y - 14, '#3a2c20');
      k.rect(PR.x + 62, PR.y - 16, 22, 3, C.wood2); k.rect(PR.x + 62, PR.y - 16, 22, 1, C.wood4); k.rect(PR.x + 64, PR.y - 13, 2, 7, C.wood1); k.rect(PR.x + 80, PR.y - 13, 2, 7, C.wood1);
      k.circle(GEAR.x, GEAR.y, 7, IRON); k.circle(GEAR.x, GEAR.y, 5, IRON3); k.circle(GEAR.x, GEAR.y, 2, IRON);
      // Exhaust stack for the press engine.
      k.rect(PR.x + 78, PR.y - 60, 5, 44, IRON2); k.rect(PR.x + 78, PR.y - 60, 1, 44, IRON3); k.rect(PR.x + 77, PR.y - 62, 7, 3, IRON);
      k.rect(PR.x + 40, PR.y - 56, 8, 6, IRON); k.rect(PR.x + 41, PR.y - 55, 6, 4, C.glassDark);
      // Paper rolls, type case, ink barrels.
      roll(k, 150, -4, 22); roll(k, 160, 6, 22); roll(k, 150, 16, 22); roll(k, 163, -14, 18);
      k.rect(58, -12, 20, 34, C.wood1); k.rect(59, -11, 18, 32, C.wood2);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { k.rect(60 + c * 6, -10 + r * 5, 5, 4, C.wood3); k.px(62 + c * 6, -8 + r * 5, C.gold2); }
      Props.barrel(k, 128, 6); k.ellipse(133, 6, 4, 1, '#1a1a20'); Props.barrel(k, 139, 12); k.ellipse(144, 12, 4, 1, '#1a1a20');
      for (const [x, y, n] of [[150, 52, 3], [164, 52, 4], [156, 64, 2], [172, 72, 3], [150, 88, 2]]) for (let i = 0; i < n; i++) bundle(k, x, y - i * 6);
      Props.cart(k, 90, 116, (q, x, y) => { for (let i = 0; i < 3; i++) bundle(q, x + 1 + i * 7 - (i > 1 ? 4 : 0), y - (i > 1 ? 6 : 0)); });
      Props.crate(k, 64, 106); Props.crate(k, 68, 96, 7); Props.sack(k, 176, 112, C.paper2);
      Props.lamp(k, 58, 40, false);

      // Story board on an easel beside the plaza: pinned photos and red string.
      const bx = -4, by = 28;
      k.line(bx + 3, by + 18, bx + 1, by + 32, C.wood1, 2); k.line(bx + 23, by + 18, bx + 25, by + 32, C.wood1, 2); k.line(bx + 13, by + 18, bx + 16, by + 30, C.wood0);
      k.rect(bx - 1, by - 1, 28, 21, C.wood1); k.rect(bx, by, 26, 19, '#b89060'); k.dither(bx, by, 26, 19, '#a07a4c', 1);
      for (const [x, y, c] of [[2, 2, C.paper], [12, 3, C.white], [19, 10, C.paper], [4, 11, C.white], [13, 12, C.paper2]]) { k.rect(bx + x, by + y, 6, 5, c); k.rect(bx + x + 1, by + y + 1, 4, 3, c === C.paper2 ? C.stone2 : C.slate3); }
      k.line(bx + 5, by + 2, bx + 15, by + 3, C.red2); k.line(bx + 15, by + 3, bx + 22, by + 10, C.red2); k.line(bx + 7, by + 11, bx + 16, by + 12, C.red2); k.line(bx + 5, by + 2, bx + 7, by + 11, C.red2);
      for (const [x, y] of [[5, 2], [15, 3], [22, 10], [7, 11], [16, 12]]) k.px(bx + x, by + y, C.red3);
      // Editor's standing desk with typewriter.
      Props.table(k, -58, 44, 22, 11, C.wood2); k.rect(-54, -2 + 36, 12, 5, IRON2); k.rect(-54, 34, 12, 1, IRON3); k.rect(-52, 30, 8, 4, C.paper); for (let i = 0; i < 4; i++) k.px(-53 + i * 3, 38, C.stone4);
      k.rect(-42, 35, 5, 2, C.paper2); k.rect(-41, 33, 5, 2, C.paper);

      // Street kiosk with magazines, an advertising column, benches and trees.
      Props.building(k, -184, 92, { w: 50, h: 26, roofH: 12, roof: C.teal2, wall: C.teal1, mat: 'planks', foundation: 3 });
      k.rect(-180, 70, 42, 16, '#2e241c'); k.rect(-181, 86, 44, 3, C.wood3); k.rect(-181, 86, 44, 1, C.wood4);
      for (let i = 0; i < 10; i++) { const x = -179 + i * 4, col = [C.red2, C.gold2, C.paper, C.teal3, C.plum3][i % 5]; k.rect(x, 72 + (i % 2) * 7, 3, 5, col); k.px(x + 1, 73 + (i % 2) * 7, C.white); }
      for (let i = 0; i < 5; i++) { k.rect(-178 + i * 8, 83, 7, 3, C.paper); k.rect(-177 + i * 8, 84, 4, 1, C.stone1); }
      Props.awning(k, -186, 64, 54, C.gold1, C.paper, 5);
      k.rect(-170, 50, 26, 8, C.ink); k.rect(-169, 51, 24, 6, C.red1); k.text('DAILY', -167, 52, C.paper);
      const cx = -110, cy = 44;
      k.ellipse(cx + 2, cy + 1, 9, 2, C.shadow); k.rect(cx - 7, cy - 3, 14, 3, C.stone2); k.rect(cx - 6, cy - 32, 12, 29, C.stone4);
      for (const [y, h, c] of [[-30, 8, C.red2], [-21, 6, C.paper], [-14, 9, C.teal3]]) { k.rect(cx - 6, cy + y, 12, h, c); k.rect(cx + 4, cy + y, 2, h, S(c, -.25)); k.rect(cx - 6, cy + y, 1, h, S(c, .25)); }
      k.rect(cx - 4, cy - 19, 8, 1, C.ink); k.rect(cx - 4, cy - 17, 6, 1, C.ink); k.text('!', cx - 1, cy - 29, C.paper);
      k.ellipse(cx, cy - 33, 8, 3, C.teal1); k.ellipse(cx, cy - 35, 6, 3, C.teal2); k.px(cx - 2, cy - 36, C.teal4); k.rect(cx - 1, cy - 40, 2, 3, C.gold2);
      Props.bench(k, -148, 128, 18); Props.bench(k, -86, 128, 18); Props.lamp(k, -64, 118, false); Props.lamp(k, 30, 118, false);
      Props.tree(k, -176, 138, 'oak', 1, 2); Props.bush(k, -104, 108, 1); Props.bush(k, -34, 118, 0); Props.bush(k, 46, 132, 2);
      // Public submissions box and a parked bicycle beside the tower.
      k.ellipse(-138, 14, 7, 2, C.shadow); k.rect(-144, -10, 12, 24, C.red1); k.rect(-144, -10, 2, 24, C.red2); k.rect(-133, -10, 1, 24, C.red0); k.rect(-145, -12, 14, 3, C.red0); k.rect(-142, -4, 8, 2, C.ink); k.text('TIP', -143, 2, C.paper);
      for (const x of [-176, -158]) { k.ring(x, 8, 5, 5, C.ink); k.ring(x, 8, 4, 4, C.stone2); k.px(x, 8, C.stone3); }
      k.line(-176, 8, -168, 0, C.red1, 2); k.line(-168, 0, -158, 8, C.red1, 2); k.line(-168, 0, -162, 0, C.red1, 2); k.line(-162, 0, -158, 8, C.red1); k.rect(-170, -2, 4, 1, C.ink); k.rect(-162, -3, 3, 1, C.stone2);
      for (let i = 0; i < 8; i++) Props.flower(k, -186 + P.hash(i, 13) * 70, 22 + P.hash(i, 14) * 22, ['#f2c14e', '#e98aa0', '#f6ecd0'][i % 3]);
      Props.flowerBed(k, -186, 30, 36, 10, ['#f2c14e', '#e46c52', '#f6ecd0'], 5);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting';
      // Lit newsroom windows, lamps and a blinking mast light.
      if (live) {
        for (const [x, y] of UPPER) { k.rect(x, y, 6, 6, C.glassLit); k.rect(x + 7, y, 5, 6, C.glassLit); k.rect(x, y + 7, 6, 5, '#f0b862'); k.rect(x + 7, y + 7, 5, 5, '#f0b862'); k.px(x, y, C.white); }
        for (const [x, y] of [[-64, 118], [30, 118], [58, 40]]) k.rect(x - 1, y - 20, 4, 3, C.glassLit);
        if (Math.floor(t * 2) % 2) { k.rect(MAST.x - 1, MAST.y - 3, 2, 2, err ? C.error : C.red3); }
      }
      // Clock hands tick with time.
      const a = live ? t * .5 : 0; k.line(-2, -74, -2 + Math.round(Math.cos(a) * 3), -74 + Math.round(Math.sin(a) * 3), C.red1);

      // Telegraph pulses travel the wires while working; the wire snaps and sparks on error.
      if (run && z.detail) for (let i = 0; i < 4; i++) { const q = (t * .5 + i / 4) % 1, dy = i % 2 ? 3 : 9; let x, y; if (q < .5) { const u = q * 2; x = MAST.x + 5 + u * (-60 - MAST.x - 5); y = MAST.y + dy + u * 10; } else { const u = (q - .5) * 2; x = -60 + u * (AER.x - 4 + 60); y = MAST.y + dy + 10 + u * (AER.y - 5 - MAST.y - 10); } k.rect(x - 1, y - 1, 3, 2, C.gold3); }
      if (err) { k.rect(-66, -126, 6, 3, C.stone4); if (Math.floor(t * 8) % 3) for (const [sx, sy] of [[-1, -2], [2, 0], [-2, 2], [1, 3]]) k.px(-60 + sx * (1 + Math.floor(t * 8) % 2), -122 + sy, C.gold4); }

      // Press: flywheel spokes and gear turn, sheets roll out onto the tray while working.
      const ang = run ? t * 4 : .4;
      for (let i = 0; i < 3; i++) { const q = ang + i * Math.PI / 3; k.line(FW.x - Math.cos(q) * 11, FW.y - Math.sin(q) * 11, FW.x + Math.cos(q) * 11, FW.y + Math.sin(q) * 11, IRON2, 2); }
      k.circle(FW.x, FW.y, 3, IRON3); k.px(FW.x - 1, FW.y - 1, C.stone4);
      for (let i = 0; i < 8; i++) { const q = -ang * 1.6 + i * Math.PI / 4; k.rect(GEAR.x + Math.cos(q) * 7 - 1, GEAR.y + Math.sin(q) * 7 - 1, 2, 2, IRON3); }
      const stack = run ? 1 + Math.floor((t * 1.5) % 6) : wait ? 7 : 3;
      for (let i = 0; i < stack; i++) k.rect(PR.x + 66 + (i % 2), PR.y - 17 - i, 14, 1, i % 2 ? C.paper : C.white);
      if (run) {
        const q = (t * 1.5) % 1; k.rect(PR.x + 56 + q * 12, PR.y - 22 + q * 4, 10, 2, C.white); k.rect(PR.x + 58 + q * 12, PR.y - 21 + q * 4, 5, 1, C.stone1);
        k.rect(PR.x + 32 + Math.floor(t * 20) % 22, PR.y - 41, 2, 1, '#6a6a7a');
        Props.smoke(k, PR.x + 80, PR.y - 64, t * 1.3, 4, '#bcb8ae');
        if (z.detail) for (let i = 0; i < 3; i++) { const q2 = (t * 1.1 + i / 3) % 1; k.px(PR.x + 44 + i * 4, PR.y - 12 + q2 * 6, C.stone3); }
      }
      if (err) {
        soot(k, PR.x + 44, PR.y - 44, t * 1.2, 5, '#3e3c44'); soot(k, PR.x + 30, PR.y - 36, t + .4, 3, '#6a6670'); soot(k, PR.x + 80, PR.y - 64, t, 4, '#2e2c32');
        if (Math.floor(t * 6) % 2) for (const [sx, sy] of [[30, -30], [58, -36], [26, -22], [62, -24], [44, -46]]) { k.px(PR.x + sx, PR.y + sy, C.gold4); k.px(PR.x + sx + 1, PR.y + sy - 1, C.gold2); }
        k.poly([[PR.x + 56, PR.y - 24], [PR.x + 64, PR.y - 30], [PR.x + 68, PR.y - 22], [PR.x + 60, PR.y - 18]], C.paper); k.line(PR.x + 58, PR.y - 23, PR.x + 64, PR.y - 27, C.stone1);
        for (const [x, y] of [[66, 84], [94, 80], [140, 76], [118, 96], [60, 58], [104, 30], [134, 44], [80, 92]]) crumple(k, x, y);
        for (let i = 0; i < 4; i++) { const q = (t * .45 + i / 4) % 1; sheet(k, PR.x + 60 + Math.sin(q * 7 + i) * 18, PR.y - 30 - q * 70, Math.floor(t * 8 + i) % 2); }
      }
      // Press status lamp.
      const lc = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? C.waiting : run ? C.working : C.idle;
      k.rect(PR.x + 41, PR.y - 55, 6, 4, lc); if (live && (run || err) && Math.floor(t * 3) % 2) k.px(PR.x + 42, PR.y - 54, C.white);
      if (live && (err || wait) && z.detail) k.alpha(.3, () => k.circle(PR.x + 44, PR.y - 53, 6, lc));
      // Waiting: a stack of proofs held for sign-off and an amber PROOF board by the editor.
      if (wait) {
        for (let i = 0; i < 5; i++) bundle(k, 26 + (i % 2) * 2, 92 - i * 6);
        k.rect(34, 58, 30, 10, C.ink); k.rect(35, 59, 28, 8, C.waiting); k.text('PROOF', 38, 60, C.ink); k.rect(47, 68, 2, 12, C.wood1);
        k.rect(PR.x + 60, PR.y - 30, 26, 9, C.ink); k.rect(PR.x + 61, PR.y - 29, 24, 7, C.waiting); k.text('HOLD', PR.x + 65, PR.y - 28, C.ink);
      }

      // Pigeons bring tips to the loft while working; they roost on the landing board otherwise.
      if (run) for (let i = 0; i < 3; i++) {
        const p = (t * .13 + i / 3) % 1, x = 170 - p * 350, y = -76 - Math.sin(p * Math.PI) * 46 - i * 6;
        pigeon(k, x, y, t + i, true); if (i % 2 === 0) { k.rect(x - 2, y + 2, 4, 3, C.paper); k.px(x - 1, y + 3, C.red2); }
      } else for (let i = 0; i < 4; i++) pigeon(k, LOFT.x - 2 + i * 11, LOFT.y - 2, t, false);

      // Crew: pressman, bundle runner, archive clerk and a newsboy.
      if (run) {
        z.crew(PR.x + 20, PR.y + 12, { look: 5, hat: 'cap', hatColor: C.slate2, anim: 'work', phase: .2, facing: 1 });
        const p = (t * .09) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        z.crew(160 - q * 44, 82 + q * 16, { look: 0, hat: 'cap', hatColor: MUSTARD, anim: 'walk', carry: back ? '' : 'paper', facing: back ? 1 : -1, phase: .5 });
        const p2 = (t * .06) % 1, b2 = p2 > .5, q2 = b2 ? (1 - p2) * 2 : p2 * 2;
        z.crew(100 - q2 * 96, -22, { look: 2, anim: 'walk', carry: b2 ? '' : 'box', facing: b2 ? 1 : -1, phase: .1 });
        z.crew(24, 124, { look: 3, hat: 'cap', hatColor: C.red1, anim: 'cheer', phase: .7 });
      } else if (live) {
        z.crew(state === 'idle' ? -142 : PR.x + 20, state === 'idle' ? 126 : PR.y + 12, { look: 5, hat: 'cap', hatColor: C.slate2, anim: state === 'idle' ? 'sit' : 'idle' });
        z.crew(state === 'idle' ? 170 : 118, state === 'idle' ? 106 : 100, { look: 0, hat: 'cap', hatColor: MUSTARD, anim: state === 'idle' ? 'sit' : 'idle', facing: -1 });
        z.crew(state === 'idle' ? -80 : 24, state === 'idle' ? 126 : 124, { look: 3, hat: 'cap', hatColor: C.red1, anim: state === 'idle' ? 'sit' : 'idle' });
        if (state === 'idle') { for (let i = 0; i < 2; i++) Props.butterfly(k, -160 + Math.sin(t * .8 + i * 3) * 18, 24 + i * 10 + Math.cos(t + i) * 5, t + i, i ? '#e98aa0' : '#f2c14e'); }
      } else { z.crew(-142, 126, { look: 5, hat: 'cap', hatColor: C.slate2, anim: 'sleep' }); z.crew(PR.x + 20, PR.y + 12, { look: 0, hat: 'cap', hatColor: MUSTARD, anim: 'sleep' }); }
      if (live && !err && z.detail) for (let i = 0; i < 2; i++) Props.bird(k, ((t * 16 + i * 170) % 360) - 180, -140 + i * 8 + Math.sin(t * 2 + i) * 3, t + i);

      // The roving editor: notes and photos at the story board; dozing on the kiosk bench when off.
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});
      if (live) Props.smoke(k, 41, -124, t * (run ? 1 : .5), run ? 3 : 2);
    }
  };
})();
