import {PEOPLE,peopleInWorkspace} from './dwdg-one-preview-data.mjs';
import {RESOURCE_KINDS, createResourceStore, selectResources, resourceAncestors, resourceDescendants, resourcePath, safeResourceURL} from './dwdg-one-resources-data.mjs';
import {escapeHtml as h, icon as sharedIcon} from './experience-ui.mjs';
import {formatLocalDate} from './experience-i18n.mjs';
import {renderNote,formatSelection} from './dwdg-one-note.mjs';
import {resourceIdentityMarkup} from './dwdg-one-resource-identity.mjs';

const copy=value=>structuredClone(value);
const icon=(name,className='')=>name==='pin'?`<svg class="ux-icon ${h(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M9 3v6l-3 3v3h12v-3l-3-3V3M12 15v6"/></svg>`:sharedIcon(name,className);
const textKinds=new Set(['note','meeting']);
const nativeKinds=new Set(['folder','note','meeting']);

/** Markup and delegated events integrated with the preview's persistent shell. */
export function mountResources({storage,getProjectState,getUnscopedProjectState=getProjectState,getWorkspaceId,getLanguage=()=> 'en',t,ui,onNotice=()=>{},onRender=()=>{},onTaskCreate,access,actorId='demo-admin'}={}) {
  if(typeof t!=='function'||!ui||typeof getWorkspaceId!=='function'||typeof getProjectState!=='function')throw new TypeError('Resources needs the shared preview context.');
  const rawStore=createResourceStore(storage,{getProjectState:getUnscopedProjectState,actorId});
  const store=access?access.wrapResourceStore(rawStore,{storage,getProjectState:getUnscopedProjectState}):rawStore;
  let projectId='',contextKey='',destroyed=false,errorCode='',draftSaved=true,openerId='',createProjectId='',restoringNotePosition=false,suppressFocusReveal=false;
  const menuObservers=new Set();
  let drafts=copy(store.state.drafts),views=copy(store.state.views),taskDraft=null;
  const workspaceId=()=>getWorkspaceId(),people=()=>peopleInWorkspace(workspaceId());
  const project=id=>getProjectState().projects.find(row=>row.id===id&&row.workspaceId===workspaceId());
  const row=id=>store.state.resources.find(item=>item.id===id&&item.workspaceId===workspaceId()&&!item.archived&&project(item.projectId));
  const context=record=>record||{workspaceId:workspaceId(),projectId:projectId||row(view().folderId)?.projectId||''};
  const projectContext=item=>({workspaceId:item.workspaceId,projectId:item.id,ownerId:actorId});
  const can=(action,record)=>{if(!access||access.isDefault)return true;const subject=context(record);if(!access.can('resource',action,subject))return false;const fields=action==='update'?access.allowedFields('resource',subject):null;return fields===null||fields.length>0;};
  const canExport=()=>!access||access.isDefault||store.state.resources.some(resource=>resource.workspaceId===workspaceId()&&!resource.archived&&(!projectId||resource.projectId===projectId)&&can('export',resource));
  const canCreate=()=>projectId?can('create',{workspaceId:workspaceId(),projectId,ownerId:actorId}):getProjectState().projects.some(item=>item.workspaceId===workspaceId()&&can('create',projectContext(item)));
  const showUndo=()=>!access||access.isDefault||store.canUndo(workspaceId());
  const allowedFields=record=>access?.allowedFields('resource',record)??null;
  const canField=(field,record)=>{const permitted=allowedFields(record);return permitted===null||permitted.includes(field);};
  const draftContext=item=>item?.id?row(item.id):item?{workspaceId:item.workspaceId,projectId:item.projectId,ownerId:item.fields?.ownerId||'',contributorIds:copy(item.fields?.contributorIds||[])}:null;
  const canDraft=item=>!!item&&!!project(item.projectId)&&(!item.id||!!row(item.id))&&can(item.id?'update':'create',draftContext(item));
  const canTask=resource=>!!resource&&(!access||access.can('task','create',{workspaceId:resource.workspaceId,projectId:resource.projectId,ownerId:actorId}));
  function denied(){report({code:'access'});return false;}
  function requireAction(action,record){return can(action,record)||denied();}
  function requireDraft(item=draft()){return canDraft(item)||denied();}
  const mutateButton=(text,action,ic,resource,extra='',style='')=>can(action==='edit'||action==='move'?'update':action==='resolve-issue'?'issue':action==='export-note'?'export':action,resource)?button(text,action,ic,extra,style):'';
  const view=()=>views[contextKey]||=( {folderId:'',query:'',kind:'all',selectedId:'',panel:'',scroll:0});
  const draft=()=>{const item=drafts[`${workspaceId()}:${createProjectId||view().formProjectId||projectId||row(view().selectedId)?.projectId||''}`];if(item?.fields&&!Array.isArray(item.fields.contributorIds))item.fields.contributorIds=[];return item;};
  const label=kind=>t(...(RESOURCE_KINDS[kind]||[kind,kind]).slice(0,2));
  const person=id=>PEOPLE.find(item=>item.id===id);
  const personLabel=id=>id==='demo-admin'?t('Demo administrator','Administrator contoh'):person(id)?.name||t('Unassigned','Belum ditugaskan');
  const date=value=>value?formatLocalDate(value,getLanguage(),{day:'numeric',month:'short',...(value.length===10?{}:{timeZone:'Asia/Jakarta'})}):t('Not recorded','Belum tercatat');
  const button=(text,action,ic='',extra='',style='')=>`<button type="button" class="one-button ${style}" data-action="res-${action}" ${extra}>${ic?icon(ic):''}<span>${h(text)}</span></button>`;
  const iconButton=(text,action,ic,extra='')=>`<button type="button" class="one-icon-button" data-action="res-${action}" aria-label="${h(text)}" title="${h(text)}" ${extra}>${icon(ic)}</button>`;
  const errorText=code=>({
    title:t('Enter a resource title.','Masukkan judul sumber daya.'),
    url:t('Use a complete HTTPS URL without a username or password.','Gunakan URL HTTPS lengkap tanpa nama pengguna atau kata sandi.'),
    owner:t('Choose people from this workspace.','Pilih orang dari ruang kerja ini.'),
    hierarchy:t('Choose an available folder in this project. A folder cannot move into itself or a descendant.','Pilih folder yang tersedia dalam proyek ini. Folder tidak dapat dipindahkan ke dirinya sendiri atau turunannya.'),
    collision:t('A resource with this title already exists in this folder.','Sumber daya dengan judul ini sudah ada di folder ini.'),
    workspace:t('The project is not available in this workspace. Your form is kept.','Proyek tidak tersedia di ruang kerja ini. Formulir tetap dipertahankan.'),
    record:t('This resource is no longer available. Your form is kept.','Sumber daya ini sudah tidak tersedia. Formulir tetap dipertahankan.'),
    dependent:t('Related work or folder contents still use this resource. Remove those links before undoing its creation.','Pekerjaan terkait atau isi folder masih menggunakan sumber daya ini. Lepaskan tautan tersebut sebelum mengurungkan pembuatannya.'),
    conflict:t('Another tab changed Resources. Your unfinished text is kept here; copy it before reloading.','Tab lain mengubah Sumber daya. Teks yang belum selesai tetap di sini; salin sebelum memuat ulang.'),
    corrupt:t('Saved resource data could not be read and has been preserved. Changes are paused.','Data sumber daya tersimpan tidak dapat dibaca dan tetap dipertahankan. Perubahan dijeda.'),
    storage:t('The change was not saved. Storage is unavailable or full. Your typed text is still here.','Perubahan belum tersimpan. Penyimpanan tidak tersedia atau penuh. Teks yang Anda ketik masih di sini.'),
    dates:t('Use a valid target date.','Gunakan tanggal tenggat yang valid.'),
    reference:t('Choose an available resource in this workspace. Your note is kept.','Pilih sumber daya yang tersedia di ruang kerja ini. Catatan tetap dipertahankan.'),
    access:t('This action is unavailable for the selected role. Your unfinished form is kept.','Tindakan ini tidak tersedia untuk peran yang dipilih. Formulir yang belum selesai tetap dipertahankan.')
  }[code]||t('The change could not be saved. Try again.','Perubahan belum tersimpan. Coba lagi.'));
  function report(error) {
    errorCode=error?.code||'storage';
    const el=document.getElementById('one-res-error');if(el){el.hidden=false;el.textContent=errorText(errorCode);onNotice('','');}else onNotice(errorCode,errorText(errorCode));
    const status=document.getElementById('one-res-draft-status')||document.getElementById('one-res-issue-draft-status');if(status)status.textContent=draftStatusText();
    const field=document.getElementById(errorCode==='title'?(view().panel==='task'?'one-res-task-title':'one-res-title'):errorCode==='url'?'one-res-url':'one-res-error');
    field?.setAttribute('aria-invalid','true');if(!['storage','conflict'].includes(errorCode))focusControl(field);
  }
  function persist() {
    try{store.saveUI({drafts,views});draftSaved=true;return true;}catch(error){draftSaved=false;report(error);return false;}
  }
  function revealFocusedControl(control) {
    if(!control?.getBoundingClientRect||control.closest('[hidden]'))return;
    const rect=control.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const panel=control.closest('#one-inspector'),area=panel?.getBoundingClientRect();
    let top=Math.max(0,area?.top||0),bottom=Math.min(window.innerHeight,area?.bottom||window.innerHeight);
    const overlaps=other=>other.width&&other.height&&rect.left<other.right&&rect.right>other.left;
    const toolbar=document.querySelector('.one-topbar'),toolbarRect=toolbar?.getBoundingClientRect();
    if(toolbarRect&&overlaps(toolbarRect)&&['sticky','fixed'].includes(getComputedStyle(toolbar).position))top=Math.max(top,toolbarRect.bottom);
    const footer=control.closest('form')?.querySelector('.one-form-actions'),footerRect=footer?.getBoundingClientRect();
    if(footerRect&&!footer.contains(control)&&overlaps(footerRect)&&['sticky','fixed'].includes(getComputedStyle(footer).position))bottom=Math.min(bottom,footerRect.top);
    if(rect.top<top+4||rect.bottom>bottom-4)control.scrollIntoView?.({block:'center',inline:'nearest',behavior:'instant'});
  }
  function focusControl(control,{reveal=true}={}) {
    if(typeof control==='string')control=document.querySelector(control);if(!control)return false;
    for(let parent=control.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    suppressFocusReveal=true;try{control.focus({preventScroll:true});}finally{suppressFocusReveal=false;}if(reveal)revealFocusedControl(control);return true;
  }
  function focusDetailAction(action='edit') {
    const surface=view().noteReading?document.querySelector('.one-notes-sheet'):document.getElementById('one-inspector');
    return focusControl(surface?.querySelector(`[data-action="res-${action}"]`));
  }
  function repaint(focusId='') {onRender();if(focusId)focusControl(document.getElementById(focusId));}
  function enterInspector() {
    const panel=document.getElementById('one-inspector'),back=panel?.querySelector('.one-panel-header [data-action="res-close"]');
    if(!back)return;
    panel.scrollTop=0;focusControl(back,{reveal:false});if(window.innerWidth<1024)window.scrollTo({top:0,behavior:'instant'});
  }
  function feedback(message,{undo=true}={}) {const changedWorkspaceId=workspaceId();ui.toast(message,{undo:undo&&store.canUndo(changedWorkspaceId)?()=>{undoChange(changedWorkspaceId);}:undefined});}
  function avatar(id) {
    const name=personLabel(id),initials=person(id)?.name.split(' ').map(word=>word[0]).slice(0,2).join('')||'—';
    return `<span class="one-avatar" title="${h(name)}" aria-label="${h(name)}">${h(initials)}</span>`;
  }
  function avatars(resource) {
    const ids=[...new Set([resource.ownerId,...resource.contributorIds].filter(Boolean))];
    return `<button type="button" class="one-res-people" data-action="res-inspect" data-id="${h(resource.id)}" aria-label="${h(t('Responsible people','Penanggung jawab'))}: ${h(ids.map(personLabel).join(', ')||t('Unassigned','Belum ditugaskan'))}">${ids.slice(0,3).map(avatar).join('')}${ids.length>3?`<span class="one-avatar one-res-people-overflow">+${ids.length-3}</span>`:''}${!ids.length?`<span class="one-res-unassigned">${h(t('Unassigned','Belum ditugaskan'))}</span>`:''}</button>`;
  }
  function identity(resource,large=false) {return resourceIdentityMarkup(resource,{size:large?'large':'row'});}
  function pinnedButton(resource) {
    if(!['folder','externalFolder','file'].includes(resource.kind))return button(resource.title,'open',RESOURCE_KINDS[resource.kind][2],`data-id="${h(resource.id)}"`,'quiet');
    return `<button type="button" class="one-button quiet" data-action="res-open" data-id="${h(resource.id)}">${resourceIdentityMarkup(resource,{size:'small'})}<span>${h(resource.title)}</span></button>`;
  }
  function taskRows(resource) {return getProjectState().tasks.filter(task=>task.resourceId===resource.id&&task.workspaceId===workspaceId());}
  function resourceRow(resource) {
    const linked=taskRows(resource),path=resourcePath(store.state.resources,resource.id),scope=project(resource.projectId),issues=store.state.issues.filter(issue=>issue.resourceId===resource.id&&!issue.resolved);
    const contextId=`one-res-context-${resource.id}`,summary=linked.length?`${linked.filter(task=>task.status==='done').length} / ${linked.length} ${t('tasks','tugas')}`:date(resource.updatedAt),inlineSummary=linked.length?summary:`${t('Updated','Diperbarui')} ${summary}`;
    const context=(!projectId||view().query||view().kind!=='all')?[!projectId?scope?.title:'',path].filter(Boolean).join(' / '):'';
    const responsible=[...new Set([resource.ownerId,...resource.contributorIds].filter(Boolean))],names=responsible.map(personLabel).join(', ')||t('Unassigned','Belum ditugaskan');
    const more=`<button type="button" class="one-icon-button" data-action="res-inspect" data-id="${h(resource.id)}" id="one-res-more-${h(resource.id)}" aria-label="${h(t('More actions','Tindakan lainnya')+': '+resource.title+' · '+t('Responsible people','Penanggung jawab')+': '+names)}"><span class="one-res-more-people" aria-hidden="true">${responsible.length?avatar(responsible[0]):'<span class="one-res-more-unassigned">—</span>'}${responsible.length>1?`<span class="one-res-more-count">+${responsible.length-1}</span>`:''}</span>${icon('more')}</button>`;
    return `<article class="one-res-row ${view().selectedId===resource.id?'selected':''}" data-resource-id="${h(resource.id)}" role="listitem">${identity(resource)}<div class="one-res-name"><button type="button" id="one-res-row-${h(resource.id)}" data-action="res-open" data-id="${h(resource.id)}" aria-label="${h(resource.title)}" aria-describedby="${h(contextId)}"><span class="one-res-title">${h(resource.title)}</span><span id="${h(contextId)}" class="one-res-type"><span>${h(label(resource.kind))}</span> ${resource.pinned?`<span>${icon('pin')}<span class="one-sr-only">${h(t('Pinned','Disematkan'))}</span></span> `:''}${context?`<span class="one-res-path">· ${h(context)}</span> `:''}${issues.length?`<span class="one-blocker">${icon('warning')}${h(t('Link issue','Masalah tautan'))}</span> `:''}<span class="one-res-inline-summary">· ${h(inlineSummary)}</span></span></button></div><div class="one-res-meta"><span>${h(summary)}</span></div>${avatars(resource)}<div class="one-res-actions">${more}</div></article>`;
  }
  function picker(id,key,text,value,selectedLabel) {
    return `<button type="button" id="${id}" class="one-select-trigger one-res-picker" data-action="res-picker" data-key="${h(key)}" data-value="${h(value)}" role="combobox" aria-label="${h(text)}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-options"><span>${h(selectedLabel)}</span>${icon('chevron-down')}</button>`;
  }
  function heading() {
    const addLabel=t('Add resource','Tambah sumber daya');
    const creatable=canCreate();
    return `<div class="one-heading one-res-heading"><div>${!projectId?`<h1>${h(t('Resources','Sumber daya'))}</h1>`:`<h2>${h(t('Resources','Sumber daya'))}</h2>`}</div><div class="one-res-actions">${canExport()?iconButton(t('Export resource metadata and notes','Ekspor metadata sumber daya dan catatan'),'export','download'):''}${creatable?button(addLabel,'add','plus',`id="one-res-add" aria-label="${h(addLabel)}"`,'primary'):''}</div></div>`;
  }
  function render({projectId:nextProjectId=''}={}) {
    if(destroyed)return '';
    const nextContext=`${workspaceId()}:${nextProjectId||'*'}`;
    if(contextKey&&contextKey!==nextContext){saveDraft();view().panel='';persist();}
    projectId=nextProjectId;contextKey=nextContext;const v=view();
    if(v.folderId&&!row(v.folderId)){v.folderId='';v.selectedId='';v.panel='';}
    const selected=row(v.selectedId),item=draft();
    if(v.panel&&(v.panel==='form'&&item&&!canDraft(item)||v.panel!=='form'&&!selected||v.panel==='task'&&!canTask(selected)||v.panel==='issue'&&!can('issue',selected)||v.panel==='move'&&(!can('update',selected)||!canField('parentId',selected)))){
      v.panel='';v.noteReading=false;v.selectedId='';v.noteReturns=[];errorCode='access';
    }
    if(v.panel==='form'&&!item){v.panel='';createProjectId='';delete v.formProjectId;}
    if(v.panel==='form'&&item&&textKinds.has(item.fields.kind)){queueMicrotask(()=>{if(!destroyed&&draft()===item&&view().panel==='form')restoreNoteCaret(item,{focus:false});});return noteSheet(null,item);}
    if(v.panel==='detail'&&v.noteReading&&selected&&textKinds.has(selected.kind))return noteSheet(selected);
    const rows=selectResources(store.state,workspaceId(),{projectId,folderId:v.folderId,query:v.query,kind:v.kind}).filter(resource=>project(resource.projectId));
    const folder=row(v.folderId),ancestors=folder?[...resourceAncestors(store.state.resources,folder.id),folder]:[];
    let html=`<section class="one-res-page">${heading()}<div id="one-notices"></div>`;
    if(store.warning)html+=`<div class="one-notice error" role="alert">${h(errorText(store.warning))}</div>`;
    if(errorCode==='access')html+=`<div id="one-res-error" class="one-notice error" role="alert" tabindex="-1">${h(errorText('access'))}</div>`;
    const unfinished=Object.values(drafts).filter(item=>item.workspaceId===workspaceId()&&(!projectId||item.projectId===projectId)&&canDraft(item));
    if(unfinished.length&&v.panel!=='form')html+=`<div class="one-notice"><span>${h(draftSaved?t('An unfinished resource form is kept on this device.','Formulir sumber daya yang belum selesai tersimpan di perangkat ini.'):t('This unfinished form could not be stored. Resume it before leaving.','Formulir yang belum selesai ini belum dapat disimpan. Lanjutkan sebelum meninggalkan halaman.'))}</span>${button(t('Resume form','Lanjutkan formulir'),'resume','edit',`data-project="${h(unfinished[0].projectId)}"`,'quiet')}</div>`;
    const unfinishedIssue=Object.keys(v.issueDrafts||{}).find(id=>row(id)&&can('issue',row(id))&&(!projectId||row(id).projectId===projectId));
    if(unfinishedIssue&&v.panel!=='issue')html+=`<div class="one-notice"><span>${h(t('An unfinished link issue report is kept on this device.','Laporan masalah tautan yang belum selesai tersimpan di perangkat ini.'))}</span>${button(t('Resume report','Lanjutkan laporan'),'resume-issue','edit',`data-id="${h(unfinishedIssue)}"`,'quiet')}</div>`;
    html+=`<nav class="one-res-breadcrumbs" aria-label="${h(t('Resource folder path','Jalur folder sumber daya'))}"><button type="button" data-action="res-folder" data-id="">${h(t(projectId?'Project resources':'All resources',projectId?'Sumber daya proyek':'Semua sumber daya'))}</button>${ancestors.map((item,index)=>`<span aria-hidden="true">/</span><button type="button" data-action="res-folder" data-id="${h(item.id)}" ${index===ancestors.length-1?'aria-current="location"':''}>${h(item.title)}</button>`).join('')}</nav>`;
    html+=`<div class="one-tools one-res-toolbar"><label class="one-search one-res-search">${icon('search')}<input id="one-res-search" type="search" value="${h(v.query)}" placeholder="${h(t('Search resources or people…','Cari sumber daya atau orang…'))}" aria-label="${h(t('Search resources and responsible people','Cari sumber daya dan penanggung jawab'))}"></label>${picker('one-res-type-filter','filter',t('Resource type','Jenis sumber daya'),v.kind,v.kind==='all'?t('All types','Semua jenis'):label(v.kind))}${showUndo()?iconButton(t('Undo last resource change','Urungkan perubahan sumber daya terakhir'),'undo','undo',store.canUndo(workspaceId())?'':'disabled'):''}</div>`;
    if(!v.folderId&&!v.query&&v.kind==='all'){
      const pinned=store.state.resources.filter(resource=>resource.workspaceId===workspaceId()&&(!projectId||resource.projectId===projectId)&&!resource.archived&&resource.pinned&&project(resource.projectId));
      if(pinned.length)html+=`<nav class="one-res-pin-list" aria-label="${h(t('Pinned resources','Sumber daya yang disematkan'))}"><span>${icon('pin')}${h(t('Pinned','Disematkan'))}</span>${pinned.map(pinnedButton).join('')}</nav>`;
    }
    html+=`<div class="one-res-column-head" aria-hidden="true"><span>${h(t('Resource','Sumber daya'))}</span><span>${h(t('Updated / related work','Pembaruan / pekerjaan terkait'))}</span><span>${h(t('Responsible people','Penanggung jawab'))}</span><span></span></div>`;
    html+=rows.length?`<div class="one-res-list" role="list" aria-label="${h(t('Resources','Sumber daya'))}">${rows.map(resourceRow).join('')}</div>`:`<section class="one-empty one-res-empty">${icon('folder')}<h3>${h(t(v.query||v.kind!=='all'?'No matching resources':'No resources here yet',v.query||v.kind!=='all'?'Tidak ada sumber daya yang cocok':'Belum ada sumber daya di sini'))}</h3><p>${h(t(v.query||v.kind!=='all'?'Search another title, person or type.':canCreate()?'Create a folder or note, or link a working document.':'Resources will appear here when available.',v.query||v.kind!=='all'?'Cari judul, orang, atau jenis lainnya.':canCreate()?'Buat folder atau catatan, atau tautkan dokumen kerja.':'Sumber daya akan tampil di sini saat tersedia.'))}</p>${v.query||v.kind!=='all'?button(t('Clear filters','Hapus filter'),'clear','filter'):canCreate()?button(t('Add resource','Tambah sumber daya'),'add','plus','','primary'):''}</section>`;
    html+=`<p class="one-preview-footnote">${rows.length} ${h(t(rows.length===1?'resource':'resources','sumber daya'))}${v.query?` · ${h(t('Search includes notes and responsibility','Pencarian mencakup catatan dan penanggung jawab'))}`:''}</p></section>`;return html;
  }
  function revisionLink(url) {
    if(!url)return '';
    try{return `<a href="${h(safeResourceURL(url))}" target="_blank" rel="noopener noreferrer">${h(t('Open revision link','Buka tautan revisi'))}</a>`;}
    catch{return `<span>${h(t('Revision link unavailable','Tautan revisi tidak tersedia'))}</span>`;}
  }
  function properties(resource,{showContent=true,compact=false}={}) {
    const linked=taskRows(resource),revisions=store.state.revisions.filter(item=>item.resourceId===resource.id).slice().reverse();
    const native=nativeKinds.has(resource.kind),issues=store.state.issues.filter(item=>item.resourceId===resource.id&&!item.resolved);
    return `<div class="one-detail one-res-inspector">${compact?'':`${identity(resource,true)}<h2 class="one-detail-title">${h(resource.title)}</h2><p class="one-res-kind-label">${h(label(resource.kind))}</p>${resource.description?`<p class="one-detail-purpose">${h(resource.description)}</p>`:''}<div class="one-res-actions">${mutateButton(t('Edit','Edit'),'edit','edit',resource,`data-id="${h(resource.id)}"`,'primary')}${textKinds.has(resource.kind)?button(t('Open note','Buka catatan'),'open-note','file',`data-id="${h(resource.id)}"`):''}${mutateButton(t(resource.pinned?'Unpin':'Pin',resource.pinned?'Lepas sematan':'Sematkan'),'pin','pin',resource,`data-id="${h(resource.id)}"`)}${resource.kind==='folder'?button(t('Open folder','Buka folder'),'folder','folder',`data-id="${h(resource.id)}"`):''}</div>`}${textKinds.has(resource.kind)&&showContent?`<section class="one-detail-section"><h3>${h(t('Saved note','Catatan tersimpan'))}</h3><div class="one-res-note one-notes-body" data-format="${h(resource.contentFormat||'plain')}">${noteMarkup(resource.content,resource.contentFormat,resource.id)}</div>${mutateButton(t('Export Markdown','Ekspor Markdown'),'export-note','download',resource,`data-id="${h(resource.id)}"`)}</section>`:''}${!native?`<section class="one-detail-section"><h3>${h(t('External resource','Sumber daya eksternal'))}</h3><a class="one-button" href="${h(resource.url)}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${h(t('Open in external app','Buka di aplikasi eksternal'))}</span></a><p class="one-res-url">${h(resource.url)}</p><p class="one-form-hint">${h(t('Responsibility here does not grant access at the provider.','Tanggung jawab di sini tidak memberikan akses pada penyedia.'))}</p>${resource.accessNote?`<p>${h(resource.accessNote)}</p>`:''}${resource.contact?`<p>${h(t('Access contact','Kontak akses'))}: ${h(resource.contact)}</p>`:''}${mutateButton(t('Report link issue','Laporkan masalah tautan'),'issue','warning',resource,`data-id="${h(resource.id)}"`)}</section>`:''}<section class="one-detail-section"><h3>${h(t('Responsibility','Tanggung jawab'))}</h3><dl class="one-property-grid"><dt>${h(t('Accountable owner','Penanggung jawab utama'))}</dt><dd>${h(personLabel(resource.ownerId))}</dd><dt>${h(t('Contributors','Kontributor'))}</dt><dd>${h(resource.contributorIds.map(personLabel).join(', ')||t('None assigned','Belum ditugaskan'))}</dd><dt>${h(t('Project','Proyek'))}</dt><dd>${h(project(resource.projectId)?.title||'')}</dd><dt>${h(t('Folder','Folder'))}</dt><dd>${h(resourcePath(store.state.resources,resource.id)||t('Project resources','Sumber daya proyek'))}</dd><dt>${h(t(native?'Created by':'Added by',native?'Dibuat oleh':'Ditambahkan oleh'))}</dt><dd>${h(resource.createdBy==='demo-admin'?t('Demo administrator','Administrator contoh'):personLabel(resource.createdBy))}</dd><dt>${h(t('Updated','Diperbarui'))}</dt><dd>${h(date(resource.updatedAt))}</dd><dt>${h(t('Last editor','Editor terakhir'))}</dt><dd>${h(resource.updatedBy?personLabel(resource.updatedBy):t('Unknown','Tidak diketahui'))}</dd></dl>${canField('parentId',resource)?mutateButton(t('Move to folder','Pindah ke folder'),'move','folder',resource,`data-id="${h(resource.id)}"`):''}</section>${issues.length?`<section class="one-detail-section"><h3>${h(t('Open link issues','Masalah tautan terbuka'))}</h3><ul class="one-res-task-list">${issues.map(issue=>`<li><span>${h(issueLabel(issue.reason))}${issue.details?` · ${h(issue.details)}`:''}</span>${mutateButton(t('Resolve','Selesaikan'),'resolve-issue','check',resource,`data-id="${h(issue.id)}"`)}</li>`).join('')}</ul><p>${h(t('Follow up with the resource owner or access contact.','Tindak lanjuti dengan penanggung jawab sumber daya atau kontak akses.'))}</p></section>`:''}<section class="one-detail-section"><h3>${h(t('Related work','Pekerjaan terkait'))}</h3>${linked.length?`<ul class="one-res-task-list">${linked.map(task=>`<li><span>${icon(task.status==='done'?'check':'tasks')}<strong>${h(task.title)}</strong><small>${h(personLabel(task.ownerId||''))}${task.targetDate?' · '+h(date(task.targetDate)):''}</small></span><span class="one-status ${h(task.status==='done'?'completed':task.status==='progress'?'active':'draft')}">${h(task.status==='done'?t('Done','Selesai'):task.status==='progress'?t('In progress','Berjalan'):t('To do','Belum dikerjakan'))}</span></li>`).join('')}</ul>`:`<p>${h(t('No related tasks yet.','Belum ada tugas terkait.'))}</p>`}${canTask(resource)?button(t('Add related task','Tambah tugas terkait'),'task','plus',`data-id="${h(resource.id)}"`):''}</section>${revisions.length?`<section class="one-detail-section"><h3>${h(t('Revision history','Riwayat revisi'))}</h3><ol class="one-res-revisions">${revisions.map((revision,index)=>`<li><strong>${h(t('Revision','Revisi'))} ${h(revision.label)}${index===0?' · '+h(t('Current','Saat ini')):''}</strong><small>${h(date(revision.createdAt))}</small>${revision.changeNote?`<p>${h(revision.changeNote)}</p>`:''}${revision.content?`<details><summary>${h(t('View saved text','Lihat teks tersimpan'))}</summary><div class="one-res-note one-notes-body" data-format="${h(revision.contentFormat||'plain')}">${noteMarkup(revision.content,revision.contentFormat,resource.id)}</div></details>`:''}${revisionLink(revision.url)}</li>`).join('')}</ol>${!native?`<p class="one-form-hint">${h(t('A link edited at its provider may change. Supply an immutable version URL for a reviewed output.','Tautan yang diedit pada penyedia dapat berubah. Berikan URL versi tetap untuk hasil yang ditinjau.'))}</p>`:''}</section>`:''}<div class="one-res-footer">${mutateButton(t(native?'Archive resource':'Remove DWDG link',native?'Arsipkan sumber daya':'Hapus tautan DWDG'),'archive','trash',resource,`data-id="${h(resource.id)}"`,'danger')}</div></div>`;
  }
  function issueLabel(reason) {return t(...({access:['Access denied','Akses ditolak'],missing:['Not found','Tidak ditemukan'],expired:['Expired link','Tautan kedaluwarsa'],wrong:['Wrong destination','Tujuan salah']}[reason]||['Link issue','Masalah tautan']));}
  function formError() {return `<div id="one-res-error" class="one-notice error one-res-error" role="alert" tabindex="-1" ${errorCode?'':'hidden'}>${errorCode?h(errorText(errorCode)):''}</div>`;}
  function draftStatusText(note=textKinds.has(draft()?.fields.kind),issue=view().panel==='issue') {
    if(!draftSaved||['storage','conflict'].includes(errorCode))return t('Saving is unavailable. Keep this page open or copy your text.','Penyimpanan tidak tersedia. Biarkan halaman ini terbuka atau salin teks Anda.');
    if(issue)return t('Draft kept on this device.','Draf tersimpan di perangkat ini.');
    return t(note?'Draft saved on this device. Save updates the note.':'Draft saved on this device. Save updates the resource.',note?'Draf tersimpan di perangkat ini. Simpan memperbarui catatan.':'Draf tersimpan di perangkat ini. Simpan memperbarui sumber daya.');
  }
  function field(id,name,text,value,{textarea=false,rows=3,type='text',required=false}={}) {return `<div class="one-field one-res-field"><label for="${id}">${h(text)}${required?' <span aria-hidden="true">*</span>':''}</label>${textarea?`<textarea id="${id}" name="${name}" rows="${rows}" aria-describedby="one-res-error">${h(value)}</textarea>`:`<input id="${id}" name="${name}" type="${type}" value="${h(value)}" ${required?'required':''} aria-describedby="one-res-error" autocomplete="off">`}</div>`;}
  function noteMarkup(content,contentFormat,sourceId='') {
    return renderNote(content||t('No text added yet.','Belum ada teks.'),{contentFormat:contentFormat||'plain',resources:store.state.resources.filter(resource=>project(resource.projectId)),workspaceId:workspaceId(),sourceId,t,redactUnavailable:!!access});
  }
  function noteReturnButton(){return view().noteReturns?.length?button(t('Return to note','Kembali ke catatan'),'note-return','chevron-left'):'';}
  function noteSheet(resource,item=null) {
    const editing=!!item,title=resource?.title||t(item.id?'Edit note':'New note',item.id?'Edit catatan':'Catatan baru'),scope=project(resource?.projectId||item.projectId),lastEditor=resource?.updatedBy?personLabel(resource.updatedBy):t('Unknown','Tidak diketahui');
    const origin=item?.noteUI?.returnOrigin,back=editing&&origin?.noteReading?t('Back to note','Kembali ke catatan'):editing&&origin?.panel==='detail'?t('Back to details','Kembali ke detail'):t('Back to Resources','Kembali ke Sumber daya');
    return `<section class="one-res-page one-notes-sheet"><div id="one-notices"></div><header class="one-notes-header"><div class="one-notes-heading"><span>${h(label(resource?.kind||item.fields.kind))} · ${h(scope?.title||'')}</span><h2>${h(title)}</h2>${resource?`<p>${h(resourcePath(store.state.resources,resource.id)||t('Project resources','Sumber daya proyek'))} · ${h(t('Last editor','Editor terakhir'))}: ${h(lastEditor)}</p>`:''}</div><div class="one-notes-actions">${noteReturnButton()}${button(back,'close','chevron-left')}${resource?mutateButton(t('Edit note','Edit catatan'),'edit','edit',resource,`data-id="${h(resource.id)}"`,'primary')+iconButton(t('More actions','Tindakan lainnya'),'inspect','more',`data-id="${h(resource.id)}"`):''}</div></header>${editing?resourceForm(item):`<div class="one-notes-document"><article class="one-notes-body" data-format="${h(resource.contentFormat||'plain')}">${noteMarkup(resource.content,resource.contentFormat,resource.id)}</article></div><details class="one-notes-meta"><summary>${h(t('Details, related work and revisions','Detail, pekerjaan terkait, dan revisi'))}</summary>${properties(resource,{showContent:false,compact:true})}</details>`}</section>`;
  }
  function noteEditor(item) {
    const f=item.fields,mode=item.noteUI?.mode||'edit',tools=[['bold','B',t('Bold','Tebal')],['italic','I',t('Italic','Miring')],['heading','H',t('Heading','Judul bagian')],['unordered','•',t('Bulleted list','Daftar berpoin')],['ordered','1.',t('Numbered list','Daftar bernomor')]];
    return `<div class="one-notes-document"><div class="one-notes-toolbar" role="toolbar" aria-label="${h(t('Note formatting','Format catatan'))}">${tools.map(([action,symbol,text])=>`<button type="button" class="one-notes-tool" data-action="res-note-format" data-format="${action}" aria-label="${h(text)}" title="${h(text)}">${h(symbol)}</button>`).join('')}${button(t('Link','Tautan'),'note-link','external','id="one-notes-link-trigger"')}${button(t('Resource','Sumber daya'),'note-reference','folder','id="one-notes-reference-trigger"')}<div class="one-notes-mode" role="group" aria-label="${h(t('Note mode','Mode catatan'))}">${['edit','preview'].map(value=>`<button type="button" data-action="res-note-mode" data-mode="${value}" aria-pressed="${mode===value}">${h(t(value==='edit'?'Edit':'Preview',value==='edit'?'Edit':'Pratinjau'))}</button>`).join('')}</div></div><label for="one-res-content" class="one-sr-only">${h(t('Note text','Teks catatan'))}</label><textarea id="one-res-content" name="content" class="one-notes-editor" rows="12" aria-describedby="one-res-draft-status one-res-error" ${mode==='preview'?'hidden':''}>${h(f.content)}</textarea><article class="one-notes-body one-notes-preview" data-format="${h(f.contentFormat||'plain')}" aria-label="${h(t('Note preview','Pratinjau catatan'))}" ${mode==='preview'?'':'hidden'}>${noteMarkup(f.content,f.contentFormat,item.id)}</article><p class="one-form-hint">${h(t(f.contentFormat==='markdown'?'Headings, emphasis and links appear in Preview.':'Use the formatting controls, then Preview to check your note.',f.contentFormat==='markdown'?'Judul bagian, penekanan, dan tautan tampil di Pratinjau.':'Gunakan kontrol format, lalu Pratinjau untuk memeriksa catatan.'))}</p></div>`;
  }
  function resourceForm(item) {
    const f={...fields(row(item.id)),...item.fields,contentFormat:item.fields.contentFormat||'plain',contributorIds:Array.isArray(item.fields.contributorIds)?item.fields.contributorIds.filter(id=>typeof id==='string'):[]},native=nativeKinds.has(f.kind),note=textKinds.has(f.kind),name=label(f.kind),parent=row(f.parentId);
    const record=draftContext(item),editable=key=>canField(key,record),input=(id,key,text,value,options)=>editable(key)?field(id,key,text,value,options):'';
    const pickField=(id,key,text,value,selectedLabel,permissionKey=key)=>editable(permissionKey)?`<div class="one-field"><label for="${id}">${h(text)}</label>${picker(id,key,text,value,selectedLabel)}</div>`:'';
    const metadata=`${input('one-res-description','description',t('Purpose or instructions','Tujuan atau petunjuk'),f.description,{textarea:true})}${pickField('one-res-owner','owner',t('Accountable owner','Penanggung jawab utama'),f.ownerId,personLabel(f.ownerId),'ownerId')}${pickField('one-res-contributors','contributors',t('Contributors','Kontributor'),f.contributorIds.join(','),f.contributorIds.length?f.contributorIds.map(personLabel).join(', '):t('Choose contributors','Pilih kontributor'),'contributorIds')}${pickField('one-res-parent','parent',t('Folder','Folder'),f.parentId,parent?.title||t('Project resources','Sumber daya proyek'),'parentId')}${!native?input('one-res-access','accessNote',t('Provider access note','Catatan akses penyedia'),f.accessNote,{textarea:true})+input('one-res-contact','contact',t('Access contact','Kontak akses'),f.contact):''}${item.id&&f.kind!=='folder'?input('one-res-change-note','changeNote',t('Revision note','Catatan revisi'),f.changeNote):''}`;
    return `<form id="one-res-form" class="one-form one-res-form ${note?'one-notes-form':''}" novalidate>${formError()}${!note?`<p class="one-form-intro">${h(name)} · ${h(project(item.projectId)?.title||'')}</p>`:''}<div class="${note?'one-notes-document':''}">${input('one-res-title','title',t('Title','Judul'),f.title,{required:true})}</div>${note&&editable('content')?noteEditor({...item,fields:f}):note?`<div class="one-notes-document"><p class="one-notice">${h(t('Note text cannot be edited with the current reference access. Available metadata can still be updated.','Teks catatan tidak dapat diedit dengan akses referensi saat ini. Metadata yang tersedia tetap dapat diperbarui.'))}</p><article class="one-notes-body" data-format="${h(f.contentFormat||'plain')}">${noteMarkup(f.content,f.contentFormat,item.id)}</article></div>`:''}${!native?input('one-res-url','url',t('HTTPS link','Tautan HTTPS'),f.url,{required:true,type:'url'}):''}${note?`<details class="one-notes-meta" id="one-notes-metadata" ${item.noteUI?.metadataOpen?'open':''}><summary>${h(t('Note details','Detail catatan'))}</summary>${metadata}</details>`:metadata}<p id="one-res-draft-status" class="one-form-hint one-notes-draft-status">${h(draftStatusText(note,false))}</p><div class="one-form-actions one-notes-footer">${button(t('Cancel','Batal'),'cancel')}<button type="submit" class="one-button primary">${icon('check')}<span>${h(t(note?'Save note':'Save resource',note?'Simpan catatan':'Simpan sumber daya'))}</span></button></div></form>`;
  }
  function taskForm(resource) {
    taskDraft||=copy(view().taskDrafts?.[resource.id]||{resourceId:resource.id,requestId:crypto.randomUUID(),title:'',ownerId:access&&actorId!=='demo-admin'&&people().some(person=>person.id===actorId)?actorId:resource.ownerId||'',targetDate:'',priority:'normal'});
    return `<form id="one-res-task-form" class="one-form one-res-form" novalidate>${formError()}<p>${h(resource.title)}</p>${field('one-res-task-title','title',t('Task title','Judul tugas'),taskDraft.title,{required:true})}<div class="one-field"><label for="one-res-task-owner">${h(t('Assignee','Pelaksana'))}</label>${picker('one-res-task-owner','taskOwner',t('Assignee','Pelaksana'),taskDraft.ownerId,personLabel(taskDraft.ownerId))}</div>${field('one-res-task-target','targetDate',t('Target date','Tenggat'),taskDraft.targetDate,{type:'date'})}<div class="one-field"><label for="one-res-task-priority">${h(t('Priority','Prioritas'))}</label>${picker('one-res-task-priority','priority',t('Priority','Prioritas'),taskDraft.priority,taskDraft.priority==='high'?t('High','Tinggi'):taskDraft.priority==='low'?t('Low','Rendah'):t('Normal','Normal'))}</div><p class="one-form-hint">${h(t('Creates one task shared with Work and My Work.','Membuat satu tugas yang sama pada Pekerjaan dan Pekerjaan saya.'))}</p><div class="one-form-actions">${button(t('Cancel','Batal'),'back-detail')}<button type="submit" class="one-button primary">${icon('plus')}${h(t('Create task','Buat tugas'))}</button></div></form>`;
  }
  function issueForm(resource) {
    const pending=view().issueDrafts?.[resource.id]||{reason:'access',details:''};
    return `<form id="one-res-issue-form" class="one-form one-res-form">${formError()}<p>${h(resource.title)}</p><fieldset class="one-res-issue-reasons"><legend>${h(t('What happened?','Apa yang terjadi?'))}</legend>${['access','missing','expired','wrong'].map(reason=>`<label><input type="radio" name="reason" value="${reason}" ${reason===pending.reason?'checked':''}>${h(issueLabel(reason))}</label>`).join('')}</fieldset>${field('one-res-issue-details','details',t('Details','Detail'),pending.details,{textarea:true})}<p>${h(t('The resource owner can follow up. This keeps the resource and its linked tasks.','Penanggung jawab sumber daya dapat menindaklanjuti. Sumber daya dan tugas terkait tetap dipertahankan.'))}</p><p id="one-res-issue-draft-status" class="one-form-hint">${h(draftStatusText(false,true))}</p><div class="one-form-actions">${button(t('Cancel','Batal'),'back-detail')}<button type="submit" class="one-button primary">${h(t('Save report','Simpan laporan'))}</button></div></form>`;
  }
  function inspector() {
    if(!contextKey||!view().panel)return '';
    const v=view(),resource=row(v.selectedId),item=draft();if(v.panel==='form'&&!item||v.panel!=='form'&&!resource)return '';
    if(v.panel==='form'&&!canDraft(item)||v.panel==='task'&&!canTask(resource)||v.panel==='issue'&&!can('issue',resource)||v.panel==='move'&&(!can('update',resource)||!canField('parentId',resource)))return '';
    if(v.panel==='form'&&textKinds.has(item.fields.kind)||v.panel==='detail'&&v.noteReading&&textKinds.has(resource.kind))return '';
    const heading=v.panel==='form'?t(item.id?'Edit resource':'New resource',item.id?'Edit sumber daya':'Sumber daya baru'):v.panel==='task'?t('Related task','Tugas terkait'):v.panel==='issue'?t('Report link issue','Laporkan masalah tautan'):v.panel==='move'?t('Move resource','Pindahkan sumber daya'):t('Resource details','Detail sumber daya');
    let content=v.panel==='form'?resourceForm(item):v.panel==='task'?taskForm(resource):v.panel==='issue'?issueForm(resource):v.panel==='move'?`<div class="one-form">${formError()}<p>${h(resource.title)}</p><p class="one-form-hint">${h(t('Move within this project. Related task IDs and provider files stay in place.','Pindahkan dalam proyek ini. ID tugas terkait dan berkas penyedia tetap di tempatnya.'))}</p><div class="one-res-folder-destinations">${folderOptions(resource.projectId,resource.id).map(([id,text])=>button(text,'move-here','folder',`data-id="${h(id)}"`)).join('')}</div></div>`:properties(resource);
    return `<header class="one-panel-header"><div><small>${h(project(v.panel==='form'?item?.projectId:resource?.projectId)?.title||'')}</small><h2>${h(heading)}</h2></div>${noteReturnButton()}${iconButton(t('Back to Resources','Kembali ke Sumber daya'),'close','close')}</header>${content}`;
  }
  function fields(resource) {return {kind:resource?.kind||'note',title:resource?.title||'',parentId:resource?resource.parentId:view().folderId||'',description:resource?.description||'',content:resource?.content||'',contentFormat:resource?resource.contentFormat||'plain':'markdown',url:resource?.url||'',ownerId:resource?.ownerId||'',contributorIds:copy(resource?.contributorIds||[]),accessNote:resource?.accessNote||'',contact:resource?.contact||'',changeNote:''};}
  function saveDraft() {
    if(!contextKey)return true;
    const item=draft(),form=document.getElementById('one-res-form');
    if(item&&form){for(const key of ['title','description','content','url','accessNote','contact','changeNote']){const input=form.elements.namedItem(key);if(input)item.fields[key]=input.value;}const editor=form.elements.namedItem('content');if(editor){item.noteUI||={mode:'edit'};item.noteUI.scroll=window.scrollY;const metadata=form.querySelector('#one-notes-metadata');if(metadata)item.noteUI.metadataOpen=metadata.open;if(!editor.hidden)Object.assign(item.noteUI,{selectionStart:editor.selectionStart,selectionEnd:editor.selectionEnd,textareaScroll:editor.scrollTop});}}
    const taskFormElement=document.getElementById('one-res-task-form');if(taskDraft&&taskFormElement){for(const key of ['title','targetDate']){const input=taskFormElement.elements.namedItem(key);if(input)taskDraft[key]=input.value;}view().taskDrafts||={};view().taskDrafts[taskDraft.resourceId]=copy(taskDraft);}
    const issueFormElement=document.getElementById('one-res-issue-form');if(issueFormElement&&view().selectedId){view().issueDrafts||={};view().issueDrafts[view().selectedId]={reason:issueFormElement.elements.reason.value,details:issueFormElement.elements.details.value};}
    const linkForm=document.getElementById('one-notes-link-form');if(item&&linkForm){item.noteUI||={mode:'edit'};item.noteUI.linkDraft={label:linkForm.elements.label.value,url:linkForm.elements.url.value};}
    return persist();
  }
  async function startForm(kind,targetProjectId,resource=null) {
    const requestedWorkspace=workspaceId(),permitted=()=>workspaceId()===requestedWorkspace&&!!project(targetProjectId)&&(!resource||!!row(resource.id))&&can(resource?'update':'create',resource?row(resource.id):{workspaceId:requestedWorkspace,projectId:targetProjectId,ownerId:actorId});
    if(!permitted())return denied();
    saveDraft();const key=`${workspaceId()}:${targetProjectId}`,existing=drafts[key],requestedId=resource?.id||'',requestedKind=resource?.kind||kind;
    const replacesExisting=existing&&(existing.id!==requestedId||!requestedId&&existing.fields.kind!==requestedKind);
    if(replacesExisting&&!await ui.confirm({title:t('Replace the unfinished resource form?','Ganti formulir sumber daya yang belum selesai?'),message:t('This project already has an unfinished resource form. Replacing it discards that draft; saved resources stay unchanged.','Proyek ini sudah memiliki formulir sumber daya yang belum selesai. Menggantinya membuang draf tersebut; sumber daya tersimpan tetap sama.'),confirmLabel:t('Replace form','Ganti formulir'),cancelLabel:t('Keep draft','Pertahankan draf')}))return;
    if(!permitted())return denied();
    createProjectId=targetProjectId;
    if(!existing||replacesExisting){drafts[key]={workspaceId:workspaceId(),projectId:targetProjectId,id:requestedId,fields:{...fields(resource),kind:requestedKind},noteUI:{mode:'edit',returnOrigin:{panel:view().panel,selectedId:view().selectedId,noteReading:!!view().noteReading,scroll:window.scrollY}}};if(replacesExisting)view().noteReturns=(view().noteReturns||[]).filter(origin=>origin.draftKey!==key);}
    if(!resource&&access&&actorId!=='demo-admin'&&people().some(person=>person.id===actorId)&&can('create',{workspaceId:requestedWorkspace,projectId:targetProjectId,ownerId:actorId})&&(!existing||replacesExisting))drafts[key].fields.ownerId=actorId;
    view().panel='form';view().formProjectId=targetProjectId;view().noteReading=false;view().selectedId=resource?.id||'';errorCode='';persist();repaint('one-res-title');
  }
  function restoreNoteCaret(item=draft(),{restoreScroll=false,focus=true}={}) {
    const editor=document.getElementById('one-res-content'),state=copy(item?.noteUI||{});
    if(restoreScroll)window.scrollTo({top:state.scroll||0,behavior:'instant'});
    if(!editor)return;restoringNotePosition=true;try{editor.setSelectionRange(state.selectionStart??editor.value.length,state.selectionEnd??state.selectionStart??editor.value.length);editor.scrollTop=state.textareaScroll||0;
      if(focus){if(editor.hidden){const preview=document.querySelector('.one-notes-preview');preview?.setAttribute('tabindex','-1');preview?.focus({preventScroll:true});}else editor.focus({preventScroll:true});}
    }finally{restoringNotePosition=false;}
  }
  function applyNoteSelection(action,param) {
    const item=draft();if(!item||!textKinds.has(item.fields.kind))return false;if(!requireDraft(item)||!canField('content',draftContext(item)))return denied();const state=item.noteUI||{},result=formatSelection(item.fields.content,state.selectionStart??0,state.selectionEnd??0,action,param);
    item.fields.content=result.text;item.fields.contentFormat='markdown';item.noteUI={...state,mode:'edit',selectionStart:result.selectionStart,selectionEnd:result.selectionEnd};errorCode='';persist();repaint();restoreNoteCaret(item);return true;
  }
  function openNoteLink(anchor) {
    const item=draft();if(!item||!requireDraft(item)||!canField('content',draftContext(item)))return;saveDraft();const state=item.noteUI||{},selected=item.fields.content.slice(state.selectionStart||0,state.selectionEnd||0),pending=state.linkDraft||{label:selected,url:''};
    const sourceContext=contextKey,sourceWorkspace=workspaceId(),stillHere=()=>contextKey===sourceContext&&workspaceId()===sourceWorkspace&&draft()===item&&canDraft(item)&&canField('content',draftContext(item));
    const panel=ui.open({kind:'dialog',anchor,title:t('Insert HTTPS link','Sisipkan tautan HTTPS'),content:`<form id="one-notes-link-form" class="one-form" novalidate><div id="one-notes-link-error" class="one-notice error" role="alert" hidden></div><div class="one-field"><label for="one-notes-link-label">${h(t('Link text','Teks tautan'))}</label><input id="one-notes-link-label" name="label" value="${h(pending.label)}"></div><div class="one-field"><label for="one-notes-link-url">${h(t('HTTPS URL','URL HTTPS'))}</label><input id="one-notes-link-url" name="url" type="url" value="${h(pending.url)}" aria-describedby="one-notes-link-error" required></div><div class="one-form-actions"><button type="button" class="one-button" data-overlay-action="cancel-note-link">${h(t('Cancel','Batal'))}</button><button type="button" class="one-button primary" data-overlay-action="insert-note-link">${h(t('Insert link','Sisipkan tautan'))}</button></div></form>`,onAction:async action=>{
      if(action==='cancel-note-link'){if(!stillHere())return;saveDraft();await ui.close(true,{waitForExit:false});if(stillHere())restoreNoteCaret(item);return;}
      if(action!=='insert-note-link')return;if(!stillHere()){denied();return;}saveDraft();const form=panel.querySelector('form');try{const url=safeResourceURL(form.elements.url.value),label=form.elements.label.value.trim()||url;await ui.close(true,{waitForExit:false});if(!stillHere()||!applyNoteSelection('link',{url,label}))return;delete item.noteUI.linkDraft;persist();}catch(error){const notice=panel.querySelector('#one-notes-link-error');notice.hidden=false;notice.textContent=errorText('url');form.elements.url.setAttribute('aria-invalid','true');form.elements.url.focus({preventScroll:true});}
    }});requestAnimationFrame(()=>panel.querySelector('#one-notes-link-url')?.focus({preventScroll:true}));
  }
  function openNoteReference(anchor) {
    const item=draft();if(!item||!requireDraft(item)||!canField('content',draftContext(item)))return;saveDraft();
    const sourceContext=contextKey,sourceWorkspace=workspaceId(),stillHere=()=>contextKey===sourceContext&&workspaceId()===sourceWorkspace&&draft()===item&&canDraft(item)&&canField('content',draftContext(item));
    const available=()=>store.state.resources.filter(resource=>resource.workspaceId===workspaceId()&&!resource.archived&&resource.id!==item.id&&project(resource.projectId));
    const options=query=>available().filter(resource=>[resource.title,label(resource.kind),project(resource.projectId)?.title].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(resource=>`<button type="button" class="one-select-option" role="option" aria-selected="false" tabindex="-1" data-overlay-action="insert-note-reference" data-value="${h(resource.id)}"><span>${h(resource.title)}<small>${h(project(resource.projectId)?.title||'')} · ${h(label(resource.kind))}</small></span></button>`).join('');
    const panel=ui.open({kind:'popover',anchor,title:t('Link an existing resource','Tautkan sumber daya yang ada'),content:`<label class="one-menu-search">${icon('search')}<input id="one-notes-reference-search" type="search" aria-label="${h(t('Find a resource','Cari sumber daya'))}" placeholder="${h(t('Find a resource…','Cari sumber daya…'))}"></label><div id="one-notes-reference-options" role="listbox" aria-label="${h(t('Resources in this workspace','Sumber daya di ruang kerja ini'))}">${options('')}</div><p id="one-notes-reference-empty" class="one-form-hint" hidden>${h(t('No available resource matches.','Tidak ada sumber daya tersedia yang cocok.'))}</p>`,onAction:async(action,target)=>{if(action!=='insert-note-reference')return;if(!stillHere()){denied();return;}const resource=available().find(resource=>resource.id===target.dataset.value);if(!resource){onNotice('reference',errorText('reference'));return;}await ui.close(true,{waitForExit:false});if(!stillHere())return;const current=available().find(item=>item.id===resource.id);if(!current){denied();return;}applyNoteSelection('reference',{id:current.id,label:current.title});}});panel.classList.add('one-select-popover','one-notes-reference-picker');
    const search=panel.querySelector('input'),list=panel.querySelector('[role="listbox"]');search.addEventListener('input',()=>{list.innerHTML=options(search.value);panel.querySelector('#one-notes-reference-empty').hidden=!!list.children.length;});
    panel.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||event.target===search&&['Home','End'].includes(event.key))return;const controls=[...list.querySelectorAll('[role="option"]')];if(!controls.length)return;event.preventDefault();const index=controls.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?controls.length-1:(index+(event.key==='ArrowDown'?1:-1)+controls.length)%controls.length;controls.forEach((control,i)=>control.tabIndex=i===next?0:-1);controls[next].focus();});requestAnimationFrame(()=>search.focus());
  }
  function openNoteReferenceTarget(id,anchor) {
    const target=row(id);if(!target){onNotice('reference',errorText('reference'));return;}saveDraft();const source=row(view().selectedId),item=view().panel==='form'?draft():null;
    if(!source&&!item)return;const references=[...document.querySelectorAll('[data-action="res-note-open-ref"]')].filter(control=>control.dataset.id===id),origin={workspaceId:workspaceId(),sourceId:source?.id||item.id,sourceProjectId:source?.projectId||item.projectId,draftKey:item?`${workspaceId()}:${item.projectId}`:'',editing:!!item,reading:!!view().noteReading,scroll:window.scrollY,referenceId:id,referenceIndex:Math.max(0,references.indexOf(anchor))};
    view().noteReturns||=[];view().noteReturns.push(origin);view().selectedId=target.id;view().panel='detail';view().noteReading=textKinds.has(target.kind);createProjectId=target.projectId;errorCode='';persist();repaint();window.scrollTo({top:0,behavior:'instant'});if(view().noteReading)focusControl('.one-notes-header [data-action="res-close"]',{reveal:false});else enterInspector();
  }
  function returnToNote() {
    saveDraft();const origin=view().noteReturns?.pop();if(!origin||origin.workspaceId!==workspaceId())return;const item=origin.draftKey?drafts[origin.draftKey]:null,source=row(origin.sourceId);
    if(origin.editing&&(!item||!canDraft(item))||!origin.editing&&!source){view().panel='';view().selectedId='';view().noteReading=false;view().noteReturns=[];errorCode='access';persist();repaint('one-res-search');return;}
    createProjectId=origin.sourceProjectId;view().formProjectId=origin.sourceProjectId;view().selectedId=origin.sourceId;view().panel=origin.editing?'form':'detail';view().noteReading=origin.reading;errorCode='';persist();repaint();window.scrollTo({top:origin.scroll||0,behavior:'instant'});if(item)restoreNoteCaret(item);else {const references=[...document.querySelectorAll('[data-action="res-note-open-ref"]')].filter(control=>control.dataset.id===origin.referenceId);if(!focusControl(references[origin.referenceIndex||0]))focusDetailAction('edit');}
  }
  function folderOptions(targetProjectId,currentId='') {
    const excluded=new Set([currentId,...resourceDescendants(store.state.resources,currentId).map(item=>item.id)]);
    return [['',t('Project resources','Sumber daya proyek')],...store.state.resources.filter(item=>item.workspaceId===workspaceId()&&item.projectId===targetProjectId&&item.kind==='folder'&&!item.archived&&!excluded.has(item.id))
      .map(item=>[item.id,[resourcePath(store.state.resources,item.id),item.title].filter(Boolean).join(' / ')])];
  }
  function menu(anchor,title,options,onChoose,multiple=false,selected=[]) {
    const id=anchor?.id||'one-res-menu',menuContext=contextKey,menuWorkspace=workspaceId();anchor?.setAttribute('aria-expanded','true');
    const panel=ui.open({kind:'popover',anchor,title,content:`<div class="one-select-menu" id="${h(id)}-options" role="listbox" aria-label="${h(title)}" ${multiple?'aria-multiselectable="true"':''}>${options.map(([value,text])=>`<button type="button" class="one-select-option ${selected.includes(value)?'selected':''}" role="option" aria-selected="${selected.includes(value)}" tabindex="${selected.includes(value)?0:-1}" data-overlay-action="resource-option" data-value="${h(value)}"><span>${h(text)}</span><span class="one-option-check">${selected.includes(value)?icon('check'):''}</span></button>`).join('')}</div>`,onAction:async(action,target)=>{
      if(action!=='resource-option'||contextKey!==menuContext||workspaceId()!==menuWorkspace)return;if(multiple){if(onChoose(target.dataset.value)===false)return;const checked=target.getAttribute('aria-selected')!=='true';target.setAttribute('aria-selected',String(checked));target.classList.toggle('selected',checked);target.querySelector('.one-option-check').innerHTML=checked?icon('check'):'';return;}
      await ui.close(true,{waitForExit:false});if(contextKey!==menuContext||workspaceId()!==menuWorkspace)return;anchor?.setAttribute('aria-expanded','false');onChoose(target.dataset.value);document.getElementById(id)?.focus({preventScroll:true});
    }});
    panel.classList.add('one-select-popover','one-res-popover');
    const Observer=document.defaultView?.MutationObserver;
    if(Observer){const observer=new Observer(()=>{if(!panel.isConnected||panel.closest('.ux-leaving')){anchor?.setAttribute('aria-expanded','false');observer.disconnect();menuObservers.delete(observer);}});observer.observe(panel.parentElement,{attributes:true,attributeFilter:['class'],childList:true});menuObservers.add(observer);}
    const optionsElements=[...panel.querySelectorAll('[role="option"]')],active=optionsElements.findIndex(item=>item.getAttribute('aria-selected')==='true');
    let index=Math.max(0,active);if(optionsElements[index]){optionsElements[index].tabIndex=0;requestAnimationFrame(()=>optionsElements[index]?.focus({preventScroll:true}));}
    panel.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();index=event.key==='Home'?0:event.key==='End'?optionsElements.length-1:(index+(event.key==='ArrowDown'?1:-1)+optionsElements.length)%optionsElements.length;optionsElements.forEach((item,i)=>item.tabIndex=i===index?0:-1);optionsElements[index]?.focus();}if(event.key==='Tab'){ui.close(true,{waitForExit:false});anchor?.setAttribute('aria-expanded','false');}});
    return panel;
  }
  function openAdd(anchor,targetProjectId=projectId||row(view().folderId)?.projectId||'') {
    if(!targetProjectId){const projects=getProjectState().projects.filter(item=>item.workspaceId===workspaceId()&&!['archived','cancelled'].includes(item.status));
      const permitted=projects.filter(item=>can('create',projectContext(item)));if(!permitted.length){if(projects.length)denied();else onNotice('workspace',t('Create a project before adding resources.','Buat proyek sebelum menambahkan sumber daya.'));return;}
      menu(anchor,t('Choose a project','Pilih proyek'),permitted.map(item=>[item.id,item.title]),value=>openAdd(document.getElementById(anchor.id)||anchor,value));return;
    }
    if(!project(targetProjectId)||!requireAction('create',{workspaceId:workspaceId(),projectId:targetProjectId,ownerId:actorId}))return;
    menu(anchor,t('Add resource','Tambah sumber daya'),Object.entries(RESOURCE_KINDS).map(([kind])=>[kind,label(kind)]),kind=>startForm(kind,targetProjectId));
  }
  function openPicker(anchor) {
    const key=anchor.dataset.key,item=draft(),resource=row(view().selectedId),permissionKey={owner:'ownerId',contributors:'contributorIds',parent:'parentId'}[key];
    if(key!=='filter'&&(!['taskOwner','priority'].includes(key)?!requireDraft(item)||permissionKey&&!canField(permissionKey,draftContext(item)):!canTask(resource)))return denied();
    saveDraft();let options=[],selected=[anchor.dataset.value];
    if(key==='filter')options=[['all',t('All types','Semua jenis')],...Object.entries(RESOURCE_KINDS).map(([kind])=>[kind,label(kind)])];
    if(['owner','taskOwner','contributors'].includes(key))options=[...(key==='contributors'?[]:[['',t('Unassigned','Belum ditugaskan')]]),...people().map(person=>[person.id,person.name])];
    if(key==='taskOwner'&&access)options=options.filter(([ownerId])=>access.can('task','create',{workspaceId:workspaceId(),projectId:resource.projectId,ownerId}));
    if(key==='parent')options=folderOptions(item.projectId,item.id);
    if(key==='priority')options=[['low',t('Low','Rendah')],['normal',t('Normal','Normal')],['high',t('High','Tinggi')]];
    if(key==='contributors')selected=item.fields.contributorIds;
    menu(anchor,anchor.getAttribute('aria-label'),options,value=>{
      if(key==='filter'){view().kind=value;persist();repaint();return;}
      if(['taskOwner','priority'].includes(key)){if(!canTask(row(view().selectedId)))return denied();if(key==='taskOwner'&&access&&!access.can('task','create',{workspaceId:workspaceId(),projectId:resource.projectId,ownerId:value}))return denied();}
      else if(!requireDraft(item)||permissionKey&&!canField(permissionKey,draftContext(item)))return denied();
      if(key==='owner')item.fields.ownerId=value;
      if(key==='parent')item.fields.parentId=value;
      if(key==='taskOwner')taskDraft.ownerId=value;
      if(key==='priority')taskDraft.priority=value;
      if(key==='contributors'){const ids=item.fields.contributorIds;item.fields.contributorIds=ids.includes(value)?ids.filter(id=>id!==value):[...ids,value];persist();const el=document.getElementById(anchor.id);if(el){el.dataset.value=item.fields.contributorIds.join(',');el.querySelector('span').textContent=item.fields.contributorIds.length?item.fields.contributorIds.map(personLabel).join(', '):t('Choose contributors','Pilih kontributor');}return;}
      persist();repaint();
    },key==='contributors',selected);
  }
  async function submitResource() {
    const item=draft(),submitContext=contextKey,submitWorkspace=workspaceId();if(!item)return;if(!requireDraft(item))return;if(!saveDraft())return;
    try{
      const resource=store.saveResource(workspaceId(),item.projectId,item.fields,item.id,{viewKey:contextKey,viewState:copy(view())});
      drafts=copy(store.state.drafts);views=copy(store.state.views);createProjectId=resource.projectId;draftSaved=true;errorCode='';
      onNotice('','');feedback(t('Resource saved.','Sumber daya tersimpan.'));repaint();focusDetailAction('edit');
    }
    catch(error){if(error.code==='collision'){const yes=await ui.confirm({title:t('Matching title','Judul sama'),message:t('Another resource has this title in the same folder. Save this as a separate resource?','Sumber daya lain memiliki judul ini di folder yang sama. Simpan sebagai sumber daya terpisah?'),confirmLabel:t('Save separately','Simpan terpisah')});if(yes){if(contextKey!==submitContext||workspaceId()!==submitWorkspace||draft()!==item||!requireDraft(item))return;item.fields.allowDuplicate=true;return submitResource();}}report(error);}
  }
  async function submitTask() {
    const resource=row(view().selectedId),submitContext=contextKey,submitWorkspace=workspaceId(),submittedDraft=taskDraft;if(!resource||!taskDraft)return;if(!canTask(resource)||access&&!access.can('task','create',{workspaceId:workspaceId(),projectId:resource.projectId,ownerId:taskDraft.ownerId}))return denied();saveDraft();
    try{if(!taskDraft.title.trim()){const error=new Error('title');error.code='title';throw error;}if(typeof onTaskCreate!=='function')throw new Error('Task creation is not integrated.');
      await onTaskCreate({workspaceId:workspaceId(),projectId:resource.projectId,resourceId:resource.id,...copy(taskDraft)});if(contextKey!==submitContext||workspaceId()!==submitWorkspace||taskDraft!==submittedDraft||!row(resource.id)||!canTask(row(resource.id)))return;delete view().taskDrafts?.[resource.id];taskDraft=null;view().panel='detail';errorCode='';persist();feedback(t('Related task created.','Tugas terkait dibuat.'),{undo:false});repaint();focusDetailAction('task');
    }catch(error){report(error);}
  }
  function download(text,filename,type) {
    if(typeof URL.createObjectURL!=='function'){ui.open({title:t('Export text','Teks ekspor'),content:`<p>${h(t('Copy this export text.','Salin teks ekspor ini.'))}</p><textarea class="one-res-export-text" rows="15" readonly aria-label="${h(t('Export text','Teks ekspor'))}">${h(text)}</textarea>`});return;}
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function undoChange(changedWorkspaceId=workspaceId()) {
    if(access&&!access.isDefault&&!store.canUndo(changedWorkspaceId)){denied();return;}
    const currentWorkspace=workspaceId(),candidateId=changedWorkspaceId===currentWorkspace?(view().selectedId||view().inspectorReturn?.selectedId||''):'';
    try{if(!store.undo(changedWorkspaceId))return;if(changedWorkspaceId===currentWorkspace){view().panel='';view().selectedId='';errorCode='';persist();}repaint();
      if(changedWorkspaceId===currentWorkspace)focusControl(document.getElementById(`one-res-row-${candidateId}`)||document.getElementById('one-res-search'));
      feedback(t('Resource change undone.','Perubahan sumber daya diurungkan.'),{undo:false});
    }catch(error){report(error);}
  }
  async function handleAction(action,target,event) {
    if(!action?.startsWith('res-'))return false;const name=action.slice(4),id=target?.dataset.id||'',resource=row(id||view().selectedId);
    const permission={edit:'update',pin:'pin',move:'update','move-here':'update',archive:'archive',issue:'issue','resume-issue':'issue','export-note':'export'}[name];
    if(permission&&!resource){denied();return true;}if(permission&&!requireAction(permission,resource))return true;
    if(['move','move-here'].includes(name)&&!canField('parentId',resource)){denied();return true;}
    if(name==='resolve-issue'){const issue=store.state.issues.find(item=>item.id===id),subject=issue&&row(issue.resourceId);if(!subject){denied();return true;}if(!requireAction('issue',subject))return true;}
    if(name==='task'&&!canTask(resource)){denied();return true;}
    if(name==='export'&&!canExport()){denied();return true;}
    if(name==='note-format'){saveDraft();try{applyNoteSelection(target.dataset.format);}catch(error){report(error);}return true;}
    if(name==='note-mode'){const item=draft();if(item&&requireDraft(item)){saveDraft();item.noteUI||={};item.noteUI.mode=target.dataset.mode==='preview'?'preview':'edit';persist();repaint();restoreNoteCaret(item);}return true;}
    if(name==='note-link'){openNoteLink(target);return true;}
    if(name==='note-reference'){openNoteReference(target);return true;}
    if(name==='note-open-ref'){openNoteReferenceTarget(id,target);return true;}
    if(name==='note-return'){returnToNote();return true;}
    if(name==='add'){if(!target.id)target.id='one-res-add';openerId=target.id;openAdd(target);}
    if(name==='picker')openPicker(target);
    if(name==='open'||name==='inspect'||name==='open-note'){
      if(!resource){denied();return true;}saveDraft();openerId=target.id||`one-res-row-${resource.id}`;errorCode='';createProjectId=resource.projectId;
      const opensInspector=name==='inspect'||!textKinds.has(resource.kind)&&!(name==='open'&&resource.kind==='folder');
      if(opensInspector&&!view().panel)view().inspectorReturn={contextKey,scroll:window.scrollY,openerId,folderId:view().folderId,query:view().query,kind:view().kind,selectedId:resource.id};
      if(!opensInspector&&(!view().panel||name==='open'&&resource.kind==='folder'))delete view().inspectorReturn;
      if(textKinds.has(resource.kind)&&name!=='inspect'&&!view().noteReading&&(name!=='open-note'||!view().noteExplorer||view().inspectorReturn))view().noteExplorer=copy(view().inspectorReturn||{scroll:window.scrollY,folderId:view().folderId,query:view().query,kind:view().kind,selectedId:resource.id});
      view().selectedId=resource.id;view().noteReading=name!=='inspect'&&textKinds.has(resource.kind);
      if(name==='open'&&resource.kind==='folder'){view().folderId=resource.id;view().panel='';}else view().panel='detail';
      persist();repaint(name==='open'&&resource.kind==='folder'?'one-res-search':'');if(opensInspector)enterInspector();else if(view().noteReading){window.scrollTo({top:0,behavior:'instant'});focusControl('.one-notes-header [data-action="res-close"]',{reveal:false});}
    }
    if(name==='folder'){if(id&&(!row(id)||row(id).kind!=='folder')){denied();return true;}saveDraft();view().folderId=id;view().panel='';view().query='';view().kind='all';persist();repaint('one-res-search');}
    if(name==='edit'&&resource)await startForm(resource.kind,resource.projectId,resource);
    if(name==='resume'){const pending=drafts[`${workspaceId()}:${target.dataset.project}`];if(!requireDraft(pending))return true;createProjectId=target.dataset.project;view().formProjectId=createProjectId;view().panel='form';view().selectedId=draft()?.id||'';view().noteReading=false;errorCode='';persist();repaint('one-res-title');if(draft()?.noteUI)restoreNoteCaret(draft(),{restoreScroll:true});}
    if(name==='close'){
      saveDraft();const closeContext=contextKey,closeWorkspace=workspaceId(),item=view().panel==='form'?draft():null,origin=item&&textKinds.has(item.fields.kind)?item.noteUI?.returnOrigin:null,savedReturn=view().inspectorReturn,inspectorReturn=savedReturn&&(!savedReturn.contextKey||savedReturn.contextKey===contextKey)?savedReturn:null,explorer=inspectorReturn||view().noteExplorer;
      await ui.close(true,{waitForExit:false});if(contextKey!==closeContext||workspaceId()!==closeWorkspace)return true;
      view().panel=origin?.panel==='detail'?'detail':'';view().noteReading=origin?.panel==='detail'&&!!origin.noteReading;view().selectedId=origin?.selectedId||view().selectedId;view().noteReturns=[];errorCode='';
      if(!origin&&explorer)Object.assign(view(),{folderId:explorer.folderId,query:explorer.query,kind:explorer.kind,selectedId:explorer.selectedId});
      const returningToExplorer=!view().panel;if(returningToExplorer)delete view().inspectorReturn;
      const destination=returningToExplorer?(inspectorReturn?.openerId||openerId||(item&&!item.id?'one-res-add':'one-res-search')):'';
      persist();repaint();window.scrollTo({top:origin?.scroll??explorer?.scroll??view().scroll,behavior:'instant'});if(returningToExplorer)focusControl(document.getElementById(destination));else focusDetailAction('edit');
    }
    if(name==='cancel'){const item=draft(),cancelContext=contextKey,cancelWorkspace=workspaceId();if(item){if(!requireDraft(item))return true;const original=item.id?row(item.id):null,isDirty=JSON.stringify(item.fields)!==JSON.stringify(fields(original));if(isDirty&&!await ui.confirm({title:t('Discard this form?','Buang formulir ini?'),message:t('Saved resource revisions are kept. Only this unfinished form will be removed.','Revisi sumber daya tersimpan tetap dipertahankan. Hanya formulir yang belum selesai ini yang dihapus.'),confirmLabel:t('Discard form','Buang formulir')}))return true;if(contextKey!==cancelContext||workspaceId()!==cancelWorkspace||!requireDraft(item))return true;delete drafts[`${workspaceId()}:${item.projectId}`];}view().selectedId=item?.id||item?.noteUI?.returnOrigin?.selectedId||view().selectedId;view().panel=item?.id?'detail':'';view().noteReading=!!item?.id&&textKinds.has(item.fields.kind)&&!!item.noteUI?.returnOrigin?.noteReading;errorCode='';persist();repaint();if(view().panel)focusDetailAction('edit');else focusControl(document.getElementById(openerId)||document.getElementById('one-res-add'));}
    if(name==='pin'&&resource){try{const changed=store.togglePin(workspaceId(),resource.id);feedback(t(changed.pinned?'Resource pinned.':'Pin removed.',changed.pinned?'Sumber daya disematkan.':'Sematan dilepas.'));repaint();}catch(error){report(error);}}
    if(name==='task'&&resource){saveDraft();taskDraft=null;view().detailAction='task';view().panel='task';errorCode='';persist();repaint('one-res-task-title');}
    if(name==='back-detail'){saveDraft();view().panel='detail';errorCode='';persist();repaint();focusDetailAction(view().detailAction||'edit');}
    if(name==='move'&&resource){saveDraft();view().detailAction='move';view().panel='move';errorCode='';persist();repaint();focusControl('#one-inspector [data-action="res-move-here"]');}
    if(name==='move-here'&&resource){try{store.saveResource(workspaceId(),resource.projectId,{...resource,parentId:id},resource.id);view().panel='detail';feedback(t('Resource moved.','Sumber daya dipindahkan.'));repaint();focusDetailAction('move');}catch(error){report(error);}}
    if(name==='archive'&&resource){const requestedWorkspace=workspaceId();const descendants=resource.kind==='folder'?resourceDescendants(store.state.resources,resource.id).filter(item=>!item.archived):[],linked=getProjectState().tasks.filter(task=>[resource.id,...descendants.map(item=>item.id)].includes(task.resourceId));
      const yes=await ui.confirm({title:t(nativeKinds.has(resource.kind)?'Archive resource?':'Remove this link?',nativeKinds.has(resource.kind)?'Arsipkan sumber daya?':'Hapus tautan ini?'),message:`${resource.title}${descendants.length?' · '+descendants.length+' '+t('contained resources','sumber daya di dalamnya'):''}${linked.length?' · '+linked.length+' '+t('related tasks remain linked','tugas terkait tetap tertaut'):''}. ${t('You can Undo. External provider files are unchanged.','Anda dapat mengurungkan. Berkas penyedia eksternal tetap sama.')}`,confirmLabel:t('Archive','Arsipkan')});
      if(yes)try{const current=row(resource.id);if(workspaceId()!==requestedWorkspace||!current||!requireAction('archive',current))return true;store.archive(requestedWorkspace,resource.id);view().panel='';view().selectedId='';if([resource.id,...descendants.map(item=>item.id)].includes(view().folderId))view().folderId='';feedback(t('Resource archived.','Sumber daya diarsipkan.'));persist();repaint('one-res-search');}catch(error){report(error);}}
    if((name==='issue'||name==='resume-issue')&&resource){saveDraft();view().selectedId=resource.id;createProjectId=resource.projectId;view().detailAction='issue';view().panel='issue';errorCode='';persist();repaint('one-res-issue-details');}
    if(name==='resolve-issue')try{store.resolveIssue(workspaceId(),id);feedback(t('Link issue resolved.','Masalah tautan diselesaikan.'));repaint();}catch(error){report(error);}
    if(name==='undo')undoChange();
    if(name==='clear'){view().query='';view().kind='all';persist();repaint('one-res-search');}
    if(name==='export'){try{download(JSON.stringify(store.export(workspaceId(),projectId),null,2),'dwdg-one-resources.json','application/json');}catch(error){report(error);}}
    if(name==='export-note'&&resource)try{const exported=store.export(workspaceId(),resource.projectId).resources.find(item=>item.id===resource.id);if(!exported){denied();return true;}download(`# ${exported.title}\n\n${exported.content}\n`,`${exported.title.replace(/[<>:"/\\|?*]/g,'-')||'note'}.md`,'text/markdown;charset=utf-8');}catch(error){report(error);}
    return true;
  }
  function handleInput(event) {
    const target=event.target;if(target.id==='one-res-search'){view().query=target.value;persist();repaint('one-res-search');return true;}
    if(target.closest?.('#one-res-form,#one-res-task-form,#one-res-issue-form,#one-notes-link-form')){errorCode='';target.removeAttribute('aria-invalid');saveDraft();const status=document.getElementById('one-res-draft-status')||document.getElementById('one-res-issue-draft-status');if(status)status.textContent=draftStatusText();return true;}return false;
  }
  function handleSubmit(event) {
    if(event.target.id==='one-notes-link-form'){event.preventDefault();event.target.querySelector('[data-overlay-action="insert-note-link"]')?.click();return true;}
    if(event.target.id==='one-res-form'){event.preventDefault();submitResource();return true;}
    if(event.target.id==='one-res-task-form'){event.preventDefault();submitTask();return true;}
    if(event.target.id==='one-res-issue-form'){event.preventDefault();const resource=row(view().selectedId);if(!resource){denied();return true;}if(!requireAction('issue',resource))return true;saveDraft();try{const form=event.target;store.reportIssue(workspaceId(),resource.id,form.elements.reason.value,form.elements.details.value);delete view().issueDrafts?.[resource.id];view().panel='detail';errorCode='';persist();feedback(t('Link issue recorded.','Masalah tautan dicatat.'));repaint();focusDetailAction('issue');}catch(error){report(error);}return true;}return false;
  }
  function contextmenu(event) {const resourceElement=event.target.closest?.('[data-resource-id]');if(!resourceElement||!document.getElementById('one-content')?.contains(resourceElement))return;event.preventDefault();handleAction('res-inspect',{dataset:{id:resourceElement.dataset.resourceId},id:event.target.closest?.('button[id]')?.id||`one-res-row-${resourceElement.dataset.resourceId}`},event);}
  function keydown(event) {if(event.target.closest?.('[data-action="res-picker"]')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openPicker(event.target.closest('[data-action="res-picker"]'));return;}if(event.key==='Escape'&&!ui.isOpen()&&contextKey&&view().panel){event.preventDefault();handleAction('res-close',{dataset:{}});}if(event.key==='F10'&&event.shiftKey){const resourceElement=event.target.closest?.('[data-resource-id]');if(resourceElement){event.preventDefault();handleAction('res-inspect',{dataset:{id:resourceElement.dataset.resourceId},id:event.target.closest?.('button[id]')?.id||`one-res-row-${resourceElement.dataset.resourceId}`},event);}}}
  function focusin(event){if(suppressFocusReveal||!contextKey)return;const control=event.target,inResources=control.closest?.('.one-res-page')||view().panel&&control.closest?.('#one-inspector');if(inResources)revealFocusedControl(control);}
  function notePosition(event){if(!restoringNotePosition&&event.target.id==='one-res-content')saveDraft();}
  function noteDisclosure(event){if(event.target.id!=='one-notes-metadata'||view().panel!=='form')return;const item=draft();if(!item)return;item.noteUI||={mode:'edit'};if(item.noteUI.metadataOpen===event.target.open)return;item.noteUI.metadataOpen=event.target.open;persist();}
  document.addEventListener('contextmenu',contextmenu);document.addEventListener('keydown',keydown);document.addEventListener('focusin',focusin);document.addEventListener('select',notePosition);document.addEventListener('scroll',notePosition,true);document.addEventListener('toggle',noteDisclosure,true);
  return {render,inspector,handleAction,handleInput,handleSubmit,saveDraft,
    hasProjectResources:targetProjectId=>rawStore.state.resources.some(resource=>resource.projectId===targetProjectId),
    refreshScope(){drafts=copy(store.state.drafts);views=copy(store.state.views);taskDraft=null;openerId='';createProjectId='';errorCode='';if(contextKey){const v=view();v.panel='';v.noteReading=false;v.selectedId='';v.noteReturns=[];delete v.inspectorReturn;delete v.noteExplorer;delete v.formProjectId;}},
    get hasInspector(){return !!contextKey&&!!view().panel&&!!inspector();},get store(){return store;},
    canUndo:()=>store.canUndo(workspaceId()),undo:undoChange,
    close(){if(!contextKey)return;saveDraft();view().panel='';persist();},
    destroy(){if(destroyed)return;saveDraft();destroyed=true;menuObservers.forEach(observer=>observer.disconnect());menuObservers.clear();document.removeEventListener('contextmenu',contextmenu);document.removeEventListener('keydown',keydown);document.removeEventListener('focusin',focusin);document.removeEventListener('select',notePosition);document.removeEventListener('scroll',notePosition,true);document.removeEventListener('toggle',noteDisclosure,true);}
  };
}
