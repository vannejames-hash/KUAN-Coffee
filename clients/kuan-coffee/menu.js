// Transcribed from Kuan's own boards and menu graphic (see SOURCES.md). Prices in PHP, exactly as printed.
//
// Item fields:
//   id, name, price      price null = not readable on any board; shown as "Price pending", not orderable
//   detail               the board's own words in brackets or after the name
//   temp: true           hot or iced
//   choices              { label, options[] }, one required pick
//   photo                key in content.images
//
// Category fields: `line` is the site's own one-line introduction (written from the list itself, no claims); `note`
// is shown under it when the shop needs to say something. No category pictures; item photos appear only in the item
// sheet, when a row is opened.
// Coffee leads (client decision, 2026-11-11).

export default {
  currency: '₱',
  defaultCategory: 'espresso',

  categories: [
    {
      id: 'espresso',
      name: 'Espresso',
      line: 'From a single shot up.',
      note: 'Espresso prices are pending from the shop. Ask at the bar.',
      groups: [
        {
          label: 'Best sellers',
          items: [
            { id: 'spanish-latte', name: 'Spanish Latte', price: null },
            { id: 'mochaccino', name: 'Mochaccino', price: null },
            { id: 'caramel-macchiato', name: 'Caramel Macchiato', price: null },
          ],
        },
        // Listed before the bar so the one priced coffee sits near the top of the list.
        {
          label: 'By the shot',
          items: [
            { id: 'single-shot', name: 'Single Espresso Shot', price: 60 },
          ],
        },
        {
          label: 'At the bar',
          items: [
            { id: 'espresso', name: 'Espresso', price: null },
            { id: 'americano', name: 'Americano', price: null },
            { id: 'long-black', name: 'Long Black', price: null },
            { id: 'latte', name: 'Latte', price: null },
            { id: 'cortado', name: 'Cortado', price: null },
            { id: 'flat-white', name: 'Flat White', price: null },
          ],
        },
      ],
    },
    {
      id: 'non-espresso',
      name: 'Non-espresso',
      line: 'Milk drinks, without the shot.',
      note: null,
      groups: [
        {
          label: 'Milk drinks',
          items: [
            { id: 'strawberry', name: 'Strawberry', price: 150, temp: true },
            { id: 'matcha', name: 'Matcha', price: 155, temp: true },
            { id: 'choco-latte', name: 'Choco Latte', price: 135, temp: true },
            { id: 'signature-hot-cocoa', name: 'Signature Hot Cocoa', price: 140 },
          ],
        },
        {
          label: 'Also on the best-seller board',
          items: [
            { id: 'matcha-latte', name: 'Matcha Latte', price: null },
            { id: 'strawberry-latte', name: 'Strawberry Latte', price: null },
          ],
        },
      ],
    },
    {
      id: 'tea-soda',
      name: 'Tea & soda',
      line: 'Four seasons, six fruits.',
      note: null,
      groups: [
        {
          label: 'Tea',
          items: [
            { id: 'tea-spring', name: 'Spring', detail: 'tropical', price: 145 },
            { id: 'tea-summer', name: 'Summer', detail: 'mixed berries', price: 145 },
            { id: 'tea-autumn', name: 'Autumn', detail: 'lemon apple', price: 145 },
            { id: 'tea-winter', name: 'Winter', detail: 'lemon mint', price: 145 },
          ],
        },
        {
          label: 'Fruit soda',
          items: [
            { id: 'fruit-soda', name: 'Fruit Soda', price: 130, choices: { label: 'Flavour', options: ['Strawberry', 'Green Apple', 'Lychee', 'Blueberry', 'Passion Fruit', 'Raspberry'] } },
          ],
        },
      ],
    },
    {
      id: 'food',
      name: 'Food',
      line: 'Plates to stay for.',
      note: 'Traditional taste with a modern twist.',
      groups: [
        {
          label: 'Classic flavors',
          items: [
            { id: 'pancake', name: 'Pancake', price: 169, photo: 'pancake' },
            { id: 'hash-brown', name: 'Hash Brown', detail: 'with bacon and cheese', price: 219, photo: 'hashbrown' },
            { id: 'chicken-tapa', name: 'Homemade Chicken Tapa', price: 199, photo: 'tapa' },
            { id: 'sausage-egg', name: 'Sausage and Egg', price: 219, photo: 'sausage' },
            { id: 'sweet-sour-pork', name: 'Sweet & Sour Pork', price: 219, photo: 'sweetsour' },
            { id: 'bagnet', name: 'Bagnet', detail: 'with garlic rice and egg', price: 219, photo: 'bagnet' },
            { id: 'daing-na-bangus', name: 'Homemade Daing na Bangus', detail: 'with garlic rice and egg', price: 199, photo: 'bangus' },
            { id: 'pork-sisig', name: 'Pork Sisig', price: 199, photo: 'sisig' },
          ],
        },
        {
          label: 'Snacks',
          items: [
            { id: 'club-sandwich', name: 'Kuan Club Sandwich', price: 149 },
            { id: 'fries', name: 'Fries', price: 129 },
            { id: 'nachos', name: 'Nachos', price: 129 },
          ],
        },
      ],
    },
  ],

  // No add-ons are printed on the boards.
  addOns: [],
};
