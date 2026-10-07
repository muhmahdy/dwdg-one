import {WORKSPACES} from './dwdg-one-preview-data.mjs';
import {resourceDescendants} from './dwdg-one-resources-data.mjs';
import {noteReferenceIds,parseNoteReferences} from './dwdg-one-note.mjs';

/** Local preview policy only. This is not authentication or a server security boundary. */
const copy=value=>structuredClone(value);
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const fail=()=>{const error=new Error('access');error.code='access';throw error;};
const families=['project','task','resource','blocker'];
const workspaceIDs=new Set(WORKSPACES.map(row=>row.id));
const auditFields=new Set(['id','workspaceId','createdAt','updatedAt','createdBy','updatedBy','completedAt','sample','requestId']);
const controls=new Set(['allowDuplicate','changeNote']);
const resourceMetadata=['title','description','ownerId','contributorIds','parentId','url','accessNote','contact'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const emptyWork=()=>({contexts:{},drafts:{}});
const defaults=()=>({language:'en',theme:'light',motion:'system',transparency:'translucent',workspaceId:'consulting'});
const stripActorUI=state=>{const {actorUI,...rest}=state;return rest;};

export function createPreviewAccess(config) {
  const isDefault=config===undefined;
  if(!isDefault&&(!object(config)||typeof config.actorId!=='string'||!config.actorId||typeof config.role!=='string'||!config.role))fail();
  const actorId=isDefault?'demo-admin':config.actorId,role=isDefault?'admin':config.role;
  let workspaceIds=new Set(isDefault?workspaceIDs:[]),permissions={},hidden={};
  let projectSource=()=>({projects:[],tasks:[],blockers:[]}),resourceSource=()=>({resources:[]});
  let projectPendingUI=null,resourcePendingUI=null;
  function scope(partial={}) {
    if(!object(partial)||partial.actorId!==undefined&&partial.actorId!==actorId)fail();
    if(partial.workspaceIds!==undefined&&(!Array.isArray(partial.workspaceIds)||partial.workspaceIds.some(id=>!workspaceIDs.has(id))))fail();
    if(partial.permissions!==undefined){if(!object(partial.permissions))fail();for(const actions of Object.values(partial.permissions)){if(!object(actions))fail();for(const [action,value] of Object.entries(actions))if(object(value)&&value.fields!==undefined&&['read','export'].includes(action))fail();}}
    if(partial.hiddenIds!==undefined&&(!object(partial.hiddenIds)||Object.entries(partial.hiddenIds).some(([family,ids])=>!families.includes(family)||!Array.isArray(ids)||ids.some(id=>typeof id!=='string'))))fail();
    if(partial.workspaceIds!==undefined)workspaceIds=new Set(partial.workspaceIds);
    if(partial.permissions!==undefined)permissions=copy(partial.permissions);
    if(partial.hiddenIds!==undefined)hidden={...hidden,...copy(partial.hiddenIds)};
  }
  if(!isDefault)scope(config);
  const allowsWorkspace=id=>workspaceIds.has(id);
  const projectFor=record=>projectSource().projects?.find(row=>row.id===(record.projectId||record.id));
  function hiddenRecord(family,record) {
    if(!record||!allowsWorkspace(record.workspaceId)||(hidden[family]||[]).includes(record.id))return true;
    if(family==='project')return false;
    if(!record.projectId||(hidden.project||[]).includes(record.projectId))return true;
    const parent=projectSource().projects?.find(row=>row.id===record.projectId);
    if(parent&&parent.workspaceId!==record.workspaceId)return true;
    if(family==='resource'){
      const seen=new Set([record.id]);let parentId=record.parentId;
      while(parentId){if(seen.has(parentId)||(hidden.resource||[]).includes(parentId))return true;seen.add(parentId);const folder=resourceSource().resources?.find(row=>row.id===parentId);if(!folder||folder.workspaceId!==record.workspaceId||folder.projectId!==record.projectId)return true;parentId=folder.parentId;}
    }
    return false;
  }
  function rule(family,action){return isDefault?true:permissions[family]?.[action];}
  function permitted(ruleValue,family,record){
    if(ruleValue===true)return true;
    if(!object(ruleValue))return false;
    if(ruleValue.ownOnly&&(family==='project'?record.leadId:record.ownerId)!==actorId)return false;
    if(ruleValue.projectIds!==undefined&&(!Array.isArray(ruleValue.projectIds)||!ruleValue.projectIds.includes(family==='project'?(record.id||record.projectId):record.projectId)))return false;
    if(ruleValue.fields!==undefined&&(!Array.isArray(ruleValue.fields)||ruleValue.fields.some(field=>typeof field!=='string')))return false;
    return true;
  }
  function can(family,action,record={}) {
    if(isDefault)return families.includes(family)&&allowsWorkspace(record?.workspaceId);
    if(!families.includes(family)||hiddenRecord(family,record)||!permitted(rule(family,action),family,record))return false;
    if(family!=='project'){
      const parent=projectFor(record);if(!parent||!can('project','read',parent))return false;
    }
    return true;
  }
  function unavailableReferences(record){return !isDefault&&noteReferenceIds(record?.content||'',{contentFormat:record?.contentFormat||'plain'}).some(id=>!can('resource','read',known('resource',id)||{}));}
  function allowedFields(family,record){if(!can(family,'update',record))return [];const value=rule(family,'update'),fields=object(value)&&Array.isArray(value.fields)?[...value.fields]:null;if(family==='resource'&&unavailableReferences(record))return fields===null?[...resourceMetadata]:fields.filter(field=>!['content','contentFormat','referenceIds'].includes(field));return fields;}
  function check(family,action,record){if(!can(family,action,record))fail();}
  function changedFields(before,input) {
    return Object.keys(input||{}).filter(key=>!auditFields.has(key)&&!controls.has(key)&&!same(before?.[key],input[key])&&!(before?.[key]===undefined&&input[key]==='')&&!(before?.[key]===undefined&&key==='priority'&&input[key]==='normal'));
  }
  function checkFields(family,record,input,action='update'){
    check(family,action,record);const value=rule(family,action),fields=action==='update'?allowedFields(family,record):object(value)?value.fields:null;
    if(Array.isArray(fields)&&changedFields(record,input).some(key=>!fields.includes(key)))fail();
  }
  function known(family,id){return (family==='resource'?resourceSource().resources:projectSource()[`${family}s`])?.find(row=>row.id===id);}
  function lookup(family,workspaceId,id,action='read') {const row=known(family,id);if(!row||row.workspaceId!==workspaceId)fail();check(family,'read',row);if(action!=='read')check(family,action,row);return row;}
  function visibleProject(id,workspaceId){const row=known('project',id);return !!row&&(!workspaceId||row.workspaceId===workspaceId)&&can('project','read',row);}
  function contextAllowed(key,family){const at=key.indexOf(':');const ws=at<0?key:key.slice(0,at),project=at<0?'':key.slice(at+1);return allowsWorkspace(ws)&&(!project||project==='*'||project==='all'||visibleProject(project,ws))&&(family==='project'||!!rule(family,'read'));}
  function draftAllowed(family,key,draft){
    if(!contextAllowed(key,family)||!object(draft))return false;
    const ws=draft.workspaceId||key.split(':')[0],id=family==='project'?draft.projectId:family==='task'?draft.taskId:draft.id;
    if(id){const row=known(family,id);return !!row&&row.workspaceId===ws&&can(family,'read',row)&&can(family,'update',row);}
    const projectId=draft.projectId||draft.fields?.projectId||(family==='task'&&key.split(':')[1]!== 'all'?key.split(':').slice(1).join(':'):'');
    return can(family,'create',{workspaceId:ws,projectId,...draft.fields});
  }
  function cleanView(family,key,value) {
    const view=copy(value),ws=key.split(':')[0],target=family==='task'?'task':family==='resource'?'resource':'project';
    if(view.selectedId&&!can(target,'read',known(target,view.selectedId)||{})){view.selectedId='';view.panel='';view.noteReading=false;for(const field of ['taskDraft','issueDraft','moveDraft','noteReturns'])delete view[field];}
    if(Array.isArray(view.selectedIds))view.selectedIds=view.selectedIds.filter(id=>can('task','read',known('task',id)||{}));
    if(view.folderId&&!can('resource','read',known('resource',view.folderId)||{}))view.folderId='';
    for(const field of ['projectPageId','formProjectId'])if(view[field]&&!visibleProject(view[field],ws)){view[field]='';if(field==='formProjectId')view.panel='';}
    if(view.projectId&&!['all','*'].includes(view.projectId)&&!visibleProject(view.projectId,ws))view.projectId='all';
    if(Array.isArray(view.noteReturns))view.noteReturns=view.noteReturns.filter(origin=>origin.workspaceId===ws&&(!origin.sourceId||can('resource','read',known('resource',origin.sourceId)||{}))&&(!origin.projectId||visibleProject(origin.projectId,ws)));
    if(view.taskDraft?.fields&&!can('task','create',{workspaceId:ws,...view.taskDraft.fields}))delete view.taskDraft;
    if(view.panel==='form'&&view.selectedId&&!can(target,'update',known(target,view.selectedId)||{}))view.panel='';
    return view;
  }
  // Hidden drafts are retained privately even when a new draft uses the same context key.
  function projectDrafts(ui,family) {return family==='task'?ui.workUI?.drafts||{}:ui.drafts||{};}
  function draftProjection(ui,family) {
    const map=projectDrafts(ui,family),bank=ui.retainedDrafts?.[family]||{},result={};
    for(const key of new Set([...Object.keys(map),...Object.keys(bank)])){
      const candidates=[map[key],...(Array.isArray(bank[key])?bank[key]:[])];const draft=candidates.find(row=>draftAllowed(family,key,row));if(draft)result[key]=copy(draft);
    }
    return result;
  }
  function mergeDrafts(ui,family,incoming) {
    if(!object(incoming))fail();const map=projectDrafts(ui,family),bank=((ui.retainedDrafts||={})[family]||={});
    for(const [key,value] of Object.entries(incoming))if(!draftAllowed(family,key,value))fail();
    const projected=draftProjection(ui,family);
    for(const key of new Set([...Object.keys(projected),...Object.keys(incoming)])){
      const old=projected[key],next=incoming[key];
      if(old){if(same(map[key],old)){if(next)map[key]=copy(next);else delete map[key];}else {const list=bank[key]||[],index=list.findIndex(row=>same(row,old));if(index>=0){if(next)list[index]=copy(next);else list.splice(index,1);}}}
      else if(next){if(map[key]){(bank[key]||=[]).push(copy(next));}else map[key]=copy(next);}
    }
    if(family==='task'){(ui.workUI||=emptyWork()).drafts=map;}else ui.drafts=map;
    return ui;
  }
  function dropDraft(ui,family,key){const incoming=draftProjection(ui,family);delete incoming[key];return mergeDrafts(ui,family,incoming);}
  function uiSnapshot(raw,resource=false) {
    const pending=resource?resourcePendingUI:projectPendingUI;if(pending)return copy(pending);
    if(raw.actorUI?.[actorId])return copy(raw.actorUI[actorId]);
    if(resource)return {drafts:{},views:{}};
    const preferences={...defaults(),...raw.preferences};preferences.workspaceId=[...workspaceIds][0]||'consulting';
    return {preferences,drafts:{},views:{},workUI:emptyWork()};
  }
  function privateProjection(raw,resource=false){
    const ui=uiSnapshot(raw,resource),family=resource?'resource':'project';
    const result={drafts:draftProjection(ui,family),views:Object.fromEntries(Object.entries(ui.views||{}).filter(([key])=>contextAllowed(key,family)).map(([key,value])=>[key,cleanView(family,key,value)]))};
    if(!resource){result.preferences={...ui.preferences};if(!allowsWorkspace(result.preferences.workspaceId))result.preferences.workspaceId=[...workspaceIds][0]||result.preferences.workspaceId||'consulting';
      result.workUI={...copy(ui.workUI||emptyWork()),contexts:Object.fromEntries(Object.entries(ui.workUI?.contexts||{}).filter(([key])=>contextAllowed(key,'task')).map(([key,value])=>[key,cleanView('task',key,value)])),drafts:draftProjection(ui,'task')};}
    return result;
  }
  function savePrivateUI(raw,ui,resource=false){if(resource)resourcePendingUI=copy(ui);else projectPendingUI=copy(ui);const result=raw.saveActorUI(ui);if(resource)resourcePendingUI=null;else projectPendingUI=null;return result;}
  function commitMutation(callback,resource=false){const result=callback();if(resource)resourcePendingUI=null;else projectPendingUI=null;return result;}
  function historical(family,id,raw){
    const found=known(family,id);if(found)return found;
    if(family==='resource')for(const rows of Object.values(raw.undo||{}))for(const entry of rows)for(const row of [...entry.before,...entry.after])if(row.id===id)return row;
    if(family==='project')for(const value of Object.values(raw.undo||{}))for(const entry of value.entries||[])if(entry.projectId===id)return entry.after||entry.before;
    if(family==='task')for(const value of Object.values(raw.taskUndo||{}))for(const entry of value.entries||[])for(const change of entry.changes||[entry])if(change.taskId===id)return change.after||change.before;
    return null;
  }
  function undoAllowed(family,entry){
    if(!entry)return false;
    const changes=family==='resource'?entry.after.map(after=>({before:entry.before.find(row=>row.id===after.id)||null,after})):entry.changes||[entry];
    return changes.length>0&&changes.every(change=>{
      const row=change.after||change.before;if(!can(family,'read',row)||!can(family,'undo',row))return false;
      if(change.before&&!can(family,'read',change.before))return false;
      const undoRule=rule(family,'undo');if(change.before&&object(undoRule)&&Array.isArray(undoRule.fields)&&changedFields(row,change.before).some(field=>!undoRule.fields.includes(field)))return false;
      if(family==='resource'&&['pin','archive','link-issue','link-issue-resolved'].includes(entry.type)){
        const action={pin:'pin',archive:'archive','link-issue':'issue','link-issue-resolved':'issue'}[entry.type];return can(family,action,row);
      }
      if(!change.before)return can(family,'create',row);
      try{checkFields(family,row,change.before);return true;}catch{return false;}
    });
  }
  function projectState(raw){
    if(!object(raw))return raw;projectSource=projectSource.store?projectSource:()=>raw;
    const result=stripActorUI(raw);if(isDefault)return result;
    const projects=(raw.projects||[]).filter(row=>can('project','read',row)),tasks=(raw.tasks||[]).filter(row=>can('task','read',row)),blockers=(raw.blockers||[]).filter(row=>can('blocker','read',row));
    const events=(raw.events||[]).filter(event=>{const family=String(event.kind||'').split('.')[0];return families.includes(family)&&can(family,'read',historical(family,event.recordId,raw)||{id:event.recordId,workspaceId:event.workspaceId,projectId:event.projectId});});
    const undo=Object.fromEntries(Object.entries(raw.undo||{}).filter(([ws])=>allowsWorkspace(ws)).map(([ws,value])=>[ws,{...value,entries:(value.entries||[]).filter(entry=>undoAllowed('project',entry))}]));
    const taskUndo=Object.fromEntries(Object.entries(raw.taskUndo||{}).filter(([ws])=>allowsWorkspace(ws)).map(([ws,value])=>[ws,{...value,entries:(value.entries||[]).filter(entry=>undoAllowed('task',entry))}]));
    return {...result,projects,tasks,blockers,events,undo,taskUndo,...privateProjection(raw)};
  }
  function resourceState(raw,rawProjectState=projectSource()){
    if(!object(raw))return raw;if(!projectSource.store)projectSource=()=>rawProjectState;if(!resourceSource.store)resourceSource=()=>raw;
    const result=stripActorUI(raw);if(isDefault)return result;
    const resources=(raw.resources||[]).filter(row=>can('resource','read',row)).map(row=>unavailableReferences(row)?{...row,hasUnavailableReferences:true}:row),ids=new Set(resources.map(row=>row.id));
    return {...result,resources,revisions:(raw.revisions||[]).filter(row=>ids.has(row.resourceId)),issues:(raw.issues||[]).filter(row=>ids.has(row.resourceId)),
      events:(raw.events||[]).filter(event=>can('resource','read',historical('resource',event.resourceId,raw)||{id:event.resourceId,workspaceId:event.workspaceId,projectId:event.projectId})),
      undo:Object.fromEntries(Object.entries(raw.undo||{}).filter(([ws])=>allowsWorkspace(ws)).map(([ws,entries])=>[ws,entries.filter(entry=>undoAllowed('resource',entry))])),...privateProjection(raw,true)};
  }
  function mutationUI(raw,resource,options={}){return isDefault?options:{...options,preserveUI:true,actorUI:uiSnapshot(raw,resource)};}
  function projectWrapper(raw,{hasProjectDependents}={}) {
    const source=()=>raw.state;source.store=raw;projectSource=source;
    return {
      get state(){return projectState(raw.state);},get warning(){return raw.warning;},
      saveUI(partial={}){if(isDefault)return raw.saveUI(partial);const ui=uiSnapshot(raw.state);
        if(partial.preferences){if(partial.preferences.workspaceId!==undefined&&!allowsWorkspace(partial.preferences.workspaceId)&&!(workspaceIds.size===0&&workspaceIDs.has(partial.preferences.workspaceId)))fail();ui.preferences={...ui.preferences,...copy(partial.preferences)};}
        if(partial.drafts!==undefined)mergeDrafts(ui,'project',partial.drafts);
        if(partial.views!==undefined){for(const [key,value] of Object.entries(partial.views)){if(!contextAllowed(key,'project'))fail();ui.views[key]={...ui.views[key],...cleanView('project',key,value)};}}
        return savePrivateUI(raw,ui);},
      saveWorkUI(workUI){if(isDefault)return raw.saveWorkUI(workUI);if(!object(workUI)||!object(workUI.contexts))fail();const ui=uiSnapshot(raw.state);mergeDrafts(ui,'task',workUI.drafts||{});
        for(const [key,value] of Object.entries(workUI.contexts)){if(!contextAllowed(key,'task'))fail();ui.workUI.contexts[key]=cleanView('task',key,value);}return savePrivateUI(raw,ui);},
      saveProject(ws,input,id='',options={}){if(isDefault)return raw.saveProject(ws,input,id,options);if(id){const before=lookup('project',ws,id);checkFields('project',before,input);check('project','update',{...before,...input,id,workspaceId:ws});}else check('project','create',{...input,workspaceId:ws});
        const next=mutationUI(raw.state,false,options);dropDraft(next.actorUI,'project',ws);return commitMutation(()=>raw.saveProject(ws,input,id,next));},
      saveTask(ws,input,id='',options={}){if(isDefault)return raw.saveTask(ws,input,id,options);let before=null;if(id){before=lookup('task',ws,id);checkFields('task',before,input);check('task','update',{...before,...input,id,workspaceId:ws});}else check('task','create',{...input,workspaceId:ws});
        if(input.projectId&&!visibleProject(input.projectId,ws))fail();if(input.resourceId&&input.resourceId!==before?.resourceId&&!can('resource','read',known('resource',input.resourceId)||{}))fail();
        const next=mutationUI(raw.state,false,options);if(options.draftKey)dropDraft(next.actorUI,'task',options.draftKey);return commitMutation(()=>raw.saveTask(ws,input,id,next));},
      createTask(ws,input){return this.saveTask(ws,input);},
      saveTasks(ws,ids,patch,options={}){if(isDefault)return raw.saveTasks(ws,ids,patch,options);if(!Array.isArray(ids)||!ids.length)fail();for(const id of ids){const before=lookup('task',ws,id);checkFields('task',before,patch);check('task','update',{...before,...patch,id,workspaceId:ws});}
        const next=mutationUI(raw.state,false,options);if(options.contextKey&&next.actorUI.workUI.contexts[options.contextKey])next.actorUI.workUI.contexts[options.contextKey].selectedIds=[];return commitMutation(()=>raw.saveTasks(ws,ids,patch,next));},
      canUndo(ws){const entry=raw.state.undo?.[ws]?.entries?.at(-1);if(entry&&!entry.before&&hasProjectDependents?.(entry.projectId))return false;return isDefault?raw.canUndo(ws):allowsWorkspace(ws)&&undoAllowed('project',entry);},
      undo(ws,options={}){if(isDefault){if(hasProjectDependents&&!this.canUndo(ws)&&raw.canUndo(ws))fail();return raw.undo(ws,options);}if(!this.canUndo(ws))fail();const next=mutationUI(raw.state,false,options),entry=raw.state.undo[ws].entries.at(-1);if(!entry.before&&next.actorUI.views[ws]?.selectedId===entry.projectId)next.actorUI.views[ws]={...next.actorUI.views[ws],selectedId:'',panel:''};return commitMutation(()=>raw.undo(ws,next));},
      canUndoTask(ws){return isDefault?raw.canUndoTask(ws):allowsWorkspace(ws)&&undoAllowed('task',raw.state.taskUndo?.[ws]?.entries?.at(-1));},
      undoTask(ws,options={}){if(isDefault)return raw.undoTask(ws,options);if(!this.canUndoTask(ws))fail();const next=mutationUI(raw.state,false,options),entry=raw.state.taskUndo[ws].entries.at(-1);if(!entry.before&&entry.kind!=='batch')for(const view of Object.values(next.actorUI.workUI.contexts))if(view.selectedId===entry.taskId){view.selectedId='';view.panel='';}return commitMutation(()=>raw.undoTask(ws,next));},
      export(ws,projectId=''){if(!allowsWorkspace(ws))fail();const state=this.state,projects=state.projects.filter(row=>row.workspaceId===ws&&(!projectId||row.id===projectId));if(projectId&&!projects.length)fail();for(const row of projects)check('project','export',row);
        const ids=new Set(projects.map(row=>row.id));return {kind:'dwdg-one-project-export',version:1,scope:{workspaceId:ws,projectId},projects:copy(projects),tasks:copy(state.tasks.filter(row=>ids.has(row.projectId)&&can('task','export',row))),blockers:copy(state.blockers.filter(row=>ids.has(row.projectId)&&can('blocker','export',row)))};}
    };
  }
  function resourceWrapper(raw,{getProjectState}={}) {
    const source=()=>raw.state;source.store=raw;resourceSource=source;if(getProjectState&&!projectSource.store)projectSource=getProjectState;
    return {
      get state(){return resourceState(raw.state,getProjectState?.()||projectSource());},get warning(){return raw.warning;},
      saveUI(partial={}){if(isDefault)return raw.saveUI(partial);const ui=uiSnapshot(raw.state,true);if(partial.drafts!==undefined)mergeDrafts(ui,'resource',partial.drafts);if(partial.views!==undefined)for(const [key,value] of Object.entries(partial.views)){if(!contextAllowed(key,'resource'))fail();ui.views[key]={...ui.views[key],...cleanView('resource',key,value)};}return savePrivateUI(raw,ui,true);},
      saveResource(ws,pid,input,id='',options={}){if(isDefault)return raw.saveResource(ws,pid,input,id,options);if(!visibleProject(pid,ws))fail();let before=null;if(id){before=lookup('resource',ws,id);if(before.projectId!==pid)fail();checkFields('resource',before,input);check('resource','update',{...before,...input,id,workspaceId:ws,projectId:pid});}else check('resource','create',{...input,workspaceId:ws,projectId:pid});
        if(input.parentId)lookup('resource',ws,input.parentId);const prior=new Set(before?noteReferenceIds(before.content,{contentFormat:before.contentFormat||'plain'}):[]);for(const referenceId of noteReferenceIds(input.content??before?.content??'',{contentFormat:input.contentFormat??before?.contentFormat??'plain'}))if(!prior.has(referenceId))lookup('resource',ws,referenceId);
        if(options.viewKey&&!contextAllowed(options.viewKey,'resource'))fail();const next=mutationUI(raw.state,true,options);dropDraft(next.actorUI,'resource',`${ws}:${pid}`);return commitMutation(()=>raw.saveResource(ws,pid,input,id,next),true);},
      archive(ws,id){if(isDefault)return raw.archive(ws,id);const row=lookup('resource',ws,id);for(const item of [row,...(row.kind==='folder'?resourceDescendants(raw.state.resources,id):[])].filter(item=>!item.archived))check('resource','archive',item);return raw.archive(ws,id);},
      togglePin(ws,id){if(!isDefault)lookup('resource',ws,id,'pin');return raw.togglePin(ws,id);},
      reportIssue(ws,id,reason,details=''){if(!isDefault)lookup('resource',ws,id,'issue');return raw.reportIssue(ws,id,reason,details);},
      resolveIssue(ws,id){if(!isDefault){const issue=raw.state.issues.find(row=>row.id===id);if(!issue)fail();lookup('resource',ws,issue.resourceId,'issue');}return raw.resolveIssue(ws,id);},
      canUndo(ws){return isDefault?raw.canUndo(ws):allowsWorkspace(ws)&&undoAllowed('resource',raw.state.undo?.[ws]?.at(-1));},
      undo(ws,options={}){if(isDefault)return raw.undo(ws,options);if(!this.canUndo(ws))fail();return commitMutation(()=>raw.undo(ws,mutationUI(raw.state,true,options)),true);},
      export(ws,pid=''){if(isDefault)return raw.export(ws,pid);if(!allowsWorkspace(ws)||pid&&!visibleProject(pid,ws))fail();const result=raw.export(ws,pid),ids=new Set(this.state.resources.filter(row=>!row.archived&&row.workspaceId===ws&&(!pid||row.projectId===pid)&&can('resource','export',row)).map(row=>row.id));
        if(!permitted(rule('resource','export'),'resource',{workspaceId:ws,projectId:pid})&&!ids.size)fail();const language=projectState(projectSource()).preferences?.language||'en',neutral=language==='id'?'Sumber daya tidak tersedia':'Unavailable resource';
        const sanitize=row=>{let content=row.content;if((row.contentFormat||'plain')==='markdown')for(const ref of parseNoteReferences(content).reverse())if(!can('resource','read',known('resource',ref.id)||{}))content=content.slice(0,ref.start)+neutral+content.slice(ref.end);return {...row,content,...(Array.isArray(row.referenceIds)?{referenceIds:row.referenceIds.filter(id=>can('resource','read',known('resource',id)||{}))}:{})};};return {...result,resources:result.resources.filter(row=>ids.has(row.id)).map(sanitize),revisions:result.revisions.filter(row=>ids.has(row.resourceId)).map(sanitize)};}
    };
  }
  return {actorId,role,isDefault,visibleWorkspaces:()=>WORKSPACES.filter(row=>allowsWorkspace(row.id)),allowsWorkspace,can,allowedFields,projectState,resourceState,
    wrapProjectStore:projectWrapper,wrapResourceStore:resourceWrapper,updateScope(partial){if(isDefault)fail();scope(partial);return this;}};
}
