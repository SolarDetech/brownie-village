# Zone design contract (v2)

Each module registers one design in `window.ZoneDesigns`. The reference is `zones/sekreter.js`: match its level of detail and style.

```js
window.ZoneDesigns = window.ZoneDesigns || {};
window.ZoneDesigns['gazeteci'] = (() => {
  const P = window.Pixel, C = P.C, S = P.shade;
  return {
    paint(k, z) {},              // static art, drawn ONCE into the terrain cache (z.village: 'gktc' | 'daghan')
    front(k, z) {},                 // optional static foreground, drawn over actors each frame (cached)
    animate(k, t, state, z) {}   // every frame (24 fps); t = seconds (frozen when paused)
  };
})();
```

Set `perVillage: true` on the design when `front()` differs per village (it is then cached per zone).

## Coordinates and footprint

- Units are **art pixels**. Origin is the zone centre. y grows downward. Integers only.
- Every plot is one tile of a **Civilization-style honeycomb**: a flat-top hexagon with short top and bottom edges and side points at mid-height. All district tiles have the same size. A 44 px lane runs along every shared edge between neighbouring tiles: a cobbled road with avenue trees, lamps and bushes on its lower verge. Vertices (zone-local, clockwise from top-left), from `VillageWorld.hexOf(role)`: (−144,−160) (144,−160) (206,−5) (144,150) (−144,150) (−206,−5). The half-width at height y is 206 − 0.4·|y + 5|. The Colosseum is not a tile: it keeps its ellipse (rx 300, ry 225) in the western woods.
- Keep all art inside the hexagon. Static art (`paint`, `front`) is **clipped to the hexagon**, so anything past the edge is cut off. Trees and bushes (`Props.tree`, `Props.bush`) that would cross the edge are left out. Buildings must sit fully inside the edge. Near the four corners, check the half-width at each building's top and bottom.
- `animate` is not clipped, so smoke, birds and sparks can rise past the edge. Keep crew and moving objects inside it.
- The world draws the tile's lawn inside a stone kerb under the zone, and the lanes around it. Avenue trees on the lane above your top edge can overlap your top few pixels slightly. Keep a walkable gate at the **bottom centre (0, 140)**; Köle crews leave Köle's tile there. The state flag stands just inside the bottom-left corner, at (−132, 142).
- Camera: 3/4 top-down view (like Stardew Valley). Light comes from the **top left**; shadows fall to the bottom right (`C.shadow`).
- Things lower on screen are "in front". Place actors in open ground (plazas, yards) so buildings never need to be drawn over them. Use `front(k)` for the few things that must overlap actors.

## Visual style

- True-colour pixel art, crisp integer rectangles. Use palette colours from `Pixel.C` and `Pixel.shade(color, ±f)` for tints. Each material gets 3–4 tones: highlight (top/left), base, shade (right/bottom), dark outline.
- No big flat areas. Texture the ground (cobbles, planks, tiles, soil rows, grass tufts), add clutter that tells the story (crates, sacks, tools, papers, pots, lamps, benches, flower beds, hedges, trees).
- Each district is a small, dense, lived-in place with **3–5 distinct structures/areas** and many props.
- A small 3×5 pixel font exists (`k.text`) for shop signs. Keep text short (≤ 6 letters) and optional.

## animate(k, t, state, z)

`state` is one of `working | idle | waiting | error | off`. Make each state obvious **from the environment**, not only from the lead:

| state | environment |
|---|---|
| working | machines move, particles, crew busy, deliveries in motion, smoke from chimneys |
| idle | calm: machines stopped, crew resting/sitting, ambient life only (birds, butterflies) |
| waiting | work paused **waiting for approval**: a queue/pile of items on hold, an amber lamp/flag, crew standing and waiting |
| error | something broke: sparks, grey/black smoke puffs, scattered items, blinking red lamp, jammed machine |
| off | everything still, lamps dark (the world also dims the static art), lead asleep |

- `z.lead(x, y, opts)` draws the district's large lead agent **with its state bubble and ground ring**. Call it **exactly once per frame** in agent districts. Service and resource zones have no lead: don't call it. Position the lead near the main activity in open ground; in `off` state move them to a rest spot (they sit on a stool automatically). `opts.facing = -1` faces left. `opts.pose = 'walk'` shows a walk cycle (only while you are moving them).
- `z.crew(x, y, opts)` draws a small worker/citizen (≈ 20 px tall). opts: `look` 0–5 (outfit), `hat` (`none cap straw helmet hood bandana scarf`), `hatColor`, `anim` (`walk work idle sit sleep cheer`), `carry` (`wood ore food mail paper box water`), `tool` (`axe pick hoe hammer saw watering broom pen`), `facing` (±1), `phase` (offset per worker), `state` (defaults to the zone state: off → sleeps, error → shakes with a red mark, waiting → amber mark).
- `z.detail` is false when zoomed far out: skip tiny ambient effects then.
- Use deterministic time math only (`Math.sin(t…)`, `(t * speed) % 1`). **Never `Math.random`.**
- Budget: keep `animate` light (a few hundred fill calls). No `polyTex`/`rectTex` in animate. For complex moving objects, cache frames with `Pixel.sprite(key, w, h, ox, oy, drawFn)` and blit them with `k.blit(sprite, x, y, flip)`.
- Always balance `ctx.save/restore`; prefer `k.at(x, y, fn)` and `k.alpha(a, fn)`.

## Kit `k` (all integer, crisp)

`rect(x,y,w,h,c)`, `px(x,y,c)`, `line(x0,y0,x1,y1,c,thick)`, `path(points,c,thick)`, `ellipse(cx,cy,rx,ry,c)`, `circle(cx,cy,r,c)`, `ring(cx,cy,rx,ry,c)`,
`poly(points,c)`, `polyTex(points,(x,y)=>color|null)` (static only), `rectTex(x,y,w,h,fn)` (static only), `dither(x,y,w,h,c,kind)`, `ditherPoly`, `ditherEllipse`,
`shadow(cx,cy,rx,ry)`, `text(str,x,y,c,scale)`, `textCenter`, `textBold(str,x,y,c,outline,scale,center)`, `blit(sprite,x,y,flip,alpha)`, `at(x,y,fn)`, `alpha(a,fn)`, `k.c` = raw 2D context.

## Props (`window.Props`, first argument is always `k`)

- Vegetation: `tree(k,x,y,kind,size,variant)` kinds `oak pine birch fruit orange autumn blossom dark`, size 0–3, feet at x,y; `bush(k,x,y,variant)`; `flower(k,x,y,c)`; `tuft(k,x,y)`; `flowerBed(k,x,y,w,h,colors,seed)`; `hedge(k,x,y,w,h)`; `rock(k,x,y,size,seed)`.
- Ground: `cobbles(k,x,y,w,h,seed,base)`, `planks(k,x,y,w,h,base)`, `tiles(k,x,y,w,h,a,b,size)`, `pond(k,x,y,rx,ry)`.
- Architecture: `building(k,x,y,opts)` — (x,y) is the **bottom-left of the front wall on the ground**. opts: `w,h` (wall), `roofH`, `style` (`gable peak flat cone dome`), `roof` colour, `wall` colour, `mat` (`plaster brick stone planks timber`), `windows:[{x,y,w,h,lit,shutters,arch,box}]` (x from wall left, y from wall top), `door:{x,w,h,color,arch,open}`, `chimney:{x,h}`, `sign:{x,y,text,color}`, `shutters`, `crenel` (flat), `depth` (peak), `foundation`. Returns `{top, roofTop}`. Also `tower(k,x,y,opts)`, `window`, `door`, `hangingSign`, `awning(k,x,y,w,colA,colB,depth)`, `stall(k,x,y,w,col,goodsColors)`.
- Objects: `fence(k,x,y,len,vertical)`, `stoneWall(k,x,y,w,h)`, `crate(k,x,y,size)`, `barrel`, `sack(k,x,y,c)`, `pot(k,x,y,plant)`, `lamp(k,x,y,lit)`, `bench(k,x,y,w)`, `table(k,x,y,w,h,top)`, `sign(k,x,y,text,c)`, `well`, `cart(k,x,y,loadFn)`, `logPile`, `statue`, `banner(k,x,y,c,t)`.
- Animated helpers: `smoke(k,x,y,t,n,c)`, `sparkle(k,x,y,t,c)`, `bird`, `butterfly`, `fire(k,x,y,t,scale)`, `windowGlow`.

## Palette (`Pixel.C`)

Greens `grass0–5`, `leaf0–5`; earth `dirt0–5`; `stone0–5`; `wood0–5`; `plaster0–3`; roofs `terra0–4`, `teal0–4`, `slate0–4`, `plum0–4`; `water0–5`, `foam`; `gold0–4`; `red0–3`; `skin0–4`; `paper`, `paper2`, `white`, `glass`, `glassLit`, `glassDark`, `ink`; state colours `working idle waiting error off`.

## Preview

`http://127.0.0.1:8002/zone-preview.html?zone=<name>` shows all five states side by side, animated. Add `&t=2.5` to freeze time (for screenshots), `&state=working&scale=3` for one big view. The page title reports `leads=<n> errors=<n>`.

Headless screenshot:

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=2200,760 \
  --screenshot=/path/out.png "http://127.0.0.1:8002/zone-preview.html?zone=<name>&t=2.5"
```
