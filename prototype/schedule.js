/* Schedule, meetings and availability. UX2 screens for W018 over SCH records (W035, W036, W096).
   Requirements: work_schedule (D23: as easy as Google Calendar), work_meeting_composer (R046, D9), work_availability,
   availability_declared, availability_overlap, availability_stale, design-availability-evidence, work_meeting_outcomes,
   integration-calendar (D24 two-way Google sync, simulated here; .ics export). Stories S024–S028.
   Loaded last: it starts the render loop. */
'use strict';
const TZ_LABEL = 'Asia/Jakarta (GMT+7)';
const CAL = {H0: 6, H1: 24, hr: 48};
const CW0 = 7 * 60, CW1 = 21 * 60; // composer ruler
Object.assign(ui, {calView: null, calDate: null, layers: {meetings: true, away: true, google: true, due: true}, ua: null});
const calView = () => ui.calView || (innerWidth < 1000 ? 'day' : 'week'); // narrow screens open on Day; Week stays one tap away
const calDate = () => ui.calDate || today();

// ---------- availability evidence (availability_overlap, availability_stale) ----------
// A weekly block repeats on its weekday; a one-off block has a date. One-off is the default (PRD_ALIGNMENT §3).
const uOn = (u, d) => u.weekly ? u.day === weekday(d) && (!u.from || d >= u.from) : u.date === d;
// Half-open intervals: 09:00–10:00 overlaps 09:30 but not a meeting that starts at 10:00.
const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;
// Unknown means nothing recorded at all: no declared unavailable time and no Google Calendar connection.
// A member with zero tasks is still Unknown (availability_stale, design-availability-evidence).
const coverage = pid => { const p = person(pid); if (!p) return 'unknown'; return p.gcal ? 'google' : db.unavailable.some(u => u.who === pid) ? 'declared' : 'unknown'; };
const BUSY_KIND = {meeting: 'In a meeting', invite: 'Invited to a meeting', away: 'Unavailable', google: 'Busy in Google Calendar'};
function busyFor(pid, date, opt = {}) {
  const out = [], p = person(pid), viewer = session.me, mine = pid === viewer;
  db.meetings.filter(mt => mt.date === date && mt.state !== 'cancelled' && mt.id !== opt.except && ['accepted', 'pending'].includes(mt.responses[pid])).forEach(mt => {
    // Other people's meeting titles show only to people invited to the same meeting.
    const kind = mt.responses[pid] === 'pending' ? 'invite' : 'meeting';
    out.push({s: mt.start, e: mt.end, kind, label: mt.responses[viewer] ? mt.title : L(BUSY_KIND[kind])}); });
  db.unavailable.filter(u => u.who === pid && uOn(u, date)).forEach(u => out.push({s: u.allDay ? 0 : u.start, e: u.allDay ? 1440 : u.end, kind: 'away', label: mine ? (u.note || L('Unavailable')) : L('Unavailable')})); // private note stays with its owner
  if (p && p.gcal) db.gbusy.filter(g => g.who === pid && g.date === date).forEach(g => out.push({s: g.start, e: g.end, kind: 'google', label: mine ? g.title : L('Busy in Google Calendar')})); // titles only to the owner (integration-calendar)
  return {list: out.sort((a, b) => a.s - b.s), cov: coverage(pid)};
}
const clashOf = (pid, date, s, e, opt) => busyFor(pid, date, opt).list.filter(x => overlaps(s, e, x.s, x.e));
const nameList = ids => { const n = ids.map(i => i === session.me ? L('you') : first(i)); return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} ${L('and')} ${n[n.length - 1]}`; };
const covLine = pid => { const c = coverage(pid); return c === 'google' ? L('Google Calendar connected') : c === 'declared' ? L('Unavailable time recorded') : L('No schedule recorded'); };

// ---------- Schedule page (work_schedule) ----------
const yTop = mm => (mm - CAL.H0 * 60) / 60 * CAL.hr;
const yToMin = y => Math.max(CAL.H0 * 60, Math.min(CAL.H1 * 60, CAL.H0 * 60 + Math.round(y / CAL.hr * 60 / 15) * 15));
function layoutDay(items) { // side-by-side columns for overlapping items, like Google Calendar
  items.sort((a, b) => a.s - b.s || b.e - a.e); let group = [], end = -1;
  const flush = () => { const cols = []; group.forEach(it => { let c = cols.findIndex(x => x <= it.s); if (c < 0) { c = cols.length; cols.push(0); } cols[c] = it.e; it.col = c; }); group.forEach(it => it.n = cols.length);
    // Items whose overlaps all start at least 30 min apart cascade full width with an indent, like Google; same-time starts split side by side.
    group.forEach(it => { const ov = group.filter(o => o !== it && overlaps(it.s, it.e, o.s, o.e)); it.casc = ov.every(o => Math.abs(o.s - it.s) >= 30); it.level = ov.filter(o => o.s < it.s).length; });
    group = []; };
  items.forEach(it => { if (group.length && it.s >= end) { flush(); end = -1; } group.push(it); end = Math.max(end, it.e); }); flush(); return items;
}
function dayItems(d) {
  const m = me(), lay = ui.layers, out = [];
  if (lay.meetings) db.meetings.filter(mt => mt.date === d && mt.state !== 'cancelled' && ['accepted', 'pending'].includes(mt.responses[m.id])).forEach(mt => out.push({kind: 'meeting', id: mt.id, s: mt.start, e: mt.end, mt, mine: mt.organizer === m.id}));
  if (lay.away) db.unavailable.filter(u => u.who === m.id && !u.allDay && uOn(u, d)).forEach(u => out.push({kind: 'unavail', id: u.id, s: u.start, e: u.end, u, mine: true}));
  if (lay.google && m.gcal) db.gbusy.filter(g => g.who === m.id && g.date === d).forEach(g => out.push({kind: 'gbusy', id: g.id, s: g.start, e: g.end, g}));
  return layoutDay(out);
}
// All-day row: date-only work never occupies hours (work_task_fields, timeline_unscheduled).
function allDayItems(d) {
  const m = me(), out = [];
  if (ui.layers.away) db.unavailable.filter(u => u.who === m.id && u.allDay && uOn(u, d)).forEach(u => out.push(`<button class="allday away" data-act="open-unavail" data-id="${u.id}">${esc(u.note || L('Unavailable'))}</button>`));
  if (ui.layers.due) {
    db.tasks.filter(t => t.owner === m.id && !t.trashed && !isDone(t) && t.due === d).sort((a, b) => (a.time ?? -1) - (b.time ?? -1)).forEach(t => out.push(`<button class="allday due ${t.due < today() ? 'late' : ''}" data-act="open-task" data-id="${t.id}" title="${esc(L('Due, not a time block'))}">${icon('check', 'ic-xs')}${t.time != null ? `<span class="t-num">${mins(t.time)}</span>` : ''}<span>${esc(t.title)}</span></button>`));
    db.milestones.filter(x => x.target === d && x.state !== 'achieved' && (x.owner === m.id || (projOf(x.project) || {}).lead === m.id)).forEach(x => out.push(`<button class="allday ms" data-act="open-ms" data-id="${x.id}">${icon('flag', 'ic-xs')}<span>${esc(x.title)}</span></button>`));
  }
  return out;
}
function evHtml(it) {
  const s = Math.max(it.s, CAL.H0 * 60), e = Math.min(it.e, CAL.H1 * 60); if (e <= s) return '';
  const h = yTop(e) - yTop(s), short = h < 40, me0 = session.me;
  let cls = '', title = '', sub = '', extra = '', aria = '';
  if (it.kind === 'meeting') { const mt = it.mt, pend = mt.responses[me0] === 'pending';
    const clash = db.unavailable.some(u => u.who === me0 && uOn(u, mt.date) && overlaps(mt.start, mt.end, u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end));
    cls = `${pend ? 'pending' : ''} ${mt.state === 'held' ? 'held' : ''} ${clash ? 'bad' : ''}`; title = `${clash ? `<em class="ev-flag">${L('Clash')}</em>` : ''}${tIcon(mt, 'xs')}${esc(mt.title)}${Object.keys(mt.reactions || {}).length ? `<span class="ev-rx">${Object.keys(mt.reactions).slice(0, 3).join('')}</span>` : ''}`; it.full = mt.title;
    sub = `${mins(mt.start)}–${mins(mt.end)}${pend ? `, ${L('reply needed')}` : ''}${clash ? `, ${L('clashes with your unavailable time')}` : ''}`;
    if (h >= 76) extra = `${mt.where ? `<small>${esc(/^https?:/.test(mt.where) ? mt.where.replace(/^https?:\/\//, '').split('/')[0] : mt.where)}</small>` : ''}<span class="avs">${Object.keys(mt.responses).filter(i => i !== me0).slice(0, 4).map(i => av(i)).join('')}</span>`;
    aria = `${mt.title}, ${dLong(mt.date)} ${mins(mt.start)}–${mins(mt.end)}${pend ? `, ${L('reply needed')}` : ''}${it.mine ? '' : `, ${L('organized by {who}', {who: pname(mt.organizer)})}`}`; }
  if (it.kind === 'unavail') { const u = it.u; cls = 'away'; title = esc(u.note || L('Unavailable')); it.full = u.note || L('Unavailable'); sub = `${mins(u.start)}–${mins(u.end)}${u.weekly ? `, ${L('every week')}` : ''}`; aria = `${L('Unavailable')}, ${mins(u.start)}–${mins(u.end)}`; }
  if (it.kind === 'gbusy') { const g = it.g; cls = 'gcal'; title = esc(g.title); it.full = g.title; sub = `${mins(g.start)}–${mins(g.end)}, Google`; aria = `${g.title}, ${L('from Google Calendar')}`; }
  const w = it.casc ? `calc(100% - 10px - ${it.level * 16}px)` : `calc((100% - 10px) / ${it.n})`, left = it.casc ? `${2 + it.level * 16}px` : `calc(2px + (100% - 10px) / ${it.n} * ${it.col})`;
  const hint = it.mine ? L('Drag to move, drag the bottom edge to resize, or use the arrow keys') : it.kind === 'gbusy' ? L('From Google Calendar. Edit it there.') : L('Organized by someone else, so it stays put');
  return `<div class="ev ${cls} ${short ? 'one' : ''} ${it.mine ? 'can-move' : ''}" style="top:${yTop(s)}px;height:${h - 2}px;left:${left};width:${w};right:auto;z-index:${(it.level || 0) + 1}" data-ev="${it.kind}" data-id="${it.id}" tabindex="0" role="button" aria-label="${esc(aria)}" title="${esc(`${it.full}\n${mins(it.s)}–${mins(it.e)}\n${hint}`)}"><b>${it.kind === 'gbusy' ? `<i class="gdot" aria-hidden="true"></i>` : ''}${title}</b><small>${sub}</small>${extra}${it.mine ? '<i class="rs" aria-hidden="true"></i>' : ''}</div>`;
}
function weekDays() { const v = calView(), a = calDate(); if (v === 'day') return [a]; const s = weekStart(a); return [...Array(7)].map((_, i) => addDays(s, i)); }
function calTitle() { const v = calView(), a = D(calDate());
  if (v === 'day') return `${WDL()[a.getDay()]}, ${a.getDate()} ${MONTH()[a.getMonth()]} ${a.getFullYear()}`;
  if (v === 'month') return `${MONTH()[a.getMonth()]} ${a.getFullYear()}`;
  const ds = weekDays(), f = D(ds[0]), l = D(ds[6]); return f.getMonth() === l.getMonth() ? `${MONTH()[f.getMonth()]} ${f.getFullYear()}` : `${MON()[f.getMonth()]} – ${MON()[l.getMonth()]} ${l.getFullYear()}`; }
function monthGrid() {
  const a = D(calDate()), first0 = iso(new Date(a.getFullYear(), a.getMonth(), 1)), start = weekStart(first0), m = me();
  const cells = [...Array(42)].map((_, i) => addDays(start, i)); const rows = D(cells[35]).getMonth() === a.getMonth() ? 6 : 5;
  return `<div class="month" style="--rows:${rows}"><div class="mh">${[1, 2, 3, 4, 5, 6, 0].map(i => `<span>${WD()[i]}</span>`).join('')}</div><div class="mg">${cells.slice(0, rows * 7).map(d => {
    const dd = D(d), items = [...allDayItems(d), ...dayItems(d).map(it => `<button class="mev ${it.kind}" data-act="open-ev" data-k="${it.kind}" data-id="${it.id}"><span class="t-num">${mins(it.s)}</span>${esc(it.kind === 'meeting' ? it.mt.title : it.kind === 'unavail' ? (it.u.note || L('Unavailable')) : it.g.title)}</button>`)];
    return `<div class="mc ${dd.getMonth() !== a.getMonth() ? 'out' : ''} ${d === today() ? 'today' : ''}"><button class="mday" data-act="cal-day" data-d="${d}" aria-label="${esc(dLong(d))}">${dd.getDate()}</button>${items.slice(0, 3).join('')}${items.length > 3 ? `<button class="mmore" data-act="cal-day" data-d="${d}">${L('{n} more', {n: items.length - 3})}</button>` : ''}</div>`; }).join('')}</div></div>`;
}
// Left panel like Google Calendar: create, a mini month, "Meet with", and the calendar list (owner review O2, D23).
function miniMonth() {
  const base = D(ui.mini || calDate()), y = base.getFullYear(), mo = base.getMonth(), first = iso(new Date(y, mo, 1)), start = weekStart(first), sel = weekDays(), m = me();
  const cells = [...Array(42)].map((_, i) => addDays(start, i)), busy = new Set(db.meetings.filter(mt => mt.state !== 'cancelled' && ['accepted', 'pending'].includes(mt.responses[m.id])).map(mt => mt.date));
  return `<div class="mini"><div class="mini-h"><b>${MONTH()[mo]} ${y}</b><span><button class="ib" data-act="mini-step" data-d="-1" aria-label="${esc(L('Previous month'))}">${icon('chevron-left', 'ic-sm')}</button><button class="ib" data-act="mini-step" data-d="1" aria-label="${esc(L('Next month'))}">${icon('chevron', 'ic-sm')}</button></span></div>
    <div class="mini-g">${[1, 2, 3, 4, 5, 6, 0].map(i => `<span class="mini-wd">${WD()[i].slice(0, 1)}</span>`).join('')}${cells.map(d => `<button class="mini-d ${D(d).getMonth() !== mo ? 'out' : ''} ${d === today() ? 'today' : ''} ${sel.includes(d) && calView() !== 'month' ? 'insel' : ''} ${busy.has(d) ? 'has' : ''}" data-act="cal-pick" data-d="${d}" aria-label="${esc(dLong(d))}">${D(d).getDate()}</button>`).join('')}</div></div>`;
}
const LAYERS = [['meetings', 'Meetings', 'sw-meet'], ['away', 'My unavailable time', 'sw-away'], ['google', 'Google Calendar busy time', 'sw-g'], ['due', 'Due dates and milestones', 'sw-due']];
PAGES.schedule = () => {
  const m = me(), v = calView(), days = weekDays();
  const col = d => { const isT = d === today(), nm = nowMin();
    return `<div class="cal-col ${isT ? 'today' : ''}" data-date="${d}">${dayItems(d).map(evHtml).join('')}${isT && nm > CAL.H0 * 60 && nm < CAL.H1 * 60 ? `<div class="now" style="top:${yTop(nm)}px"></div>` : ''}</div>`; };
  // Sync status stays visible (integration-calendar acceptance 3).
  const sync = m.gcal ? `<a class="srail-sync" href="#/settings">${state(L('Synced with Google Calendar'), 'check', 'green')}</a>` : `<button class="btn btn-ghost btn-sm srail-sync" data-act="gcal-connect">${icon('calendar')}${L('Connect Google Calendar')}</button>`;
  const grid = v === 'month' ? monthGrid() : `<div class="cal big" style="--hr:${CAL.hr}px;--days:${days.length}">
    <div class="cal-h"><span class="cal-gl tz">GMT+7</span>${days.map(d => `<button class="cal-d ${d === today() ? 'today' : ''}" ${v === 'week' ? `data-act="cal-day" data-d="${d}" title="${esc(L('Open this day'))}"` : 'tabindex="-1"'}><span>${WD()[D(d).getDay()]}</span><b>${D(d).getDate()}</b></button>`).join('')}</div>
    <div class="cal-all"><span class="cal-gl">${L('All day')}</span>${days.map(d => { const it = allDayItems(d); return `<div>${it.slice(0, 3).join('')}${it.length > 3 ? `<button class="allday more" data-act="cal-day" data-d="${d}">${L('{n} more', {n: it.length - 3})}</button>` : ''}</div>`; }).join('')}</div>
    <div class="cal-scroll" id="calscroll"><div class="cal-b" style="--rows:${CAL.H1 - CAL.H0}"><div class="cal-hrs">${[...Array(CAL.H1 - CAL.H0)].map((_, n) => n ? `<span style="top:${n * CAL.hr}px">${String(CAL.H0 + n).padStart(2, '0')}:00</span>` : '').join('')}</div>${days.map(col).join('')}</div></div></div>`;
  return {crumb: `<b>${L('Schedule')}</b>`, content: `<div class="page wide sched">
  <aside class="srail" aria-label="${esc(L('Calendar tools'))}">
    <button class="btn btn-pri srail-create" data-act="create-event">${icon('plus')}${L('Create')}</button>
    ${miniMonth()}
    <div class="mw"><label class="search">${icon('people')}<input id="mw" placeholder="${esc(L('Meet with…'))}" autocomplete="off" aria-label="${esc(L('Find a time with someone'))}" data-pm="mw"></label><div class="pm-host" data-key="mw"></div></div>
    <h3 class="srail-h">${L('My calendars')}</h3>
    <div class="srail-cals">${LAYERS.map(([k, l, sw]) => `<label class="srail-cal"><input type="checkbox" data-layer="${k}" ${ui.layers[k] ? 'checked' : ''}><i class="sw ${sw}"></i>${L(l)}</label>`).join('')}</div>
    ${sync}
  </aside>
  <div class="smain">
  <div class="sched-bar"><span class="cal-nav"><button class="btn" data-act="cal-today" title="${esc(L('Today'))} (T)">${L('Today')}</button><button class="ib" data-act="cal-step" data-d="-1" aria-label="${esc(L('Previous'))}" title="${esc(L('Previous'))} (K)">${icon('chevron-left')}</button><button class="ib" data-act="cal-step" data-d="1" aria-label="${esc(L('Next'))}" title="${esc(L('Next'))} (J)">${icon('chevron')}</button></span>
    <h1 class="t-h2 cal-title">${calTitle()}</h1><span class="jump"><button class="ib" data-act="cal-jump" aria-label="${esc(L('Go to date'))}" title="${esc(L('Go to date'))}">${icon('calendar', 'ic-sm')}</button><input type="date" id="cal-jump" value="${calDate()}" tabindex="-1" aria-hidden="true"></span>
    <span class="grow"></span>
    <button class="btn find-btn" data-act="composer">${icon('people')}${L('Find a time')}</button>
    <button class="ib" data-act="menu" data-menu="calhelp" aria-haspopup="dialog" aria-label="${esc(L('How the schedule works'))}" title="${esc(L('How the schedule works'))}">${icon('info')}</button>
    <div class="seg" role="radiogroup" aria-label="${esc(L('View'))}">${[['day', 'Day', 'D'], ['week', 'Week', 'W'], ['month', 'Month', 'M']].map(([k, l, key]) => `<button class="${v === k ? 'on' : ''}" data-act="cal-view" data-v="${k}" role="radio" aria-checked="${v === k}" title="${esc(L(l))} (${key})">${L(l)}</button>`).join('')}</div>
    <button class="ib phone-create" data-act="create-event" aria-label="${esc(L('Create'))}">${icon('plus')}</button></div>
  ${grid}</div></div>`};
};
MENUS.calhelp = () => `<div class="mhelp"><b>${L('How the schedule works')}</b><p>${L('Shortcuts: T today, D day, W week, M month, J next, K previous, C create.')}</p><p>${L('Click or drag on empty time to create. Drag your own meetings and unavailable time to move them, or select one and use the arrow keys. Meetings others organize stay put. Task due dates sit in the all-day row and never block hours.')}</p><p>${L('Arrow keys move a selected item by 15 minutes, Shift with arrows changes its length, Left and Right move it a day.')}</p></div>`;
MENUS.layers = () => [['meetings', 'Meetings'], ['away', 'My unavailable time'], ['google', 'Google Calendar busy time'], ['due', 'Due dates and milestones']].map(([k, l]) => `<div class="mi" data-act="layer" data-k="${k}" tabindex="0" role="menuitemcheckbox" aria-checked="${ui.layers[k]}"><span class="mi-l"><span class="cb ${ui.layers[k] ? 'on' : ''}"></span>${L(l)}</span></div>`).join('');

// ---------- quick card and full editor (D23: click or drag, quick card + full editor) ----------
const newDraft = (date, start, end, anchor) => ({kind: 'event', title: '', date, start, end, guests: [], where: '', notes: '', agenda: '', project: null, notetaker: null, repeat: false, allDay: false, timed: true, anchor});
const draftFromMeeting = mt => ({id: mt.id, kind: 'event', title: mt.title, date: mt.date, start: mt.start, end: mt.end, guests: Object.keys(mt.responses).filter(i => i !== mt.organizer), where: mt.where || '', notes: mt.notes || '', agenda: mt.agenda || '', project: mt.project, notetaker: mt.notetaker, repeat: false});
const timeOpts = (sel, from = 0, to = 1425) => { let o = ''; for (let t = from; t <= to; t += 15) o += `<option value="${t}" ${t === sel ? 'selected' : ''}>${mins(t)}</option>`; return o; };
const inEditor = () => ui.insp && ui.insp.type === 'event-edit';
function draftAvail(d) { // live known conflicts for the chosen time (work_meeting_composer acceptance 1)
  if (d.kind === 'busy') { const hit = db.meetings.filter(mt => mt.date === d.date && mt.state !== 'cancelled' && mt.responses[session.me] === 'accepted' && overlaps(d.allDay ? 0 : d.start, d.allDay ? 1440 : d.end, mt.start, mt.end));
    return hit.length ? `<p class="t-small warnline">${icon('warning', 'ic-xs')}${L('Overlaps {what}. The meeting stays; tell the organizer if you cannot attend.', {what: hit.map(mt => `${esc(mt.title)} ${mins(mt.start)}`).join(', ')})}</p>` : ''; }
  if (d.kind !== 'event' || !d.guests.length) return '';
  return `<div class="gav">${d.guests.map(g => { const c = clashOf(g, d.date, d.start, d.end, {except: d.id}), cov = coverage(g);
    const st0 = c.length ? state(L(BUSY_KIND[c[0].kind]), 'warning', 'danger') : cov === 'unknown' ? `<span class="tag tag-unknown">${L('Unknown')}</span>` : state(L('No recorded conflict'), 'check', 'green');
    return `<div>${av(g, 'av-xs')}<span>${esc(first(g))}</span>${st0}</div>`; }).join('')}</div>`;
}
function draftForm(d, full) {
  const kinds = [['event', 'Meeting'], ['busy', 'Unavailable'], ['task', 'Task']];
  const chips = d.guests.map(g => `<span class="tok">${av(g, 'av-xs')}${esc(first(g))}<button class="x" data-act="dg-del" data-id="${g}" aria-label="${esc(L('Remove {who}', {who: first(g)}))}">${icon('close', 'ic-xs')}</button></span>`).join('');
  const m = me(), projs = db.projects.filter(p => visibleDivs(m).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage));
  const when = d.kind === 'task' ? `<input type="date" class="input" id="d-date" value="${d.date}" aria-label="${esc(L('Due date'))}"><select class="input" id="d-start" aria-label="${esc(L('Time'))}"><option value="-1" ${d.timed ? '' : 'selected'}>${L('No time')}</option>${timeOpts(d.timed ? d.start : -1)}</select>`
    : `<input type="date" class="input" id="d-date" value="${d.date}" aria-label="${esc(L('Date'))}">${d.kind === 'busy' && d.allDay ? '' : `<select class="input" id="d-start" aria-label="${esc(L('Start'))}">${timeOpts(d.start)}</select><span>${L('to')}</span><select class="input" id="d-end" aria-label="${esc(L('End'))}">${timeOpts(d.end, d.start + 15, 1440)}</select>`}`;
  return `<input class="ttl" id="d-title" placeholder="${esc(d.kind === 'busy' ? L('Private note, for example Class') : d.kind === 'task' ? L('Task title') : L('Add title'))}" value="${esc(d.title)}" autocomplete="off">
  ${d.id ? '' : `<div class="seg kinds" role="radiogroup" aria-label="${esc(L('Type'))}">${kinds.map(([k, l]) => `<button class="${d.kind === k ? 'on' : ''}" data-act="d-kind" data-k="${k}" role="radio" aria-checked="${d.kind === k}">${L(l)}</button>`).join('')}</div>`}
  <div class="drow">${icon('clock')}<div class="dwhen">${when}</div></div>
  ${d.kind === 'event' || d.kind === 'busy' ? `<p class="t-small t-mute dnote">${L('Times in {tz}', {tz: TZ_LABEL})}</p>` : ''}
  ${d.kind === 'task' ? `<p class="t-small t-mute dnote">${L('A task shows on its due date in the all-day row. It never blocks out hours.')}</p>` : ''}
  ${d.kind === 'busy' ? `<div class="drow">${icon('undo')}<div class="dwhen"><label class="chk"><input type="checkbox" id="d-allday" ${d.allDay ? 'checked' : ''}>${L('All day')}</label><select class="input" id="d-repeat" aria-label="${esc(L('Repeat'))}"><option value="0" ${!d.repeat ? 'selected' : ''}>${L('Does not repeat')}</option><option value="1" ${d.repeat ? 'selected' : ''}>${L('Every week on {day}', {day: WDL()[D(d.date).getDay()]})}</option></select></div></div><p class="t-small t-mute dnote">${L('Others see only that you are unavailable. Your note stays private.')}</p>` : ''}
  ${d.kind === 'event' ? `<div class="drow">${icon('people')}<div class="dguests"><div class="chips">${chips}</div><input class="input" id="d-guest" placeholder="${esc(L('Add people'))}" autocomplete="off" aria-label="${esc(L('Add people'))}"><div class="gsug" id="gsug"></div>${draftAvail(d)}${d.guests.length ? `<button class="linkbtn" data-act="d-findtime">${L('Find a time with everyone')}</button>` : ''}</div></div>
  <div class="drow">${icon('link')}<input class="input" id="d-where" placeholder="${esc(L('Place or link, for example a Google Maps link'))}" value="${esc(d.where)}" aria-label="${esc(L('Place or link'))}"></div>` : draftAvail(d)}
  ${d.kind === 'event' && full ? `<div class="drow">${icon('projects')}<select class="input" id="d-project" aria-label="${esc(L('Project'))}"><option value="">${L('No project')}</option>${projs.map(p => `<option value="${p.id}" ${d.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
  <div class="drow">${icon('note')}<select class="input" id="d-notetaker" aria-label="${esc(L('Note-taker'))}">${[m.id, ...d.guests].map(i => `<option value="${i}" ${(d.notetaker || m.id) === i ? 'selected' : ''}>${esc(L('Note-taker: {who}', {who: i === m.id ? L('you') : pname(i)}))}</option>`).join('')}</select></div>
  <div class="drow">${icon('list')}<textarea class="textarea" id="d-agenda" placeholder="${esc(L('Agenda, one item per line'))}" aria-label="${esc(L('Agenda'))}">${esc(d.agenda)}</textarea></div>` : ''}
  <div class="dfoot">${full || d.kind !== 'event' ? '' : `<button class="btn btn-ghost" data-act="d-more">${L('More options')}</button>`}<button class="btn btn-pri" data-act="d-save">${L('Save')}</button></div>`;
}
function quickCard() { const d = ui.draft, a = d.anchor || {x: innerWidth / 2 - 210, y: 110}, w = Math.min(420, innerWidth - 24);
  const left = Math.max(12, Math.min(a.x, innerWidth - w - 12)), top = Math.max(12, Math.min(a.y, innerHeight - 520));
  return `<div class="scrim clear" data-act="d-cancel"></div><div class="pop qcard" role="dialog" aria-label="${esc(L('Create'))}" style="left:${left}px;top:${top}px;width:${w}px"><div class="qhead"><button class="ib" data-act="d-cancel" aria-label="${esc(L('Close'))}">${icon('close')}</button></div>${draftForm(d, false)}</div>`; }
INSP['event-edit'] = () => `${inspHead(ui.draft && ui.draft.id ? L('Edit meeting') : L('New'))}<div class="dform full">${ui.draft ? draftForm(ui.draft, true) : ''}</div>`;
function readDraft() { const d = ui.draft; if (!d) return; const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
  if (v('d-title') != null) d.title = v('d-title'); if (v('d-date')) d.date = v('d-date');
  if (v('d-start') != null) { const s = +v('d-start'); // a new start keeps the duration, like Google Calendar
    if (d.kind === 'task') { d.timed = s >= 0; if (s >= 0) d.start = s; }
    else if (s !== d.start) { const dur = Math.max(15, d.end - d.start); d.start = s; d.end = Math.min(1440, s + dur); }
    else if (v('d-end') != null && +v('d-end') > s) d.end = +v('d-end'); }
  const ad = $('#d-allday'); if (ad) d.allDay = ad.checked;
  ['where', 'notes', 'agenda'].forEach(k => { if (v('d-' + k) != null) d[k] = v('d-' + k); });
  if (v('d-project') != null) d.project = v('d-project') || null; if (v('d-notetaker') != null) d.notetaker = v('d-notetaker'); if (v('d-repeat') != null) d.repeat = v('d-repeat') === '1'; }
function refreshDraft(focusId) { if (inEditor()) render(); else renderLayer(); if (focusId) setTimeout(() => { const el = document.getElementById(focusId); if (el) el.focus(); }, 0); }
// One unread "changed" update per guest and meeting, however often it moves (work_updates: group repeats).
const notifyChanged = (g, mt) => { db.updates = db.updates.filter(u => !(u.to === g && u.type === 'changed' && !u.read && u.ref.id === mt.id)); notify(g, 'changed', {type: 'meeting', id: mt.id}); };
const span0 = (d, s, e) => `${dShort(d)} ${mins(s)}–${mins(e)}`;
const meetingWs = mt => (projOf(mt.project) || {}).div || (person(mt.organizer) || {}).div || ws();
const weekOf = d => { ui.calDate = d; };
function saveDraft() {
  readDraft(); const d = ui.draft, m = me(); if (!d) return; let msg = '', undo = null;
  if (d.kind === 'task') { const t = addTask(d.title || L('Untitled task'), {due: d.date, time: d.timed ? d.start : null}); msg = L('Task added to My Work'); undo = () => { db.tasks = db.tasks.filter(x => x !== t); rerender(); }; }
  else if (d.kind === 'busy') { const u = {id: uid('u'), who: m.id, day: weekday(d.date), date: d.repeat ? null : d.date, from: d.date, weekly: d.repeat, allDay: d.allDay, start: d.allDay ? 0 : d.start, end: d.allDay ? 1440 : d.end, note: d.title.trim(), createdAt: nowStamp()};
    db.unavailable.push(u); msg = d.repeat ? L('Weekly unavailable time saved') : L('Unavailable time saved'); undo = () => { db.unavailable = db.unavailable.filter(x => x !== u); rerender(); }; } // private: not written to workspace Changes (TASK_CONTROLS_AVAILABILITY)
  else if (d.id) { const mt = meetingOf(d.id), prev = JSON.parse(JSON.stringify(mt)), moved = mt.date !== d.date || mt.start !== d.start || mt.end !== d.end;
    Object.assign(mt, {title: d.title || L('Meeting'), date: d.date, start: d.start, end: d.end, where: d.where, notes: d.notes, agenda: d.agenda, project: d.project, notetaker: d.notetaker || mt.organizer});
    const keep = {[mt.organizer]: 'accepted'}; d.guests.forEach(g => { keep[g] = mt.responses[g] || 'pending'; if (!mt.responses[g]) notify(g, 'invite', {type: 'meeting', id: mt.id}); else if (moved) notifyChanged(g, mt); }); mt.responses = keep;
    logChange(meetingWs(mt), 'edited meeting', {type: 'meeting', id: mt.id, name: mt.title}, moved ? span0(prev.date, prev.start, prev.end) : null, moved ? span0(mt.date, mt.start, mt.end) : null);
    msg = L('Meeting updated. Guests see the change.'); undo = () => { Object.assign(mt, prev); rerender(); }; }
  else { const responses = {[m.id]: 'accepted'}; d.guests.forEach(g => responses[g] = 'pending');
    const mt = {id: uid('m'), title: d.title || L('Meeting'), organizer: m.id, date: d.date, start: d.start, end: d.end, where: d.where, agenda: d.agenda, notes: d.notes, notetaker: d.notetaker || m.id, project: d.project, state: 'planned', reason: '', minutes: null, responses, createdAt: nowStamp()};
    db.meetings.push(mt); d.guests.forEach(g => notify(g, 'invite', {type: 'meeting', id: mt.id})); if (d.guests.length) logChange(meetingWs(mt), 'scheduled', {type: 'meeting', id: mt.id, name: mt.title});
    msg = d.guests.length ? L('Invitations sent to {who}', {who: nameList(d.guests)}) : L('Saved to your calendar'); undo = () => { db.meetings = db.meetings.filter(x => x !== mt); db.updates = db.updates.filter(u => !(u.ref.type === 'meeting' && u.ref.id === mt.id)); rerender(); }; }
  ui.draft = null; if (inEditor()) ui.insp = null; if (route().page === 'schedule') weekOf(d.date); save(); render(); toast(msg, undo);
}

// ---------- meeting inspector: details, replies, outcomes (work_meeting_outcomes), .ics (integration-calendar) ----------
const RESP = {accepted: ['Going', 'check', 'green'], declined: ['Declined', 'close', 'mute'], pending: ['No reply yet', 'clock', 'ink2']};
const MT_ST = {planned: ['Planned', 'calendar', 'ink2'], held: ['Held', 'check', 'green'], cancelled: ['Canceled', 'close', 'danger']};
const whereHtml = w => !w ? `<span class="t-mute">${L('Not set')}</span>` : /^https?:\/\//.test(w) ? `<a href="${esc(w)}" target="_blank" rel="noopener">${esc(/maps|goo\.gl/.test(w) ? L('Open in Google Maps') : /meet\.google/.test(w) ? L('Join Google Meet') : w.replace(/^https?:\/\//, ''))}</a>` : esc(w);
INSP.meeting = x => {
  const mt = meetingOf(x.id), m = me(); if (!mt) return inspHead(L('Meeting'));
  const mine = mt.responses[m.id], org = mt.organizer === m.id, taker = (mt.notetaker || mt.organizer) === m.id, pr = projOf(mt.project), st0 = MT_ST[mt.state] || MT_ST.planned;
  if (!mine && !org && !visibleDivs(m).includes(meetingWs(mt))) return `${inspHead(L('Meeting'))}<div class="empty"><b>${L('You do not have access to this meeting')}</b><p>${L('Ask the organizer if you need it.')}</p></div>`; // neutral denial, no title leak
  const gc = Object.keys(mt.responses).filter(i => (person(i) || {}).gcal).length;
  const decs = db.decisions.filter(dc => dc.meeting === mt.id), fus = db.tasks.filter(t => t.meeting === mt.id && !t.trashed), offs = db.offers.filter(o => o.meeting === mt.id && o.state !== 'accepted'), minutes = mt.minutes && resOf(mt.minutes);
  const people0 = [...new Set([mt.organizer, ...Object.keys(mt.responses)])];
  const outcomes = mt.state === 'held' || minutes || decs.length || fus.length ? `<div class="sep"></div><h3 class="sec-h" style="margin-top:0">${L('Outcomes')}</h3>
    <dl class="meta"><dt>${L('Minutes')}</dt><dd>${minutes ? `${icon('note', 'ic-xs')}<a data-act="open-res" data-id="${minutes.id}">${esc(minutes.name)}</a>` : taker || org ? `<button class="btn btn-sm" data-act="write-minutes" data-id="${mt.id}">${icon('note')}${L('Write minutes')}</button>` : `<span class="t-mute">${L('Not written yet')}</span>`}</dd></dl>
    <b class="t-small sub-h">${L('Decisions')} <span class="n">${decs.length}</span></b><div class="rows">${decs.map(dc => `<div class="row" data-act="open-decision" data-id="${dc.id}" tabindex="0"><div class="t">${esc(dc.question)}<small>${esc(dc.result)}</small></div>${decState(dc)}</div>`).join('') || `<div class="empty-inline">${L('None recorded')}</div>`}</div>
    ${ui.form === 'decision' ? `<div class="quiet subform"><div class="field"><label for="dc-q">${L('Question')} <span class="req">*</span></label><input class="input" id="dc-q" data-autofocus><span class="help"></span></div><div class="field"><label for="dc-r">${L('Proposed result')}</label><input class="input" id="dc-r"></div><div class="field"><label for="dc-appr">${L('Who decides')}</label><select class="input" id="dc-appr">${peopleOptions(m.id, p => rank(p) >= 2)}</select><span class="help">${L('If someone else decides, it waits for their answer.')}</span></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="add-decision" data-id="${mt.id}">${L('Record')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : org || taker ? `<button class="linkbtn" data-act="form" data-f="decision">${icon('plus', 'ic-xs')} ${L('Record a decision')}</button>` : ''}
    <b class="t-small sub-h">${L('Follow-ups')} <span class="n">${fus.length + offs.length}</span></b><div class="rows">${fus.map(t => taskRow(t, {owner: true, noCtx: true})).join('')}${offs.map(o => `<div class="row" data-act="open-offer" data-id="${o.id}" tabindex="0">${av(o.to, 'av-xs')}<div class="t">${esc(o.title)}<small>${L('Offered to {who}', {who: esc(first(o.to))})}</small></div>${state(L(OFFER_ST[o.state][0]), OFFER_ST[o.state][1], OFFER_ST[o.state][2])}</div>`).join('') || `<div class="empty-inline">${L('None yet')}</div>`}</div>
    ${ui.form === 'followup' ? `<div class="quiet subform"><div class="field"><label for="fu-title">${L('Follow-up')} <span class="req">*</span></label><input class="input" id="fu-title" data-autofocus><span class="help"></span></div><div class="grid2"><div class="field"><label for="fu-owner">${L('Who')}</label><select class="input" id="fu-owner">${people0.map(i => `<option value="${i}" ${i === m.id ? 'selected' : ''}>${esc(i === m.id ? L('Me') : pname(i))}</option>`).join('')}</select></div><div class="field"><label for="fu-due">${L('Due')} <span class="opt">${L('Optional')}</span></label><input class="input" type="date" id="fu-due"></div></div><p class="t-small t-mute">${L('For someone else this is sent as an offer. Nothing is assigned until they accept.')}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="add-followup" data-id="${mt.id}">${L('Add')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : mine || org ? `<button class="linkbtn" data-act="form" data-f="followup">${icon('plus', 'ic-xs')} ${L('Add a follow-up')}</button>` : ''}` : '';
  return `${inspHead(L('Meeting'))}<h2 class="th2">${iconBtn('meeting', mt, org)}<span>${esc(mt.title)}</span></h2>${rxBubbles(mt, 'meeting', true)}${state(L(st0[0]), st0[1], st0[2], 'pill-o')}${mt.state === 'cancelled' && mt.reason ? `<p class="t-small t-mute">${L('Reason')}: ${esc(mt.reason)}</p>` : ''}
  <dl class="meta" style="margin-top:14px"><dt>${L('When')}</dt><dd>${dLong(mt.date)}, <span class="t-num">${mins(mt.start)}–${mins(mt.end)}</span></dd><dt>${L('Time zone')}</dt><dd>${TZ_LABEL}</dd><dt>${L('Where')}</dt><dd>${whereHtml(mt.where)}</dd>
    <dt>${L('Organizer')}</dt><dd>${av(mt.organizer, 'av-xs')}${esc(pname(mt.organizer))}</dd><dt>${L('Note-taker')}</dt><dd>${av(mt.notetaker || mt.organizer, 'av-xs')}${esc(pname(mt.notetaker || mt.organizer))}</dd>
    ${pr ? `<dt>${L('Project')}</dt><dd><a href="#/projects/${pr.id}">${esc(pr.name)}</a></dd>` : ''}<dt>${L('Created')}</dt><dd>${esc(stamp(mt.organizer, mt.createdAt))}</dd></dl>
  ${mt.agenda ? `<b class="t-small sub-h">${L('Agenda')}</b><ol class="agenda">${mt.agenda.split('\n').filter(Boolean).map(a => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}
  ${mine === 'pending' ? `<div class="notice n-info rsvpbox"><i class="n-ic" style="--m:${maskUrl(A.ui.calendar)}"></i><div><b>${L('{who} invited you', {who: esc(first(mt.organizer))})}</b><p>${(() => { const c = db.unavailable.filter(u => u.who === m.id && uOn(u, mt.date) && overlaps(mt.start, mt.end, u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end)); return c.length ? L('This overlaps your unavailable time.') : L('Nothing is accepted until you reply.'); })()}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="rsvp" data-id="${mt.id}" data-r="accepted">${L('Accept')}</button><button class="btn btn-sm" data-act="rsvp" data-id="${mt.id}" data-r="declined">${L('Decline')}</button></div></div></div>` : ''}
  <div class="sep"></div><b class="t-small sub-h">${L('Guests')} <span class="n">${Object.keys(mt.responses).length}</span></b>
  <div class="att-list">${Object.entries(mt.responses).map(([pid, r]) => `<div>${av(pid, 'av-sm')}<a data-act="open-person" data-id="${pid}">${esc(pname(pid))}</a>${pid === mt.organizer ? `<small class="t-mute">${L('organizer')}</small>` : ''}${state(L(RESP[r][0]), RESP[r][1], RESP[r][2])}</div>`).join('')}</div>
  <p class="t-small t-mute">${gc ? L('Also in Google Calendar for {n} guests who connected it. Prototype: sync is simulated.', {n: gc}) : L('No guest has connected Google Calendar.')}</p>
  ${outcomes}
  ${ui.form === 'cancel' ? `<div class="quiet subform"><div class="field"><label for="mc-reason">${L('Why is it canceled?')} <span class="req">*</span></label><input class="input" id="mc-reason" data-autofocus><span class="help">${L('Guests see this reason.')}</span></div><div class="acts"><button class="btn btn-danger btn-sm" data-act="cancel-meeting" data-id="${mt.id}">${L('Cancel meeting')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Keep it')}</button></div></div>` : ''}
  <div class="acts">${org && mt.state === 'planned' ? `<button class="btn" data-act="edit-meeting" data-id="${mt.id}">${icon('edit')}${L('Edit')}</button>${mt.date <= today() ? `<button class="btn" data-act="meeting-held" data-id="${mt.id}">${icon('check')}${L('Mark as held')}</button>` : ''}${ui.form !== 'cancel' ? `<button class="btn btn-danger" data-act="form" data-f="cancel">${icon('close')}${L('Cancel meeting')}</button>` : ''}` : ''}
    ${mine === 'accepted' && !org && mt.state === 'planned' ? `<button class="btn btn-ghost" data-act="rsvp" data-id="${mt.id}" data-r="declined">${L('Decline')}</button>` : ''}${mine === 'declined' && mt.state === 'planned' ? `<button class="btn" data-act="rsvp" data-id="${mt.id}" data-r="accepted">${L('Accept after all')}</button>` : ''}
    <button class="btn btn-ghost" data-act="ics" data-id="${mt.id}">${icon('download')}${L('Download .ics')}</button></div>`;
};
const DEC_ST = {awaiting: ['Awaiting decision', 'clock', 'warn'], approved: ['Approved', 'check', 'green'], rejected: ['Rejected', 'close', 'danger']};
const decState = dc => state(L(DEC_ST[dc.state][0]), DEC_ST[dc.state][1], DEC_ST[dc.state][2]);
function icsFor(mt) { // one VEVENT in Asia/Jakarta (integration-calendar: .ics stays available to everyone)
  const dt = (d, mm) => `${d.replace(/-/g, '')}T${mins(mm).replace(':', '')}00`, e = s => String(s || '').replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DWDG UII//dwdgONE prototype//EN', 'BEGIN:VTIMEZONE', 'TZID:Asia/Jakarta', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0700', 'TZOFFSETTO:+0700', 'TZNAME:WIB', 'END:STANDARD', 'END:VTIMEZONE',
    'BEGIN:VEVENT', `UID:${mt.id}@dwdg-one.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;TZID=Asia/Jakarta:${dt(mt.date, mt.start)}`, `DTEND;TZID=Asia/Jakarta:${dt(mt.date, mt.end)}`,
    `SUMMARY:${e(mt.title)}`, mt.where ? `LOCATION:${e(mt.where)}` : '', mt.agenda ? `DESCRIPTION:${e(mt.agenda)}` : '', mt.state === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
}

// ---------- unavailable time editor (availability_declared; recurrence default one-off) ----------
INSP.unavail = x => {
  const own = x.id ? db.unavailable.find(v => v.id === x.id) : null; if (x.id && !own) return inspHead(L('Unavailable time'));
  const u = ui.ua || (ui.ua = own ? {...own, date: own.date || own.from || calDate()} : {date: today(), start: 13 * 60, end: 15 * 60, allDay: false, weekly: false, note: ''});
  const hit = db.meetings.filter(mt => mt.state !== 'cancelled' && mt.responses[session.me] === 'accepted' && (u.weekly ? weekday(mt.date) === weekday(u.date) && mt.date >= u.date : mt.date === u.date) && overlaps(u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end, mt.start, mt.end));
  return `${inspHead(own ? L('Unavailable time') : L('Mark unavailable'))}<h2>${own ? esc(own.note || L('Unavailable')) : L('When are you unavailable?')}</h2><p class="t-small t-mute" style="margin:-4px 0 14px">${L('Others see only that you are unavailable. The note stays private to you. This is not a leave request.')}</p>
  <div class="field"><label for="ua-date">${u.weekly ? L('Starting') : L('Date')}</label><input class="input" type="date" id="ua-date" value="${u.date}"></div>
  <label class="chk"><input type="checkbox" id="ua-all" ${u.allDay ? 'checked' : ''}>${L('All day')}</label>
  ${u.allDay ? '' : `<div class="grid2"><div class="field"><label for="ua-s">${L('From')}</label><input class="input" type="time" step="900" id="ua-s" value="${mins(u.start)}"></div><div class="field" id="ua-ef"><label for="ua-e">${L('To')}</label><input class="input" type="time" step="900" id="ua-e" value="${mins(Math.min(u.end, 1439))}"><span class="help"></span></div></div>`}
  <label class="chk"><input type="checkbox" id="ua-weekly" ${u.weekly ? 'checked' : ''}>${L('Repeat every week on {day}', {day: WDL()[D(u.date).getDay()]})}</label>
  <div class="field" style="margin-top:12px"><label for="ua-note">${L('Private note')} <span class="opt">${L('Optional')}</span></label><input class="input" id="ua-note" value="${esc(u.note)}" placeholder="${esc(L('Class, lab, part-time work'))}"></div>
  <p class="t-small t-mute">${L('Times in {tz}', {tz: TZ_LABEL})}</p>
  ${hit.length ? `<div class="notice n-warn"><i class="n-ic" style="--m:${maskUrl(A.ui.warning)}"></i><div><b>${L('Overlaps meetings you accepted')}</b><p>${hit.map(mt => `${esc(mt.title)}, ${dShort(mt.date)} ${mins(mt.start)}`).join('<br>')}</p><p>${L('Those meetings stay as they are. Tell the organizer if you cannot attend.')}</p></div></div>` : ''}
  <div class="acts"><button class="btn btn-pri" data-act="save-unavail">${L('Save')}</button>${own ? `<button class="btn btn-danger" data-act="del-unavail">${icon('trash')}${L('Remove')}</button>` : `<button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button>`}</div>
  ${own ? `<dl class="meta" style="margin-top:18px"><dt>${L('Created')}</dt><dd>${own.createdAt ? esc(stamp(own.who, own.createdAt)) : `<span class="t-mute">${L('Not recorded')}</span>`}</dd></dl>` : ''}`;
};
function readUa() { const u = ui.ua; if (!u) return; const v = id => { const el = document.getElementById(id); return el ? el : null; };
  if (v('ua-date') && v('ua-date').value) u.date = v('ua-date').value; if (v('ua-all')) u.allDay = v('ua-all').checked; if (v('ua-weekly')) u.weekly = v('ua-weekly').checked;
  if (v('ua-s') && v('ua-s').value) u.start = toMin(v('ua-s').value); if (v('ua-e') && v('ua-e').value) u.end = toMin(v('ua-e').value); if (v('ua-note')) u.note = v('ua-note').value; }
INSP.gbusy = x => { const g = db.gbusy.find(v => v.id === x.id); if (!g) return inspHead(L('Google Calendar'));
  return `${inspHead(L('From Google Calendar'))}<h2>${esc(g.title)}</h2><dl class="meta"><dt>${L('When')}</dt><dd>${dLong(g.date)}, <span class="t-num">${mins(g.start)}–${mins(g.end)}</span></dd></dl><p class="t-small t-mute">${L('Only you see this title. Others see that you are busy. Edit it in Google Calendar; the change comes back here.')}</p>`; };

// ---------- meeting composer (R046, work_meeting_composer, S026) ----------
const DAYW = {mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7, sen: 1, sel: 2, rab: 3, kam: 4, jum: 5, sab: 6, min: 7};
function openComposer(prefill = '', extra = {}) {
  ui.menu = null; ui.composer = {text: prefill, title: '', date: addDays(today(), 1), dur: 30, manual: [], removed: [], people: [], start: null, where: '', touched: false, agenda: '', project: null, notetaker: null, more: false, ack: false, ...extra};
  parseComposer(); renderLayer(); setTimeout(() => { const i = $('#cin'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0);
}
function parseComposer() {
  const c = ui.composer, txt = c.text, m = me();
  const parsed = db.people.filter(p => p.id !== m.id && p.status === 'active' && new RegExp(`\\b${p.first}\\b`, 'i').test(txt)).map(p => p.id);
  c.people = [...new Set([...c.manual, ...parsed])].filter(i => !c.removed.includes(i));
  const dm = txt.match(/\b(today|tomorrow|hari ini|besok|mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/i);
  if (dm) { const w = dm[1].toLowerCase(); if (/^(today|hari ini)$/.test(w)) c.date = today(); else if (/^(tomorrow|besok)$/.test(w)) c.date = addDays(today(), 1); else { const t = DAYW[w.slice(0, 3)]; let n = t - weekday(today()); if (n <= 0) n += 7; c.date = addDays(today(), n); } }
  const du = txt.match(/\b(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|hour|hours|jam|m|min|mins|minutes|menit)\b/i);
  if (du) c.dur = Math.max(15, Math.min(240, Math.round((/^(h|jam)/i.test(du[2]) ? +du[1].replace(',', '.') * 60 : +du[1]) / 15) * 15));
  const tm = txt.match(/\b(\d{1,2})[:.](\d{2})\b/) || txt.match(/\b(\d{1,2})\s?(am|pm)\b/i);
  if (tm) { let hh = +tm[1]; if (tm[2] && /pm/i.test(tm[2]) && hh < 12) hh += 12; c.start = hh * 60 + (/am|pm/i.test(tm[2]) ? 0 : +tm[2]); c.touched = true; }
  const title = txt.split(/\s+(with|dengan)\s+/i)[0].replace(/\b(today|tomorrow|hari ini|besok|mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/ig, '').replace(/\b\d+(?:[.,]\d+)?\s*(h|hr|hrs|hour|hours|jam|m|min|mins|minutes|menit)\b/ig, '').replace(/\b\d{1,2}([:.]\d{2}|\s?(am|pm))\b/i, '').replace(/\b(at|jam|pukul)\s*$/i, '').replace(/\s{2,}/g, ' ').trim();
  c.title = title ? title[0].toUpperCase() + title.slice(1) : L('Meeting');
  if (!c.touched) c.start = suggestions()[0] ?? 9 * 60;
  c.start = Math.max(CW0, Math.min(CW1 - c.dur, c.start)); c.ack = false;
}
const everyone = () => [session.me, ...ui.composer.people];
const DAY_RX = /\b(today|tomorrow|hari ini|besok|mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/i;
const DUR_RX = /\b\d+(?:[.,]\d+)?\s*(h|hr|hrs|hour|hours|jam|m|min|mins|minutes|menit)\b/i, TIME_RX = /\b\d{1,2}([:.]\d{2}|\s?(am|pm))\b/i;
// The sentence with what was understood highlighted in place, as in R046 (people green, day/time/length grey).
function hlText(txt) {
  const marks = []; const add = (rx, cls) => { const m = txt.match(rx); if (m) marks.push([m.index, m.index + m[0].length, cls]); };
  add(DAY_RX, 'd'); add(DUR_RX, 'd'); add(TIME_RX, 'd');
  db.people.filter(p => p.status === 'active' && p.id !== session.me).forEach(p => { const m = txt.match(new RegExp(`\\b${p.first}\\b`, 'i')); if (m && ui.composer.people.includes(p.id)) marks.push([m.index, m.index + m[0].length, 'p']); });
  marks.sort((a, b) => a[0] - b[0]); let out = '', at = 0;
  for (const [a, b, cls] of marks) { if (a < at) continue; out += esc(txt.slice(at, a)) + `<mark class="hl-${cls}">${esc(txt.slice(a, b))}</mark>`; at = b; }
  return out + esc(txt.slice(at)) + ' ';
}
const EXAMPLES = ['Coffee with Salsa Friday 10:00 for 30 min', 'Roadmap check-in with Nadia and Fikri tomorrow 45 min', 'Survey review with Fikri Thursday 1 hour'];
// Beyond R046: the week at a glance, how many start times have no recorded conflict for everyone each day.
function weekStrip() {
  const c = ui.composer, ws0 = weekStart(c.date), span = CW1 - CW0;
  return `<div class="wstrip" role="radiogroup" aria-label="${esc(L('Days this week'))}">${[...Array(7)].map((_, i) => { const d = addDays(ws0, i), past = d < today();
    let ok = 0; const segs = []; for (let t = 8 * 60; t + c.dur <= CW1; t += 30) { const bad = everyone().some(pid => clashOf(pid, d, t, t + c.dur).length); if (!bad && !(d === today() && t < nowMin())) ok++; }
    everyone().forEach(pid => busyFor(pid, d).list.filter(x => x.e > CW0 && x.s < CW1).forEach(x => segs.push(`<i style="left:${(Math.max(x.s, CW0) - CW0) / span * 100}%;width:${(Math.min(x.e, CW1) - Math.max(x.s, CW0)) / span * 100}%"></i>`)));
    return `<button class="wd ${d === c.date ? 'on' : ''}" data-act="cpickday" data-d="${d}" ${past ? 'disabled' : ''} role="radio" aria-checked="${d === c.date}" aria-label="${esc(`${dLong(d)}, ${plural(ok, '{n} open start time', '{n} open start times')}`)}"><span class="wd-n">${WD()[D(d).getDay()]} <b>${D(d).getDate()}</b></span><span class="wd-bar">${segs.join('')}</span><span class="wd-c ${ok ? '' : 'none'}">${past ? L('Past') : ok ? plural(ok, '{n} open', '{n} open') : L('Full')}</span></button>`; }).join('')}</div>`;
}
const conflicts = (start, dur) => everyone().filter(pid => clashOf(pid, ui.composer.date, start, start + dur).length);
function suggestions() { const c = ui.composer, out = []; const from = c.date === today() ? Math.max(8 * 60, Math.ceil(nowMin() / 15) * 15) : 8 * 60; // suggestions start at 08:00; the ruler still shows 07:00
  for (let s = from; s + c.dur <= CW1 && out.length < 3; s += 15) if (!conflicts(s, c.dur).length) { out.push(s); s += 45; } return out; }
function composerBody() {
  const c = ui.composer, span = CW1 - CW0, pct = v => ((v - CW0) / span * 100).toFixed(3), m = me();
  const bad = conflicts(c.start, c.dur), unknown = everyone().filter(pid => coverage(pid) === 'unknown'), sug = suggestions();
  const lane = pid => { const p = person(pid), b = busyFor(pid, c.date);
    if (c.checking && c.checking.includes(pid)) return `<div class="lane">${av(pid)}<span class="nm"><b>${esc(p.first)}</b><small>${L('Checking Google Calendar…')}</small></span><div class="track"><span class="skel" style="height:100%;border-radius:8px"></span></div><span></span></div>`;
    return `<div class="lane">${av(pid)}<span class="nm"><b>${pid === session.me ? L('You') : esc(p.first)}</b><small>${esc(covLine(pid))}</small></span><div class="track">${b.list.filter(x => x.e > CW0 && x.s < CW1).map(x => `<i class="busy k-${x.kind}" style="left:${pct(Math.max(x.s, CW0))}%;width:${(Math.min(x.e, CW1) - Math.max(x.s, CW0)) / span * 100}%" title="${esc(`${x.label}, ${mins(x.s)}–${mins(x.e)}`)}"></i>`).join('')}${b.cov === 'unknown' ? `<i class="unk">${L('Nothing recorded, so availability is unknown')}</i>` : ''}</div>${pid !== session.me ? `<button class="ib lx" data-act="cp-del" data-id="${pid}" aria-label="${esc(L('Remove {who}', {who: p.first}))}">${icon('close', 'ic-xs')}</button>` : '<span></span>'}</div>`; };
  const clashTxt = bad.map(i => { const k = clashOf(i, c.date, c.start, c.start + c.dur)[0].kind; return `${i === session.me ? L('You') : first(i)}: ${L(BUSY_KIND[k]).toLowerCase()}`; }).join('; ');
  const projs = db.projects.filter(p => visibleDivs(m).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage));
  return `<div class="parsed">${c.people.map(pid => `<span class="tok">${av(pid, 'av-xs')}${esc(first(pid))}<button class="x" data-act="cp-del" data-id="${pid}" aria-label="${esc(L('Remove {who}', {who: first(pid)}))}">${icon('close', 'ic-xs')}</button></span>`).join('')}<span class="addp"><input id="cp-add" placeholder="${esc(L('Add people'))}" autocomplete="off" aria-label="${esc(L('Add people'))}" data-pm="cp"></span></div>
  ${!c.text && !c.manual.length ? `<div class="cex"><span class="t-small t-mute">${L('Try')}</span>${EXAMPLES.map(x => `<button class="cex-b" data-act="cex" data-x="${esc(L(x))}">${hlPreview(L(x))}</button>`).join('')}</div>` : ''}
  ${weekStrip()}
  <div class="cday"><span class="cday-l"><button class="ib" data-act="cday" data-d="-1" aria-label="${esc(L('Previous day'))}">${icon('chevron-left')}</button><input type="date" class="input" id="c-date" value="${c.date}" aria-label="${esc(L('Date'))}"><button class="ib" data-act="cday" data-d="1" aria-label="${esc(L('Next day'))}">${icon('chevron')}</button></span>
    <span class="cday-r"><label class="t-small t-mute" for="c-start">${L('Start')}</label><input type="time" class="input" id="c-start" step="900" value="${mins(c.start)}"><span class="step"><button class="ib" data-act="cdur" data-d="-15" aria-label="${esc(L('Shorter'))}">${icon('minus')}</button><b>${c.dur} ${L('min')}</b><button class="ib" data-act="cdur" data-d="15" aria-label="${esc(L('Longer'))}">${icon('plus')}</button></span></span></div>
  <div class="ruler"><span></span>${[...Array((CW1 - CW0) / 60)].map((_, n) => `<span>${String(CW0 / 60 + n).padStart(2, '0')}</span>`).join('')}<span></span></div>
  <div class="lanes" id="lanes">${everyone().map(lane).join('')}
    <div class="slot ${bad.length ? 'bad' : ''}" id="slot" tabindex="0" role="slider" aria-label="${esc(L('Meeting time. Arrow keys move it by 15 minutes, Shift by an hour.'))}" aria-valuemin="${CW0}" aria-valuemax="${CW1 - c.dur}" aria-valuenow="${c.start}" aria-valuetext="${mins(c.start)}–${mins(c.start + c.dur)}${bad.length ? `, ${esc(clashTxt)}` : ''}" style="left:calc(var(--l0) + (100% - var(--l0) - var(--l1)) * ${pct(c.start) / 100});width:calc((100% - var(--l0) - var(--l1)) * ${c.dur / span})"><span>${mins(c.start)}${bad.length ? ` · ${esc(L('clash'))}` : ''}</span></div></div>
  <div class="legend t-small t-mute"><span><i class="busy k-meeting"></i>${L('Meeting')}</span><span><i class="busy k-away"></i>${L('Unavailable')}</span><span><i class="busy k-google"></i>Google</span><span><i class="tag-unknown sw"></i>${L('Unknown')}</span></div>
  <div class="free">${sug.length ? `<span>${unknown.length ? L('No recorded conflict for people with a schedule at') : L('No recorded conflict at')}</span> ${sug.map(s => `<button class="chip ${s === c.start ? 'on' : ''}" data-act="cpick" data-s="${s}">${mins(s)}</button>`).join('')}` : L('No time without a recorded conflict on this day. Try another day.')}</div>
  <div class="csum ${bad.length ? 'bad' : ''}"><div><b>${esc(c.title)}${c.people.length ? ` ${L('with')} ${esc(nameList(c.people))}` : ''}</b><small>${dLong(c.date)}, ${mins(c.start)}–${mins(c.start + c.dur)}, ${TZ_LABEL}</small>
    ${bad.length ? `<small class="clash">${icon('warning', 'ic-xs')}${L('Clashes')}: ${esc(clashTxt)}</small>` : ''}${unknown.length ? `<small>${L('{who}: nothing recorded, so availability is unknown', {who: esc(nameList(unknown))})}</small>` : ''}</div>${bubbles(c.people, 'av-xs')}</div>
  ${c.more ? `<div class="cmore"><select class="input" id="c-project" aria-label="${esc(L('Project'))}"><option value="">${L('No project')}</option>${projs.map(p => `<option value="${p.id}" ${c.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><select class="input" id="c-notetaker" aria-label="${esc(L('Note-taker'))}">${everyone().map(i => `<option value="${i}" ${(c.notetaker || session.me) === i ? 'selected' : ''}>${esc(L('Note-taker: {who}', {who: i === session.me ? L('you') : pname(i)}))}</option>`).join('')}</select><textarea class="textarea" id="c-agenda" placeholder="${esc(L('Agenda, one item per line'))}" aria-label="${esc(L('Agenda'))}">${esc(c.agenda)}</textarea></div>` : `<button class="linkbtn" data-act="cmore">${L('Add agenda, project and note-taker')}</button>`}
  <div class="cctl"><label class="meet-t" title="${esc(L('Google Calendar creates the Meet link when it syncs. Prototype: no link is created.'))}"><input type="checkbox" id="c-meet" ${c.meet ? 'checked' : ''}><span class="toggle ${c.meet ? 'on' : ''}"></span>Meet</label><input class="loc" id="cloc" placeholder="${esc(L('Place or link, for example a Google Maps link'))}" value="${esc(c.where)}" aria-label="${esc(L('Place or link'))}">
    <button class="btn ${bad.length ? 'btn-danger' : 'btn-pri'}" data-act="csend" ${c.people.length ? '' : 'disabled'}>${bad.length && c.ack ? L('Send anyway') : L('Send invitations')} <span class="kbd">⏎</span></button></div>
  ${bad.length && c.ack ? `<p class="t-small ackline">${L('Clashes for {who}. They can still accept or decline; a clash is never treated as a yes.', {who: esc(nameList(bad))})}</p>` : ''}`;
}
function composer() { const c = ui.composer;
  return `<div class="scrim" data-act="close-layer"></div><div class="pop comp" role="dialog" aria-label="${esc(L('New meeting'))}"><div class="cin"><span class="cin-ic">${icon('calendar')}</span><span class="cin-wrap"><span class="cin-mirror" id="cmirror" aria-hidden="true">${hlText(c.text)}</span><input id="cin" value="${esc(c.text)}" placeholder="${esc(L('Describe it: who, which day, how long'))}" autocomplete="off" aria-label="${esc(L('Describe the meeting'))}" spellcheck="false"></span><button class="ib" data-act="close-layer" aria-label="${esc(L('Close'))}">${icon('close')}</button></div><div id="cbody">${composerBody()}</div></div>`; }
const refreshComposer = focusId => { const b = $('#cbody'); if (!b) return; b.innerHTML = composerBody(); if (focusId) { const el = document.getElementById(focusId); if (el) el.focus(); } };
function sendMeeting() {
  const c = ui.composer, m = me(); if (!c || !c.people.length) return;
  const bad = conflicts(c.start, c.dur); if (bad.length && !c.ack) { c.ack = true; refreshComposer(); return; } // availability_override is open: clash needs an explicit second confirm
  const mt = {id: uid('m'), title: c.title, organizer: m.id, date: c.date, start: c.start, end: c.start + c.dur, where: c.where, meet: !!c.meet, agenda: c.agenda, notetaker: c.notetaker || m.id, project: c.project, state: 'planned', reason: '', minutes: null, responses: {[m.id]: 'accepted', ...Object.fromEntries(c.people.map(p => [p, 'pending']))}, createdAt: nowStamp()};
  db.meetings.push(mt); c.people.forEach(p => notify(p, 'invite', {type: 'meeting', id: mt.id})); logChange(meetingWs(mt), 'scheduled', {type: 'meeting', id: mt.id, name: mt.title});
  save(); ui.composer = null; ui.calDate = c.date; renderLayer(); if (route().page !== 'schedule') go('schedule'); else render();
  toast(L('Invitations sent to {who}', {who: nameList(c.people)}), () => { db.meetings = db.meetings.filter(x => x !== mt); db.updates = db.updates.filter(u => !(u.ref.type === 'meeting' && u.ref.id === mt.id)); rerender(); });
}

// ---------- actions ----------
Object.assign(ACT, {
  composer: () => openComposer(),
  'find-with': (el, id) => { ui.insp = null; render(); openComposer('', {manual: [id]}); },
  'cal-jump': () => { const i = $('#cal-jump'); try { i.showPicker(); } catch { i.style.pointerEvents = 'auto'; i.focus(); } },
  'cal-today': () => { ui.calDate = today(); ui.mini = null; render(); },
  'cal-step': el => { ui.mini = null; const v = calView(), n = +el.dataset.d; if (v === 'month') { const a = D(calDate()); ui.calDate = iso(new Date(a.getFullYear(), a.getMonth() + n, 1)); } else ui.calDate = addDays(calDate(), n * (v === 'day' ? 1 : 7)); render(); },
  'cal-view': el => { ui.calView = el.dataset.v; render(); },
  'cal-day': (el, id, e) => { e.stopPropagation(); ui.calDate = el.dataset.d; ui.calView = 'day'; render(); },
  layer: el => { ui.layers[el.dataset.k] = !ui.layers[el.dataset.k]; ui.menu = null; renderLayer(); render(); },
  'open-ev': el => openEv(el.dataset.k || el.dataset.ev, el.dataset.id, el),
  'pop-details': el => openDetails(el.dataset.k, el.dataset.id),
  'pop-edit': (el, id) => { ui.menu = null; renderLayer(); ACT['edit-meeting'](el, id); },
  'pop-rsvp': (el, id, e) => { ACT.rsvp(el, id, e); ui.menu = null; renderLayer(); },
  'pop-del-unavail': (el, id) => { ui.menu = null; renderLayer(); const u = db.unavailable.find(x => x.id === id); db.unavailable = db.unavailable.filter(x => x !== u); save(); render(); toast(L('Unavailable time removed'), () => { db.unavailable.push(u); rerender(); }); },
  'cal-pick': el => { ui.calDate = el.dataset.d; ui.mini = null; render(); },
  'mini-step': el => { const b0 = D(ui.mini || calDate()); ui.mini = iso(new Date(b0.getFullYear(), b0.getMonth() + +el.dataset.d, 1)); render(); },
  'open-meeting': (el, id, e) => { if (e) e.stopPropagation(); ui.palette = false; ui.menu = null; ui.form = null; renderLayer(); ui.insp = {type: 'meeting', id}; render(); },
  'open-unavail': (el, id) => { ui.ua = null; ui.insp = {type: 'unavail', id}; render(); },
  'new-unavail': () => { ui.menu = null; renderLayer(); ui.ua = null; ui.insp = {type: 'unavail', id: null}; render(); },
  'gcal-connect': () => { const m = me(); m.gcal = true; save(); render(); toast(L('Prototype: Google Calendar connection simulated. Nothing was sent to Google.'), () => { m.gcal = false; rerender(); }); },
  rsvp: (el, id, e) => { if (e) e.stopPropagation(); const mt = meetingOf(id), m = me(), prev = mt.responses[m.id], r = el.dataset.r; mt.responses[m.id] = r; (mt.repliedAt = mt.repliedAt || {})[m.id] = nowStamp(); notify(mt.organizer, r === 'accepted' ? 'rsvp-yes' : 'rsvp-no', {type: 'meeting', id: mt.id});
    db.updates.filter(u => u.to === m.id && u.ref.type === 'meeting' && u.ref.id === id).forEach(u => u.read = true); save(); render();
    toast(r === 'accepted' ? L('You are going to {what}', {what: mt.title}) : L('You declined {what}. {who} was told.', {what: mt.title, who: first(mt.organizer)}), () => { mt.responses[m.id] = prev; rerender(); }); },
  'create-event': () => { const st = Math.min(Math.ceil(nowMin() / 60) * 60, 20 * 60); ui.draft = newDraft(route().page === 'schedule' ? calDate() : today(), st, st + 60, null); ui.menu = null; ui.insp = {type: 'event-edit'}; render(); setTimeout(() => $('#d-title') && $('#d-title').focus(), 0); },
  'd-kind': el => { readDraft(); ui.draft.kind = el.dataset.k; if (el.dataset.k === 'busy' && ui.draft.end - ui.draft.start < 15) ui.draft.end = ui.draft.start + 60; refreshDraft('d-title'); },
  'd-more': () => { readDraft(); ui.insp = {type: 'event-edit'}; render(); setTimeout(() => $('#d-agenda') && $('#d-agenda').focus(), 0); },
  'd-save': () => saveDraft(),
  'd-cancel': () => { ui.draft = null; if (inEditor()) ui.insp = null; render(); },
  'dg-add': (el, id) => { readDraft(); if (!ui.draft.guests.includes(id)) ui.draft.guests.push(id); refreshDraft('d-guest'); },
  'dg-del': (el, id) => { readDraft(); ui.draft.guests = ui.draft.guests.filter(g => g !== id); refreshDraft('d-guest'); },
  'd-findtime': () => { readDraft(); const d = ui.draft; ui.draft = null; if (inEditor()) ui.insp = null; render(); openComposer(d.title || '', {manual: [...d.guests], date: d.date, dur: Math.max(15, d.end - d.start), start: d.start, touched: true, where: d.where, agenda: d.agenda, project: d.project}); },
  'edit-meeting': (el, id) => { ui.draft = draftFromMeeting(meetingOf(id)); ui.form = null; ui.insp = {type: 'event-edit'}; render(); },
  'meeting-held': (el, id) => { const mt = meetingOf(id); mt.state = 'held'; mt.heldAt = nowStamp(); logChange(meetingWs(mt), 'marked held', {type: 'meeting', id: mt.id, name: mt.title}); save(); render(); toast(L('Marked as held. Add minutes, decisions and follow-ups.'), () => { mt.state = 'planned'; mt.heldAt = null; rerender(); }); },
  'cancel-meeting': (el, id) => { const mt = meetingOf(id), reason = ($('#mc-reason') || {}).value || ''; if (!reason.trim()) return invalid('#mc-reason', L('Give guests a reason.'));
    mt.state = 'cancelled'; mt.reason = reason.trim(); Object.keys(mt.responses).forEach(g => notify(g, 'cancelled', {type: 'meeting', id: mt.id})); logChange(meetingWs(mt), 'canceled meeting', {type: 'meeting', id: mt.id, name: mt.title});
    ui.form = null; save(); render(); toast(L('Meeting canceled. Guests were told.'), () => { mt.state = 'planned'; mt.reason = ''; rerender(); }); },
  ics: (el, id) => { const mt = meetingOf(id), url = URL.createObjectURL(new Blob([icsFor(mt)], {type: 'text/calendar'})), a = document.createElement('a'); a.href = url; a.download = `${mt.title.replace(/[^\w\- ]+/g, '').trim() || 'meeting'}.ics`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); },
  'write-minutes': (el, id) => { const mt = meetingOf(id), m = me(); const r = {id: uid('r'), kind: 'note', name: L('{title} minutes, {date}', {title: mt.title, date: dShort(mt.date)}), div: meetingWs(mt), parent: null, url: '', body: mt.agenda ? mt.agenda.split('\n').filter(Boolean).map(a => `${a}:\n`).join('\n') : '', purpose: '', project: mt.project, meeting: mt.id, owner: mt.notetaker || m.id, contributors: [], createdBy: m.id, createdAt: nowStamp(), pinned: false, revisions: 0, archived: false, reports: []};
    db.resources.push(r); mt.minutes = r.id; logChange(r.div, 'created note', {type: 'resource', id: r.id, name: r.name}); save(); ui.insp = {type: 'res', id: r.id}; render(); setTimeout(() => $('#r-body') && $('#r-body').focus(), 0); },
  'add-decision': (el, id) => { const mt = meetingOf(id), q = $('#dc-q').value.trim(), r = $('#dc-r').value.trim(), appr = $('#dc-appr').value; if (!q) return invalid('#dc-q', L('Write the question that was decided.'));
    const dc = {id: uid('d'), project: mt.project, meeting: mt.id, question: q, result: r, approver: appr, state: appr === session.me ? 'approved' : 'awaiting', decidedAt: appr === session.me ? nowStamp() : null, createdBy: session.me, createdAt: nowStamp()};
    db.decisions.push(dc); if (appr !== session.me) notify(appr, 'decision', {type: 'decision', id: dc.id}); logChange(meetingWs(mt), 'recorded a decision on', {type: 'meeting', id: mt.id, name: mt.title});
    ui.form = null; save(); render(); toast(dc.state === 'approved' ? L('Decision recorded') : L('Sent to {who} to decide', {who: first(appr)}), () => { db.decisions = db.decisions.filter(x => x !== dc); rerender(); }); },
  'add-followup': (el, id) => { const mt = meetingOf(id), title = $('#fu-title').value.trim(), owner = $('#fu-owner').value, due = $('#fu-due').value || null; if (!title) return invalid('#fu-title', L('Name the follow-up.'));
    let undo; if (owner === session.me) { const t = addTask(title, {due, project: mt.project, meeting: mt.id}); undo = () => { db.tasks = db.tasks.filter(x => x !== t); rerender(); }; }
    else { const o = {id: uid('o'), from: session.me, to: owner, title, result: '', due, project: mt.project, meeting: mt.id, state: 'pending', note: L('Follow-up from {what}', {what: mt.title}), task: null, at: nowStamp(), answeredAt: null}; db.offers.push(o); notify(owner, 'offer', {type: 'offer', id: o.id}); undo = () => { db.offers = db.offers.filter(x => x !== o); rerender(); }; }
    ui.form = null; save(); render(); toast(owner === session.me ? L('Follow-up added to your tasks') : L('Offered to {who}. Nothing is assigned until they accept.', {who: first(owner)}), undo); },
  'save-unavail': () => { readUa(); const u = ui.ua, m = me(); if (!u.allDay && !(u.end > u.start)) { const f = $('#ua-ef'); if (f) { f.classList.add('invalid'); f.querySelector('.help').textContent = L('End must be after start.'); } return; }
    const data = {date: u.weekly ? null : u.date, from: u.date, day: weekday(u.date), weekly: u.weekly, allDay: u.allDay, start: u.allDay ? 0 : u.start, end: u.allDay ? 1440 : u.end, note: (u.note || '').trim()};
    const own = ui.insp.id && db.unavailable.find(x => x.id === ui.insp.id), prev = own && {...own};
    if (own) Object.assign(own, data); else db.unavailable.push({id: uid('u'), who: m.id, createdAt: nowStamp(), ...data});
    ui.ua = null; ui.insp = null; save(); render(); toast(L('Unavailable time saved'), () => { if (own) Object.assign(own, prev); else db.unavailable.pop(); rerender(); }); },
  'del-unavail': () => { const u = db.unavailable.find(x => x.id === ui.insp.id); db.unavailable = db.unavailable.filter(x => x !== u); ui.ua = null; ui.insp = null; save(); render(); toast(L('Unavailable time removed'), () => { db.unavailable.push(u); rerender(); }); },
  cday: el => { const c = ui.composer; c.date = addDays(c.date, +el.dataset.d); if (!c.touched) c.start = suggestions()[0] ?? c.start; c.ack = false; refreshComposer(); },
  cdur: el => { const c = ui.composer; c.dur = Math.min(240, Math.max(15, c.dur + +el.dataset.d)); c.start = Math.min(CW1 - c.dur, c.start); c.ack = false; refreshComposer(); },
  cpick: el => { ui.composer.start = +el.dataset.s; ui.composer.touched = true; ui.composer.ack = false; refreshComposer('slot'); },
  'cp-add': (el, id) => { const c = ui.composer; c.manual.push(id); c.removed = c.removed.filter(x => x !== id); parseComposer(); refreshComposer('cp-add'); },
  'cp-del': (el, id) => { const c = ui.composer; c.manual = c.manual.filter(x => x !== id); c.removed.push(id); parseComposer(); refreshComposer('cp-add'); },
  cmore: () => { ui.composer.more = true; refreshComposer('c-agenda'); },
  cex: el => { const i = $('#cin'); i.value = el.dataset.x; i.focus(); ON_INPUT.cin(i); },
  cpickday: el => { const c = ui.composer; c.date = el.dataset.d; if (!c.touched) c.start = suggestions()[0] ?? c.start; else c.start = suggestions().includes(c.start) ? c.start : (suggestions()[0] ?? c.start); c.ack = false; refreshComposer(); },
  csend: () => sendMeeting(),
});
const guestMatches = (q, exclude) => db.people.filter(p => p.status === 'active' && p.id !== session.me && !exclude.includes(p.id) && p.name.toLowerCase().includes(q)).slice(0, 5);
ON_INPUT['d-guest'] = el => { const q = el.value.trim().toLowerCase(), box = $('#gsug'); if (box) box.innerHTML = q ? guestMatches(q, ui.draft.guests).map(p => `<div class="mi" data-act="dg-add" data-id="${p.id}" tabindex="0">${av(p.id, 'av-xs')}<span class="mi-l">${esc(p.name)}</span>${idl(p)}</div>`).join('') : ''; };
ON_INPUT['cp-add'] = el => { if (!ui.pm || ui.pm.key !== 'cp') ui.pm = {key: 'cp', group: null, idx: 0, level: 1, q: null}; ui.pm.closed = false; PICK.cp.refresh(); };
ON_INPUT.cin = el => { if (ui.pm && ui.pm.key === 'cp') ui.pm.closed = true; const c = ui.composer, before = c.people.slice(); c.text = el.value; parseComposer(); markChecking(before); const mir = $('#cmirror'); if (mir) mir.innerHTML = hlText(c.text); refreshComposer(); };
const hlPreview = txt => { const keep = ui.composer.people; ui.composer.people = db.people.filter(p => new RegExp(`\\b${p.first}\\b`).test(txt)).map(p => p.id); const h = hlText(txt); ui.composer.people = keep; return h; };
// Newly added people who connected Google Calendar show "Checking Google Calendar…" briefly, as the real fetch would.
function markChecking(before) { const c = ui.composer, fresh = c.people.filter(p => !before.includes(p) && (person(p) || {}).gcal); if (!fresh.length) return; c.checking = [...(c.checking || []), ...fresh]; setTimeout(() => { if (ui.composer === c) { c.checking = c.checking.filter(p => !fresh.includes(p)); refreshComposer(); } }, 450); }
PICK.cp = {
  refresh() { let box = document.getElementById('pmfloat'); if (!box) { box = document.createElement('div'); box.id = 'pmfloat'; box.className = 'pm-host'; box.dataset.key = 'cp'; document.body.appendChild(box); }
    const i = $('#cp-add'); if (!i || !ui.composer || !ui.pm || ui.pm.key !== 'cp' || ui.pm.closed) { box.innerHTML = ''; return; }
    box.innerHTML = pmHtml('cp', i.value.trim(), ui.composer.people); const r = i.getBoundingClientRect(); box.style.left = `${Math.max(8, Math.min(r.left, innerWidth - 270))}px`; box.style.top = `${r.bottom + 4}px`; },
  pick(id) { const c = ui.composer, before = c.people.slice(); ui.pm = null; c.manual.push(id); c.removed = c.removed.filter(x => x !== id); parseComposer(); markChecking(before); refreshComposer('cp-add'); },
};
document.addEventListener('focusin', e => { if (e.target.id === 'cp-add') ON_INPUT['cp-add'](e.target); });
document.addEventListener('scroll', e => { if (e.target.id === 'cin') { const mir = $('#cmirror'); if (mir) mir.style.transform = `translateX(${-e.target.scrollLeft}px)`; } }, true);
ON_CHANGE['c-meet'] = el => { ui.composer.meet = el.checked; refreshComposer(); };
ON_INPUT.cloc = el => { ui.composer.where = el.value; };
ON_INPUT['c-agenda'] = el => { ui.composer.agenda = el.value; };
ON_CHANGE['c-project'] = el => { ui.composer.project = el.value || null; };
ON_CHANGE['c-notetaker'] = el => { ui.composer.notetaker = el.value; };
ON_CHANGE['c-date'] = el => { if (!el.value) return; const c = ui.composer; c.date = el.value; if (!c.touched) c.start = suggestions()[0] ?? c.start; c.ack = false; refreshComposer('c-date'); };
ON_CHANGE['c-start'] = el => { if (!el.value) return; const c = ui.composer; c.start = Math.max(CW0, Math.min(CW1 - c.dur, Math.round(toMin(el.value) / 15) * 15)); c.touched = true; c.ack = false; refreshComposer('c-start'); };
ON_CHANGE['cal-jump'] = el => { if (el.value) { ui.calDate = el.value; render(); } };
['d-date', 'd-start', 'd-end', 'd-repeat', 'd-allday'].forEach(id => ON_CHANGE[id] = () => { readDraft(); refreshDraft(id); });
['ua-date', 'ua-s', 'ua-e', 'ua-all', 'ua-weekly'].forEach(id => ON_CHANGE[id] = () => { readUa(); render(); setTimeout(() => { const el = document.getElementById(id); if (el) el.focus(); }, 0); });
ON_INPUT['ua-note'] = el => { if (ui.ua) ui.ua.note = el.value; };
ON_INPUT['d-title'] = el => { if (ui.draft) ui.draft.title = el.value; };
document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.layer; if (!k) return; ui.layers[k] = e.target.checked; render(); });
PICK.mw = {
  refresh() { const i = $('#mw'), box = $('.pm-host[data-key="mw"]'); if (!i || !box) return; box.innerHTML = ui.pm && ui.pm.key === 'mw' && !ui.pm.closed ? pmHtml('mw', i.value.trim()) : ''; },
  pick(id) { ui.pm = null; const i = $('#mw'); if (i) i.value = ''; PICK.mw.refresh(); openComposer('', {manual: [id]}); },
};
ON_INPUT.mw = el => { if (!ui.pm || ui.pm.key !== 'mw') ui.pm = {key: 'mw', group: null, idx: 0, level: 1, q: null}; ui.pm.closed = false; PICK.mw.refresh(); };
document.addEventListener('focusin', e => { if (e.target.id === 'mw') ON_INPUT.mw(e.target); });
document.addEventListener('pointerdown', e => { if (ui.pm && !ui.pm.closed && !e.target.closest('.pm-host, [data-pm]')) { ui.pm.closed = true; const p = PICK[ui.pm.key]; if (p) p.refresh(); } });
// Google Calendar shortcuts on the Schedule page: T, D, W, M, J/N next, K/P previous, C create.
ON_KEY.push((e, typing) => {
  if (typing || e.ctrlKey || e.metaKey || e.altKey || route().page !== 'schedule' || ui.menu || ui.composer || ui.draft || ui.palette) return false;
  const k = e.key.toLowerCase(), view = {d: 'day', w: 'week', m: 'month'}[k];
  if (view) { ui.calView = view; render(); return true; }
  if (k === 't') { ui.calDate = today(); render(); return true; }
  if (k === 'j' || k === 'n' || k === 'k' || k === 'p') { ACT['cal-step']({dataset: {d: k === 'j' || k === 'n' ? 1 : -1}}); return true; }
  if (k === 'c') { e.preventDefault(); ACT['create-event'](); return true; }
  return false;
});
document.addEventListener('scroll', e => { if (e.target && e.target.id === 'calscroll') ui.calScroll = e.target.scrollTop; }, true);
document.addEventListener('submit', e => { if (e.target.closest('.qcard, .dform')) e.preventDefault(); });

function openDetails(kind, id) { ui.menu = null; renderLayer(); ui.form = null; ui.ua = null; ui.insp = {type: kind === 'meeting' ? 'meeting' : kind === 'unavail' ? 'unavail' : 'gbusy', id}; render(); }
function openEv(kind, id, anchor) {
  if (!anchor) return openDetails(kind, id);
  const R = anchor.getBoundingClientRect(), w = Math.min(360, innerWidth - 16), right = R.right + 10 + w <= innerWidth, x = right ? R.right + 10 : Math.max(8, R.left - w - 10);
  ui.menu = {type: 'evpop', k: kind, id, width: w, est: 320, rect: {left: x, right: x + w, top: R.top - 8, bottom: R.top - 8}}; renderLayer();
  setTimeout(() => { const f = $('.evp [data-autofocus]') || $('.evp button'); if (f) f.focus(); }, 0);
}
MENUS.evpop = mm => {
  const m = me(), close = `<button class="ib" data-act="close-layer" aria-label="${esc(L('Close'))}">${icon('close')}</button>`;
  if (mm.k === 'meeting') { const mt = meetingOf(mm.id); if (!mt) return ''; const r = mt.responses, mine = r[m.id], org = mt.organizer === m.id, ids = Object.keys(r);
    const going = ids.filter(i => r[i] === 'accepted').length, waiting = ids.filter(i => r[i] === 'pending').length, no = ids.filter(i => r[i] === 'declined').length;
    const clash = db.unavailable.some(u => u.who === m.id && uOn(u, mt.date) && overlaps(mt.start, mt.end, u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end));
    return `<div class="evp"><div class="evp-top"><i class="evp-sw ${mine === 'pending' ? 'pend' : ''}"></i><h3>${esc(mt.title)}</h3>${close}</div>
      <p class="evp-when">${dLong(mt.date)}, <span class="t-num">${mins(mt.start)}–${mins(mt.end)}</span><small>${TZ_LABEL}</small></p>
      ${clash ? `<p class="evp-warn">${icon('warning', 'ic-xs')}${L('Clashes with your unavailable time')}</p>` : ''}
      ${mt.where ? `<p class="evp-line">${icon('link', 'ic-sm')}${whereHtml(mt.where)}</p>` : ''}
      <p class="evp-line">${icon('people', 'ic-sm')}<span>${L('{n} guests', {n: ids.length})}: ${[going && L('{n} going', {n: going}), waiting && L('{n} waiting', {n: waiting}), no && L('{n} declined', {n: no})].filter(Boolean).join(', ')}</span>${bubbles(ids, 'av-xs')}</p>
      <p class="evp-line">${icon('person', 'ic-sm')}<span>${L('Organized by {who}', {who: esc(pname(mt.organizer))})}</span></p>
      ${mine && !org && mt.state === 'planned' ? `<div class="evp-rsvp"><span>${L('Going?')}</span><button class="btn btn-sm ${mine === 'accepted' ? 'btn-pri' : ''}" data-act="pop-rsvp" data-id="${mt.id}" data-r="accepted" ${mine === 'pending' ? 'data-autofocus' : ''}>${L('Yes')}</button><button class="btn btn-sm ${mine === 'declined' ? 'btn-pri' : ''}" data-act="pop-rsvp" data-id="${mt.id}" data-r="declined">${L('No')}</button></div>` : ''}
      <div class="evp-acts"><button class="btn btn-sm" data-act="pop-details" data-k="meeting" data-id="${mt.id}">${L('Details')}</button>${org && mt.state === 'planned' ? `<button class="btn btn-sm" data-act="pop-edit" data-id="${mt.id}">${icon('edit')}${L('Edit')}</button>` : ''}<button class="btn btn-sm btn-ghost" data-act="ics" data-id="${mt.id}">${icon('download')}.ics</button></div></div>`; }
  if (mm.k === 'unavail') { const u = db.unavailable.find(v => v.id === mm.id); if (!u) return '';
    return `<div class="evp"><div class="evp-top"><i class="evp-sw away"></i><h3>${esc(u.note || L('Unavailable'))}</h3>${close}</div>
      <p class="evp-when">${u.allDay ? L('All day') : `<span class="t-num">${mins(u.start)}–${mins(u.end)}</span>`}${u.weekly ? `, ${L('every {day}', {day: WDL()[u.day % 7]})}` : `, ${dLong(u.date)}`}</p>
      <p class="evp-line">${icon('lock', 'ic-sm')}<span>${L('Only you see this note. Others see that you are unavailable.')}</span></p>
      <div class="evp-acts"><button class="btn btn-sm" data-act="pop-details" data-k="unavail" data-id="${u.id}" data-autofocus>${icon('edit')}${L('Edit')}</button><button class="btn btn-sm btn-danger" data-act="pop-del-unavail" data-id="${u.id}">${icon('trash')}${L('Remove')}</button></div></div>`; }
  const g = db.gbusy.find(v => v.id === mm.id); if (!g) return '';
  return `<div class="evp"><div class="evp-top"><i class="evp-sw g"></i><h3>${esc(g.title)}</h3>${close}</div><p class="evp-when">${dLong(g.date)}, <span class="t-num">${mins(g.start)}–${mins(g.end)}</span></p>
    <p class="evp-line">${icon('lock', 'ic-sm')}<span>${L('From Google Calendar. Only you see this title; others see busy. Edit it in Google Calendar.')}</span></p></div>`;
};
function moveItem(kind, item, ns, ne, nd) {
  const prev = {start: item.start, end: item.end, date: item.date, day: item.day, from: item.from};
  item.start = ns; item.end = ne;
  if (kind === 'meeting') { item.date = nd; Object.keys(item.responses).filter(g => g !== item.organizer).forEach(g => notifyChanged(g, item)); logChange(meetingWs(item), 'moved meeting', {type: 'meeting', id: item.id, name: item.title}, span0(prev.date, prev.start, prev.end), span0(nd, ns, ne)); }
  else { item.day = weekday(nd); if (!item.weekly) item.date = nd; }
  save(); render();
  toast(kind === 'meeting' ? L('Moved to {when}. Guests see the change.', {when: `${dLong(nd)}, ${mins(ns)}`}) : item.weekly ? L('Unavailable time moved to {time} every {day}', {time: mins(ns), day: WDL()[D(nd).getDay()]}) : L('Unavailable time moved to {when}', {when: `${dLong(nd)}, ${mins(ns)}`}), () => { Object.assign(item, prev); rerender(); });
}
// Keyboard equivalents for every drag (W018 acceptance 1): arrows move 15 min, Shift+arrows resize, Left/Right change day.
ON_KEY.push((e, typing) => {
  if (e.target.id === 'slot' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); const c = ui.composer; c.start = Math.min(CW1 - c.dur, Math.max(CW0, c.start + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 60 : 15))); c.touched = true; c.ack = false; refreshComposer('slot'); return true; }
  if (e.key === 'Enter' && ['cin', 'cloc'].includes(e.target.id)) { e.preventDefault(); sendMeeting(); return true; }
  if (e.key === 'Enter' && e.target.id === 'd-guest') { e.preventDefault(); const f = $('#gsug .mi'); if (f) f.click(); return true; }
  if (e.key === 'Enter' && e.target.id === 'cp-add') { e.preventDefault(); const f = $('#cpsug .mi'); if (f) f.click(); return true; }
  if (e.key === 'Enter' && e.target.id === 'd-title') { e.preventDefault(); saveDraft(); return true; }
  const ev = e.target.closest && e.target.closest('.ev[data-ev]'); if (!ev || typing) return false;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEv(ev.dataset.ev, ev.dataset.id, ev); return true; }
  if (!ev.classList.contains('can-move') || !/^Arrow/.test(e.key)) return false;
  e.preventDefault(); const kind = ev.dataset.ev, item = kind === 'meeting' ? meetingOf(ev.dataset.id) : db.unavailable.find(v => v.id === ev.dataset.id), date = ev.closest('.cal-col').dataset.date;
  let ns = item.start, ne = item.end, nd = date; const step = e.key === 'ArrowUp' ? -15 : e.key === 'ArrowDown' ? 15 : 0;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') nd = addDays(date, e.key === 'ArrowLeft' ? -1 : 1);
  else if (e.shiftKey) ne = Math.max(ns + 15, Math.min(1440, ne + step)); else { ns = Math.max(0, Math.min(1440 - (ne - ns), ns + step)); ne = ns + (item.end - item.start); }
  moveItem(kind, item, ns, ne, nd); if (nd !== date && !weekDays().includes(nd)) { ui.calDate = nd; render(); }
  setTimeout(() => { const n = $(`.ev[data-ev="${kind}"][data-id="${item.id}"]`); if (n) n.focus(); }, 0); return true;
});
// Locked items (others' meetings, Google busy time) open on click.
document.addEventListener('click', e => { const ev = e.target.closest('.ev[data-ev]'); if (ev && !ev.classList.contains('can-move')) openEv(ev.dataset.ev, ev.dataset.id, ev); });
// Composer slot drag (keyboard arrows and the Start field do the same).
document.addEventListener('pointerdown', e => {
  const s = e.target.closest('#slot'); if (!s) return; e.preventDefault(); s.setPointerCapture(e.pointerId);
  const c = ui.composer, lanes = $('#lanes').getBoundingClientRect(), cs = getComputedStyle($('#lanes')), perMin = (lanes.width - parseFloat(cs.getPropertyValue('--l0')) - parseFloat(cs.getPropertyValue('--l1'))) / (CW1 - CW0), x0 = e.clientX, s0 = c.start;
  const move = ev => { c.start = Math.min(CW1 - c.dur, Math.max(CW0, s0 + Math.round((ev.clientX - x0) / perMin / 15) * 15)); c.touched = true; c.ack = false; refreshComposer(); };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); const n = $('#slot'); if (n) n.focus(); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
// Calendar: drag empty time to create; drag own items to move or resize (D23).
document.addEventListener('pointerdown', e => {
  const colEl = e.target.closest('.cal-col'); if (!colEl || e.button !== 0) return;
  const evEl = e.target.closest('.ev'); if (evEl && !evEl.classList.contains('can-move')) return;
  const colAt = x => $$('.cal-col').find(c => { const r = c.getBoundingClientRect(); return x >= r.left && x < r.right; });
  const yIn = (c, y) => y - c.getBoundingClientRect().top;
  e.preventDefault(); const x0 = e.clientX, y0 = e.clientY; let moved = false;
  if (evEl) {
    const kind = evEl.dataset.ev, id = evEl.dataset.id, item = kind === 'meeting' ? meetingOf(id) : db.unavailable.find(v => v.id === id);
    const resize = e.target.classList.contains('rs'), dur = item.end - item.start, grab = yToMin(yIn(colEl, y0)) - item.start;
    let ns = item.start, ne = item.end, nd = colEl.dataset.date;
    const move = ev => { if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return; moved = true; evEl.classList.add('dragging');
      const c = resize ? colEl : (colAt(ev.clientX) || colEl);
      if (resize) ne = Math.max(ns + 15, yToMin(yIn(c, ev.clientY))); else { ns = Math.max(CAL.H0 * 60, Math.min(CAL.H1 * 60 - dur, yToMin(yIn(c, ev.clientY)) - grab)); ne = ns + dur; nd = c.dataset.date; if (evEl.parentElement !== c) c.appendChild(evEl); }
      evEl.style.top = `${yTop(ns)}px`; evEl.style.height = `${yTop(ne) - yTop(ns) - 2}px`; evEl.style.left = '2px'; evEl.style.width = 'calc(100% - 10px)'; const sm = evEl.querySelector('small'); if (sm) sm.textContent = `${mins(ns)}–${mins(ne)}`; };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      if (!moved) { openEv(kind, id, evEl); return; } moveItem(kind, item, ns, ne, nd); };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); return;
  }
  // The new block starts in the 15-minute slot under the cursor (rounding to the nearest slot could start it below the click).
  const s0 = Math.min(Math.max(CAL.H0 * 60, CAL.H0 * 60 + Math.floor(yIn(colEl, y0) / CAL.hr * 60 / 15) * 15), CAL.H1 * 60 - 30); let ns = s0, ne = s0 + 60;
  const ghost = document.createElement('div'); ghost.className = 'ev draft';
  const paint = () => { ghost.style.top = `${yTop(ns)}px`; ghost.style.height = `${yTop(ne) - yTop(ns) - 2}px`; ghost.innerHTML = `<b>${esc(L('(No title)'))}</b><small>${mins(ns)}–${mins(ne)}</small>`; };
  paint(); colEl.appendChild(ghost);
  const move = ev => { const cur = yToMin(yIn(colEl, ev.clientY)); if (!moved && Math.abs(ev.clientY - y0) < 4) return; moved = true; ns = Math.min(s0, cur); ne = Math.max(s0 + 15, cur); paint(); };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
    const r = ghost.getBoundingClientRect(); ui.draft = newDraft(colEl.dataset.date, ns, ne, {x: r.right + 12 + 420 > innerWidth ? r.left - 432 : r.right + 12, y: r.top}); renderLayer(); setTimeout(() => $('#d-title') && $('#d-title').focus(), 0); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});

render();
// The composer's picker lives at page level; clear it whenever the composer closes.
new MutationObserver(() => { const f = document.getElementById('pmfloat'); if (f && f.innerHTML && !document.querySelector('.comp')) { f.innerHTML = ''; if (ui.pm && ui.pm.key === 'cp') ui.pm = null; } }).observe(document.getElementById('layer'), {childList: true});
