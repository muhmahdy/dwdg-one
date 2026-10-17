/* The database's helper functions (database/migrations/20261012000100_foundation.sql, schema `app`) written over a
   Principal. Same names, same meaning; tests/parity/ runs both against the same people and requires the same answers.
   Division records are protected by these rules in the server, because the division projects have no row level security
   of their own (service role). */
import type { DivisionId } from '../../generated/partition.ts';
import type { Principal } from './principal.ts';

/** `app.is_top_or_admin()` */
export const isTopOrAdmin = (p: Principal): boolean => p.top || p.admin;

/** `app.sees_div(d)`: visibleDivs(p). Admin, President, VP and Board see every division; everyone else only their own. */
export const seesDiv = (p: Principal, d: DivisionId | null): boolean =>
  d !== null && p.active && (p.admin || p.role === 'president' || p.role === 'vp' || p.role === 'board' || d === p.div);

/** `app.is_hr_staff()` */
export const isHrStaff = (p: Principal): boolean => p.active && p.div === 'hr';

/** `app.hr_lead()`: HR Director and Co-Directors. */
export const hrLead = (p: Principal): boolean => isHrStaff(p) && p.baseRank >= 2;

/** `app.unit_lead(u)`: same division and rank 2 or more (the admin's rank of 9 counts). */
export const unitLead = (p: Principal, unit: string | null): boolean => unit !== null && p.active && p.div === unit && p.rank >= 2;

/** `app.can_members()` */
export const canMembers = (p: Principal): boolean => p.active && (isTopOrAdmin(p) || hrLead(p) || p.role === 'director');

/** `app.acct_manage()` */
export const acctManage = (p: Principal): boolean => p.active && (isTopOrAdmin(p) || hrLead(p));

/** `app.is_project_lead(pid)` */
export const isProjectLead = (p: Principal, projectId: string | null): boolean =>
  projectId !== null && p.active && p.ledProjects.has(projectId);

/** `x = app.me_id()` in a policy: false when the person is not linked (null never equals anything). */
export const isMe = (p: Principal, id: string | null): boolean => p.personId !== null && id === p.personId;
