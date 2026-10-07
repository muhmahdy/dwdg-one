import test from 'node:test';
import assert from 'node:assert/strict';
import {todayISO, taskDateGroup, selectDailyTasks, groupDailyTasks, completionActivity} from './dwdg-one-daily.mjs';
import {PEOPLE, createPreviewStore} from './dwdg-one-preview-data.mjs';

const today = '2026-10-03';
const people = [{id:'arya',name:'Arya Pratama',workspaceId:'consulting'}, {id:'other',name:'Private HR person',workspaceId:'hr'}];
function fixture() {
  const task = (id, fields = {}) => ({id,workspaceId:'consulting',projectId:'p1',ownerId:'arya',title:`Task ${id}`,notes:'',status:'todo',targetDate:'',...fields});
  return {
    projects:[{id:'p1',workspaceId:'consulting',title:'Client research'}, {id:'p2',workspaceId:'consulting',title:'Handover'}, {id:'hrp',workspaceId:'hr',title:'Private HR project'}],
    tasks:[task('late',{targetDate:'2026-10-02',notes:'Field interview'}), task('now',{targetDate:today}),
      task('soon',{targetDate:'2026-10-04',projectId:'p2'}), task('undated',{ownerId:''}),
      task('done',{status:'done',targetDate:'2026-10-01',completedAt:'2026-10-02T18:30:00Z'}),
      task('legacy',{status:'done',updatedAt:'2026-10-01T10:00:00Z'}),
      task('foreign',{workspaceId:'hr',projectId:'hrp',ownerId:'other',status:'done',completedAt:'2026-10-02T09:00:00Z'})]
  };
}

test('calendar today uses the chosen timezone across midnight and year boundaries', () => {
  const instant = new Date('2026-10-02T18:30:00Z');
  assert.equal(todayISO(instant), '2026-10-03');
  assert.equal(todayISO(instant, 'UTC'), '2026-10-02');
  assert.equal(todayISO(new Date('2026-12-31T18:00:00Z')), '2027-01-01');
  assert.throws(() => todayISO(new Date('invalid')), RangeError);
  assert.throws(() => todayISO(instant, 'Invalid/Zone'), RangeError);
});

test('done always groups as completed and invalid or absent due dates stay undated', () => {
  assert.equal(taskDateGroup({status:'done',targetDate:'2026-10-01'},today), 'completed');
  assert.equal(taskDateGroup({status:'todo',targetDate:'2026-10-02'},today), 'overdue');
  assert.equal(taskDateGroup({status:'progress',targetDate:today},today), 'today');
  assert.equal(taskDateGroup({status:'todo',targetDate:'2026-10-04'},today), 'upcoming');
  for (const targetDate of ['',undefined,'2026-02-30']) assert.equal(taskDateGroup({status:'todo',targetDate},today), 'undated');
});

test('daily selectors and ordered groups preserve each canonical object and ID once', () => {
  const state = fixture(), before = structuredClone(state);
  const selected = selectDailyTasks(state,{workspaceId:'consulting',today});
  const groups = groupDailyTasks(selected,today);
  assert.deepEqual(groups.map(group=>group.id),['overdue','today','upcoming','undated','completed']);
  assert.deepEqual(groups.map(group=>group.tasks.length),[1,1,1,1,2]);
  assert.equal(new Set(groups.flatMap(group=>group.tasks.map(task=>task.id))).size, selected.length);
  for (const group of groups) {
    const filtered = selectDailyTasks(state,{workspaceId:'consulting',dateGroup:group.id,today});
    assert.deepEqual(filtered.map(task=>task.id),group.tasks.map(task=>task.id));
    for (const task of group.tasks) assert.equal(task,state.tasks.find(row=>row.id===task.id));
  }
  assert.deepEqual(state,before);
});

test('me resolves the actual actor and unassigned never substitutes a person', () => {
  const state=fixture();
  assert.equal(selectDailyTasks(state,{workspaceId:'consulting',ownerId:'me',actorId:'arya',today}).length,5);
  assert.equal(selectDailyTasks(state,{workspaceId:'consulting',ownerId:'me',today}).length,0);
  assert.deepEqual(selectDailyTasks(state,{workspaceId:'consulting',ownerId:'unassigned',today}).map(task=>task.id),['undated']);
  assert.equal(selectDailyTasks(state,{workspaceId:'hr',ownerId:'arya',today}).length,0);
});

test('project, status, date and query filters reconcile without cross-workspace metadata', () => {
  const state=fixture(),options={workspaceId:'consulting',people,today};
  assert.deepEqual(selectDailyTasks(state,{...options,projectId:'p2',dateGroup:'upcoming'}).map(task=>task.id),['soon']);
  assert.deepEqual(selectDailyTasks(state,{...options,status:'done'}).map(task=>task.id),['done','legacy']);
  assert.deepEqual(selectDailyTasks(state,{...options,query:'INTERVIEW'}).map(task=>task.id),['late']);
  assert.equal(selectDailyTasks(state,{...options,query:'Arya Pratama'}).length,5);
  assert.equal(selectDailyTasks(state,{...options,query:'Client research'}).length,5);
  assert.equal(selectDailyTasks(state,{...options,query:'Private HR'}).length,0);
  assert.equal(selectDailyTasks(state,{...options,projectId:'hrp'}).length,0);
});

test('an explicitly supplied wildcard demo person is searchable without importing foreign membership', () => {
  const state=fixture();state.tasks[0].ownerId='demo-admin';
  const supplied=[...people,{id:'demo-admin',name:'Demo administrator',workspaceId:'*'}];
  const options={workspaceId:'consulting',today,query:'Demo administrator'};
  assert.deepEqual(selectDailyTasks(state,{...options,people:supplied}).map(task=>task.id),['late']);
  assert.equal(selectDailyTasks(state,{...options,people}).length,0);
  assert.equal(selectDailyTasks(state,{...options,people:[...people,{id:'demo-admin',name:'Demo administrator',workspaceId:'hr'}]}).length,0);
  assert.equal(selectDailyTasks(state,{...options,people:supplied,query:'Private HR person'}).length,0);
});

test('generated demo-admin assignments are discoverable by the supplied roster name', () => {
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const {state}=createPreviewStore(storage),person=PEOPLE.find(row=>row.id==='demo-admin');
  const selected=selectDailyTasks(state,{workspaceId:'consulting',ownerId:'me',actorId:person.id,people:PEOPLE,query:person.name,today});
  assert.ok(selected.length>0);
  assert.ok(selected.every(task=>task.ownerId===person.id&&task.workspaceId==='consulting'));
  for(const task of selected)assert.equal(task,state.tasks.find(row=>row.id===task.id));
});

test('completion bins use saved instants in the selected timezone and disclose legacy history', () => {
  const state=fixture(),activity=completionActivity(state,{workspaceId:'consulting',today,days:3});
  assert.deepEqual(activity.buckets.map(bucket=>bucket.date),['2026-10-01','2026-10-02','2026-10-03']);
  assert.deepEqual(activity.buckets.map(bucket=>bucket.count),[null,null,1]);
  assert.deepEqual(activity.buckets[2].taskIds,['done']);
  assert.equal(activity.buckets[2].partial,true);
  assert.equal(activity.unknownCompleted,1);
  assert.deepEqual(activity.unknownTaskIds,['legacy']);
  assert.equal(activity.knownCompleted,1);
  assert.equal(activity.average,null);
  assert.equal(activity.basis.observedDays,0);
  assert.ok(activity.buckets.every(bucket=>!bucket.observed));
  const utc=completionActivity(state,{workspaceId:'consulting',today,days:3,timezone:'UTC'});
  assert.deepEqual(utc.buckets[1].taskIds,['done']);
});

test('empty history gives unavailable bins and average rather than observed zeros', () => {
  const activity=completionActivity({tasks:[]},{workspaceId:'consulting',today,days:7});
  assert.equal(activity.buckets.length,7);
  assert.ok(activity.buckets.every(bucket=>bucket.count===null&&!bucket.observed&&bucket.taskIds.length===0));
  assert.equal(activity.average,null);
  assert.equal(activity.unknownCompleted,0);
  assert.deepEqual(activity.basis,{kind:'recorded-completions-only',timezone:'Asia/Jakarta',startDate:'2026-09-27',endDate:today,observedDays:0});
});

test('unknown timestamps never borrow due, creation or update dates', () => {
  const state=fixture();
  state.tasks=state.tasks.slice(0,1).flatMap(task=>[undefined,'bad','2026-10-02','2026-02-30T10:00:00Z'].map((completedAt,index)=>({...task,id:`invalid-${index}`,status:'done',completedAt,createdAt:'2026-10-02T10:00:00Z',updatedAt:'2026-10-02T10:00:00Z'})));
  const activity=completionActivity(state,{workspaceId:'consulting',today});
  assert.equal(activity.unknownCompleted,4);
  assert.equal(activity.knownCompleted,0);
  assert.ok(activity.buckets.every(bucket=>bucket.count===null));
});

test('reopen and deletion change current completion totals without touching saved events', () => {
  const state=fixture();state.events=[{id:'saved-event',kind:'task.completed',recordId:'done',at:'2026-10-02T18:30:00Z'}];
  const events=structuredClone(state.events);
  state.tasks.find(task=>task.id==='done').status='todo';
  let activity=completionActivity(state,{workspaceId:'consulting',today});
  assert.equal(activity.knownCompleted,0);
  state.tasks=state.tasks.filter(task=>task.id!=='legacy');
  activity=completionActivity(state,{workspaceId:'consulting',today});
  assert.equal(activity.unknownCompleted,0);
  assert.deepEqual(state.events,events);
});

test('activity is assignment/workspace scoped and excludes out-of-period or future bins', () => {
  const state=fixture();
  state.tasks.push({...state.tasks[4],id:'old',completedAt:'2026-09-01T10:00:00Z'}, {...state.tasks[4],id:'future',completedAt:'2026-10-10T10:00:00Z'});
  const activity=completionActivity(state,{workspaceId:'consulting',ownerId:'me',actorId:'arya',today,days:2});
  assert.equal(activity.knownCompleted,3);
  assert.deepEqual(activity.buckets.flatMap(bucket=>bucket.taskIds),['done']);
  assert.ok(!JSON.stringify(activity).includes('foreign'));
  assert.equal(completionActivity(state,{workspaceId:'consulting',ownerId:'unassigned',today}).knownCompleted,0);
});

test('invalid calendar bases or periods fail explicitly without mutating input', () => {
  const state=fixture(),before=structuredClone(state);
  assert.throws(()=>selectDailyTasks(state,{workspaceId:'consulting',today:'2026-02-30'}),RangeError);
  for(const days of [0,-1,2.5,367]) assert.throws(()=>completionActivity(state,{workspaceId:'consulting',today,days}),RangeError);
  assert.deepEqual(state,before);
});
