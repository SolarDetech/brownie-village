/* Command Grounds · Tasks, workflows and runs: operations keep, barracks, armoury, watchtower, drill square,
   planning pavilion with the run board and map table, archery range and training dummies. A service place: no lead. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.military = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const DRILL = { x0: -104, y0: -40, x1: 104, y1: 80 };    // sand parade square
  const FORM = { x: 6, y: 2 };                               // formation origin (front-left soldier)
  const BOARD = { x: 122, y: -10, w: 58, h: 30 };             // run board under the pavilion
  const MAP = { x: 124, y: 26, w: 52, h: 16 };                // map table top
  const TOWER = { x: 166, top: -106 };                        // watchtower platform floor
  const TARGETS = [-174, -150, -126];
  /* ---------- local architecture helpers ---------- */
  // Cut-stone face: staggered blocks with a lit top edge and dark mortar.
  function ashlar(k, x, y, w, h, base = C.stone3, bh = 5, bw = 12) {
    const d = S(base, -.24), m = S(base, -.09), l = S(base, .15);
    k.rectTex(x, y, w, h, (px, py) => {
      const ry = py - y, row = Math.floor(ry / bh), rx = px - x + (row % 2 ? bw >> 1 : 0), col = Math.floor(rx / bw);
      if (ry % bh === bh - 1 || rx % bw === bw - 1) return d;
      if (ry % bh === 0) return l;
      return P.hash(col, row * 3 + y) < .24 ? m : base;
    });
    k.rect(x, y, 1, h, l); k.rect(x + w - 2, y, 2, h, S(base, -.32));
  }
  const merlons = (k, x, top, w, base = C.stone3) => {
    for (let i = 0; i + 4 <= w; i += 8) { k.rect(x + i, top - 5, 5, 5, base); k.rect(x + i, top - 5, 5, 1, S(base, .35)); k.rect(x + i + 4, top - 4, 1, 4, S(base, -.35)); k.px(x + i, top - 4, S(base, .2)); }
  };
  // Straight curtain wall seen from the front: ashlar face, walkway and front merlons.
  function curtain(k, x, by, w, h, base = C.stone3) {
    const top = by - h;
    k.rect(x + 3, by, w, 3, C.shadow);
    ashlar(k, x, top, w, h, base);
    k.rect(x, top - 8, w, 8, C.stone2); k.rect(x, top - 9, w, 2, C.stone1);
    for (let i = 3; i < w; i += 7) k.rect(x + i, top - 6, 1, 5, S(C.stone2, -.12));
    k.rect(x, top - 1, w, 1, C.stone4); merlons(k, x, top, w, base);
    k.rect(x, by - 3, w, 3, S(base, -.18)); k.rect(x, by - 3, w, 1, S(base, .1));
  }
  // Wall running north-south, seen from above as a walkway strip with merlons on both edges.
  function sideWall(k, x, y0, y1, shadowRight) {
    k.rect(shadowRight ? x + 12 : x - 5, y0 + 6, 5, y1 - y0 - 6, C.shadowSoft);
    k.rect(x, y0, 12, y1 - y0, C.stone2);
    for (let y = y0 + 2; y < y1; y += 6) { k.rect(x + 3, y, 6, 1, S(C.stone2, -.14)); k.px(x + 4 + (y % 4), y + 2, C.stone3); }
    for (let y = y0 + 2; y < y1 - 3; y += 8) for (const ex of [x, x + 9]) { k.rect(ex, y, 3, 5, C.stone3); k.rect(ex, y, 3, 1, C.stone5); k.rect(ex + 2, y + 1, 1, 4, C.stone1); }
    k.rect(x - 1, y0, 1, y1 - y0, C.stone1); k.rect(x + 12, y0, 1, y1 - y0, C.stone0);
  }
  // Round tower with cylindrical shading; either a cone roof (o.roof) or a crenellated parapet.
  function rtower(k, cx, by, r, h, o = {}) {
    const base = o.base || C.stone3, ry = Math.max(3, Math.round(r * .38)), top = by - h;
    const T = [S(base, .26), S(base, .13), base, S(base, -.12), S(base, -.26), S(base, -.4)];
    const tone = u => u < -.62 ? 0 : u < -.25 ? 1 : u < .15 ? 2 : u < .48 ? 3 : u < .78 ? 4 : 5;
    k.ellipse(cx + 6, by + 2, r + 4, ry + 2, C.shadow);
    k.poly([[cx + r, by], [cx + r + 9, by - 3], [cx + r + 9, top + 14], [cx + r, top + 8]], C.shadowSoft);
    k.ellipse(cx, by + 1, r + 2, ry + 1, S(base, -.3));
    const pts = [[cx - r, top], [cx + r, top]];
    for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; pts.push([cx + Math.cos(a) * r, by + Math.sin(a) * ry]); }
    const ang = x => Math.asin(Math.max(-1, Math.min(1, (x + .5 - cx) / r)));
    k.polyTex(pts, (x, y) => {
      const u = Math.max(-1, Math.min(1, (x + .5 - cx) / r)), q = Math.round(y - ry * Math.sqrt(1 - u * u) - top), ti = tone(u);
      const row = Math.floor(q / 5);
      if (((q % 5) + 5) % 5 === 4) return T[Math.min(5, ti + 2)];
      const off = (row & 1) * .23;
      if (Math.floor((ang(x) + off) / .46) !== Math.floor((ang(x - 1) + off) / .46)) return T[Math.min(5, ti + 2)];
      if (((q % 5) + 5) % 5 === 0) return T[Math.max(0, ti - 1)];
      return T[ti];
    });
    // Moss at the foot and a few lit block corners.
    for (let i = 0; i < r; i += 3) k.px(cx - r + 1 + i * 2, by + Math.round(Math.sin(Math.acos(Math.min(1, Math.abs(-r + 1 + i * 2) / r))) * ry) - 1, C.leaf2);
    (o.slits || []).forEach(s => { k.rect(cx - 1, by - s, 2, 7, C.ink); k.px(cx - 2, by - s + 1, T[4]); k.px(cx + 1, by - s + 7, T[0]); });
    (o.wins || []).forEach(s => Props.window(k, cx - 3, by - s, 6, 9, { arch: true, lit: true, frame: C.stone1 }));
    if (o.roof) {
      const rh = o.roofH || Math.round(r * 2.1), rr = r + 3, col = o.roof, er = ry + 1;
      const RT = [S(col, .32), S(col, .16), col, S(col, -.15), S(col, -.3), S(col, -.44)];
      const cp = [[cx, top - rh]];
      for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; cp.push([cx + Math.cos(a) * rr, top + 2 + Math.sin(a) * er]); }
      k.polyTex(cp, (x, y) => {
        const f = Math.max(.05, (y - (top - rh)) / rh), u = Math.max(-1, Math.min(1, (x + .5 - cx) / (rr * f))), ti = tone(u);
        const yc = Math.round(y - er * f * Math.sqrt(1 - u * u) - (top - rh)), band = Math.floor(yc / 3);
        if (yc % 3 === 0) return RT[Math.min(5, ti + 1)];
        if ((x + band * 2) % 4 === 0) return RT[Math.min(5, ti + 1)];
        return RT[ti];
      });
      const arc = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; arc.push([cx + Math.cos(a) * rr, top + 2 + Math.sin(a) * er]); }
      k.path(arc, S(col, -.5)); k.line(cx - 1, top - rh + 2, cx - rr * .55, top + er * .5, S(col, .4));
      k.rect(cx - 1, top - rh - 4, 2, 5, C.gold1); k.px(cx - 1, top - rh - 5, C.gold3);
      if (o.pole) { k.rect(cx, top - rh - 4 - o.pole, 1, o.pole, C.wood1); k.px(cx, top - rh - 5 - o.pole, C.gold3); }
      return top - rh;
    }
    // Crenellated parapet ring on corbels.
    const R2 = r + 2, pt = top - 6;
    k.ellipse(cx, top + 2, R2, ry + 1, T[4]);
    k.rectTex(cx - R2, pt, R2 * 2 + 1, 8, x => T[tone((x + .5 - cx) / R2)]);
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; k.px(cx + Math.cos(a) * R2, top + 2 + Math.sin(a) * (ry + 1) + 1, T[5]); }
    k.ellipse(cx, pt, R2, ry + 1, C.stone5); k.ellipse(cx, pt + 1, R2 - 2, ry - 1, C.stone1); k.ellipse(cx + 1, pt + 2, R2 - 4, ry - 2, C.stone0);
    for (let i = 1; i < 8; i++) { const a = Math.PI + i / 8 * Math.PI, x = Math.round(cx + Math.cos(a) * (R2 - 1)), y = Math.round(pt + Math.sin(a) * ry); k.rect(x - 1, y - 3, 3, 3, T[2]); k.rect(x - 1, y - 3, 3, 1, C.stone5); }
    for (let i = 0; i <= 6; i++) { const a = .12 * Math.PI + i / 6 * .76 * Math.PI, x = Math.round(cx + Math.cos(a) * (R2 - 1)), y = Math.round(pt + Math.sin(a) * (ry + 1)); k.rect(x - 1, y - 4, 3, 4, T[tone((x - cx) / R2)]); k.rect(x - 1, y - 4, 3, 1, C.stone5); }
    if (o.pole) { k.rect(cx, pt - o.pole, 1, o.pole, C.wood1); k.px(cx, pt - o.pole - 1, C.gold3); }
    return pt;
  }
  // Hipped slate roof front slope.
  function hipRoof(k, x0, x1, base, rh, inset, col) {
    const T = [S(col, .3), S(col, .14), col, S(col, -.18), S(col, -.34), S(col, -.48)];
    k.polyTex([[x0, base], [x1, base], [x1 - inset, base - rh], [x0 + inset, base - rh]], (x, y) => {
      const r = base - y, lx = x0 + inset * r / rh, rx = x1 - inset * r / rh, row = Math.floor(y / 3);
      let ti = x < lx + 5 ? 0 : x > rx - 5 ? 4 : r > rh - 3 ? 1 : 2;
      if (r < 3) ti = 5; else if (y % 3 === 0 || (x + row * 2) % 5 === 0) ti = Math.min(5, ti + 1);
      return T[ti];
    });
    k.rect(x0 + inset, base - rh - 1, x1 - x0 - inset * 2, 1, S(col, .45)); k.line(x0, base, x0 + inset, base - rh, S(col, .4)); k.line(x1, base, x1 - inset, base - rh, S(col, -.55));
  }
  const spear = (k, x, y, f = 1) => { const sx = x + (f > 0 ? 6 : -5); k.rect(sx, y - 27, 1, 26, C.wood2); k.rect(sx, y - 31, 1, 4, C.stone4); k.px(sx - 1, y - 28, C.stone3); k.px(sx + 1, y - 28, C.stone3); };
  const tabard = (k, x, y, col = C.red2) => { k.rect(x - 1, y - 12, 3, 6, col); k.px(x, y - 10, C.gold3); };
  // Wooden palisade of pointed stakes.
  function palisade(k, x0, x1, y) {
    k.rect(x0 + 2, y, x1 - x0, 3, C.shadow);
    for (let x = x0; x < x1; x += 4) { const h = 15 + ((x >> 2) % 2); k.rect(x, y - h, 4, h, C.wood2); k.rect(x, y - h, 1, h, C.wood3); k.rect(x + 3, y - h, 1, h, C.wood0); k.rect(x + 1, y - h - 2, 2, 2, C.wood3); k.px(x + 1, y - h - 3, C.wood4); }
    k.rect(x0, y - 11, x1 - x0, 2, C.wood0); k.rect(x0, y - 5, x1 - x0, 2, C.wood0); k.rect(x0, y - 11, x1 - x0, 1, C.wood1);
    for (let x = x0 + 6; x < x1; x += 16) { k.px(x, y - 10, C.stone3); k.px(x, y - 4, C.stone3); }
  }
  const tent = (k, x, y, w, col) => {   // canvas ridge tent seen from the front, x,y bottom-left
    const h = Math.round(w * .7), cx = x + w / 2;
    k.ellipse(cx + 4, y + 1, w / 2 + 3, 3, C.shadow);
    k.poly([[x, y], [cx, y - h], [x + w, y]], col); k.poly([[x, y], [cx, y - h], [cx, y]], S(col, .14)); k.poly([[cx, y - h], [x + w, y], [x + w - 3, y]], S(col, -.2));
    for (let i = 1; i < 4; i++) k.line(cx, y - h, x + i * w / 4, y, S(col, -.1));
    k.poly([[cx - 5, y], [cx, y - h * .55], [cx + 5, y]], C.ink); k.poly([[cx - 4, y], [cx, y - h * .5], [cx, y]], '#3a2c20');
    k.line(cx, y - h, cx, y - h - 5, C.wood1); k.rect(cx + 1, y - h - 5, 4, 2, C.teal2);
    k.line(x - 3, y, x + 3, y - h * .4, C.wood4); k.line(x + w + 3, y, x + w - 3, y - h * .4, C.wood4); k.px(x - 3, y, C.wood1); k.px(x + w + 3, y, C.wood1);
  };
  const rack = (k, x, y, n = 4) => {    // spear rack
    k.rect(x + 2, y + 1, n * 5 + 2, 2, C.shadow); k.rect(x, y - 3, n * 5 + 2, 2, C.wood2); k.rect(x, y - 14, n * 5 + 2, 2, C.wood3); k.rect(x, y - 14, 1, 15, C.wood1); k.rect(x + n * 5 + 1, y - 14, 1, 15, C.wood1);
    for (let i = 0; i < n; i++) { const sx = x + 3 + i * 5; k.rect(sx, y - 24, 1, 23, C.wood4); k.rect(sx, y - 27, 1, 3, C.stone4); k.px(sx - 1, y - 25, C.stone3); k.px(sx + 1, y - 25, C.stone3); }
  };
  const shieldRack = (k, x, y) => { for (let i = 0; i < 3; i++) { const cx = x + i * 9; k.circle(cx, y, 4, C.wood1); k.circle(cx, y, 3, i % 2 ? C.teal2 : C.red2); k.px(cx, y, C.gold3); k.px(cx - 2, y - 2, S(i % 2 ? C.teal2 : C.red2, .3)); } };
  const target = (k, x, y) => {         // round straw target on an easel, facing the archers
    k.ellipse(x + 3, y + 1, 9, 2, C.shadow);
    k.line(x - 6, y, x - 2, y - 16, C.wood1, 2); k.line(x + 6, y, x + 2, y - 16, C.wood1, 2); k.line(x, y - 10, x + 3, y + 1, C.wood0);
    k.circle(x, y - 13, 8, C.gold1); k.circle(x, y - 13, 7, C.paper); k.circle(x, y - 13, 5, C.red2); k.circle(x, y - 13, 3, C.paper); k.circle(x, y - 13, 1, C.red1);
    k.ring(x, y - 13, 8, 8, C.gold0); k.px(x - 4, y - 18, C.white);
  };
  const dummy = (k, x, y) => {          // straw training dummy on a post
    k.ellipse(x + 2, y + 1, 5, 2, C.shadow); k.rect(x, y - 22, 2, 22, C.wood1); k.rect(x - 7, y - 17, 16, 2, C.wood2);
    k.rect(x - 4, y - 18, 10, 11, C.gold1); k.rect(x - 4, y - 18, 3, 11, C.gold2); k.rect(x + 4, y - 18, 2, 11, C.gold0); k.rect(x - 4, y - 13, 10, 1, C.wood1);
    k.circle(x + 1, y - 22, 4, C.plaster1); k.px(x - 1, y - 23, C.ink); k.px(x + 2, y - 23, C.ink); k.rect(x - 3, y - 26, 8, 1, C.wood1);
    for (const d of [-5, 7]) k.px(x + d, y - 16, C.gold3);
  };
  const hay = (k, x, y) => { k.rect(x + 2, y + 1, 14, 2, C.shadow); k.rect(x, y - 8, 14, 9, C.gold1); k.rect(x, y - 8, 14, 2, C.gold2); k.rect(x, y - 1, 14, 1, C.gold0); for (let i = 1; i < 14; i += 3) k.px(x + i, y - 5, C.gold0); k.rect(x + 3, y - 8, 1, 9, C.wood1); k.rect(x + 10, y - 8, 1, 9, C.wood1); };

  return {
    paint(k) {
      /* Trodden ground: packed earth everywhere inside the palisade. */
      k.rectTex(-190, -96, 380, 234, (x, y) => { const h = P.hash(x, y); return h < .1 ? C.dirt1 : h > .9 ? C.dirt3 : h > .6 ? C.dirt2 : S(C.dirt2, -.05); });
      for (let i = 0; i < 40; i++) Props.tuft(k, -186 + P.hash(i, 41) * 372, -90 + P.hash(i, 42) * 225, C.grass1, C.grass3);

      /* Pines and oaks behind the buildings. */
      for (const [x, y, kind, sz, v] of [[-160, -104, 'dark', 1, 1], [-122, -110, 'pine', 1, 0], [-186, -120, 'pine', 0, 2], [104, -102, 'oak', 1, 2], [132, -110, 'pine', 1, 3], [-96, -121, 'pine', 0, 1], [96, -121, 'pine', 0, 0]]) Props.tree(k, x, y, kind, sz, v);
      /* Barracks: long plank hall with bunk windows and a chimney. */
      Props.building(k, -186, -58, { w: 92, h: 30, roofH: 20, roof: C.terra1, wall: C.plaster1, mat: 'planks', windows: [{ x: 6, y: 9, w: 8, h: 7, lit: true, shutters: C.teal1 }, { x: 22, y: 9, w: 8, h: 7, lit: true, shutters: C.teal1 }, { x: 62, y: 9, w: 8, h: 7, lit: true, shutters: C.teal1 }, { x: 78, y: 9, w: 8, h: 7, lit: true, shutters: C.teal1 }], door: { x: 41, w: 11, h: 15, color: C.teal2, open: true }, chimney: { x: 16, h: 12 } });
      Props.hangingSign(k, -128, -80, 'BUNK', C.teal1);
      Props.bench(k, -178, -38, 20); Props.barrel(k, -110, -48);

      /* Operations keep: crenellated stone hall with twin towers, war-room door and the order dais. */
      const kx = -54, kw = 108, kb = -66, kt = -108;
      k.rect(kx, kt - 8, kw, 8, C.stone1);
      ashlar(k, kx, kt, kw, kb - kt, C.stone2);
      k.rect(kx - 2, kt - 3, kw + 4, 4, C.stone3); k.rect(kx - 2, kt - 3, kw + 4, 1, C.stone4); merlons(k, kx - 2, kt - 3, kw + 4, C.stone2);
      k.rect(kx - 1, kb - 6, kw + 2, 6, C.stone1); k.rect(kx - 1, kb - 6, kw + 2, 1, C.stone3);
      for (const wx of [-46, -30, 23, 39]) Props.window(k, wx, kt + 9, 7, 11, { lit: true, arch: true, frame: C.stone0 });
      for (const wx of [-42, -26, 27, 43]) { k.rect(wx, kt + 28, 2, 6, C.ink); k.px(wx, kt + 28, C.stone1); }
      // Door, crossed-swords crest and the "OPS" board.
      Props.door(k, -10, kb, 20, 22, C.teal1, { arch: true, open: true, frame: C.stone3 });
      k.rect(-8, kb - 18, 16, 16, '#3a2c20'); k.rect(-7, kb - 5, 14, 3, C.wood2);
      k.rect(-13, kt + 4, 26, 12, C.wood0); k.rect(-12, kt + 5, 24, 10, C.teal1); k.rect(-12, kt + 5, 24, 1, C.teal3); k.textCenter('OPS', 0, kt + 8, C.paper);
      for (const s of [-1, 1]) { const cx = s * 19; k.rect(cx - 4, kt + 22, 9, 8, C.gold1); k.rect(cx - 3, kt + 23, 7, 6, s < 0 ? C.red1 : C.teal1); k.poly([[cx - 3, kt + 29], [cx + 4, kt + 29], [cx, kt + 33]], s < 0 ? C.red1 : C.teal1); k.rect(cx, kt + 23, 1, 9, C.gold2); k.rect(cx - 2, kt + 25, 5, 1, C.gold2); }
      rtower(k, -66, -60, 13, 64, { base: C.stone2, slits: [18, 34], wins: [52], pole: 12 });
      rtower(k, 66, -60, 13, 64, { base: C.stone2, slits: [18, 34], wins: [52], pole: 12 });
      k.rect(0, kt - 38, 1, 30, C.wood1); k.px(0, kt - 39, C.gold3); k.rect(-2, kt - 8, 5, 2, C.stone0);
      // Dais: plank platform with steps and a drum.
      Props.planks(k, -30, -60, 60, 12, C.wood3); k.rect(-30, -48, 60, 3, C.wood1); k.rect(-30, -60, 60, 1, C.wood5);
      for (let i = 0; i < 2; i++) k.rect(-10 - i * 2, -45 + i * 3, 20 + i * 4, 3, i ? C.wood2 : C.wood3);
      for (const x of [-30, 28]) k.rect(x, -64, 2, 16, C.wood1);
      k.rect(-30, -64, 60, 2, C.teal2); for (let x = -30; x < 30; x += 6) k.rect(x, -62, 3, 3, x % 12 ? C.teal2 : C.paper);

      /* Armoury: brick store with shield wall and stacked crates. */
      Props.building(k, 90, -58, { w: 52, h: 26, roofH: 16, roof: C.slate2, wall: C.plaster1, mat: 'brick', door: { x: 20, w: 12, h: 14, color: C.wood1 }, windows: [{ x: 5, y: 8, w: 7, h: 6 }, { x: 40, y: 8, w: 7, h: 6 }] });
      shieldRack(k, 96, -38); Props.crate(k, 86, -52, 8); Props.crate(k, 90, -60 + 16, 7); Props.barrel(k, 132, -50);

      /* Watchtower: timber legs, braced, a lookout platform and a pointed roof. */
      const tx = TOWER.x, tp = TOWER.top;
      k.poly([[tx + 17, -60], [tx + 24, -64], [tx + 24, tp + 6], [tx + 17, tp + 10]], C.shadowSoft);
      for (const lx of [tx - 14, tx + 12]) { k.rect(lx, tp, 3, -60 - tp, C.wood1); k.rect(lx, tp, 1, -60 - tp, C.wood3); }
      for (let y = tp + 8; y < -64; y += 16) { k.line(tx - 12, y, tx + 12, y + 14, C.wood1, 2); k.line(tx + 12, y, tx - 12, y + 14, C.wood2, 1); }
      k.line(tx - 1, tp, tx - 1, -60, C.wood0); for (let y = tp + 4; y < -62; y += 4) k.rect(tx - 3, y, 5, 1, C.wood2);   // ladder
      Props.planks(k, tx - 17, tp - 2, 34, 5, C.wood3); k.rect(tx - 17, tp + 3, 34, 2, C.wood0);
      k.rect(tx - 16, tp - 26, 2, 24, C.wood1); k.rect(tx + 14, tp - 26, 2, 24, C.wood1);
      k.poly([[tx - 20, tp - 25], [tx, tp - 40], [tx + 20, tp - 25]], C.terra2); k.poly([[tx - 20, tp - 25], [tx, tp - 40], [tx, tp - 25]], C.terra3);
      for (let y = tp - 37; y < tp - 25; y += 3) { const w2 = Math.round((y - tp + 40) / 15 * 20); k.rect(tx - w2, y, w2 * 2, 1, C.terra1); }
      k.rect(tx - 21, tp - 26, 42, 2, C.terra0); k.rect(tx, tp - 44, 1, 5, C.wood1);
      k.rect(tx + 8, tp - 10, 4, 3, C.gold1); k.px(tx + 8, tp - 10, C.gold3);   // alarm horn
      k.rect(tx - 20, -61, 40, 2, C.stone1);

      /* Parade square: raked sand, chalk border and formation markers. */
      const d = DRILL;
      k.rect(d.x0 - 2, d.y0 - 2, d.x1 - d.x0 + 4, d.y1 - d.y0 + 4, C.dirt1);
      k.rectTex(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0, (x, y) => { if ((y - d.y0) % 4 === 0 && (x + y) % 3) return C.dirt3; const h = P.hash(x * 3, y); return h < .08 ? C.dirt2 : h > .95 ? C.dirt5 : C.dirt4; });
      k.ring(0, 20, 36, 18, C.paper); k.rect(d.x0 + 4, d.y0 + 4, d.x1 - d.x0 - 8, 1, C.paper); k.rect(d.x0 + 4, d.y1 - 5, d.x1 - d.x0 - 8, 1, C.paper); k.rect(d.x0 + 4, d.y0 + 4, 1, d.y1 - d.y0 - 8, C.paper); k.rect(d.x1 - 5, d.y0 + 4, 1, d.y1 - d.y0 - 8, C.paper);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.rect(FORM.x - 24 + c * 16, FORM.y + 10 + r * 16, 3, 1, C.paper2);
      for (const [x, y] of [[d.x0 + 1, d.y0 + 1], [d.x1 - 4, d.y0 + 1], [d.x0 + 1, d.y1 - 4], [d.x1 - 4, d.y1 - 4]]) { k.rect(x, y, 3, 3, C.stone2); k.px(x, y, C.stone4); }

      // Hurdles on the east side of the square.
      for (const y of [-14, 16, 46]) { k.rect(74, y, 2, 9, C.wood1); k.rect(92, y, 2, 9, C.wood1); k.rect(73, y + 1, 22, 2, C.wood3); k.rect(73, y + 1, 22, 1, C.wood4); k.rect(73, y + 5, 22, 1, C.wood2); k.rect(76, y + 9, 20, 1, C.shadow); }
      k.rect(-6, -32, 2, 12, C.wood1); k.rect(-8, -21, 6, 2, C.stone1); k.rect(-4, -32, 6, 4, C.paper); k.textCenter('1', -1, -31, C.ink);
      /* Archery range: targets against hay, and the shooting line. */
      for (const x of TARGETS) { hay(k, x - 8, -28); target(k, x, -22); }
      k.rect(-186, 58, 76, 1, C.paper); for (let x = -184; x < -112; x += 8) k.px(x, 57, C.paper2);
      rack(k, -186, 86, 3); Props.barrel(k, -118, 76);
      for (let i = 0; i < 5; i++) { const x = -182 + i * 3; k.rect(x, 71, 1, 8, C.wood4); k.px(x, 70, C.paper); } k.rect(-184, 76, 16, 4, C.wood1);   // arrow quiver stand

      /* Training dummies and a sparring ring. */
      k.ring(-150, 110, 30, 11, C.paper2);
      for (const x of [-172, -150, -128]) dummy(k, x, 106);

      /* Planning pavilion: striped canopy on posts, the run board and the map table. */
      const b = BOARD, m = MAP;
      k.rect(114, -30, 74, 78, C.shadowSoft);
      Props.planks(k, 114, -16, 72, 64, C.wood2);
      for (const x of [114, 184]) { k.rect(x, -30, 3, 78, C.wood1); k.rect(x, -30, 1, 78, C.wood3); }
      k.rect(b.x - 2, b.y - 2, b.w + 4, b.h + 4, C.wood0); k.rect(b.x, b.y, b.w, b.h, '#6a5238'); k.dither(b.x, b.y, b.w, b.h, '#5a4430', 1);
      const cw = Math.floor(b.w / 3);
      [C.slate3, C.waiting, C.working].forEach((col, i) => { k.rect(b.x + 1 + i * cw, b.y + 1, cw - 2, 3, col); k.rect(b.x + 1 + i * cw, b.y + 1, cw - 2, 1, S(col, .3)); if (i) k.rect(b.x + i * cw - 1, b.y + 1, 1, b.h - 2, C.wood0); });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - (i === 1 ? 1 : 0); j++) { const x = b.x + 3 + i * cw, y = b.y + 7 + j * 7; k.rect(x, y, cw - 6, 5, j % 2 ? C.paper2 : C.paper); k.rect(x + 1, y + 2, cw - 10, 1, C.stone2); k.px(x + cw - 8, y, C.red2); }
      // Map table: parchment with a river, forests, three outposts and dashed routes.
      k.rect(m.x + 2, m.y + m.h + 6, m.w, 2, C.shadow);
      k.rect(m.x - 2, m.y - 2, m.w + 4, m.h + 6, C.wood1); k.rect(m.x - 2, m.y - 2, m.w + 4, 1, C.wood3);
      for (const lx of [m.x, m.x + m.w - 3]) k.rect(lx, m.y + m.h + 4, 3, 6, C.wood0);
      k.rect(m.x, m.y, m.w, m.h, C.paper); k.dither(m.x, m.y, m.w, m.h, C.paper2, 1);
      k.path([[m.x + 14, m.y], [m.x + 18, m.y + 6], [m.x + 15, m.y + 11], [m.x + 20, m.y + m.h - 1]], C.water2, 2);
      for (let i = 0; i < 6; i++) { const x = m.x + 26 + (i % 3) * 5, y = m.y + 2 + (i >> 1) * 3; k.px(x, y, C.leaf1); k.px(x + 1, y, C.leaf2); }
      for (const [ox, oy] of [[4, 4], [44, 3], [30, 12]]) { k.rect(m.x + ox, m.y + oy, 4, 3, C.terra2); k.px(m.x + ox + 1, m.y + oy - 1, C.red2); }
      for (const [a, c] of [[[6, 5], [46, 4]], [[46, 4], [32, 13]]]) for (let i = 0; i < 10; i += 2) { const q = i / 10, q2 = (i + 1) / 10; k.line(m.x + a[0] + (c[0] - a[0]) * q, m.y + a[1] + (c[1] - a[1]) * q, m.x + a[0] + (c[0] - a[0]) * q2, m.y + a[1] + (c[1] - a[1]) * q2, C.ink); }
      Props.pot(k, 118, 52, true); Props.crate(k, 172, 50, 8);
      // Canopy last: teal and paper stripes with a scalloped edge.
      k.rect(110, -40, 82, 12, C.teal1); for (let x = 110; x < 192; x += 6) { k.rect(x, -40, 3, 12, C.teal2); k.px(x, -40, C.teal4); }
      k.rect(110, -40, 82, 1, C.teal4); k.rect(110, -29, 82, 1, C.teal0); for (let x = 110; x < 192; x += 4) k.rect(x + 1, -28, 2, 2, x % 8 ? C.paper : C.teal2);

      /* Camp: cook fire with log seats and a tripod, tents and supplies. */
      k.ellipse(140, 104, 9, 4, C.stone1); k.ellipse(140, 104, 7, 3, C.dirt0);
      for (let a = 0; a < 8; a++) Props.rock(k, 140 + Math.round(Math.cos(a * .785) * 8), 104 + Math.round(Math.sin(a * .785) * 4), 0, a);
      k.line(132, 106, 140, 88, C.wood1); k.line(148, 106, 140, 88, C.wood1); k.rect(139, 88, 2, 2, C.wood0); k.line(140, 89, 140, 96, C.stone0);
      k.ellipse(140, 98, 4, 3, C.stone0); k.rect(137, 95, 7, 1, C.stone1);
      for (const [x, y] of [[120, 104], [158, 104]]) { k.rect(x - 6, y - 2, 12, 4, C.wood2); k.rect(x - 6, y - 2, 12, 1, C.wood4); k.ellipse(x - 6, y, 1, 2, C.wood4); }
      tent(k, 62, 122, 28, C.plaster2); tent(k, 96, 124, 22, C.plaster1);
      Props.crate(k, 170, 116); Props.crate(k, 178, 110, 7); Props.sack(k, 162, 124, '#b8a276'); Props.barrel(k, 174, 124);
      tent(k, -84, 124, 26, C.plaster2);

      /* Along the parade square: spear racks, banners' bases, a water trough and the signpost. */
      rack(k, -94, 96, 5); rack(k, 38, 96, 4);
      k.rect(-40, 92, 22, 7, C.wood1); k.rect(-39, 93, 20, 3, C.water2); k.rect(-39, 93, 20, 1, C.water4); k.rect(-38, 99, 2, 2, C.wood0); k.rect(-22, 99, 2, 2, C.wood0);
      Props.sign(k, 56, 104, 'RUNS', C.teal1);
      for (const x of [-110, 106]) { k.rect(x, -2, 2, 30, C.wood1); k.px(x, -3, C.gold3); k.rect(x - 1, 28, 4, 2, C.stone1); }
      Props.tree(k, -186, 136, 'pine', 1, 2); Props.tree(k, 186, 40, 'pine', 0, 1); Props.tree(k, -104, -88, 'dark', 1, 1); Props.tree(k, 90, -92, 'pine', 1, 3);
      Props.bush(k, 186, -8, 1); Props.bush(k, -190, 20, 2); Props.bush(k, 186, 80, 0);

      /* Palisade with the open gate at the bottom centre. */
      palisade(k, -190, -26, 140); palisade(k, 26, 190, 140);
      for (const x of [-30, 26]) { k.rect(x, 110, 5, 32, C.wood1); k.rect(x, 110, 2, 32, C.wood3); k.rect(x - 1, 108, 7, 3, C.wood0); }
      for (const x of [-44, 38]) { k.rect(x, 124, 2, 16, C.wood1); k.rect(x - 2, 121, 6, 3, C.stone0); }
    },
    front(k) {
      // Watchtower rail in front of the lookout.
      const tx = TOWER.x, tp = TOWER.top;
      k.rect(tx - 17, tp - 9, 34, 2, C.wood3); k.rect(tx - 17, tp - 9, 34, 1, C.wood4);
      for (let x = tx - 16; x < tx + 16; x += 5) k.rect(x, tp - 7, 1, 6, C.wood1);
      k.rect(tx - 17, tp - 2, 34, 1, C.wood4);
    },
    animate(k, t, state, z) {
      const run = state === 'working', live = state !== 'off', calm = state === 'idle', wait = state === 'waiting', err = state === 'error';
      const wind = live ? (calm ? 2 : 4) : 0;
      const flag = (x, y, len, h, col) => { for (let i = 0; i < len; i++) { const wy = live ? Math.round(Math.sin(t * wind - i * .6) * 1.2) : i >> 1; k.rect(x + 1 + i, y + wy, 1, h - Math.floor(i * 3 / len), i % 3 === 0 ? S(col, .18) : col); } };
      // Keep standard shows the district state; towers fly the regiment's colours.
      const stateCol = err ? (Math.floor(t * 4) % 2 ? C.error : C.ink) : wait ? C.waiting : C.teal2;
      flag(0, -146, 14, 9, stateCol); if (live && !err) { k.rect(6, -143 + Math.round(Math.sin(t * wind - 3.6) * 1.2), 3, 3, C.paper); }
      flag(-66, -144, 8, 5, C.red2); flag(66, -144, 8, 5, C.red2);
      flag(-110, -2, 7, 12, C.teal2); flag(106, -2, 7, 12, C.red2);
      flag(TOWER.x, TOWER.top - 44, 7, 4, stateCol);
      for (const x of [-44, 38]) { if (live) Props.fire(k, x + 1, 122, t + x, .6); }
      // Lamp on the watchtower beacon.
      k.rect(TOWER.x - 12, TOWER.top - 16, 4, 4, live ? C[state] : C.slate1); if (live && Math.floor(t * 2) % 2) k.px(TOWER.x - 11, TOWER.top - 15, C.white);

      /* Barracks smoke and the cook fire. */
      if (live) Props.smoke(k, -167, -110, t * (run ? 1 : .5), run ? 4 : 2, err ? '#4a4640' : '#dcd8cc');
      if (live) { Props.fire(k, 140, 106, t, .8); if (run) Props.smoke(k, 140, 92, t * .7, 2, '#e8e4d8'); } else { k.rect(137, 103, 6, 2, C.red1); k.px(139, 103, C.red3); }

      /* Run board: a card travels TODO -> RUN -> DONE while working; stalls in RUN while waiting. */
      const b = BOARD, cw = Math.floor(b.w / 3);
      if (run) { const p = (t * .15) % 1, col = p < .45 ? 0 : p < .55 ? p * 10 - 4.5 : 1 + Math.min(1, (p - .55) * 4), x = b.x + 3 + col * cw, y = b.y + 7 + 21 - Math.min(21, p * 40); k.rect(x, y, cw - 6, 5, C.gold4); k.rect(x, y, cw - 6, 1, C.white); k.px(x + 1, y + 2, C.working); }
      if (wait) { for (let j = 0; j < 3; j++) k.rect(b.x + 3 + cw, b.y + 7 + j * 7, cw - 6, 5, C.waiting); k.rect(b.x + cw + 2, b.y + b.h - 8, cw - 4, 7, C.ink); k.text('HOLD', b.x + cw + 3, b.y + b.h - 7, C.waiting); }
      if (err) { k.rect(b.x + 3 + cw, b.y + 14, cw - 6, 5, C.error); if (Math.floor(t * 4) % 2) { k.rect(b.x + cw + 6, b.y - 8, 7, 7, C.ink); k.rect(b.x + cw + 7, b.y - 7, 5, 5, C.error); } }
      /* Map pawns move along the routes. */
      const m = MAP, routes = [[[6, 5], [46, 4]], [[46, 4], [32, 13]]];
      routes.forEach((r, i) => { const q = run ? (t * .2 + i * .5) % 1 : .5; const x = m.x + r[0][0] + (r[1][0] - r[0][0]) * q, y = m.y + r[0][1] + (r[1][1] - r[0][1]) * q; k.rect(x - 1, y - 3, 3, 3, C.ink); k.rect(x, y - 2, 1, 2, i ? C.teal3 : C.red3); k.px(x, y - 3, C.gold3); });

      if (!live) {
        // Lights out: the troops are in the barracks; only the lookout and two gate sentries doze at their posts.
        for (const x of [-46, -30, 23, 39]) k.rect(x, -99, 7, 9, C.glassDark);
        for (const x of [-180, -164, -124, -108]) k.rect(x, -79, 8, 5, C.glassDark);
        z.crew(TOWER.x, TOWER.top - 2, { look: 1, hat: 'helmet' });
        for (const s of [-1, 1]) { const x = s * 38; z.crew(x, 138, { look: 5, hat: 'helmet', facing: -s }); k.rect(x - 1, 126, 3, 6, C.teal2); }
        return;
      }
      /* Lookout on the watchtower scans the horizon. */
      const look = run ? (Math.floor(t * .5) % 2 ? 1 : -1) : 1;
      z.crew(TOWER.x + (run ? Math.round(Math.sin(t * .6) * 6) : 0), TOWER.top - 2, { look: 1, hat: 'helmet', anim: 'idle', facing: look, phase: .4 });

      /* The formation: 3 x 4 soldiers march, halt and present spears in a drill cycle. */
      const cyc = (t * .25) % 1, marching = run && cyc < .6, present = run && cyc >= .75 && cyc < .95;
      const dx = marching ? Math.round(Math.sin(cyc / .6 * Math.PI * 2) * 12) : 0, face = marching ? (Math.cos(cyc / .6 * Math.PI * 2) > 0 ? 1 : -1) : -1;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        const x = FORM.x - 24 + c * 16 + dx, y = FORM.y + 12 + r * 16;
        z.crew(x, y, { look: 1, hat: 'helmet', anim: marching ? 'walk' : present ? 'cheer' : 'idle', facing: face, phase: 0 });
        k.rect(x - 1, y - 12, 3, 6, C.teal2); k.px(x, y - 10, C.paper);
        if (!present) spear(k, x, y, face); else { const sx = x + (face > 0 ? 4 : -4); k.rect(sx, y - 36, 1, 16, C.wood2); k.rect(sx, y - 39, 1, 3, C.stone4); }
      }
      // Drill sergeant and drummer at the head of the square.
      z.crew(-54, 30, { look: 3, hat: 'helmet', anim: run ? (cyc < .6 ? 'cheer' : 'idle') : 'idle', facing: 1, phase: .2 }); k.rect(-55, 18, 3, 6, C.red2);
      z.crew(-54, 58, { look: 2, hat: 'cap', hatColor: C.teal1, anim: 'idle', facing: 1 });
      k.rect(-50, 49, 7, 6, C.red1); k.rect(-50, 49, 7, 1, C.paper); k.rect(-50, 54, 7, 1, C.gold1); if (run) { const hit = Math.floor(t * 4) % 2; k.line(-48, 47 - hit * 3, -46, 49, C.wood4); k.line(-44, 47 - (1 - hit) * 3, -45, 49, C.wood4); }

      /* Two recruits jog laps around the square and over the hurdles. */
      if (run) for (let i = 0; i < 2; i++) {
        const p = (t * .045 + i * .5) % 1, per = 2 * (170 + 110), d = p * per; let x, y, f = 1;
        if (d < 170) { x = -85 + d; y = -30; } else if (d < 280) { x = 85; y = -30 + (d - 170); } else if (d < 450) { x = 85 - (d - 280); y = 80; f = -1; } else { x = -85; y = 80 - (d - 450); f = -1; }
        const hop = x === 85 && [-8, 22, 52].some(h => Math.abs(y - h) < 5) ? -3 : 0;
        z.crew(x, y + hop, { look: 1, hat: 'cap', hatColor: C.teal1, anim: 'walk', facing: f, phase: i * .5 });
      }
      /* Archers loose arrows up the range. */
      TARGETS.forEach((x, i) => {
        const ax = x + 2, ay = 70;
        z.crew(ax, ay, { look: i % 2 ? 0 : 4, hat: 'hood', anim: run ? 'work' : 'idle', facing: 1, phase: i * .33, speed: 3 });
        k.line(ax + 5, ay - 18, ax + 5, ay - 8, C.wood1); k.px(ax + 6, ay - 13, C.wood3);
        if (run) { const q = (t * .9 + i * .33) % 1; if (q < .5) { const y = ay - 20 - q * 2 * 60; k.rect(ax + 5, y, 1, 6, C.wood4); k.px(ax + 5, y - 1, C.stone4); k.px(ax + 4, y + 5, C.paper); k.px(ax + 6, y + 5, C.paper); } }
        k.rect(x + 1 - i % 2, -36 + (i % 2) * 3, 1, 4, C.wood4);   // arrows already stuck in the target
      });
      if (err) { for (let i = 0; i < 6; i++) k.rect(-180 + i * 11, 30 + (i % 3) * 7, 5, 1, C.wood4); }

      /* Sparring at the dummies. */
      z.crew(-160, 116, { look: 5, hat: 'helmet', anim: run ? 'work' : 'idle', tool: 'axe', facing: 1, phase: .1, speed: 5 });
      z.crew(-138, 118, { look: 0, hat: 'bandana', hatColor: C.red2, anim: run ? 'work' : 'idle', tool: 'hammer', facing: -1, phase: .6, speed: 4 });

      /* Officers plan at the map table; a runner carries orders from the keep to the pavilion. */
      z.crew(136, 58, { look: 3, hat: 'helmet', anim: run ? 'work' : 'idle', tool: 'pen', facing: 1, phase: .3, speed: 2 }); k.rect(135, 46, 3, 6, C.red2);
      z.crew(162, 60, { look: 2, hat: 'cap', hatColor: C.teal1, anim: 'idle', facing: -1, phase: .8, carry: run ? 'paper' : '' });
      if (run) { const p = (t * .09) % 1, back = p > .5, q = back ? (1 - p) * 2 : p * 2; z.crew(16 + q * 90, -34 + q * 84, { look: 4, hat: 'cap', hatColor: C.teal1, anim: 'walk', carry: back ? '' : 'paper', facing: back ? -1 : 1, phase: .5 }); }
      else if (wait) { for (let i = 0; i < 3; i++) z.crew(10 + i * 12, -38, { look: 4 - i, hat: 'cap', hatColor: C.teal1, anim: 'idle', carry: 'paper', facing: 1, phase: i * .4 }); }

      /* Camp life: a cook stirs the pot; off-duty soldiers rest when calm. */
      z.crew(126, 102, { look: 0, hat: 'bandana', hatColor: C.paper, anim: run ? 'work' : 'sit', facing: 1, phase: .2, speed: 3 });
      if (!run) { z.crew(156, 102, { look: 1, hat: 'helmet', anim: 'sit', facing: -1 }); }
      if (err) {
        Props.smoke(k, 116, -92, t, 5, '#3a3632'); Props.smoke(k, 124, -86, t * 1.3, 3, '#5a5650');
        for (let i = 0; i < 4; i++) { const q = (t * 1.5 + i / 4) % 1; k.px(116 + Math.sin(i * 2) * q * 10, -76 - q * 8, C.gold3); }
      }
      if (live && z.detail) for (let i = 0; i < 2; i++) { const a = t * .4 + i * 3; Props.bird(k, -60 + Math.cos(a) * 60, -130 + Math.sin(a) * 8, t + i); }
    }
  };
})();
