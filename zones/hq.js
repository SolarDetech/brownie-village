/* HQ · the heart of the village: three honeycomb tiles merged into one district (the lanes between them are lawn).
   The origin is the corner where the three tiles meet, and the Atatürk equestrian statue stands there on a round
   paved plaza with a star inlay, between two Turkish flags. North-east, facing south onto the plaza, stands the
   palace: a long white-marble facade in the Dolmabahçe manner (a domed central block with gilded columns, two
   wings, end pavilions with pediments and flags), a grand stair, a forecourt with long pools, and an ornate
   railing and gate with guards. The rest is the operations campus:
     west tile   the OPS building (rooftop solar being installed), the data centre, a deck of desks with PCs, a big
                 LED wall, a comms mast and a dish, the VR pad, a robot charging dock and a café kiosk;
     south-east  the drone port (pad, charging lockers, ground control), the robotics yard (lab, robot-arm
                 workcell, test course with a quadruped and a rover, a humanoid on its dock) and the solar field
                 (three rows each side of the gate path, a battery container), with technicians at work.
   Gates at the bottom of the west tile (−233, 145) and of the south-east tile (157, 322). The owners' avatars stand
   on the plaza at (±72, 84), so that ground stays open. A service place: no lead agent.
   Daghan's HQ is the mirror image: only the positions are mirrored (x → −x); every structure, figure and prop
   group is drawn unmirrored around its own anchor, so the light stays top-left and the text reads. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.hq = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const TR = '#e30a17';                                                   // Turkish flag red
  const M = [C.stone2, C.stone3, C.stone4, C.stone5, S(C.stone5, .45), C.white];   // white marble: dark line → highlight
  const DOME = C.slate3;
  const PV = ['#16254a', '#1f3566', '#2e4d8a', '#5f86c4', '#a9c4ec'];      // solar cells: dark → glint
  const GLASS = '#141c26';                                               // an unlit screen

  /* ---------- layout (GKTC, zone-local); each group is drawn at (s·x, y), unmirrored ---------- */
  const PAL = { x: 157, y: -190 };      // palace: centre of the wings' ground line
  const STAT = { x: 0, y: 12 };         // statue: centre of the pedestal's front edge
  const OPS = { x: -287, y: -96 };      // OPS building, bottom centre
  const DC = { x: -155, y: -100 };      // data centre
  const DECK = { x: -288, y: -52 };     // desk deck
  const LED = { x: -170, y: -18 };      // LED wall (feet)
  const MAST = { x: -398, y: 34 };
  const DISH = { x: -386, y: 88 };
  const VR = { x: -300, y: 62 };
  const DOCK = { x: -352, y: 130 };
  const CAFE = { x: -186, y: 72 };
  const PAD = { x: 40, y: 192 };
  const LOCK = { x: -22, y: 166 };
  const GCS = { x: 104, y: 228 };       // drone ground control
  const LAB = { x: 248, y: 88 };
  const CELL = { x: 236, y: 136 };      // robot-arm workcell
  const TEST = { x: 270, y: 196 };      // robot test course
  const HUM = { x: 318, y: 130 };       // humanoid dock
  const PVB = [{ x: 81, w: 112 }, { x: 230, w: 108 }], ROWS = [266, 292, 318];
  const BESS = { x: 308, y: 262 };
  const FOUNT = { x: 236, y: 2 };
  // Desks on the deck: [centre x, feet y] local to DECK.
  const DESKS = [[-69, -12], [-23, -12], [23, -12], [69, -12], [-69, 20], [-23, 20], [23, 20], [69, 20]];
  // Screens behind the OPS glass (local to OPS): [x, y, w, h].
  const OPS_SCR = [];
  for (const [i, y] of [[1, -32], [3, -32], [4, -32], [6, -32], [8, -32], [10, -32], [12, -32], [14, -32], [1, -15], [3, -15], [5, -15], [11, -15], [13, -15], [15, -15]]) OPS_SCR.push([-84 + i * 10 + 2, y, 6, 4]);
  const LAB_SCR = [[4, -18, 7, 5], [16, -18, 7, 5], [36, -18, 7, 5]];
  let s = 1;
  const G = (k, x, y, fn) => k.at(s * x, y, fn);
  const MP = pts => pts.map(([x, y]) => [s * x, y]);
  const ellPts = (cx, cy, rx, ry, n = 48) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  const tri = p => { const q = ((p % 1) + 1) % 1; return q < .5 ? q * 2 : 2 - q * 2; };   // 0 → 1 → 0

  /* ---------- ground ---------- */
  const paveTex = (base, seed = 0) => { const d = S(base, -.14), l = S(base, .12); return (x, y) => {
    const row = Math.floor((y + 800) / 6), off = (row & 1) * 5, xx = x + 800 + off;
    if ((y + 800) % 6 === 0 || xx % 10 === 0) return d;
    const h = P.hash(Math.floor(xx / 10) + seed, row); return h < .18 ? l : h > .92 ? S(base, -.06) : base;
  }; };
  const marbleTex = (x, y) => { const a = x + y + 800, b = x - y + 800; if (a % 10 === 0 || b % 10 === 0) return M[2]; return (Math.floor(a / 10) + Math.floor(b / 10)) & 1 ? M[4] : M[3]; };
  const slabTex = (x, y) => { const X = x + 800, Y = y + 800; if (X % 16 === 0 || Y % 12 === 0) return S(C.stone3, -.12); const h = P.hash(Math.floor(X / 16), Math.floor(Y / 12)); return h < .3 ? S(C.stone3, .08) : h > .85 ? S(C.stone3, -.05) : C.stone3; };
  const rubberTex = (x, y) => { const X = x + 800, Y = y + 800, h = P.hash(x, y); if (X % 20 === 0 || Y % 20 === 0) return C.slate1; return h < .08 ? C.slate3 : h > .95 ? C.slate1 : C.slate2; };
  const gravelTex = (x, y) => { const h = P.hash(x * 1.3, y * .7); return h < .12 ? C.dirt2 : h < .2 ? C.stone3 : h > .94 ? C.dirt5 : C.dirt3; };
  // A slab: lit top-left edge, dark bottom-right edge, then the texture.
  function slab(k, pts, tex, edge = C.stone1) {
    k.poly(pts.map(([x, y]) => [x + 1, y + 1]), edge); k.poly(pts.map(([x, y]) => [x - 1, y - 1]), C.stone4);
    k.polyTex(pts, tex);
  }

  /* ---------- shared bits ---------- */
  function flagpole(k, x, y, top) {
    k.ellipse(x + 3, y + 2, 9, 2, C.shadow);
    k.rect(x - 6, y - 4, 13, 5, C.stone2); k.rect(x - 6, y - 4, 13, 1, C.stone5); k.rect(x - 6, y, 13, 1, C.stone1);
    k.rect(x - 4, y - 7, 9, 3, C.stone4); k.rect(x - 4, y - 7, 9, 1, C.stone5); k.rect(x + 4, y - 7, 1, 3, C.stone1);
    k.rect(x - 1, top, 2, y - 7 - top, C.stone4); k.rect(x, top, 1, y - 7 - top, C.stone2); k.rect(x - 1, top, 1, y - 7 - top, C.stone5);
    k.rect(x - 2, top - 3, 4, 3, C.gold2); k.px(x - 2, top - 3, C.gold4); k.rect(x - 1, top - 4, 2, 1, C.gold1);
  }
  function trBed(k, x, y, w, h) {
    k.rect(x + 1, y + h, w + 1, 2, C.shadowSoft);
    k.rect(x - 1, y - 1, w + 2, h + 2, C.stone2); k.rect(x - 1, y - 1, w + 2, 1, C.stone5); k.rect(x - 1, y + h, w + 2, 1, C.stone1); k.rect(x + w, y, 1, h, C.stone1);
    k.rect(x, y, w, h, C.leaf1); k.dither(x, y, w, h, C.leaf0, 1);
    for (let yy = y + 1; yy < y + h - 1; yy += 2) for (let xx = x + 1 + ((yy - y) >> 1) % 2; xx < x + w - 1; xx += 2) {
      const red = xx > x + 2 && xx < x + w - 3 && yy > y + 1 && yy < y + h - 3, col = red ? TR : C.white;
      k.px(xx, yy + 1, C.leaf3); k.px(xx, yy, col); if (xx + 1 < x + w - 1) k.px(xx + 1, yy, red ? S(TR, -.3) : C.stone4);
    }
  }
  function wreath(k, cx, cy) {
    k.ellipse(cx + 2, cy + 10, 10, 2, C.shadow);
    k.line(cx - 7, cy + 9, cx - 3, cy - 3, C.wood1); k.line(cx + 7, cy + 9, cx + 3, cy - 3, C.wood1); k.line(cx, cy + 9, cx, cy + 2, C.wood0);
    k.ellipse(cx, cy, 9, 8, C.leaf0); k.ellipse(cx, cy, 5, 4, C.stone4);
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * Math.PI * 2, x = Math.round(cx + Math.cos(a) * 7.5), y = Math.round(cy + Math.sin(a) * 6.5), lit = Math.cos(a) + Math.sin(a) < -.2;
      k.rect(x - 1, y, 2, 1, lit ? C.leaf4 : C.leaf2); k.px(x + (i % 2 ? 1 : -1), y - 1, lit ? C.leaf3 : C.leaf1); if (i % 5 === 2) k.px(x, y + 1, C.gold2);
    }
    k.ring(cx, cy, 5, 4, C.leaf1);
    k.rect(cx - 4, cy + 5, 3, 3, TR); k.rect(cx + 2, cy + 5, 3, 3, TR); k.rect(cx - 1, cy + 6, 3, 2, S(TR, -.25));
    k.line(cx - 1, cy + 8, cx - 4, cy + 13, TR, 2); k.line(cx + 1, cy + 8, cx + 4, cy + 13, C.white, 2);
  }
  const topiary = (k, x, y, tall = true) => {
    k.ellipse(x + 3, y + 1, 6, 2, C.shadow);
    if (tall) {
      k.rect(x - 3, y - 4, 7, 4, C.terra2); k.rect(x - 4, y - 5, 9, 2, C.terra3); k.rect(x + 2, y - 3, 1, 3, C.terra1);
      k.poly([[x - 5, y - 6], [x + 1, y - 24], [x + 6, y - 6]], C.leaf1); k.poly([[x - 4, y - 7], [x + 1, y - 23], [x, y - 7]], C.leaf3);
      for (let i = 0; i < 5; i++) { k.px(x - 2 + (i % 2), y - 9 - i * 3, C.leaf4); k.px(x + 3, y - 8 - i * 3, C.leaf0); }
    } else { k.circle(x, y - 4, 4, C.leaf1); k.circle(x - 1, y - 5, 3, C.leaf2); k.px(x - 2, y - 7, C.leaf4); k.px(x + 2, y - 2, C.leaf0); }
  };
  const urn = (k, x, y) => { k.rect(x - 1, y - 2, 3, 2, M[3]); k.rect(x - 2, y - 5, 5, 3, M[4]); k.px(x - 2, y - 5, M[5]); k.px(x + 2, y - 4, M[2]); k.rect(x - 1, y - 6, 3, 1, M[5]); k.px(x, y - 7, C.gold2); };
  // A plain modern desk with a monitor, keyboard and a mug. (x, y): centre of the front edge on the ground.
  function desk(k, x, y, v) {
    k.rect(x - 12, y + 1, 28, 2, C.shadow);
    k.rect(x - 14, y - 10, 28, 4, '#e8e2d4'); k.rect(x - 14, y - 10, 28, 1, C.white); k.rect(x - 14, y - 7, 28, 1, C.stone2);
    k.rect(x - 13, y - 6, 2, 6, C.slate1); k.rect(x + 11, y - 6, 2, 6, C.slate1); k.rect(x - 12, y - 6, 1, 6, C.slate3);
    k.rect(x - 4, y - 21, 14, 10, C.ink); k.rect(x - 3, y - 20, 12, 7, GLASS); k.px(x - 3, y - 20, C.slate2);
    k.rect(x + 2, y - 12, 2, 2, C.slate1); k.rect(x, y - 10, 6, 1, C.slate0);
    k.rect(x - 11, y - 9, 9, 2, C.slate1); for (let i = 0; i < 8; i += 2) k.px(x - 10 + i, y - 9, C.slate3);
    if (v % 3 === 0) { k.rect(x + 10, y - 12, 3, 3, C.white); k.px(x + 13, y - 11, C.stone3); k.px(x + 11, y - 12, '#6a3a1a'); }
    else if (v % 3 === 1) { k.rect(x + 10, y - 11, 3, 2, C.terra2); k.ellipse(x + 11, y - 13, 2, 2, C.leaf3); k.px(x + 10, y - 14, C.leaf4); }
    else { k.rect(x + 9, y - 10, 5, 1, C.paper); k.rect(x + 9, y - 11, 5, 1, C.paper2); }
  }
  const lampPost = (k, x, y) => Props.lamp(k, x, y, true);

  /* ---------- the palace (local: x centred, ground line of the wings at y = 0) ---------- */
  function awin(k, x, y, w, h) {
    k.rect(x - 2, y - 2, w + 4, h + 4, M[2]); k.rect(x - 2, y - 2, 1, h + 4, M[5]); k.rect(x - 2, y - 2, w + 3, 1, M[5]);
    k.rect(x - 1, y - 1, w + 2, h + 2, M[1]);
    k.rect(x, y, w, h, C.glassDark); k.rect(x, y, w, 3, C.glass); k.dither(x, y + 3, w, 3, C.glass, 1);
    k.px(x, y, M[1]); k.px(x + w - 1, y, M[1]); k.px(x + 1, y + 1, C.white);
    k.rect(x + (w >> 1), y, 1, h, M[1]); k.rect(x, y + Math.floor(h * .4), w, 1, M[1]);
    k.rect(x + (w >> 1) - 1, y - 3, 3, 2, M[5]);
    k.rect(x - 2, y + h + 1, w + 4, 1, M[5]); k.rect(x - 2, y + h + 2, w + 4, 1, M[1]);
  }
  function pilaster(k, x, top, bot) {
    k.rect(x, top, 3, bot - top, M[4]); k.rect(x, top, 1, bot - top, M[5]); k.rect(x + 2, top, 1, bot - top, M[2]);
    k.rect(x - 1, top, 5, 2, M[5]); k.rect(x - 1, top + 2, 5, 1, M[2]); k.rect(x - 1, bot - 2, 5, 2, M[5]);
  }
  function cornice(k, x, top, w) {
    k.rect(x, top - 4, w, 4, M[3]); k.rect(x, top - 4, w, 1, M[5]); for (let i = 0; i < w; i += 3) k.px(x + i, top - 1, M[1]); k.rect(x, top, w, 1, M[2]);
  }
  function balus(k, x, base, w) {
    k.rect(x, base - 2, w, 2, M[3]); k.rect(x, base - 1, w, 1, M[2]);
    for (let i = 1; i < w - 1; i += 3) { k.rect(x + i, base - 7, 2, 5, M[4]); k.px(x + i + 1, base - 5, M[2]); }
    k.rect(x, base - 9, w, 2, M[5]); k.rect(x, base - 7, w, 1, M[2]);
    for (let i = 0; i <= w; i += 16) { const px = Math.min(x + w - 2, x + i); k.rect(px - 1, base - 9, 4, 9, M[4]); k.px(px - 1, base - 9, M[5]); urn(k, px + 1, base - 9); }
  }
  function balcony(k, x, y, w) {
    k.rect(x, y, w, 2, M[5]); k.rect(x, y + 2, w, 1, M[2]);
    for (let i = 1; i < w; i += 2) k.rect(x + i, y + 3, 1, 4, M[4]);
    k.rect(x, y + 7, w, 1, M[2]);
  }
  function column(k, cx, top, bot) {
    k.rect(cx + 3, top + 3, 1, bot - top - 3, C.shadowSoft);
    k.rect(cx - 2, top + 3, 4, bot - top - 5, M[4]); k.rect(cx - 2, top + 3, 1, bot - top - 5, M[5]); k.rect(cx + 1, top + 3, 1, bot - top - 5, M[2]);
    k.rect(cx - 3, top, 6, 3, C.gold2); k.rect(cx - 3, top, 6, 1, C.gold3); k.rect(cx - 3, top + 2, 6, 1, C.gold0);
    k.rect(cx - 3, bot - 2, 6, 2, M[5]); k.rect(cx - 3, bot - 1, 6, 1, M[2]);
  }
  function chimney(k, x, base) {
    k.rect(x - 2, base - 12, 5, 12, M[3]); k.rect(x - 2, base - 12, 1, 12, M[5]); k.rect(x + 2, base - 12, 1, 12, M[1]);
    k.rect(x - 3, base - 13, 7, 2, M[5]); k.poly([[x - 3, base - 13], [x, base - 18], [x + 4, base - 13]], C.slate2); k.line(x, base - 18, x + 4, base - 13, C.slate0); k.px(x, base - 19, C.gold2);
  }
  function roofStrip(k, x0, x1, base) {
    k.polyTex([[x0 + 2, base], [x1 - 2, base], [x1 - 9, base - 8], [x0 + 9, base - 8]], (x, y) => (y + x) % 5 === 0 ? C.slate1 : y === base - 8 ? C.slate4 : C.slate2);
  }
  function wing(k, x0, x1) {
    const w = x1 - x0, top = -56;
    roofStrip(k, x0, x1, top - 11);
    for (const cx of [x0 + 16, x1 - 16]) chimney(k, cx, top - 12);
    k.rect(x0, top, w, 56, M[4]);
    for (let y = top + 7; y < -6; y += 7) k.rect(x0, y, w, 1, S(M[4], -.04));
    k.rect(x0, -30, w, 2, M[5]); k.rect(x0, -28, w, 1, M[2]);
    k.rect(x0, -6, w, 6, M[3]); k.rect(x0, -6, w, 1, M[5]); k.rect(x0, -1, w, 1, M[1]);
    const n = Math.round(w / 16), bw = w / n;
    for (let i = 0; i < n; i++) {
      const cx = Math.round(x0 + (i + .5) * bw);
      awin(k, cx - 3, -49, 7, 14); awin(k, cx - 3, -22, 7, 13);
      k.poly([[cx - 6, -52], [cx, -55], [cx + 7, -52]], M[5]); k.rect(cx - 6, -52, 13, 1, M[2]);
    }
    for (let i = 0; i <= n; i++) pilaster(k, Math.min(x1 - 3, Math.round(x0 + i * bw) - 1), top, -6);
    cornice(k, x0 - 1, top, w + 2);
    balus(k, x0, top - 4, w);
  }
  function pavilion(k, cx) {
    const x0 = cx - 14, w = 28, top = -66, gb = 3;
    k.rect(x0 + w, top + 4, 4, gb - top - 4, C.shadowSoft);
    k.rect(x0, top, w, gb - top, M[4]);
    for (let y = top + 7; y < gb - 6; y += 7) k.rect(x0, y, w, 1, S(M[4], -.04));
    for (let y = top + 2; y < gb - 7; y += 5) { k.rect(x0, y, 4, 4, M[5]); k.rect(x0 + w - 4, y, 4, 4, M[3]); k.rect(x0, y + 4, 4, 1, M[2]); k.rect(x0 + w - 4, y + 4, 4, 1, M[1]); }
    k.rect(x0, gb - 6, w, 6, M[3]); k.rect(x0, gb - 6, w, 1, M[5]); k.rect(x0, gb - 1, w, 1, M[1]);
    awin(k, cx - 4, -54, 9, 19);
    k.rect(cx - 9, -32, 19, 2, M[5]); for (let i = 1; i < 19; i += 2) k.rect(cx - 9 + i, -30, 1, 4, M[4]); k.rect(cx - 9, -26, 19, 1, M[2]);
    awin(k, cx - 4, -22, 9, 19);
    cornice(k, x0 - 1, top, w + 2);
    k.poly([[x0 - 2, top - 4], [cx, top - 16], [x0 + w + 2, top - 4]], M[5]);
    k.poly([[x0 + 3, top - 5], [cx, top - 13], [x0 + w - 3, top - 5]], M[3]);
    k.line(cx + 1, top - 15, x0 + w + 2, top - 4, M[2]);
    k.circle(cx, top - 8, 2, C.gold1); k.px(cx - 1, top - 9, C.gold4); k.px(cx + 1, top - 7, C.gold0);
    for (const x of [x0 - 1, x0 + w]) { k.rect(x, top - 8, 2, 4, C.gold2); k.px(x, top - 9, C.gold3); }
    k.rect(cx, top - 38, 1, 22, C.stone1); k.px(cx, top - 39, C.gold3); k.px(cx, top - 17, C.gold2);
  }
  function dome(k) {
    const dt = -102, db = -84, r = 26;
    k.rectTex(-r, dt, r * 2, db - dt, x => { const u = (x + .5) / r; return u < -.72 ? M[5] : u < -.25 ? M[4] : u < .3 ? M[3] : u < .7 ? M[2] : M[1]; });
    for (const wx of [-20, -12, -4, 4, 12, 20]) k.rect(wx, dt + 2, 1, db - dt - 3, Math.abs(wx) > 14 ? (wx < 0 ? M[5] : M[1]) : M[5]);
    for (const wx of [-16, -8, 0, 8, 16]) { k.rect(wx - 1, dt + 6, 3, 8, C.glassDark); k.px(wx, dt + 5, C.glassDark); k.px(wx - 1, dt + 6, C.glass); }
    k.rect(-r - 1, dt - 2, r * 2 + 2, 3, M[5]); k.rect(-r - 1, dt, r * 2 + 2, 1, M[2]);
    const rx = 28, ry = 19, cy = dt - 2;
    const D = [S(DOME, .38), S(DOME, .2), DOME, S(DOME, -.16), S(DOME, -.32), S(DOME, -.46)];
    const pts = []; for (let i = 0; i <= 28; i++) { const a = Math.PI + i / 28 * Math.PI; pts.push([Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    k.polyTex(pts, (x, y) => {
      const u = (x + .5) / rx, v = Math.max(0, Math.min(1, (cy - y) / ry)), w = Math.sqrt(Math.max(0, 1 - v * v));
      for (const ru of [-.72, -.36, 0, .36, .72]) if (Math.abs(x + .5 - ru * rx * w) < .7) return v > .9 ? C.gold3 : ru < 0 ? C.gold3 : C.gold1;
      const b = -u * .95 + (v - .35) * .7;
      return D[b > .6 ? 0 : b > .25 ? 1 : b > -.15 ? 2 : b > -.5 ? 3 : b > -.8 ? 4 : 5];
    });
    k.rect(-rx, cy, rx * 2 + 1, 1, S(DOME, -.5));
    const lt = cy - ry;
    k.rect(-4, lt - 7, 8, 7, M[4]); k.rect(-4, lt - 7, 1, 7, M[5]); k.rect(3, lt - 7, 1, 7, M[1]); k.rect(-2, lt - 5, 1, 4, C.glassDark); k.rect(1, lt - 5, 1, 4, C.glassDark);
    k.ellipse(0, lt - 8, 5, 2, D[2]); k.rect(-4, lt - 9, 3, 1, D[0]);
    k.rect(-1, lt - 14, 2, 5, C.gold2); k.px(-1, lt - 14, C.gold4); k.circle(0, lt - 16, 2, C.gold2); k.px(1, lt - 16, S(DOME, .2)); k.px(1, lt - 17, S(DOME, .2)); k.px(-1, lt - 17, C.gold4);
  }
  function centreBlock(k) {
    const x0 = -62, w = 124, top = -66, gb = 8;
    k.rect(x0 + w, top + 4, 4, gb - top - 4, C.shadowSoft);
    k.rect(x0, top, w, gb - top, M[4]);
    for (let y = top + 7; y < gb - 6; y += 7) k.rect(x0, y, w, 1, S(M[4], -.04));
    k.rect(x0, top, 1, gb - top, M[5]); k.rect(x0 + w - 1, top, 1, gb - top, M[2]);
    k.rect(x0, gb - 6, w, 6, M[3]); k.rect(x0, gb - 6, w, 1, M[5]); k.rect(x0, gb - 1, w, 1, M[1]);
    for (const cx of [-48, -26, 26, 48]) { awin(k, cx - 4, -51, 8, 17); awin(k, cx - 4, -14, 8, 15); }
    awin(k, -6, -53, 12, 19);
    // Main door in a gilded arch, a tughra plaque above.
    k.rect(-11, -18, 22, 26, C.gold1); k.rect(-10, -19, 20, 1, C.gold1); k.rect(-8, -20, 16, 1, C.gold1); k.rect(-11, -18, 1, 26, C.gold3); k.rect(-10, -19, 8, 1, C.gold3);
    k.rect(-8, -16, 16, 24, C.wood1); k.rect(-7, -17, 14, 1, C.wood1); k.rect(-5, -18, 10, 1, C.wood1);
    k.rect(-8, -16, 8, 24, C.wood2); k.rect(-1, -18, 1, 26, C.wood0);
    for (const x of [-6, 2]) { k.rect(x, -12, 4, 7, C.gold1); k.rect(x + 1, -11, 2, 5, C.wood1); k.rect(x, -2, 4, 6, C.gold1); k.rect(x + 1, -1, 2, 4, C.wood1); }
    k.px(-2, -3, C.gold3); k.px(1, -3, C.gold3);
    balcony(k, x0 + 3, -29, w - 6);
    for (const cx of [-59, -37, -15, 14, 36, 58]) column(k, cx, -58, gb - 6);
    k.rect(x0 - 2, -64, w + 4, 6, M[5]); k.rect(x0 - 2, -61, w + 4, 2, C.gold2); k.rect(x0 - 2, -59, w + 4, 1, C.gold0);
    for (let i = 0; i < w + 4; i += 4) k.px(x0 - 2 + i, -61, C.gold3);
    // Attic with oculi, the crest at its centre, urns on the corners.
    k.rect(x0 + 2, -80, w - 4, 14, M[4]); k.rect(x0 + 2, -80, 1, 14, M[5]); k.rect(x0 + w - 3, -80, 1, 14, M[2]);
    for (const cx of [-48, -26, 26, 48]) { k.circle(cx, -73, 3, M[1]); k.circle(cx, -73, 2, C.glassDark); k.px(cx - 1, -74, C.glass); }
    for (const cx of [-37, -15, 14, 36]) { k.rect(cx - 1, -79, 3, 12, M[5]); k.rect(cx + 1, -79, 1, 12, M[2]); }
    cornice(k, x0, -80, w);
    for (const x of [x0 + 3, x0 + w - 3]) urn(k, x, -84);
    k.ellipse(0, -73, 9, 6, C.gold0); k.ellipse(0, -73, 8, 5, C.gold1); k.ellipse(-1, -74, 6, 3, C.gold2);
    k.circle(-2, -73, 3, C.red1); k.circle(-1, -73, 2, C.gold1); k.px(2, -73, C.red1); k.px(3, -74, C.red1); k.px(3, -72, C.red1);
  }
  function stair(k) {
    for (let i = 0; i < 6; i++) { const y = 8 + i * 3, hw = 30 + i * 3; k.rect(-hw, y, hw * 2, 3, M[3]); k.rect(-hw, y, hw * 2, 1, M[5]); k.rect(-hw, y + 2, hw * 2, 1, M[2]); k.rect(hw - 1, y, 1, 3, M[1]); }
    k.rect(-6, 8, 12, 18, S(TR, -.2)); k.rect(-6, 8, 2, 18, TR); for (let i = 0; i < 6; i++) { k.rect(-6, 10 + i * 3, 12, 1, S(TR, -.45)); k.px(-7, 10 + i * 3, C.gold2); k.px(6, 10 + i * 3, C.gold2); }
    for (const sg of [-1, 1]) {
      const x = sg < 0 ? -54 : 48;
      k.rect(x + 2, 27, 8, 2, C.shadow);
      k.rect(x, 12, 6, 15, M[4]); k.rect(x, 12, 1, 15, M[5]); k.rect(x + 5, 12, 1, 15, M[2]); k.rect(x - 1, 10, 8, 2, M[5]); k.rect(x - 1, 12, 8, 1, M[2]);
      lampPost(k, x + 2, 10);
    }
  }
  function palace(k) {
    k.poly([[154, 5], [163, -1], [163, -64], [154, -70]], C.shadow); k.rect(-150, 3, 312, 4, C.shadowSoft);
    dome(k);
    wing(k, -126, -62); wing(k, 62, 126);
    pavilion(k, -140); pavilion(k, 140);
    centreBlock(k);
    stair(k);
  }
  // The forecourt: marble paving, two long pools with topiaries and lamps, then the railing and the gate.
  function forecourtBack(k) {
    k.polyTex([[-150, -6], [154, -6], [154, 80], [-150, 80]], marbleTex);
    k.rectTex(-7, 26, 14, 56, (x, y) => (y % 4 === 0 ? S(TR, -.45) : Math.abs(x) > 5 ? C.gold1 : S(TR, -.18)));
  }
  function pool(k, x0) {
    k.rect(x0 + 1, 57, 84, 3, C.shadowSoft);
    k.rect(x0 - 2, 37, 84, 21, M[3]); k.rect(x0 - 2, 37, 84, 1, M[5]); k.rect(x0 - 2, 57, 84, 1, M[1]); k.rect(x0 + 81, 37, 1, 21, M[1]);
    k.rect(x0, 40, 80, 16, C.water1); k.rect(x0, 40, 80, 2, C.water0); k.rect(x0, 42, 80, 3, C.water2); k.dither(x0, 45, 80, 6, C.water2, 1); k.rect(x0 + 2, 43, 30, 1, C.water4);
    k.rect(x0, 40, 1, 16, C.water0);
    for (const x of [x0 + 20, x0 + 40, x0 + 60]) { k.ellipse(x, 48, 3, 1, M[2]); k.rect(x - 1, 46, 3, 2, M[4]); }
  }
  function railing(k, x0, x1, y) {
    k.rect(x0 + 2, y, x1 - x0, 2, C.shadow);
    k.rect(x0, y - 4, x1 - x0, 4, M[3]); k.rect(x0, y - 4, x1 - x0, 1, M[5]); k.rect(x0, y - 1, x1 - x0, 1, M[1]);
    for (let x = x0 + 1; x < x1; x += 3) { k.rect(x, y - 14, 1, 10, C.slate0); k.px(x, y - 15, C.gold2); }
    k.rect(x0, y - 12, x1 - x0, 1, C.slate1); k.rect(x0, y - 7, x1 - x0, 1, C.slate1);
  }
  function pier(k, x, y, h = 20) {
    k.rect(x - 1, y, 9, 2, C.shadow);
    k.rect(x - 3, y - h, 7, h, M[4]); k.rect(x - 3, y - h, 1, h, M[5]); k.rect(x + 3, y - h, 1, h, M[2]);
    k.rect(x - 4, y - h - 2, 9, 2, M[5]); k.rect(x - 4, y - h, 9, 1, M[2]);
    urn(k, x, y - h - 2);
  }
  function gate(k, y) {
    for (const sg of [-1, 1]) {
      const x = sg * 22;
      k.rect(x - 4, y, 14, 3, C.shadow);
      k.rect(x - 6, y - 40, 12, 40, M[4]); k.rect(x - 6, y - 40, 1, 40, M[5]); k.rect(x + 5, y - 40, 1, 40, M[2]);
      k.rect(x - 3, y - 32, 6, 14, M[2]); k.rect(x - 2, y - 33, 4, 1, M[2]); k.rect(x - 2, y - 31, 4, 12, M[1]); k.circle(x, y - 25, 1, C.gold2);
      k.rect(x - 6, y - 8, 12, 8, M[3]); k.rect(x - 6, y - 8, 12, 1, M[5]); k.rect(x - 6, y - 1, 12, 1, M[1]);
      k.rect(x - 7, y - 44, 14, 4, M[5]); k.rect(x - 7, y - 41, 14, 1, M[2]);
      k.rect(x - 2, y - 48, 4, 4, C.gold1); k.circle(x, y - 50, 2, C.gold2); k.px(x - 1, y - 51, C.gold4);
      // The open gate leaf, folded back against the pier.
      const lx = sg < 0 ? x + 6 : x - 8;
      k.rect(lx, y - 26, 2, 26, C.slate0); k.rect(lx, y - 26, 2, 1, C.gold2); k.px(lx, y - 14, C.gold2);
    }
    const arc = (r, ry, off) => { const p = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; p.push([Math.cos(a) * r, y - 38 + off + Math.sin(a) * ry]); } return p; };
    k.path(arc(17, 11, 0), M[2], 4); k.path(arc(17, 11, -1), M[4], 3); k.path(arc(17, 11, -2), M[5], 1); k.path(arc(14, 8, 1), C.gold1, 1);
    k.ellipse(0, y - 55, 6, 4, C.gold0); k.ellipse(0, y - 55, 5, 3, C.gold2); k.circle(-1, y - 55, 2, TR); k.px(0, y - 55, C.gold2); k.px(2, y - 55, C.white);
  }
  function forecourtFront(k) {
    pool(k, -110); pool(k, 30);
    for (const x of [-116, -24, 24, 116]) topiary(k, x, 58);
    for (const x of [-120, 118]) lampPost(k, x, 32);
    railing(k, -148, -28, 82); railing(k, 28, 150, 82);
    for (const x of [-146, -118, -88, -58, 58, 88, 118, 148]) pier(k, x, 82);
    gate(k, 82);
    for (const sg of [-1, 1]) flagpole(k, sg * 64, 96, 14);
  }

  /* ---------- statue plaza ---------- */
  function plaza(k) {
    k.ellipse(0, 22, 153, 103, C.stone1); k.ellipse(0, 20, 151, 101, C.stone4);
    k.polyTex(ellPts(0, 20, 150, 100, 64), (x, y) => {
      const dx = x / 150, dy = (y - 20) / 100, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx);
      if (r > .9) { if (r < .915 || r > .965) return C.stone5; return Math.floor((a + 4) * 22) % 2 ? S(TR, -.36) : S(TR, -.46); }
      const band = Math.floor(r * 7), seg = Math.floor((a + 4) * (5 + band * 4));
      if (Math.floor(r * 7 + .05) !== band || Math.floor((a + 4 + .02) * (5 + band * 4)) !== seg) return C.stone2;
      return P.hash(seg, band + 3) < .3 ? C.stone5 : C.stone4;
    });
    // An eight-point star inlay: alternate facets in red and marble (lit side / shade side).
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 - Math.PI / 2, b0 = a - Math.PI / 8, b1 = a + Math.PI / 8;
      const pt = (ang, rr) => [Math.round(Math.cos(ang) * 150 * rr), Math.round(20 + Math.sin(ang) * 100 * rr)];
      const tip = pt(a, i % 2 ? .5 : .66), v0 = pt(b0, .3), v1 = pt(b1, .3), c = [0, 20];
      k.poly([c, v0, tip], i % 2 ? S(TR, -.3) : M[5]); k.poly([c, tip, v1], i % 2 ? S(TR, -.5) : M[2]);
    }
    k.ellipse(0, 20, 34, 22, C.stone2); k.ellipse(0, 20, 32, 21, C.stone5); k.ring(0, 20, 26, 17, TR);
  }
  function plazaDressing(k) {
    trBed(k, -114, -24, 18, 30); trBed(k, 96, -24, 18, 30);
    for (const sg of [-1, 1]) flagpole(k, sg * 126, 44, -20);
    wreath(k, 0, 30);
    for (const sg of [-1, 1]) { lampPost(k, sg * 136, 72); Props.bench(k, sg < 0 ? -134 : 118, 104, 16); }
    trBed(k, -40, 118, 22, 6); trBed(k, 18, 118, 22, 6);
  }

  /* ---------- west campus ---------- */
  function pvPanel(k, x, y, w, h) {
    k.rect(x + 1, y + h, w, 2, C.shadowSoft);
    k.rect(x - 1, y - 1, w + 2, h + 2, C.stone4); k.rect(x - 1, y + h, w + 2, 1, C.stone1);
    k.rect(x, y, w, h, PV[1]);
    for (let yy = y + 2; yy < y + h; yy += 3) k.rect(x, yy, w, 1, PV[0]);
    for (let xx = x + 3; xx < x + w; xx += 4) k.rect(xx, y, 1, h, PV[0]);
    k.rect(x, y, w, 1, PV[2]); k.px(x + 1, y + 1, PV[3]); k.px(x + 2, y + 1, PV[2]); k.px(x + 1, y + 2, PV[2]);
  }
  function opsBuilding(k) {
    k.poly([[86, 1], [94, -5], [94, -44], [86, -52]], C.shadow); k.rect(-82, 1, 176, 3, C.shadowSoft);
    // Roof deck with rooftop solar (two rows, a gap where the next panels go) and a parapet.
    k.rect(-86, -54, 172, 14, C.stone3); k.dither(-86, -54, 172, 14, C.stone2, 1); k.rect(-86, -54, 172, 1, C.stone5); k.rect(-86, -41, 172, 1, C.stone1);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++) { if (row === 1 && (i === 3 || i === 4)) continue; pvPanel(k, -82 + i * 16, -52 + row * 6, 13, 4); }
    k.rect(-34, -46, 13, 4, C.slate1); k.rect(-34, -46, 13, 1, C.slate3);            // an empty mounting frame
    k.rect(68, -58, 10, 6, C.stone2); k.rect(68, -58, 10, 1, C.stone4); k.rect(80, -56, 3, 3, C.slate1);   // roof access hut and the beacon base
    // Front wall: white frame, two glass bands, the entrance in the middle.
    k.rect(-86, -40, 172, 40, C.stone5); k.rect(-86, -40, 172, 2, C.white); k.rect(84, -40, 2, 40, C.stone3);
    for (const [y, h] of [[-36, 12], [-19, 12]]) {
      k.rect(-84, y, 168, h, '#2a4452'); k.rect(-84, y, 168, 2, C.glass); k.dither(-84, y + 2, 168, 3, C.glass, 1);
      for (let x = -84; x <= 84; x += 10) k.rect(x, y, 1, h, C.stone3);
      k.rect(-84, y + h, 168, 1, C.stone3);
    }
    // Heads of the staff at work behind the glass.
    for (let i = 0; i < 16; i++) { const x = -82 + i * 10 + 6, y = i % 2 ? -27 : -10; if (Math.abs(x) < 14) continue; k.rect(x, y, 3, 3, ['#4a3226', '#2a1c16', '#8a5a2a', '#1e1a18'][i % 4]); k.rect(x - 1, y + 3, 5, 2, ['#6a7ab0', '#5a8a5a', '#b8683a'][i % 3]); }
    // Entrance: canopy, glass doors and the sign.
    k.rect(-14, -19, 28, 19, '#1e3440'); k.rect(-12, -17, 11, 17, C.glass); k.rect(1, -17, 11, 17, C.glass); k.dither(-12, -12, 24, 12, '#2a4452', 1); k.rect(-1, -17, 2, 17, C.stone3);
    k.rect(-20, -23, 40, 3, C.teal2); k.rect(-20, -23, 40, 1, C.teal4); k.rect(-20, -20, 40, 1, C.teal0);
    k.rect(-12, -40, 24, 5, C.teal1); k.textCenter('OPS', 0, -40, C.white);
    k.rect(-86, -2, 172, 2, C.stone3);
    for (const x of [-80, -60, 60, 80]) Props.pot(k, x, -6);
  }
  function dataCentre(k) {
    k.poly([[35, 1], [42, -5], [42, -36], [35, -42]], C.shadow);
    k.rect(-36, -43, 72, 11, C.slate2); k.rect(-36, -43, 72, 1, C.slate4); k.rect(-36, -33, 72, 1, C.slate0);
    for (const fx of [-20, -6]) { k.ellipse(fx, -37, 5, 3, C.slate0); k.ellipse(fx, -38, 5, 3, C.slate3); k.ellipse(fx, -38, 4, 2, C.slate1); }
    for (const dx of [14, 26]) { k.rect(dx, -44, 1, 5, C.stone2); k.ellipse(dx, -47, 4, 3, C.stone5); k.ellipse(dx + 1, -47, 2, 2, C.stone3); k.px(dx - 2, -49, C.white); }
    k.rect(-36, -32, 72, 32, C.slate1);
    for (let x = -34; x < 36; x += 4) k.rect(x, -32, 1, 32, C.slate0);
    k.rect(-36, -32, 1, 32, C.slate3); k.rect(-36, -32, 72, 1, C.slate3);
    k.rect(-31, -29, 42, 22, C.ink); k.rect(-30, -28, 40, 20, '#0e141c');
    for (let i = 0; i < 5; i++) { k.rect(-29 + i * 8, -27, 6, 18, C.slate0); k.rect(-29 + i * 8, -27, 6, 1, C.slate2); for (let r = 0; r < 5; r++) k.rect(-28 + i * 8, -25 + r * 3, 4, 1, '#1e2632'); }
    k.rect(-30, -28, 40, 2, S(C.glass, -.4));
    k.rect(16, -24, 12, 24, C.slate0); k.rect(17, -23, 10, 23, '#2a4452'); k.rect(17, -23, 10, 2, C.glass); k.rect(21, -23, 1, 23, C.slate2);
    k.rect(15, -28, 14, 3, C.teal1); k.textCenter('DATA', 22, -28, C.white);
    k.rect(-36, -3, 72, 3, C.stone2); k.rect(-36, -3, 72, 1, C.stone4);
  }
  function deck(k) {
    k.rect(-94, 37, 192, 3, C.shadowSoft);
    Props.planks(k, -96, -36, 192, 72, C.wood3);
    k.rect(-96, -36, 192, 1, C.wood5); k.rect(-96, 35, 192, 1, C.wood1); k.rect(95, -36, 1, 72, C.wood1);
    for (const [x, y] of [[-92, -30], [86, -30], [-92, 26], [86, 26]]) Props.pot(k, x, y);
    for (const [x, y] of DESKS) desk(k, x, y, Math.abs(x + y));
    // A printer, a water cooler and a whiteboard at the ends of the aisle.
    k.rect(-94, 4, 10, 8, C.stone4); k.rect(-94, 4, 10, 1, C.white); k.rect(-93, 7, 8, 1, C.slate1); k.rect(-92, 2, 6, 2, C.paper);
    k.rect(88, -4, 6, 12, C.stone4); k.rect(88, -10, 6, 6, C.water4); k.rect(88, -10, 6, 1, C.water5); k.px(89, -8, C.white);
    k.rect(-18, -35, 36, 1, C.slate1);
  }
  function ledWall(k) {
    k.rect(-12, 1, 30, 2, C.shadow);
    for (const x of [-16, 14]) { k.rect(x, -24, 3, 24, C.slate1); k.rect(x, -24, 1, 24, C.slate3); k.rect(x - 2, -2, 7, 2, C.slate0); }
    k.rect(-22, -51, 44, 30, C.ink); k.rect(-21, -50, 42, 28, C.slate0); k.rect(-20, -49, 40, 26, GLASS);
    k.rect(-22, -51, 44, 1, C.slate2); k.rect(-3, -21, 6, 3, C.slate1);
  }
  function mast(k) {
    k.ellipse(3, 1, 12, 3, C.shadow);
    k.rect(-8, -3, 17, 4, C.stone2); k.rect(-8, -3, 17, 1, C.stone4);
    k.line(-5, -3, -2, -84, C.slate1); k.line(5, -3, 2, -84, C.slate0);
    for (let y = -8; y > -82; y -= 8) { const f = (-y) / 84, w = Math.round(5 - f * 3); k.line(-w, y, w, y - 8, C.slate2); k.line(w, y, -w, y - 8, C.slate1); k.rect(-w, y, w * 2 + 1, 1, C.slate2); }
    k.rect(-3, -86, 6, 2, C.slate0);
    k.rect(-6, -76, 2, 7, C.stone4); k.rect(5, -76, 2, 7, C.stone3); k.rect(-1, -80, 2, 6, C.stone4);
    k.ellipse(-8, -58, 3, 6, C.stone5); k.ellipse(-7, -58, 2, 5, C.stone3); k.line(-8, -58, -12, -58, C.slate1);
    k.ellipse(8, -44, 3, 5, C.stone5); k.ellipse(9, -44, 2, 4, C.stone3);
    k.rect(9, -12, 11, 12, C.stone4); k.rect(9, -12, 11, 1, C.white); k.rect(19, -12, 1, 12, C.stone2); k.rect(11, -9, 3, 2, C.working); k.rect(15, -9, 3, 1, C.slate1);
  }
  function groundDish(k) {
    k.ellipse(2, 1, 10, 3, C.shadow);
    k.rect(-4, -3, 9, 3, C.stone2); k.rect(-2, -12, 4, 9, C.stone3); k.rect(-2, -12, 1, 9, C.stone5);
    k.ellipse(-1, -20, 12, 9, C.stone2); k.ellipse(-2, -21, 11, 8, C.stone5); k.ellipse(0, -19, 8, 6, C.stone4); k.ellipse(1, -18, 5, 4, C.stone3);
    k.line(0, -19, -6, -29, C.slate1); k.line(-10, -24, -6, -29, C.slate2); k.rect(-7, -31, 3, 3, C.slate0);
  }
  function vrPad(k) {
    k.ellipse(3, 3, 50, 22, C.shadowSoft);
    k.ellipse(0, 1, 48, 21, C.slate0); k.ellipse(0, 0, 47, 20, C.slate1); k.ellipse(-2, -1, 44, 18, C.slate2);
    k.ditherEllipse(0, 0, 44, 18, C.slate1, 1);
    k.ring(0, 0, 44, 18, C.teal2); k.ring(0, 0, 30, 12, C.teal1); k.ring(0, 0, 15, 6, C.teal1);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.px(Math.cos(a) * 44, Math.sin(a) * 18, C.teal4); }
    k.rect(-3, -20, 7, 8, C.slate0); k.rect(-3, -20, 7, 1, C.slate3); k.rect(-1, -22, 3, 2, C.teal3); k.px(0, -22, C.teal4);
    // A mirror display for spectators and a rack of spare headsets.
    k.rect(41, 16, 2, 10, C.slate1); k.rect(33, 11, 14, 9, C.ink); k.rect(34, 12, 12, 7, GLASS);
    k.rect(-58, 6, 12, 10, C.wood2); k.rect(-58, 6, 12, 1, C.wood4); for (let i = 0; i < 3; i++) { k.rect(-57 + i * 4, 3, 3, 2, '#1e2230'); k.px(-56 + i * 4, 3, C.teal4); }
  }
  function dock(k) {
    k.rect(-24, 1, 48, 2, C.shadowSoft);
    k.rect(-24, -2, 48, 4, C.stone3); k.rect(-24, -2, 48, 1, C.stone5);
    for (const x of [-12, 10]) { k.rect(x - 7, -1, 14, 3, C.teal1); k.rect(x - 6, 0, 12, 1, C.teal3); }
    k.rect(-22, -16, 44, 5, C.slate1); k.rect(-22, -16, 44, 1, C.slate3); k.rect(-22, -12, 44, 1, C.slate0);
    for (const x of [-20, 20]) k.rect(x, -12, 2, 11, C.slate0);
    k.rect(-14, -15, 4, 2, C.working); k.rect(8, -15, 4, 2, C.working);
    k.rect(-2, -26, 4, 10, C.slate0); k.rect(-8, -32, 16, 7, C.teal1); k.textCenter('BOT', 0, -31, C.white);
  }
  function cafe(k) {
    k.rect(-16, 1, 38, 3, C.shadow);
    k.rect(-18, -22, 36, 22, C.wood3); for (let x = -16; x < 18; x += 4) k.rect(x, -22, 1, 22, C.wood2); k.rect(-18, -22, 1, 22, C.wood4); k.rect(16, -22, 2, 22, C.wood1);
    k.rect(-14, -17, 20, 9, '#2a1e16'); k.rect(-14, -17, 20, 1, C.wood1);
    k.rect(-12, -14, 5, 6, C.stone1); k.rect(-11, -13, 3, 2, C.stone3); k.px(-10, -9, C.ink); k.rect(-4, -13, 3, 5, C.terra2); k.rect(1, -12, 4, 4, C.gold1);
    k.rect(-16, -8, 34, 3, C.stone4); k.rect(-16, -8, 34, 1, C.white);
    k.rect(9, -18, 7, 12, C.slate0); k.rect(10, -17, 5, 1, C.paper); k.rect(10, -15, 4, 1, C.paper2); k.rect(10, -13, 5, 1, C.paper); k.rect(10, -11, 3, 1, C.paper2);
    Props.awning(k, -20, -26, 40, C.teal2, C.paper, 6);
    k.rect(-12, -34, 24, 7, C.wood1); k.rect(-11, -33, 22, 5, C.teal1); k.textCenter('CAFE', 0, -33, C.paper);
    for (const [x, y] of [[-12, 28], [14, 30]]) {
      k.ellipse(x + 1, y + 1, 7, 2, C.shadow); k.rect(x, y - 7, 1, 7, C.slate1); k.ellipse(x, y - 8, 6, 2, C.stone5); k.ellipse(x, y - 8, 5, 1, C.white);
      k.rect(x - 2, y - 10, 2, 2, C.white); k.rect(x + 2, y - 10, 2, 2, C.terra3);
    }
    Props.pot(k, -22, -6); Props.pot(k, 20, -6);
  }

  /* ---------- south-east campus ---------- */
  function dronePad(k) {
    k.ellipse(2, 2, 40, 19, C.shadowSoft);
    k.ellipse(0, 0, 38, 18, C.slate0); k.ellipse(0, -1, 37, 17, C.slate1); k.ditherEllipse(0, 0, 36, 16, C.slate2, 1);
    k.ring(0, 0, 32, 14, C.gold2); k.ring(0, 0, 31, 14, C.gold1);
    k.rect(-9, -6, 3, 12, C.white); k.rect(6, -6, 3, 12, C.white); k.rect(-6, -1, 12, 3, C.white); k.rect(-9, 5, 3, 1, C.stone3); k.rect(6, 5, 3, 1, C.stone3);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.rect(Math.round(Math.cos(a) * 36) - 1, Math.round(Math.sin(a) * 16), 3, 2, C.slate0); }
  }
  function lockers(k) {
    k.rect(-18, 1, 42, 3, C.shadow);
    k.rect(-21, -26, 42, 4, C.slate2); k.rect(-21, -26, 42, 1, C.slate4);
    k.rect(-20, -22, 40, 22, C.stone4); k.rect(-20, -22, 1, 22, C.white); k.rect(19, -22, 1, 22, C.stone2);
    for (let i = 0; i < 3; i++) { const x = -19 + i * 13; k.rect(x, -20, 12, 14, C.slate0); k.rect(x + 1, -19, 10, 12, '#1a2230'); k.rect(x + 2, -9, 8, 1, C.slate2); k.rect(x + 5, -4, 2, 2, C.slate1); }
    k.rect(-20, -2, 40, 2, C.stone2);
  }
  function groundControl(k) {
    Props.table(k, -14, 0, 28, 9, C.stone3);
    for (const x of [-11, 2]) { k.rect(x, -10, 9, 2, C.slate1); k.rect(x + 1, -16, 7, 6, C.ink); k.rect(x + 2, -15, 5, 4, GLASS); }
    k.rect(-16, -3, 6, 3, C.gold1); k.rect(-16, -3, 6, 1, C.gold3);
    // Tripod antenna with a tracking dish.
    k.line(18, 0, 21, -18, C.slate1); k.line(24, 0, 21, -18, C.slate1); k.line(21, 0, 21, -18, C.slate0);
    k.ellipse(21, -21, 4, 3, C.stone5); k.ellipse(22, -21, 2, 2, C.stone3); k.rect(20, -26, 1, 4, C.slate1);
    k.rect(-22, -4, 6, 4, C.slate2); k.rect(-22, -4, 6, 1, C.slate4);
  }
  function lab(k) {
    k.poly([[52, 1], [59, -5], [59, -42], [52, -48]], C.shadow); k.rect(-50, 1, 106, 3, C.shadowSoft);
    k.rect(-53, -49, 106, 13, C.stone3); k.dither(-53, -49, 106, 13, C.stone2, 1); k.rect(-53, -49, 106, 1, C.stone5); k.rect(-53, -37, 106, 1, C.stone1);
    for (const x of [-40, -24]) { k.rect(x, -47, 10, 6, C.stone4); k.rect(x, -47, 10, 1, C.white); for (let i = 1; i < 10; i += 2) k.px(x + i, -44, C.slate1); }
    for (let i = 0; i < 4; i++) pvPanel(k, 0 + i * 12, -47, 10, 4);
    k.rect(-52, -36, 104, 36, C.stone4); k.rect(-52, -36, 104, 2, C.white); k.rect(50, -36, 2, 36, C.stone2);
    for (let x = -52; x < 52; x += 13) k.rect(x, -34, 1, 34, C.stone3);
    k.rect(-50, -32, 100, 6, '#2a4452'); k.rect(-50, -32, 100, 2, C.glass); for (let x = -50; x < 50; x += 10) k.rect(x, -32, 1, 6, C.stone3);
    // Open roller door: a robot arm inside on its bench.
    k.rect(-46, -24, 30, 24, C.slate1); k.rect(-45, -23, 28, 23, '#161c24'); for (let y = -26; y < -23; y++) k.rect(-46, y, 30, 1, y % 2 ? C.slate2 : C.slate3);
    k.rect(-44, -8, 24, 3, C.slate2); k.rect(-38, -12, 4, 4, C.gold1); k.line(-36, -12, -31, -19, C.gold1, 2); k.line(-31, -19, -25, -16, C.gold2, 2); k.px(-24, -15, C.slate3);
    for (const x of [-46, -17]) k.rect(x, -24, 1, 24, C.gold2);
    // Windows on the right with screens.
    k.rect(0, -21, 48, 14, C.slate0); k.rect(1, -20, 46, 12, '#1e2c36'); k.rect(1, -20, 46, 2, S(C.glass, -.2));
    for (const [x, y, w, h] of LAB_SCR) { k.rect(x - 1, y - 1, w + 2, h + 2, C.ink); k.rect(x, y, w, h, GLASS); }
    k.rect(26, -12, 8, 4, C.stone3); k.rect(28, -16, 3, 4, C.stone5); k.px(29, -16, C.teal4);
    k.rect(-12, -34, 26, 6, C.teal1); k.textCenter('ROBOT', 1, -34, C.white);
    k.rect(-52, -2, 104, 2, C.stone3);
  }
  function hazardEdge(k, x, y, w) { for (let i = 0; i < w; i++) k.px(x + i, y, Math.floor((i + 800) / 3) % 2 ? C.gold2 : C.ink); }
  function bollard(k) { k.rect(1, 0, 3, 1, C.shadow); k.rect(-1, -7, 3, 7, C.gold2); k.rect(-1, -5, 3, 2, C.ink); k.rect(-1, -7, 1, 7, C.gold3); k.rect(-1, -8, 3, 1, C.stone4); }
  function shelf(k) {
    k.rect(-8, 1, 22, 2, C.shadow);
    for (const x of [-10, 9]) k.rect(x, -26, 2, 26, C.slate1);
    for (let r = 0; r < 3; r++) {
      const y = -26 + r * 9; k.rect(-10, y + 7, 21, 2, C.slate2); k.rect(-10, y + 7, 21, 1, C.slate4);
      for (let i = 0; i < 3; i++) { const h = P.hash(r, i); if (h < .2) continue; k.rect(-8 + i * 6, y + 2 + (h > .6 ? 1 : 0), 5, 5 - (h > .6 ? 1 : 0), [C.teal2, C.wood3, C.stone4, C.red1][(r + i) % 4]); k.rect(-8 + i * 6, y + 2 + (h > .6 ? 1 : 0), 5, 1, C.white); }
    }
  }
  function workcell(k) {
    k.rect(-38, 3, 82, 3, C.shadow);
    k.rect(-40, -24, 80, 24, C.slate2); k.rect(-40, -24, 80, 1, C.slate4);
    for (let x = -40; x < 40; x += 10) k.rect(x, -24, 1, 24, C.slate1);
    for (let y = -20; y < 0; y += 6) for (let x = -38; x < 40; x += 10) k.px(x, y, C.slate3);
    k.rect(-40, 0, 80, 3, C.slate1); hazardEdge(k, -40, -1, 80); hazardEdge(k, -40, -24, 80);
    k.rect(-38, -8, 76, 5, C.slate0); k.rect(-38, -8, 76, 1, C.slate3); k.rect(-38, -4, 76, 1, C.ink);
    for (const x of [-38, 36]) { k.rect(x, -9, 3, 7, C.stone2); k.px(x + 1, -7, C.stone5); }
    for (const x of [-20, 20]) { k.ellipse(x, -12, 6, 2, C.shadow); k.rect(x - 4, -18, 8, 6, C.slate0); k.rect(x - 4, -18, 3, 6, C.slate1); k.ellipse(x, -18, 4, 1, C.slate3); }
    // Parts bin, a tool cart and the control pedestal with its screen.
    k.rect(-36, -22, 10, 6, C.teal2); k.rect(-36, -22, 10, 1, C.teal4); k.px(-33, -23, C.gold2); k.px(-30, -23, C.stone4);
    k.rect(28, -22, 10, 8, C.red1); k.rect(28, -22, 10, 1, C.red3); k.rect(29, -19, 8, 1, C.red0);
    k.rect(46, 1, 8, 2, C.shadow); k.rect(44, -20, 8, 20, C.slate1); k.rect(44, -20, 1, 20, C.slate3); k.rect(44, -24, 8, 5, C.ink); k.rect(45, -23, 6, 3, GLASS);
  }
  function testCourse(k) {
    for (let i = 0; i < 40; i++) { if (i % 2) continue; const a = i / 40 * Math.PI * 2; k.rect(Math.round(Math.cos(a) * 42), Math.round(Math.sin(a) * 16), 2, 1, C.stone5); }
    for (const [x, y] of [[-46, -8], [46, 8], [-20, 20], [22, -20]]) { k.rect(x - 2, y - 1, 5, 2, C.terra1); k.poly([[x - 2, y - 1], [x, y - 7], [x + 2, y - 1]], C.terra3); k.rect(x - 1, y - 4, 3, 1, C.white); }
    // A small ramp and a stair block for walking tests.
    k.poly([[-12, 4], [4, 4], [4, -2]], C.stone3); k.line(-12, 4, 4, -2, C.stone5); k.rect(4, -2, 8, 6, C.stone2); k.rect(4, -2, 8, 1, C.stone4); k.rect(12, 1, 6, 3, C.stone2); k.rect(12, 1, 6, 1, C.stone4);
    k.rect(-58, 10, 8, 10, C.slate1); k.rect(-58, 10, 8, 1, C.slate3); k.rect(-57, 12, 6, 3, GLASS);
  }
  function humDock(k) {
    k.ellipse(0, 0, 11, 4, C.slate0); k.ellipse(0, -1, 10, 3, C.slate2); k.ring(0, -1, 8, 3, C.teal3);
    k.rect(8, -24, 4, 24, C.stone4); k.rect(8, -24, 1, 24, C.white); k.rect(11, -24, 1, 24, C.stone2); k.rect(8, -26, 4, 2, C.slate1); k.rect(9, -18, 2, 3, C.working);
  }
  function pvRow(k, cx, w, y, gap) {
    const x0 = cx - (w >> 1), n = Math.floor(w / 13);
    k.rect(x0, y - 1, n * 13, 2, C.shadowSoft);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * 13;
      k.rect(x + 2, y - 5, 1, 5, C.stone1); k.rect(x + 9, y - 5, 1, 5, C.stone1); k.rect(x + 3, y - 6, 1, 2, C.stone2);
      if (i === gap) { k.rect(x, y - 15, 12, 1, C.stone2); k.rect(x, y - 6, 12, 1, C.stone2); k.rect(x + 3, y - 15, 1, 10, C.stone1); k.rect(x + 8, y - 15, 1, 10, C.stone1); continue; }
      k.rect(x + 1, y - 4, 12, 3, C.shadowSoft);
      k.rect(x, y - 16, 12, 11, C.stone4); k.rect(x, y - 6, 12, 1, C.stone1);
      k.rect(x + 1, y - 15, 10, 9, PV[1]); for (let yy = y - 12; yy < y - 6; yy += 3) k.rect(x + 1, yy, 10, 1, PV[0]); for (let xx = x + 4; xx < x + 11; xx += 3) k.rect(xx, y - 15, 1, 9, PV[0]);
      k.rect(x + 1, y - 15, 10, 1, PV[2]); k.px(x + 2, y - 14, PV[3]); k.px(x + 3, y - 14, PV[2]); k.px(x + 2, y - 13, PV[2]);
    }
  }
  function bess(k) {
    k.poly([[19, 1], [25, -4], [25, -20], [19, -24]], C.shadow);
    k.rect(-19, -24, 38, 4, C.stone3); k.rect(-19, -24, 38, 1, C.stone5);
    k.rect(-19, -20, 38, 20, C.stone5); for (let x = -17; x < 19; x += 3) k.rect(x, -20, 1, 20, C.stone4); k.rect(-19, -20, 1, 20, C.white); k.rect(18, -20, 1, 20, C.stone2);
    k.rect(-15, -17, 12, 16, C.stone4); k.rect(-15, -17, 12, 1, C.white); k.rect(-9, -17, 1, 16, C.stone2);
    k.rect(-1, -18, 18, 6, C.teal1); k.text('BESS', 1, -17, C.white);
    k.rect(6, -9, 10, 5, C.ink); k.rect(-19, -2, 38, 2, C.stone2);
    k.rect(22, -10, 6, 10, C.slate1); k.rect(22, -10, 6, 1, C.slate3); k.px(24, -7, C.gold2);
  }
  function evCharger(k, x, y) { k.rect(x + 1, y, 6, 2, C.shadow); k.rect(x, y - 14, 5, 14, C.stone5); k.rect(x, y - 14, 1, 14, C.white); k.rect(x + 4, y - 14, 1, 14, C.stone3); k.rect(x + 1, y - 12, 3, 3, C.teal1); k.px(x + 2, y - 11, C.working); k.line(x + 5, y - 8, x + 8, y - 2, C.ink); }
  function promFountain(k) {
    k.ellipse(3, 5, 26, 9, C.shadow);
    k.ellipse(0, 3, 24, 9, M[1]); k.ellipse(0, 2, 24, 9, M[3]); k.ellipse(-2, 1, 21, 7, M[5]);
    k.ellipse(0, 1, 20, 7, C.water0); k.ellipse(0, 2, 19, 6, C.water1); k.ellipse(-1, 2, 16, 4, C.water2); k.ellipse(-6, 0, 6, 2, C.water3);
    k.rect(-2, -12, 5, 13, M[3]); k.rect(-2, -12, 2, 13, M[5]); k.rect(2, -12, 1, 13, M[1]);
    k.ellipse(0, -12, 8, 3, M[1]); k.ellipse(0, -13, 8, 3, M[4]); k.ellipse(0, -13, 6, 2, C.water2);
    k.rect(-1, -18, 3, 5, M[4]); k.px(-1, -18, M[5]); k.rect(-1, -20, 2, 2, C.gold2);
  }

  /* ---------- animated figures and machines (cached sprites) ---------- */
  const droneSprite = (f, lit) => P.sprite(`hq-drone|${f}|${lit}`, 17, 7, 8, 4, q => {
    q.rect(-6, -1, 13, 1, C.slate1); q.px(-6, -1, C.slate3);
    for (const rx of [-6, 6]) { if (f === 1) q.rect(rx - 2, -3, 5, 1, '#c8d0dc'); else if (f === 2) { q.px(rx - 2, -3, '#c8d0dc'); q.px(rx + 2, -3, '#c8d0dc'); } else q.rect(rx - 1, -3, 3, 1, '#9aa2ae'); q.px(rx, -2, C.slate0); }
    q.rect(-2, -2, 5, 3, C.slate2); q.rect(-2, -2, 5, 1, C.stone4); q.px(2, 0, C.slate0); q.px(-1, 0, lit || C.slate1);
    q.px(-2, 1, C.slate0); q.px(2, 1, C.slate0);
  });
  const crashSprite = () => P.sprite('hq-drone-crash', 17, 9, 8, 6, q => {
    q.line(-6, 1, 6, -3, C.slate1); q.rect(-2, -3, 5, 3, C.slate2); q.rect(-2, -3, 5, 1, C.stone4); q.px(0, -1, C.error);
    q.line(4, -5, 8, -6, '#9aa2ae'); q.px(-7, 1, '#9aa2ae'); q.px(-5, 2, '#9aa2ae'); q.px(-2, 1, C.slate0); q.px(7, 1, C.slate1); q.px(9, 2, C.slate2);
  });
  function drone(k, x, y, alt, t, lit, i = 0) {
    x = Math.round(x); y = Math.round(y); alt = Math.round(alt);
    k.alpha(Math.max(.25, .7 - alt / 90), () => k.ellipse(x + 1, y + 1, Math.max(2, 5 - alt / 16), 1, C.ink));
    const f = alt > 0 ? 1 + (Math.floor(t * 24 + i) % 2) : 0;
    k.blit(droneSprite(f, lit), x, y - alt);
  }
  const DOG = { body: C.stone4, lit: C.stone5, sh: C.stone2, j: C.slate0, j2: C.slate1 };
  const dogSprite = f => P.sprite(`hq-dog|${f}`, 20, 14, 10, 12, q => {
    if (f === 'down') {
      q.rect(-7, -4, 13, 4, DOG.body); q.rect(-7, -4, 13, 1, DOG.lit); q.rect(-7, -1, 13, 1, DOG.sh);
      q.line(-5, -4, -7, -8, DOG.j); q.line(3, -4, 5, -8, DOG.j); q.rect(6, -4, 3, 3, DOG.j); q.px(8, -3, C.error); return;
    }
    const sit = f === 'sit', by = sit ? -7 : -9;
    if (sit) { q.rect(-7, -3, 5, 3, DOG.j); q.px(-3, -4, DOG.j2); q.rect(3, by + 3, 1, 7 - (by + 3) + by + 3, DOG.j); q.line(3, by + 3, 3, -1, DOG.j); q.line(5, by + 3, 5, -1, DOG.j2); }
    else {
      const sw = [[1, 0], [0, 1], [-1, 0], [0, -1]][f];
      for (const [lx, ph, far] of [[-5, 1, 1], [4, 0, 1], [-4, 0, 0], [5, 1, 0]]) {
        const d = ph ? sw : [-sw[0], -sw[1]], fx = lx + d[0], lift = d[1] > 0 ? 1 : 0;
        q.line(lx, by + 3, lx + (d[0] > 0 ? 1 : 0), by + 6, far ? DOG.j2 : DOG.j); q.line(lx + (d[0] > 0 ? 1 : 0), by + 6, fx, -1 - lift, far ? DOG.j2 : DOG.j);
      }
    }
    const tilt = sit ? 1 : 0;
    q.rect(-6, by + tilt, 6, 4, DOG.body); q.rect(0, by, 6, 4, DOG.body); q.rect(-6, by + tilt, 12, 1, DOG.lit); q.rect(-6, by + 3 + tilt, 12, 1, DOG.sh);
    q.rect(-2, by + 1, 4, 1, C.gold2); q.rect(-5, by - 1, 3, 1, C.slate2);
    q.rect(6, by - 2, 4, 3, DOG.j); q.rect(6, by - 2, 4, 1, C.slate2); q.px(9, by - 1, C.teal4);
  });
  const roverSprite = () => P.sprite('hq-rover', 20, 16, 9, 13, q => {
    q.rect(-7, -7, 15, 4, C.stone5); q.rect(-7, -7, 15, 1, C.white); q.rect(-7, -4, 15, 1, C.stone2);
    q.rect(-6, -9, 8, 2, PV[1]); q.rect(-6, -9, 8, 1, PV[3]);
    q.rect(4, -13, 1, 6, C.slate1); q.rect(3, -15, 4, 2, C.slate0); q.px(6, -14, C.teal4);
    for (const wx of [-5, 0, 5]) { q.circle(wx, -2, 2, C.ink); q.px(wx, -2, C.slate2); }
    q.rect(-7, -3, 15, 1, C.slate1);
  });
  const humSprite = f => P.sprite(`hq-humanoid|${f}`, 16, 28, 8, 26, q => {
    const W = C.stone5, Ws = C.stone3, J = C.slate1;
    q.rect(-3, -10, 2, 10, J); q.rect(1, -10, 2, 10, J); q.rect(-4, -1, 3, 1, C.slate0); q.rect(1, -1, 3, 1, C.slate0);
    q.rect(-3, -12, 7, 3, Ws);
    q.rect(-4, -20, 9, 9, W); q.rect(-4, -20, 1, 9, C.white); q.rect(4, -20, 1, 9, Ws); q.rect(-1, -17, 3, 2, f === 3 ? C.slate0 : f === 2 ? C.error : C.teal4);
    q.rect(-2, -22, 5, 2, J);
    q.rect(-3, -27, 7, 5, W); q.rect(-3, -27, 7, 1, C.white); q.rect(-2, -25, 5, 2, f === 3 ? C.slate0 : '#10141c'); q.px(1, -25, f === 3 ? C.slate1 : f === 2 ? C.error : C.teal4);
    if (f === 1) { q.line(5, -19, 8, -25, W, 2); q.rect(7, -27, 2, 2, Ws); } else q.line(5, -19, 6, -12, W, 2);
    q.line(-5, -19, -6, -12, Ws, 2);
  });
  const agvSprite = load => P.sprite(`hq-agv|${load}`, 20, 14, 10, 12, q => {
    q.rect(-8, -4, 16, 3, C.slate2); q.rect(-8, -4, 16, 1, C.slate4); q.rect(-8, -2, 16, 1, C.slate0); q.px(7, -3, C.teal4); q.px(-8, -3, C.gold2);
    q.rect(-6, -1, 2, 1, C.ink); q.rect(4, -1, 2, 1, C.ink);
    if (load) { q.rect(-5, -11, 10, 7, C.wood3); q.rect(-5, -11, 10, 1, C.wood5); q.rect(-1, -11, 2, 7, C.wood1); }
  });
  const botSprite = () => P.sprite('hq-delivery', 12, 16, 6, 14, q => {
    q.rect(-5, -9, 10, 7, C.stone5); q.rect(-5, -9, 10, 1, C.white); q.rect(-5, -3, 10, 1, C.stone2); q.rect(-5, -7, 10, 1, C.teal2);
    q.rect(1, -6, 3, 2, '#10141c'); q.px(2, -6, C.teal4);
    for (const wx of [-3, 0, 3]) q.rect(wx - 1, -2, 2, 2, C.ink);
    q.rect(-4, -15, 1, 6, C.slate1); q.rect(-3, -15, 3, 2, C.gold2);
  });

  /* ---------- screens, lamps and overlays ---------- */
  function screen(k, x, y, w, h, t, st, seed, det) {
    if (st === 'off') return;
    if (st === 'error') { const on = Math.floor(t * 4 + seed) % 2; k.rect(x, y, w, h, on ? C.error : C.red0); if (on && w >= 6 && h >= 5) { const cx = x + (w >> 1); k.rect(cx, y + 1, 1, h - 3, C.white); k.px(cx, y + h - 1, C.white); } return; }
    if (st === 'waiting') { k.rect(x, y, w, h, '#4a3410'); k.rect(x, y, w, 1, C.waiting); if (Math.floor(t * 2 + seed * .3) % 2 && w >= 6 && h >= 5) k.text('?', x + (w >> 1) - 1, y + (h >> 1) - 2, C.waiting); else k.rect(x + 1, y + h - 2, Math.max(1, (w - 2) >> 1), 1, C.waiting); return; }
    if (st === 'idle') { k.rect(x, y, w, h, '#18243c'); const p = Math.floor(t * 1.2 + seed) % Math.max(1, w - 2); k.px(x + 1 + p, y + (h >> 1), C.idle); if (det) k.px(x + 1, y + 1, S(C.idle, -.3)); return; }
    k.rect(x, y, w, h, '#0c1820');
    if (!det) { k.rect(x + 1, y + 1, w - 2, 1, C.working); return; }
    const kind = seed % 3;
    if (kind === 0) {
      for (let r = 0; r < h - 1; r += 2) { const n = Math.floor(t * 3) + r / 2 + seed, len = 2 + Math.floor(P.hash(n, seed) * (w - 4)), ind = P.hash(seed, n) < .4 ? 2 : 0; k.rect(x + 1 + ind, y + 1 + r, Math.min(len, w - 2 - ind), 1, [C.working, C.teal4, C.paper, C.gold3][n % 4]); }
    } else if (kind === 1) {
      for (let i = 0; i < (w - 1) >> 1; i++) { const bh = 1 + Math.floor((Math.sin(t * 2 + i * 1.3 + seed) * .5 + .5) * (h - 3)); k.rect(x + 1 + i * 2, y + h - 1 - bh, 1, bh, i % 3 ? C.teal4 : C.gold3); }
    } else {
      for (let i = 0; i < w - 2; i++) k.px(x + 1 + i, y + 1 + Math.round((Math.sin(t * 1.5 + i * .6 + seed) * .5 + .5) * (h - 3)), C.working);
      k.rect(x + 1, y + h - 1, w - 2, 1, S(C.working, -.5));
    }
  }
  function bigScreen(k, t, st, det) {
    const x = -20, y = -49, w = 40, h = 26;
    if (st === 'off') return;
    if (st === 'error') { const on = Math.floor(t * 3) % 2; k.rect(x, y, w, h, on ? C.red1 : C.red0); k.textCenter('ERROR', 0, y + 5, on ? C.white : C.red3); k.rect(x + 4, y + 14, w - 8, 1, C.red3); for (let i = 0; i < 6; i++) k.rect(x + 5 + i * 5, y + 16 + (i * 3) % 5, 3, 1, C.red3); return; }
    if (st === 'waiting') { k.rect(x, y, w, h, '#3a2a0c'); k.rect(x, y, w, 2, C.waiting); if (Math.floor(t * 2) % 2) k.textCenter('HOLD', 0, y + 6, C.waiting); k.textCenter('?', 0, y + 15, C.waiting, 1); for (let i = 0; i < 5; i++) k.rect(x + 8 + i * 6, y + 22, 4, 1, i < 2 ? C.waiting : S(C.waiting, -.6)); return; }
    if (st === 'idle') { k.rect(x, y, w, h, '#142038'); k.textCenter('HQ', 0, y + 6, C.idle); const p = (t * .3) % 1; k.ring(0, y + 17, 3 + Math.round(p * 8), 1 + Math.round(p * 3), S(C.idle, -.2)); return; }
    k.rect(x, y, w, h, '#0a141c'); k.rect(x, y, w, 7, '#10202a'); k.text('OPS', x + 2, y + 1, C.working);
    for (let i = 0; i < 4; i++) k.rect(x + 18 + i * 5, y + 2, 3, 3, [C.working, C.working, C.gold3, C.working][(i + Math.floor(t)) % 4]);
    for (let i = 0; i < 18; i++) k.px(x + 2 + i, y + 21 - Math.round((Math.sin(t * 1.2 + i * .45) * .5 + .5) * 11), C.teal4);
    for (let i = 0; i < 7; i++) { const bh = 2 + Math.floor((Math.sin(t * 1.7 + i) * .5 + .5) * 11); k.rect(x + 23 + i * 2, y + 23 - bh, 1, bh, i % 2 ? C.gold3 : C.working); }
    if (det) for (let i = 0; i < 3; i++) k.px(x + 3 + ((Math.floor(t * 8) + i * 6) % 34), y + 24, C.paper);
  }
  // A small state lamp: colour and blink rhythm follow the state; dark when off.
  function beacon(k, x, y, t, st) {
    const col = C[st], on = st === 'error' ? Math.floor(t * 4) % 2 : st === 'waiting' ? Math.floor(t * 1.6) % 2 : 1;
    if (st === 'off' || !on) { k.rect(x - 1, y - 3, 3, 3, C.slate1); return; }
    k.alpha(.3, () => k.circle(x, y - 2, 4, col)); k.rect(x - 1, y - 3, 3, 3, col); k.px(x - 1, y - 3, C.white);
  }
  // VR headset over a standing crew head (the crew faces right unless f = -1).
  function vrHead(k, x, y, f, t, col = C.teal4) {
    const X = f < 0 ? x - 4 : x - 1;
    k.rect(X, y - 18, 6, 3, '#1e2230'); k.rect(f < 0 ? x + 2 : x - 3, y - 18, 2, 1, '#1e2230');
    k.rect(f < 0 ? X + 1 : X + 1, y - 17, 4, 1, Math.floor(t * 3) % 3 ? col : S(col, .4));
  }
  function handHeld(k, x, y, f, kind, t, glow) {
    const hx = f < 0 ? x - 10 : x + 5;
    if (kind === 'tablet') { k.rect(hx, y - 12, 5, 4, C.ink); k.rect(hx + 1, y - 11, 3, 2, glow); }
    else { k.rect(hx, y - 10, 5, 3, C.slate1); k.rect(hx, y - 10, 5, 1, C.slate3); k.px(f < 0 ? hx : hx + 4, y - 12, C.slate0); k.px(f < 0 ? hx : hx + 4, y - 11, C.slate0); k.px(hx + 2, y - 9, glow); }
  }
  const spear = (k, x, y, f = 1) => { const sx = x + (f > 0 ? 6 : -5); k.rect(sx, y - 27, 1, 26, C.wood2); k.rect(sx, y - 31, 1, 4, C.stone4); k.px(sx - 1, y - 28, C.stone3); k.px(sx + 1, y - 28, C.stone3); };
  const tabard = (k, x, y, col = TR) => { k.rect(x - 1, y - 12, 3, 6, col); k.px(x, y - 10, C.white); };
  function guard(k, z, x, y, f, ph, st) {
    z.crew(x, y, { look: 5, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: f, phase: ph, mark: false });
    if (st !== 'off') { tabard(k, x, y); spear(k, x, y, f); }
  }
  function jet(k, x, y, t, flow, sputter) {
    if (!flow) return;
    const h = sputter ? [2, 6, 1, 4][Math.floor(t * 7) % 4] : Math.max(2, Math.round(8 * flow));
    k.rect(x, y - h, 1, h, C.water5); k.px(x, y - h - 1, C.foam);
    for (const d of [-1, 1]) { const p = (t * 2 + (d > 0 ? .5 : 0)) % 1; k.px(x + d * Math.round(1 + p * 3), y - h + Math.round(p * p * (h + 1)), C.water4); }
    const rp = (t * 1.3) % 1; k.alpha(1 - rp, () => k.rect(x - 1 - Math.round(rp * 3), y + 1, 3 + Math.round(rp * 6), 1, C.foam));
  }
  function arm(k, x, y, a1, a2, col = C.gold2) {
    const L1 = 12, L2 = 10, ex = x + Math.cos(a1) * L1, ey = y + Math.sin(a1) * L1, ga = a1 + a2, hx = ex + Math.cos(ga) * L2, hy = ey + Math.sin(ga) * L2;
    k.line(x, y, ex, ey, S(col, -.4), 3); k.line(x, y - 1, ex, ey - 1, col, 1);
    k.line(ex, ey, hx, hy, S(col, -.4), 2); k.line(ex, ey - 1, hx, hy - 1, S(col, .25), 1);
    k.circle(x, y, 2, C.slate1); k.px(x - 1, y - 1, C.slate3); k.circle(ex, ey, 2, C.slate1); k.px(ex - 1, ey - 1, C.slate4);
    const gx = Math.cos(ga), gy = Math.sin(ga);
    for (const o of [-2, 2]) k.line(hx - gy * o, hy + gx * o, hx - gy * o + gx * 3, hy + gx * o + gy * 3, C.slate0);
    return [hx + gx * 3, hy + gy * 3];
  }
  function hologram(k, x, y, t, st) {
    if (st === 'off') return;
    const col = st === 'waiting' ? C.waiting : st === 'error' ? C.error : st === 'idle' ? C.idle : C.teal4;
    k.alpha(.18, () => k.poly([[x - 2, y + 14], [x + 3, y + 14], [x + 10, y - 2], [x - 9, y - 2]], col));
    if (st === 'waiting') { if (Math.floor(t * 2) % 2) k.text('?', x - 1, y - 6, col); return; }
    if (st === 'error') { for (let i = 0; i < 4; i++) { const g = Math.floor(t * 12 + i * 3) % 5; k.rect(x - 7 + g, y - 8 + i * 3, 6 + ((g * 3) % 5), 1, col); } return; }
    const a0 = t * (st === 'working' ? 1.6 : .4), pts = [0, 1, 2, 3].map(i => { const a = a0 + i * Math.PI / 2; return [x + Math.round(Math.cos(a) * 7), Math.round(Math.sin(a) * 3)]; });
    for (let i = 0; i < 4; i++) { const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % 4]; k.line(ax, y - 10 + az, bx, y - 10 + bz, col); k.line(ax, y - 1 + az, bx, y - 1 + bz, col); k.line(ax, y - 10 + az, ax, y - 1 + az, S(col, -.3)); }
  }

  /* ---------- the Atatürk statue: drawn in animate (the horse rises past the plot edge), cached with a dimmed copy ---------- */
  let stat = null;
  function statueImg() {
    if (stat || !window.AtaturkStatue) return stat;
    const W = 240, H = 262, OX = 106, OY = 250, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.translate(OX, OY); window.AtaturkStatue.draw(P.kit(c), 0, 0);
    const dv = document.createElement('canvas'); dv.width = W; dv.height = H; const d = dv.getContext('2d');
    d.drawImage(cv, 0, 0); d.globalCompositeOperation = 'source-atop'; d.globalAlpha = .38; d.fillStyle = '#141c3c'; d.fillRect(0, 0, W, H);
    return (stat = { cv, dv, ox: OX, oy: OY });
  }

  /* ---------- Turkish flags (as the old castle's): red field, white crescent and star, waving ---------- */
  const SUB = [[.25, .25], [.75, .25], [.25, .75], [.75, .75]];
  const STAR = G0 => { const p = [], cx = G0 * .8208, cy = G0 / 2, R = G0 * .14; for (let i = 0; i < 10; i++) { const a = Math.PI + i * Math.PI / 5, r = i % 2 ? R * .382 : R; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
  function inPoly(pts, x, y) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function trWhite(i, j, G0, star) {
    let n = 0, m = 0;
    for (const [du, dv] of SUB) { const u = i + du, v = j + dv, b = v - G0 / 2, a = u - G0 * .5, c = u - G0 * .5625; if (a * a + b * b <= (G0 * .25) ** 2 && c * c + b * b > (G0 * .2) ** 2) n++; if (inPoly(star, u, v)) m++; }
    return n >= 2 || m >= 1;
  }
  function flagSprite(G0, f, N) {
    const W = Math.round(G0 * 1.5), A = 2;
    return P.sprite(`hq-trflag|${G0}|${f}|${N}`, W, G0 + A * 2, 0, A, q => {
      const ph = f / N * Math.PI * 2, star = STAR(G0);
      for (let i = 0; i < W; i++) {
        const amp = Math.min(1, i / W * 1.4) * 1.5, sa = ph - i * .42, wy = Math.round(Math.sin(sa) * amp), sl = Math.cos(sa);
        const red = sl > .5 ? S(TR, .12) : sl < -.5 ? S(TR, -.22) : TR, wh = sl < -.5 ? C.stone4 : C.white;
        q.rect(i, wy, 1, G0, red); for (let j = 0; j < G0; j++) if (trWhite(i, j, G0, star)) q.px(i, j + wy, wh);
      }
      q.rect(0, 0, 1, G0, S(TR, -.1));
    }, S(TR, -.6));
  }
  const limpSprite = G0 => P.sprite(`hq-trlimp|${G0}`, 5, G0 + 2, 0, 0, q => { for (let i = 0; i < 5; i++) q.rect(i, 0, 1, G0 + (i % 2 ? 2 : 0) - i, [S(TR, .1), TR, S(TR, -.25), TR, S(TR, -.35)][i]); q.px(1, 3, C.white); q.px(1, 5, C.white); }, S(TR, -.6));
  function trFlag(k, x, y, G0, t, st) {
    if (st === 'off') { k.blit(limpSprite(G0), x + 1, y); return; }
    const N = 8, fps = st === 'working' ? 10 : st === 'idle' ? 5 : st === 'error' ? 13 : 7;
    k.blit(flagSprite(G0, ((Math.floor(t * fps) % N) + N) % N, N), x + 1, y);
  }

  return {
    paint(k, z) {
      s = z.village === 'daghan' ? -1 : 1;
      /* ===== Ground: paved walks, the plaza, yards and fields ===== */
      slab(k, MP([[100, -24], [312, -24], [330, 30], [100, 30]]), paveTex(C.stone3, 1));                    // promenade to the east
      slab(k, MP([[118, -108], [196, -108], [196, -64], [168, -24], [96, -24], [100, -64]]), paveTex(C.stone3, 2));   // walk up to the palace gate
      slab(k, MP([[144, 28], [170, 28], [170, 336], [144, 336]]), paveTex(C.stone3, 3));                    // south-east gate path
      slab(k, MP([[-440, -16], [-140, -16], [-140, 8], [-440, 8]]), paveTex(C.stone3, 4));                  // west spine
      slab(k, MP([[-246, 6], [-220, 6], [-220, 158], [-246, 158]]), paveTex(C.stone3, 5));                  // west gate path
      slab(k, MP([[-52, 124], [128, 124], [128, 246], [-52, 246]]), slabTex);                               // drone apron
      slab(k, MP([[182, 94], [334, 94], [362, 170], [346, 240], [182, 240]]), rubberTex, C.slate0);          // robot yard
      k.polyTex(MP([[4, 246], [314, 246], [314, 336], [4, 336]]), gravelTex);                                // solar field
      slab(k, MP([[-212, 58], [-160, 58], [-160, 114], [-212, 114]]), paveTex(C.stone4, 6));                // café terrace
      G(k, VR.x, VR.y, () => slab(k, ellPts(0, 2, 58, 27, 40), paveTex(C.stone4, 7)));
      G(k, PAL.x, PAL.y, () => forecourtBack(k));
      plaza(k);
      // The SE gate path cuts through the solar gravel; redraw its kerbs over it.
      slab(k, MP([[144, 240], [170, 240], [170, 336], [144, 336]]), paveTex(C.stone3, 3));

      /* ===== Back row: trees in the wedge west of the palace, the palace, its forecourt and gate ===== */
      for (const [x, y, kind, sz, v] of [[-14, -196, 'pine', 1, 1], [-4, -238, 'pine', 0, 2], [-30, -176, 'oak', 0, 3], [334, -160, 'pine', 1, 0], [344, -186, 'pine', 0, 2], [322, -128, 'oak', 0, 1]]) Props.tree(k, s * x, y, kind, sz, v);
      G(k, PAL.x, PAL.y, () => { palace(k); forecourtFront(k); });
      /* ===== West campus, back: OPS building, data centre, the desk deck, the LED wall ===== */
      G(k, OPS.x, OPS.y, () => opsBuilding(k));
      G(k, DC.x, DC.y, () => dataCentre(k));
      G(k, DECK.x, DECK.y, () => deck(k));
      G(k, LED.x, LED.y, () => ledWall(k));
      Props.bush(k, s * -122, -28, 1);
      /* Flag court south of the railing: tulip beds, a hedge behind the statue, benches and trees. */
      for (const [x, y] of [[206, -96], [262, -96]]) G(k, x + 22, y + 11, () => { trBed(k, -22, -11, 44, 20); topiary(k, 0, 12, false); });
      G(k, 60, -100, () => { Props.hedge(k, -38, 0, 76, 7); for (const x of [-34, -10, 14, 34]) topiary(k, x, 20, true); });
      for (const [x, y] of [[214, -46], [270, -46]]) G(k, x, y, () => Props.bench(k, -8, 0, 16));
      for (const x of [200, 300]) G(k, x, -52, () => lampPost(k, 0, 0));
      G(k, FOUNT.x, FOUNT.y, () => promFountain(k));
      for (const x of [118, 184, 290]) G(k, x, 26, () => lampPost(k, 0, 0));
      /* West campus, south: mast, dish, VR pad, robot dock, café. */
      G(k, MAST.x, MAST.y, () => mast(k));
      G(k, DISH.x, DISH.y, () => groundDish(k));
      G(k, VR.x, VR.y, () => vrPad(k));
      G(k, CAFE.x, CAFE.y, () => cafe(k));
      G(k, DOCK.x, DOCK.y, () => dock(k));
      for (const [x, y] of [[-252, 30], [-214, 30], [-252, 120], [-214, 120], [-146, -30]]) G(k, x, y, () => lampPost(k, 0, 0));
      for (const [x, y] of [[-280, 110], [-156, 130]]) G(k, x, y, () => Props.bench(k, -8, 0, 16));
      for (const [x, y, c] of [[-316, 110, ['#f2c14e', '#e46c52', C.paper]], [-208, 132, ['#c3a2c0', C.paper, '#e98aa0']], [-134, 38, ['#f2c14e', C.paper]]]) G(k, x, y, () => Props.flowerBed(k, -14, -5, 28, 9, c, Math.abs(x)));
      /* Statue plaza dressing (the statue itself is drawn in animate). */
      plazaDressing(k);
      /* ===== South-east campus ===== */
      G(k, LAB.x, LAB.y, () => lab(k));
      G(k, CELL.x, CELL.y, () => workcell(k));
      G(k, HUM.x, HUM.y, () => humDock(k));
      G(k, TEST.x, TEST.y, () => testCourse(k));
      G(k, 336, 204, () => shelf(k));
      for (let y = 102; y < 236; y += 16) G(k, 186, y, () => bollard(k));
      G(k, 204, 236, () => { Props.crate(k, -10, -9, 9); Props.crate(k, 0, -7, 7); k.rect(10, -6, 10, 5, C.red1); k.rect(10, -6, 10, 1, C.red3); k.rect(14, -8, 2, 2, C.slate0); });
      G(k, 300, 160, () => { k.rect(-10, -2, 20, 4, C.slate1); k.rect(-9, -1, 18, 2, C.teal1); k.rect(-9, -1, 18, 1, C.teal3); });
      G(k, LOCK.x, LOCK.y, () => lockers(k));
      G(k, 12, 166, () => { for (const [x, y, sz] of [[-6, -9, 9], [3, -9, 9], [-2, -17, 8], [8, -3, 6]]) { Props.crate(k, x, y, sz); k.rect(x + 1, y + (sz >> 1), sz - 2, 1, C.teal2); } });
      G(k, 116, 146, () => { k.ellipse(1, 0, 3, 1, C.shadow); k.rect(0, -26, 1, 26, C.stone2); k.px(0, -27, C.gold2); });
      G(k, PAD.x, PAD.y, () => dronePad(k));
      G(k, GCS.x, GCS.y, () => groundControl(k));
      for (const [x, y] of [[126, 156], [126, 182]]) G(k, x, y, () => evCharger(k, -2, 0));
      for (const y of [80, 150, 220, 300]) for (const x of [138, 178]) G(k, x, y, () => lampPost(k, 0, 0));
      G(k, BESS.x, BESS.y, () => bess(k));
      ROWS.forEach((y, r) => PVB.forEach((b, i) => G(k, b.x, y, () => pvRow(k, 0, b.w, 0, i === 1 && r === 1 ? 4 : -1))));
      G(k, 300, 300, () => { k.rect(-4, -8, 12, 8, C.wood3); k.rect(-4, -8, 12, 1, C.wood5); k.rect(-5, -16, 14, 8, PV[1]); k.rect(-5, -16, 14, 1, PV[3]); k.rect(-5, -9, 14, 1, C.stone4); });
      /* Trees, hedges and bushes around the campus edges (the edge trims any that would cross it). */
      for (const [x, y, kind, sz, v] of [
        [-360, 146, 'oak', 1, 0], [-296, 150, 'blossom', 1, 1], [-172, 150, 'oak', 1, 2], [-112, 142, 'fruit', 1, 3], [-410, 60, 'pine', 0, 1],
        [-130, -60, 'birch', 1, 0], [-108, 104, 'oak', 0, 2], [118, 136, 'oak', 1, 1], [-24, 214, 'pine', 0, 1], [118, 206, 'blossom', 0, 0],
        [326, 226, 'oak', 0, 2], [200, 20, 'blossom', 0, 3]]) Props.tree(k, s * x, y, kind, sz, v);
      for (const [x, y, w] of [[-376, 140, 50], [-208, 140, 60], [-140, 140, 40]]) Props.hedge(k, s > 0 ? x : -x - w, y, w, 6);
      for (const [x, y] of [[-420, 16], [-418, -30], [-72, 128], [180, 232]]) Props.bush(k, s * x, y, (x + y) & 3);
    },
    animate(k, t, state, z) {
      s = z.village === 'daghan' ? -1 : 1;
      const run = state === 'working', live = state !== 'off', calm = state === 'idle', wait = state === 'waiting', err = state === 'error', det = z.detail;
      const crew = (x, y, o) => z.crew(Math.round(x), Math.round(y), o);

      /* ===== Palace: flags, pools, guards at the door and the gate, the gate lantern ===== */
      G(k, PAL.x, PAL.y, () => {
        for (const cx of [-140, 140]) trFlag(k, cx, -102, 12, t + cx * .01, state);
        const flow = run ? 1 : calm ? .6 : wait ? .4 : err ? .7 : 0;
        for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) jet(k, sg * (50 + i * 20), 47, t + i * .3 + sg, flow, err);
        for (const sg of [-1, 1]) guard(k, z, sg * 22, 11, -sg, sg, state);
        for (const sg of [-1, 1]) guard(k, z, sg * 38, 94, -sg, sg + 3, state);
        const lc = run ? C.glassLit : calm ? S(C.glassLit, -.2) : wait ? (Math.floor(t * 1.6) % 2 ? C.waiting : S(C.waiting, -.5)) : err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : C.glassDark;
        k.rect(0, 82 - 47, 1, 5, C.slate0); k.rect(-2, 82 - 42, 5, 6, C.slate0); k.rect(-1, 82 - 41, 3, 4, lc);
        if (live) k.alpha(.25, () => k.circle(0, 82 - 39, 5, lc));
        for (const sg of [-1, 1]) trFlag(k, sg * 64, 16, 16, t + sg * .4, state);
        if (live && det) for (let i = 0; i < 3; i++) { const a = t * .45 + i * 2.1; Props.bird(k, Math.round(Math.cos(a) * (70 + i * 26)), Math.round(-150 + Math.sin(a) * 8 + i * 5), t + i); }
      });
      /* Visitors walk between the plaza and the palace gate. */
      if (run || calm) for (let i = 0; i < 2; i++) {
        const p = (t * (run ? .05 : .025) + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = 110 + q * 44 + i * 10, y = -30 - q * 66;
        crew(s * x, y, { look: i ? 4 : 2, hat: i ? 'scarf' : 'none', hatColor: C.plum3, anim: 'walk', facing: (back ? -1 : 1) * s, phase: i });
      }

      /* ===== OPS building: screens behind the glass, rooftop solar crew, the roof beacon ===== */
      G(k, OPS.x, OPS.y, () => {
        OPS_SCR.forEach(([x, y, w, h], i) => screen(k, x, y, w, h, t, state, i, det));
        if (run) {
          crew(-28, -42, { look: 3, hat: 'helmet', hatColor: C.gold2, anim: 'work', tool: 'hammer', phase: .2 });
          const p = (t * .07) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = Math.round(-76 + q * 36);
          crew(x, -42, { look: 1, hat: 'helmet', hatColor: C.gold2, anim: 'walk', carry: back ? '' : 'paper', facing: back ? -1 : 1, phase: .5 });
          if (!back) { k.rect(x - 7, -71, 14, 7, PV[1]); k.rect(x - 7, -71, 14, 1, PV[3]); k.rect(x - 7, -65, 14, 1, C.stone4); for (let i = -4; i < 7; i += 4) k.rect(x + i, -70, 1, 5, PV[0]); }
        } else if (wait || err) crew(-28, -42, { look: 3, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: -1 });
        beacon(k, 81, -56, t, state);
      });
      /* Data centre: rack LEDs and the chiller fans. */
      G(k, DC.x, DC.y, () => {
        if (live) for (let i = 0; i < 5; i++) for (let r = 0; r < 5; r++) {
          const x = -28 + i * 8, y = -25 + r * 3, h = P.hash(i * 7 + r, Math.floor(t * (run ? 6 : 1.2) + i));
          const col = err ? (Math.floor(t * 4 + i + r) % 2 ? C.error : C.red0) : wait ? (r % 2 ? C.waiting : '#1e2632') : h < (run ? .55 : .8) ? C.working : C.teal1;
          k.px(x, y, col); if (det) k.px(x + 2, y, h > .75 ? C.gold3 : C.slate1);
        }
        for (const fx of [-20, -6]) { const a = live && !err ? t * (run ? 9 : 3) + fx : fx * .1; k.line(fx - Math.round(Math.cos(a) * 3), -38 - Math.round(Math.sin(a)), fx + Math.round(Math.cos(a) * 3), -38 + Math.round(Math.sin(a)), C.slate0); }
        if (err) Props.smoke(k, -13, -44, t, 4, '#4a4640');
      });
      /* Comms mast: aviation light, data pulses from the dish while working. */
      G(k, MAST.x, MAST.y, () => {
        if (live && Math.floor(t * 1.5) % 2) { k.alpha(.35, () => k.circle(0, -87, 3, C.error)); k.rect(-1, -88, 2, 2, C.error); }
        if (run && det) for (let i = 0; i < 3; i++) { const p = (t * .8 + i / 3) % 1; k.alpha(1 - p, () => k.ring(-12 - p * 14, -58, 1 + p * 3, 3 + p * 7, C.teal4, 2)); }
      });

      /* ===== Desk deck: screens and the people at their PCs ===== */
      G(k, DECK.x, DECK.y, () => {
        DESKS.forEach(([cx, dy], i) => {
          screen(k, cx - 3, dy - 20, 12, 7, t, state, i + 3, det);
          const seated = run || wait || err ? true : calm ? i % 2 === 0 : i === 5;
          if (!seated) return;
          crew(cx - 16, dy + 1, { look: i % 6, hat: i === 2 ? 'cap' : i === 6 ? 'scarf' : 'none', hatColor: i === 2 ? C.teal2 : C.plum3, anim: 'sit', phase: i * .37, mark: i % 3 === 0 });
          if (run && det) { const f = Math.floor(t * 9 + i * 3) % 3; k.px(cx - 10 + f * 2, dy - 9, C.skin2); k.px(cx - 6 + ((f + 1) % 3), dy - 9, C.skin1); }
        });
        if (run) { const p = (t * .04) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2; crew(-84 + q * 168, -2, { look: 4, hat: 'none', anim: 'walk', carry: back ? '' : 'paper', facing: back ? -1 : 1, phase: .6 }); }
        if (err) crew(46, 4, { look: 1, anim: 'idle', facing: -1, phase: .2 });
      });
      /* LED wall and its audience. */
      G(k, LED.x, LED.y, () => {
        bigScreen(k, t, state, det);
        if (calm) { crew(-10, 14, { look: 2, anim: 'idle', facing: 1, phase: .1 }); crew(6, 16, { look: 5, hat: 'cap', hatColor: C.red2, anim: 'idle', facing: -1, phase: .6 }); }
        else if (wait) for (let i = 0; i < 3; i++) crew(-14 + i * 12, 14 + (i % 2) * 2, { look: i + 1, anim: 'idle', facing: -1, phase: i * .3 });
        else if (run) crew(0, 14, { look: 3, anim: 'idle', facing: -1, phase: .4, mark: false });
      });
      /* People on the west spine; the delivery robot runs errands while working. */
      if (run) {
        for (let i = 0; i < 2; i++) { const p = (t * .03 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = -410 + q * 250; crew(s * x, i ? 6 : -2, { look: i ? 5 : 0, hat: i ? 'cap' : 'none', hatColor: C.teal3, anim: 'walk', carry: i ? 'box' : '', facing: (back ? -1 : 1) * s, phase: i * .3 }); }
        const p = (t * .025) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = -360 + q * 200;
        k.ellipse(s * x + 1, 4, 6, 1, C.shadow); k.blit(botSprite(), s * x, 4, (back ? -1 : 1) * s < 0);
        const gp = (t * .06) % 1, gb = gp > .5, gq = gb ? (1 - gp) * 2 : gp * 2;
        crew(s * -233, 150 - gq * 140, { look: 2, hat: 'hood', anim: 'walk', carry: gb ? '' : 'mail', facing: 1, phase: .8 });
      }
      /* Robot dock: the delivery robots rest here unless one is out. */
      G(k, DOCK.x, DOCK.y, () => {
        for (const [x, i] of [[-12, 0], [10, 1]]) { if (run && i === 1) continue; k.blit(botSprite(), x, 1); if (live) k.px(x - 3, -9, err ? (Math.floor(t * 4) % 2 ? C.error : C.red0) : wait ? C.waiting : C.working); }
      });

      /* ===== The statue at the centre (dimmed with the rest when off), with its flags ===== */
      const st = statueImg();
      if (st) k.c.drawImage(state === 'off' ? st.dv : st.cv, s * STAT.x - st.ox, STAT.y - st.oy);
      for (const sg of [-1, 1]) trFlag(k, sg * 126, -18, 18, t + sg * .3, state);

      /* ===== VR pad: headsets, controllers, the hologram ===== */
      G(k, VR.x, VR.y, () => {
        if (live) { const p = (t * .8) % 1, col = wait ? C.waiting : err ? C.error : calm ? C.idle : C.teal4; k.alpha(run ? (1 - p) * .7 : .3, () => k.ring(0, 0, Math.round(16 + p * 28), Math.round(6 + p * 12), col)); }
        hologram(k, 0, -24, t, state);
        screen(k, 34, 12, 12, 7, t, state, 2, det);
        if (!live) return;
        const U = [[-26, 4, 1, 2], [4, 12, -1, 4], [30, 0, -1, 0]];
        U.forEach(([x, y, f, look], i) => {
          if (calm) { crew(x + (i === 1 ? 6 : 0), y, { look, anim: 'idle', facing: i === 0 ? 1 : -1, phase: i * .5 }); return; }
          const ph = i * .4, anim = run ? 'cheer' : 'idle';
          crew(x, y, { look, anim, facing: f, phase: ph, mark: i === 1 });
          vrHead(k, x, y, f, t + i, wait ? C.waiting : err ? C.error : C.teal4);
          if (run) { const fr = ((Math.floor(t * 1.5 + ph * 7) % 2) + 2) % 2; for (const [hx, hy] of [[4, -22 - fr], [-4, -22 - (1 - fr)]]) { const X = f < 0 ? x - hx - 1 : x + hx; k.rect(X, y + hy, 2, 2, C.slate0); k.px(X, y + hy, C.teal4); } }
        });
        if (calm) k.rect(-55, 3, 3, 2, C.teal4);
      });
      /* Café: coffee, queues and chats. */
      G(k, CAFE.x, CAFE.y, () => {
        if (!live) return;
        if (!err) Props.smoke(k, -10, -16, t * .7, 2, '#f2eee6');
        if (run) { crew(-4, 8, { look: 1, hat: 'cap', hatColor: C.teal2, anim: 'work', phase: .2, speed: 4, facing: -1 }); crew(14, 12, { look: 3, anim: 'idle', facing: -1, phase: .6 }); }
        else if (calm) {
          crew(-4, 8, { look: 1, hat: 'cap', hatColor: C.teal2, anim: 'idle', facing: 1 });
          crew(-20, 30, { look: 0, anim: 'sit', facing: 1, phase: .1 }); crew(-4, 30, { look: 4, anim: 'sit', facing: -1, phase: .5 });
          crew(6, 34, { look: 2, anim: 'idle', facing: 1, phase: .3 }); crew(22, 34, { look: 5, anim: 'idle', facing: -1, phase: .9 });
        } else if (wait) { crew(-4, 8, { look: 1, hat: 'cap', hatColor: C.teal2, anim: 'idle', facing: 1 }); for (let i = 0; i < 3; i++) crew(10 + i * 9, 12 + i * 4, { look: i + 2, anim: 'idle', facing: -1, phase: i * .4 }); }
        else crew(-4, 8, { look: 1, hat: 'cap', hatColor: C.teal2, anim: 'idle', facing: 1 });
      });

      /* ===== Drone port ===== */
      G(k, LOCK.x, LOCK.y, () => {
        for (let i = 0; i < 3; i++) {
          const x = -13 + i * 13;
          if (!(run && i === 0)) k.blit(droneSprite(0, live ? C.working : null), x, -10);
          const lc = !live ? C.slate1 : err ? (Math.floor(t * 4 + i) % 2 ? C.error : C.red0) : wait ? C.waiting : run && Math.floor(t * 2 + i) % 2 ? C.slate2 : C.working;
          k.rect(x - 1, -4, 2, 2, lc);
        }
      });
      G(k, PAD.x, PAD.y, () => {
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2, x = Math.round(Math.cos(a) * 36), y = Math.round(Math.sin(a) * 16);
          const on = run ? Math.floor(t * 8) % 8 === i || Math.floor(t * 8 + 4) % 8 === i : calm ? true : wait ? Math.floor(t * 1.6) % 2 : err ? Math.floor(t * 4) % 2 : false;
          k.rect(x, y, 1, 1, on ? (err ? C.error : wait ? C.waiting : run ? C.working : S(C.working, -.35)) : C.slate1);
        }
        if (run) {
          // One drone takes off, flies a loop and lands; two others fly figure-eights over the campus.
          const p = (t / 12) % 1;
          let x = 0, y = 0, alt;
          if (p < .15) alt = p / .15 * 36; else if (p > .85) alt = (1 - p) / .15 * 36; else { const a = (p - .15) / .7 * Math.PI * 2; x = Math.sin(a) * 58; y = (Math.cos(a) - 1) * -14; alt = 36 + Math.sin(a * 2) * 4; }
          drone(k, x, y, alt, t, C.working, 0);
          for (let i = 0; i < 2; i++) { const a = t * .45 + i * Math.PI; drone(k, 16 + Math.sin(a) * 64, 6 + Math.sin(a * 2) * 22, 44 + Math.sin(t * 1.3 + i) * 5, t, i ? C.gold3 : C.working, i + 1); }
          if (det) { const a = t * .45 + Math.PI; k.rect(Math.round(16 + Math.sin(a) * 64) - 1, Math.round(6 + Math.sin(a * 2) * 22 - 44 - Math.sin(t * 1.3 + 1) * 5) + 2, 3, 2, C.wood4); }
        } else if (wait) {
          for (let i = 0; i < 3; i++) { const a = t * .5 + i * 2.09; drone(k, Math.cos(a) * 28, Math.sin(a) * 11, 24 + Math.sin(t * 2 + i) * 2, t, Math.floor(t * 2 + i) % 2 ? C.waiting : C.slate1, i); }
        } else if (err) {
          k.blit(droneSprite(0, C.error), -18, -2); k.blit(droneSprite(0, C.error), 18, -4);
          k.ellipse(6, 3, 6, 2, C.shadow); k.blit(crashSprite(), 6, 3);
          Props.smoke(k, 5, -1, t, 5, '#3a3632'); Props.smoke(k, 8, -3, t * 1.3 + .5, 3, '#6a6660');
          if (det) Props.sparkle(k, 10 + (Math.floor(t * 5) % 3), -2, t, C.gold4);
          for (let i = 0; i < 4; i++) { const q = (t * .9 + i / 4) % 1; k.px(6 + Math.round(Math.sin(i * 2.3) * q * 14), 3 - Math.round(Math.sin(q * Math.PI) * 8), i % 2 ? C.gold3 : C.error); }
        } else {
          for (const [x, y] of [[-16, -2], [16, -2], [0, 7]]) k.blit(droneSprite(0, live ? S(C.working, -.2) : null), x, y);
        }
      });
      G(k, GCS.x, GCS.y, () => {
        [-9, 4].forEach((x, i) => screen(k, x, -15, 5, 4, t, state, i + 7, det));
        if (!live) return;
        const glow = err ? C.error : wait ? C.waiting : C.teal4;
        if (calm) { crew(-26, 10, { look: 0, hat: 'cap', hatColor: C.gold2, anim: 'idle', facing: 1, phase: .2 }); crew(-14, 12, { look: 3, anim: 'idle', facing: -1, phase: .7 }); return; }
        crew(-26, 8, { look: 0, hat: 'cap', hatColor: C.gold2, anim: 'idle', facing: -1, phase: .2 }); handHeld(k, -26, 8, -1, 'ctrl', t, glow);
        crew(8, 14, { look: 3, hat: 'none', anim: 'idle', facing: -1, phase: .7 }); handHeld(k, 8, 14, -1, 'ctrl', t, glow);
        if (err) crew(-40, 0, { look: 5, anim: 'idle', facing: -1, phase: .4 });
      });

      /* ===== Robotics yard ===== */
      G(k, LAB.x, LAB.y, () => { LAB_SCR.forEach(([x, y, w, h], i) => screen(k, x, y, w, h, t, state, i + 11, det)); beacon(k, -48, -50, t, state); });
      G(k, CELL.x, CELL.y, () => {
        // Parts ride the conveyor while working; they pile up when jammed.
        if (run) for (let i = 0; i < 4; i++) { const p = (t * .12 + i / 4) % 1, x = Math.round(-34 + p * 68); k.rect(x, -10, 4, 3, i % 2 ? C.teal3 : C.stone4); k.rect(x, -10, 4, 1, C.white); }
        else if (err) for (const [x, y] of [[-2, -10], [1, -12], [3, -10], [-5, -10]]) { k.rect(x, y, 4, 3, C.teal3); k.rect(x, y, 4, 1, C.white); }
        else for (const x of [-24, 8]) { k.rect(x, -10, 4, 3, C.stone4); k.rect(x, -10, 4, 1, C.white); }
        for (const [bx, i] of [[-20, 0], [20, 1]]) {
          let a1, a2;
          if (run) { a1 = -1.6 + Math.sin(t * 1.7 + i * 2) * .7; a2 = 1.5 + Math.sin(t * 2.3 + i) * .6; }
          else if (wait) { a1 = -1.2 - i * .5; a2 = 1.1; }
          else if (err && i === 0) { a1 = -.5 + Math.sin(t * 22) * .1; a2 = -.8 + Math.sin(t * 17) * .12; }
          else if (!live) { a1 = -1.6; a2 = 2.7; }
          else { a1 = -1.85; a2 = 2.3; }
          const [hx, hy] = arm(k, bx, -19, a1, a2);
          if (run && Math.floor(t * 1.7 / Math.PI + i) % 2) k.rect(Math.round(hx) - 1, Math.round(hy), 3, 2, C.teal3);
          if (err && i === 0) { Props.sparkle(k, Math.round(hx), Math.round(hy), t, C.gold4); Props.sparkle(k, Math.round(hx) + 2, Math.round(hy) - 3, t + .3, C.white); Props.smoke(k, Math.round(hx), Math.round(hy) - 2, t, 3, '#4a4640'); }
        }
        screen(k, 45, -23, 6, 3, t, state, 5, det);
        beacon(k, 48, -26, t, state);
        if (!live) return;
        if (run) { crew(-8, 16, { look: 1, hat: 'helmet', hatColor: C.white, anim: 'idle', facing: 1, phase: .3 }); handHeld(k, -8, 16, 1, 'tablet', t, C.teal4); crew(-44, 12, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'work', tool: 'hammer', phase: .6, speed: 5 }); }
        else if (calm) { crew(-8, 16, { look: 1, hat: 'helmet', hatColor: C.white, anim: 'idle', facing: 1, phase: .3 }); crew(4, 17, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: -1, phase: .8 }); }
        else { crew(-8, 16, { look: 1, hat: 'helmet', hatColor: C.white, anim: 'idle', facing: 1, phase: .3 }); handHeld(k, -8, 16, 1, 'tablet', t, err ? C.error : C.waiting); }
      });
      G(k, TEST.x, TEST.y, () => {
        if (run) {
          const a = t * .35, x = Math.round(Math.cos(a) * 40), y = Math.round(Math.sin(a) * 14), dir = -Math.sin(a) >= 0 ? 1 : -1;
          k.ellipse(x + 1, y + 1, 7, 2, C.shadow); k.blit(dogSprite(Math.floor(t * 8) % 4), x, y, dir < 0);
          const rx = Math.round(Math.sin(t * .4) * 26), rd = Math.cos(t * .4) >= 0 ? 1 : -1;
          k.ellipse(rx + 1, 1, 8, 2, C.shadow); k.blit(roverSprite(), rx, 0, rd < 0);
        } else {
          k.ellipse(-29, 11, 7, 2, C.shadow); k.blit(dogSprite(err ? 'down' : live && !calm ? 0 : 'sit'), -30, 10, false);
          k.ellipse(-9, 1, 8, 2, C.shadow); k.blit(roverSprite(), -10, 0, false);
          if (err) { Props.sparkle(k, -26, 4, t, C.gold4); Props.smoke(k, -28, 4, t * .8, 3, '#4a4640'); }
        }
        if (!live) return;
        if (run || err) { crew(-40, 26, { look: 5, hat: 'none', anim: 'idle', facing: 1, phase: .1 }); handHeld(k, -40, 26, 1, 'tablet', t, err ? C.error : C.teal4); }
        if (run) { crew(52, -22, { look: 2, hat: 'cap', hatColor: C.white, anim: 'idle', facing: -1, phase: .5 }); handHeld(k, 52, -22, -1, 'tablet', t, C.teal4); }
        else if (wait) for (let i = 0; i < 2; i++) crew(-50 + i * 12, 22, { look: 5 - i * 3, anim: 'idle', facing: i ? -1 : 1, phase: i * .5 });
        else if (calm) crew(-50, 22, { look: 5, anim: 'idle', facing: 1, phase: .1 });
      });
      /* An AGV shuttles parts from the workcell to the shelf while working. */
      { const p = run ? (t * .06) % 1 : 0, back = p > .5, q = back ? (1 - p) * 2 : p * 2, x = Math.round(206 + q * 94);
        G(k, x, 160, () => { k.ellipse(1, 1, 9, 2, C.shadow); k.blit(agvSprite(run ? !back : true), 0, 0, back); if (err) Props.sparkle(k, 6, -6, t, C.gold4); }); }
      /* Windsock on the drone apron. */
      G(k, 116, 146, () => {
        const wind = run ? 1 : calm || wait ? .6 : err ? 1 : 0;
        for (let i = 0; i < 4; i++) { const droop = Math.round((1 - wind) * i * 2 + Math.sin(t * 5 + i) * wind * .8); k.rect(1 + i * 3, -26 + droop, 3, 3 - (i >> 1), i % 2 ? C.white : C.terra3); }
      });
      G(k, HUM.x, HUM.y, () => {
        const f = !live ? 3 : err ? (Math.floor(t * 4) % 2 ? 2 : 0) : run ? Math.floor(t * 2) % 2 : 0;
        k.ellipse(1, 0, 6, 2, C.shadow); k.blit(humSprite(f), 0, !live ? 1 : 0);
        if (err && det) Props.sparkle(k, 3, -18, t, C.gold4);
        if (wait) beacon(k, 10, -26, t, state);
      });
      /* Visitors and staff on the south-east gate path. */
      if (run) for (let i = 0; i < 2; i++) {
        const p = (t * .035 + i * .5) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2, y = 320 - q * 280;
        crew(s * (152 + i * 10), y, { look: i ? 1 : 3, hat: i ? 'none' : 'cap', hatColor: C.gold2, anim: 'walk', carry: back ? '' : (i ? 'paper' : 'box'), facing: (i ? 1 : -1) * s, phase: i * .4 });
      }

      /* ===== Solar field: cleaning, installing and inspecting; the battery container ===== */
      if (live) {
        if (run) {
          const cx = 30 + tri(t * .02) * 96; crew(s * cx, 272, { look: 2, hat: 'straw', anim: 'work', tool: 'broom', phase: .1, speed: 4, facing: s });
          const p = (t * .05) % 1, gapX = 230 - 54 + 4 * 13 + 6;
          if (p < .35) { const q = p / .35, x = 296 - q * (296 - gapX - 8); crew(s * x, 298, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'walk', carry: 'paper', facing: -s, phase: .4 }); k.rect(s * x - 7, 298 - 29, 14, 7, PV[1]); k.rect(s * x - 7, 269, 14, 1, PV[3]); k.rect(s * x - 7, 275, 14, 1, C.stone4); }
          else if (p < .8) crew(s * (gapX + 8), 298, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'work', tool: 'hammer', phase: .4, facing: -s });
          else { const q = (p - .8) / .2, x = gapX + 8 + q * (296 - gapX - 8); crew(s * x, 298, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'walk', facing: s, phase: .4 }); }
          crew(s * 190, 272, { look: 0, hat: 'helmet', hatColor: C.white, anim: 'idle', facing: s, phase: .7 }); handHeld(k, s * 190, 272, s, 'tablet', t, C.teal4);
          if (det) for (let i = 0; i < 3; i++) { const q = (t * .15 + i / 3) % 1, b = PVB[i % 2], x = Math.round(b.x - b.w / 2 + q * b.w); Props.sparkle(k, s * x, ROWS[i] - 14, t + i, C.white); }
        } else if (calm) { crew(s * 60, 272, { look: 2, hat: 'straw', anim: 'idle', facing: s, phase: .1 }); crew(s * 72, 273, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: -s, phase: .6 }); }
        else { crew(s * 90, 272, { look: 2, hat: 'straw', anim: 'idle', facing: s, phase: .1 }); crew(s * 214, 298, { look: 4, hat: 'helmet', hatColor: C.gold2, anim: 'idle', facing: s, phase: .6 }); crew(s * 190, 272, { look: 0, hat: 'helmet', hatColor: C.white, anim: 'idle', facing: s, phase: .7 }); }
      }
      G(k, BESS.x, BESS.y, () => {
        for (let i = 0; i < 3; i++) { const on = live && (err ? Math.floor(t * 4 + i) % 2 : wait ? i === 1 : run ? Math.floor(t * 3) % 3 === i || i === 0 : i === 0); k.px(8 + i * 3, -7, on ? (err ? C.error : wait ? C.waiting : C.working) : C.slate1); }
        if (err) { Props.smoke(k, 24, -12, t, 5, '#3a3632'); if (det) Props.sparkle(k, 25, -8, t, C.gold4); }
      });
      /* Promenade fountain. */
      G(k, FOUNT.x, FOUNT.y, () => {
        const flow = run ? 1 : calm ? .6 : wait ? .45 : err ? .7 : 0;
        jet(k, 0, -20, t, flow, err);
        if (flow) for (const d of [-1, 1]) for (let j = 0; j < 4; j++) { const q = (t * 1.6 + j / 4 + (d > 0 ? .5 : 0)) % 1; k.px(d * Math.round(4 + q * 6 * flow), -13 + Math.round(q * q * 14), j % 2 ? C.water4 : C.water5); }
      });
    }
  };
})();
