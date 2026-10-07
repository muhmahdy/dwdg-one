import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewStore,PREVIEW_KEY,projectProgress} from './dwdg-one-preview-data.mjs';
function memory(){const data=new Map();let fail=false;return {getItem:k=>data.get(k)??null,setItem(k,v){if(fail)throw Error('quota');data.set(k,v);},set fail(value){fail=value;},data};}
const input={projectId:'demo-consulting-1',title:'Prepare the handover notes',ownerId:'co-arya',targetDate:'2026-10-14'};
test('resource task retries preserve one canonical task and its associations',()=>{
 const storage=memory(),store=createPreviewStore(storage),count=store.state.tasks.length;
 const task=store.createTask('consulting',{...input,resourceId:'demo-resource',requestId:'same-request'});
 const repeated=store.createTask('consulting',{...input,resourceId:'demo-resource',requestId:'same-request'});
 assert.equal(task.id,repeated.id);assert.equal(store.state.tasks.length,count+1);
 assert.equal(projectProgress(store.state,input.projectId).total,7);
 assert.equal(createPreviewStore(storage).state.tasks.at(-1).resourceId,'demo-resource');
 assert.throws(()=>store.createTask('consulting',{...input,resourceId:'different',requestId:'same-request'}),{code:'conflict'});
});
test('task completion and Undo restore exact identity and prior completion fields',()=>{
 const store=createPreviewStore(memory()),before=store.state.tasks.find(row=>row.projectId===input.projectId&&row.status==='progress');
 const completed=store.saveTask('consulting',{...before,status:'done'},before.id);
 assert.ok(completed.completedAt);assert.ok(!Number.isNaN(Date.parse(completed.completedAt)));
 store.undoTask('consulting');assert.deepEqual(store.state.tasks.find(row=>row.id===before.id),before);
 assert.equal(store.state.events.at(-1).kind,'task.undo');
});
test('editing a legacy completed task keeps its completion date unknown',()=>{
 const store=createPreviewStore(memory()),before=store.state.tasks.find(row=>row.status==='done');
 const updated=store.saveTask(before.workspaceId,{...before,title:'Clarified task title'},before.id);
 assert.equal(updated.completedAt,undefined);
});
test('task metadata rejects foreign workspace owners, projects and invalid dates',()=>{
 const store=createPreviewStore(memory());
 for(const value of [{...input,title:''},{...input,ownerId:'hr-alya'},{...input,projectId:'demo-hr-1'},{...input,startDate:'2026-10-20',targetDate:'2026-10-10'},{...input,targetDate:'2026-02-30'}])assert.throws(()=>store.createTask('consulting',value));
 assert.throws(()=>store.saveTask('hr',input,store.state.tasks[0].id),{code:'record'});
});
test('failed task save retains all canonical records and creates no false Undo/event',()=>{
 const storage=memory(),store=createPreviewStore(storage),before=structuredClone(store.state),bytes=storage.getItem(PREVIEW_KEY);storage.fail=true;
 assert.throws(()=>store.createTask('consulting',input),{code:'storage'});
 assert.deepEqual(store.state,before);assert.equal(storage.getItem(PREVIEW_KEY),bytes);
});
test('workspace task Undo stays isolated and pending drafts reload',()=>{
 const storage=memory(),store=createPreviewStore(storage),task=store.createTask('consulting',input);
 assert.equal(store.canUndoTask('hr'),false);assert.equal(store.undoTask('hr'),false);
 store.saveWorkUI({contexts:{'consulting:all':{query:'handover'}},drafts:{'consulting:all':{fields:{title:'Unfinished'}}}});
 const reloaded=createPreviewStore(storage);assert.equal(reloaded.state.workUI.drafts['consulting:all'].fields.title,'Unfinished');
 reloaded.undoTask('consulting');assert.ok(!reloaded.state.tasks.some(row=>row.id===task.id));
});
