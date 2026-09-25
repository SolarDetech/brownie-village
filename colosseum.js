/* Deterministic arena state and fight choreography. The founders duel in turns decided by dice (2d6 each).
   The caller's animation clock owns time, so pausing the world freezes the bout; setSpeed() scales it.
   Works in the browser (window.Colosseum) and in Node checks. */
(() => {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const fighters = [
    { name: 'GKTC', style: 'Praetor armour · steel wings · claws · palm lasers', color: '#5f9a3c' },
    { name: 'Daghan', style: 'Blindfold · war hammer · jetpack · chest beam', color: '#3f86e8' }
  ];
  const START_X = 150, FLOOR_Y = 18, MAX_TURNS = 16, ROLL = 1.5, LAND = .9, GAP = 108;

  // A seeded generator gives every bout its own dice.
  const rng = seed => { let a = (seed * 2654435761) >>> 0 || 7; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  /* Moves by tier. light = small margin (partly blocked), medium, heavy = big margin, sig = the attacker rolled doubles
     (odd doubles → first signature, even doubles → second). style drives the choreography. */
  const MOVES = [
    { light: ['claw', 'claw slash', 'melee'], medium: ['repulsor', 'repulsor blast', 'ranged'], heavy: ['wings', 'wing-blade rush', 'melee'], sig: [['barrage', 'laser barrage', 'ranged'], ['dive', 'wing-blade dive', 'aerial']] },
    { light: ['swing', 'hammer swing', 'melee'], medium: ['charge', 'jet charge', 'melee'], heavy: ['spin', 'hammer windmill', 'melee'], sig: [['slam', 'jetpack hammer slam', 'aerial'], ['beam', 'chest beam', 'ranged']] }
  ];
  // [duration, impact fraction]; the barrage lands three bolts.
  const DUR = { claw: [1.25, .5], wings: [1.6, .55], swing: [1.5, .55], charge: [1.45, .5], spin: [1.8, .62], repulsor: [1.5, .42], beam: [1.9, .4], barrage: [2.2, .38], dive: [2.1, .62], slam: [2.2, .64] };
  const REACH = { claw: 48, wings: 52, swing: 74, charge: 72, spin: 74, dive: 30, slam: 50 };
  const restMid = n => Math.round(Math.sin(n * 2.3) * 22);

  function choreograph(seed = 1) {
    const r = rng(seed), d6 = () => 1 + Math.floor(r() * 6), moves = [], turns = [], hp = [100, 100], N = fighters.map(f => f.name);
    let t = 0;
    const add = (kind, dur, o = {}) => { const m = { kind, dur, start: t, ...o }; moves.push(m); t += dur; return m; };
    add('enter', 2.4, { mid: 0, prev: 0 }); add('salute', 1.1, { mid: 0, prev: 0 });
    for (let n = 1; n <= MAX_TURNS && hp[0] > 0 && hp[1] > 0; n++) {
      const last = n === MAX_TURNS, mid = restMid(n), prev = n > 1 ? restMid(n - 1) : 0;
      // The last turn is decisive: ties are re-rolled and the blow knocks the loser down.
      let dice, tot;
      for (let k = 0; ; k++) { dice = [[d6(), d6()], [d6(), d6()]]; tot = dice.map(d => d[0] + d[1]); if (!last || tot[0] !== tot[1] || k > 40) break; }
      const by = tot[0] === tot[1] ? -1 : tot[0] > tot[1] ? 0 : 1, tr = { n, dice, totals: tot, by, start: t, land: t + LAND, mid };
      add('roll', ROLL, { turn: n - 1, mid, prev });
      if (by < 0) { const m = add('clash', 1.35, { turn: n - 1, mid, prev }); Object.assign(tr, { move: 'clash', name: 'clash', dmg: 0, hit: m.start + m.dur * .3 }); }
      else {
        const m1 = Math.abs(tot[0] - tot[1]), dd = dice[by], dbl = dd[0] === dd[1], tier = dbl ? 'sig' : m1 <= 2 ? 'light' : m1 <= 5 ? 'medium' : 'heavy';
        const [id, name, style] = tier === 'sig' ? MOVES[by].sig[dd[0] % 2 ? 0 : 1] : MOVES[by][tier];
        let dmg = tier === 'sig' ? 18 + dd[0] * 2 : tier === 'light' ? 5 + m1 * 2 : tier === 'medium' ? 9 + m1 * 2 : 16 + m1 * 2;
        dmg = Math.round(dmg * (1 + Math.max(0, n - 10) * .3));          // fatigue: late turns hit harder
        const target = 1 - by; if (last) dmg = hp[target]; dmg = Math.min(dmg, hp[target]); hp[target] -= dmg;
        const final = hp[target] === 0, [dur, hitAt] = DUR[id];
        const ticks = id === 'barrage' ? [[.38, Math.ceil(dmg / 3)], [.52, Math.ceil(dmg / 3)], [.66, dmg - 2 * Math.ceil(dmg / 3)]].filter(x => x[1] > 0) : [[hitAt, dmg]];
        const m = add('attack', dur, { turn: n - 1, mid, prev, by, move: id, style, dmg, blocked: tier === 'light', sig: tier === 'sig', final, hitAt, ticks, name });
        Object.assign(tr, { move: id, name, dmg, blocked: tier === 'light', sig: tier === 'sig', final, hit: m.start + dur * hitAt });
      }
      tr.hp = [...hp];
      tr.text = `Turn ${n} · ${N[0]} ${dice[0][0]}+${dice[0][1]}=${tot[0]} vs ${N[1]} ${dice[1][0]}+${dice[1][1]}=${tot[1]} → ` + (by < 0 ? 'tie: weapons clash, no damage' : `${tr.sig ? 'doubles! ' : ''}${N[by]}: ${tr.name}, ${tr.dmg}${tr.blocked ? ' (partly blocked)' : ''}${tr.final ? ' · K.O.!' : ''}`);
      turns.push(tr);
    }
    const winner = hp[0] > 0 ? 0 : 1, lastAtk = moves[moves.length - 1];
    add('down', 1.8, { by: winner, mid: lastAtk.mid, prev: lastAtk.mid, ko: lastAtk });
    return { seed, moves, turns, duration: t, winner, loser: 1 - winner };
  }

  /* ---------- Clock: arena time = base + (t − anchor) · speed, so a speed change never jumps ---------- */
  let phase = 'ready', startedAt = 0, endedAt = 0, votedAt = 0, bout = 0, outcome = null, plan = null, speed = 1, base = 0, anchor = 0;
  const clock = t => base + (t - anchor) * speed;
  function setSpeed(s, t = 0) { if (!(s > 0)) return speed; base = clock(t); anchor = t; speed = s; return speed; }
  const duration = () => plan ? plan.duration : choreograph(1).duration;

  function hpAt(ft) {
    const hp = [100, 100]; if (!plan) return hp;
    for (const m of plan.moves) if (m.ticks) for (const [f, d] of m.ticks) if (ft >= m.start + m.dur * f) hp[1 - m.by] = Math.max(0, hp[1 - m.by] - d);
    return hp;
  }
  const frac = x => x - Math.floor(x);
  function turnAt(ft) {
    if (!plan) return null; let cur = null;
    for (const tr of plan.turns) if (ft >= tr.start) cur = tr;
    if (!cur) return null;
    const landed = ft >= cur.land, k = Math.floor(ft * 14);
    const shown = landed ? cur.dice : cur.dice.map((d, i) => d.map((_, j) => 1 + Math.floor(frac(Math.sin(k * 12.9898 + i * 78.233 + j * 37.719) * 43758.5453) * 6)));
    return { ...cur, landed, shown, resolved: ft >= cur.hit, text: landed ? cur.text : `Turn ${cur.n} · rolling the dice…` };
  }
  function snapshot(t = 0) {
    const c = clock(t);
    if (phase === 'fighting' && c - startedAt >= plan.duration) { phase = 'verdict'; endedAt = startedAt + plan.duration; }
    const ft = phase === 'fighting' ? Math.max(0, c - startedAt) : phase === 'ready' ? 0 : plan ? plan.duration : 0;
    const d = plan ? plan.duration : duration();
    const winner = plan ? plan.winner : 0, loser = 1 - winner;
    return {
      phase, bout, outcome, fighters, winner, loser, duration: d, fightTime: ft, progress: phase === 'ready' ? 0 : Math.min(1, ft / d), speed, clock: c,
      hp: phase === 'ready' ? [100, 100] : hpAt(ft), remaining: phase === 'fighting' ? Math.max(0, Math.ceil((d - ft) / speed)) : 0,
      turn: phase === 'ready' ? null : turnAt(ft), sinceEnd: Math.max(0, c - endedAt), sinceVote: Math.max(0, c - votedAt), plan
    };
  }
  function start(t, seed) {
    if (phase === 'fighting' || phase === 'verdict') return false;
    bout++; plan = choreograph(Number.isFinite(seed) ? seed >>> 0 : Math.floor(Math.random() * 2147483647)); phase = 'fighting'; startedAt = clock(t); outcome = null; return true;
  }
  function vote(choice, t) { snapshot(t); if (phase !== 'verdict' || !['spare', 'kill'].includes(choice)) return false; outcome = choice; phase = 'resolved'; votedAt = clock(t); return true; }

  /* ---------- Sampling the choreography into poses ---------- */
  const ease = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, x) => a + (b - a) * x, seg = (q, a, b) => clamp((q - a) / (b - a));
  // Fighter state: x (arena units, 0 = centre; fighter 0 on the left), y offset (air, negative = up), pose, frame, facing, flash.
  // Effects that start at a fighter's body name it (i) and a sprite anchor; the art resolves the anchor.
  function sample(p, ft) {
    const F = [{ x: -START_X, y: 0, pose: 'idle', f: 0, face: 1, flash: 0 }, { x: START_X, y: 0, pose: 'idle', f: 0, face: -1, flash: 0 }], fx = [];
    const out = { F, fx, shake: 0, crowd: .25 };
    if (!p) return out;
    const m = p.moves.find(q => ft < q.start + q.dur) || p.moves[p.moves.length - 1];
    let u = Math.min(ft - m.start, m.dur);
    // Hit-stop: hold the pose for a few frames at the first impact.
    const hitT = m.ticks ? m.dur * m.ticks[0][0] : 0, hs = m.kind !== 'attack' ? 0 : m.final ? .24 : m.sig ? .14 : .08;
    if (hs && u > hitT && u < m.dur) u = u < hitT + hs ? hitT : hitT + (u - hitT - hs) * (m.dur - hitT) / (m.dur - hitT - hs);
    const q = clamp(u / m.dur), bob = Math.floor(ft * 3) % 2, mid = m.mid;
    const restX = i => mid + (i ? GAP / 2 : -GAP / 2);
    for (const i of [0, 1]) { F[i].x = restX(i); F[i].pose = 'guard'; F[i].f = bob; }
    const tr = m.turn !== undefined ? p.turns[m.turn] : null;
    if (tr) for (const i of [0, 1]) fx.push({ kind: 'dice', i, x: restX(i), age: ft - tr.start, faces: tr.dice[i], total: tr.totals[i], win: tr.by === i, tie: tr.by < 0, dbl: tr.dice[i][0] === tr.dice[i][1] });
    switch (m.kind) {
      case 'enter': {
        const g = lerp(300, GAP, ease(q)); F[0].x = -g / 2; F[1].x = g / 2;
        F[0].pose = F[1].pose = q < .96 ? 'walk' : 'idle'; F[0].f = F[1].f = Math.floor(u * 7) % 4; out.crowd = .8;
        if (q < .96 && Math.floor(u * 7) % 2 === 1) for (const i of [0, 1]) fx.push({ kind: 'dust', x: F[i].x - F[i].face * 8, y: 0, age: (u * 7) % 1 });
        break; }
      case 'salute': for (const i of [0, 1]) { F[i].pose = q < .85 ? 'salute' : 'guard'; F[i].f = Math.floor(u * 5) % 2; } out.crowd = 1; break;
      case 'roll': {
        // Side-step to this turn's spot while the dice tumble.
        const s = ease(seg(q, 0, .5));
        for (const i of [0, 1]) { F[i].x = lerp(m.prev, mid, s) + (i ? GAP / 2 : -GAP / 2); F[i].pose = 'guard'; F[i].f = s > 0 && s < 1 ? Math.floor(u * 6) % 2 : bob; }
        out.crowd = q > LAND / ROLL ? .7 : .4; break; }
      case 'clash': {
        const a = seg(q, 0, .28), back = seg(q, .8, 1), lock = q >= .28 && q < .8, jit = lock ? (Math.floor(ft * 18) % 2 ? 1 : -1) : 0;
        F[0].x = lerp(restX(0), mid - 24, ease(a) * (1 - ease(back))) + jit; F[1].x = lerp(restX(1), mid + 34, ease(a) * (1 - ease(back))) + jit;
        for (const i of [0, 1]) { F[i].pose = q < .28 ? 'dash' : lock ? 'clash' : 'guard'; F[i].f = Math.floor(ft * 6) % 2; }
        if (lock) { out.shake = 1.5; fx.push({ kind: 'spark', x: mid + 4, y: -46, age: (u * 7) % 1, big: true }); fx.push({ kind: 'callout', text: 'CLASH!', x: mid, age: (q - .28) * m.dur, col: '#f4b73a' }); }
        out.crowd = lock ? 1 : .5; break; }
      case 'attack': attack(m, u, q, F, fx, out, restX); break;
      case 'down': {
        const ko = m.ko, a = m.by, b = 1 - a, dirA = a === 0 ? 1 : -1, lx = koX(ko, restX);
        F[b].x = lx; F[b].pose = q < .55 ? 'down' : 'kneel'; F[b].y = 0;
        F[a].x = lerp(restX(a), lx - dirA * 66, ease(seg(q, 0, .5))); F[a].pose = q < .5 ? 'walk' : 'victory'; F[a].f = Math.floor(u * (q < .5 ? 7 : 4)) % (q < .5 ? 4 : 2);
        if (q < .6) fx.push({ kind: 'ko', x: lx, age: q / .6 });
        fx.push({ kind: 'stars', i: b, age: u }); fx.push({ kind: 'smoke', i: b, age: u });
        out.crowd = 1; break; }
    }
    return out;
  }
  const koX = (ko, restX) => restX(1 - ko.by) + (ko.by === 0 ? 1 : -1) * 36;

  function attack(m, u, q, F, fx, out, restX) {
    const a = m.by, b = 1 - a, dirA = a === 0 ? 1 : -1, ax0 = restX(a), bx0 = restX(b), hq = m.hitAt, mv = m.move;
    const A = F[a], B = F[b], imp = q - hq, fin = m.final;
    // Defender reaction to a hit that landed imp (fraction) ago; kb = knockback distance.
    const react = (imp, kb, air = 0) => {
      if (imp < 0) return;
      if (fin) {
        const k = clamp(imp / .3); B.x = bx0 + dirA * 36 * ease(k); B.y = -Math.sin(k * Math.PI) * (14 + air); B.pose = k < 1 ? 'hurt' : 'down'; B.flash = imp < .06 ? 1 : 0;
        if (imp < .1) { fx.push({ kind: 'flash', age: imp / .1 }); out.shake = 6; }
        if (k >= 1) fx.push({ kind: 'ring', x: B.x, age: clamp((imp - .3) / .2), small: true });
        return;
      }
      const back = seg(q, .8, 1);
      if (m.blocked) { B.pose = imp < .3 ? 'block' : 'guard'; B.x = bx0 + dirA * 8 * clamp(imp * 6) * (1 - back); }
      else { const k = clamp(imp * 4); B.pose = imp < .32 ? 'hurt' : 'guard'; B.x = bx0 + dirA * kb * ease(k) * (1 - ease(back)); B.y = -Math.sin(k * Math.PI) * air; B.flash = imp < .05 ? 1 : 0; }
    };
    const dmgFx = imp => { if (imp >= 0 && imp < .45) fx.push({ kind: 'dmg', x: B.x + dirA * 18, y: -60 - imp * 26, age: imp / .45, n: m.dmg, blocked: m.blocked, sig: m.sig }); };
    const kb = 8 + m.dmg * .7;
    if (m.sig && q < .3) fx.push({ kind: 'callout', text: m.name.toUpperCase() + '!', x: ax0 + dirA * 10, age: u, col: a === 0 ? '#ffc94a' : '#8fd8ff' });
    out.crowd = imp >= 0 ? 1 : .55;
    if (m.style === 'melee') {
      const w = .16, reach = REACH[mv], tx = bx0 - dirA * reach, dash = seg(q, w, hq), ret = seg(q, hq + .22, 1);
      A.x = lerp(ax0, tx, ease(dash)) * (1 - ease(ret)) + ax0 * ease(ret);
      A.pose = q < w ? mv + '0' : q < hq ? mv + '1' : q < hq + .22 ? mv + '2' : 'guard'; A.f = Math.floor(u * 8) % 2;
      if (mv === 'charge' && q >= w && q < hq + .1) { A.y = -6 * Math.sin(dash * Math.PI); fx.push({ kind: 'flame', i: a, age: u, big: true }); }
      if (mv === 'spin') A.f = Math.floor(u * 10) % 4;
      if (q >= w && q < hq) fx.push({ kind: 'speed', x: A.x, y: -40, dir: dirA, age: dash });
      react(imp, kb);
      if (imp >= 0 && imp < .1) { fx.push({ kind: m.blocked ? 'spark' : 'impact', x: bx0 - dirA * 8, y: -44, age: imp / .1, big: !m.blocked && m.dmg > 20 }); out.shake = Math.max(out.shake, m.blocked ? 1.5 : 3.5); }
      if (mv === 'claw' && imp >= 0 && imp < .2) fx.push({ kind: 'slash', x: bx0 - dirA * 6, y: -48, dir: dirA, age: imp / .2 });
      if (mv === 'wings' && imp >= 0 && imp < .22) fx.push({ kind: 'slash', x: bx0 - dirA * 6, y: -52, dir: dirA, age: imp / .22, wide: true });
      dmgFx(imp);
    } else if (m.style === 'ranged') {
      if (mv === 'barrage') {
        const up = ease(seg(q, .12, .28)) * (1 - ease(seg(q, .82, .96)));
        A.y = -22 * up; A.pose = q < .12 ? 'crouch' : q < .28 || q >= .82 ? 'fly' : 'aim2'; A.f = Math.floor(u * 8) % 2;
        for (let j = 0; j < 6; j++) { const s = .3 + j * .065, age = (q - s) / .08; if (age >= 0 && age < 1) fx.push({ kind: 'bolt', i: a, hand: j % 2, tx: bx0, ty: -46 + (j % 3) * 5, age }); }
        let first = -1; for (const [f] of m.ticks) if (q >= f) first = f;
        if (first >= 0) { react(q - first, kb * .5); if (q - first < .05) { fx.push({ kind: 'impact', x: bx0 - dirA * 6, y: -46, age: (q - first) / .05 }); out.shake = 3; } }
        dmgFx(imp);
      } else {
        const chest = mv === 'beam', c0 = chest ? .3 : .22, f0 = chest ? .34 : .3, f1 = chest ? .78 : .62;
        A.pose = q < c0 ? mv + '0' : q < f1 + .08 ? mv + '1' : 'guard'; A.f = Math.floor(u * 10) % 2;
        A.x = ax0 - dirA * (q >= f0 && q < f1 ? 3 : 0);
        if (q < f0) fx.push({ kind: 'charge', i: a, src: chest ? 'chest' : 'palm', age: q / f0 });
        if (q >= f0 && q < f1) { fx.push({ kind: 'beam', i: a, src: chest ? 'chest' : 'palm', tx: B.x, w: chest ? 9 : 4, age: (q - f0) / (f1 - f0) }); out.shake = Math.max(out.shake, chest ? 3 : 1.5); }
        react(imp, chest ? kb * 1.2 : kb);
        if (imp >= 0 && imp < .1) fx.push({ kind: 'impact', x: bx0 - dirA * 6, y: -46, age: imp / .1, big: chest });
        dmgFx(imp);
      }
    } else { // aerial: dive or jetpack slam
      const slam = mv === 'slam', top = slam ? -76 : -58, reach = REACH[mv], tx = bx0 - dirA * reach;
      const rise = ease(seg(q, .12, .42)), fall = seg(q, slam ? .52 : .42, hq), ret = ease(seg(q, .8, 1));
      const hx = ax0 + dirA * (slam ? (tx - ax0) * dirA * .45 : -10);
      if (q < .12) { A.pose = 'crouch'; }
      else if (q < (slam ? .52 : .42)) { A.x = lerp(ax0, hx, rise); A.y = top * rise; A.pose = slam ? (q < .42 ? 'jetUp' : 'slam0') : 'fly'; A.f = Math.floor(u * 8) % 2; if (slam) fx.push({ kind: 'flame', i: a, age: u, big: true }); }
      else if (q < hq) { A.x = lerp(hx, tx, fall * fall); A.y = top * (1 - fall * fall); A.pose = slam ? 'slam1' : 'dive'; fx.push({ kind: 'speed', x: A.x, y: -40 + A.y, dir: dirA, age: fall }); }
      else { A.x = lerp(tx, ax0, ret); A.y = 0; A.pose = q < .8 ? (slam ? 'smash' : 'claw2') : 'guard'; A.f = Math.floor(u * 8) % 2; }
      react(imp, kb, 10);
      if (imp >= 0 && imp < .16) { fx.push({ kind: 'ring', x: tx + dirA * (slam ? 22 : 8), age: imp / .16, big: slam }); out.shake = Math.max(out.shake, slam ? 6 : 4.5); }
      if (imp >= 0 && imp < .1) fx.push({ kind: 'impact', x: bx0 - dirA * 6, y: slam ? -26 : -40, age: imp / .1, big: true });
      if (slam && imp >= 0 && imp < .5) fx.push({ kind: 'dustRing', x: tx + dirA * 22, age: imp / .5 });
      dmgFx(imp);
    }
  }

  // Resolve the full arena state for rendering (fight, verdict, spare/finisher aftermath).
  function scene(t = 0) {
    const s = snapshot(t);
    if (s.phase === 'ready') return { ...s, ...sample(null, 0) };
    const r = sample(s.plan, s.fightTime);
    if (s.phase === 'verdict' || s.phase === 'resolved') {
      const w = s.winner, l = s.loser, dir = w === 0 ? 1 : -1, W = r.F[w], L = r.F[l];
      L.pose = 'kneel'; W.pose = 'guard'; L.y = W.y = 0; L.flash = W.flash = 0; W.f = Math.floor(s.clock * 4) % 2;
      const wx = W.x, lx = L.x;
      r.fx = []; r.shake = 0; r.crowd = s.phase === 'verdict' ? .6 : 1;
      if (s.phase === 'verdict') {
        // The winner mocks the kneeling loser: laughs, points, flips the finger, on a loop.
        const e = s.sinceEnd, c = (e - .4) % 4.4;
        if (e >= .4) { W.pose = c < 1.4 ? 'laugh' : c < 2.2 ? 'point' : c < 3.7 ? 'finger' : 'guard'; W.f = Math.floor(e * 5) % 2; }
        if (e >= .4 && c < 1.4) r.fx.push({ kind: 'haha', i: w, age: c });
        if (W.pose === 'finger') r.fx.push({ kind: 'finger', i: w, age: c - 2.2 });
        r.fx.push({ kind: 'stars', i: l, age: s.clock }, { kind: 'smoke', i: l, age: s.clock, light: true });
      } else {
        const v = s.sinceVote;
        if (s.outcome === 'spare') {
          // Thumb up → winner offers a hand → both rise and bow → the spared fighter limps out, waving.
          const walkTo = lx - dir * 46;
          if (v < 2.4 && v >= 1.3) { W.x = lerp(wx, walkTo, ease(seg(v, 1.3, 2.4))); W.pose = 'walk'; W.f = Math.floor(v * 7) % 4; }
          else if (v >= 2.4 && v < 3.3) { W.x = walkTo; W.pose = 'offer'; L.pose = v < 2.9 ? 'kneel' : 'rise'; }
          else if (v >= 3.3 && v < 4.4) { W.x = walkTo; W.pose = L.pose = 'bow'; }
          else if (v >= 4.4) {
            W.x = walkTo; W.pose = 'victory'; W.f = Math.floor(v * 4) % 2;
            const q = seg(v, 4.4, 8.4); L.x = lerp(lx, lx + dir * 240, q); L.pose = q < 1 ? 'limp' : 'gone'; L.f = Math.floor(v * 5) % 4; L.face = dir;
            if (q < 1) r.fx.push({ kind: 'smoke', i: l, age: v, light: true });
          }
          if (v < 2.4) r.fx.push({ kind: 'stars', i: l, age: s.clock });
          if (v > 3.3) r.fx.push({ kind: 'petals', age: v - 3.3 });
          r.fx.push({ kind: 'thumb', dir: 'up', age: v });
          if (v > 1.2 && v < 7.2) r.fx.push({ kind: 'banner', text: 'MISSIO', sub: 'MERCY GRANTED', age: v - 1.2, col: '#56c157' });
        } else finisher(r, w, l, dir, wx, lx, v, s.clock);
      }
    }
    return { ...s, ...r };
  }

  /* Finishers after a thumbs-down. Cartoon only: the loser ends knocked out (smoking armour, dizzy stars), never dead.
     GKTC: wings spread, rises, twin palm lasers, claw dive. Daghan: jetpack launch, hammer smash + shockwave, chest beam. */
  function finisher(r, w, l, dir, wx, lx, v, clock) {
    const W = r.F[w], L = r.F[l], fx = r.fx, hit = (at, big) => { if (v >= at && v < at + .14) { fx.push({ kind: 'flash', age: (v - at) / .14 }); L.flash = 1; r.shake = big ? 8 : 5; } };
    fx.push({ kind: 'thumb', dir: 'down', age: v }, { kind: 'dark', age: v });
    const standX = lx - dir * 34;
    let ko = 99;
    if (w === 0) {
      const hx = lx - dir * 70;
      if (v < 1.2) { W.pose = 'guard'; }
      else if (v < 1.8) { const k = ease(seg(v, 1.2, 1.8)); W.x = lerp(wx, hx, k); W.y = -44 * k; W.pose = 'fly'; W.f = Math.floor(v * 10) % 2; if (v < 1.5) fx.push({ kind: 'dustRing', x: wx, age: (v - 1.2) / .3, small: true }); }
      else if (v < 3.1) {
        W.x = hx; W.y = -44 + Math.sin(v * 6) * 2; W.pose = 'aim2'; W.f = Math.floor(v * 10) % 2;
        if (v < 2.05) fx.push({ kind: 'charge', i: w, src: 'palms', age: (v - 1.8) / .25 });
        else { fx.push({ kind: 'beam', i: w, src: 'palms', tx: lx, ty: -30, w: 5, age: (v - 2.05) / 1.05 }); r.shake = 2.5; L.pose = 'hurt'; L.flash = Math.floor(v * 12) % 2; fx.push({ kind: 'impact', x: lx, y: -34, age: ((v - 2.05) * 5) % 1 }); }
        hit(2.05);
      } else if (v < 3.5) { const k = seg(v, 3.1, 3.5); W.x = lerp(hx, lx - dir * 20, k * k); W.y = -44 * (1 - k * k); W.pose = 'dive'; fx.push({ kind: 'speed', x: W.x, y: -40 + W.y, dir, age: k }); L.pose = 'hurt'; }
      else { ko = 3.5; W.x = v < 4.1 ? lx - dir * 20 : lerp(lx - dir * 20, standX, ease(seg(v, 4.1, 4.5))); W.pose = v < 4.1 ? 'claw2' : 'finger'; }
      if (v >= 3.5 && v < 3.66) fx.push({ kind: 'impact', x: lx, y: -30, age: (v - 3.5) / .16, big: true }), fx.push({ kind: 'slash', x: lx, y: -40, dir, age: (v - 3.5) / .16, wide: true });
      hit(3.5, true);
    } else {
      const top = lx - dir * 56;
      if (v < 1.2) W.pose = 'guard';
      else if (v < 1.4) W.pose = 'crouch';
      else if (v < 2.2) { const k = ease(seg(v, 1.4, 2.2)); W.x = lerp(wx, top, k); W.y = -70 * k; W.pose = 'jetUp'; fx.push({ kind: 'flame', i: w, age: v, big: true }); if (v < 1.7) fx.push({ kind: 'dustRing', x: wx, age: (v - 1.4) / .3, small: true }); }
      else if (v < 2.45) { W.x = top; W.y = -70; W.pose = 'slam0'; fx.push({ kind: 'flame', i: w, age: v }); }
      else if (v < 2.7) { const k = seg(v, 2.45, 2.7); W.x = top; W.y = -70 * (1 - k * k); W.pose = 'slam1'; fx.push({ kind: 'speed', x: W.x, y: -60 + W.y, dir: 0, age: k }); }
      else if (v < 3.4) { ko = 2.7; W.x = top; W.pose = 'smash'; }
      else if (v < 4.9) { ko = 2.7; W.x = top; W.pose = v < 3.6 ? 'beam0' : 'beam1'; W.f = Math.floor(v * 10) % 2; if (v < 3.6) fx.push({ kind: 'charge', i: w, src: 'chest', age: (v - 3.4) / .2 }); else { fx.push({ kind: 'beam', i: w, src: 'chest', tx: lx + dir * 8, ty: -6, w: 10, age: (v - 3.6) / 1.3 }); r.shake = 3.5; L.flash = Math.floor(v * 12) % 2; } }
      else { ko = 2.7; W.x = lerp(top, standX, ease(seg(v, 4.9, 5.4))); W.pose = v < 5.4 ? 'walk' : 'finger'; W.f = Math.floor(v * 7) % 4; }
      if (v >= 2.7 && v < 3.0) { fx.push({ kind: 'ring', x: lx - dir * 8, age: (v - 2.7) / .3, big: true }); fx.push({ kind: 'dustRing', x: lx - dir * 8, age: (v - 2.7) / .6 }); fx.push({ kind: 'impact', x: lx, y: -18, age: (v - 2.7) / .3, big: true }); }
      if (v >= 2.7 && v < 3.3) fx.push({ kind: 'dustRing', x: lx - dir * 8, age: (v - 2.7) / .6 });
      hit(2.7, true); hit(3.6);
    }
    if (v >= ko) {
      L.pose = 'down'; const k = clamp((v - ko) / .3); L.x = lx + dir * 14 * ease(k); L.y = -Math.sin(k * Math.PI) * 10;
      fx.push({ kind: 'smoke', i: l, age: v }, { kind: 'stars', i: l, age: clock });
      if (v - ko < .6) fx.push({ kind: 'ko', x: lx, age: (v - ko) / .6 });
    }
    const KO = w === 0 ? 3.5 : 2.7; if (v > KO + .4 && v < KO + 6.4) fx.push({ kind: 'banner', text: 'FINISH', sub: 'TOTAL KNOCKOUT', age: v - KO - .4, col: '#ec5a45' });
    // Standing over the loser, the winner flips the finger and laughs.
    if (W.pose === 'finger') { const c = (v - ko - 1) % 3; if (c > 2) W.pose = 'laugh'; W.f = Math.floor(v * 5) % 2; if (c <= 2) fx.push({ kind: 'finger', i: w, age: c }); else fx.push({ kind: 'haha', i: w, age: c - 2 }); }
    r.crowd = 1;
  }

  root.Colosseum = { snapshot, scene, start, vote, setSpeed, choreograph, fighters, MAX_TURNS, get speed() { return speed; }, get duration() { return duration(); }, FLOOR_Y };
})();
