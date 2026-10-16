/* The restricted administration audit and the notices accounts send (DATA_OWNERSHIP_AUTHORITY §8, security_audit): actor,
   target, action and reason. Workspace Changes show only that something changed; reasons stay here. */
import type { Draft } from 'immer';
import { uid } from '@/lib/ids';
import { sessionStore } from '@/lib/session';
import { nowStamp } from '@/lib/time';
import { notify } from '@/lib/workspace/feed';
import { registerUpdateText } from '@/features/updates/services/update-text';
import type { EntityRef, Person, PersonId, Workspace } from '@/types/workspace';
import { acctDraft, type AuditEntry } from './acct-data';

registerUpdateText({
  'acct-accepted': '{who} accepted an invitation. It needs approval',
  'acct-approved': '{who} approved your membership. Welcome',
  'acct-moved': '{who} moved you to another division',
  'acct-appointed': '{who} appointed you to a new role',
  'acct-appt-ended': '{who} recorded the end of your role',
  'acct-ho': '{who} nominated you as the next President',
  'acct-ho-rec': '{who} started an emergency presidency recovery naming you',
  'acct-ho-yes': '{who} accepted the presidency nomination',
  'acct-ho-no': '{who} declined the presidency nomination',
  'acct-ho-done': '{who} completed the presidency handover',
});

export const meId = () => sessionStore.get().me ?? '';

/** Writes one audit line. `extra` carries the reason, the detail, a link and, for the acting person, an explicit actor. */
export function alog(
  db: Draft<Workspace>,
  verb: string,
  p: Person | null,
  extra: Partial<Pick<AuditEntry, 'reason' | 'detail' | 'ref' | 'name' | 'actor'>> = {},
) {
  acctDraft(db).log.unshift({
    id: uid('al'),
    at: nowStamp(),
    actor: meId(),
    person: p?.id ?? null,
    name: p?.name ?? extra.name ?? '',
    verb,
    reason: '',
    ...extra,
  });
}

/** A notice that opens a page: `h` is the route, `title` what the notice is about. */
export function notifyLink(
  db: Draft<Workspace>,
  to: PersonId | null | undefined,
  type: string,
  h: string,
  title: string,
  actor?: PersonId,
) {
  notify(db, to, type, { type: 'link', id: h, h, name: title }, actor);
}

export const memberLink = (p: Person): EntityRef => ({ type: 'link', id: p.id, name: p.name, h: `members/${p.id}` });
