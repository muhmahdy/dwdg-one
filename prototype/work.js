/* My Work and tasks: work_my_tasks, work_task_fields, work_task_lifecycle, work_work_views, work_blockers,
   access_delegation (offers need consent), availability_person_inspector. WBS W015/W028/W029; stories S011–S016, S018. */
'use strict';
const invitesFor = id => db.meetings.filter(mt => mt.responses[id] === 'pending' && mt.organizer !== id && mt.state !== 'cancelled');
const offersFor = id => db.offers.filter(o => o.to === id && o.state === 'pending');
const reviewsFor = id => db.tasks.filter(t => !t.trashed && t.status === 'review' && t.reviewer === id);
const joinedOf = t => (t.assignees || []).filter(a => a.state === 'joined').map(a => a.id);
const taskPeople = t => [t.owner, ...joinedOf(t)];
const isSummary = t => !!t.phase || db.tasks.some(c => c.parent === t.id && !c.trashed);
const myTasks = () => db.tasks.filter(t => !t.trashed && !isSummary(t) && (t.owner === session.me || joinedOf(t).includes(session.me)));
const assignFor = id => db.tasks.filter(t => !t.trashed && (t.assignees || []).some(a => a.id === id && a.state === 'invited'));
const canEditTask = t => { const m = me(), p = projOf(t.project); return t.owner === m.id || joinedOf(t).includes(m.id) || t.createdBy === m.id || t.reviewer === m.id || (p &&(p.lead === m.id || p.pm === m.id)); };

// Task statuses reuse the colors and icons of the same words on project stages (owner review O7: one meaning, one look).
const TSTAT = {todo: ['Not started', 'circle', 'neutral'], doing: ['In progress', 'clock', 'active'], review: ['In review', 'search', 'review'], done: ['Completed', 'check', 'completed']};
const tstat = s => `<span class="st st-${TSTAT[s][2]} st-sm"><i class="st-ic" style="--m:${maskUrl(A.ui[TSTAT[s][1]])}"></i><span class="st-tx">${L(TSTAT[s][0])}</span></span>`;
const tState = t => openBlocker(t.id) && !isDone(t) ? state(L('Blocked'), 'warning', 'danger') : ['doing', 'review'].includes(t.status) ? tstat(t.status) : '';
// ---------- rows ----------
// People mentioned with @ show inline with their photo and name (owner request, 6 Oct; reference R001/R002 inline person).
// A mention never assigns the task: responsibility changes only through an accepted offer (access_delegation).
function taskTitle(t, noIcon) { let s = esc(t.title);
  for (const id of t.mentions || []) { const p = person(id); if (!p) continue; const n = esc(p.first); s = s.replace(new RegExp(`(^|[^\\w>])${n}(?![\\w<])`), (m, pre) => `${pre}<a class="person mention" data-act="open-person" data-id="${id}">${av(id, 'av-xs')}${n}</a>`); }
  return (noIcon ? '' : tIcon(t, 'xs')) + s; }
// Quick add understands @people, a day word and a time; the Due date chip still works on its own.
const DAYS_Q = {mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7, sen: 1, sel: 2, rab: 3, kam: 4, jum: 5, sab: 6, min: 7};
function parseQuick(text) {
  let title = text, due = null, time = null; const mentions = [];
  title = title.replace(/@([A-Za-z]+)/g, (m, n) => { const p = db.people.find(x => x.status === 'active' && x.first.toLowerCase() === n.toLowerCase()); if (!p) return m; if (!mentions.includes(p.id)) mentions.push(p.id); return p.first; });
  title = title.replace(/\b(today|tomorrow|hari ini|besok)\b/i, (m, w) => { due = addDays(today(), /^(tomorrow|besok)$/i.test(w) ? 1 : 0); return ''; });
  if (!due) title = title.replace(/\b(mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/i, (m, w) => { let n = DAYS_Q[w.toLowerCase().slice(0, 3)] - weekday(today()); if (n <= 0) n += 7; due = addDays(today(), n); return ''; });
  title = title.replace(/\b(?:at\s+|jam\s+|pukul\s+)?(\d{1,2})[:.](\d{2})\b/i, (m, a, b) => { if (+a > 23 || +b > 59) return m; time = +a * 60 + +b; return ''; });
  return {title: title.replace(/\s{2,}/g, ' ').trim(), due, time, mentions};
}
const ctxChip = t => { if (t.routine && rtOf(t.routine)) return `<span class="ctx rt">${icon('routine')}${esc(rtOf(t.routine).name)}</span>`; const pr = projOf(t.project); const d = div(taskDiv(t)); if (!d) return ''; return `<span class="ctx">${bicon(d.icon, false)}${esc(pr ? pr.name : d.short)}</span>`; };
const taskRow = (t, opt = {}) => { const d = dueLabel(t); const sel = ui.insp && ui.insp.type === 'task' && ui.insp.id === t.id;
  return `<div class="row trow ${isDone(t) ? 'done' : ''} ${sel ? 'sel' : ''}" data-act="open-task" data-id="${t.id}" tabindex="0">
  <button class="tick" data-act="toggle" data-id="${t.id}" aria-label="${esc(isDone(t) ? L('Mark not done') : L('Mark done'))}" ${canEditTask(t) ? '' : `disabled title="${esc(L('Only {who} or the project lead can change this task', {who: first(t.owner)}))}"`}><span class="cb ${isDone(t) ? 'on' : ''}"></span></button>
  <div class="t">${taskTitle(t)}${opt.owner ? `<small>${esc(pname(t.owner))}</small>` : ''}${rxBubbles(t, 'task')}</div>${tState(t)}${opt.noCtx ? '' : ctxChip(t)}${opt.owner || joinedOf(t).length ? bubbles(taskPeople(t), 'av-xs') : ''}<span class="due ${d.cls}">${d.txt}</span></div>`; };
const respRow = (kind, x) => {
  if (kind === 'assign') return assignRow(x);
  if (kind === 'invite') return `<div class="row inv" data-act="open-meeting" data-id="${x.id}" tabindex="0">${av(x.organizer)}<div class="t"><b>${esc(x.title)}</b><small>${L('{who} invited you, {when}', {who: esc(first(x.organizer)), when: `${dLong(x.date)}, ${mins(x.start)}–${mins(x.end)}`})}</small></div><span class="kind">${icon('calendar', 'ic-sm')}${L('Meeting')}</span><button class="btn btn-ghost btn-sm" data-act="rsvp" data-id="${x.id}" data-r="declined">${L('Decline')}</button><button class="btn btn-pri btn-sm" data-act="rsvp" data-id="${x.id}" data-r="accepted">${L('Accept')}</button></div>`;
  if (kind === 'offer') return `<div class="row inv" data-act="open-offer" data-id="${x.id}" tabindex="0">${av(x.from)}<div class="t"><b>${esc(x.title)}</b><small>${L('{who} asks if you can take this', {who: esc(first(x.from))})}${x.due ? `, ${L('needed by {d}', {d: dShort(x.due)})}` : ''}</small></div><span class="kind">${icon('people', 'ic-sm')}${L('Task offer')}</span><button class="btn btn-sm" data-act="open-offer" data-id="${x.id}">${L('Review')}</button></div>`;
  return `<div class="row inv" data-act="open-task" data-id="${x.id}" tabindex="0">${av(x.owner)}<div class="t"><b>${esc(x.title)}</b><small>${L('{who} sent this for your review', {who: esc(first(x.owner))})}</small></div><span class="kind">${icon('search', 'ic-sm')}${L('Review')}</span><button class="btn btn-sm" data-act="open-task" data-id="${x.id}">${L('Review')}</button></div>`;
};

// ---------- the three work views over the same task records (work_work_views) ----------
const VIEWS = [['list', 'List', 'list'], ['board', 'Board', 'board'], ['timeline', 'Timeline', 'gantt']];
const viewSeg = (scope, views = VIEWS) => { const cur = ui.view[scope] || 'list'; return `<div class="seg" role="radiogroup" aria-label="${esc(L('View'))}">${views.map(([k, l, i]) => `<button class="${cur === k ? 'on' : ''}" data-act="view" data-scope="${scope}" data-v="${k}" role="radio" aria-checked="${cur === k}">${icon(i, 'ic-sm')}${L(l)}</button>`).join('')}</div>`; };
function taskBoard(tasks, opt = {}) {
  return `<div class="board tboard">${TASK_ORDER.map(s => { const col = tasks.filter(t => t.status === s); return `<div class="col" data-drop="${s}"><div class="col-h"><span>${tstat(s)}</span><span class="n">${col.length}</span></div>
    ${col.map(t => { const d = dueLabel(t), b = openBlocker(t.id); return `<div class="card tcard ${ui.insp && ui.insp.id === t.id ? 'sel' : ''}" draggable="true" data-drag="${t.id}" data-act="open-task" data-id="${t.id}" tabindex="0"><b>${taskTitle(t)}</b>${b ? `<div class="ln">${state(L('Blocked'), 'warning', 'danger')}</div>` : ''}${rxBubbles(t, 'task')}<div class="ln">${opt.owner ? av(t.owner, 'av-xs') : ctxChip(t)}<span class="t-num ${d.cls === 'late' ? 'late' : ''}">${d.txt}</span><button class="ib mv" data-act="menu" data-menu="move" data-id="${t.id}" aria-label="${esc(L('Move to'))}">${icon('more')}</button></div></div>`; }).join('') || `<div class="col-empty">${L('Nothing here')}</div>`}</div>`; }).join('')}</div>
  <p class="t-small t-mute hint">${L('Drag a card to change its status, or use its menu.')}</p>`;
}
MENUS.move = mm => { const t = taskOf(mm.id); return `<div class="mi-h">${L('Move to')}</div>` + TASK_ORDER.map(s => `<div class="mi ${t.status === s ? 'on' : ''}" data-act="set-status" data-id="${t.id}" data-s="${s}" tabindex="0" role="menuitemradio" aria-checked="${t.status === s}"><span class="mi-l">${tstat(s)}</span>${t.status === s ? icon('check', 'tick') : ''}</div>`).join(''); };
// ---------- Gantt (owner review O6): measure-timeline, timeline_unscheduled, design-timeline-interactions ----------
// A bar needs an explicit planned start and a due date; a due-only task is a marker; undated work is listed below.
// Sticky task column and two-row header; the mouse wheel scrolls sideways; drag a bar or its ends, or use the arrow keys.
const GR = {'1w': [21, 56], '2w': [28, 40], '1m': [49, 28], '3m': [105, 14]}; // days shown, px per day
const gStart = () => addDays(weekStart(today()), -7);
function taskTimeline(tasks, opt = {}) { return ganttV2(tasks, opt); }
// Move or stretch dates: exactly one task changes, start never after due, date-only stays date-only (timeline_date_validation).
function setTaskDates(t, start, due) {
  if (start && due && start > due) return toast(L('The start cannot be after the due date.'));
  const prev = {start: t.start || null, due: t.due}; if (prev.start === start && prev.due === due) return;
  t.start = start; t.due = due; logChange(taskDiv(t), 'edited', {type: 'task', id: t.id, name: t.title}, prev.start ? `${dShort(prev.start)} – ${dShort(prev.due)}` : dShort(prev.due), start ? `${dShort(start)} – ${dShort(due)}` : dShort(due));
  save(); render(); toast(L('Dates changed to {d}', {d: start ? `${dShort(start)} – ${dShort(due)}` : dShort(due)}), () => { t.start = prev.start; t.due = prev.due; rerender(); });
}
const gShift = (t, kind, d) => kind === 'start' ? [addDays(t.start, d), t.due] : kind === 'due' ? [t.start || null, t.start ? (addDays(t.due, d) < t.start ? t.start : addDays(t.due, d)) : addDays(t.due, d)] : [t.start ? addDays(t.start, d) : null, addDays(t.due, d)];
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.g-bar.can, .g-pin.can'); if (!el || e.button !== 0) return; e.preventDefault();
  const t = taskOf(el.dataset.gt), kind = e.target.dataset.gk || 'move', px = +el.closest('.gantt').dataset.px, x0 = e.clientX, L0 = el.offsetLeft, W0 = el.offsetWidth; let d = 0, moved = false;
  const move = ev => { const dx = ev.clientX - x0; if (!moved && Math.abs(dx) < 4) return; moved = true; el.classList.add('dragging'); d = Math.round(dx / px);
    if (kind === 'move') el.style.left = `${L0 + d * px}px`; else if (kind === 'start') { el.style.left = `${L0 + d * px}px`; el.style.width = `${Math.max(px - 4, W0 - d * px)}px`; } else el.style.width = `${Math.max(px - 4, W0 + d * px)}px`; };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
    if (!moved) { ui.insp = {type: 'task', id: t.id}; render(); return; } if (!d) { render(); return; } const [s0, d0] = gShift(t, kind, d); setTaskDates(t, s0, d0); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
ON_KEY.push((e, typing) => {
  const el = !typing && e.target.closest && e.target.closest('.g-bar, .g-pin'); if (!el) return false; const t = taskOf(el.dataset.gt);
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ui.insp = {type: 'task', id: t.id}; render(); return true; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && el.classList.contains('can')) { e.preventDefault(); const [s0, d0] = gShift(t, e.shiftKey ? 'due' : 'move', e.key === 'ArrowRight' ? 1 : -1); setTaskDates(t, s0, d0);
    setTimeout(() => { const n = $(`[data-gt="${t.id}"]`); if (n) n.focus(); }, 0); return true; }
  return false;
});
// Mouse wheel scrolls the Gantt sideways until its edge, then the page scrolls as usual (owner review O6).
document.addEventListener('wheel', e => { const g = e.target.closest('.gantt, .ptl-scroll'); if (!g || e.target.closest('.g-label') || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; const max = g.scrollWidth - g.clientWidth;
  if (max <= 0 || (e.deltaY < 0 && g.scrollLeft <= 0) || (e.deltaY > 0 && g.scrollLeft >= max - 1)) return; e.preventDefault(); g.scrollLeft += e.deltaY; ui.ganttX = g.scrollLeft; }, {passive: false});
document.addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('gantt')) ui.ganttX = e.target.scrollLeft; }, true);
new MutationObserver(() => { const g = document.querySelector('.gantt:not([data-init])'); if (!g) return; g.dataset.init = '1'; const px = +g.dataset.px; g.scrollLeft = ui.ganttX != null ? ui.ganttX : Math.max(0, daysBetween(gStart(), today()) * px - 3 * px); }).observe(document.body, {childList: true, subtree: true});
Object.assign(ACT, {
  'g-today': () => { ui.ganttX = null; render(); },
  'g-jump': el => { const g = $('.gantt'), px = +g.dataset.px, i = daysBetween(gStart(), el.dataset.d); if (i >= 0 && i < GR[ui.range in GR ? ui.range : '1m'][0]) { g.scrollLeft = Math.max(0, i * px - 3 * px); return; } ui.range = '3m'; ui.ganttX = null; render(); },
});
function taskViews(scope, tasks, listFn, opt = {}) { const v = ui.view[scope] || 'list'; return v === 'board' ? taskBoard(tasks, opt) : v === 'timeline' ? taskTimeline(tasks, opt) : listFn(); }

// Optional due date as a quiet chip that opens the native picker (work_task_fields: date-only due).
// Owner review 6 Oct found the raw dd/mm/yyyy field noisy.
const qaDue = () => `<span class="qa-due"><button type="button" class="btn btn-ghost btn-sm" data-act="qa-date"><span class="cf-ic due">${svgD(FLAG_D)}</span><span class="qa-dl">${L('Due date')}</span></button><input type="date" class="qa-date" name="due" tabindex="-1" aria-label="${esc(L('Due date, optional'))}"></span>`;
ACT['qa-date'] = el => { const i = el.parentElement.querySelector('input'); try { i.showPicker(); } catch { i.focus(); } };
document.addEventListener('change', e => { if (!e.target.matches || !e.target.matches('.qa-date')) return; const box = e.target.parentElement; box.querySelector('.qa-dl').textContent = e.target.value ? dLong(e.target.value) : L('Due date'); box.classList.toggle('set', !!e.target.value); });

// ---------- My Work (D12 landing; work_home + work_my_tasks) ----------
PAGES.work = () => {
  const m = me(), td = today(), q = (ui.wq || '').toLowerCase();
  const mine = myTasks().filter(t => !q || t.title.toLowerCase().includes(q));
  const inv = invitesFor(m.id), offs = offersFor(m.id), revs = reviewsFor(m.id), asg = assignFor(m.id);
  const mtToday = db.meetings.filter(mt => mt.date === td && mt.responses[m.id] === 'accepted' && mt.state !== 'cancelled').sort((a, b) => a.start - b.start);
  const open = mine.filter(t => !isDone(t));
  const byDue = (a, b) => (a.due || '9').localeCompare(b.due || '9') || (a.time ?? 1e4) - (b.time ?? 1e4);
  const overdue = open.filter(t => t.due && t.due < td).sort(byDue), dueToday = open.filter(t => t.due === td).sort(byDue);
  const upcoming = open.filter(t => t.due && t.due > td).sort(byDue), undated = open.filter(t => !t.due);
  const done = mine.filter(isDone).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  const sec = (title, n, body) => `<h2 class="sec-h">${L(title)}${n != null ? ` <span class="n">${n}</span>` : ''}</h2>${body}`;
  const list = () => mwList({m, td, mine, inv, offs, revs, asg, mtToday});
  const view = ui.view.my || 'list';
  return {crumb: `<b>${L('My Work')}</b>`, content: `<div class="page wide mywork">
  <div class="ph"><div><h1 class="t-title">${L('My Work')}</h1><p class="sub">${WDL()[D(td).getDay()]}, ${D(td).getDate()} ${MONTH()[D(td).getMonth()]}</p></div><div class="ph-r">${rmShowBtn()}${viewSeg('my')}</div></div>
  ${roadmapStrip()}
  <form class="qa" data-form="add-task" autocomplete="off"><span class="qa-ic">${icon('plus')}</span><input id="qa" name="title" placeholder="${esc(innerWidth < 760 ? L('Add a task, @ to mention') : L('Add a task, for example: Sync with @Salsa Fri 14:00'))}" aria-label="${esc(L('Task title'))}">${qaDue()}<button class="btn btn-sm" type="submit">${L('Add')}</button></form><div class="qa-under" aria-live="polite"></div>
  ${view === 'list' ? '' : `<div class="toolbar"><label class="search">${icon('search')}<input id="wq" placeholder="${esc(L('Filter my tasks'))}" value="${esc(ui.wq || '')}"></label></div>`}
  ${taskViews('my', mine.filter(t => view !== 'list' || true), list, {add: 'me'})}</div>`};
};

// ---------- task actions ----------
function addTask(title, extra = {}) {
  title = (title || '').trim(); if (!title) return null;
  const m = me(), t = {id: uid('t'), title, owner: extra.owner || m.id, due: extra.due || null, time: extra.time ?? null, status: 'todo', reviewer: null, project: extra.project || null, milestone: extra.milestone || null, div: extra.div || (projOf(extra.project) || {}).div || m.div || ws(), notes: extra.notes || '', evidence: '', doneAt: null, createdBy: m.id, createdAt: nowStamp(), offer: extra.offer || null, meeting: extra.meeting || null, links: extra.links || [], mentions: extra.mentions || [], trashed: false};
  db.tasks.unshift(t); logChange(taskDiv(t), 'created task', {type: 'task', id: t.id, name: t.title});
  return t;
}
// Only the assignee, the creator or the project lead/PM may change a task (access_member_edit, work_task_lifecycle).
function setStatus(t, s, opt = {}) {
  if (!canEditTask(t)) { toast(L('Only {who} or the project lead can change this task', {who: first(t.owner)})); return; }
  const prev = {status: t.status, doneAt: t.doneAt, reviewer: t.reviewer}, m = me();
  if (s === 'review' && !t.reviewer) { const p = projOf(t.project); t.reviewer = [p && p.lead, t.createdBy, p && p.pm].find(x => x && x !== t.owner) || null; }
  t.status = s; t.doneAt = s === 'done' ? today() : null;
  if (s === 'review' && t.reviewer) notify(t.reviewer, 'review', {type: 'task', id: t.id});
  if (prev.status === 'review' && t.reviewer === m.id && t.owner !== m.id) notify(t.owner, s === 'done' ? 'approved' : 'returned', {type: 'task', id: t.id});
  logChange(taskDiv(t), s === 'done' ? 'completed' : prev.status === 'done' ? 'reopened' : 'changed status of', {type: 'task', id: t.id, name: t.title}, L(TASK_ST[prev.status][0]), L(TASK_ST[s][0]));
  save(); render();
  if (!opt.silent) toast(s === 'done' ? L('Task completed') : prev.status === 'done' ? L('Task reopened') : L('Moved to {s}', {s: L(TASK_ST[s][0])}), () => { Object.assign(t, prev); rerender(); });
}
Object.assign(ACT, {
  'new-task': () => { ui.menu = null; renderLayer(); if (route().page !== 'work') go('work'); setTimeout(() => $('#qa') && $('#qa').focus(), 40); },
  toggle: (el, id, e) => { e.stopPropagation(); const t = taskOf(id); setStatus(t, isDone(t) ? 'doing' : 'done'); },
  'open-task': (el, id) => { ui.palette = false; ui.menu = null; ui.form = null; renderLayer(); ui.insp = {type: 'task', id}; render(); },
  'set-status': (el, id) => { ui.menu = null; renderLayer(); const t = taskOf(id); if (t.status !== el.dataset.s) setStatus(t, el.dataset.s); },
  'show-done': () => { ui.showDone = !ui.showDone; render(); },
  range: el => { ui.range = el.dataset.r; ui.ganttX = null; render(); },
  trash: (el, id) => { const t = taskOf(id); t.trashed = true; logChange(taskDiv(t), 'moved to trash', {type: 'task', id: t.id, name: t.title}); save(); ui.insp = null; render(); toast(L('Task moved to trash'), () => { t.trashed = false; rerender(); }); },
  'review-approve': (el, id) => { const t = taskOf(id); t.reviewChoice = 'approved'; t.reviewedAt = nowStamp(); setStatus(t, 'done'); },
  'review-return': (el, id) => { const t = taskOf(id), note = ($('#rv-note') || {}).value || ''; t.returnNote = note.trim(); t.reviewChoice = 'returned'; t.reviewedAt = nowStamp(); ui.form = null; setStatus(t, 'doing'); },
  'raise-blocker': (el, id) => { const t = taskOf(id), text = $('#bk-text').value.trim(), owner = $('#bk-owner').value, action = $('#bk-action').value.trim(), sev = ($('[data-sev].on') || {dataset: {sev: 'medium'}}).dataset.sev;
    if (!text) return invalid('#bk-text', L('Say what is blocking the work.')); if (!owner) return invalid('#bk-owner', L('Choose who can unblock it.'));
    const b = {id: uid('b'), task: t.id, project: t.project, text, owner, severity: sev, action, state: 'open', openedBy: session.me, openedAt: nowStamp(), resolution: '', resolvedAt: null};
    db.blockers.push(b); notify(owner, 'blocker', {type: 'task', id: t.id}); logChange(taskDiv(t), 'raised a blocker on', {type: 'task', id: t.id, name: t.title});
    ui.form = null; save(); render(); toast(L('Blocker raised. {who} was told.', {who: first(owner)}), () => { db.blockers = db.blockers.filter(x => x !== b); rerender(); }); },
  sev: el => { $$('[data-sev]').forEach(b => b.classList.toggle('on', b === el)); },
  'resolve-blocker': (el, id) => { const b = db.blockers.find(x => x.id === id), t = taskOf(b.task); b.state = 'resolved'; b.resolution = ($('#bk-res') || {}).value || ''; b.resolvedAt = nowStamp(); b.resolvedBy = session.me;
    if (t.owner !== session.me) notify(t.owner, 'unblocked', {type: 'task', id: t.id}); logChange(taskDiv(t), 'resolved a blocker on', {type: 'task', id: t.id, name: t.title});
    ui.form = null; save(); render(); toast(L('Blocker resolved'), () => { b.state = 'open'; b.resolvedAt = null; rerender(); }); },
  // Offers: the recipient decides; silence never accepts (access_delegation, S013–S016).
  'new-offer': (el, id) => { ui.menu = null; renderLayer(); ui.insp = {type: 'new-offer', to: el && el.dataset.to || null, fromTask: el && el.dataset.task || null}; render(); setTimeout(() => $('#of-to') && $('#of-to').focus(), 0); },
  'send-offer': (el) => { const x = ui.insp, to = $('#of-to').value, title = $('#of-title').value.trim(), result = $('#of-result').value.trim();
    if (!to) return invalid('#of-to', L('Choose who you are asking.')); if (!title) return invalid('#of-title', L('Give the task a title.'));
    const o = {id: uid('o'), from: session.me, to, title, result, due: $('#of-due').value || null, project: $('#of-proj').value || null, state: 'pending', note: $('#of-note').value.trim(), task: x.fromTask || null, at: nowStamp(), answeredAt: null};
    db.offers.push(o); notify(to, 'offer', {type: 'offer', id: o.id}); ui.insp = {type: 'offer', id: o.id}; save(); render();
    toast(L('Sent to {who}. Nothing is assigned until they accept.', {who: first(to)}), () => { db.offers = db.offers.filter(v => v !== o); db.updates = db.updates.filter(u => !(u.ref.type === 'offer' && u.ref.id === o.id)); ui.insp = null; rerender(); }); },
  'open-offer': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'offer', id}; ui.form = null; render(); },
  'offer-answer': (el, id) => { const o = db.offers.find(v => v.id === id), r = el.dataset.r; o.state = r; o.answeredAt = nowStamp(); if (r === 'changes') o.reply = ($('#of-reply') || {}).value || '';
    if (r === 'accepted') { if (o.task) { const t = taskOf(o.task); t.owner = o.to; t.offer = o.id; } else { const t = addTask(o.title, {owner: o.to, due: o.due, project: o.project, notes: o.result ? `${L('Expected result')}: ${o.result}` : '', offer: o.id, links: o.resource ? [o.resource] : [], meeting: o.meeting || null, div: (projOf(o.project) || {}).div || (person(o.from) || {}).div}); t.createdBy = o.from; o.task = t.id; } }
    notify(o.from, r === 'accepted' ? 'offer-accepted' : r === 'declined' ? 'offer-declined' : 'offer-changes', {type: 'offer', id: o.id});
    ui.form = null; if (r === 'accepted') ui.insp = {type: 'task', id: o.task}; save(); render(); toast(r === 'accepted' ? L('Accepted. It is in your tasks now.') : r === 'declined' ? L('Declined. {who} was told.', {who: first(o.from)}) : L('Sent your questions to {who}', {who: first(o.from)})); },
  'offer-withdraw': (el, id) => { const o = db.offers.find(v => v.id === id); o.state = 'withdrawn'; o.answeredAt = nowStamp(); save(); render(); toast(L('Offer withdrawn')); },
  'open-person': (el, id) => { ui.palette = false; renderLayer(); ui.insp = {type: 'person', id}; render(); },
});
// Add task: the chip date wins over a day word in the text; the creator stays responsible.
document.addEventListener('submit', e => { const f = e.target.closest('[data-form="add-task"]'); if (!f) return; e.preventDefault();
  const q = parseQuick(f.title.value), due = f.due.value || q.due; const t = addTask(q.title, {due, time: due ? q.time : null, mentions: q.mentions, project: f.dataset.project || null, milestone: f.dataset.ms || null}); if (!t) return;
  save(); render(); toast(due ? L('Task added, due {d}', {d: dLong(due)}) : L('Task added'), () => { db.tasks = db.tasks.filter(x => x !== t); rerender(); }); setTimeout(() => $('#qa') && $('#qa').focus(), 0); });
// ---------- people picker: Presidency and divisions first, members on hover (owner review O5, D27) ----------
// Shared by quick add (@) and the meeting composer. Members show photo, nickname, then role. Keyboard: Up/Down, Right opens a group, Left goes back, Enter or Tab picks, Escape closes.
const PICK = {};
const pmGroups = exclude => { const act = db.people.filter(p => p.status === 'active' && p.id !== session.me && !exclude.includes(p.id)).sort((a, b) => rank(b) - rank(a));
  return [{id: 'lead', label: L('Presidency'), icon: 'role-president', people: act.filter(p => !p.div)}, ...DIVS.map(d => ({id: d.id, label: d.name, icon: d.icon, people: act.filter(p => p.div === d.id)}))].filter(g => g.people.length); };
function pmHtml(key, q, exclude = []) {
  let st = ui.pm && ui.pm.key === key ? ui.pm : (ui.pm = {key, group: null, idx: 0, level: 1, q: null});
  if (st.q !== q) { st.q = q; st.idx = 0; st.level = q ? 'flat' : 1; }
  const row = (p, act, ctx) => `<div class="mi pm-p ${act ? 'act' : ''}" data-act="pm-pick" data-key="${key}" data-id="${p.id}" role="menuitem" aria-label="${esc(`${p.name}, ${roleText(p)}`)}">${av(p.id, 'av-sm')}<b>${esc(p.first)}</b><span class="pm-ic">${ctx ? idl(p) : `${bicon(ROLES[p.role].icon)}${p.admin ? bicon('role-admin') : ''}`}</span></div>`;
  if (q) { const lq = q.toLowerCase(), hits = db.people.filter(p => p.status === 'active' && p.id !== session.me && !exclude.includes(p.id) && (p.first.toLowerCase().startsWith(lq) || p.name.toLowerCase().includes(lq))).slice(0, 7);
    st.items = hits.map(p => p.id); return `<div class="pm" role="menu">${hits.length ? `<div class="pm-l">${hits.map((p, i) => row(p, i === st.idx, true)).join('')}</div>` : `<div class="pm-l"><div class="empty-inline">${L('No one by that name')}</div></div>`}</div>`; }
  const gs = pmGroups(exclude), g = gs.find(x => x.id === st.group); st.groups = gs.map(x => x.id); st.items = g ? g.people.map(p => p.id) : [];
  return `<div class="pm"><div class="pm-l" role="menu" aria-label="${esc(L('Mention someone'))}">${gs.map((x, i) => `<div class="mi pm-g ${x.id === st.group ? 'on' : ''} ${st.level === 1 && i === st.idx ? 'act' : ''}" data-act="pm-group" data-key="${key}" data-g="${x.id}" role="menuitem" aria-haspopup="menu" aria-expanded="${x.id === st.group}">${bicon(x.icon, false)}<span class="mi-l">${esc(x.label)}</span><span class="n">${x.people.length}</span>${icon('chevron', 'ic-xs')}</div>`).join('')}</div>
    ${g ? `<div class="pm-r" role="menu" aria-label="${esc(g.label)}" style="--top:${Math.max(0, gs.indexOf(g) * 38 - 40)}px">${g.people.map((p, i) => row(p, st.level === 2 && i === st.idx)).join('')}</div>` : ''}</div>`;
}
const pmOpen = key => ui.pm && ui.pm.key === key && !ui.pm.closed && document.querySelector(`.pm-host[data-key="${key}"] .pm`);
Object.assign(ACT, {
  'pm-group': el => { const st = ui.pm; st.group = el.dataset.g; st.level = 2; st.idx = 0; PICK[el.dataset.key].refresh(); },
  'pm-pick': el => { PICK[el.dataset.key].pick(el.dataset.id); },
});
document.addEventListener('mouseover', e => { const g = e.target.closest('.pm-g'); if (!g || !ui.pm || ui.pm.group === g.dataset.g) return; ui.pm.group = g.dataset.g; ui.pm.level = 1; ui.pm.idx = ui.pm.groups.indexOf(g.dataset.g); PICK[g.dataset.key].refresh(); });
ON_KEY.push(e => {
  const key = e.target.dataset && e.target.dataset.pm; if (!key || !pmOpen(key)) return false; const st = ui.pm, list = st.level === 1 ? st.groups : st.items;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); st.idx = (st.idx + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % Math.max(1, list.length); if (st.level === 1) st.group = st.groups[st.idx]; PICK[key].refresh(); return true; }
  if (e.key === 'ArrowRight' && st.level === 1) { e.preventDefault(); st.group = st.groups[st.idx]; st.level = 2; st.idx = 0; PICK[key].refresh(); return true; }
  if (e.key === 'ArrowLeft' && st.level === 2) { e.preventDefault(); st.level = 1; st.idx = st.groups.indexOf(st.group); PICK[key].refresh(); return true; }
  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (st.level === 1) { st.group = st.groups[st.idx]; st.level = 2; st.idx = 0; PICK[key].refresh(); } else if (st.items[st.idx]) PICK[key].pick(st.items[st.idx]); return true; }
  if (e.key === 'Escape') { e.preventDefault(); st.closed = true; PICK[key].refresh(); return true; }
  return false;
});
// Quick add: live preview of what was understood (person, day, time) and the @ picker.
// Keep the picker inside the window: members open to the right, flip to the left, or stack below when there is no room.
new MutationObserver(() => document.querySelectorAll('.pm:not([data-fit])').forEach(pm => { pm.dataset.fit = '1'; const r2 = pm.querySelector('.pm-r'); if (!r2) return;
  const a = pm.getBoundingClientRect(), w = r2.offsetWidth + 6; if (innerWidth < 760) { pm.classList.add('stack'); return; } if (a.right + w <= innerWidth - 8) return; pm.classList.add(a.left - w >= 8 ? 'flip' : 'stack'); })).observe(document.body, {childList: true, subtree: true});
PICK.qa = {
  refresh() { const i = $('#qa'); if (i) ON_INPUT.qa(i, null, true); },
  pick(id) { const i = $('#qa'), p = person(id), pos = i.selectionStart, before = i.value.slice(0, pos).replace(/@([A-Za-z]*)$/, `@${p.first} `); i.value = before + i.value.slice(pos); i.focus(); i.setSelectionRange(before.length, before.length); ui.pm = null; ON_INPUT.qa(i); },
};
ON_INPUT.qa = (el, e, keep) => {
  const box = el.closest('form').nextElementSibling; if (!box || !box.classList.contains('qa-under')) return;
  el.dataset.pm = 'qa'; box.classList.add('pm-host'); box.dataset.key = 'qa';
  const at = el.value.slice(0, el.selectionStart).match(/@([A-Za-z]*)$/), q = parseQuick(el.value);
  if (at && !keep && ui.pm && ui.pm.key === 'qa') ui.pm.closed = false;
  if (at && !(ui.pm && ui.pm.key === 'qa' && ui.pm.closed)) { box.innerHTML = pmHtml('qa', at[1], q.mentions); return; }
  if (!at && ui.pm && ui.pm.key === 'qa') ui.pm = null;
  box.innerHTML = q.mentions.length || q.due || q.time != null ? `<div class="parsed qa-parsed">${q.mentions.map(id => `<span class="tok">${av(id, 'av-xs')}${esc(first(id))}</span>`).join('')}${q.due ? `<span class="tok time">${dLong(q.due)}</span>` : ''}${q.time != null ? `<span class="tok time">${mins(q.time)}</span>` : ''}${q.mentions.length ? `<span class="t-small t-mute">${L('Mentioned people see who it is about. You stay responsible.')}</span>` : ''}</div>` : '';
};

ON_INPUT.wq = el => { ui.wq = el.value; const pos = el.selectionStart; render(); const n = $('#wq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
function invalid(sel, msg) { const el = $(sel); if (!el) return; const f = el.closest('.field'); if (f) { f.classList.add('invalid'); const h = f.querySelector('.help'); if (h) h.textContent = msg; } el.focus(); }

// board drag (pointer accelerator; the card menu and the inspector are the non-drag routes)
document.addEventListener('dragstart', e => { const c = e.target.closest('[data-drag]'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.drag); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); });
document.addEventListener('dragover', e => { const col = e.target.closest('[data-drop]'); if (!col) return; e.preventDefault(); $$('[data-drop]').forEach(c => c.classList.toggle('over', c === col)); });
document.addEventListener('dragend', () => $$('[data-drop]').forEach(c => c.classList.remove('over')));
document.addEventListener('drop', e => { const col = e.target.closest('[data-drop]'); if (!col) return; e.preventDefault(); const t = taskOf(e.dataTransfer.getData('text/plain')); if (t && t.status !== col.dataset.drop) setStatus(t, col.dataset.drop); });

// ---------- task inspector ----------
const peopleOptions = (sel, filter = p => true, blank = '') => `${blank ? `<option value="">${esc(blank)}</option>` : ''}${DIVS.map(d => { const ps = db.people.filter(p => p.status === 'active' && p.div === d.id && filter(p)); return ps.length ? `<optgroup label="${esc(d.short)}">${ps.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>` : ''; }).join('')}${db.people.filter(p => !p.div && p.status === 'active' && filter(p)).map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}`;
INSP.task = x => {
  const t = taskOf(x.id), m = me(); if (!t) return inspHead(L('Task'));
  const pr = projOf(t.project), ms = db.milestones.find(v => v.id === t.milestone), links = (t.links || []).map(resOf).filter(Boolean), edit = canEditTask(t);
  const b = openBlocker(t.id), off = t.offer && db.offers.find(o => o.id === t.offer), mt = t.meeting && meetingOf(t.meeting);
  const statusSeg = `<div class="stgrid" role="radiogroup" aria-label="${esc(L('Status'))}">${TASK_ORDER.map(s => `<button class="${t.status === s ? 'on' : ''}" ${edit ? `data-act="set-status" data-id="${t.id}" data-s="${s}"` : 'disabled'} role="radio" aria-checked="${t.status === s}">${tstat(s)}</button>`).join('')}</div>`;
  const review = t.status === 'review' ? ((t.reviewer === m.id || canSignOff(t)) && t.owner !== m.id
    ? `<div class="notice n-info rv"><i class="n-ic" style="--m:${maskUrl(A.ui.search)}"></i><div><b>${L('{who} asked you to review this', {who: esc(first(t.owner))})}</b>${t.evidence ? `<p><a href="${esc(t.evidence)}" target="_blank" rel="noopener">${L('Open the submitted work')}</a></p>` : `<p>${L('No evidence link was added.')}</p>`}
       ${ui.form === 'return' ? `<div class="field" style="margin-top:10px"><label for="rv-note">${L('What needs to change?')}</label><textarea class="textarea" id="rv-note" data-autofocus></textarea></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="review-return" data-id="${t.id}">${L('Send back')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div>`
       : `<div class="acts"><button class="btn btn-pri btn-sm" data-act="review-approve" data-id="${t.id}">${icon('check')}${L('Approve')}</button><button class="btn btn-sm" data-act="form" data-f="return">${L('Ask for changes')}</button></div>`}</div></div>`
    : `<p class="t-small t-mute">${t.reviewer ? L('Waiting for {who} to review.', {who: esc(first(t.reviewer))}) : L('Choose a reviewer below.')}</p>`) : '';
  const returned = t.returnNote && t.status === 'doing' ? `<div class="notice n-warn"><i class="n-ic" style="--m:${maskUrl(A.ui.undo)}"></i><div><b>${L('Changes requested by {who}', {who: esc(first(t.reviewer))})}</b><p>${esc(t.returnNote)}</p></div></div>` : '';
  const blocker = b ? `<div class="notice n-error bk"><i class="n-ic" style="--m:${maskUrl(A.ui.warning)}"></i><div><b>${esc(b.text)}</b><p>${L('Needs {who}', {who: esc(pname(b.owner))})}${b.action ? `: ${esc(b.action)}` : ''}</p><p class="t-small">${sevTag(b.severity)} ${L('Raised by {who}', {who: esc(stamp(b.openedBy, b.openedAt))})}</p>
      ${ui.form === 'resolve' ? `<div class="field" style="margin-top:10px"><label for="bk-res">${L('How was it resolved?')} <span class="opt">${L('Optional')}</span></label><input class="input" id="bk-res" data-autofocus></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="resolve-blocker" data-id="${b.id}">${L('Mark resolved')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn btn-sm" data-act="form" data-f="resolve">${L('Resolve')}</button></div>`}</div></div>`
    : ui.form === 'blocker' ? `<div class="quiet bkform"><b class="t-h3">${L('Report a blocker')}</b>
      <div class="field"><label for="bk-text">${L('What is blocking the work?')} <span class="req">*</span></label><textarea class="textarea" id="bk-text" data-autofocus></textarea><span class="help"></span></div>
      <div class="field"><label for="bk-owner">${L('Who can unblock it?')} <span class="req">*</span></label><select class="input" id="bk-owner">${peopleOptions('', p => p.id !== m.id, L('Choose a person'))}</select><span class="help"></span></div>
      <div class="field"><label>${L('Severity')}</label><div class="seg">${['low', 'medium', 'high'].map(s => `<button class="${s === 'medium' ? 'on' : ''}" data-act="sev" data-sev="${s}" type="button">${L(SEV[s][0])}</button>`).join('')}</div></div>
      <div class="field"><label for="bk-action">${L('What do you need from them?')}</label><input class="input" id="bk-action"></div>
      <div class="acts"><button class="btn btn-pri" data-act="raise-blocker" data-id="${t.id}">${L('Raise blocker')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>` : '';
  const ro = (label, val) => `<dt>${label}</dt><dd>${val}</dd>`;
  return `${inspHead(L('Task'))}<h2 class="th2">${iconBtn('task', t, edit)}<span>${taskTitle(t, true)}</span></h2>${rxBubbles(t, 'task', true)}${isSummary(t) ? wbsSumNote(t) : statusSeg}${t.routine ? rtTaskBox(t) : ''}${review}${returned}${blocker}
    ${edit ? `<div class="field"><label for="f-title">${L('Title')}</label><input class="input" id="f-title" data-bind="title" value="${esc(t.title)}"></div>
    ${isSummary(t) ? '' : `<div class="grid2"><div class="field"><label for="f-due">${L('Due date')} <span class="opt">${L('Optional')}</span></label><input class="input" type="date" id="f-due" data-bind="due" value="${t.due || ''}"></div><div class="field"><label for="f-time">${L('Time')} <span class="opt">${L('Optional')}</span></label><input class="input" type="time" id="f-time" data-bind="time" value="${t.time != null ? mins(t.time) : ''}" ${t.due ? '' : 'disabled'}></div></div>
    <div class="field"><label for="f-start">${L('Planned start')} <span class="opt">${L('Optional, for the timeline')}</span></label><input class="input" type="date" id="f-start" data-bind="start" value="${t.start || ''}" ${t.due ? `max="${t.due}"` : 'disabled'}><span class="help"></span></div>
    `}${repeatField(t)}<div class="field"><label for="f-notes">${L('Notes')} <span class="opt">${L('Optional')}</span></label><textarea class="textarea" id="f-notes" data-bind="notes">${esc(t.notes)}</textarea></div>
    <div class="field"><label for="f-ev">${L('Evidence link')} <span class="opt">${L('Optional')}</span></label><input class="input" id="f-ev" data-bind="evidence" placeholder="https://" value="${esc(t.evidence)}"><span class="help">${L('A link to the finished work, for whoever reviews it.')}</span></div>
    ${signerFor(t) || canManageSignoff(t) || t.signedBy ? signoffField(t) : (t.status === 'review' || t.reviewer ? `<div class="field"><label for="f-rev">${L('Reviewer')}</label><select class="input" id="f-rev" data-bind="reviewer">${peopleOptions(t.reviewer, p => p.id !== t.owner, L('No reviewer'))}</select></div>` : '')}`
    : `${t.notes ? `<p class="t-small" style="white-space:pre-line">${esc(t.notes)}</p>` : ''}`}
    ${respSection(t, edit)}${depSection(t, edit)}
    <div class="sep"></div><dl class="meta">
      ${(t.mentions || []).length ? ro(L('Mentioned'), `<span class="mentions">${t.mentions.map(id => `<a class="person" data-act="open-person" data-id="${id}">${av(id, 'av-xs')}${esc(first(id))}</a>`).join('')}</span>`) : ''}
      ${!edit ? ro(L('Due'), t.due ? `${dLong(t.due)}${t.time != null ? `, ${mins(t.time)}` : ''}` : `<span class="t-mute">${L('No date')}</span>`) : ''}
      ${t.reviewer ? ro(L('Reviewer'), `${av(t.reviewer, 'av-xs')}${esc(pname(t.reviewer))}`) : ''}
      ${ro(L('Project'), pr ? `<a href="#/projects/${pr.id}">${esc(pr.name)}</a>` : `<span class="t-mute">${L('None, personal task')}</span>`)}
      ${ms ? ro(L('Milestone'), `${icon('flag', 'ic-xs')}${esc(ms.title)}`) : ''}
      ${off ? ro(L('Agreed'), L('Offered by {who}, accepted {d}', {who: esc(first(off.from)), d: dShort(off.answeredAt.slice(0, 10))})) : ''}
      ${mt ? ro(L('From meeting'), `<a data-act="open-meeting" data-id="${mt.id}">${esc(mt.title)}, ${dShort(mt.date)}</a>`) : ''}
      ${links.length ? ro(L('Linked'), links.map(r => `<a data-act="open-res" data-id="${r.id}">${esc(r.name)}</a>`).join(', ')) : ''}
      ${ro(L('Created'), `${av(t.createdBy, 'av-xs')}${esc(stamp(t.createdBy, t.createdAt))}`)}</dl>
    <div class="acts">${!b && !isDone(t) && ui.form !== 'blocker' ? `<button class="btn" data-act="form" data-f="blocker">${icon('warning')}${L('Report a blocker')}</button>` : ''}${t.owner === m.id && !isDone(t) ? `<button class="btn" data-act="new-offer" data-task="${t.id}">${icon('people')}${L('Ask someone else')}</button>` : ''}${t.owner === m.id || t.createdBy === m.id ? `<button class="btn btn-danger" data-act="trash" data-id="${t.id}">${icon('trash')}${L('Move to trash')}</button>` : ''}</div>`;
};
ON_CHANGE.bind = () => {};
document.addEventListener('change', e => { const el = e.target, b = el.dataset.bind; if (!b || !ui.insp || ui.insp.type !== 'task') return;
  const t = taskOf(ui.insp.id); if (!t) return; const before = t[b];
  if (b === 'time') t.time = toMin(el.value); else if (b === 'evidence' && el.value && !/^https:\/\//.test(el.value)) { invalid('#f-ev', L('Use a full link starting with https://')); return; } else if (b === 'start' && el.value && t.due && el.value > t.due) { invalid('#f-start', L('The start cannot be after the due date.')); return; } else t[b] = el.value || (b === 'due' || b === 'reviewer' || b === 'start' ? null : '');
  if (b === 'due' && !t.due) { t.time = null; t.start = null; } if (b === 'due' && t.start && t.due < t.start) t.start = null;
  if (b === 'reviewer' && t.reviewer && t.status === 'review') notify(t.reviewer, 'review', {type: 'task', id: t.id});
  if (b === 'title' || b === 'due') logChange(taskDiv(t), 'edited', {type: 'task', id: t.id, name: t.title}, b === 'due' ? (before ? dShort(before) : L('No date')) : null, b === 'due' ? (t.due ? dShort(t.due) : L('No date')) : null);
  save(); render(); toast(L('Saved')); });

// ---------- offers ----------
INSP['new-offer'] = x => { const m = me(), t = x.fromTask && taskOf(x.fromTask);
  const projs = db.projects.filter(p => visibleDivs(m).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage));
  return `${inspHead(L('Task for someone else'))}<h2>${t ? L('Ask someone to take this over') : L('Ask someone to do a task')}</h2>
  <p class="t-small t-mute" style="margin-top:-4px">${L('They can accept, ask for changes or decline. Nothing is assigned until they accept.')}</p>
  <div class="field"><label for="of-to">${L('Ask')} <span class="req">*</span></label><select class="input" id="of-to">${peopleOptions(x.to, p => p.id !== m.id, L('Choose a person'))}</select><span class="help"></span></div>
  <div class="field"><label for="of-title">${L('Task')} <span class="req">*</span></label><input class="input" id="of-title" value="${esc(t ? t.title : '')}"><span class="help"></span></div>
  <div class="field"><label for="of-result">${L('Expected result')}</label><input class="input" id="of-result" placeholder="${esc(L('What should exist when it is done?'))}"></div>
  <div class="grid2"><div class="field"><label for="of-due">${L('Needed by')} <span class="opt">${L('Optional')}</span></label><input class="input" type="date" id="of-due" value="${t && t.due ? t.due : ''}"></div>
  <div class="field"><label for="of-proj">${L('Project')} <span class="opt">${L('Optional')}</span></label><select class="input" id="of-proj"><option value="">${L('None')}</option>${projs.map(p => `<option value="${p.id}" ${t && t.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div></div>
  <div class="field"><label for="of-note">${L('Message')} <span class="opt">${L('Optional')}</span></label><textarea class="textarea" id="of-note"></textarea></div>
  <div class="acts"><button class="btn btn-pri" data-act="send-offer">${L('Send')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; };
const OFFER_ST = {pending: ['Waiting for an answer', 'clock', 'ink2'], accepted: ['Accepted', 'check', 'green'], declined: ['Declined', 'close', 'mute'], changes: ['Changes requested', 'undo', 'warn'], withdrawn: ['Withdrawn', 'close', 'mute']};
INSP.offer = x => { const o = db.offers.find(v => v.id === x.id), m = me(); if (!o) return inspHead(L('Task offer')); const pr = projOf(o.project), st = OFFER_ST[o.state];
  return `${inspHead(L('Task offer'))}<h2>${esc(o.title)}</h2>${state(L(st[0]), st[1], st[2], 'pill-o')}
  <dl class="meta" style="margin-top:14px"><dt>${L('From')}</dt><dd>${av(o.from, 'av-xs')}${esc(pname(o.from))}<small>${esc(roleText(person(o.from)))}</small></dd><dt>${L('To')}</dt><dd>${av(o.to, 'av-xs')}${esc(pname(o.to))}</dd>
  ${o.result ? `<dt>${L('Expected result')}</dt><dd>${esc(o.result)}</dd>` : ''}<dt>${L('Needed by')}</dt><dd>${o.due ? dLong(o.due) : `<span class="t-mute">${L('No date')}</span>`}</dd>${pr ? `<dt>${L('Project')}</dt><dd><a href="#/projects/${pr.id}">${esc(pr.name)}</a></dd>` : ''}<dt>${L('Sent')}</dt><dd>${esc(stamp(o.from, o.at))}</dd></dl>
  ${o.note ? `<p class="quote">${esc(o.note)}</p>` : ''}${o.reply ? `<p class="quote"><b>${esc(first(o.to))}:</b> ${esc(o.reply)}</p>` : ''}
  ${o.to === m.id && o.state === 'pending' ? (ui.form === 'changes' ? `<div class="field"><label for="of-reply">${L('What would you need changed?')}</label><textarea class="textarea" id="of-reply" data-autofocus></textarea></div><div class="acts"><button class="btn btn-pri" data-act="offer-answer" data-id="${o.id}" data-r="changes">${L('Send')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div>`
    : `<div class="acts"><button class="btn btn-pri" data-act="offer-answer" data-id="${o.id}" data-r="accepted">${icon('check')}${L('Accept')}</button><button class="btn" data-act="form" data-f="changes">${L('Ask for changes')}</button><button class="btn btn-ghost" data-act="offer-answer" data-id="${o.id}" data-r="declined">${L('Decline')}</button></div><p class="t-small t-mute">${L('Declining has no penalty. {who} will see your answer.', {who: esc(first(o.from))})}</p>`) : ''}
  ${o.from === m.id && o.state === 'pending' ? `<div class="acts"><button class="btn btn-ghost" data-act="offer-withdraw" data-id="${o.id}">${L('Withdraw')}</button></div>` : ''}
  ${o.state === 'accepted' && o.task ? `<div class="acts"><button class="btn" data-act="open-task" data-id="${o.task}">${L('Open the task')}</button></div>` : ''}`; };

// ---------- person inspector: workload evidence without private notes (availability_person_inspector) ----------
INSP.person = x => { const p = person(x.id), m = me(); if (!p) return inspHead(L('Person')); const self = p.id === m.id, wk = ui.pweek || weekStart(today());
  const badge = [p.admin ? `<span class="pbadge">${L('Admin')}</span>` : '', p.role === 'board' ? `<span class="pbadge">${L('Board')}</span>` : ''].join('');
  const between = db.tasks.filter(t => !t.trashed && !isDone(t) && !isSummary(t) && !self && ((taskPeople(t).includes(p.id) && (t.createdBy === m.id || t.reviewer === m.id || taskPeople(t).includes(m.id) || (t.mentions || []).includes(m.id))) || (taskPeople(t).includes(m.id) && (t.createdBy === p.id || t.reviewer === p.id || (t.mentions || []).includes(p.id))))).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const offs = self ? [] : db.offers.filter(o => o.state === 'pending' && ((o.from === m.id && o.to === p.id) || (o.from === p.id && o.to === m.id)));
  const other = db.tasks.filter(t => !t.trashed && !isDone(t) && !isSummary(t) && taskPeople(t).includes(p.id) && !between.includes(t) && (self || visibleDivs(m).includes(taskDiv(t)))).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const li = p.linkedin ? `<a href="https://${esc(p.linkedin.replace(/^https?:\/\//, ''))}" target="_blank" rel="noopener noreferrer">${esc(p.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>` : `<span class="t-mute">${L('Not shared')}</span>`;
  const ph = p.phone && (!p.hidePhone || self) ? `<a href="tel:${esc(p.phone.replace(/[^+\d]/g, ''))}" class="t-num">${esc(p.phone)}</a>${self && p.hidePhone ? ` <span class="t-small t-mute">${L('hidden from others')}</span>` : ''}` : `<span class="t-mute">${L('Not shared')}</span>`;
  return `${inspHead(L('Person'))}<div class="pp2">${av(p.id, 'av-xl')}<div class="pp2-t"><h2>${esc(p.name)}</h2><p class="pp2-r">${idl(p)}<span>${esc(roleLabel(p))}</span>${badge}</p><p class="t-small t-mute">${p.div ? esc(div(p.div).name) : L('Presidency')}${p.title ? ` · ${esc(p.title)}` : ''}</p></div></div>
  ${self && ui.form === 'profile' ? `<div class="quiet subform"><div class="field"><label for="pf-li">LinkedIn <span class="opt">${L('Optional')}</span></label><input class="input" id="pf-li" data-pf="linkedin" value="${esc(p.linkedin || '')}" placeholder="linkedin.com/in/…"></div><div class="field"><label for="pf-ph">${L('Phone')} <span class="opt">${L('Optional')}</span></label><input class="input" id="pf-ph" data-pf="phone" value="${esc(p.phone || '')}" placeholder="+62…"></div><label class="chkrow"><input type="checkbox" data-pf="hidePhone" ${p.hidePhone ? 'checked' : ''}><span><b>${L('Hide my phone from others')}</b><small>${L('Only you see it.')}</small></span></label><div class="acts"><button class="btn btn-sm" data-act="form">${L('Done')}</button></div></div>` : ''}
  <dl class="meta pp2-m"><dt>LinkedIn</dt><dd>${li}</dd><dt>${L('Phone')}</dt><dd>${ph}</dd><dt>${L('Joined')}</dt><dd>${p.joined ? dLong(p.joined) : `<span class="t-mute">${L('Not recorded')}</span>`}</dd></dl>
  ${self && ui.form !== 'profile' ? `<button class="linkbtn" data-act="form" data-f="profile">${icon('edit', 'ic-xs')} ${L('Edit my LinkedIn and phone')}</button>` : ''}
  ${p.id !== m.id ? `<div class="acts pp2-a"><button class="btn" data-act="new-offer" data-to="${p.id}">${icon('people')}${L('Ask for a task')}</button><button class="btn" data-act="find-with" data-id="${p.id}">${icon('calendar')}${L('Find a time')}</button></div>` : ''}
  <h3 class="sec-h pw-h">${self ? L('Your week') : L('{who}’s week', {who: esc(p.first)})}<span class="pw-nav"><button class="ib" data-act="pweek" data-d="-7" aria-label="${esc(L('Previous week'))}">${icon('left', 'ic-sm')}</button><span class="t-num">${dShort(wk)} – ${dShort(addDays(wk, 6))}</span><button class="ib" data-act="pweek" data-d="7" aria-label="${esc(L('Next week'))}">${icon('right', 'ic-sm')}</button></span></h3>
  ${personWeek(p, wk, m)}
  <p class="t-small t-mute">${self ? L('Others see names only for what they share with you; the rest shows as Busy. Your private notes and Google titles stay yours.') : p.gcal || p.hasSchedule ? L('Names appear only for what you share with {who}. Everything else shows as Busy or Unavailable.', {who: esc(p.first)}) : L('{who} has no schedule recorded, so this week is unknown, not free.', {who: esc(p.first)})}</p>
  ${!self ? `<h3 class="sec-h">${L('Between you two')} <span class="n">${between.length + offs.length}</span></h3><div class="rows">${offs.map(o => `<div class="row" data-act="open-offer" data-id="${o.id}" tabindex="0">${av(o.from, 'av-xs')}<div class="t">${esc(o.title)}<small>${o.from === m.id ? L('You asked {who}', {who: esc(p.first)}) : L('{who} asked you', {who: esc(p.first)})}</small></div>${state(L('Waiting for an answer'), 'clock', 'ink2')}</div>`).join('')}${between.map(t => taskRow(t, {owner: true, noCtx: true})).join('') || (offs.length ? '' : `<div class="empty-inline">${L('Nothing open between you.')}</div>`)}</div>` : ''}
  <h3 class="sec-h">${self ? L('Your open tasks') : L('Other open tasks you can see')} <span class="n">${other.length}</span></h3><div class="rows">${other.slice(0, 6).map(t => taskRow(t, {noCtx: false})).join('') || `<div class="empty-inline">${L('None')}</div>`}</div>
  <p class="t-small t-mute">${L('Task count alone never means busy or free.')}</p>`; };

// Saved view preferences are personal and survive reload (work_work_views): List/Board/Timeline per place, and the timeline range.
Object.assign(ui.view, session.views || {}); if (session.range) ui.range = session.range;
{ const v0 = ACT.view, r0 = ACT.range;
  ACT.view = el => { v0(el); session.views = ui.view; saveSession(); };
  ACT.range = el => { r0(el); session.range = ui.range; saveSession(); }; }

// ---------- form controls: custom dropdown and date picker (owner, 6 Oct: native menus looked broken) ----------
// Progressive enhancement: every select.input and input[type=date].input stays in the DOM as the source of truth (hidden),
// so screen code keeps reading .value and listening for change. A button shows the value; a page-level popover picks it.
// People show photo, name and role icons; projects show their object. Keyboard: Enter/Space/Down opens, arrows move,
// typing filters long lists, Enter picks, Escape closes. UX2 prototype component; UX1 to adopt into the design system.
const CF = {open: null};
const cfPop = () => { let p = document.getElementById('cfpop'); if (!p) { p = document.createElement('div'); p.id = 'cfpop'; document.body.appendChild(p); } return p; };
const cfVisual = (v, size) => { const p = person(v), pr = typeof projOf === 'function' && projOf(v); return p ? av(v, size) : pr && typeof projObj === 'function' ? projObj(pr, 'xs') : ''; };
function cfLabel(sel) { const o = sel.options[sel.selectedIndex]; if (!o) return `<span class="cf-t t-mute">${L('Choose')}</span>`; return `${cfVisual(o.value, 'av-xs')}<span class="cf-t ${o.value ? '' : 't-mute'}">${esc(o.text)}</span>`; }
function cfDateLabel(inp) { return inp.value ? `<span class="cf-t" title="${esc(dLong(inp.value))}">${dShort(inp.value)} ${D(inp.value).getFullYear()}</span>` : `<span class="cf-t t-mute">${L('Choose a date')}</span>`; }
const cfInner = (el, isDate) => `${isDate ? dateIc(el) : ''}${isDate ? cfDateLabel(el) : cfLabel(el)}${isDate ? '' : icon('chevron-down', 'ic-sm cf-chev')}`;
function cfUpgrade(root = document) {
  root.querySelectorAll('select.input:not([data-cf]), input[type="date"].input:not([data-cf])').forEach(el => {
    el.dataset.cf = '1'; const isDate = el.type === 'date';
    const b = document.createElement('button'); b.type = 'button'; b.className = `cf ${isDate ? 'cf-date' : ''} ${el.classList.contains('sel-sm') ? 'sel-sm' : ''}`; b.dataset.cfFor = el.id || (el.id = uid('cf'));
    b.disabled = el.disabled; b.setAttribute('aria-haspopup', isDate ? 'dialog' : 'listbox'); const lab = document.querySelector(`label[for="${el.id}"]`);
    b.setAttribute('aria-label', lab ? lab.textContent.replace('*', '').trim() : (el.getAttribute('aria-label') || ''));
    b.innerHTML = cfInner(el, isDate); el.classList.add('cf-src'); el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); el.after(b);
    if (lab) lab.addEventListener('click', ev => { ev.preventDefault(); b.focus(); });
  });
}
function cfClose() { CF.open = null; cfPop().innerHTML = ''; }
function cfPlace(btn, w) { const r = btn.getBoundingClientRect(), pop = cfPop().firstElementChild; if (!pop) return; pop.style.width = `${w}px`; const h = pop.offsetHeight, below = innerHeight - r.bottom - 8;
  pop.style.left = `${Math.max(8, Math.min(r.left, innerWidth - w - 8))}px`; pop.style.top = `${below >= h || below > r.top ? r.bottom + 4 : Math.max(8, r.top - h - 4)}px`; }
function cfRenderList() { const st = CF.open, sel = st.el, q = (st.q || '').toLowerCase(), items = []; let html = '';
  [...sel.children].forEach(ch => { const opts = ch.tagName === 'OPTGROUP' ? [...ch.children] : [ch]; const hits = opts.filter(o => !q || o.text.toLowerCase().includes(q)); if (!hits.length) return;
    if (ch.tagName === 'OPTGROUP') html += `<div class="cf-g">${esc(ch.label)}</div>`;
    hits.forEach(o => { const i = items.length, p = person(o.value); items.push(o.value);
      html += `<div class="cf-o ${i === st.idx ? 'act' : ''} ${o.value === sel.value ? 'on' : ''}" role="option" aria-selected="${o.value === sel.value}" data-act="cf-pick" data-v="${esc(o.value)}">${cfVisual(o.value, 'av-sm')}<span class="cf-t">${esc(o.text)}</span>${p ? `<span class="pm-ic">${bicon(ROLES[p.role].icon)}${p.admin ? bicon('role-admin') : ''}</span>` : ''}${o.value === sel.value ? icon('check', 'ic-sm cf-tick') : ''}</div>`; }); });
  st.items = items; const many = sel.options.length > 8;
  cfPop().innerHTML = `<div class="pop cf-pop" role="listbox">${many ? `<input class="cf-q" id="cf-q" placeholder="${esc(L('Type to filter'))}" value="${esc(st.q || '')}" autocomplete="off" aria-label="${esc(L('Type to filter'))}">` : ''}<div class="cf-list">${html || `<div class="empty-inline">${L('No matches.')}</div>`}</div></div>`;
  cfPlace(st.btn, Math.max(st.btn.offsetWidth, 240)); const a = cfPop().querySelector('.cf-o.act'); if (a) a.scrollIntoView({block: 'nearest'}); }
function cfRenderDate() { const st = CF.open, inp = st.el, base = D(st.month), y = base.getFullYear(), mo = base.getMonth(), start = weekStart(iso(new Date(y, mo, 1))), min = inp.min, max = inp.max;
  const cells = [...Array(42)].map((_, i) => addDays(start, i));
  cfPop().innerHTML = `<div class="pop cf-pop cf-cal" role="dialog" aria-label="${esc(L('Choose a date'))}"><div class="mini-h"><b>${MONTH()[mo]} ${y}</b><span><button class="ib" data-act="cf-month" data-d="-1" aria-label="${esc(L('Previous month'))}">${icon('chevron-left', 'ic-sm')}</button><button class="ib" data-act="cf-month" data-d="1" aria-label="${esc(L('Next month'))}">${icon('chevron', 'ic-sm')}</button></span></div>
    <div class="mini-g">${[1, 2, 3, 4, 5, 6, 0].map(i => `<span class="mini-wd">${WD()[i].slice(0, 2)}</span>`).join('')}${cells.map(d => { const off = (min && d < min) || (max && d > max); return `<button class="mini-d ${D(d).getMonth() !== mo ? 'out' : ''} ${d === today() ? 'is-today' : ''} ${d === inp.value ? 'today' : ''} ${d === st.focus ? 'kb' : ''}" data-act="cf-day" data-d="${d}" ${off ? 'disabled' : ''} aria-label="${esc(dLong(d))}">${D(d).getDate()}</button>`; }).join('')}</div>
    <div class="cf-foot"><button class="btn btn-sm btn-ghost" data-act="cf-day" data-d="${today()}">${L('Today')}</button>${inp.value ? `<button class="btn btn-sm btn-ghost" data-act="cf-day" data-d="">${L('Clear')}</button>` : ''}</div></div>`;
  cfPlace(st.btn, 264); }
function cfOpen(btn) { const el = document.getElementById(btn.dataset.cfFor); if (!el || el.disabled) return; const isDate = el.type === 'date';
  CF.open = {btn, el, isDate, q: '', idx: isDate ? 0 : Math.max(0, [...el.options].findIndex(o => o.value === el.value)), month: (el.value || today()).slice(0, 8) + '01', focus: el.value || today()};
  if (isDate) cfRenderDate(); else cfRenderList(); const q = $('#cf-q'); if (q) q.focus(); }
function cfSet(v) { const st = CF.open; if (!st) return; const el = st.el, id = el.id; cfClose(); el.value = v; el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true}));
  const b = document.querySelector(`[data-cf-for="${id}"]`), src = document.getElementById(id); if (b && src) { b.innerHTML = cfInner(src, src.type === 'date'); b.focus(); } }
Object.assign(ACT, {
  'cf-pick': el => cfSet(el.dataset.v),
  'cf-day': el => cfSet(el.dataset.d),
  'cf-month': el => { const st = CF.open, b = D(st.month); st.month = iso(new Date(b.getFullYear(), b.getMonth() + +el.dataset.d, 1)); cfRenderDate(); },
});
document.addEventListener('click', e => { const b = e.target.closest('button.cf'); if (b) { e.preventDefault(); e.stopPropagation(); if (CF.open && CF.open.btn === b) cfClose(); else cfOpen(b); return; } if (CF.open && !e.target.closest('#cfpop')) cfClose(); }, true);
ON_INPUT['cf-q'] = el => { CF.open.q = el.value; CF.open.idx = 0; const pos = el.selectionStart; cfRenderList(); const q = $('#cf-q'); q.focus(); q.setSelectionRange(pos, pos); };
ON_KEY.unshift(e => {
  const b = e.target.closest && e.target.closest('button.cf');
  if (b && !CF.open && ['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); cfOpen(b); return true; }
  const st = CF.open; if (!st) return false;
  if (e.key === 'Escape') { e.preventDefault(); const bt = st.btn; cfClose(); bt.focus(); return true; }
  if (e.key === 'Tab') { cfClose(); return false; }
  if (st.isDate) { const step = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7}[e.key];
    if (step) { e.preventDefault(); st.focus = addDays(st.focus, step); st.month = st.focus.slice(0, 8) + '01'; cfRenderDate(); return true; }
    if (e.key === 'Enter') { e.preventDefault(); cfSet(st.focus); return true; } return false; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); st.idx = Math.max(0, Math.min(st.items.length - 1, st.idx + (e.key === 'ArrowDown' ? 1 : -1))); cfRenderList(); const q = $('#cf-q'); if (q) q.focus(); return true; }
  if (e.key === 'Enter') { e.preventDefault(); if (st.items[st.idx] != null) cfSet(st.items[st.idx]); return true; }
  return false;
});
addEventListener('resize', () => { if (CF.open) cfClose(); });
document.addEventListener('scroll', e => { if (CF.open && !(e.target.closest && e.target.closest('#cfpop'))) cfClose(); }, true);
new MutationObserver(() => { cfUpgrade(); if (CF.open && !CF.open.btn.isConnected) cfClose(); }).observe(document.body, {childList: true, subtree: true});
// Every sideways scroller follows the mouse wheel (owner, 6 Oct round 4): boards, tab strips, week strips, timelines.
// A vertical scroller that can still move wins; at a horizontal edge the page scrolls as usual. Shift+wheel stays native.
document.addEventListener('wheel', e => { if (e.defaultPrevented || e.ctrlKey || e.shiftKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
  for (let el = e.target; el && el.nodeType === 1 && el !== document.body; el = el.parentElement) { const s = getComputedStyle(el); if (s.position === 'sticky') return; // a heading or label column: leave the wheel vertical
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1 && (e.deltaY < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return;
    if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 1) { const max = el.scrollWidth - el.clientWidth; if (e.deltaY > 0 ? el.scrollLeft < max - 1 : el.scrollLeft > 0) { el.scrollLeft += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY; e.preventDefault(); return; } }
  } }, {passive: false});

// ---------- task and meeting icons (owner, 6 Oct round 7) ----------
// A wide set of line icons and eight colors plus a custom color, like the owner's reference. Stored as icon = {n, c}.
const XI = {book: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z M5 18a2 2 0 0 1 2-2h11', school: 'M2 9l10-5 10 5-10 5Z M6 11v5c3 2 9 2 12 0v-5 M22 9v6', pencil: 'M4 20l1-5L16 4l4 4L9 19Z M14 6l4 4', pen: 'M12 19l7-7-7-7-7 7 3 3 M5 12l-2 8 8-2 M12 12a1.5 1.5 0 1 0 0-.01',
  code: 'M9 7l-5 5 5 5 M15 7l5 5-5 5', terminal: 'M4 5h16v14H4Z M7 10l3 2-3 2 M12 15h5', music: 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', popcorn: 'M6 9h12l-2 11H8Z M10 9v11 M14 9v11 M6 9a3 3 0 0 1 3-4 3 3 0 0 1 6 0 3 3 0 0 1 3 4',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 4 1 6-2a9 9 0 0 0-8-11Z M7.5 11h.01 M10 7h.01 M15 7h.01', stethoscope: 'M6 3v6a4 4 0 0 0 8 0V3 M10 13v2a5 5 0 0 0 10 0v-2 M20 11a2 2 0 1 0 0 .01', lotus: 'M12 20c-5 0-9-3-9-7 3 0 6 1 9 4 3-3 6-4 9-4 0 4-4 7-9 7Z M12 17c-2-3-2-8 0-12 2 4 2 9 0 12Z', bag: 'M5 8h14l-1 12H6Z M9 8a3 3 0 0 1 6 0',
  bars: 'M5 20V12 M10 20V6 M15 20v-9 M20 20V4', dumbbell: 'M3 10v4 M6 7v10 M18 7v10 M21 10v4 M6 12h12', scale: 'M12 4v16 M7 20h10 M5 7h14 M5 7l-3 6a3 3 0 0 0 6 0Z M19 7l-3 6a3 3 0 0 0 6 0Z', plane: 'M3 13l7-2 4-7h2l-1 7 5 1 1 2-6 1-3 5h-2l1-5-7 1Z',
  wrench: 'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2Z', paw: 'M12 20c-3 0-5-2-5-4s3-4 5-4 5 2 5 4-2 4-5 4Z M6 10a1.5 2 0 1 0 0 .01 M10 6a1.5 2 0 1 0 0 .01 M14 6a1.5 2 0 1 0 0 .01 M18 10a1.5 2 0 1 0 0 .01', flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7 15h10', brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1Z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
  gift: 'M4 10h16v10H4Z M3 7h18v3H3Z M12 7v13 M12 7c-2-4-6-3-5 0 M12 7c2-4 6-3 5 0', camera: 'M4 8h4l2-3h4l2 3h4v11H4Z M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', mic: 'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Z M5 11a7 7 0 0 0 14 0 M12 18v3', megaphone: 'M3 10v4l11 5V5Z M14 8h3a3 3 0 0 1 0 6h-3 M6 15l1 5h3l-1-4',
  rocket: 'M12 3c4 2 6 6 5 11l-3 3h-4l-3-3c-1-5 1-9 5-11Z M12 9a1.5 1.5 0 1 0 0 .01 M7 14l-3 2 2 3 M17 14l3 2-2 3', trophy: 'M8 4h8v5a4 4 0 0 1-8 0Z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8 M9 17h6', coffee: 'M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z M16 11h2a2 2 0 0 1 0 4h-2 M8 3v3 M12 3v3', cart: 'M3 4h2l2 11h11l2-8H6 M9 20a1 1 0 1 0 0 .01 M17 20a1 1 0 1 0 0 .01',
  phone: 'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z', mail: 'M3 6h18v12H3Z M3 7l9 6 9-6', map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z M9 4v14 M15 6v14', target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 12h.01',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10Z', star: 'M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1Z', handshake: 'M3 12l4-4 5 2 5-2 4 4-7 6-2-2-2 2Z M8 13l3 3', video: 'M3 7h12v10H3Z M15 10l6-3v10l-6-3', leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z M5 19l8-8', truck: 'M3 6h11v10H3Z M14 9h4l3 4v3h-7 M7 19a2 2 0 1 0 0-.01 M17 19a2 2 0 1 0 0-.01', smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 14a5 5 0 0 0 8 0 M9 9h.01 M15 9h.01'};
const ICONSET = ['tasks', 'flag', 'calendar', 'clock', 'folder', 'documents', 'note', 'link', 'people', 'person', 'briefcase', 'chart', 'bars', 'target', 'compass', 'globe', 'map', 'home', 'finance', 'wallet', 'cart', 'gift', 'trophy', 'star', 'heart', 'smile', 'sparkles', 'bulb', 'rocket', 'book', 'school', 'pencil', 'pen', 'palette', 'camera', 'video', 'mic', 'megaphone', 'music', 'popcorn', 'coffee', 'code', 'terminal', 'wrench', 'settings', 'shield', 'lock', 'scale', 'handshake', 'mail', 'phone', 'bell', 'plane', 'truck', 'flask', 'brain', 'stethoscope', 'lotus', 'leaf', 'paw', 'dumbbell', 'bag', 'sun', 'moon', 'pin', 'board', 'activity', 'search'];
const ICOL = {ink: 'var(--ink)', red: '#E5484D', orange: '#F0761A', yellow: '#E2A336', green: '#16A34A', blue: '#3E7BFA', purple: '#8E4EC6', pink: '#E93D82'};
const svgD = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const iconSvg = n => XI[n] ? svgD(XI[n]) : icon(n);
const icCol = c => ICOL[c] || (/^#[0-9a-f]{6}$/i.test(c || '') ? c : ICOL.ink);
const tIcon = (x, cls = '') => x && x.icon ? `<span class="ticon ${cls}" style="--ic:${icCol(x.icon.c)}" aria-hidden="true">${iconSvg(x.icon.n)}</span>` : '';
const iconItem = (kind, id) => kind === 'meeting' ? meetingOf(id) : kind === 'routine' ? (id === 'draft' ? ui.rtDraft : rtOf(id)) : taskOf(id);
const canIcon = (kind, x) => kind === 'meeting' ? x.organizer === session.me : kind === 'routine' ? (x === ui.rtDraft || canEditRt(x)) : canEditTask(x);
const iconBtn = (kind, x, can) => can ? `<button class="ticon-btn ${x.icon ? '' : 'empty'}" data-act="ticon-open" data-k="${kind}" data-id="${x.id}" aria-label="${esc(x.icon ? L('Change icon') : L('Add an icon'))}">${x.icon ? tIcon(x) : `${svgD('M12 21a9 9 0 1 1 0-18 M8.5 14.5a4.5 4.5 0 0 0 7 0 M9 9.5h.01 M15 9.5h.01 M19 3v6 M16 6h6')}<span>${L('Icon')}</span>`}</button>` : tIcon(x);
MENUS.ticon = mm => { const x = iconItem(mm.kind, mm.id); if (!x) return ''; const c = mm.c || (x.icon && x.icon.c) || 'ink', q = (mm.q || '').toLowerCase();
  return `<div class="ip"><div class="ip-cols">${Object.entries(ICOL).map(([k, v]) => `<button class="ip-c ${c === k ? 'on' : ''}" style="--c:${v}" data-act="ticon-c" data-c="${k}" aria-label="${esc(k)}"></button>`).join('')}<label class="ip-c ip-custom ${!ICOL[c] ? 'on' : ''}" title="${esc(L('Custom color'))}" style="--c:${icCol(c)}"><input type="color" id="ip-custom" value="${/^#/.test(icCol(c)) ? icCol(c) : '#161615'}" aria-label="${esc(L('Custom color'))}"></label></div>
    <input class="input ip-q" id="ip-q" placeholder="${esc(L('Find an icon'))}" value="${esc(mm.q || '')}" autocomplete="off">
    <div class="ip-grid" style="--ic:${icCol(c)}">${ICONSET.filter(n => !q || n.includes(q)).map(n => `<button class="ip-i ${x.icon && x.icon.n === n ? 'on' : ''}" data-act="ticon-i" data-n="${n}" title="${esc(n)}" aria-label="${esc(n)}">${iconSvg(n)}</button>`).join('') || `<span class="t-small t-mute">${L('No icon by that name')}</span>`}</div>
    <div class="ip-f">${x.icon ? `<button class="btn btn-sm btn-ghost" data-act="ticon-rm">${L('Remove icon')}</button>` : ''}<button class="btn btn-sm btn-ghost" data-act="close-layer">${L('Close')}</button></div></div>`; };
const setIcon = (fn) => { const mm = ui.menu, x = iconItem(mm.kind, mm.id); if (!x || !canIcon(mm.kind, x)) return; const prev = x.icon ? {...x.icon} : null; fn(x); if (mm.kind === 'routine' && x !== ui.rtDraft) rtIconSync(x); save(); render(); renderLayer(); };
Object.assign(ACT, {
  'ticon-open': (el, id, e) => { if (e) e.stopPropagation(); const x = iconItem(el.dataset.k, id); if (!x || !canIcon(el.dataset.k, x)) return toast(L('Only the owner can change this icon.')); ui.menu = {type: 'ticon', kind: el.dataset.k, id, rect: el.getBoundingClientRect ? el.getBoundingClientRect() : ui.menu.rect, width: 308, est: 430}; renderLayer(); },
  'ticon-c': el => { ui.menu.c = el.dataset.c; setIcon(x => { if (x.icon) x.icon.c = el.dataset.c; }); },
  'ticon-i': el => { const c = ui.menu.c || 'ink'; setIcon(x => { x.icon = {n: el.dataset.n, c: ui.menu.c || (x.icon && x.icon.c) || c}; }); ui.menu = null; renderLayer(); },
  'ticon-rm': () => { setIcon(x => { x.icon = null; }); ui.menu = null; renderLayer(); },
});
ON_INPUT['ip-q'] = el => { ui.menu.q = el.value; const g = $('.ip-grid'); if (!g) return; const tmp = document.createElement('div'); tmp.innerHTML = MENUS.ticon(ui.menu); g.replaceWith(tmp.querySelector('.ip-grid')); };
ON_INPUT['ip-custom'] = el => { ui.menu.c = el.value; const x = iconItem(ui.menu.kind, ui.menu.id); if (x && x.icon && canIcon(ui.menu.kind, x)) { x.icon.c = el.value; save(); } const g = $('.ip-grid'); if (g) g.style.setProperty('--ic', el.value); };
ON_CHANGE['ip-custom'] = () => { render(); };

// ---------- reactions (owner, 6 Oct round 7): right-click any task, meeting or Gantt bar, like WhatsApp ----------
// One reaction per person per item; tapping a bubble toggles yours. The owner of the item is told once (request R11).
const EMO = ['👍', '❤️', '😂', '😮', '🙏', '🔥'], EMO_MORE = ['✅', '🎉', '👏', '💯', '👀', '🤝', '💪', '🙌', '😍', '🤔', '😅', '😢', '⏳', '📌', '🚀', '⭐', '👌', '🫡'];
const rxItem = (kind, id) => kind === 'meeting' ? meetingOf(id) : taskOf(id);
const myRx = x => Object.entries(x.reactions || {}).find(([, v]) => v.includes(session.me));
function rxBubbles(x, kind, big) { const r = Object.entries((x && x.reactions) || {}).filter(([, v]) => v.length); if (!r.length) return '';
  return `<span class="rxs ${big ? 'big' : ''}">${r.map(([e, v]) => `<button class="rx ${v.includes(session.me) ? 'mine' : ''}" data-act="rx-who" data-k="${kind}" data-id="${x.id}" data-e="${e}" title="${esc(v.map(first).join(', '))}" aria-label="${esc(`${e} ${v.map(first).join(', ')}`)}">${e}${v.length > 1 ? `<b>${v.length}</b>` : ''}</button>`).join('')}</span>`; }
MENUS.react = mm => { const x = rxItem(mm.kind, mm.id); if (!x) return ''; const mine = (myRx(x) || [])[0];
  return `<div class="rx-bar" role="group" aria-label="${esc(L('React'))}">${EMO.map(e => `<button class="rx-e ${mine === e ? 'on' : ''}" data-act="react" data-k="${mm.kind}" data-id="${x.id}" data-e="${e}" aria-label="${e}">${e}</button>`).join('')}<button class="rx-e more ${mm.more ? 'on' : ''}" data-act="rx-more" aria-label="${esc(L('More reactions'))}">${icon('plus', 'ic-sm')}</button></div>
    ${mm.more ? `<div class="rx-grid">${EMO_MORE.map(e => `<button class="rx-e ${mine === e ? 'on' : ''}" data-act="react" data-k="${mm.kind}" data-id="${x.id}" data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div>` : ''}
    <hr>${mi(mm.kind === 'meeting' ? 'open-meeting' : 'open-task', mm.kind === 'meeting' ? L('Open meeting') : L('Open task'), mm.kind === 'meeting' ? 'calendar' : 'tasks', `data-id="${x.id}"`)}${canIcon(mm.kind, x) ? mi('ticon-open', x.icon ? L('Change icon') : L('Add an icon'), 'sparkles', `data-k="${mm.kind}" data-id="${x.id}"`) : ''}${mine ? mi('react', L('Remove my reaction'), 'close', `data-k="${mm.kind}" data-id="${x.id}" data-e="${mine}"`) : ''}`; };
Object.assign(ACT, {
  react: (el, id, e) => { if (e) e.stopPropagation(); const kind = el.dataset.k, x = rxItem(kind, id), em = el.dataset.e; if (!x) return; const r = x.reactions = x.reactions || {}, had = (r[em] || []).includes(session.me);
    Object.keys(r).forEach(k => { r[k] = r[k].filter(p => p !== session.me); if (!r[k].length) delete r[k]; }); if (!had) (r[em] = r[em] || []).push(session.me);
    const owner = kind === 'meeting' ? x.organizer : x.owner; if (!had && owner !== session.me) { db.updates = db.updates.filter(u => !(u.to === owner && u.actor === session.me && u.type === 'react-' + kind && u.ref.id === x.id && !u.read)); notify(owner, 'react-' + kind, {type: kind, id: x.id}); }
    ui.menu = null; renderLayer(); save(); render(); },
  'rx-more': () => { ui.menu.more = !ui.menu.more; ui.menu.est = ui.menu.more ? 330 : 230; renderLayer(); },
});
document.addEventListener('contextmenu', e => { if (!me() || e.target.closest('input, textarea, [contenteditable], .pop')) return;
  const el = e.target.closest('[data-gt], .ev[data-ev="meeting"], .tcard[data-drag], [data-act="open-task"][data-id], [data-act="open-meeting"][data-id]'); if (!el) return;
  const kind = el.matches('.ev, [data-act="open-meeting"]') ? 'meeting' : 'task', id = el.dataset.gt || el.dataset.drag || el.dataset.id; if (!rxItem(kind, id)) return;
  e.preventDefault(); ui.menu = {type: 'react', kind, id, rect: {left: e.clientX - 20, right: e.clientX, top: e.clientY, bottom: e.clientY}, width: 296, est: 230}; renderLayer(); });

// ---------- dependencies (owner, 6 Oct round 7; work_dependencies, design-timeline-interactions) ----------
// Four link types (the PRD names finish-to-start only; the owner asked for all four, request R11). Self-links and loops are
// refused. A link never moves anything by itself: a broken link turns red, and Fix dates previews the exact shifts first.
const tS = t => t.start || t.due, tE = t => t.due;
const DEP_T = {FS: ['Finish to start', 'Starts after it finishes'], SS: ['Start to start', 'Starts when it starts'], FF: ['Finish to finish', 'Finishes when it finishes'], SF: ['Start to finish', 'Finishes after it starts']};
const predsOf = t => (t.deps || []).map(d => ({id: d.id, type: d.type || 'FS', t: taskOf(d.id)})).filter(d => d.t && !d.t.trashed);
const succsOf = t => db.tasks.filter(x => !x.trashed && (x.deps || []).some(d => d.id === t.id));
function depNeed(pred, succ, type) { if (!tE(pred) || !tE(succ)) return null; return type === 'FS' ? {f: 's', min: addDays(tE(pred), 1)} : type === 'SS' ? {f: 's', min: tS(pred)} : type === 'FF' ? {f: 'e', min: tE(pred)} : {f: 'e', min: tS(pred)}; }
const depOk = (pred, succ, type) => { const n = depNeed(pred, succ, type); return !n || (n.f === 's' ? tS(succ) : tE(succ)) >= n.min; };
function waitsFor(a, b, seen = new Set()) { if (a.id === b.id) return true; if (seen.has(a.id)) return false; seen.add(a.id); return predsOf(a).some(d => waitsFor(d.t, b, seen)); }
function addDep(succ, pred, type) {
  if (!canEditTask(succ)) return toast(L('Only {who} or the project lead can change this task', {who: first(succ.owner)}));
  if (succ.id === pred.id) return toast(L('A task cannot wait for itself.'));
  if (waitsFor(pred, succ)) return toast(L('That would make a loop: {a} already waits for {b}.', {a: pred.title, b: succ.title}));
  const prev = (succ.deps || []).map(d => ({...d})), deps = succ.deps = prev.map(d => ({...d})), old = deps.find(d => d.id === pred.id); if (old) old.type = type; else deps.push({id: pred.id, type});
  logChange(taskDiv(succ), 'linked', {type: 'task', id: succ.id, name: succ.title}, null, `${L(DEP_T[type][0])}: ${pred.title}`); save(); render();
  toast(depOk(pred, succ, type) ? L('{b} now waits for {a}', {a: pred.title, b: succ.title}) : L('Linked. {b} is now too early; use Fix dates.', {b: succ.title}), () => { succ.deps = prev; rerender(); }); }
function rmDep(succ, predId) { if (!canEditTask(succ)) return; const prev = (succ.deps || []).map(d => ({...d})); succ.deps = prev.filter(d => d.id !== predId); logChange(taskDiv(succ), 'unlinked', {type: 'task', id: succ.id, name: succ.title}); save(); render(); toast(L('Link removed'), () => { succ.deps = prev; rerender(); }); }
// The smallest forward shift for each task that starts or ends too early, in dependency order; duration is kept.
function fixPlan(tasks) { const tmp = new Map(), get = t => tmp.get(t.id) || {s: t.start || null, e: t.due}, S = t => get(t).s || get(t).e, E = t => get(t).e, order = [], seen = new Set();
  const visit = t => { if (seen.has(t.id)) return; seen.add(t.id); predsOf(t).forEach(d => visit(d.t)); order.push(t); }; tasks.forEach(visit);
  const ids = new Set(tasks.map(t => t.id)), out = [];
  order.forEach(t => { if (!ids.has(t.id) || !E(t)) return; let shift = 0;
    predsOf(t).forEach(d => { if (!E(d.t)) return; const [cur, min] = {FS: [S(t), addDays(E(d.t), 1)], SS: [S(t), S(d.t)], FF: [E(t), E(d.t)], SF: [E(t), S(d.t)]}[d.type]; if (cur < min) shift = Math.max(shift, daysBetween(cur, min)); });
    if (shift > 0 && canEditTask(t)) { const g = get(t), to = {s: g.s ? addDays(g.s, shift) : null, e: addDays(g.e, shift)}; out.push({t, from: {...g}, to}); tmp.set(t.id, to); } });
  return out; }
const rangeTxt = r => r.s && r.s !== r.e ? `${dShort(r.s)} – ${dShort(r.e)}` : dShort(r.e);
MENUS.depfix = mm => { const p = projOf(mm.id), plan = fixPlan(projTasks(p).filter(t => t.due));
  return `<div class="mi-h">${L('Fix dates')}</div><div class="fixlist">${plan.map(x => `<div class="fx"><b>${esc(x.t.title)}</b><span class="t-num"><s>${rangeTxt(x.from)}</s> → ${rangeTxt(x.to)}</span></div>`).join('') || `<p class="t-small t-mute">${L('Every link is satisfied.')}</p>`}</div>
    <p class="t-small t-mute fx-n">${L('Only these tasks move, each by the smallest amount, keeping its length. Nothing else changes.')}</p>${plan.length ? `<div class="acts"><button class="btn btn-pri btn-sm" data-act="dep-apply" data-id="${p.id}">${plural(plan.length, 'Move {n} task', 'Move {n} tasks')}</button><button class="btn btn-ghost btn-sm" data-act="close-layer">${L('Cancel')}</button></div>` : ''}`; };
MENUS.dep = mm => { const s = taskOf(mm.s), p = taskOf(mm.p); if (!s || !p) return ''; const d = (s.deps || []).find(x => x.id === p.id) || {}, ty = d.type || 'FS', ok = depOk(p, s, ty), can = canEditTask(s);
  return `<div class="mi-h">${L('{b} waits for {a}', {a: esc(p.title), b: esc(s.title)})}</div>${Object.entries(DEP_T).map(([k, [l, h]]) => `<div class="mi ${k === ty ? 'on' : ''}" ${can ? `data-act="dep-type" data-s="${s.id}" data-p="${p.id}" data-k="${k}"` : ''} tabindex="0" role="menuitemradio" aria-checked="${k === ty}"><span class="mi-l"><b class="t-num dep-k">${k}</b><span>${L(l)}<small>${L(h)}</small></span></span>${k === ty ? icon('check', 'tick') : ''}</div>`).join('')}
    ${!ok ? `<p class="t-small dep-bad">${icon('warning', 'ic-xs')}${L('{b} is too early for this link.', {b: esc(s.title)})}</p>` : ''}${can ? `<hr>${mi('dep-rm', L('Remove link'), 'close', `data-s="${s.id}" data-p="${p.id}"`)}` : ''}`; };
Object.assign(ACT, {
  'dep-menu': (el, id, e) => { ui.menu = {type: 'dep', s: el.dataset.s, p: el.dataset.p, rect: {left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY}, width: 300, est: 300}; renderLayer(); },
  'dep-type': el => { ui.menu = null; renderLayer(); addDep(taskOf(el.dataset.s), taskOf(el.dataset.p), el.dataset.k); },
  'dep-rm': (el, id, e) => { if (e) e.stopPropagation(); ui.menu = null; renderLayer(); rmDep(taskOf(el.dataset.s), el.dataset.p); },
  'dep-add': (el, id) => { const t = taskOf(id), p = taskOf($('#dep-new').value); if (t && p) addDep(t, p, $('#dep-type').value || 'FS'); },
  'dep-apply': (el, id) => { const plan = fixPlan(projTasks(projOf(id)).filter(t => t.due)); ui.menu = null; renderLayer(); if (!plan.length) return;
    plan.forEach(x => { x.t.start = x.to.s; x.t.due = x.to.e; logChange(taskDiv(x.t), 'edited', {type: 'task', id: x.t.id, name: x.t.title}, rangeTxt(x.from), rangeTxt(x.to)); });
    save(); render(); toast(plural(plan.length, '{n} task moved', '{n} tasks moved'), () => { plan.forEach(x => { x.t.start = x.from.s; x.t.due = x.from.e; }); rerender(); }); },
});
document.addEventListener('change', e => { const pid = e.target.dataset && e.target.dataset.dep; if (!pid || !ui.insp || ui.insp.type !== 'task') return; addDep(taskOf(ui.insp.id), taskOf(pid), e.target.value); });
function depSection(t, edit) { if (!t.project || isSummary(t)) return ''; const ps = predsOf(t), ss = succsOf(t);
  const card = (x, ty, s, p, can, ok) => `<div class="dep ${ok ? '' : 'bad'}"><div class="dep-top">${tIcon(x, 'xs')}<a class="dep-n" data-act="open-task" data-id="${x.id}" title="${esc(x.title)}">${esc(x.title)}</a>${can ? `<button class="ib" data-act="dep-rm" data-s="${s}" data-p="${p}" aria-label="${esc(L('Remove link'))}">${icon('close', 'ic-xs')}</button>` : ''}</div>
    <div class="dep-bot"><button class="dep-chip" ${can ? `data-act="dep-chip" data-s="${s}" data-p="${p}"` : 'disabled'} title="${esc(L(DEP_T[ty][1]))}"><b class="t-num">${ty}</b>${L(DEP_T[ty][0])}${can ? icon('chevron-down', 'ic-xs') : ''}</button>${ok ? '' : `<span class="dep-warn">${icon('warning', 'ic-xs')}${L('Too early')}</span>`}</div></div>`;
  return `<h3 class="sec-h">${L('Waits for')} <span class="n">${ps.length}</span></h3><div class="deps">${ps.map(d => card(d.t, d.type, t.id, d.t.id, edit, depOk(d.t, t, d.type))).join('') || `<p class="t-small t-mute dep-none">${L('Nothing. It can start any time.')}</p>`}</div>
    ${edit ? `<button class="linkbtn" data-act="dep-pick" data-id="${t.id}">${icon('plus', 'ic-xs')} ${L('Add a task it waits for')}</button>` : ''}
    ${ss.length ? `<h3 class="sec-h">${L('Waiting for this')} <span class="n">${ss.length}</span></h3><div class="deps">${ss.map(x => { const ty = (x.deps.find(d => d.id === t.id) || {}).type || 'FS'; return card(x, ty, x.id, t.id, canEditTask(x), depOk(t, x, ty)); }).join('')}</div>` : ''}`; }

// ---------- Gantt v2 (owner, 6 Oct round 7): measure-timeline, timeline_unscheduled, design-timeline-interactions ----------
// Three charts, three characters. Project Work: status colors, dependency arrows, milestone rows you can tick off.
// My Work: bars in each project's own palette, no arrows. Projects register: one band per project (plan.js).
// Shared fixes: month labels shorten to fit, titles that do not fit a bar sit beside it, click or drag on the grid adds a task.
const RH = 48;
function ganttV2(tasks, opt = {}) {
  const pj = opt.project ? projOf(opt.project) : null, mine = !pj && opt.add === 'me', rg = GR[ui.range] ? ui.range : '1m', [n, px] = GR[rg], start = gStart(), days = [...Array(n)].map((_, i) => addDays(start, i)), end = days[n - 1];
  const x = d => daysBetween(start, d) * px, W = n * px, inR = d => d >= start && d <= end;
  const dated = tasks.filter(t => t.due).sort((p, q) => (pj ? (p.order ?? 1e6) - (q.order ?? 1e6) : 0) || (tS(p)).localeCompare(tS(q)) || p.due.localeCompare(q.due)), undated = pj ? [] : tasks.filter(t => !t.due), ms = pj ? (opt.milestones || []).filter(m => m.target) : [];
  const months = []; days.forEach((d, i) => { if (!i || D(d).getDate() === 1) months.push([d, i]); });
  const mLab = (d, w) => { const m = D(d).getMonth(), y = D(d).getFullYear(); return w >= 140 ? `${MONTH()[m]} ${y}` : w >= 72 ? `${MON()[m]} ${y}` : w >= 30 ? MON()[m] : ''; };
  const head = `<div class="g-row g-head"><div class="g-label g-corner">${pj ? L('Tasks and milestones') : mine ? L('Your tasks') : L('Task')}</div><div class="g-track" style="width:${W}px">
    <div class="g-months">${months.map(([d, i], k) => { const w = ((months[k + 1] ? months[k + 1][1] : n) - i) * px; return `<span style="left:${i * px}px;width:${w}px"><b>${mLab(d, w)}</b></span>`; }).join('')}</div>
    <div class="g-days">${days.map(d => `<span class="${d === today() ? 'today' : ''} ${weekday(d) > 5 ? 'we' : ''}" style="width:${px}px">${px >= 40 ? `<small>${WD()[D(d).getDay()].slice(0, 2)}</small>` : ''}${px >= 24 || weekday(d) === 1 ? D(d).getDate() : ''}</span>`).join('')}</div></div></div>`;
  const edge = d => d < start ? `<button class="g-edge before" data-act="g-jump" data-d="${d}" title="${esc(dLong(d))}">← ${dShort(d)}</button>` : `<button class="g-edge after" data-act="g-jump" data-d="${d}" title="${esc(dLong(d))}">${dShort(d)} →</button>`;
  const pos = {}, rows = [], rightLinked = new Set();
  if (pj) dated.forEach(t => predsOf(t).forEach(d => { if (d.type[0] === 'F') rightLinked.add(d.id); if (d.type[1] === 'F') rightLinked.add(t.id); }));
  const collab = t => [...new Set([t.owner, ...joinedOf(t), ...(t.mentions || []), t.reviewer].filter(i => i && i !== session.me))];
  // everything beside a bar sits in one cluster: the title when it does not fit, overdue, collaborators (My Work), reactions
  const side = (t, left, title, late, date) => { const rx = rxBubbles(t, 'task'), co = mine ? collab(t) : []; if (!title && !late && !rx && !co.length && !date) return '';
    return `<span class="g-side" style="left:${left}px">${date ? `<span class="g-sd">${tIcon(t, 'xs')}<span class="t-num">${dShort(t.due)}</span></span>` : ''}${title ? `<span class="g-st">${esc(t.title)}</span>` : ''}${late ? `<b class="g-lt">${L('overdue')}</b>` : ''}${co.length ? faces(co, 4) : ''}${rx}</span>`; };
  const dim = t => mine && ui.gWith && !collab(t).includes(ui.gWith) ? ' dim' : '';
  const bar = (t, i) => {
    const st = isDone(t) ? 'completed' : openBlocker(t.id) ? 'blocked' : t.status === 'review' ? 'review' : t.status === 'doing' ? 'active' : 'neutral', late = !isDone(t) && t.due < today(), can = canEditTask(t), y = i * RH + RH / 2, p0 = projOf(t.project);
    const what = `${t.title}. ${t.start ? `${dLong(t.start)} – ${dLong(t.due)}` : `${L('Due')} ${dLong(t.due)}`}${late ? `, ${L('overdue')}` : ''}`, hint = can ? L('Drag to move, drag an end to change dates, or use the arrow keys. Right-click to react.') : L('Only {who} or the project lead can change this task', {who: first(t.owner)});
    const conn = (xs, xe) => pj ? `<i class="g-c" data-gc="S" data-t="${t.id}" data-x="${xs}" data-y="${y}" style="left:${xs - 12}px" title="${esc(L('Drag to another task to link'))}"></i><i class="g-c" data-gc="F" data-t="${t.id}" data-x="${xe}" data-y="${y}" style="left:${xe + 2}px" title="${esc(L('Drag to another task to link'))}"></i>` : '';
    if (t.start && t.start <= t.due) { if (t.due < start || t.start > end) return edge(t.due < start ? t.due : t.start);
      const l = x(t.start), w = (daysBetween(t.start, t.due) + 1) * px - 4, ppl = taskPeople(t), room = w - 14 - (t.icon ? 20 : 0), fit = t.title.length * 6.8 + 16 + (mine ? 10 : faceW(ppl.length)) <= room, cap = fit ? ppl.length : Math.max(1, Math.floor((room - 20) / 13) + 1); pos[t.id] = {x1: l, x2: l + w, y};
      const art = mine && p0 ? (lk => `<span class="g-art">${IDN.tile('project:' + p0.id, lk.f, lk.p, 'g-idn')}</span>`)(projLook(p0)) : '';
      const inner = mine ? `<span class="g-in">${fit ? `<span class="g-chip">${tIcon(t, 'xs')}<span>${esc(t.title)}</span></span>` : t.icon ? `<span class="g-chip only">${tIcon(t, 'xs')}</span>` : ''}</span>`
        : `<span class="g-in">${faces(ppl, cap)}${tIcon(t, 'xs')}${fit ? `<span>${esc(t.title)}</span>` : ''}</span>`;
      return `${conn(l, l + w)}<div class="g-bar ${mine ? `g-pill ${p0 ? '' : 'personal'}` : ''} st-${st} ${late ? 'late' : ''} ${can ? 'can' : ''}${dim(t)}" style="left:${l}px;width:${w}px" data-gt="${t.id}" data-gk="move" tabindex="0" role="button" aria-label="${esc(what)}" title="${esc(what + '. ' + hint)}">${art}${can ? '<i class="g-h l" data-gk="start"></i>' : ''}${inner}${mine && isDone(t) ? `<span class="g-done">${icon('check')}</span>` : ''}${can ? '<i class="g-h r" data-gk="due"></i>' : ''}</div>${side(t, l + w + (rightLinked.has(t.id) ? 22 : 8), !fit, late)}`; }
    if (!inR(t.due)) return edge(t.due); const cx = x(t.due) + px / 2; pos[t.id] = {x1: cx - 7, x2: cx + 7, y};
    if (mine) { const c = p0 ? PALS[projLook(p0).p][2] : 'var(--ink-2)';
      return `<div class="g-pin g-flag st-${st} ${late ? 'late' : ''} ${can ? 'can' : ''}${dim(t)}" style="left:${cx}px;--c:${c}" data-gt="${t.id}" data-gk="move" tabindex="0" role="button" aria-label="${esc(what)}" title="${esc(what + '. ' + hint)}"><i>${isDone(t) ? icon('check') : svgD(FLAG_D)}</i></div>${side(t, cx + 18, false, late, true)}`; }
    return `${conn(cx - 7, cx + 7)}<div class="g-pin st-${st} ${late ? 'late' : ''} ${can ? 'can' : ''}" style="left:${cx}px" data-gt="${t.id}" data-gk="move" tabindex="0" role="button" aria-label="${esc(what)}" title="${esc(what + '. ' + hint)}"><i></i></div>${side(t, cx + (rightLinked.has(t.id) ? 22 : 12), false, late, true)}`;
  };
  const label = (t, f) => `<div class="g-label" data-act="open-task" data-id="${t.id}" tabindex="0" style="--d:${f ? f.depth : 0}" ${pj ? `data-gdrag="${t.id}" title="${esc(L('Drag up or down to move it, also into or out of a phase, or Alt and the arrow keys'))}"` : ''}>${tstat(t.status).replace(/<span class="st-tx">.*?<\/span>/, '')}${f && f.code ? `<span class="g-code t-num">${f.code}</span>` : ''}<span class="nm ${isDone(t) ? 'done' : ''}" title="${esc(t.title)}">${tIcon(t, 'xs')}${esc(t.title)}</span>${mine ? '' : faces(taskPeople(t), 3)}</div>`;
  const taskRowG = (t, i, f) => `<div class="g-row ${ui.insp && ui.insp.id === t.id ? 'sel' : ''}">${label(t, f)}<div class="g-track" style="width:${W}px">${t.due ? bar(t, i) : `<span class="g-nodate">${L('No dates yet. Set them in the task, or drag a new bar.')}</span>`}</div></div>`;
  let ri = 0;
  const canMs = m => !!pj && ([m.owner, pj.lead, pj.pm].includes(session.me) || me().admin);
  const msRowH = (m, depth = 0) => { const i = ri++, linked = db.tasks.filter(t => t.milestone === m.id && !t.trashed), k = linked.filter(isDone).length, can = canMs(m), done = m.state === 'achieved', late = msLate(m), cx = x(m.target) + px / 2;
    if (inR(m.target)) pos['ms:' + m.id] = {x1: cx - 8, x2: cx + 8, y: i * RH + RH / 2};
    return `<div class="g-row g-ms"><div class="g-label" style="--d:${depth}">${done ? `<span class="ms-ck on" title="${esc(L('Achieved'))}">${icon('check')}</span>` : can && m.state !== 'cancelled' ? `<button class="ms-ck" data-act="ms-achieve" data-id="${m.id}" title="${esc(L('Record as achieved'))}" aria-label="${esc(L('Record {m} as achieved', {m: m.title}))}"></button>` : '<span class="ms-ck"></span>'}<span class="nm" data-act="open-ms" data-id="${m.id}" tabindex="0"><b>${esc(m.title)}</b><small class="${late ? 'late' : ''}">${plural(linked.length, '{n} task', '{n} tasks')}, ${k} ${L('done')}</small></span></div>
      <div class="g-track" style="width:${W}px">${!inR(m.target) ? edge(m.target) : `<i class="g-dia ${done ? 'ok' : late ? 'late' : ''} ${can ? 'can' : ''}" data-ms="${m.id}" data-act="open-ms" data-id="${m.id}" tabindex="0" role="button" style="left:${cx}px" aria-label="${esc(`${m.title}, ${dLong(m.target)}`)}" title="${esc(`${m.title}, ${dLong(m.target)}${can ? '. ' + L('Drag, or use the arrow keys, to move it') : ''}`)}">${done ? icon('check') : ''}</i><span class="g-side" style="left:${cx + 14}px"><span class="g-sd t-num ${late ? 'late' : ''}">${dShort(m.target)}</span></span>`}</div></div>`; };
  const sumRowG = (f, i) => { const t = f.o, ru = rollup(t), col = (ui.gcol || {})[t.id];
    const lab = `<div class="g-label g-sumlab" data-act="open-task" data-id="${t.id}" tabindex="0" data-gdrag="${t.id}" style="--d:${f.depth}" title="${esc(L('Drag up or down to move it, also into or out of a phase, or Alt and the arrow keys'))}"><button class="g-tw" data-act="gcol" data-id="${t.id}" aria-expanded="${!col}" aria-label="${esc(col ? L('Show the parts') : L('Hide the parts'))}">${icon(col ? 'chevron' : 'chevron-down', 'ic-xs')}</button><span class="g-code t-num">${f.code}</span><span class="nm"><b>${esc(t.title)}</b></span><span class="g-sn t-num">${ru.done}/${ru.total}</span></div>`;
    let tr = ''; if (ru.s && ru.e && !(ru.e < start || ru.s > end)) { const a = ru.s < start ? start : ru.s, b = ru.e > end ? end : ru.e, l = x(a), w = (daysBetween(a, b) + 1) * px - 4;
      tr = `<div class="g-sum ${t.phase ? 'phase' : ''}" style="left:${l}px;width:${w}px" data-act="open-task" data-id="${t.id}" title="${esc(`${t.title}: ${rangeTxt({s: ru.s, e: ru.e})}, ${ru.done}/${ru.total} ${L('done')}`)}"><i class="g-sumfill" style="width:${ru.total ? ru.done / ru.total * 100 : 0}%"></i></div><span class="g-side" style="left:${l + w + 8}px"><span class="g-sd t-num">${rangeTxt({s: ru.s, e: ru.e})}</span></span>`; }
    return `<div class="g-row g-sumrow ${t.phase ? 'is-phase' : ''}">${lab}<div class="g-track" style="width:${W}px">${tr}</div></div>`; };
  if (pj) { ms.filter(m => !(m.parent && taskOf(m.parent))).forEach(m => rows.push(msRowH(m)));
    wbsFlat(pj).forEach(f => { if (f.k === 'ms') { if (f.o.target) rows.push(msRowH(f.o, f.depth)); return; }
      if (f.k === 'grp') { ri++; rows.push(`<div class="g-row g-grp g-unpl"><div class="g-label"><span class="g-pers">${icon('tasks', 'ic-sm')}</span><b>${L('Not in the WBS yet')}</b></div><div class="g-track" style="width:${W}px"></div></div>`); return; }
      const i = ri++; rows.push(f.sum ? sumRowG(f, i) : taskRowG(f.o, i, f)); }); }
  else if (mine) { // My Work: grouped by project, each group in its own color
    const keys = [...new Set(dated.map(t => t.project || ''))].sort((a, b) => !a - !b || (projOf(a) || {}).name.localeCompare((projOf(b) || {}).name));
    keys.forEach(k => { const p0 = projOf(k), ts = dated.filter(t => (t.project || '') === k);
      rows.push(`<div class="g-row g-grp"><div class="g-label" ${p0 ? `data-act="go" data-h="projects/${p0.id}" tabindex="0"` : ''}>${p0 ? projObj(p0, 'xs') : `<span class="g-pers">${icon('person', 'ic-sm')}</span>`}<b>${p0 ? esc(p0.name) : L('Personal and division tasks')}</b><span class="n">${ts.length}</span></div><div class="g-track" style="width:${W}px">${p0 && p0.due && inR(p0.due) ? `<i class="g-pdue" style="left:${x(p0.due) + px / 2}px" title="${esc(L('Project target {d}', {d: dLong(p0.due)}))}"></i>` : ''}</div></div>`);
      ts.forEach(t => rows.push(taskRowG(t, 0))); }); }
  else dated.forEach(t => rows.push(taskRowG(t, ri++)));
  const H = (ri + 1) * RH;
  rows.push(`<div class="g-row g-add"><div class="g-label g-add-l">${icon('plus', 'ic-sm')}<span class="nm">${L('Add a task')}</span></div><div class="g-track g-addtrack" style="width:${W}px"><span class="g-add-hint">${L('Click or drag across days to add a task')}</span></div></div>`);
  const path = (xa, ya, xb, yb, os, is) => { const a = xa + 10 * os, b = xb - 10 * is; let p;
    if (is > 0 ? a <= b : a >= b) p = [[xa, ya], [a, ya], [a, yb], [xb, yb]]; else { const my = ya + (yb >= ya ? RH / 2 : -RH / 2); p = [[xa, ya], [a, ya], [a, my], [b, my], [b, yb], [xb, yb]]; }
    return 'M' + p.map(q => q.join(' ')).join(' L'); };
  let links = '';
  if (pj) { dated.forEach(t => predsOf(t).forEach(d => { const A0 = pos[d.id], B0 = pos[t.id]; if (!A0 || !B0) return; const ok = depOk(d.t, t, d.type);
      const dd = path(d.type[0] === 'F' ? A0.x2 : A0.x1, A0.y, d.type[1] === 'S' ? B0.x1 : B0.x2, B0.y, d.type[0] === 'F' ? 1 : -1, d.type[1] === 'S' ? 1 : -1);
      links += `<path class="g-lk ${ok ? '' : 'bad'}" d="${dd}" marker-end="url(#g-ar${ok ? '' : '-bad'})"/><path class="g-lk-hit" d="${dd}" data-act="dep-menu" data-s="${t.id}" data-p="${d.id}"><title>${esc(`${d.type}: ${t.title} ${L('waits for')} ${d.t.title}`)}</title></path>`; }));
    dated.forEach(t => { const m = t.milestone && pos['ms:' + t.milestone], A0 = pos[t.id]; if (!m || !A0) return; links += `<path class="g-lk ms" d="${path(A0.x2, A0.y, m.x1, m.y, 1, 1)}"/>`; }); }
  const svg = pj ? `<svg class="g-links" width="${W}" height="${H}" style="width:${W}px;height:${H}px" aria-hidden="true"><defs><marker id="g-ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ar" d="M0 0L8 4L0 8Z"/></marker><marker id="g-ar-bad" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ar bad" d="M0 0L8 4L0 8Z"/></marker></defs>${links}<path id="g-tmp" class="g-tmp" d=""/></svg>` : '';
  const layer = `<div class="g-layer" style="width:${W}px;--px:${px}px">${days.map((d, i) => weekday(d) > 5 ? `<i class="g-we" style="left:${i * px}px;width:${px}px"></i>` : '').join('')}${inR(today()) ? `${mine ? `<i class="g-tband" style="left:${x(today())}px;width:${px}px"></i>` : ''}<i class="g-now" style="left:${x(today()) + px / 2}px"></i>` : ''}</div>`;
  const fixN = pj ? fixPlan(projTasks(pj).filter(t => t.due)).length : 0;
  let strip = '';
  if (mine) { const wk = addDays(weekStart(today()), 6), open = tasks.filter(t => !isDone(t)), people = [...new Set(tasks.flatMap(collab))];
    const k = (nn, l, cls = '') => `<div class="gm-k ${cls}"><b class="t-num">${nn}</b><span>${l}</span></div>`;
    strip = `<div class="gm-strip">${k(open.filter(t => t.due && t.due >= today() && t.due <= wk).length, L('due this week'))}${k(open.filter(t => t.due && t.due < today()).length, L('overdue'), open.some(t => t.due && t.due < today()) ? 'bad' : '')}${k(open.filter(t => t.status === 'doing').length, L('in progress'))}
      ${people.length ? `<div class="gm-with"><span>${L('Working with')}</span>${people.map(id => `<button class="gm-p ${ui.gWith === id ? 'on' : ''}" data-act="gwith" data-id="${id}" title="${esc(ui.gWith === id ? L('Show all tasks') : L('Show tasks with {who}', {who: pname(id)}))}" aria-pressed="${ui.gWith === id}">${av(id, 'av-sm')}</button>`).join('')}</div>` : ''}</div>`; }
  return `<div class="tl-bar"><div class="seg" role="radiogroup" aria-label="${esc(L('Range'))}">${[['1w', '1 week'], ['2w', '2 weeks'], ['1m', '1 month'], ['3m', '3 months']].map(([k, l]) => `<button class="${rg === k ? 'on' : ''}" data-act="range" data-r="${k}" role="radio" aria-checked="${rg === k}">${L(l)}</button>`).join('')}</div><button class="btn btn-sm" data-act="g-today">${L('Today')}</button><span class="t-small t-mute">${dShort(start)} – ${dShort(end)}</span><span class="grow"></span>${fixN ? `<button class="btn btn-sm g-fix" data-act="dep-fixmenu" data-id="${pj.id}">${icon('warning', 'ic-sm')}${plural(fixN, 'Fix {n} date', 'Fix {n} dates')}</button>` : ''}</div>
  ${strip}<div class="gantt ${pj ? 'g-proj' : mine ? 'g-mine' : ''}" data-px="${px}" data-start="${start}" data-add="${pj ? pj.id : opt.add || ''}">${head}<div class="g-body">${layer}${svg}${rows.join('')}</div></div>
  ${undated.length ? `<h2 class="sec-h">${L('No date')} <span class="n">${undated.length}</span></h2><div class="rows">${undated.map(t => taskRow(t, opt)).join('')}</div>` : ''}
  <p class="t-small t-mute hint">${pj ? L('Bars run from planned start to due date. Click or drag on empty days to add a task. Drag from the dot at a bar end to another bar to link them: which ends you join sets the type (FS, SS, FF, SF). Right-click to react.') : L('Each bar wears its project’s pattern; flags are due dates. Pick a face above to see what you share with them. Click or drag on empty days to add a task. Right-click to react.')}</p>`;
}
ACT['dep-fixmenu'] = el => { ui.menu = {type: 'depfix', id: el.dataset.id, rect: el.getBoundingClientRect(), alignRight: true, width: 360, est: 320}; renderLayer(); };
// Add a task on the grid: click a day, or drag across days; type a name and press Enter.
document.addEventListener('pointerdown', e => {
  const tr = e.target.closest('.gantt .g-body .g-track'); if (!tr || e.button !== 0 || e.target.closest('.g-bar, .g-pin, .g-edge, .g-dia, .g-c, .g-out, .g-rxw, .g-ghost, button, a, input')) return;
  const g = tr.closest('.gantt'); if (!g.dataset.add) return; e.preventDefault(); const px = +g.dataset.px, r = tr.getBoundingClientRect(), i0 = Math.max(0, Math.floor((e.clientX - r.left) / px)); let i1 = i0;
  $$('.g-ghost').forEach(n => n.remove()); const gh = document.createElement('div'); gh.className = 'g-ghost'; tr.appendChild(gh);
  const paint = () => { const a = Math.min(i0, i1), b = Math.max(i0, i1); gh.style.left = `${a * px}px`; gh.style.width = `${(b - a + 1) * px - 4}px`; gh.dataset.len = b - a + 1; }; paint();
  const move = ev => { i1 = Math.max(0, Math.floor((ev.clientX - r.left) / px)); paint(); };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
    const a = Math.min(i0, i1), b = Math.max(i0, i1), s = addDays(g.dataset.start, a), d = addDays(g.dataset.start, b);
    gh.innerHTML = `<input class="g-new" placeholder="${esc(L('Task name, then Enter'))}" aria-label="${esc(L('New task from {a} to {b}', {a: dLong(s), b: dLong(d)}))}"><small class="t-num">${s === d ? dShort(s) : `${dShort(s)} – ${dShort(d)}`}</small>`;
    const inp = gh.querySelector('input'); inp.focus(); let done = false;
    const commit = () => { if (done) return; done = true; const v = inp.value.trim(); if (!v) { gh.remove(); return; } const q = parseQuick(v), pid = g.dataset.add === 'me' ? null : g.dataset.add;
      const t = addTask(q.title || v, {project: pid, due: d, mentions: q.mentions}); if (!t) { gh.remove(); return; } t.start = s; save(); render(); toast(L('Task added, {d}', {d: s === d ? dLong(s) : `${dShort(s)} – ${dShort(d)}`}), () => { db.tasks = db.tasks.filter(x => x !== t); rerender(); }); };
    inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(); } if (ev.key === 'Escape') { done = true; gh.remove(); } });
    inp.addEventListener('blur', () => setTimeout(commit, 120)); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
// Link two tasks: drag from the dot at one bar end to another bar. Joining a finish dot to the left half of a bar makes FS, and so on.
document.addEventListener('pointerdown', e => {
  const c = e.target.closest('.g-c'); if (!c || e.button !== 0) return; e.preventDefault(); e.stopPropagation();
  const g = c.closest('.gantt'), svg = g.querySelector('.g-links'), tmp = svg && svg.querySelector('#g-tmp'); if (!tmp) return; const src = taskOf(c.dataset.t), xa = +c.dataset.x, ya = +c.dataset.y; let hot = null;
  c.classList.add('on'); g.classList.add('linking');
  const move = ev => { const sr = svg.getBoundingClientRect(); tmp.setAttribute('d', `M${xa} ${ya} L${ev.clientX - sr.left} ${ev.clientY - sr.top}`); const el = document.elementFromPoint(ev.clientX, ev.clientY), tg = el && el.closest('.g-bar, .g-pin, .g-dia[data-ms]');
    if (hot && hot !== tg) hot.classList.remove('g-target', 'to-s', 'to-f'); hot = tg && tg.dataset.gt !== src.id ? tg : null; if (hot) { const r = hot.getBoundingClientRect(), s = ev.clientX < r.left + r.width / 2; hot.classList.add('g-target'); hot.classList.toggle('to-s', s); hot.classList.toggle('to-f', !s); } };
  const up = ev => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); tmp.setAttribute('d', ''); c.classList.remove('on'); g.classList.remove('linking'); if (!hot) return; hot.classList.remove('g-target', 'to-s', 'to-f');
    if (hot.dataset.ms) { const m0 = db.milestones.find(v => v.id === hot.dataset.ms); if (!canEditTask(src)) return toast(L('Only {who} or the project lead can change this task', {who: first(src.owner)})); const prev = src.milestone; src.milestone = m0.id; save(); render(); toast(L('{t} now counts toward {m}', {t: src.title, m: m0.title}), () => { src.milestone = prev; rerender(); }); return; }
    const r = hot.getBoundingClientRect(), end = ev.clientX < r.left + r.width / 2 ? 'S' : 'F'; addDep(taskOf(hot.dataset.gt), src, c.dataset.gc + end); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
}, true);

// ---------- round 8 (owner, 6 Oct) ----------
// Date fields say what they are at a glance: due is a dark red finish flag, planned start a green start mark.
const FLAG_D = 'M5 21V4 M5 4h14v9H5 M9.7 4v4.5 M14.3 4v4.5 M9.7 8.5v4.5 M14.3 8.5v4.5 M5 8.5h14', START_D = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M10 8.5l5.5 3.5-5.5 3.5Z';
const dateKind = el => /(^|-)(due|target|date)$/.test(el.id) && !/start/.test(el.id) && el.id !== 'c-date' && el.id !== 'd-date' && el.id !== 'ua-date' && el.id !== 'cal-jump' ? 'due' : /start$/.test(el.id) ? 'start' : '';
const dateIc = el => { const k = dateKind(el); return k ? `<span class="cf-ic ${k}">${svgD(k === 'due' ? FLAG_D : START_D)}</span>` : icon('calendar', 'ic-sm'); };

// Several people can be responsible for one task, from any division (owner, round 8; request R13). The first is the lead.
// Someone from the task's own division joins at once; someone from another division is asked and shares it after accepting
// (access_delegation: cross-division work needs the recipient's consent; a mention still never assigns).
function respSection(t, edit) { const as = (t.assignees || []).filter(a => a.state !== 'declined' && person(a.id)), d0 = taskDiv(t);
  const from = i => { const q = person(i); return q.div && q.div !== d0 ? ` · ${esc(div(q.div).short)}` : ''; };
  const row = (i, label, extra = '') => `<div class="row" data-act="open-person" data-id="${i}" tabindex="0">${av(i)}<div class="t"><b>${esc(pname(i))}</b><small>${label}</small></div>${idl(person(i))}${extra}</div>`;
  const rm = a => edit ? `<button class="ib" data-act="tresp-rm" data-id="${t.id}" data-p="${a.id}" aria-label="${esc(L('Remove {who}', {who: first(a.id)}))}">${icon('close', 'ic-xs')}</button>` : '';
  return `<h3 class="sec-h ppl-h">${L('Responsible')} <span class="n">${1 + as.length}</span>${edit && ui.form !== 'tresp' ? `<button class="btn btn-sm btn-ghost" data-act="tresp-open">${icon('plus')}${L('Add')}</button>` : ''}</h3>
    ${ui.form === 'tresp' ? `<div class="pt-add"><input class="input" id="tr-add" data-pm="tr" placeholder="${esc(L('Find someone in any division'))}" autocomplete="off" aria-label="${esc(L('Add people'))}"><p class="t-small t-mute">${L('People from {d} share it at once. Someone from another division is asked first and shares it after accepting.', {d: esc((div(d0) || {}).short || '')})}</p><div class="acts"><button class="btn btn-sm" data-act="form">${L('Done')}</button></div></div>` : ''}
    <div class="rows ppl">${row(t.owner, L('Lead') + from(t.owner))}${as.map(a => row(a.id, (a.state === 'invited' ? `<span class="inv">${L('Asked, not answered')}</span>` : L('Responsible')) + from(a.id), rm(a))).join('')}</div>`; }
function addAssignee(t, id) { const q = person(id); if (!t || !q || t.owner === id || (t.assignees || []).some(a => a.id === id && a.state !== 'declined')) return;
  t.assignees = (t.assignees || []).filter(a => a.id !== id); const direct = !q.div || q.div === taskDiv(t), a = {id, state: direct ? 'joined' : 'invited', by: session.me, at: nowStamp(), direct};
  t.assignees.push(a); notify(id, direct ? 'tadded' : 'tasked', {type: 'task', id: t.id}); logChange(taskDiv(t), direct ? 'added a person to' : 'asked a person to share', {type: 'task', id: t.id, name: t.title}); save(); render();
  toast(direct ? L('{who} added', {who: q.first}) : L('{who} asked. They share it after accepting.', {who: q.first}), () => { t.assignees = t.assignees.filter(v => v !== a); rerender(); }); }
const assignRow = x => { const a = x.assignees.find(v => v.id === session.me && v.state === 'invited');
  return `<div class="row inv" data-act="open-task" data-id="${x.id}" tabindex="0">${av(a.by)}<div class="t"><b>${esc(x.title)}</b><small>${L('{who} asks you to share this task', {who: esc(first(a.by))})}${x.due ? `, ${L('due {d}', {d: dShort(x.due)})}` : ''}</small></div><span class="kind">${icon('people', 'ic-sm')}${L('Shared task')}</span><button class="btn btn-ghost btn-sm" data-act="tassign" data-id="${x.id}" data-r="no">${L('Decline')}</button><button class="btn btn-pri btn-sm" data-act="tassign" data-id="${x.id}" data-r="yes">${L('Accept')}</button></div>`; };
PICK.tr = {
  refresh() { const i = $('#tr-add'), t = ui.insp && taskOf(ui.insp.id); floatPick('tr', i, i && t && ui.pm && ui.pm.key === 'tr' && !ui.pm.closed ? pmHtml('tr', i.value.trim(), [t.owner, ...(t.assignees || []).filter(a => a.state !== 'declined').map(a => a.id)]) : ''); },
  pick(id) { ui.pm = null; floatPick('tr', null, ''); addAssignee(taskOf(ui.insp.id), id); setTimeout(() => { const i = $('#tr-add'); if (i) i.focus(); }, 0); },
};
ON_INPUT['tr-add'] = () => { if (!ui.pm || ui.pm.key !== 'tr') ui.pm = {key: 'tr', group: null, idx: 0, level: 1, q: null}; ui.pm.closed = false; PICK.tr.refresh(); };
document.addEventListener('focusin', e => { if (e.target.id === 'tr-add') ON_INPUT['tr-add'](e.target); });
MENUS.deppick = mm => { const t = taskOf(mm.id), ps = predsOf(t), cand = projTasks(projOf(t.project)).filter(x => x.id !== t.id && !ps.some(d => d.id === x.id) && !waitsFor(x, t));
  return `<div class="mi-h">${L('It waits for')}</div>${cand.map(x => `<div class="mi" data-act="dep-pickone" data-s="${t.id}" data-p="${x.id}" tabindex="0" role="menuitem"><span class="mi-l">${tIcon(x, 'xs') || icon('tasks')}<span>${esc(x.title)}<small>${x.due ? rangeTxt({s: x.start, e: x.due}) : L('No date')}</small></span></span></div>`).join('') || `<p class="t-small t-mute" style="margin:6px 10px">${L('No other task in this project can be linked without a loop.')}</p>`}<p class="t-small t-mute" style="margin:6px 10px">${L('Added as Finish to start. Change the type on the card.')}</p>`; };
MENUS.rxwho = mm => { const x = rxItem(mm.kind, mm.id); if (!x) return ''; const r = Object.entries(x.reactions || {}).filter(([, v]) => v.length), mine = (myRx(x) || [])[0];
  return `<div class="mi-h">${L('Reactions')}</div><div class="rxw">${r.map(([e, v]) => `<div class="rxw-r"><span class="rxw-e">${e}</span><span class="rxw-p">${v.map(p => `<span class="person">${av(p, 'av-xs')}${esc(p === session.me ? L('You') : first(p))}</span>`).join('')}</span></div>`).join('') || `<p class="t-small t-mute">${L('No reactions yet.')}</p>`}</div>
    <div class="rx-bar sm">${EMO.map(e => `<button class="rx-e ${mine === e ? 'on' : ''}" data-act="react" data-k="${mm.kind}" data-id="${x.id}" data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div>`; };
Object.assign(ACT, {
  'tresp-open': () => { ui.form = 'tresp'; render(); setTimeout(() => { const i = $('#tr-add'); if (i) i.focus(); }, 0); },
  'tresp-rm': (el, id, e) => { e.stopPropagation(); const t = taskOf(id), a = (t.assignees || []).find(v => v.id === el.dataset.p); if (!a || !canEditTask(t)) return; t.assignees = t.assignees.filter(v => v !== a); logChange(taskDiv(t), 'removed a person from', {type: 'task', id: t.id, name: t.title}); save(); render(); toast(L('{who} removed', {who: first(a.id)}), () => { t.assignees.push(a); rerender(); }); },
  tassign: (el, id, e) => { e.stopPropagation(); const t = taskOf(id), a = (t.assignees || []).find(v => v.id === session.me && v.state === 'invited'); if (!a) return; const prev = {...a}; a.state = el.dataset.r === 'yes' ? 'joined' : 'declined'; a.answeredAt = nowStamp();
    notify(a.by, el.dataset.r === 'yes' ? 'tasked-yes' : 'tasked-no', {type: 'task', id: t.id}); save(); render(); toast(el.dataset.r === 'yes' ? L('You now share {t}', {t: t.title}) : L('Declined'), () => { Object.assign(a, prev); rerender(); }); },
  'dep-chip': el => { ui.menu = {type: 'dep', s: el.dataset.s, p: el.dataset.p, rect: el.getBoundingClientRect(), width: 300, est: 300}; renderLayer(); },
  'dep-pick': el => { ui.menu = {type: 'deppick', id: el.dataset.id, rect: el.getBoundingClientRect(), width: 320, est: 320}; renderLayer(); },
  'dep-pickone': el => { ui.menu = null; renderLayer(); addDep(taskOf(el.dataset.s), taskOf(el.dataset.p), 'FS'); },
  'rx-who': (el, id, e) => { if (e) e.stopPropagation(); ui.menu = {type: 'rxwho', kind: el.dataset.k, id, rect: el.getBoundingClientRect(), width: 280, est: 260}; renderLayer(); },
  gwith: (el, id) => { ui.gWith = ui.gWith === id ? null : id; render(); },
});

// ---------- round 9 (owner, 6 Oct) ----------
// Faces: as many as fit, then +n, on one line.
const faceW = n => n ? 20 + (n - 1) * 13 : 0;
const faces = (ids, cap) => { ids = [...new Set(ids.filter(Boolean))]; if (!ids.length) return ''; const k = ids.length <= cap ? ids.length : Math.max(1, cap - 1), more = ids.length - k;
  return `<span class="faces" title="${esc(ids.map(pname).join(', '))}">${ids.slice(0, k).map(i => av(i, 'av-xs')).join('')}${more ? `<span class="av av-xs more">+${more}</span>` : ''}</span>`; };
// Pickers opened inside the side panel render at page level and follow their input.
function floatPick(key, input, html) { let box = document.getElementById('pmfloat2'); if (!box) { box = document.createElement('div'); box.id = 'pmfloat2'; box.className = 'pm-host pm-fixed'; document.body.appendChild(box); }
  box.dataset.key = key; if (!input || !html) { box.innerHTML = ''; return; } box.innerHTML = html; const r = input.getBoundingClientRect(), below = innerHeight - r.bottom;
  box.style.left = `${Math.max(8, Math.min(r.left, innerWidth - 270))}px`; box.style.top = below < 300 && r.top > below ? `${Math.max(8, r.top - Math.min(320, box.firstElementChild ? box.firstElementChild.offsetHeight : 300) - 4)}px` : `${r.bottom + 4}px`; }
new MutationObserver(() => { const box = document.getElementById('pmfloat2'); if (!box || !box.innerHTML) return; const key = box.dataset.key, inp = key === 'tr' ? $('#tr-add') : $('#pt-add'); if (!inp || !ui.pm || ui.pm.key !== key || ui.pm.closed) box.innerHTML = ''; }).observe(document.getElementById('app'), {childList: true, subtree: true});
document.addEventListener('scroll', () => { const box = document.getElementById('pmfloat2'); if (box && box.innerHTML) { const k = box.dataset.key; if (PICK[k]) PICK[k].refresh(); } }, true);

// Reorder the project timeline: drag a task name up or down (or Alt + arrow keys). The order is saved per project.
let gDragDone = false;
document.addEventListener('pointerdown', e => {
  const lab = e.target.closest('.g-proj .g-label[data-gdrag]'); if (!lab || e.button !== 0 || e.target.closest('button, a, .rx')) return;
  const g = lab.closest('.gantt'), body = g.querySelector('.g-body'), id = lab.dataset.gdrag, y0 = e.clientY; let on = false, drop = null, mark = null, box = null;
  const move = ev => { if (!on && Math.abs(ev.clientY - y0) < 6) return;
    if (!on) { on = true; document.body.classList.add('g-nosel'); lab.closest('.g-row').classList.add('g-lifting'); mark = document.createElement('i'); mark.className = 'g-dropline'; box = document.createElement('i'); box.className = 'g-dropbox'; body.append(mark, box); }
    const gb = body.getBoundingClientRect(), hit = [...g.querySelectorAll('.g-label[data-gdrag]')].find(r => { const b = r.getBoundingClientRect(); return ev.clientY >= b.top && ev.clientY < b.bottom; });
    mark.style.display = box.style.display = 'none'; drop = null; if (!hit || hit.dataset.gdrag === id || isUnder(taskOf(hit.dataset.gdrag), id)) return;
    const b = hit.getBoundingClientRect(), t = taskOf(hit.dataset.gdrag), placed = !!(t.inWbs || t.parent);
    if (placed && ev.clientX > b.left + b.width / 2) { drop = {mode: 'in', id: t.id}; box.style.display = 'block'; box.style.top = `${b.top - gb.top}px`; box.style.height = `${b.height}px`; box.dataset.label = L('Make it a part of {t}', {t: t.title}); }
    else { const after = ev.clientY > b.top + b.height / 2; drop = {mode: after ? 'after' : 'before', id: t.id}; mark.style.display = 'block'; mark.style.top = `${(after ? b.bottom : b.top) - gb.top - 1}px`; mark.style.left = `${parseFloat(getComputedStyle(hit).paddingLeft) - 4}px`; } };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.body.classList.remove('g-nosel'); if (!on) return; gDragDone = true; setTimeout(() => { gDragDone = false; }, 0);
    if (mark) mark.remove(); if (box) box.remove(); lab.closest('.g-row').classList.remove('g-lifting'); if (drop) wbsDrop(id, drop); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
document.addEventListener('click', e => { if (gDragDone && e.target.closest('.g-label')) { e.stopPropagation(); e.preventDefault(); } }, true);
function reorderGantt(ids, from, dest) { const ts = ids.map(taskOf), prev = ts.map(t => t.order), list = ids.slice(); const [m0] = list.splice(from, 1); list.splice(dest, 0, m0);
  list.forEach((id, i) => { taskOf(id).order = i; }); save(); render(); setTimeout(() => { const n = $(`.g-label[data-gdrag="${m0}"]`); if (n) n.focus(); }, 0);
  toast(L('Order changed'), () => { ts.forEach((t, i) => { t.order = prev[i]; }); rerender(); }); }
ON_KEY.push((e, typing) => { const l2 = !typing && e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.closest && e.target.closest('.g-label[data-gdrag]'); if (l2) { e.preventDefault(); wbsIndent(taskOf(l2.dataset.gdrag), e.key === 'ArrowRight' ? 1 : -1); return true; } return false; });
ON_KEY.push((e, typing) => { const lab = !typing && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.target.closest && e.target.closest('.g-label[data-gdrag]'); if (!lab) return false; e.preventDefault();
  const ids = [...lab.closest('.gantt').querySelectorAll('.g-label[data-gdrag]')].map(r => r.dataset.gdrag), from = ids.indexOf(lab.dataset.gdrag), dest = from + (e.key === 'ArrowUp' ? -1 : 1); if (dest >= 0 && dest < ids.length) moveSib(taskOf(lab.dataset.gdrag), e.key === 'ArrowUp' ? -1 : 1); return true; });

// Demo data added after the first seed (routines, roadmap, programs) is filled in before each render.
const render0 = render;
render = function () { seedUpgrade(); if (typeof seedPrograms === 'function') seedPrograms(); ensureRoutines(); render0(); };

// ---------- WBS model (owner, round 10; work_subtasks, request R15) ----------
// One tree of task records. A phase, or any item with parts under it, is a summary: its dates and progress roll up from its
// work packages (the leaves). Leaves behave like any task. Tasks made in the Work tab are work packages outside the tree until
// someone places them. Codes (1, 1.2, 1.2.3) follow the order of siblings.
const sortSibs = a => a.sort((p, q) => (p.order ?? 1e6) - (q.order ?? 1e6) || (tS(p) || '9').localeCompare(tS(q) || '9') || (p.createdAt || '').localeCompare(q.createdAt || ''));
const kidsOf = (p, pid) => sortSibs(db.tasks.filter(t => t.project === p.id && !t.trashed && (t.parent || null) === pid && (pid || t.inWbs)));
const unplaced = p => db.tasks.filter(t => t.project === p.id && !t.trashed && !t.parent && !t.inWbs && !isSummary(t));
function descLeaves(t) { const out = [], walk = id => db.tasks.filter(c => c.parent === id && !c.trashed).forEach(c => { if (isSummary(c)) walk(c.id); else out.push(c); }); walk(t.id); return out; }
function rollup(t) { const ls = descLeaves(t), d = ls.filter(x => x.due); return {s: d.length ? d.map(tS).sort()[0] : null, e: d.length ? d.map(x => x.due).sort().pop() : null, done: ls.filter(isDone).length, total: ls.length}; }
function wbsTree(p) { const build = (pid, prefix, depth) => kidsOf(p, pid).map((t, i) => { const code = prefix ? `${prefix}.${i + 1}` : `${i + 1}`; return {t, code, depth, kids: build(t.id, code, depth + 1), ms: db.milestones.filter(m => m.parent === t.id)}; }); return build(null, '', 0); }
function wbsCodes(p) { const out = {}, walk = ns => ns.forEach(n => { out[n.t.id] = n.code; walk(n.kids); }); walk(wbsTree(p)); return out; }
function wbsFlat(p) { const out = [], col = ui.gcol || {}, walk = ns => ns.forEach(n => { const sum = isSummary(n.t); out.push({k: 't', o: n.t, depth: n.depth, code: n.code, sum}); if (!col[n.t.id]) { walk(n.kids); n.ms.forEach(m => out.push({k: 'ms', o: m, depth: n.depth + 1})); } });
  walk(wbsTree(p)); const un = unplaced(p); if (un.length) { out.push({k: 'grp'}); sortSibs(un).forEach(t => out.push({k: 't', o: t, depth: 0, code: '', sum: false})); } return out; }
const wbsSumNote = t => { const ru = rollup(t); return `<div class="notice n-info wsum"><i class="n-ic" style="--m:${maskUrl(A.ui.list)}"></i><div><b>${t.phase ? L('Phase') : L('Summary')}: ${plural(ru.total, '{n} work package', '{n} work packages')}, ${ru.done} ${L('done')}</b><p>${ru.s ? L('Its dates come from its parts: {d}.', {d: rangeTxt({s: ru.s, e: ru.e})}) : L('Its dates will come from its parts.')} <a href="#/projects/${t.project}/wbs">${L('Edit the parts in the WBS')}</a></p></div></div>`; };
function wbsSnap(p) { return db.tasks.filter(x => x.project === p.id).map(x => [x, x.parent, x.order, x.inWbs, x.trashed]); }
const wbsBack = s => () => { s.forEach(([x, pa, o, w, tr]) => Object.assign(x, {parent: pa, order: o, inWbs: w, trashed: tr})); rerender(); };
function reorderTree(id, beforeId, lastId) { const t = taskOf(id), b = beforeId && taskOf(beforeId), ref = b || taskOf(lastId), p = t && projOf(t.project); if (!t || !ref || b === t || !p) return;
  if (!canEditProject(p) && !canEditTask(t)) return toast(L('Only the project lead, PM or the task owner can move this.'));
  const parent = ref.parent || null, inW = !!(ref.inWbs || ref.parent);
  for (let a = parent && taskOf(parent); a; a = a.parent && taskOf(a.parent)) if (a.id === t.id) return toast(L('A part cannot go inside itself.'));
  const s0 = wbsSnap(p), sibs = sortSibs(db.tasks.filter(x => x.project === t.project && !x.trashed && x !== t && (x.parent || null) === parent && (parent ? true : !!x.inWbs === inW)));
  let at = b ? sibs.indexOf(b) : sibs.length; if (at < 0) at = sibs.length; sibs.splice(at, 0, t); t.parent = parent; t.inWbs = inW; sibs.forEach((x, i) => { x.order = i; });
  save(); render(); toast(L('Moved'), wbsBack(s0)); }
function moveSib(t, dir) { const p = projOf(t.project), sibs = sortSibs(db.tasks.filter(x => x.project === t.project && !x.trashed && (x.parent || null) === (t.parent || null) && (t.parent ? true : !!x.inWbs === !!t.inWbs))), i = sibs.indexOf(t), j = i + dir; if (j < 0 || j >= sibs.length) return;
  const s0 = wbsSnap(p); sibs.splice(i, 1); sibs.splice(j, 0, t); sibs.forEach((x, k) => { x.order = k; }); save(); render(); setTimeout(() => { const n = $(`.wbs-in[data-id="${t.id}"]`) || $(`[data-gdrag="${t.id}"]`); if (n) n.focus(); }, 0); toast(L('Moved'), wbsBack(s0)); }
function wbsIndent(t, dir) { const p = projOf(t.project), s0 = wbsSnap(p);
  if (dir > 0) { const sibs = sortSibs(db.tasks.filter(x => x.project === t.project && !x.trashed && (x.parent || null) === (t.parent || null) && (t.parent ? true : !!x.inWbs))), i = sibs.indexOf(t); if (i < 1) return toast(L('There is nothing above it to go under.'));
    const np = sibs[i - 1]; t.parent = np.id; t.inWbs = true; const ks = sortSibs(db.tasks.filter(x => x.parent === np.id && !x.trashed && x !== t)); ks.push(t); ks.forEach((x, k) => { x.order = k; }); }
  else { if (!t.parent) return toast(L('It is already a phase.')); const par = taskOf(t.parent); t.parent = par.parent || null; t.inWbs = true;
    const sibs = sortSibs(db.tasks.filter(x => x.project === t.project && !x.trashed && x !== t && (x.parent || null) === (par.parent || null) && (par.parent ? true : !!x.inWbs))); sibs.splice(sibs.indexOf(par) + 1, 0, t); sibs.forEach((x, k) => { x.order = k; }); }
  save(); render(); setTimeout(() => { const n = $(`.wbs-in[data-id="${t.id}"]`); if (n) n.focus(); }, 0); toast(dir > 0 ? L('Moved one level down') : L('Moved one level up'), wbsBack(s0)); }
function wbsAdd(p, mode, refId) { if (!canEditProject(p)) return toast(L('Only the project lead, PM or a co-director can change the WBS.')); const ref = refId && taskOf(refId), s0 = wbsSnap(p);
  const t = addTask(mode === 'phase' ? L('New phase') : L('New item'), {project: p.id}); if (!t) return; t.owner = ref && !isSummary(ref) ? ref.owner : (p.lead || session.me); t.inWbs = true;
  if (mode === 'phase') { t.phase = true; t.parent = null; t.order = kidsOf(p, null).length; }
  else if (mode === 'child') { t.parent = ref.id; const ks = sortSibs(db.tasks.filter(x => x.parent === ref.id && !x.trashed && x !== t)); ks.push(t); ks.forEach((x, k) => { x.order = k; }); }
  else { t.parent = ref.parent || null; const sibs = sortSibs(db.tasks.filter(x => x.project === p.id && !x.trashed && x !== t && (x.parent || null) === t.parent && (t.parent ? true : !!x.inWbs))); sibs.splice(sibs.indexOf(ref) + 1, 0, t); sibs.forEach((x, k) => { x.order = k; }); }
  if ((ui.wbsView || session.wbsView || 'v') !== 'table' && route().sub === 'wbs') ui.insp = {type: 'task', id: t.id};
  save(); render(); setTimeout(() => { const n = $(`.wbs-in[data-id="${t.id}"]`) || $('#f-title'); if (n) { n.focus(); n.select(); } }, 0);
  toast(mode === 'phase' ? L('Phase added') : L('Added to the WBS'), () => { db.tasks = db.tasks.filter(x => x !== t); wbsBack(s0)(); }); }
function wbsDel(t) { const p = projOf(t.project); if (!canEditProject(p)) return; const s0 = wbsSnap(p), all = [t, ...db.tasks.filter(x => { for (let a = x.parent && taskOf(x.parent); a; a = a.parent && taskOf(a.parent)) if (a.id === t.id) return true; return false; })];
  const msPrev = db.milestones.filter(m => all.some(x => x.id === m.parent)).map(m => [m, m.parent]); all.forEach(x => { x.trashed = true; }); msPrev.forEach(([m]) => { m.parent = null; }); if (ui.insp && all.some(x => x.id === ui.insp.id)) ui.insp = null;
  logChange(p.div, 'moved to trash', {type: 'task', id: t.id, name: t.title}); save(); render(); toast(plural(all.length, '{n} item moved to trash', '{n} items moved to trash'), () => { msPrev.forEach(([m, pa]) => { m.parent = pa; }); wbsBack(s0)(); }); }
MENUS.wbs = mm => { const t = taskOf(mm.id); if (!t) return ''; const top = !t.parent, sum = isSummary(t), mine = (myRx(t) || [])[0];
  return [`<div class="rx-bar sm">${EMO.map(e => `<button class="rx-e ${mine === e ? 'on' : ''}" data-act="react" data-k="task" data-id="${t.id}" data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div>`,
    mi('wbs-rename', L('Rename'), 'edit', `data-id="${t.id}"`), sum ? '' : mi('wbs-days', L('Set days'), 'clock', `data-id="${t.id}"`), canIcon('task', t) ? mi('ticon-open', t.icon ? L('Change icon') : L('Add an icon'), 'sparkles', `data-k="task" data-id="${t.id}"`) : '', '<hr>',
    mi('wbs-add', L('Add a part under this'), 'plus', `data-mode="child" data-id="${t.id}"`), mi('wbs-add', L('Add an item below'), 'list', `data-mode="below" data-id="${t.id}"`), '<hr>',
    mi('wbs-ind', L('Move one level down'), 'right', `data-id="${t.id}" data-d="1"`), top ? '' : mi('wbs-ind', L('Move one level up'), 'left', `data-id="${t.id}" data-d="-1"`), mi('wbs-mv', L('Move up'), 'up', `data-id="${t.id}" data-d="-1"`), mi('wbs-mv', L('Move down'), 'down', `data-id="${t.id}" data-d="1"`), '<hr>',
    mi('open-task', L('Open details'), 'info', `data-id="${t.id}"`), mi('wbs-del', L('Move to trash'), 'trash', `data-id="${t.id}"`)].join(''); };
Object.assign(ACT, {
  gcol: (el, id, e) => { e.stopPropagation(); ui.gcol = ui.gcol || {}; ui.gcol[id] = !ui.gcol[id]; render(); },
  'wbs-add': (el, id, e) => { if (e) e.stopPropagation(); ui.menu = null; renderLayer(); const m = el.dataset.mode; if (m === 'phase') wbsAdd(projOf(id), 'phase'); else { const t = taskOf(id); wbsAdd(projOf(t.project), m, id); } },
  'wbs-menu': (el, id, e) => { e.stopPropagation(); ui.menu = {type: 'wbs', id, rect: el.getBoundingClientRect(), alignRight: true, width: 236, est: 330}; renderLayer(); },
  'wbs-ind': (el, id) => { ui.menu = null; renderLayer(); wbsIndent(taskOf(id), +el.dataset.d); },
  'wbs-mv': (el, id) => { ui.menu = null; renderLayer(); moveSib(taskOf(id), +el.dataset.d); },
  'wbs-del': (el, id) => { ui.menu = null; renderLayer(); wbsDel(taskOf(id)); },
  'wbs-view': el => { ui.wbsView = session.wbsView = el.dataset.v; saveSession(); render(); },
});
// Table editing: the name, days and remarks save on change; Enter adds an item below, Tab and Shift+Tab change the level.
document.addEventListener('change', e => { const el = e.target, f = el.dataset && el.dataset.wf; if (!f) return; const t = taskOf(el.dataset.id), p = t && projOf(t.project); if (!t || !(canEditProject(p) || canEditTask(t))) return;
  if (f === 'title') { const v = el.value.trim(); if (!v || v === t.title) { el.value = t.title; return; } const prev = t.title; t.title = v; logChange(taskDiv(t), 'edited', {type: 'task', id: t.id, name: v}, prev, v); save(); toast(L('Renamed'), () => { t.title = prev; rerender(); }); render(); return; }
  if (f === 'remarks') { const prev = t.remarks; t.remarks = el.value.trim(); save(); toast(L('Saved'), () => { t.remarks = prev; rerender(); }); return; }
  if (f === 'dur') { const d = Math.max(1, Math.round(+el.value || 1)), s = t.start || (t.due ? t.due : (p.start && p.start > today() ? p.start : today())); setTaskDates(t, s, addDays(s, d - 1)); }
  if (f === 'place') { if (!el.value) return; const s0 = wbsSnap(p); t.parent = el.value; t.inWbs = true; const ks = sortSibs(db.tasks.filter(x => x.parent === el.value && !x.trashed && x !== t)); ks.push(t); ks.forEach((x, k) => { x.order = k; }); save(); render(); toast(L('Placed in the WBS'), wbsBack(s0)); } });
document.addEventListener('keydown', e => { const el = e.target; if (!el.classList || !el.classList.contains('wbs-in')) return; const t = taskOf(el.dataset.id); if (!t) return;
  if (e.key === 'Enter') { e.preventDefault(); if (el.value.trim() && el.value.trim() !== t.title) { t.title = el.value.trim(); save(); } wbsAdd(projOf(t.project), t.phase ? 'child' : 'below', t.id); }
  else if (e.key === 'Tab') { e.preventDefault(); if (el.value.trim() && el.value.trim() !== t.title) { t.title = el.value.trim(); save(); } wbsIndent(t, e.shiftKey ? -1 : 1); }
  else if (e.key === 'Escape') { el.value = t.title; el.blur(); } });
// Milestones move like bars: drag the diamond, or focus it and use the arrow keys (design-timeline-interactions).
let msDragDone = false;
function setMsDate(m, d) { const p = projOf(m.project), prev = m.target; if (prev === d) return; m.target = d; logChange(p.div, 'edited', {type: 'project', id: p.id, name: m.title}, dShort(prev), dShort(d)); save(); render(); setTimeout(() => { const n = $(`.g-dia[data-ms="${m.id}"]`); if (n) n.focus(); }, 0); toast(L('Milestone moved to {d}', {d: dLong(d)}), () => { m.target = prev; rerender(); }); }
document.addEventListener('pointerdown', e => { const d = e.target.closest('.g-dia.can[data-ms]'); if (!d || e.button !== 0) return; e.preventDefault(); const m = db.milestones.find(v => v.id === d.dataset.ms), px = +d.closest('.gantt').dataset.px, x0 = e.clientX, L0 = parseFloat(d.style.left); let dd = 0, moved = false;
  const move = ev => { const dx = ev.clientX - x0; if (!moved && Math.abs(dx) < 4) return; moved = true; d.classList.add('dragging'); dd = Math.round(dx / px); d.style.left = `${L0 + dd * px}px`; };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); if (!moved) return; msDragDone = true; setTimeout(() => { msDragDone = false; }, 0); if (!dd) { render(); return; } setMsDate(m, addDays(m.target, dd)); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); });
document.addEventListener('click', e => { if (msDragDone && e.target.closest('.g-dia')) { e.stopPropagation(); e.preventDefault(); } }, true);
ON_KEY.push((e, typing) => { const d = !typing && e.target.closest && e.target.closest('.g-dia.can[data-ms]'); if (!d || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return false; e.preventDefault(); const m = db.milestones.find(v => v.id === d.dataset.ms); setMsDate(m, addDays(m.target, e.key === 'ArrowRight' ? 1 : -1)); return true; });
// The WBS tree opens centred on the project box.
new MutationObserver(() => { const w = document.querySelector('.wtree-wrap:not([data-init])'); if (!w) return; w.dataset.init = '1'; const root = w.querySelector('.wn.root'); if (root && w.scrollWidth > w.clientWidth) { const r = root.getBoundingClientRect(), b = w.getBoundingClientRect(); w.scrollLeft += r.left + r.width / 2 - (b.left + b.width / 2); } }).observe(document.getElementById('app'), {childList: true, subtree: true});

// ---------- round 11 (owner, 6 Oct) ----------
const isUnder = (t, ancestorId) => { for (let a = t && t.parent && taskOf(t.parent); a; a = a.parent && taskOf(a.parent)) if (a.id === ancestorId) return true; return false; };
// Drop rule for the timeline: the left half of a row puts the task beside it (above or below, same level); the right half puts it
// inside that row as its last part. A green line or a green box shows which before you let go.
function wbsDrop(id, d) { const t = taskOf(id), ref = taskOf(d.id), p = t && projOf(t.project); if (!t || !ref || !p) return;
  if (!canEditProject(p) && !canEditTask(t)) return toast(L('Only the project lead, PM or the task owner can move this.')); if (ref.id === t.id || isUnder(ref, t.id)) return toast(L('A part cannot go inside itself.'));
  const s0 = wbsSnap(p);
  if (d.mode === 'in') { t.parent = ref.id; t.inWbs = true; const ks = sortSibs(db.tasks.filter(x => x.parent === ref.id && !x.trashed && x !== t)); ks.push(t); ks.forEach((x, k) => { x.order = k; }); save(); render(); return toast(L('Now a part of {t}', {t: ref.title}), wbsBack(s0)); }
  const parent = ref.parent || null, inW = !!(ref.inWbs || ref.parent), sibs = sortSibs(db.tasks.filter(x => x.project === t.project && !x.trashed && x !== t && (x.parent || null) === parent && (parent ? true : !!x.inWbs === inW)));
  sibs.splice(sibs.indexOf(ref) + (d.mode === 'after' ? 1 : 0), 0, t); t.parent = parent; t.inWbs = inW; sibs.forEach((x, k) => { x.order = k; }); save(); render(); toast(L('Moved'), wbsBack(s0)); }
// Right-click a WBS row or box for everything you can do with it (rename, days, icon, structure, reactions).
document.addEventListener('contextmenu', e => { const el = e.target.closest('tr[data-wrow], .wn[data-wid]'); if (!el || e.target.closest('input:focus')) return; e.preventDefault(); e.stopImmediatePropagation();
  ui.menu = {type: 'wbs', id: el.dataset.wrow || el.dataset.wid, rect: {left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY}, width: 260, est: 470}; renderLayer(); }, true);
const focusWbs = (sel, id) => setTimeout(() => { const n = $(`${sel}[data-id="${id}"]`); if (n) { n.focus(); n.select && n.select(); } else { ui.insp = {type: 'task', id}; render(); setTimeout(() => { const f = $('#f-title'); if (f) { f.focus(); f.select(); } }, 0); } }, 0);
Object.assign(ACT, {
  'wbs-rename': (el, id) => { ui.menu = null; renderLayer(); focusWbs('.wbs-in[data-wf="title"]', id); },
  'wbs-days': (el, id) => { ui.menu = null; renderLayer(); focusWbs('.wbs-num', id); },
});

// ---------- round 12 (owner, 6 Oct) ----------
const WBS_IC = {v: 'M9 3h6v4H9Z M3 16h6v5H3Z M15 16h6v5h-6Z M12 7v5 M6 12h12 M6 12v4 M18 12v4', h: 'M3 9.5h5v5H3Z M16 3.5h5v5h-5Z M16 15.5h5v5h-5Z M8 12h4 M12 6v12 M12 6h4 M12 18h4', table: 'M3 5h18v14H3Z M3 10h18 M3 14.5h18 M8 5v14'};
const canMsEdit = m => { if (m.roadmap) return canRoadmap(); const p = projOf(m.project); return !!p && ([m.owner, p.lead, p.pm].includes(session.me) || canEditProject(p)); };
// Tree connectors are drawn from the real box positions after each render, so they stay joined whatever the sizes.
function drawTree() { const tree = document.querySelector('.wtree'); if (!tree) return; let svg = tree.querySelector(':scope > svg.wt-lines');
  if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'wt-lines'); svg.setAttribute('aria-hidden', 'true'); tree.prepend(svg); }
  const tb = tree.getBoundingClientRect(), R = el => { const r = el.getBoundingClientRect(); return {l: r.left - tb.left, r: r.right - tb.left, t: r.top - tb.top, b: r.bottom - tb.top, cx: r.left - tb.left + r.width / 2, cy: r.top - tb.top + r.height / 2}; }, rad = 8;
  let d = '';
  tree.querySelectorAll('li').forEach(li => { const card = li.querySelector(':scope > .wn'), kids = [...li.querySelectorAll(':scope > ul > li > .wn')]; if (!card || !kids.length) return; const P = R(card), K = kids.map(R);
    if (K[0].l > P.r - 2) { // children to the right
      const mx = P.r + (Math.min(...K.map(k => k.l)) - P.r) / 2, top = Math.min(...K.map(k => k.cy)), bot = Math.max(...K.map(k => k.cy)); d += `M${P.r} ${P.cy}H${mx}`;
      if (K.length > 1) d += `M${mx} ${top}V${bot}`; K.forEach(k => { d += `M${mx} ${k.cy}H${k.l}`; });
    } else if (K.every(k => Math.abs(k.t - K[0].t) < 2) && K.length > 1 || (K.length === 1 && Math.abs(K[0].cx - P.cx) < 4)) { // a row of children below
      const my = P.b + (Math.min(...K.map(k => k.t)) - P.b) / 2; d += `M${P.cx} ${P.b}V${my}`; if (K.length > 1) d += `M${Math.min(...K.map(k => k.cx))} ${my}H${Math.max(...K.map(k => k.cx))}`; K.forEach(k => { d += `M${k.cx} ${my}V${k.t}`; });
    } else { // a stacked list below: a spine from under the box, a short arm into each child
      const sx = P.l + 14, last = K[K.length - 1]; d += `M${sx} ${P.b}V${last.cy - rad}Q${sx} ${last.cy} ${sx + rad} ${last.cy}H${last.l}`; K.slice(0, -1).forEach(k => { d += `M${sx} ${k.cy}H${k.l}`; }); } });
  svg.setAttribute('width', tree.scrollWidth); svg.setAttribute('height', tree.scrollHeight); svg.innerHTML = `<path d="${d}"/>`; }
let treeRaf = 0; const queueTree = () => { cancelAnimationFrame(treeRaf); treeRaf = requestAnimationFrame(drawTree); };
new MutationObserver(() => { if (document.querySelector('.wtree') && !document.querySelector('.wtree > svg.wt-lines')) queueTree(); }).observe(document.getElementById('app'), {childList: true, subtree: true});
addEventListener('resize', queueTree);
// WBS menu, now with responsible people, dates, days, status, remarks, descendants, milestones and delete
MENUS.wbs = mm => { const t = taskOf(mm.id); if (!t) return ''; const sum = isSummary(t), top = !t.parent, mine = (myRx(t) || [])[0];
  return [`<div class="rx-bar sm">${EMO.map(e => `<button class="rx-e ${mine === e ? 'on' : ''}" data-act="react" data-k="task" data-id="${t.id}" data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div><div class="mi-h">${esc(t.title)}</div>`,
    mi('wbs-edit', L('Rename'), 'edit', `data-id="${t.id}" data-f="title"`), mi('wbs-resp', L('Responsible…'), 'people', `data-id="${t.id}"`), sum ? '' : mi('wbs-dates', L('Dates…'), 'calendar', `data-id="${t.id}"`), sum ? '' : mi('wbs-edit', L('Days'), 'clock', `data-id="${t.id}" data-f="dur"`),
    mi('wbs-edit', L('Remarks'), 'note', `data-id="${t.id}" data-f="remarks"`), canIcon('task', t) ? mi('ticon-open', t.icon ? L('Change icon') : L('Add an icon'), 'sparkles', `data-k="task" data-id="${t.id}"`) : '',
    sum ? '' : `<div class="mi-st">${TASK_ORDER.map(s => `<button class="${t.status === s ? 'on' : ''}" data-act="set-status" data-id="${t.id}" data-s="${s}">${tstat(s)}</button>`).join('')}</div>`, '<hr>',
    mi('wbs-add', L('Add a descendant'), 'plus', `data-mode="child" data-id="${t.id}"`), mi('wbs-add', L('Add an item below'), 'list', `data-mode="below" data-id="${t.id}"`), mi('wbs-addms', L('Add a milestone here'), 'flag', `data-id="${t.id}"`), '<hr>',
    mi('wbs-ind', L('Move one level down'), 'right', `data-id="${t.id}" data-d="1"`), top ? '' : mi('wbs-ind', L('Move one level up'), 'left', `data-id="${t.id}" data-d="-1"`), mi('wbs-mv', L('Move up'), 'up', `data-id="${t.id}" data-d="-1"`), mi('wbs-mv', L('Move down'), 'down', `data-id="${t.id}" data-d="1"`), '<hr>',
    mi('open-task', L('Open details'), 'info', `data-id="${t.id}"`), mi('wbs-del', sum ? L('Delete with its parts') : L('Delete'), 'trash', `data-id="${t.id}"`)].join(''); };
MENUS.wms = mm => { const m = db.milestones.find(v => v.id === mm.id); if (!m) return ''; const can = canMsEdit(m);
  return `<div class="mi-h">${esc(m.title)}</div>${mi('open-ms', can ? L('Edit milestone') : L('Open milestone'), 'edit', `data-id="${m.id}"`)}${can && !['achieved', 'cancelled'].includes(m.state) ? mi('ms-achieve', L('Record as achieved'), 'check', `data-id="${m.id}"`) : ''}${can ? '<hr>' + mi('ms-del', L('Delete milestone'), 'trash', `data-id="${m.id}"`) : ''}`; };
// Responsible people from a menu: search everyone, tick to add or remove (other divisions are asked first).
MENUS.wresp = mm => { const t = taskOf(mm.id); if (!t) return ''; const q = (mm.q || '').toLowerCase(), cur = t.assignees || [], st = id => id === t.owner ? 'lead' : (cur.find(a => a.id === id && a.state !== 'declined') || {}).state;
  const row = p => { const s = st(p.id); return `<div class="mi wr-p ${s ? 'on' : ''}" data-act="wr-pick" data-id="${p.id}" data-t="${t.id}" tabindex="0" role="menuitemcheckbox" aria-checked="${!!s}">${av(p.id, 'av-sm')}<span class="mi-l"><span>${esc(p.name)}<small>${s === 'lead' ? L('Lead') : s === 'invited' ? L('Asked, not answered') : s ? L('Responsible') : esc(p.div ? div(p.div).short : L('Presidency'))}</small></span></span>${idl(p)}${s ? icon('check', 'tick') : ''}</div>`; };
  const ppl = db.people.filter(p => p.status === 'active' && (!q || p.name.toLowerCase().includes(q))), on = ppl.filter(p => st(p.id)), off = ppl.filter(p => !st(p.id));
  return `<div class="mi-h">${L('Responsible for {t}', {t: esc(t.title)})}</div><input class="input ip-q" id="wr-q" placeholder="${esc(L('Find someone in any division'))}" value="${esc(mm.q || '')}" autocomplete="off"><div class="wr-list">${on.map(row).join('')}${on.length && off.length ? '<hr>' : ''}${off.slice(0, 40).map(row).join('')}</div><p class="t-small t-mute wr-n">${L('People from another division are asked first.')}</p>`; };
ON_INPUT['wr-q'] = el => { ui.menu.q = el.value; const box = $('.wr-list'); if (!box) return; const tmp = document.createElement('div'); tmp.innerHTML = MENUS.wresp(ui.menu); box.replaceWith(tmp.querySelector('.wr-list')); };
function wbsAddMs(p, t) { if (!p || !canEditProject(p)) return toast(L('Only the project lead, PM or a co-director can change the WBS.')); const host = t ? (isSummary(t) ? t : t.parent && taskOf(t.parent)) : null, ru = host ? rollup(host) : null;
  const m = {id: uid('ms'), project: p.id, title: L('New milestone'), owner: p.lead || session.me, target: (ru && ru.e) || (t && t.due) || p.due || today(), state: 'active', achievedAt: null, parent: host ? host.id : null};
  db.milestones.push(m); logChange(p.div, 'added milestone', {type: 'project', id: p.id, name: m.title}); ui.menu = null; renderLayer(); ui.insp = {type: 'ms', id: m.id}; save(); render(); setTimeout(() => { const i = $('#ms-t'); if (i) { i.focus(); i.select(); } }, 40);
  toast(L('Milestone added'), () => { db.milestones = db.milestones.filter(x => x !== m); ui.insp = null; rerender(); }); }
// Edit a table cell in place: names, days and remarks become a field; start and finish open the date picker in the side panel.
function wbsCellEdit(c) { const t = taskOf(c.dataset.id), f = c.dataset.edit; if (!t) return;
  if (f === 'start' || f === 'due') { ui.insp = {type: 'task', id: t.id}; render(); setTimeout(() => { const b = document.querySelector(`[data-cf-for="f-${f}"]`); if (b) b.click(); }, 60); return; }
  const v0 = f === 'title' ? t.title : f === 'remarks' ? (t.remarks || '') : (t.due ? daysBetween(t.start || t.due, t.due) + 1 : ''), inp = document.createElement('input');
  inp.className = `w-editing ${f === 'dur' ? 'num' : ''}`; if (f === 'dur') { inp.type = 'number'; inp.min = 1; } inp.value = v0; inp.setAttribute('aria-label', f); c.replaceWith(inp); inp.focus(); inp.select();
  let done = false; const commit = ok => { if (done) return; done = true; const v = inp.value.trim(); if (!ok || v === String(v0)) { render(); return; } wbsSet(t, f, v); };
  inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') { ev.preventDefault(); commit(true); } else if (ev.key === 'Escape') { ev.preventDefault(); commit(false); } else if (ev.key === 'Tab' && f === 'title') { ev.preventDefault(); commit(true); wbsIndent(taskOf(t.id), ev.shiftKey ? -1 : 1); } });
  inp.addEventListener('blur', () => commit(true)); }
function wbsSet(t, f, v) { if (f === 'title') { if (!v) return render(); const prev = t.title; t.title = v; logChange(taskDiv(t), 'edited', {type: 'task', id: t.id, name: v}, prev, v); save(); render(); return toast(L('Renamed'), () => { t.title = prev; rerender(); }); }
  if (f === 'remarks') { const prev = t.remarks; t.remarks = v; save(); render(); return toast(L('Saved'), () => { t.remarks = prev; rerender(); }); }
  if (f === 'dur') { const d = Math.max(1, Math.round(+v || 1)), p = projOf(t.project), s = t.start || t.due || (p.start && p.start > today() ? p.start : today()); setTaskDates(t, s, addDays(s, d - 1)); } }
document.addEventListener('dblclick', e => { const c = e.target.closest('.w-ed[data-edit]'); if (c) { e.preventDefault(); wbsCellEdit(c); return; } const m = e.target.closest('tr[data-wms]'); if (m) { ui.insp = {type: 'ms', id: m.dataset.wms}; render(); } });
document.addEventListener('keydown', e => { const row = e.target.closest && e.target.closest('tr[data-wrow]'); if (!row || e.target !== row) return; const id = row.dataset.wrow;
  if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); const c = row.querySelector('.w-ed[data-edit="title"]'); if (c) wbsCellEdit(c); }
  else if (e.key === 'Delete') { e.preventDefault(); wbsDel(taskOf(id)); } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); const r = row.getBoundingClientRect(); ui.menu = {type: 'wbs', id, rect: {left: r.left + 120, right: r.left + 120, top: r.bottom, bottom: r.bottom}, width: 270, est: 560}; renderLayer(); } });
// Drag WBS table rows like timeline rows: left half = beside the row, right half = inside it.
document.addEventListener('pointerdown', e => {
  const row = e.target.closest('.wbs-t tr[data-wrow]'); if (!row || e.button !== 0 || e.target.closest('button, a, input, .w-editing')) return; const t0 = taskOf(row.dataset.wrow), p = t0 && projOf(t0.project); if (!p || !(canEditProject(p) || canEditTask(t0))) return;
  const wrap = row.closest('.wbs-scroll'), id = row.dataset.wrow, y0 = e.clientY; let on = false, drop = null, mark = null, box = null;
  const move = ev => { if (!on && Math.abs(ev.clientY - y0) < 6) return;
    if (!on) { on = true; document.body.classList.add('g-nosel'); row.classList.add('w-lifting'); mark = document.createElement('i'); mark.className = 'g-dropline'; box = document.createElement('i'); box.className = 'g-dropbox'; wrap.append(mark, box); }
    const wb = wrap.getBoundingClientRect(), hit = [...wrap.querySelectorAll('tr[data-wrow]')].find(r => { const b = r.getBoundingClientRect(); return ev.clientY >= b.top && ev.clientY < b.bottom; });
    mark.style.display = box.style.display = 'none'; drop = null; if (!hit || hit.dataset.wrow === id || isUnder(taskOf(hit.dataset.wrow), id)) return;
    const b = hit.getBoundingClientRect(), t = taskOf(hit.dataset.wrow), top = b.top - wb.top + wrap.scrollTop;
    if (ev.clientX > b.left + b.width / 2) { drop = {mode: 'in', id: t.id}; box.style.display = 'block'; box.style.top = `${top}px`; box.style.height = `${b.height}px`; box.dataset.label = L('Make it a part of {t}', {t: t.title}); }
    else { const after = ev.clientY > b.top + b.height / 2, nm = hit.querySelector('.w-nm'); drop = {mode: after ? 'after' : 'before', id: t.id}; mark.style.display = 'block'; mark.style.top = `${top + (after ? b.height : 0) - 1}px`; mark.style.left = `${(nm ? nm.getBoundingClientRect().left + parseFloat(getComputedStyle(nm).paddingLeft) : b.left) - wb.left - 4}px`; } };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.body.classList.remove('g-nosel'); if (!on) return; if (mark) mark.remove(); if (box) box.remove(); row.classList.remove('w-lifting'); if (drop) wbsDrop(id, drop); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});
// Right-click: WBS rows and boxes get the WBS menu; milestones (table, tree, timeline) get the milestone menu.
document.addEventListener('contextmenu', e => { if (e.target.closest('.w-editing')) return; const ms = e.target.closest('tr[data-wms], .wn[data-wms], .g-dia[data-ms], .g-ms .g-label .nm[data-act="open-ms"]'); if (!ms) return; e.preventDefault(); e.stopImmediatePropagation();
  ui.menu = {type: 'wms', id: ms.dataset.wms || ms.dataset.ms || ms.dataset.id, rect: {left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY}, width: 240, est: 200}; renderLayer(); }, true);
Object.assign(ACT, {
  'wbs-edit': (el, id) => { const f = el.dataset.f; ui.menu = null; renderLayer(); const c = $(`.w-ed[data-edit="${f}"][data-id="${id}"]`); if (c) return wbsCellEdit(c); ui.insp = {type: 'task', id}; render(); setTimeout(() => { const n = $(f === 'remarks' ? '#f-notes' : '#f-title'); if (n) { n.focus(); n.select && n.select(); } }, 30); },
  'wbs-resp': (el, id, e) => { if (e) e.stopPropagation(); const r = ui.menu && ui.menu.rect || el.getBoundingClientRect(); ui.menu = {type: 'wresp', id, rect: r, width: 300, est: 460}; renderLayer(); setTimeout(() => { const i = $('#wr-q'); if (i) i.focus(); }, 0); },
  'wbs-dates': (el, id) => { ui.menu = null; renderLayer(); ui.insp = {type: 'task', id}; render(); setTimeout(() => { const b = document.querySelector('[data-cf-for="f-start"]') || document.querySelector('[data-cf-for="f-due"]'); if (b) b.click(); }, 60); },
  'wbs-addms': (el, id) => { if (el.dataset.p) return wbsAddMs(projOf(el.dataset.p), null); const t = taskOf(id); wbsAddMs(projOf(t.project), t); },
  'wms-menu': (el, id, e) => { e.stopPropagation(); ui.menu = {type: 'wms', id, rect: el.getBoundingClientRect(), alignRight: true, width: 240, est: 200}; renderLayer(); },
  'wr-pick': (el, id) => { const t = taskOf(el.dataset.t); if (!t) return; if (id === t.owner) return toast(L('{who} leads this task. Change the lead in the task.', {who: first(id)}));
    const a = (t.assignees || []).find(v => v.id === id && v.state !== 'declined'); if (a) { if (!canEditTask(t)) return; t.assignees = t.assignees.filter(v => v !== a); save(); render(); toast(L('{who} removed', {who: first(id)}), () => { t.assignees.push(a); rerender(); }); } else addAssignee(t, id); renderLayer(); },
  'ms-unlink': (el, id) => { const t = taskOf(el.dataset.t); if (!t) return; const pv = t.milestone; t.milestone = null; save(); render(); toast(L('Unlinked'), () => { t.milestone = pv; rerender(); }); },
  'ms-del': (el, id) => { ui.menu = null; renderLayer(); const m = db.milestones.find(v => v.id === id); if (!m || !canMsEdit(m)) return; const i = db.milestones.indexOf(m), linked = db.tasks.filter(t => t.milestone === id);
    db.milestones.splice(i, 1); linked.forEach(t => { t.milestone = null; }); if (ui.insp && ui.insp.id === id) ui.insp = null; logChange(projOf(m.project).div, 'deleted milestone', {type: 'project', id: m.project, name: m.title}); save(); render();
    toast(L('Milestone deleted'), () => { db.milestones.splice(i, 0, m); linked.forEach(t => { t.milestone = id; }); rerender(); }); },
});
document.addEventListener('change', e => { const el = e.target, f = el.dataset && el.dataset.msf; if (!f) return; const m = db.milestones.find(v => v.id === el.dataset.id); if (!m || !canMsEdit(m)) return; const p = projOf(m.project), prev = {...m};
  if (f === 'link') { const t = taskOf(el.value); if (!t) return; const pv = t.milestone; t.milestone = m.id; save(); render(); return toast(L('{t} now counts toward {m}', {t: t.title, m: m.title}), () => { t.milestone = pv; rerender(); }); }
  if (f === 'title') { const v = el.value.trim(); if (!v || v === m.title) { el.value = m.title; return; } m.title = v; } else if (f === 'target') { if (!el.value) return; m.target = el.value; } else if (f === 'owner') m.owner = el.value; else if (f === 'parent') m.parent = el.value || null;
  logChange(p.div, 'edited', {type: 'project', id: p.id, name: m.title}); save(); render(); toast(L('Milestone saved'), () => { Object.assign(m, prev); rerender(); }); });

// ---------- person panel parts (D33) ----------
// The week shows busy time. A name appears only when the viewer is entitled to it: meetings both attend, meetings of the viewer's
// own workspace or the whole organization; everything else is Busy or Unavailable. Unavailable notes and Google titles are never shown to others.
function personWeek(p, wk, m) { const self = p.id === m.id, days = [...Array(7)].map((_, i) => addDays(wk, i)), H0 = 7, H1 = 21, k = 11, top = mm => (Math.max(H0 * 60, Math.min(H1 * 60, mm)) - H0 * 60) / 60 * k;
  const known = p.gcal || p.hasSchedule;
  const col = d => { const items = [];
    db.meetings.filter(mt => mt.date === d && mt.state !== 'cancelled' && (mt.organizer === p.id || mt.responses[p.id] === 'accepted')).forEach(mt => { const ws0 = meetingWs(mt), pr = projOf(mt.project), seen = self || mt.organizer === m.id || mt.responses[m.id] || (m.div && ws0 === m.div) || (pr && pr.org); items.push({s: mt.start, e: mt.end, t: seen ? mt.title : L('Busy'), k: seen ? 'mt' : 'busy', act: seen ? `data-act="open-meeting" data-id="${mt.id}"` : ''}); });
    db.unavailable.filter(u => u.who === p.id && uOn(u, d)).forEach(u => items.push({s: u.start ?? 0, e: u.end ?? 1440, t: self ? (u.note || L('Unavailable')) : L('Unavailable'), k: 'un'}));
    if (p.gcal) db.gbusy.filter(g => g.who === p.id && g.date === d).forEach(g => items.push({s: g.start, e: g.end, t: self ? g.title : L('Busy'), k: 'busy'}));
    return `<div class="pw-col ${d === today() ? 'today' : ''} ${weekday(d) > 5 ? 'we' : ''}"><span class="pw-d">${WD()[D(d).getDay()].slice(0, 2)} <b>${D(d).getDate()}</b></span><div class="pw-g" style="height:${(H1 - H0) * k}px">${items.map(it => `<i class="pw-i ${it.k}" style="top:${top(it.s)}px;height:${Math.max(6, top(it.e) - top(it.s) - 1)}px" ${it.act || ''} title="${esc(`${it.t}, ${mins(it.s)}–${mins(it.e)}`)}"><span>${esc(it.t)}</span></i>`).join('')}</div></div>`; };
  return `<div class="pw ${known ? '' : 'unknown'}"><div class="pw-hrs">${[8, 12, 16, 20].map(h => `<span style="top:${(h - H0) * k + 18}px">${String(h).padStart(2, '0')}</span>`).join('')}</div>${days.map(col).join('')}</div>
    <div class="pw-key"><span><i class="pw-sw mt"></i>${L('Shared meeting')}</span><span><i class="pw-sw busy"></i>${L('Busy')}</span><span><i class="pw-sw un"></i>${L('Unavailable')}</span></div>`; }
ACT.pweek = el => { ui.pweek = addDays(ui.pweek || weekStart(today()), +el.dataset.d); render(); };
document.addEventListener('change', e => { const f = e.target.dataset && e.target.dataset.pf; if (!f) return; const p = me(); if (!p) return; const prev = p[f]; p[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim(); save(); toast(L('Profile saved'), () => { p[f] = prev; rerender(); }); render(); });
// Any avatar or person chip opens the person panel (D33: from a mention, an avatar or a name). Pickers keep their own clicks.
document.addEventListener('click', e => { const a = e.target.closest('.av:not(.more), .person'); if (!a || e.defaultPrevented || e.target.closest('.pm, .popmenu, .gm-p, .w-ppl, .ticon-btn, .tabbar, .side, .sb-me, [data-act="pick"], [data-act="open-person"], .wr-p, .signin, .pick, label, .rt-o, .bt, .ob-p, .ob-next')) return;
  const img = a.matches('.av') ? a : a.querySelector('.av'); if (!img) return; const nm = img.getAttribute('alt') || img.getAttribute('aria-label') || img.getAttribute('title'); const p = nm && db.people.find(x => x.name === nm); if (!p) return;
  e.preventDefault(); e.stopPropagation(); ui.palette = false; ui.menu = null; renderLayer(); ui.form = null; ui.insp = {type: 'person', id: p.id}; render(); }, true);

// ---------- routines (D31, work_routines, work_type_model) ----------
// A routine definition makes separate occurrences. Each occurrence is its own task with its own owner, due date, checklist and
// completion; finishing one never finishes another. Pausing, skipping or editing changes future occurrences only; past ones keep
// their history. Co-Director and up make unit routines; anyone can repeat a personal task.
const RT_IC = 'M4 12a8 8 0 0 1 13.7-5.6L20 9 M20 4v5h-5 M20 12a8 8 0 0 1-13.7 5.6L4 15 M4 20v-5h5';
const rtOf = id => (db.routines || []).find(r => r.id === id);
const canEditRt = r => r.personal ? (r.owners.includes(session.me) || r.createdBy === session.me) : canCreateProject(me(), r.unit);
const addMonths = (d, i) => { const x = D(d), day = x.getDate(); x.setMonth(x.getMonth() + i, 1); const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); x.setDate(Math.min(day, last)); return iso(x); };
function occDates(r, until) { const step = r.cadence === 'weekly' ? 7 : r.cadence === '2w' ? 14 : Math.max(1, +r.every || 7), out = []; for (let i = 0; i < 400; i++) { const d = r.cadence === 'monthly' ? addMonths(r.start, i) : addDays(r.start, i * step); if (d > until) { out.push(d); break; } out.push(d); } return out; }
function cadText(r) { const wd = WDL()[D(r.start).getDay()]; const base = r.cadence === 'weekly' ? L('Every week on {d}', {d: wd}) : r.cadence === '2w' ? L('Every 2 weeks on {d}', {d: wd}) : r.cadence === 'monthly' ? L('Every month on day {n}', {n: D(r.start).getDate()}) : L('Every {n} days', {n: r.every});
  return `${base}${r.dueOffset ? `, ${plural(r.dueOffset, 'due {n} day later', 'due {n} days later')}` : ''}`; }
const ownerFor = (r, i) => r.owners[(r.rotate ? i : 0) % r.owners.length];
function ensureRoutines() { if (!db || !Array.isArray(db.routines)) return; let made = 0;
  db.routines.forEach(r => { if (r.paused || !r.owners || !r.owners.length) return; const horizon = addDays(today(), 21), all = occDates(r, horizon), firstFuture = all.find(d => d > today());
    all.forEach((d, i) => { if (d > horizon && d !== firstFuture) return; if ((r.skips || []).includes(d) || d < (r.from || r.start)) return; if (db.tasks.some(t => t.routine === r.id && t.occ === d)) return;
      const ow = ownerFor(r, i), done = r.seedDoneBefore && d < r.seedDoneBefore;
      db.tasks.push({id: uid('t'), title: r.name, owner: ow, due: addDays(d, +r.dueOffset || 0), time: r.time ?? null, status: done ? 'done' : 'todo', reviewer: null, project: r.project || null, milestone: null, div: r.unit || (person(ow) || {}).div || ws(), notes: '', evidence: '', doneAt: done ? addDays(d, +r.dueOffset || 0) : null, createdBy: r.createdBy, createdAt: r.at || nowStamp(), offer: null, meeting: null, links: [], mentions: [], trashed: false, start: null, deps: [], assignees: [], parent: null, inWbs: false, phase: false, remarks: '', order: null, icon: r.icon || null, reactions: {}, routine: r.id, occ: d, checklist: (r.checklist || []).map(text => ({text, done}))}); made++; }); });
  if (made) save(); }
// Future occurrences nobody has started are replaced when the definition changes; started or past ones stay as they are.
const pruneFuture = r => { db.tasks = db.tasks.filter(t => !(t.routine === r.id && t.occ > today() && t.status === 'todo' && !t.moved && !(t.checklist || []).some(c => c.done))); };
function rtTaskBox(t) { const r = rtOf(t.routine); if (!r) return ''; const cl = t.checklist || [], n = cl.filter(c => c.done).length, can = canEditTask(t);
  return `<div class="rt-box"><div class="rt-bh"><span class="rt-ic">${icon('routine')}</span><span>${L('Part of')} <a data-act="open-rt" data-id="${r.id}">${esc(r.name)}</a></span><small class="t-num">${dShort(t.occ)}</small></div>
    ${cl.length ? `<div class="rt-cl">${cl.map((c, i) => `<label class="rt-ck ${c.done ? 'on' : ''}"><input type="checkbox" data-rtck="${i}" data-id="${t.id}" ${c.done ? 'checked' : ''} ${can ? '' : 'disabled'}><span>${esc(c.text)}</span></label>`).join('')}</div><small class="t-small t-mute">${L('{d} of {n} steps', {d: n, n: cl.length})}</small>` : ''}
    <p class="t-small t-mute">${L('Finishing this one never finishes the others.')}${canEditRt(r) && !isDone(t) ? ` <a data-act="rt-skip" data-id="${r.id}" data-occ="${t.occ}">${L('Skip this one')}</a>` : ''}</p>${rtAskBox(t, r)}</div>`; }
document.addEventListener('change', e => { const i = e.target.dataset && e.target.dataset.rtck; if (i == null) return; const t = taskOf(e.target.dataset.id); if (!t || !canEditTask(t)) return; const c = t.checklist[+i]; c.done = e.target.checked; save(); render(); });
function repeatField(t) { if (t.project || t.owner !== session.me || isSummary(t)) return ''; const r = t.routine && rtOf(t.routine);
  if (r) return `<div class="field"><label>${L('Repeats')}</label><p class="t-small rt-rep">${icon('routine')}${esc(cadText(r))}${r.personal ? ` <a data-act="rt-stop" data-id="${r.id}">${L('Stop repeating')}</a>` : ''} <a data-act="open-rt" data-id="${r.id}">${L('Open')}</a></p></div>`;
  return `<div class="field"><label for="f-repeat">${L('Repeat')} <span class="opt">${L('Optional')}</span></label><select class="input" id="f-repeat"><option value="">${L('Does not repeat')}</option><option value="weekly">${L('Every week')}</option><option value="2w">${L('Every 2 weeks')}</option><option value="monthly">${L('Every month')}</option></select></div>`; }
ON_CHANGE['f-repeat'] = el => { const t = ui.insp && taskOf(ui.insp.id); if (!t || !el.value) return; const st = t.due || today();
  const r = {id: uid('rt'), name: t.title, unit: null, personal: true, project: null, cadence: el.value, every: el.value === 'weekly' ? 7 : 14, start: st, dueOffset: 0, time: t.time ?? null, owners: [session.me], rotate: false, checklist: [], paused: false, skips: [], createdBy: session.me, at: nowStamp(), icon: t.icon || null};
  const prev = {due: t.due, routine: t.routine, occ: t.occ}; t.due = st; t.routine = r.id; t.occ = st; db.routines.push(r); ensureRoutines(); save(); render();
  toast(L('Repeats: {c}', {c: cadText(r)}), () => { db.tasks = db.tasks.filter(x => x === t || x.routine !== r.id); db.routines = db.routines.filter(x => x !== r); Object.assign(t, prev); rerender(); }); };
// The batch roadmap strip in My Work (D32, proposed): organization-level milestones marked for the roadmap, a today marker, no
// invented progress. Anyone can open it (remembered per person); only the President and VPs add or edit items.
const canRoadmap = () => { const m = me(); return !!m && ['president', 'vp'].includes(m.role); };
function roadmapStrip0() { const items = db.milestones.filter(m => m.roadmap).sort((a, b) => (a.target || '9').localeCompare(b.target || '9')); if (!items.length && !canRoadmap()) return '';
  const open = !!(session.rmOpen || {})[session.me], nx = items.find(m => m.state !== 'achieved' && m.target >= today()), lo = '2026-08-01', hi = '2027-07-31', span0 = daysBetween(lo, hi), pc = d => Math.max(0, Math.min(100, daysBetween(lo, d) / span0 * 100));
  const head = `<button class="rm-h" data-act="rm-toggle" aria-expanded="${open}"><span class="rm-ic">${svgD('M4 21V4 M4 4h11l-2 4 2 4H4')}</span><b>${L('Batch 2026 roadmap')}</b>${nx ? `<span class="rm-next">${L('Next')}: <b>${esc(nx.title)}</b> · ${dShort(nx.target)}${daysBetween(today(), nx.target) > 0 ? `, ${plural(daysBetween(today(), nx.target), 'in {n} day', 'in {n} days')}` : `, ${L('today')}`}</span>` : ''}${icon(open ? 'chevron-down' : 'chevron', 'ic-sm rm-chev')}</button>`;
  if (!open) return `<div class="rm">${head}</div>`;
  const months = []; for (let d = D(lo); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  return `<div class="rm open">${head}<div class="rm-b"><div class="rm-track">${months.map(d => `<span class="rm-m" style="left:${pc(d)}%">${MON()[D(d).getMonth()]}${D(d).getMonth() === 0 ? ` <small>${D(d).getFullYear()}</small>` : ''}</span>`).join('')}<i class="rm-line"></i><i class="rm-done" style="width:${pc(today())}%"></i><i class="rm-now" style="left:${pc(today())}%"><b>${L('Today')}</b></i>
    ${rmLanes(items, pc).map(([m, lane]) => `<button class="rm-i ${m.state === 'achieved' ? 'ok' : msLate(m) ? 'late' : ''} ${lane}" style="left:${pc(m.target)}%" data-act="open-ms" data-id="${m.id}" title="${esc(`${m.title}, ${dLong(m.target)}`)}"><i class="rm-dia"></i><span><b>${esc(m.title)}</b><small class="t-num">${dShort(m.target)}</small></span></button>`).join('')}</div>
    <div class="rm-f">${canRoadmap() ? `<button class="linkbtn" data-act="rm-add">${icon('plus', 'ic-xs')} ${L('Add a roadmap item')}</button>` : `<span class="t-small t-mute">${L('Set by the President and VPs. Click an item to see its milestone.')}</span>`}</div></div></div>`; }
Object.assign(ACT, {
  'rm-toggle': () => { session.rmOpen = session.rmOpen || {}; session.rmOpen[session.me] = !session.rmOpen[session.me]; saveSession(); render(); },
  'rm-add': () => { if (!canRoadmap()) return; const p = db.projects.find(x => x.org) || db.projects[0]; const m = {id: uid('ms'), project: p.id, title: L('New roadmap item'), owner: session.me, target: today(), state: 'active', achievedAt: null, parent: null, roadmap: true};
    db.milestones.push(m); save(); ui.insp = {type: 'ms', id: m.id}; render(); setTimeout(() => { const i = $('#ms-t'); if (i) { i.focus(); i.select(); } }, 40); toast(L('Roadmap item added'), () => { db.milestones = db.milestones.filter(x => x !== m); ui.insp = null; rerender(); }); },
  'open-rt': (el, id, e) => { if (e) e.stopPropagation(); ui.form = null; ui.insp = null; ui.menu = null; renderLayer(); go(`operations/${id}`); },
  'new-rt': el => { ui.form = null; ui.insp = null; ui.menu = null; renderLayer(); ui.rtDraft = null; go(el.dataset.personal ? 'operations/new/personal' : 'operations/new'); },
  'rt-skip': (el, id) => { const r = rtOf(id), d = el.dataset.occ; if (!r || !canEditRt(r)) return; const t = db.tasks.find(x => x.routine === id && x.occ === d), snapT = db.tasks.slice(); r.skips = [...(r.skips || []), d]; if (t && !isDone(t)) db.tasks = db.tasks.filter(x => x !== t); if (ui.insp && t && ui.insp.id === t.id) ui.insp = null;
    logChange(r.unit || ws(), 'skipped a run of', {type: 'task', id: t ? t.id : r.id, name: r.name}); save(); render(); toast(L('Skipped {d}. The next one is unchanged.', {d: dShort(d)}), () => { r.skips = r.skips.filter(x => x !== d); db.tasks = snapT; rerender(); }); },
  'rt-pause': (el, id) => { const r = rtOf(id); if (!r || !canEditRt(r)) return; const snapT = db.tasks.slice(), was = r.paused; r.paused = !r.paused; if (r.paused) pruneFuture(r); else ensureRoutines(); save(); render(); toast(r.paused ? L('Paused. Upcoming runs nobody started were removed.') : L('Resumed'), () => { r.paused = was; db.tasks = snapT; rerender(); }); },
  'rt-stop': (el, id) => { const r = rtOf(id); if (!r) return; const snapT = db.tasks.slice(); r.paused = true; pruneFuture(r); save(); render(); toast(L('Stopped repeating. Past ones stay.'), () => { r.paused = false; db.tasks = snapT; rerender(); }); },
  'rt-del': (el, id) => { const r = rtOf(id); if (!r || !canEditRt(r)) return; const snapT = db.tasks.slice(), snapR = db.routines.slice(); pruneFuture(r); db.routines = db.routines.filter(x => x !== r); db.tasks.filter(t => t.routine === r.id).forEach(t => { t.routineGone = r.name; }); ui.insp = null; ui.menu = null; renderLayer(); save(); go('operations'); toast(L('Routine deleted. Past runs stay as tasks.'), () => { db.routines = snapR; db.tasks = snapT; rerender(); }); },
});

// ---------- demo data for D31 to D33 (added once to stores made before this round, and after a reset) ----------
function seedUpgrade() { if (!db || !db.people) return; let ch = 0;
  const PF = {mahdy: ['linkedin.com/in/mahdy-dwdg', '+62 812-0000-0101', '2024-09-02'], salsa: ['linkedin.com/in/salsa-nabila', '+62 812-0000-0102', '2025-09-01', true], nadia: ['linkedin.com/in/nadia-puspita', '+62 812-0000-0103', '2024-09-02'], fikri: [null, '+62 812-0000-0104', '2025-09-01'], fadhil: ['linkedin.com/in/fadhil-akbar', null, '2023-09-04'], raka: ['linkedin.com/in/raka-pratama', '+62 812-0000-0106', '2023-09-04']};
  db.people.forEach(p => { if (p.joined !== undefined) return; const f = PF[p.id]; p.linkedin = f ? f[0] : null; p.phone = f ? f[1] : null; p.hidePhone = !!(f && f[3]); p.joined = f ? f[2] : (rank(p) >= 2 ? '2024-09-02' : '2025-09-01'); ch++; });
  if (!Array.isArray(db.routines)) { ch++; db.routines = [
    {id: 'rt1', name: 'Fortnightly SnG pulse check', unit: 'sng', personal: false, project: null, cadence: '2w', every: 14, start: '2026-09-02', dueOffset: 2, time: null, owners: ['salsa', 'fikri', 'mahdy'], rotate: true, checklist: ['Collect one update from each project lead', 'Note blockers that need the director', 'Post the two-line summary in the SnG chat'], paused: false, skips: [], createdBy: 'nadia', at: '2026-08-30T10:00', seedDoneBefore: '2026-09-28', icon: {n: 'activity', c: 'green'}},
    {id: 'rt2', name: 'Monthly report to the Presidency', unit: 'sng', personal: false, project: null, cadence: 'monthly', every: 30, start: '2026-08-28', dueOffset: 3, time: null, owners: ['mahdy'], rotate: false, checklist: ['Pull the numbers from each project', 'Write the one-page report', 'Send it to Raka'], paused: false, skips: [], createdBy: 'mahdy', at: '2026-08-20T09:00', seedDoneBefore: '2026-10-01', icon: {n: 'chart', c: 'blue'}},
    {id: 'rt3', name: 'Weekly content posting', unit: 'mcit', personal: false, project: null, cadence: 'weekly', every: 7, start: '2026-09-07', dueOffset: 3, time: null, owners: ['yoga', 'hana', 'farah'], rotate: true, checklist: ['Draft the caption', 'Design the visual', 'Schedule the post'], paused: false, skips: [], createdBy: 'laras', at: '2026-09-01T09:00', seedDoneBefore: '2026-10-01', icon: {n: 'megaphone', c: 'purple'}},
    {id: 'rt4', name: 'Weekly review of my tasks', unit: null, personal: true, project: null, cadence: 'weekly', every: 7, start: '2026-09-04', dueOffset: 0, time: null, owners: ['mahdy'], rotate: false, checklist: [], paused: false, skips: [], createdBy: 'mahdy', at: '2026-09-03T20:00', seedDoneBefore: '2026-10-03', icon: {n: 'tasks', c: 'ink'}}]; }
  if (!db.rmSeeded) { db.rmSeeded = true; ch++; const pid = (db.projects.find(p => p.id === 'p-plan26') || db.projects.find(p => p.org) || {}).id; if (pid) [['rm1', 'Batch 2026 kick-off', 'fadhil', '2026-08-15', 'achieved'], ['rm2', 'Open recruitment opens', 'kirana', '2026-10-20'], ['rm3', 'Orientation days', 'kirana', '2026-10-24'], ['rm4', 'Midterm review', 'raka', '2026-12-12'], ['rm5', 'Anniversary week', 'fadhil', '2027-02-20'], ['rm6', 'Handover to batch 2027', 'fadhil', '2027-07-17']].forEach(([id, title, owner, target, st]) => { if (!db.milestones.some(m => m.id === id)) db.milestones.push({id, project: pid, title, owner, target, state: st || 'active', achievedAt: st ? target + 'T10:00' : null, achievedBy: st ? owner : null, parent: null, roadmap: true}); }); }
  if (ch) save(); }
// Roadmap labels take the first free lane (above, below, then a second row each side) so nearby items never overlap.
function rmLanes(items, pc) { const W = Math.max(480, (document.querySelector('.page') || {clientWidth: 900}).clientWidth - 140), lanes = ['up', 'dn', 'up2', 'dn2'], last = {};
  return items.map(m => { const x = pc(m.target) / 100 * W, w = Math.max(m.title.length * 6.6, 40) / 2 + 10; const lane = lanes.find(l => last[l] == null || last[l] < x - w) || lanes[0]; last[lane] = x + w; return [m, lane]; }); }

// ---------- Operations (owner, 6 Oct round 13; D31 work_routines, work_type_model) ----------
// A project ends; an operation keeps running. Routines leave the Projects page and get their own place, Operations, next to it.
// The board shows each routine's rhythm on one shared time axis: every run is a beat carrying the person whose turn it was and
// what was recorded (done, done late, overdue, skipped). No scores or rates, only what happened. Each run is still its own task.
const runDate = t => t.moved || t.occ;
const rtIcon = (r, cls = '') => r && r.icon ? tIcon(r, cls) : `<span class="ticon ${cls}" style="--ic:var(--ink-2)" aria-hidden="true">${icon('routine')}</span>`;
const canSeeRt = r => r.personal ? r.owners.includes(session.me) || r.createdBy === session.me : visibleDivs(me()).includes(r.unit) || r.owners.includes(session.me);
const stepDays = r => r.cadence === 'weekly' ? 7 : r.cadence === '2w' ? 14 : r.cadence === 'monthly' ? 30 : Math.max(1, +r.every || 7);
function runState(t) { if (isDone(t)) return t.due && t.doneAt && t.doneAt > t.due ? 'late' : 'done'; if (t.status === 'review') return 'rev'; if (t.due && t.due < today()) return 'miss'; return runDate(t) <= today() ? 'now' : 'up'; }
function runWord(b) { const t = b.t;
  if (b.st === 'done') return state(L('Done'), 'check', 'green');
  if (b.st === 'late') return state(plural(daysBetween(t.due, t.doneAt), 'Done {n} day late', 'Done {n} days late'), 'clock', 'warn');
  if (b.st === 'miss') return state(plural(daysBetween(t.due, today()), 'Overdue {n} day', 'Overdue {n} days'), 'warning', 'danger');
  if (b.st === 'now') return state(t.due === today() ? L('Due today') : L('Due {d}', {d: dShort(t.due)}), 'clock', 'ink');
  if (b.st === 'skip') return state(L('Skipped'), 'minus', 'mute');
  if (b.st === 'rev') return state(L('Waiting for sign-off'), 'search', 'warn');
  return state(L('Coming up'), 'calendar', 'mute'); }
const runTip = b => b.st === 'done' ? L('Done') : b.st === 'late' ? plural(daysBetween(b.t.due, b.t.doneAt), 'Done {n} day late', 'Done {n} days late') : b.st === 'miss' ? L('Overdue') : b.st === 'now' ? L('Open now') : b.st === 'skip' ? L('Skipped') : b.st === 'rev' ? L('Waiting for sign-off') : L('Coming up');
// Every beat of a routine between two dates: recorded runs, skipped dates and planned dates not yet in anyone's My Work.
function rtBeats(r, lo, hi) { const out = [], skips = r.skips || [];
  db.tasks.filter(t => t.routine === r.id && !t.trashed).forEach(t => { const d = runDate(t); if (d >= lo && d <= hi) out.push({d, t, owner: t.owner, st: runState(t)}); });
  skips.forEach(d => { if (d >= lo && d <= hi && !out.some(b => b.d === d)) out.push({d, st: 'skip', owner: null}); });
  if (!r.paused) occDates(r, hi).forEach((d, i) => { if (d <= today() || d < lo || d > hi || d < (r.from || r.start) || skips.includes(d) || db.tasks.some(t => t.routine === r.id && t.occ === d)) return; out.push({d, st: 'plan', owner: ownerFor(r, i)}); });
  return out.sort((a, b) => a.d.localeCompare(b.d)); }
const cadShort = r => { const wd = WD()[D(r.start).getDay()]; return r.cadence === 'weekly' ? L('Weekly, {d}', {d: wd}) : r.cadence === '2w' ? L('Every 2 weeks, {d}', {d: wd}) : r.cadence === 'monthly' ? L('Monthly, day {n}', {n: D(r.start).getDate()}) : L('Every {n} days', {n: r.every}); };
const rtNames = ids => { const n = ids.map(first); return n.length < 2 ? n.join('') : L('{a} and {b}', {a: n.slice(0, -1).join(', '), b: n[n.length - 1]}); };
// The routine as one plain sentence, used on its page and live in the builder.
function rtSentence(r) { const wd = WDL()[D(r.start).getDay()];
  const when = r.cadence === 'weekly' ? L('Every week on {d}.', {d: wd}) : r.cadence === '2w' ? L('Every 2 weeks on {d}.', {d: wd}) : r.cadence === 'monthly' ? L('Every month on day {n}.', {n: D(r.start).getDate()}) : L('Every {n} days.', {n: r.every});
  const due = +r.dueOffset ? plural(+r.dueOffset, 'Each run is due {n} day later.', 'Each run is due {n} days later.') : L('Each run is due the same day.');
  const who = r.personal ? '' : !r.owners.length ? L('Nobody chosen yet.') : r.owners.length > 1 && r.rotate ? L('{names} take turns.', {names: rtNames(r.owners)}) : L('{name} does it every time.', {name: first(r.owners[0])});
  const so = r.personal || r.signoff === false ? '' : (r.signer || r.createdBy) ? L('{name} signs off each run.', {name: first(r.signer || r.createdBy)}) : '';
  return `${when} ${due} ${who} ${so}`.trim(); }

// One row of beats on the shared axis. Dense cadences (every few days) become dots so beats never pile up.
function beatsRow(r, lo, hi, ppd) { const span = daysBetween(lo, hi) + 1, pc = d => (daysBetween(lo, d) + .5) / span * 100, gap = stepDays(r) * (ppd || 9), size = gap >= 40 ? '' : gap >= 27 ? 'sm' : 'dense', dense = size === 'dense';
  const beats = rtBeats(r, lo, hi).map(b => { const tip = `<span class="bt-tip"><b>${esc(dLong(b.d))}</b>${b.owner ? `<span>${esc(pname(b.owner))}</span>` : ''}<em>${esc(runTip(b))}</em></span>`;
    const act = b.t ? `data-act="open-task" data-id="${b.t.id}"` : `data-act="go" data-h="operations/${r.id}"`, lbl = `${dLong(b.d)}, ${b.owner ? pname(b.owner) + ', ' : ''}${runTip(b)}`;
    return `<button class="bt bt-${b.st}" style="left:${pc(b.d)}%" ${act} aria-label="${esc(lbl)}">${b.owner && !dense ? av(b.owner, 'av-xs') : ''}${['done', 'late', 'miss'].includes(b.st) && !dense ? '<i class="bt-b"></i>' : ''}${tip}</button>`; }).join('');
  return `<div class="ob-track ${size}"><i class="ob-line"></i>${beats}</div>`; }
function rhythm(rs, opt = {}) { const narrow = innerWidth < 760, lo = narrow ? addDays(weekStart(today()), -14) : opt.lo || addDays(weekStart(today()), -28), weeks = narrow ? 6 : opt.weeks || 12, hi = addDays(lo, weeks * 7 - 1), span = weeks * 7, pc = d => daysBetween(lo, d) / span * 100, cw = weekStart(today()), sc0 = $('#scroller'), lab = opt.solo ? 0 : narrow ? 118 : 236, ppd = Math.max(160, (sc0 ? sc0.clientWidth : innerWidth - 240) - (narrow ? 32 : 80) - lab - (opt.solo ? 32 : 0)) / span;
  const scale = Array.from({length: weeks}, (_, i) => { const d = addDays(lo, i * 7), x = D(d), newM = i === 0 || x.getDate() <= 7; return `<span class="ob-wl ${d === cw ? 'cur' : ''}" style="left:${pc(d)}%;width:${100 / weeks}%"><b>${newM ? MON()[x.getMonth()] : ''}</b><span>${x.getDate()}</span></span>`; }).join('');
  const bands = Array.from({length: weeks}, (_, i) => { const d = addDays(lo, i * 7); return `<i class="${d === cw ? 'cur' : i % 2 ? 'alt' : ''}" style="left:${pc(d)}%;width:${100 / weeks}%"></i>`; }).join('');
  const rows = rs.map(r => opt.solo ? `<div class="ob-row">${beatsRow(r, lo, hi, ppd)}</div>`
    : `${r._pgh || ''}${r._grp ? `<h3 class="ob-grp">${bicon(div(r._grp).icon, false)}${esc(div(r._grp).name)}</h3>` : ''}<div class="ob-row ${r.paused ? 'paused' : ''}"><a class="ob-name" href="#/operations/${r.id}"><span class="ob-ic">${rtIcon(r)}</span><span class="ob-nt"><b>${esc(r.name)}</b><small>${r.paused ? `<span class="ob-pz">${L('Paused')}</span>` : openAsks(r).length && canEditRt(r) ? `<span class="ob-ask">${plural(openAsks(r).length, '{n} request', '{n} requests')}</span>` : esc(cadShort(r))}</small></span></a>${beatsRow(r, lo, hi, ppd)}</div>`).join('');
  return `<div class="ob ${opt.solo ? 'solo' : ''}"><div class="ob-head">${opt.solo ? '' : `<span class="ob-hl">${L('Routine')}</span>`}<div class="ob-scale">${scale}</div></div><div class="ob-bands">${bands}</div>${rows}</div>`; }
const obLegend = () => `<div class="ob-legend">${[['done', 'Done'], ['late', 'Done late'], ['miss', 'Overdue'], ['now', 'Open now'], ['rev', 'Waiting for sign-off'], ['plan', 'Coming up'], ['skip', 'Skipped']].map(([k, l]) => `<span><i class="bt bt-${k} lg">${['done', 'late', 'miss'].includes(k) ? '<i class="bt-b"></i>' : ''}</i>${L(l)}</span>`).join('')}</div>`;

// A run card: what is due, whose turn it is, the steps done so far, and a check for the person who can finish it.
function runCard(t) { const r = rtOf(t.routine), b = {t, st: runState(t)}, cl = t.checklist || [], n = cl.filter(c => c.done).length, mine = t.owner === session.me;
  return `<div class="op-run ${mine ? 'mine' : ''}" data-act="open-task" data-id="${t.id}" tabindex="0" role="button">
    <div class="op-run-h"><span class="ob-ic sm">${rtIcon(r)}</span><b>${esc(r.name)}</b></div>
    <div class="op-run-who">${av(t.owner, 'av-md')}<span><b>${mine ? L('Your turn') : esc(pname(t.owner))}</b><small>${esc(dLong(runDate(t)))}</small></span></div>
    <div class="op-run-f">${runWord(b)}${cl.length ? `<span class="op-steps" aria-label="${esc(L('{d} of {n} steps', {d: n, n: cl.length}))}"><i>${cl.map(c => `<b class="${c.done ? 'on' : ''}"></b>`).join('')}</i>${n}/${cl.length}</span>` : '<span class="op-steps"></span>'}${(canEditTask(t) || canSignOff(t)) && !isDone(t) && (t.status !== 'review' || canSignOff(t)) ? `<button class="op-tick" data-act="op-done" data-id="${t.id}" aria-label="${esc(L('Mark done'))}">${icon('check', 'ic-sm')}</button>` : ''}</div></div>`; }

function opsBoard() {
  const m = me(), w = ws(), high = isHigh(m), sc = ['unit', 'mine', 'all'].includes(ui.oscope) && (ui.oscope !== 'all' || high) ? ui.oscope : 'unit';
  const unitRs = u => db.routines.filter(r => !r.personal && r.unit === u), mine = db.routines.filter(r => r.personal && r.owners.includes(m.id));
  let rs = sc === 'unit' ? unitRs(w) : sc === 'mine' ? mine : DIVS.flatMap(d => unitRs(d.id).map((r, i) => Object.assign(Object.create(r), {_grp: i === 0 ? d.id : null})));
  if (sc !== 'all') rs = rs.sort((a, b) => (a.paused ? 1 : 0) - (b.paused ? 1 : 0));
  const ids = new Set(rs.map(r => r.id)), we = addDays(weekStart(today()), 6), canNew = sc === 'mine' || canCreateProject(m, w);
  const week = db.tasks.filter(t => ids.has(t.routine) && !t.trashed && ((!isDone(t) && runDate(t) <= we) || (runDate(t) >= weekStart(today()) && runDate(t) <= we)))
    .sort((a, b) => (isDone(a) - isDone(b)) || (a.owner === m.id ? -1 : 0) - (b.owner === m.id ? -1 : 0) || (a.due || '').localeCompare(b.due || ''));
  const scopes = [['unit', esc(div(w).short), unitRs(w).length], ['mine', L('Your repeating tasks'), mine.length], ...(high ? [['all', L('All divisions'), db.routines.filter(r => !r.personal).length]] : [])];
  const newBtn = sc === 'mine' ? `<button class="btn btn-pri" data-act="new-rt" data-personal="1">${icon('plus')}${L('New repeating task')}</button>` : canCreateProject(m, w) ? `<button class="btn btn-pri" data-act="new-rt">${icon('plus')}${L('New routine')}</button>` : '';
  const sub = sc === 'mine' ? L('Tasks of your own that come back on a schedule') : sc === 'all' ? L('Every division’s recurring work') : L('Work that keeps {d} running, week after week', {d: esc(div(w).name)});
  const empty = sc === 'mine' ? `<div class="empty op-empty"><b>${L('Nothing repeats yet')}</b><p>${L('Make a task of your own come back every week or month, like reviewing your tasks on Friday.')}</p><button class="btn" data-act="new-rt" data-personal="1">${icon('plus')}${L('New repeating task')}</button></div>`
    : `<div class="empty op-empty"><b>${L('No routines yet')}</b><p>${L('A routine is work that comes back on a schedule: posting content every week, a report every month. Each time it comes round, the person whose turn it is gets their own task.')}</p>${canNew ? `<button class="btn btn-pri" data-act="new-rt">${icon('plus')}${L('New routine')}</button>` : `<p class="t-small t-mute">${L('Co-directors and above set up routines for a division. You can repeat a task of your own.')}</p>`}</div>`;
  const content = `<div class="page wide ops"><div class="ph"><div><h1 class="t-title">${L('Operations')}</h1><p class="sub">${sub}</p></div><div class="ph-r">${newBtn}</div></div>
    <div class="tabs pscope" role="tablist" aria-label="${esc(L('Which routines'))}">${scopes.map(([k, l, n]) => `<button role="tab" aria-selected="${sc === k}" class="${sc === k ? 'on' : ''}" data-act="oscope" data-k="${k}">${l}<span class="n">${n}</span></button>`).join('')}</div>
    ${rs.length ? `<h2 class="op-h first">${L('This week')}<span class="n">${week.length}</span><small>${esc(dShort(weekStart(today())))} – ${esc(dShort(we))}</small></h2>
      ${week.length ? `<div class="op-week">${week.map(runCard).join('')}</div>` : `<p class="t-small t-mute op-none">${L('Nothing due this week.')}</p>`}
      <h2 class="op-h">${L('Rhythm')}<small>${L('Each dot is one run, with the person whose turn it was')}</small>${sc !== 'all' ? pgToggle('ops') : ''}</h2>${rhythm(sc !== 'all' && pgByOn('ops') ? opsByProgram(rs, w) : rs)}${obLegend()}` : empty}</div>`;
  return {crumb: `${esc(div(w).short)}<i>/</i><b>${L('Operations')}</b>`, content}; }

function opsDetail(id) {
  const r = rtOf(id), w = ws(), crumb0 = `${esc(div(w).short)}<i>/</i><a href="#/operations">${L('Operations')}</a>`;
  if (!r || !canSeeRt(r)) return {crumb: crumb0, content: `<div class="page"><div class="empty"><b>${L('This routine isn’t available')}</b><p>${L('It may have been deleted, or it belongs to a division you can’t see.')}</p><a class="btn" href="#/operations">${L('Back to Operations')}</a></div></div>`};
  const can = canEditRt(r), all = rtBeats(r, '2000-01-01', addDays(today(), 120)), open = all.filter(b => b.t && !isDone(b.t)), cur = open.find(b => b.d <= today()) || null;
  const coming = all.filter(b => b !== cur && b.d > today()).slice(0, 6), past = all.filter(b => b !== cur && b.d <= today() && b.st !== 'plan').reverse().slice(0, 12);
  const nextB = all.find(b => b.d > today() && b.st !== 'skip'), canStep = cur && canEditTask(cur.t), cl = cur ? cur.t.checklist || [] : [];
  const nowCard = cur ? `<div class="op-now"><div class="op-now-top"><span class="op-k">${L('This run')}</span>${runWord(cur)}</div>
      <div class="op-now-h">${av(cur.t.owner, 'av-lg')}<span><b>${cur.t.owner === session.me ? L('Your turn') : esc(pname(cur.t.owner))}</b><small>${esc(dLong(cur.d))}${cur.t.due !== cur.d ? `, ${L('due {d}', {d: esc(dLong(cur.t.due))})}` : ''}</small></span></div>
      ${cl.length ? `<div class="rt-cl op-cl">${cl.map((c, i) => `<label class="rt-ck ${c.done ? 'on' : ''}"><input type="checkbox" data-rtck="${i}" data-id="${cur.t.id}" ${c.done ? 'checked' : ''} ${canStep ? '' : 'disabled'}><span>${esc(c.text)}</span></label>`).join('')}</div>` : ''}
      ${ui.form === `op-move:${cur.t.id}` ? `<div class="op-move"><label for="op-mv">${L('Move this run to')}</label><input class="input" type="date" id="op-mv" value="${cur.d}"><button class="btn btn-pri btn-sm" data-act="op-move-save" data-id="${cur.t.id}">${L('Move')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div>` : ''}
      <div class="op-acts">${opDoneBtn(cur.t)}<button class="btn" data-act="open-task" data-id="${cur.t.id}">${L('Open the task')}</button>${can && cur.st !== 'rev' ? `<button class="btn btn-ghost" data-act="form" data-f="op-move:${cur.t.id}">${L('Move')}</button><button class="btn btn-ghost" data-act="rt-skip" data-id="${r.id}" data-occ="${cur.t.occ}">${L('Skip this run')}</button>` : ''}</div></div>`
    : `<div class="op-now quiet"><span class="op-k">${L('This run')}</span><p>${r.paused ? L('Paused. Nothing new is made until someone resumes it.') : nextB ? L('Nothing open right now. Next run {d}, {who}.', {d: `<b>${esc(dLong(nextB.d))}</b>`, who: nextB.owner === session.me ? L('your turn') : L('{name}’s turn', {name: esc(first(nextB.owner))})}) : L('Nothing open right now.')}</p></div>`;
  const li = b => { const t = b.t, cl2 = t ? t.checklist || [] : [];
    if (t && ui.form === `op-move:${t.id}`) return `<div class="op-li op-li-mv"><span class="op-d"><b>${esc(WD()[D(b.d).getDay()])}</b>${esc(dShort(b.d))}</span><div class="op-move"><label for="op-mv">${L('Move this run to')}</label><input class="input" type="date" id="op-mv" value="${b.d}"><button class="btn btn-pri btn-sm" data-act="op-move-save" data-id="${t.id}">${L('Move')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`;
    return `<div class="op-li ${b.st}" ${t ? `data-act="open-task" data-id="${t.id}" tabindex="0" role="button"` : ''}><span class="op-d"><b>${esc(WD()[D(b.d).getDay()])}</b>${esc(dShort(b.d))}</span><span class="who">${b.owner ? `${av(b.owner, 'av-xs')}<span>${esc(b.owner === session.me ? L('You') : pname(b.owner))}</span>` : `<span class="t-mute">${L('Nobody, skipped')}</span>`}</span>
      <span class="op-li-s">${runWord(b)}${cl2.length && t && ['now', 'miss', 'rev'].includes(b.st) ? `<small class="t-num">${cl2.filter(c => c.done).length}/${cl2.length}</small>` : ''}</span>
      <span class="op-li-a">${can && b.st === 'skip' && b.d > today() ? `<button class="btn btn-sm btn-ghost" data-act="rt-unskip" data-id="${r.id}" data-occ="${b.d}">${L('Restore')}</button>` : can && b.st === 'up' ? `<button class="btn btn-sm btn-ghost" data-act="form" data-f="op-move:${t.id}">${L('Move')}</button><button class="btn btn-sm btn-ghost" data-act="rt-skip" data-id="${r.id}" data-occ="${t.occ}">${L('Skip')}</button>` : can && b.st === 'plan' ? `<button class="btn btn-sm btn-ghost" data-act="rt-skip" data-id="${r.id}" data-occ="${t ? t.occ : b.d}">${L('Skip')}</button>` : ''}</span></div>`; };
  const nextOwner = nextB ? nextB.owner : null, made = r.at ? r.at.slice(0, 10) : null;
  const content = `<div class="page wide ops"><div class="op-hd">${can ? `<button class="op-big" data-act="ticon-open" data-k="routine" data-id="${r.id}" aria-label="${esc(L('Change icon'))}">${rtIcon(r)}<i class="op-big-e">${icon('edit', 'ic-xs')}</i></button>` : `<span class="op-big">${rtIcon(r)}</span>`}
      <div class="op-hd-t"><h1 class="t-title">${esc(r.name)}</h1><p class="op-sent">${esc(rtSentence(r))}</p></div>
      <div class="op-hd-r">${r.paused ? state(L('Paused'), 'hand', 'warn') : state(L('Running'), 'activity', 'green')}${can ? `<button class="btn" data-act="go" data-h="operations/${r.id}/edit">${icon('edit')}${L('Edit')}</button><button class="btn" data-act="rt-pause" data-id="${r.id}">${icon(r.paused ? 'right' : 'hand')}${r.paused ? L('Resume') : L('Pause')}</button><button class="ib" data-act="menu" data-menu="opmore" data-id="${r.id}" aria-label="${esc(L('More'))}">${icon('more')}</button>` : ''}</div></div>
    <div class="op-strip">${rhythm([r], {solo: true, lo: addDays(weekStart(today()), -42), weeks: 14})}</div>
    <div class="op-cols"><div class="op-main">${asksCard(r, can)}${nowCard}
      <h2 class="op-h">${L('Coming up')}</h2>${coming.length ? `<div class="op-list">${coming.map(li).join('')}</div>` : `<p class="t-small t-mute op-none">${r.paused ? L('Paused, nothing coming up.') : L('Nothing coming up.')}</p>`}
      <h2 class="op-h">${L('History')}</h2>${past.length ? `<div class="op-list">${past.map(li).join('')}</div>` : `<p class="t-small t-mute op-none">${L('No past runs yet.')}</p>`}</div>
    <aside class="op-side">
      ${r.personal ? '' : `<section><h3>${r.rotate && r.owners.length > 1 ? L('Takes turns in this order') : L('Done by')}</h3><ol class="op-rota">${r.owners.map((pid, i) => `<li class="${pid === nextOwner ? 'next' : ''}">${r.rotate && r.owners.length > 1 ? `<span class="n">${i + 1}</span>` : ''}${av(pid, 'av-sm')}<span><b>${esc(pname(pid))}</b>${pid === nextOwner ? `<small class="nx">${L('Up next')}</small>` : ''}</span></li>`).join('')}</ol></section>`}
      <section><h3>${L('Steps for each run')}</h3>${(r.checklist || []).length ? `<ol class="op-tpl">${r.checklist.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : `<p class="t-small t-mute">${can ? L('No steps. Add them with Edit.') : L('No steps.')}</p>`}</section>
      <section><h3>${L('About')}</h3><div class="op-meta">
        <div><span class="k">${L('Belongs to')}</span>${r.personal ? `<span>${L('You only')}</span>` : `<span class="op-dv">${bicon(div(r.unit).icon, false)}${esc(div(r.unit).name)}</span>`}</div>
        ${r.personal ? '' : `<div><span class="k">${L('Program')}</span>${pgChip('routine', r) || `<span class="t-mute">${L('None')}</span>`}</div>`}
        ${r.project && projOf(r.project) ? `<div><span class="k">${L('Serves')}</span><a href="#/projects/${r.project}">${esc(projOf(r.project).name)}</a></div>` : ''}
        <div><span class="k">${L('Created by')}</span><span>${esc(first(r.createdBy))}${made ? `, ${esc(dShort(made))}` : ''}</span></div></div>
        <p class="t-small t-mute op-note">${L('Each run is its own task in that person’s My Work, three weeks ahead. Finishing one never finishes another. Edits change future runs only.')}</p></section>
    </aside></div></div>`;
  return {crumb: `${crumb0}<i>/</i><b>${esc(r.name)}</b>`, content}; }
MENUS.opmore = mm => { const id = mm.id || (ui.menu && ui.menu.id); return `<div class="mi danger" data-act="rt-del" data-id="${id}" tabindex="0" role="menuitem"><span class="mi-l">${icon('trash')}${L('Delete routine')}</span></div>`; };

// ---------- the builder: one page, written as plain sentences, with a live preview of the next runs ----------
function rtDraftFor(id, sub) { const key = id ? `edit:${id}` : `new:${sub || ''}`; if (ui.rtDraft && ui.rtDraft.key === key) return ui.rtDraft;
  const r = id && rtOf(id), personal = r ? r.personal : sub === 'personal', nx = addDays(today(), 1);
  ui.rtDraft = r ? {key, id, ...JSON.parse(JSON.stringify(r))} : {key, id: null, name: '', icon: null, personal, unit: personal ? null : ws(), cadence: 'weekly', every: 7, start: nx, dueOffset: personal ? 0 : 2, owners: [session.me], rotate: !personal, checklist: [], project: null, signoff: !personal, signer: rank(me()) >= 2 ? session.me : unitLeads(ws())[0] || null};
  if (r) ui.rtDraft.signoff = !r.personal && r.signoff !== false;
  return ui.rtDraft; }
const DUE_OPTS = [[0, 'Same day'], [1, '1 day later'], [2, '2 days later'], [3, '3 days later'], [7, 'A week later']];
function obPreview(x) { const from = x.id ? (today() >= x.start ? addDays(today(), 1) : x.start) : x.start, ds = x.start ? occDates(x, addDays(from, 400)).map((d, i) => [d, i]).filter(([d]) => d >= from).slice(0, 6) : [];
  return `<h3>${L('How it will run')}</h3><p class="ob-say">${esc(rtSentence(x))}</p>
    <div class="ob-next">${ds.map(([d, i]) => { const ow = x.personal ? session.me : x.owners.length ? ownerFor(x, i) : null; return `<div><span class="d">${esc(dLong(d))}</span>${ow ? `${av(ow, 'av-xs')}<span>${esc(ow === session.me ? L('You') : first(ow))}</span>` : `<span class="t-mute">${L('Nobody yet')}</span>`}<small>${L('due {d}', {d: esc(dShort(addDays(d, +x.dueOffset || 0)))})}</small></div>`; }).join('') || `<p class="t-small t-mute">${L('Choose when it starts.')}</p>`}</div>
    <p class="t-small t-mute">${x.id ? L('Runs already done or started stay as they are. The rest follow the new plan.') : L('Each run becomes its own task in that person’s My Work, three weeks ahead.')}</p>`; }
const obRefresh = () => { const p = $('#ob-prev'); if (p && ui.rtDraft) p.innerHTML = obPreview(ui.rtDraft); };
function opsBuilder(id, sub) {
  const m = me(), w = ws(), r0 = id && rtOf(id), crumb0 = `${esc(div(w).short)}<i>/</i><a href="#/operations">${L('Operations')}</a>`;
  if (id && (!r0 || !canEditRt(r0))) return {crumb: crumb0, content: `<div class="page"><div class="empty"><b>${L('You can’t edit this routine')}</b><p>${L('Co-directors and above edit their division’s routines.')}</p><a class="btn" href="#/operations">${L('Back to Operations')}</a></div></div>`};
  const x = rtDraftFor(id, sub);
  if (!x.personal && !id && !canCreateProject(m, x.unit)) return {crumb: crumb0, content: `<div class="page"><div class="empty"><b>${L('Routines for a division are set up by co-directors and above')}</b><p>${L('You can still make a task of your own repeat.')}</p><button class="btn btn-pri" data-act="new-rt" data-personal="1">${L('New repeating task')}</button></div></div>`};
  const wdx = weekday(x.start || today()), pool = x.personal ? [] : db.people.filter(p => p.status === 'active' && p.div === x.unit && !x.owners.includes(p.id)).sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  const projs = x.personal ? [] : db.projects.filter(p => (p.div === x.unit || jointIn(p, x.unit)) && !ENDED.includes(p.stage)), rot = x.owners.length > 1 && x.rotate;
  const seg = (act, opts, cur) => `<div class="seg">${opts.map(([k, l]) => `<button class="${String(cur) === String(k) ? 'on' : ''}" data-act="${act}" data-k="${k}">${L(l)}</button>`).join('')}</div>`;
  const content = `<div class="page wide ops"><div class="ob-build"><div class="obf">
    <p class="op-k">${id ? L('Edit routine') : x.personal ? L('New repeating task') : L('New routine for {d}', {d: esc(div(x.unit).name)})}</p>
    <div class="obf-name"><button class="op-big" data-act="ticon-open" data-k="routine" data-id="draft" aria-label="${esc(L('Choose an icon'))}">${rtIcon(x)}<i class="op-big-e">${icon('edit', 'ic-xs')}</i></button><div class="field"><input id="ob-name" value="${esc(x.name)}" placeholder="${esc(x.personal ? L('Name it, like Review my week') : L('Name it, like Weekly content posting'))}" aria-label="${esc(L('Name'))}" autocomplete="off"><span class="help"></span></div></div>
    <section class="obf-sec"><h3>${L('When does it come round?')}</h3>${seg('ob-cad', [['weekly', 'Every week'], ['2w', 'Every 2 weeks'], ['monthly', 'Every month'], ['custom', 'Every few days']], x.cadence)}
      ${['weekly', '2w'].includes(x.cadence) ? `<div class="obf-row"><span>${L('On')}</span><div class="ob-days" role="radiogroup" aria-label="${esc(L('Day of the week'))}">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button role="radio" aria-checked="${wdx === n}" class="${wdx === n ? 'on' : ''}" data-act="ob-day" data-k="${n}" aria-label="${esc(WDL()[n % 7])}">${esc(WD()[n % 7])}</button>`).join('')}</div></div>` : ''}
      ${x.cadence === 'custom' ? `<div class="obf-row"><span>${L('Every')}</span><input class="input obf-num" type="number" min="1" max="60" id="ob-every" value="${+x.every || 7}"><span>${L('days')}</span></div>` : ''}
      <div class="obf-row"><label for="ob-start">${L('First run')}</label><div class="field"><input class="input" type="date" id="ob-start" value="${x.start || ''}"><span class="help"></span></div>${x.cadence === 'monthly' ? `<span class="t-small t-mute">${L('Then the same day each month.')}</span>` : ''}</div></section>
    <section class="obf-sec"><h3>${L('When is each run due?')}</h3>${seg('ob-due', DUE_OPTS, +x.dueOffset || 0)}</section>
    ${x.personal ? '' : `<section class="obf-sec"><h3>${L('Who does it?')}</h3>${seg('ob-rot', [['1', 'Take turns'], ['0', 'Same person every time']], x.rotate ? '1' : '0')}
      <div class="ob-who">${x.owners.map((pid, i) => `${i && rot ? `<span class="ob-arrow">${icon('right', 'ic-xs')}</span>` : ''}<span class="ob-p">${rot ? `<span class="n">${i + 1}</span>` : ''}${av(pid, 'av-sm')}<span>${esc(pname(pid))}</span>${rot && i ? `<button data-act="ob-mv" data-k="${i}" aria-label="${esc(L('Move earlier'))}">${icon('left', 'ic-xs')}</button>` : ''}${x.owners.length > 1 ? `<button data-act="ob-rm" data-k="${i}" aria-label="${esc(L('Remove {name}', {name: pname(pid)}))}">${icon('close', 'ic-xs')}</button>` : ''}</span>`).join('')}
        ${(x.rotate || !x.owners.length) && pool.length ? `<button class="ob-add" data-act="menu" data-menu="obpick" aria-haspopup="menu">${icon('plus', 'ic-sm')}${L('Add a person')}</button>` : !x.rotate && pool.length ? `<button class="ob-add" data-act="menu" data-menu="obpick" aria-haspopup="menu">${L('Change')}</button>` : ''}</div>
      <p class="t-small t-mute">${rot ? L('Each run goes to the next person in this order, then it starts again.') : L('Every run goes to the same person.')}</p></section>`}
    ${x.personal ? '' : `<section class="obf-sec"><h3>${L('Who checks each run is done?')}</h3>${seg('ob-so', [['1', 'A leader signs off'], ['0', 'Nobody, it counts when ticked']], x.signoff === false ? '0' : '1')}
      ${x.signoff === false ? `<p class="t-small t-mute">${L('A run counts as done as soon as the person ticks it.')}</p>` : `<div class="obf-row"><label for="ob-signer">${L('Signs off')}</label><select class="input obf-sel" id="ob-signer">${unitLeads(x.unit).map(id => `<option value="${id}" ${(x.signer || x.createdBy) === id ? 'selected' : ''}>${esc(pname(id))}</option>`).join('')}</select></div><p class="t-small t-mute">${L('The person whose turn it is finishes the run; it counts as done once this leader signs it off. When it is the leader’s own turn, the next leader signs instead. Nobody signs off their own run.')}</p>`}</section>`}
    <section class="obf-sec"><h3>${L('Steps for each run')} <small>${L('Optional')}</small></h3><div class="ob-steps">${(x.checklist || []).map((s, i) => `<div class="ob-step"><span class="n">${i + 1}</span><input class="input" data-input="ob-step" data-k="${i}" value="${esc(s)}" placeholder="${esc(L('Describe the step'))}"><button class="ib" data-act="ob-srm" data-k="${i}" aria-label="${esc(L('Remove step'))}">${icon('close', 'ic-sm')}</button></div>`).join('')}
      <button class="ob-add sm" data-act="ob-sadd">${icon('plus', 'ic-sm')}${L('Add a step')}</button></div><p class="t-small t-mute">${L('Every run gets its own copy of these steps to tick off.')}</p></section>
    ${projs.length ? `<section class="obf-sec"><h3>${L('Does it serve a project?')} <small>${L('Optional')}</small></h3><select class="input obf-sel" id="ob-proj"><option value="">${L('No, it stands on its own')}</option>${projs.map(p => `<option value="${p.id}" ${x.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><p class="t-small t-mute">${L('Most routines stand on their own. Link one only when it serves a project, like weekly posts for a campaign.')}</p></section>` : ''}
    <div class="obf-foot"><button class="btn btn-pri" data-act="ob-save">${id ? L('Save for future runs') : x.personal ? L('Make it repeat') : L('Create routine')}</button><button class="btn btn-ghost" data-act="ob-cancel">${L('Cancel')}</button></div></div>
    <aside class="ob-prev" id="ob-prev">${obPreview(x)}</aside></div></div>`;
  return {crumb: `${crumb0}<i>/</i><b>${id ? esc(r0.name) : x.personal ? L('New repeating task') : L('New routine')}</b>`, content}; }
MENUS.obpick = () => { const x = ui.rtDraft; if (!x) return ''; const pool = db.people.filter(p => p.status === 'active' && p.div === x.unit && !x.owners.includes(p.id)).sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  return pool.map(p => `<div class="mi" data-act="ob-add" data-id="${p.id}" tabindex="0" role="menuitem"><span class="mi-l">${av(p.id, 'av-xs')}${esc(p.name)}</span><small>${esc(roleLabel(p))}</small></div>`).join('') || `<div class="empty-inline">${L('Everyone in the division is already in.')}</div>`; };
PAGES.operations = r => r.id === 'new' ? opsBuilder(null, r.sub) : r.id && r.sub === 'edit' ? opsBuilder(r.id) : r.id ? opsDetail(r.id) : opsBoard();
const obSet = fn => { const x = ui.rtDraft; if (!x) return; fn(x); render(); };
Object.assign(ACT, {
  oscope: el => { ui.oscope = session.oscope = el.dataset.k; saveSession(); render(); },
  'op-done': (el, id, e) => { if (e) e.stopPropagation(); const t = taskOf(id); if (t) setStatus(t, 'done'); },
  'op-move-save': (el, id) => { const t = taskOf(id), v = ($('#op-mv') || {}).value; if (!t || !v) return; const r = rtOf(t.routine); if (!r || !canEditRt(r)) return; const prev = {moved: t.moved, due: t.due};
    t.moved = v; t.due = addDays(v, +r.dueOffset || 0); ui.form = null; logChange(r.unit || ws(), 'moved a run of', {type: 'task', id: t.id, name: r.name}); save(); render(); toast(L('Moved to {d}. The other runs are unchanged.', {d: dShort(v)}), () => { Object.assign(t, prev); rerender(); }); },
  'rt-unskip': (el, id) => { const r = rtOf(id), d = el.dataset.occ; if (!r || !canEditRt(r)) return; r.skips = (r.skips || []).filter(x => x !== d); ensureRoutines(); save(); render(); toast(L('Restored {d}', {d: dShort(d)}), () => { r.skips = [...(r.skips || []), d]; db.tasks = db.tasks.filter(t => !(t.routine === r.id && t.occ === d && t.status === 'todo')); rerender(); }); },
  'ob-cad': el => obSet(x => { x.cadence = el.dataset.k; x.every = x.cadence === 'weekly' ? 7 : x.cadence === '2w' ? 14 : x.cadence === 'monthly' ? 30 : (x.every && x.every < 7 ? x.every : 3); }),
  'ob-day': el => obSet(x => { const want = +el.dataset.k, base = x.start && x.start > today() ? x.start : addDays(today(), 1); x.start = addDays(weekStart(base), want - 1); if (x.start < addDays(today(), 1)) x.start = addDays(x.start, 7); }),
  'ob-due': el => obSet(x => { x.dueOffset = +el.dataset.k; }),
  'ob-rot': el => obSet(x => { x.rotate = el.dataset.k === '1'; if (!x.rotate) x.owners = x.owners.slice(0, 1); }),
  'ob-add': (el, id) => { ui.menu = null; renderLayer(); obSet(x => { if (x.rotate) x.owners.push(id); else x.owners = [id]; }); },
  'ob-rm': el => obSet(x => { x.owners.splice(+el.dataset.k, 1); }),
  'ob-mv': el => obSet(x => { const i = +el.dataset.k; [x.owners[i - 1], x.owners[i]] = [x.owners[i], x.owners[i - 1]]; }),
  'ob-sadd': () => { obSet(x => { x.checklist.push(''); }); setTimeout(() => { const s = document.querySelectorAll('.ob-step input'); if (s.length) s[s.length - 1].focus(); }, 0); },
  'ob-srm': el => obSet(x => { x.checklist.splice(+el.dataset.k, 1); }),
  'ob-cancel': () => { const x = ui.rtDraft; ui.rtDraft = null; go(x && x.id ? `operations/${x.id}` : 'operations'); },
  'ob-save': () => { const x = ui.rtDraft; if (!x) return; const name = x.name.trim(), m = me();
    if (!name) return invalid('#ob-name', L('Give it a name.')); if (!x.start) return invalid('#ob-start', L('Choose the first run.')); if (!x.id && x.start < today()) return invalid('#ob-start', L('The first run can’t be in the past.'));
    const owners = x.personal ? [session.me] : x.owners; if (!owners.length) return toast(L('Choose at least one person.'));
    const vals = {name, icon: x.icon || null, cadence: x.cadence, every: stepDays(x), start: x.start, dueOffset: +x.dueOffset || 0, owners: owners.slice(), rotate: owners.length > 1 && !!x.rotate, checklist: (x.checklist || []).map(s => s.trim()).filter(Boolean), project: x.personal ? null : (($('#ob-proj') || {}).value || null), signoff: !x.personal && x.signoff !== false, signer: x.personal ? null : x.signer || null};
    const snapT = db.tasks.slice();
    if (!x.id) { if (!x.personal && !canCreateProject(m, x.unit)) return toast(L('Co-directors and above set up routines for a division.'));
      const r = {id: uid('rt'), unit: x.personal ? null : x.unit, personal: !!x.personal, paused: false, skips: [], createdBy: session.me, at: nowStamp(), from: x.start, time: null, ...vals};
      db.routines.push(r); ensureRoutines(); if (!r.personal) logChange(r.unit, 'created routine', {type: 'task', id: r.id, name: r.name}); ui.rtDraft = null; save(); go(`operations/${r.id}`);
      return toast(r.personal ? L('It repeats now') : L('Routine created'), () => { db.routines = db.routines.filter(v => v !== r); db.tasks = snapT; go('operations'); rerender(); }); }
    const r0 = rtOf(x.id); if (!r0 || !canEditRt(r0)) return; const prev = JSON.parse(JSON.stringify(r0)); pruneFuture(r0);
    Object.assign(r0, vals, {from: today() >= vals.start ? addDays(today(), 1) : vals.start}); rtIconSync(r0); ensureRoutines(); if (!r0.personal) logChange(r0.unit, 'edited routine', {type: 'task', id: r0.id, name: r0.name}); ui.rtDraft = null; save(); go(`operations/${r0.id}`);
    toast(L('Saved. Only future runs changed.'), () => { Object.keys(r0).forEach(k => delete r0[k]); Object.assign(r0, prev); db.tasks = snapT; rerender(); }); },
});
ON_INPUT['ob-name'] = el => { if (ui.rtDraft) { ui.rtDraft.name = el.value; obRefresh(); const f = el.closest('.field'); if (f) f.classList.remove('invalid'); } };
ON_INPUT['ob-every'] = el => { if (ui.rtDraft) { ui.rtDraft.every = Math.max(1, Math.min(60, +el.value || 1)); obRefresh(); } };
ON_CHANGE['ob-start'] = el => { if (ui.rtDraft && el.value) { ui.rtDraft.start = el.value; render(); } };
ON_CHANGE['ob-proj'] = el => { if (ui.rtDraft) ui.rtDraft.project = el.value || null; };
ON_INPUT['ob-step'] = el => { if (ui.rtDraft) ui.rtDraft.checklist[+el.dataset.k] = el.value; };
// Enter in a step adds the next one below it; Backspace in an empty step removes it.
ON_KEY.push((e) => { const s = e.target.closest && e.target.closest('.ob-step input'); if (!s || !ui.rtDraft) return false; const i = +s.dataset.k, x = ui.rtDraft;
  if (e.key === 'Enter') { e.preventDefault(); x.checklist.splice(i + 1, 0, ''); render(); setTimeout(() => { const n = document.querySelectorAll('.ob-step input')[i + 1]; if (n) n.focus(); }, 0); return true; }
  if (e.key === 'Backspace' && !s.value && x.checklist.length) { e.preventDefault(); x.checklist.splice(i, 1); render(); setTimeout(() => { const n = document.querySelectorAll('.ob-step input')[Math.max(0, i - 1)]; if (n) n.focus(); }, 0); return true; }
  return false; });
// A new icon on a routine also shows on its runs nobody has finished.
function rtIconSync(r) { db.tasks.forEach(t => { if (t.routine === r.id && !isDone(t)) t.icon = r.icon ? {...r.icon} : null; }); }


// ---------- round 14 (owner, 6 Oct) ----------

// Sign-off (owner question, proposed D35). When someone else is accountable for a piece of work, they check it before it counts
// as done, so nobody can approve their own delegated work. Needed for: a task someone else gave you (accepted offer or
// assignment), every run of a division routine (unless its leader turns sign-off off), and any task a leader marks as needing it.
// Not needed for your own tasks and personal repeats. Nobody signs off their own work: if the default signer is the doer, the
// next leader up signs instead. The doer's "done" becomes "In review" with the signer as reviewer; the signer approves (recorded
// with name and time) or returns it with a reason. Members cannot skip or move a run; they ask, and a leader decides.
const unitLeads = u => db.people.filter(p => p.status === 'active' && p.div === u && rank(p) >= 2).sort((a, b) => rank(b) - rank(a)).map(p => p.id);
function signerFor(t) { if (!t || t.signoffMode === 'off') return null; const r = t.routine && rtOf(t.routine), p = projOf(t.project); let c;
  if (r) { if (r.personal || r.signoff === false) return null; c = [t.signer, r.signer, r.createdBy, ...unitLeads(r.unit)]; }
  else if (t.signoffMode === 'on' || (t.createdBy && t.createdBy !== t.owner)) c = [t.signer, t.createdBy !== t.owner ? t.createdBy : null, p && p.pm, p && p.lead, ...unitLeads(taskDiv(t))];
  else return null;
  const busy = joinedOf(t); return c.find(id => id && id !== t.owner && !busy.includes(id) && person(id) && person(id).status === 'active') || null; }
const canManageSignoff = t => { const m = me(), p = projOf(t.project), o = person(t.owner), r = t.routine && rtOf(t.routine); if (!m || m.id === t.owner) return false; if (r) return !r.personal && canEditRt(r);
  return t.createdBy === m.id || (!!p && [p.lead, p.pm].includes(m.id)) || (rank(m) >= 2 && visibleDivs(m).includes(taskDiv(t)) && (!o || rank(m) > rank(o))); };
const canSignOff = t => { const m = me(); return !!m && m.id !== t.owner && (m.id === signerFor(t) || m.id === t.reviewer || canManageSignoff(t)); };
const setStatus0 = setStatus;
setStatus = function (t, s, opt = {}) { const m = me(), sg = signerFor(t);
  if (s === 'done' && sg && !canSignOff(t)) {
    if (!canEditTask(t)) return setStatus0(t, s, opt);
    if (t.status === 'review') return toast(L('Waiting for {who} to sign off.', {who: first(t.reviewer || sg)}));
    const prev = {status: t.status, reviewer: t.reviewer, doneBy: t.doneBy, finishedAt: t.finishedAt};
    t.reviewer = sg; t.doneBy = m.id; t.finishedAt = nowStamp(); setStatus0(t, 'review', {silent: true});
    return toast(L('Sent to {who} to sign off', {who: first(sg)}), () => { Object.assign(t, prev); db.updates = db.updates.filter(u => !(u.type === 'review' && u.ref.id === t.id && u.to === sg && !u.read)); rerender(); }); }
  if (s === 'done' && sg && canSignOff(t)) { const prev = {status: t.status, doneAt: t.doneAt, reviewer: t.reviewer, signedBy: t.signedBy, signedAt: t.signedAt, doneBy: t.doneBy};
    t.reviewer = m.id; t.signedBy = m.id; t.signedAt = nowStamp(); t.doneBy = t.doneBy || t.owner; setStatus0(t, 'done', {silent: true});
    if (!opt.silent) toast(L('Signed off'), () => { Object.assign(t, prev); rerender(); }); return; }
  if (s !== 'done' && isDone(t) && t.signedBy) { t.signedBy = null; t.signedAt = null; }
  return setStatus0(t, s, opt); };
function signoffField(t) { const sg = signerFor(t), man = canManageSignoff(t), r = t.routine && rtOf(t.routine), p = projOf(t.project);
  const done = isDone(t) && t.signedBy ? `<p class="so-done">${icon('check', 'ic-xs')}${L('Signed off by {who}, {d}', {who: esc(pname(t.signedBy)), d: dShort(t.signedAt.slice(0, 10))})}</p>` : '';
  if (!man) return sg && !isDone(t) ? `<div class="field so"><label>${L('Sign-off')}</label><p class="so-line">${av(sg, 'av-xs')}<span>${t.owner === session.me ? L('{who} checks it before it counts as done.', {who: `<b>${esc(pname(sg))}</b>`}) : L('{who} signs off.', {who: `<b>${esc(pname(sg))}</b>`})}</span></p></div>` : done ? `<div class="field so"><label>${L('Sign-off')}</label>${done}</div>` : '';
  const pool = [...new Set([sg, t.createdBy, p && p.lead, p && p.pm, ...unitLeads(taskDiv(t)), session.me])].filter(id => id && id !== t.owner && person(id));
  return `<div class="field so"><label>${L('Sign-off')}</label>${r ? '' : `<div class="seg">${[['on', 'Needed'], ['off', 'Not needed']].map(([k, l]) => `<button class="${(sg ? 'on' : 'off') === k ? 'on' : ''}" data-act="so-mode" data-id="${t.id}" data-k="${k}">${L(l)}</button>`).join('')}</div>`}
    ${sg ? `<select class="input so-who" id="f-signer" data-id="${t.id}" aria-label="${esc(L('Who signs off'))}">${pool.map(id => `<option value="${id}" ${id === sg ? 'selected' : ''}>${esc(pname(id))}</option>`).join('')}</select>` : ''}
    <span class="help">${sg ? L('When {who} finishes, it waits for this sign-off before it counts as done.', {who: esc(first(t.owner))}) : L('It counts as done as soon as {who} ticks it.', {who: esc(first(t.owner))})}</span>${done}</div>`; }
Object.assign(ACT, {
  'so-mode': (el, id) => { const t = taskOf(id); if (!t || !canManageSignoff(t)) return; const prev = t.signoffMode; t.signoffMode = el.dataset.k; save(); render(); toast(el.dataset.k === 'on' ? L('Sign-off needed') : L('No sign-off needed'), () => { t.signoffMode = prev; rerender(); }); },
});
ON_CHANGE['f-signer'] = el => { const t = taskOf(el.dataset.id); if (!t || !canManageSignoff(t)) return; t.signer = el.value; if (t.status === 'review') { t.reviewer = el.value; notify(el.value, 'review', {type: 'task', id: t.id}); } save(); render(); };

// Members ask to skip or move their run; the leader decides (recorded with name and time).
const openAsks = r => (r.asks || []).filter(a => a.state === 'open');
const askText = a => a.kind === 'skip' ? L('{who} asks to skip {d}', {who: esc(first(a.by)), d: esc(dLong(a.occ))}) : L('{who} asks to move {d} to {to}', {who: esc(first(a.by)), d: esc(dLong(a.occ)), to: esc(dLong(a.to))});
function rtAskBox(t, r) { if (r.personal || canEditRt(r) || isDone(t) || t.owner !== session.me) return ''; const a = openAsks(r).find(x => x.occ === t.occ), lead = signerFor(t) || unitLeads(r.unit)[0];
  if (a) return `<p class="rt-ask-on">${icon('clock', 'ic-xs')}<span>${a.kind === 'skip' ? L('You asked to skip this run.') : L('You asked to move this run to {d}.', {d: esc(dShort(a.to))})} ${L('Waiting for {who}.', {who: esc(first(lead))})} <a data-act="rt-ask-undo" data-id="${r.id}" data-k="${a.id}">${L('Withdraw')}</a></span></p>`;
  if (ui.form !== 'rt-ask') return `<p class="t-small"><a data-act="form" data-f="rt-ask">${L('Can’t make it? Ask to skip or move this run')}</a></p>`;
  const k = ui.askKind || 'skip';
  return `<div class="rt-askf"><div class="seg">${[['skip', 'Skip it'], ['move', 'Move it']].map(([v, l]) => `<button class="${k === v ? 'on' : ''}" data-act="rt-ask-k" data-k="${v}">${L(l)}</button>`).join('')}</div>
    ${k === 'move' ? `<div class="field"><label for="ask-to">${L('Move to')}</label><input class="input" type="date" id="ask-to" value="${addDays(runDate(t), 1)}"></div>` : ''}
    <div class="field"><label for="ask-why">${L('Why?')} <span class="req">*</span></label><input class="input" id="ask-why" placeholder="${esc(L('For example: midterm exams that week'))}"><span class="help"></span></div>
    <div class="acts"><button class="btn btn-pri btn-sm" data-act="rt-ask-send" data-id="${t.id}">${L('Send to {who}', {who: esc(first(lead))})}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`; }
function rtAskDecide(id, askId, yes) { const r = rtOf(id), a = r && (r.asks || []).find(x => x.id === askId); if (!a || a.state !== 'open' || !canEditRt(r)) return;
  const t = taskOf(a.task), snapT = db.tasks.slice(), prevT = t ? {moved: t.moved, due: t.due} : null, prevSk = (r.skips || []).slice();
  a.state = yes ? 'approved' : 'declined'; a.decidedBy = session.me; a.decidedAt = nowStamp();
  if (yes && a.kind === 'skip') { r.skips = [...(r.skips || []), a.occ]; if (t && !isDone(t)) db.tasks = db.tasks.filter(x => x !== t); }
  if (yes && a.kind === 'move' && t) { t.moved = a.to; t.due = addDays(a.to, +r.dueOffset || 0); }
  notify(a.by, yes ? 'run-ask-ok' : 'run-ask-no', {type: 'task', id: a.task}); logChange(r.unit, yes ? (a.kind === 'skip' ? 'approved skipping a run of' : 'approved moving a run of') : 'declined a request about', {type: 'task', id: a.task, name: r.name});
  save(); render(); toast(yes ? L('Approved') : L('Declined'), () => { a.state = 'open'; a.decidedBy = null; a.decidedAt = null; r.skips = prevSk; db.tasks = snapT; if (t && prevT) Object.assign(t, prevT); rerender(); }); }
const asksCard = (r, can) => { const as = openAsks(r); return as.length ? `<div class="op-asks"><h3>${L('Requests')}<span class="n">${as.length}</span></h3>${as.map(a => `<div class="op-ask">${av(a.by, 'av-sm')}<div class="op-ask-t"><b>${askText(a)}</b><small>${esc(a.reason)}</small></div>${can ? `<span class="op-ask-b"><button class="btn btn-sm btn-ghost" data-act="rt-ask-no" data-id="${r.id}" data-k="${a.id}">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="rt-ask-ok" data-id="${r.id}" data-k="${a.id}">${L('Approve')}</button></span>` : ''}</div>`).join('')}</div>` : ''; };
Object.assign(ACT, {
  'rt-ask-k': el => { ui.askKind = el.dataset.k; render(); },
  'rt-ask-send': (el, id) => { const t = taskOf(id), r = t && rtOf(t.routine); if (!r || t.owner !== session.me) return; const why = (($('#ask-why') || {}).value || '').trim(), k = ui.askKind || 'skip', to = ($('#ask-to') || {}).value;
    if (!why) return invalid('#ask-why', L('Say why, so your leader can decide.')); if (k === 'move' && !to) return;
    const a = {id: uid('ask'), occ: t.occ, task: t.id, kind: k, to: k === 'move' ? to : null, by: session.me, reason: why, at: nowStamp(), state: 'open'}, lead = signerFor(t) || unitLeads(r.unit)[0];
    r.asks = [...(r.asks || []), a]; notify(lead, 'run-ask', {type: 'task', id: t.id}); ui.form = null; ui.askKind = null; save(); render();
    toast(L('Sent to {who}', {who: first(lead)}), () => { r.asks = r.asks.filter(x => x !== a); db.updates = db.updates.filter(u => !(u.type === 'run-ask' && u.ref.id === t.id)); rerender(); }); },
  'rt-ask-undo': (el, id) => { const r = rtOf(id), a = r && (r.asks || []).find(x => x.id === el.dataset.k); if (!a || a.by !== session.me || a.state !== 'open') return; a.state = 'withdrawn'; save(); render(); toast(L('Request withdrawn'), () => { a.state = 'open'; rerender(); }); },
  'rt-ask-ok': (el, id) => rtAskDecide(id, el.dataset.k, true),
  'rt-ask-no': (el, id) => rtAskDecide(id, el.dataset.k, false),
  'ob-so': el => obSet(x => { x.signoff = el.dataset.k === '1'; }),
});
ON_CHANGE['ob-signer'] = el => { if (ui.rtDraft) { ui.rtDraft.signer = el.value; obRefresh(); } };
function opDoneBtn(t) { const sg = signerFor(t);
  if (t.status === 'review') return canSignOff(t) ? `<button class="btn btn-pri" data-act="op-done" data-id="${t.id}">${icon('check')}${L('Sign off')}</button><button class="btn" data-act="open-task" data-id="${t.id}">${L('Ask for changes')}</button>` : `<span class="op-wait">${icon('clock', 'ic-xs')}${L('Waiting for {who} to sign off.', {who: esc(first(t.reviewer || sg))})}</span>`;
  if (!canEditTask(t) && !canSignOff(t)) return '';
  return `<button class="btn btn-pri" data-act="op-done" data-id="${t.id}">${icon('check')}${sg && !canSignOff(t) ? L('Done, send to {who}', {who: esc(first(sg))}) : L('Mark done')}</button>`; }

// ---------- batch roadmap v2 (owner: easier to collapse and hide, no black box, clear place to add items) ----------
// Three states per person: a one-line strip (default), open with labels, or hidden. Hidden comes back from the Roadmap button
// at the top of My Work. Items are added by the President and VPs from the open strip, or from any milestone's panel.
const rmMode = () => { const s = session.rmMode || {}; return s[session.me] || ((session.rmOpen || {})[session.me] ? 'open' : 'line'); };
const rmShowBtn = () => rmMode() === 'hidden' && (db.milestones.some(m => m.roadmap) || canRoadmap()) ? `<button class="btn btn-ghost btn-sm rm-show" data-act="rm-mode" data-k="line">${icon('flag', 'ic-sm')}${L('Roadmap')}</button>` : '';
function roadmapStrip() { const items = db.milestones.filter(m => m.roadmap).sort((a, b) => (a.target || '9').localeCompare(b.target || '9')); if (!items.length && !canRoadmap()) return '';
  const mode = rmMode(); if (mode === 'hidden') return '';
  const nx = items.find(m => m.state !== 'achieved' && m.target >= today()), lo = '2026-08-01', hi = '2027-07-31', span0 = daysBetween(lo, hi), pc = d => Math.max(0, Math.min(100, daysBetween(lo, d) / span0 * 100));
  const rel = nx ? (daysBetween(today(), nx.target) > 0 ? plural(daysBetween(today(), nx.target), 'in {n} day', 'in {n} days') : L('today')) : '';
  const next = nx ? `<span class="rm2-next"><small>${L('Next')}</small><b>${esc(nx.title)}</b><span class="t-num">${dShort(nx.target)}</span><em>${rel}</em></span>` : '';
  const title = `<span class="rm2-t">${icon('flag')}<b>${L('Batch 2026')}</b></span>`, hide = `<button class="ib rm2-x" data-act="rm-mode" data-k="hidden" aria-label="${esc(L('Hide the roadmap'))}">${icon('close', 'ic-sm')}</button>`;
  if (mode === 'line') return `<section class="rm2 line" aria-label="${esc(L('Batch 2026 roadmap'))}"><button class="rm2-hit" data-act="rm-mode" data-k="open" aria-expanded="false" aria-label="${esc(L('Open the batch roadmap'))}">${title}<span class="rm2-mini" aria-hidden="true"><i class="ln"></i><i class="dn" style="width:${pc(today())}%"></i>${items.map(m => `<i class="dot ${m.state === 'achieved' ? 'ok' : msLate(m) ? 'late' : ''}" style="left:${pc(m.target)}%"></i>`).join('')}<i class="now" style="left:${pc(today())}%"></i></span>${next}<span class="rm2-open">${icon('chevron-down', 'ic-sm')}</span></button>${hide}</section>`;
  const months = []; for (let d = D(lo); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  return `<section class="rm2 open" aria-label="${esc(L('Batch 2026 roadmap'))}"><div class="rm2-hd">${title}<span class="rm2-sub">${L('August 2026 to July 2027')}</span><span class="grow"></span>${next}<button class="ib" data-act="rm-mode" data-k="line" aria-label="${esc(L('Collapse'))}" aria-expanded="true">${icon('chevron-down', 'ic-sm flip')}</button>${hide}</div>
    <div class="rm-track">${months.map(d => `<span class="rm-m" style="left:${pc(d)}%">${MON()[D(d).getMonth()]}${D(d).getMonth() === 0 ? ` <small>${D(d).getFullYear()}</small>` : ''}</span>`).join('')}<i class="rm-line"></i><i class="rm-done" style="width:${pc(today())}%"></i><i class="rm-now" style="left:${pc(today())}%"><b>${L('Today')}</b></i>
    ${rmLanes(items, pc).map(([m, lane]) => `<button class="rm-i ${m.state === 'achieved' ? 'ok' : msLate(m) ? 'late' : ''} ${lane}" style="left:${pc(m.target)}%" data-act="open-ms" data-id="${m.id}" aria-label="${esc(`${m.title}, ${dLong(m.target)}`)}"><i class="rm-dia"></i><span><b>${esc(m.title)}</b><small class="t-num">${dShort(m.target)}</small></span></button>`).join('')}</div>
    <div class="rm2-f">${canRoadmap() ? `<button class="btn btn-sm" data-act="rm-add">${icon('plus', 'ic-sm')}${L('Add a roadmap item')}</button><span>${L('Or open any milestone and turn on Show on the batch roadmap.')}</span>` : `<span>${L('Set by the President and VPs. Click an item to see its milestone.')}</span>`}</div></section>`; }
const rmToggle = ms => canRoadmap() ? `<label class="chkrow rm-tog"><input type="checkbox" data-act="ms-rm" data-id="${ms.id}" ${ms.roadmap ? 'checked' : ''}><span><b>${L('Show on the batch roadmap')}</b><small>${L('Everyone sees it at the top of My Work. Only the President and VPs can change roadmap items.')}</small></span></label>`
  : ms.roadmap ? `<p class="t-small t-mute rm-on">${icon('flag', 'ic-xs')}${L('On the batch roadmap, set by the President and VPs')}</p>` : '';
Object.assign(ACT, {
  'rm-mode': (el, id, e) => { if (e) e.stopPropagation(); const k = el.dataset.k, was = rmMode(); session.rmMode = session.rmMode || {}; session.rmMode[session.me] = k; saveSession(); render();
    if (k === 'hidden') toast(L('Roadmap hidden. Bring it back with Roadmap at the top of My Work.'), () => { session.rmMode[session.me] = was; saveSession(); render(); }); },
  'ms-rm': (el, id) => { const m = db.milestones.find(v => v.id === id); if (!m || !canRoadmap()) return; const was = !!m.roadmap; m.roadmap = !was; save(); render(); toast(m.roadmap ? L('Shown on the batch roadmap') : L('Removed from the batch roadmap'), () => { m.roadmap = was; rerender(); }); },
});

// ---------- My Work list v2 (owner: too much room, too far apart) ----------
// One dense list in date groups with a right rail for today's meetings and everything waiting for you. Rows are one line:
// tick, title (reactions and state inline), where it belongs, who else, due. A routine shows only its next run (+n later).
const mwCol = () => (session.mwCol = session.mwCol || {done: 1});
const mwPeople = t => { const ids = [...new Set([t.owner, ...joinedOf(t)])].filter(i => i && i !== session.me); return ids.length ? bubbles(ids, 'av-xs') : ''; };
function mwCtx(t) { const r = t.routine && rtOf(t.routine); if (r) return `<span class="mw-ctx">${icon('routine')}<span>${esc(cadShort(r))}</span></span>`; const pr = projOf(t.project), d = div(taskDiv(t)); if (!d) return '<span></span>'; return `<span class="mw-ctx">${bicon(d.icon, false)}<span>${esc(pr ? pr.name : d.short)}</span></span>`; }
const mwRx = t => { const r = Object.entries(t.reactions || {}).filter(([, v]) => v.length); return r.length ? `<span class="mw-rx">${r.slice(0, 3).map(([e, v]) => `<i>${e}${v.length > 1 ? `<b>${v.length}</b>` : ''}</i>`).join('')}</span>` : ''; };
function mwRow(t, more) { const d = dueLabel(t), sel = ui.insp && ui.insp.type === 'task' && ui.insp.id === t.id, can = canEditTask(t);
  return `<div class="mw-r ${isDone(t) ? 'done' : ''} ${sel ? 'sel' : ''}" data-act="open-task" data-id="${t.id}" tabindex="0"><button class="tick" data-act="toggle" data-id="${t.id}" aria-label="${esc(isDone(t) ? L('Mark not done') : L('Mark done'))}" ${can ? '' : 'disabled'}><span class="cb ${isDone(t) ? 'on' : ''} ${t.status === 'review' ? 'rev' : ''}"></span></button>
    <span class="mw-t"><span class="mw-tt">${taskTitle(t)}</span>${mwRx(t)}${tState(t)}</span>${mwCtx(t)}<span class="mw-more">${more ? `+${more}` : ''}</span><span class="mw-p">${mwPeople(t)}</span><span class="due ${d.cls}">${d.txt}</span></div>`; }
function mwList(c) { const {m, td} = c, col = mwCol(), byDue = (a, b) => (a.due || '9').localeCompare(b.due || '9') || (a.time ?? 1e4) - (b.time ?? 1e4);
  const open = c.mine.filter(t => !isDone(t)).sort(byDue), seen = {}, more = {}, rows = [];
  open.forEach(t => { if (t.routine) { const f = seen[t.routine]; if (f) { more[f.id] = (more[f.id] || 0) + 1; return; } seen[t.routine] = t; } rows.push(t); });
  const we = addDays(weekStart(td), 6), done = c.mine.filter(isDone).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  const G = [['overdue', 'Overdue', rows.filter(t => t.due && t.due < td)], ['today', 'Today', rows.filter(t => t.due === td)], ['week', 'Later this week', rows.filter(t => t.due > td && t.due <= we)], ['later', 'Later', rows.filter(t => t.due > we)], ['nodate', 'No date', rows.filter(t => !t.due)]];
  const grp = (k, l, ts, n) => `<div class="mw-g ${k}"><button class="mw-gh" data-act="mw-col" data-k="${k}" aria-expanded="${!col[k]}">${icon(col[k] ? 'chevron' : 'chevron-down', 'ic-xs')}<b>${L(l)}</b><span class="n">${n ?? ts.length}</span></button>${col[k] ? '' : ts.map(t => mwRow(t, more[t.id])).join('')}</div>`;
  const list = G.filter(([k, , ts]) => ts.length || k === 'today').map(([k, l, ts]) => ts.length ? grp(k, l, ts) : `<div class="mw-g today"><div class="mw-gh"><b>${L('Today')}</b><span class="n">0</span></div><p class="mw-none">${L('Nothing due today.')}</p></div>`).join('') + (done.length ? grp('done', 'Completed', done.slice(0, 20), done.length) : '');
  const ask = (act, id, who, title, sub, btns = '', h = '') => `<div class="mw-ask" data-act="${act}" data-id="${id}" ${h ? `data-h="${h}"` : ''} tabindex="0">${av(who, 'av-sm')}<span class="mw-ask-t"><b>${esc(title)}</b><small>${sub}</small></span>${btns ? `<span class="mw-ask-b">${btns}</span>` : ''}</div>`;
  const runAsks = db.routines.filter(r => !r.personal && canEditRt(r)).flatMap(r => openAsks(r).filter(a => a.by !== m.id).map(a => [r, a]));
  const resp = [...c.asg.map(x => { const a = x.assignees.find(v => v.id === m.id && v.state === 'invited'); return ask('open-task', x.id, a.by, x.title, L('{who} asks you to share this task', {who: esc(first(a.by))}), `<button class="btn btn-sm btn-ghost" data-act="tassign" data-id="${x.id}" data-r="no">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="tassign" data-id="${x.id}" data-r="yes">${L('Accept')}</button>`); }),
    ...c.offs.map(o => ask('open-offer', o.id, o.from, o.title, L('{who} asks if you can take this', {who: esc(first(o.from))}))),
    ...c.revs.map(t => ask('open-task', t.id, t.owner, t.title, signerFor(t) ? L('{who} finished this. Sign it off?', {who: esc(first(t.owner))}) : L('{who} sent this for your review', {who: esc(first(t.owner))}))),
    ...runAsks.map(([r, a]) => ask('go', '', a.by, r.name, askText(a), '', `operations/${r.id}`)),
    ...c.inv.map(x => ask('open-meeting', x.id, x.organizer, x.title, `${esc(dLong(x.date))}, ${mins(x.start)}`, `<button class="btn btn-sm btn-ghost" data-act="rsvp" data-id="${x.id}" data-r="declined">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="rsvp" data-id="${x.id}" data-r="accepted">${L('Accept')}</button>`))];
  const rail = `<aside class="mw-rail"><section><h3>${L('Needs your response')}<span class="n">${resp.length}</span></h3>${resp.slice(0, ui.mwAll ? 99 : 3).join('')}${resp.length > 3 ? `<button class="mw-all" data-act="mw-all">${ui.mwAll ? L('Show fewer') : L('Show all {n}', {n: resp.length})}</button>` : ''}${resp.length ? '' : `<p class="mw-none">${L('Nothing waiting for you.')}</p>`}</section>
    <section><h3>${L('Meetings today')}<span class="n">${c.mtToday.length}</span></h3>${c.mtToday.map(mt => `<div class="mw-mt" data-act="open-meeting" data-id="${mt.id}" tabindex="0"><span class="t-num">${mins(mt.start)}</span><b>${esc(mt.title)}</b>${bubbles(Object.keys(mt.responses).filter(i => i !== m.id), 'av-xs')}</div>`).join('') || `<p class="mw-none">${L('No meetings today.')}</p>`}</section></aside>`;
  return `<div class="mw2"><div class="mw-list">${list}</div>${rail}</div>`; }
ACT['mw-all'] = () => { ui.mwAll = !ui.mwAll; render(); };
ACT['mw-col'] = el => { const c = mwCol(); c[el.dataset.k] = !c[el.dataset.k]; saveSession(); render(); };
// Operations grouped by program (D47): a header row per program, then the routines not in a program.
function opsByProgram(rs, w) { const gs = (db.programs || []).filter(g => rs.some(r => r.program === g.id)), out = [];
  const hd = g => `<h3 class="ob-grp ob-pg"><a href="#/programs/${g.id}">${svgD(PG_D)}${esc(g.name)}</a><small>${esc(first(g.owner))}, ${esc(pgPeriod(g))}</small></h3>`;
  gs.forEach(g => rs.filter(r => r.program === g.id).forEach((r, i) => out.push(Object.assign(Object.create(r), {_pgh: i === 0 ? hd(g) : ''}))));
  rs.filter(r => !r.program || !gs.some(g => g.id === r.program)).forEach((r, i) => out.push(Object.assign(Object.create(r), {_pgh: i === 0 && gs.length ? `<h3 class="ob-grp ob-pg plain">${L('Not in a program')}</h3>` : ''})));
  return out; }
