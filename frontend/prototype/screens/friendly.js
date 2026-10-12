/* Friendly layer (PM, 10 Oct 2026, D53 to D55). Every feature stays; what changes is how much shows at once.
   Research and the screen audit behind it: .planning/ux/FRIENDLY_UI_RESEARCH.md.
   - Density: Comfortable (default) or Compact (the original look), chosen in Settings (core/app.js density()).
   - Two-level navigation: the "More tools" group in the sidebar; Organization and Settings in the profile menu.
   - Progressive disclosure: fdisc() collapsible sections, used by the task panel (screens/work.js).
   Styles: core/friendly.css and the generated core/comfortable.gen.css. */
'use strict';

// Profile menu: the member's own things and the organization, one tap from the photo.
// The account menu (D60), in Claude's order: who you are, Settings, Language, Theme, Organization, then Sign out.
// Language and Theme open in place with a way back, so the menu never jumps around the screen.
const acctMail = m => m.email || `${m.name.toLowerCase().split(' ').join('.')}@students.uii.ac.id`;
// Look is here too (D63), so Simple, Comfortable and Compact are one tap from the photo in every look.
const LOOK_OPTS = [['simple', 'Simple', 'Only what you need, bigger text'], ['comfortable', 'Comfortable', 'Every feature, calm'], ['compact', 'Compact', 'Every feature, dense']];
function acctMenu() { const m = me(), sub = ui.acctSub, th = session.theme || 'light';
  // in Simple, leaders reach Attention and Performance from here (the Simple tabs stay at four)
  const team = look() === 'simple' ? capsFor(ws(), m).filter(c => ['attention', 'performance'].includes(c[0])) : [];
  const pick = (act, k, attr, on, label) => `<div class="mi ${on ? 'on' : ''}" data-act="${act}" ${attr}="${k}" tabindex="0" role="menuitemradio" aria-checked="${on}"><span class="mi-l">${label}</span>${on ? icon('check', 'tick') : ''}</div>`;
  if (sub === 'lang') return `<div class="mi acct-back" data-act="acct-sub" data-k="" tabindex="0" role="menuitem"><span class="mi-l">${icon('chevron-left')}${L('Language')}</span></div><hr>${pick('lang', 'en', 'data-l', lang() === 'en', 'English')}${pick('lang', 'id', 'data-l', lang() === 'id', 'Bahasa Indonesia')}`;
  if (sub === 'look') return `<div class="mi acct-back" data-act="acct-sub" data-k="" tabindex="0" role="menuitem"><span class="mi-l">${icon('chevron-left')}${L('Look')}</span></div><hr>${LOOK_OPTS.map(([k, l, d]) => `<div class="mi acct-look ${look() === k ? 'on' : ''}" data-act="look" data-k="${k}" tabindex="0" role="menuitemradio" aria-checked="${look() === k}"><span class="mi-l"><span><b>${L(l)}</b><small>${L(d)}</small></span></span>${look() === k ? icon('check', 'tick') : ''}</div>`).join('')}`;
  if (sub === 'theme') return `<div class="mi acct-back" data-act="acct-sub" data-k="" tabindex="0" role="menuitem"><span class="mi-l">${icon('chevron-left')}${L('Theme')}</span></div><hr>${[['light', 'Light'], ['dark', 'Dark'], ['system', 'Match your device']].map(([k, l]) => pick('theme', k, 'data-t', th === k, L(l))).join('')}`;
  const next = (k, ic, label, val) => `<div class="mi" data-act="acct-sub" data-k="${k}" tabindex="0" role="menuitem"><span class="mi-l">${icon(ic)}${label}</span><small>${val}</small>${icon('chevron', 'ic-sm acct-go')}</div>`;
  return `<div class="acct-h">${esc(acctMail(m))}</div>
    ${mi('go', L('Settings'), 'settings', 'data-h="settings"', '<span class="kbd">Ctrl+,</span>')}
    ${next('lang', 'globe', L('Language'), lang() === 'en' ? 'English' : 'Bahasa Indonesia')}
    ${next('look', 'home', L('Look'), L(LOOK_OPTS.find(x => x[0] === look())[1]))}
    ${next('theme', th === 'dark' ? 'moon' : 'sun', L('Theme'), L(th === 'dark' ? 'Dark' : th === 'system' ? 'Match your device' : 'Light'))}
    ${mi('go', L('Organization'), 'people', 'data-h="organisation"')}${team.length ? `<hr>${team.some(c => c[0] === 'attention') ? `<div class="mi-h">${L('Team')}</div>` : ''}${team.map(([h, i, l]) => mi('go', L(navLabel(h, l)), i, `data-h="${h}"`)).join('')}` : ''}<hr>${mi('f-signout', L('Sign out'), 'logout')}`; }
MENUS.fme = () => { if (look() !== 'simple') return acctMenu(); const m = me();
  return `<div class="f-prof">${av(m.id, 'av-lg')}<div><b>${esc(m.name)}</b><small>${esc(roleText(m))}</small></div></div><hr>
    ${look() === 'comfortable' ? '' : mi('go', L('Settings'), 'settings', 'data-h="settings"')}${mi('go', L('Organization'), 'people', 'data-h="organisation"')}<hr>${mi('f-signout', L('Sign out'), 'logout')}`; };

// A collapsible section (D55). Opens by itself when something inside needs the member (attention); the member's own choice wins
// after that and is remembered per section. Empty sections are left out.
function fdisc(key, title, body, opt = {}) {
  if (!body || !body.trim()) return '';
  const st = session.fdisc || {}, open = st[key] != null ? st[key] : !!opt.attention;
  return `<section class="fdisc"><button class="fdisc-h" data-act="fdisc" data-k="${key}" aria-expanded="${open}">${icon('chevron')}<span>${title}</span>${opt.attention ? `<i class="dot" aria-label="${esc(L('Needs attention'))}"></i>` : ''}${opt.count ? `<small>${opt.count}</small>` : ''}</button><div class="fdisc-b" ${open ? '' : 'hidden'}>${body}</div></section>`;
}

Object.assign(ACT, {
  'f-menu': el => { const rc = el.getBoundingClientRect(), up = !!el.dataset.up; ui.acctSub = ''; ui.menu = {type: el.dataset.menu, rect: rc, alignRight: !up && rc.left > innerWidth / 2, width: up ? Math.max(260, Math.round(rc.width)) : 272, est: 240, up}; renderLayer(); },
  'acct-sub': (el, id, e) => { if (e) e.stopPropagation(); ui.acctSub = el.dataset.k || ''; renderLayer(); setTimeout(() => { const f = $('.popmenu .mi'); if (f) f.focus(); }, 0); },
  'f-signout': () => { ui.menu = null; renderLayer(); ACT.signout(); },
  'nav-more': el => { session.navMore = el.getAttribute('aria-expanded') !== 'true'; saveSession(); render(); },
  fdisc: el => { const st = session.fdisc = session.fdisc || {}; st[el.dataset.k] = el.getAttribute('aria-expanded') !== 'true'; saveSession(); render(); },
  density: el => { session.density = el.dataset.d; saveSession(); render(); },
  // The look (D56): Simple, Comfortable or Compact. Settings stays open after the switch so the member can compare.
  look: el => { session.look = el.dataset.k; delete session.density; ui.insp = null; ui.menu = null; saveSession(); renderLayer(); if (el.dataset.k === 'simple' && !SIMPLE_PAGES.includes(route().page)) go('work'); else render(); },
});
