/* Text Writer · Editorial house: a cutaway newsroom with a grid of typewriter cubicles, the editor-in-chief's glass office,
   the copy desk, a coffee corner and a pneumatic tube to the outbox; outside, a proof-press shed, a bookstall with manuscript
   lines, and the drafting plaza where the ink scholar writes. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns['text-writer'] = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: -64, y: 80 }, REST = { x: -72, y: 128 };   // drafting desk on the plaza; garden bench when off
  const CW = 32, CUBES = [];                                    // 2 rows x 4 cubicles; (x, y) = left edge, back-partition base
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) CUBES.push({ i: r * 4 + c, r, c, x: -132 + c * CW, y: -96 + r * 48 });
  const JAM = 5;                                                // the typewriter that jams on error
  const TUBE = { y: -141, x: 146, x0: -128, end: 22 };          // brass pneumatic tube: along the back wall, down the east wall
  const TUBE_L = (TUBE.x - TUBE.x0) + (TUBE.end - TUBE.y);
  const CLOCK = { x: 6, y: -128 }, TRAY = { x: 44, y: -40 }, DL = { x: -76, y: -137 }, URN = { x: -127, y: -9 };
  const PRESS = { x: 86, y: 60, w: 44 }, OUTBOX = { x: 140, y: 22 };
  const INK = '#2a2440', INKL = '#4a4060', VIOLET = '#5c5a8a', REDPEN = '#d8402e', VISOR = '#3f8a5a', LAMPG = '#2f6a4a';
  const BOOKS = [C.plum2, C.teal2, C.red1, C.gold1, C.slate2, VIOLET, C.wood2, C.leaf2, C.terra2, C.plum1];
  const FABRIC = [C.teal2, C.slate2, S(C.teal2, -.12), C.slate3];
  const IDLE_POSE = ['lean', 'read', 'rest', 'sip', 'read', 'chair', 'lean', 'rest'];
  const LINE_W = [7, 5, 6, 7, 4, 6];

  const flagTex = base => (x, y) => {
    const r = Math.floor((y + 300) / 6), o = (r % 2) * 5, cx = (x + 300 + o) % 10, cy = (y + 300) % 6;
    if (cy === 0 || cx === 0) return S(base, -.16);
    if (cy === 1 && cx === 1) return S(base, .22);
    const h = P.hash(Math.floor((x + 300 + o) / 10), r); return h < .22 ? S(base, .09) : h > .86 ? S(base, -.08) : base;
  };
  const gravelTex = (x, y) => { const h = P.hash(x * .7, y * 1.3); return h < .1 ? C.dirt3 : h > .94 ? C.dirt5 : h > .9 ? C.stone3 : C.dirt4; };
  const soot = (k, x, y, t, n, col) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1, r = 2 + q * 5, px = x + Math.sin(q * 4 + i * 2) * 3 + q * 7, py = y - q * 30; k.alpha((1 - q) * .9, () => { k.circle(px, py, r, col); k.circle(px - 1, py - 1, Math.max(1, r - 2), S(col, .15)); }); } };
  const steam = (k, x, y, t, n = 3) => { for (let i = 0; i < n; i++) { const q = (t * .8 + i / n) % 1, sx = x + Math.round(Math.sin(q * 6 + i * 2) * 1.5); k.alpha((1 - q) * .8, () => { k.px(sx, y - Math.round(q * 9), '#f6f6f2'); k.px(sx + 1, y - 1 - Math.round(q * 9), '#e6e6e2'); }); } };
  const page = (k, x, y, sway, inked, red) => {
    k.rect(x - 1, y, 7, 5, C.ink); k.rect(x - 1 + sway, y + 4, 7, 5, C.ink);
    k.rect(x, y + 1, 5, 4, C.paper); k.rect(x + sway, y + 4, 5, 4, C.paper); k.rect(x + 4 + sway, y + 4, 1, 4, C.paper2);
    if (inked) { k.rect(x + 1, y + 2, 3, 1, INKL); k.rect(x + 1 + sway, y + 5, 3, 1, INKL); k.rect(x + 1 + sway, y + 7, 2, 1, red ? REDPEN : INKL); }
    k.rect(x + 1, y - 1, 2, 2, C.wood3);
  };
  const flatPage = (k, x, y, tilt) => { k.rect(x - 1, y - 1, 8, 5, S(C.paper2, -.3)); k.rect(x, y, 6, 3, C.paper); k.px(x + (tilt ? 5 : 0), y, C.paper2); k.rect(x + 1, y + 1, 3, 1, INKL); };
  const flyPage = (k, x, y, f) => { if (f) { k.rect(x - 3, y, 7, 2, C.ink); k.rect(x - 2, y, 5, 1, C.paper); } else { k.rect(x - 2, y - 2, 5, 5, C.ink); k.rect(x - 1, y - 1, 3, 3, C.paper); k.px(x, y, INKL); } };
  const ball = (k, x, y) => { k.rect(x - 1, y - 2, 3, 5, C.ink); k.rect(x - 2, y - 1, 5, 3, C.ink); k.rect(x - 1, y - 1, 3, 3, C.paper); k.px(x - 1, y - 1, C.white); k.px(x + 1, y + 1, C.paper2); k.px(x, y, C.paper2); };
  const inkPot = (k, x, y) => { k.rect(x, y - 4, 5, 4, INK); k.rect(x + 1, y - 5, 3, 1, INK); k.px(x, y - 4, VIOLET); k.px(x + 1, y - 3, '#6a6890'); };
  const mug = (k, x, y, c = C.white) => { k.rect(x, y - 3, 3, 3, c); k.rect(x, y - 3, 3, 1, S(c, -.25)); k.px(x + 3, y - 2, S(c, -.15)); k.px(x + 1, y - 3, C.wood0); };
  // Desk block: (x, y) is the back-left corner of the top; d rows of top surface, 6 rows of front face. Light from the top left.
  const desk = (k, x, y, w, d = 8, top = C.wood3, face = C.wood2) => {
    k.rect(x + 2, y + d + 6, w, 2, C.shadow);
    k.rect(x, y, w, d, top); k.rect(x, y, w, 1, S(top, .25)); k.rect(x, y, 1, d, S(top, .15)); k.rect(x, y + d - 1, w, 1, S(top, -.12));
    k.rect(x, y + d, w, 6, face); k.rect(x, y + d, w, 1, S(face, -.35)); k.rect(x + w - 1, y + d, 1, 6, S(face, -.3)); k.rect(x, y + d + 5, w, 1, S(face, -.45));
  };
  const reams = (k, x, y, n, w = 12) => { for (let i = 0; i < n; i++) { const yy = y - 3 - i * 3; k.rect(x, yy, w, 3, C.paper); k.rect(x, yy, w, 1, C.white); k.rect(x + w - 1, yy, 1, 3, C.paper2); k.rect(x + 3, yy, 3, 3, i % 2 ? C.teal2 : C.red1); } k.rect(x + 1, y, w, 1, C.shadow); };
  const bundle = (k, x, y) => { k.rect(x + 1, y + 1, 11, 1, C.shadow); for (let i = 0; i < 3; i++) { k.rect(x, y - 2 - i * 2, 11, 2, i % 2 ? C.paper2 : C.paper); k.px(x + 1, y - 2 - i * 2, C.stone2); } k.rect(x + 5, y - 7, 1, 7, C.wood1); k.rect(x, y - 4, 11, 1, C.wood1); };
  const bin = (k, x, y, n = 2) => { k.rect(x + 1, y + 1, 6, 1, C.shadow); k.rect(x, y - 6, 6, 6, C.stone1); for (let i = 0; i < 6; i += 2) k.rect(x + i, y - 6, 1, 6, C.stone2); k.rect(x, y - 7, 6, 1, C.stone3); k.rect(x + 5, y - 6, 1, 6, C.stone0); for (let i = 0; i < n; i++) { k.px(x + 1 + i * 2, y - 8, C.paper); k.px(x + 2 + i * 2, y - 8, C.white); } };

  /* ---------- Typewriter: static body in the terrain, animated carriage (roller, lever and paper) as cached sprites ---------- */
  // (x, y) = front centre of the machine on the desk top.
  const typewriter = (k, x, y, body) => {
    k.rect(x - 6, y, 15, 1, C.shadow);
    k.rect(x - 8, y - 10, 17, 10, C.ink);
    k.rect(x - 7, y - 9, 15, 5, body); k.rect(x - 7, y - 9, 15, 1, S(body, .35)); k.rect(x - 7, y - 9, 1, 5, S(body, .2)); k.rect(x + 7, y - 8, 1, 4, S(body, -.35));
    k.rect(x - 3, y - 9, 7, 2, C.stone0); for (let i = -2; i < 4; i += 2) k.px(x + i, y - 9, C.stone3);   // type-bar basket
    k.rect(x - 4, y - 6, 9, 1, C.gold1); k.px(x - 4, y - 6, C.gold3);                                     // brand decal
    k.rect(x - 7, y - 4, 15, 3, '#1c1c22');
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7 - (r === 0 ? 1 : 0); i++) k.px(x - 6 + i * 2 + (r % 2) + (r === 0 ? 1 : 0), y - 4 + r, r === 2 ? C.stone3 : C.stone4);
    k.rect(x - 3, y - 1, 7, 1, C.stone3);                                                                  // space bar
  };
  function drawCarriage(q, n, part, jam) {
    if (n >= 0 && !jam) {
      const h = 4 + n * 2, top = -11 - h;
      q.rect(-4, top, 8, h, C.white); q.rect(3, top, 1, h, C.paper); q.rect(-4, -12, 8, 1, C.paper);
      for (let j = 0; j < n; j++) q.rect(-3, top + 2 + j * 2, LINE_W[j % LINE_W.length] - (j === 0 ? 2 : 0), 1, j === 0 ? C.ink : INKL);
      if (part) q.rect(-3, -13, part, 1, INKL);
    }
    if (jam) {   // a crumpled, torn sheet caught in the roller
      q.poly([[-5, -12], [-3, -20], [0, -17], [2, -22], [5, -16], [4, -12]], C.paper); q.line(-3, -20, 0, -14, C.paper2); q.line(2, -22, 1, -14, S(C.paper2, -.15)); q.rect(-2, -16, 4, 1, INKL); q.px(3, -18, C.ink);
    }
    q.rect(-8, -11, 17, 2, '#24242c'); q.rect(-8, -11, 17, 1, C.slate2); q.px(-6, -11, C.slate4);
    q.rect(-10, -12, 2, 3, C.stone3); q.px(-10, -12, C.stone5); q.rect(9, -12, 2, 3, C.stone2); q.px(10, -10, C.stone1);
    q.line(-11, -12, -13, -15, C.stone4); q.px(-13, -15, C.white); q.px(-14, -15, C.stone4);
  }
  const carriage = (n, part, jam) => P.sprite(`tw-carr|${n}|${part}|${jam ? 1 : 0}`, 30, 30, 15, 26, q => drawCarriage(q, n, part, jam));

  /* ---------- Seated writers, seen from behind at their desks ---------- */
  const TL = [
    { shirt: C.white, hair: '#3a2a20', brace: C.wood1, visor: true },
    { shirt: C.slate3, hair: '#1e1a18', bun: true },
    { shirt: C.paper, hair: '#b8b4a8', vest: C.wood2 },
    { shirt: C.plum2, hair: '#c4652e', tail: true },
    { shirt: C.teal3, hair: '#e0c070' },
    { shirt: C.white, hair: '#5a4a3a', brace: C.ink, bald: true },
    { shirt: C.red1, hair: '#4a3226', bun: true },
    { shirt: '#6a7ab0', hair: '#2a1c16', visor: true }
  ];
  function drawTypist(q, L, pose, f) {
    const skin = C.skin2, skinSh = C.skin1, sh = S(L.shirt, -.22);
    q.rect(-4, -1, 9, 1, C.slate0); q.px(-4, 0, C.stone1); q.px(0, 0, C.stone1); q.px(4, 0, C.stone1); q.rect(0, -4, 1, 3, C.stone2);
    q.rect(-4, -6, 9, 2, C.slate1);
    const back = () => { q.rect(-4, -11, 9, 5, C.slate1); q.rect(-4, -11, 9, 1, C.slate3); q.rect(-4, -11, 1, 5, C.slate2); q.rect(4, -10, 1, 4, C.slate0); q.px(0, -9, C.slate2); };
    if (pose === 'chair') return back();
    const sleep = pose === 'sleep', lean = pose === 'lean' ? 1 : 0, ty = sleep ? -14 : -15 + lean, hy = sleep ? -18 : -22 + lean;
    const arm = (x, y0, y1) => { q.rect(x, Math.min(y0, y1), 2, Math.abs(y1 - y0) + 1, L.shirt); q.rect(x + 1, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1, sh); };
    // Arms reaching forward sit behind the torso and head.
    if (pose === 'type') { arm(-7, -18 + f, ty + 4); arm(5, -18 + (1 - f), ty + 4); q.px(-6, ty + 4, sh); q.rect(-7, -19 + f, 2, 1, skin); q.rect(5, -19 + (1 - f), 2, 1, skin); }
    if (pose === 'read') { arm(-7, -25, ty + 3); arm(5, -25, ty + 3); }
    if (pose === 'panic') { const s = f ? 1 : 0; q.line(-4, ty + 1, -8, -25 - s, L.shirt, 2); q.line(4, ty + 1, 8, -25 + s, L.shirt, 2); q.rect(-9, -27 - s, 2, 2, skin); q.rect(8, -27 + s, 2, 2, skin); }
    if (pose === 'sip') { arm(-7, -12, ty + 3); arm(5, -20, ty + 3); }
    if (sleep) { q.rect(-7, -18, 15, 3, L.shirt); q.rect(-7, -16, 15, 1, sh); q.rect(-2, -18, 5, 1, skin); }
    // Torso and shirt details.
    q.rect(-3, ty, 7, 1, L.shirt); q.rect(-4, ty + 1, 9, 10 - lean, L.shirt); q.rect(-4, ty + 1, 1, 9, S(L.shirt, .18)); q.rect(4, ty + 1, 1, 9, sh);
    if (L.brace) { q.line(-2, ty, 0, ty + 5, L.brace); q.line(2, ty, 0, ty + 5, L.brace); q.rect(0, ty + 5, 1, 5, L.brace); }
    if (L.vest) { q.rect(-3, ty + 2, 7, 8, L.vest); q.rect(-3, ty + 2, 1, 8, S(L.vest, .2)); q.px(0, ty + 2, L.shirt); q.rect(-1, ty + 8, 3, 1, S(L.vest, -.3)); }
    if (pose === 'rest') { q.rect(-5, ty + 2, 1, 7, sh); q.rect(5, ty + 2, 1, 7, sh); q.px(-5, ty + 9, skinSh); q.px(5, ty + 9, skinSh); }
    if (pose === 'sip') { q.rect(5, -23, 3, 3, C.white); q.rect(5, -23, 3, 1, C.wood1); q.px(8, -22, C.stone3); }
    // Head from behind: hair, ears, neck.
    q.rect(-1, hy + 6, 2, 1, skinSh);
    q.rect(-2, hy, 4, 1, L.hair); q.rect(-3, hy + 1, 6, 5, L.hair); q.px(-2, hy + 1, S(L.hair, .3)); q.px(-3, hy + 2, S(L.hair, .15)); q.rect(2, hy + 2, 1, 4, S(L.hair, -.22));
    q.px(-4, hy + 3, skin); q.px(3, hy + 3, skinSh);
    if (L.bald) { q.rect(-2, hy, 4, 2, skin); q.px(-2, hy, C.skin3); q.px(1, hy + 1, skinSh); }
    if (L.bun) { q.rect(-1, hy - 2, 3, 2, L.hair); q.px(-1, hy - 2, S(L.hair, .3)); }
    if (L.tail) q.rect(0, hy + 6, 1, 4, L.hair);
    if (L.visor) { q.rect(-3, hy + 2, 6, 1, VISOR); q.px(-4, hy + 2, VISOR); q.px(3, hy + 2, S(VISOR, -.3)); }
    if (pose === 'lean') { q.line(-4, ty + 1, -7, hy + 1, L.shirt, 2); q.line(4, ty + 1, 7, hy + 1, L.shirt, 2); q.rect(-4, hy + 2, 2, 2, skin); q.rect(2, hy + 2, 2, 2, skinSh); }
    if (pose === 'read') { q.rect(-6, -32, 12, 9, C.paper2); q.rect(-6, -32, 12, 1, C.paper); for (let i = 0; i < 3; i++) q.rect(-4, -30 + i * 2, 8 - i * 2, 1, S(C.paper2, -.12)); q.rect(-7, -25, 2, 2, skin); q.rect(5, -25, 2, 2, skin); }
    back();
  }
  const typist = (i, pose, f) => P.sprite(`tw-typist|${i}|${pose}|${f}`, 24, 36, 12, 33, q => drawTypist(q, TL[i % TL.length], pose, f));

  // Typing timeline per cubicle: n lines done, part of the current line, carriage offset, return ding, sheet pulled.
  function typing(i, t) {
    const lp = 1.25 + (i % 3) * .22, NL = 5, per = NL * lp + 1.3, u = (t + i * 1.9) % per;
    if (u >= NL * lp) return { n: -1, part: 0, sx: 3, pull: (u - NL * lp) / 1.3 };
    const n = Math.floor(u / lp), q = (u % lp) / lp;
    if (q > .86) { const r = (q - .86) / .14; return { n: n + 1, part: 0, sx: -3 + Math.round(r * 6), ding: r < .5 }; }
    const part = Math.min(6, Math.floor(q / .86 * 7));
    return { n, part, sx: 3 - part };
  }
  function cube(k, t, state, cb, z) {
    const x = cb.x + 16, y = cb.y, i = cb.i, live = state !== 'off';
    let tw, pose = 'rest', f = 0;
    if (state === 'working') { tw = typing(i, t); pose = tw.n < 0 ? 'rest' : 'type'; f = Math.floor(t * 9 + i * 3) % 2; }
    else if (state === 'idle') { tw = { n: 1 + i % 3, part: 0, sx: 3 - i % 4 }; pose = IDLE_POSE[i]; }
    else if (state === 'waiting') { tw = { n: 5, part: 0, sx: 3 }; pose = 'rest'; }
    else if (state === 'error') { tw = i === JAM ? { n: 2, part: 0, sx: 0, jam: true } : { n: 1 + i % 4, part: 2, sx: 1 }; pose = i === JAM || i === 4 || i === 1 ? 'panic' : 'rest'; f = Math.floor(t * 6 + i) % 2; }
    else { tw = { n: -1, part: 0, sx: 3 }; pose = i === 1 || i === 6 ? 'sleep' : 'chair'; }
    // Clamp lamp over the desk: warm bulb and a pool of light while the office is lit.
    if (live) { k.rect(cb.x + 25, y - 18, 4, 1, C.gold4); if (z.detail) k.alpha(.22, () => k.poly([[cb.x + 24, y - 17], [cb.x + 30, y - 17], [cb.x + 31, y - 2], [cb.x + 18, y - 2]], C.glassLit)); }
    const shake = tw.jam ? [0, 1, 0, -1][Math.floor(t * 14) % 4] : 0;
    k.blit(carriage(tw.n, tw.part, tw.jam), x + tw.sx + shake, y);
    if (tw.ding) { k.px(x + tw.sx + 12, y - 15, C.gold4); k.px(x + tw.sx + 13, y - 16, C.gold3); k.px(x + tw.sx + 11, y - 16, C.gold3); }
    if (state === 'working' && pose === 'type') k.px(x, y - 11 - f, C.stone4);            // the type bar strikes the platen
    // Pulled sheets: some are crumpled and tossed into the bin, the rest go on the finished pile.
    if (tw.pull !== undefined && z.detail) {
      const p = tw.pull;
      if (i % 3 === 1) { const bx = x + 2 + (cb.x + 28 - x - 2) * p, by = y - 6 + 16 * p - Math.sin(p * Math.PI) * 14; ball(k, Math.round(bx), Math.round(by)); }
      else k.rect(x + 8, y - 4 - Math.round(p * 2), 6, 1, C.white);
    }
    k.ellipse(x + 1, y + 16, 5, 1, C.shadow);
    k.blit(typist(i, pose, f), x, y + 16);
    if (pose === 'sleep') { const q = (t * .4 + i * .3) % 1; k.alpha(1 - q, () => k.text('z', x + 4 + q * 5, y - 4 - q * 10, '#c8d4ff')); }
    if (state === 'error' && i === JAM) {
      if (Math.floor(t * 8) % 2) for (const [sx, sy] of [[-9, -14], [8, -16], [-5, -20], [11, -11], [2, -24]]) k.px(x + sx, y + sy, (sx + sy) % 2 ? C.gold4 : C.white);
      else for (const [sx, sy] of [[-11, -12], [10, -19], [-3, -23]]) k.px(x + sx, y + sy, C.gold3);
      soot(k, x - 2, y - 18, t * 1.3, 4, '#3a3640'); soot(k, x + 4, y - 14, t + .4, 3, '#6a6670');
    }
  }

  /* ---------- Walkers along a polyline, back and forth ---------- */
  function along(pts, p) {
    const segs = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
    const back = p >= .5, q = back ? (1 - p) * 2 : p * 2; let d = q * tot;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) { const u = Math.min(1, d / segs[i]), a = pts[i], b = pts[i + 1], dx = b[0] - a[0];
        return { x: Math.round(a[0] + (b[0] - a[0]) * u), y: Math.round(a[1] + (b[1] - a[1]) * u), back, facing: dx === 0 ? (back ? -1 : 1) : (dx > 0) === !back ? 1 : -1 }; }
      d -= segs[i];
    }
  }
  const tubeAt = s => s < TUBE.x - TUBE.x0 ? [TUBE.x0 + s, TUBE.y] : [TUBE.x, TUBE.y + (s - (TUBE.x - TUBE.x0))];
  const canister = (k, s) => { const [x, y] = tubeAt(s); if (y === TUBE.y) { k.rect(x - 2, y - 1, 5, 3, C.gold0); k.rect(x - 1, y - 1, 3, 2, C.gold4); } else { k.rect(x - 1, y - 2, 3, 5, C.gold0); k.rect(x - 1, y - 1, 2, 3, C.gold4); } };

  return {
    paint(k) {
      // ----- Grounds: flagged plaza, gravel yard and path, garden lawn texture.
      k.rectTex(-190, 14, 380, 130, (x, y) => { const h = P.hash(x, y); return h < .03 ? C.grass4 : h > .985 ? C.grass1 : null; });
      k.poly([[-100, 16], [66, 16], [70, 92], [20, 100], [-20, 100], [-104, 92]], C.stone2);
      k.polyTex([[-98, 17], [64, 17], [68, 90], [20, 98], [-20, 98], [-102, 90]], flagTex(C.stone4));
      k.rect(-17, 96, 34, 46, C.dirt2); k.rectTex(-15, 96, 30, 46, gravelTex);
      k.poly([[68, 16], [196, 16], [184, 104], [160, 134], [72, 134]], C.dirt2); k.polyTex([[70, 17], [194, 17], [182, 103], [158, 132], [73, 132]], gravelTex);
      // Ink-drop mosaic in front of the door.
      k.ellipse(0, 48, 18, 7, C.stone2); k.ellipse(0, 48, 16, 6, C.plaster3); k.ring(0, 48, 12, 4, C.stone2);
      k.poly([[0, 41], [4, 48], [0, 53], [-4, 48]], INK); k.px(-1, 46, VIOLET); k.rect(-15, 48, 30, 1, C.gold1); k.px(0, 48, C.gold3);

      // ----- The editorial house: a roofless cutaway box. Roof slice and cornice along the back.
      k.rect(-142, -155, 284, 7, C.plum1);
      for (let x = -142; x < 142; x += 4) { k.rect(x, -155, 2, 7, C.plum2); k.px(x, -155, C.plum3); }
      k.rect(-142, -155, 284, 1, C.plum3); k.rect(-142, -149, 284, 1, C.plum0);
      k.rect(-142, -148, 284, 4, C.stone4); k.rect(-142, -148, 284, 1, C.stone5); k.rect(-142, -145, 284, 1, C.stone2);
      // Back wall: plaster over a panelled wainscot.
      k.rect(-136, -144, 272, 20, C.plaster2); k.dither(-136, -144, 272, 20, C.plaster1, 1); k.rect(-136, -144, 272, 1, S(C.plaster1, -.2));
      k.rect(-136, -124, 272, 10, C.wood2); k.rect(-136, -125, 272, 1, C.wood4); k.rect(-136, -115, 272, 1, C.wood0);
      for (let x = -134; x < 134; x += 12) { k.rect(x, -122, 10, 6, C.wood1); k.rect(x + 1, -121, 8, 4, C.wood2); k.rect(x + 1, -121, 8, 1, C.wood3); }
      // Floor: worn linoleum tiles; a plum runner up the aisle; the chief's rug.
      k.rect(-136, -114, 272, 124, C.stone3);
      for (let y = -114; y < 10; y += 6) for (let x = -136; x < 136; x += 6) { const odd = ((x + y) / 6) & 1; k.rect(x, y, 6, 6, odd ? C.stone3 : S(C.stone3, .12)); if (P.hash(x, y) < .12) k.px(x + 2, y + 3, S(C.stone3, -.12)); }
      k.rect(-1, -100, 14, 110, C.gold1); k.rect(0, -100, 12, 110, C.plum1); k.dither(0, -100, 12, 110, C.plum2, 1); k.rect(1, -100, 1, 110, C.gold2); k.rect(10, -100, 1, 110, C.gold2);
      k.rect(22, -102, 108, 40, C.gold1); k.rect(23, -101, 106, 38, C.red1); k.dither(25, -99, 102, 34, C.red2, 1); k.rect(27, -97, 98, 1, C.gold2); k.rect(27, -67, 98, 1, C.gold2);

      // Back-wall decor. Corkboard of pinned drafts with red string.
      k.rect(-133, -138, 32, 20, C.wood1); k.rect(-132, -137, 30, 18, C.dirt2); k.dither(-132, -137, 30, 18, C.dirt1, 1); k.rect(-132, -137, 30, 1, C.dirt3);
      for (const [x, y, c] of [[-130, -135, C.paper], [-122, -133, C.white], [-114, -136, C.paper], [-107, -131, '#f2d78a'], [-128, -127, '#d8e8f0'], [-118, -126, C.paper], [-110, -125, C.white]]) { k.rect(x, y, 6, 7, c); k.rect(x + 1, y + 2, 4, 1, C.stone1); k.rect(x + 1, y + 4, 3, 1, C.stone1); k.px(x + 2, y, C.red3); }
      k.rect(-104, -136, 3, 3, C.slate3); k.rect(-104, -126, 3, 3, C.slate2);
      k.line(-128, -135, -112, -136, C.red2); k.line(-112, -136, -105, -131, C.red2); k.line(-120, -133, -116, -126, C.red2);
      // Windows onto the town.
      const win = (x, y) => { k.rect(x - 1, y - 1, 14, 18, C.wood0); k.rect(x, y, 12, 16, C.glass); k.rect(x, y, 12, 5, S(C.glass, .25)); k.rect(x + 5, y, 2, 16, C.wood1); k.rect(x, y + 7, 12, 1, C.wood1); k.line(x + 1, y + 13, x + 4, y + 9, S(C.glass, .45)); k.rect(x - 2, y + 16, 16, 2, C.stone4); };
      win(-96, -138); win(-40, -138); win(90, -138);
      // DEADLINE board with its warning lamp (lamp animates).
      k.rect(DL.x - 1, DL.y - 1, 28, 17, C.wood1); k.rect(DL.x, DL.y, 26, 15, C.slate0); k.dither(DL.x, DL.y, 26, 15, C.slate1, 1);
      k.text('DEAD', DL.x + 6, DL.y + 2, C.paper); k.text('LINE', DL.x + 6, DL.y + 8, C.red3); k.rect(DL.x + 2, DL.y + 14, 22, 1, C.paper2);
      k.rect(DL.x + 28, DL.y + 2, 6, 6, C.stone1); k.rect(DL.x + 29, DL.y + 3, 4, 4, C.red0); k.rect(DL.x + 30, DL.y + 8, 2, 3, C.stone1);
      // Wall clock over the aisle (hands animate).
      k.circle(CLOCK.x, CLOCK.y, 7, C.ink); k.circle(CLOCK.x, CLOCK.y, 6, C.white); k.circle(CLOCK.x + 1, CLOCK.y + 1, 5, C.paper);
      for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]]) k.px(CLOCK.x + dx, CLOCK.y + dy, C.ink);
      // Pneumatic tube along the top of the wall, dropping to the aisle station, out through the east wall and down to the outbox.
      k.rect(TUBE.x0 - 3, TUBE.y - 2, 4, 4, C.gold0); k.rect(TUBE.x0, TUBE.y - 1, TUBE.x - TUBE.x0, 2, C.gold1); k.rect(TUBE.x0, TUBE.y - 1, TUBE.x - TUBE.x0, 1, C.gold2);
      for (let x = TUBE.x0 + 10; x < 136; x += 24) k.rect(x, TUBE.y - 2, 2, 4, C.gold0);
      k.rect(5, TUBE.y, 2, 29, C.gold1); k.px(5, TUBE.y + 4, C.gold3);
      k.rect(1, -113, 10, 3, C.gold0); k.rect(2, -112, 8, 11, C.gold1); k.rect(2, -112, 2, 11, C.gold3); k.rect(8, -111, 1, 10, C.gold0); k.rect(4, -108, 4, 3, C.ink);
      k.rect(3, -101, 6, 1, C.gold0); k.rect(5, -100, 2, 6, C.stone1); k.rect(2, -96, 8, 4, C.stone1); k.rect(3, -95, 6, 2, C.stone0); k.rect(3, -96, 2, 1, C.gold3);
      // Side walls (thin cut tops with corner pillars) and the low cut front wall with the entrance gap.
      for (const x of [-140, 136]) { k.rect(x, -148, 4, 132, C.stone4); k.rect(x, -148, 1, 132, C.stone5); k.rect(x + 3, -148, 1, 132, C.stone2); k.rect(x, -18, 4, 30, C.terra2); for (let y = -16; y < 12; y += 3) k.rect(x, y, 4, 1, C.terra1); k.rect(x, -18, 4, 1, C.stone4); }
      for (const [x0, x1] of [[-136, -12], [12, 136]]) {
        k.rect(x0, 4, x1 - x0, 3, C.stone4); k.rect(x0, 4, x1 - x0, 1, C.stone5); k.rect(x0, 7, x1 - x0, 6, C.terra2);
        for (let x = x0; x < x1; x += 6) { k.rect(x, 7, 1, 3, C.terra1); k.rect(x + 3, 10, 1, 3, C.terra1); } k.rect(x0, 10, x1 - x0, 1, C.terra1); k.rect(x0, 12, x1 - x0, 1, C.terra0);
      }
      k.rect(-12, 10, 24, 3, C.stone3); k.rect(-12, 10, 24, 1, C.stone4); k.rect(-14, 13, 28, 3, C.stone4); k.rect(-14, 15, 28, 1, C.stone2);

      // ----- The editorial floor: two rows of four cubicles, each with a typewriter, clamp lamp, notes, pile and bin.
      for (const cb of CUBES) {
        const { x, y, i } = cb, F = FABRIC[i % FABRIC.length];
        k.rect(x, y - 16, CW + 3, 2, C.stone4); k.rect(x, y - 16, CW + 3, 1, C.stone5);
        k.rect(x, y - 14, CW + 3, 14, F); k.dither(x, y - 14, CW + 3, 14, S(F, -.14), 1); k.rect(x, y - 1, CW + 3, 1, S(F, -.35));
        for (const [nx, ny, c] of [[x + 4, y - 13, C.paper], [x + 11, y - 12, '#f2d78a'], [x + 23, y - 13, C.white]]) { k.rect(nx, ny, 5, 5, c); k.rect(nx + 1, ny + 2, 3, 1, C.stone1); k.px(nx + 2, ny, C.red3); }
        if (i % 2) { k.rect(x + 18, y - 13, 4, 4, C.slate4); k.px(x + 19, y - 12, C.skin2); } else { k.rect(x + 17, y - 13, 5, 5, C.paper); k.rect(x + 17, y - 13, 5, 1, C.red2); k.px(x + 19, y - 11, C.ink); }
        desk(k, x + 3, y - 6, CW - 3, 8, C.wood4, C.wood2);
        k.rect(x + 13, y + 3, 7, 3, C.wood1); k.rect(x + 16, y + 4, 1, 1, C.gold2);           // drawer handle
        typewriter(k, x + 16, y, i % 3 === 1 ? '#3a4a42' : i % 3 === 2 ? '#4a2e2e' : '#2c2e36');
        mug(k, x + 4, y - 1, [C.white, C.teal3, C.red2, C.gold2][i % 4]);
        for (let j = 0; j < 2 + (i % 3); j++) k.rect(x + 24 + (j & 1), y - 2 - j, 6, 1, j % 2 ? C.paper2 : C.white);
        k.rect(x + 24, y - 1, 6, 1, C.paper2);
        // Clamp lamp on the partition: green shade over the desk.
        k.rect(x + 28, y - 17, 2, 2, C.stone1); k.line(x + 29, y - 17, x + 27, y - 21, C.stone2); k.rect(x + 23, y - 22, 7, 3, LAMPG); k.rect(x + 23, y - 22, 7, 1, S(LAMPG, .3)); k.rect(x + 24, y - 19, 5, 1, S(LAMPG, -.35));
        bin(k, x + 26, y + 17, 1 + (i % 3));
        // Side partitions: cap strip then the fabric end face at the aisle.
        for (const px of i % 4 === 3 ? [x, x + CW] : [x]) { k.rect(px, y - 16, 3, 20, C.stone4); k.rect(px, y - 16, 1, 20, C.stone5); k.rect(px + 2, y - 16, 1, 20, C.stone3); k.rect(px, y + 4, 3, 15, F); k.rect(px + 2, y + 4, 1, 15, S(F, -.3)); k.rect(px, y + 4, 3, 1, S(F, .25)); k.rect(px - 1, y + 19, 5, 1, C.stone1); }
      }

      // ----- Editor-in-chief's glass office: bookcase, framed front page, filing cabinet, big desk with a candlestick phone.
      k.rect(20, -138, 36, 24, C.wood1); k.rect(21, -137, 34, 22, '#3e3024');
      for (let r = 0; r < 2; r++) {
        const sy = -127 + r * 11; let x = 22, n = 0;
        while (x < 53) { const h = P.hash(n + r * 17, r), bw = 2 + Math.floor(h * 2.2), bh = 6 + Math.floor(P.hash(r, n) * 3), col = BOOKS[Math.floor(P.hash(n, r * 7) * BOOKS.length)];
          if (x + bw > 54) break; k.rect(x, sy - bh, bw, bh, col); k.rect(x, sy - bh, 1, bh, S(col, .22)); if (bh > 7) k.rect(x, sy - bh + 2, bw, 1, C.gold2); x += bw; n++; }
        k.rect(21, sy, 34, 2, C.wood3); k.rect(21, sy, 34, 1, C.wood4);
      }
      k.rect(60, -139, 24, 19, C.gold1); k.rect(61, -138, 22, 17, C.paper); k.rect(62, -137, 20, 3, C.ink); k.rect(63, -136, 18, 1, C.paper2);
      for (let c = 0; c < 3; c++) for (let l = 0; l < 5; l++) k.rect(62 + c * 7, -132 + l * 2, 6 - (l === 4 ? 2 : 0), 1, C.stone2); k.rect(62, -132, 6, 4, C.slate3);
      k.rect(108, -136, 9, 11, C.wood1); k.rect(109, -135, 7, 9, C.paper); k.circle(112, -131, 2, C.red2); k.px(112, -131, C.gold3);
      k.rect(120, -124, 14, 3, C.stone3); k.rect(120, -121, 14, 17, C.stone2); k.rect(120, -121, 1, 17, C.stone3); k.rect(133, -121, 1, 17, C.stone1);
      for (let d = 0; d < 3; d++) { k.rect(121, -120 + d * 5, 12, 1, C.stone1); k.rect(125, -118 + d * 5, 4, 1, C.stone4); k.rect(126, -117 + d * 5, 2, 1, C.paper); }
      Props.pot(k, 22, -92); k.rect(22, -99, 7, 2, C.leaf3); k.px(20, -100, C.leaf2); k.px(29, -100, C.leaf4);
      desk(k, 76, -84, 44, 8, C.wood2, C.wood1); k.rect(96, -75, 6, 3, C.wood0); k.px(98, -74, C.gold2);
      k.rect(107, -93, 9, 3, LAMPG); k.rect(107, -93, 9, 1, S(LAMPG, .3)); k.rect(111, -90, 1, 5, C.gold1); k.rect(109, -85, 5, 1, C.gold1);
      k.rect(80, -86, 3, 1, C.ink); k.rect(81, -92, 1, 6, C.ink); k.rect(80, -93, 3, 2, C.ink); k.rect(83, -90, 1, 3, C.ink); k.px(84, -91, C.ink); k.px(80, -93, C.stone2);
      for (let j = 0; j < 4; j++) k.rect(87 + (j & 1), -81 - j * 2, 10, 2, j % 2 ? C.paper2 : C.white);
      k.rect(88, -88, 8, 1, REDPEN); k.px(93, -87, REDPEN); k.line(98, -79, 103, -81, REDPEN);
      k.rect(100, -84, 10, 3, C.gold1); k.rect(101, -83, 8, 1, C.ink); mug(k, 114, -78, C.white);
      // Glass walls: the side pane and the front with its open door; translucent, framed in steel.
      k.alpha(.32, () => { k.rect(14, -128, 3, 84, C.glass); k.rect(17, -60, 9, 16, C.glass); k.rect(41, -60, 95, 16, C.glass); });
      k.alpha(.55, () => { for (const x of [20, 48, 84, 112]) { k.line(x, -46, x + 6, -58, C.white); k.line(x + 3, -46, x + 7, -54, C.white); } k.line(15, -80, 15, -100, C.white); });
      k.rect(14, -130, 3, 2, C.slate2); k.rect(14, -128, 1, 84, C.slate2); k.rect(16, -128, 1, 70, C.slate1);
      k.rect(14, -62, 122, 2, C.slate2); k.rect(14, -62, 122, 1, C.slate4); k.rect(14, -45, 122, 2, C.slate1);
      for (const x of [26, 40, 76, 106, 135]) k.rect(x, -60, 1, 15, C.slate1);
      k.rect(24, -60, 2, 16, C.slate0); k.rect(40, -60, 2, 16, C.slate0); k.rect(26, -45, 14, 2, C.stone2);
      k.text('EDITOR', 45, -55, C.gold2); k.rect(45, -49, 23, 1, C.gold1);
      k.rect(49, -66, 6, 4, C.slate0); k.rect(50, -65, 4, 2, '#6a4a1a');            // amber approval lamp (animates)
      // Approval tray table outside the door.
      desk(k, TRAY.x, TRAY.y, 14, 4, C.wood3, C.wood2); k.rect(TRAY.x + 2, TRAY.y - 1, 10, 2, C.stone2); k.rect(TRAY.x + 2, TRAY.y - 1, 10, 1, C.stone4);
      k.rect(TRAY.x + 4, TRAY.y + 5, 6, 3, C.gold2); k.rect(TRAY.x + 5, TRAY.y + 6, 4, 1, C.ink);

      // ----- Copy desk: galley proofs marked in red pen, the spike, paste pot, dictionary.
      desk(k, 70, -26, 58, 8, C.wood3, C.wood1);
      for (let j = 0; j < 4; j++) { const gx = 74 + j * 12; k.rect(gx, -25, 8, 6, C.paper); k.rect(gx, -25, 8, 1, C.white); for (let l = 0; l < 2; l++) k.rect(gx + 1, -23 + l * 2, 6 - l * 2, 1, INKL); k.line(gx + 1, -20, gx + 6, -24, REDPEN); k.px(gx + 6, -22, REDPEN); }
      k.rect(122, -34, 1, 10, C.stone1); for (let j = 0; j < 4; j++) k.rect(119, -26 - j * 2, 7, 1, j % 2 ? C.paper2 : C.white);   // the spike
      k.rect(110, -29, 8, 5, C.plum1); k.rect(110, -29, 8, 1, C.plum3); k.rect(110, -25, 8, 1, C.paper);                          // dictionary
      k.rect(72, -29, 3, 4, C.stone2); k.px(72, -31, REDPEN); k.px(74, -32, C.gold2); k.px(73, -31, C.teal2);                       // pencil cup
      k.ellipse(104, -21, 2, 1, C.plaster1); k.px(104, -22, C.white);                                                                  // paste pot
      // Coat rack with a fedora and a trench coat, and a potted fern.
      k.ellipse(25, 2, 4, 1, C.shadow); k.rect(24, -20, 2, 22, C.wood1); k.rect(24, -20, 1, 22, C.wood3); k.rect(21, 0, 8, 2, C.wood1);
      k.rect(19, -21, 12, 2, C.wood1); k.rect(20, -24, 8, 3, C.wood0); k.rect(18, -21, 3, 1, C.wood0);
      k.poly([[26, -18], [31, -17], [32, -4], [26, -4]], C.dirt3); k.rect(26, -18, 1, 14, C.dirt4); k.rect(30, -14, 2, 10, C.dirt2); k.rect(26, -11, 6, 1, C.dirt1);
      Props.pot(k, 126, -6); Props.pot(k, 60, -6);
      bundle(k, 90, 1); bundle(k, 104, 2);

      // ----- Coffee corner: counter with an urn, cups and doughnuts; water cooler; filing cabinets; paper reams; bin.
      desk(k, -134, -12, 28, 7, C.stone4, C.stone2);
      k.rect(URN.x - 3, URN.y - 16, 8, 14, C.stone1); k.rect(URN.x - 3, URN.y - 16, 3, 14, C.stone4); k.rect(URN.x + 4, URN.y - 16, 1, 14, C.stone0);
      k.rect(URN.x - 4, URN.y - 17, 10, 2, C.stone2); k.rect(URN.x - 1, URN.y - 19, 4, 2, C.stone0); k.rect(URN.x + 5, URN.y - 6, 2, 1, C.stone0); k.px(URN.x + 6, URN.y - 5, C.stone0);
      k.rect(URN.x - 1, URN.y - 9, 3, 2, C.red1);
      for (let i = 0; i < 3; i++) mug(k, -118 + i * 4, -7, [C.white, C.red2, C.teal3][i]);
      k.rect(-116, -12, 9, 3, C.paper); k.rect(-116, -12, 9, 1, C.red2); k.px(-114, -10, C.wood3); k.px(-111, -10, C.plum3);
      k.rect(-90, -9, 8, 10, C.white); k.rect(-90, -9, 2, 10, C.stone5); k.rect(-83, -9, 1, 10, C.stone2); k.rect(-88, -6, 2, 2, C.red2); k.rect(-85, -6, 2, 2, C.water1);
      k.alpha(.8, () => { k.rect(-89, -19, 6, 10, C.water3); k.rect(-89, -19, 2, 10, C.water4); }); k.rect(-88, -20, 4, 1, C.water1);
      for (let c = 0; c < 3; c++) { const x = -78 + c * 11; k.rect(x, -18, 11, 3, C.slate3); k.rect(x, -18, 11, 1, C.slate4); k.rect(x, -15, 11, 16, C.slate2); k.rect(x, -15, 1, 16, C.slate3); k.rect(x + 10, -15, 1, 16, C.slate1);
        for (let d = 0; d < 3; d++) { k.rect(x + 1, -15 + d * 5 + 4, 9, 1, C.slate1); k.rect(x + 3, -13 + d * 5, 5, 1, C.paper); k.rect(x + 4, -12 + d * 5, 3, 1, C.stone4); } }
      reams(k, -42, 1, 4); reams(k, -28, 1, 2);
      bin(k, -14, 0, 3);

      // ----- Outside: the drafting plaza. The ink scholar's slanted desk with ink pots and stacked drafts.
      const dx = LEAD.x + 24, dy = LEAD.y;
      Props.table(k, dx, dy, 28, 12, C.wood2);
      k.poly([[dx + 1, dy - 12], [dx + 27, dy - 12], [dx + 25, dy - 18], [dx + 3, dy - 18]], C.wood3); k.poly([[dx + 5, dy - 13], [dx + 20, dy - 13], [dx + 19, dy - 17], [dx + 6, dy - 17]], C.paper);
      for (let i = 0; i < 2; i++) k.rect(dx + 7, dy - 16 + i * 2, 10 - i * 3, 1, INKL);
      inkPot(k, dx + 21, dy - 12);
      k.rect(dx + 2, dy + 2, 8, 4, C.paper2); k.rect(dx + 2, dy, 8, 2, C.paper); k.rect(dx + 3, dy - 2, 7, 2, C.white); k.rect(dx + 2, dy + 1, 8, 1, C.red2);
      Props.pot(k, -26, 18); Props.pot(k, 20, 18);
      Props.bench(k, 30, 70, 20); Props.lamp(k, -24, 104, false); Props.lamp(k, 22, 104, false);
      Props.sign(k, 34, 132, 'SCRIPT', C.plum1); Props.pot(k, -30, 130);
      // An advertising column plastered with posters.
      k.ellipse(60, 81, 7, 2, C.shadow); k.rect(54, 58, 12, 22, C.stone3); k.rect(54, 58, 3, 22, C.stone4); k.rect(64, 58, 2, 22, C.stone1);
      k.rect(54, 61, 12, 8, C.paper); k.rect(55, 62, 5, 2, C.red2); k.rect(55, 65, 9, 1, C.ink); k.rect(58, 70, 8, 7, '#f2d78a'); k.rect(59, 71, 5, 1, C.ink); k.rect(59, 73, 4, 1, C.stone1); k.rect(54, 70, 4, 6, C.teal3);
      k.rect(53, 55, 14, 3, C.teal1); k.rect(53, 55, 14, 1, C.teal3); k.rect(56, 52, 8, 3, C.teal2); k.px(60, 51, C.gold2); k.rect(53, 79, 14, 2, C.stone2);
      // A newsstand box by the plaza with today's edition.
      k.ellipse(48, 41, 6, 2, C.shadow); k.rect(42, 22, 12, 19, C.teal1); k.rect(42, 22, 2, 19, C.teal3); k.rect(53, 22, 1, 19, C.teal0); k.rect(43, 26, 10, 7, C.glassDark); k.rect(44, 27, 8, 5, C.paper); k.rect(44, 27, 8, 1, C.ink); k.rect(45, 29, 3, 2, C.slate3); k.rect(41, 21, 14, 2, C.teal2);

      // ----- South-west: the bookstall, manuscript drying lines and a reading garden.
      Props.stall(k, -176, 50, 40, C.plum2, []);
      for (let i = 0; i < 12; i++) { const bx = -174 + i * 3, h = 5 + (i * 7) % 3; k.rect(bx, 40 - h, 2, h, BOOKS[i % BOOKS.length]); k.px(bx, 40 - h, S(BOOKS[i % BOOKS.length], .3)); }
      k.rect(-166, 12, 20, 8, C.wood1); k.rect(-165, 13, 18, 6, C.paper); k.text('BOOKS', -165, 14, C.plum1);
      Props.crate(k, -170, 54, 9); k.rect(-169, 53, 7, 2, C.teal2); Props.crate(k, -150, 56, 8); k.rect(-149, 55, 6, 2, C.red1);
      for (const x of [-156, -130, -104]) { k.ellipse(x + 2, 105, 3, 1, C.shadow); k.rect(x - 1, 80, 3, 25, C.wood2); k.rect(x - 1, 80, 1, 25, C.wood4); k.rect(x - 2, 79, 5, 2, C.wood1); }
      k.line(-156, 81, -130, 83, C.paper2); k.line(-130, 83, -104, 81, C.paper2);
      Props.bench(k, -124, 132, 24);
      Props.flowerBed(k, -150, 112, 36, 9, ['#c3a2c0', '#f6ecd0', '#e0cc92'], 3);
      Props.tree(k, -134, 142, 'blossom', 1, 0); Props.bush(k, -44, 142, 1); Props.bush(k, -94, 108, 2);
      for (let i = 0; i < 10; i++) Props.flower(k, -180 + P.hash(i, 11) * 80, 64 + P.hash(i, 12) * 12, ['#c3a2c0', '#f6ecd0', '#e98aa0'][i % 3]);

      // ----- South-east: the proof-press shed, the outbox at the foot of the tube, proofs drying and bundled editions.
      k.rect(76, 30, 60, 20, C.plaster1); for (let x = 78; x < 136; x += 4) k.rect(x, 30, 1, 20, S(C.plaster1, -.12)); k.rect(76, 49, 60, 1, C.wood0);
      for (let s = 0; s < 2; s++) { const sy = 38 + s * 8; k.rect(78, sy, 56, 2, C.wood2); k.rect(78, sy, 56, 1, C.wood4); }
      for (let i = 0; i < 6; i++) { k.rect(80 + i * 8, 34, 5, 4, [INK, C.red1, C.slate1, INK, C.teal1, C.gold1][i]); k.rect(80 + i * 8, 34, 5, 1, C.stone3); }
      for (let i = 0; i < 5; i++) k.rect(82 + i * 10, 43, 8, 3, i % 2 ? C.paper2 : C.paper);
      Props.awning(k, 72, 22, 68, C.slate2, C.slate3, 7); k.rect(72, 22, 68, 1, C.slate4);
      k.rect(94, 13, 24, 9, C.wood1); k.rect(95, 14, 22, 7, C.ink); k.text('PRESS', 96, 15, C.paper);
      k.rect(97, 21, 1, 1, C.wood1); k.rect(114, 21, 1, 1, C.wood1);
      desk(k, PRESS.x, PRESS.y, PRESS.w, 8, C.stone2, C.stone1);
      k.rect(PRESS.x - 2, PRESS.y - 3, 3, 20, C.slate1); k.rect(PRESS.x + PRESS.w - 1, PRESS.y - 3, 3, 20, C.slate1);
      k.rect(PRESS.x + 3, PRESS.y + 1, 18, 6, '#1c1c22'); for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) k.px(PRESS.x + 4 + c * 2, PRESS.y + 2 + r * 2, C.stone2);
      k.rect(PRESS.x + 25, PRESS.y + 1, 14, 6, C.white); for (let l = 0; l < 3; l++) k.rect(PRESS.x + 26, PRESS.y + 2 + l * 2, 12 - l * 3, 1, INK);
      Props.barrel(k, 148, 50); k.ring(PRESS.x + PRESS.w + 4, PRESS.y + 3, 5, 5, C.slate0); k.ring(PRESS.x + PRESS.w + 4, PRESS.y + 3, 4, 4, C.slate2); k.rect(PRESS.x + PRESS.w + 3, PRESS.y + 2, 3, 3, C.slate0); reams(k, 118, 58, 3, 10); reams(k, 150, 76, 5, 11);
      // Outbox under the tube.
      k.rect(TUBE.x, TUBE.y, 2, TUBE.end - TUBE.y, C.gold1); k.rect(TUBE.x, TUBE.y, 1, TUBE.end - TUBE.y, C.gold2); k.rect(TUBE.x - 2, TUBE.y - 2, 4, 4, C.gold0);
      for (let y = TUBE.y + 16; y < TUBE.end; y += 24) k.rect(TUBE.x - 1, y, 4, 2, C.gold0);
      k.rect(OUTBOX.x + 2, OUTBOX.y + 21, 18, 2, C.shadow); k.rect(OUTBOX.x, OUTBOX.y, 18, 4, C.teal2); k.rect(OUTBOX.x, OUTBOX.y, 18, 1, C.teal4);
      k.rect(OUTBOX.x, OUTBOX.y + 4, 18, 17, C.teal1); k.rect(OUTBOX.x, OUTBOX.y + 4, 2, 17, C.teal3); k.rect(OUTBOX.x + 17, OUTBOX.y + 4, 1, 17, C.teal0);
      k.rect(OUTBOX.x + 3, OUTBOX.y + 7, 12, 7, C.gold1); k.rect(OUTBOX.x + 4, OUTBOX.y + 8, 10, 5, C.ink); k.text('OUT', OUTBOX.x + 3, OUTBOX.y + 15, C.gold3);
      k.rect(OUTBOX.x + 5, OUTBOX.y - 1, 6, 2, C.gold0);
      // Proofs drying on a line; bundled editions ready for the cart.
      for (const x of [92, 150]) { k.ellipse(x + 2, 117, 3, 1, C.shadow); k.rect(x - 1, 92, 3, 25, C.wood2); k.rect(x - 1, 92, 1, 25, C.wood4); k.rect(x - 2, 91, 5, 2, C.wood1); }
      k.line(92, 93, 121, 96, C.paper2); k.line(121, 96, 150, 93, C.paper2);
      bundle(k, 100, 128); bundle(k, 114, 130); bundle(k, 108, 124); bundle(k, 130, 127);
      Props.cart(k, 42, 106, (q, x, y) => { for (let i = 0; i < 3; i++) { q.rect(x + 2 + i * 6, y - 5, 5, 5, C.paper); q.rect(x + 2 + i * 6, y - 5, 5, 1, C.white); q.rect(x + 4 + i * 6, y - 5, 1, 5, C.wood1); } });

      // ----- The side lawns: delivered paper, a courier bicycle, bundles, trees and bushes.
      for (let i = 0; i < 2; i++) reams(k, -186 + i * 14, -20, 4 - i, 12);
      k.rect(-188, -20, 28, 2, C.wood2); Props.lamp(k, -152, 6, false);
      Props.tree(k, -114, 58, 'oak', 1, 2); Props.bush(k, -162, -78, 1); Props.bush(k, 154, -96, 2);
      Props.tree(k, 176, -2, 'pine', 1, 1);
      k.ring(152, -40, 4, 4, C.ink); k.ring(166, -40, 4, 4, C.ink); k.line(152, -40, 159, -47, C.red2); k.line(159, -47, 166, -40, C.red2); k.line(159, -47, 162, -40, C.red2); k.line(156, -48, 161, -48, C.ink); k.rect(163, -50, 6, 4, C.wood3); k.rect(164, -51, 4, 1, C.paper);
      bundle(k, 150, 4); bundle(k, 160, 10);
      for (let i = 0; i < 8; i++) Props.flower(k, 150 + P.hash(i, 5) * 30, -86 + P.hash(i, 7) * 50, ['#f2c14e', '#f6ecd0', '#e98aa0'][i % 3]);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting', idle = state === 'idle';
      // Clock hands.
      const ma = t * .6 - Math.PI / 2, ha = t * .05 + 1;
      k.line(CLOCK.x, CLOCK.y, CLOCK.x + Math.round(Math.cos(ma) * 4), CLOCK.y + Math.round(Math.sin(ma) * 4), C.ink);
      k.line(CLOCK.x, CLOCK.y, CLOCK.x + Math.round(Math.cos(ha) * 3), CLOCK.y + Math.round(Math.sin(ha) * 3), C.red1); k.px(CLOCK.x, CLOCK.y, C.gold1);
      // DEADLINE lamp: blinks red on error, glows steadily while the presses run.
      if (err && Math.floor(t * 4) % 2) { k.rect(DL.x + 29, DL.y + 3, 4, 4, C.error); k.px(DL.x + 30, DL.y + 4, C.white); if (z.detail) k.alpha(.35, () => k.circle(DL.x + 31, DL.y + 5, 6, C.error)); }
      else if (run) { k.rect(DL.x + 29, DL.y + 3, 4, 4, C.red2); k.px(DL.x + 30, DL.y + 4, C.red3); }
      // Amber approval lamp over the tray.
      if (wait) { const b = Math.floor(t * 2) % 2; k.rect(50, -65, 4, 2, b ? C.waiting : C.gold2); if (z.detail) k.alpha(.3, () => k.circle(52, -63, 6, C.waiting)); }
      // The chief's desk lamp.
      if (live) { k.rect(108, -90, 7, 1, C.gold4); if (z.detail) k.alpha(.2, () => k.poly([[107, -89], [116, -89], [118, -80], [104, -80]], C.glassLit)); }

      // Pneumatic tube: brass canisters whoosh towards the outbox; one is stuck at the elbow on error.
      if (run) for (let i = 0; i < 3; i++) canister(k, (t * 60 + i * TUBE_L / 3) % TUBE_L);
      if (err) { canister(k, TUBE.x - TUBE.x0 + 2); if (z.detail) Props.smoke(k, TUBE.x + 2, TUBE.y - 2, t * 1.4, 3, '#8a8478'); }

      // Back row of cubicles, then the copy boy in the aisle between rows, then the front row.
      for (const cb of CUBES) if (cb.r === 0) cube(k, t, state, cb, z);
      if (run) {
        const w = along([[-114, -72], [5, -72], [5, -36], [34, -36]], (t * .055) % 1);
        z.crew(w.x, w.y, { look: 0, hat: 'cap', hatColor: C.stone1, anim: 'walk', carry: w.back ? '' : 'paper', facing: w.facing, phase: .2 });
      } else if (wait) z.crew(36, -36, { look: 0, hat: 'cap', hatColor: C.stone1, anim: 'idle', facing: 1 });
      else if (idle) z.crew(-78, -24, { look: 0, hat: 'cap', hatColor: C.stone1, anim: 'idle', facing: -1 });
      else if (err) z.crew(-60, -72, { look: 0, hat: 'cap', hatColor: C.stone1, anim: 'idle', facing: -1 });
      for (const cb of CUBES) if (cb.r === 1) cube(k, t, state, cb, z);

      // Waiting: finished manuscripts stacked on the approval tray.
      if (wait) { for (let i = 0; i < 7; i++) { k.rect(TRAY.x + 2 + (i & 1), TRAY.y - 3 - i * 2, 10, 2, i % 2 ? C.paper2 : C.white); k.px(TRAY.x + 2 + (i & 1), TRAY.y - 3 - i * 2, C.stone1); }
        k.rect(TRAY.x + 15, TRAY.y - 13, 15, 9, C.ink); k.rect(TRAY.x + 16, TRAY.y - 12, 13, 7, C.waiting); k.text('OK?', TRAY.x + 17, TRAY.y - 11, C.ink); }
      else if (run) { const n = Math.floor(t * .4) % 4; for (let i = 0; i < n; i++) k.rect(TRAY.x + 2 + (i & 1), TRAY.y - 3 - i * 2, 10, 2, i % 2 ? C.paper2 : C.white); }

      // The editor-in-chief behind the glass, and the copy editors at the copy desk (green eyeshades).
      if (live) {
        z.crew(68, -70, { look: 5, anim: run ? 'work' : idle ? 'sit' : 'idle', tool: 'pen', facing: wait ? -1 : 1, phase: .5, speed: 5 });
        z.crew(62, -12, { look: 3, hat: 'cap', hatColor: VISOR, anim: run ? 'work' : idle ? 'sit' : 'idle', tool: 'pen', phase: .1 });
        z.crew(136, -12, { look: 2, hat: 'cap', hatColor: VISOR, anim: run ? 'work' : idle ? 'sit' : 'idle', tool: 'pen', facing: -1, phase: .7 });
      }
      // Coffee corner: steam from the urn; a writer on a coffee break when idle.
      if (live && !err) { steam(k, URN.x + 1, URN.y - 20, t, run ? 3 : 2); k.px(URN.x, URN.y - 8, run ? C.working : C.gold3); }
      if (idle) { z.crew(-98, 0, { look: 4, anim: 'idle', facing: -1 }); mug(k, -96, -8, C.red2); steam(k, -95, -12, t + .5, 2);
        const b = Math.floor(t * 1.5) % 3; k.px(-87, -12 - b * 2, C.water5); }

      // Proof press: the inked roller runs over the forme and the proof sheet; stuck and smoking on error.
      const rx = run ? PRESS.x + 4 + Math.round((Math.sin(t * 1.8) + 1) * .5 * (PRESS.w - 12)) : PRESS.x + (err ? 18 : 4);
      k.rect(rx, PRESS.y - 3, 5, 12, C.slate0); k.rect(rx, PRESS.y - 3, 2, 12, C.slate3); k.rect(rx + 4, PRESS.y - 3, 1, 12, C.ink); k.rect(rx - 1, PRESS.y - 5, 7, 2, C.stone1); k.rect(rx + 2, PRESS.y - 9, 1, 4, C.wood2); k.rect(rx + 1, PRESS.y - 11, 3, 2, C.wood3);
      const wa = run ? t * 2.4 : .6, wx = PRESS.x + PRESS.w + 4, wy = PRESS.y + 3;
      for (let i = 0; i < 2; i++) { const a = wa + i * Math.PI / 2; k.line(wx - Math.round(Math.cos(a) * 4), wy - Math.round(Math.sin(a) * 4), wx + Math.round(Math.cos(a) * 4), wy + Math.round(Math.sin(a) * 4), C.slate3); }
      k.px(wx, wy, C.gold2);
      if (err) { soot(k, rx + 2, PRESS.y - 8, t * 1.1 + .3, 3, '#4a4650'); if (Math.floor(t * 5) % 2) { k.px(rx - 2, PRESS.y - 2, C.gold4); k.px(rx + 7, PRESS.y + 1, C.gold3); } }
      if (live) z.crew(138, 80, { look: 1, hat: 'bandana', hatColor: INK, anim: run ? 'work' : idle ? 'sit' : 'idle', facing: -1, phase: .4 });

      // Proofs on the drying line: swaying while working, blown loose on error.
      for (let i = 0; i < 5; i++) {
        if (err && i % 2) continue; if (!run && !err && i === 3) continue;
        const sway = run ? Math.round(Math.sin(t * 3 + i)) : 0; page(k, 98 + i * 10, 94 + (i === 2 ? 2 : i % 2), sway, true, i % 2 === 0);
      }
      // Manuscripts on the bookstall lines.
      for (let i = 0; i < 4; i++) { if (err && i === 2) continue; const sway = run ? Math.round(Math.sin(t * 2.6 + i * 1.3)) : 0; page(k, -150 + i * 12 + (i > 1 ? 4 : 0), 82 + (i % 2), sway, i !== 1, false); }

      // Outside couriers: a runner carries typed pages from the newsroom door to the press and back.
      if (run) {
        const w = along([[0, 24], [0, 40], [72, 86]], (t * .06 + .3) % 1);
        z.crew(w.x, w.y, { look: 2, hat: 'cap', hatColor: C.red1, anim: 'walk', carry: w.back ? '' : 'paper', facing: w.facing, phase: .6 });
        // Canisters pop out of the outbox slot.
        const q = (t * 60 / TUBE_L * 3) % 1; if (q < .15) k.rect(OUTBOX.x + 6, OUTBOX.y - 3 - Math.round(q * 20), 4, 2, C.gold3);
      } else if (idle) { z.crew(-80, 124, { look: 3, anim: 'sit', facing: 1 }); for (let i = 0; i < 3; i++) Props.butterfly(k, -140 + Math.sin(t * .7 + i * 2) * 26, 100 + i * 8 + Math.cos(t * 1.1 + i) * 5, t + i, ['#f2c14e', '#e98aa0', '#f6ecd0'][i]); }

      // Waiting: a second pile on the scholar's desk. Error: spilled ink and pages scattered over floor and plaza.
      if (wait) { for (let i = 0; i < 6; i++) { k.rect(LEAD.x + 26 + (i % 2), LEAD.y + 12 - i * 2, 12, 2, i % 2 ? C.paper : C.paper2); k.px(LEAD.x + 26 + (i % 2), LEAD.y + 12 - i * 2, C.ink); } k.rect(LEAD.x + 31, LEAD.y + 1, 2, 13, C.waiting); }
      if (err) {
        k.ellipse(LEAD.x + 40, LEAD.y + 8, 10, 3, INK); k.ellipse(LEAD.x + 37, LEAD.y + 7, 5, 2, VIOLET); k.rect(LEAD.x + 34, LEAD.y + 1, 6, 4, INK);
        for (const [x, y, r] of [[-104, -24, 0], [-78, -22, 1], [-92, -30, 1], [-60, -26, 0], [-120, -70, 1], [-30, -20, 0], [20, 30, 1], [-8, 60, 0], [40, 88, 1], [110, 110, 0], [-30, 40, 1]]) flatPage(k, x, y, r);
        ball(k, -70, -30); ball(k, -73, -27); ball(k, -66, -28);
        for (let i = 0; i < 3; i++) { const q = (t * .5 + i / 3) % 1; flyPage(k, 100 + i * 20 + Math.sin(q * 6 + i) * 10, 96 - q * 60, Math.floor(t * 8 + i) % 2); }
      }
      if (live && !err && z.detail) for (let i = 0; i < 2; i++) Props.bird(k, -60 + ((t * 14 + i * 150) % 320) - 100, 110 + i * 10 + Math.sin(t * 2 + i) * 3 - 80 * (i % 2), t + i);
      // Plaza lamps glow while the house is lit.
      if (live) for (const x of [-24, 22]) k.rect(x - 1, 84, 4, 3, C.glassLit);

      // The ink scholar drafts at the slanted desk on the plaza; asleep on the garden bench when off.
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});
    }
  };
})();
