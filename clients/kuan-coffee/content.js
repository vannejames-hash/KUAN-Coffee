// Copy, image slots and drawings. Facts live in business.js and menu.js; this file only says and shows them.
const img = (base, widths, alt, enhanced = false) => ({ base, widths, alt, enhanced });

export default {
  seo: {
    title: 'Kuan Coffee · Neighborhood specialty coffee in Apokon, Tagum City',
    description: 'Kuan Coffee is a neighborhood specialty coffee shop on Apokon Road, Tagum City. Espresso, tea, fruit soda and classic plates, every day from 7 AM to 10 PM. Order ahead for pickup.',
  },

  nav: [
    { href: '#place', label: 'The place' },
    { href: '#ritual', label: 'Coffee' },
    { href: '#menu', label: 'Menu' },
    { href: '#find', label: 'Find us' },
  ],

  hero: {
    label: 'Neighborhood specialty coffee · Apokon, Tagum City',
    title: 'Specialty coffee and a full table, from seven to ten.',
    lede: 'Kuan is a neighborhood coffee shop on Apokon Road in Tagum City. Espresso and tea at the bar, classic plates from the kitchen, and tables to stay at.',
    primary: 'Order ahead',
    // Says what the button does today: no foodpanda link is verified yet. Becomes "Get it delivered" with a link.
    secondary: 'Call for delivery',
    note: 'Order ahead, collect at the counter. Every day, 7:00 AM to 10:00 PM.',
  },

  place: {
    number: '01',
    label: 'The place',
    title: 'Somewhere to stay a while.',
    intro: 'Kuan opens at seven and closes at ten, every day. Fifteen hours of a concrete counter, window light, and tables inside and out on the porch.',
    // Six photographs set as one collage, numbered; the legend under it names each one.
    shots: [
      { n: '01', verb: 'Arrive', label: 'Apokon Road', image: 'placeFront', at: 'front' },
      { n: '02', verb: 'Order', label: 'The concrete counter', image: 'placeCounter', at: 'counter' },
      { n: '03', verb: 'Look up', label: 'The sign', image: 'placeSign', at: 'sign' },
      { n: '04', verb: 'Watch', label: 'The machine at the bar', image: 'placeMachine', at: 'machine' },
      { n: '05', verb: 'Meet', label: 'At the bar', image: 'placeBar', at: 'bar' },
      { n: '06', verb: 'Stay', label: 'The Classic Flavors table', image: 'placeTable', at: 'table' },
    ],
    rows: [
      { glyph: 'K', title: 'Mornings', text: 'Doors at 7:00 AM, with pancakes, tapa and garlic-rice plates on the menu.' },
      { glyph: 'U', title: 'The bar', text: 'Espresso, four teas named for the seasons, six fruit sodas and a signature hot cocoa.' },
      { glyph: 'A', title: 'Evenings', text: 'Open until 10:00 PM, with string lights strung out front.' },
      { glyph: 'N', title: 'Gatherings', text: 'The room has hosted candle-making. Instagram says what is on next.' },
    ],
  },

  ritual: {
    number: '02',
    label: 'The ritual',
    title: 'Three steps between the bean and the cup.',
    steps: [
      { n: '01', title: 'Grind', text: 'Fine enough for espresso, ground at the bar.' },
      { n: '02', title: 'Pull', text: 'One shot: the base of everything on the espresso board.' },
      { n: '03', title: 'Pour', text: 'Then milk, ice, water or nothing at all.' },
    ],
    endLabel: 'The cup',
    endTitle: 'Then it is yours.',
    endText: 'A latte, a cortado, a long black, or the single shot on its own.',
    endAdd: { item: 'single-shot', label: 'Add a single shot' },
    endLink: 'See the espresso list',
  },

  menu: {
    number: '03',
    label: 'The menu',
    title: 'Everything on Kuan’s boards.',
    intro: 'Four lists, coffee first. Prices exactly as printed at the counter.',
    pending: 'Price pending',
    ask: 'Ask at the bar',
    add: 'Add',
    next: 'Next list',
  },

  order: {
    number: '04',
    label: 'Order',
    title: 'Three ways to get it.',
    ways: [
      { id: 'pickup', glyph: 'U', title: 'Order ahead', text: 'Choose your plates and drinks, pick a time, collect at the counter.', action: 'Order ahead' },
      { id: 'delivery', glyph: 'A', title: 'Delivery', text: 'The counter carries a foodpanda sign. Until its link is confirmed, call or message the shop.', action: 'Call for delivery' },
      { id: 'dinein', glyph: 'N', title: 'Walk in', text: 'Any day from 7:00 AM to 10:00 PM. Tables inside and on the porch.', action: 'Get directions' },
    ],
  },

  find: {
    number: '05',
    label: 'Find Kuan',
    title: 'On Apokon Road, Tagum City.',
    big: 'CRR9+F3',
    bigNote: 'Kuan’s plus code. Paste it into Google Maps.',
    primary: 'Get directions',
    secondary: 'Show the live map',
    // A schematic of the neighborhood, drawn from Google Maps' map view (2026-11-11). Not to scale; the order of
    // things is what matters: Pag-IBIG next door, the turn east toward City Hall just south, Bermudez St further down.
    map: {
      view: [720, 480],
      // Labels stay between x 100 and 620 so a phone's narrower crop of the drawing keeps them whole.
      area: { d: 'M420 30H660V214L470 238Z', label: 'Civic center', at: [452, 56] },
      river: { d: 'M694 -10C702 120 684 240 700 360S692 470 704 490', label: 'Hijo River', at: [676, 300] },
      roads: [
        { d: 'M60 -20L600 500', cls: 'road', label: 'Apokon Road', at: [452, 400], angle: 43.9 },
        { d: 'M345 254L740 232', cls: 'road road-minor', label: 'To City Hall', at: [452, 232], angle: -3.2 },
        { d: 'M20 254L740 449', cls: 'road road-minor', label: 'Macario P. Bermudez St', at: [112, 263], angle: 15.1 },
      ],
      landmarks: [
        { glyph: 'A', label: 'Pag-IBIG Fund', at: [288, 96], size: [62, 44] },
        { glyph: 'N', label: 'Tagum City Hall', at: [500, 124], size: [64, 48] },
      ],
      pin: [318, 168],
      route: 'M60 -20L332 242L346 234',
      north: [112, 28],
    },
  },

  close: {
    title: 'See you at Kuan.',
    action: 'Order ahead',
  },

  demo: {
    label: 'Demo',
    note: 'A demo storefront made for Kuan Coffee. Orders stay on this device and are not sent to the shop.',
  },

  credits: {
    intro: 'The photographs show Kuan Coffee. All are enhanced for the web (sharpened and relit; the shopfront is shown by day), and the two bar photographs are cropped clear of equipment logos. They are cropped and resized here. The KUAN mark is a trace of the shop’s logo, made for this demo.',
  },

  images: {
    pancake: img('photo-spread-pancake', [240, 420], 'Pancakes with syrup and butter on a brown stoneware plate', true),
    hashbrown: img('photo-spread-hashbrown', [240, 390], 'Hash browns with melted cheese and bacon', true),
    tapa: img('photo-spread-tapa', [240, 390], 'Chicken tapa, garlic rice and a fried egg in a clay bowl', true),
    sausage: img('photo-spread-sausage', [240, 320], 'Sausages, a fried egg and tomatoes on a blue-glazed plate', true),
    sweetsour: img('photo-spread-sweetsour', [240, 330], 'Sweet and sour pork in a stoneware bowl', true),
    bagnet: img('photo-spread-bagnet', [240, 350], 'Bagnet with garlic chips and a fried egg', true),
    bangus: img('photo-spread-bangus', [240, 330], 'Daing na bangus with garlic rice on a dark blue plate', true),
    sisig: img('photo-spread-sisig', [240, 300], 'Pork sisig, garlic rice and a fried egg', true),
    placeFront: img('photo-place-front', [640, 1200], 'Kuan’s shopfront on Apokon Road by day: the KUAN COFFEE sign over the canopy, folding chairs on the porch', true),
    placeSign: img('photo-place-sign', [320, 640], 'The KUAN sign up close, black letters on white above the blue COFFEE box', true),
    placeCounter: img('photo-place-counter', [480, 900], 'The concrete counter: an espresso machine stacked with paper cups under brass pendant lamps, the word kuan on the concrete wall', true),
    placeMachine: img('photo-place-machine', [320, 520], 'A portafilter resting on the drip tray of a stainless steel espresso machine', true),
    placeBar: img('photo-place-bar', [320, 640], 'Two people at the bar, one in a denim apron, smiling over a small steel cup', true),
    placeTable: img('photo-place-table', [320, 640], 'Kuan’s Classic Flavors plates spread across a wood table', true),
  },
};
