/* Who is asking. The token is checked with the hub's Auth service (getUser), never decoded locally, and everything about
   the person is read from the hub, never from the request. The fields are the inputs of the database's own helper
   functions (database/migrations foundation: me_id, rank, me_active, me_admin, is_board, is_top, ...); the rules built on
   them are in rules.ts. */
import type { HubGateway } from '../hub/gateway.ts';
import { HttpError } from '../errors.ts';
import { DIVISION_IDS, type DivisionId } from '../../generated/partition.ts';

export type RoleId = 'president' | 'vp' | 'director' | 'codirector' | 'member' | 'board';

const BASE_RANK: Record<RoleId, number> = { president: 5, vp: 4, director: 3, codirector: 2, member: 1, board: 0 };
const isRole = (r: string | null): r is RoleId => r !== null && r in BASE_RANK;
const isDivision = (d: string | null): d is DivisionId => d !== null && (DIVISION_IDS as readonly string[]).includes(d);

export interface Principal {
  authUserId: string;
  email: string | null;
  /** The person this sign-in is linked to; null before link_current_user() has run. */
  personId: string | null;
  role: RoleId | null;
  div: DivisionId | null;
  status: string | null;
  /** Signed in and linked, and the person's status is `active`. */
  active: boolean;
  admin: boolean;
  board: boolean;
  /** President or Vice President. */
  top: boolean;
  /** Rank of the role alone (`app.base_rank`): president 5, vp 4, director 3, codirector 2, member 1, board 0. */
  baseRank: number;
  /** The admin flag outranks everything (rank 9), like `app.rank()`. */
  rank: number;
  /** Active and not the Board ("Board accounts are read-only"). An active person with no valid role cannot write either:
      in the database `not is_board()` is then null, which a policy treats as a refusal. */
  canWrite: boolean;
  /** Ids of the projects this person leads or manages (`app.is_project_lead`), as far as the hub lets them see. */
  ledProjects: ReadonlySet<string>;
}

export function bearerToken(header: string | undefined): string | null {
  const m = /^Bearer\s+(\S+)$/i.exec(header ?? '');
  return m?.[1] ?? null;
}

export async function resolvePrincipal(hub: HubGateway, token: string | null): Promise<Principal> {
  if (!token) throw new HttpError(401, 'unauthenticated');
  const user = await hub.verifyToken(token);
  if (!user) throw new HttpError(401, 'unauthenticated');
  const person = await hub.findPerson(token, user.id);
  const rawRole = person?.role ?? null;
  const rawDiv = person?.div ?? null;
  const role = isRole(rawRole) ? rawRole : null;
  const active = person?.status === 'active';
  const admin = active && person.isAdmin;
  const board = active && role === 'board';
  const baseRank = role ? BASE_RANK[role] : 0;
  return {
    authUserId: user.id,
    email: user.email,
    personId: person?.id ?? null,
    role,
    div: isDivision(rawDiv) ? rawDiv : null,
    status: person?.status ?? null,
    active,
    admin,
    board,
    top: active && (role === 'president' || role === 'vp'),
    baseRank,
    rank: admin ? 9 : baseRank,
    canWrite: active && role !== null && !board,
    // Nothing to look up for a person who cannot act, and nothing can match.
    ledProjects: active ? await hub.ledProjects(token, person.id) : new Set<string>(),
  };
}
