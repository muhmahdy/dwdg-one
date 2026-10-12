/* Shared placement, focus/draft continuity and small action-driven effects. No record state lives here. */
'use strict';
(() => {
  const margin = 8;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));
  const bounds = () => { const v = window.visualViewport; return {left: v?.offsetLeft || 0, top: v?.offsetTop || 0, width: v?.width || innerWidth, height: v?.height || innerHeight}; };
  function compute(r, size, v, opt = {}) {
    const gap = opt.gap ?? 8, x = v.left || 0, y = v.top || 0;
    const width = Math.min(size.width, Math.max(0, v.width - margin * 2));
    const aTop = clamp(r.top, y + margin, y + v.height - margin), aBottom = clamp(r.bottom, y + margin, y + v.height - margin);
    const below = Math.max(0, y + v.height - margin - aBottom - gap), above = Math.max(0, aTop - y - margin - gap);
    const side = opt.up ? (above >= size.height || above >= below ? 'above' : 'below') : (below >= size.height || below >= above ? 'below' : 'above');
    const maxHeight = Math.max(0, side === 'above' ? above : below), height = Math.min(size.height, maxHeight);
    return {left: clamp(opt.alignRight ? r.right - width : r.left, x + margin, x + v.width - margin - width), top: clamp(side === 'above' ? aTop - gap - height : aBottom + gap, y + margin, y + v.height - margin - height), width, maxHeight, side};
  }
  function place(pop, anchor, opt = {}) {
    if (!pop || !anchor) return;
    const r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor, v = bounds();
    pop.style.width = `${Math.min(opt.width || pop.offsetWidth || 248, v.width - margin * 2)}px`;
    pop.style.maxHeight = 'none'; pop.style.bottom = 'auto';
    const pos = compute(r, {width: pop.offsetWidth, height: pop.scrollHeight}, v, opt);
    Object.assign(pop.style, {left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.width}px`, maxHeight: `${pos.maxHeight}px`});
    pop.dataset.side = pos.side; pop.style.transformOrigin = `${opt.alignRight ? 'right' : 'left'} ${pos.side === 'above' ? 'bottom' : 'top'}`;
    return pos;
  }
  function peoplePlace(host, input, reveal = false) {
    if (!host?.firstElementChild || !input) return;
    host._opener = input;
    const pos = place(host, input, {width: host.querySelector('.pm-r') ? 566 : 270, gap: 4});
    if (reveal) {
      const show = (item, box) => {
        const r = item.getBoundingClientRect(), b = box.getBoundingClientRect(), top = b.top + box.clientTop, bottom = top + box.clientHeight;
        if (r.top < top) box.scrollTop += r.top - top;
        else if (r.bottom > bottom) box.scrollTop += r.bottom - bottom;
      };
      // Keyboard selection can outgrow either list or the viewport-clamped host. Scroll
      // only these surfaces so keeping a person visible never moves the page or input.
      host.querySelectorAll('.pm .mi.act').forEach(item => {
        const list = item.closest('.pm-l,.pm-r'); if (list) show(item, list);
        show(item, host);
      });
    }
    return pos;
  }
  window.UIPlacement = {bounds, compute, place, peoplePlace};

  const fieldSelector = 'input:not([type="hidden"]):not([type="file"]),textarea,select,[contenteditable="true"]';
  const focusSelector = 'button:not(:disabled),a[href],input:not(:disabled):not([type="hidden"]),textarea:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
  const quote = value => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const visible = el => !!el && el.isConnected && !el.closest('[inert],[hidden],[aria-hidden="true"],.cf-src') && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0;
  const focusable = el => visible(el) && el.getAttribute('tabindex') !== '-1';
  function describe(el, root = document) {
    if (!el || !root.contains(el) || el === document.body) return null;
    let selector = el.tagName.toLowerCase();
    if (el.id) selector += `[id="${quote(el.id)}"]`;
    else {
      const keys = ['name', 'data-act', 'data-id', 'data-bind', 'data-k', 'data-menu', 'data-cf-for', 'href', 'aria-label'];
      for (const k of keys) if (el.hasAttribute(k)) selector += `[${k}="${quote(el.getAttribute(k))}"]`;
    }
    const index = [...root.querySelectorAll(selector)].indexOf(el);
    return {selector, index, node: el};
  }
  const resolve = (ref, root = document) => ref && (root.contains(ref.node) ? ref.node : root.querySelectorAll(ref.selector)[Math.max(0, ref.index)]);
  let submitting = null;
  const initialValue = el => el.tagName === 'SELECT' ? [...el.options].filter(o => o.defaultSelected).map(o => o.value).join('\n') : el.defaultValue;
  function capture(root) {
    if (!root) return null;
    const active = document.activeElement;
    return {focus: describe(active, root), selection: active && typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd, active.selectionDirection] : null,
      fields: [...root.querySelectorAll(fieldSelector)].filter(el => !submitting?.contains(el)).map(el => ({ref: describe(el, root), value: el.isContentEditable ? el.innerHTML : el.value, initial: el.isContentEditable ? el.innerHTML : initialValue(el),
        checked: el.checked, defaultChecked: el.defaultChecked, dirty: el.type === 'checkbox' || el.type === 'radio' ? el.checked !== el.defaultChecked : el.tagName === 'SELECT' ? [...el.options].some(o => o.selected !== o.defaultSelected) : el.value !== el.defaultValue,
        scrollTop: el.scrollTop, scrollLeft: el.scrollLeft}))};
  }
  function restore(st, root, opt = {}) {
    if (!st || !root) return;
    if (opt.values !== false) for (const f of st.fields) {
      const el = resolve(f.ref, root); if (!el) continue;
      // A different saved value takes priority over an old DOM draft.
      if (f.dirty && (initialValue(el) === f.initial || el.type === 'checkbox' || el.type === 'radio')) {
        if (el.type === 'checkbox' || el.type === 'radio') { if (el.defaultChecked === f.defaultChecked) el.checked = f.checked; }
        else if (!el.isContentEditable) el.value = f.value;
      }
      el.scrollTop = f.scrollTop; el.scrollLeft = f.scrollLeft;
    }
    const active = resolve(st.focus, root);
    if (opt.focus !== false && visible(active)) { active.focus({preventScroll: true}); if (st.selection && active.setSelectionRange) try { active.setSelectionRange(...st.selection); } catch {} }
  }
  const animations = new Set(), ghosts = new Set();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(el, frames, duration) {
    if (!el?.animate || reduced() || document.hidden || window.QA?.running) return;
    const a = el.animate(frames, {duration, easing: 'cubic-bezier(.2,.8,.2,1)'}); animations.add(a);
    a.finished.catch(() => {}).finally(() => animations.delete(a)); return a;
  }
  function cancel() { animations.forEach(a => a.cancel()); animations.clear(); ghosts.forEach(el => el.remove()); ghosts.clear(); }
  window.UIEffects = {
    cancel,
    complete(id, rect) {
      if (reduced() || window.QA?.running) return;
      const check = [...document.querySelectorAll('[data-act="toggle"]')].find(el => el.dataset.id === id);
      if (check && visible(check)) { animate(check, [{transform: 'scale(.8)'}, {transform: 'scale(1.12)', offset: .6}, {transform: 'scale(1)'}], 220); return; }
      if (!rect || rect.top < 0 || rect.top > innerHeight) return;
      const el = document.createElement('span'); el.className = 'ui-completion-fx'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = typeof icon === 'function' ? icon('check') : '✓';
      Object.assign(el.style, {position: 'fixed', pointerEvents: 'none', zIndex: '65', left: `${rect.left + (rect.width - 28) / 2}px`, top: `${rect.top + (rect.height - 28) / 2}px`, width: '28px', height: '28px', display: 'grid', placeItems: 'center', color: 'var(--green-ink)', background: 'var(--surface)', borderRadius: '50%'});
      document.body.append(el); ghosts.add(el);
      const a = animate(el, [{opacity: 1, transform: 'scale(.8)'}, {opacity: 1, transform: 'scale(1.1)', offset: .6}, {opacity: 0, transform: 'scale(1)'}], 220);
      if (a) a.finished.catch(() => {}).finally(() => { el.remove(); ghosts.delete(el); }); else { el.remove(); ghosts.delete(el); }
    },
    pin(kind, id) {
      const el = [...document.querySelectorAll('.pin-btn')].find(el => el.dataset.k === kind && el.dataset.id === id);
      animate(el?.querySelector('.ic'), [{transform: 'rotate(-16deg) scale(.8)'}, {transform: 'rotate(6deg) scale(1.12)', offset: .65}, {transform: 'rotate(0) scale(1)'}], 240);
      const href = {project: `#/projects/${id}`, program: `#/programs/${id}`, routine: `#/operations/${id}`}[kind];
      const pin = [...document.querySelectorAll('.cs-pin')].find(el => href ? el.getAttribute('href') === href : el.dataset.id === id);
      animate(pin, [{opacity: .5, transform: 'translateX(-4px)'}, {opacity: 1, transform: 'translateX(0)'}], 240);
    }
  };
  let lastControl = null, panelOpener = null, layerOpener = null, layerKey = '', layerSnapshot = null;
  function menuAnchor() {
    const m = ui.menu; if (!m) return null;
    if (!m.anchorChecked) {
      m.anchorChecked = true;
      const el = resolve(layerOpener), r = el?.getBoundingClientRect();
      if (r && Math.abs(r.left - m.rect.left) < 2 && Math.abs(r.top - m.rect.top) < 2) m.anchor = el;
    }
    return m.anchor?.isConnected ? m.anchor : m.rect;
  }
  const inerted = new Map();
  function releaseInert() { inerted.forEach((value, el) => { el.inert = value; }); inerted.clear(); }
  function topOverlay() {
    const cf = document.querySelector('#cfpop .cf-pop'); if (visible(cf)) return cf;
    const people = [...document.querySelectorAll('.pm-host .pm')].find(visible); if (people) return people;
    const layer = document.querySelector('#layer > .pop'); if (visible(layer)) return layer;
    const panel = document.querySelector('.insp-sheet'); if (visible(panel) && getComputedStyle(panel).position === 'fixed') return panel;
    return null;
  }
  function focusFirst(root) {
    const target = [...root.querySelectorAll(focusSelector)].find(focusable);
    if (target) target.focus({preventScroll: true}); else { root.tabIndex = -1; root.focus({preventScroll: true}); }
  }
  function syncInert() {
    releaseInert(); let modal = topOverlay();
    if (modal?.matches('.pm,.cf-pop')) modal = document.querySelector('#layer > .pop') || document.querySelector('.insp-sheet');
    if (!visible(modal) || modal.matches('[role="menu"]') || modal.matches('.insp-sheet') && getComputedStyle(modal).position !== 'fixed') return;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    const candidates = modal.closest('#layer') ? [document.getElementById('app')] : [...document.querySelectorAll('.side,.top,.tabbar,.f-top,.f-main,.f-dock,#scroller')];
    for (const el of candidates) if (el && !el.contains(modal)) { inerted.set(el, el.inert); el.inert = true; }
  }
  function focusBack(ref) { const el = resolve(ref); if (visible(el)) el.focus({preventScroll: true}); else { const main = document.getElementById('main'); if (main) { main.tabIndex = -1; main.focus({preventScroll: true}); } } }
  function reset() { cancel(); releaseInert(); layerKey = ''; layerSnapshot = null; layerOpener = null; panelOpener = null; lastControl = null; }
  // The opt-in QA sweep temporarily replaces the DOM. Preserve references to its original nodes so
  // an already-open panel can still dismiss to its opener after the sweep restores those nodes.
  function snapshot() { return {lastControl, panelOpener, layerOpener, layerKey, layerSnapshot, inerted: [...inerted]}; }
  function resume(st) {
    reset(); if (!st) return;
    ({lastControl, panelOpener, layerOpener, layerKey, layerSnapshot} = st);
    for (const [el, value] of st.inerted || []) if (el.isConnected) { inerted.set(el, value); el.inert = true; }
  }
  window.UIPolish = {capture, restore, describe, resolve, topOverlay, reset, snapshot, resume};
  if (typeof render !== 'function' || typeof ui === 'undefined') return;

  document.addEventListener('pointerdown', e => { const el = e.target.closest(focusSelector + ',[data-act]'); if (el) lastControl = describe(el); }, true);
  document.addEventListener('click', e => { const el = e.target.closest(focusSelector + ',[data-act]'); if (el && !el.closest('#layer,#cfpop')) lastControl = describe(el); }, true);
  document.addEventListener('keydown', () => { lastControl = describe(document.activeElement); }, true);
  document.addEventListener('submit', e => { submitting = e.target; queueMicrotask(() => { submitting = null; }); }, true);
  const oldRender = render, oldLayer = renderLayer;
  render = function () {
    if (window.QA?.running) { oldRender(); return; }
    const app = document.getElementById('app'), oldKey = app?.dataset.rk, oldPanel = app?.dataset.ik;
    const pageState = capture(document.getElementById('scroller')), panelState = capture(document.querySelector('.insp-sheet'));
    const opener = lastControl || describe(document.activeElement);
    cancel(); releaseInert(); oldRender();
    const samePage = oldKey === app?.dataset.rk, panel = document.querySelector('.insp-sheet'), newPanel = app?.dataset.ik;
    if (samePage) restore(pageState, document.getElementById('scroller'), {focus: !newPanel});
    if (oldPanel && oldPanel === newPanel) restore(panelState, panel);
    else if (newPanel && panel) {
      if (!oldPanel) panelOpener = opener;
      focusFirst(panel);
      const phone = innerWidth <= 800;
      animate(panel, [{opacity: 0, transform: phone ? 'translateY(24px)' : 'translateX(16px)'}, {opacity: 1, transform: 'translate(0,0)'}], 300);
    } else if (oldPanel && !newPanel && samePage) { focusBack(panelOpener); panelOpener = null; }
    syncInert();
  };
  renderLayer = function () {
    const previous = document.getElementById('layer'), before = capture(previous);
    const nextKey = ui.draft && !(ui.insp && ui.insp.type === 'event-edit') ? 'draft' : ui.composer ? 'composer' : ui.palette ? 'palette' : ui.menu ? `menu:${ui.menu.type}:${ui.acctSub || ''}` : '';
    const changed = nextKey !== layerKey, previousKey = layerKey;
    if (nextKey && !previousKey) layerOpener = lastControl || describe(document.activeElement);
    oldLayer(); const layer = document.getElementById('layer'), pop = layer?.querySelector('.pop');
    animations.forEach(a => { if (a.effect?.target && !a.effect.target.isConnected) a.cancel(); });
    if (nextKey.startsWith('menu:') && pop) {
      UIPlacement.place(pop, menuAnchor(), {width: ui.menu.width || 248, up: ui.menu.up, alignRight: ui.menu.alignRight});
    } else if (pop) {
      const v = bounds(); pop.style.maxHeight = `${v.height - 16}px`; pop.style.overflowY = 'auto';
      const h = pop.getBoundingClientRect().height;
      pop.style.top = `${clamp(pop.getBoundingClientRect().top, v.top + 8, v.top + v.height - h - 8)}px`;
    }
    layerKey = nextKey;
    if (window.QA?.running) return;
    releaseInert();
    if (pop && changed) {
      focusFirst(pop);
      if (nextKey.startsWith('menu:')) animate(pop, [{opacity: 0, transform: `translateY(${pop.dataset.side === 'above' ? '4' : '-4'}px) scale(.98)`}, {opacity: 1, transform: 'translateY(0) scale(1)'}], 200);
    } else if (nextKey) restore(before || layerSnapshot, layer);
    else if (previousKey) { focusBack(layerOpener); layerOpener = null; }
    layerSnapshot = capture(layer); syncInert();
  };
  // Run before the legacy shortcut handlers so one Escape dismisses exactly one layer.
  document.addEventListener('keydown', e => {
    if (window.QA?.running) return;
    const top = topOverlay(); if (!top) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (top.closest('#cfpop')) { const opener = typeof CF !== 'undefined' && CF.open?.btn; cfClose(); if (visible(opener)) opener.focus({preventScroll: true}); }
      else if (top.matches('.pm') && ui.pm) { const key = ui.pm.key; ui.pm.closed = true; PICK[key]?.refresh(); }
      else if (top.closest('#layer')) { if (layerKey === 'draft') ui.draft = null; else if (layerKey === 'composer') ui.composer = null; else if (layerKey === 'palette') ui.palette = false; else ui.menu = null; renderLayer(); }
      else if (ui.insp?.type === 'event-edit' && ui.draft && ACT['d-cancel']) ACT['d-cancel']();
      else ACT['close-insp'](); return;
    }
    if (e.key !== 'Tab') return;
    // People pickers keep focus in their text input and handle selection in ON_KEY.
    if (top.matches('.pm')) return;
    if (top.closest('#cfpop')) { const opener = typeof CF !== 'undefined' && CF.open?.btn; cfClose(); if (visible(opener)) opener.focus({preventScroll: true}); return; }
    if (top.matches('[role="menu"]')) { ui.menu = null; renderLayer(); return; }
    const items = [...top.querySelectorAll(focusSelector)].filter(focusable), first = items[0], last = items[items.length - 1];
    if (!first) { e.preventDefault(); return; }
    if (!top.contains(document.activeElement) || e.shiftKey && document.activeElement === first || !e.shiftKey && document.activeElement === last) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  }, true);
  function reposition() {
    const pop = document.querySelector('#layer .popmenu'); if (pop && ui.menu) UIPlacement.place(pop, menuAnchor(), {width: ui.menu.width || 248, up: ui.menu.up, alignRight: ui.menu.alignRight});
    document.querySelectorAll('#pmfloat,#pmfloat2').forEach(host => { if (host._opener?.isConnected) peoplePlace(host, host._opener); });
  }
  addEventListener('resize', reposition); window.visualViewport?.addEventListener('resize', reposition); window.visualViewport?.addEventListener('scroll', reposition);
  document.addEventListener('scroll', e => {
    if (e.target.closest?.('.pm-host')) return;
    document.querySelectorAll('#pmfloat,#pmfloat2').forEach(host => { if (host._opener?.isConnected) peoplePlace(host, host._opener); });
  }, true);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { if (reduced()) cancel(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
})();
