import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {renderHome} from './dwdg-one-home.mjs';

const today='2026-10-03';
const t=(en,id)=>en;
function fixture() {
  const task=(id,fields={})=>({id,title:`Task ${id}`,workspaceId:'consulting',projectId:'co-project',ownerId:'demo-admin',status:'todo',targetDate:'',...fields});
  return {
    projects:[{id:'co-project',workspaceId:'consulting',title:'Consulting study',status:'active',leadId:'co-arya'},
      {id:'co-review',workspaceId:'consulting',title:'Output review',status:'review',leadId:'demo-admin'},
      {id:'hr-project',workspaceId:'hr',title:'Private HR project',status:'review',leadId:'hr-alya'}],
    tasks:[task('overdue',{targetDate:'2026-10-01',priority:'high'}),task('today',{targetDate:today,status:'progress'}),
      task('soon',{targetDate:'2026-10-10'}),task('near',{targetDate:'2026-10-04'}),task('undated'),
      task('completed',{status:'done',completedAt:'2026-10-02T10:00:00Z'}),task('legacy-completed',{status:'done'}),
      task('colleague',{ownerId:'co-nadia',targetDate:today}),task('foreign',{workspaceId:'hr',projectId:'hr-project',targetDate:today})],
    blockers:[{id:'co-blocker',workspaceId:'consulting',projectId:'co-project',title:'Waiting for the agreed brief',resolved:false},
      {id:'resolved',workspaceId:'consulting',projectId:'co-review',title:'Resolved blocker must stay absent',resolved:true},
      {id:'hr-blocker',workspaceId:'hr',projectId:'hr-project',title:'Private HR blocker',resolved:false}],
    events:[{id:'event-1',workspaceId:'hr',kind:'task.created',title:'Private HR event'}]
  };
}
function documentFor(state,options={}) {
  const window=new Window(),html=renderHome({state,workspaceId:'consulting',actorId:'demo-admin',t,language:'en',today,...options});
  window.document.write(`<html><body class="one-preview">${html}</body></html>`);
  return {window,document:window.document,html};
}

test('Home shows only the selected actor owned open task queue and derives due groups from actual dates',async()=>{
  const {window,document}=documentFor(fixture());
  try{
    const assigned=[...document.querySelectorAll('.one-home-assigned [data-home-task-id]')].map(row=>row.dataset.homeTaskId);
    assert.deepEqual(assigned,['overdue','today','near','soon','undated']);assert.equal(document.querySelector('.one-home-assigned .one-home-section-heading > span').textContent,'5 tasks');
    assert.ok(!assigned.includes('colleague'));assert.ok(!assigned.includes('completed'));assert.ok(!assigned.includes('legacy-completed'));
    assert.deepEqual([...document.querySelectorAll('.one-home-work-group h3')].map(heading=>heading.textContent),['Overdue','Today','Upcoming','No date']);
    assert.equal(document.querySelectorAll('.one-home-attention .one-home-task--attention').length,1);
  }finally{await window.happyDOM.close();}
});
test('Home attention includes only unresolved scoped project blockers and genuine review states',async()=>{
  const {window,document,html}=documentFor(fixture());try{
    assert.ok(document.querySelector('.one-home-attention [data-action="home-open-project"][data-id="co-project"]'));
    assert.ok(document.querySelector('.one-home-attention [data-action="home-open-project"][data-id="co-review"]'));
    assert.match(html,/Waiting for the agreed brief/);assert.doesNotMatch(html,/Private HR|Resolved blocker must stay absent/);
    assert.equal(document.querySelector('.one-home-attention-count').textContent,'1');
  }finally{await window.happyDOM.close();}
});
test('nonadministrator attention stays related to owned tasks or project leadership',async()=>{
  const state=fixture();state.tasks.push({id:'member-work',title:'Member responsibility',workspaceId:'consulting',projectId:'co-project',ownerId:'co-nadia',targetDate:'',status:'todo'});
  const {window,document,html}=documentFor(state,{actorId:'co-nadia'});try{
    const ids=[...document.querySelectorAll('.one-home-assigned [data-home-task-id]')].map(row=>row.dataset.homeTaskId);assert.deepEqual(ids,['colleague','member-work']);
    assert.ok(!document.querySelector('.one-home-attention [data-id="co-review"]'));assert.doesNotMatch(html,/Private HR/);
  }finally{await window.happyDOM.close();}
});
test('Today agenda uses all-day task deadlines and leaves unavailable meetings honest',async()=>{
  const {window,document,html}=documentFor(fixture());try{
    assert.equal(document.querySelectorAll('.one-home-agenda [data-home-task-id]').length,1);assert.equal(document.querySelector('.one-home-task--agenda').dataset.homeTaskId,'today');
    assert.equal(document.querySelector('.one-home-task--agenda .one-home-due').textContent,'All day');assert.match(document.querySelector('.one-home-meetings').textContent,/No meetings recorded/);
    assert.doesNotMatch(html,/Busy|Free|9:00|09:00|productivity|health score|motivat|Stay focused|great things|daily average/i);
    assert.ok(document.querySelector('[data-action="home-open-schedule"]'));
  }finally{await window.happyDOM.close();}
});
test('empty assignments are explicit and every empty section has a usable canonical destination',async()=>{
  const {window,document,html}=documentFor({projects:[],tasks:[],blockers:[],events:[]});try{
    assert.match(html,/No open tasks are assigned to you/);assert.match(html,/No overdue tasks/);assert.equal(document.querySelectorAll('[data-home-task-id]').length,0);
    assert.ok(document.querySelector('.one-home-assigned [data-action="home-work"][data-owner="me"]'));assert.ok(document.querySelector('.one-home-attention [data-action="home-work"]'));
    assert.doesNotMatch(html,/100%|Busy|all clear|Keep going|You're doing|health score/i);
  }finally{await window.happyDOM.close();}
});
test('Home completion and open actions point to the canonical IDs without writes or duplicate DOM IDs',async()=>{
  const state=fixture(),original=JSON.stringify(state);const {window,document}=documentFor(state);try{
    for(const check of document.querySelectorAll('[data-action="home-complete"]'))assert.ok(state.tasks.some(task=>task.id===check.dataset.id&&task.workspaceId==='consulting'&&task.ownerId==='demo-admin'&&task.status!=='done'));
    const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);assert.equal(new Set(ids).size,ids.length);assert.equal(JSON.stringify(state),original);
    assert.equal(document.querySelector('.one-home-related .one-progress > div').textContent.replace(/\s+/g,' ').trim(),'2 / 8 tasks completed25%');
  }finally{await window.happyDOM.close();}
});
test('restricted or missing context uses a neutral label and does not expose foreign resource metadata',async()=>{
  const state=fixture();state.tasks.push({id:'unknown-context',title:'Owned task with restricted context',workspaceId:'consulting',projectId:'hr-project',ownerId:'demo-admin',status:'todo',targetDate:'',resourceId:'foreign-resource'});
  const resources={resources:[{id:'foreign-resource',workspaceId:'hr',title:'Private resource password registry',archived:false}]};
  const {window,document,html}=documentFor(state,{resources});try{
    const owned=document.querySelector('.one-home-assigned [data-home-task-id="unknown-context"]');assert.ok(owned);assert.match(owned.textContent,/Project unavailable/);assert.equal(owned.querySelector('[data-action="home-open-project"]').disabled,true);
    assert.doesNotMatch(html,/Private HR project|Private resource password registry/);
  }finally{await window.happyDOM.close();}
});
test('Indonesian interface preserves record titles and uses the same counts and groups',async()=>{
  const {window,document,html}=documentFor(fixture(),{language:'id',t:(en,id)=>id});try{
    assert.equal(document.querySelector('h1').textContent,'Beranda');assert.equal(document.querySelector('.one-home-assigned .one-home-section-heading > span').textContent,'5 tugas');assert.match(html,/Task overdue/);assert.match(html,/Tenggat sepanjang hari/);assert.match(html,/Belum ada rapat tercatat/);
    assert.equal(document.querySelectorAll('.one-home-assigned [data-home-task-id]').length,5);
  }finally{await window.happyDOM.close();}
});

test('linked resource labels require the task workspace and project and an available project',async()=>{
  const state=fixture();state.tasks.find(task=>task.id==='today').resourceId='valid';state.tasks.find(task=>task.id==='near').resourceId='wrong-project';
  state.tasks.find(task=>task.id==='soon').resourceId='archived';state.tasks.push({id:'missing-project',title:'Task without available project',workspaceId:'consulting',projectId:'missing',ownerId:'demo-admin',status:'todo',resourceId:'missing-context'});
  const resources={resources:[
    {id:'valid',workspaceId:'consulting',projectId:'co-project',title:'Visible source note'},
    {id:'wrong-project',workspaceId:'consulting',projectId:'co-review',title:'Wrong project confidential note'},
    {id:'archived',workspaceId:'consulting',projectId:'co-project',title:'Archived source note',archived:true},
    {id:'missing-context',workspaceId:'consulting',projectId:'missing',title:'Unavailable project note'}
  ]};
  for(const language of ['en','id']){
    const {window,document,html}=documentFor(state,{resources,language,t:(en,id)=>language==='en'?en:id});try{
      assert.match(document.querySelector('.one-home-assigned [data-home-task-id="today"]').textContent,/Visible source note/);
      assert.doesNotMatch(html,/Wrong project confidential note|Archived source note|Unavailable project note/);
    }finally{await window.happyDOM.close();}
  }
});

test('English and Indonesian action labels cover normal, overflow and empty states with identical destinations',async()=>{
  const state=fixture();for(let index=0;index<5;index++){
    const projectId=`co-extra-${index}`;state.projects.push({id:projectId,workspaceId:'consulting',title:`Project ${index}`,leadId:'demo-admin',status:'review'});
    state.blockers.push({id:`blocker-${index}`,workspaceId:'consulting',projectId,title:`Blocker ${index}`,resolved:false});
    state.tasks.push({id:`extra-${index}`,workspaceId:'consulting',projectId:'co-project',ownerId:'demo-admin',status:'todo',title:`Task extra ${index}`,targetDate:index<4?'2026-10-01':today});
  }
  const english=documentFor(state),indonesian=documentFor(state,{language:'id',t:(en,id)=>id});try{
    const actions=document=>[...document.querySelectorAll('[data-action]')].map(button=>[button.dataset.action,button.dataset.id||'',button.dataset.group||'',button.dataset.owner||'']);
    assert.deepEqual(actions(english.document),actions(indonesian.document));
    assert.match(english.html,/View all overdue tasks|View affected projects|View projects/);
    assert.match(indonesian.html,/Lihat semua tugas terlambat|Lihat proyek terdampak|Lihat proyek/);
    for(const check of indonesian.document.querySelectorAll('[data-action="home-complete"]'))assert.ok(check.getAttribute('aria-label').startsWith('Selesaikan tugas: '));
    assert.doesNotMatch(indonesian.html,/Complete task|High priority|In progress|No date|tasks completed|Project is in review|Needs attention|Assigned to me|Related projects|All day/);
    assert.ok([...english.document.querySelectorAll('.one-home-work-group [data-action="home-work"]')].some(button=>button.textContent==='1 task'));
    for(const language of ['en','id']){
      const empty=documentFor({projects:[],tasks:[],blockers:[]},{language,t:(en,id)=>language==='en'?en:id});try{
        assert.match(empty.document.querySelector('.one-home-assigned').textContent,language==='en'?/Open My Work/:/Buka Pekerjaan saya/);
        assert.match(empty.document.querySelector('.one-home-meetings').textContent,language==='en'?/No meetings recorded/:/Belum ada rapat tercatat/);
      }finally{await empty.window.happyDOM.close();}
    }
  }finally{await english.window.happyDOM.close();await indonesian.window.happyDOM.close();}
});
