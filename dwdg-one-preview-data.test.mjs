import test from 'node:test';
import assert from 'node:assert/strict';
import {PREVIEW_KEY,WORKSPACES,PEOPLE,STATUS_LABELS,createPreviewStore,selectProjects,projectProgress,projectBlockers} from './dwdg-one-preview-data.mjs';

class MemoryStorage {
  constructor(initial={}) {this.data=new Map(Object.entries(initial));this.reads=[];this.writes=[];this.failRead=false;this.failWrite=false;}
  getItem(key) {this.reads.push(key);if(this.failRead)throw new Error('Unavailable');return this.data.get(key)??null;}
  setItem(key,value) {if(this.failWrite)throw new Error('Quota');this.writes.push(key);this.data.set(key,value);}
}
const input=(title='A preview project',extra={})=>({title,purpose:'A useful outcome',leadId:'co-arya',startDate:'2026-10-03',targetDate:'2026-10-14',...extra});
const draft=(title,extra={})=>({projectId:'',fields:input(title,extra)});
const expectCode=(fn,code)=>assert.throws(fn,error=>error.code===code);

test('actor attribution preserves unknown creators and scopes creation Undo history after removal',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage,{actorId:'co-nadia'});
  const project=store.state.projects.find(row=>row.workspaceId==='consulting');
  store.saveProject('consulting',{...project,title:'Edited by member'},project.id);
  assert.equal(store.state.projects.find(row=>row.id===project.id).createdBy,undefined);
  assert.equal(store.state.events.at(-1).actorId,'co-nadia');
  const created=store.saveProject('consulting',input('Actor project'));assert.equal(created.createdBy,'co-nadia');
  store.undo('consulting');assert.equal(store.state.events.at(-1).projectId,created.id);
  const task=store.createTask('consulting',{projectId:project.id,title:'Actor task',ownerId:'co-nadia'});
  assert.equal(task.createdBy,'co-nadia');store.undoTask('consulting');assert.equal(store.state.events.at(-1).projectId,project.id);
  const legacy=store.state.tasks.find(row=>row.projectId===project.id&&!Object.hasOwn(row,'priority'));
  const saved=store.saveTask('consulting',{...legacy,status:'todo'},legacy.id);
  for(const key of ['priority','notes','startDate','resourceId','requestId'])assert.equal(Object.hasOwn(saved,key),Object.hasOwn(legacy,key));
});

test('actor record and private form transition commit atomically without touching legacy UI',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage,{actorId:'co-nadia'});
  store.saveUI({drafts:{consulting:draft('Legacy admin form')},views:{consulting:{query:'admin query'}}});
  const ui={preferences:{...store.state.preferences,theme:'dark'},drafts:{consulting:draft('Private form')},views:{consulting:{query:'member query'}},workUI:{contexts:{},drafts:{}}};
  store.saveActorUI(ui);const before=store.state,bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;
  const actorUI={...ui,drafts:{}};storage.failWrite=true;
  expectCode(()=>store.saveProject('consulting',input('Private form'),'',{preserveUI:true,actorUI}),'storage');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
  storage.failWrite=false;const record=store.saveProject('consulting',input('Private form'),'',{preserveUI:true,actorUI});
  assert.equal(storage.writes.length,writes+1);assert.deepEqual(store.state.drafts,before.drafts);assert.deepEqual(store.state.views,before.views);
  assert.deepEqual(store.state.actorUI['co-nadia'].drafts,{});assert.equal(store.state.actorUI['co-nadia'].views.consulting.selectedId,record.id);
  assert.equal(createPreviewStore(storage).state.actorUI['co-nadia'].views.consulting.selectedId,record.id);
  const savedBytes=storage.data.get(PREVIEW_KEY);expectCode(()=>store.saveActorUI({drafts:{consulting:{fields:'broken'}}}),'storage');assert.equal(storage.data.get(PREVIEW_KEY),savedBytes);
});

test('preview uses its one isolated key and seeds all six illustrative divisions',()=>{
  const originals={'dwdg-workspace-v1':'keep core','dwdg-division-preview-v03':'keep divisions','dwdg-project-extras-v1':'keep extras','dwdg-experience-v1':'keep preferences'};
  const storage=new MemoryStorage(originals),store=createPreviewStore(storage);
  assert.equal(store.warning,null);assert.equal(store.state.projects.length,20);
  assert.equal(selectProjects(store.state,'consulting').length,6);
  assert.deepEqual(new Set(store.state.projects.map(project=>project.workspaceId)),new Set(WORKSPACES.map(workspace=>workspace.id)));
  assert.deepEqual(new Set(store.state.projects.map(project=>project.status)),new Set(Object.keys(STATUS_LABELS)));
  assert.ok(store.state.projects.every(project=>project.sample));
  assert.ok(store.state.projects.some(project=>project.title.length>100));
  assert.ok(store.state.projects.some(project=>!project.targetDate));
  assert.deepEqual(store.state.preferences,{language:'en',theme:'light',motion:'system',transparency:'translucent',workspaceId:'consulting'});
  assert.ok(storage.reads.every(key=>key===PREVIEW_KEY));assert.deepEqual(storage.writes,[PREVIEW_KEY]);
  for(const [key,value] of Object.entries(originals))assert.equal(storage.data.get(key),value);
});

test('reload keeps existing preview records and performs no repeat seed writes',()=>{
  const storage=new MemoryStorage(),first=createPreviewStore(storage);
  const created=first.saveProject('consulting',input('Persist this draft'));
  const bytes=storage.data.get(PREVIEW_KEY),writeCount=storage.writes.length,reloaded=createPreviewStore(storage);
  assert.equal(storage.writes.length,writeCount);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
  assert.deepEqual(reloaded.state,first.state);assert.ok(reloaded.state.projects.some(project=>project.id===created.id));
});

test('create trims metadata, allows unassigned missing dates and persists one stable draft ID',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage);
  const project=store.saveProject('consulting',input('  New draft  ',{purpose:'  Specific outcome  ',leadId:'',startDate:'',targetDate:''}));
  assert.match(project.id,/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  assert.equal(project.title,'New draft');assert.equal(project.purpose,'Specific outcome');assert.equal(project.status,'draft');
  assert.equal(project.leadId,'');assert.equal(project.startDate,'');assert.equal(project.targetDate,'');
  assert.equal(createPreviewStore(storage).state.projects.find(row=>row.id===project.id).id,project.id);
});

test('metadata edit keeps stable identity, workspace and lifecycle and refuses cross-workspace edits',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),before=store.state.projects.find(project=>project.status==='active'&&project.workspaceId==='consulting');
  const saved=store.saveProject('consulting',{...before,title:'Updated metadata',id:'spoof',workspaceId:'hr',status:'completed'},before.id);
  assert.equal(saved.id,before.id);assert.equal(saved.status,before.status);assert.equal(saved.workspaceId,before.workspaceId);
  assert.equal(saved.createdAt,before.createdAt);assert.equal(projectProgress(store.state,saved.id).total,6);
  const snapshot=store.state,bytes=storage.data.get(PREVIEW_KEY);
  expectCode(()=>store.saveProject('hr',input('Wrong context',{leadId:'hr-alya'}),saved.id),'workspace');
  assert.equal(store.state,snapshot);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
});

test('invalid title, dates, lead and workspace fail without changing records or storage',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),state=store.state,bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;
  const cases=[['consulting',input('  '),'title'],['consulting',input('X',{startDate:'2026-02-30'}),'dates'],
    ['consulting',input('X',{targetDate:'2026-10-02'}),'dates'],['consulting',input('X',{targetDate:'3 October'}),'dates'],
    ['consulting',input('X',{leadId:'hr-alya'}),'owner'],['consulting',input('X',{leadId:'missing'}),'owner'],['future-team',input(),'workspace']];
  for(const [workspaceId,metadata,code] of cases)expectCode(()=>store.saveProject(workspaceId,metadata),code);
  assert.equal(store.state,state);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
});

test('workspace Undo persists through reload and restores records without reverting unrelated UI state',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),before=store.state.projects.find(project=>project.workspaceId==='consulting');
  store.saveProject('consulting',{...before,title:'An edited project'},before.id);
  const hr=store.saveProject('hr',input('HR draft',{leadId:'hr-alya'}));
  store.saveUI({preferences:{language:'id',workspaceId:'hr'},drafts:{consulting:draft('Unsaved thought')},views:{consulting:{query:'saved query',status:'active'}}});
  const reloaded=createPreviewStore(storage);
  assert.equal(reloaded.canUndo('consulting'),true);assert.equal(reloaded.undo('consulting'),true);
  assert.deepEqual(reloaded.state.projects.find(project=>project.id===before.id),before);
  assert.ok(reloaded.state.projects.some(project=>project.id===hr.id));assert.equal(reloaded.canUndo('hr'),true);
  assert.equal(reloaded.state.preferences.language,'id');assert.equal(reloaded.state.preferences.workspaceId,'hr');
  assert.deepEqual(reloaded.state.drafts.consulting,draft('Unsaved thought'));assert.equal(reloaded.state.views.consulting.query,'saved query');
  assert.equal(reloaded.undo('consulting'),false);
});

test('save clears the saved workspace draft and opens detail atomically while preserving view filters',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage);
  store.saveUI({drafts:{consulting:draft('Form draft'),hr:draft('Other form',{leadId:'hr-alya'})},views:{consulting:{query:'brief',status:'review',panel:'form'}}});
  const before=store.state,bytes=storage.data.get(PREVIEW_KEY);storage.failWrite=true;
  expectCode(()=>store.saveProject('consulting',input('Saved form')),'storage');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(store.state.views.consulting.panel,'form');
  storage.failWrite=false;const writes=storage.writes.length,project=store.saveProject('consulting',input('Saved form'));
  assert.equal(storage.writes.length,writes+1);assert.equal(store.state.drafts.consulting,undefined);
  assert.deepEqual(store.state.drafts.hr,draft('Other form',{leadId:'hr-alya'}));
  assert.deepEqual(store.state.views.consulting,{query:'brief',status:'review',panel:'detail',selectedId:project.id});
  assert.equal(store.warning,null);
});

test('Undo removes a newly created selected record and retains a newer unsaved draft and filters',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),project=store.saveProject('consulting',input('Create and undo'));
  store.saveUI({drafts:{consulting:draft('Next draft')},views:{consulting:{query:'my filter',lead:'co-nadia'}}});
  store.undo('consulting');
  assert.ok(!store.state.projects.some(row=>row.id===project.id));assert.deepEqual(store.state.drafts.consulting,draft('Next draft'));
  assert.deepEqual(store.state.views.consulting,{panel:'',selectedId:'',query:'my filter',lead:'co-nadia'});
});

test('corrupt or malformed stored preview bytes remain untouched and no demo data is reseeded',()=>{
  for(const raw of ['{broken json',JSON.stringify({version:999,projects:[]})]){
    const storage=new MemoryStorage({[PREVIEW_KEY]:raw}),store=createPreviewStore(storage);
    assert.equal(store.warning,'corrupt');assert.equal(store.state.projects.length,0);assert.equal(storage.writes.length,0);
    expectCode(()=>store.saveProject('consulting',input()),'corrupt');expectCode(()=>store.saveUI({preferences:{language:'id'}}),'corrupt');
    assert.equal(storage.data.get(PREVIEW_KEY),raw);assert.equal(storage.writes.length,0);
  }
});

test('unavailable storage is honest and an initial quota failure can recover without losing data',()=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  try {
    Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('Browser storage access denied');}});
    const denied=createPreviewStore();assert.equal(denied.warning,'storage');assert.equal(denied.state.projects.length,0);
    expectCode(()=>denied.saveUI({preferences:{theme:'dark'}}),'storage');
  }finally {if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
  const inaccessible=new MemoryStorage();inaccessible.failRead=true;
  const protectedStore=createPreviewStore(inaccessible);assert.equal(protectedStore.warning,'storage');assert.equal(protectedStore.state.projects.length,0);
  expectCode(()=>protectedStore.saveProject('consulting',input()),'storage');assert.equal(inaccessible.writes.length,0);
  const quota=new MemoryStorage();quota.failWrite=true;
  const store=createPreviewStore(quota);assert.equal(store.warning,'storage');assert.equal(store.state.projects.length,20);
  const state=store.state;expectCode(()=>store.saveProject('consulting',input()),'storage');assert.equal(store.state,state);
  quota.failWrite=false;store.saveProject('consulting',input('Recover after quota'));assert.equal(store.warning,null);
  assert.equal(createPreviewStore(quota).state.projects.length,21);
});

test('failed UI or Undo storage writes keep state, original bytes and recoverable history',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),project=store.saveProject('consulting',input());
  const before=store.state,bytes=storage.data.get(PREVIEW_KEY);storage.failWrite=true;
  expectCode(()=>store.saveUI({preferences:{theme:'dark'}}),'storage');expectCode(()=>store.undo('consulting'),'storage');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(store.canUndo('consulting'),true);
  storage.failWrite=false;store.undo('consulting');assert.ok(!store.state.projects.some(row=>row.id===project.id));
});

test('concurrent revisions refuse stale project, UI and Undo mutations without clobbering newer bytes',()=>{
  const storage=new MemoryStorage(),first=createPreviewStore(storage);
  first.saveProject('consulting',input('Undo candidate'));
  const stale=createPreviewStore(storage),snapshot=stale.state;
  first.saveUI({preferences:{theme:'dark'}});const bytes=storage.data.get(PREVIEW_KEY);
  expectCode(()=>stale.saveProject('consulting',input('Stale create')),'conflict');
  expectCode(()=>stale.saveUI({preferences:{language:'id'}}),'conflict');expectCode(()=>stale.undo('consulting'),'conflict');
  assert.equal(stale.state,snapshot);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(first.state.preferences.theme,'dark');
});

test('workspace filtering combines lifecycle, lead and title/purpose/person search with target ordering',()=>{
  const store=createPreviewStore(new MemoryStorage()),state=store.state;
  assert.equal(selectProjects(state,'consulting',{status:'active'}).length,1);
  assert.equal(selectProjects(state,'consulting',{lead:'co-arya'}).length,3);
  assert.equal(selectProjects(state,'consulting',{query:'Nadia Putri'}).length,2);
  assert.equal(selectProjects(state,'consulting',{query:'facilitator responsibilities'}).length,1);
  assert.equal(selectProjects(state,'consulting',{query:'bootcamp',status:'active',lead:'co-arya'}).length,1);
  assert.equal(selectProjects(state,'consulting',{query:'Mentor'}).length,0);
  assert.equal(selectProjects(state,'consulting',{lead:'unassigned'}).length,1);
  const selected=selectProjects(state,'consulting');assert.equal(selected[0].targetDate,'2026-10-02');assert.equal(selected.at(-1).targetDate,'');
  const titleSort=selectProjects(state,'consulting',{sort:'title'});assert.equal(titleSort[0].title,'Campus venture discovery');
  assert.equal(state.projects[0].id,'demo-consulting-1');assert.equal(PEOPLE.find(person=>person.id==='co-arya').workspaceId,'consulting');
});

test('progress derives only linked task records and open blockers exclude resolved records',()=>{
  const {state}=createPreviewStore(new MemoryStorage());
  assert.deepEqual(projectProgress(state,'demo-consulting-1'),{done:2,total:6,percent:33});
  assert.deepEqual(projectProgress(state,'demo-consulting-4'),{done:0,total:0,percent:0});
  assert.deepEqual(projectProgress(state,'missing'),{done:0,total:0,percent:0});
  assert.equal(projectBlockers(state,'demo-consulting-1').length,1);assert.equal(projectBlockers(state,'demo-consulting-3').length,0);
  assert.deepEqual(projectBlockers(state,'missing'),[]);
});

test('preferences, workspace drafts and partially merged views persist across reload and invalid UI does not commit',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage);
  store.saveUI({preferences:{language:'id',theme:'dark',motion:'reduced',transparency:'solid',workspaceId:'hr'},
    drafts:{hr:draft('Unfinished project',{purpose:'Retain this input',leadId:'hr-alya'})},views:{hr:{query:'member',status:'active'},consulting:{query:'case'}}});
  store.saveUI({views:{hr:{sort:'title'}}});
  const restored=createPreviewStore(storage);assert.deepEqual(restored.state,store.state);
  assert.deepEqual(restored.state.views.hr,{query:'member',status:'active',sort:'title'});assert.equal(restored.state.views.consulting.query,'case');
  assert.equal(restored.state.drafts.hr.fields.title,'Unfinished project');
  const snapshot=restored.state,bytes=storage.data.get(PREVIEW_KEY);
  expectCode(()=>restored.saveUI({preferences:{workspaceId:'unapproved-future-team'}}),'storage');
  assert.equal(restored.state,snapshot);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
});

test('Cancel-style complete draft replacement removes only the discarded workspace and stays removed on reload',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),hrDraft=draft('HR input',{leadId:'hr-alya'});
  store.saveUI({drafts:{consulting:draft('Discard this form'),hr:hrDraft},views:{consulting:{panel:'form'}}});
  const drafts=structuredClone(store.state.drafts);delete drafts.consulting;
  store.saveUI({drafts,views:{consulting:{panel:''}}});
  assert.equal(store.state.drafts.consulting,undefined);assert.deepEqual(store.state.drafts.hr,hrDraft);
  const reload=createPreviewStore(storage);assert.equal(reload.state.drafts.consulting,undefined);assert.deepEqual(reload.state.drafts.hr,hrDraft);
  store.saveUI({drafts:{}});assert.deepEqual(createPreviewStore(storage).state.drafts,{});
});

test('malformed saved drafts or known view field types are preserved as corrupt rather than rendered or reseeded',()=>{
  const seed=createPreviewStore(new MemoryStorage()).state;
  const corruptions=[state=>{state.drafts.consulting={projectId:'',fields:{title:'Missing fields'}};},
    state=>{state.drafts.consulting=draft('Wrong type');state.drafts.consulting.fields.title=42;},
    state=>{state.drafts.consulting=draft('Wrong id');state.drafts.consulting.projectId=null;},
    state=>{state.views.consulting={query:{bad:true}};},state=>{state.views.consulting={scroll:'250'};},
    state=>{state.views.consulting={panel:['form']};}];
  for(const corrupt of corruptions){
    const state=structuredClone(seed);corrupt(state);const bytes=JSON.stringify(state),storage=new MemoryStorage({[PREVIEW_KEY]:bytes});
    const restored=createPreviewStore(storage);assert.equal(restored.warning,'corrupt');assert.equal(restored.state.projects.length,0);
    expectCode(()=>restored.saveUI({drafts:{}}),'corrupt');assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,0);
  }
  const storage=new MemoryStorage(),store=createPreviewStore(storage),before=store.state,bytes=storage.data.get(PREVIEW_KEY);
  expectCode(()=>store.saveUI({drafts:{consulting:{title:'Incomplete draft shape'}}}),'storage');
  expectCode(()=>store.saveUI({views:{consulting:{scroll:'ten'}}}),'storage');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
  store.saveUI({views:{consulting:{panel:'detail',selectedId:'demo-consulting-1'}}});
  assert.deepEqual(store.state.views.consulting,{panel:'detail',selectedId:'demo-consulting-1'});
});

test('only a fresh preview receives demo-admin daily assignments; older saved tasks and bytes remain exact',()=>{
  const fresh=createPreviewStore(new MemoryStorage());
  assert.deepEqual(PEOPLE.find(person=>person.id==='demo-admin'),{id:'demo-admin',name:'Demo administrator',workspaceId:'*'});
  for(const workspace of WORKSPACES)assert.ok(fresh.state.tasks.some(task=>task.workspaceId===workspace.id&&task.ownerId==='demo-admin'&&task.status!=='done'));
  assert.ok(fresh.state.tasks.filter(task=>task.status==='done').every(task=>task.completedAt===undefined));
  const legacy=structuredClone(fresh.state);
  for(const task of legacy.tasks){delete task.ownerId;delete task.targetDate;}
  legacy.tasks[0].title='A member’s previously saved task';
  const bytes=JSON.stringify(legacy),storage=new MemoryStorage({[PREVIEW_KEY]:bytes}),restored=createPreviewStore(storage);
  assert.equal(restored.warning,null);assert.deepEqual(restored.state,legacy);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
  assert.equal(storage.writes.length,0);assert.ok(restored.state.tasks.every(task=>task.ownerId===undefined&&task.targetDate===undefined));
});

test('batch save and one Undo each commit once, preserve canonical links and retain unrelated drafts and workspace state',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage);
  const tasks=['First linked responsibility','Second linked responsibility'].map((title,index)=>store.createTask('consulting',{
    title,projectId:'demo-consulting-1',ownerId:'co-arya',resourceId:`resource-${index}`,requestId:`request-${index}`,targetDate:'2026-10-14'}));
  const ids=tasks.map(task=>task.id),workUI={contexts:{'consulting:all':{selectedIds:ids,query:'linked'},'hr:all':{selectedIds:['hr-stays-selected']}},drafts:{'consulting:all':{fields:{title:'Typed draft remains'}}}};
  store.saveWorkUI(workUI);store.saveUI({preferences:{language:'id'}});
  const before=structuredClone(store.state),writes=storage.writes.length,events=store.state.events.length;
  const result=store.saveTasks('consulting',ids,{status:'done',ownerId:'demo-admin'},{contextKey:'consulting:all'});
  assert.equal(storage.writes.length,writes+1);assert.equal(store.state.revision,before.revision+1);
  assert.deepEqual(result.map(task=>task.id),ids);assert.equal(result[0],store.state.tasks.find(task=>task.id===ids[0]));
  assert.ok(result.every((task,index)=>task.status==='done'&&task.ownerId==='demo-admin'&&task.resourceId===tasks[index].resourceId&&task.requestId===tasks[index].requestId));
  assert.ok(result.every(task=>typeof task.completedAt==='string'&&!Number.isNaN(Date.parse(task.completedAt))));
  assert.equal(result[0].completedAt,result[1].completedAt);
  assert.deepEqual(store.state.workUI.contexts['consulting:all'].selectedIds,[]);
  assert.deepEqual(store.state.workUI.contexts['hr:all'],before.workUI.contexts['hr:all']);
  assert.deepEqual(store.state.workUI.drafts,before.workUI.drafts);
  assert.deepEqual(store.state.events.slice(events).map(event=>[event.workspaceId,event.kind,event.recordId]),ids.map(id=>['consulting','task.updated',id]));
  assert.equal(store.state.taskUndo.consulting.entries.at(-1).kind,'batch');
  const reload=createPreviewStore(storage),undoWrites=storage.writes.length,undoRevision=reload.state.revision;
  assert.equal(reload.undoTask('consulting'),true);assert.equal(storage.writes.length,undoWrites+1);assert.equal(reload.state.revision,undoRevision+1);
  assert.deepEqual(reload.state.tasks,before.tasks);assert.deepEqual(reload.state.workUI.drafts,before.workUI.drafts);
  assert.deepEqual(reload.state.preferences,before.preferences);assert.deepEqual(reload.state.workUI.contexts['hr:all'],before.workUI.contexts['hr:all']);
  assert.deepEqual(reload.state.events.slice(-2).map(event=>[event.workspaceId,event.kind,event.recordId]),ids.map(id=>['consulting','task.undo',id]));
});

test('failed batch save or batch Undo never commits records, events, selection clearing or consumed history',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),ids=store.state.tasks.filter(task=>task.workspaceId==='consulting'&&task.status!=='done').slice(0,2).map(task=>task.id);
  store.saveWorkUI({contexts:{'consulting:all':{selectedIds:ids}},drafts:{'consulting:all':{fields:{title:'Keep this input'}}}});
  let before=store.state,bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;storage.failWrite=true;
  expectCode(()=>store.saveTasks('consulting',ids,{status:'done'},{contextKey:'consulting:all'}),'storage');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
  storage.failWrite=false;store.saveTasks('consulting',ids,{status:'done'},{contextKey:'consulting:all'});
  before=store.state;bytes=storage.data.get(PREVIEW_KEY);writes=storage.writes.length;storage.failWrite=true;
  expectCode(()=>store.undoTask('consulting'),'storage');assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);
  assert.equal(storage.writes.length,writes);assert.equal(store.canUndoTask('consulting'),true);
  storage.failWrite=false;assert.equal(store.undoTask('consulting'),true);assert.deepEqual(store.state.tasks.filter(task=>ids.includes(task.id)).map(task=>task.status),['progress','todo']);
});

test('every batch task and patch is validated before any commit, including foreign owners and dates',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),first=store.state.tasks.find(task=>task.workspaceId==='consulting'),foreign=store.state.tasks.find(task=>task.workspaceId==='hr');
  const before=store.state,bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;
  const invalids=[[[first.id,foreign.id],{status:'done'},'workspace'],[[first.id,'missing'],{status:'done'},'workspace'],
    [[first.id,first.id],{status:'done'},'workspace'],[[],{status:'done'},'workspace'],[[first.id],{ownerId:'hr-alya'},'owner'],
    [[first.id],{targetDate:'2026-02-30'},'dates'],[[first.id],{status:'approved'},'record'],[[first.id],{resourceId:'rewritten-link'},'record']];
  for(const [ids,patch,code] of invalids)expectCode(()=>store.saveTasks('consulting',ids,patch),code);
  expectCode(()=>store.saveTasks('unknown',[first.id],{status:'done'}),'workspace');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
});

test('batch UI selection context cannot clear a different workspace selection',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),task=store.state.tasks.find(task=>task.workspaceId==='consulting'&&task.status!=='done');
  store.saveWorkUI({contexts:{'consulting:all':{selectedIds:[task.id]},'hr:all':{selectedIds:['hr-task']}},drafts:{}});
  const before=store.state,bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;
  for(const contextKey of ['hr:all','consulting:',42,'consulting-other:all'])expectCode(()=>store.saveTasks('consulting',[task.id],{status:'done'},{contextKey}),'workspace');
  assert.equal(store.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
});

test('batch completion keeps known and legacy dates honest; reopen and Undo restore exact prior history',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),legacy=store.state.tasks.find(task=>task.workspaceId==='consulting'&&task.status==='done'),open=store.state.tasks.find(task=>task.workspaceId==='consulting'&&task.status!=='done');
  const before=structuredClone(store.state.tasks);
  store.saveTasks('consulting',[legacy.id,open.id],{status:'done'});
  assert.equal(store.state.tasks.find(task=>task.id===legacy.id).completedAt,undefined);
  const known=store.state.tasks.find(task=>task.id===open.id).completedAt;assert.ok(known);
  store.saveTasks('consulting',[legacy.id,open.id],{ownerId:'co-nadia'});
  assert.equal(store.state.tasks.find(task=>task.id===legacy.id).completedAt,undefined);assert.equal(store.state.tasks.find(task=>task.id===open.id).completedAt,known);
  store.saveTasks('consulting',[legacy.id,open.id],{status:'todo'});
  assert.ok(store.state.tasks.filter(task=>[legacy.id,open.id].includes(task.id)).every(task=>task.completedAt===undefined));
  store.undoTask('consulting');assert.equal(store.state.tasks.find(task=>task.id===open.id).completedAt,known);
  store.undoTask('consulting');store.undoTask('consulting');assert.deepEqual(store.state.tasks,before);
});

test('stale batch and batch Undo refuse concurrent changes without clobbering newer workspace bytes',()=>{
  const storage=new MemoryStorage(),first=createPreviewStore(storage),ids=first.state.tasks.filter(task=>task.workspaceId==='consulting'&&task.status!=='done').slice(0,2).map(task=>task.id);
  first.saveTasks('consulting',ids,{status:'done'});const stale=createPreviewStore(storage),before=stale.state;
  first.saveUI({preferences:{theme:'dark'}});const bytes=storage.data.get(PREVIEW_KEY),writes=storage.writes.length;
  expectCode(()=>stale.saveTasks('consulting',ids,{ownerId:'co-nadia'}),'conflict');expectCode(()=>stale.undoTask('consulting'),'conflict');
  assert.equal(stale.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
});

test('batch Undo rejects a changed member atomically and cannot affect another workspace history',()=>{
  const storage=new MemoryStorage(),store=createPreviewStore(storage),ids=store.state.tasks.filter(task=>task.workspaceId==='consulting'&&task.status!=='done').slice(0,2).map(task=>task.id);
  store.saveTasks('consulting',ids,{status:'done'});
  const altered=JSON.parse(storage.data.get(PREVIEW_KEY));altered.tasks.find(task=>task.id===ids[0]).title='Changed independently';
  const bytes=JSON.stringify(altered);storage.data.set(PREVIEW_KEY,bytes);const reloaded=createPreviewStore(storage),before=reloaded.state,writes=storage.writes.length;
  assert.equal(reloaded.warning,null);assert.equal(reloaded.undoTask('hr'),false);
  expectCode(()=>reloaded.undoTask('consulting'),'conflict');assert.equal(reloaded.state,before);assert.equal(storage.data.get(PREVIEW_KEY),bytes);assert.equal(storage.writes.length,writes);
  assert.equal(reloaded.canUndoTask('consulting'),true);
});
