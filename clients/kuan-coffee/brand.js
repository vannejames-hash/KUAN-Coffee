// The KUAN mark as four shapes, a trace of the shop's 149 px logo file made for this demo (SOURCES.md, Logo).
// Replace with the shop's own vector when it arrives; every use on the site reads from here.
//
// View box 312 x 325. Two columns (K/A at left, U/N at right) with a narrow gutter; two rows with a wider one.
export const mark = {
  width: 312,
  height: 325,
  pieces: {
    // A block with a V cut into its right side.
    K: { d: 'M15 0H128L102 68L157 135H15Z', out: [-1, -0.8] },
    // A solid arch: a cup seen from the side.
    U: { d: 'M165 0H305V70A70 70 0 0 1 165 70Z', out: [1, -0.8] },
    // A plain triangle.
    A: { d: 'M90 187L165 325H0Z', out: [-1, 0.8] },
    // A square with a wedge cut from its top.
    N: { d: 'M175 187H211L246 237V187H312V325H175Z', out: [1, 0.8] },
  },
};

export const order = ['K', 'U', 'A', 'N'];
