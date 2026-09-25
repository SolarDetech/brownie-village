// Run with: node claude-village-prototype/checks/arena.cjs
const assert = require('node:assert/strict');
require('../colosseum.js');
const arena = globalThis.Colosseum;
assert.equal(arena.snapshot(0).phase, 'ready');
assert.equal(arena.vote('kill', 0), false, 'no vote before a bout');
assert.equal(arena.start(10, 1), true);
assert.equal(arena.start(11), false, 'cannot restart mid-bout');
const s0 = arena.snapshot(10), d = s0.duration, plan = s0.plan;
assert.ok(d > 20 && d < 60, 'bout length ' + d);
const mid = arena.snapshot(10 + d / 2);
assert.equal(mid.phase, 'fighting');
assert.deepEqual(arena.snapshot(10 + d / 2), mid, 'a frozen caller clock pauses the bout');
assert.equal(arena.vote('spare', 10 + d / 2), false, 'no vote during the fight');
// HP only ever goes down, and both fighters stay alive until the final blow.
const finalHit = plan.turns[plan.turns.length - 1].hit;
let last = [100, 100];
for (let t = 10; t < 10 + d; t += .05) { const hp = arena.snapshot(t).hp; assert.ok(hp[0] <= last[0] && hp[1] <= last[1], 'hp never increases'); if (t - 10 < finalHit) assert.ok(hp[0] > 0 && hp[1] > 0, 'both alive before the final blow'); last = hp; }
// Every frame of the choreography samples without throwing and keeps fighters on the floor.
for (let t = 10; t < 10 + d; t += 1 / 24) { const s = arena.scene(t); for (const f of s.F) { assert.ok(Number.isFinite(f.x) && Math.abs(f.x) <= 160, 'x ' + f.x); assert.ok(Number.isFinite(f.y) || f.y === undefined); assert.ok(typeof f.pose === 'string'); } }
const end = arena.snapshot(10 + d + .1);
assert.equal(end.phase, 'verdict');
assert.equal(end.hp[end.loser], 0);
assert.ok(end.hp[end.winner] > 0);
assert.equal(arena.vote('invalid', 10 + d + .1), false);
assert.equal(arena.vote('spare', 10 + d + .2), true);
assert.equal(arena.vote('kill', 10 + d + .3), false, 'votes cannot change');
assert.equal(arena.snapshot(10 + d + 1).outcome, 'spare');
for (let v = 0; v < 10; v += .05) { const s = arena.scene(10 + d + .2 + v); for (const f of s.F) assert.ok(Number.isFinite(f.x) && Math.abs(f.x) <= 400); }
// Dice rules over many seeds: 2d6 each, the higher total attacks, a tie clashes, the bout ends within the turn cap.
for (let seed = 1; seed <= 400; seed++) {
  const p = arena.choreograph(seed), hp = [100, 100];
  assert.ok(p.turns.length >= 1 && p.turns.length <= arena.MAX_TURNS, 'turn cap');
  assert.ok(p.duration > 15 && p.duration < 65, 'duration ' + p.duration);
  for (const tr of p.turns) {
    assert.equal(tr.dice.length, 2); for (const dd of tr.dice) { assert.equal(dd.length, 2); for (const x of dd) assert.ok(Number.isInteger(x) && x >= 1 && x <= 6, 'die ' + x); }
    assert.deepEqual(tr.totals, tr.dice.map(dd => dd[0] + dd[1]));
    if (tr.totals[0] === tr.totals[1]) { assert.equal(tr.by, -1); assert.equal(tr.dmg, 0); }
    else { assert.equal(tr.by, tr.totals[0] > tr.totals[1] ? 0 : 1, 'the higher total attacks'); assert.ok(tr.dmg > 0); assert.equal(tr.sig, tr.dice[tr.by][0] === tr.dice[tr.by][1], 'doubles = signature'); hp[1 - tr.by] -= tr.dmg; }
    assert.deepEqual(tr.hp, hp);
  }
  assert.equal(hp[p.loser], 0, 'the loser ends at 0'); assert.ok(hp[p.winner] > 0);
  assert.ok(p.turns.slice(0, -1).every(tr => !tr.final), 'only the last turn knocks down');
}
// Every seed keeps its fighters on the floor.
for (let seed = 1; seed <= 80; seed++) { arena.start(5000 * seed, seed); const dd = arena.snapshot(5000 * seed).duration; for (let t = 0; t < dd; t += 1 / 12) for (const f of arena.scene(5000 * seed + t).F) assert.ok(Number.isFinite(f.x) && Math.abs(f.x) <= 160 && f.y <= 0, 'seed ' + seed + ' x ' + f.x); arena.snapshot(5000 * seed + dd + 1); arena.vote('spare', 5000 * seed + dd + 1); }
assert.deepEqual(arena.choreograph(42), arena.choreograph(42), 'same seed, same bout');
assert.notDeepEqual(arena.choreograph(42).turns.map(t => t.dice), arena.choreograph(43).turns.map(t => t.dice));
// Next bout: a given seed replays exactly; winners come from the dice.
assert.equal(arena.start(100, 3), true);
assert.deepEqual(arena.snapshot(100).hp, [100, 100]);
assert.equal(arena.snapshot(100).outcome, null);
assert.deepEqual(arena.snapshot(100).plan, arena.choreograph(3));
const d2 = arena.snapshot(100).duration, e2 = arena.snapshot(100 + d2 + .1);
assert.equal(e2.winner, arena.choreograph(3).winner);
assert.equal(arena.vote('kill', 100 + d2 + .1), true);
assert.equal(arena.snapshot(100 + d2 + 1).outcome, 'kill');
for (let v = 0; v < 10; v += .05) { const s = arena.scene(100 + d2 + .1 + v); for (const f of s.F) assert.ok(Number.isFinite(f.x) && Number.isFinite(f.y)); }
// Speed: switching to 2× keeps fight time continuous, then runs twice as fast; a frozen clock still pauses.
assert.equal(arena.start(1000, 5), true);
const a = arena.snapshot(1004).fightTime; arena.setSpeed(2, 1004);
assert.ok(Math.abs(arena.snapshot(1004).fightTime - a) < 1e-9, 'no jump on speed change');
assert.ok(Math.abs(arena.snapshot(1005).fightTime - (a + 2)) < 1e-9, '2x speed');
assert.deepEqual(arena.snapshot(1005), arena.snapshot(1005), 'frozen clock at 2x');
const hpA = arena.snapshot(1005).hp; arena.setSpeed(1, 1005);
assert.deepEqual(arena.snapshot(1005).hp, hpA, 'hp does not jump back');
assert.ok(Math.abs(arena.snapshot(1006).fightTime - (a + 3)) < 1e-9, 'back to 1x');
// The aftermath also runs at 2×.
const d3 = arena.snapshot(1006).duration, tEnd = 1006 + (d3 - (a + 3)) + .01;
assert.equal(arena.snapshot(tEnd).phase, 'verdict'); arena.vote('kill', tEnd); arena.setSpeed(2, tEnd);
assert.ok(Math.abs(arena.snapshot(tEnd + 1).sinceVote - 2) < 1e-9, 'aftermath at 2x');
arena.setSpeed(1, tEnd + 1);
console.log('Arena lifecycle, dice rules over 400 seeds, seeded replay, speed re-anchoring, both verdicts, duplicate votes and frozen clock passed.');
