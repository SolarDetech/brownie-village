/* Agent characters: eight lead sprites with role-specific work cycles, plus small crew and citizen sprites.
   All frames are drawn once into outlined sprite canvases and blitted. Feet sit at (x, y). */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const mod = (a, n) => ((a % n) + n) % n; // safe for negative time

  const ROLES = {
    // A double lead: two figures drawn side by side as one sprite (see FIGS and drawPair). [figure, x offset]; drawn in this order.
    sekreter: { title: 'The butler & the secretary', description: 'A silver-haired butler in white gloves and a black tailcoat stamps every letter, while his glamorous secretary, in cat-eye glasses and a wine-red suit, keeps the clipboard and hands him the next envelope.', pair: [['sek-butler', 9], ['sek-secretary', -9]], work: { n: 8, fps: 8 } },
    girard: { title: 'The market ambassador', description: 'A broad merchant in a burgundy brocade coat and tasselled fez, flipping gold coins over a leather ledger.', skin: C.skin1, hair: '#2a1c16', coat: '#8c2f3a', trim: C.gold2, pants: '#3a2a24', boots: C.wood0, wide: true, work: { n: 10, fps: 9 } },
    'text-writer': { title: 'The ink scholar', description: 'A silver-bearded scholar in a long indigo robe, writing across an unrolled parchment with a sweeping quill.', skin: C.skin3, hair: '#dedad0', coat: '#5c5a8a', trim: '#e0cc92', pants: '#3e3c60', boots: C.wood0, robe: true, work: { n: 8, fps: 7 } },
    gazeteci: { title: 'The roving editor', description: 'A newsboy-capped reporter in a mustard trench coat, scribbling notes and snapping photos with a flash camera.', skin: C.skin2, hair: '#6a4428', coat: '#c29a48', trim: '#f2ead8', pants: '#46463a', boots: C.wood0, work: { n: 12, fps: 8 } },
    bayes: { title: 'The star observer', description: 'A bespectacled astronomer in a star-flecked midnight cloak and pointed hat, sweeping the sky with a brass telescope.', skin: C.skin3, hair: '#f0ece0', coat: '#2e3870', trim: C.gold2, pants: '#1c2244', boots: C.wood0, robe: true, work: { n: 8, fps: 5 } },
    kandinsky: { title: 'The colour alchemist', description: 'A purple-bereted painter in a striped smock and red scarf, throwing colour through the air with brush and palette.', skin: C.skin2, hair: '#3a2418', coat: '#ece6d8', trim: '#5a74b8', pants: '#40344a', boots: C.wood0, work: { n: 8, fps: 8 } },
    kole: { title: 'The master builder', description: 'A stocky smith in a lamp helmet, indigo overalls and leather apron, swinging a heavy hammer that throws sparks.', skin: C.skin1, hair: '#3a2a1c', coat: '#c8955a', trim: '#3e4f86', pants: '#34427a', boots: C.wood0, wide: true, work: { n: 8, fps: 9 } },
    'scum-master': { title: 'The head chef', description: 'A stern, moustached head chef who runs a strict Michelin-star brigade in a white double-breasted jacket, tall pleated toque and red neckerchief, tasting every fusion sauce from his spoon and calling each ticket down the line.', skin: C.skin2, hair: '#4a3020', coat: '#f2eee6', trim: C.red2, pants: '#2c2c34', boots: '#1c1c20', work: { n: 8, fps: 6 } }
  };
  // Figures that only appear inside a double lead. hand: glove colour; lips: mouth colour; skirt/slim: pencil skirt and a narrower jacket.
  const FIGS = {
    'sek-butler': { skin: C.skin3, hair: '#c4c4be', coat: '#24242e', trim: '#f4f2ec', pants: '#2a2a34', boots: '#0e0e12', hand: '#f4f2ec' },
    'sek-secretary': { skin: C.skin2, hair: '#7a3a22', coat: '#8a2a40', trim: '#f4e8d6', pants: '#8a2a40', boots: '#1c1216', lips: '#c8263a', skirt: true, slim: true }
  };
  const prof = role => ROLES[role] || FIGS[role];

  /* ---------- Body parts (facing right; feet at 0,0) ---------- */
  const limb = (q, x0, y0, x1, y1, col, hand) => { q.line(x0, y0, x1, y1, col, 3); q.line(x0 + 1, y0, x1 + 1, y1, S(col, -.18)); q.rect(x1 - 1, y1 - 1, 3, 3, hand); q.px(x1 - 1, y1 - 1, S(hand, .25)); };

  function legs(q, s, mode, f) {
    const pd = S(s.pants, -.25), b = s.boots;
    if (s.skirt) return skirtLegs(q, s, mode, f);
    if (s.robe && mode !== 'sit') {
      const lift = mode === 'walk' ? [0, 1, 0, 1][f] : 0, tap = mode === 'tap' && f ? 1 : 0;
      q.rect(-5, -2, 4, 2, b); q.rect(2 + (mode === 'walk' ? [1, 0, -1, 0][f] : 0), -2 - lift - tap, 5, 2, b); q.px(6, -2 - tap, S(b, .4)); return;
    }
    if (mode === 'sit') {
      q.rect(-7, -5, 10, 2, C.wood3); q.rect(-7, -5, 10, 1, C.wood4); q.rect(-6, -3, 1, 3, C.wood1); q.rect(1, -3, 1, 3, C.wood1);
      q.rect(-3, -9, 10, 4, s.pants); q.rect(-3, -6, 10, 1, pd); q.rect(4, -6, 4, 5, s.pants); q.rect(7, -6, 1, 5, pd);
      q.rect(4, -2, 6, 2, b); q.px(9, -2, S(b, .4)); return;
    }
    let bx = 0, fx = 0, bl = 0, fl = 0, tap = 0;
    if (mode === 'walk') { const st = [2, 0, -2, 0][f]; bx = -st; fx = st; bl = f === 3 ? 1 : 0; fl = f === 1 ? 1 : 0; }
    if (mode === 'tap') tap = f ? 1 : 0;
    if (mode === 'wide') { bx = -1; fx = 1; }
    q.rect(-5 + bx, -8, 4, 6 - bl, pd); q.rect(-6 + bx, -2 - bl, 5, 2, S(b, -.1));
    q.rect(1 + fx, -8, 4, 6 - fl, s.pants); q.px(1 + fx, -8, S(s.pants, .2)); q.rect(1 + fx, -2 - fl - tap, 6, 2, b); q.px(6 + fx, -2 - fl - tap, S(b, .45));
  }
  // Knee-length pencil skirt, sheer stockings and court heels (heel at the back, toe to the right).
  function skirtLegs(q, s, mode, f) {
    const sk = s.coat, skd = S(sk, -.3), leg = S(s.skin, -.08), legd = S(s.skin, -.24), b = s.boots;
    const heel = (x, y) => { q.rect(x, y - 2, 4, 1, b); q.px(x, y - 1, b); q.rect(x + 2, y - 1, 2, 1, b); q.px(x + 3, y - 2, S(b, .5)); };
    if (mode === 'sit') {
      q.rect(-7, -5, 10, 2, C.wood3); q.rect(-7, -5, 10, 1, C.wood4); q.rect(-6, -3, 1, 3, C.wood1); q.rect(1, -3, 1, 3, C.wood1);
      q.rect(-3, -9, 9, 4, sk); q.rect(-3, -6, 9, 1, skd); q.rect(-3, -9, 9, 1, S(sk, .15));
      q.rect(4, -5, 2, 4, legd); q.rect(6, -5, 2, 4, leg); heel(5, 0); return;
    }
    let bx = 0, fx = 0, bl = 0, fl = 0, tap = 0;
    if (mode === 'walk') { const st = [1, 0, -1, 0][f]; bx = -st; fx = st; bl = f === 3 ? 1 : 0; fl = f === 1 ? 1 : 0; }
    if (mode === 'tap') tap = f ? 1 : 0;
    if (mode === 'wide') { bx = -1; fx = 1; }
    q.rect(-3 + bx, -5, 2, 4 - bl, legd); heel(-4 + bx, -bl);
    q.rect(1 + fx, -5, 2, 4 - fl, leg); heel(fx, -fl - tap);
    q.rect(-5, -10, 10, 5, sk); q.rect(-5, -10, 1, 5, S(sk, .2)); q.rect(3, -10, 2, 5, S(sk, -.18)); q.rect(-5, -6, 10, 1, skd); q.px(0, -7, skd);
  }

  function torso(q, s, y, role) {
    const w = s.wide ? 16 : s.slim ? 12 : 14, x = -w / 2, lt = S(s.coat, .22), dk = S(s.coat, -.22), dd = S(s.coat, -.38);
    const h = s.robe ? 19 : role === 'gazeteci' ? 15 : 12;
    q.rect(x, -20 + y, w, h, s.coat); q.rect(x, -20 + y, 1, h, lt); q.rect(x + 1, -20 + y, 3, 1, lt); q.rect(x + w - 2, -20 + y, 2, h, dk); q.rect(x, -21 + h + y, w, 1, dd);
    if (s.robe) { q.rect(x - 1, -8 + y, w + 2, 7, s.coat); q.rect(x - 1, -8 + y, 1, 7, lt); q.rect(x + w - 1, -8 + y, 2, 7, dk); q.rect(x - 1, -2 + y, w + 2, 1, s.trim); q.rect(0, -19 + y, 1, 17, dk); }
    if (s.wide) { q.rect(x - 1, -15 + y, w + 2, 6, s.coat); q.rect(x - 1, -15 + y, 1, 6, lt); q.rect(x + w - 1, -15 + y, 2, 6, dk); }
    const Y = y;
    switch (role) {
      case 'sek-butler': {
        // Black tailcoat with satin lapels, white shirt front, black bow tie, dove-grey waistcoat with a gold watch chain.
        const sat = '#3c3c4c', vest = '#6a6a76';
        q.rect(0, -20 + Y, 5, 3, s.trim); q.rect(1, -17 + Y, 3, 2, s.trim); q.px(2, -15 + Y, s.trim);
        q.rect(0, -15 + Y, 5, 5, vest); q.rect(1, -17 + Y, 3, 2, s.trim); q.px(2, -15 + Y, s.trim); q.px(0, -15 + Y, S(vest, .2)); q.rect(4, -15 + Y, 1, 5, S(vest, -.25));
        q.px(2, -13 + Y, '#c8ccd2'); q.px(2, -11 + Y, '#c8ccd2'); q.px(3, -12 + Y, C.gold2); q.px(4, -12 + Y, C.gold3);
        q.line(-1, -20 + Y, 1, -14 + Y, sat); q.line(6, -20 + Y, 4, -14 + Y, sat); q.px(-1, -19 + Y, lt);
        q.rect(0, -19 + Y, 2, 2, '#0e0e12'); q.px(2, -19 + Y, '#2a2a34'); q.rect(3, -19 + Y, 2, 2, '#0e0e12'); q.px(0, -19 + Y, '#34343e');
        q.px(-4, -17 + Y, s.trim); q.px(-3, -17 + Y, '#d4d0c6');
        q.rect(x, -10 + Y, 5, 1, dd); q.rect(5, -10 + Y, 2, 1, S(s.pants, -.1));
        break; }
      case 'sek-secretary': {
        // Fitted wine-red jacket: cream blouse in the V, gold brooch, cinched waist and a small peplum over the pencil skirt.
        q.rect(0, -20 + Y, 4, 2, s.trim); q.rect(1, -18 + Y, 2, 2, s.trim); q.px(1, -16 + Y, S(s.trim, -.1)); q.px(0, -20 + Y, C.white);
        q.line(-1, -20 + Y, 1, -15 + Y, dk); q.line(5, -20 + Y, 2, -15 + Y, dk);
        q.px(-3, -17 + Y, C.gold3); q.px(-2, -17 + Y, C.gold2); q.px(-3, -16 + Y, C.gold1);
        q.px(2, -13 + Y, C.gold2); q.px(2, -11 + Y, C.gold2);
        q.rect(x, -13 + Y, w, 1, dd); q.px(x, -12 + Y, dd); q.px(x + w - 1, -12 + Y, dd);
        q.rect(x - 1, -10 + Y, w + 2, 2, s.coat); q.rect(x - 1, -10 + Y, 1, 2, lt); q.rect(x + w - 1, -10 + Y, 2, 2, dk); q.rect(x - 1, -9 + Y, w + 2, 1, dd);
        break; }
      case 'girard':
        q.rect(-2, -19 + Y, 4, 9, C.paper2); q.rect(-2, -19 + Y, 1, 9, C.paper); q.px(0, -17 + Y, C.gold2); q.px(0, -14 + Y, C.gold2); q.px(0, -11 + Y, C.gold2);
        q.rect(-3, -20 + Y, 1, 11, C.gold2); q.rect(2, -20 + Y, 1, 11, C.gold2); q.line(2, -14 + Y, 6, -12 + Y, C.gold3);
        for (let i = 0; i < 4; i++) { q.px(-6 + (i % 2), -17 + i * 2 + Y, S(s.coat, .35)); q.px(5 - (i % 2), -16 + i * 2 + Y, S(s.coat, -.4)); }
        q.rect(x - 1, -10 + Y, w + 2, 1, dd);
        break;
      case 'text-writer':
        q.rect(x, -12 + Y, w, 1, s.trim); q.rect(-2, -20 + Y, 5, 2, S(s.coat, .35)); q.px(0, -18 + Y, s.trim);
        break;
      case 'gazeteci':
        q.poly([[-2, -20 + Y], [3, -20 + Y], [0, -15 + Y]], s.trim); q.px(0, -17 + Y, C.red2); q.px(0, -16 + Y, C.red1);
        q.line(-3, -20 + Y, 0, -14 + Y, dk); q.line(4, -20 + Y, 1, -14 + Y, dk);
        q.rect(x, -11 + Y, w, 1, dd); q.px(1, -11 + Y, C.gold2);
        q.line(-4, -20 + Y, 4, -14 + Y, '#2a2420'); q.rect(2, -16 + Y, 6, 4, '#2d2d33'); q.rect(2, -16 + Y, 6, 1, '#55555e'); q.px(5, -14 + Y, C.glass); q.px(3, -15 + Y, '#e4e4e4');
        break;
      case 'bayes':
        for (const [sx, sy] of [[-4, -16], [3, -12], [-2, -6], [4, -4], [-5, -3]]) { q.px(sx, sy + Y, C.gold3); }
        q.rect(-3, -20 + Y, 7, 2, S(s.coat, .3)); q.px(0, -19 + Y, C.gold3);
        break;
      case 'kandinsky':
        for (let yy = -18; yy < -9; yy += 3) q.rect(x + 1, yy + Y, w - 3, 1, s.trim);
        q.rect(-5, -21 + Y, 11, 2, C.red2); q.rect(-5, -21 + Y, 11, 1, C.red3); q.rect(3, -19 + Y, 2, 6, C.red2); q.px(4, -14 + Y, C.red1);
        q.px(-3, -13 + Y, '#e0b44a'); q.px(2, -11 + Y, '#58998c'); q.px(-1, -16 + Y, C.red3);
        break;
      case 'kole': {
        q.rect(-5, -18 + Y, 10, 9, s.trim); q.rect(-5, -18 + Y, 1, 9, S(s.trim, .25)); q.rect(-5, -20 + Y, 2, 3, s.trim); q.rect(3, -20 + Y, 2, 3, s.trim); q.px(-4, -17 + Y, C.gold3); q.px(3, -17 + Y, C.gold3);
        q.rect(-6, -13 + Y, 12, 11, '#8a5a36'); q.rect(-6, -13 + Y, 12, 1, '#a8724a'); q.rect(-6, -13 + Y, 1, 11, '#a8724a'); q.rect(4, -12 + Y, 2, 10, '#6a4228'); q.rect(-2, -10 + Y, 4, 3, '#6a4228'); q.px(-1, -9 + Y, C.stone3);
        break; }
      case 'scum-master': {
        // Double-breasted chef jacket: offset front panel, two rows of cloth buttons, red neckerchief, long apron and side towel.
        const ap = '#ebe7dc', aps = S(ap, -.16), sit = y >= 4;
        q.rect(-4, -21 + Y, 9, 2, S(s.coat, -.1)); q.rect(-2, -20 + Y, 6, 2, s.trim); q.rect(-2, -20 + Y, 6, 1, S(s.trim, .25)); q.px(3, -18 + Y, s.trim); q.px(4, -17 + Y, S(s.trim, -.3));
        q.rect(4, -17 + Y, 1, 8, dk); q.px(5, -17 + Y, lt);
        for (const yy of [-16, -13, -10]) { q.px(0, yy + Y, '#8a8478'); q.px(3, yy + Y, '#8a8478'); }
        q.rect(x, -9 + Y, w, 1, '#c8c2b4'); q.px(x - 1, -9 + Y, '#c8c2b4'); q.px(x - 1, -8 + Y, '#b0aa9c');
        q.rect(-6, -8 + Y, 12, sit ? 3 : 6, ap); q.rect(-6, -8 + Y, 1, sit ? 3 : 6, C.white); q.rect(4, -8 + Y, 2, sit ? 3 : 6, aps); if (!sit) q.rect(-6, -3 + Y, 12, 1, aps);
        q.rect(-8, -8 + Y, 2, 5, '#dfe8f0'); q.px(-8, -6 + Y, '#5a7ab0'); q.px(-7, -6 + Y, '#5a7ab0');
        break; }
    }
  }

  function backLayer(q, s, y, role, sit) {
    if (role === 'text-writer' || role === 'bayes') { q.rect(-7, -32 + y, 4, 16, role === 'bayes' ? '#e8e4d8' : s.hair); q.px(-7, -17 + y, S(s.hair, -.2)); }
    if (role === 'sek-butler') { const dk = S(s.coat, -.3); q.rect(-9, -13 + y, 3, sit ? 6 : 10, s.coat); q.rect(-9, -13 + y, 1, sit ? 6 : 10, S(s.coat, .2)); q.px(-7, (sit ? -8 : -4) + y, dk); q.px(-8, (sit ? -8 : -4) + y, dk); }
    if (role === 'sek-secretary') {
      // Long, wavy chestnut hair falling past her shoulders.
      const h = s.hair, hd = S(h, -.28), hl = S(h, .22);
      q.rect(-8, -25 + y, 4, 10, h); q.px(-9, -23 + y, h); q.px(-9, -19 + y, h); q.rect(-7, -15 + y, 3, 1, h); q.px(-8, -15 + y, hd);
      q.px(-7, -22 + y, hd); q.px(-6, -18 + y, hd); q.px(-8, -17 + y, hd);
      q.px(-8, -21 + y, hl); q.px(-7, -17 + y, hl);
    }
  }

  function head(q, s, y, role, eyes = 'open', mouth = 'smile', look = 0) {
    const hy = -33 + y, sk = s.skin, skd = S(sk, -.2), hair = s.hair, hd = S(hair, -.28);
    q.rect(-2, hy + 11, 5, 2, skd);
    q.rect(-6, hy + 1, 13, 10, sk); q.rect(-5, hy, 11, 12, sk); q.rect(-5, hy + 11, 11, 1, skd); q.rect(6, hy + 2, 1, 8, S(sk, -.1));
    q.px(-5, hy + 2, S(sk, .25)); q.rect(-4, hy + 1, 3, 1, S(sk, .25));
    q.rect(-2, hy + 5, 2, 3, sk); q.px(-2, hy + 6, skd); // ear
    const ex = 2 + look;
    if (eyes === 'closed') { q.rect(ex, hy + 7, 2, 1, C.ink); q.rect(ex + 3, hy + 7, 2, 1, C.ink); }
    else if (eyes === 'happy') { q.px(ex, hy + 7, C.ink); q.px(ex + 1, hy + 6, C.ink); q.px(ex + 3, hy + 6, C.ink); q.px(ex + 4, hy + 7, C.ink); }
    else if (eyes === 'wide') { q.rect(ex, hy + 5, 2, 3, C.white); q.px(ex + 1, hy + 6, C.ink); q.px(ex + 1, hy + 7, C.ink); q.rect(ex + 3, hy + 5, 2, 3, C.white); q.px(ex + 4, hy + 6, C.ink); q.px(ex + 4, hy + 7, C.ink); }
    else { q.rect(ex, hy + 6, 1, 2, C.ink); q.rect(ex + 3, hy + 6, 1, 2, C.ink); q.px(ex, hy + 6, '#5a4a44'); }
    q.px(6, hy + 8, skd); q.px(5 + look, hy + 9, '#e8907a');
    const lip = s.lips || '#8a3a30';
    if (mouth === 'smile') { q.px(2, hy + 9, lip); q.rect(3, hy + 10, 2, 1, lip); q.px(5, hy + 9, lip); }
    else if (mouth === 'flat') { q.rect(3, hy + 10, 2, 1, lip); }
    else if (mouth === 'o') { q.rect(3, hy + 9, 2, 2, '#5a1e1a'); }
    else if (mouth === 'frown') { q.px(3, hy + 10, lip); q.px(4, hy + 10, lip); q.px(2, hy + 11, lip); }
    else if (mouth === 'grin') { q.rect(2, hy + 9, 4, 2, C.white); q.rect(2, hy + 10, 4, 1, lip); }
    const brow = (col, h = 1) => { q.rect(ex - 1, hy + 4, 2, h, col); q.rect(ex + 3, hy + 4, 2, h, col); };
    switch (role) {
      case 'sek-butler': {
        // Silver hair combed straight back from a high forehead, grey brows and a trim grey moustache.
        const hl = S(hair, .35), st = '#e2e2dc';
        q.rect(-4, hy - 2, 6, 1, hair); q.rect(-6, hy - 1, 10, 1, hair); q.rect(-6, hy, 6, 1, hair); q.rect(-6, hy + 1, 4, 8, hair); q.rect(-2, hy + 2, 1, 3, hair);
        q.rect(-3, hy - 2, 4, 1, hl); q.px(-4, hy - 1, hd); q.px(-1, hy - 1, hd); q.px(2, hy - 1, hd); q.px(-5, hy + 3, hd); q.px(-5, hy + 6, hd); q.px(-6, hy + 8, S(hair, -.12)); q.px(1, hy + 1, S(sk, -.08));
        brow(S(hair, -.3));
        q.rect(2, hy + 8, 5, 1, st); q.px(2, hy + 9, st); q.px(6, hy + 9, st); q.px(4, hy + 8, S(hair, -.1));
        q.px(0, hy + 9, skd); q.px(1, hy + 10, skd);
        break; }
      case 'sek-secretary': {
        // Long wavy chestnut hair with a side part, cat-eye glasses, red lipstick and a pearl stud.
        const hl = S(hair, .22), F = '#5a1e2a', gy = eyes === 'wide' ? 1 : 0;
        q.rect(-6, hy - 2, 10, 1, hair); q.rect(-7, hy - 1, 13, 2, hair); q.rect(-7, hy + 1, 5, 9, hair); q.rect(-2, hy + 1, 8, 1, hair); q.rect(3, hy + 2, 3, 1, hair); q.rect(-3, hy + 2, 2, 2, hair);
        q.px(-8, hy + 3, hair); q.px(-8, hy + 7, hair);
        q.rect(-5, hy - 2, 4, 1, hl); q.rect(0, hy - 1, 3, 1, hl); q.px(-6, hy + 4, hl); q.px(-5, hy + 8, hl);
        q.px(-1, hy - 1, hd); q.px(-5, hy + 2, hd); q.px(-4, hy + 6, hd); q.px(-6, hy + 9, hd); q.px(5, hy + 2, hd);
        if (mouth === 'smile' || mouth === 'flat') { q.rect(3, hy + 9, 2, 1, S(lip, .2)); q.px(4, hy + 10, S(lip, -.2)); }
        q.rect(ex - 1, hy + 5 + gy, 6, 1, F); q.px(ex - 2, hy + 4 + gy, F); q.px(ex + 5, hy + 4 + gy, F); q.px(ex + 4, hy + 6 + gy, '#d8eef2'); q.px(ex + 1, hy + 6 + gy, '#d8eef2');
        q.px(-2, hy + 8, '#f6f2ea');
        break; }
      case 'girard':
        q.rect(-6, hy + 2, 3, 6, hair); q.rect(-6, hy + 1, 13, 1, hair); brow(hair, 2);
        q.rect(3, hy + 9, 5, 1, hair); q.px(7, hy + 10, hair); q.px(2, hy + 10, hair);
        q.rect(-4, hy - 6, 10, 7, '#9c2a30'); q.rect(-4, hy - 6, 10, 1, '#c24a4a'); q.rect(-4, hy - 6, 1, 7, '#c24a4a'); q.rect(4, hy - 6, 2, 7, '#6e1c22'); q.rect(-4, hy, 10, 1, C.gold2);
        q.line(0, hy - 6, -4, hy - 3, C.gold2); q.px(-5, hy - 2, C.gold3); q.px(-5, hy - 3, C.gold2);
        break;
      case 'text-writer':
        q.rect(-6, hy + 1, 5, 9, hair); q.rect(-6, hy, 12, 2, hair); q.rect(-6, hy - 1, 10, 1, S(hair, .1)); brow(hair);
        q.rect(1, hy + 8, 6, 4, hair); q.rect(1, hy + 12, 5, 3, hair); q.rect(2, hy + 15, 3, 2, hair); q.px(3, hy + 17, hair); q.px(2, hy + 11, hd); q.px(4, hy + 13, hd);
        q.rect(3, hy + 9, 2, 1, '#8a6a60');
        q.rect(-6, hy - 3, 12, 3, C.plum2); q.rect(-5, hy - 4, 10, 1, C.plum3); q.rect(4, hy - 3, 2, 3, C.plum1); q.px(-6, hy - 1, C.gold2); q.px(-7, hy, C.gold2); q.px(-7, hy + 1, C.gold3);
        break;
      case 'gazeteci':
        q.rect(-6, hy + 1, 4, 7, hair); q.px(6, hy + 4, hair); q.rect(5, hy + 3, 2, 3, hair); brow(hair);
        q.rect(-7, hy - 2, 14, 4, '#6a7a4a'); q.rect(-6, hy - 3, 12, 1, '#889a60'); q.rect(-7, hy - 2, 1, 3, '#889a60'); q.rect(4, hy - 2, 3, 4, '#4e5a36'); q.rect(2, hy + 1, 7, 2, '#4e5a36'); q.rect(3, hy + 1, 6, 1, '#3a4428'); q.px(0, hy - 3, '#aabb80');
        q.rect(-5, hy - 1, 3, 2, C.paper); q.px(-4, hy, C.red2);
        break;
      case 'bayes':
        q.rect(-6, hy + 2, 3, 7, hair); brow(hair);
        q.rect(1, hy + 9, 6, 4, hair); q.rect(1, hy + 13, 5, 3, hair); q.rect(2, hy + 16, 3, 2, hair); q.px(3, hy + 18, hair); q.px(3, hy + 11, S(hair, -.15));
        q.rect(ex - 1, hy + 5, 3, 4, C.gold2); q.px(ex, hy + 6, C.ink); q.px(ex, hy + 7, C.ink); q.rect(ex + 2, hy + 5, 3, 4, C.gold2); q.px(ex + 3, hy + 6, C.ink); q.px(ex + 3, hy + 7, C.ink); q.px(ex + 2, hy + 6, C.gold1);
        if (eyes === 'closed') { q.rect(ex - 1, hy + 6, 6, 2, C.gold2); q.rect(ex, hy + 7, 1, 1, C.ink); q.rect(ex + 3, hy + 7, 1, 1, C.ink); }
        q.rect(-8, hy, 17, 2, '#243060'); q.rect(-8, hy, 17, 1, '#3a4884');
        q.poly([[-6, hy], [8, hy], [3, hy - 11], [0, hy - 13]], '#2e3870'); q.poly([[-6, hy], [0, hy - 13], [1, hy - 6], [-2, hy]], '#3e4a8a');
        q.rect(-1, hy - 15, 2, 2, '#2e3870'); q.px(-2, hy - 16, '#3e4a8a');
        q.px(2, hy - 5, C.gold3); q.px(-2, hy - 8, C.gold4); q.px(5, hy - 2, C.gold3); q.rect(-6, hy - 1, 14, 1, C.gold1);
        break;
      case 'kandinsky':
        q.rect(-6, hy + 1, 4, 8, hair); q.px(-7, hy + 4, hair); q.px(-7, hy + 7, hair); q.rect(5, hy + 3, 1, 2, hair); brow(hair);
        q.rect(3, hy + 9, 4, 1, hair); q.px(7, hy + 8, hair); q.px(2, hy + 8, hair);
        q.rect(-8, hy - 2, 14, 3, '#7a3f8c'); q.rect(-7, hy - 3, 11, 1, '#9a5fac'); q.rect(-8, hy - 2, 3, 1, '#9a5fac'); q.rect(3, hy - 1, 3, 2, '#5a2a68'); q.px(-1, hy - 4, '#5a2a68'); q.px(-1, hy - 5, '#7a3f8c');
        break;
      case 'kole':
        q.rect(-6, hy + 2, 3, 5, hair); brow(hair, 2);
        q.px(1, hy + 11, S(hair, .2)); q.px(3, hy + 11, S(hair, .2)); q.px(5, hy + 10, S(hair, .2)); q.px(6, hy + 11, S(hair, .2));
        q.rect(-7, hy - 3, 15, 5, C.gold2); q.rect(-6, hy - 4, 13, 1, C.gold3); q.rect(-7, hy - 3, 2, 4, C.gold3); q.rect(5, hy - 3, 3, 5, C.gold1); q.rect(-8, hy + 2, 17, 1, C.gold1); q.rect(-1, hy - 4, 2, 6, C.gold3);
        q.rect(5, hy - 2, 4, 3, '#4a4a44'); q.rect(6, hy - 1, 3, 2, C.gold4); q.px(8, hy - 1, C.white);
        break;
      case 'scum-master': {
        // Short dark hair and a full moustache under a tall pleated toque.
        const W = '#f7f4ec', Wl = C.white, Wd = '#d6d0c2', Wdd = '#aea796';
        q.rect(-6, hy + 1, 4, 6, hair); q.rect(-6, hy + 1, 13, 1, hair); q.px(-6, hy + 7, S(hair, .2)); brow(hair);
        q.rect(2, hy + 8, 5, 1, hair); q.px(1, hy + 9, hair); q.px(6, hy + 9, hair); q.px(4, hy + 8, hd);
        q.rect(-6, hy - 2, 13, 3, W); q.rect(-6, hy - 2, 13, 1, Wl); q.rect(5, hy - 2, 2, 3, Wd); q.rect(-6, hy, 13, 1, Wd);
        q.rect(-8, hy - 9, 16, 7, W); q.rect(-7, hy - 10, 14, 1, W); q.rect(-5, hy - 11, 9, 1, W);
        q.rect(-7, hy - 10, 4, 1, Wl); q.rect(-8, hy - 9, 2, 5, Wl); q.rect(6, hy - 9, 2, 7, Wd); q.px(7, hy - 8, Wdd); q.rect(-8, hy - 3, 16, 1, Wdd);
        for (const xs of [-4, -1, 2, 5]) q.rect(xs, hy - 8, 1, 5, Wd);
        break; }
    }
  }

  /* ---------- Held items ---------- */
  const envelope = (q, x, y) => { q.rect(x - 3, y - 3, 7, 5, C.paper); q.line(x - 3, y - 3, x, y, C.paper2); q.line(x + 3, y - 3, x, y, C.paper2); q.px(x, y, C.red2); };
  const coin = (q, x, y, f) => { const w = [3, 2, 1, 2][f % 4]; q.rect(x - Math.floor(w / 2), y - 1, w, 3, C.gold2); q.px(x - Math.floor(w / 2), y - 1, C.gold4); };
  const ledger = (q, x, y) => { q.rect(x - 3, y - 5, 6, 9, '#5a3a24'); q.rect(x - 3, y - 5, 1, 9, '#7a5436'); q.rect(x + 2, y - 4, 1, 7, C.paper); q.px(x, y - 3, C.gold2); };
  const quill = (q, x, y, dip = 0) => { q.line(x, y, x + 3, y - 8, C.white); q.line(x + 1, y, x + 4, y - 8, '#d8d0bc'); q.px(x + 4, y - 9, C.white); q.px(x - 1, y + 1 + dip, C.ink); };
  const scroll = (q, x, y, inked) => { q.rect(x, y, 11, 7, C.paper); q.rect(x, y, 11, 1, C.white); q.rect(x - 1, y - 1, 2, 9, C.paper2); q.rect(x + 10, y - 1, 2, 9, C.paper2); for (let i = 0; i < inked; i++) q.rect(x + 2, y + 2 + (i % 3) * 2, Math.min(7, 2 + i * 2), 1, '#4a4060'); };
  const notepad = (q, x, y) => { q.rect(x - 2, y - 3, 5, 6, C.paper); q.rect(x - 2, y - 3, 5, 1, C.red2); q.px(x - 1, y - 1, '#8a8474'); q.px(x, y + 1, '#8a8474'); };
  const pencil = (q, x, y) => { q.line(x, y, x + 2, y - 4, C.gold2); q.px(x, y, C.ink); };
  const camera = (q, x, y, flash) => { q.rect(x - 3, y - 2, 7, 5, '#2d2d33'); q.rect(x - 3, y - 2, 7, 1, '#55555e'); q.rect(x - 1, y - 4, 3, 2, '#2d2d33'); q.px(x + 1, y, C.glass); q.rect(x + 2, y - 4, 2, 1, C.stone4); if (flash) { q.rect(x + 3, y - 7, 1, 5, C.white); q.rect(x + 1, y - 5, 5, 1, C.white); q.px(x + 3, y - 5, C.gold4); } };
  const telescope = (q, x0, y0, x1, y1) => { q.line(x0, y0, x1, y1, C.gold1, 3); q.line(x0, y0 - 1, x1, y1 - 1, C.gold2, 1); q.line(x0 + (x1 - x0) * .4, y0 + (y1 - y0) * .4, x1, y1, C.gold2, 3); q.px(x1, y1 - 1, C.gold4); q.rect(x1, y1 - 1, 2, 2, C.glass); };
  const palette = (q, x, y) => { q.ellipse(x, y, 5, 3, C.wood4); q.px(x - 3, y - 1, C.red2); q.px(x - 1, y - 2, C.gold2); q.px(x + 1, y - 2, '#4a7ac0'); q.px(x + 3, y - 1, '#5aa04a'); q.px(x + 2, y + 1, '#9a5fac'); q.px(x - 1, y + 1, C.wood2); };
  const brush = (q, x, y, dx, dy, tip) => { q.line(x, y, x + dx, y + dy, C.wood2); q.rect(x + dx - (dx > 0 ? 0 : 1), y + dy - 1, 2, 2, tip); };
  const hammer = (q, x, y, ang) => { const hx = x + Math.cos(ang) * 11, hy = y + Math.sin(ang) * 11; q.line(x, y, hx, hy, C.wood3, 2); const px = -Math.sin(ang), py = Math.cos(ang); q.line(hx - px * 4, hy - py * 4, hx + px * 4, hy + py * 4, C.stone2, 4); q.line(hx - px * 4, hy - py * 4 - 1, hx + px * 3, hy + py * 3 - 1, C.stone4, 1); };
  const spoon = (q, x0, y0, x1, y1) => { q.line(x0, y0, x1, y1, '#c8ccd2'); q.rect(x1 - 1, y1 - 1, 2, 2, '#e4e8ec'); q.px(x1, y1, '#9aa2ae'); };
  const ladle = (q, x, y) => { q.line(x, y - 8, x, y + 3, '#c8ccd2'); q.px(x - 1, y - 8, '#9aa2ae'); q.rect(x - 2, y + 3, 5, 3, '#aab2bc'); q.rect(x - 1, y + 3, 3, 1, '#e4e8ec'); q.px(x + 2, y + 5, '#7a828e'); };
  const ticket = (q, x, y) => { q.rect(x, y, 6, 8, C.paper); q.rect(x, y, 6, 1, C.white); q.rect(x + 1, y + 2, 4, 1, '#7a7264'); q.rect(x + 1, y + 4, 3, 1, '#7a7264'); q.px(x + 4, y + 6, C.red2); };
  // The butler's silver salver (held flat, level with the glove at x, y), with an optional sealed letter on it.
  const salver = (q, x, y, letter) => { q.rect(x - 4, y - 1, 10, 1, '#dde2e8'); q.rect(x - 3, y, 8, 1, '#9aa2ae'); q.px(x - 3, y - 1, C.white); q.px(x + 5, y - 1, '#aab2bc'); if (letter) { q.rect(x - 2, y - 4, 7, 3, C.paper); q.rect(x - 2, y - 4, 7, 1, C.white); q.px(x + 1, y - 3, C.red2); q.px(x + 2, y - 3, C.red1); } };
  const clipboard = (q, x, y) => { q.rect(x - 3, y - 4, 7, 9, '#8a5a36'); q.rect(x - 3, y - 4, 1, 9, '#a8724a'); q.rect(x - 2, y - 3, 5, 7, C.paper); q.rect(x - 1, y - 5, 3, 2, '#c8ccd2'); q.px(x, y - 5, '#9aa2ae'); for (const r of [-1, 1, 3]) q.rect(x - 1, y + r, r === 3 ? 2 : 3, 1, '#8a8474'); q.px(x + 2, y + 3, C.red2); };
  const fountainPen = (q, x, y) => { q.line(x, y, x + 2, y - 4, '#1c1418'); q.px(x + 2, y - 4, C.gold2); q.px(x, y, C.gold3); };

  /* ---------- Poses ---------- */
  // Hands: bh = back hand, fh = front hand (relative to feet). Items draw after arms.
  function pose(role, anim, f) {
    const p = { dy: 0, legs: 'stand', bh: [-7, -11], fh: [7, -11], eyes: 'open', mouth: 'smile', look: 0, item: null, backItem: null };
    if (anim === 'idle' || anim === 'blink' || anim === 'chat') { p.dy = f ? 1 : 0; if (anim === 'blink') p.eyes = 'closed'; }
    if (anim === 'stretch') { p.bh = [-6, -33]; p.fh = [6, -33]; p.eyes = 'happy'; p.mouth = 'o'; p.dy = -1; }
    if (anim === 'walk') { p.legs = 'walk'; p.dy = f % 2 ? -1 : 0; const sw = [2, 0, -2, 0][f]; p.bh = [-7 + sw, -11]; p.fh = [7 - sw, -11]; }
    if (anim === 'wait') { p.legs = 'tap'; p.bh = [-8, -13]; p.fh = [8, -22 + f]; p.mouth = 'flat'; p.look = 1; }
    if (anim === 'err') { p.bh = [-9, -29 - (f === 2 ? 1 : 0)]; p.fh = [9, -29 + (f === 1 ? 1 : 0)]; p.eyes = 'wide'; p.mouth = 'o'; p.legs = 'wide'; }
    if (anim === 'sleep') { p.legs = 'sit'; p.dy = 4 + (f ? 1 : 0); p.bh = [-3, -8]; p.fh = [4, -8]; p.eyes = 'closed'; p.mouth = 'flat'; }
    // Resting props, so each lead is recognisable when not working.
    const rest = { 'sek-butler': q => salver(q, p.fh[0], p.fh[1] - 1, true), 'sek-secretary': q => clipboard(q, p.fh[0] + 1, p.fh[1]), girard: q => coin(q, p.fh[0], p.fh[1] - 2, 0), 'text-writer': q => quill(q, p.fh[0], p.fh[1]), gazeteci: q => notepad(q, p.fh[0] + 1, p.fh[1] - 1), bayes: q => { q.rect(p.fh[0], p.fh[1] - 12, 2, 13, C.gold1); q.px(p.fh[0], p.fh[1] - 12, C.gold4); q.rect(p.fh[0] - 1, p.fh[1] - 13, 4, 2, C.gold2); }, kandinsky: q => brush(q, p.fh[0], p.fh[1], 2, -6, '#9a5fac'), kole: q => hammer(q, p.fh[0], p.fh[1] + 2, -1.9), 'scum-master': q => ladle(q, p.fh[0], p.fh[1]) };
    if (anim !== 'work' && anim !== 'err' && anim !== 'stretch') p.item = rest[role];
    if (role === 'girard' && anim !== 'stretch' && anim !== 'err') p.backItem = q => ledger(q, p.bh[0] - 1, p.bh[1] - 2);
    if (role === 'kandinsky' && anim !== 'stretch' && anim !== 'err') p.backItem = q => palette(q, p.bh[0] - 3, p.bh[1] - 1);
    // The double lead's figures: the butler carries his salver level at chest height (and presents it while waiting)
    // and straightens his bow tie instead of stretching; the secretary hugs her clipboard while waiting and chats (anim 'chat').
    if (role === 'sek-butler') {
      if (anim === 'tie') { p.fh = [3, -19]; p.eyes = 'closed'; p.item = null; }
      else if (anim === 'idle' || anim === 'blink' || anim === 'chat' || anim === 'walk') p.fh = [8, -15];
    }
    if (role === 'sek-secretary') {
      if (anim === 'wait') p.fh = [5, -15];
      if (anim === 'chat') { p.mouth = f ? 'o' : 'smile'; p.eyes = f ? 'open' : 'happy'; }
    }
    if (anim !== 'work') return p;
    // Role-specific work cycles.
    switch (role) {
      case 'sek-butler': {
        // Stamps the letter on the desk (0-4), tosses it to the out-tray (5-6), and takes the next one from the secretary behind him (5-7).
        const ups = [[7, -27], [7, -29], [8, -15], [8, -15], [8, -17], [10, -20], [9, -14], [7, -24]][f];
        p.bh = [[8, -13], [8, -13], [8, -13], [8, -13], [8, -13], [-9, -14], [-9, -14], [3, -14]][f]; p.fh = ups; p.dy = f === 2 || f === 3 ? 1 : 0; p.eyes = f === 2 ? 'happy' : 'open';
        p.item = q => {
          if (f < 5) envelope(q, 10, -12);
          if (f === 5) envelope(q, 13, -22); if (f === 6) envelope(q, 16, -26);
          if (f >= 6) envelope(q, p.bh[0] + 1, p.bh[1] - 1);
          const [hx, hy] = ups; q.rect(hx - 1, hy - 5, 3, 4, C.wood2); q.rect(hx - 2, hy - 1, 5, 2, C.red1); q.px(hx - 1, hy - 5, C.wood4);
          if (f === 2) { q.px(4, -13, C.white); q.px(14, -13, C.white); q.px(5, -10, C.white); q.px(13, -10, C.white); }
          if (f >= 3 && f < 5) q.px(10, -12, C.red2), q.px(11, -12, C.red2);
        };
        break; }
      case 'sek-secretary': {
        // Notes each letter on her clipboard (0-3), then hands the next envelope forward to the butler (4-5).
        const hand = [[5, -13], [7, -14], [6, -12], [7, -13], [8, -17], [10, -15], [8, -14], [5, -13]][f], sk = FIGS[role].skin;
        p.bh = [4, -15]; p.fh = hand; p.look = f < 4 ? 1 : 0; p.eyes = f === 5 ? 'happy' : 'open';
        p.item = q => {
          clipboard(q, 3, -15);
          if (f < 4) q.rect(3, -12 + (f % 2), Math.min(4, 1 + f), 1, '#4a4060');
          q.rect(hand[0] - 1, hand[1] - 1, 3, 3, sk); q.px(hand[0] - 1, hand[1] - 1, S(sk, .25));
          if (f === 4 || f === 5) envelope(q, hand[0] + 2, hand[1] - 1); else fountainPen(q, hand[0], hand[1]);
        };
        break; }
      case 'girard': {
        const cy = [0, -5, -9, -12, -13, -12, -9, -5, 0, 0][f];
        p.fh = [8, -14 + (f === 0 || f === 9 ? 1 : 0)]; p.bh = [-8, -13]; p.eyes = f > 1 && f < 8 ? 'open' : 'happy'; p.look = f > 1 && f < 8 ? 0 : 0; p.mouth = f === 9 ? 'grin' : 'smile';
        p.item = q => { coin(q, 8, -17 + cy, f); if (f === 4) { q.px(6, -32, C.gold4); q.px(11, -31, C.gold4); } };
        break; }
      case 'text-writer': {
        const xs = [3, 5, 7, 9, 4, 6, 8, 10][f];
        p.bh = [2, -12]; p.fh = [xs, -14 - (f % 2)]; p.eyes = 'open'; p.look = 1; p.mouth = 'flat';
        p.item = q => { scroll(q, 2, -16, Math.min(3, 1 + (f >> 1))); quill(q, xs, -14 - (f % 2)); if (f % 4 === 0) q.px(xs - 1, -12, '#4a4060'); };
        break; }
      case 'gazeteci': {
        if (f < 8) { const sx = [7, 9, 8, 10, 7, 9, 8, 10][f]; p.bh = [7, -15]; p.fh = [sx, -14 - (f % 2)]; p.look = 1; p.mouth = f % 3 ? 'smile' : 'o'; p.item = q => { notepad(q, 8, -16); pencil(q, sx, -14 - (f % 2)); }; }
        else { p.bh = [5, -26]; p.fh = [8, -25]; p.eyes = f === 9 || f === 10 ? 'closed' : 'open'; p.mouth = 'grin'; p.item = q => camera(q, 7, -27, f === 9 || f === 10); }
        break; }
      case 'bayes': {
        const tips = [[20, -40], [21, -38], [19, -41], [20, -40], [21, -39], [20, -41], [19, -40], [20, -39]][f];
        p.bh = [6, -26]; p.fh = [10, -27]; p.eyes = 'closed'; p.mouth = 'smile';
        p.item = q => { telescope(q, 6, -26, tips[0], tips[1]); if (f === 2 || f === 6) { q.px(tips[0] + 3, tips[1] - 4, C.gold4); q.px(tips[0] + 2, tips[1] - 4, C.gold3); q.px(tips[0] + 4, tips[1] - 4, C.gold3); q.px(tips[0] + 3, tips[1] - 5, C.gold3); q.px(tips[0] + 3, tips[1] - 3, C.gold3); } };
        break; }
      case 'kandinsky': {
        const hs = [[10, -25], [12, -21], [11, -16], [8, -19], [10, -25], [13, -23], [12, -17], [9, -21]][f], cols = ['#e46c52', '#e0b44a', '#4a7ac0', '#5aa04a', '#9a5fac', '#e46c52', '#58998c', '#e0b44a'];
        p.bh = [-8, -14]; p.fh = hs; p.mouth = f % 4 === 1 ? 'grin' : 'smile'; p.eyes = f % 4 === 1 ? 'happy' : 'open';
        p.item = q => { brush(q, hs[0], hs[1], 3, -5, cols[f]); for (let i = 1; i < 4; i++) { const pf = (f - i + 8) % 8, ph = [[10, -25], [12, -21], [11, -16], [8, -19], [10, -25], [13, -23], [12, -17], [9, -21]][pf]; q.px(ph[0] + 4, ph[1] - 5, cols[pf]); } };
        break; }
      case 'kole': {
        const ang = [-2.6, -2.2, -1.6, -0.9, 0.35, 0.5, 0.2, -1.2][f], hand = [[-1, -30], [2, -33], [6, -32], [9, -27], [10, -16], [10, -15], [9, -17], [6, -24]][f];
        p.bh = [hand[0] - 2, hand[1] + 2]; p.fh = hand; p.dy = f === 4 || f === 5 ? 1 : 0; p.mouth = f === 4 ? 'grin' : 'frown'; p.eyes = f === 4 ? 'closed' : 'open';
        p.item = q => { hammer(q, hand[0], hand[1], ang); if (f === 4 || f === 5) for (const [sx, sy] of [[19, -16], [21, -19], [18, -21], [23, -14], [16, -18]]) q.px(sx + (f - 4) * 2, sy - (f - 4) * 2, f === 4 ? C.gold4 : C.gold2); };
        break; }
      case 'scum-master': {
        // Tastes the sauce from his spoon (0-3), then holds up an order ticket and calls it down the line (4-7).
        const hand = [[8, -13], [9, -18], [7, -21], [7, -21], [9, -26], [10, -30], [10, -30], [9, -27]][f], call = f >= 4;
        p.bh = [-8, -12]; p.fh = hand; p.eyes = f === 2 || f === 3 ? 'closed' : 'open';
        p.mouth = f === 2 ? 'o' : f === 3 ? 'grin' : call && f < 7 ? 'o' : 'smile';
        if (call) p.backItem = q => spoon(q, -8, -12, -9, -17);
        p.item = q => {
          if (!call) { const tip = [[11, -17], [12, -22], [5, -24], [5, -24]][f]; spoon(q, hand[0], hand[1], tip[0], tip[1]); if (f === 3) { q.px(11, -33, C.gold4); q.px(13, -35, C.gold3); q.px(12, -31, C.gold3); } }
          else { ticket(q, hand[0] - 2, hand[1] - 8); if (f === 5 || f === 6) { const o = f - 5; q.px(15 + o, -37, C.white); q.px(16 + o, -38, C.white); q.px(16 + o, -33, C.white); q.px(17 + o, -33, C.white); q.px(15 + o, -29, C.white); q.px(16 + o, -28, C.white); } }
        };
        break; }
    }
    return p;
  }

  function drawLead(q, role, anim, f) {
    const s = prof(role), p = pose(role, anim, f), y = p.dy, sit = anim === 'sleep';
    const sleeve = S(s.coat, -.12), hand = s.hand || s.skin;
    backLayer(q, s, y, role, sit);
    const shB = [-6, -18 + y], shF = [5, -18 + y];
    limb(q, shB[0], shB[1], p.bh[0], p.bh[1] + (sit ? y - 4 : 0), S(s.coat, -.3), S(hand, -.15));
    if (p.backItem) p.backItem(q);
    legs(q, s, p.legs, f);
    torso(q, s, y, role);
    head(q, s, y, role, p.eyes, p.mouth, p.look);
    limb(q, shF[0], shF[1], p.fh[0], p.fh[1] + (sit ? y - 4 : 0), role === 'kole' ? s.coat : sleeve, hand);
    if (p.item) p.item(q);
    if (anim === 'err') { const d = [[9, -38], [11, -36], [10, -40]][f]; q.px(d[0], d[1], '#bfe6ff'); q.px(d[0], d[1] + 1, '#8fc7ef'); q.px(-9 - f, -37 + f, '#bfe6ff'); }
  }

  // A double lead: each figure is drawn at its x offset. dir -1 turns both round in place (they keep their sides).
  // 'work' and 'chat' face them towards each other (the whole sprite is flipped for facing -1 instead).
  function drawPair(q, role, anim, f, dir) {
    for (const [fig, ox] of ROLES[role].pair) {
      const her = fig === 'sek-secretary', mirror = anim === 'chat' ? !her : anim === 'work' ? false : dir < 0;
      let a = anim, g = f;
      if (her) { if (anim === 'blink') a = 'idle'; if (anim === 'idle' || anim === 'sleep' || anim === 'chat') g = 1 - f; if (anim === 'walk') g = (f + 2) % 4; }
      else if (anim === 'stretch') a = 'tie';
      q.c.save(); q.c.translate(mirror ? ox + 1 : ox, 0); if (mirror) q.c.scale(-1, 1); drawLead(q, fig, a, g); q.c.restore();
    }
    // Flustered: letters fly up between them.
    if (anim === 'err') for (const [x, y] of [[[-17, -38], [16, -42]], [[-19, -42], [18, -39]], [[-16, -44], [19, -37]]][f]) envelope(q, x, y);
  }

  // Timeline for each state. Returns the animation frame and body motion for time t.
  function frameFor(role, state, t, opts) {
    const s = ROLES[role], seed = role.length * 1.37;
    if (opts.pose === 'walk') return { anim: 'walk', f: mod(Math.floor(t * 8), 4) };
    if (opts.pose === 'talk' && state === 'working') return { anim: (t + seed) % 3.4 < .14 ? 'blink' : 'idle', f: mod(Math.floor(t * 1.6), 2) };
    if (state === 'working') return { anim: 'work', f: mod(Math.floor(t * s.work.fps), s.work.n) };
    if (state === 'waiting') return { anim: 'wait', f: mod(Math.floor(t * 4), 2) };
    if (state === 'error') return { anim: 'err', f: mod(Math.floor(t * 10), 3), dx: [0, 1, -1][mod(Math.floor(t * 14), 3)] };
    if (state === 'off') return { anim: 'sleep', f: mod(Math.floor(t * 1.1), 2) };
    const c = (t + seed) % 9;
    if (c > 7.4 && c < 8.4) return { anim: 'stretch', f: 0 };
    if (s.pair && c > 5 && c < 6.6) return { anim: 'chat', f: mod(Math.floor(t * 3), 2) };
    const blink = (t + seed) % 3.4 < .14;
    return { anim: blink ? 'blink' : 'idle', f: mod(Math.floor(t * 1.6), 2), flip: c > 5 && c < 6.6 };
  }

  function leadSprite(role, anim, f) { return P.sprite(`lead|${role}|${anim}|${f}`, 50, 64, 25, 60, q => drawLead(q, role, anim, f)); }
  function pairSprite(role, anim, f, dir) { return P.sprite(`lead|${role}|${anim}|${f}|${dir}`, 66, 64, 33, 60, q => drawPair(q, role, anim, f, dir)); }

  /* ---------- State indicators ---------- */
  const ICON = {
    q: ['.###.', '##.##', '...##', '..##.', '..#..', '.....', '..#..'],
    ex: ['##', '##', '##', '##', '##', '..', '##'],
    g0: ['..#.#..', '.#####.', '##...##', '.#...#.', '##...##', '.#####.', '..#.#..'],
    g1: ['#.....#', '.#####.', '.#...#.', '.#...#.', '.#...#.', '.#####.', '#.....#']
  };
  function glyph(k, rows, x, y, col) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') k.px(x + i, y + j, col); }); }
  function bubble(k, x, y, col, w = 15, h = 12) {
    const L = x - Math.floor(w / 2), dk = S(col, -.45);
    k.rect(L - 1, y, w + 2, h, C.ink); k.rect(L, y - 1, w, h + 2, C.ink); k.rect(x - 2, y + h + 1, 4, 1, C.ink); k.rect(x - 1, y + h + 2, 2, 1, C.ink);
    k.rect(L, y, w, h, col); k.rect(L, y, w, 1, S(col, .45)); k.rect(L, y + h - 1, w, 1, dk); k.rect(x - 1, y + h, 3, 1, col); k.px(x - 1, y + h + 1, dk);
    k.px(L + 1, y + 1, S(col, .7));
  }
  Characters_indicator = function (k, x, y, t, state) {
    if (state === 'off') {
      for (let i = 0; i < 3; i++) { const q = (t * .35 + i / 3) % 1, s = i === 2 ? 1 : 1; const zx = x + 4 + q * 10 + Math.sin(q * 6) * 2, zy = y + 10 - q * 18; k.alpha(Math.min(1, (1 - q) * 1.6), () => k.textBold('Z', zx, zy, '#c8d4ff', C.slate0, s)); }
      return;
    }
    const col = C[state] || C.idle, bob = state === 'waiting' ? Math.round(Math.abs(Math.sin(t * 5)) * -3) : Math.round(Math.sin(t * 2) * 1), sx = state === 'error' ? [0, 1, 0, -1][mod(Math.floor(t * 16), 4)] : 0;
    const X = x + sx, Y = y + bob;
    bubble(k, X, Y, col);
    if (state === 'working') {
      glyph(k, mod(Math.floor(t * 6), 2) ? ICON.g1 : ICON.g0, X - 3, Y + 2, C.white); k.px(X, Y + 5, S(col, -.35));
      const w = mod(Math.floor(t * 12), 12); k.rect(X - 6, Y + 10, Math.min(12, w + 1), 1, '#dcffd0');
    } else if (state === 'idle') {
      const hop = mod(Math.floor(t * 3), 3); for (let i = 0; i < 3; i++) k.rect(X - 5 + i * 4, Y + 6 - (i === hop ? 1 : 0), 2, 2, i === hop ? C.white : '#e6eeff');
    } else if (state === 'waiting') glyph(k, ICON.q, X - 2, Y + 2, C.ink);
    else if (state === 'error') glyph(k, ICON.ex, X - 1, Y + 2, C.white);
  };

  // rx/ry: ring size (a double lead gets a wider one).
  function stateRing(k, x, y, t, state, rx = 12, ry = 4) {
    if (state === 'off') return;
    const col = C[state] || C.idle;
    if (state === 'waiting' || state === 'error') {
      const sp = state === 'error' ? 1.6 : 1, q = (t * sp) % 1;
      k.alpha(1 - q, () => k.ring(x, y, rx + q * 10, ry + q * 4, col));
      k.alpha(.35, () => k.ellipse(x, y, rx, ry, col));
      k.ring(x, y, rx, ry, col);
    } else if (state === 'working') {
      k.alpha(.25, () => k.ellipse(x, y, rx, ry, col));
      const n = Math.round(40 * rx / 12), h = mod(Math.floor(t * 14), n);
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = (i - h + n) % n; if (d > 8 && d % 5) continue; k.px(x + Math.cos(a) * rx, y + Math.sin(a) * ry, d <= 8 ? C.white : col); }
    } else k.alpha(.55, () => k.ring(x, y, rx, ry, col));
  }

  /* ---------- Public: draw a lead ---------- */
  function lead(k, role, x, y, t, state = 'idle', opts = {}) {
    if (!ROLES[role]) return;
    const fr = frameFor(role, state, t, opts), pair = ROLES[role].pair;
    if (pair) {
      // One ring, one shadow per figure, one sprite for both.
      const joint = fr.anim === 'work' || fr.anim === 'chat', left = opts.facing === -1;
      stateRing(k, x, y + 1, t, state, 24, 5);
      for (const [, ox] of pair) k.ellipse(x + ox + 1, y, 8, 2, C.shadow);
      k.blit(pairSprite(role, fr.anim, fr.f, !joint && left ? -1 : 1), x + (fr.dx || 0), y, joint && left);
    } else {
      const flip = (opts.facing === -1) !== !!fr.flip;
      stateRing(k, x, y + 1, t, state);
      k.ellipse(x + 1, y, 9, 2, C.shadow);
      const s = leadSprite(role, fr.anim, fr.f);
      k.blit(s, x + (fr.dx || 0), y, flip);
    }
    if (opts.indicator !== false) Characters_indicator(k, x, y - (role === 'bayes' ? 64 : 58), t, state);
  }

  /* ---------- Small crew and citizens ---------- */
  const LOOKS = [
    { shirt: '#b8683a', pants: '#4a3a2c', skin: C.skin2, hair: '#4a3226' }, { shirt: '#5a8a5a', pants: '#3a3a44', skin: C.skin1, hair: '#2a1c16' },
    { shirt: '#6a7ab0', pants: '#4a3a2c', skin: C.skin3, hair: '#8a5a2a' }, { shirt: '#c8a04a', pants: '#3a4a3a', skin: C.skin2, hair: '#1e1a18' },
    { shirt: '#a85a6a', pants: '#40404a', skin: C.skin1, hair: '#c4652e' }, { shirt: '#8a8a7a', pants: '#3a3228', skin: C.skin3, hair: '#5a4a3a' }
  ];
  const HATS = {
    none: () => {}, cap: (q, c) => { q.rect(-3, -21, 7, 2, c || '#6a7a4a'); q.rect(1, -19, 4, 1, S(c || '#6a7a4a', -.3)); },
    straw: q => { q.rect(-5, -19, 11, 1, C.gold2); q.rect(-3, -22, 7, 3, C.gold3); q.rect(-3, -20, 7, 1, C.red2); },
    helmet: (q, c) => { const h = c || C.gold2; q.rect(-4, -22, 8, 3, h); q.rect(-3, -23, 6, 1, S(h, .3)); q.rect(-4, -19, 9, 1, S(h, -.3)); q.rect(3, -21, 2, 2, C.gold4); },
    hood: q => { q.rect(-4, -22, 8, 4, '#6a4a3a'); q.rect(-4, -18, 2, 4, '#6a4a3a'); },
    bandana: (q, c) => { q.rect(-3, -21, 7, 2, c || C.red2); q.px(-4, -19, c || C.red2); },
    scarf: (q, c) => { q.rect(-3, -21, 7, 2, c || '#c3a2c0'); q.rect(-4, -19, 2, 4, c || '#c3a2c0'); }
  };
  const CARRY = {
    wood: q => { q.rect(-6, -26, 13, 3, C.wood2); q.rect(-6, -26, 13, 1, C.wood4); q.px(-6, -25, C.wood5); q.px(6, -25, C.wood5); q.rect(-5, -29, 11, 3, C.wood3); q.rect(-5, -29, 11, 1, C.wood4); },
    ore: q => { q.rect(-5, -27, 10, 5, C.wood2); q.rect(-5, -27, 10, 1, C.wood4); q.rect(-4, -29, 3, 2, C.stone3); q.rect(0, -30, 3, 3, '#c98a4a'); q.px(3, -28, C.teal4); },
    food: q => { q.rect(-5, -26, 10, 4, C.wood3); q.rect(-5, -26, 10, 1, C.wood4); q.circle(-2, -28, 2, C.red2); q.circle(2, -28, 2, '#f09a2a'); q.px(0, -30, C.leaf3); },
    mail: q => { q.rect(-4, -27, 8, 6, C.paper); q.line(-4, -27, 0, -24, C.paper2); q.line(3, -27, 0, -24, C.paper2); q.px(0, -24, C.red2); },
    paper: q => { q.rect(-5, -26, 10, 4, C.paper); q.rect(-5, -24, 10, 1, C.paper2); q.rect(-4, -28, 8, 2, C.white); },
    box: q => { q.rect(-5, -28, 10, 7, C.wood3); q.rect(-5, -28, 10, 1, C.wood5); q.rect(-1, -28, 2, 7, C.wood1); },
    water: q => { q.rect(-3, -27, 6, 6, C.stone2); q.rect(-2, -27, 4, 1, C.water4); }
  };
  const TOOLS = {
    axe: (q, a, hx, hy) => { const x = hx + Math.cos(a) * 8, y = hy + Math.sin(a) * 8; q.line(hx, hy, x, y, C.wood3, 1); q.rect(x - 1, y - 2, 3, 4, C.stone3); q.px(x + 1, y - 2, C.white); },
    pick: (q, a, hx, hy) => { const x = hx + Math.cos(a) * 8, y = hy + Math.sin(a) * 8; q.line(hx, hy, x, y, C.wood3, 1); q.line(x - 3, y - 1, x + 3, y + 1, C.stone2, 1); q.px(x + 3, y + 1, C.white); },
    hoe: (q, a, hx, hy) => { const x = hx + Math.cos(a) * 9, y = hy + Math.sin(a) * 9; q.line(hx, hy, x, y, C.wood3, 1); q.rect(x, y, 3, 2, C.stone2); },
    hammer: (q, a, hx, hy) => { const x = hx + Math.cos(a) * 6, y = hy + Math.sin(a) * 6; q.line(hx, hy, x, y, C.wood3, 1); q.rect(x - 1, y - 1, 3, 3, C.stone2); },
    saw: (q, a, hx, hy) => { q.rect(hx, hy - 1, 8, 2, C.stone3); q.rect(hx, hy + 1, 8, 1, C.stone1); q.rect(hx - 2, hy - 1, 2, 3, C.wood2); },
    watering: (q, a, hx, hy) => { q.rect(hx, hy - 2, 5, 4, '#6a8aa0'); q.line(hx + 5, hy - 1, hx + 8, hy - 3, '#6a8aa0'); },
    broom: (q, a, hx, hy) => { q.line(hx, hy - 6, hx + 2, hy + 6, C.wood3); q.rect(hx, hy + 5, 5, 3, C.gold1); },
    pen: (q, a, hx, hy) => { q.px(hx + 1, hy - 1, C.ink); q.px(hx + 2, hy - 2, C.gold2); }
  };
  function drawCrew(q, look, hat, hatCol, anim, f, carry, tool) {
    const L = LOOKS[look % LOOKS.length], sd = S(L.shirt, -.25), pd = S(L.pants, -.25);
    const walk = anim === 'walk' || anim === 'carry', st = walk ? [1, 0, -1, 0][f] : 0, bob = walk && f % 2 ? -1 : 0, sit = anim === 'sit' || anim === 'sleep';
    if (sit) { q.rect(-4, -4, 7, 2, C.wood3); q.rect(-3, -2, 1, 2, C.wood1); q.rect(1, -2, 1, 2, C.wood1); q.rect(-2, -6, 6, 2, L.pants); q.rect(2, -5, 2, 4, L.pants); q.rect(2, -1, 3, 1, C.wood0); }
    else { q.rect(-3 - st, -5, 2, 4 + (walk && f === 3 ? -1 : 0), pd); q.rect(-3 - st, -1 - (walk && f === 3 ? 1 : 0), 3, 1, C.wood0); q.rect(1 + st, -5, 2, 4 + (walk && f === 1 ? -1 : 0), L.pants); q.rect(1 + st, -1 - (walk && f === 1 ? 1 : 0), 4, 1, C.wood0); }
    const y = bob + (sit ? 3 : 0);
    q.rect(-3, -12 + y, 7, 7, L.shirt); q.rect(-3, -12 + y, 1, 7, S(L.shirt, .2)); q.rect(3, -12 + y, 1, 7, sd); q.rect(-3, -6 + y, 7, 1, sd);
    q.rect(-3, -19 + y, 7, 7, L.skin); q.rect(-2, -20 + y, 5, 1, L.skin); q.rect(-3, -20 + y, 3, 4, L.hair); q.rect(-3, -20 + y, 7, 2, L.hair);
    if (anim === 'sleep') q.rect(1, -15 + y, 2, 1, C.ink); else { q.px(1, -16 + y, C.ink); q.px(3, -16 + y, C.ink); }
    q.px(3, -14 + y, S(L.skin, -.2));
    (HATS[hat] || HATS.none)(q, hatCol);
    // Arms
    let fh = [5, -8 + y], bh = [-4, -8 + y], a = 0;
    if (walk) { fh = [4 - st, -8 + y]; bh = [-4 + st, -8 + y]; }
    if (carry) { fh = [4, -21 + y]; bh = [-4, -21 + y]; }
    if (anim === 'work') { const sw = [[-1, -20], [2, -21], [5, -14], [5, -9]][f]; fh = [sw[0], sw[1] + y]; bh = [sw[0] - 2, sw[1] + 1 + y]; a = [-2.4, -1.6, -0.3, 0.6][f]; }
    if (anim === 'cheer') { fh = [4, -21 - f + y]; bh = [-4, -21 - (1 - f) + y]; }
    q.line(-3, -11 + y, bh[0], bh[1], sd, 2); q.line(3, -11 + y, fh[0], fh[1], L.shirt, 2); q.rect(fh[0], fh[1], 2, 2, L.skin); q.rect(bh[0] - 1, bh[1], 2, 2, S(L.skin, -.15));
    if (carry && CARRY[carry]) CARRY[carry](q);
    if (tool && TOOLS[tool] && !carry) TOOLS[tool](q, anim === 'work' ? a : -1.3, fh[0] + 1, fh[1]);
  }
  function crewSprite(look, hat, hatCol, anim, f, carry, tool) {
    return P.sprite(`crew|${look}|${hat}|${hatCol}|${anim}|${f}|${carry}|${tool}`, 28, 34, 14, 32, q => drawCrew(q, look, hat, hatCol, anim, f, carry, tool));
  }
  // opts: { look, hat, hatColor, state, anim: 'walk'|'work'|'idle'|'sit'|'sleep'|'cheer', carry, tool, facing, speed, phase }
  function crew(k, x, y, t, o = {}) {
    const state = o.state || 'working', ph = o.phase || 0; let anim = o.anim || 'idle';
    if (state === 'off') anim = 'sleep'; else if (state !== 'working' && (anim === 'work' || anim === 'walk')) anim = 'idle';
    const n = anim === 'walk' ? 4 : anim === 'work' ? 4 : 2, fps = anim === 'walk' ? 8 : anim === 'work' ? (o.speed || 6) : 1.5;
    const f = mod(Math.floor(t * fps + ph * 7), n), a = anim === 'idle' ? 'idle' : anim;
    k.ellipse(x + 1, y, 5, 1.5, C.shadow);
    const s = crewSprite(o.look || 0, o.hat || 'none', o.hatColor || '', a === 'idle' ? 'stand' : a, a === 'idle' ? 0 : f, o.carry || '', o.tool || '');
    k.blit(s, x + (state === 'error' ? [0, 1, 0, -1][mod(Math.floor(t * 12 + ph * 3), 4)] : 0), y + (a === 'idle' && mod(Math.floor(t * 1.5 + ph * 3), 2) ? 0 : 0), o.facing === -1);
    if (state === 'off' && o.z !== false) { const q = (t * .4 + ph) % 1; k.alpha(1 - q, () => k.text('z', x + 3 + q * 5, y - 22 - q * 10, '#c8d4ff')); }
    if (state === 'error' && o.mark !== false && mod(Math.floor(t * 3 + ph), 2)) { k.rect(x - 1, y - 31, 3, 6, C.ink); k.rect(x, y - 30, 1, 3, C.error); k.px(x, y - 26, C.error); }
    if (state === 'waiting' && o.mark !== false) { k.rect(x - 2, y - 31, 5, 7, C.ink); k.rect(x - 1, y - 30, 3, 5, C.waiting); k.px(x, y - 29, C.ink); k.px(x, y - 27, C.ink); }
  }

  /* ---------- Portraits for UI cards ---------- */
  function portrait(canvas, role, state = 'working', t = 1.2) {
    const c = canvas.getContext('2d'), k = P.kit(c), W = canvas.width, H = canvas.height, sc = Math.max(1, Math.floor(Math.min(W / 50, H / 72)));
    c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
    c.save(); c.translate(Math.round(W / 2), Math.round(H - 6 * sc)); c.scale(sc, sc);
    k.ellipse(0, 1, ROLES[role]?.pair ? 26 : 14, 4, '#00000022'); lead(k, role, 0, 0, t, state, { indicator: true }); c.restore();
  }

  window.AgentCharacters = { profiles: ROLES, lead, crew, indicator: (...a) => Characters_indicator(...a), portrait, roles: Object.keys(ROLES), frameFor };
  var Characters_indicator;
})();
