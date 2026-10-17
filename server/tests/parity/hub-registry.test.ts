/* The pieces of the hub that the scheduled job and the audit log rely on, run as SQL on the real hub migrations: the task
   counts the job saves, the way a progress line is upserted (a column that is left out keeps its value), the audit log that
   only the service role may touch, and the question that keeps a division project awake. */
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { freshDb, migrationsIn } from './pg.ts';

let hub: PGlite;
let spoke: PGlite;
beforeAll(async () => {
  hub = await freshDb(migrationsIn('hub/migrations'));
  spoke = await freshDb([...migrationsIn('spoke/base/migrations'), ...migrationsIn('spoke/ee/migrations')]);
  const task = (id: string, div: string, status: string, trashed?: boolean) =>
    hub.query('insert into public.tasks (id, doc) values ($1, $2)', [id, JSON.stringify({ id, div, status, ...(trashed === undefined ? {} : { trashed }) })]);
  await task('t1', 'ee', 'todo');
  await task('t2', 'ee', 'done');
  await task('t3', 'ee', 'done', false);
  await task('t4', 'ee', 'done', true); // trashed: not counted
  await task('t5', 'ee', 'doing', true); // trashed: not counted
  await task('t6', 'hr', 'done');
}, 120_000);
afterAll(async () => {
  await hub.close();
  await spoke.close();
});

const asService = async <T>(db: PGlite, fn: () => Promise<T>): Promise<T> => {
  await db.exec('set role service_role');
  try {
    return await fn();
  } finally {
    await db.exec('reset role');
  }
};

describe('the task counts the job saves', () => {
  // the same filters the gateway sends: div, not trashed, and for the finished ones status = done
  const count = async (div: string, done: boolean) =>
    Number(
      (await hub.query<{ n: string }>(`select count(*) as n from public.tasks where div = $1 and (trashed is null or trashed = false) ${done ? `and status = 'done'` : ''}`, [div])).rows[0]?.n,
    );

  it('leaves trashed tasks out and counts a task with no trashed flag', async () => {
    expect(await count('ee', false)).toBe(3);
    expect(await count('ee', true)).toBe(2);
    expect(await count('hr', false)).toBe(1);
    expect(await count('fnl', false)).toBe(0);
  });
});

describe('division_progress', () => {
  it('has a line to fill for each of the six divisions to point at', async () => {
    expect(Number((await hub.query<{ n: string }>('select count(*) as n from public.divisions')).rows[0]?.n)).toBe(6);
  });

  it('is written by an upsert on the division; a column that is left out keeps its value; the percentage is the database\'s', async () => {
    await asService(hub, async () => {
      await hub.exec(`
        insert into public.division_progress (division_id, total_items, done_items, last_synced_at, last_error)
          values ('ee', 3, 2, now(), null)
          on conflict (division_id) do update set total_items = excluded.total_items, done_items = excluded.done_items,
            last_synced_at = excluded.last_synced_at, last_error = excluded.last_error;
        insert into public.division_progress (division_id, last_error) values ('ee', 'unreachable')
          on conflict (division_id) do update set last_error = excluded.last_error;`);
    });
    const row = (await hub.query<{ total_items: number; done_items: number; percent: string; last_error: string }>(`select total_items, done_items, percent, last_error from public.division_progress where division_id = 'ee'`)).rows[0];
    expect(row).toMatchObject({ total_items: 3, done_items: 2, last_error: 'unreachable' });
    expect(Number(row?.percent)).toBeCloseTo(66.67, 2);
  });

  it('refuses a division that does not exist', async () => {
    await expect(asService(hub, () => hub.query(`insert into public.division_progress (division_id) values ('moon')`))).rejects.toThrow();
  });
});

describe('audit_log', () => {
  it('is written and read by the service role, newest first', async () => {
    await asService(hub, async () => {
      await hub.query(`insert into public.audit_log (at, person_id, division_id, action, detail) values ('2026-10-17T01:00:00Z', 'hr_dir', null, 'access.change', $1)`, [JSON.stringify({ table: 'acct_grants' })]);
      await hub.query(`insert into public.audit_log (at, person_id, division_id, action, detail) values ('2026-10-17T02:00:00Z', 'mem_ee', 'fnl', 'changes.denied', null)`);
    });
    const rows = await asService(hub, async () => (await hub.query<{ action: string; detail: unknown }>(`select action, detail from public.audit_log order by at desc limit 5`)).rows);
    expect(rows.map((r) => r.action)).toEqual(['changes.denied', 'access.change']);
    expect(rows[1]?.detail).toEqual({ table: 'acct_grants' });
  });

  it('cannot be read or written by the browser\'s roles', async () => {
    for (const role of ['anon', 'authenticated']) {
      await hub.exec(`set role ${role}`);
      for (const sql of ['select 1 from public.audit_log', `insert into public.audit_log (action) values ('x')`]) {
        await expect(hub.query(sql), `${role}: ${sql}`).rejects.toThrow(/permission denied/);
      }
      await hub.exec('reset role');
    }
  });
});

describe('the question that keeps a division project awake', () => {
  it('is answered by schema_meta for the service role and by nobody else', async () => {
    expect(await asService(spoke, async () => (await spoke.query('select version from public.schema_meta limit 1')).rows.length)).toBe(1);
    for (const role of ['anon', 'authenticated']) {
      await spoke.exec(`set role ${role}`);
      await expect(spoke.query('select version from public.schema_meta limit 1'), role).rejects.toThrow(/permission denied/);
      await spoke.exec('reset role');
    }
  });
});
