import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const helper = read('./persistence.js');
const work = read('../screens/work.js');
const handin = read('../screens/handin.js');
const pins = read('../screens/pins.js');
const app = read('./app.js');
const undoActions = app.slice(app.indexOf('const snapDb ='), app.indexOf('// ---------- back and forward'));
const coreStatus = work.slice(work.indexOf('function setStatus('), work.indexOf('\nObject.assign(ACT,', work.indexOf('function setStatus(')));
const signoffStatus = work.slice(work.indexOf('const setStatus0 = setStatus;'), work.indexOf('\nfunction signoffField'));

function setup() {
  const context = vm.createContext({URL, setTimeout: () => 0});
  vm.runInContext(`
    let db = {tasks:[{id:'t1',title:'Example',owner:'member',createdBy:'member',status:'todo',doneAt:null,reviewer:null,submissions:[]}], updates:[], changes:[], pins:{member:[]}, projects:[{id:'p1',name:'Project'}]};
    const ui = {insp:null,menu:null,form:null,hi:null};
    const session = {me:'member'};
    const UNDO = {u:[],r:[]};
    const ACT = {toggle:()=>{},'op-done':()=>{},'set-status':()=>{},'review-approve':()=>{},'review-return':()=>{}};
    const ON_INPUT = {};
    const events = [], effects = [];
    let fail = false, writes = 0, stored = JSON.stringify(db), renders = 0;
    function save() { writes++; if(fail) return false; stored=JSON.stringify(db); return true; }
    function render() { renders++; }
    function renderLayer() {}
    function showToast(text) { events.push(text); }
    function toast(text,undo) { if(undo) { UNDO.u.push({msg:text,undo}); UNDO.r=[]; } showToast(text); }
    function rerender() { if(!save()) return false; render(); return true; }
    function L(text,vars) { let out=text; if(vars) for(const k in vars) out=out.replaceAll('{'+k+'}',vars[k]); return out; }
    const UIEffects={complete:(...args)=>effects.push(['complete',...args]),pin:(...args)=>effects.push(['pin',...args])};
    const me=()=>({id:session.me}), first=id=>id, today=()=>'2026-10-12', nowStamp=()=>'2026-10-12T14:00';
    const taskOf=id=>db.tasks.find(t=>t.id===id), projOf=id=>db.projects.find(p=>p.id===id), taskDiv=()=> 'sng';
    const canEditTask=()=>true, isDone=t=>t.status==='done', isSummary=()=>false;
    const signerFor=t=>t.signer||null, canSignOff=()=>session.me==='reviewer';
    const notify=(to,type,ref)=>db.updates.push({to,type,ref,read:false});
    const logChange=(...args)=>db.changes.push({args});
    const TASK_ST={todo:['Not started'],doing:['In progress'],review:['In review'],done:['Completed']};
    const $=()=>null, $$=()=>[], uid=prefix=>prefix+'1', paintHistBtns=()=>{};
    const canSeeProject=()=>true, calmPins=()=>[], visibleDivs=()=>['sng'];
  `, context);
  vm.runInContext(helper, context);
  vm.runInContext(undoActions, context);
  vm.runInContext(coreStatus + '\n' + signoffStatus, context);
  return {context, run: code => vm.runInContext(code, context), json: code => JSON.parse(vm.runInContext(`JSON.stringify(${code})`, context))};
}

test('completion commits once before feedback and only celebrates actual done', () => {
  const env=setup();
  assert.equal(env.run('setStatus(taskOf("t1"),"done")'), true);
  assert.equal(env.run('writes'),1);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'done');
  assert.deepEqual(env.json('effects'),[['complete','t1',null]]);
  assert.equal(env.run('UNDO.u.length'),1);
  env.run('setStatus(taskOf("t1"),"doing")');
  assert.equal(env.run('effects.length'),1);
});

test('failed completion restores task, notifications, history and identity', () => {
  const env=setup();
  env.run('const originalTask=taskOf("t1"), originalTasks=db.tasks; fail=true;');
  assert.equal(env.run('setStatus(taskOf("t1"),"done")'),false);
  assert.equal(env.run('taskOf("t1")===originalTask && db.tasks===originalTasks'),true);
  assert.equal(env.run('taskOf("t1").status'),'todo');
  assert.deepEqual(env.json('[db.updates,db.changes,UNDO.u,effects]'),[[],[],[],[]]);
  assert.deepEqual(env.json('events'),['Could not save. Your changes are still here. Please try again.']);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'todo');
  assert.equal(env.run('renders'),0, 'failed write must keep live draft fields and focus intact');
});

test('requested completion requiring review produces no completion effect', () => {
  const env=setup();
  env.run('taskOf("t1").signer="reviewer"; setStatus(taskOf("t1"),"done")');
  assert.equal(env.run('writes'),1);
  assert.equal(env.run('taskOf("t1").status'),'review');
  assert.deepEqual(env.json('effects'),[]);
  assert.equal(env.run('db.updates.length'),1);
});

test('failed signoff restores fields modified before the base status function', () => {
  const env=setup();
  env.run('Object.assign(taskOf("t1"),{status:"review",signer:"reviewer",reviewer:"reviewer"}); session.me="reviewer"; fail=true;');
  assert.equal(env.run('setStatus(taskOf("t1"),"done")'),false);
  assert.equal(env.run('taskOf("t1").status'),'review');
  assert.equal(env.run('Object.hasOwn(taskOf("t1"),"signedBy")'),false);
  assert.equal(env.run('Object.hasOwn(taskOf("t1"),"doneBy")'),false);
  assert.deepEqual(env.json('[db.updates,db.changes,effects,UNDO.u]'),[[],[],[],[]]);
});

test('failed hi-accept keeps the assessment draft and original submission identities', () => {
  const env=setup();
  vm.runInContext(handin,env.context);
  env.run(`Object.assign(taskOf('t1'),{status:'review',signer:'reviewer',reviewer:'reviewer',submissions:[{id:'sub1',by:'member',at:'2026-10-12T13:00',links:[],note:'Original'}]});
    session.me='reviewer'; ui.hi={id:'t1',rating:'excellent',comment:'Keep my feedback',links:[],note:''};
    const submission=taskOf('t1').submissions[0], draft=ui.hi; fail=true;`);
  assert.equal(env.run('ACT["hi-accept"]({},"t1")'),false);
  assert.equal(env.run('ui.hi===draft && taskOf("t1").submissions[0]===submission'),true);
  assert.equal(env.run('ui.hi.comment'),'Keep my feedback');
  assert.equal(env.run('ui.hi.rating'),'excellent');
  assert.equal(env.run('Object.hasOwn(submission,"review") || Object.hasOwn(taskOf("t1"),"rating")'),false);
  assert.equal(env.run('taskOf("t1").status'),'review');
  assert.deepEqual(env.json('[db.updates,db.changes,effects,UNDO.u]'),[[],[],[],[]]);
  assert.equal(env.run('events.length'),1);
});

test('hand-in failure keeps entered links and avoids adding a submission or review notice', () => {
  const env=setup();
  vm.runInContext(handin,env.context);
  env.run(`taskOf('t1').signer='reviewer'; ui.hi={id:'t1',links:['https://example.com/work'],note:'Draft note'}; fail=true;`);
  assert.equal(env.run('ACT["hand-in"]({dataset:{}},"t1")'),false);
  assert.deepEqual(env.json('ui.hi.links'),['https://example.com/work']);
  assert.equal(env.run('ui.hi.note'),'Draft note');
  assert.equal(env.run('taskOf("t1").status'),'todo');
  assert.deepEqual(env.json('[taskOf("t1").submissions,db.updates,db.changes,UNDO.u,effects]'),[[],[],[],[],[]]);
});

test('pin failure retains pin array and open context; success runs one effect', () => {
  const env=setup();
  vm.runInContext(pins,env.context);
  env.run('const originalPins=db.pins.member; ui.menu={type:"res"}; fail=true;');
  assert.equal(env.run('togglePin("project","p1")'),false);
  assert.equal(env.run('db.pins.member===originalPins'),true);
  assert.deepEqual(env.json('db.pins.member'),[]);
  assert.equal(env.run('ui.menu.type'),'res');
  assert.deepEqual(env.json('effects'),[]);
  env.run('fail=false; togglePin("project","p1")');
  assert.deepEqual(env.json('effects'),[['pin','project','p1']]);
  assert.deepEqual(env.json('JSON.parse(stored).pins.member'),[{k:'project',id:'p1'}]);
});

test('failed Undo-style transaction restores both stacks and references held by callbacks', () => {
  const env=setup();
  env.run(`const heldTask=taskOf('t1'); heldTask.status='done';
    const entry={msg:'Completed',undo:()=>{heldTask.status='todo'; rerender();}};
    UNDO.u.push(entry); fail=true;`);
  assert.equal(env.run(`DBCommit.run(()=>{const entry=UNDO.u.pop(); entry.undo(); UNDO.r.push({msg:entry.msg}); save(); showToast('Undone');},{effects:false})`),false);
  assert.equal(env.run('UNDO.u[0]===entry && taskOf("t1")===heldTask'),true);
  assert.equal(env.run('heldTask.status'),'done');
  assert.equal(env.run('UNDO.r.length'),0);
  assert.deepEqual(env.json('events'),['Could not save. Your changes are still here. Please try again.']);
});

test('nested transactions make one write and restore function hooks even after a thrown mutation', () => {
  const env=setup();
  env.run('const originalSave=save, originalRender=render, originalToast=toast;');
  assert.throws(()=>env.run(`DBCommit.run(()=>{taskOf('t1').status='done'; DBCommit.run(()=>{save();}); throw new Error('mutation failure');})`),/mutation failure/);
  assert.equal(env.run('save===originalSave && render===originalRender && toast===originalToast'),true);
  assert.equal(env.run('taskOf("t1").status'),'todo');
  assert.equal(env.run('writes'),0);
  env.run('DBCommit.run(()=>{DBCommit.run(()=>{taskOf("t1").status="doing";save();render();});save();})');
  assert.equal(env.run('writes'),1);
});

test('actual completion Undo/redo keeps history and storage correct across failed and successful writes', () => {
  const env=setup();
  env.run('const heldTask=taskOf("t1"), heldTasks=db.tasks; setStatus(heldTask,"done"); const completionEntry=UNDO.u[0]; fail=true;');
  assert.equal(env.run('shUndo()'),false);
  assert.equal(env.run('UNDO.u[0]===completionEntry && UNDO.r.length===0'),true);
  assert.equal(env.run('taskOf("t1")===heldTask && db.tasks===heldTasks'),true);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'done');
  env.run('fail=false');
  assert.equal(env.run('shUndo()'),true);
  assert.deepEqual(env.json('[UNDO.u.length,UNDO.r.length,taskOf("t1").status]'),[0,1,'todo']);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'todo');
  env.run('const redoEntry=UNDO.r[0]; fail=true');
  assert.equal(env.run('shRedo()'),false);
  assert.equal(env.run('UNDO.r[0]===redoEntry && UNDO.u.length===0'),true);
  assert.equal(env.run('taskOf("t1")===heldTask && db.tasks===heldTasks'),true);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'todo');
  env.run('fail=false');
  assert.equal(env.run('shRedo()'),true);
  assert.deepEqual(env.json('[UNDO.u.length,UNDO.r.length,taskOf("t1").status]'),[1,0,'done']);
  assert.equal(env.run('taskOf("t1")===heldTask && db.tasks===heldTasks'),true);
  assert.equal(env.run('JSON.parse(stored).tasks[0].status'),'done');
  assert.equal(env.run('writes'),5, 'each attempted transaction writes exactly once');
  assert.equal(env.run('effects.length'),1, 'Undo/redo must not replay completion effects');
  assert.deepEqual(env.json('events'),['Task completed','Could not save. Your changes are still here. Please try again.','Undone: Task completed','Could not save. Your changes are still here. Please try again.','Redone: Task completed']);
});

test('actual pin Undo/redo failures are atomic and subsequent older task Undo retains its live object', () => {
  const env=setup();
  vm.runInContext(pins,env.context);
  env.run('const heldTask=taskOf("t1"); setStatus(heldTask,"done"); togglePin("project","p1"); const pinEntry=UNDO.u[1]; fail=true;');
  assert.equal(env.run('shUndo()'),false);
  assert.equal(env.run('UNDO.u[1]===pinEntry'),true);
  assert.equal(env.run('db.pins.member.length'),1);
  env.run('fail=false');
  assert.equal(env.run('shUndo()'),true);
  assert.deepEqual(env.json('JSON.parse(stored).pins.member'),[]);
  env.run('fail=true');
  assert.equal(env.run('shRedo()'),false);
  assert.deepEqual(env.json('db.pins.member'),[]);
  env.run('fail=false');
  assert.equal(env.run('shRedo()'),true);
  assert.equal(env.run('db.pins.member.length'),1);
  assert.equal(env.run('taskOf("t1")===heldTask'),true);
  assert.equal(env.run('shUndo()'),true);
  assert.equal(env.run('shUndo()'),true);
  assert.equal(env.run('taskOf("t1")===heldTask'),true);
  assert.equal(env.run('taskOf("t1").status'),'todo', 'older completion callback must still modify the visible task');
  assert.deepEqual(env.json('JSON.parse(stored).pins.member'),[]);
  assert.deepEqual(env.json('effects'),[['complete','t1',null],['pin','project','p1']]);
  assert.equal(env.run('events.filter(x=>x.startsWith("Redone:")).length'),1);
  assert.equal(env.run('events.filter(x=>x.startsWith("Could not save")).length'),2);
});

test('history copies restore removed records and nested members using their original references', () => {
  const env=setup();
  env.run(`taskOf('t1').submissions.push({id:'sub1',note:'Original'}); const task=taskOf('t1'), submissions=task.submissions, submission=submissions[0];
    const state=snapDb(); db.tasks=[]; task.submissions=[]; submission.note='Changed'; restoreDb(state);`);
  assert.equal(env.run('taskOf("t1")===task && task.submissions===submissions && task.submissions[0]===submission'),true);
  assert.equal(env.run('submission.note'),'Original');
  assert.equal(env.run('JSON.parse(stored).tasks[0].submissions[0].note'),'Original');
});
