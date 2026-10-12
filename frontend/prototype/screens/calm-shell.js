/* Comfortable look, rebuilt from the owner's own references (11 Oct, D57). Every element traces to one of them:
   - R012 (CRM): a short sidebar on the canvas (search, the four main pages, pinned projects in the "saved views" slot, the
     workspace tools in the "segments" slot, Settings and the profile at the bottom), the page in one white sheet and the
     details docked beside it in a second sheet;
   - R025 (Salung, phone): page title with quiet icon buttons, a floating pill tab bar and a separate round black +.
   The page styling for this look is core/calm.css (body[data-look="comfortable"]). Simple and Compact are untouched. */
'use strict';
const calmTools = (m, w) => [['changes', 'activity', 'Changes'], ...capsFor(w, m).map(([h, i, l]) => [h, i, l])].filter(x => inShip(x[0]));
// Pinned projects: the open projects the person leads, manages or has work in, nearest target first, at most four.
function calmPins(m) {
  const mine = p => [p.lead, p.pm].includes(m.id) || db.tasks.some(t => t.project === p.id && !t.trashed && (t.owner === m.id || joinedOf(t).includes(m.id)));
  return db.projects.filter(p => !['completed', 'cancelled', 'archived'].includes(p.stage) && mine(p)).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 4);
}

function calmShell(content, crumb) {
  const m = me(), w = div(ws()), r = route(), c = counts(), many = visibleDivs(m).length > 1;
  const pins = myPins().slice(0, 8), tools = calmTools(m, w.id), pinnedHere = pins.some(p => (p.k === 'project' && r.page === 'projects' || p.k === 'program' && r.page === 'programs' || p.k === 'routine' && r.page === 'operations') && p.id === r.id);
  const link = (h, ic, l, n) => `<a href="#/${h}" class="${r.page === h && !(r.id && pinnedHere) ? 'on' : ''}" ${r.page === h ? 'aria-current="page"' : ''}>${icon(ic)}<span>${L(navLabel(h, l))}</span>${n ? `<em>${n}</em>` : ''}</a>`;
  const open = tools.some(x => x[0] === r.page) || navMoreOpen(m);
  const wsHead = many ? `<button class="cs-ws" data-act="menu" data-menu="ws" aria-haspopup="menu" aria-label="${esc(L('Workspace: {name}. Switch workspace', {name: w.name}))}">${bicon(w.icon, false)}<b>${esc(w.name)}</b>${icon('chevron-down', 'chev')}</button>` : '';
  return `<div class="app cs-app">
  <aside class="side cs-side" aria-label="${esc(L('Navigation'))}">
    <a class="brand" href="#/work" aria-label="dwdg’ONE, ${esc(L('My Work'))}">${A.wordmark}</a>
    ${wsHead}
    <button class="cs-search" data-act="palette">${icon('search', 'ic-sm')}<span>${L('Search')}</span><span class="kbd">Ctrl K</span></button>
    <nav class="nav cs-nav">
      ${link('work', 'tasks', 'My Work', c.attention)}${link('schedule', 'calendar', 'Schedule')}${link('updates', 'bell', 'Updates', c.unread)}
      <h6 class="cs-h">${L('Work')}</h6>${link('programs', 'program', 'Programs')}${link('projects', 'projects', 'Projects')}${link('operations', 'routine', 'Operations')}${inShip('resources') ? link('resources', 'resources', 'Resources') : ''}
      <h6 class="cs-h">${L('Pinned')}</h6>${pins.length ? pins.map(p => pinLink(p, r)).join('') : `<p class="cs-hint">${L('Pin anything from its page.')}</p>`}
      ${tools.length ? `<button class="cs-h cs-grp" data-act="nav-more" aria-expanded="${open}" aria-controls="cs-tools"><span>${esc(w.short || w.name)}</span>${icon(open ? 'chevron-down' : 'chevron', 'ic-sm')}</button>
      <div id="cs-tools" class="cs-tools" ${open ? '' : 'hidden'}>${tools.map(([h, i, l]) => link(h, i, l)).join('')}</div>` : ''}
    </nav>
    <div class="cs-foot">
      <button class="me cs-acct ${ui.menu && ui.menu.type === 'fme' ? 'open' : ''}" data-act="f-menu" data-menu="fme" data-up="1" aria-haspopup="menu" aria-label="${esc(L('Your account, Settings and Organization'))}">${av(m.id)}<span><b>${esc(m.name)}</b><small>${esc(roleText(m))}</small></span>${icon('chevron-down', 'ic-sm cs-chev')}</button></div>
  </aside>
  <section class="main" id="main">
    <header class="top cs-top"><span class="crumb">${crumb}</span>
      <div class="hist" role="group" aria-label="${esc(L('History'))}">${histBtns()}</div>
      <button class="ib cs-phone" data-act="palette" aria-label="${esc(L('Search'))}">${icon('search')}</button>
      <a class="ib cs-phone" href="#/updates" aria-label="${esc(L('Updates'))}">${icon('bell')}${c.unread ? `<em>${c.unread}</em>` : ''}</a>
      <button class="btn btn-pri newg cs-new" data-act="menu" data-menu="new" aria-haspopup="menu">${icon('plus')}<span>${L('New')}</span></button></header>
    <div class="sheets ${ui.insp ? 'with-insp' : ''}"><div class="sheet" id="scroller">${content}</div>${ui.insp ? `<div class="cs-scrim" data-act="close-insp"></div><aside class="sheet insp-sheet" aria-label="${esc(L('Details'))}"><div class="insp">${inspector()}</div></aside>` : ''}</div>
  </section></div>
  <nav class="tabbar cs-tabbar" aria-label="${esc(L('Main'))}"><div class="cs-pill">${tab('work', 'tasks', 'My Work', c.attention)}${tab('projects', 'projects', 'Projects')}${tab('schedule', 'calendar', 'Schedule')}<button class="tb-more ${MORE_PAGES.includes(r.page) ? 'on' : ''}" data-act="menu" data-menu="more" aria-haspopup="menu">${icon('menu')}<span>${L('More')}</span></button></div><button class="newbtn" data-act="menu" data-menu="new" aria-label="${esc(L('New'))}">${icon('plus')}</button></nav>`;
  function tab(h, i, l, n) { return `<a href="#/${h}" class="${r.page === h ? 'on' : ''}">${icon(i)}${n ? `<em>${n}</em>` : ''}<span>${L(l)}</span></a>`; }
}

// R009: a long title fades out at the right edge. Only titles that really overflow get the fade, so short ones stay crisp.
function calmFade() { if (look() !== 'comfortable') return; document.querySelectorAll('.r9-tt').forEach(el => el.classList.toggle('fade', el.scrollWidth > el.clientWidth + 1)); }
new MutationObserver(() => requestAnimationFrame(calmFade)).observe(document.body, {childList: true, subtree: true});
addEventListener('resize', () => requestAnimationFrame(calmFade));
