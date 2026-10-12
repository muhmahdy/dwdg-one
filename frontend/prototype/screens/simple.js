/* Simple look (owner, 10 Oct, D56): the first focus-mode style, for people who want only the essentials.
   Three destinations (My tasks, Projects, Schedule) in a top bar, a bell for updates and a profile menu. Simple task rows,
   big cards, a floating task sheet, four project status groups. A project's simple page links to its full planning
   (Overview, WBS, Work, Resources), which opens in the shared overhaul styling, so the project-management tools stay reachable.
   Everything reuses the store, rules and actions of the sprint screens. Styles: core/simple.css (body[data-look="simple"]). */
'use strict';
const S_ORIG = {work: PAGES.work, projects: PAGES.projects, taskInsp: INSP.task};
const isSimple = () => look() === 'simple';

// Members see four status groups here; the nine stages stay in the data and in the full project page.
const SGROUPS = [['progress', 'In progress', ['active', 'review']], ['planned', 'Planned', ['draft', 'planned']], ['hold', 'On hold', ['hold']], ['done', 'Done', ['completed', 'cancelled', 'archived']]];
const SGROUP_STAGE = {progress: 'active', planned: 'planned', hold: 'hold', done: 'completed'};
const sGroupOf = st => (SGROUPS.find(g => g[2].includes(st)) || SGROUPS[0])[0];
const sGroupLabel = k => L(SGROUPS.find(g => g[0] === k)[1]);
const sStatus = p => { const k = sGroupOf(p.stage); return `<span class="f-st f-st-${k}">${sGroupLabel(k)}</span>`; };
const sByDue = (a, b) => (a.due || '9').localeCompare(b.due || '9') || (a.time ?? 1e4) - (b.time ?? 1e4);
const sCanSee = p => { const m = me(); return visibleDivs(m).includes(p.div) || !!p.org || [p.lead, p.pm].includes(m.id) || (p.team || []).some(x => x.id === m.id && x.state === 'joined'); };
const sCreatableDivs = () => DIVS.map(d => d.id).filter(d => canCreateProject(me(), d));
const sDivName = id => (div(id) || {}).name || L('Organization');
const sPeopleOptions = (sel, blank) => `<option value="">${esc(blank)}</option>${DIVS.map(d => { const ps = db.people.filter(p => p.status === 'active' && p.div === d.id); return ps.length ? `<optgroup label="${esc(d.name)}">${ps.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>` : ''; }).join('')}`;
const sCard = (title, body, k = '', n) => `<section class="f-sec f-sec-${k}"><h2 class="f-sec-h">${title}${n != null ? `<span class="f-n">${n}</span>` : ''}</h2><div class="f-card">${body}</div></section>`;

// ---------- shell ----------
function simpleShell(content) {
  const m = me(), r = route(), c = counts();
  const tabs = [['work', 'tasks', 'My tasks', c.attention], [S_KINDS.some(k => k[0] === ui.sKind) ? ui.sKind : 'projects', 'projects', 'Work'], ['schedule', 'calendar', 'Schedule']];
  const on = h => r.page === h || (S_KINDS.some(k => k[0] === h) && S_KINDS.some(k => k[0] === r.page));
  const tab = ([h, ic, l, n]) => `<a href="#/${h}" class="f-tab ${on(h) ? 'on' : ''}" ${on(h) ? 'aria-current="page"' : ''}>${icon(ic)}<span>${L(l)}</span>${n ? `<em aria-label="${esc(plural(n, '{n} needs you', '{n} need you'))}">${n}</em>` : ''}</a>`;
  return `<div class="f-app">
  <header class="f-top"><a class="f-brand" href="#/work" aria-label="dwdg’ONE, ${esc(L('My tasks'))}">${A.wordmark}</a>
    <nav class="f-tabs" aria-label="${esc(L('Main'))}">${tabs.map(tab).join('')}</nav>
    <div class="f-top-r"><button class="btn btn-pri f-new" data-act="s-menu" data-menu="snew" aria-haspopup="menu">${icon('plus')}<span>${L('New')}</span></button>
    <button class="f-ib" data-act="s-menu" data-menu="sbell" aria-haspopup="menu" aria-label="${esc(c.unread ? plural(c.unread, '{n} new update', '{n} new updates') : L('Updates'))}">${icon('bell')}${c.unread ? `<em>${c.unread}</em>` : ''}</button>
    <button class="f-me" data-act="s-menu" data-menu="sme" aria-haspopup="menu" aria-label="${esc(L('Your profile'))}">${av(m.id)}</button></div></header>
  <main class="f-main" id="main"><div class="f-scroll" id="scroller">${content}</div></main>
  ${ui.insp ? `<div class="f-scrim" data-act="close-insp"></div><aside class="f-sheet insp-sheet" role="dialog" aria-label="${esc(L('Details'))}"><div class="insp">${inspector()}</div></aside>` : ''}
  <nav class="f-dock" aria-label="${esc(L('Main'))}">${tabs.map(tab).join('')}<button class="f-dock-new" data-act="s-menu" data-menu="snew" aria-haspopup="menu" aria-label="${esc(L('New'))}">${icon('plus')}</button></nav></div>`;
}
MENUS.snew = () => mi('new-task', L('Task'), 'tasks', '', '<span class="kbd">N</span>') + mi('composer', L('Meeting'), 'calendar', '', '<span class="kbd">M</span>') + (sCreatableDivs().length ? mi('s-new-project', L('Project'), 'projects') : '');
MENUS.sbell = () => { const all = db.updates.filter(u => u.to === session.me).slice(0, 8);
  const rows = all.map(u => { const t = refTitle(u.ref);
    return `<div class="mi f-upd ${u.read ? '' : 'unread'}" data-act="s-upd" data-id="${u.id}" tabindex="0" role="menuitem">${u.actor ? av(u.actor, 'av-sm') : `<span class="av av-sm">${icon('clock', 'ic-xs')}</span>`}<span class="f-upd-t"><span>${esc(L(UPD[u.type] || '{who} updated something', {who: u.actor ? first(u.actor) : 'dwdg’ONE'}))}</span>${t ? `<b>${esc(t)}</b>` : ''}<small>${ago(u.at)}</small></span></div>`; }).join('');
  return `<div class="mi-h">${L('Updates')}</div>${rows || `<div class="f-empty-s">${L('No updates yet.')}</div>`}<hr>${mi('go', L('See all updates'), 'bell', 'data-h="updates"')}`; };
MENUS.sme = () => `<div class="f-prof">${av(me().id, 'av-lg')}<div><b>${esc(me().name)}</b><small>${esc(roleLabel(me()))}, ${esc(sDivName(me().div))}</small></div></div>${acctMenu()}`;

// ---------- My tasks ----------
const sAddForm = p => `<form class="qa f-add" data-form="add-task" ${p ? `data-project="${p.id}"` : ''} autocomplete="off"><span class="qa-ic">${icon('plus')}</span><input id="qa" name="title" placeholder="${esc(p ? L('Add a task to this project') : L('Add a task'))}" aria-label="${esc(L('Task title'))}" enterkeyhint="done">${qaDue()}<button class="btn btn-pri" type="submit">${L('Add')}</button></form><div class="qa-under" aria-live="polite"></div>`;
function sTaskRow(t, opt = {}) {
  const d = dueLabel(t), pr = projOf(t.project), blocked = !isDone(t) && openBlocker(t.id), edit = canEditTask(t);
  const when = t.due && d.txt !== L('Today') ? `<span class="${d.cls === 'late' && !isDone(t) ? 'f-late' : ''}">${esc(d.txt)}</span>` : '';
  const rt = t.routine ? rtOf(t.routine) : null, meta = [opt.owner ? esc(pname(t.owner)) : (!opt.noProject && rt ? (rt.name === t.title ? L('Operation') : esc(rt.name)) : !opt.noProject && pr ? esc(pr.name) : ''), when].filter(Boolean).join(', ');
  const flag = blocked ? `<b class="f-bad">${L('Blocked')}</b>` : t.status === 'review' && !isDone(t) ? `<b class="f-rev">${L('In review')}</b>` : '';
  return `<div class="f-row ${isDone(t) ? 'done' : ''}" data-act="open-task" data-id="${t.id}" tabindex="0">
    <button class="f-check ${isDone(t) ? 'on' : ''}" data-act="toggle" data-id="${t.id}" aria-label="${esc(isDone(t) ? L('Mark not done') : L('Mark done'))}" ${edit ? '' : 'disabled'}>${icon('check')}</button>
    <div class="f-row-t"><span class="f-title">${esc(t.title)}</span>${flag || meta ? `<span class="f-meta">${!opt.noProject && (t.routine ? rtOf(t.routine) : pr) ? `<span class="f-art-xs">${t.routine ? rtObj(rtOf(t.routine), 'xs') : projObj(pr, 'xs')}</span>` : ''}${flag}${flag && meta ? ', ' : ''}${meta}</span>` : ''}</div></div>`;
}
function sWaiting(m) {
  const row = (who, title, sub, act, id, btns) => `<div class="f-row f-ask" data-act="${act}" data-id="${id}" tabindex="0">${av(who, 'av-md')}<div class="f-row-t"><span class="f-title">${esc(title)}</span><span class="f-meta">${sub}</span></div><div class="f-ask-b">${btns}</div></div>`;
  const yesNo = (act, id, yes, no) => `<button class="btn" data-act="${act}" data-id="${id}" data-r="${no}">${L('Decline')}</button><button class="btn btn-pri" data-act="${act}" data-id="${id}" data-r="${yes}">${L('Accept')}</button>`;
  const items = [
    ...offersFor(m.id).map(o => row(o.from, o.title, L('{who} asks if you can take this', {who: esc(first(o.from))}), 'open-offer', o.id, `<button class="btn" data-act="open-offer" data-id="${o.id}">${L('Review')}</button>`)),
    ...reviewsFor(m.id).map(t => row(t.owner, t.title, L('{who} sent this for your review', {who: esc(first(t.owner))}), 'open-task', t.id, `<button class="btn" data-act="open-task" data-id="${t.id}">${L('Review')}</button>`)),
    ...assignFor(m.id).map(t => { const a = t.assignees.find(v => v.id === m.id && v.state === 'invited'); return row(a.by, t.title, L('{who} asks you to share this task', {who: esc(first(a.by))}), 'open-task', t.id, yesNo('tassign', t.id, 'yes', 'no')); }),
    ...invitesFor(m.id).map(x => row(x.organizer, x.title, L('Meeting on {when}', {when: `${dLong(x.date)}, ${mins(x.start)}`}), 'open-meeting', x.id, yesNo('rsvp', x.id, 'accepted', 'declined'))),
    // invitations to work together (D60) are answered right here, so nobody needs the full project page
    ...cpInvites().map(it => { const by = it.v.by, kind = it.kind, yes = kind === 'partner' ? `data-act="pg-partner-answer" data-id="${it.x.id}" data-d="${it.v.div}"` : `data-act="cp-answer" data-k="${kind}" data-id="${it.x.id}"`;
      return `<div class="f-row f-ask">${av(by, 'av-md')}<div class="f-row-t"><span class="f-title">${esc(it.x.name)}</span><span class="f-meta">${kind === 'partner' ? L('{who} invites {d} to be a partner', {who: esc(first(by)), d: esc(divName(it.v.div))}) : L('{who} invites you to work together, from {d}', {who: esc(first(by)), d: esc(divName(homeDiv(by)))})}</span></div><div class="f-ask-b"><button class="btn" ${yes} data-r="no">${L('Decline')}</button><button class="btn btn-pri" ${yes} data-r="yes">${L('Accept')}</button></div></div>`; })];
  return items.length ? sCard(L('Waiting for you'), items.join(''), 'wait', items.length) : '';
}
function sWork() {
  const m = me(), td = today(), mine = myTasks(), seen = new Set(), rows = [];
  mine.filter(t => !isDone(t)).sort(sByDue).forEach(t => { if (t.routine) { if (seen.has(t.routine)) return; seen.add(t.routine); } rows.push(t); });
  const we = addDays(weekStart(td), 6), done = mine.filter(isDone).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  const G = [['late', 'Overdue', rows.filter(t => t.due && t.due < td)], ['today', 'Today', rows.filter(t => t.due === td)], ['week', 'This week', rows.filter(t => t.due > td && t.due <= we)], ['later', 'Later', rows.filter(t => t.due > we)], ['nodate', 'No date', rows.filter(t => !t.due)]];
  const groups = G.filter(g => g[2].length).map(([k, l, ts]) => sCard(L(l), ts.map(t => sTaskRow(t)).join(''), k, ts.length)).join('');
  const empty = rows.length ? '' : `<div class="f-card f-empty"><b>${L('You’re all caught up')}</b><p>${L('Add a task above when something new comes up.')}</p></div>`;
  const doneBlock = done.length ? `<button class="f-more" data-act="s-done" aria-expanded="${!!ui.sDone}">${ui.sDone ? L('Hide completed tasks') : plural(done.length, 'Show {n} completed task', 'Show {n} completed tasks')}</button>${ui.sDone ? sCard(L('Completed'), done.slice(0, 30).map(t => sTaskRow(t)).join(''), 'done') : ''}` : '';
  return {crumb: '', content: `<div class="f-page f-narrow">
    <header class="f-ph"><div><h1>${L('My tasks')}</h1><p>${WDL()[D(td).getDay()]}, ${D(td).getDate()} ${MONTH()[D(td).getMonth()]}</p></div></header>
    ${sAddForm()}${sWaiting(m)}${groups}${empty}${doneBlock}</div>`};
}

// ---------- task sheet ----------
function sTaskSheet(x) {
  const t = taskOf(x.id), m = me(); if (!t) return inspHead(L('Task'));
  const edit = canEditTask(t), b = openBlocker(t.id), pr = projOf(t.project);
  const order = TASK_ORDER.filter(s => s !== 'review' || t.status === 'review' || t.reviewer);
  const status = `<div class="f-segs" role="radiogroup" aria-label="${esc(L('Status'))}">${order.map(s => `<button class="${t.status === s ? 'on' : ''}" ${edit ? `data-act="set-status" data-id="${t.id}" data-s="${s}"` : 'disabled'} role="radio" aria-checked="${t.status === s}">${L(TASK_ST[s][0])}</button>`).join('')}</div>`;
  const review = hiBox(t) || (t.status === 'review' && t.reviewer === m.id && t.owner !== m.id ? `<div class="f-box"><b>${L('{who} asked you to review this', {who: esc(first(t.owner))})}</b>${t.evidence ? `<p><a href="${esc(t.evidence)}" target="_blank" rel="noopener">${L('Open the submitted work')}</a></p>` : ''}
    ${ui.form === 'return' ? `<div class="field"><label for="rv-note">${L('What needs to change?')}</label><textarea class="textarea" id="rv-note" data-autofocus></textarea></div><div class="acts"><button class="btn btn-pri" data-act="review-return" data-id="${t.id}">${L('Send back')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="review-approve" data-id="${t.id}">${L('Approve')}</button><button class="btn" data-act="form" data-f="return">${L('Ask for changes')}</button></div>`}</div>` : '');
  const blocker = b ? `<div class="f-box f-box-bad"><b>${L('Blocked')}: ${esc(b.text)}</b><p>${L('Waiting on {who}', {who: esc(pname(b.owner))})}</p>
      ${ui.form === 'resolve' ? `<div class="field"><label for="bk-res">${L('How was it solved?')} <span class="opt">${L('Optional')}</span></label><input class="input" id="bk-res" data-autofocus></div><div class="acts"><button class="btn btn-pri" data-act="resolve-blocker" data-id="${b.id}">${L('It’s solved')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn" data-act="form" data-f="resolve">${L('It’s solved')}</button></div>`}</div>`
    : ui.form === 'blocker' ? `<div class="f-box"><div class="field"><label for="bk-text">${L('What’s blocking this?')}</label><textarea class="textarea" id="bk-text" data-autofocus></textarea><span class="help"></span></div>
      <div class="field"><label for="bk-owner">${L('Who can help?')}</label><select class="input" id="bk-owner">${sPeopleOptions('', L('Choose a person'))}</select><span class="help"></span></div><input type="hidden" id="bk-action" value="">
      <div class="acts"><button class="btn btn-pri" data-act="raise-blocker" data-id="${t.id}">${L('Tell them')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>` : '';
  const projOpts = db.projects.filter(p => sCanSee(p) && (sGroupOf(p.stage) !== 'done' || p.id === t.project)).sort((a, c) => a.name.localeCompare(c.name));
  const fields = edit ? `<div class="field"><label for="f-title">${L('Title')}</label><input class="input" id="f-title" data-bind="title" value="${esc(t.title)}"></div>
    <div class="grid2"><div class="field"><label for="f-due">${L('Due date')}</label><input class="input" type="date" id="f-due" data-bind="due" value="${t.due || ''}"></div><div class="field"><label for="f-time">${L('Time')}</label><input class="input" type="time" id="f-time" data-bind="time" value="${t.time != null ? mins(t.time) : ''}" ${t.due ? '' : 'disabled'}></div></div>
    <div class="field"><label for="sproj">${L('Project')}</label><select class="input" id="sproj" data-id="${t.id}"><option value="">${L('No project')}</option>${projOpts.map(p => `<option value="${p.id}" ${p.id === t.project ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="f-notes">${L('Notes')}</label><textarea class="textarea" id="f-notes" data-bind="notes">${esc(t.notes)}</textarea></div>`
    : `<dl class="f-dl"><dt>${L('Due')}</dt><dd>${t.due ? `${dLong(t.due)}${t.time != null ? `, ${mins(t.time)}` : ''}` : L('No date')}</dd><dt>${L('Project')}</dt><dd>${pr ? `<a href="#/projects/${pr.id}">${esc(pr.name)}</a>` : L('No project')}</dd></dl>${t.notes ? `<p class="f-notes">${esc(t.notes)}</p>` : ''}`;
  const owner = t.owner !== m.id ? `<p class="f-owner">${av(t.owner, 'av-sm')}${L('{who} is doing this', {who: esc(pname(t.owner))})}</p>` : '';
  return `${inspHead(L('Task'))}<h2>${esc(t.title)}</h2>${owner}${status}${review}${blocker}${fields}
    <div class="acts">${!b && !isDone(t) && edit && ui.form !== 'blocker' ? `<button class="btn" data-act="form" data-f="blocker">${L('Something blocking this?')}</button>` : ''}${t.owner === m.id || t.createdBy === m.id ? `<button class="btn btn-danger" data-act="trash" data-id="${t.id}">${L('Delete')}</button>` : ''}</div>`;
}
ON_CHANGE.sproj = el => { const t = taskOf(el.dataset.id); if (!t || !canEditTask(t)) return; const prev = t.project; t.project = el.value || null; const p = projOf(t.project); if (p) t.div = p.div;
  logChange(taskDiv(t), 'edited', {type: 'task', id: t.id, name: t.title}); save(); render(); toast(L('Saved'), () => { t.project = prev; rerender(); }); };

// ---------- Projects ----------
function sProjCard(p) {
  const s = pStats(p), late = p.due && p.due < today() && sGroupOf(p.stage) !== 'done', bl = projBlockers(p).length;
  return `<a class="f-pcard" href="#/projects/${p.id}">
    <div class="f-pcard-h">${projObj(p, 'sm')}<h3>${esc(p.name)}</h3>${sStatus(p)}</div>
    ${p.goal ? `<p class="f-goal">${esc(p.goal)}</p>` : ''}
    <div class="f-prog">${s.total ? `<span class="f-bar" aria-hidden="true"><i style="width:${Math.round(s.done / s.total * 100)}%"></i></span><span>${L('{d} of {n} tasks done', {d: s.done, n: s.total})}</span>` : `<span class="f-muted">${L('No tasks yet')}</span>`}</div>
    <div class="f-pcard-f">${p.lead ? `<span class="f-person">${av(p.lead, 'av-sm')}${esc(pname(p.lead))}</span>` : `<span class="f-muted">${L('No lead yet')}</span>`}<span class="${late ? 'f-late' : 'f-muted'}">${p.due ? L('Due {d}', {d: dShort(p.due)}) : L('No due date')}</span></div>
    ${bl ? `<span class="f-bad">${plural(bl, '{n} task is blocked', '{n} tasks are blocked')}</span>` : ''}</a>`;
}
function sProjects() {
  const m = me(), divs = visibleDivs(m), many = divs.length > 1, dsel = many ? ui.sdiv || 'all' : 'all', q = (ui.spq || '').toLowerCase(), g = ui.spg || 'progress';
  const all = db.projects.filter(p => sCanSee(p) && (dsel === 'all' || p.div === dsel) && (!q || p.name.toLowerCase().includes(q)));
  const n = Object.fromEntries(SGROUPS.map(([k]) => [k, all.filter(p => sGroupOf(p.stage) === k).length]));
  const list = all.filter(p => sGroupOf(p.stage) === g).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const chips = `<div class="f-chips" role="tablist" aria-label="${esc(L('Status'))}">${SGROUPS.map(([k, l]) => `<button class="f-chip ${g === k ? 'on' : ''}" data-act="s-pg" data-k="${k}" role="tab" aria-selected="${g === k}">${L(l)}<span>${n[k]}</span></button>`).join('')}</div>`;
  const tools = `<div class="f-tools"><label class="f-search">${icon('search')}<input id="spq" placeholder="${esc(L('Search projects'))}" value="${esc(ui.spq || '')}" aria-label="${esc(L('Search projects'))}"></label>${many ? `<select class="input f-divsel" id="sdiv" aria-label="${esc(L('Division'))}"><option value="all">${L('All divisions')}</option>${divs.map(d => `<option value="${d}" ${dsel === d ? 'selected' : ''}>${esc(sDivName(d))}</option>`).join('')}</select>` : ''}</div>`;
  const sub = many ? (dsel === 'all' ? L('All divisions') : sDivName(dsel)) : sDivName(m.div);
  return {crumb: '', content: `<div class="f-page">
    ${sKindSeg('projects')}<header class="f-ph"><div><h1>${L('Projects')}</h1><p>${L('Work with a goal and an end date')}, ${esc(sub)}</p></div>${sCreatableDivs().length ? `<button class="btn btn-pri" data-act="s-new-project">${icon('plus')}${L('New project')}</button>` : ''}</header>
    <div class="f-bar2">${sView('projects') === 'cards' ? chips : '<span></span>'}${sViewSeg('projects')}</div>${tools}
    ${sView('projects') === 'timeline' ? `<div class="f-card f-tl">${projectTimeline(all.filter(p => sGroupOf(p.stage) !== 'done'))}</div>` : list.length ? `<div class="f-grid">${list.map(sProjCard).join('')}</div>` : `<div class="f-card f-empty"><b>${q ? L('No projects match your search') : L('No projects here')}</b><p>${L('Try another status above.')}</p></div>`}</div>`};
}
function sProjectPage(id) {
  const p = projOf(id); if (!p || !sCanSee(p)) return {crumb: '', content: denied()};
  const m = me(), edit = canEditProject(p), ts = projTasks(p), s = pStats(p), open = ts.filter(t => !isDone(t)).sort(sByDue), done = ts.filter(isDone);
  const people = [...new Set([p.lead, p.pm, ...team(p).filter(x => x.state === 'joined').map(x => x.id)].filter(Boolean))];
  const links = db.resources.filter(r => r.project === p.id && !r.archived && r.kind === 'link' && r.url);
  const late = p.due && p.due < today() && sGroupOf(p.stage) !== 'done', canAdd = edit || people.includes(m.id) || visibleDivs(m).includes(p.div);
  const statusCtl = edit ? `<label class="f-stsel"><span class="sr">${L('Status')}</span><select class="input" id="sstage" data-id="${p.id}">${SGROUPS.map(([k, l]) => `<option value="${k}" ${sGroupOf(p.stage) === k ? 'selected' : ''}>${L(l)}</option>`).join('')}</select></label>` : sStatus(p);
  const tl = sView('project') === 'timeline';
  return {crumb: '', content: `<div class="f-page ${tl ? '' : 'f-narrow'}">
    <a class="f-back" href="#/projects">${icon('chevron-left')}${L('Projects')}</a>
    <section class="f-card f-phead"><div class="f-phead-t">${artEdit('project', p, projObj(p, 'hero'))}<h1>${esc(p.name)}</h1>${edit ? `<button class="btn" data-act="s-edit-project" data-id="${p.id}">${L('Edit')}</button>` : ''}</div>
      ${p.goal ? `<p class="f-goal">${esc(p.goal)}</p>` : ''}
      <dl class="f-facts"><div><dt>${L('Status')}</dt><dd>${statusCtl}</dd></div><div><dt>${L('Lead')}</dt><dd>${p.lead ? `<span class="f-person">${av(p.lead, 'av-sm')}${esc(pname(p.lead))}</span>` : L('No lead yet')}</dd></div><div><dt>${L('Due')}</dt><dd class="${late ? 'f-late' : ''}">${p.due ? dLong(p.due) : L('No due date')}</dd></div></dl>
      <div class="f-prog">${s.total ? `<span class="f-bar" aria-hidden="true"><i style="width:${Math.round(s.done / s.total * 100)}%"></i></span><span>${L('{d} of {n} tasks done', {d: s.done, n: s.total})}</span>` : `<span class="f-muted">${L('No tasks yet')}</span>`}</div>
      <a class="f-full" href="#/projects/${p.id}/overview">${icon('projects')}<span><b>${L('See the full plan')}</b><small>${L('Brief, milestones, work breakdown, timeline and resources')}</small></span>${icon('chevron')}</a></section>
    <div class="f-bar2"><span></span>${sViewSeg('project', 'Tasks')}</div>
    ${tl ? `<div class="f-card f-tl">${taskTimeline(ts, {owner: true, milestones: projMs(p), project: p.id})}</div>` : ''}
    ${tl ? '' : canAdd ? sAddForm(p) : ''}
    ${tl ? '' : open.length ? sCard(L('To do'), open.map(t => sTaskRow(t, {owner: true, noProject: true})).join(''), 'todo', open.length) : `<div class="f-card f-empty"><b>${L('Nothing left to do')}</b>${canAdd ? `<p>${L('Add the first task above.')}</p>` : ''}</div>`}
    ${!tl && done.length ? `<button class="f-more" data-act="s-pdone" aria-expanded="${!!ui.spDone}">${ui.spDone ? L('Hide completed tasks') : plural(done.length, 'Show {n} completed task', 'Show {n} completed tasks')}</button>${ui.spDone ? sCard(L('Completed'), done.map(t => sTaskRow(t, {owner: true, noProject: true})).join(''), 'done') : ''}` : ''}
    ${people.length ? sCard(L('People'), `<div class="f-people">${people.map(pid => `<span class="f-person">${av(pid, 'av-md')}<span><b>${esc(pname(pid))}</b><small>${pid === p.lead ? L('Lead') : esc(roleLabel(person(pid)))}</small></span></span>`).join('')}</div>`, 'people') : ''}
    ${links.length ? sCard(L('Links'), links.map(r => `<a class="f-row f-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><span class="f-row-t"><span class="f-title">${esc(r.name)}</span><span class="f-meta">${esc(host(r.url))}</span></span>${icon('chevron')}</a>`).join(''), 'links') : ''}</div>`};
}
ON_INPUT.spq = keepFocus('spq', el => { ui.spq = el.value; });
ON_CHANGE.sdiv = el => { ui.sdiv = el.value; render(); };
ON_CHANGE.sstage = el => { const p = projOf(el.dataset.id); if (!p || !canEditProject(p) || sGroupOf(p.stage) === el.value) return; setPStage(p, SGROUP_STAGE[el.value], ''); };

INSP['s-project'] = x => {
  const p = x.id ? projOf(x.id) : null, divs = sCreatableDivs(), d0 = p ? p.div : (divs.includes(ui.sdiv) ? ui.sdiv : divs.includes(ws()) ? ws() : divs[0]);
  return `${inspHead(p ? L('Edit project') : L('New project'))}<h2>${p ? esc(p.name) : L('New project')}</h2>
    <div class="field"><label for="sp-name">${L('Name')}</label><input class="input" id="sp-name" value="${esc(p ? p.name : '')}" data-autofocus><span class="help"></span></div>
    <div class="field"><label for="sp-goal">${L('Goal')} <span class="opt">${L('Optional')}</span></label><textarea class="textarea" id="sp-goal" placeholder="${esc(L('What will be true when this is done?'))}">${esc(p ? p.goal : '')}</textarea></div>
    ${!p && divs.length > 1 ? `<div class="field"><label for="sp-div">${L('Division')}</label><select class="input" id="sp-div">${divs.map(d => `<option value="${d}" ${d === d0 ? 'selected' : ''}>${esc(sDivName(d))}</option>`).join('')}</select></div>` : ''}
    <div class="field"><label for="sp-lead">${L('Lead')}</label><select class="input" id="sp-lead">${sPeopleOptions(p ? p.lead : null, L('No lead yet'))}</select></div>
    <div class="grid2"><div class="field"><label for="sp-due">${L('Due date')}</label><input class="input" type="date" id="sp-due" value="${p && p.due || ''}"><span class="help"></span></div>
    ${p ? '' : `<div class="field"><label for="sp-g">${L('Status')}</label><select class="input" id="sp-g"><option value="planned">${L('Planned')}</option><option value="progress">${L('In progress')}</option></select></div>`}</div>
    <div class="acts"><button class="btn btn-pri" data-act="s-save-project" data-id="${p ? p.id : ''}" data-div="${d0 || ''}">${p ? L('Save') : L('Create project')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`;
};

// ---------- Programs and Operations, the simple way (D63) ----------
// The three kinds keep their pictures from the other looks: a project is a folder, a program a stack, an operation a ring.
const sPgVisible = () => (db.programs || []).filter(g => canSeeProgram(g) && g.state !== 'archived');
// Cards or Timeline on every Work page, remembered per page kind. The timelines are the shared ones (projectTimeline,
// taskTimeline, pgTimeline, rhythm), so dragging dates and the rest behave exactly as in the other looks.
const sView = k => ((session.sView || {})[k]) === 'timeline' ? 'timeline' : 'cards';
const sViewSeg = (k, first = 'Cards') => `<div class="f-vseg" role="radiogroup" aria-label="${esc(L('View'))}">${[['cards', first, 'board'], ['timeline', 'Timeline', 'gantt']].map(([v, l, ic]) => `<button class="${sView(k) === v ? 'on' : ''}" data-act="s-view" data-k="${k}" data-v="${v}" role="radio" aria-checked="${sView(k) === v}">${icon(ic)}<span>${L(l)}</span></button>`).join('')}</div>`;
ACT['s-view'] = el => { session.sView = {...(session.sView || {}), [el.dataset.k]: el.dataset.v}; saveSession(); render(); };
// The switch inside the Work tab: three pills, each with its kind's own mark (a stack, a folder, a ring).
const S_KINDS = [['programs', 'program', 'Programs'], ['projects', 'projects', 'Projects'], ['operations', 'routine', 'Operations']];
function sKindSeg(cur) { ui.sKind = cur;
  return `<nav class="f-kinds" aria-label="${esc(L('Work'))}">${S_KINDS.map(([k, ic, l]) => `<a href="#/${k}" class="f-kind ${k === cur ? 'on' : ''}" ${k === cur ? 'aria-current="page"' : ''}>${icon(ic)}<span>${L(l)}</span></a>`).join('')}</nav>`; }
function sPrograms() { const gs = sPgVisible();
  return {crumb: '', content: `<div class="f-page">${sKindSeg('programs')}<header class="f-ph"><div><h1>${L('Programs')}</h1><p>${L('Projects and operations that share one aim')}</p></div></header>
    ${gs.length ? `<div class="f-grid f-pggrid">${gs.map(g => { const k = pgKids(g);
      return `<a class="f-pgtile" href="#/programs/${g.id}"><span class="f-art">${pgObj(g, 'hero')}</span><b>${esc(g.name)}</b>${g.goal ? `<p class="f-goal">${esc(g.goal)}</p>` : ''}<small>${plural(k.ps.length, '{n} project', '{n} projects')}, ${plural(k.rs.length, '{n} operation', '{n} operations')}</small></a>`; }).join('')}</div>`
      : `<div class="f-card f-empty"><b>${L('No programs yet')}</b><p>${L('A program groups projects and operations that share one aim, like a year of partner work.')}</p></div>`}</div>`}; }
// an operation card: its ring, how often it comes back, and whose turn is next
function sRtCard(r) { const nx = rtBeats(r, today(), addDays(today(), 120)).find(b => b.st !== 'skip' && !(b.t && isDone(b.t))), who = nx && (nx.owner || (nx.t && nx.t.owner));
  return `<a class="f-pcard f-rcard" href="#/operations/${r.id}"><div class="f-pcard-h">${rtObj(r, 'sm')}<h3>${esc(r.name)}</h3>${r.paused ? `<span class="f-st f-st-hold">${L('Paused')}</span>` : ''}</div>
    <p class="f-goal">${esc(cadText(r))}</p>
    <div class="f-pcard-f">${nx ? `<span class="f-person">${who ? av(who, 'av-sm') : ''}${who === session.me ? L('Your turn') : who ? esc(pname(who)) : ''}</span><span class="f-muted">${nx.d === today() ? L('Today') : L('Next {d}', {d: dShort(nx.d)})}</span>` : `<span class="f-muted">${L('Nothing coming up')}</span>`}</div></a>`; }
function sProgramPage(id) { const g = pgOf(id); if (!g || !canSeeProgram(g)) return {crumb: '', content: denied()};
  const k = pgKids(g), ps = k.ps.filter(sCanSee), rs = k.rs.filter(canSeeRt), ds = pgDivs(g);
  return {crumb: '', content: `<div class="f-page">
    <a class="f-back" href="#/programs">${icon('chevron-left')}${L('Programs')}</a>
    <section class="f-card f-phead f-pghead"><div class="f-phead-t">${artEdit('program', g, pgObj(g, 'hero'))}<div><p class="f-kicker">${L('Program')}</p><h1>${esc(g.name)}</h1></div></div>
      ${g.goal ? `<p class="f-goal">${esc(g.goal)}</p>` : ''}
      <dl class="f-facts"><div><dt>${L('Period')}</dt><dd>${esc(pgPeriod(g))}</dd></div><div><dt>${L('Lead')}</dt><dd>${g.owner ? `<span class="f-person">${av(g.owner, 'av-sm')}${esc(pname(g.owner))}</span>` : L('No lead yet')}</dd></div><div><dt>${ds.length > 1 ? L('Divisions') : L('Division')}</dt><dd>${ds.map(d => `<span class="f-dv">${bicon(div(d).icon, false)}${esc(div(d).short)}</span>`).join('')}</dd></div></dl>
      <a class="f-full" href="#/programs/${g.id}/full">${icon('program')}<span><b>${L('See the full program')}</b><small>${L('Partners, people and the timeline')}</small></span>${icon('chevron')}</a></section>
    ${ps.length || rs.length ? `<div class="f-bar2"><span></span>${sViewSeg('program')}</div>` : ''}
    ${sView('program') === 'timeline' ? `<div class="f-card f-tl">${pgTimeline(g) || ''}</div>` : `${ps.length ? `<section class="f-sec"><h2 class="f-sec-h">${L('Projects')}<span class="f-n">${ps.length}</span></h2><div class="f-grid">${ps.map(sProjCard).join('')}</div></section>` : ''}
    ${rs.length ? `<section class="f-sec"><h2 class="f-sec-h">${L('Operations')}<span class="f-n">${rs.length}</span></h2><div class="f-grid">${rs.map(sRtCard).join('')}</div></section>` : ''}`}
    ${!ps.length && !rs.length ? `<div class="f-card f-empty"><b>${L('Nothing in this program yet')}</b><p>${L('Its lead adds projects and operations from the full program.')}</p></div>` : ''}</div>`}; }
function sOperations() {
  const m = me(), mine = db.tasks.filter(t => t.routine && !t.trashed && !isDone(t) && t.owner === m.id && runDate(t) <= addDays(today(), 7) && rtOf(t.routine)).sort((a, b) => runDate(a).localeCompare(runDate(b)));
  const rs = (db.routines || []).filter(r => canSeeRt(r) && (r.personal ? r.owners.includes(m.id) : visibleDivs(m).includes(r.unit) || r.owners.includes(m.id))).sort((a, b) => (a.paused ? 1 : 0) - (b.paused ? 1 : 0) || (b.owners.includes(m.id) ? 1 : 0) - (a.owners.includes(m.id) ? 1 : 0) || a.name.localeCompare(b.name));
  const run = t => { const r = rtOf(t.routine), cl = t.checklist || [], n = cl.filter(c => c.done).length, late = t.due && t.due < today(), nt = nextTurn(r, t.occ);
    return `<div class="f-run" data-act="open-task" data-id="${t.id}" tabindex="0">${rtObj(r, 'hero')}<div class="f-run-t"><b>${esc(r.name)}</b><span class="${late ? 'f-late' : 'f-muted'}">${late ? L('Was due {d}', {d: dLong(t.due)}) : runDate(t) === today() ? L('Today') : dLong(runDate(t))}${cl.length ? `, ${L('{d} of {n} steps', {d: n, n: cl.length})}` : ''}</span>${nt ? `<small>${L('Then {who}', {who: esc(nt === m.id ? L('you') : first(nt))})}</small>` : ''}</div><div class="f-run-b" data-act="perf-stop">${opDoneBtn(t)}</div></div>`; };
  return {crumb: '', content: `<div class="f-page">
    ${sKindSeg('operations')}<header class="f-ph"><div><h1>${L('Operations')}</h1><p>${L('Work that comes back on a schedule. When it is your turn, it shows here and in My tasks.')}</p></div></header>
    ${mine.length ? sCard(L('Your turn'), mine.map(run).join(''), 'turn', mine.length) : ''}
    ${rs.length ? `<section class="f-sec"><h2 class="f-sec-h">${L('All operations')}<span class="f-n">${rs.length}</span>${sViewSeg('operations')}</h2>${sView('operations') === 'timeline' ? `<div class="f-card f-tl"><p class="f-tl-h">${L('Each dot is one run, with the person whose turn it was')}</p>${rhythm(rs.filter(r => !r.personal))}${obLegend()}</div>` : `<div class="f-grid">${rs.map(sRtCard).join('')}</div>`}</section>` : `<div class="f-card f-empty"><b>${L('No operations yet')}</b><p>${L('An operation is work that comes back on a schedule, like a weekly post or a monthly report.')}</p></div>`}</div>`}; }

// ---------- actions ----------
Object.assign(ACT, {
  's-menu': el => { const t = el.dataset.menu; ui.acctSub = ''; ui.menu = {type: t, rect: el.getBoundingClientRect(), alignRight: true, width: t === 'sbell' ? 360 : t === 'sme' ? 300 : 240, est: t === 'sbell' ? 480 : 300}; renderLayer(); },
  's-upd': (el, id) => { ui.menu = null; renderLayer(); ACT['open-update'](el, id); },
  's-signout': () => { ui.menu = null; renderLayer(); ACT.signout(); },
  's-done': () => { ui.sDone = !ui.sDone; render(); },
  's-pdone': () => { ui.spDone = !ui.spDone; render(); },
  's-pg': el => { ui.spg = el.dataset.k; render(); },
  's-new-project': () => { ui.menu = null; renderLayer(); if (!sCreatableDivs().length) return toast(L('Only co-directors and above can create projects.')); ui.insp = {type: 's-project'}; ui.form = null; if (route().page !== 'projects') go('projects'); render(); setTimeout(() => $('#sp-name') && $('#sp-name').focus(), 0); },
  's-edit-project': (el, id) => { ui.insp = {type: 's-project', id}; ui.form = null; render(); },
  's-save-project': el => { const id = el.dataset.id, m = me(), name = $('#sp-name').value.trim(); if (!name) return invalid('#sp-name', L('Give the project a name.'));
    const vals = {name, goal: $('#sp-goal').value.trim(), lead: $('#sp-lead').value || null, due: $('#sp-due').value || null};
    if (id) { const p = projOf(id); if (!canEditProject(p)) return; if (p.start && vals.due && vals.due < p.start) return invalid('#sp-due', L('The due date must be after the start.'));
      const prev = {...p}; Object.assign(p, vals); logChange(p.div, 'edited project', {type: 'project', id: p.id, name: p.name}); ui.insp = null; save(); render(); toast(L('Project saved'), () => { Object.assign(p, prev); rerender(); }); return; }
    const d = $('#sp-div') ? $('#sp-div').value : el.dataset.div; if (!d || !canCreateProject(m, d)) return toast(L('Only co-directors and above can create projects.'));
    const p = {id: uid('p'), div: d, stage: SGROUP_STAGE[$('#sp-g').value] || 'planned', reason: '', createdBy: m.id, createdAt: nowStamp(), pm: null, start: null, scopeIn: [], scopeOut: [], team: [], ...vals};
    db.projects.push(p); logChange(p.div, 'created project', {type: 'project', id: p.id, name: p.name}); if (p.lead && p.lead !== m.id) notify(p.lead, 'delegated', {type: 'project', id: p.id});
    ui.insp = null; save(); go(`projects/${p.id}`); toast(L('Project created'), () => { db.projects = db.projects.filter(v => v !== p); rerender(); go('projects'); }); },
});

// ---------- the Simple pages take over only in the Simple look ----------
S_ORIG.programs = PAGES.programs; S_ORIG.operations = PAGES.operations;
// a program's /full route is the full program page, also in Simple
PAGES.programs = r => isSimple() && r.sub !== 'full' ? (r.id && r.id !== 'new' ? sProgramPage(r.id) : sPrograms()) : S_ORIG.programs(r);
PAGES.operations = r => isSimple() && !r.id ? sOperations() : S_ORIG.operations(r);
PAGES.work = r => isSimple() ? sWork(r) : S_ORIG.work(r);
// A project's own route with a tab (projects/<id>/<tab>) is the full planning page, also in Simple.
PAGES.projects = r => isSimple() && !r.sub ? (r.id ? sProjectPage(r.id) : sProjects()) : S_ORIG.projects(r);
INSP.task = x => isSimple() ? sTaskSheet(x) : S_ORIG.taskInsp(x);
