/* What each kind of update says (work_updates). The text is a sentence with the person who acted as {who}. Feature modules
   register the kinds they create, so a module added later brings its own wording. */
import { t } from '@/lib/i18n';

const TEXT: Record<string, string> = {
  'run-ask': '{who} asked to skip or move a run',
  'run-ask-ok': '{who} approved your request about a run',
  'run-ask-no': '{who} declined your request about a run',
  offer: '{who} asked if you can take a task',
  review: '{who} sent a task for your review',
  invite: '{who} invited you to a meeting',
  overdue: 'A task of yours is overdue',
  changed: '{who} changed a meeting',
  cancelled: '{who} canceled a meeting',
  minutes: '{who} shared meeting minutes',
  blocker: '{who} needs you to unblock a task',
  unblocked: '{who} resolved a blocker on your task',
  decision: '{who} asked you to decide',
  'offer-accepted': '{who} accepted your task offer',
  'offer-declined': '{who} declined your task offer',
  'offer-changes': '{who} asked for changes to your offer',
  approved: '{who} approved your work',
  returned: '{who} asked for changes to your work',
  'rsvp-yes': '{who} accepted your invitation',
  'rsvp-no': '{who} declined your invitation',
  'link-issue': '{who} could not open a link you own',
  delegated: '{who} added you to a resource',
  decided: '{who} answered your decision request',
  pinvite: '{who} invited you to work on a project',
  tasked: '{who} asked you to share a task',
  tadded: '{who} added you to a task',
  'tasked-yes': '{who} now shares your task',
  'tasked-no': '{who} declined to share your task',
  padded: '{who} added you to a project',
  'pinvite-yes': '{who} accepted your project invitation',
  'pinvite-no': '{who} declined your project invitation',
  // Collaboration (D60)
  'cp-added': '{who} added you',
  'cp-invite': '{who} invited you to work together',
  'cp-yes': '{who} accepted your invitation',
  'cp-no': '{who} declined your invitation',
  'cp-removed': '{who} took you off',
  'cp-left': '{who} left',
  'cp-role': '{who} changed your role',
  'cp-fyi': '{who} invited someone from your division',
  'pg-partner': '{who} invited your division to a program',
  'pg-partner-yes': '{who} accepted for their division',
  'pg-partner-no': '{who} declined for their division',
  'pg-partner-left': '{who} ended the partnership',
  'offer-revised': '{who} changed an offer and sent it again',
  'offer-withdrawn': '{who} withdrew an offer',
  'offer-fyi': '{who} asked someone in your division to take a task',
  'tresp-removed': '{who} took you off a task',
};

/** Adds the update kinds a feature creates. */
export function registerUpdateText(more: Record<string, string>) {
  Object.assign(TEXT, more);
}

/** The sentence for an update, with the actor's first name; unknown kinds read as a generic change. */
export const updateText = (type: string, who: string) => t(TEXT[type] ?? '{who} updated something', { who });
