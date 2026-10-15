/* Role predicates used across features. The prototype defined several of these in more than one file (isBoard four
   times, isTop twice, each inside its own script); they are consolidated here. Where the copies differed, the widest
   reading is kept and noted. */
import { ROLES } from '@/app/config/org';
import type { DivisionId, Person } from '@/types/workspace';

type P = Person | null | undefined;

export const isAdmin = (p: P) => !!p?.admin;
export const isPres = (p: P) => p?.role === 'president';
export const isVP = (p: P) => p?.role === 'vp';
/** President or VP (div-ee-cons.js, div-hr-sng.js). */
export const isTop = (p: P) => isPres(p) || isVP(p);
/** President, VP or Admin (div-fnl-mcit.js isTopP, perf.js isLead). */
export const isTopOrAdmin = (p: P) => isTop(p) || isAdmin(p);
/** Board of Supervisors (D29). The copies checked role, `board` and, in HR, an `oversight` flag; all three count. */
export const isBoard = (p: P) => !!p && (p.role === 'board' || !!p.board || !!(p as { oversight?: boolean }).oversight);
export const baseRank = (p: P) => (p ? ROLES[p.role].rank : 0);
/** HR Director or Co-Director: the roster reviewer and private-HR grant holder (accounts.js hrLead). */
export const hrLead = (p: P) => !!p && p.div === 'hr' && baseRank(p) >= 2;
export const hrStaff = (p: P) => p?.div === 'hr';
export const inDiv = (p: P, d: DivisionId) => p?.div === d;
/** Admin, President, VP or an HR lead see every member (accounts.js wideView). */
export const wideView = (p: P) => isAdmin(p) || isPres(p) || isVP(p) || hrLead(p);
