# Kuan Coffee changelog

## V8 (2026-11-11): the poster hero on desktop

- **Desktop** now uses the phone hero's idea, the mark as a landscape. The 3D sculpture and its "Click a piece" hint are replaced by a full-bleed cobalt poster: K and U hang from the top edge and A and N stand on the foot, each cropped. The white headline sits left, and the intro, both buttons and the ordering note sit right, all in the gap between the forms.
- **Motion:** the same entrance as phones (the forms part, the words and buttons settle, about 1.1s). With a mouse, each form leans toward the pointer by its own depth, lifts on hover and settles after a click.
- **Phones:** unchanged from V7; both widths now share one set of styles.
- **Removed:** the 3D renderer in `app.js`, its stage, pose data and outlines in `brand.js`, and its hint copy.
- Checked at 1920 × 1080, 1440 × 900, 1366 × 768 and the three phone sizes; interaction and reduced motion were tested headlessly.

## V7 (2026-11-11): phone hero, the mark as a landscape

- **Phones only.** The hero is no longer the desktop sculpture stacked with the copy. The first screen is a cobalt poster: K and U large at the top, A and N rising from the bottom edge, each cropped by the screen, and the headline, both buttons and the live "Open now" status set in the gap between them.
- **Entrance (about 1.1s):** the four forms part outward from the middle to make room for the words, then the buttons arrive. After that there is only slow drift, and a tap nudges a form.
- **Below the poster:** the intro and the hours note, on the off-white ground, then the facts.
- **Reduced motion:** the finished poster, still.
- Checked at 375 × 812, 390 × 844 and 430 × 932. Desktop is unchanged; the headless hero test matches.

## V6.2 (2026-11-11): phone hero order

- Phones only: the hero copy and buttons now come first and the sculpture follows them, at its V6.1 size. The copy gets 20px of room under the nav. Nothing else changed.

## V6.1 (2026-11-11): phone hero

- **Phones only.** The cobalt band is now about a third of the screen tall, flush under the nav, with smaller forms in it. The "Tap a piece" line is hidden.
- **Nav:** 50px tall on phones, with a slimmer Order ahead button.
- **Copy:** tighter spacing, a narrower 4-line lede, and the two buttons side by side. The label, headline, lede and Order ahead all fit on the first screen at 375 × 812, 390 × 844 and 430 × 932, and the hero facts begin below them.
- **Motion:** a tap moves a form about two thirds as far as on desktop.
- Desktop is unchanged (checked with the headless hero test).

## V6 (2026-11-11): collage scale, ritual timing, menu signature

- **The place:** the composition is now wide (up to 1680px) and about 58% of the screen tall: 626px at 1920 × 1080, 522px at 1440 × 900. The shopfront is dominant and the counter second, both full height; the sign, machine, bar and table are square details in two rows. Same six photos, recut to the new cells. One gutter, no overlaps. On phones the counter stands two rows tall, cropped to keep the "kuan." lettering.
- **Ritual:** it no longer follows scroll distance. When the section comes into view the line runs once: grind, pull (~0.5s), pour (~0.8s), the cup (~1.1s), settled by ~1.4s. The figure draws and the cup fill are faster to match. Reduced motion shows the finished state. Measured in headless Chrome.
- **Menu:** K U A N in one cobalt row beside the heading, each form at a small angle, with idle drift, a hover shift and a tap nudge. It is decorative and selects nothing. Categories, lists and data are unchanged.
- The hero, typography, colours, map and ordering are unchanged.

## V5 (2026-11-11): collage and menu cleanup

- **The place:** the overlapping collage is replaced by one 16:9 composition. The shopfront and the Classic Flavors table are large on opposite corners; the sign, counter, bar and machine sit beside them. One 10px gutter throughout, no overlaps, each crop recut to its cell. It is about 57% of a 1920 × 1080 screen. The U frame, the cobalt line and the small N are gone; the K's notch on the shopfront stays. The numbers now follow reading order (04 Meet, 05 Watch).
- **Menu:**
  - The letter icons on the tabs and rows are gone. Tabs show a number, the name and the count; the selected tab is cobalt.
  - Category pictures are removed for every list, including the latte beside Espresso and the hover swap on Food.
  - Each list runs full width in two columns, under its name, its line and (Espresso) the pending-price note.
  - Group heads and row hovers use one small cobalt square.
  - Dish photos stay in the item sheet only.
- **Data:** categories in `menu.js` no longer carry `glyph`, `photo` or `photoLabel`. The latte and table crops are no longer built.
- The hero, ordering, map and other sections are unchanged.

## V4 (2026-11-11): tilted hero, place collage

- **Hero:** the four KUAN forms are recomposed rather than rotated in place, and each has its own angle: K about 11° counter-clockwise, U 9° clockwise, A 16°, N nearly upright. The edge slab is gone; they are flat, matte and crisp, with a cobalt hairline edge and a few degrees of perspective each. They are still about 65% of the field. Each form turns its own amount with the pointer. Hover turns a form 2.2°; a press moves it 3–4° and lets it settle. Phones get their own composition.
- **The place:** the six-frame sequence is replaced by one collage of the six enhanced photographs, on off-white: the shopfront, the sign in a U, the counter, the machine, two people at the bar, and the Classic Flavors table. It uses different sizes, two ringed overlaps, the K's notch, a cobalt hairline and a small N, and is about 640px tall at 1920 × 1080. A mono legend underneath names each photo and lights with it. Phones get their own six-column layout.
- **Photos:** the sign, machine and bar shots are now used. The two bar shots are cropped clear of the Breville, Eureka and Simonelli logos. The V3.1 rejection of the sign was wrong: the shading at the N's base is in the original.
- **Removed from the place section:** the latte (it stays at the head of the Espresso list), the "Sit" line drawing and the "Photograph owed" label.
- Copy, facts, prices and the rest of the page are unchanged.

## V3.1 (2026-11-11): enhanced photographs

- The producer supplied six enhanced photographs. Three are used, with the originals kept in `assets/source/`:
  - **Classic Flavors table:** the same spread, sharpened and relit. All eight dish crops, the Food picture, the Stay frame and the share image are recut from it.
  - **Shopfront:** the same building by day, without the Halloween props. Arrive and Enter are recut; the captions now read "Apokon Road, the sign" and "The porch and the windows".
  - **Counter:** fills the Order frame, which held a line drawing. Its original source is still to confirm.
- Three were rejected: a square facade with a misdrawn KUAN sign, and two bar shots showing Breville, Eureka and Simonelli logos.
- Credits and the footer say which photographs are enhanced. Sit is now the only frame still owed by Kuan.
- No facts, products, prices or layout changed.

## V3 (2026-11-11): hero forms, place sequence, menu

- **Hero:** the KUAN forms are now large, crisp and flat, warm white on cobalt, with only a hairline edge where one form meets another. The shadows, thick extrusion and steep tilt are gone. They fill roughly two-thirds of the cobalt field (scale 1.62 in a 600 × 640 frame; the field is 680px tall at most). Motion is slower and heavier: 11–20 second drift of about a unit, parallax by depth that lags the pointer, a 6-unit lift and 1.4° turn on hover, and a soft spring on press. The headline steps down to 54px to make room.
- **The place:** the chopped photo and K-cut inset became a six-frame sequence, the visit in order:
  1. arrive (the dusk shopfront, revealed once);
  2. enter (the porch and string lights, a new crop of Kuan's photo);
  3. sit;
  4. order;
  5. drink (the latte in the U, stepping over the porch frame's corner);
  6. stay (a new wide crop of the Classic Flavors table).
  Sit and order are labelled frames with line drawings of the room, marked "Photograph owed by Kuan" (client decision, 2026-11-11). A thin U is drawn across the arrival photo.
- **Menu:**
  - The selector is one bar of four tabs: a letter, the name, an item count and a one-line description. The selected tab fills cobalt and its letter fills and turns.
  - Each list is laid out in two columns of compact rows with no photo thumbnails.
  - Each list has one picture. On Food, pointing at a dish shows it there, and the item sheet shows the dish photo.
  - "By the shot" now sits before "At the bar", so the one priced coffee is near the top.
  - Phones keep a 2×2 grid of all four lists and a single column of rows.
- No facts, products, prices, hours, contact details, ordering logic or map changed.

## V2 (2026-11-11): art direction, scale and interaction

- **Scale:** the page now sits at about the density it had at 90% browser zoom, by retuning the system (content width 1120px, nav 58px, type steps, section padding, image heights, button size), not by scaling the page.
- **Hero:** the photo collage is gone. The KUAN mark is now a small sculpture: four matte white slabs with real thickness, cobalt-tinted edges and soft shadows on the cobalt field, rendered by a small SVG projector in `app.js` (no library). On load the flat logo lifts into the sculpture; it floats very slightly, tilts toward the pointer, and a pressed piece lifts and settles on a spring. Reduced motion shows the finished sculpture, still.
- **Pattern:** faint fragments of the mark (letters, corners, ruled lines) behind the hero field, the place, the order section and the footer, seeded per surface so the arrangement stays the same, mostly near the edges, some cut off. They drift a few pixels with the pointer.
- **Ritual:** the line now carries a small triangle head; each figure draws itself as the line reaches it; the ending is the mark's U, drawn, then filled white with a band of coffee and a little steam: the same piece as the hero.
- **Menu:** Espresso first, then Non-espresso, Tea & soda, Food. Each list is marked by the whole mark with its own letter singled out, and has a one-line introduction. Rows reveal a small accent and a tint on hover; tapping a row opens the item to choose a quantity. Kuan's latte sits in a U at the head of the Espresso list.
- **The place:** the shopfront strip plus the Classic Flavors table cut by the K's notch, set over its corner, with A/B labels.
- **Find Kuan:** a wider schematic: Apokon Road, Pag-IBIG next door, the turn east toward Tagum City Hall, Macario P. Bermudez St, the Hijo River. The route draws, the mark lands, the pin pulses twice.
- **Micro-interactions:** the nav mark parts on hover; the footer mark re-forms on arrival and parts slightly on hover; the order glyphs tilt on hover; photos shift in their frames.
- **After the V2 critique (26/32):** with an empty cart, "Order ahead" goes to the menu instead of an empty sheet; slab edges are warm plaster grey, not a cobalt tint, and the pose rotations are calmer; unpriced coffee rows answer hover and tap with "Ask at the bar"; every list ends with a "Next list" button; the plus code replaces the large "Apokon"; map labels sit inside the phone crop; small lone triangles no longer appear in the pattern; action labels unified ("Order ahead", "Call for delivery"); the nav order button steps aside while the phone bar shows; status text and phone tab counts raised to 12px and 11px.
- No facts, products, prices, hours or contact details changed.

## V1 (2026-11-11): first creative build

- **Facts gathered** from the Tagum Coffee Shop Listing Desk lead, Kuan's Instagram bio, its Google Maps place panel and the shop's own menu graphic and boards; every fact and conflict is in `SOURCES.md`.
- **Photographs:** Kuan's own posts only (client decision). Nine downloaded; four used (the Classic Flavors spread, the shopfront, the latte), one rejected for a third-party brand, four left out as too small or Halloween-only.
- **Logo:** traced from the 149 px file into four shapes for the demo (client decision); a vector is owed.
- **New UI kit `kits/quiet-form/`**, chosen per client through `theme.kit`; `build.mjs` now loads the kit's page, styles and script and lets a client write its own credits intro. Bean O' Clock still builds from `src/`, unchanged.
- **Sections:** hero (the mark as four photo windows), 01 The place, 02 The ritual (grind, pull, pour, cup on one line), 03 The menu (selector laid out as the mark), 04 Order (order ahead, delivery, walk in, with Tagum time), 05 Find Kuan (schematic map, live map on request), cobalt footer.
- **Ordering demo:** cart with hot/iced and flavour choices; pickup slots from Kuan's hours in Manila time; name and mobile with inline checks; review; saved on the device.
- **Espresso:** names from the board, prices pending, not orderable (client decision).
- **Menu opens on Espresso** (client decision); set by `defaultCategory` in `menu.js`. The selector keeps the mark's K U / A N order.
- **After the design critique (23/32):** "Call for delivery" in place of a dead-end "Get it delivered"; a single-shot add button ends the ritual; pickup times grouped by part of day and re-checked on placing; the phone bar steps aside over the footer; 12-hour times throughout; dimmed ritual text made readable.
