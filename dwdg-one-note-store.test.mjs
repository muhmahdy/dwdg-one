import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewStore} from './dwdg-one-preview-data.mjs';
import {createResourceStore,RESOURCE_KEY,safeResourceURL} from './dwdg-one-resources-data.mjs';

function environment() {
  const values=new Map([['dwdg-workspace-v1','preserved product records']]);
  let broken=false;
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>{if(broken)throw new Error('Quota');values.set(key,value);}};
  const projects=createPreviewStore(storage);
  const open=()=>createResourceStore(storage,{getProjectState:()=>projects.state});
  const store=open(),workspaceId='consulting',projectId='demo-consulting-1';
  return {values,storage,projects,store,workspaceId,projectId,open,setBroken:value=>{broken=value;}};
}
const note=(title,content,contentFormat)=>({kind:'note',title,content,contentFormat,parentId:'',ownerId:'',contributorIds:[]});
const fails=(fn,code)=>assert.throws(fn,error=>error.code===code);

test('old notes load without adding formats or modifying any saved bytes',()=>{
  const e=environment(),saved=e.values.get(RESOURCE_KEY),old=e.store.state.resources.find(row=>row.kind==='note');
  assert.equal(old.contentFormat,undefined);
  const reopened=e.open();assert.equal(reopened.warning,'');assert.equal(reopened.state.resources.find(row=>row.id===old.id).contentFormat,undefined);
  assert.equal(e.values.get(RESOURCE_KEY),saved);
  assert.equal(e.values.get('dwdg-workspace-v1'),'preserved product records');
});
test('format-only changes create exact revisions, survive reload and Undo restores the legacy format',()=>{
  const e=environment(),old=e.store.state.resources.find(row=>row.id==='demo-resource-consulting-2');
  const initial=e.store.state.revisions.filter(row=>row.resourceId===old.id).length;
  const formatted=e.store.saveResource(e.workspaceId,e.projectId,{...old,contentFormat:'markdown'},old.id);
  assert.equal(formatted.contentFormat,'markdown');assert.equal(formatted.updatedBy,'demo-admin');
  const revisions=e.open().state.revisions.filter(row=>row.resourceId===old.id);
  assert.equal(revisions.length,initial+1);assert.equal(revisions[0].contentFormat,undefined);
  assert.equal(revisions.at(-1).contentFormat,'markdown');assert.equal(revisions.at(-1).content,old.content);
  e.store.undo(e.workspaceId);assert.equal(e.store.state.resources.find(row=>row.id===old.id).contentFormat,undefined);
  assert.equal(e.store.state.revisions.filter(row=>row.resourceId===old.id).length,initial);
});
test('invalid note formats cannot change records, revisions or clear a draft',()=>{
  const e=environment(),key=`${e.workspaceId}:${e.projectId}`;
  e.store.saveUI({drafts:{[key]:{workspaceId:e.workspaceId,projectId:e.projectId,id:'',fields:{title:'Typed draft',content:'Kept text'}}}});
  const before=e.values.get(RESOURCE_KEY);
  fails(()=>e.store.saveResource(e.workspaceId,e.projectId,note('Typed draft','Kept text','html')),'format');
  assert.equal(e.values.get(RESOURCE_KEY),before);assert.equal(e.store.state.drafts[key].fields.content,'Kept text');
});
test('a failed Markdown save leaves typed text and acknowledged revisions unchanged',()=>{
  const e=environment(),input=note('Kept note','## Review\n\n**Typed** text with [source](https://example.com).','markdown');
  const before=e.values.get(RESOURCE_KEY);e.setBroken(true);
  fails(()=>e.store.saveResource(e.workspaceId,e.projectId,input),'storage');
  assert.equal(e.values.get(RESOURCE_KEY),before);assert.equal(input.contentFormat,'markdown');assert.match(input.content,/Typed/);
  e.setBroken(false);const saved=e.store.saveResource(e.workspaceId,e.projectId,input);assert.equal(e.open().state.resources.find(row=>row.id===saved.id).content,input.content);
});
test('link validation rejects control characters rather than silently rewriting a supplied URL',()=>{
  for(const value of ['https://example.com/\nsecret','https://example.com/\tsecret','https://example.com/\u0000secret'])fails(()=>safeResourceURL(value),'url');
  assert.equal(safeResourceURL('https://example.com/a?x=1&y=2#section'),'https://example.com/a?x=1&y=2#section');
});
test('note references preserve one canonical resource and exact revision provenance across reload',()=>{
  const e=environment(),target=e.store.state.resources.find(row=>row.id==='demo-resource-consulting-3'),count=e.store.state.resources.length;
  const saved=e.store.saveResource(e.workspaceId,e.projectId,note('Linked note',`See [output](resource:${target.id}) and [again](resource:${target.id}).`,'markdown'));
  assert.equal(e.store.state.resources.length,count+1);assert.deepEqual(saved.referenceIds,[target.id]);
  const reopened=e.open(),revision=reopened.state.revisions.find(row=>row.resourceId===saved.id);
  assert.deepEqual(revision.referenceIds,[target.id]);assert.equal(revision.contentFormat,'markdown');
  assert.deepEqual(reopened.state.resources.find(row=>row.id===target.id),target,'A reference cannot copy or change target responsibility');
});
test('new foreign, missing and self references are rejected before writing',()=>{
  const e=environment(),before=e.values.get(RESOURCE_KEY);
  for(const id of ['demo-resource-hr-2','missing-id'])fails(()=>e.store.saveResource(e.workspaceId,e.projectId,note('Bad link',`[text](resource:${id})`,'markdown')),'reference');
  assert.equal(e.values.get(RESOURCE_KEY),before);
  const existing=e.store.state.resources.find(row=>row.id==='demo-resource-consulting-2');
  fails(()=>e.store.saveResource(e.workspaceId,e.projectId,{...existing,contentFormat:'markdown',content:`[self](resource:${existing.id})`},existing.id),'reference');
  assert.equal(e.values.get(RESOURCE_KEY),before);
});
test('an already saved reference remains editable after target archive and Undo preserves it',()=>{
  const e=environment(),target=e.store.state.resources.find(row=>row.id==='demo-resource-consulting-3');
  const saved=e.store.saveResource(e.workspaceId,e.projectId,note('Kept context',`[context](resource:${target.id})`,'markdown'));
  e.store.archive(e.workspaceId,target.id);
  e.store.saveResource(e.workspaceId,e.projectId,{...saved,content:saved.content+'\n\nClarification.'},saved.id);
  assert.deepEqual(e.open().state.resources.find(row=>row.id===saved.id).referenceIds,[target.id]);
  e.store.undo(e.workspaceId);assert.equal(e.store.state.resources.find(row=>row.id===saved.id).content,saved.content);
  assert.equal(e.store.state.resources.find(row=>row.id===target.id).archived,true);
});
test('references can point to another allowed project without moving or copying its resource',()=>{
  const e=environment(),other=e.projects.saveProject(e.workspaceId,{title:'Second reference project',purpose:'',leadId:'',startDate:'',targetDate:''});
  const target=e.store.saveResource(e.workspaceId,other.id,{kind:'folder',title:'Reference folder',parentId:'',ownerId:'',contributorIds:[]});
  const saved=e.store.saveResource(e.workspaceId,e.projectId,note('Cross-project brief',`[folder](resource:${target.id})`,'markdown'));
  assert.deepEqual(saved.referenceIds,[target.id]);assert.equal(e.store.state.resources.find(row=>row.id===target.id).projectId,other.id);
});
const viewState=()=>({folderId:'',query:'campaign',kind:'all',selectedId:'',panel:'form',scroll:120});
test('note content, revision, draft removal and reader view acknowledge in one atomic write',()=>{
  const e=environment(),draftKey=`${e.workspaceId}:${e.projectId}`,viewKey=`${e.workspaceId}:*`;
  e.store.saveUI({drafts:{[draftKey]:{workspaceId:e.workspaceId,projectId:e.projectId,id:'',fields:{title:'Atomic note',content:'Kept content'}}},views:{[viewKey]:viewState()}});
  let writes=0;const original=e.storage.setItem;e.storage.setItem=(key,value)=>{writes++;original(key,value);};
  const saved=e.store.saveResource(e.workspaceId,e.projectId,note('Atomic note','Kept content','markdown'),'',{viewKey,viewState:viewState()});
  assert.equal(writes,1);const reopened=e.open();assert.equal(reopened.state.drafts[draftKey],undefined);
  assert.equal(reopened.state.views[viewKey].panel,'detail');assert.equal(reopened.state.views[viewKey].selectedId,saved.id);
  assert.equal(reopened.state.views[viewKey].noteReading,true);assert.equal(reopened.state.views[viewKey].query,'campaign');
});
test('failed atomic note/view write retains acknowledged bytes and recoverable draft',()=>{
  const e=environment(),draftKey=`${e.workspaceId}:${e.projectId}`,viewKey=`${e.workspaceId}:*`;
  e.store.saveUI({drafts:{[draftKey]:{workspaceId:e.workspaceId,projectId:e.projectId,id:'',fields:{title:'Unsaved note',content:'Typed content'}}},views:{[viewKey]:viewState()}});
  const before=e.values.get(RESOURCE_KEY);e.setBroken(true);
  fails(()=>e.store.saveResource(e.workspaceId,e.projectId,note('Unsaved note','Typed content','markdown'),'',{viewKey,viewState:viewState()}),'storage');
  assert.equal(e.values.get(RESOURCE_KEY),before);assert.equal(e.store.state.drafts[draftKey].fields.content,'Typed content');assert.equal(e.store.state.views[viewKey].panel,'form');
  assert.equal(e.store.state.resources.some(row=>row.title==='Unsaved note'),false);
});
test('note view transitions reject foreign keys and retain the owning project under another permitted context',()=>{
  const e=environment(),options={viewState:viewState()};
  for(const viewKey of ['hr:*','hr:demo-hr-1','consulting:unknown'])fails(()=>e.store.saveResource(e.workspaceId,e.projectId,note('Bad context','text','markdown'),'',{...options,viewKey}),'workspace');
  const other=e.projects.saveProject(e.workspaceId,{title:'Other context',purpose:'',leadId:'',startDate:'',targetDate:''});
  const saved=e.store.saveResource(e.workspaceId,other.id,note('Another project note','text','markdown'),'',{...options,viewKey:`${e.workspaceId}:${e.projectId}`});
  assert.equal(saved.projectId,other.id);assert.equal(e.open().state.views[`${e.workspaceId}:${e.projectId}`].formProjectId,other.id);
});
test('unsafe persisted revision URLs preserve unreadable bytes without reseeding or exposing a link',()=>{
  const e=environment(),snapshot=JSON.parse(e.values.get(RESOURCE_KEY));snapshot.revisions[0].url='javascript:alert(1)';
  const bytes=JSON.stringify(snapshot);e.values.set(RESOURCE_KEY,bytes);const reopened=e.open();
  assert.equal(reopened.warning,'corrupt');assert.equal(reopened.state.resources.length,0);assert.equal(e.values.get(RESOURCE_KEY),bytes);
  fails(()=>reopened.saveResource(e.workspaceId,e.projectId,note('Cannot overwrite','text','plain')),'corrupt');assert.equal(e.values.get(RESOURCE_KEY),bytes);
});
test('malformed optional draft fields protect saved bytes while old partial drafts remain readable',()=>{
  const e=environment(),key=`${e.workspaceId}:${e.projectId}`;
  e.store.saveUI({drafts:{[key]:{workspaceId:e.workspaceId,projectId:e.projectId,id:'',fields:{title:'Legacy partial draft'}}}});
  assert.equal(e.open().warning,'');
  const snapshot=JSON.parse(e.values.get(RESOURCE_KEY));
  for(const fields of [{contributorIds:'invalid array'},{content:42},{contentFormat:'html'},{referenceIds:{id:'bad'}}]){
    snapshot.drafts[key].fields={title:'Kept draft',...fields};
    const bytes=JSON.stringify(snapshot);e.values.set(RESOURCE_KEY,bytes);
    const reopened=e.open();assert.equal(reopened.warning,'corrupt');assert.equal(e.values.get(RESOURCE_KEY),bytes);
    fails(()=>reopened.saveResource(e.workspaceId,e.projectId,note('Cannot overwrite','text','plain')),'corrupt');
  }
});
