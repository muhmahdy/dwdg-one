import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createPreviewStore} from './dwdg-one-preview-data.mjs';
import {mountWork} from './dwdg-one-work.mjs';
import {renderProjectPage,renderLocalChanges} from './dwdg-one-project-page.mjs';
import {createOverlays} from './experience-ui.mjs';

const workspaceId='consulting',projectId='demo-consulting-1';
async function environment(){
 const window=new Window({url:'http://localhost/dwdg-one-preview.html'});
 const names=['window','document','requestAnimationFrame','cancelAnimationFrame','matchMedia','getComputedStyle','innerWidth','innerHeight','HTMLElement','Element','Node','CSS','MutationObserver'];
 const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
 document.write('<!doctype html><html data-motion="reduced"><body class="one-preview"><main id="one-content" tabindex="-1"></main><aside id="one-inspector"></aside></body></html>');
 const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)},base=createPreviewStore(storage);
 const own=base.createTask(workspaceId,{title:'Assigned task',projectId,ownerId:'co-nadia',status:'todo',notes:'Saved notes',priority:'high',startDate:'2026-10-05',targetDate:'2026-10-07'});
 const other=base.createTask(workspaceId,{title:'Another member task',projectId,ownerId:'co-arya',status:'progress',notes:'Readable task context',priority:'normal'});
 let role='member',language='en',project='',workspace=workspaceId,app,scopedState=null;
 const notices=[],feedback=[],calls=[];
 const access={can(type,action,record){if(record.workspaceId!==workspaceId)return false;if(role==='admin')return true;if(action==='update'||action==='undo')return role==='member'&&record.ownerId==='co-nadia';return action==='read';},allowedFields(type,record){return role==='admin'?null:access.can(type,'update',record)?['status','notes']:[];}};
 const canUndo=workspaceId=>{const entry=base.state.taskUndo?.[workspaceId]?.entries?.at(-1);if(!entry)return false;if(role==='admin')return true;return (entry.kind==='batch'?entry.changes:[entry]).every(change=>change.before&&access.can('task','undo',change.after)&&['title','ownerId','projectId','priority','startDate','targetDate','resourceId'].every(key=>change.before[key]===change.after[key]));};
 const store=new Proxy(base,{get(target,key){if(key==='state')return scopedState||target.state;if(key==='canUndoTask')return canUndo;if(['saveTask','saveTasks','undoTask'].includes(key))return (...args)=>{if(key==='undoTask'&&!canUndo(args[0]))throw Object.assign(new Error('permission'),{code:'permission'});calls.push([key,...structuredClone(args)]);return target[key](...args);};return Reflect.get(target,key);}});
 const t=(en,id)=>language==='id'?id:en,ui=createOverlays({t});
 const render=()=>{document.getElementById('one-content').innerHTML=app.render({projectId:project});document.getElementById('one-inspector').innerHTML=app.inspector();};
 app=mountWork({store,access,getWorkspaceId:()=>workspace,getLanguage:()=>language,getActorId:()=>role==='admin'?'demo-admin':'co-nadia',t,ui,onRender:render,onFeedback:(...args)=>feedback.push(args),onNotice:text=>notices.push(text)});
 document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)app.handleAction(target.dataset.action,target);});
 document.addEventListener('input',event=>app.handleInput(event));
 const settle=()=>window.happyDOM.waitUntilComplete();
 const query=selector=>{const el=document.querySelector(selector);assert.ok(el,'Missing '+selector);return el;};
 const click=async selector=>{query(selector).click();await settle();};
 const direct=async(action,id='',key='')=>{const target=document.createElement('button');Object.assign(target.dataset,{id,key});await app.handleAction('work-'+action,target);await settle();};
 const set=async(selector,value)=>{const control=query(selector);control.value=value;control.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
 render();await settle();
 return {window,app,store,base,data,access,t,ui,own,other,calls,notices,feedback,query,click,direct,set,settle,render,
  role(value){role=value;render();},language(value){language=value;render();},project(value){project=value;render();},workspace(value){workspace=value;render();},scope(value){scopedState=value;app.refreshScope();render();},
  async close(){app.destroy();ui.destroy();await window.happyDOM.close();for(const [name,descriptor]of originals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
 };
}
async function withWork(run){const env=await environment();try{await run(env);}finally{await env.close();}}

test('member sees editable status and notes only and saves them on the canonical assigned task',()=>withWork(async env=>{
 assert.equal(document.querySelector('[data-action="work-new"]'),null);
 assert.equal(env.query('[data-action="work-undo"]').disabled,true);
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);
 assert.equal(document.activeElement.id,'work-notes');
 for(const selector of ['#work-title','#work-start','#work-target','#work-field-projectId','#work-field-ownerId','#work-field-priority'])assert.equal(env.query(selector).disabled,true,selector);
 assert.equal(env.query('#work-notes').disabled,false);assert.equal(env.query('#work-field-status').disabled,false);
 await env.set('#work-notes','Member evidence recorded.');
 await env.click('#work-field-status');await env.click('.ux-layer:not(.ux-leaving) [data-value="done"]');
 await env.click('[data-action="work-save"]');
 const saved=env.base.state.tasks.find(task=>task.id===env.own.id);
 assert.equal(saved.notes,'Member evidence recorded.');assert.equal(saved.status,'done');assert.ok(saved.completedAt);
 for(const key of ['title','ownerId','projectId','priority','startDate','targetDate'])assert.equal(saved[key],env.own[key],key);
 assert.equal(env.base.state.tasks.filter(task=>task.id===env.own.id).length,1);
 await env.direct('complete',env.own.id);assert.equal(env.base.state.tasks.find(task=>task.id===env.own.id).status,'todo');
}));

test('other task opens readable details without replacing an unfinished assigned-task draft',()=>withWork(async env=>{
 env.app.setContext({filters:{owner:'all'}});env.render();
 const check=env.query(`[data-action="work-complete"][data-id="${env.other.id}"]`);assert.equal(check.disabled,true);assert.doesNotMatch(check.getAttribute('aria-label'),/Complete task|Reopen task/);
 assert.match(env.query(`.one-work-actions [data-action="work-open"][data-id="${env.other.id}"]`).getAttribute('aria-label'),/^Open task:/);
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.set('#work-notes','Unfinished own evidence.');
 const before=structuredClone(env.app.uiState.drafts['consulting:all']);
 await env.click(`[data-action="work-open"][data-id="${env.other.id}"]`);
 assert.equal(env.app.hasInspector,true);assert.equal(document.querySelector('#one-work-form'),null);
 assert.match(env.query('#one-inspector').textContent,/Task details.*Another member task.*Read only.*Readable task context/s);
 assert.equal(document.activeElement.id,'work-panel-close');assert.equal(document.querySelector('.ux-layer--confirm'),null);
 assert.deepEqual(env.app.uiState.drafts['consulting:all'],before);
 await env.click('[data-action="work-close"]');assert.equal(document.activeElement.id,`work-task-${env.other.id}`);
 await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Unfinished own evidence.');
 env.language('id');assert.match(env.query('#one-work-form').textContent,/Anda dapat memperbarui status dan catatan/);
 assert.equal(env.query('#work-field-ownerId').disabled,true);
}));

test('direct denied create, completion, assignment choice and Undo never mutate saved task records',()=>withWork(async env=>{
 const before=structuredClone(env.base.state.tasks);
 await env.direct('new');assert.equal(env.app.hasInspector,false);
 await env.direct('complete',env.other.id);await env.direct('select',env.other.id);await env.direct('undo');
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.direct('choice','','ownerId');
 assert.equal(document.querySelector('.ux-layer:not(.ux-leaving) [role="listbox"]'),null);
 assert.equal(env.app.uiState.drafts['consulting:all'].fields.ownerId,'co-nadia');assert.deepEqual(env.base.state.tasks,before);
 assert.deepEqual(env.calls,[]);assert.ok(env.notices.length>=4);
}));

test('forbidden metadata in a stale or forged assigned-task form rejects Save and retains the draft',()=>withWork(async env=>{
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);
 await env.set('#work-title','Unapproved reassignment metadata');await env.set('#work-notes','Permitted evidence is still a draft.');
 await env.direct('save');assert.equal(env.base.state.tasks.find(task=>task.id===env.own.id).title,env.own.title);
 assert.equal(env.base.state.tasks.find(task=>task.id===env.own.id).notes,env.own.notes);
 assert.equal(env.app.uiState.drafts['consulting:all'].fields.title,'Unapproved reassignment metadata');
 assert.equal(env.query('#work-notes').value,'Permitted evidence is still a draft.');assert.equal(env.calls.length,0);
 assert.match(env.query('#one-work-form [role="alert"]').textContent,/cannot save this change.*draft is kept/i);
 assert.equal(document.activeElement.id,'work-notes');
}));

test('rights changing while the task menu is open prevent the pending choice and a stale Save',()=>withWork(async env=>{
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.set('#work-notes','Keep privately while read only.');
 await env.click('#work-field-status');env.role('reviewer');
 await env.click('.ux-layer:not(.ux-leaving) [data-value="done"]');
 assert.equal(env.app.uiState.drafts['consulting:all'].fields.status,'todo');
 assert.equal(document.querySelector('[data-action="work-save"]'),null);await env.direct('save');
 assert.equal(env.base.state.tasks.find(task=>task.id===env.own.id).notes,env.own.notes);assert.equal(env.calls.length,0);
 assert.equal(env.app.uiState.drafts['consulting:all'].fields.notes,'Keep privately while read only.');
 env.role('member');assert.equal(env.query('#work-notes').value,'Keep privately while read only.');assert.equal(env.query('#work-notes').disabled,false);
}));

test('mixed or missing selected records disable bulk status and direct bulk commits no permitted subset',()=>withWork(async env=>{
 const context=()=>env.app.uiState.contexts['consulting:all'];context().selectedIds=[env.own.id,env.other.id];env.render();
 assert.equal(env.query('[data-action="work-bulk"]').disabled,true);
 const before=structuredClone(env.base.state.tasks);await env.direct('bulk');assert.deepEqual(env.base.state.tasks,before);assert.equal(env.calls.length,0);
 context().selectedIds=[env.own.id,'missing-task'];env.render();assert.equal(env.query('[data-action="work-bulk"]').disabled,true);
 await env.direct('bulk');assert.deepEqual(env.base.state.tasks,before);assert.equal(env.calls.length,0);
 context().selectedIds=[env.own.id];env.render();assert.equal(env.query('[data-action="work-bulk"]').disabled,false);await env.direct('bulk');
 assert.equal(env.base.state.tasks.find(task=>task.id===env.own.id).status,'done');assert.equal(env.base.state.tasks.find(task=>task.id===env.other.id).status,'progress');
}));

test('revocation during draft replacement confirmation opens read-only details and preserves previous text',()=>withWork(async env=>{
 env.role('admin');env.app.setContext({filters:{owner:'all'}});env.render();
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.set('#work-notes','Previous unfinished draft.');
 const pending=env.app.handleAction('work-open',env.query(`[data-action="work-open"][data-id="${env.other.id}"]`));await env.settle();
 env.role('member');await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');await pending;await env.settle();
 assert.equal(document.querySelector('#one-work-form'),null);assert.match(env.query('#one-inspector').textContent,/Task details.*Another member task/s);
 assert.equal(env.app.uiState.drafts['consulting:all'].taskId,env.own.id);assert.equal(env.app.uiState.drafts['consulting:all'].fields.notes,'Previous unfinished draft.');
 assert.equal(env.calls.length,0);
}));

test('scope refresh drops inaccessible in-memory drafts and panels while preserving private stored text for a later grant',()=>withWork(async env=>{
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.set('#work-notes','Private draft retained after revocation.');
 const privateUI=structuredClone(env.base.state.workUI);
 env.scope({...env.base.state,projects:[],tasks:[],blockers:[],workUI:{contexts:{},drafts:{}}});
 assert.equal(env.app.hasInspector,false);assert.equal(document.querySelector('#one-work-form'),null);
 assert.deepEqual(env.app.uiState.drafts,{});assert.doesNotMatch(document.body.textContent,/Private draft retained after revocation|Assigned task|Another member task/);
 assert.deepEqual(env.base.state.workUI,privateUI,'Filtering in-memory scope must not discard the persisted private draft');
 await env.direct('save');assert.equal(env.calls.length,0);
 env.scope(null);await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Private draft retained after revocation.');
 assert.equal(document.querySelector('#one-work-form [role="alert"]'),null);
}));

test('scope refresh cancels completion focus callbacks from the prior context',()=>withWork(async env=>{
 document.documentElement.dataset.motion='full';
 const trigger=env.query(`[data-action="work-complete"][data-id="${env.own.id}"]`);
 await env.app.handleAction('work-complete',trigger);
 env.scope({...env.base.state,projects:[],tasks:[],blockers:[],workUI:{contexts:{},drafts:{}}});
 const heading=env.query('#one-content h1');heading.tabIndex=-1;heading.focus();
 await new Promise(resolve=>setTimeout(resolve,250));await env.settle();
 assert.equal(document.activeElement,heading);assert.equal(env.app.hasInspector,false);
}));

test('global own-task Undo follows the concrete guarded entry instead of a context-only action check',()=>withWork(async env=>{
 assert.equal(env.access.can('task','undo',{workspaceId,projectId:''}),false);
 await env.click(`[data-action="work-open"][data-id="${env.own.id}"]`);await env.set('#work-notes','Saved eligible own evidence.');await env.click('[data-action="work-save"]');
 assert.equal(env.store.canUndoTask(workspaceId),true);assert.equal(env.query('[data-action="work-undo"]').disabled,false);
 await env.click('[data-action="work-undo"]');assert.deepEqual(env.base.state.tasks.find(task=>task.id===env.own.id),env.own);
 assert.equal(env.store.canUndoTask(workspaceId),false);assert.equal(env.query('[data-action="work-undo"]').disabled,true);
}));

test('project Overview uses supplied scoped records and omits metadata editing for a denied role',()=>withWork(async env=>{
 const project=env.base.state.projects.find(row=>row.id===projectId);
 const state={tasks:[env.own],blockers:[]},resources={store:{state:{resources:[{id:'allowed-resource',workspaceId,projectId,archived:false},{id:'wrong-workspace',workspaceId:'hr',projectId,archived:false},{id:'archived',workspaceId,projectId,archived:true}]}}};
 const options={t:env.t,language:'en',state,resources,work:env.app,access:{can:()=>false}};
 document.getElementById('one-content').innerHTML=renderProjectPage(project,options);
 assert.equal(document.querySelector('[data-action="edit-project"]'),null);
 assert.match(env.query('.one-project-overview').textContent,/0 \/ 1 tasks completed/);assert.match(env.query('.one-project-overview').textContent,/Resources1 resource/);
 assert.equal(document.querySelectorAll('[role="tab"]').length,3);
 document.getElementById('one-content').innerHTML=renderProjectPage(project,{...options,access:{can:()=>true}});assert.ok(env.query('[data-action="edit-project"]'));
}));

test('Changes attributes every event to its recorded actor, with honest missing and unknown fallbacks in both languages',()=>withWork(async env=>{
 const actors=['demo-admin','co-nadia','demo-president','demo-vp','demo-reviewer',null,'unrecognized-account'];
 const events=actors.map((actorId,index)=>({id:'actor-'+index,workspaceId,kind:'task.updated',title:'Event '+index,actorId,at:`2026-10-04T02:00:0${index}Z`}));
 for(const [language,labels]of [['en',['Demo administrator','Nadia Putri','Demo President','Demo VP','Demo reviewer','Actor not recorded','Unknown actor']],['id',['Administrator contoh','Nadia Putri','Presiden contoh','VP contoh','Peninjau contoh','Pelaku belum tercatat','Pelaku tidak dikenal']]]){
  const t=(en,id)=>language==='id'?id:en;
  const resourceEvents=[{id:'resource-actor',workspaceId,type:'updated',title:'Resource schema actor',createdBy:'co-arya',createdAt:'2026-10-04T03:00:00Z'},{id:'actor-precedence',workspaceId,type:'updated',title:'Explicit actor takes precedence',actorId:'co-nadia',createdBy:'co-arya',createdAt:'2026-10-04T04:00:00Z'}];
  document.getElementById('one-content').innerHTML=renderLocalChanges({state:{events:[...events,{id:'foreign',workspaceId:'hr',title:'PRIVATE HR CHANGE',actorId:'demo-admin'}]},resourceState:{events:resourceEvents},workspaceId,t,language});
  const rows=[...document.querySelectorAll('.one-local-changes .one-work-row')];assert.equal(rows.length,actors.length+resourceEvents.length);
  for(const [index,label]of labels.entries()){const row=rows.find(row=>row.querySelector('strong').textContent==='Event '+index);assert.equal(row.querySelector('.one-work-meta').textContent,(language==='en'?'Updated':'Diperbarui')+' · '+label);}
  assert.match(rows.find(row=>row.querySelector('strong').textContent==='Resource schema actor').querySelector('.one-work-meta').textContent,/ · Arya Pratama$/);
  assert.match(rows.find(row=>row.querySelector('strong').textContent==='Explicit actor takes precedence').querySelector('.one-work-meta').textContent,/ · Nadia Putri$/);
  assert.doesNotMatch(document.getElementById('one-content').textContent,/PRIVATE HR CHANGE|unrecognized-account/);
 }
}));
