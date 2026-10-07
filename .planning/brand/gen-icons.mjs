// DWDG'ONE role and division icons — 24px grid, two tones.
// Ink uses currentColor (follows text colour in light/dark); the accent uses --dwdg-green.
// Run: node .planning/brand/gen-icons.mjs  → writes icons/*.svg and icons/sprite.svg
import fs from 'node:fs';

const G = 'var(--dwdg-green,#00C25A)', I = 'currentColor';
const p = (d, fill = I) => `<path fill="${fill}" d="${d}"/>`;
const pr = (d, fill = I) => `<path fill="${fill}" stroke="${fill}" stroke-width="1.4" stroke-linejoin="round" d="${d}"/>`;
const s = (d, stroke = I, w = 3) => `<path fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
const c = (cx, cy, r, fill = I) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const ring = (cx, cy, r, stroke = I, w = 3) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`;
// Split shapes: draw the whole rounded silhouette once, then clip green to exactly x < 12,
// so the split always lands on the centre line (fixes the 0.7-unit shift of per-half outlines).
const CLIP = '<clipPath id="dwdg-half-l"><rect width="12" height="24"/></clipPath>';
const split = d => CLIP + pr(d, I) + `<g clip-path="url(#dwdg-half-l)">${pr(d, G)}</g>`;
// VP family: one Y (a leader branching to divisions); the green element on top names the VP.
const Y = s('M5 10.6 12 15.6 19 10.6M12 15.6V21.2', I, 3.6);
const vp = (top, label, meaning) => ({label, meaning, svg: top + Y});

export const ICONS = {
  // ROLES — rank reads top to bottom; the split green/black motif comes from the logo's O.
  'role-admin': {label: 'Admin', meaning: 'Highest explicit authority: a shield, split like the logo.',
    svg: split('M12 2 4 5v6c0 5.5 3.4 9.4 8 11 4.6-1.6 8-5.5 8-11V5Z')},
  'role-president': {label: 'President', meaning: 'Top leadership: a four-point star, the organisation’s north point.',
    svg: split('M12 1c.9 6.6 3.9 9.9 11 11-7.1 1.1-10.1 4.4-11 11-.9-6.6-3.9-9.9-11-11 7.1-1.1 10.1-4.4 11-11Z')},
  'role-vp': vp('<rect x="6.8" y="1.8" width="10.4" height="5" rx="2.5" fill="' + G + '"/>', 'Vice President', 'Current single VP: a leader (green bar) branching to the divisions.'),
  'role-vp-external': vp(c(12, 4.4, 3.6, G), 'VP External', 'Leads EE and MCIT: the circle echoes EE’s meeting circles.'),
  'role-vp-internal': vp(pr('M12 1.2 16.6 7.8H7.4Z', G), 'VP Internal', 'Leads HR, FnL and SnG: a roof, the home of the organisation.'),
  'role-vp-consulting': vp(pr('M12 .7 15.8 4.5 12 8.3 8.2 4.5Z', G), 'VP Consulting', 'Leads Consulting and EN: the diamond echoes Consulting’s mark.'),
  'role-director': {label: 'Director', meaning: 'Leads one division: a single diamond, split.',
    svg: split('M12 2.5 21.5 12 12 21.5 2.5 12Z')},
  'role-co-director': {label: 'Co-Director / CD', meaning: 'Shared leadership: two diamonds side by side.',
    svg: pr('M7.5 5.5 14 12l-6.5 6.5L1 12Z') + pr('M16.5 5.5 23 12l-6.5 6.5L10 12Z', G)},
  'role-member': {label: 'Member', meaning: 'Every member is part of ONE: the logo’s O.',
    svg: CLIP + c(12, 12, 8) + `<g clip-path="url(#dwdg-half-l)">${c(12, 12, 8, G)}</g>`},

  // DIVISIONS — exact names and shorthands from the product owner (5 Oct 2026)
  'div-hr': {label: 'Human Resources · HR', meaning: 'People, culture and development: a team, one person in front.',
    svg: `<mask id="hr-gap" maskUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><circle cx="12" cy="7" r="5" fill="#000"/><path fill="#000" stroke="#000" stroke-width="3.4" stroke-linejoin="round" d="M6.6 21v-2.3c0-3.4 2.4-5.8 5.4-5.8s5.4 2.4 5.4 5.8V21Z"/></mask><g mask="url(#hr-gap)">` + c(4.6, 9.4, 2.5) + pr('M.9 20.2v-.9c0-2.7 1.6-4.5 3.7-4.5s3.7 1.8 3.7 4.5v.9Z') + c(19.4, 9.4, 2.5) + pr('M15.7 20.2v-.9c0-2.7 1.6-4.5 3.7-4.5s3.7 1.8 3.7 4.5v.9Z') + `</g>` + c(12, 7, 3.3, G) + pr('M7.6 20.6v-1.9c0-2.9 2-4.9 4.4-4.9s4.4 2 4.4 4.9v1.9Z', G)},
  'div-ee': {label: 'External Engagement · EE', meaning: 'Partners and clients: two circles meeting.',
    svg: ring(8.5, 12, 6) + ring(15.5, 12, 6, G)},
  'div-mcit': {label: 'Marketing Communication & IT · MCIT', meaning: 'Brand, communication and systems: a signal going out.',
    svg: c(5.5, 12, 3) + s('M11 7.5a6.5 6.5 0 0 1 0 9', G) + s('M15.5 4a11.5 11.5 0 0 1 0 16')},
  'div-fnl': {label: 'Finance & Legal · FnL', meaning: 'Money and law in balance: a scale.',
    svg: s('M12 4v16M7.5 20.5h9M4 7.5h16', I, 2.6) + p('M1 11.5h7.5a3.75 3.75 0 0 1-7.5 0Z', G) + p('M15.5 11.5H23a3.75 3.75 0 0 1-7.5 0Z')},
  'div-sng': {label: 'Strategy & Growth · SnG', meaning: 'A planned path that rises.',
    svg: s('M3 18l6-6 4 3 4.5-4.5') + pr('M21.4 6.6 19.9 12.9 15.1 8.1Z', G)},
  'div-cons': {label: 'Consulting · Cons', meaning: 'Projects, knowledge and talent: the consultant’s 2×2, one quadrant lit.',
    svg: pr('M12 2.2 15.8 6 12 9.8 8.2 6Z', G) + pr('M18 8.2 21.8 12 18 15.8 14.2 12Z') + pr('M12 14.2 15.8 18 12 21.8 8.2 18Z') + pr('M6 8.2 9.8 12 6 15.8 2.2 12Z')},
  'div-en': {label: 'Expertise Network · EN (2027)', meaning: 'A circle of outside experts around a centre.',
    svg: ring(12, 12, 8.5, I, 2) + c(12, 3.5, 2.6) + c(20.1, 14.6, 2.6) + c(3.9, 14.6, 2.6) + c(12, 12, 3.4, G)},
};

let FIT = {}; if (!process.env.NOFIT) try { FIT = JSON.parse(fs.readFileSync(new URL('./icons/fit.json', import.meta.url), 'utf8')); } catch {}
for (const [k, v] of Object.entries(ICONS)) if (FIT[k]) v.svg = `<g transform="${FIT[k]}">${v.svg}</g>`;
const OUT = new URL('./icons/', import.meta.url);
fs.mkdirSync(OUT, {recursive: true});
const wrap = (id, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${extra}aria-hidden="true">${body}</svg>\n`;
let sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n';
for (const [id, ic] of Object.entries(ICONS)) {
  fs.writeFileSync(new URL(`${id}.svg`, OUT), wrap(id, ic.svg));
  sprite += `<symbol id="${id}" viewBox="0 0 24 24">${ic.svg}</symbol>\n`;
}
fs.writeFileSync(new URL('sprite.svg', OUT), sprite + '</svg>\n');
fs.writeFileSync(new URL('icons.json', OUT), JSON.stringify(Object.fromEntries(Object.entries(ICONS).map(([k, v]) => [k, {label: v.label, meaning: v.meaning}])), null, 1));
console.log(Object.keys(ICONS).length, 'icons');
