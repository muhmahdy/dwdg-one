import {applyTask,taskError,projectError,eventError,deleteTask,uid,iso,addDays,validDate,DIVISIONS,STATUSES,progress} from './model.mjs';
import {DIVISION_SCHEMAS,EXTRA_SCHEMAS,GROUP_FOR,STAGE_TRANSLATIONS} from './experience-records.mjs';
import {RECORD_SCHEMAS,emptyExtras,putAttachment,getAttachment,removeAttachment} from './experience-data.mjs';
import {ERROR_TRANSLATIONS,translateError} from './experience-i18n.mjs';

const EDITOR_ERRORS={
  'The due date must be on or after the start date.':'Tenggat harus sama dengan atau setelah tanggal mulai.',
  'Choose a project.':'Pilih proyek.',
  'Choose a valid priority.':'Pilih prioritas yang valid.',
  'Clear dependent task links before moving this task to another project.':'Hapus tautan tugas yang bergantung sebelum memindahkan tugas ini ke proyek lain.',
  'Choose a dependency from the same project.':'Pilih prasyarat dari proyek yang sama.',
  'These dependencies form a loop. Choose a different task.':'Prasyarat ini membentuk lingkaran. Pilih tugas lain.',
  'Complete the dependency before completing this task.':'Selesaikan tugas prasyarat sebelum menyelesaikan tugas ini.',
  'Reopen the completed dependent task first.':'Buka kembali tugas turunan yang sudah selesai terlebih dahulu.',
  'Give this project a name.':'Beri nama proyek ini.',
  'Choose a division.':'Pilih divisi.',
  'Choose a project lead.':'Pilih ketua proyek.',
  'Give this event a title.':'Beri judul rapat ini.',
  'Choose a valid date and time.':'Pilih tanggal dan waktu yang valid.',
  'Duration must be between 15 and 480 minutes.':'Durasi harus antara 15 dan 480 menit.',
  'Browser storage is unavailable. Your change was not saved.':'Penyimpanan peramban tidak tersedia. Perubahan belum tersimpan.',
  'Browser storage is full or unavailable. Your change was not saved.':'Penyimpanan peramban penuh atau tidak tersedia. Perubahan belum tersimpan.',
  'Choose a file.':'Pilih berkas.',
  'Choose a file no larger than 10 MB.':'Pilih berkas berukuran maksimal 10 MB.',
  'This file is empty.':'Berkas ini kosong.',
  'This attachment is unavailable on this device. The document metadata is still saved.':'Lampiran ini tidak tersedia di perangkat ini. Informasi dokumen tetap tersimpan.',
  'Local file storage is unavailable in this browser.':'Penyimpanan berkas lokal tidak tersedia di peramban ini.',
  'Could not open local file storage.':'Penyimpanan berkas lokal tidak dapat dibuka.',
  'The local file could not be saved or loaded. Storage may be full.':'Berkas lokal tidak dapat disimpan atau dimuat. Penyimpanan mungkin penuh.',
};

/** Editors share the application's live local store and its one overlay owner. */
export function createEditors(ctx) {
  const {store,ui,t,icon,escapeHtml:h,notify,navigate,formatDate}=ctx;
  const savingPanels=new WeakSet();
  const clone=value=>structuredClone(value);
  const me=()=>store.core.profile.memberId;
  const nameOf=id=>store.core.members.find(row=>row.id===id)?.name||t('Unassigned','Belum ditugaskan');
  const projectOf=id=>store.core.projects.find(row=>row.id===id);
  const translated=value=>t(value,STAGE_TRANSLATIONS[value]||value);
  const date=value=>value?formatDate(String(value).slice(0,10)):t('Not set','Belum ditentukan');
  const shortInitials=name=>String(name).trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  const safeUrl=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}};
  const button=(label,action,extra='',variant='')=>`<button type="button" class="button ${variant}" data-overlay-action="${h(action)}" ${extra}>${label}</button>`;
  const link=(url,label)=>safeUrl(url)?`<a class="button" href="${h(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${icon('external')}${h(label||url)}</a>`:'';
  const props=rows=>`<dl class="inspector-properties">${rows.map(([label,value])=>`<dt>${h(label)}</dt><dd>${value||'—'}</dd>`).join('')}</dl>`;
  const section=(label,content)=>content?`<section class="inspector-section"><h3>${h(label)}</h3>${content}</section>`:'';
  const prose=value=>value?`<p class="inspector-description">${h(value)}</p>`:'';
  const errorPanel=()=>'<div class="form-error" role="alert" tabindex="-1"></div>';
  function errorText(error){const message=error?.message||String(error),shared=translateError(error,t);if(shared!==message)return shared;const translation=ERROR_TRANSLATIONS[message]||EDITOR_ERRORS[message];if(translation)return t(message,translation);if(/^Invalid \w+ data\./.test(message))return t(message,'Data tidak valid. Perubahan belum tersimpan.');if(/^Saved \w+ is protected/.test(message))return t(message,'Data tersimpan dilindungi karena tidak dapat dibaca. Ekspor cadangan sebelum pemulihan.');return message;}
  function showError(panel,error){const el=panel.querySelector('.form-error');if(el){el.textContent=errorText(error);el.focus();}else notify(errorText(error));}
  function undoToast(message){ui.toast(message,{undo:store.canUndo?async()=>{try{store.undo();notify(t('Change undone','Perubahan dibatalkan'));}catch(error){notify(error.message);}}:undefined});}
  async function save(panel,work,message){
    if(savingPanels.has(panel))return false;
    savingPanels.add(panel);panel.dataset.busy='true';panel.setAttribute('aria-busy','true');
    const buttons=[...panel.querySelectorAll('button[type="submit"]')];
    buttons.forEach(el=>el.disabled=true);const error=panel.querySelector('.form-error');if(error)error.textContent='';
    try{const result=await work();if(result===false)throw new Error(t('Your change could not be saved. Please try again.','Perubahan belum tersimpan. Silakan coba lagi.'));await ui.close(true);undoToast(message);return true;}
    catch(error){if(panel.isConnected)showError(panel,error);else notify(errorText(error));return false;}
    finally{savingPanels.delete(panel);delete panel.dataset.busy;panel.removeAttribute('aria-busy');buttons.forEach(el=>{if(el.isConnected)el.disabled=false;});}
  }
  function form(title,fields,onSave,{existing=false,onDelete,kind='inspector',footer=''}={}){
    return ui.open({kind,title,dirtyGuard:true,content:`<form data-experience-form>${errorPanel()}<div class="form-grid">${fields}</div>${footer}<div class="form-actions">${existing&&onDelete?button(icon('trash')+t('Delete','Hapus'),'delete','','danger'):''}${button(t('Cancel','Batal'),'cancel')}<button type="submit" class="button primary">${h(t('Save changes','Simpan perubahan'))}</button></div></form>`,onSubmit:(event,panel)=>onSave(event.target,panel),onAction:async(action,target,event)=>{if(action==='cancel')ui.close();if(action==='delete')await onDelete?.(target.closest('.ux-panel'));if(action==='meeting-notes'){if(await ui.close())record('meetingNotes','', 'extension',target.dataset.project);}}});
  }
  function options(rows,value,optional=true){return `${optional?`<option value="">${h(t('Not set','Belum ditentukan'))}</option>`:''}${rows.map(([id,label])=>`<option value="${h(id)}" ${String(id)===String(value??'')?'selected':''}>${h(label)}</option>`).join('')}`;}
  function field(name,label,type,value='',{items=[],required=false,full=false,help='',min,max,step}={}){
    const id=`editor-${name}`,attrs=`name="${h(name)}" id="${h(id)}" ${required?'required':''}`;
    let control;
    if(type==='select')control=`<select ${attrs}>${options(items,value,!required)}</select>`;
    else if(type==='textarea')control=`<textarea ${attrs} rows="4" maxlength="10000">${h(value)}</textarea>`;
    else if(type==='checkbox')control=`<input type="checkbox" ${attrs} ${value?'checked':''}>`;
    else control=`<input type="${h(type)}" ${attrs} value="${h(value)}" ${['text','url','email','tel'].includes(type)?'maxlength="500"':''}${min!==undefined?` min="${h(min)}"`:''}${max!==undefined?` max="${h(max)}"`:''}${step!==undefined?` step="${h(step)}"`:''}>`;
    return `<div class="field ${full||type==='textarea'?'full':''}"><label for="${h(id)}">${h(label)}${required?' *':''}</label>${control}${help?`<small class="field-help">${h(help)}</small>`:''}</div>`;
  }
  const memberItems=()=>store.core.members.map(row=>[row.id,row.name]);
  const projectItems=()=>store.core.projects.map(row=>[row.id,row.name]);
  const values=form=>Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
  function logCore(next,message,projectId=''){next.activity=[{id:uid(),text:message,at:new Date().toISOString(),...(projectId?{projectId}:{})},...next.activity].slice(0,200);return next;}
  async function remove(panel,label,work,detail=''){
    const confirmed=await ui.confirm({title:t(`Delete ${label}?`,`Hapus ${label}?`),message:detail||t('This item will be removed. You can undo this change.','Item ini akan dihapus. Perubahan ini dapat dibatalkan.'),confirmLabel:t('Delete','Hapus')});
    if(confirmed)await save(panel,work,t(`${label} deleted`,`${label} dihapus`));
  }
  function projectLink(id){const project=projectOf(id);return project?button(h(project.name),'project-link',`data-id="${h(id)}"`):'—';}
  function memberLink(id){return id?button(h(nameOf(id)),'member-link',`data-id="${h(id)}"`):h(t('Unassigned','Belum ditugaskan'));}
  async function commonAction(action,target){if(action==='project-link'){await ui.close(true);navigate(`#project/${target.dataset.id}`);return true;}if(action==='member-link'){inspectMember(target.dataset.id);return true;}if(action==='task-link'){inspectTask(target.dataset.id);return true;}if(action==='event-link'){event(target.dataset.id);return true;}return false;}

  function deleteTaskData(id){
    const snapshot=store.exportAll();
    const projectId=snapshot.core.tasks.find(row=>row.id===id)?.projectId||'';
    snapshot.core=logCore(deleteTask(snapshot.core,id),t('Task deleted','Tugas dihapus'),projectId);
    for(const extra of Object.values(snapshot.extras.byProject))extra.blockers.forEach(row=>{if(row.task_id===id)row.task_id='';});
    snapshot.extension.meetingNotes.forEach(row=>{if(row.followupTaskId===id)row.followupTaskId='';});
    return store.importAll(snapshot);
  }

  function task(id='',projectId='',preset={}){
    const existing=store.core.tasks.find(row=>row.id===id);
    if(id&&!existing){notify(t('This task is no longer available.','Tugas ini sudah tidak tersedia.'));return;}
    if(!store.core.projects.length){notify(t('Create a project before adding a task.','Buat proyek sebelum menambahkan tugas.'));return project();}
    const data=existing||{id:uid(),title:preset.title||'',projectId:projectId||store.core.projects[0].id,assignee:me(),start:iso(),end:addDays(iso(),3),status:'todo',priority:'medium',description:preset.description||'',evidence:'',dependsOn:''};
    const fields=field('title',t('Task','Tugas'),'text',data.title,{required:true,full:true})+field('projectId',t('Project','Proyek'),'select',data.projectId,{items:projectItems(),required:true})+field('assignee',t('Owner','Penanggung jawab'),'select',data.assignee,{items:memberItems(),required:true})+field('start',t('Start date','Tanggal mulai'),'date',data.start,{required:true})+field('end',t('Due date','Tenggat'),'date',data.end,{required:true})+field('status',t('Status','Status'),'select',data.status,{items:Object.entries(STATUSES).map(([key,label])=>[key,translated(label)]),required:true})+field('priority',t('Priority','Prioritas'),'select',data.priority,{items:[['low',t('Low','Rendah')],['medium',t('Medium','Sedang')],['high',t('High','Tinggi')]],required:true})+field('dependsOn',t('Depends on','Bergantung pada'),'select',data.dependsOn,{items:store.core.tasks.filter(row=>row.projectId===data.projectId&&row.id!==data.id).map(row=>[row.id,row.title]),full:true})+field('description',t('Context and notes','Konteks dan catatan'),'textarea',data.description)+field('evidence',t('Completion evidence','Bukti penyelesaian'),'textarea',data.evidence||'',{help:t('Describe the result and include supporting links.','Jelaskan hasil dan sertakan tautan pendukung.')});
    const panel=form(existing?t('Edit task','Edit tugas'):t('New task','Tugas baru'),fields,(html,panel)=>save(panel,()=>{const nextTask={...data,...values(html)};const error=taskError(nextTask,store.core);if(error)throw new Error(error);const core=logCore(applyTask(store.core,nextTask),t(`Task updated: ${nextTask.title}`,`Tugas diperbarui: ${nextTask.title}`),nextTask.projectId);if(preset.meetingNoteId){const snapshot=store.exportAll(),note=snapshot.extension.meetingNotes.find(row=>row.id===preset.meetingNoteId);if(!note)throw new Error(t('The meeting note is no longer available. Your task has not been saved.','Notulen sudah tidak tersedia. Tugas belum disimpan.'));snapshot.core=core;note.followupTaskId=nextTask.id;return store.importAll(snapshot);}return store.saveCore(core,t('Task saved','Tugas tersimpan'));},preset.meetingNoteId?t('Follow-up created and linked','Tindak lanjut dibuat dan ditautkan'):t('Task saved','Tugas tersimpan')),{existing:!!existing,onDelete:panel=>remove(panel,data.title,()=>deleteTaskData(data.id))});
    panel.querySelector('[name="projectId"]').addEventListener('change',event=>{panel.querySelector('[name="dependsOn"]').innerHTML=options(store.core.tasks.filter(row=>row.projectId===event.target.value&&row.id!==data.id).map(row=>[row.id,row.title]),'');});
    return panel;
  }
  function deleteProjectData(id){
    const snapshot=store.exportAll(),taskIds=new Set(snapshot.core.tasks.filter(row=>row.projectId===id).map(row=>row.id)),eventIds=new Set(snapshot.core.events.filter(row=>row.projectId===id).map(row=>row.id));
    snapshot.core.projects=snapshot.core.projects.filter(row=>row.id!==id);
    snapshot.core.tasks=snapshot.core.tasks.filter(row=>!taskIds.has(row.id)).map(row=>({...row,dependsOn:taskIds.has(row.dependsOn)?'':row.dependsOn}));
    snapshot.core.events=snapshot.core.events.filter(row=>row.projectId!==id);
    delete snapshot.extras.byProject[id];
    for(const extra of Object.values(snapshot.extras.byProject))extra.dependencies=extra.dependencies.filter(row=>row.depends_on_id!==id);
    for(const collection of Object.values(snapshot.divisions))if(Array.isArray(collection))for(const row of collection)if(row.projectId===id)row.projectId='';
    for(const collection of Object.values(snapshot.extension))if(Array.isArray(collection))for(const row of collection){if(row.projectId===id)row.projectId='';if(taskIds.has(row.followupTaskId))row.followupTaskId='';if(eventIds.has(row.eventId))row.eventId='';}
    logCore(snapshot.core,t('Project deleted','Proyek dihapus'),id);return store.importAll(snapshot);
  }
  function project(id=''){
    const existing=projectOf(id);if(id&&!existing){notify(t('This project is no longer available.','Proyek ini sudah tidak tersedia.'));return;}
    const data=existing||{id:uid(),name:'',description:'',owner:me(),division:DIVISIONS[3],start:iso(),end:addDays(iso(),14),color:store.core.projects.length%4};
    const divisionChoices=DIVISIONS.includes(data.division)?DIVISIONS:[...DIVISIONS,data.division];
    const fields=field('name',t('Project name','Nama proyek'),'text',data.name,{required:true,full:true})+field('division',t('Division','Divisi'),'select',data.division,{items:divisionChoices.map(x=>[x,x]),required:true})+field('owner',t('Project lead','Ketua proyek'),'select',data.owner,{items:memberItems(),required:true})+field('start',t('Start date','Tanggal mulai'),'date',data.start,{required:true})+field('end',t('Target date','Tanggal target'),'date',data.end,{required:true})+field('description',t('Purpose and scope','Tujuan dan lingkup'),'textarea',data.description);
    return form(existing?t('Edit project','Edit proyek'):t('New project','Proyek baru'),fields,(html,panel)=>save(panel,()=>{const nextProject={...data,...values(html)};const error=projectError(nextProject,store.core);if(error)throw new Error(error);if(store.core.tasks.some(row=>row.projectId===data.id&&(row.start<nextProject.start||row.end>nextProject.end)))throw new Error(t('Project dates must include its tasks. Adjust the task dates first.','Rentang tanggal proyek harus mencakup tugasnya. Sesuaikan tanggal tugas terlebih dahulu.'));const next=clone(store.core),index=next.projects.findIndex(row=>row.id===data.id);if(index<0)next.projects.push(nextProject);else next.projects[index]=nextProject;return store.saveCore(logCore(next,t(`Project saved: ${nextProject.name}`,`Proyek tersimpan: ${nextProject.name}`),nextProject.id));},t('Project saved','Proyek tersimpan')),{existing:!!existing,onDelete:panel=>remove(panel,data.name,()=>deleteProjectData(data.id),t('This removes the project, its tasks, meetings, and project records. Division records remain with their project link cleared. You can undo.','Proyek, tugas, rapat, dan catatan proyek akan dihapus. Catatan divisi tetap tersedia tanpa tautan proyek. Perubahan dapat dibatalkan.'))});
  }
  function event(id='',projectId=''){
    const existing=store.core.events.find(row=>row.id===id);if(id&&!existing){notify(t('This meeting is no longer available.','Rapat ini sudah tidak tersedia.'));return;}
    const data=existing||{id:uid(),title:'',projectId:projectId||'',date:validDate(ctx.state?.selectedDate)?ctx.state.selectedDate:iso(),time:'09:00',duration:60,location:'',notes:''};
    const fields=field('title',t('Meeting title','Judul rapat'),'text',data.title,{required:true,full:true})+field('projectId',t('Project','Proyek'),'select',data.projectId,{items:projectItems(),full:true})+field('date',t('Date','Tanggal'),'date',data.date,{required:true})+field('time',t('Start time','Waktu mulai'),'time',data.time,{required:true})+field('duration',t('Duration (minutes)','Durasi (menit)'),'number',data.duration,{required:true,min:15,max:480,step:15})+field('location',t('Location or meeting link','Lokasi atau tautan rapat'),'text',data.location)+field('notes',t('Agenda and notes','Agenda dan catatan'),'textarea',data.notes);
    const panel=form(existing?t('Edit meeting','Edit rapat'):t('New meeting','Rapat baru'),fields,(html,panel)=>save(panel,()=>{const item={...data,...values(html)};item.duration=Number(item.duration);const error=eventError(item,store.core);if(error)throw new Error(error);const next=clone(store.core),index=next.events.findIndex(row=>row.id===item.id);if(index<0)next.events.push(item);else next.events[index]=item;return store.saveCore(logCore(next,t(`Meeting saved: ${item.title}`,`Rapat tersimpan: ${item.title}`),item.projectId));},t('Meeting saved','Rapat tersimpan')),{existing:!!existing,onDelete:panel=>remove(panel,data.title,()=>{const backup=store.exportAll();backup.core.events=backup.core.events.filter(row=>row.id!==data.id);backup.extension.meetingNotes.forEach(row=>{if(row.eventId===data.id)row.eventId='';});logCore(backup.core,t('Meeting deleted','Rapat dihapus'),data.projectId);return store.importAll(backup);}),footer:existing?section(t('Meeting record','Catatan rapat'),`<p>${h(t('Capture decisions and link a follow-up task. Save the meeting changes before opening notes.','Catat keputusan dan hubungkan tugas tindak lanjut. Simpan perubahan rapat sebelum membuka notulen.'))}</p>${button(t('Open meeting notes','Buka notulen'),'open-notes')}`):''});
    panel.addEventListener('click',async event=>{if(event.target.closest('[data-overlay-action="open-notes"]')&&await ui.close()){const notes=store.extension.meetingNotes.find(row=>row.eventId===data.id);record('meetingNotes',notes?.id||'','extension',data.projectId,{eventId:data.id,title:data.title,date:data.date});}});
    return panel;
  }

  function sourceData(source,projectId){return source==='extras'?(store.extras.byProject[projectId]||emptyExtras()):source==='extension'?store.extension:store.divisions;}
  function schemaFor(collection,source){return (source==='extras'?EXTRA_SCHEMAS:source==='extension'?RECORD_SCHEMAS:DIVISION_SCHEMAS)[collection];}
  function choices(type,collection,projectId){
    if(type==='member')return memberItems();if(type==='project')return projectItems();if(type==='division')return DIVISIONS.map(x=>[x,x]);
    if(type==='stage')return (store.divisions.stages[GROUP_FOR[collection]]||[]).map(row=>[row.id,translated(row.label)]);
    if(type==='task')return store.core.tasks.filter(row=>!projectId||row.projectId===projectId).map(row=>[row.id,row.title]);
    if(type==='event')return store.core.events.map(row=>[row.id,row.title]);
    if(type==='budget')return store.divisions.budgets.map(row=>[row.id,row.title]);
    if(type==='campaign')return store.divisions.campaigns.map(row=>[row.id,row.title]);
    if(type==='partner')return store.extension.partners.map(row=>[row.id,row.title]);
    if(type==='milestone')return (store.extras.byProject[projectId]?.milestones||[]).map(row=>[row.id,row.title]);
    if(type==='decision')return (store.extras.byProject[projectId]?.decisions||[]).map(row=>[row.id,row.decision.slice(0,80)]);
    return [];
  }
  function genericFields(schema,item,collection,source,projectId){return schema.fields.map(([name,en,id,type='text',selections])=>{
    const list=type==='select'?selections.map(([value,en,id])=>[value,t(en,id)]):choices(type,collection,projectId);
    const select=['select','member','project','division','stage','task','event','budget','campaign','partner','milestone','decision'].includes(type);
    const value=type==='date'?String(item[name]||'').slice(0,10):name==='resolved'?Boolean(item.resolved_at):item[name]??'';
    const required=['title','decision','depends_on_id','stageId'].includes(name);
    const available=list.filter(([value])=>name==='depends_on_id'?value!==projectId:name==='supersedes_id'?value!==item.id:true);
    if(select&&value&&!available.some(([key])=>String(key)===String(value)))available.push([value,translated(String(value))]);
    return field(name,t(en,id),select?'select':type,value,{items:available,required,full:['title','decision'].includes(name),min:type==='number'?0:undefined,step:type==='number'?1:undefined});
  }).join('');}
  function defaults(schema,collection,source,projectId){
    const item={id:uid(),title:'',projectId:projectId||''};
    for(const[name,,,type,selections]of schema.fields){item[name]=type==='checkbox'?false:type==='number'?0:type==='select'?selections[0]?.[0]||'':type==='stage'?choices(type,collection,projectId)[0]?.[0]||'':type==='member'?me():type==='date'&&['decided_at','date'].includes(name)?iso():'';}
    if(source==='extras'){item.project_id=projectId;delete item.projectId;if(collection==='blockers'){item.opened_at=new Date().toISOString();item.opened_by=me();}if(collection==='milestones')item.position=(sourceData(source,projectId).milestones||[]).length;}
    else if(projectId)item.projectId=projectId;
    return item;
  }
  function normalizeGeneric(schema,item,html){const submitted=values(html),result={...item};for(const[name,,,type]of schema.fields){result[name]=type==='checkbox'?html.elements.namedItem(name).checked:type==='number'?Number(submitted[name]):submitted[name]||'';}if('resolved'in result){result.resolved_at=result.resolved?(item.resolved_at||new Date().toISOString()):null;delete result.resolved;}if(result.status==='reached')result.reached_at=result.reached_at||new Date().toISOString();else if('reached_at'in result)result.reached_at=null;return result;}
  function validateRecord(item,schema,collection,source,projectId){
    if(schema.fields.some(([key])=>key==='title')&&!item.title?.trim())throw new Error(t('Enter a title.','Masukkan judul.'));
    if(collection==='decisions'&&source==='extras'&&!item.decision?.trim())throw new Error(t('Enter the decision.','Masukkan keputusan.'));
    for(const[key,en,id,type]of schema.fields){const value=item[key];if(type==='url'&&value&&!safeUrl(value))throw new Error(t(`${en} must start with https:// or http://.`,`${id} harus diawali https:// atau http://.`));if(type==='date'&&value&&!validDate(value))throw new Error(t(`Choose a valid ${en.toLowerCase()}.`,`Pilih ${id.toLowerCase()} yang valid.`));if(type==='number'&&(!Number.isSafeInteger(value)||value<0))throw new Error(t('Enter a whole number of zero or more.','Masukkan bilangan bulat nol atau lebih.'));}
    if(item.startDate&&item.endDate&&item.endDate<item.startDate)throw new Error(t('End date must be after the start date.','Tanggal akhir harus setelah tanggal mulai.'));
    if(collection==='financeRequests'&&item.type!=='legal'&&(!item.budgetId||!store.divisions.budgets.some(row=>row.id===item.budgetId)))throw new Error(t('Choose a budget line for this request.','Pilih pos anggaran untuk permintaan ini.'));
    if(collection==='financeRequests'&&item.type!=='legal'&&item.amount<=0)throw new Error(t('Enter an amount greater than zero.','Masukkan jumlah lebih dari nol.'));
    if(source==='extras'&&collection==='dependencies'){
      if(!item.depends_on_id||item.depends_on_id===projectId)throw new Error(t('Choose a different project.','Pilih proyek lain.'));
      if((store.extras.byProject[projectId]?.dependencies||[]).some(row=>row.depends_on_id===item.depends_on_id&&row.id!==item.id))throw new Error(t('This project dependency already exists.','Dependensi proyek ini sudah ada.'));
      const walk=(id,seen=new Set())=>{if(id===projectId)return true;if(seen.has(id))return false;seen.add(id);return (store.extras.byProject[id]?.dependencies||[]).some(row=>walk(row.depends_on_id,seen));};
      if(walk(item.depends_on_id))throw new Error(t('This link would create a circular project dependency.','Tautan ini akan membuat dependensi proyek melingkar.'));
    }
  }
  function persistRecord(collection,source,projectId,item,oldId,message){
    const next=clone(sourceData(source,projectId)),rows=next[collection],index=rows.findIndex(row=>(row.id||row.depends_on_id)===oldId);
    if(index<0)rows.push(item);else rows[index]=item;
    if(source==='extras')return store.saveExtras(projectId,next,message);
    if(source==='extension')return store.saveExtension(next,message);
    next.activity=[{id:uid(),entityType:collection,entityId:item.id,action:message,at:new Date().toISOString()},...next.activity].slice(0,200);return store.saveDivision(next,message);
  }
  function deleteRecord(collection,source,projectId,id){
    const next=clone(sourceData(source,projectId)),row=next[collection].find(row=>(row.id||row.depends_on_id)===id);
    if(collection==='budgets'&&store.divisions.financeRequests.some(row=>row.budgetId===id))throw new Error(t('Reassign linked requests before deleting this budget line.','Pindahkan permintaan terkait sebelum menghapus pos anggaran ini.'));
    next[collection]=next[collection].filter(row=>(row.id||row.depends_on_id)!==id);
    if(source==='extras'){
      if(collection==='milestones')next.blockers.forEach(row=>{if(row.milestone_id===id)row.milestone_id='';});
      if(collection==='decisions')next.decisions.forEach(row=>{if(row.supersedes_id===id)row.supersedes_id='';});
      return store.saveExtras(projectId,next,t('Project record deleted','Catatan proyek dihapus'));
    }
    if(source==='extension'){if(collection==='partners')next.followups.forEach(row=>{if(row.partnerId===id)row.partnerId='';});return store.saveExtension(next,t('Record deleted','Catatan dihapus'));}
    if(collection==='campaigns'){next.deliverables.forEach(row=>{if(row.campaignId===id)row.campaignId='';});next.assets.forEach(row=>{if(row.campaignId===id)row.campaignId='';});}
    return store.saveDivision(next,t('Record deleted','Catatan dihapus'));
  }
  function record(collection,id='',source='division',projectId='',preset={}){
    if(source==='extras'&&collection==='documents')return document(id,projectId);
    const schema=schemaFor(collection,source);if(!schema){notify(t('This editor is unavailable.','Editor ini tidak tersedia.'));return;}
    if(source==='extras'&&!projectOf(projectId)){notify(t('Choose a project first.','Pilih proyek terlebih dahulu.'));return;}
    const existing=sourceData(source,projectId)[collection]?.find(row=>(row.id||row.depends_on_id)===id);
    if(id&&!existing){notify(t('This record is no longer available.','Catatan ini sudah tidak tersedia.'));return;}
    const item=existing||{...defaults(schema,collection,source,projectId),...preset},label=t(schema.labels.en,schema.labels.id);
    return form(`${existing?t('Edit','Edit'):t('New','Baru')} · ${label}`,genericFields(schema,item,collection,source,projectId),(html,panel)=>save(panel,()=>{const next=normalizeGeneric(schema,item,html);validateRecord(next,schema,collection,source,projectId);return persistRecord(collection,source,projectId,next,id,t(`${label} saved`,`${label} tersimpan`));},t(`${label} saved`,`${label} tersimpan`)),{existing:!!existing,onDelete:panel=>remove(panel,item.title||item.decision||label,()=>deleteRecord(collection,source,projectId,id))});
  }

  function findDocument(id,projectId){if(projectId)return store.extras.byProject[projectId]?.documents.find(row=>row.id===id);for(const[pid,data]of Object.entries(store.extras.byProject)){const row=data.documents.find(row=>row.id===id);if(row)return {...row,project_id:pid};}return null;}
  function document(id='',projectId=''){
    const existing=id?findDocument(id,projectId):null;if(id&&!existing){notify(t('This document is no longer available.','Dokumen ini sudah tidak tersedia.'));return;}
    const pid=projectId||existing?.project_id||store.core.projects[0]?.id;if(!pid){notify(t('Create a project before adding a document.','Buat proyek sebelum menambahkan dokumen.'));return project();}
    const item=existing||{id:uid(),project_id:pid,title:'',external_url:'',version_label:'1.0',notes:'',revisions:[]};
    const fields=field('title',t('Document name','Nama dokumen'),'text',item.title,{required:true,full:true})+field('project_id',t('Project','Proyek'),'select',pid,{required:true,items:projectItems()})+field('version_label',t('Version label','Label versi'),'text',item.version_label||'')+field('external_url',t('Document link','Tautan dokumen'),'url',item.external_url||'',{full:true,help:t('Use a link, or choose a local file below.','Gunakan tautan, atau pilih berkas lokal di bawah.')})+`<div class="field full"><label for="editor-attachment">${h(t('Attach a file','Lampirkan berkas'))}</label><input id="editor-attachment" name="attachment" type="file"><small class="field-help">${h(t('Up to 10 MB. Files stay on this device. A new file creates a revision.','Maksimal 10 MB. Berkas disimpan di perangkat ini. Berkas baru membuat revisi.'))}${item.attachment?` ${h(t('Current file: ','Berkas saat ini: ')+item.attachment.name)}`:''}</small></div>`+field('notes',t('Description','Deskripsi'),'textarea',item.notes||'');
    return form(existing?t('Edit document','Edit dokumen'):t('Add document','Tambah dokumen'),fields,(html,panel)=>save(panel,async()=>{
      const data=values(html),file=html.elements.namedItem('attachment').files[0];let attachment=null;
      if(!data.title)throw new Error(t('Enter a document name.','Masukkan nama dokumen.'));
      if(data.external_url&&!safeUrl(data.external_url))throw new Error(t('Use an https:// or http:// document link.','Gunakan tautan dokumen https:// atau http://.'));
      if(data.external_url&&file)throw new Error(t('Choose a link or a file, not both. Clear the link to attach a file.','Pilih tautan atau berkas. Kosongkan tautan untuk melampirkan berkas.'));
      if(!data.external_url&&!file&&!item.attachment)throw new Error(t('Add a document link or choose a file.','Tambahkan tautan dokumen atau pilih berkas.'));
      try{
        if(file)attachment=await putAttachment(file);
        const next={...item,title:data.title,project_id:data.project_id,external_url:data.external_url,version_label:data.version_label,notes:data.notes,updated_at:new Date().toISOString()};
        if(attachment){next.attachment=attachment;next.external_url='';}else if(data.external_url)delete next.attachment;
        if(existing){const old={id:uid(),title:item.title,external_url:item.external_url||'',version_label:item.version_label||'',notes:item.notes||'',attachment:item.attachment||null,savedAt:item.updated_at||new Date().toISOString()};next.revisions=[...(item.revisions||[]),old];}
        if(data.project_id!==pid){const backup=store.exportAll();if(existing&&backup.extras.byProject[pid])backup.extras.byProject[pid].documents=backup.extras.byProject[pid].documents.filter(row=>row.id!==item.id);const target=backup.extras.byProject[data.project_id]||emptyExtras();target.documents.push(next);backup.extras.byProject[data.project_id]=target;return store.importAll(backup);}
        return persistRecord('documents','extras',pid,next,existing?item.id:'',t('Document saved','Dokumen tersimpan'));
      }catch(error){if(attachment)try{await removeAttachment(attachment.id);}catch{}throw error;}
    },t('Document saved','Dokumen tersimpan')),{existing:!!existing,onDelete:panel=>remove(panel,item.title,()=>deleteRecord('documents','extras',pid,item.id))});
  }
  function member(id=''){
    const existing=store.core.members.find(row=>row.id===id);if(id&&!existing){notify(t('This member is no longer available.','Anggota ini sudah tidak tersedia.'));return;}
    const item=existing||{id:uid(),name:'',initials:'',role:'',email:'',bio:''};
    return form(existing?t('Edit member','Edit anggota'):t('Add member','Tambah anggota'),field('name',t('Full name','Nama lengkap'),'text',item.name,{required:true,full:true})+field('role',t('Role','Peran'),'text',item.role||'')+field('email',t('Email','Email'),'email',item.email||'')+field('bio',t('About','Tentang'),'textarea',item.bio||''),(html,panel)=>save(panel,()=>{const data={...item,...values(html)};if(!data.name)throw new Error(t('Enter a name.','Masukkan nama.'));data.initials=shortInitials(data.name);const next=clone(store.core),index=next.members.findIndex(row=>row.id===data.id);if(index<0)next.members.push(data);else next.members[index]=data;if(data.id===next.profile.memberId)next.profile.name=data.name;return store.saveCore(next,t('Member saved','Anggota tersimpan'));},t('Member saved','Anggota tersimpan')));
  }
  const profile=()=>member(me());

  function inspectTask(id){
    const item=store.core.tasks.find(row=>row.id===id);if(!item)return notify(t('This task is no longer available.','Tugas ini sudah tidak tersedia.'));
    const dependency=store.core.tasks.find(row=>row.id===item.dependsOn);
    return ui.open({kind:'inspector',title:t('Task details','Detail tugas'),content:`${errorPanel()}<h2 class="inspector-title">${h(item.title)}</h2>${props([[t('Status','Status'),h(translated(STATUSES[item.status]))],[t('Project','Proyek'),projectLink(item.projectId)],[t('Owner','Penanggung jawab'),memberLink(item.assignee)],[t('Start date','Tanggal mulai'),h(date(item.start))],[t('Due date','Tenggat'),h(date(item.end))],[t('Priority','Prioritas'),h(translated(item.priority[0].toUpperCase()+item.priority.slice(1)))]])}${prose(item.description)}${dependency?section(t('Dependency','Dependensi'),button(h(dependency.title),'dependency',`data-id="${h(dependency.id)}"`)):''}${section(t('Completion evidence','Bukti penyelesaian'),prose(item.evidence)||`<p>${h(t('No evidence recorded yet.','Belum ada bukti yang dicatat.'))}</p>`)}<div class="form-actions">${button(icon('trash')+t('Delete','Hapus'),'delete','','danger')}${button(icon('edit')+t('Edit task','Edit tugas'),'edit','','primary')}</div>`,onAction:async(action,target)=>{if(await commonAction(action,target))return;if(action==='edit')task(id);if(action==='dependency')inspectTask(target.dataset.id);if(action==='delete')await remove(target.closest('.ux-panel'),item.title,()=>deleteTaskData(id));}});
  }
  function inspectProject(id){
    const item=projectOf(id);if(!item)return notify(t('This project is no longer available.','Proyek ini sudah tidak tersedia.'));const count=progress(store.core,id);
    return ui.open({kind:'inspector',title:t('Project details','Detail proyek'),content:`${errorPanel()}<p class="eyebrow">${h(item.division)}</p><h2 class="inspector-title">${h(item.name)}</h2>${prose(item.description)}${props([[t('Project lead','Ketua proyek'),memberLink(item.owner)],[t('Start date','Tanggal mulai'),h(date(item.start))],[t('Target date','Tanggal target'),h(date(item.end))],[t('Progress','Progres'),h(count.total?`${count.done} / ${count.total} · ${count.percent}%`:t('No tasks yet','Belum ada tugas'))]])}${section(t('Workspace','Ruang kerja'),button(icon('arrow')+t('Open project','Buka proyek'),'project-link',`data-id="${h(id)}"`))}<div class="form-actions">${button(icon('trash')+t('Delete','Hapus'),'delete','','danger')}${button(icon('edit')+t('Edit project','Edit proyek'),'edit','','primary')}</div>`,onAction:async(action,target)=>{if(await commonAction(action,target))return;if(action==='edit')project(id);if(action==='delete')await remove(target.closest('.ux-panel'),item.name,()=>deleteProjectData(id),t('Remove this project, its tasks, meetings, and project records? Other division records will keep their content.','Hapus proyek ini beserta tugas, rapat, dan catatan proyeknya? Isi catatan divisi lain akan tetap disimpan.'));}});
  }
  function displayField(item,field,collection,source,projectId){
    const[key,en,id,type='text',selections]=field,value=key==='resolved'?Boolean(item.resolved_at):item[key];if(value===undefined||value===null||value==='')return '';
    if(type==='textarea')return section(t(en,id),prose(value));
    let shown;if(type==='url')shown=link(value,t('Open link','Buka tautan'))||h(value);else if(type==='member')shown=memberLink(value);else if(type==='project')shown=projectLink(value);else if(type==='task'&&store.core.tasks.some(row=>row.id===value))shown=button(h(store.core.tasks.find(row=>row.id===value).title),'task-link',`data-id="${h(value)}"`);else if(type==='event'&&store.core.events.some(row=>row.id===value))shown=button(h(store.core.events.find(row=>row.id===value).title),'event-link',`data-id="${h(value)}"`);else if(type==='date')shown=h(date(value));else if(type==='checkbox')shown=h(value?t('Yes','Ya'):t('No','Tidak'));else if(type==='select')shown=h(selections.find(([key])=>key===value)?.slice(1).reduce((en,id)=>t(en,id))||value);else if(['stage','task','event','budget','campaign','partner','milestone','decision','division'].includes(type))shown=h(choices(type,collection,projectId).find(([key])=>key===value)?.[1]||value);else if(type==='number')shown=h(new Intl.NumberFormat('id-ID').format(value));else shown=h(value);
    return props([[t(en,id),shown]]);
  }
  function inspectRecord(collection,id,source='division',projectId=''){
    if(source==='extras'&&collection==='documents')return inspectDocument(id,projectId);
    const schema=schemaFor(collection,source),item=sourceData(source,projectId)[collection]?.find(row=>(row.id||row.depends_on_id)===id);if(!schema||!item)return notify(t('This record is no longer available.','Catatan ini sudah tidak tersedia.'));
    const label=t(schema.labels.en,schema.labels.id),title=item.title||item.decision||projectOf(item.depends_on_id)?.name||label;
    const linkedTask=collection==='meetingNotes'&&store.core.tasks.find(row=>row.id===item.followupTaskId);
    const followup=collection==='meetingNotes'?section(t('Next step','Langkah berikutnya'),linkedTask?button(icon('arrow')+t('Open follow-up task','Buka tugas tindak lanjut'),'task-link',`data-id="${h(linkedTask.id)}"`,'primary'):button(icon('plus')+t('Create follow-up task','Buat tugas tindak lanjut'),'create-followup','','primary')):'';
    return ui.open({kind:'inspector',title:label,content:`${errorPanel()}<h2 class="inspector-title">${h(title)}</h2>${item.number?`<p class="meta">${h(item.number)}</p>`:''}${schema.fields.filter(([key])=>!['title','decision'].includes(key)).map(field=>displayField(item,field,collection,source,projectId)).join('')}${followup}<div class="form-actions">${button(icon('trash')+t('Delete','Hapus'),'delete','','danger')}${button(icon('edit')+t('Edit','Edit'),'edit','','primary')}</div>`,onAction:async(action,target)=>{if(await commonAction(action,target))return;if(action==='edit')record(collection,id,source,projectId);if(action==='create-followup')task('',item.projectId||projectId,{meetingNoteId:item.id,title:t(`Follow up: ${title}`,`Tindak lanjut: ${title}`),description:item.decisions||item.notes||''});if(action==='delete')await remove(target.closest('.ux-panel'),title,()=>deleteRecord(collection,source,projectId,id));}});
  }
  async function previewFile(panel,attachment){
    const target=panel.querySelector('[data-file-preview]');if(!target)return;const urls=[];
    const release=()=>{urls.forEach(url=>URL.revokeObjectURL(url));observer.disconnect();};
    const observer=new MutationObserver(()=>{if(!panel.isConnected)release();});observer.observe(globalThis.document.body,{childList:true,subtree:true});
    try{
      const file=await getAttachment(attachment.id);if(!panel.isConnected){release();return;}
      const url=URL.createObjectURL(file.blob);urls.push(url);
      const download=`<a class="button" href="${h(url)}" download="${h(file.name)}">${icon('download')}${h(t('Download file','Unduh berkas'))}</a>`;
      if(file.type==='text/plain'){const text=(await file.blob.text()).slice(0,200000);if(!panel.isConnected){release();return;}target.innerHTML=`<pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 monospace;max-height:340px;overflow:auto;padding:16px;background:var(--surface-2);border-radius:16px">${h(text)}</pre>${download}`;}
      else if(file.previewable&&file.type.startsWith('image/'))target.innerHTML=`<img src="${h(url)}" alt="${h(file.name)}" style="width:100%;max-height:380px;object-fit:contain;border-radius:16px;margin-bottom:16px">${download}`;
      else if(file.previewable&&file.type==='application/pdf')target.innerHTML=`<iframe src="${h(url)}" title="${h(file.name)}" sandbox="allow-same-origin" style="width:100%;height:360px;border:1px solid var(--line);border-radius:16px;margin-bottom:16px"></iframe>${download}`;
      else target.innerHTML=`<p>${h(t('Download this file to view it.','Unduh berkas ini untuk melihatnya.'))}</p>${download}`;
    }catch(error){if(panel.isConnected)target.innerHTML=`<p class="form-error">${h(errorText(error))}</p>`;release();}
  }
  function inspectDocument(id,projectId=''){
    const item=findDocument(id,projectId);if(!item)return notify(t('This document is no longer available.','Dokumen ini sudah tidak tersedia.'));const pid=projectId||item.project_id;
    const revisions=(item.revisions||[]).map((revision,index)=>`<div class="record-row"><div><strong>${h(revision.version_label||`${t('Revision','Revisi')} ${index+1}`)}</strong><small>${h(revision.savedAt?date(revision.savedAt):'')}${revision.attachment?` · ${h(revision.attachment.name)}`:''}</small></div>${button(t('View','Lihat'),'revision',`data-index="${index}"`)}</div>`).join('');
    const panel=ui.open({kind:'inspector',title:t('Document','Dokumen'),content:`${errorPanel()}<h2 class="inspector-title">${h(item.title)}</h2>${props([[t('Project','Proyek'),projectLink(pid)],[t('Version','Versi'),h(item.version_label||'—')],[t('Last updated','Pembaruan terakhir'),h(item.updated_at?date(item.updated_at):t('Not recorded','Belum dicatat'))]])}${prose(item.notes)}${item.external_url?section(t('Document link','Tautan dokumen'),link(item.external_url,t('Open document','Buka dokumen'))):''}${item.attachment?section(t('File preview','Pratinjau berkas'),`<div data-file-preview><p>${h(t('Opening file…','Membuka berkas…'))}</p></div>`):''}${section(t('Revision history','Riwayat revisi'),revisions||`<p>${h(t('No earlier revisions.','Belum ada revisi sebelumnya.'))}</p>`)}<div class="form-actions">${button(icon('trash')+t('Delete','Hapus'),'delete','','danger')}${button(icon('edit')+t('Edit / add revision','Edit / tambah revisi'),'edit','','primary')}</div>`,onAction:async(action,target)=>{if(await commonAction(action,target))return;if(action==='edit')document(id,pid);if(action==='delete')await remove(panel,item.title,()=>deleteRecord('documents','extras',pid,id));if(action==='revision'){const revision=item.revisions[Number(target.dataset.index)];const preview=ui.open({kind:'inspector',title:t('Earlier revision','Revisi sebelumnya'),content:`<h2 class="inspector-title">${h(revision.title||item.title)}</h2><p class="meta">${h(revision.version_label||'')}</p>${prose(revision.notes)}${revision.external_url?link(revision.external_url,t('Open revision','Buka revisi')):''}${revision.attachment?'<div data-file-preview></div>':''}<div class="form-actions">${button(t('Back to document','Kembali ke dokumen'),'back')}</div>`,onAction:action=>{if(action==='back')inspectDocument(id,pid);}});if(revision.attachment)previewFile(preview,revision.attachment);}}});
    if(item.attachment)previewFile(panel,item.attachment);return panel;
  }
  function inspectMember(id){
    const item=store.core.members.find(row=>row.id===id);if(!item)return notify(t('This member is no longer available.','Anggota ini sudah tidak tersedia.'));const tasks=store.core.tasks.filter(row=>row.assignee===id),open=tasks.filter(row=>row.status!=='done'),completed=tasks.length-open.length;
    return ui.open({kind:'inspector',title:t('Member profile','Profil anggota'),content:`<div class="profile-card"><span class="avatar" style="width:64px;height:64px;font-size:24px">${h(item.initials)}</span><h2 class="inspector-title" style="margin-top:16px">${h(item.name)}</h2><p class="meta">${h(item.role||t('DWDG UII member','Anggota DWDG UII'))}</p></div>${prose(item.bio)}${props([[t('Open tasks','Tugas terbuka'),String(open.length)],[t('Completed tasks','Tugas selesai'),String(completed)],[t('Email','Email'),item.email?`<a href="mailto:${h(item.email)}">${h(item.email)}</a>`:'—']])}${section(t('Current work','Pekerjaan saat ini'),open.slice(0,6).map(row=>`<div class="record-row">${button(h(row.title),'task-link',`data-id="${h(row.id)}"`)}<small>${h(date(row.end))}</small></div>`).join('')||`<p>${h(t('No open tasks assigned.','Tidak ada tugas terbuka.'))}</p>`)}<div class="form-actions">${button(icon('edit')+t('Edit profile','Edit profil'),'edit','','primary')}</div>`,onAction:(action,target)=>{if(action==='edit')member(id);if(action==='task-link')inspectTask(target.dataset.id);}});
  }
  return {task,project,event,record,document,member,profile,inspectTask,inspectProject,inspectRecord,inspectDocument,inspectMember};
}
