/** Isolated, illustrative UI preview. This module never opens the product's stores. */
import {todayISO} from './dwdg-one-daily.mjs';
export const PREVIEW_KEY = 'dwdg-one-ui-preview-v1';
export const WORKSPACES = Object.freeze([
  {id:'consulting',name:'Consulting',idName:'Konsultasi',icon:'briefcase',shortCode:'CO'},
  {id:'strategy',name:'Strategy & Growth',idName:'Strategi & Pertumbuhan',icon:'chart',shortCode:'SG'},
  {id:'hr',name:'Human Resource',idName:'Sumber Daya Manusia',icon:'people',shortCode:'HR'},
  {id:'external',name:'External Engagement',idName:'Hubungan Eksternal',icon:'globe',shortCode:'EE'},
  {id:'marcom',name:'Marketing, Communication & IT',idName:'Pemasaran, Komunikasi & TI',icon:'sparkles',shortCode:'MC'},
  {id:'finance',name:'Legal & Finance',idName:'Legal & Keuangan',icon:'shield',shortCode:'LF'}
]);
export const PEOPLE = Object.freeze([
  {id:'demo-admin',name:'Demo administrator',workspaceId:'*'},
  {id:'co-arya',name:'Arya Pratama',workspaceId:'consulting'},
  {id:'co-nadia',name:'Nadia Putri',workspaceId:'consulting'},
  {id:'sg-raka',name:'Raka Aditya',workspaceId:'strategy'},
  {id:'sg-salsa',name:'Salsa Wulandari',workspaceId:'strategy'},
  {id:'hr-alya',name:'Alya Rahma',workspaceId:'hr'},
  {id:'hr-dimas',name:'Dimas Saputra',workspaceId:'hr'},
  {id:'ee-naufal',name:'Naufal Akbar',workspaceId:'external'},
  {id:'ee-citra',name:'Citra Lestari',workspaceId:'external'},
  {id:'mc-bima',name:'Bima Santoso',workspaceId:'marcom'},
  {id:'mc-farah',name:'Farah Azzahra',workspaceId:'marcom'},
  {id:'lf-reza',name:'Reza Firmansyah',workspaceId:'finance'},
  {id:'lf-intan',name:'Intan Maharani',workspaceId:'finance'}
]);
export const peopleInWorkspace = workspaceId => PEOPLE.filter(person=>person.workspaceId===workspaceId||person.workspaceId==='*');
export const STATUS_LABELS = Object.freeze({
  draft:['Draft','Draf'],planned:['Planned','Direncanakan'],active:['Active','Aktif'],
  review:['In review','Ditinjau'],completed:['Completed','Selesai'],hold:['On hold','Ditunda'],
  cancelled:['Cancelled','Dibatalkan'],archived:['Archived','Diarsipkan']
});
const DEFAULT_PREFERENCES = Object.freeze({language:'en',theme:'light',motion:'system',transparency:'translucent',workspaceId:'consulting'});
const workspaceExists = id => WORKSPACES.some(workspace => workspace.id === id);
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const copy = value => structuredClone(value);
const has = (value,key) => Object.hasOwn(value,key);
function error(code) {const result=new Error(code);result.code=code;return result;}
function validDate(value) {
  if(value==='')return true;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(+date)&&date.toISOString().slice(0,10)===value;
}
function validateMetadata(workspaceId,input) {
  if(!workspaceExists(workspaceId))throw error('workspace');
  if(typeof input.title!=='string'||!input.title.trim())throw error('title');
  const title=input.title.trim(),purpose=typeof input.purpose==='string'?input.purpose.trim():'',leadId=input.leadId??'';
  if(typeof leadId!=='string'||(leadId&&!peopleInWorkspace(workspaceId).some(person=>person.id===leadId)))throw error('owner');
  const startDate=input.startDate??'',targetDate=input.targetDate??'';
  if(!validDate(startDate)||!validDate(targetDate)||(startDate&&targetDate&&targetDate<startDate))throw error('dates');
  return {title,purpose,leadId,startDate,targetDate};
}
function validProject(project) {
  if(!object(project)||typeof project.id!=='string'||!project.id||!has(STATUS_LABELS,project.status))return false;
  try {validateMetadata(project.workspaceId,project);return true;}catch{return false;}
}
function validPreferences(preferences) {
  return object(preferences)&&['en','id'].includes(preferences.language)&&['light','dark'].includes(preferences.theme)
    &&['system','full','reduced'].includes(preferences.motion)&&['translucent','solid'].includes(preferences.transparency)
    &&workspaceExists(preferences.workspaceId);
}
function validUIMap(map) {return object(map)&&Object.entries(map).every(([id,value])=>workspaceExists(id)&&object(value));}
function validDrafts(map) {
  return validUIMap(map)&&Object.values(map).every(draft=>typeof draft.projectId==='string'&&object(draft.fields)
    &&['title','purpose','leadId','startDate','targetDate'].every(key=>typeof draft.fields[key]==='string'));
}
function validViews(map) {
  return validUIMap(map)&&Object.entries(map).every(([workspaceId,view])=>{
    const strings=['route','panel','query','status','lead','sort','selectedId'];
    if(!strings.every(key=>!has(view,key)||typeof view[key]==='string'))return false;
    if(has(view,'route')&&!['home','work','projects','schedule','resources','updates','changes','organization','settings'].includes(view.route))return false;
    if(has(view,'panel')&&!['','form','detail'].includes(view.panel))return false;
    if(has(view,'status')&&view.status!=='all'&&!has(STATUS_LABELS,view.status))return false;
    if(has(view,'lead')&&!['all','unassigned'].includes(view.lead)&&!peopleInWorkspace(workspaceId).some(person=>person.id===view.lead))return false;
    if(has(view,'sort')&&!['target','target-desc','title','title-desc','updated'].includes(view.sort))return false;
    return !has(view,'scroll')||(typeof view.scroll==='number'&&Number.isFinite(view.scroll)&&view.scroll>=0);
  });
}
function validActorUI(map) {
  return object(map)&&Object.entries(map).every(([actorId,ui])=>actorId&&object(ui)&&validPreferences(ui.preferences)
    &&validDrafts(ui.drafts)&&validViews(ui.views)&&object(ui.workUI)&&object(ui.workUI.contexts)&&object(ui.workUI.drafts)
    &&(ui.retainedDrafts===undefined||object(ui.retainedDrafts)));
}
function validState(state) {
  if(!object(state)||state.version!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!validPreferences(state.preferences)
    ||!validDrafts(state.drafts)||!validViews(state.views)||!validUIMap(state.undo))return false;
  if(!['projects','tasks','blockers'].every(key=>Array.isArray(state[key])&&new Set(state[key].map(row=>row?.id)).size===state[key].length))return false;
  if(!state.projects.every(validProject))return false;
  const linked = row => object(row)&&typeof row.id==='string'&&!!row.id&&typeof row.title==='string'
    &&state.projects.some(project=>project.id===row.projectId&&project.workspaceId===row.workspaceId);
  const validTask=row=>linked(row)&&['todo','progress','done'].includes(row.status)
    &&(!has(row,'ownerId')||typeof row.ownerId==='string'&&(!row.ownerId||peopleInWorkspace(row.workspaceId).some(p=>p.id===row.ownerId)))
    &&(!has(row,'targetDate')||validDate(row.targetDate))&&(!has(row,'startDate')||validDate(row.startDate))
    &&(!row.startDate||!row.targetDate||row.targetDate>=row.startDate);
  if(!state.tasks.every(validTask))return false;
  if(!state.blockers.every(row=>linked(row)&&typeof row.resolved==='boolean'))return false;
  const validTaskChange=(entry,workspaceId)=>object(entry)&&typeof entry.taskId==='string'&&validTask(entry.after)&&entry.after.id===entry.taskId&&entry.after.workspaceId===workspaceId&&(entry.before===null||validTask(entry.before)&&entry.before.id===entry.taskId&&entry.before.workspaceId===workspaceId);
  if(state.taskUndo!==undefined&&(!validUIMap(state.taskUndo)||!Object.entries(state.taskUndo).every(([workspaceId,value])=>Array.isArray(value.entries)&&value.entries.length<=40&&value.entries.every(entry=>entry?.kind==='batch'?Array.isArray(entry.changes)&&entry.changes.length>0&&new Set(entry.changes.map(change=>change.taskId)).size===entry.changes.length&&entry.changes.every(change=>change.before!==null&&validTaskChange(change,workspaceId)):validTaskChange(entry,workspaceId)))))return false;
  if(state.events!==undefined&&(!Array.isArray(state.events)||!state.events.every(row=>object(row)&&workspaceExists(row.workspaceId)&&typeof row.id==='string'&&typeof row.at==='string')))return false;
  if(state.workUI!==undefined&&(!object(state.workUI)||!object(state.workUI.contexts)||!object(state.workUI.drafts)))return false;
  if(state.actorUI!==undefined&&!validActorUI(state.actorUI))return false;
  return Object.entries(state.undo).every(([workspaceId,value])=>Array.isArray(value.entries)&&value.entries.length<=20
    &&value.entries.every(entry=>object(entry)&&typeof entry.projectId==='string'&&validProject(entry.after)
      &&entry.after.id===entry.projectId&&entry.after.workspaceId===workspaceId
      &&(entry.before===null||(validProject(entry.before)&&entry.before.id===entry.projectId&&entry.before.workspaceId===workspaceId))));
}
function emptyState() {
  return {version:1,revision:0,projects:[],tasks:[],blockers:[],preferences:{...DEFAULT_PREFERENCES},drafts:{},views:{},undo:{}};
}
function seedState() {
  const state=emptyState(),stamp='2026-10-03T08:00:00+07:00';
  const specifications=[
    ['consulting','Consulting bootcamp','Prepare a practical case workshop and its review guide.','co-arya','2026-09-28','2026-10-12','active'],
    ['consulting','Campus venture discovery','Clarify the venture challenge and agree the project brief.','co-nadia','2026-10-01','2026-10-16','planned'],
    ['consulting','Workshop facilitator brief','Review scope, materials and facilitator responsibilities.','co-arya','2026-09-25','2026-10-07','review'],
    ['consulting','Knowledge handover','Capture lessons and working references for the next team.','co-nadia','','','draft'],
    ['consulting','Client readiness review','Check the final deliverables and record open questions.','co-arya','2026-09-18','2026-10-02','hold'],
    ['consulting','Research synthesis and recommendations for the campus entrepreneurship and community partnership programme','Summarize interviews, partner priorities and recommendations for the next workshop.','','2026-10-02','2026-10-22','draft'],
    ['strategy','Division priorities','Connect the division goals to a small set of upcoming initiatives.','sg-raka','2026-10-01','2026-10-15','active'],
    ['strategy','Monthly learning review','Summarize the previous month and agree next actions.','sg-salsa','2026-09-20','2026-09-30','completed'],
    ['strategy','New initiative exploration','Collect options before committing to a new initiative.','','','','draft'],
    ['hr','Member onboarding','Prepare a welcoming first-week experience for new members.','hr-alya','2026-09-29','2026-10-09','active'],
    ['hr','Mentor matching','Confirm availability and match members with mentors.','hr-dimas','','2026-10-14','planned'],
    ['hr','Previous batch orientation','Reference the previous batch orientation materials.','hr-alya','2026-08-12','2026-08-20','archived'],
    ['external','Campus partnership outreach','Prepare and follow up a short list of campus partners.','ee-naufal','2026-10-01','2026-10-18','active'],
    ['external','Community collaboration brief','Agree the initial scope and responsible contact.','ee-citra','','2026-10-20','planned'],
    ['external','Joint event proposal','Keep the cancelled proposal available as reference.','ee-naufal','2026-09-01','2026-09-22','cancelled'],
    ['marcom','DWDG welcome campaign','Prepare the welcome campaign and review its working materials.','mc-farah','2026-09-29','2026-10-10','active'],
    ['marcom','Division profile update','Refresh the division profiles and their reusable assets.','mc-bima','2026-10-02','2026-10-17','review'],
    ['marcom','Website content inventory','Find the current content owner and identify missing material.','mc-bima','','','draft'],
    ['finance','Partnership document register','Organize the current document references and review status.','lf-intan','2026-09-30','2026-10-08','review'],
    ['finance','Workshop budget review','Review the illustrative workshop budget and open questions.','lf-reza','2026-10-01','2026-10-11','planned']
  ];
  const counts={};
  state.projects=specifications.map(([workspaceId,title,purpose,leadId,startDate,targetDate,status])=>({
    id:`demo-${workspaceId}-${counts[workspaceId]=(counts[workspaceId]||0)+1}`,workspaceId,title,purpose,leadId,startDate,targetDate,status,createdAt:stamp,updatedAt:stamp,sample:true
  }));
  const taskFixtures=[['demo-consulting-1',6,2],['demo-consulting-2',3,0],['demo-consulting-3',4,3],['demo-consulting-5',5,1],
    ['demo-strategy-1',4,1],['demo-strategy-2',3,3],['demo-hr-1',5,2],['demo-external-1',4,1],['demo-marcom-1',6,3],['demo-finance-1',3,1]];
  for(const [projectId,total,done] of taskFixtures){
    const project=state.projects.find(row=>row.id===projectId);
    for(let index=0;index<total;index++)state.tasks.push({id:`${projectId}-task-${index+1}`,projectId,workspaceId:project.workspaceId,
      title:['Agree the brief','Collect working references','Prepare the draft','Review the output','Record feedback','Confirm the handover'][index],status:index<done?'done':index===done?'progress':'todo',sample:true});
  }
  // Only a brand-new preview gets these illustrative assignments; saved records are never reseeded.
  const fixtureToday=todayISO(),fixtureYesterday=new Date(`${fixtureToday}T12:00:00Z`);fixtureYesterday.setUTCDate(fixtureYesterday.getUTCDate()-1);
  for(const workspace of WORKSPACES){const open=state.tasks.filter(task=>task.workspaceId===workspace.id&&task.status!=='done').slice(0,3);open.forEach((task,index)=>{task.ownerId='demo-admin';task.targetDate=[fixtureYesterday.toISOString().slice(0,10),fixtureToday,''][index];});}
  const blockers=[['demo-consulting-1','Facilitator availability'],['demo-consulting-5','Scope confirmation'],['demo-external-1','Partner reply'],['demo-marcom-1','Asset review']];
  state.blockers=blockers.map(([projectId,title],index)=>({id:`demo-blocker-${index+1}`,projectId,workspaceId:state.projects.find(row=>row.id===projectId).workspaceId,title,resolved:false,sample:true}));
  state.blockers.push({id:'demo-blocker-resolved',projectId:'demo-consulting-3',workspaceId:'consulting',title:'Brief clarified',resolved:true,sample:true});
  return state;
}
function freeze(value) {if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}

export function createPreviewStore(storage,{actorId='demo-admin'}={}) {
  if(typeof actorId!=='string'||!actorId)throw error('actor');
  let state=emptyState(),warning=null,raw=null,protectedSource=false;
  try {if(storage===undefined)storage=globalThis.localStorage;if(!storage)throw error('storage');raw=storage.getItem(PREVIEW_KEY);}
  catch {warning='storage';protectedSource=true;}
  if(!protectedSource&&raw!==null){
    try {const parsed=JSON.parse(raw);if(!validState(parsed))throw error('storage');state=parsed;}
    catch {warning='corrupt';protectedSource=true;}
  }else if(!protectedSource){
    state=seedState();
    try {const encoded=JSON.stringify(state);storage.setItem(PREVIEW_KEY,encoded);raw=encoded;}
    catch {warning='storage';}
  }
  state=freeze(state);
  function checkCurrent() {
    if(protectedSource)throw error(warning==='corrupt'?'corrupt':'storage');
    let saved;try {saved=storage.getItem(PREVIEW_KEY);}catch {warning='storage';throw error('storage');}
    if(saved!==raw)throw error('conflict');
  }
  function commit(next) {
    checkCurrent();
    next.revision=state.revision+1;
    if(!validState(next))throw error('storage');
    let encoded;try {encoded=JSON.stringify(next);storage.setItem(PREVIEW_KEY,encoded);}catch {warning='storage';throw error('storage');}
    state=freeze(next);raw=encoded;warning=null;
  }
  function recordChange(next,workspaceId,kind,recordId,title,projectId='') {
    const record=next.projects.find(row=>row.id===recordId)||next.tasks.find(row=>row.id===recordId);
    (next.events||=[]).push({id:globalThis.crypto.randomUUID(),at:new Date().toISOString(),workspaceId,kind,recordId,title,actorId,...(record||projectId?{projectId:projectId||record.projectId||record.id}:{})});
  }
  function applyActorUI(next,options={}) {
    if(options.actorUI!==undefined){
      if(!object(options.actorUI))throw error('storage');
      (next.actorUI||={})[actorId]=copy(options.actorUI);
    }
  }
  function taskMetadata(workspaceId,input,before) {
    if(!workspaceExists(workspaceId))throw error('workspace');
    if(typeof input.title!=='string'||!input.title.trim())throw error('title');
    const projectId=input.projectId??before?.projectId;
    if(!state.projects.some(p=>p.id===projectId&&p.workspaceId===workspaceId))throw error('workspace');
    const ownerId=input.ownerId??before?.ownerId??'';
    if(typeof ownerId!=='string'||(ownerId&&!peopleInWorkspace(workspaceId).some(p=>p.id===ownerId)))throw error('owner');
    const targetDate=input.targetDate??before?.targetDate??'',startDate=input.startDate??before?.startDate??'';
    if(!validDate(targetDate)||!validDate(startDate)||(startDate&&targetDate&&targetDate<startDate))throw error('dates');
    const status=input.status??before?.status??'todo',priority=input.priority??before?.priority??'normal';
    if(!['todo','progress','done'].includes(status)||!['low','normal','high'].includes(priority))throw error('record');
    const metadata={projectId,workspaceId,title:input.title.trim(),notes:String(input.notes??before?.notes??''),ownerId,startDate,targetDate,status,priority,
      resourceId:String(input.resourceId??before?.resourceId??''),requestId:String(input.requestId??before?.requestId??'')};
    if(before)for(const key of ['notes','ownerId','startDate','targetDate','priority','resourceId','requestId'])if(!has(input,key)&&!has(before,key))delete metadata[key];
    return metadata;
  }
  function saveTask(workspaceId,input,id='',options={}) {
    const {draftKey,preserveUI=false}=options;
    const before=id?state.tasks.find(row=>row.id===id&&row.workspaceId===workspaceId):null;
    if(id&&!before)throw error('record');
    const metadata=taskMetadata(workspaceId,input,before);
    if(!id&&metadata.requestId){const existing=state.tasks.find(row=>row.workspaceId===workspaceId&&row.requestId===metadata.requestId);if(existing){if(existing.resourceId!==metadata.resourceId||existing.projectId!==metadata.projectId)throw error('conflict');return existing;}}
    const now=new Date().toISOString(),task={...before,...metadata,id:before?.id||globalThis.crypto.randomUUID(),createdAt:before?.createdAt||now,updatedAt:now,sample:true,...(before?{}:{createdBy:actorId}),updatedBy:actorId};
    if(task.status==='done'&&before?.status!=='done')task.completedAt=now;
    if(task.status!=='done')delete task.completedAt;
    const next=copy(state);
    if(before)next.tasks[next.tasks.findIndex(row=>row.id===id)]=task;else next.tasks.push(task);
    const entries=(next.taskUndo||={})[workspaceId]?.entries||[];
    entries.push({taskId:task.id,before:before?copy(before):null,after:copy(task)});
    next.taskUndo[workspaceId]={entries:entries.slice(-40)};
    if(!preserveUI&&draftKey&&next.workUI?.drafts)delete next.workUI.drafts[draftKey];
    applyActorUI(next,options);
    recordChange(next,workspaceId,before?'task.updated':'task.created',task.id,task.title);
    commit(next);return state.tasks.find(row=>row.id===task.id);
  }
  return {
    get state(){return state;},get warning(){return warning;},
    createTask(workspaceId,input){return saveTask(workspaceId,input);},
    saveTask,
    saveTasks(workspaceId,ids,patch,options={}) {
      const {contextKey,preserveUI=false}=options;
      if(!workspaceExists(workspaceId)||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw error('workspace');
      if(contextKey!==undefined&&(typeof contextKey!=='string'||!contextKey.startsWith(`${workspaceId}:`)||contextKey.length<=workspaceId.length+1))throw error('workspace');
      if(!object(patch)||!Object.keys(patch).length||Object.keys(patch).some(key=>!['status','ownerId','targetDate'].includes(key)))throw error('record');
      const now=new Date().toISOString(),changes=ids.map(id=>{
        const before=state.tasks.find(task=>task.id===id&&task.workspaceId===workspaceId);if(!before)throw error('workspace');
        const after={...before,...taskMetadata(workspaceId,{...before,...patch},before),updatedAt:now,updatedBy:actorId};
        if(after.status==='done'&&before.status!=='done')after.completedAt=now;
        if(after.status!=='done')delete after.completedAt;
        return {taskId:id,before:copy(before),after};
      });
      const next=copy(state);for(const change of changes){next.tasks[next.tasks.findIndex(task=>task.id===change.taskId)]=change.after;recordChange(next,workspaceId,'task.updated',change.taskId,change.after.title);}
      const entries=(next.taskUndo||={})[workspaceId]?.entries||[];entries.push({kind:'batch',changes});next.taskUndo[workspaceId]={entries:entries.slice(-40)};
      if(!preserveUI&&contextKey&&next.workUI?.contexts?.[contextKey])next.workUI.contexts[contextKey].selectedIds=[];
      applyActorUI(next,options);
      commit(next);return changes.map(change=>state.tasks.find(task=>task.id===change.taskId));
    },
    canUndoTask(workspaceId){return !!state.taskUndo?.[workspaceId]?.entries?.length;},
    undoTask(workspaceId,options={}){
      const entry=state.taskUndo?.[workspaceId]?.entries?.at(-1);if(!entry)return false;
      if(entry.kind==='batch'){
        if(entry.changes.some(change=>JSON.stringify(state.tasks.find(task=>task.id===change.taskId&&task.workspaceId===workspaceId))!==JSON.stringify(change.after)))throw error('conflict');
        const next=copy(state);for(const change of entry.changes){next.tasks[next.tasks.findIndex(task=>task.id===change.taskId)]=copy(change.before);recordChange(next,workspaceId,'task.undo',change.taskId,change.before.title);}
        next.taskUndo[workspaceId].entries.pop();applyActorUI(next,options);commit(next);return true;
      }
      const current=state.tasks.find(row=>row.id===entry.taskId&&row.workspaceId===workspaceId);
      if(!current||JSON.stringify(current)!==JSON.stringify(entry.after))throw error('conflict');
      const next=copy(state),index=next.tasks.findIndex(row=>row.id===entry.taskId);
      if(entry.before)next.tasks[index]=copy(entry.before);else next.tasks.splice(index,1);
      next.taskUndo[workspaceId].entries.pop();recordChange(next,workspaceId,'task.undo',entry.taskId,current.title,current.projectId);applyActorUI(next,options);commit(next);return true;
    },
    saveWorkUI(workUI){if(!object(workUI))throw error('storage');const next=copy(state);next.workUI=copy(workUI);commit(next);},
    saveProject(workspaceId,input,id='',options={}) {
      const metadata=validateMetadata(workspaceId,input||{});
      const before=id?state.projects.find(project=>project.id===id):null;
      if(id&&(!before||before.workspaceId!==workspaceId))throw error('workspace');
      const now=new Date().toISOString(),project=before?{...before,...metadata,updatedAt:now,updatedBy:actorId}
        :{id:globalThis.crypto.randomUUID(),workspaceId,...metadata,status:'draft',createdAt:now,updatedAt:now,createdBy:actorId,updatedBy:actorId,sample:true};
      const next=copy(state);
      if(before)next.projects[next.projects.findIndex(row=>row.id===id)]=project;else next.projects.push(project);
      const entries=next.undo[workspaceId]?.entries||[];
      entries.push({projectId:project.id,before:before?copy(before):null,after:copy(project)});
      next.undo[workspaceId]={entries:entries.slice(-20)};
      applyActorUI(next,options);
      if(options.actorUI!==undefined)next.actorUI[actorId].views[workspaceId]={...next.actorUI[actorId].views[workspaceId],panel:'detail',selectedId:project.id};
      if(!options.preserveUI){
        delete next.drafts[workspaceId];
        next.views[workspaceId]={...next.views[workspaceId],panel:'detail',selectedId:project.id};
      }
      recordChange(next,workspaceId,before?'project.updated':'project.created',project.id,project.title);
      commit(next);return state.projects.find(row=>row.id===project.id);
    },
    canUndo(workspaceId){return workspaceExists(workspaceId)&&!!state.undo[workspaceId]?.entries.length;},
    undo(workspaceId,options={}) {
      if(!workspaceExists(workspaceId))throw error('workspace');
      const entries=state.undo[workspaceId]?.entries;if(!entries?.length)return false;
      const previous=entries.at(-1),current=state.projects.find(project=>project.id===previous.projectId);
      if(!current||JSON.stringify(current)!==JSON.stringify(previous.after))throw error('conflict');
      if(previous.before===null&&(state.tasks.some(row=>row.projectId===current.id)||state.blockers.some(row=>row.projectId===current.id)))throw error('conflict');
      const next=copy(state),index=next.projects.findIndex(row=>row.id===current.id);
      if(previous.before===null){
        next.projects.splice(index,1);
        if(!options.preserveUI&&next.views[workspaceId]?.selectedId===current.id)next.views[workspaceId]={...next.views[workspaceId],panel:'',selectedId:''};
      }else next.projects[index]=copy(previous.before);
      next.undo[workspaceId].entries.pop();recordChange(next,workspaceId,'project.undo',current.id,current.title,current.id);applyActorUI(next,options);commit(next);return true;
    },
    saveActorUI(partial={}) {
      if(!object(partial))throw error('storage');
      const next=copy(state),prior=next.actorUI?.[actorId]||{preferences:{...DEFAULT_PREFERENCES},drafts:{},views:{},workUI:{contexts:{},drafts:{}}};
      (next.actorUI||={})[actorId]={...prior,...copy(partial),preferences:{...prior.preferences,...partial.preferences}};
      commit(next);return state;
    },
    saveUI(partial={}) {
      if(!object(partial))throw error('storage');
      const next=copy(state);
      if(has(partial,'preferences'))next.preferences={...next.preferences,...partial.preferences};
      for(const key of ['drafts','views'])if(has(partial,key)){
        if(!object(partial[key]))throw error('storage');
        const patch=copy(partial[key]);
        if(key==='views')for(const [workspaceId,view] of Object.entries(patch))patch[workspaceId]={...next.views[workspaceId],...view};
        next[key]=key==='drafts'?patch:{...next[key],...patch};
      }
      commit(next);return state;
    }
  };
}

export function selectProjects(state,workspaceId,{query='',status='all',lead='all',sort='target'}={}) {
  const needle=String(query).trim().toLocaleLowerCase();
  const ownerName=id=>PEOPLE.find(person=>person.id===id)?.name||'';
  const rows=state.projects.filter(project=>project.workspaceId===workspaceId&&(!status||status==='all'||project.status===status)
    &&(!lead||lead==='all'||(lead==='unassigned'?!project.leadId:project.leadId===lead))
    &&(!needle||[project.title,project.purpose,ownerName(project.leadId)].join(' ').toLocaleLowerCase().includes(needle)));
  const titleOrder=(a,b)=>a.title.localeCompare(b.title)||a.id.localeCompare(b.id);
  return rows.sort((a,b)=>sort==='title'?titleOrder(a,b):sort==='title-desc'?-titleOrder(a,b):sort==='updated'
    ?String(b.updatedAt).localeCompare(String(a.updatedAt))||titleOrder(a,b)
    :!a.targetDate&&!b.targetDate?titleOrder(a,b):!a.targetDate?1:!b.targetDate?-1
    :(sort==='target-desc'?b.targetDate.localeCompare(a.targetDate):a.targetDate.localeCompare(b.targetDate))||titleOrder(a,b));
}
export function projectProgress(state,projectId) {
  const tasks=state.tasks.filter(task=>task.projectId===projectId),done=tasks.filter(task=>task.status==='done').length;
  return {done,total:tasks.length,percent:tasks.length?Math.round(done/tasks.length*100):0};
}
export function projectBlockers(state,projectId) {return state.blockers.filter(blocker=>blocker.projectId===projectId&&!blocker.resolved);}
