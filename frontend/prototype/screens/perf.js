// UXP · Performance, Board and leadership attention (UI sprint, owned by this session only). Registers PAGES / CAPS / INSP / ACT entries; see .planning/workstreams/SPRINT.md.
// Team performance (D30, analytics_team_performance, W098, S078): recorded facts per person, scoped by role, every figure opens its records,
// Unknown is never zero, no ranking. Board of Supervisors (D29, access_board_scope, W101, S081): read-only oversight account and landing.
// President and VP attention view (blueprint §4): decisions waiting, escalations, cross-division handoffs, blockers, deadlines, commitments;
// counts open their records and there is no health score. HR facts are read from UXD1's db.hr records by ID (one record, many views).
// Policy details POL has not settled are shown as the plan proposes them and listed as open in UX3/HANDOFF.md. Demo data only (D8).
(() => {
'use strict';

// ---------- roles and the Board account (D29) ----------
// The Board is a separate role with no division (access_board_scope). Rank 0, so canCreateProject and canEditProject stay false.
ROLES.board = ROLES.board || {label: 'Board of Supervisors', icon: 'role-board', rank: 0};
// Placeholder role mark in the brand icon style until the owner supplies one (D19 lists no Board icon; open in the handoff).
A.brand['role-board'] = A.brand['role-board'] || {label: 'Board of Supervisors', svg: '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="11.5" r="2.6" fill="var(--dwdg-green,#00C25A)"/>'};
const BOARD = {id: 'board-hadi', name: 'Hadi Santoso', first: 'Hadi', div: null, role: 'board', photo: null, title: 'Board of Supervisors', admin: false, hasSchedule: false, gcal: false, status: 'active', board: true, joined: '2026-09-01', linkedin: null, phone: null, hidePhone: true};
// Board accounts appear 0 times in task, offer and mention pickers (W101 acceptance 2). The pickers list db.people, so the Board record is
// present only on the sign-in screen and while a Board account is signed in; nobody else's session ever lists it.
function syncBoard() { if (!db || !db.people) return; const i = db.people.findIndex(p => p.id === BOARD.id);
  const other = session.me && session.me !== BOARD.id ? db.people.find(p => p.id === session.me) : null;
  if (!other && i < 0) db.people.push({...BOARD}); else if (other && i >= 0) db.people.splice(i, 1); }
PERSONAS_EXTRA.push(BOARD.id);
{ const r1 = render; render = function () { syncBoard(); r1(); }; }
syncBoard();

// ---------- who sees what (D30, D29, access_vp_scope, access_president_scope) ----------
const isBoard = p => !!p && p.role === 'board';
const isPres = p => !!p && p.role === 'president';
const isVP = p => !!p && p.role === 'vp';
const isLead = p => isPres(p) || isVP(p) || (!!p && p.admin);
// HR sees everyone (D30). Proposed: the HR Director and Co-Directors hold that grant, the same people UXD1 gives the private-HR grant.
const hrAll = p => !!p && p.div === 'hr' && rank(p) >= 2;
// Reporting lines are configuration, never hard-coded (D28). Current structure: one VP over all six divisions (blueprint §1-2).
const REPORTING = {current: {vp: () => DIVS.map(d => d.id)}};
const vpDivs = p => isVP(p) ? REPORTING.current.vp(p) : [];
// Branch membership is not in the organization records yet (IAM). Proposed: Consulting's three Co-Directors lead these members.
const BRANCHES = {ilham: {name: 'Project Associates', members: ['bima', 'naufal']}, dimas: {name: 'Knowledge', members: ['olivia', 'qonita']}, putri: {name: 'TnD', members: ['maya', 'prasetyo']}};
const active = () => db.people.filter(p => p.status === 'active' && !isBoard(p));
// One scope per role (analytics_team_performance acceptance 1): CD branch, Director division, VP reporting divisions, HR and President everyone, member self.
function teamOf(m) {
  if (!m) return {kind: 'none', ids: []};
  if (isBoard(m)) return {kind: 'board', ids: []};
  if (isPres(m) || hrAll(m)) return {kind: 'all', ids: active().map(p => p.id)};
  if (isVP(m)) { const ds = vpDivs(m); return {kind: 'vp', ids: active().filter(p => ds.includes(p.div) || p.id === m.id).map(p => p.id)}; }
  if (m.role === 'director') return {kind: 'div', ids: active().filter(p => p.div === m.div).map(p => p.id)};
  if (m.role === 'codirector') { const b = BRANCHES[m.id]; if (b) return {kind: 'branch', branch: b.name, ids: [m.id, ...b.members]};
    return {kind: 'cd', ids: active().filter(p => p.div === m.div && (rank(p) < 2 || p.id === m.id)).map(p => p.id)}; }
  return {kind: 'self', ids: [m.id]};
}
const canSeePerson = (m, pid) => !!m && !isBoard(m) && (pid === m.id || teamOf(m).ids.includes(pid));
const attnDivs = m => isPres(m) || (m && m.admin) ? DIVS.map(d => d.id) : isVP(m) ? vpDivs(m) : m && rank(m) >= 2 && m.div ? [m.div] : [];
const canAttn = m => isLead(m) || (!!m && rank(m) >= 2 && !!m.div && !isBoard(m));

// ---------- small view helpers ----------
const sec = (title, n, extra = '', id = '') => `<h2 class="sec-h"${id ? ` id="${id}"` : ''}>${title}${n != null ? ` <span class="n">${n}</span>` : ''}${extra}</h2>`;
const note = (kind, ic, title, body = '', acts = '') => `<div class="notice n-${kind}"><i class="n-ic" style="--m:${maskUrl(A.ui[ic] || A.ui.info)}"></i><div><b>${title}</b>${body ? `<p>${body}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const emptyBox = (title, body) => `<div class="empty"><b>${title}</b><p>${body}</p></div>`;
const locked = label => `<span class="restricted">${icon('lock')}${label}</span>`;
const unknown = (label = L('Unknown')) => `<span class="pf-unk">${label}</span>`;
const sevWord = s => state(L(SEV[s][0]), 'warning', s === 'high' ? 'danger' : s === 'medium' ? 'warn' : 'mute');
const who = id => `<button class="perf-who" data-act="open-person" data-id="${esc(id)}">${av(id, 'av-xs')}<span>${esc(first(id))}</span></button>`;
const span2 = (a, b) => `${dShort(a)} – ${dShort(b)}`;
const meta = rows => `<dl class="meta perf-meta">${rows.filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const deniedPage = crumb => ({crumb, content: denied()}); // pattern 13: neutral, no title leak (flow-vp-scope 4)
const roOnly = () => toast(L('Board accounts are read-only. Nothing was changed.'));

// ---------- HR records (UXD1 owns db.hr; read by ID, never copied) ----------
function hr() { if (!db.hr && typeof window.ensureHrData === 'function') { try { window.ensureHrData(); } catch (e) { /* HR file not ready: facts show Unknown */ } } return db.hr && db.hr.cycles ? db.hr : null; }
const ATT = {present: ['Present', 'check', 'green'], late: ['Late', 'clock', 'warn'], excused: ['Excused absence', 'info', 'ink2'], unexcused: ['Unexcused absence', 'close', 'danger'], notreq: ['Not required', 'minus', 'mute'], unknown: ['Not yet recorded', 'circle', 'mute']};
const ATT_ORDER = ['present', 'late', 'excused', 'unexcused', 'unknown'];
const AS = {final: ['Finalized', 'check', 'green'], incomplete: ['Incomplete', 'warning', 'warn'], exempt: ['Exempt', 'minus', 'mute'], none: ['Not submitted', 'circle', 'mute'], submitted: ['Submitted', 'clock', 'ink2'], clarify: ['Clarification asked', 'info', 'warn'], draft: ['Being scored', 'edit', 'ink2'], reviewed: ['Scored, not final', 'search', 'warn']};
const CY_ST = {planned: 'Planned', open: 'Open', review: 'In review', final: 'Finalized', closed: 'Closed'};
const chip = (def, pill = '') => state(L(def[0]), def[1], def[2], pill);
const regDate = g => (meetingOf(g.meeting) || {}).date || (g.createdAt || '').slice(0, 10);
const regTitle = g => { const mt = meetingOf(g.meeting); return mt ? `${mt.title}, ${dShort(mt.date)}` : L('Weekly meeting'); };
const attStatus = (g, pid) => { const e = (g.entries || {})[pid]; return e && e.length ? e[e.length - 1].status : 'unknown'; }; // missing entry stays Not yet recorded (hr_attendance)
const rubric = () => window.HR_RUBRIC || {version: 'v0.1', max: 5, criteria: []};
// The weighted result is the HR file's proposed formula (sum of value / max × weight, one decimal). Rubric not adopted (hr_scoring_policy open).
const total = a => { const R = rubric(); if (!a || !a.scores || !R.criteria.length || R.criteria.some(c => !a.scores[c.k])) return null; return Math.round(R.criteria.reduce((s, c) => s + a.scores[c.k].v / R.max * c.w, 0) * 10) / 10; };

// ---------- periods: consecutive 14-day windows on the HR cycle anchor (hr_fortnightly_cycle, proposed anchor Mon 7 Sep) ----------
const ANCHOR = '2026-09-07';
function periods() { const out = []; for (let s = ANCHOR; s <= today(); s = addDays(s, 14)) out.push({k: s, from: s, to: addDays(s, 13)}); out.reverse();
  out.forEach((p, i) => { p.label = i === 0 ? L('This cycle, {d}', {d: span2(p.from, p.to)}) : span2(p.from, p.to); });
  out.push({k: 'all', from: ANCHOR, to: today(), label: L('All cycles since {d}', {d: dShort(ANCHOR)})}); return out; }
const periodOf = k => periods().find(p => p.k === k) || periods().find(p => p.k === 'all');
const curPeriod = () => periodOf(session.perfPeriod || 'all');
const inP = (P, d) => !!d && d >= P.from && d <= P.to;
const periodSel = () => `<select class="input sel-sm" id="perf-period" aria-label="${esc(L('Period'))}">${periods().map(p => `<option value="${p.k}" ${p.k === curPeriod().k ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}</select>`;

// ---------- recorded facts for one person (analytics_team_performance) ----------
// Task delivery counts only work recorded in dwdg'ONE. A delegated task or routine run counts as completed only once it is signed off (D35):
// status done is reached only through sign-off, so a task waiting in review is listed apart and never counted as completed.
function taskFacts(pid, P) {
  const ts = db.tasks.filter(t => !t.trashed && !isSummary(t) && taskPeople(t).includes(pid)), dd = t => (t.doneAt || '').slice(0, 10);
  const done = ts.filter(t => isDone(t) && inP(P, dd(t)));
  return {done, late: done.filter(t => t.due && dd(t) >= t.due), overdue: ts.filter(t => !isDone(t) && t.due && t.due < today()), signoff: ts.filter(t => t.status === 'review'),
    blockers: db.blockers.filter(b => b.state === 'open' && ts.some(t => t.id === b.task && !isDone(t))), returned: ts.filter(t => (t.reviewChoice === 'returned' && inP(P, (t.reviewedAt || '').slice(0, 10))) || (t.submissions || []).some(s => !s.withdrawn && s.review && s.review.result === 'returned' && inP(P, s.review.at.slice(0, 10)))),
    offers: db.offers.filter(o => o.to === pid && o.state === 'accepted' && inP(P, (o.answeredAt || '').slice(0, 10))),
    ...rated(ts.filter(t => t.owner === pid), P)};
}
// Handed-in work (D58): accepted hand-ins in the period by rating, and hand-ins waiting for the giver.
function rated(ts, P) { const acc = ts.filter(t => isDone(t) && t.rating && inP(P, (t.reviewedAt || t.doneAt || '').slice(0, 10)));
  return {accepted: acc, 'r-excellent': acc.filter(t => t.rating === 'excellent'), 'r-good': acc.filter(t => t.rating === 'good'), 'r-needs-work': acc.filter(t => t.rating === 'needs-work'),
    handedIn: ts.filter(t => t.status === 'review' && (t.submissions || []).some(s => !s.withdrawn && !s.review))}; }
const rateMini = (key, tf) => tf.accepted.length ? `<button class="perf-att" data-act="perf-open" data-k="${esc(key)}" aria-label="${esc(L('Accepted work by rating'))}">${['excellent', 'good', 'needs-work'].filter(r => tf['r-' + r].length).map(r => `<span class="perf-mini s-${RATING[r][2]}" title="${esc(L(RATING[r][0]))}"><i class="st-ic" style="--m:${maskUrl(A.ui[RATING[r][1]])}"></i><span class="sr">${esc(L(RATING[r][0]))}</span>${tf['r-' + r].length}</span>`).join('')}</button>` : `<span class="t-mute">${L('None yet')}</span>`;
// Attendance: only registers that expect the person; guests and not-required people are not assessed (hr_attendance, blueprint §7.2).
function attFacts(pid, P) { const h = hr(); if (!h) return null;
  const regs = h.registers.filter(g => (g.expected || []).includes(pid) && inP(P, regDate(g))).map(g => ({g, st: attStatus(g, pid), final: !!g.finalAt})).sort((a, b) => regDate(b.g).localeCompare(regDate(a.g)));
  const counts = {}; regs.filter(x => x.final).forEach(x => { counts[x.st] = (counts[x.st] || 0) + 1; });
  return {regs, counts, finals: regs.filter(x => x.final).length, drafts: regs.filter(x => !x.final).length}; }
// HR cycle: a specific window shows that cycle's state; All shows the latest finalized cycle. No finalized cycle stays Unknown, never 0.
function hrFacts(pid, P) { const h = hr(); if (!h) return {k: 'unknown'};
  const cyc = P.k === 'all' ? h.cycles.filter(c => ['final', 'closed'].includes(c.state) && (c.roster || []).some(r => r.p === pid)).sort((a, b) => b.end.localeCompare(a.end))[0] : h.cycles.find(c => c.start === P.from);
  if (!cyc) return {k: 'unknown'}; const ro = (cyc.roster || []).find(r => r.p === pid); if (!ro) return {k: 'unknown', cyc};
  if (ro.exempt) return {k: 'exempt', cyc, ro};
  const a = h.assessments.find(x => x.cycle === cyc.id && x.person === pid); let k = a ? a.state : 'none'; if (k === 'none' && cyc.state === 'closed') k = 'incomplete';
  return {k, cyc, a, ro}; }
const hrChip = f => f.k === 'unknown' ? unknown() : chip(AS[f.k] || AS.none);
const cyLabel = c => span2(c.start, c.end);

// ---------- figures that open their records (W098 acceptance 2) ----------
const METRIC = {accepted: 'Accepted hand-ins', 'r-excellent': 'Rated Excellent', 'r-good': 'Rated Good', 'r-needs-work': 'Rated Needs work', handedIn: 'Handed in, waiting for assessment', done: 'Completed', late: 'Completed on or after the due date', overdue: 'Overdue now', signoff: 'Waiting for sign-off', blockers: 'Open blockers', returned: 'Sent back after review', offers: 'Offers accepted', att: 'Weekly meeting attendance', hr: '14-day HR cycles', projects: 'Active projects', msLate: 'Overdue milestones'};
const numBtn = (key, n, metric, cls = '') => `<button class="perf-n ${n ? '' : 'zero'} ${cls}" data-act="perf-open" data-k="${esc(key)}" aria-label="${esc(`${L(METRIC[metric])}: ${n}`)}" title="${esc(L(METRIC[metric]))}">${n}</button>`;
const attMini = (key, f) => { if (!f || !f.regs.length) return unknown(); if (!f.finals) return `<button class="perf-att" data-act="perf-open" data-k="${esc(key)}">${chip(['Register not finalized', 'clock', 'mute'], '')}</button>`;
  return `<button class="perf-att" data-act="perf-open" data-k="${esc(key)}" aria-label="${esc(L('Weekly meeting attendance'))}">${ATT_ORDER.filter(s => f.counts[s]).map(s => `<span class="perf-mini s-${ATT[s][2]}" title="${esc(L(ATT[s][0]))}"><i class="st-ic" style="--m:${maskUrl(A.ui[ATT[s][1]])}"></i><span class="sr">${esc(L(ATT[s][0]))}</span>${f.counts[s]}</span>`).join('')}</button>`; };

// ---------- rings (R040 Samsung Health, D61) ----------
// Three separate recorded ratios, drawn as concentric rings: delivered on time (outer), weekly meetings attended (middle) and
// hand-ins accepted (inner). They are never added up, averaged or sorted by (D30). A ring with nothing recorded is a dashed track.
const RING = [['del', 'Delivered on time'], ['att', 'Meetings attended'], ['hand', 'Hand-ins accepted']];
// on time = finished on or before the due date (a task done on its due day is on time)
function ringFacts(pid, P) { const tf = taskFacts(pid, P), af = attFacts(pid, P), done = tf.done.length, late = tf.done.filter(t => t.due && (t.doneAt || '').slice(0, 10) > t.due).length, acc = tf.accepted.length, ret = tf.returned.length;
  return {tf, af, del: done ? {n: done - late, of: done} : null, att: af && af.finals ? {n: (af.counts.present || 0) + (af.counts.late || 0), of: af.finals} : null, hand: acc + ret ? {n: acc, of: acc + ret} : null}; }
function rings(f, keys = ['del', 'att', 'hand'], size = 'md') {
  const R = {del: 42, att: 31, hand: 20}, w = keys.length === 3 ? 9 : 11;
  const arc = (k, i) => { const r = keys.length === 3 ? R[k] : [40, 26][i], c = 2 * Math.PI * r, v = f[k];
    if (!v) return `<circle class="rg-unk" cx="50" cy="50" r="${r}" stroke-width="${w * .5}"/>`;
    const p = v.of ? Math.min(1, v.n / v.of) : 0;
    return `<circle class="rg-tr r-${k}" cx="50" cy="50" r="${r}" stroke-width="${w}"/>${p ? `<circle class="rg-v r-${k}" cx="50" cy="50" r="${r}" stroke-width="${w}" stroke-dasharray="${(p * c).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 50 50)"/>` : ''}`; };
  const label = keys.map(k => `${L(RING.find(x => x[0] === k)[1])}: ${f[k] ? L('{n} of {of}', {n: f[k].n, of: f[k].of}) : L('No record yet')}`).join('. ');
  return `<svg class="rg rg-${size}" viewBox="0 0 100 100" role="img" aria-label="${esc(label)}">${keys.map(arc).join('')}</svg>`; }
const ringLine = (f, k, extra = '') => `<li class="rl-${k}"><i></i><span>${f[k] ? `<b class="t-num">${L('{n} of {of}', {n: f[k].n, of: f[k].of})}</b> ${k === 'del' ? L('on time') : k === 'att' ? L('meetings') : L('hand-ins accepted')}` : `<span class="pf-unk">${k === 'del' ? L('No finished work yet') : k === 'att' ? L('No finalized meeting yet') : L('No hand-in assessed yet')}</span>`}${extra}</span></li>`;
const rateWords = tf => ['excellent', 'good', 'needs-work'].filter(r => tf['r-' + r].length).map(r => `<span class="pf-r s-${RATING[r][2]}">${tf['r-' + r].length} ${esc(L(RATING[r][0]))}</span>`).join(', ');
const ringKey = (keys = ['del', 'att', 'hand']) => `<div class="rg-key">${keys.map(k => `<span class="rl-${k}"><i></i>${L(RING.find(x => x[0] === k)[1])}</span>`).join('')}<span class="rg-u"><i></i>${L('Nothing recorded yet')}</span></div>`;

// Simple view (owner, 11 Oct, D62): a small number table per person, the default; Rings shows the ring cards. Remembered per person.
const perfView = () => session.perfView === 'rings' ? 'rings' : 'simple';
const viewSeg = () => `<div class="seg" role="radiogroup" aria-label="${esc(L('View'))}"><button class="${perfView() === 'simple' ? 'on' : ''}" data-act="perf-view" data-v="simple" role="radio" aria-checked="${perfView() === 'simple'}">${L('Simple')}</button><button class="${perfView() === 'rings' ? 'on' : ''}" data-act="perf-view" data-v="rings" role="radio" aria-checked="${perfView() === 'rings'}">${L('Rings')}</button></div>`;
const dash = '<span class="pf-unk">–</span>';
function simpleTable(ids, P) {
  const head = [L('Name'), L('Finished'), L('On time'), L('Overdue'), L('Meetings'), L('Hand-ins'), L('HR cycle')];
  return `<div class="pf-tbl" role="table" aria-label="${esc(L('Team performance'))}"><div class="pf-tr pf-th" role="row">${head.map(h => `<span role="columnheader">${h}</span>`).join('')}</div>
    ${ids.map(id => { const p = person(id), f = ringFacts(id, P), od = f.tf.overdue.length, c = (l, v, cls = '') => `<span role="cell" class="${cls}" data-l="${esc(l)}">${v}</span>`;
      return `<a class="pf-tr" href="#/performance/${id}" role="row"><span role="cell" class="pf-tn">${av(id, 'av-sm')}<span><b>${esc(p.name)}</b><small>${esc(roleLabel(p))}</small></span></span>${c(head[1], `<b class="t-num">${f.tf.done.length}</b>`)}${c(head[2], f.del ? `<b class="t-num">${f.del.n}</b>` : dash)}${c(head[3], `<b class="t-num">${od}</b>`, od ? 'bad' : '')}${c(head[4], f.att ? `<b class="t-num">${f.att.n}</b><small>/${f.att.of}</small>` : dash)}${c(head[5], f.hand ? `<b class="t-num">${f.hand.n}</b><small>/${f.hand.of}</small>` : dash)}${c(head[6], hrChip(hrFacts(id, P)), 'pf-thr')}</a>`; }).join('')}</div>`; }
// ---------- Performance page (#/performance, #/performance/<person>) ----------
// Paired bars (R006/R011): the chosen period strong, the period before it pale, for the same person. Never compared with others (D30).
function pairBars(pid, P, k) { const ps = periods(), cur = P.k === 'all' ? ps[0] : P, i = ps.findIndex(x => x.k === cur.k), prev = ps[i + 1] && ps[i + 1].k !== 'all' ? ps[i + 1] : null;
  const a = taskFacts(pid, cur), b = prev ? taskFacts(pid, prev) : null;
  const rows = [['done', 'Completed'], ['late', 'Completed on or after the due date'], ['returned', 'Sent back after review'], ['accepted', 'Accepted hand-ins']];
  const max = Math.max(1, ...rows.flatMap(([x]) => [a[x].length, b ? b[x].length : 0]));
  return `<div class="pb"><div class="pb-key"><span><i class="pb-a"></i>${esc(cur.label)}</span>${prev ? `<span><i class="pb-b"></i>${esc(L('Previous cycle, {d}', {d: span2(prev.from, prev.to)}))}</span>` : ''}</div>
    ${rows.map(([x, l]) => `<button class="pb-row" data-act="perf-open" data-k="${esc(`p:${pid}:${x}:${cur.k}`)}"><span class="pb-l">${L(l)}</span><span class="pb-bars"><span class="pb-bar a" style="width:${a[x].length / max * 100}%"></span>${b ? `<span class="pb-bar b" style="width:${b[x].length / max * 100}%"></span>` : ''}</span><span class="pb-n"><b>${a[x].length}</b>${b ? `<small>${b[x].length}</small>` : ''}</span></button>`).join('')}</div>`; }
// Handed-in work as slim tracks (R016): how much of the accepted work got each rating.
function rateTracks(tf, k) { const n = tf.accepted.length;
  return `<div class="pf-group rt-tracks">${['excellent', 'good', 'needs-work'].map(r => `<button class="trk" data-act="perf-open" data-k="${esc(k('r-' + r))}"><div class="trk-h"><span>${rateChip(r)}</span><b class="t-num">${tf['r-' + r].length}<em>/${n}</em></b></div><span class="trk-bar s-${RATING[r][2]}"><i style="width:${n ? tf['r-' + r].length / n * 100 : 0}%"></i></span></button>`).join('')}<button class="trk" data-act="perf-open" data-k="${esc(k('handedIn'))}"><div class="trk-h"><span>${L('Handed in, waiting for assessment')}</span><b class="t-num">${tf.handedIn.length}</b></div><small>${L('Right now')}</small></button></div>`; }
const pCrumb = (parts) => parts.map(([h, t], i) => i === parts.length - 1 ? `<b>${esc(t)}</b>` : `<a href="#/${h}">${esc(t)}</a>`).join('<i>/</i>');
PAGES.performance = r => {
  const m = me(), T = teamOf(m);
  if (r.id === 'div' && r.sub) return divDetail(r.sub);
  if (r.id) return canSeePerson(m, r.id) && person(r.id) ? personPage(r.id) : deniedPage(pCrumb([['performance', L('Performance')], ['', L('Not available')]]));
  if (T.kind === 'board') return boardSummary();
  if (T.kind === 'self') return personPage(m.id);
  return teamPage(m, T);
};
function scopeText(m, T) {
  const w = div(ws());
  if (T.kind === 'branch') return L('Your branch: {b}, {n} people', {b: L(T.branch), n: T.ids.length});
  if (T.kind === 'div' || T.kind === 'cd') return L('Your team in {d}, {n} people', {d: w.name, n: T.ids.length});
  if (T.kind === 'vp') return L('Your reporting divisions');
  return L('Everyone in DWDG UII');
}
// The cycle band (R016's top card, facts only): where today sits in the current 14-day cycle, and what the people shown recorded.
function cycleBand(P, ids) { const cur = periods()[0], day = daysBetween(cur.from, today()) + 1;
  const sum = k => ids.reduce((s, id) => s + taskFacts(id, P)[k].length, 0), lateN = ids.reduce((s, id) => s + taskFacts(id, P).done.filter(t => t.due && (t.doneAt || '').slice(0, 10) > t.due).length, 0), over = ids.reduce((s, id) => s + taskFacts(id, P).overdue.length, 0);
  return `<div class="pf-band"><div class="pf-bh"><b>${L('This cycle, {d}', {d: span2(cur.from, cur.to)})}</b><span class="t-mute">${L('Day {n} of 14', {n: day})}</span></div>
    <div class="pf-days" aria-hidden="true">${Array.from({length: 14}, (_, i) => `<i class="${i + 1 < day ? 'd-past' : i + 1 === day ? 'd-now' : ''}"></i>`).join('')}</div>
    <div class="pf-bf"><span><b class="t-num">${sum('done')}</b> ${L('completed')}</span><span><b class="t-num">${lateN}</b> ${L('late')}</span><span><b class="t-num">${sum('accepted')}</b> ${L('hand-ins accepted')}</span><span class="${over ? 'bad' : ''}"><b class="t-num">${over}</b> ${L('overdue now')}</span><small>${esc(P.label)}</small></div></div>`; }
function teamPage(m, T) {
  const P = curPeriod(), wide = T.kind === 'all' || T.kind === 'vp', all = wide && session.perfAll, w = ws();
  let ids = T.ids.filter(id => { const p = person(id); return p && (!wide || all || p.div === w || (!p.div && id === m.id)); });
  const byName = (a, b) => pname(a).localeCompare(pname(b));
  const groups = all ? [...DIVS.map(d => [d.id, d.name, ids.filter(id => person(id).div === d.id)]), ['', L('Presidency'), ids.filter(id => !person(id).div)]].filter(g => g[2].length) : [[wide ? w : (m.div || w), '', ids]];
  groups.forEach(g => g[2].sort(byName));
  // one card per person (R040): rings, the three facts in words, overdue work and the HR cycle state
  const pCard = id => { const p = person(id), f = ringFacts(id, P), hf = hrFacts(id, P), od = f.tf.overdue.length, rw = rateWords(f.tf);
    return `<a class="pf-card" href="#/performance/${id}"><div class="pf-ch">${av(id, 'av-md')}<span class="pf-who"><b>${esc(p.name)}</b><small>${esc(roleLabel(p))}</small></span>${od ? `<span class="pf-od">${stb('warning', 'danger')}${od}</span>` : ''}</div>
      <div class="pf-cb">${rings(f)}<ul class="rg-lines">${ringLine(f, 'del')}${ringLine(f, 'att')}${f.hand ? `<li class="rl-hand"><i></i><span>${rw || `<b class="t-num">${L('{n} of {of}', {n: f.hand.n, of: f.hand.of})}</b> ${L('hand-ins accepted')}`}</span></li>` : ringLine(f, 'hand')}</ul></div>
      <div class="pf-cf"><span>${L('HR cycle')}</span>${hrChip(hf)}</div></a>`; };
  const simple = perfView() === 'simple';
  const body = groups.map(([d, name, list]) => `${all ? `<h3 class="pf-lbl">${d ? bicon(div(d).icon, false) : ''}${esc(name)} <span class="n">${list.length}</span>${d ? `<a class="linkbtn" href="#/performance/div/${d}">${L('Division summary')}</a>` : ''}</h3>` : ''}${simple ? simpleTable(list, P) : `<div class="pf-cards">${list.map(pCard).join('')}</div>`}`).join('');
  const scopeSeg = wide ? `<div class="seg" role="radiogroup" aria-label="${esc(L('Scope'))}"><button class="${all ? '' : 'on'}" data-act="perf-all" data-v="0" role="radio" aria-checked="${!all}">${esc(div(w).short)}</button><button class="${all ? 'on' : ''}" data-act="perf-all" data-v="1" role="radio" aria-checked="${!!all}">${T.kind === 'vp' ? L('All reporting divisions') : L('Everyone')}</button></div>` : '';
  const sub = wide && !all ? L('{d}, {n} people', {d: div(w).name, n: ids.length}) : scopeText(m, T);
  return {crumb: pCrumb([['', L('Performance')]]), content: `<div class="page wide perf pf-team pf2 ${look() === 'comfortable' ? 'cs-canvas' : ''}"><div class="ph"><div><h1 class="t-title">${L('Team performance')}</h1><p class="sub">${esc(sub)}</p></div><div class="ph-r">${viewSeg()}${scopeSeg}${periodSel()}</div></div>
    ${!hr() ? note('info', 'info', L('HR records are not available yet'), L('Attendance and 14-day results show as Unknown until HR records exist.')) : ''}
    ${ids.length ? `${cycleBand(P, ids)}${simple ? '' : ringKey()}${body}` : emptyBox(L('Nobody in this view'), L('Nobody in your team belongs to this workspace. Choose another scope.'))}
    <p class="t-small t-mute perf-foot">${simple ? L('Sorted by name. There is no ranking and no score. Open a person to see the records behind each number.') : L('Sorted by name. Each ring is one recorded fact on its own; they are never added up, and nobody is ranked.')} ${L('Task figures count only work recorded in dwdg’ONE; a delegated task or routine run counts as completed once it is signed off.')} ${L('Private absence reasons, private notes and support details are never shown here.')}</p></div>`};
}
// One person: delivery, attendance and HR cycles. The person, their leaders, HR and the President can open it (D30).
function personPage(pid) {
  const m = me(), p = person(pid), P = curPeriod(), self = pid === m.id, f = ringFacts(pid, P), tf = f.tf, af = f.af, h = hr(), k = x => `p:${pid}:${x}:${P.k}`;
  const full = self || hrAll(m); // assessment rationale: the person, HR, and the reviewer (UXD1: reviewer rationale is restricted)
  const stat = (x, n, hint = '') => `<button class="pf-stat ${x === 'overdue' && n ? 'bad' : ''}" data-act="perf-open" data-k="${esc(k(x))}"><b class="t-num">${n}</b><span>${L(METRIC[x])}</span>${hint ? `<small>${hint}</small>` : ''}</button>`;
  const cycles = h ? h.cycles.filter(c => (c.roster || []).some(r => r.p === pid)).sort((a, b) => a.start.localeCompare(b.start)) : [];
  const R = rubric();
  const cyDetail = c => { const f2 = hrFacts(pid, {k: c.start, from: c.start, to: c.end}), a = f2.a, t = f2.k === 'final' ? total(a) : null, see = full || (a && a.scoredBy === m.id);
    const crit = f2.k === 'final' && a && a.scores ? `<div class="perf-crit">${R.criteria.map(c2 => { const s = a.scores[c2.k]; return `<span title="${esc(L(c2.desc || c2.name))}"><small>${esc(L(c2.name))}</small><b class="t-num">${s ? `${s.v}/${R.max}` : '–'}</b>${see && s && s.why ? `<em>${esc(s.why)}</em>` : ''}</span>`; }).join('')}${t != null ? `<span class="perf-tot"><small>${L('Weighted result')}</small><b class="t-num">${t}</b><em>${L('of 100, rubric {v} (proposed)', {v: esc(R.version)})}</em></span>` : ''}</div>` : '';
    const extra = f2.k === 'incomplete' ? L('Missing report or criteria stay Incomplete, never zero.') : f2.k === 'exempt' ? L('Exempt in this cycle. The reason stays with HR.') : '';
    return `<div class="perf-cy"><div class="perf-cy-h"><b>${cyLabel(c)}</b><span class="t-small t-mute">${L('Cycle {s}', {s: L(CY_ST[c.state] || c.state)})}</span>${hrChip(f2)}${a && a.version > 1 ? `<span class="tag tag-outline">${L('Corrected, version {n}', {n: a.version})}</span>` : ''}<a class="linkbtn" href="#/monitoring/${c.id}/${pid}">${L('Open in HR')}</a></div>${crit}${extra ? `<p class="t-small t-mute">${extra}</p>` : ''}</div>`; };
  // 14-day cycles as one timeline: a segment per cycle, the chosen one opens below
  const selCy = cycles.find(c => c.id === ui.pfCy) || [...cycles].reverse().find(c => ['final', 'closed'].includes(c.state)) || cycles[cycles.length - 1];
  const cyLine = cycles.length ? `<div class="pf-cyl" role="group" aria-label="${esc(L('14-day HR cycles'))}">${cycles.map(c => { const f2 = hrFacts(pid, {k: c.start, from: c.start, to: c.end}); return `<button class="pf-seg ${selCy && selCy.id === c.id ? 'on' : ''}" data-act="pf-cy" data-id="${c.id}" aria-pressed="${!!selCy && selCy.id === c.id}"><span class="t-num">${cyLabel(c)}</span>${hrChip(f2)}</button>`; }).join('')}</div>${selCy ? cyDetail(selCy) : ''}` : '';
  // weekly meetings as a strip of badges, oldest first (Absence reasons stay private)
  const regs = af ? [...af.regs].reverse() : [];
  const dots = regs.length ? `<div class="pf-dots">${regs.map(x => { const st = x.final ? x.st : 'unknown', d = ATT[st] || ATT.unknown; return `<a class="pf-dot s-${d[2]} ${x.final ? '' : 'draft'}" href="#/attendance/${x.g.id}" title="${esc(`${regTitle(x.g)}: ${L(x.final ? d[0] : 'Register not finalized yet')}`)}" aria-label="${esc(`${regTitle(x.g)}: ${L(x.final ? d[0] : 'Register not finalized yet')}`)}"><i class="st-ic" style="--m:${maskUrl(A.ui[d[1]])}"></i><small class="t-num">${dShort(regDate(x.g))}</small></a>`; }).join('')}</div>
    <div class="pf-dkey">${ATT_ORDER.filter(s => regs.some(x => (x.final ? x.st : 'unknown') === s)).map(s => `<span class="s-${ATT[s][2]}"><i class="st-ic" style="--m:${maskUrl(A.ui[ATT[s][1]])}"></i>${L(ATT[s][0])}</span>`).join('')}</div>`
    : emptyBox(L('Unknown'), L('No weekly register in this period lists {who} as expected. That is not the same as absent.', {who: esc(p.first)}));
  const back = self ? '' : `<a class="linkbtn" href="#/performance">${icon('left', 'ic-xs')} ${L('Team performance')}</a>`;
  return {crumb: pCrumb(self ? [['', L('Performance')]] : [['performance', L('Performance')], ['', p.name]]), content: `<div class="page perf pf-person pf2 ${look() === 'comfortable' ? 'cs-canvas' : ''}">${back}
    <div class="ph"><div><h1 class="t-title">${self ? L('Your performance') : esc(p.name)}</h1><p class="sub">${self ? L('Only you, your leaders, HR and the President can open this page.') : L('{who} can open this page too. So can their leaders, HR and the President.', {who: esc(p.first)})}</p></div><div class="ph-r">${periodSel()}</div></div>
    <section class="pf-hero"><div class="pf-hh">${av(pid, 'av-lg')}<div><b>${esc(p.name)}</b><small>${idl(p)} ${esc(roleText(p))}</small></div></div>
      <div class="pf-hb">${rings(f, undefined, 'lg')}<ul class="rg-lines lg">${ringLine(f, 'del', f.del && f.del.n < f.del.of ? ` <em>${L('{n} late', {n: f.del.of - f.del.n})}</em>` : '')}${ringLine(f, 'att')}${ringLine(f, 'hand', f.hand && rateWords(tf) ? `<em class="pf-rw">${rateWords(tf)}</em>` : '')}</ul></div>
      <div class="pf-stats">${stat('overdue', tf.overdue.length, L('Right now'))}${stat('signoff', tf.signoff.length, L('Not counted yet'))}${stat('blockers', tf.blockers.length, L('Right now'))}${stat('offers', tf.offers.length)}</div></section>
    ${sec(L('Task delivery'), null, ` <span class="t-small t-mute perf-sh">${esc(P.label)}</span>`)}
    ${pairBars(pid, P, k)}
    <p class="t-small t-mute">${L('Counts only work recorded in dwdg’ONE. Task counts are never a grade.')}</p>
    ${sec(L('Handed-in work'), null, ` <span class="t-small t-mute perf-sh">${esc(P.label)}</span>`)}
    ${rateTracks(tf, k)}
    <p class="t-small t-mute">${L('Ratings come from the person who gave the task, when they accept the work.')}</p>
    ${sec(L('Weekly meeting attendance'), af ? af.regs.length : null, af && af.drafts ? ` <span class="t-small t-mute perf-sh">${plural(af.drafts, '{n} register not finalized', '{n} registers not finalized')}</span>` : '')}
    ${af ? `<div class="pf-box">${dots}</div>` : emptyBox(L('Unknown'), L('HR records are not available yet.'))}
    <p class="t-small t-mute">${L('Absence reasons are private and never shown here.')}</p>
    ${sec(L('14-day HR cycles'), cycles.length || null)}
    ${cycles.length ? `<div class="pf-box">${cyLine}</div>` : emptyBox(L('Unknown'), L('{who} is not in a 14-day cycle yet. Results stay Unknown until HR finalizes one.', {who: esc(p.first)}))}
    <p class="t-small t-mute">${L('Results come from HR’s finalized cycles. The rubric is proposed and not adopted yet. Support and development details stay with HR.')}</p></div>`};
}

// ---------- division summaries (Board: division level only, D29; also for VP and President) ----------
function divFacts(d, P) {
  const ppl = active().filter(p => p.div === d).map(p => p.id), h = hr();
  const ts = db.tasks.filter(t => !t.trashed && !isSummary(t) && taskDiv(t) === d), dd = t => (t.doneAt || '').slice(0, 10);
  const hrC = {}; let cyc = null;
  if (h) { cyc = h.cycles.filter(c => ['final', 'closed'].includes(c.state) && (c.units || []).includes(d)).sort((a, b) => b.end.localeCompare(a.end))[0];
    if (cyc) ppl.forEach(id => { const f = hrFacts(id, {k: cyc.start, from: cyc.start, to: cyc.end}); if (f.cyc) hrC[f.k] = (hrC[f.k] || 0) + 1; }); }
  const regs = h ? h.registers.filter(g => g.unit === d && g.finalAt && inP(P, regDate(g))) : null, att = {};
  if (regs) regs.forEach(g => (g.expected || []).forEach(pid => { const s = attStatus(g, pid); att[s] = (att[s] || 0) + 1; }));
  const projs = db.projects.filter(p => p.div === d && p.stage === 'active'), done = ts.filter(t => isDone(t) && inP(P, dd(t)));
  return {ppl, cyc, hrC, regs, att, done, late: done.filter(t => t.due && dd(t) >= t.due), overdue: ts.filter(t => !isDone(t) && t.due && t.due < today()),
    blockers: db.blockers.filter(b => b.state === 'open' && ts.some(t => t.id === b.task)), projects: projs,
    msLate: db.milestones.filter(x => projs.some(p => p.id === x.project) && x.target && x.target < today() && !['achieved', 'cancelled'].includes(x.state))};
}
// division rings: on time and meetings attended only (hand-in ratings stay with the people involved)
const divRing = f => { const seen = Object.values(f.att).reduce((s, n) => s + n, 0) - (f.att.unknown || 0);
  return {del: f.done.length ? {n: f.done.filter(t => !t.due || (t.doneAt || '').slice(0, 10) <= t.due).length, of: f.done.length} : null, att: seen ? {n: (f.att.present || 0) + (f.att.late || 0), of: seen} : null}; };
const hrSummary = f => !f.cyc ? unknown(L('Not in a cycle yet')) : `<span class="perf-hrs">${['final', 'incomplete', 'exempt', 'none'].filter(s => f.hrC[s]).map(s => `${chip(AS[s], '')}<b class="t-num">${f.hrC[s]}</b>`).join('')}</span>`;
const attSummary = f => !f.regs ? unknown() : !f.regs.length ? unknown(L('No finalized register')) : `<span class="perf-hrs">${ATT_ORDER.filter(s => f.att[s]).map(s => `<span class="perf-mini s-${ATT[s][2]}" title="${esc(L(ATT[s][0]))}"><i class="st-ic" style="--m:${maskUrl(A.ui[ATT[s][1]])}"></i><span class="sr">${esc(L(ATT[s][0]))}</span>${f.att[s]}</span>`).join('')}</span>`;
function boardSummary() {
  const P = curPeriod();
  const simple = perfView() === 'simple', dh = [L('Division'), L('Members'), L('Finished'), L('On time'), L('Overdue now'), L('Open blockers'), L('Active projects')];
  const dtbl = `<div class="pf-tbl pf-dtbl" role="table"><div class="pf-tr pf-th" role="row">${dh.map(h => `<span role="columnheader">${h}</span>`).join('')}</div>${DIVS.map(d => { const f = divFacts(d.id, P), rf = divRing(f), c = (l, v, cls = '') => `<span role="cell" class="${cls}" data-l="${esc(l)}">${v}</span>`;
    return `<a class="pf-tr" href="#/performance/div/${d.id}" role="row"><span role="cell" class="pf-tn"><span class="pf-dvi sm">${bicon(d.icon)}</span><span><b>${esc(d.name)}</b></span></span>${c(dh[1], `<b class="t-num">${f.ppl.length}</b>`)}${c(dh[2], `<b class="t-num">${f.done.length}</b>`)}${c(dh[3], rf.del ? `<b class="t-num">${rf.del.n}</b>` : dash)}${c(dh[4], `<b class="t-num">${f.overdue.length}</b>`, f.overdue.length ? 'bad' : '')}${c(dh[5], `<b class="t-num">${f.blockers.length}</b>`)}${c(dh[6], `<b class="t-num">${f.projects.length}</b>`)}</a>`; }).join('')}</div>`;
  const cards = DIVS.map(d => { const f = divFacts(d.id, P), k = x => `d:${d.id}:${x}:${P.k}`, rf = divRing(f);
    return `<article class="pf-card pf-dcard" data-act="go" data-h="performance/div/${d.id}" tabindex="0" role="link"><div class="pf-ch"><span class="pf-dvi">${bicon(d.icon)}</span><span class="pf-who"><b>${esc(d.name)}</b><small>${plural(f.ppl.length, '{n} member', '{n} members')}</small></span></div>
      <div class="pf-cb">${rings(rf, ['del', 'att'])}<ul class="rg-lines">${ringLine(rf, 'del')}${ringLine(rf, 'att')}</ul></div>
      <div class="pf-dn" data-act="perf-stop">${[['done', 'Completed'], ['overdue', 'Overdue now'], ['blockers', 'Open blockers'], ['projects', 'Active projects']].map(([x, l]) => `<span>${numBtn(k(x), f[x].length, x, x === 'overdue' && f[x].length ? 'warn' : '')}<small>${L(l)}</small></span>`).join('')}</div>
      <div class="pf-cf"><span>${L('Latest finalized HR cycle')}</span>${hrSummary(f)}</div></article>`; }).join('');
  return {crumb: pCrumb([['', L('Performance')]]), content: `<div class="page wide perf pf2 ${look() === 'comfortable' ? 'cs-canvas' : ''}"><div class="ph"><div><h1 class="t-title">${L('Division performance')}</h1><p class="sub">${L('Division-level summaries for the Board of Supervisors')}</p></div><div class="ph-r">${viewSeg()}${periodSel()}</div></div>
    ${note('info', 'lock', L('Division level only'), L('Individual results, assessments, absence reasons and private notes stay inside each division and HR.'))}
    ${simple ? dtbl : `${ringKey(['del', 'att'])}<div class="pf-cards">${cards}</div>`}
    <p class="t-small t-mute perf-foot">${L('Counted from the same records each division uses. Unknown means nothing was recorded, not zero. There is no health score.')}</p></div>`};
}
function divDetail(d) {
  const m = me(), dv = div(d); if (!dv) return deniedPage(pCrumb([['performance', L('Performance')], ['', L('Not available')]]));
  const ok = isBoard(m) || isPres(m) || hrAll(m) || vpDivs(m).includes(d) || (m.admin) || (m.role === 'director' && m.div === d);
  if (!ok) return deniedPage(pCrumb([['performance', L('Performance')], ['', L('Not available')]]));
  const P = curPeriod(), f = divFacts(d, P), k = x => `d:${d}:${x}:${P.k}`, rf = divRing(f);
  const stat = (x, n, hint = '') => `<button class="pf-stat ${x === 'overdue' && n ? 'bad' : ''}" data-act="perf-open" data-k="${esc(k(x))}"><b class="t-num">${n}</b><span>${L(METRIC[x])}</span>${hint ? `<small>${hint}</small>` : ''}</button>`;
  return {crumb: pCrumb([['performance', L('Performance')], ['', dv.name]]), content: `<div class="page perf pf2 ${look() === 'comfortable' ? 'cs-canvas' : ''}"><a class="linkbtn" href="#/performance">${icon('left', 'ic-xs')} ${L('Performance')}</a>
    <div class="ph"><div><h1 class="t-title">${esc(dv.name)}</h1><p class="sub">${L('Division summary, {n} members', {n: f.ppl.length})}</p></div><div class="ph-r">${periodSel()}</div></div>
    <section class="pf-hero"><div class="pf-hh"><span class="pf-dvi lg">${bicon(dv.icon)}</span><div><b>${esc(dv.name)}</b><small>${esc(P.label)}</small></div></div>
      <div class="pf-hb">${rings(rf, ['del', 'att'], 'lg')}<ul class="rg-lines lg">${ringLine(rf, 'del')}${ringLine(rf, 'att')}</ul></div>
      <div class="pf-stats">${stat('done', f.done.length)}${stat('overdue', f.overdue.length, L('Right now'))}${stat('blockers', f.blockers.length, L('Right now'))}${stat('projects', f.projects.length)}${stat('msLate', f.msLate.length)}</div></section>
    ${sec(L('Latest finalized HR cycle'), null, f.cyc ? ` <span class="t-small t-mute perf-sh">${cyLabel(f.cyc)}</span>` : '')}<div class="pf-box">${hrSummary(f)}</div>
    ${sec(L('Weekly meeting attendance'), f.regs ? f.regs.length : null)}<div class="pf-box">${attSummary(f)}</div>
    <p class="t-small t-mute">${isBoard(m) ? L('Counts only. Individual records stay inside the division and HR.') : L('Open a person from Team performance to see the records behind their numbers.')}</p></div>`};
}
ACT['pf-cy'] = (el, id) => { ui.pfCy = id; render(); };
ACT['perf-view'] = el => { session.perfView = el.dataset.v; saveSession(); render(); };

// ---------- the list behind a figure (inspector) ----------
const taskLine = t => { const p = projOf(t.project); return `<div class="row" data-act="open-task" data-id="${t.id}" tabindex="0">${av(t.owner, 'av-sm')}<div class="t"><b>${esc(t.title)}</b><small>${p ? `${esc(p.name)}, ` : ''}${isDone(t) ? L('done {d}', {d: dShort((t.doneAt || '').slice(0, 10))}) : t.due ? L('due {d}', {d: dShort(t.due)}) : L('No date')}${t.due && isDone(t) ? `, ${L('due {d}', {d: dShort(t.due)})}` : ''}, ${L('created by {who}', {who: esc(first(t.createdBy))})}</small></div>${isDone(t) ? tstat('done') : t.due && t.due < today() ? state(L('Overdue'), 'warning', 'danger') : tstat(t.status)}</div>`; };
INSP['perf-list'] = x => {
  const [scope, id, metric, pk] = String(x.id).split(':'), P = periodOf(pk), m = me();
  const ok = scope === 'p' ? canSeePerson(m, id) : (isBoard(m) || isLead(m) || hrAll(m) || (m.role === 'director' && m.div === id));
  const head = inspHead(L(METRIC[metric] || 'Records'));
  if (!ok) return `${head}<div class="empty"><b>${L('This is not available to you')}</b><p>${L('It may be outside your scope.')}</p></div>`;
  const whoTxt = scope === 'p' ? pname(id) : (div(id) || {}).name;
  const top = `${head}<h2>${esc(whoTxt)}</h2><p class="t-small t-mute">${['overdue', 'blockers', 'signoff', 'projects', 'msLate'].includes(metric) ? L('Right now') : esc(P.label)}</p>`;
  let list = '';
  if (metric === 'att') { const af = attFacts(id, P); list = af && af.regs.length ? `<div class="rows">${af.regs.map(r => `<a class="row" href="#/attendance/${r.g.id}">${icon('calendar')}<div class="t"><b>${esc(regTitle(r.g))}</b><small>${r.final ? L('Finalized {d}', {d: dShort(r.g.finalAt.slice(0, 10))}) : L('Register not finalized yet')}</small></div>${chip(ATT[r.st] || ATT.unknown)}</a>`).join('')}</div><p class="t-small t-mute">${L('Absence reasons are private and never shown here.')}</p>` : emptyBox(L('Unknown'), L('No register in this period expects this person.')); }
  else if (scope === 'd' && ['done', 'overdue', 'blockers', 'projects', 'msLate'].includes(metric)) { const f = divFacts(id, P);
    if (metric === 'projects') list = f.projects.map(p => `<a class="row" href="#/projects/${p.id}">${projObj(p, 'sm')}<div class="t"><b>${esc(p.name)}</b><small>${L('Lead')}: ${esc(p.lead ? first(p.lead) : L('Not named'))}</small></div>${stage(p.stage)}</a>`).join('');
    else if (metric === 'msLate') list = f.msLate.map(ms => `<div class="row" data-act="open-ms" data-id="${ms.id}" tabindex="0">${icon('flag')}<div class="t"><b>${esc(ms.title)}</b><small>${esc((projOf(ms.project) || {}).name || '')}, ${dShort(ms.target)}</small></div>${msState(ms)}</div>`).join('');
    else if (metric === 'blockers') list = f.blockers.map(blkLine).join('');
    else list = f[metric].map(taskLine).join('');
    list = list ? `<div class="rows">${list}</div>` : emptyBox(L('None recorded'), L('Nothing in the records matches.')); }
  else if (scope === 'p') { const tf = taskFacts(id, P);
    if (metric === 'offers') list = tf.offers.map(o => `<div class="row" data-act="open-offer" data-id="${o.id}" tabindex="0">${av(o.from, 'av-sm')}<div class="t"><b>${esc(o.title)}</b><small>${L('From {who}, accepted {d}', {who: esc(first(o.from)), d: dShort(o.answeredAt.slice(0, 10))})}</small></div>${state(L('Accepted'), 'check', 'green')}</div>`).join('');
    else if (metric === 'blockers') list = tf.blockers.map(blkLine).join('');
    else list = (tf[metric] || []).map(taskLine).join('');
    list = list ? `<div class="rows">${list}</div>` : emptyBox(L('None recorded'), L('Nothing in the records matches.')); }
  return `${top}${list}<p class="t-small t-mute">${L('Read from the same records the division uses. Nothing here is typed in by hand.')}</p>`;
};
const blkLine = b => { const t = taskOf(b.task) || {}; return `<div class="row" data-act="open-task" data-id="${b.task}" tabindex="0">${av(b.owner, 'av-sm')}<div class="t"><b>${esc(b.text)}</b><small>${esc(t.title || '')}, ${L('{who} can unblock it', {who: esc(first(b.owner))})}, ${L('raised by {who} {d}', {who: esc(first(b.openedBy)), d: dShort(b.openedAt.slice(0, 10))})}</small></div>${sevTag(b.severity)}</div>`; };

// ---------- escalations: VP forwards to the President, who acknowledges, returns or resolves (blueprint §4, §12 handoff contract) ----------
// States follow the shared handoff contract: requested -> acknowledged / returned -> resolved, plus withdrawn. Who may escalate and the
// threshold are open policy (blueprint §4: "escalation policy specifies owner, threshold, reason, and resolution"); proposed: the VP.
const ESC_ST = {requested: ['Waiting for the President', 'clock', 'warn'], acknowledged: ['Acknowledged', 'check', 'ink'], returned: ['Returned for information', 'undo', 'warn'], resolved: ['Resolved', 'check', 'green'], withdrawn: ['Withdrawn', 'close', 'mute']};
function perfDb() { if (!db.perf || db.perf.v !== 1) db.perf = {v: 1, escalations: [
  {id: 'esc-hosting', kind: 'blocker', ref: {type: 'task', id: 't18'}, blocker: 'b3', div: 'mcit', title: 'Nobody knows who owns the hosting account', from: 'raka', to: 'fadhil', reason: 'The hosting account was opened by the previous batch. MCIT can’t name an owner without the President’s decision on who holds organization accounts.', neededBy: '2026-10-09', state: 'requested', reply: '', nextOwner: null, nextDate: null, resolution: '', answeredBy: null, answeredAt: null, resolvedAt: null, createdBy: 'raka', createdAt: '2026-10-05T20:15'},
  {id: 'esc-alumni', kind: 'blocker', ref: {type: 'task', id: 't7'}, blocker: 'b2', div: 'sng', title: 'No access to the alumni contact sheet', from: 'raka', to: 'fadhil', reason: 'The alumni sheet belongs to EE. SnG and EE disagree on who may share it.', neededBy: '2026-10-08', state: 'acknowledged', reply: 'Rani shares view access with the mentoring pilot leads. EE stays the owner of the sheet.', nextOwner: 'rani', nextDate: '2026-10-08', resolution: '', answeredBy: 'fadhil', answeredAt: '2026-10-06T08:05', resolvedAt: null, createdBy: 'raka', createdAt: '2026-10-05T14:00'},
]}; return db.perf; }
const escOf = id => perfDb().escalations.find(e => e.id === id);
const escUpd = (to, type, e) => { if (!to || to === session.me) return; db.updates.unshift({id: uid('n'), to, type, actor: session.me, ref: {type: 'link', id: `attention/${e.id}`, h: `attention/${e.id}`, title: e.title}, at: nowStamp(), read: false}); };
Object.assign(UPD, {'perf-esc': '{who} escalated an item to you', 'perf-esc-ack': '{who} acknowledged your escalation', 'perf-esc-ret': '{who} returned your escalation for more information', 'perf-esc-done': '{who} recorded a resolution on your escalation', 'perf-esc-next': '{who} made you responsible for the next step'});
const escTarget = e => ({type: 'link', id: e.id, name: e.title, h: `attention/${e.id}`});
const escSteps = e => { const order = ['requested', 'acknowledged', 'resolved'], i = e.state === 'returned' ? 0 : order.indexOf(e.state);
  return `<div class="perf-steps" aria-hidden="true">${order.map((s, j) => `<span class="${j < i ? 'perf-done' : j === i ? 'perf-cur' : ''}">${L(ESC_ST[s][0])}</span>`).join('')}</div>`; };
INSP['perf-esc'] = x => {
  const e = escOf(x.id), m = me(); if (!e) return `${inspHead(L('Escalation'))}<div class="empty"><b>${L('This is not available to you')}</b><p>${L('It may be outside your scope.')}</p></div>`;
  if (!(isLead(m) || isBoard(m))) return `${inspHead(L('Escalation'))}<div class="empty"><b>${L('This is not available to you')}</b><p>${L('It may be outside your scope.')}</p></div>`;
  const t = e.ref.type === 'task' ? taskOf(e.ref.id) : null, b = db.blockers.find(v => v.id === e.blocker), f = ui.form, canTo = e.to === m.id && !isBoard(m), canFrom = e.from === m.id && !isBoard(m);
  const ends = `<div class="handoff perf-ho"><div class="ends"><div class="end">${av(e.from, 'av-xs')} <b>${esc(pname(e.from))}</b><small>${L('Sent')}, ${esc(stamp(e.from, e.createdAt))}</small></div><span aria-hidden="true">${icon('right')}</span><div class="end">${av(e.to, 'av-xs')} <b>${esc(pname(e.to))}</b><small>${e.neededBy ? L('Needed by {d}', {d: dLong(e.neededBy)}) : L('No date asked')}</small></div></div>${escSteps(e)}</div>`;
  let acts = '';
  if (canTo && e.state === 'requested') acts = f === 'esc-ack' ? `<div class="quiet subform"><div class="field"><label for="esc-next">${L('Responsible for the next step')}</label><select class="input" id="esc-next">${active().filter(p => !p.div || rank(p) >= 3 || p.div === e.div).map(p => `<option value="${p.id}" ${b && b.owner === p.id ? 'selected' : ''}>${esc(p.name)}, ${esc(roleText(p))}</option>`).join('')}</select><div class="help"></div></div>
      <div class="field"><label for="esc-date">${L('Next step by')}</label><input class="input" type="date" id="esc-date" value="${e.neededBy || ''}"><div class="help"></div></div>
      <div class="field"><label for="esc-reply">${L('What happens next')}</label><textarea class="textarea" id="esc-reply" rows="3" data-autofocus></textarea><div class="help"></div></div>
      <div class="acts"><button class="btn btn-pri" data-act="perf-esc-ack" data-id="${e.id}">${icon('check')}${L('Acknowledge')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`
    : f === 'esc-ret' ? `<div class="quiet subform"><div class="field"><label for="esc-ret">${L('What information is missing?')}</label><textarea class="textarea" id="esc-ret" rows="3" data-autofocus></textarea><div class="help"></div></div><div class="acts"><button class="btn btn-pri" data-act="perf-esc-ret" data-id="${e.id}">${L('Return to {who}', {who: esc(first(e.from))})}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts"><button class="btn btn-pri" data-act="form" data-f="esc-ack">${icon('check')}${L('Acknowledge and name the next step')}</button><button class="btn" data-act="form" data-f="esc-ret">${icon('undo')}${L('Return for information')}</button></div>`;
  else if (canTo && e.state === 'acknowledged') acts = f === 'esc-res' ? `<div class="quiet subform"><div class="field"><label for="esc-res">${L('Resolution')}</label><textarea class="textarea" id="esc-res" rows="3" data-autofocus></textarea><div class="help"></div></div><div class="acts"><button class="btn btn-pri" data-act="perf-esc-res" data-id="${e.id}">${L('Record resolution')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts"><button class="btn btn-pri" data-act="form" data-f="esc-res">${icon('check')}${L('Record resolution')}</button></div>`;
  else if (canFrom && e.state === 'returned') acts = f === 'esc-again' ? `<div class="quiet subform"><div class="field"><label for="esc-again">${L('Reason, with the missing information')}</label><textarea class="textarea" id="esc-again" rows="4" data-autofocus>${esc(e.reason)}</textarea><div class="help"></div></div><div class="acts"><button class="btn btn-pri" data-act="perf-esc-again" data-id="${e.id}">${L('Send again')}</button><button class="btn btn-ghost" data-act="form">${L('Cancel')}</button></div></div>`
    : `<div class="acts"><button class="btn btn-pri" data-act="form" data-f="esc-again">${L('Add the information and send again')}</button><button class="btn btn-ghost" data-act="perf-esc-wd" data-id="${e.id}">${L('Withdraw')}</button></div>`;
  else if (canFrom && e.state === 'requested') acts = `<div class="acts"><button class="btn btn-ghost" data-act="perf-esc-wd" data-id="${e.id}">${L('Withdraw')}</button></div>`;
  return `${inspHead(L('Escalation'))}<h2>${esc(e.title)}</h2>${chip(ESC_ST[e.state])}${ends}
    <h3 class="sec-h">${L('Reason')}</h3><p class="quote">${esc(e.reason)}</p>
    ${e.reply ? `<h3 class="sec-h">${e.state === 'returned' ? L('Returned with') : L('Reply')}</h3><p class="quote">${esc(e.reply)}</p>` : ''}
    ${e.resolution ? `<h3 class="sec-h">${L('Resolution')}</h3><p class="quote">${esc(e.resolution)}</p>` : ''}
    ${meta([[L('Source'), t ? `<a data-act="open-task" data-id="${t.id}">${esc(t.title)}</a>` : `<span class="t-mute">${L('Removed')}</span>`], b ? [L('Blocker'), `${sevTag(b.severity)} ${b.state === 'open' ? L('still open') : L('resolved')}`] : null, [L('Division'), esc((div(e.div) || {}).name || '')],
      e.nextOwner ? [L('Next step'), `${who(e.nextOwner)}${e.nextDate ? ` <span class="t-num t-mute">${dShort(e.nextDate)}</span>` : ''}`] : null, e.answeredBy ? [L('Answered'), esc(stamp(e.answeredBy, e.answeredAt))] : null, [L('Created'), `${av(e.createdBy, 'av-xs')}${esc(stamp(e.createdBy, e.createdAt))}`]])}
    ${acts}<p class="t-small t-mute">${L('An escalation never changes the blocker or the task by itself. The people responsible still record what they did.')}</p>`;
};
INSP['perf-esc-new'] = x => { const b = db.blockers.find(v => v.id === x.id), m = me(); if (!b || !isVP(m)) return `${inspHead(L('Escalate'))}<div class="empty"><b>${L('This is not available to you')}</b><p>${L('Only the VP escalates to the President in this proposal.')}</p></div>`;
  const t = taskOf(b.task) || {}, pres = active().find(isPres);
  return `${inspHead(L('Escalate to the President'))}<h2>${esc(b.text)}</h2><p class="t-small t-mute">${esc(t.title || '')}</p>
    <div class="field"><label>${L('Send to')}</label><div class="perf-to">${pres ? `${av(pres.id, 'av-sm')} <b>${esc(pres.name)}</b>` : `<span class="t-mute">${L('No President named')}</span>`}</div></div>
    <div class="field"><label for="esc-reason">${L('Why it needs the President')}</label><textarea class="textarea" id="esc-reason" rows="4" data-autofocus placeholder="${esc(L('What is decided above the division, and what you already tried'))}"></textarea><div class="help"></div></div>
    <div class="field"><label for="esc-need">${L('Needed by')} <span class="opt">${L('Optional')}</span></label><input class="input" type="date" id="esc-need"><div class="help">${L('A requested date is not agreed until the President acknowledges it.')}</div></div>
    <div class="acts"><button class="btn btn-pri" data-act="perf-esc-send" data-id="${b.id}" ${pres ? '' : 'disabled'}>${L('Send to {who}', {who: esc(pres ? pres.first : '')})}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; };
const formErr = (sel, msg) => { const el = $(sel), f = el && el.closest('.field'); if (f) { f.classList.add('invalid'); const h = f.querySelector('.help'); if (h) h.textContent = msg; } if (el) el.focus(); };

// ---------- Attention view (#/attention): President, VP, Admin (blueprint §4) ----------
function crossOffers(ds) { return db.offers.filter(o => o.state === 'pending' && person(o.from) && person(o.to) && person(o.from).div !== person(o.to).div && (ds.includes(person(o.from).div) || ds.includes(person(o.to).div))); }
// Cross-division handoffs read from each file's own records when they exist (blueprint §12). Unknown shapes are skipped, never guessed.
function handoffs(ds) {
  const out = [];
  crossOffers(ds).forEach(o => out.push({kind: L('Task offer'), title: o.title, from: o.from, to: o.to, at: o.at, need: o.due, act: `data-act="open-offer" data-id="${o.id}"`, st: chip(['Waiting for an answer', 'clock', 'warn'])}));
  db.projects.forEach(p => (p.team || []).filter(x => x.state === 'invited' && person(x.id) && person(x.id).div !== p.div && (ds.includes(p.div) || ds.includes(person(x.id).div))).forEach(x => out.push({kind: L('Project invitation'), title: p.name, from: x.by, to: x.id, at: x.at, need: null, act: `data-act="go" data-h="projects/${p.id}"`, st: chip(['Not answered', 'clock', 'warn'])})));
  (db.routines || []).forEach(r => (r.invites || []).filter(x => x.state === 'invited' && person(x.id) && person(x.id).div !== r.unit && (ds.includes(r.unit) || ds.includes(person(x.id).div))).forEach(x => out.push({kind: L('Rotation invitation'), title: r.name, from: x.by, to: x.id, at: x.at, need: null, act: `data-act="go" data-h="operations/${r.id}"`, st: chip(['Not answered', 'clock', 'warn'])})));
  (db.programs || []).forEach(g => (g.partners || []).filter(x => x.state === 'invited' && (ds.includes(g.div) || ds.includes(x.div))).forEach(x => { const to = unitLeads(x.div)[0]; if (to) out.push({kind: L('Program partnership'), title: g.name, from: x.by, to, at: x.at, need: null, act: `data-act="go" data-h="programs/${g.id}"`, st: chip(['Not answered', 'clock', 'warn'])}); }));
  const h = db.hr; if (h && h.packets) h.packets.filter(k => k.state === 'requested').forEach(k => out.push({kind: L('Publication request'), title: k.title, from: k.createdBy, to: k.receiver, at: k.requestedAt || k.createdAt, need: k.neededBy, act: `data-act="go" data-h="recognition"`, st: chip(['Requested', 'clock', 'warn'])}));
  const ee = db.ee; if (ee && Array.isArray(ee.handoffs)) ee.handoffs.filter(k => k && k.state === 'requested').forEach(k => out.push({kind: L('Client handoff'), title: k.title || k.name || k.id, from: k.from || k.sender || k.createdBy, to: k.to || k.receiver, at: k.requestedAt || k.createdAt || '', need: k.neededBy || null, act: `data-act="go" data-h="engagements"`, st: chip(['Requested', 'clock', 'warn'])}));
  return out.sort((a, b) => (a.at || '').localeCompare(b.at || ''));
}
// Attention, one card per division (owner, 11 Oct: the map version was "not intuitive at all"; they chose this layout, D62).
// Each division card says in plain words what is wrong, then lists only the items that need someone to act, one sentence and
// one button each. Work waiting between divisions sits with the division that has to answer. Divisions with nothing open fold
// into one "all clear" line. Every count still comes from the records each division keeps; there is no health score.
const stb = (name, tone) => `<i class="st-ic at-b s-${tone}" style="--m:${maskUrl(A.ui[name])}"></i>`;
const ageDays = at => Math.max(0, daysBetween(String(at).slice(0, 10), today()));
const divOfP = id => (person(id) || {}).div || '';
const dShortName = d => (div(d) || {}).short || L('Presidency');
PAGES.attention = r => {
  const m = me(); if (!canAttn(m)) return deniedPage(pCrumb([['', L('Attention')]]));
  if (r.id && escOf(r.id) && ui.perfOpened !== r.id) { ui.perfOpened = r.id; ui.insp = {type: 'perf-esc', id: r.id}; } if (!r.id) ui.perfOpened = null;
  const ds = attnDivs(m), pDiv = id => (projOf(id) || {}).div, sevN = {high: 0, medium: 1, low: 2};
  const age = at => { const n = ageDays(at); return n ? plural(n, '{n} day ago', '{n} days ago') : L('today'); };
  const week = addDays(today(), 7), live = p => p && !ENDED.includes(p.stage);
  const escs = perfDb().escalations.filter(e => (e.to === m.id || e.from === m.id || isPres(m) || m.admin) && ['requested', 'returned', 'acknowledged'].includes(e.state));
  const hos = handoffs(ds);
  // a row: who has to act, one plain sentence, what it is about, and one button
  const row = (o) => `<div class="row at-r" data-act="${o.act}" ${o.attrs || ''} tabindex="0">${stb(o.ic, o.tone)}<div class="t"><b>${o.text}</b><small>${o.sub}</small></div>${o.right || ''}${o.btn || ''}</div>`;
  const openBtn = (act, attrs, label = L('Open'), pri = false) => `<span class="at-ua" data-act="perf-stop"><button class="btn btn-sm ${pri ? 'btn-pri' : ''}" data-act="${act}" ${attrs}>${label}</button></span>`;
  const mine = [];
  const items = d => { const out = [];
    escs.filter(e => e.div === d).forEach(e => { const toMe = e.to === m.id && !isBoard(m), fromMe = e.from === m.id;
      const f = toMe && e.state === 'requested' ? 'esc-ack' : toMe && e.state === 'acknowledged' ? 'esc-res' : fromMe && e.state === 'returned' ? 'esc-again' : '';
      const o = {k: 0, ic: 'escalate', tone: 'warn', act: 'perf-esc-open', attrs: `data-id="${e.id}"`,
        text: e.state === 'returned' ? L('{who} asked for more information: {t}', {who: esc(first(e.to)), t: esc(e.title)}) : e.state === 'acknowledged' ? L('{who} is working on it: {t}', {who: esc(first(e.nextOwner || e.to)), t: esc(e.title)}) : e.to === m.id ? L('Escalated to you: {t}', {t: esc(e.title)}) : L('Escalated to {who}: {t}', {who: esc(first(e.to)), t: esc(e.title)}),
        sub: `${L('From {who}', {who: esc(first(e.from))})}, ${age(e.createdAt)}${e.neededBy && e.state !== 'acknowledged' ? `, ${L('needed by {d}', {d: dShort(e.neededBy)})}` : e.nextDate ? `, ${L('next step by {d}', {d: dShort(e.nextDate)})}` : ''}`,
        btn: f ? `<span class="at-ua" data-act="perf-stop"><button class="btn btn-sm btn-pri" data-act="at-esc" data-id="${e.id}" data-f="${f}">${f === 'esc-ack' ? L('Acknowledge') : f === 'esc-res' ? L('Record resolution') : L('Add information')}</button></span>` : openBtn('perf-esc-open', `data-id="${e.id}"`)};
      (f ? mine : out).push(o); });
    db.decisions.filter(x => x.state === 'awaiting' && pDiv(x.project) === d).forEach(x => { const p = projOf(x.project), me1 = x.approver === m.id;
      const o = {k: 1, ic: 'clock', tone: 'warn', act: 'open-decision', attrs: `data-id="${x.id}"`, text: me1 ? L('Your decision: {q}', {q: esc(x.question)}) : L('Waiting for {who} to decide: {q}', {who: esc(first(x.approver)), q: esc(x.question)}),
        sub: `${p ? `${esc(p.name)}, ` : ''}${L('asked by {who}', {who: esc(first(x.createdBy))})} ${age(x.createdAt)}`, btn: me1 ? openBtn('open-decision', `data-id="${x.id}"`, L('Decide'), true) : openBtn('open-decision', `data-id="${x.id}"`)};
      (me1 ? mine : out).push(o); });
    db.blockers.filter(b => b.state === 'open' && taskDiv(taskOf(b.task) || {}) === d).sort((a, b) => sevN[a.severity] - sevN[b.severity] || a.openedAt.localeCompare(b.openedAt)).forEach(b => { const t = taskOf(b.task) || {}, n = ageDays(b.openedAt), escd = perfDb().escalations.some(e => e.blocker === b.id && !['withdrawn', 'resolved'].includes(e.state));
      out.push({k: 2, ic: 'warning', tone: b.severity === 'high' ? 'danger' : 'warn', act: 'open-task', attrs: `data-id="${b.task}"`, text: `${n ? L('Stuck for {n}:', {n: plural(n, '{n} day', '{n} days')}) : L('Stuck since today:')} ${esc(b.text)}`,
        sub: `${esc(t.title || '')}. ${L('{who} can unblock it', {who: esc(first(b.owner))})}${escd ? `. ${L('Already escalated')}` : ''}`, right: sevWord(b.severity),
        btn: isVP(m) && !escd ? openBtn('perf-esc-new', `data-id="${b.id}"`, L('Escalate')) : openBtn('open-task', `data-id="${b.task}"`)}); });
    db.milestones.filter(x => { const p = projOf(x.project); return live(p) && p.div === d && msLate(x); }).sort((a, b) => a.target.localeCompare(b.target)).forEach(x => { const p = projOf(x.project);
      out.push({k: 3, ic: 'flag', tone: 'danger', act: 'open-ms', attrs: `data-id="${x.id}"`, text: L('Overdue since {d}: {t}', {d: dShort(x.target), t: esc(x.title)}), sub: `${esc(p.name)}, ${L('owner {who}', {who: esc(first(x.owner))})}`, btn: openBtn('open-ms', `data-id="${x.id}"`)}); });
    // handoffs live with the division that has to answer; one that leaves this view's divisions also shows on the sender's card
    hos.filter(x => divOfP(x.to) === d || (divOfP(x.from) === d && !ds.includes(divOfP(x.to)))).forEach(x => { const inbound = divOfP(x.to) === d;
      out.push({k: 4, ic: 'clock', tone: 'ink2', act: x.act.match(/data-act="([^"]+)"/)[1], attrs: x.act.replace(/data-act="[^"]+"\s*/, ''),
        text: inbound ? L('{who} has not answered {d} yet: {t}', {who: esc(first(x.to)), d: esc(dShortName(divOfP(x.from))), t: esc(x.title)}) : L('Waiting for {d} to answer: {t}', {d: esc(dShortName(divOfP(x.to))), t: esc(x.title)}),
        sub: `${esc(x.kind)} ${L('from {a} to {b}', {a: esc(first(x.from)), b: esc(first(x.to))})}, ${x.at ? age(x.at) : ''}`, btn: `<span class="at-ua" data-act="perf-stop"><button class="btn btn-sm" ${x.act}>${L('Open')}</button></span>`}); });
    db.milestones.filter(x => { const p = projOf(x.project); return live(p) && p.div === d && !msLate(x) && !['achieved', 'cancelled'].includes(x.state) && x.target && x.target <= week; }).sort((a, b) => a.target.localeCompare(b.target)).forEach(x => { const p = projOf(x.project);
      out.push({k: 5, ic: 'calendar', tone: 'mute', act: 'open-ms', attrs: `data-id="${x.id}"`, text: x.target === today() ? L('Due today: {t}', {t: esc(x.title)}) : L('Due {d}: {t}', {d: dShort(x.target), t: esc(x.title)}), sub: `${esc(p.name)}, ${L('owner {who}', {who: esc(first(x.owner))})}`}); });
    return out; };
  // the plain status line under each division name
  const status = list => { const c = k => list.filter(x => x.k === k).length, parts = [], red = s => `<em>${esc(s)}</em>`;
    if (c(0)) parts.push(esc(plural(c(0), '{n} escalation', '{n} escalations'))); if (c(1)) parts.push(esc(plural(c(1), '{n} decision waiting', '{n} decisions waiting')));
    if (c(2)) parts.push(red(plural(c(2), '{n} blocker', '{n} blockers'))); if (c(3)) parts.push(red(plural(c(3), '{n} overdue milestone', '{n} overdue milestones')));
    if (c(4)) parts.push(esc(plural(c(4), '{n} handoff not answered', '{n} handoffs not answered'))); if (c(5)) parts.push(esc(plural(c(5), '{n} due this week', '{n} due this week')));
    return parts.join(', '); };
  const urgent = list => list.some(x => x.k <= 3);
  const cards = ds.map(d => ({d, list: items(d)})), open = cards.filter(c => c.list.length).sort((a, b) => urgent(b.list) - urgent(a.list) || b.list.filter(x => x.k <= 3).length - a.list.filter(x => x.k <= 3).length), clear = cards.filter(c => !c.list.length);
  const card = ({d, list}) => { const dv = div(d), all = ui.atAll && ui.atAll[d], shown = all ? list : list.slice(0, 5);
    return `<section class="at-dc" id="at-${d}"><header class="at-dch"><span class="at-ti">${bicon(dv.icon, false)}</span><div><h2>${esc(dv.name)}</h2><p>${status(list)}</p></div></header>
      <div class="at-rows">${shown.map(row).join('')}${list.length > 5 ? `<button class="mw-all" data-act="at-more" data-id="${d}">${all ? L('Show fewer') : L('Show all {n}', {n: list.length})}</button>` : ''}</div></section>`; };
  const sub = isPres(m) ? L('Everything that needs the presidency across all six divisions') : isVP(m) ? L('Your reporting divisions') : m.admin ? L('All divisions (Admin)') : L('{d}, and work waiting between it and other divisions', {d: div(m.div).name});
  return {crumb: pCrumb([['', L('Attention')]]), content: `<div class="page perf pf-attn at3 ${look() === 'comfortable' ? 'cs-canvas' : ''}"><div class="ph"><div><h1 class="t-title">${L('Attention')}</h1><p class="sub">${esc(sub)}</p></div></div>
    ${mine.length ? `<section class="at-dc at-mine"><header class="at-dch"><span class="at-ti">${av(m.id, 'av-sm')}</span><div><h2>${L('Needs you')}</h2><p class="warn">${plural(mine.length, '{n} thing only you can do', '{n} things only you can do')}</p></div></header><div class="at-rows">${mine.map(row).join('')}</div></section>` : ''}
    ${open.map(card).join('')}
    ${clear.length ? `<p class="at-clear">${stb('check', 'green')}<span>${clear.length === ds.length ? L('Every division is clear. Nothing is stuck, waiting or overdue.') : L('All clear: {list}', {list: clear.map(c => esc(div(c.d).short)).join(', ')})}</span></p>` : ''}
    <p class="t-small t-mute perf-foot">${L('Counted from the records each division keeps. There is no health score.')}</p></div>`};
};
Object.assign(ACT, {
  'at-more': (el, id) => { ui.atAll = ui.atAll || {}; ui.atAll[id] = !ui.atAll[id]; render(); },
  // open an escalation straight at the step the row offers (the inspector's own forms do the work)
  'at-esc': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'perf-esc', id}; ui.form = el.dataset.f; render(); setTimeout(() => { const f = $('.insp [data-autofocus]'); if (f) f.focus(); }, 0); },
});

// ---------- Board landing (#/oversight): read-only view of every division (D29, access_board_scope, S081) ----------
PAGES.oversight = () => {
  const m = me(); if (!isBoard(m) && !isLead(m)) return deniedPage(pCrumb([['', L('Oversight')]]));
  const soon = addDays(today(), 30);
  const rows = DIVS.map(d => { const ps = db.projects.filter(p => p.div === d.id && !ENDED.includes(p.stage) && p.stage !== 'draft'), dir = active().find(p => p.div === d.id && p.role === 'director'), nx = ps.map(nextMs).filter(Boolean).sort((a, b) => (a.target || '9').localeCompare(b.target || '9'))[0];
    const late = db.milestones.filter(x => ps.some(p => p.id === x.project) && msLate(x)).length, bk = db.blockers.filter(b => b.state === 'open' && taskDiv(taskOf(b.task) || {}) === d.id).length, dc = db.decisions.filter(x => x.state === 'awaiting' && (projOf(x.project) || {}).div === d.id).length;
    return `<tr data-act="perf-wsgo" data-id="${d.id}" tabindex="0" role="link"><td><span class="perf-pc">${bicon(d.icon)}<b>${esc(d.name)}</b></span></td><td>${dir ? `<span class="perf-pc">${av(dir.id, 'av-xs')}${esc(first(dir.id))}</span>` : `<span class="t-mute">${L('Not named')}</span>`}</td><td class="num t-num">${ps.length}</td><td>${nx ? `${esc(nx.title)} <small class="t-num t-mute">${nx.target ? dShort(nx.target) : ''}</small>` : `<span class="t-mute">${L('None')}</span>`}</td><td class="num">${late ? state(String(late), 'warning', 'danger') : '<span class="t-mute">0</span>'}</td><td class="num">${bk ? state(String(bk), 'warning', 'danger') : '<span class="t-mute">0</span>'}</td><td class="num t-num">${dc}</td></tr>`; }).join('');
  const blk = db.blockers.filter(b => b.state === 'open');
  const decs = db.decisions.filter(d => d.state === 'awaiting' || (d.decidedAt && daysBetween(d.decidedAt.slice(0, 10), today()) <= 30)).sort((a, b) => (b.decidedAt || b.createdAt).localeCompare(a.decidedAt || a.createdAt));
  const ms = db.milestones.filter(x => { const p = projOf(x.project); return p && !ENDED.includes(p.stage) && !['achieved', 'cancelled'].includes(x.state) && x.target && x.target <= soon; }).sort((a, b) => a.target.localeCompare(b.target));
  const DST = {awaiting: ['Waiting for decision', 'clock', 'warn'], approved: ['Approved', 'check', 'green'], rejected: ['Rejected', 'close', 'mute'], hold: ['On hold', 'hand', 'hold']};
  return {crumb: pCrumb([['', L('Oversight')]]), content: `<div class="page wide perf"><div class="ph"><div><h1 class="t-title">${L('Oversight')}</h1><p class="sub">${isBoard(m) ? L('Board of Supervisors, read-only') : L('This is what Board of Supervisors accounts see')}</p></div></div>
    ${note('info', 'shield', L('Read-only account'), L('Board accounts open every division’s projects, milestones, blockers and decisions. They can’t create, edit, approve or receive task offers, and never appear in pickers. Individual HR assessments, private notes, candidate data and restricted finance or legal fields stay hidden.'))}
    ${sec(L('Divisions'), DIVS.length)}<div class="perf-tblwrap perf-board"><table class="tbl perf-tbl"><thead><tr><th>${L('Division')}</th><th>${L('Director')}</th><th class="num">${L('Open projects')}</th><th>${L('Next milestone')}</th><th class="num">${L('Overdue milestones')}</th><th class="num">${L('Open blockers')}</th><th class="num">${L('Decisions waiting')}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="t-small t-mute">${L('Open a division to read its projects, Operations, Resources and Changes.')} <a href="#/performance">${L('Division performance')}</a></p>
    ${sec(L('Open blockers'), blk.length)}${blk.length ? `<div class="rows perf-rows">${blk.map(blkLine).join('')}</div>` : `<div class="empty-inline">${L('No open blockers.')}</div>`}
    ${sec(L('Decisions'), decs.length, ` <span class="t-small t-mute perf-sh">${L('Waiting, and decided in the last 30 days')}</span>`)}${decs.length ? `<div class="rows perf-rows">${decs.map(d => { const p = projOf(d.project); return `<div class="row" data-act="open-decision" data-id="${d.id}" tabindex="0">${av(d.approver, 'av-sm')}<div class="t"><b>${esc(d.question)}</b><small>${p ? `${esc(p.name)}, ${esc(div(p.div).short)}, ` : ''}${L('{who} decides', {who: esc(first(d.approver))})}</small></div>${chip(DST[d.state] || DST.awaiting)}</div>`; }).join('')}</div>` : `<div class="empty-inline">${L('No decisions in this period.')}</div>`}
    ${sec(L('Milestones in the next 30 days'), ms.length)}${ms.length ? `<div class="rows perf-rows">${ms.map(x => { const p = projOf(x.project); return `<div class="row" data-act="open-ms" data-id="${x.id}" tabindex="0">${projObj(p, 'sm')}<div class="t"><b>${esc(x.title)}</b><small>${esc(p.name)}, ${esc(div(p.div).short)}</small></div><span class="t-num t-mute perf-date">${dShort(x.target)}</span>${msState(x)}</div>`; }).join('')}</div>` : `<div class="empty-inline">${L('No milestones due.')}</div>`}
    <p class="t-small t-mute perf-foot">${L('Built from the same records each division uses. Nothing here is typed in for the Board, and there is no health score.')}</p></div>`};
};
// The Board lands on Oversight instead of My Work (they have no tasks or offers, D29).
{ const w0 = PAGES.work; PAGES.work = r => isBoard(me()) ? PAGES.oversight(r) : w0(r); }
{ const p0 = ACT.pick; ACT.pick = (el, id, e) => { p0(el, id, e); if (isBoard(person(id))) go('oversight'); }; }

// ---------- navigation (design-navigation: capabilities below core destinations) ----------
(CAPS['*'] = CAPS['*'] || []).push(['attention', 'flag', 'Attention', p => canAttn(p)], ['oversight', 'shield', 'Oversight', p => isBoard(p)], ['performance', 'chart', 'Performance', p => !!p]);

// ---------- actions ----------
const busy = () => { ui.form = null; };
Object.assign(ACT, {
  'perf-open': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'perf-list', id: el.dataset.k}; ui.form = null; render(); },
  'perf-stop': (el, id, e) => { if (e) e.stopPropagation(); },
  'perf-all': (el, id, e) => { session.perfAll = el.dataset.v === '1'; saveSession(); render(); },
  'perf-attdiv': el => { session.attDiv = el.dataset.id || ''; saveSession(); render(); },
  'perf-jump': el => { const t = document.getElementById(el.dataset.id); if (t) t.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); },
  'perf-wsgo': (el, id) => { session.ws = id; saveSession(); go('projects'); },
  'perf-esc-open': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'perf-esc', id}; ui.form = null; render(); },
  'perf-esc-new': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'perf-esc-new', id}; ui.form = null; render(); setTimeout(() => { const f = $('#esc-reason'); if (f) f.focus(); }, 0); },
  'perf-esc-send': (el, id) => { const m = me(), b = db.blockers.find(v => v.id === id), t = taskOf(b.task) || {}, pres = active().find(isPres), reason = ($('#esc-reason') || {}).value.trim();
    if (!isVP(m)) return; if (!reason) return formErr('#esc-reason', L('Say why this needs the President.'));
    const e = {id: uid('esc-'), kind: 'blocker', ref: {type: 'task', id: b.task}, blocker: b.id, div: taskDiv(t), title: b.text, from: m.id, to: pres.id, reason, neededBy: ($('#esc-need') || {}).value || null, state: 'requested', reply: '', nextOwner: null, nextDate: null, resolution: '', answeredBy: null, answeredAt: null, resolvedAt: null, createdBy: m.id, createdAt: nowStamp()};
    perfDb().escalations.push(e); escUpd(pres.id, 'perf-esc', e); logChange(e.div, 'escalated to the President', escTarget(e)); ui.insp = {type: 'perf-esc', id: e.id}; busy(); save(); render();
    toast(L('Sent to {who}. Nothing changes until they answer.', {who: first(pres.id)}), () => { const x = perfDb(); x.escalations = x.escalations.filter(v => v !== e); db.updates = db.updates.filter(u => !(u.ref && u.ref.h === `attention/${e.id}`)); logChange(e.div, 'withdrew an escalation', escTarget(e)); ui.insp = null; rerender(); }); },
  'perf-esc-ack': (el, id) => { const e = escOf(id), m = me(); if (e.to !== m.id || e.state !== 'requested') return; const next = $('#esc-next').value, reply = $('#esc-reply').value.trim();
    if (!next) return formErr('#esc-next', L('Choose who takes the next step.')); if (!reply) return formErr('#esc-reply', L('Say what happens next.'));
    const prev = {...e}; Object.assign(e, {state: 'acknowledged', nextOwner: next, nextDate: $('#esc-date').value || null, reply, answeredBy: m.id, answeredAt: nowStamp()});
    escUpd(e.from, 'perf-esc-ack', e); escUpd(next, 'perf-esc-next', e); logChange(e.div, 'acknowledged an escalation', escTarget(e)); busy(); save(); render();
    toast(L('Acknowledged. {who} was told.', {who: first(e.from)}), () => { Object.assign(e, prev); logChange(e.div, 'undid acknowledging an escalation', escTarget(e)); rerender(); }); },
  'perf-esc-ret': (el, id) => { const e = escOf(id), m = me(), why = $('#esc-ret').value.trim(); if (e.to !== m.id) return; if (!why) return formErr('#esc-ret', L('Say what information is missing.'));
    const prev = {...e}; Object.assign(e, {state: 'returned', reply: why, answeredBy: m.id, answeredAt: nowStamp()}); escUpd(e.from, 'perf-esc-ret', e); logChange(e.div, 'returned an escalation', escTarget(e)); busy(); save(); render();
    toast(L('Returned to {who}', {who: first(e.from)}), () => { Object.assign(e, prev); logChange(e.div, 'undid returning an escalation', escTarget(e)); rerender(); }); },
  'perf-esc-res': (el, id) => { const e = escOf(id), m = me(), res = $('#esc-res').value.trim(); if (e.to !== m.id) return; if (!res) return formErr('#esc-res', L('Write what was resolved.'));
    const prev = {...e}; Object.assign(e, {state: 'resolved', resolution: res, resolvedAt: nowStamp()}); escUpd(e.from, 'perf-esc-done', e); logChange(e.div, 'recorded a resolution on an escalation', escTarget(e)); busy(); save(); render();
    toast(L('Resolution recorded'), () => { Object.assign(e, prev); logChange(e.div, 'undid a resolution on an escalation', escTarget(e)); rerender(); }); },
  'perf-esc-again': (el, id) => { const e = escOf(id), m = me(), why = $('#esc-again').value.trim(); if (e.from !== m.id) return; if (!why) return formErr('#esc-again', L('Say why this needs the President.'));
    const prev = {...e}; Object.assign(e, {state: 'requested', reason: why}); escUpd(e.to, 'perf-esc', e); logChange(e.div, 'sent an escalation again', escTarget(e)); busy(); save(); render();
    toast(L('Sent to {who} again', {who: first(e.to)}), () => { Object.assign(e, prev); rerender(); }); },
  'perf-esc-wd': (el, id) => { const e = escOf(id), m = me(); if (e.from !== m.id) return; const prev = {...e}; e.state = 'withdrawn'; logChange(e.div, 'withdrew an escalation', escTarget(e)); save(); render();
    toast(L('Escalation withdrawn'), () => { Object.assign(e, prev); logChange(e.div, 'restored an escalation', escTarget(e)); rerender(); }); },
});
ON_CHANGE['perf-period'] = el => { session.perfPeriod = el.value; saveSession(); render(); };

// ---------- Board accounts are read-only everywhere (W101 acceptance 1: every write, approval and offer route is denied, 0 changes) ----------
// The UI hides most writes through each screen's own permission checks; this guard catches the rest with one neutral denial. IAM enforces
// the same rule on the server (access_action_matrix).
const BOARD_OK = new Set(['go', 'set-ws', 'close-layer', 'close-insp', 'palette', 'lang', 'theme', 'signout', 'sh-back', 'sh-fwd', 'view', 'range', 'show-done', 'upd-filter', 'upd-allread', 'chg-type', 'chg-more', 'pgroup', 'pweek', 'link-open', 'undo', 'sh-undo', 'sh-redo']);
const BOARD_DENY = /(^new|-new|^add|-add|save|create|delete|-del$|^del|remove|trash|send|submit|approve|decide|accept|decline|answer|toggle|status|edit|assign|invite|finali|record|resolve|raise|archive|restore|move|unlink|publish|react|^icon|pause|skip|withdraw|return|sign|^ack|-ack|correct|rsvp|reply|join|leave|request|composer|find-with|^form$|reset|drop|upload|achieve|escalat|grade|score|nominate|consent|void|issue|^pay|pick|^ms-|^wbs-|^rt-|^qc-|reorder|^fix|^dep|offer-|review-|^sev$|gcal|approve|^esc|^perf-esc-(send|ack|ret|res|again|wd))/;
const boardBlocks = el => { const a = el.dataset.act; if (!a) return false; if (a === 'menu') return el.dataset.menu === 'new'; if (BOARD_OK.has(a) || /^open-/.test(a)) return false; if (/^perf-/.test(a)) return BOARD_DENY.test(a); return BOARD_DENY.test(a); };
document.addEventListener('click', e => { const m = me(); if (!isBoard(m)) return; const el = e.target.closest('[data-act]'); if (!el || !boardBlocks(el)) return; e.preventDefault(); e.stopImmediatePropagation(); roOnly(); }, true);
document.addEventListener('submit', e => { if (!isBoard(me())) return; e.preventDefault(); e.stopImmediatePropagation(); roOnly(); }, true);
document.addEventListener('dragstart', e => { if (!isBoard(me())) return; e.preventDefault(); e.stopImmediatePropagation(); }, true);
window.addEventListener('pointerdown', e => { if (!isBoard(me())) return; if (e.target.closest && e.target.closest('.gantt, .cal-b, .cal-col, .g-dia, [data-drag], [data-rdrag], [data-wrow], [data-wid]')) { e.stopPropagation(); } }, true);
ON_KEY.unshift((e, typing) => { if (typing || !isBoard(me()) || e.ctrlKey || e.metaKey || e.altKey) return false; const k = e.key.toLowerCase(), pg = route().page;
  if (k === 'n' || (k === 'm' && pg !== 'schedule') || (k === 'c' && pg === 'schedule')) { e.preventDefault(); roOnly(); return true; } return false; });
// Typing into a field is allowed (search and filters); the guard above stops anything that would save it.

// ---------- Indonesian (formal "Anda", D7) ----------
Object.assign(window.ID_DICT, {
  'Board of Supervisors': 'Dewan Pengawas', 'Board accounts are read-only. Nothing was changed.': 'Akun Dewan Pengawas hanya dapat membaca. Tidak ada yang diubah.',
  'Performance': 'Kinerja', 'Team performance': 'Kinerja tim', 'Your performance': 'Kinerja Anda', 'Division performance': 'Kinerja divisi', 'Attention': 'Perhatian', 'Oversight': 'Pengawasan',
  'Not available': 'Tidak tersedia', 'Your branch: {b}, {n} people': 'Cabang Anda: {b}, {n} orang', 'Your team in {d}, {n} people': 'Tim Anda di {d}, {n} orang', 'Your reporting divisions': 'Divisi yang melapor kepada Anda',
  'Everyone in DWDG UII': 'Semua anggota DWDG UII', 'Presidency': 'Presidium', 'Division summary': 'Ringkasan divisi', '{d}, {n} people': '{d}, {n} orang', 'All reporting divisions': 'Semua divisi yang melapor', 'Everyone': 'Semua orang', 'Scope': 'Cakupan',
  'Person': 'Orang', 'HR cycle': 'Siklus HR', 'Attendance': 'Kehadiran', 'Completed': 'Selesai', 'On or after due': 'Pada atau setelah tenggat', 'Overdue now': 'Terlambat sekarang', 'Open blockers': 'Hambatan terbuka', 'Sent back': 'Dikembalikan', 'Offers accepted': 'Tawaran diterima',
  'Completed on or after the due date': 'Selesai pada atau setelah tenggat', 'Sent back after review': 'Dikembalikan setelah ditinjau', 'Waiting for sign-off': 'Menunggu pengesahan', 'Weekly meeting attendance': 'Kehadiran rapat mingguan', '14-day HR cycles': 'Siklus HR 14 hari', 'Active projects': 'Proyek aktif', 'Overdue milestones': 'Milestone terlambat', 'Records': 'Catatan',
  'HR records are not available yet': 'Catatan HR belum tersedia', 'Attendance and 14-day results show as Unknown until HR records exist.': 'Kehadiran dan hasil 14 hari tampil sebagai Tidak diketahui sampai catatan HR ada.',
  'Nobody in this view': 'Tidak ada orang di tampilan ini', 'Nobody in your team belongs to this workspace. Choose another scope.': 'Tidak ada anggota tim Anda di ruang kerja ini. Pilih cakupan lain.',
  'Sorted by name. There is no ranking and no score made from task counts. Every number opens the records it counts.': 'Diurutkan menurut nama. Tidak ada peringkat dan tidak ada skor dari jumlah tugas. Setiap angka membuka catatan yang dihitungnya.',
  'Task figures count only work recorded in dwdg’ONE; a delegated task or routine run counts as completed once it is signed off.': 'Angka tugas hanya menghitung pekerjaan yang tercatat di dwdg’ONE; tugas delegasi atau pelaksanaan rutinitas dihitung selesai setelah disahkan.',
  'Private absence reasons, private notes and support details are never shown here.': 'Alasan ketidakhadiran pribadi, catatan pribadi, dan detail dukungan tidak pernah ditampilkan di sini.',
  'Period': 'Periode', 'This cycle, {d}': 'Siklus ini, {d}', 'All cycles since {d}': 'Semua siklus sejak {d}', 'Unknown': 'Tidak diketahui',
  'Present': 'Hadir', 'Late': 'Terlambat', 'Excused absence': 'Izin', 'Unexcused absence': 'Tanpa keterangan', 'Not required': 'Tidak diwajibkan', 'Not yet recorded': 'Belum dicatat',
  'Finalized': 'Difinalkan', 'Incomplete': 'Belum lengkap', 'Exempt': 'Dikecualikan', 'Not submitted': 'Belum dikirim', 'Submitted': 'Dikirim', 'Clarification asked': 'Klarifikasi diminta', 'Being scored': 'Sedang dinilai', 'Scored, not final': 'Dinilai, belum final',
  'Planned': 'Direncanakan', 'Open': 'Terbuka', 'In review': 'Ditinjau', 'Closed': 'Ditutup', 'Cycle {s}': 'Siklus {s}', 'Corrected, version {n}': 'Dikoreksi, versi {n}', 'Open in HR': 'Buka di HR', 'Weighted result': 'Hasil berbobot', 'of 100, rubric {v} (proposed)': 'dari 100, rubrik {v} (usulan)',
  'Missing report or criteria stay Incomplete, never zero.': 'Laporan atau kriteria yang belum ada tetap Belum lengkap, tidak pernah nol.', 'Exempt in this cycle. The reason stays with HR.': 'Dikecualikan pada siklus ini. Alasannya tetap di HR.',
  'Finalized by {who}': 'Difinalkan oleh {who}', 'Register not finalized yet': 'Daftar hadir belum difinalkan', 'Register not finalized': 'Daftar hadir belum final', 'Weekly meeting': 'Rapat mingguan', 'No weekly register in this period lists {who} as expected. That is not the same as absent.': 'Tidak ada daftar hadir mingguan pada periode ini yang mencantumkan {who}. Itu tidak sama dengan tidak hadir.',
  'Only you, your leaders, HR and the President can open this page.': 'Hanya Anda, pimpinan Anda, HR, dan Presiden yang dapat membuka halaman ini.', '{who} can open this page too. So can their leaders, HR and the President.': '{who} juga dapat membuka halaman ini, begitu pula pimpinannya, HR, dan Presiden.',
  'Task delivery': 'Penyelesaian tugas', 'Right now, any period': 'Saat ini, periode apa pun', 'Not counted as completed yet': 'Belum dihitung selesai', 'Right now': 'Saat ini', 'Counts only work recorded in dwdg’ONE. Task counts are never a grade.': 'Hanya menghitung pekerjaan yang tercatat di dwdg’ONE. Jumlah tugas tidak pernah menjadi nilai.',
  '{n} register not finalized': '{n} daftar hadir belum difinalkan', '{n} registers not finalized': '{n} daftar hadir belum difinalkan', 'HR records are not available yet.': 'Catatan HR belum tersedia.', 'Absence reasons are private and never shown here.': 'Alasan ketidakhadiran bersifat pribadi dan tidak pernah ditampilkan di sini.',
  '{who} is not in a 14-day cycle yet. Results stay Unknown until HR finalizes one.': '{who} belum masuk siklus 14 hari. Hasil tetap Tidak diketahui sampai HR memfinalkan satu siklus.',
  'Results come from HR’s finalized cycles. The rubric is proposed and not adopted yet. Support and development details stay with HR.': 'Hasil berasal dari siklus HR yang sudah difinalkan. Rubrik masih usulan dan belum diadopsi. Detail dukungan dan pengembangan tetap di HR.',
  'Not in a cycle yet': 'Belum masuk siklus', 'No finalized register': 'Belum ada daftar hadir final', 'Division-level summaries for the Board of Supervisors': 'Ringkasan tingkat divisi untuk Dewan Pengawas', 'Division level only': 'Hanya tingkat divisi',
  'Individual results, assessments, absence reasons and private notes stay inside each division and HR.': 'Hasil perorangan, penilaian, alasan ketidakhadiran, dan catatan pribadi tetap di dalam divisi dan HR.',
  'Division': 'Divisi', 'Members': 'Anggota', 'Latest finalized HR cycle': 'Siklus HR terakhir yang final', 'Attendance recorded': 'Kehadiran tercatat',
  'Counted from the same records each division uses. Unknown means nothing was recorded, not zero. There is no health score.': 'Dihitung dari catatan yang sama yang dipakai setiap divisi. Tidak diketahui berarti belum ada catatan, bukan nol. Tidak ada skor kesehatan.',
  'Division summary, {n} members': 'Ringkasan divisi, {n} anggota', 'Work': 'Pekerjaan', 'Counts only. Individual records stay inside the division and HR.': 'Hanya jumlah. Catatan perorangan tetap di dalam divisi dan HR.', 'Open a person from Team performance to see the records behind their numbers.': 'Buka seseorang dari Kinerja tim untuk melihat catatan di balik angkanya.',
  'done {d}': 'selesai {d}', 'due {d}': 'tenggat {d}', 'created by {who}': 'dibuat oleh {who}', 'This is not available to you': 'Ini tidak tersedia untuk Anda', 'It may be outside your scope.': 'Mungkin berada di luar cakupan Anda.',
  'Finalized {d}': 'Difinalkan {d}', 'No register in this period expects this person.': 'Tidak ada daftar hadir pada periode ini yang mencantumkan orang ini.', 'Lead': 'Pimpinan', 'None recorded': 'Tidak ada catatan', 'Nothing in the records matches.': 'Tidak ada catatan yang cocok.',
  'From {who}, accepted {d}': 'Dari {who}, diterima {d}', 'Accepted': 'Diterima', 'Read from the same records the division uses. Nothing here is typed in by hand.': 'Dibaca dari catatan yang sama yang dipakai divisi. Tidak ada yang diketik manual di sini.',
  '{who} can unblock it': '{who} dapat menyelesaikannya', 'raised by {who} {d}': 'diangkat oleh {who} {d}',
  'Waiting for the President': 'Menunggu Presiden', 'Acknowledged': 'Diterima', 'Returned for information': 'Dikembalikan untuk informasi', 'Resolved': 'Selesai', 'Withdrawn': 'Ditarik', 'Escalation': 'Eskalasi', 'Escalations': 'Eskalasi', 'Sent': 'Dikirim',
  'Needed by {d}': 'Dibutuhkan paling lambat {d}', 'No date asked': 'Tanpa tanggal diminta', 'Responsible for the next step': 'Penanggung jawab langkah berikutnya', 'Next step by': 'Langkah berikutnya paling lambat', 'What happens next': 'Apa yang terjadi berikutnya', 'Acknowledge': 'Terima',
  'What information is missing?': 'Informasi apa yang kurang?', 'Return to {who}': 'Kembalikan ke {who}', 'Acknowledge and name the next step': 'Terima dan tetapkan langkah berikutnya', 'Return for information': 'Kembalikan untuk informasi', 'Resolution': 'Penyelesaian', 'Record resolution': 'Catat penyelesaian',
  'Reason, with the missing information': 'Alasan, dengan informasi yang kurang', 'Send again': 'Kirim lagi', 'Add the information and send again': 'Tambahkan informasi dan kirim lagi', 'Withdraw': 'Tarik', 'Reason': 'Alasan', 'Returned with': 'Dikembalikan dengan', 'Reply': 'Balasan',
  'Source': 'Sumber', 'Removed': 'Dihapus', 'Blocker': 'Hambatan', 'still open': 'masih terbuka', 'resolved': 'selesai', 'Next step': 'Langkah berikutnya', 'Answered': 'Dijawab', 'Created': 'Dibuat',
  'An escalation never changes the blocker or the task by itself. The people responsible still record what they did.': 'Eskalasi tidak pernah mengubah hambatan atau tugas dengan sendirinya. Penanggung jawab tetap mencatat apa yang mereka lakukan.',
  'Escalate': 'Eskalasi', 'Only the VP escalates to the President in this proposal.': 'Dalam usulan ini, hanya Wakil Presiden yang mengeskalasi ke Presiden.', 'Escalate to the President': 'Eskalasi ke Presiden', 'Send to': 'Kirim ke', 'No President named': 'Belum ada Presiden',
  'Why it needs the President': 'Mengapa ini membutuhkan Presiden', 'What is decided above the division, and what you already tried': 'Apa yang diputuskan di atas divisi, dan apa yang sudah Anda coba', 'Needed by': 'Dibutuhkan paling lambat', 'Optional': 'Opsional',
  'A requested date is not agreed until the President acknowledges it.': 'Tanggal yang diminta belum disepakati sampai Presiden menerimanya.', 'Send to {who}': 'Kirim ke {who}', 'Cancel': 'Batal',
  'Task offer': 'Tawaran tugas', 'Waiting for an answer': 'Menunggu jawaban', 'Project invitation': 'Undangan proyek', 'Not answered': 'Belum dijawab', 'Publication request': 'Permintaan publikasi', 'Requested': 'Diminta', 'Client handoff': 'Serah terima klien',
  'today': 'hari ini', '{n} day ago': '{n} hari lalu', '{n} days ago': '{n} hari lalu', 'asked by {who}': 'diajukan oleh {who}', '{who} decides': '{who} memutuskan', 'Waiting for decision': 'Menunggu keputusan', 'needed by {d}': 'dibutuhkan {d}', 'next: {who}': 'berikutnya: {who}',
  'requested for {d}': 'diminta untuk {d}', 'open {a}': 'terbuka {a}', 'owner {who}': 'pemilik {who}',
  '{n} open project': '{n} proyek terbuka', '{n} open projects': '{n} proyek terbuka', '{n} decision waiting': '{n} keputusan menunggu', '{n} decisions waiting': '{n} keputusan menunggu', '{n} open blocker': '{n} hambatan terbuka', '{n} open blockers': '{n} hambatan terbuka', '{n} overdue milestone': '{n} milestone terlambat', '{n} overdue milestones': '{n} milestone terlambat',
  'Everything that needs the presidency across all six divisions': 'Semua yang membutuhkan presidium di keenam divisi', 'All divisions (Admin)': 'Semua divisi (Admin)', 'showing {d}': 'menampilkan {d}', 'What the Board sees': 'Yang dilihat Dewan Pengawas',
  'Decisions waiting for you': 'Keputusan menunggu Anda', 'Open escalations': 'Eskalasi terbuka', 'Handoffs not answered': 'Serah terima belum dijawab', 'Filter by division': 'Saring menurut divisi',
  'Nothing is waiting for your decision.': 'Tidak ada yang menunggu keputusan Anda.', 'Waiting for others in these divisions': 'Menunggu pihak lain di divisi ini',
  'Nothing escalated. Use Escalate on a blocker that needs the President.': 'Belum ada eskalasi. Gunakan Eskalasi pada hambatan yang membutuhkan Presiden.', 'Nothing has been escalated to you.': 'Belum ada yang dieskalasi kepada Anda.',
  'Handoffs between divisions not answered yet': 'Serah terima antardivisi yang belum dijawab', 'Every handoff between divisions has an answer.': 'Setiap serah terima antardivisi sudah dijawab.', 'No open blockers.': 'Tidak ada hambatan terbuka.',
  'Deadlines in the next 14 days': 'Tenggat 14 hari ke depan', 'Project end': 'Akhir proyek', 'No milestones or project ends in the next 14 days.': 'Tidak ada milestone atau akhir proyek dalam 14 hari ke depan.', 'Current commitments': 'Komitmen saat ini',
  'Approved in the last 30 days': 'Disetujui dalam 30 hari terakhir', 'Approved': 'Disetujui', 'Organization-wide projects': 'Proyek seluruh organisasi', 'lead {who}': 'pimpinan {who}', 'Not named': 'Belum ditunjuk',
  'Counted from the records each division keeps. There is no health score. An overdue task is not a leadership decision until someone escalates it with a reason.': 'Dihitung dari catatan setiap divisi. Tidak ada skor kesehatan. Tugas terlambat bukan keputusan pimpinan sampai seseorang mengeskalasinya dengan alasan.',
  'Board of Supervisors, read-only': 'Dewan Pengawas, hanya baca', 'This is what Board of Supervisors accounts see': 'Inilah yang dilihat akun Dewan Pengawas', 'Read-only account': 'Akun hanya baca',
  'Board accounts open every division’s projects, milestones, blockers and decisions. They can’t create, edit, approve or receive task offers, and never appear in pickers. Individual HR assessments, private notes, candidate data and restricted finance or legal fields stay hidden.': 'Akun Dewan Pengawas dapat membuka proyek, milestone, hambatan, dan keputusan setiap divisi. Akun ini tidak dapat membuat, mengubah, menyetujui, atau menerima tawaran tugas, dan tidak pernah muncul di pemilih orang. Penilaian HR perorangan, catatan pribadi, data kandidat, serta kolom keuangan atau hukum yang dibatasi tetap tersembunyi.',
  'Divisions': 'Divisi', 'Director': 'Direktur', 'Open projects': 'Proyek terbuka', 'Next milestone': 'Milestone berikutnya', 'Decisions waiting': 'Keputusan menunggu', 'None': 'Tidak ada',
  'Open a division to read its projects, Operations, Resources and Changes.': 'Buka sebuah divisi untuk membaca proyek, Operasional, Sumber daya, dan Perubahannya.', 'Decisions': 'Keputusan', 'Waiting, and decided in the last 30 days': 'Menunggu, dan diputuskan dalam 30 hari terakhir',
  'Rejected': 'Ditolak', 'On hold': 'Ditunda', 'No decisions in this period.': 'Tidak ada keputusan pada periode ini.', 'Milestones in the next 30 days': 'Milestone 30 hari ke depan', 'No milestones due.': 'Tidak ada milestone yang jatuh tempo.',
  'Built from the same records each division uses. Nothing here is typed in for the Board, and there is no health score.': 'Disusun dari catatan yang sama yang dipakai setiap divisi. Tidak ada yang diketik khusus untuk Dewan Pengawas, dan tidak ada skor kesehatan.',
  'Say why this needs the President.': 'Jelaskan mengapa ini membutuhkan Presiden.', 'Sent to {who}. Nothing changes until they answer.': 'Terkirim ke {who}. Tidak ada yang berubah sampai ia menjawab.', 'Choose who takes the next step.': 'Pilih siapa yang mengambil langkah berikutnya.', 'Say what happens next.': 'Jelaskan apa yang terjadi berikutnya.',
  'Acknowledged. {who} was told.': 'Diterima. {who} sudah diberi tahu.', 'Say what information is missing.': 'Jelaskan informasi apa yang kurang.', 'Returned to {who}': 'Dikembalikan ke {who}', 'Write what was resolved.': 'Tuliskan apa yang diselesaikan.', 'Resolution recorded': 'Penyelesaian dicatat',
  'Sent to {who} again': 'Terkirim lagi ke {who}', 'Escalation withdrawn': 'Eskalasi ditarik',
  '{who} escalated an item to you': '{who} mengeskalasi sesuatu kepada Anda', '{who} acknowledged your escalation': '{who} menerima eskalasi Anda', '{who} returned your escalation for more information': '{who} mengembalikan eskalasi Anda untuk informasi tambahan', '{who} recorded a resolution on your escalation': '{who} mencatat penyelesaian eskalasi Anda', '{who} made you responsible for the next step': '{who} menjadikan Anda penanggung jawab langkah berikutnya',
  'escalated to the President': 'mengeskalasi ke Presiden', 'withdrew an escalation': 'menarik eskalasi', 'acknowledged an escalation': 'menerima eskalasi', 'undid acknowledging an escalation': 'membatalkan penerimaan eskalasi', 'returned an escalation': 'mengembalikan eskalasi', 'undid returning an escalation': 'membatalkan pengembalian eskalasi',
  'recorded a resolution on an escalation': 'mencatat penyelesaian eskalasi', 'undid a resolution on an escalation': 'membatalkan penyelesaian eskalasi', 'sent an escalation again': 'mengirim ulang eskalasi', 'restored an escalation': 'memulihkan eskalasi',
  'Project Associates': 'Project Associates', 'Knowledge': 'Knowledge', 'TnD': 'TnD',
});
})();
