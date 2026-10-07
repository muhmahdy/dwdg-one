import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {mountPreview} from './dwdg-one-preview.mjs';
import {createPreviewStore,PREVIEW_KEY} from './dwdg-one-preview-data.mjs';
import {createResourceStore,RESOURCE_KEY} from './dwdg-one-resources-data.mjs';
import {EXPERIENCE_KEYS} from './experience-data.mjs';

const workspaceId='consulting',projectId='demo-consulting-1',hiddenProjectId='demo-consulting-4',foreignProjectId='demo-hr-1';
const memberPolicy={project:{read:true},task:{read:true,update:{ownOnly:true,fields:['status','notes']},undo:{ownOnly:true,fields:['status','notes']}},blocker:{read:true},resource:{read:true}};
const cloned=value=>structuredClone(value);
async function environment(access={actorId:'co-nadia',role:'member',workspaceIds:[workspaceId],permissions:memberPolicy}){
 const window=new Window({url:'http://localhost/dwdg-one-preview.html',settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 const names=['window','document','location','history','localStorage','sessionStorage','requestAnimationFrame','cancelAnimationFrame','matchMedia','getComputedStyle','innerWidth','innerHeight','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Element','Node','CSS','MutationObserver','CustomEvent','FormData'];
 const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
 const html=await readFile(new URL('./dwdg-one-preview.html',import.meta.url),'utf8'),body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 document.write('<!doctype html><html data-motion="reduced"><head><meta name="theme-color"></head><body class="one-preview" data-nav-open="false" data-panel-open="false"><template id="role-shell"></template></body></html>');
 const template=document.getElementById('role-shell');template.innerHTML=body;document.body.append(template.content.cloneNode(true));
 const preserved=Object.fromEntries([...Object.values(EXPERIENCE_KEYS),'dwdg-one-prd-v02','saved-attachment-proof'].map(key=>[key,'preserved original '+key]));
 const data=new Map(Object.entries(preserved));let fails=false,app;
 const storage={getItem:key=>data.get(key)??null,setItem(key,value){if(fails&&[PREVIEW_KEY,RESOURCE_KEY].includes(key))throw new Error('Simulated storage failure');data.set(key,value);}};
 const raw=createPreviewStore(storage);
 const hiddenProject=raw.state.projects.find(row=>row.id===hiddenProjectId),foreign=raw.state.projects.find(row=>row.id===foreignProjectId);
 raw.saveProject(workspaceId,{...hiddenProject,title:'PRIVATE hidden Consulting initiative'},hiddenProject.id);
 raw.saveProject('hr',{...foreign,title:'PRIVATE HR initiative'},foreign.id);
 const own=raw.createTask(workspaceId,{title:'Assigned member proof',projectId,ownerId:'co-nadia',status:'todo',notes:'Saved member evidence',priority:'high'});
 const other=raw.createTask(workspaceId,{title:'Other member proof',projectId,ownerId:'co-arya',status:'todo',notes:'Readable context'});
 const rawResources=createResourceStore(storage,{getProjectState:()=>raw.state});
 const privateResource=rawResources.state.resources.find(row=>row.workspaceId==='hr'&&row.kind!=='folder');rawResources.saveResource('hr',privateResource.projectId,{...privateResource,title:'PRIVATE HR resource'},privateResource.id);
 const errors=[];window.addEventListener('error',event=>errors.push(event.error?.message||event.message));window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
 const settle=()=>window.happyDOM.waitUntilComplete();
 const query=selector=>{const el=document.querySelector(selector);assert.ok(el,'Missing '+selector);return el;};
 const click=async selector=>{query(selector).click();await settle();};
 const set=async(selector,value)=>{const el=query(selector);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
 const route=async value=>click(`[data-action="navigate"][data-route="${value}"]`);
 app=mountPreview({storage,access});await settle();
 return {window,data,storage,raw,rawResources,own,other,privateResource,errors,query,click,set,route,settle,get app(){return app;},failSaving(value){fails=value;},
  async reload(){app.destroy();for(const child of [...document.body.children])if(child!==template)child.remove();document.body.append(template.content.cloneNode(true));app=mountPreview({storage,access});await settle();},
  async close(){fails=false;app.destroy();await window.happyDOM.close();for(const [key,value]of Object.entries(preserved))assert.equal(data.get(key),value,'Modified preserved data '+key);for(const [name,descriptor]of originals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
 };
}
async function withShell(run,access){const env=await environment(access);try{await run(env);assert.deepEqual(env.errors,[]);}finally{await env.close();}}

test('real member facade keeps project list, summary and workspace choices within current scope and omits project edits',()=>withShell(async env=>{
 const allowed=env.app.store.state.projects.filter(project=>project.workspaceId===workspaceId).map(project=>project.id).sort();
 assert.deepEqual([...document.querySelectorAll('[data-project-id]')].map(row=>row.dataset.projectId).sort(),allowed);
 assert.equal(Number(env.query('[data-count-projects]').textContent),allowed.length);
 assert.equal(document.querySelector('[data-action="new-project"]'),null);assert.equal(document.querySelector('[data-action="edit-project"]'),null);
 assert.doesNotMatch(document.body.textContent,/PRIVATE HR initiative|PRIVATE HR resource/);
 await env.click('[data-action="workspace"]');assert.deepEqual([...document.querySelectorAll('.ux-layer:not(.ux-leaving) [data-workspace]')].map(row=>row.dataset.workspace),[workspaceId]);
 await env.click(`.ux-layer:not(.ux-leaving) [data-workspace="${workspaceId}"]`);
 await env.click(`[data-action="open-project"][data-id="${projectId}"]`);assert.equal(document.querySelector('#one-inspector [data-action="edit-project"]'),null);
 await env.click('[data-action="project-page"]');assert.equal(document.querySelector('[data-action="edit-project"]'),null);assert.equal(document.querySelectorAll('[role="tab"]').length,3);
}));

test('copied inaccessible project, task, resource and nonexistent IDs all produce the same neutral return state',()=>withShell(async env=>{
 const hiddenTask=env.raw.state.tasks.find(task=>task.projectId==='demo-hr-1');
 for(const [family,id]of [['project',foreignProjectId],['task',hiddenTask.id],['resource',env.privateResource.id],['project','does-not-exist']]){
  await env.app.openRecord({family,id});await env.settle();
  assert.equal(env.query('#one-content h1').textContent,'Record unavailable');assert.equal(env.query('#one-inspector').hidden,true);
  assert.doesNotMatch(document.body.textContent,/PRIVATE HR initiative|PRIVATE HR resource/);
  await env.click('#one-content [data-action="navigate"][data-route="projects"]');assert.equal(env.query('#one-content h1').textContent,'Projects');
 }
}));

test('same real member facade opens own restricted fields, saves attributed changes and keeps other task readable',()=>withShell(async env=>{
 await env.app.openRecord({family:'task',id:env.own.id});await env.settle();
 assert.equal(env.query('#work-title').disabled,true);assert.equal(env.query('#work-notes').disabled,false);
 await env.set('#work-notes','Saved through the member facade.');await env.click('[data-action="work-save"]');
 const saved=env.app.store.state.tasks.find(task=>task.id===env.own.id);assert.equal(saved.notes,'Saved through the member facade.');assert.equal(saved.updatedBy,'co-nadia');assert.equal(saved.ownerId,'co-nadia');assert.equal(saved.title,env.own.title);
 assert.equal(env.app.store.state.events.at(-1).actorId,'co-nadia');assert.equal(env.query('[data-action="work-undo"]').disabled,false);
 await env.click('[data-action="work-undo"]');assert.deepEqual(env.app.store.state.tasks.find(task=>task.id===env.own.id),env.own);
 await env.app.openRecord({family:'task',id:env.other.id});await env.settle();assert.equal(document.querySelector('#one-work-form'),null);assert.match(env.query('#one-inspector').textContent,/Task details.*Other member proof.*Read only/s);
 await env.route('changes');assert.match(env.query('.one-local-changes').textContent,/Nadia Putri/);
}));

test('scope revocation closes active task text and preserves the private unfinished draft through regrant and reload',()=>withShell(async env=>{
 await env.app.openRecord({family:'task',id:env.own.id});await env.settle();await env.set('#work-notes','Private unfinished member evidence.');
 await env.app.updateScope({workspaceIds:[]});await env.settle();
 assert.equal(env.query('#one-content h1').textContent,'No workspace available');assert.equal(env.query('#one-inspector').hidden,true);assert.equal(env.app.work.hasInspector,false);
 assert.doesNotMatch(document.body.innerHTML,/Private unfinished member evidence|Assigned member proof|PRIVATE HR initiative/);assert.deepEqual(env.app.work.uiState.drafts,{});
 await env.app.updateScope({workspaceIds:[workspaceId]});await env.route('work');await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Private unfinished member evidence.');
 await env.reload();await env.route('work');await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Private unfinished member evidence.');
 assert.equal(env.app.store.state.tasks.find(task=>task.id===env.own.id).notes,env.own.notes);
}));

test('zero-workspace role is neutral in both languages and display preferences survive reload without save errors',()=>withShell(async env=>{
 assert.equal(env.query('#one-content h1').textContent,'No workspace available');assert.equal(env.query('#one-workspace-control').disabled,true);
 assert.deepEqual(env.app.store.state.projects,[]);assert.deepEqual(env.app.store.state.tasks,[]);assert.deepEqual(env.app.resources.store.state.resources,[]);
 assert.doesNotMatch(document.body.textContent,/PRIVATE HR|Assigned member proof|Consulting bootcamp/);
 await env.click('[data-action="language"]');assert.equal(env.query('#one-content h1').textContent,'Tidak ada ruang kerja tersedia');assert.equal(document.querySelector('#one-notices [role="alert"]'),null);
 await env.click('[data-action="theme"]');assert.equal(document.documentElement.dataset.theme,'dark');assert.equal(document.querySelector('#one-notices [role="alert"]'),null);
 await env.reload();assert.equal(document.documentElement.lang,'id');assert.equal(document.documentElement.dataset.theme,'dark');assert.equal(env.query('#one-content h1').textContent,'Tidak ada ruang kerja tersedia');
},{actorId:'demo-reviewer',role:'reviewer',workspaceIds:[],permissions:{}}));

test('failed-storage unfinished text is kept privately across scope revocation and recovered after writes resume',()=>withShell(async env=>{
 await env.app.openRecord({family:'task',id:env.own.id});await env.settle();await env.set('#work-notes','First durable private draft.');
 env.failSaving(true);await env.set('#work-notes','Unstored private draft must survive.');
 assert.match(env.query('#one-work-draft-status').textContent,/Draft could not be stored/);
 await env.app.updateScope({workspaceIds:[]});await env.settle();assert.doesNotMatch(document.body.innerHTML,/Unstored private draft must survive|First durable private draft/);
 env.failSaving(false);await env.app.updateScope({workspaceIds:[workspaceId]});await env.route('work');await env.click('[data-action="work-resume"]');
 assert.equal(env.query('#work-notes').value,'Unstored private draft must survive.');assert.equal(env.app.store.state.tasks.find(task=>task.id===env.own.id).notes,env.own.notes);
}));

test('newly hidden project records disappear from list, counts, Resources and copied-link access',()=>withShell(async env=>{
 const before=env.app.store.state.projects.length;await env.app.updateScope({hiddenIds:{project:[hiddenProjectId]}});await env.route('projects');
 assert.equal(env.app.store.state.projects.length,before-1);assert.equal(Number(env.query('[data-count-projects]').textContent),before-1);assert.doesNotMatch(document.body.textContent,/PRIVATE hidden Consulting initiative/);
 await env.route('resources');assert.ok(env.app.resources.store.state.resources.every(resource=>resource.projectId!==hiddenProjectId));assert.doesNotMatch(document.body.innerHTML,/PRIVATE hidden Consulting initiative/);
 await env.app.openRecord({family:'project',id:hiddenProjectId});await env.settle();assert.equal(env.query('#one-content h1').textContent,'Record unavailable');assert.doesNotMatch(document.body.textContent,/PRIVATE hidden Consulting initiative/);
}));
