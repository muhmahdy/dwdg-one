/** Shared, dependency-free interaction primitives for the DWDG experience. */
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

const ICONS = {
  home:'M3 10 12 3l9 7v10H3Z M9 20v-7h6v7',
  tasks:'M9 5h12M9 12h12M9 19h12M3 5l1 1 2-3M3 12l1 1 2-3M3 19l1 1 2-3',
  projects:'M3 7h18v13H3ZM3 7V4h7l2 3M3 11h18',
  folder:'M3 7h18v13H3ZM3 7V4h7l2 3',
  calendar:'M4 5h16v16H4ZM4 10h16M8 3v4M16 3v4',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
  plus:'M12 5v14M5 12h14', close:'M6 6l12 12M6 18 18 6',
  chevron:'m9 5 7 7-7 7', 'chevron-right':'m9 5 7 7-7 7', 'chevron-left':'m15 5-7 7 7 7',
  'chevron-down':'m5 9 7 7 7-7', down:'m5 9 7 7 7-7', left:'m15 5-7 7 7 7', right:'m9 5 7 7-7 7',
  check:'m5 12 4 4L19 6', edit:'m15 4 5 5M4 16 17 3l4 4L8 20l-5 1Z',
  circle:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  hand:'M8 13V6a2 2 0 0 1 4 0v6M12 6V4a2 2 0 0 1 4 0v8M16 7a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-5-2l-4-5a2 2 0 0 1 3-3l2 2',
  archive:'M3 4h18v4H3ZM5 8v13h14V8M10 12h4',
  trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
  more:'M4 12h.01M12 12h.01M20 12h.01', menu:'M4 6h16M4 12h16M4 18h16',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
  updates:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
  documents:'M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6',
  file:'M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6',
  chart:'M4 3v18h17M8 16v-4M13 16V7M18 16v-7',
  activity:'M3 12h4l3-8 4 16 3-8h4',
  filter:'M4 6h16M7 12h10M10 18h4M8 3v6M16 9v6M12 15v6',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM18 4a4 4 0 0 1 0 8M18 15a4 4 0 0 1 4 4v2',
  person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  link:'m10 14 4-4M9 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M15 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  external:'M14 3h7v7M21 3 11 13M10 5H4v15h15v-6',
  arrow:'M5 12h14m-6-6 6 6-6 6',
  download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  upload:'M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4',
  flag:'M5 22V3m0 0c5-4 9 4 15 0v11c-6 4-10-4-15 0',
  warning:'M10 4a2 2 0 0 1 4 0l8 15H2ZM12 9v4M12 17h.01',
  info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7h.01',
  board:'M3 4h5v16H3ZM10 4h5v10h-5ZM17 4h4v13h-4Z',
  list:'M7 5h14M7 12h14M7 19h14M3 5h.01M3 12h.01M3 19h.01',
  gantt:'M3 3v18h18M6 7h7M10 12h8M15 17h6',
  globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-6 5-6 13 0 18M12 3c6 5 6 13 0 18',
  heart:'M12 21 3 12A6 6 0 0 1 12 4a6 6 0 0 1 9 8Z',
  sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
  sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1',
  moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
  finance:'M3 6h18v14H3ZM3 10h18M15 15h3',
  wallet:'M3 6h17v15H3ZM3 6V3h14v3M16 11h5v6h-5a3 3 0 0 1 0-6ZM17 14h.01',
  briefcase:'M3 7h18v13H3ZM8 7V3h8v4M3 12c5 4 13 4 18 0M10 12h4v5h-4Z',
  compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 8l-3 5-5 3 3-5Z',
  shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6',
  undo:'m9 4-6 6 6 6M3 10h12a6 6 0 0 1 0 12',
};
export function icon(name, className = '') {
  return `<svg class="ux-icon ${escapeHtml(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.projects}"/></svg>`;
}

const reducedMotion = () => {const preference=typeof document!=='undefined'?document.documentElement.dataset.motion:'system';return preference==='reduced'||(preference!=='full'&&typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);};
const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let overlaySequence = 0;

/** One overlay owner per application. Content is trusted, already escaped HTML. */
export function createOverlays({t = (en, id) => en} = {}) {
  let current = null, confirmation = null, toastTimer = 0, toastEl = null, destroyed = false;
  const portal = document.createElement('div');
  portal.className = 'ux-portal';
  document.body.append(portal);
  const inertBefore = new Map();
  let bodyOverflow = null;

  function focusKey(element) {
    if (!(element instanceof Element)) return null;
    const attributes = ['id','data-focus-key','data-key','data-action','data-id','data-dw','data-px','data-chart-date'];
    return {element, attributes: attributes.filter(key => element.hasAttribute(key)).map(key => [key, element.getAttribute(key)])};
  }
  function restoreFocus(saved) {
    if (!saved) return;
    if (saved.element?.isConnected && !saved.element.closest('[inert]')) {saved.element.focus({preventScroll:true}); return;}
    const pairs = saved.attributes || [];
    if (!pairs.length) return;
    const selector = pairs.map(([key,value]) => `[${key}="${CSS.escape(value)}"]`).join('');
    const target=document.querySelector(selector);
    if(target&&!target.closest('[inert]'))target.focus({preventScroll:true});
  }
  function syncModal() {
    const modal = Boolean(confirmation || (current && current.kind !== 'popover'));
    if (modal) {
      if (bodyOverflow === null) {bodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';}
      for (const child of document.body.children) {
        if (child === portal || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
        if (!inertBefore.has(child)) inertBefore.set(child, child.inert);
        child.inert = true;
      }
    } else {
      inertBefore.forEach((value, child) => {if (child.isConnected) child.inert = value;});
      inertBefore.clear();
      if (bodyOverflow !== null) {document.body.style.overflow = bodyOverflow; bodyOverflow = null;}
    }
    if (current) current.layer.inert = Boolean(confirmation);
  }
  function top() {return confirmation || current;}
  function initialFocus(item) {
    requestAnimationFrame(() => {
      if (top() !== item || !item.panel.isConnected) return;
      (item.panel.querySelector('[autofocus],input:not([type="hidden"]),textarea,select') || item.panel.querySelector(focusableSelector) || item.panel).focus({preventScroll:true});
    });
  }
  function positionPopover(item) {
    if (item.kind !== 'popover' || !item.anchor?.isConnected) return;
    const anchor = item.anchor.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
    const offsetX = viewport?.offsetLeft || 0, offsetY = viewport?.offsetTop || 0;
    item.panel.style.maxHeight = `${Math.max(100, height - 16)}px`;
    const bounds = item.panel.getBoundingClientRect();
    let left = anchor.left;
    if (left + bounds.width > width + offsetX - 8) left = anchor.right - bounds.width;
    left = Math.max(offsetX + 8, Math.min(left, offsetX + width - bounds.width - 8));
    const below = offsetY + height - anchor.bottom - 8;
    const above = anchor.top - offsetY - 8;
    const flip = below < bounds.height + 8 && above > below;
    let y = flip ? anchor.top - bounds.height - 8 : anchor.bottom + 8;
    y = Math.max(offsetY + 8, Math.min(y, offsetY + height - bounds.height - 8));
    item.panel.style.left = `${left}px`; item.panel.style.top = `${y}px`;
    const originX = Math.max(12, Math.min(bounds.width - 12, anchor.left + anchor.width / 2 - left));
    item.panel.style.transformOrigin = `${originX}px ${flip ? '100%' : '0%'}`;
    item.panel.dataset.placement = flip ? 'top' : 'bottom';
  }
  function makeLayer(options, confirmLayer = false) {
    const kind = options.kind || 'dialog', id = `ux-panel-${++overlaySequence}`;
    const layer = document.createElement('div');
    layer.className = `ux-layer ux-layer--${kind}${confirmLayer ? ' ux-layer--confirm' : ''}`;
    layer.innerHTML = `<div class="ux-backdrop" data-ux-dismiss></div><section class="ux-panel ux-panel--${kind}" role="dialog" ${kind === 'popover' ? '' : 'aria-modal="true"'} aria-labelledby="${id}-title" tabindex="-1"><header class="ux-panel-head"><h2 id="${id}-title">${escapeHtml(options.title || '')}</h2><button type="button" class="ux-close" data-ux-close aria-label="${escapeHtml(t('Close','Tutup'))}">${icon('close')}</button></header><div class="ux-panel-body">${options.content || ''}</div></section>`;
    portal.append(layer);
    const item = {kind, layer, panel:layer.querySelector('.ux-panel'), anchor:options.anchor, options, focus:focusKey(options.anchor || document.activeElement), dirty:false, closing:false, resize:null};
    layer.addEventListener('input', () => {item.dirty = true;});
    layer.addEventListener('change', () => {item.dirty = true;});
    layer.addEventListener('submit', event => {event.preventDefault(); if (item.closing || item.panel.dataset.busy === 'true') return; if (options.onSubmit) options.onSubmit(event, item.panel);});
    layer.addEventListener('click', event => {
      if(item.closing || item.panel.dataset.busy === 'true')return;
      if (event.target.closest('[data-ux-close],[data-ux-dismiss]')) {
        if (confirmLayer) finishConfirm(false); else close();
        return;
      }
      const target = event.target.closest('[data-overlay-action]');
      if (target && item.panel.contains(target)) options.onAction?.(target.dataset.overlayAction, target, event);
    });
    if (kind === 'popover') {
      positionPopover(item);
      if (typeof ResizeObserver !== 'undefined') {item.resize = new ResizeObserver(() => positionPopover(item)); item.resize.observe(item.panel);}
    }
    requestAnimationFrame(() => {if(!item.closing && layer.isConnected)layer.classList.add('ux-entered');});
    return item;
  }
  function retire(item) {
    if (!item || item.closing) return Promise.resolve();
    item.closing = true; item.resize?.disconnect(); item.layer.inert = true;
    item.layer.classList.remove('ux-entered'); item.layer.classList.add('ux-leaving');
    item.layer.style.pointerEvents = 'none';
    return new Promise(resolve => {
      setTimeout(() => {item.layer.remove(); resolve();}, reducedMotion() ? 0 : item.kind === 'popover' ? 200 : 300);
    });
  }
  function isDirty(item) {
    if (typeof item?.options.dirtyGuard === 'function') return Boolean(item.options.dirtyGuard(item.panel));
    return Boolean(item?.options.dirtyGuard && item.dirty);
  }
  function open(options) {
    if (destroyed) throw new Error('The overlay controller has been destroyed.');
    if(current?.panel.dataset.busy === 'true')return current.panel;
    if (confirmation) finishConfirm(false);
    const inheritedFocus=current?.panel.contains(document.activeElement)?current.focus:null;
    // Repeated open calls are explicit replacements; close() guards user dismissal.
    if (current) {retire(current); current = null;}
    current = makeLayer(options); if(inheritedFocus&&!options.anchor)current.focus=inheritedFocus; syncModal(); initialFocus(current);
    return current.panel;
  }
  async function close(force = false, {waitForExit = true} = {}) {
    if (confirmation) {finishConfirm(false); return false;}
    const item = current;
    if (!item) return true;
    if(!force&&item.panel.dataset.busy === 'true')return false;
    if (!force && isDirty(item)) {
      const discard = await confirm({title:t('Discard changes?','Buang perubahan?'),message:t('Your unsaved changes will be lost.','Perubahan yang belum disimpan akan hilang.'),confirmLabel:t('Discard changes','Buang perubahan'),cancelLabel:t('Keep editing','Lanjutkan mengedit')});
      if (!discard || current !== item) return false;
    }
    current = null;
    const retirement=retire(item); syncModal(); restoreFocus(item.focus);
    if(!waitForExit)return true;
    await retirement; return true;
  }
  function finishConfirm(value) {
    const item = confirmation; if (!item) return;
    confirmation = null; retire(item); syncModal(); restoreFocus(item.focus);
    item.resolve(Boolean(value));
  }
  function confirm({title, message, confirmLabel, cancelLabel} = {}) {
    if (confirmation) finishConfirm(false);
    return new Promise(resolve => {
      confirmation = makeLayer({kind:'dialog',title:title || t('Are you sure?','Anda yakin?'),content:`<p class="ux-confirm-message">${escapeHtml(message)}</p><div class="ux-actions"><button class="ux-button" type="button" data-overlay-action="cancel">${escapeHtml(cancelLabel || t('Cancel','Batal'))}</button><button class="ux-button ux-button--danger" type="button" data-overlay-action="confirm">${escapeHtml(confirmLabel || t('Confirm','Konfirmasi'))}</button></div>`,onAction:action => finishConfirm(action === 'confirm')}, true);
      confirmation.resolve = resolve; syncModal(); initialFocus(confirmation);
    });
  }
  function toast(message, {undo,tone='success'} = {}) {
    clearTimeout(toastTimer); toastEl?.remove();
    toastEl = document.createElement('div'); toastEl.className = `ux-toast${tone==='error'?' ux-toast--error':''}`; toastEl.setAttribute('role','status');
    toastEl.innerHTML = `<span class="ux-toast-mark">${icon(tone==='error'?'warning':'check')}</span><span>${escapeHtml(message)}</span>${typeof undo === 'function' ? `<button type="button">${escapeHtml(t('Undo','Urungkan'))}</button>` : ''}`;
    portal.append(toastEl);
    const shown = toastEl;
    if (typeof undo === 'function') shown.querySelector('button').addEventListener('click', async () => {await undo(); if (shown.isConnected) shown.remove();});
    requestAnimationFrame(() => shown.classList.add('ux-entered'));
    toastTimer = setTimeout(() => {shown.classList.remove('ux-entered'); setTimeout(() => shown.remove(), reducedMotion() ? 0 : 200);}, undo ? 10000 : 4500);
  }
  function clearToast(){clearTimeout(toastTimer);toastEl?.remove();toastEl=null;}
  function keydown(event) {
    const item = top(); if (!item) return;
    if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); if (confirmation) finishConfirm(false); else close(); return;}
    if (event.key !== 'Tab' || item.kind === 'popover') return;
    const controls = [...item.panel.querySelectorAll(focusableSelector)].filter(element => element.getClientRects().length && !element.closest('[inert]'));
    const first = controls[0], last = controls.at(-1);
    if (!first) {event.preventDefault(); item.panel.focus(); return;}
    if (event.shiftKey && (document.activeElement === first || !item.panel.contains(document.activeElement))) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && (document.activeElement === last || !item.panel.contains(document.activeElement))) {event.preventDefault(); first.focus();}
  }
  function relocate() {
    const viewport = window.visualViewport;
    if (viewport && portal.style.setProperty) {
      portal.style.setProperty('--ux-viewport-height', `${viewport.height}px`);
      portal.style.setProperty('--ux-viewport-top', `${viewport.offsetTop}px`);
      portal.style.setProperty('--ux-keyboard-inset', `${Math.max(0,(typeof innerHeight === 'number' ? innerHeight : viewport.height)-viewport.height-viewport.offsetTop)}px`);
    }
    if (current?.kind === 'popover') positionPopover(current);
  }
  relocate();
  document.addEventListener('keydown', keydown, true);
  window.addEventListener('resize', relocate); window.addEventListener('scroll', relocate, true);
  window.visualViewport?.addEventListener('resize', relocate); window.visualViewport?.addEventListener('scroll', relocate);
  return {open, close, isOpen:() => Boolean(current || confirmation), toast, clearToast, confirm, destroy() {
    destroyed = true; clearTimeout(toastTimer); current?.resize?.disconnect();
    if (confirmation) {confirmation.resolve(false); confirmation = null;}
    current = null; syncModal(); portal.remove();
    document.removeEventListener('keydown', keydown, true);
    window.removeEventListener('resize', relocate); window.removeEventListener('scroll', relocate, true);
    window.visualViewport?.removeEventListener('resize', relocate); window.visualViewport?.removeEventListener('scroll', relocate);
  }};
}

/** Call only after persistence succeeds. Caller owns the eventual DOM removal. */
export async function dissolve(element) {
  if (!element?.isConnected || reducedMotion() || typeof element.animate !== 'function') return;
  const height = element.getBoundingClientRect().height;
  const animations=[],previousPointerEvents=element.style.pointerEvents;
  element.style.pointerEvents = 'none';
  try {
    const fade=element.animate([{opacity:1,filter:'blur(0px)',transform:'translateY(0)'},{opacity:0,filter:'blur(4px)',transform:'translateY(-4px) scale(.98)'}],{duration:220,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});animations.push(fade);await fade.finished;
    const collapse=element.animate([{height:`${height}px`,minHeight:0,opacity:0},{height:'0px',minHeight:0,paddingTop:0,paddingBottom:0,marginTop:0,marginBottom:0,opacity:0}],{duration:160,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});animations.push(collapse);await collapse.finished;
  } catch { /* A route change can intentionally cancel an outgoing item. */ }
  finally {animations.forEach(animation=>animation.cancel());element.style.pointerEvents=previousPointerEvents;}
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = value => typeof value === 'string' && DATE.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
const datePlus = (value, offset) => {const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + offset); return date.toISOString().slice(0,10);};
const localToday = () => {const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;};

/** Counts present saved completions, not an immutable event history. */
export function completionSeries(tasks, {start, days = 7, today = localToday(), recordedSince} = {}) {
  if (!isDate(start) || !isDate(today)) throw new TypeError('start and today must be valid YYYY-MM-DD dates.');
  if (!Number.isInteger(days) || days < 1 || days > 366) throw new RangeError('days must be an integer between 1 and 366.');
  const since = isDate(recordedSince) ? recordedSince : null;
  const counts = new Map();
  for (const task of tasks || []) {
    if (task?.status !== 'done' || !isDate(task.completedAt) || task.completedAt > today) continue;
    counts.set(task.completedAt, (counts.get(task.completedAt) || 0) + 1);
  }
  const entries = Array.from({length:days}, (_, index) => {
    const date = datePlus(start, index);
    return {date,count:counts.get(date) || 0,known:Boolean(since && date >= since && date <= today),partial:date === today};
  });
  const complete = entries.filter(entry => entry.known && !entry.partial);
  return {entries,average:complete.length ? complete.reduce((sum, entry) => sum + entry.count, 0) / complete.length : null,averageDays:complete.length};
}

export function renderActivityChart({series, selectedDate = '', locale = 'en', variant = 'bars'} = {}) {
  const entries = Array.isArray(series) ? series : series?.entries || [];
  const language = String(locale).toLowerCase().startsWith('id') ? 'id-ID' : 'en-GB';
  const t = (en, id) => language === 'id-ID' ? id : en;
  const average = Number.isFinite(series?.average) ? series.average : null;
  const maxValue = Math.max(1, ...entries.map(entry => Number(entry.count) || 0), average || 0);
  const scale = maxValue <= 4 ? Math.max(2,Math.ceil(maxValue / 2) * 2) : Math.ceil(maxValue / 5) * 5;
  const number = value => new Intl.NumberFormat(language, {maximumFractionDigits:1}).format(value);
  const dateText = (date, options) => new Date(`${date}T12:00:00Z`).toLocaleDateString(language, {...options,timeZone:'UTC'});
  const cells = variant === 'cells';
  const averageText = average === null ? t('Daily average unavailable','Rata-rata harian belum tersedia') : `${t('Daily average','Rata-rata harian')} ${number(average)}`;
  const averageBasis = average === null ? t('Requires a complete recorded day.','Memerlukan satu hari pencatatan penuh.') : t('Completed recorded days only; today is excluded.','Hanya hari pencatatan yang sudah berakhir; hari ini tidak termasuk.');
  if (!entries.length) return `<div class="ux-chart-empty">${t('No activity in this period.','Belum ada aktivitas pada periode ini.')}</div>`;
  const selected = entries.find(entry => entry.date === selectedDate);
  const selection = selected ? `<output class="ux-chart-selection" aria-live="polite"><span>${escapeHtml(dateText(selected.date,{day:'numeric',month:'short'}))}</span><strong>${selected.known?number(Math.max(0,Number(selected.count)||0)):'—'} ${t('completed','selesai')}</strong>${selected.partial?`<span class="ux-chart-partial">${t('Partial','Belum berakhir')}</span>`:''}</output>` : `<span>${t('Completed tasks','Tugas selesai')}</span>`;
  const buttons = entries.map(entry => {
    const count = Math.max(0,Number(entry.count) || 0), percent = count / scale * 100;
    const known = Boolean(entry.known), selected = entry.date === selectedDate;
    const status = entry.partial ? t('Today, still in progress','Hari ini, masih berlangsung') : known ? '' : t('Incomplete history','Riwayat belum lengkap');
    const displayed=known?count:'—';
    const label = `${dateText(entry.date,{weekday:'long',day:'numeric',month:'long'})}: ${known?`${count} ${t('completed tasks','tugas selesai')}`:t('Unknown completion count','Jumlah penyelesaian belum diketahui')}${status ? ` · ${status}` : ''}`;
    return `<button type="button" class="ux-chart-day${selected?' is-selected':''}${known?'':' is-unknown'}${entry.partial?' is-partial':''}" data-chart-date="${escapeHtml(entry.date)}" aria-pressed="${selected}" aria-label="${escapeHtml(label)}" style="--ux-bar-height:${(known?percent:0).toFixed(3)}%;--ux-cell-opacity:${(known?count/maxValue:0).toFixed(3)}"><span class="ux-chart-tip">${escapeHtml(dateText(entry.date,{day:'numeric',month:'short'}))}<strong>${displayed} ${t('completed','selesai')}</strong>${status?`<small>${escapeHtml(status)}</small>`:''}</span><span class="ux-chart-column"><span class="ux-chart-bar"></span>${cells?`<span class="ux-chart-cell-count">${displayed}</span>`:''}</span>${cells?'':`<span class="ux-chart-day-label">${escapeHtml(dateText(entry.date,{weekday:'short'}))}</span>`}</button>`;
  }).join('');
  const values=entries.map(entry=>`<li><button type="button" data-key="chart-value-${escapeHtml(entry.date)}" data-chart-date="${escapeHtml(entry.date)}" aria-pressed="${entry.date===selectedDate}"><span>${escapeHtml(dateText(entry.date,{weekday:'short',day:'numeric',month:'short'}))}${entry.partial?`<small>${t('Today · partial','Hari ini · belum berakhir')}</small>`:!entry.known?`<small>${t('Incomplete history','Riwayat belum lengkap')}</small>`:''}</span><strong>${entry.known?Number(entry.count)||0:'—'} <small>${t('completed','selesai')}</small></strong></button></li>`).join('');
  return `<div class="ux-activity-chart ux-activity-chart--${cells?'cells':'bars'}" aria-label="${t('Completed tasks','Tugas selesai')}"><div class="ux-chart-caption">${selection}<span title="${escapeHtml(averageBasis)}">${escapeHtml(averageText)}</span></div><div class="ux-chart-frame" style="--ux-chart-days:${entries.length};--ux-average:${((average || 0)/scale*100).toFixed(3)}%">${cells?'':`<div class="ux-chart-axis" aria-hidden="true"><span>${scale}</span><span>${Number.isInteger(scale/2)?number(scale/2):''}</span><span>0</span></div>`}<div class="ux-chart-plot"><div class="ux-chart-days">${!cells&&average!==null?`<span class="ux-chart-average" aria-hidden="true"><span>${t('Avg.','Rata-rata')} ${number(average)}</span></span>`:''}${buttons}</div></div>${cells?`<div class="ux-chart-range" aria-hidden="true"><span>${escapeHtml(dateText(entries[0].date,{day:'numeric',month:'short'}))}</span><span>${escapeHtml(dateText(entries.at(-1).date,{day:'numeric',month:'short'}))}</span></div>`:''}</div><details class="ux-chart-values"><summary>${t('View daily values','Lihat nilai harian')}</summary><p class="ux-chart-basis">${escapeHtml(averageBasis)}</p><ul>${values}</ul></details></div>`;
}
