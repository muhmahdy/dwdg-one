/* Updates and Changes, written inside an action's draft (core/app.js notify / logChange).
   Updates inbox (work_updates): one item per recipient and trigger, never for every cosmetic edit.
   Workspace Changes (changes-scope): recorded per workspace; saved in the same transaction as the change itself. */
import type { Draft } from 'immer';
import { uid } from '@/lib/ids';
import { sessionStore } from '@/lib/session';
import { nowStamp } from '@/lib/time';
import type { DivisionId, EntityRef, PersonId, Workspace } from '@/types/workspace';

const meId = () => sessionStore.get().me ?? '';

export function notify(
  db: Draft<Workspace>,
  to: PersonId | null | undefined,
  type: string,
  ref: EntityRef,
  actor: PersonId | null = meId(),
) {
  if (!to || to === actor) return;
  db.updates.unshift({ id: uid('n'), to, type, actor, ref, at: nowStamp(), read: false });
}

export function logChange(
  db: Draft<Workspace>,
  ws: DivisionId | null | undefined,
  verb: string,
  target: EntityRef,
  from?: string | null,
  to?: string | null,
) {
  if (!ws) return;
  db.changes.unshift({
    id: uid('c'),
    ws,
    actor: meId(),
    verb,
    target,
    at: nowStamp(),
    from: from ?? null,
    to: to ?? null,
  });
}
