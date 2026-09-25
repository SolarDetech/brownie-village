/* Crisp pixel primitives. World units are art pixels; every call lands on whole pixels.
   Shapes are filled with integer spans (no anti-aliasing), so the framebuffer stays true pixel art. */
(() => {
  const P = {};

  // One shared palette keeps every district in the same visual family. Light comes from the top left.
  P.C = {
    ink:'#2a211c', inkSoft:'#40342c', shadow:'#1d2a2248', shadowSoft:'#1d2a2230',
    grass0:'#3f6a3c', grass1:'#4f7d45', grass2:'#62924f', grass3:'#79a75b', grass4:'#97bf6c', grass5:'#b7d17f',
    dirt0:'#6b4e36', dirt1:'#8a6a48', dirt2:'#a8845c', dirt3:'#c4a174', dirt4:'#ddc093', dirt5:'#eed8ad',
    stone0:'#4d4a47', stone1:'#6d6861', stone2:'#8f887c', stone3:'#b3aa96', stone4:'#d4cab1', stone5:'#eee4c8',
    wood0:'#3d281b', wood1:'#5c3d27', wood2:'#7d5534', wood3:'#a2733f', wood4:'#c79758', wood5:'#e3bd7c',
    plaster0:'#a8916a', plaster1:'#c9b388', plaster2:'#e3d2a6', plaster3:'#f3e6c1',
    terra0:'#5e2a24', terra1:'#84392d', terra2:'#a84d38', terra3:'#c86a48', terra4:'#e28f62',
    teal0:'#1f3f45', teal1:'#2c5a5c', teal2:'#3d7a74', teal3:'#58998c', teal4:'#80bba6',
    slate0:'#2c3140', slate1:'#40485c', slate2:'#586379', slate3:'#76819a', slate4:'#9ea8bd',
    plum0:'#3b2640', plum1:'#583a5e', plum2:'#7a5580', plum3:'#9d78a0', plum4:'#c3a2c0',
    water0:'#224a5c', water1:'#2d6276', water2:'#3a7d8e', water3:'#529ca5', water4:'#7cc0bd', water5:'#b6e2d6', foam:'#e6f6ec',
    gold0:'#8a5f1e', gold1:'#b98a2c', gold2:'#e0b44a', gold3:'#f5d77e', gold4:'#fff1bf',
    red0:'#6e1f1f', red1:'#9a2f2a', red2:'#c4483a', red3:'#e46c52',
    leaf0:'#23462f', leaf1:'#2f5c37', leaf2:'#417a41', leaf3:'#5a9a4a', leaf4:'#7fbb5a', leaf5:'#a9d670',
    skin0:'#8a5236', skin1:'#b8764e', skin2:'#dca277', skin3:'#f3c99c', skin4:'#ffe3c0',
    white:'#fffaf0', paper:'#f6ecd0', paper2:'#dccfa8', glass:'#8fc7cf', glassLit:'#ffe29a', glassDark:'#3a4f58',
    // Agent state colours. Each state also has a distinct icon and motion, so colour is never the only cue.
    working:'#56c157', idle:'#8aa7d8', waiting:'#f4b73a', error:'#ec5a45', off:'#5f6a8e'
  };

  // Deterministic randomness (no Math.random anywhere in the art).
  P.rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  P.hash = (x, y = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + 17.3) * 43758.5453; return n - Math.floor(n); };

  // Colour helpers, memoised: shade('#abc', -0.2) darkens, positive values lighten.
  const shadeMemo = new Map();
  function toRgb(hex) { const h = hex.replace('#', ''); const s = h.length === 3 ? h.split('').map(x => x + x).join('') : h.slice(0, 6); return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16)); }
  const toHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  P.shade = (hex, f) => { const key = hex + f; let v = shadeMemo.get(key); if (!v) { const c = toRgb(hex); v = toHex(c.map(x => f < 0 ? x * (1 + f) : x + (255 - x) * f)); shadeMemo.set(key, v); } return v; };
  P.mix = (a, b, t) => { const key = a + b + t; let v = shadeMemo.get(key); if (!v) { const x = toRgb(a), y = toRgb(b); v = toHex(x.map((q, i) => q + (y[i] - q) * t)); shadeMemo.set(key, v); } return v; };
  P.alpha = (hex, a) => hex.slice(0, 7) + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

  // Tiny 3x5 pixel font for signs, numbers and banners.
  const FONT = {
    A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
    0:'111101101101111',1:'010110010010111',2:'110001010100111',3:'110001010001110',4:'101101111001001',5:'111100110001110',6:'011100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001110',
    '-':'000000111000000','+':'000010111010000','!':'010010010000010','?':'110001010000010','.':'000000000000010',',':'000000000010100',':':'000010000010000','/':'001001010100100','·':'000000010000000',"'":'010010000000000','&':'010101010101011',' ':'000000000000000'
  };
  P.textWidth = (s, scale = 1) => s.length * 4 * scale - scale;

  const patterns = new Map();

  function kit(c) {
    const R = Math.round;
    const rect = (x, y, w, h, col) => { w = R(w); h = R(h); if (w <= 0 || h <= 0) return; c.fillStyle = col; c.fillRect(R(x), R(y), w, h); };
    const px = (x, y, col) => { c.fillStyle = col; c.fillRect(R(x), R(y), 1, 1); };
    function line(x0, y0, x1, y1, col, t = 1) {
      x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); c.fillStyle = col;
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, o = Math.floor(t / 2);
      let err = dx + dy;
      for (let guard = 0; guard < 4000; guard++) { c.fillRect(x0 - o, y0 - o, t, t); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    }
    const path = (pts, col, t = 1) => { for (let i = 1; i < pts.length; i++) line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col, t); };
    // Rows of a filled ellipse; callback receives (y, x0, width).
    function ellipseRows(cx, cy, rx, ry, cb) {
      cx = R(cx); cy = R(cy); const Ry = Math.max(0, R(ry));
      for (let dy = -Ry; dy <= Ry; dy++) { const f = 1 - (dy / (ry + .5)) ** 2; if (f < 0) continue; const hw = Math.floor((rx + .5) * Math.sqrt(f)); cb(cy + dy, cx - hw, hw * 2 + 1); }
    }
    const ellipse = (cx, cy, rx, ry, col) => { if (rx < 0 || ry < 0) return; c.fillStyle = col; ellipseRows(cx, cy, rx, ry, (y, x, w) => c.fillRect(x, y, w, 1)); };
    const circle = (cx, cy, r, col) => ellipse(cx, cy, r, r, col);
    function ring(cx, cy, rx, ry, col, step = 1) {
      c.fillStyle = col; const n = Math.max(12, Math.ceil((rx + ry) * 3.3)); let lx = null, ly = null;
      for (let i = 0; i < n; i += step) { const a = i / n * Math.PI * 2, x = R(cx + Math.cos(a) * rx), y = R(cy + Math.sin(a) * ry); if (x !== lx || y !== ly) c.fillRect(x, y, 1, 1); lx = x; ly = y; }
    }
    // Scanline polygon fill with integer spans.
    function spans(pts, cb) {
      let minY = Infinity, maxY = -Infinity; for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
      minY = Math.floor(minY); maxY = Math.ceil(maxY); const n = pts.length, xs = [];
      for (let y = minY; y < maxY; y++) {
        const sy = y + .5; xs.length = 0;
        for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
        xs.sort((a, b) => a - b);
        for (let j = 0; j + 1 < xs.length; j += 2) { const x0 = R(xs[j]), x1 = R(xs[j + 1]); if (x1 > x0) cb(y, x0, x1); }
      }
    }
    const poly = (pts, col) => { c.fillStyle = col; spans(pts, (y, x0, x1) => c.fillRect(x0, y, x1 - x0, 1)); };
    // Per-pixel texture inside a polygon, run-length merged. Use for static paint only.
    function polyTex(pts, fn) {
      spans(pts, (y, x0, x1) => { let run = x0, col = fn(x0, y); for (let x = x0 + 1; x <= x1; x++) { const nc = x < x1 ? fn(x, y) : null; if (nc !== col) { if (col) { c.fillStyle = col; c.fillRect(run, y, x - run, 1); } run = x; col = nc; } } });
    }
    const rectTex = (x, y, w, h, fn) => polyTex([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fn);
    // Checkerboard dithering uses cached 2x2 patterns (aligned to the art-pixel grid).
    function pat(col, kind = 0) {
      const key = col + kind; let p = patterns.get(key);
      if (!p) { const cv = document.createElement('canvas'); cv.width = cv.height = 4; const q = cv.getContext('2d'); q.fillStyle = col;
        const cells = kind === 0 ? [[0,0],[2,0],[1,1],[3,1],[0,2],[2,2],[1,3],[3,3]] : kind === 1 ? [[0,0],[2,2]] : [[0,0],[2,0],[0,2],[2,2],[1,1],[3,1],[1,3],[3,3],[1,0],[3,2]];
        for (const [x, y] of cells) q.fillRect(x, y, 1, 1); p = c.createPattern(cv, 'repeat'); patterns.set(key, p); }
      return p;
    }
    const dither = (x, y, w, h, col, kind = 0) => { c.fillStyle = pat(col, kind); c.fillRect(R(x), R(y), R(w), R(h)); };
    const ditherPoly = (pts, col, kind = 0) => { c.fillStyle = pat(col, kind); spans(pts, (y, x0, x1) => c.fillRect(x0, y, x1 - x0, 1)); };
    const ditherEllipse = (cx, cy, rx, ry, col, kind = 0) => { c.fillStyle = pat(col, kind); ellipseRows(cx, cy, rx, ry, (y, x, w) => c.fillRect(x, y, w, 1)); };
    const shadow = (cx, cy, rx, ry, col = P.C.shadow) => ellipse(cx, cy, rx, ry, col);
    function text(str, x, y, col, scale = 1) {
      c.fillStyle = col; str = String(str).toUpperCase(); let xx = R(x);
      for (const ch of str) { const g = FONT[ch] || FONT[' ']; for (let i = 0; i < 15; i++) if (g[i] === '1') c.fillRect(xx + (i % 3) * scale, R(y) + Math.floor(i / 3) * scale, scale, scale); xx += 4 * scale; }
    }
    const textCenter = (str, x, y, col, scale = 1) => text(str, x - Math.floor(P.textWidth(String(str), scale) / 2), y, col, scale);
    // Outlined text: readable on any background.
    function textBold(str, x, y, col, outline = P.C.ink, scale = 1, center = true) {
      const X = center ? x - Math.floor(P.textWidth(String(str), scale) / 2) : x;
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]]) text(str, X + dx, y + dy, outline, scale);
      text(str, X, y, col, scale);
    }
    // Blit a cached sprite so its anchor lands on (x, y). flip mirrors it horizontally around the anchor.
    function blit(s, x, y, flip = false, alpha = 1) {
      if (!s) return; x = R(x); y = R(y); const X0 = flip ? x + 2 + s.ox - s.canvas.width : x - s.ox - 1, Y0 = y - s.oy - 1;
      if (alpha < 1) { c.save(); c.globalAlpha *= alpha; }
      if (flip) { c.save(); c.scale(-1, 1); c.drawImage(s.canvas, -(X0 + s.canvas.width), Y0); c.restore(); } else c.drawImage(s.canvas, X0, Y0);
      if (alpha < 1) c.restore();
    }
    const at = (x, y, fn) => { c.save(); c.translate(R(x), R(y)); fn(); c.restore(); };
    const alpha = (a, fn) => { c.save(); c.globalAlpha *= a; fn(); c.restore(); };
    return { c, rect, px, line, path, ellipse, circle, ring, spans, poly, polyTex, rectTex, dither, ditherPoly, ditherEllipse, shadow, text, textCenter, textBold, blit, at, alpha, C: P.C, P };
  }
  P.kit = kit;

  // Sprite cache: draw once with an automatic 1px outline, then blit. ox/oy is the anchor inside the art.
  const cache = new Map();
  P.sprite = (key, w, h, ox, oy, draw, outline = P.C.ink) => {
    let s = cache.get(key); if (s) return s;
    const a = document.createElement('canvas'); a.width = w + 2; a.height = h + 2; const ca = a.getContext('2d');
    ca.translate(1 + ox, 1 + oy); draw(kit(ca)); let out = a;
    if (outline) {
      const b = document.createElement('canvas'); b.width = a.width; b.height = a.height; const cb = b.getContext('2d');
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) cb.drawImage(a, dx, dy);
      cb.globalCompositeOperation = 'source-in'; cb.fillStyle = outline; cb.fillRect(0, 0, b.width, b.height);
      cb.globalCompositeOperation = 'source-over'; cb.drawImage(a, 0, 0); out = b;
    }
    s = { canvas: out, ox, oy }; cache.set(key, s); return s;
  };
  // A flat-colour silhouette of a cached sprite (hit flashes, ghosts, selections).
  P.tint = (s, col) => {
    const key = s; if (!s) return s; s.tints = s.tints || {}; if (s.tints[col]) return s.tints[col];
    const b = document.createElement('canvas'); b.width = s.canvas.width; b.height = s.canvas.height; const cb = b.getContext('2d');
    cb.drawImage(s.canvas, 0, 0); cb.globalCompositeOperation = 'source-in'; cb.fillStyle = col; cb.fillRect(0, 0, b.width, b.height);
    return s.tints[col] = { canvas: b, ox: s.ox, oy: s.oy };
  };
  P.cacheSize = () => cache.size;

  window.Pixel = P;
})();
