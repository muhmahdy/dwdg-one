/* Hand in and assess (owner, 11 Oct, D58), the way Google Classroom works. A task someone gave you (it has a signer, D35) is
   finished by handing in your work: links to it, and a message if you want. The giver opens what you handed in, rates it
   (Needs work, Good, Excellent) and accepts it, or returns it with a comment. The rating is recorded with the task and counted in
   Performance. Built on the existing sign-off: handing in moves the task to In review with the giver; accepting signs it off.
   Records: t.submissions = [{id, at, by, links: [{url, label}], note, withdrawn?, review?: {by, at, result, rating, comment}}];
   t.evidence mirrors the first link for older readers; t.rating holds the accepted rating. */
'use strict';
const RATING = {'needs-work': ['Needs work', 'warning', 'warn'], good: ['Good', 'check', 'green'], excellent: ['Excellent', 'sparkles', 'green']};
const RATING_ORDER = ['needs-work', 'good', 'excellent'];
const rateChip = k => k && RATING[k] ? state(L(RATING[k][0]), RATING[k][1], RATING[k][2]) : '';
// A label people recognise, from the link itself (the work stays in Google Drive or wherever it lives).
function linkLabel(url) { try { const u = new URL(url), h = u.hostname.replace(/^www\./, '');
  if (h === 'docs.google.com') return /\/spreadsheets\//.test(u.pathname) ? 'Google Sheets' : /\/presentation\//.test(u.pathname) ? 'Google Slides' : /\/forms\//.test(u.pathname) ? 'Google Forms' : 'Google Docs';
  return {'drive.google.com': 'Google Drive', 'figma.com': 'Figma', 'canva.com': 'Canva', 'github.com': 'GitHub', 'notion.so': 'Notion', 'youtube.com': 'YouTube', 'classroom.google.com': 'Google Classroom'}[h] || h; } catch (e) { return url; } }
const subsOf = t => (t.submissions || []).filter(s => !s.withdrawn);
const lastSub = t => { const s = subsOf(t); return s[s.length - 1] || null; };
const isHandIn = t => !!t && !isSummary(t) && (!!signerFor(t) || subsOf(t).length > 0);
// The doer hands in instead of ticking: the giver checks the work before it counts as done.
const needsHandIn = t => !!t && t.owner === session.me && !!signerFor(t) && !canSignOff(t) && !isDone(t) && t.status !== 'review' && !isSummary(t);
const hiDraft = t => { if (!ui.hi || ui.hi.id !== t.id) ui.hi = {id: t.id, links: [''], note: '', rating: null, comment: '', err: '', confirm: false}; return ui.hi; };
const linkRow = l => `<a class="hi-link" href="${esc(l.url)}" target="_blank" rel="noopener">${icon('link')}<span><b>${esc(l.label || linkLabel(l.url))}</b><small>${esc(l.url.replace(/^https:\/\//, ''))}</small></span>${icon('external', 'ic-sm')}</a>`;
const subBody = s => `${s.links.length ? `<div class="hi-links">${s.links.map(linkRow).join('')}</div>` : `<p class="t-small t-mute">${L('No work was attached.')}</p>`}${s.note ? `<p class="hi-note">${esc(s.note)}</p>` : ''}`;
function hiHistory(t) { const cur = lastSub(t);
  // Earlier attempts: every assessed hand-in except the one already shown above (under review, accepted, or just returned).
  const past = subsOf(t).filter(s => s.review && s !== cur);
  if (!past.length) return '';
  return `<details class="hi-hist"><summary>${plural(past.length, '{n} earlier attempt', '{n} earlier attempts')}</summary>${past.map((s, i) => `<div class="hi-att"><div class="hi-att-h"><b>${L('Attempt {n}', {n: i + 1})}</b><small>${esc(stamp(s.by, s.at))}</small></div>${subBody(s)}${s.review ? `<p class="t-small"><b>${esc(L(s.review.result === 'accepted' ? 'Accepted by {who}' : 'Returned by {who}', {who: first(s.review.by)}))}</b>${s.review.comment ? `: ${esc(s.review.comment)}` : ''}</p>` : ''}</div>`).join('')}</details>`; }

// The box at the top of the task panel. Empty when the task is not handed in to anyone.
function hiBox(t) {
  if (!isHandIn(t)) return '';
  const m = me(), mine = t.owner === m.id, cur = lastSub(t), giver = t.reviewer || signerFor(t);
  // Handed in, waiting for the giver
  if (t.status === 'review' && cur && !cur.review) {
    if (mine) return `<section class="hi-box"><div class="hi-h">${state(L('Handed in'), 'check', 'green')}<small>${esc(L('To {who}, {when}', {who: first(giver), when: ago(cur.at)}))}</small></div>${subBody(cur)}<div class="acts"><button class="btn btn-sm" data-act="hi-unsubmit" data-id="${t.id}">${L('Unsubmit')}</button></div><p class="t-small t-mute">${L('{who} checks your work and accepts it or returns it with a comment.', {who: esc(first(giver))})}</p>${hiHistory(t)}</section>`;
    if (canSignOff(t)) { const d = hiDraft(t);
      return `<section class="hi-box hi-assess"><div class="hi-h">${av(t.owner, 'av-sm')}<b>${esc(L('{who} handed in their work', {who: first(t.owner)}))}</b><small>${ago(cur.at)}</small></div>${subBody(cur)}
        <div class="field"><label>${L('How good is it?')}</label><div class="hi-rate" role="radiogroup" aria-label="${esc(L('Rating'))}">${RATING_ORDER.map(k => `<button class="${d.rating === k ? 'on' : ''} r-${k}" data-act="hi-rate" data-id="${t.id}" data-r="${k}" role="radio" aria-checked="${d.rating === k}">${rateChip(k)}</button>`).join('')}</div></div>
        <div class="field"><label for="hi-comment">${L('Comment')} <span class="opt">${L('Needed when you return it')}</span></label><textarea class="textarea sm" id="hi-comment" data-input="hi-comment">${esc(d.comment)}</textarea></div>
        ${d.err ? `<p class="hi-err" role="alert">${esc(d.err)}</p>` : ''}
        <div class="acts"><button class="btn btn-pri" data-act="hi-accept" data-id="${t.id}">${icon('check')}${L('Accept')}</button><button class="btn" data-act="hi-return" data-id="${t.id}">${L('Return')}</button></div>${hiHistory(t)}</section>`; }
    return `<section class="hi-box"><div class="hi-h">${state(L('Handed in'), 'check', 'green')}<small>${esc(L('Waiting for {who} to assess', {who: first(giver)}))}</small></div>${subBody(cur)}</section>`;
  }
  // Accepted
  if (isDone(t) && cur && cur.review && cur.review.result === 'accepted') return `<section class="hi-box hi-done"><div class="hi-h"><b>${L('Accepted, rated')}</b>${rateChip(cur.review.rating)}<small>${esc(stamp(cur.review.by, cur.review.at))}</small></div>${cur.review.comment ? `<p class="hi-note">${esc(cur.review.comment)}</p>` : ''}${subBody(cur)}${hiHistory(t)}</section>`;
  if (isDone(t)) return '';
  // Open: returned work first, then the hand-in form for the doer
  const back = cur && cur.review && cur.review.result === 'returned' ? `<div class="hi-back">${icon('undo')}<div><b>${esc(L('Returned by {who}', {who: first(cur.review.by)}))}</b><p>${esc(cur.review.comment)}</p></div></div>` : '';
  if (!mine || !needsHandIn(t)) return back || subsOf(t).length ? `<section class="hi-box">${back}<p class="t-small t-mute">${L('Not handed in yet.')}</p>${hiHistory(t)}</section>` : `<section class="hi-box"><p class="t-small t-mute">${esc(L('{who} hands this in when it is done.', {who: first(t.owner)}))}</p></section>`;
  const d = hiDraft(t);
  return `<section class="hi-box hi-form">${back}<div class="hi-h"><b>${L('Your work')}</b><small>${esc(L('Hand it in to {who}', {who: first(giver)}))}</small></div>
    ${d.links.map((v, i) => `<div class="hi-in">${icon('link')}<input class="input" type="url" data-input="hi-link" data-i="${i}" placeholder="${esc(L('Paste a link, for example a Google Doc'))}" value="${esc(v)}" aria-label="${esc(L('Link to your work'))}">${d.links.length > 1 ? `<button class="ib" data-act="hi-del" data-i="${i}" aria-label="${esc(L('Remove this link'))}">${icon('close', 'ic-sm')}</button>` : ''}</div>`).join('')}
    <button class="linkbtn" data-act="hi-add">${icon('plus', 'ic-xs')} ${L('Add another link')}</button>
    <div class="field"><label for="hi-note">${L('Message to {who}', {who: esc(first(giver))})} <span class="opt">${L('Optional')}</span></label><textarea class="textarea sm" id="hi-note" data-input="hi-note">${esc(d.note)}</textarea></div>
    ${d.err ? `<p class="hi-err" role="alert">${esc(d.err)}</p>` : ''}
    ${d.confirm ? `<div class="hi-confirm"><p>${L('Hand in without attaching your work?')}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="hand-in" data-id="${t.id}" data-force="1">${L('Hand in anyway')}</button><button class="btn btn-ghost btn-sm" data-act="hi-noconfirm">${L('Add a link')}</button></div></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="hand-in" data-id="${t.id}">${icon('upload')}${esc(L('Hand in to {who}', {who: first(giver)}))}</button></div>`}${hiHistory(t)}</section>`;
}

ON_INPUT['hi-link'] = el => { if (ui.hi) { ui.hi.links[+el.dataset.i] = el.value; ui.hi.err = ''; } };
ON_INPUT['hi-note'] = el => { if (ui.hi) ui.hi.note = el.value; };
ON_INPUT['hi-comment'] = el => { if (ui.hi) { ui.hi.comment = el.value; } };
const hiSnap = t => JSON.parse(JSON.stringify({status: t.status, doneAt: t.doneAt, reviewer: t.reviewer, doneBy: t.doneBy || null, finishedAt: t.finishedAt || null, signedBy: t.signedBy || null, signedAt: t.signedAt || null, evidence: t.evidence || '', rating: t.rating || null, returnNote: t.returnNote || '', reviewChoice: t.reviewChoice || null, reviewedAt: t.reviewedAt || null, submissions: t.submissions || []}));
const dropUpdate = (type, t, to) => { db.updates = db.updates.filter(u => !(u.type === type && u.ref.id === t.id && u.to === to && !u.read)); };

Object.assign(ACT, {
  'hi-add': () => { if (!ui.hi) return; ui.hi.links.push(''); render(); setTimeout(() => { const ins = $$('[data-input="hi-link"]'); if (ins.length) ins[ins.length - 1].focus(); }, 0); },
  'hi-del': el => { if (!ui.hi) return; ui.hi.links.splice(+el.dataset.i, 1); render(); },
  'hi-noconfirm': () => { if (!ui.hi) return; ui.hi.confirm = false; render(); setTimeout(() => { const i = $('[data-input="hi-link"]'); if (i) i.focus(); }, 0); },
  'hand-in': (el, id) => { const t = taskOf(id), d = ui.hi; if (!t || !d || !needsHandIn(t)) return;
    const urls = d.links.map(v => v.trim()).filter(Boolean);
    if (urls.some(u => !/^https:\/\/\S+\.\S+/.test(u))) { d.err = L('Use full links that start with https://'); return render(); }
    if (!urls.length && !el.dataset.force) { d.confirm = true; return render(); }
    const m = me(), sg = signerFor(t), prev = hiSnap(t);
    const sub = {id: uid('sub'), at: nowStamp(), by: m.id, links: urls.map(url => ({url, label: linkLabel(url)})), note: d.note.trim()};
    t.submissions = [...(t.submissions || []), sub]; t.evidence = urls[0] || ''; t.returnNote = ''; t.reviewer = sg; t.doneBy = m.id; t.finishedAt = sub.at;
    ui.hi = null; setStatus0(t, 'review', {silent: true});
    toast(L('Handed in to {who}', {who: first(sg)}), () => { Object.assign(t, prev); dropUpdate('review', t, sg); rerender(); }); },
  'hi-unsubmit': (el, id) => { const t = taskOf(id), cur = t && lastSub(t); if (!t || !cur || cur.review || t.owner !== session.me || t.status !== 'review') return;
    const prev = hiSnap(t), who = t.reviewer; cur.withdrawn = nowStamp(); dropUpdate('review', t, who); setStatus0(t, 'doing', {silent: true});
    toast(L('Unsubmitted. You can change your work and hand it in again.'), () => { Object.assign(t, prev); rerender(); }); },
  'hi-rate': el => { if (!ui.hi) return; ui.hi.rating = el.dataset.r; ui.hi.err = ''; render(); },
  'hi-accept': (el, id) => { const t = taskOf(id), d = ui.hi, cur = t && lastSub(t); if (!t || !d || !cur || !canSignOff(t)) return;
    if (!d.rating) { d.err = L('Choose a rating before you accept.'); return render(); }
    const prev = hiSnap(t), m = me();
    cur.review = {by: m.id, at: nowStamp(), result: 'accepted', rating: d.rating, comment: d.comment.trim()}; t.rating = d.rating; t.reviewChoice = 'approved'; t.reviewedAt = cur.review.at;
    ui.hi = null; setStatus(t, 'done', {silent: true});
    toast(L('Accepted and rated {r}', {r: L(RATING[cur.review.rating][0])}), () => { Object.assign(t, prev); dropUpdate('approved', t, t.owner); rerender(); }); },
  'hi-return': (el, id) => { const t = taskOf(id), d = ui.hi, cur = t && lastSub(t); if (!t || !d || !cur || !canSignOff(t)) return;
    if (!d.comment.trim()) { d.err = L('Say what needs to change, so {who} knows what to do.', {who: first(t.owner)}); render(); setTimeout(() => $('#hi-comment') && $('#hi-comment').focus(), 0); return; }
    const prev = hiSnap(t), m = me();
    cur.review = {by: m.id, at: nowStamp(), result: 'returned', rating: null, comment: d.comment.trim()}; t.returnNote = cur.review.comment; t.reviewChoice = 'returned'; t.reviewedAt = cur.review.at; t.reviewer = m.id;
    ui.hi = null; setStatus0(t, 'doing', {silent: true});
    toast(L('Returned to {who}', {who: first(t.owner)}), () => { Object.assign(t, prev); dropUpdate('returned', t, t.owner); rerender(); }); },
});
// Ticking, or choosing Completed, on a task someone gave you opens the hand-in form instead.
{ const tg = ACT.toggle; ACT.toggle = (el, id, e) => { const t = taskOf(id); if (needsHandIn(t)) { if (e) e.stopPropagation(); ui.insp = {type: 'task', id}; ui.form = null; render(); setTimeout(() => { const i = $('[data-input="hi-link"]'); if (i) i.focus(); }, 40); return; } tg(el, id, e); }; }
{ const od = ACT['op-done']; ACT['op-done'] = (el, id, e) => { const t = taskOf(id); if (needsHandIn(t)) { if (e) e.stopPropagation(); ui.insp = {type: 'task', id}; render(); return; } od(el, id, e); }; }
{ const ss = ACT['set-status']; ACT['set-status'] = (el, id) => { const t = taskOf(id); if (el.dataset.s === 'done' && needsHandIn(t)) { ui.menu = null; renderLayer(); ui.insp = {type: 'task', id}; render(); return; } ss(el, id); }; }

// Capture the draft, assessment and notifications before any status wrapper changes them.
DBCommit.wrapActions(ACT, ['toggle', 'op-done', 'set-status', 'review-approve', 'review-return', 'hand-in', 'hi-unsubmit', 'hi-accept', 'hi-return']);
