/* The equestrian Atatürk statue for the castle plaza, after the portrait of Atatürk on horseback.
   Bronze on a stepped marble pedestal. The bronze is sculpted part by part with Pixel.sculpt (rounded,
   lit from the top left, quantised to a bronze ramp); hand-placed details (bridle, reins, mane, uniform,
   kalpak) go on top. Authored on a 136×102 grid and sculpted at 1.5× that resolution. Rendered once and cached. */

window.AtaturkStatue = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  const SW = 136, SH = 102, K = 1.5;              // art grid; hooves stand on y = 96, centre x = 66. K: sculpt scale
  const RAMP = ['#130c08', '#22160e', '#322115', '#462f1c', '#5d4024', '#78542d', '#976c39', '#bb8d4c', '#e2b86e'];
  let sprite = null;

  /* ---------- the sculpt (see engine/sculpt.js) ---------- */
  function sculpt() {
    return P.sculptScaled(K, SW, SH, [RAMP], api => {
    const { part, set, dk, lt, ln, force } = api, shapeFill = api.shapes.spline, limbFill = api.shapes.limb, polyFill = api.shapes.poly;
    /* Far side (darker, behind the body). */
    part(limbFill([[98, 51, 6], [95, 62, 4.6], [104, 73, 2.9], [104, 85, 2.1], [103, 89, 2.4], [101, 92, 2.6]]), { cap: 3, tone: -.2 });            // far hind, lifting
    part(limbFill([[51, 55, 4.6], [50, 69, 3.1], [49, 74, 2.6], [50, 88, 2.1], [50, 91, 2.5], [49, 94.5, 2.8]]), { cap: 3, tone: -.2 });         // far fore, planted
    part(limbFill([[105, 42, 3], [112, 48, 4.5], [116, 60, 5.2], [118, 72, 4.6], [119, 82, 3.4], [121, 88, 2]]), { cap: 4, tone: -.05 });      // tail
    part(shapeFill([[38, 50], [41, 41], [54, 33], [68, 37], [89, 33], [103, 39], [107, 50], [102, 60], [86, 63], [60, 63], [45, 61]]), { cap: 9, grad: .1 }); // body
    part(shapeFill([[38, 51], [32, 38], [28, 27], [30, 15], [38, 15], [47, 22], [56, 33], [53, 45]]), { cap: 7 });                           // neck
    part(shapeFill([[31, 11], [26, 13], [22, 20], [19, 29], [18, 35], [21, 38.5], [25, 34], [30, 27], [33, 20]]), { cap: 4, grad: .05 });    // head
    part(polyFill([[29, 12], [28.5, 5.5], [32.5, 10.5]]), { cap: 1.5 });                                                                     // near ear
    part(polyFill([[32.5, 11], [34, 5], [36, 12]]), { cap: 1.5, tone: -.1 });                                                                // far ear
    part(shapeFill([[59, 38], [70, 36.5], [82, 38], [83, 49], [80, 57], [64, 58], [58, 50]]), { cap: 3, tone: .03 });                        // saddle cloth
    part(limbFill([[88, 53, 7.2], [90, 65, 4.2], [96, 75, 3], [92, 87, 2.2], [90, 91, 2.6], [88, 95, 2.9]]), { cap: 3.4 });                  // near hind, reaching under
    part(limbFill([[45, 53, 5.2], [35, 67, 3.3], [37, 76, 2.3], [40, 80, 2.5], [38.5, 84, 2.8]]), { cap: 3.2 });                              // near fore, raised
    part(limbFill([[31, 13, 2.2], [36, 14.5, 2.7], [43, 19.5, 2.9], [50, 26.5, 2.6], [55, 32, 2]]), { cap: 2.2, tone: .04 });              // mane ridge
    part(shapeFill([[57, 19], [65, 17.5], [73, 19], [74.5, 28], [73.5, 36], [76, 44], [70, 46.5], [61, 46.5], [55, 44], [57, 36], [56, 28]]), { cap: 4.5, grad: .1 }); // rider's torso and coat, facing us
    part(limbFill([[71, 41, 4.2], [72, 49, 3.5]]), { cap: 2.6 });                                                                            // thigh
    part(limbFill([[72, 49, 3.3], [72.5, 60, 2.8], [69, 63, 2.2]]), { cap: 2.2, tone: -.02 });                                               // tall boot
    part(limbFill([[65, 17.5, 2.3], [65, 14.5, 2.2]]), { cap: 1.5 });                                                                        // neck
    part(shapeFill([[61.5, 7.5], [68.5, 7.5], [69.3, 11.5], [68, 15], [65, 16.8], [62, 15], [60.7, 11.5]]), { cap: 2.6, grad: .1 });          // head
    part(polyFill([[61, 8.5], [60, .8], [70, .8], [69, 8.5]]), { cap: 2.2, tone: -.05 });                                                   // kalpak
    part(limbFill([[72.5, 20, 2.9], [75.5, 29.5, 2.4], [74, 37, 2.1]]), { cap: 2 });                                                         // arm on the sabre hilt
    part(limbFill([[57.5, 20, 2.9], [55.5, 29, 2.4], [59, 34, 2.1]]), { cap: 2 });                                                           // arm holding the reins

    /* ---------- hand-placed detail ---------- */
    // Horse head: eye, nostril, mouth, bridle, bit.
    set(25, 19, 0); set(26, 19, 1); set(24, 18, 7);
    set(19, 32, 1); set(20, 33, 1); ln([[19, 37], [22, 37]], (x, y) => dk(x, y, 3));
    ln([[31, 13], [27, 22], [23, 31], [21, 35]], (x, y) => dk(x, y, 2));           // cheek strap
    ln([[26, 14], [31, 13]], (x, y) => dk(x, y, 2)); ln([[19, 30], [25, 31]], (x, y) => dk(x, y, 2)); // browband, noseband
    ln([[26, 13], [30, 12]], (x, y) => lt(x, y, 1)); force(21, 36, 7); force(22, 36, 5);
    // Reins run from the rider's hand to the bit.
    ln([[58, 34.5], [50, 37], [40, 38.5], [30, 37.5], [22, 36]], (x, y) => force(x, y, 1));
    ln([[50, 38], [40, 39.5]], (x, y) => dk(x, y, 1));
    // Mane: grooves across the ridge, with a lit crest.
    for (let i = 0; i < 10; i++) { const f = i / 9, x = 32 + f * 22, y = 13.5 + f * 18 + Math.sin(f * 3) * 1.5; ln([[x - 1, y - 1.5], [x + 1.5, y + 2]], (a, b) => dk(a, b, 2)); lt(x - 1.5, y - 2, 1); }
    ln([[30, 12], [30, 15], [28, 17]], (x, y) => dk(x, y, 2));                        // forelock
    // Tail strands.
    for (let i = 0; i < 5; i++) ln([[107 + i * 1.5, 45 + i], [113 + i * 1.6, 62 + i * 2], [116 + i * .8, 84 - i * 2]], (x, y) => dk(x, y, i % 2 ? 2 : 1));
    // Muscles: shoulder, forearm, ribs, hip and gaskin lines.
    ln([[53, 36], [49, 46], [46, 56]], (x, y) => dk(x, y, 1)); ln([[42, 44], [40, 52]], (x, y) => lt(x, y, 1));
    ln([[86, 38], [95, 43], [98, 51]], (x, y) => dk(x, y, 1)); ln([[84, 60], [90, 55]], (x, y) => dk(x, y, 1));
    for (const x of [64, 70, 76]) ln([[x, 54], [x + 1, 59]], (a, b) => dk(a, b, 1));
    // Hooves: darker horn with a lit rim.
    for (const [x, y] of [[49, 94.5], [88, 95], [101, 92], [38.5, 84]]) { for (let dx = -2; dx <= 2; dx++) dk(x + dx, y + 1, 2); lt(x - 2, y, 1); }
    // Saddle cloth border (the embroidered edge in the painting) and girth.
    ln([[59.5, 50], [64, 57], [80, 56.5], [82.5, 49], [81.5, 39]], (x, y) => lt(x, y, 2));
    ln([[60.5, 49], [65, 55.5], [79, 55]], (x, y) => dk(x, y, 1));
    ln([[74, 57], [72, 62]], (x, y) => dk(x, y, 2));
    // Stirrup, spur and tall boot shine.
    ln([[67, 64], [71, 64]], (x, y) => force(x, y, 6)); force(67, 65, 3); force(71, 65, 3); force(74, 61, 7);
    ln([[70.5, 50], [71, 59]], (x, y) => lt(x, y, 2));
    // Uniform: stand collar with tabs, cross strap, belt and buckle, buttons, breast pockets, a medal.
    ln([[62, 18], [68, 18]], (x, y) => dk(x, y, 1)); for (const x of [62, 63, 67, 68]) set(x, 18.5, 7);
    ln([[72, 19.5], [58, 33]], (x, y) => dk(x, y, 2)); ln([[71, 19], [57.5, 32]], (x, y) => lt(x, y, 1));
    ln([[57, 34.5], [73, 34.5]], (x, y) => dk(x, y, 3)); set(65, 34.5, 8); set(66, 34.5, 7);
    for (const y of [22, 25.5, 29, 32]) set(65, y, 7);
    for (const x of [61, 69]) { ln([[x - 1.5, 23], [x + 1.5, 23]], (a, b) => dk(a, b, 1)); ln([[x - 1.5, 26], [x + 1.5, 26]], (a, b) => dk(a, b, 1)); set(x, 24.5, 6); }
    set(61, 21, 8); set(61, 21.9, 6);
    ln([[56, 44], [61, 46], [70, 46], [75.5, 44]], (x, y) => lt(x, y, 1)); ln([[65, 38], [65, 46]], (x, y) => dk(x, y, 2));
    // Face: brows, eyes, straight nose, moustache, a shaded jaw.
    ln([[62.3, 10], [64, 10]], (x, y) => dk(x, y, 2)); ln([[66, 10], [67.7, 10]], (x, y) => dk(x, y, 2));
    set(63.5, 11, 1); set(66.5, 11, 1); lt(65, 11.8, 1); lt(65, 12.8, 1); dk(65.5, 13.8, 1);
    ln([[63.5, 14.5], [66.5, 14.5]], (x, y) => dk(x, y, 3)); dk(68, 12, 1); dk(68, 13, 1); dk(67, 15, 1);
    // Kalpak: curly fur texture with a lit crown.
    for (let y = 2; y < 8; y++) for (let x = 60; x < 70; x++) if (P.hash(x * 3, y * 7) < .34) dk(x, y, 2); else if (P.hash(x, y) < .12) lt(x, y, 2);
    ln([[61, 1], [69, 1]], (x, y) => lt(x, y, 2)); ln([[61, 8], [69, 8]], (x, y) => dk(x, y, 2));
    // Sabre: the scabbard hangs from the far hand past the boot, lit along its upper edge.
    ln([[75, 39], [80, 51], [86, 64]], (x, y) => force(x, y, 2)); ln([[74, 39], [79, 51], [85, 64]], (x, y) => force(x, y, 6));
    force(86, 65, 7); ln([[73, 36], [76, 34.5]], (x, y) => force(x, y, 7)); force(74, 37.5, 8);
    // Tassel from the saddle.
    ln([[73, 44], [73, 50]], (x, y) => dk(x, y, 2)); set(73, 51, 6); set(72, 51, 5); set(74, 51, 5);
    // Speculars: the rump, neck crest and the rider's shoulder catch the light.
    for (const [x, y] of [[88, 36], [89, 36], [91, 37], [40, 18], [41, 19], [58, 20], [44, 42], [32, 24], [62, 9]]) lt(x, y, 2);

    });
  }

  /* ---------- pedestal ---------- */
  const M = ['#6f6a64', '#938d84', '#b8b1a4', '#d6cfbf', '#ece6d6', '#fbf7ec'];
  function block(k, x, y, w, front, top, tone = 0) {
    // A marble block: lit top face, front face with a soft vertical gradient, dark right edge.
    const t = i => M[Math.max(0, Math.min(M.length - 1, i + tone))];
    k.rect(x, y - front - top, w, top, t(4)); k.rect(x, y - front - top, w, 1, t(5)); k.dither(x + 1, y - front - top + 1, w - 2, top - 1, t(3), 1);
    k.rect(x, y - front, w, front, t(3)); k.rect(x, y - front, w, 1, t(5)); k.rect(x, y - 1, w, 1, t(1));
    k.dither(x, y - Math.ceil(front / 2), w, Math.ceil(front / 2) - 1, t(2), 1);
    k.rect(x, y - front - top, 1, front + top, t(5)); k.rect(x + w - 2, y - front - top, 2, front + top, t(1)); k.rect(x + w - 1, y - front - top, 1, front + top, t(0));
    // A few veins.
    for (let i = 0; i < w / 14; i++) { const vx = x + 3 + P.hash(i, w) * (w - 8), vy = y - front + 1 + P.hash(w, i) * (front - 2); k.px(vx, vy, t(2)); k.px(vx + 1, vy + 1, t(2)); k.px(vx + 2, vy + 1, t(1)); }
  }
  function pedestal(k, x, y) {
    // Stepped base, the die with a bronze plaque, and a moulded cornice (all 1.5× the original design). Top surface at y - 104.
    block(k, x - 83, y, 165, 9, 6);
    block(k, x - 72, y - 14, 144, 9, 6);
    block(k, x - 57, y - 28, 114, 51, 0, -1);                        // the die
    // Recessed panel and plaque.
    const py = y - 76; k.rect(x - 48, py, 96, 42, M[1]); k.rect(x - 47, py + 1, 94, 40, M[2]); k.rect(x - 47, py + 1, 94, 1, M[0]); k.rect(x - 47, py + 1, 1, 40, M[0]); k.rect(x + 46, py + 1, 1, 40, M[4]); k.rect(x - 47, py + 40, 94, 1, M[4]);
    k.rect(x - 39, py + 5, 78, 31, '#2c1c10'); k.rect(x - 38, py + 6, 76, 29, '#6b4a24'); k.rect(x - 38, py + 6, 76, 1, '#b5864a'); k.rect(x - 38, py + 6, 1, 29, '#976b36'); k.rect(x + 37, py + 6, 1, 29, '#3a2616'); k.rect(x - 38, py + 34, 76, 1, '#3a2616');
    for (const [dx, dy] of [[-35, 9], [34, 9], [-35, 31], [34, 31]]) { k.px(x + dx, py + dy, '#d3a764'); k.px(x + dx + 1, py + dy + 1, '#8a6232'); }
    // ATATÜRK in raised gold letters at double size; the umlaut is drawn by hand.
    const name = 'ATATURK', tw = P.textWidth(name, 2), tx = x - Math.floor(tw / 2), ny = py + 11;
    k.text(name, tx + 1, ny + 1, '#2a1a0e', 2); k.text(name, tx, ny, '#f0d08a', 2);
    for (const ux of [32, 36]) { k.rect(tx + ux + 1, ny - 2, 2, 2, '#2a1a0e'); k.rect(tx + ux, ny - 3, 2, 2, '#f0d08a'); }
    // "1881-193" then the last 8 lying sideways like an infinity sign (7×5 glyph, full letter height).
    const dates = '1881-193', dx0 = x - Math.floor((P.textWidth(dates) + 8) / 2), ix = dx0 + P.textWidth(dates) + 1; k.text(dates, dx0, py + 25, '#c9a060');
    ['.#...#.', '#.#.#.#', '#..#..#', '#.#.#.#', '.#...#.'].forEach((row, ay) => [...row].forEach((ch, ax) => ch === '#' && k.px(ix + ax, py + 25 + ay, '#c9a060')));
    // Laurel relief on the die, either side of the panel.
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const lx = x + s * 52, ly = y - 71 + i * 7; k.px(lx, ly, M[1]); k.px(lx - s, ly + 1, M[4]); k.px(lx + s, ly + 2, M[1]); k.px(lx, ly + 3, M[1]); k.px(lx - s, ly + 4, M[4]); }
    // Cornice: a projecting slab with a shadowed underside and a lit top on which the horse stands.
    k.rect(x - 63, y - 82, 126, 3, M[0]);
    block(k, x - 66, y - 82, 132, 8, 0);
    block(k, x - 60, y - 90, 120, 4, 10);
  }

  return {
    // (x, y) = centre of the pedestal's front edge on the ground. Art spans x -100..126, y -244..10.
    draw(k, x, y) {
      if (!sprite) sprite = sculpt();
      // Cast shadow to the bottom right.
      k.alpha(.28, () => { k.poly([[x + 82, y - 3], [x + 120, y - 21], [x + 126, y - 6], [x + 90, y + 10]], '#1d2a22'); k.ellipse(x + 12, y + 4, 90, 7, '#1d2a22'); });
      pedestal(k, x, y);
      // Hooves on the top surface (y - 104 is its back edge; stand a little forward of it).
      k.c.drawImage(sprite, Math.round(x - 66 * K - 1), Math.round(y - 99 - 96 * K - 1));
    },
    sprite: () => sprite || (sprite = sculpt())
  };
})();
