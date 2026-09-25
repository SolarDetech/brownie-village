/* Kandinsky · The artists' grove: atelier barn, mural wall, open-air studio pavilion, colour fountain,
   pigment works, drying racks, kiln and a sculpture garden, all around a paint-flecked plaza. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.kandinsky = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const HUES = ['#e46c52', '#f09a2a', '#f2c14e', '#7fbb5a', '#58998c', '#5f86c8', '#9d78a0', '#e98aa0'];
  const FOUNT = ['#f2c14e', '#58c4b0', '#6a9ae0', '#b07ad0', '#f090b8', '#7fd0e0'];
  const ART = ['#c4483a', '#e0b44a', '#3a6fb0', '#2a211c', '#58998c', '#e98aa0', '#f09a2a', '#7a5580', '#f6ecd0'];
  const LEAD = { x: 16, y: 60 };                 // painting at the big easel
  const EASEL = { x: 46, y: 42, w: 28, h: 22 };   // the lead's canvas (feet at x,y)
  const FX = -80, FY = 38;                         // colour fountain centre
  const VATS = [[-174, 104, '#c4483a'], [-150, 108, '#e0b44a'], [-126, 104, '#3a6fb0']];
  const KILN = { x: 156, y: -44 };
  const REST = { x: -30, y: 118 };                 // the lead's bench spot when off
  const CAN = { x: EASEL.x - (EASEL.w >> 1), y: EASEL.y - 10 - EASEL.h };

  // Strokes the lead adds to the big canvas, in order (relative to the canvas corner).
  const STROKES = [
    q => q.circle(8, 8, 6, '#3a6fb0'), q => q.circle(8, 8, 4, '#e0b44a'), q => q.circle(8, 8, 2, '#c4483a'),
    q => q.line(2, 20, 26, 3, C.ink, 1), q => q.poly([[17, 20], [23, 9], [27, 20]], '#e46c52'),
    q => q.rect(14, 3, 5, 4, '#58998c'), q => q.circle(21, 15, 2, '#7a5580'),
    q => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) q.rect(2 + i * 3, 13 + j * 3, 2, 2, (i + j) % 2 ? C.ink : '#f2c14e'); },
    q => q.line(12, 21, 16, 11, '#e98aa0', 1), q => q.ring(20, 6, 3, 2, C.ink)
  ];

  // An abstract canvas: rings, triangles, bars and ink diagonals, clipped to the frame.
  function art(k, x, y, w, h, seed, bg = C.paper) {
    const r = P.rng(seed), pick = () => ART[Math.floor(r() * ART.length)];
    k.rect(x - 1, y - 1, w + 2, h + 2, C.wood0); k.rect(x, y, w, h, bg); k.dither(x, y + (h >> 1), w, h - (h >> 1), S(bg, -.08), 1);
    k.c.save(); k.c.beginPath(); k.c.rect(x, y, w, h); k.c.clip();
    const n = 2 + Math.floor(w * h / 55);
    for (let i = 0; i < n; i++) {
      const ty = Math.floor(r() * 5), cx = x + 1 + r() * (w - 2), cy = y + 1 + r() * (h - 2), s = 1.5 + r() * Math.min(w, h) * .32, c = pick();
      if (ty === 0) { k.circle(cx, cy, s, c); k.circle(cx, cy, s * .6, pick()); if (s > 3.5) k.circle(cx, cy, s * .25, pick()); }
      else if (ty === 1) k.poly([[cx, cy - s], [cx + s, cy + s * .8], [cx - s, cy + s * .8]], c);
      else if (ty === 2) k.line(cx - s * 1.5, cy + s, cx + s * 1.5, cy - s, C.ink);
      else if (ty === 3) k.rect(cx - s / 2, cy - s / 3, s, Math.max(1, s * .6), c);
      else k.ring(cx, cy, s, s * .8, c);
    }
    k.c.restore();
    k.rect(x, y, w, 1, S(bg, .3));
  }
  // An A-frame easel with its canvas; x is the centre, y the feet.
  function easel(k, x, y, w, h, seed, bg) {
    const top = y - 10 - h;
    k.ellipse(x + 3, y + 1, w * .5 + 2, 2, C.shadow);
    k.line(x + 1, top - 2, x + 3, y - 1, C.wood1);
    k.line(x - (w >> 1) + 2, y, x - 1, top - 3, C.wood2, 2); k.line(x + (w >> 1) - 2, y, x + 1, top - 3, C.wood1, 2);
    k.line(x - (w >> 1) + 2, y, x - 1, top - 3, C.wood3);
    if (seed === null) { k.rect(x - (w >> 1) - 1, top - 1, w + 2, h + 2, C.wood0); k.rect(x - (w >> 1), top, w, h, C.paper); k.dither(x - (w >> 1), top, w, h, C.paper2, 1); k.line(x - (w >> 1) + 3, top + h - 4, x + (w >> 1) - 4, top + 4, C.stone3); }
    else art(k, x - (w >> 1), top, w, h, seed, bg);
    k.rect(x - (w >> 1) - 2, y - 10, w + 4, 2, C.wood3); k.rect(x - (w >> 1) - 2, y - 10, w + 4, 1, C.wood4); k.rect(x - (w >> 1) - 2, y - 8, w + 4, 1, C.wood0);
    k.rect(x - 2, top - 4, 4, 3, C.wood2); k.px(x - 2, top - 4, C.wood4);
    for (let i = 0; i < 3; i++) k.rect(x - (w >> 1) + 1 + i * 3, y - 12, 2, 2, ART[(seed ?? 3) + i & 7]);
  }
  const stool = (k, x, y, c = C.wood3) => { k.ellipse(x + 1, y + 1, 4, 1, C.shadowSoft); k.rect(x - 3, y - 6, 7, 2, c); k.rect(x - 3, y - 6, 7, 1, S(c, .25)); k.rect(x - 2, y - 4, 1, 4, C.wood1); k.rect(x + 2, y - 4, 1, 4, C.wood1); };
  const paintPot = (k, x, y, c) => { k.rect(x, y - 4, 5, 4, C.stone2); k.rect(x, y - 4, 1, 4, C.stone4); k.rect(x + 4, y - 4, 1, 4, C.stone1); k.rect(x, y - 5, 5, 1, c); k.px(x + 1, y - 5, S(c, .35)); k.rect(x + 1, y - 3, 3, 1, c); };
  const splat = (k, x, y, c, s = 2) => { k.ellipse(x, y, s + 1, s * .5 + .5, S(c, -.15)); k.ellipse(x - 1, y, s, s * .4, c); k.px(x + s + 2, y - 1, c); k.px(x - s - 2, y + 1, c); };
  // Cached sprite: a canvas knocked flat on the ground (error state).
  const fallenCanvas = () => P.sprite('kand|fallen', 22, 10, 11, 9, q => { q.poly([[-10, -2], [8, -8], [11, -3], [-7, 2]], C.paper); q.line(-10, -2, 8, -8, C.wood1); q.line(-6, -1, 6, -6, '#c4483a'); q.circle(2, -3, 2, '#3a6fb0'); q.px(-3, -1, '#e0b44a'); });

  /* ---------- Roman marble sculpture court ----------
     Each statue is carved procedurally: body parts are analytic solids (tapered capsules, ellipsoids, draped
     polygons) with a surface normal, lit from the top left and quantised to a 7-tone marble ramp (warm white
     highlights to cool blue-grey shadows). Parts crease where they overlap and cast a 1px contact shadow down
     and right. Drapery adds sinusoidal folds to the normal; hair and beards add curls; unfinished stone is
     rough. Faint grey veins run through the stone. Rendered once into cached sprites. */
  const MB = ['#fffbf2', '#f2ecdf', '#ded9d0', '#c2c3c7', '#a2a9b5', '#7f889a', '#5d6678'];
  const MOUT = '#3f4556';
  const LX = -.5, LY = -.6, LZ = .62;
  let GID = 0;
  const cap = (ax, ay, bx, by, ra, rb, o = {}) => { const r = Math.max(ra, rb); return { ...o, g: o.g ?? ++GID, bb: [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.max(ax, bx) + r, Math.max(ay, by) + r], f: (X, Y) => {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-6, u = Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / L2)), rr = ra + (rb - ra) * u;
    const ex = X - ax - dx * u, ey = Y - ay - dy * u, d = Math.hypot(ex, ey); return d <= rr ? [ex / rr, ey / rr, d / rr] : null; } }; };
  const ell = (cx, cy, rx, ry, o = {}) => ({ ...o, g: o.g ?? ++GID, bb: [cx - rx, cy - ry, cx + rx, cy + ry], f: (X, Y) => { const nx = (X - cx) / rx, ny = (Y - cy) / ry, d = Math.hypot(nx, ny); return d <= 1 ? [nx, ny, d] : null; } });
  const tor = (cx, cy, rx, ry, o = {}) => ({ ...o, g: o.g ?? ++GID, bb: [cx - rx, cy - ry, cx + rx, cy + ry], f: (X, Y) => {
    const nx = (X - cx) / rx, ny = (Y - cy) / ry, d = Math.hypot(nx, ny); if (d > 1 || d < .38) return null; const m = (d - .69) / .31, a = Math.atan2(ny, nx); return [Math.cos(a) * m, Math.sin(a) * m, Math.abs(m)]; } });
  const pol = (pts, o = {}) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return { ...o, g: o.g ?? ++GID, bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], f: (X, Y) => {
    const hit = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= Y) !== (b[1] <= Y)) hit.push(a[0] + (Y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    hit.sort((a, b) => a - b); for (let j = 0; j + 1 < hit.length; j += 2) if (X >= hit[j] && X <= hit[j + 1]) { const m = (hit[j] + hit[j + 1]) / 2, h = Math.max(.5, (hit[j + 1] - hit[j]) / 2), u = (X - m) / h; return [u * (o.curve ?? .9) + (o.nx || 0), o.ny ?? 0, Math.abs(u)]; }
    return null; } }; };
  // Rasterise parts into the sprite; marks are hand-placed [x, y, tone|colour] details (eyes, nostrils, drill holes).
  function carve(q, parts, marks = [], seed = 0) {
    const buf = new Map(), K = (x, y) => (y + 512) * 1024 + x + 512;
    parts.forEach((p, pi) => {
      const [x0, y0, x1, y1] = p.bb;
      for (let y = Math.floor(y0) - 1; y <= Math.ceil(y1); y++) for (let x = Math.floor(x0) - 1; x <= Math.ceil(x1); x++) {
        const X = x + .5, Y = y + .5; if (p.clip && !p.clip(X, Y)) continue;
        const r = p.f(X, Y); if (!r) continue;
        let [nx, ny, e] = r;
        if (p.fold) { const F = p.fold; nx += F.a * Math.sin((X - F.s * Y) * F.f + (F.p || 0)); }
        if (p.curl) { nx += p.curl * Math.sin(X * 2.3 + Y * 1.4); ny += p.curl * Math.cos(Y * 2.5 - X * 1.2); }
        if (p.rough) { nx += (P.hash(x, y + 50) - .5) * p.rough; ny += (P.hash(x + 9, y) - .5) * p.rough; }
        let l2 = nx * nx + ny * ny; if (l2 > .97) { const s = Math.sqrt(.97 / l2); nx *= s; ny *= s; l2 = .97; }
        const s = nx * LX + ny * LY + Math.sqrt(1 - l2) * LZ;
        let t = (1.05 - s) * 4.2 + (p.ao || 0);
        const prev = buf.get(K(x, y)); if (prev && parts[prev.pi].g !== p.g && e > .74 && !p.soft) t += 1;
        buf.set(K(x, y), { t, pi, x, y });
      }
    });
    for (const v of buf.values()) for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0]]) { const n = buf.get(K(v.x + dx, v.y + dy)); if (n && n.pi > v.pi && parts[n.pi].g !== parts[v.pi].g && !parts[n.pi].soft) { v.t += 1.1; break; } }
    for (const v of buf.values()) {
      const i = Math.max(0, Math.min(v.t > 6.2 ? 6 : 5, Math.round(v.t))); let col = MB[i];
      const w = Math.sin(v.x * .37 + v.y * .81 + Math.sin(v.y * .19 + v.x * .13 + seed) * 2.6 + seed);
      if (Math.abs(w) < .04 && i > 0 && i < 5 && !parts[v.pi].rough) col = P.mix(col, '#8993a8', .3);
      q.rect(v.x, v.y, 1, 1, col);
    }
    for (const [x, y, c] of marks) if (buf.has(K(x, y))) q.px(x, y, typeof c === 'number' ? MB[c] : c);
    // Selective outline: soft blue-grey where light meets the edge (top/left), deep slate in the shadow (bottom/right).
    const seen = new Set();
    for (const v of buf.values()) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const x = v.x + dx, y = v.y + dy, k = K(x, y); if (buf.has(k) || seen.has(k)) continue; seen.add(k);
      const lit = (buf.has(K(x + 1, y)) || buf.has(K(x, y + 1))) && !buf.has(K(x - 1, y)) && !buf.has(K(x, y - 1));
      q.px(x, y, lit ? '#6e778b' : MOUT);
    }
  }

  // Emperor in a muscle cuirass, right arm raised in address (after the Augustus of Prima Porta). Feet at 0,0.
  const emperor = () => P.sprite('kand|emperor', 30, 50, 14, 48, q => carve(q, [
    cap(2, -17, 2.7, -9.5, 2, 1.45, { g: 'll', ao: .35 }), cap(2.7, -9.5, 3.8, -1.6, 1.45, .85, { g: 'll', ao: .35 }), ell(4.6, -.8, 1.7, .9, { g: 'll', ao: .35 }),
    cap(-1.8, -17, -2, -9.5, 2.1, 1.5, { g: 'rl' }), cap(-2, -9.5, -2.2, -1.6, 1.55, .9, { g: 'rl' }), ell(-2.7, -.8, 1.9, .9, { g: 'rl' }),
    pol([[-5, -19.5], [5, -19.5], [5.6, -14.5], [-5.4, -15]], { fold: { a: .55, f: 1.7, s: 0 } }),   // tunic hem
    pol([[-5.4, -22.5], [5.4, -22.5], [6.2, -17.5], [-6, -17.5]], { fold: { a: .9, f: 3.1416, s: 0, p: 1 }, ny: -.1 }), // pteruges
    pol([[-5.4, -32.5], [5.4, -32.5], [4.8, -28], [3.8, -22], [-3.8, -22], [-4.6, -28]], { curve: 1 }), // cuirass
    ell(-2.1, -29.3, 2.5, 1.8, { g: 'chest', soft: true, ao: -.3 }), ell(2.1, -29.3, 2.5, 1.8, { g: 'chest', soft: true }),
    pol([[-4.6, -23.8], [3, -24.2], [6.8, -22.5], [7.2, -18.2], [3, -19.8], [-4.2, -21]], { fold: { a: .75, f: 1.3, s: .8 } }), // cloak wrapped at the hips
    cap(0, -35, 0, -32.5, 1.35, 1.6),                                                                  // neck
    ell(-.2, -37.8, 2.6, 3.1, { g: 'head' }), ell(.3, -38.9, 2.8, 2.4, { g: 'head', curl: .38, clip: (X, Y) => Y < -38.6 || X > 1.3 }),
    cap(5, -31, 6.2, -25.5, 1.6, 1.3, { g: 'la' }), cap(6.2, -25.5, 8.2, -22.8, 1.2, 1, { g: 'la' }), ell(8.4, -22.4, 1.1, 1.1, { g: 'la' }),
    pol([[4.8, -24], [9, -23.2], [10, -12], [8, -10.4], [5.6, -14]], { fold: { a: .65, f: 1.5, s: -.15 } }), // cloak over the forearm
    ell(-5.2, -31, 1.9, 1.8, { g: 'ra' }), cap(-5.3, -31, -8.6, -35.2, 1.5, 1.25, { g: 'ra' }), cap(-8.6, -35.2, -10, -40.5, 1.2, .95, { g: 'ra' }), cap(-10, -40.5, -10.4, -43, .95, .7, { g: 'ra' })
  ], [[-2, -38, 4], [0, -38, 4], [-2, -37, 1], [-1, -36, 3], [-1, -35, 4], [-2, -39, 1], [-3, -40, 2], [-3, -28, 3], [-2, -28, 4], [1, -28, 3], [2, -28, 4], [0, -27, 3], [0, -25, 3], [0, -24, 3],
    [-3, -22, 4], [-2, -22, 5], [-1, -22, 5], [0, -22, 5], [1, -22, 5], [2, -22, 5], [3, -22, 4], [-2, -21, 1], [0, -21, 1], [2, -21, 1]], 1.3), null);

  // Draped goddess in contrapposto: torch raised, a garland hanging from the lowered hand.
  const goddess = () => P.sprite('kand|goddess', 24, 52, 11, 50, q => carve(q, [
    ell(1.9, -37.4, 1.6, 1.5, { g: 'hair', curl: .4 }),                                                   // chignon
    pol([[-4, -24], [4, -24], [5.4, -12], [6.8, 0], [-5.8, 0], [-5, -11]], { g: 'skirt', fold: { a: .8, f: 1.35, s: .06 } }),
    ell(2.4, -11.5, 2.5, 3.4, { g: 'skirt', soft: true, fold: { a: .5, f: 1.3, s: .5 }, ao: -.2 }),       // relaxed knee under the cloth
    pol([[-5.2, -22.5], [4.4, -24.2], [6.2, -19], [5.8, -14.5], [-5.6, -16.8]], { fold: { a: .8, f: 1.25, s: .9 } }), // mantle round the hips
    pol([[-4, -31.8], [4, -31.8], [3.6, -27], [3.4, -23], [-3.4, -23], [-3.6, -27]], { g: 'body', fold: { a: .4, f: 2.1, s: -.35 } }),
    ell(-1.6, -28.3, 1.6, 1.4, { g: 'body', fold: { a: .3, f: 2.1, s: -.35 }, soft: true }), ell(1.7, -28.3, 1.6, 1.4, { g: 'body', fold: { a: .3, f: 2.1, s: -.35 }, soft: true }),
    cap(0, -34, 0, -32, 1.15, 1.35),
    ell(-.1, -36.8, 2.4, 2.9, { g: 'head' }), ell(.3, -37.8, 2.6, 2.2, { g: 'head', fold: { a: .55, f: 2.6, s: .7 }, clip: (X, Y) => Y < -37.5 || X > 1.2 }),
    cap(4, -31, 5, -25, 1.35, 1.1, { g: 'la' }), cap(5, -25, 6.4, -20.2, 1.05, .9, { g: 'la' }), ell(6.6, -19.8, 1, 1, { g: 'la' }),
    tor(4.4, -19.4, 3.6, 4.4, { curl: .45, clip: (X, Y) => Y > -19 && X > 1.8 }),                                     // laurel garland swag
    cap(-4, -31, -6.4, -35, 1.35, 1.15, { g: 'ra' }), cap(-6.4, -35, -7, -39, 1.1, .95, { g: 'ra' }),
    cap(-7, -37.5, -7.3, -43, .7, .95),                                                                     // torch shaft
    ell(-7.1, -39.4, 1.25, 1.1, { g: 'fist' }),
    ell(-7.3, -43.6, 1.8, .9), pol([[-7.4, -49.5], [-5.4, -46.3], [-5.6, -44.4], [-9, -44.4], [-9.2, -46.4]], { fold: { a: .6, f: 2.2, s: .35 } })
  ], [[-1, -37, 4], [-3, -37, 4], [-2, -36, 1], [-2, -35, 3], [-2, -34, 4]], 4.1), null);

  // Discus-thrower at the top of the backswing (after Myron). Facing right, weight on the forward leg.
  const discobolus = () => P.sprite('kand|disco', 28, 42, 14, 40, q => carve(q, [
    cap(1.5, -26, -3.6, -30.5, 1.5, 1.2, { g: 'ra', ao: .55 }), cap(-3.6, -30.5, -8, -34, 1.2, .9, { g: 'ra', ao: .55 }), ell(-8.4, -34.4, 1, 1, { g: 'ra', ao: .5 }),
    ell(-9.6, -35.2, 1.6, 3.2),                                                                                // discus
    cap(0, -15, -4.2, -8, 2.2, 1.6, { g: 'll', ao: .5 }), cap(-4.2, -8, -8.6, -2.6, 1.6, 1, { g: 'll', ao: .5 }), cap(-8.6, -2.6, -10.8, -.7, .9, .7, { g: 'll', ao: .5 }),
    cap(0, -15, 4.6, -9.6, 2.3, 1.6, { g: 'rl' }), cap(4.6, -9.6, 3.6, -1.6, 1.6, 1, { g: 'rl' }), ell(4.8, -.8, 2, .9, { g: 'rl' }),
    ell(-.4, -15.6, 2.8, 2.5, { g: 'hip' }),
    cap(.3, -16.5, 2.4, -21, 2.7, 2.6, { g: 'torso' }), ell(3.6, -23.2, 3.4, 2.9, { g: 'torso', soft: true }), ell(4.6, -23.6, 2, 1.4, { g: 'torso', soft: true, ao: -.3 }), ell(1.8, -19.2, 1.5, 1.9, { g: 'torso', soft: true, ao: -.2 }),
    cap(4.6, -26.8, 5.9, -28, 1.2, 1.2),
    ell(6.4, -29.4, 2.3, 2.7, { g: 'head' }), ell(6.9, -30.4, 2.4, 2.1, { g: 'head', curl: .4, clip: (X, Y) => Y < -30.3 || X > 7.4 }),
    cap(5.3, -25.5, 7.4, -20, 1.4, 1.1, { g: 'la' }), cap(7.4, -20, 5.9, -13.5, 1.1, .85, { g: 'la' }), ell(5.6, -12.8, 1, 1, { g: 'la' })
  ], [[5, -30, 4], [5, -29, 3], [4, -29, 1], [6, -27, 4], [3, -21, 3], [2, -17, 4], [3, -24, 3]], 2.2), null);

  // Bust of a bearded senator in a toga; sits on a column (base at 0,0).
  const bust = () => P.sprite('kand|bust', 20, 26, 10, 24, q => carve(q, [
    ell(0, -1.4, 3.6, 1.5), cap(0, -2.5, 0, -5, 1.4, 1.1),
    pol([[-8, -6.4], [-7.2, -9.8], [-3.6, -12], [3.6, -12], [7.2, -9.8], [8, -6.4], [5, -4.4], [-5, -4.4]], { fold: { a: .55, f: 1.25, s: -.9 } }),
    pol([[-6.4, -10.8], [-3.2, -12.2], [5.6, -5], [2.2, -4.6]], { fold: { a: .6, f: 1.7, s: -1 }, ao: -.2 }),  // toga sinus
    cap(0, -13, 0, -11.6, 1.8, 2),
    ell(0, -17.2, 3.3, 4.1, { g: 'head' }),
    ell(.3, -19.4, 3.5, 2.6, { g: 'head', curl: .5, clip: (X, Y) => Y < -18.9 || X > 2.2 }),
    ell(0, -14.1, 3.1, 2.7, { g: 'beard', curl: .55, clip: (X, Y) => Y > -15.4 })
  ], [[-2, -18, 5], [1, -18, 5], [-2, -19, 1], [1, -19, 1], [-1, -17, 1], [0, -17, 2], [0, -16, 3], [-1, -15, 4], [0, -15, 5], [1, -15, 4], [-3, -17, 3]], 5.3), null);

  // A statue still being freed from its block (feet of the block at 0,0); broken = shoulder and head fallen off.
  const unfinished = broken => P.sprite('kand|unfin' + (broken ? 'X' : ''), 22, 42, 11, 40, q => carve(q, [
    pol([[-8.6, -20.5], [6, -21], [6.4, 0], [-8.8, 0]], { curve: .25, rough: .7, g: 'blk' }),
    pol([[6, -21], [9.6, -23.6], [10, -2.6], [6.4, 0]], { curve: .15, nx: .72, rough: .6, g: 'blk' }),
    pol([[-8.6, -20.5], [-5.2, -23.4], [9.6, -23.6], [6, -21]], { curve: .15, ny: -.7, rough: .8, g: 'blk' }),
    pol([[-5, -32], [5, -32], [4.2, -24], [-4.2, -24]], { g: 'torso', curve: 1, clip: broken ? (X, Y) => !(X < 1 && Y < 1.3 * X - 26.5) : null }),
    ell(-2, -29, 2.2, 1.5, { g: 'torso', soft: true, ao: -.2, clip: broken ? (X, Y) => X > -.5 : null }), ell(2.1, -29, 2.2, 1.5, { g: 'torso', soft: true }),
    cap(5, -31, 6, -24.5, 1.5, 1.35, { g: 'la' }), cap(6, -24.5, 6.5, -21.5, 1.35, 1.3, { g: 'la', rough: .9 }),
    ...(broken ? [] : [ell(-5.1, -31, 1.9, 1.7, { g: 'ra' }), cap(-5.2, -31, -6.2, -25, 1.5, 1.3, { g: 'ra', rough: .5 }),
      cap(0, -34.5, 0, -32, 1.3, 1.6), ell(0, -37.2, 2.6, 3, { g: 'head', rough: .5 })])
  ], broken ? [[-4, -27, 6], [-3, -26, 6], [-2, -26, 5], [-1, -25, 6], [0, -24, 6], [1, -23, 6], [1, -22, 5], [2, -21, 6], [2, -20, 6], [3, -19, 6], [2, -18, 5], [3, -17, 6], [4, -16, 6], [4, -15, 6], [5, -14, 5], [4, -13, 6]]
    : [[-6, -17, '#34384a'], [3, -14, '#34384a'], [-2, -9, '#34384a'], [6, -6, '#34384a'], [-1, -37, 4], [1, -37, 4], [0, -36, 2]], .7), null);
  // The fallen head-and-shoulder chunk (error state).
  const chunk = () => P.sprite('kand|chunk', 12, 8, 6, 7, q => carve(q, [ell(-1, -2.4, 4.6, 2.4, { rough: .7 }), ell(2.6, -3.3, 2.5, 2.3, { g: 'h', rough: .4 })], [[3, -4, 4], [1, -2, 6], [-3, -1, 5]], .2), null);

  // A pigeon (feet at x, y): pose 0 sits, 1 pecks, 2-3 flaps its wings.
  function pigeon(k, x, y, d, pose) {
    k.rect(x - 2, y - 2, 4, 2, '#3f4556'); k.rect(x - 1, y - 3, 3, 1, '#3f4556'); k.rect(x - 1, y - 2, 3, 1, '#8d95a3'); k.px(x, y - 3, '#b4bac6'); k.px(x - 2 * d, y - 2, '#5f6878');
    const hy = pose === 1 ? y - 2 : y - 4, hx = x + (d > 0 ? 2 : -3); k.rect(hx, hy, 2, 2, '#3f4556'); k.px(hx + (d < 0), hy + 1, '#6f9a8a'); k.px(hx + (d > 0), hy, '#7a8292'); k.px(hx + (d > 0 ? 2 : -1), hy + 1, '#d8c8a0');
    if (pose >= 2) { k.px(x - 1, y - 4 - (pose - 2), '#c4cad4'); k.px(x, y - 5 - (pose - 2), '#c4cad4'); }
  }
  // Tall plinth: lit top face, cornice, die with a carved inscription or laurel relief, and a base moulding.
  function plinth(k, x, y, w, h, txt, wreath) {
    const L = x - (w >> 1), T = y - h;
    k.ellipse(x + 5, y + 1, (w >> 1) + 5, 3, C.shadow); k.poly([[L + w + 2, T + 3], [L + w + 7, T + 7], [L + w + 7, y + 1], [L + w + 2, y]], C.shadowSoft);
    k.rect(L, T + 4, w, h - 7, MB[2]); k.dither(L, T + 4, w, h - 7, MB[3], 1); k.rect(L, T + 4, 1, h - 7, MB[1]); k.rect(L + w - 3, T + 4, 3, h - 7, MB[4]); k.rect(L + w - 1, T + 4, 1, h - 7, MB[5]);
    k.rect(L, T + 4, w, 1, MB[5]);
    for (let i = 0; i < 3; i++) { const vx = L + 2 + Math.floor(P.hash(x, i) * (w - 5)); k.line(vx, T + 5 + i * 2, vx + 3, T + h - 4, P.mix(MB[3], '#8993a8', .3)); }
    k.rect(L - 2, y - 4, w + 4, 4, MB[3]); k.rect(L - 2, y - 4, w + 4, 1, MB[1]); k.rect(L - 1, y - 3, w + 2, 1, MB[2]); k.rect(L - 2, y - 1, w + 4, 1, MB[5]); k.rect(L + w, y - 4, 2, 4, MB[4]);
    k.dither(L - 2, y - 3, w + 4, 2, '#8a9a70', 1);
    k.rect(L - 2, T, w + 4, 4, MB[2]); k.rect(L - 2, T + 2, w + 4, 1, MB[3]); k.rect(L - 2, T + 3, w + 4, 1, MB[4]); k.rect(L + w, T, 2, 4, MB[4]);
    k.rect(L - 1, T - 3, w + 2, 3, MB[1]); k.rect(L - 1, T - 3, w + 2, 1, MB[0]); k.rect(L - 1, T - 3, 1, 3, MB[0]); k.rect(L + w, T - 3, 1, 3, MB[3]);
    const my = T + 4 + ((h - 7) >> 1);
    if (txt) { const tx = x - (P.textWidth(txt) >> 1) - 1, ty = my - 2; k.text(txt, tx, ty + 1, MB[1]); k.text(txt, tx, ty, MB[6]); }
    if (wreath) { for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) { const a = (.12 + i * .1) * Math.PI, lx = x - 1 + sd * Math.round(Math.sin(a) * 4), ly = my - 1 - Math.round(Math.cos(a) * 3); k.px(lx, ly, MB[5]); if (i % 2) k.px(lx - sd, ly - 1, MB[0]); }
      k.px(x - 2, my + 3, MB[5]); k.px(x, my + 3, MB[5]); k.px(x - 3, my + 4, MB[5]); k.px(x + 1, my + 4, MB[5]); k.px(x - 1, my + 2, MB[4]); }
    k.ellipse(x + 3, T - 1, Math.min(6, (w >> 1) - 2), 1, '#8f98ab66');
    return T - 1;
  }
  // Mediterranean cypress: a tall dark flame of foliage.
  function cypress(k, x, y, h, hw = 5) {
    k.ellipse(x + 5, y + 1, hw + 3, 2, C.shadow); k.rect(x - 1, y - 4, 3, 4, C.wood1); k.px(x - 1, y - 4, C.wood3);
    const T = ['#9cc06a', '#6f9a4e', '#4c7a3e', '#355f35', '#244a2e', '#193a27'];
    k.rectTex(x - hw - 1, y - h, hw * 2 + 3, h - 3, (X, Y) => {
      const u = (Y - (y - h)) / (h - 3), w = hw * Math.pow(Math.sin(Math.PI * Math.min(1, .06 + u * .82)), .75) * (1 + .12 * Math.sin(Y * .9)), r = (X - x) / Math.max(1, w);
      if (Math.abs(r) > 1) return null;
      const n = P.hash(X * 3, Y) - .5, cl = Math.sin(Y * 1.3 + X * .6);
      return T[Math.max(0, Math.min(5, Math.round(1.6 + r * 1.9 + n * 1.3 - cl * .5 + u * .4)))];
    });
  }
  // Olive tree: a twisted grey trunk under loose silver-green clumps.
  function olive(k, x, y) {
    k.ellipse(x + 6, y + 1, 16, 4, C.shadow);
    k.poly([[x - 3, y], [x + 3, y], [x + 2, y - 8], [x + 5, y - 14], [x + 2, y - 15], [x - 1, y - 9], [x - 4, y - 13], [x - 6, y - 12], [x - 2, y - 6]], '#6f6456');
    k.line(x - 2, y - 1, x - 1, y - 8, '#9a8e7a'); k.line(x + 2, y - 3, x + 3, y - 12, '#4e463c'); k.px(x, y - 5, '#4e463c'); k.px(x - 3, y - 11, '#9a8e7a');
    const O = ['#d2d8b0', '#aab98c', '#86986c', '#667a52', '#4a5c3e'];
    [[-9, -19, 8, 5], [5, -21, 9, 5], [-2, -27, 9, 5], [10, -15, 5, 3], [-13, -14, 4, 3]].forEach(([dx, dy, rx, ry], i) => {
      k.ellipse(x + dx + 1, y + dy + 1, rx, ry, O[4]); k.ellipse(x + dx, y + dy, rx, ry, O[3]); k.ditherEllipse(x + dx - 1, y + dy - 1, rx - 1, ry - 1, O[2], 0);
      k.ellipse(x + dx - 2, y + dy - 2, rx - 4, ry - 2, O[1]);
      for (let j = 0; j < 7; j++) k.px(x + dx - rx + 2 + Math.floor(P.hash(i, j) * rx * 2 - 2), y + dy - ry + 1 + Math.floor(P.hash(j, i + 5) * ry * 1.4), j % 3 ? O[0] : '#3d4a33');
    });
  }
  // Scaffold around the unfinished statue (block feet at x, y). Back half is static; front half is drawn over the block.
  const HC = { x: 138, y: 130 }, EMP = { x: 178, y: 81 }, PLANK = HC.y - 16;
  function scaffold(k, front) {
    const pole = (px, y0, y1) => { k.rect(px, y1, 2, y0 - y1, C.wood2); k.rect(px, y1, 1, y0 - y1, C.wood4); k.rect(px + 1, y1, 1, y0 - y1, C.wood1); };
    if (!front) {
      for (const px of [HC.x - 12, HC.x + 20]) pole(px, HC.y - 5, HC.y - 44);
      k.rect(HC.x - 12, HC.y - 40, 34, 2, C.wood2); k.rect(HC.x - 12, HC.y - 40, 34, 1, C.wood3);
      k.line(HC.x - 11, HC.y - 8, HC.x + 21, HC.y - 38, C.wood1);
      return;
    }
    // Front poles, the sculptor's plank on the right, a lashing at each joint.
    pole(HC.x - 14, HC.y + 4, HC.y - 40); pole(HC.x + 26, HC.y + 4, HC.y - 40);
    k.rect(HC.x + 7, PLANK, 22, 3, C.wood3); k.rect(HC.x + 7, PLANK, 22, 1, C.wood5); k.rect(HC.x + 7, PLANK + 3, 22, 1, C.wood0);
    for (let i = 0; i < 4; i++) k.px(HC.x + 10 + i * 5, PLANK + 1, C.wood2);
    k.rect(HC.x - 15, HC.y - 36, 43, 2, C.wood2); k.rect(HC.x - 15, HC.y - 36, 43, 1, C.wood4);
    for (const [lx, ly] of [[HC.x - 14, HC.y - 36], [HC.x + 26, HC.y - 36], [HC.x + 26, PLANK]]) { k.rect(lx - 1, ly - 1, 4, 3, '#c9b07a'); k.px(lx, ly, '#8a7448'); }
    k.line(HC.x + 27, PLANK + 4, HC.x + 27, HC.y + 3, C.wood1); k.line(HC.x + 9, PLANK + 4, HC.x + 24, HC.y + 2, C.wood1);
  }

  return {
    paint(k) {
      /* ---- Ground: flagstone plaza, mosaic entrance path, grove grass ---- */
      const plaza = [[-150, -36], [148, -36], [160, 0], [150, 56], [96, 92], [30, 100], [-30, 100], [-98, 88], [-160, 60], [-168, 6]];
      k.poly(plaza.map(([x, y]) => [x + (x > 0 ? 3 : -3), y + (y > 0 ? 3 : -2)]), C.stone2);
      k.polyTex(plaza, (x, y) => {
        const row = Math.floor((y + 300) / 6), off = (row * 5) % 11, col = Math.floor((x + 300 + off) / 11);
        if ((y + 300) % 6 === 0 || (x + 300 + off) % 11 === 0) return C.stone2;
        const h = P.hash(col, row);
        if ((x + 300 + off) % 11 === 1 || (y + 300) % 6 === 1) return h < .5 ? C.stone4 : C.stone3;
        return h < .22 ? C.stone4 : h > .85 ? S(C.stone3, -.06) : C.stone3;
      });
      // Mosaic path from the entrance: a rainbow herringbone of glazed tiles.
      k.polyTex([[-15, 90], [15, 90], [18, 141], [-18, 141]], (x, y) => {
        if (x === -15 || x === 14 || (y - 90) % 5 === 0) return C.stone2;
        const band = Math.floor((x + 15) / 5 + Math.floor((y - 90) / 5)) % 8;
        return (x + y) % 5 === 0 ? S(HUES[band], .3) : S(HUES[band], -.1);
      });
      k.rect(-19, 88, 38, 2, C.stone4);
      // A paint-drip compass inlay at the plaza heart.
      k.ellipse(0, 76, 18, 7, C.stone2); k.ellipse(0, 76, 16, 6, C.stone4);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.line(Math.round(Math.cos(a) * 5), 76 + Math.round(Math.sin(a) * 2), Math.round(Math.cos(a) * 14), 76 + Math.round(Math.sin(a) * 5), HUES[i], 1); }
      k.circle(0, 76, 3, C.gold2); k.px(0, 75, C.gold4);
      // Paint splashes across the flagstones.
      for (let i = 0; i < 26; i++) { const x = -140 + P.hash(i, 21) * 280, y = -28 + P.hash(i, 33) * 110; if (Math.abs(x - FX) < 40 && Math.abs(y - FY) < 18) continue; splat(k, x, y, HUES[i % 8], 1 + (i % 3 === 0)); }
      // Grass tufts and wildflowers in the grove margins.
      for (let i = 0; i < 70; i++) { const x = -188 + P.hash(i, 2) * 376, y = -148 + P.hash(i, 7) * 288; if (y > -40 && y < 104 && x > -166 && x < 158) continue; Props.tuft(k, x, y, C.grass1, C.grass4); }
      for (let i = 0; i < 26; i++) Props.flower(k, -186 + P.hash(i, 51) * 372, -146 + P.hash(i, 57) * 14, HUES[i % 8]);

      /* ---- Atelier barn (top left) ---- */
      Props.tree(k, -176, -118, 'dark', 1, 0);
      const barn = Props.building(k, -184, -40, { w: 108, h: 48, roofH: 30, roof: C.plum2, wall: C.plaster2, mat: 'timber', foundation: 4,
        windows: [{ x: 8, y: 10, w: 11, h: 16, arch: true }, { x: 26, y: 10, w: 11, h: 16, arch: true }, { x: 88, y: 10, w: 11, h: 16, arch: true }],
        door: { x: 48, w: 18, h: 22, color: C.plum1, open: true }, chimney: { x: 16, h: 10 } });
      // North skylights on the roof slope.
      for (let i = 0; i < 4; i++) { const x = -136 + i * 15; k.rect(x - 1, barn.roofTop + 4, 13, 18, C.wood0); k.rect(x, barn.roofTop + 5, 11, 16, C.glass); k.rect(x, barn.roofTop + 5, 11, 2, C.white); k.rect(x + 5, barn.roofTop + 5, 1, 16, C.wood1); k.rect(x, barn.roofTop + 13, 11, 1, C.wood1); k.rect(x + 6, barn.roofTop + 14, 5, 7, S(C.glass, -.15)); }
      // Glimpse inside the open door: a canvas on the wall and a warm floor.
      k.rect(-133, -58, 14, 16, '#3a2c28'); art(k, -131, -56, 10, 8, 4, '#f3e6c1'); k.rect(-135, -44, 16, 3, C.wood2);
      Props.hangingSign(k, -114, -80, 'ART', C.plum1);
      // Paint drips on the barn front and a rainbow bunting under the eaves.
      for (let i = 0; i < 27; i++) { const x = -182 + i * 4, y = -86 + (i % 2); k.rect(x, y, 3, 2, HUES[i % 8]); k.px(x + 1, y + 2, S(HUES[i % 8], -.2)); }
      // Canvases leaning against the barn wall, flower pots by the door.
      for (let i = 0; i < 3; i++) art(k, -180 + i * 9, -50 - (i % 2) * 2, 8, 11 + (i % 2) * 2, 20 + i, i === 1 ? '#dfe8ef' : C.paper);
      for (const x of [-148, -110, -96]) Props.pot(k, x, -36);

      /* ---- Mural wall (top centre) ---- */
      Props.tree(k, -34, -96, 'blossom', 1, 1);
      const mw = { x: -64, y: -46, w: 60, h: 40 };
      k.rect(mw.x + 3, mw.y, mw.w, 3, C.shadow);
      k.rect(mw.x, mw.y - mw.h, mw.w, mw.h, C.plaster2); k.rect(mw.x, mw.y - mw.h - 3, mw.w, 3, C.terra2); k.rect(mw.x, mw.y - mw.h - 3, mw.w, 1, C.terra4); k.rect(mw.x - 1, mw.y - 5, mw.w + 2, 5, C.stone2); k.rect(mw.x - 1, mw.y - 5, mw.w + 2, 1, C.stone4);
      art(k, mw.x + 3, mw.y - mw.h + 2, mw.w - 6, mw.h - 9, 77, '#f3e6c1');
      k.c.save(); k.c.beginPath(); k.c.rect(mw.x + 3, mw.y - mw.h + 2, mw.w - 6, mw.h - 9); k.c.clip();
      k.circle(mw.x + 18, mw.y - 24, 9, '#3a6fb0'); k.circle(mw.x + 18, mw.y - 24, 6, '#f2c14e'); k.circle(mw.x + 18, mw.y - 24, 3, '#c4483a'); k.ring(mw.x + 18, mw.y - 24, 11, 10, C.ink);
      k.poly([[mw.x + 34, mw.y - 10], [mw.x + 44, mw.y - 32], [mw.x + 54, mw.y - 10]], '#58998c'); k.line(mw.x + 4, mw.y - 30, mw.x + 56, mw.y - 12, C.ink, 1);
      k.c.restore();
      k.rect(mw.x + mw.w - 2, mw.y - mw.h, 2, mw.h, C.plaster0);
      // Ladder against the mural and a bucket at its foot.
      k.line(mw.x + 46, mw.y + 2, mw.x + 50, mw.y - 34, C.wood2, 1); k.line(mw.x + 53, mw.y + 2, mw.x + 57, mw.y - 34, C.wood1, 1);
      for (let i = 0; i < 6; i++) k.line(mw.x + 47 + i * .6, mw.y - 2 - i * 6, mw.x + 54 + i * .6, mw.y - 2 - i * 6, C.wood3);
      paintPot(k, mw.x + 36, mw.y + 4, '#e46c52'); paintPot(k, mw.x + 8, mw.y + 4, '#5f86c8'); paintPot(k, mw.x + 14, mw.y + 5, '#f2c14e');

      /* ---- Open-air studio pavilion (top right) ---- */
      const px0 = 8, px1 = 146, ptop = -120;
      Props.planks(k, px0, -104, px1 - px0, 66, C.wood3); k.rect(px0, -38, px1 - px0, 2, C.wood1); k.rect(px0 + 2, -36, px1 - px0, 2, C.shadow);
      // Back gallery wall: framed finished works above a shelf of jars and brush pots.
      k.rect(px0 + 4, -104, px1 - px0 - 8, 26, C.wood1); k.rect(px0 + 5, -103, px1 - px0 - 10, 24, '#6a4e36');
      for (let x = px0 + 7; x < px1 - 6; x += 5) k.rect(x, -103, 1, 24, '#5c4430');
      [[px0 + 10, -101, 18, 14, 81], [px0 + 32, -99, 12, 10, 82], [px0 + 48, -102, 22, 16, 83], [px0 + 74, -100, 14, 12, 84], [px0 + 92, -102, 18, 15, 85], [px0 + 114, -100, 12, 11, 86]].forEach(([x, y, w, h, sd], i) => {
        k.rect(x - 2, y - 2, w + 4, h + 4, i % 2 ? C.gold1 : C.wood0); k.rect(x - 2, y - 2, w + 4, 1, i % 2 ? C.gold3 : C.wood2); art(k, x, y, w, h, sd, i === 2 ? '#e4ecf0' : i === 4 ? '#f3e6c1' : C.paper); k.rect(x + 1, y + h + 2, w, 1, '#4a3828');
      });
      k.rect(px0 + 4, -80, px1 - px0 - 8, 2, C.wood3); k.rect(px0 + 4, -80, px1 - px0 - 8, 1, C.wood4); k.rect(px0 + 4, -78, px1 - px0 - 8, 1, C.wood0);
      for (let i = 0; i < 16; i++) { const x = px0 + 8 + i * 8, c = HUES[i % 8]; if (i % 3 === 2) { k.rect(x, -85, 4, 5, C.stone3); k.px(x + 1, -87, C.wood3); k.px(x + 2, -88, C.wood4); k.px(x + 2, -89, c); } else { k.rect(x, -84, 4, 4, C.glass); k.rect(x, -83, 4, 3, c); k.rect(x, -85, 4, 1, C.wood2); } }
      // Canopy: striped plum and cream sailcloth on posts.
      k.rect(px0 - 4, ptop - 1, px1 - px0 + 8, 18, C.plum0);
      for (let x = px0 - 4; x < px1 + 4; x += 6) { k.rect(x, ptop, 3, 16, C.plum2); k.rect(x + 3, ptop, 3, 16, C.paper); k.px(x, ptop, C.plum3); }
      k.rect(px0 - 4, ptop, px1 - px0 + 8, 1, C.plum4); k.rect(px0 - 4, ptop + 15, px1 - px0 + 8, 2, C.plum0);
      for (let x = px0 - 4; x < px1 + 4; x += 6) { k.rect(x, ptop + 17, 3, 2, C.plum2); k.px(x + 1, ptop + 19, C.plum1); }
      for (const x of [px0 - 2, px1 - 1]) { k.rect(x, ptop + 16, 3, 82, C.wood2); k.rect(x, ptop + 16, 1, 82, C.wood4); k.rect(x + 2, ptop + 16, 1, 82, C.wood0); }
      k.rect(px0 + 60, ptop + 16, 3, 20, C.wood2);
      // Three easels with works in progress, a still-life plinth and stools.
      easel(k, 36, -44, 18, 16, 11); easel(k, 78, -46, 16, 14, 12, '#e4ecf0'); easel(k, 120, -44, 18, 16, 13, '#f3e6c1');
      k.rect(96, -60, 10, 12, C.stone3); k.rect(96, -60, 10, 2, C.stone4); k.circle(99, -63, 2, '#e46c52'); k.rect(102, -67, 3, 6, '#5f86c8'); k.px(102, -67, C.white);
      stool(k, 56, -42); stool(k, 138, -40, C.plum2);

      /* ---- Kiln (far top right) ---- */
      k.ellipse(KILN.x + 18, KILN.y + 1, 18, 3, C.shadow);
      k.rect(KILN.x + 20, KILN.y - 44, 7, 30, C.terra1); k.rect(KILN.x + 20, KILN.y - 44, 2, 30, C.terra3); k.rect(KILN.x + 19, KILN.y - 46, 9, 3, C.stone3); k.rect(KILN.x + 21, KILN.y - 45, 5, 1, C.stone0);
      k.ellipse(KILN.x + 15, KILN.y - 12, 16, 14, C.terra1); k.ellipse(KILN.x + 14, KILN.y - 13, 15, 13, C.terra2); k.ellipse(KILN.x + 10, KILN.y - 18, 8, 6, C.terra3); k.px(KILN.x + 7, KILN.y - 21, C.terra4);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) k.px(KILN.x + 3 + i * 5 + (r % 2) * 2, KILN.y - 22 + r * 5, C.terra1);
      k.rect(KILN.x - 2, KILN.y - 3, 34, 4, C.stone2); k.rect(KILN.x - 2, KILN.y - 3, 34, 1, C.stone4);
      k.rect(KILN.x + 9, KILN.y - 12, 12, 9, C.stone1); k.rect(KILN.x + 10, KILN.y - 11, 10, 8, '#2a1a14'); k.rect(KILN.x + 11, KILN.y - 13, 8, 1, C.stone1);
      // Fired pots cooling on a plank.
      k.rect(KILN.x - 4, KILN.y + 8, 30, 2, C.wood2);
      for (let i = 0; i < 4; i++) { const c = ['#58998c', '#c86a48', '#5f86c8', '#e0b44a'][i]; k.ellipse(KILN.x + i * 7, KILN.y + 5, 3, 3, c); k.rect(KILN.x + i * 7 - 1, KILN.y + 1, 3, 2, S(c, -.2)); k.px(KILN.x + i * 7 - 1, KILN.y + 4, S(c, .4)); }
      Props.logPile(k, 168, -18, 3);

      /* ---- Colour fountain (plaza, left) ---- */
      k.ellipse(FX + 3, FY + 7, 36, 11, C.shadow);
      k.ellipse(FX, FY + 4, 33, 13, C.stone1); k.ellipse(FX, FY + 3, 33, 13, C.stone2);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI; k.rect(FX + Math.round(Math.cos(a) * 32), FY + 2 + Math.round(Math.sin(a) * 12), 1, 4, C.stone1); }
      k.ellipse(FX, FY, 33, 12, C.stone3); k.ellipse(FX, FY - 1, 32, 11, C.stone4); k.ellipse(FX, FY, 29, 9, C.stone2);
      k.ellipse(FX, FY + 1, 28, 8, C.water1);
      // Glazed tile ring on the rim.
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; k.rect(FX + Math.round(Math.cos(a) * 31), FY + Math.round(Math.sin(a) * 10.5), 2, 1, HUES[i % 8]); }
      // Central column and upper bowl.
      k.rect(FX - 3, FY - 20, 7, 20, C.stone3); k.rect(FX - 3, FY - 20, 2, 20, C.stone4); k.rect(FX + 3, FY - 20, 1, 20, C.stone1);
      k.ellipse(FX, FY - 20, 11, 4, C.stone2); k.ellipse(FX, FY - 21, 11, 3, C.stone4); k.ellipse(FX, FY - 21, 8, 2, C.water1);
      k.rect(FX - 1, FY - 29, 3, 8, C.stone3); k.circle(FX, FY - 30, 2, C.gold2); k.px(FX - 1, FY - 31, C.gold4);

      /* ---- Main easel and paint trolley (plaza, right of centre) ---- */
      easel(k, EASEL.x, EASEL.y, EASEL.w, EASEL.h, null);
      k.rect(66, 30, 16, 12, C.wood2); k.rect(66, 30, 16, 2, C.wood4); k.rect(66, 36, 16, 1, C.wood1); k.rect(67, 42, 2, 2, C.stone1); k.rect(79, 42, 2, 2, C.stone1); k.ellipse(75, 44, 9, 2, C.shadowSoft);
      for (let i = 0; i < 5; i++) k.rect(67 + i * 3, 28, 2, 2, HUES[i * 2 % 8]);
      k.rect(70, 22, 3, 6, C.stone3); k.px(70, 21, C.wood3); k.px(72, 20, C.wood4); k.px(71, 19, '#9d78a0');
      // Palette leaning on the trolley.
      k.ellipse(88, 40, 6, 3, C.wood4); k.ellipse(88, 40, 5, 2, C.wood5); for (let i = 0; i < 5; i++) k.px(85 + i * 1.6, 39 + (i % 2), HUES[i + 1]); k.px(90, 41, C.wood2);

      /* ---- Still-life corner, potter's wheel and a drip-painting tarp ---- */
      k.ellipse(-136, 8, 14, 3, C.shadow); k.rect(-150, -6, 26, 4, C.plum2); k.rect(-150, -6, 26, 1, C.plum4); k.poly([[-150, -2], [-124, -2], [-122, 6], [-152, 6]], C.plum1); for (let x = -150; x < -122; x += 4) k.rect(x, -1, 1, 7, C.plum0);
      k.rect(-143, -16, 5, 10, '#3a6fb0'); k.rect(-142, -18, 3, 2, '#3a6fb0'); k.px(-142, -15, '#8fb0e8'); k.px(-141, -20, C.leaf3); k.px(-143, -21, '#e46c52'); k.px(-139, -21, '#f2c14e');
      k.circle(-133, -9, 2, '#c4483a'); k.circle(-129, -8, 2, '#f09a2a'); k.px(-134, -10, C.white); k.rect(-148, -9, 4, 3, C.paper2);
      easel(k, -110, 14, 14, 12, 30); stool(k, -120, 20, C.plum2);
      k.ellipse(-28, -6, 10, 3, C.shadow); k.rect(-36, -12, 16, 6, C.wood2); k.rect(-36, -12, 16, 1, C.wood4); k.ellipse(-28, -13, 6, 2, C.stone2); k.ellipse(-28, -14, 5, 1, C.stone4);
      k.rect(-31, -20, 7, 6, '#b86a48'); k.rect(-30, -21, 5, 1, '#c88a62'); k.rect(-31, -20, 1, 6, '#d8987a'); k.rect(-18, -10, 6, 4, '#8a5a3a'); k.rect(-18, -10, 6, 1, '#b07a58');
      k.poly([[66, -28], [106, -30], [112, -4], [70, -2]], '#d8d0bc'); k.poly([[66, -28], [106, -30], [107, -26], [67, -24]], '#e8e0cc');
      for (let i = 0; i < 9; i++) splat(k, 72 + P.hash(i, 71) * 34, -24 + P.hash(i, 72) * 18, HUES[i % 8], 1);
      k.rect(76, -24, 26, 16, C.wood1); k.rect(77, -23, 24, 14, C.paper);
      for (let i = 0; i < 5; i++) k.path([[78 + i * 4, -22 + (i % 2) * 3], [84 + i * 3, -16], [80 + i * 4, -11 + (i % 3)]], [C.ink, '#c4483a', '#3a6fb0', '#e0b44a', '#58998c'][i]);
      paintPot(k, 104, -2, '#c4483a'); paintPot(k, 62, -6, '#3a6fb0'); k.line(110, -8, 116, -14, C.wood3); k.rect(115, -16, 2, 3, '#f2c14e');
      /* ---- Drying racks and dye line (right middle) ---- */
      // A-frame rack with finished canvases standing in slots.
      k.rect(122, 22, 64, 3, C.shadow);
      for (const x of [120, 182]) { k.rect(x, -4, 3, 26, C.wood2); k.rect(x, -4, 1, 26, C.wood4); }
      k.rect(120, 4, 65, 2, C.wood3); k.rect(120, 14, 65, 2, C.wood3); k.rect(120, 20, 65, 2, C.wood1);
      for (let i = 0; i < 6; i++) art(k, 125 + i * 10, 2 + (i % 2), 8, 16 - (i % 2), 40 + i, i % 3 === 1 ? '#dfe8ef' : C.paper);
      k.rect(120, -5, 65, 2, C.wood3); k.rect(120, -5, 65, 1, C.wood4);
      stool(k, 104, 20, C.teal2);
      Props.crate(k, 96, 8, 8); art(k, 97, 1, 7, 6, 60);

      /* ---- Pigment works (bottom left) ---- */
      k.poly([[-188, 60], [-106, 58], [-100, 136], [-188, 138]], C.dirt2); k.ditherPoly([[-188, 60], [-106, 58], [-100, 136], [-188, 138]], C.dirt3, 1);
      for (let i = 0; i < 12; i++) splat(k, -182 + P.hash(i, 90) * 76, 64 + P.hash(i, 91) * 70, ART[i % 8], 1);
      // Shelf of pigment jars under a little tiled roof.
      k.rect(-184, 52, 58, 5, C.terra1); for (let x = -184; x < -126; x += 4) { k.rect(x, 52, 2, 4, C.terra3); k.px(x, 52, C.terra4); } k.rect(-184, 56, 58, 1, C.terra0);
      for (const x of [-182, -130]) k.rect(x, 57, 3, 26, C.wood1);
      for (let r = 0; r < 3; r++) {
        const y = 64 + r * 8; k.rect(-182, y, 55, 2, C.wood3); k.rect(-182, y + 2, 55, 1, C.wood0);
        for (let i = 0; i < 9; i++) { const c = ART[(i + r * 3) % 9], x = -179 + i * 6; k.rect(x, y - 5, 4, 5, C.glass); k.rect(x, y - 3, 4, 3, c); k.rect(x, y - 6, 4, 1, C.wood2); k.px(x, y - 5, C.white); }
      }
      // Three dye vats (liquid surfaces animate).
      for (const [x, y, c] of VATS) {
        k.ellipse(x + 2, y + 9, 11, 3, C.shadow); k.rect(x - 9, y - 1, 19, 10, C.wood2); k.rect(x - 9, y - 1, 3, 10, C.wood3); k.rect(x + 7, y - 1, 3, 10, C.wood1);
        for (let i = -6; i < 8; i += 4) k.rect(x + i, y, 1, 9, C.wood1);
        k.rect(x - 9, y + 2, 19, 1, C.stone1); k.rect(x - 9, y + 6, 19, 1, C.stone1);
        k.ellipse(x, y - 1, 10, 4, C.wood1); k.ellipse(x, y - 1, 8, 3, S(c, -.2)); k.ellipse(x - 1, y - 2, 5, 1, c);
        k.rect(x + 8, y + 1, 1, 7, S(c, -.1)); k.ellipse(x + 9, y + 9, 3, 1, c);
      }
      // Grinding stone, powder sacks and scattered pots.
      k.ellipse(-116, 94, 8, 3, C.shadow); k.rect(-123, 86, 14, 7, C.stone2); k.rect(-123, 86, 14, 2, C.stone4); k.ellipse(-116, 86, 6, 2, '#c4483a'); k.rect(-117, 78, 2, 8, C.wood3); k.rect(-118, 77, 4, 2, C.wood2);
      Props.sack(k, -184, 118, '#e0b44a'); Props.sack(k, -174, 124, '#c9b388'); Props.sack(k, -134, 122, '#5f86c8');
      k.rect(-182, 116, 6, 2, '#f2c14e'); k.rect(-132, 120, 6, 2, '#7fb0e8');
      for (let i = 0; i < 5; i++) paintPot(k, -160 + i * 7, 132, HUES[(i * 3) % 8]);
      Props.barrel(k, -112, 110);

      /* ---- Roman sculpture court (bottom right): gravel, cypresses, an olive, marble on plinths ---- */
      const court = [[100, 48], [188, 42], [190, 140], [96, 140], [90, 98]];
      k.polyTex(court, (x, y) => {
        const h = P.hash(x, y), hb = P.hash(x, y + 1);
        if (hb > .93) return '#eee7d6';
        if (h > .93) return '#978c76';
        return h < .14 ? '#e0d8c4' : h > .78 ? '#b8ad96' : (x + y * 3) % 7 === 0 ? '#c3b9a2' : '#cec5ae';
      });
      k.path(court.concat([court[0]]), C.stone1, 1); k.path([[101, 47], [187, 41]], C.stone4, 1);
      cypress(k, 104, 70, 46, 5); cypress(k, 186, 58, 40, 4); cypress(k, 158, 60, 34, 4);
      olive(k, 138, 76);
      // Goddess on her plinth (laurel relief), the emperor on a tall SPQR plinth.
      let top = plinth(k, 116, 84, 16, 16, null, true); k.blit(goddess(), 116, top + 1);
      top = plinth(k, EMP.x, EMP.y, 20, 18, 'SPQR'); k.blit(emperor(), EMP.x - 1, top + 1);
      // A fresh green laurel wreath leaning on the emperor's base, with ribbons.
      k.ring(EMP.x - 9, EMP.y - 3, 3, 3, '#4c7a3e'); k.ring(EMP.x - 9, EMP.y - 3, 2, 2, '#6f9a4e'); k.px(EMP.x - 11, EMP.y - 5, '#9cc06a'); k.px(EMP.x - 8, EMP.y - 6, '#9cc06a'); k.rect(EMP.x - 9, EMP.y, 1, 3, '#c4483a'); k.rect(EMP.x - 8, EMP.y, 1, 2, '#e46c52');
      // Scaffold (back half), chips and tools around the unfinished block.
      scaffold(k, false);
      for (let i = 0; i < 16; i++) { const x = HC.x - 12 + P.hash(i, 3) * 30, y = HC.y - 1 + P.hash(i, 4) * 8; k.px(x, y, i % 3 ? MB[1] : MB[3]); if (i % 4 === 0) k.px(x + 1, y, MB[4]); }
      k.rect(HC.x - 26, HC.y + 2, 9, 4, C.wood2); k.rect(HC.x - 26, HC.y + 2, 9, 1, C.wood4); k.rect(HC.x - 25, HC.y + 1, 5, 1, C.stone1); k.rect(HC.x - 20, HC.y, 3, 2, C.wood3); k.px(HC.x - 24, HC.y + 1, C.stone4);
      // Discus-thrower on a low base; the senator's bust on an Ionic column.
      top = plinth(k, 106, 134, 22, 8, null); k.blit(discobolus(), 106, top + 1);
      const cx = 181, cb = 138;
      k.ellipse(cx + 4, cb + 1, 9, 2, C.shadow);
      k.rect(cx - 7, cb - 9, 14, 9, MB[2]); k.rect(cx - 7, cb - 9, 14, 1, MB[0]); k.rect(cx + 4, cb - 9, 3, 9, MB[4]); k.rect(cx - 7, cb - 1, 14, 1, MB[5]); k.text('CATO', cx - 8, cb - 7, MB[1]); k.text('CATO', cx - 8, cb - 8, MB[6]);
      k.rect(cx - 5, cb - 11, 10, 2, MB[1]); k.rect(cx + 3, cb - 11, 2, 2, MB[4]);
      for (let i = 0; i < 7; i++) k.rect(cx - 4 + i, cb - 25, 1, 14, [MB[1], MB[0], MB[2], MB[1], MB[3], MB[4], MB[5]][i]);
      for (let i = 0; i < 3; i++) k.rect(cx - 3 + i * 2, cb - 24, 1, 12, P.mix(MB[3 + (i > 1)], '#8993a8', .2));
      k.rect(cx - 6, cb - 28, 12, 3, MB[1]); k.rect(cx - 6, cb - 26, 12, 1, MB[4]); k.rect(cx - 7, cb - 27, 2, 2, MB[3]); k.rect(cx + 5, cb - 27, 2, 2, MB[4]); k.px(cx - 6, cb - 27, MB[5]); k.px(cx + 6, cb - 27, MB[6]);
      k.rect(cx - 5, cb - 29, 10, 1, MB[0]);
      k.blit(bust(), cx, cb - 29);

      /* ---- Rest corner and grove trees ---- */
      Props.tree(k, -60, 104, 'blossom', 2, 0);
      Props.bench(k, REST.x - 22, REST.y - 1, 14);
      Props.flowerBed(k, -96, 124, 40, 10, ['#f2c14e', '#e46c52', '#9d78a0', '#f6ecd0'], 3);
      Props.flowerBed(k, 26, 124, 44, 10, ['#e98aa0', '#5f86c8', '#f6ecd0', '#f2c14e'], 8);
      for (const [x, y] of [[-28, 90], [24, 90]]) { k.ellipse(x + 1, y, 3, 1, C.shadow); k.rect(x - 1, y - 1, 4, 2, C.stone1); k.rect(x, y - 16, 2, 16, C.slate1); k.rect(x - 2, y - 21, 6, 5, C.slate0); k.rect(x - 1, y - 20, 4, 3, C.glassDark); k.rect(x - 3, y - 22, 8, 1, C.slate1); }
      Props.tree(k, 186, -120, 'autumn', 1, 2); Props.tree(k, -186, 140, 'oak', 1, 1); Props.tree(k, 4, -116, 'birch', 1, 0);
      Props.bush(k, -160, 44, 2); Props.bush(k, -104, -30, 0); Props.bush(k, 90, 58, 2);
    },
    front(k) {
      // Pavilion post caps sit in front of passing painters.
      k.rect(6, -104, 5, 2, C.wood4); k.rect(145, -104, 5, 2, C.wood4);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting';
      /* Fountain water, jets, ripples and colour motes. */
      const hue = FOUNT[Math.floor(t * 1.5) % 6], hue2 = FOUNT[(Math.floor(t * 1.5) + 3) % 6];
      const water = !live ? C.water0 : err ? '#5a5040' : run ? P.mix(C.water2, hue, .5) : C.water2;
      k.ellipse(FX, FY + 1, 27, 7, water); k.ellipse(FX - 4, FY, 18, 4, !live ? S(C.water0, .1) : err ? '#6e6450' : run ? P.mix(C.water4, hue, .55) : C.water3);
      k.ellipse(FX, FY - 21, 7, 1, !live ? C.water0 : err ? '#5a5040' : run ? hue2 : C.water3);
      if (run) {
        for (let a = 0; a < 4; a++) {
          const dir = a < 2 ? -1 : 1, dy = a % 2 ? 4 : -1, col = HUES[(Math.floor(t * 1.5) + a * 2) % 8];
          for (let j = 0; j < 5; j++) { const p = (t * 1.3 + j / 5) % 1, x = FX + dir * (8 + p * (a % 2 ? 12 : 18)), y = FY - 21 - 7 * p + (21 + dy) * p * p; k.rect(x, y, 2, 2, col); if (j === 0) k.px(x, y, C.white); }
          const q = (t * 1.3 + a * .25) % 1; k.alpha(1 - q, () => k.ring(FX + dir * (a % 2 ? 20 : 26), FY + dy - 1, 2 + q * 4, 1 + q * 1.5, C.foam));
        }
        for (let j = 0; j < 4; j++) { const p = (t * 1.6 + j / 4) % 1; k.rect(FX, FY - 31 - Math.sin(p * Math.PI) * 9, 1, 2, HUES[(j + Math.floor(t * 3)) % 8]); }
        if (z.detail) for (let i = 0; i < 8; i++) { const p = (t * .25 + i / 8) % 1; k.alpha(1 - p, () => k.rect(FX + Math.sin(i * 2.3 + t) * 26, FY - 24 - p * 70, 2, 2, HUES[i])); }
      } else if (state === 'idle') {
        const p = (t * .8) % 1; k.alpha(1 - p, () => k.ring(FX, FY + 1, 6 + p * 16, 2 + p * 5, C.water4));
        k.rect(FX, FY - 32 - Math.round(Math.abs(Math.sin(t * 2)) * 2), 1, 2, C.water4);
      } else if (err) {
        if (Math.floor(t * 3) % 3 === 0) for (let j = 0; j < 4; j++) k.rect(FX - 3 + j * 2, FY - 30 - j * 2 + (j % 2) * 3, 2, 2, '#6e5a3e');
        k.alpha(.9, () => { k.ellipse(FX + 30, FY + 12, 9, 2, '#6e6450'); });
      }

      /* Main canvas: strokes appear while working; frozen, reviewed, spoiled or covered otherwise. */
      k.at(CAN.x, CAN.y, () => {
        const n = run ? Math.min(STROKES.length, Math.floor(t * 1.4) % (STROKES.length + 5)) : state === 'idle' ? 6 : wait ? STROKES.length : err ? 5 : 4;
        for (let i = 0; i < n; i++) STROKES[i](k);
        if (run && n < STROKES.length && Math.floor(t * 6) % 2) k.px(4 + (n * 7) % 20, 4 + (n * 5) % 14, C.white);
        if (err) { k.rect(10, 0, 3, 16, '#6e5a3e'); k.rect(11, 16, 2, 3, '#6e5a3e'); k.rect(18, 0, 2, 11, '#6e5a3e'); k.px(18, 11, '#6e5a3e'); k.poly([[2, 6], [9, 3], [7, 10]], '#5a4a3e'); }
        if (wait) { k.rect(EASEL.w - 7, -3, 8, 8, C.ink); k.rect(EASEL.w - 6, -2, 6, 6, C.waiting); k.rect(EASEL.w - 4, -1, 2, 1, C.ink); k.px(EASEL.w - 3, 1, C.ink); k.px(EASEL.w - 3, 3, C.ink); }
        if (!live) { k.poly([[-2, -2], [EASEL.w + 2, -2], [EASEL.w + 3, EASEL.h + 3], [-3, EASEL.h + 4]], '#b8b0a0'); k.line(4, -1, 6, EASEL.h + 2, '#9a9284'); k.line(18, -1, 20, EASEL.h + 3, '#9a9284'); k.rect(-2, -2, EASEL.w + 4, 2, '#d4ccbc'); }
      });

      /* Dye vats: bubbles while brewing, overflowing when something went wrong. */
      VATS.forEach(([x, y, c], i) => {
        if (run) { for (let j = 0; j < 2; j++) { const p = (t * 1.1 + i * .37 + j * .5) % 1; k.px(x - 4 + ((i * 5 + j * 7) % 9), y - 2 - Math.floor(p * 2), p < .7 ? S(c, .45) : C.white); } if (z.detail) { const p = (t * .4 + i / 3) % 1; k.alpha((1 - p) * .6, () => k.circle(x + Math.sin(t + i) * 3, y - 6 - p * 18, 1 + p * 2, S(c, .4))); } }
        if (!live) k.ellipse(x - 1, y - 2, 5, 1, S(c, -.45));
      });
      if (err) { const [x, y, c] = VATS[1]; k.ellipse(x + 2, y + 16, 13, 4, S(c, -.15)); k.ellipse(x, y + 15, 10, 3, c); k.rect(x - 9, y + 1, 2, 12, c); k.px(x + 10, y + 20, c); Props.smoke(k, x, y - 4, t * 1.4, 3, '#8a8478'); }

      /* Kiln fire and smoke. */
      if (run) { Props.fire(k, KILN.x + 15, KILN.y - 3, t, 1); k.alpha(.35 + Math.sin(t * 9) * .1, () => k.rect(KILN.x + 8, KILN.y - 13, 14, 10, C.gold3)); Props.smoke(k, KILN.x + 23, KILN.y - 48, t, 4); }
      else if (state === 'idle' || wait) { k.rect(KILN.x + 12, KILN.y - 6, 6, 2, C.red1); k.px(KILN.x + 14, KILN.y - 7, C.red3); Props.smoke(k, KILN.x + 23, KILN.y - 48, t * .4, 2); }
      else if (err) { Props.smoke(k, KILN.x + 23, KILN.y - 48, t * 1.3, 6, '#4a4642'); Props.smoke(k, KILN.x + 15, KILN.y - 14, t * 1.1, 3, '#6a6660'); if (Math.floor(t * 8) % 2) { k.px(KILN.x + 11 + Math.floor(t * 20) % 9, KILN.y - 14 - Math.floor(t * 30) % 6, C.gold3); k.px(KILN.x + 18 - Math.floor(t * 17) % 7, KILN.y - 16 - Math.floor(t * 23) % 5, C.red3); } }

      if (err) { k.blit(fallenCanvas(), -22, 26); for (let i = 0; i < 3; i++) splat(k, -34 + i * 12, 26 + (i % 2) * 3, HUES[i * 2], 2); }

      /* Sculpture court: the unfinished statue on its scaffold shows the state. */
      k.blit(unfinished(err), HC.x, HC.y);
      if (!live) k.blit(P.tint(unfinished(false), '#141c3c'), HC.x, HC.y, false, .4);
      scaffold(k, true);
      const cx = HC.x + 7, cy = HC.y - 30;   // where the chisel bites
      if (run) {
        for (let i = 0; i < 6; i++) { const p = (t * 2.2 + i / 6) % 1, d = i % 3 === 0 ? -1 : 1, x = cx + d * (1 + p * (5 + i * 1.5)), y = cy - 5 * p + 22 * p * p; k.px(x, y, i % 2 ? MB[0] : MB[3]); }
        if (z.detail) { const p = (t * 1.1) % 1; k.alpha(.55 * (1 - p), () => k.circle(cx + 2 + p * 5, cy - 1 - p * 7, 1 + p * 3, '#ece6da')); }
        if (Math.floor(t * 4.4) % 2) k.px(cx, cy, C.white);
      } else if (wait) {
        // Amber rope barrier and a "?" board: the next cut waits for approval.
        const posts = [HC.x - 20, HC.x - 2, HC.x + 16, HC.x + 34], by = HC.y + 8;
        for (let i = 0; i < posts.length; i++) { const px = posts[i]; k.rect(px, by - 8, 2, 8, C.gold0); k.rect(px, by - 8, 1, 8, C.gold2); k.rect(px - 1, by - 9, 4, 2, C.gold1); k.ellipse(px + 2, by + 1, 3, 1, C.shadow);
          if (i) { const x0 = posts[i - 1] + 2; for (let x = x0; x < px; x++) { const u = (x - x0) / (px - x0); k.px(x, by - 7 + Math.round(Math.sin(u * Math.PI) * 3), C.waiting); } } }
        k.rect(HC.x - 25, HC.y - 12, 11, 10, C.wood1); k.rect(HC.x - 24, HC.y - 11, 9, 8, C.waiting); k.text('?', HC.x - 21, HC.y - 10, C.ink); k.rect(HC.x - 20, HC.y - 2, 1, 8, C.wood1);
      } else if (err) {
        // The shoulder and head have cracked off and lie in a cloud of marble dust.
        k.blit(chunk(), HC.x - 20, HC.y + 6);
        for (let i = 0; i < 7; i++) k.px(HC.x - 26 + ((i * 7) % 15), HC.y + 3 + (i * 3) % 6, i % 2 ? MB[1] : MB[4]);
        if (z.detail) for (let i = 0; i < 3; i++) { const p = (t * .5 + i / 3) % 1; k.alpha(.5 * (1 - p), () => k.circle(HC.x - 18 + i * 6 + p * 4, HC.y + 2 - p * 16, 2 + p * 4, '#d8d2c6')); }
        if (Math.floor(t * 3) % 2) k.px(HC.x - 3, HC.y - 27, C.error);
      }
      /* Emperor: a glint travels over the cuirass; a pigeon keeps his head company. */
      if (live && !err) { const p = (t * .35) % 1; if (p < .18) { const gx = EMP.x - 5 + Math.round(p * 40), gy = EMP.y - 48 + Math.round(p * 18); k.px(gx, gy, C.white); if (p > .05 && p < .13) { k.px(gx - 1, gy, MB[0]); k.px(gx + 1, gy, MB[0]); k.px(gx, gy - 1, MB[0]); k.px(gx, gy + 1, MB[0]); } } }
      if (err) { const f = (t * .6) % 1; if (z.detail) pigeon(k, EMP.x - 1 + Math.round(f * 30), EMP.y - 60 - Math.round(f * 26), 1, Math.floor(t * 12) % 2 + 2); }
      else pigeon(k, EMP.x + 1, EMP.y - 59, 1, live && Math.floor(t * 1.7) % 3 === 0 ? 1 : 0);
      if (live && !err) pigeon(k, 181, 86, -1, Math.floor(t * .9) % 4 === 1 ? 1 : 0);

      /* State lamp on the pavilion post and the waiting pile. */
      const lampOn = live && (!err || Math.floor(t * 4) % 2);
      k.rect(146, -64, 6, 6, C.ink); k.rect(147, -63, 4, 4, lampOn ? C[state] : C.slate1); if (lampOn && run && Math.floor(t * 2) % 2) k.px(148, -62, C.white);
      if (wait) {
        // Finished canvases stacked on a cart, wrapped and tagged, waiting for approval.
        k.ellipse(84, 88, 16, 3, C.shadow); k.rect(70, 78, 28, 6, C.wood2); k.rect(70, 78, 28, 1, C.wood4); k.circle(75, 85, 3, C.wood1); k.circle(93, 85, 3, C.wood1); k.px(75, 85, C.wood3); k.px(93, 85, C.wood3);
        for (let i = 0; i < 4; i++) { k.rect(72 + i, 64 - i * 4, 22, 14, C.wood0); k.rect(73 + i, 65 - i * 4, 20, 12, i % 2 ? C.paper2 : '#cfc4a8'); k.line(73 + i, 65 - i * 4, 92 + i, 76 - i * 4, '#b8ad92'); }
        k.rect(88, 50, 8, 8, C.ink); k.rect(89, 51, 6, 6, C.waiting); k.rect(91, 52, 2, 1, C.ink); k.px(92, 54, C.ink); k.px(92, 55, C.ink);
        Props.banner(k, 144, -40, C.waiting, t, 10);
      }
      if (live && z.detail) {
        const lit = C.glassLit;
        for (const x of [-28, 24]) k.rect(x - 1, 70, 4, 3, run || wait ? lit : S(lit, -.25));
      }

      /* Potter's wheel: the clay spins while working. */
      if (run) { for (let i = 0; i < 3; i++) k.rect(-31 + Math.floor(t * 14 + i * 2.3) % 7, -19 + i * 2, 1, 1, '#8a4a30'); k.px(-28, -22, C.white); }
      if (err) k.poly([[-33, -14], [-24, -16], [-22, -13], [-30, -12]], '#8a5a3a');

      /* Crew and lead, drawn back to front. */
      if (run) {
        z.crew(26, -38, { look: 2, hat: 'scarf', hatColor: '#9d78a0', anim: 'work', tool: 'pen', phase: .1 });
        z.crew(131, -38, { look: 4, hat: 'none', anim: 'work', tool: 'pen', facing: -1, phase: .6 });
        // A carrier ferries fresh canvases from the barn to the drying rack.
        const p = (t * .06) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
        const cx = q < .8 ? -124 + q / .8 * 214 : 90 + (q - .8) / .2 * 14, cy = q < .8 ? -28 + q / .8 * 6 : -22 + (q - .8) / .2 * 26;
        z.crew(cx, cy, { look: 3, hat: 'straw', anim: 'walk', carry: back ? '' : 'paper', facing: back ? -1 : 1, phase: .3 });
        z.crew(-42, -4, { look: 5, hat: 'bandana', hatColor: '#c86a48', anim: 'work', phase: .9, speed: 4 });
      } else if (live) {
        z.crew(58, -38, { look: 2, hat: 'scarf', hatColor: '#9d78a0', anim: wait ? 'idle' : 'sit' });
        if (err) z.crew(166, -26, { look: 4, anim: 'idle', facing: -1 });
      } else {
        z.crew(58, -38, { look: 2, hat: 'scarf', hatColor: '#9d78a0', anim: 'sit' });
      }
      if (live) z.crew(-104, 60, { look: 1, hat: 'straw', anim: run ? 'work' : err ? 'idle' : 'sit', phase: .5, tool: run ? 'pen' : '' });
      else z.crew(-104, 60, { look: 1, hat: 'straw', anim: 'sit' });

      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});

      if (run) {
        z.crew(-146, 118, { look: 0, hat: 'bandana', hatColor: '#3a6fb0', anim: 'work', tool: 'broom', facing: -1, phase: .2 });
        z.crew(HC.x + 15, PLANK, { look: 5, hat: 'cap', hatColor: C.stone2, anim: 'work', tool: 'hammer', facing: -1, phase: .8 });
      } else if (wait) {
        z.crew(66, 96, { look: 0, hat: 'bandana', hatColor: '#3a6fb0', anim: 'idle' });
        z.crew(HC.x + 19, PLANK, { look: 5, hat: 'cap', hatColor: C.stone2, anim: 'idle', facing: -1 });
      } else if (err) {
        z.crew(-128, 128, { look: 0, hat: 'bandana', hatColor: '#3a6fb0', anim: 'idle' });
        z.crew(HC.x - 4, HC.y + 9, { look: 5, hat: 'cap', hatColor: C.stone2, anim: 'idle', facing: -1 });
      } else {
        z.crew(-148, 124, { look: 0, hat: 'bandana', hatColor: '#3a6fb0', anim: 'sit' });
        z.crew(HC.x + 19, PLANK + 2, { look: 5, hat: 'cap', hatColor: C.stone2, anim: 'sit', facing: -1, state: state === 'off' ? 'off' : 'idle' });
      }

      /* Ambient life: butterflies over the beds, birds over the grove. */
      if (live && !err && z.detail) {
        for (let i = 0; i < 3; i++) { const a = t * (.6 + i * .2) + i * 2; Props.butterfly(k, -70 + i * 60 + Math.sin(a) * 14, 116 + Math.cos(a * 1.3) * 6, t + i, HUES[i * 3 % 8]); }
        if (!run) for (let i = 0; i < 2; i++) { const p = (t * .05 + i * .5) % 1; Props.bird(k, -190 + p * 380, -134 + i * 8 + Math.sin(p * 9) * 3, t + i); }
      }
    }
  };
})();
