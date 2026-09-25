/* Köle · The black forge: a Mordor / Diablo / Doom slave camp. A spiked forge tower with the lidless Eye, a lava
   forge and anvil where the dark overlord works, a hell portal with a toxic slime pit, a treadwheel turned by chained
   goblins under an imp's pitchfork and a demon's flaming whip, a haul yard where orcs and hollows drag a basalt block
   under an Uruk's whip and a bellowing cacodemon, a caged slave pen guarded by a Hell Knight, and a mess pit with a
   bubbling cauldron. Chained crews leave by the south gate for the lumberyard, mine and farm. Cartoon only: whips
   crack and creatures cower, nobody gets hurt. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.kole = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const HEX = [[-144, -160], [144, -160], [206, -5], [144, 150], [-144, 150], [-206, -5]];
  const BAS = ['#0c0a0e', '#16141a', '#222026', '#302c34', '#44404a', '#5c5864'];   // basalt and black iron
  const ASH = ['#1e1a1c', '#262022', '#2e2728', '#373031', '#463c3c'];
  const LAVA = ['#3a0e08', '#7a1a08', '#c8401a', '#ff7a22', '#ffc860', '#fff0c0'];
  const SLIME = ['#1a3a10', '#2e7a1a', '#4ec02a', '#9cff5a', '#e0ffb0'];
  const BONE = ['#8a8270', '#c8bea4', '#ece4cc'];
  const WOOD = ['#22160e', '#3a2418', '#5a3624', '#7a4a30'];
  const CLOTH = '#1a1418';

  const LEAD = { x: -86, y: 8 }, ANVIL = { x: -60, y: 6 }, REST = { x: -32, y: 30 };
  const TOWER = { x: -118, base: -46 }, MOUTH = { x0: -130, x1: -106, y0: -76, y1: -46 };
  const POOL = { x: -166, y: -10 }, CHAN = [[-118, -48], [-134, -38], [-152, -24], [-162, -14]];
  const PORTAL = { x: -26, y: -66 }, SLIMEP = { x: 22, y: -80 };
  const TW = { x: 112, y: -106, r: 24 }, ELEV = { x: 146, y0: -86, y1: -134 };
  const HAUL = { x0: 150, x1: 96, y: -12, period: 60 };
  const PEN = { x0: -184, x1: -40, y0: 40, y1: 136 }, CAGES = [[-162, -126], [-116, -80]], CAGE_Y = [52, 80], CAGE_H = 26;
  const MESS = { x: 112, y: 98 };
  const BEACON = { x: -2, y: -40 };
  const GANG = [[-62, 82], [-22, 86], [0, 100], [0, 146]];

  const along = (pts, p) => {
    const segs = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
    let d = p * L; for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
    return pts[pts.length - 1];
  };

  /* ---------- Small static props ---------- */
  const skull = (k, x, y) => { k.rect(x - 2, y - 4, 5, 3, BONE[2]); k.rect(x - 1, y - 1, 3, 1, BONE[1]); k.px(x - 2, y - 4, BONE[1]); k.px(x - 1, y - 3, C.ink); k.px(x + 1, y - 3, C.ink); k.px(x, y - 1, C.ink); };
  const bones = (k, x, y, d = 1) => { k.line(x, y, x + 5, y - d, BONE[1]); k.px(x - 1, y - 1, BONE[2]); k.px(x - 1, y + 1, BONE[2]); k.px(x + 6, y - d - 1, BONE[2]); k.px(x + 6, y - d + 1, BONE[2]); };
  const spike = (k, x, y, h) => { k.poly([[x - 1, y], [x + 2, y], [x, y - h]], BAS[2]); k.line(x - 1, y, x, y - h, BAS[4]); k.px(x, y - h, BAS[5]); };
  function spikeFence(k, x, y, len, vertical) {
    if (vertical) { for (let j = 0; j < len; j += 4) { k.rect(x, y + j - 10, 3, 10, BAS[1]); k.rect(x, y + j - 10, 1, 10, BAS[3]); k.px(x + 1, y + j - 11, BAS[4]); k.px(x + 1, y + j - 12, BAS[5]); } return; }
    k.rect(x + 1, y - 1, len, 2, C.shadow);
    for (let i = 0; i < len; i += 4) { k.rect(x + i, y - 10, 2, 10, BAS[1]); k.px(x + i, y - 10, BAS[3]); k.px(x + i, y - 11, BAS[4]); k.px(x + i + (i % 8 ? 1 : 0), y - 12, BAS[5]); }
    k.rect(x, y - 7, len, 2, BAS[2]); k.rect(x, y - 7, len, 1, BAS[4]); k.rect(x, y - 3, len, 1, BAS[2]);
  }
  const brazier = (k, x, y) => { k.ellipse(x + 1, y, 5, 1, C.shadow); k.line(x - 3, y, x, y - 6, BAS[3]); k.line(x + 3, y, x, y - 6, BAS[2]); k.rect(x - 4, y - 9, 9, 3, BAS[2]); k.rect(x - 4, y - 9, 9, 1, BAS[4]); k.rect(x - 3, y - 10, 7, 1, LAVA[1]); k.px(x - 4, y - 10, BAS[4]); k.px(x + 4, y - 10, BAS[4]); };
  const torch = (k, x, y) => { k.ellipse(x + 1, y, 3, 1, C.shadow); k.rect(x, y - 20, 2, 20, WOOD[1]); k.px(x, y - 20, WOOD[3]); k.rect(x - 1, y - 22, 4, 2, BAS[3]); k.px(x, y - 23, LAVA[1]); };
  function eyeBanner(k, x, y, h = 30) {
    k.ellipse(x + 2, y, 3, 1, C.shadow); k.rect(x, y - h, 2, h, BAS[1]); k.rect(x, y - h, 1, h, BAS[3]); spike(k, x + 1, y - h, 4);
    k.rect(x - 1, y - h + 2, 13, 1, BAS[3]);
    const bx = x + 2, by = y - h + 3; k.rect(bx, by, 9, 15, CLOTH); k.rect(bx, by, 1, 15, '#2a2228'); for (let i = 0; i < 9; i += 2) k.px(bx + i, by + 15, CLOTH);
    k.rect(bx + 2, by + 5, 5, 3, LAVA[2]); k.rect(bx + 1, by + 6, 7, 1, LAVA[2]); k.rect(bx + 3, by + 5, 3, 3, LAVA[3]); k.rect(bx + 4, by + 5, 1, 3, C.ink); k.px(bx + 3, by + 6, LAVA[4]);
    k.px(bx + 4, by + 3, LAVA[1]); k.px(bx + 2, by + 3, LAVA[1]); k.px(bx + 6, by + 3, LAVA[1]);
  }
  function weaponCrate(k, x, y) {
    k.line(x + 2, y - 8, x - 1, y - 20, BAS[4]); k.line(x + 5, y - 8, x + 6, y - 22, BAS[4]); k.px(x + 6, y - 22, BAS[5]); k.rect(x + 4, y - 12, 4, 1, WOOD[2]); k.rect(x, y - 13, 4, 1, WOOD[2]);
    k.line(x + 9, y - 8, x + 12, y - 19, WOOD[2]); k.poly([[x + 11, y - 19], [x + 14, y - 19], [x + 13, y - 24]], BAS[4]);
    Props.crate(k, x, y, 12); k.rect(x + 1, y - 7, 10, 1, BAS[1]); k.rect(x + 1, y - 3, 10, 1, BAS[1]);
  }
  const toxicBarrel = (k, x, y) => { k.ellipse(x + 3, y, 5, 1, C.shadow); k.rect(x - 1, y - 11, 9, 11, '#5a6a3a'); k.rect(x - 1, y - 11, 2, 11, '#7a8a4a'); k.rect(x + 6, y - 11, 2, 11, '#3a4a26'); k.rect(x - 1, y - 8, 9, 1, '#2a3418'); k.rect(x - 1, y - 3, 9, 1, '#2a3418'); k.ellipse(x + 3, y - 11, 4, 1, SLIME[2]); k.px(x + 2, y - 11, SLIME[4]); k.rect(x + 2, y - 7, 3, 3, '#e0c030'); k.px(x + 3, y - 6, C.ink); };

  // Cached frames: the treadwheel (charred timber, 8 spokes, tread slats), block and rollers.
  const tread = f => P.sprite(`kole2|tread|${f}`, 56, 56, 28, 28, q => {
    const r = TW.r, off = f / 8 * Math.PI / 4;
    for (let i = 0; i < 16; i++) { const a = off + i * Math.PI / 8, c = Math.cos(a), s = Math.sin(a); q.line(c * (r - 5), s * (r - 5), c * (r - 1), s * (r - 1), i % 2 ? WOOD[2] : WOOD[3], 2); }
    q.ring(0, 0, r, r, WOOD[1]); q.ring(0, 0, r - 1, r - 1, WOOD[3]); q.ring(0, 0, r - 5, r - 5, WOOD[1]);
    for (let i = 0; i < 8; i++) { const a = off + i * Math.PI / 4; q.line(0, 0, Math.cos(a) * (r - 5), Math.sin(a) * (r - 5), WOOD[2], 1); }
    for (let i = 0; i < 8; i++) { const a = off + i * Math.PI / 4 + .2; q.px(Math.cos(a) * r, Math.sin(a) * r, BAS[4]); }
    q.circle(0, 0, 4, BAS[2]); q.circle(0, 0, 2, BAS[4]); q.px(-1, -1, BAS[5]);
  }, BAS[0]);
  const block = () => P.sprite('kole2|block', 31, 22, 0, 21, q => {
    q.rect(0, -21, 30, 7, BAS[3]); q.rect(0, -21, 30, 1, BAS[5]); q.rect(0, -21, 1, 7, BAS[4]); q.dither(2, -19, 26, 4, BAS[4], 1);
    q.rect(0, -14, 30, 14, BAS[2]); q.rect(0, -14, 30, 1, BAS[3]); q.rect(0, -14, 1, 14, BAS[3]); q.rect(27, -14, 3, 14, BAS[1]); q.rect(0, -1, 30, 1, BAS[1]);
    // A carved eye rune glowing faintly on the face.
    q.rect(10, -9, 9, 3, LAVA[1]); q.rect(12, -10, 5, 5, LAVA[1]); q.rect(13, -9, 3, 3, LAVA[2]); q.px(14, -9, C.ink); q.px(14, -8, C.ink); q.px(14, -7, C.ink);
    q.line(3, -21, 7, -14, BAS[1]); q.line(23, -18, 21, -12, BAS[1]);
  }, BAS[0]);
  const roller = f => P.sprite(`kole2|roll|${f}`, 8, 8, 4, 4, q => {
    q.circle(0, 0, 3, WOOD[2]); q.circle(0, 0, 2, WOOD[3]); q.px(-1, -1, '#9a6a44');
    const a = f / 4 * Math.PI, cx = Math.round(Math.cos(a) * 2), cy = Math.round(Math.sin(a) * 2); q.line(cx, cy, -cx, -cy, WOOD[1]);
  }, BAS[0]);

  // A little flame in any colour set (for braziers, torches and the amber signal fire).
  const flame = (k, x, y, t, s, cols) => {
    const f = Math.floor(t * 12 + x) % 3;
    k.poly([[x - 3 * s, y], [x - 1, y - (7 + f) * s], [x + 1, y - 4 * s], [x + 2 * s, y - (6 - f) * s], [x + 3 * s, y]], cols[0]);
    k.poly([[x - 2 * s, y], [x, y - (5 + f) * s], [x + 2 * s, y]], cols[1]); k.px(x, y - 1, cols[2]);
  };
  const FL = { fire: ['#e0501e', '#ffb040', '#fff0c0'], amber: [C.waiting, '#ffe08a', '#fff6d8'], red: ['#c01a10', '#ff5a2a', '#ffc8a0'], low: [LAVA[1], LAVA[2], LAVA[3]] };
  const ember = (k, x, y, t, n, h = 30, col = LAVA[4]) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1; k.alpha(1 - q, () => k.px(x + Math.sin(q * 7 + i * 2.3) * 4 + i * 2 - n, y - q * h, q < .4 ? col : LAVA[3])); } };
  const blackSmoke = (k, x, y, t, n = 5) => Props.smoke(k, x, y, t * 1.3, n, '#141216');

  return {
    paint(k) {
      /* ---- Ground: ash and cinders over the whole tile, with cracked basalt flagstones and scorched earth ---- */
      k.polyTex(HEX, (x, y) => {
        const h = P.hash(Math.floor(x / 3), Math.floor(y / 3)), g = P.hash(x, y);
        if (g > .993) return LAVA[1]; if (g > .96) return ASH[4];
        return h < .25 ? ASH[1] : h < .6 ? ASH[2] : h < .85 ? ASH[3] : ASH[0];
      });
      // Road of cracked basalt slabs from the south gate up to the forge yard, and the yard itself.
      const slab = (x, y) => {
        const row = Math.floor((y + 400) / 6), off = row % 2 * 5, col = Math.floor((x + 400 + off) / 10);
        if ((y + 400) % 6 === 0 || (x + 400 + off) % 10 === 0) return BAS[0];
        const h = P.hash(col, row); if (P.hash(x, y) > .97) return BAS[1];
        return h < .3 ? BAS[2] : h < .8 ? BAS[3] : '#38343c';
      };
      k.polyTex([[-20, 150], [20, 150], [18, -30], [-18, -30]], slab);
      k.polyTex([[-140, -44], [-18, -44], [-18, 26], [-50, 30], [-128, 24], [-146, 6]], slab);
      // Scorch marks round the forge yard.
      for (const [x, y, r] of [[-60, 0, 16], [-110, -30, 14], [60, 30, 10], [-150, 30, 12]]) k.ditherEllipse(x, y, r, r * .45, ASH[0], 1);

      /* ---- Lava: a channel from the forge mouth down to a bubbling pool, and glowing fissures ---- */
      k.path(CHAN, ASH[0], 7); k.path(CHAN, LAVA[1], 5); k.path(CHAN, LAVA[2], 3); k.path(CHAN, LAVA[3], 1);
      k.ellipse(POOL.x, POOL.y, 22, 10, ASH[0]); k.ellipse(POOL.x, POOL.y, 20, 9, '#2a1410'); k.ellipse(POOL.x, POOL.y, 18, 8, LAVA[1]); k.ellipse(POOL.x + 1, POOL.y, 15, 6, LAVA[2]); k.ellipse(POOL.x + 2, POOL.y - 1, 10, 4, LAVA[3]); k.ellipse(POOL.x + 1, POOL.y - 1, 5, 2, LAVA[4]);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; k.rect(POOL.x + Math.cos(a) * 19, POOL.y + Math.sin(a) * 9, 2, 1, BAS[2]); }
      const fissure = (pts) => { k.path(pts, '#140c0c', 3); k.path(pts, LAVA[1], 1); pts.forEach(([x, y], i) => i % 2 && k.px(x, y, LAVA[3])); };
      fissure([[-178, 30], [-170, 36], [-160, 34], [-150, 42]]); fissure([[60, 34], [72, 40], [80, 38], [92, 46]]); fissure([[150, 20], [160, 26], [172, 24]]);
      fissure([[-60, -140], [-50, -134], [-40, -136], [-30, -128]]); fissure([[30, 120], [40, 126], [44, 134]]); fissure([[-176, -60], [-168, -52], [-172, -44]]);

      /* ---- The black forge tower (Barad-dûr style) with its lava forge mouth ---- */
      const tx = TOWER.x, tb = TOWER.base;
      k.poly([[tx - 30, tb + 2], [tx + 32, tb + 2], [tx + 26, tb - 4], [tx - 26, tb - 4]], C.shadow);
      k.poly([[tx - 28, tb], [tx + 28, tb], [tx + 18, tb - 54], [tx + 12, tb - 90], [tx - 12, tb - 90], [tx - 18, tb - 54]], BAS[1]);
      k.poly([[tx - 28, tb], [tx - 16, tb], [tx - 8, tb - 54], [tx - 4, tb - 90], [tx - 12, tb - 90], [tx - 18, tb - 54]], BAS[2]);
      k.poly([[tx + 16, tb], [tx + 28, tb], [tx + 18, tb - 54], [tx + 12, tb - 90], [tx + 8, tb - 90], [tx + 10, tb - 54]], BAS[0]);
      k.line(tx - 28, tb, tx - 18, tb - 54, BAS[3]); k.line(tx - 18, tb - 54, tx - 12, tb - 90, BAS[3]);
      // Ledges with jutting spikes.
      for (const [y, w] of [[tb - 30, 24], [tb - 56, 18], [tb - 76, 14]]) {
        k.rect(tx - w - 2, y, 2 * w + 4, 3, BAS[2]); k.rect(tx - w - 2, y, 2 * w + 4, 1, BAS[4]); k.rect(tx - w - 2, y + 3, 2 * w + 4, 1, BAS[0]);
        k.line(tx - w - 2, y + 1, tx - w - 7, y - 3, BAS[3]); k.px(tx - w - 7, y - 3, BAS[5]); k.line(tx + w + 2, y + 1, tx + w + 7, y - 3, BAS[2]); k.px(tx + w + 7, y - 3, BAS[4]);
        for (let x = tx - w + 2; x < tx + w; x += 6) spike(k, x, y, 3);
      }
      // Window slits (they glow in animate).
      for (const [x, y] of [[tx - 10, tb - 46], [tx + 6, tb - 46], [tx - 6, tb - 68], [tx + 3, tb - 68], [tx - 2, tb - 84]]) { k.rect(x, y, 2, 5, BAS[0]); k.px(x, y + 4, LAVA[1]); }
      // Crown: two hooked prongs with the Eye's cradle between them.
      k.poly([[tx - 14, tb - 90], [tx - 5, tb - 90], [tx - 8, tb - 100], [tx - 14, tb - 108], [tx - 13, tb - 98]], BAS[2]); k.line(tx - 14, tb - 90, tx - 14, tb - 108, BAS[4]);
      k.poly([[tx + 5, tb - 90], [tx + 14, tb - 90], [tx + 13, tb - 98], [tx + 14, tb - 108], [tx + 8, tb - 100]], BAS[1]); k.line(tx + 14, tb - 90, tx + 14, tb - 108, BAS[3]);
      k.rect(tx - 6, tb - 92, 12, 3, BAS[2]); k.rect(tx - 6, tb - 92, 12, 1, BAS[4]);
      // Forge mouth: a pointed arch opening onto a lava hearth.
      const M = MOUTH;
      k.poly([[M.x0 - 3, M.y1], [M.x0 - 3, M.y0 + 8], [(M.x0 + M.x1) / 2, M.y0 - 4], [M.x1 + 3, M.y0 + 8], [M.x1 + 3, M.y1]], BAS[3]);
      k.poly([[M.x0, M.y1], [M.x0, M.y0 + 9], [(M.x0 + M.x1) / 2, M.y0], [M.x1, M.y0 + 9], [M.x1, M.y1]], '#0a0608');
      k.rect(M.x0 + 2, M.y1 - 8, M.x1 - M.x0 - 4, 8, LAVA[1]); k.rect(M.x0 + 4, M.y1 - 6, M.x1 - M.x0 - 8, 4, LAVA[2]); k.rect(M.x0 + 7, M.y1 - 5, M.x1 - M.x0 - 14, 2, LAVA[3]);
      skull(k, (M.x0 + M.x1) / 2, M.y0 - 5);
      for (const x of [M.x0 - 6, M.x1 + 4]) { k.rect(x, M.y1 - 22, 3, 22, BAS[2]); k.rect(x, M.y1 - 22, 1, 22, BAS[4]); spike(k, x + 1, M.y1 - 22, 5); }
      // Coal heap and ore bins by the tower.
      k.ellipse(-164, -40, 12, 5, '#141216'); for (let i = 0; i < 14; i++) k.px(-174 + P.hash(i, 81) * 20, -44 + P.hash(i, 82) * 7, i % 3 ? BAS[3] : BAS[4]);
      weaponCrate(k, -96, -44); weaponCrate(k, -82, -40);
      // Anvil on a black stone block, a rack of spiked maces and a lava quench trough.
      const A = ANVIL; k.ellipse(A.x + 3, A.y + 1, 13, 3, C.shadow);
      k.rect(A.x - 7, A.y - 9, 14, 10, BAS[2]); k.rect(A.x - 7, A.y - 9, 3, 10, BAS[3]); k.rect(A.x + 5, A.y - 9, 2, 10, BAS[1]);
      k.rect(A.x - 4, A.y - 14, 8, 5, BAS[1]); k.rect(A.x - 4, A.y - 14, 2, 5, BAS[3]);
      k.poly([[A.x - 12, A.y - 18], [A.x + 9, A.y - 18], [A.x + 9, A.y - 14], [A.x - 5, A.y - 14], [A.x - 9, A.y - 16]], BAS[2]); k.rect(A.x - 9, A.y - 19, 18, 2, BAS[4]); k.rect(A.x - 6, A.y - 19, 12, 1, BAS[5]); k.px(A.x - 12, A.y - 18, BAS[4]);
      k.ellipse(-30, -8, 12, 3, C.shadow); k.rect(-42, -18, 24, 10, BAS[2]); k.rect(-42, -18, 24, 2, BAS[4]); k.rect(-40, -16, 20, 3, LAVA[2]); k.rect(-40, -16, 20, 1, LAVA[3]); k.rect(-42, -10, 2, 3, BAS[1]); k.rect(-20, -10, 2, 3, BAS[1]);
      k.rect(-146, -12, 20, 2, BAS[2]); for (let i = 0; i < 4; i++) { const x = -144 + i * 5; k.line(x, -12, x, -26, WOOD[2]); k.circle(x, -27, 2, BAS[2]); k.px(x - 2, -27, BAS[4]); k.px(x + 2, -27, BAS[4]); k.px(x, -30, BAS[4]); }
      // The overlord's throne of black stone, where he dozes when the camp is off.
      const R = REST; k.ellipse(R.x + 2, R.y + 1, 14, 3, C.shadow);
      k.rect(R.x - 14, R.y - 44, 22, 38, BAS[1]); k.rect(R.x - 14, R.y - 44, 2, 38, BAS[3]); k.rect(R.x + 6, R.y - 44, 2, 38, BAS[0]);
      for (const x of [-14, -7, 0, 6]) spike(k, R.x + x + 1, R.y - 44, x === -7 || x === 0 ? 7 : 5);
      k.rect(R.x - 8, R.y - 32, 10, 3, LAVA[2]); k.rect(R.x - 10, R.y - 31, 14, 1, LAVA[2]); k.rect(R.x - 6, R.y - 33, 6, 5, LAVA[3]); k.rect(R.x - 3, R.y - 33, 1, 5, C.ink); k.px(R.x - 5, R.y - 32, LAVA[5]); k.rect(R.x - 16, R.y - 16, 3, 8, BAS[3]); k.rect(R.x + 7, R.y - 16, 3, 8, BAS[1]); spike(k, R.x - 15, R.y - 16, 3); spike(k, R.x + 8, R.y - 16, 3);
      k.rect(R.x - 16, R.y - 8, 26, 8, BAS[2]); k.rect(R.x - 16, R.y - 8, 26, 2, BAS[4]); k.rect(R.x - 16, R.y - 1, 26, 1, BAS[0]);

      /* ---- Hell portal (Doom) with a pentagram, and a toxic slime pit with leaking barrels ---- */
      const px = PORTAL.x, py = PORTAL.y;
      k.ellipse(px, py + 8, 22, 7, '#1a1012'); k.ring(px, py + 8, 20, 6, LAVA[1]); k.ring(px, py + 8, 18, 5, '#5a1410');
      const star = [0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return [px + Math.cos(a) * 18, py + 8 + Math.sin(a) * 5]; });
      for (let i = 0; i < 5; i++) k.line(star[i][0], star[i][1], star[(i + 2) % 5][0], star[(i + 2) % 5][1], LAVA[1]);
      k.ellipse(px, py - 26, 17, 28, '#0e0808'); k.ellipse(px, py - 26, 14, 25, '#2a0a0a'); k.ellipse(px, py - 24, 9, 18, '#4a0e0a');
      for (const s of [-1, 1]) { const x = px + s * 20 - 4; k.rect(x, py - 52, 8, 52, BAS[2]); k.rect(x, py - 52, 2, 52, BAS[4]); k.rect(x + 6, py - 52, 2, 52, BAS[0]); for (let y = py - 48; y < py; y += 8) k.rect(x, y, 8, 1, BAS[1]); k.rect(x - 1, py - 3, 10, 3, BAS[3]); spike(k, x + 4, py - 52, 4); }
      k.poly([[px - 24, py - 50], [px - 18, py - 60], [px - 6, py - 66], [px + 6, py - 66], [px + 18, py - 60], [px + 24, py - 50], [px + 16, py - 52], [px + 6, py - 58], [px - 6, py - 58], [px - 16, py - 52]], BAS[3]);
      k.line(px - 24, py - 50, px - 6, py - 66, BAS[5]);
      skull(k, px, py - 60); k.line(px - 3, py - 63, px - 6, py - 67, BONE[1]); k.line(px + 3, py - 63, px + 6, py - 67, BONE[1]);
      // Slime pit.
      const sx = SLIMEP.x, sy = SLIMEP.y;
      k.ellipse(sx, sy, 17, 7, '#141a10'); k.ellipse(sx, sy, 15, 6, SLIME[0]); k.ellipse(sx + 1, sy, 12, 4, SLIME[1]); k.ellipse(sx + 2, sy - 1, 7, 2, SLIME[2]); k.px(sx - 3, sy - 1, SLIME[3]);
      toxicBarrel(k, 36, -92); toxicBarrel(k, 44, -84); k.ellipse(43, -80, 5, 1, SLIME[2]); toxicBarrel(k, 2, -96);

      /* ---- Treadwheel (top right): charred timber frame, drive belt and a bucket elevator ---- */
      k.rect(TW.x - 30, -82, 62, 5, WOOD[1]); k.rect(TW.x - 30, -82, 62, 1, WOOD[3]); k.rect(TW.x - 29, -77, 60, 1, BAS[0]);
      for (const s of [-1, 1]) { k.line(TW.x + s * 18, -80, TW.x + s * 3, TW.y, WOOD[2], 3); k.line(TW.x + s * 18, -80, TW.x + s * 3, TW.y, WOOD[3], 1); }
      k.rect(TW.x - 4, TW.y - 3, 8, 6, BAS[2]);
      k.line(TW.x, TW.y, ELEV.x, ELEV.y0 + 2, BAS[1], 2);
      k.ellipse(ELEV.x + 2, ELEV.y0 + 4, 9, 3, '#141216'); for (let i = 0; i < 8; i++) k.px(ELEV.x - 6 + P.hash(i, 91) * 14, ELEV.y0 + 2 + P.hash(i, 92) * 4, i % 2 ? BAS[4] : '#c98a4a');
      k.rect(ELEV.x - 5, ELEV.y1, 2, ELEV.y0 - ELEV.y1, WOOD[1]); k.rect(ELEV.x + 5, ELEV.y1, 2, ELEV.y0 - ELEV.y1, WOOD[1]);
      k.line(ELEV.x - 2, ELEV.y1, ELEV.x - 2, ELEV.y0, BAS[3]); k.line(ELEV.x + 3, ELEV.y1, ELEV.x + 3, ELEV.y0, BAS[3]);
      k.circle(ELEV.x, ELEV.y1, 3, BAS[2]); k.circle(ELEV.x, ELEV.y0, 3, BAS[2]);
      k.poly([[ELEV.x - 9, ELEV.y1 - 8], [ELEV.x + 3, ELEV.y1 - 8], [ELEV.x + 1, ELEV.y1 - 2], [ELEV.x - 7, ELEV.y1 - 2]], WOOD[2]); k.rect(ELEV.x - 9, ELEV.y1 - 8, 12, 1, WOOD[3]);
      eyeBanner(k, 72, -86, 32);

      /* ---- Haul yard: iron-shod skids from the quarry end to the finished-block stack ---- */
      k.ditherPoly([[30, -30], [194, -30], [196, 0], [28, 0]], ASH[0], 1);
      for (let x = 44; x < 192; x += 9) { k.rect(x, -19, 3, 12, WOOD[1]); k.px(x, -19, WOOD[3]); }
      k.rect(40, -19, 152, 2, BAS[2]); k.rect(40, -19, 152, 1, BAS[4]); k.rect(40, -8, 152, 2, BAS[2]); k.rect(40, -8, 152, 1, BAS[4]);
      for (const [x, y, w] of [[20, -30, 22], [23, -41, 16]]) { k.rect(x + 2, y, w, 2, C.shadow); k.rect(x, y - 11, w, 11, BAS[2]); k.rect(x, y - 11, w, 3, BAS[3]); k.rect(x, y - 11, w, 1, BAS[5]); k.rect(x + w - 2, y - 8, 2, 8, BAS[1]); k.px(x + 6, y - 5, LAVA[1]); }
      for (const [x, y] of [[184, -36], [60, -40], [140, 6]]) skull(k, x, y);
      bones(k, 170, 8); bones(k, 100, -38, -1);

      /* ---- Signal beacon at the head of the road (burns amber while waiting) ---- */
      k.ellipse(BEACON.x + 1, BEACON.y, 5, 1, C.shadow); k.rect(BEACON.x - 1, BEACON.y - 30, 3, 30, BAS[2]); k.rect(BEACON.x - 1, BEACON.y - 30, 1, 30, BAS[4]);
      k.rect(BEACON.x - 5, BEACON.y - 33, 11, 3, BAS[3]); k.rect(BEACON.x - 5, BEACON.y - 33, 11, 1, BAS[5]); k.px(BEACON.x - 6, BEACON.y - 34, BAS[4]); k.px(BEACON.x + 6, BEACON.y - 34, BAS[4]);

      /* ---- Slave pen (bottom left): spiked palisade, iron cages, straw, stakes and chains ---- */
      k.polyTex([[PEN.x0 + 8, PEN.y0], [PEN.x1, PEN.y0], [PEN.x1, PEN.y1 - 4], [-146, PEN.y1 - 4], [-186, 46]], (x, y) => { const h = P.hash(x >> 1, y >> 1); return h < .12 ? '#6a5a34' : h < .2 ? '#4a4028' : h < .55 ? '#2a2224' : '#302628'; });
      for (let i = 0; i < 26; i++) { const x = -150 + P.hash(i, 61) * 100, y = 98 + P.hash(i, 62) * 30; k.line(x, y, x + 3, y - 1, i % 2 ? '#8a7440' : '#6a5a34'); }
      spikeFence(k, PEN.x0 + 6, PEN.y0, PEN.x1 - PEN.x0 - 6);
      spikeFence(k, PEN.x1, PEN.y0 + 4, 22, true); spikeFence(k, PEN.x1, PEN.y0 + 58, 36, true);
      k.rect(PEN.x1 - 1, PEN.y0 + 26, 3, 4, BAS[4]); k.rect(PEN.x1 - 1, PEN.y0 + 54, 3, 4, BAS[4]);
      for (const [x0, x1] of CAGES) {
        const [y0, y1] = CAGE_Y;
        k.rect(x0, y0, x1 - x0, y1 - y0, '#3a3024'); for (let i = 0; i < 12; i++) k.line(x0 + 2 + P.hash(i, x0) * (x1 - x0 - 6), y0 + 2 + P.hash(i, 7) * (y1 - y0 - 4), x0 + 5 + P.hash(i, x0) * (x1 - x0 - 6), y0 + 2 + P.hash(i, 7) * (y1 - y0 - 4), '#7a6a3a');
        for (let x = x0; x <= x1; x += 4) { k.rect(x, y0 - CAGE_H, 1, CAGE_H, BAS[3]); }
        k.rect(x0, y0 - CAGE_H, x1 - x0 + 1, 2, BAS[3]); k.rect(x0, y0 - CAGE_H, x1 - x0 + 1, 1, BAS[5]);
        for (let y = y0; y <= y1; y += 4) { k.rect(x0, y - CAGE_H, 1, CAGE_H, BAS[2]); k.rect(x1, y - CAGE_H, 1, CAGE_H, BAS[2]); }
        k.line(x0, y0 - CAGE_H, x0, y1 - CAGE_H, BAS[4]); k.line(x1, y0 - CAGE_H, x1, y1 - CAGE_H, BAS[4]);
      }
      // Stakes with chains, a slop bucket and a skull post.
      for (const [x, y] of [[-150, 116], [-112, 124], [-74, 112]]) { k.rect(x, y - 8, 2, 8, BAS[2]); k.px(x, y - 8, BAS[4]); k.ring(x + 1, y - 5, 2, 1, BAS[4]); for (let i = 0; i < 5; i++) k.px(x + 3 + i * 2, y - 3 + (i % 2), BAS[4]); }
      k.rect(-60, 118, 8, 7, WOOD[2]); k.rect(-60, 118, 8, 1, WOOD[3]); k.rect(-59, 119, 6, 1, '#5a6a2a');
      k.rect(-54, 100, 2, 16, WOOD[1]); skull(k, -53, 100); skull(k, -53, 106);
      bones(k, -130, 104); bones(k, -96, 130, -1);
      eyeBanner(k, -176, 44, 30);

      /* ---- Mess pit (bottom right): a sunken fire pit with a cauldron, bone benches and supplies ---- */
      k.ellipse(MESS.x - 2, MESS.y + 8, 56, 26, '#1a1416'); k.ditherEllipse(MESS.x - 2, MESS.y + 8, 54, 24, ASH[3], 1);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; k.rect(MESS.x - 2 + Math.cos(a) * 55, MESS.y + 8 + Math.sin(a) * 25, 3, 2, i % 2 ? BAS[3] : BAS[2]); }
      // Cauldron on iron legs over a fire bed (the fire and slop animate).
      const cx = MESS.x, cy = MESS.y;
      k.ellipse(cx, cy + 4, 14, 4, '#140c0c'); k.ellipse(cx, cy + 4, 11, 3, LAVA[1]);
      for (const s of [-1, 1]) k.line(cx + s * 8, cy + 4, cx + s * 10, cy - 6, BAS[2], 2);
      k.ellipse(cx, cy - 8, 13, 9, BAS[1]); k.ellipse(cx - 2, cy - 10, 10, 6, BAS[2]); k.px(cx - 8, cy - 12, BAS[4]);
      k.ellipse(cx, cy - 16, 12, 4, BAS[3]); k.ellipse(cx, cy - 16, 10, 3, '#4a6a1a');
      k.rect(cx - 14, cy - 17, 3, 2, BAS[4]); k.rect(cx + 12, cy - 17, 3, 2, BAS[3]);
      // Bone benches and slab tables.
      for (const [x, y, w] of [[62, 124, 30], [128, 126, 24]]) { k.rect(x, y - 6, w, 4, BAS[3]); k.rect(x, y - 6, w, 1, BAS[5]); k.rect(x + 2, y - 2, 3, 3, BAS[1]); k.rect(x + w - 5, y - 2, 3, 3, BAS[1]); for (let i = 0; i < w - 6; i += 8) { k.rect(x + 3 + i, y - 8, 4, 2, BAS[1]); k.px(x + 4 + i, y - 8, '#5a6a2a'); } }
      Props.barrel(k, 160, 66); Props.barrel(k, 150, 72); Props.sack(k, 64, 62, '#5a4a36'); Props.sack(k, 72, 66, '#4e4030');
      for (let i = 0; i < 4; i++) { k.rect(84, 76 - i * 2, 8, 2, BAS[3]); k.px(84, 76 - i * 2, BAS[5]); }
      k.rect(128, 64, 2, 16, WOOD[1]); k.line(129, 66, 138, 64, WOOD[2]); k.rect(137, 64, 3, 5, BAS[3]);
      skull(k, 168, 94); bones(k, 60, 96);

      /* ---- Braziers, torches, banners and spikes around the camp ---- */
      for (const [x, y] of [[-36, 132], [36, 132], [46, -6], [-176, 20], [-56, -48]]) brazier(k, x, y);
      for (const [x, y] of [[-8, -150], [70, -146], [178, -30], [186, 30], [-150, -80]]) torch(k, x, y);
      eyeBanner(k, 190, -10, 30); eyeBanner(k, -196, -4, 28);
      for (let i = 0; i < 9; i++) spike(k, -186 + i * 6, -100 + (i % 2) * 3, 6 + (i % 3));
      for (let i = 0; i < 6; i++) spike(k, 150 + i * 6, 44 + (i % 2) * 2, 5 + (i % 2) * 2);
      for (const [x, y] of [[-190, 60], [96, 30], [-70, 40], [180, 110], [-20, -118], [120, -150], [-80, -150]]) skull(k, x, y);
      for (const [x, y, d] of [[84, 28, 1], [-192, 76, -1], [160, 120, 1], [40, -136, -1], [-40, -148, 1]]) bones(k, x, y, d);

      /* ---- South gate: spiked black pillars with skull caps and an iron lintel ---- */
      for (const s of [-1, 1]) {
        const x = s * 26 - 4; k.ellipse(x + 5, 142, 7, 2, C.shadow); k.rect(x, 108, 9, 34, BAS[2]); k.rect(x, 108, 2, 34, BAS[4]); k.rect(x + 7, 108, 2, 34, BAS[0]);
        for (let y = 112; y < 140; y += 7) k.rect(x, y, 9, 1, BAS[1]); spike(k, x + 2, 108, 6); spike(k, x + 6, 108, 5); skull(k, x + 4, 112);
      }
      k.rect(-22, 102, 44, 3, BAS[3]); k.rect(-22, 102, 44, 1, BAS[5]); for (let x = -20; x < 22; x += 5) spike(k, x, 102, 3);
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) k.px(s * 14 + (i % 2), 105 + i * 2, BAS[4]);
    },
    front(k) {
      // Front bars of the pen cages (the prisoners stand behind them).
      for (const [x0, x1] of CAGES) {
        const y1 = CAGE_Y[1];
        k.rect(x0, y1 - CAGE_H, x1 - x0 + 1, 2, BAS[3]); k.rect(x0, y1 - CAGE_H, x1 - x0 + 1, 1, BAS[5]);
        for (let x = x0; x <= x1; x += 4) { k.rect(x, y1 - CAGE_H, 1, CAGE_H, BAS[4]); k.px(x, y1 - CAGE_H + 1, BAS[5]); }
        k.rect(x0, y1 - 2, x1 - x0 + 1, 2, BAS[2]); k.rect(x0 + 14, y1 - 14, 6, 5, BAS[1]); k.px(x0 + 16, y1 - 12, C.gold1);
      }
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting', idle = state === 'idle';
      const crew = (x, y, o) => z.crew(Math.round(x), Math.round(y), o);
      const cage = (i, j) => [CAGES[i][0] + 8 + j * 12, CAGE_Y[0] + 16 + (j % 2) * 6];

      /* Lava pool and channel: always glowing, livelier while working, flaring in error. */
      const glow = run ? .5 : err ? .6 + Math.sin(t * 9) * .2 : live ? .3 : .15;
      k.alpha(glow + Math.sin(t * 2.3) * .08, () => { k.ellipse(POOL.x + 2, POOL.y - 1, 11, 4, LAVA[4]); k.ellipse(POOL.x + 1, POOL.y - 1, 5, 2, LAVA[5]); });
      const nb = run || err ? 4 : live ? 2 : 1;
      for (let i = 0; i < nb; i++) { const q = (t * (run ? .7 : .35) + i / nb) % 1, bx = POOL.x - 10 + P.hash(i, 3) * 20, by = POOL.y - 3 + P.hash(i, 4) * 5; if (q < .7) k.circle(bx, by, Math.round(q * 2.5), LAVA[4]); else k.ring(bx, by - 1, 3, 2, LAVA[5]); }
      for (let i = 0; i < (live ? 5 : 2); i++) { const [x, y] = along(CHAN, (t * .06 + i / 5) % 1); k.px(x, y, LAVA[5]); k.px(x + 1, y, LAVA[4]); }
      if (err) for (let i = 0; i < 5; i++) { const q = (t * 1.2 + i / 5) % 1; k.px(POOL.x + Math.sin(i * 2.1) * q * 16, POOL.y - 4 - Math.sin(q * Math.PI) * 14, q < .5 ? LAVA[5] : LAVA[3]); }
      if (live && z.detail) ember(k, POOL.x, POOL.y - 4, t, run ? 4 : 2, 26);

      /* Slime pit bubbles and the portal's swirling hellfire. */
      for (let i = 0; i < 3; i++) { const q = (t * .6 + i / 3) % 1, bx = SLIMEP.x - 8 + i * 7, by = SLIMEP.y - 1 + (i % 2); if (q < .75) k.circle(bx, by, Math.round(q * 2), SLIME[3]); else if (live) k.ring(bx, by - 1, 2, 1, SLIME[4]); }
      const pSpin = run ? 3 : err ? 6 : live ? 1 : 0, pc = err ? ['#ff2a1a', '#ffc8a0'] : wait ? [C.waiting, '#ffe8a0'] : [LAVA[2], LAVA[4]];
      if (live) {
        k.alpha(run || err ? .8 : .45, () => { for (let i = 0; i < 10; i++) { const a = t * pSpin + i * .63, r = 3 + (i * 7) % 13; k.px(PORTAL.x + Math.cos(a) * r * .6, PORTAL.y - 26 + Math.sin(a) * r * 1.2, i % 3 ? pc[0] : pc[1]); } });
        k.alpha((run ? .5 : .25) + Math.sin(t * 3) * .15, () => { k.ring(PORTAL.x, PORTAL.y + 8, 18, 5, pc[0]); });
      }

      /* The tower: glowing slits and the lidless flaming Eye between the prongs. */
      const tx = TOWER.x, tb = TOWER.base;
      for (const [x, y] of [[tx - 10, tb - 46], [tx + 6, tb - 46], [tx - 6, tb - 68], [tx + 3, tb - 68], [tx - 2, tb - 84]]) k.rect(x, y, 2, 4, !live ? LAVA[0] : err && Math.floor(t * 4) % 2 ? '#ff2a1a' : Math.floor(t * 2 + x) % 5 ? LAVA[3] : LAVA[4]);
      const ex = tx, ey = tb - 100;
      if (live) {
        const fcol = wait ? [C.waiting, '#ffe08a'] : err ? ['#c01a10', '#ff5a2a'] : [LAVA[2], LAVA[3]], fl = Math.floor(t * 10) % 3, big = run || err ? 1 : 0;
        k.poly([[ex - 9 - big, ey + 1], [ex - 7, ey - 5 - fl], [ex - 3, ey - 3], [ex, ey - 9 - big - (fl === 1 ? 2 : 0)], [ex + 3, ey - 3], [ex + 7, ey - 5 - (2 - fl)], [ex + 9 + big, ey + 1], [ex + 5, ey + 5], [ex - 5, ey + 5]], fcol[0]);
        k.ellipse(ex, ey, 7, 3, fcol[1]); k.ellipse(ex, ey, 5, 2, LAVA[5]);
        const look = run ? Math.round(Math.sin(t * .8) * 3) : 0; k.rect(ex + look, ey - 2, 1, 5, C.ink); k.px(ex + look, ey - 3, fcol[0]);
        if (z.detail) ember(k, ex, ey - 6, t, run ? 4 : 2, 22, fcol[1]);
      } else { k.ellipse(ex, ey, 6, 2, LAVA[0]); k.rect(ex - 5, ey, 11, 1, LAVA[1]); }
      if (err) blackSmoke(k, ex, ey - 6, t, 6);

      /* Forge mouth: roaring fire while working, banked embers otherwise, a flare in error. */
      const mx = (MOUTH.x0 + MOUTH.x1) / 2, my = MOUTH.y1 - 4;
      if (run) { k.alpha(.35 + Math.sin(t * 11) * .08, () => k.rect(MOUTH.x0 + 2, MOUTH.y0 + 10, MOUTH.x1 - MOUTH.x0 - 4, 18, LAVA[3])); Props.fire(k, mx, my, t, 1.3); ember(k, mx, my - 10, t, 5, 34); }
      else if (err) { Props.fire(k, mx, my, t * 1.6, 1.7); blackSmoke(k, mx, MOUTH.y0, t, 5); for (let i = 0; i < 6; i++) { const q = (t * 1.4 + i / 6) % 1; k.px(mx + Math.sin(i * 2.7) * q * 26, my - 4 - q * 18 + q * q * 20, q < .6 ? LAVA[5] : LAVA[2]); } }
      else if (live) flame(k, mx, my, t, 1, FL.low);
      if (run || idle) Props.smoke(k, tx, tb - 112, t * (run ? .9 : .4), run ? 4 : 2, '#3a3438');
      // Glowing ingot on the anvil and lava in the quench trough.
      if (run) { k.rect(ANVIL.x - 5, ANVIL.y - 21, 9, 2, Math.floor(t * 9) % 2 ? LAVA[4] : LAVA[3]); k.px(ANVIL.x - 5, ANVIL.y - 21, LAVA[5]); }
      else if (live) k.rect(ANVIL.x - 5, ANVIL.y - 21, 9, 2, LAVA[1]);
      if (live) k.alpha(.5 + Math.sin(t * 3) * .2, () => k.rect(-38, -16, 14, 1, LAVA[4]));
      if (run && Math.floor(t * .7) % 2) Props.smoke(k, -30, -18, t * 1.5, 3, '#6a6068');

      /* Braziers and torches: fire, amber signal fire while waiting, red flare in error, cold when off. */
      const fc = err ? FL.red : wait ? FL.amber : FL.fire;
      if (live) {
        for (const [x, y] of [[-36, 132], [36, 132], [46, -6], [-176, 20], [-56, -48]]) flame(k, x, y - 10, t, run || err ? 1 : .7, fc);
        for (const [x, y] of [[-8, -150], [70, -146], [178, -30], [186, 30], [-150, -80]]) flame(k, x + 1, y - 23, t, .6, fc);
      }
      // The signal beacon.
      if (wait) { flame(k, BEACON.x, BEACON.y - 33, t, 1.8, FL.amber); k.alpha(.25 + Math.sin(t * 4) * .1, () => k.circle(BEACON.x, BEACON.y - 38, 9, C.waiting)); Props.banner(k, BEACON.x + 2, BEACON.y - 2, C.waiting, t, 10); k.rect(BEACON.x + 6, BEACON.y - 8, 24, 9, C.ink); k.rect(BEACON.x + 7, BEACON.y - 7, 22, 7, C.waiting); k.text('HOLD', BEACON.x + 10, BEACON.y - 6, C.ink); }
      else if (err) { if (Math.floor(t * 4) % 2) flame(k, BEACON.x, BEACON.y - 33, t, 1.4, FL.red); blackSmoke(k, BEACON.x, BEACON.y - 40, t, 4); }
      else if (run) flame(k, BEACON.x, BEACON.y - 33, t, 1, FL.fire);
      else if (idle) flame(k, BEACON.x, BEACON.y - 33, t, .6, FL.low);

      /* Lost souls: fly out of the portal and circle the tower while working; drift when idle. */
      if (live && !wait) for (let i = 0; i < (run ? 3 : 1); i++) {
        const q = (t * .09 + i / 3) % 1, a = q * Math.PI * 2, x = run ? -70 + Math.cos(a) * 56 : -60 + Math.cos(a) * 20, y = run ? -118 + Math.sin(a) * 18 : -110 + Math.sin(a) * 6;
        crew(x, y, { kind: 'lostsoul', anim: err ? 'cower' : 'walk', facing: Math.sin(a) > 0 ? -1 : 1, phase: i * .3, state: err ? 'error' : 'working', mark: false });
      }

      /* Treadwheel: chained goblins walk it round under an imp's pitchfork and a demon's flaming whip. */
      const wf = run ? Math.floor(t * 8) % 8 : err ? Math.floor(t * 8) % 2 : 0, jam = err ? [0, 1, 0, -1][Math.floor(t * 12) % 4] : 0;
      k.blit(tread(wf), TW.x + jam, TW.y);
      if (err) { k.line(TW.x - 4, TW.y + 2, TW.x + 12, TW.y + 16, WOOD[0], 2); k.line(TW.x + 10, TW.y - 12, TW.x + 18, TW.y - 4, BAS[4]); Props.smoke(k, TW.x, TW.y - 6, t * 1.2, 4, '#2a2628'); if (Math.floor(t * 3) % 2) { k.rect(TW.x - 3, TW.y - 36, 7, 9, C.ink); k.rect(TW.x - 2, TW.y - 35, 5, 7, C.error); k.rect(TW.x, TW.y - 34, 1, 3, C.white); k.px(TW.x, TW.y - 30, C.white); } }
      // Bucket elevator.
      for (let i = 0; i < 4; i++) { const q = run ? (t * .25 + i / 4) % 1 : i / 4, y = ELEV.y0 - q * (ELEV.y0 - ELEV.y1); k.rect(ELEV.x - 4, y - 3, 6, 4, WOOD[2]); k.rect(ELEV.x - 4, y - 3, 6, 1, WOOD[3]); k.rect(ELEV.x - 3, y - 4, 4, 1, i % 2 ? '#c98a4a' : BAS[4]); }
      if (run) { const q = (t * 1.5) % 1; k.px(ELEV.x - 4 - q * 3, ELEV.y1 + q * 8, '#c98a4a'); }
      const IMP = { x: 80, y: -80 }, DEMON = { x: 58, y: -62 }, dOpt = { phase: .1, speed: 7 };
      const dAge = AgentCharacters.crackAge(t, dOpt), impJab = Math.floor(t * 4 + .5 * 7) % 4 >= 2;
      if (run) {
        crew(TW.x - 7, TW.y + 21, { kind: 'goblin', anim: impJab ? 'cower' : 'chained', facing: -1, look: 0, phase: .2 });
        crew(TW.x + 6, TW.y + 21, { kind: 'goblin', anim: dAge < .35 ? 'cower' : 'chained', facing: -1, look: 1, phase: .6 });
        crew(DEMON.x, DEMON.y, { kind: 'demon', anim: 'whip', facing: 1, lash: 30, ...dOpt });
        crew(IMP.x, IMP.y, { kind: 'imp', anim: 'work', tool: 'pitchfork', facing: 1, phase: .5, speed: 4 });
      } else if (idle) {
        crew(TW.x - 12, -80, { kind: 'goblin', anim: 'sit', chains: true, look: 0 }); crew(TW.x + 10, -80, { kind: 'goblin', anim: 'sit', chains: true, look: 1, facing: -1 });
        crew(DEMON.x, DEMON.y, { kind: 'demon', anim: 'idle', tool: 'spear', facing: 1 });
        crew(IMP.x, IMP.y, { kind: 'imp', anim: 'idle', tool: 'pitchfork', facing: 1 });
      } else if (wait) {
        crew(TW.x - 7, TW.y + 21, { kind: 'goblin', anim: 'idle', chains: true, facing: -1, look: 0 }); crew(TW.x + 6, TW.y + 21, { kind: 'goblin', anim: 'idle', chains: true, facing: -1, look: 1, phase: .5 });
        crew(DEMON.x, DEMON.y, { kind: 'demon', anim: 'idle', facing: 1, mark: false });
        crew(IMP.x, IMP.y, { kind: 'imp', anim: 'idle', tool: 'pitchfork', facing: 1, mark: false });
      } else if (err) {
        crew(TW.x - 30, -76, { kind: 'goblin', anim: 'cower', look: 0, facing: -1 }); crew(TW.x + 30, -74, { kind: 'goblin', anim: 'cower', look: 1, phase: .5, mark: false });
        crew(DEMON.x, DEMON.y, { kind: 'demon', anim: 'idle', facing: 1 });
        crew(IMP.x - 6, IMP.y + 4, { kind: 'imp', anim: 'cower', facing: -1, mark: false });
      } else {
        crew(DEMON.x, DEMON.y, { kind: 'demon', anim: 'sleep' }); crew(IMP.x, IMP.y, { kind: 'imp', anim: 'sleep', phase: .4 });
      }

      /* Haul yard: an Uruk whips the rope crew dragging a basalt block west; a troll shoves it and a cacodemon bellows. */
      const prog = run ? (t % HAUL.period) / HAUL.period : .35;
      const uOpt = { phase: .6, speed: 7 }, uAge = AgentCharacters.crackAge(t, uOpt), heave = run ? (uAge < .2 ? 0 : uAge < .5 ? 1 : 2) : 0;
      let bx = Math.round(HAUL.x0 - prog * (HAUL.x0 - HAUL.x1)) - heave;
      const slip = err ? 12 : 0; bx += slip;
      const HAULERS = [{ kind: 'orc', look: 0, dx: -16, y: -22 }, { kind: 'hollow', look: 1, dx: -28, y: -9 }, { kind: 'orc', look: 2, dx: -40, y: -22 }, { kind: 'hollow', look: 0, dx: -52, y: -9 }];
      const cOpt = { phase: .25, speed: 6 }, cAge = AgentCharacters.crackAge(t, cOpt);
      // The Uruk walks along behind the line.
      if (run) crew(bx - 26, -40, { kind: 'uruk', anim: 'whip', facing: -1, look: 0, lash: 26, ...uOpt });
      else if (idle) crew(bx - 26, -40, { kind: 'uruk', anim: 'idle', tool: 'spear', facing: -1, look: 0 });
      else if (wait) crew(bx - 26, -40, { kind: 'uruk', anim: 'idle', facing: -1, look: 0 });
      else if (err) crew(bx - 30, -40, { kind: 'uruk', anim: 'cheer', facing: 1, look: 0 });
      else crew(bx - 26, -40, { kind: 'uruk', anim: 'sleep', look: 0 });
      // Ropes (taut while hauling, slack otherwise; snapped in error).
      const rope = (y0, x1, y1, taut) => taut ? (k.line(bx, y0 + 1, x1, y1 + 1, WOOD[0]), k.line(bx, y0, x1, y1, '#c8b080')) : k.path([[bx, y0], [bx - 6, y0 + 8], [(bx + x1) / 2, Math.max(y0, y1) + 9], [x1 + 4, y1 + 7], [x1, y1]], '#a8905c');
      if (!err) { rope(-26, bx - 52, -34, run); rope(-18, bx - 54, -20, run); }
      else { k.path([[bx, -26], [bx - 4, -20], [bx - 5, -14]], '#a8905c'); k.path([[bx - 30, -14], [bx - 40, -12], [bx - 54, -14]], '#a8905c'); }
      // Rollers and the block.
      const rf = run ? Math.floor((t + prog * 30) * 6) % 4 : 0;
      if (err) { k.blit(roller(1), bx + 6, -8); k.blit(roller(2), bx + 22, -8); const rq = (t * .5) % 1; k.blit(roller(Math.floor(t * 8) % 4), bx + 36 + rq * 18, -6 + rq * 8); Props.smoke(k, bx + 4, -8, t * 1.4, 3, '#4a4448'); }
      else for (const dx of [2, 12, 22]) k.blit(roller(rf), bx + dx, -8);
      k.blit(block(), bx, HAUL.y + (err ? 1 : 0));
      if (wait) { k.rect(bx + 26, -52, 1, 20, BAS[4]); const fw = Math.floor(t * 3) % 2; k.poly([[bx + 27, -52], [bx + 36, -49 + fw], [bx + 27, -46]], C.waiting); k.px(bx + 26, -53, C.gold3); }
      if (err && Math.floor(t * 4) % 2) { k.rect(bx + 11, -52, 7, 11, C.ink); k.rect(bx + 12, -51, 5, 9, C.error); k.rect(bx + 14, -50, 1, 4, C.white); k.px(bx + 14, -44, C.white); }
      if (run && z.detail && uAge > .2 && uAge < .6) { const u = (uAge - .2) / .4; k.alpha((1 - u) * .7, () => { for (let i = 0; i < 3; i++) k.circle(bx + 32 + u * 6 + i * 3, -8 - u * 4 + i, 1 + u * 2, '#4a4040'); }); }
      // Haulers: pull, cower at each crack or bellow, then heave on; rest in chains when idle; scatter in error.
      HAULERS.forEach((h, i) => {
        const x = bx + h.dx, o = { kind: h.kind, look: h.look, phase: i * .3, facing: -1 };
        if (run) crew(x, h.y, { ...o, anim: uAge < .3 || (i >= 2 && cAge < .25) ? 'cower' : 'walk' });
        else if (idle) crew(x + 4, h.y + 2, { ...o, anim: 'sit', chains: true, facing: i % 2 ? 1 : -1 });
        else if (wait) crew(x, h.y, { ...o, anim: 'idle', chains: true });
        else if (err) crew(x - 10 + (i % 2) * 22, h.y + (i % 2 ? 12 : -6), { ...o, anim: 'cower', facing: i % 2 ? 1 : -1, mark: i === 0 });
      });
      if (run && z.detail) HAULERS.forEach((h, i) => { const q = (t * 1.1 + i * .37) % 1; if (q < .5) { const u = q / .5; k.px(bx + h.dx + 2 + u * 4, h.y - 19 - Math.sin(u * Math.PI) * 3 + u * 8, '#b6e2f0'); } });
      // The cave troll shoves from behind.
      if (run) crew(bx + 36, -10, { kind: 'troll', anim: 'walk', facing: -1, chains: true, phase: .1 });
      else if (idle) crew(bx + 38, -8, { kind: 'troll', anim: 'sit', facing: -1, chains: true });
      else if (wait) crew(bx + 36, -10, { kind: 'troll', anim: 'idle', facing: -1, chains: true });
      else if (err) crew(bx + 26, 12, { kind: 'troll', anim: 'cower', facing: 1 });
      else crew(bx + 38, -8, { kind: 'troll', anim: 'sleep', phase: .7 });
      // The cacodemon hovers over the line.
      const cy0 = -30 + Math.round(Math.sin(t * 1.3) * 2);
      if (run) crew(bx - 2, cy0, { kind: 'cacodemon', anim: 'whip', facing: -1, ...cOpt });
      else if (live) crew(bx - 2, cy0, { kind: 'cacodemon', anim: err ? 'cower' : 'idle', facing: -1, mark: false });
      else crew(bx - 6, -34, { kind: 'cacodemon', anim: 'sleep' });

      /* The overlord at the anvil (asleep on his throne when off). */
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});

      /* Forge stoker: a goblin shovels coal into the forge mouth. */
      if (run) crew(-152, -40, { kind: 'goblin', anim: 'work', tool: 'hoe', look: 2, facing: 1, phase: .3, speed: 4 });
      else if (idle) crew(-156, -38, { kind: 'goblin', anim: 'sit', chains: true, look: 2 });
      else if (wait) crew(-152, -40, { kind: 'goblin', anim: 'idle', look: 2, facing: 1 });
      else if (err) crew(-170, -30, { kind: 'goblin', anim: 'cower', look: 2, facing: -1 });

      /* Slave pen: a Hell Knight hurls green fireballs over the diggers; prisoners rest, wait or sleep in chains. */
      const HK = { x: -20, y: 62 }, hOpt = { phase: .45, speed: 5 }, hAge = AgentCharacters.crackAge(t, hOpt);
      if (run) {
        crew(-80, 68, { kind: 'zombie', anim: hAge < .4 ? 'cower' : 'work', tool: 'hoe', look: 0, facing: 1, phase: .2 });
        crew(-66, 84, { kind: 'zombie', anim: hAge < .4 ? 'cower' : 'work', tool: 'pick', look: 1, facing: 1, phase: .7 });
        crew(...cage(0, 0), { kind: 'hollow', anim: 'sit', chains: true, look: 2 });
        crew(HK.x, HK.y, { kind: 'hellknight', anim: 'whip', facing: -1, lash: 36, ...hOpt });
      } else if (idle) {
        crew(...cage(0, 0), { kind: 'hollow', anim: 'sit', chains: true, look: 2 }); crew(...cage(0, 2), { kind: 'orc', anim: 'sit', chains: true, look: 3, facing: -1 });
        crew(...cage(1, 1), { kind: 'goblin', anim: 'sit', chains: true, look: 1 });
        crew(-120, 112, { kind: 'zombie', anim: 'sit', chains: true, look: 0 }); crew(-90, 118, { kind: 'orc', anim: 'sit', chains: true, look: 1, facing: -1 });
        crew(HK.x, HK.y, { kind: 'hellknight', anim: 'idle', facing: -1 });
      } else if (wait) {
        crew(-80, 68, { kind: 'zombie', anim: 'idle', chains: true, look: 0 }); crew(-66, 84, { kind: 'zombie', anim: 'idle', chains: true, look: 1, phase: .5 });
        crew(...cage(0, 1), { kind: 'hollow', anim: 'idle', chains: true, look: 2, mark: false }); crew(...cage(1, 1), { kind: 'orc', anim: 'idle', chains: true, look: 3, mark: false });
        crew(HK.x, HK.y, { kind: 'hellknight', anim: 'idle', facing: -1, mark: false });
      } else if (err) {
        crew(-100, 70, { kind: 'zombie', anim: 'cower', look: 0, facing: -1 }); crew(-58, 112, { kind: 'zombie', anim: 'cower', look: 1, phase: .5, mark: false });
        crew(...cage(0, 1), { kind: 'hollow', anim: 'cower', look: 2, mark: false });
        crew(HK.x, HK.y, { kind: 'hellknight', anim: 'cheer', facing: -1 });
        Props.smoke(k, -70, 60, t * 1.2, 4, '#2a2e24');
      } else {
        // Everyone asleep in the pen and the cages.
        const SLEEP = [['orc', -150, 108], ['goblin', -134, 120], ['hollow', -118, 104], ['orc', -104, 126], ['zombie', -88, 108], ['goblin', -72, 124], ['orc', -140, 128], ['hollow', -60, 104], ['goblin', -120, 130]];
        SLEEP.forEach(([kind, x, y], i) => crew(x, y, { kind, look: i, phase: i * .23, facing: i % 2 ? -1 : 1, chains: i % 3 === 0 }));
        for (let j = 0; j < 3; j++) { crew(...cage(0, j), { kind: j === 1 ? 'goblin' : 'orc', look: j, phase: j * .31 + .1 }); crew(...cage(1, j), { kind: j === 1 ? 'hollow' : 'goblin', look: j + 1, phase: j * .27 + .5 }); }
        crew(HK.x, HK.y, { kind: 'hellknight', anim: 'sleep', phase: .2 });
      }

      /* Chain gang: chained orcs trudge out of the pen and through the south gate, and return laden. */
      if (run) {
        const kinds = [{ tool: 'axe', carry: 'wood', look: 0 }, { tool: 'pick', carry: 'ore', look: 2 }, { tool: 'hoe', carry: 'food', look: 1 }];
        kinds.forEach((c, i) => {
          const p = (t * .04 + i / 3) % 1, out = p < .5, q = out ? p * 2 : (1 - p) * 2, [x, y] = along(GANG, q), fade = Math.min(1, (1 - q) * 8);
          k.alpha(fade, () => crew(x + (out ? 3 : -3), y, { kind: 'orc', look: c.look, anim: out ? 'chained' : 'carry', chains: true, tool: out ? c.tool : '', carry: out ? '' : c.carry, facing: out ? (q < .4 ? 1 : 1) : -1, phase: i * .3 }));
        });
      }
      /* The Nazgûl patrols the road. */
      if (run) { const p = (t * .05) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2; crew(30, 26 + q * 66, { kind: 'wraith', anim: 'walk', facing: back ? -1 : 1, phase: .4 }); }
      else if (live) crew(30, 60, { kind: 'wraith', anim: err ? 'cheer' : 'idle', facing: -1, mark: err });
      else crew(30, 60, { kind: 'wraith', anim: 'sleep', z: false });

      /* Mess pit: the cauldron bubbles, an orc cook stirs, goblins queue and eat. */
      const cx = MESS.x, cy = MESS.y;
      if (live) {
        flame(k, cx - 5, cy + 4, t, run ? 1 : .6, err ? FL.red : FL.fire); flame(k, cx + 5, cy + 4, t + .3, run ? .9 : .5, err ? FL.red : FL.fire);
        for (let i = 0; i < (run || err ? 3 : 1); i++) { const q = (t * .9 + i / 3) % 1, bx2 = cx - 6 + i * 6; if (q < .7) k.circle(bx2, cy - 16, Math.round(q * 2), '#7aa02a'); else k.ring(bx2, cy - 17, 2, 1, '#a8d050'); }
        Props.smoke(k, cx, cy - 20, t * (run ? .8 : .4), run ? 3 : 1, err ? '#1a1a1a' : '#8a9a70');
      }
      if (err) { k.poly([[cx + 8, cy - 16], [cx + 14, cy - 12], [cx + 16, cy + 2], [cx + 28, cy + 8], [cx + 20, cy + 10], [cx + 10, cy + 6]], '#6a8a2a'); k.ellipse(cx + 22, cy + 9, 7, 2, '#5a7a22'); }
      const stir = Math.round(Math.sin(t * (run ? 4 : 0)) * 3);
      if (run) { k.line(cx + 22, cy - 26, cx + 2 + stir, cy - 16, WOOD[3]); crew(cx + 24, cy - 2, { kind: 'orc', anim: 'work', look: 3, facing: -1, phase: .1, speed: 4 }); }
      else if (live) crew(cx + 24, cy - 2, { kind: 'orc', anim: err ? 'cower' : 'idle', look: 3, facing: -1 });
      if (run) {
        crew(70, 104, { kind: 'goblin', anim: 'idle', look: 0, facing: 1, phase: .2 }); crew(82, 108, { kind: 'goblin', anim: 'idle', look: 1, facing: 1, phase: .6 });
        crew(72, 132, { kind: 'imp', anim: 'sit', look: 1 }); crew(134, 134, { kind: 'hollow', anim: 'sit', look: 0, facing: -1 });
      } else if (idle) {
        crew(68, 132, { kind: 'goblin', anim: 'sit', look: 0 }); crew(80, 134, { kind: 'orc', anim: 'sit', look: 1, facing: -1 }); crew(130, 134, { kind: 'hollow', anim: 'sit', look: 0 }); crew(144, 136, { kind: 'imp', anim: 'sit', look: 2, facing: -1 });
      } else if (wait) {
        [60, 72, 84, 96].forEach((x, i) => crew(x, 102 + (i % 2) * 4, { kind: i % 2 ? 'orc' : 'goblin', anim: 'idle', look: i, facing: 1, phase: i * .3, mark: i === 1 }));
      } else if (err) {
        crew(64, 120, { kind: 'goblin', anim: 'cower', look: 0, facing: -1 }); crew(150, 120, { kind: 'imp', anim: 'cower', look: 1, mark: false });
      }

      if (err) blackSmoke(k, 40, -60, t, 3);
    }
  };
})();
