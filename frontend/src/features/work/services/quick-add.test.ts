import { beforeAll, describe, expect, it } from 'vitest';
import { setDemoClock } from '@/lib/time';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import type { Workspace } from '@/types/workspace';
import { parseQuick } from './quick-add';

let db: Workspace;
beforeAll(async () => {
  setDemoClock('2026-10-06'); // a Tuesday
  db = await demoWorkspace();
});

describe('quick add (work_task_fields)', () => {
  it('reads a mention, a weekday and a time; the mention keeps the first name in the title', () => {
    expect(parseQuick(db, 'Sync with @Salsa Fri 14:00')).toEqual({
      title: 'Sync with Salsa',
      due: '2026-10-09',
      time: 840,
      mentions: ['salsa'],
    });
  });
  it('understands tomorrow and Indonesian day words', () => {
    expect(parseQuick(db, 'Kirim laporan besok').due).toBe('2026-10-07');
    expect(parseQuick(db, 'Rapat senin jam 9.30')).toMatchObject({ due: '2026-10-12', time: 570 });
  });
  it('leaves unknown names and impossible times alone', () => {
    expect(parseQuick(db, 'Ask @Nobody about 25:99')).toEqual({
      title: 'Ask @Nobody about 25:99',
      due: null,
      time: null,
      mentions: [],
    });
  });
});
