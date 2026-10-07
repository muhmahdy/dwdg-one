import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createPreviewStore} from './dwdg-one-preview-data.mjs';
import {RESOURCE_KEY} from './dwdg-one-resources-data.mjs';
import {mountResources} from './dwdg-one-resources.mjs';
import {createOverlays} from './experience-ui.mjs';

async function environment({shellRecovery=false}={}) {
  const window=new Window({url:'http://localhost/dwdg-one-preview.html'});
  const names=['window','document','requestAnimationFrame','cancelAnimationFrame','matchMedia','getComputedStyle','innerWidth','innerHeight','HTMLElement','Element','Node','CSS','MutationObserver'];
  const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
  window.document.write('<!doctype html><html data-motion="reduced"><body class="one-preview"><main id="one-content"></main><aside id="one-inspector"></aside></body></html>');
  const data=new Map([['dwdg-workspace-v1','unchanged real data']]);let failSave=false,resourceWrites=0,failedResourceWrite=0;
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>{if(key===RESOURCE_KEY)resourceWrites++;if(failSave||key===RESOURCE_KEY&&resourceWrites===failedResourceWrite)throw new Error('Storage failure');data.set(key,value);}};
  const base=createPreviewStore(storage);let workspaceId='consulting',language='en',app,selectedProject=base.state.projects.find(row=>row.workspaceId==='consulting').id,notices=[];
  const t=(en,id)=>language==='id'?id:en,ui=createOverlays({t});
  const query=selector=>{const found=document.querySelector(selector);assert.ok(found,'Missing '+selector);return found;};
  const render=()=>{const scroll=window.scrollY,focusedId=document.activeElement?.id;document.getElementById('one-content').innerHTML=app.render({projectId:selectedProject});document.getElementById('one-inspector').innerHTML=app.inspector();if(shellRecovery){if(focusedId)document.getElementById(focusedId)?.focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'});}};
  const mount=()=>app=mountResources({storage,getProjectState:()=>base.state,getWorkspaceId:()=>workspaceId,getLanguage:()=>language,t,ui,onRender:render,onNotice:(code,text)=>notices.push({code,text}),onTaskCreate:input=>base.createTask(input.workspaceId,input)});
  document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)app.handleAction(target.dataset.action,target,event);});
  document.addEventListener('input',event=>app.handleInput(event));document.addEventListener('submit',event=>app.handleSubmit(event));
  const settle=async()=>{await window.happyDOM.waitUntilComplete();};
  const click=async selector=>{query(selector).click();await settle();};
  const set=async(selector,value)=>{const control=query(selector);control.value=value;control.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();};
  const choose=async(selector,value)=>{await click(selector);await click('.ux-layer:not(.ux-leaving) [data-value="'+value+'"]');};
  const submit=async selector=>{query(selector).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();};
  const reload=async beforeMount=>{app.destroy();beforeMount?.();mount();render();await settle();};
  mount();render();await settle();
  return {window,data,storage,base,query,click,set,choose,submit,settle,reload,render,notices,
    get app(){return app;},get resourceWrites(){return resourceWrites;},failSave(value){failSave=value;},failResourceWrite(offset=1){failedResourceWrite=resourceWrites+offset;},clearWriteFailure(){failedResourceWrite=0;},changeLanguage(value){language=value;render();},
    async workspace(id){app.close();workspaceId=id;selectedProject=base.state.projects.find(row=>row.workspaceId===id).id;render();await settle();},
    async globalLibrary(){app.close();selectedProject='';render();await settle();},
    async close(){app.destroy();ui.destroy();await window.happyDOM.close();for(const [name,descriptor]of originals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
  };
}

test('Resources controls support connected editing journeys in the shared preview shell',async suite=>{
  const env=await environment();try{
    await suite.test('nested folders, named contributors and keyboard-accessible inspector are discoverable',async()=>{
      assert.equal(document.querySelectorAll('.one-res-row').length,4);assert.equal(document.querySelectorAll('select').length,0);
      await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');assert.equal(document.querySelectorAll('.one-res-row').length,3);
      assert.match(env.query('.one-res-breadcrumbs').textContent,/Working materials/);
      await env.click('[data-action="res-inspect"][data-id="demo-resource-consulting-2"]');assert.match(env.query('#one-inspector').textContent,/Nadia Putri/);
      await env.click('[data-action="res-close"]');assert.equal(document.activeElement.id,'one-res-row-demo-resource-consulting-2');
      const title=env.query('#one-res-row-demo-resource-consulting-2');title.focus();title.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));await env.settle();
      assert.equal(env.app.hasInspector,true);assert.match(env.query('#one-inspector').textContent,/Project brief/);
    });
    await suite.test('create and edit note saves revisions; drafts recover across workspace switch and reload',async()=>{
      await env.click('[data-action="res-close"]');await env.click('[data-action="res-add"]');await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');
      await env.set('#one-res-title','Research findings');await env.set('#one-res-content','Unfinished text remains exact.');
      await env.workspace('hr');assert.ok(!document.body.textContent.includes('Research findings'));
      await env.workspace('consulting');await env.reload();await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-title').value,'Research findings');assert.equal(env.query('#one-res-content').value,'Unfinished text remains exact.');
      await env.submit('#one-res-form');const resource=env.app.store.state.resources.find(row=>row.title==='Research findings');assert.ok(resource);assert.equal(env.app.store.state.revisions.filter(row=>row.resourceId===resource.id).length,1);
      await env.click('[data-action="res-edit"]');await env.set('#one-res-content','Second saved revision.');await env.submit('#one-res-form');await env.reload();
      assert.equal(env.app.store.state.resources.find(row=>row.id===resource.id).content,'Second saved revision.');assert.equal(env.app.store.state.revisions.filter(row=>row.resourceId===resource.id).length,2);
    });
    await suite.test('storage failure retains typed note content and exposes no saved success',async()=>{
      await env.click('[data-action="res-edit"]');const text=Array.from({length:1000},(_,i)=>`word${i}`).join(' ');await env.set('#one-res-content',text);
      const before=env.data.get(RESOURCE_KEY);env.failSave(true);await env.submit('#one-res-form');assert.equal(env.query('#one-res-content').value,text);
      assert.equal(env.query('#one-res-error').hidden,false);assert.match(env.query('#one-res-error').textContent,/not saved|Storage/i);assert.equal(env.data.get(RESOURCE_KEY),before);
      env.failSave(false);await env.submit('#one-res-form');assert.ok(env.app.store.state.resources.some(row=>row.content===text));
    });
    await suite.test('responsibility, title and type search affect exact permitted rows',async()=>{
      await env.click('[data-action="res-close"]');await env.set('#one-res-search','Nadia Putri');assert.equal(document.querySelectorAll('.one-res-row').length,1);
      await env.click('[data-action="res-inspect"]');await env.click('[data-action="res-edit"]');await env.choose('#one-res-owner','co-nadia');
      await env.click('#one-res-contributors');await env.click('.ux-layer:not(.ux-leaving) [data-value="co-arya"]');await env.click('.ux-layer:not(.ux-leaving) [data-value="co-nadia"]');
      await env.app.handleAction('res-close',env.query('[data-action="res-close"]'));await env.settle();await env.click('[data-action="res-resume"]');await env.submit('#one-res-form');await env.reload();
      const note=env.app.store.state.resources.find(row=>row.id==='demo-resource-consulting-2');assert.equal(note.ownerId,'co-nadia');assert.equal(note.contributorIds.length,0);
      await env.click('[data-action="res-close"]');await env.set('#one-res-search','');await env.choose('#one-res-type-filter','template');assert.equal(document.querySelectorAll('.one-res-row').length,1);
    });
    await suite.test('unsafe link has inline validation; one resource task uses the canonical work store and idempotent request',async()=>{
      await env.click('[data-action="res-add"]');await env.click('.ux-layer:not(.ux-leaving) [data-value="file"]');await env.set('#one-res-title','Output link');await env.set('#one-res-url','javascript:alert(1)');await env.submit('#one-res-form');
      assert.match(env.query('#one-res-error').textContent,/HTTPS/);assert.equal(env.query('#one-res-url').value,'javascript:alert(1)');await env.set('#one-res-url','https://example.com/output.pdf');await env.submit('#one-res-form');
      const resource=env.app.store.state.resources.find(row=>row.title==='Output link');await env.click('[data-action="res-task"]');await env.set('#one-res-task-title','Review linked output');await env.choose('#one-res-task-owner','co-nadia');
      const taskBefore=env.base.state.tasks.length;await env.submit('#one-res-task-form');assert.equal(env.base.state.tasks.length,taskBefore+1);const task=env.base.state.tasks.find(row=>row.resourceId===resource.id);
      assert.equal(task.ownerId,'co-nadia');assert.equal(task.title,'Review linked output');assert.match(env.query('#one-inspector').textContent,/Review linked output/);await env.reload();assert.equal(env.base.state.tasks.filter(row=>row.resourceId===resource.id).length,1);
    });
    await suite.test('Indonesian controls preserve user content and current workspace isolation',async()=>{
      env.changeLanguage('id');assert.match(env.query('#one-content').textContent,/Sumber daya/);assert.match(env.query('#one-inspector').textContent,/Output link/);
      assert.match(env.query('#one-inspector').textContent,/Penanggung jawab utama/);await env.workspace('finance');assert.ok(!document.body.textContent.includes('Output link'));
      assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
    });
    await suite.test('workspace-wide folder navigation shows children and creates in the selected folder project',async()=>{
      env.changeLanguage('en');await env.workspace('consulting');await env.globalLibrary();await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');
      const childIds=env.app.store.state.resources.filter(resource=>resource.parentId==='demo-resource-consulting-1'&&!resource.archived).map(resource=>resource.id).sort();
      assert.deepEqual([...document.querySelectorAll('[data-resource-id]')].map(element=>element.dataset.resourceId).sort(),childIds);
      await env.click('[data-action="res-add"]');assert.ok(document.querySelector('.ux-layer:not(.ux-leaving) [data-value="note"]'),'Inside a workspace folder, Add should choose a resource type in that folder project');
      await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');await env.set('#one-res-title','Kept folder note');await env.set('#one-res-content','Do not replace my unsaved research.');await env.click('[data-action="res-close"]');
    });
    await suite.test('editing another resource guards a kept draft; revisiting the same resource resumes its text',async()=>{
      const original=env.app.store.state.drafts['consulting:demo-consulting-1'];assert.equal(original.fields.title,'Kept folder note');
      await env.click('[data-action="res-inspect"][data-id="demo-resource-consulting-2"]');await env.click('[data-action="res-edit"]');
      assert.ok(document.querySelector('.ux-layer--confirm:not(.ux-leaving)'));await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="cancel"]');
      assert.deepEqual(env.app.store.state.drafts['consulting:demo-consulting-1'],original);await env.click('[data-action="res-close"]');await env.click('[data-action="res-resume"]');
      assert.equal(env.query('#one-res-content').value,'Do not replace my unsaved research.');await env.submit('#one-res-form');
      const saved=env.app.store.state.resources.find(resource=>resource.title==='Kept folder note');await env.click('[data-action="res-edit"]');await env.set('#one-res-content','Unsaved second edit.');await env.click('[data-action="res-close"]');
      await env.click('[data-action="res-inspect"][data-id="'+saved.id+'"]');await env.click('[data-action="res-edit"]');assert.equal(env.query('#one-res-content').value,'Unsaved second edit.');await env.submit('#one-res-form');
    });
    await suite.test('resource toast Undo targets its original workspace after context changes',async()=>{
      await env.click('[data-action="res-close"]');await env.click('[data-action="res-folder"][data-id=""]');await env.set('#one-res-search','Brief template');await env.click('[data-action="res-inspect"][data-id="demo-resource-consulting-7"]');await env.click('[data-action="res-pin"]');
      assert.equal(env.app.store.state.resources.find(resource=>resource.id==='demo-resource-consulting-7').pinned,true);
      const hrNote=env.app.store.saveResource('hr','demo-hr-1',{kind:'note',title:'HR change must stay',parentId:'',content:'Separate workspace',ownerId:'',contributorIds:[]});
      await env.workspace('hr');await env.click('.ux-toast button');
      assert.equal(env.app.store.state.resources.find(resource=>resource.id==='demo-resource-consulting-7').pinned,false);
      assert.ok(env.app.store.state.resources.some(resource=>resource.id===hrNote.id),'Undo from a Consulting toast must not remove HR work');
    });
    await suite.test('link issue reason and typed details recover after language, workspace and reload changes',async()=>{
      await env.workspace('consulting');await env.globalLibrary();await env.set('#one-res-search','Reference document');await env.click('[data-action="res-inspect"][data-id="demo-resource-consulting-3"]');await env.click('[data-action="res-issue"]');
      await env.click('#one-res-issue-form input[value="expired"]');await env.set('#one-res-issue-details','The existing document link expired before the review.');
      env.changeLanguage('id');assert.equal(env.query('#one-res-issue-form input[value="expired"]').checked,true);assert.equal(env.query('#one-res-issue-details').value,'The existing document link expired before the review.');
      await env.workspace('hr');await env.workspace('consulting');await env.globalLibrary();await env.reload();await env.click('[data-action="res-resume-issue"]');
      assert.equal(env.query('#one-res-issue-form input[value="expired"]').checked,true);assert.equal(env.query('#one-res-issue-details').value,'The existing document link expired before the review.');
      env.failSave(true);await env.submit('#one-res-issue-form');assert.equal(env.query('#one-res-issue-details').value,'The existing document link expired before the review.');assert.equal(env.query('#one-res-error').hidden,false);
      env.failSave(false);await env.submit('#one-res-issue-form');const saved=env.app.store.state.issues.find(issue=>issue.resourceId==='demo-resource-consulting-3');assert.equal(saved.reason,'expired');assert.equal(saved.details,'The existing document link expired before the review.');assert.equal(document.querySelector('[data-action="res-resume-issue"]'),null);
    });
  }finally{await env.close();}
});

test('Notes support a saved reader, inline formatting, safe links and a recoverable resource-reference journey',async suite=>{
  const env=await environment();const sourceId='demo-resource-consulting-2';let target;
  try{
    await suite.test('ordinary open uses the full reader; More keeps a summary and Back restores the explorer',async()=>{
      await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.set('#one-res-search','Project brief');env.window.scrollTo({top:180});
      await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);assert.ok(env.query('#one-content .one-notes-sheet'));assert.equal(env.app.hasInspector,false);assert.equal(env.query('#one-inspector').textContent,'');assert.match(env.query('.one-notes-heading').textContent,/Last editor: Unknown/);
      await env.click('.one-notes-header [data-action="res-inspect"]');assert.equal(env.app.hasInspector,true);assert.match(env.query('#one-inspector').textContent,/Project brief/);await env.click('[data-action="res-open-note"]');assert.ok(env.query('.one-notes-sheet'));assert.equal(env.app.hasInspector,false);
      await env.click('.one-notes-header [data-action="res-close"]');assert.equal(env.query('#one-res-search').value,'Project brief');assert.match(env.query('.one-res-breadcrumbs').textContent,/Working materials/);assert.equal(env.window.scrollY,180);assert.equal(env.query(`[data-resource-id="${sourceId}"]`).classList.contains('selected'),true);
    });
    await suite.test('legacy plain text stays literal until a deliberate formatting action; formatted preview restores the caret',async()=>{
      const original=env.app.store.state.resources.find(resource=>resource.id===sourceId);env.app.store.saveResource('consulting',original.projectId,{...original,content:'# Literal heading\n**literal emphasis**',contentFormat:'plain'},sourceId);env.render();
      await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);assert.match(env.query('.one-notes-body').textContent,/# Literal heading/);assert.equal(env.query('.one-notes-body').querySelector('strong,h1,h2'),null);
      await env.click('.one-notes-header [data-action="res-edit"]');assert.equal(env.app.hasInspector,false);assert.ok(env.query('#one-content #one-res-form'));assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].fields.contentFormat,'plain');
      await env.set('#one-res-content','Findings to share');const editor=env.query('#one-res-content');editor.focus();editor.setSelectionRange(0,8);await env.click('[data-action="res-note-format"][data-format="bold"]');
      assert.equal(env.query('#one-res-content').value,'**Findings** to share');assert.equal(document.activeElement.id,'one-res-content');assert.equal(env.query('#one-res-content').selectionStart,2);assert.equal(env.query('#one-res-content').selectionEnd,10);assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].fields.contentFormat,'markdown');
      await env.click('[data-action="res-note-mode"][data-mode="preview"]');assert.equal(env.query('#one-res-content').hidden,true);assert.equal(env.query('.one-notes-preview strong').textContent,'Findings');assert.equal(env.query('.one-notes-preview').hidden,false);
      await env.click('[data-action="res-note-mode"][data-mode="edit"]');assert.equal(env.query('#one-res-content').selectionStart,2);assert.equal(env.query('#one-res-content').selectionEnd,10);
    });
    await suite.test('HTTPS insertion rejects unsafe destinations and inserts one safe link at the selected caret',async()=>{
      const editor=env.query('#one-res-content');editor.setSelectionRange(editor.value.length,editor.value.length);await env.click('[data-action="res-note-link"]');await env.set('#one-notes-link-label','Open report');await env.set('#one-notes-link-url','javascript:alert(1)');
      const before=env.query('#one-res-content').value;await env.click('[data-overlay-action="insert-note-link"]');assert.equal(env.query('#one-notes-link-error').hidden,false);assert.equal(document.activeElement.id,'one-notes-link-url');assert.equal(env.query('#one-res-content').value,before);
      await env.set('#one-notes-link-url','https://example.com/report?q=a&b=1');await env.click('[data-overlay-action="insert-note-link"]');assert.ok(env.query('#one-res-content').value.includes('[Open report](https://example.com/report?q=a&b=1)'));assert.equal(document.activeElement.id,'one-res-content');
      await env.click('[data-action="res-note-mode"][data-mode="preview"]');const anchor=env.query('.one-notes-preview a');assert.equal(anchor.getAttribute('href'),'https://example.com/report?q=a&b=1');assert.equal(anchor.getAttribute('target'),'_blank');assert.match(anchor.getAttribute('rel'),/noopener/);assert.equal(env.query('.one-notes-preview').querySelector('[href^="javascript:"]'),null);
      await env.click('[data-action="res-note-mode"][data-mode="edit"]');
    });
    await suite.test('internal picker excludes self/foreign records and uses a canonical cross-project resource without copying responsibility',async()=>{
      target=env.app.store.saveResource('consulting','demo-consulting-2',{kind:'note',title:'Canonical output note',parentId:'',content:'Cross-project reference target.',contentFormat:'markdown',ownerId:'co-nadia',contributorIds:['co-arya']});
      const foreign=env.app.store.state.resources.find(resource=>resource.id==='demo-resource-hr-2');env.app.store.saveResource('hr',foreign.projectId,{...foreign,title:'PRIVATE HR NOTE'},foreign.id);
      const editor=env.query('#one-res-content');editor.setSelectionRange(editor.value.length,editor.value.length);await env.click('[data-action="res-note-reference"]');assert.equal(document.querySelector(`.ux-layer:not(.ux-leaving) [data-value="${sourceId}"]`),null);assert.doesNotMatch(env.query('.ux-layer:not(.ux-leaving)').textContent,/PRIVATE HR NOTE/);
      await env.set('#one-notes-reference-search','Canonical output');await env.click(`.ux-layer:not(.ux-leaving) [data-value="${target.id}"]`);assert.match(env.query('#one-res-content').value,new RegExp(`resource:${target.id}`));assert.equal(document.activeElement.id,'one-res-content');
      assert.equal(env.app.store.state.resources.find(resource=>resource.id===sourceId).ownerId,'co-arya');assert.equal(env.app.store.state.resources.find(resource=>resource.id===target.id).ownerId,'co-nadia');
    });
    await suite.test('opening a reference preserves an unfinished note, scroll and caret; return works after reload',async()=>{
      const editor=env.query('#one-res-content'),text=editor.value;editor.setSelectionRange(2,10);editor.scrollTop=96;env.window.scrollTo({top:210});await env.click('[data-action="res-note-mode"][data-mode="preview"]');
      const state=structuredClone(env.app.store.state.drafts['consulting:demo-consulting-1'].noteUI);await env.click(`.one-notes-preview [data-action="res-note-open-ref"][data-id="${target.id}"]`);assert.equal(env.query('.one-notes-heading h2').textContent,'Canonical output note');assert.ok(env.query('[data-action="res-note-return"]'));assert.equal(env.app.store.state.resources.find(resource=>resource.id===sourceId).content,'# Literal heading\n**literal emphasis**');
      await env.reload();await env.click('[data-action="res-note-return"]');assert.equal(env.query('#one-res-content').value,text);assert.equal(env.window.scrollY,210);assert.equal(env.query('#one-res-content').selectionStart,state.selectionStart);assert.equal(env.query('#one-res-content').selectionEnd,state.selectionEnd);assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].noteUI.textareaScroll,96);assert.equal(env.query('.one-notes-preview').hidden,false);
      await env.click('[data-action="res-note-mode"][data-mode="edit"]');assert.equal(document.activeElement.id,'one-res-content');assert.equal(env.query('#one-res-content').selectionStart,2);assert.equal(env.query('#one-res-content').selectionEnd,10);assert.equal(env.query('#one-res-content').scrollTop,96);
    });
    await suite.test('failed Save retains note text and caret; actual Save creates one revision and returns to the reader',async()=>{
      const revisions=env.app.store.state.revisions.filter(revision=>revision.resourceId===sourceId).length,text=env.query('#one-res-content').value;env.failSave(true);await env.submit('#one-res-form');assert.equal(env.query('#one-res-content').value,text);assert.equal(env.query('#one-res-error').hidden,false);assert.equal(env.app.store.state.revisions.filter(revision=>revision.resourceId===sourceId).length,revisions);assert.doesNotMatch(document.querySelector('.ux-toast')?.textContent||'',/Resource saved/);
      env.failSave(false);await env.submit('#one-res-form');assert.ok(env.query('.one-notes-sheet'));assert.equal(document.querySelector('#one-res-form'),null);assert.equal(env.app.hasInspector,false);assert.equal(env.app.store.state.revisions.filter(revision=>revision.resourceId===sourceId).length,revisions+1);assert.equal(env.app.store.state.resources.find(resource=>resource.id===sourceId).contentFormat,'markdown');assert.deepEqual(env.app.store.state.resources.find(resource=>resource.id===sourceId).referenceIds,[target.id]);assert.match(env.query('.one-notes-heading').textContent,/Last editor: Demo administrator/);assert.equal(env.query('.one-notes-body strong').textContent,'Findings');
      await env.reload();assert.equal(env.query('.one-notes-body strong').textContent,'Findings');assert.equal(env.query(`.one-notes-body [data-id="${target.id}"]`).textContent,'Canonical output note');
    });
    await suite.test('archived references become neutral in the saved reader; language and workspace changes preserve note text',async()=>{
      env.app.store.archive('consulting',target.id);env.render();assert.equal(document.querySelector(`.one-notes-body [data-id="${target.id}"]`),null);assert.doesNotMatch(env.query('.one-notes-document').textContent,/Canonical output note/);assert.match(env.query('.one-notes-document').textContent,/unavailable/i);
      await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-description','Unrelated metadata edit keeps the old unavailable reference.');await env.submit('#one-res-form');
      env.changeLanguage('id');assert.match(env.query('.one-notes-document').textContent,/tidak tersedia/i);assert.match(env.query('.one-notes-heading').textContent,/Editor terakhir/);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Draf saya tetap persis.');await env.workspace('hr');assert.doesNotMatch(document.body.textContent,/Draf saya tetap persis/);await env.workspace('consulting');await env.reload();await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-content').value,'Draf saya tetap persis.');assert.match(env.query('.one-notes-toolbar').getAttribute('aria-label'),/Format catatan/);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
    });
  }finally{await env.close();}
});

test('note recovery retains canonical form identity and selection across explorer context, reload and language renders',async suite=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    await suite.test('resuming an unchanged note after folder navigation cancels back to that note',async()=>{
      await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-inspect"][data-id="${sourceId}"]`);await env.click('[data-action="res-edit"]');await env.click('[data-action="res-close"]');await env.click('[data-action="res-close"]');
      await env.click('[data-action="res-folder"][data-id=""]');await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click('[data-action="res-resume"]');await env.click('[data-action="res-cancel"]');
      assert.equal(document.querySelector('.ux-layer--confirm:not(.ux-leaving)'),null);assert.equal(env.query('#one-inspector .one-detail-title').textContent,'Project brief');assert.equal(env.app.store.state.views['consulting:demo-consulting-1'].selectedId,sourceId);
    });
    await suite.test('workspace-wide note editing remains accessible through reload without losing its project',async()=>{
      await env.globalLibrary();await env.set('#one-res-search','Project brief');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Kept global note draft');await env.reload();
      assert.ok(env.query('#one-content #one-res-form'));assert.equal(env.query('#one-res-content').value,'Kept global note draft');assert.equal(env.app.store.state.views['consulting:*'].formProjectId,'demo-consulting-1');assert.equal(env.app.hasInspector,false);
    });
    await suite.test('language rerender keeps the inactive text selection for the next formatting action',async()=>{
      await env.set('#one-res-content','Alpha Beta Gamma');const editor=env.query('#one-res-content');editor.focus();editor.setSelectionRange(6,10);editor.scrollTop=45;editor.dispatchEvent(new env.window.Event('select',{bubbles:true}));env.app.saveDraft();env.changeLanguage('id');await env.settle();
      assert.equal(env.query('#one-res-content').selectionStart,6);assert.equal(env.query('#one-res-content').selectionEnd,10);assert.equal(env.query('#one-res-content').scrollTop,45);
      await env.click('[data-action="res-note-format"][data-format="bold"]');assert.equal(env.query('#one-res-content').value,'Alpha **Beta** Gamma');assert.equal(document.activeElement.id,'one-res-content');assert.match(env.query('.one-notes-toolbar').getAttribute('aria-label'),/Format catatan/);
    });
  }finally{await env.close();}
});

test('a note Save commits its resource and reader context together without a later view write',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','One acknowledged note version.');
    const before=env.resourceWrites,noticeStart=env.notices.length;env.failResourceWrite(3);await env.submit('#one-res-form');
    assert.equal(env.resourceWrites-before,2,'Save flushes its draft and commits the resource with its reader view, without a third post-save write');
    assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,'One acknowledged note version.');assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'],undefined);
    const saved=JSON.parse(env.data.get(RESOURCE_KEY));assert.equal(saved.views['consulting:demo-consulting-1'].panel,'detail');assert.equal(saved.views['consulting:demo-consulting-1'].selectedId,sourceId);assert.equal(saved.views['consulting:demo-consulting-1'].noteReading,true);assert.equal(saved.drafts['consulting:demo-consulting-1'],undefined);
    assert.equal(env.notices.slice(noticeStart).some(notice=>notice.code==='storage'),false);assert.match(env.query('.ux-toast').textContent,/Resource saved/);
    env.clearWriteFailure();await env.reload();assert.equal(document.querySelector('#one-res-form'),null);assert.match(env.query('.one-notes-document').textContent,/One acknowledged note version/);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('failed resource commit preserves the flushed note draft, editor context and honest error until retry',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');
    const oldContent=env.app.store.state.resources.find(row=>row.id===sourceId).content,revisions=env.app.store.state.revisions.filter(row=>row.resourceId===sourceId).length;await env.set('#one-res-content','Uncommitted wording remains recoverable.');
    const before=env.resourceWrites;env.failResourceWrite(2);await env.submit('#one-res-form');assert.equal(env.resourceWrites-before,2);assert.equal(env.query('#one-res-content').value,'Uncommitted wording remains recoverable.');assert.match(env.query('#one-res-error').textContent,/not saved|Storage/i);
    assert.equal(env.notices.at(-1).code,'','The existing inline error is authoritative rather than duplicated by a global notice');assert.match(env.query('#one-res-draft-status').textContent,/Saving is unavailable/);assert.equal(document.querySelector('.ux-toast'),null);assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,oldContent);assert.equal(env.app.store.state.revisions.filter(row=>row.resourceId===sourceId).length,revisions);
    const saved=JSON.parse(env.data.get(RESOURCE_KEY));assert.equal(saved.views['consulting:demo-consulting-1'].panel,'form');assert.equal(saved.drafts['consulting:demo-consulting-1'].fields.content,'Uncommitted wording remains recoverable.');
    env.clearWriteFailure();await env.reload();assert.equal(env.query('#one-res-content').value,'Uncommitted wording remains recoverable.');await env.submit('#one-res-form');assert.equal(env.notices.at(-1).code,'');assert.equal(env.app.store.state.revisions.filter(row=>row.resourceId===sourceId).length,revisions+1);assert.match(env.query('.ux-toast').textContent,/Resource saved/);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('saving an edited cross-project reference preserves its owning project and the unfinished source note',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    const target=env.app.store.saveResource('consulting','demo-consulting-2',{kind:'note',title:'Reference destination',content:'Original target text.',contentFormat:'markdown',parentId:'',ownerId:'co-nadia',contributorIds:['co-arya']});
    const source=env.app.store.state.resources.find(row=>row.id===sourceId),sourceDraft=`Unfinished source with [destination](resource:${target.id}).`;
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content',sourceDraft);await env.click('[data-action="res-note-format"][data-format="heading"]');
    const kept=env.query('#one-res-content').value;await env.click('[data-action="res-note-mode"][data-mode="preview"]');await env.click(`.one-notes-preview [data-action="res-note-open-ref"][data-id="${target.id}"]`);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Target edited through its existing reference.');await env.submit('#one-res-form');
    const actual=env.app.store.state.resources.find(row=>row.id===target.id);assert.equal(actual.projectId,'demo-consulting-2');assert.equal(actual.ownerId,'co-nadia');assert.deepEqual(actual.contributorIds,['co-arya']);assert.equal(actual.content,'Target edited through its existing reference.');
    assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,source.content);assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].fields.content,kept);assert.equal(env.app.store.state.drafts['consulting:demo-consulting-2'],undefined);assert.equal(env.app.store.state.views['consulting:demo-consulting-1'].selectedId,target.id);assert.equal(env.app.store.state.views['consulting:demo-consulting-1'].formProjectId,target.projectId);
    await env.reload();assert.match(env.query('.one-notes-document').textContent,/Target edited through its existing reference/);await env.click('.one-notes-header [data-action="res-close"]');await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-content').value,kept);assert.equal(env.query('#one-res-title').value,source.title);
  }finally{await env.close();}
});

test('revision presentation leaves unsafe historical links inert even if an older store bypasses validation',async()=>{
  const env=await environment();let originalState;try{
    const resource=env.app.store.saveResource('consulting','demo-consulting-1',{kind:'file',title:'Versioned output',url:'https://example.com/version-1.pdf',parentId:'',ownerId:'',contributorIds:[]});env.render();await env.click(`[data-action="res-inspect"][data-id="${resource.id}"]`);
    const link=env.query('.one-res-revisions a');assert.equal(link.getAttribute('href'),'https://example.com/version-1.pdf');assert.equal(link.getAttribute('target'),'_blank');assert.match(link.getAttribute('rel'),/noopener/);
    // Emulate an older presentation snapshot independently of the current store's persisted-data guard.
    originalState=Object.getOwnPropertyDescriptor(env.app.store,'state');const historical=structuredClone(env.app.store.state);historical.revisions.find(row=>row.resourceId===resource.id).url='javascript:alert(1)';Object.defineProperty(env.app.store,'state',{configurable:true,get:()=>historical});env.render();
    assert.equal(document.querySelector('.one-res-revisions a'),null);assert.match(env.query('.one-res-revisions').textContent,/Revision link unavailable/);assert.doesNotMatch(env.query('.one-res-revisions').textContent,/javascript|alert/);env.changeLanguage('id');assert.match(env.query('.one-res-revisions').textContent,/Tautan revisi tidak tersedia/);assert.equal(document.querySelector('[href^="javascript:"]'),null);
  }finally{if(originalState)Object.defineProperty(env.app.store,'state',originalState);await env.close();}
});

test('note metadata disclosure stays open through folder and owner choices, language, reload and context recovery',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');
    const details=env.query('#one-notes-metadata');details.open=true;details.dispatchEvent(new env.window.Event('toggle'));await env.settle();await env.choose('#one-res-parent','');assert.equal(env.query('#one-notes-metadata').open,true);await env.choose('#one-res-owner','co-nadia');assert.equal(env.query('#one-notes-metadata').open,true);
    env.changeLanguage('id');await env.settle();assert.equal(env.query('#one-notes-metadata').open,true);assert.match(env.query('#one-notes-metadata summary').textContent,/Detail catatan/);await env.reload();assert.equal(env.query('#one-notes-metadata').open,true);await env.workspace('hr');await env.workspace('consulting');await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-notes-metadata').open,true);assert.match(env.query('#one-res-owner').textContent,/Nadia Putri/);
    env.query('#one-notes-metadata').open=false;env.query('#one-notes-metadata').dispatchEvent(new env.window.Event('toggle'));await env.settle();env.changeLanguage('en');await env.settle();assert.equal(env.query('#one-notes-metadata').open,false);
  }finally{await env.close();}
});

test('failed note draft flush updates the footer immediately and exposes one inline error without a stored claim',async()=>{
  const env=await environment();try{
    await env.click('[data-action="res-add"]');await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');await env.set('#one-res-title','Unstored note');await env.set('#one-res-content','Text kept in this open form.');assert.match(env.query('#one-res-draft-status').textContent,/Save updates the note/);
    env.failSave(true);await env.submit('#one-res-form');assert.equal(env.query('#one-res-content').value,'Text kept in this open form.');assert.match(env.query('#one-res-draft-status').textContent,/Saving is unavailable.*Keep this page open/);assert.doesNotMatch(env.query('#one-res-draft-status').textContent,/Draft saved|updates the resource/);assert.equal(env.query('#one-res-error').hidden,false);assert.equal(env.notices.at(-1).code,'');assert.equal(document.querySelectorAll('[role="alert"]:not([hidden])').length,1);
    env.changeLanguage('id');await env.settle();assert.match(env.query('#one-res-draft-status').textContent,/Penyimpanan tidak tersedia.*Biarkan halaman/);env.failSave(false);await env.set('#one-res-content','Text kept in this open form. Retry.');assert.match(env.query('#one-res-draft-status').textContent,/Simpan memperbarui catatan/);await env.submit('#one-res-form');assert.equal(env.app.store.state.resources.find(row=>row.title==='Unstored note').content,'Text kept in this open form. Retry.');
  }finally{await env.close();}
});

test('mobile resource More opens its header after shell recovery and returns to the kept explorer position/opener',async()=>{
  const env=await environment({shellRecovery:true});try{
    env.window.innerWidth=320;await env.globalLibrary();await env.set('#one-res-search','Reference');env.window.scrollTo({top:333,behavior:'instant'});
    await env.click('#one-res-more-demo-resource-consulting-3');
    assert.equal(env.window.scrollY,0,'Mobile inspector must correct the shell restore after rendering');
    assert.equal(document.activeElement.dataset.action,'res-close');
    assert.equal(env.app.store.state.views['consulting:*'].inspectorReturn.scroll,333);
    assert.equal(env.query('#one-inspector .one-detail-title').textContent,'Reference document');
    env.window.scrollTo({top:120,behavior:'instant'});await env.reload();await env.click('#one-inspector [data-action="res-close"]');
    assert.equal(env.window.scrollY,333);assert.equal(document.activeElement.id,'one-res-more-demo-resource-consulting-3');
    assert.equal(env.query('#one-res-search').value,'Reference');assert.equal(env.app.store.state.views['consulting:*'].panel,'');
    assert.equal(env.app.store.state.views['consulting:*'].inspectorReturn,undefined);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('mobile and desktop keyboard inspector entry focus details and Escape restores the exact explorer opener',async()=>{
  const env=await environment({shellRecovery:true});try{
    env.window.innerWidth=390;await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');
    env.window.scrollTo({top:244,behavior:'instant'});const row=env.query('#one-res-row-demo-resource-consulting-3');row.focus({preventScroll:true});
    row.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));await env.settle();
    assert.equal(env.window.scrollY,0);assert.equal(document.activeElement.dataset.action,'res-close');
    document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();
    assert.equal(env.window.scrollY,244);assert.equal(document.activeElement.id,'one-res-row-demo-resource-consulting-3');
    assert.match(env.query('.one-res-breadcrumbs').textContent,/Working materials/);
    env.window.innerWidth=1440;env.window.scrollTo({top:310,behavior:'instant'});await env.click('#one-res-more-demo-resource-consulting-3');
    assert.equal(env.window.scrollY,310,'Desktop side inspector must not reset page scroll');
    assert.equal(document.activeElement.dataset.action,'res-close','Desktop starts within the non-modal inspector');
    await env.click('#one-inspector [data-action="res-close"]');assert.equal(env.window.scrollY,310);assert.equal(document.activeElement.id,'one-res-more-demo-resource-consulting-3');
  }finally{await env.close();}
});

test('a context switch while closing an inspector cannot apply its old explorer return to another workspace',async()=>{
  const env=await environment({shellRecovery:true});try{
    env.window.innerWidth=320;await env.globalLibrary();env.window.scrollTo({top:333,behavior:'instant'});await env.click('#one-res-more-demo-resource-consulting-3');
    const closing=env.app.handleAction('res-close',env.query('#one-inspector [data-action="res-close"]'));
    await env.workspace('hr');env.window.scrollTo({top:45,behavior:'instant'});await closing;await env.settle();
    assert.equal(env.window.scrollY,45);assert.equal(env.app.store.state.views['hr:demo-hr-1']?.panel||'','');
    assert.equal(env.app.store.state.views['hr:demo-hr-1']?.selectedId||'','');
    assert.equal(env.query('#one-inspector').textContent,'');
    assert.equal(document.querySelector('[data-resource-id="demo-resource-consulting-3"]'),null);
  }finally{await env.close();}
});

test('legacy note drafts with omitted optional contributor arrays recover without crashing or changing saved notes',async()=>{
  const env=await environment(),sourceId='demo-resource-consulting-2';try{
    await env.click('[data-action="res-open"][data-id="demo-resource-consulting-1"]');await env.click(`[data-action="res-open"][data-id="${sourceId}"]`);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Legacy draft remains exact.');const savedContent=env.app.store.state.resources.find(row=>row.id===sourceId).content;
    await env.reload(()=>{const raw=JSON.parse(env.data.get(RESOURCE_KEY));delete raw.drafts['consulting:demo-consulting-1'].fields.contributorIds;env.data.set(RESOURCE_KEY,JSON.stringify(raw));});assert.equal(env.app.store.warning,'');assert.equal(env.query('#one-res-content').value,'Legacy draft remains exact.');assert.match(env.query('#one-res-contributors').textContent,/Choose contributors/);assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,savedContent);
    env.query('#one-notes-metadata').open=true;await env.choose('#one-res-contributors','co-nadia');await env.app.handleAction('res-close',env.query('[data-action="res-close"]'));await env.settle();assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('More and Shift+F10 enter the non-modal inspector and Escape restores the exact canonical button in either language',async()=>{
  const env=await environment({shellRecovery:true});try{
    await env.globalLibrary();await env.set('#one-res-search','Reference');const resourceId='demo-resource-consulting-3',before=JSON.stringify([env.app.store.state.resources,env.app.store.state.revisions,env.app.store.state.events]);
    for(const language of ['en','id'])for(const width of [1440,320])for(const opener of [`one-res-row-${resourceId}`,`one-res-more-${resourceId}`]){
      env.changeLanguage(language);env.window.innerWidth=width;env.window.scrollTo({top:238,behavior:'instant'});env.query('#'+opener).focus({preventScroll:true});
      document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));await env.settle();
      assert.equal(document.activeElement,env.query('#one-inspector .one-panel-header [data-action="res-close"]'));assert.equal(env.app.store.state.views['consulting:*'].selectedId,resourceId);assert.equal(env.window.scrollY,width<1024?0:238);
      assert.equal(env.query('#one-inspector').getAttribute('aria-modal'),null,'Desktop details must remain non-modal');
      document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();
      assert.equal(document.activeElement.id,opener);assert.equal(env.window.scrollY,238);assert.equal(env.query('#one-res-search').value,'Reference');assert.equal(env.app.hasInspector,false);
    }
    assert.equal(JSON.stringify([env.app.store.state.resources,env.app.store.state.revisions,env.app.store.state.events]),before);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('note entry, Save, Cancel and editor Escape keep a visible canonical destination and preserve kept drafts',async()=>{
  const env=await environment({shellRecovery:true});const sourceId='demo-resource-consulting-2';try{
    await env.globalLibrary();await env.set('#one-res-search','Project brief');env.window.scrollTo({top:185,behavior:'instant'});env.query('#one-res-row-'+sourceId).focus();await env.click('#one-res-row-'+sourceId);
    assert.equal(document.activeElement,env.query('.one-notes-header [data-action="res-close"]'));assert.equal(env.window.scrollY,0);
    await env.click('.one-notes-header [data-action="res-edit"]');assert.equal(document.activeElement.id,'one-res-title');await env.set('#one-res-content','Saved keyboard note.');env.query('#one-res-form [type="submit"]').focus();await env.submit('#one-res-form');
    assert.equal(document.activeElement,env.query('.one-notes-header [data-action="res-edit"]'));assert.equal(document.activeElement.dataset.id,sourceId);assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,'Saved keyboard note.');
    await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Exact unfinished keyboard note.');env.query('#one-res-content').setSelectionRange(6,16);env.query('#one-res-content').focus();
    document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();
    assert.equal(document.activeElement,env.query('.one-notes-header [data-action="res-edit"]'));assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].fields.content,'Exact unfinished keyboard note.');assert.equal(env.app.store.state.resources.find(row=>row.id===sourceId).content,'Saved keyboard note.');
    await env.click('.one-notes-header [data-action="res-edit"]');assert.equal(env.query('#one-res-content').value,'Exact unfinished keyboard note.');env.query('[data-action="res-cancel"]').focus();await env.click('[data-action="res-cancel"]');await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="cancel"]');
    assert.equal(document.activeElement.dataset.action,'res-cancel');assert.equal(env.query('#one-res-content').value,'Exact unfinished keyboard note.');
    await env.click('[data-action="res-cancel"]');await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');assert.equal(document.activeElement,env.query('.one-notes-header [data-action="res-edit"]'));assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'],undefined);
    env.query('.one-notes-header [data-action="res-close"]').focus();document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.activeElement.id,'one-res-row-'+sourceId);assert.equal(env.window.scrollY,185);assert.equal(env.query('#one-res-search').value,'Project brief');
  }finally{await env.close();}
});

test('new-note Cancel restores the stable Add button while Escape keeps the draft recoverable',async()=>{
  const env=await environment();try{
    env.query('#one-res-add').focus();await env.click('#one-res-add');await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');await env.click('[data-action="res-cancel"]');assert.equal(document.activeElement.id,'one-res-add');
    await env.click('#one-res-add');await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');await env.set('#one-res-title','Kept keyboard draft');await env.set('#one-res-content','Leave this draft unchanged.');env.query('#one-res-content').focus();document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();
    assert.equal(document.activeElement.id,'one-res-add');assert.equal(env.app.store.state.drafts['consulting:demo-consulting-1'].fields.content,'Leave this draft unchanged.');await env.reload();await env.click('[data-action="res-resume"]');assert.equal(env.query('#one-res-title').value,'Kept keyboard draft');assert.equal(env.query('#one-res-content').value,'Leave this draft unchanged.');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('saved-reader references enter the destination and return to the exact second occurrence after reload',async()=>{
  const env=await environment({shellRecovery:true});const sourceId='demo-resource-consulting-2',targetId='demo-resource-consulting-3';try{
    const original=env.app.store.state.resources.find(row=>row.id===sourceId);env.app.store.saveResource('consulting',original.projectId,{...original,contentFormat:'markdown',content:`[First](resource:${targetId})\n\n[Second](resource:${targetId})`},sourceId);await env.globalLibrary();await env.set('#one-res-search','Project brief');await env.click('#one-res-row-'+sourceId);
    const second=env.query('.one-notes-document').querySelectorAll('[data-action="res-note-open-ref"]')[1];second.focus();env.window.scrollTo({top:205,behavior:'instant'});second.click();await env.settle();assert.equal(document.activeElement,env.query('#one-inspector .one-panel-header [data-action="res-close"]'));assert.equal(env.app.store.state.views['consulting:*'].selectedId,targetId);assert.equal(env.app.store.state.views['consulting:*'].noteReturns[0].referenceIndex,1);
    await env.reload();env.query('[data-action="res-note-return"]').focus();await env.click('[data-action="res-note-return"]');const restored=env.query('.one-notes-document').querySelectorAll('[data-action="res-note-open-ref"]');assert.equal(document.activeElement,restored[1]);assert.equal(env.window.scrollY,205);assert.equal(env.app.store.state.views['consulting:*'].selectedId,sourceId);assert.equal(env.query('.one-notes-heading h2').textContent,'Project brief');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('related-task, issue and move forms restore their initiating detail action and retain unfinished values',async()=>{
  const env=await environment();const resourceId='demo-resource-consulting-3';try{
    await env.globalLibrary();await env.set('#one-res-search','Reference document');await env.click('#one-res-more-'+resourceId);
    await env.click('[data-action="res-edit"]');env.query('#one-res-owner').focus();document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.activeElement.getAttribute('role'),'option');document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.activeElement.id,'one-res-owner');assert.equal(env.query('#one-res-owner').getAttribute('aria-expanded'),'false');assert.ok(env.query('#one-res-form'));
    env.query('[data-action="res-cancel"]').focus();await env.click('[data-action="res-cancel"]');assert.equal(document.activeElement.dataset.action,'res-edit');await env.click('[data-action="res-edit"]');await env.set('#one-res-description','Saved keyboard metadata.');env.query('#one-res-form [type="submit"]').focus();await env.submit('#one-res-form');assert.equal(document.activeElement.dataset.action,'res-edit');assert.equal(env.app.store.state.resources.find(row=>row.id===resourceId).description,'Saved keyboard metadata.');
    await env.click('[data-action="res-task"]');await env.set('#one-res-task-title','Kept related task');env.query('[data-action="res-back-detail"]').focus();await env.click('[data-action="res-back-detail"]');assert.equal(document.activeElement.dataset.action,'res-task');
    await env.click('[data-action="res-task"]');assert.equal(env.query('#one-res-task-title').value,'Kept related task');env.query('#one-res-task-form [type="submit"]').focus();await env.submit('#one-res-task-form');assert.equal(document.activeElement.dataset.action,'res-task');assert.equal(env.base.state.tasks.filter(row=>row.resourceId===resourceId&&row.title==='Kept related task').length,1);
    await env.click('[data-action="res-issue"]');await env.set('#one-res-issue-details','Exact unfinished access issue.');await env.click('[data-action="res-back-detail"]');assert.equal(document.activeElement.dataset.action,'res-issue');await env.click('[data-action="res-issue"]');assert.equal(env.query('#one-res-issue-details').value,'Exact unfinished access issue.');env.query('#one-res-issue-form [type="submit"]').focus();await env.submit('#one-res-issue-form');assert.equal(document.activeElement.dataset.action,'res-issue');
    await env.click('[data-action="res-move"]');assert.equal(document.activeElement.dataset.action,'res-move-here');env.query('[data-action="res-move-here"][data-id=""]').focus();await env.click('[data-action="res-move-here"][data-id=""]');assert.equal(document.activeElement.dataset.action,'res-move');assert.equal(env.app.store.state.resources.find(row=>row.id===resourceId).parentId,'');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('note overlay Escape closes only the overlay and restores its named trigger without losing text, caret or pending link fields',async()=>{
  const env=await environment();const sourceId='demo-resource-consulting-2';try{
    await env.globalLibrary();await env.set('#one-res-search','Project brief');await env.click('#one-res-row-'+sourceId);await env.click('.one-notes-header [data-action="res-edit"]');await env.set('#one-res-content','Alpha Beta Gamma');const editor=env.query('#one-res-content');editor.focus();editor.setSelectionRange(6,10);env.query('#one-notes-link-trigger').focus();await env.click('#one-notes-link-trigger');await env.set('#one-notes-link-label','Kept link label');await env.set('#one-notes-link-url','https://example.com/kept');env.query('#one-notes-link-url').focus();
    document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.querySelector('.ux-layer:not(.ux-leaving)'),null);assert.equal(document.activeElement.id,'one-notes-link-trigger');assert.equal(env.query('#one-res-content').value,'Alpha Beta Gamma');assert.equal(env.query('#one-res-content').selectionStart,6);assert.equal(env.query('#one-res-content').selectionEnd,10);assert.deepEqual(env.app.store.state.drafts['consulting:demo-consulting-1'].noteUI.linkDraft,{label:'Kept link label',url:'https://example.com/kept'});
    await env.click('#one-notes-reference-trigger');const search=env.query('#one-notes-reference-search');search.focus();search.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.activeElement.getAttribute('role'),'option');assert.notEqual(document.activeElement.dataset.value,sourceId);
    document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await env.settle();assert.equal(document.activeElement.id,'one-notes-reference-trigger');assert.ok(env.query('#one-res-form'));assert.equal(env.query('#one-res-content').value,'Alpha Beta Gamma');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('Resources focus reveals controls only when the shell, sticky actions or viewport actually cover them',async()=>{
  const env=await environment();try{
    await env.click('#one-res-add');await env.click('.ux-layer:not(.ux-leaving) [data-value="note"]');env.window.innerHeight=900;
    const rectangle=(top,bottom)=>({top,bottom,left:20,right:300,width:280,height:bottom-top,x:20,y:top,toJSON(){return this;}}),editor=env.query('#one-res-content'),footer=env.query('.one-notes-footer'),toolbar=document.createElement('header');toolbar.className='one-topbar';toolbar.style.position='sticky';toolbar.getBoundingClientRect=()=>rectangle(0,56);document.body.prepend(toolbar);footer.style.position='sticky';footer.getBoundingClientRect=()=>rectangle(700,820);
    let rect=rectangle(100,500),reveals=[];editor.getBoundingClientRect=()=>rect;editor.scrollIntoView=options=>reveals.push(options);env.window.scrollTo({top:174,behavior:'instant'});editor.focus();assert.equal(reveals.length,0);assert.equal(env.window.scrollY,174,'A visible control does not change the kept scroll');
    editor.blur();rect=rectangle(650,850);editor.focus();assert.equal(reveals.length,1);assert.deepEqual(reveals[0],{block:'center',inline:'nearest',behavior:'instant'});
    editor.blur();rect=rectangle(20,80);editor.focus();assert.equal(reveals.length,2);editor.blur();rect=rectangle(910,950);editor.focus();assert.equal(reveals.length,3);
    const summary=env.query('#one-notes-metadata > summary');summary.getBoundingClientRect=()=>rectangle(730,790);summary.scrollIntoView=options=>reveals.push(options);summary.focus();assert.equal(reveals.length,4,'Native Tab to a disclosure also reveals its covered focus stop');
    const title=env.query('#one-res-title');title.getBoundingClientRect=()=>rectangle(650,710);title.scrollIntoView=options=>reveals.push(options);env.query('#one-res-form [type="submit"]').focus();const count=env.app.store.state.resources.length;await env.submit('#one-res-form');assert.equal(document.activeElement.id,'one-res-title');assert.equal(title.getAttribute('aria-invalid'),'true');assert.equal(reveals.length,5,'Inline validation also reveals the invalid field');assert.equal(env.app.store.state.resources.length,count);
    env.app.destroy();editor.focus();assert.equal(reveals.length,5,'Unmount removes the scoped focus listener');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('inspector close restores origin scroll before revealing a canonical opener moved outside that viewport',async()=>{
  const env=await environment({shellRecovery:true}),opener='one-res-more-demo-resource-consulting-3',prototype=env.window.HTMLElement.prototype,originalRect=prototype.getBoundingClientRect,originalReveal=prototype.scrollIntoView;let position=350,reveals=[];
  try{
    await env.globalLibrary();await env.set('#one-res-search','Reference document');env.window.innerWidth=320;
    prototype.getBoundingClientRect=function(){if(this.id!==opener)return originalRect.call(this);const top=position-env.window.scrollY;return {top,bottom:top+44,left:240,right:300,width:60,height:44};};
    prototype.scrollIntoView=function(options){if(this.id!==opener)return originalReveal?.call(this,options);reveals.push({scroll:env.window.scrollY,options});env.window.scrollTo({top:900,behavior:'instant'});};
    env.window.scrollTo({top:200,behavior:'instant'});env.query('#'+opener).focus({preventScroll:true});await env.click('#'+opener);assert.equal(env.window.scrollY,0);assert.equal(env.app.store.state.views['consulting:*'].inspectorReturn.scroll,200);
    position=1250;env.window.scrollTo({top:500,behavior:'instant'});await env.click('#one-inspector [data-action="res-close"]');assert.equal(document.activeElement.id,opener);assert.equal(reveals.length,1);assert.equal(reveals[0].scroll,200,'Reveal must evaluate after the saved origin scroll is applied');assert.equal(env.window.scrollY,900,'An offscreen restored opener is revealed instead of resetting away from its focus');assert.equal(env.query('#one-res-search').value,'Reference document');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{prototype.getBoundingClientRect=originalRect;if(originalReveal)prototype.scrollIntoView=originalReveal;else delete prototype.scrollIntoView;await env.close();}
});

test('saved-reader Return reveals an offscreen exact reference only after restoring its source scroll',async()=>{
  const env=await environment({shellRecovery:true}),sourceId='demo-resource-consulting-2',targetId='demo-resource-consulting-3',prototype=env.window.HTMLElement.prototype,originalRect=prototype.getBoundingClientRect,originalReveal=prototype.scrollIntoView;let position=360,reveals=[];
  try{
    const original=env.app.store.state.resources.find(row=>row.id===sourceId);env.app.store.saveResource('consulting',original.projectId,{...original,contentFormat:'markdown',content:`[First](resource:${targetId})\n\n[Second](resource:${targetId})`},sourceId);await env.globalLibrary();await env.set('#one-res-search','Project brief');await env.click('#one-res-row-'+sourceId);
    prototype.getBoundingClientRect=function(){if(this.dataset.action!=='res-note-open-ref')return originalRect.call(this);const top=position-env.window.scrollY;return {top,bottom:top+44,left:32,right:240,width:208,height:44};};
    prototype.scrollIntoView=function(options){if(this.dataset.action!=='res-note-open-ref')return originalReveal?.call(this,options);reveals.push({scroll:env.window.scrollY,id:this.dataset.id,options});env.window.scrollTo({top:900,behavior:'instant'});};
    const second=env.query('.one-notes-document').querySelectorAll('[data-action="res-note-open-ref"]')[1];env.window.scrollTo({top:205,behavior:'instant'});second.focus({preventScroll:true});second.click();await env.settle();position=1250;await env.reload();env.window.scrollTo({top:490,behavior:'instant'});await env.click('[data-action="res-note-return"]');
    const returned=env.query('.one-notes-document').querySelectorAll('[data-action="res-note-open-ref"]');assert.equal(document.activeElement,returned[1]);assert.equal(reveals.length,1);assert.equal(reveals[0].scroll,205);assert.equal(reveals[0].id,targetId);assert.equal(env.window.scrollY,900);assert.equal(env.app.store.state.views['consulting:*'].selectedId,sourceId);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{prototype.getBoundingClientRect=originalRect;if(originalReveal)prototype.scrollIntoView=originalReveal;else delete prototype.scrollIntoView;await env.close();}
});

test('last toolbar Undo restores metadata on the same resource and focuses its visible canonical row',async()=>{
  const env=await environment({shellRecovery:true}),resourceId='demo-resource-consulting-3';try{
    await env.globalLibrary();await env.set('#one-res-search','Reference document');const before=structuredClone(env.app.store.state.resources.find(row=>row.id===resourceId));await env.click('#one-res-more-'+resourceId);await env.click('[data-action="res-edit"]');await env.set('#one-res-description','Temporary keyboard metadata.');await env.submit('#one-res-form');await env.click('#one-inspector [data-action="res-close"]');
    const undo=env.query('[data-action="res-undo"]');assert.equal(undo.disabled,false);undo.focus();await env.click('[data-action="res-undo"]');assert.equal(env.query('[data-action="res-undo"]').disabled,true);assert.equal(document.activeElement.id,'one-res-row-'+resourceId);assert.deepEqual(env.app.store.state.resources.find(row=>row.id===resourceId),before);assert.equal(env.query('#one-res-search').value,'Reference document');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('Undoing a just-created resource focuses search when its canonical row no longer exists',async()=>{
  const env=await environment({shellRecovery:true});try{
    const count=env.app.store.state.resources.length;await env.click('#one-res-add');await env.click('.ux-layer:not(.ux-leaving) [data-value="file"]');await env.set('#one-res-title','Keyboard-created linked file');await env.set('#one-res-url','https://example.com/keyboard.pdf');await env.submit('#one-res-form');const created=env.app.store.state.resources.find(row=>row.title==='Keyboard-created linked file');assert.ok(created);await env.click('#one-inspector [data-action="res-close"]');env.query('[data-action="res-undo"]').focus();await env.click('[data-action="res-undo"]');
    assert.equal(document.activeElement.id,'one-res-search');assert.equal(env.app.store.state.resources.length,count);assert.equal(document.getElementById('one-res-row-'+created.id),null);assert.equal(env.query('[data-action="res-undo"]').disabled,true);assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});

test('a resource toast Undo from another workspace preserves the current form, selection and focused field',async()=>{
  const env=await environment({shellRecovery:true}),consultingId='demo-resource-consulting-7';try{
    await env.globalLibrary();await env.set('#one-res-search','Brief template');await env.click('#one-res-more-'+consultingId);await env.click('[data-action="res-pin"]');assert.equal(env.app.store.state.resources.find(row=>row.id===consultingId).pinned,true);
    await env.workspace('hr');await env.click('[data-action="res-open"][data-id="demo-resource-hr-1"]');await env.click('[data-action="res-inspect"][data-id="demo-resource-hr-2"]');await env.click('[data-action="res-edit"]');await env.set('#one-res-content','Current HR draft stays exact.');env.query('#one-res-content').focus();env.query('#one-res-content').setSelectionRange(3,11);env.app.saveDraft();const before=structuredClone(env.app.store.state.views['hr:demo-hr-1']);
    await env.click('.ux-toast button');assert.equal(env.app.store.state.resources.find(row=>row.id===consultingId).pinned,false);assert.equal(document.activeElement.id,'one-res-content');assert.equal(env.query('#one-res-content').value,'Current HR draft stays exact.');assert.equal(env.query('#one-res-content').selectionStart,3);assert.equal(env.query('#one-res-content').selectionEnd,11);assert.deepEqual(env.app.store.state.views['hr:demo-hr-1'],before);assert.equal(env.app.store.state.drafts['hr:demo-hr-1'].fields.content,'Current HR draft stays exact.');assert.equal(env.data.get('dwdg-workspace-v1'),'unchanged real data');
  }finally{await env.close();}
});
