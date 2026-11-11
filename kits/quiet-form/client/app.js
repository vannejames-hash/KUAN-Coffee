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

/* ---------- Hero: the four forms of the poster. With a mouse each leans a few px toward the pointer by its own
   depth; a press nudges a form and lets it settle. Nothing here selects anything. ---------- */
const heroEl = $('.hero');
const heroForms = $('.hero-forms');
if (heroEl && heroForms) {
  heroEl.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || reduce.matches) return;
    const r = heroForms.getBoundingClientRect();
    heroForms.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
    heroForms.style.setProperty('--my', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
  });
  heroEl.addEventListener('pointerleave', () => { heroForms.style.setProperty('--mx', '0'); heroForms.style.setProperty('--my', '0'); });
}
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
