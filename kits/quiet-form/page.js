// "Quiet form": a storefront kit for a café whose identity is a geometric mark and a physical room.
// Renders one page from the client's config (business, menu, theme, content, brand).
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const LETTERS = ['K', 'U', 'A', 'N'];

// Bounding boxes of the four pieces inside the mark's view box.
const BOX = { K: [15, 0, 142, 135], U: [165, 0, 140, 140], A: [0, 187, 165, 138], N: [175, 187, 137, 138] };

function glyph(mark, letter, cls = 'glyph') {
  const [x, y, w, h] = BOX[letter];
  return `<svg class="${cls}" viewBox="${x - 2} ${y - 2} ${w + 4} ${h + 4}" aria-hidden="true" focusable="false"><path d="${mark.pieces[letter].d}"/></svg>`;
}

// The whole mark; each piece carries its outward direction so CSS can part and re-form it.
function markSolid(mark, cls, on = null) {
  return `<svg class="${cls}" viewBox="-24 -24 360 373" aria-hidden="true" focusable="false">${LETTERS.map((l) => `<path class="mk mk-${l}${l === on ? ' mk-on' : ''}" style="--ox:${mark.pieces[l].out[0]};--oy:${mark.pieces[l].out[1]}" d="${mark.pieces[l].d}"/>`).join('')}</svg>`;
}

// Fragments of the mark scattered by hand-tuned rules: mostly near the edges, at a few scales, quarter turns plus a
// small tilt, some cut off by the edge. Seeded, so each surface keeps its own arrangement from build to build.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function patternFrags(mark, seed, { w, h, count, edge = 0.8 }) {
  const r = rng(seed);
  const frags = [];
  for (let i = 0; i < count; i += 1) {
    const kind = r();
    const atEdge = r() < edge;
    const x = (atEdge ? (r() < 0.5 ? -0.04 + r() * 0.22 : 0.82 + r() * 0.24) : 0.28 + r() * 0.44) * w;
    const y = (atEdge ? -0.06 + r() * 1.12 : (r() < 0.5 ? -0.04 + r() * 0.14 : 0.88 + r() * 0.14)) * h;
    const rot = [0, 90, 180, 270][Math.floor(r() * 4)] + (r() - 0.5) * 9;
    const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`;
    if (kind < 0.58) {
      let l = LETTERS[Math.floor(r() * 4)];
      const s = 0.16 + r() * 0.5;
      // A small lone triangle reads as a play or back icon; at that size use another letter.
      if (l === 'A' && s < 0.45) l = 'N';
      const [bx, by, bw, bh] = BOX[l];
      frags.push(`<path class="${r() < 0.28 ? 'pf-solid' : 'pf-line'}" d="${mark.pieces[l].d}" transform="${t} scale(${s.toFixed(3)}) translate(${-(bx + bw / 2)} ${-(by + bh / 2)})"/>`);
    } else if (kind < 0.82) {
      const len = 22 + r() * 56;
      frags.push(`<path class="pf-line" d="M0 ${len.toFixed(1)}V0H${len.toFixed(1)}" transform="${t}"/>`);
    } else {
      const n = 3 + Math.floor(r() * 3);
      const gap = 6 + r() * 5;
      const len = 30 + r() * 90;
      frags.push(`<path class="pf-line" d="${Array.from({ length: n }, (_, k) => `M0 ${(k * gap).toFixed(1)}H${(len * (1 - k * 0.12)).toFixed(1)}`).join('')}" transform="${t}"/>`);
    }
  }
  return frags.join('');
}
function pattern(mark, seed, opts) {
  return `<svg class="pattern${opts.cls ? ` ${opts.cls}` : ''}" viewBox="0 0 ${opts.w} ${opts.h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g data-drift>${patternFrags(mark, seed, opts)}</g></svg>`;
}

const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const money = (menu, n) => `${menu.currency}${n}`;
const allItems = (menu) => menu.categories.flatMap((c) => c.groups.flatMap((g) => g.items));
const srcset = (im) => im.widths.map((w) => `assets/img/${im.base}-${w}.webp ${w}w`).join(', ');
const largest = (im) => `assets/img/${im.base}-${im.widths[im.widths.length - 1]}.webp`;

function themeVars(theme) {
  const colors = Object.entries(theme.color).map(([k, v]) => `--c-${kebab(k)}: ${v};`).join(' ');
  const f = theme.font;
  return `:root { ${colors} --font-display: '${f.display}', 'Segoe UI', system-ui, sans-serif; --font-text: '${f.text}', 'Segoe UI', system-ui, sans-serif; --font-mono: '${f.mono}', ui-monospace, Consolas, monospace; }`;
}

function jsonLd({ business, menu }) {
  const prices = allItems(menu).map((i) => i.price).filter((p) => typeof p === 'number');
  const loc = business.location;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: business.fullName,
    description: business.bio,
    telephone: business.phone.tel,
    email: business.email,
    priceRange: `₱${Math.min(...prices)}–₱${Math.max(...prices)}`,
    address: { '@type': 'PostalAddress', streetAddress: loc.road, addressLocality: `${loc.area}, ${loc.city}`, addressRegion: loc.province, addressCountry: loc.country },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: business.hours.open, closes: business.hours.close }],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: business.rating.value, reviewCount: business.rating.count },
    hasMap: loc.mapsUrl,
    sameAs: business.social.map((s) => s.url),
    hasMenu: '#menu',
  }).replace(/</g, '\\u003c');
}

// The hero composition's frame: 600 x 640 units, the mark centred at this scale (it fills most of the frame).
const STAGE = { w: 600, h: 640, cx: 300, cy: 322, scale: 1.62 };

function storeData({ business, menu, content, brand }) {
  return JSON.stringify({
    name: business.fullName,
    phone: business.phone,
    messageUrl: business.messageUrl,
    timeZone: business.timeZone,
    hours: business.hours,
    pickup: business.ordering.pickup,
    delivery: business.ordering.delivery,
    currency: menu.currency,
    categories: menu.categories,
    demo: content.demo,
    itemPhotos: Object.fromEntries(allItems(menu).filter((i) => i.photo).map((i) => { const im = content.images[i.photo]; return [i.id, { src: largest(im), alt: im.alt }]; })),
    sculpture: {
      ...STAGE,
      markW: brand.mark.width,
      markH: brand.mark.height,
      ...brand.sculpture,
      polys: Object.fromEntries(LETTERS.map((l) => [l, brand.mark.pieces[l].poly])),
    },
  }).replace(/</g, '\\u003c');
}

/* ---------- Sections ---------- */

function sectionHead(s, id, extra = '') {
  return `<header class="sec-head">
      <p class="label"><span class="num">${esc(s.number)}</span>${esc(s.label)}</p>
      <h2 id="${id}-title">${esc(s.title)}</h2>
      ${extra}
    </header>`;
}

function nav({ business, content, brand }) {
  return `<header class="nav" id="nav">
  <div class="wrap nav-row">
    <a class="brand" href="#top" aria-label="${esc(business.fullName)}, back to the top">${markSolid(brand.mark, 'brand-mark')}<span class="brand-name">${esc(business.fullName)}</span></a>
    <nav class="nav-links" aria-label="Sections">${content.nav.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</nav>
    <button class="btn btn-primary btn-sm nav-order" type="button" data-open-order>Order ahead<span class="count" data-cart-count hidden>0</span></button>
  </div>
</header>`;
}

function hero({ business, menu, content, brand }) {
  const h = content.hero;
  const mark = brand.mark;
  const S = STAGE;
  const prices = allItems(menu).map((i) => i.price).filter((p) => typeof p === 'number');
  // First paint (and no-JS): the flat logo, white on cobalt. The script lifts it into the sculpture.
  const flat = `<g class="sp-flat" transform="translate(${S.cx - (mark.width / 2) * S.scale} ${S.cy - (mark.height / 2) * S.scale}) scale(${S.scale})">${LETTERS.map((l) => `<path d="${mark.pieces[l].d}"/>`).join('')}</g>`;
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy" data-enter>
      <p class="label">${esc(h.label)}</p>
      <h1 class="display" id="hero-title">${esc(h.title)}</h1>
      <p class="lede">${esc(h.lede)}</p>
      <div class="actions" id="hero-actions">
        <button class="btn btn-primary" type="button" data-open-order>${esc(h.primary)}</button>
        <button class="btn btn-line" type="button" data-open-delivery>${esc(h.secondary)}</button>
      </div>
      <p class="hero-note">${esc(h.note)}</p>
    </div>
    <div class="hero-object" data-enter>
      <button class="sculpt-stage" type="button" aria-label="${esc(h.markLabel)}">
        <svg class="sculpt-pattern" viewBox="0 0 900 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g data-drift>${patternFrags(mark, 7, { w: 900, h: 760, count: 14, edge: 0.94 })}</g></svg>
        <svg class="sculpt" viewBox="0 0 ${S.w} ${S.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(business.fullName)} logo: four white forms on a cobalt field" shape-rendering="geometricPrecision">
          <g class="sp-pieces">${flat}</g>
        </svg>
      </button>
      <p class="mark-hint" data-hint data-touch="${esc(h.hint.touch)}" aria-hidden="true"><span class="hint-dot"></span><span data-hint-text>${esc(h.hint.pointer)}</span></p>
    </div>
  </div>
  <div class="wrap">
    <dl class="titleblock">
      <div><dt>Open</dt><dd>${esc(business.hours.days)} · ${fmtTime(business.hours.open)}–${fmtTime(business.hours.close)} <span class="status" data-status></span></dd></div>
      <div><dt>Where</dt><dd>${esc(business.location.road)}, ${esc(business.location.area)}</dd></div>
      <div><dt>${esc(business.rating.source)}</dt><dd>${business.rating.value} · ${business.rating.count} reviews</dd></div>
      <div><dt>Menu from</dt><dd>${money(menu, Math.min(...prices))}</dd></div>
    </dl>
  </div>
</section>`;
}

// The place as one composition, wide and about 58% of the screen tall: the shopfront dominant (full height), the
// counter second (full height), four square details in two rows. One gutter, no overlaps.
const SHOT_SIZES = {
  front: '(min-width: 641px) 38vw, 100vw',
  counter: '(min-width: 641px) 28vw, 50vw',
  sign: '(min-width: 641px) 20vw, 50vw',
  machine: '(min-width: 641px) 20vw, 50vw',
  bar: '(min-width: 641px) 20vw, 50vw',
  table: '(min-width: 641px) 20vw, 50vw',
};

function place({ content, brand }) {
  const s = content.place;
  const shot = (f, i) => {
    const im = content.images[f.image];
    return `<figure class="shot shot-${f.at}" data-shot="${f.n}" style="--i:${i}">
      <div class="shot-media" data-crop><img src="${largest(im)}" srcset="${srcset(im)}" sizes="${SHOT_SIZES[f.at]}" alt="${esc(im.alt)}" loading="lazy" decoding="async"></div>
      <span class="shot-n" aria-hidden="true">${esc(f.n)}</span>
    </figure>`;
  };
  return `<section class="place" id="place" aria-labelledby="place-title">
  ${pattern(brand.mark, 23, { w: 1440, h: 1500, count: 12, cls: 'pattern-place' })}
  <div class="wrap">
    <div class="place-top">
      ${sectionHead(s, 'place')}
      <p class="place-intro">${esc(s.intro)}</p>
    </div>
  </div>
  <div class="collage-wrap">
    <div class="collage">
      ${s.shots.map(shot).join('')}
    </div>
    <ol class="collage-legend">
      ${s.shots.map((f) => `<li data-shot="${f.n}"><span class="lg-n">${esc(f.n)}</span><span class="lg-verb">${esc(f.verb)}</span><span class="lg-label">${esc(f.label)}</span></li>`).join('')}
    </ol>
  </div>
  <div class="wrap">
    <ul class="place-rows">
      ${s.rows.map((r) => `<li>${glyph(brand.mark, r.glyph)}<h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

// The menu's signature: the four forms of the mark set in one row, K U A N, each at its own small angle (an echo of
// the hero). Decorative only: it does not select anything. Idle drift, hover shift and a tap nudge are CSS + app.js.
const ROW_TILT = { K: -6, U: 5, A: 9, N: -3 };
function markRow(mark) {
  const gap = 30;
  const H = 150;
  let x = 0;
  const pieces = LETTERS.map((l, i) => {
    const [bx, by, bw, bh] = BOX[l];
    const g = `<g transform="translate(${x - bx} ${(H - bh) / 2 - by})"><g class="mr-drift" style="--i:${i}"><path class="mr-shape" style="--r:${ROW_TILT[l]}deg" d="${mark.pieces[l].d}"/></g></g>`;
    x += bw + gap;
    return g;
  }).join('');
  return `<svg class="mark-row" viewBox="-12 -6 ${x - gap + 24} ${H + 12}" aria-hidden="true" focusable="false">${pieces}</svg>`;
}

// Each step is drawn with the mark's own shapes: the A as the hopper, the K's block as the group head, the U as the cup.
function ritualFigure(n) {
  if (n === 0) {
    return `<svg class="fig" viewBox="0 0 160 160" aria-hidden="true">
      <path class="fig-line fig-fillable" pathLength="1" d="M30 22H130L80 92Z"/>
      <path class="fig-line" pathLength="1" d="M56 92H104V126H56Z"/>
      <path class="fig-grounds" d="M74 134v6M80 132v10M86 134v6"/>
    </svg>`;
  }
  if (n === 1) {
    return `<svg class="fig" viewBox="0 0 160 160" aria-hidden="true">
      <path class="fig-line" pathLength="1" d="M38 20H122V50H38Z"/>
      <path class="fig-line" pathLength="1" d="M122 35H146"/>
      <path class="fig-stream" pathLength="1" d="M80 50V112"/>
      <path class="fig-line" pathLength="1" d="M52 104H108V118A28 28 0 0 1 52 118Z"/>
    </svg>`;
  }
  return `<svg class="fig" viewBox="0 0 160 160" aria-hidden="true">
      <clipPath id="pour-clip"><path d="M40 70H120V100A40 40 0 0 1 40 100Z"/></clipPath>
      <g clip-path="url(#pour-clip)"><rect class="fig-coffee" x="40" y="70" width="80" height="72"/><rect class="fig-crema" x="40" y="70" width="80" height="6"/></g>
      <path class="fig-line" pathLength="1" d="M40 70H120V100A40 40 0 0 1 40 100Z"/>
      <path class="fig-line" pathLength="1" d="M98 18L138 30L112 56Z"/>
      <path class="fig-pour" pathLength="1" d="M104 44C96 52 90 60 86 74"/>
    </svg>`;
}

// The ending: the line arrives and becomes the mark's U, which fills.
function cupFigure() {
  return `<svg class="cup" viewBox="0 0 160 160" aria-hidden="true">
      <clipPath id="cup-clip"><path d="M18 32H142V90A62 62 0 0 1 18 90Z"/></clipPath>
      <g clip-path="url(#cup-clip)">
        <rect class="cup-coffee" x="18" y="32" width="124" height="122"/>
        <rect class="cup-crema" x="18" y="32" width="124" height="11"/>
      </g>
      <path class="cup-line" pathLength="1" d="M80 152A62 62 0 0 1 18 90V32H142V90A62 62 0 0 1 80 152"/>
      <path class="cup-steam" d="M66 22C60 16 72 10 66 2M94 24C88 18 100 12 94 4"/>
    </svg>`;
}

function ritual({ content, menu, brand }) {
  const s = content.ritual;
  const shot = allItems(menu).find((i) => i.id === s.endAdd.item);
  return `<section class="ritual" id="ritual" aria-labelledby="ritual-title">
  <div class="wrap">
    ${sectionHead(s, 'ritual')}
    <div class="ritual-stage" data-ritual>
      <div class="ritual-rail" aria-hidden="true"><span class="ritual-progress"></span><span class="ritual-head">${glyph(brand.mark, 'A', 'glyph')}</span></div>
      <ol class="ritual-steps">
        ${s.steps.map((st, i) => `<li class="step" data-step="${i}">
          ${ritualFigure(i)}
          <p class="step-n">${esc(st.n)}</p>
          <h3>${esc(st.title)}</h3>
          <p>${esc(st.text)}</p>
        </li>`).join('')}
      </ol>
      <div class="ritual-end" data-step="3">
        ${cupFigure()}
        <div class="ritual-end-copy">
          <p class="step-n">${esc(s.endLabel)}</p>
          <h3>${esc(s.endTitle)}</h3>
          <p>${esc(s.endText)}</p>
          <button class="btn btn-night" type="button" data-add="${esc(shot.id)}">${esc(s.endAdd.label)} · ${money(menu, shot.price)}</button>
          <a class="link" href="#cat-espresso">${esc(s.endLink)}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function itemRow(menu, content, item) {
  const priced = typeof item.price === 'number';
  const opts = [item.detail, item.temp ? 'Hot or iced' : '', item.choices ? `${item.choices.options.length} flavours` : ''].filter(Boolean);
  return `<li class="item${priced ? '' : ' is-pending'}"${priced ? ` data-item="${esc(item.id)}"` : ''}>
    <span class="item-text"><span class="item-name">${esc(item.name)}</span>${opts.length ? `<span class="item-detail">${esc(opts.join(' · '))}</span>` : ''}</span>
    <span class="price">${priced ? money(menu, item.price) : `<span class="pending-text">${esc(content.menu.pending)}</span><span class="pending-ask" aria-hidden="true">${esc(content.menu.ask)}</span>`}</span>
    ${priced ? `<button class="add" type="button" data-add="${esc(item.id)}" aria-label="Add ${esc(item.name)}, ${money(menu, item.price)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="add-plus" d="M10 4v12M4 10h12"/><path class="add-check" d="M4.5 10.5l3.5 3.5 7.5-8"/></svg><span class="add-label" aria-hidden="true">${esc(content.menu.add)}</span></button>` : '<span class="add-gap" aria-hidden="true"></span>'}
  </li>`;
}

function menuSection({ menu, content, brand }) {
  const s = content.menu;
  const count = (c) => c.groups.reduce((n, g) => n + g.items.length, 0);
  const first = menu.categories.some((c) => c.id === menu.defaultCategory) ? menu.defaultCategory : menu.categories[0].id;
  // One bar of four tabs: number, name, count. The selected one fills cobalt. No letter fragments: the mark stays whole.
  const tabs = menu.categories.map((c, i) => `<button class="tab" type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${c.id === first}" tabindex="${c.id === first ? 0 : -1}" data-cat="${c.id}">
      <span class="tab-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="tab-name">${esc(c.name)}</span>
      <span class="tab-count">${count(c)} items</span>
    </button>`).join('');
  // Product first: the list's line, a note where the shop needs one, then the products in two columns.
  const panels = menu.categories.map((c, ci) => {
    const nextCat = menu.categories[(ci + 1) % menu.categories.length];
    return `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" tabindex="0"${c.id === first ? '' : ' hidden'}>
      <div class="panel-head"><p class="panel-line"><strong>${esc(c.name)}</strong><span>${esc(c.line)}</span></p>${c.note ? `<p class="panel-note">${esc(c.note)}</p>` : ''}</div>
      <div class="groups">${c.groups.map((g) => `<div class="group">${g.label ? `<h4 class="group-label"><span class="group-name">${esc(g.label)}</span><span class="group-count">${g.items.length}</span></h4>` : ''}<ul class="items">${g.items.map((it) => itemRow(menu, content, it)).join('')}</ul></div>`).join('')}</div>
      <button class="panel-next" type="button" data-next-cat="${esc(nextCat.id)}"><span class="label">${esc(s.next)}</span><span class="panel-next-name">${esc(nextCat.name)}</span><span class="panel-next-arrow" aria-hidden="true">→</span></button>
    </div>`;
  }).join('');
  return `<section class="menu" id="menu" aria-labelledby="menu-title">
  <div class="wrap">
    <div class="menu-top">
      ${sectionHead(s, 'menu', `<p class="sec-intro">${esc(s.intro)}</p>`)}
      ${markRow(brand.mark)}
    </div>
    <div class="selector" role="tablist" aria-label="Menu lists">${tabs}</div>
    <div class="menu-stage">${panels}</div>
  </div>
</section>`;
}

function order({ business, content, brand }) {
  const s = content.order;
  const action = (w) => {
    if (w.id === 'pickup') return `<button class="btn btn-primary" type="button" data-open-order>${esc(w.action)}</button>`;
    if (w.id === 'delivery') return `<button class="btn btn-line" type="button" data-open-delivery>${esc(w.action)}</button>`;
    return `<a class="btn btn-line" href="${esc(business.location.directionsUrl)}" target="_blank" rel="noopener">${esc(w.action)}</a>`;
  };
  return `<section class="order" id="order" aria-labelledby="order-title">
  ${pattern(brand.mark, 41, { w: 1440, h: 760, count: 9, cls: 'pattern-order' })}
  <div class="wrap">
    ${sectionHead(s, 'order', `<p class="clock"><span class="clock-label">In Tagum it is</span> <time data-clock>—</time> <span class="status" data-status></span></p>`)}
    <ul class="ways">
      ${s.ways.map((w) => `<li class="way way-${w.id}">${glyph(brand.mark, w.glyph)}<h3>${esc(w.title)}</h3><p>${esc(w.text)}</p>${action(w)}</li>`).join('')}
    </ul>
  </div>
</section>`;
}

function wayfinding(business, map, mark) {
  const loc = business.location;
  const [w, h] = map.view;
  const label = (text, [x, y], angle = 0, cls = '') => `<text class="map-label${cls}" transform="translate(${x} ${y})${angle ? ` rotate(${angle})` : ''}">${esc(text.toUpperCase())}</text>`;
  const pinMark = LETTERS.map((l) => `<path d="${mark.pieces[l].d}"/>`).join('');
  const [px, py] = map.pin;
  return `<svg class="wayfind" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Schematic map: Kuan sits on the north-east side of ${esc(loc.road)}, beside ${esc(loc.landmark)}, just north of the turn east toward Tagum City Hall.">
      <defs><pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" class="hatch-line"/></pattern></defs>
      <path class="map-area" d="${map.area.d}"/>
      ${label(map.area.label, map.area.at, 0, ' map-soft')}
      <path class="river" d="${map.river.d}"/>
      ${label(map.river.label, map.river.at, -90, ' map-soft')}
      ${map.roads.map((r) => `<path class="${r.cls}" d="${r.d}"/>${r.cls === 'road' ? `<path class="road-mid" d="${r.d}"/>` : ''}`).join('')}
      ${map.roads.map((r) => label(r.label, r.at, r.angle, r.cls === 'road' ? ' road-label' : '')).join('')}
      ${map.landmarks.map((m) => {
        const [lx, ly] = m.at;
        const [lw, lh] = m.size;
        const [bx, by, bw, bh] = BOX[m.glyph];
        const gs = 18 / Math.max(bw, bh);
        return `<g class="landmark"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}"/><path class="landmark-glyph" d="${mark.pieces[m.glyph].d}" transform="translate(${lx + lw / 2 - 9} ${ly + lh / 2 - 9}) scale(${gs.toFixed(4)}) translate(${-bx} ${-by})"/><text class="map-label" x="${lx + lw / 2}" y="${ly - 9}" text-anchor="middle">${esc(m.label.toUpperCase())}</text></g>`;
      }).join('')}
      <path class="route" pathLength="1" d="${map.route}"/>
      <g class="pin" transform="translate(${px} ${py})">
        <rect class="pin-ring" x="-6" y="-6" width="68" height="68"/>
        <g class="pin-body">
          <rect width="56" height="56"/>
          <g transform="translate(10 9.5) scale(0.115)" class="pin-mark">${pinMark}</g>
          <path d="M22 56H34L28 66Z"/>
        </g>
      </g>
      <g class="north" transform="translate(${map.north[0]} ${map.north[1]})"><path d="M0 22L10 0L20 22Z"/><text class="map-label" x="10" y="38" text-anchor="middle">N</text></g>
      <text class="map-label map-note" x="${map.north[0]}" y="${h - 14}">SCHEMATIC · NOT TO SCALE</text>
    </svg>`;
}

function find({ business, content, brand }) {
  const s = content.find;
  const loc = business.location;
  return `<section class="find" id="find" aria-labelledby="find-title">
  <div class="wrap">
    ${sectionHead(s, 'find')}
    <div class="find-grid">
      <div class="map-panel" data-map>
        ${wayfinding(business, s.map, brand.mark)}
      </div>
      <div class="find-info">
        <div class="big-block"><p class="big">${esc(s.big)}</p><p class="big-note">${esc(s.bigNote)}</p></div>
        <dl class="facts">
          <div><dt>Where</dt><dd>${esc(loc.road)}, ${esc(loc.area)}<br>${esc(loc.city)}, ${esc(loc.province)}</dd></div>
          <div><dt>Near</dt><dd>${esc(loc.landmark)}</dd></div>
          <div><dt>Open</dt><dd>${esc(business.hours.days)}, ${fmtTime(business.hours.open)}–${fmtTime(business.hours.close)}</dd></div>
          <div><dt>Call</dt><dd><a class="link" href="tel:${esc(business.phone.tel)}">${esc(business.phone.display)}</a></dd></div>
          <div><dt>Email</dt><dd><a class="link" href="mailto:${esc(business.email)}">${esc(business.email)}</a></dd></div>
          <div><dt>Follow</dt><dd>${business.social.map((so) => `<a class="link" href="${esc(so.url)}" target="_blank" rel="noopener">${esc(so.network)}</a>`).join(' · ')}</dd></div>
        </dl>
        <div class="actions">
          <a class="btn btn-primary" href="${esc(loc.directionsUrl)}" target="_blank" rel="noopener">${esc(s.primary)}</a>
          <button class="btn btn-line" type="button" data-live-map data-embed="${esc(loc.embedUrl)}" aria-pressed="false">${esc(s.secondary)}</button>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function close({ business, content, brand }) {
  const c = content.close;
  return `<footer class="close" id="close">
  ${pattern(brand.mark, 59, { w: 1440, h: 820, count: 10, cls: 'pattern-close' })}
  <div class="wrap close-grid">
    <div class="close-mark">${markSolid(brand.mark, 'close-svg')}</div>
    <div class="close-copy">
      <p class="close-title">${esc(c.title)}</p>
      <button class="btn btn-paper" type="button" data-open-order>${esc(c.action)}</button>
    </div>
  </div>
  <div class="wrap"><div class="close-facts">
    <div><p class="label">Open</p><p>${esc(business.hours.days)}<br>${fmtTime(business.hours.open)}–${fmtTime(business.hours.close)}</p></div>
    <div><p class="label">Where</p><p>${esc(business.location.road)}<br>${esc(business.location.area)}, ${esc(business.location.city)}</p></div>
    <div><p class="label">Contact</p><p><a class="link" href="tel:${esc(business.phone.tel)}">${esc(business.phone.display)}</a><br><a class="link" href="mailto:${esc(business.email)}">${esc(business.email)}</a></p></div>
    <div><p class="label">Follow</p><p>${business.social.map((s) => `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.network)}</a>`).join('<br>')}</p></div>
  </div></div>
  <div class="wrap close-legal">
    <p><span class="demo-tag">${esc(content.demo.label)}</span> ${esc(content.demo.note)} Photographs of ${esc(business.fullName)}, some enhanced for the web. <a class="link" href="credits.html">Credits</a></p>
  </div>
</footer>`;
}

function actionBar({ business }) {
  return `<div class="action-bar" id="action-bar" aria-label="Quick actions">
  <button class="btn btn-primary" type="button" data-open-order>Order ahead<span class="count" data-cart-count hidden>0</span></button>
  <a class="btn btn-line" href="tel:${esc(business.phone.tel)}">Call</a>
</div>`;
}

function dialogs({ business, content, brand }) {
  const steps = [['K', 'Order'], ['U', 'Time'], ['A', 'Details'], ['N', 'Review']];
  const x = '<button class="icon-btn" type="button" data-close aria-label="Close"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>';
  return `<dialog class="sheet" id="item-sheet" aria-labelledby="item-title">
  <form method="dialog" class="sheet-inner" id="item-form" novalidate>
    <div class="sheet-head"><h2 id="item-title" class="sheet-title"></h2>${x}</div>
    <div class="sheet-body" id="item-body"></div>
    <div class="sheet-foot"><button class="btn btn-primary btn-wide" type="submit" id="item-add">Add to order</button></div>
  </form>
</dialog>
<dialog class="sheet sheet-order" id="order-sheet" aria-labelledby="order-title-d">
  <div class="sheet-inner">
    <div class="sheet-head">
      <div><p class="label"><span class="demo-tag">${esc(content.demo.label)}</span> Order ahead for pickup</p><h2 class="sheet-title" id="order-title-d">Your order</h2></div>
      ${x}
    </div>
    <ol class="steps" aria-label="Steps">${steps.map(([l, t], i) => `<li data-step-mark="${i}">${glyph(brand.mark, l, 'glyph')}<span>${t}</span></li>`).join('')}</ol>
    <div class="sheet-body" id="order-body" tabindex="-1"></div>
    <div class="sheet-foot" id="order-foot"></div>
  </div>
</dialog>
<dialog class="sheet sheet-small" id="delivery-sheet" aria-labelledby="delivery-title">
  <div class="sheet-inner">
    <div class="sheet-head"><h2 class="sheet-title" id="delivery-title">Delivery</h2>${x}</div>
    <div class="sheet-body">
      <p>Kuan’s counter carries a ${esc(business.ordering.delivery.provider)} “Order online” sign, but its ${esc(business.ordering.delivery.provider)} page is not confirmed yet, so this demo does not link to it.</p>
      <p>For now, call or message the shop to arrange an order.</p>
      <p class="fine"><span class="demo-tag">${esc(content.demo.label)}</span> The live site will open Kuan’s ${esc(business.ordering.delivery.provider)} page here.</p>
    </div>
    <div class="sheet-foot actions">
      <a class="btn btn-primary" href="tel:${esc(business.phone.tel)}">Call ${esc(business.phone.display)}</a>
      <a class="btn btn-line" href="${esc(business.messageUrl)}" target="_blank" rel="noopener">Message on Facebook</a>
    </div>
  </div>
</dialog>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;
}

export function renderPage(ctx) {
  const { business, content, theme } = ctx;
  if (!ctx.brand?.mark || !ctx.brand?.sculpture) throw new Error('quiet-form needs brand.js with `mark` and `sculpture`');
  return `<!doctype html>
<html lang="en" data-type="place">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(content.seo.title)}</title>
  <meta name="description" content="${esc(content.seo.description)}">
  <meta name="theme-color" content="${esc(theme.color.ground)}">
  <meta name="page-type" content="place">
  <meta name="page-kind" content="place">
  <meta name="site-kind" content="other">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(content.seo.title)}">
  <meta property="og:description" content="${esc(content.seo.description)}">
  <meta property="og:image" content="assets/img/share.jpg">
  <meta property="og:locale" content="${esc(business.site.locale)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/img/icon.png" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${esc(theme.font.googleHref)}">
  <style>${themeVars(theme)}</style>
  <link rel="stylesheet" href="site.css">
  <script>document.documentElement.classList.add('js');</script>
  <script type="application/ld+json">${jsonLd(ctx)}</script>
</head>
<body>
  <a class="skip" href="#menu">Skip to the menu</a>
  ${nav(ctx)}
  <main>
    ${hero(ctx)}
    ${place(ctx)}
    ${ritual(ctx)}
    ${menuSection(ctx)}
    ${order(ctx)}
    ${find(ctx)}
  </main>
  ${close(ctx)}
  ${actionBar(ctx)}
  ${dialogs(ctx)}
  <script type="application/json" id="store-data">${storeData(ctx)}</script>
  <script type="module" src="app.js"></script>
</body>
</html>
`;
}
