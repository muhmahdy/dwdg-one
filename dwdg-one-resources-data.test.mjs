import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewStore,PREVIEW_KEY,WORKSPACES,PEOPLE} from './dwdg-one-preview-data.mjs';
import {createResourceStore,RESOURCE_KEY,RESOURCE_KINDS,safeResourceURL,selectResources,resourceAncestors} from './dwdg-one-resources-data.mjs';

function environment() {
  const data=new Map([['dwdg-workspace-v1','preserve original bytes'],['dwdg-one-prd-v02','preserve planning revision']]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const projectStore=createPreviewStore(storage),store=createResourceStore(storage,{getProjectState:()=>projectStore.state});
  const workspaceId='consulting',projectId=projectStore.state.projects.find(row=>row.workspaceId===workspaceId).id;
  return {data,storage,projectStore,store,workspaceId,projectId,reload:()=>createResourceStore(storage,{getProjectState:()=>projectStore.state})};
}
const throwsCode=(fn,code)=>assert.throws(fn,error=>error.code===code);
const metadata=(kind,title,parentId='')=>({kind,title,parentId,description:'',content:'',url:'',ownerId:'',contributorIds:[],accessNote:'',contact:''});

test('private resource UI save is atomic with generated reader context and preserves other actor forms',()=>{
  const env=environment(),key=`${env.workspaceId}:${env.projectId}`,viewKey=`${env.workspaceId}:*`;
  const store=createResourceStore(env.storage,{actorId:'co-nadia',getProjectState:()=>env.projectStore.state});
  const fields=metadata('note','Private note');
  const privateUI={drafts:{[key]:{id:'',workspaceId:env.workspaceId,projectId:env.projectId,fields}},views:{[viewKey]:{folderId:'',query:'kept filter',kind:'all',selectedId:'',panel:'form',scroll:20}}};
  store.saveActorUI(privateUI);const before=store.state,bytes=env.data.get(RESOURCE_KEY),originalSet=env.storage.setItem;
  env.storage.setItem=()=>{throw Error('Quota');};
  throwsCode(()=>store.saveResource(env.workspaceId,env.projectId,fields,'',{preserveUI:true,actorUI:{...privateUI,drafts:{}},viewKey,viewState:privateUI.views[viewKey]}),'storage');
  assert.equal(store.state,before);assert.equal(env.data.get(RESOURCE_KEY),bytes);
  env.storage.setItem=originalSet;
  const row=store.saveResource(env.workspaceId,env.projectId,fields,'',{preserveUI:true,actorUI:{...privateUI,drafts:{}},viewKey,viewState:privateUI.views[viewKey]});
  assert.equal(row.createdBy,'co-nadia');assert.equal(store.state.events.at(-1).createdBy,'co-nadia');
  assert.deepEqual(store.state.drafts,before.drafts);assert.deepEqual(store.state.views,before.views);
  assert.equal(store.state.actorUI['co-nadia'].views[viewKey].selectedId,row.id);assert.equal(store.state.actorUI['co-nadia'].views[viewKey].noteReading,true);
  assert.deepEqual(createResourceStore(env.storage,{getProjectState:()=>env.projectStore.state}).state.actorUI['co-nadia'].drafts,{});
});

test('resource fixtures include each launch behavior in all six workspaces without touching product storage',()=>{
  const env=environment();for(const workspace of WORKSPACES){assert.deepEqual(new Set(env.store.state.resources.filter(row=>row.workspaceId===workspace.id).map(row=>row.kind)),new Set(Object.keys(RESOURCE_KINDS)));}
  assert.equal(env.data.get('dwdg-workspace-v1'),'preserve original bytes');assert.equal(env.data.get('dwdg-one-prd-v02'),'preserve planning revision');
  assert.equal(env.store.state.resources.length,42);assert.ok(env.data.has(RESOURCE_KEY));
});
test('three-level folder hierarchy rejects self, descendant and foreign parents and keeps IDs across rename/move/reload',()=>{
  const {store,workspaceId,projectId,reload}=environment(),first=store.saveResource(workspaceId,projectId,metadata('folder','A')),
    second=store.saveResource(workspaceId,projectId,metadata('folder','B',first.id)),third=store.saveResource(workspaceId,projectId,metadata('folder','C',second.id));
  assert.deepEqual(resourceAncestors(store.state.resources,third.id).map(row=>row.id),[first.id,second.id]);
  throwsCode(()=>store.saveResource(workspaceId,projectId,{...first,parentId:first.id},first.id),'hierarchy');
  throwsCode(()=>store.saveResource(workspaceId,projectId,{...first,parentId:third.id},first.id),'hierarchy');
  throwsCode(()=>store.saveResource(workspaceId,projectId,{...first,parentId:'demo-resource-hr-1'},first.id),'record');
  store.saveResource(workspaceId,projectId,{...second,title:'B renamed',parentId:''},second.id);
  const loaded=reload();assert.ok(loaded.state.resources.some(row=>row.id===second.id&&row.title==='B renamed'&&row.parentId===''));
  assert.equal(loaded.state.resources.find(row=>row.id===third.id).parentId,second.id);
});
test('resource search respects workspace/project scope and includes text, path and named responsibility',()=>{
  const {store,workspaceId,projectId}=environment();
  const assigned=selectResources(store.state,workspaceId,{projectId,query:'Nadia Putri'});assert.equal(assigned.length,1);assert.equal(assigned[0].kind,'note');
  assert.equal(selectResources(store.state,'hr',{query:'Nadia Putri'}).length,0);
  assert.equal(selectResources(store.state,workspaceId,{projectId,folderId:'demo-resource-consulting-1'}).length,3);
  assert.equal(selectResources(store.state,workspaceId,{folderId:'demo-resource-consulting-1'}).length,3,'Workspace-wide folder browsing must show its children');
  assert.ok(selectResources(store.state,workspaceId,{projectId,query:'agreed scope'}).some(row=>row.kind==='note'));
  assert.equal(selectResources(store.state,workspaceId,{projectId,kind:'template'}).length,1);
});
test('responsibility is explicit at child level and survives reload without changing canonical tasks',()=>{
  const {store,projectStore,workspaceId,projectId,reload}=environment(),beforeTasks=JSON.stringify(projectStore.state.tasks),parent=store.state.resources.find(row=>row.id==='demo-resource-consulting-1'),child=store.state.resources.find(row=>row.id==='demo-resource-consulting-2');
  store.saveResource(workspaceId,projectId,{...parent,ownerId:'co-nadia',contributorIds:[]},parent.id);
  const loaded=reload();assert.equal(loaded.state.resources.find(row=>row.id===child.id).ownerId,'co-arya');assert.equal(loaded.state.resources.find(row=>row.id===child.id).contributorIds.length,2);
  assert.equal(JSON.stringify(projectStore.state.tasks),beforeTasks);
  throwsCode(()=>store.saveResource(workspaceId,projectId,{...child,ownerId:'hr-alya'},child.id),'owner');
});
test('safe HTTPS links preserve meaningful query and reject dangerous schemes and embedded credentials',()=>{
  assert.equal(safeResourceURL('https://docs.google.com/document/d/abc/edit?usp=sharing#heading=h.x'),'https://docs.google.com/document/d/abc/edit?usp=sharing#heading=h.x');
  for(const url of ['javascript:alert(1)','data:text/plain,test','file:///C:/test','http://example.com','https://user:password@example.com/a',''])throwsCode(()=>safeResourceURL(url),'url');
});
test('1000-word notes have explicit saved revisions and independent unsaved draft text',()=>{
  const {store,workspaceId,projectId,reload}=environment(),text=Array.from({length:1000},(_,i)=>`word${i}`).join(' ');
  const note=store.saveResource(workspaceId,projectId,{...metadata('note','Long note'),content:text});
  const key=`${workspaceId}:${projectId}`;store.saveUI({drafts:{[key]:{workspaceId,projectId,id:note.id,fields:{title:'Long note',content:text+' unfinished'}}}});
  assert.equal(store.state.resources.find(row=>row.id===note.id).content,text);assert.equal(store.state.revisions.filter(row=>row.resourceId===note.id).length,1);
  let loaded=reload();assert.equal(loaded.state.drafts[key].fields.content,text+' unfinished');
  loaded.saveResource(workspaceId,projectId,{...note,content:text+' saved second version',changeNote:'Review clarification'},note.id);loaded=reload();
  assert.equal(loaded.state.revisions.filter(row=>row.resourceId===note.id).length,2);assert.equal(loaded.state.drafts[key],undefined);
  assert.equal(loaded.state.revisions.filter(row=>row.resourceId===note.id)[0].content,text);
});
test('quota failure is atomic and leaves every typed field available for a retry',()=>{
  const env=environment(),before=env.data.get(RESOURCE_KEY),input={...metadata('note','Failed note'),content:'Every typed word is kept'};
  env.storage.setItem=()=>{throw new Error('Quota exceeded');};throwsCode(()=>env.store.saveResource(env.workspaceId,env.projectId,input),'storage');
  assert.equal(env.data.get(RESOURCE_KEY),before);assert.equal(env.store.state.resources.some(row=>row.title==='Failed note'),false);assert.equal(input.content,'Every typed word is kept');
  env.storage.setItem=(key,value)=>env.data.set(key,value);const note=env.store.saveResource(env.workspaceId,env.projectId,input);assert.equal(note.content,input.content);
});
test('folder archive and Undo preserve descendant identities, revisions and responsibility',()=>{
  const {store,workspaceId}=environment(),folder=store.state.resources.find(row=>row.id==='demo-resource-consulting-1'),ids=['demo-resource-consulting-1','demo-resource-consulting-2','demo-resource-consulting-3','demo-resource-consulting-6'],before=JSON.stringify(store.state.resources.filter(row=>ids.includes(row.id)));
  assert.equal(store.archive(workspaceId,folder.id),4);assert.ok(store.state.resources.filter(row=>ids.includes(row.id)).every(row=>row.archived));
  assert.equal(selectResources(store.state,workspaceId,{query:'Project brief'}).length,0);store.undo(workspaceId);
  assert.equal(JSON.stringify(store.state.resources.filter(row=>ids.includes(row.id))),before);assert.ok(store.state.events.some(row=>row.type==='undo'));
});
test('pin/unpin never duplicates canonical resources and supports Undo',()=>{
  const {store,workspaceId}=environment(),count=store.state.resources.length,row=store.state.resources.find(row=>row.kind==='file'&&row.workspaceId===workspaceId);
  store.togglePin(workspaceId,row.id);assert.equal(store.state.resources.length,count);assert.equal(store.state.resources.find(item=>item.id===row.id).pinned,true);
  store.undo(workspaceId);assert.equal(store.state.resources.find(item=>item.id===row.id).pinned,false);
});
test('Undo cannot remove a resource referenced by canonical work',()=>{
  const {store,projectStore,workspaceId,projectId}=environment(),note=store.saveResource(workspaceId,projectId,metadata('note','Task context'));
  projectStore.createTask(workspaceId,{projectId,title:'Related task',resourceId:note.id,ownerId:'',requestId:'resource-test-1'});
  throwsCode(()=>store.undo(workspaceId),'dependent');assert.ok(store.state.resources.some(row=>row.id===note.id));
});
test('external link issues keep resource metadata and tasks; revisions never claim a frozen provider copy',()=>{
  const {store,workspaceId,projectId}=environment(),link=store.saveResource(workspaceId,projectId,{...metadata('file','Reviewed output'),url:'https://example.com/version-1.pdf',contact:'Resource owner'});
  const issue=store.reportIssue(workspaceId,link.id,'access','Provider declined access');assert.equal(store.state.issues.length,1);assert.ok(store.state.resources.some(row=>row.id===link.id));
  store.resolveIssue(workspaceId,issue.id);assert.equal(store.state.issues[0].resolved,true);
  store.undo(workspaceId);assert.equal(store.state.issues[0].resolved,false);store.undo(workspaceId);assert.equal(store.state.issues.length,0);
  const revision=store.state.revisions.find(row=>row.resourceId===link.id);assert.equal(revision.url,link.url);assert.equal(revision.approved,false);
});
test('resource export reconciles scoped records and labels missing provider contents',()=>{
  const {store,workspaceId,projectId}=environment(),result=store.export(workspaceId,projectId);assert.equal(result.resources.length,7);assert.ok(result.resources.every(row=>row.workspaceId===workspaceId&&row.projectId===projectId));
  assert.match(result.notice,/External file contents and provider permissions are not copied/);assert.equal(result.resources.filter(row=>row.kind==='note'||row.kind==='meeting').length,2);
});
test('stale tabs reject writes instead of overwriting the latest saved resources',()=>{
  const env=environment(),stale=env.reload();env.store.saveResource(env.workspaceId,env.projectId,metadata('note','Latest'));
  const before=env.data.get(RESOURCE_KEY);throwsCode(()=>stale.saveResource(env.workspaceId,env.projectId,metadata('note','Stale')),'conflict');assert.equal(env.data.get(RESOURCE_KEY),before);
});
test('malformed saved hierarchy is preserved and never reseeded',()=>{
  const env=environment(),saved=JSON.parse(env.data.get(RESOURCE_KEY));saved.resources[0].parentId=saved.resources[0].id;const raw=JSON.stringify(saved);env.data.set(RESOURCE_KEY,raw);
  const broken=env.reload();assert.equal(broken.warning,'corrupt');assert.equal(env.data.get(RESOURCE_KEY),raw);throwsCode(()=>broken.saveResource(env.workspaceId,env.projectId,metadata('note','No overwrite')),'corrupt');
});
test('sibling title collisions require an explicit override; different branches can repeat titles',()=>{
  const {store,workspaceId,projectId}=environment();store.saveResource(workspaceId,projectId,metadata('note','Repeated'));
  throwsCode(()=>store.saveResource(workspaceId,projectId,metadata('note','Repeated')),'collision');store.saveResource(workspaceId,projectId,{...metadata('note','Repeated'),allowDuplicate:true});
  store.saveResource(workspaceId,projectId,metadata('note','Repeated','demo-resource-consulting-1'));
  assert.equal(store.state.resources.filter(row=>row.title==='Repeated').length,3);
});
