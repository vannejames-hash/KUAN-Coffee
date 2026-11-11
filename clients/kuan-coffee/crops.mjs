// Cuts the site's photographs (assets/source) into the web images the site uses (assets/img).
//   node clients/kuan-coffee/crops.mjs
// Needs ffmpeg on PATH. Each crop is x, y, w, h in the source's pixels; every crop ships as WebP at each width.
import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'assets', 'source');
const out = join(here, 'assets', 'img');
mkdirSync(out, { recursive: true });

// Enhanced versions supplied by the producer (2026-11-11): the same scenes, sharpened and relit. Kuan's originals stay
// beside them (maps-owner-6000.jpg, maps-shopfront-night.jpg). See SOURCES.md for the rest.
const SPREAD = 'enhanced-spread.png'; // 1536 x 1024, the Classic Flavors spread
const FRONT = 'enhanced-shopfront-day.png'; // 1534 x 1025, the shopfront by day, no Halloween props
const COUNTER = 'enhanced-counter.png'; // 1498 x 1050, the concrete counter and the "kuan." wall
const SIGN = 'enhanced-sign.png'; // 1254 x 1254, the sign up close
const MACHINE = 'enhanced-machine.png'; // 1536 x 1024, the home-style machine at the bar (logos cropped out)
const BAR = 'enhanced-at-the-bar.png'; // 1536 x 1024, two people at the bar (the grinder's logo cropped out)

const crops = [
  // One dish each, matched to the Classic Flavors list.
  { id: 'spread-pancake', file: SPREAD, box: [45, 221, 435, 435], widths: [240, 420] },
  { id: 'spread-hashbrown', file: SPREAD, box: [986, 256, 397, 397], widths: [240, 390] },
  { id: 'spread-tapa', file: SPREAD, box: [1136, 627, 397, 397], widths: [240, 390] },
  { id: 'spread-sausage', file: SPREAD, box: [678, 702, 322, 322], widths: [240, 320] },
  { id: 'spread-sweetsour', file: SPREAD, box: [592, 336, 333, 333], widths: [240, 330] },
  { id: 'spread-bagnet', file: SPREAD, box: [358, 0, 358, 358], widths: [240, 350] },
  { id: 'spread-bangus', file: SPREAD, box: [922, 0, 333, 333], widths: [240, 330] },
  { id: 'spread-sisig', file: SPREAD, box: [192, 724, 300, 300], widths: [240, 300] },
  // The place: the shopfront dominant, the counter second, four square details. Each crop is cut to its cell;
  // the bar shots clear every equipment logo (Breville, Eureka, Simonelli) and the milk carton.
  { id: 'place-front', file: FRONT, box: [480, 60, 700, 752], widths: [640, 1200] },
  { id: 'place-counter', file: COUNTER, box: [260, 0, 715, 1050], widths: [480, 900] },
  { id: 'place-sign', file: SIGN, box: [340, 150, 640, 640], widths: [320, 640] },
  { id: 'place-machine', file: MACHINE, box: [360, 400, 520, 520], widths: [320, 520] },
  { id: 'place-bar', file: BAR, box: [470, 120, 720, 720], widths: [320, 640] },
  { id: 'place-table', file: SPREAD, box: [360, 130, 760, 760], widths: [320, 640] },
];

for (const c of crops) {
  const [x, y, w, h] = c.box;
  for (const width of c.widths) {
    const file = join(out, `photo-${c.id}-${width}.webp`);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(src, c.file), '-vf', `crop=${w}:${h}:${x}:${y},scale=${width}:-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', file]);
  }
  console.log(`${c.id}: ${c.widths.join(', ')}`);
}

// Share image (1200 x 630) from the spread, and the small icon from the shop's own logo file.
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(src, SPREAD), '-vf', 'crop=1536:806:0:192,scale=1200:630:flags=lanczos', '-q:v', '4', join(out, 'share.jpg')]);
copyFileSync(join(src, 'logo-kuan-149.png'), join(out, 'icon.png'));
console.log('share.jpg, icon.png');
