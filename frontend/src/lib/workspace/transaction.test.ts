import { beforeEach, describe, expect, it } from 'vitest';
import { demoWorkspace } from './demo-seed';
import { createMemoryRepository } from './memory-repository';
import {
  act,
  configureTransactions,
  historyStore,
  loadWorkspace,
  redoLast,
  resetTransactions,
  toastStore,
  uiStore,
  undoLast,
  workspaceStore,
} from './transaction';

const repo = createMemoryRepository(demoWorkspace);
const status = (id: string) => workspaceStore.get()?.tasks.find((t) => t.id === id)?.status;

beforeEach(async () => {
  resetTransactions();
  repo.saved.length = 0;
  configureTransactions({ repository: repo });
  loadWorkspace(await demoWorkspace());
});

describe('transactions (engineering-transactions, work_undo_archive)', () => {
  it('saves only the changed rows and shows the toast after the save', async () => {
    const done = act(({ db, toast }) => {
      const t = db.tasks.find((x) => x.id === 't1');
      if (t) t.status = 'done';
      toast('Completed');
    });
    expect(status('t1')).toBe('done'); // shown at once
    expect(toastStore.get()).toBeNull(); // feedback waits for the save
    await expect(done).resolves.toBe(true);
    expect(repo.saved).toHaveLength(1);
    expect(repo.saved[0]?.tasks?.upsert?.map((r) => r.id)).toEqual(['t1']);
    expect(toastStore.get()?.msg).toBe('Completed');
  });

  it('a failed save rolls back records, screen state and history, then shows the failure text', async () => {
    repo.failNextSave();
    const ok = await act(({ db, ui, toast }) => {
      const t = db.tasks.find((x) => x.id === 't1');
      if (t) t.status = 'done';
      ui.insp = { type: 'task', id: 't1' };
      toast('Completed', ({ db: d }) => {
        const x = d.tasks.find((y) => y.id === 't1');
        if (x) x.status = 'doing';
      });
    });
    expect(ok).toBe(false);
    expect(status('t1')).toBe('doing');
    expect(uiStore.get().insp).toBeNull();
    expect(historyStore.get().u).toHaveLength(0);
    expect(toastStore.get()?.msg).toBe('Could not save. Your changes are still here. Please try again.');
  });

  it('undo runs the reversal; redo puts back the state before the undo', async () => {
    await act(({ db, toast }) => {
      const t = db.tasks.find((x) => x.id === 't1');
      if (!t) return;
      const old = t.status;
      t.status = 'done';
      toast('Completed', ({ db: d }) => {
        const x = d.tasks.find((y) => y.id === 't1');
        if (x) x.status = old;
      });
    });
    expect(historyStore.get().u).toHaveLength(1);
    await undoLast();
    expect(status('t1')).toBe('doing');
    expect(historyStore.get().u).toHaveLength(0);
    expect(historyStore.get().r).toHaveLength(1);
    expect(toastStore.get()?.msg).toBe('Undone: Completed');
    await redoLast();
    expect(status('t1')).toBe('done');
    expect(historyStore.get().u).toHaveLength(1);
    expect(toastStore.get()?.msg).toBe('Redone: Completed');
  });

  it('keeps at most 50 undo entries', async () => {
    for (let i = 0; i < 55; i++)
      await act(({ db, toast }) => {
        const t = db.tasks.find((x) => x.id === 't1');
        if (t) t.notes = `n${i}`;
        toast(`edit ${i}`, () => undefined);
      });
    expect(historyStore.get().u).toHaveLength(50);
    expect(historyStore.get().u[0]?.msg).toBe('edit 5');
  });
});
