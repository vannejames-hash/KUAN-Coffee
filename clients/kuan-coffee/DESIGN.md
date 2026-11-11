# Kuan Coffee: design system (V6, as built)

Kit: `kits/quiet-form/` (selected by `theme.kit`). Client config: `clients/kuan-coffee/`.

## The mark as a system

The logo's four letters are four shapes, traced in `brand.js` (a demo trace; the shop's vector replaces it). `poly` holds the same outlines as points for the 3D hero.

| Letter | Shape | Marks |
|---|---|---|
| K | block with a V cut in its right side | the notch cut into the shopfront photo in the place collage; the cut corner on primary buttons and the selected menu tab |
| U | solid arch, a cup seen from the side | the cups in the ritual and its ending |
| A | triangle | the ritual line's head; the hint marker; Pag-IBIG on the map; the north arrow |
| N | square with a wedge cut from its top | City Hall on the map |

The whole mark appears as:

- **Hero:** four large, flat white forms, each at its own angle.
- **Nav:** the brand mark, which parts on hover.
- **Order steps:** the four letters fill as the visitor moves through checkout.
- **Map pin.**
- **Menu signature:** K U A N in one row beside the menu heading.
- **Footer:** the mark re-forms on arrival.
- **Pattern:** fragments of the mark.

## Hero forms

`brand.js > sculpture` sets the composition: four flat forms, each placed and angled by hand, not on a shared axis.

| Form | Turn | Role |
|---|---|---|
| K | 11° counter-clockwise | leans back |
| U | 9° clockwise | the tilted form at the top right |
| A | 16° clockwise | the noticeably angled one |
| N | 3° counter-clockwise | almost upright |

- **Material:** flat warm white with no edge slab (`thickness: 0`), no shadow, no gloss. Each form has a few degrees of its own perspective (rx/ry), so the faces differ by a shade. The only edge is a 1px hairline in deep cobalt, invisible on the field and crisp where white meets white.
- **Size:** scale 1.62 in a 600 × 640 frame; the group fills about 65% of the cobalt field.
- **Phones:** a hero of its own, not the sculpture: the mark as a landscape. The first screen is a cobalt poster. K and U stand at the top and A and N rise from its foot, each a flat SVG cropped by the edge, at its own angle (K −9°, U 8°, A 14°, N −3°), four whites a shade apart. The eyebrow, the white headline, Order ahead (paper) and Call for delivery (paper outline), and the live open/closed status sit in the gap between them, so the words live inside the mark. The lede and note follow on the ground, then the facts. On load the forms part outward from the middle (950ms), the words settle (from 260ms), then the buttons (from 520ms); all of it is done by about 1.1s. Ambient drift is 2px and 0.5° on 8–13s cycles; a tap nudges a form 8px and 4° and it settles. Reduced motion shows the finished poster. Pattern 5%.
- **Intro:** the flat logo eases into the composition over 2s.
- **Idle:** about 1.3 units of drift and 0.25° of turn, on 11–20 second cycles that differ per form.
- **Pointer:** a small group tilt (2° and 3° at rest, up to 3.5° with the pointer), parallax by depth, and a turn of its own per form (`sway`: K 1.1°, U −0.8°, A 1.6°, N 0.5°), all lagging the pointer (lerp 0.035).
- **Hover:** the form under the pointer lifts 4 units and turns 2.2° in the direction of its own tilt, slowly.
- **Press:** a heavy spring (k 60, damping 10) at a fixed 1/120s step; the pressed form rises and turns 3–4°, then settles.
- **Only runs on screen;** the loop stops when the hero is off screen or the tab is hidden.
- **Without JS:** the flat white logo. **Reduced motion:** the composition, still.

## The place

One wide composition of the six enhanced photographs on the off-white ground. It runs up to 1680px wide, wider than the text, and stands about 58% of the screen tall: 626px at 1920 × 1080, 522px at 1440 × 900, never under 420px.

| Columns (1.5 / 1.1 / 0.8 / 0.8) | First | Second | Third | Fourth |
|---|---|---|---|---|
| **Top row** | 01 the shopfront, dominant, both rows tall | 02 the counter, both rows tall | 03 the sign | 04 the machine |
| **Bottom row** | | | 05 the two people at the bar | 06 the Classic Flavors table |

- **Hierarchy:** dominant (the building), secondary (the room), then four square details.
- **Gutter:** one 12px gutter throughout; no overlaps.
- **Crops:** each is cut to its cell in `crops.mjs`. The bar shots are cut clear of equipment logos.
- **Framing:** the K's notch on the shopfront's right edge, nothing else.
- **Numbers and legend:** each photo carries a small number tab. One mono legend under the composition names each (number, verb, what it shows), and pointing at either lights the other.
- **Arrival:** the photos open once, top down, 80ms apart.
- **Phones:** two columns. The shopfront leads at full width; the counter stands two rows tall beside the sign and the machine; the bar and the table close.

## Pattern

`patternFrags()` in `page.js` scatters letters (outlined, some filled), right-angle corners and short ruled lines. Placement rules:

- mostly near the edges;
- quarter turns plus up to 4.5° of tilt;
- scale 16–66%;
- some fragments run past the edge.

It is seeded per surface, so the arrangement is fixed. Strength per surface:

| Surface | Strength |
|---|---|
| Hero field | paper at 8% |
| The place | ink at 4% |
| Order | cobalt at 6% |
| Footer | paper at 8% |

It drifts up to 7px with the pointer.

## Colour

| Token | Value | Role |
|---|---|---|
| `brand` | `#10059F` | Cobalt, sampled from the logo. The one accent: the hero field, selected states, primary buttons, links on hover, focus, the footer band. |
| `ink` / `inkSoft` | `#16130F` / `#5E5850` | Text, rules, window-frame black; secondary text (6.4:1 on ground). |
| `brandSoft` | `#DCDAF2` | Secondary text on cobalt (selected tab line and count, footer labels). |
| `ground` / `paper` | `#F5F2EC` / `#FBFAF6` | Page; order section, fields, text on cobalt. |
| `concrete` / `concreteDeep` | `#E3DFD7` / `#C9C4BA` | The map, idle menu tabs, photo placeholders. |
| `wood` / `crema` | `#6E4B32` / `#C9A27A` | Coffee in the ritual; the ritual line. |
| `night` | `#15120F` | The ritual ground. |

## Type and scale

- **Funnel Display 500/600:** headings, "Apokon", the clock.
- **Funnel Sans:** text, set at 16px.
- **DM Mono, uppercase:** labels, numbers, prices, hours, map labels.
- **Steps:** h1 `clamp(36px, …, 62px)`, h2 `clamp(28px, …, 44px)`, sub-heads `clamp(21px, …, 26px)`.
- **Small sizes:** 15px secondary text, 14px meta, 12px status and notes, 11px mono labels (the floor).
- **Layout:** content width 1120px, nav 58px (54px on phones), section padding `clamp(60px, 7.2vw, 100px)`.
- **Target:** the density the V1 page had at 90% browser zoom.

## Layout

- Twelve columns; 24px gutter (16px on phones).
- Square corners everywhere; curves only from the U.
- The place collage runs wider than the text (up to 1280px).
- **Menu:** one bar of four tabs above the list (2×2 on phones, all four always visible). Each list runs full width in two columns of compact rows. No category pictures.
- **Section order:** hero with title block → 01 The place → 02 The ritual → 03 The menu → 04 Order → 05 Find Kuan → footer.

## Motion

Verbs:

- **mark:** the pieces part and re-form.
- **sculpture:** float, tilt, lift.
- **draw:** the ritual line and figures, the map route.
- **crop:** a photo shifts in its frame.
- **slide:** sheets, the phone bar.

Rules:

- UI transitions run 160–420ms. Curves: `cubic-bezier(0.23, 1, 0.32, 1)` and `(0.77, 0, 0.175, 1)`.
- Only the hero enters on load. Nothing is tied to scroll distance: the ritual and the place collage play once when they come into view.
- **Ritual:** on entry (a quarter of the stage visible), the line runs for 1.2s. Grind draws at once, pull at about 0.5s, pour about 0.8s, the cup about 1.1s; its coffee fills right after, so it has settled by about 1.4s.
- **Menu signature:** each form drifts about 1.5px and 0.4° on its own 9–14s cycle; hover lifts a form 5px and turns it 3°; a tap nudges it up 9px and back in 760ms.
- **Map sequence:** the route draws over 1.5s, the mark lands at 1.35s, then the pin pulses twice.
- **Reduced motion:** everything rests in its final state (sculpture posed, figures drawn, cup filled, route drawn, mark formed). The sculpture stays still.

## Components

**Buttons:**
- `btn-primary`: cobalt, with the K cut, which grows on hover.
- `btn-line`: an outline button.
- `btn-paper`: for use on cobalt.
- `btn-night`: for use on the ritual ground.

They are 46px tall and scale to 0.97 when pressed.

**Menu signature:** the four forms in one row, K U A N, in cobalt, each at its own small angle (K −6°, U 5°, A 9°, N −3°, an echo of the hero). It sits beside the heading, up to 540px wide (270px on phones, under the heading). It is decorative: it selects nothing and has no letter-to-category link.

**Menu tabs:** a number (01–04), the name and the item count. The selected tab fills cobalt and takes the K's cut corner. There are no letter icons: the mark is only ever shown whole (nav, map pin, footer).

**Menu lists:** the list's name and one line, then the shop's note where there is one (Espresso: prices pending), then the groups in two columns. Each group head is a small cobalt square, the name in mono, a 1.5px rule and the count.

**Menu rows:**
- Rows are 48px tall: name, a one-line detail only where the board gives one (or hot/iced, or flavour count), the price in mono, and a 40px + button (44px on phones).
- On hover, a tint, the same small cobalt square, and the text steps right.
- A row tap opens the item sheet, with the dish photo for Food. An unpriced row answers "Ask at the bar".
- On phones, each list ends with "Next list →".

**Sheets:** a right-side panel on desktop, a bottom sheet on phones.
