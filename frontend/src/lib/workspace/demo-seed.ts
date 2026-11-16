import { COMPETENCY_KEYS } from '@/features/hr/services/competency-framework';
import type { Workspace } from '@/types/workspace';

/** The demo workspace (decision M9): development and automated tests only. The import sits behind a compile-time check,
    so production builds (VITE_DEMO_MODE unset) contain neither the demo people nor a chunk to fetch them. */
export async function demoWorkspace(): Promise<Workspace> {
  if (import.meta.env.VITE_DEMO_MODE !== 'true' && import.meta.env.MODE !== 'test')
    throw new Error('Demo data is not part of this build');
  const seed = await import('../../../../database/seeds/demo-workspace.json');
  return withDemoCompetencies(structuredClone(seed.default) as unknown as Workspace);
}

/** A small, stable number from a text, so the example levels are the same on every load. */
const hash = (s: string) => {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100_003;
  return h;
};

/* Example competency profiles (the prototype had no matrix): about three in four active members get levels 0 to 4, so the
   coverage figure and the staffing ranking have something to show. Fixed values, rated by the HR Director. */
function withDemoCompetencies(ws: Workspace): Workspace {
  const hr = ws.hr as { competencies?: unknown[] } | undefined;
  if (!hr || hr.competencies) return ws;
  const rater = ws.people.find((p) => p.div === 'hr' && p.role === 'director')?.id ?? ws.people[0]?.id ?? '';
  hr.competencies = ws.people
    .filter((p) => p.status === 'active' && p.role !== 'board' && !p.board && hash(p.id) % 4 !== 0)
    .map((p) => ({
      id: `cm-${p.id}`,
      person: p.id,
      levels: Object.fromEntries(COMPETENCY_KEYS.map((k) => [k, hash(`${p.id}:${k}`) % 5])),
      sectors: '',
      evidence: 'Consulting foundation modules and the dummy case, batch 2026.',
      by: rater,
      at: '2026-10-20T10:00',
      history: [],
    }));
  return ws;
}
