// dwdg'ONE prototype: demo data. Invented names and records; photos supplied by the product owner.
// The demo week is fixed (Mon 5 Oct 2026 to Sun 11 Oct 2026) so the data always reads coherently.
// Record shapes follow the PRD entities: entity_task, entity_milestone, entity_blocker, entity_decision,
// entity_meeting, entity_availability, entity_resource, entity_notification, entity_activity (Changes).
window.DEMO = {today: '2026-10-06'};

window.DIVISIONS = [
  {id: 'ee', name: 'External Engagement', short: 'EE', icon: 'div-ee'},
  {id: 'mcit', name: 'Marketing Communication & IT', short: 'MCIT', icon: 'div-mcit'},
  {id: 'hr', name: 'Human Resources', short: 'HR', icon: 'div-hr'},
  {id: 'fnl', name: 'Finance & Legal', short: 'FnL', icon: 'div-fnl'},
  {id: 'sng', name: 'Strategy & Growth', short: 'SnG', icon: 'div-sng'},
  {id: 'cons', name: 'Consulting', short: 'Cons', icon: 'div-cons'},
];
window.ROLES = {
  president: {label: 'President', icon: 'role-president', rank: 5},
  vp: {label: 'Vice President', icon: 'role-vp', rank: 4},
  director: {label: 'Director', icon: 'role-director', rank: 3},
  codirector: {label: 'Co-Director', icon: 'role-co-director', rank: 2},
  member: {label: 'Member', icon: 'role-member', rank: 1},
};

window.seedData = function () {
  // gcal: the member connected Google Calendar (D24, two-way sync). hasSchedule: recorded unavailable time in DWDG'ONE.
  const P = (id, name, div, role, photo, extra = {}) => ({id, name, first: name.split(' ')[0], div, role, photo, title: extra.title || '', admin: !!extra.admin, hasSchedule: extra.hasSchedule !== false, gcal: !!extra.gcal, status: extra.status || 'active'});
  const people = [
    P('fadhil', 'Fadhil Akbar', null, 'president', 'p13', {gcal: true}),
    P('raka', 'Raka Pratama', null, 'vp', 'p01', {gcal: true}),
    P('mahdy', 'Mahdy', 'sng', 'director', null, {admin: true, gcal: true}),
    P('nadia', 'Nadia Puspita', 'sng', 'codirector', 'p06'),
    P('salsa', 'Salsa Nabila', 'sng', 'member', 'p02', {gcal: true}),
    P('fikri', 'Fikri Ramadhan', 'sng', 'member', 'p05'),
    P('annisa', 'Annisa Fitri', 'sng', 'member', null, {hasSchedule: false}),
    P('bagas', 'Bagas Wirawan', 'sng', 'member', null),
    P('rani', 'Rani Kusuma', 'ee', 'director', 'p04', {gcal: true}),
    P('alya', 'Alya Maharani', 'ee', 'codirector', 'p07'),
    P('arief', 'Arief Wicaksono', 'ee', 'member', 'p08', {title: 'Client'}),
    P('tasya', 'Tasya Amelia', 'ee', 'member', 'p09', {title: 'Partner'}),
    P('dewi', 'Dewi Kartika', 'ee', 'member', null, {title: 'Partner'}),
    P('eko', 'Eko Saputro', 'ee', 'member', null, {title: 'Client', hasSchedule: false}),
    P('galih', 'Galih Permana', 'mcit', 'director', 'p21'),
    P('laras', 'Laras Wulandari', 'mcit', 'codirector', 'p18'),
    P('yoga', 'Yoga Prasetyo', 'mcit', 'member', 'p17'),
    P('hana', 'Hana Safitri', 'mcit', 'member', 'p22'),
    P('farah', 'Farah Nadhira', 'mcit', 'member', null),
    P('gilang', 'Gilang Ramadan', 'mcit', 'member', null),
    P('kirana', 'Kirana Dewi', 'hr', 'director', 'p16'),
    P('aisyah', 'Aisyah Rahma', 'hr', 'codirector', 'p11'),
    P('zahra', 'Zahra Aulia', 'hr', 'member', 'p14'),
    P('indah', 'Indah Permata', 'hr', 'member', null),
    P('joko', 'Joko Susilo', 'hr', 'member', null),
    P('daniel', 'Daniel Simanjuntak', 'fnl', 'director', 'p19'),
    P('citra', 'Citra Lestari', 'fnl', 'codirector', 'p24'),
    P('rafi', 'Rafi Firmansyah', 'fnl', 'member', 'p12'),
    P('kevin', 'Kevin Hartono', 'fnl', 'member', null),
    P('lutfi', 'Lutfi Hakim', 'fnl', 'member', null),
    P('reza', 'Reza Mahendra', 'cons', 'director', 'p23'),
    P('ilham', 'Ilham Nugraha', 'cons', 'codirector', 'p15', {title: 'CD of Project Associates'}),
    P('dimas', 'Dimas Hidayat', 'cons', 'codirector', 'p03', {title: 'CD of Knowledge', hasSchedule: false}),
    P('putri', 'Putri Anggraini', 'cons', 'codirector', 'p20', {title: 'CD of TnD'}),
    P('bima', 'Bima Saputra', 'cons', 'member', 'p10'),
    P('maya', 'Maya Sari', 'cons', 'member', null),
    P('naufal', 'Naufal Hidayat', 'cons', 'member', null),
    P('olivia', 'Olivia Tan', 'cons', 'member', null),
    P('prasetyo', 'Prasetyo Adi', 'cons', 'member', null),
    P('qonita', 'Qonita Zahra', 'cons', 'member', null),
    P('sekar', 'Sekar Ayu', 'sng', 'member', null, {status: 'pending'}),
  ];
  const h = x => Math.round(x * 60);

  // Unavailable time recorded in DWDG'ONE (availability_declared). Weekly series are explicit; notes stay private.
  let uid = 0;
  const U = (who, day, s, e, note) => ({id: `u${++uid}`, who, day, date: null, weekly: true, start: s, end: e, note});
  const unavailable = [
    U('mahdy', 1, h(12), h(14), 'Econometrics class'), U('mahdy', 3, h(9), h(11.75), 'Statistics lab'), U('mahdy', 5, h(13), h(15), 'Thesis meeting'),
    U('salsa', 2, h(8), h(10.5), 'Class'), U('salsa', 4, h(13), h(15.5), 'Class'),
    U('nadia', 1, h(9), h(11), 'Class'), U('nadia', 2, h(14), h(16), 'Lab'),
    U('fikri', 2, h(10.5), h(12), 'Class'), U('fikri', 3, h(13), h(15), 'Class'),
    U('raka', 2, h(13), h(14.5), 'Class'), U('rani', 2, h(9), h(10), 'Class'), U('alya', 3, h(10), h(12), 'Class'),
    U('kirana', 2, h(15), h(17), 'Class'), U('galih', 4, h(9), h(12), 'Class'), U('reza', 2, h(11), h(13), 'Class'),
    U('ilham', 3, h(8), h(10), 'Class'), U('putri', 2, h(16), h(18), 'Class'), U('daniel', 1, h(15), h(17), 'Class'),
  ];
  // Busy time imported from Google Calendar for members who connected it (D24). Titles are visible only to their owner.
  const G = (id, who, date, s, e, title) => ({id, who, date, start: s, end: e, title});
  const gbusy = [
    G('g1', 'mahdy', '2026-10-07', h(19), h(21), 'Family dinner'), G('g2', 'mahdy', '2026-10-08', h(16), h(17), 'Dentist'),
    G('g3', 'salsa', '2026-10-06', h(16), h(17.5), 'Futsal'), G('g4', 'raka', '2026-10-08', h(13), h(14), 'Bank appointment'),
    G('g5', 'rani', '2026-10-09', h(9), h(10.5), 'Lecture'),
  ];

  // Tasks: status follows work_task_lifecycle. Blocked is a separate blocker record, never a status.
  const T = (id, title, owner, due, x = {}) => ({id, title, owner, due: due || null, time: x.time ?? null, status: x.status || 'todo', reviewer: x.reviewer || null, project: x.project || null, milestone: x.ms || null, div: x.div || null, notes: x.notes || '', evidence: x.evidence || '', doneAt: x.status === 'done' ? (x.doneAt || '2026-10-05') : null, createdBy: x.by || owner, createdAt: x.at || '2026-10-01T09:00', offer: x.offer || null, meeting: x.meeting || null, start: x.start || null, deps: x.deps || [], assignees: x.assignees || [], parent: x.parent || null, inWbs: !!x.inWbs, phase: !!x.phase, remarks: x.remarks || '', order: x.order ?? null, icon: x.icon || null, reactions: x.reactions || {}, links: x.links || [], mentions: x.mentions || [], trashed: false});
  const tasks = [
    T('t1', 'Draft Q4 growth priorities for the SnG roadmap', 'mahdy', '2026-10-06', {icon: {n: 'chart', c: 'blue'}, reactions: {'🔥': ['salsa'], '👍': ['nadia', 'fikri']}, deps: [{id: 't11', type: 'SS'}], assignees: [{id: 'salsa', state: 'joined', by: 'mahdy', at: '2026-10-02T09:00', direct: true}], start: '2026-10-01', time: h(14), status: 'doing', project: 'p-roadmap', ms: 'ms2', div: 'sng', by: 'salsa', at: '2026-10-02T09:14', notes: 'Pull from the September retro and the member survey. Three priorities at most, each with an owner.', links: ['r-retro']}),
    T('t2', 'Review the partner shortlist with Rani before Friday’s call', 'mahdy', '2026-10-03', {div: 'ee', by: 'rani', at: '2026-09-29T16:40', offer: 'o0'}),
    T('t3', 'Summarise member survey answers for open recruitment', 'mahdy', '2026-10-08', {start: '2026-10-06', project: 'p-survey', div: 'sng', by: 'fikri', at: '2026-10-03T10:05'}),
    T('t4', 'Book a café for the monthly SnG retro with Salsa', 'mahdy', '2026-10-09', {icon: {n: 'coffee', c: 'yellow'}, reactions: {'😍': ['salsa']}, div: 'sng', by: 'mahdy', at: '2026-10-04T20:12', mentions: ['salsa']}),
    T('t5', 'Read the Consulting knowledge brief', 'mahdy', null, {div: 'cons', by: 'dimas', at: '2026-10-02T13:30', offer: 'o00'}),
    T('t6', 'Send the strategy offsite agenda to Raka', 'mahdy', '2026-10-05', {status: 'done', div: 'sng', by: 'mahdy'}),
    T('t16', 'Update the decision packet template', 'mahdy', null, {div: 'sng', by: 'mahdy', at: '2026-10-06T09:50', meeting: 'm1', links: ['r-decision']}),
    T('t7', 'Collect alumni mentor contacts', 'nadia', '2026-10-09', {start: '2026-10-02', project: 'p-mentoring', ms: 'ms5', div: 'sng', by: 'mahdy', at: '2026-10-01T11:00'}),
    T('t8', 'Design the mentor matching form', 'salsa', '2026-10-10', {start: '2026-10-03', status: 'doing', project: 'p-mentoring', ms: 'ms6', div: 'sng', by: 'nadia', at: '2026-10-02T15:00'}),
    T('t9', 'Write the survey findings section', 'fikri', '2026-10-07', {start: '2026-09-29', status: 'review', reviewer: 'mahdy', project: 'p-survey', ms: 'ms3', div: 'sng', by: 'mahdy', at: '2026-09-28T09:30', evidence: 'https://docs.google.com/document/d/dwdg-survey-findings'}),
    T('t10', 'Clean the raw survey export', 'fikri', '2026-10-02', {status: 'done', project: 'p-survey', ms: 'ms4', div: 'sng', by: 'salsa', at: '2026-09-25T10:00', doneAt: '2026-10-02'}),
    T('t11', 'Map Q3 initiatives against outcomes', 'salsa', '2026-10-12', {icon: {n: 'compass', c: 'purple'}, start: '2026-09-28', status: 'doing', project: 'p-roadmap', ms: 'ms2', div: 'sng', by: 'mahdy', at: '2026-09-20T09:00'}),
    T('t20', 'Write the one-page roadmap', 'salsa', '2026-10-17', {icon: {n: 'pencil', c: 'orange'}, deps: [{id: 't12', type: 'FS'}], start: '2026-10-13', project: 'p-roadmap', ms: 'ms2', div: 'sng', by: 'mahdy', at: '2026-10-02T10:00'}),
    T('t12', 'Interview three division directors', 'nadia', '2026-10-14', {icon: {n: 'mic', c: 'red'}, reactions: {'💪': ['salsa']}, deps: [{id: 't11', type: 'FF'}], start: '2026-10-05', project: 'p-roadmap', ms: 'ms1', div: 'sng', by: 'mahdy', at: '2026-09-21T09:00'}),
    T('t13', 'Prepare Q3 strategy report slides', 'bagas', '2026-10-10', {start: '2026-10-01', status: 'review', reviewer: 'mahdy', project: 'p-q3', ms: 'ms7', div: 'sng', by: 'mahdy', at: '2026-08-04T09:00'}),
    T('t17', 'List faculties for the partner map', 'annisa', null, {project: 'p-map', div: 'sng', by: 'nadia', at: '2026-09-29T10:00'}),
    T('t14', 'Confirm venue for the partner breakfast', 'alya', '2026-10-08', {start: '2026-10-05', project: 'p-breakfast', ms: 'ms8', div: 'ee', by: 'rani'}),
    T('t15', 'Draft the Kopi Kultur benefit list', 'alya', '2026-10-08', {project: 'p-breakfast', div: 'ee', by: 'rani'}),
    T('t18', 'Write division page copy', 'yoga', '2026-10-15', {assignees: [{id: 'mahdy', state: 'invited', by: 'yoga', at: '2026-10-06T08:30'}], start: '2026-10-07', project: 'p-site', ms: 'ms9', div: 'mcit', by: 'laras'}),
    T('t19', 'Prepare session 1 slides', 'bima', '2026-10-15', {start: '2026-10-09', project: 'p-hms', ms: 'ms10', div: 'cons', by: 'ilham'}),
  ];

  // Task offers across divisions (access_delegation): nothing is assigned until the recipient accepts.
  const O = (id, from, to, title, result, due, x = {}) => ({id, from, to, title, result, due, project: x.project || null, state: x.state || 'pending', note: x.note || '', task: x.task || null, at: x.at || '2026-10-05T10:00', answeredAt: x.answeredAt || null});
  const offers = [
    O('o0', 'rani', 'mahdy', 'Review the partner shortlist with Rani before Friday’s call', 'Comments on the shortlist in the shared sheet', '2026-10-03', {state: 'accepted', task: 't2', at: '2026-09-29T16:40', answeredAt: '2026-09-29T18:02'}),
    O('o00', 'dimas', 'mahdy', 'Read the Consulting knowledge brief', 'Two or three notes on what SnG can reuse', null, {state: 'accepted', task: 't5', at: '2026-10-02T13:30', answeredAt: '2026-10-02T14:10'}),
    O('o1', 'alya', 'mahdy', 'Introduce EE to the UII career centre contact', 'One email introduction with the contact copied', '2026-10-09', {project: 'p-breakfast', at: '2026-10-06T08:10', note: 'We want them at the partner breakfast. A short intro from you is enough.'}),
    O('o2', 'yoga', 'salsa', 'Review the recruitment page copy', 'Comments on the draft in the Docs file', '2026-10-12', {project: 'p-site', at: '2026-10-05T19:30'}),
    O('o3', 'mahdy', 'dimas', 'Share the knowledge brief format with SnG', 'The template as a link in SnG Resources', '2026-10-13', {at: '2026-10-05T11:00'}),
  ];

  const PR = (id, name, div, stage, lead, start, due, goal, by, at, x = {}) => ({id, name, div, stage, lead, pm: x.pm || null, start, due, goal, scopeIn: x.scopeIn || [], scopeOut: x.scopeOut || [], reason: x.reason || '', team: x.team || [], org: !!x.org, createdBy: by, createdAt: at});
  const projects = [
    PR('p-roadmap', 'SnG roadmap 2026', 'sng', 'active', 'salsa', '2026-09-01', '2026-10-18', 'Agree the three SnG priorities for 2026 with every division director and turn them into owned projects.', 'mahdy', '2026-09-01T10:00', {pm: 'nadia', scopeIn: ['Interviews with six division directors', 'Three priorities, each with one owner', 'A one-page roadmap'], scopeOut: ['Budget allocation (FnL decides)', 'Hiring new members'], team: [{id: 'citra', state: 'joined', by: 'salsa', at: '2026-09-20T10:00', answeredAt: '2026-09-20T13:05'}, {id: 'ilham', state: 'invited', by: 'salsa', at: '2026-10-05T16:00'}]}),
    PR('p-survey', 'Member growth survey', 'sng', 'active', 'fikri', '2026-09-22', '2026-10-09', 'Understand why members join, stay and leave, using this term’s survey and interviews.', 'salsa', '2026-09-22T09:00', {scopeIn: ['Survey of active members', 'Five follow-up interviews', 'Findings note'], scopeOut: ['Alumni outside the current batch']}),
    PR('p-mentoring', 'Alumni mentoring pilot', 'sng', 'active', 'nadia', '2026-10-01', '2026-10-31', 'Pair 12 new members with alumni mentors for one term and measure retention.', 'mahdy', '2026-10-01T09:00', {pm: 'salsa', scopeIn: ['12 mentor pairs', 'Matching form', 'Monthly check-in'], scopeOut: ['Paid mentoring', 'Mentors outside UII alumni']}),
    PR('p-q3', 'Q3 strategy report', 'sng', 'review', 'bagas', '2026-08-04', '2026-10-10', 'Report Q3 outcomes against the initiatives agreed in June.', 'mahdy', '2026-08-04T09:00'),
    PR('p-map', 'Campus partner map', 'sng', 'planned', null, null, null, 'List faculties and student bodies that could become partners next term.', 'nadia', '2026-09-28T14:00'),
    PR('p-prio25', 'Division priorities 2025', 'sng', 'completed', 'mahdy', '2026-06-02', '2026-09-30', 'Close out the 2025 priorities and record what carried over.', 'mahdy', '2026-06-02T09:00'),
    PR('p-breakfast', 'Partner breakfast October', 'ee', 'active', 'alya', '2026-09-15', '2026-10-20', 'Host six partner organisations for a breakfast and renew two agreements.', 'rani', '2026-09-15T09:00'),
    PR('p-plan26', 'DWDG annual plan 2026', 'sng', 'active', 'fadhil', '2026-09-15', '2026-11-30', 'One plan for the whole organisation: the batch calendar, the six division goals and the shared events.', 'fadhil', '2026-09-15T08:00', {org: true, pm: 'mahdy', scopeIn: ['Batch calendar', 'Division goals', 'Shared events'], scopeOut: ['Division budgets']}),
    PR('p-orient', 'Batch 2026 orientation', 'hr', 'planned', 'kirana', '2026-10-24', '2026-11-08', 'Welcome the new batch: two orientation days, buddy pairs and the first division visits.', 'raka', '2026-10-01T10:00', {org: true, pm: 'zahra'}),
    PR('p-site', 'Website relaunch', 'mcit', 'active', 'laras', '2026-09-01', '2026-10-25', 'Relaunch the DWDG site with division pages and an updated recruitment section.', 'galih', '2026-09-01T09:00', {team: [{id: 'mahdy', state: 'invited', by: 'laras', at: '2026-10-06T07:40'}]}),
    PR('p-oprec', 'Open recruitment 2026', 'hr', 'planned', 'aisyah', '2026-10-20', '2026-11-15', 'Recruit the next batch with a clear selection rubric.', 'kirana', '2026-09-20T09:00'),
    PR('p-hms', 'HMS data workshop', 'cons', 'active', 'ilham', '2026-10-01', '2026-10-24', 'Deliver a two-session data workshop for Himpunan Mahasiswa Statistika.', 'reza', '2026-10-01T09:00', {pm: 'putri'}),
    PR('p-close', 'Monthly close September', 'fnl', 'completed', 'citra', '2026-09-28', '2026-10-03', 'Reconcile September allocations, commitments and payments.', 'daniel', '2026-09-28T09:00'),
  ];

  // Milestones (work_milestones): achieved only when someone records it, never because a date passed.
  const MS = (id, project, title, owner, target, state, at) => ({id, project, title, owner, target, state, achievedAt: at || null});
  const milestones = [
    MS('ms1', 'p-roadmap', 'Director interviews done', 'nadia', '2026-10-14', 'active'),
    MS('ms-pl1', 'p-plan26', 'Division goals collected', 'mahdy', '2026-10-20', 'active'),
    MS('ms-or1', 'p-orient', 'Orientation day one', 'kirana', '2026-10-24', 'proposed'),
    MS('ms2', 'p-roadmap', 'Priorities agreed', 'salsa', '2026-10-18', 'active'),
    MS('ms4', 'p-survey', 'Raw data cleaned', 'fikri', '2026-10-02', 'achieved', '2026-10-02'),
    MS('ms3', 'p-survey', 'Findings reviewed', 'fikri', '2026-10-09', 'review'),
    MS('ms5', 'p-mentoring', 'Mentor list ready', 'nadia', '2026-10-16', 'active'),
    MS('ms6', 'p-mentoring', 'First pairs matched', 'salsa', '2026-10-24', 'active'),
    MS('ms7', 'p-q3', 'Report approved', 'bagas', '2026-10-10', 'review'),
    MS('ms8', 'p-breakfast', 'Venue confirmed', 'alya', '2026-10-09', 'active'),
    MS('ms9', 'p-site', 'Division pages live', 'laras', '2026-10-20', 'active'),
    MS('ms10', 'p-hms', 'Session 1 delivered', 'ilham', '2026-10-17', 'active'),
  ];

  // Blockers (work_blockers): owner, severity, needed action; stays visible until resolved or withdrawn.
  const B = (id, task, project, text, owner, severity, action, by, at) => ({id, task, project, text, owner, severity, action, state: 'open', openedBy: by, openedAt: at, resolution: '', resolvedAt: null});
  const blockers = [
    B('b1', 't11', 'p-roadmap', 'Q3 outcome numbers from Finance are not in yet', 'citra', 'medium', 'Share the September close figures', 'salsa', '2026-10-04T19:20'),
    B('b2', 't7', 'p-mentoring', 'No access to the alumni contact sheet', 'rani', 'high', 'Grant view access to the alumni sheet', 'nadia', '2026-10-05T13:05'),
    B('b3', 't18', 'p-site', 'Nobody knows who owns the hosting account', 'galih', 'high', 'Name the account owner and share the access route', 'laras', '2026-10-03T10:00'),
  ];

  // Decisions (work_decisions): a comment saying approved never replaces the record.
  const DC = (id, project, question, result, approver, state, at, x = {}) => ({id, project, meeting: x.meeting || null, question, result, approver, state, decidedAt: state === 'awaiting' ? null : at, createdBy: x.by || approver, createdAt: at});
  const decisions = [
    DC('d1', 'p-roadmap', 'Limit 2026 to three SnG priorities?', 'Yes. Three priorities, each with one owner.', 'mahdy', 'approved', '2026-09-30T16:00'),
    DC('d3', 'p-mentoring', 'How many pairs in the pilot?', '12 pairs for one term.', 'mahdy', 'approved', '2026-10-01T10:00'),
    DC('d2', 'p-survey', 'Publish the survey findings to all members?', 'Proposed: share the summary, keep raw answers within SnG.', 'raka', 'awaiting', '2026-10-05T21:40', {by: 'fikri'}),
    DC('d4', 'p-roadmap', 'Use the decision packet for every proposal?', 'Yes, starting this week.', 'mahdy', 'approved', '2026-10-06T09:40', {meeting: 'm1'}),
  ];

  // Meetings (entity_meeting): agenda, note-taker, project link and outcomes; synced to Google Calendar for connected guests.
  const M = (id, title, organizer, date, s, e, attendees, where, x = {}) => ({id, title, organizer, date, start: s, end: e, where, agenda: x.agenda || '', icon: x.icon || null, reactions: x.reactions || {}, notetaker: x.notetaker || organizer, project: x.project || null, state: x.state || 'planned', reason: '', minutes: x.minutes || null, responses: Object.fromEntries(attendees.map(a => [a, x.pending && x.pending.includes(a) ? 'pending' : x.declined && x.declined.includes(a) ? 'declined' : 'accepted'])), createdAt: x.at || '2026-10-01T09:00'});
  const meetings = [
    M('m1', 'Strategy review', 'mahdy', '2026-10-06', h(9), h(9.75), ['mahdy', 'salsa', 'fikri'], 'Kopi Kultur, Jakal', {icon: {n: 'target', c: 'green'}, reactions: {'👍': ['salsa', 'fikri']}, agenda: 'Roadmap progress\nSurvey findings timeline\nDecision packet', notetaker: 'salsa', project: 'p-roadmap', state: 'held', minutes: 'r-min1'}),
    M('m2', 'SnG weekly sync', 'raka', '2026-10-07', h(10), h(10.75), ['raka', 'mahdy', 'nadia', 'salsa'], 'https://meet.google.com/dwd-gsng-wkly', {pending: ['mahdy'], agenda: 'Blockers\nWeek plan', notetaker: 'nadia'}),
    M('m3', 'Partner call with Kopi Kultur', 'alya', '2026-10-08', h(11), h(12.25), ['alya', 'mahdy', 'rani'], 'Kopi Kultur, Jakal', {project: 'p-breakfast', agenda: 'Breakfast date\nBenefits for members'}),
    M('m4', 'Survey findings review', 'fikri', '2026-10-09', h(15), h(16), ['fikri', 'mahdy', 'salsa'], 'Ruang Sidang FBE', {project: 'p-survey', agenda: 'Walk through the findings section\nAgree what to publish'}),
    M('m5', 'Directors circle', 'fadhil', '2026-10-10', h(13), h(14.5), ['fadhil', 'raka', 'mahdy', 'rani', 'galih', 'kirana', 'daniel', 'reza'], 'https://meet.google.com/dwd-gdir-crcl', {agenda: 'Division updates\nQ4 calendar'}),
  ];

  const R = (id, kind, name, div, x = {}) => ({id, kind, name, div, parent: x.parent || null, url: x.url || '', body: x.body || '', purpose: x.purpose || '', project: x.project || null, meeting: x.meeting || null, owner: x.owner, contributors: x.contributors || [], createdBy: x.by || x.owner, createdAt: x.at || '2026-09-20T09:00', pinned: !!x.pinned, revisions: x.revisions || 0, archived: false, reports: [], brief: !!x.brief, ref: x.ref || null, editedBy: x.editedBy || null, editedAt: x.editedAt || null});
  const resources = [
    R('r-brand', 'folder', 'Brand assets', 'sng', {owner: 'salsa', contributors: ['fikri', 'bagas'], pinned: true, at: '2026-08-12T09:00', purpose: 'Logos and slide templates for SnG decks. Ask Salsa before adding new files.'}),
    R('r-logo', 'link', 'dwdg’ONE logo files', 'sng', {parent: 'r-brand', url: 'https://drive.google.com/drive/folders/dwdg-brand', owner: 'salsa', purpose: 'Official logo exports. Do not redraw the letters.'}),
    R('r-templates', 'folder', 'Templates', 'sng', {owner: 'mahdy', at: '2026-07-02T09:00'}),
    R('r-decision', 'note', 'Decision packet template', 'sng', {parent: 'r-templates', owner: 'mahdy', contributors: ['nadia'], body: 'Question\nOptions with benefit, cost, risk and owner\nRecommendation\nDecision, rationale and review date', revisions: 3}),
    R('r-retro', 'note', 'September retro notes', 'sng', {project: 'p-roadmap', owner: 'nadia', contributors: ['salsa', 'fikri', 'bagas', 'annisa'], at: '2026-09-30T19:00', body: 'What worked: weekly sync, survey turnout.\nWhat did not: unclear owners for follow-ups.\nCarry over: mentoring pilot.', revisions: 2, pinned: true}),
    R('r-brief-roadmap', 'note', 'SnG roadmap 2026 brief', 'sng', {project: 'p-roadmap', brief: true, owner: 'salsa', contributors: ['nadia'], at: '2026-09-01T10:30', revisions: 3, editedBy: 'nadia', editedAt: '2026-10-04T21:10', purpose: 'The project brief, edited from the project Overview.',
      body: '<h3>Background</h3><p>Every division set its own priorities last year, so SnG could not see where effort overlapped. This roadmap agrees three SnG priorities with all six directors before the new batch starts.</p><h3>Objectives</h3><ul><li>Interview every division director by <b>14 Oct</b></li><li>Agree three priorities, each with one owner</li><li>Publish a one-page roadmap the whole organisation can read</li></ul><h3>Deliverables</h3><ol><li>Interview notes in the shared folder</li><li>Decision packet for the priorities</li><li>The one-page roadmap</li></ol><h3>Where things are</h3><p>Interview guide: <a href="https://docs.google.com/document/d/dwdg-interview-guide" target="_blank" rel="noopener noreferrer">Google Docs</a>. Last retro: <a data-ref="resource:r-retro" href="#">September retro notes</a>. Mapping work happens in <a data-ref="task:t11" href="#">Map Q3 initiatives against outcomes</a>.</p>'}),
    R('r-lk-figma', 'link', 'Roadmap one-pager', 'sng', {project: 'p-roadmap', url: 'https://www.figma.com/file/dwdg-roadmap-onepager', owner: 'salsa', at: '2026-09-12T10:00'}),
    R('r-lk-guide', 'link', 'Director interview guide', 'sng', {project: 'p-roadmap', url: 'https://docs.google.com/document/d/dwdg-interview-guide', owner: 'nadia', at: '2026-09-10T10:00'}),
    R('r-lk-drive', 'link', 'Interview recordings', 'sng', {project: 'p-roadmap', url: 'https://drive.google.com/drive/folders/dwdg-interviews', owner: 'nadia', at: '2026-09-15T10:00', purpose: 'Only interviewers have access in Drive.'}),
    R('r-lk-notion', 'link', 'Strategy wiki', 'sng', {project: 'p-roadmap', url: 'https://www.notion.so/dwdg/strategy-wiki', owner: 'mahdy', at: '2026-09-02T10:00'}),
    R('r-ref-survey', 'link', 'Member growth survey', 'sng', {project: 'p-roadmap', ref: {type: 'project', id: 'p-survey'}, owner: 'salsa', at: '2026-09-20T10:00'}),
    R('r-survey', 'link', 'Survey responses (Google Sheets)', 'sng', {project: 'p-survey', url: 'https://docs.google.com/spreadsheets/d/dwdg-survey', owner: 'fikri', contributors: ['salsa'], at: '2026-09-26T10:00', purpose: 'Raw answers. Only SnG has access in Drive.'}),
    R('r-guide', 'note', 'How SnG runs decisions', 'sng', {owner: 'mahdy', body: 'Every proposal becomes a decision packet. The approving authority records approve, hold or reject with a reason and a review date.', revisions: 1}),
    R('r-min1', 'note', 'Strategy review minutes, 6 Oct', 'sng', {project: 'p-roadmap', meeting: 'm1', owner: 'salsa', at: '2026-10-06T09:48', body: 'Present: Mahdy, Salsa, Fikri.\nRoadmap: on track except the Q3 numbers (blocker with FnL).\nSurvey: findings ready for review on Wednesday.\nDecided: use the decision packet for every proposal.\nFollow-up: Mahdy updates the template.', revisions: 1}),
    R('r-partners', 'link', 'Partner list 2026', 'ee', {url: 'https://docs.google.com/spreadsheets/d/dwdg-partners', owner: 'alya', contributors: ['tasya', 'dewi']}),
  ];

  // Updates inbox (entity_notification): actionable, per person, read state kept.
  let nid = 0;
  const N = (to, type, actor, ref, at, read = false) => ({id: `n${++nid}`, to, type, actor, ref, at, read});
  const updates = [
    N('mahdy', 'offer', 'alya', {type: 'offer', id: 'o1'}, '2026-10-06T08:10'),
    N('mahdy', 'pinvite', 'laras', {type: 'project', id: 'p-site'}, '2026-10-06T07:40'),
    N('mahdy', 'tasked', 'yoga', {type: 'task', id: 't18'}, '2026-10-06T08:30'),
    N('mahdy', 'review', 'fikri', {type: 'task', id: 't9'}, '2026-10-05T21:30'),
    N('mahdy', 'review', 'bagas', {type: 'task', id: 't13'}, '2026-10-05T17:15', true),
    N('mahdy', 'invite', 'raka', {type: 'meeting', id: 'm2'}, '2026-10-05T18:00'),
    N('mahdy', 'overdue', null, {type: 'task', id: 't2'}, '2026-10-06T07:00'),
    N('mahdy', 'changed', 'fadhil', {type: 'meeting', id: 'm5'}, '2026-10-04T12:30', true),
    N('salsa', 'offer', 'yoga', {type: 'offer', id: 'o2'}, '2026-10-05T19:30'),
    N('salsa', 'minutes', 'mahdy', {type: 'meeting', id: 'm1'}, '2026-10-06T09:50'),
    N('dimas', 'offer', 'mahdy', {type: 'offer', id: 'o3'}, '2026-10-05T11:00'),
    N('citra', 'blocker', 'salsa', {type: 'task', id: 't11'}, '2026-10-04T19:20'),
    N('rani', 'blocker', 'nadia', {type: 'task', id: 't7'}, '2026-10-05T13:05'),
    N('raka', 'decision', 'fikri', {type: 'decision', id: 'd2'}, '2026-10-05T21:40'),
  ];

  // Changes (workspace history, changes-scope): one workspace at a time.
  let cid = 0;
  const C = (ws, actor, verb, target, at, from, to) => ({id: `c${++cid}`, ws, actor, verb, target, at, from: from || null, to: to || null});
  const changes = [
    C('sng', 'salsa', 'saved minutes for', {type: 'meeting', id: 'm1', name: 'Strategy review'}, '2026-10-06T09:48'),
    C('sng', 'mahdy', 'recorded a decision on', {type: 'project', id: 'p-roadmap', name: 'SnG roadmap 2026'}, '2026-10-06T09:40'),
    C('sng', 'fikri', 'changed status of', {type: 'task', id: 't9', name: 'Write the survey findings section'}, '2026-10-05T21:30', 'In progress', 'In review'),
    C('sng', 'nadia', 'raised a blocker on', {type: 'task', id: 't7', name: 'Collect alumni mentor contacts'}, '2026-10-05T13:05'),
    C('sng', 'salsa', 'raised a blocker on', {type: 'task', id: 't11', name: 'Map Q3 initiatives against outcomes'}, '2026-10-04T19:20'),
    C('sng', 'mahdy', 'changed stage of', {type: 'project', id: 'p-q3', name: 'Q3 strategy report'}, '2026-10-03T15:00', 'Active', 'In review'),
    C('sng', 'fikri', 'completed', {type: 'task', id: 't10', name: 'Clean the raw survey export'}, '2026-10-02T17:20'),
    C('sng', 'mahdy', 'created project', {type: 'project', id: 'p-mentoring', name: 'Alumni mentoring pilot'}, '2026-10-01T09:00'),
    C('sng', 'nadia', 'saved a revision of', {type: 'resource', id: 'r-retro', name: 'September retro notes'}, '2026-09-30T19:00', 'Revision 1', 'Revision 2'),
    C('ee', 'rani', 'created project', {type: 'project', id: 'p-breakfast', name: 'Partner breakfast October'}, '2026-09-15T09:00'),
    C('mcit', 'laras', 'raised a blocker on', {type: 'task', id: 't18', name: 'Write division page copy'}, '2026-10-03T10:00'),
  ];

  // WBS for the SnG roadmap (owner, round 10): three phases, one summary activity with two work packages under it
  tasks.push(T('w-p1', 'Discovery', 'salsa', null, {phase: true, inWbs: true, order: 0, project: 'p-roadmap', div: 'sng', by: 'salsa', at: '2026-09-01T10:05'}),
    T('w-p2', 'Synthesis', 'salsa', null, {phase: true, inWbs: true, order: 1, project: 'p-roadmap', div: 'sng', by: 'salsa', at: '2026-09-01T10:06'}),
    T('w-p3', 'Publish and align', 'salsa', null, {phase: true, inWbs: true, order: 2, project: 'p-roadmap', div: 'sng', by: 'salsa', at: '2026-09-01T10:07'}),
    T('w-a2', 'Director interviews', 'nadia', null, {inWbs: true, parent: 'w-p1', order: 1, project: 'p-roadmap', div: 'sng', by: 'nadia', at: '2026-09-02T09:00', remarks: 'All six directors'}),
    T('t22', 'Interview the other three directors', 'bagas', '2026-10-16', {start: '2026-10-12', project: 'p-roadmap', ms: 'ms1', div: 'sng', by: 'nadia', at: '2026-10-03T09:00', icon: {n: 'mic', c: 'red'}}),
    T('t21', 'Present the roadmap at the presidium meeting', 'salsa', '2026-10-18', {start: '2026-10-18', deps: [{id: 't20', type: 'FS'}], project: 'p-roadmap', div: 'sng', by: 'mahdy', at: '2026-10-02T11:00', icon: {n: 'megaphone', c: 'green'}}));
  const WBS = {t11: ['w-p1', 0, 'Q3 report against the June initiatives'], t12: ['w-a2', 0, 'Six directors, 45 minutes each'], t22: ['w-a2', 1, 'Same guide as the first three'], t1: ['w-p2', 0, 'Draft for the directors'], t20: ['w-p2', 1, 'One page, shared in Drive'], t21: ['w-p3', 0, 'Presidium meeting, 15 minutes']};
  tasks.forEach(t => { const w = WBS[t.id]; if (w) { t.parent = w[0]; t.order = w[1]; t.inWbs = true; t.remarks = w[2]; } });
  milestones.forEach(m => { if (m.id === 'ms1') m.parent = 'w-a2'; if (m.id === 'ms2') m.parent = 'w-p2'; });
  const LOOKS = {'p-roadmap': [7, 1], 'p-survey': [3, 6], 'p-mentoring': [1, 9], 'p-q3': [4, 7], 'p-map': [2, 8], 'p-prio25': [5, 4], 'p-breakfast': [5, 1], 'p-plan26': [0, 2], 'p-orient': [3, 1], 'p-site': [7, 8], 'p-oprec': [0, 0], 'p-hms': [2, 6], 'p-close': [2, 0]};
  projects.forEach(p => { const k = LOOKS[p.id]; if (k) p.look = {f: k[0], p: k[1]}; });
  const RLOOKS = {'r-brand': [8, 2], 'r-templates': [8, 4], 'r-retro': [9, 9], 'r-brief-roadmap': [9, 8], 'r-guide': [9, 0], 'r-min1': [9, 4]};
  resources.forEach(r => { const k = RLOOKS[r.id]; if (k) r.look = {f: k[0], p: k[1]}; });
  return {v: 2, people, tasks, offers, projects, milestones, blockers, decisions, meetings, unavailable, gbusy, resources, updates, changes};
};
