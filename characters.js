/* Agent characters: eight lead sprites with role-specific work cycles, plus small crew and citizen sprites.
   All frames are drawn once into outlined sprite canvases and blitted. Feet sit at (x, y). */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const mod = (a, n) => ((a % n) + n) % n; // safe for negative time

  const ROLES = {
    // hand: glove colour (defaults to the skin).
    sekreter: { title: 'The butler', description: 'An Alfred-like butler with silver hair and a grey moustache, in a black tailcoat, grey waistcoat with a watch chain, bow tie and white gloves. He brings every letter in on a silver salver and stamps it at his desk.', skin: C.skin3, hair: '#c4c4be', coat: '#24242e', trim: '#f4f2ec', pants: '#2a2a34', boots: '#0e0e12', hand: '#f4f2ec', work: { n: 8, fps: 8 } },
    girard: { title: 'The market ambassador', description: 'A broad merchant in a burgundy brocade coat and tasselled fez, flipping gold coins over a leather ledger.', skin: C.skin1, hair: '#2a1c16', coat: '#8c2f3a', trim: C.gold2, pants: '#3a2a24', boots: C.wood0, wide: true, work: { n: 10, fps: 9 } },
    'text-writer': { title: 'The ink scholar', description: 'A silver-bearded scholar in a long indigo robe, writing across an unrolled parchment with a sweeping quill.', skin: C.skin3, hair: '#dedad0', coat: '#5c5a8a', trim: '#e0cc92', pants: '#3e3c60', boots: C.wood0, robe: true, work: { n: 8, fps: 7 } },
    gazeteci: { title: 'The roving editor', description: 'A newsboy-capped reporter in a mustard trench coat, scribbling notes and snapping photos with a flash camera.', skin: C.skin2, hair: '#6a4428', coat: '#c29a48', trim: '#f2ead8', pants: '#46463a', boots: C.wood0, work: { n: 12, fps: 8 } },
    bayes: { title: 'The star observer', description: 'A bespectacled astronomer in a star-flecked midnight cloak and pointed hat, sweeping the sky with a brass telescope.', skin: C.skin3, hair: '#f0ece0', coat: '#2e3870', trim: C.gold2, pants: '#1c2244', boots: C.wood0, robe: true, work: { n: 8, fps: 5 } },
    kandinsky: { title: 'The colour alchemist', description: 'A purple-bereted painter in a striped smock and red scarf, throwing colour through the air with brush and palette.', skin: C.skin2, hair: '#3a2418', coat: '#ece6d8', trim: '#5a74b8', pants: '#40344a', boots: C.wood0, work: { n: 8, fps: 8 } },
    kole: { title: 'The dark overlord', description: 'A towering warlord of the black forge in spiked black plate and a horned helm with glowing ember eye-slits, a lidless eye on his breastplate and a tattered blood-red cape. He slams a burning great mace on the anvil in showers of fire while his orc and goblin crews toil.', skin: '#2e2c36', hair: '#0e0d12', coat: '#2e2c36', trim: '#d8481a', pants: '#1c1b22', boots: '#0e0d12', wide: true, work: { n: 8, fps: 9 } },
    'scum-master': { title: 'The head chef', description: 'A stern, moustached head chef who runs a strict Michelin-star brigade in a white double-breasted jacket, tall pleated toque and red neckerchief, tasting every fusion sauce from his spoon and calling each ticket down the line.', skin: C.skin2, hair: '#4a3020', coat: '#f2eee6', trim: C.red2, pants: '#2c2c34', boots: '#1c1c20', work: { n: 8, fps: 6 } }
  };

  /* ---------- Body parts (facing right; feet at 0,0) ---------- */
  const limb = (q, x0, y0, x1, y1, col, hand) => { q.line(x0, y0, x1, y1, col, 3); q.line(x0 + 1, y0, x1 + 1, y1, S(col, -.18)); q.rect(x1 - 1, y1 - 1, 3, 3, hand); q.px(x1 - 1, y1 - 1, S(hand, .25)); };

  function legs(q, s, mode, f) {
    const pd = S(s.pants, -.25), b = s.boots;
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
  function torso(q, s, y, role) {
    const w = s.wide ? 16 : 14, x = -w / 2, lt = S(s.coat, .22), dk = S(s.coat, -.22), dd = S(s.coat, -.38);
    const h = s.robe ? 19 : role === 'gazeteci' ? 15 : 12;
    q.rect(x, -20 + y, w, h, s.coat); q.rect(x, -20 + y, 1, h, lt); q.rect(x + 1, -20 + y, 3, 1, lt); q.rect(x + w - 2, -20 + y, 2, h, dk); q.rect(x, -21 + h + y, w, 1, dd);
    if (s.robe) { q.rect(x - 1, -8 + y, w + 2, 7, s.coat); q.rect(x - 1, -8 + y, 1, 7, lt); q.rect(x + w - 1, -8 + y, 2, 7, dk); q.rect(x - 1, -2 + y, w + 2, 1, s.trim); q.rect(0, -19 + y, 1, 17, dk); }
    if (s.wide) { q.rect(x - 1, -15 + y, w + 2, 6, s.coat); q.rect(x - 1, -15 + y, 1, 6, lt); q.rect(x + w - 1, -15 + y, 2, 6, dk); }
    const Y = y;
    switch (role) {
      case 'sekreter': {
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
    if (role === 'sekreter') { const dk = S(s.coat, -.3); q.rect(-9, -13 + y, 3, sit ? 6 : 10, s.coat); q.rect(-9, -13 + y, 1, sit ? 6 : 10, S(s.coat, .2)); q.px(-7, (sit ? -8 : -4) + y, dk); q.px(-8, (sit ? -8 : -4) + y, dk); }
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
    const lip = '#8a3a30';
    if (mouth === 'smile') { q.px(2, hy + 9, lip); q.rect(3, hy + 10, 2, 1, lip); q.px(5, hy + 9, lip); }
    else if (mouth === 'flat') { q.rect(3, hy + 10, 2, 1, lip); }
    else if (mouth === 'o') { q.rect(3, hy + 9, 2, 2, '#5a1e1a'); }
    else if (mouth === 'frown') { q.px(3, hy + 10, lip); q.px(4, hy + 10, lip); q.px(2, hy + 11, lip); }
    else if (mouth === 'grin') { q.rect(2, hy + 9, 4, 2, C.white); q.rect(2, hy + 10, 4, 1, lip); }
    const brow = (col, h = 1) => { q.rect(ex - 1, hy + 4, 2, h, col); q.rect(ex + 3, hy + 4, 2, h, col); };
    switch (role) {
      case 'sekreter': {
        // Silver hair combed straight back from a high forehead, grey brows and a trim grey moustache.
        const hl = S(hair, .35), st = '#e2e2dc';
        q.rect(-4, hy - 2, 6, 1, hair); q.rect(-6, hy - 1, 10, 1, hair); q.rect(-6, hy, 6, 1, hair); q.rect(-6, hy + 1, 4, 8, hair); q.rect(-2, hy + 2, 1, 3, hair);
        q.rect(-3, hy - 2, 4, 1, hl); q.px(-4, hy - 1, hd); q.px(-1, hy - 1, hd); q.px(2, hy - 1, hd); q.px(-5, hy + 3, hd); q.px(-5, hy + 6, hd); q.px(-6, hy + 8, S(hair, -.12)); q.px(1, hy + 1, S(sk, -.08));
        brow(S(hair, -.3));
        q.rect(2, hy + 8, 5, 1, st); q.px(2, hy + 9, st); q.px(6, hy + 9, st); q.px(4, hy + 8, S(hair, -.1));
        q.px(0, hy + 9, skd); q.px(1, hy + 10, skd);
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
  // The overlord's burning great mace: iron haft, spiked head with an ember core and a lick of flame.
  const mace = (q, x, y, ang, f = 0) => {
    const hx = x + Math.cos(ang) * 11, hy = y + Math.sin(ang) * 11;
    q.line(x - Math.cos(ang) * 2, y - Math.sin(ang) * 2, hx, hy, '#46434f', 2); q.px(x - Math.cos(ang) * 3, y - Math.sin(ang) * 3, '#d8481a');
    for (let i = 0; i < 6; i++) { const a = ang + i * Math.PI / 3; q.line(hx, hy, hx + Math.cos(a) * 5, hy + Math.sin(a) * 5, '#8a8698'); }
    q.circle(hx, hy, 3, '#2e2c36'); q.px(hx - 1, hy - 1, '#6a6676'); q.px(hx, hy, '#ff8a2a'); q.px(hx + 1, hy, '#d8481a');
    const fl = f % 2; q.px(hx, hy - 4 - fl, '#ff8a2a'); q.px(hx + 1, hy - 5 + fl, '#ffd27a'); q.px(hx - 1, hy - 4, '#d8481a');
  };
  const spoon = (q, x0, y0, x1, y1) => { q.line(x0, y0, x1, y1, '#c8ccd2'); q.rect(x1 - 1, y1 - 1, 2, 2, '#e4e8ec'); q.px(x1, y1, '#9aa2ae'); };
  const ladle = (q, x, y) => { q.line(x, y - 8, x, y + 3, '#c8ccd2'); q.px(x - 1, y - 8, '#9aa2ae'); q.rect(x - 2, y + 3, 5, 3, '#aab2bc'); q.rect(x - 1, y + 3, 3, 1, '#e4e8ec'); q.px(x + 2, y + 5, '#7a828e'); };
  const ticket = (q, x, y) => { q.rect(x, y, 6, 8, C.paper); q.rect(x, y, 6, 1, C.white); q.rect(x + 1, y + 2, 4, 1, '#7a7264'); q.rect(x + 1, y + 4, 3, 1, '#7a7264'); q.px(x + 4, y + 6, C.red2); };
  // The butler's silver salver (held flat, level with the glove at x, y), with an optional sealed letter on it.
  const salver = (q, x, y, letter) => { q.rect(x - 4, y - 1, 10, 1, '#dde2e8'); q.rect(x - 3, y, 8, 1, '#9aa2ae'); q.px(x - 3, y - 1, C.white); q.px(x + 5, y - 1, '#aab2bc'); if (letter) { q.rect(x - 2, y - 4, 7, 3, C.paper); q.rect(x - 2, y - 4, 7, 1, C.white); q.px(x + 1, y - 3, C.red2); q.px(x + 2, y - 3, C.red1); } };

  /* ---------- Poses ---------- */
  // Hands: bh = back hand, fh = front hand (relative to feet). Items draw after arms.
  function pose(role, anim, f) {
    const p = { dy: 0, legs: 'stand', bh: [-7, -11], fh: [7, -11], eyes: 'open', mouth: 'smile', look: 0, item: null, backItem: null };
    if (anim === 'idle' || anim === 'blink') { p.dy = f ? 1 : 0; if (anim === 'blink') p.eyes = 'closed'; }
    if (anim === 'stretch') { p.bh = [-6, -33]; p.fh = [6, -33]; p.eyes = 'happy'; p.mouth = 'o'; p.dy = -1; }
    if (anim === 'walk') { p.legs = 'walk'; p.dy = f % 2 ? -1 : 0; const sw = [2, 0, -2, 0][f]; p.bh = [-7 + sw, -11]; p.fh = [7 - sw, -11]; }
    if (anim === 'wait') { p.legs = 'tap'; p.bh = [-8, -13]; p.fh = [8, -22 + f]; p.mouth = 'flat'; p.look = 1; }
    if (anim === 'err') { p.bh = [-9, -29 - (f === 2 ? 1 : 0)]; p.fh = [9, -29 + (f === 1 ? 1 : 0)]; p.eyes = 'wide'; p.mouth = 'o'; p.legs = 'wide'; }
    if (anim === 'sleep') { p.legs = 'sit'; p.dy = 4 + (f ? 1 : 0); p.bh = [-3, -8]; p.fh = [4, -8]; p.eyes = 'closed'; p.mouth = 'flat'; }
    // Resting props, so each lead is recognisable when not working.
    const rest = { sekreter: q => salver(q, p.fh[0], p.fh[1] - 1, true), girard: q => coin(q, p.fh[0], p.fh[1] - 2, 0), 'text-writer': q => quill(q, p.fh[0], p.fh[1]), gazeteci: q => notepad(q, p.fh[0] + 1, p.fh[1] - 1), bayes: q => { q.rect(p.fh[0], p.fh[1] - 12, 2, 13, C.gold1); q.px(p.fh[0], p.fh[1] - 12, C.gold4); q.rect(p.fh[0] - 1, p.fh[1] - 13, 4, 2, C.gold2); }, kandinsky: q => brush(q, p.fh[0], p.fh[1], 2, -6, '#9a5fac'), kole: q => mace(q, p.fh[0], p.fh[1], anim === 'wait' ? -1.2 : 1.25, f), 'scum-master': q => ladle(q, p.fh[0], p.fh[1]) };
    if (anim !== 'work' && anim !== 'err' && anim !== 'stretch') p.item = rest[role];
    if (role === 'girard' && anim !== 'stretch' && anim !== 'err') p.backItem = q => ledger(q, p.bh[0] - 1, p.bh[1] - 2);
    if (role === 'kandinsky' && anim !== 'stretch' && anim !== 'err') p.backItem = q => palette(q, p.bh[0] - 3, p.bh[1] - 1);
    // The butler carries his salver level at chest height (and presents it while waiting), straightens his bow tie
    // instead of stretching, and sends letters flying when flustered.
    if (role === 'sekreter') {
      if (anim === 'stretch') { p.bh = [-7, -11]; p.fh = [3, -19]; p.eyes = 'closed'; p.mouth = 'smile'; p.dy = 0; }
      else if (anim === 'idle' || anim === 'blink' || anim === 'walk') p.fh = [8, -15];
      if (anim === 'err') p.item = q => { for (const [x, y] of [[[-13, -38], [12, -42]], [[-15, -42], [14, -39]], [[-12, -44], [15, -37]]][f]) envelope(q, x, y); };
    }
    if (anim !== 'work') return p;
    // Role-specific work cycles.
    switch (role) {
      case 'sekreter': {
        // Stamps the letter on the desk (0-4), tosses it to the out-tray (5-6), and takes the next one from the salver on the side table behind him (5-7).
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
        // Slams the burning mace down (frame 4): a fireball bursts on the anvil and embers fly.
        p.item = q => {
          mace(q, hand[0], hand[1], ang, f);
          if (f === 4) { q.poly([[13, -9], [15, -17], [17, -13], [19, -21], [21, -14], [23, -18], [24, -9]], '#d8481a'); q.poly([[15, -9], [17, -14], [19, -11], [21, -15], [22, -9]], '#ff8a2a'); q.rect(17, -11, 4, 2, '#ffd27a'); for (const [sx, sy] of [[12, -19], [24, -22], [14, -24], [22, -26]]) q.px(sx, sy, C.gold4); }
          if (f === 5) for (const [sx, sy] of [[13, -20], [23, -23], [16, -26], [21, -28], [18, -17], [24, -15]]) q.px(sx, sy, sy < -24 ? '#d8481a' : '#ffd27a');
          if (f === 6) for (const [sx, sy] of [[14, -24], [22, -27], [17, -30]]) q.px(sx, sy, '#ff8a2a');
        };
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

  // Köle's lead: a dark overlord (black spiked plate, horned helm with ember eye-slits, lidless-eye breastplate, red cape).
  function drawOverlord(q, anim, f, p) {
    const K = ['#0e0d12', '#1c1b22', '#2e2c36', '#46434f', '#6a6676'], E = ['#7a1a08', '#d8481a', '#ff8a2a', '#ffd27a'], CP = ['#2a0c10', '#4a1418', '#6e1e22'];
    const y = p.dy, sit = anim === 'sleep', sw = anim === 'walk' ? f % 2 : 0, ty = sit ? y - 4 : 0;
    // Tattered cape behind.
    if (sit) { q.poly([[-8, -30 + y], [-2, -30 + y], [-3, -6], [-12, -2], [-14, -9]], CP[1]); q.line(-8, -27 + y, -11, -4, CP[0]); }
    else {
      q.poly([[-8, -31 + y], [-2, -31 + y], [-3, -4], [-5, -1], [-8, -2 - sw], [-11, -1], [-14 - sw, -2], [-15 - sw, -10], [-12, -22 + y]], CP[1]);
      q.line(-9, -28 + y, -12 - sw, -3, CP[0]); q.line(-6, -28 + y, -7, -3, CP[0]); q.line(-12, -22 + y, -14 - sw, -9, CP[2]);
    }
    limb(q, -7, -27 + y, p.bh[0], p.bh[1] + ty, K[1], K[0]);
    if (p.backItem) p.backItem(q);
    // Armoured legs with spiked knee cops and pointed sabatons (or seated on a black stone block).
    const mode = p.legs;
    if (mode === 'sit') {
      q.rect(-8, -6, 12, 3, '#3a3640'); q.rect(-8, -6, 12, 1, '#5a5662'); q.rect(-7, -3, 2, 3, '#2a2830'); q.rect(1, -3, 2, 3, '#2a2830');
      q.rect(-4, -10, 11, 4, K[2]); q.rect(-4, -10, 11, 1, K[3]); q.rect(4, -7, 5, 6, K[2]); q.rect(8, -7, 1, 6, K[1]); q.rect(4, -2, 8, 2, K[1]); q.px(11, -2, K[3]); q.px(8, -11, K[4]);
    } else {
      let bx = 0, fx = 0, bl = 0, fl = 0, tap = 0;
      if (mode === 'walk') { const st = [2, 0, -2, 0][f]; bx = -st; fx = st; bl = f === 3 ? 1 : 0; fl = f === 1 ? 1 : 0; }
      if (mode === 'tap') tap = f ? 1 : 0; if (mode === 'wide') { bx = -2; fx = 2; }
      q.rect(-6 + bx, -13, 5, 11 - bl, K[1]); q.rect(-7 + bx, -2 - bl, 7, 2, K[0]);
      q.rect(1 + fx, -13, 5, 11 - fl, K[2]); q.rect(1 + fx, -13, 1, 11 - fl, K[3]); q.rect(1 + fx, -9, 5, 2, K[3]); q.px(6 + fx, -9, K[4]); q.px(7 + fx, -10, K[4]);
      q.rect(1 + fx, -2 - fl - tap, 8, 2, K[1]); q.px(9 + fx, -1 - fl - tap, K[2]); q.px(2 + fx, -2 - fl - tap, K[3]);
    }
    // Breastplate with the lidless eye, belt and spiked tassets.
    q.rect(-8, -30 + y, 16, 18, K[2]); q.rect(-8, -30 + y, 1, 18, K[3]); q.rect(6, -30 + y, 2, 18, K[1]); q.rect(-7, -30 + y, 4, 1, K[3]);
    q.rect(-7, -22 + y, 14, 1, K[1]); q.rect(-7, -19 + y, 14, 1, K[1]);
    q.rect(-2, -27 + y, 5, 3, E[1]); q.rect(-4, -26 + y, 9, 1, E[2]); q.rect(-1, -27 + y, 3, 3, E[2]); q.rect(0, -27 + y, 1, 3, K[0]); q.px(-2, -26 + y, E[3]); q.px(-5, -26 + y, E[0]); q.px(5, -26 + y, E[0]);
    q.rect(-8, -16 + y, 16, 2, K[0]); q.rect(-1, -16 + y, 3, 2, E[1]); q.px(0, -16 + y, E[3]);
    q.rect(-8, -14 + y, 16, 3, K[1]); q.rect(-8, -14 + y, 16, 1, K[3]); for (let x = -7; x < 8; x += 3) q.px(x, -11 + y, K[1]);
    // Back pauldron.
    q.rect(-12, -31 + y, 6, 5, K[1]); q.rect(-12, -31 + y, 6, 1, K[2]); q.line(-11, -32 + y, -12, -35 + y, K[3]); q.line(-8, -32 + y, -8, -36 + y, K[3]); q.px(-8, -36 + y, K[4]);
    // Horned, spiked helm: visor with ember eye-slits over a grim row of teeth.
    const hy = -43 + y, eyes = p.eyes;
    q.rect(-4, -33 + y, 9, 3, K[0]);
    q.path([[-5, hy + 4], [-8, hy + 2], [-9, hy - 1], [-8, hy - 3]], K[2], 2); q.px(-8, hy - 3, K[4]);
    for (const [x, h, l] of [[-4, 3, -1], [-1, 4, 0], [2, 4, 0], [4, 3, 1]]) { q.line(x, hy, x + l, hy - h, K[3]); q.px(x + l, hy - h, K[4]); }
    q.rect(-5, hy + 3, 11, 9, K[2]); q.rect(-4, hy + 1, 9, 2, K[2]); q.rect(-3, hy, 7, 1, K[2]); q.rect(-5, hy + 3, 1, 8, K[3]); q.rect(-4, hy + 1, 1, 2, K[3]); q.rect(-3, hy, 3, 1, K[4]); q.rect(5, hy + 3, 1, 8, K[1]); q.rect(-5, hy + 11, 11, 1, K[0]);
    q.rect(1, hy + 4, 6, 7, K[1]); q.rect(6, hy + 5, 1, 5, K[0]); q.rect(-3, hy + 3, 3, 1, K[1]);
    const eg = eyes === 'closed' ? E[0] : eyes === 'wide' ? E[3] : E[2];
    q.rect(2, hy + 5, 2, 1, eg); q.rect(5, hy + 5, 2, 1, eg);
    if (eyes === 'wide') { q.rect(2, hy + 6, 2, 1, E[2]); q.rect(5, hy + 6, 2, 1, E[2]); } else if (eyes !== 'closed') { q.px(3, hy + 5, E[3]); q.px(6, hy + 5, E[3]); }
    if (p.mouth === 'o') { q.rect(2, hy + 8, 5, 2, K[0]); q.rect(2, hy + 8, 5, 1, '#d8d0c0'); for (const x of [3, 5]) q.px(x, hy + 8, K[0]); }
    else { q.rect(2, hy + 8, 5, 1, '#d8d0c0'); q.px(3, hy + 8, K[0]); q.px(5, hy + 8, K[0]); if (p.mouth === 'grin') q.rect(2, hy + 9, 5, 1, '#b8b0a0'); }
    q.path([[6, hy + 4], [9, hy + 2], [10, hy - 1], [9, hy - 3]], K[3], 2); q.px(9, hy - 3, K[4]);
    // Front arm, then the front pauldron over its shoulder.
    limb(q, 6, -27 + y, p.fh[0], p.fh[1] + ty, K[2], K[1]);
    q.rect(3, -31 + y, 9, 6, K[2]); q.rect(3, -31 + y, 9, 1, K[3]); q.rect(3, -26 + y, 9, 1, K[0]); q.rect(3, -31 + y, 1, 5, K[3]);
    q.line(5, -32 + y, 4, -36 + y, K[3]); q.px(4, -36 + y, K[4]); q.line(8, -32 + y, 9, -37 + y, K[3]); q.px(9, -37 + y, K[4]); q.line(11, -31 + y, 13, -34 + y, K[3]);
    if (p.item) p.item(q);
    // Enraged: flames lick up round the helm.
    if (anim === 'err') for (const [x, h] of [[-6, 4], [-2, 6], [3, 5], [7, 4]]) { const g = (f + x) & 1; q.line(x, hy - 1, x + (g ? 1 : 0), hy - h - g, E[2]); q.px(x, hy - h - g - 1, E[3]); }
  }

  function drawLead(q, role, anim, f) {
    if (role === 'kole') return drawOverlord(q, anim, f, pose(role, anim, f));
    const s = ROLES[role], p = pose(role, anim, f), y = p.dy, sit = anim === 'sleep';
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
    const blink = (t + seed) % 3.4 < .14;
    return { anim: blink ? 'blink' : 'idle', f: mod(Math.floor(t * 1.6), 2), flip: c > 5 && c < 6.6 };
  }

  function leadSprite(role, anim, f) { return P.sprite(`lead|${role}|${anim}|${f}`, 50, 64, 25, 60, q => drawLead(q, role, anim, f)); }
  // On the map the leads are drawn 1.5× their art size. The art is drawn crisp at 3×, box-filtered down by 2 (so every
  // art pixel covers one full pixel and shares one with its neighbour), its alpha snapped, and outlined 1px like P.sprite.
  const BIG = 1.5, big = new Map();
  function bigLeadSprite(role, anim, f) {
    const key = `${role}|${anim}|${f}`; let s = big.get(key); if (s) return s;
    const w = 50, h = 64, W = Math.ceil(w * BIG) + 2, H = Math.ceil(h * BIG) + 2, X = Math.round(25 * BIG) + 1, Y = Math.round(60 * BIG) + 1;
    const hi = document.createElement('canvas'); hi.width = W * 2; hi.height = H * 2; const hc = hi.getContext('2d');
    hc.translate(X * 2, Y * 2); hc.scale(3, 3); drawLead(P.kit(hc), role, anim, f);
    const src = hc.getImageData(0, 0, W * 2, H * 2).data, lo = document.createElement('canvas'); lo.width = W; lo.height = H;
    const lc = lo.getContext('2d'), img = lc.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const i = ((y * 2 + dy) * W * 2 + x * 2 + dx) * 4; if (src[i + 3] < 128) continue; r += src[i]; g += src[i + 1]; b += src[i + 2]; n++; }
      if (n < 2) continue;
      const o = (y * W + x) * 4; d[o] = r / n; d[o + 1] = g / n; d[o + 2] = b / n; d[o + 3] = 255;
    }
    lc.putImageData(img, 0, 0);
    const out = document.createElement('canvas'); out.width = W; out.height = H; const oc = out.getContext('2d');
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) oc.drawImage(lo, dx, dy);
    oc.globalCompositeOperation = 'source-in'; oc.fillStyle = C.ink; oc.fillRect(0, 0, W, H);
    oc.globalCompositeOperation = 'source-over'; oc.drawImage(lo, 0, 0);
    s = { canvas: out, ox: X - 1, oy: Y - 1 }; big.set(key, s); return s;
  }

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

  // rx/ry: ring size (sc: the lead's drawing scale).
  function stateRing(k, x, y, t, state, sc = 1) {
    if (state === 'off') return;
    const col = C[state] || C.idle, rx = Math.round(12 * sc), ry = Math.round(4 * sc);
    if (state === 'waiting' || state === 'error') {
      const sp = state === 'error' ? 1.6 : 1, q = (t * sp) % 1;
      k.alpha(1 - q, () => k.ring(x, y, rx + q * 10 * sc, ry + q * 4 * sc, col));
      k.alpha(.35, () => k.ellipse(x, y, rx, ry, col));
      k.ring(x, y, rx, ry, col);
    } else if (state === 'working') {
      k.alpha(.25, () => k.ellipse(x, y, rx, ry, col));
      const n = Math.round(40 * rx / 12), h = mod(Math.floor(t * 14), n);
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = (i - h + n) % n; if (d > 8 && d % 5) continue; k.px(x + Math.cos(a) * rx, y + Math.sin(a) * ry, d <= 8 ? C.white : col); }
    } else k.alpha(.55, () => k.ring(x, y, rx, ry, col));
  }

  /* ---------- Public: draw a lead ---------- */
  // opts: { facing, pose: 'walk'|'talk', indicator, scale: 1 draws the art-size sprite (portraits) instead of the 1.5× map sprite }
  function lead(k, role, x, y, t, state = 'idle', opts = {}) {
    if (!ROLES[role]) return;
    const fr = frameFor(role, state, t, opts), flip = (opts.facing === -1) !== !!fr.flip, sc = opts.scale === 1 ? 1 : BIG;
    stateRing(k, x, y + 1, t, state, sc);
    k.ellipse(x + 1, y, Math.round(9 * sc), Math.round(2 * sc), C.shadow);
    k.blit(sc === 1 ? leadSprite(role, fr.anim, fr.f) : bigLeadSprite(role, fr.anim, fr.f), x + Math.round((fr.dx || 0) * sc), y, flip);
    // The bubble clears the tallest hats (the astronomer's and the chef's); the Z's of a dozing lead start just above his head.
    const top = sc === 1 ? ({ bayes: 64, kole: 62 }[role] || 58) : ({ bayes: 96, 'scum-master': 87, kole: 88 }[role] || 80) - (state === 'off' ? 8 : 0);
    if (opts.indicator !== false) Characters_indicator(k, x, y - top, t, state);
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
  // opts.kind draws a creature instead (see KINDS below): extra anims 'whip' (overseers), 'cower', 'chained'; opts.chains, opts.lash, opts.crack.
  function crew(k, x, y, t, o = {}) {
    if (o.kind && KINDS[o.kind]) return creature(k, x, y, t, o);
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

  /* ---------- Hellish creature crews (crew opts.kind): Mordor, Diablo, Dark Souls and Doom ----------
     Workers ~15-20 px (orc goblin hollow imp zombie), overseers ~28-31 px (uruk wraith demon hellknight cacodemon),
     a heavy cave troll ~36 px, and a small flying lostsoul. Cartoon only: they flinch and cower, nobody bleeds. */
  const IRON = { d: '#26262c', b: '#44444c', l: '#6e6e78', h: '#a0a0aa' };
  const FIRE = ['#7a1a08', '#d8481a', '#ff8a2a', '#ffd27a', '#fff4c8'];
  const TOXIC = ['#1e6a14', '#46c02a', '#9cff5a', '#eaffc0'];
  const BONE = { d: '#b8ae96', b: '#e8e0cc', h: '#fff8e8' };
  const KINDS = {
    orc: { L: 5, T: 7, W: 8, HH: 7, HW: 7, hunch: 1, A: 6, lw: 2, feet: 'boot', top: 20, legs: '#3e3228',
      looks: [{ skin: '#7d8c5e', cloth: '#5c4230', helm: 1 }, { skin: '#66744c', cloth: '#4a3a2c', hair: '#1e1a16' }, { skin: '#8a9268', cloth: '#6a5236', helm: 2 }, { skin: '#5e6e4a', cloth: '#3e3a34', hair: '#2a2420' }] },
    goblin: { L: 4, T: 5, W: 6, HH: 7, HW: 8, hunch: 1, A: 5, lw: 1, feet: 'bare', top: 16,
      looks: [{ skin: '#a9ab9d', cloth: '#6a5a44' }, { skin: '#98a28c', cloth: '#5a4636' }, { skin: '#b8b2a2', cloth: '#4e4e44' }] },
    hollow: { L: 6, T: 7, W: 6, HH: 6, HW: 6, hunch: 1, A: 6, lw: 1, feet: 'bare', top: 19,
      looks: [{ skin: '#8e7c64', cloth: '#6a645a' }, { skin: '#7e705e', cloth: '#5a5046', hair: '#c8c2b4' }, { skin: '#96846a', cloth: '#4e4a44', hood: 1 }] },
    imp: { L: 4, T: 5, W: 6, HH: 6, HW: 6, hunch: 0, A: 5, lw: 2, feet: 'hoof', top: 16,
      looks: [{ skin: '#c0392b' }, { skin: '#9a2430' }, { skin: '#d0562a' }] },
    zombie: { L: 6, T: 7, W: 7, HH: 7, HW: 7, hunch: 0, A: 6, lw: 2, feet: 'boot', top: 20, legs: '#5a4a36',
      looks: [{ skin: '#9aa088', cloth: '#4e6a3a' }, { skin: '#8e9a80', cloth: '#56703e', hair: '#2a2420' }, { skin: '#a4a690', cloth: '#4a6236', helm: 1 }] },
    uruk: { boss: 1, L: 8, T: 10, W: 12, HH: 8, HW: 8, hunch: 0, A: 9, lw: 3, feet: 'boot', top: 28, lash: 26, legs: '#23232a', arm: '#2a2a32', hand: '#1c1c22',
      looks: [{ skin: '#4a3c32', motif: 'hand', helm: 1 }, { skin: '#3e342c', motif: 'eye', hair: '#16120e' }, { skin: '#524236', motif: 'eye', helm: 1 }] },
    wraith: { boss: 1, L: 10, T: 10, W: 10, HH: 8, HW: 8, hunch: 1, A: 9, lw: 3, feet: 'robe', top: 31, lash: 26, arm: '#1c1a22', hand: '#7a7e88',
      looks: [{ skin: '#18161e' }, { skin: '#201c26' }] },
    demon: { boss: 1, L: 8, T: 10, W: 12, HH: 7, HW: 7, hunch: 0, A: 9, lw: 3, feet: 'hoof', top: 29, lash: 28,
      looks: [{ skin: '#a8261e' }, { skin: '#8e1e22' }] },
    hellknight: { boss: 1, L: 9, T: 11, W: 14, HH: 7, HW: 8, hunch: 1, A: 10, lw: 3, feet: 'hoof', top: 30, lash: 34, legs: '#6e5040',
      looks: [{ skin: '#c89478' }, { skin: '#c47a6e' }] },
    troll: { big: 1, L: 10, T: 15, W: 18, HH: 9, HW: 10, hunch: 3, A: 13, lw: 4, feet: 'bare', top: 36,
      looks: [{ skin: '#7c827a', cloth: '#5a4630' }, { skin: '#6e746a', cloth: '#4a3a2a' }] },
    cacodemon: { boss: 1, float: 1, top: 34, lash: 30, looks: [{}] },
    lostsoul: { float: 1, top: 24, looks: [{}] }
  };
  const BOX = { worker: [40, 42, 20, 38], boss: [54, 50, 27, 46], big: [66, 60, 33, 56], cacodemon: [44, 48, 22, 45], lostsoul: [30, 34, 15, 31] };
  const boxOf = kind => BOX[kind] || (KINDS[kind].big ? BOX.big : KINDS[kind].boss ? BOX.boss : BOX.worker);

  function cgeo(sp, anim, f) {
    const walk = anim === 'walk' || anim === 'carry' || anim === 'chained', sit = anim === 'sit' || anim === 'sleep', cw = anim === 'cower';
    const st = walk ? [1, 0, -1, 0][f] * (sp.L >= 8 ? 2 : 1) : 0;
    let dy = walk && f % 2 ? -1 : 0;
    if (sit) dy = sp.L - 2; else if (cw) dy = Math.max(2, sp.L >> 1) + f; else if (anim === 'idle' && f) dy = 1;
    const droop = anim === 'chained' || anim === 'sleep' || cw ? 1 : 0;
    const hyL = -sp.L + dy, tx = Math.round(sp.hunch / 2), x0 = -(sp.W >> 1) + tx, yT = hyL - sp.T;
    const hx = -(sp.HW >> 1) + sp.hunch + droop, hy = yT + 1 + (sp.hunch >= 2 ? 3 : 0) - sp.HH + droop;
    return { walk, sit, cw, st, dy, hyL, x0, yT, hx, hy, sF: [x0 + sp.W - 1, yT + 2], sB: [x0 + 1, yT + 2] };
  }
  const JAB = { pitchfork: 1, spear: 1 };
  function chands(sp, g, anim, f, tool) {
    const A = sp.A, [fx, fy] = g.sF, bx = g.sB[0]; let fh = [fx + 1, fy + A], bh = [bx - 1, fy + A], a = -1.3;
    if (anim === 'walk') { fh = [fx + 1 - g.st, fy + A]; bh = [bx - 1 + g.st, fy + A]; }
    else if (anim === 'work') {
      if (JAB[tool]) { const r = [[1, A - 3], [A - 1, -1], [A + 2, -1], [2, A - 3]][f]; fh = [fx + r[0], fy + r[1]]; bh = [fh[0] - 3, fh[1] + 1]; a = [-.2, 0, 0, -.2][f]; }
      else { const r = [[-1, -A], [2, -A - 1], [A - 1, -2], [A - 2, A - 2]][f]; fh = [fx + r[0], fy + r[1]]; bh = [fh[0] - 2, fh[1] + 1]; a = [-2.4, -1.6, -.3, .6][f]; }
    }
    else if (anim === 'cheer') { fh = [fx + 1, g.hy - 2 - f]; bh = [bx - 1, g.hy - 1 - (1 - f)]; }
    else if (anim === 'carry') { fh = [fx, g.hy - 1]; bh = [bx, g.hy - 1]; }
    else if (anim === 'cower') { fh = [g.hx + sp.HW, g.hy]; bh = [g.hx + 1, g.hy - 1]; }
    else if (anim === 'chained') { fh = [fx + 2, g.hyL - 1]; bh = [fx, g.hyL]; }
    else if (anim === 'sit' || anim === 'sleep') { fh = [fx + 3, -3]; bh = [fx + 1, -3]; }
    else if (anim === 'whip') { const r = [[-3, -1], [-4, 1 - A], [-1, -A - 1], [2, -A], [A - 1, -3], [A, -1], [A - 1, 1], [A - 2, A - 3]][f]; fh = [fx + r[0], fy + r[1]]; bh = [bx - 1, fy + A - 2]; }
    return { fh, bh, a };
  }

  // Back layer: tails, wings, trailing hoods.
  const BACK = {
    imp: (q, g, sp, L, anim, f) => { const sw = g.walk ? f % 2 : 0, c = S(L.skin, -.2); q.path([[g.x0, g.hyL - 1], [g.x0 - 3, g.hyL + 1], [g.x0 - 5, -3 - sw], [g.x0 - 5, -6 - sw]], c); q.rect(g.x0 - 6, -8 - sw, 3, 2, c); q.px(g.x0 - 5, -9 - sw, c); },
    demon: (q, g, sp, L, anim, f) => {
      const c = S(L.skin, -.25), up = g.walk ? f % 2 : anim === 'whip' && f >= 4 && f <= 5 ? 2 : 0, [sx, sy] = g.sB;
      q.poly([[sx + 1, sy - 1], [sx - 9, sy - 9 - up], [sx - 11, sy - 2 - up], [sx - 8, sy - 3], [sx - 7, sy + 2], [sx - 4, sy], [sx - 2, sy + 4]], '#4a1210');
      q.line(sx + 1, sy - 1, sx - 9, sy - 9 - up, '#2a0a08'); q.line(sx - 9, sy - 9 - up, sx - 11, sy - 2 - up, '#2a0a08'); q.px(sx - 9, sy - 10 - up, BONE.d);
      q.path([[g.x0 + 1, g.hyL - 1], [g.x0 - 4, g.hyL + 2], [g.x0 - 7, -2], [g.x0 - 9, -5]], c); q.poly([[g.x0 - 11, -5], [g.x0 - 8, -8], [g.x0 - 7, -4]], c);
    },
    hellknight: (q, g, sp, L) => { q.path([[g.x0 + 1, g.hyL - 2], [g.x0 - 3, g.hyL], [g.x0 - 4, -3]], S(sp.legs, -.1)); q.rect(g.x0 - 5, -3, 2, 2, S(sp.legs, .1)); },
    wraith: (q, g, sp, L, anim, f) => { const sw = g.walk ? (f % 2 ? 1 : -1) : 0; q.poly([[g.hx, g.hy + 2], [g.hx - 3 + sw, g.hy + 10], [g.hx - 5 + sw, g.yT + 12], [g.x0, g.yT + 8]], S(L.skin, .08)); }
  };

  function cLegs(q, kind, sp, g, L, anim, f) {
    if (sp.feet === 'robe') return;
    const legC = sp.legs || S(L.skin, -.08), legD = S(legC, -.25), footC = sp.feet === 'hoof' ? '#161010' : sp.feet === 'boot' ? '#1e1612' : S(L.skin, -.32);
    if (g.sit) { q.rect(g.x0 + 1, -3, sp.W + 1, 3, legC); q.rect(g.x0 + 1, -1, sp.W + 1, 1, legD); q.rect(g.x0 + sp.W + 1, -4, sp.lw, 4, footC); return; }
    const lw = sp.lw, bl = g.walk && f === 3 ? 1 : 0, fl = g.walk && f === 1 ? 1 : 0, top = g.hyL;
    const bx = g.x0 + 1 - g.st, fx = g.x0 + sp.W - lw - 1 + g.st, fh = sp.L >= 8 ? 2 : 1;
    q.rect(bx, top, lw, -top - bl, legD); q.rect(fx, top, lw, -top - fl, legC); q.px(fx, top, S(legC, .2));
    if (sp.feet === 'hoof' && sp.L >= 8) { q.px(fx + lw, top + 3, legC); q.px(bx + lw, top + 3, legD); }   // goat-leg knee
    if (g.cw) { q.px(fx + lw, top + 1, legC); q.px(bx + lw, top + 1, legD); }                                // knees bent
    q.rect(bx, -fh - bl, lw + 1, fh, S(footC, -.1)); q.rect(fx, -fh - fl, lw + (sp.feet === 'hoof' ? 1 : 2), fh, footC);
    if (sp.feet === 'hoof') { q.px(fx + 1, -1 - fl, '#3a2a26'); } else if (sp.feet === 'boot') q.px(fx + lw, -fh - fl, S(footC, .5));
  }

  // Torso details per kind (g.x0, g.yT: torso top-left; W x T).
  const TORSO = {
    orc: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W, cl = L.cloth;
      q.line(x0, yT + 1, x0 + W - 1, hyL - 3, S(cl, -.35)); q.rect(x0, hyL - 2, W, 1, '#2a1c14'); q.px(x0 + 3, hyL - 2, IRON.l);
      for (let i = 0; i < W; i += 2) q.px(x0 + i, hyL, cl);
      q.rect(x0 + W - 3, yT, 3, 2, IRON.b); q.px(x0 + W - 3, yT, IRON.l); q.px(x0 + W - 1, yT + 1, IRON.d);
    },
    goblin: (q, g, sp, L) => { const { x0, yT, hyL } = g; q.px(x0 + 3, yT + 2, S(L.skin, -.25)); q.px(x0 + 3, yT + 4, S(L.skin, -.25)); q.rect(x0, hyL - 2, sp.W, 2, L.cloth); q.px(x0 + 1, hyL, L.cloth); q.px(x0 + 4, hyL, L.cloth); q.rect(x0, hyL - 2, sp.W, 1, S(L.cloth, -.3)); },
    hollow: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, cl = L.cloth; q.rect(x0 + 1, yT, 3, 1, L.skin); q.px(x0 + 2, yT + 1, L.skin);
      q.px(x0 + 4, yT + 3, S(cl, -.35)); q.px(x0 + 1, yT + 5, S(cl, -.35)); q.px(x0 + 3, yT + 4, L.skin);
      for (let i = 0; i < sp.W; i += 2) q.px(x0 + i, hyL + (i % 4 ? 1 : 0), cl); q.px(x0 - 1, hyL - 1, cl);
    },
    imp: (q, g, sp, L) => { const { x0, yT, hyL } = g; q.rect(x0 + 2, yT + 2, 3, 2, S(L.skin, .25)); q.rect(x0, hyL - 1, sp.W, 1, '#2a1612'); },
    zombie: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W; q.line(x0, yT, x0 + W - 1, hyL - 2, '#6a4a2a'); q.rect(x0, hyL - 1, W, 1, '#4a3a24');
      q.px(x0 + 1, yT + 4, L.skin); q.px(x0 + 5, yT + 2, L.skin); q.px(x0 + 2, hyL - 2, S(L.cloth, -.4)); q.rect(x0 + 2, yT, 3, 1, S(L.skin, -.1));
    },
    uruk: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W, cx = x0 + (W >> 1);
      q.rect(x0 - 1, yT, 4, 3, IRON.b); q.rect(x0 + W - 3, yT, 4, 3, IRON.b); q.rect(x0 - 1, yT, 4, 1, IRON.l); q.rect(x0 + W - 3, yT, 4, 1, IRON.l); q.px(x0 + W, yT - 1, IRON.h); q.px(x0, yT - 1, IRON.l);
      if (L.motif === 'hand') { const hx = x0 + 2, hy = yT + 1, w = C.white; for (let i = 0; i < 4; i++) q.rect(hx + i * 2, hy + (i === 0 || i === 3 ? 1 : 0), 1, 4 - (i === 0 || i === 3 ? 1 : 0), w); q.rect(hx, hy + 4, 7, 3, w); q.px(hx + 7, hy + 4, w); q.px(hx + 8, hy + 3, w); q.rect(hx + 2, hy + 7, 3, 1, w); q.px(hx + 6, hy + 6, '#d8d4cc'); }
      else { q.rect(cx - 2, yT + 3, 6, 3, '#c83a1e'); q.rect(cx - 1, yT + 3, 4, 3, '#ff8a2a'); q.px(cx - 3, yT + 4, '#c83a1e'); q.px(cx + 4, yT + 4, '#c83a1e'); q.rect(cx + 1, yT + 3, 1, 3, C.ink); q.px(cx, yT + 4, '#ffd27a'); }
      q.rect(x0, hyL - 2, W, 2, '#141418'); q.px(cx, hyL - 2, IRON.l);
      for (let i = 0; i < W; i += 2) q.px(x0 + i, hyL, '#34343c');
    },
    wraith: (q, g, sp, L, anim, f) => {
      // One long ragged robe from the shoulders to the ground, hem swaying.
      const { x0, yT } = g, c = L.skin, cD = S(c, -.4), cH = S(c, .14), sw = g.walk ? (f % 2 ? 1 : -1) : 0;
      for (let yy = yT; yy < 0; yy++) { const e = Math.floor((yy - yT) / 4), xs = x0 - (e >> 1) + (yy > -4 ? sw : 0), w = sp.W + e; q.rect(xs, yy, w, 1, c); q.px(xs, yy, cH); q.px(xs + w - 1, yy, cD); }
      const e = Math.floor(-yT / 4), xs = x0 - (e >> 1) + sw;
      q.rect(x0 + 2, yT + 3, 1, -yT - 5, cD); q.rect(x0 + 6, yT + 5, 1, -yT - 8, cD);
      for (let i = 0; i < sp.W + e; i += 3) q.rect(xs + i, -1, 1, 1, cD);
      q.rect(x0, g.hyL - 3, sp.W, 1, '#2e2a34'); q.px(x0 + 4, g.hyL - 3, IRON.l);
    },
    demon: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W, d = S(L.skin, -.25);
      q.rect(x0 + 2, yT + 4, 4, 1, d); q.rect(x0 + 7, yT + 4, 3, 1, d); q.px(x0 + 6, yT + 6, d); q.px(x0 + 6, yT + 8, d); q.px(x0 + 5, yT + 7, d); q.px(x0 + 7, yT + 7, d);
      q.rect(x0 + 2, yT + 2, 3, 1, S(L.skin, .25)); q.rect(x0, hyL - 2, W, 2, '#2a1a16'); q.px(x0 + 5, hyL - 2, BONE.b); q.px(x0 + 3, hyL, '#2a1a16'); q.px(x0 + 8, hyL, '#2a1a16');
      q.px(x0 - 1, yT, BONE.b); q.px(x0 + W, yT, BONE.b);
    },
    hellknight: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W, d = S(L.skin, -.22), h = S(L.skin, .22);
      q.rect(x0 - 1, yT, W + 2, 4, L.skin); q.rect(x0 - 1, yT, W + 2, 1, h); q.rect(x0 + 2, yT + 5, 4, 1, d); q.rect(x0 + 8, yT + 5, 4, 1, d); q.rect(x0 + 6, yT + 6, 1, 4, d);
      q.px(x0 + 5, yT + 8, d); q.px(x0 + 8, yT + 8, d); q.rect(x0 + 2, yT + 2, 3, 2, h);
      q.rect(x0, hyL - 1, W, 2, sp.legs); q.dither(x0, hyL - 1, W, 2, S(sp.legs, -.2), 1);
    },
    troll: (q, g, sp, L) => {
      const { x0, yT, hyL } = g, W = sp.W, d = S(L.skin, -.22);
      q.ellipse(x0 + (W >> 1) + 1, yT + 9, 6, 4, S(L.skin, .12)); q.px(x0 + 4, yT + 3, d); q.px(x0 + 13, yT + 5, d); q.px(x0 + 6, yT + 11, d);
      q.rect(x0, hyL - 3, W, 4, L.cloth); q.rect(x0, hyL - 3, W, 1, '#8a7456'); for (let i = 0; i < W; i += 3) q.px(x0 + i + 1, hyL + 1, L.cloth);
      q.rect(x0 - 2, yT, 5, 4, L.skin); q.rect(x0 + W - 3, yT - 1, 5, 5, L.skin);
    }
  };

  // Heads (hx, hy: top-left of the head box; the face is on the right).
  const HEAD = {
    orc: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25);
      q.rect(hx, hy + 1, 7, 6, sk); q.rect(hx + 1, hy, 5, 1, sk); q.rect(hx, hy + 1, 1, 4, S(sk, .18)); q.rect(hx + 3, hy + 5, 5, 2, d); q.px(hx + 7, hy + 3, sk); q.px(hx + 7, hy + 4, d);
      q.px(hx - 1, hy + 2, sk); q.px(hx - 2, hy + 1, sk); q.px(hx - 1, hy + 3, d);
      q.px(hx + 4, hy + 5, C.white); q.px(hx + 7, hy + 5, C.white);
      q.rect(hx + 3, hy + 2, 5, 1, S(sk, -.4));
      if (eyes === 'open') { q.px(hx + 4, hy + 3, '#ffd23a'); q.px(hx + 6, hy + 3, '#ffd23a'); } else q.rect(hx + 4, hy + 3, 3, 1, C.ink);
      if (L.hair) { q.rect(hx, hy - 1, 3, 3, L.hair); q.px(hx + 1, hy - 2, L.hair); q.px(hx - 1, hy, L.hair); }
      if (L.helm) { q.rect(hx - 1, hy - 1, 8, 3, IRON.b); q.rect(hx, hy - 2, 6, 1, IRON.l); q.px(hx + 3, hy - 3, IRON.h); q.rect(hx + 6, hy + 1, 1, 2, IRON.b); q.px(hx + 1, hy, IRON.h); q.rect(hx - 1, hy + 1, 8, 1, IRON.d); if (L.helm === 2) q.px(hx + 2, hy - 1, '#e0402a'); }
    },
    goblin: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25);
      q.rect(hx, hy + 1, 8, 5, sk); q.rect(hx + 1, hy, 6, 1, sk); q.rect(hx + 2, hy + 6, 5, 1, d); q.rect(hx, hy + 1, 1, 3, S(sk, .2));
      q.rect(hx - 3, hy + 2, 3, 2, sk); q.px(hx - 4, hy + 1, sk); q.px(hx - 2, hy + 3, d); q.px(hx + 7, hy - 1, sk); q.px(hx + 8, hy - 2, sk);
      if (eyes === 'open') { q.rect(hx + 3, hy + 2, 2, 2, '#f4e89a'); q.rect(hx + 6, hy + 2, 2, 2, '#f4e89a'); q.px(hx + 4, hy + 3, C.ink); q.px(hx + 7, hy + 3, C.ink); }
      else { q.rect(hx + 3, hy + 3, 2, 1, C.ink); q.rect(hx + 6, hy + 3, 2, 1, C.ink); }
      q.px(hx + 8, hy + 4, sk); q.rect(hx + 4, hy + 5, 3, 1, C.ink); q.px(hx + 5, hy + 5, C.white);
    },
    hollow: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.28);
      q.rect(hx, hy + 1, 6, 5, sk); q.rect(hx + 1, hy, 4, 1, sk); q.rect(hx + 2, hy + 6, 3, 1, d); q.px(hx + 4, hy + 4, d); q.px(hx, hy + 1, S(sk, .18));
      q.rect(hx + 3, hy + 2, 1, 2, '#1e1612'); q.rect(hx + 5, hy + 2, 1, 2, '#1e1612');
      if (eyes !== 'closed') { q.px(hx + 3, hy + 3, '#ffb84a'); q.px(hx + 5, hy + 3, '#ffb84a'); }
      q.px(hx + 4, hy + 5, C.ink); q.px(hx + 6, hy + 3, d);
      if (L.hair) { for (let i = 0; i < 3; i++) q.rect(hx - 1 + i, hy - (i === 1 ? 1 : 0), 1, 5 + i % 2 * 2, L.hair); q.px(hx + 3, hy - 1, L.hair); }
      if (L.hood) { q.rect(hx - 1, hy - 1, 6, 3, L.cloth); q.rect(hx - 1, hy + 1, 2, 6, L.cloth); q.px(hx + 5, hy, S(L.cloth, -.2)); }
      if (!L.hair && !L.hood) { q.px(hx + 1, hy - 1, '#a8a296'); q.px(hx - 1, hy + 1, '#a8a296'); }
    },
    imp: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25), horn = '#e8d8b0';
      q.rect(hx, hy + 1, 6, 5, sk); q.rect(hx + 1, hy, 4, 1, sk); q.px(hx, hy + 1, S(sk, .2)); q.rect(hx + 1, hy + 5, 5, 1, d);
      q.px(hx + 1, hy - 1, horn); q.px(hx, hy - 2, horn); q.px(hx + 4, hy - 1, horn); q.px(hx + 5, hy - 2, horn); q.px(hx + 5, hy - 3, BONE.d);
      q.px(hx - 1, hy + 2, sk); q.px(hx - 2, hy + 1, sk);
      if (eyes === 'open') { q.px(hx + 3, hy + 2, '#ffe04a'); q.px(hx + 5, hy + 2, '#ffe04a'); } else { q.rect(hx + 3, hy + 2, 3, 1, C.ink); }
      q.rect(hx + 2, hy + 4, 4, 1, C.ink); q.px(hx + 3, hy + 4, C.white); q.px(hx + 5, hy + 4, C.white); q.px(hx + 6, hy + 3, sk);
    },
    zombie: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25);
      q.rect(hx, hy + 1, 7, 6, sk); q.rect(hx + 1, hy, 5, 1, sk); q.px(hx, hy + 1, S(sk, .18)); q.rect(hx + 1, hy + 6, 5, 1, d); q.px(hx - 1, hy + 3, sk);
      q.rect(hx + 3, hy + 3, 4, 1, d);
      if (eyes === 'open') { q.px(hx + 4, hy + 3, '#e8402a'); q.px(hx + 6, hy + 3, '#e8402a'); } else q.rect(hx + 4, hy + 3, 3, 1, C.ink);
      q.rect(hx + 4, hy + 5, 2, 1, '#3a2a24'); q.px(hx + 7, hy + 4, sk);
      if (L.hair) { q.rect(hx, hy - 1, 7, 2, L.hair); q.rect(hx, hy + 1, 2, 3, L.hair); }
      if (L.helm) { q.rect(hx - 1, hy - 1, 8, 3, '#3e5030'); q.rect(hx, hy - 2, 6, 1, '#56703e'); q.rect(hx - 1, hy + 1, 8, 1, '#2a3620'); }
    },
    uruk: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.3);
      q.rect(hx, hy + 1, 8, 7, sk); q.rect(hx + 1, hy, 6, 1, sk); q.rect(hx + 3, hy + 6, 6, 2, d); q.px(hx + 8, hy + 3, sk); q.px(hx + 8, hy + 4, d);
      q.rect(hx + 4, hy + 2, 5, 1, S(sk, -.45));
      if (eyes === 'open') { q.px(hx + 5, hy + 3, '#ffcc3a'); q.px(hx + 7, hy + 3, '#ffcc3a'); } else q.rect(hx + 5, hy + 3, 3, 1, C.ink);
      q.px(hx + 5, hy + 6, C.white); q.px(hx + 8, hy + 6, C.white); q.rect(hx + 5, hy + 7, 3, 1, '#1a1210');
      if (L.motif === 'hand' && !L.helm) q.rect(hx + 4, hy + 4, 4, 1, C.white);
      if (L.hair) { q.rect(hx - 1, hy - 1, 5, 2, L.hair); q.rect(hx - 2, hy + 1, 4, 9, L.hair); q.px(hx - 3, hy + 9, L.hair); q.px(hx - 1, hy + 10, L.hair); }
      if (L.helm) {
        q.rect(hx - 1, hy - 2, 10, 4, '#1c1c22'); q.rect(hx, hy - 3, 8, 1, '#34343c'); q.rect(hx - 1, hy - 2, 2, 3, '#44444c'); q.rect(hx - 1, hy + 2, 3, 5, '#1c1c22');
        q.rect(hx + 7, hy + 1, 2, 2, '#1c1c22'); q.px(hx + 3, hy - 4, IRON.l); q.px(hx + 3, hy - 3, IRON.b);
        q.rect(hx + 6, hy + 2, 1, 3, '#1c1c22'); if (L.motif !== 'hand') q.px(hx + 4, hy - 1, '#e0402a'); else q.px(hx + 4, hy - 1, C.white);
      }
    },
    wraith: (q, hx, hy, sp, L, eyes) => {
      const c = L.skin, cH = S(c, .16);
      q.rect(hx, hy + 1, 8, 8, c); q.rect(hx + 1, hy, 6, 1, c); q.rect(hx, hy + 1, 1, 7, cH); q.px(hx + 1, hy, cH);
      q.rect(hx + 3, hy + 2, 5, 6, '#040306'); q.rect(hx + 8, hy + 3, 1, 5, c);
      const glow = eyes === 'closed' ? '#3a4a5a' : '#bfe0ff'; q.px(hx + 5, hy + 4, glow); q.px(hx + 7, hy + 4, glow);
      if (eyes !== 'closed') { q.px(hx + 5, hy + 5, '#5a7aa0'); q.px(hx + 7, hy + 5, '#5a7aa0'); }
      const cr = '#8a8e98'; q.rect(hx + 1, hy, 7, 1, cr); q.px(hx + 1, hy - 1, cr); q.px(hx + 3, hy - 1, cr); q.px(hx + 3, hy - 2, IRON.h); q.px(hx + 5, hy - 1, cr); q.px(hx + 5, hy - 2, cr); q.px(hx + 5, hy - 3, IRON.h); q.px(hx + 7, hy - 1, cr); q.px(hx + 7, hy - 2, IRON.h);
    },
    demon: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.3);
      q.rect(hx, hy + 1, 7, 6, sk); q.rect(hx + 1, hy, 5, 1, sk); q.px(hx, hy + 1, S(sk, .22)); q.rect(hx + 2, hy + 6, 6, 1, d); q.px(hx + 7, hy + 3, sk);
      q.rect(hx + 3, hy + 2, 5, 1, S(sk, -.5));
      if (eyes === 'open') { q.px(hx + 4, hy + 3, '#ffe84a'); q.px(hx + 6, hy + 3, '#ffe84a'); q.px(hx + 5, hy + 3, S(sk, -.2)); } else q.rect(hx + 4, hy + 3, 3, 1, C.ink);
      q.rect(hx + 3, hy + 5, 4, 1, C.ink); q.px(hx + 3, hy + 5, C.white); q.px(hx + 6, hy + 5, C.white);
      q.path([[hx + 1, hy], [hx - 1, hy - 2], [hx - 2, hy - 4], [hx - 1, hy - 6]], BONE.b); q.px(hx - 1, hy - 3, BONE.d);
      q.path([[hx + 5, hy], [hx + 6, hy - 2], [hx + 8, hy - 3], [hx + 9, hy - 5]], BONE.b); q.px(hx + 9, hy - 6, BONE.h); q.px(hx + 6, hy - 1, BONE.d);
      q.px(hx - 1, hy + 2, sk); q.px(hx - 2, hy + 1, sk);
    },
    hellknight: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25), horn = '#5a3a2a';
      q.rect(hx, hy + 1, 8, 6, sk); q.rect(hx + 1, hy, 6, 1, sk); q.px(hx, hy + 1, S(sk, .22)); q.rect(hx + 3, hy + 5, 6, 2, d); q.px(hx + 8, hy + 3, sk);
      q.rect(hx + 4, hy + 2, 5, 1, S(sk, -.45));
      if (eyes === 'open') { q.px(hx + 5, hy + 3, '#ff4a1a'); q.px(hx + 7, hy + 3, '#ff4a1a'); } else q.rect(hx + 5, hy + 3, 3, 1, C.ink);
      q.rect(hx + 4, hy + 6, 4, 1, C.ink); q.px(hx + 4, hy + 6, C.white); q.px(hx + 7, hy + 6, C.white);
      q.path([[hx, hy + 1], [hx - 3, hy], [hx - 4, hy - 2], [hx - 3, hy - 4]], horn); q.px(hx - 3, hy - 1, horn);
      q.path([[hx + 6, hy], [hx + 8, hy - 2], [hx + 10, hy - 2], [hx + 11, hy - 4]], horn); q.px(hx + 11, hy - 5, '#8a6a4a');
    },
    troll: (q, hx, hy, sp, L, eyes) => {
      const sk = L.skin, d = S(sk, -.25);
      q.rect(hx, hy + 1, 10, 8, sk); q.rect(hx + 1, hy, 7, 1, sk); q.rect(hx, hy + 1, 1, 5, S(sk, .15)); q.rect(hx + 3, hy + 6, 8, 3, d); q.px(hx + 10, hy + 3, sk); q.rect(hx + 10, hy + 4, 1, 2, d);
      q.rect(hx + 5, hy + 2, 5, 1, S(sk, -.45));
      if (eyes === 'open') { q.px(hx + 6, hy + 3, '#e8e070'); q.px(hx + 9, hy + 3, '#e8e070'); } else { q.rect(hx + 6, hy + 3, 4, 1, C.ink); }
      q.px(hx + 5, hy + 6, C.white); q.px(hx + 9, hy + 6, C.white); q.rect(hx + 5, hy + 7, 5, 1, S(sk, -.5));
      q.px(hx - 1, hy + 3, sk); q.px(hx + 2, hy + 1, d);
    }
  };

  // Held tools for creatures (the human TOOLS table stays as it was).
  function cTool(q, kind, sp, tool, anim, a, hx, hy) {
    if (tool === 'spear' || tool === 'pitchfork') {
      const fork = tool === 'pitchfork', len = sp.L >= 8 ? 20 : 13;
      if (anim === 'work') { const x = hx + Math.cos(a) * len, y = hy + Math.sin(a) * len; q.line(hx - 4, hy + 1, x, y, C.wood3); if (fork) { q.rect(x, y - 2, 1, 5, IRON.l); q.line(x, y - 2, x + 3, y - 2, IRON.l); q.line(x, y, x + 3, y, IRON.l); q.line(x, y + 2, x + 3, y + 2, IRON.h); } else { q.poly([[x, y - 2], [x + 4, y], [x, y + 2]], IRON.l); q.px(x + 3, y, IRON.h); } return; }
      const top = hy - (sp.L >= 8 ? 14 : 9); q.line(hx, 0, hx, top, C.wood2); q.px(hx, top + 3, C.wood4);
      if (fork) { q.rect(hx - 2, top - 1, 5, 1, IRON.l); q.px(hx - 2, top - 3, IRON.l); q.px(hx - 2, top - 2, IRON.l); q.px(hx, top - 3, IRON.h); q.px(hx, top - 2, IRON.l); q.px(hx + 2, top - 3, IRON.l); q.px(hx + 2, top - 2, IRON.l); }
      else { q.poly([[hx - 2, top], [hx, top - 5], [hx + 2, top]], IRON.l); q.px(hx, top - 4, IRON.h); q.rect(hx - 1, top + 1, 3, 1, '#8a1a10'); }
      return;
    }
    if (tool === 'club' || (kind === 'troll' && !tool)) {
      const len = kind === 'troll' ? 15 : 9, x = hx + Math.cos(a) * len, y = hy + Math.sin(a) * len;
      q.line(hx, hy, x, y, C.wood2, kind === 'troll' ? 3 : 2); q.circle(x, y, kind === 'troll' ? 4 : 2, C.wood2); q.circle(x - 1, y - 1, kind === 'troll' ? 2 : 1, C.wood3); if (kind === 'troll') { q.px(x + 3, y, IRON.h); q.px(x, y + 3, IRON.h); q.px(x - 3, y - 1, IRON.l); }
      return;
    }
    if (tool && TOOLS[tool]) TOOLS[tool](q, a, hx, hy);
  }
  const chainLink = (q, x0, y0, x1, y1) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { const u = i / n; q.px(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + Math.round(Math.sin(u * Math.PI) * 2), i % 2 ? IRON.h : IRON.l); } };

  function drawBiped(q, kind, look, anim, f, carry, tool, chains) {
    const sp = KINDS[kind], L = sp.looks[look % sp.looks.length], g = cgeo(sp, anim, f), h = chands(sp, g, anim, f, tool);
    const eyes = anim === 'sleep' || anim === 'cower' ? 'closed' : 'open', armT = sp.W >= 12 ? 3 : 2, hs = sp.W >= 12 ? 3 : 2;
    const armC = sp.arm || L.skin, handC = sp.hand || L.skin;
    if (BACK[kind]) BACK[kind](q, g, sp, L, anim, f);
    // Back arm, legs, torso, head, front arm.
    q.line(g.sB[0], g.sB[1], h.bh[0], h.bh[1], S(armC, -.22), armT); q.rect(h.bh[0] - 1, h.bh[1] - 1, hs, hs, S(handC, -.18));
    cLegs(q, kind, sp, g, L, anim, f);
    if (sp.feet !== 'robe') {
      const cl = L.cloth && kind !== 'goblin' && kind !== 'troll' ? L.cloth : kind === 'uruk' ? '#2a2a32' : L.skin, { x0, yT } = g, W = sp.W, T = sp.T;
      q.rect(x0, yT, W, T, cl); q.rect(x0, yT, 1, T, S(cl, .2)); q.rect(x0 + W - 1, yT, 1, T, S(cl, -.25)); q.rect(x0, yT + T - 1, W, 1, S(cl, -.3));
    }
    TORSO[kind](q, g, sp, L, anim, f);
    HEAD[kind](q, g.hx, g.hy, sp, L, eyes);
    q.line(g.sF[0], g.sF[1], h.fh[0], h.fh[1], armC, armT); q.rect(h.fh[0] - 1, h.fh[1] - 1, hs, hs, handC); q.px(h.fh[0] - 1, h.fh[1] - 1, S(handC, .25));
    // Whip handle in the whip hand; a coiled whip at the belt otherwise (overseers only).
    if (anim === 'whip' && kind !== 'hellknight') { const d = [[-1, 2], [-1, 2], [0, 2], [1, 2], [2, 1], [2, 0], [2, 0], [1, 1]][f]; q.line(h.fh[0], h.fh[1], h.fh[0] + d[0], h.fh[1] + d[1], C.wood1, 2); }
    else if (sp.lash && !carry && !tool && anim !== 'sit' && anim !== 'sleep' && kind !== 'hellknight') { const cx = g.x0 + 2, cy = g.hyL - 3; q.ring(cx, cy, 2, 2, kind === 'demon' ? '#7a1e10' : '#3a2416'); q.px(cx, cy, kind === 'demon' ? FIRE[2] : '#5a3a24'); }
    if (kind === 'hellknight') {
      // A green hellfire ball grows in the throwing hand (it flies out at runtime).
      const r = anim === 'whip' ? [1, 2, 2, 3, -1, -1, -1, 0][f] : anim === 'work' ? 1 : -1;
      if (r >= 0) { q.circle(h.fh[0] + 1, h.fh[1] - 2, r + 1, TOXIC[1]); q.circle(h.fh[0] + 1, h.fh[1] - 2, r, TOXIC[2]); q.px(h.fh[0] + 1, h.fh[1] - 2 - r, TOXIC[3]); }
    }
    if (carry && CARRY[carry]) q.at(g.hx + (sp.HW >> 1) - 1, g.hy + 20, () => CARRY[carry](q));
    else if (carry === 'stone') { const x = g.hx - 3, y = g.hy - 8; q.rect(x, y, sp.HW + 6, 8, C.stone2); q.rect(x, y, sp.HW + 6, 2, C.stone4); q.rect(x + sp.HW + 4, y + 2, 2, 6, C.stone1); }
    else cTool(q, kind, sp, tool, anim, anim === 'work' ? h.a : -1.3, h.fh[0] + 1, h.fh[1]);
    if (chains || anim === 'chained') {
      for (const [x, y] of [h.fh, h.bh]) { q.rect(x - 1, y + 1, 3, 1, IRON.b); q.px(x - 1, y + 1, IRON.h); }
      chainLink(q, h.bh[0], h.bh[1] + 1, h.fh[0], h.fh[1] + 1);
      if (!g.sit) { const bx = g.x0 + 1 - g.st, fx = g.x0 + sp.W - sp.lw - 1 + g.st; q.rect(bx, -3, sp.lw + 1, 1, IRON.b); q.rect(fx, -3, sp.lw + 1, 1, IRON.b); chainLink(q, bx + 1, -2, fx + 1, -2); }
      else { q.rect(g.x0 + sp.W, -4, 2, 1, IRON.b); chainLink(q, g.x0 + sp.W, -3, g.x0 - 4, -1); q.circle(g.x0 - 5, -2, 2, IRON.d); q.px(g.x0 - 6, -3, IRON.l); }
    }
    if (anim === 'cower') { const sx = g.hx + sp.HW + 1, sy = g.hy + 1 + f * 2; q.px(sx, sy, '#dff4ff'); q.rect(sx, sy + 1, 2, 2, '#7cc0ef'); q.px(g.hx - 2, g.hy - 1 + f, '#bfe6ff'); }
  }

  function drawCaco(q, anim, f) {
    const low = anim === 'sleep' || anim === 'sit', cy = low ? -10 : -24 + [0, -1, -1, 0][f % 4], R = ['#4a0e0c', '#8a1c18', '#c0302a', '#e05a44', '#f48a6a'];
    const m = anim === 'whip' ? [0, 0, 0, 1, 2, 3, 3, 1][f] : anim === 'cheer' ? 2 : anim === 'work' ? f % 2 : 0;
    q.poly([[-7, cy - 7], [-9, cy - 13], [-4, cy - 9]], R[2]); q.poly([[3, cy - 9], [5, cy - 14], [7, cy - 7]], R[2]); q.px(-9, cy - 13, R[4]); q.px(5, cy - 14, R[4]);
    q.circle(0, cy, 11, R[1]); q.circle(-1, cy - 1, 10, R[2]); q.ellipse(-4, cy - 6, 4, 2, R[3]); q.px(-6, cy - 7, R[4]); q.px(-5, cy - 7, R[4]);
    for (const [x, y] of [[-8, cy + 2], [-5, cy + 6], [-9, cy - 3], [6, cy + 8], [-2, cy + 9]]) { q.px(x, y, R[3]); q.px(x + 1, y + 1, R[1]); }
    q.ellipse(2, cy + 7, 7, 3, R[1]);
    // One big green eye.
    q.circle(3, cy - 3, 4, R[0]); q.circle(3, cy - 3, 3, '#f4f0dc');
    if (anim === 'sleep') { q.rect(0, cy - 5, 7, 3, R[3]); q.rect(0, cy - 3, 7, 1, C.ink); }
    else { q.circle(4, cy - 3, 2, '#3ac050'); q.px(4, cy - 3, C.ink); q.px(5, cy - 4, C.white); if (anim === 'cower') q.rect(0, cy - 6, 7, 2, R[3]); else q.rect(0, cy - 7, 6, 1, R[0]); }
    // Mouth: a toothy grin, or a wide bellow with a blue throat.
    if (!m) { q.line(-4, cy + 4, 9, cy + 3, C.ink); for (let x = -3; x < 9; x += 2) q.px(x, cy + 4 - (x > 4 ? 1 : 0) + 1, C.white); q.line(-3, cy + 6, 8, cy + 5, R[3]); }
    else { q.ellipse(3, cy + 5, 7, 1 + m, '#1a0a2a'); q.ellipse(3, cy + 6, 4, m, '#3a3aa0'); for (let x = -3; x < 10; x += 2) { q.px(x, cy + 5 - m, C.white); q.px(x + 1, cy + 5 + m, C.white); } }
  }
  function drawLostSoul(q, anim, f) {
    const low = anim === 'sleep', cy = low ? -4 : -14 + [0, -1, -1, 0][f % 4], fl = f % 2, fl2 = (f >> 1) % 2, big = anim === 'whip' ? 2 : 0;
    if (!low) {
      q.poly([[-2, cy + 3], [-9 - big, cy + 1 - fl], [-6, cy - 1], [-11 - big, cy - 5 - fl2], [-5, cy - 4], [-6, cy - 10 - fl - big], [-1, cy - 6], [1, cy - 10 - fl2 - big], [3, cy - 5]], FIRE[2]);
      q.poly([[-2, cy + 2], [-6, cy - 1], [-3, cy - 3], [-4, cy - 7 - fl], [0, cy - 4]], FIRE[3]); q.px(-3, cy - 2, FIRE[4]);
    } else { q.px(-2, cy - 5, FIRE[2]); q.px(0, cy - 6 - fl, FIRE[1]); }
    q.rect(-3, cy - 4, 7, 6, BONE.b); q.rect(-2, cy - 5, 5, 1, BONE.b); q.rect(-3, cy - 4, 1, 4, BONE.h); q.rect(-1, cy + 2, 5, 2, BONE.d); q.px(4, cy - 1, BONE.d);
    q.rect(0, cy - 2, 2, 2, C.ink); q.rect(3, cy - 2, 2, 2, C.ink); if (!low) { q.px(1, cy - 1, '#ff5a2a'); q.px(4, cy - 1, '#ff5a2a'); }
    q.px(3, cy + 1, C.ink); q.px(0, cy + 3, C.ink); q.px(2, cy + 3, C.ink); q.px(-2, cy - 6, BONE.d); q.px(3, cy - 6, BONE.d);
  }
  const CANIM = { walk: [4, 8], carry: [4, 8], chained: [4, 5], work: [4, 6], whip: [8, 7], cower: [2, 6], cheer: [2, 3], idle: [2, 1.5], sleep: [2, 1.1], sit: [1, 1] };
  function creatureSprite(kind, look, anim, f, carry, tool, chains) {
    const [w, h, ox, oy] = boxOf(kind);
    return P.sprite(`hell|${kind}|${look}|${anim}|${f}|${carry}|${tool}|${chains ? 1 : 0}`, w, h, ox, oy, q => kind === 'cacodemon' ? drawCaco(q, anim, f) : kind === 'lostsoul' ? drawLostSoul(q, anim, f) : drawBiped(q, kind, look, anim, f, carry, tool, chains));
  }

  // Lash shape per whip frame: [start angle, bend per segment]; frame 5 is the crack.
  const LASH = [[2.3, .12], [3.3, .1], [-2.0, -.12], [-1.3, .25], [-.5, .3], [-.1, .02], [.15, .1], [.5, .12]];
  function whipFx(k, kind, sp, x, y, d, look, f, t, o) {
    const len = o.lash || sp.lash || 26;
    if (kind === 'cacodemon') {
      if (f < 5 || f > 6) return; const cx = x + 9 * d, cy = y - 19;
      for (let i = 0; i < 3; i++) { const r = 3 + i * 4 + (f - 5) * 4; k.alpha(f === 5 ? .9 : .45, () => { for (let a = -.7; a <= .7; a += .14) k.px(cx + Math.cos(a) * r * d, cy + Math.sin(a) * r, i === 0 ? C.white : '#c8b8ff'); }); }
      if (f === 5 && o.crack !== false) { k.text('ROAR', cx + (d > 0 ? 6 : -21), cy - 13, '#4a1a6a'); k.text('ROAR', cx + (d > 0 ? 5 : -22), cy - 14, '#e8d8ff'); }
      return;
    }
    const g = cgeo(sp, 'whip', f), h = chands(sp, g, 'whip', f, '');
    if (kind === 'hellknight') {
      // Throws a green hellfire ball instead of cracking a whip.
      const hx = x + (h.fh[0] + 1) * d, hy = y + h.fh[1] - 2;
      if (f === 4) { const bx = hx + len * .45 * d, by = hy - 2; k.circle(bx, by, 3, TOXIC[1]); k.circle(bx, by, 2, TOXIC[2]); k.px(bx, by, TOXIC[3]); for (let i = 1; i < 4; i++) k.px(bx - i * 3 * d, by + (i % 2), TOXIC[1]); }
      if (f === 5) { const bx = hx + len * d, by = hy; k.circle(bx, by, 5, TOXIC[1]); k.circle(bx, by, 3, TOXIC[2]); k.circle(bx, by, 1, TOXIC[3]); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; k.px(bx + Math.cos(a) * 7, by + Math.sin(a) * 6, TOXIC[2]); } if (o.crack !== false) { k.text('FWOOM', bx - 10, by - 14, TOXIC[0]); k.text('FWOOM', bx - 11, by - 15, TOXIC[3]); } }
      if (f === 6) { const bx = hx + len * d, by = hy; k.alpha(.6, () => { k.circle(bx, by - 2, 4, '#4a6a3a'); k.circle(bx + 2 * d, by - 5, 3, '#5a7a4a'); }); k.px(bx - 3, by - 7, TOXIC[2]); k.px(bx + 4, by - 6, TOXIC[2]); }
      return;
    }
    const seg = len / 8, [a0, cv] = LASH[f], demon = kind === 'demon';
    const hd = [[-1, 2], [-1, 2], [0, 2], [1, 2], [2, 1], [2, 0], [2, 0], [1, 1]][f];
    let px0 = x + (h.fh[0] + hd[0]) * d, py0 = y + h.fh[1] + hd[1], a = a0;
    const col = demon ? '#6a180e' : kind === 'wraith' ? '#141218' : '#2a1810', hi = demon ? '#c8401a' : '#6a4428';
    for (let i = 0; i < 8; i++) { const nx = px0 + Math.cos(a) * seg * d, ny = Math.min(y, py0 + Math.sin(a) * seg); k.line(px0, py0, nx, ny, i < 2 ? hi : col); px0 = nx; py0 = ny; a += cv; }
    const tx = Math.round(px0), ty = Math.round(py0), fl = mod(Math.floor(t * 12), 3);
    if (demon) { k.px(tx, ty - 1, FIRE[2]); k.px(tx + d, ty - 2 - fl, FIRE[3]); k.px(tx - d, ty - 1 - (fl === 1 ? 1 : 0), FIRE[1]); k.px(tx, ty - 3 - fl, FIRE[2]); }
    else k.px(tx, ty, C.paper);
    if (f === 5) {
      if (demon) { k.circle(tx, ty, 4, FIRE[1]); k.circle(tx, ty - 1, 3, FIRE[2]); k.circle(tx, ty - 1, 1, FIRE[4]); for (let i = 0; i < 6; i++) { const an = i * 1.05; k.px(tx + Math.cos(an) * 6, ty + Math.sin(an) * 5, FIRE[3]); } }
      else { k.rect(tx - 4, ty, 9, 1, C.gold4); k.rect(tx, ty - 4, 1, 9, C.gold4); k.rect(tx - 1, ty - 1, 3, 3, C.white); for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { k.px(tx + dx * 2, ty + dy * 2, C.gold3); k.px(tx + dx * 3, ty + dy * 3, C.gold2); } }
      if (o.crack !== false) { const lx = tx - (d > 0 ? 10 : 9); k.text('CRACK', lx + 1, ty - 11, '#8a1a10'); k.text('CRACK', lx, ty - 12, demon ? FIRE[3] : C.gold4); }
    } else if (f === 6) for (let i = 0; i < 6; i++) { const an = i * 1.05; k.px(tx + Math.cos(an) * 5, ty + Math.sin(an) * 4, demon ? FIRE[2] : C.gold2); }
  }

  // Seconds since the last whip crack / fireball / bellow of an overseer drawn with the same phase and speed.
  const crackAge = (t, o = {}) => { const fps = o.speed || 7; return mod(t * fps + (o.phase || 0) * 7 - 5, 8) / fps; };

  function creature(k, x, y, t, o) {
    const kind = o.kind, sp = KINDS[kind], state = o.state || 'working', ph = o.phase || 0, d = o.facing === -1 ? -1 : 1;
    let anim = o.anim || 'idle', chains = !!o.chains;
    if (anim === 'chained') chains = true;
    if (!CANIM[anim]) anim = 'idle';
    if (anim === 'whip' && !sp.lash) anim = 'work';
    if (state === 'off') anim = 'sleep'; else if (state !== 'working' && (anim === 'work' || anim === 'walk' || anim === 'whip' || anim === 'chained')) anim = 'idle';
    const [n, fps0] = CANIM[anim], fps = anim === 'work' || anim === 'whip' ? (o.speed || fps0) : sp.float && anim !== 'sleep' ? 6 : fps0;
    const f = sp.float && n < 4 && anim !== 'sleep' ? mod(Math.floor(t * fps + ph * 7), 4) : mod(Math.floor(t * fps + ph * 7), n);
    const floatUp = sp.float && anim !== 'sleep' && anim !== 'sit';
    k.ellipse(x + 1, y, floatUp ? (kind === 'cacodemon' ? 7 : 3) : sp.big ? 11 : sp.boss ? 8 : 5, floatUp ? 1 : sp.big ? 3 : 1.5, C.shadow);
    const shake = state === 'error' || anim === 'cower' ? [0, 1, 0, -1][mod(Math.floor(t * 12 + ph * 3), 4)] : 0;
    k.blit(creatureSprite(kind, (o.look || 0) % sp.looks.length, anim, f, o.carry || '', o.tool || '', chains), x + shake, y, d === -1);
    if (anim === 'whip') whipFx(k, kind, sp, x, y, d, o.look || 0, f, t, o);
    const top = anim === 'sleep' || anim === 'sit' ? Math.round(sp.top * .7) : sp.top;
    if (state === 'off' && o.z !== false) { const q = (t * .4 + ph) % 1; k.alpha(1 - q, () => k.text('z', x + 3 + q * 5, y - top - 2 - q * 10, '#c8d4ff')); }
    if (state === 'error' && o.mark !== false && mod(Math.floor(t * 3 + ph), 2)) { k.rect(x - 1, y - top - 11, 3, 6, C.ink); k.rect(x, y - top - 10, 1, 3, C.error); k.px(x, y - top - 6, C.error); }
    if (state === 'waiting' && o.mark !== false) { k.rect(x - 2, y - top - 11, 5, 7, C.ink); k.rect(x - 1, y - top - 10, 3, 5, C.waiting); k.px(x, y - top - 9, C.ink); k.px(x, y - top - 7, C.ink); }
  }

  /* ---------- Portraits for UI cards ---------- */
  function portrait(canvas, role, state = 'working', t = 1.2) {
    const c = canvas.getContext('2d'), k = P.kit(c), W = canvas.width, H = canvas.height, sc = Math.max(1, Math.floor(Math.min(W / 50, H / 72)));
    c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
    c.save(); c.translate(Math.round(W / 2), Math.round(H - 6 * sc)); c.scale(sc, sc);
    k.ellipse(0, 1, 14, 4, '#00000022'); lead(k, role, 0, 0, t, state, { indicator: true, scale: 1 }); c.restore();
  }

  window.AgentCharacters = { profiles: ROLES, scale: BIG, lead, crew, indicator: (...a) => Characters_indicator(...a), portrait, roles: Object.keys(ROLES), frameFor, crackAge, kinds: Object.keys(KINDS), creatureHeight: kind => KINDS[kind] ? KINDS[kind].top : 20 };
  var Characters_indicator;
})();
