export const DIVISIONS = ['Strategy & Growth', 'Human Resource', 'External Engagement', 'Marketing, Communication & IT', 'Legal & Finance', 'Consulting'];
export const STATUSES = {todo:'Not started', progress:'In progress', blocked:'Blocked', done:'Completed'};
export const STORE_KEY = 'dwdg-workspace-v1';
export function iso(date=new Date()){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function day(date){return new Date(`${date}T12:00:00`);}
export function addDays(date,n){const d=day(date);d.setDate(d.getDate()+n);return iso(d);}
export function diffDays(a,b){return Math.round((day(a)-day(b))/86400000);}
export function validDate(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(+day(d))&&iso(day(d))===d;}
export const uid = () => crypto.randomUUID();
export function makeSeed(today=iso()){
  const members=[{id:'me',name:'Mahdy',initials:'MM'},{id:'a',name:'Alya',initials:'AL'},{id:'r',name:'Raka',initials:'RA'},{id:'n',name:'Nadia',initials:'NA'},{id:'f',name:'Farhan',initials:'FA'},{id:'s',name:'Salsa',initials:'SA'}];
  const projects=[
    {id:'onboard',name:'New member onboarding',division:'Human Resource',owner:'n',start:addDays(today,-7),end:addDays(today,8),description:'Give every new member a clear, welcoming start. Prepare the welcome kit, confirm mentors, and run the introduction session.',color:0},
    {id:'bootcamp',name:'Consulting bootcamp',division:'Consulting',owner:'a',start:addDays(today,-4),end:addDays(today,18),description:'Build practical consulting skills through a case workshop and a final team presentation.',color:1},
    {id:'digital',name:'DWDG digital workspace',division:'Marketing, Communication & IT',owner:'me',start:addDays(today,-3),end:addDays(today,24),description:'Bring our programs, responsibilities, and deadlines into one shared workspace.',color:2},
    {id:'partners',name:'Campus partnership outreach',division:'External Engagement',owner:'r',start:today,end:addDays(today,16),description:'Identify partners and prepare a focused outreach plan for our upcoming activities.',color:3}
  ];
  const specs=[['t1','onboard','Draft the welcome kit','n',-7,-4,'done'],['t2','onboard','Review the member welcome kit','me',-3,0,'progress'],['t3','onboard','Match new members with mentors','n',0,3,'todo'],['t4','onboard','Host the introduction session','s',5,8,'todo'],['t5','bootcamp','Agree on the workshop format','a',-4,-2,'done'],['t6','bootcamp','Finalize the consulting brief','me',-2,1,'progress'],['t7','bootcamp','Confirm a workshop facilitator','a',0,7,'blocked'],['t8','bootcamp','Prepare the practice case','f',8,12,'todo'],['t9','bootcamp','Run the consulting workshop','a',14,18,'todo'],['t10','digital','Collect division needs','s',-3,-1,'done'],['t11','digital','Review ERP feature priorities','me',-1,0,'progress'],['t12','digital','Design the shared workspace','me',1,8,'todo'],['t13','digital','Test with division heads','s',9,16,'todo'],['t14','digital','Launch the member pilot','me',17,24,'todo'],['t15','partners','Prepare the partnership shortlist','r',0,3,'progress'],['t16','partners','Review the outreach proposal','me',3,7,'todo'],['t17','partners','Contact shortlisted partners','r',8,12,'todo'],['t18','partners','Confirm the first collaboration','f',13,16,'todo']];
  const tasks=specs.map(([id,projectId,title,assignee,start,end,status],i)=>({id,projectId,title,assignee,start:addDays(today,start),end:addDays(today,end),status,priority:i%4===0?'high':'medium',description:status==='blocked'?'Waiting for the facilitator to confirm availability.':'',dependsOn:'',completedAt:status==='done'?addDays(today,end):null}));
  tasks.find(t=>t.id==='t8').dependsOn='t7';tasks.find(t=>t.id==='t13').dependsOn='t12';
  const events=[{id:'e1',title:'Weekly division sync',projectId:'digital',date:today,time:'15:30',duration:45,location:'Online · meeting link to be added',notes:'Review progress, blockers, and priorities.'},{id:'e2',title:'Bootcamp planning session',projectId:'bootcamp',date:addDays(today,1),time:'19:00',duration:60,location:'Campus',notes:'Agree on the workshop agenda.'}];
  return {version:1,profile:{name:'Mahdy',memberId:'me'},members,projects,tasks,events,activity:[{id:'seed',text:'Sample workspace created. All people and activities are illustrative.',at:new Date().toISOString()}]};
}
export function progress(state,id){const ts=state.tasks.filter(t=>t.projectId===id);return {total:ts.length,done:ts.filter(t=>t.status==='done').length,percent:ts.length?Math.round(ts.filter(t=>t.status==='done').length/ts.length*100):0};}
export function taskError(task,state){
  if(!task.title?.trim())return 'Give this task a title.';
  if(!state.projects.some(p=>p.id===task.projectId))return 'Choose a project.';
  if(!state.members.some(m=>m.id===task.assignee))return 'Choose an assignee.';
  if(!validDate(task.start)||!validDate(task.end)||task.start>task.end)return 'The due date must be on or after the start date.';
  if(!Object.hasOwn(STATUSES,task.status))return 'Choose a valid status.';
  if(!['low','medium','high'].includes(task.priority))return 'Choose a valid priority.';
  if(state.tasks.some(t=>t.dependsOn===task.id&&t.projectId!==task.projectId))return 'Clear dependent task links before moving this task to another project.';
  if(task.dependsOn){
    const dependency=state.tasks.find(t=>t.id===task.dependsOn);
    if(!dependency||dependency.projectId!==task.projectId)return 'Choose a dependency from the same project.';
    let cursor=dependency;const seen=new Set([task.id]);
    while(cursor){if(seen.has(cursor.id))return 'These dependencies form a loop. Choose a different task.';seen.add(cursor.id);cursor=state.tasks.find(t=>t.id===cursor.dependsOn);}
    if(task.status==='done'&&dependency.status!=='done')return 'Complete the dependency before completing this task.';
  }
  if(task.status!=='done'&&state.tasks.some(t=>t.dependsOn===task.id&&t.status==='done'))return 'Reopen the completed dependent task first.';
  return '';
}
export function projectError(p,state){if(!p.name?.trim())return 'Give this project a name.';if(!validDate(p.start)||!validDate(p.end)||p.start>p.end)return 'The end date must be on or after the start date.';if(!DIVISIONS.includes(p.division)&&p.division!=='Client Engagement')return 'Choose a division.';if(!state.members.some(m=>m.id===p.owner))return 'Choose a project lead.';return '';}
export function eventError(e,state){if(!e.title?.trim())return 'Give this event a title.';if(!validDate(e.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time))return 'Choose a valid date and time.';if(!Number.isInteger(e.duration)||e.duration<15||e.duration>480)return 'Duration must be between 15 and 480 minutes.';if(e.projectId&&!state.projects.some(p=>p.id===e.projectId))return 'Choose an existing project.';return '';}
export function applyTask(state,task,today=iso()){
  const error=taskError(task,state);if(error)throw new Error(error);
  const copy=structuredClone(state);const prev=copy.tasks.find(t=>t.id===task.id);
  task={...task,title:task.title.trim(),completedAt:task.status==='done'?(prev?.completedAt||today):null};
  if(prev)copy.tasks[copy.tasks.indexOf(prev)]=task;else copy.tasks.push(task);
  const p=copy.projects.find(p=>p.id===task.projectId);
  p.start=p.start<task.start?p.start:task.start;p.end=p.end>task.end?p.end:task.end;
  return copy;
}
export function shiftTask(state,id,offset,resize=false){const task=state.tasks.find(t=>t.id===id);if(!task)throw new Error('Task not found.');return applyTask(state,{...task,start:resize?task.start:addDays(task.start,offset),end:addDays(task.end,offset)});}
export function deleteTask(state,id){const next=structuredClone(state);next.tasks=next.tasks.filter(t=>t.id!==id).map(t=>t.dependsOn===id?{...t,dependsOn:''}:t);return next;}
export function validateState(s){
  if(!s||s.version!==1||!s.profile||typeof s.profile.name!=='string')return false;
  if(!['members','projects','tasks','events','activity'].every(k=>Array.isArray(s[k])))return false;
  if(!s.members.length||!s.members.every(m=>typeof m.id==='string'&&typeof m.name==='string'&&typeof m.initials==='string'))return false;
  if(!s.members.some(m=>m.id===s.profile.memberId))return false;
  if(!['members','projects','tasks','events'].every(k=>new Set(s[k].map(x=>x.id)).size===s[k].length&&s[k].every(x=>typeof x.id==='string')))return false;
  return s.projects.every(p=>!projectError(p,s)&&Number.isInteger(p.color)&&typeof p.description==='string')&&s.tasks.every(t=>!taskError(t,s)&&typeof t.description==='string')&&s.events.every(e=>!eventError(e,s)&&typeof e.notes==='string'&&typeof e.location==='string');
}
