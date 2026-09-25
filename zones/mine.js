/* Mine · Moria / Diablo hell mine: a black basalt cliff split by a glowing cavern mouth with a horned-skull keystone,
   a lava fall into a lava pool, a Doom tech-hell bunker (grated deck, computer panels, hazard door, slime vat),
   the rail line where chained zombies push ore carts to the crucible forge, the glowing ore face where goblins and
   hollows swing picks under a demon's flaming whip, slave cages and sorted ore heaps. Resource zone: no lead.
   Crews arrive at the top, out of the cavern mouth near (0,-110). Cartoonish: no blood. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.mine = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ROCK = ['#0c0a0b', '#161216', '#1f1a1f', '#2a2329', '#372e34', '#4a3f44', '#625459'];
  const ASH = ['#1c1818', '#2e2826', '#3e3633', '#4c4440', '#5a514c', '#6c625b', '#8a8078'];
  const LAVA = ['#5a140c', '#8e200e', '#c43a12', '#ec6418', '#ff9a2a', '#ffcc55', '#fff2b0'];
  const IRON = ['#111114', '#1e1f24', '#2e3038', '#454854', '#646876', '#8c909c'];
  const TOX = ['#173010', '#285a14', '#3f8e1c', '#62c42a', '#9ef04a', '#d8ff9a'];
  const BONE = ['#8a8070', '#b8ae98', '#dcd4bc', '#f4eedc'];
  const ORE = { fire: [LAVA[1], LAVA[3], LAVA[5]], mithril: ['#3a5a78', '#7aa8d0', '#d8f0ff'], soul: [C.plum0, '#8a4ab0', '#e0a8ff'], iron: [ROCK[3], ROCK[5], ASH[6]] };
  const MOUTH = { x: 0, top: -142, bot: -66, hw: 32 };
  const POOL = { x: 128, y: -44, rx: 40, ry: 12 };
  const FALL = { x: 118, top: -150 };
  const RAIL = [[-6, -92], [-6, -24], [2, -10], [18, -2], [44, 2], [78, 2]];   // cavern mouth → crucible hopper
  const FORGE = { x: 104, y: 30 };
  const FACE = { x: -70, y: -6 };      // the glowing ore face
  const BUNK = { x0: -176, x1: -50, y: -60 };
  const VEINS = [[[-140, -150], [-132, -140], [-136, -130], [-126, -122], [-128, -112]], [[-60, -156], [-54, -146], [-58, -136], [-48, -126]], [[46, -150], [54, -140], [50, -128], [60, -118], [58, -108]], [[150, -120], [158, -110], [154, -98], [164, -88]], [[80, -100], [88, -92], [84, -80], [92, -74]]];

  /* ---------- Local helpers ---------- */
  const skull = (k, x, y) => { k.rect(x - 2, y - 4, 5, 4, BONE[2]); k.rect(x - 1, y, 3, 1, BONE[1]); k.px(x - 2, y - 4, BONE[3]); k.px(x - 1, y - 3, IRON[0]); k.px(x + 1, y - 3, IRON[0]); };
  const chain = (k, x0, y0, x1, y1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); k.px(x, y, i % 2 ? IRON[3] : IRON[5]); if (!(i % 2)) k.px(x, y + 1, IRON[1]); } };
  const sagChain = (k, x0, y0, x1, y1, sag = 4) => { const mx = (x0 + x1) >> 1, my = ((y0 + y1) >> 1) + sag; chain(k, x0, y0, mx, my); chain(k, mx, my, x1, y1); };
  const lump = (k, x, y, t) => { k.rect(x, y, 3, 2, t[1]); k.px(x, y, t[2]); k.px(x + 2, y + 1, t[0]); };
  const oreHeap = (k, x, y, rx, ry, t, seed = 1) => {
    k.ellipse(x + 2, y + 1, rx + 1, 3, C.shadow); k.ellipse(x, y - ry * .45, rx, ry, ROCK[1]); k.ellipse(x - 1, y - ry * .6, rx - 1, ry - 1, t[0]);
    const rnd = P.rng(seed); for (let i = 0; i < rx * 3; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()), lx = Math.round(x + Math.cos(a) * d * (rx - 2) - 1), ly = Math.round(y - ry * .5 + Math.sin(a) * d * (ry - 1) - (1 - d) * ry * .6); k.rect(lx, ly + 1, 4, 2, ROCK[1]); k.rect(lx, ly, 3, 2, t[1]); k.px(lx, ly, t[2]); k.px(lx + 2, ly + 1, t[0]); }
    k.rect(x - rx + 1, y - 1, rx * 2 - 1, 1, ROCK[1]);
  };
  // Black boulder shot through with glowing veins (the ore face).
  const oreRock = (k, x, y, r, seed, vein = ORE.fire) => {
    k.ellipse(x + 3, y + 1, r + 2, 3, C.shadow); const rnd = P.rng(seed);
    k.poly([[x - r, y], [x - r + 2, y - r + 2], [x - 2, y - r - 2], [x + r - 3, y - r + 1], [x + r, y - 3], [x + r - 1, y]], ROCK[3]);
    k.poly([[x - r + 1, y - 1], [x - r + 3, y - r + 3], [x - 2, y - r - 1], [x, y - r + 3], [x - 3, y - 2]], ROCK[5]); k.px(x - 2, y - r - 1, ROCK[6]); k.rect(x - r, y - 1, r * 2, 1, ROCK[1]);
    for (let i = 0; i < 3; i++) { let vx = x - r + 3 + rnd() * r, vy = y - 2 - rnd() * (r - 2); for (let j = 0; j < 4; j++) { const nx = vx + 1 + rnd() * 3, ny = vy - 1 + rnd() * 2; k.line(vx, vy, nx, ny, vein[1]); vx = nx; vy = ny; } k.px(vx, vy, vein[2]); }
  };
  const cage = (k, x, y, w, h) => {
    k.rect(x + 3, y, w + 2, 3, C.shadow); k.rect(x, y - 3, w, 3, IRON[2]); k.rect(x, y - 3, w, 1, IRON[4]); k.rect(x + 1, y - h - 2, w - 2, h - 1, '#120e10');
    for (let i = 0; i < w; i += 4) { k.rect(x + i, y - h, 1, h - 3, IRON[4]); k.rect(x + i + 1, y - h, 1, h - 3, IRON[1]); }
    k.rect(x - 1, y - h - 3, w + 2, 3, IRON[3]); k.rect(x - 1, y - h - 3, w + 2, 1, IRON[5]); k.rect(x, y - (h >> 1) - 2, w, 1, IRON[3]);
    for (let i = 0; i < w; i += 6) k.poly([[x + i, y - h - 3], [x + i + 2, y - h - 3], [x + i + 1, y - h - 7]], IRON[3]);
    k.rect(x + w - 6, y - (h >> 1) - 4, 4, 5, IRON[2]); k.px(x + w - 5, y - (h >> 1) - 3, C.gold2);
  };
  const brazier = (k, x, y) => {
    k.ellipse(x + 2, y + 1, 6, 2, C.shadow); k.line(x - 4, y, x - 1, y - 7, IRON[2]); k.line(x + 4, y, x + 1, y - 7, IRON[1]); k.rect(x, y - 7, 1, 7, IRON[3]);
    k.poly([[x - 6, y - 11], [x + 6, y - 11], [x + 4, y - 7], [x - 4, y - 7]], IRON[2]); k.rect(x - 6, y - 11, 13, 1, IRON[4]); k.rect(x - 5, y - 12, 11, 1, LAVA[0]);
  };
  const flame = (k, x, y, t, s = 1, hue = 0) => {
    const f = Math.floor(t * 12 + x) % 3, A = hue ? ['#b86a10', '#f4b73a', '#ffe08a'] : [LAVA[3], LAVA[4], LAVA[5]];
    k.poly([[x - 3 * s, y], [x - 1, y - (7 + f) * s], [x + 1, y - 4 * s], [x + 2 * s, y - (6 - f) * s], [x + 3 * s, y]], A[0]);
    k.poly([[x - 2 * s, y], [x, y - (5 + f) * s], [x + 2 * s, y]], A[1]); k.px(x, y - 1, A[2]);
  };
  const embers = (k, x, y, t, n, spread = 10, rise = 30, speed = .6) => { for (let i = 0; i < n; i++) { const q = (t * speed + i / n) % 1; k.px(x + Math.sin(i * 2.3 + q * 4) * spread * (.3 + q), y - q * rise, q < .4 ? LAVA[5] : q < .7 ? LAVA[4] : LAVA[2]); } };
  const toxBarrel = (k, x, y) => {
    k.ellipse(x + 6, y + 1, 6, 2, C.shadow); k.rect(x + 1, y - 12, 9, 12, '#56613e'); k.rect(x, y - 10, 11, 8, '#56613e'); k.rect(x + 1, y - 12, 2, 12, '#7a8a58'); k.rect(x + 8, y - 12, 2, 12, '#3a4228');
    k.rect(x, y - 10, 11, 1, IRON[2]); k.rect(x, y - 3, 11, 1, IRON[2]); k.rect(x + 3, y - 8, 5, 4, '#e0b020'); k.px(x + 5, y - 7, IRON[0]); k.px(x + 4, y - 5, IRON[0]); k.px(x + 6, y - 5, IRON[0]);
    k.ellipse(x + 5, y - 12, 4, 1, TOX[3]); k.px(x + 3, y - 13, TOX[5]); k.rect(x + 8, y - 12, 1, 4, TOX[3]);
  };
  const hazard = (k, x, y, w, h) => { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) k.px(x + i, y + j, ((i + j) >> 2) % 2 ? '#e0b020' : IRON[0]); };
  // Position along the rail polyline, u in 0..1.
  const railLen = RAIL.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - RAIL[i][0], p[1] - RAIL[i][1]), 0);
  const along = u => { let d = u * railLen; for (let i = 1; i < RAIL.length; i++) { const [x0, y0] = RAIL[i - 1], [x1, y1] = RAIL[i], L = Math.hypot(x1 - x0, y1 - y0); if (d <= L || i === RAIL.length - 1) { const f = Math.min(1, d / L); return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, x1 >= x0 ? 1 : -1]; } d -= L; } return RAIL[RAIL.length - 1]; };

  /* ---------- Cached moving sprites ---------- */
  const cartSprite = (load, tip = 0) => P.sprite(`mn-hell-cart|${load}|${tip}`, 24, 20, 12, 16, q => {
    q.ellipse(1, 0, 10, 2, C.shadow);
    if (load) { const t = ORE[load]; q.ellipse(0, -11, 8, 4, t[0]); q.ellipse(-1, -12, 7, 3, t[1]); for (let i = 0; i < 7; i++) lump(q, -6 + (i * 5) % 12, -14 + (i % 3), t); }
    q.poly([[-9, -11], [9, -11], [7, -2], [-7, -2]], IRON[2]); q.poly([[-9, -11], [-5, -11], [-4, -2], [-7, -2]], IRON[3]);
    q.rect(-9, -11, 18, 2, IRON[4]); q.rect(-9, -11, 18, 1, IRON[5]); q.rect(-8, -6, 16, 1, IRON[1]); for (const x of [-6, 0, 6]) q.px(x, -9, IRON[5]);
    q.poly([[-3, -8], [3, -8], [2, -4], [-2, -4]], BONE[1]); q.px(-1, -7, IRON[0]); q.px(1, -7, IRON[0]);
    for (const x of [-7, 5]) { q.rect(x, -3, 3, 4, C.ink); q.px(x + 1, -2, IRON[4]); }
  }, C.ink);
  const blitD = (k, s, x, y, off, flip = false) => { k.blit(s, x, y, flip); if (off) k.blit(P.tint(s, '#141c3c'), x, y, flip, .4); };
  const glow = (r, col) => P.sprite(`mn-hell-glow|${r}|${col}`, r * 2 + 2, r * 2 + 2, r + 1, r + 1, q => q.circle(0, 0, r, col), null);
  const poolGlow = P.sprite('mn-hell-poolglow', 90, 30, 45, 15, q => { q.ellipse(0, 0, 40, 12, LAVA[4]); q.ellipse(-4, -2, 26, 7, LAVA[5]); }, null);
  const debris = () => P.sprite('mn-hell-debris', 30, 16, 12, 6, q => { for (let i = 0; i < 9; i++) lump(q, (i * 7) % 26 - 10, (i * 5) % 12 - 4, i % 3 ? ORE.fire : ORE.iron); }, null);

  return {
    paint(k) {
      /* ---- Cavern floor: scorched black ash with cinders ---- */
      k.rectTex(-210, -165, 420, 320, (x, y) => {
        const h = P.hash(x * 3, y * 5), g = P.hash(Math.floor((x + (y >> 2) * 3) / 5), y >> 2);
        if (Math.abs(x) < 12 && y > 50) return h > .85 ? ASH[5] : g > .5 ? ASH[4] : '#554b46';
        if (h < .05) return ASH[1]; if (h > .975) return ASH[6]; if (h > .965) return LAVA[1];
        return g > .6 ? ASH[2] : g > .25 ? ASH[3] : '#453c38';
      });

      /* ---- Black basalt cliff with red veins ---- */
      const warp = x => x + 400 + Math.round(Math.sin(x * .23) * 3 + Math.sin(x * .07) * 2), colOf = x => Math.floor(warp(x) / 10);
      const faceBot = x => -60 + Math.round(Math.sin(x * .06 + 2) * 4 + Math.sin(x * .19) * 2) - (Math.abs(x) < 50 ? 0 : 4);
      const face = [[-210, -170], [210, -170]]; for (let x = 210; x >= -210; x -= 3) face.push([x, faceBot(x) + 1]);
      k.polyTex(face, (x, y) => {
        const c = colOf(x), u = warp(x) % 10, hh = P.hash(x, y), band = Math.floor((y + 200 + P.hash(c, 3) * 12) / 13);
        let col = [ROCK[2], ROCK[3], ROCK[2], ROCK[4]][(band + c) % 4];
        if (u === 9) return ROCK[0]; if (u === 8) col = ROCK[1]; else if (u < 2) col = S(col, .25);
        if ((y + 200 + Math.floor(P.hash(c, 3) * 12)) % 13 === 0) col = ROCK[1];
        if (hh > .992) return LAVA[3]; if (hh > .985) return LAVA[1];
        const low = faceBot(x) - y; if (low < 6) col = S(col, -.1 * (6 - low));
        return col;
      });
      // Glowing veins in the rock (pulsed in animate) and scree at its foot.
      for (const v of VEINS) { k.path(v, ROCK[0], 2); k.path(v, LAVA[1], 1); }
      for (let i = 0; i < 40; i++) { const x = -196 + i * 10 + P.hash(i, 5) * 4; if (Math.abs(x) < MOUTH.hw + 6 || Math.abs(x - FALL.x) < 14) continue; const y = faceBot(x) + 2 + P.hash(i, 6) * 4; k.poly([[x - 3, y], [x - 1, y - 3], [x + 2, y - 2], [x + 3, y]], ROCK[4]); k.px(x - 1, y - 3, ROCK[6]); k.rect(x - 3, y, 7, 1, ROCK[0]); }

      /* ---- Cavern mouth: an arch with carved pillars and a horned demon-skull keystone ---- */
      const { hw, top, bot } = MOUTH, arch = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * i / 20; arch.push([Math.round(-Math.cos(a) * hw), Math.round(top + 24 - Math.sin(a) * 24)]); } arch.push([hw, bot], [-hw, bot]);
      k.poly(arch.map(([x, y]) => [x - 6, y - 4]).concat([[hw + 6, bot], [-hw - 6, bot]]).map(p => p), ROCK[0]);
      k.polyTex(arch, (x, y) => { const d = (y - top) / (bot - top), cx = Math.abs(x) / hw; if (cx > .86 - d * .1) return ROCK[1]; if (d < .35) return '#2a0c08'; if (d < .55) return (x + y) & 1 ? '#4a1408' : '#3a1008'; return y > bot - 30 && Math.abs(x) < 16 ? ((y & 3) ? '#5a2a1a' : '#4a2016') : ((x + y) & 1 ? '#6a1c0a' : '#5a180a'); });
      k.ellipse(0, top + 40, 18, 10, '#8a2c0e'); k.ellipse(0, top + 42, 10, 6, '#b8400f');
      // Stairs down out of the deep, rails running up into the glow.
      for (let y = bot - 26; y < bot; y += 4) { k.rect(-15, y, 30, 1, '#2a120c'); k.rect(-15, y + 1, 30, 1, '#6a3a26'); }
      for (const [x, s] of [[-hw - 10, -1], [hw + 1, 1]]) {
        k.rect(x, top + 8, 9, bot - top - 8, ROCK[4]); k.rect(x, top + 8, 2, bot - top - 8, ROCK[6]); k.rect(x + 7, top + 8, 2, bot - top - 8, ROCK[1]);
        for (let y = top + 16; y < bot - 4; y += 10) { k.rect(x + 2, y, 5, 1, ROCK[2]); k.px(x + 4, y + 4, LAVA[2]); }
        k.rect(x - 2, bot - 6, 13, 6, ROCK[3]); k.rect(x - 2, bot - 6, 13, 1, ROCK[6]); k.rect(x - 2, top + 4, 13, 5, ROCK[3]); k.rect(x - 2, top + 4, 13, 1, ROCK[6]);
      }
      // Keystone skull with horns.
      { const x = 0, y = top - 2; k.poly([[x - 9, y + 2], [x - 16, y - 10], [x - 12, y - 1]], BONE[1]); k.poly([[x + 9, y + 2], [x + 16, y - 10], [x + 12, y - 1]], BONE[0]);
        k.rect(x - 8, y - 6, 17, 12, BONE[2]); k.rect(x - 8, y - 6, 17, 2, BONE[3]); k.rect(x - 6, y + 6, 13, 3, BONE[1]); k.rect(x - 6, y - 1, 5, 4, ROCK[0]); k.rect(x + 2, y - 1, 5, 4, ROCK[0]); k.px(x, y + 3, ROCK[0]); for (let i = -5; i <= 5; i += 2) k.px(x + i, y + 7, ROCK[1]); k.rect(x + 8, y - 4, 1, 10, BONE[0]); }

      /* ---- Lava fall and pool (east) ---- */
      k.poly([[FALL.x - 10, -170], [FALL.x + 12, -170], [FALL.x + 9, POOL.y - 6], [FALL.x - 8, POOL.y - 6]], ROCK[0]);
      k.rect(FALL.x - 6, -170, 13, POOL.y - 4 + 170, LAVA[2]); k.rect(FALL.x - 6, -170, 3, POOL.y + 166, LAVA[4]); k.rect(FALL.x + 4, -170, 3, POOL.y + 166, LAVA[1]);
      k.ellipse(POOL.x + 3, POOL.y + 3, POOL.rx + 5, POOL.ry + 4, C.shadow); k.ellipse(POOL.x, POOL.y, POOL.rx + 4, POOL.ry + 3, ROCK[1]); k.ellipse(POOL.x, POOL.y - 1, POOL.rx + 3, POOL.ry + 2, ROCK[4]);
      k.ellipse(POOL.x, POOL.y, POOL.rx, POOL.ry, LAVA[1]); k.ellipse(POOL.x - 3, POOL.y - 1, POOL.rx - 6, POOL.ry - 3, LAVA[2]); k.ditherEllipse(POOL.x - 4, POOL.y - 2, POOL.rx - 12, POOL.ry - 5, LAVA[3], 0);
      for (let i = 0; i < 7; i++) { const x = POOL.x - 30 + i * 10, y = POOL.y - 2 + (i % 3) * 3; k.ellipse(x, y, 3, 1, LAVA[0]); }
      // Lava channel from the pool down to the crucible forge.
      k.line(POOL.x - 18, POOL.y + 12, FORGE.x + 12, FORGE.y - 20, ROCK[0], 6); k.line(POOL.x - 18, POOL.y + 12, FORGE.x + 12, FORGE.y - 20, LAVA[2], 3); k.line(POOL.x - 19, POOL.y + 12, FORGE.x + 11, FORGE.y - 20, LAVA[4], 1);

      /* ---- Doom tech-hell bunker (west): grated deck, blast door, computer panels, pipes, slime vat ---- */
      const b0 = BUNK.x0, b1 = BUNK.x1, by = BUNK.y;
      k.rect(b0 + 10, by - 44, 100, 44, IRON[1]); k.rect(b0 + 10, by - 44, 100, 2, IRON[3]);
      for (let x = b0 + 12; x < b0 + 110; x += 12) { k.rect(x, by - 42, 1, 42, IRON[0]); k.rect(x + 1, by - 42, 1, 42, IRON[3]); }
      for (const y of [by - 30, by - 16]) { k.rect(b0 + 10, y, 100, 1, IRON[0]); k.rect(b0 + 10, y + 1, 100, 1, IRON[2]); }
      // Blast door with hazard stripes (its status light is animated).
      const dx = b0 + 48; k.rect(dx - 2, by - 38, 30, 38, IRON[3]); k.rect(dx, by - 36, 26, 36, IRON[2]); k.rect(dx + 12, by - 36, 2, 36, IRON[0]); hazard(k, dx - 2, by - 42, 30, 4); hazard(k, dx, by - 6, 26, 3);
      k.rect(dx + 2, by - 30, 9, 4, IRON[4]); k.rect(dx + 15, by - 30, 9, 4, IRON[4]); k.rect(dx + 4, by - 20, 5, 8, IRON[1]); k.rect(dx + 17, by - 20, 5, 8, IRON[1]);
      // Computer panels on both sides (screens animate).
      for (const px of [b0 + 16, b0 + 30, b0 + 82, b0 + 96]) { k.rect(px, by - 26, 12, 20, IRON[3]); k.rect(px, by - 26, 12, 1, IRON[5]); k.rect(px + 1, by - 24, 10, 7, IRON[0]); for (let i = 0; i < 3; i++) k.px(px + 2 + i * 3, by - 14, [C.error, C.working, C.gold2][i]); k.rect(px + 1, by - 11, 10, 3, IRON[2]); k.rect(px - 1, by - 6, 14, 6, IRON[2]); k.rect(px - 1, by - 6, 14, 1, IRON[4]); }
      // Pipes into the rock with valves.
      k.rect(b0 + 8, by - 52, 104, 4, IRON[3]); k.rect(b0 + 8, by - 52, 104, 1, IRON[5]); k.rect(b0 + 8, by - 49, 104, 1, IRON[1]); for (const x of [b0 + 20, b0 + 70, b0 + 104]) { k.rect(x, by - 54, 4, 8, IRON[2]); k.circle(x + 2, by - 56, 2, C.red1); }
      k.rect(b0 + 106, by - 52, 4, 30, IRON[3]); k.rect(b0 + 106, by - 52, 1, 30, IRON[5]);
      // Grated deck in front.
      k.rect(b0, by, b1 - b0, 18, IRON[1]); for (let x = b0; x < b1; x += 3) k.rect(x, by + 1, 1, 16, IRON[3]); for (let y = by + 2; y < by + 18; y += 4) k.rect(b0, y, b1 - b0, 1, IRON[2]);
      k.rect(b0, by, b1 - b0, 1, IRON[5]); k.rect(b0, by + 18, b1 - b0, 2, IRON[0]); hazard(k, b0, by + 16, b1 - b0, 2);
      // Slime vat with pipes, and exploding barrels.
      { const vx = b0 + 6, vy = by + 44; k.ellipse(vx + 12, vy + 1, 16, 3, C.shadow); k.rect(vx, vy - 16, 24, 16, IRON[3]); k.rect(vx, vy - 16, 3, 16, IRON[5]); k.rect(vx + 21, vy - 16, 3, 16, IRON[1]); k.ellipse(vx + 12, vy - 16, 12, 3, TOX[2]); k.ellipse(vx + 11, vy - 17, 9, 2, TOX[3]); k.rect(vx, vy - 10, 24, 2, IRON[1]); hazard(k, vx + 4, vy - 7, 16, 3); k.line(vx + 22, vy - 16, vx + 28, vy - 30, IRON[3], 2); }
      toxBarrel(k, b0 + 40, by + 40); toxBarrel(k, b0 + 52, by + 44); toxBarrel(k, b0 + 46, by + 32);
      k.ellipse(b0 + 50, by + 50, 12, 3, TOX[1]); k.ellipse(b0 + 49, by + 49, 9, 2, TOX[3]); k.px(b0 + 44, by + 49, TOX[5]);

      /* ---- Rails from the mouth to the crucible hopper ---- */
      for (let i = 1; i < RAIL.length; i++) { const [x0, y0] = RAIL[i - 1], [x1, y1] = RAIL[i], n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 5); for (let j = 0; j <= n; j++) { const x = x0 + (x1 - x0) * j / n, y = y0 + (y1 - y0) * j / n, vert = Math.abs(y1 - y0) > Math.abs(x1 - x0); if (vert) k.rect(x - 9, y, 19, 2, '#3a2418'); else k.rect(x, y - 7, 2, 15, '#3a2418'); } }
      for (const off of [-6, 6]) { const pts = RAIL.map(([x, y], i) => { const [ax, ay] = RAIL[Math.max(0, i - 1)], [bx, by2] = RAIL[Math.min(RAIL.length - 1, i + 1)], dx2 = bx - ax, dy2 = by2 - ay, L = Math.hypot(dx2, dy2) || 1; return [x - dy2 / L * off, y + dx2 / L * off]; }); k.path(pts, IRON[3], 2); k.path(pts.map(([x, y]) => [x, y - 1]), IRON[5], 1); }

      /* ---- Crucible forge (the Moria furnace) ---- */
      { const x = FORGE.x, y = FORGE.y; k.ellipse(x + 4, y + 2, 28, 5, C.shadow);
        k.rect(x - 22, y - 12, 44, 12, ROCK[3]); k.rect(x - 22, y - 12, 44, 2, ROCK[5]); for (let i = 0; i < 44; i += 6) k.rect(x - 22 + i, y - 10, 1, 10, ROCK[1]);
        k.poly([[x - 16, y - 12], [x + 16, y - 12], [x + 12, y - 32], [x - 12, y - 32]], IRON[2]); k.poly([[x - 16, y - 12], [x - 10, y - 12], [x - 8, y - 32], [x - 12, y - 32]], IRON[4]);
        k.rect(x - 14, y - 34, 28, 3, IRON[3]); k.rect(x - 14, y - 34, 28, 1, IRON[5]); k.ellipse(x, y - 34, 12, 3, LAVA[3]); k.ellipse(x - 2, y - 35, 7, 1, LAVA[5]);
        k.rect(x - 6, y - 22, 12, 7, IRON[0]); k.rect(x - 5, y - 21, 10, 5, LAVA[2]);
        // Hopper where the carts tip, and a spout pouring into ingot moulds.
        k.poly([[x - 32, y - 30], [x - 18, y - 30], [x - 20, y - 22], [x - 30, y - 22]], IRON[3]); k.rect(x - 32, y - 30, 14, 1, IRON[5]);
        k.rect(x + 16, y - 20, 8, 3, IRON[3]); for (let i = 0; i < 4; i++) { k.rect(x + 18 + i * 7, y + 6, 6, 3, IRON[1]); k.rect(x + 19 + i * 7, y + 7, 4, 1, i < 2 ? LAVA[3] : ORE.mithril[1]); } }

      /* ---- The ore face: black boulders with glowing veins (centre-west) ---- */
      for (const [x, y, r, s, v] of [[FACE.x - 20, FACE.y - 10, 12, 1, 'fire'], [FACE.x + 6, FACE.y - 16, 14, 2, 'mithril'], [FACE.x + 30, FACE.y - 8, 10, 3, 'fire'], [FACE.x - 36, FACE.y + 6, 9, 4, 'soul'], [FACE.x + 10, FACE.y + 4, 8, 5, 'fire']]) oreRock(k, x, y, r, s, ORE[v]);
      for (let i = 0; i < 14; i++) lump(k, FACE.x - 30 + P.hash(i, 3) * 60, FACE.y + 10 + P.hash(i, 4) * 12, i % 3 ? ORE.iron : ORE.fire);
      // Picks and a wheelbarrow of rubble.
      for (const [x, y] of [[FACE.x + 44, FACE.y + 14], [FACE.x - 50, FACE.y + 18]]) { k.line(x, y, x + 6, y - 10, C.wood2); k.line(x + 2, y - 11, x + 10, y - 8, IRON[4]); }

      /* ---- Slave cages and chain posts (south-west) ---- */
      k.rect(-150, 64, 92, 66, ASH[2]); k.dither(-150, 64, 92, 66, ASH[1], 1);
      cage(k, -146, 100, 30, 26); cage(k, -110, 96, 24, 22);
      for (const [x, y] of [[-140, 126], [-104, 128], [-72, 124]]) { k.rect(x, y - 12, 3, 12, IRON[2]); k.rect(x, y - 12, 1, 12, IRON[4]); k.rect(x - 1, y - 13, 5, 2, IRON[4]); sagChain(k, x + 3, y - 8, x + 12, y, 2); k.ring(x + 13, y, 2, 1, IRON[4]); }
      for (let i = 0; i < 8; i++) { const x = -78 + (i % 3) * 4, y = 84 - Math.floor(i / 3) * 2; k.line(x, y, x + 5, y - 1, BONE[1 + (i % 3)]); } skull(k, -72, 78); skull(k, -80, 76);
      k.rect(-128, 66, 30, 5, IRON[2]); k.rect(-127, 67, 28, 2, '#6a645a');
      for (const [x, y] of [[-154, 60], [-60, 60]]) { k.rect(x, y - 30, 3, 30, IRON[2]); k.rect(x, y - 30, 1, 30, IRON[4]); skull(k, x + 1, y - 31); }
      sagChain(k, -151, 36, -60, 36, 6);

      /* ---- Sorted ore heaps, crates and barrels (south-east) ---- */
      oreHeap(k, 48, 96, 12, 8, ORE.fire, 7); oreHeap(k, 78, 104, 11, 7, ORE.mithril, 8); oreHeap(k, 108, 98, 10, 7, ORE.soul, 9); oreHeap(k, 136, 108, 12, 7, ORE.iron, 10);
      for (let i = 0; i < 5; i++) { const x = 40 + i * 24; k.rect(x, 110, 2, 18, IRON[2]); k.px(x, 110, IRON[5]); }
      k.rect(40, 116, 98, 2, IRON[3]);
      toxBarrel(k, 144, 76); toxBarrel(k, 154, 82); toxBarrel(k, 132, 80);
      for (const [x, y] of [[30, 130], [44, 134]]) { k.rect(x, y - 10, 12, 10, IRON[2]); k.rect(x, y - 10, 12, 1, IRON[4]); hazard(k, x + 1, y - 6, 10, 2); }
      Props.sign(k, 20, 142, 'MINE', '#3a2622');
      brazier(k, -36, -54); brazier(k, 36, -54); brazier(k, -30, 56); brazier(k, 30, 60); brazier(k, 150, 20);
      skull(k, -46, 20); skull(k, 60, 40); skull(k, 20, -30);
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error', idle = state === 'idle';
      const W = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o });
      // Workers flinch for a moment after their overseer's whip cracks (same phase as the overseer).
      const crack = ph => (window.AgentCharacters?.crackAge ? AgentCharacters.crackAge(t, { phase: ph }) : 9) < .5;
      // Outside 'working' the crew sprite freezes walks; scattering runners are drawn as 'working' walkers.
      const R = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o, state: 'working' });
      const heat = run ? 1 : err ? 1.3 : live ? .5 : .15;

      /* Cavern glow, rock veins and the keystone skull's eyes. */
      k.alpha(heat * (.3 + .1 * Math.sin(t * 3)), () => k.blit(glow(20, LAVA[4]), 0, MOUTH.top + 42));
      for (let j = 0; j < VEINS.length; j++) k.alpha(heat * (.5 + .5 * Math.sin(t * 1.6 + j * 1.3)), () => k.path(VEINS[j], LAVA[4], 1));
      if (live) { const e = err ? (Math.floor(t * 4) % 2 ? C.error : LAVA[1]) : LAVA[4]; k.rect(-5, MOUTH.top - 2, 3, 2, e); k.rect(3, MOUTH.top - 2, 3, 2, e); }
      if (live) embers(k, 0, MOUTH.top + 50, t, run ? 8 : 3, 14, 40, .4);

      /* Lava fall streaks and the pool: bubbling, glowing, erupting on error. */
      if (live) {
        const sp = run || err ? 70 : 30;
        for (let i = 0; i < 6; i++) { const y = -160 + ((t * sp + i * 19) % (POOL.y + 156)), x = FALL.x - 5 + (i * 5) % 11; k.rect(x, y, 2, 6, i % 2 ? LAVA[5] : LAVA[4]); }
        for (let i = 0; i < 5; i++) { const q = (t * .9 + i / 5) % 1, x = POOL.x - 28 + i * 13, y = POOL.y - 1 + (i % 2) * 3; if (q < .7) k.circle(x, y, 1 + Math.round(q * 2), LAVA[4]); else { k.px(x - 2, y - 2, LAVA[5]); k.px(x + 2, y - 2, LAVA[5]); } }
        k.alpha(heat * (.35 + .1 * Math.sin(t * 4)), () => k.blit(poolGlow, POOL.x, POOL.y));
        k.alpha(.15 + .05 * Math.sin(t * 2), () => k.blit(glow(14, LAVA[4]), FALL.x, POOL.y - 8));
        for (let i = 0; i < 4; i++) { const q = (t * .6 + i / 4) % 1; k.px(POOL.x - 18 + (FORGE.x + 12 - POOL.x + 18) * q, POOL.y + 12 + (FORGE.y - 20 - POOL.y - 12) * q, LAVA[5]); }
        embers(k, POOL.x, POOL.y - 6, t, run ? 8 : 4, 30, 40, .35);
      }
      if (err) {
        for (let i = 0; i < 6; i++) { const q = (t * .9 + i / 6) % 1, x = POOL.x + Math.sin(i * 2.4) * (8 + q * 40), y = POOL.y - Math.sin(q * Math.PI) * 40; k.circle(x, y, 2, q < .5 ? LAVA[5] : LAVA[3]); }
        Props.smoke(k, POOL.x - 6, POOL.y - 14, t * 1.4, 7, '#141012'); Props.smoke(k, POOL.x + 18, POOL.y - 10, t * 1.1 + .4, 5, '#241e1e');
      } else if (run) Props.smoke(k, FORGE.x, FORGE.y - 38, t, 5, '#3a3434');
      else if (live) Props.smoke(k, FORGE.x, FORGE.y - 38, t * .4, 2, '#4a4442');

      /* Crucible: molten top, glowing mouth and pouring spout. */
      if (live) {
        k.alpha(heat * (.6 + .2 * Math.sin(t * 5)), () => { k.ellipse(FORGE.x, FORGE.y - 34, 11, 2, LAVA[5]); k.rect(FORGE.x - 5, FORGE.y - 21, 10, 5, LAVA[4]); });
        if (run) { for (let i = 0; i < 3; i++) k.px(FORGE.x + 22, FORGE.y - 16 + ((t * 20 + i * 4) % 20), LAVA[5]); flame(k, FORGE.x, FORGE.y - 36, t, 1); }
      }

      /* Doom bunker: computer screens scroll, the blast-door light shows the state, alarm on error. */
      const b0 = BUNK.x0, by = BUNK.y;
      for (const [i, px] of [b0 + 16, b0 + 30, b0 + 82, b0 + 96].entries()) {
        const on = live && !(idle && i % 2), scr = err ? (Math.floor(t * 4 + i) % 2 ? C.error : '#3a0a0a') : wait ? C.waiting : TOX[3];
        if (on) { k.rect(px + 1, by - 24, 10, 7, err ? '#2a0606' : '#06140a'); for (let r = 0; r < 3; r++) { const w = 2 + Math.floor(P.hash(i, r + Math.floor(t * (run ? 3 : .5))) * 7); k.rect(px + 2, by - 23 + r * 2, w, 1, scr); } }
      }
      const sig = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      const dx = b0 + 48; k.rect(dx + 10, by - 48, 7, 5, C.ink); k.rect(dx + 11, by - 47, 5, 3, sig); if (live) k.px(dx + 11, by - 47, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(dx + 13, by - 45, 9, sig));
      if (err) { const f = Math.floor(t * 4) % 2; for (const x of [b0 + 20, b0 + 70, b0 + 104]) k.circle(x + 2, by - 56, 2, f ? C.error : C.red0); }
      // Slime vat bubbles.
      if (live && z.detail) for (let i = 0; i < 3; i++) { const q = (t * .8 + i / 3) % 1, bx = b0 + 12 + i * 6, bvy = by + 27; if (q < .7) k.px(bx, bvy - Math.round(q * 3), TOX[5]); }
      if (live) k.alpha(.2 + .08 * Math.sin(t * 2), () => k.ellipse(b0 + 18, by + 28, 14, 4, TOX[4]));

      /* Braziers. */
      for (const [x, y] of [[-36, -66], [36, -66], [-30, 44], [30, 48], [150, 8]]) if (live) { flame(k, x, y, t, err ? 1.4 : 1, wait && x === 30 ? 1 : 0); if (z.detail && run) embers(k, x, y - 4, t, 3, 3, 14); }
      if (wait) { flame(k, 30, 48, t, 2, 1); k.alpha(.25 + .1 * Math.sin(t * 5), () => k.circle(30, 40, 11, C.waiting)); Props.banner(k, 40, 56, C.waiting, t, 10); }

      /* Mine carts on the rail. Working: out of the cavern loaded, tipped at the hopper, back empty. */
      const cp = (t / 14) % 1; let u, load;
      if (run) { if (cp < .45) { u = cp / .45; load = 'fire'; } else if (cp < .55) { u = 1; load = cp < .5 ? 'fire' : ''; } else { u = 1 - (cp - .55) / .45; load = ''; } }
      else { u = .55; load = wait ? 'fire' : ''; }
      const [cx, cy, cdir] = along(u);
      if (!err) {
        blitD(k, cartSprite(load), cx, cy + 3, !live);
        if (run && cp >= .45 && cp < .52 && z.detail) for (let i = 0; i < 5; i++) { const q = (t * 3 + i / 5) % 1; lump(k, cx + 6 + i * 2, cy - 8 + q * 10, ORE.fire); }
        if (cy < MOUTH.bot - 8) k.alpha(Math.min(.8, (MOUTH.bot - 8 - cy) / 16), () => k.rect(-14, cy - 14, 28, 18, '#3a1008'));
      } else { k.blit(cartSprite('fire'), 26, 22, true); k.blit(debris(), 16, 14); for (let i = 0; i < 3; i++) Props.smoke(k, 22 + i * 6, 10, t + i * .3, 2, '#2a2424'); }
      if (wait) { k.blit(cartSprite('mithril'), -6, -30); k.blit(cartSprite('soul'), -6, -48); }

      /* Crews. Workers: goblin, hollow, zombie, orc. Overseers: demon (flaming whip); a cacodemon hovers over the pool. */
      if (run) {
        // Chained zombies push the cart; on the way back they trudge behind it.
        const pu = Math.max(0, Math.min(1, u - (cp < .5 ? .12 : -.12))), [zx, zy, zd] = along(pu);
        W(zx, zy + 4, 'zombie', { anim: 'chained', facing: cp < .5 ? zd : -zd, phase: .2 }); chain(k, zx, zy - 6, cx, cy - 4);
        const pu2 = Math.max(0, Math.min(1, pu - (cp < .5 ? .08 : -.08))), [zx2, zy2, zd2] = along(pu2); W(zx2 + 3, zy2 + 5, 'zombie', { anim: 'chained', facing: cp < .5 ? zd2 : -zd2, phase: .6, look: 1 }); chain(k, zx2, zy2 - 6, zx, zy - 6);
        // Picks swing at the ore face under the demon's flaming whip.
        W(FACE.x - 50, FACE.y + 30, 'demon', { anim: 'whip', lash: 28, facing: 1, phase: 0 });
        W(FACE.x - 22, FACE.y + 30, 'goblin', { anim: crack(0) ? 'cower' : 'work', tool: 'pick', phase: .1, speed: 5 });
        W(FACE.x + 8, FACE.y + 22, 'hollow', { anim: 'work', tool: 'pick', facing: -1, phase: .5, speed: 4 });
        W(FACE.x + 34, FACE.y + 16, 'goblin', { anim: 'work', tool: 'pick', facing: -1, phase: .8, speed: 5, look: 1 });
        if (z.detail) for (let i = 0; i < 4; i++) { const q = (t * 2 + i / 4) % 1; k.px(FACE.x - 14 + i * 12 + q * 6, FACE.y + 6 - Math.sin(q * 3) * 8 + q * 8, i % 2 ? LAVA[4] : ORE.mithril[2]); }
        // An orc hauls ore from the face to the sorted heaps; a hollow sorts under a second demon.
        const hp = (t * .08) % 1, back = hp > .5, hq = back ? (1 - hp) * 2 : hp * 2;
        W(FACE.x + 30 + hq * 70, FACE.y + 30 + hq * 60, 'orc', { anim: back ? 'walk' : 'carry', carry: back ? '' : 'ore', facing: back ? -1 : 1, phase: .3 });
        W(150, 60, 'demon', { anim: 'whip', lash: 30, facing: -1, phase: .5, look: 1 });
        W(120, 70, 'hollow', { anim: crack(.5) ? 'cower' : 'work', tool: 'hammer', phase: .6, speed: 4, look: 1 });
        W(-60, BUNK.y + 22, 'imp', { anim: 'work', facing: -1, phase: .4 });
        // Prisoners rattle the cage bars.
        W(-132, 98, 'goblin', { anim: 'cower', phase: .2, look: 2 }); W(-98, 94, 'orc', { anim: 'idle', phase: .7, look: 1 });
        W(POOL.x - 50, POOL.y + 6 + Math.round(Math.sin(t * 1.3) * 3), 'cacodemon', { anim: 'idle', facing: -1, phase: .3 });
      } else if (idle) {
        W(FACE.x - 50, FACE.y + 30, 'demon', { anim: 'idle', tool: 'spear', facing: 1, phase: 0 }); W(150, 60, 'demon', { anim: 'idle', tool: 'spear', facing: -1, phase: .5, look: 1 });
        for (const [x, y, kind, ph] of [[-126, 126, 'goblin', .1], [-90, 128, 'zombie', .4], [-58, 124, 'hollow', .7], [FACE.x + 8, FACE.y + 22, 'hollow', .5], [FACE.x + 34, FACE.y + 16, 'goblin', .8], [120, 70, 'hollow', .6], [cx + 16, cy + 6, 'zombie', .2]]) W(x, y, kind, { anim: 'sit', chains: true, phase: ph });
        W(-132, 98, 'goblin', { anim: 'sit', phase: .2, look: 2 }); W(-98, 94, 'orc', { anim: 'sit', phase: .7, look: 1 });
        W(POOL.x - 50, POOL.y + 6 + Math.round(Math.sin(t * .8) * 2), 'cacodemon', { anim: 'idle', facing: -1, phase: .3 });
        if (z.detail) for (let i = 0; i < 2; i++) { const q = (t * .15 + i / 2) % 1; Props.bird(k, -150 + q * 300, -150 + i * 10 + Math.sin(t * 2 + i) * 3, t + i, '#1a1416'); }
      } else if (wait) {
        W(FACE.x - 50, FACE.y + 30, 'demon', { anim: 'idle', facing: 1, phase: 0 }); W(150, 60, 'demon', { anim: 'idle', facing: -1, phase: .5, look: 1 });
        W(FACE.x - 22, FACE.y + 30, 'goblin', { anim: 'idle', tool: 'pick', phase: .1 }); W(FACE.x + 8, FACE.y + 22, 'hollow', { anim: 'idle', tool: 'pick', facing: -1, phase: .5 }); W(FACE.x + 34, FACE.y + 16, 'goblin', { anim: 'idle', tool: 'pick', facing: -1, phase: .8, look: 1 });
        W(cx - 14, cy + 6, 'zombie', { anim: 'idle', phase: .2 }); W(cx - 26, cy + 4, 'zombie', { anim: 'idle', phase: .6, look: 1 }); W(120, 70, 'hollow', { anim: 'idle', phase: .6, look: 1 }); W(60, 80, 'orc', { anim: 'idle', carry: 'ore', phase: .3 });
        W(-132, 98, 'goblin', { anim: 'idle', phase: .2, look: 2 }); W(-98, 94, 'orc', { anim: 'idle', phase: .7, look: 1 });
        W(POOL.x - 50, POOL.y + 6, 'cacodemon', { anim: 'idle', facing: -1, phase: .3 });
      } else if (err) {
        // Derailed cart, lava eruption, alarms: workers scatter; the demons lash at nothing.
        const sc = [[FACE.x - 22, FACE.y + 30, -1, 'goblin'], [FACE.x + 8, FACE.y + 22, 1, 'hollow'], [FACE.x + 34, FACE.y + 16, 1, 'goblin'], [40, 30, 1, 'zombie'], [10, 24, -1, 'zombie'], [120, 70, -1, 'hollow'], [70, 60, 1, 'orc']];
        sc.forEach(([x, y, d, kind], i) => { const q = (t * .25 + i * .17) % 1, r = Math.sin(q * Math.PI) * 28; R(x + d * r, y + (i % 2 ? 4 : -3) * Math.sin(q * Math.PI), kind, { anim: 'walk', facing: d * (q < .5 ? 1 : -1), phase: i * .2 }); });
        R(FACE.x - 50, FACE.y + 30, 'demon', { anim: 'whip', lash: 28, facing: 1, phase: 0, speed: 11 }); W(150, 60, 'demon', { anim: 'idle', facing: -1, phase: .5, look: 1 });
        W(-132, 98, 'goblin', { anim: 'cower', phase: .2, look: 2 }); W(-98, 94, 'orc', { anim: 'cower', phase: .7, look: 1 });
        R(POOL.x - 50 + Math.round(Math.sin(t * 2) * 10), POOL.y + 2, 'cacodemon', { anim: 'whip', speed: 10, facing: Math.cos(t * 2) > 0 ? 1 : -1, phase: .3 });
      } else {
        W(FACE.x - 46, FACE.y + 30, 'demon', { phase: 0 }); W(150, 60, 'demon', { facing: -1, phase: .5, look: 1 });
        for (const [x, y, kind, ph] of [[-126, 126, 'goblin', .1], [-90, 128, 'zombie', .4], [-58, 124, 'hollow', .7], [FACE.x + 8, FACE.y + 22, 'hollow', .5], [FACE.x + 34, FACE.y + 16, 'goblin', .8], [120, 70, 'hollow', .6], [cx + 16, cy + 6, 'zombie', .2]]) W(x, y, kind, { phase: ph });
        W(-132, 98, 'goblin', { phase: .2, look: 2 }); W(-98, 94, 'orc', { phase: .7, look: 1 });
        W(POOL.x - 50, POOL.y + 10, 'cacodemon', { facing: -1, phase: .3 });
      }
    }
  };
})();
