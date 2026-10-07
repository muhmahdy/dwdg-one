import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {startExperience} from './experience-startup.mjs';
import {createExperienceStore, EXPERIENCE_KEYS} from './experience-data.mjs';
import {progress} from './model.mjs';

test('actual boot entry preserves saved records across the redesigned app', async (suite) => {
 const window = new Window({url:'http://localhost/#home',settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 window.document.write(await readFile(new URL('./index.html',import.meta.url),'utf8'));
 const fixture = createExperienceStore(window.localStorage);
 const core = structuredClone(fixture.core);
 core.projects[0].name = 'Saved project · Keep this title';
 core.projects[0].customReference = {source:'existing local workspace', preserved:true};
 core.tasks[0].evidence = 'Previously saved completion evidence';
 core.tasks[0].customReference = 'Keep this task metadata';
 fixture.saveCore(core);
 const extra = structuredClone(fixture.extras.byProject[core.projects[0].id]);
 extra.documents.push({id:'preserved-document',project_id:core.projects[0].id,title:'Saved document title',version_label:'v3',external_url:'https://example.com/existing-document',notes:'Existing user context',revisions:[]});
 fixture.saveExtras(core.projects[0].id,extra);
 const savedStores = Object.fromEntries(['core','divisions','extras'].map(key=>[EXPERIENCE_KEYS[key],window.localStorage.getItem(EXPERIENCE_KEYS[key])]));
 // A previous composition must not force returning users back into oversized cards.
 window.sessionStorage.setItem('dwdg-experience-view',JSON.stringify({projectView:'grid',visualRevision:1}));
 const names=['window','document','location','history','localStorage','sessionStorage','matchMedia','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','HTMLElement','HTMLInputElement','HTMLSelectElement','Element','Node','CSS'];
 const saved = new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 for(const name of names){const value=name==='window'?window:typeof window[name]==='function'&&!/^[A-Z]/.test(name)?window[name].bind(window):window[name];Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
 const interval=globalThis.setInterval, originalError=console.error;
 const timers=new Set(), errors=[];
 globalThis.setInterval=(...args)=>{const timer=interval(...args);timer.unref();timers.add(timer);return timer;};
 console.error=(...args)=>errors.push(args.map(item=>item?.message||String(item)).join(' '));
 window.addEventListener('error',event=>errors.push(event.error?.message||event.message));
 window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
 const settle=()=>window.happyDOM.waitUntilComplete();
 const click=async selector=>{const element=document.querySelector(selector);assert.ok(element,'Missing control: '+selector);element.click();await settle();};
 const route=async name=>{
  if(name==='settings')await click('#profile-control');
  else await click('#navigation a[href="#'+name+'"]');
  assert.equal(location.hash,'#'+name);
  assert.ok(document.querySelector('#page h1')?.textContent.trim());
  assert.equal(document.querySelector('#page [role="alert"]'),null);
 };
 const unchanged=()=>{for(const [key,value]of Object.entries(savedStores))assert.equal(localStorage.getItem(key),value,'Unexpected saved-record change in '+key);};
 const readUI=()=>JSON.parse(sessionStorage.getItem('dwdg-experience-view'));
 const preference=async(key,value)=>{const select=document.querySelector('[data-pref="'+key+'"]');assert.ok(select);select.value=value;select.dispatchEvent(new window.Event('change',{bubbles:true}));await settle();};
 const routes=[
  ['home','Home','Beranda'],['tasks','My tasks','Tugas saya'],['projects','Projects','Proyek'],
  ['schedule','Schedule','Jadwal'],['documents','Documents','Dokumen'],['updates','Updates','Pembaruan'],
  ['organization','Organization','Organisasi'],['settings','Settings','Pengaturan'],
  ['division/strategy-growth','Strategy & Growth','Strategi & Pertumbuhan'],
  ['division/human-resource','Human Resource','Sumber Daya Manusia'],
  ['division/external-engagement','External Engagement','Hubungan Eksternal'],
  ['division/marketing-comms-it','Marketing, Communication & IT','Pemasaran, Komunikasi & TI'],
  ['division/legal-finance','Legal & Finance','Legal & Keuangan'],
  ['division/consulting','Consulting','Konsultasi']
 ];
 try {
  await import('./experience-boot.mjs?startup-test');
  await settle();
  const shell=document.querySelector('.app-shell'),sidebar=document.querySelector('.sidebar'),toolbar=document.querySelector('.global-bar');
  await suite.test('shipped HTML boots the actual controller and preserves existing stores',()=>{
   assert.equal(document.querySelectorAll('#navigation a').length,13);
   assert.equal(document.querySelector('#page h1').textContent,'Home');
   assert.ok(document.querySelector('#page [data-task-row]'));
   assert.ok(document.querySelector('.notification-trigger'));
   assert.deepEqual(errors,[]);
   unchanged();
  });
  await suite.test('Projects defaults to rows and its views retain the same records and progress',async()=>{
   await route('projects');
   assert.equal(document.querySelector('[data-action="project-view"][data-value="list"]').getAttribute('aria-pressed'),'true');
   assert.equal(readUI().projectView,'list');
   assert.equal(readUI().visualRevision,2);
   const rows=[...document.querySelectorAll('.project-row')];
   assert.equal(rows.length,core.projects.length);
   for(const project of core.projects){
    const row=document.querySelector('[data-key="project-row-'+project.id+'"]');
    assert.equal(row.querySelector('.project-name strong').textContent,project.name);
    const expected=progress(core,project.id);
    assert.equal(row.querySelector('.project-row-progress .progress-track').getAttribute('aria-label'),expected.done+' / '+expected.total+' tasks complete');
    assert.equal(row.querySelector('.project-row-progress .progress-track > span').style.width,expected.percent+'%');
   }
   await click('[data-action="project-view"][data-value="grid"]');
   assert.deepEqual([...document.querySelectorAll('.project-card')].map(el=>el.dataset.key.replace('project-','')).sort(),core.projects.map(p=>p.id).sort());
   await click('[data-action="project-view"][data-value="timeline"]');
   assert.deepEqual([...document.querySelectorAll('.et-row-task .et-label-main')].map(el=>el.dataset.id).sort(),core.tasks.map(task=>task.id).sort());
   await click('[data-action="project-view"][data-value="list"]');
   const search=document.querySelector('#project-search');search.value='Saved project';search.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();
   assert.equal(document.querySelectorAll('.project-row').length,1);
   await route('home');await route('projects');
   assert.equal(document.querySelector('#project-search').value,'Saved project');
   assert.equal(document.querySelectorAll('.project-row').length,1);
   const clear=document.querySelector('#project-search');clear.value='';clear.dispatchEvent(new window.Event('input',{bubbles:true}));await settle();
   assert.equal(document.querySelectorAll('.project-row').length,core.projects.length);
   unchanged();
  });
  await suite.test('the division group collapses and preserves that choice during navigation',async()=>{
   assert.equal(document.querySelector('.division-toggle').getAttribute('aria-expanded'),'true');
   await click('[data-action="toggle-divisions"]');
   assert.equal(document.querySelector('.division-toggle').getAttribute('aria-expanded'),'false');
   assert.equal(document.querySelector('#division-links').hidden,true);
   assert.equal(readUI().divisionsOpen,false);
   await route('tasks');
   assert.equal(document.querySelector('#division-links').hidden,true);
   await route('settings');
   assert.equal(document.querySelector('.division-toggle').getAttribute('aria-expanded'),'false');
   await click('[data-action="toggle-divisions"]');
   assert.equal(document.querySelector('#division-links').hidden,false);
   assert.equal(document.querySelectorAll('#division-links a').length,6);
   unchanged();
  });
  for(const [language,theme]of [['en','light'],['id','dark']]) {
   await suite.test('all primary routes and six divisions render through real navigation in '+language,async()=>{
    await route('settings');
    await preference('language',language);await preference('theme',theme);
    assert.equal(document.documentElement.lang,language);
    assert.equal(document.documentElement.dataset.theme,theme);
    assert.equal(JSON.parse(localStorage.getItem(EXPERIENCE_KEYS.extension)).preferences.language,language);
    assert.equal(JSON.parse(localStorage.getItem(EXPERIENCE_KEYS.extension)).preferences.theme,theme);
    for(const [name,en,id]of routes){
     await route(name);
     const title=language==='id'?id:en;
     assert.equal(document.querySelector('#page h1').textContent,title,name);
     assert.equal(document.querySelector('#crumb').textContent,title,name);
     assert.equal(document.title,title+' · DWDG UII',name);
     assert.equal(document.querySelector('.app-shell'),shell,'Shell replaced on '+name);
     assert.equal(document.querySelector('.sidebar'),sidebar,'Sidebar replaced on '+name);
     assert.equal(document.querySelector('.global-bar'),toolbar,'Toolbar replaced on '+name);
     assert.doesNotMatch(document.querySelector('#page').textContent,/undefined|\[object Object\]/,name);
     if(name==='projects')assert.equal(document.querySelector('.project-name strong').textContent,core.projects[0].name,'User project title was translated or lost');
     if(name==='documents')assert.ok([...document.querySelectorAll('.sx-document-name strong')].some(el=>el.textContent==='Saved document title'));
     if(name.startsWith('division/'))assert.ok(document.querySelector('.dx-workspace [data-action="new-record"][aria-label]'));
     unchanged();
    }
   });
  }
  await suite.test('project detail tabs and task views reconcile to saved project records',async()=>{
   await route('projects');
   const project=core.projects[0],expected=progress(core,project.id);
   await click('.project-row a[href="#project/'+project.id+'"]');
   assert.equal(location.hash,'#project/'+project.id);
   assert.equal(document.querySelector('#page h1').textContent,project.name);
   assert.match(document.querySelector('.delivery-track').textContent,new RegExp(expected.done+' / '+expected.total));
   for(const view of ['list','board','timeline']){
    await click('[data-action="project-tab"][data-value="tasks"]');
    await click('[data-action="task-view"][data-value="'+view+'"]');
    const selector=view==='list'?'[data-task-row]':view==='board'?'[data-drag-task]':'.et-row-task .et-label-main';
    const ids=[...document.querySelectorAll(selector)].map(el=>view==='list'?el.dataset.taskRow:view==='board'?el.dataset.dragTask:el.dataset.id).sort();
    assert.deepEqual(ids,core.tasks.filter(task=>task.projectId===project.id&&task.status!=='done').map(task=>task.id).sort(),view);
   }
   await click('[data-action="project-tab"][data-value="timeline"]');
   assert.deepEqual([...document.querySelectorAll('.et-row-task .et-label-main')].map(el=>el.dataset.id).sort(),core.tasks.filter(task=>task.projectId===project.id).map(task=>task.id).sort());
   await click('[data-action="project-tab"][data-value="documents"]');
   assert.ok(document.querySelector('[data-action="record"][data-id="preserved-document"]'));
   for(const tab of ['decisions','activity','overview'])await click('[data-action="project-tab"][data-value="'+tab+'"]');
   unchanged();assert.deepEqual(errors,[]);
   const reloaded=createExperienceStore(localStorage);
   assert.deepEqual(reloaded.core,core);
   assert.equal(reloaded.extras.byProject[project.id].documents.find(doc=>doc.id==='preserved-document').version_label,'v3');
  });
 } finally {
  console.error=originalError;globalThis.setInterval=interval;
  for(const timer of timers)clearInterval(timer);
  await window.happyDOM.close();
  for(const [name,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
 }
});

test('startup failure shows an escaped, bilingual error without modifying saved records',async()=>{
 for(const language of ['en','id']){
  const window=new Window();
  window.document.body.innerHTML='<main id="page"></main>';
  window.document.documentElement.lang=language;
  window.localStorage.setItem('existing-records','preserve-me');
  const log=console.error;console.error=()=>{};
  try{
   const ok=await startExperience(()=>Promise.reject(new Error('<img src=x onerror=alert(1)>')),window.document);
   assert.equal(ok,false);
   assert.ok(window.document.querySelector('[role=alert]'));
   assert.equal(window.document.querySelector('pre').textContent,'<img src=x onerror=alert(1)>');
   assert.equal(window.document.querySelectorAll('img').length,0);
   assert.equal(window.localStorage.getItem('existing-records'),'preserve-me');
   assert.equal(window.document.querySelector('button').textContent,language==='id'?'Coba lagi':'Try again');
  }finally{console.error=log;await window.happyDOM.close();}
 }
});

test('opening index directly shows local-preview guidance instead of an empty shell',async()=>{
 const window=new Window({settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 try{
  window.document.write(await readFile(new URL('./index.html',import.meta.url),'utf8'));
  const source=window.document.querySelector('#file-opening-guidance').textContent;
  Function('document','location',source)(window.document,{protocol:'file:'});
  assert.match(window.document.querySelector('#page h1').textContent,/Open the running workspace/);
  assert.equal(window.document.querySelector('#page a').getAttribute('href'),'http://127.0.0.1:5173/#home');
 }finally{await window.happyDOM.close();}
});
