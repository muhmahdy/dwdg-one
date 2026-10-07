import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {EXPERIENCE_KEYS} from './experience-data.mjs';
import {createPreviewStore} from './dwdg-one-preview-data.mjs';
import {resourceIdentityMarkup} from './dwdg-one-resource-identity.mjs';
import {mountResourceMaterials} from './dwdg-one-resource-material.mjs';
import {RESOURCE_KEY} from './dwdg-one-resources-data.mjs';
import {mountResources} from './dwdg-one-resources.mjs';
import {createOverlays} from './experience-ui.mjs';

test('material identities enhance only folder/file kinds while retaining an inert recognizable fallback',()=>{
  const window=new Window();
  try{
    for(const kind of ['folder','externalFolder','file','note','meeting','app','template']){
      window.document.body.innerHTML=resourceIdentityMarkup({kind});
      const host=window.document.body.firstElementChild,enhanced=['folder','externalFolder','file'].includes(kind);
      assert.equal(host.dataset.resourceKind,kind);
      assert.equal(host.getAttribute('aria-hidden'),'true');
      assert.equal(!!host.querySelector('canvas'),enhanced);
      assert.equal(host.querySelectorAll('button,a,input,[tabindex],[data-action]').length,0);
      if(enhanced){
        assert.equal(host.dataset.material,'static');
        assert.equal(host.dataset.materialKind,kind==='file'?'file':'folder');
        assert.ok(host.querySelector('.one-material-static'));
        assert.equal(host.querySelector('canvas').hidden,true);
        assert.equal(host.querySelector('canvas').getAttribute('aria-hidden'),'true');
        assert.equal(!!host.querySelector('.one-material-external'),kind!=='folder');
      }else assert.ok(host.querySelector('.ux-icon'),'Other resource kinds retain the shared UI icon');
    }
  }finally{window.happyDOM.abort();}
});

test('decorative markup cannot turn malformed identity input into executable elements or actions',()=>{
  const window=new Window();
  try{
    window.document.body.innerHTML=resourceIdentityMarkup({kind:'file" onclick="alert(1)" data-action="erase'}, {size:'large" autofocus'});
    const host=window.document.body.firstElementChild;
    assert.equal(host.dataset.resourceKind,'file" onclick="alert(1)" data-action="erase');
    assert.equal(window.document.querySelector('[onclick],[autofocus],[data-action],script,iframe'),null);
    assert.equal(window.document.querySelector('canvas'),null,'Unknown kinds do not initialize material effects');
  }finally{window.happyDOM.abort();}
});

async function environment(){
  const window=new Window({url:'http://localhost/dwdg-one-preview.html'});
  window.document.write('<!doctype html><html data-motion="reduced"><body class="one-preview"><main id="one-content"></main><aside id="one-inspector"></aside></body></html>');
  const names=['window','document','requestAnimationFrame','cancelAnimationFrame','matchMedia','getComputedStyle','innerWidth','innerHeight','HTMLElement','Element','Node','CSS','MutationObserver'];
  const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
  const preserved=new Map([...Object.values(EXPERIENCE_KEYS).map(key=>[key,'preserved product bytes '+key]),['dwdg-one-prd-v02','preserved user planning revision']]);
  const values=new Map(preserved),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const projects=createPreviewStore(storage);let workspaceId='consulting',language='en',app;
  const t=(en,id)=>language==='id'?id:en,ui=createOverlays({t});
  const render=()=>{document.getElementById('one-content').innerHTML=app.render();document.getElementById('one-inspector').innerHTML=app.inspector();};
  const mount=()=>app=mountResources({storage,getProjectState:()=>projects.state,getWorkspaceId:()=>workspaceId,getLanguage:()=>language,t,ui,onRender:render});
  const clickHandler=event=>{const target=event.target.closest('[data-action]');if(target)app.handleAction(target.dataset.action,target,event);};
  const inputHandler=event=>app.handleInput(event),submitHandler=event=>app.handleSubmit(event);
  document.addEventListener('click',clickHandler);document.addEventListener('input',inputHandler);document.addEventListener('submit',submitHandler);
  const settle=async()=>window.happyDOM.waitUntilComplete();
  const query=selector=>{const element=document.querySelector(selector);assert.ok(element,'Missing '+selector);return element;};
  const click=async selector=>{query(selector).click();await settle();};
  const set=async(selector,value)=>{const input=query(selector);input.value=value;input.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
  const unchanged=()=>{for(const[key,value]of preserved)assert.equal(values.get(key),value);};
  mount();render();await settle();
  return {window,storage,projects,query,click,set,render,settle,unchanged,get app(){return app;},
    async language(value){app.saveDraft();language=value;render();await settle();},
    async workspace(value){app.close();workspaceId=value;render();await settle();},
    async reload(beforeMount){app.destroy();beforeMount?.();mount();render();await settle();},
    async close(){app.destroy();ui.destroy();unchanged();document.removeEventListener('click',clickHandler);document.removeEventListener('input',inputHandler);document.removeEventListener('submit',submitHandler);await window.happyDOM.close();for(const[name,descriptor]of originals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
  };
}

test('actual explorer, pinned shortcuts and inspector preserve canonical resource labels/actions beneath identities',async()=>{
  const env=await environment();try{
    const records=JSON.stringify(env.app.store.state.resources),tasks=JSON.stringify(env.projects.state.tasks);
    const rows=[...document.querySelectorAll('.one-res-row')];
    assert.equal(rows.length,7);assert.equal(new Set(rows.map(row=>row.dataset.resourceId)).size,7);
    for(const row of rows){
      const resource=env.app.store.state.resources.find(resource=>resource.id===row.dataset.resourceId);
      const open=row.querySelector('[data-action="res-open"]');
      assert.equal(open.getAttribute('aria-label'),resource.title);assert.equal(open.querySelector('.one-res-title').textContent,resource.title);
      assert.equal(!!row.querySelector('.one-res-material'),['folder','externalFolder','file'].includes(resource.kind));
      assert.ok(row.querySelector('.one-res-type').textContent.trim());
    }
    const pinned=env.query('.one-res-pin-list [data-action="res-open"][data-id="demo-resource-consulting-1"]');
    assert.equal(pinned.querySelector('.one-res-material').dataset.materialSize,'small');
    assert.equal(pinned.textContent,'Working materials');
    await env.click('#one-res-more-demo-resource-consulting-3');
    assert.equal(env.app.store.state.views['consulting:*'].selectedId,'demo-resource-consulting-3');
    assert.equal(env.query('#one-inspector .one-res-material').dataset.materialSize,'large');
    assert.equal(env.query('#one-inspector .one-detail-title').textContent,'Reference document');
    assert.match(env.query('#one-inspector a').getAttribute('href'),/^https:/);
    await env.click('[data-action="res-close"]');
    assert.equal(document.activeElement.id,'one-res-more-demo-resource-consulting-3');
    assert.equal(JSON.stringify(env.app.store.state.resources),records);assert.equal(JSON.stringify(env.projects.state.tasks),tasks);env.unchanged();
  }finally{await env.close();}
});

test('resource identities do not expose other workspaces or change localized kinds/user labels',async()=>{
  const env=await environment();try{
    await env.language('id');
    const folder=env.query('[data-resource-id="demo-resource-consulting-1"]');
    const open=folder.querySelector('[data-action="res-open"]');
    assert.equal(open.getAttribute('aria-label'),'Working materials');assert.equal(open.querySelector('.one-res-title').textContent,'Working materials');
    assert.match(folder.querySelector('.one-res-type').textContent,/Folder/);
    await env.workspace('hr');
    assert.equal(document.querySelector('[data-resource-id^="demo-resource-consulting-"]'),null);
    assert.equal(document.querySelectorAll('.one-res-row').length,7);
    for(const host of document.querySelectorAll('.one-res-material')){
      const action=host.closest('[data-resource-id]')?.querySelector('[data-action]')||host.closest('[data-action]');
      assert.ok(action?.dataset.id.startsWith('demo-resource-hr-'));
    }
    env.unchanged();
  }finally{await env.close();}
});

test('compact resource rows retain distinct accessible names, honest context, responsibility and canonical inspector routes in both languages',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    const source=env.app.store.state.resources.find(row=>row.id===sourceId);
    env.app.store.saveResource('consulting',source.projectId,{...source,title:'Project brief — full title remains unchanged',ownerId:'co-arya',contributorIds:['co-nadia','demo-admin','co-arya']},sourceId);
    env.projects.createTask('consulting',{projectId:source.projectId,resourceId:sourceId,title:'Completed brief review',ownerId:'co-nadia',status:'done'});
    env.projects.createTask('consulting',{projectId:source.projectId,resourceId:sourceId,title:'Follow up on the brief',ownerId:'co-arya',status:'progress'});
    const canonical=()=>JSON.stringify({resources:env.app.store.state.resources,revisions:env.app.store.state.revisions,issues:env.app.store.state.issues,events:env.app.store.state.events,undo:env.app.store.state.undo,projects:env.projects.state.projects,tasks:env.projects.state.tasks,workEvents:env.projects.state.events,taskUndo:env.projects.state.taskUndo});
    const records=canonical();env.render();await env.settle();
    for(const language of ['en','id']){
      await env.language(language);const rows=[...document.querySelectorAll('.one-res-row')],contextIds=[];
      assert.equal(env.query('.one-res-heading [data-action="res-add"]').getAttribute('aria-label'),language==='en'?'Add resource':'Tambah sumber daya','Add keeps a localized accessible name when its visible label becomes hidden on narrow screens');
      assert.equal(rows.length,7);
      for(const row of rows){
        const resource=env.app.store.state.resources.find(item=>item.id===row.dataset.resourceId),open=row.querySelector('.one-res-name > [data-action="res-open"]'),contextId=open.getAttribute('aria-describedby'),context=document.getElementById(contextId);
        assert.equal(open.getAttribute('aria-label'),resource.title);assert.equal(open.querySelector('.one-res-title').textContent,resource.title);assert.equal(open.dataset.id,resource.id);
        assert.ok(contextId,'Each open button has an associated context description');assert.ok(context&&open.contains(context),'The description belongs to this resource open button');contextIds.push(contextId);
        assert.equal(document.querySelectorAll('[id]').length,new Set([...document.querySelectorAll('[id]')].map(element=>element.id)).size,'Rendered IDs remain unique, including pinned copies of the same resource');
        assert.match(context.textContent,/Consulting bootcamp/,'Workspace-wide rows retain the canonical project title');
        if(resource.parentId)assert.match(context.querySelector('.one-res-path').textContent,/Working materials/,'Nested resources retain their folder path');
        const linked=env.projects.state.tasks.filter(task=>task.resourceId===resource.id&&task.workspaceId===resource.workspaceId),summary=context.querySelector('.one-res-inline-summary').textContent;
        if(linked.length)assert.equal(summary.trim(),`· ${linked.filter(task=>task.status==='done').length} / ${linked.length} ${language==='en'?'tasks':'tugas'}`);
        else assert.match(summary,language==='en'?/· Updated \S/:/· Diperbarui \S/,'Inline dates retain their Updated meaning after the separate column disappears');
      }
      assert.equal(new Set(contextIds).size,rows.length);
      const sourceRow=env.query(`[data-resource-id="${sourceId}"]`),description=document.getElementById(sourceRow.querySelector('.one-res-name > button').getAttribute('aria-describedby'));
      assert.match(description.textContent,language==='en'?/Note/:/Catatan/);assert.match(description.textContent,language==='en'?/1 \/ 2 tasks/:/1 \/ 2 tugas/);
      const people=sourceRow.querySelector('.one-res-people'),name=people.getAttribute('aria-label');
      assert.match(name,language==='en'?/^Responsible people:/:/^Penanggung jawab:/);for(const expected of ['Arya Pratama','Nadia Putri',language==='en'?'Demo administrator':'Administrator contoh']){assert.ok(name.includes(expected));assert.equal(name.split(expected).length-1,1,'Responsibility names are deduplicated');}
      assert.equal(people.dataset.id,sourceId);
      const combined=sourceRow.querySelector(`#one-res-more-${sourceId}`),combinedName=combined.getAttribute('aria-label');
      assert.equal(combined.dataset.action,'res-inspect');assert.equal(combined.dataset.id,sourceId);assert.ok(combinedName.includes(sourceRow.querySelector('.one-res-title').textContent));assert.match(combinedName,language==='en'?/^More actions:.*Responsible people:/:/^Tindakan lainnya:.*Penanggung jawab:/);
      for(const expected of ['Arya Pratama','Nadia Putri',language==='en'?'Demo administrator':'Administrator contoh'])assert.equal(combinedName.split(expected).length-1,1,'The combined compact More button names each responsible person once');
      assert.equal(combined.querySelector('.one-res-more-people').getAttribute('aria-hidden'),'true');assert.equal(combined.querySelector('.one-res-more-count').textContent,'+2','Compact More retains the visible additional responsibility count');
      for(const id of rows.map(row=>row.dataset.resourceId)){
        const resource=env.app.store.state.resources.find(row=>row.id===id),button=env.query(`#one-res-row-${id}`);button.click();await env.settle();assert.equal(env.app.store.state.views['consulting:*'].selectedId,id,'Ordinary open resolves this canonical resource');
        if(resource.kind==='folder'){assert.equal(env.app.store.state.views['consulting:*'].folderId,id);await env.app.handleAction('res-folder',{dataset:{id:''}});await env.settle();}
        else await env.click('[data-action="res-close"]');
        await env.click(`#one-res-more-${id}`);assert.equal(env.app.store.state.views['consulting:*'].selectedId,id);assert.equal(env.query('#one-inspector .one-detail-title').textContent,resource.title);await env.click('[data-action="res-close"]');
        const keyboard=env.query(`#one-res-row-${id}`);keyboard.focus();keyboard.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));await env.settle();assert.equal(env.app.store.state.views['consulting:*'].selectedId,id);assert.equal(env.query('#one-inspector .one-detail-title').textContent,resource.title);await env.click('[data-action="res-close"]');assert.equal(document.activeElement.id,keyboard.id,'Closing the keyboard inspector returns focus to the same canonical open button');
        assert.equal(canonical(),records,'Reading and inspector routes persist only UI context, never canonical records or work');
      }
      env.unchanged();
    }
    assert.equal(canonical(),records);
  }finally{await env.close();}
});

test('stored resource instants cross the Jakarta midnight boundary without altering timestamps or recorded events',async()=>{
  const env=await environment(),earlyId='demo-resource-consulting-1',lateId='demo-resource-consulting-3',dateOnlyId='demo-resource-consulting-4';try{
    const file=env.app.store.state.resources.find(row=>row.id===lateId);env.app.store.saveResource('consulting',file.projectId,{...file,description:'A recorded metadata change before this date-display fixture.'},file.id);
    const stamps=new Map([[earlyId,'2026-10-03T16:59:00.000Z'],[lateId,'2026-10-03T17:30:00.000Z'],[dateOnlyId,'2026-10-03']]);
    await env.reload(()=>{const stored=JSON.parse(env.storage.getItem(RESOURCE_KEY));for(const [id,stamp]of stamps)stored.resources.find(row=>row.id===id).updatedAt=stamp;env.storage.setItem(RESOURCE_KEY,JSON.stringify(stored));});
    const records=JSON.stringify(env.app.store.state.resources),events=JSON.stringify(env.app.store.state.events),revisions=JSON.stringify(env.app.store.state.revisions);assert.ok(env.app.store.state.events.length,'The fixture includes existing event provenance that must remain unchanged');
    for(const language of ['en','id']){
      await env.language(language);const prefix=language==='en'?'Updated':'Diperbarui',month=language==='en'?'Oct':'Okt';
      for(const [id,day]of [[earlyId,3],[lateId,4],[dateOnlyId,3]]){
        const row=env.query(`[data-resource-id="${id}"]`);assert.equal(row.querySelector('.one-res-inline-summary').textContent.trim(),`· ${prefix} ${day} ${month}`);assert.equal(row.querySelector('.one-res-meta').textContent.trim(),`${day} ${month}`);assert.equal(env.app.store.state.resources.find(resource=>resource.id===id).updatedAt,stamps.get(id));
      }
      await env.click(`#one-res-more-${lateId}`);const updated=[...env.query('#one-inspector .one-property-grid').querySelectorAll('dt')].find(dt=>dt.textContent===prefix);assert.ok(updated);assert.equal(updated.nextElementSibling.textContent,`4 ${month}`);await env.click('[data-action="res-close"]');
      const stored=JSON.parse(env.storage.getItem(RESOURCE_KEY));assert.equal(JSON.stringify(stored.resources),records);assert.equal(JSON.stringify(stored.events),events);assert.equal(JSON.stringify(stored.revisions),revisions);env.unchanged();
    }
  }finally{await env.close();}
});

test('visual identity rerenders keep an unfinished note and selection when opening and returning from a cross-project file',async()=>{
  const env=await environment();try{
    const target=env.app.store.saveResource('consulting','demo-consulting-2',{kind:'file',title:'Reference output',url:'https://example.com/output.pdf',parentId:'',ownerId:'co-nadia',contributorIds:['co-arya']});
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-2"]');
    await env.click('.one-notes-header [data-action="res-edit"]');
    await env.set('#one-res-content',`Alpha Beta Gamma\n\n[output](resource:${target.id})`);
    await env.click('[data-action="res-note-format"][data-format="heading"]');
    const content=env.query('#one-res-content').value,editor=env.query('#one-res-content');
    editor.setSelectionRange(9,13);editor.scrollTop=27;editor.dispatchEvent(new env.window.Event('select',{bubbles:true}));
    await env.language('id');assert.equal(env.query('#one-res-content').selectionStart,9);assert.equal(env.query('#one-res-content').selectionEnd,13);
    await env.click('[data-action="res-note-mode"][data-mode="preview"]');
    await env.click(`.one-notes-preview [data-action="res-note-open-ref"][data-id="${target.id}"]`);
    assert.equal(env.query('#one-inspector .one-res-material').dataset.materialKind,'file');
    assert.equal(env.query('#one-inspector .one-detail-title').textContent,target.title);
    await env.reload();await env.click('[data-action="res-note-return"]');
    assert.equal(env.query('#one-res-content').value,content);
    await env.click('[data-action="res-note-mode"][data-mode="edit"]');
    assert.equal(env.query('#one-res-content').selectionStart,9);assert.equal(env.query('#one-res-content').selectionEnd,13);assert.equal(env.query('#one-res-content').scrollTop,27);
    const actual=env.app.store.state.resources.find(resource=>resource.id===target.id);
    assert.equal(actual.projectId,'demo-consulting-2');assert.equal(actual.ownerId,'co-nadia');assert.deepEqual(actual.contributorIds,['co-arya']);env.unchanged();
  }finally{await env.close();}
});

test('unavailable WebGL on real explorer markup keeps names/actions/static materials and never writes resource data',async()=>{
  const env=await environment();let controller;
  const prototype=env.window.HTMLCanvasElement.prototype,original=Object.getOwnPropertyDescriptor(prototype,'getContext');
  try{
    const requests=[],context2D={clearRect(){},drawImage(){throw new Error('Unavailable WebGL must never blit');}};
    Object.defineProperty(prototype,'getContext',{configurable:true,value(type){requests.push(type);return type==='2d'?context2D:null;}});
    const markVisible=()=>{for(const host of document.querySelectorAll('.one-res-material'))host.getBoundingClientRect=()=>({width:40,height:40,left:10,top:10,right:50,bottom:50});};
    markVisible();const before=env.storage.getItem(RESOURCE_KEY);
    controller=mountResourceMaterials(document.body,{enabled:true,motion:'system'});
    assert.equal(requests.filter(type=>type==='webgl').length,1);
    assert.equal(controller.metrics().reason,'gpu-unavailable');assert.equal(controller.metrics().draws,0);assert.equal(controller.metrics().activeContexts,0);
    for(const host of document.querySelectorAll('.one-res-material')){assert.equal(host.dataset.material,'static');assert.ok(host.querySelector('.one-material-static'));assert.ok([...host.querySelectorAll('canvas')].every(canvas=>canvas.hidden));}
    assert.equal(env.storage.getItem(RESOURCE_KEY),before,'Decorative rendering cannot write records, views or drafts');
    await env.click('#one-res-more-demo-resource-consulting-3');markVisible();controller.refresh({dark:true});
    assert.equal(env.query('#one-inspector .one-detail-title').textContent,'Reference document');assert.equal(env.query('#one-inspector .one-res-material').dataset.material,'static');
    assert.equal(requests.filter(type=>type==='webgl').length,1,'A known failed enhancement must not retry on every ordinary render');
    assert.equal(controller.metrics().pendingFrames,0);env.unchanged();
    controller.destroy();assert.equal(controller.metrics().hosts,0);assert.equal(controller.metrics().pendingFrames,0);
    await env.click('[data-action="res-close"]');assert.equal(document.activeElement.id,'one-res-more-demo-resource-consulting-3');
  }finally{controller?.destroy();if(original)Object.defineProperty(prototype,'getContext',original);else delete prototype.getContext;await env.close();}
});
