import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { demoWorkspace } from './demo-seed';
import { compose, decompose, diff } from './shape';

describe('workspace shape (entity_task, data model M6)', () => {
  it('decompose then compose gives back the same workspace', async () => {
    const db = await demoWorkspace();
    expect(compose(decompose(db))).toEqual(db);
  });

  it('a change to one task sends only that task row', async () => {
    const before = await demoWorkspace();
    const after = produce(before, (d) => {
      const t = d.tasks.find((x) => x.id === 't1');
      if (t) t.status = 'done';
    });
    const c = diff(before, after);
    expect(Object.keys(c)).toEqual(['tasks']);
    expect(c.tasks?.upsert?.map((r) => r.id)).toEqual(['t1']);
    expect(c.tasks?.delete).toBeUndefined();
  });

  it('a removed record becomes a delete; an added one shifts positions after it', async () => {
    const before = await demoWorkspace();
    const after = produce(before, (d) => {
      d.blockers.splice(0, 1);
    });
    const c = diff(before, after);
    expect(c.blockers?.delete).toEqual(['b1']);
    expect(c.blockers?.upsert?.map((r) => [r.id, r.pos])).toEqual([
      ['b2', 0],
      ['b3', 1],
    ]);
  });

  it('keyed stores compare the record, not the stored wrapper', async () => {
    const before = await demoWorkspace();
    const after = produce(before, (d) => {
      const pins = d.pins ?? {};
      pins.mahdy = [...(pins.mahdy ?? []), { k: 'project', id: 'p-q3' }];
      d.pins = pins;
    });
    const c = diff(before, after);
    expect(c.pins?.upsert?.map((r) => r.id)).toEqual(['mahdy']);
  });

  it('an unchanged workspace produces no changes', async () => {
    const db = await demoWorkspace();
    expect(
      diff(
        db,
        produce(db, () => undefined),
      ),
    ).toEqual({});
  });
});
