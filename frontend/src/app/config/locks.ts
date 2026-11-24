/* Division features are locked until the Marcomit team switches them on. The core hub (My Work, Updates, Schedule,
   Programs, Projects, Operations, Resources, Performance, Attention, Members, Organisation dashboard, Settings) is always open.
   Unlock a division by listing it in VITE_UNLOCKED_DIVISIONS (comma separated, or `all`) and rebuilding. */
import { env } from '@/app/config/env';
import type { DivisionId } from '@/types/workspace';

/** Every page that belongs to one division's own feature set. */
export const DIVISION_PAGES: Readonly<Record<DivisionId, readonly string[]>> = {
  sng: ['initiatives', 'decisions'],
  hr: ['attendance', 'monitoring', 'recognition', 'competencies', 'hr-people'],
  ee: ['relationships', 'opportunities', 'followups'],
  cons: ['engagements', 'staffing', 'knowledge', 'cohorts'],
  fnl: ['fnl-requests', 'budget', 'register', 'period-reviews'],
  mcit: ['content', 'creative', 'communications', 'it-team', 'it-requests', 'accounts-register'],
};

const unlocked = new Set(
  env.unlockedDivisions
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export const isDivisionLocked = (d: DivisionId) => !unlocked.has('all') && !unlocked.has(d);

/** The division that owns a locked page, or null when the page is part of the core hub or its division is unlocked. */
export function lockedDivisionOf(page: string): DivisionId | null {
  for (const d of Object.keys(DIVISION_PAGES) as DivisionId[])
    if (DIVISION_PAGES[d].includes(page)) return isDivisionLocked(d) ? d : null;
  return null;
}

export const isLockedPage = (page: string) => lockedDivisionOf(page) !== null;
