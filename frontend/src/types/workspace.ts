/* Workspace record types. Field names and value shapes are exactly the prototype's (frontend/prototype/core/data.js and
   the screens that extend records), because every record is stored whole in the database (`doc`, decision M6).
   Dates are `YYYY-MM-DD` strings, instants are `YYYY-MM-DDTHH:mm` local strings, times of day are minutes since midnight,
   money is integer rupiah. PRD: entity_task, entity_milestone, entity_blocker, entity_decision, entity_meeting,
   entity_availability, entity_resource, entity_notification, entity_activity. */

export type DivisionId = 'ee' | 'mcit' | 'hr' | 'fnl' | 'sng' | 'cons';
export type RoleId = 'president' | 'vp' | 'director' | 'codirector' | 'member' | 'board';
export type PersonId = string;
/** `YYYY-MM-DD` */
export type DateStr = string;
/** `YYYY-MM-DDTHH:mm` */
export type Stamp = string;

export interface Person {
  id: PersonId;
  name: string;
  first: string;
  div: DivisionId | null;
  role: RoleId;
  photo: string | null;
  title: string;
  admin: boolean;
  hasSchedule: boolean;
  gcal: boolean;
  status: 'active' | 'pending' | 'paused' | 'former' | (string & {});
  board?: boolean;
  joined?: string;
  linkedin?: string | null;
  phone?: string | null;
  hidePhone?: boolean;
  email?: string;
  /** Set when the member finished the first-sign-in welcome page. */
  welcomedAt?: Stamp;
  /** The last day of a membership that ended (left or alumni). */
  departedOn?: DateStr;
}

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface Assignee {
  id: PersonId;
  state: 'invited' | 'joined' | 'declined' | (string & {});
  by: PersonId;
  at: Stamp;
  direct?: boolean;
  answeredAt?: Stamp;
}

export interface TaskIcon {
  n: string;
  c: string;
}

export interface ChecklistItem {
  id?: string;
  t?: string;
  text?: string;
  done?: boolean;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  title: string;
  owner: PersonId;
  due: DateStr | null;
  time: number | null;
  status: TaskStatus;
  reviewer: PersonId | null;
  project: string | null;
  milestone: string | null;
  div: DivisionId | null;
  notes: string;
  evidence: string;
  doneAt: DateStr | null;
  createdBy: PersonId;
  createdAt: Stamp;
  offer: string | null;
  meeting: string | null;
  start: DateStr | null;
  deps: { id: string; type: DependencyType }[];
  assignees: Assignee[];
  parent: string | null;
  inWbs: boolean;
  phase: boolean;
  remarks: string;
  order: number | null;
  icon: TaskIcon | null;
  reactions: Record<string, PersonId[]>;
  links: string[];
  mentions: PersonId[];
  trashed: boolean;
  routine?: string | null;
  occ?: string | null;
  checklist?: ChecklistItem[];
  submissions?: unknown[];
  rating?: unknown;
  /** Sign-off and hand-in (D35, D58). */
  signoffMode?: 'on' | 'off';
  signer?: PersonId | null;
  signedBy?: PersonId | null;
  signedAt?: Stamp | null;
  doneBy?: PersonId | null;
  finishedAt?: Stamp | null;
  returnNote?: string;
  reviewChoice?: 'approved' | 'returned' | null;
  reviewedAt?: Stamp | null;
  /** Given by someone else through an accepted offer. */
  givenBy?: PersonId | null;
  givenAt?: Stamp | null;
  /** A run of an operation moved to another day. */
  moved?: DateStr | null;
  [key: string]: unknown;
}

export interface Offer {
  id: string;
  from: PersonId;
  to: PersonId;
  title: string;
  result: string;
  due: DateStr | null;
  project: string | null;
  state: 'pending' | 'accepted' | 'declined' | 'withdrawn' | (string & {});
  note: string;
  task: string | null;
  at: Stamp;
  answeredAt: Stamp | null;
  reply?: string;
  /** A resource or meeting the offer came from (Resources and meeting minutes can offer tasks). */
  resource?: string | null;
  meeting?: string | null;
  /** Rounds of "change and send again". */
  round?: number;
  revisedAt?: Stamp;
}

export type ProjectStage = 'draft' | 'planned' | 'active' | 'review' | 'completed' | 'hold' | 'cancelled' | 'archived';

export interface TeamMember {
  id: PersonId;
  state: string;
  by: PersonId;
  at: Stamp;
  answeredAt?: Stamp;
  [key: string]: unknown;
}

/** Identity art: shader family `f` and palette `p` (design-shaders). */
export interface Look {
  f: number;
  p: number;
  [key: string]: unknown;
}

export interface Project {
  id: string;
  name: string;
  div: DivisionId;
  stage: ProjectStage;
  lead: PersonId | null;
  pm: PersonId | null;
  start: DateStr | null;
  due: DateStr | null;
  goal: string;
  scopeIn: string[] | string;
  scopeOut: string[] | string;
  reason: string;
  team: TeamMember[];
  org: boolean;
  createdBy: PersonId;
  createdAt: Stamp;
  look?: Look;
  program?: string | null;
  [key: string]: unknown;
}

export interface Milestone {
  id: string;
  project: string;
  title: string;
  owner: PersonId;
  target: DateStr;
  state: 'proposed' | 'active' | 'review' | 'achieved' | (string & {});
  achievedAt: DateStr | null;
  parent?: string | null;
  achievedBy?: PersonId | null;
  roadmap?: boolean;
}

export interface Blocker {
  id: string;
  task: string;
  project: string;
  text: string;
  owner: PersonId;
  severity: 'low' | 'medium' | 'high';
  action: string;
  state: 'open' | 'resolved' | 'withdrawn' | (string & {});
  openedBy: PersonId;
  openedAt: Stamp;
  resolution: string;
  resolvedAt: Stamp | null;
}

export interface Decision {
  id: string;
  project: string;
  meeting: string | null;
  question: string;
  result: string;
  approver: PersonId;
  state: 'awaiting' | 'approved' | 'rejected' | 'hold' | (string & {});
  decidedAt: Stamp | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

export type MeetingResponse = 'accepted' | 'pending' | 'declined' | (string & {});

export interface Meeting {
  id: string;
  title: string;
  organizer: PersonId;
  date: DateStr;
  start: number;
  end: number;
  where: string;
  agenda: string;
  icon: TaskIcon | null;
  reactions: Record<string, PersonId[]>;
  notetaker: PersonId;
  project: string | null;
  state: 'planned' | 'held' | 'cancelled' | (string & {});
  reason: string;
  minutes: string | null;
  responses: Record<PersonId, MeetingResponse>;
  createdAt: Stamp;
  heldAt?: Stamp | null;
  /** When each guest last replied. */
  repliedAt?: Record<PersonId, Stamp>;
  notes?: string;
  /** The composer's Meet switch; Google Calendar makes the link when it syncs. */
  meet?: boolean;
}

export interface Unavailable {
  id: string;
  who: PersonId;
  /** Weekday 1 (Monday) to 7 (Sunday) for weekly series. */
  day: number;
  date: DateStr | null;
  weekly: boolean;
  start: number;
  end: number;
  note: string;
  allDay?: boolean;
  /** A weekly series starts on this date. */
  from?: DateStr | null;
  createdAt?: Stamp;
  [key: string]: unknown;
}

export interface GoogleBusy {
  id: string;
  who: PersonId;
  date: DateStr;
  start: number;
  end: number;
  title: string;
}

export type ResourceKind = 'folder' | 'note' | 'link';

export interface EntityRef {
  type: string;
  id: string;
  name?: string;
  /** The route a link-type reference opens (for example `attention/esc-1`). */
  h?: string;
}

export interface Resource {
  id: string;
  kind: ResourceKind;
  name: string;
  div: DivisionId;
  parent: string | null;
  url: string;
  body: string;
  purpose: string;
  project: string | null;
  meeting: string | null;
  owner: PersonId;
  contributors: PersonId[];
  createdBy: PersonId;
  createdAt: Stamp;
  pinned: boolean;
  revisions: number;
  archived: boolean;
  reports: unknown[];
  brief: boolean;
  ref: EntityRef | null;
  editedBy: PersonId | null;
  editedAt: Stamp | null;
  look?: Look;
  [key: string]: unknown;
}

export interface Update {
  id: string;
  to: PersonId;
  type: string;
  actor: PersonId | null;
  ref: EntityRef;
  at: Stamp;
  read: boolean;
}

export interface Change {
  id: string;
  ws: DivisionId;
  actor: PersonId;
  verb: string;
  target: EntityRef;
  at: Stamp;
  from: string | null;
  to: string | null;
}

/** A division taking part in a program (D60): invited by someone, answered by its leaders. */
export interface PartnerDivision {
  div: DivisionId;
  state: 'invited' | 'joined' | 'declined' | 'left' | (string & {});
  by?: PersonId;
  at?: Stamp;
  answeredAt?: Stamp;
  answeredBy?: PersonId;
  endedAt?: Stamp;
}

export interface Program {
  id: string;
  name: string;
  div: DivisionId;
  goal: string;
  owner: PersonId;
  start: DateStr | null;
  end: DateStr | null;
  createdBy: PersonId;
  at: Stamp;
  look?: Look;
  partners?: PartnerDivision[];
  [key: string]: unknown;
}

export interface Routine {
  id: string;
  name: string;
  unit: DivisionId | null;
  personal: boolean;
  project: string | null;
  cadence: string;
  every: number;
  start: DateStr;
  dueOffset: number;
  time: number | null;
  owners: PersonId[];
  rotate: boolean;
  checklist: ChecklistItem[];
  paused: boolean;
  skips: DateStr[];
  createdBy: PersonId;
  at: Stamp;
  icon?: TaskIcon;
  look?: Look;
  program?: string | null;
  signoff?: boolean;
  signer?: PersonId;
  [key: string]: unknown;
}

export interface Pin {
  k: 'project' | 'program' | 'routine' | 'res' | (string & {});
  id: string;
}

/** A division or feature store that is created on first use: a version number plus record lists. Each feature module
    declares its own precise type for its store; the workspace keeps them opaque until that module is migrated. */
export interface FeatureStore {
  v: number;
  [collection: string]: unknown;
}

export interface Workspace {
  v: 2;
  people: Person[];
  tasks: Task[];
  offers: Offer[];
  projects: Project[];
  milestones: Milestone[];
  blockers: Blocker[];
  decisions: Decision[];
  meetings: Meeting[];
  unavailable: Unavailable[];
  gbusy: GoogleBusy[];
  resources: Resource[];
  updates: Update[];
  changes: Change[];
  programs?: Program[];
  routines?: Routine[];
  pins?: Record<PersonId, Pin[]>;
  lookV?: number;
  rmSeeded?: boolean;
  pgSeeded?: boolean;
  hr?: FeatureStore;
  sng?: FeatureStore;
  ee?: FeatureStore;
  cons?: FeatureStore;
  fnl?: FeatureStore;
  mcit?: FeatureStore;
  acct?: FeatureStore;
  perf?: FeatureStore;
}
