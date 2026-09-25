/* Farm · The slave fields of Nurn: ash-grey furrows of red thorn-pods and black thorn-wheat behind bone fences, a skull
   scarecrow, a black windmill with tattered sails, a water-lifting wheel on the black canal turned by chained goblins at
   a capstan, Doom's pentagram portal spitting lost souls, a bubbling cauldron by the slave hut, and the harvest cart
   under the Red Eye banner. Orcs and hollows hoe and haul under a Nazgûl's whip while an imp pokes with a pitchfork.
   Resource zone: no lead. Cartoonish: no blood. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.farm = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const ASH = ['#1c1818', '#2e2826', '#3e3633', '#4c4440', '#5a514c', '#6c625b', '#8a8078'];
  const SOIL = ['#262022', '#342c2c', '#443a38', '#564a46', '#6a5e58'];
  const LAVA = ['#5a140c', '#8e200e', '#c43a12', '#ec6418', '#ff9a2a', '#ffcc55', '#fff2b0'];
  const IRON = ['#111114', '#1e1f24', '#2e3038', '#454854', '#646876', '#8c909c'];
  const TOX = ['#173010', '#285a14', '#3f8e1c', '#62c42a', '#9ef04a', '#d8ff9a'];
  const BONE = ['#8a8070', '#b8ae98', '#dcd4bc', '#f4eedc'];
  const BARK = ['#0c0909', '#171112', '#231b1b', '#352a28', '#5e4e47'];
  const THORN = ['#1a0e10', '#3a1618', '#7a1a1e', '#b8282a', '#e8544a'];
  const MILL = { x: -116, y: -64, hub: -112 };
  const WHEEL = { x: 112, y: -112, r: 17 };
  const CAP = { x: 150, y: -70, rx: 17, ry: 6 };      // capstan the chained goblins turn
  const PORTAL = { x: -10, y: -118, rx: 26, ry: 9 };
  const FIELD_L = { x0: -176, x1: -20, y0: -44, y1: 42 };
  const FIELD_R = { x0: 20, x1: 176, y0: -44, y1: 42 };
  const POT = { x: -96, y: 100 };                     // cauldron
  const CARTP = { x: 56, y: 116 };
  const TOWER = { x: -40, y: 132 };                     // signal fire pole

  /* ---------- Local helpers ---------- */
  const skull = (k, x, y) => { k.rect(x - 2, y - 4, 5, 4, BONE[2]); k.rect(x - 1, y, 3, 1, BONE[1]); k.px(x - 2, y - 4, BONE[3]); k.px(x - 1, y - 3, IRON[0]); k.px(x + 1, y - 3, IRON[0]); };
  const chain = (k, x0, y0, x1, y1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); k.px(x, y, i % 2 ? IRON[3] : IRON[5]); if (!(i % 2)) k.px(x, y + 1, IRON[1]); } };
  const sagChain = (k, x0, y0, x1, y1, sag = 4) => { const mx = (x0 + x1) >> 1, my = ((y0 + y1) >> 1) + sag; chain(k, x0, y0, mx, my); chain(k, mx, my, x1, y1); };
  // Bone fence: femur rails between bone posts, a skull on every third post.
  const boneFence = (k, x, y, len) => {
    k.rect(x + 1, y + 1, len, 1, C.shadow); k.rect(x, y - 6, len, 2, BONE[1]); k.rect(x, y - 6, len, 1, BONE[2]); k.rect(x, y - 3, len, 1, BONE[0]);
    for (let i = 0, n = 0; i <= len; i += 9, n++) { k.rect(x + i, y - 8, 2, 9, BONE[2]); k.px(x + i, y - 8, BONE[3]); k.px(x + i + 1, y - 2, BONE[0]); k.rect(x + i - 1, y - 9, 4, 1, BONE[1]); if (n % 3 === 0) skull(k, x + i + 1, y - 9); }
  };
  const brazier = (k, x, y) => {
    k.ellipse(x + 2, y + 1, 6, 2, C.shadow); k.line(x - 4, y, x - 1, y - 7, IRON[2]); k.line(x + 4, y, x + 1, y - 7, IRON[1]); k.rect(x, y - 7, 1, 7, IRON[3]);
    k.poly([[x - 6, y - 11], [x + 6, y - 11], [x + 4, y - 7], [x - 4, y - 7]], IRON[2]); k.rect(x - 6, y - 11, 13, 1, IRON[4]); k.rect(x - 5, y - 12, 11, 1, LAVA[0]);
  };
  const flame = (k, x, y, t, s = 1, hue = 0) => {
    const f = Math.floor(t * 12 + x) % 3, A = hue === 1 ? ['#b86a10', '#f4b73a', '#ffe08a'] : hue === 2 ? [TOX[2], TOX[4], TOX[5]] : [LAVA[3], LAVA[4], LAVA[5]];
    k.poly([[x - 3 * s, y], [x - 1, y - (7 + f) * s], [x + 1, y - 4 * s], [x + 2 * s, y - (6 - f) * s], [x + 3 * s, y]], A[0]);
    k.poly([[x - 2 * s, y], [x, y - (5 + f) * s], [x + 2 * s, y]], A[1]); k.px(x, y - 1, A[2]);
  };
  const embers = (k, x, y, t, n, spread = 10, rise = 30, speed = .6) => { for (let i = 0; i < n; i++) { const q = (t * speed + i / n) % 1; k.px(x + Math.sin(i * 2.3 + q * 4) * spread * (.3 + q), y - q * rise, q < .4 ? LAVA[5] : q < .7 ? LAVA[4] : LAVA[2]); } };
  // Crops: red thorn-pods on black briar stems, and black thorn-wheat with ember-red ears.
  const thornPod = (k, x, y, s) => {
    k.line(x, y, x - 2, y - 5, THORN[0]); k.line(x, y, x + 2, y - 6, THORN[1]); k.rect(x, y - 4, 1, 4, THORN[1]);
    k.px(x - 3, y - 3, THORN[1]); k.px(x + 3, y - 3, THORN[0]); k.px(x - 1, y - 2, BONE[1]); k.px(x + 1, y - 4, BONE[1]);
    k.rect(x - 3, y - 7, 2, 2, THORN[3]); k.px(x - 3, y - 7, THORN[4]); if (s % 2) { k.rect(x + 2, y - 8, 2, 2, THORN[3]); k.px(x + 2, y - 8, THORN[4]); } if (s % 3 === 0) { k.rect(x, y - 6, 2, 2, THORN[2]); }
  };
  const thornWheat = (k, x, y, s) => { const h = 6 + (s % 3); k.rect(x, y - h, 1, h, BARK[2]); k.px(x - 1, y - h + 3, BARK[3]); k.px(x + 1, y - h + 5, BARK[1]); k.rect(x, y - h - 2, 1, 2, THORN[2]); k.px(x, y - h - 3, THORN[4]); k.px(x + 1, y - h - 1, THORN[3]); };
  const basket = (k, x, y, full = true) => { k.ellipse(x + 4, y + 1, 5, 1, C.shadow); k.rect(x, y - 5, 9, 5, '#5a4630'); k.rect(x, y - 5, 9, 1, '#7a6040'); for (let i = 1; i < 9; i += 2) k.px(x + i, y - 3, '#3a2c1e'); if (full) { k.rect(x + 1, y - 7, 7, 2, THORN[3]); k.px(x + 2, y - 7, THORN[4]); k.px(x + 5, y - 8, THORN[2]); } };

  /* ---------- Cached moving sprites ---------- */
  const blitD = (k, s, x, y, off, flip = false) => { k.blit(s, x, y, flip); if (off) k.blit(P.tint(s, '#141c3c'), x, y, flip, .4); };
  // Tattered windmill sails: four torn cloth sails on black spars, symmetric every 90 degrees -> 9 frames of 10 degrees.
  const sailSprite = f => P.sprite(`fm-hell-sails|${f}`, 64, 64, 32, 32, q => {
    for (let i = 0; i < 4; i++) {
      const a = f * Math.PI / 18 + i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), T = (r, w) => [c * r - s * w, s * r + c * w];
      q.poly([T(7, 1), T(29, 1), T(26, 7), T(20, 5), T(15, 8), T(7, 7)], i % 2 ? '#5a1a1c' : '#3a1418'); q.poly([T(7, 1), T(29, 1), T(28, 3), T(7, 3)], '#7a2a2a');
      for (let r = 11; r <= 27; r += 5) q.line(...T(r, 1), ...T(r, 6), BARK[1]);
      q.line(...T(2, 0), ...T(30, 0), BARK[2], 2);
    }
    q.circle(0, 0, 4, BARK[2]); q.circle(0, 0, 3, BARK[3]); q.px(-1, -1, BONE[2]); q.px(0, 0, IRON[0]);
  }, C.ink);
  // Water-lifting wheel (noria) with buckets: 12 buckets -> 6 frames of 5 degrees loop.
  const noriaSprite = f => P.sprite(`fm-hell-noria|${f}`, 44, 44, 22, 22, q => {
    const R = WHEEL.r, a0 = f * Math.PI / 36;
    for (let i = 0; i < 6; i++) { const b = a0 + i * Math.PI / 3; q.line(Math.cos(b) * 3, Math.sin(b) * 3, Math.cos(b) * (R - 2), Math.sin(b) * (R - 2), BARK[2], 2); }
    q.ring(0, 0, R - 1, R - 1, BARK[1]); q.ring(0, 0, R - 2, R - 2, BARK[3]); q.ring(0, 0, R - 5, R - 5, BARK[2]);
    for (let i = 0; i < 12; i++) { const b = a0 + i * Math.PI / 6, x = Math.round(Math.cos(b) * R), y = Math.round(Math.sin(b) * R); q.rect(x - 2, y - 2, 4, 4, IRON[3]); q.px(x - 2, y - 2, IRON[5]); if (y > -4) q.rect(x - 1, y - 2, 2, 1, '#2a3a4a'); }
    q.circle(0, 0, 4, IRON[2]); q.circle(0, 0, 3, IRON[3]); q.px(-1, -1, IRON[5]);
  }, C.ink);
  const scarecrow = sw => P.sprite(`fm-hell-scare|${sw}`, 26, 36, 13, 34, q => {
    q.rect(0, -28, 2, 28, BARK[2]); q.rect(0, -28, 1, 28, BARK[4]); q.rect(-9, -21, 20, 2, BARK[2]);
    q.poly([[-5, -21], [7, -21], [8 + sw, -8], [4, -11], [1, -6], [-2, -10], [-6 + sw, -7]], '#2a2228'); q.rect(-5, -21, 12, 1, '#4a3a44');
    for (const x of [-10, 10]) { q.rect(x, -22, 2, 4, '#2a2228'); q.px(x + (x < 0 ? -1 : 2) + sw, -18, '#2a2228'); }
    q.rect(-3, -30, 8, 7, BONE[2]); q.rect(-3, -30, 8, 1, BONE[3]); q.rect(-2, -27, 2, 2, IRON[0]); q.rect(2, -27, 2, 2, IRON[0]); q.px(1, -25, IRON[0]); q.rect(-1, -23, 5, 1, BONE[1]);
    q.poly([[-3, -30], [-7, -35], [-2, -31]], BONE[1]); q.poly([[5, -30], [9, -35], [4, -31]], BONE[0]);
    q.px(-1, -26, LAVA[4]); q.px(3, -26, LAVA[4]);
  });
  const halo = (r, col) => P.sprite(`fm-hell-halo|${r}|${col}`, r * 2 + 2, r * 2 + 2, r + 1, r + 1, q => q.circle(0, 0, r, col), null);

  return {
    paint(k) {
      /* ---- Ground: ash-grey dust with cinders; a packed road to the gate ---- */
      k.rectTex(-210, -165, 420, 320, (x, y) => {
        const h = P.hash(x * 3, y * 5), g = P.hash(Math.floor((x + (y >> 2) * 3) / 5), y >> 2);
        if (Math.abs(x + Math.sin(y * .05) * 2) < 12 && y > -50) return h > .85 ? ASH[6] : g > .5 ? ASH[5] : '#645a53';
        if (h < .05) return ASH[2]; if (h > .975) return ASH[6]; if (h > .968) return '#5e2a1e';
        return g > .6 ? ASH[3] : g > .25 ? ASH[4] : '#554b46';
      });

      /* ---- Black canal and the water-lifting wheel (north-east) ---- */
      k.poly([[40, -170], [210, -170], [210, -128], [150, -124], [96, -128], [56, -136]], BARK[1]);
      k.polyTex([[44, -170], [210, -170], [210, -131], [150, -127], [96, -131], [58, -139]], (x, y) => { const h = P.hash(x, y * 3); if ((Math.floor(y / 2) + x * 3) % 19 === 0) return '#4a3a5a'; return h > .9 ? '#243040' : (x + y) & 1 ? '#161c26' : '#1a2230'; });
      for (let x = 58; x < 150; x += 8) { k.rect(x, -133 + Math.round((x - 58) * .04), 6, 2, ASH[4]); k.px(x, -133 + Math.round((x - 58) * .04), ASH[6]); }
      // Wheel frame, aqueduct trough to the fields, the capstan pit and its drive shaft.
      for (const dx of [-14, 12]) { k.rect(WHEEL.x + dx, WHEEL.y - 4, 3, 30, BARK[2]); k.rect(WHEEL.x + dx, WHEEL.y - 4, 1, 30, BARK[4]); }
      k.rect(WHEEL.x - 16, WHEEL.y - 6, 34, 3, BARK[3]); k.rect(WHEEL.x - 16, WHEEL.y - 6, 34, 1, BARK[4]);
      k.rect(WHEEL.x - 40, WHEEL.y - 22, 32, 4, BARK[2]); k.rect(WHEEL.x - 40, WHEEL.y - 22, 32, 1, BARK[4]); k.rect(WHEEL.x - 39, WHEEL.y - 21, 30, 2, '#1a2230');
      k.line(WHEEL.x - 38, WHEEL.y - 18, 44, -56, BARK[1], 4); k.line(WHEEL.x - 38, WHEEL.y - 19, 44, -57, BARK[3], 2); k.line(WHEEL.x - 38, WHEEL.y - 20, 44, -58, '#2a3a4a', 1);
      for (const [x, y] of [[62, -84], [52, -70]]) { k.rect(x, y, 2, 14, BARK[2]); k.px(x, y, BARK[4]); }
      k.ellipse(CAP.x, CAP.y + 2, CAP.rx + 6, CAP.ry + 4, ASH[2]); k.ellipse(CAP.x, CAP.y + 1, CAP.rx + 3, CAP.ry + 2, '#3a302c'); k.ring(CAP.x, CAP.y + 1, CAP.rx, CAP.ry, ASH[1]);
      k.line(CAP.x, CAP.y - 14, WHEEL.x + 4, WHEEL.y + 6, BARK[2], 2); k.line(CAP.x, CAP.y - 15, WHEEL.x + 4, WHEEL.y + 5, BARK[4], 1);

      /* ---- Pentagram portal (Doom), top centre ---- */
      { const { x, y, rx, ry } = PORTAL;
        k.ellipse(x + 3, y + 3, rx + 6, ry + 4, C.shadow); k.ellipse(x, y, rx + 5, ry + 4, ASH[2]); k.ellipse(x, y - 1, rx + 4, ry + 3, ASH[5]); k.ellipse(x, y, rx, ry, '#140a0e');
        k.ring(x, y, rx - 2, ry - 1, THORN[3]); const pts = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; pts.push([x + Math.cos(a) * (rx - 3), y + Math.sin(a) * (ry - 1)]); } pts.push(pts[0]); k.path(pts, THORN[3], 1);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.rect(x + Math.cos(a) * (rx + 3) - 1, y + Math.sin(a) * (ry + 2) - 1, 3, 2, i % 2 ? ASH[3] : ASH[6]); }
        for (const dx of [-rx - 8, rx + 4]) { k.rect(x + dx, y - 26, 5, 26, ASH[3]); k.rect(x + dx, y - 26, 1, 26, ASH[6]); k.rect(x + dx + 4, y - 26, 1, 26, ASH[1]); k.rect(x + dx - 1, y - 28, 7, 3, ASH[4]); skull(k, x + dx + 2, y - 29); for (let j = 0; j < 3; j++) k.px(x + dx + 2, y - 20 + j * 6, THORN[3]); } }

      /* ---- Black windmill (north-west) ---- */
      { const mx = MILL.x, mb = MILL.y, mt = -110;
        k.poly([[mx + 13, mb], [mx + 21, mb - 3], [mx + 16, mt + 6], [mx + 8, mt]], C.shadow);
        k.polyTex([[mx - 13, mb], [mx + 13, mb], [mx + 8, mt], [mx - 8, mt]], (x, y) => { const f = (y - mt) / (mb - mt), half = 8 + 5 * f, u = (x - mx + half) / (half * 2); if (u < .18) return BARK[4]; if (u > .8) return u > .92 ? BARK[0] : BARK[1]; return (y % 5 === 0) ? BARK[1] : (P.hash(x, y) > .96 ? BARK[4] : BARK[2]); });
        k.rect(mx - 14, mb - 4, 28, 4, ASH[3]); k.rect(mx - 14, mb - 4, 28, 1, ASH[5]);
        k.rect(mx - 4, mb - 13, 9, 13, IRON[0]); k.rect(mx - 3, mb - 12, 7, 12, '#2a0e0c'); k.rect(mx - 2, mt + 14, 5, 6, '#1a0808');
        k.poly([[mx - 11, mt + 1], [mx + 11, mt + 1], [mx + 7, mt - 7], [mx, mt - 13], [mx - 7, mt - 7]], BARK[1]); k.poly([[mx - 9, mt], [mx + 1, mt], [mx, mt - 12], [mx - 6, mt - 7]], BARK[3]); k.rect(mx - 11, mt, 22, 2, BARK[0]);
        k.poly([[mx - 1, mt - 13], [mx + 1, mt - 13], [mx, mt - 19]], IRON[3]);
        for (let i = 0; i < 3; i++) { const x = mx + 16 + (i % 2) * 8, y = mb - 2 + Math.floor(i / 2) * 5; k.ellipse(x + 3, y, 4, 3, '#4a3a2a'); k.ellipse(x + 2, y - 1, 3, 2, '#6a5236'); } }

      /* ---- The fields: ash furrows, crops, a hoed strip and bone fences ---- */
      for (const [F, crop] of [[FIELD_L, 0], [FIELD_R, 1]]) {
        k.rect(F.x0 + 2, F.y1 + 1, F.x1 - F.x0, 2, C.shadowSoft); k.rect(F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0, SOIL[1]);
        for (let r = 0, y = F.y0 + 4; y < F.y1 - 2; y += 8, r++) {
          k.rect(F.x0, y, F.x1 - F.x0, 3, SOIL[3]); k.rect(F.x0, y, F.x1 - F.x0, 1, SOIL[4]); k.rect(F.x0, y + 3, F.x1 - F.x0, 1, SOIL[0]);
          for (let x = F.x0 + 2; x < F.x1 - 2; x += 3) if (P.hash(x, y) > .7) k.px(x, y + 1, SOIL[2]);
          const bare = (crop === 0 && r === 5) || (crop === 1 && r === 3);   // strips being hoed (crews stand here)
          if (!bare) for (let x = F.x0 + 4 + (r % 2) * 3; x < F.x1 - 3; x += crop ? 5 : 7) { if (P.hash(x, r + crop * 9) < .1) continue; crop ? thornWheat(k, x, y + 2, x + r) : thornPod(k, x, y + 2, x + r); }
        }
        boneFence(k, F.x0, F.y0 - 2, F.x1 - F.x0); boneFence(k, F.x0, F.y1 + 6, F.x1 - F.x0);
      }
      // Irrigation trough ends pour onto the right field; a skull-lined ditch runs along the left field.
      k.rect(38, -58, 10, 4, BARK[2]); k.rect(39, -57, 8, 2, '#1a2230');
      for (let i = 0; i < 6; i++) skull(k, -170 + i * 30, 52);

      /* ---- Slave hut, cauldron and firewood (south-west) ---- */
      { const hx = -170, hy = 90; k.rect(hx + 3, hy - 2, 44, 4, C.shadow); k.rect(hx, hy - 20, 40, 20, BARK[2]); for (let x = hx + 2; x < hx + 40; x += 4) { k.rect(x, hy - 20, 1, 20, BARK[1]); k.px(x + 2, hy - 16 + (x % 9), BARK[3]); }
        k.poly([[hx - 5, hy - 18], [hx + 45, hy - 18], [hx + 38, hy - 34], [hx + 2, hy - 34]], '#3a3228'); for (let i = 0; i < 12; i++) k.line(hx - 3 + i * 4, hy - 18, hx + 3 + i * 3, hy - 34, '#524634'); k.rect(hx - 5, hy - 19, 50, 1, '#221c16');
        k.rect(hx + 15, hy - 14, 10, 14, '#120c0c'); k.rect(hx + 4, hy - 14, 7, 5, '#120c0c'); k.rect(hx + 29, hy - 14, 7, 5, '#120c0c');
        for (let i = 0; i < 3; i++) { k.rect(hx + 40 + i * 2, hy - 8, 1, 8, IRON[3]); } sagChain(k, hx + 42, hy - 6, hx + 56, hy + 6, 3); }
      { const { x, y } = POT; k.ellipse(x + 3, y + 3, 16, 4, C.shadow);
        for (let i = 0; i < 5; i++) k.line(x - 10 + i * 5, y + 4, x - 6 + i * 3, y - 2, BARK[2], 2);
        k.line(x - 14, y + 2, x - 11, y - 22, BARK[2], 2); k.line(x + 14, y + 2, x + 11, y - 22, BARK[2], 2); k.rect(x - 12, y - 24, 25, 2, BARK[3]); k.line(x, y - 22, x, y - 16, IRON[3]);
        k.ellipse(x, y - 6, 12, 9, IRON[1]); k.ellipse(x - 2, y - 8, 9, 6, IRON[2]); k.px(x - 7, y - 10, IRON[4]); k.ellipse(x, y - 14, 11, 3, IRON[3]); k.ellipse(x, y - 14, 9, 2, TOX[2]); k.ellipse(x - 1, y - 15, 6, 1, TOX[3]);
        k.rect(x + 12, y - 20, 2, 18, '#5a4630'); k.ellipse(x + 13, y - 2, 3, 1, '#3a2c1e'); }
      for (let i = 0; i < 6; i++) basket(k, -140 + (i % 3) * 11, 122 - Math.floor(i / 3) * 7, i < 4);
      for (let i = 0; i < 7; i++) { const x = -60 + (i % 3) * 4, y = 80 - Math.floor(i / 3) * 2; k.line(x, y, x + 5, y - 1, BONE[1 + (i % 3)]); } skull(k, -54, 74);

      /* ---- Harvest cart, Red Eye banner and signal pole (south-east) ---- */
      Props.cart(k, CARTP.x, CARTP.y, (q, x, y) => { for (let i = 0; i < 3; i++) { q.rect(x + 2 + i * 7, y - 6, 6, 5, '#5a4630'); q.rect(x + 3 + i * 7, y - 8, 4, 2, THORN[3]); q.px(x + 3 + i * 7, y - 8, THORN[4]); } });
      for (let i = 0; i < 4; i++) basket(k, 94 + (i % 2) * 11, 126 - Math.floor(i / 2) * 7);
      { const x = 142, y = 90; k.rect(x, y - 50, 2, 50, BARK[2]); k.rect(x, y - 50, 1, 50, BARK[4]); k.poly([[x - 1, y - 50], [x + 3, y - 50], [x + 1, y - 55]], IRON[4]);
        k.rect(x + 2, y - 48, 18, 24, '#141214'); k.rect(x + 2, y - 48, 18, 1, IRON[3]); for (let i = 0; i < 3; i++) k.poly([[x + 2 + i * 6, y - 24], [x + 8 + i * 6, y - 24], [x + 5 + i * 6, y - 20]], '#141214');
        k.ellipse(x + 11, y - 36, 7, 4, LAVA[2]); k.ellipse(x + 11, y - 36, 5, 3, LAVA[4]); k.rect(x + 10, y - 39, 2, 7, IRON[0]); k.px(x + 7, y - 36, LAVA[5]); }
      { const { x, y } = TOWER; k.ellipse(x + 3, y + 1, 7, 2, C.shadow); k.rect(x - 1, y - 34, 3, 34, BARK[2]); k.rect(x - 1, y - 34, 1, 34, BARK[4]); k.line(x - 6, y, x, y - 12, BARK[1]); k.line(x + 6, y, x + 1, y - 12, BARK[1]);
        k.poly([[x - 6, y - 38], [x + 7, y - 38], [x + 5, y - 34], [x - 4, y - 34]], IRON[2]); k.rect(x - 6, y - 39, 14, 1, IRON[4]); }
      brazier(k, -30, 64); brazier(k, 150, 110);
      // Drying rack of thorn-pods and a gruel trough (south-east yard).
      { const x = 78, y = 88; k.rect(x + 2, y, 40, 2, C.shadow); for (const dx of [0, 36]) { k.rect(x + dx, y - 22, 2, 22, BARK[2]); k.px(x + dx, y - 22, BARK[4]); } k.rect(x, y - 22, 38, 2, BARK[3]); k.rect(x, y - 12, 38, 1, BARK[2]);
        for (let i = 0; i < 8; i++) { const px = x + 3 + i * 4; k.rect(px, y - 20, 1, 3 + (i % 3), '#5a4630'); k.rect(px - 1, y - 17 + (i % 3), 3, 3, THORN[i % 2 ? 3 : 2]); k.px(px - 1, y - 17 + (i % 3), THORN[4]); }
        for (let i = 0; i < 6; i++) { const px = x + 5 + i * 5; k.rect(px, y - 10, 3, 4, BONE[i % 2 ? 1 : 2]); } }
      k.rect(96, 104, 26, 5, BARK[2]); k.rect(97, 105, 24, 2, '#6a645a'); k.rect(96, 104, 26, 1, BARK[4]);
      for (const [x, y] of [[-176, -110], [-160, -130], [-178, -80], [160, -30], [178, -10]]) { for (let j = 0; j < 3; j++) { k.line(x + j * 3, y, x + j * 3 - 3, y - 6, THORN[0]); k.line(x + j * 3, y, x + j * 3 + 2, y - 7, THORN[1]); k.px(x + j * 3 - 3, y - 6, THORN[3]); } }
      Props.sign(k, 20, 142, 'NURN', '#3a2622');
      for (let i = 0; i < 16; i++) { const x = -170 + P.hash(i, 31) * 340, y = 60 + P.hash(i, 37) * 80; if (Math.abs(x) > 18) { k.px(x, y, BONE[0]); k.px(x + 1, y, BONE[1]); } }
      for (let i = 0; i < 10; i++) { const x = -60 + P.hash(i, 41) * 180, y = -150 + P.hash(i, 43) * 14; if (Math.abs(x - PORTAL.x) > 40) { k.line(x, y, x - 2, y - 4, THORN[0]); k.line(x, y, x + 2, y - 5, THORN[1]); k.px(x - 2, y - 4, THORN[3]); } }
    },

    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', wait = state === 'waiting', err = state === 'error', idle = state === 'idle';
      const W = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o });
      const crack = ph => (window.AgentCharacters?.crackAge ? AgentCharacters.crackAge(t, { phase: ph }) : 9) < .5;
      const R = (x, y, kind, o = {}) => z.crew(x, y, { kind, ...o, state: 'working' });

      /* Portal: swirling red glow, pentagram pulsing; lost souls circle out of it (a swarm on error). */
      const pa = run ? 1 : err ? 1.3 : live ? .5 : .12;
      k.alpha(pa * (.2 + .08 * Math.sin(t * 3)), () => k.blit(halo(16, THORN[3]), PORTAL.x, PORTAL.y - 6));
      if (live) {
        for (let i = 0; i < 8; i++) { const a = t * (run || err ? 2.4 : .8) + i * Math.PI / 4, r = .4 + .5 * ((i % 3) / 2); k.px(PORTAL.x + Math.cos(a) * (PORTAL.rx - 4) * r, PORTAL.y + Math.sin(a) * (PORTAL.ry - 2) * r, i % 2 ? '#e0a8ff' : THORN[4]); }
        const pts = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; pts.push([PORTAL.x + Math.cos(a) * (PORTAL.rx - 3), PORTAL.y + Math.sin(a) * (PORTAL.ry - 1)]); } pts.push(pts[0]);
        k.alpha(pa * (.5 + .4 * Math.sin(t * 4)), () => k.path(pts, err ? C.error : LAVA[4], 1));
        embers(k, PORTAL.x, PORTAL.y - 2, t, run ? 6 : 3, 18, 26, .5);
      }
      const souls = run ? 3 : err ? 5 : idle || wait ? 1 : 0;
      for (let i = 0; i < souls; i++) {
        const q = (t * (err ? .22 : .12) + i / souls) % 1, a = q * Math.PI * 2;
        const sx = PORTAL.x + Math.cos(a) * (err ? 70 + i * 12 : 44 + i * 10), sy = PORTAL.y + 34 + Math.sin(a) * (err ? 30 : 16);
        R(Math.round(sx), Math.round(sy), 'lostsoul', { anim: 'idle', facing: Math.sin(a) > 0 ? -1 : 1, phase: i * .3, mark: false });
      }

      /* Windmill sails: turning while working, braked otherwise, burning on error. */
      const sf = run ? Math.floor(t * 6) % 9 : err ? 3 : 0;
      blitD(k, sailSprite(sf), MILL.x, MILL.hub, !live);
      if (err) { flame(k, MILL.x + 6, MILL.hub - 4, t, 1.5); flame(k, MILL.x - 14, MILL.hub + 12, t + .4, 1); Props.smoke(k, MILL.x, MILL.hub - 10, t * 1.3, 6, '#141012'); }
      if (live) { k.alpha(.4 + .2 * Math.sin(t * 3), () => k.rect(MILL.x - 2, -96, 5, 6, err ? C.error : LAVA[3])); }

      /* Noria wheel lifts black water while the capstan turns; drips spill into the trough. */
      const nf = run ? Math.floor(t * 8) % 6 : 0;
      blitD(k, noriaSprite(nf), WHEEL.x, WHEEL.y, !live);
      if (run) { for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; k.px(WHEEL.x - 10 - q * 4, WHEEL.y - 16 + q * 6, '#6a7a9a'); } for (let i = 0; i < 4; i++) k.px(40 + (i * 3) % 6, -54 + ((t * 30 + i * 5) % 10), '#4a5a7a'); }

      /* Capstan: chained goblins walk the ring, pushing the spokes; a Nazgûl cracks the whip over them. */
      const ca = run ? t * .5 : 0;
      const capWalker = i => { const a = ca + i * Math.PI * 2 / 3, x = Math.round(CAP.x + Math.cos(a) * CAP.rx), y = Math.round(CAP.y + Math.sin(a) * CAP.ry) + 2; return [x, y, a]; };
      const walkers = [0, 1, 2].map(i => capWalker(i));
      const drawCapPost = () => { k.rect(CAP.x - 2, CAP.y - 16, 5, 18, BARK[2]); k.rect(CAP.x - 2, CAP.y - 16, 1, 18, BARK[4]); k.rect(CAP.x - 3, CAP.y - 17, 7, 2, IRON[3]); };
      const drawWalker = ([x, y, a], i) => {
        k.line(CAP.x, CAP.y - 10, x, y - 10, BARK[3], 2);
        if (run) W(x, y, 'goblin', { anim: 'chained', facing: -Math.sin(a) > 0 ? 1 : -1, phase: i * .3, look: i });
        else if (idle) W(x, y, 'goblin', { anim: 'sit', chains: true, phase: i * .3, look: i });
        else W(x, y, 'goblin', { anim: 'idle', chains: true, phase: i * .3, look: i });
      };
      walkers.forEach((w, i) => { if (w[1] <= CAP.y + 2) drawWalker(w, i); }); drawCapPost(); walkers.forEach((w, i) => { if (w[1] > CAP.y + 2) drawWalker(w, i); });

      /* Cauldron: green bubbles and steam; boils over on error. */
      if (live) {
        flame(k, POT.x - 4, POT.y + 3, t, err ? 1.5 : 1); flame(k, POT.x + 5, POT.y + 3, t + .3, err ? 1.3 : .8);
        for (let i = 0; i < 4; i++) { const q = (t * 1.2 + i / 4) % 1, bx = POT.x - 6 + i * 4; if (q < .7) k.px(bx, POT.y - 15 - Math.round(q * 2), TOX[5]); else { k.px(bx - 1, POT.y - 17, TOX[4]); k.px(bx + 1, POT.y - 17, TOX[4]); } }
        Props.smoke(k, POT.x + 2, POT.y - 18, t * (run ? 1 : .5), run ? 4 : 2, err ? '#1e2a14' : '#6a8a5a');
      } else for (let i = 0; i < 3; i++) k.px(POT.x - 4 + i * 4, POT.y + 3, LAVA[1]);
      if (err) for (let i = 0; i < 5; i++) { const q = (t * 1.3 + i / 5) % 1, d = i % 2 ? 1 : -1; k.circle(POT.x + d * (6 + q * 16), POT.y - 14 - Math.sin(q * Math.PI) * 14 + q * 16, 1, TOX[4]); }

      /* Braziers, the Red Eye's glow and the signal fire (amber while waiting). */
      for (const [x, y] of [[-30, 52], [150, 98]]) if (live) flame(k, x, y, t, err ? 1.4 : 1);
      if (live) k.alpha(.4 + .25 * Math.sin(t * 2), () => k.blit(halo(8, LAVA[4]), 153, 54));
      const sx = TOWER.x, sy = TOWER.y - 39;
      if (wait) { flame(k, sx, sy, t, 2, 1); flame(k, sx - 2, sy, t + .3, 1, 1); k.alpha(.25 + .1 * Math.sin(t * 5), () => k.circle(sx, sy - 6, 10, C.waiting)); Props.banner(k, sx + 3, sy + 10, C.waiting, t, 10); }
      else if (live) flame(k, sx, sy, t, err ? 1.4 : .8);
      const lamp = !live ? C.slate1 : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? (Math.floor(t * 1.5) % 2 ? C.waiting : C.gold1) : run ? C.working : C.idle;
      k.rect(sx + 3, sy + 12, 5, 6, C.ink); k.rect(sx + 4, sy + 13, 3, 4, lamp); if (live) k.px(sx + 4, sy + 13, C.white);
      if (live && (err || wait)) k.alpha(.25 + .15 * Math.sin(t * 6), () => k.circle(sx + 5, sy + 15, 7, lamp));

      /* Scarecrow rags flap. */
      blitD(k, scarecrow(live ? Math.floor(t * 2) % 2 : 0), -40, -12, !live);

      /* Harvest on hold at the cart while waiting. */
      if (wait) { for (let i = 0; i < 5; i++) basket(k, 30 + (i % 3) * 10, 104 - Math.floor(i / 3) * 7); }

      /* Crews. Workers: orc, hollow, goblin, imp. Overseers: wraith (Nazgûl); lost souls from the portal. */
      const rowL = FIELD_L.y0 + 4 + 5 * 8 + 3, rowR = FIELD_R.y0 + 4 + 3 * 8 + 3;   // the bare, hoed strips
      if (run) {
        // Left field: the Nazgûl drives the hoe gang.
        W(-160, rowL, 'wraith', { anim: 'whip', lash: 26, facing: 1, phase: 0 });
        W(-132, rowL, 'hollow', { anim: crack(0) ? 'cower' : 'work', tool: 'hoe', phase: .1, speed: 4 });
        W(-100, rowL, 'orc', { anim: 'work', tool: 'hoe', phase: .5, speed: 4 }); W(-66, rowL, 'hollow', { anim: 'work', tool: 'hoe', phase: .8, speed: 3, look: 1 });
        // Right field: the imp prods a slow orc with its pitchfork.
        const poke = (t * .45) % 1 < .25;
        W(58, rowR, 'imp', { anim: poke ? 'work' : 'idle', tool: 'pitchfork', facing: 1, phase: .2, speed: 8 });
        W(72, rowR, 'orc', { anim: poke ? 'cower' : 'work', tool: 'hoe', phase: .3, speed: 4, look: 2 });
        W(112, rowR, 'hollow', { anim: 'work', tool: 'hoe', facing: -1, phase: .6, speed: 3, look: 2 }); W(146, rowR, 'orc', { anim: 'work', tool: 'hoe', facing: -1, phase: .9, speed: 4, look: 3 });
        // Basket haulers trudge from the fields down to the cart.
        const hp = (t * .07) % 1, back = hp > .5, hq = back ? (1 - hp) * 2 : hp * 2;
        W(30 + hq * 20, 48 + hq * 60, 'orc', { anim: back ? 'walk' : 'carry', carry: back ? '' : 'food', facing: back ? -1 : 1, phase: .4, look: 1 });
        const hp2 = (hp + .5) % 1, back2 = hp2 > .5, hq2 = back2 ? (1 - hp2) * 2 : hp2 * 2;
        W(-30 + hq2 * 60, 50 + hq2 * 50, 'hollow', { anim: back2 ? 'walk' : 'carry', carry: back2 ? '' : 'food', facing: back2 ? -1 : 1, phase: .7 });
        // A second Nazgûl watches the capstan gang; a goblin stirs the cauldron.
        W(CAP.x - 34, CAP.y + 14, 'wraith', { anim: 'whip', lash: 22, facing: 1, phase: .5, look: 1 });
        W(POT.x + 22, POT.y + 4, 'goblin', { anim: 'work', facing: -1, phase: .6, speed: 3 });
        if (z.detail) for (let i = 0; i < 2; i++) Props.bird(k, -150 + ((t * 14 + i * 150) % 300), -150 + i * 8 + Math.sin(t + i) * 3, t + i, '#1a1416');
      } else if (idle) {
        W(-160, rowL, 'wraith', { anim: 'idle', tool: 'spear', facing: 1, phase: 0 }); W(CAP.x - 34, CAP.y + 14, 'wraith', { anim: 'idle', tool: 'spear', facing: 1, phase: .5, look: 1 });
        for (const [x, y, kind, ph, lk] of [[-132, rowL, 'hollow', .1, 0], [-100, rowL, 'orc', .5, 0], [-66, rowL, 'hollow', .8, 1], [72, rowR, 'orc', .3, 2], [112, rowR, 'hollow', .6, 2], [-150, 104, 'orc', .4, 1], [-126, 102, 'hollow', .7, 0]]) W(x, y, kind, { anim: 'sit', chains: true, phase: ph, look: lk });
        W(58, rowR, 'imp', { anim: 'sleep', phase: .2, z: true });
        W(POT.x + 22, POT.y + 4, 'goblin', { anim: 'sit', facing: -1, phase: .6 });
        if (z.detail) for (let i = 0; i < 3; i++) Props.bird(k, -40 + ((t * 10 + i * 100) % 260) - 130, -150 + i * 6 + Math.sin(t + i) * 3, t + i, '#1a1416');
      } else if (wait) {
        W(-160, rowL, 'wraith', { anim: 'idle', tool: 'spear', facing: 1, phase: 0 }); W(CAP.x - 34, CAP.y + 14, 'wraith', { anim: 'idle', facing: 1, phase: .5, look: 1 });
        W(-132, rowL, 'hollow', { anim: 'idle', tool: 'hoe', phase: .1 }); W(-100, rowL, 'orc', { anim: 'idle', tool: 'hoe', phase: .5 }); W(-66, rowL, 'hollow', { anim: 'idle', tool: 'hoe', phase: .8, look: 1 });
        W(58, rowR, 'imp', { anim: 'idle', tool: 'pitchfork', phase: .2 }); W(72, rowR, 'orc', { anim: 'idle', tool: 'hoe', phase: .3, look: 2 }); W(112, rowR, 'hollow', { anim: 'idle', tool: 'hoe', facing: -1, phase: .6, look: 2 });
        W(44, 96, 'orc', { anim: 'idle', carry: 'food', phase: .4, look: 1 }); W(-8, 100, 'hollow', { anim: 'idle', carry: 'food', phase: .7 });
        W(POT.x + 22, POT.y + 4, 'goblin', { anim: 'idle', facing: -1, phase: .6 });
      } else if (err) {
        // Burning mill, boiling cauldron, lost souls swarming: workers scatter from the fields.
        const sc = [[-132, rowL, 1, 'hollow'], [-100, rowL, -1, 'orc'], [-66, rowL, 1, 'hollow'], [72, rowR, 1, 'orc'], [112, rowR, -1, 'hollow'], [146, rowR, -1, 'orc'], [POT.x + 22, POT.y + 4, 1, 'goblin']];
        sc.forEach(([x, y, d, kind], i) => { const q = (t * .25 + i * .17) % 1, r = Math.sin(q * Math.PI) * 26; R(x + d * r, y + (i % 2 ? 6 : -4) * Math.sin(q * Math.PI), kind, { anim: 'walk', facing: d * (q < .5 ? 1 : -1), phase: i * .2 }); });
        R(-160, rowL, 'wraith', { anim: 'whip', lash: 26, facing: 1, phase: 0, speed: 11 }); W(CAP.x - 34, CAP.y + 14, 'wraith', { anim: 'idle', facing: 1, phase: .5, look: 1 });
        W(58, rowR, 'imp', { anim: 'cheer', phase: .2 });
      } else {
        W(-156, rowL, 'wraith', { phase: 0 }); W(CAP.x - 34, CAP.y + 14, 'wraith', { phase: .5, look: 1 });
        for (const [x, y, kind, ph, lk] of [[-150, 104, 'orc', .4, 1], [-126, 102, 'hollow', .7, 0], [-104, 124, 'orc', .1, 0], [-66, 116, 'hollow', .8, 1], [80, 100, 'orc', .3, 2], [120, 104, 'hollow', .6, 2], [58, rowR, 'imp', .2, 0], [POT.x + 22, POT.y + 4, 'goblin', .6, 0]]) W(x, y, kind, { phase: ph, look: lk });
      }
    }
  };
})();
