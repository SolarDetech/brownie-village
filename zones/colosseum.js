/* The Colosseum: amphitheatre art, the founders' fighter sprites, crowd and fight effects.
   The fight itself is choreographed in colosseum.js; this module only draws a scene snapshot. */
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns.colosseum = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const FLOOR = { x: 0, y: 36, rx: 168, ry: 70 }, FY = 40; // fighters' feet line
  const BOX = { x: 0, y: -118 };
  const TIERS = 7;
  const ring = i => ({ rx: FLOOR.rx + 12 + i * 13, ry: FLOOR.ry + 10 + i * 11, cy: FLOOR.y - 4 - i * 7 });

  /* ---------- The founders' fighters ----------
     GKTC (0): Doom-Slayer-style green Praetor armour, amber-visored helmet, steel feather wings, claws, palm lasers.
     Daghan (1): Gojo-style spiky white hair, black blindfold and high-collar uniform under steel-blue plates,
     a huge war hammer, a jetpack and an arc-reactor chest that fires a beam. Sculpted (P.sculpt), facing right,
     flipped for the right side; every pose/frame is cached. Anchors (palms, chest, jet, head) feed the effects. */
  const ramp = P.ramp, MET = [-.7, -.55, -.4, -.24, -.1, 0, .28, .55], GLW = [-.45, -.25, -.1, 0, .25, .5, .72, .92];
  const RAMPS = [
    [ramp('#4b5058'), ramp('#5f8f3b', MET), ramp('#7d8793', MET), ramp('#f2a93a', GLW), ramp('#a3afbe', [-.55, -.42, -.3, -.18, -.06, .08, .3, .6]), ramp('#ff9d3a', GLW), ramp('#e2e8ef', [-.55, -.4, -.25, -.1, 0, .3, .6, .85]), ramp('#1b1d22', [-.4, -.2, 0, .12, .25, .45, .6, .75])],
    [ramp('#f1cfb3'), ramp('#e8edf5', [-.5, -.36, -.24, -.12, -.04, 0, .45, .8]), ramp('#1f2331', [-.45, -.3, -.15, 0, .1, .2, .32, .45]), ramp('#7f96b4', MET), ramp('#8f99aa', MET), ramp('#63d4ff', GLW), ramp('#15161c', [-.3, -.15, 0, .15, .3, .45, .6, .7]), ramp('#5d3b28'), ramp('#d9ae45', MET)]
  ];
  // Ramp roles per fighter.
  const RR = [{ suit: 0, arm: 1, hand: 2, boot: 0, belt: 2, glow: 5 }, { suit: 2, arm: 3, hand: 3, boot: 2, belt: 2, glow: 5 }];
  const SIZE = [{ TH: 17, SH: 16, T: 21, U: 13, F: 12 }, { TH: 18.5, SH: 17.5, T: 22.5, U: 14, F: 13 }];
  const D = Math.PI / 180, dv = a => [Math.sin(a * D), Math.cos(a * D)];               // 0° points down, 90° forward, 180° up
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s], mixp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const box = (c, d, ha, hc) => { const n = [-d[1], d[0]]; return [add(add(c, d, ha), n, hc), add(add(c, d, ha), n, -hc), add(add(c, d, -ha), n, -hc), add(add(c, d, -ha), n, hc)]; };
  function ik(s, t, U, F) {
    const dx = t[0] - s[0], dy = t[1] - s[1], d = Math.min(U + F - .01, Math.max(Math.abs(U - F) + .01, Math.hypot(dx, dy))), b = Math.atan2(dy, dx), a = Math.acos((U * U + d * d - F * F) / (2 * U * d));
    const e1 = [s[0] + Math.cos(b + a) * U, s[1] + Math.sin(b + a) * U], e2 = [s[0] + Math.cos(b - a) * U, s[1] + Math.sin(b - a) * U];
    return e1[1] > e2[1] ? e1 : e2;                                                          // the elbow hangs low
  }
  // Wing modes in the torso frame (0° = toward the head, 90° forward, −90° back, 180° toward the feet): bone [angle, length], blades [angle, length].
  const WINGS = {
    fold: { bone: [-155, 6], blades: [[-176, 30], [-170, 27], [-164, 24], [-157, 20], [-150, 16]] },
    half: { bone: [-115, 10], blades: [[-152, 30], [-137, 27], [-123, 24], [-109, 21], [-95, 17]] },
    spread: { bone: [-42, 15], blades: [[-98, 36], [-78, 34], [-58, 31], [-39, 27], [-20, 22]] },
    flap: { bone: [-100, 13], blades: [[-166, 33], [-149, 31], [-133, 28], [-118, 25], [-103, 21]] },
    swept: { bone: [-162, 12], blades: [[-180, 36], [-174, 33], [-168, 29], [-162, 25], [-156, 21]] },
    droop: { bone: [-168, 5], blades: [[-186, 27], [-180, 25], [-174, 22], [-168, 19], [-162, 16]] },
    shield: { bone: [28, 12], blades: [[160, 26], [142, 25], [124, 24], [108, 22], [94, 19]], front: true, back: 'half' },
    forward: { bone: [62, 14], blades: [[114, 36], [102, 34], [91, 32], [80, 30], [70, 26]], front: true, back: 'spread' }
  };

  // Pose table. lean°, legs [thigh°, knee bend°] near/far, arms [upper°, elbow°] (world angles) or 'grip' (far hand on the haft),
  // hands, wings (GKTC), ham (Daghan: haft angle°, 'plant' or 'floor'), glow (0–2), face, air.
  function pose(side, name, f) {
    const g = side === 0, b = f % 2, hold = g ? {} : { an: [40, 112], ham: 214 };
    const p = { lean: 3, ln: [5, 6], lf: [-5, 6], an: g ? [8, 14] : [40, 112], af: [-6, 12], hn: g ? 'claw' : 'grip', hf: g ? 'claw' : 'fist', wings: 'fold', ham: g ? null : 214, glow: 0, face: 'calm' };
    const set = o => Object.assign(p, o), guard = () => set({ lean: 8 + b, ln: [28, 36 + b * 6], lf: [-22, 14 + b * 4], an: g ? [55, 72] : [44, 92], af: g ? [36, 84] : 'grip', wings: 'half', ham: g ? null : 122, face: 'fierce' });
    const plant = g ? {} : { ham: 'plant', hamBack: true };
    switch (name) {
      case 'idle': set({ lean: 2 + b }); break;
      case 'walk': { const s = [24, 0, -24, 0][f % 4]; set({ lean: 5, ln: [s, s > 0 ? 12 : 22], lf: [-s, -s > 0 ? 12 : 22], an: g ? [-s * .8, 22] : hold.an, af: [s * .8, 22], hf: g ? 'claw' : 'fist' }); break; }
      case 'limp': { const s = [16, 0, -16, 0][f % 4]; set({ lean: 14, ln: [s, 20], lf: [-s, 24], an: g ? [-6, 6] : [-8, 4], af: [4, 8], wings: 'droop', ham: g ? null : -44, face: 'hurt', hy: 1 }); break; }
      case 'guard': guard(); break;
      case 'salute': guard(); set(g ? { an: [165, 12], hn: 'fist', af: [30, 60], wings: 'spread', lean: 2 } : { an: [172, 4], af: [-20, 40], ham: 182, lean: 0, face: 'smirk' }); break;
      case 'dash': set({ lean: 28, ln: [55, 72], lf: [-46, 26], an: g ? [80, 30] : [72, 38], af: g ? [58, 50] : 'grip', wings: 'swept', ham: g ? null : 100, face: 'fierce' }); break;
      case 'clash': set({ lean: 16, ln: [42, 46], lf: [-36, 10], an: g ? [106, 10] : [100, 24], af: g ? [80, 40] : 'grip', wings: 'spread', ham: g ? null : 150, face: 'fierce' }); break;
      case 'hurt': set({ lean: -22, ln: [20, 12], lf: [-18, 8], an: [150, 30], af: [-40, 24], hn: g ? 'claw' : 'grip', wings: 'half', ham: g ? null : 165, hy: -1, face: 'hurt', glow: 0 }); break;
      case 'block': set(g ? { lean: -6, ln: [22, 26], lf: [-26, 10], an: [72, 100], af: [62, 110], wings: 'shield', face: 'fierce' } : { lean: -6, ln: [22, 26], lf: [-26, 10], an: [62, 70], af: 'grip', ham: 176, face: 'hurt' }); break;
      case 'crouch': set({ lean: 26, ln: [72, 118], lf: [-4, 104], an: [30, 40], af: [10, 40], wings: 'spread', ham: g ? null : 205, face: 'fierce' }); break;
      case 'kneel': set({ lean: 26, ln: [84, 86], lf: [12, 104], an: [10, 6], af: [-4, 8], hn: 'fist', hf: 'fist', wings: 'droop', ham: g ? null : 'floorK', hy: 1.5, face: 'ko' }); break;
      case 'down': set({ hipY: -9, lean: -88, ln: [88, 8], lf: [80, 16], an: [-122, 12], af: [-62, 22], hn: 'fist', hf: 'fist', wings: 'fold', ham: g ? null : 'floor', face: 'ko' }); break;
      case 'rise': set({ lean: 22, ln: [70, 100], lf: [0, 90], an: [70, 20], af: [0, 10], hn: 'open', wings: 'droop', ...plant, face: 'hurt' }); break;
      case 'bow': set({ lean: 48, ln: [6, 0], lf: [-6, 0], an: [8, 0], af: [-6, 0], hn: 'fist', wings: 'fold', ...plant, hy: 1, face: 'calm' }); break;
      case 'offer': set({ lean: 14, ln: [10, 8], lf: [-12, 8], an: [76, 6], hn: 'open', af: [-5, 10], wings: 'half', ...plant, face: 'smile' }); break;
      case 'victory': set({ lean: -2 + b, ln: [14, 10], lf: [-14, 8], an: g ? [166, 10] : [172, 2], af: g ? [150, 16] : 'grip', hn: g ? 'fist' : 'grip', hf: 'fist', wings: 'spread', ham: g ? null : 180, face: 'laugh' }); break;
      case 'laugh': set({ lean: -14 - b * 4, ln: [12, 8], lf: [-12, 6], an: [32, 112], af: [18, 104], hn: 'fist', hf: 'fist', wings: b ? 'half' : 'spread', ...plant, hy: -1, hx: -.5, face: 'laugh' }); break;
      case 'point': set({ lean: 6, ln: [14, 10], lf: [-14, 8], an: [88, 0], hn: 'point', af: [-16, 112], hf: 'fist', wings: 'half', ...plant, face: 'smirk' }); break;
      case 'finger': set({ lean: 2 - b * 2, ln: [14, 10], lf: [-14, 8], an: [98 + b * 8, 42], hn: 'finger', af: [-16, 112], hf: 'fist', wings: 'spread', ...plant, face: 'smirk' }); break;
    }
    if (g) switch (name) {
      case 'claw0': set({ lean: -6, ln: [26, 30], lf: [-26, 10], an: [-50, 112], af: [60, 72], wings: 'half', face: 'fierce' }); break;
      case 'claw1': set({ lean: 26, ln: [56, 72], lf: [-42, 26], an: [-32, 60], af: [70, 50], wings: 'swept', face: 'fierce' }); break;
      case 'claw2': set({ lean: 20, ln: [48, 56], lf: [-38, 10], an: b ? [72, -12] : [112, -14], af: b ? [104, 6] : [84, 22], wings: 'half', face: 'fierce' }); break;
      case 'wings0': set({ lean: -4, ln: [30, 40], lf: [-26, 10], an: [-60, 24], af: [-42, 24], wings: 'spread', face: 'fierce' }); break;
      case 'wings1': set({ lean: 34, ln: [60, 82], lf: [-50, 26], an: [-62, 12], af: [-50, 12], wings: 'spread', face: 'fierce' }); break;
      case 'wings2': set({ lean: 18, ln: [46, 52], lf: [-36, 10], an: [92, 0], af: [70, 20], wings: 'forward', face: 'fierce' }); break;
      case 'repulsor0': set({ lean: 0, ln: [22, 20], lf: [-26, 10], an: [72, 72], hn: 'palm', af: [30, 60], wings: 'half', glow: 1, face: 'fierce' }); break;
      case 'repulsor1': set({ lean: -6, ln: [26, 24], lf: [-30, 8], an: [90, 0], hn: 'palm', af: [40, 70], wings: 'half', glow: 2, face: 'fierce' }); break;
      case 'aim2': set({ air: true, lean: 4, ln: [-10, 22], lf: [-26, 26], an: [90, 0], af: [84, 4], hn: 'palm', hf: 'palm', wings: b ? 'flap' : 'spread', glow: 2, face: 'fierce' }); break;
      case 'fly': set({ air: true, lean: 12, ln: [-12, 22], lf: [-28, 26], an: [42, 40], af: [20, 50], wings: b ? 'flap' : 'spread', face: 'fierce' }); break;
      case 'dive': set({ air: true, lean: 104, ln: [-80, 0], lf: [-86, 6], an: [100, 0], af: [95, 0], wings: 'swept', face: 'fierce' }); break;
    }
    else switch (name) {
      case 'swing0': set({ lean: -12, ln: [28, 30], lf: [-28, 8], an: [186, 22], af: 'grip', ham: 214, hamBack: true, face: 'fierce' }); break;
      case 'swing1': set({ lean: 10, ln: [50, 62], lf: [-40, 20], an: [150, 0], af: 'grip', ham: 150, face: 'fierce' }); break;
      case 'swing2': set({ lean: 26, ln: [48, 56], lf: [-40, 10], an: [100, -10], af: 'grip', ham: 96, face: 'fierce' }); break;
      case 'charge0': set({ lean: 20, ln: [40, 60], lf: [-20, 30], an: [62, 30], af: 'grip', ham: 100, face: 'fierce' }); break;
      case 'charge1': set({ lean: 42, ln: [-8, 40], lf: [-40, 30], an: [76, 16], af: 'grip', ham: 94, face: 'fierce' }); break;
      case 'charge2': set({ lean: 30, ln: [40, 50], lf: [-40, 20], an: [95, 0], af: 'grip', ham: 90, face: 'fierce' }); break;
      case 'spin0': set({ lean: -6, ln: [28, 30], lf: [-28, 8], an: [-40, 20], af: 'grip', ham: 250, hamBack: true, face: 'fierce' }); break;
      case 'spin1': { const k = f % 4; set({ lean: [0, -8, 18, 24][k], ln: [40, 48], lf: [-34, 14], an: [[-70, 20], [170, 0], [95, 0], [40, -10]][k], af: 'grip', ham: [250, 175, 95, 25][k], hamBack: k === 0, face: 'fierce' }); break; }
      case 'spin2': set({ lean: 20, ln: [44, 50], lf: [-36, 12], an: [95, 0], af: 'grip', ham: 92, face: 'fierce' }); break;
      case 'beam0': set({ lean: -8, ln: [26, 20], lf: [-26, 8], an: [-24, 20], af: [-38, 20], ham: 'plant', hamBack: true, glow: 1, face: 'fierce' }); break;
      case 'beam1': set({ lean: -20, ln: [30, 24], lf: [-30, 6], an: [-44, 10], af: [-56, 10], ham: 'plant', hamBack: true, glow: 2, face: 'shout' }); break;
      case 'jetUp': set({ air: true, lean: -2, ln: [8, 18], lf: [-6, 26], an: [176, 0], af: 'grip', ham: 186, face: 'fierce' }); break;
      case 'slam0': set({ air: true, lean: -10, ln: [30, 70], lf: [10, 60], an: [196, 30], af: 'grip', ham: 236, hamBack: true, face: 'fierce' }); break;
      case 'slam1': set({ air: true, lean: 20, ln: [30, 60], lf: [-10, 50], an: [140, 0], af: 'grip', ham: 128, face: 'shout' }); break;
      case 'smash': set({ lean: 38, ln: [70, 100], lf: [-20, 70], an: [74, 0], af: 'grip', ham: 60, face: 'shout' }); break;
    }
    if (!g && p.af === 'grip' && typeof p.ham !== 'number') p.af = [-6, 12];
    if (g && p.af === 'grip') p.af = [36, 84];
    return p;
  }
  // Pose names each fighter knows; anything else falls back to its guard.
  const KNOWN = [
    'idle walk limp guard salute dash clash hurt block crouch kneel down rise bow offer victory laugh point finger claw0 claw1 claw2 wings0 wings1 wings2 repulsor0 repulsor1 aim2 fly dive',
    'idle walk limp guard salute dash clash hurt block crouch kneel down rise bow offer victory laugh point finger swing0 swing1 swing2 charge0 charge1 charge2 spin0 spin1 spin2 beam0 beam1 jetUp slam0 slam1 smash'
  ].map(s => new Set(s.split(' ')));
  const ALIAS = { fly: 'jetUp' };

  // Geometry of one pose: joints, wings, hammer and anchors in sprite space (feet centre at 0,0).
  function rig(side, p) {
    const Z = SIZE[side], legs = [p.ln, p.lf].map(([a, b], j) => { const hip = [j ? -2 : 2, 0], knee = add(hip, dv(a), Z.TH); return { hip, knee, ankle: add(knee, dv(a - b), Z.SH), sd: dv(a - b) }; });
    const hipY = p.hipY ?? (p.air ? -(Z.TH + Z.SH + 4) : -(Math.max(legs[0].ankle[1], legs[1].ankle[1]) + 4));
    for (const l of legs) for (const k of ['hip', 'knee', 'ankle']) l[k] = [l[k][0], l[k][1] + hipY];
    const L = p.lean * D, up = [Math.sin(L), -Math.cos(L)], fw = [Math.cos(L), Math.sin(L)], H = [0, hipY];
    const at = (f, u) => [H[0] + fw[0] * f + up[0] * u, H[1] + fw[1] * f + up[1] * u];
    const loc = a => [up[0] * Math.cos(a * D) + fw[0] * Math.sin(a * D), up[1] * Math.cos(a * D) + fw[1] * Math.sin(a * D)];
    const head = add(at(1 + (p.hx || 0), Z.T + 9.5), [0, p.hy || 0]);
    const arm = (s, spec, target) => {
      let e, h;
      if (spec === 'grip') { e = ik(s, target, Z.U, Z.F); h = add(e, norm([target[0] - e[0], target[1] - e[1]]), Z.F); }
      else { e = add(s, dv(spec[0]), Z.U); h = add(e, dv(spec[0] + spec[1]), Z.F); }
      return { s, e, h, d: norm([h[0] - e[0], h[1] - e[1]]) };
    };
    const aN = arm(at(2, Z.T - 1.5), p.an);
    let ham = null;
    if (side === 1) {
      if (typeof p.ham === 'number') { const d = dv(p.ham); ham = { d, a0: add(aN.h, d, -12), a1: add(aN.h, d, 54), c: add(aN.h, d, 61) }; }
      else if (p.ham === 'plant') ham = { d: [0, -1], a0: [-24, -66], a1: [-24, -14], c: [-24, -8] };
      else if (p.ham === 'floor') ham = { d: [1, 0], a0: [-26, -3], a1: [28, -3], c: [36, -14], front: true };
      else if (p.ham === 'floorK') ham = { d: [1, 0], a0: [4, -3], a1: [44, -3], c: [52, -14], front: true };
    }
    const aF = arm(at(-2.5, Z.T - 1), p.af, ham && typeof p.ham === 'number' ? add(aN.h, ham.d, -9) : null);
    const wing = (mode, off) => {
      const W = WINGS[mode], A0 = add(W.front ? at(3, Z.T - 2.5) : at(-5.5, Z.T - 4), off), bone = add(A0, loc(W.bone[0]), W.bone[1]);
      const blades = W.blades.map(([a, len], j) => {
        const t = j / (W.blades.length - 1), base = mixp(bone, A0, t * .85), d = loc(a), n = [-d[1], d[0]], wd = 3.2 - t * .8;
        return { base, d, n, len, pts: [add(base, n, wd * .5), add(add(base, d, len * .35), n, wd), add(base, d, len), add(add(base, d, len * .5), n, -wd * .5), add(base, n, -wd * .5)] };
      });
      return { A0, bone, blades };
    };
    let wings = null;
    if (side === 0) { const W = WINGS[p.wings]; wings = { far: wing(W.front ? W.back : p.wings, add(fw, up, .6).map(v => v * 2.4)), near: wing(p.wings, [0, 0]), front: !!W.front }; }
    const A = { palm: add(aN.h, aN.d, 3), palm2: add(aF.h, aF.d, 3), chest: side ? at(5.5, 16) : at(6, 15), jet: at(-9, 2), jd: [-up[0], -up[1]], head, top: add(head, [0, side ? -17 : -10]) };
    return { Z, legs, hipY, up, fw, at, head, aN, aF, ham, wings, A };
  }

  const HELM = [[-6, 0], [-5.6, -5], [-2.2, -8.2], [3, -8.3], [6.2, -5.4], [7.4, -1.2], [7.2, 3], [5.6, 6.6], [2, 8], [-2, 7.6], [-5.6, 5]];
  const FACE = [[-5, -2], [-3, -6], [2, -6.5], [5.5, -3], [6.5, 1], [5.6, 5], [2.5, 7], [-1.5, 6.5], [-4.5, 3.5]];
  const HAIR = [[-5.5, 2], [-8.5, -1], [-7.2, -3.2], [-11.5, -6], [-7.2, -7.8], [-10, -12.5], [-4.8, -10.2], [-5, -17], [-.6, -11.6], [1.4, -17.5], [3.4, -11.2], [7.8, -14.5], [6.6, -8.2], [10.8, -6.8], [7.2, -4.9], [7.6, -3.5], [5.6, -3.6], [4.6, -1.4], [3.6, -3.5], [0, -3.5], [-3.5, -3], [-4.5, 0]];
  const BLIND = [[-5.8, -4], [6.8, -4.2], [7.1, .4], [-5.4, 1]];
  const COLLAR = [[-4.8, 3.6], [2, 5.4], [5.6, 5.6], [6.4, 10.5], [-5.4, 11]];

  function build(side, name, f) {
    const g = side === 0, p = pose(side, name, f), G = rig(side, p), R = RR[side], { at, aN, aF, legs, head: hc, Z } = G;
    // Bounding box of everything the pose draws.
    const pts = [hc, add(hc, [-12, -18]), add(hc, [12, -18]), add(hc, [0, 11]), aN.h, aF.h, aN.e, aF.e, at(-12, Z.T), at(10, Z.T), at(-12, -6), at(10, -6), ...legs.flatMap(l => [l.knee, l.ankle, add(l.ankle, [l.sd[1], -l.sd[0]], 8)])];
    if (G.wings) for (const w of [G.wings.far, G.wings.near]) for (const b of w.blades) pts.push(...b.pts);
    if (G.ham) pts.push(G.ham.a0, G.ham.a1, ...box(G.ham.c, G.ham.d, 9, 16));
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), x0 = Math.floor(Math.min(...xs)) - 5, y0 = Math.floor(Math.min(...ys)) - 5;
    const w = Math.ceil(Math.max(...xs)) + 5 - x0, h = Math.max(Math.ceil(Math.max(...ys)) + 3, 2) - y0, ox = -x0, oy = -y0;
    const canvas = P.sculpt(w, h, RAMPS[side], api => {
      const { part, force, ln, lt, dk } = api, sh = api.shapes, T = q => [q[0] + ox, q[1] + oy];
      const limb = (ps, o) => part(sh.limb(ps.map(q => [q[0] + ox, q[1] + oy, q[2]])), o);
      const spl = (ps, o) => part(sh.spline(ps.map(T)), o), poly = (ps, o) => part(sh.poly(ps.map(T)), o);
      const ell = (q, rx, ry, o) => part(sh.ellipse(q[0] + ox, q[1] + oy, rx, ry), o);
      const multi = (polys, o) => part(c => { c.beginPath(); for (const ps of polys) { ps.map(T).forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); } c.fill(); }, o);
      const F = (q, v, r) => force(q[0] + ox, q[1] + oy, v, r), L = (a, b, fn) => ln([T(a), T(b)], fn);
      const far = { tone: -.18 }, rel = q => add(hc, q);
      const wingDraw = (W, o = {}) => {
        limb([[...W.A0, 2.8], [...W.bone, 2.1]], { ramp: 2, cap: 2, ...o });
        if (o.tone) multi(W.blades.map(b => b.pts), { ramp: 4, cap: 1.5, ...o }); else for (const b of [...W.blades].reverse()) poly(b.pts, { ramp: 4, cap: 1.6 });
        for (const b of W.blades) { L(add(b.base, b.d, 2), add(b.base, b.d, b.len * .85), (x, y) => lt(x, y, 2)); L(add(add(b.base, b.n, 1.2), b.d, 1), add(add(b.base, b.n, .8), b.d, b.len * .6), (x, y) => { if (api.ramp(x, y) === 4) dk(x, y, 3); }); L(add(add(b.base, b.d, b.len * .4), b.n, -b.len * .03 - 1), add(b.base, b.d, b.len - 1), (x, y) => dk(x, y, 2)); }
        force(...T(W.bone), 6, 2);
      };
      const hand = (a, type, o) => {
        const Hh = a.h, dd = a.d, n = [-dd[1], dd[0]];
        if (type === 'open') { limb([[...Hh, 2.6], [...add(Hh, dd, 4.5), 1.8]], { ramp: R.hand, cap: 1.8, ...o }); return; }
        ell(Hh, 3, 2.9, { ramp: R.hand, cap: 2, ...o });
        if (type === 'claw') multi([-1, 0, 1].map(j => { const d2 = norm(add(dd, n, j * .22)), b0 = add(add(Hh, dd, 1.5), n, j * 1.6); return [add(b0, [-d2[1], d2[0]], .9), add(b0, d2, 8.5), add(b0, [-d2[1], d2[0]], -.9)]; }), { ramp: 6, cap: 1, shadow: false, ...o });
        if (type === 'palm') { const c = add(Hh, dd, 2.2); for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) F(add(c, [x, y]), x || y ? 4 + p.glow : 5 + p.glow, R.glow); }
        if (type === 'finger') { limb([[Hh[0], Hh[1] - 1.5, 1.6], [Hh[0], Hh[1] - 10, 1.4]], { ramp: R.hand, cap: 1.3, ...o }); ell(add(Hh, [-2.2, -2.2]), 1.2, 1.1, { ramp: R.hand, cap: 1, ...o }); ell(add(Hh, [2.2, -2.2]), 1.2, 1.1, { ramp: R.hand, cap: 1, ...o }); }
        if (type === 'point') limb([[...add(Hh, dd, 1.5), 1.3], [...add(Hh, dd, 7.5), 1.1]], { ramp: R.hand, cap: 1.2, ...o });
      };
      const armUpper = (a, isFar) => {
        const o = isFar ? far : {};
        limb([[...a.s, 3.6], [...a.e, 3.1]], { ramp: R.suit, cap: 3, ...o });
        ell(add(a.s, [-.5, -.8]), g ? (isFar ? 5.6 : 6.6) : (isFar ? 5 : 5.8), g ? (isFar ? 4.8 : 5.6) : (isFar ? 4.2 : 4.8), { ramp: R.arm, cap: 3.5, ...o });
        if (!isFar) { const s = a.s; L(add(s, [-5, -2]), add(s, [4, -3.5]), (x, y) => lt(x, y, 2)); }
      };
      const armLower = (a, type, isFar) => { const o = isFar ? far : {}; limb([[...a.e, 3.2], [...add(a.h, a.d, -1.2), g ? 3.7 : 3.3]], { ramp: R.arm, cap: 3, ...o }); hand(a, type, o); };
      const armDraw = (a, type, isFar) => { armUpper(a, isFar); armLower(a, type, isFar); };
      const legDraw = (l, isFar) => {
        const o = isFar ? far : {}, toe = [l.sd[1], -l.sd[0]];
        limb([[...l.hip, 4.4], [...l.knee, 3.7]], { ramp: R.suit, cap: 3, ...o });
        if (g) limb([[...mixp(l.hip, l.knee, .2), 3.3], [...mixp(l.hip, l.knee, .78), 3]], { ramp: R.arm, cap: 2.5, ...o });
        limb([[...l.knee, 3.7], [...l.ankle, 3.1]], { ramp: R.arm, cap: 3, ...o });
        ell(l.knee, 3.1, 2.9, { ramp: g ? 2 : 4, cap: 2, ...o });
        limb([[...add(l.ankle, l.sd, 1), 3.4], [...add(add(l.ankle, l.sd, 2.2), toe, 5.2), 2.6]], { ramp: g ? 7 : R.boot, cap: 2, ...o });
      };
      const hammer = () => {
        const Hm = G.ham, n = [-Hm.d[1], Hm.d[0]];
        limb([[...Hm.a0, 2], [...Hm.a1, 2.2]], { ramp: 7, cap: 1.6 });
        for (const t of [.02, .38, .8]) ell(mixp(Hm.a0, Hm.a1, t), 2.6, 2.6, { ramp: 8, cap: 1.2, shadow: false });
        poly(box(Hm.c, Hm.d, 8.5, 15), { ramp: 4, cap: 4, grad: .08 });
        for (const s of [-1, 1]) poly(box(add(Hm.c, n, s * 11.5), Hm.d, 9.4, 1.5), { ramp: 8, cap: 1.2 });
        poly(box(add(Hm.c, n, 15.8), Hm.d, 6.5, 1.2), { ramp: 4, cap: 1, tone: .1 });
        for (let j = -2; j <= 2; j++) F(add(add(Hm.c, n, j), Hm.d, 0), j ? 5 : 7, 5);
        for (const j of [-1, 1]) F(add(add(Hm.c, n, j * .5), Hm.d, j * 2), 6, 5);
      };
      /* Paint back to front. */
      if (g) wingDraw(G.wings.far, { tone: -.3 });
      if (!g && G.ham && p.hamBack) hammer();
      armDraw(aF, p.hf, true);
      legDraw(legs[1], true);
      if (g && !G.wings.front) wingDraw(G.wings.near);
      if (!g) { // Jetpack: twin tanks with gold trim and nozzles.
        const U = G.up;
        limb([[...at(-10.5, 20), 3.4], [...at(-10.5, 6.5), 3.4]], { ramp: 4, cap: 2.6, tone: -.12 });
        poly(box(at(-8, 13), U, 8.6, 3.8), { ramp: 3, cap: 2.4 });
        limb([[...at(-12, 19.5), 3.2], [...at(-12, 6), 3.2]], { ramp: 4, cap: 2.6 });
        for (const u of [18, 8]) L(at(-15, u), at(-8.5, u), (x, y) => { if (api.ramp(x, y) === 4) force(x, y, 5, 8); });
        ell(at(-12, 4), 2.4, 1.8, { ramp: 6, cap: 1.2 }); ell(at(-9, 4.2), 2.1, 1.6, { ramp: 6, cap: 1.2, tone: -.1 });
      }
      legDraw(legs[0], false);
      // Pelvis, abdomen and chest plate.
      spl([at(-6.8, -2.8), at(6.8, -2.8), at(7.2, 3.2), at(-7.2, 3.4)], { ramp: R.belt, cap: 2 });
      if (!g) poly([at(-7.8, 4), at(7, 4), at(9.5, -10.5), at(-10.5, -11.5)], { ramp: 2, cap: 2.5 }); // Gojo's long uniform jacket
      spl([at(-6.2, 1.5), at(6.2, 1.5), at(7, 10.5), at(-6.8, 10.5)], { ramp: R.suit, cap: 3 });
      spl([at(-7.8, 9), at(6.8, 8), at(9.4, 13), at(9.4, 18.8), at(5.6, 22.4), at(-3, 23.4), at(-8.2, 20.4), at(-8.8, 14)], { ramp: g ? R.arm : R.suit, cap: 4.5, grad: .06 });
      if (!g) { spl([at(-1, 11), at(7.5, 11), at(9.8, 15), at(9, 20.5), at(3, 21.5), at(-2, 19)], { ramp: 3, cap: 3 }); L(at(-7, 11), at(0, 11.5), (x, y) => { if (api.ramp(x, y) === 2) force(x, y, 4, 8); }); }
      L(at(1.5, 10), at(2, 21.5), (x, y) => dk(x, y, 2)); L(at(-6, 20.5), at(6, 21.5), (x, y) => lt(x, y, 2));
      for (let u = 3; u < 10; u += 2.3) L(at(-5.5, u), at(6, u), (x, y) => { if (api.ramp(x, y) === R.suit) dk(x, y, 1); });
      F(at(3.5, 0), 7, 2); F(at(4.5, 0), 6, 2); if (!g) F(at(4, 0), 7, 8);
      if (g) { L(at(-7, 12.5), at(8.8, 13.2), (x, y) => dk(x, y, 1)); for (const u of [15, 17.5]) { F(at(-5, u), 1, 7); F(at(-4, u), 1, 7); } }
      else { // Arc reactor: gold rim, glowing core.
        const c = G.A.chest, r = p.glow > 1 ? 3.4 : 2.8;
        ell(c, r + 1.2, r + 1.2, { ramp: 8, cap: 1.5, shadow: false });
        for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const d = Math.hypot(x, y); if (d <= r - .3) F(add(c, [x, y]), Math.min(7, 7 - Math.floor(d * (p.glow > 1 ? .5 : 1)) - (p.glow ? 0 : 2)), 5); }
      }
      limb([[...at(0, Z.T - 1), 2.9], [...at(.5, Z.T + 4), 2.6]], { ramp: R.suit, cap: 2 });
      armUpper(aN, false);
      // Head.
      if (g) {
        spl(HELM.map(rel), { ramp: 1, cap: 3.5, grad: .05 });
        ell(rel([-2.6, 1]), 2.3, 2.7, { ramp: 2, cap: 1.6 });
        const ko = p.face === 'ko', vis = ko ? 1 : p.face === 'hurt' ? 2 : 3;
        for (let x = -.5; x <= 7; x++) { F(rel([x, -4]), 1, 7); F(rel([x, 1]), 1, 7); for (let y = -3; y <= 0; y++) F(rel([x, y]), Math.min(7, vis + (y === -3 ? 1 : y === 0 ? -1 : 0)), 3); }
        F(rel([7.8, -2]), 1, 7); F(rel([7.8, -1]), 1, 7); if (!ko) { F(rel([2, -3]), 7, 3); F(rel([3, -3]), 7, 3); F(rel([2, -2]), 6, 3); }
        L(rel([.8, -8]), rel([1.6, -4.5]), (x, y) => lt(x, y, 2)); L(rel([2, -8]), rel([2.8, -4.5]), (x, y) => dk(x, y, 2));
        for (const x of [3.5, 5, 6.5]) L(rel([x, 2.4]), rel([x - .3, 5]), (xx, y) => dk(xx, y, 2));
      } else {
        spl(FACE.map(rel), { ramp: 0, cap: 3 });
        F(rel([7, 1]), 6, 0); F(rel([6.8, 2]), 3, 0);
        poly(BLIND.map(rel), { ramp: 6, cap: 1.4 });
        const m = p.face;
        if (m === 'laugh' || m === 'shout') { for (let x = 3; x <= 5; x++) { F(rel([x, 2]), 7, 1); F(rel([x, 3]), 0, 6); } F(rel([4, 4]), 0, 6); }
        else if (m === 'hurt') { for (let x = 3; x <= 5; x++) { F(rel([x, 2.6]), 7, 1); } F(rel([3, 3.4]), 0, 6); F(rel([5, 3.4]), 0, 6); }
        else if (m === 'ko') { F(rel([4, 2.5]), 0, 6); F(rel([4, 3.4]), 0, 6); F(rel([5, 2.5]), 1, 6); }
        else if (m === 'smirk' || m === 'smile') { F(rel([3, 3]), 1, 6); F(rel([4, 3]), 1, 6); F(rel([5, 2.4]), 1, 6); F(rel([6, 2]), 2, 6); }
        else { F(rel([3.5, 2.8]), 2, 6); F(rel([4.5, 2.8]), 2, 6); F(rel([5.5, 2.8]), 2, 6); }
        poly(COLLAR.map(rel), { ramp: 2, cap: 2 });
        poly(HAIR.map(rel), { ramp: 1, cap: 2.6, grad: .12 });
        for (let i = 0; i < 9; i++) lt(...T(rel([-6 + i * 1.7, -8 + (i % 3) * 2])), 2);
        L(rel([-5.6, -1.5]), rel([6.8, -1.8]), (x, y) => { if (api.ramp(x, y) === 6) lt(x, y, 1); });
        F(rel([-6.6, -1.4]), 3, 6); F(rel([-7.6, -.6]), 2, 6); F(rel([-8.4, .4]), 2, 6);   // blindfold knot tails
      }
      if (!g && G.ham && !p.hamBack && !G.ham.front) hammer();
      armLower(aN, p.hn, false);
      if (g && G.wings.front) wingDraw(G.wings.near);
      if (!g && G.ham && G.ham.front) hammer();
    });
    return { canvas, ox, oy, A: G.A };
  }
  const cache = {};
  function fighter(side, name, f = 0) {
    name = KNOWN[side].has(name) ? name : ALIAS[name] && KNOWN[side].has(ALIAS[name]) ? ALIAS[name] : 'guard';
    const fr = ['walk', 'limp', 'spin1'].includes(name) ? f % 4 : f % 2, key = side + name + fr;
    return cache[key] || (cache[key] = build(side, name, fr));
  }
  // Warm the cache a sprite at a time so the first bout never stutters.
  const WARM = KNOWN.flatMap((s, side) => [...s].flatMap(n => (['walk', 'limp', 'spin1'].includes(n) ? [0, 1, 2, 3] : [0, 1]).map(f => [side, n, f])));
  let warmI = 0;
  const warm = () => { if (warmI < WARM.length) { const [s, n, f] = WARM[warmI++]; fighter(s, n, f); } };

  /* ---------- Arena architecture ---------- */
  const seats = [];
  (() => {
    for (let i = 1; i <= TIERS; i++) {
      const R = ring(i), n = Math.round(R.rx * .55);
      for (let j = 0; j < n; j++) {
        const a = j / n * Math.PI * 2, x = Math.round(Math.cos(a) * (R.rx - 6)), y = Math.round(R.cy + Math.sin(a) * (R.ry - 5));
        if (Math.sin(a) > .42 && i > 4) continue;              // outer front stands sit behind the facade
        if (Math.abs(Math.cos(a)) > .96 && i < 5) continue;       // gates
        if (Math.abs(x - BOX.x) < 34 && y < BOX.y + 22) continue; // imperial box
        const h = P.hash(i * 31 + j, 7);
        seats.push({ x, y, i, j, col: ['#b8683a', '#5a8a5a', '#6a7ab0', '#c8a04a', '#a85a6a', '#e8e0cc', '#8a6a9a'][Math.floor(h * 7)], skin: [C.skin1, C.skin2, C.skin3][Math.floor(P.hash(j, i) * 3)], h });
      }
    }
    seats.sort((a, b) => a.y - b.y);
  })();
  function arch(k, x, y, w, h, dark = '#241c16') {
    k.rect(x - w / 2 - 2, y - h - 2, w + 4, h + 2, C.stone4); k.rect(x - w / 2, y - h + 2, w, h - 2, dark); k.rect(x - w / 2 + 1, y - h, w - 2, 2, dark); k.rect(x - w / 2 + 1, y - h + 2, 1, h - 2, S(dark, .25)); k.rect(x - w / 2 - 2, y, w + 4, 2, C.stone2);
  }

  function paint(k) {
    // Ground apron and a paved plaza with statues.
    k.ellipse(6, 40, 300, 214, C.shadow);
    k.ellipse(0, 30, 296, 206, C.stone1);
    k.ellipse(0, 22, 292, 200, C.stone3);
    // Outer facade: two storeys of arches wrap the far side of the bowl.
    const O = ring(TIERS + 1);
    k.ellipse(0, O.cy - 6, O.rx + 6, O.ry + 12, C.stone1);
    k.ellipse(0, O.cy - 8, O.rx + 4, O.ry + 10, C.stone2);
    for (let i = 0; i < 26; i++) {
      const a = Math.PI + (i + .5) / 26 * Math.PI, x = Math.cos(a) * (O.rx + 2), y = O.cy - 8 + Math.sin(a) * (O.ry + 8);
      arch(k, x, y + 2, 8, 12); arch(k, x, y + 20, 8, 10);
      k.rect(x - 7, y - 13, 14, 2, C.stone5);
    }
    // Tiered seating, outermost first. Each tier: a lit riser and a shaded step.
    for (let i = TIERS; i >= 0; i--) {
      const R = ring(i);
      k.ellipse(0, R.cy + 3, R.rx, R.ry, S(C.stone2, -.1));
      k.ellipse(0, R.cy, R.rx, R.ry, i % 2 ? C.stone3 : C.stone4);
      k.ellipse(0, R.cy + 1, R.rx - 3, R.ry - 3, i % 2 ? S(C.stone3, -.06) : S(C.stone4, -.05));
      if (i < TIERS) for (let j = 0; j < 40; j++) { const a = j / 40 * Math.PI * 2; if (Math.sin(a) > .5) continue; k.px(Math.cos(a) * (R.rx - 1), R.cy + Math.sin(a) * (R.ry - 1), C.stone2); }
    }
    // Aisles cut through the stands.
    for (const a of [-2.2, -1.57, -.94, -2.85, -.3]) { for (let i = 1; i <= TIERS; i++) { const R = ring(i); k.rect(Math.cos(a) * (R.rx - 6) - 2, R.cy + Math.sin(a) * (R.ry - 5) - 2, 5, 4, C.stone5); } }
    // Podium wall around the floor, gates and the sand.
    k.ellipse(0, FLOOR.y + 2, FLOOR.rx + 8, FLOOR.ry + 7, C.red1);
    k.ellipse(0, FLOOR.y, FLOOR.rx + 6, FLOOR.ry + 5, C.red2);
    for (let j = 0; j < 44; j++) { const a = j / 44 * Math.PI * 2; if (Math.sin(a) > .6) continue; k.rect(Math.cos(a) * (FLOOR.rx + 6) - 1, FLOOR.y + Math.sin(a) * (FLOOR.ry + 5) - 1, 2, 3, C.gold1); }
    k.ellipse(0, FLOOR.y, FLOOR.rx, FLOOR.ry, '#c8a468');
    k.polyTex(Array.from({ length: 40 }, (_, i) => [Math.cos(i / 40 * Math.PI * 2) * FLOOR.rx, FLOOR.y + Math.sin(i / 40 * Math.PI * 2) * FLOOR.ry]), (x, y) => {
      const d = (x / FLOOR.rx) ** 2 + ((y - FLOOR.y) / FLOOR.ry) ** 2, h = P.hash(x, y);
      if (d > .86) return h < .5 ? '#b89456' : '#c09c5e';
      if (h < .06) return '#e0c48a'; if (h > .95) return '#a8844a';
      if (Math.abs(d - .45) < .012) return '#b8945a';
      return (x * 3 + y * 7) % 23 === 0 ? '#d8b87a' : null;
    });
    k.ring(0, FLOOR.y, FLOOR.rx * .55, FLOOR.ry * .55, '#b89456');
    for (const s of [-1, 1]) {
      const gx = s * (FLOOR.rx + 4); k.rect(gx - 9, FLOOR.y - 28, 18, 30, C.stone2); k.rect(gx - 7, FLOOR.y - 24, 14, 26, '#1e1812'); k.rect(gx - 6, FLOOR.y - 26, 12, 2, '#1e1812');
      for (let i = 0; i < 4; i++) k.rect(gx - 6 + i * 4, FLOOR.y - 24, 1, 26, C.stone1);
      k.rect(gx - 10, FLOOR.y - 30, 20, 3, C.stone5); k.rect(gx - 3, FLOOR.y - 36, 6, 6, C.gold1); k.px(gx, FLOOR.y - 34, C.gold3);
      // Braziers flank the gates.
      for (const d of [-14, 14]) { k.rect(gx + d - 2, FLOOR.y - 6, 4, 8, C.stone1); k.rect(gx + d - 4, FLOOR.y - 9, 8, 3, C.stone0); }
    }
    // Imperial box: purple drape, canopy and throne on the far stands.
    k.rect(BOX.x - 32, BOX.y - 14, 64, 34, C.stone2); k.rect(BOX.x - 30, BOX.y - 12, 60, 30, C.stone4);
    k.rect(BOX.x - 30, BOX.y + 12, 60, 10, C.plum1); for (let i = 0; i < 60; i += 6) { k.rect(BOX.x - 30 + i, BOX.y + 12, 3, 12, C.plum2); k.px(BOX.x - 29 + i, BOX.y + 23, C.gold2); }
    k.rect(BOX.x - 30, BOX.y + 11, 60, 2, C.gold2);
    for (const x of [-30, 27]) k.rect(BOX.x + x, BOX.y - 34, 3, 24, C.stone5);
    k.poly([[BOX.x - 36, BOX.y - 32], [BOX.x, BOX.y - 44], [BOX.x + 36, BOX.y - 32], [BOX.x + 32, BOX.y - 28], [BOX.x - 32, BOX.y - 28]], C.plum1);
    for (let i = -32; i < 32; i += 5) k.rect(BOX.x + i, BOX.y - 30, 3, 4, i % 2 ? C.plum2 : C.gold1);
    k.rect(BOX.x - 7, BOX.y - 10, 14, 14, C.gold1); k.rect(BOX.x - 6, BOX.y - 14, 12, 5, C.gold2); k.rect(BOX.x - 5, BOX.y - 8, 10, 8, C.plum2);
    // Front facade: a low arcade that keeps the fight floor visible.
    const F = ring(TIERS + 1);
    k.polyTex(Array.from({ length: 33 }, (_, i) => { const a = .15 + i / 32 * (Math.PI - .3); return [Math.cos(a) * (F.rx + 4), F.cy + Math.sin(a) * (F.ry + 10) + 2]; }).concat(Array.from({ length: 33 }, (_, i) => { const a = Math.PI - .15 - i / 32 * (Math.PI - .3); const R5 = ring(5); return [Math.cos(a) * (R5.rx + 2), R5.cy + Math.sin(a) * (R5.ry + 3)]; })), (x, y) => ((y + 4) % 6 === 0 ? C.stone2 : (x + Math.floor((y + 4) / 6) * 4) % 8 === 0 ? C.stone2 : null) || C.stone3);
    for (let i = 0; i < 17; i++) {
      const a = .3 + (i + .5) / 17 * (Math.PI - .6), x = Math.cos(a) * (F.rx - 2), y = F.cy + Math.sin(a) * (F.ry + 6) + 4;
      if (Math.abs(x) < 26) continue; arch(k, x, y, 8, 11); k.rect(x - 6, y - 14, 12, 2, C.stone5);
    }
    // Main gate on the south with steps, statues and banners.
    const gy = F.cy + F.ry + 14; k.rect(-24, gy - 30, 48, 34, C.stone2); k.rect(-22, gy - 28, 44, 30, C.stone4); arch(k, 0, gy + 2, 22, 22);
    k.rect(-26, gy - 34, 52, 5, C.stone5); k.rect(-26, gy - 34, 52, 1, C.white); k.textCenter('ARENA', 0, gy - 33, C.stone1);
    for (let i = 0; i < 4; i++) k.rect(-22 - i * 3, gy + 4 + i * 3, 44 + i * 6, 3, i % 2 ? C.stone3 : C.stone4);
    for (const x of [-44, 44]) Props.statue(k, x, gy + 6, C.stone5);
    for (const x of [-250, 250]) { Props.tree(k, x, 150, 'dark', 2, 1); Props.tree(k, x * .88, 186, 'oak', 1, 2); }
    for (const x of [-282, 282]) Props.bush(k, x, 80, 1);
  }

  /* ---------- Per-frame drawing ---------- */
  function spectator(k, s, t, sc) {
    const cheer = sc.crowd > .5 ? Math.sin(t * (6 + s.h * 4) + s.j) > .1 - sc.crowd * .6 : Math.sin(t * .8 + s.j * 1.7) > .96;
    const jump = cheer && Math.floor(t * 8 + s.j) % 2 ? -1 : 0, x = s.x, y = s.y + jump;
    k.rect(x - 1, y - 3, 3, 3, s.col); k.rect(x - 1, y - 5, 3, 2, s.skin); k.px(x - 1, y - 5, s.h > .5 ? '#3a2a1c' : '#8a5a2a');
    if (cheer) { k.px(x - 2, y - 5, s.skin); k.px(x + 2, y - 6, s.skin); }
    if (sc.verdictCloth) { const c = sc.verdictCloth; if ((s.j + s.i) % 3 === 0) { const w = Math.floor(t * 6 + s.j) % 2; k.rect(x + 1, y - 9 + w, 3, 2, c); k.px(x + 1, y - 7, s.skin); } }
  }
  function emperor(k, t, sc) {
    const x = BOX.x, y = BOX.y + 4, stand = sc.phase === 'verdict' || sc.phase === 'resolved';
    k.rect(x - 3, y - 8 - (stand ? 3 : 0), 7, 8, C.white); k.rect(x - 3, y - 8 - (stand ? 3 : 0), 2, 8, C.plum2);
    const hy = y - 14 - (stand ? 3 : 0); k.rect(x - 2, hy, 5, 5, C.skin3); k.px(x + 1, hy + 2, C.ink); k.rect(x - 3, hy - 1, 7, 2, C.leaf3); k.px(x - 3, hy + 1, C.leaf3); k.px(x + 3, hy + 1, C.leaf3);
    if (stand) {
      const v = sc.phase === 'resolved' ? sc.sinceVote : 0, dir = sc.outcome === 'kill' ? 1 : -1, arm = sc.phase === 'resolved' ? Math.min(1, v / .5) : .5 + Math.sin(t * 4) * .1;
      k.line(x + 3, y - 9, x + 9, y - 9 + (sc.phase === 'resolved' ? dir * 5 * arm : 0), C.white, 2); k.rect(x + 9, y - 10 + (sc.phase === 'resolved' ? dir * 5 * arm : 0), 2, 2, C.skin3);
    }
  }
  const thumbSprite = () => P.sprite('thumb2', 24, 30, 12, 14, q => {
    // A clear thumbs-up: curled fist, thumb raised, toga cuff below.
    q.rect(-6, -3, 13, 13, C.skin2); q.rect(-6, -3, 13, 1, C.skin3); q.rect(-6, -3, 2, 13, C.skin3);
    for (let i = 0; i < 4; i++) { const y = -2 + i * 3; q.rect(-1, y, 8, 2, C.skin3); q.rect(-1, y + 2, 8, 1, C.skin0); q.px(6, y, C.skin1); q.px(-1, y, C.skin4); }
    q.rect(-6, -14, 5, 12, C.skin2); q.rect(-6, -14, 2, 12, C.skin3); q.rect(-5, -15, 3, 1, C.skin2); q.rect(-5, -14, 2, 3, C.skin4); q.rect(-2, -12, 1, 9, C.skin1);
    q.rect(-5, -13, 3, 2, '#f5e0d0');
    q.rect(-7, 10, 15, 5, C.white); q.rect(-7, 10, 15, 1, C.gold2); q.rect(-7, 14, 15, 1, C.stone3);
  }, C.ink);
  function thumb(k, x, y, dir, age, scale) {
    // A giant pixel thumb that pops up and turns to face its verdict.
    const pop = Math.min(1, age / .35), bounce = age < .6 ? Math.sin(Math.min(1, age / .6) * Math.PI) * 6 : 0, rot = Math.min(1, Math.max(0, (age - .35) / .45));
    const s = Math.round(scale * (0.4 + pop * .6)); if (s <= 0) return;
    const sp = thumbSprite();
    const c = k.c; c.save(); c.translate(Math.round(x), Math.round(y - bounce)); c.scale(s, s); c.rotate(dir === 'down' ? Math.PI * rot : 0); c.drawImage(sp.canvas, -sp.ox - 1, -sp.oy - 1); c.restore();
  }

  /* ---------- Dice, pop-up icons and effects ---------- */
  const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  const IVORY = '#fbf5e6', IVDK = '#d6c7a8', PIP = '#2a211c', PIP1 = '#c42a2a';
  // fr 0: face on with pips; 1: tipped on a corner; 2: a tumbling cube.
  const die = (face, fr = 0) => P.sprite('die|' + face + '|' + fr, 18, 18, 9, 9, q => {
    if (fr === 1) {
      q.poly([[0, -8], [8, 0], [0, 8], [-8, 0]], IVORY); q.poly([[8, 0], [0, 8], [0, 6], [6, 0]], IVDK); q.poly([[-8, 0], [0, -8], [0, -6], [-6, 0]], '#ffffff');
      for (const [c, r] of PIPS[face]) { const px = (c - r) * 2, py = (c + r) * 2 - 4; q.rect(px - 1, py - 1, 2, 2, face === 1 ? PIP1 : PIP); }
    } else if (fr === 2) {
      q.poly([[-7, -4], [0, -8], [7, -4], [0, 0]], '#ffffff'); q.poly([[-7, -4], [0, 0], [0, 8], [-7, 4]], IVORY); q.poly([[0, 0], [7, -4], [7, 4], [0, 8]], IVDK);
      q.rect(-1, -5, 2, 1, PIP); q.rect(-5, 0, 2, 2, PIP); q.rect(-3, 3, 2, 2, PIP); q.rect(3, 1, 2, 2, PIP1);
    } else {
      q.rect(-5, -6, 10, 12, IVORY); q.rect(-6, -5, 12, 10, IVORY); q.rect(-5, -6, 10, 1, '#ffffff'); q.rect(-6, -5, 1, 9, '#ffffff'); q.rect(-5, 5, 10, 1, IVDK); q.rect(5, -5, 1, 10, IVDK); q.px(4, 4, IVDK);
      for (const [c, r] of PIPS[face]) q.rect(-4 + c * 3, -4 + r * 3, 2, 2, face === 1 ? PIP1 : PIP);
    }
  }, C.ink);
  const LOOKC = [{ arm: '#5f8f3b', armDk: '#3b5f22', hand: '#7d8793', handLt: '#a9b2bd', handDk: '#545c66' }, { arm: '#282d3c', armDk: '#171a24', hand: '#7f96b4', handLt: '#abc0da', handDk: '#566b87' }];
  // The enlarged middle-finger pop-up, in each fighter's gauntlet colours.
  const fingerIcon = side => P.sprite('finger|' + side, 20, 32, 10, 30, q => {
    const L = LOOKC[side];
    q.rect(-6, -2, 12, 7, L.arm); q.rect(-6, -2, 12, 1, S(L.arm, .3)); q.rect(-6, 3, 12, 2, L.armDk);
    q.rect(-8, -12, 16, 11, L.hand); q.rect(-8, -12, 2, 11, L.handLt); q.rect(6, -12, 2, 11, L.handDk); q.rect(-8, -2, 16, 1, L.handDk);
    q.rect(-8, -15, 4, 4, L.hand); q.rect(-8, -15, 4, 1, L.handLt); q.rect(3, -15, 4, 4, L.hand); q.rect(3, -15, 4, 1, L.handLt); q.rect(6, -14, 2, 3, L.handDk);
    q.rect(-3, -28, 5, 17, L.hand); q.rect(-3, -28, 1, 17, L.handLt); q.rect(1, -28, 1, 17, L.handDk); q.rect(-2, -29, 3, 1, L.hand);
    q.rect(-2, -27, 3, 3, '#e8eef4'); q.rect(-3, -20, 5, 1, L.handDk); q.rect(-4, -12, 1, 2, L.handDk); q.rect(2, -12, 1, 2, L.handDk);
    q.rect(-7, -8, 9, 3, L.handLt); q.rect(-7, -6, 9, 1, L.handDk);
  }, C.ink);
  const BEAM = [{ o: '#ff5a14', m: '#ffb347', c: '#fff4d0' }, { o: '#2a6dff', m: '#63d4ff', c: '#f0fcff' }];
  const anchor = (sc, i) => sc.F[i]._a;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  function star(k, x, y, col) { k.rect(x - 2, y, 5, 1, col); k.rect(x, y - 2, 1, 5, col); k.rect(x - 1, y - 1, 3, 3, col); k.px(x, y, C.white); }
  function drawDice(k, f, t) { if (f.age > 1.9) k.alpha(Math.max(.55, 1 - (f.age - 1.9) * 2), () => dice(k, f, t)); else dice(k, f, t); }
  function dice(k, f, t) {
    const LAND = .9, cx = Math.round(f.x), a = f.age;
    for (let j = 0; j < 2; j++) {
      const rx = cx + (j ? 8 : -8), ry = FY - 112;
      if (a < LAND) {
        const q = a / LAND, x = Math.round(cx + (j ? 3 : -3) + (rx - cx - (j ? 3 : -3)) * q), y = Math.round(FY - 58 + (ry - FY + 58) * q - Math.sin(q * Math.PI) * 30);
        const fr = Math.floor(a * 14 + j * 2) % 3, face = 1 + Math.floor(P.hash(Math.floor(a * 14), j + f.i * 2) * 6);
        k.blit(die(face, fr === 0 ? 1 : fr), x, y);
      } else {
        const b = a - LAND, hop = b < .12 ? -Math.round(Math.sin(b / .12 * Math.PI) * 4) : 0;
        k.blit(die(f.faces[j], 0), rx, ry + hop);
      }
    }
    if (a >= LAND + .05) {
      const judged = a >= LAND + .25, col = !judged ? C.white : f.tie ? C.waiting : f.win ? '#ffd23a' : '#b9b3a8';
      const pop = judged && f.win && a < LAND + .45 ? 1 : 0;
      k.textBold(String(f.total), cx, FY - 101 - pop, col, C.ink, 2);
      if (judged && f.win) { k.px(cx - 13, FY - 97, '#ffd23a'); k.rect(cx - 14, FY - 96, 3, 1, '#ffd23a'); k.px(cx + 12, FY - 97, '#ffd23a'); k.rect(cx + 11, FY - 96, 3, 1, '#ffd23a'); }
      if (judged && f.win && f.dbl) k.textBold('DOUBLES!', cx, FY - 128 - (Math.floor(t * 6) % 2), '#ffe27a', C.red0, 1);
    }
  }
  function beamSrc(sc, f) { const A = anchor(sc, f.i); if (!A) return []; return f.src === 'chest' ? [A.chest] : f.src === 'palms' ? [A.palm, A.palm2] : [A.palm]; }
  function drawFx(k, f, t, sc) {
    switch (f.kind) {
      case 'dust': k.alpha(1 - f.age, () => { k.circle(f.x, FY - 1 - f.age * 3, 2 + f.age * 3, '#e8d8b0'); }); break;
      case 'dustRing': { const s = f.small ? .6 : 1; k.alpha(Math.max(0, 1 - f.age), () => { for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2; k.circle(f.x + Math.cos(a) * (10 + f.age * 44) * s, FY + Math.sin(a) * (3 + f.age * 10) * s - f.age * 4, (2 + f.age * 4) * s, j % 2 ? '#e8d8b0' : '#d8c090'); } }); break; }
      case 'spark': for (let i = 0; i < (f.big ? 10 : 7); i++) { const a = i / (f.big ? 10 : 7) * Math.PI * 2 + .3 + f.age, d = 3 + f.age * (f.big ? 20 : 13); k.line(f.x + Math.cos(a) * d * .5, FY + f.y + Math.sin(a) * d * .5, f.x + Math.cos(a) * d, FY + f.y + Math.sin(a) * d, i % 2 ? C.gold4 : C.white); } if (f.age < .4) k.circle(f.x, FY + f.y, 4, C.white); break;
      case 'impact': {
        const r = (f.big ? 12 : 7) + f.age * (f.big ? 18 : 10);
        k.alpha(1 - f.age * .7, () => { k.poly(Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * .45 : r; return [f.x + Math.cos(a) * rr, FY + f.y + Math.sin(a) * rr]; }), f.age < .5 ? C.white : C.gold3); });
        if (f.age < .5) k.circle(f.x, FY + f.y, r * .3, C.gold4); break; }
      case 'slash': {
        const R = f.wide ? 22 : 15, col = f.wide ? '#e8f0f8' : '#fff6d0', n = Math.max(2, Math.round(clamp(f.age * 2.2) * 10));
        k.alpha(1 - f.age * .8, () => { for (let j = 0; j < 3; j++) { const pts = []; for (let s = 0; s <= n; s++) { const a = (-65 + s / 10 * 130) * Math.PI / 180; pts.push([f.x + f.dir * (Math.cos(a) * (R - j * 4) - R * .5), FY + f.y + Math.sin(a) * (R - j * 4) + j * 3]); } k.path(pts, j ? col : C.white, f.wide ? 2 : 1); } }); break; }
      case 'speed': for (let i = 0; i < 4; i++) k.alpha(.8, () => k.rect(f.x - f.dir * (18 + i * 6) - (f.dir < 0 ? 12 : 0) + (f.dir ? 0 : -1), FY + f.y - 10 + i * 6, f.dir ? 12 : 1, f.dir ? 1 : 12, '#fff4d8')); break;
      case 'ring': { const s = f.big ? 2.2 : f.small ? .7 : 1; k.alpha(1 - f.age, () => { k.ring(f.x, FY, (8 + f.age * 28) * s, (3 + f.age * 8) * s, '#fff6dc'); k.ring(f.x, FY, (6 + f.age * 22) * s, (2 + f.age * 6) * s, '#d8b87a'); if (f.big) k.ring(f.x, FY, (4 + f.age * 16) * s, (1.5 + f.age * 4.5) * s, C.white); }); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.alpha(1 - f.age, () => k.rect(f.x + Math.cos(a) * (10 + f.age * 30) * s, FY - 2 - Math.abs(Math.sin(a)) * f.age * 14 * s, 2, 2, '#c8a468')); } break; }
      case 'dmg': k.alpha(1 - f.age * f.age, () => { const s = f.sig ? 2 : f.blocked ? 1 : 2; k.textBold('-' + f.n, f.x, FY + f.y, f.age < .2 ? C.white : f.blocked ? '#d8d8d8' : f.sig ? '#ffe27a' : '#ffb04a', '#5a1a14', s); if (f.blocked) k.textBold('BLOCK', f.x, FY + f.y + 8, '#cfe3ff', C.ink, 1); }); break;
      case 'ko': { const s = f.age < .2 ? 3 : 2, a = f.age < .8 ? 1 : (1 - f.age) * 5; k.alpha(a, () => k.textBold('K.O.', Math.round(f.x || 0), FY - 108 - Math.round(f.age * 6), '#ffe27a', C.red0, s)); break; }
      case 'callout': { if (f.age > 1.3) break; const a = f.age > 1 ? (1.3 - f.age) / .3 : 1, pop = f.age < .12 ? 3 : 0; k.alpha(a, () => k.textBold(f.text, Math.round(f.x), FY - 150 - pop, f.col, C.ink, 2)); break; }
      case 'flash': k.alpha(Math.max(0, 1 - f.age) * .75, () => k.ellipse(0, 0, 320, 240, C.white)); break;
      case 'dark': { const a = Math.min(.42, f.age * .5) * (f.age > 7 ? Math.max(0, 1 - (f.age - 7) / 1.5) : 1); k.alpha(a, () => k.ellipse(0, 10, 300, 220, '#140a1c')); break; }
      case 'petals': for (let i = 0; i < 46; i++) { const q = (f.age * .35 + P.hash(i, 3)) % 1, x = -170 + P.hash(i, 9) * 340 + Math.sin(t * 2 + i) * 6, y = -60 + q * 150; if (f.age * .35 < P.hash(i, 3) * .6) continue; k.rect(x, y, 2, 1, ['#f5b0c0', '#fff0c0', '#f2c14e', '#e46c52', '#ffffff'][i % 5]); } break;
      case 'banner': {
        const a = f.age < .3 ? f.age / .3 : f.age > 5.2 ? Math.max(0, 1 - (f.age - 5.2) / .8) : 1, drop = Math.round((1 - Math.min(1, f.age / .45)) * -26);
        k.alpha(a, () => { const w = 118, y = FLOOR.y - 152 + drop; k.rect(-w / 2 - 2, y - 2, w + 4, 30, C.ink); k.rect(-w / 2, y, w, 26, f.col); k.rect(-w / 2, y, w, 2, S(f.col, .4)); k.rect(-w / 2, y + 24, w, 2, S(f.col, -.4)); for (let i = 0; i < w; i += 8) k.poly([[-w / 2 + i, y + 26], [-w / 2 + i + 4, y + 31], [-w / 2 + i + 8, y + 26]], f.col); k.textBold(f.text, 0, y + 4, C.white, C.ink, 2); k.textCenter(f.sub, 0, y + 17, S(f.col, -.55)); }); break; }
      case 'beam': {
        const col = BEAM[f.i], tx = f.tx, e = clamp(f.age / .12), fade = f.age > .85 ? Math.max(0, (1 - f.age) / .15) : 1, w = f.w + (Math.floor(t * 24) % 2);
        k.alpha(fade, () => { for (const s of beamSrc(sc, f)) {
          const ty = f.ty !== undefined ? FY + f.ty : s[1], ex = s[0] + (tx - s[0]) * e, ey = s[1] + (ty - s[1]) * e;
          k.alpha(.35, () => k.line(s[0], s[1], ex, ey, col.o, w + 4)); k.line(s[0], s[1], ex, ey, col.m, w); k.line(s[0], s[1], ex, ey, col.c, Math.max(1, w - 4));
          k.circle(s[0], s[1], Math.round(w * .7) + 1, col.m); k.circle(s[0], s[1], Math.round(w * .4), col.c);
          if (e >= 1) { k.circle(ex, ey, w + 1, col.m); k.circle(ex, ey, Math.max(1, w - 3), col.c); for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 + t * 9; k.px(ex + Math.cos(a) * (w + 4), ey + Math.sin(a) * (w + 4), col.c); } }
        } }); break; }
      case 'charge': { const col = BEAM[f.i], r = 1 + Math.round(f.age * (f.src === 'chest' ? 5 : 3)); for (const s of beamSrc(sc, f)) { k.circle(s[0], s[1], r + 1, col.m); k.circle(s[0], s[1], Math.max(0, r - 1), col.c); for (let j = 0; j < 4; j++) { const a = j / 4 * Math.PI * 2 + f.age * 4, d = (1 - f.age) * 14 + 3; k.px(s[0] + Math.cos(a) * d, s[1] + Math.sin(a) * d, col.c); } } break; }
      case 'bolt': { const A = anchor(sc, f.i); if (!A) break; const s = f.hand ? A.palm2 : A.palm, col = BEAM[f.i], x = s[0] + (f.tx - s[0]) * f.age, y = s[1] + (FY + f.ty - s[1]) * f.age, d = Math.sign(f.tx - s[0]) || 1; k.rect(x - (d > 0 ? 8 : 0), y - 1, 9, 3, col.m); k.rect(x - (d > 0 ? 6 : -1), y, 6, 1, col.c); k.circle(s[0], s[1], 2, col.c); break; }
      case 'flame': {
        const A = anchor(sc, f.i); if (!A) break; const d = A.jd, n = [-d[1], d[0]], L = (f.big ? 14 : 8) + (Math.floor(t * 20) % 3) * 2;
        for (const o of [-2, 2]) { const b = [A.jet[0] + n[0] * o, A.jet[1] + n[1] * o]; for (let s = 0; s < 4; s++) { const q = s / 3, c = [b[0] + d[0] * L * q, b[1] + d[1] * L * q], r = (f.big ? 3.2 : 2.4) * (1 - q * .7); k.circle(c[0], c[1], r + 1, '#2a6dff'); k.circle(c[0], c[1], r, '#63d4ff'); if (q < .6) k.circle(c[0], c[1], Math.max(0, r - 1.2), '#f0fcff'); } }
        if (f.big) for (let j = 0; j < 3; j++) { const ph = (t * 2.5 + j / 3) % 1; k.alpha((1 - ph) * .5, () => k.circle(A.jet[0] + d[0] * (L + ph * 16), A.jet[1] + d[1] * (L + ph * 16), 2 + ph * 3, '#c8d4e4')); }
        break; }
      case 'stars': { const A = anchor(sc, f.i); if (!A) break; const c = A.top; for (let j = 0; j < 3; j++) { const a = t * 5 + j * 2.09; star(k, Math.round(c[0] + Math.cos(a) * 11), Math.round(c[1] - 3 + Math.sin(a) * 4), j === 1 ? '#8fd8ff' : '#ffe27a'); } break; }
      case 'smoke': { const A = anchor(sc, f.i); if (!A) break; const c = A.chest, n = f.light ? 2 : 4; for (let j = 0; j < n; j++) { const ph = (t * .7 + j / n) % 1; k.alpha((1 - ph) * (f.light ? .45 : .75), () => k.circle(c[0] + Math.sin(ph * 6 + j) * 3 + ph * 5 * A.dir, c[1] - 4 - ph * 24, 1.5 + ph * 4, ph < .3 ? '#6c6c74' : '#9a9aa2')); } break; }
      case 'haha': {
        const A = anchor(sc, f.i); if (!A) break; const pop = f.age < .12 ? 2 : 0, c = A.top;
        for (let j = 0; j < 2; j++) { const b = Math.floor(t * 8 + j) % 2; k.textBold(j ? 'HA!' : 'HA', Math.round(c[0] + (j ? 10 : -8)), Math.round(c[1] - 16 - j * 7 - b - pop), '#fff3a0', C.ink, 2); }
        break; }
      case 'finger': {
        const A = anchor(sc, f.i); if (!A || f.age < 0) break; const sp = fingerIcon(f.i), pop = Math.min(1, f.age / .18), s = Math.max(1, Math.round(1 + pop * 1)), bounce = f.age < .45 ? Math.round(Math.sin(Math.min(1, f.age / .45) * Math.PI) * 5) : Math.floor(t * 4) % 2;
        const x = Math.round(A.top[0] + A.dir * 22), y = Math.round(A.top[1] - 4 - bounce), c = k.c; c.save(); c.translate(x, y); c.scale(s, s); c.drawImage(sp.canvas, -sp.ox - 1, -sp.oy - 1); c.restore();
        if (f.age < .3) for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; k.px(x + Math.cos(a) * (14 + f.age * 30), y - 30 + Math.sin(a) * (14 + f.age * 30), C.white); }
        break; }
    }
  }
  function drawFighter(k, sc, i) {
    const F = sc.F[i]; if (F.pose === 'gone') { F._a = null; return; }
    const x = Math.round(F.x), gy = FY + (i === 0 ? 2 : -1), y = gy + Math.round(F.y || 0), lying = F.pose === 'down';
    k.ellipse(x + (lying ? -F.face * 2 : 1), gy, lying ? 30 : 15 - Math.min(9, Math.abs(F.y || 0) / 7), 3, '#5a3a1a55');
    const flip = F.face === -1, sp = fighter(i, F.pose, F.f || 0);
    k.blit(sp, x, y, flip);
    if (F.flash) k.blit(P.tint(sp, '#ffffff'), x, y, flip, .85);
    const m = flip ? -1 : 1, A = sp.A, tr = q => [Math.round(x + m * q[0]), Math.round(y + q[1])];
    F._a = { palm: tr(A.palm), palm2: tr(A.palm2), chest: tr(A.chest), jet: tr(A.jet), jd: [m * A.jd[0], A.jd[1]], head: tr(A.head), top: tr(A.top), dir: m };
  }

  function animate(k, t, sc) {
    sc = sc || { phase: 'ready', F: [{ x: -150, y: 0, pose: 'idle', face: 1 }, { x: 150, y: 0, pose: 'idle', face: -1 }], fx: [], crowd: .2 };
    if (sc.phase === 'fighting') warm();
    const outcome = sc.phase === 'resolved' ? sc.outcome : null, COL = sc.fighters ? sc.fighters.map(f => f.color) : ['#5f9a3c', '#3f86e8'];
    sc.verdictCloth = outcome === 'spare' ? (Math.floor(t * 4) % 2 ? '#56c157' : C.white) : outcome === 'kill' ? '#ec5a45' : sc.phase === 'verdict' ? (Math.floor(t * 2) % 2 ? '#56c157' : '#ec5a45') : null;
    for (const s of seats) spectator(k, s, t, sc);
    emperor(k, t, sc);
    // Banners on the facade in the founders' colours, and brazier flames.
    for (const x of [-120, -60, 60, 120]) Props.banner(k, x, ring(TIERS + 1).cy - ring(TIERS + 1).ry - 2 + Math.abs(x) / 8, x < 0 ? COL[0] : COL[1], t + x, 12);
    for (const s of [-1, 1]) for (const d of [-14, 14]) Props.fire(k, s * (FLOOR.rx + 4) + d, FLOOR.y - 9, t + d, 1);
    const ft = sc.clock ?? t, by = kind => sc.fx.filter(f => f.kind === kind);
    for (const f of by('dark')) drawFx(k, f, ft, sc);
    for (const f of sc.fx) if (['ring', 'dustRing', 'dust'].includes(f.kind)) drawFx(k, f, ft, sc);
    // Fighters (anyone lying down first), then effects on top. Jet flames need anchors, so they follow the pass.
    const order = [0, 1].sort((a, b) => (sc.F[a].pose === 'down' ? -1 : 0) - (sc.F[b].pose === 'down' ? -1 : 0));
    order.forEach(i => drawFighter(k, sc, i));
    for (const f of by('flame')) drawFx(k, f, ft, sc);
    for (const f of sc.fx) if (!['dark', 'thumb', 'banner', 'flash', 'ring', 'dustRing', 'dust', 'flame', 'dice', 'callout'].includes(f.kind)) drawFx(k, f, ft, sc);
    for (const f of by('dice')) drawDice(k, f, ft);
    for (const f of by('callout')) drawFx(k, f, ft, sc);
    const th = sc.fx.find(f => f.kind === 'thumb'); if (th) thumb(k, BOX.x + 52, BOX.y + 6, th.dir, th.age, 2);
    if (sc.phase === 'verdict') { const wob = Math.sin(t * 5) * .3; const c = k.c; c.save(); c.translate(BOX.x + 52, BOX.y + 6 + Math.round(Math.sin(t * 3) * 2)); c.rotate(Math.PI / 2 + wob); c.scale(2, 2); const sp = thumbSprite(); c.drawImage(sp.canvas, -sp.ox - 1, -sp.oy - 1); c.restore(); k.textBold('?', BOX.x + 52, BOX.y - 24 + Math.round(Math.sin(t * 4) * 2), C.waiting, C.ink, 2); }
    for (const f of sc.fx) if (f.kind === 'banner' || f.kind === 'flash') drawFx(k, f, ft, sc);
    // Gate guards.
    for (const s of [-1, 1]) AgentCharacters.crew(k, s * (FLOOR.rx + 26), FLOOR.y + 8, t, { look: 5, hat: 'helmet', anim: sc.crowd > .8 ? 'cheer' : 'idle', state: 'working', phase: s, facing: -s });
  }

  // Close-up camera for the arena modal: follows the fighters and the dice, keeps the floor at the bottom, widens for flights and the verdict.
  function camera(sc) {
    if (!sc || sc.phase === 'ready') return { x: 0, y: -14, w: 440 };
    const live = sc.F.filter(f => f.pose !== 'gone'), xs = live.map(f => f.x), air = Math.min(0, ...live.map(f => f.y || 0));
    const top = Math.min(sc.phase === 'resolved' ? FY - 162 : FY - 150, FY + air - 140), bot = FY + 16, span = Math.max(...xs) - Math.min(...xs), mid = (Math.max(...xs) + Math.min(...xs)) / 2;
    const w = Math.max(sc.phase === 'fighting' ? 280 : 340, span + 180, (bot - top) * 16 / 9), h = w * 9 / 16;
    return { x: Math.max(-110, Math.min(110, mid)), y: Math.round(bot - h / 2), w: Math.round(w) };
  }

  return { paint, animate, camera, FLOOR, footprint: { w: 600, h: 440 }, sprite: fighter };
})();
