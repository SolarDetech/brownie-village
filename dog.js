/* HQ dog: a fluffy Bernese mountain dog that plays on the statue plaza. It runs figure-eights in front of the
   statue, sits and pants, chases its tail and does zoomies with a WOOF. Press and hold on it and move the mouse to
   pet it: it sits, closes its eyes, thumps a back leg and hearts float up. When you let go it hops, then plays on.
   zones/hq.js calls HQDog.draw from animate (zone-local coordinates); app.js calls hit / grab / stroke / release
   with world coordinates. The dog's own clock stops while it is being petted, so its route resumes where it left. */
window.HQDog = (() => {
  const P = window.Pixel, C = P.C;
  const B0 = '#101014', B1 = '#1e1e25', B2 = '#30303a', B3 = '#4a4a56';        // black coat: shade → sheen
  const W0 = '#cfcac0', W1 = '#f6f4ee', R1 = '#b8642a', R2 = '#dc8a44';        // white and rust markings
  const NOSE = '#08080a', EYE = '#1a0e08', TONGUE = '#ec7482';
  const dogs = {};                                                             // zone id → dog state
  const get = id => dogs[id] || (dogs[id] = { id, c: 0, last: null, held: false, rub: -1e9, hearts: [], hopUntil: -1, face: 1 });

  /* ---------- sprites (facing right, feet on y 0) ---------- */
  function head(q, hx, hy, o) {
    q.rect(hx - 1, hy + 2 + (o.flap || 0), 3, 6, B0); q.px(hx, hy + 3 + (o.flap || 0), B2);                 // floppy ear
    q.rect(hx, hy, 8, 8, B1); q.rect(hx + 1, hy, 5, 1, B2); q.px(hx + 2, hy - 1, B1); q.px(hx + 5, hy - 1, B1);
    q.rect(hx + 3, hy, 2, 7, W1);                                                                           // white blaze
    q.rect(hx + 5, hy + 4, 6, 4, W1); q.rect(hx + 5, hy + 7, 6, 1, W0); q.rect(hx + 4, hy + 5, 1, 3, R1);    // muzzle, rust cheek
    q.rect(hx + 9, hy + 4, 2, 2, NOSE); q.px(hx + 9, hy + 4, B3);
    q.px(hx + 6, hy + 1, R2);                                                                               // rust eyebrow
    if (o.happy) { q.px(hx + 5, hy + 3, R2); q.px(hx + 6, hy + 2, R2); q.px(hx + 7, hy + 3, R2); }
    else { q.rect(hx + 5, hy + 2, 2, 2, EYE); q.px(hx + 5, hy + 2, W1); }
    if (o.tongue) { q.rect(hx + 6, hy + 8, 3, 1, B0); q.rect(hx + 7, hy + 8, 2, 2 + (o.tongue > 1 ? 1 : 0), TONGUE); }
    q.px(hx - 1, hy + 7, B1); q.px(hx + 1, hy + 8, B1);                                                     // cheek fluff
  }
  // Bushy plume: overlapping tufts along the points, a white tip.
  function tail(q, pts, wag) {
    pts.forEach(([x, y], i) => { const yy = y + Math.round(wag * i / 2); q.circle(x, yy, 2, B1); q.px(x - 1, yy - 1, B2); q.px(x + 2, yy + 1, B1); q.px(x - 2, yy + 2, B1); });
    const [x, y] = pts[pts.length - 1], yy = y + Math.round(wag * (pts.length - 1) / 2); q.circle(x - 1, yy, 2, W1); q.px(x - 3, yy, W1); q.px(x - 1, yy + 2, W0);
  }
  function leg(q, x0, y0, x1, y1) { q.line(x0, y0, x1, y1, R1, 3); q.px(x0 - 1, y0 + 2, R2); q.rect(x1 - 1, y1, 4, 1, W1); }
  // Round shaggy body: tufts along the back, long feathering under the belly, a soft sheen.
  function fluffyBody(q, dy) {
    q.ellipse(-2, -11 + dy, 11, 6, B1);
    for (let i = -11; i <= 7; i += 2) q.px(i, -17 + dy + (i % 4 ? 0 : -1), B1);
    for (let i = -9; i <= 5; i += 2) { q.px(i, -5 + dy, B1); if (i % 4) q.px(i, -4 + dy, B0); }
    q.ellipse(-3, -14 + dy, 7, 2, B2); q.rect(-6, -15 + dy, 6, 1, B3);
    q.px(-13, -12 + dy, B1); q.px(-13, -9 + dy, B1);
  }
  const RUN = [
    { dy: -1, legs: [[5, -6, 9, 0], [7, -6, 11, -1], [-8, -6, -13, -1], [-6, -6, -10, 0]] },
    { dy: 0, legs: [[5, -6, 3, 0], [7, -6, 5, -1], [-8, -6, -4, -1], [-6, -6, -2, 0]] },
    { dy: -2, legs: [[5, -6, 7, 0], [7, -6, 10, 0], [-8, -6, -11, 0], [-6, -6, -8, -1]] },
    { dy: 0, legs: [[5, -6, 4, 0], [7, -6, 6, 0], [-8, -6, -5, 0], [-6, -6, -3, -1]] }];
  const sprite = (pose, f, wag, happy) => P.sprite(`dog|${pose}|${f}|${wag}|${happy}`, 40, 36, 20, 32, q => {
    if (pose === 'run') {
      const R = RUN[f], dy = R.dy;
      R.legs.slice(2).forEach(([a, b, c, d]) => leg(q, a, b + dy, c, d));
      tail(q, [[-13, -13 + dy], [-15, -15 + dy], [-17, -17 + dy], [-18, -19 + dy]], wag);
      fluffyBody(q, dy); q.rect(-11, -9 + dy, 4, 3, R1); q.px(-12, -8 + dy, R2);                    // rust on the hind leg
      q.ellipse(6, -11 + dy, 3, 5, W1); q.rect(8, -13 + dy, 1, 7, W0); q.px(4, -5 + dy, W1); q.px(6, -5 + dy, W1);   // white chest ruff
      R.legs.slice(0, 2).forEach(([a, b, c, d]) => leg(q, a, b + dy, c, d));
      head(q, 7, -23 + dy, { tongue: 1, flap: f % 2 ? -1 : 1 });
    } else if (pose === 'sit') {
      tail(q, [[-9, -3], [-12, -2], [-15, -2]], wag);
      q.ellipse(-3, -5, 6, 5, B1); q.ellipse(-4, -7, 3, 2, B2); q.rect(-2, -3, 4, 2, R1); q.rect(0, -1, 4, 1, W1);   // haunch, rust, back paw
      if (f) { q.line(-2, -3, -7, -5 - (f > 1 ? 2 : 0), R1, 2); q.rect(-9, -6 - (f > 1 ? 2 : 0), 3, 1, W1); }       // thumping back leg
      q.rect(-3, -17, 10, 12, B1); q.rect(-2, -17, 6, 1, B2); for (let i = -2; i < 6; i += 3) q.px(i, -18, B1);
      q.rect(3, -15, 5, 11, W1); q.rect(7, -14, 1, 10, W0); q.px(2, -10, W1);
      leg(q, 5, -6, 5, 0); leg(q, 8, -6, 8, 0);
      head(q, 4, -27, { happy, tongue: happy ? 2 : 1 });
    } else {                                                                                                   // asleep, curled up
      q.ellipse(-1, -4, 10, 4, B1); q.ellipse(-3, -6, 6, 2, B2); q.rect(-8, -2, 6, 2, R1);
      tail(q, [[-10, -3], [-7, -1], [-3, 0]], 0);
      q.rect(3, -3, 6, 3, W1); q.rect(5, -1, 5, 1, W1);                                                          // chest and front paws
      q.rect(3, -9, 8, 6, B1); q.rect(6, -9, 2, 5, W1); q.rect(8, -6, 5, 3, W1); q.rect(11, -6, 2, 2, NOSE); q.rect(2, -8, 3, 5, B0);
      q.px(8, -7, R2); q.px(9, -7, R2);
    }
  });
  const heart = P.sprite('dog|heart', 7, 6, 3, 5, q => {
    ['.#.#.', '#####', '#####', '.###.', '..#..'].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') q.px(i - 2, j - 4, i === 1 && j === 1 ? '#ffd0dc' : '#ff5a86'); });
  });

  /* ---------- behaviour ---------- */
  // Figure-eight route in front of the statue (GKTC side; Daghan's is mirrored).
  const route = m => [Math.round(104 * Math.sin(m * .42)), Math.round(80 + 24 * Math.sin(m * .84 + .6))];
  const heading = m => Math.cos(m * .42) >= 0 ? 1 : -1;
  function draw(k, z, t, state) {
    const d = get(z.id || z.village || 'hq'), s = z.village === 'daghan' ? -1 : 1, live = state !== 'off';
    const rubbing = d.held && performance.now() - d.rub < 250;
    if (d.wasHeld && !d.held) d.hopUntil = t + 1;
    d.wasHeld = d.held;
    const busy = d.held || t < d.hopUntil;
    if (d.last !== null && !busy && live) d.c += Math.max(0, Math.min(.1, t - d.last));
    d.last = t;
    const c = d.c, n = Math.floor(c / 16), ph = c - n * 16;
    let m = n * 13 + Math.min(ph, 9), pose = 'run', f = Math.floor(c * 12) % 4, face, dx = 0, dy = 0, woof = false;
    if (ph >= 13.5) { m = n * 13 + 9 + (ph - 13.5) * 1.6; f = Math.floor(c * 16) % 4; woof = ph < 14.2; }
    face = heading(m);
    if (ph >= 9 && ph < 11.5) pose = 'sit';
    else if (ph >= 11.5 && ph < 13.5) { const a = (ph - 11.5) * 9; dx = Math.round(Math.cos(a) * 4); dy = Math.round(Math.sin(a) * 2); face = Math.sin(a) > 0 ? 1 : -1; }
    let [x, y] = route(m); x = s * (x + dx); y += dy; face *= s;
    let wag = [-1, 0, 1, 0][Math.floor(t * (rubbing ? 14 : 7)) % 4], happy = 0, lift = 0;
    if (!live) { pose = 'sleep'; x = s * 118; y = 124; face = -s; }
    else if (d.held) { pose = 'sit'; f = rubbing ? 1 + (Math.floor(t * 10) % 2) : 0; happy = rubbing ? 1 : 0; if (d.px != null) face = d.px < (z.x || 0) + x ? -1 : 1; }
    else if (t < d.hopUntil) { pose = 'run'; f = 2; lift = Math.round(Math.abs(Math.sin((d.hopUntil - t) * Math.PI * 2)) * 6); wag = [-1, 1][Math.floor(t * 14) % 2]; }
    if (pose === 'sit' && !d.held) f = 0;
    d._pl = { x: (z.x || 0) + x, y: (z.y || 0) + y };
    d.face = face;
    k.ellipse(x + 1, y + 1, pose === 'sleep' ? 12 : 10, 2, C.shadow);
    k.blit(sprite(pose, pose === 'sleep' ? 0 : f, pose === 'sleep' ? 0 : wag, happy), x, y - lift, face < 0);
    // Panting, WOOF, sleep Z's and the petting hearts.
    if (!live) { if (z.detail) for (let i = 0; i < 2; i++) { const q = (t * .4 + i * .5) % 1; k.alpha(1 - q, () => k.text('Z', x - s * 4 + Math.round(q * 6) * -s, y - 16 - Math.round(q * 12), C.white)); } return; }
    if (woof && z.detail && !busy) k.textBold('WOOF', x + face * 16, y - 34, C.white, C.ink, 1);
    if (rubbing && t - (d.lastHeart ?? -9) > .3) { d.hearts.push({ t0: t, x: x + face * 6 + (d.hearts.length % 3 - 1) * 5, y: y - 30 }); d.lastHeart = t; }
    d.hearts = d.hearts.filter(h => t - h.t0 < 1.4 && t >= h.t0);
    for (const h of d.hearts) { const q = (t - h.t0) / 1.4; k.blit(heart, h.x + Math.round(Math.sin(q * 6 + h.x) * 2), h.y - Math.round(q * 22), false, 1 - q * q); }
  }

  /* ---------- petting (world coordinates) ---------- */
  function hit(x, y) {
    for (const id in dogs) { const p = dogs[id]._pl; if (p && Math.abs(x - p.x) < 16 && y > p.y - 32 && y < p.y + 5) return dogs[id]; }
    return null;
  }
  const grab = (d, x) => { d.held = true; d.px = x; };
  function stroke(d, x, y) { const p = d._pl; d.px = x; if (p && Math.abs(x - p.x) < 22 && y > p.y - 38 && y < p.y + 8) d.rub = performance.now(); }
  const release = d => { d.held = false; d.px = null; };
  return { draw, hit, grab, stroke, release };
})();
