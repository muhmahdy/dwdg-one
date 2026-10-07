import {DIVISIONS, STATUSES, iso, day, addDays, diffDays, progress, applyTask, shiftTask, taskError} from './model.mjs';
import {createExperienceStore, RECORD_SCHEMAS, emptyExtras, allSearchRecords, reminderItems} from './experience-data.mjs';
import {createOverlays, icon, escapeHtml, dissolve, completionSeries, renderActivityChart} from './experience-ui.mjs';
import {DIVISION_VIEWS, DIVISION_SCHEMAS, EXTRA_SCHEMAS, GROUP_FOR, STAGE_TRANSLATIONS} from './experience-records.mjs';
import {PRIMARY_PAGES, STATUS_LABELS, ERROR_TRANSLATIONS, createTranslator, formatLocalDate, recordValueLabel, searchTypeLabel, translateError} from './experience-i18n.mjs';
import {renderDivision} from './experience-divisions.mjs';
import {renderDocuments,renderOrganization,renderSettings,renderUpdates} from './experience-secondary.mjs';
import {createEditors} from './experience-editors.mjs';
import {renderTimeline} from './experience-timeline.mjs';

const store=createExperienceStore();
const h=escapeHtml, today=()=>iso();
const t=createTranslator(()=>store.extension.preferences.language);
const formatDate=(date,options)=>formatLocalDate(date,store.extension.preferences.language,options);
const ui=createOverlays({t});
const initial={selectedDate:today(),weekStart:addDays(today(),-6),taskView:'list',taskScope:'mine',taskFilter:'open',taskQuery:'',taskProject:'all',projectView:'list',projectQuery:'',projectDivision:'all',projectTab:'overview',divisionTabs:{},divisionFilters:{},documentQuery:'',documentProject:'all',documentDivision:'all',documentKind:'all',orgDivision:'all',orgOwner:'all',updatesFilter:'all',scheduleMonth:today().slice(0,7),scheduleView:'week'};
let savedUI={};try{savedUI=JSON.parse(sessionStorage.getItem('dwdg-experience-view')||'{}');}catch{}
if(savedUI.visualRevision!==2){savedUI.scheduleView='timeline';savedUI.projectView='list';savedUI.visualRevision=2;}
const state={...initial,...savedUI,selectedTaskIds:new Set(),route:location.hash.slice(1)||'home'};
let mutationRunning=false,pendingRender=false,lastRoute='',searchQuery='',dragTask='',observer;
const scrollPositions=new Map();
const statusLabel=status=>t(...(STATUS_LABELS[status]||[status,status]));
const member=id=>store.core.members.find(item=>item.id===id);
const project=id=>store.core.projects.find(item=>item.id===id);
const avatar=(id,large=false)=>`<span class="avatar${large?' large':''}" title="${h(member(id)?.name||t('Unassigned','Belum ditugaskan'))}">${h(member(id)?.initials||member(id)?.name?.split(' ').map(x=>x[0]).slice(0,2).join('')||'·')}</span>`;
const button=(label,action,iconName,extra='')=>`<button class="button" data-action="${h(action)}" ${extra}>${iconName?icon(iconName):''}<span>${label}</span></button>`;
function notify(message){ui.toast(message,{undo:store.canUndo?()=>{try{store.undo();notify(t('Change undone','Perubahan dibatalkan'));}catch(error){showError(error);}}:undefined});}
function showError(error){ui.toast(translateError(error,t),{tone:'error'});}
const ctx={store,t,icon,escapeHtml:h,state,formatDate,avatar,button,ui,notify,navigate};
const editors=createEditors(ctx);

function preferences(){const p=store.extension.preferences;document.documentElement.lang=p.language;document.documentElement.setAttribute('translate','no');document.documentElement.classList.add('notranslate');document.documentElement.dataset.theme=p.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p.theme;document.documentElement.dataset.motion=p.motion;document.documentElement.dataset.transparency=p.transparency==='solid'?'reduced':p.transparency;document.querySelector('meta[name=theme-color]').content=getComputedStyle(document.documentElement).getPropertyValue('--canvas');}
function persistUI(){try{sessionStorage.setItem('dwdg-experience-view',JSON.stringify({...state,selectedTaskIds:[]}));}catch{}}
function routeInfo(){let [page,id]=state.route.split('/');if(page==='project')return{page,id,title:project(id)?.name||t('Project','Proyek')};if(page==='division'){const view=DIVISION_VIEWS.find(v=>v.slug===id);return{page,id,title:view?t(view.name,view.id):t('Divisions','Divisi')};}const item=PRIMARY_PAGES.find(p=>p[0]===page)||PRIMARY_PAGES[0];return{page:item[0],title:t(item[1],item[2])};}
function shell(){
 const r=routeInfo(),expanded=state.divisionsOpen!==false;
 document.querySelector('.sidebar').setAttribute('aria-label',t('DWDG workspace','Ruang kerja DWDG'));
 document.querySelector('.brand').setAttribute('aria-label',t('DWDG home','Beranda DWDG'));
 document.querySelector('#navigation').setAttribute('aria-label',t('Workspace pages','Halaman ruang kerja'));
 document.querySelector('#mobile-dock').setAttribute('aria-label',t('Mobile navigation','Navigasi seluler'));
 document.querySelector('#navigation').innerHTML=`<div class="nav-section">${PRIMARY_PAGES.filter(p=>p[0]!=='settings').map(([key,en,id,ic])=>`<a class="nav-item ${r.page===key||(key==='projects'&&r.page==='project')?'active':''}" href="#${key}" title="${t(en,id)}" ${r.page===key?'aria-current="page"':''}>${icon(ic)}<span>${t(en,id)}</span>${key==='tasks'?`<span class="count">${store.core.tasks.filter(x=>x.assignee===store.core.profile.memberId&&x.status!=='done').length}</span>`:''}</a>`).join('')}</div><div class="nav-section division-navigation"><button class="division-toggle" data-action="toggle-divisions" aria-label="${t('Divisions','Divisi')}" aria-expanded="${expanded}" aria-controls="division-links"><span>${t('Divisions','Divisi')}</span>${icon(expanded?'chevron-down':'chevron-right')}</button><div id="division-links" ${expanded?'':'hidden'}>${DIVISION_VIEWS.map(v=>`<a href="#division/${v.slug}" title="${h(t(v.name,v.id))}" class="nav-item ${r.id===v.slug?'active':''}">${icon(v.icon)}<span>${h(t(v.name,v.id))}</span></a>`).join('')}</div></div>`;
 document.querySelector('#workspace-subtitle').textContent=t('Workspace','Ruang kerja');
 document.querySelector('#profile-control').setAttribute('aria-label',t('Profile and preferences','Profil dan preferensi'));
 document.querySelector('#profile-control').innerHTML=`${avatar(store.core.profile.memberId,true)}<div><strong>${h(store.core.profile.name)}</strong><small>${t('Preferences','Preferensi')}</small></div>${icon('settings')}`;
 document.querySelector('#crumb').textContent=r.title;
 document.querySelector('#top-controls').innerHTML=`<button class="search-trigger" data-action="global-search" aria-label="${t('Search workspace','Cari di ruang kerja')}">${icon('search')}<span>${t('Search','Cari')}</span><kbd>Ctrl K</kbd></button><button class="icon-button language-trigger" data-action="language-menu" aria-label="${t('Interface language','Bahasa antarmuka')}" title="${t('Interface language','Bahasa antarmuka')}"><span style="font-size:11px;font-weight:700;letter-spacing:0.5px">${(store.extension.preferences.language||'en').toUpperCase()}</span></button><button class="icon-button" data-action="theme-menu" aria-label="${t('Appearance','Tampilan')}">${icon(document.documentElement.dataset.theme==='dark'?'moon':'sun')}</button><button class="icon-button notification-trigger" data-action="notifications" aria-label="${t('Reminders','Pengingat')}">${icon('bell')}${reminderItems(store).length?'<i aria-hidden="true"></i>':''}</button>`;
 document.querySelector('#mobile-dock').innerHTML=[['home','Home','Beranda','home'],['tasks','Tasks','Tugas','tasks'],['projects','Projects','Proyek','projects']].map(([key,en,id,ic])=>`<a href="#${key}" class="${r.page===key?'active':''}" aria-label="${t(en,id)}">${icon(ic)}<span>${t(en,id)}</span></a>`).join('')+`<button data-action="navigation" aria-label="${t('More pages','Halaman lainnya')}">${icon('menu')}<span>${t('More','Lainnya')}</span></button>`;
 document.title=`${r.title} · DWDG UII`;
}
/** Keyed updates keep the shell, unchanged rows, focus, chart selection, and scroll intact. */
function patchElement(current,next){
 if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){const replacement=next.cloneNode(true);current.replaceWith(replacement);return replacement;}
 if(current.nodeType===Node.TEXT_NODE){if(current.data!==next.data)current.data=next.data;return;}
 if(current.nodeType!==Node.ELEMENT_NODE)return;
 const focused=current===document.activeElement;
 for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name)&&!(current.tagName==='DETAILS'&&attr.name==='open'))current.removeAttribute(attr.name);
 for(const attr of [...next.attributes])if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 if(current instanceof HTMLInputElement){if(!focused&&current.value!==next.value)current.value=next.value;current.checked=next.checked;}
 const keyed=new Map([...current.children].filter(x=>x.dataset.key||x.id).map(x=>[x.dataset.key||x.id,x]));
 let cursor=current.firstChild;
 for(const child of [...next.childNodes]){const key=child.nodeType===1&&(child.dataset.key||child.id);let existing=key?keyed.get(key):cursor;
  if(existing&&((key&&existing===current)||(!key&&existing.nodeType===1&&(existing.dataset.key||existing.id))))existing=null;
  if(!existing){current.insertBefore(child.cloneNode(true),cursor);}
  else {if(existing!==cursor)current.insertBefore(existing,cursor);const live=patchElement(existing,child)||existing;cursor=live.nextSibling;}
 }
 while(cursor){const after=cursor.nextSibling;cursor.remove();cursor=after;}
 if(current instanceof HTMLSelectElement&&!focused)current.value=next.value;
}
function render(){if(mutationRunning){pendingRender=true;return;}preferences();const r=routeInfo(),root=document.querySelector('#page');
 const renderers={home:renderHome,tasks:renderTasks,projects:renderProjects,project:()=>renderProject(r.id),schedule:renderSchedule,documents:()=>renderDocuments(ctx),organization:()=>renderOrganization(ctx),settings:()=>renderSettings(ctx),updates:()=>renderUpdates(ctx),division:()=>renderDivision({...ctx,renderRecordList},r.id)};
 const html=(store.issues.length?`<div class="notice" role="alert">${icon('warning')}<div><strong>${t('Some saved data needs attention','Sebagian data tersimpan perlu diperiksa')}</strong><p>${h(store.issues.map(x=>translateError(x,t)).join(' '))}</p>${button(t('Export preserved data','Ekspor data yang dipertahankan'),'export-workspace','download')}</div></div>`:'')+(renderers[r.page]||renderHome)()+`<footer class="page-footer"><span><span class="local-label"></span>${t('Saved on this device','Tersimpan di perangkat ini')}${store.extension.sample?' · '+t('Illustrative starting records','Catatan awal ilustratif'):''}</span><span>DWDG UII <span aria-hidden="true">/</span> ${new Date().getFullYear()}</span></footer>`;
 if(lastRoute!==state.route){root.innerHTML=html;root.classList.remove('ui-route-enter');void root.offsetWidth;root.classList.add('ui-route-enter');shell();lastRoute=state.route;window.scrollTo(0,scrollPositions.get(state.route)||0);}
 else {const next=root.cloneNode(false);next.innerHTML=html;patchElement(root,next);}
 document.querySelector('#crumb').textContent=r.title;setupSticky();persistUI();renderBulk();
}
function setupSticky(){updateSticky();}
function updateSticky(){const sentinel=document.querySelector('.sticky-sentinel'),strip=document.querySelector('.date-strip');if(!sentinel||!strip)return;const top=sentinel.getBoundingClientRect().top;if(top<=-8)strip.classList.add('is-stuck');else if(top>=32)strip.classList.remove('is-stuck');}
let stickyFrame=0;window.addEventListener('scroll',()=>{if(!stickyFrame)stickyFrame=requestAnimationFrame(()=>{stickyFrame=0;updateSticky();});},{passive:true});
async function navigate(hash){const target=hash.replace(/^#/,'');if(ui.isOpen()&&!await ui.close(false,{waitForExit:false}))return;scrollPositions.set(state.route,window.scrollY);if(location.hash.slice(1)===target){state.route=target;render();}else location.hash=target;}
window.addEventListener('hashchange',async()=>{const target=location.hash.slice(1)||'home';if(target===state.route)return;if(ui.isOpen()&&!await ui.close(false,{waitForExit:false})){history.replaceState(null,'','#'+state.route);return;}scrollPositions.set(state.route,window.scrollY);state.route=target;state.selectedTaskIds.clear();render();});
function heading(eyebrow,title,description,action=''){
 return `<header class="page-header"><div><h1>${h(title)}</h1>${description?`<p class="page-description">${description}</p>`:''}</div>${action?`<div class="actions">${action}</div>`:''}</header>`;
}
const empty=(title,description,action='')=>`<div class="empty-state"><div class="empty-art">${icon('check')}</div><h3>${title}</h3><p>${description}</p>${action}</div>`;
function dueLabel(date){const d=diffDays(date,today());if(d===0)return t('Today','Hari ini');if(d===1)return t('Tomorrow','Besok');if(d===-1)return t('Yesterday','Kemarin');return formatDate(date);}
function statusChip(task,interactive=true){return`<${interactive?'button':'span'} class="status ${task.status}" ${interactive?`data-action="task-status" data-id="${h(task.id)}" aria-label="${t('Change status','Ubah status')}: ${h(task.title)}"`:''}><i></i>${statusLabel(task.status)}${interactive?icon('chevron-down'):''}</${interactive?'button':'span'}>`;}
function taskRow(task,{select=false,showProject=true}={}){const p=project(task.projectId);return`<div class="task-row" data-key="task-${h(task.id)}" data-task-row="${h(task.id)}"><span class="task-accent-bar palette-${(p?.color||0)%4} ${task.status==='done'?'is-done':''}" aria-hidden="true"></span>${select?`<input type="checkbox" class="row-select" data-action="select-task" data-id="${h(task.id)}" aria-label="${t('Select','Pilih')} ${h(task.title)}" ${state.selectedTaskIds.has(task.id)?'checked':''}>`:''}<button class="task-check ${task.status==='done'?'done':''}" data-action="complete-task" data-id="${h(task.id)}" aria-label="${task.status==='done'?t('Reopen','Buka kembali'):t('Complete','Selesaikan')} ${h(task.title)}">${task.status==='done'?icon('check'):''}</button><div class="task-main"><button class="task-title" data-action="task" data-id="${h(task.id)}">${h(task.title)}</button><div class="task-meta">${showProject?`<a href="#project/${h(p?.id||'')}" class="project-tag palette-${(p?.color||0)%4}">${h(p?.name||'')}</a>`:''}${task.dependsOn?`<span title="${t('Has a prerequisite','Memiliki prasyarat')}">${icon('link')}</span>`:''}${task.evidence?icon('file'):''}</div></div><button class="owner-button" data-action="task-owner" data-id="${h(task.id)}" aria-label="${t('Assign task','Tugaskan')}">${avatar(task.assignee)}</button>${statusChip(task)}<button class="due ${task.end<today()&&task.status!=='done'?'late':''}" data-action="task-date" data-id="${h(task.id)}" aria-label="${t('Change due date','Ubah tenggat')}: ${h(task.title)}">${icon('clock')}${dueLabel(task.end)}</button><button class="icon-button row-overflow" data-action="task-menu" data-id="${h(task.id)}" aria-label="${t('Task options','Opsi tugas')}">${icon('more')}</button></div>`;}
function track(p){const n=progress(store.core,p.id),blocked=(store.extras.byProject[p.id]?.blockers||[]).filter(b=>!b.resolved_at).length;return`<div class="project-track" data-key="track-${h(p.id)}"><div class="track-head"><a href="#project/${h(p.id)}"><span class="project-symbol palette-${p.color%4}">${icon('projects')}</span><strong>${h(p.name)}</strong></a>${blocked?`<button class="status blocked" data-action="project-blockers" data-id="${h(p.id)}">${blocked} ${t('blockers','hambatan')}</button>`:''}</div><div class="track-meta"><span>${n.total?`${n.done} / ${n.total} ${t('tasks completed','tugas selesai')}`:t('No tasks yet','Belum ada tugas')}</span><span>${n.total?`${n.percent}%`:'—'}</span></div><div class="progress-track"><span style="width:${n.percent}%"></span></div></div>`;}
function dateStrip(){return`<div class="sticky-sentinel" aria-hidden="true"></div><div class="sticky-date-host"><div class="date-strip" data-key="date-strip"><button class="date-nav icon-button" data-action="week-back" aria-label="${t('Previous week','Pekan sebelumnya')}">${icon('left')}</button>${Array.from({length:7},(_,i)=>{const date=addDays(state.weekStart,i);return`<button class="${state.selectedDate===date?'active':''}" data-action="select-date" data-date="${date}" aria-pressed="${state.selectedDate===date}" aria-label="${formatDate(date,{weekday:'long',day:'numeric',month:'long'})}"><small>${formatDate(date,{weekday:'short'})}</small><strong>${day(date).getDate()}</strong>${date===today()?'<i></i>':''}</button>`;}).join('')}<button class="date-nav icon-button" data-action="week-next" aria-label="${t('Next week','Pekan berikutnya')}">${icon('right')}</button></div></div>`;}
function activity(tasks,days=7,variant='bars'){
 const start=days===7?state.weekStart:addDays(today(),-27),series=completionSeries(tasks,{start,days,today:today(),recordedSince:store.extension.recordedSince}),total=series.entries.reduce((sum,d)=>sum+d.count,0);
 return `<div class="rhythm-head"><div><h2>${t('Completion activity','Aktivitas penyelesaian')}</h2><p class="meta">${formatDate(start)} — ${formatDate(addDays(start,days-1))}</p></div><div class="activity-total"><strong>${total}</strong><span>${t('completed','selesai')}</span></div><button class="icon-button" data-action="chart-info" aria-label="${t('How this chart is calculated','Cara menghitung grafik ini')}">${icon('info')}</button></div>${renderActivityChart({series,selectedDate:state.selectedDate,locale:store.extension.preferences.language,variant})}`;
}
function completedList(tasks){const records=tasks.filter(x=>x.status==='done'&&String(x.completedAt||'').slice(0,10)===state.selectedDate);return`<div class="panel-head"><div><h2>${formatDate(state.selectedDate,{weekday:'long',day:'numeric',month:'short'})}</h2><p class="meta">${records.length} ${t('completed tasks','tugas selesai')}</p></div><span class="status done">${icon('check')}${t('Recorded','Tercatat')}</span></div>${records.length?records.map(x=>taskRow(x)).join(''):empty(t('No completions recorded','Belum ada penyelesaian tercatat'),state.selectedDate<store.extension.recordedSince?t('This date is before the recorded interval.','Tanggal ini sebelum interval pencatatan.'):t('Completed tasks for this date will appear here.','Tugas yang selesai pada tanggal ini akan muncul di sini.'))}`;}
function agenda(date,compact=false){const events=store.core.events.filter(e=>e.date===date).sort((a,b)=>a.time.localeCompare(b.time));const tasks=store.core.tasks.filter(x=>x.end===date&&x.status!=='done');const milestones=Object.entries(store.extras.byProject).flatMap(([pid,e])=>e.milestones.filter(x=>x.due_date===date).map(x=>({...x,projectId:pid})));const followups=store.extension.followups.filter(x=>x.dueDate===date&&x.status!=='done');
 const allday=[...tasks.map(x=>({title:x.title,action:'task',id:x.id})),...milestones.map(x=>({title:x.title,action:'record',id:x.id,collection:'milestones',source:'extras',project:x.projectId})),...followups.map(x=>({title:x.title,action:'record',id:x.id,collection:'followups',source:'extension'}))];
 return`${allday.length?`<div class="list-group-label">${t('All day','Sepanjang hari')}</div>${allday.map(x=>`<button class="agenda-item" data-action="${x.action}" data-id="${h(x.id)}" ${x.collection?`data-collection="${x.collection}" data-source="${x.source}" data-project="${h(x.project||'')}"`:''}><span class="agenda-time">${icon('flag')}</span><div><strong>${h(x.title)}</strong><small>${t('Deadline / checkpoint','Tenggat / titik tinjauan')}</small></div>${icon('chevron-right')}</button>`).join('')}`:''}${events.length?`<div class="list-group-label">${t('Meetings','Rapat')}</div>${compact?events.map(e=>eventRow(e)).join(''):timedAgenda(events)}`:''}${!allday.length&&!events.length?empty(t('No plans for this day','Tidak ada jadwal hari ini'),t('No deadlines or meetings on this day.','Tidak ada tenggat atau rapat pada hari ini.'),button(t('Schedule a meeting','Jadwalkan rapat'),'new-event','plus')):''}`;}
function eventRow(e){return`<button class="agenda-item" data-action="event" data-id="${h(e.id)}"><span class="agenda-time">${h(e.time)}</span><div><strong>${h(e.title)}</strong><small>${e.duration} ${t('min','menit')} · ${h(e.location||t('Location to confirm','Lokasi belum ditentukan'))}</small></div>${icon('chevron-right')}</button>`;}
function timedAgenda(events){const toMinute=value=>{const [a,b]=value.split(':').map(Number);return a*60+b;},min=Math.floor(Math.min(...events.map(e=>toMinute(e.time)))/60)*60,max=Math.ceil(Math.max(...events.map(e=>toMinute(e.time)+e.duration))/60)*60,span=Math.max(max-min,60);return`<div class="timed-agenda" style="--hours:${span/60}"><div class="time-axis">${Array.from({length:span/60+1},(_,i)=>`<span style="top:${i*60/span*100}%">${String((min/60+i)%24).padStart(2,'0')}:00</span>`).join('')}</div><div class="time-lanes" style="grid-template-columns:repeat(${events.length},minmax(0,1fr))">${events.map(e=>`<div class="time-lane"><button class="timed-meeting" style="top:${(toMinute(e.time)-min)/span*100}%;height:${e.duration/span*100}%" data-action="event" data-id="${h(e.id)}"><strong>${h(e.title)}</strong><small>${e.time} · ${e.duration} ${t('min','menit')}</small></button></div>`).join('')}</div></div>`;}
function renderHome(){
 const mine=store.core.tasks.filter(x=>x.assignee===store.core.profile.memberId&&x.status!=='done').sort((a,b)=>a.end.localeCompare(b.end)),due=mine.filter(x=>x.end<=today());
 return heading('',t('Home','Beranda'),`${formatDate(today(),{weekday:'long',day:'numeric',month:'long'})} <span class="heading-dot">·</span> ${due.length} ${t('tasks due','tugas jatuh tempo')}`,`<button class="button primary" data-action="new-task">${icon('plus')}${t('New task','Tugas baru')}</button>`)+`<div class="home-grid"><section class="panel home-work"><div class="rhythm">${activity(store.core.tasks)}</div>${dateStrip()}${state.showCompleted?`<section class="selected-completions" id="selected-completions">${completedList(store.core.tasks)}</section>`:''}<div class="panel-head"><h2>${t('My tasks','Tugas saya')} <span class="heading-count">${mine.length}</span></h2><a class="mini-link" href="#tasks">${t('View all','Lihat semua')}${icon('arrow')}</a></div>${mine.length?mine.slice(0,6).map(x=>taskRow(x)).join(''):empty(t('No open tasks','Tidak ada tugas terbuka'),t('Your assigned work will appear here.','Tugas yang ditugaskan kepada Anda akan tampil di sini.'),button(t('New task','Tugas baru'),'new-task','plus'))}</section><aside class="stack"><section class="panel"><div class="panel-head"><h2>${t('Today','Hari ini')}</h2><span class="meta">${formatDate(today(),{day:'numeric',month:'short'})}</span></div>${agenda(today(),true)}<div class="panel-foot"><a class="mini-link" href="#schedule">${t('Open schedule','Buka jadwal')}${icon('arrow')}</a></div></section><section class="panel"><div class="panel-head"><h2>${t('Project progress','Progres proyek')}</h2><a class="icon-button" href="#projects" aria-label="${t('All projects','Semua proyek')}">${icon('arrow')}</a></div>${store.core.projects.slice(0,3).map(track).join('')}</section></aside></div>`;
}
function filteredTasks(projectId){let rows=store.core.tasks.filter(x=>!projectId||x.projectId===projectId);if(!projectId&&state.taskScope==='mine')rows=rows.filter(x=>x.assignee===store.core.profile.memberId);if(!projectId&&state.taskProject!=='all')rows=rows.filter(x=>x.projectId===state.taskProject);if(state.taskFilter==='open')rows=rows.filter(x=>x.status!=='done');else if(state.taskFilter!=='all')rows=rows.filter(x=>x.status===state.taskFilter);const q=state.taskQuery.toLowerCase();return rows.filter(x=>`${x.title} ${project(x.projectId)?.name||''} ${member(x.assignee)?.name||''}`.toLowerCase().includes(q)).sort((a,b)=>a.end.localeCompare(b.end));}
function taskToolbar(projectId){return`<div class="filter-bar"><div class="segmented" aria-label="${t('Task view','Tampilan tugas')}">${[['list','list','List','Daftar'],['board','board','Board','Papan'],['timeline','gantt','Timeline','Linimasa']].map(([key,ic,en,id])=>`<button class="${state.taskView===key?'active':''}" data-action="task-view" data-value="${key}">${icon(ic)}<span>${t(en,id)}</span></button>`).join('')}</div><div class="spacer"></div><label class="filter-search">${icon('search')}<input id="task-search" placeholder="${t('Find a task','Cari tugas')}" value="${h(state.taskQuery)}" aria-label="${t('Search tasks','Cari tugas')}"></label><button class="filter-button" data-action="task-filters">${icon('filter')}${t('Filter','Filter')}<span>${state.taskFilter==='all'?t('All','Semua'):state.taskFilter==='open'?t('Open','Terbuka'):statusLabel(state.taskFilter)}</span></button>${button(t('Export','Ekspor'),'export-report','download',projectId?`data-project="${h(projectId)}"`:'')}</div>`;}
function taskGroups(tasks){if(!tasks.length)return empty(t('Nothing in this view yet','Belum ada tugas di tampilan ini'),t('Try another filter or add a task to get started.','Coba filter lain atau tambahkan tugas untuk memulai.'),button(t('Create task','Buat tugas'),'new-task','plus'));const groups=[[t('Overdue','Terlewat'),x=>x.end<today()&&x.status!=='done'],[t('Today','Hari ini'),x=>x.end===today()&&x.status!=='done'],[t('Upcoming','Mendatang'),x=>x.end>today()&&x.status!=='done'],[t('Completed','Selesai'),x=>x.status==='done']];return groups.map(([label,test])=>{const items=tasks.filter(test);return items.length?`<div class="list-group-label">${label}<span>${items.length}</span></div>${items.map(x=>taskRow(x,{select:true})).join('')}`:'';}).join('');}
function taskBoard(tasks){return`<div class="board">${Object.keys(STATUSES).map(status=>{const items=tasks.filter(x=>x.status===status);return`<section class="board-column" data-drop-status="${status}"><div class="board-heading"><span class="status ${status}"><i></i>${statusLabel(status)}</span><span>${items.length}</span></div>${items.map(x=>`<article class="board-card" data-key="board-${h(x.id)}" draggable="true" data-drag-task="${h(x.id)}"><p class="meta">${h(project(x.projectId)?.name||'')}</p><button class="task-title" data-action="task" data-id="${h(x.id)}">${h(x.title)}</button><div class="track-meta"><button class="due" data-action="task-date" data-id="${h(x.id)}">${icon('clock')}${dueLabel(x.end)}</button>${avatar(x.assignee)}</div>${statusChip(x)}</article>`).join('')}${!items.length?`<p class="board-empty">${t('Move work here','Pindahkan tugas ke sini')}</p>`:''}</section>`;}).join('')}</div>`;}
function taskTimeline(tasks,projectId){return renderTimeline(ctx,tasks,{selectedDate:state.selectedDate,projectId});}
function renderTasks(){const tasks=filteredTasks();return heading(t('PERSONAL WORK','PEKERJAAN PRIBADI'),t('My tasks','Tugas saya'),`${tasks.length} ${t('tasks in this view','tugas di tampilan ini')}`,`<button class="button primary" data-action="new-task">${icon('plus')}${t('New task','Tugas baru')}</button>`)+`<div class="tabstrip"><button class="${state.taskScope==='mine'?'active':''}" data-action="task-scope" data-value="mine">${t('Assigned to me','Ditugaskan kepada saya')}</button><button class="${state.taskScope==='all'?'active':''}" data-action="task-scope" data-value="all">${t('All workspace tasks','Semua tugas ruang kerja')}</button></div>${taskToolbar()}<div class="${state.taskView==='board'?'':'panel sculpted'}">${state.taskView==='board'?taskBoard(tasks):state.taskView==='timeline'?taskTimeline(tasks):taskGroups(tasks)}</div>`;}

function filteredProjects(){return store.core.projects.filter(p=>(state.projectDivision==='all'||p.division===state.projectDivision)&&p.name.toLowerCase().includes(state.projectQuery.toLowerCase()));}
function projectCard(p){const n=progress(store.core,p.id),owners=[...new Set(store.core.tasks.filter(x=>x.projectId===p.id).map(x=>x.assignee))].slice(0,4);return`<article class="panel project-card" data-key="project-${h(p.id)}"><div class="track-head"><span class="project-symbol palette-${p.color%4}">${icon('projects')}</span><button class="icon-button" data-action="project-menu" data-id="${h(p.id)}" aria-label="${t('Project options','Opsi proyek')}">${icon('more')}</button></div><a href="#project/${h(p.id)}"><p class="meta">${divisionLabel(p.division)}</p><h2>${h(p.name)}</h2><p class="project-description">${h(p.description||t('Add a purpose for this project.','Tambahkan tujuan proyek ini.'))}</p></a><div class="track-meta"><span>${n.total?`${n.done} / ${n.total} ${t('completed','selesai')}`:t('No tasks yet','Belum ada tugas')}</span><span>${n.total?`${n.percent}%`:'—'}</span></div><div class="progress-track"><span style="width:${n.percent}%"></span></div><div class="project-card-foot"><div class="avatar-stack">${owners.map(x=>avatar(x)).join('')||avatar(p.owner)}</div><span class="due">${icon('calendar')}${formatDate(p.end)}</span></div></article>`;}
function divisionLabel(name){const view=DIVISION_VIEWS.find(x=>x.name===name||(name==='Client Engagement'&&x.slug==='external-engagement'));return h(view?t(view.name,view.id):name);}
function projectRow(p){
 const n=progress(store.core,p.id),blockers=(store.extras.byProject[p.id]?.blockers||[]).filter(x=>!x.resolved_at).length;
 return `<article class="project-row" data-key="project-row-${h(p.id)}"><div class="project-name"><a href="#project/${h(p.id)}"><i class="project-color palette-${p.color%4}" aria-hidden="true"></i><span><strong>${h(p.name)}</strong><small>${divisionLabel(p.division)}</small></span></a>${blockers?`<button class="blocker-indicator" data-action="project-blockers" data-id="${h(p.id)}">${icon('warning')}<span>${blockers} ${t('open blocker'+(blockers===1?'':'s'),'hambatan terbuka')}</span></button>`:''}</div><button class="project-owner" data-action="member" data-id="${h(p.owner)}" aria-label="${t('Project lead','Ketua proyek')}: ${h(member(p.owner)?.name||'')}">${avatar(p.owner)}<span>${h(member(p.owner)?.name||'—')}</span></button><div class="project-row-progress"><div><span>${n.total?`${n.done} / ${n.total} ${t('tasks','tugas')}`:t('No tasks yet','Belum ada tugas')}</span><strong>${n.total?n.percent+'%':'—'}</strong></div><div class="progress-track" role="img" aria-label="${n.done} / ${n.total} ${t('tasks complete','tugas selesai')}"><span style="width:${n.percent}%"></span></div></div><span class="project-target">${icon('calendar')}${formatDate(p.end)}</span><button class="icon-button" data-action="project-menu" data-id="${h(p.id)}" aria-label="${t('Project options','Opsi proyek')}: ${h(p.name)}">${icon('more')}</button></article>`;
}
function renderProjects(){
 const projects=filteredProjects(),ids=new Set(projects.map(x=>x.id)),tasks=store.core.tasks.filter(x=>ids.has(x.projectId)),blockers=Object.entries(store.extras.byProject).filter(([id])=>ids.has(id)).flatMap(([projectId,p])=>p.blockers.filter(x=>!x.resolved_at).map(x=>({...x,projectId})));
 const summary=`<section class="panel portfolio-summary"><div class="portfolio-chart">${activity(tasks,28,'cells')}</div><div class="portfolio-blockers"><div class="summary-heading"><h2>${t('Open blockers','Hambatan terbuka')}</h2><span class="heading-count">${blockers.length}</span></div><div class="horizontal-chart">${[['high','High','Tinggi'],['medium','Medium','Sedang'],['low','Low','Rendah']].map(([s,en,id])=>{const count=blockers.filter(b=>b.severity===s).length;return `<button class="hbar-row severity-${s}" data-action="portfolio-blockers" data-value="${s}" aria-label="${t(en,id)}: ${count} ${t('blockers','hambatan')}"><span>${t(en,id)}</span><span class="hbar-track"><i style="width:${count/Math.max(1,blockers.length)*100}%"></i></span><strong>${count}</strong></button>`;}).join('')}</div><p class="meta">${t('Select a severity to review the work.','Pilih tingkat untuk melihat pekerjaan.')}</p></div></section>`;
 const toolbar=`<div class="filter-bar portfolio-toolbar"><div class="segmented" aria-label="${t('Project view','Tampilan proyek')}">${[['list','list','List','Daftar'],['grid','projects','Grid','Kartu'],['timeline','gantt','Timeline','Linimasa']].map(([key,ic,en,id])=>`<button data-action="project-view" data-value="${key}" aria-pressed="${state.projectView===key}" class="${state.projectView===key?'active':''}">${icon(ic)}<span>${t(en,id)}</span></button>`).join('')}</div><div class="spacer"></div><label class="filter-search">${icon('search')}<input id="project-search" placeholder="${t('Find a project','Cari proyek')}" aria-label="${t('Find a project','Cari proyek')}" value="${h(state.projectQuery)}"></label><button class="filter-button" data-action="project-filter">${icon('filter')}<span>${state.projectDivision==='all'?t('All divisions','Semua divisi'):divisionLabel(state.projectDivision)}</span>${icon('chevron-down')}</button></div>`;
 const list=`<section class="panel project-register"><div class="project-register-head" aria-hidden="true"><span>${t('Project','Proyek')}</span><span>${t('Lead','Ketua')}</span><span>${t('Task progress','Progres tugas')}</span><span>${t('Target','Target')}</span><span></span></div>${projects.map(projectRow).join('')}</section>`;
 return heading('',t('Projects','Proyek'),`${projects.length} ${t('projects','proyek')} · ${tasks.filter(x=>x.status!=='done').length} ${t('open tasks','tugas terbuka')}`,`<button class="button primary" data-action="new-project">${icon('plus')}${t('New project','Proyek baru')}</button>`)+summary+toolbar+(!projects.length?`<section class="panel">${empty(t('No projects in this view','Tidak ada proyek di tampilan ini'),t('Change the filter or create a project.','Ubah filter atau buat proyek.'),button(t('New project','Proyek baru'),'new-project','plus'))}</section>`:state.projectView==='grid'?`<div class="projects-grid">${projects.map(projectCard).join('')}</div>`:state.projectView==='timeline'?`<div class="panel">${taskTimeline(tasks)}</div>`:list)+(state.portfolioSelected?`<section class="panel section-space">${completedList(tasks)}</section>`:'');
}
function renderRecordList(collection,records,source='division',projectId){const f=state.divisionFilters[collection];if(f&&source!=='extras')records=records.filter(x=>f.field==='financeMeasure'?x.type==='expense'&&(f.value==='paid'?x.stageId==='paid':x.stageId==='approved'):String(x[f.field]||'')===f.value);return`${f&&source!=='extras'?`<div class="filter-bar"><span class="meta">${t('Filtered selection','Pilihan terfilter')}: ${h(f.field==='financeMeasure'?t(f.value==='paid'?'Paid expenses':'Approved expenses',f.value==='paid'?'Pengeluaran dibayar':'Pengeluaran disetujui'):recordValueLabel(collection,f.field,f.value,t,source))}</span>${button(t('Clear','Hapus'),'clear-record-filter','close',`data-collection="${collection}"`)}</div>`:''}${records.length?`<div class="collection-list">${records.map(x=>{const title=x.title||x.decision||project(x.depends_on_id)?.name||t('Untitled','Tanpa judul'),ownerId=x.ownerId||x.owner_id||x.memberId||x.requesterId||x.leadId,date=x.dueDate||x.due_date||x.publishDate||x.target_resolution_date||x.date,stage=store.divisions.stages?.[GROUP_FOR[collection]]?.find?.(s=>s.id===x.stageId);return`<button class="record-row" data-key="${collection}-${h(x.id||x.depends_on_id)}" data-action="record" data-collection="${collection}" data-source="${source}" data-id="${h(x.id||x.depends_on_id)}" data-project="${h(projectId||x.projectId||x.project_id||'')}"><span class="record-icon">${icon(collection==='documents'?'file':collection==='blockers'?'warning':collection==='milestones'?'flag':'projects')}</span><span class="record-body"><strong>${h(title)}</strong><small>${h(project(x.projectId||x.project_id)?.name||x.notes?.slice(0,70)||x.description?.slice(0,70)||'')}</small></span>${ownerId?avatar(ownerId):''}<span class="status ${x.resolved_at?'done':collection==='blockers'?'blocked':''}">${h(recordValueLabel(collection,stage?'stageId':x.stage?'stage':x.status?'status':'severity',stage?stage.label:x.stage||x.status||x.severity||'',t,source))}</span>${date?`<span class="due">${formatDate(date)}</span>`:''}${icon('chevron-right')}</button>`;}).join('')}</div>`:empty(t('No records in this view','Belum ada catatan di tampilan ini'),t('Add the first record or choose another filter.','Tambahkan catatan pertama atau pilih filter lain.'),button(t('Add record','Tambah catatan'),'new-record','plus',`data-collection="${collection}" data-source="${source}" data-project="${h(projectId||'')}"`))}`;}
function renderProject(id){
 const p=project(id);if(!p)return heading('',t('Project not found','Proyek tidak ditemukan'),'')+empty(t('This project is unavailable','Proyek ini tidak tersedia'),t('It may have been removed.','Proyek mungkin telah dihapus.'),`<a class="button" href="#projects">${t('Back to projects','Kembali ke proyek')}</a>`);
 const extras=store.extras.byProject[id]||emptyExtras(),n=progress(store.core,id),tabs=[['overview','Overview','Ringkasan'],['tasks','Tasks','Tugas'],['timeline','Timeline','Linimasa'],['documents','Documents','Dokumen'],['decisions','Decisions','Keputusan'],['activity','Activity','Aktivitas']],tab=state.projectTab;
 let content='';
 if(tab==='overview')content=`<section class="panel project-overview"><div class="panel-head"><h2>${t('Delivery progress','Progres penyelesaian')}</h2><span class="meta">${n.total?n.percent+'%':t('No tasks yet','Belum ada tugas')}</span></div><div class="delivery-track"><div class="track-meta"><span>${n.done} / ${n.total} ${t('tasks completed','tugas selesai')}</span><span>${t('Target','Target')} ${formatDate(p.end)}</span></div><div class="progress-track"><span style="width:${n.percent}%"></span></div></div>${['milestones','blockers','dependencies'].map(type=>`<section class="overview-section"><div class="panel-head"><h2>${t(EXTRA_SCHEMAS[type].labels.en,EXTRA_SCHEMAS[type].labels.id)}</h2>${button(t('Add','Tambah'),'new-record','plus',`data-collection="${type}" data-source="extras" data-project="${h(id)}"`)}</div>${renderRecordList(type,extras[type],'extras',id)}</section>`).join('')}</section>`;
 else if(tab==='tasks')content=`${taskToolbar(id)}<section class="${state.taskView==='board'?'':'panel'}">${state.taskView==='board'?taskBoard(filteredTasks(id)):state.taskView==='timeline'?taskTimeline(filteredTasks(id),id):taskGroups(filteredTasks(id))}</section>`;
 else if(tab==='timeline')content=`<section class="panel">${taskTimeline(store.core.tasks.filter(x=>x.projectId===id),id)}</section>`;
 else if(tab==='activity')content=`<section class="panel collection-list">${store.core.activity.filter(x=>x.projectId===id).slice(0,50).map(x=>`<div class="record-row">${icon('activity')}<div class="record-body"><strong>${h(x.text)}</strong><small>${formatDate(x.at,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div></div>`).join('')||empty(t('No activity yet','Belum ada aktivitas'),t('Project changes will appear here.','Perubahan proyek akan muncul di sini.'))}</section>`;
 else content=`<section class="panel"><div class="panel-head"><h2>${tab==='documents'?t('Project documents','Dokumen proyek'):t('Decision log','Catatan keputusan')}</h2>${button(t('Add','Tambah'),tab==='documents'?'new-document':'new-record','plus',`data-collection="${tab}" data-source="extras" data-project="${h(id)}"`)}</div>${renderRecordList(tab,extras[tab]||[],'extras',id)}</section>`;
 return heading('',p.name,divisionLabel(p.division),`${button(t('Edit project','Ubah proyek'),'edit-project','edit',`data-id="${h(id)}"`)}<button class="button primary" data-action="new-task" data-project="${h(id)}">${icon('plus')}${t('Add task','Tambah tugas')}</button>`)+`<div class="split-grid project-detail-layout"><section class="project-workspace"><div class="tabstrip page-tabs">${tabs.map(([key,en,id])=>`<button class="${tab===key?'active':''}" aria-pressed="${tab===key}" data-action="project-tab" data-value="${key}">${t(en,id)}</button>`).join('')}</div>${content}</section><aside class="stack project-context"><section class="panel profile-card"><h2>${t('Project details','Rincian proyek')}</h2><button class="profile-link" data-action="member" data-id="${h(p.owner)}">${avatar(p.owner,true)}<div><strong>${h(member(p.owner)?.name||'')}</strong><small>${t('Project lead','Ketua proyek')}</small></div>${icon('chevron-right')}</button>${p.description?`<p class="context-description">${h(p.description)}</p>`:''}<div class="detail-facts"><div><span>${t('Started','Dimulai')}</span><strong>${formatDate(p.start)}</strong></div><div><span>${t('Target','Target')}</span><strong>${formatDate(p.end)}</strong></div><div><span>${t('Tasks','Tugas')}</span><strong>${n.done} / ${n.total}</strong></div><div><span>${t('Open blockers','Hambatan terbuka')}</span><strong>${extras.blockers.filter(x=>!x.resolved_at).length}</strong></div></div></section><section class="panel"><div class="panel-head"><h2>${t('Upcoming meetings','Rapat mendatang')}</h2><button class="icon-button" data-action="new-event" data-project="${h(id)}" aria-label="${t('Add meeting','Tambah rapat')}">${icon('plus')}</button></div>${store.core.events.filter(x=>x.projectId===id&&x.date>=today()).map(eventRow).join('')||`<p class="panel-inner muted">${t('Nothing scheduled yet.','Belum ada jadwal.')}</p>`}</section></aside></div>`;
}
function formatTime12(timeStr){if(!timeStr)return '';const [hStr,mStr]=timeStr.split(':');let hour=parseInt(hStr,10);const min=mStr||'00',ampm=hour>=12?'PM':'AM';hour=hour%12;hour=hour?hour:12;return `${String(hour).padStart(2,'0')}:${min} ${ampm}`;}
function addMinutes(timeStr,mins){const [hStr,mStr]=timeStr.split(':');let tot=parseInt(hStr,10)*60+parseInt(mStr||'0',10)+mins;tot=((tot%1440)+1440)%1440;return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;}

function weekStartFor(dateStr){
 const d=day(dateStr);
 const dow=(d.getDay()+6)%7;
 return addDays(dateStr,-dow);
}

function renderGoogleCalendarWeek(currentWeekStart){
 const weekDays=Array.from({length:7},(_,i)=>addDays(currentWeekStart,i));
 const now=new Date();
 const nowMin=now.getHours()*60+now.getMinutes();
 const showNow=nowMin>=480&&nowMin<=1200;
 const nowTop=((nowMin-480)/60)*52;

 const headerCells=weekDays.map(d=>{
  const dayObj=day(d);
  const dayNum=dayObj.getDate();
  const dayName=formatDate(d,{weekday:'short'}).toUpperCase();
  const isToday=d===today();
  const isSelected=d===state.selectedDate;
  return `<div class="gcal-week-header-cell ${isToday?'is-today':''} ${isSelected?'is-selected':''}" data-action="select-date" data-date="${d}" aria-label="${formatDate(d,{weekday:'long',day:'numeric',month:'long'})}"><span class="gcal-week-dayname">${h(dayName)}</span><span class="gcal-week-daynum ${isToday?'is-today':''}">${dayNum}</span></div>`;
 }).join('');

 const alldayCells=weekDays.map(d=>{
  const tasks=store.core.tasks.filter(x=>x.end===d);
  const milestones=Object.entries(store.extras.byProject).flatMap(([pid,e])=>e.milestones.filter(x=>x.due_date===d).map(x=>({...x,projectId:pid})));
  const items=[...milestones.map(m=>({type:'checkpoint',id:m.id,title:m.title,action:'record',source:'extras',collection:'milestones',project:m.projectId})),...tasks.map(t=>({type:'task',id:t.id,title:t.title,action:'task'}))];
  return `<div class="gcal-allday-cell" data-action="calendar-date" data-date="${d}">${items.slice(0,2).map(it=>`<button class="gcal-allday-chip ${it.type}" data-action="${it.action}" data-id="${h(it.id)}" ${it.collection?`data-collection="${it.collection}" data-source="${it.source}" data-project="${h(it.project||'')}">`:''}><span>${it.type==='task'?'✓':'◆'}</span><span>${h(it.title)}</span></button>`).join('')}${items.length>2?`<button class="gcal-chip-more" data-action="calendar-date" data-date="${d}">+${items.length-2}</button>`:''}</div>`;
 }).join('');

 const hours=[8,9,10,11,12,13,14,15,16,17,18,19,20];
 const timeLabelsHtml=hours.map((hr,idx)=>`<span class="gcal-time-slot" style="top:${idx*52}px">${hr===12?'12 PM':hr>12?`${hr-12} PM`:`${hr} AM`}</span>`).join('');

 const dayColumnsHtml=weekDays.map(d=>{
  const events=store.core.events.filter(e=>e.date===d).sort((a,b)=>a.time.localeCompare(b.time));
  const isToday=d===today();
  const eventBlocks=events.map(e=>{
   const [hStr,mStr]=e.time.split(':');
   const startMin=parseInt(hStr,10)*60+parseInt(mStr||'0',10);
   const top=Math.max(0,((startMin-480)/60)*52);
   const duration=e.duration||45;
   const height=Math.max(26,(duration/60)*52);
   const p=project(e.projectId);
   const color=(p?.color||0)%4;
   return `<button class="gcal-event-block palette-${color}" style="top:${top}px;height:${height}px" data-action="event" data-id="${h(e.id)}" title="${h(e.title)} (${e.time})"><span class="gcal-event-accent"></span><div class="gcal-event-content"><strong class="gcal-event-title">${h(e.title)}</strong><span class="gcal-event-time">${e.time} · ${duration} ${t('min','menit')}</span>${e.location?`<span class="gcal-event-loc">${h(e.location)}</span>`:''}</div></button>`;
  }).join('');

  return `<div class="gcal-day-column" data-action="calendar-date" data-date="${d}"><div class="gcal-hour-lines" aria-hidden="true">${Array.from({length:12},()=>'<div class="gcal-hour-line"></div>').join('')}</div>${isToday&&showNow?`<div class="gcal-now-line" style="top:${nowTop}px"><span class="gcal-now-dot"></span></div>`:''}${eventBlocks}</div>`;
 }).join('');

 return `<div class="gcal-week-panel"><div class="gcal-week-header"><div class="gcal-week-header-corner" aria-hidden="true">${icon('clock')}</div>${headerCells}</div><div class="gcal-allday-row"><div class="gcal-allday-corner">${t('All day','Sepanjang hari')}</div>${alldayCells}</div><div class="gcal-grid-scroll"><div class="gcal-time-grid"><div class="gcal-time-gutter" aria-hidden="true">${timeLabelsHtml}</div>${dayColumnsHtml}</div></div></div>`;
}

function renderGoogleCalendarMonth(first,gridStart){
 const weekdays=Array.from({length:7},(_,i)=>formatDate(addDays('2026-09-21',i),{weekday:'short'}).toUpperCase());
 const cells=Array.from({length:42},(_,i)=>{
  const date=addDays(gridStart,i);
  const tasks=store.core.tasks.filter(x=>x.end===date);
  const events=store.core.events.filter(x=>x.date===date);
  const milestones=Object.entries(store.extras.byProject).flatMap(([pid,e])=>e.milestones.filter(x=>x.due_date===date).map(x=>({...x,projectId:pid})));
  const followups=store.extension.followups.filter(x=>x.dueDate===date&&x.status!=='done');
  const checkpoints=milestones.length+followups.length;
  const isOutside=date.slice(0,7)!==state.scheduleMonth;
  const isActive=date===state.selectedDate;
  const isToday=date===today();
  const allItems=[
   ...events.map(e=>({kind:'event',id:e.id,time:e.time,title:e.title,action:'event'})),
   ...tasks.map(t=>({kind:'task',id:t.id,title:t.title,action:'task'})),
   ...milestones.map(m=>({kind:'checkpoint',id:m.id,title:m.title,action:'record',collection:'milestones',source:'extras',project:m.projectId}))
  ];

  return `<div class="calendar-cell ${isOutside?'outside':''} ${isActive?'active':''} ${isToday?'today':''}" data-action="calendar-date" data-date="${date}" aria-label="${formatDate(date,{day:'numeric',month:'long'})}: ${tasks.length} ${t('tasks','tugas')}, ${events.length} ${t('meetings','rapat')}, ${checkpoints} ${t('checkpoints','titik tinjauan')}"><div class="calendar-cell-head"><span class="gcal-cell-date ${isToday?'is-today':''}">${day(date).getDate()}</span></div>${allItems.slice(0,3).map(it=>{
   if(it.kind==='event'){
    return `<button class="gcal-chip meeting" data-action="event" data-id="${h(it.id)}" title="${h(it.title)} (${it.time})"><span class="gcal-chip-dot"></span><strong class="gcal-chip-time">${h(it.time)}</strong><span class="gcal-chip-title">${h(it.title)}</span></button>`;
   }else if(it.kind==='task'){
    return `<button class="gcal-chip task" data-action="task" data-id="${h(it.id)}" title="${h(it.title)}"><span class="gcal-chip-icon">✓</span><span class="gcal-chip-title">${h(it.title)}</span></button>`;
   }else{
    return `<button class="gcal-chip checkpoint" data-action="record" data-collection="${it.collection}" data-source="${it.source}" data-project="${h(it.project||'')}" data-id="${h(it.id)}" title="${h(it.title)}"><span class="gcal-chip-icon">◆</span><span class="gcal-chip-title">${h(it.title)}</span></button>`;
   }
  }).join('')}${allItems.length>3?`<button class="gcal-chip-more" data-action="calendar-date" data-date="${date}">+${allItems.length-3} ${t('more','lainnya')}</button>`:''}</div>`;
 }).join('');

 return `<div class="panel sculpted calendar-panel"><div class="calendar-grid">${weekdays.map(w=>`<div class="calendar-weekday">${w}</div>`).join('')}${cells}</div></div>`;
}

function renderSchedule(){
 const [year,month]=state.scheduleMonth.split('-').map(Number),first=`${year}-${String(month).padStart(2,'0')}-01`,gridStart=addDays(first,-((day(first).getDay()+6)%7));
 const activeView=state.scheduleView==='timeline'?'week':(state.scheduleView||'week');
 const currentWeekStart=weekStartFor(state.selectedDate||today());
 const weekDays=Array.from({length:7},(_,i)=>addDays(currentWeekStart,i));

 let periodTitle='',prevAction='week-back',nextAction='week-next',prevLabel=t('Previous','Sebelumnya'),nextLabel=t('Next','Berikutnya');
 if(activeView==='month'){
  periodTitle=formatDate(first,{month:'long',year:'numeric'});
  prevAction='month-back';nextAction='month-next';
  prevLabel=t('Previous month','Bulan sebelumnya');nextLabel=t('Next month','Bulan berikutnya');
 } else if(activeView==='week'){
  periodTitle=`${formatDate(weekDays[0],{day:'numeric',month:'short'})} – ${formatDate(weekDays[6],{day:'numeric',month:'short',year:'numeric'})}`;
  prevAction='week-back';nextAction='week-next';
  prevLabel=t('Previous week','Pekan sebelumnya');nextLabel=t('Next week','Pekan berikutnya');
 } else if(activeView==='gantt'){
  periodTitle=t('Gantt Timeline','Linimasa Gantt');
  prevAction='gantt-prev';nextAction='gantt-next';
  prevLabel=t('Previous period','Periode sebelumnya');nextLabel=t('Next period','Periode berikutnya');
 } else {
  periodTitle=formatDate(state.selectedDate,{weekday:'short',day:'numeric',month:'long',year:'numeric'});
  prevAction='week-back';nextAction='week-next';
  prevLabel=t('Previous day','Hari sebelumnya');nextLabel=t('Next day','Hari berikutnya');
 }

 return heading(t('MAKE TIME FOR THE WORK','WAKTU UNTUK PEKERJAAN'),t('Schedule','Jadwal'),t('Meetings and deadlines','Rapat dan tenggat'),`<button class="button primary" data-action="new-event">${icon('plus')}<span>${t('New meeting','Rapat baru')}</span></button>`)+
 `<div class="gcal-toolbar filter-bar">
  <button class="button gcal-today-btn" data-action="calendar-today">${t('Today','Hari ini')}</button>
  <div class="gcal-nav-buttons">
   <button class="icon-button" data-action="${prevAction}" aria-label="${prevLabel}">${icon('left')}</button>
   <button class="icon-button" data-action="${nextAction}" aria-label="${nextLabel}">${icon('right')}</button>
  </div>
  <h2 class="gcal-title">${periodTitle}</h2>
  <div class="spacer"></div>
  <div class="segmented" aria-label="${t('Schedule view','Tampilan jadwal')}">
   <button class="${activeView==='week'?'active':''}" data-action="schedule-view" data-value="week">${t('Week','Pekan')}</button>
   <button class="${activeView==='month'?'active':''}" data-action="schedule-view" data-value="month">${t('Month','Bulan')}</button>
   <button class="${activeView==='gantt'?'active':''}" data-action="schedule-view" data-value="gantt">${t('Gantt','Gantt')}</button>
   <button class="${activeView==='agenda'?'active':''}" data-action="schedule-view" data-value="agenda">${t('Agenda','Agenda')}</button>
  </div>
 </div>
 <div class="split-grid">
  <section>
   ${activeView==='month'?renderGoogleCalendarMonth(first,gridStart):activeView==='week'?renderGoogleCalendarWeek(currentWeekStart):activeView==='gantt'?`<div class="gantt-panel">${taskTimeline(store.core.tasks)}</div>`:`<section class="panel sculpted">${agenda(state.selectedDate)}</section>`}
   <div class="calendar-summary">${icon('info')}<p>${t('Dates without a time are all-day deadlines. Meeting lengths follow their recorded duration.','Tanggal tanpa jam adalah tenggat sepanjang hari. Lama rapat mengikuti durasi yang dicatat.')}</p></div>
   <div class="section-heading section-space"><h2>${t('Meeting notes','Notulen rapat')}</h2>${button(t('Add notes','Tambah notulen'),'new-record','plus','data-source="extension" data-collection="meetingNotes"')}</div>
   <section class="panel sculpted">${renderRecordList('meetingNotes',store.extension.meetingNotes,'extension')}</section>
  </section>
  <aside class="stack">
   <section class="panel sculpted">
    <div class="panel-head">
     <div>
      <p class="section-label">${t('SELECTED DAY','HARI TERPILIH')}</p>
      <h2>${formatDate(state.selectedDate,{weekday:'long',day:'numeric',month:'short'})}</h2>
     </div>
     <div class="date-orb">
      <small>${formatDate(state.selectedDate,{month:'short'})}</small>
      <strong>${day(state.selectedDate).getDate()}</strong>
     </div>
    </div>
    ${agenda(state.selectedDate,true)}
   </section>
  </aside>
 </div>`;
}

function choices(anchor,title,items,onChoose){ui.open({kind:matchMedia('(max-width: 767px)').matches?'sheet':'popover',anchor,title,content:`<div class="menu-options">${items.map(item=>`<button class="menu-option ${item.selected?'active':''}" data-overlay-action="choose" data-value="${h(item.value)}">${item.icon?icon(item.icon):''}<span>${h(item.label)}</span>${item.selected?icon('check'):''}</button>`).join('')}</div>`,onAction:async(action,target)=>{if(action==='choose'){await ui.close(true,{waitForExit:false});onChoose(target.dataset.value);}}});}
function updateTask(id,patch,message){const task=store.core.tasks.find(x=>x.id===id);if(!task)throw new Error(t('Task not found.','Tugas tidak ditemukan.'));const next=applyTask(store.core,{...task,...patch});next.activity=[{id:crypto.randomUUID(),text:message,projectId:task.projectId,at:new Date().toISOString()},...next.activity].slice(0,200);store.saveCore(next,message);}
let mutationQueue=Promise.resolve();
const pendingCompletions=new Set();
const pendingBulkActions=new Set();
function taskFocusHandoff(row){
 const focused=document.activeElement,ownsFocus=row?.contains(focused)||focused?.closest('#bulk-actions');
 const rows=[...document.querySelectorAll('[data-task-row]')],index=rows.indexOf(row);
 const ids=[...rows.slice(index+1),...rows.slice(0,Math.max(0,index)).reverse()].map(item=>item.dataset.taskRow);
 return()=>{
  if(!ownsFocus||focused?.isConnected||document.activeElement!==document.body)return;
  const target=ids.map(id=>document.querySelector(`[data-task-row="${CSS.escape(id)}"] .task-check`)).find(Boolean)||document.querySelector('#page h1');
  if(target){if(target.tagName==='H1')target.tabIndex=-1;target.focus({preventScroll:true});}
 };
}
function completeTask(id){
 if(pendingCompletions.has(id))return mutationQueue;
 pendingCompletions.add(id);
 mutationQueue=mutationQueue.then(async()=>{
  const task=store.core.tasks.find(x=>x.id===id);
  if(!task){pendingCompletions.delete(id);return;}
  const row=document.querySelector(`[data-task-row="${CSS.escape(id)}"]`),finishing=task.status!=='done',restoreFocus=taskFocusHandoff(row);
  mutationRunning=true;ui.clearToast();
  try{
   updateTask(id,{status:finishing?'done':'todo'},t(`${finishing?'Completed':'Reopened'}: ${task.title}`,`${finishing?'Diselesaikan':'Dibuka kembali'}: ${task.title}`));
   if(finishing&&row)await dissolve(row);
   mutationRunning=false;render();restoreFocus();
   notify(finishing?t('Task completed','Tugas selesai'):t('Task reopened','Tugas dibuka kembali'));
  }catch(error){mutationRunning=false;render();showError(error);}
  finally{pendingCompletions.delete(id);mutationRunning=false;if(pendingRender){pendingRender=false;render();}}
 });
 return mutationQueue;
}
function savePreference(key,value){const next=structuredClone(store.extension);next.preferences[key]=key==='reminderDays'?Number(value):value;store.saveExtension(next,t('Preferences saved','Preferensi tersimpan'));preferences();shell();render();}
function renderBulk(){let bar=document.querySelector('#bulk-actions');const ids=[...state.selectedTaskIds].filter(id=>store.core.tasks.some(x=>x.id===id));if(!ids.length){bar?.remove();return;}if(!bar){bar=document.createElement('div');bar.id='bulk-actions';bar.className='bulk-bar';document.body.append(bar);}bar.innerHTML=`<strong>${ids.length} ${t('selected','dipilih')}</strong><button data-action="bulk-complete">${icon('check')}${t('Complete','Selesaikan')}</button><button data-action="bulk-status">${icon('filter')}${t('Status','Status')}</button><button data-action="bulk-clear" aria-label="${t('Clear selection','Batalkan pilihan')}">${icon('close')}</button>`;}
function bulkStatus(status){
 const selected=[...state.selectedTaskIds],key=JSON.stringify([status,[...selected].sort()]);
 if(pendingBulkActions.has(key))return mutationQueue;
 pendingBulkActions.add(key);
 mutationQueue=mutationQueue.then(async()=>{
  let next=structuredClone(store.core),waiting=selected.filter(id=>next.tasks.some(task=>task.id===id)),lastError;
  if(!waiting.length){pendingBulkActions.delete(key);return;}
  const rows=waiting.map(id=>document.querySelector(`[data-task-row="${CSS.escape(id)}"]`)).filter(Boolean),restoreFocus=taskFocusHandoff(rows[0]);
  mutationRunning=true;ui.clearToast();
  try{
   while(waiting.length){let changed=false;for(const id of [...waiting]){try{next=applyTask(next,{...next.tasks.find(x=>x.id===id),status});waiting=waiting.filter(x=>x!==id);changed=true;}catch(error){lastError=error;}}if(!changed)throw lastError;}
   store.saveCore(next,t('Selected tasks updated','Tugas terpilih diperbarui'));
   if(status==='done')await Promise.all(rows.map(row=>dissolve(row)));
   selected.forEach(id=>state.selectedTaskIds.delete(id));mutationRunning=false;render();restoreFocus();notify(t('Selected tasks updated','Tugas terpilih diperbarui'));
  }catch(error){mutationRunning=false;render();showError(error);}
  finally{pendingBulkActions.delete(key);mutationRunning=false;if(pendingRender){pendingRender=false;render();}}
 });
 return mutationQueue;
}
function taskDate(id,anchor){const task=store.core.tasks.find(x=>x.id===id);if(!task)return;ui.open({kind:matchMedia('(max-width: 767px)').matches?'sheet':'popover',anchor,title:t('Task dates','Tanggal tugas'),dirtyGuard:true,content:`<form><div class="form-error" role="alert"></div><div class="form-grid"><div class="field"><label for="quick-start">${t('Start date','Tanggal mulai')}</label><input id="quick-start" name="start" type="date" required value="${task.start}"></div><div class="field"><label for="quick-end">${t('Deadline','Tenggat')}</label><input id="quick-end" name="end" type="date" required value="${task.end}"></div></div><div class="form-actions"><button type="submit" class="button primary">${t('Save dates','Simpan tanggal')}</button></div></form>`,onSubmit:async(event,panel)=>{try{const data=Object.fromEntries(new FormData(event.target));updateTask(id,data,t('Task dates updated','Tanggal tugas diperbarui'));await ui.close(true,{waitForExit:false});notify(t('Dates saved','Tanggal tersimpan'));}catch(error){panel.querySelector('.form-error').textContent=translateError(error,t);}}});}
function taskFilters(anchor){ui.open({kind:'popover',anchor,title:t('Filter tasks','Filter tugas'),content:`<form><div class="form-grid"><div class="field full"><label for="filter-status">${t('Status','Status')}</label><select id="filter-status" name="status">${[['open',t('Open tasks','Tugas terbuka')],['all',t('All statuses','Semua status')],...Object.keys(STATUSES).map(k=>[k,statusLabel(k)])].map(([value,label])=>`<option value="${value}" ${state.taskFilter===value?'selected':''}>${label}</option>`).join('')}</select></div><div class="field full"><label for="filter-project">${t('Project','Proyek')}</label><select id="filter-project" name="project"><option value="all">${t('All projects','Semua proyek')}</option>${store.core.projects.map(p=>`<option value="${h(p.id)}" ${state.taskProject===p.id?'selected':''}>${h(p.name)}</option>`).join('')}</select></div></div><div class="form-actions"><button class="button primary" type="submit">${t('Apply filters','Terapkan filter')}</button></div></form>`,onSubmit:async(event)=>{const data=new FormData(event.target);state.taskFilter=data.get('status');state.taskProject=data.get('project');await ui.close(true,{waitForExit:false});render();}});}
function showSearch(){const panel=ui.open({kind:'search',title:t('Find your next step','Temukan langkah berikutnya'),content:`<label class="search-field">${icon('search')}<input id="global-query" type="search" aria-label="${t('Search workspace','Cari di ruang kerja')}" placeholder="${t('Tasks, people, documents, decisions…','Tugas, anggota, dokumen, keputusan…')}" value="${h(searchQuery)}" autocomplete="off"></label><p class="meta search-hint">${t('Search local records across every division.','Cari catatan lokal di seluruh divisi.')}</p><div id="search-results"></div>`});const input=panel.querySelector('input');input.addEventListener('input',()=>{searchQuery=input.value;fillSearch(panel);});fillSearch(panel);}
function fillSearch(panel){const q=searchQuery.toLowerCase().trim(),rows=allSearchRecords(store).filter(x=>!q||x.text.toLowerCase().includes(q)).slice(0,30);panel.querySelector('#search-results').innerHTML=rows.length?rows.map(x=>`<button class="search-result" data-action="search-result" data-type="${h(x.type)}" data-id="${h(x.id)}" data-project="${h(x.projectId||'')}">${icon(['task','tasks'].includes(x.type)?'tasks':['document','documents'].includes(x.type)?'file':['member','members'].includes(x.type)?'person':'projects')}<span><strong>${h(x.title)}</strong><small>${h(searchType(x.type))}${x.projectId?' · '+h(project(x.projectId)?.name||''):''}</small></span>${icon('arrow')}</button>`).join(''):empty(t('No matching records','Tidak ada catatan yang cocok'),t('Try a project name, person, or shorter phrase.','Coba nama proyek, anggota, atau frasa yang lebih singkat.'));}
function searchType(type){return searchTypeLabel(type,t);}
async function searchResult(type,id,pid){await ui.close(true,{waitForExit:false});if(['task','tasks'].includes(type))editors.inspectTask(id);else if(['project','projects'].includes(type))navigate(`project/${id}`);else if(['member','members'].includes(type))editors.inspectMember(id);else if(['event','events'].includes(type))editors.event(id);else if(['document','documents'].includes(type))editors.inspectDocument(id,pid);else if(type==='division')navigate('division/'+id);else {type=({partner:'partners',followup:'followups',delivery:'deliveries',legalRequest:'legalRequests',decision:'decisions',blocker:'blockers',milestone:'milestones'})[type]||type;const schemaType=type.startsWith('division:')?type.slice(9):type.startsWith('project:')?type.slice(8):type;editors.inspectRecord(schemaType,id,RECORD_SCHEMAS[schemaType]?'extension':EXTRA_SCHEMAS[schemaType]&&pid?'extras':'division',pid);}}
function showNotifications(){const reminders=reminderItems(store);ui.open({kind:'inspector',title:t('Your reminders','Pengingat Anda'),content:`<p class="inspector-description">${t('Due work, refreshed while this workspace is open. Catch up here when you return.','Tugas jatuh tempo diperbarui saat ruang kerja ini terbuka. Lihat kembali ketika Anda kembali.')}</p>${reminders.length?reminders.map(x=>`<button class="record-row" data-action="reminder" data-type="${x.type}" data-id="${h(x.recordId)}" data-project="${h(x.projectId||'')}">${icon('clock')}<span class="record-body"><strong>${h(x.title)}</strong><small>${formatDate(x.date)}${x.overdue?' · '+t('Overdue','Terlewat'):''}</small></span>${icon('chevron-right')}</button>`).join(''):empty(t('Nothing needs a nudge','Tidak ada yang perlu diingatkan'),t('Upcoming work will appear here.','Pekerjaan mendatang akan muncul di sini.'))}`});}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportReport(pid){const r=routeInfo();let rows,columns;if(r.page==='division'){const view=DIVISION_VIEWS.find(x=>x.slug===r.id),collection=state.divisionTabs[r.id]==='overview'||!state.divisionTabs[r.id]?view.collections[0]:state.divisionTabs[r.id];rows=(RECORD_SCHEMAS[collection]?store.extension:store.divisions)[collection]||[];const filter=state.divisionFilters[collection];if(filter)rows=rows.filter(x=>filter.field==='financeMeasure'?x.type==='expense'&&(filter.value==='paid'?x.stageId==='paid':x.stageId==='approved'):String(x[filter.field])===filter.value);columns=['id',...(RECORD_SCHEMAS[collection]||DIVISION_SCHEMAS[collection]).fields.map(x=>x[0])];}else if(r.page==='projects'||r.page==='organization'){rows=(r.page==='organization'?store.core.projects.filter(p=>(!state.orgDivision||state.orgDivision==='all'||p.division===state.orgDivision)&&(!state.orgOwner||state.orgOwner==='all'||p.owner===state.orgOwner)):filteredProjects()).map(p=>({...p,...progress(store.core,p.id)}));columns=['id','name','division','owner','start','end','done','total','percent'];}else{rows=r.page==='tasks'||pid||r.page==='project'?filteredTasks(pid||r.id):store.core.tasks;columns=['id','title','projectId','assignee','status','start','end','completedAt','priority','evidence'];}const csvCell=value=>{let s=String(value??'');if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const csv=[columns,...rows.map(row=>columns.map(k=>row[k]))].map(row=>row.map(csvCell).join(',')).join('\r\n');download('\uFEFF'+csv,`dwdg-${r.page}-${today()}.csv`,'text/csv;charset=utf-8');ui.toast(t(`Exported ${rows.length} records from this view`,`Mengekspor ${rows.length} catatan dari tampilan ini`));}
function markRead(id){const next=structuredClone(store.extension);if(id==='all')next.notifications=next.notifications.map(n=>({...n,readAt:new Date().toISOString()}));else next.notifications=next.notifications.map(n=>n.id===id?{...n,readAt:new Date().toISOString()}:n);store.saveExtension(next,t('Marked as read','Ditandai dibaca'));}

async function handleAction(action,el,event){const id=el.dataset.id,collection=el.dataset.collection||el.dataset.type,source=el.dataset.source||(RECORD_SCHEMAS[collection]?'extension':'division'),pid=el.dataset.project;switch(action){
 case 'new-task':return editors.task('',pid||((routeInfo().page==='project')?routeInfo().id:''));
 case 'toggle-divisions':state.divisionsOpen=state.divisionsOpen===false;shell();persistUI();return;
 case 'task':return editors.inspectTask(id);
 case 'edit-task':return editors.task(id);
 case 'complete-task':el.disabled=true;return completeTask(id);
 case 'task-status':return choices(el,t('Task status','Status tugas'),Object.keys(STATUSES).map(value=>({value,label:statusLabel(value),selected:store.core.tasks.find(x=>x.id===id)?.status===value})),value=>{try{updateTask(id,{status:value},t('Task status updated','Status tugas diperbarui'));notify(t('Status saved','Status tersimpan'));}catch(error){showError(error);}});
 case 'task-owner':return choices(el,t('Assign to','Tugaskan kepada'),store.core.members.map(x=>({value:x.id,label:x.name,selected:store.core.tasks.find(t=>t.id===id)?.assignee===x.id})),value=>{try{updateTask(id,{assignee:value},t('Task owner updated','Penanggung jawab diperbarui'));notify(t('Owner saved','Penanggung jawab tersimpan'));}catch(error){showError(error);}});
 case 'task-date':return taskDate(id,el);
 case 'task-menu':return choices(el,t('Task options','Opsi tugas'),[{value:'edit',label:t('Edit details','Ubah rincian'),icon:'edit'},{value:'status',label:t('Change status','Ubah status'),icon:'filter'},{value:'dates',label:t('Change dates','Ubah tanggal'),icon:'calendar'}],value=>value==='edit'?editors.task(id):value==='dates'?taskDate(id,el):handleAction('task-status',el,event));
 case 'timeline-shift':state.selectedDate=addDays(state.selectedDate,Number(el.dataset.offset)||0);return render();
 case 'timeline-task':return choices(el,t('Adjust task','Sesuaikan tugas'),[{value:'edit',label:t('Edit dates and details','Ubah tanggal dan rincian'),icon:'edit'},{value:'-1',label:t('Move one day earlier','Geser satu hari lebih awal'),icon:'left'},{value:'1',label:t('Move one day later','Geser satu hari lebih lambat'),icon:'right'}],value=>{if(value==='edit')editors.task(id);else try{store.saveCore(shiftTask(store.core,id,Number(value)),t('Task shifted','Tugas digeser'));notify(t('Task dates shifted','Tanggal tugas digeser'));}catch(error){showError(error);}});
 case 'select-task':state.selectedTaskIds[el.checked?'add':'delete'](id);return renderBulk();
 case 'bulk-clear':state.selectedTaskIds.clear();return render();
 case 'bulk-complete':return bulkStatus('done');
 case 'bulk-status':return choices(el,t('Selected task status','Status tugas terpilih'),Object.keys(STATUSES).map(value=>({value,label:statusLabel(value)})),bulkStatus);
 case 'task-view':state.taskView=el.dataset.value;return render();
 case 'task-scope':state.taskScope=el.dataset.value;state.selectedTaskIds.clear();return render();
 case 'task-filters':return taskFilters(el);
 case 'new-project':return editors.project();
 case 'edit-project':return editors.project(id);
 case 'project-menu':return choices(el,t('Project options','Opsi proyek'),[{value:'open',label:t('Open workspace','Buka ruang kerja'),icon:'projects'},{value:'edit',label:t('Edit project','Ubah proyek'),icon:'edit'}],value=>value==='open'?navigate(`project/${id}`):editors.project(id));
 case 'project-view':state.projectView=el.dataset.value;return render();
 case 'project-tab':state.projectTab=el.dataset.value;return render();
 case 'project-filter':return choices(el,t('Division','Divisi'),[{value:'all',label:t('All divisions','Semua divisi'),selected:state.projectDivision==='all'},...DIVISIONS.map(value=>({value,label:DIVISION_VIEWS.find(v=>v.name===value)?t(DIVISION_VIEWS.find(v=>v.name===value).name,DIVISION_VIEWS.find(v=>v.name===value).id):value,selected:state.projectDivision===value}))],value=>{state.projectDivision=value;render();});
 case 'project-blockers':state.projectTab='overview';return navigate(`project/${id}`);
 case 'portfolio-blockers':{const visibleProjects=new Set(filteredProjects().map(p=>p.id));const rows=Object.entries(store.extras.byProject).filter(([projectId])=>visibleProjects.has(projectId)).flatMap(([projectId,x])=>x.blockers.filter(b=>!b.resolved_at&&b.severity===el.dataset.value).map(b=>({...b,projectId})));return ui.open({kind:'inspector',title:t('Project blockers','Hambatan proyek'),content:rows.length?rows.map(x=>`<button class="record-row" data-action="record" data-source="extras" data-collection="blockers" data-id="${h(x.id)}" data-project="${h(x.projectId)}">${icon('warning')}<span class="record-body"><strong>${h(x.title)}</strong><small>${h(project(x.projectId)?.name||'')}</small></span>${icon('chevron-right')}</button>`).join(''):empty(t('No blockers at this level','Tidak ada hambatan pada tingkat ini'),t('Recorded blockers will appear here.','Hambatan tercatat akan muncul di sini.'))});}
 case 'chart-info':return ui.open({kind:'popover',anchor:el,title:t('About completion activity','Tentang aktivitas penyelesaian'),content:`<p class="inspector-description">${t('Counts show tasks that are currently complete, on their saved completion date. Reopening or deleting a task changes these totals. Undated completions are excluded.','Jumlah menunjukkan tugas yang saat ini selesai, pada tanggal penyelesaian tersimpan. Membuka kembali atau menghapus tugas mengubah jumlah ini. Penyelesaian tanpa tanggal dikecualikan.')}</p><p class="inspector-description">${t('The daily average includes recorded calendar days with zero completions. Today is partial and excluded; dates before observation are unknown.','Rata-rata harian mencakup hari pencatatan dengan nol penyelesaian. Hari ini belum berakhir dan dikecualikan; tanggal sebelum pencatatan tidak diketahui.')}</p>`});
 case 'select-date':case 'calendar-date':state.selectedDate=el.dataset.date;state.showCompleted=true;return render();
 case 'week-back':case 'week-next':{const offset=action==='week-back'?-7:7;state.selectedDate=addDays(state.selectedDate,offset);state.weekStart=weekStartFor(state.selectedDate);return render();}
 case 'gantt-prev':case 'gantt-next':{const offset=action==='gantt-prev'?-7:7;state.selectedDate=addDays(state.selectedDate,offset);return render();}
 case 'month-back':case 'month-next':{const d=day(state.scheduleMonth+'-01');d.setMonth(d.getMonth()+(action==='month-back'?-1:1));state.scheduleMonth=iso(d).slice(0,7);return render();}
 case 'calendar-today':state.selectedDate=today();state.weekStart=weekStartFor(today());state.scheduleMonth=today().slice(0,7);return render();
 case 'schedule-view':state.scheduleView=el.dataset.value;return render();
 case 'event':return editors.event(id);
 case 'event-menu':return choices(el,t('Meeting options','Opsi rapat'),[{value:'edit',label:t('Edit details','Ubah rincian'),icon:'edit'},{value:'new',label:t('New meeting','Rapat baru'),icon:'plus'}],value=>value==='edit'?editors.event(id):editors.event());
 case 'new-event':return editors.event('',pid);
 case 'new-record':return editors.record(collection,'',source,pid);
 case 'record':return collection==='documents'?editors.inspectDocument(id,pid):editors.inspectRecord(collection,id,source,pid);
 case 'division-tab':state.divisionTabs[el.dataset.division||routeInfo().id]=el.dataset.tab;return render();
 case 'division-filter':state.divisionTabs[routeInfo().id]=collection;state.divisionFilters[collection]={field:el.dataset.field,value:el.dataset.value};return render();
 case 'clear-record-filter':delete state.divisionFilters[collection];return render();
 case 'new-document':return editors.document('',pid);
 case 'document':return editors.inspectDocument(id,pid);
 case 'member':return editors.inspectMember(id);
 case 'new-member':return editors.member();
 case 'edit-profile':return editors.profile();
 case 'updates-filter':state.updatesFilter=el.dataset.value;return render();
 case 'mark-read':return markRead(id);
 case 'mark-all-read':return markRead('all');
 case 'notification':{const item=store.extension.notifications.find(x=>x.id===id);markRead(id);return ui.open({kind:'inspector',title:item?.title||t('Update','Pembaruan'),content:`<p class="inspector-description">${h(item?.body||item?.message||item?.text||t('This update has been read.','Pembaruan ini telah dibaca.'))}</p>${item?.projectId?`<button class="button" data-action="navigate" data-route="project/${h(item.projectId)}">${t('Open project','Buka proyek')}</button>`:''}`});}
 case 'reminder':return searchResult(collection==='followup'?'followups':collection,id,pid);
 case 'global-search':return showSearch();
 case 'search-result':return searchResult(collection,id,pid);
 case 'notifications':return showNotifications();
 case 'language-menu':return choices(el,t('Interface language','Bahasa antarmuka'),[{value:'en',label:'English',selected:store.extension.preferences.language==='en'},{value:'id',label:'Bahasa Indonesia',selected:store.extension.preferences.language==='id'}],value=>savePreference('language',value));
 case 'theme-menu':return choices(el,t('Appearance','Tampilan'),[['system','Use device setting','Ikuti perangkat'],['light','Light','Terang'],['dark','Dark','Gelap']].map(([value,en,id])=>({value,label:t(en,id),selected:store.extension.preferences.theme===value})),value=>savePreference('theme',value));
 case 'navigation':return ui.open({kind:'sheet',title:t('Your workspace','Ruang kerja Anda'),content:`<nav class="mobile-menu">${PRIMARY_PAGES.map(([key,en,id,ic])=>`<a class="nav-item" data-action="navigate" data-route="${key}" href="#${key}">${icon(ic)}${t(en,id)}</a>`).join('')}<p class="nav-label">${t('DIVISIONS','DIVISI')}</p>${DIVISION_VIEWS.map(v=>`<a class="nav-item" data-action="navigate" data-route="division/${v.slug}" href="#division/${v.slug}">${icon(v.icon)}${h(t(v.name,v.id))}</a>`).join('')}</nav>`});
 case 'navigate':event.preventDefault();return navigate(el.dataset.route);
 case 'settings':return navigate('settings');
 case 'export-workspace':download(JSON.stringify(store.exportAll(),null,2),`dwdg-records-${today()}.json`,'application/json');return ui.toast(t('Records exported. Attachment files stay on this device.','Catatan diekspor. Berkas lampiran tetap di perangkat ini.'));
 case 'import-workspace':return document.querySelector('#import-file').click();
 case 'export-report':return exportReport(pid);
 case 'print':return window.print();
 }}
document.addEventListener('click',event=>{const date=event.target.closest('[data-chart-date]');if(date){state.selectedDate=date.dataset.chartDate;state.showCompleted=true;state.portfolioSelected=routeInfo().page==='projects';render();return;}const target=event.target.closest('[data-action]');if(!target||target.disabled)return;Promise.resolve(handleAction(target.dataset.action,target,event)).catch(showError);});
document.addEventListener('input',event=>{const map={'task-search':'taskQuery','project-search':'projectQuery','document-search':'documentQuery'};if(map[event.target.id]){state[map[event.target.id]]=event.target.value;render();}});
document.addEventListener('change',event=>{const el=event.target;if(el.dataset.pref){try{savePreference(el.dataset.pref,el.value);}catch(error){el.value=String(store.extension.preferences[el.dataset.pref]);showError(error);}}const filters={'document-project':'documentProject','document-division':'documentDivision','document-kind':'documentKind','organization-division':'orgDivision','organization-owner':'orgOwner'};if(filters[el.id]){state[filters[el.id]]=el.value;render();}});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!ui.isOpen())showSearch();}if(event.key==='Escape'&&state.selectedTaskIds.size&&!ui.isOpen()){state.selectedTaskIds.clear();render();}});
document.addEventListener('dragstart',event=>{const el=event.target.closest('[data-drag-task]');if(el){dragTask=el.dataset.dragTask;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragTask);}});
document.addEventListener('dragover',event=>{const el=event.target.closest('[data-drop-status]');if(el&&dragTask){event.preventDefault();el.classList.add('drag-over');}});
document.addEventListener('dragleave',event=>event.target.closest('[data-drop-status]')?.classList.remove('drag-over'));
document.addEventListener('drop',event=>{const el=event.target.closest('[data-drop-status]');if(el&&dragTask){event.preventDefault();try{updateTask(dragTask,{status:el.dataset.dropStatus},t('Task moved','Tugas dipindahkan'));notify(t('Task moved','Tugas dipindahkan'));}catch(error){showError(error);}dragTask='';el.classList.remove('drag-over');}});
document.querySelector('#import-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>10*1024*1024)throw new Error(t('The backup is larger than 10 MB.','Cadangan lebih besar dari 10 MB.'));const data=JSON.parse(await file.text());if(await ui.confirm({title:t('Replace local records from backup?','Ganti catatan lokal dari cadangan?'),message:t('This replaces the current records. Download your current backup first if needed. Attachment files are not included in JSON backups. You can undo this import.','Ini mengganti catatan saat ini. Unduh cadangan Anda terlebih dahulu jika diperlukan. Berkas lampiran tidak disertakan dalam cadangan JSON. Impor ini dapat dibatalkan.'),confirmLabel:t('Import backup','Impor cadangan')})){store.importAll(data);notify(t('Backup imported','Cadangan diimpor'));}}catch(error){showError(error);}});
store.subscribe(()=>{render();const count=document.querySelector('.nav-item[href="#tasks"] .count');if(count)count.textContent=store.core.tasks.filter(x=>x.status!=='done'&&x.assignee===store.core.profile.memberId).length;});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(store.extension.preferences.theme==='system'){preferences();shell();}});
// Reminders are derived from saved records each time the workspace becomes visible.
// The stable badge updates without replacing the shell or interrupting a draft/Undo.
let reminderDate=today();
function refreshReminders(){
 const count=reminderItems(store).length,button=document.querySelector('.notification-trigger');
 if(button){
  let marker=button.querySelector('i');
  if(count&&!marker){marker=document.createElement('i');marker.setAttribute('aria-hidden','true');button.append(marker);}
  if(!count)marker?.remove();
  button.setAttribute('aria-label',t(`Reminders: ${count} due or upcoming`,`Pengingat: ${count} jatuh tempo atau mendatang`));
 }
 const changedDay=reminderDate!==today();
 if(changedDay&&!ui.isOpen()&&!mutationRunning){reminderDate=today();render();}
}
store.subscribe(refreshReminders);
setInterval(()=>{if(document.visibilityState==='visible')refreshReminders();},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshReminders();});
preferences();shell();render();
refreshReminders();
