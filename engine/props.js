/* Reusable pixel-art props and architecture. Every function takes a Pixel kit first.
   Static props are drawn once into the terrain cache; animated helpers take time t. */
(() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const Props = {};

  /* ---------- Vegetation (cached sprites) ---------- */
  function canopyBlob(k, cx, cy, r, tones, rnd) {
    const [d0, d1, d2, d3, d4] = tones;
    k.ellipse(cx, cy, r, r * .86, d1);
    k.ditherEllipse(cx + r * .25, cy + r * .3, r * .78, r * .55, d0, 0);
    k.ellipse(cx - r * .18, cy - r * .2, r * .72, r * .6, d2);
    k.ellipse(cx - r * .32, cy - r * .38, r * .42, r * .34, d3);
    k.ellipse(cx - r * .4, cy - r * .5, r * .18, r * .14, d4);
    // Leaf clumps: short dark crescents make individual bunches readable.
    for (let i = 0; i < r * 1.6; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * .8, x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d * .8);
      const lit = x - cx + y - cy < 0;
      k.rect(x, y, 2, 1, lit ? d3 : d1); k.px(x + (lit ? 0 : 1), y + 1, lit ? d2 : d0);
    }
  }
  const TREE_TONES = {
    oak: [C.leaf0, C.leaf1, C.leaf2, C.leaf3, C.leaf4],
    birch: ['#3a5a2c', '#56813a', '#79a447', '#9cc45a', '#c4e07a'],
    autumn: ['#6a2e1c', '#9c4a24', '#c46f2c', '#e0973c', '#f5c866'],
    blossom: ['#8a4a64', '#b86a86', '#d892a6', '#efb8c4', '#ffe0e6'],
    dark: ['#1a3526', '#23452f', '#2f5a39', '#3f7443', '#5a9450']
  };
  Props.treeSprite = (kind = 'oak', size = 1, variant = 0) => {
    size = Math.max(0, Math.min(3, size | 0)); variant = variant % 4;
    const key = `tree|${kind}|${size}|${variant}`;
    if (kind === 'pine') {
      const r = 8 + size * 3, h = 22 + size * 9, trunk = 5;
      return P.sprite(key, r * 2 + 4, h + trunk + 4, r + 2, h + trunk + 2, k => {
        const rnd = P.rng(900 + size * 7 + variant);
        k.rect(-2, -trunk - 2, 4, trunk + 2, C.wood1); k.rect(-2, -trunk - 2, 1, trunk + 2, C.wood2);
        const tiers = 3 + (size > 1 ? 1 : 0);
        for (let i = 0; i < tiers; i++) {
          const f = i / tiers, ty = -trunk - h * f * .78, w = r * (1 - f * .55), th = h * .42;
          k.poly([[-w - 1, ty], [0, ty - th], [w + 1, ty]], '#1e3d2e');
          k.poly([[-w, ty - 1], [0, ty - th], [0, ty - 1]], '#3f7a4c');
          k.poly([[0, ty - 1], [0, ty - th], [w, ty - 1]], '#2b5a3a');
          k.poly([[-w * .7, ty - 2], [-1, ty - th + 2], [-1, ty - 3]], '#5a9a5c');
          for (let j = 0; j < w; j += 3) { k.px(-j, ty - 1 - (j % 2), '#2b5a3a'); k.px(j, ty - 1, '#1e3d2e'); }
          for (let j = 0; j < 3; j++) k.px(-w * .5 + rnd() * w * .4, ty - th * .4 - rnd() * 4, '#7cbc6a');
        }
      }, '#132a1e');
    }
    const r = [8, 11, 14, 18][size], trunk = [6, 8, 10, 12][size] + (kind === 'birch' ? 5 : 0), tones = TREE_TONES[kind] || TREE_TONES.oak;
    return P.sprite(key, r * 2 + 8, r * 2 + trunk + 6, r + 4, r * 2 + trunk + 3, k => {
      const rnd = P.rng(300 + size * 13 + variant * 101 + kind.length * 7);
      const tw = size > 1 ? 5 : 4;
      if (kind === 'birch') {
        k.rect(-2, -trunk - 6, 4, trunk + 6, '#e8e4d4'); k.rect(1, -trunk - 6, 1, trunk + 6, '#b8b2a0');
        for (let y = 2; y < trunk + 4; y += 3 + (y % 2)) k.rect(-2 + (y % 3 ? 0 : 2), -y, 2, 1, '#3a3530');
      } else {
        k.rect(-Math.floor(tw / 2), -trunk - 4, tw, trunk + 4, C.wood1);
        k.rect(-Math.floor(tw / 2), -trunk - 4, 1, trunk + 4, C.wood3); k.rect(Math.ceil(tw / 2) - 1, -trunk - 4, 1, trunk + 4, C.wood0);
        k.rect(-Math.floor(tw / 2) - 2, -2, tw + 4, 2, C.wood1); k.px(-Math.floor(tw / 2) - 2, -2, C.wood2);
        k.px(0, -trunk + 2, C.wood0); k.px(-1, -trunk + 5, C.wood0);
      }
      const cy = -trunk - r * .82;
      // Three overlapping masses give a rounder, fuller silhouette than a single ellipse.
      canopyBlob(k, -r * .45 + (variant % 2), cy + r * .18, r * .66, tones, rnd);
      canopyBlob(k, r * .45, cy + r * .22, r * .64, tones, rnd);
      canopyBlob(k, (variant % 3) - 1, cy - r * .22, r * .78, tones, rnd);
      if (kind === 'fruit' || kind === 'orange') for (let i = 0; i < 4 + size * 2; i++) { const a = rnd() * 6.28, d = rnd() * r * .75; const x = Math.cos(a) * d, y = cy + Math.sin(a) * d * .8; k.rect(x, y, 2, 2, kind === 'orange' ? '#f09a2a' : C.red2); k.px(x, y, '#ffd9a0'); }
      if (kind === 'blossom') for (let i = 0; i < 6 + size * 3; i++) { const a = rnd() * 6.28, d = rnd() * r * .8; k.px(Math.cos(a) * d, cy + Math.sin(a) * d * .8, '#fff4f6'); }
    }, kind === 'autumn' ? '#3a1a12' : kind === 'blossom' ? '#4a2436' : '#14291c');
  };
  Props.tree = (k, x, y, kind = 'oak', size = 1, variant = 0) => {
    const r = kind === 'pine' ? 8 + size * 3 : [8, 11, 14, 18][Math.max(0, Math.min(3, size))];
    k.ellipse(x + 3, y + 1, r * .9, Math.max(2, r * .32), C.shadow);
    k.blit(Props.treeSprite(kind, size, variant), x, y);
  };
  Props.bush = (k, x, y, variant = 0, tones = 'oak') => {
    const s = P.sprite(`bush|${variant % 4}|${tones}`, 18, 12, 9, 11, q => {
      const t = TREE_TONES[tones] || TREE_TONES.oak, rnd = P.rng(50 + variant);
      q.ellipse(-3, -4, 5, 4, t[1]); q.ellipse(3, -4, 5, 4, t[1]); q.ellipse(0, -6, 5, 4, t[2]);
      q.ditherEllipse(2, -2, 6, 2, t[0]); q.ellipse(-2, -7, 3, 2, t[3]); q.px(-3, -8, t[4]); q.px(3, -5, t[3]);
      if (variant % 4 === 1) for (let i = 0; i < 4; i++) q.px(-5 + rnd() * 10, -8 + rnd() * 6, '#f0d27a');
      if (variant % 4 === 2) for (let i = 0; i < 4; i++) q.px(-5 + rnd() * 10, -8 + rnd() * 6, '#e98aa0');
    }, '#14291c');
    k.ellipse(x + 2, y, 8, 2, C.shadowSoft); k.blit(s, x, y);
  };
  Props.flower = (k, x, y, col = '#f2c14e') => { k.px(x, y + 1, C.leaf2); k.px(x, y + 2, C.leaf1); k.px(x - 1, y, col); k.px(x + 1, y, col); k.px(x, y - 1, col); k.px(x, y, '#fff3c0'); };
  Props.tuft = (k, x, y, dark = C.grass1, light = C.grass4) => { k.px(x, y, dark); k.px(x + 2, y, dark); k.px(x + 1, y - 1, light); k.px(x - 1, y - 1, dark); k.px(x + 3, y - 1, light); };
  Props.flowerBed = (k, x, y, w, h, cols = ['#f2c14e', '#e46c52', '#f6ecd0', '#c3a2c0'], seed = 1) => {
    k.rect(x - 1, y - 1, w + 2, h + 2, C.wood1); k.rect(x, y, w, h, C.dirt1); k.dither(x, y, w, h, C.dirt0, 1);
    const rnd = P.rng(seed);
    for (let yy = y + 2; yy < y + h - 1; yy += 3) for (let xx = x + 2 + (yy % 2); xx < x + w - 1; xx += 3) {
      k.px(xx, yy + 1, C.leaf2); k.px(xx, yy, cols[Math.floor(rnd() * cols.length)]);
    }
  };
  Props.hedge = (k, x, y, w, h = 8) => {
    k.rect(x + 2, y + h - 1, w, 3, C.shadow);
    k.rect(x, y, w, h, C.leaf1); k.rect(x, y, w, 2, C.leaf3); k.rect(x, y + h - 2, w, 2, C.leaf0);
    for (let i = 0; i < w; i += 3) { k.px(x + i, y + 1, C.leaf4); k.px(x + i + 1, y + 3 + (i % 2), C.leaf2); k.px(x + i + 2, y + h - 3, C.leaf0); }
    k.rect(x - 1, y + 1, 1, h - 2, C.leaf0); k.rect(x + w, y + 1, 1, h - 2, C.leaf0);
  };
  Props.rock = (k, x, y, size = 1, seed = 0) => {
    const w = 4 + size * 3, h = 3 + size * 2;
    k.ellipse(x + 1, y + 1, w * .6, 1.5, C.shadow);
    k.poly([[x - w / 2, y], [x - w / 2 + 1, y - h + 1], [x - 1, y - h], [x + w / 2 - 1, y - h + 2], [x + w / 2, y]], C.stone2);
    k.poly([[x - w / 2 + 1, y - 1], [x - w / 2 + 2, y - h + 1], [x - 1, y - h + 1], [x, y - 2]], C.stone3);
    k.px(x - w / 2 + 2, y - h + 1, C.stone4); k.rect(x - w / 2, y - 1, w, 1, C.stone1);
    if (seed % 3 === 0) k.px(x + 1, y - h + 2, C.leaf3);
  };

  /* ---------- Fences, walls and ground treatments ---------- */
  Props.fence = (k, x, y, len, vertical = false) => {
    if (vertical) {
      k.rect(x, y, 2, len, C.wood1); k.rect(x + 2, y, 1, len, C.wood0);
      for (let i = 0; i <= len; i += 10) { k.rect(x - 1, y + i - 6, 4, 8, C.wood2); k.px(x - 1, y + i - 6, C.wood4); }
      return;
    }
    k.rect(x + 1, y + 1, len, 1, C.shadow);
    k.rect(x, y - 6, len, 2, C.wood3); k.rect(x, y - 6, len, 1, C.wood4); k.rect(x, y - 3, len, 2, C.wood2);
    for (let i = 0; i <= len; i += 8) { k.rect(x + i, y - 8, 3, 9, C.wood2); k.px(x + i, y - 8, C.wood4); k.rect(x + i + 2, y - 7, 1, 8, C.wood1); }
  };
  Props.stoneWall = (k, x, y, w, h = 7, cap = C.stone4) => {
    k.rect(x + 2, y, w, 3, C.shadow);
    k.rect(x, y - h, w, h, C.stone2); k.rect(x, y - h - 2, w, 3, cap); k.rect(x, y - h - 2, w, 1, C.stone5);
    for (let row = 0; row < h; row += 3) { k.rect(x, y - h + row + 2, w, 1, C.stone1); for (let i = (row / 3 % 2) * 3; i < w; i += 6) k.px(x + i, y - h + row, C.stone1); }
  };
  Props.cobbles = (k, x, y, w, h, seed = 1, base = C.stone3) => {
    k.rect(x, y, w, h, base);
    const dark = S(base, -.18), lite = S(base, .18), rnd = P.rng(seed);
    for (let yy = 0; yy < h; yy += 4) { const off = (yy / 4) % 2 * 3; k.rect(x, y + yy, w, 1, dark); for (let xx = off; xx < w; xx += 6) { k.px(x + xx, y + yy + 1, dark); k.px(x + xx, y + yy + 2, dark); if (rnd() < .5) k.px(x + xx + 2, y + yy + 1, lite); } }
  };
  Props.planks = (k, x, y, w, h, base = C.wood3) => {
    k.rect(x, y, w, h, base); const d = S(base, -.25), l = S(base, .2);
    for (let yy = 0; yy < h; yy += 3) { k.rect(x, y + yy, w, 1, d); k.rect(x, y + yy + 1, w, 1, l); for (let xx = (yy * 5) % 11; xx < w; xx += 11) k.px(x + xx, y + yy + 2, d); }
  };
  Props.tiles = (k, x, y, w, h, a = C.stone4, b = C.stone3, size = 4) => {
    for (let yy = 0; yy < h; yy += size) for (let xx = 0; xx < w; xx += size) k.rect(x + xx, y + yy, Math.min(size, w - xx), Math.min(size, h - yy), ((xx + yy) / size) % 2 ? a : b);
  };

  /* ---------- Architecture ---------- */
  function wallTexture(k, x, top, w, h, wall, mat) {
    const d = S(wall, -.14), dd = S(wall, -.28), l = S(wall, .16);
    k.rect(x, top, w, h, wall);
    if (mat === 'brick') for (let yy = 0; yy < h - 4; yy += 3) { k.rect(x, top + yy + 2, w, 1, d); for (let xx = (yy / 3 % 2) * 3; xx < w; xx += 6) k.px(x + xx, top + yy, d), k.px(x + xx, top + yy + 1, d); }
    else if (mat === 'stone') for (let yy = 0; yy < h - 4; yy += 5) { k.rect(x, top + yy + 4, w, 1, dd); for (let xx = (yy / 5 % 2) * 4; xx < w; xx += 8) { k.rect(x + xx, top + yy, 1, 4, dd); k.rect(x + xx + 1, top + yy, 3, 1, l); } }
    else if (mat === 'planks') for (let xx = 2; xx < w; xx += 4) { k.rect(x + xx, top, 1, h, d); k.px(x + xx + 1, top + (xx * 7) % Math.max(1, h - 4), dd); }
    else if (mat === 'timber') { for (let xx = 0; xx < w; xx += 14) k.rect(x + xx, top, 2, h, C.wood1); k.rect(x, top + Math.floor(h * .45), w, 2, C.wood1); for (let xx = 0; xx + 14 <= w; xx += 14) k.line(x + xx + 2, top + Math.floor(h * .45), x + xx + 13, top + 2, C.wood1); k.rect(x, top, w, 2, C.wood1); }
    else for (let i = 0; i < w * h / 40; i++) k.px(x + P.hash(i, x) * w, top + P.hash(top, i) * (h - 5), d);
    k.rect(x, top, 1, h, l); k.rect(x + w - 2, top, 2, h, d);
  }
  Props.window = (k, x, y, w = 7, h = 8, o = {}) => {
    const frame = o.frame || C.wood1, glass = o.lit ? C.glassLit : (o.glass || C.glass);
    if (o.shutters) { k.rect(x - 3, y, 2, h, o.shutters); k.rect(x + w + 1, y, 2, h, o.shutters); k.px(x - 3, y + 2, S(o.shutters, -.3)); k.px(x + w + 2, y + 2, S(o.shutters, -.3)); }
    k.rect(x - 1, y - 1, w + 2, h + 2, frame);
    if (o.arch) { k.rect(x, y - 1, w, 1, frame); k.rect(x + 1, y - 2, w - 2, 1, frame); }
    k.rect(x, y, w, h, glass); k.rect(x, y + h - 2, w, 2, o.lit ? '#f0b862' : C.glassDark);
    k.px(x, y, C.white); k.px(x + 1, y, o.lit ? '#fff4c4' : '#d8f0f0'); k.px(x, y + 1, o.lit ? '#fff4c4' : '#d8f0f0');
    k.rect(x + Math.floor(w / 2), y, 1, h, frame); k.rect(x, y + Math.floor(h / 2), w, 1, frame);
    k.rect(x - 2, y + h + 1, w + 4, 1, C.stone4); k.rect(x - 2, y + h + 2, w + 4, 1, C.stone1);
    if (o.box) { k.rect(x - 1, y + h + 1, w + 2, 2, C.wood2); for (let i = 0; i < w + 2; i += 2) k.px(x - 1 + i, y + h, i % 4 ? o.box : '#fff0c0'), k.px(x + i, y + h - 1 + (i % 3 ? 1 : 0), C.leaf3); }
  };
  Props.door = (k, x, y, w = 9, h = 13, col = C.wood3, o = {}) => {
    // x, y: bottom-left at the threshold.
    k.rect(x - 2, y - h - 2, w + 4, h + 2, o.frame || C.stone2); k.rect(x - 2, y - h - 2, w + 4, 1, C.stone4);
    k.rect(x - 1, y - h - 1, w + 2, h + 1, C.wood0);
    k.rect(x, y - h, w, h, col);
    for (let xx = 2; xx < w; xx += 3) k.rect(x + xx, y - h, 1, h, S(col, -.25));
    k.rect(x, y - h, 1, h, S(col, .2)); k.rect(x, y - h + 3, w, 1, S(col, -.3)); k.rect(x, y - 4, w, 1, S(col, -.3));
    k.px(x + w - 2, y - Math.floor(h / 2), C.gold3);
    if (o.arch) { k.rect(x, y - h - 1, w, 1, col); k.rect(x + 1, y - h - 2, w - 2, 1, col); }
    if (o.open) { k.rect(x + 1, y - h + 1, w - 2, h - 1, '#1e1814'); k.rect(x + 1, y - 3, w - 2, 3, '#3a2c20'); }
    k.rect(x - 3, y, w + 6, 2, C.stone3); k.rect(x - 3, y + 1, w + 6, 1, C.stone1);
  };
  function roofTexture(k, pts, roof, top, o = {}) {
    const d = S(roof, -.22), dd = S(roof, -.4), l = S(roof, .16), ll = S(roof, .3), step = o.step || 3;
    let bottom = -Infinity; for (const p of pts) bottom = Math.max(bottom, p[1]);
    k.polyTex(pts, (x, y) => {
      const r = y - top;
      if (r < 2) return r < 1 ? ll : l;
      if (y >= bottom - 2) return dd;
      const row = Math.floor(r / step);
      if (r % step === 0) return d;
      if ((x + row * 2) % (step * 2) === 0) return d;
      return (x + y) % 17 === 0 ? l : roof;
    });
  }
  Props.building = (k, x, y, o) => {
    const w = o.w, h = o.h, top = y - h, rh = o.roofH ?? Math.round(Math.min(26, w * .38)), wall = o.wall || C.plaster2, roof = o.roof || C.terra2, style = o.style || 'gable', ov = o.overhang ?? 3;
    // Cast shadow to the lower right.
    k.poly([[x + w, y + 1], [x + w + 7, y - 5], [x + w + 7, top - rh + 8], [x + w, top - rh + 2]], C.shadow);
    k.rect(x + 2, y, w + 5, 3, C.shadow);
    wallTexture(k, x, top, w, h, wall, o.mat || 'plaster');
    // Stone foundation course.
    const fh = o.foundation ?? 4; if (fh) { k.rect(x - 1, y - fh, w + 2, fh, C.stone2); k.rect(x - 1, y - fh, w + 2, 1, C.stone4); for (let xx = 0; xx < w; xx += 5) k.px(x + xx + ((xx / 5) % 2 ? 2 : 0), y - 2, C.stone1); k.rect(x - 1, y - 1, w + 2, 1, C.stone1); }
    (o.windows || []).forEach(wi => Props.window(k, x + wi.x, top + wi.y, wi.w || 7, wi.h || 8, { lit: wi.lit, shutters: wi.shutters ?? o.shutters, arch: wi.arch, box: wi.box, frame: wi.frame }));
    if (o.door) { const dw = o.door.w || 9; Props.door(k, x + (o.door.x ?? Math.floor((w - dw) / 2)), y, dw, o.door.h || 13, o.door.color || C.wood3, o.door); }
    if (style === 'gable') {
      const pts = [[x - ov, top + 2], [x + w + ov, top + 2], [x + w + ov - 3, top - rh], [x - ov + 3, top - rh]];
      k.rect(x, top + 2, w, 2, S(wall, -.35)); k.dither(x, top + 4, w, 2, S(wall, -.35));
      roofTexture(k, pts, roof, top - rh, o);
      // Hipped ends: lit left, shaded right.
      k.poly([[x - ov, top + 2], [x - ov + 3, top - rh], [x - ov + 6, top - rh], [x - ov + 3, top + 2]], S(roof, .22));
      k.poly([[x + w + ov - 3, top + 2], [x + w + ov - 6, top - rh], [x + w + ov - 3, top - rh], [x + w + ov, top + 2]], S(roof, -.3));
      k.rect(x - ov + 3, top - rh - 1, w + ov * 2 - 6, 1, S(roof, -.45)); k.rect(x - ov + 4, top - rh, w + ov * 2 - 8, 1, S(roof, .35));
    } else if (style === 'peak') {
      const depth = o.depth ?? Math.round(rh * .8), cx = x + w / 2;
      k.poly([[x - ov, top + 2], [cx, top - rh], [cx, top - rh - depth], [x - ov, top + 2 - depth]], S(roof, .08));
      k.poly([[cx, top - rh], [x + w + ov, top + 2], [x + w + ov, top + 2 - depth], [cx, top - rh - depth]], S(roof, -.2));
      roofTexture(k, [[x - ov, top + 2], [cx, top - rh], [cx, top - rh - depth], [x - ov, top + 2 - depth]], S(roof, .08), top - rh - depth, o);
      roofTexture(k, [[cx, top - rh], [x + w + ov, top + 2], [x + w + ov, top + 2 - depth], [cx, top - rh - depth]], S(roof, -.2), top - rh - depth, o);
      k.line(cx, top - rh - depth, cx, top - rh, S(roof, .4));
      k.poly([[x, top + 1], [cx, top - rh + 3], [x + w, top + 1]], wall); k.line(x, top + 1, cx, top - rh + 3, S(wall, -.3)); k.line(cx, top - rh + 3, x + w, top + 1, S(wall, -.3));
      k.line(x - ov, top + 2, cx, top - rh, S(roof, -.45), 2); k.line(cx, top - rh, x + w + ov, top + 2, S(roof, -.45), 2);
      if (o.vent !== false && w > 20) { k.rect(cx - 2, top - rh * .5, 4, 4, C.wood0); k.rect(cx - 1, top - rh * .5 + 1, 2, 2, C.glassDark); }
    } else if (style === 'flat') {
      k.rect(x - 2, top - 4, w + 4, 5, S(wall, -.12)); k.rect(x - 2, top - 4, w + 4, 1, S(wall, .25));
      if (o.crenel) for (let xx = x - 2; xx < x + w + 2; xx += 6) { k.rect(xx, top - 8, 4, 4, S(wall, -.05)); k.rect(xx, top - 8, 4, 1, S(wall, .25)); k.px(xx + 3, top - 7, S(wall, -.3)); }
    } else if (style === 'cone') {
      const cx = x + w / 2;
      k.poly([[x - ov, top + 2], [cx, top - rh], [x + w + ov, top + 2]], roof);
      k.polyTex([[x - ov, top + 2], [cx, top - rh], [x + w + ov, top + 2]], (xx, yy) => { const r = yy - (top - rh); if (yy >= top) return S(roof, -.45); if (xx < cx - 1) return r % 3 ? (xx % 4 === 0 ? S(roof, -.1) : S(roof, .12)) : S(roof, -.15); return r % 3 ? S(roof, -.2) : S(roof, -.35); });
      k.rect(cx - 1, top - rh - 4, 2, 5, C.gold1); k.px(cx - 1, top - rh - 5, C.gold3);
    } else if (style === 'dome') {
      const cx = x + w / 2; k.ellipse(cx, top, w / 2 + 1, rh, S(roof, -.3)); k.ellipse(cx, top, w / 2, rh - 1, roof); k.ellipse(cx - w * .15, top - rh * .35, w * .22, rh * .4, S(roof, .25)); k.rect(x - 2, top, w + 4, 3, S(wall, -.2));
    }
    if (o.chimney) { const cx = x + o.chimney.x, ch = o.chimney.h || 10, cy = top - rh + (o.chimney.y ?? 4); k.rect(cx, cy - ch, 6, ch, C.stone2); k.rect(cx, cy - ch, 2, ch, C.stone3); k.rect(cx - 1, cy - ch - 2, 8, 2, C.stone4); k.rect(cx + 1, cy - ch - 1, 4, 1, C.stone0); }
    if (o.sign) Props.hangingSign(k, x + (o.sign.x ?? w - 4), top + (o.sign.y ?? 8), o.sign.text || '', o.sign.color || C.teal2, o.sign.icon);
    return { top, roofTop: top - rh };
  };
  Props.hangingSign = (k, x, y, text, col = C.teal2) => {
    const w = Math.max(9, P.textWidth(text) + 4);
    k.rect(x, y, w, 1, C.wood1); k.rect(x, y - 1, 1, 3, C.wood1);
    k.px(x + 2, y + 1, C.stone1); k.px(x + w - 3, y + 1, C.stone1);
    k.rect(x, y + 2, w, 8, C.wood1); k.rect(x + 1, y + 3, w - 2, 6, col); k.rect(x + 1, y + 3, w - 2, 1, S(col, .25));
    if (text) k.text(text, x + 2, y + 4, C.paper);
  };
  Props.tower = (k, x, y, o) => Props.building(k, x, y, { style: 'cone', mat: 'stone', wall: C.stone3, roof: C.slate2, roofH: Math.round(o.w * .9), ...o });
  Props.awning = (k, x, y, w, a = C.red2, b = C.paper, depth = 6) => {
    k.rect(x + 2, y + depth + 1, w, 2, C.shadow);
    for (let i = 0; i < w; i += 4) { k.rect(x + i, y, Math.min(4, w - i), depth, (i / 4) % 2 ? b : a); k.rect(x + i, y, Math.min(4, w - i), 1, S((i / 4) % 2 ? b : a, .25)); }
    for (let i = 0; i < w; i += 4) { const col = (i / 4) % 2 ? b : a; k.rect(x + i, y + depth, Math.min(4, w - i), 1, S(col, -.25)); k.px(x + i + 1, y + depth + 1, S(col, -.25)); k.px(x + i + 2, y + depth + 1, S(col, -.25)); }
  };
  Props.stall = (k, x, y, w, col = C.red2, goods = []) => {
    // x, y: bottom-left; a market stall with awning and goods on the counter.
    k.rect(x + 2, y, w + 3, 3, C.shadow);
    k.rect(x, y - 22, 2, 22, C.wood1); k.rect(x + w - 2, y - 22, 2, 22, C.wood1);
    k.rect(x - 1, y - 10, w + 2, 10, C.wood2); k.rect(x - 1, y - 10, w + 2, 2, C.wood4); for (let i = 3; i < w; i += 5) k.rect(x + i, y - 8, 1, 8, C.wood1);
    goods.forEach((g, i) => { const gx = x + 2 + i * Math.floor((w - 4) / Math.max(1, goods.length)); k.ellipse(gx + 2, y - 12, 2, 2, g); k.px(gx + 1, y - 13, P.shade(g, .4)); k.ellipse(gx + 5, y - 12, 2, 1, P.shade(g, -.2)); });
    Props.awning(k, x - 3, y - 29, w + 6, col, C.paper, 6);
  };
  Props.crate = (k, x, y, s = 9) => { k.rect(x + 2, y + s - 1, s, 2, C.shadow); k.rect(x, y, s, s, C.wood3); k.rect(x, y, s, 1, C.wood5); k.rect(x, y, 1, s, C.wood4); k.rect(x + s - 1, y, 1, s, C.wood1); k.rect(x, y + s - 1, s, 1, C.wood1); k.line(x + 1, y + s - 2, x + s - 2, y + 1, C.wood2); k.rect(x + 1, y + Math.floor(s / 2), s - 2, 1, C.wood2); };
  Props.barrel = (k, x, y) => { k.ellipse(x + 5, y + 11, 5, 2, C.shadow); k.rect(x + 1, y, 8, 11, C.wood2); k.rect(x, y + 2, 10, 7, C.wood2); k.rect(x + 2, y, 2, 11, C.wood3); k.rect(x + 7, y, 1, 11, C.wood1); k.rect(x, y + 2, 10, 1, C.stone1); k.rect(x, y + 8, 10, 1, C.stone1); k.rect(x + 1, y, 8, 1, C.wood4); k.ellipse(x + 5, y, 4, 1, C.wood1); };
  Props.sack = (k, x, y, col = C.plaster1) => { k.ellipse(x + 4, y + 7, 5, 2, C.shadow); k.ellipse(x + 4, y + 3, 4, 4, col); k.rect(x + 2, y - 2, 4, 3, S(col, -.15)); k.rect(x + 1, y - 1, 6, 1, C.wood1); k.px(x + 2, y + 1, S(col, .3)); k.rect(x + 5, y + 3, 2, 3, S(col, -.2)); };
  Props.pot = (k, x, y, plant = true) => { k.rect(x + 1, y + 6, 6, 1, C.shadow); k.rect(x, y, 7, 6, C.terra2); k.rect(x - 1, y, 9, 2, C.terra3); k.rect(x + 5, y + 2, 1, 4, C.terra1); if (plant) { k.ellipse(x + 3, y - 3, 4, 3, C.leaf2); k.px(x + 2, y - 5, C.leaf4); k.px(x + 4, y - 4, '#f2c14e'); } };
  Props.lamp = (k, x, y, lit = true) => {
    k.ellipse(x + 1, y, 3, 1, C.shadow); k.rect(x - 1, y - 1, 4, 2, C.stone1); k.rect(x, y - 16, 2, 16, C.slate1); k.px(x, y - 16, C.slate3);
    k.rect(x - 2, y - 21, 6, 5, C.slate0); k.rect(x - 1, y - 20, 4, 3, lit ? C.glassLit : C.glassDark); k.rect(x - 3, y - 22, 8, 1, C.slate1); k.px(x, y - 23, C.slate1);
  };
  Props.bench = (k, x, y, w = 14) => { k.rect(x + 1, y + 1, w, 1, C.shadow); k.rect(x, y - 4, w, 2, C.wood3); k.rect(x, y - 4, w, 1, C.wood4); k.rect(x, y - 8, w, 2, C.wood2); k.rect(x + 1, y - 2, 1, 3, C.wood1); k.rect(x + w - 2, y - 2, 1, 3, C.wood1); k.rect(x + 1, y - 8, 1, 4, C.wood1); k.rect(x + w - 2, y - 8, 1, 4, C.wood1); };
  Props.table = (k, x, y, w = 18, h = 8, top = C.wood3) => { k.rect(x + 2, y + 1, w, 2, C.shadow); k.rect(x, y - h, w, 4, top); k.rect(x, y - h, w, 1, S(top, .25)); k.rect(x, y - h + 3, w, 1, S(top, -.3)); k.rect(x + 1, y - h + 4, 2, h - 4, C.wood1); k.rect(x + w - 3, y - h + 4, 2, h - 4, C.wood1); };
  Props.sign = (k, x, y, text, col = C.wood3) => { const w = Math.max(10, P.textWidth(text) + 4); k.rect(x - 1, y - 12, 2, 12, C.wood1); k.rect(x - w / 2, y - 18, w, 8, C.wood1); k.rect(x - w / 2 + 1, y - 17, w - 2, 6, col); k.rect(x - w / 2 + 1, y - 17, w - 2, 1, S(col, .25)); if (text) k.text(text, x - w / 2 + 2, y - 16, C.paper); };
  Props.well = (k, x, y) => {
    k.ellipse(x + 2, y + 2, 12, 4, C.shadow); k.ellipse(x, y - 3, 11, 5, C.stone1); k.rect(x - 11, y - 8, 22, 6, C.stone2); for (let i = -10; i < 11; i += 5) k.rect(x + i, y - 8, 1, 6, C.stone1); k.ellipse(x, y - 8, 11, 4, C.stone3); k.ellipse(x, y - 8, 8, 2, C.water0);
    k.rect(x - 11, y - 26, 2, 18, C.wood1); k.rect(x + 9, y - 26, 2, 18, C.wood1); k.poly([[x - 14, y - 25], [x, y - 33], [x + 14, y - 25]], C.terra2); k.rect(x - 14, y - 26, 28, 2, C.terra1); k.rect(x - 9, y - 22, 18, 2, C.wood2); k.rect(x - 1, y - 20, 1, 8, C.stone0); k.rect(x - 2, y - 13, 3, 3, C.wood2);
  };
  Props.cart = (k, x, y, load = null) => {
    k.ellipse(x + 10, y + 1, 13, 2, C.shadow); k.rect(x, y - 9, 22, 6, C.wood2); k.rect(x, y - 9, 22, 1, C.wood4); k.rect(x, y - 4, 22, 1, C.wood1); k.line(x + 22, y - 6, x + 32, y - 3, C.wood1, 2);
    if (load) load(k, x, y - 9);
    k.circle(x + 6, y - 2, 4, C.wood1); k.circle(x + 6, y - 2, 3, C.wood3); k.px(x + 6, y - 2, C.wood0); k.line(x + 3, y - 2, x + 9, y - 2, C.wood1); k.line(x + 6, y - 5, x + 6, y + 1, C.wood1);
  };
  Props.pond = (k, x, y, rx, ry) => {
    k.ellipse(x, y, rx + 3, ry + 2, C.dirt2); k.ellipse(x, y, rx + 1, ry + 1, C.dirt1); k.ellipse(x, y, rx, ry, C.water1); k.ellipse(x - 1, y - 1, rx - 2, ry - 2, C.water2); k.ellipse(x - rx * .25, y - ry * .3, rx * .45, ry * .3, C.water3);
    for (let i = 0; i < 4; i++) k.rect(x - rx * .5 + i * rx * .25, y + ry * .3 - (i % 2) * 2, 3, 1, C.water4);
    for (const s of [-1, 1]) { k.rect(x + s * (rx - 2), y - 4, 1, 6, C.leaf2); k.rect(x + s * (rx - 4), y - 6, 1, 7, C.leaf3); k.rect(x + s * (rx - 2), y - 6, 1, 2, C.wood2); }
    k.ellipse(x + rx * .3, y + ry * .1, 3, 1, C.leaf3); k.px(x + rx * .3, y + ry * .1 - 1, '#ffc6d8');
  };
  Props.logPile = (k, x, y, n = 4) => {
    k.rect(x + 2, y, n * 6 + 2, 2, C.shadow);
    for (let row = 0; row < 3; row++) for (let i = 0; i < n - row; i++) { const cx = x + 3 + i * 6 + row * 3, cy = y - 3 - row * 5; k.circle(cx, cy, 3, C.wood1); k.circle(cx, cy, 2, C.wood4); k.px(cx, cy, C.wood2); }
  };
  Props.statue = (k, x, y, col = C.stone4) => {
    k.rect(x - 8, y - 6, 16, 6, C.stone2); k.rect(x - 9, y - 7, 18, 2, C.stone4); k.rect(x - 7, y - 1, 14, 1, C.stone1);
    k.rect(x - 3, y - 20, 6, 13, col); k.rect(x - 3, y - 20, 2, 13, S(col, .2)); k.rect(x + 2, y - 19, 1, 12, S(col, -.25)); k.circle(x, y - 23, 3, col); k.px(x - 1, y - 24, S(col, .3)); k.line(x + 3, y - 19, x + 6, y - 27, col, 2);
  };
  Props.banner = (k, x, y, col, t = 0, h = 14) => {
    k.rect(x, y - h - 10, 1, h + 10, C.wood1); k.px(x, y - h - 11, C.gold2);
    for (let i = 0; i < 8; i++) { const wy = Math.round(Math.sin(t * 3 - i * .6) * 1.5); k.rect(x + 1 + i, y - h - 9 + wy, 1, h - (i > 5 ? (i - 5) * 2 : 0), i % 3 === 0 ? S(col, .15) : col); }
  };

  /* ---------- Small animated helpers (call from animate) ---------- */
  Props.smoke = (k, x, y, t, n = 4, col = '#dcd8cc') => {
    for (let i = 0; i < n; i++) { const q = (t * .45 + i / n) % 1, r = 1 + q * 4; k.alpha((1 - q) * .75, () => k.circle(x + Math.sin(q * 5 + i) * 3 + q * 6, y - q * 22, r, col)); }
  };
  Props.sparkle = (k, x, y, t, col = C.gold4) => { const f = Math.floor(t * 8) % 4; if (f === 3) return; k.px(x, y, col); if (f > 0) { k.px(x - 1, y, col); k.px(x + 1, y, col); k.px(x, y - 1, col); k.px(x, y + 1, col); } if (f === 2) { k.px(x - 2, y, col); k.px(x + 2, y, col); k.px(x, y - 2, col); k.px(x, y + 2, col); } };
  Props.bird = (k, x, y, t, col = '#f4ecd6') => { const up = Math.floor(t * 8) % 2; k.px(x, y, col); k.px(x - 1, y - up, col); k.px(x + 1, y - up, col); k.px(x - 2, y - up * 2 + 1, col); k.px(x + 2, y - up * 2 + 1, col); };
  Props.butterfly = (k, x, y, t, col = '#f2c14e') => { const open = Math.floor(t * 10) % 2; k.px(x, y, C.ink); if (open) { k.px(x - 1, y - 1, col); k.px(x + 1, y - 1, col); k.px(x - 1, y, col); k.px(x + 1, y, col); } else { k.px(x - 1, y - 1, col); k.px(x + 1, y - 1, col); } };
  Props.windowGlow = (k, x, y, w, h, t) => { const a = .25 + Math.sin(t * 3 + x) * .08; k.alpha(a, () => k.rect(x - 2, y - 2, w + 4, h + 4, C.glassLit)); };
  Props.fire = (k, x, y, t, s = 1) => {
    const f = Math.floor(t * 12) % 3;
    k.ellipse(x, y - 2 * s, 4 * s, 3 * s, C.red2); k.poly([[x - 4 * s, y - 2], [x - 1, y - (9 + f) * s], [x + 1, y - 5 * s], [x + 3 * s, y - (8 - f) * s], [x + 4 * s, y - 2]], '#f07a32');
    k.poly([[x - 2 * s, y - 2], [x, y - (6 + f) * s], [x + 2 * s, y - 2]], C.gold3); k.px(x, y - 2 * s, C.gold4);
  };

  window.Props = Props;
})();
