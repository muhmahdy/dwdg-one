/* The public invitation link and the demo sign-in around it (flow-accept-signin, flow-accept-landing, security_auth). In demo
   mode the link page lets you act as the invited Google account or as a different one; with Supabase the same steps are
   done by the real sign-in. From screens/accounts.js (acct-inv-try, acct-inv-google, acct-inv-as, acct-inv-switch). */
import { go } from '@/app/router/navigation';
import { sessionStore, setSession } from '@/lib/session';
import { setUi } from '@/lib/workspace/transaction';
import { acceptInvite } from './invite-actions';

/** Signs out but keeps the theme and language, as every sign-out does. */
const clearSession = (extra: Record<string, unknown> = {}) => {
  const s = sessionStore.get();
  setSession(() => ({ ...(s.theme ? { theme: s.theme } : {}), ...(s.lang ? { lang: s.lang } : {}), ...extra }));
};

/** Admin view: open the invitation link as the invited person. */
export function startInviteAsInvitee(id: string) {
  clearSession();
  setUi((u) => {
    u.insp = null;
    u.form = null;
  });
  go(`invite/${id}`);
}

export const inviteGoogle = (id: string) => {
  setSession({ inv: { id } });
};
export const inviteAs = (id: string, as: 'invitee' | 'other') => {
  setSession({ inv: { id, as } });
};
export const inviteReset = (id?: string) => {
  setSession({ inv: id ? { id } : null });
};

/** Signs out and opens the invitation (or My Work) for whoever signs in next. */
export function inviteSwitch(id?: string) {
  clearSession();
  setUi((u) => {
    u.insp = null;
  });
  go(id ? `invite/${id}` : 'work');
}

/** The invited account accepts; the new member waits for the Admin's approval. */
export async function acceptAndWait(id: string) {
  const s = sessionStore.get();
  const inv = s.inv as { id?: string; as?: string } | null | undefined;
  if (inv?.id !== id || inv.as !== 'invitee') {
    inviteReset(id);
    return;
  }
  const person = await acceptInvite(id);
  if (!person) {
    inviteReset();
    return;
  }
  clearSession({ waiting: person });
  go('work');
}
