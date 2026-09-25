/* Village owners: two large avatars you can pick up and drop anywhere on the map.
   GKTC's avatar (the Doom Slayer, fan art) starts at GKTC's castle; Daghan's (Gojo Satoru, fan art) at Daghan's.
   When an avatar stands in an agent district, that district's lead walks over, walks alongside it and talks. */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ramp = P.ramp;

  /* ---------- Sprites (sculpted, 3/4 view facing right; flipped for left) ---------- */
  // f: 'stand0' 'stand1' 'walk0'..'walk3' 'lift'
  function pose(f) {
    const walk = f.startsWith('walk') ? +f[4] : -1;
    return { s: walk < 0 ? 0 : [3.5, 0, -3.5, 0][walk], bob: walk < 0 ? (f === 'stand1' ? 1 : 0) : [0, -1, 0, -1][walk], lift: f === 'lift', breathe: f === 'stand1' };
  }
  // Ramps: 0 green armour, 1 undersuit, 2 grey plates, 3 amber visor, 4 gun metal and boots, 5 grip leather, 6 blade steel.
  const SLAY = [ramp('#5b8a3a', [-.62, -.48, -.34, -.2, -.08, 0, .18, .38]), ramp('#3b3f46', [-.45, -.3, -.18, -.08, 0, .14, .3, .5]), ramp('#858c93'), ramp('#f0ad1c', [-.6, -.42, -.26, -.1, 0, .3, .55, .8]), ramp('#2a2d33', [-.4, -.2, 0, .14, .28, .45, .65, .85]), ramp('#6f4b2b'), ramp('#cfd6dc', [-.5, -.34, -.2, -.1, 0, .25, .5, .75])];
  function slayerSprite(f) {
    const p = pose(f), s = p.s, a = -s * .8, b = p.bob;
    return P.sculpt(44, 94, SLAY, api => {
      const { part, set, dk, lt, ln, force } = api, sh = api.shapes;
      const legY = p.lift ? 2 : 0, armUp = p.lift ? -6 : 0, up = p.lift ? 1 : 0;
      const boot = (x, y, tone) => part(sh.spline([[x - 3.6, y - 5.4], [x + 2.4, y - 5.4], [x + 4.4, y - 1.4], [x + 5.2, y + 2.4], [x - 4.2, y + 2.4], [x - 4.4, y - 1.6]]), { ramp: 4, cap: 2, tone });
      // Far leg (undersuit, shin guard, knee pad, heavy boot) and far arm with the Doom Blade.
      part(sh.limb([[26, 58 + b, 4.4], [26 - s * .6, 73 + b + legY, 3.7], [26 - s, 85 + legY, 3.3]]), { ramp: 1, cap: 3, tone: -.16 });
      part(sh.limb([[26 - s * .62, 75.5 + b + legY, 3.2], [26 - s * .95, 84 + legY, 3.4]]), { ramp: 0, cap: 2.4, tone: -.16 });
      part(sh.ellipse(26.4 - s * .6, 72.5 + b + legY, 3.4, 2.9), { ramp: 2, cap: 2, tone: -.14 });
      boot(26.8 - s, 89 + legY, -.12);
      const fx = 32 + a * 1.4 + up * 6, fy = 51 + b + armUp * 1.6;
      part(sh.limb([[31, 31 + b, 3.9], [32 + a + up * 5, 41.5 + b + armUp, 3.5]]), { ramp: 0, cap: 2.6, tone: -.16 });
      part(sh.limb([[32 + a + up * 5, 41.5 + b + armUp, 3.3], [fx, fy, 3.1]]), { ramp: 2, cap: 2.2, tone: -.16 });
      part(sh.ellipse(fx, fy + 3, 2.8, 2.8), { ramp: 1, cap: 1.6, tone: -.1 });
      part(sh.poly([[fx + 1, fy - 4], [fx + 3.4, fy - 3], [fx + 3.8, fy + 4], [fx + 2.8, fy + 12], [fx + 1.2, fy + 4]]), { ramp: 6, cap: 1, tone: -.04 });
      // Hips, then the near leg.
      part(sh.spline([[13.5, 54 + b], [31.5, 54 + b], [32, 61 + b], [22.5, 63 + b], [13, 61 + b]]), { ramp: 1, cap: 3 });
      part(sh.limb([[18.5, 59 + b, 4.6], [18.5 + s * .6, 73.5 + b + legY, 3.8], [18.5 + s, 85 + legY, 3.4]]), { ramp: 1, cap: 3 });
      part(sh.limb([[18.2, 59.5 + b, 4.2], [18.4 + s * .35, 67 + b, 3.8]]), { ramp: 0, cap: 2.6 });
      part(sh.limb([[18.5 + s * .62, 75.5 + b + legY, 3.3], [18.5 + s * .95, 84 + legY, 3.5]]), { ramp: 0, cap: 2.4 });
      part(sh.ellipse(19.2 + s * .6, 72.5 + b + legY, 3.8, 3.1), { ramp: 2, cap: 2 });
      boot(19.6 + s, 89 + legY, 0);
      // Undersuit torso, green chest plate, grey ab plates, belt.
      part(sh.spline([[11.5, 28 + b], [22, 25 + b], [32.5, 28 + b], [32.6, 41 + b], [31.4, 55 + b], [22.4, 56.5 + b], [13.4, 55 + b], [12, 41 + b]]), { ramp: 1, cap: 5, grad: .06 });
      part(sh.spline([[12.6, 28.5 + b], [22, 25.8 + b], [31.6, 28.5 + b], [31.4, 36.5 + b], [27.5, 42 + b], [22.2, 43.4 + b], [17, 42 + b], [13, 36.5 + b]]), { ramp: 0, cap: 4, grad: .1 });
      part(sh.poly([[19.2, 43 + b], [25.4, 43 + b], [24.8, 52.5 + b], [19.8, 52.5 + b]]), { ramp: 2, cap: 1.6, tone: -.08 });
      part(sh.spline([[13, 53 + b], [32, 53 + b], [32.2, 57.5 + b], [22.5, 58.5 + b], [12.8, 57.5 + b]]), { ramp: 4, cap: 1.6 });
      // Far shoulder pad, neck, helmet with the amber visor and a grey mouth guard.
      part(sh.ellipse(32, 28.5 + b, 5.4, 4.8), { ramp: 0, cap: 3, tone: -.08 });
      part(sh.limb([[22.3, 25 + b, 3.4], [22.3, 21 + b, 3.4]]), { ramp: 1, cap: 1.5, tone: -.08 });
      part(sh.spline([[14.4, 12 + b], [17.5, 5.2 + b], [23, 3 + b], [28.6, 5 + b], [31, 10.5 + b], [30.6, 17 + b], [27.6, 22.6 + b], [20.5, 23.4 + b], [15.4, 19.5 + b]]), { ramp: 0, cap: 4, grad: .06 });
      part(sh.ellipse(18, 15.5 + b, 2.6, 3), { ramp: 2, cap: 1.4, tone: -.06 });
      part(sh.poly([[19.8, 9.4 + b], [31.6, 8.8 + b], [31.4, 14.4 + b], [27.4, 17.2 + b], [21.6, 15.8 + b]]), { ramp: 3, cap: 1.6, shadow: false });
      part(sh.poly([[23.4, 17.6 + b], [30.4, 16 + b], [28.8, 21.6 + b], [24.6, 22.6 + b]]), { ramp: 2, cap: 1.4, shadow: false });
      // Near shoulder pad, then the Super Shotgun held low (stock stub, receiver, twin barrels) and the near arm over it.
      part(sh.ellipse(13, 28.8 + b, 6.6, 5.6), { ramp: 0, cap: 3.6 });
      const hx = 12.6 - a * 1.4 - up * 5, hy = 54.5 + b + armUp * 1.6, bx = up ? -3 : -6.5;
      part(sh.limb([[hx + 1.8, hy - 3.5, 1.5], [hx, hy + 1, 1.8]]), { ramp: 5, cap: 1.2 });
      part(sh.limb([[hx - .4, hy + 1, 2.3], [hx - 1.6, hy + 6, 2.3]]), { ramp: 4, cap: 1.4 });
      part(sh.limb([[hx - 1.4, hy + 5, 2], [hx + bx, hy + 24, 2]]), { ramp: 4, cap: 1.4 });
      part(sh.limb([[hx - 1.6 + bx * .2, hy + 8.5, 2.3], [hx - 1.8 + bx * .3, hy + 10.5, 2.3]]), { ramp: 5, cap: 1.4 });
      part(sh.limb([[13.5, 31 + b, 3.9], [12.4 - a - up * 5, 42 + b + armUp, 3.5]]), { ramp: 0, cap: 2.6 });
      part(sh.limb([[12.4 - a - up * 5, 42 + b + armUp, 3.3], [hx, hy - 2, 3.1]]), { ramp: 2, cap: 2.2 });
      part(sh.ellipse(hx, hy + .5, 2.8, 2.8), { ramp: 1, cap: 1.6 });
      /* Details. */
      // Visor: a bright glint along the top and a darker lower rim. Helmet ridge, seams, mouth-guard vents.
      ln([[20.8, 10.1 + b], [31, 9.6 + b]], (x, y) => force(x, y, 6, 3)); ln([[22.6, 11.2 + b], [26.5, 11 + b]], (x, y) => force(x, y, 7, 3));
      ln([[22, 15.6 + b], [27.3, 16.7 + b], [31, 14.2 + b]], (x, y) => force(x, y, 1, 3));
      ln([[16.4, 8.5 + b], [20.5, 4.6 + b], [26.5, 4.2 + b]], (x, y) => lt(x, y, 2)); ln([[15.6, 9.6 + b], [20, 5.6 + b], [27.4, 5.4 + b], [29.4, 8.4 + b]], (x, y) => force(x, y, 3, 2)); ln([[20.2, 5.6 + b], [20.4, 9.8 + b]], (x, y) => dk(x, y, 2)); ln([[15.8, 19.6 + b], [20.6, 22.6 + b]], (x, y) => dk(x, y, 1));
      for (let i = 0; i < 3; i++) ln([[25.2 + i * 1.6, 18.4 + b], [25 + i * 1.5, 21 + b]], (x, y) => dk(x, y, 2));
      // Chest: centre seam and edge highlight; ab plate segments; belt buckle.
      ln([[22.2, 27 + b], [22.2, 42.5 + b]], (x, y) => dk(x, y, 1)); ln([[14, 29.5 + b], [21, 27 + b]], (x, y) => lt(x, y, 2)); ln([[14.5, 37 + b], [18, 41.5 + b], [22.2, 42.6 + b], [27, 41.4 + b]], (x, y) => dk(x, y, 1));
      for (let y = 45.5; y < 52; y += 2.5) ln([[19.8, y + b], [24.8, y + b]], (x, yy) => dk(x, yy, 2));
      for (let y = 54; y <= 56; y++) for (let x = 21; x <= 23; x++) force(x, y + b, y === 54 ? 6 : 4, 2);
      ln([[15.5, 54 + b], [15.5, 57 + b]], (x, y) => lt(x, y, 2)); ln([[28.5, 54 + b], [28.5, 57 + b]], (x, y) => lt(x, y, 2));
      // Grey rims on the shoulder pads, battle wear on the green.
      ln([[7.4, 30.6 + b], [9.6, 33.4 + b], [14.6, 34.3 + b], [19, 32.2 + b]], (x, y) => force(x, y, 3, 2)); ln([[27.8, 31.5 + b], [32, 33.2 + b], [36.8, 31 + b]], (x, y) => force(x, y, 2, 2));
      for (let i = 0; i < 12; i++) { const x = 8 + P.hash(i, 3) * 28, y = 24 + P.hash(i, 5) * 60 + b; if (api.ramp(x, y) === 0) lt(x, y, 2); }
      // Gauntlet bands, shotgun barrel shine and muzzle, blade edge, knee shine, boot soles.
      ln([[hx - 2.6, hy - 4.5], [hx + 2.6, hy - 4.5]], (x, y) => dk(x, y, 2)); ln([[fx - 2.6, fy - 3.5], [fx + 2.6, fy - 3.5]], (x, y) => dk(x, y, 2));
      ln([[hx - .6, hy + 6], [hx + bx + .8, hy + 23]], (x, y) => lt(x, y, 2)); ln([[hx - 2, hy + 12], [hx + bx - .2, hy + 24]], (x, y) => dk(x, y, 2)); force(hx + bx, hy + 25, 0, 4); force(hx + bx - 1, hy + 25, 0, 4);
      ln([[fx + 2.6, fy - 2], [fx + 2.8, fy + 10]], (x, y) => lt(x, y, 2));
      lt(18 + s * .6, 71 + b + legY, 2); lt(19 + s * .6, 71 + b + legY, 2);
      ln([[15.5 + s, 91 + legY], [24.5 + s, 91 + legY]], (x, y) => dk(x, y, 2)); ln([[23 - s, 91 + legY], [31.5 - s, 91 + legY]], (x, y) => dk(x, y, 2));
    });
  }
  // Ramps: 0 skin, 1 white hair, 2 black uniform, 3 blindfold, 4 trousers, 5 swirl button, 6 blue, 7 shoes.
  const GOJO = [ramp('#f3d6bf'), ramp('#e4e9f1', [-.46, -.34, -.23, -.13, -.05, 0, .45, .8]), ramp('#1b1d26', [-.3, -.15, 0, .08, .16, .26, .38, .5]), ramp('#0c0d11', [-.2, 0, .06, .12, .18, .26, .36, .48]), ramp('#2b2f3b', [-.4, -.22, -.08, 0, .12, .26, .44, .64]), ramp('#d8b24c', [-.55, -.4, -.26, -.12, 0, .2, .45, .7]), ramp('#58b7e6'), ramp('#17181d', [-.4, -.2, 0, .12, .25, .45, .7, .9])];
  function gojoSprite(f) {
    const p = pose(f), s = p.s, a = -s * .6, b = p.bob, sign = f.startsWith('stand');
    return P.sculpt(52, 94, GOJO, api => {
      const { part, set, dk, lt, ln, force } = api, sh = api.shapes, legY = p.lift ? 2 : 0;
      // Far leg and shoe.
      part(sh.limb([[28.6, 57 + b, 3.3], [28.6 - s * .6, 73 + b + legY, 2.9], [28.6 - s, 86.5 + legY, 2.6]]), { ramp: 4, cap: 2.6, tone: -.16 });
      part(sh.ellipse(30.2 - s, 89.6 + legY, 3.9, 2), { ramp: 7, cap: 1.4, tone: -.12 });
      // Far arm: a hand sign in front of the chest when standing, a swing when walking, up when lifted.
      const far = p.lift ? [[31.5, 29 + b, 2.5], [36, 23 + b, 2.2], [37.5, 15 + b, 2]] : sign ? [[31.5, 29 + b, 2.5], [34.4, 38.5 + b, 2.2], [36.4, 31 + b, 2]] : [[31.5, 29 + b, 2.5], [32.5 + a, 40 + b, 2.2], [32.5 + a * 1.3, 50 + b, 2]], fh = far[2];
      part(sh.limb(far), { ramp: 2, cap: 2, tone: -.12 });
      part(sh.ellipse(fh[0] + .3, fh[1] + (sign || p.lift ? -1.6 : 1.8), 1.8, 2), { ramp: 0, cap: 1.2, tone: -.06 });
      if (sign) part(sh.limb([[36.8, 28.4 + b, .8], [37.4, 24.4 + b, .8]]), { ramp: 0, cap: .8 });
      // Near leg and shoe, then the long high-collar jacket.
      part(sh.limb([[23.2, 57 + b, 3.5], [23.2 + s * .6, 73.5 + b + legY, 3], [23.2 + s, 86.5 + legY, 2.7]]), { ramp: 4, cap: 2.6 });
      part(sh.ellipse(24.8 + s, 89.6 + legY, 4.1, 2.1), { ramp: 7, cap: 1.4 });
      part(sh.spline([[19.6, 27 + b], [26, 25.4 + b], [32.2, 27 + b], [32.6, 40 + b], [34, 58.5 + b], [26.4, 60 + b], [18.4, 58.5 + b], [19.2, 40 + b]]), { ramp: 2, cap: 4, grad: .06 });
      // Hair at the nape, head, stand-up collar, blindfold, and the spiky white hair pushed up over it.
      part(sh.spline([[19.5, 8 + b], [24, 5 + b], [22.5, 18 + b], [19.2, 16.5 + b]]), { ramp: 1, cap: 2, tone: -.14 });
      part(sh.spline([[20.6, 9 + b], [26, 6 + b], [31.6, 8.4 + b], [32.8, 13.6 + b], [31.4, 18.8 + b], [27.4, 21.8 + b], [22.8, 20 + b], [20.6, 14.5 + b]]), { ramp: 0, cap: 3.5, grad: .06, tone: .1 });
      part(sh.spline([[20.4, 19.6 + b], [25, 20.4 + b], [31, 21.6 + b], [31.8, 25.6 + b], [26, 27.4 + b], [20.2, 25.8 + b]]), { ramp: 2, cap: 2.4 });
      part(sh.poly([[20, 10.4 + b], [33.2, 10.6 + b], [33.3, 14.4 + b], [26, 15 + b], [20.2, 14.8 + b]]), { ramp: 3, cap: 1.4 });
      part(sh.poly([[19.4, 11.6 + b], [15.6, 9.8 + b], [18, 7.8 + b], [14.6, 4.8 + b], [19.6, 5 + b], [19, 1 + b], [23.4, 3.6 + b], [25.8, .2 + b], [28, 3.4 + b], [31.6, .8 + b], [31.8, 4.6 + b], [36.2, 2.8 + b], [34.8, 6.8 + b], [37.8, 8 + b], [33.8, 10.2 + b], [33.4, 11.4 + b], [26.4, 11 + b]]), { ramp: 1, cap: 3 });
      // Near arm: hand in the pocket (up when lifted).
      part(sh.limb(p.lift ? [[19.8, 29 + b, 2.6], [15.5, 23 + b, 2.3], [14, 15 + b, 2.1]] : [[19.8, 29 + b, 2.6], [16.4 - a * .4, 39.5 + b, 2.3], [20.4, 49 + b, 2.1]]), { ramp: 2, cap: 2 });
      if (p.lift) part(sh.ellipse(14, 13.4 + b, 1.8, 2), { ramp: 0, cap: 1.2 });
      /* Details. */
      // Blindfold sheen and strands falling over its top edge; hair strands and shine.
      ln([[21, 12.4 + b], [32.8, 12.6 + b]], (x, y) => { if (api.ramp(x, y) === 3) lt(x, y, 1); });
      for (const [x0, y0, x1, y1] of [[20.5, 9.5, 19.4, 3], [24, 9, 25.6, 1.8], [28.2, 9, 31, 2.4], [31.5, 9.6, 35.2, 4.2], [18, 9.4, 16, 5.6]]) ln([[x0, y0 + b], [x1, y1 + b]], (x, y) => { if (api.ramp(x, y) === 1) dk(x, y, 1); });
      for (let i = 0; i < 8; i++) lt(21 + i * 1.6, 5 + (i % 2) + b, 2);
      // Face below the band: nose and a small smirk.
      lt(33, 15.6 + b, 1); dk(32.2, 16.6 + b, 1); ln([[29.6, 18.4 + b], [31.2, 18.1 + b]], (x, y) => force(x, y, 2, 0));
      // Collar rim and the swirl button; jacket front seam, hem, folds, pocket.
      ln([[20.8, 20.4 + b], [25, 21 + b], [30.8, 22.2 + b]], (x, y) => lt(x, y, 2));
      [[5, 6, 5], [4, 1, 6], [3, 4, 5]].forEach((r, j) => r.forEach((v, i) => force(28.6 + i, 22.4 + j + b, v, 5)));
      ln([[29.4, 26.4 + b], [30.4, 59 + b]], (x, y) => dk(x, y, 2)); ln([[19, 58.4 + b], [33.6, 58.4 + b]], (x, y) => lt(x, y, 1));
      ln([[23, 30 + b], [22, 55 + b]], (x, y) => lt(x, y, 1)); ln([[31, 32 + b], [32, 55 + b]], (x, y) => lt(x, y, 1));
      if (!p.lift) ln([[18.8, 48.4 + b], [22.4, 49.8 + b]], (x, y) => force(x, y, 0, 3));
      // Trouser crease and shoe shine.
      ln([[23.2 + s * .3, 61 + b], [23.2 + s * .95, 85]], (x, y) => lt(x, y, 1)); lt(24 + s, 88.6 + legY, 2); lt(25 + s, 88.6 + legY, 2);
    });
  }
  // Kinds stay 'boss' (GKTC's Doom Slayer) and 'princess' (Daghan's Gojo) so older callers keep working.
  const cache = {};
  function sprite(kind, f) { const key = kind + f; return cache[key] || (cache[key] = { canvas: (kind === 'princess' ? gojoSprite : slayerSprite)(f), ox: kind === 'princess' ? 26 : 22, oy: 91 }); }

  /* ---------- State ---------- */
  const world = () => window.VillageWorld;
  const avatars = [
    { id: 'gktc-owner', kind: 'boss', title: 'GKTC', village: 'gktc', home: [-70, 150], greet: 'RIP AND TEAR!' },
    { id: 'daghan-princess', kind: 'princess', title: 'Daghan', village: 'daghan', home: [70, 150], greet: 'GOJO SENSEI!' }
  ];
  const KEY = 'brownie-avatars-v2'; // v2: the map gained a 180 px margin, so v1 positions are stale
  function init() {
    if (init.done || !world()) return; init.done = true;
    let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { }
    for (const av of avatars) {
      const castle = world().zones.find(z => z.id === av.village + '-castle'), s = saved[av.id];
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && s.x > 0 && s.y > 0 && s.x < world().width && s.y < world().height) { av.x = s.x; av.y = s.y; }
      else { av.x = castle.x + av.home[0]; av.y = castle.y + av.home[1]; }
      av.since = -30; av.zone = zoneAt(av.x, av.y);
    }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(avatars.map(a => [a.id, { x: Math.round(a.x), y: Math.round(a.y) }])))); } catch { } };
  function zoneAt(x, y) { return world().hitTest(x, y) || null; }

  // Where an avatar is at time t: a slow stroll around its drop point (stand, walk right, stand, walk back).
  function place(av, t) {
    if (av.drag) return { x: av.drag.x, y: av.drag.y, facing: av.drag.facing || 1, walking: false, lifted: true };
    const tl = Math.max(0, t - av.since), c = tl % 14, amp = 26;
    let off, walking = false, facing = 1;
    if (c < 3) off = 0; else if (c < 7) { off = (c - 3) / 4 * amp; walking = true; } else if (c < 10) { off = amp; facing = -1; } else { off = amp - (c - 10) / 4 * amp; walking = true; facing = -1; }
    let x = av.x + off - amp / 2; const p = av.zone?.plot;
    if (p) x = Math.max(p.x + 24, Math.min(p.x + p.w - 24, x));
    return { x, y: av.y, facing, walking, lifted: false };
  }

  /* ---------- Escorts: a district lead walks to the avatar, walks alongside and talks ---------- */
  const escorts = {};                                  // zone id → { av, from, t0, back, side }
  const posts = {};                                    // zone id → last lead post (world px) and options
  function hostFor(z) { return z.kind === 'agent' ? avatars.find(a => !a.drag && a.zone === z) : null; }
  // Called by the world for every lead the zone wants to draw. Returns true when the escort took over.
  function leadHook(z, x, y, opts, t, state) {
    posts[z.id] = { x: z.x + x, y: z.y + y, opts };
    const av = hostFor(z), e = escorts[z.id];
    if (av && state !== 'off') {
      if (!e || e.av !== av || e.back) {
        const cur = e ? escortPos(z, e, t).pos : [z.x + x, z.y + y];
        escorts[z.id] = { av, from: cur, t0: av.instant ? t - av.instant : t, side: cur[0] < place(av, t).x ? -1 : 1 }; av.instant = 0;
      }
      return true;
    }
    if (e && !e.back) { e.back = true; e.from = escortPos(z, e, t).pos; e.t0 = t; }
    if (e?.back) { if (t - e.t0 >= e.dur) { delete escorts[z.id]; return false; } return true; }
    return false;
  }
  function escortPos(z, e, t) {
    const post = posts[z.id] || { x: z.x, y: z.y };
    if (e.back) {
      const d = Math.hypot(post.x - e.from[0], post.y - e.from[1]); e.dur = Math.max(.6, d / 30);
      const f = Math.min(1, (t - e.t0) / e.dur); return { pos: [e.from[0] + (post.x - e.from[0]) * f, e.from[1] + (post.y - e.from[1]) * f], walking: f < 1, facing: post.x < e.from[0] ? -1 : 1 };
    }
    const a = place(e.av, t), target = [a.x + e.side * 30, a.y + 3], d = Math.hypot(target[0] - e.from[0], target[1] - e.from[1]), dur = Math.max(.8, d / 32), f = Math.min(1, (t - e.t0) / dur);
    if (f < 1) return { pos: [e.from[0] + (target[0] - e.from[0]) * f, e.from[1] + (target[1] - e.from[1]) * f], walking: true, facing: target[0] < e.from[0] ? -1 : 1, arrived: false };
    return { pos: target, walking: a.walking, facing: a.walking ? a.facing : -e.side, arrived: true, since: e.t0 + dur };
  }

  /* ---------- Conversation ---------- */
  const STATUS = {
    sekreter: ['TWELVE LETTERS SORTED', 'THE PIGEONS ARE OUT'], 'text-writer': ['THE DRAFT IS NEARLY DONE', 'THREE CHAPTERS TO GO'],
    gazeteci: ['BREAKING NEWS TODAY!', 'SIX SOURCES CHECKED'], girard: ['THREE NEW LEADS', 'ACME WANTS A CALL'],
    bayes: ['THE ODDS LOOK GOOD', 'THE PORTAL IS STABLE'], kandinsky: ['A NEW PIECE IS READY', 'WANT TO SEE IT?'],
    kole: ['THE CREWS ARE ON IT', 'TIMBER IS COMING IN'], 'scum-master': ['FOUR ORDERS ON THE PASS', 'YES CHEF! SERVICE!']
  };
  const BY_STATE = { waiting: ['I NEED YOUR APPROVAL', 'IT IS IN THE INBOX'], error: ['SOMETHING BROKE!', 'WE ARE ON IT'], idle: ['READY FOR A TASK', 'WHAT IS NEXT?'] };
  const REPLY = { working: 'GREAT, KEEP IT UP', waiting: 'I WILL CHECK IT', error: 'LET US FIX IT', idle: 'TAKE A SHORT BREAK' };
  function lines(z, av, state) {
    const st = BY_STATE[state] || STATUS[z.role] || ['ALL GOOD HERE', 'SEE YOU SOON'];
    return [['lead', av.greet], ['av', 'HOW IS IT GOING?'], ['lead', st[0]], ['av', REPLY[state] || 'GOOD'], ['lead', st[1]], ['', '']];
  }
  function wrap(text, n = 14) { const out = []; let cur = ''; for (const w of text.split(' ')) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; }
  function speech(k, x, y, text, t0, t) {
    // A pixel speech bubble whose tail points down at (x, y). Pops in with a small bounce.
    const rows = wrap(text), w = Math.max(...rows.map(r => P.textWidth(r))) + 8, h = rows.length * 7 + 5, age = t - t0;
    const pop = age < .12 ? 2 : age < .2 ? -1 : 0, L = Math.round(x - w / 2), T = Math.round(y - h - 5 - pop);
    k.rect(L + 1, T + 2, w, h, '#1d2a2255');
    k.rect(L - 1, T, w + 2, h, C.ink); k.rect(L, T - 1, w, h + 2, C.ink); k.rect(L, T, w, h, C.white); k.rect(L, T + h - 2, w, 2, '#e8dcc0');
    k.rect(x - 2, T + h, 5, 2, C.ink); k.rect(x - 1, T + h, 3, 1, C.white); k.rect(x - 1, T + h + 2, 3, 1, C.ink); k.px(x, T + h + 1, C.white); k.px(x, T + h + 3, C.ink);
    const shown = Math.min(text.length, Math.floor(age * 28));        // typewriter
    let used = 0; rows.forEach((r, i) => { const vis = r.slice(0, Math.max(0, shown - used)); used += r.length + 1; k.text(vis, Math.round(x - P.textWidth(r) / 2), T + 3 + i * 7, C.ink); });
  }

  /* ---------- Drawing ---------- */
  function drawAvatar(k, av, t) {
    const pl = place(av, t), f = pl.lifted ? 'lift' : pl.walking ? 'walk' + (Math.floor(t * 7) % 4) : 'stand' + (Math.floor(t * 1.2) % 2), s = sprite(av.kind, f);
    const lift = pl.lifted ? 14 + Math.round(Math.sin(t * 5) * 2) : 0;
    k.alpha(pl.lifted ? .25 : .38, () => k.ellipse(pl.x + 2, pl.y + 1, pl.lifted ? 11 : 15, pl.lifted ? 3 : 4, '#1d2a22'));
    if (!pl.lifted) { k.alpha(.5, () => k.ring(pl.x, pl.y + 1, 18, 5, av.kind === 'princess' ? '#9fdcff' : '#c8f08c')); }
    k.blit(s, pl.x, pl.y - lift, pl.facing === -1);
    if (av.kind === 'princess') {
      // Gojo: a faint Infinity shimmer around him, and a small blue orb over his raised fingers while he stands.
      k.alpha(.6, () => { for (let i = 0; i < 4; i++) { const q = t * 1.4 + i * 1.57; k.px(pl.x + Math.round(Math.cos(q) * 15), pl.y - lift - 46 + Math.round(Math.sin(q * .7 + i) * 40), '#bfeaff'); } });
      if (!pl.walking && !pl.lifted) { const ox = pl.x + 11 * pl.facing, oy = pl.y - 71 + Math.round(Math.sin(t * 3)), r = Math.sin(t * 7) > 0 ? 3 : 2.5; k.alpha(.35, () => k.circle(ox, oy, r + 1, '#58b7e6')); k.circle(ox, oy, 1.5, '#8fd4ff'); k.px(ox, oy, '#ffffff'); }
    }
    return pl;
  }
  // Draw avatars and any escorting leads in world coordinates, sorted by depth.
  function draw(k, t, v, opts = {}) {
    init(); const items = [];
    for (const av of avatars) items.push({ y: av.drag ? av.drag.y + 40 : av.y, fn: () => av._pl = drawAvatar(k, av, t) });
    for (const id in escorts) {
      const e = escorts[id], z = world().zones.find(q => q.id === id), st = opts.stateOf(z), ep = escortPos(z, e, t);
      items.push({ y: ep.pos[1], fn: () => {
        AgentCharacters.lead(k, z.role, Math.round(ep.pos[0]), Math.round(ep.pos[1]), t, st, { facing: ep.facing, pose: ep.walking ? 'walk' : 'talk' });
        e._ep = ep;
      } });
    }
    items.sort((a, b) => a.y - b.y).forEach(i => i.fn());
    if (!opts.detail) return;
    // Speech bubbles on top of everything.
    for (const id in escorts) {
      const e = escorts[id]; if (e.back || !e._ep?.arrived) continue;
      const z = world().zones.find(q => q.id === id), st = opts.stateOf(z), L = lines(z, e.av, st), tl = t - e._ep.since, step = Math.floor(tl / 2.6), cur = L[step % L.length], t0 = e._ep.since + step * 2.6;
      if (!cur[0]) continue;
      const pl = e.av._pl;
      if (cur[0] === 'lead') speech(k, Math.round(e._ep.pos[0]), Math.round(e._ep.pos[1] - 80), cur[1], t0, t);
      else speech(k, Math.round(pl.x), Math.round(pl.y - 98), cur[1], t0, t);
    }
  }

  /* ---------- Interaction (the app calls these with world coordinates) ---------- */
  function hit(x, y) {
    init();
    for (const av of [...avatars].reverse()) { const pl = av._pl || { x: av.x, y: av.y }; if (Math.abs(x - pl.x) < 17 && y < pl.y + 4 && y > pl.y - 92) return av; }
    return null;
  }
  function pick(av, x, y) { const pl = av._pl || { x: av.x, y: av.y }; av.drag = { x: pl.x, y: pl.y, ox: pl.x - x, oy: pl.y - y, facing: pl.facing }; }
  function move(av, x, y) { if (!av.drag) return; const nx = x + av.drag.ox; av.drag.facing = nx < av.drag.x ? -1 : nx > av.drag.x ? 1 : av.drag.facing; av.drag.x = nx; av.drag.y = y + av.drag.oy; }
  function drop(av, t) {
    if (!av.drag) return null;
    const W = world(); av.x = Math.max(20, Math.min(W.width - 20, av.drag.x)); av.y = Math.max(100, Math.min(W.height - 10, av.drag.y)); av.drag = null; av.since = t; av.zone = zoneAt(av.x, av.y); save();
    return av.zone;
  }
  // Test hook: put an avatar in a zone, already chatting.
  function visit(id, zoneId, t, ago = 8) { init(); const av = avatars.find(a => a.id === id), z = world().zones.find(q => q.id === zoneId); if (!av || !z) return; av.x = z.x + 40; av.y = z.y + 70; av.zone = z; av.since = t - ago; av.instant = ago; }
  function reset() { try { localStorage.removeItem(KEY); } catch { } init.done = false; init(); }

  window.Avatars = { list: avatars, draw, leadHook, hit, pick, move, drop, visit, reset, sprite };
})();
