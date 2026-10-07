// Iteration 2, revision 2: one corrected direction ("Ink and Signal").
// Run: node .planning/design/gen-v2.mjs  → writes .planning/design/v2.html (fully self-contained)
import fs from 'node:fs';
import {ICONS as BRAND} from '../brand/gen-icons.mjs';

const here = p => new URL(p, import.meta.url);
const root = p => new URL(`../../${p}`, import.meta.url);
const ui = fs.readFileSync(root('experience-ui.mjs'), 'utf8');
const s0 = ui.indexOf('const ICONS = {') + 14;
const UI = Function('return ' + ui.slice(s0, ui.indexOf('};', s0) + 1))();
UI.minus = 'M5 12h14';
const PATH = n => UI[n];
const i = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATH(n)}"/></svg>`;
const b = (id, cls = '') => `<svg class="bi ${cls}" viewBox="0 0 24 24" aria-hidden="true">${BRAND[id].svg}</svg>`;
const idl = (div, ...roles) => `<span class="idl">${[div, ...roles].map(k => `<svg class="bi" viewBox="0 0 24 24" role="img" aria-label="${BRAND[k].label}"><title>${BRAND[k].label}</title>${BRAND[k].svg}</svg>`).join('')}</span>`;
const wordmark = fs.readFileSync(root('.planning/brand/dwdg-one-wordmark.svg'), 'utf8').replace('<svg ', '<svg class="wm" ').replace(/fill="#000000"/g, 'fill="currentColor"');

// People: photos as rounded-square avatars (data URIs so the page is self-contained)
const P = Object.fromEntries(JSON.parse(fs.readFileSync(here('people/people.json'), 'utf8')).people.map(([id, name]) => [name.split(' ')[0], {id, name}]));
const photo = first => `data:image/jpeg;base64,${fs.readFileSync(here(`people/${P[first].id}.jpg`)).toString('base64')}`;
const PH = {}; for (const k of Object.keys(P)) PH[k] = photo(k);
const av = (first, cls = '') => first === 'Mahdy' ? `<span class="av mono ${cls}" title="Mahdy">M</span>` : `<img class="av ${cls}" src="${PH[first]}" alt="${P[first].name}">`;

// Stages: the owner's set, icon + label share one sweeping light
const mask = n => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${PATH(n)}"/></svg>`)}')`;
const STAGES = {all: ['All stages', 'filter'], draft: ['Draft', 'edit'], planned: ['Planned', 'calendar'], active: ['Active', 'circle'], review: ['In review', 'search'], completed: ['Completed', 'check'], hold: ['On hold', 'hand'], cancelled: ['Cancelled', 'close'], archived: ['Archived', 'archive']};
const st = (k, cls = '') => `<span class="st st-${k} ${cls}"><i class="st-ic" style="--m:${mask(STAGES[k][1])}"></i><span class="st-tx">${STAGES[k][0]}</span></span>`;

// ---------- shell ----------
const side = active => `<aside class="side">
  <div class="brand">${wordmark}</div>
  <button class="ws">${b('div-sng', 'ws-ic')}<span><b>Strategy &amp; Growth</b><small>Director, Admin</small></span>${i('chevron-down', 'chev')}</button>
  <nav class="nav">
    <a class="${active === 'work' ? 'on' : ''}">${i('tasks')}<span>My Work</span><em>3</em></a>
    <a>${i('calendar')}<span>Schedule</span></a>
    <h6>Strategy &amp; Growth</h6>
    <a class="${active === 'projects' ? 'on' : ''}">${i('projects')}<span>Projects</span><em>5</em></a>
    <a>${i('folder')}<span>Resources</span></a>
    <h6>Organisation</h6>
    <a>${i('people')}<span>People</span></a>
  </nav>
  <div class="me">${av('Mahdy')}<span><b>Mahdy</b><small>Director of SnG</small></span>${i('settings', 'chev')}</div>
</aside>`;
const top = crumb => `<header class="top"><span class="crumb">${crumb}</span><span class="search">${i('search')}<span>Search or jump to</span><kbd>⌘K</kbd></span><button class="btn pri">${i('plus')}New</button></header>`;

const myWork = () => `<div class="app">${side('work')}<section class="main">${top('<b>My Work</b>')}
<div class="sheets">
  <div class="sheet list">
    <h1>Good morning, Mahdy</h1>
    <p class="sub">Monday 6 October. Two meetings today, four tasks due this week.</p>
    <h2>Needs your response</h2>
    <div class="rows">
      <div class="row inv">${av('Raka')}<div class="t"><b>SnG weekly sync</b><small>Raka invited you for Tue 7 Oct, 10:00 to 10:45 at Kopi Kultur</small></div><button class="btn ghost">Decline</button><button class="ib" title="Suggest another time">${i('clock')}</button><button class="btn pri sm">Accept</button></div>
    </div>
    <h2>Today</h2>
    <div class="rows">
      <div class="row"><span class="tm">09:00</span><div class="t">Strategy review with <span class="who">${av('Salsa', 'xs')}Salsa</span> and <span class="who">${av('Dimas', 'xs')}Dimas</span></div><span class="ctx">${b('div-sng')}SnG</span><span class="due">45 min</span></div>
      <div class="row sel"><span class="cb"></span><div class="t">Draft Q4 growth priorities for <a>SnG roadmap 2026</a></div><span class="ctx">${b('div-sng')}Roadmap 2026</span><span class="due">14:00</span></div>
      <div class="row"><span class="cb"></span><div class="t">Review the partner shortlist with <span class="who">${av('Rani', 'xs')}Rani</span> before Friday</div><span class="ctx">${b('div-ee')}EE handoff</span><span class="due late">Overdue</span></div>
    </div>
    <h2>Upcoming</h2>
    <div class="rows">
      <div class="row"><span class="cb"></span><div class="t">Summarise member survey answers for <a>Open recruitment 2026</a></div><span class="ctx">${b('div-hr')}HR</span><span class="due">Wed</span></div>
      <div class="row"><span class="cb"></span><div class="t">Book a café for the monthly SnG retro</div><span class="due">Fri</span></div>
      <div class="row"><span class="cb"></span><div class="t">Read the Consulting knowledge brief</div><span class="ctx">${b('div-cons')}Cons</span><span class="due muted">No date</span></div>
    </div>
    <p class="done">${i('check')}6 done this week</p>
  </div>
  <aside class="sheet insp">
    <div class="ih"><span>Task</span><button class="ib">${i('more')}</button><button class="ib">${i('close')}</button></div>
    <h3>Draft Q4 growth priorities for SnG roadmap 2026</h3>
    <p class="note">Pull from the September retro and the member survey. Three priorities at most, each with an owner.</p>
    <dl>
      <dt>Due</dt><dd>Today, 14:00</dd>
      <dt>Responsible</dt><dd>${av('Mahdy', 'xs')}Mahdy</dd>
      <dt>Project</dt><dd>${b('div-sng')}SnG roadmap 2026</dd>
      <dt>Linked note</dt><dd><a>Growth priorities 2025 review</a></dd>
      <dt>Created</dt><dd>${av('Salsa', 'xs')}Salsa, 2 Oct 2026 at 09:14</dd>
    </dl>
    <div class="acts"><button class="btn pri">${i('check')}Mark done</button><button class="btn">Edit</button></div>
  </aside>
</div></section></div>`;

const proj = (name, meta, lead, done, total, due, late = false, stage = 'active') => `<div class="prow"><div class="pn"><b>${name}</b><small>${meta}</small></div><span class="lead">${lead ? av(lead, 'xs') + lead : '<span class="muted">No lead</span>'}</span><span class="prog">${total ? `<span class="pc">${done}/${total}</span><span class="bar"><i style="width:${Math.round(done / total * 100)}%"></i></span>` : '<span class="muted">No tasks yet</span>'}</span><span class="due ${late ? 'late' : ''}">${due}</span>${st(stage, 'sm')}</div>`;
const projects = () => `<div class="app">${side('projects')}<section class="main">${top('Strategy &amp; Growth <i>/</i> <b>Projects</b>')}
<div class="sheets one">
  <div class="sheet list">
    <div class="ph"><h1>Projects</h1><button class="btn pri">${i('plus')}New project</button></div>
    <div class="tools"><span class="q">${i('search')}Find a project</span>
      <div class="dd"><button class="btn open">${st('all')}${i('chevron-down', 'chev')}</button>
        <div class="menu">${['all', 'draft', 'planned', 'active', 'review', 'completed'].map((k, n) => `<div class="mi ${n === 0 ? 'on' : ''}">${st(k)}${n === 0 ? i('check', 'tick') : ''}</div>`).join('')}<hr>${['hold', 'cancelled', 'archived'].map(k => `<div class="mi">${st(k)}</div>`).join('')}</div>
      </div>
      <button class="btn">All leads${i('chevron-down', 'chev')}</button><button class="btn">Due date${i('chevron-down', 'chev')}</button></div>
    <div class="colh"><span>Project</span><span>Lead</span><span>Tasks done</span><span>Due</span><span>Stage</span></div>
    <div class="plist">
    ${proj('Member growth survey', 'Created by Salsa on 22 Sep', 'Fikri', 2, 9, '2 Oct', true)}
    ${proj('Q3 strategy report', 'Created by Dimas on 4 Aug', 'Dimas', 11, 12, '10 Oct', false, 'review')}
    ${proj('SnG roadmap 2026', 'Created by Mahdy on 1 Sep', 'Salsa', 7, 12, '18 Oct')}
    ${proj('Alumni mentoring pilot', 'Created by Mahdy on 1 Oct', 'Nadia', 1, 4, '31 Oct')}
    ${proj('Campus partner map', 'Created by Alya on 28 Sep', null, 0, 0, 'No date', false, 'planned')}
    ${proj('Division priorities 2025', 'Created by Mahdy on 2 Jun', 'Rani', 6, 6, '30 Sep', false, 'completed')}
    </div>
  </div>
</div></section></div>`;

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const composer = () => `<div class="comp">
  <div class="cin"><span class="cin-ic">${i('calendar')}</span><p>Strategy sync with <mark>Salsa</mark> and <mark>Dimas</mark> <mark class="t">tomorrow</mark> <mark class="t">45 min</mark></p><kbd>⏎</kbd></div>
  <div class="day"><b>Tuesday 7 October</b><span><button class="ib">${i('chevron-left')}</button><button class="ib">${i('chevron')}</button></span></div>
  <div class="ruler"><span></span>${hours.map(h => `<span>${String(h).padStart(2, '0')}</span>`).join('')}</div>
  <div class="lanes">
    <div class="lane">${av('Mahdy')}<span class="nm"><b>You</b>${idl('div-sng', 'role-director')}</span><div class="track"><i class="busy" style="left:44%;width:12%"></i></div></div>
    <div class="lane">${av('Salsa')}<span class="nm"><b>Salsa</b>${idl('div-sng', 'role-member')}</span><div class="track"><i class="busy" style="left:0;width:22%"></i></div></div>
    <div class="lane">${av('Dimas')}<span class="nm"><b>Dimas</b>${idl('div-cons', 'role-co-director')}</span><div class="track"><i class="unk">No schedule recorded. Unknown, not free</i></div></div>
    <div class="slot"><span>11:00</span></div>
  </div>
  <div class="free">Free for everyone with a schedule <button class="chip on">11:00</button><button class="chip">13:30</button><button class="chip">15:00</button></div>
  <div class="sum"><div><b>Strategy sync with Salsa and Dimas</b><small>Tue 7 Oct, 11:00 to 11:45. Dimas has no schedule recorded.</small></div><span class="avs">${av('Salsa', 'xs')}${av('Dimas', 'xs')}</span></div>
  <div class="ctl"><button class="btn">${i('link')}Kopi Kultur (maps)</button><span class="step"><button class="ib">${i('minus')}</button><b>45 min</b><button class="ib">${i('plus')}</button></span><button class="btn pri">Send invitations<kbd>⏎</kbd></button></div>
</div>`;

const phone = () => `<div class="phone">
  <div class="pbar"><span>9:41</span>${av('Mahdy', 'xs')}</div>
  <h1>My Work</h1><p class="sub">Monday 6 October</p>
  <h2>Needs your response</h2>
  <div class="rows"><div class="row inv-m">${av('Raka', 'xs')}<div class="t"><b>SnG weekly sync</b><small>Tue 10:00 at Kopi Kultur</small></div><button class="btn pri sm">Accept</button></div></div>
  <h2>Today</h2>
  <div class="rows">
    <div class="row"><span class="tm">09:00</span><div class="t">Strategy review</div></div>
    <div class="row"><span class="cb"></span><div class="t">Draft Q4 growth priorities</div><span class="due">14:00</span></div>
    <div class="row"><span class="cb"></span><div class="t">Review partner shortlist</div><span class="due late">Late</span></div>
  </div>
  <h2>Upcoming</h2>
  <div class="rows"><div class="row"><span class="cb"></span><div class="t">Summarise member survey</div><span class="due">Wed</span></div><div class="row"><span class="cb"></span><div class="t">Book a café for the retro</div><span class="due">Fri</span></div></div>
  <nav class="tabbar"><a class="on">${i('tasks')}<span>My Work</span></a><a>${i('calendar')}<span>Schedule</span></a><button class="newbtn" aria-label="New">${i('plus')}</button><a>${i('projects')}<span>Projects</span></a><a>${i('folder')}<span>Resources</span></a></nav>
</div>`;

const stagesBoard = () => `<div class="stboard">${Object.keys(STAGES).map(k => `<div class="stcell">${st(k, 'lg')}</div>`).join('')}</div>`;

const css = fs.readFileSync(here('v2.css'), 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>dwdg’ONE direction, revision 2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<header class="doc"><h1>dwdg’ONE, revised direction</h1>
<p>One direction, rebuilt after your review. No side borders or stripes, one accent, one corner system, real photos in circular avatars, and your stage set.</p></header>
<section class="blk"><h2 class="bh">Project stages</h2><p class="bp">Your set and icons. Planned is brown, In review lime, On hold a brighter yellow; labels stay readable on white. Completed keeps its shifting gradient, which stops when reduced motion is on.</p>${stagesBoard()}</section>
<section class="blk"><h2 class="bh">My Work</h2>${myWork()}</section>
<section class="blk"><h2 class="bh">Projects, with the stage filter open</h2>${projects()}</section>
<section class="blk duo"><div><h2 class="bh">Meeting composer</h2>${composer()}</div><div><h2 class="bh">Phone</h2>${phone()}</div></section>
</body></html>`;
fs.writeFileSync(here('v2.html'), html);
console.log('v2.html', Math.round(html.length / 1024) + ' KB');
