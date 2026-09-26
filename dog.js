/* HQ dog: a fluffy Bernese mountain dog that plays on the statue plaza. It runs figure-eights in front of the
   statue, sits and pants, chases its tail and does zoomies with a WOOF. Press and hold on it and move the mouse to
   pet it: it sits, closes its eyes, thumps a back leg and hearts float up. When you let go it hops, then plays on.
   A tennis ball lies on the plaza: hold it and shake it and the dog runs over and sits waiting; throw it (let go
   while moving) and the dog chases it, carries it back to the cursor, drops it there, waits, and goes back to play.
   zones/hq.js calls HQDog.draw from animate (zone-local coordinates); app.js calls the input functions with world
   coordinates. The dog's route clock only runs while it plays, so the route resumes where it left. */
window.HQDog = (() => {
  const P = window.Pixel, C = P.C;
  const B0 = '#101014', B1 = '#1e1e25', B2 = '#30303a', B3 = '#4a4a56';        // black coat: shade → sheen
  const W0 = '#cfcac0', W1 = '#f6f4ee', R1 = '#b8642a', R2 = '#dc8a44';        // white and rust markings
  const NOSE = '#08080a', EYE = '#1a0e08', TONGUE = '#ec7482';
  const dogs = {};                                                             // zone id → dog state
  const get = id => dogs[id] || (dogs[id] = { id, c: 0, last: null, held: false, rub: -1e9, hearts: [], hopUntil: -1, face: 0, mode: 'play', x: null, y: null, ball: null, cur: null, samples: [] });

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
  // Where the ball may go (GKTC zone-local): the plaza, the west campus lawn and the south-east tile, never past
  // the HQ edge into a neighbouring district.
  function clampG(x, y) { x = Math.max(-360, Math.min(290, x)); return [x, Math.max(30, Math.min(x < -40 ? 150 : 310, y))]; }
  const clampL = (x, y, s) => { const [gx, gy] = clampG(s * x, y); return [s * gx, gy]; };
  // Mouth position (from the feet, facing right) per pose, for the ball the dog carries.
  const MOUTH = { run: [15, -14], sit: [12, -18] };
  const ballSprite = f => P.sprite('dog|ball|' + f, 6, 6, 2, 2, q => {
    q.circle(0, 0, 2, '#c8e030'); q.px(-1, -1, '#f0ff90'); q.px(1, 1, '#98b020');
    if (f) { q.px(-2, 0, C.white); q.px(-1, 1, C.white); q.px(0, 2, C.white); } else { q.px(0, -2, C.white); q.px(1, -1, C.white); q.px(2, 0, C.white); }
  });

  function draw(k, z, t, state) {
    const d = get(z.id || z.village || 'hq'), s = z.village === 'daghan' ? -1 : 1, live = state !== 'off';
    d.zx = z.x || 0; d.zy = z.y || 0; d.s = s;
    const b = d.ball || (d.ball = { x: s * -34, y: 112, h: 0, vx: 0, vy: 0, vh: 0, st: 'rest', roll: 0 });
    const rubbing = d.held && performance.now() - d.rub < 250;
    if (d.wasHeld && !d.held) d.hopUntil = t + 1;
    d.wasHeld = d.held;
    const busy = d.held || t < d.hopUntil, dt = d.last === null ? 0 : Math.max(0, Math.min(.1, t - d.last));
    d.last = t;

    /* Ball physics: flight with bounces, then a roll that slows to a stop; the edge of the play area bounces it back. */
    if (b.st === 'fly' || b.st === 'roll') {
      if (b.st === 'fly') {
        b.vh -= 700 * dt; b.h += b.vh * dt;
        if (b.h <= 0) { b.h = 0; if (b.vh < -70) { b.vh = -b.vh * .45; b.vx *= .7; b.vy *= .7; } else { b.vh = 0; b.st = 'roll'; } }
      } else { const sp = Math.hypot(b.vx, b.vy); if (sp < 8) { b.st = 'rest'; b.vx = b.vy = 0; } else { const f = Math.max(0, sp - 260 * dt) / sp; b.vx *= f; b.vy *= f; } }
      const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt, [cx, cy] = clampL(nx, ny, s);
      if (cx !== nx) b.vx = -b.vx * .4; if (cy !== ny) b.vy = -b.vy * .4;
      b.roll += Math.hypot(cx - b.x, cy - b.y); b.x = cx; b.y = cy;
    }

    /* The dog: plays its route, or runs to the shaken ball, chases the throw, brings it back to the cursor and waits. */
    const c0 = d.c, n0 = Math.floor(c0 / 16), ph0 = c0 - n0 * 16, m0 = n0 * 13 + (ph0 >= 13.5 ? 9 + (ph0 - 13.5) * 1.6 : Math.min(ph0, 9));
    const home = route(m0), homeX = s * home[0], homeY = home[1];
    if (d.x == null) { d.x = homeX; d.y = homeY; }
    let pose = 'run', f = Math.floor(t * 14) % 4, face = d.face || s, woof = false, moving = false;
    const goTo = (tx, ty, speed, near = 2) => {
      const dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
      if (Math.abs(dx) > 1) face = dx > 0 ? 1 : -1;
      if (dist <= near) return true;
      const step = Math.min(dist, speed * dt); d.x += dx / dist * step; d.y += dy / dist * step; moving = true; return false;
    };
    if (live && !busy) {
      if (d.mode === 'play') {
        d.c += dt;
        const c = d.c, n = Math.floor(c / 16), ph = c - n * 16;
        let m = n * 13 + Math.min(ph, 9), dx = 0, dy = 0; f = Math.floor(c * 12) % 4;
        if (ph >= 13.5) { m = n * 13 + 9 + (ph - 13.5) * 1.6; f = Math.floor(c * 16) % 4; woof = ph < 14.2; }
        face = heading(m) * s;
        if (ph >= 9 && ph < 11.5) pose = 'sit';
        else if (ph >= 11.5 && ph < 13.5) { const a = (ph - 11.5) * 9; dx = Math.round(Math.cos(a) * 4); dy = Math.round(Math.sin(a) * 2); face = Math.sin(a) > 0 ? 1 : -1; }
        const [rx, ry] = route(m); d.x = s * (rx + dx); d.y = ry + dy;
      } else if (d.mode === 'attend') {
        const [tx, ty] = clampL(b.x, b.y + 36, s);
        if (goTo(tx, ty, 130)) { pose = 'sit'; face = b.x >= d.x ? 1 : -1; woof = Math.floor(t * 1.5) % 3 === 0; }
      } else if (d.mode === 'chase') {
        const side = b.x >= d.x ? 1 : -1;
        if (goTo(b.x - side * MOUTH.run[0], b.y, 160, 3) && b.st !== 'fly') { b.st = 'mouth'; d.mode = 'return'; }
      } else if (d.mode === 'return') {
        const [cx, cy] = d.cur ? clampL(d.cur[0], d.cur[1], s) : [homeX, homeY], side = cx >= d.x ? 1 : -1;
        const [tx, ty] = clampL(cx - side * MOUTH.run[0], cy + 16, s);
        if (goTo(tx, ty, 150, 3)) { b.st = 'rest'; b.x = d.x + face * MOUTH.run[0]; b.y = d.y + 1; b.h = 0; d.mode = 'wait'; d.waitUntil = t + 4; }
      } else if (d.mode === 'wait') {
        pose = 'sit'; if (d.cur) face = d.cur[0] >= d.x ? 1 : -1;
        if (t > d.waitUntil) d.mode = 'rejoin';
      } else if (d.mode === 'rejoin') { if (goTo(homeX, homeY, 90)) d.mode = 'play'; }
      if (d.mode !== 'play' && !moving && pose === 'run') pose = 'sit';
    }
    let x = Math.round(d.x), y = Math.round(d.y);
    let wag = [-1, 0, 1, 0][Math.floor(t * (rubbing || d.mode === 'attend' ? 14 : 7)) % 4], happy = 0, lift = 0;
    if (!live) { pose = 'sleep'; x = s * 118; y = 124; face = -s; }
    else if (d.held) { pose = 'sit'; f = rubbing ? 1 + (Math.floor(t * 10) % 2) : 0; happy = rubbing ? 1 : 0; if (d.px != null) face = d.px < d.zx + x ? -1 : 1; }
    else if (t < d.hopUntil) { pose = 'run'; f = 2; lift = Math.round(Math.abs(Math.sin((d.hopUntil - t) * Math.PI * 2)) * 6); wag = [-1, 1][Math.floor(t * 14) % 2]; }
    if (pose === 'sit' && !d.held) f = 0;
    d._pl = { x: d.zx + x, y: d.zy + y };
    d.face = face;

    /* Draw: the ball on the ground (or in the air, or in the hand) and the dog, in depth order. */
    const ballOnGround = b.st !== 'mouth' && b.st !== 'held';
    const drawBall = () => {
      if (b.st === 'held') { k.blit(ballSprite(0), Math.round(b.x), Math.round(b.y)); return; }
      const bx = Math.round(b.x), by = Math.round(b.y), bh = Math.round(b.h);
      k.alpha(Math.max(.3, 1 - bh / 80), () => k.ellipse(bx + 1, by + 1, 3, 1, C.shadow));
      k.blit(ballSprite(Math.floor(b.roll / 3) % 2), bx, by - 2 - bh);
    };
    if (ballOnGround && b.y < y) drawBall();
    k.ellipse(x + 1, y + 1, pose === 'sleep' ? 12 : 10, 2, C.shadow);
    k.blit(sprite(pose, pose === 'sleep' ? 0 : f, pose === 'sleep' ? 0 : wag, happy), x, y - lift, face < 0);
    if (b.st === 'mouth') { const [mx, my] = MOUTH[pose] || MOUTH.run, dy = pose === 'run' ? RUN[f].dy : 0; b.x = x + face * mx; b.y = y; k.blit(ballSprite(0), x + face * mx, y + my + dy - lift); }
    if (ballOnGround && b.y >= y) drawBall();
    if (b.st === 'held') drawBall();
    // WOOF, sleep Z's and the petting hearts.
    if (!live) { if (z.detail) for (let i = 0; i < 2; i++) { const q = (t * .4 + i * .5) % 1; k.alpha(1 - q, () => k.text('Z', x - s * 4 + Math.round(q * 6) * -s, y - 16 - Math.round(q * 12), C.white)); } return; }
    if (woof && z.detail && !busy) k.textBold('WOOF', x + face * 16, y - 34, C.white, C.ink, 1);
    if (rubbing && t - (d.lastHeart ?? -9) > .3) { d.hearts.push({ t0: t, x: x + face * 6 + (d.hearts.length % 3 - 1) * 5, y: y - 30 }); d.lastHeart = t; }
    d.hearts = d.hearts.filter(h => t - h.t0 < 1.4 && t >= h.t0);
    for (const h of d.hearts) { const q = (t - h.t0) / 1.4; k.blit(heart, h.x + Math.round(Math.sin(q * 6 + h.x) * 2), h.y - Math.round(q * 22), false, 1 - q * q); }
  }

  /* ---------- input (world coordinates) ---------- */
  // The ball comes first (it is small), then the dog. Returns { d, part: 'ball' | 'dog' }.
  function hit(x, y) {
    for (const id in dogs) {
      const d = dogs[id], b = d.ball;
      if (b && (b.st === 'rest' || b.st === 'roll') && Math.hypot(x - (d.zx + b.x), y - (d.zy + b.y - 2 - b.h)) < 8) return { d, part: 'ball' };
    }
    for (const id in dogs) { const p = dogs[id]._pl; if (p && Math.abs(x - p.x) < 16 && y > p.y - 32 && y < p.y + 5) return { d: dogs[id], part: 'dog' }; }
    return null;
  }
  const grab = (d, x) => { d.held = true; d.px = x; };
  function stroke(d, x, y) { const p = d._pl; d.px = x; if (p && Math.abs(x - p.x) < 22 && y > p.y - 38 && y < p.y + 8) d.rub = performance.now(); }
  const release = d => { d.held = false; d.px = null; };
  function cursor(x, y) { for (const id in dogs) { const d = dogs[id]; d.cur = [x - d.zx, y - d.zy]; } }
  // Hold the ball: it follows the cursor. Shaking it (quick back-and-forth) calls the dog, which sits and waits.
  function pickBall(d, x, y) {
    const b = d.ball; b.st = 'held'; b.x = x - d.zx; b.y = y - d.zy; b.h = 0; d.samples = [{ x, y, tm: performance.now() }];
    if (d.mode === 'chase' || d.mode === 'return' || d.mode === 'wait') d.mode = 'rejoin';
  }
  function moveBall(d, x, y) {
    const b = d.ball, now = performance.now(); if (b.st !== 'held') return false;
    b.x = x - d.zx; b.y = y - d.zy; d.cur = [b.x, b.y];
    d.samples.push({ x, y, tm: now }); d.samples = d.samples.filter(p => now - p.tm < 700);
    if (d.mode === 'attend') return false;
    let flips = 0, path = 0, last = 0;
    for (let i = 1; i < d.samples.length; i++) {
      const dx = d.samples[i].x - d.samples[i - 1].x, dy = d.samples[i].y - d.samples[i - 1].y; path += Math.hypot(dx, dy);
      const sg = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) * 2 : Math.sign(dy); if (sg && last && sg !== last) flips++; if (sg) last = sg;
    }
    if (flips >= 2 && path >= 24) { d.mode = 'attend'; return true; }
    return false;
  }
  // Let go: the release speed (last ~120 ms of movement) throws it; a gentle release just drops it.
  function throwBall(d) {
    const b = d.ball, now = performance.now(); if (b.st !== 'held') return false;
    const r = d.samples.filter(p => now - p.tm < 120), a = r[0], z = r[r.length - 1];
    let vx = 0, vy = 0;
    if (a && z && z.tm - a.tm > 8) { vx = (z.x - a.x) / (z.tm - a.tm) * 1000; vy = (z.y - a.y) / (z.tm - a.tm) * 1000; }
    const sp = Math.hypot(vx, vy), cap = Math.min(1, 420 / (sp || 1)) * .8;
    b.vx = vx * cap; b.vy = vy * cap; b.h = 0; b.vh = sp < 60 ? 0 : 140 + Math.min(sp, 420) * .25; b.st = 'fly'; b.roll = 0;
    const thrown = sp >= 60;
    if (thrown || d.mode === 'attend') d.mode = 'chase';
    return thrown;
  }
  return { draw, hit, grab, stroke, release, cursor, pickBall, moveBall, throwBall };
})();
