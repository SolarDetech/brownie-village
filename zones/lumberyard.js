/* Lumberyard · Isengard felling ground: a scorched dead forest where orcs fell black trees under the whip, a cave troll
   dragging logs on a chain, the chopping yard, the fire pit under the black spire that swallows the logs, the war-machine
   workshop (with Doom's toxic barrels and a Hell Knight foreman), and the slave pen with its cage and signal tower.
   Resource zone: no lead. Cartoonish: whips crack and workers flinch, no blood. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.lumberyard = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ASH = ['#1c1818', '#2e2826', '#3e3633', '#4c4440', '#5a514c', '#6c625b', '#8a8078'];
  const BARK = ['#0c0909', '#171112', '#231b1b', '#352a28', '#5e4e47'];
  const LAVA = ['#5a140c', '#8e200e', '#c43a12', '#ec6418', '#ff9a2a', '#ffcc55', '#fff2b0'];
  const IRON = ['#111114', '#1e1f24', '#2e3038', '#454854', '#646876', '#8c909c'];
  const TOX = ['#173010', '#285a14', '#3f8e1c', '#62c42a', '#9ef04a', '#d8ff9a'];
  const BONE = ['#8a8070', '#b8ae98', '#dcd4bc', '#f4eedc'];
  const FELL = { x: -58, y: -70 };              // the dead tree that is felled, again and again
  const PIT = { x: 108, y: -38, rx: 38, ry: 14 }; // the fire pit under the spire
  const CHUTE = { x0: 34, y0: -58, x1: 72, y1: -42 };
  const DRAG = { x0: -164, x1: -72, y: -20 };  // the troll's log-drag lane to the log deck
  const TOWER = { x: -40, y: 122 };             // signal tower (amber fire when waiting)
  const PEN = { x0: -142, x1: -64, y0: 68, y1: 134 };

  /* ---------- Local helpers ---------- */
  const skull = (k, x, y) => { k.rect(x - 2, y - 4, 5, 4, BONE[2]); k.rect(x - 1, y, 3, 1, BONE[1]); k.px(x - 2, y - 4, BONE[3]); k.px(x - 1, y - 3, IRON[0]); k.px(x + 1, y - 3, IRON[0]); k.px(x + 2, y - 1, BONE[1]); };
  const stake = (k, x, y, h) => { k.rect(x, y - h, 3, h, BARK[2]); k.rect(x, y - h, 1, h, BARK[4]); k.rect(x + 2, y - h, 1, h, BARK[0]); k.rect(x, y - h - 1, 3, 1, BARK[3]); k.px(x + 1, y - h - 2, BARK[4]); k.px(x + 1, y - h - 3, BONE[1]); };
  // Spiked palisade: sharpened black stakes with a rope-lashed rail.
  const palisade = (k, x, y, w, h = 14) => {
    k.rect(x + 2, y, w + 2, 2, C.shadow);
    for (let i = 0; i < w; i += 4) stake(k, x + i, y, h - (P.hash(x + i, y) * 4 | 0));
    k.rect(x, y - (h >> 1) - 1, w, 2, BARK[1]); k.rect(x, y - (h >> 1) - 1, w, 1, BARK[3]);
    for (let i = 1; i < w; i += 4) k.px(x + i, y - (h >> 1), '#8a6a3a');
  };
  const palisadeV = (k, x, y, h) => { for (let i = 0; i < h; i += 3) { k.rect(x, y + i - 9, 3, 10, BARK[2]); k.rect(x, y + i - 9, 1, 10, BARK[4]); k.px(x + 1, y + i - 10, BARK[4]); } k.rect(x + 3, y - 8, 1, h + 8, BARK[0]); };
  // Iron chain along a line: alternating long and short links.
  const chain = (k, x0, y0, x1, y1, lit = IRON[5]) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2));
    for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); k.px(x, y, i % 2 ? IRON[3] : lit); if (i % 2 === 0) k.px(x, y + 1, IRON[1]); }
  };
  const sagChain = (k, x0, y0, x1, y1, sag = 4) => { const mx = (x0 + x1) >> 1, my = ((y0 + y1) >> 1) + sag; chain(k, x0, y0, mx, my); chain(k, mx, my, x1, y1); };
  // Iron brazier bowl on a tripod; the fire is animated.
  const brazier = (k, x, y) => {
    k.ellipse(x + 2, y + 1, 6, 2, C.shadow); k.line(x - 4, y, x - 1, y - 7, IRON[2]); k.line(x + 4, y, x + 1, y - 7, IRON[1]); k.rect(x, y - 7, 1, 7, IRON[3]);
    k.poly([[x - 6, y - 11], [x + 6, y - 11], [x + 4, y - 7], [x - 4, y - 7]], IRON[2]); k.rect(x - 6, y - 11, 13, 1, IRON[4]); k.rect(x - 5, y - 12, 11, 1, LAVA[0]); k.px(x - 5, y - 10, IRON[5]);
    for (const dx of [-6, 6]) k.px(x + dx, y - 12, IRON[4]);
  };
  const flame = (k, x, y, t, s = 1, hue = 0) => {
    const f = Math.floor(t * 12 + x) % 3, A = hue ? ['#b86a10', '#f4b73a', '#ffe08a'] : [LAVA[3], LAVA[4], LAVA[5]];
    k.poly([[x - 3 * s, y], [x - 1, y - (7 + f) * s], [x + 1, y - 4 * s], [x + 2 * s, y - (6 - f) * s], [x + 3 * s, y]], A[0]);
    k.poly([[x - 2 * s, y], [x, y - (5 + f) * s], [x + 2 * s, y]], A[1]); k.px(x, y - 1, A[2]);
  };
  const embers = (k, x, y, t, n, spread = 10, rise = 30, speed = .6) => {
    for (let i = 0; i < n; i++) { const q = (t * speed + i / n) % 1, ex = x + Math.sin(i * 2.3 + q * 4) * spread * (.3 + q), ey = y - q * rise; k.px(ex, ey, q < .4 ? LAVA[5] : q < .7 ? LAVA[4] : LAVA[2]); }
  };
  const cage = (k, x, y, w, h) => {
    k.rect(x + 3, y, w + 2, 3, C.shadow); k.rect(x, y - 3, w, 3, BARK[2]); k.rect(x, y - 3, w, 1, BARK[4]);
    k.rect(x + 1, y - h - 2, w - 2, h - 1, '#171214');
    for (let i = 0; i < w; i += 4) { k.rect(x + i, y - h, 1, h - 3, IRON[4]); k.rect(x + i + 1, y - h, 1, h - 3, IRON[1]); }
    k.rect(x - 1, y - h - 3, w + 2, 3, IRON[3]); k.rect(x - 1, y - h - 3, w + 2, 1, IRON[5]); k.rect(x, y - (h >> 1) - 2, w, 1, IRON[3]);
    k.rect(x + w - 6, y - (h >> 1) - 4, 4, 5, IRON[2]); k.px(x + w - 5, y - (h >> 1) - 3, C.gold2);
  };
  const toxBarrel = (k, x, y) => { // Doom-style slime drum, x,y bottom-left
    k.ellipse(x + 6, y + 1, 6, 2, C.shadow); k.rect(x + 1, y - 12, 9, 12, '#56613e'); k.rect(x, y - 10, 11, 8, '#56613e'); k.rect(x + 1, y - 12, 2, 12, '#7a8a58'); k.rect(x + 8, y - 12, 2, 12, '#3a4228');
    k.rect(x, y - 10, 11, 1, IRON[2]); k.rect(x, y - 3, 11, 1, IRON[2]); k.rect(x + 3, y - 8, 5, 4, '#e0b020'); k.px(x + 5, y - 7, IRON[0]); k.px(x + 4, y - 5, IRON[0]); k.px(x + 6, y - 5, IRON[0]);
    k.ellipse(x + 5, y - 12, 4, 1, TOX[3]); k.px(x + 3, y - 13, TOX[5]); k.rect(x + 8, y - 12, 1, 4, TOX[3]); k.px(x + 8, y - 8, TOX[4]);
  };
  const slime = (k, x, y, rx, ry) => { k.ellipse(x, y, rx + 1, ry + 1, TOX[0]); k.ellipse(x, y, rx, ry, TOX[2]); k.ellipse(x - 1, y - 1, rx - 2, Math.max(1, ry - 1), TOX[3]); k.rect(x - rx + 3, y - 1, 3, 1, TOX[5]); k.px(x + rx - 3, y, TOX[4]); };
  const logSide = (k, x, y, len, r = 3, burnt = true) => {
    const b = burnt ? ['#1e1614', '#342622', '#4a3830', '#6a5040'] : [C.wood0, C.wood1, C.wood2, C.wood3];
    k.rect(x + 2, y + r + 1, len, 1, C.shadow); k.rect(x, y - r, len, r * 2 + 1, b[1]); k.rect(x, y - r, len, 1, b[3]); k.rect(x, y - r + 1, len, 1, b[2]); k.rect(x, y + r, len, 1, b[0]);
    for (let i = 3; i < len - 1; i += 4) { const h = P.hash(x + i, y); k.rect(x + i, y - r + 2 + Math.floor(h * (r * 2 - 2)), 2, 1, h > .7 && burnt ? LAVA[1] : b[0]); }
    k.ellipse(x, y, Math.max(1, r - 1), r, b[1]); k.ellipse(x, y, Math.max(0, r - 2), r - 1, C.wood3); k.px(x, y, C.wood2); k.px(x - 1, y - r + 1, C.wood4);
  };
  const logEnd = (k, x, y, r) => { k.circle(x, y, r, '#2a1e1a'); k.circle(x, y, r - 1, C.wood3); k.px(x, y, C.wood1); k.px(x - 1, y - r + 1, C.wood4); };
  const stump = (k, x, y, r = 4) => { k.ellipse(x + 2, y + 1, r + 2, 2, C.shadow); k.rect(x - r, y - 4, r * 2 + 1, 4, BARK[2]); k.rect(x - r, y - 4, 1, 4, BARK[4]); k.px(x - r - 1, y - 1, BARK[2]); k.px(x + r + 1, y - 1, BARK[0]); k.ellipse(x, y - 4, r, 2, '#5a4232'); k.ring(x, y - 4, r - 2, 1, '#3a2a22'); k.px(x, y - 4, BARK[1]); k.px(x - r + 1, y - 5, '#7a5a40'); };
  // Dead tree as line segments (x0,y0,x1,y1,thick,tone) so the same tree can be drawn upright or rotated as it falls.
  const segCache = new Map();
  const deadSegs = (h, seed) => {
    const key = h + '|' + seed; if (segCache.has(key)) return segCache.get(key);
    const r = P.rng(seed * 7 + 3), s = []; let x = 0, y = 0; const lean = (r() - .5) * 6, steps = 4;
    s.push([-5, 1, 0, -4, 2, 1], [6, 1, 1, -4, 2, 1], [-1, 1, -7, 2, 1, 1], [2, 1, 7, 3, 1, 1]);
    for (let i = 0; i < steps; i++) {
      const nx = lean * (i + 1) / steps + (r() - .5) * 2, ny = -h * (i + 1) / steps; s.push([x, y, nx, ny, i < 1 ? 5 : i < 2 ? 4 : i < 3 ? 3 : 2, 2]);
      if (i > 0) { const side = (i + seed) % 2 ? 1 : -1, bl = h * (.22 + r() * .2), bx = x + side * bl * .75, by = y - bl * .6; s.push([x, y, bx, by, i < 3 ? 2 : 1, 2], [bx, by, bx + side * bl * .3, by - bl * .45, 1, 2], [bx, by, bx + side * bl * .45, by + 1, 1, 2]); }
      x = nx; y = ny;
    }
    s.push([x, y, x - 3, y - 3, 1, 3], [x, y, x + 2, y - 4, 1, 3]);
    segCache.set(key, s); return s;
  };
  const drawDead = (k, ox, oy, h, seed, a = 0) => {
    const ca = Math.cos(a), sa = Math.sin(a), T = (x, y) => [ox + x * ca - y * sa, oy + x * sa + y * ca];
    for (const [x0, y0, x1, y1, th, tone] of deadSegs(h, seed)) {
      const [ax, ay] = T(x0, y0), [bx, by] = T(x1, y1); k.line(ax, ay, bx, by, BARK[tone], th);
      if (th >= 2) k.line(ax - (th >> 1), ay, bx - (th >> 1), by, BARK[4], 1);
      if (th >= 4) k.line(ax - (th >> 1) + 1, ay, bx - (th >> 1) + 1, by, BARK[3], 1);
      if (th >= 3) k.line(ax + ((th - 1) >> 1), ay, bx + ((th - 1) >> 1), by, BARK[0], 1);
    }
  };
  const deadTree = (k, x, y, h, seed, glow = false) => {
    k.ellipse(x + 3, y + 1, 8, 2, C.shadow); drawDead(k, x, y, h, seed);
    if (glow) { k.px(x, y - 3, LAVA[4]); k.px(x, y - 4, LAVA[3]); k.px(x - 1, y - 7, LAVA[3]); k.px(x + 1, y - 10, LAVA[2]); k.px(x, y - 14, LAVA[2]); }
  };

  // Glowing fissures in the ash: jagged polylines, drawn dark-edged in paint and pulsed in animate.
  const CRACKS = [[[74, -26], [66, -18], [58, -16], [50, -8], [44, -6], [36, 2]], [[-150, -62], [-142, -58], [-134, -59], [-128, -54]], [[122, 110], [130, 114], [138, 113], [146, 118]], [[-40, 94], [-34, 100], [-26, 100], [-22, 106]]];
  const crackPaint = k => { for (const c of CRACKS) { k.path(c, ASH[0], 2); k.path(c, LAVA[1], 1); } };
  const crackGlow = (k, t, a) => { for (let j = 0; j < CRACKS.length; j++) k.alpha(a * (.6 + .4 * Math.sin(t * 2 + j * 1.7)), () => k.path(CRACKS[j], LAVA[4], 1)); };
  // Gibbet with a hanging iron cage (animated sway lives in animate).
  const GIB = { x: -156, y: 34 };

  /* ---------- Cached moving sprites ---------- */
  const fellSprite = step => P.sprite(`ly-hell-fell|${step}`, 100, 76, 30, 64, q => { drawDead(q, 0, 0, 50, 5, step * Math.PI / 18); }, null);
  const logSprite = (len, r) => P.sprite(`ly-hell-log|${len}|${r}`, len + 6, r * 2 + 6, 2, r + 2, q => logSide(q, 0, 0, len, r), null);
  const bigLog = () => P.sprite('ly-hell-biglog', 46, 14, 4, 6, q => { logSide(q, 0, 0, 40, 4); chain(q, 38, -2, 42, 0); }, null);
  const blitD = (k, s, x, y, off, flip = false) => { k.blit(s, x, y, flip); if (off) k.blit(P.tint(s, '#141c3c'), x, y, flip, .4); };
  const pitGlow = P.sprite('ly-hell-pitglow', 80, 32, 40, 16, q => { q.ellipse(0, 0, 36, 12, LAVA[3]); q.ellipse(-2, -1, 28, 9, LAVA[4]); q.ellipse(-4, -2, 16, 5, LAVA[5]); }, null);
  const halo = P.sprite('ly-hell-halo', 30, 30, 15, 15, q => q.circle(0, 0, 13, LAVA[4]), null);

  return {
    paint(k) {
      /* ---- Ground: black cinder forest floor to the north, trampled ash yard, a packed road to the gate ---- */
      const edge = x => -72 + Math.round(Math.sin(x * .05) * 5 + Math.sin(x * .13) * 2);
      k.rectTex(-210, -165, 420, 320, (x, y) => {
        const h = P.hash(x, y), g = P.hash(Math.floor((x + (y >> 2) * 3) / 5), y >> 2);
        if (y < edge(x)) { if (h < .05) return ASH[1]; if (h > .993) return LAVA[2]; if (h > .95) return ASH[5]; return g > .55 ? ASH[2] : g > .2 ? ASH[3] : '#453c38'; }
        if (Math.abs(x + Math.sin(y * .05) * 2) < 13 && y > 60) return h > .85 ? ASH[6] : g > .5 ? ASH[5] : '#645a53';
        if (y < edge(x) + 2) return ASH[2];
        if (h < .04) return ASH[2]; if (h > .975) return ASH[6]; if (h > .965) return '#5e2a1e';
        return g > .6 ? ASH[3] : g > .25 ? ASH[4] : '#554b46';
      });
      crackPaint(k);
      // Scorch marks and drag ruts.
      for (const [x, y, rx, ry] of [[-120, 20, 22, 8], [40, 30, 18, 6], [-10, -40, 20, 7], [150, 110, 16, 6], [-90, 100, 14, 5]]) { k.ditherEllipse(x, y, rx, ry, ASH[1], 0); k.ditherEllipse(x, y, rx - 5, ry - 2, ASH[0], 1); }
      for (const dy of [-2, 3]) { k.rect(DRAG.x0, DRAG.y + dy, DRAG.x1 - DRAG.x0 + 30, 1, ASH[1]); k.rect(DRAG.x0, DRAG.y + dy + 1, DRAG.x1 - DRAG.x0 + 30, 1, ASH[5]); }
      for (const dx of [-7, 6]) { k.rect(dx, 60, 1, 90, ASH[1]); }

      /* ---- Dead black forest (north) ---- */
      const back = [[-140, -128, 34, 1], [-124, -140, 40, 2], [-104, -130, 30, 3], [-86, -142, 44, 4], [-66, -132, 36, 6], [-46, -144, 42, 7], [-26, -130, 32, 8], [-6, -142, 44, 9], [14, -132, 36, 10], [34, -144, 40, 11], [54, -130, 30, 12], [72, -140, 38, 13], [90, -128, 30, 26], [-156, -114, 36, 27]];
      for (const [x, y, h, s] of back) deadTree(k, x, y, h, s);
      const mid = [[-172, -96, 40, 14, 1], [-148, -102, 46, 15, 0], [-124, -96, 38, 16, 1], [-102, -108, 48, 17, 0], [-10, -104, 42, 19, 1], [12, -96, 36, 20, 0], [36, -106, 46, 21, 1], [58, -98, 40, 22, 0], [82, -104, 38, 23, 1], [-188, -58, 34, 24, 1], [-180, -34, 30, 25, 0]];
      for (const [x, y, h, s, g] of mid) deadTree(k, x, y, h, s, g);
      // Clearing: stumps, stacked limbs, felling marks.
      k.ditherEllipse(FELL.x + 6, FELL.y + 2, 42, 10, ASH[3], 0);
      for (const [x, y, r] of [[-96, -80, 4], [-30, -82, 3], [-10, -74, 4], [-112, -64, 3], [-80, -96, 3], [-40, -100, 4], [-4, -90, 3], [-130, -80, 4]]) stump(k, x, y, r);
      stump(k, FELL.x, FELL.y, 5);
      for (let i = 0; i < 14; i++) k.px(FELL.x - 12 + P.hash(i, 4) * 30, FELL.y - 2 + P.hash(i, 5) * 8, i % 3 ? C.wood3 : C.wood4);
      for (let i = 0; i < 6; i++) k.line(-126 + i * 5, -58 - (i % 2) * 2, -118 + i * 5, -62 + (i % 3), BARK[2], 1);
      skull(k, -118, -84); skull(k, 2, -80);
      // Ember-lit smoulder in a few trunks.
      for (const [x, y] of [[-150, -110], [-60, -124], [30, -118], [70, -122]]) { k.px(x, y, LAVA[3]); k.px(x + 1, y - 2, LAVA[2]); }

      /* ---- Troll's drag lane and the log deck ---- */
      k.line(-78, -6, -18, -26, BARK[0], 2); k.line(-80, -30, -20, -44, BARK[0], 2);
      for (const [x, y] of [[-70, -34], [-72, -26], [-74, -18], [-66, -30], [-68, -22], [-64, -26], [-62, -34]]) logSide(k, x, y, 40, 3);
      for (const x of [-80, -24]) { k.rect(x, -18, 3, 12, BARK[1]); k.px(x, -18, BARK[4]); }
      for (let i = 0; i < 3; i++) { const x = -170 + i * 10, y = -48 + i * 2; stake(k, x, y, 12); }
      // A chain anchor post where the troll's harness hangs.
      k.rect(-176, -34, 4, 20, BARK[2]); k.rect(-176, -34, 1, 20, BARK[4]); k.rect(-178, -36, 8, 3, IRON[3]); sagChain(k, -172, -30, -162, -14, 3);

      /* ---- The black spire and the fire pit ---- */
      const sx = 112;
      k.poly([[sx - 12, -64], [sx + 14, -64], [sx + 10, -140], [sx - 8, -140]], IRON[1]);
      k.polyTex([[sx - 12, -64], [sx + 12, -64], [sx + 8, -140], [sx - 8, -140]], (x, y) => {
        const f = (y + 140) / 76, half = 8 + 4 * f, u = (x - sx + half) / (half * 2);
        if (u < .2) return IRON[3]; if (u > .78) return u > .9 ? IRON[0] : IRON[1];
        if ((y + 140) % 9 === 0) return IRON[1]; if (P.hash(x, y) > .97) return IRON[4];
        return IRON[2];
      });
      // Four horned crowns at the top (Orthanc style) and glowing arrow slits.
      for (const [dx, h] of [[-8, 14], [-3, 9], [3, 9], [7, 14]]) { k.poly([[sx + dx - 1, -140], [sx + dx + 2, -140], [sx + dx + (dx < 0 ? -2 : 3), -140 - h]], dx < 0 ? IRON[3] : IRON[1]); }
      k.rect(sx - 9, -142, 19, 3, IRON[2]); k.rect(sx - 9, -142, 19, 1, IRON[4]);
      for (const y of [-126, -108, -90]) { k.rect(sx - 1, y, 2, 5, LAVA[2]); k.px(sx - 1, y, LAVA[4]); }
      k.rect(sx - 14, -66, 29, 3, IRON[3]); k.rect(sx - 14, -66, 29, 1, IRON[4]);
      // Pit: stone rim, black throat, glowing coals (the flames are animated).
      k.ellipse(PIT.x + 3, PIT.y + 3, PIT.rx + 6, PIT.ry + 5, C.shadow);
      k.ellipse(PIT.x, PIT.y, PIT.rx + 5, PIT.ry + 4, ASH[4]); k.ellipse(PIT.x, PIT.y - 1, PIT.rx + 4, PIT.ry + 3, ASH[5]);
      for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, x = PIT.x + Math.cos(a) * (PIT.rx + 3), y = PIT.y + Math.sin(a) * (PIT.ry + 2); k.rect(x - 2, y - 1, 4, 3, i % 2 ? ASH[3] : ASH[5]); k.px(x - 2, y - 1, ASH[6]); }
      k.ellipse(PIT.x, PIT.y, PIT.rx, PIT.ry, '#140a08'); k.ellipse(PIT.x, PIT.y + 2, PIT.rx - 4, PIT.ry - 3, LAVA[0]);
      k.ditherEllipse(PIT.x, PIT.y + 3, PIT.rx - 8, PIT.ry - 5, LAVA[1], 0);
      for (let i = 0; i < 9; i++) logEnd(k, PIT.x - 24 + i * 6, PIT.y + 4 + (i % 2) * 2, 2);
      // Chute: a black timber trough that the logs slide down into the pit.
      k.line(CHUTE.x0, CHUTE.y0 + 5, CHUTE.x1, CHUTE.y1 + 5, BARK[0], 3); k.line(CHUTE.x0, CHUTE.y0, CHUTE.x1, CHUTE.y1, BARK[2], 4); k.line(CHUTE.x0, CHUTE.y0 - 2, CHUTE.x1, CHUTE.y1 - 2, BARK[4], 1);
      for (const x of [CHUTE.x0 + 4, CHUTE.x0 + 20]) { const y = CHUTE.y0 + (x - CHUTE.x0) * (CHUTE.y1 - CHUTE.y0) / (CHUTE.x1 - CHUTE.x0); k.rect(x, y + 2, 2, 10, BARK[1]); }
      for (let i = 0; i < 4; i++) logSide(k, 14 + (i % 2) * 4, -60 + i * 5, 22, 3);
      // Iron bellows and a gong beside the pit.
      k.poly([[150, -30], [166, -36], [166, -20], [150, -24]], '#3a2622'); k.rect(146, -30, 5, 6, IRON[3]); k.line(166, -28, 176, -40, BARK[3], 2);
      k.rect(66, -80, 2, 22, BARK[2]); k.rect(76, -80, 2, 22, BARK[2]); k.rect(64, -82, 16, 2, BARK[3]); k.circle(72, -70, 5, IRON[3]); k.circle(71, -71, 3, IRON[4]); k.px(70, -72, IRON[5]);

      /* ---- War-machine workshop (east) ---- */
      // Black timber lean-to with spiked ridge.
      const wx0 = 96, wx1 = 176;
      k.rect(wx0 + 3, -8, wx1 - wx0, 30, C.shadowSoft);
      k.rect(wx0, -4, wx1 - wx0, 26, BARK[1]); for (let x = wx0 + 2; x < wx1; x += 5) { k.rect(x, -4, 1, 26, BARK[0]); k.px(x + 2, 2 + (x * 7) % 16, BARK[3]); }
      for (const x of [wx0 + 8, wx0 + 30, wx0 + 52]) { k.rect(x, 2, 12, 2, IRON[3]); k.line(x + 2, 4, x + 10, 14, IRON[4]); }
      k.polyTex([[wx0 - 6, -2], [wx1 + 4, -2], [wx1, -18], [wx0 - 2, -18]], (x, y) => { const r = y + 18; if (r < 1) return BARK[4]; if (r % 4 === 0) return BARK[0]; return (x + Math.floor(r / 4) * 3) % 7 === 0 ? BARK[1] : BARK[2]; });
      for (let x = wx0; x < wx1; x += 8) { k.poly([[x, -18], [x + 3, -18], [x + 1, -25]], IRON[3]); k.px(x + 1, -24, IRON[5]); }
      for (const x of [wx0 - 3, wx1 - 1]) { k.rect(x, -2, 3, 26, BARK[2]); k.rect(x, -2, 1, 26, BARK[4]); }
      // The half-built siege engine: a catapult frame on iron wheels with a spiked arm and counterweight cage.
      const ex = 118, ey = 52;
      k.ellipse(ex + 16, ey + 2, 34, 4, C.shadow);
      k.rect(ex - 12, ey - 8, 52, 5, BARK[2]); k.rect(ex - 12, ey - 8, 52, 1, BARK[4]); k.rect(ex - 12, ey - 4, 52, 1, BARK[0]);
      for (const wxp of [ex - 6, ex + 32]) { k.circle(wxp, ey - 2, 6, IRON[1]); k.circle(wxp, ey - 2, 5, BARK[2]); k.ring(wxp, ey - 2, 5, 5, IRON[3]); k.px(wxp, ey - 2, IRON[4]); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; k.px(wxp + Math.round(Math.cos(a) * 6), ey - 2 + Math.round(Math.sin(a) * 6), IRON[5]); } }
      k.line(ex, ey - 8, ex + 12, ey - 34, BARK[2], 3); k.line(ex + 26, ey - 8, ex + 14, ey - 34, BARK[2], 3); k.line(ex - 1, ey - 8, ex + 11, ey - 34, BARK[4], 1);
      k.rect(ex + 8, ey - 36, 10, 3, IRON[3]);
      k.line(ex + 13, ey - 35, ex - 18, ey - 52, BARK[3], 2); k.line(ex + 13, ey - 35, ex + 36, ey - 22, BARK[3], 2);
      k.rect(ex + 32, ey - 24, 10, 10, IRON[2]); for (let i = 0; i < 10; i += 3) k.rect(ex + 32 + i, ey - 24, 1, 10, IRON[4]); k.rect(ex + 33, ey - 18, 8, 3, ASH[4]);
      k.poly([[ex - 22, ey - 56], [ex - 14, ey - 56], [ex - 16, ey - 50], [ex - 20, ey - 50]], IRON[3]); for (const dx of [-22, -18, -14]) k.px(ex + dx, ey - 57, IRON[5]);
      k.line(ex - 18, ey - 52, ex - 10, ey - 8, '#8a6a3a'); // hauling rope
      // Anvil, forge tub, spear rack, iron plates and a pile of fresh-cut spikes.
      k.rect(148, 26, 14, 4, IRON[3]); k.rect(146, 25, 18, 2, IRON[4]); k.rect(152, 30, 6, 6, IRON[2]); k.rect(150, 36, 10, 2, IRON[1]);
      for (let i = 0; i < 5; i++) { k.rect(100 + i * 5, 6, 1, 18, BARK[3]); k.poly([[99 + i * 5, 6], [102 + i * 5, 6], [100 + i * 5, 1]], IRON[4]); }
      k.rect(98, 14, 26, 2, BARK[2]);
      for (let i = 0; i < 4; i++) { k.rect(160, 12 - i * 2, 12, 2, i % 2 ? IRON[3] : IRON[4]); }
      for (let i = 0; i < 6; i++) k.line(84 + i * 3, 72, 88 + i * 3, 64, BARK[3], 1);
      // Doom's toxic drums, one leaking a glowing green slick.
      toxBarrel(k, 150, 76); toxBarrel(k, 162, 72); toxBarrel(k, 156, 64); toxBarrel(k, 138, 86);
      slime(k, 136, 96, 14, 4); k.px(126, 100, TOX[3]); k.px(146, 100, TOX[2]);
      Props.sign(k, 116, 96, 'ZAP', '#56613e');

      /* ---- Chopping yard (centre) ---- */
      for (const [x, y] of [[-20, 36], [14, 24], [-58, 44]]) { stump(k, x, y, 5); k.line(x - 2, y - 5, x + 3, y - 10, C.wood2); k.rect(x + 2, y - 12, 3, 3, IRON[4]); }
      for (let i = 0; i < 12; i++) { const x = -6 + (i % 4) * 5, y = 52 - Math.floor(i / 4) * 3; k.rect(x, y, 4, 3, '#4a3830'); k.rect(x, y, 4, 1, C.wood3); k.px(x + 3, y + 2, BARK[1]); }
      for (let i = 0; i < 10; i++) k.px(-30 + P.hash(i, 7) * 50, 30 + P.hash(i, 9) * 12, C.wood3);
      // Overseer's block: a raised stump with a skull-topped stake and a war drum.
      k.ellipse(-82, 30, 10, 3, C.shadow); k.rect(-90, 22, 16, 8, BARK[2]); k.rect(-90, 22, 16, 1, BARK[4]); k.ellipse(-82, 22, 8, 2, '#5a4232');
      stake(k, -96, 30, 22); skull(k, -94, -1);
      k.ellipse(40, 50, 7, 2, C.shadow); k.rect(34, 38, 12, 11, '#5a2a22'); k.rect(34, 38, 12, 1, '#8a4a3a'); k.ellipse(40, 38, 6, 2, BONE[1]); k.line(34, 40, 45, 47, BONE[0]); k.line(45, 40, 34, 47, BONE[0]);
      brazier(k, -38, 8); brazier(k, 60, -10);

      /* ---- Slave pen, cage and bone pile (south-west) ---- */
      k.rect(PEN.x0, PEN.y0, PEN.x1 - PEN.x0, PEN.y1 - PEN.y0, ASH[2]); k.dither(PEN.x0, PEN.y0, PEN.x1 - PEN.x0, PEN.y1 - PEN.y0, ASH[1], 1);
      for (let i = 0; i < 14; i++) k.line(PEN.x0 + 6 + P.hash(i, 3) * 70, PEN.y0 + 10 + P.hash(i, 4) * 50, PEN.x0 + 10 + P.hash(i, 3) * 70, PEN.y0 + 9 + P.hash(i, 4) * 50, '#8a7a4a');
      palisade(k, PEN.x0, PEN.y0, PEN.x1 - PEN.x0, 16);
      palisadeV(k, PEN.x0 - 2, PEN.y0, PEN.y1 - PEN.y0); palisadeV(k, PEN.x1 - 1, PEN.y0, 30);
      palisade(k, PEN.x0, PEN.y1, 30, 14); palisade(k, PEN.x0 + 48, PEN.y1, PEN.x1 - PEN.x0 - 48, 14);
      cage(k, -134, 104, 30, 24); cage(k, -100, 100, 22, 20);
      // Chain posts with loose shackles where the idle crews are chained.
      for (const [x, y] of [[-126, 124], [-84, 126]]) { k.rect(x, y - 12, 3, 12, BARK[2]); k.rect(x, y - 12, 1, 12, BARK[4]); k.rect(x - 1, y - 13, 5, 2, IRON[4]); sagChain(k, x + 3, y - 8, x + 12, y, 2); k.ring(x + 13, y, 2, 1, IRON[4]); }
      // Bone pile and a trough of grey gruel.
      for (let i = 0; i < 9; i++) { const x = -66 + (i % 3) * 4, y = 60 - Math.floor(i / 3) * 2; k.line(x, y, x + 5, y - 1, BONE[1 + (i % 3)]); }
      skull(k, -60, 54); skull(k, -66, 52);
      k.rect(-116, 84, 22, 5, BARK[2]); k.rect(-115, 85, 20, 2, '#7a7468'); k.rect(-116, 84, 22, 1, BARK[4]);
      // War banner of the White Hand on a spiked pole.
      k.rect(-150, 44, 2, 40, BARK[2]); k.px(-150, 43, IRON[5]); k.rect(-148, 46, 14, 20, '#141214'); k.rect(-148, 46, 14, 1, IRON[3]);
      k.rect(-144, 54, 6, 6, BONE[3]); for (let i = 0; i < 4; i++) k.rect(-144 + i * 2 - (i > 2 ? 0 : 0), 50 + (i === 0 ? 2 : 0), 1, 4, BONE[3]); k.rect(-146, 55, 2, 2, BONE[3]);
      for (let i = 0; i < 3; i++) k.poly([[-148 + i * 5, 66], [-144 + i * 5, 66], [-146 + i * 5, 70]], '#141214');

      // Gibbet post for the hanging cage, and a rack of orc blades and helms by the south road.
      k.ellipse(GIB.x + 4, GIB.y + 1, 8, 2, C.shadow); k.rect(GIB.x - 1, GIB.y - 44, 4, 44, BARK[2]); k.rect(GIB.x - 1, GIB.y - 44, 1, 44, BARK[4]); k.rect(GIB.x - 1, GIB.y - 46, 22, 3, BARK[3]); k.rect(GIB.x - 1, GIB.y - 46, 22, 1, BARK[4]); k.line(GIB.x + 3, GIB.y - 30, GIB.x + 12, GIB.y - 43, BARK[2], 2);
      k.rect(GIB.x - 4, GIB.y - 2, 10, 2, BARK[1]);
      { const x = 64, y = 108; k.rect(x + 2, y, 30, 2, C.shadow); k.rect(x, y - 16, 2, 16, BARK[2]); k.rect(x + 26, y - 16, 2, 16, BARK[2]); k.rect(x, y - 16, 28, 2, BARK[3]);
        for (let i = 0; i < 5; i++) { const bx = x + 4 + i * 5; k.line(bx, y - 14, bx + 2, y - 3, IRON[4]); k.px(bx + 2, y - 3, IRON[5]); k.rect(bx - 1, y - 15, 3, 2, BARK[1]); }
        for (let i = 0; i < 3; i++) { const hx = x + 6 + i * 8; k.rect(hx, y - 22, 6, 4, IRON[2]); k.rect(hx, y - 22, 6, 1, IRON[4]); k.px(hx + 1, y - 20, IRON[0]); k.px(hx + 4, y - 20, IRON[0]); k.poly([[hx + 2, y - 22], [hx + 4, y - 22], [hx + 3, y - 26]], IRON[3]); } }

      /* ---- Signal tower beside the gate road ---- */
      const tx = TOWER.x, ty = TOWER.y;
      k.ellipse(tx + 4, ty + 1, 12, 3, C.shadow);
      for (const dx of [-8, 8]) { k.line(tx + dx, ty, tx + (dx >> 2), ty - 40, BARK[2], 2); k.line(tx + dx - 1, ty, tx + (dx >> 2) - 1, ty - 40, BARK[4], 1); }
      k.line(tx - 7, ty - 6, tx + 6, ty - 20, BARK[1]); k.line(tx + 7, ty - 6, tx - 6, ty - 20, BARK[1]); k.line(tx - 5, ty - 22, tx + 4, ty - 34, BARK[1]);
      k.rect(tx - 9, ty - 42, 19, 3, BARK[3]); k.rect(tx - 9, ty - 42, 19, 1, BARK[4]); for (let x = tx - 9; x <= tx + 9; x += 3) k.rect(x, ty - 46, 1, 4, BARK[2]);
      k.poly([[tx - 5, ty - 46], [tx + 5, ty - 46], [tx + 3, ty - 42], [tx - 3, ty - 42]], IRON[2]); k.rect(tx - 5, ty - 47, 11, 1, IRON[4]);
      skull(k, tx - 11, ty - 38);

      /* ---- Charred log stacks and chain-gang road (south-east) ---- */
      for (let c = 0; c < 2; c++) { const x = 30 + c * 40; k.rect(x + 2, 136, 34, 2, C.shadow); k.rect(x, 116, 2, 20, BARK[2]); k.rect(x + 32, 116, 2, 20, BARK[2]); stake(k, x, 118, 4); stake(k, x + 31, 118, 4);
        for (let r = 0; r < 5; r++) for (let i = 0; i < 8; i++) logEnd(k, x + 5 + i * 4 - (r % 2) * 2, 133 - r * 4, 2); }
      logSide(k, 112, 128, 26, 3); logSide(k, 116, 121, 20, 3);
      palisade(k, 22, 84, 38, 12);
      k.rect(52, 140, 1, 0, ASH[0]);
      Props.sign(k, 22, 142, 'FELL', '#3a2622');
      for (let i = 0; i < 18; i++) { const x = -150 + P.hash(i, 31) * 320, y = -60 + P.hash(i, 37) * 190; if (Math.abs(x) > 20) k.px(x, y, BONE[0]); }
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error', idle = state === 'idle';
      const W = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o });
      // Workers flinch for a moment after their overseer's whip cracks (same phase as the overseer).
      const crack = ph => (window.AgentCharacters?.crackAge ? AgentCharacters.crackAge(t, { phase: ph }) : 9) < .5;
      // Outside 'working' the crew sprite freezes walks; scattering runners are drawn as 'working' walkers.
      const R = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o, state: 'working' });

      /* Fire pit: roaring while working, banked when idle/waiting, a black-smoke flare on error, cold embers when off. */
      const heat = run ? 1 : err ? 1.3 : live ? .45 : .15;
      k.alpha(Math.min(1, heat * (.55 + .12 * Math.sin(t * 5))), () => k.blit(pitGlow, PIT.x, PIT.y + 2));
      if (live) {
        const n = run ? 7 : err ? 9 : 3;
        for (let i = 0; i < n; i++) { const fx = PIT.x - 26 + (i * 17) % 52, fy = PIT.y + 4 + (i % 3) * 2; flame(k, fx, fy, t + i * .37, err ? 2 : run ? 1 + (i % 2) : 1); }
        embers(k, PIT.x, PIT.y - 4, t, run ? 12 : err ? 16 : 4, 24, run ? 50 : 30, run ? .6 : .3);
        k.alpha(.18 + .06 * Math.sin(t * 4), () => k.blit(halo, PIT.x, PIT.y - 10));
      } else for (let i = 0; i < 5; i++) k.px(PIT.x - 20 + i * 9, PIT.y + 3 + (i % 2), Math.floor(t * 1.5 + i) % 3 ? LAVA[1] : LAVA[2]);
      // Spire smoke and slit glow.
      if (run) { Props.smoke(k, 112, -146, t, 6, '#3a3434'); Props.smoke(k, 106, -150, t * 1.2 + .4, 4, '#554c48'); }
      else if (err) { Props.smoke(k, 112, -146, t * 1.6, 8, '#141012'); Props.smoke(k, PIT.x - 10, PIT.y - 16, t * 1.3, 6, '#1e1a1a'); Props.smoke(k, PIT.x + 14, PIT.y - 14, t * 1.1 + .5, 5, '#2a2424'); }
      else if (live) Props.smoke(k, 112, -146, t * .4, 2, '#4a4442');
      if (live) for (const y of [-126, -108, -90]) k.alpha(.5 + .3 * Math.sin(t * 3 + y), () => k.rect(111, y, 2, 5, err ? C.error : LAVA[4]));

      /* Chute: logs slide into the pit while working; a pile waits on hold. */
      if (run) {
        for (let i = 0; i < 2; i++) { const q = (t * .35 + i / 2) % 1, x = CHUTE.x0 + q * (CHUTE.x1 - CHUTE.x0), y = CHUTE.y0 + q * (CHUTE.y1 - CHUTE.y0) - 4; if (q < .92) k.blit(logSprite(14, 2), x, y); else embers(k, CHUTE.x1 + 8, CHUTE.y1 - 2, t * 3, 5, 8, 16, 1); }
      } else if (wait) { for (let i = 0; i < 4; i++) k.blit(logSprite(14, 2), CHUTE.x0 + 4 + i * 4, CHUTE.y0 - 4 - i * 2 + i * 2); }

      /* Braziers and the signal tower fire. */
      for (const [x, y] of [[-38, -4], [60, -22]]) { if (live) { flame(k, x, y, t, run || err ? 1 : .7); if (z.detail) embers(k, x, y - 4, t, 3, 3, 14); } }
      const sfire = [TOWER.x, TOWER.y - 47];
      if (wait) { flame(k, sfire[0], sfire[1], t, 2, 1); flame(k, sfire[0] - 2, sfire[1], t + .3, 1, 1); k.alpha(.25 + .1 * Math.sin(t * 5), () => k.circle(sfire[0], sfire[1] - 6, 10, C.waiting)); Props.banner(k, TOWER.x + 12, TOWER.y - 36, C.waiting, t, 10); }
      else if (live) flame(k, sfire[0], sfire[1], t, err ? 1.5 : .8);
      // State lantern hung under the tower platform.
      const lamp = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      k.rect(TOWER.x + 9, TOWER.y - 39, 1, 4, IRON[1]); k.rect(TOWER.x + 7, TOWER.y - 35, 5, 6, C.ink); k.rect(TOWER.x + 8, TOWER.y - 34, 3, 4, lamp); if (live) k.px(TOWER.x + 8, TOWER.y - 34, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(TOWER.x + 9, TOWER.y - 32, 7, lamp));

      crackGlow(k, t, run ? 1 : err ? 1 : live ? .5 : .15);
      // The gibbet cage sways; a goblin inside rattles the bars.
      { const sw = live ? Math.round(Math.sin(t * (err ? 4 : 1.2)) * (err ? 3 : 1)) : 0, cx = GIB.x + 16 + sw, cy = GIB.y - 18;
        k.line(GIB.x + 16, GIB.y - 43, cx, cy - 12, IRON[3]);
        k.rect(cx - 6, cy - 12, 13, 14, '#171214'); W(cx, cy + 1, 'goblin', { anim: run || err ? 'cower' : 'idle', phase: .35, look: 2, mark: false });
        for (let i = -6; i <= 6; i += 3) k.rect(cx + i, cy - 12, 1, 14, IRON[4]); k.ellipse(cx, cy - 12, 7, 2, IRON[3]); k.rect(cx - 7, cy + 1, 15, 2, IRON[2]); k.rect(cx - 6, cy - 6, 13, 1, IRON[3]); }
      /* Toxic slime: bubbles pop while live. */
      if (live && z.detail) for (let i = 0; i < 3; i++) { const q = (t * .8 + i / 3) % 1, bx = 128 + i * 7, by = 96 - (i % 2); if (q < .7) k.px(bx, by - Math.round(q * 2), TOX[5]); else { k.px(bx - 1, by - 2, TOX[4]); k.px(bx + 1, by - 2, TOX[4]); } }
      if (live) k.alpha(.18 + .08 * Math.sin(t * 2), () => k.ellipse(136, 96, 16, 5, TOX[4]));

      /* The felling cycle: orcs chop, the black tree crashes down, is hauled off, and a new dead tree stands. */
      const fp = (t / 7) % 1, felled = run && fp >= .55 && fp < .8, chopping = run && fp < .45, falling = run && fp >= .45 && fp < .55;
      if (run) {
        if (fp < .45) k.blit(fellSprite(0), FELL.x, FELL.y - 4);
        else if (fp < .55) { const g = (fp - .45) / .1; k.blit(fellSprite(Math.min(9, Math.floor(g * g * 10))), FELL.x, FELL.y - 4); }
        else if (fp < .8) { k.blit(fellSprite(9), FELL.x, FELL.y - 4); if (fp < .6) for (let i = 0; i < 5; i++) k.alpha(.6, () => k.circle(FELL.x + 10 + i * 8, FELL.y, 3, ASH[5])); }
        else { const g = (fp - .8) / .2; k.alpha(g, () => k.blit(fellSprite(0), FELL.x, FELL.y - 4)); }
        if (chopping && z.detail) for (let i = 0; i < 3; i++) { const q = (t * 2.4 + i / 3) % 1; k.px(FELL.x - 4 - q * 8, FELL.y - 8 - Math.sin(q * 3) * 8 + q * 8, C.wood4); }
      } else if (err) k.blit(fellSprite(4), FELL.x, FELL.y - 4);   // hung up mid-fall
      else blitD(k, fellSprite(0), FELL.x, FELL.y - 4, !live);

      /* Crews. Workers: orc, goblin, hollow, troll. Overseers: uruk, hellknight. */
      if (run) {
        // Felling gang under an Uruk's whip.
        W(FELL.x - 44, FELL.y + 16, 'uruk', { anim: 'whip', lash: 26, facing: 1, phase: 0 });
        W(FELL.x - 14, FELL.y + 16, 'orc', { anim: crack(0) ? 'cower' : chopping ? 'work' : falling ? 'idle' : 'work', tool: 'axe', phase: .1, speed: 5 });
        if (felled) W(FELL.x + 30, FELL.y + 14, 'goblin', { anim: 'work', tool: 'saw', facing: -1, phase: .3 });
        else W(FELL.x + 12, FELL.y + 12, 'orc', { anim: chopping ? 'work' : 'idle', tool: 'axe', facing: -1, phase: .6, speed: 5, look: 1 });
        // The cave troll drags a chained log to the deck, drops it and trudges back.
        const dp = (t / 14) % 1; let tx, tf, tlog;
        if (dp < .6) { tx = DRAG.x0 + 30 + (dp / .6) * (DRAG.x1 - DRAG.x0 - 30); tf = 1; tlog = true; } else if (dp < .68) { tx = DRAG.x1; tf = 1; tlog = false; } else { tx = DRAG.x1 - ((dp - .68) / .32) * (DRAG.x1 - DRAG.x0 - 30); tf = -1; tlog = false; }
        tx = Math.round(tx);
        if (tlog) { k.blit(bigLog(), tx - 50, DRAG.y + 2); chain(k, tx - 8, DRAG.y + 1, tx - 4, DRAG.y - 14); if (z.detail) for (let i = 0; i < 3; i++) { const q = (t * 1.5 + i / 3) % 1; k.alpha(1 - q, () => k.circle(tx - 50 - q * 8, DRAG.y + 3 - q * 4, 1 + q * 2, ASH[5])); } }
        W(tx, DRAG.y + 4, 'troll', { anim: 'walk', facing: tf, phase: .2, carry: tlog ? '' : '' });
        // Goblins haul logs from the deck up the chute; an orc splits wood under the second Uruk.
        const hp = (t * .09) % 1, back = hp > .5, hq = back ? (1 - hp) * 2 : hp * 2;
        W(-12 + hq * 40, -6 - hq * 38, 'goblin', { anim: back ? 'walk' : 'carry', carry: back ? '' : 'wood', facing: back ? -1 : 1, phase: .4 });
        const hp2 = (hp + .5) % 1, back2 = hp2 > .5, hq2 = back2 ? (1 - hp2) * 2 : hp2 * 2;
        W(-4 + hq2 * 36, 2 - hq2 * 36, 'goblin', { anim: back2 ? 'walk' : 'carry', carry: back2 ? '' : 'wood', facing: back2 ? -1 : 1, phase: .9, look: 1 });
        W(-82, 22, 'uruk', { anim: 'whip', lash: 44, facing: 1, phase: .45, look: 1 });
        W(-34, 38, 'orc', { anim: crack(.45) ? 'cower' : 'work', tool: 'axe', phase: .5, speed: 4, look: 2 });
        W(6, 26, 'hollow', { anim: 'work', tool: 'axe', facing: -1, phase: .7, speed: 3 });
        // Workshop: a Hell Knight drives the goblins building the war machine.
        W(86, 60, 'hellknight', { anim: 'whip', lash: 22, facing: 1, phase: .7 });
        W(108, 62, 'goblin', { anim: crack(.7) ? 'cower' : 'work', tool: 'hammer', phase: .2, speed: 6, look: 2 });
        W(156, 42, 'orc', { anim: 'work', tool: 'hammer', facing: -1, phase: .8, speed: 5, look: 3 });
        if (z.detail) { const q = (t * 5) % 1; if (q < .3) { k.px(150, 22, LAVA[5]); k.px(147, 20, LAVA[4]); k.px(153, 19, LAVA[5]); } }
        // Chain gang shuffles along the south road, three goblins on one chain.
        const cg = (t * .035) % 1, cb = cg > .5, cq = cb ? (1 - cg) * 2 : cg * 2, gx = Math.round(18 + cq * 44);
        for (let i = 0; i < 3; i++) W(gx - i * 12 * (cb ? -1 : 1), 64, 'goblin', { anim: 'chained', facing: cb ? -1 : 1, phase: i * .3, look: i });
        chain(k, gx - 24 * (cb ? -1 : 1), 58, gx, 58);
        // Caged goblins rattle the bars.
        W(-122, 102, 'goblin', { anim: 'cower', phase: .1, look: 3 }); W(-90, 98, 'hollow', { anim: 'idle', phase: .5 });
        if (z.detail) for (let i = 0; i < 2; i++) Props.bird(k, -120 + ((t * 16 + i * 140) % 300), -150 + i * 8 + Math.sin(t + i) * 3, t + i, '#1a1416');
      } else if (idle) {
        // Break: overseers lean on their spears, workers slump in their chains.
        W(FELL.x - 44, FELL.y + 16, 'uruk', { anim: 'idle', tool: 'spear', facing: 1, phase: 0 });
        W(FELL.x - 14, FELL.y + 16, 'orc', { anim: 'sit', phase: .1 }); W(FELL.x + 12, FELL.y + 12, 'orc', { anim: 'sit', facing: -1, phase: .6, look: 1 });
        k.blit(bigLog(), DRAG.x1 - 50, DRAG.y + 2); W(DRAG.x1 + 6, DRAG.y + 4, 'troll', { anim: 'sit', facing: -1, phase: .2 });
        W(-82, 22, 'uruk', { anim: 'idle', tool: 'spear', facing: 1, phase: .45, look: 1 }); W(86, 60, 'hellknight', { anim: 'idle', tool: 'spear', facing: 1, phase: .7 });
        for (const [x, y, kind, ph] of [[-112, 126, 'goblin', .1], [-104, 128, 'orc', .4], [-70, 128, 'goblin', .7], [-28, 38, 'orc', .5], [6, 26, 'hollow', .7], [108, 62, 'goblin', .2]]) { W(x, y, kind, { anim: 'sit', chains: true, phase: ph }); }
        sagChain(k, -123, 116, -114, 122, 2); sagChain(k, -81, 118, -72, 124, 2);
        W(-122, 102, 'goblin', { anim: 'sit', chains: true, phase: .1, look: 3 }); W(-90, 98, 'hollow', { anim: 'sit', phase: .5 });
        if (z.detail) for (let i = 0; i < 3; i++) Props.bird(k, -40 + ((t * 10 + i * 100) % 260) - 130, -140 + i * 6 + Math.sin(t + i) * 3, t + i, '#1a1416');
      } else if (wait) {
        // Work halted under the amber signal fire: everyone stands and waits for the order.
        W(FELL.x - 44, FELL.y + 16, 'uruk', { anim: 'idle', facing: 1, phase: 0 });
        W(FELL.x - 14, FELL.y + 16, 'orc', { anim: 'idle', tool: 'axe', phase: .1 }); W(FELL.x + 12, FELL.y + 12, 'orc', { anim: 'idle', tool: 'axe', facing: -1, phase: .6, look: 1 });
        k.blit(bigLog(), DRAG.x1 - 50, DRAG.y + 2); W(DRAG.x1, DRAG.y + 4, 'troll', { anim: 'idle', facing: 1, phase: .2 });
        W(-82, 22, 'uruk', { anim: 'idle', facing: 1, phase: .45, look: 1 }); W(86, 60, 'hellknight', { anim: 'idle', facing: 1, phase: .7 });
        W(-28, 38, 'orc', { anim: 'idle', tool: 'axe', phase: .5 }); W(6, 26, 'hollow', { anim: 'idle', phase: .7 }); W(108, 62, 'goblin', { anim: 'idle', tool: 'hammer', phase: .2 });
        W(20, -10, 'goblin', { anim: 'idle', carry: 'wood', phase: .4 }); W(30, -22, 'goblin', { anim: 'idle', carry: 'wood', phase: .9, look: 1 });
        for (let i = 0; i < 3; i++) W(-6 + i * 12, 64, 'goblin', { anim: 'idle', chains: true, phase: i * .3, look: i }); chain(k, -6, 58, 18, 58);
        W(-122, 102, 'goblin', { anim: 'idle', phase: .1, look: 3 }); W(-90, 98, 'hollow', { anim: 'idle', phase: .5 });
      } else if (err) {
        // The troll goes berserk: log chain snapped, logs flung, workers scatter from him.
        const bx = DRAG.x1 - 10 + Math.round(Math.sin(t * 2.2) * 26);
        for (const [x, y] of [[-60, -2], [-40, 8], [-96, -30]]) k.blit(logSprite(22, 3), x, y);
        for (let i = 0; i < 3; i++) { const q = (t * .8 + i / 3) % 1; k.at(bx + Math.sin(i * 2.1) * q * 40, DRAG.y - 16 - Math.sin(q * Math.PI) * 26 + q * 18, () => k.blit(logSprite(10, 2), 0, 0)); }
        chain(k, bx - 6, DRAG.y - 10, bx - 20, DRAG.y + 2);
        W(bx, DRAG.y + 4, 'troll', { anim: 'cheer', facing: Math.cos(t * 2.2) > 0 ? 1 : -1, phase: .2 });
        k.alpha(.3 + .2 * Math.sin(t * 8), () => k.circle(bx, DRAG.y - 30, 3, C.error));
        // Scatter: workers run away from the troll and back, looping.
        const sc = [[FELL.x - 14, FELL.y + 16, -1, 'orc'], [-28, 38, 1, 'orc'], [6, 26, 1, 'hollow'], [-12, 0, 1, 'goblin'], [20, -20, 1, 'goblin'], [108, 62, 1, 'goblin']];
        sc.forEach(([x, y, d, kind], i) => { const q = (t * .25 + i * .17) % 1, run2 = Math.sin(q * Math.PI) * 30; R(x + d * run2, y + (i % 2 ? 4 : -2) * Math.sin(q * Math.PI), kind, { anim: 'walk', facing: d * (q < .5 ? 1 : -1), phase: i * .2 }); });
        R(FELL.x - 44, FELL.y + 16, 'uruk', { anim: 'whip', lash: 26, facing: 1, phase: 0, speed: 11 }); W(-82, 22, 'uruk', { anim: 'idle', facing: -1, phase: .45, look: 1 }); W(86, 60, 'hellknight', { anim: 'idle', facing: -1, phase: .7 });
        W(-122, 102, 'goblin', { anim: 'cower', phase: .1, look: 3 }); W(-90, 98, 'hollow', { anim: 'cower', phase: .5 });
        for (let i = 0; i < 3; i++) W(-60 + i * 14, 80 + (i % 2) * 4, 'goblin', { anim: 'cower', phase: i * .3, look: i });
      } else {
        // Off: fires low, everyone asleep.
        W(FELL.x - 40, FELL.y + 16, 'uruk', { phase: 0 }); W(FELL.x - 14, FELL.y + 16, 'orc', { phase: .1 }); W(FELL.x + 12, FELL.y + 12, 'orc', { facing: -1, phase: .6, look: 1 });
        blitD(k, bigLog(), DRAG.x1 - 50, DRAG.y + 2, true); W(DRAG.x1 + 6, DRAG.y + 4, 'troll', { facing: -1, phase: .2 });
        W(-82, 22, 'uruk', { phase: .45, look: 1 }); W(86, 60, 'hellknight', { phase: .7 });
        for (const [x, y, kind, ph] of [[-112, 126, 'goblin', .1], [-104, 128, 'orc', .4], [-70, 128, 'goblin', .7], [-28, 38, 'orc', .5], [6, 26, 'hollow', .7], [108, 62, 'goblin', .2]]) W(x, y, kind, { phase: ph });
        W(-122, 102, 'goblin', { phase: .1, look: 3 }); W(-90, 98, 'hollow', { phase: .5 });
      }
    }
  };
})();
