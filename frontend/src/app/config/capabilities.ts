/* Workspace capabilities (design-navigation, engineering-capability-registry): destinations shown below the core pages.
   '*' entries appear in every workspace, the others only in their division's workspace. Order is the prototype's script
   order (perf.js, accounts.js, div-hr-sng.js, div-ee-cons.js, div-fnl-mcit.js). Each entry: page, icon, English label,
   and who may see it. */
import { rank } from '@/lib/access';
import { isBoard, isPres, isTop, isTopOrAdmin, isVP, hrStaff, wideView } from '@/lib/roles';
import type { DivisionId, Person } from '@/types/workspace';

export interface Capability {
  page: string;
  icon: string;
  label: string;
  visible?: (p: Person, ws: DivisionId) => boolean;
}

const notBoard = (p: Person) => !isBoard(p);
const canMembers = (p: Person) => !isBoard(p) && (wideView(p) || p.role === 'director');
const isLead = (p: Person) => isPres(p) || isVP(p) || p.admin;
const canAttn = (p: Person) => isLead(p) || (rank(p) >= 2 && !!p.div && !isBoard(p));
const fnlFull = (p: Person) => p.div === 'fnl' || isTopOrAdmin(p);

export const CAPS: Record<'*' | DivisionId, Capability[]> = {
  '*': [
    { page: 'attention', icon: 'flag', label: 'Attention', visible: canAttn },
    { page: 'oversight', icon: 'shield', label: 'Oversight', visible: (p) => isBoard(p) },
    { page: 'performance', icon: 'chart', label: 'Performance', visible: () => true },
    { page: 'members', icon: 'person', label: 'Members', visible: canMembers },
    {
      page: 'fnl-requests',
      icon: 'finance',
      label: 'Requests to FnL',
      visible: (p, ws) => !isBoard(p) && ws !== 'fnl',
    },
    { page: 'it-requests', icon: 'globe', label: 'Requests to MCIT', visible: (p, ws) => !isBoard(p) && ws !== 'mcit' },
  ],
  sng: [
    { page: 'initiatives', icon: 'compass', label: 'Initiatives' },
    { page: 'decisions', icon: 'documents', label: 'Research & decisions' },
  ],
  hr: [
    { page: 'attendance', icon: 'attendance', label: 'Attendance' },
    { page: 'monitoring', icon: 'chart', label: 'Monitoring' },
    { page: 'recognition', icon: 'heart', label: 'Recognition' },
    {
      page: 'hr-people',
      icon: 'people',
      label: 'People',
      visible: (p) => !isBoard(p) && (hrStaff(p) || isTop(p) || p.admin),
    },
  ],
  ee: [
    { page: 'relationships', icon: 'globe', label: 'Relationships', visible: notBoard },
    { page: 'opportunities', icon: 'briefcase', label: 'Opportunities', visible: notBoard },
    { page: 'followups', icon: 'clock', label: 'Follow-ups', visible: notBoard },
  ],
  cons: [
    { page: 'engagements', icon: 'briefcase', label: 'Engagements', visible: notBoard },
    { page: 'staffing', icon: 'person', label: 'Staffing', visible: notBoard },
    { page: 'knowledge', icon: 'documents', label: 'Knowledge', visible: notBoard },
    { page: 'cohorts', icon: 'calendar', label: 'Cohorts', visible: notBoard },
  ],
  fnl: [
    { page: 'fnl-requests', icon: 'documents', label: 'Requests' },
    { page: 'budget', icon: 'wallet', label: 'Budget & transactions', visible: (p) => fnlFull(p) || isBoard(p) },
    { page: 'register', icon: 'file', label: 'Documents & register', visible: fnlFull },
    { page: 'period-reviews', icon: 'finance', label: 'Period reviews', visible: (p) => fnlFull(p) || isBoard(p) },
  ],
  mcit: [
    { page: 'content', icon: 'calendar', label: 'Content' },
    { page: 'it-requests', icon: 'documents', label: 'Requests' },
    { page: 'accounts-register', icon: 'shield', label: 'Accounts' },
  ],
};

/** Capabilities for a workspace and person, Ship 1 gate applied by the caller (core/app.js capsFor). */
export const capsFor = (ws: DivisionId, p: Person) =>
  [...CAPS['*'], ...CAPS[ws]].filter((c) => !c.visible || c.visible(p, ws));

/** "Performance" reads "My performance" for members below Co-Director without Admin (core/app.js navLabel). */
export const navLabel = (page: string, label: string, p: Person | undefined) =>
  page === 'performance' && p && rank(p) < 2 && !p.admin ? 'My performance' : label;
