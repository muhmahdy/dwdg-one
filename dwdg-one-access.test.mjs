import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewAccess} from './dwdg-one-access.mjs';
import {createPreviewStore,PREVIEW_KEY,WORKSPACES} from './dwdg-one-preview-data.mjs';
import {createResourceStore,RESOURCE_KEY} from './dwdg-one-resources-data.mjs';

class MemoryStorage {
  constructor(){this.data=new Map([['dwdg-workspace-v1','untouched product'],['dwdg-project-extras-v1','untouched extras']]);this.writes=[];this.failWrite=false;}
  getItem(key){return this.data.get(key)??null;}
  setItem(key,value){if(this.failWrite)throw new Error('Quota');this.writes.push(key);this.data.set(key,value);}
}
const rights={project:{read:true,create:true,update:true,undo:true,export:true},task:{read:true,create:true,update:true,undo:true,export:true},resource:{read:true,create:true,update:true,undo:true,archive:true,pin:true,issue:true,export:true},blocker:{read:true,export:true}};
const settings=(extra={})=>({actorId:'co-arya',role:'member',workspaceIds:['consulting'],permissions:structuredClone(rights),...extra});
const projectFields=(title='Local project')=>({title,purpose:'A specific purpose',leadId:'co-arya',startDate:'',targetDate:''});
const noteFields=(title='Local note')=>({kind:'note',title,content:'Original text',contentFormat:'plain',description:'',ownerId:'co-arya',contributorIds:[],parentId:'',url:'',accessNote:'',contact:''});
const projectDraft=(title,id='')=>({projectId:id,fields:projectFields(title)});
const resourceDraft=(title,id='')=>({workspaceId:'consulting',projectId:'demo-consulting-1',id,fields:noteFields(title)});
const resourceView=(extra={})=>({folderId:'',query:'',kind:'all',selectedId:'',panel:'',scroll:0,...extra});
const deny=fn=>assert.throws(fn,e=>e.code==='access');
function setup(...args) {
  const config=args.length?args[0]:settings();
  const storage=new MemoryStorage(),actorId=config?.actorId||'demo-admin',raw=createPreviewStore(storage,{actorId}),rawResources=createResourceStore(storage,{actorId,getProjectState:()=>raw.state});
  const access=createPreviewAccess(config),store=access.wrapProjectStore(raw,{hasProjectDependents:id=>rawResources.state.resources.some(row=>row.projectId===id)}),resources=access.wrapResourceStore(rawResources,{getProjectState:()=>raw.state});
  return {storage,raw,rawResources,access,store,resources};
}

test('default administrator delegates current actions and preserves demo/product bytes without actor UI initialization',()=>{
  const {storage,raw,rawResources,access,store,resources}=setup(undefined);
  assert.equal(access.isDefault,true);assert.equal(access.actorId,'demo-admin');assert.equal(access.role,'admin');assert.deepEqual(access.visibleWorkspaces(),WORKSPACES);
  const bytes=storage.getItem(PREVIEW_KEY),resourceBytes=storage.getItem(RESOURCE_KEY),writes=storage.writes.length;
  assert.deepEqual(store.state,raw.state);assert.deepEqual(resources.state,rawResources.state);assert.equal(storage.writes.length,writes);assert.equal(storage.getItem(PREVIEW_KEY),bytes);assert.equal(storage.getItem(RESOURCE_KEY),resourceBytes);
  store.saveUI({drafts:{consulting:projectDraft('Admin unfinished')}});const saved=store.saveProject('consulting',projectFields());assert.equal(raw.state.views.consulting.selectedId,saved.id);assert.equal(raw.state.actorUI,undefined);
  assert.equal(storage.getItem('dwdg-workspace-v1'),'untouched product');assert.equal(storage.getItem('dwdg-project-extras-v1'),'untouched extras');assert.ok(storage.writes.every(key=>[PREVIEW_KEY,RESOURCE_KEY].includes(key)));
});

test('display rank never grants actions or additional workspaces and same-actor scope updates reject actor replacement',()=>{
  for(const role of ['member','lead','reviewer','vp','president','admin']){
    const {access,store,resources}=setup(settings({role,permissions:{project:{read:true},task:{read:true},resource:{read:true}}}));
    assert.equal(access.visibleWorkspaces().length,1);assert.equal(access.allowsWorkspace('finance'),false);assert.equal(store.state.projects.length,6);assert.equal(store.state.blockers.length,0);
    deny(()=>store.saveProject('consulting',projectFields()));deny(()=>resources.saveResource('consulting','demo-consulting-1',noteFields()));assert.equal(access.allowedFields('project',store.state.projects[0]).length,0);
    deny(()=>access.updateScope({actorId:'another-actor'}));
  }
});

test('workspace scope, parent scope and hidden IDs apply before rows, counts, blockers, events, revisions and issues',()=>{
  const {raw,rawResources,access,store,resources}=setup();
  raw.saveProject('finance',{...projectFields('Foreign private project'),leadId:'lf-intan'});
  rawResources.reportIssue('finance','demo-resource-finance-3','missing','Private missing-file details');
  rawResources.reportIssue('consulting','demo-resource-consulting-3','missing','Scoped details');
  access.updateScope({hiddenIds:{project:['demo-consulting-1'],task:['demo-consulting-2-task-1']}});
  assert.equal(store.state.projects.length,5);assert.ok(store.state.tasks.every(row=>row.projectId!=='demo-consulting-1'&&row.id!=='demo-consulting-2-task-1'));
  assert.ok(store.state.blockers.every(row=>row.projectId!=='demo-consulting-1'));assert.equal(resources.state.resources.length,0);assert.equal(resources.state.revisions.length,0);assert.equal(resources.state.issues.length,0);
  assert.ok(store.state.events.every(row=>row.workspaceId==='consulting'));assert.equal(resources.state.events.length,0);
  deny(()=>store.saveTask('consulting',{...raw.state.tasks[0],status:'todo'},raw.state.tasks[0].id));deny(()=>resources.export('finance'));
});

test('hidden folders recursively hide descendants and cannot be archived through a permitted parent',()=>{
  const {rawResources,access,resources}=setup();
  const nested=rawResources.saveResource('consulting','demo-consulting-1',{...noteFields('Nested folder'),kind:'folder',parentId:'demo-resource-consulting-1'});
  const child=rawResources.saveResource('consulting','demo-consulting-1',{...noteFields('Nested private note'),parentId:nested.id});
  access.updateScope({hiddenIds:{resource:[nested.id]}});assert.ok(!resources.state.resources.some(row=>row.id===nested.id||row.id===child.id));
  const before=JSON.stringify(rawResources.state);deny(()=>resources.archive('consulting','demo-resource-consulting-1'));assert.equal(JSON.stringify(rawResources.state),before);
  access.updateScope({hiddenIds:{resource:['demo-resource-consulting-1']}});assert.ok(resources.state.resources.every(row=>!row.parentId));
});

test('own task fields can update only the exact allowed changes; default values and direct scope spoofing cannot bypass guards',()=>{
  const permissions={...rights,task:{read:true,update:{ownOnly:true,fields:['status','notes']},undo:{ownOnly:true}}};
  const {raw,store,access}=setup(settings({permissions}));
  const own=raw.saveTask('consulting',{title:'Assigned task',projectId:'demo-consulting-2',ownerId:'co-arya'}),other=raw.state.tasks.find(row=>row.ownerId==='demo-admin');
  assert.deepEqual(access.allowedFields('task',own),['status','notes']);assert.deepEqual(access.allowedFields('task',other),[]);
  const saved=store.saveTask('consulting',{...own,status:'done',notes:'Actual progress'},own.id);assert.equal(saved.status,'done');assert.equal(saved.updatedBy,'co-arya');
  const bytes=JSON.stringify(raw.state);deny(()=>store.saveTask('consulting',{...saved,title:'Unauthorized rename'},saved.id));deny(()=>store.saveTask('consulting',{...other,status:'done'},other.id));deny(()=>store.saveTask('consulting',{...saved,ownerId:'co-nadia'},saved.id));assert.equal(JSON.stringify(raw.state),bytes);
  deny(()=>store.saveProject('finance',{...projectFields(),workspaceId:'consulting'}));deny(()=>store.saveTask('finance',{...own,workspaceId:'consulting'},own.id));
});

test('explicit project action grants do not expand to other projects in the same division',()=>{
  const permissions={...rights,project:{read:true,create:false,update:{projectIds:['demo-consulting-1']},undo:{projectIds:['demo-consulting-1']}},task:{read:true,create:{projectIds:['demo-consulting-1']},update:{projectIds:['demo-consulting-1']},undo:{projectIds:['demo-consulting-1']}}};
  const {store,access,raw}=setup(settings({role:'lead',permissions}));
  assert.equal(access.allowedFields('project',store.state.projects[0]),null);assert.deepEqual(access.allowedFields('project',store.state.projects[1]),[]);
  store.saveProject('consulting',{...projectFields(),title:'Authorized brief'},'demo-consulting-1');deny(()=>store.saveProject('consulting',projectFields(),'demo-consulting-2'));
  const own=store.createTask('consulting',{title:'Within grant',projectId:'demo-consulting-1',ownerId:'co-arya'});deny(()=>store.saveTask('consulting',{...own,projectId:'demo-consulting-2'},own.id));deny(()=>store.createTask('consulting',{title:'Outside grant',projectId:'demo-consulting-2'}));
  assert.ok(raw.state.tasks.some(row=>row.id===own.id));
});

test('bulk checks every selected canonical record and Undo checks the actual full top entry without skipping it',()=>{
  const permissions={...rights,task:{read:true,update:{ownOnly:true,fields:['status','notes']},undo:{ownOnly:true}}};
  const {raw,store,storage}=setup(settings({permissions}));
  const a=raw.saveTask('consulting',{title:'My A',projectId:'demo-consulting-2',ownerId:'co-arya'}),b=raw.saveTask('consulting',{title:'My B',projectId:'demo-consulting-2',ownerId:'co-arya'}),other=raw.state.tasks.find(row=>row.ownerId==='demo-admin');
  const writes=storage.writes.length;deny(()=>store.saveTasks('consulting',[a.id,other.id],{status:'done'}));assert.equal(storage.writes.length,writes);
  store.saveTasks('consulting',[a.id,b.id],{status:'done'});assert.equal(store.canUndoTask('consulting'),true);store.undoTask('consulting');assert.equal(raw.state.tasks.find(row=>row.id===a.id).status,'todo');
  store.saveTask('consulting',{...raw.state.tasks.find(row=>row.id===a.id),status:'done'},a.id);raw.saveTask('consulting',{...other,status:'done'},other.id);
  assert.equal(store.canUndoTask('consulting'),false);deny(()=>store.undoTask('consulting'));assert.equal(raw.state.tasks.find(row=>row.id===a.id).status,'done');
});

test('Undo cannot reverse a metadata change outside the actor field policy or partially restore an inaccessible batch',()=>{
  const {raw,store,access}=setup(settings({permissions:{...rights,task:{read:true,update:{ownOnly:true,fields:['status']},undo:true}}}));
  const task=raw.saveTask('consulting',{title:'Own task',projectId:'demo-consulting-2',ownerId:'co-arya'});raw.saveTask('consulting',{...task,title:'Admin changed title'},task.id);assert.equal(store.canUndoTask('consulting'),false);deny(()=>store.undoTask('consulting'));
  const a=raw.saveTask('consulting',{title:'Batch A',projectId:'demo-consulting-2',ownerId:'co-arya'}),b=raw.saveTask('consulting',{title:'Batch B',projectId:'demo-consulting-2',ownerId:'co-arya'});raw.saveTasks('consulting',[a.id,b.id],{status:'done'});
  access.updateScope({hiddenIds:{task:[b.id]}});assert.equal(store.canUndoTask('consulting'),false);assert.equal(store.state.taskUndo.consulting.entries.some(entry=>entry.kind==='batch'),false);
});

test('resource export scopes all rows and revisions and direct issue/pin/move/reference actions obey live scope',()=>{
  const {resources,rawResources,access,storage}=setup();access.updateScope({hiddenIds:{resource:['demo-resource-consulting-3']}});
  const exported=resources.export('consulting');assert.ok(!exported.resources.some(row=>row.id==='demo-resource-consulting-3'));assert.ok(exported.revisions.every(row=>exported.resources.some(resource=>resource.id===row.resourceId)));
  const writes=storage.writes.length;deny(()=>resources.togglePin('consulting','demo-resource-consulting-3'));deny(()=>resources.reportIssue('consulting','demo-resource-consulting-3','missing'));deny(()=>resources.saveResource('consulting','demo-consulting-1',{...noteFields(),contentFormat:'markdown',content:'[Private](resource:demo-resource-consulting-3)'}));assert.equal(storage.writes.length,writes);
  resources.togglePin('consulting','demo-resource-consulting-2');assert.equal(resources.canUndo('consulting'),true);access.updateScope({permissions:{...rights,resource:{read:true,update:true,undo:true}}});assert.equal(resources.canUndo('consulting'),false);deny(()=>resources.undo('consulting'));
  assert.equal(rawResources.state.resources.find(row=>row.id==='demo-resource-consulting-3').archived,false);
});

test('custom project drafts and preferences are private; saved record and draft removal use one engine commit',()=>{
  const {raw,store,storage}=setup();raw.saveUI({drafts:{consulting:projectDraft('Admin private draft')},views:{consulting:{panel:'form',query:'admin query'}}});
  assert.deepEqual(store.state.drafts,{});assert.deepEqual(store.state.views,{});
  store.saveUI({drafts:{consulting:projectDraft('Actor draft')},views:{consulting:{panel:'form',query:'my query'}},preferences:{language:'id'}});
  assert.equal(raw.state.drafts.consulting.fields.title,'Admin private draft');assert.equal(raw.state.preferences.language,'en');assert.equal(store.state.preferences.language,'id');
  const beforeWrites=storage.writes.length,saved=store.saveProject('consulting',projectFields('Saved actor project'));
  assert.equal(storage.writes.length,beforeWrites+1);assert.equal(raw.state.actorUI['co-arya'].drafts.consulting,undefined);assert.equal(raw.state.actorUI['co-arya'].views.consulting.selectedId,saved.id);assert.equal(raw.state.drafts.consulting.fields.title,'Admin private draft');assert.equal(saved.createdBy,'co-arya');
  const reload=createPreviewStore(storage,{actorId:'co-arya'}),access=createPreviewAccess(settings()),scoped=access.wrapProjectStore(reload);assert.equal(scoped.state.views.consulting.selectedId,saved.id);assert.equal(scoped.state.actorUI,undefined);
});

test('private Work drafts and selected tasks are removed atomically while legacy admin Work state remains intact',()=>{
  const {raw,store,storage}=setup();raw.saveWorkUI({contexts:{'consulting:all':{selectedIds:['admin-id']}},drafts:{'consulting:all':{taskId:'',fields:{title:'Admin unfinished',projectId:'demo-consulting-1'}}}});
  store.saveWorkUI({contexts:{'consulting:all':{selectedIds:[]}},drafts:{'consulting:all':{taskId:'',fields:{title:'My new task',projectId:'demo-consulting-2',ownerId:'co-arya'}}}});
  let count=storage.writes.length;const task=store.saveTask('consulting',{title:'My new task',projectId:'demo-consulting-2',ownerId:'co-arya'},'',{draftKey:'consulting:all'});assert.equal(storage.writes.length,count+1);assert.deepEqual(store.state.workUI.drafts,{});assert.equal(raw.state.workUI.drafts['consulting:all'].fields.title,'Admin unfinished');
  store.saveWorkUI({contexts:{'consulting:all':{selectedIds:[task.id]}},drafts:{}});count=storage.writes.length;store.saveTasks('consulting',[task.id],{status:'done'},{contextKey:'consulting:all'});assert.equal(storage.writes.length,count+1);assert.deepEqual(store.state.workUI.contexts['consulting:all'].selectedIds,[]);assert.deepEqual(raw.state.workUI.contexts['consulting:all'].selectedIds,['admin-id']);
});

test('resource save atomically removes only actor draft and returns generated note identity in actor reader view',()=>{
  const {rawResources,resources,storage}=setup();rawResources.saveUI({drafts:{'consulting:demo-consulting-1':resourceDraft('Admin note draft')}});
  resources.saveUI({drafts:{'consulting:demo-consulting-1':resourceDraft('Actor note draft')},views:{'consulting:*':resourceView({panel:'form',formProjectId:'demo-consulting-1'})}});
  const count=storage.writes.length,saved=resources.saveResource('consulting','demo-consulting-1',noteFields('Actor saved note'),'',{viewKey:'consulting:*',viewState:resources.state.views['consulting:*']});
  assert.equal(storage.writes.length,count+1);assert.deepEqual(resources.state.drafts,{});assert.equal(resources.state.views['consulting:*'].selectedId,saved.id);assert.equal(resources.state.views['consulting:*'].noteReading,true);assert.equal(rawResources.state.drafts['consulting:demo-consulting-1'].fields.title,'Admin note draft');assert.equal(saved.createdBy,'co-arya');
  const rawAgain=createResourceStore(storage,{actorId:'co-arya',getProjectState:()=>({projects:resources.state.resources.map(row=>({id:row.projectId,workspaceId:row.workspaceId}))})});assert.equal(rawAgain.state.actorUI['co-arya'].views['consulting:*'].selectedId,saved.id);
});

test('storage failure keeps canonical records and the exact actor draft together and retry commits once',()=>{
  const {storage,store,raw}=setup();store.saveUI({drafts:{consulting:projectDraft('Exact retained draft')}});const bytes=storage.getItem(PREVIEW_KEY);
  storage.failWrite=true;assert.throws(()=>store.saveProject('consulting',projectFields('Failed new record')),e=>e.code==='storage');assert.equal(storage.getItem(PREVIEW_KEY),bytes);assert.equal(store.state.drafts.consulting.fields.title,'Exact retained draft');assert.equal(raw.state.projects.some(row=>row.title==='Failed new record'),false);
  storage.failWrite=false;store.saveProject('consulting',projectFields('Failed new record'));assert.equal(store.state.drafts.consulting,undefined);assert.equal(raw.state.projects.filter(row=>row.title==='Failed new record').length,1);
});

test('actor switching never exposes another actor snapshot including to the default facade',()=>{
  const {storage,store,raw}=setup();store.saveUI({drafts:{consulting:projectDraft('Arya private draft')}});
  const otherRaw=createPreviewStore(storage,{actorId:'co-nadia'}),other=createPreviewAccess(settings({actorId:'co-nadia'})).wrapProjectStore(otherRaw);assert.deepEqual(other.state.drafts,{});assert.equal(other.state.actorUI,undefined);
  const admin=createPreviewAccess().wrapProjectStore(raw);assert.equal(admin.state.actorUI,undefined);assert.ok(!JSON.stringify(admin.state).includes('Arya private draft'));assert.ok(!JSON.stringify(other.state).includes('Arya private draft'));
});

test('narrowing and restoring scope retains hidden drafts even when another project draft shares its workspace key',()=>{
  const {store,access,raw}=setup();store.saveUI({drafts:{consulting:projectDraft('Hidden project text','demo-consulting-1')}});
  access.updateScope({hiddenIds:{project:['demo-consulting-1']}});assert.deepEqual(store.state.drafts,{});
  store.saveUI({drafts:{consulting:projectDraft('New visible project text','demo-consulting-2')}});assert.equal(store.state.drafts.consulting.fields.title,'New visible project text');assert.equal(raw.state.actorUI['co-arya'].drafts.consulting.fields.title,'Hidden project text');
  access.updateScope({hiddenIds:{project:[]}});assert.equal(store.state.drafts.consulting.fields.title,'Hidden project text');store.saveUI({drafts:{}});assert.equal(store.state.drafts.consulting.fields.title,'New visible project text');
});

test('hidden Work and Resource drafts are retained across collision, scope restoration and a new store instance',()=>{
  const {store,resources,access,storage,rawResources}=setup();
  store.saveWorkUI({contexts:{},drafts:{'consulting:all':{taskId:'demo-consulting-1-task-1',fields:{title:'Hidden Work text',projectId:'demo-consulting-1'}}}});
  resources.saveUI({drafts:{'consulting:demo-consulting-1':resourceDraft('Hidden note text','demo-resource-consulting-2')}});
  access.updateScope({hiddenIds:{task:['demo-consulting-1-task-1'],resource:['demo-resource-consulting-2']}});assert.deepEqual(store.state.workUI.drafts,{});assert.deepEqual(resources.state.drafts,{});
  store.saveWorkUI({contexts:{},drafts:{'consulting:all':{taskId:'',fields:{title:'Visible new Work',projectId:'demo-consulting-2'}}}});resources.saveUI({drafts:{'consulting:demo-consulting-1':resourceDraft('Visible new note')}});
  const reloaded=createPreviewStore(storage,{actorId:'co-arya'}),freshAccess=createPreviewAccess(settings()),freshStore=freshAccess.wrapProjectStore(reloaded),freshResources=freshAccess.wrapResourceStore(rawResources,{getProjectState:()=>reloaded.state});
  assert.equal(freshStore.state.workUI.drafts['consulting:all'].fields.title,'Hidden Work text');assert.equal(freshResources.state.drafts['consulting:demo-consulting-1'].fields.title,'Hidden note text');
  freshStore.saveWorkUI({contexts:{},drafts:{}});freshResources.saveUI({drafts:{}});assert.equal(freshStore.state.workUI.drafts['consulting:all'].fields.title,'Visible new Work');assert.equal(freshResources.state.drafts['consulting:demo-consulting-1'].fields.title,'Visible new note');
});

test('revoking all workspaces hides results but harmless private UI writes keep retained drafts valid',()=>{
  const {access,store,raw}=setup();store.saveUI({drafts:{consulting:projectDraft('Kept through revocation')},preferences:{language:'id'}});access.updateScope({workspaceIds:[]});
  assert.deepEqual(access.visibleWorkspaces(),[]);assert.equal(store.state.projects.length,0);assert.deepEqual(store.state.drafts,{});store.saveUI({preferences:store.state.preferences,drafts:{},views:{}});assert.equal(raw.warning,null);
  access.updateScope({workspaceIds:['consulting']});assert.equal(store.state.drafts.consulting.fields.title,'Kept through revocation');
});

test('private selection, folder path and return origins are neutralized on revocation without modifying stored context',()=>{
  const {resources,access,rawResources}=setup();resources.saveUI({views:{'consulting:*':resourceView({folderId:'demo-resource-consulting-1',selectedId:'demo-resource-consulting-2',panel:'detail',noteReading:true,noteReturns:[{workspaceId:'consulting',sourceId:'demo-resource-consulting-2',projectId:'demo-consulting-1'}],issueDraft:{details:'Private issue draft'}})}});
  access.updateScope({hiddenIds:{resource:['demo-resource-consulting-1']}});const visible=resources.state.views['consulting:*'];assert.equal(visible.selectedId,'');assert.equal(visible.folderId,'');assert.equal(visible.panel,'');assert.equal(visible.issueDraft,undefined);assert.equal(visible.noteReturns,undefined);assert.equal(rawResources.state.actorUI['co-arya'].views['consulting:*'].selectedId,'demo-resource-consulting-2');
});

test('created-project Undo honors canonical resource dependency boolean before any engine write',()=>{
  const {store,resources,storage}=setup();const project=store.saveProject('consulting',projectFields('Project with resource'));resources.saveResource('consulting',project.id,noteFields('Dependent note'));
  const writes=storage.writes.length;assert.equal(store.canUndo('consulting'),false);deny(()=>store.undo('consulting'));assert.equal(storage.writes.length,writes);assert.ok(store.state.projects.some(row=>row.id===project.id));
});
