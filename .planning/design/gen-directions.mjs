// Iteration 2 — three visual directions on identical content.
// Run: node .planning/design/gen-directions.mjs  → writes .planning/design/directions.html
import fs from 'node:fs';
import {ICONS as BRAND} from '../brand/gen-icons.mjs';

const root = new URL('../../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const ui = read('experience-ui.mjs');
const s0 = ui.indexOf('const ICONS = {') + 14;
const UI = Function('return ' + ui.slice(s0, ui.indexOf('};', s0) + 1))();
const i = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${UI[n]}"/></svg>`;
const b = (id, cls = '') => `<svg class="bi ${cls}" viewBox="0 0 24 24" aria-hidden="true">${BRAND[id].svg}</svg>`;
const wordmark = read('.planning/brand/dwdg-one-wordmark.svg').replace('<svg ', '<svg class="wm" ').replace(/fill="#000000"/g, 'fill="currentColor"');
const av = (t, k = '') => `<span class="av ${k}">${t}</span>`;

// ---------- shared content ----------
const desktop = () => `
<div class="app">
  <aside class="side">
    <div class="brand">${wordmark}</div>
    <button class="ws">${b('div-sng', 'ws-ic')}<span><b>Strategy &amp; Growth</b><small>Director · Admin</small></span>${i('chevron-down', 'chev')}</button>
    <nav class="nav">
      <p class="cap">Me</p>
      <a class="on">${i('tasks')}<span>My Work</span><em>3</em></a>
      <a>${i('calendar')}<span>Schedule</span></a>
      <p class="cap">Workspace</p>
      <a>${i('projects')}<span>Projects</span><em>5</em></a>
      <a>${i('folder')}<span>Resources</span></a>
      <p class="cap">DWDG</p>
      <a>${i('people')}<span>People</span></a>
    </nav>
    <div class="me">${av('M', 'lg')}<span><b>Mahdy</b><small>${b('role-director')} Director, SnG</small></span>${i('settings', 'chev')}</div>
  </aside>
  <section class="main">
    <header class="top"><span class="crumb">Me <i>/</i> <b>My Work</b></span><span class="search">${i('search')}<span>Search or jump to…</span><kbd>⌘K</kbd></span><button class="btn pri">${i('plus')}New</button></header>
    <div class="body">
      <div class="list">
        <h1 class="hello">Good morning, Mahdy</h1>
        <p class="sub">Monday, 6 October · 2 meetings today · 4 tasks due this week</p>
        <section class="grp"><h2 class="lab">Needs your response <span class="n">1</span></h2>
          <div class="frame"><div class="row inv">${av('RK')}<div class="t"><b>SnG weekly sync</b><small>from Raka · Tue 7 Oct, 10:00–10:45 · Kopi Kultur</small></div><button class="btn">Decline</button><button class="ib" title="Suggest another time">${i('clock')}</button><button class="btn pri sm">Accept</button></div></div>
        </section>
        <section class="grp"><h2 class="lab">Today</h2>
          <div class="frame">
            <div class="row"><span class="time">09:00</span><div class="t">Strategy review with <u>Salsa</u> and <u>Dimas</u></div><span class="ctx">${b('div-sng')}SnG</span><span class="pill">45 min</span></div>
            <div class="row sel"><span class="cb"></span><div class="t">Draft Q4 growth priorities for <a>SnG roadmap 2026</a></div><span class="ctx">◧ SnG roadmap 2026</span><span class="pill">${i('clock')}2pm</span></div>
            <div class="row"><span class="cb"></span><div class="t">Review the partner shortlist with ${av('RN', 'xs')}<u>Rani</u> before Friday’s call</div><span class="ctx">${b('div-ee')}EE handoff</span><span class="pill late">${i('clock')}overdue</span></div>
          </div>
        </section>
        <section class="grp"><h2 class="lab">Upcoming</h2>
          <div class="frame">
            <div class="row"><span class="cb"></span><div class="t">Summarise member survey answers for <a>Open recruitment 2026</a></div><span class="ctx">${b('div-hr')}HR</span><span class="pill">in 2 days</span></div>
            <div class="row"><span class="cb"></span><div class="t">Book a café for the monthly SnG retro</div><span class="pill">Fri</span></div>
            <div class="row"><span class="cb"></span><div class="t">Read the Consulting knowledge brief</div><span class="ctx">${b('div-cons')}Cons</span><span class="pill">no date</span></div>
          </div>
        </section>
        <p class="done">${i('check')}6 done this week</p>
      </div>
      <aside class="insp">
        <div class="ih"><span class="lab">Task</span><button class="ib">${i('more')}</button><button class="ib">${i('close')}</button></div>
        <h3>Draft Q4 growth priorities for SnG roadmap 2026</h3>
        <p class="note">Pull from the September retro and the member survey. Three priorities max, each with an owner.</p>
        <dl>
          <dt>Due</dt><dd>${i('clock')}Today, 14:00</dd>
          <dt>Responsible</dt><dd>${av('M', 'xs')}Mahdy</dd>
          <dt>Context</dt><dd>${b('div-sng')}SnG roadmap 2026</dd>
          <dt>Linked</dt><dd><a>Growth priorities 2025 review</a></dd>
          <dt>Created</dt><dd>by Salsa · 2 Oct 2026, 09:14</dd>
        </dl>
        <div class="acts"><button class="btn pri">${i('check')}Mark done</button><button class="btn">Edit</button></div>
      </aside>
    </div>
  </section>
</div>`;

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const composer = () => `
<div class="comp">
  <div class="cin">${i('calendar', 'cin-ic')}<p>Strategy sync with <mark>Salsa</mark> and <mark>Dimas</mark> <mark class="t">tomorrow</mark> <mark class="t">45 min</mark></p><kbd>⏎</kbd></div>
  <div class="day"><b>Tuesday, 7 Oct</b><span><button class="ib">${i('chevron-left')}</button><button class="ib">${i('chevron')}</button></span></div>
  <div class="ruler"><span></span>${hours.map(h => `<span>${h}</span>`).join('')}</div>
  <div class="lanes">
    <div class="lane">${av('M')}<span class="who"><b>You</b><small>SnG · Director</small></span><div class="track"><i class="busy" style="left:44%;width:12%"></i></div></div>
    <div class="lane">${av('SW')}<span class="who"><b>Salsa</b><small>SnG · Member</small></span><div class="track"><i class="busy" style="left:0;width:22%"></i></div></div>
    <div class="lane">${av('DF')}<span class="who"><b>Dimas</b><small>Cons · CD of Knowledge</small></span><div class="track"><i class="unk">No schedule recorded — unknown, not free</i></div></div>
    <div class="slot" style="--l:24%;--w:8.4%"><span>11:00</span></div>
  </div>
  <div class="free">${i('sparkles')}Free for everyone with a schedule <button class="chip on">11:00</button><button class="chip">13:30</button><button class="chip">15:00</button></div>
  <div class="sum"><div><b>Strategy sync with Salsa &amp; Dimas</b><small>Tue 7 Oct · 11:00–11:45 · 2 guests · Dimas unknown</small></div><span class="avs">${av('SW', 'xs')}${av('DF', 'xs')}</span></div>
  <div class="ctl"><button class="btn loc">${i('link')}Kopi Kultur · maps</button><span class="step"><button class="ib">−</button><b>45 min</b><button class="ib">+</button></span><button class="btn pri">Send invitations <kbd>⏎</kbd></button></div>
</div>`;

const phone = nav => `
<div class="phone">
  <div class="ph-top"><span class="pt">9:41</span>${av('M', 'sm')}</div>
  <h1 class="hello">My Work</h1>
  <p class="sub">Mon 6 Oct · 2 meetings · 4 due</p>
  <h2 class="lab">Needs your response</h2>
  <div class="frame"><div class="row inv-m"><div class="t"><b>SnG weekly sync</b><small>Raka · Tue 10:00 · Kopi Kultur</small></div><button class="btn pri sm">Accept</button></div></div>
  <h2 class="lab">Today</h2>
  <div class="frame">
    <div class="row"><span class="time">09:00</span><div class="t">Strategy review</div></div>
    <div class="row"><span class="cb"></span><div class="t">Draft Q4 growth priorities</div><span class="pill">2pm</span></div>
    <div class="row"><span class="cb"></span><div class="t">Review partner shortlist</div><span class="pill late">late</span></div>
  </div>
  <h2 class="lab">Upcoming</h2>
  <div class="frame">
    <div class="row"><span class="cb"></span><div class="t">Summarise member survey</div><span class="pill">Wed</span></div>
    <div class="row"><span class="cb"></span><div class="t">Book a café for the SnG retro</div><span class="pill">Fri</span></div>
  </div>
  ${nav}
</div>`;

const navs = {
  a: `<nav class="mnav a"><a class="on">${i('tasks')}<span>My Work</span></a><a>${i('calendar')}<span>Schedule</span></a><button class="fab">${i('plus')}</button><a>${i('projects')}<span>Projects</span></a><a>${i('folder')}<span>Resources</span></a></nav>`,
  b: `<nav class="mnav b"><a class="on">${i('tasks')}<span>My Work</span></a><a>${i('calendar')}</a><a>${i('projects')}</a><a>${i('folder')}</a><button class="fab">${i('plus')}</button></nav>`,
  c: `<nav class="mnav c"><a class="on">${i('tasks')}<span>My Work</span></a><a>${i('calendar')}<span>Schedule</span></a><a>${i('projects')}<span>Projects</span></a><a>${i('folder')}<span>Resources</span></a></nav><button class="fab c">${i('plus')}</button>`,
};

const DIRS = [
  {k: 'a', name: 'A · Paper & Ink', pitch: 'Editorial and warm. A cream canvas, white work surfaces set inside tinted frames, monospace section labels and an editorial serif greeting that echoes the dwdg letters. Black tactile primary buttons; green only for live and done states.',
    refs: 'R022–R024 tinted frames and mono labels · R029 tactile black button · R001 date-tile calm · logo serif',
    sw: [['Canvas', '#F3F0E8'], ['Frame', '#EBE7DC'], ['Surface', '#FFFFFF'], ['Ink', '#141412'], ['Muted', '#6B675E'], ['Green', '#00C25A'], ['Green text', '#007A38']],
    type: 'Instrument Serif (greeting) · Plus Jakarta Sans (UI) · JetBrains Mono (labels, times)', nav: 'Bottom bar with labels and a raised centre +'},
  {k: 'b', name: 'B · Signal', pitch: 'Crisp, dense and confident. A white working surface beside a black sidebar that carries the logo. Hairlines instead of cards, tight 8px corners, numbers and times in mono. Green is the “signal”: what is live, selected or free.',
    refs: 'R012 CRM density and inspector · R007 dark action bar · R027 restrained dashboard · logo black/green split',
    sw: [['Canvas', '#FFFFFF'], ['Sidebar', '#0F0F0E'], ['Hover', '#F4F4F2'], ['Ink', '#0F0F0E'], ['Muted', '#686862'], ['Green', '#00C25A'], ['Green text', '#00753A']],
    type: 'Geist (UI) · Geist Mono (numbers, times, labels)', nav: 'Icon bar, label only on the active tab, + at the end'},
  {k: 'c', name: 'C · Soft Stone', pitch: 'Friendly and tactile, phone-first. A warm stone canvas, large rounded grouped surfaces with soft depth, pill-shaped chips and buttons. Calm Samsung-style grouping; green pills mark what is free and done.',
    refs: 'R025 stone mobile and schedule · R016/R014 Samsung grouping · R048/R049 soft pills · R010 settings rows',
    sw: [['Canvas', '#E7E3DC'], ['Surface', '#F9F8F5'], ['Raised', '#FFFFFF'], ['Ink', '#1B1A18'], ['Muted', '#6F6B64'], ['Green', '#00C25A'], ['Green soft', '#D8F5E3']],
    type: 'Plus Jakarta Sans throughout, heavier headings', nav: 'Full-width rounded bar, active tab in a pill, floating + above'},
];

const css = fs.readFileSync(new URL('./directions.css', import.meta.url), 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>dwdg’ONE — visual directions</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<header class="doc"><p class="eyebrow">Iteration 2 · visual directions · 6 October 2026</p><h1>Three ways dwdg’ONE could look</h1>
<p>Same screens, same content, same identity: only the visual language changes. Pick one, or mix (“A’s frames with B’s sidebar”). Content is demo data.</p>
<nav class="jump">${DIRS.map(d => `<a href="#${d.k}">${d.name}</a>`).join('')}</nav></header>
${DIRS.map(d => `<section class="dir dir-${d.k}" id="${d.k}">
  <div class="dhead"><h2>${d.name}</h2><p>${d.pitch}</p>
    <div class="spec"><div class="sws">${d.sw.map(([n, c]) => `<span class="sw"><i style="background:${c}"></i><b>${n}</b><small>${c}</small></span>`).join('')}</div>
    <p><b>Type</b> ${d.type}</p><p><b>Mobile nav</b> ${d.nav}</p><p><b>From your references</b> ${d.refs}</p></div></div>
  <div class="stage-desk">${desktop()}</div>
  <div class="stage-row">${composer()}${phone(navs[d.k])}</div>
</section>`).join('')}
<footer class="doc-foot">Generated by <code>.planning/design/gen-directions.mjs</code> · icons and logo from <code>.planning/brand/</code></footer>
</body></html>`;
fs.writeFileSync(new URL('./directions.html', import.meta.url), html);
console.log('directions.html', html.length);
