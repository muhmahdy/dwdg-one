// Writes brand/sheet.html: logo, icons at real sizes, light/dark usage. Everything inlined.
import fs from 'node:fs';
import {ICONS} from './gen-icons.mjs';

const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const sized = (svg, w) => svg.replace('<svg ', `<svg width="${w}" `);
const ic = (id, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[id].svg}</svg>`;
const ids = Object.keys(ICONS);
const card = id => `<div class="card"><div class="big">${ic(id, 48)}</div><b>${ICONS[id].label}</b><p>${ICONS[id].meaning}</p><div class="sizes">${[20, 16, 12].map(s => `<span>${ic(id, s)}<small>${s}</small></span>`).join('')}</div></div>`;
const list = theme => `<div class="list ${theme}"><div class="cap">Divisions</div>${ids.filter(i => i.startsWith('div-')).map(i => `<div class="li">${ic(i, 18)}<span>${ICONS[i].label}</span></div>`).join('')}<div class="cap">Roles</div>${ids.filter(i => i.startsWith('role-')).map(i => `<div class="li">${ic(i, 18)}<span>${ICONS[i].label}</span></div>`).join('')}</div>`;
const tree = [['role-president', 'President', 0], ['role-vp-external', 'VP External', 1], ['div-ee', 'External Engagement · Partner, Client', 2], ['div-mcit', 'Marketing Communication & IT', 2], ['role-vp-internal', 'VP Internal', 1], ['div-hr', 'Human Resources', 2], ['div-fnl', 'Finance & Legal', 2], ['div-sng', 'Strategy & Growth', 2], ['role-vp-consulting', 'VP Consulting', 1], ['div-cons', 'Consulting · Project Associates, Knowledge, TnD', 2], ['div-en', 'Expertise Network — planned 2027', 2]]
  .map(([i, t, d]) => `<div class="li" style="padding-left:${d * 26}px">${ic(i, 18)}<span>${t}</span></div>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>dwdg’ONE identity</title>
<style>
:root{--dwdg-green:#00C25A;--ink:#0E0E0C;--cream:#F7F4EC}
*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:32px 24px 60px}
h1{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#77756d;font-weight:600;margin:36px 0 14px}
.hero{display:flex;gap:40px;align-items:center;flex-wrap:wrap}
.dark{background:var(--ink);color:#f3f1ea;border-radius:16px;padding:28px}
.row{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:12px}
.card{background:#fff;border:1px solid #e6e2d6;border-radius:14px;padding:16px;color:var(--ink)}
.card .big{height:56px;display:flex;align-items:center}
.card b{display:block;margin-top:6px}.card p{margin:4px 0 10px;color:#6f6c63;font-size:12px;min-height:34px}
.sizes{display:flex;gap:16px;align-items:flex-end}.sizes span{display:flex;flex-direction:column;align-items:center;gap:4px}.sizes small{font-size:10px;color:#9a978d}
.lists{display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:16px}
.list{border-radius:14px;padding:14px 16px;border:1px solid #e6e2d6;background:#fff;color:var(--ink)}
.list.dk{background:var(--ink);color:#f3f1ea;border-color:#222}
.cap{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9a978d;margin:8px 0 4px}
.li{display:flex;gap:10px;align-items:center;min-height:30px}
</style></head><body><div class="wrap">
<h1>Official dwdg logo (source file, unchanged)</h1><div class="row">${sized(read('dwdg-logo.svg'), 360)}<div class="dark">${sized(read('dwdg-logo-reverse.svg'), 300)}</div></div>
<h1>dwdg’ONE primary lockup — built on the official letters</h1>
<div class="hero">${sized(read('dwdg-one-lockup.svg'), 640)}</div>
<h1>On dark · wordmark · app icons · favicon</h1>
<div class="dark row">${sized(read('dwdg-one-lockup-reverse.svg'), 420)}${sized(read('dwdg-one-wordmark-reverse.svg'), 220)}</div>
<div class="row" style="margin-top:20px">${sized(read('dwdg-one-wordmark.svg'), 240)}${['light', 'dark', 'brand'].map(v => sized(read(`dwdg-one-icon-${v}.svg`), 112)).join('')}${[64, 32, 16].map(w => sized(read('dwdg-one-icon-light.svg'), w)).join('')}</div>
<h1>Role icons</h1><div class="grid">${ids.filter(i => i.startsWith('role-')).map(card).join('')}</div>
<h1>Division icons</h1><div class="grid">${ids.filter(i => i.startsWith('div-')).map(card).join('')}</div>
<h1>In use — sidebar light / dark · organisation tree</h1>
<div class="lists">${list('')}${list('dk')}<div class="list"><div class="cap">Ideal structure</div>${tree}</div></div>
</div></body></html>`;
fs.writeFileSync(new URL('sheet.html', import.meta.url), html);
console.log('sheet.html', html.length);
