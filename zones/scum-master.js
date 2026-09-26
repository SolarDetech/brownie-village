/* Head Chef · The Sprint Kitchen: Scrum as a strict fine-dining brigade. Order tickets ride the rail over the pass
   (TODO → DOING → REVIEW → DONE); the chef inspects every fusion plate under the heat lamps and waiters carry the
   approved plates out to a white-tablecloth terrace. Spotless steel kitchen under a blue digital clock and an
   EVERY SECOND COUNTS sign, a pantry (the backlog), a service board with the burndown where the brigade lines up,
   a reflecting pool, staff table, a star plaque at the entrance and a grand et döner stand in the bottom-left corner. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns['scum-master'] = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const mod = (a, n) => ((a % n) + n) % n;
  const LEAD = { x: 46, y: -24 }, REST = { x: -34, y: 86 };  // at the pass; dozing by the staff table when off
  const KX = -112, KW = 120;                                  // kitchen hall (open front), ground at y -50
  const R0 = -106, RW = 48, BURN = [-100, -88, -76, -64];     // steel range and its four burners (top at y -100)
  const CLK = { x: -69, y: -131 };                            // top-left of the first clock digit
  const SIGN = { x: -93, y: -117, w: 83, h: 9 };              // EVERY SECOND COUNTS
  const PX = 26, PW = 126;                                    // pass building, ground at y -46
  const RAIL = { x: 34, y: -109, cw: 27 };                    // ticket rail: four columns
  const LAMPS = [61, 97, 130];                                // heat lamps; [1] hangs over the REVIEW plate
  const BELL = { x: 112, y: -63 }, BEACON = { x: 30, y: -76 };
  const BOARD = { x: -104, y: -26, w: 56, h: 32 };            // service board + burndown
  const STAFF = { x: -84, y: 76, w: 40 };                     // staff table
  const POOL = { x: -18, y: 36, w: 46, h: 22 };               // reflecting pool
  const TABLES = [{ x: 74, y: 30 }, { x: 154, y: 24 }, { x: 88, y: 92 }, { x: 146, y: 98 }];
  const STAGE = ['TODO', 'DOING', 'REVIEW', 'DONE'], STC = [C.slate2, C.teal2, C.gold1, C.leaf2];
  const ST = { hi: '#eef2f6', base: '#bcc4ce', sh: '#8e98a4', dk: '#5a6470' };           // brushed steel
  const TOQ = '#f6f4ee', TOQD = '#d4d0c6';
  const TILE = '#e6eef2', GROUT = '#b8c8d2';
  const SEG = { on: '#86d6ff', glow: '#3a8ac8', ghost: '#18222c', red: '#ff5a48' };
  const DN = { x0: -158, x1: -96, spx: -138 };                 // grand döner stand (bottom left); counter top at y 88

  /* ---------- Small sprites ---------- */
  const TIX = [C.white, '#f2ecd8', '#e6eef2', '#f6e2da'];
  const ticketSprite = i => P.sprite('sk|tix|' + i, 6, 9, 0, 0, q => {
    q.rect(0, 1, 6, 8, TIX[i]); q.rect(0, 8, 6, 1, S(TIX[i], -.15)); q.rect(0, 1, 1, 7, S(TIX[i], .3)); q.rect(2, 0, 2, 2, ST.sh);
    q.rect(1, 3, 4, 1, '#6a6a70'); q.rect(1, 5, 3, 1, '#9a9aa0'); q.px(4, 7, STC[i]);
  });
  // Fusion plates on big white plates: 0 sushi taco, 1 ramen burger, 2 kebab bao, 3 doner sushi roll, 4 dumplings with microgreens.
  const plateSprite = kind => P.sprite('sk|fplate|' + kind, 17, 9, 8, 6, q => {
    q.ellipse(0, -1, 7, 2, '#d4d0c8'); q.ellipse(0, -2, 7, 2, C.white); q.ellipse(0, -2, 5, 1, '#f6f4ee'); q.px(-5, -3, C.white);
    const dot = (x, y, c) => q.px(x, y, c);
    if (kind === 0) {
      q.rect(-3, -4, 6, 2, '#d8a050'); q.rect(-3, -4, 6, 1, '#f0c878'); q.px(-3, -3, '#b88038');
      q.rect(-2, -5, 2, 1, '#f08a6a'); q.px(0, -5, '#f4a888'); q.px(1, -5, C.leaf4); q.px(2, -5, '#6ab04a'); q.px(-1, -6, C.leaf5);
      dot(4, -2, C.red2); dot(5, -2, C.red3); dot(-5, -2, '#3a2a1a');
    } else if (kind === 1) {
      q.rect(-2, -3, 5, 1, '#e8c060'); q.rect(-2, -4, 5, 1, '#5a2e18'); q.px(-2, -4, C.leaf4); q.px(2, -4, C.red2);
      q.rect(-2, -6, 5, 2, '#f0c870'); q.px(-1, -6, '#fff0b8'); q.px(1, -5, '#d8a048');
      q.line(-6, -2, -4, -3, '#8a2a24'); dot(4, -2, C.gold2); dot(5, -3, C.gold2);
    } else if (kind === 2) {
      q.rect(-3, -4, 6, 2, '#f6f2e8'); q.rect(-3, -5, 5, 1, '#ece6d8'); q.rect(-2, -4, 4, 1, '#8a4a28'); q.px(-1, -5, C.red3); q.px(1, -5, C.leaf4);
      dot(4, -2, '#e8842a'); dot(5, -3, '#e8842a'); dot(-5, -2, C.leaf3);
    } else if (kind === 3) {
      for (let i = 0; i < 3; i++) { const x = -4 + i * 3; q.rect(x, -4, 2, 2, '#1e2e28'); q.px(x, -4, '#f8f8f0'); q.px(x + 1, -3, '#9a5a30'); }
      q.px(4, -3, '#f4a0a8'); q.px(4, -4, '#f4a0a8'); q.line(-5, -1, -2, -1, '#c8a040');
    } else {
      for (let i = 0; i < 3; i++) { const x = -3 + i * 3; q.rect(x, -4, 2, 2, '#efe4c8'); q.px(x, -4, C.white); q.px(x + 1, -5, C.leaf5); }
      q.px(-1, -6, C.leaf4); dot(4, -2, '#2a2020'); dot(-5, -2, '#5aa04a'); q.line(-4, -1, -1, -1, '#7ab85a');
    }
  });
  // White-tablecloth table; seats bit 1 = left chair, 2 = right chair. 'closed' = chairs upside down on the cloth, dimmed for the night.
  const WD = '#4a2e20', WDH = '#6e4832', CUSH = '#e8e0d0', CL = '#f8f6f0', CLD = '#d8d6d0';
  const tableSprite = (mode, seats) => P.sprite(`sk|ftbl|${mode}|${seats}`, 40, 30, 20, 25, q => {
    const chair = (s, lift) => {
      const cx = s * 12;
      if (lift) { q.rect(cx - 3, -15, 7, 1, CUSH); q.rect(cx - 3, -14, 7, 1, WD); q.rect(cx - 3, -21, 1, 6, WD); q.rect(cx + 3, -21, 1, 6, WD); q.px(cx - 3, -21, WDH); q.rect(s < 0 ? cx - 4 : cx + 4, -14, 1, 5, WD); return; }
      q.rect(cx - 3, -6, 7, 2, CUSH); q.rect(cx - 3, -6, 7, 1, C.white); q.rect(cx - 3, -4, 1, 4, WD); q.rect(cx + 3, -4, 1, 4, WD);
      const bx = s < 0 ? cx - 3 : cx + 3; q.rect(bx, -14, 1, 9, WD); q.rect(s < 0 ? bx : bx - 1, -14, 2, 1, WDH); q.rect(s < 0 ? bx + 1 : bx - 1, -12, 1, 5, CUSH);
    };
    q.ellipse(1, 0, 12, 2, C.shadow);
    if (mode !== 'closed') { if (seats & 1) chair(-1); if (seats & 2) chair(1); }
    q.rect(-9, -10, 19, 10, CL); q.rect(-9, -10, 1, 10, C.white); q.rect(7, -10, 3, 10, CLD); for (const x of [-6, -2, 2, 5]) q.rect(x, -7, 1, 7, CLD); q.rect(-9, -1, 19, 1, '#c4c2bc');
    q.ellipse(0, -10, 9, 3, CL); q.ellipse(-1, -11, 6, 2, C.white);
    if (mode === 'closed') {
      chair(-1, 1); chair(1, 1);
      q.c.globalCompositeOperation = 'source-atop'; q.c.fillStyle = '#141c3c61'; q.c.fillRect(-30, -40, 70, 50); q.c.globalCompositeOperation = 'source-over';
      return;
    }
    for (const gx of [-6, 6]) { q.rect(gx, -14, 2, 2, '#dcecf2'); q.px(gx, -14, C.white); q.px(gx + 1, -13, '#8a2436'); q.px(gx, -12, '#c8d4da'); }
    q.rect(-1, -14, 2, 3, '#e8e2d0'); q.px(-1, -14, C.white); q.px(0, -11, ST.sh);
  });

  // The grand et döner: a tall cone of stacked beef with a tomato and a green pepper on the skewer tip. DF frames
  // turn it by two crust ridges, so the loop is seamless. Anchor = top of the skewer; the meat spans rows 6–43.
  const MEATC = [['#4a2412', '#6e3818', '#94522a', '#b86e3a', '#d8955a', '#e8b884'], ['#1a100a', '#2a1a10', '#3a2616', '#4e3420', '#6a482c', '#6a482c']];
  const DF = 12, DSEG = Math.PI / 7;
  const donerHW = r => Math.round(14 - r * 6 / 37) - (r === 0 ? 3 : r === 1 ? 1 : 0);
  const donerSprite = (f, burnt) => P.sprite(`sk|doner|${f}|${burnt ? 1 : 0}`, 30, 46, 15, 0, q => {
    const M = MEATC[burnt ? 1 : 0], rot = f / DF * 2 * DSEG;
    q.rect(0, 0, 1, 6, ST.hi);
    q.circle(-2, 3, 2, burnt ? '#5a1a14' : C.red2); q.px(-3, 2, burnt ? '#7a2a20' : '#ff9a8a');
    q.rect(1, 2, 3, 4, burnt ? '#2a3a1a' : C.leaf2); q.px(1, 2, burnt ? '#3a4a2a' : C.leaf4); q.px(2, 1, C.leaf1);
    for (let r = 0; r < 38; r++) {
      const hw = donerHW(r), layer = r >> 1;
      for (let x = -hw; x <= hw; x++) {
        const u = x / (hw + .5), th = Math.asin(u) + rot, sg = Math.floor(th / DSEG), fr = th / DSEG - sg;
        let tone = 3.4 - (u + 1) * 1.5 + (P.hash(layer, sg & 1) - .5) * 1.2;
        if (fr < .22) tone -= 1.2;
        if (r < 2) tone += .8; else if (r > 34) tone -= .8; else if (r % 3 === 2) tone -= .7;
        const fat = r % 3 === 0 && P.hash(layer * 3 + (sg & 1), 7) > .6 && fr > .45 && Math.abs(u) < .85;
        q.px(x, r + 6, fat ? M[5] : M[Math.max(0, Math.min(4, Math.round(tone)))]);
      }
    }
  });

  /* ---------- Static helpers ---------- */
  const flags = (k, x, y, w, h, base = '#d8d2c2') => k.rectTex(x, y, w, h, (xx, yy) => {
    const r = yy + 200, row = Math.floor(r / 8), c = xx + 400 + (row % 2) * 6;
    if (r % 8 === 7 || c % 12 === 0) return S(base, -.13);
    const q = P.hash(Math.floor(c / 12), row); return q < .18 ? S(base, .08) : q > .88 ? S(base, -.05) : base;
  });
  const PROD = { tomato: [C.red2, C.red3], cabbage: [C.leaf3, C.leaf4], carrot: ['#e8842a', '#f4a850'], aubergine: [C.plum1, C.plum3], lemon: [C.gold2, C.gold4], potato: [C.dirt2, C.dirt4], onion: ['#c89a6a', '#ecd0a0'] };
  function vegCrate(k, x, y, kind) {
    const [a, b] = PROD[kind];
    k.rect(x + 2, y + 7, 13, 2, C.shadow);
    for (let i = 0; i < 6; i++) { const px = x + 1 + i * 2, py = y - 1 - (i % 2); k.rect(px, py, 3, 3, a); k.px(px, py, b); }
    if (kind === 'carrot') for (let i = 0; i < 4; i++) k.px(x + 2 + i * 3, y - 3, C.leaf3);
    k.rect(x, y + 1, 14, 6, C.wood3); k.rect(x, y + 1, 14, 1, C.wood5); k.rect(x, y + 4, 14, 1, C.wood2); k.rect(x, y + 1, 1, 6, C.wood4); k.rect(x + 13, y + 1, 1, 6, C.wood1); k.rect(x, y + 6, 14, 1, C.wood1);
    k.rect(x + 4, y + 2, 6, 2, C.white); k.rect(x + 5, y + 3, 3, 1, '#8a8a90');
  }
  function cheeses(k, x, y, n = 3) {
    k.ellipse(x + 6, y + 1, 8, 2, C.shadow);
    for (let i = 0; i < n; i++) { const yy = y - i * 4; k.ellipse(x + 5, yy - 1, 6, 2, '#c8902a'); k.rect(x - 1, yy - 3, 13, 2, '#e0a83a'); k.ellipse(x + 5, yy - 3, 6, 2, '#f4d070'); k.px(x + 3, yy - 4, '#fff0b0'); k.px(x + 9, yy - 2, '#a87020'); }
  }
  function bin(k, x, y) {
    k.ellipse(x + 5, y + 1, 6, 2, C.shadow); k.rect(x, y - 11, 10, 11, ST.base); k.rect(x, y - 11, 2, 11, ST.hi); k.rect(x + 8, y - 11, 2, 11, ST.sh);
    for (const yy of [-9, -3]) k.rect(x, y + yy, 10, 1, ST.dk);
    k.ellipse(x + 5, y - 12, 6, 2, ST.sh); k.ellipse(x + 5, y - 13, 5, 1, ST.hi); k.rect(x + 4, y - 15, 3, 1, ST.dk);
  }
  function topiary(k, x, y) {
    k.ellipse(x + 2, y + 1, 7, 2, C.shadow); k.rect(x - 4, y - 7, 9, 7, ST.dk); k.rect(x - 4, y - 7, 9, 1, ST.hi); k.rect(x - 4, y - 6, 2, 6, ST.sh);
    k.rect(x, y - 10, 1, 3, C.wood1); k.circle(x, y - 14, 5, C.leaf1); k.circle(x - 1, y - 15, 4, C.leaf2); k.circle(x - 2, y - 16, 2, C.leaf3); k.px(x - 3, y - 17, C.leaf4);
  }
  // Star plaque by the entrance: a red enamel plate with three white flower-stars.
  function starPlaque(k, x, y) {
    k.rect(x - 1, y + 12, 2, 14, ST.dk); k.ellipse(x + 1, y + 26, 5, 1, C.shadow); k.rect(x - 3, y + 25, 7, 1, ST.sh);
    k.rect(x - 14, y - 1, 29, 13, C.ink); k.rect(x - 13, y, 27, 11, '#b01e28'); k.rect(x - 13, y, 27, 1, '#d8404a'); k.rect(x - 12, y + 1, 25, 1, '#c82e38'); k.rect(x - 13, y + 10, 27, 1, '#7a1018');
    const star = (sx, sy) => ['..#..', '#####', '.###.', '.#.#.', '#...#'].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') k.px(sx + i, sy + j, C.white); });
    for (let i = 0; i < 3; i++) star(x - 10 + i * 8, y + 3);
  }
  // 3x5 capitals with a wider N so SECOND and COUNTS read cleanly.
  const NG = ['1001', '1101', '1011', '1001', '1001'];
  function signText(k, str, x, y, col) { let xx = x; for (const ch of str) { if (ch === 'N') { NG.forEach((r, j) => { for (let i = 0; i < 4; i++) if (r[i] === '1') k.px(xx + i, y + j, col); }); xx += 5; } else { k.text(ch, xx, y, col); xx += 4; } } }
  // 7-segment digit (7x11 with a slight italic lean): bits a b c d e f g.
  const DIG = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
  function digit(k, x, y, bits, col) {
    if (bits & 1) k.rect(x + 2, y, 4, 1, col); if (bits & 2) k.rect(x + 6, y + 1, 1, 4, col); if (bits & 4) k.rect(x + 5, y + 6, 1, 4, col);
    if (bits & 8) k.rect(x + 1, y + 10, 4, 1, col); if (bits & 16) k.rect(x, y + 6, 1, 4, col); if (bits & 32) k.rect(x + 1, y + 1, 1, 4, col); if (bits & 64) k.rect(x + 1, y + 5, 5, 1, col);
  }
  const DX = [0, 8, 20, 28];
  function lampCone(k, x, col, a) { k.alpha(a * .45, () => k.poly([[x - 4, -80], [x + 4, -80], [x + 10, -65], [x - 10, -65]], col)); k.alpha(Math.min(1, a * 3), () => { k.ellipse(x, -63, 10, 2, col); k.ellipse(x, -63, 6, 1, C.gold4); }); k.rect(x - 2, -80, 5, 1, C.gold4); }

  /* ---------- Animated helpers ---------- */
  const steam = (k, x, y, t, n = 3, h = 10, col = '#f6f6f2') => {
    for (let i = 0; i < n; i++) { const q = (t * .8 + i / n) % 1, sx = x + Math.round(Math.sin(q * 6 + i * 2) * 1.5); k.alpha((1 - q) * .8, () => k.circle(sx, y - Math.round(q * h), q < .5 ? 1 : 2, col)); }
  };
  const puffs = (k, x, y, t, n, cols, rise = 30, drift = 8) => {
    for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1; k.alpha((1 - q) * .85, () => k.circle(x + Math.sin(q * 5 + i * 1.7) * 4 + q * drift, y - q * rise, 2 + q * 5, cols[i % cols.length])); }
  };
  function pan(k, x, y, tilt, food) {
    k.line(x - 5, y - 1, x - 10, y - 2 - tilt, '#1a1a1e', 2);
    k.ellipse(x, y, 5, 2, '#2a2a30'); k.ellipse(x, y - 1 - (tilt > 1 ? 1 : 0), 4, 1, '#46464e');
    if (food) { k.px(x - 2, y - 1, food); k.px(x + 1, y - 1, food); k.px(x + 2, y - 2, S(food, .3)); }
  }
  function pot(k, x, y, lid, copper) {
    const b = copper ? '#d8804e' : ST.base, h = copper ? '#f4b080' : ST.hi, d = copper ? '#aa5a30' : ST.sh;
    k.rect(x - 4, y - 6, 9, 6, b); k.rect(x - 4, y - 6, 2, 6, h); k.rect(x + 3, y - 6, 2, 6, d); k.rect(x - 5, y - 5, 1, 2, d); k.rect(x + 5, y - 5, 1, 2, d);
    k.ellipse(x, y - 6 - lid, 4, 1, copper ? '#6e3218' : ST.dk); k.ellipse(x, y - 7 - lid, 3, 1, copper ? '#aa5a30' : ST.base); k.rect(x - 1, y - 9 - lid, 2, 1, '#26272c');
  }

  return {
    paint(k) {
      /* ---- Ground: tufts, pale stone slabs, the entrance path ---- */
      for (let i = 0; i < 70; i++) Props.tuft(k, -186 + P.hash(i, 3) * 372, -146 + P.hash(i, 9) * 284, C.grass1, C.grass4);
      k.rect(-110, -52, 148, 186, C.stone3); k.rect(24, -48, 132, 44, C.stone3);
      flags(k, -108, -50, 144, 182); flags(k, 26, -46, 128, 40);
      k.polyTex([[-16, 130], [16, 130], [18, 141], [-18, 141]], (x, y) => (x === -12 || x === 11) ? C.stone2 : P.hash(x >> 1, y >> 1) < .15 ? C.stone4 : '#d0c8b4');

      /* ---- Pantry (the backlog): whitewashed cold store, labelled stock in neat rows ---- */
      k.at(24, 0, () => {   // narrowed and moved in from the hexagon edge
      Props.building(k, -186, -58, { w: 50, h: 38, roofH: 18, roof: C.slate2, wall: '#e4e2da', mat: 'plaster', foundation: 3, door: { x: 7, w: 15, h: 22, color: ST.sh, open: true }, windows: [{ x: 36, y: 9, w: 8, h: 8 }] });
      k.rect(-178, -79, 13, 21, '#2a3038'); k.dither(-178, -79, 13, 21, '#3a424c', 1);
      for (const sy of [-74, -67]) { k.rect(-178, sy, 13, 1, ST.base); k.rect(-178, sy + 1, 13, 1, ST.dk); }
      [[-177, -77, C.red2], [-174, -77, C.gold2], [-171, -77, '#6a9a4a'], [-168, -77, C.plum3], [-177, -70, C.gold1], [-173, -70, C.paper], [-169, -70, C.red1]].forEach(([x, y, c]) => { k.rect(x, y, 2, 3, c); k.px(x, y, S(c, .4)); k.px(x + 1, y + 2, C.white); });
      k.rect(-172, -93, 29, 8, C.ink); k.rect(-171, -92, 27, 6, '#1c2c54'); k.rect(-171, -92, 27, 1, '#34487a'); k.text('PANTRY', -170, -91, C.white);
      k.rect(-160, -84, 12, 1, ST.dk); for (let i = 0; i < 4; i++) { k.circle(-158, -81 + i * 3, 1, C.paper); k.px(-157, -81 + i * 3, C.paper2); }
      for (const hx of [-154, -150]) { k.rect(hx, -83, 1, 2, ST.dk); k.poly([[hx - 2, -81], [hx + 3, -81], [hx + 1, -74], [hx, -74]], hx === -154 ? C.leaf2 : '#6a8a78'); k.px(hx - 1, -80, C.leaf4); }
      });
      vegCrate(k, -184, -56, 'tomato'); vegCrate(k, -169, -56, 'cabbage'); vegCrate(k, -154, -56, 'carrot');
      vegCrate(k, -184, -44, 'aubergine'); vegCrate(k, -169, -44, 'lemon'); vegCrate(k, -154, -44, 'onion');
      for (const [x, y] of [[-136, -52], [-128, -52], [-136, -42]]) { Props.sack(k, x, y, C.plaster3); k.rect(x + 2, y + 2, 4, 2, C.white); }
      cheeses(k, -126, -34, 3); bin(k, -122, -54);
      Props.cart(k, -182, -4, (q, x, y) => { vegCrate(q, x + 1, y - 6, 'cabbage'); vegCrate(q, x + 8, y - 12, 'potato'); Props.sack(q, x + 15, y - 9, C.plaster3); });

      /* ---- Kitchen hall: spotless steel under the clock and the EVERY SECOND COUNTS sign ---- */
      Props.building(k, KX, -50, { w: KW, h: 90, roofH: 10, roof: C.slate2, wall: '#e8eae6', mat: 'plaster', foundation: 0 });
      const ix0 = KX + 4, iw = KW - 8;
      k.rectTex(ix0, -134, iw, 42, (x, y) => { const r = y + 134, row = Math.floor(r / 4), c = x + 400 + (row % 2) * 4; if (r % 4 === 3 || c % 8 === 0) return GROUT; return P.hash(c >> 3, row) < .12 ? '#f4f8fa' : TILE; });
      k.rect(ix0, -94, iw, 2, '#a8b8c4');
      k.rectTex(ix0, -92, iw, 42, (x, y) => { const r = y + 92, c = x + 400; if (r % 6 === 5 || c % 8 === 0) return '#a8b0b8'; return P.hash(c >> 3, r / 6 | 0) < .2 ? '#d8dee4' : '#ccd4dc'; });
      k.dither(ix0, -92, iw, 5, '#40505c', 1); k.dither(ix0, -134, iw, 2, '#40505c', 0);
      k.rect(ix0, -134, 2, 84, '#b8c0c4'); k.rect(ix0 + iw - 2, -134, 2, 84, '#c8d0d4');
      k.rect(KX - 1, -138, KW + 2, 4, ST.dk); k.rect(KX - 1, -138, KW + 2, 1, ST.hi);
      k.rect(KX, -52, KW, 3, C.stone4); k.rect(KX, -52, KW, 1, C.white); k.rect(KX, -50, KW, 1, C.stone2);
      k.rect(-78, -148, 8, 6, ST.base); k.rect(-78, -148, 2, 6, ST.hi); k.rect(-79, -150, 10, 2, ST.hi); k.rect(-79, -148, 10, 1, ST.dk);
      // The digital clock: black case, ghost segments (lit ones are animated), blinking colon.
      k.rect(-72, -131, 2, 1, C.shadow);
      k.rect(CLK.x - 5, CLK.y - 3, 46, 16, '#3a4048'); k.rect(CLK.x - 4, CLK.y - 2, 44, 14, '#0c0e12'); k.rect(CLK.x - 5, CLK.y - 3, 46, 1, '#5a626c'); k.rect(CLK.x - 5, CLK.y + 12, 46, 1, '#22262c');
      k.rect(CLK.x - 3, CLK.y + 14, 46, 1, '#a8b8c4');
      DX.forEach(dx => digit(k, CLK.x + dx, CLK.y, 0x7f, SEG.ghost));
      // The sign: dark navy with a thin light border and white capitals.
      const G = SIGN;
      k.rect(G.x + 1, G.y + G.h, G.w, 1, '#a8b8c4');
      k.rect(G.x, G.y, G.w, G.h, '#c8d4e4'); k.rect(G.x + 1, G.y + 1, G.w - 2, G.h - 2, '#16244a'); k.rect(G.x + 1, G.y + 1, G.w - 2, 1, '#22346a');
      signText(k, 'EVERY SECOND COUNTS', G.x + 3, G.y + 2, C.white);
      // Slim extraction canopy with an LED strip over the range.
      k.rect(R0 - 3, -108, RW + 6, 5, ST.base); k.rect(R0 - 3, -108, RW + 6, 1, ST.hi); k.rect(R0 - 3, -104, RW + 6, 1, ST.dk); k.rect(R0 - 1, -103, RW + 2, 1, '#fff4d8');
      for (let x = R0; x < R0 + RW; x += 6) k.px(x, -106, ST.sh);
      // Steel range: burner rings, control knobs, oven doors with bar handles.
      k.rect(R0 + 2, -78, RW, 2, C.shadow);
      k.rect(R0, -101, RW, 7, ST.sh); k.rect(R0, -101, RW, 1, ST.hi); k.rect(R0, -95, RW, 1, ST.dk);
      for (const bx of BURN) { k.ellipse(bx, -98, 4, 1, '#1a1c20'); k.ring(bx, -98, 4, 1, '#3a3e44'); }
      k.rect(R0, -94, RW, 15, ST.base); k.rect(R0, -94, 1, 15, ST.hi); k.rect(R0 + RW - 1, -94, 1, 15, ST.dk);
      for (const bx of BURN) { k.rect(bx - 1, -93, 2, 2, '#2a2c32'); k.px(bx - 1, -93, ST.hi); }
      for (const dx of [2, 25]) { k.rect(R0 + dx, -89, 21, 9, ST.hi); k.rect(R0 + dx, -89, 21, 1, C.white); k.rect(R0 + dx + 20, -89, 1, 9, ST.sh); k.rect(R0 + dx + 3, -88, 15, 1, ST.dk); k.rect(R0 + dx + 5, -85, 11, 3, '#2a2e36'); }
      k.rect(R0 + 1, -79, 3, 2, ST.dk); k.rect(R0 + RW - 4, -79, 3, 2, ST.dk);
      // Mise-en-place wall: magnetic knife strip, labelled jars, and the plating counter with bain-maries.
      k.rect(-54, -108, 30, 2, '#2a2e36'); for (let i = 0; i < 7; i++) { const x = -52 + i * 4; k.rect(x, -106, 1, 4, ST.hi); k.rect(x, -107, 1, 1, C.wood1); k.px(x + 1, -105, ST.sh); }
      k.rect(-20, -104, 24, 1, ST.base); k.rect(-20, -103, 24, 1, ST.dk);
      for (let i = 0; i < 6; i++) { const x = -19 + i * 4, c = [C.red2, C.gold2, C.leaf3, C.plum2, '#e8842a', C.paper][i]; k.rect(x, -109, 3, 5, '#dce8ee'); k.rect(x, -108, 3, 3, c); k.rect(x, -107, 3, 1, C.white); k.px(x + 1, -110, ST.dk); }
      k.rect(-56, -101, 60, 5, ST.base); k.rect(-56, -101, 60, 1, ST.hi); k.rect(-56, -97, 60, 1, ST.dk);
      for (let i = 0; i < 7; i++) { const x = -54 + i * 5, c = [C.leaf4, C.red3, C.gold3, '#f4a0a8', C.leaf2, '#e8842a', C.plum3][i]; k.rect(x, -101, 4, 2, ST.dk); k.rect(x, -101, 4, 1, c); }
      for (let i = 0; i < 4; i++) { k.rect(-18 + i * 3, -104, 2, 4, [C.red2, C.gold2, '#2a2020', C.leaf3][i]); k.px(-18 + i * 3, -105, C.white); }
      k.line(-4, -100, 0, -101, ST.hi); k.line(-4, -99, 0, -100, ST.sh);
      k.rect(-56, -96, 60, 16, ST.sh); k.rect(-56, -96, 60, 1, ST.hi); for (const dx of [1, 16, 31, 46]) { k.rect(-56 + dx, -94, 13, 13, ST.base); k.rect(-56 + dx, -94, 13, 1, ST.hi); k.rect(-52 + dx, -91, 5, 1, ST.dk); }
      k.rect(-56, -80, 60, 1, ST.dk);

      /* ---- The pass: ticket rail board, the hatch with heat lamps, the steel counter ---- */
      Props.building(k, PX, -46, { w: PW, h: 80, roofH: 14, roof: C.slate2, wall: '#e8eae6', mat: 'plaster', foundation: 0 });
      k.rect(31, -123, 118, 27, ST.dk); k.rect(32, -122, 116, 25, '#16181c'); k.rect(32, -122, 116, 1, '#2a2e34');
      STAGE.forEach((name, c) => {
        const x0 = RAIL.x + c * RAIL.cw;
        k.rect(x0, -120, 25, 8, C.ink); k.rect(x0 + 1, -119, 23, 6, STC[c]); k.rect(x0 + 1, -119, 23, 1, S(STC[c], .3));
        k.textCenter(name, x0 + 12, -118, C.white);
        if (c) k.rect(x0 - 1, -110, 1, 12, '#2a2e34');
      });
      k.rect(RAIL.x - 1, RAIL.y, 4 * RAIL.cw, 1, ST.hi); k.rect(RAIL.x - 1, RAIL.y + 1, 4 * RAIL.cw, 1, ST.dk); k.rect(RAIL.x - 2, RAIL.y - 1, 2, 3, ST.sh); k.rect(RAIL.x + 4 * RAIL.cw - 1, RAIL.y - 1, 2, 3, ST.sh);
      k.rect(32, -94, 116, 31, ST.dk); k.rect(34, -92, 112, 28, '#1a1e24'); k.dither(34, -92, 112, 28, '#262c34', 1);
      k.rect(34, -78, 112, 1, ST.sh); for (let x = 38; x < 144; x += 14) { for (let i = 0; i < 3; i++) k.rect(x, -80 - i * 2, 7, 1, i % 2 ? '#c8ccd0' : C.white); }
      for (const x of LAMPS) {
        k.rect(x, -92, 1, 6, '#0e1014');
        k.poly([[x - 2, -86], [x + 3, -86], [x + 5, -81], [x - 4, -81]], ST.sh); k.rect(x - 2, -86, 5, 1, ST.hi); k.rect(x - 4, -81, 10, 1, C.gold1);
        k.rect(x - 1, -80, 3, 1, '#3a3a40');
      }
      k.rect(PX + 2, -45, PW + 2, 2, C.shadow);
      k.rect(PX, -65, PW, 6, ST.base); k.rect(PX, -65, PW, 1, ST.hi); k.rect(PX, -60, PW, 1, ST.dk); for (let x = PX + 6; x < PX + PW; x += 16) k.px(x, -63, ST.hi);
      k.rectTex(PX, -59, PW, 12, (x, y) => (y + 59) % 4 === 3 || (x + ((y + 59) >> 2) * 3) % 8 === 0 ? GROUT : ((x >> 1) + y) % 9 === 0 ? '#f6fafc' : TILE);
      k.rect(PX, -47, PW, 1, ST.dk);
      k.ellipse(BELL.x, BELL.y + 1, 4, 1, ST.dk); k.ellipse(BELL.x, BELL.y - 1, 3, 2, ST.hi); k.px(BELL.x - 1, BELL.y - 2, C.white); k.rect(BELL.x, BELL.y - 4, 1, 1, ST.sh);
      k.ellipse(145, -63, 3, 1, ST.dk); k.rect(145, -74, 1, 11, ST.sh); for (let i = 0; i < 3; i++) { k.rect(142, -66 - i * 2, 7, 2, i % 2 ? '#e8e4d8' : C.white); k.px(145, -66 - i * 2, ST.dk); }
      k.rect(BEACON.x, BEACON.y + 3, 1, 8, ST.dk); k.rect(BEACON.x - 2, BEACON.y - 2, 5, 5, C.ink); k.rect(BEACON.x - 1, BEACON.y - 1, 3, 3, C.glassDark);
      // Wiping cloths folded on the counter ends, a stack of warm plates.
      k.rect(PX + 4, -66, 6, 2, C.white); k.rect(PX + 4, -65, 6, 1, '#c8d4dc');
      for (let i = 0; i < 4; i++) k.rect(76, -66 - i, 9, 1, i % 2 ? '#dcd8d0' : C.white);
      topiary(k, 14, -52);

      /* ---- Dish station (top right): steel sink, drying rack, a tree ---- */
      Props.tree(k, 176, -104, 'dark', 1, 2);
      k.at(-8, 0, () => {   // clear of the hexagon edge
      k.ellipse(170, -44, 14, 2, C.shadow);
      k.rect(160, -58, 20, 10, ST.base); k.rect(160, -58, 20, 1, ST.hi); k.rect(178, -58, 2, 10, ST.sh);
      k.rect(162, -58, 16, 3, ST.dk); k.ellipse(168, -57, 4, 1, C.foam); k.rect(161, -48, 2, 4, ST.dk); k.rect(177, -48, 2, 4, ST.dk); k.rect(169, -62, 1, 4, ST.hi); k.rect(169, -62, 4, 1, ST.hi);
      k.rect(182, -66, 1, 20, ST.dk); k.rect(186, -66, 1, 20, ST.dk); for (let i = 0; i < 4; i++) { k.rect(181, -64 + i * 4, 7, 3, C.white); k.rect(181, -62 + i * 4, 7, 1, '#d8d6d0'); }
      });
      topiary(k, 160, -32);

      /* ---- Service board with the sprint burndown (the stand-up spot) ---- */
      const B = BOARD;
      k.ellipse(B.x + B.w / 2 + 2, B.y + B.h + 9, 32, 2, C.shadowSoft);
      k.rect(B.x + 5, B.y + B.h, 2, 9, ST.dk); k.rect(B.x + B.w - 7, B.y + B.h, 2, 9, ST.dk);
      k.rect(B.x - 2, B.y - 2, B.w + 4, B.h + 4, ST.dk); k.rect(B.x - 1, B.y - 1, B.w + 2, B.h + 2, ST.base); k.rect(B.x - 1, B.y - 1, B.w + 2, 1, ST.hi);
      k.rect(B.x, B.y, B.w, B.h, '#1a1e24'); k.dither(B.x, B.y, B.w, B.h, '#22272e', 1);
      k.text('MENU', B.x + 3, B.y + 3, C.white); k.rect(B.x + 3, B.y + 9, 15, 1, '#6a7480');
      for (let i = 0; i < 4; i++) { k.rect(B.x + 3, B.y + 12 + i * 5, 12 + (i * 5) % 7, 1, '#c8d0d8'); k.px(B.x + 22, B.y + 12 + i * 5, C.gold3); }
      const gx = B.x + 30, gy = B.y + 4, gw = 23, gh = 22;
      k.rect(gx, gy, 1, gh, '#e8ecf0'); k.rect(gx, gy + gh - 1, gw, 1, '#e8ecf0'); k.px(gx - 1, gy + 1, '#e8ecf0');
      for (let i = 0; i < gw - 2; i += 2) k.px(gx + 1 + i, gy + 1 + Math.round(i * (gh - 3) / (gw - 3)), '#6a7480');
      for (let d = 1; d < 6; d++) k.px(gx + d * 4, gy + gh, '#c8d0d8');
      k.path([[gx + 1, gy + 1], [gx + 4, gy + 3], [gx + 8, gy + 4], [gx + 12, gy + 9]], '#86d6ff');
      k.rect(B.x + 2, B.y + B.h + 1, B.w - 4, 2, ST.sh); k.rect(B.x + 8, B.y + B.h, 4, 1, C.white); k.rect(B.x + 40, B.y + B.h, 5, 2, '#3a4048');

      /* ---- Staff table (tea breaks) ---- */
      Props.bench(k, STAFF.x + 2, STAFF.y - 9, STAFF.w - 4); Props.table(k, STAFF.x, STAFF.y, STAFF.w, 9, '#e4e4e0'); Props.bench(k, STAFF.x + 2, STAFF.y + 9, STAFF.w - 4);
      k.rect(STAFF.x + 17, STAFF.y - 13, 6, 4, ST.base); k.rect(STAFF.x + 17, STAFF.y - 13, 6, 1, ST.hi); k.rect(STAFF.x + 23, STAFF.y - 12, 2, 1, ST.sh); k.rect(STAFF.x + 19, STAFF.y - 14, 2, 1, ST.dk);

      /* ---- Reflecting pool with clipped topiaries ---- */
      const W = POOL;
      k.rect(W.x + 2, W.y + W.h, W.w, 2, C.shadow);
      k.rect(W.x, W.y, W.w, W.h, C.stone4); k.rect(W.x, W.y, W.w, 1, C.stone5); k.rect(W.x, W.y + W.h - 2, W.w, 2, C.stone2);
      k.rect(W.x + 3, W.y + 3, W.w - 6, W.h - 7, C.water1); k.rect(W.x + 3, W.y + 3, W.w - 6, 2, C.water0); k.dither(W.x + 3, W.y + 5, W.w - 6, W.h - 9, C.water2, 1);
      k.ellipse(W.x + 12, W.y + 12, 3, 1, C.leaf3); k.px(W.x + 12, W.y + 11, '#ffc6d8'); k.ellipse(W.x + 32, W.y + 9, 2, 1, C.leaf2);
      topiary(k, W.x - 8, W.y + W.h); topiary(k, W.x + W.w + 8, W.y + W.h);

      /* ---- Bins (left) ---- */
      bin(k, -184, 44); bin(k, -172, 46);

      /* ---- Grand et döner stand (bottom left): sign, striped awning, İznik-tiled back wall, the spit, topping counter ---- */
      {
        const { x0, x1, spx } = DN, dw = x1 - x0;
        k.rect(x0 - 2, 72, dw + 4, 46, C.stone3); flags(k, x0 - 2, 100, dw + 4, 18);
        // Back wall: cobalt and turquoise tiles; terracotta floor.
        k.rectTex(x0 + 2, 36, dw - 4, 36, (x, y) => {
          const cx = (x - x0) % 8, cy = (y - 36) % 8;
          if (cx === 7 || cy === 7) return '#c8c4b8';
          const d = Math.abs(cx - 3) + Math.abs(cy - 3);
          return d <= 1 ? '#1e5a9a' : d === 2 ? '#3aa0a8' : (cx === 0 || cx === 6) && (cy === 0 || cy === 6) ? '#b83a3a' : '#f2f0e8';
        });
        k.rect(x0 + 2, 36, dw - 4, 2, '#2a2e36'); k.rect(x0 + 2, 38, 3, 34, C.shadowSoft);
        k.rectTex(x0 + 2, 72, dw - 4, 16, (x, y) => (((x - x0) >> 2) + ((y - 72) >> 2)) & 1 ? '#b8603a' : '#d27a4a');
        // Vertical gas heater behind the spit (it glows in animate).
        k.rect(spx - 17, 40, 34, 36, ST.dk); k.rect(spx - 16, 41, 32, 34, '#2a1e1a'); k.rect(spx - 17, 40, 34, 1, ST.hi);
        for (let y = 43; y < 74; y += 4) for (let x = spx - 14; x < spx + 14; x += 4) k.rect(x, y, 3, 3, '#4a2a1e');
        // Menu panel with a small döner icon.
        k.rect(x0 + 40, 42, 20, 20, C.ink); k.rect(x0 + 41, 43, 18, 18, '#1a1e24'); k.text('ET', x0 + 43, 45, C.gold3);
        k.poly([[x0 + 52, 44], [x0 + 57, 44], [x0 + 56, 51], [x0 + 53, 51]], '#94522a'); k.rect(x0 + 54, 43, 1, 10, ST.hi);
        for (let i = 0; i < 3; i++) { k.rect(x0 + 43, 53 + i * 3, 9, 1, '#c8d0d8'); k.px(x0 + 55, 53 + i * 3, C.gold3); }
        // Skewer foot and the drip tray.
        k.rect(spx, 80, 1, 8, ST.sh); k.ellipse(spx, 81, 14, 3, ST.dk); k.ellipse(spx, 80, 13, 2, ST.base); k.ellipse(spx, 80, 10, 1, '#6e3818');
        // Brass posts.
        for (const px of [x0 - 2, x1 - 2]) { k.rect(px, 24, 4, 78, C.gold1); k.rect(px, 24, 1, 78, C.gold3); k.rect(px + 3, 24, 1, 78, C.gold0); k.rect(px - 1, 100, 6, 2, C.gold0); }
        // Counter: topping pans on steel, a glass front with ayran cups.
        k.rect(x0 + 4, 104, dw - 4, 2, C.shadow);
        k.rect(x0 + 2, 88, dw - 4, 4, ST.base); k.rect(x0 + 2, 88, dw - 4, 1, ST.hi);
        [['#e04a3a', '#ff8a70'], ['#f0e8f0', '#b87aa8'], [C.leaf3, C.leaf5], ['#a8b848', '#d8e070'], [C.plum2, C.plum3], ['#c84a5a', '#f0c8d0']].forEach(([a, b], i) => {
          const x = x0 + 4 + i * 7; k.rect(x, 89, 6, 2, ST.dk); k.rect(x, 89, 6, 1, a); k.px(x + 1 + (i % 3), 89, b); k.px(x + 4, 90, b);
        });
        for (let i = 0; i < 4; i++) k.ellipse(x1 - 9, 90 - i, 4, 1, i % 2 ? '#e8d8b0' : '#f4ead0');
        k.rect(x0 + 2, 92, dw - 4, 9, '#9ab8c4'); k.dither(x0 + 2, 92, dw - 4, 9, '#cfe6ee', 1); k.rect(x0 + 2, 92, dw - 4, 1, C.white);
        for (let i = 0; i < 7; i++) { const x = x0 + 5 + i * 8; k.rect(x, 95, 4, 5, C.white); k.rect(x, 95, 4, 1, '#3a6ab8'); k.px(x + 3, 97, '#d8dce0'); }
        k.rect(x0 + 2, 101, dw - 4, 3, ST.sh); k.rect(x0 + 2, 101, dw - 4, 1, ST.hi);
        // Striped awning with a gold trim and scalloped edge.
        for (let x = x0 - 6; x < x1 + 6; x++) {
          const red = Math.floor((x - x0 + 6) / 6) % 2 === 0, c = red ? '#c8242e' : '#f6f2ea';
          k.rect(x, 25, 1, 9, c); k.rect(x, 25, 1, 2, S(c, -.2));
          if ((x - x0 + 6) % 6 > 0 && (x - x0 + 6) % 6 < 5) k.px(x, 34, c);
        }
        k.rect(x0 - 6, 24, dw + 12, 1, C.gold3);
        // The sign: red enamel, gold border, DÖNER in white.
        const sx = x0 + 27;
        k.rect(sx - 23, 4, 46, 20, C.ink); k.rect(sx - 22, 5, 44, 18, C.gold2); k.rect(sx - 21, 6, 42, 16, '#b01e28'); k.rect(sx - 21, 6, 42, 1, '#d8404a');
        const tx = sx - 20, word = (c, ox, oy) => {   // 2x capitals with the wide N
          for (const [ch, x] of [['D', 0], ['O', 8], ['E', 26], ['R', 34]]) k.text(ch, tx + x + ox, 11 + oy, c, 2);
          NG.forEach((r, j) => { for (let i = 0; i < 4; i++) if (r[i] === '1') k.rect(tx + 16 + i * 2 + ox, 11 + j * 2 + oy, 2, 2, c); });
        };
        for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) word(C.ink, ox, oy);
        word(C.white, 0, 0);
        for (const dx of [8, 12]) k.rect(tx + dx, 8, 2, 2, C.white);
        for (const dx of [-26, 25]) { k.rect(sx + dx, 12, 2, 2, C.gold3); k.px(sx + dx, 12, C.gold4); }
      }
      Props.bush(k, -186, 136, 1); Props.bush(k, -104, 136, 2);

      /* ---- Fine-dining terrace: teak deck, hedge border, lanterns, maitre d' podium, wine sideboard ---- */
      k.rect(40, 126, 148, 4, C.shadow);
      Props.planks(k, 38, -6, 148, 132, C.wood2);
      k.rect(38, -7, 148, 1, C.wood4); k.rect(38, 124, 148, 3, C.stone3); k.rect(38, 124, 148, 1, C.stone4);
      k.rect(37, -6, 1, 131, C.wood0);
      Props.hedge(k, 39, 14, 6, 108);
      for (const [x, y] of [[50, 120], [140, 124]]) topiary(k, x, y);
      k.rect(160, -12, 24, 10, WD); k.rect(160, -12, 24, 2, WDH); k.rect(160, -3, 24, 1, C.wood0); k.rect(172, -10, 1, 7, C.wood0);
      for (let i = 0; i < 4; i++) { k.rect(162 + i * 3, -17, 2, 5, i % 2 ? '#5a1a2a' : '#2a4a2a'); k.px(162 + i * 3, -18, C.gold2); }
      for (let i = 0; i < 3; i++) { k.rect(175 + i * 3, -15, 2, 2, '#dcecf2'); k.px(175 + i * 3, -13, '#c8d4da'); k.px(175 + i * 3, -15, C.white); }
      k.rect(46, -18, 10, 12, WD); k.rect(46, -18, 10, 1, WDH); k.rect(45, -20, 12, 3, WD); k.rect(46, -20, 10, 1, C.paper); k.px(54, -21, C.gold3); k.ellipse(52, -5, 6, 1, C.shadow);
      for (const x of [44, 184]) Props.lamp(k, x, -4, false);
      Props.lamp(k, 112, 126, false);

      /* ---- Entrance: lamps, the star plaque and a menu stand ---- */
      Props.lamp(k, -24, 128, false); Props.lamp(k, 24, 128, false);
      starPlaque(k, -42, 94);
      k.ellipse(-72, 129, 6, 1, C.shadow); k.rect(-73, 118, 2, 11, ST.dk); k.rect(-82, 109, 20, 10, ST.dk); k.rect(-81, 110, 18, 8, '#1a1e24'); k.rect(-81, 110, 18, 1, '#3a4048');
      for (const [x, y] of [[26, 96], [-38, 10]]) topiary(k, x, y + 8);
      Props.barrel(k, 18, -40); Props.crate(k, 146, -36, 8);
      Props.bush(k, 30, 136, 0);
      for (let i = 0; i < 12; i++) Props.flower(k, -60 + P.hash(i, 51) * 90, 134 + P.hash(i, 57) * 5, ['#f6ecd0', '#f6ecd0', '#e98aa0'][i % 3]);
    },
    front(k) {},
    animate(k, t, state, z) {
      const run = state === 'working', idle = state === 'idle', wait = state === 'waiting', err = state === 'error', live = state !== 'off';
      const blink = Math.floor(t * 3) % 2 === 0, f12 = Math.floor(t * 12);

      /* ---- The clock: the viewer's local time (HH:MM); red flashes in error, dark when off ---- */
      if (live) {
        const now = new Date(), hh = now.getHours(), mm = now.getMinutes(), dg = [Math.floor(hh / 10), hh % 10, Math.floor(mm / 10), mm % 10];
        const col = err ? (blink ? SEG.red : '#6a1e18') : SEG.on, glow = err ? '#ff3020' : SEG.glow;
        if (z.detail) k.alpha(err && !blink ? .08 : .22, () => k.rect(CLK.x - 3, CLK.y - 1, 42, 13, glow));
        DX.forEach((dx, i) => digit(k, CLK.x + dx, CLK.y, DIG[dg[i]], col));
        if (err || now.getMilliseconds() < 500) { k.rect(CLK.x + 16, CLK.y + 3, 1, 2, col); k.rect(CLK.x + 16, CLK.y + 7, 1, 2, col); }
        if (err && blink && z.detail) k.alpha(.12, () => k.rect(SIGN.x, SIGN.y, SIGN.w, SIGN.h, C.error));
      }

      /* ---- Range: burners, pans and pots per state ---- */
      if (live) {
        const fire = run ? ['#f5c040', '#f07a32', '#78b8ff'] : ['#78b8ff', '#4a78c8', '#78b8ff'];
        const lit = run ? [0, 1, 2, 3] : idle ? [3] : wait ? [1, 3] : [0, 2, 3];
        lit.forEach(i => { const bx = BURN[i]; for (let j = 0; j < 3; j++) { const fx = bx - 4 + j * 4, h = run || err ? 1 + ((f12 + j + i) % 2) : (f12 + j) % 3 ? 0 : 1; k.rect(fx, -97 - h, 1, h + 1, fire[(j + i + f12) % 3]); } });
        k.rect(R0 - 1, -103, RW + 2, 1, run || err ? '#fff4d8' : '#d8d0b8');
      }
      // Burner 0: saute pan (flipping while working); 1: stockpot; 2: frying pan; 3: copper sauce pot.
      const toss = run ? (t * 1.3) % 1 : 1, tilt = toss < .35 ? 2 : 0;
      pan(k, BURN[0], -98, tilt, '#e0b44a');
      if (toss < .6) for (let i = 0; i < 4; i++) { const q = toss / .6, h = Math.round(Math.sin(q * Math.PI) * 4), dx = Math.round((i - 1.5) * 2 + q * 2); k.px(BURN[0] + dx, -100 - h - (i % 2), i % 2 ? C.leaf4 : '#e0b44a'); }
      pot(k, BURN[1], -97, run && f12 % 4 === 0 ? 1 : 0, false);
      if (!err) pan(k, BURN[2], -98, 0, run ? '#b06a3a' : null);
      if (run) for (let i = 0; i < 3; i++) if ((f12 + i * 2) % 3 === 0) k.px(BURN[2] - 3 + i * 3, -101 - (f12 + i) % 2, '#fff0c0');
      pot(k, BURN[3], -97, 0, true);
      if (!live) k.alpha(.38, () => k.rect(R0 - 2, -106, RW + 4, 10, '#141c3c'));
      if (live && !err && z.detail) {
        steam(k, BURN[1], -104, t * (run ? 1.2 : .5), run ? 2 : 1, 3);
        steam(k, BURN[3], -104, t * (run ? 1 : .4) + .3, run ? 2 : 1, 3);
      }
      // Plating counter: two plates being finished with tweezers.
      if (run || wait) { k.blit(plateSprite(4), -44, -99); k.blit(plateSprite(3), -26, -99); if (run && f12 % 6 < 3) { k.px(-43, -104, C.leaf5); k.px(-25, -104, C.red3); } }
      if (err) {
        // Pan fire on the frying pan: tall flames and glow on the tiles.
        k.alpha(.18 + (f12 % 2) * .08, () => k.ellipse(BURN[2], -104, 18, 10, '#f07a32'));
        pan(k, BURN[2], -98, 1, '#2a1a10');
        Props.fire(k, BURN[2], -99, t, 2); Props.fire(k, BURN[2] - 5, -99, t + .3, 1); Props.fire(k, BURN[2] + 5, -99, t + .6, 1);
      }

      /* ---- Ticket rail ---- */
      const colX = c => RAIL.x + c * RAIL.cw, ty = RAIL.y;
      const tix = (c, slot, i, dy = 0) => k.blit(ticketSprite(i % 4), colX(c) + 2 + slot * 8, ty + dy, false);
      if (run) {
        for (let i = 0; i < 12; i++) {
          const s = ((t / 18 + i / 12) % 1) * 4, c = Math.floor(s), fr = s - c, slot = i % 3;
          let x = colX(c) + 2 + slot * 8, a = 1;
          if (fr > .84) { const m = (fr - .84) / .16; x += Math.round(m * m * (3 - 2 * m) * RAIL.cw); if (c === 3) a = 1 - m; }
          if (c === 0 && fr < .1) a = fr / .1;
          k.blit(ticketSprite(i % 4), x, ty, false, a);
        }
      } else if (idle) tix(0, 0, 0);
      else if (wait) {
        tix(0, 0, 1); tix(0, 1, 2); tix(1, 0, 3); tix(3, 0, 3); tix(3, 1, 0);
        const g = .25 + Math.abs(Math.sin(t * 3)) * .35; k.alpha(g, () => { k.rect(colX(2) - 1, -121, 27, 10, C.waiting); k.rect(colX(2), ty - 1, 25, 11, C.waiting); });
        tix(2, 0, 0); tix(2, 1, 1); tix(2, 2, 2);
      } else if (err) {
        tix(0, 0, 1); tix(0, 1, 2); tix(0, 2, 3); tix(1, 0, 0); tix(1, 1, 1, 2); tix(3, 0, 2);
        k.blit(ticketSprite(3), 70, -71, false); k.blit(ticketSprite(1), 20, -40, false);
        if (blink) k.alpha(.35, () => k.rect(colX(1) - 1, -121, 27, 10, C.error));
      }

      /* ---- Heat lamps, plates at the pass, bell, beacon ---- */
      if (run) {
        LAMPS.forEach(x => lampCone(k, x, '#ffc060', .16));
        for (let i = 0; i < 2; i++) { const p = (t / 11 + i * .5) % 1; if (p > .8 || p < .1) k.blit(plateSprite(i), LAMPS[i + 1], -62); }
        const p0 = (t / 11) % 1; if (p0 > .5 && p0 < .8) k.blit(plateSprite(2), LAMPS[0], -62);
      } else if (wait) {
        const g = .5 + Math.sin(t * 5) * .5;
        lampCone(k, LAMPS[1], C.waiting, .2 + g * .15);
        k.blit(plateSprite(0), LAMPS[1], -62);
        if (Math.floor(t * 1.5) % 3 === 0) { k.px(BELL.x - 4, BELL.y - 5, C.white); k.px(BELL.x - 5, BELL.y - 3, C.white); k.px(BELL.x + 4, BELL.y - 5, C.white); k.px(BELL.x + 5, BELL.y - 3, C.white); }
      } else if (idle) k.rect(LAMPS[0] - 1, -80, 3, 1, '#a06030');
      if (live) {
        const bc = err ? (blink ? C.error : '#5a1a18') : wait ? (Math.floor(t * 2) % 2 ? C.waiting : C.gold1) : C[state];
        k.rect(BEACON.x - 1, BEACON.y - 1, 3, 3, bc); k.px(BEACON.x - 1, BEACON.y - 1, C.white);
        if ((err && blink) || wait) k.alpha(.3, () => k.circle(BEACON.x, BEACON.y, 4, bc));
      }

      /* ---- Döner stand: heater glow, the turning spit (charred and smoking on error) ---- */
      const { x0: dx0, x1: dx1, spx } = DN;
      if (live) {
        const g = run ? .5 + (f12 % 3) * .06 : idle ? .22 : wait ? .32 : .6;
        k.alpha(g, () => k.rect(spx - 16, 41, 32, 34, err ? '#ff4a1a' : '#ff7a2a'));
        if (run || err) for (let y = 44; y < 74; y += 4) for (let x = spx - 13; x < spx + 14; x += 4) if ((x + y + f12) % 3) k.px(x, y, '#ffd070');
      }
      const dfr = run ? mod(Math.floor(t * 8), DF) : idle ? mod(Math.floor(t * 3), DF) : 0;
      k.blit(donerSprite(dfr, err), spx, 36);
      if (!live) k.alpha(.38, () => k.rect(spx - 15, 36, 30, 46, '#141c3c'));
      if (err) {
        Props.fire(k, spx - 12, 80, t, 1); Props.fire(k, spx + 11, 80, t + .4, 1);
        puffs(k, spx, 40, t * 1.1 + .2, 5, ['#2e2a2a', '#4a4644', '#6a6660'], 26, 6);
      } else if (run && z.detail) steam(k, spx - 4, 40, t * .9, 3, 12, '#e8e0d4');
      // The menu panel flashes amber while waiting for approval.
      if (wait) { const a = .5 + Math.sin(t * 5) * .5; k.alpha(.35 + a * .3, () => k.rect(dx0 + 40, 42, 20, 20, C.waiting)); }

      /* ---- Burndown marks, menu stand, lanterns and candles ---- */
      {
        const gx = BOARD.x + 30, gy = BOARD.y + 4;
        if (run) { const q = (t / 8) % 1, ex = gx + 12 + Math.round(q * 4), ey = gy + 9 + Math.round(q * 5); k.line(gx + 12, gy + 9, ex, ey, '#86d6ff'); k.px(ex, ey, C.white); }
        else if (err) { k.line(gx + 12, gy + 9, gx + 16, gy + 4, C.red3); if (blink) k.px(gx + 16, gy + 4, C.white); }
        else if (wait) { if (blink) k.rect(gx + 11, gy + 8, 3, 3, C.waiting); }
        else if (idle) k.px(gx + 12, gy + 9, C.white);
        k.textCenter(live ? 'OPEN' : 'CLOSED', -72, 112, live ? C.white : '#6a7088');
      }
      if (live) {
        for (const [x, y] of [[-24, 128], [24, 128], [44, -4], [184, -4], [112, 126]]) if (!err || blink || x < 0) { k.rect(x - 1, y - 20, 4, 3, C.glassLit); if (z.detail) k.alpha(.16, () => k.rect(x - 3, y - 22, 8, 7, C.glassLit)); }
      }

      /* ---- Everything that stands in the scene is depth-sorted by feet y ---- */
      const items = [], add = (y, fn) => items.push([y, fn]);
      // Brigade member: crew sprite with a white chef's jacket and toque drawn over it; front of house wears black.
      const staff = (x, y, o = {}, foh = false) => add(y, () => {
        const st = o.state || state, ph = o.phase || 0, an = st === 'off' ? 'sleep' : st !== 'working' && (o.anim === 'work' || o.anim === 'walk') ? 'idle' : (o.anim || 'idle');
        z.crew(x, y, { ...o, hat: 'none', mark: false });
        const dy = an === 'sit' || an === 'sleep' ? 3 : an === 'walk' && mod(Math.floor(t * 8 + ph * 7), 4) % 2 ? -1 : 0;
        const X = Math.round(x) + (st === 'error' ? [0, 1, 0, -1][mod(Math.floor(t * 12 + ph * 3), 4)] : 0), Y = Math.round(y) + dy, fl = o.facing === -1;
        if (foh) { k.rect(X - 3, Y - 12, 7, 7, '#22232a'); k.rect(X - 3, Y - 12, 1, 7, '#3a3c46'); k.rect(X, Y - 12, 1, 4, C.white); k.px(X, Y - 12, C.ink); k.px(fl ? X - 1 : X + 1, Y - 12, C.ink); }
        else {
          k.rect(X - 3, Y - 12, 7, 7, TOQ); k.rect(fl ? X - 3 : X + 2, Y - 12, 2, 7, TOQD); k.rect(X - 3, Y - 6, 7, 1, TOQD); k.px(X, Y - 10, '#8a8680'); k.px(X, Y - 8, '#8a8680');
          k.rect(X - 4, Y - 27, 9, 7, C.ink); k.rect(X - 3, Y - 28, 7, 1, C.ink);
          k.rect(X - 3, Y - 27, 7, 4, TOQ); k.rect(X - 3, Y - 27, 3, 1, C.white); k.rect(X + 2, Y - 26, 1, 3, TOQD); k.px(X, Y - 25, TOQD);
          k.rect(X - 3, Y - 23, 7, 2, '#e4e0d6'); k.rect(X - 3, Y - 23, 7, 1, TOQD);
        }
        if (o.bottle) { const bx = fl ? X - 6 : X + 5; k.rect(bx, Y - 14, 2, 5, '#5a1a2a'); k.px(bx, Y - 15, C.gold2); k.px(bx, Y - 12, C.paper); }
        if (st === 'error' && mod(Math.floor(t * 3 + ph), 2)) { k.rect(X - 1, Y - 36, 3, 6, C.ink); k.rect(X, Y - 35, 1, 3, C.error); k.px(X, Y - 31, C.error); }
        if (st === 'waiting') { k.rect(X - 2, Y - 37, 5, 7, C.ink); k.rect(X - 1, Y - 36, 3, 5, C.waiting); k.px(X, Y - 35, C.ink); k.px(X, Y - 33, C.ink); }
      });
      const cook = (x, y, o) => staff(x, y, o, false), foh = (x, y, o) => staff(x, y, o, true);
      const guest = (x, y, o) => add(y, () => z.crew(x, y, { mark: false, ...o }));
      const cup = (x, y) => { k.rect(x, y, 3, 2, C.white); k.px(x + 3, y, '#d8d2c4'); k.px(x + 1, y - 1, '#8a5a2a'); };

      // Terrace tables, guests, plates and candles.
      const occ = live ? (run ? [3, 1, 3, 2] : idle ? [1, 0, 0, 0] : wait ? [3, 1, 1, 0] : [3, 0, 1, 0]) : [0, 0, 0, 0];
      TABLES.forEach((T, i) => {
        add(T.y, () => {
          k.blit(tableSprite(live ? 'open' : 'closed', 3 & ~occ[i]), T.x, T.y);
          if (!live) return;
          const fl = (f12 + i) % 3; k.px(T.x, T.y - 15 - (fl ? 1 : 0), fl ? C.gold3 : C.gold4); k.px(T.x, T.y - 14, '#f07a32');
          for (const s of [1, 2]) if (occ[i] & s) {
            const px = T.x + (s === 1 ? -4 : 4);
            if (run || (err && i !== 0)) k.blit(plateSprite((i * 2 + s) % 5), px, T.y - 9); else cup(px - 1, T.y - 13);
          }
        });
        if (!live) return;
        const looks = [[1, 'scarf'], [4, 'none'], [2, 'none'], [3, 'none'], [0, 'scarf'], [5, 'none'], [4, 'none'], [1, 'none']];
        for (const s of [1, 2]) if (occ[i] & s) {
          const [lk, hat] = looks[(i * 2 + s) % 8], gx = T.x + (s === 1 ? -12 : 12);
          if (err && i === 0) guest(gx + (s === 1 ? -4 : 4), T.y + 4, { look: lk, hat, hatColor: '#c3a2c0', anim: 'idle', facing: s === 1 ? 1 : -1, phase: i + s });
          else guest(gx, T.y + 4, { look: lk, hat, hatColor: '#c3a2c0', anim: 'sit', facing: s === 1 ? 1 : -1, phase: i + s, state: err ? 'idle' : 'working' });
        }
      });
      // Maitre d' at the podium; the sommelier with a bottle.
      if (live) foh(66, 8, { look: 5, anim: 'idle', facing: -1, phase: .4 });
      if (run) foh(126, 104, { look: 3, anim: 'work', facing: 1, speed: 2, bottle: true, phase: .6 });
      else if (live) foh(170, 6, { look: 3, anim: 'idle', facing: -1, bottle: true });

      // Kitchen brigade at fixed stations.
      if (run) {
        cook(-98, -64, { look: 0, anim: 'work', phase: .1 });
        cook(-74, -64, { look: 2, anim: 'work', facing: -1, phase: .5, speed: 8 });
        cook(-46, -64, { look: 4, anim: 'work', tool: 'pen', phase: .3, speed: 3 });
        cook(-24, -64, { look: 1, anim: 'work', tool: 'pen', phase: .8, speed: 3 });
        // Commis carries produce from the pantry (backlog) into the kitchen.
        const p = (t / 9) % 1, out = p < .5, q = out ? p * 2 : (1 - p) * 2, cx = -118 + q * 88;
        cook(cx, -38, { look: 3, anim: 'walk', carry: out ? 'food' : '', facing: out ? 1 : -1, phase: .7 });
        // Waiters walk approved plates (DONE) from the pass to the terrace.
        [[[100, -36], [100, 34]], [[132, -36], [114, 98]]].forEach(([[ax, ay], [bx, by]], i) => {
          const p = (t / 11 + i * .5) % 1; let x = ax, y = ay, anim = 'idle', carry = p > .92 || p < .45, face = -1;
          if (p >= .1 && p < .45) { const m = (p - .1) / .35; x = ax + (bx - ax) * m; y = ay + (by - ay) * m; anim = 'walk'; face = bx < ax ? -1 : 1; }
          else if (p >= .45 && p < .58) { x = bx; y = by; }
          else if (p >= .58 && p < .92) { const m = (p - .58) / .34; x = bx + (ax - bx) * m; y = by + (ay - by) * m; anim = 'walk'; face = ax < bx ? -1 : 1; }
          else if (p < .1) carry = true;
          foh(x, y, { look: 5, anim, carry: carry ? 'paper' : '', facing: face, phase: i * .5 });
          if (carry) add(y + .1, () => k.blit(plateSprite(i), x, y - 25));
        });
        cook(170, -40, { look: 5, anim: 'work', tool: 'broom', phase: .2 });
      } else if (idle) {
        cook(STAFF.x - 6, STAFF.y + 2, { look: 0, anim: 'sit' }); cook(STAFF.x + STAFF.w + 6, STAFF.y + 2, { look: 2, anim: 'sit', facing: -1 });
        cook(-60, STAFF.y + 16, { look: 4, anim: 'sit', facing: -1, phase: .4 });
        cup(STAFF.x + 4, STAFF.y - 11); cup(STAFF.x + 30, STAFF.y - 11); cup(STAFF.x + 12, STAFF.y - 11);
        if (z.detail) { steam(k, STAFF.x + 5, STAFF.y - 12, t * .6, 2, 6); steam(k, STAFF.x + 31, STAFF.y - 12, t * .6 + .5, 2, 6); }
        cook(-34, -64, { look: 1, anim: 'idle', facing: -1 });
      } else if (wait) {
        // The brigade stands in line at the service board, waiting for the chef's approval.
        [0, 2, 4, 1].forEach((lk, i) => cook(-86 + i * 14, 44, { look: lk, anim: 'idle', phase: i * .3 }));
        foh(80, -34, { look: 5, anim: 'idle' });
        cook(-80, -64, { look: 3, anim: 'idle', facing: 1 });
      } else if (err) {
        cook(-92, -64, { look: 0, anim: 'idle', phase: .1 });
        cook(-40, -62, { look: 2, anim: 'idle', facing: -1, phase: .6 });
        const p = (t / 2.4) % 1, q = p < .5 ? p * 2 : (1 - p) * 2;
        cook(-100 + q * 70, -40, { look: 4, anim: 'walk', carry: 'water', facing: p < .5 ? 1 : -1, state: 'working', phase: .2 });
        // Dropped stack of plates: shards around the shaking waiter.
        add(-31, () => {
          for (const [sx, sy, c] of [[-8, 2, C.white], [-4, 4, '#d8d2c4'], [3, 3, C.white], [7, 1, C.white], [10, 4, '#d8d2c4'], [-11, 5, C.white], [5, 6, C.white], [0, 1, C.red2], [-2, 5, C.leaf4]]) k.rect(100 + sx, -30 + sy, 2, 1, c);
          k.poly([[92, -26], [97, -28], [99, -25], [94, -24]], C.white); k.rect(104, -27, 4, 2, '#e8e2d4');
        });
        foh(100, -32, { look: 5, anim: 'idle', facing: -1 });
      } else {
        cook(STAFF.x + STAFF.w + 6, STAFF.y + 2, { look: 2, anim: 'sit', facing: -1 });
      }
      // Döner stand: the usta shaves the spit with a long knife, a helper rolls dürüm, customers queue, a street cat waits.
      if (live) {
        add(84, () => {
          const X = -112, Y = 84;
          z.crew(X, Y, { look: 1, hat: 'cap', hatColor: TOQ, anim: 'idle', facing: -1, phase: .3 });
          const sx = X + (err ? [0, 1, 0, -1][mod(Math.floor(t * 12 + .9), 4)] : 0);
          k.rect(sx - 3, Y - 10, 7, 6, TOQ); k.rect(sx - 3, Y - 10, 7, 1, TOQD);
          if (!run) return;
          const s = (t * 1.1) % 1, ky = 58 + Math.round(s * 20), tip = spx + donerHW(ky - 42) + 1;
          k.line(X - 2, Y - 13, X - 5, ky, TOQ, 2); k.px(X - 6, ky, C.skin2);
          k.rect(X - 9, ky, 3, 1, '#2a1a10'); k.line(X - 10, ky, tip, ky + 1, ST.hi); k.px(tip, ky + 2, ST.sh);
          if (z.detail) for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(tip - 1 - (i % 2), ky + 2 + Math.round(q * (78 - ky)), MEATC[0][3]); }
        });
        add(84.1, () => {
          z.crew(-102, 84, { look: 3, hat: 'cap', hatColor: TOQ, anim: run ? 'work' : 'idle', facing: -1, phase: .6 });
          const sx = -102 + (err ? [0, 1, 0, -1][mod(Math.floor(t * 12 + 1.8), 4)] : 0);
          k.rect(sx - 3, 74, 7, 6, TOQ); k.rect(sx - 3, 74, 7, 1, TOQD);
        });
        if (run) add(88, () => {
          if ((t / 3) % 1 < .5) { k.ellipse(-105, 87, 4, 1, '#f4ead0'); k.px(-106, 87, MEATC[0][2]); k.px(-104, 87, C.red2); k.px(-105, 86, C.leaf4); }
          else { k.rect(-108, 85, 7, 2, '#e8d0a0'); k.rect(-108, 85, 7, 1, '#f4ead0'); k.px(-101, 85, MEATC[0][2]); k.px(-101, 86, C.leaf3); }
        });
        const buyer = (x, y, o) => add(y, () => { z.crew(x, y, { anim: 'idle', ...o }); if (o.durum) { k.rect(x - 6, y - 13, 2, 5, '#e8d0a0'); k.px(x - 6, y - 13, C.white); k.px(x - 5, y - 14, MEATC[0][2]); k.px(x - 6, y - 14, C.leaf3); } });
        if (run) { buyer(-150, 116, { look: 2, facing: 1 }); buyer(-104, 116, { look: 4, facing: -1, durum: 1 }); buyer(-93, 127, { look: 1, hat: 'cap', hatColor: C.plum2, facing: -1, phase: .5 }); }
        else if (idle) buyer(-104, 116, { look: 4, facing: -1, durum: 1 });
        else if (wait) { buyer(-150, 116, { look: 2, facing: 1 }); buyer(-104, 116, { look: 4, facing: -1, phase: .4 }); buyer(-93, 127, { look: 1, hat: 'cap', hatColor: C.plum2, facing: -1, phase: .8 }); }
        else if (err) { buyer(-152, 122, { look: 2, facing: -1, state: 'idle' }); buyer(-100, 122, { look: 4, facing: 1, state: 'idle' }); }
      }
      add(110, () => {
        const x = -140, y = 110, F = '#8a8078', D = '#5a524c';
        k.ellipse(x + 1, y, 5, 1, C.shadow);
        if (!live) { k.ellipse(x, y - 2, 4, 2, F); k.rect(x - 3, y - 3, 3, 1, D); k.rect(x - 4, y - 3, 2, 2, F); k.px(x - 4, y - 4, D); k.px(x + 2, y - 3, D); return; }
        k.rect(x - 1, y - 5, 5, 5, F); k.rect(x + 3, y - 4, 1, 4, D); k.px(x, y - 3, D); k.px(x + 1, y - 2, D); k.rect(x - 1, y - 1, 2, 1, '#b8b0a4');
        k.rect(x - 3, y - 9, 5, 4, F); k.px(x - 3, y - 10, F); k.px(x + 1, y - 10, F); k.px(x - 2, y - 8, '#9ac850'); k.px(x, y - 8, '#9ac850'); k.px(x - 1, y - 7, '#e89aa0');
        const w = err ? 0 : Math.round(Math.sin(t * 3)); k.rect(x + 4, y - 1, 3, 1, D); k.px(x + 7, y - 2 + w, D); k.px(x + 7, y - 3 + w, D);
      });
      if (live) add(LEAD.y, () => z.lead(LEAD.x, LEAD.y, {})); else add(REST.y, () => z.lead(REST.x, REST.y, { facing: -1 }));

      items.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());

      /* ---- Smoke, steam and the chef's temper above everything ---- */
      const chx = -74, chy = -151;
      if (run) Props.smoke(k, chx, chy, t * 1.3, 4, '#ece8e0');
      else if (idle || wait) Props.smoke(k, chx, chy, t * .5, 2, '#e4e0d8');
      if (err) {
        puffs(k, chx, chy, t * 1.2, 5, ['#3a3634', '#5a5654']);
        puffs(k, BURN[2], -108, t * 1.1, 6, ['#2e2a2a', '#4a4644', '#6a6660'], 24, 10);
        puffs(k, -40, -130, t * .9 + .4, 4, ['#4a4644', '#6a6660'], 18, 14);
        for (let i = 0; i < 5; i++) { const q = (t * 2 + i / 5) % 1; k.px(BURN[2] - 6 + i * 3 + Math.sin(q * 7 + i) * 2, -104 - q * 14, q < .5 ? C.gold4 : '#f07a32'); }
        // The head chef is furious: hot red steam from both sides of his toque.
        for (let i = 0; i < 4; i++) { const q = (t * 1.6 + i / 4) % 1, s = i % 2 ? 1 : -1; k.alpha(1 - q, () => k.circle(LEAD.x + s * (15 + q * 5), LEAD.y - 60 - q * 8, 1 + Math.round(q * 2), i < 2 ? '#ff7a6a' : C.white)); }
      }
      if (live && !err && z.detail) {
        if (!run) for (let i = 0; i < 2; i++) { const p = (t * .05 + i * .5) % 1; Props.bird(k, -190 + p * 380, -140 + i * 9 + Math.sin(p * 9) * 3, t + i); }
        if (idle || wait) { Props.butterfly(k, -146 + Math.sin(t * .7) * 20, 88 + Math.cos(t * .9) * 8, t); Props.butterfly(k, -170 + Math.cos(t * .5) * 12, 112 + Math.sin(t * 1.1) * 6, t + .3, '#f6ecd0'); }
      }
    }
  };
})();
