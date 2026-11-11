// Quiet form: the page's one module. Sculpture, menu, cart and order sheet, ritual line, wayfinding, clock.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const data = JSON.parse($('#store-data').textContent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => `${data.currency}${n.toLocaleString('en-PH')}`;
const store = {
  get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off: the order still works for this visit */ } },
};

const items = new Map();
for (const c of data.categories) for (const g of c.groups) for (const it of g.items) items.set(it.id, { ...it, cat: c.id });

/* ---------- Time in Tagum ---------- */
const toMins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const fmt = (mins) => { const h = Math.floor(mins / 60) % 24; const m = mins % 60; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const OPEN = toMins(data.hours.open);
const CLOSE = toMins(data.hours.close);
function manila(date = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: data.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, mins: +p.hour * 60 + +p.minute };
}
function tick() {
  const now = manila();
  const open = now.mins >= OPEN && now.mins < CLOSE;
  const status = open ? `Open now · until ${fmt(CLOSE)}` : `Closed · opens ${fmt(OPEN)}`;
  $$('[data-clock]').forEach((el) => { el.textContent = fmt(now.mins); });
  $$('[data-status]').forEach((el) => { el.textContent = status; });
}
tick();
setInterval(tick, 20000);

/* ---------- Entrance, nav ---------- */
requestAnimationFrame(() => document.body.classList.add('is-entered'));
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Toast ---------- */
const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { toastEl.hidden = true; }, 2400);
}

/* ---------- Hero: the mark as four white forms on the cobalt field ----------
   A tiny projector: each letter is a flat form set at its own angle (data.sculpture), with a few degrees of its own
   perspective, a hairline edge and no shadow. Phones get their own composition. On load the flat logo eases in. */
const SC = data.sculpture;
const stage = $('.sculpt-stage');
const NS = 'http://www.w3.org/2000/svg';
const D2R = Math.PI / 180;
const PERSP = 1150;
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const LIGHT = norm([-0.5, -0.72, 0.6]);
const mix = (a, b, t) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
// Flat warm white faces; the edge is the same material a shade darker, only ever a sliver. No shadows.
const SIDE_DARK = [196, 189, 176];
const SIDE_LIT = [226, 221, 211];
const FACE_DARK = [241, 238, 231];
const FACE_LIT = [251, 250, 246];
function rot([x, y, z], rx, ry, rz) {
  let c = Math.cos(rz * D2R); let s = Math.sin(rz * D2R);
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(rx * D2R); s = Math.sin(rx * D2R);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry * D2R); s = Math.sin(ry * D2R);
  [x, z] = [x * c + z * s, -x * s + z * c];
  return [x, y, z];
}
const pathOf = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
const make = (tag, cls) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); return e; };

const narrowMQ = matchMedia('(max-width: 760px)');
const poseFor = (l) => (narrowMQ.matches && SC.narrow ? SC.narrow.pieces[l] : SC.pieces[l]);
const scaleNow = () => (narrowMQ.matches && SC.narrow ? SC.narrow.scale : SC.scale);

const sculpt = (() => {
  if (!stage) return null;
  const piecesG = $('.sp-pieces', stage);
  const hint = $('[data-hint]');
  const letters = Object.keys(SC.polys);
  const mcx = SC.markW / 2;
  const mcy = SC.markH / 2;
  const parts = letters.map((l, i) => {
    const pts = SC.polys[l];
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const local = pts.map(([x, y]) => [x - cx, y - cy]);
    const normals = local.map((a, k) => { const b = local[(k + 1) % local.length]; const n = norm([b[1] - a[1], -(b[0] - a[0])]); return [n[0], n[1], 0]; });
    const g = make('g', 'sp-piece');
    g.dataset.piece = l;
    const sides = local.map(() => make('path', 'sp-side'));
    const front = make('path', 'sp-front');
    return { l, cx, cy, local, normals, g, sides, front, order: '', pose: poseFor(l), phase: i * 1.9 + 0.4, z: 0, vz: 0, rz: 0, vrz: 0, lift: 0, liftTo: 0, turn: 0, turnTo: 0 };
  });

  let m = 0;
  const aim = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let t = 0;
  let built = false;

  function build() {
    $('.sp-flat', piecesG)?.remove();
    for (const p of parts) { p.sides.forEach((s) => p.g.append(s)); p.g.append(p.front); piecesG.append(p.g); }
    narrowMQ.addEventListener?.('change', () => { parts.forEach((p) => { p.pose = poseFor(p.l); }); render(); });
    built = true;
  }

  function render() {
    const S = scaleNow();
    const T = SC.thickness * m;
    // Barely-there drift: long, different periods per form, a unit or so of travel, a quarter degree of turn.
    const gx = m * (SC.tilt.rx - cur.y * 2.5) + (m * 0.35 * Math.sin((t * 2 * Math.PI) / 19));
    const gy = m * (SC.tilt.ry + cur.x * 3.5) + (m * 0.5 * Math.sin((t * 2 * Math.PI) / 17 + 1));
    const placed = parts.map((p) => {
      const ps = p.pose;
      const fy = m * 1.3 * Math.sin((t * 2 * Math.PI) / (11.4 + p.phase) + p.phase);
      const frz = m * 0.25 * Math.sin((t * 2 * Math.PI) / (14.2 + p.phase) + p.phase * 1.3);
      const fz = m * 1.8 * Math.sin((t * 2 * Math.PI) / (12.6 + p.phase) + p.phase * 0.7);
      // Parallax by depth: forms nearer the viewer travel further with the pointer.
      const depth = (ps.dz + 8) * 0.09;
      const prx = m * ps.rx;
      const pry = m * ps.ry;
      // Each form turns its own amount with the pointer (sway), so the group never moves as one sheet.
      const prz = m * (ps.rz + cur.x * (ps.sway || 0)) + frz + p.rz + p.turn;
      const off = [p.cx - mcx + m * (ps.dx + cur.x * depth), p.cy - mcy + m * (ps.dy + cur.y * depth) + fy, m * ps.dz + fz + p.z + p.lift];
      const toWorld = (v) => {
        const r = rot(v, prx, pry, prz);
        const w = rot([r[0] + off[0], r[1] + off[1], r[2] + off[2]], gx, gy, 0);
        return [w[0] * S, w[1] * S, w[2] * S];
      };
      const project = (w) => { const f = PERSP / (PERSP - w[2]); return [SC.cx + w[0] * f, SC.cy + w[1] * f]; };
      const F = p.local.map(([x, y]) => toWorld([x, y, T / 2]));
      const B = p.local.map(([x, y]) => toWorld([x, y, -T / 2]));
      const F2 = F.map(project);
      const B2 = B.map(project);
      const dirOf = (n) => rot(rot(n, prx, pry, prz), gx, gy, 0);
      const nF = dirOf([0, 0, 1]);
      p.front.setAttribute('d', pathOf(F2));
      p.front.style.fill = mix(FACE_DARK, FACE_LIT, Math.min(1, Math.max(0, nF[0] * LIGHT[0] + nF[1] * LIGHT[1] + nF[2] * LIGHT[2]) * 1.15));
      const visible = [];
      p.sides.forEach((side, k) => {
        const n = dirOf(p.normals[k]);
        if (T < 0.2 || n[2] < 0.015) { side.setAttribute('d', ''); return; }
        const k2 = (k + 1) % p.local.length;
        side.setAttribute('d', pathOf([F2[k], F2[k2], B2[k2], B2[k]]));
        const c = mix(SIDE_DARK, SIDE_LIT, Math.min(1, Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])));
        side.style.fill = c;
        side.style.stroke = c;
        visible.push([k, (F[k][2] + F[k2][2] + B[k][2] + B[k2][2]) / 4]);
      });
      const ord = visible.sort((a, b) => a[1] - b[1]).map((v) => v[0]).join(',');
      if (ord !== p.order) { p.order = ord; visible.forEach(([k]) => p.g.insertBefore(p.sides[k], p.front)); }
      return [p, F.reduce((s, w) => s + w[2], 0) / F.length];
    });
    placed.sort((a, b) => a[1] - b[1]).forEach(([p], i) => { if (piecesG.children[i] !== p.g) piecesG.append(p.g); });
  }

  // Physics for a press: fixed-step springs, so a lift always settles the same way.
  const STEP = 1 / 120;
  let acc = 0;
  function physics(dt) {
    acc += Math.min(dt, 0.05);
    while (acc >= STEP) {
      for (const p of parts) {
        // Heavy and slightly underdamped: a pressed form travels, overshoots a touch, and settles.
        p.vz += (-60 * p.z - 10 * p.vz) * STEP; p.z += p.vz * STEP;
        p.vrz += (-60 * p.rz - 9.5 * p.vrz) * STEP; p.rz += p.vrz * STEP;
        p.lift += (p.liftTo - p.lift) * 0.025;
        p.turn += (p.turnTo - p.turn) * 0.025;
      }
      acc -= STEP;
    }
  }
  let next = 0;
  function act(letter) {
    if (reduce.matches || m < 0.95) return;
    const target = parts.find((p) => p.l === letter) || parts[next++ % parts.length];
    const dir = Math.random() < 0.5 ? -1 : 1;
    const k = narrowMQ.matches ? 0.65 : 1;
    target.vz += 110 * k;
    target.vrz += dir * (24 + Math.random() * 8) * k;
    hint?.classList.remove('is-nudging');
  }

  let running = false;
  let visible = true;
  let last = 0;
  let introStart = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2);
  function frame(now) {
    if (!running) return;
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    t += dt;
    if (m < 1) m = ease(Math.min(1, Math.max(0, (now - introStart) / 2000)));
    cur.x += (aim.x - cur.x) * 0.035;
    cur.y += (aim.y - cur.y) * 0.035;
    physics(dt);
    render();
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduce.matches || !visible || document.hidden) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }
  const stop = () => { running = false; };

  function init() {
    build();
    if (reduce.matches) { m = 1; render(); return; }
    introStart = performance.now() + 380;
    render();
    start();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }).observe(stage);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }
  reduce.addEventListener?.('change', () => { if (reduce.matches) { stop(); m = 1; t = 0; aim.x = aim.y = cur.x = cur.y = 0; render(); } else start(); });

  // Pointer: the group tilts toward the cursor; the piece under it lifts a little; the faint pattern drifts.
  const drift = $('.sculpt-pattern [data-drift]', stage);
  let hovered = null;
  stage.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduce.matches) return;
    const r = stage.getBoundingClientRect();
    aim.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    aim.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    if (drift) drift.style.transform = `translate(${(-aim.x * 7).toFixed(1)}px, ${(-aim.y * 7).toFixed(1)}px)`;
    const over = e.target.closest?.('[data-piece]')?.dataset.piece || null;
    if (over !== hovered) { hovered = over; parts.forEach((p) => { const on = p.l === over; p.liftTo = on ? 4 : 0; p.turnTo = on ? (p.pose.rz < 0 ? -2.2 : 2.2) : 0; }); }
  });
  stage.addEventListener('pointerleave', () => {
    aim.x = 0; aim.y = 0; hovered = null;
    parts.forEach((p) => { p.liftTo = 0; p.turnTo = 0; });
    if (drift) drift.style.transform = '';
  });
  let skipClick = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button === 0) { skipClick = true; act(e.target.closest?.('[data-piece]')?.dataset.piece); }
  });
  stage.addEventListener('click', (e) => {
    if (skipClick) { skipClick = false; return; }
    act(e.target.closest?.('[data-piece]')?.dataset.piece);
  });

  // On touch screens, say the mark can be played with, once.
  if (hint) {
    const touch = matchMedia('(hover: none)').matches;
    if (touch) $('[data-hint-text]', hint).textContent = hint.dataset.touch;
    if (touch && !store.get('kuan-nudged', false)) {
      setTimeout(() => hint.classList.add('is-nudging'), 2600);
      store.set('kuan-nudged', true);
    }
  }

  init();
  return { act, built: () => built };
})();

/* ---------- Small discoveries: photos shift in their frames, pattern fragments drift ---------- */
$$('[data-crop]').forEach((frame) => {
  frame.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduce.matches) return;
    const r = frame.getBoundingClientRect();
    frame.style.setProperty('--px', `${(((e.clientX - r.left) / r.width) - 0.5) * -12}px`);
    frame.style.setProperty('--py', `${(((e.clientY - r.top) / r.height) - 0.5) * -9}px`);
  });
  frame.addEventListener('pointerleave', () => { frame.style.setProperty('--px', '0px'); frame.style.setProperty('--py', '0px'); });
});
$$('.place, .close').forEach((sec) => {
  const drift = $('.pattern [data-drift]', sec);
  if (!drift) return;
  sec.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduce.matches) return;
    const r = sec.getBoundingClientRect();
    drift.style.transform = `translate(${((((e.clientX - r.left) / r.width) - 0.5) * -14).toFixed(1)}px, ${((((e.clientY - r.top) / r.height) - 0.5) * -10).toFixed(1)}px)`;
  });
  sec.addEventListener('pointerleave', () => { drift.style.transform = ''; });
});

/* ---------- Ritual: one line runs grind → pull → pour → cup, once, when the section comes into view ----------
   Not tied to scroll distance: entry starts a ~1.2s run of the line; each figure draws as the head reaches it and the
   cup fills last, so the whole story has landed by about 1.4s while the section is still on screen. */
const ritualStage = $('[data-ritual]');
if (ritualStage) {
  const marks = [...$$('.step', ritualStage), $('.ritual-end', ritualStage)];
  const set = (p) => {
    ritualStage.style.setProperty('--p', p.toFixed(3));
    ritualStage.classList.toggle('is-done', p >= 0.999);
    // Grind at ~0.15s, pull ~0.45s, pour ~0.75s, the cup ~1.05s.
    marks.forEach((mk, i) => mk.classList.toggle('on', p >= [0.02, 0.36, 0.64, 0.9][i]));
  };
  const RUN = 1200;
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);
  const play = () => {
    if (reduce.matches) { set(1); return; }
    const t0 = performance.now();
    const step = (now) => {
      const x = Math.min(1, Math.max(0, (now - t0) / RUN));
      set(ease(x));
      if (x < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  set(reduce.matches ? 1 : 0);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.25, rootMargin: '0px 0px -12% 0px' });
  io.observe(ritualStage);
}

/* ---------- Phone hero: a tap on one of the four forms nudges it and lets it settle ---------- */
$$('.hf-shape').forEach((el) => {
  el.addEventListener('pointerdown', () => {
    if (reduce.matches) return;
    el.classList.remove('is-nudged');
    void el.getBoundingClientRect();
    el.classList.add('is-nudged');
  });
  el.addEventListener('animationend', () => el.classList.remove('is-nudged'));
});

/* ---------- Menu signature: the four forms in a row. A tap nudges a form and lets it return; it selects nothing. ---------- */
$$('.mark-row .mr-shape').forEach((el) => {
  el.addEventListener('click', () => {
    if (reduce.matches) return;
    el.classList.remove('is-nudged');
    void el.getBoundingClientRect();
    el.classList.add('is-nudged');
  });
  el.addEventListener('animationend', () => el.classList.remove('is-nudged'));
});

/* ---------- Menu: four lists, coffee first ---------- */
const selector = $('[role="tablist"]');
const tabs = $$('[role="tab"]');
const panels = $$('[role="tabpanel"]');
let currentCat = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.cat;
let swapT;
function selectCat(id, { focus = false, scroll = false, record = true } = {}) {
  const tab = tabs.find((t) => t.dataset.cat === id);
  if (!tab) return;
  if (focus) tab.focus();
  if (scroll) $('#menu').scrollIntoView({ behavior: reduce.matches || scroll === 'instant' ? 'auto' : 'smooth' });
  if (id === currentCat) return;
  const next = $(`#panel-${id}`);
  tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  currentCat = id;
  if (record) history.replaceState(null, '', `#cat-${id}`);
  clearTimeout(swapT);
  panels.forEach((p) => p.classList.remove('is-leaving', 'is-entering'));
  const visiblePanel = panels.find((p) => !p.hidden);
  const show = () => {
    panels.forEach((p) => { p.hidden = p !== next; p.classList.remove('is-leaving'); });
    if (!reduce.matches) {
      next.classList.add('is-entering');
      next.addEventListener('animationend', () => next.classList.remove('is-entering'), { once: true });
    }
  };
  if (reduce.matches || !visiblePanel || visiblePanel === next) show();
  else { visiblePanel.classList.add('is-leaving'); swapT = setTimeout(show, 120); }
}
tabs.forEach((t) => t.addEventListener('click', () => selectCat(t.dataset.cat)));
selector?.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const n = tabs.length;
  const cols = getComputedStyle(selector).gridTemplateColumns.split(' ').length;
  const map = cols > 1
    ? { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, ArrowDown: i + cols < n ? i + cols : i, ArrowUp: i - cols >= 0 ? i - cols : i }
    : { ArrowDown: (i + 1) % n, ArrowRight: (i + 1) % n, ArrowUp: (i + n - 1) % n, ArrowLeft: (i + n - 1) % n };
  const j = { ...map, Home: 0, End: n - 1 }[e.key];
  if (j === undefined) return;
  e.preventDefault();
  selectCat(tabs[j].dataset.cat, { focus: true });
});
function fromHash(first) {
  const m = location.hash.match(/^#cat-([\w-]+)$/);
  if (m) selectCat(m[1], { scroll: first === true ? 'instant' : true, record: false });
}
addEventListener('hashchange', fromHash);
fromHash(true);

/* ---------- Cart ---------- */
let cart = store.get('kuan-cart', []).filter((l) => typeof items.get(l.id)?.price === 'number' && l.qty > 0);
const lineKey = (id, temp, choice) => [id, temp || '', choice || ''].join('|');
const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
const cartTotal = () => cart.reduce((n, l) => n + items.get(l.id).price * l.qty, 0);
const lineMeta = (l) => [l.temp, l.choice].filter(Boolean).join(' · ');
function renderCount() {
  const n = cartCount();
  $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
}
function bump() {
  $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
}
function saveCart() { store.set('kuan-cart', cart); renderCount(); }
function addToCart(id, { qty = 1, temp = null, choice = null } = {}) {
  const key = lineKey(id, temp, choice);
  const line = cart.find((l) => l.key === key);
  if (line) line.qty += qty; else cart.push({ key, id, qty, temp, choice });
  saveCart();
  bump();
}
renderCount();

function confirmAdd(btn, it, qty, meta) {
  if (btn) {
    btn.classList.add('is-added');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => btn.classList.remove('is-added'), 1400);
  }
  toast(`Added ${qty > 1 ? `${qty} × ` : ''}${it.name}${meta ? ` (${meta})` : ''}`);
}

// The add button adds at once when there is nothing to choose; a tap on the row opens the item to choose a quantity.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]');
  if (b) {
    const it = items.get(b.dataset.add);
    if (it.temp || it.choices) openItem(it, b);
    else { addToCart(it.id); confirmAdd(b, it, 1); }
    return;
  }
  const row = e.target.closest('.item[data-item]');
  if (row) { openItem(items.get(row.dataset.item), $('[data-add]', row)); return; }
  // An unpriced row answers a tap too: it says where to ask.
  const pending = e.target.closest('.item.is-pending');
  if (pending) {
    pending.classList.add('is-tapped');
    clearTimeout(pending._t);
    pending._t = setTimeout(() => pending.classList.remove('is-tapped'), 2600);
  }
  const nextList = e.target.closest('[data-next-cat]');
  if (nextList) selectCat(nextList.dataset.nextCat, { scroll: true, focus: true });
});

/* ---------- Dialog plumbing ---------- */
$$('dialog').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
});

/* ---------- Item sheet: temperature, flavour, quantity ---------- */
const itemSheet = $('#item-sheet');
const itemForm = $('#item-form');
const itemBody = $('#item-body');
const itemAdd = $('#item-add');
let sheet = null;
const chipSet = (name, legendText, options) => `<fieldset class="field-set"><legend>${esc(legendText)}</legend><div class="chips">${options.map((o) => `<label class="chip"><input type="radio" name="${name}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div><p class="field-error" id="err-${name}"></p></fieldset>`;
function openItem(it, btn) {
  sheet = { it, btn, qty: 1 };
  $('#item-title').textContent = it.name;
  const ph = data.itemPhotos[it.id];
  itemBody.innerHTML = `${ph ? `<div class="sheet-photo"><img src="${esc(ph.src)}" alt="${esc(ph.alt)}"></div>` : ''}<p class="total">${money(it.price)}${it.detail ? ` <span class="item-detail">· ${esc(it.detail)}</span>` : ''}</p>
    ${it.temp ? chipSet('temp', 'Hot or iced', ['Hot', 'Iced']) : ''}
    ${it.choices ? chipSet('choice', it.choices.label, it.choices.options) : ''}
    <div class="row-between"><span class="label">Quantity</span><div class="stepper"><button type="button" data-q="-1" aria-label="One fewer">−</button><output id="item-qty" aria-live="polite">1</output><button type="button" data-q="1" aria-label="One more">+</button></div></div>`;
  updateItem();
  itemSheet.showModal();
}
function updateItem() {
  $('#item-qty').textContent = sheet.qty;
  itemAdd.textContent = `Add to order · ${money(sheet.it.price * sheet.qty)}`;
}
itemBody.addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]');
  if (!q) return;
  sheet.qty = Math.max(1, Math.min(20, sheet.qty + Number(q.dataset.q)));
  updateItem();
});
itemBody.addEventListener('change', (e) => { const err = $(`#err-${e.target.name}`); if (err) err.textContent = ''; });
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(itemForm);
  const temp = fd.get('temp');
  const choice = fd.get('choice');
  let ok = true;
  if (sheet.it.temp && !temp) { $('#err-temp').textContent = 'Choose hot or iced.'; ok = false; }
  if (sheet.it.choices && !choice) { $('#err-choice').textContent = `Choose a ${sheet.it.choices.label.toLowerCase()}.`; ok = false; }
  if (!ok) { itemBody.querySelector('.field-error:not(:empty)')?.closest('fieldset')?.querySelector('input')?.focus(); return; }
  addToCart(sheet.it.id, { qty: sheet.qty, temp, choice });
  itemSheet.close();
  confirmAdd(sheet.btn, sheet.it, sheet.qty, [temp, choice].filter(Boolean).join(', '));
});

/* ---------- Order sheet: order → time → details → review → done ---------- */
const orderSheet = $('#order-sheet');
const ob = $('#order-body');
const of = $('#order-foot');
const stepMarks = $$('[data-step-mark]');
const glyphHTML = (i) => stepMarks[i].querySelector('svg').outerHTML;
const pick = { day: null, slot: null, ...store.get('kuan-details', { name: '', mobile: '' }) };
let step = 0;

// With nothing chosen yet, "Order ahead" goes to the menu rather than an empty sheet.
function openOrder() {
  if (!cart.length) {
    $('#menu').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
    tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.focus({ preventScroll: true });
    toast('Choose plates and drinks first, then pick a time.');
    return;
  }
  step = 0;
  renderStep();
  orderSheet.showModal();
}
$$('[data-open-order]').forEach((b) => b.addEventListener('click', openOrder));

function go(n) { step = n; renderStep(); ob.scrollTop = 0; ob.focus({ preventScroll: true }); }
function renderStep() {
  stepMarks.forEach((li, i) => {
    li.classList.toggle('is-done', i < step);
    li.classList.toggle('is-current', i === step);
    if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  $('#order-title-d').textContent = ['Your order', 'Pickup time', 'Your details', 'Review', 'Saved'][step];
  [stepCart, stepTime, stepDetails, stepReview, stepDone][step]();
}
const foot = (back, nextLabel, nextAttr = 'data-next') => `<div class="row-between"><span class="label">Total</span><span class="total">${money(cartTotal())}</span></div>
  <div class="actions">${back ? '<button class="btn btn-line" type="button" data-back>Back</button>' : ''}<button class="btn btn-primary" type="button" ${nextAttr} style="flex:1">${esc(nextLabel)}</button></div>`;

function stepCart() {
  if (!cart.length) {
    ob.innerHTML = `<div class="empty-order">${glyphHTML(0)}<p>Nothing in your order yet. Add plates and drinks from the menu.</p><button class="btn btn-line" type="button" data-browse>Browse the menu</button></div>`;
    of.innerHTML = '';
    of.hidden = true;
    return;
  }
  of.hidden = false;
  ob.innerHTML = `<ul class="lines">${cart.map((l) => {
    const it = items.get(l.id);
    return `<li class="line"><span><span class="line-name">${esc(it.name)}</span>${lineMeta(l) ? `<span class="line-meta"> · ${esc(lineMeta(l))}</span>` : ''}</span>
      <span class="line-price">${money(it.price * l.qty)}</span>
      <span class="line-meta">${money(it.price)} each</span>
      <div class="stepper stepper-sm"><button type="button" data-line="${esc(l.key)}" data-d="-1" aria-label="${l.qty === 1 ? 'Remove' : 'One fewer'} ${esc(it.name)}">−</button><output aria-live="polite">${l.qty}</output><button type="button" data-line="${esc(l.key)}" data-d="1" aria-label="One more ${esc(it.name)}">+</button></div></li>`;
  }).join('')}</ul>
  <p class="fine">Espresso drinks can be added once the shop confirms their prices.</p>`;
  of.innerHTML = foot(false, 'Choose a pickup time');
}

function pickupDays() {
  const now = manila();
  const p = data.pickup;
  const last = CLOSE - p.lastOrderMinutes;
  const days = [];
  for (let i = 0; i <= p.daysAhead; i += 1) {
    let start = OPEN;
    if (i === 0) start = Math.max(OPEN, Math.ceil((now.mins + p.leadMinutes) / p.slotMinutes) * p.slotMinutes);
    const slots = [];
    for (let m = start; m <= last; m += p.slotMinutes) slots.push(m);
    if (!slots.length) continue;
    const d = new Date(Date.UTC(now.y, now.mo - 1, now.d + i));
    const date = d.toLocaleDateString('en-PH', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
    days.push({ id: d.toISOString().slice(0, 10), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date, date, slots });
  }
  return days;
}
const PARTS_OF_DAY = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
function slotGroups(slots) {
  return PARTS_OF_DAY.map(([name, from, to]) => {
    const s = slots.filter((m) => m >= from && m < to);
    if (!s.length) return '';
    return `<div class="slot-group" role="group" aria-label="${name}"><p class="slot-group-label" aria-hidden="true">${name}</p><div class="slots">${s.map((m) => `<label class="chip"><input type="radio" name="slot" value="${m}" ${m === pick.slot ? 'checked' : ''}><span>${fmt(m).replace(' ', ' ')}</span></label>`).join('')}</div></div>`;
  }).join('');
}
const slotStillOpen = () => pickupDays().some((d) => d.id === pick.day && d.slots.includes(pick.slot));
function stepTime() {
  const days = pickupDays();
  if (!days.some((d) => d.id === pick.day)) { pick.day = days[0]?.id ?? null; pick.slot = null; }
  const day = days.find((d) => d.id === pick.day);
  ob.innerHTML = `<fieldset class="field-set"><legend>Day</legend><div class="days">${days.map((d) => `<label class="chip"><input type="radio" name="day" value="${d.id}" ${d.id === pick.day ? 'checked' : ''}><span>${esc(d.label)}</span></label>`).join('')}</div></fieldset>
    <fieldset class="field-set"><legend>Time, ${esc(day.date)}</legend><p class="field-error" id="err-slot"></p>${slotGroups(day.slots)}</fieldset>
    <p class="slot-note">Times follow Kuan’s hours, ${fmt(OPEN)}–${fmt(CLOSE)}, Tagum time. Orders need ${data.pickup.leadMinutes} minutes.</p>`;
  of.innerHTML = foot(true, 'Continue');
}
function stepDetails() {
  ob.innerHTML = `<div class="field"><label for="f-name">Name for the order</label><input id="f-name" name="name" autocomplete="name" value="${esc(pick.name)}" aria-describedby="err-name"><p class="field-error" id="err-name"></p></div>
    <div class="field"><label for="f-mobile">Mobile number</label><input id="f-mobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX" value="${esc(pick.mobile)}" aria-describedby="hint-mobile err-mobile"><p class="hint" id="hint-mobile">So the counter can reach you about the order.</p><p class="field-error" id="err-mobile"></p></div>`;
  of.innerHTML = foot(true, 'Review the order');
}
const checks = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter the name for the order.'),
  mobile: (v) => (/^(09\d{9}|\+639\d{9})$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a Philippine mobile number: 11 digits starting with 09.'),
};
function checkField(input) {
  const msg = checks[input.name](input.value);
  input.setAttribute('aria-invalid', String(Boolean(msg)));
  $(`#err-${input.name}`).textContent = msg;
  return !msg;
}
ob.addEventListener('focusout', (e) => { if (e.target.name in checks && e.target.value) checkField(e.target); });
ob.addEventListener('input', (e) => { if (e.target.name in checks && e.target.getAttribute('aria-invalid') === 'true') checkField(e.target); });

function pickupLabel() {
  const d = pickupDays().find((x) => x.id === pick.day);
  return d ? `${d.label === d.date ? '' : `${d.label}, `}${d.date}, ${fmt(pick.slot)}` : '';
}
function stepReview() {
  ob.innerHTML = `<dl class="review">
      <div><dt>Order</dt><dd>${cart.map((l) => `${l.qty} × ${esc(items.get(l.id).name)}${lineMeta(l) ? ` (${esc(lineMeta(l))})` : ''}`).join('<br>')}</dd></div>
      <div><dt>Pickup</dt><dd>${esc(pickupLabel())}<br>Kuan Coffee, Apokon, Tagum City</dd></div>
      <div><dt>Name</dt><dd>${esc(pick.name)}</dd></div>
      <div><dt>Mobile</dt><dd>${esc(pick.mobile)}</dd></div>
    </dl>
    <p class="notice"><span class="demo-tag">${esc(data.demo.label)}</span> Placing this saves it on this device only. Nothing reaches the shop.</p>`;
  of.innerHTML = foot(true, 'Place demo order', 'data-place');
}
function stepDone() {
  const ref = `K-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const record = { ref, at: new Date().toISOString(), pickup: pickupLabel(), name: pick.name, mobile: pick.mobile, total: cartTotal(), lines: cart.map((l) => ({ name: items.get(l.id).name, qty: l.qty, meta: lineMeta(l), price: items.get(l.id).price })) };
  store.set('kuan-orders', [...store.get('kuan-orders', []), record]);
  cart = [];
  saveCart();
  ob.innerHTML = `<div class="done">${$('.brand-mark').outerHTML.replace('brand-mark', 'done-mark')}
    <p class="done-ref">${ref}</p>
    <h3>Saved for ${esc(record.pickup)}.</h3>
    <p>This is a demo, so nothing was sent to Kuan. To order for real, call <a class="link" href="tel:${esc(data.phone.tel)}">${esc(data.phone.display)}</a>.</p></div>`;
  of.hidden = false;
  of.innerHTML = '<button class="btn btn-primary btn-wide" type="button" data-close-order>Done</button>';
}

ob.addEventListener('click', (e) => {
  const lb = e.target.closest('[data-line]');
  if (lb) {
    const line = cart.find((l) => l.key === lb.dataset.line);
    line.qty += Number(lb.dataset.d);
    if (line.qty <= 0) cart = cart.filter((l) => l !== line);
    saveCart();
    stepCart();
    const again = $(`[data-line="${CSS.escape(lb.dataset.line)}"][data-d="${lb.dataset.d}"]`, ob);
    (again || ob).focus({ preventScroll: true });
    return;
  }
  if (e.target.closest('[data-browse]')) {
    orderSheet.close();
    $('#menu').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  }
});
ob.addEventListener('change', (e) => {
  if (e.target.name === 'day') { pick.day = e.target.value; pick.slot = null; stepTime(); $('input[name="day"]:checked', ob).focus(); }
  if (e.target.name === 'slot') { pick.slot = Number(e.target.value); $('#err-slot').textContent = ''; }
});
of.addEventListener('click', (e) => {
  if (e.target.closest('[data-back]')) { go(step - 1); return; }
  if (e.target.closest('[data-close-order]')) { orderSheet.close(); return; }
  if (e.target.closest('[data-place]')) {
    if (slotStillOpen()) { go(4); return; }
    pick.slot = null;
    go(1);
    $('#err-slot').textContent = 'That time has passed. Choose another pickup time.';
    return;
  }
  if (!e.target.closest('[data-next]')) return;
  if (step === 1 && pick.slot == null) { $('#err-slot').textContent = 'Choose a pickup time.'; $('input[name="slot"]', ob)?.focus(); return; }
  if (step === 2) {
    const inputs = $$('input', ob);
    const ok = inputs.map(checkField).every(Boolean);
    if (!ok) { inputs.find((i) => i.getAttribute('aria-invalid') === 'true').focus(); return; }
    pick.name = $('#f-name').value.trim();
    pick.mobile = $('#f-mobile').value.trim();
    store.set('kuan-details', { name: pick.name, mobile: pick.mobile });
  }
  go(step + 1);
});
orderSheet.addEventListener('close', () => { if (step === 4) step = 0; });

/* ---------- Delivery ---------- */
$$('[data-open-delivery]').forEach((b) => b.addEventListener('click', () => {
  if (data.delivery.url) open(data.delivery.url, '_blank', 'noopener');
  else $('#delivery-sheet').showModal();
}));

/* ---------- Phone action bar: appears once the hero's buttons scroll away, steps aside over the footer ---------- */
const heroActions = $('#hero-actions');
const closeBand = $('#close');
if (heroActions && closeBand) {
  const seen = { hero: true, close: false };
  const sync = () => document.body.classList.toggle('show-bar', !seen.hero && !seen.close);
  new IntersectionObserver(([e]) => { seen.hero = e.isIntersecting || e.boundingClientRect.top > 0; sync(); }).observe(heroActions);
  new IntersectionObserver(([e]) => { seen.close = e.isIntersecting; sync(); }).observe(closeBand);
}

/* ---------- Find Kuan: the route draws, the mark lands, the pin pulses; the live map loads on request ---------- */
const drawOnce = (el, cls, threshold) => {
  if (!el) return;
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add(cls); io.disconnect(); } }, { threshold });
  io.observe(el);
};
drawOnce($('.wayfind'), 'drawn', 0.45);
drawOnce($('.collage'), 'is-shown', 0.25);
// The collage and its legend point at each other: a photo under the pointer lights its line, and back.
$$('[data-shot]').forEach((el) => {
  const on = (v) => $$(`[data-shot="${el.dataset.shot}"]`).forEach((x) => x.classList.toggle('is-on', v));
  el.addEventListener('pointerenter', () => on(true));
  el.addEventListener('pointerleave', () => on(false));
});
drawOnce($('.close-svg'), 'is-formed', 0.6);

const liveBtn = $('[data-live-map]');
const mapPanel = $('[data-map]');
if (liveBtn && mapPanel) {
  const drawing = mapPanel.innerHTML;
  const labels = { off: liveBtn.textContent, on: 'Show the drawing' };
  liveBtn.addEventListener('click', () => {
    const on = liveBtn.getAttribute('aria-pressed') === 'true';
    if (on) {
      mapPanel.innerHTML = drawing;
      $('.wayfind', mapPanel).classList.add('drawn');
    } else {
      mapPanel.innerHTML = `<iframe src="${esc(liveBtn.dataset.embed)}" title="Google map: Kuan Coffee, Tagum" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    }
    liveBtn.setAttribute('aria-pressed', String(!on));
    liveBtn.textContent = on ? labels.off : labels.on;
  });
}
