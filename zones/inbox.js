/* Inbox · Gelenler ve İzinler (service): a PTT-style post office (yellow & navy) and a neoclassical courthouse.
   Letters arrive by the yellow van, are sorted, carted to the court, judged at the bench and stamped
   green (approved) or red (rejected). The sign reads GGI in GKTC and DGI in Daghan (perVillage). */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.inbox = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  // PTT palette: signal yellow and deep navy, 4 tones each.
  const Y = '#ffd200', YL = '#fff07a', Y1 = '#e2b200', Y0 = '#a88000';
  const N = '#1d3a8a', NL = '#3d5fbf', N1 = '#152b68', N0 = '#0c1a44';
  const WALL = '#ebe6d8', BOX = '#c8995a';
  const vil = z => (z && z.village === 'daghan') ? 'daghan' : 'gktc';
  const code = v => v === 'daghan' ? 'DGI' : 'GGI';

  const WINS = [{ x: -156, w: 22 }, { x: -130, w: 22 }];   // counter windows (top -76, sill -60)
  const PAR = { x: -76, w: 32 };                                                // parcel window (top -72, sill -58)
  const DOOR = { x: -102, w: 18 };
  const TOTEM = { x: -30, w: 16 };
  const COLS = [48, 70, 92, 120, 142, 164];
  const JUDGE = { x: 110, y: -25 };
  const BENCH = { x: 78, w: 64, y: -36 };                                       // top surface y..y+4, front panel to -12
  const TABLE = { x: 62, y: 22, w: 34 };                                        // stamping table, top at 14
  const CART_A = [-16, 50], CART_B = [44, 36];
  const VAN = { x: -126, y: 110 };
  const STATUE = { x: 128, y: 106 };
  const QUEUE = [[-170, -2], [-158, -1], [-146, -2], [-134, -1], [-122, -2], [-110, -1]];
  const GAL = [[156, 7], [176, 21], [160, 21], [170, 35]];
  const SCAT = [[-58, 50], [-36, 58], [-6, 36], [14, 56], [30, 46], [-92, 44], [-2, 74], [40, 68], [-120, 50], [20, 24], [70, 44], [-64, 72]];
  const ease = q => q * q * (3 - 2 * q);

  // Post-horn mark (PTT-like), 9x5 cells.
  const HORN = ['.XXX.....', 'X...X...X', 'X.X.XXXXX', 'X...X...X', '.XXX.....'];
  const horn = (k, x, y, c, s = 1) => HORN.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'X') k.rect(x + i * s, y + j * s, s, s, c); });

  /* ---------- Cached sprites ---------- */
  const envS = (seal = C.red2) => P.sprite('inbox-env|' + seal, 8, 6, 0, 0, q => {
    q.rect(0, 0, 8, 6, C.paper); q.rect(0, 5, 8, 1, C.paper2); q.px(1, 1, C.paper2); q.px(6, 1, C.paper2); q.px(2, 2, C.paper2); q.px(5, 2, C.paper2); q.rect(3, 3, 2, 1, seal);
  });
  const pileS = () => P.sprite('inbox-pile', 30, 24, 0, 23, q => {
    for (let r = 0; r < 7; r++) for (let i = 0; i < (r > 4 ? 2 : 3); i++) {
      const x = i * 8 + (r % 2) * 3 + Math.round(P.hash(r, i) * 2), y = -5 - r * 3;
      q.rect(x, y, 8, 4, C.paper); q.rect(x, y + 3, 8, 1, C.paper2); q.rect(x, y + 4, 8, 1, C.inkSoft); q.px(x + 3, y + 1, (r + i) % 3 ? C.red2 : N); q.px(x + 1, y, C.white);
    }
    q.rect(24, -12, 5, 7, C.white); q.rect(25, -10, 3, 1, C.stone2); q.rect(4, -22, 8, 3, C.paper);
  });
  function vanSprite(txt, mode) {
    return P.sprite(`inbox-van|${txt}|${mode}`, 54, 36, 27, 34, q => {
      const T = '#26262c';
      q.rect(-23, -26, 36, 19, Y); q.rect(-23, -26, 36, 2, YL); q.rect(-23, -24, 1, 16, YL); q.rect(-23, -9, 36, 2, Y1);
      q.poly([[13, -22], [17, -22], [24, -13], [24, -7], [13, -7]], Y); q.rect(13, -22, 4, 1, YL); q.rect(21, -9, 3, 2, Y1);
      q.poly([[15, -20], [17, -20], [22, -13], [15, -13]], C.glass); q.px(16, -19, C.white); q.px(16, -18, '#d8f0f0');
      q.rect(13, -21, 1, 14, Y0); q.rect(-10, -24, 1, 15, Y1);
      q.rect(-23, -12, 47, 2, N); q.rect(-23, -12, 47, 1, NL);
      q.rect(-24, -7, 49, 2, T);
      q.text(txt, -20, -23, N, 2); horn(q, 2, -22, N);
      q.rect(24, -11, 1, 2, C.gold4); q.rect(-23, -16, 1, 3, C.red2);
      for (const wx of [-14, 15]) { q.rect(wx - 5, -9, 11, 2, T); q.circle(wx, -3, 4, T); q.circle(wx, -3, 2, C.stone3); q.px(wx, -3, C.stone1); }
      if (mode === 'open') { q.rect(-23, -24, 3, 16, '#3a3228'); q.rect(-27, -25, 4, 18, Y1); q.rect(-27, -25, 1, 18, YL); q.rect(-22, -12, 2, 4, BOX); }
      if (mode === 'broken') {
        q.poly([[17, -13], [22, -21], [25, -20], [20, -12]], Y1); q.line(17, -13, 22, -21, Y0);
        q.rect(18, -12, 6, 4, '#3a3a40'); q.px(20, -11, C.stone3);
        q.rect(10, -8, 11, 5, T); q.ellipse(15, -2, 5, 2, T); q.rect(13, -3, 4, 1, C.stone2);
      }
    });
  }
  function cartSprite(mode) {
    if (mode === 'tipped') return P.sprite('inbox-cart|tipped', 30, 16, 15, 15, q => {
      q.rect(-12, -10, 22, 10, N); q.rect(-11, -9, 20, 8, Y); q.rect(-11, -9, 20, 1, YL); q.rect(-11, -2, 20, 1, Y1);
      for (let i = 0; i < 4; i++) q.rect(-10 + i * 5, -7, 4, 4, N0);
      q.circle(11, -8, 2, '#23232a'); q.circle(11, -3, 2, '#23232a'); q.rect(-14, -2, 3, 1, N0);
    });
    return P.sprite('inbox-cart|' + mode, 30, 26, 15, 25, q => {
      q.rect(-13, -21, 1, 13, N0); q.rect(-15, -22, 4, 2, N); q.rect(-15, -22, 4, 1, NL);
      q.rect(-11, -19, 22, 15, N); q.rect(-10, -18, 20, 13, Y); q.rect(-10, -18, 20, 1, YL); q.rect(9, -18, 1, 13, Y1);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
        const x = -9 + c * 5, y = -16 + r * 5; q.rect(x, y, 4, 4, N0);
        if (mode === 'full' || (r + c) % 3 === 0) { q.rect(x, y + 1, 4, 3, C.paper); q.px(x + 1, y + 2, (r + c) % 2 ? C.red2 : N); }
      }
      if (mode === 'full') { q.rect(-8, -22, 9, 3, C.paper); q.rect(-8, -20, 9, 1, C.paper2); q.rect(2, -21, 6, 2, C.white); }
      q.rect(-11, -5, 22, 2, N1);
      for (const wx of [-7, 7]) { q.circle(wx, -2, 2, '#23232a'); q.px(wx, -2, C.stone3); }
    });
  }
  function judgeSprite(pose) {
    return P.sprite('inbox-judge|' + pose, 24, 36, 12, 34, q => {
      const R = '#1b1b24', RL = '#3c3c4c', RD = '#0b0b11', RED = '#c0262c', SK = C.skin3, SKD = C.skin2, H = '#e2ddd2', HD = '#a8a298';
      q.poly([[-7, 0], [-6, -21], [7, -21], [8, 0]], R);
      q.rect(-6, -21, 1, 21, RL); q.rect(-2, -12, 1, 12, RD); q.rect(3, -14, 1, 14, RD); q.rect(6, -18, 1, 18, RD);
      // Turkish judge's robe: black with a red collar; white shirt and dark tie.
      for (let j = 0; j < 4; j++) { q.rect(-5 + j, -21 + j, 2, 1, RED); q.rect(4 - j, -21 + j, 2, 1, RED); if (7 - 2 * j > 0) q.rect(-3 + j, -21 + j, 7 - 2 * j, 1, C.white); }
      q.rect(0, -20, 1, 3, RD);
      q.rect(-3, -29, 7, 8, SK); q.rect(3, -29, 1, 8, SKD); q.rect(-2, -22, 5, 1, SKD);
      q.rect(-3, -30, 7, 2, H); q.rect(-4, -29, 1, 5, H); q.rect(4, -29, 1, 5, HD); q.px(-1, -31, H); q.px(1, -31, H);
      q.rect(-3, -27, 7, 1, '#6a5a48'); q.px(-2, -26, C.ink); q.px(2, -26, C.ink); q.rect(-1, -24, 3, 1, H);
      if (pose === 'read') {
        q.line(-6, -19, -6, -16, R, 2); q.line(6, -19, 6, -16, R, 2);
        q.rect(-5, -20, 11, 7, C.paper); q.rect(-5, -20, 11, 1, C.white); q.rect(-3, -18, 7, 1, C.stone2); q.rect(-3, -16, 5, 1, C.stone2);
        q.rect(-7, -17, 2, 2, SK); q.rect(6, -17, 2, 2, SK);
      } else if (pose === 'raise') {
        q.line(-6, -19, -6, -14, R, 2); q.line(6, -20, 8, -28, R, 2); q.rect(8, -31, 2, 2, SK);
      } else {
        q.line(-6, -19, -6, -14, R, 2); q.line(6, -20, 9, -17, R, 2); q.rect(9, -18, 2, 2, SK);
      }
    });
  }
  const shutterS = (w, h) => P.sprite(`inbox-shut|${w}|${h}`, w, h, 0, 0, q => {
    q.rect(0, 0, w, h, '#8a8e96'); for (let y = 1; y < h; y += 2) q.rect(0, y, w, 1, '#6c7078');
    q.rect(0, 0, w, 2, '#565a62'); q.rect(0, h - 2, w, 2, '#4a4e56'); q.rect(Math.floor(w / 2) - 1, h - 3, 3, 2, C.stone4);
  }, null);
  const warnS = () => P.sprite('inbox-warn', 9, 8, 4, 7, q => { q.poly([[-4, 0], [0, -7], [5, 0]], C.red2); q.poly([[-2, -1], [0, -5], [3, -1]], C.white); q.rect(0, -4, 1, 2, C.red1); });

  /* ---------- Static helpers ---------- */
  function postBox(k, x, y) {
    k.ellipse(x + 2, y, 7, 2, C.shadow);
    k.rect(x - 1, y - 7, 3, 7, N1); k.px(x - 1, y - 7, NL);
    k.rect(x - 6, y - 22, 13, 15, N0); k.rect(x - 5, y - 21, 11, 13, Y); k.rect(x - 5, y - 21, 2, 13, YL); k.rect(x + 4, y - 21, 2, 13, Y1);
    k.rect(x - 7, y - 24, 15, 3, N); k.rect(x - 7, y - 24, 15, 1, NL);
    k.rect(x - 3, y - 19, 7, 2, N0); horn(k, x - 4, y - 15, N); k.rect(x - 5, y - 9, 11, 1, N);
  }
  function column(k, x, top, bot) {
    k.rect(x + 8, top + 4, 3, bot - top - 7, C.shadowSoft);
    k.rect(x, top + 4, 8, bot - top - 7, C.stone4); k.rect(x, top + 4, 2, bot - top - 7, C.stone5); k.rect(x + 6, top + 4, 2, bot - top - 7, C.stone2);
    k.rect(x + 3, top + 4, 1, bot - top - 7, C.stone3); k.rect(x + 5, top + 4, 1, bot - top - 7, C.stone3);
    k.rect(x - 1, top + 2, 10, 2, C.stone4); k.rect(x - 2, top, 12, 2, C.stone5); k.px(x - 2, top + 2, C.stone2); k.px(x + 9, top + 2, C.stone2);
    k.rect(x - 1, bot - 3, 10, 3, C.stone4); k.rect(x - 1, bot - 1, 10, 1, C.stone2);
  }
  function scales(k, cx, cy, c0, c1) {
    k.rect(cx, cy - 8, 1, 13, c0); k.rect(cx - 2, cy + 5, 5, 1, c0); k.px(cx, cy - 9, c1);
    k.rect(cx - 10, cy - 6, 21, 1, c1);
    for (const s of [-1, 1]) { const px = cx + s * 10; k.line(px, cy - 5, px - 2, cy, c0); k.line(px, cy - 5, px + 2, cy, c0); k.rect(px - 3, cy, 7, 1, c1); k.rect(px - 2, cy + 1, 5, 1, c0); }
  }
  function justice(k, x, y) {
    const B = C.gold1, BL = C.gold2, BD = C.gold0, BH = C.gold3;
    k.ellipse(x + 4, y + 1, 16, 4, C.shadow);
    k.rect(x - 12, y - 10, 25, 10, C.stone3); k.rect(x - 12, y - 10, 3, 10, C.stone4); k.rect(x + 10, y - 10, 3, 10, C.stone2); k.rect(x - 12, y - 1, 25, 1, C.stone1);
    k.rect(x - 13, y - 12, 27, 3, C.stone4); k.rect(x - 13, y - 12, 27, 1, C.stone5);
    k.rect(x - 11, y - 7, 23, 5, C.stone2); k.text('ADALET', x - 11, y - 7, C.gold2);
    k.rect(x - 7, y - 15, 15, 3, C.stone3); k.rect(x - 7, y - 15, 15, 1, C.stone4);
    // Robed figure in bronze, blindfolded, scales raised, sword lowered.
    k.poly([[x - 6, y - 15], [x - 3, y - 37], [x + 4, y - 37], [x + 7, y - 15]], B);
    k.poly([[x - 6, y - 15], [x - 3, y - 37], [x - 1, y - 37], [x - 3, y - 15]], BL);
    k.line(x + 1, y - 34, x + 2, y - 16, BD); k.line(x + 4, y - 32, x + 5, y - 16, BD); k.rect(x - 5, y - 16, 12, 1, BD);
    k.rect(x - 3, y - 44, 7, 7, B); k.rect(x - 3, y - 44, 2, 7, BL); k.rect(x - 2, y - 46, 5, 2, BD); k.px(x + 3, y - 46, BD);
    k.rect(x - 3, y - 42, 7, 2, C.white); k.px(x + 4, y - 41, C.white); k.px(x + 5, y - 40, C.white);
    k.line(x - 3, y - 36, x - 9, y - 46, B, 2); k.px(x - 10, y - 48, BL);
    scales(k, x - 10, y - 43, BD, BH);
    k.line(x + 4, y - 36, x + 8, y - 28, B, 2); k.rect(x + 6, y - 28, 5, 1, BD); k.rect(x + 8, y - 27, 1, 12, C.stone5); k.px(x + 8, y - 15, C.stone3);
  }

  return {
    perVillage: true,
    paint(k, z) {
      const v = vil(z), txt = code(v);
      /* ---- Ground: PTT concrete pavers (left), cobbled centre, marble court plaza (right) ---- */
      k.rectTex(-190, -48, 380, 110, (x, y) => {
        if (x < -24) {
          const r = Math.floor((y + 300) / 6), o = (r % 2) * 5, c = (x + 300 + o) % 10;
          if ((y + 300) % 6 === 0 || c === 0) return '#aaa598';
          const h = P.hash(Math.floor((x + 300 + o) / 10), r);
          return h < .2 ? '#dcd8cc' : h > .85 ? '#c0bbae' : '#cfcabe';
        }
        if (x > 24) {
          const cx = Math.floor((x + 304) / 8), cy = Math.floor((y + 304) / 8);
          if ((x + 304) % 8 === 0 || (y + 304) % 8 === 0) return C.stone3;
          if (P.hash(cx, cy) > .7 && (x + y) % 9 === 0) return C.stone3;
          return (cx + cy) % 2 ? C.stone4 : C.stone5;
        }
        const r = Math.floor((y + 300) / 4), o = (r % 2) * 3, c = (x + 300 + o) % 6;
        if ((y + 300) % 4 === 0 || c === 0) return C.stone1;
        return P.hash(Math.floor((x + 300 + o) / 6), r) < .3 ? C.stone3 : C.stone2;
      });
      k.rect(-190, 62, 380, 1, C.stone1); k.rect(-190, 63, 380, 1, C.shadow);
      Props.cobbles(k, -18, 62, 36, 78, 7, C.stone2);
      k.rect(-19, 62, 1, 78, C.stone1); k.rect(18, 62, 1, 78, C.stone1);
      // A yellow guide line leads from the gate to the counters.
      for (let y = 66; y < 138; y += 6) k.rect(-12, y, 2, 3, Y1);

      /* ---- Background trees ---- */
      Props.tree(k, -150, -116, 'oak', 1, 1); Props.tree(k, -78, -118, 'birch', 0, 2); Props.tree(k, 38, -120, 'pine', 0, 1); Props.tree(k, 182, -122, 'pine', 0, 3);
      Props.tree(k, 8, -98, 'oak', 1, 2); Props.bush(k, -4, -48, 1); Props.bush(k, 18, -50, 0);

      /* ---- Post office (left): flat roof, yellow fascia with navy name, counter windows ---- */
      k.rect(-164, -118, 130, 20, C.stone2); k.dither(-164, -118, 130, 20, C.stone1, 1); k.rect(-164, -118, 130, 1, C.stone4); k.rect(-164, -118, 1, 20, C.stone3); k.rect(-35, -118, 1, 20, C.stone1);
      for (const x of [-152, -134]) { k.rect(x, -115, 13, 9, C.stone3); k.rect(x, -115, 13, 1, C.stone5); k.rect(x + 12, -115, 1, 9, C.stone1); k.circle(x + 6, -111, 3, C.stone1); k.circle(x + 6, -111, 1, C.stone2); }
      k.rect(-60, -132, 1, 18, C.slate1); k.rect(-64, -128, 9, 1, C.slate1); k.rect(-63, -124, 7, 1, C.slate1); k.px(-60, -133, C.red2);
      k.rect(-110, -113, 30, 6, N1); k.rect(-110, -113, 30, 1, NL); for (let i = 0; i < 6; i++) k.rect(-108 + i * 5, -111, 3, 3, '#5a78c8');
      Props.building(k, -162, -40, { w: 126, h: 58, style: 'flat', wall: WALL, foundation: 4 });   // narrowed to clear the hexagon edge
      k.rect(-164, -100, 130, 19, Y); k.rect(-164, -100, 130, 1, YL); k.rect(-164, -99, 1, 17, YL); k.rect(-35, -99, 1, 17, Y1);
      k.rect(-164, -83, 130, 2, N); k.rect(-162, -81, 126, 1, S(WALL, -.2));
      horn(k, -158, -96, N, 2);
      k.text(txt, -136, -96, N, 2);
      k.text('GELENLER VE IZINLER', -110, -94, N);
      k.rect(-110, -88, 75, 1, Y1);
      k.rect(-162, -48, 126, 4, N); k.rect(-162, -48, 126, 1, NL);
      WINS.forEach((w, i) => {
        k.rect(w.x - 2, -78, w.w + 4, 18, N); k.rect(w.x - 2, -78, w.w + 4, 1, NL);
        k.rect(w.x, -76, w.w, 16, '#34466e'); k.dither(w.x, -76, w.w, 16, '#3e5282', 1);
        k.rect(w.x + 2, -76, w.w - 4, 1, '#c8d8f0'); for (let j = 0; j < 4; j++) k.rect(w.x + 1 + j * 5, -70, 4, 3, j % 2 ? '#2a3858' : '#46598a');
        k.rect(w.x + 1, -75, 5, 7, Y); k.text(String(i + 1), w.x + 2, -74, N);
      });
      k.rect(PAR.x - 2, -74, PAR.w + 4, 16, N); k.rect(PAR.x, -72, PAR.w, 14, '#34466e'); k.dither(PAR.x, -72, PAR.w, 14, '#3e5282', 1);
      for (let j = 0; j < 3; j++) { k.rect(PAR.x + 2 + j * 10, -71, 8, 5, BOX); k.rect(PAR.x + 2 + j * 10, -71, 8, 1, S(BOX, .25)); k.rect(PAR.x + 5 + j * 10, -71, 2, 5, S(BOX, -.2)); }
      k.rect(PAR.x + 5, -81, 23, 7, N); k.text('KARGO', PAR.x + 7, -80, Y);
      k.rect(DOOR.x - 2, -76, DOOR.w + 4, 36, N); k.rect(DOOR.x - 2, -76, DOOR.w + 4, 1, NL);
      for (const dx of [0, 10]) { k.rect(DOOR.x + dx, -74, 8, 34, '#8fb4cc'); k.line(DOOR.x + dx + 1, -60, DOOR.x + dx + 6, -72, '#c8e0ec'); k.rect(DOOR.x + dx + (dx ? 1 : 6), -58, 1, 5, C.stone4); }
      k.rect(DOOR.x - 4, -40, DOOR.w + 8, 2, N0);
      Props.pot(k, -162, -38); Props.pot(k, -38, -38);
      // Queue stanchions with navy belts.
      for (let i = 0; i < 6; i++) { const x = -180 + i * 14; k.ellipse(x + 1, -12, 3, 1, C.shadow); k.rect(x, -20, 2, 8, C.stone1); k.px(x, -20, C.stone4); k.rect(x - 1, -21, 4, 2, C.stone3); if (i < 5) { k.line(x + 2, -18, x + 7, -16, N); k.line(x + 7, -16, x + 14, -18, N); } }

      /* ---- PTT pylon (top centre) ---- */
      const tx = TOTEM.x;
      k.rect(tx + 3, -45, TOTEM.w + 2, 3, C.shadow);
      k.rect(tx - 2, -50, TOTEM.w + 4, 6, N1); k.rect(tx - 2, -50, TOTEM.w + 4, 1, NL);
      k.rect(tx, -120, TOTEM.w, 70, Y); k.rect(tx, -120, 2, 70, YL); k.rect(tx + TOTEM.w - 2, -120, 2, 70, Y1);
      k.rect(tx - 1, -124, TOTEM.w + 2, 4, N); k.rect(tx - 1, -124, TOTEM.w + 2, 1, NL);
      horn(k, tx + 3, -116, N);
      for (let i = 0; i < 3; i++) k.text(txt[i], tx + 5, -106 + i * 13, N, 2);
      k.rect(tx, -62, TOTEM.w, 3, N);

      k.at(-14, 0, () => {   // courthouse and tribunal sit 14 px west, clear of the hexagon edge (the judge follows)
      /* ---- Courthouse (right): steps, columns, entablature, pediment with scales ---- */
      k.rect(44, -46, 132, 3, C.shadow);
      k.rect(48, -106, 124, 48, C.stone2); k.dither(48, -106, 124, 10, C.stone1, 0); k.rect(48, -106, 124, 2, C.stone1);
      for (const c of [63, 85, 135, 157]) { k.rect(c - 4, -96, 9, 28, C.stone0); k.rect(c - 3, -95, 7, 26, C.glassDark); k.rect(c - 3, -96, 7, 1, C.stone0); k.rect(c, -95, 1, 26, C.stone0); k.px(c - 3, -95, C.glass); k.rect(c - 5, -68, 11, 2, C.stone3); }
      k.rect(99, -94, 22, 36, C.stone0); k.rect(100, -93, 20, 35, '#7a5a2e'); k.rect(100, -93, 20, 1, '#a07a44');
      for (const dx of [2, 12]) { k.rect(100 + dx, -90, 6, 12, '#5e4420'); k.rect(100 + dx, -74, 6, 12, '#5e4420'); k.rect(100 + dx, -90, 6, 1, '#a07a44'); }
      k.rect(110, -93, 1, 35, '#3a2810'); k.px(108, -76, C.gold3); k.px(112, -76, C.gold3);
      k.rect(97, -100, 26, 6, C.stone3); k.rect(97, -100, 26, 1, C.stone5);
      k.rect(42, -50, 134, 4, C.stone2); k.rect(42, -50, 134, 2, C.stone4); k.rect(42, -50, 134, 1, C.stone5);
      k.rect(45, -54, 128, 4, C.stone2); k.rect(45, -54, 128, 2, C.stone4); k.rect(45, -54, 128, 1, C.stone5);
      k.rect(47, -58, 124, 4, C.stone3); k.rect(47, -58, 124, 2, C.stone4); k.rect(47, -58, 124, 1, C.stone5);
      COLS.forEach(x => column(k, x, -106, -58));
      k.rect(44, -116, 132, 10, C.stone4); k.rect(44, -116, 132, 1, C.stone5); k.rect(44, -107, 132, 1, C.stone1);
      for (let x = 45; x < 175; x += 4) k.rect(x, -108, 2, 1, C.stone2);
      k.textCenter('ADALET SARAYI', 110, -114, C.slate1);
      k.poly([[44, -116], [110, -143], [176, -116]], C.stone4);
      k.poly([[58, -118], [110, -139], [162, -118]], C.stone3);
      k.line(44, -116, 110, -143, C.stone5); k.line(110, -143, 176, -116, C.stone2); k.rect(44, -117, 132, 1, C.stone2);
      scales(k, 110, -129, C.gold0, C.gold2);

      /* ---- Tribunal dais: planks, high-backed chair, flag socket ---- */
      Props.planks(k, 62, -44, 100, 36, C.wood3);
      k.rect(62, -8, 100, 4, C.wood1); k.rect(62, -8, 100, 1, C.wood4); k.rect(64, -4, 100, 2, C.shadow);
      k.rect(52, -14, 10, 4, C.wood2); k.rect(52, -14, 10, 1, C.wood4); k.rect(48, -10, 14, 4, C.wood2); k.rect(48, -10, 14, 1, C.wood4);
      k.rect(102, -68, 17, 3, C.wood2); k.px(102, -69, C.gold3); k.px(118, -69, C.gold3);
      k.rect(103, -66, 15, 30, C.wood0); k.rect(104, -65, 13, 29, '#7a1e24'); k.rect(104, -65, 13, 2, '#a0323a'); k.rect(116, -65, 1, 29, '#5a1418');
      for (let y = -61; y < -40; y += 5) for (let x = 106; x < 116; x += 4) k.px(x + ((y / 5) % 2 ? 2 : 0), y, '#4a1014');
      });

      /* ---- Stamping table, notice board and public gallery ---- */
      Props.table(k, TABLE.x, TABLE.y, TABLE.w, 8, C.wood3);
      k.rect(TABLE.x + 11, TABLE.y - 8, 10, 2, C.ink); k.rect(TABLE.x + 12, TABLE.y - 8, 4, 1, C.leaf2); k.rect(TABLE.x + 16, TABLE.y - 8, 4, 1, C.red2);
      k.rect(104, 36, 2, 20, C.wood1); k.rect(132, 36, 2, 20, C.wood1); k.ellipse(120, 56, 16, 2, C.shadowSoft);
      k.rect(102, 30, 34, 18, C.wood1); k.rect(103, 31, 32, 16, '#b89a6a'); k.dither(103, 31, 32, 16, '#a88a5c', 1);
      k.rect(102, 25, 34, 6, N); k.textCenter('KARAR', 119, 26, Y);
      for (let i = 0; i < 6; i++) { const x = 105 + (i % 3) * 10, y = 33 + Math.floor(i / 3) * 7; k.rect(x, y, 8, 6, C.paper); k.rect(x + 1, y + 1, 5, 1, C.stone2); k.rect(x + 4, y + 3, 3, 2, i % 3 === 1 ? C.red2 : C.leaf2); }
      for (const y of [8, 22, 36]) Props.bench(k, 148, y, 40);
      Props.fence(k, 142, -2, 46, true);

      /* ---- Mail sorting station (left middle): pigeonhole rack and table ---- */
      k.rect(-80, -4, 50, 17, N); k.rect(-80, -4, 50, 1, NL); k.rect(-80, -6, 50, 2, Y); k.rect(-80, -6, 50, 1, YL);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { const x = -78 + c * 6, y = -2 + r * 5; k.rect(x, y, 5, 4, N0); if (P.hash(r, c + 11) > .3) { k.rect(x, y + 1, 5, 3, P.hash(c, r) > .5 ? C.paper : C.paper2); k.px(x + 2, y + 2, P.hash(c, r + 3) > .6 ? C.red2 : N); } }
      k.rect(-78, 13, 2, 3, N0); k.rect(-34, 13, 2, 3, N0);
      Props.table(k, -82, 34, 52, 8, C.wood3);
      Props.sack(k, -28, 26, '#9aa4b8'); k.rect(-26, 26, 3, 2, Y);

      /* ---- Van bay (bottom left): asphalt, yellow lines, roll cage, sacks ---- */
      k.rect(-188, 64, 136, 64, '#5a5a60'); k.dither(-188, 64, 136, 64, '#66666c', 1); k.rect(-188, 64, 136, 1, C.stone3); k.rect(-188, 127, 136, 1, C.stone1);
      for (const x of [-160, -92]) for (let y = 70; y < 124; y += 8) k.rect(x, y, 2, 5, Y1);
      k.rect(-150, 124, 50, 2, Y1);
      k.at(16, 0, () => {   // kept inside the hexagon's cut corner
      k.rect(-186, 66, 18, 22, '#8a8e96'); for (let i = 0; i < 18; i += 3) k.rect(-186 + i, 66, 1, 22, '#6c7078'); for (let j = 0; j < 22; j += 4) k.rect(-186, 66 + j, 18, 1, '#6c7078');
      Props.crate(k, -185, 78, 8); Props.crate(k, -177, 80, 7); k.rect(-184, 70, 9, 6, BOX); k.rect(-184, 70, 9, 1, S(BOX, .25));
      Props.sack(k, -164, 76, '#9aa4b8'); Props.sack(k, -156, 80, '#aab2c2');
      });
      Props.bench(k, -86, 80, 18); Props.crate(k, -66, 70, 9); k.rect(-65, 69, 7, 3, BOX);

      /* ---- Post boxes, lamps and gardens ---- */
      postBox(k, -44, 106); postBox(k, -30, 106);
      Props.lamp(k, -24, 130, false); Props.lamp(k, 24, 130, false);
      Props.hedge(k, -146, 130, 108, 6);
      Props.hedge(k, 30, 130, 116, 6);
      k.ellipse(STATUE.x, STATUE.y - 2, 30, 13, C.stone3); k.ellipse(STATUE.x, STATUE.y - 3, 28, 11, C.stone4); k.ring(STATUE.x, STATUE.y - 3, 28, 11, C.stone2);
      Props.flowerBed(k, STATUE.x - 34, STATUE.y + 10, 20, 8, ['#e46c52', '#f2c14e', '#f6ecd0'], 3); Props.flowerBed(k, STATUE.x + 14, STATUE.y + 10, 20, 8, ['#e46c52', '#f6ecd0', '#c3a2c0'], 8);
      justice(k, STATUE.x, STATUE.y);
      Props.bench(k, 44, 96, 20); Props.bench(k, 78, 110, 18);
      Props.tree(k, 176, 76, 'oak', 1, 0); Props.tree(k, 44, 84, 'blossom', 0, 1);
      Props.bush(k, 104, 124, 2); Props.bush(k, -44, 124, 1); Props.flowerBed(k, -46, 72, 22, 8, [Y, '#f6ecd0', N], 4);
      for (let i = 0; i < 18; i++) { const x = -186 + P.hash(i, 3) * 372, y = -150 + P.hash(i, 5) * 26; Props.tuft(k, x, y, C.grass1, C.grass4); }
    },
    front(k) {
      // Wall below the counter sills hides the clerks' legs; bench front panel hides the judge's.
      for (const w of [...WINS, { x: PAR.x, w: PAR.w, s: -58 }]) {
        const s = w.s || -60;
        k.rect(w.x - 2, s, w.w + 4, -48 - s, WALL); k.rect(w.x - 2, -48, w.w + 4, 4, N); k.rect(w.x - 2, -48, w.w + 4, 1, NL);
        k.rect(w.x - 4, s - 1, w.w + 8, 3, N); k.rect(w.x - 4, s - 1, w.w + 8, 1, NL); k.rect(w.x - 2, s + 2, w.w + 4, 1, S(WALL, -.22));
      }
      k.rect(PAR.x + 3, -63, 7, 5, BOX); k.rect(PAR.x + 3, -63, 7, 1, S(BOX, .25)); k.rect(PAR.x + 6, -63, 1, 5, S(BOX, -.25));
      k.at(-14, 0, () => {
      const b = BENCH;
      k.rect(b.x + 2, -12, b.w, 2, C.shadow);
      k.rect(b.x, -32, b.w, 20, C.wood2); k.rect(b.x, -32, 1, 20, C.wood3); k.rect(b.x + b.w - 1, -32, 1, 20, C.wood1); k.rect(b.x, -13, b.w, 1, C.wood1);
      k.rect(b.x, -32, b.w, 2, '#7a1e24');
      for (const px of [b.x + 4, b.x + 18, b.x + b.w - 30, b.x + b.w - 16]) { k.rect(px, -28, 12, 13, C.wood1); k.rect(px + 1, -27, 10, 11, C.wood3); k.rect(px + 1, -27, 10, 1, C.wood4); }
      k.circle(110, -21, 6, C.gold0); k.circle(110, -21, 5, C.gold1); scales(k, 110, -22, C.gold0, C.gold3);
      });
    },
    animate(k, t, state, z) {
      const v = vil(z), txt = code(v), run = state === 'working', idle = state === 'idle', wait = state === 'waiting', err = state === 'error', off = state === 'off', live = !off;
      const blink = Math.floor(t * 4) % 2;

      /* Pylon lamp and the court flag. */
      const lc = off ? C.glassDark : err ? (blink ? C.error : C.red0) : wait ? (blink ? C.waiting : S(C.waiting, -.35)) : C[state];
      k.rect(TOTEM.x + 4, -129, 8, 5, C.ink); k.rect(TOTEM.x + 5, -128, 6, 3, lc);
      if ((err || wait) && blink) k.alpha(.3, () => k.circle(TOTEM.x + 8, -127, 6, lc));
      const fx = 142, fy = -40, ft = live ? t : 0;
      Props.banner(k, fx, fy, C.red2, ft, 12);
      if (z.detail) { const w2 = Math.round(Math.sin(ft * 3 - 2 * .6) * 1.5), w4 = Math.round(Math.sin(ft * 3 - 4 * .6) * 1.5); k.px(fx + 3, fy - 17 + w2, C.white); k.px(fx + 3, fy - 16 + w2, C.white); k.px(fx + 4, fy - 18 + w2, C.white); k.px(fx + 4, fy - 15 + w2, C.white); k.px(fx + 5, fy - 17 + w4, C.white); }

      /* Post office: clerks behind the counter windows, shutters down when off. */
      if (live) {
        WINS.forEach((w, i) => z.crew(w.x + 11, -50, { look: 2, hat: i === 1 ? 'cap' : 'none', hatColor: N, anim: run && i < 2 ? 'work' : 'idle', tool: 'pen', phase: i * .31, speed: 3, mark: false, facing: i === 2 ? -1 : 1 }));
        z.crew(PAR.x + 20, -48, { look: 5, hat: 'cap', hatColor: N, anim: 'idle', carry: run ? 'box' : '', mark: false, facing: -1 });
      } else {
        for (const w of WINS) k.blit(shutterS(w.w, 16), w.x, -76);
        k.blit(shutterS(PAR.w, 14), PAR.x, -72); k.blit(shutterS(DOOR.w, 34), DOOR.x, -74);
      }

      /* Citizens at the counters and in the queue. */
      const served = run ? [0, 1] : idle ? [0] : err ? [1] : [];
      served.forEach(i => z.crew(WINS[i].x + 11, -28, { look: [0, 4][i], hat: i ? 'scarf' : 'none', hatColor: C.plum3, anim: 'idle', carry: run && i === 0 ? 'mail' : '', facing: 1, phase: i * .5 }));
      const qn = run ? 3 : wait ? 6 : err ? 2 : 0;
      for (let i = 0; i < qn; i++) { const [qx, qy] = QUEUE[i]; z.crew(qx, qy, { look: (i * 2 + 1) % 6, hat: ['none', 'cap', 'straw', 'scarf', 'none', 'bandana'][i], hatColor: [C.teal2, C.wood2, '', C.plum3, '', C.red2][i], anim: 'idle', facing: -1, carry: i % 3 === 1 ? 'box' : i % 3 === 2 ? 'mail' : '', phase: i * .37, mark: !wait || i % 2 === 0 }); }

      /* Sorting station: two clerks file letters into the rack. */
      if (live) {
        for (let i = 0; i < 2; i++) z.crew(-66 + i * 22, 22, { look: 2, hat: 'cap', hatColor: N, anim: run ? 'work' : 'idle', tool: 'pen', phase: i * .5, speed: 5, facing: i ? -1 : 1, mark: i === 0 });
        const n = run ? 2 + Math.floor(t * 1.3) % 3 : wait ? 5 : idle ? 1 : 2;
        for (let i = 0; i < n; i++) k.blit(envS(i % 2 ? N : C.red2), -76 + i * 9, 25 - (i % 2));
      }

      /* Mail cart shuttles letters from the sorting station to the court. */
      let cx = CART_A[0], cy = CART_A[1], mode = 'empty', dir = 1, moving = false, cp = 0;
      if (run) {
        cp = (t * .07) % 1;
        const lerp = q => [Math.round(CART_A[0] + (CART_B[0] - CART_A[0]) * q), Math.round(CART_A[1] + (CART_B[1] - CART_A[1]) * q)];
        if (cp < .4) { [cx, cy] = lerp(ease(cp / .4)); mode = 'full'; moving = true; }
        else if (cp < .5) { [cx, cy] = CART_B; mode = cp < .44 ? 'full' : 'empty'; }
        else if (cp < .9) { [cx, cy] = lerp(1 - ease((cp - .5) / .4)); dir = -1; moving = true; }
        else mode = cp > .95 ? 'full' : 'empty';
      } else if (wait) { [cx, cy] = CART_B; mode = 'full'; }
      else if (err) { cx = 14; cy = 44; mode = 'tipped'; }
      k.ellipse(cx + 1, cy, 12, 2, C.shadow);
      k.blit(cartSprite(mode), cx, cy, dir === -1);
      if (run) z.crew(cx - dir * 17, cy + 1, { look: 2, hat: 'cap', hatColor: N, anim: moving ? 'walk' : 'idle', facing: dir, phase: .2 });
      if (err) z.crew(cx + 20, cy - 2, { look: 2, hat: 'cap', hatColor: N, anim: 'idle', facing: -1 });
      if (run && cp > .4 && cp < .5) for (let i = 0; i < 3; i++) {
        const q = Math.min(1, Math.max(0, (cp - .4) / .1 * 1.6 - i * .3));
        if (q > 0 && q < 1) k.blit(envS(i % 2 ? N : C.red2), CART_B[0] + (72 - CART_B[0]) * q, CART_B[1] - 20 + (-42 - CART_B[1] + 20) * q - Math.sin(q * Math.PI) * 16);
      }

      /* The judge at the bench: reads (idle), gavel raised (waiting), strikes (working). */
      const g = (t * .9) % 1, cyc = Math.floor(t * .9), okV = P.hash(cyc, 7) > .35;
      k.at(-14, 0, () => {   // the courthouse sits 14 px west
      let pose = 'read';
      if (run) pose = g < .4 ? 'read' : g > .72 && g < .86 ? 'strike' : 'raise';
      else if (wait) pose = 'raise';
      if (live) k.blit(judgeSprite(pose), JUDGE.x, JUDGE.y);
      const b = BENCH;
      k.rect(b.x, b.y, b.w, 4, C.wood4); k.rect(b.x, b.y, b.w, 1, C.wood5); k.rect(b.x, b.y + 3, b.w, 1, C.wood2);
      k.rect(121, -38, 7, 3, C.wood1); k.rect(121, -38, 7, 1, C.wood3);
      if (live && pose === 'raise') { k.rect(119, -62, 1, 6, C.wood3); k.rect(115, -65, 8, 3, C.wood1); k.rect(115, -65, 8, 1, C.wood3); k.rect(117, -65, 1, 3, C.gold2); }
      else { if (live && pose === 'strike') k.line(120, -42, 122, -40, C.wood3); k.rect(122, -41, 6, 3, C.wood1); k.rect(122, -41, 6, 1, C.wood3); k.rect(124, -41, 1, 3, C.gold2); }
      if (run && pose === 'strike') { k.px(119, -45, C.white); k.px(118, -46, C.white); k.px(130, -45, C.white); k.px(131, -46, C.white); k.px(125, -47, C.gold4); k.px(125, -48, C.gold4); }
      if (wait) k.blit(pileS(), 79, -34);
      else if (live) { const n = run ? 1 + Math.floor(t * .9) % 3 : err ? 3 : 1; for (let i = 0; i < n; i++) k.blit(envS(err ? C.red2 : N), 84 + (i % 2) * 2 + (err ? i * 5 : 0), -40 - (err ? i % 2 : i * 2)); }
      // Brass desk lamp: amber while letters wait, red on error.
      const lamp = wait ? (Math.floor(t * 2.5) % 2 ? C.waiting : S(C.waiting, -.3)) : err ? (blink ? C.error : C.red0) : live ? C.glassLit : C.glassDark;
      k.rect(135, -37, 7, 1, C.gold0); k.rect(138, -42, 1, 5, C.gold1); k.rect(135, -46, 7, 4, lamp); k.rect(135, -46, 7, 1, S(lamp, .3)); k.rect(134, -42, 9, 1, C.gold1);
      if ((wait || err) && blink) k.alpha(.3, () => k.circle(138, -44, 7, lamp));
      });

      /* Stamping table: the clerk stamps each letter green (approved) or red (rejected). */
      const ty = TABLE.y - 8, sx = TABLE.x + 16;
      if (live) z.crew(TABLE.x + 26, TABLE.y - 10, { look: 5, hat: 'none', anim: run ? 'work' : 'idle', tool: 'pen', facing: -1, phase: .4, speed: 4, mark: false });
      const gN = run ? 2 + cyc % 4 : idle ? 4 : wait ? 1 : err ? 1 : 3, rN = run ? 1 + (cyc >> 1) % 3 : idle ? 2 : wait ? 0 : err ? 2 : 1;
      for (let i = 0; i < gN; i++) { k.rect(TABLE.x + 2, ty - 1 - i * 2, 9, 2, i % 2 ? C.paper2 : C.paper); k.rect(TABLE.x + 7, ty - 1 - i * 2, 2, 1, C.leaf2); }
      for (let i = 0; i < rN; i++) { k.rect(TABLE.x + 24, ty - 1 - i * 2, 9, 2, i % 2 ? C.paper2 : C.paper); k.rect(TABLE.x + 29, ty - 1 - i * 2, 2, 1, C.red2); }
      const down = run && g > .86 && g < .95, stamped = run && g >= .86, vc = okV ? C.leaf2 : C.red2;
      if (run || wait || idle) { k.rect(sx - 5, ty - 1, 11, 3, C.paper); k.rect(sx - 5, ty - 1, 11, 1, C.white); }
      if (stamped) { if (okV) { k.ring(sx, ty, 3, 1, C.leaf1); k.px(sx, ty, C.leaf1); } else { k.line(sx - 3, ty - 1, sx + 3, ty + 1, C.red1); k.line(sx - 3, ty + 1, sx + 3, ty - 1, C.red1); } }
      const lift = down ? 0 : run ? 3 + Math.round(Math.max(0, Math.sin(g * Math.PI * 2)) * 4) : 5, stY = ty - 2 - lift, sc = run ? vc : err ? C.red1 : C.leaf1;
      k.rect(sx - 4, stY - 2, 9, 3, sc); k.rect(sx - 4, stY - 2, 9, 1, S(sc, .35)); k.rect(sx - 1, stY - 7, 3, 5, C.wood3); k.circle(sx, stY - 9, 2, C.wood2); k.px(sx - 1, stY - 10, C.wood4);
      if (down) k.alpha(.6, () => k.ring(sx, ty, 7, 2, okV ? C.leaf4 : C.red3));
      if (stamped && z.detail) k.textBold(okV ? 'ONAY' : 'RET', sx, ty - 24, okV ? C.leaf4 : C.red3, C.ink);

      /* Public gallery. */
      const gal = run ? 3 : idle ? 2 : wait ? 4 : err ? 2 : 1;
      for (let i = 0; i < gal; i++) { const [gx, gy] = GAL[i]; z.crew(gx, gy - 1, { look: (i * 3 + 2) % 6, hat: ['none', 'straw', 'scarf', 'cap'][i], hatColor: [C.plum3, '', C.teal3, C.wood2][i], anim: err ? 'idle' : 'sit', facing: -1, phase: i * .6, mark: i === 0 }); }

      /* The yellow van: arrives, unloads, leaves (working); broken down and smoking (error). */
      let vx = VAN.x, va = 1, vmode = 'ok', bob = 0, vp = 0;
      if (run) {
        vp = (t / 14) % 1;
        if (vp < .2) { const q = vp / .2; vx = Math.round(VAN.x - 40 + ease(q) * 40); va = Math.min(1, q * 3); bob = Math.floor(t * 10) % 2; }
        else if (vp < .78) vmode = vp > .24 && vp < .74 ? 'open' : 'ok';
        else { const q = (vp - .78) / .22; vx = Math.round(VAN.x + q * q * 50); va = Math.max(0, 1 - q * 1.3); bob = Math.floor(t * 10) % 2; }
      } else if (err) vmode = 'broken';
      k.alpha(va, () => k.ellipse(vx + 2, VAN.y + 1, 25, 3, C.shadow));
      k.blit(vanSprite(txt, vmode), vx, VAN.y - bob, false, va);
      if (run && vmode === 'open') {
        const q = ((vp - .24) / .5 * 3) % 1, back = q > .5, w = back ? (1 - q) * 2 : q * 2;
        z.crew(Math.round(-156 + (-150 + 156) * 0 - w * 10), Math.round(112 - w * 26), { look: 2, hat: 'cap', hatColor: N, anim: 'walk', carry: back ? '' : 'box', facing: back ? 1 : -1, phase: .1 });
      } else if (idle) z.crew(-78, 80, { look: 2, hat: 'cap', hatColor: N, anim: 'sit' });
      else if (err) {
        Props.smoke(k, VAN.x + 22, VAN.y - 22, t * 1.2, 6, '#2e2a28'); Props.smoke(k, VAN.x + 18, VAN.y - 30, t * .9 + .5, 4, '#8a8682'); if (z.detail) for (let i = 0; i < 3; i++) Props.sparkle(k, VAN.x + 20 + i * 2, VAN.y - 12 - i, t * 1.5 + i * .3, C.gold3);
        if (blink) { k.rect(VAN.x + 24, VAN.y - 11, 2, 2, '#f09a2a'); k.rect(VAN.x - 24, VAN.y - 16, 2, 2, '#f09a2a'); }
        k.blit(warnS(), VAN.x + 38, VAN.y + 12);
        z.crew(VAN.x + 36, VAN.y - 2, { look: 2, hat: 'cap', hatColor: N, anim: 'idle', facing: -1 });
      } else if (wait) z.crew(-78, 80, { look: 2, hat: 'cap', hatColor: N, anim: 'idle', mark: false });

      /* Error: envelopes scattered across the plaza, a few still fluttering. */
      if (err) SCAT.forEach(([x, y], i) => { const fl = i % 4 === 0 ? Math.round(Math.abs(Math.sin(t * 2 + i)) * 10) : 0; k.blit(envS(i % 3 ? C.red2 : N), x + (fl ? Math.round(Math.sin(t * 1.3 + i) * 4) : 0), y - fl); });

      /* Ambient life when calm. */
      if (idle && z.detail) { Props.butterfly(k, 130 + Math.sin(t * .8) * 16, 88 + Math.cos(t) * 5, t); Props.butterfly(k, -40 + Math.cos(t * .7) * 10, 66 + Math.sin(t * 1.1) * 4, t + .3, '#f6ecd0'); Props.bird(k, -120 + ((t * 12) % 80), -136 + Math.sin(t) * 3, t); }
    }
  };
})();
