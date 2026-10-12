// Shared mode never reads or writes the legacy dwdg-workspace-v1 key.
export const DIVISION_CODES = Object.freeze({
  'Strategy & Growth':'strategy_growth',
  'Legal & Finance':'legal_finance',
  'Human Resource':'human_resource',
  'Marketing, Communication & IT':'marketing_comms_it',
  'Marketing, Communication, & IT':'marketing_comms_it',
  'External Engagement':'external_engagement',
  'Client Engagement':'external_engagement',
  'Consulting':'consulting'
});
export const DIVISION_NAMES = Object.freeze({
  strategy_growth:'Strategy & Growth',
  legal_finance:'Legal & Finance',
  human_resource:'Human Resource',
  marketing_comms_it:'Marketing, Communication & IT',
  external_engagement:'External Engagement',
  consulting:'Consulting'
});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMAIN_TABLES=Object.freeze({
  initiatives:'initiatives',budgets:'finance_budgets',requests:'finance_requests',
  journeys:'hr_journeys',checklist:'hr_checklist_items',
  deliverables:'marketing_deliverables',stages:'workflow_stages'
});
const EXTRA_TABLES=Object.freeze({
  milestones:'milestones',blockers:'blockers',
  dependencies:'project_dependencies',decisions:'decisions',documents:'documents'
});
const DIVISION_GROUPS=Object.freeze({
  initiatives:['strategy_growth','initiative'],
  financeRequests:['legal_finance','financeRequests'],
  recruitment:['human_resource','recruitment'],
  onboarding:['human_resource','onboarding'],
  content:['marketing_comms_it','content'],
  itDelivery:['marketing_comms_it','itDelivery']
});
const DIVISION_AUX=Object.freeze({
  decisions:['strategy_growth','strategy_decision'],
  dependencies:['strategy_growth','strategy_dependency'],
  assignments:['human_resource','hr_assignment'],
  development:['human_resource','hr_development'],
  campaigns:['marketing_comms_it','marketing_campaign'],
  itDeliveries:['marketing_comms_it','marketing_it_delivery'],
  assets:['marketing_comms_it','marketing_asset']
});
const DIVISION_KEYS=Object.freeze([
  'initiatives','decisions','dependencies','budgets','financeRequests',
  'candidates','onboarding','assignments','development','campaigns',
  'deliverables','itDeliveries','assets'
]);
const CODE_TO_SLUG=Object.freeze({
  strategy_growth:'strategy-growth',legal_finance:'legal-finance',
  human_resource:'human-resource',marketing_comms_it:'marketing-comms-it',
  external_engagement:'external-engagement',consulting:'consulting'
});
function unwrap(result,action) {
  if(result?.error) throw new Error(action+': '+result.error.message);
  return result?.data;
}
function localParts(value) {
  const d=new Date(value);
  return {
    date:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'),
    time:[String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0')].join(':')
  };
}
function initials(value) {
  return String(value||'?').split(/\s+/).filter(Boolean).slice(0,2)
    .map(s=>s[0].toUpperCase()).join('');
}
function validUuid(value) {return UUID.test(String(value||''));}
function requireUuid(value,label) {
  if(!validUuid(value)) throw new Error(label+' needs a UUID. Use the legacy importer for old records.');
  return value;
}
function requireDay(value,label) {
  const day=String(value||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||
     Number.isNaN(Date.parse(day+'T12:00:00Z'))||
     new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)
    throw new Error(label+' needs a valid date.');
  return day;
}
function same(a,b) {return JSON.stringify(a)===JSON.stringify(b);}
function diff(before,after) {
  const old=new Map((before||[]).map(x=>[x.id,x]));
  const next=new Map((after||[]).map(x=>[x.id,x]));
  return {
    created:[...next.values()].filter(x=>!old.has(x.id)),
    updated:[...next.values()].filter(x=>old.has(x.id)&&!same(x,old.get(x.id))),
    deleted:[...old.values()].filter(x=>!next.has(x.id))
  };
}
function expectedVersion(snapshot,label) {
  // The edited snapshot owns the optimistic version. A later background load
  // must never make an older draft appear current.
  const version=snapshot?.serverVersion;
  if(!Number.isInteger(version)||version<1)
    throw new Error(label+' changed elsewhere. Your draft is preserved; refresh and retry.');
  return version;
}
function pick(row,columns) {
  return Object.fromEntries(columns.filter(key=>row[key]!==undefined).map(key=>[key,row[key]]));
}
export function getBackendConfig() {
  const config=globalThis.DWDG_BACKEND_CONFIG||{};
  const env=import.meta.env||{};
  return {
    url:config.url||env.VITE_SUPABASE_URL||'',
    publishableKey:config.publishableKey||env.VITE_SUPABASE_PUBLISHABLE_KEY||''
  };
}
export function previewLegacyBackup(data,memberMap={}) {
  if(!data||data.version!==1||!Array.isArray(data.members)||
     !Array.isArray(data.projects)||!Array.isArray(data.tasks)||
     !Array.isArray(data.events)) throw new Error('Not a DWDG v1 workspace backup.');
  const projectIds=new Set(data.projects.map(x=>x.id));
  const taskIds=new Set(data.tasks.map(x=>x.id));
  const taskProjectById=new Map(data.tasks.map(x=>[x.id,x.projectId]));
  const memberIds=new Set(data.members.map(x=>x.id));
  const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)
    &&!Number.isNaN(Date.parse(value+'T12:00:00Z'))
    &&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  const unique=rows=>new Set(rows.map(x=>x.id)).size===rows.length;
  const unknownDivisions=[...new Set(data.projects.map(x=>x.division)
    .filter(x=>!DIVISION_CODES[x]))];
  const unmappedMembers=data.members.filter(x=>!validUuid(memberMap[x.id]))
    .map(x=>({id:x.id,name:x.name}));
  const invalidLinks=[
    ...data.tasks.filter(x=>!projectIds.has(x.projectId)||
      !memberIds.has(x.assignee)||
      (x.dependsOn&&(!taskIds.has(x.dependsOn)||
        taskProjectById.get(x.dependsOn)!==x.projectId))).map(x=>x.id),
    ...data.projects.filter(x=>!memberIds.has(x.owner)).map(x=>x.id),
    ...data.events.filter(x=>x.projectId&&!projectIds.has(x.projectId)).map(x=>x.id)
  ];
  const invalidRecords=[
    ...data.projects.filter(x=>!x.id||!x.name?.trim()||
      !validDay(x.start)||!validDay(x.end)||x.end<x.start).map(x=>x.id||'project'),
    ...data.tasks.filter(x=>!x.id||!x.title?.trim()||
      !validDay(x.start)||!validDay(x.end)||x.end<x.start||
      !['todo','progress','blocked','done'].includes(x.status)).map(x=>x.id||'task'),
    ...data.events.filter(x=>!x.id||!x.title?.trim()||
      !validDay(x.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)||
      !Number.isInteger(x.duration)||x.duration<15||x.duration>480)
      .map(x=>x.id||'meeting'),
    ...[data.members,data.projects,data.tasks,data.events]
      .filter(rows=>!unique(rows)).map(()=>'duplicate IDs')
  ];
  return {
    counts:{members:data.members.length,projects:data.projects.length,
      tasks:data.tasks.length,meetings:data.events.length},
    divisions:[...new Set(data.projects.map(x=>DIVISION_CODES[x.division]).filter(Boolean))],
    renamedDivisions:data.projects.some(x=>x.division==='Client Engagement')
      ?[{from:'Client Engagement',to:'External Engagement'}]:[],
    unknownDivisions,unmappedMembers,invalidLinks,invalidRecords,
    ready:!unknownDivisions.length&&!unmappedMembers.length&&
      !invalidLinks.length&&!invalidRecords.length
  };
}

export async function createBackend(options={}) {
  const config={...getBackendConfig(),...options};
  if(!config.url||!config.publishableKey)
    throw new Error('Shared workspace is not configured. Set a Supabase URL and publishable key.');
  // Injection supports tests and the static preview. Vite resolves the package in shared mode.
  const createClient=config.createClient||(await import('@supabase/supabase-js')).createClient;
  const client=createClient(config.url,config.publishableKey,{
    auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
  });
  const query=(table)=>client.from(table);
  async function user() {return unwrap(await client.auth.getUser(),'Account')?.user||null;}
  async function getSession() {return unwrap(await client.auth.getSession(),'Session')?.session||null;}
  async function signInWithGoogle(redirectTo=globalThis.location?.href) {
    return unwrap(await client.auth.signInWithOAuth({
      provider:'google',options:{redirectTo}
    }),'Google sign-in');
  }
  async function signOut() {unwrap(await client.auth.signOut(),'Sign out');}
  function onAuthStateChange(callback) {
    const {data}=client.auth.onAuthStateChange(callback);
    return ()=>data.subscription.unsubscribe();
  }
  async function bootstrap() {
    const me=await user();
    if(!me) return null;
    const profile=unwrap(await query('profiles').select('*').eq('id',me.id).single(),'Profile');
    if(!profile?.active) throw new Error('Your DWDG account is inactive.');
    const [d,m,a]=await Promise.all([
      query('divisions').select('*').order('sort_order'),
      query('memberships').select('*').eq('user_id',me.id),
      query('finance_approvers').select('user_id').eq('user_id',me.id)
    ]);
    const divisions=unwrap(d,'Divisions'),memberships=unwrap(m,'Memberships');
    const approvers=unwrap(a,'Approvers');
    const admin=profile.global_role==='super_admin';
    const heads=memberships.filter(x=>x.role==='division_head').map(x=>x.division_code);
    return {
      user:me,profile,divisions,memberships,
      visibleDivisionCodes:divisions.map(x=>x.code),
      memberDivisionCodes:memberships.map(x=>x.division_code),
      canEditDivisionCodes:admin?divisions.map(x=>x.code):
        memberships.filter(x=>x.role!=='viewer').map(x=>x.division_code),
      headDivisionCodes:admin?divisions.map(x=>x.code):heads,
      canApproveFinance:admin||heads.includes('legal_finance')||approvers.length>0,
      canManageInvitations:admin
    };
  }
  async function listInvitations() {
    return unwrap(await query('invitations').select('*')
      .order('created_at',{ascending:false}),'Invitations');
  }
  async function listMembersWithAccess() {
    const results=await Promise.all([
      query('profiles').select('id,email,full_name,global_role,primary_division_code,active')
        .order('full_name'),
      query('memberships').select('user_id,division_code,role'),
      query('finance_approvers').select('user_id')
    ]);
    const [profiles,memberships,approvers]=results.map((result,index)=>
      unwrap(result,['Members','Memberships','Finance approvers'][index]));
    return {profiles,memberships,approvers};
  }
  async function createInvitation(input) {
    const email=String(input.email||'').trim().toLowerCase();
    if(!email.includes('@')) throw new Error('Enter a valid email address.');
    const me=await user();
    return unwrap(await query('invitations').upsert({
      email,global_role:input.globalRole||'member',
      primary_division_code:input.divisionCode||null,
      division_role:input.divisionRole||'member',
      expires_at:input.expiresAt||null,revoked_at:null,created_by:me?.id
    }).select().single(),'Invite member');
  }
  async function revokeInvitation(email) {
    return unwrap(await query('invitations').update({revoked_at:new Date().toISOString()})
      .eq('email',String(email).trim().toLowerCase()).select().single(),'Revoke invitation');
  }
  async function setMembership(userId,divisionCode,role) {
    return unwrap(await query('memberships').upsert({
      user_id:requireUuid(userId,'Member'),division_code:divisionCode,role
    }).select().single(),'Set membership');
  }
  async function removeMembership(userId,divisionCode) {
    return unwrap(await query('memberships').delete()
      .eq('user_id',userId).eq('division_code',divisionCode),'Remove membership');
  }
  async function setGlobalRole(userId,role,active=true) {
    return unwrap(await client.rpc('admin_set_profile_access',{
      p_user_id:requireUuid(userId,'Member'),
      p_global_role:role,p_active:Boolean(active)
    }),'Change member access');
  }
  async function setProfileName(fullName) {
    const me=await user();
    if(!me) throw new Error('Sign in first.');
    const name=String(fullName||'').trim();
    if(!name) throw new Error('Enter your name.');
    return unwrap(await query('profiles').update({full_name:name}).eq('id',me.id)
      .select('id,email,full_name').single(),'Update profile');
  }
  async function setFinanceApprover(userId,enabled) {
    requireUuid(userId,'Member');
    if(enabled) {
      const me=await user();
      return unwrap(await query('finance_approvers').upsert({
        user_id:userId,granted_by:me?.id
      }).select().single(),'Grant finance approval');
    }
    return unwrap(await query('finance_approvers').delete()
      .eq('user_id',userId),'Remove finance approval');
  }
  async function listBudgetSummary() {
    return unwrap(await query('finance_budget_summary').select('*')
      .order('title'),'Budget summary');
  }
  async function listNotifications() {
    return unwrap(await query('notifications').select('*')
      .order('created_at',{ascending:false}).limit(100),'Notifications');
  }
  async function markNotificationRead(id) {
    return unwrap(await query('notifications')
      .update({read_at:new Date().toISOString()})
      .eq('id',id).select().single(),'Mark notification read');
  }

  async function loadCoreState() {
    const me=await user();
    if(!me) throw new Error('Sign in to load the shared workspace.');
    const results=await Promise.all([
      query('profiles').select('id,email,full_name,active').order('full_name'),
      query('memberships').select('user_id,division_code,role').eq('user_id',me.id),
      query('projects').select('*').order('updated_at',{ascending:false}),
      query('tasks').select('*').order('due_date'),
      query('meetings').select('*').order('starts_at'),
      query('task_dependencies').select('task_id,depends_on_id'),
      query('activity_events').select('*').order('occurred_at',{ascending:false}).limit(100),
      query('project_catalog').select('*').order('target_date')
    ]);
    const [people,memberships,projects,tasks,meetings,links,activity,catalog]=results.map(
      (result,i)=>unwrap(result,['People','Memberships','Projects','Tasks','Meetings','Dependencies','Activity','Project catalog'][i]));
    const dependencyByTask=new Map(links.map(x=>[x.task_id,x.depends_on_id]));
    const self=people.find(x=>x.id===me.id);
    return {
      version:1,
      profile:{name:self?.full_name||me.email?.split('@')[0]||'Member',memberId:me.id},
      members:people.map(x=>({
        id:x.id,name:x.full_name||x.email.split('@')[0],
        initials:initials(x.full_name||x.email),active:x.active!==false
      })),
      memberships,
      projectCatalog:catalog.map(x=>({
        id:x.project_id,division:DIVISION_NAMES[x.division_code]||x.division_code,
        divisionCode:x.division_code,name:x.title,status:x.status,
        end:x.target_date||'',visibility:x.visibility
      })),
      projects:projects.map(x=>({
        id:x.id,name:x.title,division:DIVISION_NAMES[x.division_code]||x.division_code,
        serverVersion:x.version,
        owner:x.lead_id,start:x.start_date,
        end:x.target_date,description:x.description||'',
        color:Math.max(0,Object.keys(DIVISION_NAMES).indexOf(x.division_code))%4,
        status:x.status,visibility:x.visibility,nextMilestone:x.next_milestone||''
      })),
      tasks:tasks.map(x=>({
        id:x.id,projectId:x.project_id,title:x.title,assignee:x.assignee_id,
        serverVersion:x.version,
        start:x.start_date,end:x.due_date,
        status:x.status,priority:x.priority,description:x.description||'',
        dependsOn:dependencyByTask.get(x.id)||'',completedAt:x.completed_at?.slice(0,10)||null
      })),
      events:meetings.map(x=>{
        const start=localParts(x.starts_at);
        return {
          id:x.id,title:x.title,projectId:x.project_id||'',date:start.date,time:start.time,
          serverVersion:x.version,
          duration:x.ends_at?Math.round((new Date(x.ends_at)-new Date(x.starts_at))/60000):45,
          location:x.location||'',notes:x.notes||'',divisionCode:x.division_code||''
        };
      }),
      activity:activity.map(x=>({
        id:x.id,text:x.title,at:x.occurred_at,kind:x.kind,projectId:x.project_id
      }))
    };
  }
  function projectRow(x) {
    return {
      id:requireUuid(x.id,'Project'),
      division_code:DIVISION_CODES[x.division]||x.divisionCode,
      title:x.name,description:x.description||'',lead_id:requireUuid(x.owner,'Project lead'),
      status:x.status||'planned',visibility:x.visibility||'division',
      start_date:requireDay(x.start,'Project start'),
      target_date:requireDay(x.end,'Project target'),next_milestone:x.nextMilestone||null
    };
  }
  function taskRow(x) {
    return {
      id:requireUuid(x.id,'Task'),project_id:requireUuid(x.projectId,'Task project'),
      title:x.title,description:x.description||'',assignee_id:requireUuid(x.assignee,'Task assignee'),
      status:x.status,priority:x.priority,
      start_date:requireDay(x.start,'Task start'),due_date:requireDay(x.end,'Task due date'),
      completed_at:x.completedAt?x.completedAt+'T12:00:00Z':null
    };
  }
  function meetingRow(x) {
    const start=new Date(x.date+'T'+x.time+':00');
    const end=new Date(start.getTime()+(Number(x.duration)||45)*60000);
    return {
      id:requireUuid(x.id,'Event'),division_code:x.divisionCode||null,
      project_id:x.projectId||null,title:x.title,starts_at:start.toISOString(),
      ends_at:end.toISOString(),location:x.location||'',notes:x.notes||'',status:'scheduled'
    };
  }
  async function commitCoreChange(previous,next) {
    if(!same(previous.members,next.members))
      throw new Error('Manage accounts through invitations and memberships in shared mode.');
    if(!await user()) throw new Error('Sign in before saving.');
    const projects=diff(previous.projects,next.projects);
    const tasks=diff(previous.tasks,next.tasks);
    const meetings=diff(previous.events,next.events);
    const changed=(set,rowFn,table,beforeItems)=>({
      created:set.created.map(rowFn),
      updated:set.updated.map(item=>({
        row:rowFn(item),version:expectedVersion(
          beforeItems.find(old=>old.id===item.id),table)
      })),
      deleted:set.deleted.map(item=>({
        id:requireUuid(item.id,table),version:expectedVersion(item,table)
      }))
    });
    const dependencies=[];
    for(const x of [...tasks.created,...tasks.updated]) {
      const old=previous.tasks.find(y=>y.id===x.id);
      if(old&&old.dependsOn===x.dependsOn) continue;
      dependencies.push({
        task_id:requireUuid(x.id,'Task'),
        depends_on_id:x.dependsOn?requireUuid(x.dependsOn,'Dependency'):null
      });
    }
    const change={
      projects:changed(projects,projectRow,'projects',previous.projects),
      tasks:changed(tasks,taskRow,'tasks',previous.tasks),
      meetings:changed(meetings,meetingRow,'meetings',previous.events),
      dependencies
    };
    unwrap(await client.rpc('commit_core_change',{p_change:change}),
      'Save workspace changes');
    return loadCoreState();
  }
  async function listProjectCatalog() {
    return unwrap(await query('project_catalog').select('*').order('target_date'),'Project catalog');
  }
  async function listProjectAccess(projectId) {
    return unwrap(await query('project_access').select('project_id,user_id,role,granted_by')
      .eq('project_id',requireUuid(projectId,'Project')),'Project access');
  }
  async function setProjectAccess(projectId,userId,role) {
    if(!['lead','editor','viewer'].includes(role)) throw new Error('Choose a valid project role.');
    const me=await user();
    if(!me) throw new Error('Sign in before changing access.');
    return unwrap(await query('project_access').upsert({
      project_id:requireUuid(projectId,'Project'),user_id:requireUuid(userId,'Member'),
      role,granted_by:me.id
    }).select().single(),'Grant project access');
  }
  async function removeProjectAccess(projectId,userId) {
    return unwrap(await query('project_access').delete()
      .eq('project_id',requireUuid(projectId,'Project'))
      .eq('user_id',requireUuid(userId,'Member')),'Remove project access');
  }
  async function listProjects(code) {
    let q=query('projects').select('*').order('updated_at',{ascending:false});
    if(code) q=q.eq('division_code',code);
    return unwrap(await q,'Projects');
  }
  async function upsertProject(record) {
    return unwrap(await query('projects').upsert(record).select().single(),'Save project');
  }
  async function upsertTask(record) {
    return unwrap(await query('tasks').upsert(record).select().single(),'Save task');
  }
  async function listSchedule(from,to) {
    let q=query('meetings').select('*').order('starts_at');
    if(from) q=q.gte('starts_at',from);
    if(to) q=q.lte('starts_at',to);
    return unwrap(await q,'Schedule');
  }
  async function upsertEvent(record) {
    return unwrap(await query('meetings').upsert(record).select().single(),'Save meeting');
  }
  async function listDivisionRecords(type,code) {
    const table=DOMAIN_TABLES[type];
    if(!table) throw new Error('Unknown division record type.');
    let q=query(table).select('*');
    if(code&&type!=='checklist') q=q.eq('division_code',code);
    if(code&&type==='checklist') q=q.eq('journey_id',code);
    return unwrap(await q,'Load '+type);
  }
  async function upsertDivisionRecord(type,record) {
    const table=DOMAIN_TABLES[type];
    if(!table) throw new Error('Unknown division record type.');
    return unwrap(await query(table).upsert(record).select().single(),'Save '+type);
  }
  async function transitionApproval(id,status,expectedVersion,note='') {
    return unwrap(await client.rpc('transition_finance_request',{
      p_request_id:id,p_status:status,p_expected_version:expectedVersion,p_note:note
    }),'Decide request');
  }
  async function listDivisionWorkspace(code) {
    const [projects,events,stages]=await Promise.all([
      listProjects(code),
      query('activity_events').select('*').eq('division_code',code)
        .order('occurred_at',{ascending:false}).limit(30),
      query('workflow_stages').select('*').eq('division_code',code).order('position')
    ]);
    const type={
      strategy_growth:'initiatives',legal_finance:'requests',
      human_resource:'journeys',marketing_comms_it:'deliverables'
    }[code];
    return {
      projects,activity:unwrap(events,'Division activity'),
      stages:unwrap(stages,'Workflow stages'),
      records:type?await listDivisionRecords(type,code):[]
    };
  }
  async function listProjectExtras(projectId) {
    requireUuid(projectId,'Project');
    const names=['milestones','blockers','project_dependencies','decisions','documents'];
    const values=await Promise.all(names.map(name=>query(name).select('*')
      .eq('project_id',projectId)));
    return Object.fromEntries(names.map((name,i)=>[
      name==='project_dependencies'?'dependencies':name,
      unwrap(values[i],'Load '+name)
    ]));
  }
  async function upsertProjectExtra(type,record) {
    const table=EXTRA_TABLES[type];
    if(!table) throw new Error('Unknown project record type.');
    return unwrap(await query(table).upsert(record).select().single(),'Save '+type);
  }
  async function deleteProjectExtra(type,id) {
    const table=EXTRA_TABLES[type];
    if(!table) throw new Error('Unknown project record type.');
    if(type==='documents') {
      const document=unwrap(await query('documents').select('id,storage_path')
        .eq('id',id).single(),'Load document');
      if(document.storage_path) {
        unwrap(await client.storage.from('workspace-files')
          .remove([document.storage_path]),'Remove private file');
      }
    }
    let q=query(table).delete();
    if(type==='dependencies') q=q.eq('project_id',id.project_id)
      .eq('depends_on_id',id.depends_on_id);
    else q=q.eq('id',id);
    return unwrap(await q,'Delete '+type);
  }
  async function uploadDocument(record,file) {
    if(!(file instanceof Blob)) throw new Error('Choose a file.');
    if(file.size>10*1024*1024) throw new Error('File exceeds the 10 MB limit.');
    const id=record.id||crypto.randomUUID();
    const name=String(file.name||'attachment').replace(/[^a-zA-Z0-9._-]+/g,'-');
    const path=id+'/'+name;
    const doc=unwrap(await query('documents').insert({
      ...record,id,storage_path:path,external_url:null
    }).select().single(),'Create document entry');
    try {
      unwrap(await client.storage.from('workspace-files').upload(path,file,{
        upsert:false,contentType:file.type||'application/octet-stream'
      }),'Upload file');
    } catch(error) {
      // An upload can reach Storage even when its response fails. Keep the
      // metadata row if cleanup cannot confirm that the object is gone.
      try {unwrap(await client.storage.from('workspace-files')
        .remove([path]),'Remove incomplete upload');} catch {throw error;}
      await query('documents').delete().eq('id',id);
      throw error;
    }
    return doc;
  }
  async function getDocumentDownloadUrl(document,expiresIn=60) {
    if(!document?.storage_path) throw new Error('No uploaded file is linked.');
    return unwrap(await client.storage.from('workspace-files')
      .createSignedUrl(document.storage_path,expiresIn),'Open document').signedUrl;
  }
  async function search(value) {
    const term=String(value||'').trim().replace(/[%_]/g,'');
    if(term.length<2) return [];
    const specs=[
      ['project_catalog','title','project'],['tasks','title','task'],
      ['divisions','name','division'],['meetings','title','meeting'],
      ['documents','title','document'],['decisions','decision','decision'],
      ['blockers','title','blocker']
    ];
    const rows=await Promise.all(specs.map(async ([table,column,type])=>{
      const result=unwrap(await query(table).select('*').ilike(column,'%'+term+'%')
        .limit(8),'Search '+type);
      return result.map(row=>({type,row}));
    }));
    return rows.flat();
  }
  async function importLegacyBackup(data,memberMap,dryRun=true,importId=crypto.randomUUID()) {
    const preview=previewLegacyBackup(data,memberMap);
    if(!preview.ready) throw new Error('Map all members and repair invalid backup records first.');
    return unwrap(await client.rpc('import_legacy_workspace',{
      p_data:data,p_member_map:memberMap,p_dry_run:dryRun,p_import_id:importId
    }),dryRun?'Preview import':'Import workspace');
  }
  async function loadDivisionState() {
    if(!await user()) throw new Error('Sign in to load division work.');
    const names=[
      'workflow_stages','initiatives','finance_budgets','finance_budget_catalog','finance_requests',
      'hr_journeys','marketing_deliverables','division_records','activity_events'
    ];
    const results=await Promise.all(names.map(name=>query(name).select('*')));
    const [stages,initiatives,budgets,budgetCatalog,requests,journeys,deliverables,aux,events]=
      results.map((result,i)=>unwrap(result,'Load '+names[i]));
    const data={
      version:1,stages:{},
      ...Object.fromEntries(DIVISION_KEYS.map(key=>[key,[]])),
      activity:events.map(x=>({
        id:x.id,division:CODE_TO_SLUG[x.division_code]||'',
        entityType:x.kind,entityId:x.project_id||'',action:x.title,at:x.occurred_at
      })).sort((a,b)=>b.at.localeCompare(a.at))
    };
    for(const [group,[division,kind]] of Object.entries(DIVISION_GROUPS)) {
      data.stages[group]=stages.filter(x=>x.division_code===division&&x.entity_kind===kind)
        .sort((a,b)=>a.position-b.position).map(x=>({id:x.stage_code,label:x.label}));
    }
    data.initiatives=initiatives.map(x=>({
      id:x.id,title:x.title,serverVersion:x.version,
      horizon:x.horizon,stageId:x.stage_code,
      priority:x.priority,ownerId:x.owner_id||'',projectId:x.project_id||'',
      dueDate:x.decision_due_date||'',researchUrl:x.research_sources?.[0]||'',
      summary:x.description||'',updatedAt:x.updated_at
    }));
    const visibleBudgetIds=new Set(budgets.map(x=>x.id));
    data.budgets=budgets.map(x=>({
      id:x.id,title:x.title,serverVersion:x.version,
      projectId:x.project_id||'',category:x.category,
      allocated:Number(x.allocated_idr),updatedAt:x.updated_at
    })).concat(budgetCatalog.filter(x=>!visibleBudgetIds.has(x.budget_id)).map(x=>({
      id:x.budget_id,title:x.title,projectId:'',category:x.category,
      allocated:0,restricted:true
    })));
    data.financeRequests=requests.map(x=>({
      id:x.id,title:x.title,serverVersion:x.version,
      type:x.request_kind,budgetId:x.budget_id||'',
      projectId:x.project_id||'',amount:Number(x.amount_idr),category:x.category,
      requesterId:x.requester_id,approverId:x.approver_id||'',stageId:x.status,
      documentUrl:x.document_url||'',details:x.description||'',
      dueDate:x.due_date||'',updatedAt:x.updated_at
    }));
    for(const x of journeys) {
      const key=x.journey_kind==='recruitment'?'candidates':'onboarding';
      if(x.journey_kind==='development') continue;
      data[key].push({
        id:x.id,title:x.person_name,serverVersion:x.version,
        role:x.role_title||'',
        memberId:x.linked_user_id||'',stageId:x.stage_code,
        ownerId:x.owner_id||'',dueDate:x.next_action_date||'',
        notes:x.confidential_notes||'',updatedAt:x.updated_at
      });
    }
    data.deliverables=deliverables.filter(x=>x.work_kind!=='it').map(x=>({
      id:x.id,title:x.title,serverVersion:x.version,
      campaignId:x.campaign||'',stageId:x.stage_code,
      channel:x.channel||'',ownerId:x.owner_id||'',
      publishDate:x.publish_at?.slice(0,10)||'',assetUrl:x.asset_url||'',
      publishedUrl:x.published_url||'',notes:x.notes||'',updatedAt:x.updated_at
    }));
    for(const row of aux) {
      const key=Object.keys(DIVISION_AUX).find(k=>DIVISION_AUX[k][1]===row.record_kind);
      if(key) data[key].push({...row.payload,id:row.id,title:row.title,
        serverVersion:row.version,updatedAt:row.updated_at});
    }
    return data;
  }
  function divisionRow(key,item,currentUserId) {
    const id=requireUuid(item.id,key);
    const uuidOrNull=value=>value?requireUuid(value,'Linked record'):null;
    if(key==='initiatives') return ['initiatives',{
      id,title:item.title,description:item.summary||'',owner_id:uuidOrNull(item.ownerId),
      project_id:uuidOrNull(item.projectId),horizon:item.horizon,stage_code:item.stageId,
      priority:item.priority||'medium',decision_due_date:item.dueDate||null,
      research_sources:item.researchUrl?[item.researchUrl]:[]
    }];
    if(key==='budgets') return ['finance_budgets',{
      id,title:item.title,project_id:uuidOrNull(item.projectId),
      category:item.category||'General',allocated_idr:Number(item.allocated)||0
    }];
    if(key==='financeRequests') return ['finance_requests',{
      id,title:item.title,request_kind:item.type||'expense',
      budget_id:uuidOrNull(item.budgetId),project_id:uuidOrNull(item.projectId),
      category:item.category||'General',amount_idr:Number(item.amount)||0,
      requester_id:item.requesterId||currentUserId,
      status:item.stageId||'draft',document_url:item.documentUrl||null,
      description:item.details||'',due_date:item.dueDate||null
    }];
    if(key==='candidates'||key==='onboarding') return ['hr_journeys',{
      id,person_name:item.title,role_title:key==='candidates'?item.role||null:null,
      linked_user_id:key==='onboarding'?uuidOrNull(item.memberId):null,
      journey_kind:key==='candidates'?'recruitment':'onboarding',
      stage_code:item.stageId,owner_id:uuidOrNull(item.ownerId),
      next_action_date:item.dueDate||null,confidential_notes:item.notes||''
    }];
    if(key==='deliverables') return ['marketing_deliverables',{
      id,title:item.title,work_kind:'content',campaign:item.campaignId||null,
      stage_code:item.stageId,channel:item.channel||null,
      owner_id:uuidOrNull(item.ownerId),
      publish_at:item.publishDate?item.publishDate+'T12:00:00Z':null,
      asset_url:item.assetUrl||null,published_url:item.publishedUrl||null,
      notes:item.notes||''
    }];
    const [divisionCode,recordKind]=DIVISION_AUX[key]||[];
    if(!divisionCode) throw new Error('Unknown division record.');
    return ['division_records',{
      id,division_code:divisionCode,record_kind:recordKind,title:item.title,
      payload:Object.fromEntries(Object.entries(item).filter(([field])=>
        !['id','title','updatedAt','serverVersion'].includes(field)))
    }];
  }
  async function commitDivisionState(previous,next) {
    const me=await user();
    if(!me) throw new Error('Sign in before saving.');
    const stages=[];
    for(const [group,[divisionCode,entityKind]] of Object.entries(DIVISION_GROUPS)) {
      if(!same(previous.stages[group],next.stages[group])) {
        stages.push({divisionCode,entityKind,
          previous:previous.stages[group],items:next.stages[group]});
      }
    }
    const changes=Object.fromEntries(DIVISION_KEYS.map(key=>[
      key,diff(previous[key],next[key])
    ]));
    const operations=[];
    // Remove requests before budgets; create budgets before their requests.
    for(const key of ['financeRequests',...DIVISION_KEYS.filter(x=>x!=='financeRequests')]) {
      const table=divisionRow(key,{id:crypto.randomUUID(),title:'Record'},me.id)[0];
      for(const item of changes[key].deleted) {
        operations.push({table,action:'delete',id:requireUuid(item.id,key),
          version:expectedVersion(item,key)});
      }
    }
    for(const key of DIVISION_KEYS) for(const item of changes[key].created) {
      const [table,row]=divisionRow(key,item,me.id);
      operations.push({table,action:'create',row});
    }
    for(const key of DIVISION_KEYS) for(const item of changes[key].updated) {
      const [table,row]=divisionRow(key,item,me.id);
      const before=previous[key].find(x=>x.id===item.id);
      const version=expectedVersion(before,key);
      if(key==='financeRequests'&&before?.stageId!==item.stageId) {
        const omitStage=x=>Object.fromEntries(Object.entries(x).filter(([field])=>
          !['stageId','approverId','updatedAt'].includes(field)));
        if(!same(omitStage(before),omitStage(item)))
          throw new Error('Save request details before moving it to another approval stage.');
        operations.push({table,action:'transition',id:row.id,version,status:item.stageId});
      } else operations.push({table,action:'update',id:row.id,version,row});
    }
    unwrap(await client.rpc('commit_division_change',{
      p_change:{stages,operations}
    }),'Save division changes');
    return loadDivisionState();
  }
  function subscribeToChanges(onChange) {
    const channel=client.channel('dwdg-workspace')
      .on('postgres_changes',{event:'*',schema:'public'},payload=>onChange(payload))
      .subscribe();
    return ()=>client.removeChannel(channel);
  }
  return {
    client,getSession,signInWithGoogle,signOut,onAuthStateChange,bootstrap,
    listInvitations,listMembersWithAccess,createInvitation,revokeInvitation,
    setMembership,removeMembership,
    setGlobalRole,setProfileName,setFinanceApprover,listBudgetSummary,
    listNotifications,markNotificationRead,
    loadCoreState,commitCoreChange,listProjectCatalog,
    listProjectAccess,setProjectAccess,removeProjectAccess,
    listProjects,upsertProject,
    upsertTask,listSchedule,upsertEvent,listDivisionWorkspace,listDivisionRecords,
    upsertDivisionRecord,transitionApproval,listProjectExtras,upsertProjectExtra,
    deleteProjectExtra,uploadDocument,getDocumentDownloadUrl,search,
    importLegacyBackup,loadDivisionState,commitDivisionState,subscribeToChanges
  };
}
