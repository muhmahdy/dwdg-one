import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {EXPERIENCE_KEYS} from './experience-data.mjs';
import {PREVIEW_KEY,WORKSPACES} from './dwdg-one-preview-data.mjs';

// The preview must preserve every byte of existing product and planning storage.
const preservedStorage = {
  [EXPERIENCE_KEYS.core]: '{"projects":[{"id":"real-project","name":"Keep my saved project"}],"custom":"original bytes"}',
  [EXPERIENCE_KEYS.divisions]: '{"savedDivisionWork":"preserve this division state"}',
  [EXPERIENCE_KEYS.extras]: '{"byProject":{"real-project":{"documents":[{"id":"original-upload","notes":"keep"}]}}}',
  [EXPERIENCE_KEYS.extension]: '{"preferences":{"theme":"dark","language":"id"},"custom":"preserve"}',
  'dwdg-one-prd-v02': '{"document":"user edited PRD","revisions":["saved"]}',
  'unrelated-attachment-metadata': '{"filename":"Existing evidence.pdf","blobId":"keep-existing-attachment"}'
};

async function environment() {
  const window = new Window({url:'http://localhost/dwdg-one-preview.html', settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
  window.document.write(await readFile(new URL('./dwdg-one-preview.html',import.meta.url),'utf8'));
  for (const [key,value] of Object.entries(preservedStorage)) window.localStorage.setItem(key,value);
  const names = ['window','document','location','history','localStorage','sessionStorage','matchMedia','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','Element','Node','CSS','CustomEvent','FormData','innerWidth','innerHeight'];
  const globals = new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  for (const name of names) {
    const value = name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];
    Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  }
  const errors = [];
  window.addEventListener('error',event=>errors.push(event.error?.message||event.message));
  window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
  const settle = async()=>{await window.happyDOM.waitUntilComplete();};
  const query = selector=>{const element=window.document.querySelector(selector);assert.ok(element,'Missing control: '+selector);return element;};
  const click = async selector=>{query(selector).click();await settle();};
  const set = async(selector,value,event='input')=>{const element=query(selector);element.value=value;element.dispatchEvent(new window.Event(event,{bubbles:true}));await settle();};
  const choose = async(selector,value)=>{
    const trigger=query(selector);assert.equal(trigger.getAttribute('role'),'combobox');
    trigger.click();await settle();assert.equal(trigger.getAttribute('aria-expanded'),'true');
    const listbox=query('.ux-layer:not(.ux-leaving) [role="listbox"]');
    assert.equal(listbox.id,trigger.getAttribute('aria-controls'));
    const option=listbox.querySelector('[role="option"][data-value="'+value+'"]');
    assert.ok(option,'Missing custom dropdown option '+value);option.click();await settle();
    assert.equal(query(selector).dataset.value,value);assert.equal(query(selector).getAttribute('aria-expanded'),'false');
    assert.equal(document.activeElement.id,query(selector).id,'Selecting an option must restore its trigger focus');
  };
  const submit = async()=>{query('#one-project-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();};
  const unchanged = ()=>{for(const [key,value] of Object.entries(preservedStorage)) assert.equal(window.localStorage.getItem(key),value,'Preview changed existing storage key '+key);};
  return {window,query,click,set,choose,submit,settle,errors,unchanged,async close(){
    // Shared overlays use ordinary animation-exit timers in addition to DOM timers.
    await new Promise(resolve=>setTimeout(resolve,350));
    await window.happyDOM.close();
    for(const [name,descriptor] of globals)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
  }};
}

test('shipped preview supports isolated local project workflows without changing the product',async suite=>{
  // Import before installing a document to avoid the production auto-mount twice.
  const {mountPreview}=await import('./dwdg-one-preview.mjs');
  const env=await environment();
  let app;
  const rows=()=>[...document.querySelectorAll('[data-action="open-project"][data-id]')];
  const ids=()=>rows().map(element=>element.dataset.id).sort();
  const summaryMatches=()=>{
    const visible=app.store.state.projects.filter(project=>ids().includes(project.id));
    const counters=[...document.querySelectorAll('.one-stat strong')].map(element=>Number(element.textContent));
    assert.deepEqual(counters,[visible.length,visible.filter(project=>project.status==='active').length,app.store.state.blockers.filter(blocker=>!blocker.resolved&&visible.some(project=>project.id===blocker.projectId)).length]);
  };
  const workspace=async id=>{await env.click('[data-action="workspace"]');await env.click('.ux-layer:not(.ux-leaving) [data-workspace="'+id+'"]');};
  const route=async name=>env.click('[data-action="navigate"][data-route="'+name+'"]');
  const reload=async()=>{
    app.destroy();
    document.open();document.write(await readFile(new URL('./dwdg-one-preview.html',import.meta.url),'utf8'));document.close();
    app=mountPreview({storage:env.window.localStorage});await env.settle();
  };
  try {
    app=mountPreview({storage:env.window.localStorage});await env.settle();

    await suite.test('real HTML mounts all six workspaces with honest local demo boundaries',async()=>{
      assert.equal(app.store.state.preferences.workspaceId,'consulting');
      assert.equal(rows().length,6);
      assert.match(document.body.textContent,/demo|illustrative/i);
      assert.ok(document.querySelector('[data-action="new-project"]'));
      assert.equal(document.documentElement.lang,'en');
      assert.equal(document.documentElement.dataset.theme,'light');
      assert.equal(document.querySelectorAll('select').length,0,'Every dropdown in the preview must use the styled controls');
      assert.equal(document.querySelectorAll('[data-action="theme"]').length,1);
      assert.equal(env.query('[data-action="theme"]').getAttribute('role'),'switch');
      assert.equal(env.query('[data-action="theme"]').getAttribute('aria-checked'),'false');
      assert.equal(document.querySelectorAll('#one-top-controls [data-action="display"]').length,0,'The top bar must have one theme control');
      assert.doesNotMatch(document.querySelector('#one-content').textContent,/A clear view of the work|One workspace\. Connected work\./i,'The interface must not reintroduce rejected promotional copy');
      const projects=app.store.state.projects;
      for(const item of WORKSPACES){
        await workspace(item.id);
        assert.deepEqual(ids(),projects.filter(project=>project.workspaceId===item.id).map(project=>project.id).sort(),item.name);
        summaryMatches();
        assert.ok(rows().every(element=>!element.textContent.includes('undefined')));
      }
      env.window.innerWidth=390;
      await workspace('hr');
      assert.equal(document.activeElement.dataset.action,'toggle-nav','Mobile workspace switching must return focus to the visible navigation control');
      assert.equal(env.query('[data-action="toggle-nav"]').getAttribute('aria-expanded'),'false');
      env.window.innerWidth=1440;
      await workspace('consulting');
      const first=document.querySelector('[data-project-id="demo-consulting-1"]');
      assert.match(first.querySelector('.one-progress').textContent,/2\s*\/\s*6/);
      assert.match(first.querySelector('.one-project-meta').textContent,/1\s+blocker/);
      const empty=document.querySelector('[data-project-id="demo-consulting-4"]');
      assert.match(empty.querySelector('.one-progress').textContent,/No tasks yet/);
      assert.match(empty.querySelector('.one-due').textContent,/No target date/);
      env.unchanged();assert.deepEqual(env.errors,[]);
    });

    await suite.test('filters combine correctly, keep user content, and survive returning from details',async()=>{
      const selected=app.store.state.projects.find(project=>project.id==='demo-consulting-1');
      await env.set('#one-search','bootcamp');
      assert.deepEqual(ids(),[selected.id]);summaryMatches();
      await env.choose('#one-status-filter','draft');assert.equal(rows().length,0);summaryMatches();
      await env.choose('#one-status-filter','active');assert.deepEqual(ids(),[selected.id]);summaryMatches();
      await env.choose('#one-lead-filter','co-nadia');assert.equal(rows().length,0);summaryMatches();
      await env.choose('#one-lead-filter','co-arya');assert.deepEqual(ids(),[selected.id]);summaryMatches();
      const trigger=env.query('[data-action="open-project"][data-id="'+selected.id+'"]');trigger.focus();
      await env.click('[data-action="open-project"][data-id="'+selected.id+'"]');
      assert.match(document.body.textContent,new RegExp(selected.title));
      await env.click('[data-action="close-inspector"]');
      assert.equal(env.query('#one-search').value,'bootcamp');
      assert.equal(env.query('#one-status-filter').dataset.value,'active');
      assert.equal(document.activeElement.dataset.id,selected.id,'Returning from inspector must restore the selected row focus');
      await env.set('#one-search','');await env.choose('#one-status-filter','all');await env.choose('#one-lead-filter','all');
      env.unchanged();
    });

    await suite.test('styled dropdowns support option focus, arrow keys, Home/End, typeahead and Escape',async()=>{
      const key=async(value,target=document.activeElement)=>{target.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true}));await env.settle();};
      const trigger=env.query('#one-status-filter');trigger.focus();
      await key('ArrowDown');
      assert.equal(trigger.getAttribute('aria-expanded'),'true');
      const listbox=env.query('.ux-layer:not(.ux-leaving) [role="listbox"]');
      assert.equal(listbox.id,trigger.getAttribute('aria-controls'));
      assert.equal(listbox.querySelectorAll('[role="option"][aria-selected="true"]').length,1);
      assert.equal(listbox.querySelector('[role="option"][aria-selected="true"]').dataset.value,'all');
      assert.equal(document.activeElement.dataset.value,'draft');
      await key('ArrowDown');assert.equal(document.activeElement.dataset.value,'planned');
      await key('ArrowUp');assert.equal(document.activeElement.dataset.value,'draft');
      await key('End');assert.equal(document.activeElement.dataset.value,'archived');
      await key('Home');assert.equal(document.activeElement.dataset.value,'all');
      await key('d');await key('r');assert.equal(document.activeElement.dataset.value,'draft');
      assert.equal(listbox.querySelectorAll('[role="option"][tabindex="0"]').length,1);
      // Native buttons supply Enter/Space activation in browsers; Happy DOM needs a click.
      document.activeElement.click();await env.settle();
      assert.equal(env.query('#one-status-filter').dataset.value,'draft');
      assert.equal(document.activeElement.id,'one-status-filter');summaryMatches();
      await env.choose('#one-status-filter','all');
      await key('ArrowUp');assert.equal(document.activeElement.dataset.value,'archived');
      await key('Escape');await new Promise(resolve=>setTimeout(resolve,350));await env.settle();
      assert.equal(env.query('#one-status-filter').getAttribute('aria-expanded'),'false');
      assert.equal(document.activeElement.id,'one-status-filter');
      assert.equal(env.query('#one-status-filter').dataset.value,'all','Escape must not select the focused option');
      await env.choose('#one-sort','title');
      assert.equal(app.store.state.views.consulting.sort,'title');
      await env.choose('#one-sort','target');
      env.unchanged();assert.deepEqual(env.errors,[]);
    });

    await suite.test('new projects validate inline, persist after reload, and are undoable',async()=>{
      const before=app.store.state.projects.length;
      await env.click('[data-action="new-project"]');
      assert.equal(document.querySelectorAll('select').length,0,'The form lead dropdown must also be styled');
      await env.submit();
      assert.equal(app.store.state.projects.length,before);
      assert.ok(document.querySelector('#one-project-form [aria-invalid="true"]'),'Missing inline title validation');
      const title='UI preview · <b>Keep this exact user title</b>';
      await env.set('#one-project-form [name="title"]',title);
      await env.set('#one-project-form [name="purpose"]','Testing an illustrative local project.');
      await env.choose('#one-lead','co-arya');
      await env.set('#one-project-form [name="startDate"]','2026-10-10','change');
      await env.set('#one-project-form [name="targetDate"]','2026-10-09','change');
      await env.submit();
      assert.equal(app.store.state.projects.length,before,'Invalid target date must not save');
      assert.ok(document.querySelector('#one-project-form [aria-invalid="true"]'),'Missing inline date validation');
      await env.set('#one-project-form [name="targetDate"]','2026-10-31','change');
      await env.submit();
      const project=app.store.state.projects.find(item=>item.title===title);
      assert.ok(project);assert.equal(project.status,'draft');assert.equal(project.workspaceId,'consulting');
      assert.equal(project.leadId,'co-arya');assert.equal(project.startDate,'2026-10-10');assert.equal(project.targetDate,'2026-10-31');
      assert.equal(JSON.parse(localStorage.getItem(PREVIEW_KEY)).projects.find(item=>item.id===project.id).title,title);
      await reload();
      assert.equal(app.store.state.projects.find(item=>item.id===project.id).title,title);
      const row=env.query('[data-action="open-project"][data-id="'+project.id+'"]');
      assert.ok(row.textContent.includes(title));assert.equal(row.querySelector('b'),null,'User title must be escaped');
      await env.click('[data-action="undo"]');
      assert.equal(app.store.state.projects.some(item=>item.id===project.id),false);
      assert.equal(JSON.parse(localStorage.getItem(PREVIEW_KEY)).projects.some(item=>item.id===project.id),false);
      env.unchanged();
    });

    await suite.test('closing a blank new form or untouched edit does not leave a resumable draft',async()=>{
      await env.click('[data-action="new-project"]');
      await env.click('[data-action="close-inspector"]');
      assert.equal(app.store.state.drafts.consulting,undefined);
      assert.doesNotMatch(document.querySelector('#one-content').textContent,/An unfinished form is kept/);
      await env.click('[data-action="open-project"][data-id="demo-consulting-1"]');
      await env.click('#one-inspector [data-action="edit-project"]');
      await env.click('[data-action="close-inspector"]');
      assert.equal(app.store.state.drafts.consulting,undefined);
      assert.doesNotMatch(document.querySelector('#one-content').textContent,/An unfinished form is kept/);
      env.unchanged();
    });

    await suite.test('metadata edits retain lifecycle and task records, and Undo restores the saved project',async()=>{
      const original=structuredClone(app.store.state.projects.find(project=>project.id==='demo-consulting-1'));
      const tasks=structuredClone(app.store.state.tasks),blockers=structuredClone(app.store.state.blockers);
      await env.click('[data-action="open-project"][data-id="'+original.id+'"]');
      await env.click('#one-inspector [data-action="edit-project"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,original.title);
      await env.set('#one-project-form [name="title"]','Edited consulting title');
      await env.set('#one-project-form [name="purpose"]','Edited purpose');
      await env.choose('#one-lead','co-nadia');
      await env.submit();
      const edited=app.store.state.projects.find(project=>project.id===original.id);
      assert.equal(edited.title,'Edited consulting title');assert.equal(edited.purpose,'Edited purpose');assert.equal(edited.leadId,'co-nadia');
      assert.equal(edited.status,original.status);assert.deepEqual(app.store.state.tasks,tasks);assert.deepEqual(app.store.state.blockers,blockers);
      await env.click('[data-action="undo"]');
      assert.deepEqual(app.store.state.projects.find(project=>project.id===original.id),original);
      env.unchanged();
    });

    await suite.test('language and theme controls update interface labels while preserving content and existing preferences',async()=>{
      await env.click('[data-action="close-inspector"]');
      const savedTitles=app.store.state.projects.map(project=>project.title);
      await env.click('[data-action="language"]');
      assert.equal(document.documentElement.lang,'id');
      assert.equal(document.querySelector('#one-content h1').textContent,'Proyek');
      assert.doesNotMatch(document.querySelector('#one-content').textContent,/Pandangan jelas atas pekerjaan|Satu ruang kerja\. Pekerjaan terhubung\./i,'The translated interface must not reintroduce rejected promotional copy');
      assert.deepEqual(app.store.state.projects.map(project=>project.title),savedTitles);
      const toggle=env.query('[data-action="theme"]'),disc=toggle.querySelector('.one-theme-disc');toggle.focus();
      await env.click('[data-action="theme"]');assert.equal(document.documentElement.dataset.theme,'dark');
      assert.equal(env.query('[data-action="theme"]').getAttribute('aria-checked'),'true');
      assert.equal(env.query('[data-action="theme"]'),toggle,'Theme changes must retain the animated switch element');
      assert.equal(toggle.querySelector('.one-theme-disc'),disc,'Theme changes must retain the animated disc element');
      assert.equal(document.activeElement,toggle,'Theme changes must preserve switch focus');
      await reload();assert.equal(document.documentElement.lang,'id');assert.equal(document.documentElement.dataset.theme,'dark');
      await env.click('[data-action="language"]');await env.click('[data-action="theme"]');
      assert.equal(document.documentElement.lang,'en');assert.equal(document.documentElement.dataset.theme,'light');
      env.unchanged();
    });

    await suite.test('unfinished forms remain scoped to their workspace and recover after a page reload',async()=>{
      await env.click('[data-action="new-project"]');
      await env.set('#one-project-form [name="title"]','Unfinished Consulting idea');
      await env.set('#one-project-form [name="purpose"]','Keep this typed context');
      await workspace('hr');
      assert.equal(document.querySelector('#one-project-form'),null,'Consulting draft must not appear in another workspace');
      await env.click('[data-action="new-project"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,'');
      await env.set('#one-project-form [name="title"]','Different HR draft');
      await workspace('consulting');
      await env.click('[data-action="new-project"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,'Unfinished Consulting idea');
      assert.equal(env.query('#one-project-form [name="purpose"]').value,'Keep this typed context');
      await reload();
      await env.click('[data-action="new-project"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,'Unfinished Consulting idea');
      assert.equal(env.query('#one-project-form [name="purpose"]').value,'Keep this typed context');
      assert.equal(app.store.state.projects.some(project=>project.title==='Unfinished Consulting idea'),false);
      await env.click('[data-action="close-inspector"]');
      env.unchanged();
    });

    await suite.test('mobile navigation excludes the closed sidebar and focuses the chosen page',async()=>{
      env.window.innerWidth=390;env.window.dispatchEvent(new env.window.Event('resize'));
      assert.equal(env.query('.one-sidebar').inert,true);
      assert.equal(env.query('.one-body').inert,false);
      await env.click('[data-action="toggle-nav"]');
      assert.equal(env.query('.one-sidebar').inert,false);
      assert.equal(env.query('.one-body').inert,true);
      await route('resources');
      assert.equal(env.query('.one-sidebar').inert,true);
      assert.equal(env.query('.one-body').inert,false);
      assert.equal(document.activeElement,env.query('#one-content h1'));
      assert.match(document.activeElement.textContent,/Resources|Sumber daya/);
      assert.equal(env.window.scrollY,0);
      env.window.innerWidth=1440;env.window.dispatchEvent(new env.window.Event('resize'));
      assert.equal(env.query('.one-sidebar').inert,false);
      assert.equal(env.query('.one-body').inert,false);
      await route('projects');env.unchanged();
    });

    await suite.test('display accessibility choices are reflected in the UI and persist independently of the product',async()=>{
      await route('settings');
      await env.click('[data-action="display"]');
      await env.click('.ux-layer:not(.ux-leaving) [data-overlay-action="motion"]');
      assert.equal(document.documentElement.dataset.motion,'reduced');
      await env.click('[data-action="display"]');
      assert.equal(env.query('.ux-layer:not(.ux-leaving) [data-overlay-action="motion"]').getAttribute('aria-pressed'),'true');
      await env.click('.ux-layer:not(.ux-leaving) [data-overlay-action="solid"]');
      assert.equal(document.documentElement.dataset.transparency,'solid');
      await reload();
      assert.equal(document.documentElement.dataset.motion,'reduced');
      assert.equal(document.documentElement.dataset.transparency,'solid');
      await route('projects');
      env.unchanged();
    });

    await suite.test('Cancel protects a dirty form until discard is chosen, without changing saved projects',async()=>{
      const projects=structuredClone(app.store.state.projects);
      await env.click('[data-action="new-project"]');
      await env.set('#one-project-form [name="title"]','Draft to cancel deliberately');
      await env.click('[data-action="cancel-form"]');
      assert.ok(document.querySelector('.ux-layer--confirm:not(.ux-leaving)'));
      await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="cancel"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,'Draft to cancel deliberately');
      await env.click('[data-action="cancel-form"]');
      await env.click('.ux-layer--confirm:not(.ux-leaving) [data-overlay-action="confirm"]');
      assert.equal(document.querySelector('#one-project-form'),null);
      assert.equal(app.store.state.drafts.consulting,undefined);
      assert.deepEqual(app.store.state.projects,projects);
      await reload();await env.click('[data-action="new-project"]');
      assert.equal(env.query('#one-project-form [name="title"]').value,'');
      await env.click('[data-action="cancel-form"]');
      assert.equal(document.querySelector('#one-project-form'),null);
      assert.deepEqual(app.store.state.projects,projects);env.unchanged();
    });

    await suite.test('later destinations clearly disclose their preview status instead of implying backend features',async()=>{
      for(const name of ['schedule','updates','organization','settings']){
        await route(name);
        assert.match(document.querySelector('#one-content').textContent,/later|next iteration|coming|planned|not.*(?:connected|available)|not.*(?:built|ready)/i,name);
        assert.equal(document.querySelector('#one-project-form'),null,name);
      }
      await route('projects');assert.equal(rows().length,6);
      env.unchanged();assert.deepEqual(env.errors,[]);
    });

    await suite.test('project pages expose three connected tabs and canonical task editing with Undo',async()=>{
      await route('projects');await env.click('[data-action="open-project"][data-id="demo-consulting-1"]');
      await env.click('[data-action="project-page"]');
      assert.equal(document.querySelectorAll('[role="tab"]').length,3);
      await env.click('[data-action="project-tab"][data-tab="work"]');
      assert.equal(document.querySelectorAll('[data-task-id]').length,6);
      const before=app.store.state.tasks.find(task=>task.projectId==='demo-consulting-1'&&task.status==='progress');
      const workFilter=env.query('#work-filter-status');workFilter.focus();
      workFilter.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
      await env.settle();assert.equal(workFilter.getAttribute('aria-expanded'),'true');
      assert.equal(document.activeElement.getAttribute('role'),'option');
      document.activeElement.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      await env.settle();assert.equal(document.activeElement.id,'work-filter-status');
      await env.click('[data-action="work-open"][data-id="'+before.id+'"]');
      await env.set('#work-title','Keep this unfinished task edit');
      env.query('#work-title').dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      await env.settle();assert.equal(document.activeElement.id,'work-task-'+before.id);
      assert.ok(app.work.uiState.drafts['consulting:demo-consulting-1']);
      await env.click('[data-action="work-open"][data-id="'+before.id+'"]');
      assert.equal(env.query('#work-title').value,'Keep this unfinished task edit');
      await env.set('#work-title','Updated connected task');await env.click('[data-action="work-save"]');
      assert.equal(app.store.state.tasks.find(task=>task.id===before.id).title,'Updated connected task');
      await env.click('[data-action="work-open"][data-id="'+before.id+'"]');
      await env.click('[data-action="work-close"]');
      assert.equal(app.work.uiState.drafts['consulting:demo-consulting-1'],undefined,'Untouched edits must not leave a recovery notice');
      await env.click('[data-action="work-new"]');await env.click('[data-action="work-close"]');
      assert.equal(app.work.uiState.drafts['consulting:demo-consulting-1'],undefined,'Blank task forms must not leave a recovery notice');
      await env.click('[data-action="work-view"][data-mode="board"]');
      assert.equal(document.querySelectorAll('[data-task-id]').length,6);
      await env.click('[data-action="work-view"][data-mode="timeline"]');
      assert.equal(document.querySelectorAll('[data-task-id]').length,6);
      await env.click('.one-work-toolbar [data-action="work-undo"]');
      assert.deepEqual(app.store.state.tasks.find(task=>task.id===before.id),before);
      await env.click('[data-action="project-tab"][data-tab="resources"]');
      assert.ok(document.querySelector('[data-resource-id]'));
      assert.equal(document.querySelectorAll('select').length,0);
      await env.click('[data-action="project-back"]');
      assert.equal(rows().length,6);assert.equal(document.activeElement.dataset.id,'demo-consulting-1');
      await route('work');assert.ok(document.querySelector('[data-task-id]'));
      await route('resources');assert.ok(document.querySelector('[data-resource-id]'));
      await route('changes');assert.match(document.querySelector('#one-content').textContent,/Updated connected task|Prepare the draft/);
      await route('projects');env.unchanged();
    });

    await suite.test('keyboard search returns to Projects and Escape restores the selected project focus',async()=>{
      await route('home');
      document.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));
      await env.settle();assert.equal(document.activeElement.id,'one-search');
      const id='demo-consulting-1';
      await env.click('[data-action="open-project"][data-id="'+id+'"]');
      assert.equal(env.query('#one-inspector').hidden,false);
      document.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      await env.settle();
      assert.equal(env.query('#one-inspector').hidden,true);
      assert.equal(document.activeElement.dataset.id,id);
      env.unchanged();
    });

    await suite.test('failed storage writes keep the project form recoverable and never report a successful save',async()=>{
      app.destroy();let writesFail=false;
      const storage={getItem:key=>env.window.localStorage.getItem(key),setItem(key,value){if(writesFail)throw new Error('Simulated quota failure');env.window.localStorage.setItem(key,value);}};
      app=mountPreview({storage});await env.settle();
      await env.click('[data-action="new-project"]');
      await env.set('#one-project-form [name="title"]','Recoverable storage failure draft');
      const before=localStorage.getItem(PREVIEW_KEY),count=app.store.state.projects.length;
      writesFail=true;await env.submit();
      assert.equal(app.store.state.projects.length,count);assert.equal(localStorage.getItem(PREVIEW_KEY),before);
      assert.equal(env.query('#one-project-form [name="title"]').value,'Recoverable storage failure draft');
      assert.match(document.querySelector('#one-project-form [role="alert"]')?.textContent||'',/save|storage|local|browser/i);
      writesFail=false;await env.submit();
      assert.ok(app.store.state.projects.some(project=>project.title==='Recoverable storage failure draft'));
      await env.click('[data-action="undo"]');
      assert.equal(app.store.state.projects.some(project=>project.title==='Recoverable storage failure draft'),false);
      env.unchanged();assert.deepEqual(env.errors,[]);
    });

    await suite.test('a changed preview in another tab prevents overwriting it and retains the entered form',async()=>{
      await env.click('[data-action="new-project"]');
      await env.set('#one-project-form [name="title"]','Keep this local form during conflict');
      const external=JSON.parse(localStorage.getItem(PREVIEW_KEY));
      external.revision++;
      external.projects.find(project=>project.id==='demo-strategy-1').title='External tab saved title';
      const externalBytes=JSON.stringify(external);localStorage.setItem(PREVIEW_KEY,externalBytes);
      const count=app.store.state.projects.length;await env.submit();
      assert.equal(app.store.state.projects.length,count);
      assert.equal(localStorage.getItem(PREVIEW_KEY),externalBytes,'A stale tab must not overwrite the external change');
      assert.equal(env.query('#one-project-form [name="title"]').value,'Keep this local form during conflict');
      assert.match(env.query('#one-form-error').textContent,/Another tab|reloading/i);
      await reload();
      assert.equal(app.store.state.projects.find(project=>project.id==='demo-strategy-1').title,'External tab saved title');
      env.unchanged();assert.deepEqual(env.errors,[]);
    });
  } finally {app?.destroy();await env.close();}
});
