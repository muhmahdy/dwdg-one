import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const files=['sections-foundation.json','sections-product.json','sections-detail.json','sections-changes.json','sections-operations.json'];
const extras=fs.readdirSync(here).filter(f=>f.startsWith('sections-')&&f.endsWith('.json')&&!files.includes(f));
const nodes=[...files,...extras].flatMap(f=>JSON.parse(fs.readFileSync(path.join(here,f),'utf8'))).map(n=>Object.fromEntries(Object.entries(n).map(([k,v])=>[k,Array.isArray(v)?v.join('\n'):v])));
const byId=new Map();
for(const n of nodes){if(byId.has(n.id))throw new Error('Duplicate ID '+n.id);byId.set(n.id,n);for(const key of ['id','title','notes','source','acceptance','owner'])if(typeof n[key]!=='string'||!n[key].trim())throw new Error('Missing '+key+' on '+n.id);if(!['confirmed','proposed','open','deferred'].includes(n.status))throw new Error('Invalid status '+n.id);if(!['P0','P1','P2'].includes(n.priority))throw new Error('Invalid priority '+n.id);}
if(nodes.filter(n=>n.parent==null).length!==1||!byId.has('root'))throw new Error('One root required');
for(const n of nodes){const seen=new Set();let p=n;while(p.parent!=null){if(seen.has(p.id))throw new Error('Cycle '+n.id);seen.add(p.id);p=byId.get(p.parent);if(!p)throw new Error('Orphan parent '+n.id);}}
const order=['product-planning','experience-planning','backend-planning','operations-planning','delivery-planning','planning-control','vision','scope','organization','access','onboarding','workflows','divisions','resources','changes','analytics','design','integrations','data','security','engineering','infrastructure','costs','environments','releases','reliability','quality','roadmap','launch','decisions','prd-management'];
const roots=nodes.filter(n=>n.parent==='root').sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
const groupOrder={
  'product-planning':['vision','scope','organization','access','divisions'],
  'experience-planning':['user-flows','onboarding','workflows','resources','analytics','design','integrations'],
  'backend-planning':['data','security','engineering','changes'],
  'operations-planning':['infrastructure','costs','environments','releases','reliability'],
  'delivery-planning':['quality','roadmap','launch'],
  'planning-control':['decisions','prd-management']
};
const children=id=>id==='root'?roots:nodes.filter(n=>n.parent===id).sort((a,b)=>groupOrder[id]?groupOrder[id].indexOf(a.id)-groupOrder[id].indexOf(b.id):0);
const dependencyIds=n=>(n.dependencies||'').split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
const depState=new Map();
function visitDependencies(id,trail=[]){if(depState.get(id)===2)return;if(depState.get(id)===1)throw new Error('Dependency cycle '+[...trail,id].join(' -> '));depState.set(id,1);for(const dep of dependencyIds(byId.get(id))){if(!byId.has(dep))throw new Error('Unknown dependency '+dep+' on '+id);if(dep===id)throw new Error('Self dependency '+id);visitDependencies(dep,[...trail,id]);}depState.set(id,2);}
for(const n of nodes)visitDependencies(n.id);
const ordered=[];function walk(n){ordered.push(n);children(n.id).forEach(walk);}walk(byId.get('root'));
const doc={kind:'dwdg-one-prd',schemaVersion:1,seedVersion:'2026-10-03-v02',title:'DWDG’ONE — Universitas Islam Indonesia',status:'working-draft',updatedAt:'2026-10-03',nodes:ordered,history:[]};
let md='# DWDG’ONE — Universitas Islam Indonesia\n\nPRD draft 0.2 · 3 October 2026 · process flows, measurable criteria and linked prerequisites. Decision states are separate from build/test/deployment evidence. Existing product and records remain preserved.\n\n';
function markdown(n,depth){md+='\n'+ '#'.repeat(Math.min(depth+1,6))+' '+n.title+'\n\nID: '+n.id+' · '+n.status+' · '+n.priority+'\n\n'+n.notes+'\n\n**Acceptance:** '+n.acceptance+'\n\n**Owner:** '+n.owner+'\n\n**Source / assumption:** '+n.source+'\n\n';if(n.dependencies)md+='**Dependencies:** '+n.dependencies+'\n\n';children(n.id).forEach(c=>markdown(c,depth+1));}markdown(byId.get('root'),1);
const shell=fs.readFileSync(path.join(here,'editor-shell.html'),'utf8');
if(!shell.includes('__PRD_SEED__'))throw new Error('Seed marker missing');
const fragment=shell.replace('__PRD_SEED__',JSON.stringify(doc).replaceAll('<','\\u003c'));
const destination='C:/Users/muhma/.codex/visualizations/2026/10/02/01a0fe65-f120-7a43-ae16-632738887f8c/dwdg-one-prd-v02.html';
if(Buffer.byteLength(fragment)>=1_000_000)throw new Error('Inline fragment exceeds 1 MB; keep the complete portable document and change the presentation strategy rather than silently dropping requirements.');
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(path.join(here,'DWDG_ONE_PRD.json'),JSON.stringify(doc,null,2));
fs.writeFileSync(path.join(here,'DWDG_ONE_PRD.md'),md);
fs.writeFileSync(destination,fragment);
fs.writeFileSync(path.join(here,'dwdg-one-prd.html'),fragment);
const stats={date:'2026-10-03',nodes:ordered.length,branches:roots.length,dependencyEdges:nodes.reduce((sum,n)=>sum+dependencyIds(n).length,0),nodesWithDependencies:nodes.filter(n=>dependencyIds(n).length).length,words:md.split(/\s+/).length,fragmentBytes:Buffer.byteLength(fragment),nodeStatus:Object.fromEntries(['confirmed','proposed','open','deferred'].map(s=>[s,nodes.filter(n=>n.status===s).length])),priority:Object.fromEntries(['P0','P1','P2'].map(s=>[s,nodes.filter(n=>n.priority===s).length])),sourceFiles:[...files,...extras],sha256:crypto.createHash('sha256').update(fragment).digest('hex'),destination};
fs.writeFileSync(path.join(here,'coverage.json'),JSON.stringify(stats,null,2));console.log(JSON.stringify(stats,null,2));
