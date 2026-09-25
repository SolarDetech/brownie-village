/* Bayes · Observatory hill + garage lab: a domed observatory on its walled terrace (top left), a suburban garage lab
   with an open roll-up door (top right), a hacked-together saucer car, a green swirling portal on the lawn and a scrap yard.
   Two fan-art figures (a tall scientist and a nervous kid) commute between the portal and the garage while working. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.bayes = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: 60, y: 86 }, REST = { x: -92, y: 128 };      // lawn between portal and garage; by the histogram bed when off
  const DOME = { x: -120, y: -100, rx: 30, ry: 24 };               // observatory dome centre on the drum cornice
  const ORR = { x: -140, y: 94 };                                  // orrery dais centre
  const ARM = { x: -172, y: -22 };                                 // armillary sphere pedestal
  const ANEMO = { x: -24, y: -124 };                               // anemometer hub
  const PORT = { x: -44, y: 50, gy: 77 };                          // portal centre and its ground line
  const STAB = { x: -80, y: 36 };                                  // portal stabiliser head on a tripod
  const OP = { x: 18, y: -70, w: 84, h: 30 };                      // garage door opening (floor edge at y -41)
  const SAU = { x: 152, y: 8 };                                    // parked saucer car
  const AMB = { x: -78, y: 82 };                                   // amber lamp post by the portal
  const SEAT = [[32, -42], [52, -42]];                             // garage spots: bucket and crate
  const NIGHT = '#2e3870', NIGHT2 = '#1c2244';
  const LIME = '#8cf04a', GOO = '#6fdc3a';

  /* ---------- helpers ---------- */
  const soot = (k, x, y, t, n, col) => { for (let i = 0; i < n; i++) { const q = (t * .5 + i / n) % 1, r = 2 + q * 5, px = x + Math.sin(q * 4 + i * 2) * 4 + q * 8, py = y - q * 28; k.alpha((1 - q) * .9, () => { k.circle(px, py, r, col); k.circle(px - 1, py - 1, Math.max(1, r - 2), S(col, .15)); }); } };
  const gravelTex = (x, y) => { const h = P.hash(x * .7, y * 1.3); return h < .1 ? C.dirt3 : h > .94 ? C.dirt5 : h > .9 ? C.stone3 : C.dirt4; };
  const concTex = (x, y) => { if ((y + 300) % 16 === 0 || (x === 59 && y < -2)) return '#8d8b83'; const h = P.hash(x * .9, y * 1.7); return h < .06 ? '#9c9a91' : h > .95 ? '#c8c6bc' : '#b3b1a7'; };
  const flagTex = base => (x, y) => {
    const r = Math.floor((y + 300) / 6), o = (r % 2) * 5, cx = (x + 300 + o) % 10, cy = (y + 300) % 6;
    if (cy === 0 || cx === 0) return S(base, -.16); if (cy === 1 && cx === 1) return S(base, .22);
    const h = P.hash(Math.floor((x + 300 + o) / 10), r); return h < .22 ? S(base, .09) : h > .86 ? S(base, -.08) : base;
  };
  const planet = (k, x, y, r, c) => { k.circle(x, y, r + 1, C.ink); k.circle(x, y, r, c); k.px(x - 1, y - 1, S(c, .5)); };
  const plus = (k, x, y, c, big) => { k.px(x, y, c); k.px(x - 1, y, c); k.px(x + 1, y, c); k.px(x, y - 1, c); k.px(x, y + 1, c); if (big) { k.px(x - 2, y, c); k.px(x + 2, y, c); k.px(x, y - 2, c); k.px(x, y + 2, c); } };

  /* ---------- portal sprites (cached) ---------- */
  const PAL = {
    g: ['#14521f', '#23872f', '#3fb83a', '#79d93a', '#b8f25a', '#eaffc0'],
    a: ['#6a4210', '#b0741c', '#e0a232', '#7fd23a', '#f7d77a', '#fff4c8'],
    e: ['#2a1418', '#4f7a1c', '#3fb83a', '#c4483a', '#9be04a', '#fff0d0']
  };
  const GLOW = { g: LIME, a: C.waiting, e: C.error };
  const portalSprite = (v, f) => P.sprite(`bz-portal|${v}|${f}`, 48, 64, 24, 32, q => {
    const p = PAL[v], ph = f / 12 * Math.PI * 2, rot = f / 12 * Math.PI * 2 / 3, bump = f / 12 * Math.PI * 2 / 20;
    // Wobbly goo rim.
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2 + bump, w = 1 + .07 * Math.sin(i * 2.7 + ph); q.circle(Math.cos(a) * 16 * w, Math.sin(a) * 24 * w, 2 + (i % 3 === 0 ? 1 : 0), p[0]); }
    q.ellipse(0, 0, 16, 24, p[0]); q.ellipse(0, 0, 15, 23, p[1]); q.ellipse(-1, -1, 12, 19, p[2]); q.ellipse(0, 0, 8, 13, p[3]); q.ellipse(0, 0, 4, 7, p[4]);
    // Three spiral arms with a darker counter-arm between them.
    for (let arm = 0; arm < 3; arm++) for (let s = .12; s < 1; s += .012) {
      const a = rot + arm * 2.094 + s * 6.2;
      q.rect(Math.cos(a) * s * 14.5, Math.sin(a) * s * 22, 2, 1, s > .72 ? p[3] : s > .38 ? p[4] : p[5]);
      const b = a + 1.05; q.px(Math.cos(b) * s * 14.5, Math.sin(b) * s * 22, s > .5 ? p[1] : p[2]);
    }
    q.ellipse(0, 0, 2, 3, p[5]); q.px(0, 0, '#ffffff'); q.px(0, -1, '#ffffff');
    // Lit upper-left rim.
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * .06); q.px(Math.cos(a) * 15, Math.sin(a) * 23, p[4]); }
  }, v === 'g' ? '#0b2e12' : v === 'a' ? '#3a2408' : '#140a0c');
  const haloSprite = v => P.sprite(`bz-halo|${v}`, 64, 80, 32, 40, q => { const c = GLOW[v]; q.ellipse(0, 0, 30, 38, S(c, -.25)); q.ellipse(0, 0, 25, 33, c); q.ellipse(0, 0, 20, 28, S(c, .35)); }, null);
  const ringSprite = () => P.sprite('bz-ring', 38, 54, 19, 27, q => { q.ring(0, 0, 16, 24, '#2f8a34'); q.ring(0, 0, 15, 23, LIME); q.ring(0, 0, 11, 18, '#2f8a34'); q.ellipse(0, 0, 1, 2, '#b8f25a'); }, null);

  /* ---------- the two fan-art figures (cached, facing right, feet at 0,0) ---------- */
  const INK = C.ink;
  function drawSci(q, pose, f) {
    const COAT = '#f1f3ee', COAT2 = '#c3cac6', SHIRT = '#8fc8e2', PANT = '#9a7a52', PANT2 = '#735a3a', SHOE = '#3a2c22', SKIN = '#efd6b8', SKIN2 = '#cfae8c', HAIR = '#b9d6e8', HAIR2 = '#86a9c2', BROW = '#6f8ea6';
    const panic = pose === 'panic', walk = pose === 'walk' || panic, sit = pose === 'sit', st = walk ? [1, 0, -1, 0][f] : 0, y = sit ? 3 : walk && f % 2 ? -1 : 0;
    if (sit) { q.rect(-2, -6, 7, 2, PANT); q.rect(-1, -4, 5, 1, PANT2); q.rect(4, -5, 2, 4, PANT2); q.rect(4, -1, 3, 1, SHOE); }
    else { q.rect(-2 - st, -8, 2, 7, PANT2); q.rect(-3 - st, -1, 3, 1, SHOE); q.rect(1 + st, -8, 2, 7, PANT); q.rect(1 + st, -1, 3, 1, SHOE); }
    // Back arm, lab coat, shirt, front arm.
    if (!panic) { q.rect(-5, -16 + y, 2, 7, COAT2); q.rect(-5 - st, -9 + y, 2, 1, SKIN2); }
    q.rect(-4, -17 + y, 8, 11, COAT); q.rect(-4, -17 + y, 1, 11, '#ffffff'); q.rect(3, -17 + y, 1, 11, COAT2); q.rect(-4, -7 + y, 3, 1, COAT2);
    q.rect(0, -17 + y, 2, 7, SHIRT); q.px(0, -11 + y, S(SHIRT, -.25)); q.px(-1, -17 + y, COAT2); q.px(2, -17 + y, COAT2);
    if (pose === 'tinker') { q.rect(2, -15 + y, 5, 2, COAT); q.rect(2, -14 + y, 5, 1, COAT2); q.rect(7, -15 + y + (f % 2), 2, 2, SKIN); }
    else if (pose === 'aim') {
      // Arm out, holding the mutation ray (grey body, goo vial).
      q.rect(2, -15 + y, 5, 2, COAT); q.rect(2, -14 + y, 5, 1, COAT2); q.rect(6, -14 + y, 2, 2, SKIN);
      q.rect(6, -17 + y, 5, 3, '#a6aab0'); q.rect(6, -17 + y, 5, 1, '#d4d8dc'); q.rect(7, -14 + y, 1, 2, '#74777b'); q.rect(11, -16 + y, 1, 1, '#b8f25a');
      q.rect(7, -19 + y, 3, 2, GOO); q.px(7, -19 + y, '#ffffff');
    } else if (pose === 'throw') { q.rect(2, -17 + y, 3, 2, COAT); q.line(4, -17 + y, 8, -21 + y, COAT, 2); q.rect(8, -24 + y, 2, 2, SKIN); }
    else if (pose === 'wind') q.rect(2, -17 + y, 2, 2, COAT);
    else if (panic) q.rect(3, -17 + y, 2, 2, COAT);
    else if (pose === 'wipe') { q.rect(4, -21 + y, 2, 6, COAT); q.rect(5, -21 + y, 1, 6, COAT2); }
    else { q.rect(2, -16 + y, 2, 7, COAT); q.rect(3, -16 + y, 1, 7, COAT2); q.rect(2 + st, -9 + y, 2, 1, SKIN); }
    // Long face: big eyes, unibrow, drool.
    q.rect(0, -18 + y, 2, 1, SKIN2);
    q.rect(-2, -24 + y, 6, 6, SKIN); q.rect(-2, -19 + y, 2, 1, SKIN2); q.px(4, -21 + y, SKIN2);
    q.rect(0, -22 + y, 4, 2, '#ffffff'); q.px(1, -21 + y, INK); q.px(3, -21 + y, INK); q.rect(0, -23 + y, 4, 1, BROW);
    q.rect(2, -19 + y, 2, 1, '#8a5a48'); q.px(3, -18 + y, '#b6ec7a');
    if (panic) { q.rect(0, -22 + y, 4, 2, '#ffffff'); q.px(1, -22 + y, INK); q.px(3, -22 + y, INK); q.rect(1, -20 + y, 3, 2, '#5a2a2a'); q.px(2, -20 + y, '#ffffff'); }
    if (pose === 'wipe') { q.rect(0, -22 + y, 4, 2, SKIN); q.rect(0, -21 + y, 2, 1, INK); q.px(3, -21 + y, INK); q.rect(0, -24 + y, 5, 2, SKIN); q.px(0, -24 + y, SKIN2); q.rect(4, -22 + y, 2, 1, SKIN2); }
    if (pose === 'wind') { q.line(2, -17 + y, -1, -25 + y, COAT, 2); q.px(3, -17 + y, COAT2); q.rect(-2, -28 + y, 2, 2, SKIN); }
    if (panic) { q.rect(-7, -25 + y, 2, 9, COAT2); q.rect(-7, -27 + y, 2, 2, SKIN2); q.rect(5, -25 + y, 2, 9, COAT); q.rect(6, -25 + y, 1, 9, COAT2); q.rect(4, -17 + y, 2, 1, COAT); q.rect(5, -27 + y, 2, 2, SKIN); }
    // Spiky blue-grey hair swept back.
    q.rect(-3, -24 + y, 2, 5, HAIR); q.rect(-2, -25 + y, 6, 1, HAIR);
    q.poly([[-3, -24 + y], [-2, -28 + y], [1, -24 + y]], HAIR); q.poly([[0, -24 + y], [3, -28 + y], [4, -24 + y]], HAIR);
    q.poly([[-3, -24 + y], [-8, -26 + y], [-3, -21 + y]], HAIR); q.poly([[-3, -22 + y], [-7, -19 + y], [-2, -20 + y]], HAIR2);
    q.px(-1, -25 + y, '#e4f2fa'); q.px(-2, -26 + y, '#e4f2fa');
  }
  function drawKid(q, pose, f) {
    const SHIRT = '#f4d33b', SHIRT2 = '#c9a624', PANT = '#3f63ad', PANT2 = '#2c4880', SHOE = '#e8e6de', SKIN = '#f6d4b0', SKIN2 = '#d8ae88', HAIR = '#6e3f1f', HAIR2 = '#4c2a14';
    const walk = pose === 'walk', sit = pose === 'sit', st = walk ? [1, 0, -1, 0][f] : 0, y = sit ? 2 : walk && f % 2 ? -1 : 0;
    if (sit) { q.rect(-2, -5, 6, 2, PANT); q.rect(3, -4, 2, 3, PANT2); q.rect(3, -1, 3, 1, SHOE); }
    else { q.rect(-2 - st, -6, 2, 5, PANT2); q.rect(-3 - st, -1, 3, 1, SHOE); q.rect(1 + st, -6, 2, 5, PANT); q.rect(1 + st, -1, 3, 1, SHOE); }
    q.rect(-4, -12 + y, 1, 2, SHIRT2); q.rect(-4, -10 + y, 1, 3, SKIN2);
    q.rect(-3, -13 + y, 7, 7, SHIRT); q.rect(-3, -13 + y, 1, 6, '#fbe77a'); q.rect(3, -13 + y, 1, 7, SHIRT2); q.rect(-3, -7 + y, 7, 1, SHIRT2);
    if (pose === 'tinker') { q.rect(3, -12 + y, 3, 2, SHIRT); q.rect(6, -12 + y - (f % 2), 1, 2, SKIN); q.rect(6, -15 + y - (f % 2), 2, 3, GOO); q.px(6, -16 + y - (f % 2), C.glass); }
    else if (pose === 'scared') { q.rect(3, -12 + y, 2, 2, SHIRT); q.rect(5, -15 + y, 1, 4, SKIN); q.rect(-4, -15 + y, 1, 3, SKIN2); }
    else { q.rect(3, -12 + y, 2, 2, SHIRT); q.rect(4, -10 + y, 1, 3, SKIN); }
    q.rect(0, -14 + y, 2, 1, SKIN2);
    q.rect(-3, -20 + y, 7, 5, SKIN); q.rect(-2, -21 + y, 5, 7, SKIN);
    q.rect(-3, -22 + y, 6, 2, HAIR); q.rect(-4, -21 + y, 2, 4, HAIR); q.px(3, -21 + y, HAIR); q.px(-3, -17 + y, HAIR2); q.px(-1, -22 + y, S(HAIR, .3));
    q.rect(0, -19 + y, 4, 2, '#ffffff'); q.px(1, -18 + y, INK); q.px(3, -18 + y, INK);
    if (pose === 'scared') { q.px(1, -19 + y, INK); q.px(3, -19 + y, INK); q.px(1, -18 + y, '#ffffff'); q.px(3, -18 + y, '#ffffff'); q.rect(1, -16 + y, 2, 2, '#5a2a2a'); }
    else if (pose === 'daze') { q.px(1, -18 + y, '#ffffff'); q.px(0, -19 + y, INK); q.px(3, -18 + y, '#ffffff'); q.px(2, -18 + y, INK); q.px(1, -16 + y, '#9a5a48'); q.px(2, -16 + y, '#9a5a48'); q.px(3, -15 + y, '#9a5a48'); }
    else { q.px(1, -16 + y, '#9a5a48'); q.px(2, -15 + y, '#9a5a48'); q.px(3, -16 + y, '#9a5a48'); }
  }
  const figSprite = (who, pose, f) => P.sprite(`bz-fig|${who}|${pose}|${f}`, 24, 34, 12, 31, q => (who === 's' ? drawSci : drawKid)(q, pose, f));
  const figure = (k, who, x, y, pose, f, flip, a = 1) => { k.alpha(a, () => k.ellipse(x + 1, y, 5, 1, C.shadow)); k.blit(figSprite(who, pose, f), x, y, flip, a); };

  /* ---------- the kid's mutations (cached, facing right, feet at 0,0): 1 many-eyed tentacle blob, 2 lumpy flesh heap, 3 giant-headed fly ---------- */
  const KH = '#6e3f1f', KSH = '#f4d33b', KSH2 = '#c9a624', KP = '#3f63ad', KP2 = '#2c4880';
  function drawMon(q, n, f) {
    if (n === 1) {
      const B = '#b06fc0', B2 = '#84479a', B3 = '#d7a2e2';
      for (let i = 0; i < 5; i++) { const bx = -9 + i * 4.5, dir = i < 2 ? -1 : i > 2 ? 1 : 0, pts = [];
        for (let s = 0; s <= 6; s++) pts.push([bx + dir * s * 1.3 + Math.round(Math.sin(s * 1.3 + f * 1.6 + i * 2) * 1.2), -6 + s]);
        q.path(pts, i % 2 ? B2 : B, 2); const e = pts[6]; q.px(e[0] + dir, e[1] - 1, B3); }
      q.ellipse(0, -13 + f, 12, 10, B2); q.ellipse(-1, -14 + f, 11, 9, B); q.ellipse(-4, -18 + f, 5, 3, B3); q.px(-6, -19 + f, '#f4e2f8');
      for (const [x, y] of [[-9, -8], [8, -6], [2, -5], [-3, -21]]) q.px(x, y + f, KSH);
      for (const [x, y, r, dx, dy] of [[-5, -14, 3, 1, 1], [3, -17, 2, -1, 0], [7, -11, 2, 1, 1], [-1, -8, 1, 0, 0], [1, -12, 1, 1, -1], [-9, -12, 1, -1, 0], [6, -19, 1, 0, 1], [-3, -20, 1, 1, 0]]) {
        q.circle(x, y + f, r, '#ffffff'); q.px(x + (r > 1 ? dx : 0), y + f + (r > 1 ? dy : 0), INK); if (r > 2) q.px(x - 1, y - 1 + f, '#ffffff'); }
      q.rect(-3, -5 + f, 6, 1, '#4a1e52'); q.px(-4, -6 + f, '#4a1e52'); q.px(3, -6 + f, '#4a1e52');
      q.rect(-2, -24 + f, 5, 2, KH); q.px(0, -25 + f, KH); q.px(3, -23 + f, KH);
    } else if (n === 2) {
      const F = '#e0a07a', F2 = '#b8764e', F3 = '#f6c9a0', W = '#9a5a86';
      q.rect(-6, -5, 3, 5, KP2); q.rect(4, -6, 3, 6, KP); q.rect(-7, -1, 4, 1, '#e8e6de'); q.rect(4, -1, 4, 1, '#e8e6de');
      q.circle(-5, -13, 7, F2); q.circle(4, -11, 7, F2); q.circle(1, -19 - f, 6, F2); q.circle(-8, -21, 4, F2);
      q.circle(-5, -14, 6, F); q.circle(4, -12, 6, F); q.circle(1, -20 - f, 5, F); q.circle(-8, -22, 3, F);
      q.circle(-7, -17, 2, F3); q.circle(-1, -23 - f, 2, F3); q.px(-9, -24, F3);
      q.rect(-9, -8, 16, 3, KSH); q.rect(-9, -6, 16, 1, KSH2); q.rect(5, -9, 3, 2, KSH);
      for (const [x, y] of [[-10, -12], [8, -14], [-4, -20], [6, -7]]) { q.px(x, y, W); q.px(x + 1, y, S(W, .3)); }
      q.circle(2, -20 - f, 2, '#ffffff'); q.px(3, -20 - f, INK); q.circle(-6, -15, 1, '#ffffff'); q.px(-6, -15, INK);
      q.rect(-1, -13, 9, 3, '#5a2230'); for (let i = 0; i < 4; i++) q.px(i * 2, -13, '#ffffff'); q.px(1, -11, '#ffffff'); q.px(5, -11, '#ffffff'); q.rect(2, -11, 3, 1, '#e46c80');
      q.rect(9, -15 + f * 2, 3, 2, F); q.rect(11, -17 + f * 3, 2, 2, F2); q.rect(-13, -16, 3, 2, F); q.rect(-14, -14, 2, 4, F2);
      q.rect(-2, -26 - f, 5, 2, KH); q.px(-1, -27 - f, KH); q.px(3, -25 - f, KH);
    } else {
      const H = '#5c7a3a', H2 = '#3e5a28', H3 = '#86a856', E = '#c4483a', E2 = '#8a2a24', E3 = '#e46c52';
      const wu = f ? -4 : 2;
      q.poly([[-2, -14], [-13, -20 + wu], [-15, -15 + wu], [-7, -11]], '#d8eef4'); q.poly([[-2, -12], [-12, -8 + wu], [-9, -5 + wu], [-3, -9]], '#b8dce6');
      q.line(-3, -13, -13, -18 + wu, '#9ac0cc'); q.line(-3, -11, -11, -7 + wu, '#9ac0cc');
      q.rect(-2, -5, 2, 5, KP2); q.rect(1, -5, 2, 5, KP); q.rect(-3, -1, 3, 1, '#e8e6de'); q.rect(1, -1, 3, 1, '#e8e6de');
      q.line(-3, -8, -7, -4, H2); q.line(4, -8, 8, -4, H2); q.line(-7, -4, -8, -2, H2); q.line(8, -4, 9, -2, H2);
      q.rect(-3, -12, 7, 7, KSH); q.rect(-3, -12, 1, 6, '#fbe77a'); q.rect(3, -12, 1, 7, KSH2);
      q.line(-6, -30, -9, -37, H2); q.line(4, -30, 8, -37, H2); q.circle(-9, -37, 1, H3); q.circle(8, -37, 1, H3);
      q.ellipse(0, -22, 10, 8, H2); q.ellipse(-1, -23, 9, 7, H); q.ellipse(-3, -27, 4, 2, H3);
      for (const ex of [-5, 5]) { q.ellipse(ex, -22, 5, 6, E2); q.ellipse(ex - 1, -23, 4, 5, E); for (let yy = -26; yy < -18; yy += 2) for (let xx = -3; xx < 3; xx += 2) q.px(ex + xx + (yy % 4 ? 1 : 0), yy, E3); q.rect(ex - 3, -26, 2, 2, '#ffe0d0'); }
      q.rect(0, -15, 2, 4, '#3a2a2a'); q.px(1, -11, '#6a4a3a'); q.rect(-2, -31, 4, 2, KH); q.px(0, -32, KH);
    }
  }
  // The cure flask: round-bottom glass with glowing pink cure, cork up; f = quarter turns while it spins through the air.
  const flaskSprite = f => P.sprite(`bz-flask|${f}`, 12, 12, 6, 6, q => { q.c.rotate(f * Math.PI / 2);
    q.rect(-1, -5, 3, 1, C.wood3); q.rect(-1, -4, 3, 3, '#cfeef2'); q.circle(0, 1, 3, '#cfeef2'); q.ellipse(0, 2, 2, 2, '#f08aa8'); q.rect(-2, 1, 5, 1, '#ffb0cc'); q.px(-1, 0, '#ffffff'); q.px(-2, 1, '#ffffff'); q.px(1, 3, '#c85a88'); });
  const monSprite = (n, f) => P.sprite(`bz-mon|${n}|${f}`, 44, 46, 22, 42, q => drawMon(q, n, f));
  // A transformation puff: white/lime cloud that bursts and fades over q = 0..1.
  const puff = (k, x, y, q, c2) => k.alpha(1 - q, () => { for (let i = 0; i < 7; i++) { const a = i * .9, r = 6 + q * 12; k.circle(x + Math.cos(a) * r, y + Math.sin(a) * r * .7, 5 - q * 3, i % 2 ? c2 : '#ffffff'); } k.circle(x, y, 8 - q * 6, '#ffffff'); });
  const zap = (k, x0, y0, x1, y1, t, c, core) => { const pts = []; for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + (i % 6 ? Math.round(Math.sin(t * 47 + i * 2.3) * 2) : 0)]); } k.path(pts, c, 3); k.path(pts, core, 1); };
  const tri = v => 1 - Math.abs(1 - 2 * (v - Math.floor(v)));

  // Commute routes: out of the portal, across the lawn, up the driveway to the bench.
  const mkRoute = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, L, len: L[L.length - 1] }; };
  const ROUTES = {
    s: mkRoute([[PORT.x, PORT.gy - 1], [-10, 80], [6, 40], [40, 0], [58, -30], SEAT[0]]),
    k: mkRoute([[PORT.x, PORT.gy - 1], [-10, 80], [6, 40], [40, 0], [58, -30], SEAT[1]])
  };
  const along = (r, s) => {
    const d = Math.max(0, Math.min(1, s)) * r.len; let i = 0; while (i < r.L.length - 2 && r.L[i + 1] < d) i++;
    const a = r.pts[i], b = r.pts[i + 1], u = (d - r.L[i]) / Math.max(1e-6, r.L[i + 1] - r.L[i]);
    return { x: Math.round(a[0] + (b[0] - a[0]) * u), y: Math.round(a[1] + (b[1] - a[1]) * u), dx: b[0] - a[0], d };
  };
  const CYCLE = 13, OUT = 4.5, STAY = 8, BACK = 12.5;               // seconds within the commute loop
  // Master loop while working: the commute (0-13.8 s), then a mutation mishap on the driveway (LAB0 + 0..20 s).
  const MC = 34, LAB0 = 14, RK = { x: 30, y: 2 }, KD = { x: 80, y: 4 };
  const LROUTE = { s: mkRoute([[PORT.x, PORT.gy - 1], [-10, 80], [6, 40], [26, 6], [RK.x, RK.y]]), k: mkRoute([[PORT.x, PORT.gy - 1], [-10, 80], [6, 40], [40, 6], [KD.x, KD.y]]) };
  // Returns [y, draw] so the two walkers can be depth-sorted, or null while inside the portal.
  function commute(k, who, tt) {
    const c = ((tt % CYCLE) + CYCLE) % CYCLE, r = ROUTES[who], wf = Math.floor(tt * 8) % 4;
    if (c >= BACK) return null;
    if (c >= OUT && c < STAY) { const [x, y] = SEAT[who === 's' ? 0 : 1]; return [y, () => figure(k, who, x, y, 'tinker', Math.floor(tt * 3) % 2, who === 'k')]; }
    const back = c >= STAY, s = back ? 1 - (c - STAY) / (BACK - STAY) : c / OUT, p = along(r, s);
    return [p.y, () => figure(k, who, p.x, p.y, 'walk', wf, back ? p.dx > 0 : p.dx < 0, Math.min(1, p.d / 12))];
  }

  // The mishap, u = 0..20 s: walk out (0-3.2), aim + zap (3.2-5.2), blob (5.2), second zap -> flesh heap (7.7), fly (10.0) while the
  // scientist panics (9.9-13), winds up and lobs a cure flask (13-14.2) that shatters on the fly (14.2), white flash back to the kid, dazed kid + brow wipe (14.65-16.6), walk back (16.6-19.8).
  function lab(k, u, t, detail) {
    const wf = Math.floor(t * 8) % 4, out = u < 3.2, home = u >= 16.6, d = [];
    const walker = (who, s0, dur) => { const s = out ? (u - s0) / dur : 1 - (u - 16.6) / 3.2; if (s <= 0) return null; const p = along(LROUTE[who], s); return [p.y, () => figure(k, who, p.x, p.y, 'walk', wf, home ? p.dx > 0 : p.dx < 0, Math.min(1, p.d / 12))]; };
    const form = u < 5.2 ? 0 : u < 7.7 ? 1 : u < 10 ? 2 : u < 14.65 ? 3 : 0;
    // Scientist.
    let rx = RK.x, rpose = 'stand', rflip = false;
    if (u >= 9.9 && u < 13) { const v = (u - 9.9) / 1.55; rx = RK.x - Math.round(tri(v) * 22); rpose = 'panic'; rflip = v - Math.floor(v) < .5; }
    else if ((u >= 3.2 && u < 5.2) || (u >= 6.6 && u < 7.7)) rpose = 'aim';
    else if (u >= 13 && u < 13.5) rpose = 'wind';
    else if (u >= 13.5 && u < 13.8) rpose = 'throw';
    else if (u >= 14.9) rpose = 'wipe';
    if (out || home) { const w = walker('s', .3, 2.9); if (w) d.push(w); }
    else d.push([RK.y, () => figure(k, 's', rx, RK.y, rpose, rpose === 'panic' ? Math.floor(t * 12) % 4 : 0, rflip)]);
    // Kid / monster.
    if (out || home) { const w = walker('k', 0, 3.2); if (w) d.push(w); }
    else if (form === 0) { const dz = u >= 14.65, x = KD.x + (dz ? Math.round(Math.sin(u * 6)) : u >= 3.6 ? Math.floor(t * 12) % 2 : 0); d.push([KD.y, () => figure(k, 'k', x, KD.y, dz ? 'daze' : u >= 3.6 ? 'scared' : 'stand', 0, true)]); }
    else d.push([KD.y, () => {
      const fr = Math.floor(t * (form === 3 ? 14 : 4)) % 2, hx = form === 3 ? Math.round(Math.sin(u * 5) * 4) : 0, hy = form === 3 ? 6 + Math.round(Math.sin(u * 7) * 2) : 0;
      k.ellipse(KD.x + 1 + hx, KD.y, form === 3 ? 6 : 11, 2, C.shadow); k.blit(monSprite(form, fr), KD.x + hx, KD.y - hy, true);
    }]);
    d.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
    // Beams, puffs, flash and pop-ups (over the actors).
    const mx = RK.x + 11, my = RK.y - 16, tx = KD.x, ty = KD.y - 12;
    if ((u >= 4.4 && u < 5.1) || (u >= 7.0 && u < 7.6)) { zap(k, mx, my, tx, ty, t, '#3fb83a', '#eaffc0'); if (detail) for (let i = 0; i < 5; i++) { const a = i * 1.26 + Math.floor(t * 12); plus(k, tx + Math.cos(a) * 9, ty + Math.sin(a) * 9, i % 2 ? LIME : '#eaffc0', i === 0); } }
    else if ((u >= 3.6 && u < 4.4) || (u >= 6.7 && u < 7.0)) k.alpha(.5 + Math.sin(t * 30) * .4, () => k.circle(mx + 1, my, 2, LIME));
    // Cure flask: held up glowing while winding up, then lobbed in a spinning arc onto the fly's head.
    const hx = KD.x, hy = KD.y - 26;
    if (u >= 13 && u < 14.2) {
      const fl = u < 13.5, s = fl ? 0 : (u - 13.5) / .7, x = fl ? RK.x - 1 + (Math.floor(t * 10) % 2) : Math.round(RK.x + 9 + (hx - RK.x - 9) * s), y = fl ? RK.y - 30 : Math.round(RK.y - 24 + (hy - RK.y + 24) * s - Math.sin(s * Math.PI) * 22);
      k.alpha(.35 + Math.sin(t * 20) * .15, () => k.circle(x, y + 1, 5, '#ff9cc4')); k.blit(flaskSprite(fl ? 0 : Math.floor(s * 7) % 4), x, y);
      if (!fl && detail) for (let i = 1; i <= 3; i++) { const s2 = Math.max(0, s - i * .07); k.alpha(.6 - i * .15, () => k.px(RK.x + 9 + (hx - RK.x - 9) * s2, RK.y - 24 + (hy - RK.y + 24) * s2 - Math.sin(s2 * Math.PI) * 22, '#ffd0e4')); }
    }
    for (const [at, c2] of [[5.2, LIME], [7.7, '#e0a07a'], [10, '#b06fc0']]) if (Math.abs(u - at) < .3) puff(k, tx, ty, (u - at + .3) / .6, c2);
    if (Math.abs(u - 14.8) < .3) { const q = (u - 14.5) / .6; k.alpha(Math.min(1, 2 - 2 * q), () => { k.circle(tx, ty - 10, 20 + q * 14, '#dff8ff'); k.circle(tx, ty - 10, 15 + q * 8, '#ffffff'); }); }
    // Shatter: glass shards and pink cure splash out of the impact point, with sparkles.
    if (u >= 14.2 && u < 14.9) {
      const q = (u - 14.2) / .7;
      if (q < .35) k.alpha(1 - q * 2.5, () => { k.ellipse(hx, hy, 6 + q * 20, 4 + q * 12, '#ff9cc4'); k.ellipse(hx, hy, 3 + q * 12, 2 + q * 8, '#ffffff'); });
      for (let i = 0; i < 10; i++) { const a = -Math.PI * (-.05 + i * .12), v = 34 + (i % 3) * 10, x = hx + Math.cos(a) * v * q * 1.3, y = hy + Math.sin(a) * v * q + 40 * q * q; k.rect(x, y, 2, i % 3 ? 1 : 2, i % 2 ? '#bfe6ee' : C.white); k.px(x + (i % 2 ? -1 : 2), y + 1, C.glass); }
      for (let i = 0; i < 8; i++) { const a = -Math.PI * (.02 + i * .135), v = 22 + (i % 2) * 12; k.alpha(1 - q * .5, () => { const x = hx + Math.cos(a) * v * q * 1.2, y = hy + Math.sin(a) * v * q * .8 + 50 * q * q; k.rect(x, y, 3, 2, i % 2 ? '#f08aa8' : '#ffb0cc'); k.px(x, y - 1, '#ffe0ec'); }); }
      if (detail) for (let i = 0; i < 6; i++) Props.sparkle(k, hx + [-12, 11, -5, 14, 2, -14][i], hy + [-6, -2, 8, 10, -12, 4][i], t + i * .17, i % 2 ? '#ffd0e4' : '#ffffff');
    }
    if (u >= 14.65 && u < 16.6 && detail) for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.09; plus(k, KD.x + Math.round(Math.cos(a) * 6), KD.y - 25 + Math.round(Math.sin(a) * 2), C.gold3, false); }
    if (u >= 5.6 && u < 6.6) k.textBold('?', RK.x + 2, RK.y - 38, C.white);
    if (u >= 8 && u < 9.9 && Math.floor(t * 4) % 2 === 0) k.textBold('!!', RK.x + 2, RK.y - 38, C.gold4);
    if (u >= 9.9 && u < 13) {
      const pop = Math.max(0, Math.round((1 - (u - 9.9) * 5) * 4));
      const bx = rx + 1, by = RK.y - 62 - pop + (Math.floor(t * 8) % 2);
      k.rect(bx - 34, by - 2, 68, 28, C.ink); k.rect(bx - 33, by - 1, 66, 26, C.white); k.rect(bx - 33, by + 24, 66, 1, C.stone4); k.poly([[bx - 4, by + 26], [bx + 3, by + 26], [bx - 2, by + 31]], C.ink); k.poly([[bx - 3, by + 25], [bx + 2, by + 25], [bx - 2, by + 29]], C.white);
      k.textCenter('FUCK YOU', bx + 1, by + 1, C.red1, 2); k.text('ORTY', bx - 8, by + 13, C.red1, 2);
      ['10001', '11011', '10101', '10001', '10001'].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '1') k.rect(bx - 20 + i * 2, by + 13 + j * 2, 2, 2, C.red1); });  // wide M: the 3x5 one reads as H
      if (detail) for (let i = 0; i < 3; i++) { const q = (t * 2.6 + i / 3) % 1, sd = rflip ? 1 : -1; k.rect(rx + sd * (3 + q * 6) + (i - 1) * 3, RK.y - 29 + q * 8 - (i === 1 ? 3 : 0), 1, 2, '#8fd0ff'); }
    }
    if (u >= 15 && u < 16.6) { k.textBold('PHEW', RK.x + 1, RK.y - 38, C.white); if (detail) { const q = ((u - 15) * 1.2) % 1; k.rect(RK.x - 3, RK.y - 24 + q * 10, 1, 2, '#8fd0ff'); } }
  }
  // Error: the fly-headed kid got loose and the scientist chases it around the driveway.
  function loose(k, t, detail) {
    const fx = 84 + Math.round(Math.sin(t * 1.3) * 24), fy = -4 + Math.round(Math.sin(t * 2.6) * 8), hy = 6 + Math.round(Math.sin(t * 9) * 2);
    const tl = t - 1.2, rx = 84 + Math.round(Math.sin(tl * 1.3) * 24), ry = 4 + Math.round(Math.sin(tl * 2.6) * 8), rf = Math.cos(tl * 1.3) < 0;
    const fly = () => { k.ellipse(fx + 1, fy, 6, 2, C.shadow); k.blit(monSprite(3, Math.floor(t * 14) % 2), fx, fy - hy, Math.cos(t * 1.3) < 0); };
    const sci = () => figure(k, 's', rx, ry, 'panic', Math.floor(t * 12) % 4, rf);
    if (fy < ry) { fly(); sci(); } else { sci(); fly(); }
    if (Math.floor(t * 4) % 2 === 0) k.textBold('!!', rx + 1, ry - 38, C.red3);
    if (detail) for (let i = 0; i < 2; i++) { const q = (t * 2.6 + i / 2) % 1; k.rect(rx + (rf ? 1 : -1) * (3 + q * 6), ry - 29 + q * 8, 1, 2, '#8fd0ff'); }
  }

  return {
    paint(k) {
      // Meadow texture.
      k.rectTex(-190, -150, 380, 290, (x, y) => { const h = P.hash(x * 1.1, y * .9); return h < .025 ? C.grass4 : h > .985 ? C.grass1 : null; });
      // Gravel walk from the entrance, and a branch to the orrery.
      k.rect(-18, 10, 36, 130, C.dirt2); k.rectTex(-16, 10, 32, 130, gravelTex);
      k.poly([[-16, 88], [-16, 102], [-112, 104], [-114, 90]], C.dirt2); k.polyTex([[-16, 90], [-16, 100], [-112, 102], [-113, 92]], gravelTex);
      k.ellipse(ORR.x, ORR.y + 2, 38, 17, C.dirt2); k.ellipse(ORR.x, ORR.y + 1, 36, 15, C.dirt4);
      // Concrete driveway down from the garage, with joints and an oil stain.
      k.poly([[12, -42], [106, -42], [112, 13], [-14, 13]], '#8d8b83'); k.polyTex([[14, -41], [104, -41], [110, 12], [-12, 12]], concTex);
      k.ditherEllipse(64, -20, 9, 3, '#5f5d55', 0); k.ellipse(64, -20, 4, 1, '#6d6b62'); k.px(30, 2, '#8d8b83'); k.line(84, -8, 90, 4, '#8d8b83');

      // Trees and shrubs on the hill behind.
      Props.tree(k, -178, -106, 'dark', 1, 2); Props.tree(k, -62, -112, 'pine', 1, 0); Props.tree(k, -4, -122, 'birch', 0, 0);
      Props.tree(k, 104, -108, 'oak', 0, 1); Props.tree(k, 180, -112, 'pine', 0, 1); Props.tree(k, -150, -130, 'autumn', 0, 2);
      for (let i = 0; i < 12; i++) Props.flower(k, -186 + P.hash(i, 3) * 190, -148 + P.hash(i, 6) * 10, ['#c3a2c0', '#f6ecd0', '#8aa7d8'][i % 3]);

      /* ----- Observatory terrace (top left) ----- */
      k.poly([[-190, -60], [-174, -77], [-54, -77], [-45, -60], [-45, -13], [-190, -13]], C.stone1);
      k.polyTex([[-188, -60], [-172, -75], [-56, -75], [-47, -60], [-47, -14], [-188, -14]], flagTex(C.stone4));
      k.rect(-190, -14, 146, 3, C.stone5); k.rect(-190, -11, 146, 10, C.stone2);
      for (let row = 0; row < 3; row++) { k.rect(-190, -8 + row * 3, 146, 1, C.stone1); for (let x = -190 + (row % 2) * 5; x < -44; x += 10) k.rect(x, -11 + row * 3, 1, 3, C.stone1); }
      k.rect(-188, -1, 146, 3, C.shadow);
      k.rect(-132, -16, 24, 16, C.stone3); for (let i = 0; i < 4; i++) { k.rect(-132, -14 + i * 4, 24, 1, C.stone5); k.rect(-132, -11 + i * 4, 24, 1, C.stone1); }
      k.rect(-134, -18, 3, 18, C.stone2); k.rect(-109, -18, 3, 18, C.stone2); k.rect(-135, -20, 5, 3, C.stone4); k.rect(-110, -20, 5, 3, C.stone4);
      for (const x0 of [-184, -160, -90, -66]) for (let i = 0; i < 6; i++) { k.px(x0 + i * 2, -10 + (i % 3) * 3, C.leaf2); k.px(x0 + i * 2 + 1, -9 + (i % 3) * 3, C.leaf3); }
      // Zodiac ring inlaid in front of the observatory.
      k.ellipse(-120, -36, 26, 9, C.stone2); k.ellipse(-120, -36, 24, 8, NIGHT); k.ellipse(-120, -36, 18, 5, NIGHT2); k.ring(-120, -36, 21, 7, C.gold1);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.px(-120 + Math.round(Math.cos(a) * 21), -36 + Math.round(Math.sin(a) * 7), C.gold3); }
      for (const [x, y] of [[-128, -38], [-114, -34], [-108, -38], [-134, -34], [-120, -39]]) k.px(x, y, C.gold4);
      // Dome, drum, door, windows and sign.
      k.ellipse(-114, -62, 38, 6, C.shadow);
      k.ellipse(DOME.x, DOME.y, DOME.rx + 1, DOME.ry + 1, '#1a3a3a'); k.ellipse(DOME.x, DOME.y, DOME.rx, DOME.ry, C.teal2);
      k.ellipse(DOME.x + 6, DOME.y + 3, DOME.rx - 8, DOME.ry - 6, C.teal1); k.ellipse(DOME.x - 9, DOME.y - 8, 14, 11, C.teal3); k.ellipse(DOME.x - 14, DOME.y - 13, 5, 4, C.teal4);
      for (const f of [-.75, -.4, .4, .75]) { const pts = []; for (let i = 0; i <= 10; i++) { const th = i / 10 * Math.PI / 2; pts.push([DOME.x + DOME.rx * Math.cos(th) * f, DOME.y - DOME.ry * Math.sin(th)]); } k.path(pts, f < 0 ? C.teal4 : C.teal0); }
      k.ring(DOME.x, DOME.y - 9, DOME.rx * .88, DOME.ry * .4, S(C.teal2, -.15));
      k.poly([[DOME.x - 6, DOME.y], [DOME.x + 6, DOME.y], [DOME.x + 3, DOME.y - DOME.ry + 1], [DOME.x - 3, DOME.y - DOME.ry + 1]], '#141a2a');
      k.rect(DOME.x - 7, DOME.y - DOME.ry + 4, 1, DOME.ry - 4, C.teal4); k.rect(DOME.x + 6, DOME.y - DOME.ry + 4, 1, DOME.ry - 4, C.teal0);
      k.rect(DOME.x - 1, DOME.y - DOME.ry - 5, 3, 5, C.gold1); k.px(DOME.x, DOME.y - DOME.ry - 6, C.gold3);
      k.rect(-152, -103, 64, 5, C.stone4); k.rect(-152, -103, 64, 1, C.stone5); k.rect(-152, -99, 64, 1, C.stone1);
      k.rectTex(-148, -98, 56, 33, (x, y) => { const r = Math.floor((y + 300) / 5), o = (r % 2) * 6, cx = (x + 300 + o) % 12; if ((y + 300) % 5 === 0 || cx === 0) return C.stone2; if (x > -98) return C.stone3; if (x < -144) return C.stone5; return P.hash(Math.floor((x + o) / 12), r) < .25 ? C.stone5 : C.stone4; });
      k.rect(-149, -66, 58, 4, C.stone2); k.rect(-149, -66, 58, 1, C.stone4);
      Props.door(k, -127, -62, 14, 18, C.wood2, { arch: true });
      for (const x of [-144, -103]) Props.window(k, x, -92, 7, 11, { arch: true, frame: C.wood0 });
      k.rect(-134, -97, 28, 7, C.gold1); k.rect(-133, -96, 26, 5, NIGHT); k.text('ASTRO', -130, -96, C.gold3);
      // Armillary sphere, chalkboard with a posterior curve, crates and pots.
      k.ellipse(ARM.x + 2, ARM.y + 1, 9, 2, C.shadow); k.rect(ARM.x - 5, ARM.y - 4, 10, 4, C.stone2); k.rect(ARM.x - 2, ARM.y - 14, 4, 10, C.stone3); k.rect(ARM.x - 2, ARM.y - 14, 1, 10, C.stone5);
      k.ring(ARM.x, ARM.y - 24, 9, 9, C.gold1); k.ring(ARM.x, ARM.y - 24, 9, 3, C.gold2); k.line(ARM.x - 7, ARM.y - 30, ARM.x + 7, ARM.y - 18, C.gold0);
      const cb = [-80, -58];
      k.rect(cb[0] + 2, cb[1] + 20, 2, 12, C.wood1); k.rect(cb[0] + 24, cb[1] + 20, 2, 12, C.wood1); k.ellipse(cb[0] + 14, cb[1] + 32, 12, 2, C.shadow);
      k.rect(cb[0] - 1, cb[1] - 1, 30, 22, C.wood1); k.rect(cb[0], cb[1], 28, 20, '#23302c');
      for (let i = 0; i < 24; i++) { const x = i - 12, y = Math.round(14 * Math.exp(-(x * x) / 30)); k.px(cb[0] + 2 + i, cb[1] + 17 - y, C.paper); }
      for (let i = 0; i < 24; i++) { const x = i - 7, y = Math.round(8 * Math.exp(-(x * x) / 50)); k.px(cb[0] + 2 + i, cb[1] + 17 - y, '#9fdc6a'); }
      k.rect(cb[0] + 2, cb[1] + 18, 24, 1, C.stone3); k.rect(cb[0] + 14, cb[1] + 2, 1, 16, '#6a8a80');
      Props.crate(k, -64, -30, 8); Props.crate(k, -56, -26, 7); Props.pot(k, -184, -70); Props.pot(k, -62, -70); Props.pot(k, -150, -30, false);

      // Weather mast and instrument screen between the observatory and the garage.
      k.rect(ANEMO.x - 1, ANEMO.y, 3, 70, C.stone1); k.rect(ANEMO.x - 1, ANEMO.y, 1, 70, C.stone3); k.ellipse(ANEMO.x + 2, ANEMO.y + 70, 5, 1, C.shadow);
      k.line(ANEMO.x, ANEMO.y + 70, ANEMO.x - 10, ANEMO.y + 40, C.stone2); k.line(ANEMO.x, ANEMO.y + 70, ANEMO.x + 10, ANEMO.y + 40, C.stone2);
      k.rect(ANEMO.x - 8, ANEMO.y + 14, 16, 1, C.stone1); k.poly([[ANEMO.x + 8, ANEMO.y + 12], [ANEMO.x + 14, ANEMO.y + 14], [ANEMO.x + 8, ANEMO.y + 16]], C.red2); k.rect(ANEMO.x - 11, ANEMO.y + 13, 3, 3, C.stone1);
      k.ellipse(-33, -34, 8, 2, C.shadow); for (const x of [-38, -30]) k.rect(x, -44, 2, 10, C.wood2);
      k.rect(-40, -58, 13, 14, C.white); k.rect(-40, -58, 13, 1, C.plaster3); for (let y = -56; y < -45; y += 2) k.rect(-39, y, 11, 1, C.stone4); k.rect(-28, -58, 1, 14, C.stone3); k.poly([[-42, -58], [-34, -62], [-25, -58]], C.plaster3);

      /* ----- Suburban house and garage lab (top right) ----- */
      const HW = '#e6d6ae', GW = '#d8d0bc';
      Props.building(k, 128, -40, { w: 58, h: 46, roofH: 18, style: 'gable', roof: C.terra1, wall: HW, chimney: { x: 44, h: 8 } });
      for (let y = -84; y < -44; y += 3) k.rect(129, y, 55, 1, S(HW, -.12));
      Props.window(k, 133, -76, 10, 10, { shutters: '#5a7a9a' }); Props.window(k, 171, -76, 10, 10, { shutters: '#5a7a9a' });
      Props.door(k, 151, -40, 10, 17, '#7a5a86'); k.rect(150, -40, 12, 2, '#a8845c');
      Props.building(k, 6, -40, { w: 120, h: 38, roofH: 14, style: 'gable', roof: C.slate2, wall: GW, foundation: 2 });
      for (let y = -76; y < -42; y += 3) k.rect(7, y, 117, 1, S(GW, -.12));
      // Roll-up door: frame, the rolled slats and the interior.
      k.rect(OP.x - 2, OP.y - 2, OP.w + 4, OP.h + 2, C.stone1); k.rect(OP.x - 2, OP.y - 2, OP.w + 4, 1, C.stone3);
      k.rect(OP.x, OP.y, OP.w, 26, '#3a3942');
      for (let r = 0; r < 2; r++) { k.rect(OP.x, OP.y + r * 3, OP.w, 3, '#cfc9b6'); k.rect(OP.x, OP.y + r * 3 + 2, OP.w, 1, '#9d978a'); }
      k.rect(OP.x + 38, OP.y + 5, 8, 1, C.stone0);
      k.rect(OP.x, -54, OP.w, 14, '#77746c'); k.dither(OP.x, -54, OP.w, 5, '#5f5c56', 0); k.rect(OP.x, -42, OP.w, 1, '#908d84'); k.ditherEllipse(66, -46, 6, 2, '#4f4d48', 1);
      k.rect(OP.x, OP.y + 6, 3, 30, '#2a2930'); k.rect(OP.x + OP.w - 3, OP.y + 6, 3, 30, '#2a2930');
      // Pegboard with tools.
      k.rect(22, -64, 20, 8, '#8a6a48'); k.dither(22, -64, 20, 8, '#5c4430', 1);
      k.line(24, -63, 27, -58, C.stone3); k.rect(30, -63, 1, 5, C.wood3); k.rect(29, -63, 3, 2, C.stone2); k.rect(34, -62, 6, 2, C.stone3); k.rect(34, -60, 2, 3, C.red2); k.circle(39, -59, 1, C.gold1);
      // Shelf of jars above the bench.
      k.rect(44, -63, 14, 1, C.wood2); for (let i = 0; i < 4; i++) { k.rect(45 + i * 3, -67, 2, 4, [GOO, C.plum3, C.red3, '#8fc8e2'][i]); k.px(45 + i * 3, -68, C.wood1); }
      // Workbench with beakers, a portal gun and a CRT monitor.
      k.rect(21, -56, 50, 2, C.wood4); k.rect(21, -54, 50, 4, C.wood2); k.rect(21, -54, 50, 1, C.wood1);
      for (const x of [26, 44, 60]) { k.rect(x, -53, 8, 2, C.wood3); k.px(x + 4, -52, C.gold2); }
      k.rect(22, -50, 2, 5, C.wood1); k.rect(68, -50, 2, 5, C.wood1);
      k.poly([[24, -56], [26, -61], [28, -61], [30, -56]], C.glass); k.poly([[24, -56], [25, -58], [29, -58], [30, -56]], GOO); k.rect(26, -63, 2, 2, C.glass);
      k.rect(32, -62, 4, 6, C.glass); k.rect(32, -59, 4, 3, '#4fc03a'); k.px(32, -62, C.white);
      k.rect(37, -60, 2, 4, C.glass); k.rect(37, -58, 2, 2, C.plum3); k.rect(36, -56, 5, 1, C.stone1);
      k.rect(44, -59, 8, 3, '#a6aab0'); k.rect(44, -59, 8, 1, '#d4d8dc'); k.rect(46, -57, 2, 2, '#6d737a'); k.rect(52, -59, 2, 2, '#6d737a'); k.rect(42, -60, 3, 3, GOO); k.px(42, -60, '#eaffc0');
      k.rect(58, -65, 12, 9, '#c8c0a8'); k.rect(59, -64, 10, 6, '#16301c'); k.rect(60, -56, 8, 1, '#9d978a'); k.px(59, -64, '#3a6a3c');
      // Generator with coil, dials and hazard stripes.
      k.ellipse(88, -45, 11, 2, C.shadow);
      k.rect(77, -66, 20, 21, '#5a6470'); k.rect(77, -66, 2, 21, '#7a8490'); k.rect(95, -66, 2, 21, '#3e4650');
      for (let i = 0; i < 5; i++) k.rect(79 + i * 4, -49, 2, 3, i % 2 ? C.ink : C.gold2);
      k.circle(83, -60, 3, C.stone4); k.circle(83, -60, 2, C.white); k.circle(91, -60, 2, C.stone4); k.px(91, -60, C.ink);
      for (let y = -55; y < -50; y += 2) k.rect(80, y, 14, 1, '#3e4650');
      k.rect(82, -70, 10, 4, C.gold0); for (let x = 82; x < 92; x += 2) k.rect(x, -70, 1, 4, C.gold2);
      // Cables: from the ceiling, into the bench, and out along the driveway to the stabiliser.
      k.path([[OP.x + 4, OP.y + 6], [30, -64], [52, -64], [76, -60]], '#1e1e24'); k.path([[64, OP.y + 6], [70, -60], [77, -56]], C.red1);
      k.path([[77, -50], [72, -48], [66, -48], [60, -50]], '#1e1e24');
      k.path([[86, -45], [74, -42], [20, -42], [10, -30], [-8, -8], [-40, 10], [-62, 26], [-78, 44]], '#1e1e24'); k.path([[20, -41], [10, -29], [-8, -7]], '#44444c');
      // Hanging bulb, seats, and clutter by the door.
      k.rect(48, OP.y + 6, 1, 4, C.ink); k.rect(47, -60, 3, 2, C.glassDark);
      k.rect(SEAT[0][0] - 3, -47, 6, 5, C.red1); k.rect(SEAT[0][0] - 3, -47, 6, 1, C.red3); k.rect(SEAT[0][0] - 4, -43, 8, 1, C.red0);
      Props.crate(k, SEAT[1][0] - 3, -48, 6);
      k.rect(9, -62, 4, 4, C.slate1); k.rect(10, -61, 2, 2, C.glassDark);
      k.circle(12, -48, 4, '#3e7a3a'); k.circle(12, -48, 2, '#2a5a2a'); k.rect(9, -44, 7, 2, C.stone1);
      Props.window(k, 108, -70, 10, 8, {});
      for (const x of [104, 115]) { k.rect(x + 1, -42, 9, 2, C.shadow); k.rect(x, -54, 9, 12, '#5a6a60'); k.rect(x, -54, 2, 12, '#7a8a80'); k.rect(x - 1, -56, 11, 2, '#4a5a50'); k.rect(x + 3, -57, 3, 1, '#4a5a50'); }
      k.rect(4, -40, 3, 3, C.shadow);

      // Hacked-together saucer car parked by the house.
      const sx = SAU.x, sy = SAU.y;
      k.ellipse(sx + 4, sy + 7, 27, 4, C.shadow);
      for (const dx of [-14, 0, 14]) { k.line(sx + dx * .7, sy + 2, sx + dx, sy + 6, C.stone1); k.rect(sx + dx - 1, sy + 6, 3, 1, C.stone0); }
      k.ellipse(sx, sy - 9, 10, 8, '#6fa8b0'); k.ellipse(sx - 3, sy - 12, 4, 3, '#c8f0f0'); k.rect(sx - 2, sy - 9, 6, 5, C.red1); k.rect(sx + 3, sy - 11, 1, 4, C.stone0); k.rect(sx + 2, sy - 12, 3, 1, C.stone0);
      k.ellipse(sx, sy + 1, 24, 6, '#646b72'); k.ellipse(sx, sy - 1, 24, 5, '#98a1a8'); k.ellipse(sx, sy - 3, 20, 4, '#b8c0c4'); k.ellipse(sx - 7, sy - 4, 8, 2, '#dfe6e8');
      k.rect(sx - 24, sy - 1, 48, 1, '#50565c');
      k.rect(sx + 8, sy - 4, 7, 3, '#b0b0a4'); k.rect(sx + 10, sy - 5, 3, 5, '#9a9a8e'); k.rect(sx - 17, sy - 3, 7, 3, C.terra2); k.px(sx - 16, sy - 3, C.terra3);
      for (let i = -20; i <= 20; i += 5) k.px(sx + i, sy + 1, '#3e444a');
      k.rect(sx - 30, sy - 5, 6, 6, C.stone1); k.rect(sx - 31, sy - 6, 8, 2, C.stone2); k.rect(sx - 30, sy - 3, 6, 1, '#2a2a2e');
      k.line(sx + 5, sy - 16, sx + 10, sy - 25, C.stone0); k.line(sx + 10, sy - 25, sx + 13, sy - 23, C.stone0); k.circle(sx + 10, sy - 26, 1, C.red2);
      k.rect(sx + 18, sy + 2, 5, 2, '#50565c'); k.px(sx + 23, sy + 2, '#2a2a2e');

      /* ----- The portal lawn ----- */
      // Scorched grass where the portal opens, with goo splats.
      k.ditherEllipse(PORT.x, PORT.gy, 28, 8, C.grass0, 0); k.ellipse(PORT.x, PORT.gy, 19, 4, '#46562e'); k.ditherEllipse(PORT.x, PORT.gy, 15, 3, '#2e3a22', 1);
      for (const [x, y] of [[-70, 82], [-20, 74], [-60, 88], [-30, 86], [-12, 80]]) { k.rect(x, y, 2, 1, '#5cc83a'); k.px(x + 1, y - 1, '#a4ec6a'); }
      // Stabiliser tripod aimed at the portal.
      k.ellipse(STAB.x + 2, STAB.y + 20, 8, 2, C.shadow);
      k.line(STAB.x, STAB.y + 4, STAB.x - 6, STAB.y + 20, C.stone1); k.line(STAB.x, STAB.y + 4, STAB.x + 6, STAB.y + 20, C.stone1); k.line(STAB.x, STAB.y + 4, STAB.x + 1, STAB.y + 21, C.stone0);
      k.rect(STAB.x - 5, STAB.y - 3, 10, 7, C.slate1); k.rect(STAB.x - 5, STAB.y - 3, 10, 1, C.slate3); k.poly([[STAB.x + 5, STAB.y - 3], [STAB.x + 10, STAB.y - 5], [STAB.x + 10, STAB.y + 6], [STAB.x + 5, STAB.y + 4]], C.stone3); k.rect(STAB.x + 9, STAB.y - 4, 1, 9, C.stone1);
      Props.lamp(k, AMB.x, AMB.y, false);
      // Chart board on the lawn: a scatter with a fitted line.
      const bx = -104, by = 18;
      k.rect(bx + 3, by + 18, 2, 10, C.wood1); k.rect(bx + 17, by + 18, 2, 10, C.wood1); k.ellipse(bx + 12, by + 28, 10, 2, C.shadow);
      k.rect(bx - 1, by - 1, 24, 20, C.wood2); k.rect(bx, by, 22, 18, C.paper); k.rect(bx + 2, by + 15, 18, 1, C.stone1); k.rect(bx + 2, by + 2, 1, 14, C.stone1);
      for (let i = 0; i < 12; i++) k.px(bx + 4 + i * 1.4, by + 14 - i - Math.round((P.hash(i, 9) - .5) * 5), i % 3 ? C.slate2 : C.red2);
      k.line(bx + 4, by + 14, bx + 20, by + 3, '#3fb83a');

      /* ----- Orrery and histogram bed (bottom left) ----- */
      k.ellipse(ORR.x + 3, ORR.y + 4, 28, 9, C.shadow); k.ellipse(ORR.x, ORR.y + 2, 28, 10, C.stone2); k.ellipse(ORR.x, ORR.y, 27, 9, C.stone4); k.ellipse(ORR.x, ORR.y, 25, 8, C.stone3);
      for (const [rx, ry] of [[9, 3], [16, 5], [23, 7]]) k.ring(ORR.x, ORR.y - 10, rx, ry, C.gold1);
      k.rect(ORR.x - 2, ORR.y - 10, 4, 10, C.gold1); k.rect(ORR.x - 2, ORR.y - 10, 1, 10, C.gold3); k.rect(ORR.x - 5, ORR.y - 2, 10, 3, C.gold0);
      k.rect(-183, 113, 70, 20, C.wood1); k.rect(-182, 114, 68, 18, C.dirt1); k.dither(-182, 114, 68, 18, C.dirt0, 1);
      for (let i = 0; i < 11; i++) { const x = i - 5, h = Math.max(1, Math.round(5 * Math.exp(-(x * x) / 8))), fx = -180 + i * 6; k.rect(fx + 1, 130 - h * 3, 1, h * 3, C.leaf1); for (let j = 0; j < h; j++) { const fy = 128 - j * 3, c = ['#5a74b8', '#8aa7d8', '#c3a2c0', '#f2c14e', '#fff1bf'][j]; k.rect(fx, fy, 3, 2, c); k.px(fx, fy, S(c, .4)); k.px(fx + 2, fy + 1, S(c, -.25)); } }
      Props.tree(k, -178, 44, 'oak', 1, 1); Props.bush(k, -166, 70, 0); Props.rock(k, -186, 60, 1, 3); Props.bush(k, -58, 134, 2);

      /* ----- Scrap yard (bottom right) ----- */
      Props.barrel(k, 100, 42); Props.barrel(k, 112, 46); for (const x of [105, 117]) { k.ellipse(x, x === 105 ? 42 : 46, 3, 1, GOO); k.rect(x - 2, x === 105 ? 43 : 47, 1, 4, '#5cc83a'); }
      k.ellipse(120, 62, 7, 2, '#4fb83a'); k.ellipse(119, 61, 4, 1, '#a4ec6a');
      k.rect(98, 72, 7, 8, C.red2); k.rect(98, 72, 2, 8, C.red3); k.rect(101, 70, 3, 2, C.red1); k.rect(104, 70, 1, 3, C.stone1);
      k.ellipse(160, 64, 9, 2, C.shadow); k.rect(158, 44, 3, 20, C.stone1); k.rect(154, 62, 11, 3, C.stone2);
      k.ellipse(156, 40, 13, 8, C.stone2); k.ellipse(157, 41, 11, 6, C.stone4); k.ellipse(158, 42, 7, 4, C.stone3); k.line(158, 42, 170, 32, C.stone1); k.rect(169, 30, 3, 3, C.slate1);
      k.ellipse(134, 106, 26, 4, C.shadow);
      k.poly([[110, 106], [118, 90], [128, 84], [142, 86], [154, 98], [158, 106]], C.stone2); k.poly([[114, 104], [120, 92], [128, 87], [132, 92], [126, 104]], C.stone3);
      k.ring(122, 96, 4, 4, C.stone4); k.px(122, 96, C.stone1); k.line(130, 100, 150, 92, C.slate2, 2); k.line(140, 104, 152, 102, C.terra2, 2);
      k.rect(134, 84, 11, 9, C.wood2); k.rect(135, 85, 8, 6, C.glassDark); k.px(136, 86, C.glass); k.rect(146, 88, 8, 7, C.stone3); k.rect(147, 90, 2, 2, C.red2); k.rect(151, 90, 2, 2, C.red2);
      for (const [x, y] of [[168, 104], [168, 98]]) { k.ellipse(x, y, 8, 3, '#2a2a2e'); k.ellipse(x, y - 1, 7, 2, '#44444c'); k.ellipse(x, y - 1, 3, 1, '#1a1a1e'); }
      Props.crate(k, 170, 112, 9); Props.crate(k, 158, 116, 8); Props.sack(k, 104, 114, C.plaster1);
      Props.fence(k, 96, 136, 90);
      // Suburban touches: mailbox, lawn flamingo, lamps, shrubs.
      k.rect(117, 18, 2, 10, C.wood1); k.rect(113, 12, 10, 6, C.slate2); k.rect(113, 12, 10, 1, C.slate4); k.rect(123, 12, 1, 4, C.red2); k.rect(123, 12, 3, 2, C.red2);
      k.rect(90, 40, 1, 10, C.ink); k.ellipse(90, 38, 4, 2, '#f08aa8'); k.rect(92, 32, 1, 6, '#f08aa8'); k.rect(92, 31, 3, 2, '#f08aa8'); k.px(95, 32, C.ink);
      Props.lamp(k, -26, 124, false); Props.lamp(k, 24, 124, false);
      Props.bush(k, 40, 132, 1); Props.bush(k, 124, -30, 2); Props.bush(k, 186, -30, 0); Props.bush(k, -6, -14, 1); Props.rock(k, 76, 116, 0, 1);
      for (let i = 0; i < 12; i++) Props.flower(k, 30 + P.hash(i, 31) * 60, 100 + P.hash(i, 32) * 30, ['#8aa7d8', '#f2c14e', '#f6ecd0'][i % 3]);
      for (let i = 0; i < 10; i++) Props.flower(k, -186 + P.hash(i, 21) * 70, 10 + P.hash(i, 22) * 26, ['#8aa7d8', '#f6ecd0', '#c3a2c0'][i % 3]);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', err = state === 'error', wait = state === 'waiting', idle = state === 'idle';
      const blink = n => Math.floor(t * n) % 2;
      // Lit windows and lamps.
      if (live) {
        for (const x of [-144, -103]) { k.rect(x, -92, 3, 6, C.glassLit); k.rect(x + 4, -92, 3, 6, C.glassLit); k.rect(x, -85, 3, 4, '#f0b862'); k.rect(x + 4, -85, 3, 4, '#f0b862'); }
        for (const x of [133, 171]) { k.rect(x, -76, 5, 5, C.glassLit); k.rect(x + 6, -76, 4, 5, C.glassLit); }
        for (const x of [-26, 24]) k.rect(x - 1, 104, 4, 3, C.glassLit);
        k.rect(10, -61, 2, 2, C.glassLit);
      }
      // Dome telescope: sweeps the sky while working, parked when calm, jammed askew on error.
      const ang = run ? -1.9 + Math.sin(t * .35) * .35 : err ? -.6 : -1.57;
      const tx = DOME.x, ty = DOME.y - 8, ex = tx + Math.cos(ang) * 28, ey = ty + Math.sin(ang) * 28;
      k.line(tx, ty, ex, ey, '#3a2c1c', 6); k.line(tx, ty, ex, ey, C.gold1, 4); k.line(tx - 1, ty - 1, ex - 1, ey - 1, C.gold3, 1);
      k.circle(ex, ey, 3, C.gold0); k.circle(ex, ey, 2, run ? C.glass : C.glassDark); k.rect(tx - 3, ty - 2, 7, 5, C.gold0);
      if (run && z.detail) for (let i = 0; i < 3; i++) Props.sparkle(k, ex + [-8, 6, 12][i], ey + [-4, -8, 2][i], t + i * .3, C.gold4);
      const ar = run ? Math.abs(Math.cos(t * 1.4)) * 9 : 5; k.ring(ARM.x, ARM.y - 24, Math.max(1, Math.round(ar)), 9, C.gold3); k.circle(ARM.x, ARM.y - 24, 2, C.gold2);
      // Orrery planets.
      planet(k, ORR.x, ORR.y - 13, 3, C.gold3);
      [[9, 3, 1.3, C.red3, 1], [16, 5, .8, '#8aa7d8', 2], [23, 7, .5, C.plum3, 2]].forEach(([rx, ry, sp, c, r], i) => {
        if (err && i > 0) { planet(k, ORR.x - 30 + i * 44, ORR.y + 12 - i * 2, r, c); return; }
        const a = run ? t * sp + i * 2 : i * 2 + .8, px = ORR.x + Math.cos(a) * rx, py = ORR.y - 10 + Math.sin(a) * ry;
        k.line(ORR.x, ORR.y - 10, px, py, C.gold0); planet(k, px, py - 2, r, c);
      });
      // Anemometer.
      const wa = run ? t * 9 : .3;
      for (let i = 0; i < 3; i++) { const a = wa + i * 2.094, cx = ANEMO.x + Math.cos(a) * 8, cy = ANEMO.y + Math.sin(a) * 3; k.line(ANEMO.x, ANEMO.y, cx, cy, C.stone1); k.rect(cx - 1, cy - 1, 3, 2, Math.sin(a) > 0 ? C.stone3 : C.stone4); }
      k.rect(ANEMO.x - 1, ANEMO.y - 1, 3, 2, C.stone0);
      // State lamp by the observatory door.
      const lc = !live ? C.slate1 : err ? (blink(4) ? C.error : C.red0) : wait ? C.waiting : run ? C.working : C.idle;
      k.rect(-109, -78, 5, 5, C.ink); k.rect(-108, -77, 3, 3, lc);

      /* ----- Garage lab ----- */
      if (live) {
        k.rect(47, -60, 3, 2, C.glassLit); k.px(48, -59, C.white);
        if (z.detail) k.alpha(.16, () => { k.poly([[44, -58], [52, -58], [70, -42], [26, -42]], C.glassLit); });
        // Monitor: scrolling waveform while working, flat line otherwise, red alert on error.
        if (err) { if (blink(3)) { k.rect(59, -64, 10, 6, C.red0); k.text('!', 63, -64, C.error); } }
        else for (let i = 0; i < 10; i++) k.px(59 + i, -61 + (run ? Math.round(Math.sin(t * 8 + i * .9) * 2) : 0), wait ? C.waiting : '#6fdc3a');
        // Beakers bubble (fast while working, lazy when idle).
        const bs = run || err ? 1.6 : idle ? .5 : 0;
        if (bs) for (let i = 0; i < 4; i++) { const q = (t * bs + i * .37) % 1, bx = [26, 27, 33, 34][i], by0 = [-61, -61, -62, -62][i]; k.px(bx + (i % 2), by0 - q * 6, i < 2 ? '#c8f76a' : '#9fe070'); }
        // Portal gun vial glow.
        k.alpha(run ? .6 + Math.sin(t * 6) * .3 : .45, () => k.rect(41, -61, 5, 5, LIME)); k.px(42, -60, '#eaffc0');
        // Generator LEDs and dial.
        for (let i = 0; i < 3; i++) { const on = run ? Math.floor(t * 5 + i * 1.3) % 3 !== 0 : true; k.px(86 + i * 3, -64, !on ? '#1c3a1e' : err ? (blink(6) ? C.error : C.red0) : wait ? C.waiting : run ? [C.working, LIME, C.gold3][i] : C.idle); }
        const na = err ? -.3 + Math.sin(t * 40) * .15 : run ? -2.4 + Math.sin(t * 2.3) * .8 : -2.4;
        k.line(83, -60, 83 + Math.round(Math.cos(na) * 2), -60 + Math.round(Math.sin(na) * 2), err ? C.error : C.ink);
      } else k.alpha(.55, () => k.rect(OP.x, OP.y + 6, OP.w, 30, '#0a0c16'));
      if (err) {
        soot(k, 87, -72, t * 1.3, 3, '#2a282e');
        for (let i = 0; i < 5; i++) if (Math.floor(t * 10 + i * 1.7) % 3 === 0) plus(k, 80 + ((i * 7) % 16), -68 + ((i * 5) % 9), i % 2 ? C.gold4 : C.error, i === 0);
      }
      // Saucer running lights: chase while working.
      for (let i = 0; i < 6; i++) { const lx = SAU.x - 18 + i * 7, on = run ? Math.floor(t * 6) % 6 === i : i === 2; k.px(lx, SAU.y + 1, !live ? '#3e444a' : on ? (err ? C.error : wait ? C.waiting : LIME) : '#2f5a36'); }
      // Stabiliser LED.
      k.px(STAB.x - 3, STAB.y - 1, !live ? C.slate0 : err ? (blink(5) ? C.error : C.red0) : wait ? C.waiting : run ? (blink(3) ? C.working : '#2f5a36') : C.idle);
      if (err && Math.floor(t * 7) % 3 === 0) { plus(k, STAB.x + 10, STAB.y - 6, C.gold4, true); plus(k, STAB.x + 7, STAB.y + 6, C.error, false); }

      /* ----- The portal ----- */
      if (run || err) {
        const v = err ? 'e' : 'g', f = err ? Math.floor(t * 22) % 12 : Math.floor(t * 12) % 12;
        const jx = err ? Math.round(Math.sin(t * 37) * 2) : 0, jy = err ? Math.round(Math.cos(t * 29)) : 0, gc = GLOW[v];
        k.alpha(.26 + Math.sin(t * 4) * .05, () => k.ellipse(PORT.x, PORT.gy, 30, 7, gc));
        k.blit(haloSprite(v), PORT.x + jx, PORT.y + jy, false, .2);
        k.blit(portalSprite(v, f), PORT.x + jx, PORT.y + jy);
        if (z.detail) {
          // Goo dripping from the lower rim and splatting on the grass.
          for (let i = 0; i < 4; i++) {
            const q = (t * 1.1 + i * .25) % 1, dx = [-9, -3, 4, 10][i], x = PORT.x + dx + jx, rimY = PORT.y + Math.round(24 * Math.sqrt(1 - (dx / 17) ** 2)) + jy;
            if (q < .8) k.rect(x, rimY + q * (PORT.gy - rimY), 1, 2, i % 2 ? LIME : '#5cc83a'); else { k.rect(x - 1, PORT.gy, 3, 1, LIME); k.px(x - 2, PORT.gy - 1, '#a4ec6a'); k.px(x + 2, PORT.gy - 1, '#a4ec6a'); }
          }
          // Flecks flung off the spinning edge.
          for (let i = 0; i < 6; i++) { const q = (t * 1.3 + i / 6) % 1, a = i * 1.047 + t * (err ? -2 : .8); k.alpha(1 - q, () => k.rect(PORT.x + jx + Math.cos(a) * (17 + q * 10), PORT.y + jy + Math.sin(a) * (25 + q * 10), 2, 1, err && i % 2 ? C.error : LIME)); }
        }
        if (err) {
          soot(k, PORT.x + 4, PORT.y - 26, t, 4, '#1e1c22');
          for (let i = 0; i < 6; i++) if (Math.floor(t * 9 + i * 1.7) % 3 === 0) { const a = i * 1.1 + Math.floor(t * 3); plus(k, PORT.x + Math.cos(a) * 19, PORT.y + Math.sin(a) * 27, i % 3 ? C.error : C.gold4, i % 2 === 0); }
        }
      } else if (wait) {
        // Halted: frozen swirl flickering between amber and green.
        const v = Math.floor(t * 6) % 7 === 3 ? 'g' : 'a', a = .65 + (Math.floor(t * 9) % 2) * .35;
        k.alpha(.25, () => k.ellipse(PORT.x, PORT.gy, 28, 6, GLOW[v]));
        k.blit(haloSprite(v), PORT.x, PORT.y, false, .15);
        k.blit(portalSprite(v, 0), PORT.x, PORT.y, false, a);
      } else if (idle) k.blit(ringSprite(), PORT.x, PORT.y, false, .4 + Math.sin(t * 1.5) * .12);

      // Amber lamp by the portal, and the held batch of crates.
      if (wait) {
        k.rect(AMB.x - 1, AMB.y - 20, 4, 3, blink(2) ? C.waiting : C.gold2);
        if (z.detail) k.alpha(.28, () => k.circle(AMB.x + 1, AMB.y - 19, 6, C.waiting));
        Props.crate(k, -102, 66, 9); Props.crate(k, -92, 68, 8); Props.crate(k, -98, 58, 7);
        k.rect(-94, 58, 4, 3, C.waiting); k.px(-95, 59, C.ink);
        k.rect(-124, 56, 20, 8, C.ink); k.rect(-123, 57, 18, 6, C.waiting); k.text('HOLD', -121, 58, C.ink); k.rect(-115, 64, 1, 10, C.wood1);
      } else if (live) k.rect(AMB.x - 1, AMB.y - 20, 4, 3, C.glassDark);

      /* ----- The scientist and the kid ----- */
      if (run) { const m = ((t % MC) + MC) % MC; if (m >= LAB0) lab(k, m - LAB0, t, z.detail); else [m < CYCLE ? commute(k, 's', m) : null, m < CYCLE + .8 ? commute(k, 'k', m - .8) : null].filter(Boolean).sort((a, b) => a[0] - b[0]).forEach(d => d[1]()); }
      else if (idle) { figure(k, 's', SEAT[0][0], SEAT[0][1], 'sit', 0, false); figure(k, 'k', SEAT[1][0], SEAT[1][1], 'sit', 0, true); }
      else if (wait) { figure(k, 's', -16, 84, 'stand', 0, true); figure(k, 'k', -4 + (Math.floor(t * 6) % 2), 90, 'stand', 0, true); }
      else if (err) loose(k, t, z.detail);

      // Crew: the chart scribe on the terrace.
      if (run) z.crew(-60, -18, { look: 2, hat: 'hood', hatColor: NIGHT, anim: 'work', tool: 'pen', phase: .3 });
      else z.crew(-60, -18, { look: 2, hat: 'hood', hatColor: NIGHT, anim: live ? (idle ? 'sit' : 'idle') : 'sleep' });
      if (idle) for (let i = 0; i < 3; i++) Props.butterfly(k, -140 + Math.sin(t * .7 + i * 2) * 30, 108 + Math.cos(t * 1.1 + i) * 8, t + i, ['#8aa7d8', '#f2c14e', '#f6ecd0'][i]);
      if (live && !err && z.detail) for (let i = 0; i < 2; i++) Props.bird(k, ((t * 13 + i * 190) % 360) - 180, -140 + i * 8 + Math.sin(t * 2 + i) * 3, t + i);

      // The lead: out on the lawn between the portal and the garage; asleep by the flower bed when off.
      if (state === 'off') z.lead(REST.x, REST.y, {}); else z.lead(LEAD.x, LEAD.y, {});
      if (live && !err) Props.smoke(k, 175, -100, t * (run ? 1 : .5), run ? 3 : 2);
    }
  };
})();
