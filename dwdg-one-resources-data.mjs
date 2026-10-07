import {WORKSPACES, PEOPLE, peopleInWorkspace} from './dwdg-one-preview-data.mjs';
import {noteReferenceIds} from './dwdg-one-note.mjs';

/** Resources belong only to the interactive demo; no production adapter is opened. */
export const RESOURCE_KEY = 'dwdg-one-resources-preview-v1';
export const RESOURCE_KINDS = Object.freeze({
  folder:['Folder','Folder','folder'], note:['Note','Catatan','file'],
  file:['File link','Tautan berkas','file'], externalFolder:['External folder','Folder eksternal','folder'],
  app:['App or document','Aplikasi atau dokumen','external'], meeting:['Meeting note','Catatan rapat','calendar'],
  template:['Template reference','Referensi templat','documents']
});
const NATIVE = new Set(['folder','note','meeting']);
const TEXT = new Set(['note','meeting']);
const copy = value => structuredClone(value);
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const fail = code => {const error=new Error(code);error.code=code;throw error;};
const own = (value,key)=>Object.hasOwn(value,key);
const validFormat = value=>value===undefined||['plain','markdown'].includes(value);
const validReferences = value=>value===undefined||Array.isArray(value)&&new Set(value).size===value.length&&value.every(id=>typeof id==='string'&&!!id);
const workspaceExists=id=>WORKSPACES.some(row=>row.id===id);
const personExists=(id,workspaceId)=>!id||peopleInWorkspace(workspaceId).some(row=>row.id===id);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const empty=()=>({version:1,revision:0,resources:[],revisions:[],issues:[],events:[],drafts:{},views:{},undo:{}});

export function safeResourceURL(value) {
  if(typeof value!=='string'||!value.trim())fail('url');
  if(/[\u0000-\u001f\u007f]/.test(value))fail('url');
  let url;try{url=new URL(value.trim());}catch{fail('url');}
  if(url.protocol!=='https:'||!url.hostname||url.username||url.password)fail('url');
  return url.href;
}
function validRevisionURL(value) {
  if(typeof value!=='string')return false;
  if(value==='')return true;
  try{safeResourceURL(value);return true;}catch{return false;}
}
export function resourceAncestors(resources,id) {
  const chain=[],seen=new Set();let row=resources.find(item=>item.id===id);
  while(row?.parentId){if(seen.has(row.parentId))fail('hierarchy');seen.add(row.parentId);row=resources.find(item=>item.id===row.parentId);if(!row)fail('hierarchy');chain.unshift(row);}
  return chain;
}
export function resourceDescendants(resources,id) {
  if(!id)return [];
  const found=[],pending=[id],seen=new Set([id]);
  while(pending.length){const parent=pending.shift();for(const child of resources.filter(row=>row.parentId===parent)){if(seen.has(child.id))fail('hierarchy');seen.add(child.id);found.push(child);pending.push(child.id);}}
  return found;
}
export function resourcePath(resources,id) {return resourceAncestors(resources,id).map(row=>row.title).join(' / ');}

function validateResource(row,resources) {
  if(!object(row)||typeof row.id!=='string'||!row.id||!workspaceExists(row.workspaceId)||typeof row.projectId!=='string'||!row.projectId
    ||!own(RESOURCE_KINDS,row.kind)||typeof row.title!=='string'||!row.title.trim()||typeof row.parentId!=='string'
    ||typeof row.description!=='string'||typeof row.content!=='string'||typeof row.url!=='string'||typeof row.ownerId!=='string'
    ||!personExists(row.ownerId,row.workspaceId)||!Array.isArray(row.contributorIds)||new Set(row.contributorIds).size!==row.contributorIds.length
    ||!row.contributorIds.every(id=>typeof id==='string'&&!!id&&personExists(id,row.workspaceId))
    ||typeof row.archived!=='boolean'||typeof row.pinned!=='boolean'||typeof row.createdAt!=='string'||typeof row.updatedAt!=='string'
    ||typeof row.createdBy!=='string'||typeof row.accessNote!=='string'||typeof row.contact!=='string')return false;
  if(!validFormat(row.contentFormat)||!validReferences(row.referenceIds)||row.updatedBy!==undefined&&typeof row.updatedBy!=='string')return false;
  if(!NATIVE.has(row.kind)){try{safeResourceURL(row.url);}catch{return false;}}
  if(row.parentId){const parent=resources.find(item=>item.id===row.parentId);if(!parent||parent.kind!=='folder'||parent.workspaceId!==row.workspaceId||parent.projectId!==row.projectId||parent.id===row.id)return false;}
  try{resourceAncestors(resources,row.id);return true;}catch{return false;}
}
function validDraftFields(fields) {
  if(!object(fields)||typeof fields.title!=='string')return false;
  const textFields=['description','content','url','ownerId','parentId','accessNote','contact'];
  if(!textFields.every(key=>fields[key]===undefined||typeof fields[key]==='string'))return false;
  if(fields.kind!==undefined&&!own(RESOURCE_KINDS,fields.kind))return false;
  return validFormat(fields.contentFormat)&&validReferences(fields.referenceIds)
    &&(fields.contributorIds===undefined||Array.isArray(fields.contributorIds)&&fields.contributorIds.every(id=>typeof id==='string'));
}
function validState(state) {
  if(!object(state)||state.version!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!['resources','revisions','issues','events'].every(key=>Array.isArray(state[key]))
    ||!['drafts','views','undo'].every(key=>object(state[key])))return false;
  if(new Set(state.resources.map(row=>row?.id)).size!==state.resources.length||!state.resources.every(row=>validateResource(row,state.resources)))return false;
  const resource=id=>state.resources.find(row=>row.id===id);
  if(!state.revisions.every(row=>object(row)&&typeof row.id==='string'&&resource(row.resourceId)&&typeof row.content==='string'&&validRevisionURL(row.url)&&typeof row.label==='string'&&typeof row.changeNote==='string'&&typeof row.createdAt==='string'&&validFormat(row.contentFormat)&&validReferences(row.referenceIds)))return false;
  if(!state.issues.every(row=>object(row)&&typeof row.id==='string'&&resource(row.resourceId)&&['access','missing','expired','wrong'].includes(row.reason)&&typeof row.resolved==='boolean'))return false;
  if(!state.events.every(row=>object(row)&&typeof row.id==='string'&&workspaceExists(row.workspaceId)&&typeof row.type==='string'&&typeof row.resourceId==='string'&&typeof row.title==='string'&&typeof row.createdAt==='string'))return false;
  if(!Object.entries(state.drafts).every(([key,row])=>key===`${row?.workspaceId}:${row?.projectId}`&&workspaceExists(row.workspaceId)&&typeof row.projectId==='string'&&typeof row.id==='string'&&validDraftFields(row.fields)))return false;
  if(!Object.values(state.views).every(row=>object(row)&&['folderId','query','kind','selectedId','panel'].every(key=>typeof row[key]==='string')&&['','detail','form','task','move','issue'].includes(row.panel)&&typeof row.scroll==='number'&&row.scroll>=0))return false;
  if(state.actorUI!==undefined&&(!object(state.actorUI)||!Object.entries(state.actorUI).every(([actorId,ui])=>actorId&&object(ui)&&object(ui.drafts)&&object(ui.views)
    &&Object.entries(ui.drafts).every(([key,row])=>key===`${row?.workspaceId}:${row?.projectId}`&&workspaceExists(row.workspaceId)&&typeof row.projectId==='string'&&typeof row.id==='string'&&validDraftFields(row.fields))
    &&Object.values(ui.views).every(row=>object(row)&&['folderId','query','kind','selectedId','panel'].every(key=>typeof row[key]==='string')&&['','detail','form','task','move','issue'].includes(row.panel)&&typeof row.scroll==='number'&&row.scroll>=0)
    &&(ui.retainedDrafts===undefined||object(ui.retainedDrafts)))))return false;
  return Object.entries(state.undo).every(([workspaceId,rows])=>workspaceExists(workspaceId)&&Array.isArray(rows)&&rows.length<=30&&rows.every(row=>object(row)&&Array.isArray(row.before)&&Array.isArray(row.after)&&typeof row.type==='string'));
}

function fixtures(projects) {
  const state=empty(),stamp='2026-10-03T08:00:00+07:00';
  for(const workspace of WORKSPACES){
    const project=projects.find(row=>row.workspaceId===workspace.id);if(!project)continue;
    const people=PEOPLE.filter(row=>row.workspaceId===workspace.id),prefix=`demo-resource-${workspace.id}`,ownerId=people[0]?.id||'';
    const specifications=[
      ['folder','Working materials','','','',true],
      ['note','Project brief',`${prefix}-1`,'Purpose\n\nCapture the agreed scope, working questions and responsibilities here.\n\nNext review\n\nConfirm the brief with the project lead before preparing the output.','',true],
      ['file','Reference document',`${prefix}-1`,'','https://example.com/dwdg/reference.pdf',false],
      ['externalFolder','External working folder','','','https://drive.google.com/drive/u/0/my-drive',false],
      ['app','Working sheet','','','https://docs.google.com/spreadsheets/',false],
      ['meeting','Review meeting notes',`${prefix}-1`,'Agenda\n\n1. Review the current brief.\n2. Confirm open questions.\n3. Record a clear owner for each follow-up.\n\nDecisions\n\nNo decisions recorded yet.','',false],
      ['template','Brief template','','','https://example.com/dwdg/brief-template',false]
    ];
    specifications.forEach(([kind,title,parentId,content,url,pinned],index)=>{
      const row={id:`${prefix}-${index+1}`,workspaceId:workspace.id,projectId:project.id,kind,title,parentId,content,url,pinned,description:'',ownerId,
        contributorIds:index===1?people.map(person=>person.id):[],archived:false,createdBy:'demo-admin',createdAt:stamp,updatedAt:stamp,
        accessNote:NATIVE.has(kind)?'':'Illustrative link. Replace it with your working URL.',contact:'',sample:true};
      state.resources.push(row);
      if(TEXT.has(kind))state.revisions.push({id:`${row.id}-revision-1`,resourceId:row.id,label:'1',content,url:'',changeNote:'Illustrative initial revision',createdBy:'demo-admin',createdAt:stamp,approved:false});
    });
  }
  return state;
}

export function selectResources(state,workspaceId,{projectId='',folderId='',query='',kind='all',archived=false}={}) {
  const needle=String(query).trim().toLocaleLowerCase();
  const rows=state.resources.filter(row=>row.workspaceId===workspaceId&&(!projectId||row.projectId===projectId)&&row.archived===archived
    &&(kind==='all'||row.kind===kind)&&((needle||kind!=='all'||(!projectId&&!folderId))||row.parentId===folderId));
  return rows.filter(row=>!needle||[row.title,row.description,row.content,RESOURCE_KINDS[row.kind][0],RESOURCE_KINDS[row.kind][1],resourcePath(state.resources,row.id),
    PEOPLE.find(person=>person.id===row.ownerId)?.name,...row.contributorIds.map(id=>PEOPLE.find(person=>person.id===id)?.name)].join(' ').toLocaleLowerCase().includes(needle))
    .sort((a,b)=>(a.kind==='folder'?0:1)-(b.kind==='folder'?0:1)||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
}

export function createResourceStore(storage,{getProjectState=()=>({projects:[]}),actorId='demo-admin'}={}) {
  if(typeof actorId!=='string'||!actorId)fail('actor');
  let state=empty(),raw=null,warning='',protectedSource=false;
  try{if(storage===undefined)storage=globalThis.localStorage;if(!storage)fail('storage');raw=storage.getItem(RESOURCE_KEY);}catch{warning='storage';protectedSource=true;}
  if(raw!==null&&!protectedSource){try{const parsed=JSON.parse(raw);if(!validState(parsed))fail('corrupt');state=parsed;}catch{warning='corrupt';protectedSource=true;}}
  else if(!protectedSource){state=fixtures(getProjectState()?.projects||[]);try{raw=JSON.stringify(state);storage.setItem(RESOURCE_KEY,raw);}catch{raw=null;warning='storage';}}
  state=freeze(state);
  function commit(next) {
    if(protectedSource)fail(warning||'storage');
    let latest;try{latest=storage.getItem(RESOURCE_KEY);}catch{warning='storage';fail('storage');}
    if(latest!==raw)fail('conflict');
    next.revision=state.revision+1;if(!validState(next))fail('corrupt');
    let encoded;try{encoded=JSON.stringify(next);storage.setItem(RESOURCE_KEY,encoded);}catch{warning='storage';fail('storage');}
    state=freeze(next);raw=encoded;warning='';
  }
  function context(workspaceId,projectId) {
    if(!workspaceExists(workspaceId)||!getProjectState()?.projects?.some(row=>row.id===projectId&&row.workspaceId===workspaceId))fail('workspace');
  }
  function available(workspaceId,id) {
    const row=state.resources.find(item=>item.id===id&&item.workspaceId===workspaceId);if(!row)fail('record');context(workspaceId,row.projectId);return row;
  }
  function event(next,type,row) {next.events.push({id:crypto.randomUUID(),type,workspaceId:row.workspaceId,projectId:row.projectId,resourceId:row.id,title:row.title,createdBy:actorId,createdAt:new Date().toISOString()});}
  function applyActorUI(next,options={}) {
    if(options.actorUI!==undefined){if(!object(options.actorUI))fail('storage');(next.actorUI||={})[actorId]=copy(options.actorUI);}
  }
  function undoEntry(next,type,before,after) {
    const workspaceId=after[0]?.workspaceId||before[0]?.workspaceId;
    next.undo[workspaceId]=[...(next.undo[workspaceId]||[]),{type,before:copy(before),after:copy(after),
      revisionsBefore:copy(state.revisions.filter(row=>before.some(resource=>resource.id===row.resourceId))),
      revisionsAfter:copy(next.revisions.filter(row=>after.some(resource=>resource.id===row.resourceId))),
      issuesBefore:copy(state.issues.filter(row=>before.some(resource=>resource.id===row.resourceId))),
      issuesAfter:copy(next.issues.filter(row=>after.some(resource=>resource.id===row.resourceId)))}].slice(-30);
  }
  return {
    get state(){return state;},get warning(){return warning;},
    saveResource(workspaceId,projectId,input,id='',options={}) {
      context(workspaceId,projectId);if(!object(input))fail('title');
      if(!object(options))fail('workspace');
      if(options.viewKey!==undefined||options.viewState!==undefined){
        if(typeof options.viewKey!=='string'||!object(options.viewState))fail('workspace');
        const permittedKey=options.viewKey===`${workspaceId}:*`||getProjectState()?.projects?.some(project=>project.workspaceId===workspaceId&&options.viewKey===`${workspaceId}:${project.id}`);
        if(!permittedKey)fail('workspace');
      }
      const before=id?available(workspaceId,id):null;if(before&&(before.projectId!==projectId||before.archived))fail('record');
      const kind=before?.kind||input.kind;if(!own(RESOURCE_KINDS,kind))fail('kind');
      const title=typeof input.title==='string'?input.title.trim():'';if(!title)fail('title');
      const parentId=input.parentId??before?.parentId??'';
      if(typeof parentId!=='string')fail('hierarchy');
      if(parentId){const parent=available(workspaceId,parentId);if(parent.projectId!==projectId||parent.kind!=='folder'||parent.archived||parent.id===id||resourceDescendants(state.resources,id).some(row=>row.id===parentId))fail('hierarchy');}
      const collision=state.resources.some(row=>!row.archived&&row.workspaceId===workspaceId&&row.projectId===projectId&&row.parentId===parentId&&row.id!==id&&row.title.toLocaleLowerCase()===title.toLocaleLowerCase());
      if(collision&&!input.allowDuplicate)fail('collision');
      const ownerId=input.ownerId??before?.ownerId??'',contributorIds=input.contributorIds??before?.contributorIds??[];
      if(typeof ownerId!=='string'||!personExists(ownerId,workspaceId)||!Array.isArray(contributorIds)||!contributorIds.every(personId=>typeof personId==='string'&&!!personId&&personExists(personId,workspaceId)))fail('owner');
      const url=NATIVE.has(kind)?'':safeResourceURL(input.url??before?.url??'');
      const contentFormat=TEXT.has(kind)?input.contentFormat??before?.contentFormat??'plain':'plain';
      if(!validFormat(contentFormat))fail('format');
      const content=TEXT.has(kind)?String(input.content??before?.content??''):'';
      const referenceIds=noteReferenceIds(content,{contentFormat});
      const priorReferences=new Set(before?noteReferenceIds(before.content,{contentFormat:before.contentFormat||'plain'}):[]);
      for(const referenceId of referenceIds){
        const target=state.resources.find(item=>item.id===referenceId&&item.workspaceId===workspaceId&&!item.archived);
        const permitted=target&&target.id!==id&&getProjectState()?.projects?.some(project=>project.id===target.projectId&&project.workspaceId===workspaceId);
        if(!permitted&&!priorReferences.has(referenceId))fail('reference');
      }
      const now=new Date().toISOString(),row={...(before||{id:crypto.randomUUID(),workspaceId,projectId,kind,createdBy:actorId,createdAt:now,archived:false,pinned:false,sample:true}),
        title,parentId,ownerId,contributorIds:[...new Set(contributorIds)],url,content,contentFormat,referenceIds,
        description:String(input.description??before?.description??''),accessNote:String(input.accessNote??before?.accessNote??''),contact:String(input.contact??before?.contact??''),updatedAt:now,updatedBy:actorId};
      const next=copy(state);if(before)next.resources[next.resources.findIndex(item=>item.id===id)]=row;else next.resources.push(row);
      const changedVersion=!before||row.content!==before.content||row.url!==before.url||contentFormat!==(before.contentFormat||'plain');
      if(changedVersion&&kind!=='folder'){const revisions=next.revisions.filter(item=>item.resourceId===row.id);next.revisions.push({id:crypto.randomUUID(),resourceId:row.id,label:String(revisions.length+1),content:row.content,url:row.url,
        contentFormat,referenceIds:copy(referenceIds),changeNote:String(input.changeNote||''),createdBy:actorId,createdAt:now,approved:false});}
      const mutation=before?(changedVersion?'revision':row.parentId!==before.parentId?'move':'edit'):'add';
      undoEntry(next,mutation,before?[before]:[],[row]);event(next,mutation,row);
      if(before&&(row.ownerId!==before.ownerId||JSON.stringify(row.contributorIds)!==JSON.stringify(before.contributorIds)))event(next,'delegation',row);
      applyActorUI(next,options);
      if(options.viewKey){const views=options.actorUI!==undefined?next.actorUI[actorId].views:next.views;views[options.viewKey]={...views[options.viewKey],...copy(options.viewState),selectedId:row.id,panel:'detail',noteReading:TEXT.has(kind),formProjectId:row.projectId,noteReturns:[]};}
      if(!options.preserveUI)delete next.drafts[`${workspaceId}:${projectId}`];commit(next);return state.resources.find(item=>item.id===row.id);
    },
    archive(workspaceId,id) {
      const row=available(workspaceId,id);if(row.archived)fail('record');
      const before=[row,...(row.kind==='folder'?resourceDescendants(state.resources,id):[])].filter(item=>!item.archived);
      const ids=new Set(before.map(item=>item.id)),now=new Date().toISOString();const next=copy(state);
      next.resources=next.resources.map(item=>ids.has(item.id)?{...item,archived:true,pinned:false,updatedAt:now}:item);
      const after=next.resources.filter(item=>ids.has(item.id));undoEntry(next,'archive',before,after);event(next,'archive',row);commit(next);return before.length;
    },
    togglePin(workspaceId,id) {
      const before=available(workspaceId,id);if(before.archived)fail('record');const next=copy(state),row={...before,pinned:!before.pinned,updatedAt:new Date().toISOString()};
      next.resources[next.resources.findIndex(item=>item.id===id)]=row;undoEntry(next,'pin',[before],[row]);event(next,row.pinned?'pin':'unpin',row);commit(next);return row;
    },
    reportIssue(workspaceId,id,reason,details='') {
      const row=available(workspaceId,id);if(NATIVE.has(row.kind)||!['access','missing','expired','wrong'].includes(reason))fail('issue');const next=copy(state);
      const issue={id:crypto.randomUUID(),resourceId:id,reason,details:String(details),resolved:false,createdBy:actorId,createdAt:new Date().toISOString()};next.issues.push(issue);undoEntry(next,'link-issue',[row],[row]);event(next,'link-issue',row);commit(next);return issue;
    },
    resolveIssue(workspaceId,id) {
      const issue=state.issues.find(row=>row.id===id);if(!issue)fail('record');const row=available(workspaceId,issue.resourceId),next=copy(state);
      next.issues.find(item=>item.id===id).resolved=true;undoEntry(next,'link-issue-resolved',[row],[row]);event(next,'link-issue-resolved',row);commit(next);
    },
    saveUI({drafts,views}={}) {
      const next=copy(state);if(drafts!==undefined)next.drafts=copy(drafts);if(views!==undefined)next.views={...next.views,...copy(views)};commit(next);
    },
    saveActorUI(partial={}) {
      if(!object(partial))fail('storage');const next=copy(state),prior=next.actorUI?.[actorId]||{drafts:{},views:{}};
      (next.actorUI||={})[actorId]={...prior,...copy(partial)};commit(next);return state;
    },
    canUndo(workspaceId){return !!state.undo[workspaceId]?.length;},
    undo(workspaceId,options={}) {
      if(!workspaceExists(workspaceId))fail('workspace');const entry=state.undo[workspaceId]?.at(-1);if(!entry)return false;
      for(const after of entry.after){const current=available(workspaceId,after.id);if(JSON.stringify(current)!==JSON.stringify(after))fail('conflict');}
      const afterIds=new Set(entry.after.map(row=>row.id)),beforeIds=new Set(entry.before.map(row=>row.id));
      if([...afterIds].some(id=>!beforeIds.has(id)&&getProjectState()?.tasks?.some(task=>task.resourceId===id)))fail('dependent');
      if([...afterIds].some(id=>!beforeIds.has(id)&&state.resources.some(row=>row.parentId===id&&!afterIds.has(row.id))))fail('dependent');
      if([...afterIds].some(id=>!beforeIds.has(id)&&state.resources.some(row=>!afterIds.has(row.id)&&noteReferenceIds(row.content,{contentFormat:row.contentFormat||'plain'}).includes(id))))fail('dependent');
      const next=copy(state);next.resources=next.resources.filter(row=>!afterIds.has(row.id));next.resources.push(...copy(entry.before));
      next.revisions=next.revisions.filter(row=>!afterIds.has(row.resourceId));next.revisions.push(...copy(entry.revisionsBefore));
      if(Array.isArray(entry.issuesBefore)){next.issues=next.issues.filter(row=>!afterIds.has(row.resourceId));next.issues.push(...copy(entry.issuesBefore));}
      next.issues=next.issues.filter(row=>next.resources.some(resource=>resource.id===row.resourceId));next.undo[workspaceId].pop();event(next,'undo',entry.after[0]||entry.before[0]);applyActorUI(next,options);commit(next);return true;
    },
    export(workspaceId,projectId='') {
      if(!workspaceExists(workspaceId))fail('workspace');if(projectId)context(workspaceId,projectId);
      const resources=state.resources.filter(row=>row.workspaceId===workspaceId&&(!projectId||row.projectId===projectId)&&!row.archived);
      return {kind:'dwdg-one-resource-export',version:1,createdAt:new Date().toISOString(),scope:{workspaceId,projectId},
        notice:'Resource metadata and internal note text only. External file contents and provider permissions are not copied.',
        resources:copy(resources),revisions:copy(state.revisions.filter(row=>resources.some(resource=>resource.id===row.resourceId)))};
    }
  };
}
