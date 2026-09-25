# Brownie · The Village Atlas (v2)

A rebuilt pixel-art version of `../village-prototype`. Same idea — two mirrored villages, sixteen agent
districts, civic grounds, working lands and a Colosseum — with larger, denser districts, redesigned agents
and a choreographed arena fight.

## Run

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory claude-village-prototype
```

Open http://127.0.0.1:8765. No build, packages, downloads or external fonts.

Hosted on GitHub Pages: https://solardetech.github.io/brownie-village/ (deployed by
`.github/workflows/pages.yml` on every push to `main`).

## What changed from the prototype

- **Pixel-art renderer.** World units are art pixels. Shapes are filled with whole-pixel spans (no
  anti-aliased edges). Zoomed in, each frame renders into a small pixel buffer that is scaled up; zoomed
  out, it draws straight to the screen. Terrain and static district art are baked once.
- **Larger districts.** Each district is 380 × 290 art px (castle 410 × 320), shown at about 2× on a
  typical screen, with 3–5 structures and many props each.
- **New agents.** Eight lead sprites with outlines, 3-tone shading and role-specific work loops
  (stamping letters, flipping coins, writing, photographing, star-gazing, painting, hammering, signalling).
- **Obvious states.** Every lead shows a bubble and a ground ring: spinning gear (working), cycling dots
  (idle), bouncing amber `?` with a pulsing ring (needs approval), shaking red `!` with sweat drops (error),
  floating Z's while seated asleep (offline). The district's flag, equipment and crew change with it,
  an offline district dims, and labels and the minimap carry the same colour and icon.
- **Colosseum.** A seeded fight script per bout: entrance, salute, circling, lunges, three-hit combos,
  leaps, shield bashes, blocks with sparks, parries, dodges, hit-stop freeze frames, knockback, damage
  numbers, screen shake, a slow finisher with K.O. The modal camera follows the fighters.
- **Verdicts.** *Spare*: the emperor's thumb turns up, the crowd waves green, the winner helps the loser
  up, both bow under falling petals, and the spared fighter limps out waving. *Kill*: the thumb turns down,
  the arena darkens, the winner raises the blade, a white flash, the helmet rolls away and a small ghost
  floats up over the stands. No gore.

## Additions (round 2)

- **Avatars.** GKTC's avatar (black hair, beard, sunglasses) stands at GKTC's castle; Daghan's princess at
  Daghan's. Drag either one anywhere. In an agent district the lead walks over, walks alongside and talks
  (state-aware lines in speech bubbles). Positions are remembered in this browser.
- **Castle.** Larger plot (524 × 434 art px), ten towers, barracks, and a central plaza with an equestrian
  Atatürk statue in bronze on a marble pedestal (`zones/ataturk.js`, sculpted with `engine/sculpt.js`).
- **Districts.** Köle: an overseer cracking a whip over a stone haul (cartoon, never lands). Bayes: a garage
  lab, saucer car and swirling green portal. Sekreter: a butler serving tea. Girard: a neon marketing
  agency. Kandinsky: a Roman sculpture court. The inbox is now a PTT-style post office and court: GGI
  (GKTC Gelenler ve İzinler) and DGI (Daghan Gelenler ve İzinler). SCUM Master is now the Stationmaster's
  Sprint Junction (replaced in round 3).

## Additions (round 3)

- **Avatars.** GKTC's avatar is now the Megazord from Regular Show and Daghan's is Gojo (fan-art style).
- **Colosseum.** The fighters are the founders (GKTC: wings, claws, palm lasers; Daghan: hammer, jetpack,
  chest beam). Turn-based: each turn both roll 2d6, the higher total attacks, a tie clashes, doubles fire a
  signature move. A 2× speed toggle, a finisher per fighter on *Finish them!*, and the winner mocks the loser.
- **Districts.** SCUM Master is now the Head Chef's Sprint Kitchen, a strict fine-dining kitchen with fusion
  plates, a ticket rail (TODO → DOING → REVIEW → DONE) and an EVERY SECOND COUNTS clock sign. The Grand
  Library is a larger Seljuk turquoise-tile complex fused with a Greek library. Bayes adds Rick turning Morty
  into monsters and healing him with a thrown flask.
- **Energy.** A 180 px forest margin around the map, nine solar fields in forest clearings with faint cable
  pulses to the river, and a datacenter on a river island joined to both banks by stone suspension bridges,
  powered by turbines in the river (`energy.js`).

## Additions (round 4)

- **Honeycomb villages.** Each village is a Civilization-style honeycomb: every district is one hex tile
  of the same size, with cobbled lanes lined by trees, lamps and bushes between neighbouring tiles. A pond park and an orchard fill the riverside
  column, a stone kerb runs around each village, Köle crews walk the lanes to the worksites, and
  a woodland track leads to the Colosseum. Zone art is clipped to its tile (`VillageWorld.hexOf`, see
  `zones/DESIGN-CONTRACT.md`).
- **Bigger figures.** Agent leads are drawn 1.5× (rendered at 3× and filtered down); the founder avatars and
  the Atatürk statue are re-sculpted at 1.5× resolution (`Pixel.sculptScaled` in `engine/sculpt.js`).
- **Sekreter.** The lead is an Alfred-like butler; a young footman serves the tea.
- **Gazeteci.** Satellite dishes, a live van, broadcast cameras, a camera crane, a drone and full bookshelves.

## Files

| File | Purpose |
| --- | --- |
| `engine/pixel.js` | Palette, whole-pixel primitives, dithering, 3×5 font, outlined sprite cache |
| `engine/props.js` | Trees, buildings, furniture, water, fences and small animated helpers |
| `engine/sculpt.js` | Sculpted sprites: per-part rounded shading, contact shadows, detail on a tone buffer |
| `avatars.js` | The two draggable avatars, lead escorts and speech bubbles |
| `characters.js` | Lead agents, crew/citizen sprites, state bubbles and rings, portraits |
| `zones/*.js` | One module per district (`paint`, optional `front`, `animate`) — see `zones/DESIGN-CONTRACT.md` |
| `colosseum.js` | Arena state and fight choreography (deterministic; the caller owns time) |
| `zones/colosseum.js` | Arena art, the founders' fighters, dice, crowd, effects and the close-up camera |
| `energy.js` | Solar fields, cable pulses, the river datacenter and its suspension bridges |
| `world.js` | Layout, terrain bake, render pipeline, hit testing, minimap |
| `app.js` | Camera, input, labels, drawers, modals, arena UI |
| `destination.html/.js` | Tasks/Workflows/Runs and Documents/KPIs pages (copied from the prototype) |
| `zone-preview.html` | One district in all five states: `?zone=<name>&t=2.5` |
| `arena-test.html` | Arena frames: `?t=9`, `?verdict=spare&v=3`, `&map=1`, `&seed=`, `&speed=2`, `?sheet=0\|1` |
| `sheet.html` | Character sheet: `?role=<name>` |
| `figures-test.html` | The statue and every avatar frame: `?scale=4` |
| `checks/arena.cjs` | `node claude-village-prototype/checks/arena.cjs` |

Screenshot hooks on the atlas: `index.html?open=<zone id>` (e.g. `gktc-sekreter`, `commons-colosseum`),
with `&state=<state>`, `&focus=1`, `&fight=<s>`, `&vote=spare|kill&after=<s>`. `index.html?avatar=gktc-owner,gktc-sekreter,9&cam=950,800,3&t=20` places an avatar mid-conversation. `index.html?bench` writes
frame timings to the page title.

## Limits

All data is local sample data; no agents or services are connected. Arena state resets on reload.

## Additions (round 5)

- **HQ.** The castle is now the HQ, three tiles wide in the middle of each honeycomb (`zones/hq.js`): a
  Dolmabahçe-style palace, the Atatürk statue at the corner where the three tiles meet, and an operations campus
  with people at PCs, a VR pad, a drone port, a robotics yard and a solar field. Bayes and the Head Chef moved to
  the riverside column (the pond park and orchard were removed), and Köle still borders the lumberyard, mine and farm.
- **Hell camp.** Köle and its three worksites are a Mordor / Diablo / Dark Souls / Doom slave camp: orcs, goblins,
  hollows, imps, zombies and a cave troll work under Uruk-hai, Nazgûl, demon, Hell Knight and Cacodemon overseers
  who crack whips and throw fireballs (cartoon, no gore). Creature crews are `z.crew(x, y, { kind })` in
  `characters.js`; the Köle lead is a dark overlord.
- **Text Writer.** An editorial newsroom with typewriter cubicles, an editor-in-chief's glass office, a copy desk
  and a proof press.
- **Head Chef.** The kitchen clock shows the viewer's local time (HH:MM).
