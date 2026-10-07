import test from 'node:test';
import assert from 'node:assert/strict';
import {previewLegacyBackup,DIVISION_CODES,createBackend} from './shared-backend.mjs';
import {makeDivisionSeed,validateDivisionState} from './division-workspaces.mjs';

const a='10000000-0000-4000-8000-000000000001';
const b='10000000-0000-4000-8000-000000000002';
const sample={
  version:1,
  members:[{id:'me',name:'Mahdy'},{id:'r',name:'Raka'}],
  projects:[{
    id:'p',name:'Outreach',division:'Client Engagement',owner:'me',
    start:'2026-09-20',end:'2026-09-30'
  }],
  tasks:[{
    id:'t',projectId:'p',title:'Prepare proposal',assignee:'r',
    start:'2026-09-21',end:'2026-09-22',status:'todo'
  }],
  events:[{
    id:'e',projectId:'p',title:'Review',date:'2026-09-23',
    time:'15:30',duration:45
  }]
};

test('legacy preview maps the renamed division but requires explicit accounts',()=>{
  const missing=previewLegacyBackup(sample,{me:a});
  assert.equal(missing.ready,false);
  assert.deepEqual(missing.unmappedMembers,[{id:'r',name:'Raka'}]);
  const mapped=previewLegacyBackup(sample,{me:a,r:b});
  assert.equal(mapped.ready,true);
  assert.deepEqual(mapped.renamedDivisions,
    [{from:'Client Engagement',to:'External Engagement'}]);
  assert.deepEqual(mapped.divisions,['external_engagement']);
  assert.equal(DIVISION_CODES['Client Engagement'],'external_engagement');
});

test('legacy preview detects broken links and invalid dates before commit',()=>{
  const broken=structuredClone(sample);
  broken.tasks[0].dependsOn='missing';
  broken.projects[0].end='2026-02-30';
  const result=previewLegacyBackup(broken,{me:a,r:b});
  assert.equal(result.ready,false);
  assert.deepEqual(result.invalidLinks,['t']);
  assert.deepEqual(result.invalidRecords,['p']);
});

test('legacy preview rejects unrelated JSON',()=>{
  assert.throws(()=>previewLegacyBackup({projects:[]}),/Not a DWDG v1/);
});

function fakeBackend(rows,failRpc=false) {
  const calls=[];
  const client={
    auth:{getUser:async()=>({data:{user:{id:a,email:'member@example.test'}}})},
    from(table) {
      const builder={
        select(){return builder;},eq(){return builder;},order(){return builder;},
        limit(){return builder;},
        then(resolve,reject) {return Promise.resolve({data:rows[table]||[],error:null}).then(resolve,reject);},
        insert(){throw new Error('A commit must use the transaction RPC.');},
        update(){throw new Error('A commit must use the transaction RPC.');},
        delete(){throw new Error('A commit must use the transaction RPC.');}
      };
      return builder;
    },
    async rpc(name,args) {
      calls.push({name,args});
      return failRpc?{data:null,error:{message:'version conflict'}}:
        {data:{committed:true},error:null};
    }
  };
  return {calls,backend:createBackend({
    url:'https://example.test',publishableKey:'test-key',createClient:()=>client
  })};
}

test('core changes use one atomic RPC and preserve draft on conflict',async()=>{
  const p='10000000-0000-4000-8000-000000000003';
  const t='10000000-0000-4000-8000-000000000004';
  const rows={
    profiles:[{id:a,email:'member@example.test',full_name:'Mahdy'}],
    projects:[{id:p,version:3,title:'Workspace',division_code:'strategy_growth',
      lead_id:a,start_date:'2026-09-23',target_date:'2026-10-23',
      description:'',status:'active',visibility:'division'}],
    tasks:[{id:t,version:7,project_id:p,title:'Plan',assignee_id:a,
      start_date:'2026-09-23',due_date:'2026-09-24',status:'todo',priority:'medium'}],
    project_catalog:[{project_id:p,division_code:'strategy_growth',title:'Workspace',
      status:'active',target_date:'2026-10-23',visibility:'division'}]
  };
  const {backend,calls}=fakeBackend(rows,true);
  const service=await backend;
  const before=await service.loadCoreState();
  assert.equal(before.projectCatalog[0].name,'Workspace');
  rows.projects[0].version=4;
  await service.loadCoreState(); // Background refresh must not change an older draft's version.
  const after=structuredClone(before);
  after.projects[0].description='Updated';
  after.tasks[0].status='progress';
  await assert.rejects(service.commitCoreChange(before,after),/version conflict/);
  assert.equal(calls.length,1);
  assert.equal(calls[0].name,'commit_core_change');
  assert.equal(calls[0].args.p_change.projects.updated[0].version,3);
  assert.equal(calls[0].args.p_change.tasks.updated[0].version,7);
  assert.equal(before.projects[0].description,'');
  assert.equal(before.tasks[0].status,'todo');
});

test('requesters load safe budget choices without receiving ledger amounts',async()=>{
  const budget='10000000-0000-4000-8000-000000000005';
  const request='10000000-0000-4000-8000-000000000006';
  const seed=makeDivisionSeed('2026-09-23');
  const stageGroups={
    initiatives:['strategy_growth','initiative'],financeRequests:['legal_finance','financeRequests'],
    recruitment:['human_resource','recruitment'],onboarding:['human_resource','onboarding'],
    content:['marketing_comms_it','content'],itDelivery:['marketing_comms_it','itDelivery']
  };
  const workflow_stages=Object.entries(stageGroups).flatMap(([group,[division_code,entity_kind]])=>
    seed.stages[group].map((stage,index)=>({
      division_code,entity_kind,stage_code:stage.id,label:stage.label,position:index+1
    })));
  const rows={
    workflow_stages,finance_budgets:[],
    finance_budget_catalog:[{budget_id:budget,title:'Events',category:'Programs'}],
    finance_requests:[{id:request,version:2,title:'Venue deposit',
      request_kind:'expense',budget_id:budget,project_id:null,amount_idr:125000,
      category:'Programs',requester_id:a,approver_id:null,status:'submitted',
      document_url:null,description:'',due_date:null,updated_at:'2026-09-23T12:00:00Z'}]
  };
  const {backend}=fakeBackend(rows);
  const service=await backend;
  const state=await service.loadDivisionState();
  assert.equal(validateDivisionState(state).ok,true);
  assert.deepEqual(state.budgets,[{
    id:budget,title:'Events',projectId:'',category:'Programs',
    allocated:0,restricted:true
  }]);
  assert.equal(state.financeRequests[0].budgetId,budget);
});

test('division changes submit one transaction including secured approval transitions',async()=>{
  const request='10000000-0000-4000-8000-000000000007';
  const rows={finance_requests:[{
    id:request,version:4,title:'Review',request_kind:'legal',budget_id:null,
    project_id:null,amount_idr:0,category:'General',requester_id:a,
    approver_id:null,status:'draft',document_url:null,description:'',due_date:null,
    updated_at:'2026-09-23T12:00:00Z'
  }]};
  const {backend,calls}=fakeBackend(rows);
  const service=await backend;
  const before=await service.loadDivisionState();
  const after=structuredClone(before);
  after.financeRequests[0].stageId='submitted';
  after.initiatives.push({
    id:'10000000-0000-4000-8000-000000000008',title:'Research',
    horizon:'now',stageId:'proposed',priority:'high',ownerId:a
  });
  await service.commitDivisionState(before,after);
  assert.equal(calls.length,1);
  assert.equal(calls[0].name,'commit_division_change');
  assert.deepEqual(calls[0].args.p_change.operations.map(x=>x.action),
    ['create','transition']);
  assert.equal(calls[0].args.p_change.operations[1].version,4);
});
