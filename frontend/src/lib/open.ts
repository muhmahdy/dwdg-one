/* Opening things in the side panel: one place for the "show this record" actions every screen uses. Each closes any open
   menu or palette and the panel's form, then sets which record the panel shows. */
import type { PersonId } from '@/types/workspace';
import { setUi } from '@/lib/workspace/transaction';

const open = (type: string, id: string, extra: Record<string, unknown> = {}) => {
  setUi((u) => {
    u.palette = false;
    u.menu = null;
    u.form = null;
    u.insp = { type, id, ...extra };
  });
};

export const openTask = (id: string) => {
  open('task', id);
};
export const openOffer = (id: string) => {
  open('offer', id);
};
export const openMeeting = (id: string) => {
  open('meeting', id);
};
export const openPerson = (id: PersonId) => {
  open('person', id);
};
export const openMilestone = (id: string) => {
  open('ms', id);
};
export const openResource = (id: string) => {
  open('res', id);
};
export const openDecision = (id: string) => {
  open('decision', id);
};
