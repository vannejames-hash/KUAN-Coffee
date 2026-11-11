// The KUAN mark as four shapes, a trace of the shop's 149 px logo file made for this demo (SOURCES.md, Logo).
// Replace with the shop's own vector when it arrives; every use on the site reads from here.
//
// View box 312 x 325. Two columns (K/A at left, U/N at right) with a narrow gutter; two rows with a wider one.
// `poly` is the same outline as points (the U's arch sampled), clockwise, for the hero's 3D slabs.
const arc = (cx, cy, r, from, to, n) => Array.from({ length: n + 1 }, (_, i) => {
  const a = from + ((to - from) * i) / n;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
});

export const mark = {
  width: 312,
  height: 325,
  pieces: {
    // A block with a V cut into its right side.
    K: { d: 'M15 0H128L102 68L157 135H15Z', out: [-1, -0.8], poly: [[15, 0], [128, 0], [102, 68], [157, 135], [15, 135]] },
    // A solid arch: a cup seen from the side.
    U: { d: 'M165 0H305V70A70 70 0 0 1 165 70Z', out: [1, -0.8], poly: [[165, 0], [305, 0], ...arc(235, 70, 70, 0, Math.PI, 20)] },
    // A plain triangle.
    A: { d: 'M90 187L165 325H0Z', out: [-1, 0.8], poly: [[90, 187], [165, 325], [0, 325]] },
    // A square with a wedge cut from its top.
    N: { d: 'M175 187H211L246 237V187H312V325H175Z', out: [1, 0.8], poly: [[175, 187], [211, 187], [246, 237], [246, 187], [312, 187], [312, 325], [175, 325]] },
  },
};

// The hero composition: four thin white forms, large, read first as flat shapes on cobalt. Offsets in mark units,
// rotations in degrees, hand-set: the U steps forward over the K's corner, the N over the A's, nothing symmetric.
// `thickness` is only an edge: enough to separate one form from another where they overlap.
// The hero composition: four flat forms, each set at its own angle, as if placed by hand. No edge slab, no shadow;
// a hairline outline and a few degrees of perspective per form are the only depth. `sway` is how far (degrees) each
// form turns with the pointer, so no two answer alike. `narrow` recomposes them for phones.
export const sculpture = {
  thickness: 0,
  tilt: { rx: 2, ry: -3 },
  pieces: {
    K: { dx: -6, dy: 16, dz: 10, rx: 3, ry: -5, rz: -11, sway: 1.1 },
    U: { dx: 2, dy: 18, dz: 24, rx: -4, ry: 4, rz: 9, sway: -0.8 },
    A: { dx: 8, dy: -12, dz: 0, rx: 2, ry: 6, rz: 16, sway: 1.6 },
    N: { dx: 0, dy: -24, dz: 16, rx: -2, ry: -3, rz: -3, sway: 0.5 },
  },
  narrow: {
    scale: 1.32,
    pieces: {
      K: { dx: -4, dy: 14, dz: 10, rx: 2, ry: -4, rz: -8, sway: 1.1 },
      U: { dx: 4, dy: 14, dz: 24, rx: -3, ry: 3, rz: 11, sway: -0.8 },
      A: { dx: 6, dy: -10, dz: 0, rx: 2, ry: 4, rz: 13, sway: 1.6 },
      N: { dx: 2, dy: -20, dz: 16, rx: -2, ry: -2, rz: -4, sway: 0.5 },
    },
  },
};

export const order = ['K', 'U', 'A', 'N'];
