/* Pinned (owner, 11 Oct, D59). Each person keeps their own short list of anything they come back to: a project, a program, an
   operation or a resource. It shows in the sidebar with each item's own art (reference R012's saved views). The list starts from the
   person's current work (their open projects and the resources their division pinned) and is theirs to change from any item's page.
   Records: db.pins[personId] = [{k: 'project' | 'program' | 'routine' | 'res', id}]. */
'use strict';
const PIN_KIND = {
  project: {of: id => projOf(id), ok: x => canSeeProject(x) && !['cancelled', 'archived'].includes(x.stage), art: x => projObj(x, 'xs'), href: x => `#/projects/${x.id}`},
  program: {of: id => pgOf(id), ok: x => visibleDivs(me()).includes(x.div), art: x => pgObj(x, 'xs'), href: x => `#/programs/${x.id}`},
  routine: {of: id => rtOf(id), ok: x => canSeeRt(x), art: x => rtObj(x, 'xs'), href: x => `#/operations/${x.id}`},
  res: {of: id => resOf(id), ok: x => !x.archived && visibleDivs(me()).includes(x.div), art: x => `<span class="pin-res">${resTile(x)}</span>`, href: () => '#/resources'},
};
function myPins() { const m = me(); if (!m) return []; db.pins = db.pins || {};
  if (!db.pins[m.id]) { // first time: start from the person's current work
    db.pins[m.id] = [...calmPins(m).map(p => ({k: 'project', id: p.id})), ...db.resources.filter(r => r.pinned && r.div === m.div && !r.archived).slice(0, 3).map(r => ({k: 'res', id: r.id}))]; save(); }
  return db.pins[m.id].map(p => ({...p, x: PIN_KIND[p.k] && PIN_KIND[p.k].of(p.id)})).filter(p => p.x && PIN_KIND[p.k].ok(p.x)); }
const isPinned = (k, id) => myPins().some(p => p.k === k && p.id === id);
const pinBtn = (k, id) => { const on = isPinned(k, id); return `<button class="btn btn-sm pin-btn ${on ? 'on' : ''}" data-act="pin" data-k="${k}" data-id="${id}" aria-pressed="${on}">${icon('pin')}${on ? L('Pinned') : L('Pin')}</button>`; };
// One sidebar line per pin, with the item's own art.
const pinLink = (p, r) => { const K = PIN_KIND[p.k], x = p.x, on = (p.k === 'project' && r.page === 'projects' && r.id === x.id) || (p.k === 'program' && r.page === 'programs' && r.id === x.id) || (p.k === 'routine' && r.page === 'operations' && r.id === x.id);
  return `<a href="${K.href(x)}" class="cs-pin ${on ? 'on' : ''}" ${p.k === 'res' ? `data-act="open-res" data-id="${x.id}"` : ''}>${K.art(x)}<span>${esc(x.name)}</span></a>`; };
function togglePin(k, id) { return DBCommit.run(() => { const m = me(); myPins(); const list = db.pins[m.id], prev = list.slice(), i = list.findIndex(p => p.k === k && p.id === id);
  if (i >= 0) list.splice(i, 1); else list.unshift({k, id});
  ui.menu = null; renderLayer(); save(); render(); toast(i >= 0 ? L('Unpinned') : L('Pinned to your sidebar'), () => { db.pins[m.id] = prev; rerender(); }); }); }
Object.assign(ACT, {
  pin: el => togglePin(el.dataset.k, el.dataset.id),
  'res-pin': (el, id) => togglePin('res', id),
});
