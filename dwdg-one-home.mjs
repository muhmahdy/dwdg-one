import {escapeHtml as h,icon} from './experience-ui.mjs';
import {formatLocalDate} from './experience-i18n.mjs';
import {projectProgress} from './dwdg-one-preview-data.mjs';
import {todayISO,selectDailyTasks,groupDailyTasks} from './dwdg-one-daily.mjs';

const button=(text,action,extra='',style='quiet',glyph='')=>`<button type="button" class="one-button ${style}" data-action="home-${action}" ${extra}>${glyph?icon(glyph):''}<span>${h(text)}</span></button>`;
const dateLabel=(date,language,t)=>date?formatLocalDate(date,language):t('No date','Tanpa tanggal');
const groupLabel=(id,t)=>t(...({overdue:['Overdue','Terlambat'],today:['Today','Hari ini'],upcoming:['Upcoming','Mendatang'],undated:['No date','Tanpa tanggal'],completed:['Completed','Selesai']}[id]||['Tasks','Tugas']));
const closedProjects=new Set(['completed','cancelled','archived']);

/** Home reads the same canonical demo records as Work. It never writes or seeds. */
export function renderHome({state,workspaceId,actorId='demo-admin',t,language='en',today=todayISO(),resources,access}={}) {
  const projects=(state?.projects||[]).filter(project=>project.workspaceId===workspaceId),projectById=new Map(projects.map(project=>[project.id,project]));
  const tasks=selectDailyTasks(state,{workspaceId,ownerId:'me',actorId,today}),open=tasks.filter(task=>task.status!=='done').sort((a,b)=>
    !a.targetDate&&!b.targetDate?a.title.localeCompare(b.title):!a.targetDate?1:!b.targetDate?-1:a.targetDate.localeCompare(b.targetDate)||a.title.localeCompare(b.title));
  const groups=groupDailyTasks(open,today),overdue=groups.find(group=>group.id==='overdue')?.tasks||[],dueToday=groups.find(group=>group.id==='today')?.tasks||[];
  const responsibleProjects=new Set([...tasks.map(task=>task.projectId),...projects.filter(project=>project.leadId===actorId).map(project=>project.id)]);
  const attentionProjects=projects.filter(project=>!closedProjects.has(project.status)&&(actorId==='demo-admin'||responsibleProjects.has(project.id)));
  const openBlockers=(state?.blockers||[]).filter(blocker=>blocker.workspaceId===workspaceId&&!blocker.resolved&&attentionProjects.some(project=>project.id===blocker.projectId));
  const blockedProjects=attentionProjects.filter(project=>openBlockers.some(blocker=>blocker.projectId===project.id));
  const inReview=attentionProjects.filter(project=>project.status==='review');
  const relatedProjects=projects.filter(project=>responsibleProjects.has(project.id)&&!['cancelled','archived'].includes(project.status));
  const resourceState=resources?.store?.state||resources?.state||resources;
  const linkedResource=task=>projectById.has(task.projectId)?(resourceState?.resources||[]).find(resource=>resource.id===task.resourceId&&resource.workspaceId===workspaceId&&resource.projectId===task.projectId&&!resource.archived):null;
  const projectTitle=id=>projectById.get(id)?.title||t('Project unavailable','Proyek tidak tersedia');
  const countText=count=>`${count} ${t(count===1?'task':'tasks','tugas')}`;
  function taskRow(task,{attention=false,agenda=false}={}) {
    const resource=linkedResource(task);
    return `<article class="one-home-task ${attention?'one-home-task--attention':''} ${agenda?'one-home-task--agenda':''}" data-home-task-id="${h(task.id)}">${!access||access.can('task','update',task)&&(!access.allowedFields('task',task)||access.allowedFields('task',task).includes('status'))?`<button type="button" class="one-home-check" data-action="home-complete" data-id="${h(task.id)}" aria-pressed="false" aria-label="${h(t('Complete task','Selesaikan tugas'))}: ${h(task.title)}"></button>`:'<span class="one-home-check" aria-hidden="true"></span>'}<div class="one-home-task-main"><button type="button" id="home-task-${h(task.id)}${agenda?'-agenda':attention?'-attention':''}" class="one-home-task-title" data-action="home-open-task" data-id="${h(task.id)}">${h(task.title)}</button><div class="one-home-task-meta"><button type="button" data-action="home-open-project" data-id="${h(task.projectId)}" ${projectById.has(task.projectId)?'':'disabled'}>${h(projectTitle(task.projectId))}</button>${resource?`<span>${icon('folder')}${h(resource.title)}</span>`:''}${task.status==='progress'?`<span>${h(t('In progress','Berjalan'))}</span>`:''}${task.priority==='high'?`<span class="one-home-priority">${h(t('High priority','Prioritas tinggi'))}</span>`:''}</div></div><span class="one-home-due ${task.targetDate&&task.targetDate<today?'overdue':''}">${agenda?h(t('All day','Sepanjang hari')):h(dateLabel(task.targetDate,language,t))}</span></article>`;
  }
  function projectAttention(project,type) {
    const blockers=openBlockers.filter(blocker=>blocker.projectId===project.id),isBlocked=type==='blocked';
    return `<article class="one-home-attention-project"><span class="one-home-attention-mark" aria-hidden="true">${icon(isBlocked?'warning':'projects')}</span><div><button type="button" data-action="home-open-project" data-id="${h(project.id)}">${h(project.title)}</button><p>${isBlocked?h(blockers.map(blocker=>blocker.title).join(' · ')):h(t('Project is in review.','Proyek sedang ditinjau.'))}</p></div>${isBlocked?`<span class="one-home-attention-count" aria-label="${h(t('Open blockers','Hambatan terbuka'))}">${blockers.length}</span>`:''}</article>`;
  }
  let html=`<section class="one-home"><div class="one-heading one-home-heading"><div><h1>${h(t('Home','Beranda'))}</h1><p><time datetime="${h(today)}">${h(dateLabel(today,language,t))}</time></p></div>${button(t('My Work','Pekerjaan saya'),'work','data-group="all" data-owner="me"','', 'tasks')}</div><div id="one-notices"></div><div class="one-home-layout"><div class="one-home-main">`;
  html+=`<section class="one-home-section one-home-attention" aria-labelledby="one-home-attention-heading"><div class="one-home-section-heading"><h2 id="one-home-attention-heading">${h(t('Needs attention','Perlu perhatian'))}</h2></div>`;
  if(!overdue.length&&!blockedProjects.length&&!inReview.length)html+=`<div class="one-home-empty"><p>${h(t('No overdue tasks, open project blockers or projects in review.','Tidak ada tugas terlambat, hambatan proyek terbuka, atau proyek yang ditinjau.'))}</p>${button(t('Open My Work','Buka Pekerjaan saya'),'work','data-group="all" data-owner="me"')}</div>`;
  if(overdue.length)html+=`<div class="one-home-attention-group"><div class="one-home-group-heading"><h3>${h(t('Overdue tasks','Tugas terlambat'))}</h3><span>${overdue.length}</span></div><div class="one-home-rows">${overdue.slice(0,3).map(task=>taskRow(task,{attention:true})).join('')}</div>${overdue.length>3?button(t('View all overdue tasks','Lihat semua tugas terlambat'),'work','data-group="overdue" data-owner="me"'):''}</div>`;
  if(blockedProjects.length)html+=`<div class="one-home-attention-group"><div class="one-home-group-heading"><h3>${h(t('Open project blockers','Hambatan proyek terbuka'))}</h3><span>${openBlockers.length}</span></div><div class="one-home-rows">${blockedProjects.slice(0,4).map(project=>projectAttention(project,'blocked')).join('')}</div>${blockedProjects.length>4?button(t('View affected projects','Lihat proyek terdampak'),'projects'):''}</div>`;
  if(inReview.length)html+=`<div class="one-home-attention-group"><div class="one-home-group-heading"><h3>${h(t('Projects in review','Proyek yang ditinjau'))}</h3><span>${inReview.length}</span></div><div class="one-home-rows">${inReview.slice(0,3).map(project=>projectAttention(project,'review')).join('')}</div>${inReview.length>3?button(t('View projects','Lihat proyek'),'projects'):''}</div>`;
  html+='</section>';
  html+=`<section class="one-home-section one-home-assigned" aria-labelledby="one-home-assigned-heading"><div class="one-home-section-heading"><h2 id="one-home-assigned-heading">${h(t('Assigned to me','Ditugaskan kepada saya'))}</h2><span>${h(countText(open.length))}</span></div>`;
  if(!open.length)html+=`<div class="one-home-empty"><p>${h(t('No open tasks are assigned to you in this workspace.','Belum ada tugas terbuka yang ditugaskan kepada Anda di ruang kerja ini.'))}</p>${button(t('Open My Work','Buka Pekerjaan saya'),'work','data-group="all" data-owner="me"')}</div>`;
  for(const group of groups.filter(group=>group.tasks.length&&group.id!=='completed')){
    html+=`<div class="one-home-work-group"><div class="one-home-group-heading"><h3>${h(groupLabel(group.id,t))}</h3>${button(countText(group.tasks.length),'work',`data-group="${h(group.id)}" data-owner="me"`)}</div><div class="one-home-rows">${group.tasks.slice(0,4).map(task=>taskRow(task)).join('')}</div>${group.tasks.length>4?button(t('View all','Lihat semua'),'work',`data-group="${h(group.id)}" data-owner="me"`):''}</div>`;
  }
  html+='</section></div>';
  html+=`<aside class="one-home-support"><section class="one-home-agenda" aria-labelledby="one-home-agenda-heading"><div class="one-home-section-heading"><h2 id="one-home-agenda-heading">${h(t("Today's agenda",'Agenda hari ini'))}</h2>${button(t('Schedule','Jadwal'),'open-schedule','','quiet','calendar')}</div>`;
  if(dueToday.length)html+=`<h3>${h(t('All-day deadlines','Tenggat sepanjang hari'))}</h3><div class="one-home-agenda-list">${dueToday.slice(0,4).map(task=>taskRow(task,{agenda:true})).join('')}</div>${dueToday.length>4?button(t('View all today','Lihat semua hari ini'),'work','data-group="today" data-owner="me"'):''}`;
  else html+=`<p class="one-home-agenda-empty">${h(t('No assigned task deadlines today.','Tidak ada tenggat tugas Anda hari ini.'))}</p>`;
  html+=`<div class="one-home-meetings"><h3>${h(t('Meetings','Rapat'))}</h3><p>${h(t('No meetings recorded. Schedule is coming in a later iteration.','Belum ada rapat tercatat. Jadwal hadir pada iterasi berikutnya.'))}</p></div></section>`;
  if(relatedProjects.length)html+=`<section class="one-home-related" aria-labelledby="one-home-related-heading"><h2 id="one-home-related-heading">${h(t('Related projects','Proyek terkait'))}</h2><div class="one-home-project-tracks">${relatedProjects.slice(0,4).map(project=>{const progress=projectProgress({tasks:(state.tasks||[]).filter(task=>task.workspaceId===workspaceId)},project.id);return `<article><button type="button" data-action="home-open-project" data-id="${h(project.id)}">${h(project.title)}</button><div class="one-progress"><div><span>${progress.total?`${progress.done} / ${progress.total} ${h(t('tasks completed','tugas selesai'))}`:h(t('No tasks yet','Belum ada tugas'))}</span><span>${progress.total?`${progress.percent}%`:'—'}</span></div><div class="one-track" aria-hidden="true"><span style="width:${progress.percent}%"></span></div></div></article>`;}).join('')}</div></section>`;
  html+='</aside></div></section>';return html;
}
