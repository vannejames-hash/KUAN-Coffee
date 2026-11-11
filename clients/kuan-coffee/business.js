// Business facts. Every value comes from a source listed in SOURCES.md; `null` means unknown and the page hides it.
const MAPS_QUERY = encodeURIComponent('Kuan Coffee, Tagum');

export default {
  id: 'kuan-coffee',
  name: 'Kuan',
  fullName: 'Kuan Coffee',
  established: null,
  category: 'Neighborhood specialty coffee shop',
  bio: 'Neighborhood Specialty Coffee Shop',

  location: {
    street: null,
    road: 'Apokon Road',
    area: 'Apokon',
    city: 'Tagum City',
    province: 'Davao del Norte',
    country: 'PH',
    plusCode: 'CRR9+F3 Tagum',
    landmark: 'Pag-IBIG Fund, Tagum Branch',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`,
    embedUrl: `https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`,
  },

  timeZone: 'Asia/Manila',
  // Every day, 7 AM to 10 PM (Instagram bio).
  hours: { days: 'Every day', open: '07:00', close: '22:00' },

  phone: { display: '0960 270 8031', tel: '+639602708031' },
  email: 'kuancoffeeph@gmail.com',

  social: [
    { network: 'Instagram', handle: '@kuancoffeeph', url: 'https://www.instagram.com/kuancoffeeph/' },
    { network: 'Facebook', handle: 'kuancoffeeph', url: 'https://www.facebook.com/kuancoffeeph/' },
  ],
  messageUrl: 'https://m.me/kuancoffeeph',

  rating: { value: 4.7, count: 69, source: 'Google' },

  ordering: {
    dineIn: true,
    pickup: {
      enabled: true,
      // Slot length, lead time and days ahead are demo settings; the window follows the published hours.
      slotMinutes: 15,
      leadMinutes: 20,
      lastOrderMinutes: 30,
      daysAhead: 2,
    },
    delivery: {
      provider: 'foodpanda',
      // A foodpanda stand sits on the counter, but no foodpanda page is verified yet. Null opens the demo note.
      url: null,
    },
  },

  site: { url: null, locale: 'en_PH', demo: true },
};
