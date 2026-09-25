/* Village owners: two large avatars you can pick up and drop anywhere on the map.
   GKTC's avatar (the Megazord from Regular Show, fan art) starts at GKTC's castle; Daghan's (Gojo Satoru, fan art) at Daghan's.
   When an avatar stands in an agent district, that district's lead walks over, walks alongside it and talks. */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ramp = P.ramp;

  // The avatars are authored on a 52×94 grid and sculpted at AV× that resolution (Pixel.sculptScaled in
  // engine/sculpt.js), so they grow without doubled pixels.
  const AV = 1.5, hires = (w, h, ramps, build) => P.sculptScaled(AV, w, h, ramps, build);

  /* ---------- Sprites (sculpted, 3/4 view facing right; flipped for left) ---------- */
  // f: 'stand0' 'stand1' 'walk0'..'walk3' 'lift'
  function pose(f) {
    const walk = f.startsWith('walk') ? +f[4] : -1;
    return { s: walk < 0 ? 0 : [3.5, 0, -3.5, 0][walk], bob: walk < 0 ? (f === 'stand1' ? 1 : 0) : [0, -1, 0, -1][walk], lift: f === 'lift', breathe: f === 'stand1' };
  }
  // Ramps: 0 tan skin, 1 black box, 2 red, 3 green glow, 4 white, 5 cap blue, 6 shorts blue, 7 brown bands, 8 silver, 9 panel grey, 10 teal, 11 orange.
  const ZORD = [ramp('#e7b487'), ramp('#26272d', [-.3, -.15, 0, .1, .2, .32, .46, .6]), ramp('#d8323a'), ramp('#9dff3c', [-.55, -.35, -.15, 0, .2, .4, .6, .8]), ramp('#eef0f2', [-.45, -.32, -.2, -.1, -.04, 0, .3, .6]), ramp('#2f93d0'), ramp('#86c8ea'), ramp('#6b4630'), ramp('#c4cad0', [-.5, -.34, -.2, -.1, 0, .25, .5, .75]), ramp('#70767e'), ramp('#35bfb0'), ramp('#f0892a')];
  function zordSprite(f) {
    const p = pose(f), s = p.s, a = -s * .8, b = p.bob;
    return hires(52, 94, ZORD, api => {
      const { part, set, dk, lt, ln, force } = api, sh = api.shapes;
      const legY = p.lift ? 2 : 0, armUp = p.lift ? -6 : 0, up = p.lift ? 1 : 0;
      // High-top sneaker, toe to the right; bottom at y + 3.5.
      const shoe = (x, y, tone) => part(sh.spline([[x - 4.2, y - 6.5], [x + 2.8, y - 6.5], [x + 3.6, y - 2], [x + 7, y + .6], [x + 7.2, y + 3.5], [x - 4.6, y + 3.5], [x - 5, y - 1]]), { ramp: 4, cap: 2.4, tone });
      // Fins sticking up and back from the shoulders.
      part(sh.poly([[11, 31 + b], [4.4, 9.6 + b], [9.6, 6.4 + b], [19.4, 27 + b]]), { ramp: 1, cap: 2, tone: -.08 });
      part(sh.poly([[33.4, 26 + b], [41.2, 5.4 + b], [46.8, 8.2 + b], [40.4, 30 + b]]), { ramp: 1, cap: 2, tone: -.16 });
      // Far arm: out to the side, open hand raised.
      const fex = 47.4 + up, fey = 38 - a * .5 + b + armUp * .6, ffx = 46.8 + up, ffy = 25 - a + b + armUp * 1.3;
      part(sh.limb([[40, 34 + b, 4.4], [fex, fey, 4]]), { ramp: 0, cap: 3, tone: -.12 });
      part(sh.limb([[fex, fey, 3.8], [ffx, ffy + 2, 3.2]]), { ramp: 0, cap: 2.6, tone: -.1 });
      part(sh.ellipse(ffx - .2, ffy - 1, 2.8, 3), { ramp: 0, cap: 1.6, tone: -.06 });
      part(sh.limb([[ffx - 2.6, ffy - 1.4, 1.1], [ffx - 3.4, ffy - 5, 1]]), { ramp: 0, cap: 1 });
      for (let i = 0; i < 3; i++) part(sh.limb([[ffx - 1 + i * 1.6, ffy - 3, .9], [ffx - .8 + i * 2, ffy - 7, .9]]), { ramp: 0, cap: 1, tone: -.04 });
      // Head poking out of the top: white face under a blue cap with a white front panel, a bolt on each side.
      part(sh.limb([[19.4, 13 + b, 1.1], [16.6, 6 + b, 1.1]]), { ramp: 7, cap: 1 }); part(sh.limb([[32.6, 12 + b, 1.1], [35.4, 5 + b, 1.1]]), { ramp: 7, cap: 1 });
      part(sh.ellipse(16.4, 5.4 + b, 1.7, 1.5), { ramp: 9, cap: 1 }); part(sh.ellipse(35.6, 4.4 + b, 1.7, 1.5), { ramp: 9, cap: 1 });
      part(sh.spline([[19.4, 12 + b], [26, 10 + b], [32.6, 11.4 + b], [32.6, 18 + b], [29.6, 23.4 + b], [22.6, 23.8 + b], [19.2, 19 + b]]), { ramp: 4, cap: 3, grad: .04 });
      part(sh.spline([[18.4, 12.6 + b], [19.6, 6.2 + b], [25, 3.2 + b], [30.8, 4.6 + b], [33.4, 9.4 + b], [33.4, 12.2 + b], [26, 11.2 + b]]), { ramp: 5, cap: 2.6 });
      part(sh.poly([[24.4, 5.2 + b], [31, 5.4 + b], [32.6, 10.2 + b], [25, 9.8 + b]]), { ramp: 4, cap: 1.2, shadow: false });
      // Legs in a wide stance: tan thighs, white tube socks, big sneakers.
      part(sh.limb([[32, 58 + b, 4.4], [37.6 - s * .5, 70 + b + legY, 3.9], [37 - s, 82 + legY, 3.2]]), { ramp: 0, cap: 3, tone: -.12 });
      part(sh.limb([[37.4 - s * .55, 72.5 + b + legY, 3.4], [37 - s, 84 + legY, 3.2]]), { ramp: 4, cap: 2.4, tone: -.12 });
      shoe(37 - s, 88 + legY, -.1);
      part(sh.limb([[20, 58 + b, 4.4], [14.6 + s * .5, 70 + b + legY, 3.9], [15.2 + s, 82 + legY, 3.2]]), { ramp: 0, cap: 3 });
      part(sh.limb([[14.8 + s * .55, 72.5 + b + legY, 3.4], [15.2 + s, 84 + legY, 3.2]]), { ramp: 4, cap: 2.4 });
      shoe(15.2 + s, 88 + legY, 0);
      // Ripped light-blue shorts.
      part(sh.poly([[14, 51 + b], [38, 50 + b], [41, 60 + b], [38.4, 63.4 + b], [36, 60.6 + b], [33.4, 64.4 + b], [31, 61 + b], [28.4, 63.8 + b], [26, 60.6 + b], [23.4, 64 + b], [21, 61 + b], [18.4, 64.6 + b], [16.2, 61 + b], [12, 63 + b]]), { ramp: 6, cap: 2.4 });
      // The tilted black box torso: top face, side face, front face, red box at the belly.
      part(sh.poly([[9.6, 27.4 + b], [34, 21.6 + b], [41.6, 24.6 + b], [12.4, 31.4 + b]]), { ramp: 1, cap: 1.4, tone: .14 });
      part(sh.poly([[37.4, 25.6 + b], [41.6, 24.6 + b], [43.4, 46 + b], [39.8, 50.4 + b]]), { ramp: 1, cap: 1.4, tone: -.12 });
      part(sh.poly([[12.4, 31.4 + b], [37.4, 25.6 + b], [39.8, 50.4 + b], [15.8, 55 + b]]), { ramp: 1, cap: 2.4, grad: .06 });
      part(sh.poly([[19.6, 51.4 + b], [33.4, 49.2 + b], [34, 56.4 + b], [20.6, 58.6 + b]]), { ramp: 2, cap: 2 });
      // Glowing green triangle eyes in a dark recess; grey control panel.
      part(sh.poly([[15.4, 36.6 + b], [27.4, 34 + b], [28, 42 + b], [16.4, 44.4 + b]]), { ramp: 1, cap: 1, tone: -.3, shadow: false });
      part(sh.poly([[16.8, 43.2 + b], [19.4, 36.6 + b], [22, 42.4 + b]]), { ramp: 3, cap: 1, tone: .2, shadow: false });
      part(sh.poly([[22.2, 42.2 + b], [24.8, 35.6 + b], [27.4, 41.4 + b]]), { ramp: 3, cap: 1, tone: .2, shadow: false });
      part(sh.poly([[29.4, 38.8 + b], [36, 37.4 + b], [36.8, 45.4 + b], [30.2, 46.8 + b]]), { ramp: 9, cap: 1.4 });
      // Near arm: huge, bent up, with the silver skull-knuckle gauntlet.
      const nex = 4.4 - up, ney = 41 + a * .5 + b + armUp * .6, nfx = 5.8 - up, nfy = 22 + a + b + armUp * 1.3;
      part(sh.limb([[12.6, 36 + b, 4.6], [nex, ney, 4.2]]), { ramp: 0, cap: 3 });
      part(sh.limb([[nex, ney, 4], [nfx, nfy + 5, 3.6]]), { ramp: 0, cap: 2.6 });
      part(sh.limb([[nfx, nfy + 5.5, 3.9], [nfx, nfy + 2.5, 3.9]]), { ramp: 8, cap: 2 });
      part(sh.ellipse(nfx + .2, nfy - .6, 3.8, 3.6), { ramp: 8, cap: 2 });
      /* Details. */
      // Fins: two red stripes each.
      for (const [p0, p1] of [[[5.4, 11.4], [10.4, 8.6]], [[6.4, 14.2], [11.6, 11.6]], [[41.6, 8], [46.2, 10.2]], [[40.8, 10.8], [45.6, 13]]]) ln([[p0[0], p0[1] + b], [p1[0], p1[1] + b]], (x, y) => { if (api.ramp(x, y) === 1) force(x, y, 5, 2); });
      // Box: lit top edge, ridges on the top face, slot, buttons on the panel, latch on the red box.
      ln([[12.4, 31.4 + b], [37.4, 25.6 + b]], (x, y) => lt(x, y, 2)); ln([[37.4, 25.6 + b], [39.8, 50.4 + b]], (x, y) => lt(x, y, 1));
      for (let i = 1; i < 4; i++) ln([[11 + i * 5.4, 29.6 - i * 1.2 + b], [17 + i * 5.4, 25 - i * 1 + b]], (x, y) => dk(x, y, 2));
      ln([[29.6, 32.6 + b], [35.4, 31.4 + b]], (x, y) => force(x, y, 0, 1)); ln([[29.6, 33.6 + b], [35.4, 32.4 + b]], (x, y) => force(x, y, 4, 1));
      force(31, 40 + b, 5, 3); force(33, 39.6 + b, 5, 2); force(35, 39.2 + b, 5, 11); ln([[31, 43.4 + b], [35.4, 42.6 + b]], (x, y) => force(x, y, 1, 1)); force(31.4, 45 + b, 6, 4);
      ln([[21.4, 53 + b], [32.6, 51 + b]], (x, y) => lt(x, y, 2)); force(27, 54.6 + b, 1, 1); force(27.6, 54.6 + b, 1, 1);
      // Eyes: bright cores.
      force(19.4, 40.4 + b, 7, 3); force(24.8, 39.4 + b, 7, 3);
      // Face: angry red eyes under slanted brows, an orange mouth; cap brim and dark "text" on the panel.
      force(23.6, 15.4 + b, 5, 2); force(24.4, 15.4 + b, 5, 2); force(28.6, 15 + b, 5, 2); force(29.4, 15 + b, 5, 2);
      ln([[22.6, 13.2 + b], [25, 14.4 + b]], (x, y) => force(x, y, 0, 1)); ln([[28, 14 + b], [30.6, 13 + b]], (x, y) => force(x, y, 0, 1));
      part(sh.ellipse(27.4, 19.4 + b, 2.6, 1.6), { ramp: 11, cap: 1, shadow: false }); ln([[25.4, 19.4 + b], [29.4, 19.4 + b]], (x, y) => dk(x, y, 2));
      ln([[19, 12 + b], [33.4, 11.8 + b]], (x, y) => { if (api.ramp(x, y) === 5) dk(x, y, 2); });
      for (const [x, y] of [[26, 6.8], [28, 6.8], [29, 6.8], [25.8, 8.6], [26.8, 8.6], [27.8, 8.6], [29.8, 8.6], [30.8, 8.6]]) force(x, y + b, 3, 1);
      // Arms: dark brown bands, gauntlet skull and knuckles.
      for (const [x0, y0, x1, y1] of [[7.6, 33.6, 9.6, 42.6], [9.6, 33, 11.6, 42], [2, 32, 9.6, 31.6], [1.4, 35, 9.4, 35], [42.6, 30.2, 44.6, 39.8], [44.6, 30.6, 46.8, 40.4], [43.6, 30, 50.4, 30.4], [43.2, 26.8, 50.4, 27]]) ln([[x0, y0 + b + (x0 > 26 ? -a * .5 : a * .5)], [x1, y1 + b + (x0 > 26 ? -a * .5 : a * .5)]], (x, y) => { if (api.ramp(x, y) === 0) force(x, y, 2, 7); });
      for (const [x, y, v] of [[5, -1.6, 0], [7, -1.6, 0], [6, .4, 1], [5, 1.4, 1], [7, 1.4, 1], [3.4, -3.4, 7], [5.6, -3.8, 7], [7.8, -3.4, 7]]) force(x - up, nfy + y, v, 8);
      // Socks: blue stripes; sneakers: teal stripes, orange ball, soles.
      for (const x of [15.2 + s, 37 - s]) { ln([[x - 3, 74 + legY], [x + 3, 74 + legY]], (xx, y) => { if (api.ramp(xx, y) === 4) force(xx, y, 3, 5); }); ln([[x - 3, 76 + legY], [x + 3, 76 + legY]], (xx, y) => { if (api.ramp(xx, y) === 4) force(xx, y, 3, 5); }); }
      for (const x of [15.2 + s, 37 - s]) { ln([[x - 2, 89 + legY], [x + 4.6, 86 + legY]], (xx, y) => force(xx, y, 5, 10)); ln([[x - .6, 90 + legY], [x + 5.6, 87.4 + legY]], (xx, y) => force(xx, y, 3, 10)); for (let j = 0; j < 4; j++) force(x - 2.4 + (j & 1), 84.4 + (j >> 1) + legY, j ? 4 : 6, 11); ln([[x - 4.4, 91 + legY], [x + 7, 91 + legY]], (xx, y) => dk(xx, y, 2)); }
      // Shorts: torn-edge shadows and a highlight.
      ln([[14.6, 52.6 + b], [37.8, 51.6 + b]], (x, y) => lt(x, y, 2)); for (let i = 0; i < 6; i++) dk(17 + i * 4.4, 61 + (i & 1) + b, 2);
    });
  }
  // Ramps: 0 skin, 1 white hair, 2 black uniform, 3 blindfold, 4 trousers, 5 swirl button, 6 blue, 7 shoes.
  const GOJO = [ramp('#f3d6bf'), ramp('#e4e9f1', [-.46, -.34, -.23, -.13, -.05, 0, .45, .8]), ramp('#1b1d26', [-.3, -.15, 0, .08, .16, .26, .38, .5]), ramp('#0c0d11', [-.2, 0, .06, .12, .18, .26, .36, .48]), ramp('#2b2f3b', [-.4, -.22, -.08, 0, .12, .26, .44, .64]), ramp('#d8b24c', [-.55, -.4, -.26, -.12, 0, .2, .45, .7]), ramp('#58b7e6'), ramp('#17181d', [-.4, -.2, 0, .12, .25, .45, .7, .9])];
  function gojoSprite(f) {
    const p = pose(f), s = p.s, a = -s * .6, b = p.bob, sign = f.startsWith('stand');
    return hires(52, 94, GOJO, api => {
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
  // Kinds stay 'boss' (GKTC's Megazord) and 'princess' (Daghan's Gojo) so older callers keep working. Both are 78 × 141 on the map.
  // A: an art-grid point (52 × 94, feet near 26, 91) → map offset from the avatar's feet.
  const cache = {}, A = (ax, ay) => [(ax - 26) * AV, (ay - 91) * AV];
  function sprite(kind, f) { const key = kind + f; return cache[key] || (cache[key] = { canvas: (kind === 'princess' ? gojoSprite : zordSprite)(f), ox: Math.round(26 * AV), oy: Math.round(91 * AV) }); }

  /* ---------- State ---------- */
  const world = () => window.VillageWorld;
  const avatars = [
    { id: 'gktc-owner', kind: 'boss', title: 'GKTC', village: 'gktc', home: [-70, 172], greet: 'MEGAZORD!' },
    { id: 'daghan-princess', kind: 'princess', title: 'Daghan', village: 'daghan', home: [70, 172], greet: 'GOJO SENSEI!' }
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
    if (p) x = Math.max(p.x + 36, Math.min(p.x + p.w - 36, x));
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
    // The lead stands beside the avatar, clear of its arms (both are drawn 1.5× their art size).
    const gap = 48;
    const a = place(e.av, t), target = [a.x + e.side * gap, a.y + 3], d = Math.hypot(target[0] - e.from[0], target[1] - e.from[1]), dur = Math.max(.8, d / 32), f = Math.min(1, (t - e.t0) / dur);
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
    const lift = pl.lifted ? 20 + Math.round(Math.sin(t * 5) * 3) : 0;
    k.alpha(pl.lifted ? .25 : .38, () => k.ellipse(pl.x + 3, pl.y + 1, pl.lifted ? 16 : 22, pl.lifted ? 4 : 6, '#1d2a22'));
    if (!pl.lifted) { k.alpha(.5, () => k.ring(pl.x, pl.y + 1, 27, 7, av.kind === 'princess' ? '#9fdcff' : '#c8f08c')); }
    k.blit(s, pl.x, pl.y - lift, pl.facing === -1);
    if (av.kind === 'boss') {
      // Megazord: the green triangle eyes glow with a slow pulse.
      const b = pose(f).bob, g = .2 + .16 * Math.sin(t * 4);
      k.alpha(g, () => { for (const [ex, ey] of [[19.4, 40.4], [24.8, 39.4]]) { const [dx, dy] = A(ex, ey + b); k.circle(pl.x + dx * pl.facing, pl.y - lift + dy, 5, '#b8ff5a'); } });
    }
    if (av.kind === 'princess') {
      // Gojo: a faint Infinity shimmer around him, and a small blue orb over his raised fingers while he stands.
      k.alpha(.6, () => { for (let i = 0; i < 4; i++) { const q = t * 1.4 + i * 1.57; k.px(pl.x + Math.round(Math.cos(q) * 22), pl.y - lift - 69 + Math.round(Math.sin(q * .7 + i) * 60), '#bfeaff'); } });
      if (!pl.walking && !pl.lifted) { const [dx, dy] = A(37, 20), ox = Math.round(pl.x + dx * pl.facing), oy = Math.round(pl.y + dy + Math.sin(t * 3)), r = Math.sin(t * 7) > 0 ? 4.5 : 3.5; k.alpha(.35, () => k.circle(ox, oy, r + 1, '#58b7e6')); k.circle(ox, oy, 2, '#8fd4ff'); k.px(ox, oy, '#ffffff'); }
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
      if (cur[0] === 'lead') speech(k, Math.round(e._ep.pos[0]), Math.round(e._ep.pos[1] - 104), cur[1], t0, t);
      else speech(k, Math.round(pl.x), Math.round(pl.y - 144), cur[1], t0, t);
    }
  }

  /* ---------- Interaction (the app calls these with world coordinates) ---------- */
  function hit(x, y) {
    init();
    for (const av of [...avatars].reverse()) { const pl = av._pl || { x: av.x, y: av.y }; if (Math.abs(x - pl.x) < 25 && y < pl.y + 5 && y > pl.y - 136) return av; }
    return null;
  }
  function pick(av, x, y) { const pl = av._pl || { x: av.x, y: av.y }; av.drag = { x: pl.x, y: pl.y, ox: pl.x - x, oy: pl.y - y, facing: pl.facing }; }
  function move(av, x, y) { if (!av.drag) return; const nx = x + av.drag.ox; av.drag.facing = nx < av.drag.x ? -1 : nx > av.drag.x ? 1 : av.drag.facing; av.drag.x = nx; av.drag.y = y + av.drag.oy; }
  function drop(av, t) {
    if (!av.drag) return null;
    const W = world(); av.x = Math.max(30, Math.min(W.width - 30, av.drag.x)); av.y = Math.max(145, Math.min(W.height - 10, av.drag.y)); av.drag = null; av.since = t; av.zone = zoneAt(av.x, av.y); save();
    return av.zone;
  }
  // Test hook: put an avatar in a zone, already chatting.
  function visit(id, zoneId, t, ago = 8) { init(); const av = avatars.find(a => a.id === id), z = world().zones.find(q => q.id === zoneId); if (!av || !z) return; av.x = z.x + 40; av.y = z.y + 70; av.zone = z; av.since = t - ago; av.instant = ago; }
  function reset() { try { localStorage.removeItem(KEY); } catch { } init.done = false; init(); }

  window.Avatars = { list: avatars, draw, leadHook, hit, pick, move, drop, visit, reset, sprite };
})();
