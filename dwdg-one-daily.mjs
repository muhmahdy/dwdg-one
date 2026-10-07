// Derived local views only: these helpers never copy, update or persist canonical tasks.
const GROUPS = ['overdue', 'today', 'upcoming', 'undated', 'completed'];
const DAY_MS = 24 * 60 * 60 * 1000;

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value;
}

function requireDay(value) {
  if (!validDate(value)) throw new RangeError('A valid YYYY-MM-DD calendar date is required.');
  return value;
}

export function todayISO(now = new Date(), timezone = 'Asia/Jakarta') {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(+date)) throw new RangeError('A valid instant is required.');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function taskDateGroup(task, today = todayISO()) {
  requireDay(today);
  if (task.status === 'done') return 'completed';
  if (!validDate(task.targetDate)) return 'undated';
  return task.targetDate < today ? 'overdue' : task.targetDate === today ? 'today' : 'upcoming';
}

export function selectDailyTasks(state, {
  workspaceId, ownerId = 'all', actorId = 'demo-admin', projectId = 'all',
  status = 'all', dateGroup = 'all', query = '', people = [], today = todayISO()
} = {}) {
  requireDay(today);
  const owner = ownerId === 'me' ? actorId : ownerId;
  const queryText = String(query).trim().toLocaleLowerCase();
  const projectNames = new Map((state.projects || [])
    .filter(project => project.workspaceId === workspaceId).map(project => [project.id, project.title]));
  const personNames = new Map(people.filter(person => person.workspaceId === workspaceId || person.workspaceId === '*')
    .map(person => [person.id, person.name]));
  return (state.tasks || []).filter(task => {
    if (task.workspaceId !== workspaceId || (projectId !== 'all' && task.projectId !== projectId)) return false;
    if (owner === 'unassigned' ? !!task.ownerId : owner !== 'all' && task.ownerId !== owner) return false;
    if (status !== 'all' && task.status !== status) return false;
    if (dateGroup !== 'all' && taskDateGroup(task, today) !== dateGroup) return false;
    return !queryText || [task.title, task.notes, personNames.get(task.ownerId), projectNames.get(task.projectId)]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(queryText);
  });
}

export function groupDailyTasks(tasks, today = todayISO()) {
  requireDay(today);
  const groups = GROUPS.map(id => ({id, tasks: []}));
  const byId = new Map(groups.map(group => [group.id, group]));
  for (const task of tasks) byId.get(taskDateGroup(task, today)).tasks.push(task);
  return groups;
}

function completionDate(task, timezone) {
  const value = task.completedAt;
  // A due date, updatedAt, date-only field or invalid timestamp is not completion evidence.
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) ||
      !validDate(value.slice(0, 10)) || Number.isNaN(Date.parse(value))) return null;
  return todayISO(new Date(value), timezone);
}

export function completionActivity(state, {
  workspaceId, ownerId = 'all', actorId = 'demo-admin', days = 7,
  timezone = 'Asia/Jakarta', today = todayISO(new Date(), timezone)
} = {}) {
  requireDay(today);
  if (!Number.isInteger(days) || days < 1 || days > 366) throw new RangeError('Use a period from 1 to 366 days.');
  // Validate the timezone even when there are no dated completions.
  todayISO(new Date(`${today}T12:00:00Z`), timezone);
  const end = Date.parse(`${today}T12:00:00Z`);
  const buckets = Array.from({length: days}, (_, index) => ({
    date: new Date(end - (days - index - 1) * DAY_MS).toISOString().slice(0, 10),
    count: null, taskIds: [], observed: false, partial: index === days - 1
  }));
  const byDate = new Map(buckets.map(bucket => [bucket.date, bucket]));
  const completed = selectDailyTasks(state, {workspaceId, ownerId, actorId, status: 'done', today});
  const unknownTaskIds = [];
  let knownCompleted = 0;
  for (const task of completed) {
    const date = completionDate(task, timezone);
    if (!date) { unknownTaskIds.push(task.id); continue; }
    knownCompleted++;
    const bucket = byDate.get(date);
    if (bucket) { bucket.taskIds.push(task.id); bucket.count = bucket.taskIds.length; }
  }
  // The preview records completion instants, not complete day-level observation coverage.
  // Positive bins disclose known records; an empty bin is unavailable, never an invented zero.
  return {
    buckets, unknownCompleted: unknownTaskIds.length, unknownTaskIds, knownCompleted,
    average: null,
    basis: {kind: 'recorded-completions-only', timezone, startDate: buckets[0].date, endDate: today, observedDays: 0}
  };
}
