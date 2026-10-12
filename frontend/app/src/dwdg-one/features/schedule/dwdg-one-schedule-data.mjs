// Pure local Schedule derivations. No store, provider calendar or availability service is opened.
export const SCHEDULE_TZ = 'Asia/Jakarta';
const DAY_MS = 86400000;
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const localFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone:SCHEDULE_TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
});
function failure(code, conflicts) { const error=new Error(code);error.code=code;if(conflicts)error.conflicts=conflicts;return error; }
function validDay(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const instant=new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(+instant)&&instant.toISOString().slice(0,10)===value;
}
function requireDay(value) {if(!validDay(value))throw failure('dates');return value;}
function instant(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)||!validDay(value.slice(0,10)))return null;
  const milliseconds=Date.parse(value);return Number.isNaN(milliseconds)?null:milliseconds;
}
function localParts(milliseconds) {
  const parts=localFormatter.formatToParts(new Date(milliseconds));
  const value=type=>parts.find(part=>part.type===type).value;
  return `${value('year').padStart(4,'0')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}`;
}

export function localDateTimeToUTC(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)||!validDay(value.slice(0,10)))throw failure('dates');
  const desired=Date.parse(`${value}:00Z`);
  let candidate=desired-7*3600000;
  // Derive the actual Jakarta offset through Intl, including historical calendar offsets.
  for(let attempt=0;attempt<3;attempt++) {
    const rendered=localParts(candidate);
    if(rendered===`${value}:00`)return new Date(candidate).toISOString();
    candidate+=desired-Date.parse(`${rendered}Z`);
  }
  throw failure('dates');
}

export function utcToLocalDateTime(value) {
  const milliseconds=instant(value);if(milliseconds===null)throw failure('dates');
  return localParts(milliseconds).slice(0,16);
}

export function addDays(date, amount) {
  requireDay(date);if(!Number.isInteger(amount))throw failure('dates');
  const result=new Date(Date.parse(`${date}T12:00:00Z`)+amount*DAY_MS).toISOString().slice(0,10);
  return requireDay(result);
}

export function weekDays(date) {
  requireDay(date);const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();
  const monday=addDays(date,-((weekday+6)%7));return Array.from({length:7},(_,index)=>addDays(monday,index));
}

function safeURL(value) {
  if(typeof value!=='string')throw failure('url');
  const text=value.trim();if(!text)return '';
  if(/[\u0000-\u0020\u007f]/.test(text))throw failure('url');
  let url;try {url=new URL(text);}catch {throw failure('url');}
  if(url.protocol!=='https:'||!url.hostname||url.username||url.password)throw failure('url');
  return url.href;
}
function permittedPeople(people,workspaceId) {return new Set(people.filter(person=>person.workspaceId===workspaceId||person.workspaceId==='*').map(person=>person.id));}
function involved(meeting) {return [...new Set([meeting.organizerId,...(Array.isArray(meeting.participantIds)?meeting.participantIds:[]),meeting.minuteTakerId].filter(Boolean))];}

export function meetingConflicts(candidate,meetings=[],{workspaceId=candidate.workspaceId,excludeId=''}={}) {
  const start=instant(candidate.startAt),end=instant(candidate.endAt);
  if(start===null||end===null||end<=start)throw failure('dates');
  const people=new Set(involved(candidate));
  return meetings.flatMap(meeting=> {
    if(meeting.id===excludeId||meeting.status==='cancelled')return [];
    const otherStart=instant(meeting.startAt),otherEnd=instant(meeting.endAt);
    if(otherStart===null||otherEnd===null||otherEnd<=otherStart||start>=otherEnd||otherStart>=end)return [];
    const personIds=involved(meeting).filter(id=>people.has(id));if(!personIds.length)return [];
    const restricted=meeting.workspaceId!==workspaceId||meeting.restricted===true;
    return [{kind:restricted?'occupied':'recorded-meeting',meetingId:restricted?'':meeting.id||'',title:restricted?'':String(meeting.title||''),
      startAt:meeting.startAt,endAt:meeting.endAt,personIds,restricted}];
  });
}

export function normalizeMeeting(input,{workspaceId,projects=[],people=[],meetings=[],excludeId=''}={}) {
  if(!object(input)||typeof input.title!=='string'||!input.title.trim())throw failure('title');
  if(typeof workspaceId!=='string'||!workspaceId)throw failure('workspace');
  const projectId=input.projectId??'';
  if(typeof projectId!=='string'||projectId&&!projects.some(project=>project.id===projectId&&project.workspaceId===workspaceId))throw failure('workspace');
  const startAt=localDateTimeToUTC(input.startLocal),endAt=localDateTimeToUTC(input.endLocal);
  if(instant(endAt)<=instant(startAt))throw failure('dates');
  const allowed=permittedPeople(people,workspaceId),organizerId=input.organizerId;
  if(typeof organizerId!=='string'||!allowed.has(organizerId)||!Array.isArray(input.participantIds)||!input.participantIds.length||
      input.participantIds.some(id=>typeof id!=='string'||!allowed.has(id)))throw failure('owner');
  const participantIds=[...new Set(input.participantIds)],minuteTakerId=input.minuteTakerId??'';
  if(typeof minuteTakerId!=='string'||minuteTakerId&&(!allowed.has(minuteTakerId)||!new Set([organizerId,...participantIds]).has(minuteTakerId)))throw failure('owner');
  const text=key=>{const value=input[key]??'';if(typeof value!=='string')throw failure('record');return value.trim();};
  const metadata={workspaceId,title:input.title.trim(),projectId,startAt,endAt,timezone:SCHEDULE_TZ,organizerId,participantIds,minuteTakerId,
    location:text('location'),meetingUrl:safeURL(input.meetingUrl??''),agenda:text('agenda'),overrideReason:text('overrideReason')};
  const conflicts=meetingConflicts(metadata,meetings,{workspaceId,excludeId});
  if(conflicts.length&&!metadata.overrideReason)throw failure('conflict',conflicts);
  return {...metadata,conflicts};
}

export function validMeetingRecord(record,{workspaceId=record?.workspaceId,projects=[],people=[]}={}) {
  if(!object(record)||typeof record.id!=='string'||!record.id||record.workspaceId!==workspaceId||!workspaceId||
      typeof record.title!=='string'||!record.title.trim()||record.timezone!==SCHEDULE_TZ||!['planned','held','cancelled'].includes(record.status))return false;
  const start=instant(record.startAt),end=instant(record.endAt);if(start===null||end===null||end<=start)return false;
  if(typeof record.projectId!=='string'||record.projectId&&!projects.some(project=>project.id===record.projectId&&project.workspaceId===workspaceId))return false;
  const allowed=permittedPeople(people,workspaceId);
  if(typeof record.organizerId!=='string'||!allowed.has(record.organizerId)||!Array.isArray(record.participantIds)||!record.participantIds.length||
      new Set(record.participantIds).size!==record.participantIds.length||record.participantIds.some(id=>typeof id!=='string'||!allowed.has(id)))return false;
  if(record.minuteTakerId!==undefined&&(typeof record.minuteTakerId!=='string'||record.minuteTakerId&&!new Set([record.organizerId,...record.participantIds]).has(record.minuteTakerId)))return false;
  if(['location','agenda','overrideReason'].some(key=>record[key]!==undefined&&typeof record[key]!=='string'))return false;
  if(['heldAt','cancelledAt'].some(key=>record[key]!==undefined&&record[key]!==''&&instant(record[key])===null))return false;
  try {safeURL(record.meetingUrl??'');return true;}catch {return false;}
}

export function selectScheduleItems(state,{workspaceId,projectId='all',personId='all',query='',startDate='',endDate='',day='',week='',includeCancelled=false}={}) {
  if(day){startDate=day;endDate=day;}else if(week){const dates=weekDays(week);startDate=dates[0];endDate=dates[6];}
  if(startDate||endDate){startDate=startDate||endDate;endDate=endDate||startDate;requireDay(startDate);requireDay(endDate);if(endDate<startDate)throw failure('dates');}
  const rangeStart=startDate?instant(localDateTimeToUTC(`${startDate}T00:00`)):null;
  const rangeEnd=endDate?instant(localDateTimeToUTC(`${addDays(endDate,1)}T00:00`)):null;
  const projectNames=new Map((state.projects||[]).filter(project=>project.workspaceId===workspaceId).map(project=>[project.id,project.title]));
  const needle=String(query).trim().toLocaleLowerCase();
  const scoped=record=>record.workspaceId===workspaceId&&(projectId==='all'||record.projectId===projectId);
  const matches=(record,extra='')=>!needle||[record.title,record.notes,record.agenda,record.location,projectNames.get(record.projectId),extra].filter(Boolean).join(' ').toLocaleLowerCase().includes(needle);
  const tasks=(state.tasks||[]).filter(task=>scoped(task)&&validDay(task.targetDate)&&(personId==='all'||(personId==='unassigned'?!task.ownerId:task.ownerId===personId))&&
    (!startDate||task.targetDate>=startDate&&task.targetDate<=endDate)&&matches(task)).map(task=>({kind:'task',id:task.id,title:task.title,allDay:true,date:task.targetDate,projectId:task.projectId,ownerId:task.ownerId||'',record:task}));
  const meetings=(state.meetings||[]).filter(meeting=> {
    const start=instant(meeting.startAt),end=instant(meeting.endAt);
    return scoped(meeting)&&(includeCancelled||meeting.status!=='cancelled')&&start!==null&&end!==null&&end>start&&
      (personId==='all'||involved(meeting).includes(personId))&&(rangeStart===null||start<rangeEnd&&end>rangeStart)&&matches(meeting);
  }).map(meeting=>({kind:'meeting',id:meeting.id,title:meeting.title,allDay:false,date:utcToLocalDateTime(meeting.startAt).slice(0,10),
    startDate:utcToLocalDateTime(meeting.startAt).slice(0,10),endDate:utcToLocalDateTime(new Date(instant(meeting.endAt)-1).toISOString()).slice(0,10),
    startAt:meeting.startAt,endAt:meeting.endAt,timezone:meeting.timezone||SCHEDULE_TZ,projectId:meeting.projectId,record:meeting}));
  return [...tasks,...meetings].sort((a,b)=>a.date.localeCompare(b.date)||Number(b.allDay)-Number(a.allDay)||String(a.startAt||'').localeCompare(String(b.startAt||''))||String(a.title).localeCompare(String(b.title)));
}

export function groupScheduleItems(items,dates) {
  const days=dates||[...new Set(items.flatMap(item=>item.allDay?[item.date]:Array.from({length:Math.round((Date.parse(`${item.endDate}T12:00:00Z`)-Date.parse(`${item.startDate}T12:00:00Z`))/DAY_MS)+1},(_,index)=>addDays(item.startDate,index))))].sort();
  return days.map(date=>{requireDay(date);const allDay=items.filter(item=>item.allDay&&item.date===date),timed=items.filter(item=>!item.allDay&&item.startDate<=date&&item.endDate>=date);return {date,allDay,timed,items:[...allDay,...timed]};});
}

// RFC 5545 text escaping, CRLF and UTF-8-aware 75-octet folding; no invitations are sent.
function icsText(value) {return String(value??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'');}
function foldLine(value) {
  const encoder=new TextEncoder(),lines=[];let line='',bytes=0;
  for(const character of value){const size=encoder.encode(character).length;if(bytes+size>75){lines.push(line);line=' ';bytes=1;}line+=character;bytes+=size;}
  lines.push(line);return lines.join('\r\n');
}
function icsInstant(value) {const milliseconds=instant(value);if(milliseconds===null)throw failure('dates');return new Date(milliseconds).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
export function exportMeetingICS(meeting,{now=new Date()}={}) {
  if(typeof meeting?.id!=='string'||!meeting.id)throw failure('record');
  if(instant(meeting.startAt)===null||instant(meeting.endAt)===null||instant(meeting.endAt)<=instant(meeting.startAt))throw failure('dates');
  const url=safeURL(meeting.meetingUrl??''),stamp=now instanceof Date?now.toISOString():new Date(now).toISOString();
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DWDG ONE//Local Preview//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    `UID:${encodeURIComponent(meeting.id)}@dwdg-one-preview.local`,`DTSTAMP:${icsInstant(stamp)}`,`DTSTART:${icsInstant(meeting.startAt)}`,`DTEND:${icsInstant(meeting.endAt)}`,
    `SUMMARY:${icsText(meeting.title)}`,`STATUS:${meeting.status==='cancelled'?'CANCELLED':meeting.status==='held'?'CONFIRMED':'TENTATIVE'}`];
  if(meeting.location)lines.push(`LOCATION:${icsText(meeting.location)}`);
  if(meeting.agenda)lines.push(`DESCRIPTION:${icsText(meeting.agenda)}`);
  if(url)lines.push(`URL:${url}`);
  lines.push('END:VEVENT','END:VCALENDAR');return lines.map(foldLine).join('\r\n')+'\r\n';
}

export function createMeetingFixtures(projects,people,today=localParts(Date.now()).slice(0,10)) {
  requireDay(today);const workspaceIds=[...new Set(projects.map(project=>project.workspaceId))];
  return workspaceIds.flatMap((workspaceId,index)=>{
    const project=projects.find(row=>row.workspaceId===workspaceId),members=people.filter(person=>person.workspaceId===workspaceId);
    if(!project||!members.length)return [];
    const organizerId=people.find(person=>person.id==='demo-admin'&&person.workspaceId==='*')?.id||members[0].id;
    const hour=String(9+index%8).padStart(2,'0');
    const metadata=normalizeMeeting({title:`${project.title} coordination`,projectId:project.id,startLocal:`${today}T${hour}:00`,endLocal:`${today}T${hour}:45`,
      organizerId,participantIds:[members[0].id],minuteTakerId:members[0].id,agenda:'Illustrative coordination meeting. External availability is unknown.'},{workspaceId,projects,people});
    return [{...metadata,id:`demo-meeting-${workspaceId}`,status:'planned',sample:true}];
  });
}
