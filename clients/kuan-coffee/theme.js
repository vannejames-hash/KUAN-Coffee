// Kuan's colour comes from the building, not a mood board: concrete, black window frames, warm wood tables, and the
// cobalt of the logo and the lit "COFFEE" band over the door. Cobalt is the one accent: the mark, the selected state,
// links and focus. It never fills more than one band at a time.
export default {
  // UI kit in kits/<kit>/ (the default `src/` kit is Bean O' Clock's storefront).
  kit: 'quiet-form',

  color: {
    brand: '#10059F', // sampled from the logo file
    brandDeep: '#0A0370',
    brandSoft: '#DCDAF2',
    ink: '#16130F', // the window frames, the espresso machine
    inkSoft: '#5E5850',
    ground: '#F5F2EC', // warm off-white
    paper: '#FBFAF6',
    concrete: '#E3DFD7', // the counter and walls
    concreteDeep: '#C9C4BA',
    wood: '#6E4B32', // the tables
    crema: '#C9A27A',
    night: '#15120F',
    onNight: '#F1ECE3',
    onNightSoft: '#A39B8F',
    line: 'rgba(22, 19, 15, 0.14)',
    lineStrong: 'rgba(22, 19, 15, 0.32)',
    lineOnNight: 'rgba(241, 236, 227, 0.2)',
  },

  font: {
    // Display: Funnel Display, a contemporary grotesk whose cut terminals echo the wedges in the mark.
    // Text: Funnel Sans, its quiet sibling. Accent: DM Mono for hours, prices and labels, like a drawing's title block.
    googleHref: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Funnel+Display:wght@400;500;600&family=Funnel+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap',
    display: 'Funnel Display',
    text: 'Funnel Sans',
    mono: 'DM Mono',
  },
};
