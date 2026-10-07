import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createPreviewStore} from './dwdg-one-preview-data.mjs';
import {RESOURCE_KEY} from './dwdg-one-resources-data.mjs';
import {mountResources} from './dwdg-one-resources.mjs';
import {createOverlays} from './experience-ui.mjs';

async function environment({readOnly=true,limited=false}={}) {
  const window=new Window({url:'http://localhost/dwdg-one-preview.html'}),names=['window','document','requestAnimationFrame','cancelAnimationFrame','matchMedia','getComputedStyle','innerWidth','innerHeight','HTMLElement','Element','Node','CSS','MutationObserver'];
  const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
  document.write('<!doctype html><html data-motion="reduced"><body class="one-preview"><main id="one-content"></main><aside id="one-inspector"></aside></body></html>');
  const data=new Map([['dwdg-workspace-v1','preserved existing app']]),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)},base=createPreviewStore(storage);
  const hidden=new Set(),notices=[],actorId='co-nadia',visibleProjects=new Set(base.state.projects.filter(row=>row.workspaceId==='consulting').map(row=>row.id));
  let raw,app,language='en',readonly=readOnly;
  const projectState=()=>({...base.state,projects:base.state.projects.filter(row=>visibleProjects.has(row.id)),tasks:base.state.tasks.filter(row=>visibleProjects.has(row.projectId))});
  const visible=row=>row.workspaceId==='consulting'&&visibleProjects.has(row.projectId)&&!hidden.has(row.id);
  const denied=()=>{const error=new Error('access');error.code='access';throw error;};
  const access={
    can(type,action,record={}){if(record.workspaceId&&record.workspaceId!=='consulting'||record.projectId&&!visibleProjects.has(record.projectId))return false;return !readonly&&(type!=='task'||action!=='create'||record.ownerId===actorId);},
    allowedFields(){return readonly?[]:limited?['title','description','content','contentFormat','url','accessNote','contact','changeNote']:null;},
    wrapResourceStore(store){raw=store;const facade={
      get state(){const resources=raw.state.resources.filter(visible),ids=new Set(resources.map(row=>row.id));return {...raw.state,resources,revisions:raw.state.revisions.filter(row=>ids.has(row.resourceId)),issues:raw.state.issues.filter(row=>ids.has(row.resourceId)),drafts:Object.fromEntries(Object.entries(raw.state.drafts).filter(([,draft])=>visibleProjects.has(draft.projectId)&&(!draft.id||ids.has(draft.id))))};},
      get warning(){return raw.warning;},
      saveUI(input){return raw.saveUI(input);},
      saveResource(workspaceId,projectId,fields,id='',options={}){const record=id?raw.state.resources.find(row=>row.id===id):{workspaceId,projectId};if(!access.can('resource',id?'update':'create',record)||id&&!visible(record))denied();const allowed=access.allowedFields();if(id&&allowed)for(const key of ['parentId','ownerId','contributorIds'])if(!allowed.includes(key)&&JSON.stringify(fields[key])!==JSON.stringify(record[key]))denied();return raw.saveResource(workspaceId,projectId,fields,id,options);},
      canUndo(workspaceId){return access.can('resource','undo',{workspaceId})&&raw.canUndo(workspaceId);},
      undo(workspaceId){if(!access.can('resource','undo',{workspaceId}))denied();return raw.undo(workspaceId);},
      export(workspaceId,projectId){if(!access.can('resource','export',{workspaceId,projectId}))denied();const exported=raw.export(workspaceId,projectId);return {...exported,resources:exported.resources.filter(visible)};}
    };for(const [method,action] of [['togglePin','pin'],['archive','archive'],['reportIssue','issue'],['resolveIssue','issue']])facade[method]=(workspaceId,id,...args)=>{const issue=method==='resolveIssue'?raw.state.issues.find(row=>row.id===id):null,record=raw.state.resources.find(row=>row.id===(issue?.resourceId||id));if(!record||!visible(record)||!access.can('resource',action,record))denied();return raw[method](workspaceId,id,...args);};return facade;}
  };
  const t=(en,id)=>language==='id'?id:en,ui=createOverlays({t}),query=selector=>{const found=document.querySelector(selector);assert.ok(found,'Missing '+selector);return found;};
  const render=()=>{document.getElementById('one-content').innerHTML=app.render();document.getElementById('one-inspector').innerHTML=app.inspector();};
  const mount=()=>app=mountResources({storage,getProjectState:projectState,getUnscopedProjectState:()=>base.state,getWorkspaceId:()=> 'consulting',getLanguage:()=>language,t,ui,onRender:render,onNotice:(code,text)=>notices.push({code,text}),onTaskCreate:input=>base.createTask(input.workspaceId,input),access,actorId});
  document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)app.handleAction(target.dataset.action,target,event);});document.addEventListener('input',event=>app.handleInput(event));document.addEventListener('submit',event=>app.handleSubmit(event));
  const settle=()=>window.happyDOM.waitUntilComplete(),click=async selector=>{query(selector).click();await settle();},set=async(selector,value)=>{const control=query(selector);control.value=value;control.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
  mount();render();await settle();
  return {app,base,data,storage,window,notices,query,click,set,settle,render,access,hidden,visibleProjects,get raw(){return raw;},readOnly(value){readonly=value;},language(value){language=value;render();},async direct(action,id='',extra={}){await app.handleAction(action,{dataset:{id,...extra}});await settle();},async submit(){query('#one-res-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();},async close(){app.destroy();ui.destroy();await window.happyDOM.close();for(const [name,value] of originals)if(value)Object.defineProperty(globalThis,name,value);else delete globalThis[name];}};
}

test('read-only resource scope keeps folder and reader routes while omitting mutations and export',async()=>{
  const env=await environment();try{
    assert.ok(env.raw.state.resources.some(row=>row.workspaceId==='hr'),'Raw fixture creation must use the full project state.');
    assert.ok(env.app.store.state.resources.every(row=>row.workspaceId==='consulting'));
    for(const action of ['add','export','undo'])assert.equal(document.querySelector(`[data-action="res-${action}"]`),null);
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');assert.match(env.query('.one-res-breadcrumbs').textContent,/Working materials/);
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-2"]');assert.match(env.query('.one-notes-body').textContent,/Capture the agreed scope/);
    for(const action of ['edit','pin','move','archive','task','export-note','issue'])assert.equal(document.querySelector(`[data-action="res-${action}"]`),null);
    await env.click('[data-action="res-inspect"]');assert.match(env.query('#one-inspector').textContent,/Project brief/);assert.ok(document.querySelector('[data-action="res-open-note"]'));
  }finally{await env.close();}
});

test('direct resource mutation routes cannot create forms, write saved bytes or export for a read-only role',async()=>{
  const env=await environment();try{
    const id='demo-resource-consulting-3',before=env.data.get(RESOURCE_KEY),tasksBefore=JSON.stringify(env.base.state.tasks);
    for(const action of ['add','edit','pin','move','move-here','archive','task','issue','undo','export','export-note'])await env.direct('res-'+action,id);
    assert.equal(document.querySelector('form'),null);assert.equal(document.querySelector('.ux-layer:not(.ux-leaving)'),null);assert.equal(env.data.get(RESOURCE_KEY),before);assert.equal(JSON.stringify(env.base.state.tasks),tasksBefore);
    assert.ok(env.notices.some(row=>row.code==='access'));env.language('id');await env.direct('res-edit',id);assert.match(env.query('#one-res-error').textContent,/peran yang dipilih/);
    assert.equal(env.data.get('dwdg-workspace-v1'),'preserved existing app');
  }finally{await env.close();}
});

test('scoped readers and revision text redact unavailable internal reference identities without rewriting saved notes',async()=>{
  const env=await environment({readOnly:false});try{
    const source='demo-resource-consulting-2',target='demo-resource-consulting-3';
    env.raw.saveResource('consulting','demo-consulting-1',{...env.raw.state.resources.find(row=>row.id===target),title:'PRIVATE legal file',url:'https://example.com/private-internal.pdf'},target);
    const content='Read [PRIVATE saved title](resource:'+target+').';env.raw.saveResource('consulting','demo-consulting-1',{...env.raw.state.resources.find(row=>row.id===source),content,contentFormat:'markdown'},source);
    env.hidden.add(target);env.render();await env.direct('res-open',source);
    const markup=document.body.innerHTML;for(const secret of ['PRIVATE saved title','PRIVATE legal file','private-internal.pdf',target])assert.ok(!markup.includes(secret),secret);
    assert.match(env.query('.one-notes-body').textContent,/Unavailable resource/);env.language('id');assert.match(env.query('.one-notes-body').textContent,/Sumber daya tidak tersedia/);
    assert.equal(env.raw.state.resources.find(row=>row.id===source).content,content);assert.equal(env.raw.state.revisions.at(-1).content,content);
    await env.direct('res-edit',source);await env.click('[data-action="res-note-reference"]');const picker=env.query('.one-notes-reference-picker');assert.ok(!picker.innerHTML.includes(target));assert.ok(!picker.textContent.includes('PRIVATE'));
  }finally{await env.close();}
});

test('limited resource editing omits delegation and move controls while retaining permitted metadata changes',async()=>{
  const env=await environment({readOnly:false,limited:true});try{
    const id='demo-resource-consulting-2',before=structuredClone(env.raw.state.resources.find(row=>row.id===id));await env.direct('res-inspect',id);
    assert.equal(document.querySelector('[data-action="res-move"]'),null);await env.click('[data-action="res-edit"]');
    for(const selector of ['#one-res-owner','#one-res-contributors','#one-res-parent'])assert.equal(document.querySelector(selector),null);
    await env.direct('res-picker','',{key:'owner'});assert.equal(document.querySelector('.one-res-popover'),null);
    await env.set('#one-res-title','Permitted edited title');await env.set('#one-res-content','Permitted text');await env.submit();
    const after=env.raw.state.resources.find(row=>row.id===id);assert.equal(after.title,'Permitted edited title');assert.equal(after.content,'Permitted text');assert.equal(after.ownerId,before.ownerId);assert.deepEqual(after.contributorIds,before.contributorIds);assert.equal(after.parentId,before.parentId);assert.equal(after.updatedBy,'co-nadia');
  }finally{await env.close();}
});

test('role revocation denies pending Save and retains its exact draft without exposing it after the record disappears',async()=>{
  const env=await environment({readOnly:false});try{
    const id='demo-resource-consulting-2';await env.direct('res-open',id);await env.click('[data-action="res-edit"]');await env.set('#one-res-title','Private unfinished title');await env.set('#one-res-content','Exact unfinished private text');const saved=env.raw.state.resources.find(row=>row.id===id).content;
    env.readOnly(true);await env.submit();assert.equal(env.raw.state.resources.find(row=>row.id===id).content,saved);assert.equal(env.raw.state.drafts['consulting:demo-consulting-1'].fields.content,'Exact unfinished private text');assert.match(env.query('#one-res-error').textContent,/unavailable for the selected role/);
    env.hidden.add(id);env.render();for(const secret of ['Private unfinished title','Exact unfinished private text','Capture the agreed scope'])assert.ok(!document.body.innerHTML.includes(secret),secret);assert.ok(document.querySelector('#one-res-search'));assert.equal(document.querySelector('[data-action="res-resume"]'),null);
    env.hidden.delete(id);env.readOnly(false);env.render();await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-title').value,'Private unfinished title');assert.equal(env.query('#one-res-content').value,'Exact unfinished private text');
  }finally{await env.close();}
});

test('archive rechecks access after confirmation and cannot commit after a scope change',async()=>{
  const env=await environment({readOnly:false});try{
    const id='demo-resource-consulting-3';await env.direct('res-inspect',id);env.query('[data-action="res-archive"]').click();await new Promise(resolve=>setTimeout(resolve,0));assert.ok(document.querySelector('.ux-layer--confirm:not(.ux-leaving)'));
    env.readOnly(true);await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');assert.equal(env.raw.state.resources.find(row=>row.id===id).archived,false);assert.match(env.query('#one-inspector').textContent,/Reference document/);
  }finally{await env.close();}
});

test('scoped related task creation defaults to the actor and excludes delegation to another person',async()=>{
  const env=await environment({readOnly:false});try{
    await env.direct('res-inspect','demo-resource-consulting-3');await env.click('[data-action="res-task"]');assert.match(env.query('#one-res-task-owner').textContent,/Nadia Putri/);await env.click('#one-res-task-owner');const picker=env.query('.one-res-popover');assert.ok(picker.querySelector('[data-value="co-nadia"]'));assert.equal(picker.querySelector('[data-value="co-arya"]'),null);assert.equal(picker.querySelector('[data-value="demo-admin"]'),null);
  }finally{await env.close();}
});

test('an approved replacement dialog cannot discard or open a form after its permission is revoked',async()=>{
  const env=await environment({readOnly:false});try{
    await env.direct('res-open','demo-resource-consulting-2');await env.click('[data-action="res-edit"]');await env.set('#one-res-content','Keep this pending draft exact');await env.click('[data-action="res-close"]');
    const draft=structuredClone(env.raw.state.drafts['consulting:demo-consulting-1']);await env.direct('res-inspect','demo-resource-consulting-3');env.query('[data-action="res-edit"]').click();await new Promise(resolve=>setTimeout(resolve,0));assert.ok(document.querySelector('.ux-layer--confirm:not(.ux-leaving)'));
    env.readOnly(true);await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');assert.deepEqual(env.raw.state.drafts['consulting:demo-consulting-1'],draft);assert.equal(document.querySelector('#one-res-form'),null);
  }finally{await env.close();}
});

test('pending issue reports are retained when direct submission loses permission',async()=>{
  const env=await environment({readOnly:false});try{
    const id='demo-resource-consulting-3';await env.direct('res-inspect',id);await env.click('[data-action="res-issue"]');await env.set('#one-res-issue-details','Exact unfinished access report');const before=env.raw.state.issues.length;env.readOnly(true);
    env.query('#one-res-issue-form').dispatchEvent(new env.window.Event('submit',{bubbles:true,cancelable:true}));await env.settle();assert.equal(env.raw.state.issues.length,before);assert.equal(env.raw.state.views['consulting:*'].issueDrafts[id].details,'Exact unfinished access report');assert.match(env.query('#one-res-error').textContent,/unavailable for the selected role/);
    env.render();assert.ok(!document.body.textContent.includes('Exact unfinished access report'));assert.equal(document.querySelector('[data-action="res-resume-issue"]'),null);
  }finally{await env.close();}
});

test('refreshScope discards inaccessible UI copies and later recovers permitted saved drafts',async()=>{
  const env=await environment({readOnly:false});try{
    const id='demo-resource-consulting-2';await env.direct('res-open',id);await env.click('[data-action="res-edit"]');await env.set('#one-res-content','Private scoped draft body');env.app.saveDraft();env.hidden.add(id);env.app.refreshScope();env.render();
    assert.ok(!document.body.innerHTML.includes('Private scoped draft body'));assert.equal(document.querySelector('#one-res-form'),null);assert.equal(env.app.hasInspector,false);assert.equal(document.querySelector('[data-action="res-resume"]'),null);
    env.hidden.delete(id);env.app.refreshScope();env.render();await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-content').value,'Private scoped draft body');
  }finally{await env.close();}
});

test('project dependency guard returns a boolean for hidden and archived resources without exposing raw state',async()=>{
  const env=await environment({readOnly:false});try{
    const project='demo-hr-1';assert.equal(env.app.store.state.resources.some(row=>row.projectId===project),false);assert.equal(env.app.hasProjectResources(project),true);assert.equal(env.app.hasProjectResources('missing-project'),false);
    env.raw.archive('hr','demo-resource-hr-1');assert.equal(env.app.hasProjectResources(project),true);assert.equal(Object.hasOwn(env.app,'rawStore'),false);
  }finally{await env.close();}
});
