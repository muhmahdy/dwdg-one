/* The Accounts pages by route: members (list, one member, move/pause/leave, audit), invitations, appointments, presidency,
   welcome. One entry for the page registry. */
import type { Route } from '@/app/router/routes';
import { t } from '@/lib/i18n';
import { AcctCrumb } from './AccountsParts';
import { AppointmentsCrumb, AppointmentsPage } from './AppointmentsPage';
import { AuditCrumb, AuditPage } from './AuditPage';
import { FlowCrumb, FlowPage } from './FlowPage';
import { HandoverCrumb, HandoverPage } from './HandoverPage';
import { InviteCrumb, InvitePage } from './InvitePage';
import { InvitesCrumb, InvitesPage } from './InvitesPage';
import { MemberCrumb, MemberPage } from './MemberPage';
import { MembersPage } from './MembersPage';
import { WelcomeCrumb, WelcomePage } from './WelcomePage';

type FlowKind = 'transfer' | 'pause' | 'leave';
const isFlow = (s: string | undefined): s is FlowKind => s === 'transfer' || s === 'pause' || s === 'leave';

export function MembersRoute({ route }: { route: Route }) {
  if (route.id === 'audit') return <AuditPage />;
  if (route.id && isFlow(route.sub)) return <FlowPage id={route.id} kind={route.sub} />;
  if (route.id) return <MemberPage id={route.id} />;
  return <MembersPage />;
}

export function MembersRouteCrumb({ route }: { route: Route }) {
  if (route.id === 'audit') return <AuditCrumb />;
  if (route.id && isFlow(route.sub)) return <FlowCrumb id={route.id} kind={route.sub} />;
  if (route.id) return <MemberCrumb id={route.id} />;
  return <AcctCrumb parts={[['', t('Members')]]} />;
}

export {
  AppointmentsCrumb,
  AppointmentsPage,
  HandoverCrumb,
  HandoverPage,
  InviteCrumb,
  InvitePage,
  InvitesCrumb,
  InvitesPage,
  WelcomeCrumb,
  WelcomePage,
};
