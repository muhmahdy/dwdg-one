import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {mountPreview} from './dwdg-one-preview.mjs';
import {EXPERIENCE_KEYS} from './experience-data.mjs';
import {PREVIEW_KEY} from './dwdg-one-preview-data.mjs';
import {RESOURCE_KEY} from './dwdg-one-resources-data.mjs';
import {todayISO} from './dwdg-one-daily.mjs';

const preservedStorage={
  [EXPERIENCE_KEYS.core]:'{"projects":[{"id":"real","title":"Preserved project"}],"bytes":"unchanged"}',
  [EXPERIENCE_KEYS.divisions]:'{"privateDivisionState":"keep"}',
  [EXPERIENCE_KEYS.extras]:'{"byProject":{"real":{"documents":[{"id":"original-upload"}]}}}',
  [EXPERIENCE_KEYS.extension]:'{"preferences":{"theme":"dark","language":"id"}}',
  'dwdg-one-prd-v02':'{"document":"user planning edits","revision":19}',
  'unrelated-attachment-metadata':'{"blobId":"existing-attachment"}'
};
const projectId='demo-consulting-1',otherProjectId='demo-consulting-2',workspaceId='consulting';
const filterSelector=key=>`[data-action="work-filter"][data-key="${key}"]`;
const daysFromToday=offset=>{const date=new Date(`${todayISO()}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);};

async function environment() {
  const window=new Window({url:'http://localhost/dwdg-one-preview.html',settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
  const html=await readFile(new URL('./dwdg-one-preview.html',import.meta.url),'utf8');window.document.write(html);
  for(const [key,value] of Object.entries(preservedStorage))window.localStorage.setItem(key,value);
  const names=['window','document','location','history','localStorage','sessionStorage','matchMedia','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','Element','Node','CSS','CustomEvent','FormData','innerWidth','innerHeight'];
  const globals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
  const errors=[];window.addEventListener('error',event=>errors.push(event.error?.message||event.message));window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
  let writesFail=false;
  const storage={getItem:key=>window.localStorage.getItem(key),setItem(key,value){if(writesFail&&key===PREVIEW_KEY)throw new Error('Simulated preview storage failure');window.localStorage.setItem(key,value);}};
  let app=mountPreview({storage});
  const settle=async()=>{await window.happyDOM.waitUntilComplete();};
  const query=selector=>{const element=document.querySelector(selector);assert.ok(element,'Missing control: '+selector);return element;};
  const click=async selector=>{query(selector).click();await settle();};
  const set=async(selector,value)=>{const element=query(selector);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
  const key=async(value,target=document.activeElement)=>{target.dispatchEvent(new window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true}));await settle();};
  const choose=async(selector,value)=>{
    const trigger=query(selector);assert.equal(trigger.getAttribute('role'),'combobox');trigger.click();await settle();
    assert.equal(trigger.getAttribute('aria-expanded'),'true');const listbox=query('.ux-layer:not(.ux-leaving) [role="listbox"]');assert.equal(listbox.id,trigger.getAttribute('aria-controls'));
    const option=listbox.querySelector(`[role="option"][data-value="${value}"]`);assert.ok(option,'Missing option '+value);option.click();await settle();
    assert.equal(query(selector).getAttribute('aria-expanded'),'false');assert.equal(document.activeElement.id,query(selector).id,'Dropdown should restore its trigger focus');
  };
  const route=async name=>click(`[data-action="navigate"][data-route="${name}"]`);
  const ids=()=>[...document.querySelectorAll('.one-work-row[data-task-id]')].map(row=>row.dataset.taskId).sort();
  const unchanged=()=>{for(const [key,value] of Object.entries(preservedStorage))assert.equal(window.localStorage.getItem(key),value,'Daily UI changed preserved storage '+key);};
  await settle();
  return {window,query,click,set,key,choose,route,ids,settle,errors,unchanged,get app(){return app;},setWritesFail(value){writesFail=value;},
    async workspace(id){await click('[data-action="workspace"]');await click(`.ux-layer:not(.ux-leaving) [data-workspace="${id}"]`);},
    async reload(){app.destroy();document.open();document.write(html);document.close();app=mountPreview({storage});await settle();},
    async close(){writesFail=false;app.destroy();await new Promise(resolve=>setTimeout(resolve,350));await window.happyDOM.close();for(const [name,descriptor] of globals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
  };
}
async function withPreview(run){const env=await environment();try{await run(env);env.unchanged();assert.deepEqual(env.errors,[]);}finally{await env.close();}}
function createTask(env,title,fields={}){return env.app.store.createTask(workspaceId,{projectId,title,ownerId:'demo-admin',status:'todo',priority:'normal',targetDate:'',...fields});}
const workContext=env=>env.app.work.uiState.contexts[`${workspaceId}:all`];

test('fresh My Work defaults to the real assigned actor and keeps undated work visible',()=>withPreview(async env=>{
  await env.route('work');
  assert.equal(workContext(env).owner,'me');assert.equal(env.query(filterSelector('owner')).textContent.trim(),'Mine');assert.equal(env.query(filterSelector('owner')).getAttribute('aria-label'),'Assigned to me');
  const assigned=env.app.store.state.tasks.filter(task=>task.workspaceId===workspaceId&&task.ownerId==='demo-admin').map(task=>task.id).sort();
  assert.deepEqual(env.ids(),assigned);assert.ok(assigned.length>0);
  assert.equal(document.querySelectorAll('.one-work-list [data-date-group="undated"] [data-task-id]').length,1);
  assert.equal(document.querySelectorAll('.one-work-list [data-date-group="overdue"] [data-task-id]').length,1);
  assert.equal(document.querySelectorAll('.one-work-list [data-date-group="today"] [data-task-id]').length,1);
  assert.ok(!env.ids().some(id=>env.app.store.state.tasks.find(task=>task.id===id).workspaceId!=='consulting'));
  assert.equal(document.querySelectorAll('select').length,0);
  await env.reload();assert.equal(workContext(env).owner,'me');assert.deepEqual(env.ids(),assigned);
}));

test('text and the four dropdown filters intersect; counts and canonical IDs agree in list, board and timeline',()=>withPreview(async env=>{
  const match=createTask(env,'Filter sample match',{targetDate:daysFromToday(-1)}),second=createTask(env,'Filter sample second',{targetDate:daysFromToday(-1)});
  createTask(env,'Filter sample wrong owner',{ownerId:'co-nadia',targetDate:daysFromToday(-1)});
  createTask(env,'Filter sample wrong project',{projectId:otherProjectId,targetDate:daysFromToday(-1)});
  createTask(env,'Filter sample wrong status',{status:'progress',targetDate:daysFromToday(-1)});
  createTask(env,'Filter sample wrong date',{targetDate:todayISO()});
  createTask(env,'Other task text',{targetDate:daysFromToday(-1)});
  await env.route('work');await env.set('#one-work-search','Filter sample');
  await env.choose(filterSelector('projectFilter'),projectId);await env.choose(filterSelector('dateGroup'),'overdue');await env.choose(filterSelector('status'),'todo');await env.choose(filterSelector('owner'),'me');
  const expected=[match.id,second.id].sort();
  for(const mode of ['list','board','timeline']){
    await env.click(`[data-action="work-view"][data-mode="${mode}"]`);assert.deepEqual(env.ids(),expected,mode);
    assert.equal(env.query('.one-work-viewbar > span').textContent,'2 tasks · 0 completed');assert.equal(new Set(env.ids()).size,env.ids().length);
    assert.deepEqual({...workContext(env),selectedIds:[],bulkStatus:'done'},{query:'Filter sample',status:'todo',owner:'me',projectFilter:projectId,dateGroup:'overdue',mode,selectedIds:[],bulkStatus:'done'});
  }
  await env.choose(filterSelector('owner'),'co-arya');assert.deepEqual(env.ids(),[]);assert.equal(env.query('.one-work-viewbar > span').textContent,'0 tasks · 0 completed');
  await env.choose(filterSelector('owner'),'me');await env.reload();assert.deepEqual(env.ids(),expected);assert.equal(workContext(env).mode,'timeline');
}));

test('bulk completion commits both selected canonical records, reloads, and Undo restores exact prior fields',()=>withPreview(async env=>{
  const first=createTask(env,'Batch check first',{targetDate:todayISO()}),second=createTask(env,'Batch check second',{status:'progress',targetDate:daysFromToday(-1)}),unselected=createTask(env,'Unselected work remains open');
  const prior=[first,second].map(task=>structuredClone(task));
  await env.route('work');await env.set('#one-work-search','Batch check');
  for(const task of prior)await env.click(`[data-action="work-select"][data-id="${task.id}"]`);
  assert.match(env.query('.one-work-bulkbar').textContent,/2 selected/);assert.deepEqual(workContext(env).selectedIds.sort(),prior.map(task=>task.id).sort());
  await env.choose(filterSelector('bulkStatus'),'done');await env.click('[data-action="work-bulk"]');
  for(const task of prior){const saved=env.app.store.state.tasks.find(row=>row.id===task.id);assert.equal(saved.status,'done');assert.ok(Number.isFinite(Date.parse(saved.completedAt)));}
  assert.equal(env.app.store.state.tasks.find(row=>row.id===unselected.id).status,'todo');assert.deepEqual(workContext(env).selectedIds,[]);
  assert.equal(env.app.store.state.taskUndo.consulting.entries.at(-1).kind,'batch');assert.equal(env.app.store.state.taskUndo.consulting.entries.at(-1).changes.length,2);
  await env.reload();assert.equal(env.query('.one-work-viewbar > span').textContent,'2 tasks · 2 completed');
  assert.deepEqual(env.ids(),prior.map(task=>task.id).sort());await env.click('.one-work-toolbar [data-action="work-undo"]');
  for(const task of prior)assert.deepEqual(env.app.store.state.tasks.find(row=>row.id===task.id),task);
  assert.equal(env.query('.one-work-viewbar > span').textContent,'2 tasks · 0 completed');
  const stored=JSON.parse(localStorage.getItem(PREVIEW_KEY));for(const task of prior)assert.deepEqual(stored.tasks.find(row=>row.id===task.id),task);
}));

test('Home opens a task for direct editing and every linked view retains the same saved task ID',()=>withPreview(async env=>{
  const task=createTask(env,'Home connected task',{targetDate:todayISO(),resourceId:'demo-resource-consulting-2'}),beforeCount=env.app.store.state.tasks.length;
  await env.route('home');await env.click(`.one-home-assigned [data-action="home-open-task"][data-id="${task.id}"]`);
  assert.equal(env.query('#work-title').value,task.title);assert.equal(document.querySelector('#one-content h1').textContent,'My Work');
  await env.set('#work-title','Home connected task revised');await env.set('#work-notes','Saved through the canonical Work form.');
  env.query('#one-work-form').dispatchEvent(new env.window.Event('submit',{bubbles:true,cancelable:true}));await env.settle();
  assert.equal(env.app.store.state.tasks.length,beforeCount);assert.equal(env.app.store.state.tasks.filter(row=>row.id===task.id).length,1);
  assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).title,'Home connected task revised');assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'Saved through the canonical Work form.');
  assert.ok(env.query(`[data-task-id="${task.id}"]`).textContent.includes('Home connected task revised'));
  await env.route('home');assert.equal(env.query(`.one-home-assigned [data-action="home-open-task"][data-id="${task.id}"]`).textContent,'Home connected task revised');
  await env.click(`.one-home-related [data-action="home-open-project"][data-id="${projectId}"]`);await env.click('#one-project-tab-work');
  assert.equal(env.query(`[data-task-id="${task.id}"] .one-work-title`).textContent,'Home connected task revised');
  await env.reload();assert.equal(env.app.store.state.tasks.length,beforeCount);assert.equal(env.query(`[data-task-id="${task.id}"] .one-work-title`).textContent,'Home connected task revised');
}));

test('linked-resource jump and Back preserve filters, selection, scroll origin and unfinished task text',()=>withPreview(async env=>{
  const task=createTask(env,'Return path task',{targetDate:daysFromToday(-1),resourceId:'demo-resource-consulting-2'});
  await env.route('work');await env.set('#one-work-search','Return path');await env.choose(filterSelector('projectFilter'),projectId);await env.choose(filterSelector('dateGroup'),'overdue');await env.choose(filterSelector('status'),'todo');
  await env.click(`[data-action="work-select"][data-id="${task.id}"]`);await env.click(`[data-action="work-open"][data-id="${task.id}"]`);
  await env.set('#work-title','Unfinished title from My Work');await env.set('#work-notes','Keep these notes after the source jump.');
  const beforeContext=structuredClone(workContext(env));env.window.scrollTo({top:160});
  await env.click('#one-work-form [data-action="work-resource"]');
  assert.equal(env.app.store.state.views.consulting.projectTab,'resources');assert.equal(env.app.store.state.views.consulting.linkedReturn.scroll,160);
  assert.equal(env.query('.one-res-inspector .one-detail-title').textContent,'Project brief');assert.equal(env.query('[data-action="project-back"]').textContent.trim(),'My Work');
  const savedDraft=JSON.parse(localStorage.getItem(PREVIEW_KEY)).workUI.drafts['consulting:all'];assert.equal(savedDraft.taskId,task.id);assert.equal(savedDraft.fields.title,'Unfinished title from My Work');
  await env.click('[data-action="project-back"]');
  assert.equal(env.query('#one-work-search').value,'Return path');assert.deepEqual(workContext(env),beforeContext);assert.equal(env.query('#work-title').value,'Unfinished title from My Work');assert.equal(env.query('#work-notes').value,'Keep these notes after the source jump.');
  assert.equal(env.query(`[data-action="work-select"][data-id="${task.id}"]`).getAttribute('aria-checked'),'true');
  assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).title,'Return path task','A resource jump must not save unfinished task metadata');
  await env.reload();assert.equal(env.query('#one-work-search').value,'Return path');assert.deepEqual(workContext(env),beforeContext);
  await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-title').value,'Unfinished title from My Work');assert.equal(env.query('#work-notes').value,'Keep these notes after the source jump.');
  assert.equal(JSON.parse(localStorage.getItem(RESOURCE_KEY)).resources.filter(row=>row.id==='demo-resource-consulting-2').length,1);
}));

test('missing, other-project and other-workspace sources stay unavailable without exposing resource titles',()=>withPreview(async env=>{
  const foreign=env.app.resources.store.state.resources.find(row=>row.id==='demo-resource-hr-2');env.app.resources.store.saveResource('hr',foreign.projectId,{...foreign,title:'PRIVATE HR RESOURCE TITLE'},foreign.id);
  const wrongProject=env.app.resources.store.state.resources.find(row=>row.id==='demo-resource-consulting-2');env.app.resources.store.saveResource(workspaceId,projectId,{...wrongProject,title:'PRIVATE DIFFERENT PROJECT SOURCE'},wrongProject.id);
  for(const [index,[source,taskProject]] of [['missing-resource',projectId],[foreign.id,projectId],[wrongProject.id,otherProjectId]].entries()){
    const task=createTask(env,'Unavailable source task',{projectId:taskProject,resourceId:source});await env.route('work');await env.set('#one-work-search','Unavailable source task');
    await env.click(`[data-action="work-open"][data-id="${task.id}"]`);
    if(index){assert.match(env.query('.ux-layer--confirm:not(.ux-leaving)').textContent,/Replace the unfinished task/);await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');}
    await env.set('#work-notes','Unsaved safe text');await env.click('#one-work-form [data-action="work-resource"]');
    assert.match(env.query('#one-notices').textContent,/This linked resource is unavailable/);assert.ok(document.querySelector('#one-work-form'));assert.equal(env.query('#work-notes').value,'Unsaved safe text');
    assert.doesNotMatch(document.body.textContent,/PRIVATE HR RESOURCE TITLE|PRIVATE DIFFERENT PROJECT SOURCE/);assert.equal(env.app.store.state.views.consulting.route,'work');
    await env.click('[data-action="work-close"]');
  }
}));

test('My Work dropdowns support keyboard focus, arrows, Home/End, typeahead, and Escape without changing the filter',()=>withPreview(async env=>{
  await env.route('work');const trigger=env.query(filterSelector('owner'));trigger.focus();await env.key('ArrowDown');
  assert.equal(trigger.getAttribute('aria-expanded'),'true');const listbox=env.query('.ux-layer:not(.ux-leaving) [role="listbox"]');assert.equal(listbox.id,trigger.getAttribute('aria-controls'));
  assert.equal(document.activeElement.dataset.value,'me');await env.key('ArrowDown');assert.equal(document.activeElement.dataset.value,'unassigned');
  await env.key('Home');assert.equal(document.activeElement.dataset.value,'all');await env.key('End');assert.equal(document.activeElement.dataset.value,'co-nadia');
  await env.key('d');await env.key('e');assert.equal(document.activeElement.dataset.value,'demo-admin');assert.equal(listbox.querySelectorAll('[role="option"][tabindex="0"]').length,1);
  await env.key('Escape');await new Promise(resolve=>setTimeout(resolve,350));await env.settle();
  assert.equal(env.query(filterSelector('owner')).getAttribute('aria-expanded'),'false');assert.equal(document.activeElement.id,trigger.id);assert.equal(workContext(env).owner,'me');
  await env.choose(filterSelector('owner'),'co-nadia');assert.equal(workContext(env).owner,'co-nadia');assert.equal(document.activeElement.id,trigger.id);
}));

test('navigation focuses the chosen page and view controls retain their exact mode',()=>withPreview(async env=>{
  const navigation=env.query('[data-action="navigate"][data-route="work"]');navigation.focus();navigation.click();await env.settle();
  assert.equal(document.activeElement,env.query('#one-content h1'),'Navigation should announce the chosen page heading');
  assert.equal(env.query('[data-action="navigate"][data-route="work"]').getAttribute('aria-current'),'page');
  assert.equal(navigation.isConnected,false);
  for(const mode of ['board','timeline']){
    const selector=`[data-action="work-view"][data-mode="${mode}"]`,trigger=env.query(selector);trigger.focus();trigger.click();await env.settle();
    assert.equal(document.activeElement.dataset.action,'work-view');assert.equal(document.activeElement.dataset.mode,mode,'The chosen view must not restore focus to List');assert.equal(document.activeElement.getAttribute('aria-pressed'),'true');assert.notEqual(document.activeElement,trigger);
    // A language render can be dispatched while this remains the focused control.
    // Test semantic restoration independently from the click target receiving focus.
    await env.click('[data-action="language"]');assert.equal(document.activeElement.dataset.action,'work-view');assert.equal(document.activeElement.dataset.mode,mode);assert.equal(document.activeElement.getAttribute('aria-pressed'),'true');assert.equal(workContext(env).mode,mode);
    const language=env.query('[data-action="language"]');language.focus();await env.click('[data-action="language"]');assert.equal(document.activeElement.dataset.action,'language','Normal language-control activation should retain that control focus');assert.equal(workContext(env).mode,mode);
  }
}));

test('Work rejects a target before start inline, focuses the target field and keeps the invalid draft recoverable',()=>withPreview(async env=>{
  const task=createTask(env,'Date order edit',{startDate:'2026-10-10',targetDate:'2026-10-12'}),prior=structuredClone(task);
  await env.route('work');await env.click(`[data-action="work-open"][data-id="${task.id}"]`);await env.set('#work-start','2026-10-20');await env.set('#work-target','2026-10-19');
  const submit=async()=>{env.query('#one-work-form').dispatchEvent(new env.window.Event('submit',{bubbles:true,cancelable:true}));await env.settle();};
  await submit();assert.match(env.query('#one-work-form [role="alert"]').textContent,/target date.*cannot precede the start/i);assert.equal(document.activeElement.id,'work-target');
  assert.deepEqual(env.app.store.state.tasks.find(row=>row.id===task.id),prior);assert.equal(env.query('#work-start').value,'2026-10-20');assert.equal(env.query('#work-target').value,'2026-10-19');
  assert.doesNotMatch(env.query('#one-feedback').textContent,/Task saved/);await env.click('[data-action="work-close"]');await env.reload();await env.click('[data-action="work-resume"]');
  assert.equal(env.query('#work-start').value,'2026-10-20');assert.equal(env.query('#work-target').value,'2026-10-19');await submit();assert.equal(document.activeElement.id,'work-target');
  await env.set('#work-target','2026-10-20');await submit();const saved=env.app.store.state.tasks.find(row=>row.id===task.id);assert.equal(saved.startDate,'2026-10-20');assert.equal(saved.targetDate,'2026-10-20');assert.match(env.query('#one-feedback').textContent,/Task saved/);
}));

test('Work storage failure keeps typed text, leaves saved records unchanged and reports no successful save',()=>withPreview(async env=>{
  const task=createTask(env,'Storage recovery task'),prior=structuredClone(task);
  await env.route('work');await env.click(`[data-action="work-open"][data-id="${task.id}"]`);await env.set('#work-title','Durably kept draft title');
  const beforeFailure=localStorage.getItem(PREVIEW_KEY);env.setWritesFail(true);await env.set('#work-notes','New notes typed while saving is unavailable.');
  assert.match(env.query('#one-work-draft-status').textContent,/Draft could not be stored/);
  await env.click('[data-action="work-save"]');
  assert.deepEqual(env.app.store.state.tasks.find(row=>row.id===task.id),prior);assert.equal(localStorage.getItem(PREVIEW_KEY),beforeFailure);
  assert.equal(env.query('#work-title').value,'Durably kept draft title');assert.equal(env.query('#work-notes').value,'New notes typed while saving is unavailable.');
  assert.match(env.query('#one-work-form [role="alert"]').textContent,/Could not save/i);assert.doesNotMatch(env.query('#one-feedback').textContent,/Task saved|Task completed|tasks updated/);
  assert.match(env.query('#one-work-draft-status').textContent,/could not be stored|not saved|keep.*open/i,'Failed Save must not replace the failed-draft warning with a stored claim');
  assert.equal(JSON.parse(localStorage.getItem(PREVIEW_KEY)).workUI.drafts['consulting:all'].fields.notes,'');
  env.setWritesFail(false);await env.click('[data-action="work-save"]');assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'New notes typed while saving is unavailable.');assert.match(env.query('#one-feedback').textContent,/Task saved/);assert.doesNotMatch(env.query('#one-notices').textContent,/Could not save/i,'A successful retry should clear the recovered storage error');
  await env.reload();assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).title,'Durably kept draft title');assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'New notes typed while saving is unavailable.');
}));

test('closed unstored Work draft warns honestly, blocks unload and recovers after the hidden draft can be stored',()=>withPreview(async env=>{
  const task=createTask(env,'Closed draft recovery task'),notes='Exact notes typed before closing while storage was unavailable.';
  await env.route('work');await env.click(`[data-action="work-open"][data-id="${task.id}"]`);env.setWritesFail(true);await env.set('#work-notes',notes);await env.click('[data-action="work-close"]');
  assert.equal(document.querySelector('#one-work-form'),null);const recovery=env.query('[data-action="work-resume"]').closest('.one-notice');
  assert.match(recovery.textContent,/could not be stored/i);assert.doesNotMatch(recovery.textContent,/kept on this device|stored on this device/i);assert.doesNotMatch(env.query('#one-feedback').textContent,/Task saved/);
  assert.equal(env.app.work.saveDraft(),false,'Saving an unstored hidden draft must report the actual failed write');
  const unload=new env.window.Event('beforeunload',{cancelable:true});env.window.dispatchEvent(unload);await env.settle();assert.equal(unload.defaultPrevented,true,'Unloading would lose the unstored hidden text');
  assert.equal(JSON.parse(localStorage.getItem(PREVIEW_KEY)).workUI.drafts['consulting:all'].fields.notes,'');assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'');
  env.setWritesFail(false);assert.equal(env.app.work.saveDraft(),true);assert.equal(JSON.parse(localStorage.getItem(PREVIEW_KEY)).workUI.drafts['consulting:all'].fields.notes,notes);assert.doesNotMatch(env.query('#one-feedback').textContent,/Task saved/);
  await env.reload();await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,notes);assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'','Storing a draft must not commit the task');
}));

test('My Work and project Work drafts, filters and selections remain separate through workspace switches and reload',()=>withPreview(async env=>{
  const task=createTask(env,'Consulting recovery task',{targetDate:todayISO()});
  const hrTask=env.app.store.createTask('hr',{projectId:'demo-hr-1',title:'HR recovery task',ownerId:'demo-admin',status:'todo',targetDate:'',priority:'normal'});
  await env.route('work');await env.set('#one-work-search','Consulting recovery');await env.choose(filterSelector('projectFilter'),projectId);await env.choose(filterSelector('dateGroup'),'today');await env.choose(filterSelector('status'),'todo');await env.click(`[data-action="work-select"][data-id="${task.id}"]`);
  await env.click(`[data-action="work-open"][data-id="${task.id}"]`);await env.set('#work-notes','Consulting My Work draft');const consultingContext=structuredClone(workContext(env));
  await env.route('projects');await env.click(`[data-action="open-project"][data-id="${projectId}"]`);await env.click('#one-inspector [data-action="project-page"]');await env.click('#one-project-tab-work');
  const projectTaskId=`${projectId}-task-1`;await env.click(`[data-action="work-open"][data-id="${projectTaskId}"]`);await env.set('#work-notes','Consulting project-only draft');
  assert.equal(env.app.work.uiState.drafts['consulting:all'].fields.notes,'Consulting My Work draft');assert.equal(env.app.work.uiState.drafts[`consulting:${projectId}`].fields.notes,'Consulting project-only draft');
  await env.workspace('hr');assert.doesNotMatch(document.querySelector('#one-content').textContent,/Consulting recovery task|Consulting My Work draft|Consulting project-only draft/);assert.equal(document.querySelector('#one-work-form'),null);
  await env.route('work');await env.set('#one-work-search','HR recovery');await env.click(`[data-action="work-select"][data-id="${hrTask.id}"]`);await env.click(`[data-action="work-open"][data-id="${hrTask.id}"]`);await env.set('#work-notes','HR-only unfinished draft');const hrContext=structuredClone(env.app.work.uiState.contexts['hr:all']);
  await env.reload();assert.equal(env.app.store.state.preferences.workspaceId,'hr');assert.equal(env.query('#one-work-search').value,'HR recovery');await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'HR-only unfinished draft');
  await env.workspace('consulting');assert.equal(env.app.store.state.views.consulting.projectTab,'work');await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Consulting project-only draft');
  await env.route('work');assert.deepEqual(workContext(env),consultingContext);assert.equal(env.query('#one-work-search').value,'Consulting recovery');assert.equal(env.query(`[data-action="work-select"][data-id="${task.id}"]`).getAttribute('aria-checked'),'true');await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Consulting My Work draft');
  await env.reload();await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'Consulting My Work draft');await env.workspace('hr');assert.deepEqual(env.app.work.uiState.contexts['hr:all'],hrContext);await env.click('[data-action="work-resume"]');assert.equal(env.query('#work-notes').value,'HR-only unfinished draft');
  assert.equal(env.app.store.state.tasks.find(row=>row.id===task.id).notes,'');assert.equal(env.app.store.state.tasks.find(row=>row.id===hrTask.id).notes,'');
}));

test('linked task project is labeled and locked to its source in both languages while ordinary tasks retain a project chooser',()=>withPreview(async env=>{
  const linked=createTask(env,'Source-locked task',{resourceId:'demo-resource-consulting-2'}),ordinary=createTask(env,'Ordinary movable task');
  await env.route('work');await env.click(`[data-action="work-open"][data-id="${linked.id}"]`);
  assert.equal(document.querySelector('#one-work-form [data-action="work-choice"][data-key="projectId"]'),null);assert.match(env.query('#one-work-form').textContent,/Project.*Consulting bootcamp.*Linked tasks stay in their source project/s);
  await env.click('[data-action="language"]');assert.match(env.query('#one-work-form').textContent,/Proyek.*Consulting bootcamp.*Tugas terkait tetap berada di proyek sumbernya/s);assert.equal(document.querySelector('#work-field-projectId'),null);
  await env.set('#work-title','Source-locked task edited');await env.click('[data-action="work-save"]');const saved=env.app.store.state.tasks.find(row=>row.id===linked.id);assert.equal(saved.projectId,projectId);assert.equal(saved.resourceId,'demo-resource-consulting-2');
  await env.click(`[data-action="work-open"][data-id="${ordinary.id}"]`);assert.ok(env.query('#one-work-form [data-action="work-choice"][data-key="projectId"]'));await env.choose('#work-field-projectId',otherProjectId);await env.click('[data-action="work-save"]');assert.equal(env.app.store.state.tasks.find(row=>row.id===ordinary.id).projectId,otherProjectId);
  await env.reload();assert.equal(env.app.store.state.tasks.find(row=>row.id===linked.id).projectId,projectId);assert.equal(env.app.store.state.tasks.find(row=>row.id===linked.id).resourceId,'demo-resource-consulting-2');
}));
