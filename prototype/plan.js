/* Projects, project pages, Resources, Updates, Changes, Organisation and Settings. UX2 screens for W016, W017 (and the
   Updates/Changes/Organisation/Settings destinations listed in PRD_ALIGNMENT §7).
   Requirements: work_projects_register, measure-project-row, work_overview, work_project_tabs, work_project_lifecycle,
   work_milestones, work_blockers, work_decisions, access_project_creation_cd, resource_explorer, resource_inspector,
   resource_bubbles, resource_tasks, resource_object_note, resource_link_issue, resource_pin, measure-resource-row,
   measure-notes, work_updates, changes-scope, changes-location, measure-changes, work_organization, work_settings. */
'use strict';
const ENDED = ['completed', 'cancelled', 'archived'];

// ---------- visual identity v2 (owner review O3/O4, 6 Oct) ----------
// design-resource-identity and design-shaders, promoted by the owner (request R5).
// A project is drawn as a "project object": a sleeve with a small chamfered tab and a quiet rear plate, so it reads as a
// body of work rather than an app icon or a folder. Each project gets its own shader family AND a muted palette, chosen once
// at creation to differ from the other projects in its workspace, then saved (look = {f, p}), so it always looks the same.
// Resources use their type's silhouette: folder, note page with a folded corner, link disc. The shape alone tells the type.
// Rules from design-shaders: one shared offscreen WebGL context, still images by default, animation only while hovered and
// never in a background tab or under reduced motion, CSS gradient when WebGL is missing. Text never sits on the art.
const PALS = [['Sage', '#86A38A', '#3E5E48', '#CFDDC9'], ['Coral', '#D08470', '#8A4235', '#F0CBBE'], ['Olive', '#A8B45A', '#5B6827', '#DCE1AE'], ['Violet', '#8F7FAD', '#4F426E', '#D3CAE3'], ['Ochre', '#C79C55', '#7A5A25', '#E8D3A8'],
  ['Emerald', '#479C78', '#1F5C45', '#AEDAC4'], ['Slate', '#7189AA', '#36496A', '#C6D2E3'], ['Terracotta', '#B96F52', '#6D3826', '#E5C2AE'], ['Teal', '#5F9799', '#2D5658', '#BBD6D5'], ['Plum', '#9C6283', '#5B2E49', '#DDBDCF']];
const FAMILIES = ['Flow', 'Caustic', 'Contour', 'Pixel', 'Grain', 'Orbit', 'Waves', 'Cells'];
const IDN = (() => {
  const cache = new Map(); let gl = null, cv = null, U = null, ok = null, anim = null;
  const hash = str => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const FS = `precision mediump float;
uniform vec2 r; uniform float t, s; uniform vec3 c1, c2, c3; uniform int mode;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + s * 91.7) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int k = 0; k < 5; k++){ v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
void main(){
  float ar = r.x / r.y; vec2 uv = gl_FragCoord.xy / r, q = vec2(uv.x * ar, uv.y), p = q * (1.4 + s * .9) + s * 13.;
  vec3 col;
  if (mode == 0) { float f = fbm(p * .9 + vec2(0., t * .05)); float v = sin((p.x + f * 3.) * 3.2 + t * .4); col = mix(c1, c2, smoothstep(-.7, .7, v)); col = mix(col, c3, smoothstep(.8, 1., abs(v)) * .55); }
  else if (mode == 1) { vec2 z = p * 1.4; float c = 0.; for (int i = 0; i < 3; i++) { z += vec2(sin(z.y * 1.7 + t * .3), cos(z.x * 1.5 - t * .25)) * .45; c += .5 / (abs(sin(z.x) + cos(z.y)) * 3. + .6); } col = mix(c2, c1, clamp(c * .7, 0., 1.)); col = mix(col, c3, clamp(c * .45 - .3, 0., 1.)); }
  else if (mode == 2) { float e = fbm(p * 1.2 + t * .03); float l = abs(fract(e * 9.) - .5); col = mix(c1, c2, e); col = mix(c3, col, smoothstep(.03, .14, l)); }
  else if (mode == 3) { vec2 g = floor(q * 7.) / 7.; float f = fbm(g * 2.4 + s * 10. + t * .05); col = mix(c1, c2, step(.48, f) * .55 + f * .45); col = mix(col, c3, step(.66, f) * .7); }
  else if (mode == 4) { float d = fbm(p * 1.1 + t * .04); float gr = h(floor(gl_FragCoord.xy / 1.5)); col = mix(c2, c1, d); col = mix(col, c3, step(1.05 - d * .9, gr) * .75); }
  else if (mode == 5) { vec2 d = q - vec2(ar * (.2 + s * .3), .1 + s * .2); float rad = length(d); float ring = abs(sin(rad * 13. - t * .4)); col = mix(c2, c1, smoothstep(0., 1.1, rad)); col = mix(c3, col, smoothstep(0., .2, ring)); }
  else if (mode == 6) { vec2 A = vec2(.15 + s * .3, .25), B = vec2(ar * .9, .8 - s * .3); float v = (sin(length(q - A) * 26. - t * .8) + sin(length(q - B) * 21. - t * .6)) * .5; col = mix(c1, c2, v * .5 + .5); col = mix(col, c3, smoothstep(.65, 1., v) * .6); }
  else if (mode == 7) { vec2 g = p * 1.6, i0 = floor(g), f0 = fract(g); float md = 8.; for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 o = vec2(float(x), float(y)); vec2 pt = vec2(h(i0 + o), h(i0 + o + 7.)); pt = .5 + .4 * sin(t * .3 + 6.2831 * pt); md = min(md, length(o + pt - f0)); } col = mix(c1, c2, smoothstep(0., .8, md)); col = mix(c3, col, smoothstep(.02, .09, md)); }
  else if (mode == 8) { float b = sin((p.y + fbm(p * 1.4 + .08 * t) * 1.8) * 5.); col = mix(c2, c1, b * .5 + .5); col = mix(col, c3, smoothstep(.55, .95, fbm(p * 2.6 - .05 * t)) * .6); }
  else if (mode == 9) { float f = fbm(p * vec2(6., 1.1) + .03 * t); col = mix(vec3(.86, .87, .86), mix(vec3(.86), c2, .35), f); col -= .06 * smoothstep(.44, .5, fract(uv.y * 6.)) * smoothstep(.56, .5, fract(uv.y * 6.)); }
  else { vec2 d = uv - .5; d.x *= ar; float an = atan(d.y, d.x) + length(d) * 7. - t * .35; col = mix(c1, c2, sin(an * 3.) * .5 + .5); col = mix(col, c3, fbm(p * 1.6) * .5); }
  gl_FragColor = vec4(col, 1.);
}`;
  function init() {
    if (ok !== null) return ok;
    try {
      cv = document.createElement('canvas'); gl = cv.getContext('webgl', {preserveDrawingBuffer: true, antialias: false, powerPreference: 'low-power'}); if (!gl) return ok = false;
      const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const at = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      U = Object.fromEntries(['r', 't', 's', 'c1', 'c2', 'c3', 'mode'].map(k => [k, gl.getUniformLocation(pr, k)])); ok = true;
    } catch (err) { console.warn('Identity art falls back to gradients:', err.message); ok = false; }
    return ok;
  }
  function draw(key, mode, pal, w, h, t) { const c = PALS[pal] || PALS[0]; cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
    gl.uniform2f(U.r, w, h); gl.uniform1f(U.t, t); gl.uniform1f(U.s, hash(key)); gl.uniform1i(U.mode, mode); ['c1', 'c2', 'c3'].forEach((k, i) => gl.uniform3fv(U[k], rgb(c[i + 1]))); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  const still = (key, mode, pal, w, h) => { const k = `${key}|${mode}|${pal}|${w}x${h}`; if (!cache.has(k)) { draw(key, mode, pal, w, h, hash(key) * 20); cache.set(k, cv.toDataURL('image/png')); } return cache.get(k); };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hydrate(root) { root.querySelectorAll('.idn:not([data-done])').forEach(el => { const r = el.getBoundingClientRect(); if (!r.width) return; el.dataset.done = '1'; if (!init()) return; const dpr = Math.min(2, devicePixelRatio || 1);
    el.style.backgroundImage = `url(${still(el.dataset.idn, +el.dataset.mode, +el.dataset.pal, Math.round(r.width * dpr), Math.round(r.height * dpr))})`; }); }
  function play(el) { if (anim && anim.el === el) return; stop(); if (!init() || reduced() || document.hidden) return;
    const c = document.createElement('canvas'), r = el.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); c.className = 'idn-live'; el.appendChild(c);
    const ctx = c.getContext('2d'), t0 = performance.now(), base = hash(el.dataset.idn) * 20;
    const loop = now => { if (!anim || document.hidden) return; draw(el.dataset.idn, +el.dataset.mode, +el.dataset.pal, c.width, c.height, base + (now - t0) / 1000); ctx.drawImage(cv, 0, 0); anim.raf = requestAnimationFrame(loop); };
    anim = {el, c, raf: requestAnimationFrame(loop)}; }
  function stop() { if (!anim) return; cancelAnimationFrame(anim.raf); anim.c.remove(); anim = null; }
  const tile = (key, mode, pal, cls = '', inner = '') => { const c = PALS[pal] || PALS[0];
    return `<span class="idn ${cls}" data-idn="${esc(key)}" data-mode="${mode}" data-pal="${pal}" style="--fb:linear-gradient(135deg, ${c[1]}, ${c[2]} 62%, ${c[3]})">${inner}</span>`; };
  return {tile, hydrate, play, stop, hash};
})();
// The look is chosen once: the least-used shader family and palette among siblings, ties broken by the record's own seed.
function pickLook(sibs, seed) { const fu = FAMILIES.map((_, i) => sibs.filter(x => x.f === i).length), pu = PALS.map((_, i) => sibs.filter(x => x.p === i).length);
  const fs = fu.map((n, i) => n === Math.min(...fu) ? i : -1).filter(i => i >= 0), ps = pu.map((n, i) => n === Math.min(...pu) ? i : -1).filter(i => i >= 0);
  return {f: fs[Math.floor(seed * fs.length)], p: ps[Math.floor(IDN.hash(seed) * ps.length)]}; }
// Looks are chosen once, in creation order (never in the order pages happen to draw them), and saved with the record.
// Owner, round 9: a project's pattern must never change after it is made. Seeded projects carry fixed looks in data.js.
function ensureLooks() { const byAge = (a, b) => (a.createdAt || '').localeCompare(b.createdAt || '') || a.id.localeCompare(b.id); let n = 0;
  db.projects.slice().sort(byAge).forEach(p => { if (p.look) return; p.look = pickLook(db.projects.filter(q => q.div === p.div && q.look && q !== p).map(q => q.look), IDN.hash('project:' + p.id)); n++; });
  db.resources.slice().sort(byAge).forEach(r => { if (r.look) return; r.look = {f: RES_MODE[r.kind], p: pickLook(db.resources.filter(q => q.div === r.div && q.kind === r.kind && q.look && q !== r).map(q => q.look), IDN.hash('res:' + r.id)).p}; n++; });
  if (n) save(); }
function projLook(p) { if (!p.look) ensureLooks(); return p.look || (p.look = {f: 0, p: 0}); }
const RES_MODE = {folder: 8, note: 9, link: 10};
function resLook(r) { if (!r.look) ensureLooks(); return r.look || (r.look = {f: RES_MODE[r.kind], p: 0}); }
// Project object: rear plate in the palette's quiet tint, front plate carrying the shader. Sizes: row, sm, hero, card.
const projObj = (p, size = 'row') => { const lk = projLook(p); return `<span class="po po-${size}" aria-hidden="true" title="${esc(`${FAMILIES[lk.f]}, ${PALS[lk.p][0]}`)}"><i class="po-rear" style="--rear:${PALS[lk.p][3]}"></i>${IDN.tile('project:' + p.id, lk.f, lk.p, 'po-front')}</span>`; };
const projTile = (p, cls = '') => projObj(p, cls.includes('sm') ? 'sm' : cls.includes('hero') ? 'hero' : cls.includes('banner') ? 'card' : 'row');
const resTile = (r, cls = '') => { if (r.kind === 'link' && r.ref) { const info = refInfo(r.ref); if (info) return info.tile; } if (r.kind === 'link' && r.url) return linkTile(r.url, cls); const lk = resLook(r); return `<span class="rs-box ${cls}" role="img" aria-label="${esc(L(KIND[r.kind][0]))}">${IDN.tile('res:' + r.id, lk.f, lk.p, `rs rs-${r.kind}`, r.kind === 'link' ? icon('link') : '')}</span>`; };
new MutationObserver(() => IDN.hydrate(document)).observe(document.body, {childList: true, subtree: true});
document.addEventListener('mouseover', e => { const host = e.target.closest('.prow, .pcard, .rrow, .pin, .ptop, .ptl-row, .g-pill'); const el = host && host.querySelector('.idn'); if (el) IDN.play(el); else IDN.stop(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) IDN.stop(); });
const projTasks = p => db.tasks.filter(t => t.project === p.id && !t.trashed && !isSummary(t)); // work packages only; phases and summaries roll up
const projMs = p => db.milestones.filter(x => x.project === p.id).sort((a, b) => (a.target || '9').localeCompare(b.target || '9'));
const nextMs = p => projMs(p).find(x => !['achieved', 'cancelled'].includes(x.state));
const projBlockers = p => db.blockers.filter(b => b.state === 'open' && (b.project === p.id || (taskOf(b.task) || {}).project === p.id));
const canSeeProject = p => { const m = me(); return p.org || visibleDivs(m).includes(p.div) || [p.lead, p.pm].includes(m.id) || team(p).some(x => x.id === m.id) || visibleDivs(m).some(d => jointIn(p, d)) || db.tasks.some(t => t.project === p.id && t.owner === m.id && !t.trashed); };
const canEditProject = p => { const m = me(); return m.admin || [p.lead, p.pm, p.createdBy].includes(m.id) || (rank(m) >= 2 && visibleDivs(m).includes(p.div)); };
const msLate = x => x.target && x.target < today() && !['achieved', 'cancelled'].includes(x.state);
const MS_ST = {proposed: ['Proposed', 'circle', 'mute'], active: ['Active', 'circle', 'ink2'], review: ['In review', 'search', 'warn'], achieved: ['Achieved', 'check', 'green'], cancelled: ['Canceled', 'close', 'mute']};
const msState = x => msLate(x) ? state(L('Overdue'), 'warning', 'danger') : state(L(MS_ST[x.state][0]), MS_ST[x.state][1], MS_ST[x.state][2]);
const lines = s => (Array.isArray(s) ? s : String(s || '').split('\n')).map(v => v.trim()).filter(Boolean);
const denied = () => `<div class="page"><div class="empty"><b>${L('This page is not available to you')}</b><p>${L('It may be outside your workspace or it was removed.')}</p><a class="btn" href="#/work">${L('Back to My Work')}</a></div></div>`; // flow-vp-scope 4: neutral, no title leak

// ---------- Updates (work_updates; reminders channel policy is open, work_reminders) ----------
const UPD = {'run-ask': '{who} asked to skip or move a run', 'run-ask-ok': '{who} approved your request about a run', 'run-ask-no': '{who} declined your request about a run', offer: '{who} asked if you can take a task', review: '{who} sent a task for your review', invite: '{who} invited you to a meeting', overdue: 'A task of yours is overdue', changed: '{who} changed a meeting', cancelled: '{who} canceled a meeting',
  minutes: '{who} shared meeting minutes', blocker: '{who} needs you to unblock a task', unblocked: '{who} resolved a blocker on your task', decision: '{who} asked you to decide', 'offer-accepted': '{who} accepted your task offer', 'offer-declined': '{who} declined your task offer',
  'offer-changes': '{who} asked for changes to your offer', approved: '{who} approved your work', returned: '{who} asked for changes to your work', 'rsvp-yes': '{who} accepted your invitation', 'rsvp-no': '{who} declined your invitation', 'link-issue': '{who} could not open a link you own', delegated: '{who} added you to a resource', 'decided': '{who} answered your decision request', pinvite: '{who} invited you to work on a project', tasked: '{who} asked you to share a task', tadded: '{who} added you to a task', 'tasked-yes': '{who} now shares your task', 'tasked-no': '{who} declined to share your task', padded: '{who} added you to a project', 'pinvite-yes': '{who} accepted your project invitation', 'pinvite-no': '{who} declined your project invitation'};
const refTitle = ref => { const r = ref.type === 'task' ? taskOf(ref.id) : ref.type === 'offer' ? db.offers.find(o => o.id === ref.id) : ref.type === 'meeting' ? meetingOf(ref.id) : ref.type === 'decision' ? db.decisions.find(d => d.id === ref.id) : ref.type === 'resource' ? resOf(ref.id) : ref.type === 'project' ? projOf(ref.id) : null;
  return r ? (r.title || r.question || r.name) : null; };
const dayLabel = d => d === today() ? L('Today') : d === addDays(today(), -1) ? L('Yesterday') : dLong(d);
// "Your replies": everything that asked you for an answer, whether you answered and what you chose (owner review O8, work_updates).
function myReplies() {
  const m = me(), out = [];
  const add = (kind, at, title, from, choice, act, id, extra = '') => out.push({kind, at: at || '', title, from, choice, act, id, extra});
  db.meetings.filter(mt => mt.organizer !== m.id && mt.responses[m.id]).forEach(mt => add('Meeting', (mt.repliedAt || {})[m.id] || mt.createdAt, mt.title, mt.organizer, mt.responses[m.id] === 'pending' ? null : mt.responses[m.id] === 'accepted' ? 'Accepted' : 'Declined', 'open-meeting', mt.id, `${dShort(mt.date)} ${mins(mt.start)}`));
  db.offers.filter(o => o.to === m.id && o.state !== 'withdrawn').forEach(o => add('Task offer', o.answeredAt || o.at, o.title, o.from, o.state === 'pending' ? null : o.state === 'accepted' ? 'Accepted' : o.state === 'declined' ? 'Declined' : 'Asked for changes', 'open-offer', o.id));
  db.tasks.filter(t => !t.trashed && t.reviewer === m.id && t.owner !== m.id && (t.status === 'review' || t.reviewChoice)).forEach(t => add('Review', t.reviewedAt || t.createdAt, t.title, t.owner, t.status === 'review' ? null : t.reviewChoice === 'approved' ? 'Approved' : 'Asked for changes', 'open-task', t.id));
  db.decisions.filter(d => d.approver === m.id && d.createdBy !== m.id).forEach(d => add('Decision', d.decidedAt || d.createdAt, d.question, d.createdBy, d.state === 'awaiting' ? null : d.state === 'approved' ? 'Approved' : 'Rejected', 'open-decision', d.id));
  db.tasks.filter(t => !t.trashed).forEach(t => (t.assignees || []).filter(a => a.id === m.id && !a.direct && (a.state === 'invited' || a.answeredAt)).forEach(a => add('Shared task', a.answeredAt || a.at, t.title, a.by, a.state === 'invited' ? null : a.state === 'joined' ? 'Accepted' : 'Declined', 'open-task', t.id)));
  db.projects.forEach(p => (p.team || []).filter(x => x.id === m.id && x.by !== m.id && !x.direct && (x.state === 'invited' || x.answeredAt)).forEach(x => add('Project invitation', x.answeredAt || x.at, p.name, x.by, x.state === 'invited' ? null : x.state === 'joined' ? 'Accepted' : 'Declined', 'open-proj', p.id)));
  return out.sort((a, b) => b.at.localeCompare(a.at));
}
const CHOICE = {Accepted: ['check', 'green'], Approved: ['check', 'green'], Declined: ['close', 'mute'], Rejected: ['close', 'danger'], 'Asked for changes': ['undo', 'warn']};
function repliesView() {
  const all = myReplies(), wait = all.filter(x => !x.choice), done = all.filter(x => x.choice);
  const row = x => `<div class="row rep" data-act="${x.act}" data-id="${x.id}" tabindex="0">${av(x.from)}<div class="t"><b>${esc(x.title)}</b><small>${L(x.kind)}, ${L('from {who}', {who: esc(first(x.from))})}${x.extra ? `, ${x.extra}` : ''}</small></div>${x.choice ? state(L(x.choice), CHOICE[x.choice][0], CHOICE[x.choice][1], 'pill-o') : state(L('Not replied'), 'clock', 'warn', 'pill-o')}<time class="t-num t-mute">${x.choice && x.at ? ago(x.at) : ''}</time></div>`;
  return `<h2 class="sec-h">${L('Waiting for your reply')} <span class="n">${wait.length}</span></h2><div class="rows">${wait.map(row).join('') || `<div class="empty-inline">${L('Nothing is waiting for you.')}</div>`}</div>
    <h2 class="sec-h">${L('You replied')} <span class="n">${done.length}</span></h2><div class="rows">${done.map(row).join('') || `<div class="empty-inline">${L('No replies yet.')}</div>`}</div>`;
}
PAGES.updates = () => {
  const m = me(), all = db.updates.filter(u => u.to === m.id), list = ui.updFilter === 'unread' ? all.filter(u => !u.read) : all, unread = all.filter(u => !u.read).length;
  const row = u => { const t = refTitle(u.ref); const mt = u.ref.type === 'meeting' && meetingOf(u.ref.id);
    return `<div class="row upd ${u.read ? '' : 'unread'}" data-act="open-update" data-id="${u.id}" tabindex="0">${u.actor ? av(u.actor) : `<span class="av sys">${icon('clock', 'ic-sm')}</span>`}<div class="t"><span class="ut">${esc(L(UPD[u.type] || '{who} updated something', {who: u.actor ? first(u.actor) : ''}))}</span><small>${t ? esc(t) : `<span class="t-mute">${L('No longer available')}</span>`}${mt ? `, ${dShort(mt.date)} ${mins(mt.start)}` : ''}</small></div>${u.read ? '' : `<span class="dot" aria-hidden="true"></span><span class="sr">${L('Unread')}</span>`}<time class="t-num t-mute">${ago(u.at)}</time></div>`; };
  return {crumb: `<b>${L('Updates')}</b>`, content: `<div class="page"><div class="ph"><div><h1 class="t-title">${L('Updates')}</h1><p class="sub">${unread ? plural(unread, '{n} unread', '{n} unread') : L('All caught up')}</p></div>
    <div class="ph-r"><div class="seg" role="radiogroup" aria-label="${esc(L('Filter'))}">${[['all', 'All'], ['unread', 'Unread'], ['replies', 'Your replies']].map(([k, l]) => `<button class="${ui.updFilter === k ? 'on' : ''}" data-act="upd-filter" data-k="${k}" role="radio" aria-checked="${ui.updFilter === k}">${L(l)}</button>`).join('')}</div>${unread ? `<button class="btn btn-sm" data-act="upd-allread">${icon('check')}${L('Mark all as read')}</button>` : ''}</div></div>
    ${ui.updFilter === 'replies' ? repliesView() : list.length ? [...new Set(list.map(u => u.at.slice(0, 10)))].map(d => `<h2 class="sec-h">${dayLabel(d)}</h2><div class="rows">${list.filter(u => u.at.startsWith(d)).map(row).join('')}</div>`).join('') : `<div class="rows" style="margin-top:18px"><div class="empty"><b>${ui.updFilter === 'unread' ? L('Nothing unread') : L('No updates yet')}</b><p>${L('Offers, review requests, invitations and reminders for you appear here.')}</p></div></div>`}
    <p class="t-small t-mute hint">${L('Updates reach you inside dwdg’ONE. Email or phone notifications while the app is closed are not decided yet.')}</p></div>`};
};

// ---------- Projects register (work_projects_register, measure-project-row: 76px grouped rows; Grid and Timeline) ----------
const PVIEWS = [['list', 'Rows', 'list'], ['grid', 'Grid', 'board'], ['timeline', 'Timeline', 'gantt']];
function pStats(p) { const ts = projTasks(p); return {done: ts.filter(isDone).length, total: ts.length}; }
const progress = p => { const s = pStats(p); return s.total ? `<span class="prog"><span class="bar" role="img" aria-label="${esc(L('{d} of {n} tasks completed', {d: s.done, n: s.total}))}"><i style="width:${s.done / s.total * 100}%"></i></span><span class="t-num">${s.done}/${s.total}</span></span>` : `<span class="t-small t-mute">${L('No tasks yet')}</span>`; };
// Needs attention: only facts from saved records (blockers, overdue milestones, overdue tasks). Never a made-up health or risk score (work_blockers).
const attnCell = p => { const b = projBlockers(p), lm = projMs(p).filter(msLate).length, lt = projTasks(p).filter(t => !isDone(t) && t.due && t.due < today()).length;
  const parts = [b.length && `<span title="${esc(b.map(x => x.text).join('\n'))}">${state(plural(b.length, '{n} blocker', '{n} blockers'), 'warning', 'danger')}</span>`, lm && state(plural(lm, '{n} milestone late', '{n} milestones late'), 'flag', 'danger'), lt && state(plural(lt, '{n} task overdue', '{n} tasks overdue'), 'clock', 'warn')].filter(Boolean);
  return parts.length ? `<span class="attn">${parts.join('')}</span>` : `<span class="t-mute" title="${esc(L('Nothing needs attention'))}">—</span>`; };
const msCell = p => { const x = nextMs(p); return x ? `<span class="msc ${msLate(x) ? 'late' : ''}">${icon('flag', 'ic-xs')}<span><b>${esc(x.title)}</b><small class="t-num">${dShort(x.target)}${msLate(x) ? `, ${L('overdue')}` : ''}</small></span></span>` : `<span class="t-small t-mute">${L('No milestone')}</span>`; };
const bkCell = p => { const b = projBlockers(p); return b.length ? `<span class="bkc" title="${esc(b.map(x => x.text).join('\n'))}">${state(plural(b.length, '{n} blocker', '{n} blockers'), 'warning', 'danger')}</span>` : `<span class="t-small t-mute">${L('No blockers')}</span>`; };
const leadCell = p => p.lead ? `<span class="person">${bubbles([p.lead, p.pm], 'av-xs')}<span>${esc(first(p.lead))}${p.pm ? `<small>${L('PM {who}', {who: esc(first(p.pm))})}</small>` : ''}</span></span>` : `<span class="t-mute t-small">${L('No lead')}</span>`;
// Projects register v3 (owner, 6 Oct round 6). Scope tabs: this workspace, shared with it (joint work or organisation-wide
// projects run by another division), organisation-wide, and all divisions for the President, VP and Admin (visibleDivs; the
// organisation-wide flag is request R9). Sort by stage (grouped), target date, start date or name. Grid is the default view.
// Cards: the project object rises out of a tinted pocket on hover while its shader plays; text never sits on the art.
const isHigh = m => !!m && (m.admin || ['president', 'vp'].includes(m.role));
if (!ui.view.projects) ui.view.projects = 'grid';
if (session.psort) ui.psort = session.psort; if (session.pscope) ui.pscope = session.pscope;
const PSORT = [['stage', 'Stage'], ['due', 'Target date'], ['start', 'Start date'], ['name', 'Name']];
const scopeList = (k, m, w) => db.projects.filter(p => k === 'ws' ? p.div === w : k === 'shared' ? p.div !== w && (jointIn(p, w) || p.org) : k === 'org' ? p.org : isHigh(m));
const originTag = (p, w) => p.org ? `<span class="ptag" title="${esc(L('Organization-wide, run by {d}', {d: div(p.div).name}))}">${icon('globe', 'ic-xs')}${p.div === w ? L('Organization-wide') : L('Organization-wide · {d}', {d: esc(div(p.div).short)})}</span>`
  : `<span class="ptag" title="${esc(div(p.div).name)}">${bicon(div(p.div).icon, false)}${jointIn(p, w) ? L('Joint · {d}', {d: esc(div(p.div).short)}) : esc(div(p.div).short)}</span>`;
function projectsRegister() {
  const m = me(), w = ws(), q = ui.q.toLowerCase(), v = ui.view.projects || 'grid', sc = ui.pscope && ui.pscope !== 'routines' && (ui.pscope !== 'all' || isHigh(m)) ? ui.pscope : 'ws', so = ui.psort || 'stage';
  const by = {stage: (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage) || (a.due || '9').localeCompare(b.due || '9'), due: (a, b) => (a.due || '9').localeCompare(b.due || '9') || a.name.localeCompare(b.name), start: (a, b) => (a.start || '9').localeCompare(b.start || '9') || a.name.localeCompare(b.name), name: (a, b) => a.name.localeCompare(b.name)}[so] || ((a, b) => 0);
  const list = scopeList(sc, m, w).filter(p => (ui.stage === 'all' || p.stage === ui.stage) && (!q || p.name.toLowerCase().includes(q))).sort(by);
  const tag = p => sc !== 'ws' || p.div !== w || p.org ? originTag(p, w) : '';
  const row = p => `<div class="prow ${ui.sel === p.id ? 'sel' : ''}" data-act="go" data-h="projects/${p.id}" tabindex="0" role="link"><div class="pn">${projTile(p)}<span class="pn-t"><b>${esc(p.name)}</b><small>${tag(p)}${L('Created by {who}, {date}', {who: esc(first(p.createdBy)), date: dShort(p.createdAt.slice(0, 10))})}</small></span></div>${leadCell(p)}${progress(p)}${msCell(p)}${attnCell(p)}<span class="due ${p.due && p.due < today() && !ENDED.includes(p.stage) ? 'late' : ''}">${p.due ? dShort(p.due) : `<span class="t-mute">—</span>`}</span></div>`;
  const card = p => { const lk = projLook(p), late = p.due && p.due < today() && !ENDED.includes(p.stage);
    return `<div class="pcard pc3 ${ui.sel === p.id ? 'sel' : ''}" data-act="go" data-h="projects/${p.id}" tabindex="0" role="link" aria-label="${esc(p.name)}" style="--tint:${PALS[lk.p][3]}">
      <div class="pc3-art">${projObj(p, 'cover')}<div class="pc3-side">${tag(p)}<span class="pc3-due t-num ${late ? 'late' : ''}" title="${esc(L('Target'))}">${p.due ? dShort(p.due) : L('No target')}</span></div></div>
      <div class="pc3-b"><div class="pc3-st">${stage(p.stage)}${p.start ? `<span class="t-num t-mute">${L('from {d}', {d: dShort(p.start)})}</span>` : ''}</div><b class="pc3-n">${esc(p.name)}</b><p class="pc3-g">${esc(p.goal) || `<span class="t-mute">${L('No goal written yet.')}</span>`}</p>
      <div class="pc3-m">${progress(p)}${msCell(p)}</div><div class="pc3-f">${leadCell(p)}${attnCell(p)}</div></div></div>`; };
  const block = ps => v === 'grid' ? `<div class="pgrid">${ps.map(card).join('')}</div>` : `<div class="plist">${ps.map(row).join('')}</div>`;
  const col = session.pcol || {cancelled: 1, archived: 1}, groups = STAGE_ORDER.map(k => [k, list.filter(p => p.stage === k)]).filter(([, ps]) => ps.length);
  let body;
  if (!list.length) body = `<div class="empty"><b>${ui.stage === 'all' && !q ? (sc === 'ws' ? L('No projects yet') : L('Nothing here yet')) : L('No projects match')}</b><p>${ui.stage === 'all' && !q ? (sc === 'shared' ? L('Projects run by another division that your people joined, or that the whole organization can see, appear here.') : sc === 'org' ? L('Projects the whole organization can see appear here.') : canCreateProject(m, w) ? L('Start one with New project.') : L('Co-directors and above create projects. You can still add your own tasks in My Work.')) : L('Clear the search or choose All stages.')}</p></div>`;
  else if (pgByOn('projects')) body = pgGroups(list, 'project', v === 'timeline' ? ps => projectTimeline(ps) : block, w);
  else if (v === 'timeline') body = projectTimeline(list);
  else body = `${v === 'list' ? `<div class="colh"><span>${L('Project')}</span><span>${L('Lead')}</span><span>${L('Progress')}</span><span>${L('Next milestone')}</span><span>${L('Needs attention')}</span><span>${L('Target')}</span></div>` : ''}${so === 'stage' ? groups.map(([k, ps]) => `<h2 class="grp"><button class="grp-t" data-act="pgroup" data-k="${k}" aria-expanded="${!col[k]}">${icon(col[k] ? 'chevron' : 'chevron-down', 'ic-sm')}${stage(k)}</button><span class="grp-n">${plural(ps.length, '{n} project', '{n} projects')}</span></h2>${col[k] ? '' : block(ps)}`).join('') : block(list)}`;
  const scopes = [['ws', esc(div(w).short)], ['shared', L('Shared with {d}', {d: esc(div(w).short)})], ['org', L('Organization-wide')], ...(isHigh(m) ? [['all', L('All divisions')]] : [])];
  const title = sc === 'ws' ? esc(div(w).name) : sc === 'all' ? L('All divisions') : scopes.find(x => x[0] === sc)[1];
  return {crumb: `${esc(div(w).short)}<i>/</i><b>${L('Projects')}</b>`, content: `<div class="page wide"><div class="ph"><div><h1 class="t-title">${L('Projects')}</h1><p class="sub">${title}, ${plural(list.length, '{n} project', '{n} projects')}</p></div><div class="ph-r">${canCreateProgram(m, w) ? `<button class="btn" data-act="new-program">${svgD(PG_D)}${L('New program')}</button>` : ''}${canCreateProject(m, w) ? `<button class="btn btn-pri" data-act="new-project">${icon('plus')}${L('New project')}</button>` : ''}</div></div>
  <div class="tabs pscope" role="tablist" aria-label="${esc(L('Which projects'))}">${scopes.map(([k, l]) => `<button role="tab" aria-selected="${sc === k}" class="${sc === k ? 'on' : ''}" data-act="pscope" data-k="${k}">${l}<span class="n">${scopeList(k, m, w).length}</span></button>`).join('')}</div>
  ${`<div class="toolbar ptool"><label class="search">${icon('search')}<input id="pq" placeholder="${esc(L('Find a project'))}" value="${esc(ui.q)}" aria-label="${esc(L('Find a project'))}"></label><button class="btn" data-act="menu" data-menu="stage" aria-haspopup="menu">${stage(ui.stage)}${icon('chevron-down', 'ic-sm')}</button><button class="btn" data-act="menu" data-menu="psort" aria-haspopup="menu" aria-label="${esc(L('Sort by'))}">${icon('sort', 'ic-sm')}${L((PSORT.find(x => x[0] === so) || PSORT[0])[1])}${icon('chevron-down', 'ic-sm')}</button>${pgToggle('projects')}<span class="grow"></span>${viewSeg('projects', PVIEWS)}</div>`}${body}</div>`};
}
MENUS.psort = () => PSORT.map(([k, l]) => `<div class="mi ${k === (ui.psort || 'stage') ? 'on' : ''}" data-act="psort" data-k="${k}" tabindex="0" role="menuitemradio" aria-checked="${k === (ui.psort || 'stage')}"><span class="mi-l">${L(l)}</span>${k === (ui.psort || 'stage') ? icon('check', 'tick') : ''}</div>`).join('');
Object.assign(ACT, {
  psort: el => { ui.psort = session.psort = el.dataset.k; saveSession(); ui.menu = null; renderLayer(); render(); },
  pscope: el => { ui.pscope = session.pscope = el.dataset.k; saveSession(); render(); },
});
// Project timeline: planned start to target. Missing dates are listed, never drawn (timeline_unscheduled).
function projectTimeline(list) {
  const dated = list.filter(p => p.start && p.due), undated = list.filter(p => !(p.start && p.due));
  if (!dated.length) return `<div class="empty-inline">${L('No project has both a start and a target date.')}</div>${undated.length ? `<h2 class="sec-h">${L('No dates')}</h2><div class="rows">${undated.map(p => `<div class="row" data-act="go" data-h="projects/${p.id}" tabindex="0"><div class="t">${esc(p.name)}</div>${stage(p.stage)}</div>`).join('')}</div>` : ''}`;
  const lo = D(dated.map(p => p.start).sort()[0]); lo.setDate(1); const lo0 = iso(lo), hiD = D(addDays(dated.map(p => p.due).sort().pop(), 10)); hiD.setMonth(hiD.getMonth() + 1, 0); const hi = iso(hiD), span0 = daysBetween(lo0, hi) + 1, pc = d => Math.max(0, Math.min(100, daysBetween(lo0, d) / span0 * 100));
  const months = []; for (let d = D(lo0); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  const td = today() >= lo0 && today() <= hi;
  return `<div class="ptl2"><div class="ptl2-h"><span class="ptl2-c">${plural(dated.length, '{n} project', '{n} projects')}</span><div class="ptl2-t">${months.map((d, i) => `<span style="left:${pc(d)}%;width:${(pc(months[i + 1] || addDays(hi, 1)) - pc(d))}%"><b>${MON()[D(d).getMonth()]}</b>${!i || D(d).getMonth() === 0 ? ` <small>${D(d).getFullYear()}</small>` : ''}</span>`).join('')}${td ? `<i class="ptl2-now" style="left:${pc(today())}%"><b>${L('Today')}</b></i>` : ''}</div></div>
    ${dated.map(p => { const lk = projLook(p), s = pStats(p), l = pc(p.start), w = Math.max(.8, pc(addDays(p.due, 1)) - l), late = p.due < today() && !ENDED.includes(p.stage);
      return `<div class="ptl2-r" data-act="go" data-h="projects/${p.id}" tabindex="0" role="link" aria-label="${esc(`${p.name}, ${dShort(p.start)} – ${dShort(p.due)}`)}" style="--a:${PALS[lk.p][1]};--b:${PALS[lk.p][2]};--t:${PALS[lk.p][3]}"><span class="ptl2-l">${projTile(p, 'sm')}<span><b>${esc(p.name)}</b>${stage(p.stage)}</span></span>
        <div class="ptl2-t">${months.map(d => `<i class="ptl2-m" style="left:${pc(d)}%"></i>`).join('')}${td ? `<i class="ptl2-now" style="left:${pc(today())}%"></i>` : ''}
          <span class="ptl2-bar ${ENDED.includes(p.stage) ? 'ended' : ''}" style="left:${l}%;width:${w}%" title="${esc(`${dLong(p.start)} – ${dLong(p.due)}. ${s.total ? L('{d} of {n} tasks completed', {d: s.done, n: s.total}) : L('No tasks yet')}`)}"><i class="ptl2-fill" style="width:${s.total ? s.done / s.total * 100 : 0}%"></i></span>
          <span class="ptl2-d t-num ${late ? 'late' : ''}" style="${l + w > 78 ? `right:${100 - l + 1}%` : `left:calc(${l + w}% + 8px)`}">${dShort(p.start)} – ${dShort(p.due)}${s.total ? ` · ${s.done}/${s.total}` : ''}</span>
          ${projMs(p).filter(x => x.target).map(x => `<i class="ptl2-ms ${x.state === 'achieved' ? 'ok' : msLate(x) ? 'late' : ''}" style="left:${pc(x.target)}%" title="${esc(`${x.title}, ${dShort(x.target)}${x.state === 'achieved' ? `, ${L('achieved')}` : msLate(x) ? `, ${L('overdue')}` : ''}`)}"></i>`).join('')}</div></div>`; }).join('')}</div>
    ${undated.length ? `<h2 class="sec-h">${L('No dates')} <span class="n">${undated.length}</span></h2><div class="rows">${undated.map(p => `<div class="row" data-act="go" data-h="projects/${p.id}" tabindex="0"><div class="t">${esc(p.name)}<small>${L('Add a start and target date to place it on the timeline.')}</small></div>${stage(p.stage)}</div>`).join('')}</div>` : ''}
    <p class="t-small t-mute hint">${L('Each band runs from start to target in the project’s own color; the darker part is the share of tasks completed. Diamonds below are milestones.')}</p>`;
}
MENUS.stage = () => ['all', 'draft', 'planned', 'active', 'review', 'completed'].map(k => `<div class="mi ${k === ui.stage ? 'on' : ''}" data-act="set-stage" data-k="${k}" tabindex="0" role="menuitemradio" aria-checked="${k === ui.stage}">${stage(k, false)}${k === ui.stage ? icon('check', 'tick') : ''}</div>`).join('') + '<hr>' + ['hold', 'cancelled', 'archived'].map(k => `<div class="mi ${k === ui.stage ? 'on' : ''}" data-act="set-stage" data-k="${k}" tabindex="0" role="menuitemradio">${stage(k, false)}</div>`).join('');
MENUS.pstage = mm => { const p = projOf(mm.id); return ['draft', 'planned', 'active', 'review', 'completed', 'hold', 'cancelled', 'archived'].map(k => `<div class="mi ${k === p.stage ? 'on' : ''}" data-act="set-pstage" data-k="${k}" data-id="${p.id}" tabindex="0" role="menuitemradio" aria-checked="${k === p.stage}">${stage(k, false)}${k === p.stage ? icon('check', 'tick') : ''}</div>`).join(''); };

// ---------- project page: exactly Overview / Work / Resources (work_project_tabs) ----------
function projectPage(id, tab) {
  const p = projOf(id); if (!p || !canSeeProject(p)) return {crumb: `<a href="#/projects">${L('Projects')}</a>`, content: denied()};
  tab = ['overview', 'wbs', 'work', 'resources'].includes(tab) ? tab : 'overview'; const edit = canEditProject(p), ts = projTasks(p), res = db.resources.filter(r => r.project === p.id && !r.archived);
  const head = `<div class="ptop">${projTile(p, 'hero')}<div class="ptop-b"><h1 class="t-title">${esc(p.name)}</h1><div class="metaline">${edit ? `<button class="btn btn-ghost btn-sm stbtn" data-act="menu" data-menu="pstage" data-id="${p.id}" aria-haspopup="menu" aria-label="${esc(L('Change stage'))}">${stage(p.stage)}${icon('chevron-down', 'ic-sm')}</button>` : stage(p.stage)}
    ${p.lead ? `<span class="person">${av(p.lead, 'av-xs')}${L('Lead {who}', {who: esc(first(p.lead))})}</span>` : `<span>${L('No lead')}</span>`}${p.pm ? `<span class="person">${av(p.pm, 'av-xs')}${L('PM {who}', {who: esc(first(p.pm))})}</span>` : ''}
    <span class="t-num">${p.start ? dShort(p.start) : '?'} – ${p.due ? dShort(p.due) : L('no target')}</span>${pgChip('project', p)}</div></div>${edit ? `<button class="btn btn-sm" data-act="edit-project" data-id="${p.id}">${icon('edit')}${L('Edit details')}</button>` : ''}</div>
    ${ui.form && ui.form.startsWith('stage-') ? stageForm(p, ui.form.slice(6)) : ''}
    <div class="tabs ptabs" role="tablist">${[['overview', 'Overview'], ['wbs', 'WBS'], ['work', 'Work', ts.length], ['resources', 'Resources', res.length]].map(([k, l, n]) => `<button role="tab" aria-selected="${tab === k}" class="${tab === k ? 'on' : ''}" data-act="go" data-h="projects/${p.id}/${k}">${L(l)}${n != null ? `<span class="n">${n}</span>` : ''}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'overview') body = projectOverview(p, edit);
  if (tab === 'wbs') body = wbsTab(p, edit);
  if (tab === 'work') { const open = ts.filter(t => !isDone(t)).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')), done = ts.filter(isDone);
    const listFn = () => `<div class="rows">${open.map(t => taskRow(t, {owner: true, noCtx: true})).join('') || `<div class="empty-inline">${L('No open tasks.')}</div>`}</div>${done.length ? `<button class="more" data-act="show-done">${icon('check', 'ic-sm')}${ui.showDone ? L('Hide {n} completed', {n: done.length}) : L('Show {n} completed', {n: done.length})}</button>${ui.showDone ? `<div class="rows">${done.map(t => taskRow(t, {owner: true, noCtx: true})).join('')}</div>` : ''}` : ''}`;
    body = `<div class="wbar"><form class="qa" data-form="add-task" data-project="${p.id}" autocomplete="off"><span class="qa-ic">${icon('plus')}</span><input id="qa" name="title" placeholder="${esc(L('Add a task to {p}', {p: p.name}))}" aria-label="${esc(L('Task title'))}">${qaDue()}<button class="btn btn-sm" type="submit">${L('Add')}</button></form><div class="qa-under" aria-live="polite"></div>${viewSeg('proj')}</div>
      ${taskViews('proj', ts, listFn, {owner: true, milestones: projMs(p), project: p.id})}`; }
  if (tab === 'resources') body = projResources(p, edit, res);
  return {crumb: `<a href="#/projects">${esc(div(p.div).short)} ${L('Projects')}</a><i>/</i><b>${esc(p.name)}</b>`, content: `<div class="page wide proj">${head}<div class="ptab-body">${body}</div></div>`};
}
// Hold and cancel need a reason; completing needs a lead and no open blocker or pending review (work_project_lifecycle).
function stageForm(p, k) {
  if (k === 'completed') { const why = [!p.lead && L('The project has no lead.'), projBlockers(p).length && plural(projBlockers(p).length, '{n} blocker is still open.', '{n} blockers are still open.'), projTasks(p).some(t => t.status === 'review') && L('A task is still waiting for review.')].filter(Boolean);
    return `<div class="notice n-warn stagef"><i class="n-ic" style="--m:${maskUrl(A.ui.warning)}"></i><div><b>${L('This project cannot be completed yet')}</b><p>${why.join(' ')}</p><p>${L('Resolve these first. A share of finished tasks alone never closes a project.')}</p></div><div class="acts"><button class="btn btn-sm" data-act="form">${L('OK')}</button></div></div>`; }
  return `<div class="quiet subform stagef"><div class="field"><label for="st-reason">${L('Why is it {stage}?', {stage: L(STAGES[k][0]).toLowerCase()})} <span class="req">*</span></label><input class="input" id="st-reason" data-autofocus><span class="help"></span></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="stage-confirm" data-id="${p.id}" data-k="${k}">${L('Change stage')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>`;
}
// ---------- project Overview (work_overview, work_project_tabs: stays inside Overview, no extra tab) ----------
// Owner, 6 Oct: the project page needs a real brief (write text, link pages inside dwdg'ONE and outside) and app-style links.
// The brief is ONE note resource linked to the project (brief: true), so it also appears in Resources and keeps revisions
// (resource_notes, resource_revisions); links are link resources of the project (resource_explorer); internal links are
// references to existing records (resource_references), never copies.
const PROV = [
  [/docs\.google\.com\/document/, 'Google Docs', 6, 'M7 3h7l4 4v14H7Z M14 3v4h4 M10 12h5 M10 16h5'],
  [/docs\.google\.com\/spreadsheets/, 'Google Sheets', 5, 'M5 4h14v16H5Z M5 10h14 M5 15h14 M11 4v16'],
  [/docs\.google\.com\/presentation/, 'Google Slides', 4, 'M4 5h16v11H4Z M12 16v4 M8 20h8'],
  [/docs\.google\.com\/forms|forms\.gle/, 'Google Forms', 3, 'M6 3h12v18H6Z M9 8h.01 M12 8h4 M9 12h.01 M12 12h4 M9 16h.01 M12 16h4'],
  [/classroom\.google\.com/, 'Google Classroom', 0, 'M3 5h18v14H3Z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M8 17c.6-1.8 2.2-3 4-3s3.4 1.2 4 3'],
  [/drive\.google\.com/, 'Google Drive', 8, 'M9 4h6l6 10-3 6H6l-3-6Z M9 4l6 10H3 M15 4 9 14 M18 20 15 14'],
  [/meet\.google\.com/, 'Google Meet', 5, 'M3 7h11v10H3Z M14 10l7-3v10l-7-3'],
  [/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/, 'Google Maps', 7, 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z'],
  [/figma\.com/, 'Figma', 9, 'M9 3h3v6H9a3 3 0 0 1 0-6Z M12 3h3a3 3 0 0 1 0 6h-3Z M9 9h3v6H9a3 3 0 0 1 0-6Z M18 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M9 15h3v3a3 3 0 1 1-3-3Z'],
  [/notion\.(so|site)/, 'Notion', 6, 'M5 5l3-1 11 1v15l-3 1-11-1Z M9 9v8 M9 9l6 8 M15 9v8'],
  [/canva\.com/, 'Canva', 8, 'M16.5 9a5 5 0 1 0 0 6'],
  [/miro\.com/, 'Miro', 4, 'M5 18 9 6l3 12 3-12 4 12'],
  [/github\.com/, 'GitHub', 6, 'M7 4v10 M10 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M20 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M17 10c0 4-10 2-10 6'],
  [/youtube\.com|youtu\.be/, 'YouTube', 1, 'M4 7c0-1 1-2 2-2h12c1 0 2 1 2 2v10c0 1-1 2-2 2H6c-1 0-2-1-2-2Z M10 9l5 3-5 3Z'],
];
const provOf = url => { for (const [rx, name, pal, d] of PROV) if (rx.test(url || '')) return {name, pal, d}; return null; };
const glyph = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
// Link tiles (owner, 6 Oct round 4): a soft squircle with a light rim, in the manner of Samsung One UI icons, carrying the
// site's own favicon. A site without one gets a round web glyph. The prototype asks Google's favicon service for the site
// address only (no path; Google Docs, Sheets and Slides share one host, so their first path segment is kept). The real build
// fetches and caches favicons on the server so link addresses never leave dwdg'ONE (INTERFACE, request R7).
const FAV = {};
const favKey = url => { try { const u = new URL(url); return u.hostname === 'docs.google.com' ? `${u.origin}/${u.pathname.split('/')[1] ? u.pathname.split('/')[1] + '/' : ''}` : u.origin; } catch (e) { return ''; } };
const GLOBE = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3.5 9h17 M3.5 15h17 M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z';
// Google Forms and Classroom: the favicon services return the generic Google mark, so the products' own icons are used.
const FAV_OWN = [[/docs\.google\.com\/forms|forms\.gle/, 'https://www.gstatic.com/images/branding/product/2x/forms_2020q4_48dp.png'], [/classroom\.google\.com/, 'https://www.gstatic.com/images/branding/product/2x/classroom_48dp.png']];
function linkTile(url, cls = '') { const own = (FAV_OWN.find(([rx]) => rx.test(url || '')) || [])[1], k = own ? 'own:' + own : favKey(url), pv = provOf(url), pal = PALS[pv ? pv.pal : Math.floor(IDN.hash('fav:' + k) * PALS.length)], none = !k || FAV[k] === 'none', got = FAV[k] && typeof FAV[k] === 'object' ? FAV[k] : null;
  return `<span class="sq ${cls} ${none ? 'nofav' : ''} ${got && got.small ? 'favsm' : ''}" style="--tint:${pal[3]}" role="img" aria-label="${esc(pv ? pv.name : host(url))}">${none ? '' : `<img class="fav" src="${got ? esc(got.src) : own ? esc(own) : favG(k)}" alt="" data-fk="${esc(k)}" ${got ? 'data-done="1"' : ''} referrerpolicy="no-referrer" draggable="false">`}<span class="sq-fb">${glyph(GLOBE)}</span></span>`; }
// The service answers a missing favicon with a 16 px default; that counts as none.
const favG = k => `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(k)}&amp;sz=64`;
const favOwnFile = k => { try { const u = new URL(k.startsWith('own:') ? '' : k); return u.origin + '/favicon.ico'; } catch (e) { return ''; } };
const favNone = i => { FAV[i.dataset.fk] = 'none'; const s = i.closest('.sq'); if (s) s.classList.add('nofav'); i.remove(); };
const favSmall = i => { const k = i.dataset.fk, src = favG(k).replace('&amp;', '&'); FAV[k] = {src, small: true}; i.dataset.stage = 'small'; i.src = src; const s = i.closest('.sq'); if (s) s.classList.add('favsm'); };
function favDone(i, bad) { if (i.dataset.done) return; const k = i.dataset.fk, st = i.dataset.stage;
  if (st === 'small') { if (bad) favNone(i); else i.dataset.done = '1'; return; }
  if (st === 'own') { clearTimeout(i._favT); if (bad || !i.naturalWidth) return i.dataset.gbad ? favNone(i) : favSmall(i); FAV[k] = {src: i.src, small: i.naturalWidth < 24}; if (i.naturalWidth < 24) { const s = i.closest('.sq'); if (s) s.classList.add('favsm'); } i.dataset.done = '1'; return; }
  if (bad && (k.startsWith('own:') || !favOwnFile(k))) return favNone(i);
  if (!bad && (i.naturalWidth > 16 || k.startsWith('own:'))) { FAV[k] = {src: i.src, small: false}; i.dataset.done = '1'; return; }
  if (bad) i.dataset.gbad = '1';
  const own = favOwnFile(k); if (!own) return favSmall(i);
  i.dataset.stage = 'own'; i._favT = setTimeout(() => { if (i.dataset.stage === 'own' && !i.dataset.done) favSmall(i); }, 4000); i.src = own; }
document.addEventListener('load', e => { if (e.target.classList && e.target.classList.contains('fav')) favDone(e.target); }, true);
document.addEventListener('error', e => { if (e.target.classList && e.target.classList.contains('fav')) favDone(e.target, true); }, true);
// A reference to a record inside dwdg'ONE: label, tile and how to open it.
function refInfo(ref) { if (!ref) return null; const {type, id} = ref;
  if (type === 'task') { const t = taskOf(id); return t && {name: t.title, sub: L('Task'), tile: `<span class="sq in">${icon('tasks')}</span>`, act: `data-act="open-task" data-id="${id}"`}; }
  if (type === 'meeting') { const m0 = meetingOf(id); return m0 && {name: m0.title, sub: `${L('Meeting')}, ${dShort(m0.date)}`, tile: `<span class="sq in">${icon('calendar')}</span>`, act: `data-act="open-meeting" data-id="${id}"`}; }
  if (type === 'resource') { const r0 = resOf(id); return r0 && {name: r0.name, sub: L(KIND[r0.kind][0]), tile: resTile(r0), act: `data-act="open-res" data-id="${id}" data-insp="1"`}; }
  if (type === 'project') { const p0 = projOf(id); return p0 && {name: p0.name, sub: L('Project'), tile: `<span class="sq in sq-p">${projObj(p0, 'xs')}</span>`, act: `data-act="go" data-h="projects/${id}"`}; }
  return null; }
// Pages a member may link to: records of this project first, then other projects in the workspace.
function linkablePages(p, q) { q = (q || '').toLowerCase(); const out = [];
  projTasks(p).forEach(t => out.push({type: 'task', id: t.id, name: t.title}));
  db.meetings.filter(mt => mt.project === p.id).forEach(mt => out.push({type: 'meeting', id: mt.id, name: mt.title}));
  db.resources.filter(r => r.project === p.id && !r.archived && !r.brief).forEach(r => out.push({type: 'resource', id: r.id, name: r.name}));
  db.projects.filter(x => x.div === p.div && x.id !== p.id).forEach(x => out.push({type: 'project', id: x.id, name: x.name}));
  return out.filter(x => !q || x.name.toLowerCase().includes(q)).slice(0, 8); }
const projBrief = p => db.resources.find(r => r.project === p.id && r.brief && !r.archived);
const projLinks = p => db.resources.filter(r => r.project === p.id && r.kind === 'link' && !r.archived);
// Only safe markup survives a save: headings, paragraphs, lists, emphasis and https or in-app links.
function cleanHtml(html) {
  const t = document.createElement('template'); t.innerHTML = html; const ok = {H3: 1, P: 1, UL: 1, OL: 1, LI: 1, B: 1, STRONG: 1, I: 1, EM: 1, A: 1, BR: 1};
  const walk = node => [...node.childNodes].forEach(c => {
    if (c.nodeType === 3) return; if (c.nodeType !== 1) { c.remove(); return; }
    walk(c);
    if (c.tagName === 'DIV' || c.tagName === 'H1' || c.tagName === 'H2') { const n = document.createElement(c.tagName === 'DIV' ? 'p' : 'h3'); n.append(...c.childNodes); c.replaceWith(n); return; }
    if (!ok[c.tagName]) { c.replaceWith(...c.childNodes); return; }
    [...c.attributes].forEach(at => { if (!(c.tagName === 'A' && ['href', 'data-ref'].includes(at.name))) c.removeAttribute(at.name); });
    if (c.tagName === 'A') { const h = c.getAttribute('href') || ''; if (!/^https:\/\//.test(h) && !c.dataset.ref) c.replaceWith(...c.childNodes); else if (!c.dataset.ref) { c.setAttribute('target', '_blank'); c.setAttribute('rel', 'noopener noreferrer'); } }
  });
  walk(t.content); return t.innerHTML.trim();
}
// In-app links render as chips that open the record; a removed record shows as unavailable instead of leaking a title.
function briefHtml(html) { const t = document.createElement('template'); t.innerHTML = html || '';
  t.content.querySelectorAll('a[data-ref]').forEach(a0 => { const [type, id] = a0.dataset.ref.split(':'), info = refInfo({type, id});
    const span = document.createElement('span'); span.innerHTML = info ? `<a class="ref" ${info.act} tabindex="0">${esc(info.name)}</a>` : `<span class="ref gone">${esc(L('Removed page'))}</span>`; a0.replaceWith(span.firstChild); });
  return t.innerHTML; }
const BRIEF_TEMPLATE = () => ['Background', 'Objectives', 'Deliverables', 'People and roles', 'Timeline', 'Notes'].map(h => `<h3>${esc(L(h))}</h3><p><br></p>`).join('');
function briefSection(p, edit) {
  const r = projBrief(p), editing = ui.briefEdit === p.id, st = (ui.noteState || {})['brief:' + p.id];
  const state0 = st === 'failed' ? `<span class="nst fail">${icon('warning', 'ic-xs')}${L('Could not save. Your text is still here.')}</span>` : st === 'saved' && r ? `<span class="nst ok">${icon('check', 'ic-xs')}${L('Saved as revision {n}', {n: r.revisions})}</span>` : st === 'dirty' ? `<span class="nst">${L('Unsaved changes')}</span>` : r && r.editedAt ? `<span class="nst">${L('Revision {n}, {who}', {n: r.revisions, who: esc(stamp(r.editedBy, r.editedAt))})}</span>` : '';
  const tools = [['h3', 'Heading', 'M6 4v16 M18 4v16 M6 12h12'], ['bold', 'Bold', 'M7 4h6a4 4 0 0 1 0 8H7Z M7 12h7a4 4 0 0 1 0 8H7Z'], ['italic', 'Italic', 'M14 4h-4 M14 20h-4 M14 4l-4 16'], ['ul', 'Bulleted list', 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01'], ['ol', 'Numbered list', 'M10 6h10 M10 12h10 M10 18h10 M4 5l1-1v4 M4 14h2l-2 3h2']];
  if (editing) return `<section class="brief editing"><div class="brief-h"><h2 class="t-h3">${L('Brief')}</h2><span id="brief-state">${state0}</span></div>
    <div class="brief-tools" role="toolbar" aria-label="${esc(L('Formatting'))}">${tools.map(([k, l, d]) => `<button class="ib" data-act="brief-fmt" data-k="${k}" aria-label="${esc(L(l))}" title="${esc(L(l))}">${glyph(d)}</button>`).join('')}<button class="btn btn-sm btn-ghost" data-act="brief-link">${icon('link')}${L('Link')}</button>${!r && !(ui.briefDraft || {})[p.id] ? `<button class="btn btn-sm btn-ghost" data-act="brief-tpl">${icon('list')}${L('Use the brief template')}</button>` : ''}</div>
    ${ui.briefLink === p.id ? `<div class="brief-linkbar"><input class="input" id="bl-q" placeholder="${esc(L('Paste https:// link, or search a task, meeting, resource or project'))}" autocomplete="off" data-autofocus><div class="bl-res" id="bl-res">${linkResults(p, '')}</div></div>` : ''}
    <div class="brief-doc doc" id="brief-ed" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${esc(L('Project brief'))}">${(ui.briefDraft || {})[p.id] ?? (r ? r.body : '')}</div>
    <div class="acts"><button class="btn btn-pri btn-sm" data-act="brief-save" data-id="${p.id}">${L('Save')}</button><button class="btn btn-ghost btn-sm" data-act="brief-cancel" data-id="${p.id}">${L('Cancel')}</button></div></section>`;
  return `<section class="brief"><div class="brief-h"><h2 class="t-h3">${L('Brief')}</h2>${state0}${edit && r ? `<button class="btn btn-sm" data-act="brief-edit" data-id="${p.id}">${icon('edit')}${L('Edit')}</button>` : ''}</div>
    ${r && r.body ? `<div class="brief-doc doc">${briefHtml(r.body)}</div>` : `<div class="brief-empty"><p>${L('No brief yet. Write the context, objectives and deliverables in one place, and link the pages and files people need.')}</p>${edit ? `<div class="acts"><button class="btn btn-sm btn-pri" data-act="brief-edit" data-id="${p.id}" data-tpl="1">${icon('list')}${L('Start from the template')}</button><button class="btn btn-sm" data-act="brief-edit" data-id="${p.id}">${icon('edit')}${L('Write a blank brief')}</button></div>` : ''}</div>`}</section>`;
}
function linkResults(p, q) { const url = /^https:\/\/\S+\.\S+/.test(q) ? q : null;
  return (url ? `<div class="mi" data-act="bl-pick" data-url="${esc(url)}" tabindex="0"><span class="mi-ic">${linkTile(url, 'sm')}</span><span class="mi-l">${esc(url)}</span><small class="t-mute">${esc((provOf(url) || {}).name || host(url))}</small></div>` : '') +
    linkablePages(p, q).map(x => { const info = refInfo(x); return info ? `<div class="mi" data-act="bl-pick" data-ref="${x.type}:${x.id}" tabindex="0"><span class="mi-ic">${info.tile}</span><span class="mi-l">${esc(info.name)}</span><small class="t-mute">${esc(info.sub)}</small></div>` : ''; }).join('') || `<div class="empty-inline">${L('No matches.')}</div>`; }
function linksSection(p, edit) {
  const links = projLinks(p), tile = r => { const info = r.ref ? refInfo(r.ref) : null, pv = provOf(r.url);
    if (r.ref && !info) return ''; const open = info ? info.act : `data-act="link-open" data-id="${r.id}"`;
    return `<div class="lk-t" ${open} tabindex="0" data-res="${r.id}" title="${esc(r.purpose || r.name)}">${info ? info.tile : linkTile(r.url)}<span class="lk-n"><b>${esc(r.name)}</b><small>${esc(info ? info.sub : pv ? pv.name : host(r.url))}</small></span>${!info ? icon('external', 'ic-xs lk-x') : ''}</div>`; };
  return `<section class="links"><div class="brief-h"><h2 class="t-h3">${L('Links')} <span class="n">${links.length}</span></h2></div>
    <div class="lk-grid">${links.map(tile).join('')}${edit ? (ui.form === 'plink' ? `<div class="lk-form quiet"><input class="input" id="pl-q" placeholder="${esc(L('Paste https:// link, or search a task, meeting, resource or project'))}" autocomplete="off" data-autofocus><input class="input" id="pl-name" placeholder="${esc(L('Name, optional'))}"><div class="bl-res" id="pl-res">${linkResults(p, '').replace(/bl-pick/g, 'pl-pick')}</div><div class="acts"><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : `<button class="lk-t lk-add" data-act="form" data-f="plink">${icon('plus')}<span class="lk-n"><b>${L('Add link')}</b><small>${L('Drive, Figma, Notion, a page here…')}</small></span></button>`) : ''}</div></section>`;
}
function projectOverview(p, edit) {
  const m = me(), ts = projTasks(p), s = pStats(p), ms = projMs(p), nx = nextMs(p), bks = projBlockers(p), decs = db.decisions.filter(d => d.project === p.id).sort((a0, b0) => b0.createdAt.localeCompare(a0.createdAt));
  const collab = [...new Set([...ts.map(t => t.owner), ...db.resources.filter(r => r.project === p.id).flatMap(r => [r.owner, ...r.contributors])].filter(i => i && i !== p.lead && i !== p.pm && !team(p).some(x => x.id === i)))];
  const acts = db.changes.filter(c => inProject(c, p.id)).slice(0, 5), lead = db.people.filter(q => q.status === 'active' && (q.div === p.div || !q.div));
  return `${inviteNotice(p)}<div class="ov"><div class="ov-main">
    <p class="goal lead">${esc(p.goal) || `<span class="t-mute">${L('No goal written yet.')}</span>`}</p>${p.reason ? `<p class="t-small t-mute">${L('Stage reason')}: ${esc(p.reason)}</p>` : ''}
    <div class="scope"><div><h3 class="t-small sub-h">${L('In scope')}</h3>${lines(p.scopeIn).length ? `<ul>${lines(p.scopeIn).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="t-small t-mute">${L('Not written yet')}</p>`}</div><div><h3 class="t-small sub-h">${L('Out of scope')}</h3>${lines(p.scopeOut).length ? `<ul>${lines(p.scopeOut).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="t-small t-mute">${L('Not written yet')}</p>`}</div></div>
    ${briefSection(p, edit)}
    ${linksSection(p, edit)}
    <h2 class="sec-h">${L('Milestones')} <span class="n">${ms.length}</span></h2><div class="rows">${ms.map(x => `<div class="row ${x === nx ? 'nextms' : ''}" data-act="open-ms" data-id="${x.id}" tabindex="0">${icon('flag', 'ic-sm')}<div class="t">${esc(x.title)}<small>${esc(pname(x.owner))}${x === nx ? `, ${L('next')}` : ''}</small></div>${msState(x)}<span class="due">${x.target ? dShort(x.target) : L('No date')}</span></div>`).join('') || `<div class="empty-inline">${L('No milestones yet.')}</div>`}</div>
    ${edit ? (ui.form === 'pms' ? `<div class="quiet subform"><div class="field"><label for="ms-title">${L('Milestone')} <span class="req">*</span></label><input class="input" id="ms-title" data-autofocus><span class="help"></span></div><div class="grid2"><div class="field"><label for="ms-owner">${L('Owner')}</label><select class="input" id="ms-owner">${lead.map(q => `<option value="${q.id}" ${q.id === (p.lead || m.id) ? 'selected' : ''}>${esc(q.name)}</option>`).join('')}</select></div><div class="field"><label for="ms-date">${L('Target')}</label><input class="input" type="date" id="ms-date"></div></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="add-ms" data-id="${p.id}">${L('Add')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : `<button class="linkbtn" data-act="form" data-f="pms">${icon('plus', 'ic-xs')} ${L('Add a milestone')}</button>`) : ''}
    <h2 class="sec-h">${L('Open blockers')} <span class="n">${bks.length}</span></h2><div class="rows">${bks.map(bk => { const t = taskOf(bk.task); return `<div class="row bkrow sev-${bk.severity}" data-act="open-task" data-id="${bk.task}" tabindex="0"><span class="bk-ic" aria-hidden="true">${icon('warning', 'ic-sm')}</span><div class="t"><b>${esc(bk.text)}</b><small><span class="bk-sev">${L(SEV[bk.severity][0])}</span> · ${L('Needs {who}', {who: esc(pname(bk.owner))})}${bk.action ? `: ${esc(bk.action)}` : ''}</small><small>${t ? `${L('On')} ${esc(t.title)} · ` : ''}${L('Open since {d}', {d: ago(bk.openedAt)})}</small></div>${av(bk.owner, 'av-sm')}</div>`; }).join('') || `<div class="empty-inline">${L('Nothing is blocked.')}</div>`}</div>
    <h2 class="sec-h">${L('Decisions')} <span class="n">${decs.length}</span></h2><div class="rows">${decs.map(d => `<div class="row" data-act="open-decision" data-id="${d.id}" tabindex="0"><div class="t">${esc(d.question)}<small>${esc(d.result)}</small></div>${decState(d)}<span class="due">${dShort((d.decidedAt || d.createdAt).slice(0, 10))}</span></div>`).join('') || `<div class="empty-inline">${L('No decisions recorded.')}</div>`}</div>
    ${edit ? (ui.form === 'pdecision' ? `<div class="quiet subform"><div class="field"><label for="dc-q">${L('Question')} <span class="req">*</span></label><input class="input" id="dc-q" data-autofocus><span class="help"></span></div><div class="field"><label for="dc-r">${L('Proposed result')}</label><input class="input" id="dc-r"></div><div class="field"><label for="dc-appr">${L('Who decides')}</label><select class="input" id="dc-appr">${peopleOptions(m.id, p0 => rank(p0) >= 2)}</select></div><div class="acts"><button class="btn btn-pri btn-sm" data-act="add-pdecision" data-id="${p.id}">${L('Record')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : `<button class="linkbtn" data-act="form" data-f="pdecision">${icon('plus', 'ic-xs')} ${L('Record a decision')}</button>`) : ''}
    <h2 class="sec-h">${L('Recent changes')}</h2><div class="feed">${acts.map(chgRow).join('') || `<div class="empty-inline">${L('No changes recorded yet.')}</div>`}</div>${acts.length ? `<a class="linkbtn" href="#/changes/${p.id}">${L('See all changes for this project')}</a>` : ''}
  </div><aside class="ovside">
    <h2 class="t-h3 ovh">${L('Progress')}</h2><div class="kpi"><b>${s.done}/${s.total}</b><span class="t-mute">${L('tasks completed')}</span></div>${s.total ? `<div class="bar" style="margin-top:8px"><i style="width:${s.done / s.total * 100}%"></i></div>` : ''}<p class="t-small t-mute">${L('Counted from saved tasks. Not a health score.')}</p>
    ${nx ? `<h2 class="sec-h">${L('Next milestone')}</h2><div class="row" data-act="open-ms" data-id="${nx.id}" tabindex="0">${icon('flag', 'ic-sm')}<div class="t"><b>${esc(nx.title)}</b><small>${dLong(nx.target)}</small></div></div>` : ''}
    ${peopleSection(p, edit, collab)}
    <dl class="meta" style="margin-top:16px"><dt>${L('Workspace')}</dt><dd>${bicon(div(p.div).icon, false)}${esc(div(p.div).short)}</dd>${jointDivs(p).length ? `<dt>${L('Also with')}</dt><dd class="dd-wrap">${jointDivs(p).map(d => `<span>${bicon(div(d).icon, false)}${esc(div(d).short)}</span>`).join('')}</dd>` : ''}<dt>${L('Start')}</dt><dd>${p.start ? dLong(p.start) : `<span class="t-mute">${L('Not set')}</span>`}</dd><dt>${L('Target')}</dt><dd>${p.due ? dLong(p.due) : `<span class="t-mute">${L('Not set')}</span>`}</dd><dt>${L('Created')}</dt><dd>${av(p.createdBy, 'av-xs')}${esc(stamp(p.createdBy, p.createdAt))}</dd></dl>
  </aside></div>`;
}
// Brief editing: selection survives toolbar clicks; links insert https or an in-app reference at the caret.
let briefRange = null;
const keepRange = () => { const sel = getSelection(); if (sel.rangeCount && $('#brief-ed') && $('#brief-ed').contains(sel.anchorNode)) briefRange = sel.getRangeAt(0).cloneRange(); };
document.addEventListener('selectionchange', keepRange);
document.addEventListener('mousedown', e => { if (e.target.closest('.brief-tools')) e.preventDefault(); });
function briefDirty() { const ed = $('#brief-ed'); if (!ed) return; (ui.briefDraft = ui.briefDraft || {})[ui.briefEdit] = ed.innerHTML; (ui.noteState = ui.noteState || {})['brief:' + ui.briefEdit] = 'dirty'; const s0 = $('#brief-state'); if (s0) s0.innerHTML = `<span class="nst">${L('Unsaved changes')}</span>`; }
document.addEventListener('input', e => { if (e.target.id === 'brief-ed') briefDirty(); });
function insertLink(html) { const ed = $('#brief-ed'); ed.focus(); const sel = getSelection(); sel.removeAllRanges(); if (briefRange) sel.addRange(briefRange); else { const r0 = document.createRange(); r0.selectNodeContents(ed); r0.collapse(false); sel.addRange(r0); }
  document.execCommand('insertHTML', false, html); ui.briefLink = null; const bar = $('.brief-linkbar'); if (bar) bar.remove(); briefDirty(); }
PAGES.projects = r => r.id ? projectPage(r.id, r.sub) : projectsRegister();
INSP['new-project'] = x => projectForm(x.id ? projOf(x.id) : null);
function projectForm(p) { const w = p ? p.div : ws(), lead = db.people.filter(q => q.status === 'active' && (q.div === w || !q.div));
  const opts = (sel, blank) => `<option value="">${esc(blank)}</option>${lead.map(q => `<option value="${q.id}" ${q.id === sel ? 'selected' : ''}>${esc(q.name)}</option>`).join('')}`;
  return `${inspHead(p ? L('Edit project') : L('New project'))}<h2>${p ? esc(p.name) : L('Start a project in {d}', {d: esc(div(w).short)})}</h2>
  <div class="field"><label for="p-name">${L('Name')} <span class="req">*</span></label><input class="input" id="p-name" value="${esc(p ? p.name : '')}" data-autofocus><span class="help"></span></div>
  <div class="field"><label for="p-goal">${L('Goal')}</label><textarea class="textarea" id="p-goal" placeholder="${esc(L('What will be true when this is done?'))}">${esc(p ? p.goal : '')}</textarea></div>
  <div class="field"><label for="p-in">${L('In scope')} <span class="opt">${L('One per line')}</span></label><textarea class="textarea sm" id="p-in">${esc(p ? lines(p.scopeIn).join('\n') : '')}</textarea></div>
  <div class="field"><label for="p-out">${L('Out of scope')} <span class="opt">${L('One per line')}</span></label><textarea class="textarea sm" id="p-out">${esc(p ? lines(p.scopeOut).join('\n') : '')}</textarea></div>
  <div class="grid2"><div class="field"><label for="p-lead">${L('Lead')}</label><select class="input" id="p-lead">${opts(p && p.lead, L('No lead yet'))}</select></div><div class="field"><label for="p-pm">${L('PM')} <span class="opt">${L('Optional')}</span></label><select class="input" id="p-pm">${opts(p && p.pm, L('None'))}</select></div></div>
  <div class="grid2"><div class="field"><label for="p-start">${L('Start')}</label><input class="input" type="date" id="p-start" value="${p && p.start || ''}"></div><div class="field" id="p-duef"><label for="p-due">${L('Target')}</label><input class="input" type="date" id="p-due" value="${p && p.due || ''}"><span class="help"></span></div></div>
  ${p ? '' : `<div class="field"><label for="p-stage">${L('Stage')}</label><select class="input" id="p-stage">${['planned', 'draft', 'active'].map(k => `<option value="${k}">${L(STAGES[k][0])}</option>`).join('')}</select></div>`}
  ${isHigh(me()) ? `<label class="chkrow"><input type="checkbox" id="p-org" ${p && p.org ? 'checked' : ''}><span><b>${L('Organization-wide')}</b><small>${L('Everyone in DWDG can see this project. The workspace still runs it.')}</small></span></label>` : ''}
  <div class="acts"><button class="btn btn-pri" data-act="save-project" data-id="${p ? p.id : ''}">${p ? L('Save') : L('Create project')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; }
INSP.ms = x => { const ms = db.milestones.find(v => v.id === x.id); if (!ms) return inspHead(L('Milestone')); const p = projOf(ms.project), ts = db.tasks.filter(t => t.milestone === ms.id && !t.trashed), can = canMsEdit(ms), codes = wbsCodes(p), nodes = [];
  (function f(ns) { ns.forEach(n => { if (isSummary(n.t)) nodes.push(n); f(n.kids); }); })(wbsTree(p)); const cand = projTasks(p).filter(t => t.milestone !== ms.id);
  return `${inspHead(L('Milestone'))}${can ? `<div class="field"><label for="ms-t">${L('Name')}</label><input class="input" id="ms-t" data-msf="title" data-id="${ms.id}" value="${esc(ms.title)}"></div>` : `<h2>${esc(ms.title)}</h2>`}${msState(ms)}${rmToggle(ms)}
  ${can ? `<div class="grid2" style="margin-top:12px"><div class="field"><label for="ms-due">${L('Target')}</label><input class="input" type="date" id="ms-due" data-msf="target" data-id="${ms.id}" value="${ms.target || ''}"></div><div class="field"><label for="ms-own">${L('Owner')}</label><select class="input" id="ms-own" data-msf="owner" data-id="${ms.id}">${peopleOptions(ms.owner)}</select></div></div>
    <div class="field"><label for="ms-par">${L('Place in the WBS')}</label><select class="input" id="ms-par" data-msf="parent" data-id="${ms.id}"><option value="">${L('Not placed')}</option>${nodes.map(n => `<option value="${n.t.id}" ${ms.parent === n.t.id ? 'selected' : ''}>${n.code} ${esc(n.t.title)}</option>`).join('')}</select></div>`
    : `<dl class="meta" style="margin-top:14px"><dt>${L('Project')}</dt><dd><a href="#/projects/${p.id}">${esc(p.name)}</a></dd><dt>${L('Owner')}</dt><dd>${av(ms.owner, 'av-xs')}${esc(pname(ms.owner))}</dd><dt>${L('Target')}</dt><dd>${ms.target ? dLong(ms.target) : L('No date')}</dd></dl>`}
  ${ms.achievedAt ? `<p class="t-small t-mute">${L('Achieved')} ${dLong(ms.achievedAt.slice(0, 10))}${ms.achievedBy ? `, ${esc(first(ms.achievedBy))}` : ''}</p>` : ''}
  <h3 class="sec-h">${L('Linked tasks')} <span class="n">${ts.filter(isDone).length}/${ts.length}</span></h3><div class="deps">${ts.map(t => `<div class="dep"><div class="dep-top">${tIcon(t, 'xs')}<a class="dep-n" data-act="open-task" data-id="${t.id}">${codes[t.id] ? `<span class="t-num t-mute">${codes[t.id]}</span> ` : ''}${esc(t.title)}</a>${tstat(t.status)}${can ? `<button class="ib" data-act="ms-unlink" data-id="${ms.id}" data-t="${t.id}" aria-label="${esc(L('Unlink {t}', {t: t.title}))}">${icon('close', 'ic-xs')}</button>` : ''}</div></div>`).join('') || `<p class="t-small t-mute dep-none">${L('No tasks count toward it yet.')}</p>`}</div>
  ${can && cand.length ? `<div class="field" style="margin-top:8px"><select class="input" id="ms-link" data-msf="link" data-id="${ms.id}" aria-label="${esc(L('Link a task'))}"><option value="">${L('Link a task…')}</option>${cand.map(t => `<option value="${t.id}">${codes[t.id] ? codes[t.id] + ' ' : ''}${esc(t.title)}</option>`).join('')}</select></div>` : ''}
  <p class="t-small t-mute">${L('A milestone is achieved only when someone records it. Passing the date marks it overdue, never done.')}</p>
  <div class="acts">${can && !['achieved', 'cancelled'].includes(ms.state) ? `<button class="btn btn-pri" data-act="ms-achieve" data-id="${ms.id}">${icon('check')}${L('Record as achieved')}</button>` : ''}${can ? `<button class="btn btn-danger" data-act="ms-del" data-id="${ms.id}">${icon('trash')}${L('Delete milestone')}</button>` : ''}</div>`; };
INSP.decision = x => { const d = db.decisions.find(v => v.id === x.id); if (!d) return inspHead(L('Decision')); const p = projOf(d.project), mt = d.meeting && meetingOf(d.meeting);
  return `${inspHead(L('Decision'))}<h2>${esc(d.question)}</h2>${decState(d)}<p class="quote">${esc(d.result) || `<span class="t-mute">${L('No proposed result written.')}</span>`}</p>
  <dl class="meta"><dt>${L('Decides')}</dt><dd>${av(d.approver, 'av-xs')}${esc(pname(d.approver))}</dd>${d.decidedAt ? `<dt>${L('Decided')}</dt><dd>${esc(stamp(d.approver, d.decidedAt))}</dd>` : ''}${p ? `<dt>${L('Project')}</dt><dd><a href="#/projects/${p.id}">${esc(p.name)}</a></dd>` : ''}${mt ? `<dt>${L('Meeting')}</dt><dd><a data-act="open-meeting" data-id="${mt.id}">${esc(mt.title)}</a></dd>` : ''}<dt>${L('Created')}</dt><dd>${av(d.createdBy, 'av-xs')}${esc(stamp(d.createdBy, d.createdAt))}</dd></dl>
  ${d.state === 'awaiting' && d.approver === session.me ? `<div class="acts"><button class="btn btn-pri" data-act="decide" data-id="${d.id}" data-r="approved">${icon('check')}${L('Approve')}</button><button class="btn" data-act="decide" data-id="${d.id}" data-r="rejected">${L('Reject')}</button></div><p class="t-small t-mute">${L('Your answer is recorded with your name and the time. A comment saying approved does not count.')}</p>` : ''}`; };

// ---------- Resources explorer and inspector ----------
const KIND = {folder: ['Folder', 'folder'], note: ['Note', 'note'], link: ['Link', 'link']};
const host = u => (u || '').replace(/^https?:\/\//, '').split('/')[0];
const resLinks = r => db.tasks.filter(t => !t.trashed && (t.links || []).includes(r.id));
const canEditRes = r => { const m = me(); return m.admin || [r.owner, r.createdBy, ...r.contributors].includes(m.id); };
// Resource rows (owner, 6 Oct round 4): one fixed icon column; the name opens the thing itself (the site, the page, the folder),
// anywhere else on the row opens its details in the side panel (resource_inspector). Double-click a folder to open it.
function resOpen(r) {
  if (r.kind === 'folder') return `data-act="${route().page === 'projects' ? 'pfolder' : 'folder'}" data-id="${r.id}"`;
  if (r.kind === 'link' && r.ref) { const info = refInfo(r.ref); return info ? info.act : `data-act="open-res" data-id="${r.id}" data-insp="1"`; }
  if (r.kind === 'link') return `href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" data-act="rt-ext"`;
  if (r.brief) return `href="#/projects/${r.project}" data-act="rt-ext"`;
  return `data-act="open-res" data-id="${r.id}" data-insp="1"`; }
function resMeta(r) {
  if (r.kind === 'folder') return plural(db.resources.filter(x => x.parent === r.id && !x.archived).length, '{n} item', '{n} items');
  if (r.kind === 'link' && r.ref) return L('{type} in dwdg’ONE', {type: L({project: 'Project', task: 'Task', meeting: 'Meeting'}[r.ref.type] || 'Resource')});
  if (r.kind === 'link') return esc((provOf(r.url) || {}).name || host(r.url));
  return `${r.brief ? L('Project brief') : L('Note')}${r.revisions ? `, ${L('revision {n}', {n: r.revisions})}` : ''}`; }
const resRow = (r, opt = {}) => { const sel = ui.insp && ui.insp.type === 'res' && ui.insp.id === r.id, n = resLinks(r).length, issues = (r.reports || []).filter(x => x.state === 'open').length;
  return `<div class="row rrow ${sel ? 'sel' : ''}" data-act="open-res" data-id="${r.id}" data-insp="1" data-res="${r.id}" data-kind="${r.kind}" ${r.kind === 'folder' ? `data-rdrop="${r.id}"` : ''} draggable="true" data-rdrag="${r.id}" tabindex="0" aria-label="${esc(`${L(KIND[r.kind][0])}: ${r.name}`)}"><span class="rs-slot">${resTile(r)}</span>
    <div class="rt-b"><a class="rt" ${resOpen(r)} draggable="false">${esc(r.name)}</a><small>${resMeta(r)} · ${L('added by {who}', {who: esc(first(r.createdBy))})}${opt.project && r.project ? ` · ${esc((projOf(r.project) || {}).name || '')}` : ''}</small></div>
    <span class="r-end">${issues ? state(L('Cannot open'), 'warning', 'danger') : ''}${n ? `<span class="lk" title="${esc(plural(n, '{n} linked task', '{n} linked tasks'))}">${icon('tasks', 'ic-xs')}${n}</span>` : ''}${bubbles([r.owner, ...r.contributors], 'av-xs')}<button class="ib" data-act="res-menu" data-id="${r.id}" aria-haspopup="menu" aria-label="${esc(L('Actions for {name}', {name: r.name}))}">${icon('more')}</button></span></div>`; };
PAGES.resources = () => {
  const w = ws(), q = (ui.rq || '').toLowerCase(), all = db.resources.filter(r => r.div === w && !r.archived), folder = ui.folder && resOf(ui.folder);
  const trail = []; for (let f = folder; f; f = f.parent && resOf(f.parent)) trail.unshift(f);
  const sortR = arr => arr.sort((a, b) => (a.kind !== 'folder') - (b.kind !== 'folder') || a.name.localeCompare(b.name));
  const kindOk = r => !ui.rkind || ui.rkind === 'all' || r.kind === ui.rkind;
  let body;
  if (q) { const hits = sortR(all.filter(r => kindOk(r) && (r.name.toLowerCase().includes(q) || (r.purpose || '').toLowerCase().includes(q) || (r.kind === 'note' && r.body.toLowerCase().includes(q))))); body = `<h2 class="sec-h">${L('Results')} <span class="n">${hits.length}</span></h2><div class="rows">${hits.map(r => resRow(r, {project: true})).join('') || `<div class="empty-inline">${L('Nothing matches.')}</div>`}</div>`; }
  else if (folder) { const items = sortR(all.filter(r => r.parent === folder.id && kindOk(r))); body = `${folder.purpose ? `<p class="purpose">${esc(folder.purpose)}</p>` : ''}<div class="rows">${items.map(r => resRow(r)).join('') || `<div class="empty"><b>${L('This folder is empty')}</b><p>${L('Add a note or a link to a file in your drive.')}</p></div>`}</div>`; }
  else { const pinned = all.filter(r => r.pinned && kindOk(r)), root = sortR(all.filter(r => !r.parent && !r.project && kindOk(r))), byProj = db.projects.filter(p => p.div === w).map(p => [p, sortR(all.filter(r => r.project === p.id && !r.parent && kindOk(r)))]).filter(([, rs]) => rs.length);
    body = `${pinned.length ? `<h2 class="sec-h">${L('Pinned')}</h2><div class="pins">${pinned.map(r => `<button class="pin" data-act="open-res" data-id="${r.id}" data-res="${r.id}">${resTile(r, 'lg')}<span><b>${esc(r.name)}</b><small>${L(KIND[r.kind][0])}</small></span></button>`).join('')}</div>` : ''}
      <h2 class="sec-h">${L('Workspace')}</h2><div class="rows">${root.map(r => resRow(r)).join('') || `<div class="empty-inline">${L('Nothing here yet.')}</div>`}</div>
      ${byProj.map(([p, rs]) => `<h2 class="sec-h"><a href="#/projects/${p.id}/resources">${esc(p.name)}</a> <span class="n">${rs.length}</span></h2><div class="rows">${rs.map(r => resRow(r)).join('')}</div>`).join('')}`; }
  return {crumb: `${esc(div(w).short)}<i>/</i><b>${L('Resources')}</b>`, content: `<div class="page wide res"><div class="ph"><div><h1 class="t-title">${L('Resources')}</h1>
    ${folder ? `<nav class="bc" aria-label="${esc(L('Folder path'))}"><button data-act="folder" data-id="">${esc(div(w).short)}</button>${trail.map((f, i) => `${icon('chevron', 'ic-xs')}${i === trail.length - 1 ? `<b aria-current="page">${esc(f.name)}</b>` : `<button data-act="folder" data-id="${f.id}">${esc(f.name)}</button>`}`).join('')}</nav>` : `<p class="sub">${L('{d}. Notes live here; files stay in your own drives as links.', {d: esc(div(w).name)})}</p>`}</div>
    <div class="ph-r"><button class="btn" data-act="new-res" data-kind="folder">${icon('folder')}${L('Folder')}</button><button class="btn" data-act="new-res" data-kind="note">${icon('note')}${L('Note')}</button><button class="btn btn-pri" data-act="new-res" data-kind="link">${icon('link')}${L('Link')}</button></div></div>
    <div class="toolbar"><label class="search">${icon('search')}<input id="rq" placeholder="${esc(L('Search resources'))}" value="${esc(ui.rq || '')}" aria-label="${esc(L('Search resources'))}"></label><div class="seg" role="radiogroup" aria-label="${esc(L('Type'))}">${[['all', 'All'], ['folder', 'Folders'], ['note', 'Notes'], ['link', 'Links']].map(([k, l]) => `<button class="${(ui.rkind || 'all') === k ? 'on' : ''}" data-act="rkind" data-k="${k}" role="radio" aria-checked="${(ui.rkind || 'all') === k}">${L(l)}</button>`).join('')}</div></div>
    ${body}<p class="t-small t-mute hint">${L('Right-click a row, or use its ⋯ button, for actions. Avatars show who is responsible; they never change who can open a file in Drive.')}</p></div>`};
};
MENUS.res = mm => { const r = resOf(mm.id), m = me(); if (!r) return ''; const own = canEditRes(r);
  return [r.kind === 'folder' ? mi(route().page === 'projects' ? 'pfolder' : 'folder', L('Open folder'), 'folder', `data-id="${r.id}"`) : r.kind === 'link' ? mi('res-open-link', L('Open link'), 'external', `data-id="${r.id}"`) : mi('open-res', L('Open note'), 'note', `data-id="${r.id}" data-insp="1"`),
    mi('open-res', L('Details'), 'info', `data-id="${r.id}" data-insp="1"`), mi('res-task', L('Make a task from this'), 'tasks', `data-id="${r.id}"`), mi('res-pin', r.pinned ? L('Unpin') : L('Pin'), 'pin', `data-id="${r.id}"`),
    r.kind === 'link' ? mi('res-report', L('Report it will not open'), 'warning', `data-id="${r.id}"`) : '', own ? '<hr>' + mi('res-archive', L('Archive'), 'archive', `data-id="${r.id}"`) : ''].join(''); };
const RPT = {notfound: 'Not found', denied: 'Access denied', expired: 'Link expired', wrong: 'Wrong file or page'};
INSP.res = x => {
  const r = resOf(x.id), m = me(); if (!r || r.archived || !(visibleDivs(m).includes(r.div) || [r.owner, ...r.contributors].includes(m.id))) return `${inspHead(L('Resource'))}<div class="empty"><b>${L('Not available')}</b><p>${L('It was archived or is outside your workspace.')}</p></div>`;
  const edit = canEditRes(r), p = projOf(r.project), mt = r.meeting && meetingOf(r.meeting), tasks = resLinks(r), offs = db.offers.filter(o => o.resource === r.id && o.state === 'pending'), reports = (r.reports || []).filter(v => v.state === 'open');
  const draft = (ui.noteDraft || {})[r.id], ns = (ui.noteState || {})[r.id];
  const noteState = ns === 'failed' ? `<span class="nst fail">${icon('warning', 'ic-xs')}${L('Could not save. Your text is still here.')}</span>` : draft != null && draft !== r.body ? `<span class="nst">${L('Unsaved changes')}</span>` : ns === 'saved' ? `<span class="nst ok">${icon('check', 'ic-xs')}${L('Saved as revision {n}', {n: r.revisions})}</span>` : '';
  return `${inspHead(L(KIND[r.kind][0]))}<div class="rh">${resTile(r, 'lg')}<h2>${esc(r.name)}</h2></div>
  ${r.kind === 'link' && r.ref ? `<div class="acts" style="margin-top:0">${(() => { const info = refInfo(r.ref); return info ? `<button class="btn btn-pri" ${info.act}>${icon('chevron')}${L('Open')} ${esc(info.name)}</button>` : `<span class="t-mute">${L('Removed page')}</span>`; })()}</div>` : ''}${r.kind === 'link' && !r.ref ? `<div class="acts" style="margin-top:0"><a class="btn btn-pri" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}${L('Open link')}</a><span class="t-small t-mute">${esc(host(r.url))}</span></div><p class="t-small t-mute">${L('Access is managed in Drive, not here. Opening it never grants anyone access.')}</p>` : ''}
  ${r.kind === 'folder' ? `<div class="acts" style="margin-top:0"><button class="btn" data-act="folder" data-id="${r.id}">${icon('folder')}${L('Open folder')}</button></div>` : ''}
  <div class="field"><label for="r-purpose">${L('Purpose')} <span class="opt">${L('Short note for others')}</span></label>${edit ? `<textarea class="textarea sm" id="r-purpose" placeholder="${esc(L('What is this for? Who should use it?'))}">${esc(r.purpose)}</textarea>` : `<p class="t-small">${esc(r.purpose) || `<span class="t-mute">${L('No purpose written.')}</span>`}</p>`}</div>
  ${r.brief ? `<div class="brief-doc doc sm">${briefHtml(r.body)}</div><div class="acts"><a class="btn btn-sm" href="#/projects/${r.project}">${icon('edit')}${L('Edit in the project Overview')}</a></div>` : ''}${r.kind === 'note' && !r.brief ? `<div class="field notef"><label for="r-body">${L('Note')} ${noteState ? `<span class="opt" id="note-state">${noteState}</span>` : `<span class="opt" id="note-state"></span>`}</label>${edit ? `<textarea class="textarea note" id="r-body">${esc(draft != null ? draft : r.body)}</textarea><span class="help">${L('Saving makes revision {n}. Earlier text is kept.', {n: r.revisions + 1})}</span><div class="acts" style="margin-top:8px"><button class="btn btn-sm" data-act="save-note" data-id="${r.id}">${L('Save revision')}</button></div>` : `<div class="note-read">${esc(r.body)}</div>`}</div>` : ''}
  ${edit ? moveField(r) : ''}<div class="sep"></div><h3 class="sec-h" style="margin-top:0">${L('Responsible')}</h3>
  <div class="att-list"><div>${av(r.owner, 'av-sm')}<a data-act="open-person" data-id="${r.owner}">${esc(pname(r.owner))}</a><small class="t-mute">${L('owner')}</small></div>${r.contributors.map(c => `<div>${av(c, 'av-sm')}<a data-act="open-person" data-id="${c}">${esc(pname(c))}</a><small class="t-mute">${L('contributor')}</small>${edit ? `<button class="ib" data-act="res-uncontrib" data-id="${r.id}" data-p="${c}" aria-label="${esc(L('Remove {who}', {who: first(c)}))}">${icon('close', 'ic-xs')}</button>` : ''}</div>`).join('')}</div>
  ${edit ? `<div class="addrow"><select class="input" id="r-contrib" aria-label="${esc(L('Add a contributor'))}">${peopleOptions('', q => q.id !== r.owner && !r.contributors.includes(q.id) && (q.div === r.div || !q.div), L('Add a contributor'))}</select></div>` : ''}
  <p class="t-small t-mute">${L('Being listed here does not change who can open the file in Drive.')}</p>
  <h3 class="sec-h">${L('Related work')} <span class="n">${tasks.length + offs.length}</span></h3><div class="rows">${tasks.map(t => taskRow(t, {owner: true, noCtx: true})).join('')}${offs.map(o => `<div class="row" data-act="open-offer" data-id="${o.id}" tabindex="0">${av(o.to, 'av-xs')}<div class="t">${esc(o.title)}<small>${L('Offered to {who}', {who: esc(first(o.to))})}</small></div>${state(L('Waiting for an answer'), 'clock', 'ink2')}</div>`).join('') || `<div class="empty-inline">${L('No tasks linked yet.')}</div>`}</div>
  ${ui.form === 'rtask' ? `<div class="quiet subform"><div class="field"><label for="rt-title">${L('Task')} <span class="req">*</span></label><input class="input" id="rt-title" value="${esc(L('Follow up on {name}', {name: r.name}))}" data-autofocus><span class="help"></span></div><div class="grid2"><div class="field"><label for="rt-who">${L('Who')}</label><select class="input" id="rt-who">${peopleOptions(m.id, q => true)}</select></div><div class="field"><label for="rt-due">${L('Due')} <span class="opt">${L('Optional')}</span></label><input class="input" type="date" id="rt-due"></div></div><p class="t-small t-mute">${L('For someone else this is sent as an offer. Nothing is assigned until they accept.')}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="res-task-save" data-id="${r.id}">${L('Create')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : `<button class="linkbtn" data-act="res-task" data-id="${r.id}">${icon('plus', 'ic-xs')} ${L('Make a task from this')}</button>`}
  ${r.kind === 'link' ? `<h3 class="sec-h">${L('Problems opening it')} <span class="n">${reports.length}</span></h3>${reports.map(v => `<div class="notice n-warn"><i class="n-ic" style="--m:${maskUrl(A.ui.warning)}"></i><div><b>${L(RPT[v.reason])}</b><p>${L('Reported by {who}', {who: esc(stamp(v.by, v.at))})}${v.note ? `: ${esc(v.note)}` : ''}</p></div>${r.owner === m.id ? `<div class="acts"><button class="btn btn-sm" data-act="res-fixed" data-id="${r.id}" data-r="${v.id}">${L('Fixed')}</button></div>` : ''}</div>`).join('')}
    ${ui.form === 'report' ? `<div class="quiet subform"><div class="field"><label for="rp-why">${L('What happens?')}</label><select class="input" id="rp-why" data-autofocus>${Object.entries(RPT).map(([k, l]) => `<option value="${k}">${L(l)}</option>`).join('')}</select></div><div class="field"><label for="rp-note">${L('Details')} <span class="opt">${L('Optional')}</span></label><input class="input" id="rp-note"></div><p class="t-small t-mute">${L('{who} is told. The link and its tasks stay as they are.', {who: esc(first(r.owner))})}</p><div class="acts"><button class="btn btn-pri btn-sm" data-act="res-report-save" data-id="${r.id}">${L('Report')}</button><button class="btn btn-ghost btn-sm" data-act="form">${L('Cancel')}</button></div></div>` : `<button class="linkbtn" data-act="res-report" data-id="${r.id}">${L('Report it will not open')}</button>`}` : ''}
  <div class="sep"></div><dl class="meta">${p ? `<dt>${L('Project')}</dt><dd><a href="#/projects/${p.id}/resources">${esc(p.name)}</a></dd>` : ''}${mt ? `<dt>${L('Meeting')}</dt><dd><a data-act="open-meeting" data-id="${mt.id}">${esc(mt.title)}</a></dd>` : ''}<dt>${L('Workspace')}</dt><dd>${esc(div(r.div).short)}</dd><dt>${L('Created')}</dt><dd>${av(r.createdBy, 'av-xs')}${esc(stamp(r.createdBy, r.createdAt))}</dd>${r.editedAt ? `<dt>${L('Last saved')}</dt><dd>${esc(stamp(r.editedBy, r.editedAt))}</dd>` : ''}</dl>
  <div class="acts"><button class="btn" data-act="res-pin" data-id="${r.id}">${icon('pin')}${r.pinned ? L('Unpin') : L('Pin')}</button>${edit ? `<button class="btn btn-danger" data-act="res-archive" data-id="${r.id}">${icon('archive')}${L('Archive')}</button>` : ''}</div>`;
};
INSP['new-res'] = x => { const k = x.kind, p = x.project && projOf(x.project), f = x.parent ? resOf(x.parent) : !p && ui.folder && route().page === 'resources' ? resOf(ui.folder) : null;
  return `${inspHead(k === 'folder' ? L('New folder') : k === 'note' ? L('New note') : L('Add a link'))}<h2>${k === 'link' ? L('Link a file or page') : k === 'note' ? L('Write a note') : L('Name the folder')}</h2>
  <p class="t-small t-mute">${f ? L('In {where}', {where: esc(f.name)}) : p ? L('In {where}', {where: esc(p.name)}) : L('In {where}', {where: esc(div(ws()).name)})}</p>
  <div class="field"><label for="n-name">${L('Name')} <span class="req">*</span></label><input class="input" id="n-name" data-autofocus><span class="help"></span></div>
  ${k === 'link' ? `<div class="field"><label for="n-url">${L('Link')} <span class="req">*</span></label><input class="input" id="n-url" placeholder="https://drive.google.com/..."><span class="help">${L('Files stay in your drive. Only the link is stored.')}</span></div>` : ''}
  <div class="field"><label for="n-purpose">${L('Purpose')} <span class="opt">${L('Optional')}</span></label><input class="input" id="n-purpose" placeholder="${esc(L('What is this for?'))}"></div>
  ${k === 'note' ? `<div class="field"><label for="n-body">${L('Note')}</label><textarea class="textarea note" id="n-body"></textarea></div>` : ''}
  <div class="acts"><button class="btn btn-pri" data-act="create-res" data-kind="${k}" data-project="${p ? p.id : ''}" data-parent="${f ? f.id : ''}">${L('Save')}</button><button class="btn btn-ghost" data-act="close-insp">${L('Cancel')}</button></div>`; };
document.addEventListener('contextmenu', e => { const row = e.target.closest('[data-res]'); if (!row || !me()) return; e.preventDefault(); ui.menu = {type: 'res', id: row.dataset.res, rect: {left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY}, est: 300}; renderLayer(); });

// ---------- Changes: one workspace at a time (changes-scope, changes-location, measure-changes) ----------
function inProject(c, pid) { const t = c.target; if (!t) return false; if (t.type === 'project') return t.id === pid; const r = t.type === 'task' ? taskOf(t.id) : t.type === 'meeting' ? meetingOf(t.id) : t.type === 'resource' ? resOf(t.id) : null; return !!r && r.project === pid; }
function chgRow(c) { const t = c.target || {}, exists = t.type === 'task' ? taskOf(t.id) : t.type === 'project' ? projOf(t.id) : t.type === 'meeting' ? meetingOf(t.id) : t.type === 'resource' ? resOf(t.id) : null;
  const act = {task: 'open-task', meeting: 'open-meeting', resource: 'open-res'}[t.type];
  const tgt = !exists ? `<span class="t-mute">${esc(t.name)} (${L('removed')})</span>` : t.type === 'project' ? `<a class="rec" href="#/projects/${t.id}">${esc(t.name)}</a>` : `<a class="rec" data-act="${act}" data-id="${t.id}">${esc(t.name)}</a>`;
  return `<div class="chg">${av(c.actor, 'av-sm')}<div class="chg-t"><b>${esc(pname(c.actor))}</b> ${esc(L(c.verb))} ${tgt}${c.from || c.to ? `<div class="diff">${c.from ? `<span class="tag tag-outline">${esc(L(c.from))}</span>` : ''}<span class="to">→</span>${c.to ? `<span class="tag">${esc(L(c.to))}</span>` : ''}</div>` : ''}</div><time>${c.at.slice(11, 16)}</time></div>`; }
PAGES.changes = r => {
  const w = ws(), pid = r.id && projOf(r.id) && projOf(r.id).div === w ? r.id : '', type = ui.chgType || 'all', lim = ui.chgLimit || 50;
  const list = db.changes.filter(c => c.ws === w && (!pid || inProject(c, pid)) && (type === 'all' || (c.target && c.target.type === type))).sort((a, b) => b.at.localeCompare(a.at));
  const shown = list.slice(0, lim), days = [...new Set(shown.map(c => c.at.slice(0, 10)))];
  return {crumb: `${esc(div(w).short)}<i>/</i><b>${L('Changes')}</b>`, content: `<div class="page chgpage"><div class="ph"><div><h1 class="t-title">${L('Changes')}</h1><p class="sub">${L('{d} only. History is never erased; Undo adds a new entry.', {d: esc(div(w).name)})}</p></div></div>
    <div class="toolbar"><select class="input sel-sm" id="chg-proj" aria-label="${esc(L('Project'))}"><option value="">${L('All projects')}</option>${db.projects.filter(p => p.div === w).map(p => `<option value="${p.id}" ${pid === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
    <div class="seg" role="radiogroup" aria-label="${esc(L('Type'))}">${[['all', 'All'], ['task', 'Tasks'], ['project', 'Projects'], ['meeting', 'Meetings'], ['resource', 'Resources']].map(([k, l]) => `<button class="${type === k ? 'on' : ''}" data-act="chg-type" data-k="${k}" role="radio" aria-checked="${type === k}">${L(l)}</button>`).join('')}</div></div>
    ${shown.length ? `<div class="feed">${days.map(d => `<h2 class="feed-day">${dayLabel(d)}</h2>${shown.filter(c => c.at.startsWith(d)).map(chgRow).join('')}`).join('')}</div>${list.length > lim ? `<button class="more" data-act="chg-more">${L('Show older')}</button>` : ''}` : `<div class="empty"><b>${L('No changes recorded')}</b><p>${L('Edits to tasks, projects, meetings and resources in this workspace appear here.')}</p></div>`}
    <p class="t-small t-mute hint">${L('Private items such as your own unavailable time are not listed here.')}</p></div>`};
};

// ---------- Organisation (work_organization: derived matrix, scoped) ----------
PAGES.organisation = () => {
  const m = me(), vis = visibleDivs(m), q = (ui.oq || '').toLowerCase(), lead = db.people.filter(p => !p.div && p.status === 'active');
  const dirRow = p => `<div class="row" data-act="open-person" data-id="${p.id}" tabindex="0">${av(p.id)}<div class="t"><b>${esc(p.name)}</b><small>${esc(roleLabel(p))}</small></div>${idl(p)}</div>`;
  const matrix = `<div class="omx" role="table" aria-label="${esc(L('Divisions'))}"><div class="omx-r omx-h" role="row"><span role="columnheader">${L('Division')}</span><span role="columnheader">${L('Director')}</span><span role="columnheader" title="${esc(L('Planned, active or in review'))}">${L('Open projects')}</span><span role="columnheader">${L('Next milestone')}</span><span role="columnheader">${L('Open blockers')}</span></div>
    ${DIVS.map(d => { const ok = vis.includes(d.id), dir = db.people.find(p => p.div === d.id && p.role === 'director' && p.status === 'active'), ps = db.projects.filter(p => p.div === d.id && !ENDED.includes(p.stage) && p.stage !== 'draft'), nx = ps.map(nextMs).filter(Boolean).sort((a, b) => a.target.localeCompare(b.target))[0], bk = ps.reduce((n, p) => n + projBlockers(p).length, 0);
      return `<div class="omx-r" role="row"><span role="cell" class="odv">${bicon(d.icon)}<b>${esc(d.name)}</b></span><span role="cell">${dir ? `<span class="person">${av(dir.id, 'av-xs')}${esc(first(dir.id))}</span>` : `<span class="t-mute">${L('Not named')}</span>`}</span>
        ${ok ? `<span role="cell" class="t-num">${ps.length}</span><span role="cell">${nx ? `<a href="#/projects/${nx.project}">${esc(nx.title)}</a> <small class="t-num t-mute">${dShort(nx.target)}</small>` : `<span class="t-mute">${L('None')}</span>`}</span><span role="cell">${bk ? state(String(bk), 'warning', 'danger') : `<span class="t-mute">0</span>`}</span>`
        : `<span role="cell" class="span3"><span class="restricted">${icon('lock')}${L('Outside your workspace')}</span></span>`}</div>`; }).join('')}</div>`;
  const portfolio = vis.length > 1 ? `<h2 class="sec-h">${L('All active projects you can see')}</h2><div class="plist">${db.projects.filter(p => vis.includes(p.div) && p.stage === 'active').map(p => `<div class="prow org" data-act="go" data-h="projects/${p.id}" tabindex="0" role="link"><div class="pn">${projObj(p)}<span class="pn-t"><b>${esc(p.name)}</b><small>${esc(div(p.div).short)}</small></span></div>${leadCell(p)}${msCell(p)}${attnCell(p)}${stage(p.stage)}</div>`).join('')}</div><p class="t-small t-mute">${L('Built from the same project records as each division. Nothing here is typed in twice.')}</p>` : '';
  const people = db.people.filter(p => p.status === 'active' && (!q || p.name.toLowerCase().includes(q)));
  return {crumb: `<b>${L('Organization')}</b>`, content: `<div class="page wide"><div class="ph"><div><h1 class="t-title">${L('Organization')}</h1><p class="sub">DWDG UII, ${L('batch 2026')}</p></div></div>
    <h2 class="sec-h">${L('Leadership')}</h2><div class="prs">${lead.map(dirRow).join('')}</div>
    <h2 class="sec-h">${L('Divisions')}</h2>${matrix}${portfolio}
    <h2 class="sec-h">${L('People')}</h2><div class="toolbar"><label class="search">${icon('search')}<input id="oq" placeholder="${esc(L('Find a person'))}" value="${esc(ui.oq || '')}" aria-label="${esc(L('Find a person'))}"></label><span class="t-small t-mute">${L('Names and roles only. Tasks and schedules stay within each workspace.')}</span></div>
    ${DIVS.map(d => { const ps = people.filter(p => p.div === d.id).sort((a, b) => rank(b) - rank(a)); return ps.length ? `<h3 class="t-small sub-h odh">${bicon(d.icon, false)}${esc(d.short)} <span class="n">${ps.length}</span></h3><div class="prs">${ps.map(dirRow).join('')}</div>` : ''; }).join('')}</div>`};
};

// ---------- Settings (work_settings: personal preferences apart from administration) ----------
PAGES.settings = () => {
  const m = me(), pend = db.people.filter(p => p.status === 'pending'), th = session.theme || 'system';
  const setRow = (label, help, ctl) => `<div class="setrow"><div><b>${label}</b>${help ? `<small>${help}</small>` : ''}</div><div class="setctl">${ctl}</div></div>`;
  return {crumb: `<b>${L('Settings')}</b>`, content: `<div class="page"><h1 class="t-title">${L('Settings')}</h1>
  <h2 class="sec-h">${L('Your account')}</h2><div class="setbox"><div class="setrow"><div class="pp">${av(m.id, 'av-lg')}<div><b>${esc(m.name)}</b><small>${esc(roleText(m))}</small></div></div>${idl(m)}</div>
    ${setRow(L('Sign-in'), L('Google account. Your photo and name come from it.'), `<button class="btn btn-sm" data-act="signout">${icon('logout')}${L('Sign out')}</button>`)}</div>
  <h2 class="sec-h">${L('Preferences')}</h2><div class="setbox">
    ${setRow(L('Language'), L('Only changes the interface. What people write is never translated.'), `<div class="seg" role="radiogroup" aria-label="${esc(L('Language'))}"><button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-l="en" role="radio" aria-checked="${lang() === 'en'}">English</button><button class="${lang() === 'id' ? 'on' : ''}" data-act="lang" data-l="id" role="radio" aria-checked="${lang() === 'id'}">Bahasa Indonesia</button></div>`)}
    ${setRow(L('Theme'), '', `<div class="seg" role="radiogroup" aria-label="${esc(L('Theme'))}">${['system', 'light', 'dark'].map(t => `<button class="${th === t ? 'on' : ''}" data-act="theme" data-t="${t}" role="radio" aria-checked="${th === t}">${L(t === 'system' ? 'System' : t === 'light' ? 'Light' : 'Dark')}</button>`).join('')}</div>`)}
    ${setRow(L('Reminders'), L('They arrive in Updates. Email or phone notifications while the app is closed are not decided yet.'), `<a class="btn btn-sm" href="#/updates">${icon('bell')}${L('Open Updates')}</a>`)}</div>
  <h2 class="sec-h">${L('Connections')}</h2><div class="setbox">
    ${setRow('Google Calendar', m.gcal ? L('Connected. dwdg’ONE meetings appear in your Google Calendar and your Google busy time counts as unavailable. Others never see your event titles. Prototype: simulated.') : L('Not connected. Your availability comes only from the unavailable time you record here.'), m.gcal ? `<span class="setst">${state(L('Connected'), 'check', 'green')}</span><button class="btn btn-sm" data-act="gcal-off">${L('Disconnect')}</button>` : `<button class="btn btn-sm" data-act="gcal-connect">${icon('calendar')}${L('Connect')}</button>`)}</div>
  <h2 class="sec-h">${L('Your data')}</h2><div class="setbox">${setRow(L('Export your data'), L('Arrives with the real build. The prototype keeps everything in this browser only.'), `<button class="btn btn-sm" disabled>${icon('download')}${L('Export')}</button>`)}</div>
  ${m.admin ? `<h2 class="sec-h">${L('Administration')} <span class="tag tag-outline">Admin</span></h2><p class="t-small t-mute">${L('Organization settings. Only the Admin sees this section. Environment: prototype on this device.')}</p><div class="setbox"><b class="t-small sub-h">${L('Members waiting for approval')}</b><div class="rows">${pend.map(p => `<div class="row" style="cursor:default">${av(p.id)}<div class="t"><b>${esc(p.name)}</b><small>${L('Asked to join {d}', {d: esc(div(p.div).name)})}</small></div><button class="btn btn-sm btn-ghost" data-act="approve" data-id="${p.id}" data-r="decline">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="approve" data-id="${p.id}" data-r="approve">${L('Approve')}</button></div>`).join('') || `<div class="empty-inline">${L('No one is waiting.')}</div>`}</div></div>` : ''}
  <h2 class="sec-h">${L('Prototype')}</h2><div class="notice n-info"><i class="n-ic" style="--m:${maskUrl(A.ui.info)}"></i><div><b>${L('Saved on this device only')}</b><p>${L('Demo data lives in this browser. Nothing is sent anywhere.')}</p></div><div class="acts">${ui.form === 'reset' ? `<button class="btn btn-sm btn-danger" data-act="reset">${L('Yes, reset')}</button><button class="btn btn-sm btn-ghost" data-act="form">${L('Cancel')}</button>` : `<button class="btn btn-sm" data-act="form" data-f="reset">${L('Reset demo data')}</button>`}</div></div></div>`};
};

// ---------- actions ----------
Object.assign(ACT, {
  'open-update': (el, id) => { const u = db.updates.find(v => v.id === id); u.read = true; save(); const ref = u.ref;
    if (ref.type === 'project') { ui.insp = null; ui.form = null; go(`projects/${ref.id}`); return; }
    if (ref.type === 'task') ui.insp = {type: 'task', id: ref.id}; else if (ref.type === 'offer') ui.insp = {type: 'offer', id: ref.id}; else if (ref.type === 'meeting') ui.insp = {type: 'meeting', id: ref.id}; else if (ref.type === 'decision') ui.insp = {type: 'decision', id: ref.id}; else if (ref.type === 'resource') ui.insp = {type: 'res', id: ref.id};
    ui.form = null; render(); },
  'upd-filter': el => { ui.updFilter = el.dataset.k; render(); },
  'upd-allread': () => { db.updates.filter(u => u.to === session.me).forEach(u => u.read = true); save(); render(); },
  'brief-edit': (el, id) => { ui.briefEdit = id; if (el.dataset.tpl) (ui.briefDraft = ui.briefDraft || {})[id] = BRIEF_TEMPLATE(); render(); setTimeout(() => { const ed = $('#brief-ed'); if (ed) ed.focus(); }, 0); },
  'brief-cancel': (el, id) => { ui.briefEdit = null; ui.briefLink = null; if (ui.briefDraft) delete ui.briefDraft[id]; if (ui.noteState) delete ui.noteState['brief:' + id]; render(); },
  'brief-tpl': () => { const ed = $('#brief-ed'); ed.innerHTML = BRIEF_TEMPLATE(); briefDirty(); ed.focus(); },
  'brief-fmt': el => { const ed = $('#brief-ed'); ed.focus(); if (briefRange) { const sel = getSelection(); sel.removeAllRanges(); sel.addRange(briefRange); }
    const k = el.dataset.k; if (k === 'h3') document.execCommand('formatBlock', false, document.queryCommandValue('formatBlock') === 'h3' ? 'p' : 'h3'); else if (k === 'ul') document.execCommand('insertUnorderedList'); else if (k === 'ol') document.execCommand('insertOrderedList'); else document.execCommand(k); briefDirty(); },
  // The link bar is added in place: re-rendering would replace the editor and lose the caret.
  'brief-link': () => { keepRange(); const old = $('.brief-linkbar'); if (old) { old.remove(); ui.briefLink = null; return; } ui.briefLink = ui.briefEdit; const p = projOf(ui.briefEdit), bar = document.createElement('div'); bar.className = 'brief-linkbar';
    bar.innerHTML = `<input class="input" id="bl-q" placeholder="${esc(L('Paste https:// link, or search a task, meeting, resource or project'))}" autocomplete="off"><div class="bl-res" id="bl-res">${linkResults(p, '')}</div>`; $('.brief-tools').after(bar); $('#bl-q').focus(); },
  'bl-pick': el => { const txt = (getSelection().toString() || '').trim();
    if (el.dataset.url) insertLink(`<a href="${esc(el.dataset.url)}">${esc(txt || (provOf(el.dataset.url) || {}).name || host(el.dataset.url))}</a>&nbsp;`);
    else { const [type, id] = el.dataset.ref.split(':'), info = refInfo({type, id}); insertLink(`<a data-ref="${type}:${id}" href="#">${esc(info.name)}</a>&nbsp;`); } },
  'brief-save': (el, id) => { const p = projOf(id), ed = $('#brief-ed'), body = cleanHtml(ed.innerHTML), m = me(); ui.noteState = ui.noteState || {};
    let r = projBrief(p), created = false; const prev = r ? {body: r.body, revisions: r.revisions, editedAt: r.editedAt, editedBy: r.editedBy} : null;
    if (!r) { r = {id: uid('r'), kind: 'note', name: L('{p} brief', {p: p.name}), div: p.div, parent: null, url: '', body: '', purpose: L('The project brief, edited from the project Overview.'), project: p.id, meeting: null, owner: p.lead || m.id, contributors: [], createdBy: m.id, createdAt: nowStamp(), pinned: false, revisions: 0, archived: false, reports: [], brief: true}; db.resources.push(r); created = true; }
    else { r.history = r.history || []; r.history.push({n: r.revisions, body: r.body, at: r.editedAt || r.createdAt}); }
    r.body = body; r.revisions++; r.editedAt = nowStamp(); r.editedBy = m.id;
    let ok = !/fail=save/.test(location.search); if (ok) try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { ok = false; } // measure-notes: no Saved before the write succeeds
    if (!ok) { if (created) db.resources = db.resources.filter(x => x !== r); else { Object.assign(r, prev); r.history.pop(); } (ui.briefDraft = ui.briefDraft || {})[id] = ed.innerHTML; ui.noteState['brief:' + id] = 'failed'; render(); return; }
    if (ui.briefDraft) delete ui.briefDraft[id]; ui.noteState['brief:' + id] = 'saved'; ui.briefEdit = null; ui.briefLink = null;
    logChange(p.div, created ? 'created note' : 'saved a revision of', {type: 'resource', id: r.id, name: r.name}, created ? null : L('Revision {n}', {n: r.revisions - 1}), created ? null : L('Revision {n}', {n: r.revisions})); save(); render(); },
  'pl-pick': el => { const p = projOf(route().id), m = me(), name = ($('#pl-name') || {}).value || '';
    let r; if (el.dataset.url) { const pv = provOf(el.dataset.url); r = {url: el.dataset.url, name: name.trim() || (pv ? pv.name : host(el.dataset.url))}; }
    else { const [type, id] = el.dataset.ref.split(':'), info = refInfo({type, id}); r = {url: '', ref: {type, id}, name: name.trim() || info.name}; }
    const res = {id: uid('r'), kind: 'link', div: p.div, parent: null, body: '', purpose: '', project: p.id, meeting: null, owner: m.id, contributors: [], createdBy: m.id, createdAt: nowStamp(), pinned: false, revisions: 0, archived: false, reports: [], ...r};
    db.resources.push(res); logChange(p.div, 'added link', {type: 'resource', id: res.id, name: res.name}); ui.form = null; save(); render(); toast(L('Link added'), () => { db.resources = db.resources.filter(x => x !== res); rerender(); }); },
  'link-open': (el, id) => { const r = resOf(id); if (r && /^https:\/\//.test(r.url)) window.open(r.url, '_blank', 'noopener'); },
  'add-ms': (el, id) => { const p = projOf(id), title = $('#ms-title').value.trim(); if (!title) return invalid('#ms-title', L('Name the milestone.'));
    const x = {id: uid('ms'), project: p.id, title, owner: $('#ms-owner').value, target: $('#ms-date').value || null, state: 'active', achievedAt: null};
    db.milestones.push(x); logChange(p.div, 'added milestone', {type: 'project', id: p.id, name: title}); ui.form = null; save(); render(); toast(L('Milestone added'), () => { db.milestones = db.milestones.filter(v => v !== x); rerender(); }); },
  pgroup: el => { const c = session.pcol || {cancelled: 1, archived: 1}; c[el.dataset.k] = c[el.dataset.k] ? 0 : 1; session.pcol = c; saveSession(); render(); },
  'set-stage': el => { ui.stage = el.dataset.k; ui.menu = null; renderLayer(); render(); },
  'set-pstage': (el, id) => { ui.menu = null; renderLayer(); const p = projOf(id), k = el.dataset.k; if (k === p.stage) return;
    if (['hold', 'cancelled'].includes(k) || (k === 'completed' && (!p.lead || projBlockers(p).length || projTasks(p).some(t => t.status === 'review')))) { ui.form = 'stage-' + k; render(); setTimeout(() => $('#st-reason') && $('#st-reason').focus(), 0); return; }
    setPStage(p, k, ''); },
  'stage-confirm': (el, id) => { const reason = $('#st-reason').value.trim(); if (!reason) return invalid('#st-reason', L('Give a reason.')); ui.form = null; setPStage(projOf(id), el.dataset.k, reason); },
  'new-project': () => { ui.menu = null; renderLayer(); if (!canCreateProject(me(), ws())) return toast(L('Only co-directors and above can create projects here.')); ui.insp = {type: 'new-project'}; if (route().page !== 'projects') go('projects'); render(); setTimeout(() => $('#p-name') && $('#p-name').focus(), 0); },
  'edit-project': (el, id) => { ui.insp = {type: 'new-project', id}; render(); },
  'save-project': (el) => { const id = el.dataset.id, m = me(), name = $('#p-name').value.trim(), start = $('#p-start').value || null, due = $('#p-due').value || null;
    if (!name) return invalid('#p-name', L('Give the project a name.')); if (start && due && due < start) { const f = $('#p-duef'); f.classList.add('invalid'); f.querySelector('.help').textContent = L('Target must be after the start.'); return; }
    const vals = {name, goal: $('#p-goal').value.trim(), scopeIn: lines($('#p-in').value), scopeOut: lines($('#p-out').value), lead: $('#p-lead').value || null, pm: $('#p-pm').value || null, start, due, ...($('#p-org') ? {org: $('#p-org').checked} : {})};
    if (id) { const p = projOf(id); if (!canEditProject(p)) return; const prev = {...p}; Object.assign(p, vals); logChange(p.div, 'edited project', {type: 'project', id: p.id, name: p.name}); ui.insp = null; save(); render(); toast(L('Project saved'), () => { Object.assign(p, prev); rerender(); }); return; }
    if (!canCreateProject(m, ws())) return toast(L('Only co-directors and above can create projects here.')); // access_project_creation_cd
    const p = {id: uid('p'), div: ws(), stage: $('#p-stage').value, reason: '', createdBy: m.id, createdAt: nowStamp(), ...vals};
    db.projects.push(p); logChange(p.div, 'created project', {type: 'project', id: p.id, name: p.name}); if (p.lead && p.lead !== m.id) notify(p.lead, 'delegated', {type: 'project', id: p.id});
    ui.insp = null; save(); go(`projects/${p.id}`); toast(L('Project created'), () => { db.projects = db.projects.filter(x => x !== p); rerender(); go('projects'); }); },
  'ms-achieve': (el, id) => { const ms = db.milestones.find(v => v.id === id), prev = {...ms}; ms.state = 'achieved'; ms.achievedAt = nowStamp(); ms.achievedBy = session.me; logChange((projOf(ms.project) || {}).div, 'achieved milestone', {type: 'project', id: ms.project, name: ms.title}); save(); render(); toast(L('Milestone recorded as achieved'), () => { Object.assign(ms, prev); rerender(); }); },
  'open-ms': (el, id) => { ui.insp = {type: 'ms', id}; ui.form = null; render(); },
  'open-decision': (el, id, e) => { if (e) e.stopPropagation(); ui.insp = {type: 'decision', id}; ui.form = null; render(); },
  decide: (el, id) => { const d = db.decisions.find(v => v.id === id), prev = {...d}; d.state = el.dataset.r; d.decidedAt = nowStamp(); notify(d.createdBy, 'decided', {type: 'decision', id: d.id}); logChange((projOf(d.project) || {}).div || ws(), el.dataset.r === 'approved' ? 'approved a decision on' : 'rejected a decision on', {type: d.project ? 'project' : 'meeting', id: d.project || d.meeting, name: d.question}); save(); render(); toast(el.dataset.r === 'approved' ? L('Approved and recorded') : L('Rejected and recorded'), () => { Object.assign(d, prev); rerender(); }); },
  'add-pdecision': (el, id) => { const p = projOf(id), q = $('#dc-q').value.trim(), r = $('#dc-r').value.trim(), appr = $('#dc-appr').value; if (!q) return invalid('#dc-q', L('Write the question that was decided.'));
    const d = {id: uid('d'), project: p.id, meeting: null, question: q, result: r, approver: appr, state: appr === session.me ? 'approved' : 'awaiting', decidedAt: appr === session.me ? nowStamp() : null, createdBy: session.me, createdAt: nowStamp()};
    db.decisions.push(d); if (appr !== session.me) notify(appr, 'decision', {type: 'decision', id: d.id}); logChange(p.div, 'recorded a decision on', {type: 'project', id: p.id, name: p.name}); ui.form = null; save(); render(); toast(d.state === 'approved' ? L('Decision recorded') : L('Sent to {who} to decide', {who: first(appr)}), () => { db.decisions = db.decisions.filter(x => x !== d); rerender(); }); },
  'open-res': (el, id, e) => { ui.palette = false; ui.menu = null; renderLayer(); const r = resOf(id); if (!r) return;
    if (el.classList.contains('rrow')) { const now = Date.now(), dbl = lastResClick.id === id && now - lastResClick.t < 450; lastResClick = dbl ? {} : {id, t: now}; clearTimeout(resClickT); if (dbl) { openResTarget(r); return; }
      if (r.kind === 'folder' || r.kind === 'link') { resClickT = setTimeout(() => { ui.form = null; ui.insp = {type: 'res', id}; render(); }, 260); return; } }
    if (r.kind === 'folder' && !el.dataset.insp && route().page === 'resources' && !e.target.closest('.insp-sheet')) { ui.folder = id; ui.insp = null; ui.rq = ''; render(); return; }
    ui.form = null; ui.insp = {type: 'res', id}; render(); },
  folder: (el, id) => { ui.menu = null; renderLayer(); ui.folder = id || null; ui.rq = ''; ui.insp = null; if (route().page !== 'resources') go('resources'); else render(); },
  'res-menu': (el, id, e) => { e.stopPropagation(); ui.menu = {type: 'res', id, rect: el.getBoundingClientRect(), alignRight: true, est: 300}; renderLayer(); },
  'res-open-link': (el, id) => { ui.menu = null; renderLayer(); const r = resOf(id); window.open(r.url, '_blank', 'noopener'); },
  'res-pin': (el, id) => { ui.menu = null; renderLayer(); const r = resOf(id); r.pinned = !r.pinned; save(); render(); toast(r.pinned ? L('Pinned') : L('Unpinned'), () => { r.pinned = !r.pinned; rerender(); }); },
  'res-archive': (el, id) => { ui.menu = null; renderLayer(); const r = resOf(id); if (!canEditRes(r)) return; r.archived = true; logChange(r.div, 'archived', {type: 'resource', id: r.id, name: r.name}); if (ui.insp && ui.insp.id === id) ui.insp = null; save(); render(); toast(L('Archived. Linked tasks stay as they are.'), () => { r.archived = false; rerender(); }); },
  'res-task': (el, id) => { ui.menu = null; renderLayer(); ui.insp = {type: 'res', id}; ui.form = 'rtask'; render(); setTimeout(() => { const f = $('#rt-title'); if (f) { f.focus(); f.select(); } }, 0); },
  'res-task-save': (el, id) => { const r = resOf(id), title = $('#rt-title').value.trim(), who = $('#rt-who').value, due = $('#rt-due').value || null; if (!title) return invalid('#rt-title', L('Give the task a title.'));
    let undo, msg; // resource_tasks: exactly one canonical record, linked by resource ID; another person gets an offer (access_delegation)
    if (who === session.me) { const t = addTask(title, {due, project: r.project, div: r.div, links: [r.id]}); undo = () => { db.tasks = db.tasks.filter(x => x !== t); rerender(); }; msg = L('Task added to My Work'); }
    else { const o = {id: uid('o'), from: session.me, to: who, title, result: '', due, project: r.project, resource: r.id, state: 'pending', note: '', task: null, at: nowStamp(), answeredAt: null}; db.offers.push(o); notify(who, 'offer', {type: 'offer', id: o.id}); undo = () => { db.offers = db.offers.filter(x => x !== o); rerender(); }; msg = L('Offered to {who}. Nothing is assigned until they accept.', {who: first(who)}); }
    ui.form = null; save(); render(); toast(msg, undo); },
  'res-report': (el, id) => { ui.menu = null; renderLayer(); ui.insp = {type: 'res', id}; ui.form = 'report'; render(); },
  'res-report-save': (el, id) => { const r = resOf(id), v = {id: uid('lr'), by: session.me, at: nowStamp(), reason: $('#rp-why').value, note: $('#rp-note').value.trim(), state: 'open'}; r.reports = r.reports || []; r.reports.push(v); notify(r.owner, 'link-issue', {type: 'resource', id: r.id});
    ui.form = null; save(); render(); toast(L('Reported. {who} was told.', {who: first(r.owner)}), () => { r.reports = r.reports.filter(x => x !== v); rerender(); }); },
  'res-fixed': (el, id) => { const r = resOf(id), v = r.reports.find(x => x.id === el.dataset.r); v.state = 'fixed'; v.fixedAt = nowStamp(); save(); render(); toast(L('Marked as fixed')); },
  'res-uncontrib': (el, id) => { const r = resOf(id), p = el.dataset.p; r.contributors = r.contributors.filter(x => x !== p); logChange(r.div, 'changed contributors of', {type: 'resource', id: r.id, name: r.name}); save(); render(); toast(L('{who} removed', {who: first(p)}), () => { r.contributors.push(p); rerender(); }); },
  'save-note': (el, id) => { const r = resOf(id), body = $('#r-body').value, prev = {body: r.body, revisions: r.revisions, editedAt: r.editedAt, editedBy: r.editedBy}; ui.noteState = ui.noteState || {}; ui.noteDraft = ui.noteDraft || {};
    r.history = r.history || []; r.history.push({n: r.revisions, body: r.body, at: r.editedAt || r.createdAt}); r.body = body; r.revisions++; r.editedAt = nowStamp(); r.editedBy = session.me;
    let ok = !/fail=save/.test(location.search); if (ok) try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { ok = false; } // measure-notes: no Saved label before the write succeeds
    if (!ok) { Object.assign(r, prev); r.history.pop(); ui.noteDraft[r.id] = body; ui.noteState[r.id] = 'failed'; render(); return; }
    delete ui.noteDraft[r.id]; ui.noteState[r.id] = 'saved'; if (r.meeting && !r.notified) { r.notified = true; const mt = meetingOf(r.meeting); if (mt) Object.keys(mt.responses).forEach(g => notify(g, 'minutes', {type: 'meeting', id: mt.id})); }
    logChange(r.div, 'saved a revision of', {type: 'resource', id: r.id, name: r.name}, L('Revision {n}', {n: prev.revisions}), L('Revision {n}', {n: r.revisions})); save(); render(); },
  'new-res': el => { ui.menu = null; renderLayer(); ui.insp = {type: 'new-res', kind: el.dataset.kind, project: el.dataset.project || null, parent: el.dataset.parent || null}; render(); setTimeout(() => $('#n-name') && $('#n-name').focus(), 0); },
  'create-res': el => { const name = $('#n-name').value.trim(), url = $('#n-url') ? $('#n-url').value.trim() : '', k = el.dataset.kind, m = me(), pid = el.dataset.project || null, p = pid && projOf(pid);
    if (!name) return invalid('#n-name', L('Give it a name.')); if (k === 'link' && !/^https:\/\/[^\s/]+\.[^\s]+/.test(url)) return invalid('#n-url', L('Paste a full link starting with https://')); // resource_link_validation
    const r = {id: uid('r'), kind: k, name, div: p ? p.div : ws(), parent: el.dataset.parent || null, url, body: $('#n-body') ? $('#n-body').value : '', purpose: $('#n-purpose').value.trim(), project: pid, meeting: null, owner: m.id, contributors: [], createdBy: m.id, createdAt: nowStamp(), pinned: false, revisions: 0, archived: false, reports: []};
    db.resources.push(r); logChange(r.div, k === 'folder' ? 'created folder' : k === 'note' ? 'created note' : 'added link', {type: 'resource', id: r.id, name: r.name}); ui.insp = {type: 'res', id: r.id}; save(); render(); toast(L('{k} added', {k: L(KIND[k][0])}), () => { db.resources = db.resources.filter(x => x !== r); ui.insp = null; rerender(); }); },
  rkind: el => { ui.rkind = el.dataset.k; render(); },
  'chg-type': el => { ui.chgType = el.dataset.k; ui.chgLimit = 50; render(); },
  'chg-more': () => { ui.chgLimit = (ui.chgLimit || 50) + 50; render(); },
  theme: el => { session.theme = el.dataset.t; saveSession(); render(); },
  'gcal-off': () => { const m = me(); m.gcal = false; save(); render(); toast(L('Disconnected. Your Google busy time no longer counts here.'), () => { m.gcal = true; rerender(); }); },
  approve: (el, id) => { const p = person(id); if (el.dataset.r === 'approve') { p.status = 'active'; toast(L('{who} can now sign in', {who: p.name})); } else { p.status = 'declined'; toast(L('{who} was declined', {who: p.name})); } if (session.waiting === id) session.waiting = null; save(); render(); },
  reset: () => { localStorage.removeItem(KEY); db = window.seedData(); ui.insp = null; ui.form = null; save(); render(); toast(L('Demo data reset')); },
});
function setPStage(p, k, reason) { const prev = {stage: p.stage, reason: p.reason}; p.stage = k; p.reason = reason; logChange(p.div, 'changed stage of', {type: 'project', id: p.id, name: p.name}, STAGES[prev.stage][0], STAGES[k][0]); save(); render(); toast(L('Stage changed to {s}', {s: L(STAGES[k][0])}), () => { Object.assign(p, prev); rerender(); }); }
const keepFocus = (id, fn) => el => { fn(el); const pos = el.selectionStart; render(); const n = document.getElementById(id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } };
ON_INPUT.pq = keepFocus('pq', el => { ui.q = el.value; });
ON_INPUT.rq = keepFocus('rq', el => { ui.rq = el.value; });
ON_INPUT.oq = keepFocus('oq', el => { ui.oq = el.value; });
ON_INPUT['r-body'] = el => { const id = ui.insp && ui.insp.id; if (!id) return; (ui.noteDraft = ui.noteDraft || {})[id] = el.value; (ui.noteState = ui.noteState || {})[id] = null; const s = $('#note-state'); if (s) s.innerHTML = `<span class="nst">${L('Unsaved changes')}</span>`; };
ON_INPUT['bl-q'] = el => { const p = projOf(route().id), box = $('#bl-res'); if (box) box.innerHTML = linkResults(p, el.value.trim()); };
ON_INPUT['pl-q'] = el => { const p = projOf(route().id), box = $('#pl-res'); if (box) box.innerHTML = linkResults(p, el.value.trim()).replace(/bl-pick/g, 'pl-pick'); };
ON_KEY.push(e => { if (e.key === 'Enter' && (e.target.id === 'bl-q' || e.target.id === 'pl-q')) { e.preventDefault(); const f = $(e.target.id === 'bl-q' ? '#bl-res .mi' : '#pl-res .mi'); if (f) f.click(); return true; } return false; });
ON_INPUT.pal = el => { $('#palres').innerHTML = paletteResults(el.value); };
ON_CHANGE['r-purpose'] = el => { const r = resOf(ui.insp.id); r.purpose = el.value.trim(); logChange(r.div, 'edited purpose of', {type: 'resource', id: r.id, name: r.name}); save(); toast(L('Saved')); };
ON_CHANGE['r-contrib'] = el => { if (!el.value) return; const r = resOf(ui.insp.id), p = el.value; r.contributors.push(p); notify(p, 'delegated', {type: 'resource', id: r.id}); logChange(r.div, 'changed contributors of', {type: 'resource', id: r.id, name: r.name}); save(); render(); toast(L('{who} added. They were told.', {who: first(p)}), () => { r.contributors = r.contributors.filter(x => x !== p); rerender(); }); };
ON_CHANGE['chg-proj'] = el => go(el.value ? `changes/${el.value}` : 'changes');
ON_KEY.push((e, typing) => { if (e.key === 'Enter' && e.target.id === 'pal') { const f = $('#palres .mi'); if (f) f.click(); return true; } if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { const row = e.target.closest && e.target.closest('[data-res]'); if (row) { e.preventDefault(); ui.menu = {type: 'res', id: row.dataset.res, rect: row.getBoundingClientRect(), alignRight: true, est: 300}; renderLayer(); return true; } } return false; });

// ---------- project people (owner, 6 Oct round 4) ----------
// Anyone from any division can work on a project, and a project can be joint work between divisions. People from the owning
// workspace and the Presidency join at once; someone from another division is invited and joins only after accepting
// (access_member_scope: consented cross-division work; access_project_collab: a bounded project grant). Joining shows the
// project in that person's workspace register as joint work. Lead and PM stay in Edit details.
const team = p => (p.team || []).filter(x => x.state !== 'declined' && person(x.id));
function jointIn(p, d) { return p.div !== d && team(p).some(x => x.state === 'joined' && person(x.id).div === d); }
function jointDivs(p) { return [...new Set(team(p).filter(x => x.state === 'joined').map(x => person(x.id).div).filter(d => d && d !== p.div))]; }
function peopleSection(p, edit, collab) {
  const tm = team(p), from = i => { const q = person(i); return q.div && q.div !== p.div ? ` · ${esc(div(q.div).short)}` : ''; };
  const row = (i, label, extra = '') => `<div class="row" data-act="open-person" data-id="${i}" tabindex="0">${av(i)}<div class="t"><b>${esc(pname(i))}</b><small>${label}</small></div>${idl(person(i))}${extra}</div>`;
  const rm = x => edit ? `<button class="ib" data-act="pteam-rm" data-id="${p.id}" data-p="${x.id}" aria-label="${esc(L('Remove {who}', {who: first(x.id)}))}">${icon('close', 'ic-xs')}</button>` : '';
  const n = [p.lead, p.pm].filter(Boolean).length + tm.length + collab.length;
  return `<h2 class="sec-h ppl-h">${L('People')} <span class="n">${n}</span>${edit && ui.form !== 'pteam' ? `<button class="btn btn-sm btn-ghost" data-act="pteam-open">${icon('plus')}${L('Add')}</button>` : ''}</h2>
    ${ui.form === 'pteam' ? `<div class="pt-add"><input class="input" id="pt-add" data-pm="pt" placeholder="${esc(L('Find someone in any division'))}" autocomplete="off" aria-label="${esc(L('Add people'))}"><p class="t-small t-mute">${L('People from {d} and the Presidency join at once. Someone from another division is invited and joins after accepting.', {d: esc(div(p.div).short)})}</p><div class="acts"><button class="btn btn-sm" data-act="form">${L('Done')}</button></div></div>` : ''}
    <div class="rows ppl">${p.lead ? row(p.lead, L('Lead') + from(p.lead)) : `<div class="empty-inline">${L('No lead yet.')}</div>`}${p.pm ? row(p.pm, L('PM') + from(p.pm)) : ''}${tm.map(x => row(x.id, (x.state === 'invited' ? `<span class="inv">${L('Invited, not answered')}</span>` : L('Collaborator')) + from(x.id), rm(x))).join('')}${collab.map(i => row(i, L('Has work here') + from(i))).join('')}</div>`;
}
function inviteNotice(p) { const x = team(p).find(v => v.id === session.me && v.state === 'invited'); if (!x) return '';
  return `<div class="notice n-info pinv"><i class="n-ic" style="--m:${maskUrl(A.ui.info)}"></i><div><b>${L('{who} invited you to work on this project', {who: esc(first(x.by))})}</b><p>${L('Accepting lets you see its work and resources and take tasks here. You stay in {d}.', {d: esc(div(me().div).short)})}</p></div><div class="acts"><button class="btn btn-sm btn-ghost" data-act="pinv" data-id="${p.id}" data-r="no">${L('Decline')}</button><button class="btn btn-sm btn-pri" data-act="pinv" data-id="${p.id}" data-r="yes">${L('Accept')}</button></div></div>`; }
function addTeam(p, id) { const q = person(id); if (!p || !q || team(p).some(x => x.id === id) || [p.lead, p.pm].includes(id)) return;
  p.team = (p.team || []).filter(x => x.id !== id); const direct = !q.div || q.div === p.div, x = {id, state: direct ? 'joined' : 'invited', by: session.me, at: nowStamp(), direct};
  p.team.push(x); notify(id, direct ? 'padded' : 'pinvite', {type: 'project', id: p.id});
  logChange(p.div, direct ? 'added a collaborator to' : 'invited a collaborator to', {type: 'project', id: p.id, name: p.name}); save(); render();
  toast(direct ? L('{who} added', {who: q.first}) : L('{who} invited. They join after accepting.', {who: q.first}), () => { p.team = p.team.filter(v => v !== x); rerender(); }); }
PICK.pt = {
  refresh() { const i = $('#pt-add'), p = projOf(route().id); floatPick('pt', i, i && p && ui.pm && ui.pm.key === 'pt' && !ui.pm.closed ? pmHtml('pt', i.value.trim(), [p.lead, p.pm, ...team(p).map(x => x.id)].filter(Boolean)) : ''); },
  pick(id) { ui.pm = null; floatPick('pt', null, ''); addTeam(projOf(route().id), id); setTimeout(() => { const i = $('#pt-add'); if (i) i.focus(); }, 0); },
};
ON_INPUT['pt-add'] = () => { if (!ui.pm || ui.pm.key !== 'pt') ui.pm = {key: 'pt', group: null, idx: 0, level: 1, q: null}; ui.pm.closed = false; PICK.pt.refresh(); };
document.addEventListener('focusin', e => { if (e.target.id === 'pt-add') ON_INPUT['pt-add'](e.target); });

// ---------- project Resources tab with folders (resource_folder, resource_move, resource_explorer breadcrumbs) ----------
function projResources(p, edit, res) {
  const f0 = ui.pfolder && resOf(ui.pfolder), folder = f0 && f0.project === p.id && !f0.archived ? f0 : null, trail = [];
  for (let x = folder; x; x = x.parent && resOf(x.parent)) trail.unshift(x);
  const items = res.filter(r => (r.parent || null) === (folder ? folder.id : null)).sort((a, b) => (a.kind !== 'folder') - (b.kind !== 'folder') || a.name.localeCompare(b.name));
  const at = `data-project="${p.id}" ${folder ? `data-parent="${folder.id}"` : ''}`;
  return `<div class="toolbar rtools"><nav class="bc" aria-label="${esc(L('Folder path'))}">${folder ? `<button data-act="pfolder" data-id="" data-rdrop="">${L('All resources')}</button>${trail.map((f, i) => `${icon('chevron', 'ic-xs')}${i === trail.length - 1 ? `<b aria-current="page">${esc(f.name)}</b>` : `<button data-act="pfolder" data-id="${f.id}" data-rdrop="${f.id}">${esc(f.name)}</button>`}`).join('')}` : `<b>${L('All resources')}</b>`}</nav>
    <span class="tb-gap"></span><button class="btn" data-act="new-res" data-kind="folder" ${at}>${icon('folder')}${L('Folder')}</button><button class="btn" data-act="new-res" data-kind="note" ${at}>${icon('note')}${L('Note')}</button><button class="btn btn-pri" data-act="new-res" data-kind="link" ${at}>${icon('link')}${L('Link')}</button></div>
    ${folder && folder.purpose ? `<p class="purpose">${esc(folder.purpose)}</p>` : ''}
    <div class="rows">${items.map(r => resRow(r)).join('') || (folder ? `<div class="empty"><b>${L('This folder is empty')}</b><p>${L('Add a note or a link here, or drag items onto the folder.')}</p></div>` : `<div class="empty-inline">${L('No resources linked to this project yet.')}</div>`)}</div>
    <p class="t-small t-mute hint">${L('Click a row for details; double-click it, or click its name, to open it. Drag a row onto a folder to move it. Files stay in your own drives.')}</p>`;
}
function moveField(r) { const under = id => db.resources.filter(x => x.parent === id).flatMap(x => [x.id, ...under(x.id)]), no = [r.id, ...under(r.id)];
  const fs = db.resources.filter(x => x.kind === 'folder' && !x.archived && x.div === r.div && (x.project || null) === (r.project || null) && !no.includes(x.id));
  return `<div class="field"><label for="r-move">${L('Folder')}</label><select class="input" id="r-move" data-id="${r.id}"><option value="">${esc(r.project ? L('Top of the project') : L('Top of the workspace'))}</option>${fs.map(x => `<option value="${x.id}" ${x.id === r.parent ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>`; }
function moveRes(r, to) { if (!r || !canEditRes(r) || (r.parent || null) === to) return; let x = to && resOf(to); for (; x; x = x.parent && resOf(x.parent)) if (x.id === r.id) return;
  const prev = r.parent; r.parent = to; logChange(r.div, 'moved', {type: 'resource', id: r.id, name: r.name}); save(); render();
  toast(to ? L('Moved to {f}', {f: resOf(to).name}) : L('Moved out of the folder'), () => { r.parent = prev; rerender(); }); }
ON_CHANGE['r-move'] = el => moveRes(resOf(el.dataset.id), el.value || null);
document.addEventListener('dragstart', e => { const row = e.target.closest && e.target.closest('[data-rdrag]'); if (!row) return; e.dataTransfer.setData('text/x-res', row.dataset.rdrag); e.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); });
document.addEventListener('dragover', e => { const t = e.target.closest && e.target.closest('[data-rdrop]'); if (!t || !e.dataTransfer.types.includes('text/x-res')) return; e.preventDefault(); $$('[data-rdrop].over').forEach(x => x !== t && x.classList.remove('over')); t.classList.add('over'); });
document.addEventListener('dragleave', e => { const t = e.target.closest && e.target.closest('[data-rdrop]'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('over'); });
document.addEventListener('dragend', () => $$('.rrow.dragging, [data-rdrop].over').forEach(x => x.classList.remove('dragging', 'over')));
document.addEventListener('drop', e => { const t = e.target.closest && e.target.closest('[data-rdrop]'); if (!t || !e.dataTransfer.types.includes('text/x-res')) return; e.preventDefault(); t.classList.remove('over'); const r = resOf(e.dataTransfer.getData('text/x-res')); if (r && t.dataset.rdrop !== r.id) moveRes(r, t.dataset.rdrop || null); });
// Double-click detection is done on clicks: the first click re-renders the row, so a native dblclick may never arrive.
let lastResClick = {}, resClickT = null;
const openResTarget = r => { const a = document.querySelector(`.rrow[data-res="${r.id}"] .rt`); if (a) a.click(); };
Object.assign(ACT, {
  'rt-ext': () => {}, // the name is a real link; the click must not also open the side panel
  pfolder: (el, id) => { ui.menu = null; renderLayer(); ui.pfolder = id || null; ui.insp = null; render(); },
  'open-proj': (el, id) => go(`projects/${id}`),
  'pteam-open': () => { ui.form = 'pteam'; render(); setTimeout(() => { const i = $('#pt-add'); if (i) i.focus(); }, 0); },
  'pteam-rm': (el, id, e) => { e.stopPropagation(); const p = projOf(id), x = (p.team || []).find(v => v.id === el.dataset.p); if (!x) return; p.team = p.team.filter(v => v !== x); logChange(p.div, 'removed a collaborator from', {type: 'project', id: p.id, name: p.name}); save(); render(); toast(L('{who} removed from the project', {who: first(x.id)}), () => { p.team.push(x); rerender(); }); },
  pinv: (el, id) => { const p = projOf(id), x = team(p).find(v => v.id === session.me && v.state === 'invited'); if (!x) return; const prev = {...x}; x.state = el.dataset.r === 'yes' ? 'joined' : 'declined'; x.answeredAt = nowStamp();
    notify(x.by, el.dataset.r === 'yes' ? 'pinvite-yes' : 'pinvite-no', {type: 'project', id: p.id}); logChange(p.div, el.dataset.r === 'yes' ? 'joined' : 'declined to join', {type: 'project', id: p.id, name: p.name}); save();
    if (el.dataset.r === 'yes') { render(); toast(L('You joined {p}', {p: p.name}), () => { Object.assign(x, prev); rerender(); }); } else { go('updates'); toast(L('Invitation declined'), () => { Object.assign(x, prev); rerender(); }); } },
});

// ---------- WBS tab (owner, round 10; request R15: a fourth project tab beside Overview) ----------
// Views: tree top-down, tree left-to-right, and a table modelled on the owner's reference (phase, activity, resources,
// schedule, predecessor, remarks). Everything here is the same task records the Work tab and the Timeline show.
function wbsTab(p, edit) {
  const v = ui.wbsView || session.wbsView || 'v', tree = wbsTree(p), codes = wbsCodes(p), un = unplaced(p), lk = projLook(p), all = [], unMs = db.milestones.filter(m => m.project === p.id && !(m.parent && taskOf(m.parent) && !taskOf(m.parent).trashed));
  (function flat(ns) { ns.forEach(n => { all.push(n); flat(n.kids); }); })(tree);
  const sumTxt = t => { const ru = rollup(t); return `${ru.done}/${ru.total} ${L('done')}${ru.s ? ` · ${rangeTxt({s: ru.s, e: ru.e})}` : ''}`; };
  const days = t => { if (isSummary(t)) { const ru = rollup(t); return ru.s ? daysBetween(ru.s, ru.e) + 1 : null; } return t.due ? daysBetween(t.start || t.due, t.due) + 1 : null; };
  const pred = t => predsOf(t).map(d => `${d.type} ${codes[d.id] || esc(d.t.title)}`).join(' + ');
  const tools = `<div class="toolbar wbs-tool"><div class="seg" role="radiogroup" aria-label="${esc(L('View'))}">${[['v', 'Tree, top down', 'board'], ['h', 'Tree, left to right', 'gantt'], ['table', 'Table', 'list']].map(([k, l, i]) => `<button class="${v === k ? 'on' : ''}" data-act="wbs-view" data-v="${k}" role="radio" aria-checked="${v === k}">${svgD(WBS_IC[k])}${L(l)}</button>`).join('')}</div><span class="grow"></span><span class="t-small t-mute">${plural(tree.length, '{n} phase', '{n} phases')}, ${plural(all.filter(n => !isSummary(n.t)).length, '{n} work package', '{n} work packages')}</span>${edit ? `<button class="btn" data-act="wbs-addms" data-p="${p.id}">${svgD('M12 3l9 9-9 9-9-9Z')}${L('Add milestone')}</button><button class="btn btn-pri" data-act="wbs-add" data-mode="phase" data-id="${p.id}">${icon('plus')}${L('Add phase')}</button>` : ''}</div>`;
  let body;
  if (!tree.length) body = `<div class="empty"><b>${L('No WBS yet')}</b><p>${L('Break the project into phases, then into the work that delivers each one. Everything you add here appears on the Timeline.')}</p>${edit ? `<div class="acts"><button class="btn btn-pri" data-act="wbs-add" data-mode="phase" data-id="${p.id}">${icon('plus')}${L('Add the first phase')}</button></div>` : ''}</div>`;
  else if (v === 'table') {
    // Cells read as plain text. Hover shows the row; double-click a cell to edit it; drag a row to move it (left half = beside,
    // right half = inside); right-click a row for everything else (responsible, dates, status, add a descendant or a milestone, delete).
    const ed = t => edit || canEditTask(t), f2 = d => d ? dShort(d) : '–', grip = `<i class="w-grip" aria-hidden="true">${svgD('M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01')}</i>`;
    const E = (t, f, txt, cls = '') => ed(t) ? `<span class="w-ed ${cls}" data-edit="${f}" data-id="${t.id}" title="${esc(L('Double-click to edit'))}">${txt}</span>` : `<span class="${cls}">${txt}</span>`;
    const guide = d => d ? '<i class="w-guide"></i>' : '';
    const nameCell = (t, depth, cls = '') => `<td class="w-n"><div class="w-nm" style="--d:${depth}">${guide(depth)}${tIcon(t, 'xs')}${E(t, 'title', esc(t.title), `w-title ${cls}`)}</div></td>`;
    const respCell = (t, ids) => `<td class="w-r">${ed(t) ? `<button class="w-ppl" data-act="wbs-resp" data-id="${t.id}" aria-label="${esc(L('Responsible for {t}', {t: t.title}))}">${faces(ids, 3)}</button>` : faces(ids, 3)}</td>`;
    const menuCell = t => `<td class="w-m">${ed(t) ? `<button class="ib" data-act="wbs-menu" data-id="${t.id}" aria-label="${esc(L('Actions for {name}', {name: t.title}))}">${icon('more')}</button>` : ''}</td>`;
    const leaf = (n, depth) => { const t = n.t, dd = days(t), s = t.due ? t.start || t.due : null, pr = pred(t);
      return `<tr class="w-leaf" data-wrow="${t.id}" tabindex="0"><td class="w-c t-num">${ed(t) ? grip : ''}${n.code}</td>${nameCell(t, depth)}${respCell(t, taskPeople(t))}<td class="w-d t-num">${E(t, 'dur', dd || '–')}</td><td class="w-s t-num">${E(t, 'start', f2(s))}</td><td class="w-s t-num">${E(t, 'due', f2(t.due))}</td>
        <td class="w-p t-num" title="${esc(pr)}">${pr || '<span class="t-mute">–</span>'}</td><td class="w-x">${E(t, 'remarks', esc(t.remarks || '') || '<span class="t-mute">–</span>')}</td>${menuCell(t)}</tr>`; };
    const sumRow = (n, depth) => { const t = n.t, ru = rollup(t), dd = days(t);
      return `<tr class="w-sumr" data-wrow="${t.id}" tabindex="0"><td class="w-c t-num">${ed(t) ? grip : ''}${n.code}</td>${nameCell(t, depth)}${respCell(t, [t.owner])}<td class="w-d t-num">${dd || '–'}</td><td class="w-s t-num">${f2(ru.s)}</td><td class="w-s t-num">${f2(ru.e)}</td><td class="w-p"><span class="w-done">${ru.done}/${ru.total} ${L('done')}</span></td><td class="w-x">${E(t, 'remarks', esc(t.remarks || '') || '<span class="t-mute">–</span>')}</td>${menuCell(t)}</tr>`; };
    const msRow = (m, depth) => { const lt = db.tasks.filter(t => t.milestone === m.id && !t.trashed && codes[t.id]);
      return `<tr class="w-msr" data-wms="${m.id}" tabindex="0"><td class="w-c"><i class="w-dia"></i></td><td class="w-n"><div class="w-nm" style="--d:${depth}">${guide(depth)}<span class="w-msn">${esc(m.title)}</span><span class="w-tag">${L('Milestone')}</span></div></td><td class="w-r">${faces([m.owner], 1)}</td><td class="w-d t-num">0</td><td class="w-s t-num">–</td><td class="w-s t-num">${f2(m.target)}</td><td class="w-p t-num">${lt.map(t => `FS ${codes[t.id]}`).join(', ') || '<span class="t-mute">–</span>'}</td><td></td><td class="w-m"><button class="ib" data-act="wms-menu" data-id="${m.id}" aria-label="${esc(L('Actions for {name}', {name: m.title}))}">${icon('more')}</button></td></tr>`; };
    const walk = (n, depth) => (isSummary(n.t) ? sumRow(n, depth) : leaf(n, depth)) + n.kids.map(k => walk(k, depth + 1)).join('') + n.ms.map(m => msRow(m, depth + 1)).join('');
    const section = n => { const t = n.t, ru = rollup(t), dd = days(t);
      return `<tbody class="w-sec"><tr class="w-phr" data-wrow="${t.id}" tabindex="0"><td class="w-c t-num">${edit ? grip : ''}${n.code}</td><td class="w-n"><div class="w-nm">${tIcon(t, 'xs')}${E(t, 'title', esc(t.title), 'w-title ph')}</div></td>${respCell(t, [t.owner])}<td class="w-d t-num">${dd || '–'}</td><td class="w-s t-num">${f2(ru.s)}</td><td class="w-s t-num">${f2(ru.e)}</td>
        <td class="w-p"><span class="w-prog"><i style="width:${ru.total ? ru.done / ru.total * 100 : 0}%"></i></span><span class="w-done">${ru.done}/${ru.total}</span></td><td class="w-x">${edit ? `<button class="linkbtn" data-act="wbs-add" data-mode="child" data-id="${t.id}">${icon('plus', 'ic-xs')} ${L('Add an item')}</button>` : ''}</td>${menuCell(t)}</tr>
        ${n.kids.map(k => walk(k, 1)).join('') + n.ms.map(m => msRow(m, 1)).join('') || `<tr class="w-none"><td></td><td colspan="8" class="t-small t-mute">${L('No items yet. Right-click the phase to add one.')}</td></tr>`}</tbody>`; };
    body = `<div class="wbs-scroll" style="--t:${PALS[lk.p][3]};--a:${PALS[lk.p][1]}"><table class="wbs-t"><colgroup><col class="c-c"><col class="c-n"><col class="c-r"><col class="c-d"><col class="c-s"><col class="c-s"><col class="c-p"><col class="c-x"><col class="c-m"></colgroup>
      <thead><tr><th>${L('WBS')}</th><th>${L('Phase and activity')}</th><th>${L('Responsible')}</th><th class="r">${L('Days')}</th><th>${L('Start')}</th><th>${L('Finish')}</th><th>${L('Predecessors')}</th><th>${L('Remarks')}</th><th></th></tr></thead>${tree.map(section).join('')}
      ${unMs.length ? `<tbody class="w-sec"><tr class="w-phr w-phm"><td class="w-c"></td><td class="w-n" colspan="8"><b>${L('Milestones not placed in the WBS')}</b></td></tr>${unMs.map(m => msRow(m, 1)).join('')}</tbody>` : ''}</table></div>
      <p class="t-small t-mute hint">${L('Double-click a cell to edit it. Drag a row by its handle or anywhere: drop on the left half to put it beside a row, on the right half to put it inside. Right-click a row for responsible people, dates, status, adding a descendant or a milestone, and delete.')}</p>`;
  } else {
    const card = n => { const t = n.t, sum = isSummary(t), ru = sum ? rollup(t) : null;
      return `<div class="wn ${sum ? 'sum' : 'leaf'} ${t.phase ? 'phase' : ''} ${!sum && isDone(t) ? 'done' : ''} ${ui.insp && ui.insp.id === t.id ? 'sel' : ''}" data-act="open-task" data-id="${t.id}" data-wid="${t.id}" tabindex="0"><span class="wn-c t-num">${n.code}</span><b>${tIcon(t, 'xs')}${esc(t.title)}</b>
        <small>${sum ? sumTxt(t) : t.due ? rangeTxt({s: t.start, e: t.due}) : L('No dates yet')}</small>${sum ? `<i class="wn-bar"><i style="width:${ru.total ? ru.done / ru.total * 100 : 0}%"></i></i>` : `<span class="wn-f">${tstat(t.status)}${faces(taskPeople(t), 3)}</span>`}
        ${edit ? `<button class="wn-add" data-act="wbs-add" data-mode="child" data-id="${t.id}" aria-label="${esc(L('Add a part under {t}', {t: t.title}))}" title="${esc(L('Add a part under this'))}">${icon('plus', 'ic-xs')}</button>` : ''}</div>`; };
    const msCard = m => `<div class="wn ms ${m.state === 'achieved' ? 'ok' : ''}" data-act="open-ms" data-id="${m.id}" data-wms="${m.id}" tabindex="0"><i class="wn-dia"></i><b>${esc(m.title)}</b><small>${L('Milestone')}${m.target ? ` · ${dShort(m.target)}` : ''}</small></div>`;
    const li = n => `<li>${card(n)}${n.kids.length || n.ms.length ? `<ul>${n.kids.map(li).join('')}${n.ms.map(m => `<li>${msCard(m)}</li>`).join('')}</ul>` : ''}</li>`;
    const ru0 = {done: projTasks(p).filter(isDone).length, total: projTasks(p).length};
    body = `<div class="wtree-wrap"><div class="wtree ${v === 'h' ? 'h' : 'v'}" style="--t:${PALS[lk.p][3]};--a:${PALS[lk.p][1]}"><ul><li><div class="wn root">${projObj(p, 'xs')}<b>${esc(p.name)}</b><small>${ru0.done}/${ru0.total} ${L('done')}</small></div><ul>${tree.map(li).join('')}${unMs.map(m => `<li>${msCard(m)}</li>`).join('')}</ul></li></ul></div></div>
      <p class="t-small t-mute hint">${L('Click a box to open it; + adds a part under it. Boxes with parts are summaries: their dates and progress come from the work packages below them. Everything here is on the Timeline in the Work tab.')}</p>`; }
  const place = un.length ? `<h2 class="sec-h">${L('Work packages not in the WBS yet')} <span class="n">${un.length}</span></h2><p class="t-small t-mute">${L('Tasks made in the Work tab start here. Place them under a phase or item when you are ready; it is optional.')}</p><div class="rows wunp">${sortSibs(un).map(t => `<div class="row"><span class="tick" aria-hidden="true">${tstat(t.status).replace(/<span class="st-tx">.*?<\/span>/, '')}</span><div class="t"><a data-act="open-task" data-id="${t.id}">${tIcon(t, 'xs')}${esc(t.title)}</a><small>${t.due ? rangeTxt({s: t.start, e: t.due}) : L('No date')} · ${esc(pname(t.owner))}</small></div>${edit || canEditTask(t) ? `<select class="input sel-sm" data-wf="place" data-id="${t.id}" aria-label="${esc(L('Place under'))}"><option value="">${L('Place under…')}</option>${all.map(n => `<option value="${n.t.id}">${n.code} ${esc(n.t.title)}</option>`).join('')}</select>` : ''}</div>`).join('')}</div>` : '';
  return `${tools}${body}${place}`;
}

// ---------- Programs (D47, work_programs, W106, S086) ----------
// A program is an umbrella: a long-running theme with a goal, an owner and a period that groups related projects and operations.
// A project or operation stands alone or belongs to one program, and keeps its own page and ID. Directors and above create
// programs; Co-Directors place their own projects and operations into a program of their division. Progress is counted from the
// children's records only. No sidebar item: the Projects and Operations registers group by program, and the page opens from either.
const PG_D = 'M12 3 21 8 12 13 3 8Z M3 12.5l9 5 9-5 M3 17l9 5 9-5';
const pgOf = id => (db.programs || []).find(g => g.id === id);
const canCreateProgram = (m, d) => !!m && (m.admin || rank(m) >= 3) && visibleDivs(m).includes(d);
const canManageProgram = g => { const m = me(); return !!m && (m.id === g.owner || m.id === g.createdBy || canCreateProgram(m, g.div)); };
const pgItem = key => { const [k, id] = (key || '').split(':'); return k === 'project' ? {k, x: projOf(id)} : {k, x: rtOf(id)}; };
const itemDiv = (k, x) => k === 'project' ? x.div : x.unit;
const canPlace = (k, x, g) => !!x && !(k === 'routine' && x.personal) && (!g || itemDiv(k, x) === g.div) && ((k === 'project' ? canEditProject(x) : canEditRt(x)) || (g ? canManageProgram(g) : false));
const pgKids = g => ({ps: db.projects.filter(p => p.program === g.id), rs: (db.routines || []).filter(r => r.program === g.id)});
const pgPeriod = g => `${g.start ? dShort(g.start) + ' ' + D(g.start).getFullYear() : '?'} – ${g.end ? dShort(g.end) + ' ' + D(g.end).getFullYear() : L('open')}`;
// Progress is only what the children recorded: tasks done, milestones achieved, runs done so far.
function pgStats(g) { const {ps, rs} = pgKids(g), ts = ps.flatMap(projTasks).filter(t => !t.routine), ms = db.milestones.filter(m => ps.some(p => p.id === m.project)), runs = rs.flatMap(r => rtBeats(r, '2000-01-01', today()).filter(b => b.t && b.st !== 'up'));
  return {ps, rs, tDone: ts.filter(isDone).length, tAll: ts.length, mDone: ms.filter(m => m.state === 'achieved').length, mAll: ms.length, rDone: runs.filter(b => ['done', 'late'].includes(b.st)).length, rAll: runs.length, active: ps.filter(p => p.stage === 'active').length, ended: ps.filter(p => ENDED.includes(p.stage)).length}; }
const pgBar = (d, n) => `<span class="pg-bar"><i style="width:${n ? d / n * 100 : 0}%"></i></span>`;
const pgIcon = (cls = '') => `<span class="pg-ic ${cls}">${svgD(PG_D)}</span>`;
function pgChip(k, x) { const g = pgOf(x.program), can = canPlace(k, x, g), any = (db.programs || []).some(v => v.div === itemDiv(k, x));
  if (g) return `<span class="pg-chip">${svgD(PG_D)}<span>${L('Part of')} <a href="#/programs/${g.id}">${esc(g.name)}</a></span>${can ? `<button class="ib" data-act="menu" data-menu="pgplace" data-id="${k}:${x.id}" aria-label="${esc(L('Change program'))}">${icon('chevron-down', 'ic-xs')}</button>` : ''}</span>`;
  return can && any && !(k === 'routine' && x.personal) ? `<button class="pg-add" data-act="menu" data-menu="pgplace" data-id="${k}:${x.id}" aria-haspopup="menu">${svgD(PG_D)}${L('Add to a program')}</button>` : ''; }
MENUS.pgplace = mm => { const {k, x} = pgItem(mm.id); if (!x) return ''; const gs = (db.programs || []).filter(g => g.div === itemDiv(k, x) && canPlace(k, x, g));
  return `<div class="mi-h">${L('Program')}</div>${gs.map(g => `<div class="mi ${x.program === g.id ? 'on' : ''}" data-act="pg-set" data-id="${mm.id}" data-g="${g.id}" tabindex="0" role="menuitemradio" aria-checked="${x.program === g.id}"><span class="mi-l">${svgD(PG_D)}${esc(g.name)}</span>${x.program === g.id ? icon('check', 'tick') : ''}</div>`).join('')}
    <div class="mi ${!x.program ? 'on' : ''}" data-act="pg-set" data-id="${mm.id}" data-g="" tabindex="0" role="menuitemradio" aria-checked="${!x.program}"><span class="mi-l">${L('Not in a program')}</span>${!x.program ? icon('check', 'tick') : ''}</div>`; };
// Picking children from the program page: what this person may place, from the program's division, not yet in another program.
MENUS.pgpick = mm => { const g = pgOf(mm.id), k = ui.menu.k || 'project'; if (!g) return ''; const xs = k === 'project' ? db.projects.filter(p => p.div === g.div && !p.program && canPlace('project', p, g)) : (db.routines || []).filter(r => !r.personal && r.unit === g.div && !r.program && canPlace('routine', r, g));
  return xs.map(x => `<div class="mi" data-act="pg-set" data-id="${k}:${x.id}" data-g="${g.id}" tabindex="0" role="menuitem"><span class="mi-l">${k === 'project' ? projTile(x, 'sm') : `<span class="ob-ic sm">${rtIcon(x)}</span>`}${esc(x.name)}</span></div>`).join('') || `<div class="empty-inline">${k === 'project' ? L('No other projects of this division can be added.') : L('No other operations of this division can be added.')}</div>`; };

// One combined timeline: projects as bars with their milestones, operations as their runs.
function pgTimeline(g) { const {ps, rs} = pgKids(g); if (!ps.length && !rs.length) return '';
  const ds = [g.start, g.end, ...ps.flatMap(p => [p.start, p.due])].filter(Boolean).sort(), lo = (ds[0] || today()).slice(0, 8) + '01', hi0 = ds[ds.length - 1] || addDays(today(), 90), hi = iso(new Date(D(hi0).getFullYear(), D(hi0).getMonth() + 1, 0)), span = daysBetween(lo, hi) + 1, pc = d => Math.max(0, Math.min(100, (daysBetween(lo, d) + .5) / span * 100));
  const months = []; for (let d = D(lo); iso(d) <= hi; d.setMonth(d.getMonth() + 1, 1)) months.push(iso(d));
  const prow = p => { const s = p.start || p.due, e = p.due || p.start, mss = db.milestones.filter(m => m.project === p.id && m.target), st = pStats(p);
    return `<div class="pgt-row"><a class="pgt-l" href="#/projects/${p.id}">${projTile(p, 'sm')}<span><b>${esc(p.name)}</b><small>${stage(p.stage)}</small></span></a><div class="pgt-tr">${s ? `<span class="pgt-bar ${ENDED.includes(p.stage) ? 'ended' : ''}" style="left:${pc(s)}%;width:${Math.max(1.2, pc(e) - pc(s))}%;--tint:${PALS[projLook(p).p][3]};--ink-t:${PALS[projLook(p).p][2]}"><i style="width:${st.total ? st.done / st.total * 100 : 0}%"></i></span>` : `<span class="pgt-none">${L('No dates yet')}</span>`}${mss.map(m => `<button class="pgt-ms ${m.state === 'achieved' ? 'ok' : msLate(m) ? 'late' : ''}" style="left:${pc(m.target)}%" data-act="open-ms" data-id="${m.id}" aria-label="${esc(`${m.title}, ${dLong(m.target)}`)}"><span class="bt-tip"><b>${esc(m.title)}</b><em>${esc(dLong(m.target))}</em></span></button>`).join('')}</div></div>`; };
  const rrow = r => `<div class="pgt-row"><a class="pgt-l" href="#/operations/${r.id}"><span class="ob-ic sm">${rtIcon(r)}</span><span><b>${esc(r.name)}</b><small>${esc(cadShort(r))}</small></span></a><div class="pgt-tr pgt-runs">${rtBeats(r, lo, hi).map(b => `<i class="pgt-run ${b.st}" style="left:${pc(b.d)}%"></i>`).join('')}</div></div>`;
  return `<div class="pgt"><div class="pgt-row pgt-h"><span class="pgt-l pgt-yr">${D(lo).getFullYear()}${D(hi).getFullYear() !== D(lo).getFullYear() ? ` – ${D(hi).getFullYear()}` : ''}</span><div class="pgt-tr">${months.map(d => `<span class="pgt-m" style="left:${pc(d)}%">${MON()[D(d).getMonth()]}</span>`).join('')}</div></div>
    <div class="pgt-body"><div class="pgt-ov"><i class="pgt-now" style="left:${pc(today())}%"></i>${g.start ? `<i class="pgt-span" style="left:${pc(g.start)}%;width:${pc(g.end || hi) - pc(g.start)}%"></i>` : ''}</div>${ps.map(prow).join('')}${rs.map(rrow).join('')}</div></div>`; }

function pgPage(id) { const g = pgOf(id), crumb0 = `<a href="#/projects">${L('Projects')}</a>`;
  if (!g || !visibleDivs(me()).includes(g.div)) return {crumb: crumb0, content: denied()};
  const s = pgStats(g), can = canManageProgram(g), m = me(), placeP = db.projects.some(p => p.div === g.div && !p.program && canPlace('project', p, g)), placeR = (db.routines || []).some(r => !r.personal && r.unit === g.div && !r.program && canPlace('routine', r, g));
  const edit = can && ui.form === 'pg-edit' ? pgForm(g) : '';
  const head = `<div class="pg-hd">${pgIcon('lg')}<div class="pg-hd-t"><p class="op-k">${L('Program of {d}', {d: esc(div(g.div).name)})}</p><h1 class="t-title">${esc(g.name)}</h1><p class="pg-goal">${esc(g.goal) || `<span class="t-mute">${L('No goal written yet.')}</span>`}</p>
      <div class="metaline"><span class="person">${av(g.owner, 'av-xs')}${L('Owner {who}', {who: esc(first(g.owner))})}</span><span class="t-num">${esc(pgPeriod(g))}</span><span class="t-mute">${L('Created by {who}, {date}', {who: esc(first(g.createdBy)), date: dShort(g.at.slice(0, 10))})}</span></div></div>
      ${can ? `<button class="btn btn-sm" data-act="form" data-f="pg-edit">${icon('edit')}${L('Edit details')}</button>` : ''}</div>`;
  const stats = `<div class="pg-stats">
      <div><small>${L('Projects')}</small><b class="t-num">${s.ps.length}</b><span>${s.active ? L('{n} active', {n: s.active}) : ''}${s.active && s.ended ? ', ' : ''}${s.ended ? L('{n} ended', {n: s.ended}) : ''}${!s.active && !s.ended ? L('None active yet') : ''}</span></div>
      <div><small>${L('Tasks done')}</small><b class="t-num">${s.tDone}<em>/${s.tAll}</em></b>${pgBar(s.tDone, s.tAll)}</div>
      <div><small>${L('Milestones achieved')}</small><b class="t-num">${s.mDone}<em>/${s.mAll}</em></b>${pgBar(s.mDone, s.mAll)}</div>
      <div><small>${L('Runs done so far')}</small><b class="t-num">${s.rDone}<em>/${s.rAll}</em></b>${pgBar(s.rDone, s.rAll)}</div></div>
    <p class="t-small t-mute pg-note">${L('Counted from the projects and operations below. Nobody types a percentage.')}</p>`;
  const prow = p => { const st = pStats(p); return `<div class="pg-li" data-act="go" data-h="projects/${p.id}" tabindex="0" role="link">${projTile(p, 'sm')}<span class="pg-li-t"><b>${esc(p.name)}</b><small>${p.lead ? esc(first(p.lead)) : L('No lead')}, ${p.start ? dShort(p.start) : '?'} – ${p.due ? dShort(p.due) : L('no target')}</small></span>${stage(p.stage)}<span class="pg-li-n t-num">${st.done}/${st.total}</span>${canPlace('project', p, g) ? `<button class="ib" data-act="pg-set" data-id="project:${p.id}" data-g="" aria-label="${esc(L('Take {name} out of the program', {name: p.name}))}">${icon('close', 'ic-sm')}</button>` : '<span></span>'}</div>`; };
  const rrow = r => { const b = rtBeats(r, '2000-01-01', addDays(today(), 60)), nx = b.find(x => x.d >= today() && x.st !== 'skip'); return `<div class="pg-li" data-act="go" data-h="operations/${r.id}" tabindex="0" role="link"><span class="ob-ic sm">${rtIcon(r)}</span><span class="pg-li-t"><b>${esc(r.name)}</b><small>${esc(cadShort(r))}${nx ? `, ${L('next {d}', {d: esc(dShort(nx.d))})}` : ''}</small></span>${r.paused ? state(L('Paused'), 'hand', 'warn') : state(L('Running'), 'activity', 'green')}<span class="pg-li-n">${nx && nx.owner ? av(nx.owner, 'av-xs') : ''}</span>${canPlace('routine', r, g) ? `<button class="ib" data-act="pg-set" data-id="routine:${r.id}" data-g="" aria-label="${esc(L('Take {name} out of the program', {name: r.name}))}">${icon('close', 'ic-sm')}</button>` : '<span></span>'}</div>`; };
  const content = `<div class="page wide pgp">${head}${edit}${stats}
    <h2 class="op-h">${L('Timeline')}</h2>${pgTimeline(g) || `<p class="t-small t-mute op-none">${L('Add a project or an operation to see them on one timeline.')}</p>`}
    <div class="pg-cols"><section><h2 class="op-h">${L('Projects')}<span class="n">${s.ps.length}</span>${placeP ? `<button class="btn btn-sm btn-ghost pg-addb" data-act="pg-pick" data-id="${g.id}" data-k="project">${icon('plus', 'ic-sm')}${L('Add a project')}</button>` : ''}</h2>${s.ps.map(prow).join('') || `<p class="t-small t-mute op-none">${L('No projects in this program yet.')}</p>`}</section>
    <section><h2 class="op-h">${L('Operations')}<span class="n">${s.rs.length}</span>${placeR ? `<button class="btn btn-sm btn-ghost pg-addb" data-act="pg-pick" data-id="${g.id}" data-k="routine">${icon('plus', 'ic-sm')}${L('Add an operation')}</button>` : ''}</h2>${s.rs.map(rrow).join('') || `<p class="t-small t-mute op-none">${L('No operations in this program yet.')}</p>`}</section></div>
    <p class="t-small t-mute pg-note">${L('Projects and operations keep their own pages. Taking one out of the program changes the program, never the project or operation.')}</p></div>`;
  return {crumb: `${esc(div(g.div).short)}<i>/</i>${crumb0}<i>/</i><b>${esc(g.name)}</b>`, content}; }

// Create and edit: name, goal, owner, period. Directors and above create; the owner and division leaders above edit.
function pgForm(g) { const isNew = !g, x = g || ui.pgDraft || {name: '', goal: '', owner: session.me, start: today(), end: '', div: ws()}, pool = db.people.filter(p => p.status === 'active' && (p.div === x.div || !p.div) && rank(p) >= 2).sort((a, b) => rank(b) - rank(a));
  return `<div class="pg-form"><div class="field"><label for="pg-name">${L('Name')} <span class="req">*</span></label><input class="input" id="pg-name" value="${esc(x.name)}" placeholder="${esc(L('For example: Partner Relations 2026'))}"><span class="help"></span></div>
    <div class="field"><label for="pg-goal">${L('Goal')}</label><textarea class="textarea sm" id="pg-goal" placeholder="${esc(L('What should be true by the end of the period?'))}">${esc(x.goal)}</textarea></div>
    <div class="pg-row3"><div class="field"><label for="pg-owner">${L('Owner')}</label><select class="input" id="pg-owner">${pool.map(p => `<option value="${p.id}" ${x.owner === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="pg-start">${L('Starts')}</label><input class="input" type="date" id="pg-start" value="${x.start || ''}"></div><div class="field"><label for="pg-end">${L('Ends')}</label><input class="input" type="date" id="pg-end" value="${x.end || ''}"><span class="help"></span></div></div>
    <div class="acts"><button class="btn btn-pri" data-act="pg-save" data-id="${isNew ? '' : g.id}">${isNew ? L('Create program') : L('Save')}</button>${isNew ? `<a class="btn btn-ghost" href="#/projects">${L('Cancel')}</a>` : `<button class="btn btn-ghost" data-act="form">${L('Cancel')}</button><span class="grow"></span><button class="btn btn-danger" data-act="pg-del" data-id="${g.id}">${icon('trash')}${L('Delete program')}</button>`}</div></div>`; }
function pgNew() { const m = me(), w = ws(), crumb = `${esc(div(w).short)}<i>/</i><a href="#/projects">${L('Projects')}</a><i>/</i><b>${L('New program')}</b>`;
  if (!canCreateProgram(m, w)) return {crumb, content: `<div class="page"><div class="empty"><b>${L('Programs are created by Directors and above')}</b><p>${L('You can still place your own projects and operations into a program of your division.')}</p><a class="btn" href="#/projects">${L('Back to Projects')}</a></div></div>`};
  return {crumb, content: `<div class="page pgp"><p class="op-k">${L('New program for {d}', {d: esc(div(w).name)})}</p><h1 class="t-title">${L('New program')}</h1><p class="sub">${L('An umbrella for related projects and operations, with a goal, an owner and a period.')}</p>${pgForm(null)}</div>`}; }
PAGES.programs = r => r.id === 'new' ? pgNew() : pgPage(r.id);
Object.assign(ACT, {
  'new-program': () => { ui.pgDraft = null; go('programs/new'); },
  'pg-pick': (el, id) => { ui.menu = {type: 'pgpick', rect: el.getBoundingClientRect(), id, k: el.dataset.k, width: 300}; renderLayer(); },
  'pg-set': (el, id, e) => { if (e) e.stopPropagation(); const {k, x} = pgItem(id), g = el.dataset.g ? pgOf(el.dataset.g) : null, old = x && x.program ? pgOf(x.program) : null; if (!x) return;
    if (!canPlace(k, x, g || old)) return toast(L('Only the program owner, division leaders or the item’s own leads can do this.'));
    const prev = x.program || null; x.program = g ? g.id : null; ui.menu = null; renderLayer(); logChange(itemDiv(k, x), g ? 'added to a program' : 'took out of a program', {type: k === 'project' ? 'project' : 'task', id: x.id, name: x.name}); save(); render();
    toast(g ? L('Added to {p}', {p: g.name}) : L('Taken out of {p}', {p: (old || {}).name || L('the program')}), () => { x.program = prev; rerender(); }); },
  'pg-save': (el) => { const id = el.dataset.id, m = me(), name = $('#pg-name').value.trim(), start = $('#pg-start').value, end = $('#pg-end').value;
    if (!name) return invalid('#pg-name', L('Give the program a name.')); if (start && end && end < start) return invalid('#pg-end', L('The end comes before the start.'));
    const vals = {name, goal: $('#pg-goal').value.trim(), owner: $('#pg-owner').value, start: start || null, end: end || null};
    if (!id) { if (!canCreateProgram(m, ws())) return; db.programs = db.programs || []; const g = {id: uid('pg'), div: ws(), createdBy: m.id, at: nowStamp(), ...vals}; db.programs.push(g); logChange(g.div, 'created program', {type: 'project', id: g.id, name: g.name}); save(); go(`programs/${g.id}`); return toast(L('Program created'), () => { db.programs = db.programs.filter(v => v !== g); go('projects'); }); }
    const g = pgOf(id); if (!g || !canManageProgram(g)) return; const prev = {...g}; Object.assign(g, vals); ui.form = null; save(); render(); toast(L('Saved'), () => { Object.assign(g, prev); rerender(); }); },
  'pg-del': (el, id) => { const g = pgOf(id); if (!g || !canManageProgram(g)) return; const {ps, rs} = pgKids(g), snap = db.programs.slice(); [...ps, ...rs].forEach(x => { x.program = null; }); db.programs = db.programs.filter(v => v !== g); ui.form = null; save(); go('projects');
    toast(L('Program deleted. Its projects and operations stay.'), () => { db.programs = snap; ps.forEach(p => { p.program = g.id; }); rs.forEach(r => { r.program = g.id; }); rerender(); }); },
  'pg-by': el => { session.pgBy = session.pgBy || {}; session.pgBy[el.dataset.k] = !session.pgBy[el.dataset.k]; saveSession(); render(); },
});
const pgByOn = k => !!(session.pgBy || {})[k];
const pgToggle = k => `<button class="btn ${pgByOn(k) ? 'on pg-by-on' : ''}" data-act="pg-by" data-k="${k}" aria-pressed="${pgByOn(k)}">${svgD(PG_D)}${L('Group by program')}</button>`;
// Register groups: each program with its period, owner and counts, then everything not in a program.
function pgGroups(items, kind, block, w) { const ids = [...new Set(items.map(x => x.program).filter(Boolean))], gs = (db.programs || []).filter(g => ids.includes(g.id) || g.div === w).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const head = g => { const s = pgStats(g); return `<div class="pg-gh"><a href="#/programs/${g.id}" class="pg-gh-a">${pgIcon()}<span><b>${esc(g.name)}</b><small>${av(g.owner, 'av-xs')}${esc(first(g.owner))}, ${esc(pgPeriod(g))}${g.div !== w ? `, ${esc(div(g.div).short)}` : ''}</small></span></a><span class="pg-gh-n">${plural(s.ps.length, '{n} project', '{n} projects')}, ${plural(s.rs.length, '{n} operation', '{n} operations')}</span><a class="btn btn-sm btn-ghost" href="#/programs/${g.id}">${L('Open program')}${icon('right', 'ic-xs')}</a></div>`; };
  const out = gs.map(g => { const kids = items.filter(x => x.program === g.id); return `<section class="pg-grp">${head(g)}${kids.length ? block(kids) : `<p class="t-small t-mute pg-empty">${kind === 'project' ? L('No projects here in this view.') : L('No operations here in this view.')}</p>`}</section>`; }).join('');
  const rest = items.filter(x => !x.program || !gs.some(g => g.id === x.program));
  return out + (rest.length ? `<section class="pg-grp"><div class="pg-gh plain"><b>${L('Not in a program')}</b><span class="pg-gh-n">${rest.length}</span></div>${block(rest)}</section>` : ''); }

// ---------- demo programs (owner brief, D47): Partner Relations 2026 (EE), Content & Brand (MarcomIT), Consultant Training 2026 (TnD branch of Consulting) ----------
function seedPrograms() { if (!db || !db.projects || db.pgSeeded) return; db.pgSeeded = true; db.programs = db.programs || [];
  const P = (id, name, div, stg, lead, start, due, goal, by, pg) => { if (!db.projects.some(p => p.id === id)) db.projects.push({id, name, div, stage: stg, lead, pm: null, start, due, goal, scopeIn: '', scopeOut: '', reason: '', team: [], org: false, createdBy: by, createdAt: '2026-09-10T10:00', program: pg}); };
  const T0 = db.tasks[0], TK = (id, title, owner, due, project, by, st) => { if (db.tasks.some(t => t.id === id)) return; db.tasks.push({...JSON.parse(JSON.stringify(T0)), id, title, owner, due, time: null, status: st || 'todo', reviewer: null, project, milestone: null, div: null, notes: '', evidence: '', doneAt: st === 'done' ? due : null, createdBy: by, createdAt: '2026-09-12T10:00', offer: null, meeting: null, links: [], mentions: [], trashed: false, start: null, deps: [], assignees: [], parent: null, inWbs: false, phase: false, remarks: '', order: null, icon: null, reactions: {}, routine: null, occ: null, checklist: []}); };
  const MS = (id, project, title, owner, target, st) => { if (!db.milestones.some(m => m.id === id)) db.milestones.push({id, project, title, owner, target, state: st || 'active', achievedAt: st === 'achieved' ? target + 'T10:00' : null, achievedBy: st === 'achieved' ? owner : null, parent: null}); };
  db.programs.push(
    {id: 'pg-partner', name: 'Partner Relations 2026', div: 'ee', goal: 'Keep every partner warm through the year: a check-in each month, two partner events and a renewed agreement with each key partner.', owner: 'rani', start: '2026-08-01', end: '2027-07-31', createdBy: 'rani', at: '2026-08-20T09:00'},
    {id: 'pg-brand', name: 'Content & Brand', div: 'mcit', goal: 'One consistent voice for DWDG: the new website, a steady posting rhythm and a brand kit everyone can use.', owner: 'galih', start: '2026-09-01', end: '2027-06-30', createdBy: 'galih', at: '2026-08-28T09:00'},
    {id: 'pg-train', name: 'Consultant Training 2026', div: 'cons', goal: 'Train this year’s consultants in two cohorts, with weekly sessions and a final case presentation for each cohort.', owner: 'putri', start: '2026-09-01', end: '2027-05-31', createdBy: 'reza', at: '2026-08-25T09:00'});
  const pb = db.projects.find(p => p.id === 'p-breakfast'); if (pb) pb.program = 'pg-partner'; const ps = db.projects.find(p => p.id === 'p-site'); if (ps) ps.program = 'pg-brand';
  P('p-renew', 'Partner agreement renewals', 'ee', 'planned', 'alya', '2026-10-15', '2026-12-15', 'Renew the agreement with each of our five key partners before the semester ends.', 'rani', 'pg-partner');
  P('p-brandkit', 'Brand kit refresh', 'mcit', 'planned', 'laras', '2026-11-02', '2026-12-18', 'A shared kit of logos, colors, templates and tone rules for every division.', 'galih', 'pg-brand');
  P('p-coh1', 'Consultant cohort 1', 'cons', 'active', 'putri', '2026-09-15', '2026-11-28', 'Twelve consultants finish eight sessions and present one case each.', 'reza', 'pg-train');
  P('p-coh2', 'Consultant cohort 2', 'cons', 'planned', 'putri', '2027-02-01', '2027-04-30', 'The second cohort, same format, with what we learn from cohort 1.', 'reza', 'pg-train');
  TK('t-rn1', 'List the five key partners and their agreement end dates', 'tasya', '2026-10-20', 'p-renew', 'alya'); TK('t-rn2', 'Draft the renewal letter', 'dewi', '2026-10-30', 'p-renew', 'alya'); TK('t-rn3', 'Book renewal meetings', 'alya', '2026-11-10', 'p-renew', 'alya');
  TK('t-bk1', 'Collect the logos and colors in use', 'yoga', '2026-11-10', 'p-brandkit', 'laras'); TK('t-bk2', 'Write the tone rules', 'farah', '2026-11-24', 'p-brandkit', 'laras');
  TK('t-c1', 'Run sessions 1 to 3', 'putri', '2026-10-02', 'p-coh1', 'putri', 'done'); TK('t-c2', 'Share the case pack', 'maya', '2026-10-09', 'p-coh1', 'putri'); TK('t-c3', 'Run sessions 4 to 6', 'putri', '2026-10-30', 'p-coh1', 'putri'); TK('t-c4', 'Book the room for the presentations', 'bima', '2026-11-14', 'p-coh1', 'putri');
  MS('ms-rn', 'p-renew', 'All key partners renewed', 'alya', '2026-12-15'); MS('ms-c1a', 'p-coh1', 'First half of sessions done', 'putri', '2026-10-17'); MS('ms-c1b', 'p-coh1', 'Cohort 1 case presentations', 'putri', '2026-11-28'); MS('ms-bk', 'p-brandkit', 'Brand kit shared with all divisions', 'laras', '2026-12-18');
  const rt3 = rtOf('rt3'); if (rt3) rt3.program = 'pg-brand';
  if (!rtOf('rt5')) db.routines.push({id: 'rt5', name: 'Monthly partner check-in', unit: 'ee', personal: false, project: null, program: 'pg-partner', cadence: 'monthly', every: 30, start: '2026-08-25', dueOffset: 3, time: null, owners: ['tasya', 'dewi'], rotate: true, checklist: ['Message each partner contact', 'Note anything they need from us', 'Update the partner sheet'], paused: false, skips: [], createdBy: 'alya', at: '2026-08-21T09:00', seedDoneBefore: '2026-10-01', icon: {n: 'handshake', c: 'orange'}, signoff: true, signer: 'alya'});
  if (!rtOf('rt6')) db.routines.push({id: 'rt6', name: 'Weekly training session prep', unit: 'cons', personal: false, project: 'p-coh1', program: 'pg-train', cadence: 'weekly', every: 7, start: '2026-09-16', dueOffset: 1, time: null, owners: ['bima', 'maya'], rotate: true, checklist: ['Print the case', 'Set up the room', 'Send the reading to the cohort'], paused: false, skips: [], createdBy: 'putri', at: '2026-09-10T09:00', seedDoneBefore: '2026-10-03', icon: {n: 'school', c: 'blue'}, signoff: true, signer: 'putri'});
  ensureLooks(); ensureRoutines(); save(); }
STAGES.cancelled[0] = 'Canceled'; // R22d (D43) until app.js says it, request R23
