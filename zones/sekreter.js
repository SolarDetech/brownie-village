/* Sekreter · Postal courtyard: posthouse, sorting pavilion, pigeon loft, courier yard and waiting garden. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.sekreter = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const LEAD = { x: -8, y: 46 };               // the butler at his stamping desk
  const BELT = { x: 22, y: -12, w: 92 };        // sorting conveyor on the pavilion counter
  const envelope = (k, x, y, seal = C.red2) => { k.rect(x - 1, y - 1, 9, 7, C.ink); k.rect(x, y, 7, 5, C.paper); k.px(x + 1, y + 1, C.paper2); k.px(x + 5, y + 1, C.paper2); k.px(x + 2, y + 2, C.paper2); k.px(x + 4, y + 2, C.paper2); k.px(x + 3, y + 3, seal); };
  const pigeon = (k, x, y, t, fly) => {
    if (fly) { const up = Math.floor(t * 10) % 2; k.rect(x - 1, y, 4, 2, '#e8e6dc'); k.px(x + 3, y, '#b8b8b0'); k.rect(x - 4, y - up * 2, 3, 1, '#d8d6cc'); k.rect(x + 2, y - up * 2, 3, 1, '#d8d6cc'); return; }
    k.rect(x, y - 3, 4, 3, '#e8e6dc'); k.px(x + 3, y - 4, '#e8e6dc'); k.px(x + 4, y - 4, C.gold2); k.px(x, y - 2, '#b8b8b0'); k.px(x + 1, y, C.terra3);
  };

  /* ---------- The footman: a young lad in teal-and-gold livery, brown hair, white gloves, silver tray (the lead butler's junior) ---------- */
  const BUTLER = { door: [-90, -12], serve: [-54, 40], idle: [-84, -12], wait: [-56, 24], err: [-62, 22], chair: [-82, -8] };
  const BT = { coat: C.teal1, coatHi: C.teal3, coatSh: C.teal0, arm: '#264e50', pants: '#262630', pantsSh: '#17171e', shoe: '#0b0b10', shoeHi: '#5c5c6c',
    vest: C.gold1, button: C.gold3, hair: '#6a4428', hairSh: '#4a2e1a', stache: C.skin2, skin: C.skin3, skinSh: C.skin2,
    glove: C.white, gloveSh: '#d4d0c6', silver: '#dde2e8', silverHi: '#ffffff', silverSh: '#9aa2ae', china: '#fbf8f0', chinaSh: '#d8d0c0', tea: '#8a5a2a' };
  // Tray contents at tray offset (tx, ty): the teacup on its saucer, or a sealed letter.
  function trayLoad(q, R, tx, ty, load) {
    if (load === 'cup') { R(7 + tx, -18 + ty, 4, 1, BT.chinaSh); R(8 + tx, -20 + ty, 2, 2, BT.china); R(8 + tx, -21 + ty, 2, 1, BT.tea); R(10 + tx, -20 + ty, 1, 1, BT.chinaSh); R(8 + tx, -19 + ty, 1, 1, C.gold2); }
    else if (load === 'letter') { R(6 + tx, -19 + ty, 6, 2, C.paper); R(6 + tx, -19 + ty, 6, 1, C.white); R(8 + tx, -18 + ty, 1, 1, C.red2); }
  }
  function drawButler(q, pose, f, load) {
    if (pose === 'front') return drawButlerFront(q);
    if (pose === 'sit') return drawButlerSit(q);
    const walk = pose === 'walk', st = walk ? [1, 0, -1, 0][f] : 0, bob = walk && f % 2 ? -1 : 0;
    const lean = pose === 'bow' ? 4 : pose === 'down' ? 2 : 0;
    // Upper-body rows lean forward (right) and drop a little for the bow; everything above the waist bobs while walking.
    const sx = y => y < -9 ? Math.round(lean * (-9 - y) / 10) : 0, sy = y => y < -9 ? Math.round(lean * .5 * (-9 - y) / 10) + bob : 0;
    const R = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) q.rect(x + sx(yy), yy + sy(yy), w, 1, c); };
    // Legs: slim black trousers, polished shoes.
    const lift = i => walk && f === i ? 1 : 0;
    q.rect(-2 - st, -9, 2, 8 - lift(3), BT.pantsSh); q.rect(-2 - st, -1 - lift(3), 3, 1, BT.shoe);
    q.rect(1 + st, -9, 2, 8 - lift(1), BT.pants); q.px(1 + st, -8, BT.coatHi); q.rect(1 + st, -1 - lift(1), 3, 1, BT.shoe); q.px(2 + st, -1 - lift(1), BT.shoeHi);
    // Tailcoat tails behind, swaying with the stride.
    const tw = walk && f % 2 ? 1 : 0;
    R(-5 - tw, -13, 2, 8, BT.coat); R(-5 - tw, -13, 1, 8, BT.coatHi); q.px(-4 - tw, -6, BT.coatSh);
    // Far arm hangs at the side with a white glove.
    const down = pose === 'down';
    if (down) { R(-5, -19, 2, 5, BT.arm); R(-6, -14, 2, 2, BT.glove); } else { R(-4, -19, 2, 7, BT.arm); R(-4, -12, 2, 2, BT.glove); q.px(-3 + sx(-11), -11 + sy(-11), BT.gloveSh); }
    // Torso: tailcoat, white shirt front, grey waistcoat, black bow tie.
    R(-3, -20, 7, 11, BT.coat); R(-3, -20, 1, 11, BT.coatHi); R(3, -20, 1, 11, BT.coatSh);
    R(1, -20, 2, 4, BT.glove); R(1, -16, 2, 4, BT.vest); R(2, -15, 1, 1, BT.button); R(2, -13, 1, 1, BT.button); R(0, -20, 1, 6, BT.coatHi);
    R(1, -19, 3, 1, BT.shoe); R(2, -19, 1, 1, '#34343c');
    // Head: young face under a full crop of brown hair, clean-shaven.
    R(-1, -27, 4, 1, BT.skin); R(-2, -26, 6, 5, BT.skin); R(-1, -21, 4, 1, BT.skinSh); R(3, -26, 1, 5, BT.skinSh);
    R(-2, -28, 5, 1, BT.hair); R(-2, -27, 6, 1, BT.hair); R(-2, -26, 3, 1, BT.hair); R(-2, -25, 2, 3, BT.hair); R(1, -26, 1, 1, BT.hairSh); R(-2, -23, 1, 1, BT.hairSh); R(0, -28, 2, 1, '#8a5a36');
    R(0, -24, 1, 2, BT.skinSh);
    if (pose === 'bow') R(2, -24, 2, 1, C.ink); else R(2, down ? -23 : -24, 1, 1, C.ink);
    R(2, -25, 2, 1, BT.hairSh); R(4, -24, 1, 2, BT.skin); R(4, -23, 1, 1, BT.skinSh);
    R(3, -22, 1, 1, '#a0503a'); R(3, -21, 1, 1, BT.skinSh);
    if (down) { R(3, -19, 2, 5, BT.arm); R(5, -15, 2, 2, BT.glove); return; }
    // Near arm carries the silver tray (held out further when offering).
    const offer = pose === 'offer', tx = offer ? 3 : 0, ty = offer ? -2 : 0;
    R(2, -19, 2, 4, BT.arm);
    if (offer) R(3, -17, 6, 2, BT.arm); else R(3, -15, 4, 2, BT.arm);
    R(3 + tx, -17 + ty, 10, 1, BT.silver); R(3 + tx, -16 + ty, 10, 1, BT.silverSh); R(4 + tx, -17 + ty, 2, 1, BT.silverHi); R(12 + tx, -17 + ty, 1, 1, BT.silverSh);
    trayLoad(q, R, tx, ty, load);
    R(7 + tx, -16 + ty, 2, 2, BT.glove); R(8 + tx, -15 + ty, 1, 1, BT.gloveSh);
  }
  // Facing the viewer, presenting a letter on the tray.
  function drawButlerFront(q) {
    q.rect(-3, -9, 2, 8, BT.pantsSh); q.rect(1, -9, 2, 8, BT.pants); q.rect(-4, -1, 3, 1, BT.shoe); q.rect(1, -1, 3, 1, BT.shoe); q.px(2, -1, BT.shoeHi);
    q.rect(-4, -12, 1, 5, BT.coat); q.rect(3, -12, 1, 5, BT.coatSh);
    q.rect(-3, -20, 7, 11, BT.coat); q.rect(-3, -20, 1, 11, BT.coatHi); q.rect(3, -20, 1, 11, BT.coatSh);
    q.rect(-1, -20, 3, 4, BT.glove); q.rect(-1, -16, 3, 4, BT.vest); q.px(0, -15, BT.button); q.px(0, -13, BT.button); q.px(-2, -19, BT.coatHi); q.px(2, -19, BT.coatHi);
    q.rect(-2, -19, 5, 1, BT.shoe); q.px(0, -19, '#34343c');
    q.rect(-3, -26, 7, 5, BT.skin); q.rect(-2, -27, 5, 1, BT.skin); q.rect(-2, -21, 5, 1, BT.skinSh); q.rect(3, -26, 1, 5, BT.skinSh);
    q.rect(-2, -28, 5, 1, BT.hair); q.rect(-3, -27, 7, 1, BT.hair); q.rect(-3, -26, 1, 4, BT.hair); q.rect(3, -26, 1, 4, BT.hairSh); q.px(-1, -28, '#8a5a36');
    q.px(-1, -24, C.ink); q.px(1, -24, C.ink); q.px(-1, -25, BT.hairSh); q.px(1, -25, BT.hairSh); q.px(0, -23, BT.skinSh);
    q.px(0, -22, '#a0503a');
    q.rect(-5, -19, 2, 6, BT.arm); q.rect(4, -19, 2, 6, BT.arm);
    q.ellipse(0, -12, 7, 1, BT.silverSh); q.rect(-6, -13, 13, 1, BT.silver); q.rect(-5, -13, 3, 1, BT.silverHi);
    q.rect(-3, -17, 7, 4, C.paper); q.rect(-3, -17, 7, 1, C.white); q.line(-3, -17, 0, -15, BT.chinaSh); q.line(3, -17, 0, -15, BT.chinaSh); q.px(0, -15, C.red2);
    q.rect(-6, -14, 2, 2, BT.glove); q.rect(5, -14, 2, 2, BT.glove);
  }
  // Asleep on a hall chair, chin on chest, tray resting on his knees.
  function drawButlerSit(q) {
    q.rect(-7, -21, 1, 1, C.wood4); q.rect(-6, -21, 2, 13, C.wood2); q.rect(-6, -21, 1, 13, C.wood3);
    q.rect(-5, -9, 11, 2, C.wood3); q.rect(-5, -9, 11, 1, C.wood4); q.rect(-5, -7, 1, 7, C.wood1); q.rect(5, -7, 1, 7, C.wood1); q.rect(-4, -4, 9, 1, C.wood1);
    q.rect(-4, -14, 2, 6, BT.coat); q.px(-4, -9, BT.coatSh);
    q.rect(-2, -11, 7, 2, BT.pants); q.rect(5, -10, 2, 9, BT.pants); q.rect(6, -1, 3, 1, BT.shoe); q.px(7, -1, BT.shoeHi);
    q.rect(-3, -20, 6, 9, BT.coat); q.rect(-3, -20, 1, 9, BT.coatHi); q.rect(2, -20, 1, 9, BT.coatSh); q.rect(1, -19, 1, 3, BT.glove); q.rect(1, -16, 1, 4, BT.vest);
    q.rect(-1, -26, 5, 1, BT.skin); q.rect(-2, -25, 6, 5, BT.skin); q.rect(3, -25, 1, 5, BT.skinSh);
    q.rect(-2, -27, 5, 1, BT.hair); q.rect(-2, -26, 5, 1, BT.hair); q.rect(-2, -25, 2, 3, BT.hair);
    q.rect(2, -22, 2, 1, C.ink); q.px(3, -20, '#a0503a'); q.px(4, -23, BT.skinSh);
    q.rect(0, -13, 9, 1, BT.silver); q.rect(0, -12, 9, 1, BT.silverSh); q.rect(1, -13, 2, 1, BT.silverHi);
    q.rect(5, -15, 2, 2, BT.china); q.px(7, -15, BT.chinaSh);
    q.rect(1, -18, 2, 4, BT.arm); q.rect(2, -15, 2, 2, BT.glove);
  }
  const butlerSprite = (pose, f = 0, load = 'cup') => P.sprite(`footman|${pose}|${f}|${load}`, 30, 34, 13, 31, q => drawButler(q, pose, f, load));
  const steam = (k, x, y, t) => { for (let i = 0; i < 3; i++) { const q = (t * .9 + i / 3) % 1, sx = x + Math.round(Math.sin(q * 6 + i * 2) * 1.5); k.alpha((1 - q) * .85, () => { k.px(sx, y - Math.round(q * 8), '#f6f6f2'); k.px(sx + 1, y - 1 - Math.round(q * 8), '#e6e6e2'); }); } };
  const teacup = (k, x, y) => { k.rect(x - 1, y + 2, 5, 1, BT.chinaSh); k.rect(x, y, 3, 2, BT.china); k.rect(x, y - 1, 3, 1, BT.tea); k.px(x + 3, y, BT.chinaSh); };
  function butler(k, t, state) {
    let [x, y] = BUTLER.idle, pose = 'stand', f = 0, load = 'cup', flip = false, steamAt = null;
    if (state === 'working') {
      const [dx, dy] = BUTLER.door, [sx, sy] = BUTLER.serve, p = (t % 16) / 16, wf = Math.floor(t * 6) % 4;
      if (p < .34) { const q = p / .34; x = dx + (sx - dx) * q; y = dy + (sy - dy) * q; pose = 'walk'; f = wf; steamAt = [9, -21 - (wf % 2)]; }
      else if (p < .44) { [x, y] = [sx, sy]; pose = 'bow'; }
      else if (p < .64) { [x, y] = [sx, sy]; pose = 'offer'; steamAt = [12, -23]; }
      else if (p < .97) { const q = (p - .64) / .33; x = sx + (dx - sx) * q; y = sy + (dy - sy) * q; pose = 'walk'; f = wf; flip = true; load = 'none'; }
      else { [x, y] = BUTLER.door; load = 'none'; }
      // Once served, the cup sits steaming on the Sekreter's desk until the next round.
      if (p >= .64) { teacup(k, LEAD.x + 31, LEAD.y - 24); steam(k, LEAD.x + 32, LEAD.y - 26, t); }
    } else if (state === 'waiting') { [x, y] = BUTLER.wait; pose = 'front'; load = 'letter'; }
    else if (state === 'error') { [x, y] = BUTLER.err; pose = 'down'; load = 'none'; }
    else if (state === 'off') { [x, y] = BUTLER.chair; pose = 'sit'; load = 'none'; }
    x = Math.round(x); y = Math.round(y);
    // Subtle breathing bob when standing still.
    const breathe = pose === 'stand' || pose === 'offer' || pose === 'front' ? (Math.floor(t * 1.4) % 2) : 0;
    if (state === 'error') {
      // Dropped tray, a spreading tea puddle and cup shards at his feet.
      k.ellipse(x + 11, y + 1, 6, 2, '#8a5a2a99'); k.ellipse(x + 9, y + 1, 4, 1, '#a0703a99');
      k.poly([[x + 2, y - 1], [x + 12, y - 3], [x + 14, y - 1], [x + 4, y + 1]], BT.silver); k.line(x + 4, y + 1, x + 14, y - 1, BT.silverSh); k.px(x + 5, y - 1, BT.silverHi);
      for (const [sx, sy] of [[8, 3], [11, 4], [15, 2], [13, 5], [6, 4]]) k.px(x + sx, y + sy, BT.china);
      k.rect(x + 16, y + 2, 2, 1, BT.chinaSh); k.px(x + 17, y + 1, C.gold2);
    }
    k.ellipse(x + 1, y, pose === 'sit' ? 8 : 6, 2, C.shadow);
    const shake = state === 'error' ? [0, 1, 0, -1][Math.floor(t * 10) % 4] : 0;
    k.blit(butlerSprite(pose, f, load), x + shake, y - breathe, flip);
    if (steamAt) steam(k, x + (flip ? -steamAt[0] : steamAt[0]), y + steamAt[1], t);
    if (state === 'waiting') { const b = Math.floor(t * 2) % 2; k.rect(x - 3, y - 39 - b, 7, 9, C.ink); k.rect(x - 2, y - 38 - b, 5, 7, C.waiting); k.text('?', x - 1, y - 37 - b, C.ink); }
    if (state === 'error' && Math.floor(t * 3) % 2) { k.rect(x - 1, y - 38, 3, 6, C.ink); k.rect(x, y - 37, 1, 3, C.error); k.px(x, y - 33, C.error); }
    if (state === 'off') { const q = (t * .4) % 1; k.alpha(1 - q, () => k.text('z', x + 5 + q * 5, y - 30 - q * 10, '#c8d4ff')); }
  }
  return {
    paint(k) {
      // Courtyard paving with a worn centre and a stone kerb.
      k.poly([[-176, -24], [168, -24], [178, 20], [170, 118], [60, 132], [-60, 132], [-172, 118], [-182, 20]], C.stone2);
      k.poly([[-172, -21], [165, -21], [174, 20], [166, 114], [58, 128], [-58, 128], [-168, 114], [-178, 20]], C.stone3);
      k.polyTex([[-170, -19], [163, -19], [172, 20], [164, 112], [57, 126], [-57, 126], [-166, 112], [-176, 20]], (x, y) => {
        const row = Math.floor((y + 200) / 5), off = row % 2 * 4, cx = (x + 400 + off) % 8;
        if ((y + 200) % 5 === 0) return C.stone2; if (cx === 0) return C.stone2;
        if (Math.abs(x + 8) < 40 && y > 60) return (x + y) % 5 ? C.stone4 : C.stone3;
        return P.hash(Math.floor((x + off) / 8), row) < .2 ? C.stone4 : null;
      });
      // A compass-rose inlay marks the courtyard centre.
      k.ellipse(-8, 76, 22, 10, C.stone2); k.ellipse(-8, 76, 20, 9, C.stone4); k.ring(-8, 76, 15, 6, C.stone2); k.poly([[-8, 67], [-5, 76], [-8, 85], [-11, 76]], C.teal2); k.poly([[-26, 76], [-8, 73], [10, 76], [-8, 79]], C.gold1); k.px(-8, 76, C.gold3);

      // Posthouse: the grand teal-awninged front, with lit windows and an envelope crest.
      Props.building(k, -178, -26, { w: 150, h: 46, roofH: 30, roof: C.terra2, wall: C.plaster2, mat: 'timber', windows: [{ x: 10, y: 12, w: 9, h: 10, box: '#e46c52' }, { x: 30, y: 12, w: 9, h: 10, box: '#f2c14e' }, { x: 108, y: 12, w: 9, h: 10, box: '#e46c52' }, { x: 128, y: 12, w: 9, h: 10, box: '#f2c14e' }], door: { x: 64, w: 22, h: 20, color: C.teal2, arch: true }, chimney: { x: 118, h: 12 } });
      // Double door mullion and a crest above.
      k.rect(-104, -46, 1, 20, C.teal0);
      k.rect(-119, -86, 32, 14, C.gold1); k.rect(-118, -85, 30, 12, C.teal1); k.rect(-114, -83, 22, 8, C.paper); k.line(-114, -83, -103, -78, C.paper2); k.line(-92, -83, -103, -78, C.paper2); k.px(-103, -78, C.red2); k.px(-104, -78, C.red2);
      Props.awning(k, -144, -58, 84, C.teal2, C.paper, 7);
      k.rect(-144, -51, 1, 25, C.wood1); k.rect(-61, -51, 1, 25, C.wood1);
      Props.hangingSign(k, -52, -58, 'POST', C.teal1);
      // Planters and a bench along the posthouse front.
      for (const x of [-172, -150, -54, -34]) Props.pot(k, x, -30);
      Props.bench(k, -170, -8, 18);

      // Sorting pavilion: tiled canopy on posts over pigeonhole shelves and a long counter.
      const px0 = 14, px1 = 124;
      k.rect(px0 + 2, -80, px1 - px0, 56, C.shadowSoft);
      k.rect(px0, -78, px1 - px0, 58, C.wood1); k.rect(px0 + 2, -76, px1 - px0 - 4, 54, '#5a4a38');
      for (let row = 0; row < 4; row++) for (let col = 0; col < 9; col++) {
        const x = px0 + 6 + col * 11, y = -72 + row * 11; k.rect(x, y, 9, 9, C.wood0); k.rect(x + 1, y + 1, 7, 7, '#3a2c20');
        const h = P.hash(row, col); if (h > .35) { k.rect(x + 1, y + 4, 7, 4, h > .7 ? C.paper : C.paper2); k.px(x + 2 + (col % 4), y + 5, h > .8 ? C.red2 : C.teal2); }
      }
      k.rect(px0 - 6, -96, px1 - px0 + 12, 16, C.teal1);
      for (let x = px0 - 6; x < px1 + 6; x += 4) { k.rect(x, -96, 2, 16, C.teal2); k.px(x, -96, C.teal3); }
      k.rect(px0 - 6, -96, px1 - px0 + 12, 2, C.teal4); k.rect(px0 - 6, -81, px1 - px0 + 12, 2, C.teal0);
      for (const x of [px0 - 3, px1 + 1]) { k.rect(x, -80, 3, 60, C.wood2); k.rect(x, -80, 1, 60, C.wood4); }
      // Counter with a belt channel (belt animates) and chutes.
      k.rect(BELT.x - 4, BELT.y - 2, BELT.w + 8, 14, C.wood2); k.rect(BELT.x - 4, BELT.y - 2, BELT.w + 8, 2, C.wood4); k.rect(BELT.x - 4, BELT.y + 10, BELT.w + 8, 2, C.wood0);
      k.rect(BELT.x, BELT.y + 1, BELT.w, 6, C.stone0);
      for (let i = 0; i < 4; i++) { const x = BELT.x + 6 + i * 24; k.rect(x, BELT.y + 12, 3, 8, C.wood1); }
      // Sealed mail bags waiting under the counter.
      for (let i = 0; i < 4; i++) Props.sack(k, BELT.x + 8 + i * 22, 8, i % 2 ? '#c9b388' : '#b8a276');

      // Pigeon loft tower with landing rail and arched openings.
      Props.building(k, 128, -30, { w: 34, h: 60, style: 'peak', roofH: 20, depth: 12, roof: C.slate2, wall: C.plaster1, mat: 'planks', door: { x: 12, w: 10, h: 14, color: C.wood3 } });   // narrowed to clear the hexagon edge
      for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const x = 132 + i * 10, y = -84 + r * 14; k.rect(x, y, 7, 8, C.wood0); k.rect(x + 1, y + 1, 5, 7, '#241a14'); k.rect(x - 1, y + 8, 9, 2, C.wood3); }
      k.rect(124, -58, 44, 2, C.wood3); k.rect(124, -56, 44, 1, C.wood1);

      // Courier yard: parked mail carts, a cart shed and a teal pillar letterbox.
      Props.cart(k, -170, 44, (q, x, y) => { q.rect(x + 2, y - 7, 18, 7, C.teal2); q.rect(x + 2, y - 7, 18, 1, C.teal3); q.rect(x + 8, y - 5, 6, 3, C.paper); });
      Props.cart(k, -170, 76, (q, x, y) => { for (let i = 0; i < 3; i++) Props.sack(q, x + 2 + i * 6, y - 8, C.plaster1); });
      Props.crate(k, -140, 90); Props.crate(k, -130, 98, 8); Props.barrel(k, -178, 96);
      const lb = [52, 102];
      k.ellipse(lb[0] + 5, lb[1] + 1, 7, 2, C.shadow); k.rect(lb[0], lb[1] - 22, 11, 22, C.teal1); k.rect(lb[0], lb[1] - 22, 2, 22, C.teal3); k.rect(lb[0] + 9, lb[1] - 22, 2, 22, C.teal0);
      k.ellipse(lb[0] + 5, lb[1] - 23, 6, 3, C.teal2); k.rect(lb[0] - 1, lb[1] - 23, 13, 2, C.gold2); k.rect(lb[0] + 2, lb[1] - 16, 7, 2, C.ink); k.rect(lb[0] + 3, lb[1] - 11, 5, 4, C.gold1); k.rect(lb[0] - 1, lb[1] - 1, 13, 2, C.stone2);

      // The Sekreter's stamping desk (sized for the 1.5× lead): inkpad, teacup spot and outgoing tray.
      Props.table(k, LEAD.x + 6, LEAD.y - 2, 37, 18, C.wood3);
      k.rect(LEAD.x + 22, LEAD.y - 23, 7, 3, C.wood1); k.rect(LEAD.x + 23, LEAD.y - 23, 5, 1, C.red1);
      k.rect(LEAD.x + 35, LEAD.y - 25, 7, 5, C.wood2); for (let i = 0; i < 3; i++) k.rect(LEAD.x + 35, LEAD.y - 26 - i, 7, 1, i % 2 ? C.paper : C.paper2);
      // Behind him, a side table with the salver of incoming letters he takes the next one from.
      k.ellipse(LEAD.x - 16, LEAD.y - 1, 6, 2, C.shadow); k.rect(LEAD.x - 17, LEAD.y - 19, 2, 18, C.wood1); k.rect(LEAD.x - 20, LEAD.y - 2, 8, 2, C.wood1);
      k.ellipse(LEAD.x - 16, LEAD.y - 20, 7, 2, C.wood2); k.ellipse(LEAD.x - 16, LEAD.y - 21, 7, 2, C.wood3); k.rect(LEAD.x - 21, LEAD.y - 23, 8, 1, C.wood4);
      k.ellipse(LEAD.x - 16, LEAD.y - 23, 5, 1, '#9aa2ae'); k.rect(LEAD.x - 20, LEAD.y - 24, 9, 1, '#dde2e8');
      for (let i = 0; i < 3; i++) { k.rect(LEAD.x - 19 + (i & 1), LEAD.y - 26 - i, 6, 2, i % 2 ? C.paper2 : C.paper); k.px(LEAD.x - 16 + (i & 1), LEAD.y - 26 - i, C.red2); }

      // Parcel depot: a notice board, weighing scale, stacked parcels and a wall of private post boxes.
      k.rect(96, 14, 34, 22, C.wood1); k.rect(97, 15, 32, 20, C.wood3); k.rect(97, 15, 32, 2, C.wood4); k.rect(99, 36, 2, 10, C.wood1); k.rect(125, 36, 2, 10, C.wood1);
      for (const [x, y, c] of [[100, 19, C.paper], [110, 18, '#f2d78a'], [120, 20, C.paper], [102, 27, '#d8e8f0'], [114, 27, C.paper]]) { k.rect(x, y, 8, 6, c); k.rect(x + 1, y + 2, 5, 1, C.stone1); k.px(x + 3, y, C.red2); }
      k.rect(140, 22, 38, 34, C.stone2); k.rect(141, 23, 36, 32, C.stone4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const x = 143 + c * 7, y = 25 + r * 7; k.rect(x, y, 6, 6, C.gold1); k.rect(x + 1, y + 1, 4, 4, C.gold2); k.px(x + 4, y + 3, C.ink); if ((r + c) % 3 === 0) k.px(x + 2, y + 2, C.paper); }
      k.rect(140, 55, 38, 3, C.stone1);
      Props.table(k, 96, 76, 24, 10, C.wood2); k.rect(100, 62, 10, 3, C.stone2); k.rect(104, 58, 2, 4, C.stone1); k.rect(98, 56, 14, 2, C.gold2);
      for (const [x, y, s] of [[124, 66, 10], [134, 68, 8], [128, 58, 8], [142, 70, 9], [150, 76, 7], [120, 80, 8]]) { Props.crate(k, x, y, s); k.rect(x + 1, y + Math.floor(s / 2) - 1, s - 2, 1, C.red1); }
      for (const [x, y] of [[156, 64], [162, 70]]) Props.sack(k, x, y, C.plaster1);
      // Planters ring the compass inlay; a hedge and kitchen garden line the back fence.
      for (const [x, y] of [[-40, 70], [16, 70], [-40, 86], [16, 86]]) Props.pot(k, x, y);
      Props.fence(k, -150, -118, 90); Props.flowerBed(k, -144, -132, 30, 9, ['#f2c14e', '#f6ecd0'], 3); Props.flowerBed(k, -108, -132, 30, 9, ['#e46c52', '#c3a2c0'], 4);
      Props.hedge(k, 40, -124, 80, 7); for (let i = 0; i < 6; i++) Props.flower(k, 44 + i * 13, -127, ['#f2c14e', '#e98aa0', '#f6ecd0'][i % 3]);
      // A parked delivery bicycle with a mail basket.
      k.ring(-30, 104, 4, 4, C.ink); k.ring(-16, 104, 4, 4, C.ink); k.line(-30, 104, -23, 97, C.teal2); k.line(-23, 97, -16, 104, C.teal2); k.line(-23, 97, -20, 104, C.teal2); k.line(-26, 96, -21, 96, C.ink); k.rect(-19, 94, 6, 4, C.wood3); k.rect(-18, 93, 4, 1, C.paper);

      // Waiting garden: hedges, flower beds, benches and shade trees at the corners.
      Props.hedge(k, -156, 112, 44, 8); Props.hedge(k, 114, 110, 40, 8);
      Props.flowerBed(k, -146, 124, 34, 12, ['#f2c14e', '#e46c52', '#f6ecd0'], 7);
      Props.flowerBed(k, 116, 122, 32, 12, ['#c3a2c0', '#f6ecd0', '#e46c52'], 9);
      Props.bench(k, -110, 122, 18); Props.bench(k, 94, 120, 18);
      Props.lamp(k, -40, 118, true); Props.lamp(k, 28, 118, true);
      Props.tree(k, -186, -104, 'oak', 2, 1); Props.tree(k, 186, -118, 'blossom', 1, 2); Props.tree(k, -182, 144, 'oak', 1, 3); Props.tree(k, 188, 132, 'fruit', 1, 0);
      Props.bush(k, -14, -32, 1); Props.bush(k, 4, -30, 2); Props.bush(k, 186, 40, 0); Props.bush(k, -188, 30, 1);
      for (let i = 0; i < 18; i++) Props.flower(k, -186 + P.hash(i, 5) * 372, -140 + P.hash(i, 8) * 20, ['#f2c14e', '#f6ecd0', '#e98aa0'][i % 3]);
    },
    front(k) {
      // Canopy posts and the loft rail read in front of walking couriers.
      k.rect(-3, -80, 3, 3, C.wood4);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off';
      // Conveyor: moving slats and letters while working; jammed when in error.
      const shift = run ? Math.floor(t * 16) % 6 : 0;
      for (let x = 0; x < BELT.w; x += 6) k.rect(BELT.x + ((x + shift) % BELT.w), BELT.y + 2, 3, 4, C.stone1);
      if (run) for (let i = 0; i < 4; i++) { const p = (t * .22 + i / 4) % 1; envelope(k, BELT.x + p * (BELT.w - 8), BELT.y, i % 2 ? C.red2 : C.teal2); }
      if (state === 'waiting') { for (let i = 0; i < 5; i++) envelope(k, BELT.x + 4 + i * 3, BELT.y - i * 2); k.rect(BELT.x + 30, BELT.y - 14, 26, 9, C.ink); k.rect(BELT.x + 31, BELT.y - 13, 24, 7, C.waiting); k.text('HOLD', BELT.x + 35, BELT.y - 12, C.ink); }
      if (state === 'error') {
        envelope(k, BELT.x + 40, BELT.y - 4); envelope(k, BELT.x + 44, BELT.y - 7);
        for (let i = 0; i < 5; i++) { const q = (t * .6 + i / 5) % 1; k.at(BELT.x + 44 + Math.sin(i * 2.1) * q * 30, BELT.y - 6 - Math.sin(q * Math.PI) * 26 + q * 26, () => envelope(k, 0, 0)); }
        Props.smoke(k, BELT.x + 46, BELT.y - 4, t, 4, '#8a8478');
        if (Math.floor(t * 4) % 2) { k.rect(BELT.x + BELT.w + 2, BELT.y - 18, 6, 6, C.ink); k.rect(BELT.x + BELT.w + 3, BELT.y - 17, 4, 4, C.error); }
      }
      // Warning lamp on the pavilion post always shows the district state.
      const lamp = C[state]; k.rect(BELT.x + BELT.w + 3, BELT.y - 8, 4, 4, live ? lamp : C.slate1); if (live && run && Math.floor(t * 2) % 2) k.px(BELT.x + BELT.w + 4, BELT.y - 7, C.white);

      // Pigeons: carrying letters in and out of the loft, or roosting on the rail.
      if (run) for (let i = 0; i < 3; i++) {
        const p = (t * .12 + i / 3) % 1, out = i % 2, x = out ? 150 - p * 330 : -180 + p * 330, y = -60 - Math.sin(p * Math.PI) * 50 - i * 8;
        pigeon(k, x, y, t + i, true); if (!out) envelope(k, x - 3, y + 2);
      } else for (let i = 0; i < 4; i++) pigeon(k, 128 + i * 10, -58, t, false);

      // Couriers walk the lane between the posthouse door and the letterbox.
      if (run) {
        for (let i = 0; i < 2; i++) {
          const p = (t * .07 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2;
          // Down from the posthouse door, then along the south walk to the letterbox (clear of the desk).
          const x = q < .45 ? -103 : -103 + (q - .45) / .55 * 148, y = q < .45 ? -18 + q / .45 * 118 : 100;
          z.crew(x, y, { look: i + 1, hat: 'cap', hatColor: C.teal2, anim: 'walk', carry: back ? '' : 'mail', facing: q < .45 ? (back ? -1 : 1) : back ? -1 : 1, phase: i });
        }
        const p = (t * .05) % 1, x = -160 + Math.sin(p * Math.PI * 2) * 12;
        z.crew(x, 66, { look: 4, hat: 'cap', hatColor: C.teal2, anim: 'work', tool: 'hammer', phase: .3 });
      } else if (live) {
        z.crew(-102, 116, { look: 1, hat: 'cap', hatColor: C.teal2, anim: 'sit', state: 'idle' });
        z.crew(-160, 66, { look: 4, hat: 'cap', hatColor: C.teal2, anim: 'idle', state: state === 'error' ? 'error' : 'idle' });
      }

      // Pigeons peck around the compass inlay; they scatter into the air while the office is busy.
      for (let i = 0; i < 5; i++) { const bx = -34 + i * 11 + Math.round(Math.sin(t * .7 + i) * 3), by = 92 + (i % 2) * 5; if (live && Math.floor(t * 2 + i) % 3 === 0) { k.rect(bx, by - 2, 4, 2, '#e8e6dc'); k.px(bx + 3, by - 1, C.gold2); } else pigeon(k, bx, by, t, false); }
      // Parcel scale needle swings while parcels are weighed; a clerk stacks them.
      const needle = run ? Math.round(Math.sin(t * 3) * 3) : 0; k.line(105, 62, 105 + needle, 57, C.red2);
      if (run) { const q = (t * .4) % 1, px = 124 - q * 18, py = 66 - Math.sin(q * Math.PI) * 10; Props.crate(k, px, py, 7); z.crew(114, 90, { look: 3, hat: 'cap', hatColor: C.teal2, anim: 'work', tool: 'pen', phase: .7 }); }
      else if (state === 'waiting') { for (let i = 0; i < 3; i++) Props.crate(k, 98 + i * 7, 52 - i * 2, 7); z.crew(114, 90, { look: 3, hat: 'cap', hatColor: C.teal2, anim: 'idle' }); }

      // The footman serves tea from the posthouse door (drawn before the lead, who stands in front of him).
      butler(k, t, state);
      // The lead: the butler stamps letters at the desk, and dozes in the garden when off.
      if (state === 'off') z.lead(96, 116, {}); else z.lead(LEAD.x, LEAD.y, {});
      // Posthouse chimney smoke and window glow follow the working state.
      if (live) Props.smoke(k, -57, -110, t * (run ? 1 : .5), run ? 4 : 2);
    }
  };
})();
