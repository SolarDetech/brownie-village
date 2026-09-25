/* Mine · Stone & ore, mining and hauling: a layered escarpment with a timbered adit and rail line, a headframe with
   sheave wheel and lift cage, winding house, ore sorting shelter with coloured heaps, quarry block yard and lamp house.
   Resource zone: no lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.mine = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ADIT = { x: -70, y: -48, w: 26, h: 26 };    // tunnel mouth (bottom centre)
  const RAIL = { x: -70, top: -62, end: 32 };       // straight rail line out of the tunnel
  const HEAD = { x: 95, top: -120, collar: 2 };     // headframe centre line, sheave height, collar edge
  const CAGE_H = 22;
  const ORE = {
    copper: ['#7a4a24', '#c98a4a', '#eab070'], iron: ['#4a2a22', '#8a4a3a', '#b8705a'], coal: ['#18161a', '#2e2a2e', '#56505a'],
    silver: ['#6a7078', '#a8b0b8', '#e8eef0'], jade: [C.teal0, C.teal3, C.teal4], gold: [C.gold0, C.gold2, C.gold4], stone: [C.stone1, C.stone2, C.stone4]
  };
  const hatted = look => ({ look, hat: 'helmet' });

  /* ---------- Local helpers ---------- */
  const lump = (k, x, y, t) => { k.rect(x, y, 3, 2, t[1]); k.px(x, y, t[2]); k.px(x + 2, y + 1, t[0]); };
  const oreHeap = (k, x, y, rx, ry, t, seed = 1) => {
    k.ellipse(x + 2, y + 1, rx + 1, 3, C.shadow);
    k.ellipse(x, y - ry * .45, rx, ry, t[0]); k.ellipse(x - 1, y - ry * .6, rx - 1, ry - 1, t[1]); k.ellipse(x - rx * .3, y - ry * .9, rx * .45, ry * .45, t[2]);
    const rnd = P.rng(seed); for (let i = 0; i < rx * 1.4; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()); lump(k, x + Math.cos(a) * d * (rx - 2) - 1, y - ry * .5 + Math.sin(a) * d * (ry - 1), t); }
    k.rect(x - rx + 1, y - 1, rx * 2 - 1, 1, t[0]);
  };
  const block = (k, x, y, w, h, d = 4) => { // cut stone block, x,y bottom-left
    k.rect(x + 2, y, w + 2, 2, C.shadow); k.rect(x, y - h, w, h, C.stone3); k.rect(x, y - h, 1, h, C.stone4); k.rect(x + w - 1, y - h, 1, h, C.stone1); k.rect(x, y - 1, w, 1, C.stone1);
    k.rect(x + 1, y - h - d, w, d, C.stone4); k.rect(x + 1, y - h - d, w, 1, C.stone5); k.px(x + 3, y - h + 2, C.stone2); k.px(x + w - 4, y - 3, C.stone2);
  };
  const sleepers = (k, x, y0, y1) => { for (let y = y0; y <= y1; y += 5) { k.rect(x - 10, y, 21, 2, C.wood1); k.rect(x - 10, y, 21, 1, C.wood2); } k.rect(x - 7, y0 - 1, 2, y1 - y0 + 3, C.stone1); k.rect(x + 6, y0 - 1, 2, y1 - y0 + 3, C.stone1); k.rect(x - 7, y0 - 1, 1, y1 - y0 + 3, C.stone4); k.rect(x + 6, y0 - 1, 1, y1 - y0 + 3, C.stone4); };
  const lanternPost = (k, x, y) => { k.rect(x, y - 18, 2, 18, C.wood1); k.px(x, y - 18, C.wood3); k.rect(x, y - 18, 6, 1, C.wood1); k.ellipse(x + 1, y, 3, 1, C.shadow); };

  /* ---------- Cached moving sprites ---------- */
  const cartSprite = (load, tip = 0) => P.sprite(`mn-cart|${load}|${tip}`, 24, 20, 12, 16, q => {
    q.ellipse(1, 0, 10, 2, C.shadow);
    if (load) { const t = ORE[load]; q.ellipse(0, -11, 8, 4, t[0]); q.ellipse(-1, -12, 7, 3, t[1]); for (let i = 0; i < 7; i++) lump(q, -6 + (i * 5) % 12, -14 + (i % 3), t); }
    q.poly([[-9, -11], [9, -11], [7, -2], [-7, -2]], C.slate1); q.poly([[-9, -11], [-5, -11], [-4, -2], [-7, -2]], C.slate2);
    q.rect(-9, -11, 18, 2, C.slate3); q.rect(-9, -11, 18, 1, C.slate4); q.rect(-8, -6, 16, 1, C.slate0); q.px(-6, -8, C.stone4); q.px(5, -8, C.stone1);
    for (const x of [-7, 5]) { q.rect(x, -3, 3, 4, C.ink); q.px(x + 1, -2, C.stone2); }
  }, C.ink);
  const cageSprite = load => P.sprite(`mn-cage|${load}`, 22, 24, 11, 23, q => {
    q.rect(-10, -22, 20, 22, '#231a16'); q.rect(-10, -22, 20, 2, C.stone2); q.rect(-10, -2, 20, 2, C.stone1);
    for (let x = -10; x <= 8; x += 4) q.rect(x, -20, 1, 18, C.stone3);
    q.rect(-10, -12, 20, 1, C.stone2); q.rect(-10, -22, 1, 22, C.stone4);
    if (load) { const t = ORE[load]; q.rect(-7, -10, 14, 8, C.wood2); q.rect(-7, -10, 14, 1, C.wood4); for (let i = 0; i < 5; i++) lump(q, -6 + i * 3, -13 + (i % 2), t); }
    q.rect(-2, -25, 4, 3, C.stone1); q.px(0, -25, C.stone4);
  }, C.ink);
  const sheaveSprite = f => P.sprite(`mn-sheave|${f}`, 22, 22, 11, 11, q => {
    q.circle(0, 0, 9, C.slate0); q.circle(0, 0, 8, C.slate2); q.circle(0, 0, 6, '#241e1c');
    for (let i = 0; i < 3; i++) { const a = f * Math.PI / 12 + i * Math.PI / 3; q.line(Math.cos(a) * -6, Math.sin(a) * -6, Math.cos(a) * 6, Math.sin(a) * 6, C.slate3); }
    q.circle(0, 0, 2, C.slate1); q.px(0, 0, C.stone4); q.px(-5, -6, C.slate4); q.px(-6, -5, C.slate4);
  }, C.ink);
  const glow = P.sprite('mn-glow', 14, 14, 7, 7, q => q.circle(0, 0, 6, C.glassLit), null);
  const holdHeaps = () => P.sprite('mn-hold', 26, 26, 12, 14, q => { oreHeap(q, 2, -2, 9, 6, ORE.coal, 31); oreHeap(q, 0, 10, 8, 5, ORE.jade, 32); });
  const debris = () => P.sprite('mn-debris', 30, 16, 12, 6, q => { for (let i = 0; i < 9; i++) lump(q, (i * 7) % 26 - 10, (i * 5) % 12 - 4, i % 3 ? ORE.iron : ORE.stone); }, null);
  const rockfall = () => P.sprite('mn-rockfall', 36, 16, 15, 10, q => { for (let i = 0; i < 5; i++) Props.rock(q, -10 + i * 6, (i % 2) * 3, i % 2, i); }, null);
  const lantern = (k, x, y, on, col = C.glassLit) => { k.rect(x - 2, y, 5, 6, C.ink); k.rect(x - 1, y + 1, 3, 4, on ? col : C.glassDark); k.px(x, y - 1, C.ink); if (on) { k.px(x - 1, y + 1, C.white); k.blit(glow, x, y + 3, false, .18); } };

  return {
    paint(k) {
      /* ---- Plateau and escarpment ---- */
      // Jagged rock columns: each has its own top step, a lit left edge and a shaded right edge.
      const warp = x => x + 400 + Math.round(Math.sin(x * .23) * 3 + Math.sin(x * .07) * 2), colOf = x => Math.floor(warp(x) / 11), colTopOff = c => Math.floor(P.hash(c, 77) * 9);
      const faceTop = x => -116 + Math.round(Math.sin(x * .045) * 3) + colTopOff(colOf(x));
      const faceBot = x => -50 + Math.round(Math.sin(x * .06 + 2) * 3 + Math.sin(x * .19) * 1.5);
      k.polyTex([[-190, -150], [190, -150], [190, -96], [-190, -96]], (x, y) => {
        if (y > faceTop(x) + 1) return null; const h = P.hash(x, y);
        if (y > faceTop(x) - 2) return C.grass1; if (h > .95) return C.grass4; if (h < .04) return C.dirt1; if (h < .1) return C.grass1; return (x + y) % 2 ? C.grass2 : '#5a8a4a';
      });
      const face = []; for (let x = -190; x <= 190; x += 1) face.push([x, faceTop(x)]); for (let x = 190; x >= -190; x -= 4) face.push([x, faceBot(x) + 1]);
      const bands = ['#a89478', '#9a8468', C.stone2, '#b4a080', '#8a765e', C.stone3, '#9c8a70'];
      k.polyTex(face, (x, y) => {
        const c = colOf(x), u = warp(x) % 11, top = faceTop(x), fb = faceBot(x), d = y - top;
        const wob = y + Math.round(Math.sin(x * .05) * 3) + colTopOff(c), band = Math.floor((wob + 200) / 8), r = (wob + 200) % 8, hh = P.hash(x, y);
        if (d < 1) return C.stone5; if (d < 3) return u < 8 ? C.stone4 : C.stone3;
        let col = bands[(band + (c % 2)) % bands.length];
        if (r === 7 && P.hash(c, band) > .3) col = S(col, -.3); else if (r === 0 && P.hash(c, band) > .3) col = S(col, .18);
        if (u === 10) return C.stone0; if (u === 9) col = S(col, -.3); else if (u > 6) col = S(col, -.14); else if (u < 2) col = S(col, .2);
        if (hh > .988) return c % 3 ? ORE.copper[2] : ORE.jade[2]; if (hh > .98) return ORE.silver[2];
        if (hh < .05) col = S(col, -.15);
        const low = fb - y; if (low < 8) col = S(col, -.05 * (8 - low));
        return col;
      });
      // Overhanging grass lip, roots and shade line under it.
      for (let x = -190; x < 190; x += 2) { const y = faceTop(x); k.rect(x, y - 1, 2, 2, C.grass1); if (P.hash(x, 3) > .7) k.rect(x, y + 1, 1, 2 + (x % 3), C.leaf1); k.px(x, y + 2, C.shadow); }
      for (const [x, s, kind] of [[-178, 1, 'pine'], [-160, 0, 'pine'], [-128, 1, 'oak'], [-96, 1, 'dark'], [-40, 0, 'pine'], [-20, 1, 'pine'], [30, 1, 'pine'], [52, 0, 'birch'], [128, 1, 'dark'], [152, 1, 'pine'], [176, 0, 'pine']]) Props.tree(k, x, Math.max(-118 + (kind === 'pine' ? 0 : 3), faceTop(x) - 1), kind, 0, x & 3);
      for (let i = 0; i < 10; i++) Props.bush(k, -178 + i * 38 + P.hash(i, 2) * 10, faceTop(-178 + i * 38) - 1, i % 3);
      // Scree and talus along the foot of the cliff.
      for (let i = 0; i < 34; i++) { const x = -184 + i * 11 + P.hash(i, 5) * 4; if (Math.abs(x - ADIT.x) < 22) continue; Props.rock(k, x, faceBot(x) + 3 + P.hash(i, 6) * 4, i % 4 ? 0 : 1, i); }
      // Quarry benches cut into the western face (fresh pale stone with drill lines).
      k.polyTex([[-190, -94], [-150, -94], [-150, -78], [-126, -78], [-126, -52], [-190, -52]], (x, y) => {
        const h = P.hash(x, y), step1 = x < -150 && y < -90, step2 = y >= -78 && y < -74;
        if (step1 || step2) return h > .7 ? C.stone5 : C.stone4;
        if ((x < -150 && y < -88) || (y >= -74 && y < -72)) return C.stone1;
        if (x % 6 === 0 && ((y > -88 && y < -80) || (y > -70 && y < -58))) return C.stone2;
        return h < .08 ? C.stone2 : h > .94 ? C.stone4 : (x + y) % 2 ? C.stone3 : '#c2b8a2';
      });
      k.rect(-151, -94, 2, 42, C.stone1); k.rect(-127, -78, 2, 26, C.stone0);
      block(k, -186, -54, 12, 7); block(k, -170, -54, 10, 6); block(k, -140, -54, 9, 6);

      /* ---- Apron ground: packed grey-brown earth with gravel ---- */
      k.polyTex([[-190, -52], [190, -52], [190, 104], [150, 132], [22, 134], [-22, 134], [-150, 132], [-190, 110]], (x, y) => {
        if (y < faceBot(x) + 1) return null; const h = P.hash(x * 3, y * 5);
        if (Math.abs(x) < 16 && y > 100) return h > .8 ? C.dirt4 : C.dirt3;
        if (h < .06) return C.stone1; if (h > .95) return C.stone4; if (h > .86) return '#8a7a64';
        return (x * 7 + y * 3) % 11 === 0 ? C.dirt1 : ((x + y) % 2 ? '#9a8266' : '#a08a6c');
      });
      for (let i = 0; i < 24; i++) { const x = -188 + P.hash(i, 41) * 376, y = 104 + P.hash(i, 43) * 30; if (Math.abs(x) > 24) Props.tuft(k, x, y, C.grass1, C.grass3); }

      /* ---- Adit: timbered tunnel mouth with receding frames ---- */
      const ax = ADIT.x - (ADIT.w >> 1), ay = ADIT.y - ADIT.h;
      k.rect(ax - 6, ay - 8, ADIT.w + 12, ADIT.h + 8, C.stone0);
      k.rect(ax, ay, ADIT.w, ADIT.h, '#120c0a');
      for (let i = 1; i <= 3; i++) { const inset = i * 3; k.rect(ax + inset, ay + inset - 1, ADIT.w - inset * 2, 1, S(C.wood1, -.3 * i)); k.rect(ax + inset, ay + inset - 1, 1, ADIT.h - inset, S(C.wood1, -.3 * i)); k.rect(ax + ADIT.w - inset - 1, ay + inset - 1, 1, ADIT.h - inset, S(C.wood1, -.3 * i)); }
      k.line(ADIT.x - 7, ADIT.y, ADIT.x - 2, ay + 12, '#3a3634'); k.line(ADIT.x + 6, ADIT.y, ADIT.x + 2, ay + 12, '#3a3634');
      for (const x of [ax - 5, ax + ADIT.w + 1]) { k.rect(x, ay - 2, 5, ADIT.h + 2, C.wood2); k.rect(x, ay - 2, 1, ADIT.h + 2, C.wood4); k.rect(x + 4, ay - 2, 1, ADIT.h + 2, C.wood0); k.px(x + 2, ay + 6, C.wood0); k.px(x + 2, ay + 16, C.wood0); }
      k.rect(ax - 8, ay - 8, ADIT.w + 16, 7, C.wood2); k.rect(ax - 8, ay - 8, ADIT.w + 16, 1, C.wood4); k.rect(ax - 8, ay - 2, ADIT.w + 16, 1, C.wood0); logEnds(k, ax - 8, ay - 5); logEnds(k, ax + ADIT.w + 7, ay - 5);
      k.line(ax - 4, ay - 1, ax + 4, ay + 7, C.stone1, 1); k.line(ax + ADIT.w + 3, ay - 1, ax + ADIT.w - 5, ay + 7, C.stone1, 1);
      // Rails out of the adit, a bumper and a dump bin at the far end.
      sleepers(k, RAIL.x, ADIT.y - 2, RAIL.end);
      k.rect(RAIL.x - 9, RAIL.end + 3, 19, 5, C.wood1); k.rect(RAIL.x - 9, RAIL.end + 3, 19, 1, C.wood3); k.rect(RAIL.x - 3, RAIL.end + 4, 7, 3, C.red1);
      k.poly([[RAIL.x - 18, RAIL.end + 8], [RAIL.x + 18, RAIL.end + 8], [RAIL.x + 14, RAIL.end + 24], [RAIL.x - 14, RAIL.end + 24]], C.wood1);
      k.poly([[RAIL.x - 16, RAIL.end + 9], [RAIL.x + 16, RAIL.end + 9], [RAIL.x + 13, RAIL.end + 22], [RAIL.x - 13, RAIL.end + 22]], C.wood3);
      for (let x = RAIL.x - 12; x < RAIL.x + 14; x += 5) k.rect(x, RAIL.end + 10, 1, 12, C.wood2);
      oreHeap(k, RAIL.x, RAIL.end + 16, 11, 4, ORE.stone, 3);

      /* ---- Ore sorting shelter: lean-to roof, bay boards, coloured heaps ---- */
      const s0 = -40, s1 = 54;
      k.rect(s0 + 3, -8, s1 - s0, 64, C.shadowSoft);
      k.rect(s0, 2, s1 - s0, 40, C.wood1); for (let x = s0 + 2; x < s1; x += 4) { k.rect(x, 2, 1, 40, C.wood0); k.px(x + 1, 6 + (x * 5) % 30, C.wood2); }
      k.rect(s0, 38, s1 - s0, 4, C.wood0);
      // Tools and a chalk tally board on the back wall.
      k.rect(s0 + 4, 8, 20, 12, C.slate0); k.rect(s0 + 5, 9, 18, 10, C.slate1); for (let i = 0; i < 4; i++) k.rect(s0 + 7 + i * 4, 11, 1, 5, C.paper); k.line(s0 + 6, 15, s0 + 21, 12, C.paper);
      for (const x of [s0 + 30, s0 + 36]) { k.rect(x, 8, 1, 16, C.wood4); k.line(x - 3, 8, x + 3, 9, C.stone3); }
      k.rect(s0 + 46, 10, 10, 9, C.wood2); k.rect(s0 + 47, 11, 8, 3, '#2a2226');
      const bays = ['copper', 'iron', 'coal', 'jade', 'silver'];
      bays.forEach((b, i) => { const x = s0 + 10 + i * 19; oreHeap(k, x, 56, 8, 7, ORE[b], i + 7); });
      for (let i = 0; i <= 5; i++) { const x = s0 + i * 19; k.rect(x, 36, 2, 22, C.wood2); k.rect(x, 36, 1, 22, C.wood4); }
      k.polyTex([[s0 - 6, 4], [s1 + 6, 4], [s1 + 2, -12], [s0 - 2, -12]], (x, y) => { const r = y + 12; if (r < 1) return C.slate4; if (y >= 2) return C.slate0; if (r % 4 === 0) return C.slate1; return (x + Math.floor(r / 4) * 4) % 8 === 0 ? C.slate1 : C.slate2; });
      for (const x of [s0 - 3, s1 - 1]) { k.rect(x, 4, 4, 54, C.wood2); k.rect(x, 4, 1, 54, C.wood4); k.rect(x + 3, 4, 1, 54, C.wood0); }
      Props.hangingSign(k, s0 + 32, 5, 'ORE', C.terra1);
      // Sieve table and baskets in front of the bays.
      k.rect(-14, 72, 30, 2, C.shadow); k.rect(-16, 62, 30, 4, C.wood3); k.rect(-16, 62, 30, 1, C.wood4); k.rect(-14, 63, 26, 2, '#4a4038'); for (let x = -13; x < 12; x += 2) k.px(x, 63, C.stone3);
      k.rect(-15, 66, 2, 7, C.wood1); k.rect(11, 66, 2, 7, C.wood1);
      for (const [x, c] of [[20, 'copper'], [30, 'jade'], [-30, 'silver']]) { k.rect(x, 64, 9, 7, C.wood3); k.rect(x, 64, 9, 1, C.wood4); for (let i = 0; i < 3; i++) lump(k, x + 1 + i * 3, 62, ORE[c]); k.rect(x + 1, 66, 7, 1, C.wood2); }

      /* ---- Headframe, collar and landing ---- */
      const hx = HEAD.x;
      // Shaft collar: a dark shaft framed in timber, landing deck in front.
      k.rect(hx - 13, HEAD.collar - 10, 26, 12, '#100a08'); k.rect(hx - 13, HEAD.collar - 10, 26, 2, C.wood0);
      k.rect(hx - 15, HEAD.collar - 12, 30, 3, C.wood2); k.rect(hx - 15, HEAD.collar - 12, 30, 1, C.wood4);
      Props.planks(k, hx - 20, HEAD.collar, 40, 12, C.wood2); k.rect(hx - 20, HEAD.collar + 12, 40, 2, C.wood0);
      for (let i = 0; i < 8; i++) k.rect(hx - 20 + i * 5, HEAD.collar + 10, 3, 2, i % 2 ? C.ink : C.gold2);
      // Legs, braces and backstays.
      for (const x of [hx - 16, hx + 13]) { k.rect(x, HEAD.top + 6, 3, HEAD.collar - HEAD.top - 6, C.wood1); k.rect(x, HEAD.top + 6, 1, HEAD.collar - HEAD.top - 6, C.wood3); }
      for (let y = HEAD.top + 12; y < -8; y += 22) { k.line(hx - 15, y, hx + 14, y + 22, C.wood1, 2); k.line(hx + 14, y, hx - 15, y + 22, C.wood1, 2); k.rect(hx - 16, y, 32, 2, C.wood2); k.rect(hx - 16, y, 32, 1, C.wood3); }
      k.line(hx + 14, HEAD.top + 10, hx + 46, HEAD.collar + 2, C.wood1, 3); k.line(hx + 14, HEAD.top + 10, hx + 46, HEAD.collar + 2, C.wood3, 1);
      k.line(hx + 14, HEAD.top + 36, hx + 38, -40, C.wood1, 2);
      k.rect(hx + 44, HEAD.collar - 2, 6, 5, C.stone2); k.rect(hx + 44, HEAD.collar - 2, 6, 1, C.stone4);
      // Sheave deck and ladder.
      k.rect(hx - 20, HEAD.top + 6, 40, 4, C.wood2); k.rect(hx - 20, HEAD.top + 6, 40, 1, C.wood4); k.rect(hx - 20, HEAD.top + 3, 1, 4, C.wood1); k.rect(hx + 19, HEAD.top + 3, 1, 4, C.wood1); k.rect(hx - 20, HEAD.top + 3, 40, 1, C.wood1);
      for (let y = HEAD.top + 12; y < HEAD.collar - 12; y += 4) k.rect(hx - 22, y, 5, 1, C.wood3); k.rect(hx - 22, HEAD.top + 10, 1, HEAD.collar - HEAD.top - 22, C.wood1); k.rect(hx - 18, HEAD.top + 10, 1, HEAD.collar - HEAD.top - 22, C.wood1);
      k.rect(hx - 11, HEAD.top - 1, 22, 8, C.wood1); k.rect(hx - 11, HEAD.top - 1, 22, 1, C.wood3);

      /* ---- Winding house (steam hoist) ---- */
      Props.building(k, 136, 24, { w: 46, h: 30, roofH: 14, style: 'gable', roof: C.slate1, wall: C.terra2, mat: 'brick', windows: [], door: { x: 26, w: 11, h: 15, color: C.wood2 }, chimney: { x: 34, h: 18 } });
      k.rect(137, 2, 8, 8, '#1a1210'); k.circle(141, 6, 3, C.stone1); k.px(141, 6, C.stone3);
      // Coal heap for the boiler and a water barrel.
      oreHeap(k, 156, 50, 14, 6, ORE.coal, 12); Props.barrel(k, 176, 38); k.line(164, 44, 170, 34, C.wood3); k.rect(168, 32, 5, 3, C.stone2);

      /* ---- Quarry block yard with a timber derrick ---- */
      k.at(22, 0, () => {   // kept inside the hexagon's cut corner
      k.rect(-186, 60, 70, 70, '#9a8a74'); k.dither(-186, 60, 70, 70, C.stone3, 1);
      block(k, -174, 128, 16, 9); block(k, -164, 128, 14, 9); block(k, -180, 116, 14, 8); block(k, -148, 126, 12, 8); block(k, -140, 104, 14, 9); block(k, -124, 126, 8, 6);
      for (let i = 0; i < 16; i++) k.px(-184 + P.hash(i, 51) * 66, 64 + P.hash(i, 52) * 60, i % 2 ? C.stone4 : C.stone1);
      k.rect(-172, 52, 3, 50, C.wood1); k.rect(-172, 52, 1, 50, C.wood3); k.line(-170, 56, -130, 70, C.wood2, 2); k.line(-170, 56, -130, 70, C.wood4, 1);
      k.line(-172, 52, -186, 100, C.wood1); k.line(-170, 52, -156, 100, C.wood1); k.rect(-175, 96, 10, 5, C.wood2);
      k.rect(-131, 70, 1, 14, C.stone0); block(k, -136, 92, 11, 6, 3);
      k.rect(-176, 88, 7, 7, C.wood0); k.circle(-173, 91, 3, C.wood2); k.px(-173, 91, C.stone3);
      });

      /* ---- Lamp house and miners' bench ---- */
      Props.building(k, -102, 106, { w: 50, h: 26, roofH: 14, roof: C.terra1, wall: C.plaster1, mat: 'timber', windows: [{ x: 6, y: 7, w: 8, h: 8 }, { x: 36, y: 7, w: 8, h: 8 }], door: { x: 20, w: 10, h: 14, color: C.teal1 }, sign: { x: 38, y: -2, text: 'LAMP', color: C.teal1 } });
      for (let i = 0; i < 4; i++) { k.rect(-98 + i * 11, 110, 1, 1, C.shadow); }
      Props.bench(k, -98, 126, 20); Props.bench(k, -72, 126, 18); Props.barrel(k, -48, 112); k.rect(-47, 110, 8, 2, C.stone2);
      for (let i = 0; i < 3; i++) { k.rect(-46 + i * 6, 126, 5, 3, C.gold2); k.rect(-46 + i * 6, 125, 5, 1, C.gold3); }

      /* ---- Ore wagons, crates and a weigh scale near the entrance ---- */
      Props.cart(k, 34, 108, (q, x, y) => oreHeap(q, x + 11, y + 1, 9, 5, ORE.copper, 21));
      Props.cart(k, 76, 116, (q, x, y) => oreHeap(q, x + 11, y + 1, 9, 5, ORE.iron, 22));
      Props.crate(k, 116, 100); Props.crate(k, 124, 108, 8); Props.sack(k, 110, 118, C.plaster1); Props.sack(k, 100, 124, '#b8a276');
      k.rect(44, 80, 26, 4, C.stone1); k.rect(44, 80, 26, 1, C.stone3); k.rect(55, 64, 2, 16, C.stone0); k.rect(48, 62, 16, 3, C.slate2); k.circle(56, 70, 4, C.paper); k.line(56, 70, 58, 67, C.red1);
      // Spoil heap in the south-east corner.
      k.ellipse(166, 118, 22, 12, C.stone1); k.ellipse(163, 114, 18, 10, C.stone2); k.ellipse(158, 110, 11, 6, C.stone3); k.dither(146, 104, 40, 22, C.stone0, 1);
      for (let i = 0; i < 12; i++) lump(k, 146 + P.hash(i, 61) * 38, 104 + P.hash(i, 62) * 20, ORE.stone);
      Props.sign(k, 28, 138, 'MINE', C.slate2);
      for (const [x, y] of [[-178, 58], [178, 86], [-110, 136]]) Props.bush(k, x, y, 1);
      // Lantern posts along the rails and apron.
      lanternPost(k, RAIL.x - 18, 0); lanternPost(k, RAIL.x + 14, -28); lanternPost(k, 60, 8); lanternPost(k, -20, 98);
      Props.rock(k, -110, -20, 1, 3); Props.rock(k, -100, 40, 0, 1); Props.rock(k, 128, 70, 1, 2); Props.rock(k, 20, -30, 0, 4);
      // Pit-prop timbers stacked for shoring, and a rack of spare rails.
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { const x = -134 + i * 6 + r * 3, y = -18 - r * 5; k.circle(x, y, 3, C.wood1); k.circle(x, y, 2, C.wood4); k.px(x, y, C.wood2); }
      k.rect(136, -44, 40, 2, C.stone1); k.rect(136, -40, 40, 2, C.stone1); k.rect(136, -44, 40, 1, C.stone4); k.rect(136, -40, 40, 1, C.stone4); k.rect(138, -46, 2, 10, C.wood1); k.rect(170, -46, 2, 10, C.wood1);
      Props.barrel(k, -108, 0); Props.barrel(k, -96, 4); k.rect(-106, -2, 6, 1, C.red1);
      for (let i = 0; i < 3; i++) block(k, 16 + i * 10, -22, 8, 5, 3);
      function logEnds(q, x, y) { q.circle(x, y, 3, C.wood1); q.circle(x, y, 2, C.wood4); q.px(x, y, C.wood2); }
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error';
      const dim = (s, x, y) => { k.blit(s, x, y); if (!live) k.blit(P.tint(s, '#141c3c'), x, y, false, .4); };

      /* Minecart: out of the adit loaded, tips at the bin, returns empty into the dark. */
      const cp = (t / 12) % 1; let cy, load = '';
      if (run) { if (cp < .35) { cy = RAIL.top + (cp / .35) * (RAIL.end - RAIL.top); load = 'silver'; } else if (cp < .5) { cy = RAIL.end; load = cp < .42 ? 'silver' : ''; } else if (cp < .85) { cy = RAIL.end - ((cp - .5) / .35) * (RAIL.end - RAIL.top); } else cy = RAIL.top; }
      else cy = RAIL.end;
      if (wait) load = 'copper';
      if (!err) {
        dim(cartSprite(load), RAIL.x, cy);
        if (run && cp >= .35 && cp < .45) for (let i = 0; i < 5; i++) { const q = (t * 3 + i / 5) % 1; lump(k, RAIL.x - 6 + i * 3, cy + 2 + q * 12, ORE.silver); }
        if (cy < ADIT.y + 4) k.alpha(Math.min(.85, (ADIT.y + 4 - cy) / 14), () => k.rect(ADIT.x - 12, ADIT.y - ADIT.h + 1, ADIT.w - 2, ADIT.h - 1, '#120c0a'));
      } else {
        // Derailed cart tipped beside the track, ore spilled across the sleepers.
        k.blit(cartSprite('iron'), RAIL.x + 14, 12, true); k.blit(debris(), RAIL.x, 18);
      }

      /* Lift cage and sheave. */
      const hp = (t / 8) % 1; let yb = HEAD.collar, sheave = 0;
      if (run) { if (hp < .3) yb = HEAD.collar; else if (hp < .5) yb = HEAD.collar + (hp - .3) / .2 * 30; else if (hp < .7) yb = HEAD.collar + 30; else if (hp < .9) yb = HEAD.collar + 30 - (hp - .7) / .2 * 30; sheave = hp >= .3 && hp < .5 ? Math.floor(t * 12) % 6 : hp >= .7 && hp < .9 ? 5 - Math.floor(t * 12) % 6 : 0; }
      if (err) yb = HEAD.collar - 34; // stuck high in the frame
      const cageLoad = run ? (hp < .12 || hp >= .9 ? 'coal' : '') : wait ? 'jade' : '';
      k.line(HEAD.x, HEAD.top + 9, HEAD.x, yb - CAGE_H - 2, C.ink); k.line(HEAD.x + 9, HEAD.top, 142, 4, C.ink);
      k.c.save(); k.c.beginPath(); k.c.rect(HEAD.x - 30, -200, 60, 200 + HEAD.collar); k.c.clip();
      dim(cageSprite(cageLoad), HEAD.x, Math.round(yb));
      k.c.restore();
      dim(sheaveSprite(sheave), HEAD.x, HEAD.top);
      if (err) { // Snapped cable whipping, sparks at the sheave, red lamp.
        const sw = Math.round(Math.sin(t * 9) * 4); k.line(HEAD.x + 9, HEAD.top, 118 + sw, -40, C.ink); k.line(118 + sw, -40, 124 + sw * 2, -20, C.ink);
        for (let i = 0; i < 6; i++) { const q = (t * 3.5 + i / 6) % 1, a = -2.6 + i * .7; k.px(HEAD.x + Math.cos(a) * (4 + q * 14), HEAD.top + Math.sin(a) * (4 + q * 8) + q * q * 16, q < .5 ? C.gold4 : C.red3); }
      }

      /* Smoke: boiler stack while working, black smoke and adit dust cloud on error. */
      if (run) Props.smoke(k, 172, -44, t, 5, '#d8d4cc');
      else if (state === 'idle' || wait) Props.smoke(k, 172, -44, t * .4, 2, '#d8d4cc');
      if (err) { Props.smoke(k, 172, -44, t * 1.2, 5, '#4a4644'); for (let i = 0; i < 4; i++) { const q = (t * .5 + i / 4) % 1; k.alpha((1 - q) * .7, () => k.circle(ADIT.x - 8 + (i * 7) % 18 + q * 8, ADIT.y - 6 - q * 18, 3 + q * 4, '#9a948a')); }
        k.blit(rockfall(), ADIT.x, ADIT.y + 4); }

      /* Hold markers for waiting: loaded tubs queued, overflow heap, amber flag with HOLD board. */
      if (wait) {
        for (let i = 0; i < 2; i++) k.blit(cartSprite(i ? 'iron' : 'coal'), RAIL.x, RAIL.end - 14 - i * 14);
        k.blit(holdHeaps(), 70, 38);
        k.rect(HEAD.x + 22, -30, 2, 30, C.wood1); k.poly([[HEAD.x + 24, -30], [HEAD.x + 36, -26], [HEAD.x + 24, -22]], C.waiting);
        k.rect(RAIL.x + 12, -12, 28, 11, C.ink); k.rect(RAIL.x + 13, -11, 26, 9, C.waiting); k.text('HOLD', RAIL.x + 19, -9, C.ink);
      }

      if (live) for (const x of [-96, -66]) { k.rect(x, 87, 8, 8, C.glassLit); k.rect(x + 4, 87, 1, 8, C.wood1); k.rect(x, 91, 8, 1, C.wood1); k.rect(x, 93, 8, 2, '#f0b862'); Props.windowGlow(k, x, 87, 8, 8, t); }
      if (live) k.alpha(.5 + .2 * Math.sin(t * 5), () => k.rect(138, 3, 6, 6, run ? '#f07a32' : '#b85a2a'));
      /* Lanterns: warm when live, dark when off; the signal lamp on the headframe shows the state. */
      for (const [x, y] of [[ADIT.x - 18, ADIT.y - ADIT.h - 2], [ADIT.x + 14, ADIT.y - ADIT.h - 2], [RAIL.x - 14, -18], [RAIL.x + 18, -46], [64, -10], [-16, 80], [-38, 4], [52, 4]])
        lantern(k, x, y, live, C.glassLit);
      const sig = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      k.rect(HEAD.x - 26, -46, 9, 9, C.ink); k.rect(HEAD.x - 25, -45, 7, 7, sig); if (live) k.px(HEAD.x - 25, -45, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(HEAD.x - 21, -41, 8, sig));

      /* Crew. */
      if (run) {
        z.crew(-150, -38, { ...hatted(0), anim: 'work', tool: 'pick', facing: -1, speed: 5, phase: .1 });
        if (z.detail) for (let i = 0; i < 3; i++) { const q = (t * 1.5 + i / 3) % 1; k.alpha(1 - q, () => k.px(-160 - q * 6, -52 + q * 6 - i, C.stone4)); }
        const my = Math.max(cy, -30); z.crew(RAIL.x + 14, my + 4, { ...hatted(1), anim: cp < .35 || (cp >= .5 && cp < .85) ? 'walk' : 'idle', phase: .3 });
        z.crew(0, 76, { ...hatted(2), anim: 'work', tool: 'hammer', phase: .5 });
        z.crew(-28, 74, { ...hatted(4), anim: 'work', tool: 'pick', facing: 1, speed: 4, phase: .9 });
        const hp2 = (t * .09) % 1, back = hp2 > .5, q = back ? (1 - hp2) * 2 : hp2 * 2;
        z.crew(96 - q * 30, 20 + q * 44, { ...hatted(3), anim: 'walk', carry: back ? '' : 'ore', facing: back ? 1 : -1, phase: .2 });
        z.crew(128, 30, { ...hatted(5), anim: 'work', phase: .7, speed: 3 });
      } else if (state === 'idle') {
        // Shift break: miners sit outside the lamp house, the hoist and cart stand still.
        z.crew(-90, 124, { ...hatted(0), anim: 'sit', phase: .1 }); z.crew(-80, 124, { ...hatted(2), anim: 'sit', facing: -1, phase: .5 });
        z.crew(-64, 124, { ...hatted(4), anim: 'sit', phase: .8 }); z.crew(RAIL.x + 14, 30, { ...hatted(1), anim: 'idle', phase: .3 });
        z.crew(128, 30, { ...hatted(5), anim: 'sit', phase: .7 }); z.crew(80, 22, { ...hatted(3), anim: 'idle', facing: -1, phase: .2 });
        if (z.detail) { for (let i = 0; i < 2; i++) Props.bird(k, -60 + ((t * 12 + i * 120) % 260) - 60, -136 + i * 6 + Math.sin(t + i) * 3, t + i); Props.butterfly(k, -150 + Math.sin(t * .7) * 20, 90 + Math.cos(t * 1.4) * 8, t); }
      } else if (live) {
        z.crew(-150, -38, { ...hatted(0), anim: 'idle', tool: 'pick', facing: -1, phase: .1 });
        z.crew(RAIL.x + 14, 34, { ...hatted(1), anim: err ? 'cheer' : 'idle', phase: .3 });
        z.crew(0, 76, { ...hatted(2), anim: 'idle', phase: .5 }); z.crew(-28, 74, { ...hatted(4), anim: 'idle', tool: 'pick', phase: .9 });
        z.crew(80, 22, { ...hatted(3), anim: err ? 'cheer' : 'idle', facing: -1, phase: .2 }); z.crew(128, 30, { ...hatted(5), anim: 'idle', phase: .7 });
      } else {
        z.crew(-90, 124, { ...hatted(0), phase: .1 }); z.crew(-78, 124, { ...hatted(2), facing: -1, phase: .5 }); z.crew(-64, 124, { ...hatted(4), phase: .8 });
        z.crew(128, 30, { ...hatted(5), phase: .7 }); z.crew(RAIL.x + 14, 30, { ...hatted(1), phase: .3 }); z.crew(-30, 90, { ...hatted(3), phase: .2 });
      }
    }
  };
})();
