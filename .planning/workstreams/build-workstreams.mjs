// Builds the DWDG'ONE workstream overlay from the canonical planning workspace.
// Reads .planning/dwdg-one-prd/state/planning-workspace.json (never writes it).
// Writes, per stream: <ID>/BRIEF.md and <ID>/EXTRACT.md; plus README.md tables, map.json and a coverage check.
// Run: node .planning/workstreams/build-workstreams.mjs   (exit code 1 if any package, story or PRD node is unassigned)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const wsPath = path.join(here, '../dwdg-one-prd/state/planning-workspace.json');
const W = JSON.parse(fs.readFileSync(wsPath, 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(here, 'streams.json'), 'utf8'));
const STREAMS = S.streams;
const sid = Object.fromEntries(STREAMS.map(s => [s.id, s]));

// ---------- 1. WBS packages and cards ----------
const leaf = W.wbs.filter(w => /^W\d+$/.test(w.id));
const wbsStream = {};
for (const s of STREAMS) for (const id of s.wbs) { if (wbsStream[id]) throw new Error(`${id} in ${wbsStream[id]} and ${s.id}`); wbsStream[id] = s.id; }
const missingW = leaf.filter(w => !wbsStream[w.id]).map(w => w.id);
const unknownW = Object.keys(wbsStream).filter(id => !leaf.find(w => w.id === id));

// ---------- 2. stories follow their package ----------
const storyStream = {}; const orphanStories = [];
for (const st of W.stories) { const s = wbsStream[st.wbsId]; if (s) storyStream[st.id] = s; else orphanStories.push(st.id); }
const cardStream = {}; for (const c of W.cards) cardStream[c.id] = wbsStream[c.wbsId] || null;

// ---------- 3. PRD nodes: one owning stream each ----------
const nodes = W.prd.nodes, byId = Object.fromEntries(nodes.map(n => [n.id, n]));
const kids = {}; nodes.forEach(n => (kids[n.parent] = kids[n.parent] || []).push(n.id));
const refBy = {}; // node -> {stream: count}
const bump = (r, s) => { if (!byId[r] || !s) return; (refBy[r] = refBy[r] || {})[s] = (refBy[r][s] || 0) + 1; };
for (const w of leaf) for (const r of w.requirementIds || []) bump(r, wbsStream[w.id]);
for (const st of W.stories) for (const r of st.requirementIds || []) bump(r, storyStream[st.id]);
const order = STREAMS.map(s => s.id);
const best = counts => Object.entries(counts).sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))[0][0];
const owner = {}, how = {};
// a) explicit owner table (siblings under section headings that no package lists directly)
const rules = S.nodeRules.map(r => ({re: new RegExp(r.match), stream: r.stream}));
for (const n of nodes) { if (n.id === 'root') continue; const r = rules.find(x => x.re.test(n.id)); if (r) { owner[n.id] = r.stream; how[n.id] = 'rule'; } }
// b) direct references from packages and stories (most references wins)
for (const n of nodes) if (!owner[n.id] && refBy[n.id]) { owner[n.id] = best(refBy[n.id]); how[n.id] = 'linked'; }
// c) section headings: majority of their children; d) anything left: nearest owned ancestor
const fromKids = id => { const c = {}; for (const k of kids[id] || []) { const o = owner[k] || fromKids(k); if (o) c[o] = (c[o] || 0) + 1; } return Object.keys(c).length ? best(c) : null; };
for (const n of nodes) if (!owner[n.id] && n.id !== 'root') { const o = fromKids(n.id); if (o) { owner[n.id] = o; how[n.id] = 'section'; } }
for (const n of nodes) if (!owner[n.id] && n.id !== 'root') { let p = byId[n.parent]; while (p && !owner[p.id]) p = byId[p.parent]; if (p) { owner[n.id] = owner[p.id]; how[n.id] = 'inherited'; } }
const unownedNodes = nodes.filter(n => n.id !== 'root' && !owner[n.id]).map(n => n.id);
const badRule = Object.values(owner).filter(s => !sid[s]);

// ---------- 4. connections between streams (derived from package prerequisites) ----------
const wbsById = Object.fromEntries(W.wbs.map(w => [w.id, w]));
const edges = {}; // `${from}>${to}` -> [[pkg, prereq]]
for (const w of leaf) for (const d of w.dependsOn || []) { const a = wbsStream[d], b = wbsStream[w.id]; if (a && b && a !== b) (edges[`${a}>${b}`] = edges[`${a}>${b}`] || []).push([w.id, d]); }
const consumes = s => Object.entries(edges).filter(([k]) => k.endsWith('>' + s)).map(([k, v]) => ({from: k.split('>')[0], pairs: v}));
const feeds = s => Object.entries(edges).filter(([k]) => k.startsWith(s + '>')).map(([k, v]) => ({to: k.split('>')[1], pairs: v}));
// requirements a stream's packages reference but another stream owns
const borrowed = s => [...new Set(leaf.filter(w => wbsStream[w.id] === s).flatMap(w => w.requirementIds || []))].filter(r => owner[r] && owner[r] !== s);

// ---------- 5. writers ----------
const clean = t => String(t || '').trim();
const quoteBlock = t => clean(t).split('\n').map(l => l.trim()).filter(Boolean).join('\n');
const deps = n => Array.isArray(n.dependencies) ? n.dependencies : String(n.dependencies || "").split(/[\s,]+/).filter(Boolean);
const nodeMd = n => `### ${n.title}\n\`${n.id}\` · ${n.status} · ${n.priority}${n.parent ? ` · parent \`${n.parent}\`` : ''}${n.owner ? ` · owner: ${n.owner}` : ''}\n\n${quoteBlock(n.notes)}\n\n**Acceptance:**\n${quoteBlock(n.acceptance)}${deps(n).length ? `\n\n**Prerequisites:** ${deps(n).map(d => `\`${d}\`${owner[d] && owner[d] !== owner[n.id] ? ` (${owner[d]})` : ''}`).join(', ')}` : ''}\n`;
const wbsMd = w => `### ${w.id} · ${w.title}\n${w.priority} · ${w.release}${(S.p0slice || []).includes(w.id) ? ' · **in the D1 first-version slice**' : ''} · proposed owner: ${w.owner}\n\n**Deliverable:** ${clean(w.deliverable)}\n\n**Acceptance:**\n${quoteBlock(w.acceptance)}\n\n**Requirements:** ${(w.requirementIds || []).map(r => `\`${r}\`${owner[r] && owner[r] !== wbsStream[w.id] ? ` (${owner[r]})` : ''}`).join(', ') || 'none'}\n\n**Prerequisites:** ${(w.dependsOn || []).map(d => `${d}${wbsStream[d] && wbsStream[d] !== wbsStream[w.id] ? ` (${wbsStream[d]})` : ''}`).join(', ') || 'none'}\n\n**Kanban card:** ${W.cards.filter(c => c.wbsId === w.id).map(c => `${c.id} (${c.status})`).join(', ') || 'none'}\n`;
const storyMd = st => `### ${st.id} · ${st.actor}\nActivity \`${st.activityId}\` · ${st.release} · ${st.priority} · WBS ${st.wbsId}\n\nAs ${st.actor}, I want to ${clean(st.action).replace(/\.$/, '')}, so that ${clean(st.benefit).replace(/\.+$/, '')}.\n\n**Acceptance:**\n${quoteBlock(st.acceptance)}\n\n**Requirements:** ${(st.requirementIds || []).map(r => `\`${r}\``).join(', ')}\n`;

const nodeOrder = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
for (const s of STREAMS) {
  const dir = path.join(here, s.id); fs.mkdirSync(dir, {recursive: true});
  const pk = leaf.filter(w => wbsStream[w.id] === s.id);
  const sts = W.stories.filter(st => storyStream[st.id] === s.id);
  const own = nodes.filter(n => owner[n.id] === s.id).sort((a, b) => nodeOrder[a.id] - nodeOrder[b.id]);
  const bor = borrowed(s.id).map(id => byId[id]).sort((a, b) => nodeOrder[a.id] - nodeOrder[b.id]);
  const extract = `# ${s.id} · ${s.name}: requirement extract\n\nGenerated by \`build-workstreams.mjs\` from planning-workspace.json revision ${W.revision}. Do not edit by hand: change the workspace through planner-cli, then regenerate.\nThis is everything the planning workspace says about this stream's scope. Read it fully; you do not need the 23,000-line workspace.\n\n## Work packages (${pk.length})\n\n${pk.map(wbsMd).join('\n')}\n## User stories (${sts.length})\n\n${sts.map(storyMd).join('\n') || 'None directly; see packages.\n'}\n## Requirements this stream owns (${own.length})\n\n${own.map(nodeMd).join('\n')}\n## Requirements owned elsewhere that this stream must respect (${bor.length})\n\nSummaries only. The owning stream decides their detail; ask through REQUESTS.md if one blocks you.\n\n${bor.map(n => `- \`${n.id}\` (${owner[n.id]}, ${n.status}): ${n.title}. ${clean(n.notes).split('\n')[0].slice(0, 220)}`).join('\n') || 'None.'}\n`;
  fs.writeFileSync(path.join(dir, 'EXTRACT.md'), extract);

  const cin = consumes(s.id), cout = feeds(s.id);
  const brief = `# ${s.id} · ${s.name}

**Model:** ${s.model} · **effort:** ${s.effort} · **wave:** ${s.wave} · **reviewer:** ${s.reviewer}

${s.mission}

## You own
${s.owns.map(x => `- ${x}`).join('\n')}

## Out of scope (owned by other streams)
${s.notMine.map(x => `- ${x}`).join('\n')}

## Connections
**You consume** (wait for these, or work against the agreed contract):
${[...s.consumes.map(x => `- ${x}`), ...cin.map(c => `- ${c.from} · ${sid[c.from].name}: ${c.pairs.map(([a, b]) => `${a} needs ${b}`).join('; ')}`)].join('\n') || '- Nothing.'}

**You provide** (others build on these, so publish them in \`${s.id}/INTERFACE.md\` before handing off):
${[...s.provides.map(x => `- ${x}`), ...cout.map(c => `- to ${c.to} · ${sid[c.to].name}: ${c.pairs.map(([a, b]) => `${b} unblocks ${a}`).join('; ')}`)].join('\n') || '- Nothing.'}

## Source documents to read (after your extract)
${(s.sources || []).map(x => `- ${x}`).join('\n') || '- None beyond the extract.'}

## First session: do this
${s.firstSteps.map((x, i) => `${i + 1}. ${x}`).join('\n')}

## Done when
${s.doneWhen.map(x => `- ${x}`).join('\n')}

## Scope at a glance
- Work packages: ${leaf.filter(w => wbsStream[w.id] === s.id).map(w => `${w.id}${(S.p0slice || []).includes(w.id) ? '★' : ''}`).join(', ')} (★ = D1 first-version slice)
- Stories: ${W.stories.filter(st => storyStream[st.id] === s.id).map(st => st.id).join(', ') || 'none'}
- Requirements owned: ${nodes.filter(n => owner[n.id] === s.id).length}; full text in \`EXTRACT.md\`

## Prompt to paste into the session
\`\`\`text
${S.promptTemplate.replaceAll('{ID}', s.id).replaceAll('{NAME}', s.name).replaceAll('{MODEL}', s.model)}
\`\`\`
`;
  fs.writeFileSync(path.join(dir, 'BRIEF.md'), brief);
  for (const f of ['HANDOFF.md', 'INTERFACE.md']) { const p = path.join(dir, f); if (!fs.existsSync(p)) fs.writeFileSync(p, f === 'HANDOFF.md' ? `# ${s.id} handoff log\n\nNewest first. Each session appends: date, model, what changed (paths), evidence, open questions, next step.\n` : `# ${s.id} interface\n\nWhat other streams may rely on: entity fields, commands, events, routes, components, decisions. Empty until the first session publishes it.\n`); }
}

// ---------- 6. index tables and map ----------
const table = STREAMS.map(s => `| [${s.id}](${s.id}/BRIEF.md) | ${s.name} | ${s.wave} | ${s.model}, ${s.effort} | ${leaf.filter(w => wbsStream[w.id] === s.id).length} | ${W.stories.filter(st => storyStream[st.id] === s.id).length} | ${nodes.filter(n => owner[n.id] === s.id).length} |`).join('\n');
const flow = Object.entries(edges).map(([k, v]) => `| ${k.split('>')[0]} | ${k.split('>')[1]} | ${v.map(([a, b]) => `${b}→${a}`).join(', ')} |`).sort().join('\n');
const readme = fs.readFileSync(path.join(here, 'README.template.md'), 'utf8').replace('{{TABLE}}', table).replace('{{FLOW}}', flow).replace('{{REV}}', String(W.revision));
fs.writeFileSync(path.join(here, 'README.md'), readme);
fs.writeFileSync(path.join(here, 'map.json'), JSON.stringify({generatedFrom: {revision: W.revision, updatedAt: W.updatedAt}, wbs: wbsStream, stories: storyStream, cards: cardStream, prd: owner, prdAssignedBy: how}, null, 1));

const problems = {missingW, unknownW, orphanStories, unownedNodes, badRule};
const bad = Object.entries(problems).filter(([, v]) => v.length);
console.log(`streams ${STREAMS.length} · packages ${leaf.length} · stories ${W.stories.length} · PRD nodes ${nodes.length - 1} (linked ${Object.values(how).filter(h => h === 'linked').length}, rule ${Object.values(how).filter(h => h === 'rule').length}, section ${Object.values(how).filter(h => h === 'section').length}, inherited ${Object.values(how).filter(h => h === 'inherited').length}) · cross-stream links ${Object.keys(edges).length}`);
if (bad.length) { console.error('COVERAGE PROBLEMS', JSON.stringify(Object.fromEntries(bad), null, 1)); process.exit(1); }
console.log('coverage ok: every package, story and requirement has exactly one owning stream');
