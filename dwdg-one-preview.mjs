import {createPreviewStore, WORKSPACES, PEOPLE, peopleInWorkspace, STATUS_LABELS, selectProjects, projectProgress, projectBlockers} from './dwdg-one-preview-data.mjs';
import {escapeHtml as h, icon, createOverlays} from './experience-ui.mjs';
import {createTranslator, formatLocalDate} from './experience-i18n.mjs';
import {mountWork} from './dwdg-one-work.mjs';
import {renderProjectPage,renderLocalChanges} from './dwdg-one-project-page.mjs';
import {mountResources} from './dwdg-one-resources.mjs';
import {mountOptical} from './dwdg-one-optical.mjs';
import {mountResourceMaterials} from './dwdg-one-resource-material.mjs';
import {renderHome} from './dwdg-one-home.mjs';
import {todayISO} from './dwdg-one-daily.mjs';
import {createPreviewAccess} from './dwdg-one-access.mjs';
import {PROJECT_STAGE_ORDER,stageLabel,stageTipAttributes,renderStage,mountStageTips} from './dwdg-one-stages.mjs';

const NAV = [
 ['home','Home','Beranda','home'], ['work','My Work','Pekerjaan saya','tasks'],
 ['projects','Projects','Proyek','projects'], ['schedule','Schedule','Jadwal','calendar'],
 ['resources','Resources','Sumber daya','folder'], ['updates','Updates','Pembaruan','updates'],
 ['changes','Changes','Riwayat perubahan','clock'], ['organization','Organization','Organisasi','people'],
 ['settings','Settings','Pengaturan','settings']
];
const GROUPS = ['active','review','planned','draft','hold','completed','cancelled','archived'];
const copy = value => structuredClone(value);
const today = todayISO;

/** A local design preview. No product-store adapter or backend is initialized. */
export function mountPreview({storage,access:accessConfig} = {}) {
 const access=createPreviewAccess(accessConfig),rawStore=createPreviewStore(storage,{actorId:access.actorId});
 let resources;
 const store=access.wrapProjectStore(rawStore,{storage,hasProjectDependents:id=>resources?.hasProjectResources(id)||false});
 let prefs = copy(store.state.preferences), drafts = copy(store.state.drafts), views = copy(store.state.views);
 let destroyed = false, scrollTimer, notice = store.warning || '', noticeText='',noticeSource='', lastFeedback = '', lastFeedbackWorkspace = '',lastFeedbackKind='project',optical,resourceMaterials,unavailable=false;
 const t = createTranslator(()=>prefs.language);
 const ui = createOverlays({t});
 const stageTips=mountStageTips();
 const work=mountWork({store,access,getActorId:()=>access.actorId,getWorkspaceId:()=>prefs.workspaceId,getLanguage:()=>prefs.language,t,ui,onRender:()=>render(),onFeedback:feedback,onNotice:text=>{notice='custom';noticeText=text;noticeSource='work';renderNotices();},onOpenResource:openLinkedResource});
 resources=mountResources({storage,access,actorId:access.actorId,getProjectState:()=>store.state,getUnscopedProjectState:()=>rawStore.state,getWorkspaceId:()=>prefs.workspaceId,getLanguage:()=>prefs.language,t,ui,onRender:()=>render(),onNotice:(code,text)=>{notice=code;noticeText=text||'';renderNotices();},onTaskCreate:input=>store.createTask(input.workspaceId,input)});
 const $ = selector => document.querySelector(selector);
 const view = () => views[prefs.workspaceId] ||= {route:'projects',query:'',status:'all',lead:'all',sort:'target',selectedId:'',panel:'',scroll:0};
 const workspace = () => access.visibleWorkspaces().find(w=>w.id===prefs.workspaceId)||{id:'',name:'No workspace available',idName:'Tidak ada ruang kerja tersedia',icon:'briefcase'};
 const projectAllowed=(action,record={workspaceId:prefs.workspaceId})=>access.can('project',action,record);
 const roleLabel=()=>t(...({admin:['Demo administrator','Administrator contoh'],president:['Demo President','Presiden contoh'],vp:['Demo VP','VP contoh'],member:['Demo member','Anggota contoh'],lead:['Demo project lead','Ketua proyek contoh'],reviewer:['Demo reviewer','Peninjau contoh']}[access.role]||['Demo role','Peran contoh']));
 const labelWorkspace = w => prefs.language==='id' ? w.idName : w.name;
 const person = id => PEOPLE.find(p=>p.id===id);
 const personName = id => id==='demo-admin'?t('Demo administrator','Administrator contoh'):person(id)?.name||t('Unassigned','Belum ditugaskan');
 const statusLabel = status => stageLabel(status,t);
 const dateLabel = date => date ? formatLocalDate(date,prefs.language) : t('No target date','Tanpa tenggat');
 const pageLabel = route => {const entry=NAV.find(n=>n[0]===route)||NAV[2];return t(entry[1],entry[2]);};
 const blankFields = () => ({title:'',purpose:'',leadId:'',startDate:'',targetDate:''});
 const projectFields = p => Object.fromEntries(Object.keys(blankFields()).map(key=>[key,p?.[key]||'']));
 const errorText = code => ({
  title:t('Give this project a title.','Beri judul proyek ini.'),
  dates:t('Use valid dates. The target must be on or after the start.','Gunakan tanggal yang valid. Tenggat harus sama dengan atau setelah tanggal mulai.'),
  owner:t('Choose a lead from this workspace.','Pilih ketua dari ruang kerja ini.'),
  workspace:t('Choose an available workspace.','Pilih ruang kerja yang tersedia.'),
  storage:t('Storage is unavailable or full. Your change was not saved. Keep this form open and try again.','Penyimpanan tidak tersedia atau penuh. Perubahan belum tersimpan. Biarkan formulir terbuka dan coba lagi.'),
  conflict:t('Another tab changed this preview. Your form is kept here; copy it before reloading the latest preview.','Tab lain mengubah pratinjau ini. Formulir tetap tersimpan di sini; salin isinya sebelum memuat ulang pratinjau terbaru.'),
  corrupt:t('Saved preview data could not be read. It has been preserved. Project changes are paused; recover the saved copy before continuing.','Data pratinjau tersimpan tidak dapat dibaca dan tetap dipertahankan. Perubahan proyek dijeda; pulihkan salinan tersimpan sebelum melanjutkan.'),
  record:t('This demo project is no longer available. Your form is kept.','Proyek contoh ini sudah tidak tersedia. Formulir tetap dipertahankan.')
  ,denied:t('You do not have permission for this action. Your unfinished form is kept.','Anda tidak memiliki izin untuk tindakan ini. Formulir yang belum selesai tetap disimpan.')
  ,access:t('You do not have permission for this action. Your unfinished form is kept.','Anda tidak memiliki izin untuk tindakan ini. Formulir yang belum selesai tetap disimpan.')
 }[code] || t('Your change could not be saved. Try again.','Perubahan belum tersimpan. Coba lagi.'));
 if(!access.allowsWorkspace(prefs.workspaceId)&&access.visibleWorkspaces().length)prefs.workspaceId=access.visibleWorkspaces()[0].id;

 function persistUI() {
  try {store.saveUI({preferences:prefs,drafts,views:Object.fromEntries(Object.entries(views).filter(([workspaceId])=>access.allowsWorkspace(workspaceId)))}); if(notice==='storage'||notice==='conflict')notice='';return true;}
  catch(error){notice=error.code||'storage';renderNotices();return false;}
 }
 function applyPreferences() {
  document.documentElement.lang=prefs.language;
  document.documentElement.dataset.theme=prefs.theme;
  document.documentElement.dataset.motion=prefs.motion;
  document.documentElement.dataset.transparency=prefs.transparency;
  const meta=$('meta[name="theme-color"]');if(meta)meta.content=prefs.theme==='dark'?'#131619':'#F5F6F8';
 }
 function avatar(id) {
  const p=person(id);
  const initials=p?p.name.split(' ').map(x=>x[0]).slice(0,2).join(''):'—';
  return `<span class="one-avatar" aria-hidden="true">${h(initials)}</span>`;
 }
 function chip(status) {return renderStage(status,t);}
 function selectOptions(key) {
  if(key==='status')return [['all',t('All stages','Semua tahap')],...PROJECT_STAGE_ORDER.map(s=>[s,statusLabel(s)])];
  if(key==='sort')return [['target',t('Target date','Tenggat')],['title',t('Project name','Nama proyek')]];
  const leads=peopleInWorkspace(prefs.workspaceId).map(p=>[p.id,personName(p.id)]);
  return key==='leadId'?[['',t('Unassigned','Belum ditugaskan')],...leads]:[['all',t('All leads','Semua ketua')],['unassigned',t('Unassigned','Belum ditugaskan')],...leads];
 }
 function selectControl(id,key,label,value,classes='one-filter') {
  const selected=selectOptions(key).find(([v])=>v===value);
  return `<button type="button" id="${id}" class="one-select-trigger ${classes}" data-action="select" data-select="${key}" data-value="${h(value)}" ${key==='status'?stageTipAttributes(value,t):''} role="combobox" aria-label="${h(label)}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-options"><span class="one-select-value">${key==='status'?renderStage(value,t,{badge:false}):h(selected?.[1]||'')}</span>${icon('chevron-down')}</button>`;
 }
 function openSelect(anchor,direction=0) {
  stageTips.hide();
  const key=anchor.dataset.select,id=anchor.id,options=selectOptions(key),selected=anchor.dataset.value,selectWorkspace=prefs.workspaceId;
  const panel=ui.open({kind:'popover',anchor,title:anchor.getAttribute('aria-label'),content:`<div class="one-select-menu" id="${id}-options" role="listbox" aria-label="${h(anchor.getAttribute('aria-label'))}">${options.map(([value,label])=>`<button type="button" role="option" class="one-select-option ${value===selected?'selected':''} ${key==='status'&&value==='hold'?'one-stage-secondary':''}" ${key==='status'?stageTipAttributes(value,t):''} aria-selected="${value===selected}" tabindex="${value===selected?'0':'-1'}" data-overlay-action="select-option" data-value="${h(value)}"><span>${key==='status'?renderStage(value,t,{badge:false}):h(label)}</span><span class="one-option-check">${value===selected?icon('check'):''}</span></button>`).join('')}</div>`,onAction:async(action,target)=>{
   if(action!=='select-option')return;
   if(prefs.workspaceId!==selectWorkspace||!access.allowsWorkspace(selectWorkspace))return;
   const activeDraft=drafts[selectWorkspace];if(key==='leadId'&&(!activeDraft||!projectAllowed(activeDraft.projectId?'update':'create',activeDraft.projectId?store.state.projects.find(p=>p.id===activeDraft.projectId):undefined)))return denied();
   const value=target.dataset.value;
   saveDraftFields();
   if(key==='leadId')drafts[prefs.workspaceId].fields.leadId=value;else view()[key]=value;
   await ui.close(true,{waitForExit:false});persistUI();render();document.getElementById(id)?.focus({preventScroll:true});
  }});
  panel.classList.add('one-select-popover');
  panel.style.width=`${Math.max(208,anchor.getBoundingClientRect().width)}px`;
  anchor.setAttribute('aria-expanded','true');
  const controls=[...panel.querySelectorAll('[role="option"]')];
  let index=Math.max(0,options.findIndex(([value])=>value===selected)),typed='',typedAt=0;
  const focusIndex=next=>{index=(next+controls.length)%controls.length;controls.forEach((el,i)=>el.tabIndex=i===index?0:-1);controls[index]?.focus({preventScroll:true});};
  requestAnimationFrame(()=>focusIndex(index+(direction>0?1:direction<0?-1:0)));
  panel.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();focusIndex(index+(event.key==='ArrowDown'?1:-1));}
   else if(event.key==='Home'||event.key==='End'){event.preventDefault();focusIndex(event.key==='Home'?0:controls.length-1);}
   else if(event.key==='Tab'){ui.close(true,{waitForExit:false});}
   else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&event.key!==' '){
    const now=Date.now();typed=now-typedAt>700?event.key:typed+event.key;typedAt=now;
    const matches=options.map(([,label],i)=>({label:label.toLocaleLowerCase(),i})).filter(item=>item.label.startsWith(typed.toLocaleLowerCase()));
    const match=matches.find(item=>item.i>index)||matches[0];if(match){event.preventDefault();focusIndex(match.i);}
   }
  });
  // Dismissals are owned by the shared overlay; mirror its closing state on the trigger.
  const layer=panel.closest('.ux-layer');
  const observer=new window.MutationObserver(()=>{if(layer.classList.contains('ux-leaving')||!layer.isConnected){anchor.setAttribute('aria-expanded','false');observer.disconnect();}});
  observer.observe(layer,{attributes:true,attributeFilter:['class']});
 }
 function button(text,action,ic='',extra='',classes='') {return `<button type="button" class="one-button ${classes}" data-action="${action}" ${extra}>${ic?icon(ic):''}<span>${h(text)}</span></button>`;}
 function renderNotices() {
  const el=$('#one-notices');if(!el)return;
  el.innerHTML=notice?`<div class="one-notice error" role="alert">${icon('warning')}<span>${h(noticeText||errorText(notice))}</span></div>`:'';
 }
 function captureFocus() {
  const el=document.activeElement;
  if(!el || el===document.body)return null;
  return {id:el.id,action:el.dataset?.action,record:el.dataset?.id,context:Object.fromEntries(['route','mode','tab','key','select','workspace'].filter(key=>el.dataset?.[key]!==undefined).map(key=>[key,el.dataset[key]])),start:el.selectionStart,end:el.selectionEnd};
 }
 function restoreFocus(saved) {
  if(!saved)return;
  let el=saved.id?document.getElementById(saved.id):null;
  if(!el&&saved.action){el=[...document.querySelectorAll('[data-action]')].find(e=>e.dataset.action===saved.action&&(!saved.record||e.dataset.id===saved.record)&&Object.entries(saved.context||{}).every(([key,value])=>e.dataset[key]===value));}
  if(!el||el.closest('[hidden]'))return;
  el.focus({preventScroll:true});
  if(typeof saved.start==='number'&&el.setSelectionRange){try{el.setSelectionRange(saved.start,saved.end);}catch{}}
 }
 function renderShell() {
  const w=workspace(),v=view();
  $('#one-workspace').innerHTML=`<button id="one-workspace-control" type="button" class="one-workspace-trigger" data-action="workspace" ${access.visibleWorkspaces().length?'':'disabled'} aria-haspopup="dialog" aria-label="${h(t('Switch workspace','Ganti ruang kerja'))}: ${h(labelWorkspace(w))}"><span class="one-workspace-symbol">${icon(w.icon||'briefcase')}</span><span><strong>${h(labelWorkspace(w))}</strong><small>${h(t('Workspace','Ruang kerja'))}</small></span>${icon('chevron-down')}</button>`;
  $('#one-nav').innerHTML=NAV.map(([route,en,id,ic],index)=>`${index===7?`<span class="one-nav-caption">${h(t('Organization','Organisasi'))}</span>`:''}<button class="one-nav-item ${v.route===route?'active':''}" data-action="navigate" data-route="${route}" ${v.route===route?'aria-current="page"':''}>${icon(ic)}<span>${h(t(en,id))}</span>${!['home','projects','work','resources','changes'].includes(route)?`<span class="one-nav-later" aria-label="${h(t('Preview coming later','Pratinjau menyusul'))}">·</span>`:''}</button>`).join('');
  $('#one-context').innerHTML=`<span>${h(labelWorkspace(w))}</span><span aria-hidden="true">/</span><strong>${h(pageLabel(v.route))}</strong>`;
  $('#one-top-controls').innerHTML=`<span class="one-demo-badge">${h(t('Design preview · Demo data','Pratinjau desain · Data contoh'))}</span><button class="one-icon-button" data-action="language" aria-label="${h(t('Switch to Bahasa Indonesia','Ganti ke English'))}" title="${h(t('Switch to Bahasa Indonesia','Ganti ke English'))}">${icon('globe')}<span class="one-locale">${prefs.language.toUpperCase()}</span></button><button type="button" class="one-theme-toggle" data-action="theme" role="switch" aria-checked="${prefs.theme==='dark'}" aria-label="${h(t('Dark theme','Tema gelap'))}" title="${h(t(prefs.theme==='light'?'Switch to dark theme':'Switch to light theme',prefs.theme==='light'?'Ganti ke tema gelap':'Ganti ke tema terang'))}"><span class="one-theme-disc">${icon(prefs.theme==='light'?'sun':'moon')}</span></button>`;
  const footer=$('#one-profile-copy');if(footer)footer.innerHTML=`<strong>${h(roleLabel())}</strong><small>${access.visibleWorkspaces().length} ${h(t('workspaces · Local preview','ruang kerja · Pratinjau lokal'))}</small>`;
  const role=$('#one-profile-role');if(role)role.textContent=t('Demo admin','Admin contoh');
  const previewLabel=$('#one-preview-label');if(previewLabel)previewLabel.textContent=t('UI preview · local demo','Pratinjau UI · contoh lokal');
  $('.one-skip')?.replaceChildren(t('Skip to content','Lewati ke konten'));
  $('.one-sidebar')?.setAttribute('aria-label',t('Workspace navigation','Navigasi ruang kerja'));
  $('#one-nav')?.setAttribute('aria-label',t('Main navigation','Navigasi utama'));
  $('#one-inspector')?.setAttribute('aria-label',t('Project detail','Detail proyek'));
  $('.one-brand')?.setAttribute('aria-label',t('DWDG’ONE design preview','Pratinjau desain DWDG’ONE'));
  document.title=`${pageLabel(v.route)} · DWDG’ONE · ${t('Preview','Pratinjau')}`;
  $('#one-nav-backdrop')?.setAttribute('aria-label',t('Close navigation','Tutup navigasi'));
  $('[data-action="toggle-nav"]')?.setAttribute('aria-label',t('Open navigation','Buka navigasi'));
  $('[data-action="toggle-nav"]')?.setAttribute('aria-expanded',document.body.dataset.navOpen==='true'?'true':'false');
  setNavigation(document.body.dataset.navOpen==='true');
 }
 function renderProjects() {
  const v=view(),rows=selectProjects(store.state,prefs.workspaceId,v);
  const active=rows.filter(p=>p.status==='active').length,blockers=rows.reduce((n,p)=>n+projectBlockers(store.state,p.id).length,0);
  const draft=drafts[prefs.workspaceId];
  const createButton=projectAllowed('create')?button(t('New project','Proyek baru'),'new-project','plus','','primary'):'';
  let html=`<div class="one-heading"><div><h1>${h(t('Projects','Proyek'))}</h1></div>${createButton}</div><div id="one-notices"></div>`;
  if(draft && v.panel!=='form'&&projectAllowed(draft.projectId?'update':'create',draft.projectId?store.state.projects.find(p=>p.id===draft.projectId):undefined))html+=`<div class="one-notice"><span>${h(t('An unfinished form is kept on this device.','Formulir yang belum selesai tersimpan di perangkat ini.'))}</span>${button(t('Resume form','Lanjutkan formulir'),'new-project','edit','','quiet')}</div>`;
  html+=`<section class="one-summary" aria-label="${h(t('Filtered project summary','Ringkasan proyek terfilter'))}"><div class="one-stat"><span>${h(t('Projects','Proyek'))}</span><strong data-count-projects>${rows.length}</strong><small>${h(t('in this view','di tampilan ini'))}</small></div><div class="one-stat"><span>${h(t('Active','Aktif'))}</span><strong>${active}</strong><small>${h(t('projects in progress','proyek berjalan'))}</small></div><div class="one-stat"><span>${h(t('Open blockers','Hambatan terbuka'))}</span><strong>${blockers}</strong><small>${h(t('across these projects','pada proyek ini'))}</small></div></section>`;
  html+=`<div class="one-tools"><label class="one-search">${icon('search')}<input type="search" id="one-search" value="${h(v.query||'')}" placeholder="${h(t('Find a project…','Cari proyek…'))}" aria-label="${h(t('Search projects','Cari proyek'))}"></label>${selectControl('one-status-filter','status',t('Filter by lifecycle','Filter berdasarkan tahap'),v.status)}${selectControl('one-lead-filter','lead',t('Filter by lead','Filter berdasarkan ketua'),v.lead)}${selectControl('one-sort','sort',t('Sort projects','Urutkan proyek'),v.sort,'one-sort')}<button class="one-icon-button" data-action="undo" ${store.canUndo(prefs.workspaceId)?'':'disabled'} aria-label="${h(t('Undo last project change','Urungkan perubahan proyek terakhir'))}" title="${h(t('Undo last project change','Urungkan perubahan proyek terakhir'))}">${icon('undo')}</button></div>`;
  html+=`<div class="one-column-head" aria-hidden="true"><span>${h(t('Project','Proyek'))}</span><span>${h(t('Lead','Ketua'))}</span><span>${h(t('Progress','Progres'))}</span><span>${h(t('Target','Tenggat'))}</span><span></span></div>`;
  if(!rows.length)html+=`<section class="one-empty">${icon('projects')}<h2>${h(t('No projects in this view','Tidak ada proyek di tampilan ini'))}</h2><p>${h(t('Try clearing the filters.','Coba hapus filter.'))}</p><div class="one-form-actions">${button(t('Clear filters','Hapus filter'),'clear-filters','filter')}${createButton}</div></section>`;
  for(const status of GROUPS){const group=rows.filter(p=>p.status===status);if(!group.length)continue;
   html+=`<section class="one-group" aria-label="${h(statusLabel(status))}"><div class="one-group-heading">${chip(status)}<span>${group.length}</span></div><div class="one-project-list">${group.map(p=>projectRow(p)).join('')}</div></section>`;
  }
  html+=`<p class="one-preview-footnote">${h(t('Demo data. Grid and Timeline are planned for a later iteration.','Data contoh. Kisi dan Linimasa direncanakan pada iterasi berikutnya.'))}</p>`;
  $('#one-content').innerHTML=html;
 }
 function projectRow(p) {
  const progress=projectProgress(store.state,p.id),blockers=projectBlockers(store.state,p.id),lead=person(p.leadId);
  const overdue=p.targetDate&&p.targetDate<today()&&!['completed','archived','cancelled'].includes(p.status);
  return `<article class="one-project-row ${view().selectedId===p.id?'selected':''}" data-project-id="${h(p.id)}"><div class="one-project-main"><button class="one-project-title" data-action="open-project" data-id="${h(p.id)}">${h(p.title)}</button><div class="one-project-meta">${blockers.length?`<span class="one-blocker">${icon('warning')}${blockers.length} ${h(t(blockers.length===1?'blocker':'blockers','hambatan'))}</span>`:`<span>${h(p.purpose||t('Purpose to be defined','Tujuan belum ditentukan'))}</span>`}</div></div><div class="one-lead">${avatar(p.leadId)}<span>${h(personName(p.leadId))}</span></div><div class="one-progress"><div><span>${progress.total?`${progress.done} / ${progress.total}`:h(t('No tasks yet','Belum ada tugas'))}</span><span>${progress.total?`${progress.percent}%`:'—'}</span></div><div class="one-track" aria-hidden="true"><span style="width:${progress.percent}%"></span></div><span class="one-sr-only">${progress.done} ${h(t('completed of','selesai dari'))} ${progress.total} ${h(t('tasks','tugas'))}</span></div><div class="one-due ${overdue?'overdue':''}">${icon('calendar')}<span>${h(dateLabel(p.targetDate))}</span></div>${projectAllowed('update',p)?`<button class="one-icon-button one-row-edit" data-action="edit-project" data-id="${h(p.id)}" aria-label="${h(t('Edit project','Edit proyek'))}: ${h(p.title)}">${icon('edit')}</button>` : '<span aria-hidden="true"></span>'}</article>`;
 }
 function renderComing() {
  const route=view().route;
  const copyText={changes:["Workspace-scoped change history belongs here. Production history will record additions, edits and deletions by authorized members.","Riwayat perubahan per ruang kerja akan hadir di sini. Riwayat produksi akan mencatat penambahan, perubahan, dan penghapusan oleh anggota berwenang."],schedule:["Meetings, deadlines and availability will come together here in a later design iteration.","Rapat, tenggat, dan ketersediaan akan terhubung di sini pada iterasi desain berikutnya."],resources:["Connected notes, folders, files and app links will be designed in a later iteration.","Catatan, folder, berkas, dan tautan aplikasi yang terhubung akan dirancang pada iterasi berikutnya."]};
  $('#one-content').innerHTML=`<div id="one-notices"></div><section class="one-coming"><span class="one-coming-icon">${icon(NAV.find(n=>n[0]===route)?.[3])}</span><span class="one-chip">${h(t('Coming in a later iteration','Hadir pada iterasi berikutnya'))}</span><h1>${h(pageLabel(route))}</h1><p>${h(copyText[route]?t(...copyText[route]):t('Not included in this preview. Planned for a later iteration.','Belum termasuk dalam pratinjau ini. Direncanakan pada iterasi berikutnya.'))}</p>${route==='settings'?button(t('Display preferences','Preferensi tampilan'),'display','settings'):''}${button(t('Back to Projects','Kembali ke Proyek'),'navigate','projects','data-route="projects"','primary')}</section>`;
 }
 function renderUnavailable() {
  const noWorkspace=!access.visibleWorkspaces().length;
  $('#one-content').innerHTML=`<div id="one-notices"></div><section class="one-empty"><span class="one-coming-icon">${icon('projects')}</span><h1>${h(noWorkspace?t('No workspace available','Tidak ada ruang kerja tersedia'):t('Record unavailable','Catatan tidak tersedia'))}</h1><p>${h(noWorkspace?t('No workspace is available for this demo role.','Tidak ada ruang kerja tersedia untuk peran contoh ini.'):t('This record is not available in your current access.','Catatan ini tidak tersedia dengan akses Anda saat ini.'))}</p>${noWorkspace?'':button(t('Back to Projects','Kembali ke Proyek'),'navigate','projects','data-route="projects"')}</section>`;
 }
 function denied() {notice='denied';noticeText='';renderNotices();}
 function showUnavailable() {
  saveDraftFields();work.close();resources.close();persistUI();unavailable=true;lastFeedback='';notice='';noticeText='';render();$('#one-content')?.focus({preventScroll:true});
 }
 async function openRecord({family,id}={}) {
  const state=store.state,record=family==='project'?state.projects.find(p=>p.id===id):family==='task'?state.tasks.find(p=>p.id===id):family==='resource'?resources.store.state.resources.find(p=>p.id===id&&!p.archived):null;
  if(!record)return showUnavailable();
  if(record.workspaceId!==prefs.workspaceId)await switchWorkspace(record.workspaceId);
  // Scope may have changed while the outgoing overlay was closing.
  const current=family==='resource'?resources.store.state.resources.find(p=>p.id===id):store.state[family==='project'?'projects':'tasks']?.find(p=>p.id===id);
  if(!current||!access.allowsWorkspace(current.workspaceId))return showUnavailable();
  unavailable=false;saveDraftFields();work.close();resources.close();Object.assign(view(),{panel:'',projectPageId:'',linkedReturn:null,route:family==='project'?'projects':family==='task'?'work':'resources'});
  if(family==='project')Object.assign(view(),{projectPageId:id,projectTab:'overview'});
  persistUI();render();
  if(family==='task')await work.handleAction('work-open',{dataset:{id}});
  if(family==='resource')await resources.handleAction('res-inspect',{dataset:{id}});
  if(family==='project')$('#one-project-tab-overview')?.focus({preventScroll:true});
 }
 async function updateScope(update) {
  saveDraftFields();work.saveDraft();resources.saveDraft();persistUI();
  work.close();resources.close();await ui.close(false,{waitForExit:false});
  document.querySelectorAll('.ux-layer.ux-leaving').forEach(layer=>layer.replaceChildren());
  access.updateScope(update);prefs=copy(store.state.preferences);drafts=copy(store.state.drafts);views=copy(store.state.views);
  work.refreshScope?.();resources.refreshScope?.();
  if(!access.allowsWorkspace(prefs.workspaceId)&&access.visibleWorkspaces().length)prefs.workspaceId=access.visibleWorkspaces()[0].id;
  unavailable=true;lastFeedback='';notice='';noticeText='';setNavigation(false);render();$('#one-content')?.focus({preventScroll:true});
 }
 function onHash() {
  const match=/^#(project|task|resource)\/([^/]+)$/.exec(window.location.hash);
  if(match){let id;try{id=decodeURIComponent(match[2]);}catch{return showUnavailable();}openRecord({family:match[1],id});}
 }
 function renderInspector() {
  const el=$('#one-inspector'),v=view(),draft=drafts[prefs.workspaceId];
  const p=store.state.projects.find(x=>x.id===v.selectedId&&x.workspaceId===prefs.workspaceId);
  const workActive=v.route==='work'||v.route==='projects'&&v.projectPageId&&v.projectTab==='work';
  const resActive=v.route==='resources'||v.route==='projects'&&v.projectPageId&&v.projectTab==='resources';
  const custom=workActive&&work.hasInspector?work.inspector():resActive&&resources?.hasInspector?resources.inspector():'';
  const allowedDraft=draft&&projectAllowed(draft.projectId?'update':'create',draft.projectId?store.state.projects.find(p=>p.id===draft.projectId):undefined);
  const open=!unavailable&&access.allowsWorkspace(prefs.workspaceId)&&(custom||v.route==='projects'&&(v.panel==='form'&&allowedDraft||!v.projectPageId&&v.panel==='detail'&&p));
  el.hidden=!open;document.body.dataset.panelOpen=open?'true':'false';$('#one-page').classList.toggle('has-inspector',Boolean(open));
  if(!open){el.innerHTML='';return;}
  if(custom){el.innerHTML=custom;el.setAttribute('aria-label',workActive?t('Task detail','Detail tugas'):t('Resource detail','Detail sumber daya'));return;}
  const heading=v.panel==='form'?t(draft.projectId?'Edit project':'New project',draft.projectId?'Edit proyek':'Proyek baru'):t('Project summary','Ringkasan proyek');
  el.innerHTML=`<header class="one-panel-header"><div><small>${h(labelWorkspace(workspace()))}</small><h2>${h(heading)}</h2></div><button class="one-icon-button" data-action="close-inspector" aria-label="${h(t('Back to projects','Kembali ke proyek'))}" title="${h(t('Back to projects','Kembali ke proyek'))}">${icon('close')}</button></header>${v.panel==='form'?formHTML(draft):detailHTML(p)}`;
  if(v.panel==='detail'){el.querySelector('.one-detail-purpose')?.insertAdjacentHTML('afterend',button(t('Open project','Buka proyek'),'project-page','chevron-right',`data-id="${h(p.id)}"`,'primary'));el.querySelector('.one-preview-footnote')?.remove();}
 }
 function detailHTML(p) {
  const n=projectProgress(store.state,p.id),blockers=projectBlockers(store.state,p.id);
  return `<div class="one-detail">${chip(p.status)}<h2 class="one-detail-title">${h(p.title)}</h2><p class="one-detail-purpose">${h(p.purpose||t('No purpose added.','Tujuan belum ditambahkan.'))}</p>${projectAllowed('update',p)?button(t('Edit project','Edit proyek'),'edit-project','edit',`data-id="${h(p.id)}"`,'primary'):''}<section class="one-detail-section"><h3>${h(t('Project details','Detail proyek'))}</h3><dl class="one-property-grid"><dt>${h(t('Lead','Ketua'))}</dt><dd>${h(personName(p.leadId))}</dd><dt>${h(t('Start date','Tanggal mulai'))}</dt><dd>${h(p.startDate?dateLabel(p.startDate):t('Not set','Belum diatur'))}</dd><dt>${h(t('Target date','Tenggat'))}</dt><dd>${h(dateLabel(p.targetDate))}</dd></dl></section><section class="one-detail-section"><h3>${h(t('Work progress','Progres pekerjaan'))}</h3><div class="one-progress"><div><span>${n.total?`${n.done} / ${n.total} ${h(t('tasks completed','tugas selesai'))}`:h(t('No tasks yet','Belum ada tugas'))}</span><span>${n.total?`${n.percent}%`:'—'}</span></div><div class="one-track" aria-hidden="true"><span style="width:${n.percent}%"></span></div></div></section><section class="one-detail-section"><h3>${h(t('Open blockers','Hambatan terbuka'))}</h3>${blockers.length?`<ul class="one-detail-list">${blockers.map(b=>`<li>${icon('warning')}<span>${h(b.title)}</span></li>`).join('')}</ul>`:`<p>${h(t('No open blockers recorded.','Belum ada hambatan terbuka tercatat.'))}</p>`}</section><p class="one-preview-footnote">${h(t('Open the project for Overview, Work and Resources.','Buka proyek untuk Ringkasan, Pekerjaan, dan Sumber daya.'))}</p></div>`;
 }
 function formHTML(draft) {
  const f=draft.fields,record=draft.projectId?store.state.projects.find(p=>p.id===draft.projectId):null,allowed=record?access.allowedFields('project',record):null,readonly=key=>Array.isArray(allowed)&&!allowed.includes(key)?'readonly':'';
  return `<form id="one-project-form" class="one-form" novalidate><p class="one-form-intro">${h(t('Title is required. Other fields are optional.','Judul wajib diisi. Isian lainnya opsional.'))}</p><div id="one-form-error" class="one-notice error" role="alert" hidden></div><div class="one-field"><label for="one-title">${h(t('Project title','Judul proyek'))}<span aria-hidden="true"> *</span></label><input id="one-title" name="title" ${readonly('title')} value="${h(f.title)}" required autocomplete="off" aria-describedby="one-title-error"><span id="one-title-error" class="one-field-error" hidden></span></div><div class="one-field"><label for="one-purpose">${h(t('Purpose','Tujuan'))}<small> ${h(t('Optional','Opsional'))}</small></label><textarea id="one-purpose" name="purpose" ${readonly('purpose')} rows="4" placeholder="${h(t('What should this project achieve?','Apa yang ingin dicapai proyek ini?'))}">${h(f.purpose)}</textarea></div><div class="one-field"><label for="one-lead">${h(t('Project lead','Ketua proyek'))}<small> ${h(t('Optional','Opsional'))}</small></label><input type="hidden" name="leadId" value="${h(f.leadId)}">${readonly('leadId')?selectControl('one-lead','leadId',t('Project lead','Ketua proyek'),f.leadId,'one-form-select').replace('<button type="button"','<button type="button" disabled'):selectControl('one-lead','leadId',t('Project lead','Ketua proyek'),f.leadId,'one-form-select')}</div><div class="one-date-fields"><div class="one-field"><label for="one-start">${h(t('Start date','Tanggal mulai'))}</label><input id="one-start" type="date" name="startDate" ${readonly('startDate')} value="${h(f.startDate)}"></div><div class="one-field"><label for="one-target">${h(t('Target date','Tenggat'))}</label><input id="one-target" type="date" name="targetDate" ${readonly('targetDate')} value="${h(f.targetDate)}" aria-describedby="one-date-error"></div></div><span id="one-date-error" class="one-field-error" hidden></span><p class="one-form-hint">${h(draft.projectId?t('Editing keeps the project’s current stage.','Pengeditan mempertahankan tahap proyek saat ini.'):t('New projects begin as Draft.','Proyek baru dimulai sebagai Draf.'))}</p><div class="one-form-actions"><button type="button" class="one-button" data-action="cancel-form">${h(t('Cancel','Batal'))}</button><button type="submit" class="one-button primary">${icon('check')}${h(t('Save project','Simpan proyek'))}</button></div><p id="one-draft-status" class="one-form-hint">${h(t('Unfinished forms are kept on this device.','Formulir yang belum selesai disimpan di perangkat ini.'))}</p></form>`;
 }
 function render() {
  if(destroyed)return;
  stageTips.hide();
  const focus=captureFocus(),scroll=window.scrollY;
  optical?.destroy();optical=null;
  applyPreferences();renderShell();
  const v=view(),p=store.state.projects.find(p=>p.id===v.projectPageId&&p.workspaceId===prefs.workspaceId);
  if(unavailable||!access.allowsWorkspace(prefs.workspaceId))renderUnavailable();
  else if(v.route==='home')$('#one-content').innerHTML=renderHome({state:store.state,workspaceId:prefs.workspaceId,actorId:access.actorId,t,language:prefs.language,resources,access});
  else if(v.route==='projects'&&p)$('#one-content').innerHTML=renderProjectPage(p,{tab:v.projectTab,t,work,resources,state:store.state,language:prefs.language,access,backLabel:v.linkedReturn?pageLabel(v.linkedReturn.route):''});
  else if(v.route==='projects')renderProjects();
  else if(v.route==='work')$('#one-content').innerHTML=work.render();
  else if(v.route==='resources'&&resources)$('#one-content').innerHTML=resources.render();
  else if(v.route==='changes')$('#one-content').innerHTML=renderLocalChanges({state:store.state,resourceState:resources?.store.state,workspaceId:prefs.workspaceId,t,language:prefs.language});
  else renderComing();
  renderInspector();renderNotices();renderFeedback();
  optical=mountOptical($('.one-optical-canvas'),{enabled:prefs.effects!==false&&prefs.transparency!=='solid',motion:prefs.motion,dark:prefs.theme==='dark'});
  const materialOptions={enabled:prefs.effects!==false,motion:prefs.motion,dark:prefs.theme==='dark',solid:prefs.transparency==='solid'};
  if(resourceMaterials)resourceMaterials.refresh(materialOptions);else resourceMaterials=mountResourceMaterials(document.body,materialOptions);
  restoreFocus(focus);window.scrollTo({top:scroll,behavior:'instant'});
 }
 function renderFeedback() {
  const el=$('#one-feedback');if(!el)return;
  el.hidden=!lastFeedback;
  const canUndo=lastFeedbackKind==='work'?store.canUndoTask(lastFeedbackWorkspace):store.canUndo(lastFeedbackWorkspace);
  el.innerHTML=lastFeedback?`<span>${icon('check')}${h(lastFeedback)}</span>${canUndo?button(t('Undo','Urungkan'),lastFeedbackKind==='work'?'work-undo':'undo','undo',`data-workspace="${h(lastFeedbackWorkspace)}"`,'quiet'):''}<button class="one-icon-button" data-action="dismiss-feedback" aria-label="${h(t('Dismiss notice','Tutup pemberitahuan'))}">${icon('close')}</button>`:'';
 }
 function feedback(text,kind='project') {if(kind==='work'&&noticeSource==='work'){notice='';noticeText='';noticeSource='';renderNotices();}lastFeedback=text;lastFeedbackKind=kind;lastFeedbackWorkspace=prefs.workspaceId;renderFeedback();}
 function openLinkedResource(task) {
  const resource=resources.store.state.resources.find(r=>r.id===task.resourceId&&r.workspaceId===prefs.workspaceId&&r.projectId===task.projectId&&!r.archived);
  const project=store.state.projects.find(p=>p.id===task.projectId&&p.workspaceId===prefs.workspaceId);
  if(!resource||!project){notice='custom';noticeSource='link';noticeText=t('This linked resource is unavailable.','Sumber daya terkait ini tidak tersedia.');renderNotices();return;}
  const v=view();v.linkedReturn={route:v.route,projectPageId:v.projectPageId||'',projectTab:v.projectTab||'',scroll:window.scrollY,taskId:task.id,resumeTask:work.hasInspector};
  work.close();resources.close();v.route='projects';v.projectPageId=project.id;v.projectTab='resources';v.panel='';persistUI();render();
  resources.handleAction('res-inspect',{dataset:{id:resource.id}});
 }
 function saveDraftFields() {
  const draft=drafts[prefs.workspaceId],form=$('#one-project-form');if(!draft||!form)return;
  for(const key of Object.keys(blankFields())){const input=form.elements.namedItem(key);if(input)draft.fields[key]=input.value;}
 }
 async function switchWorkspace(id) {
  if(!access.allowsWorkspace(id))return;
  saveDraftFields();work.close();resources?.close();view().scroll=window.scrollY;persistUI();await ui.close(true,{waitForExit:false});
  if(!access.allowsWorkspace(id))return;
  prefs.workspaceId=id;unavailable=false;lastFeedback='';ui.clearToast();setNavigation(false);persistUI();render();window.scrollTo({top:view().scroll||0,behavior:'instant'});
  (window.innerWidth<1024?$('[data-action="toggle-nav"]'):$('#one-workspace-control'))?.focus({preventScroll:true});
 }
 function openWorkspace(anchor) {
  if(!access.visibleWorkspaces().length)return;
  const content=`<label class="one-menu-search">${icon('search')}<input id="one-workspace-search" type="search" aria-label="${h(t('Find workspace','Cari ruang kerja'))}" placeholder="${h(t('Find workspace…','Cari ruang kerja…'))}"></label><div id="one-workspace-options">${access.visibleWorkspaces().map(w=>`<button class="one-workspace-option ${w.id===prefs.workspaceId?'selected':''}" data-overlay-action="switch-workspace" data-workspace="${w.id}" aria-current="${w.id===prefs.workspaceId?'true':'false'}">${icon(w.icon)}<span>${h(labelWorkspace(w))}</span>${w.id===prefs.workspaceId?icon('check'):''}</button>`).join('')}</div><p class="one-form-hint">${h(roleLabel())} · ${access.visibleWorkspaces().length} ${h(t('workspaces','ruang kerja'))}</p>`;
  const panel=ui.open({kind:'popover',title:t('Switch workspace','Ganti ruang kerja'),anchor,content,onAction:(action,target)=>{if(action==='switch-workspace')switchWorkspace(target.dataset.workspace);}});
  panel.querySelector('#one-workspace-search').addEventListener('input',event=>{
   const q=event.target.value.toLocaleLowerCase();let found=0;
   panel.querySelectorAll('[data-workspace]').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase().includes(q);if(!el.hidden)found++;});
   let empty=panel.querySelector('#one-workspace-empty');if(!empty){empty=document.createElement('p');empty.id='one-workspace-empty';empty.className='one-form-hint';panel.querySelector('#one-workspace-options').append(empty);}empty.hidden=found>0;empty.textContent=t('No matching workspace.','Tidak ada ruang kerja yang cocok.');
  });
  panel.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
   const input=event.target.matches('input');if(input&&['Home','End'].includes(event.key))return;
   const choices=[...panel.querySelectorAll('[data-workspace]')].filter(el=>!el.hidden);
   if(!choices.length)return;
   event.preventDefault();const current=choices.indexOf(document.activeElement);
   const next=event.key==='Home'?0:event.key==='End'?choices.length-1:input?0:(current+(event.key==='ArrowDown'?1:-1)+choices.length)%choices.length;
   choices[next].focus({preventScroll:true});
  });
 }
 function openDisplay(anchor) {
  ui.open({kind:'popover',anchor,title:t('Display preferences','Preferensi tampilan'),content:`<button class="one-workspace-option" data-overlay-action="motion" aria-pressed="${prefs.motion==='reduced'}">${icon('sparkles')}<span>${h(t('Reduce motion','Kurangi gerakan'))}</span>${prefs.motion==='reduced'?icon('check'):''}</button><button class="one-workspace-option" data-overlay-action="solid" aria-pressed="${prefs.transparency==='solid'}">${icon('projects')}<span>${h(t('Use solid surfaces','Gunakan permukaan solid'))}</span>${prefs.transparency==='solid'?icon('check'):''}</button>`,onAction:async(action)=>{if(action==='motion')prefs.motion=prefs.motion==='reduced'?'system':'reduced';if(action==='solid')prefs.transparency=prefs.transparency==='solid'?'translucent':'solid';saveDraftFields();persistUI();applyPreferences();await ui.close(true,{waitForExit:false});render();}});
 }
 function focusPanel() {requestAnimationFrame(()=>{const target=$('#one-title')||$('#one-inspector [data-action="edit-project"]')||$('#one-inspector [data-action="close-inspector"]');target?.focus({preventScroll:true});if(window.innerWidth<1024)window.scrollTo({top:0,behavior:'instant'});});}
 function setNavigation(open) {
  document.body.dataset.navOpen=open?'true':'false';
  $('.one-sidebar').inert=Boolean(!open&&window.innerWidth<1024);
  $('.one-body').inert=Boolean(open&&window.innerWidth<1024);
  $('[data-action="toggle-nav"]')?.setAttribute('aria-expanded',open?'true':'false');
 }
 async function editProject(id) {
  const p=store.state.projects.find(x=>x.id===id&&x.workspaceId===prefs.workspaceId);if(!p)return showUnavailable();if(!projectAllowed('update',p))return denied();
  const editWorkspace=prefs.workspaceId;
  saveDraftFields();const existing=drafts[prefs.workspaceId];
  if(existing&&existing.projectId!==id){const replace=await ui.confirm({title:t('Replace the unfinished form?','Ganti formulir yang belum selesai?'),message:t('The current unfinished form in this workspace will be discarded. Saved projects stay unchanged.','Formulir yang belum selesai di ruang kerja ini akan dibuang. Proyek tersimpan tetap sama.'),confirmLabel:t('Replace form','Ganti formulir'),cancelLabel:t('Keep form','Pertahankan formulir')});if(!replace)return;}
  if(prefs.workspaceId!==editWorkspace||!projectAllowed('update',store.state.projects.find(p=>p.id===id&&p.workspaceId===editWorkspace)))return denied();
  if(!existing||existing.projectId!==id)drafts[prefs.workspaceId]={projectId:id,fields:projectFields(p)};
  view().selectedId=id;view().panel='form';view().scroll=window.scrollY;persistUI();render();focusPanel();
 }
 function openNew() {
  const draft=drafts[prefs.workspaceId];if(!projectAllowed(draft?.projectId?'update':'create',draft?.projectId?store.state.projects.find(p=>p.id===draft.projectId):undefined))return denied();
  saveDraftFields();drafts[prefs.workspaceId] ||= {projectId:'',fields:blankFields()};
  view().panel='form';view().selectedId=drafts[prefs.workspaceId].projectId||'';view().scroll=window.scrollY;persistUI();render();focusPanel();
 }
 function closeInspector() {
  saveDraftFields();const draft=drafts[prefs.workspaceId];
  if(view().panel==='form'&&draft){
   const original=draft.projectId?projectFields(store.state.projects.find(p=>p.id===draft.projectId)):blankFields();
   if(Object.keys(original).every(key=>original[key]===draft.fields[key]))delete drafts[prefs.workspaceId];
  }
  const selected=view().selectedId;view().panel='';persistUI();render();
  window.scrollTo({top:view().scroll||0,behavior:'instant'});
  const row=[...document.querySelectorAll('[data-action="open-project"]')].find(el=>el.dataset.id===selected);
  (row||$('[data-action="new-project"]'))?.focus({preventScroll:true});
 }
 async function cancelForm() {
  saveDraftFields();const draft=drafts[prefs.workspaceId];if(!draft)return;
  const cancelWorkspace=prefs.workspaceId;
  const original=draft.projectId?projectFields(store.state.projects.find(p=>p.id===draft.projectId)):blankFields();
  const dirty=Object.keys(original).some(key=>original[key]!==draft.fields[key]);
  if(dirty&&!await ui.confirm({title:t('Discard this unfinished form?','Buang formulir yang belum selesai?'),message:t('Your unsaved form entries will be removed. Saved projects stay unchanged.','Isian formulir yang belum disimpan akan dibuang. Proyek tersimpan tetap sama.'),confirmLabel:t('Discard form','Buang formulir'),cancelLabel:t('Keep editing','Lanjutkan mengedit')}))return;
  if(prefs.workspaceId!==cancelWorkspace||drafts[cancelWorkspace]!==draft)return;
  delete drafts[prefs.workspaceId];closeInspector();
 }
 function showFormError(error) {
  const code=error.code||'storage',el=$('#one-form-error');
  if(!el)return;el.hidden=false;el.textContent=errorText(code);
  const input=code==='title'?$('#one-title'):code==='dates'?$('#one-target'):null;
  if(input){input.setAttribute('aria-invalid','true');const detail=$(code==='title'?'#one-title-error':'#one-date-error');detail.hidden=false;detail.textContent=errorText(code);input.focus({preventScroll:true});}
  else el.scrollIntoView({block:'nearest'});
 }
 function saveProject(event) {
  event.preventDefault();saveDraftFields();const draft=drafts[prefs.workspaceId];if(!draft)return;
  // Flush the current form before the atomic saved-record operation.
  if(!persistUI()){showFormError({code:notice});return;}
  try {const editing=Boolean(draft.projectId);const p=store.saveProject(prefs.workspaceId,draft.fields,draft.projectId||'');drafts=copy(store.state.drafts);views=copy(store.state.views);view().selectedId=p.id;view().panel='detail';notice='';render();feedback(t(editing?'Project updated':'Project created',editing?'Proyek diperbarui':'Proyek dibuat'));focusPanel();}
  catch(error){showFormError(error);}
 }
 async function undo(workspaceId=prefs.workspaceId) {
  if(!store.canUndo(workspaceId))return;
  saveDraftFields();if(!persistUI())return;
  try{const entry=store.state.undo[workspaceId]?.entries.at(-1);if(entry?.before===null&&resources?.store.state.resources.some(r=>r.projectId===entry.projectId))throw Object.assign(new Error('conflict'),{code:'conflict'});store.undo(workspaceId);drafts=copy(store.state.drafts);views=copy(store.state.views);lastFeedback='';notice='';noticeText='';render();feedback(t('Project change undone','Perubahan proyek diurungkan'));}
  catch(error){notice=error.code||'storage';renderNotices();}
 }
 async function onClick(event) {
  const target=event.target.closest('[data-action]');if(!target||target.closest('.ux-portal'))return;
  const action=target.dataset.action;
  if(action==='home-complete')return work.handleAction('work-complete',target);
  if(action.startsWith('home-')){
   if(action==='home-open-task'||action==='home-work'){
    saveDraftFields();work.close();resources.close();Object.assign(view(),{route:'work',projectPageId:'',panel:''});view().linkedReturn=null;
    work.setContext({filters:{query:'',owner:target.dataset.owner||'me',dateGroup:target.dataset.group||'all',projectFilter:'all',status:'all'}});persistUI();render();
    if(action==='home-open-task')await work.handleAction('work-open',target);else $('#one-work-search')?.focus({preventScroll:true});return;
   }
   if(action==='home-open-project'){
    const project=store.state.projects.find(p=>p.id===target.dataset.id&&p.workspaceId===prefs.workspaceId);if(!project)return;
    saveDraftFields();work.close();resources.close();view().linkedReturn={route:'home',scroll:window.scrollY};Object.assign(view(),{route:'projects',projectPageId:project.id,projectTab:'overview',panel:''});persistUI();render();$('#one-project-tab-overview')?.focus({preventScroll:true});return;
   }
   if(action==='home-projects'||action==='home-open-schedule'){saveDraftFields();work.close();resources.close();Object.assign(view(),{route:action==='home-projects'?'projects':'schedule',projectPageId:'',panel:''});view().linkedReturn=null;persistUI();render();$('#one-content')?.focus({preventScroll:true});return;}
  }
  if(action.startsWith('work-'))return work.handleAction(action,target,event);
  if(action.startsWith('res-'))return resources?.handleAction(action,target,event);
  if(action==='workspace')return openWorkspace(target);
  if(action==='select')return openSelect(target);
  if(action==='display')return openDisplay(target);
  if(action==='language'){saveDraftFields();work.saveDraft();resources?.saveDraft();prefs.language=prefs.language==='en'?'id':'en';persistUI();render();return;}
  if(action==='theme'){
   saveDraftFields();prefs.theme=prefs.theme==='light'?'dark':'light';persistUI();applyPreferences();
   target.setAttribute('aria-checked',String(prefs.theme==='dark'));
   target.title=t(prefs.theme==='light'?'Switch to dark theme':'Switch to light theme',prefs.theme==='light'?'Ganti ke tema gelap':'Ganti ke tema terang');
   target.querySelector('.one-theme-disc').innerHTML=icon(prefs.theme==='light'?'sun':'moon');
   optical?.setDark(prefs.theme==='dark');
   return;
  }
  if(action==='toggle-nav'||action==='close-nav'){setNavigation(action!=='close-nav'&&document.body.dataset.navOpen!=='true');if(document.body.dataset.navOpen==='true')$('#one-workspace-control')?.focus();else $('[data-action="toggle-nav"]')?.focus();return;}
  if(action==='navigate'){unavailable=false;saveDraftFields();work.close();resources?.close();view().route=target.dataset.route||'projects';view().projectPageId='';view().panel='';view().linkedReturn=null;setNavigation(false);persistUI();render();window.scrollTo({top:0,behavior:'instant'});const heading=$('#one-content h1')||$('#one-content h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}else $('#one-content')?.focus({preventScroll:true});return;}
  if(action==='project-page'){if(!store.state.projects.some(p=>p.id===target.dataset.id&&p.workspaceId===prefs.workspaceId))return showUnavailable();unavailable=false;saveDraftFields();view().projectPageId=target.dataset.id;view().projectTab='overview';view().panel='';persistUI();render();$('#one-project-tab-overview')?.focus({preventScroll:true});return;}
  if(action==='project-tab'){saveDraftFields();work.close();resources?.close();view().projectTab=target.dataset.tab;view().panel='';persistUI();render();$(`#one-project-tab-${view().projectTab}`)?.focus({preventScroll:true});return;}
  if(action==='project-back'){
   saveDraftFields();work.close();resources.close();const origin=view().linkedReturn;view().linkedReturn=null;
   if(origin){Object.assign(view(),{route:origin.route,projectPageId:origin.projectPageId||'',projectTab:origin.projectTab||'',panel:''});persistUI();render();window.scrollTo({top:origin.scroll||0,behavior:'instant'});if(origin.resumeTask&&origin.taskId)await work.handleAction('work-open',{dataset:{id:origin.taskId}});else(document.getElementById(`work-task-${origin.taskId}`)||$('#one-content'))?.focus({preventScroll:true});}
   else{view().projectPageId='';view().panel='';persistUI();render();window.scrollTo({top:view().scroll||0,behavior:'instant'});[...document.querySelectorAll('[data-action="open-project"]')].find(el=>el.dataset.id===view().selectedId)?.focus({preventScroll:true});}return;
  }
  if(action==='new-project')return openNew();
  if(action==='edit-project')return editProject(target.dataset.id);
  if(action==='open-project'){if(!store.state.projects.some(p=>p.id===target.dataset.id&&p.workspaceId===prefs.workspaceId))return showUnavailable();unavailable=false;saveDraftFields();view().scroll=window.scrollY;view().selectedId=target.dataset.id;view().panel='detail';persistUI();render();focusPanel();return;}
  if(action==='close-inspector')return closeInspector();
  if(action==='cancel-form')return cancelForm();
  if(action==='clear-filters'){Object.assign(view(),{query:'',status:'all',lead:'all'});persistUI();render();return;}
  if(action==='undo')return undo(target.dataset.workspace||prefs.workspaceId);
  if(action==='dismiss-feedback'){lastFeedback='';renderFeedback();}
 }
 function onInput(event) {
  if(work.handleInput(event)||resources?.handleInput(event))return;
  if(event.target.closest('#one-project-form')){saveDraftFields();const ok=persistUI();const status=$('#one-draft-status');if(status)status.textContent=ok?t('Unfinished form kept on this device.','Formulir belum selesai tersimpan di perangkat ini.'):t('This form could not be stored. Keep it open.','Formulir belum dapat disimpan. Biarkan tetap terbuka.');event.target.removeAttribute('aria-invalid');return;}
  if(event.target.id==='one-search'){view().query=event.target.value;persistUI();render();}
 }
 function onChange(event) {
  const key={'one-status-filter':'status','one-lead-filter':'lead','one-sort':'sort'}[event.target.id];
  if(key){view()[key]=event.target.value;persistUI();render();}
 }
 function onKey(event) {
  if(event.defaultPrevented)return;
  if(event.target.matches?.('[role="tab"][data-action="project-tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const tabs=['overview','work','resources'],current=tabs.indexOf(view().projectTab||'overview'),next=event.key==='Home'?0:event.key==='End'?2:(current+(event.key==='ArrowRight'?1:-1)+3)%3;document.getElementById(`one-project-tab-${tabs[next]}`)?.click();return;}
  if(event.target.matches?.('[data-action="select"]')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openSelect(event.target,event.key==='ArrowDown'?1:-1);return;}
  if(event.target.matches?.('[data-action="work-filter"],[data-action="work-choice"]')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();work.handleAction(event.target.dataset.action,event.target);return;}
  if(event.key==='Escape') {if(document.body.dataset.navOpen==='true'){setNavigation(false);$('[data-action="toggle-nav"]')?.focus();}else if(work.hasInspector){const opener=work.close();render();document.getElementById(opener)?.focus({preventScroll:true});}else if(resources?.hasInspector){resources.close();render();}else if(view().panel)closeInspector();}
  if(event.key==='Tab'&&document.body.dataset.navOpen==='true'&&window.innerWidth<1024&&!ui.isOpen()){
   const controls=[...document.querySelectorAll('.one-sidebar a[href],.one-sidebar button:not([disabled])')];
   if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1)?.focus();}
   else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0]?.focus();}
  }
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(view().route!=='projects'){saveDraftFields();view().route='projects';render();}$('#one-search')?.focus();}
 }
 function onScroll(){clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(!view().panel){view().scroll=window.scrollY;persistUI();}},200);}
 function onResize(){setNavigation(document.body.dataset.navOpen==='true'&&window.innerWidth<1024);}
 function beforeUnload(event){saveDraftFields();const kept=work.saveDraft()&&resources?.saveDraft()!==false;if((!persistUI()&&drafts[prefs.workspaceId])||!kept){event.preventDefault();event.returnValue='';}}
 document.addEventListener('click',onClick);document.addEventListener('input',onInput);document.addEventListener('change',onChange);
 function onSubmit(event){if(resources.handleSubmit(event))return;if(event.target.id==='one-project-form')saveProject(event);else if(event.target.id==='one-work-form'){event.preventDefault();work.handleAction('work-save',event.target);}}
 document.addEventListener('submit',onSubmit);document.addEventListener('keydown',onKey);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('beforeunload',beforeUnload);window.addEventListener('resize',onResize);
 window.addEventListener('hashchange',onHash);render();onHash();
 return {store,work,access,openRecord,updateScope,get resources(){return resources;},render,destroy(){destroyed=true;stageTips.destroy();clearTimeout(scrollTimer);optical?.destroy();resourceMaterials?.destroy();work.destroy();resources?.destroy();setNavigation(false);ui.destroy();document.removeEventListener('click',onClick);document.removeEventListener('input',onInput);document.removeEventListener('change',onChange);document.removeEventListener('submit',onSubmit);document.removeEventListener('keydown',onKey);window.removeEventListener('scroll',onScroll);window.removeEventListener('beforeunload',beforeUnload);window.removeEventListener('resize',onResize);window.removeEventListener('hashchange',onHash);}};
}

if(typeof document!=='undefined'&&document.querySelector('#one-content'))mountPreview();
