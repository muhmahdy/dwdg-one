// Single source of truth for the Supabase tables (Stage 2).
// tools/build-sql.mjs turns this file into migrations/20261012000200_workspace_tables.sql
// and generated/tables.json (read by the data-move script and, in Stage 3, by the app).
//
// How a table works (read this once, it applies to every table below):
//   id    text primary key       the prototype's own id ("t-abc", "p-plan26", "mahdy"), kept as is
//   pos   integer                position in the prototype's array (the app shows arrays in this order)
//   doc   json                   the record exactly as the prototype holds it (json, not jsonb, so key order is kept)
//   ...   generated columns      copies of a few fields taken from doc (owner, project, div, ...). They exist for
//                                foreign keys, indexes and row level security. They can never disagree with doc.
//
// cols:   { column: 'docKey' }   text column read from doc->>'docKey'
//         { column: ['docKey', 'b'] }   boolean column
//         { column: 't' }        shorthand for text column with the same name as the doc key
// fk:     { column: 'table' }    foreign key to table(id), deferrable initially deferred
// read / write: SQL for the row level security policies. `write` defaults to `read`.
//         `ins`, `upd`, `del` override `write` for one command.
//         Helper functions live in schema app (see 20261012000100_foundation.sql).

const ME = 'app.me_id()';
const sees = c => `app.sees_div(${c})`;
const has = (key, who = ME) => `jsonb_exists(doc::jsonb->'${key}', ${who})`;
const NB = 'not app.is_board()';
const projectVisible = 'project is not null and app.can_see_project(project)';

// The six workspaces' private data: members of the division, the President, the VP and the Admin (sees_div),
// never the Board (the prototype's seeDiv / isBoard rules).
const division = (d, extra = '') => `${NB} and (${sees(`'${d}'`)}${extra ? ' or ' + extra : ''})`;
const hrPrivate = p => `${NB} and (app.hr_lead() or app.is_top_or_admin() or ${p} = ${ME})`;

export const DIVISIONS = [
  ['ee', 'External Engagement', 'EE', 'div-ee', 1],
  ['mcit', 'Marketing Communication & IT', 'MCIT', 'div-mcit', 2],
  ['hr', 'Human Resources', 'HR', 'div-hr', 3],
  ['fnl', 'Finance & Legal', 'FnL', 'div-fnl', 4],
  ['sng', 'Strategy & Growth', 'SnG', 'div-sng', 5],
  ['cons', 'Consulting', 'Cons', 'div-cons', 6],
];

// source: where the data sits in the prototype's `db` object.
//   'tasks'            db.tasks (array)
//   'hr.registers'     db.hr.registers (array)
//   keyed: true        db.cons.eng is an object keyed by project id; the key becomes the row id
//   wrap: 'list'       the value of each key is an array; it is stored as {"list": [...]}
//   idField            array items whose id is not called `id` (ee.fu is keyed by `task`)
//   positional: true   array items that have no id at all (ee.postpones): the row id is the item's position, "000000", "000001", ...
export const TABLES = [
  // ---------- core work ----------
  {name: 'tasks', source: 'tasks',
    cols: {div: 't', owner: 't', reviewer: 't', project: 't', parent: 't', offer: 't', meeting: 't', created_by: 'createdBy', status: 't', trashed: ['trashed', 'b']},
    fk: {project: 'projects', parent: 'tasks', offer: 'offers', meeting: 'meetings'},
    gin: ["(doc::jsonb->'assignees')"],
    read: `${sees('div')} or owner = ${ME} or reviewer = ${ME} or created_by = ${ME} or ${has('assignees')} or (${projectVisible})`},
  {name: 'offers', source: 'offers',
    cols: {from_person: 'from', to_person: 'to', project: 't', task: 't', state: 't'}, fk: {project: 'projects', task: 'tasks'},
    read: `from_person = ${ME} or to_person = ${ME} or app.is_top_or_admin()`},
  {name: 'projects', source: 'projects',
    cols: {div: 't', stage: 't', lead: 't', pm: 't', org: ['org', 'b'], created_by: 'createdBy', program: 't'}, fk: {program: 'programs'},
    read: 'app.can_see_project(id)',
    ins: `app.can_write() and app.rank() >= 2 and ${sees('div')}`,
    upd: `app.can_write() and ((app.rank() >= 2 and ${sees('div')}) or lead = ${ME} or pm = ${ME} or exists (select 1 from json_array_elements(coalesce(doc->'team', '[]'::json)) x where x->>'id' = ${ME}))`,
    del: `app.can_write() and app.rank() >= 2 and ${sees('div')}`},
  {name: 'milestones', source: 'milestones', cols: {project: 't', owner: 't', state: 't', parent: 't'}, fk: {project: 'projects'},
    read: `${projectVisible} or owner = ${ME}`},
  {name: 'blockers', source: 'blockers', cols: {task: 't', project: 't', owner: 't', state: 't', opened_by: 'openedBy'}, fk: {task: 'tasks', project: 'projects'},
    read: `(${projectVisible}) or owner = ${ME} or opened_by = ${ME}`},
  {name: 'decisions', source: 'decisions', cols: {project: 't', meeting: 't', approver: 't', state: 't', created_by: 'createdBy'}, fk: {project: 'projects', meeting: 'meetings'},
    read: `(${projectVisible}) or approver = ${ME} or created_by = ${ME}`},
  {name: 'meetings', source: 'meetings', cols: {organizer: 't', notetaker: 't', project: 't', state: 't'}, fk: {project: 'projects'},
    read: `organizer = ${ME} or notetaker = ${ME} or ${has('responses')} or (${projectVisible}) or app.is_top_or_admin()`},
  {name: 'unavailable', source: 'unavailable', cols: {who: 't'}, read: 'true', write: `who = ${ME} or app.me_admin()`},
  {name: 'gbusy', source: 'gbusy', cols: {who: 't'}, read: 'true', write: `who = ${ME} or app.me_admin()`},
  {name: 'resources', source: 'resources',
    cols: {kind: 't', div: 't', parent: 't', project: 't', meeting: 't', owner: 't', created_by: 'createdBy', archived: ['archived', 'b']}, fk: {parent: 'resources', project: 'projects', meeting: 'meetings'},
    read: `${sees('div')} or owner = ${ME} or created_by = ${ME} or ${has('contributors')} or (${projectVisible})`},
  {name: 'updates', source: 'updates', cols: {to_person: 'to', type: 't', actor: 't'},
    read: `to_person = ${ME} or app.me_admin()`, ins: 'app.can_write()'},
  {name: 'changes', source: 'changes', cols: {ws: 't', actor: 't'},
    read: `${sees('ws')} or actor = ${ME}`, ins: 'app.can_write()', upd: `actor = ${ME} or app.me_admin()`, del: `actor = ${ME} or app.me_admin()`},
  {name: 'programs', source: 'programs', cols: {div: 't', owner: 't', created_by: 'createdBy'},
    read: `${sees('div')} or owner = ${ME} or created_by = ${ME} or exists (select 1 from jsonb_array_elements(coalesce(doc::jsonb->'partners', '[]'::jsonb)) x where x->>'state' = 'joined' and ${sees("x->>'div'")})`},
  {name: 'routines', source: 'routines', cols: {unit: 't', personal: ['personal', 'b'], project: 't', created_by: 'createdBy', program: 't'}, fk: {project: 'projects', program: 'programs'},
    read: `case when coalesce(personal, false) then (${has('owners')} or created_by = ${ME}) else (${sees('unit')} or ${has('owners')}) end`},
  {name: 'pins', source: 'pins', keyed: true, wrap: 'list', cols: {}, read: `id = ${ME}`},

  // ---------- Human Resources ----------
  {name: 'hr_registers', source: 'hr.registers', cols: {meeting: 't', unit: 't', officer: 't', created_by: 'createdBy'},
    read: `${NB} and (app.is_hr_staff() or app.is_top_or_admin() or app.unit_lead(unit))`},
  {name: 'hr_notices', source: 'hr.notices', cols: {reg: 't', person: 't', outcome: 't'}, fk: {reg: 'hr_registers'}, read: hrPrivate('person')},
  {name: 'hr_cycles', source: 'hr.cycles', cols: {state: 't', created_by: 'createdBy'},
    read: `${NB} and (app.is_hr_staff() or app.is_top_or_admin() or exists (select 1 from jsonb_array_elements(coalesce(doc::jsonb->'roster', '[]'::jsonb)) x where x->>'p' = ${ME} or x->>'reviewer' = ${ME}))`},
  {name: 'hr_assessments', source: 'hr.assessments', cols: {cycle: 't', person: 't', state: 't', scored_by: 'scoredBy'}, fk: {cycle: 'hr_cycles'},
    read: `${hrPrivate('person')} or scored_by = ${ME} or app.hr_reviews(cycle, person)`},
  {name: 'hr_actions', source: 'hr.actions', cols: {assessment: 't', person: 't', owner: 't', state: 't'}, fk: {assessment: 'hr_assessments'},
    read: `${hrPrivate('person')} or owner = ${ME}`},
  {name: 'hr_rounds', source: 'hr.rounds', cols: {state: 't', created_by: 'createdBy'},
    read: `${NB} and (${has('panel')} or app.hr_lead() or app.is_top_or_admin())`},
  {name: 'hr_packets', source: 'hr.packets', cols: {round: 't', person: 't', receiver: 't', state: 't', created_by: 'createdBy'}, fk: {round: 'hr_rounds'},
    read: `${NB} and (app.hr_lead() or app.is_top_or_admin() or receiver = ${ME} or created_by = ${ME})`},
  {name: 'hr_onboarding_templates', source: 'hr.onboarding.templates', cols: {}, read: `${NB} and (app.is_hr_staff() or app.is_top_or_admin())`},
  {name: 'hr_onboarding_instances', source: 'hr.onboarding.instances', cols: {person: 't', template: 't', buddy: 't', hr_owner: 'hrOwner'}, fk: {template: 'hr_onboarding_templates'},
    read: `${NB} and (app.is_hr_staff() or app.is_top_or_admin() or person = ${ME} or buddy = ${ME} or hr_owner = ${ME})`},

  // ---------- Strategy & Growth ----------
  {name: 'sng_initiatives', source: 'sng.initiatives', cols: {owner: 't', unit: 't', stage: 't', project: 't', created_by: 'createdBy'}, fk: {project: 'projects'},
    read: division('sng', `owner = ${ME} or created_by = ${ME}`)},
  {name: 'sng_packets', source: 'sng.packets', cols: {initiative: 't', reviewer: 't', state: 't', submitted_by: 'submittedBy', created_by: 'createdBy'}, fk: {initiative: 'sng_initiatives'},
    read: division('sng', `reviewer = ${ME} or submitted_by = ${ME} or created_by = ${ME}`)},

  // ---------- External Engagement ----------
  {name: 'ee_orgs', source: 'ee.orgs', cols: {pic: 't', stage: 't'}, read: `${NB} and (${sees("'ee'")} or ${sees("'cons'")})`, write: division('ee')},
  {name: 'ee_contacts', source: 'ee.contacts', cols: {org: 't', owner: 't'}, fk: {org: 'ee_orgs'}, read: division('ee')},
  {name: 'ee_interactions', source: 'ee.interactions', cols: {org: 't', opp: 't', contact: 't', by_person: 'by'}, fk: {org: 'ee_orgs'}, read: division('ee')},
  {name: 'ee_fu', source: 'ee.fu', idField: 'task', cols: {task: 't', org: 't', opp: 't'}, read: division('ee')},
  {name: 'ee_postpones', source: 'ee.postpones', positional: true, cols: {task: 't'}, read: division('ee')},
  {name: 'ee_opps', source: 'ee.opps', cols: {org: 't', pic: 't', stage: 't', project: 't'}, fk: {org: 'ee_orgs'},
    read: `${NB} and (${sees("'ee'")} or ${sees("'cons'")})`, write: division('ee')},
  {name: 'ee_handoffs', source: 'ee.handoffs', cols: {opp: 't', from_person: 'from', to_unit: 'toUnit', to_person: 'to', state: 't'},
    read: `${NB} and (${sees("'ee'")} or (state <> 'draft' and (app.unit_lead(to_unit) or to_person = ${ME})))`,
    write: `${NB} and (${sees("'ee'")} or app.unit_lead(to_unit) or to_person = ${ME})`},

  // ---------- Consulting ----------
  {name: 'cons_engagements', source: 'cons.eng', keyed: true, cols: {client: 't', reviewer: 't', client_owner: 'clientOwner', created_by: 'createdBy'},
    read: division('cons', `app.is_project_lead(id) or reviewer = ${ME}`)},
  {name: 'cons_dlv', source: 'cons.dlv', cols: {project: 't', owner: 't'}, read: division('cons', 'app.is_project_lead(project)')},
  {name: 'cons_staff', source: 'cons.staff', cols: {project: 't', state: 't'}, read: division('cons', 'app.is_project_lead(project)')},
  {name: 'cons_kn', source: 'cons.kn', cols: {owner: 't', author: 't', audience: 't'},
    read: `${NB} and (${sees("'cons'")} or owner = ${ME} or author = ${ME} or ${has('named')} or audience = 'org')`,
    write: division('cons', `owner = ${ME} or author = ${ME}`)},
  {name: 'cons_cohorts', source: 'cons.cohorts', cols: {project: 't', program: 't', mentor: 't'}, read: division('cons', `mentor = ${ME}`)},

  // ---------- Finance & Legal ----------
  {name: 'fnl_legal', source: 'fnl.legal', cols: {type: 't', requester: 't', unit: 't', project: 't', owner: 't', reviewer: 't', stage: 't', created_by: 'createdBy'},
    read: `${NB} and (${sees("'fnl'")} or requester = ${ME} or created_by = ${ME} or app.unit_lead(unit))`},
  {name: 'fnl_register', source: 'fnl.register', cols: {req: 't', type: 't', issued_by: 'issuedBy', state: 't'}, read: division('fnl')},
  {name: 'fnl_allocations', source: 'fnl.allocations', cols: {unit: 't', project: 't', state: 't', created_by: 'createdBy'}, read: division('fnl', 'app.unit_lead(unit)')},
  {name: 'fnl_requests', source: 'fnl.requests', cols: {requester: 't', unit: 't', project: 't', alloc: 't', state: 't', created_by: 'createdBy'}, fk: {alloc: 'fnl_allocations'},
    read: `${NB} and (${sees("'fnl'")} or requester = ${ME})`, write: `${NB} and (${sees("'fnl'")} or requester = ${ME} or created_by = ${ME})`},
  {name: 'fnl_payments', source: 'fnl.payments', cols: {req: 't', by_person: 'by'}, fk: {req: 'fnl_requests'}, read: division('fnl')},
  {name: 'fnl_incoming', source: 'fnl.incoming', cols: {project: 't', opp: 't', state: 't', collector: 't', created_by: 'createdBy'}, read: division('fnl')},
  {name: 'fnl_periods', source: 'fnl.periods', cols: {project: 't', state: 't', prepared_by: 'preparedBy', reviewer: 't', created_by: 'createdBy'}, read: division('fnl')},

  // ---------- Marketing Communication & IT (the Board may read, like the prototype's mcFull) ----------
  {name: 'mcit_campaigns', source: 'mcit.campaigns', cols: {owner: 't', project: 't', created_by: 'createdBy'}, read: `${sees("'mcit'")} or app.is_board()`, write: sees("'mcit'")},
  {name: 'mcit_content', source: 'mcit.content', cols: {campaign: 't', executor: 't', reviewer: 't', stage: 't', created_by: 'createdBy'}, fk: {campaign: 'mcit_campaigns'},
    read: `${sees("'mcit'")} or app.is_board()`, write: sees("'mcit'")},
  {name: 'mcit_briefs', source: 'mcit.briefs', cols: {unit: 't', requester: 't', approver: 't', state: 't', created_by: 'createdBy'},
    read: `${sees("'mcit'")} or app.is_board() or requester = ${ME} or created_by = ${ME} or app.unit_lead(unit)`,
    write: `${sees("'mcit'")} or requester = ${ME} or created_by = ${ME} or app.unit_lead(unit)`},
  {name: 'mcit_it', source: 'mcit.it', cols: {requester: 't', unit: 't', owner: 't', stage: 't', created_by: 'createdBy'},
    read: `${sees("'mcit'")} or app.is_board() or requester = ${ME} or created_by = ${ME} or app.unit_lead(unit)`,
    write: `${sees("'mcit'")} or requester = ${ME} or created_by = ${ME} or app.unit_lead(unit)`},
  {name: 'mcit_accounts', source: 'mcit.accounts', cols: {custodian: 't', backup: 't', hidden: ['hidden', 'b']}, read: `${sees("'mcit'")} or app.is_board()`, write: sees("'mcit'")},

  // ---------- Accounts and authority ----------
  {name: 'acct_invites', source: 'acct.invites', cols: {email: 'email', div: 't', role: 't', state: 't', person: 't', created_by: 'createdBy'},
    read: `${NB} and (app.me_admin() or app.hr_lead() or app.is_top() or lower(email) = app.me_email())`,
    ins: `${NB} and (app.me_admin() or app.hr_lead())`,
    upd: `${NB} and (app.me_admin() or app.hr_lead() or lower(email) = app.me_email())`,
    del: `${NB} and (app.me_admin() or app.hr_lead())`},
  {name: 'acct_grants', source: 'acct.grants', cols: {person: 't', role: 't', unit: 't', state: 't'},
    read: `${NB} and (app.can_members() or person = ${ME})`, write: `${NB} and app.acct_manage()`},
  {name: 'acct_memberships', source: 'acct.memberships', cols: {person: 't', div: 't'},
    read: `${NB} and (app.can_members() or person = ${ME})`, write: `${NB} and app.acct_manage()`},
  {name: 'acct_actions', source: 'acct.actions', positional: true, cols: {}, read: `${NB} and app.can_members()`, write: `${NB} and app.acct_manage()`},
  {name: 'acct_handovers', source: 'acct.handovers', cols: {}, read: `${NB} and app.is_top_or_admin()`, write: `${NB} and app.is_top_or_admin()`},
  {name: 'acct_log', source: 'acct.log', cols: {actor: 't', person: 't'}, read: `${NB} and (app.me_admin() or app.me_role() = 'president')`, write: 'app.can_write()'},
  {name: 'acct_hidden', source: 'acct.hidden', cols: {}, read: `${NB} and app.can_members()`, write: `${NB} and app.acct_manage()`},

  // ---------- Performance and oversight ----------
  {name: 'perf_escalations', source: 'perf.escalations', cols: {from_person: 'from', to_person: 'to', div: 't', state: 't', created_by: 'createdBy', blocker: 't'},
    read: `from_person = ${ME} or to_person = ${ME} or created_by = ${ME} or app.is_top_or_admin() or app.is_board()`,
    write: `from_person = ${ME} or to_person = ${ME} or created_by = ${ME} or app.is_top_or_admin()`},
];

// Single values of the prototype's `db` that are not lists of records: version numbers, switches, the grant lists
// and the numbering policy. Stored in one table, row id "<store>.<key>", doc {"value": ...} for scalars.
export const VALUES = [
  'v', 'lookV', 'rmSeeded', 'pgSeeded',
  'hr.v', 'sng.v', 'ee.v', 'cons.v', 'fnl.v', 'mcit.v', 'acct.v', 'perf.v',
  'fnl.grants', 'fnl.policy', 'fnl.drafts', 'mcit.grants', 'mcit.drafts', 'acct.office',
];
export const VALUE_LOCKED = ['fnl.grants', 'fnl.policy', 'mcit.grants', 'acct.office'];

// ---------- where each table lives (hub and spokes) ----------
// The data is split over one hub and six division projects ("spokes"); see .planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md.
//   hub        people, the core work tables shared by every division, accounts and authority, performance, global values
//   <division> every table whose name starts with the division id (hr_, sng_, ee_, cons_, fnl_, mcit_) and the values of that store
// A table can set `home` itself; otherwise the name prefix decides. Nothing else in this file changes with the split.
export const HUB = 'hub';
export const SPOKES = DIVISIONS.map(d => d[0]);
export const HOMES = [HUB, ...SPOKES];

const prefixHome = (name, sep) => SPOKES.find(s => name.startsWith(s + sep)) || HUB;
for (const t of TABLES) t.home ??= prefixHome(t.name, '_');

export const homeOfTable = name => (name === 'people' ? HUB : TABLES.find(t => t.name === name)?.home);
export const homeOfValue = path => prefixHome(path, '.');
export const tablesOf = home => TABLES.filter(t => t.home === home);
export const valuesOf = home => VALUES.filter(v => homeOfValue(v) === home);
export const lockedValuesOf = home => VALUE_LOCKED.filter(v => homeOfValue(v) === home);
