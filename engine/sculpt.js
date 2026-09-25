/* Sculpted pixel sprites. A figure is built from parts (silhouettes drawn with canvas paths). Each part gets a
   rounded height field from its distance to the edge, is lit from the top left and quantised to its colour
   ramp with light ordered dithering. Parts cast contact shadows on what lies behind them. Details are then
   placed by hand on the tone buffer. Used for the statue and the large avatars; results are cached by callers. */
(() => {
  const P = window.Pixel;
  const bayer = [0.125, 0.625, 0.875, 0.375];

  // Closed Catmull-Rom spline through points.
  function spline(c, pts) {
    const n = pts.length; c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    c.closePath();
  }
  // A stroke along a polyline whose radius is interpolated per point ([x, y, r]).
  function limb(c, pts) {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0, r0] = pts[i - 1], [x1, y1, r1] = pts[i], n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3));
      for (let j = 0; j <= n; j++) { const f = j / n, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, r = r0 + (r1 - r0) * f; c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); }
    }
  }
  const shapes = {
    spline: pts => c => { c.beginPath(); spline(c, pts); c.fill(); },
    limb: pts => c => { c.beginPath(); limb(c, pts); c.fill(); },
    poly: pts => c => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.fill(); },
    ellipse: (x, y, rx, ry) => c => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  };

  // ramps: array of colour ramps (dark → light). build(api) adds parts and details. Returns a canvas of
  // (w + 2) × (h + 2) with a 1px outline; art pixel (x, y) lands at canvas (x + 1, y + 1).
  function sculpt(w, h, ramps, build, o = {}) {
    const N = w * h, tone = new Int8Array(N).fill(-1), rampOf = new Int8Array(N);
    const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const m = mc.getContext('2d', { willReadFrequently: true });
    const Lv = o.light || [-0.72, -0.8, 0.62], Ln = Math.hypot(...Lv), L = Lv.map(q => q / Ln);
    const ambient = o.ambient ?? .1, gain = o.gain ?? 1.05, gamma = o.gamma ?? 1.3, lift = o.lift ?? .35;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : tone[y * w + x];
    const top = i => ramps[rampOf[i]].length - 1;
    function part(draw, p = {}) {
      const cap = p.cap || 4, r = p.ramp || 0, n1 = ramps[r].length - 1;
      m.clearRect(0, 0, w, h); m.fillStyle = '#000'; draw(m);
      const a = m.getImageData(0, 0, w, h).data, inside = new Uint8Array(N);
      for (let i = 0; i < N; i++) inside[i] = a[i * 4 + 3] > 110 ? 1 : 0;
      // Chamfer distance to the outside, then a dome-shaped height field.
      const d = new Float32Array(N); for (let i = 0; i < N; i++) d[i] = inside[i] ? 1e4 : 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!d[i]) continue; let v = d[i]; if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) v = Math.min(v, d[i - w] + 1); if (x > 0 && y > 0) v = Math.min(v, d[i - w - 1] + 1.41); if (x < w - 1 && y > 0) v = Math.min(v, d[i - w + 1] + 1.41); if (x === 0 || y === 0 || x === w - 1) v = Math.min(v, 1); d[i] = v; }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; if (!d[i]) continue; let v = d[i]; if (x < w - 1) v = Math.min(v, d[i + 1] + 1); if (y < h - 1) v = Math.min(v, d[i + w] + 1); if (x < w - 1 && y < h - 1) v = Math.min(v, d[i + w + 1] + 1.41); if (x > 0 && y < h - 1) v = Math.min(v, d[i + w - 1] + 1.41); d[i] = v; }
      const hf = new Float32Array(N); for (let i = 0; i < N; i++) { const q = Math.min(d[i], cap) / cap; hf[i] = inside[i] ? cap * (1 - (1 - q) * (1 - q)) : 0; }
      const H = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : hf[y * w + x];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!inside[i]) continue;
        const gx = (H(x + 1, y) - H(x - 1, y)) / 2, gy = (H(x, y + 1) - H(x, y - 1)) / 2, nl = Math.hypot(gx, gy, 1);
        let I = ambient + gain * Math.max(0, (-gx * L[0] - gy * L[1] + L[2]) / nl);
        I = Math.pow(Math.max(0, I + (p.grad || 0) * (1 - y / h) + (p.tone || 0)), gamma);
        const v = I * n1 + (bayer[(y & 1) * 2 + (x & 1)] - .5) * .7 + lift;
        tone[i] = Math.max(p.min ?? 1, Math.min(n1, Math.floor(v))); rampOf[i] = r;
      }
      // Contact shadow on whatever lies just right of and below the new part.
      if (p.shadow !== false) for (let y = 1; y < h; y++) for (let x = 1; x < w; x++) {
        const i = y * w + x; if (inside[i] || tone[i] < 0) continue;
        if (inside[i - 1] || inside[i - w] || inside[i - w - 1]) tone[i] = Math.max(0, tone[i] - 3);
        else if (x > 1 && y > 1 && (inside[i - 2] || inside[i - 2 * w])) tone[i] = Math.max(0, tone[i] - 1);
      }
      // A thin dark seam where this part sits over another one.
      if (p.seam !== false) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x; if (!inside[i]) continue;
        if (!inside[i + 1] && tone[i + 1] >= 0 || !inside[i + w] && tone[i + w] >= 0) tone[i] = Math.max(1, tone[i] - 2);
      }
    }
    const R = Math.round;
    const api = {
      part, at, shapes,
      set: (x, y, v) => { x = R(x); y = R(y); if (at(x, y) >= 0) tone[y * w + x] = Math.min(top(y * w + x), v); },
      dk: (x, y, n = 2) => { x = R(x); y = R(y); const v = at(x, y); if (v >= 0) tone[y * w + x] = Math.max(0, v - n); },
      lt: (x, y, n = 2) => { x = R(x); y = R(y); const v = at(x, y); if (v >= 0) tone[y * w + x] = Math.min(top(y * w + x), v + n); },
      // Paint a pixel with a given tone of a given ramp (default: keep its ramp, or ramp 0 if empty).
      force: (x, y, v, r) => { x = R(x); y = R(y); if (x < 0 || y < 0 || x >= w || y >= h) return; const i = y * w + x; if (r !== undefined) rampOf[i] = r; else if (tone[i] < 0) rampOf[i] = 0; tone[i] = Math.min(ramps[rampOf[i]].length - 1, v); },
      ramp: (x, y) => { x = R(x); y = R(y); return at(x, y) >= 0 ? rampOf[y * w + x] : -1; },
      ln: (pts, fn) => { for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5); for (let j = 0; j <= n; j++) fn(x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n); } }
    };
    build(api);
    // Colour and outline.
    const cv = document.createElement('canvas'); cv.width = w + 2; cv.height = h + 2; const c = cv.getContext('2d');
    const out = c.createImageData(w + 2, h + 2), rgb = {};
    const put = (x, y, hex) => { const q = rgb[hex] || (rgb[hex] = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16))), i = ((y + 1) * (w + 2) + x + 1) * 4; out.data[i] = q[0]; out.data[i + 1] = q[1]; out.data[i + 2] = q[2]; out.data[i + 3] = 255; };
    const outline = o.outline || '#120b07';
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      const v = at(x, y); if (v >= 0) { put(x, y, ramps[rampOf[y * w + x]][v]); continue; }
      if (o.outline !== false && (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0)) put(x, y, outline);
    }
    c.putImageData(out, 0, 0);
    return cv;
  }
  // A colour ramp around a base colour (dark → light).
  P.ramp = (base, steps = [-.62, -.48, -.34, -.2, -.08, 0, .16, .34]) => steps.map(f => f ? P.shade(base, f) : base);
  P.sculpt = sculpt;
})();
