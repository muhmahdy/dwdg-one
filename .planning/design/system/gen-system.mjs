// dwdg'ONE design system v2 · living reference page.
// Run: node .planning/design/system/gen-system.mjs  → system.html (self-contained; fonts from Google)
import fs from 'node:fs';
import {ICONS as BRAND} from '../../brand/gen-icons.mjs';

const here = p => new URL(p, import.meta.url);
const root = p => new URL(`../../../${p}`, import.meta.url);
const tokens = fs.readFileSync(here('tokens.css'), 'utf8');
const comps = fs.readFileSync(here('components.css'), 'utf8');
const ui = fs.readFileSync(root('experience-ui.mjs'), 'utf8');
const s0 = ui.indexOf('const ICONS = {') + 14;
const UI = Function('return ' + ui.slice(s0, ui.indexOf('};', s0) + 1))();
UI.minus = 'M5 12h14'; UI.lock = 'M6 11h12v10H6ZM8 11V8a4 4 0 0 1 8 0v3'; UI.sort = 'm8 9 4-4 4 4M8 15l4 4 4-4';
const i = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${UI[n]}"/></svg>`;
const b = id => `<svg class="bi" viewBox="0 0 24 24" aria-hidden="true">${BRAND[id].svg}</svg>`;
const mask = n => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${UI[n]}"/></svg>`)}')`;
const STAGES = {all: ['All stages', 'filter'], draft: ['Draft', 'edit'], planned: ['Planned', 'calendar'], active: ['Active', 'circle'], review: ['In review', 'search'], completed: ['Completed', 'check'], hold: ['On hold', 'hand'], cancelled: ['Cancelled', 'close'], archived: ['Archived', 'archive']};
const st = (k, sm = false) => `<span class="st st-${k} ${sm ? 'st-sm' : ''}"><i class="st-ic" style="--m:${mask(STAGES[k][1])}"></i><span class="st-tx">${STAGES[k][0]}</span></span>`;
// ---- one state language: icon + coloured word (no pills) ----
const raw = (inner, extra = '') => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${extra}>${inner}</svg>`)}')`;
const pie = f => { if (f >= 1) return raw('<circle cx="12" cy="12" r="9" fill="none" stroke="black" stroke-width="2"/><circle cx="12" cy="12" r="5.5"/>');
  const a = f * 2 * Math.PI, x = (12 + 5.5 * Math.sin(a)).toFixed(2), y = (12 - 5.5 * Math.cos(a)).toFixed(2);
  return raw(`<circle cx="12" cy="12" r="9" fill="none" stroke="black" stroke-width="2"/><path d="M12 12V6.5A5.5 5.5 0 0 ${f > .5 ? 1 : 0} 1 ${x} ${y}Z"/>`); };
const G = {
  dashed: raw('<circle cx="12" cy="12" r="8.5" fill="none" stroke="black" stroke-width="2" stroke-dasharray="3.2 3.1" stroke-linecap="round"/>'),
  done: raw('<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20ZM7.2 12.3l1.6-1.6 2.2 2.2 4.6-4.6 1.6 1.6-6.2 6.2Z"/>'),
  info: raw('<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20ZM10.9 10.2h2.2v7h-2.2ZM12 6.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6Z"/>'),
  warn: raw('<path fill-rule="evenodd" d="M10.3 3.4a2 2 0 0 1 3.4 0l8 13.9a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3ZM10.9 8.6h2.2v6h-2.2ZM12 15.9a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6Z"/>'),
  error: raw('<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20ZM10.9 6.4h2.2v7.2h-2.2ZM12 15.3a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6Z"/>'),
};
const STATE = {
  pipe: {identified: ['Identified', pie(1/8), 'ink2'], qualified: ['Qualified', pie(2/8), 'ink2'], contacted: ['Contacted', pie(3/8), 'ink2'], discussion: ['Discussion', pie(4/8), 'ink2'], proposal: ['Proposal', pie(5/8), 'ink2'], negotiation: ['Negotiation', pie(6/8), 'ink2'], pending: ['Agreement pending', pie(7/8), 'warn'], active: ['Active', pie(1), 'green'], hold: ['On hold', mask('hand'), 'hold'], lost: ['Lost', mask('close'), 'mute']},
  req: {draft: ['Draft', mask('edit'), 'mute'], requested: ['Requested', mask('arrow'), 'ink2'], returned: ['Returned for info', mask('undo'), 'warn'], accepted: ['Accepted', mask('check'), 'green'], approved: ['Approved', mask('check'), 'green'], fulfilled: ['Fulfilled', G.done, 'green'], cancelled: ['Cancelled', mask('close'), 'mute']},
  rev: {awaiting: ['Awaiting review', mask('clock'), 'ink2'], changes: ['Changes requested', mask('edit'), 'warn'], approved: ['Approved', mask('check'), 'green'], stale: ['Approval stale', G.warn, 'danger']},
  att: {present: ['Present', mask('check'), 'green'], late: ['Late', mask('clock'), 'warn'], excused: ['Excused', mask('info'), 'ink2'], unexcused: ['Unexcused', mask('close'), 'danger'], notreq: ['Not required', mask('minus'), 'mute'], unknown: ['Not yet recorded', G.dashed, 'mute']},
  doc: {signing: ['Awaiting signatures', mask('clock'), 'ink2'], signed: ['Signed', mask('check'), 'green'], void: ['Void', mask('close'), 'mute']},
  misc: {incomplete: ['1 criterion incomplete', G.warn, 'warn'], notscored: ['Not scored', G.dashed, 'mute']},
};
const PILL = {att: 'pill-o', req: 'pill', rev: 'pill', doc: 'pill'};
const sx = (set, k, opts = {}) => { const [label, m, tone] = STATE[set][k]; const pl = opts.pill === false ? '' : (opts.pill || PILL[set] || ''); return `<span class="st s-${tone} ${pl} ${opts.sm ? 'st-sm' : ''}"><i class="st-ic" style="--m:${m}"></i><span>${opts.label || label}</span></span>`; };
const notice = (kind, title, body, acts = '') => `<div class="notice n-${kind}"><i class="n-ic" style="--m:${G[kind]}"></i><div><b>${title}</b><p>${body}</p></div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const idl = (div, ...roles) => `<span class="idl">${[div, ...roles].map(k => `<svg class="bi" viewBox="0 0 24 24" role="img" aria-label="${BRAND[k].label}"><title>${BRAND[k].label}</title>${BRAND[k].svg}</svg>`).join('')}</span>`;
const P = Object.fromEntries(JSON.parse(fs.readFileSync(here('../people/people.json'), 'utf8')).people.map(([id, n]) => [n.split(' ')[0], id]));
const used = new Set(); const av = (first, cls = '') => { used.add(first); return `<img class="av ${cls}" src="__P_${first}__" alt="${first}">`; };
const me = (cls = '') => `<span class="av ${cls}">M</span>`;

// ---- foundations data parsed from tokens.css ----
const block = sel => { const a = tokens.indexOf(sel); return tokens.slice(a, tokens.indexOf('}', a)); };
const vars = txt => Object.fromEntries([...txt.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2]]));
const L = vars(block(':root, [data-theme="light"]')), D = vars(block('[data-theme="dark"]'));
const groups = [
  ['Surfaces', ['canvas', 'surface', 'surface-2', 'fill', 'hover', 'sel', 'sel-neutral']],
  ['Text', ['ink', 'ink-2', 'mute', 'faint']],
  ['Accent and meaning', ['green', 'green-ink', 'green-soft', 'danger', 'danger-soft', 'warning', 'warning-mark', 'warning-soft']],
  ['Project stages', ['st-neutral', 'st-planned', 'st-active', 'st-review', 'st-hold', 'st-cancelled', 'st-completed']],
];
const swatches = groups.map(([g, names]) => `<h3 class="t-h3 sub">${g}</h3><div class="swgrid">${names.filter(n => L[n]).map(n => `<div class="sw"><i style="background:var(--${n})"></i><b>--${n}</b><span class="t-num">${L[n]} · ${D[n] || 'same'}</span></div>`).join('')}</div>`).join('');

// ---- sections ----
const S = [];
const sec = (id, title, intro, body) => S.push({id, title, html: `<section id="${id}" class="dsec"><h2 class="t-h2">${title}</h2>${intro ? `<p class="lead">${intro}</p>` : ''}${body}</section>`});

sec('color', 'Colour', 'One neutral family, one accent (the official green), and semantic colours only where they carry meaning. Each swatch shows light · dark. Text colours meet 4.5:1 on their surfaces in both themes; marks and icons meet 3:1.', swatches);
sec('type', 'Type', 'Geist for everything, Geist Mono for numbers, times, money and register numbers. Sentence case everywhere; no all-caps section labels.', `<div class="sheet pad specimen">
<div><span class="t-caption">Display 28/34</span><p class="t-display">Good morning, Mahdy</p></div>
<div><span class="t-caption">Title 24/32</span><p class="t-title">SnG roadmap 2026</p></div>
<div><span class="t-caption">Heading 18/26</span><p class="t-h2">Needs your response</p></div>
<div><span class="t-caption">Subheading 15/22</span><p class="t-h3">Linked resources</p></div>
<div><span class="t-caption">Body 14/21</span><p>Pull from the September retro and the member survey. Three priorities at most, each with an owner.</p></div>
<div><span class="t-caption">Small 13/19 · Caption 12/17</span><p class="t-small">Created by Salsa on 2 Oct 2026</p></div>
<div><span class="t-caption">Mono 12.5</span><p class="t-num">09:00 · 14 Oct · Rp 1.250.000 · DWDG/FnL/2026/014</p></div></div>`);
sec('space', 'Space, corners and depth', 'A 4px spacing scale. Three corner sizes: sheets 12, controls 8, chips 6; avatars and toggles are round. Depth comes from tone and a hairline ring, never from side stripes.', `<div class="row-wrap">
${['s1', 's2', 's3', 's4', 's6', 's8', 's12', 's16'].map(s => `<div class="spc"><i style="width:var(--${s})"></i><span class="t-num">--${s}</span></div>`).join('')}</div>
<div class="row-wrap" style="margin-top:20px"><div class="sheet demo-r">Sheet<br><span class="t-num">12px · --e-sheet</span></div><div class="pop demo-r">Popover<br><span class="t-num">10px · --e-pop</span></div><div class="quiet demo-r">Quiet panel<br><span class="t-num">--surface-2</span></div><button class="btn">Control 8px</button><span class="tag">Chip 6px</span></div>`);
sec('icons', 'Icons and avatars', 'Interface icons: one 1.8px stroke set from the existing app. Identity icons: the role and division set. People are circular photos; a monogram is used only when there is no photo.', `<div class="sheet pad"><div class="icgrid">${['home', 'tasks', 'calendar', 'projects', 'folder', 'people', 'search', 'plus', 'check', 'clock', 'link', 'filter', 'archive', 'edit', 'more', 'close', 'lock', 'warning', 'info', 'undo'].map(n => `<span title="${n}">${i(n)}</span>`).join('')}</div>
<div class="icgrid" style="margin-top:16px">${Object.keys(BRAND).map(k => `<span title="${BRAND[k].label}">${b(k)}</span>`).join('')}</div>
<div class="row-wrap" style="margin-top:16px">${av('Salsa', 'av-lg')}${av('Dimas')}${av('Rani', 'av-sm')}${av('Fikri', 'av-xs')}${me('av-lg')}<span class="person">${av('Dimas', 'av-sm')}Dimas ${idl('div-cons', 'role-co-director')}</span><span class="av-group">${av('Nadia')}${av('Raka')}${av('Alya')}<span class="av">+4</span></span></div></div>`);

sec('buttons', 'Buttons', 'One primary per view. Secondary has a hairline ring; ghost has none. Press scales to 98%.', `<div class="row-wrap"><button class="btn btn-pri">${i('plus')}New project</button><button class="btn">Edit</button><button class="btn btn-ghost">Cancel</button><button class="btn btn-danger">Move to trash</button><button class="btn btn-sm">Small</button><button class="btn" disabled>Disabled</button><button class="ib">${i('more')}</button><button class="btn btn-pri">Send invitations <span class="kbd">⏎</span></button></div>`);
sec('forms', 'Form controls', 'Label above, help or error below. Placeholders never replace labels. Required is marked; drafts are kept on failure.', `<div class="sheet pad grid2">
<div class="field"><label>Project name <span class="req">*</span></label><input class="input" value="Alumni mentoring pilot"><span class="help">Visible to everyone in Strategy &amp; Growth.</span></div>
<div class="field invalid"><label>Due date</label><input class="input" value="2 Sep 2026"><span class="help">The due date is before the start date (1 Oct).</span></div>
<div class="field"><label>Goal <span class="opt">Optional</span></label><textarea class="textarea">Pair 12 new members with alumni mentors for one term.</textarea></div>
<div class="field"><label>Lead</label><button class="select"><span class="person">${av('Nadia', 'av-xs')}Nadia Puspita</span>${i('chevron-down', 'ic-sm')}</button></div>
<div class="row-wrap"><span class="search">${i('search')}Find a project</span><span class="cb on"></span><span class="cb"></span><span class="toggle on"></span><span class="toggle"></span></div>
<div class="row-wrap"><div class="seg"><button class="on">List</button><button>Board</button><button>Timeline</button></div></div>
<div class="tabs" style="grid-column:1/-1"><button class="on">Overview</button><button>Work<span class="n">12</span></button><button>Resources<span class="n">6</span></button></div></div>`);
sec('states', 'States', 'Every state uses one language: an icon and a coloured word, like the project stages. Where states are scanned in a column, a light pill helps: outlined white for attendance, a soft neutral fill for requests and reviews. Stages and pipeline steps stay bare inside rows and boards.', `<div class="sheet pad stack">
<div><p class="t-caption">Context</p><div class="row-wrap"><span class="ctx">${b('div-sng')}SnG</span><span class="ctx">${b('div-ee')}EE handoff</span><span class="ctx">${b('div-hr')}Open recruitment 2026</span></div></div>
<div><p class="t-caption">Project stages (owner's set)</p><div class="row-wrap gap-l">${Object.keys(STAGES).map(k => st(k)).join('')}</div></div>
<div><p class="t-caption">EE pipeline: the pie fills with each step</p><div class="row-wrap gap-l">${Object.keys(STATE.pipe).map(k => sx('pipe', k)).join('')}</div></div>
<div><p class="t-caption">Requests and handoffs</p><div class="row-wrap gap-l">${['draft', 'requested', 'returned', 'accepted', 'fulfilled', 'cancelled'].map(k => sx('req', k)).join('')}</div></div>
<div><p class="t-caption">Review of a version</p><div class="row-wrap gap-l">${Object.keys(STATE.rev).map(k => sx('rev', k, k === 'approved' ? {label: 'Approved v3'} : {})).join('')}</div></div>
<div><p class="t-caption">Attendance</p><div class="row-wrap gap-l">${Object.keys(STATE.att).map(k => sx('att', k)).join('')}</div></div></div>`);
sec('menus', 'Menus', 'Items are separated by a 2px gap; the selected item is a deeper neutral than hover, so the two never blend.', `<div class="row-wrap"><div class="pop menu">${['all', 'draft', 'planned', 'active', 'review', 'completed'].map((k, n) => `<div class="mi ${n === 0 ? 'on' : ''}">${st(k)}${n === 0 ? i('check', 'tick') : ''}</div>`).join('')}<hr>${['hold', 'cancelled', 'archived'].map(k => `<div class="mi">${st(k)}</div>`).join('')}</div>
<div class="pop menu"><div class="mi">${i('edit')}Edit<span class="kbd">E</span></div><div class="mi">${i('link')}Copy link</div><div class="mi on">${i('archive')}Move to project</div><hr><div class="mi" style="color:var(--danger)">${i('close')}Move to trash</div></div></div>`);
sec('rows', 'Rows', 'Task rows read like sentences: inline links and people, a context chip, a right-aligned time. Rows have a 3px gap; selected is green-tinted, hover is neutral.', `<div class="sheet pad"><div class="rows">
<div class="row"><span class="tm">09:00</span><div class="t">Strategy review with <span class="person">${av('Salsa', 'av-xs')}Salsa</span> and <span class="person">${av('Dimas', 'av-xs')}Dimas</span></div><span class="ctx">${b('div-sng')}SnG</span><span class="due">45 min</span></div>
<div class="row sel"><span class="cb"></span><div class="t">Draft Q4 growth priorities for <a>SnG roadmap 2026</a></div><span class="ctx">${b('div-sng')}Roadmap 2026</span><span class="due">14:00</span></div>
<div class="row"><span class="cb"></span><div class="t">Review the partner shortlist with <span class="person">${av('Rani', 'av-xs')}Rani</span> before Friday</div><span class="ctx">${b('div-ee')}EE handoff</span><span class="due late">Overdue</span></div>
<div class="row"><span class="cb on"></span><div class="t" style="color:var(--mute);text-decoration:line-through">Book a café for the monthly SnG retro</div><span class="due none">Done</span></div></div></div>`);
sec('inspector', 'Inspector and record meta', 'Every record shows who created it and when, separately from who is responsible and who reviews it.', `<div class="row-wrap" style="align-items:flex-start"><aside class="sheet insp"><div class="insp-h"><span>Task</span><button class="ib">${i('more')}</button><button class="ib">${i('close')}</button></div>
<h3 class="t-h2" style="margin:12px 0 8px">Draft Q4 growth priorities for SnG roadmap 2026</h3><p class="t-small t-mute" style="margin:0 0 16px">Three priorities at most, each with an owner.</p>
<dl class="meta"><dt>Due</dt><dd>Today, 14:00</dd><dt>Responsible</dt><dd>${me('av-xs')}Mahdy</dd><dt>Reviewer</dt><dd>${av('Raka', 'av-xs')}Raka <small>VP Internal</small></dd><dt>Project</dt><dd>${b('div-sng')}SnG roadmap 2026</dd><dt>Created</dt><dd>${av('Salsa', 'av-xs')}Salsa, 2 Oct 2026 at 09:14</dd></dl>
<div class="row-wrap" style="margin-top:20px"><button class="btn btn-pri">${i('check')}Mark done</button><button class="btn">Edit</button></div></aside></div>`);
sec('feedback', 'Feedback and honest states', 'Notices sit in place, never as blocking dialogs. Unknown and restricted are shown as what they are.', `<div class="stack">
${notice('info', 'Saved on this device only', 'The prototype keeps data in this browser. Export a copy before clearing it.')}
${notice('warn', 'Approval is stale', 'Version 4 changed the copy after Raka approved version 3. Ask for a new review before publishing.', '<button class="btn btn-sm btn-ghost">Compare</button><button class="btn btn-sm btn-pri">Request review</button>')}
${notice('error', 'Couldn\'t save the request', 'Your draft is kept. Check the connection and try again.', '<button class="btn btn-sm">Try again</button>')}
<div class="row-wrap"><span class="toast">Task marked done<button>Undo</button></span><span class="restricted">${i('lock')}Restricted: HR assessment</span></div>
<div class="row-wrap" style="align-items:stretch"><div class="sheet empty" style="width:360px"><b>No projects yet</b><p>Projects in Strategy &amp; Growth will appear here. Directors and co-directors can create one.</p><button class="btn btn-pri">${i('plus')}New project</button></div>
<div class="sheet pad" style="width:300px;display:grid;gap:10px"><span class="skel" style="width:70%"></span><span class="skel" style="width:90%"></span><span class="skel" style="width:55%"></span></div></div></div>`);

// ---- division patterns ----
sec('p-table', '1 · Operational table', 'EE relationships. Sortable headers, inline edit, row to inspector; selection brings up the action bar.', `<div class="sheet pad"><table class="tbl"><thead><tr><th></th><th class="sort">Organisation${i('sort')}</th><th>Kind</th><th>Stage</th><th>PIC</th><th>Last interaction</th><th>Next action</th><th class="num">Due</th></tr></thead><tbody>
<tr class="sel"><td><span class="cb on"></span></td><td><b>Kopi Kultur Jakal</b></td><td>Partner</td><td>${sx('pipe','proposal')}</td><td><span class="person">${av('Alya', 'av-xs')}Alya</span></td><td class="t-mute">Call, 30 Sep</td><td>Send revised benefit list</td><td class="num">8 Oct</td></tr>
<tr><td><span class="cb"></span></td><td><b>Himpunan Mahasiswa Statistika</b></td><td>Client</td><td>${sx('pipe','discussion')}</td><td><span class="person">${av('Arief', 'av-xs')}Arief</span></td><td class="t-mute">Meeting, 2 Oct</td><td class="edit">Confirm scope with Cons</td><td class="num">10 Oct</td></tr>
<tr><td><span class="cb"></span></td><td><b>Bank Syariah partner desk</b></td><td>Partner</td><td>${sx('pipe','pending')}</td><td><span class="person">${av('Rani', 'av-xs')}Rani</span></td><td class="t-mute">Email, 1 Oct</td><td>Legal review with FnL</td><td class="num">14 Oct</td></tr>
</tbody></table><div style="margin-top:12px"><span class="selbar">1 selected<span class="sep"></span><button class="ib">${i('people')}</button><button class="ib">${i('calendar')}</button><button class="ib">${i('archive')}</button><span class="sep"></span><button class="ib">${i('close')}</button></span></div></div>`);
sec('p-board', '2 · Pipeline board', 'The same EE records as a board. Side states (lost, on hold) stay explicit.', `<div class="board">${[['Contacted', [['Fakultas Hukum UII', 'Tasya', 'Follow up', '9 Oct']]], ['Discussion', [['Himpunan Mahasiswa Statistika', 'Arief', 'Scope call', '10 Oct'], ['Komunitas Startup Jogja', 'Bima', 'Intro deck', '12 Oct']]], ['Proposal', [['Kopi Kultur Jakal', 'Alya', 'Revised benefits', '8 Oct']]], ['Agreement pending', [['Bank Syariah partner desk', 'Rani', 'Legal review', '14 Oct']]]].map(([c, cards]) => `<div class="col"><div class="col-h">${c}<span class="n">${cards.length}</span></div>${cards.map(([o, p, a, d]) => `<div class="card"><b>${o}</b><div class="ln">${av(p, 'av-xs')}${a}<span class="t-num">${d}</span></div></div>`).join('')}</div>`).join('')}</div>`);
sec('p-request', '3 · Request form and queue', 'A typed FnL reimbursement request. Required fields, evidence, and a queue view for the handler.', `<div class="grid2"><div class="sheet pad stack"><div class="field"><label>Purpose <span class="req">*</span></label><input class="input" value="Snacks for the member survey focus group"></div><div class="grid2"><div class="field"><label>Amount <span class="req">*</span></label><input class="input t-num" value="Rp 187.500"></div><div class="field"><label>Needed by</label><input class="input" value="10 Oct 2026"></div></div><div class="field"><label>Evidence <span class="req">*</span></label><span class="ctx">${i('link', 'ic-xs')}Receipt photo (Drive link)</span></div><div class="row-wrap"><button class="btn btn-pri">Submit request</button><span class="t-caption">Draft saved 14:02</span></div></div>
<div class="sheet pad"><p class="t-h3" style="margin:0 0 8px">Finance queue</p><div class="rows"><div class="row"><div class="t"><b>Focus group snacks</b><small>Fikri, SnG</small></div><span class="money"><small>Rp</small>187.500</span>${sx('req','requested')}</div><div class="row"><div class="t"><b>Booth printing</b><small>Laras, MCIT</small></div><span class="money"><small>Rp</small>420.000</span>${sx('req','returned')}</div><div class="row"><div class="t"><b>Speaker gift</b><small>Hana, Cons</small></div><span class="money"><small>Rp</small>150.000</span>${sx('req','approved')}</div></div></div></div>`);
sec('p-review', '4 · Version and review', 'MCIT content review on an exact version. A newer version makes the earlier approval visibly stale.', `<div class="grid2"><div class="sheet pad"><div class="versions"><div class="ver sel"><span class="v">v4</span><div><b>Caption shortened</b><small>Laras, today 10:12</small></div>${sx('rev','stale')}</div><div class="ver"><span class="v">v3</span><div><b>Final visual</b><small>Laras, 3 Oct</small></div>${sx('rev','approved')}</div><div class="ver"><span class="v">v2</span><div><b>Copy revision</b><small>Galih, 1 Oct</small></div>${sx('rev','changes')}</div></div></div>
<div class="sheet pad stack"><p class="t-h3" style="margin:0">Review v4</p><div class="field"><label>Comment</label><textarea class="textarea">The shorter caption drops the registration date. Please add it back.</textarea></div><div class="decision"><button class="btn btn-pri">${i('check')}Approve v4</button><button class="btn">Request changes</button><button class="btn btn-ghost">Reject</button></div></div></div>`);
sec('p-handoff', '5 · Handoff', 'The shared contract: source and version, sender, named receiver, requested vs agreed date, and status.', `<div class="sheet handoff" style="max-width:640px"><div class="row-wrap" style="justify-content:space-between"><b>Feasibility check for HMS data workshop</b>${sx('req','accepted')}</div><div class="ends"><div class="end"><small>From EE Client</small><span class="person">${av('Arief', 'av-xs')}Arief</span><small>Opportunity v2</small></div>${i('arrow')}<div class="end"><small>To Cons, Project Associates</small><span class="person">${av('Dimas', 'av-xs')}Dimas</span><small>Accepted 3 Oct</small></div></div><dl class="meta"><dt>Requested by</dt><dd class="t-num">10 Oct</dd><dt>Agreed date</dt><dd class="t-num">12 Oct</dd><dt>Evidence</dt><dd><span class="ctx">${i('link', 'ic-xs')}Client brief v2</span></dd></dl><div class="steps"><span class="done">Draft</span><span class="done">Requested</span><span class="now">Accepted</span><span>Fulfilled</span></div></div>`);
sec('p-attendance', '6 · Attendance register', 'HR weekly meeting. One status per expected member; "not yet recorded" is never the same as absent.', `<div class="sheet pad"><div class="att"><span class="h">Member</span><span class="h">Status</span><span class="h">Notice</span><span class="h">Recorded by</span><span class="h">Time</span>
${[['Salsa', 'present', '', 'Kirana', '19:02'], ['Fikri', 'late', '', 'Kirana', '19:18'], ['Nadia', 'excused', 'Class schedule', 'Kirana', '18:40'], ['Bima', 'unexcused', '', 'Kirana', '19:30'], ['Zahra', 'unknown', '', '', '']].map(([p, k, n, r, t]) => `<span class="who">${av(p, 'av-sm')}${p}</span><span>${sx('att', k)}</span><span class="t-small t-mute">${n ? `<span class="restricted">${i('lock')}Reason restricted</span>` : '-'}</span><span class="t-small">${r || '<span class="t-mute">-</span>'}</span><span class="t-num">${t || '-'}</span>`).join('')}</div></div>`);
sec('p-rubric', '7 · Rubric scoring', 'HR fortnightly cycle. Raw value, maximum, weight and evidence per criterion. A missing criterion stays incomplete, never zero.', `<div class="sheet pad"><div class="row-wrap" style="justify-content:space-between;margin-bottom:8px"><span class="person">${av('Zahra', 'av-sm')}Zahra Aulia, cycle 21 Sep to 4 Oct</span>${sx('misc','incomplete')}</div><div class="rubric">
${[['Quality', 'Deliverables meet the agreed standard', 3, '30%'], ['Agreed delivery', 'Committed items done by the agreed date', 4, '30%'], ['Collaboration', 'Communication and support for others', 4, '20%'], ['Development', 'Learning and contribution', 0, '20%']].map(([c, d, v, w]) => `<div class="crit"><div><b>${c}</b><small>${d}</small></div><div class="scale">${[1, 2, 3, 4, 5].map(n => `<button class="${n === v ? 'on' : ''}">${n}</button>`).join('')}</div><span class="w">${w}</span>${v ? `<span class="ctx">${i('link', 'ic-xs')}2 evidence links</span>` : sx('misc','notscored')}</div>`).join('')}</div></div>`);
sec('p-money', '8 · Money', 'FnL budget for one allocation. Committed, paid and remaining shown together; paid is derived from recorded payments only.', `<div class="sheet pad" style="max-width:640px"><div class="row-wrap" style="justify-content:space-between"><b>SnG operations, term 2026/1</b><span class="money"><small>Rp</small>2.000.000</span></div><div class="ledger" style="margin-top:12px"><div><span>Paid</span><b class="money"><small>Rp</small>612.500</b></div><div><span>Committed, not paid</span><b class="money"><small>Rp</small>187.500</b></div><div><span>Remaining</span><b class="money"><small>Rp</small>1.200.000</b></div></div><div class="split"><i class="paid" style="width:30.6%"></i><i class="com" style="width:9.4%"></i></div></div>`);
sec('p-register', '9 · Register and numbering', 'FnL document register. Numbers are issued once; a void keeps its number and reason.', `<div class="sheet pad"><table class="tbl"><thead><tr><th>Number</th><th>Document</th><th>Party</th><th>State</th><th class="num">Issued</th></tr></thead><tbody>
<tr><td><span class="reg-no">DWDG/FnL/2026/014</span></td><td>Partnership agreement</td><td>Kopi Kultur Jakal</td><td>${sx('doc','signing')}</td><td class="num">3 Oct</td></tr>
<tr><td><span class="reg-no void">DWDG/FnL/2026/013</span></td><td>Speaker letter</td><td>Fakultas Hukum UII</td><td>${sx('doc','void',{label:'Void: wrong date'})}</td><td class="num">1 Oct</td></tr>
<tr><td><span class="reg-no">DWDG/FnL/2026/012</span></td><td>Activity permit</td><td>Rektorat UII</td><td>${sx('doc','signed')}</td><td class="num">28 Sep</td></tr></tbody></table></div>`);
sec('p-decision', '10 · Decision packet', 'SnG options for an approving authority. The decision records rationale, version and a review date.', `<div class="sheet pad stack"><div class="row-wrap" style="justify-content:space-between"><b>How should DWDG grow membership next term?</b><span class="t-num t-mute">Decision packet v2</span></div><div class="options">
<div class="opt"><b>Open recruitment only</b><dl><dt>Benefit</dt><dd>Familiar process</dd><dt>Cost</dt><dd class="t-num">Rp 600.000</dd><dt>Risk</dt><dd>Same reach as 2025</dd></dl></div>
<div class="opt pick"><b>Recruitment plus alumni mentoring</b><dl><dt>Benefit</dt><dd>Better retention</dd><dt>Cost</dt><dd class="t-num">Rp 900.000</dd><dt>Risk</dt><dd>Mentor availability</dd></dl></div>
<div class="opt"><b>Faculty partnership track</b><dl><dt>Benefit</dt><dd>New pool</dd><dt>Cost</dt><dd class="t-num">Rp 1.400.000</dd><dt>Risk</dt><dd>Needs EE capacity</dd></dl></div></div>
${notice('done', 'Approved by Raka (VP Internal), 4 Oct', 'Option 2, on condition that at least 8 mentors confirm by 20 Oct. Review on 15 Dec.')}</div>`);
sec('p-calendar', '11 · Calendar', 'Your week, laid out the way Google Calendar does it. Layout from Google Calendar, look from dwdg’ONE: accepted meetings in a soft green tint, invitations waiting for your reply outlined, unavailable time striped and shown to others only as busy. Today’s column is lightly tinted.', `<div class="sheet cal">
<div class="cal-h"><span></span>${[['Mon', 6, 1], ['Tue', 7], ['Wed', 8], ['Thu', 9], ['Fri', 10]].map(([d, n, t]) => `<div class="cal-d ${t ? 'today' : ''}"><span>${d}</span><b>${n}</b></div>`).join('')}</div>
<div class="cal-all"><span class="cal-gl">All day</span><div></div><div></div><div><span class="allday">Maulid Nabi Muhammad</span></div><div></div><div><span class="allday due">${i('check', 'ic-xs')}Q4 growth priorities due</span></div></div>
<div class="cal-b" style="--rows:6">
<div class="cal-hrs">${[9, 10, 11, 12, 13, 14].map((h, n) => `<span style="top:calc(var(--hr) * ${n})">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>
<div class="cal-col today"><div class="ev one" style="top:0;height:36px"><b>Strategy review</b><small>09:00</small></div><div class="ev away" style="top:144px;height:96px"><b>Class</b><small>Busy</small></div><div class="now" style="top:118px"></div></div>
<div class="cal-col"><div class="ev pending one" style="top:48px;height:36px"><b>SnG weekly sync</b><small>10:00</small></div></div>
<div class="cal-col"><div class="ev away" style="top:0;height:132px"><b>Class</b><small>Busy</small></div></div>
<div class="cal-col"><div class="ev" style="top:96px;height:60px"><b>Partner call</b><small>11:00 to 12:15</small><small>Kopi Kultur</small></div></div>
<div class="cal-col"></div></div></div>`);
sec('p-changes', '12 · Changes feed', 'Workspace history grouped by day. Who, what and when on one line; the exact change on the next. Restricted details stay restricted.', `<div class="sheet pad feed">
<p class="feed-day">Today</p>
<div class="chg">${av('Salsa', 'av-sm')}<div class="chg-t"><b>Salsa</b> changed the stage of <a>Member growth survey</a><div class="diff">${st('planned', true)}<span class="to">to</span>${st('active', true)}</div></div><time>10:12</time></div>
<div class="chg">${av('Laras', 'av-sm')}<div class="chg-t"><b>Laras</b> uploaded version 4 of <a>Open recruitment poster</a><div class="diff">${sx('rev', 'stale', {sm: true})}</div></div><time>09:40</time></div>
<p class="feed-day">Earlier</p>
<div class="chg">${av('Dimas', 'av-sm')}<div class="chg-t"><b>Dimas</b> accepted the handoff <a>Feasibility check for HMS data workshop</a></div><time>Yesterday</time></div>
<div class="chg">${av('Kirana', 'av-sm')}<div class="chg-t"><b>Kirana</b> finalised the attendance register for the 3 Oct weekly meeting<div class="diff"><span class="restricted">${i('lock')}Individual notes restricted</span></div></div><time>3 Oct</time></div></div>`);

// ---- page ----
let html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>dwdg’ONE design system v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${tokens}\n${comps}
/* reference page layout */
body{margin:0}
.doc{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:100vh}
.toc{position:sticky;top:0;height:100vh;overflow:auto;padding:24px 14px;display:flex;flex-direction:column;gap:1px}
.toc .wm{width:140px;height:auto;flex:none;margin:0 8px 18px;color:var(--ink)}
.toc h6{margin:14px 8px 4px;font-size:12px;font-weight:500;color:var(--mute)}
.toc a{padding:6px 8px;border-radius:7px;text-decoration:none;font-size:13px;color:var(--ink-2)}
.toc a:hover{background:var(--hover)}
.content{padding:32px 40px 96px;max-width:1080px}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.dsec{padding-top:36px}.dsec>.lead{margin:6px 0 16px;color:var(--mute);max-width:70ch}
.sub{margin:16px 0 8px}
.pad{padding:20px}.stack{display:grid;gap:14px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.row-wrap{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.swgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.sw{display:grid;gap:4px;font-size:12px}.sw i{height:44px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--line)}.sw b{font-weight:600}
.specimen{display:grid;gap:14px}.specimen p{margin:2px 0 0}
.spc{display:grid;gap:6px;justify-items:start}.spc i{height:16px;border-radius:3px;background:var(--green)}
.demo-r{padding:14px 16px;font-size:13px}
.gap-l{gap:12px 22px}.icgrid{display:flex;flex-wrap:wrap;gap:14px;color:var(--ink-2)}.icgrid .bi{width:20px;height:20px}
</style></head><body class="ds"><div class="doc">
<nav class="toc">${fs.readFileSync(root('.planning/brand/dwdg-one-wordmark.svg'), 'utf8').replace('<svg ', '<svg class="wm" ').replace(/fill="#000000"/g, 'fill="currentColor"')}
<h6>Foundations</h6>${S.slice(0, 4).map(s => `<a href="#${s.id}">${s.title}</a>`).join('')}
<h6>Components</h6>${S.slice(4, 11).map(s => `<a href="#${s.id}">${s.title}</a>`).join('')}
<h6>Division patterns</h6>${S.slice(11).map(s => `<a href="#${s.id}">${s.title}</a>`).join('')}</nav>
<main class="content"><div class="top"><div><h1 class="t-display" style="margin:0">Design system v2</h1><p class="t-mute" style="margin:6px 0 0">Tokens, components and the division patterns for dwdg’ONE. Source: <code>.planning/design/system/</code></p></div>
<div class="seg" id="theme"><button class="on" data-t="light">Light</button><button data-t="dark">Dark</button></div></div>
${S.map(s => s.html).join('\n')}</main></div>
<script>document.querySelectorAll('#theme button').forEach(b=>b.onclick=()=>{document.documentElement.dataset.theme=b.dataset.t;document.querySelectorAll('#theme button').forEach(x=>x.classList.toggle('on',x===b));});</script>
</body></html>`;
for (const f of used) html = html.replaceAll(`__P_${f}__`, `data:image/jpeg;base64,${fs.readFileSync(here(`../people/${P[f]}.jpg`)).toString('base64')}`);
fs.writeFileSync(here('system.html'), html);
console.log('system.html', Math.round(html.length / 1024) + ' KB', S.length, 'sections');
