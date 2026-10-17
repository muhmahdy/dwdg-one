import { beforeEach, describe, expect, it } from 'vitest';
import { setSession } from '@/lib/session';
import { setDemoClock } from '@/lib/time';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import { createMemoryRepository } from '@/lib/workspace/memory-repository';
import {
  configureTransactions,
  loadWorkspace,
  resetTransactions,
  toastStore,
  workspaceStore,
} from '@/lib/workspace/transaction';
import type { Workspace } from '@/types/workspace';
import { amendAllocation, approveFinance, recordInvoice, recordPayment, recordReceipt } from './finance';
import {
  approvalBlock,
  isFutureDate,
  type Allocation,
  type FinanceRequest,
  type FnlStore,
  type IncomingTerm,
} from './fnl-data';

const TODAY = '2026-10-17';
const repo = createMemoryRepository(demoWorkspace);
let reviewer = '';
let requester = '';

const alloc = (over: Partial<Allocation> = {}): Allocation => ({
  id: 'al-x',
  term: '2026/1',
  unit: 'fnl',
  project: null,
  category: 'Operations',
  amount: 1_000_000,
  state: 'approved',
  source: 'test',
  approvedBy: null,
  approvedAt: null,
  history: [],
  createdBy: requester,
  createdAt: `${TODAY}T09:00`,
  returnNote: '',
  ...over,
});
const request = (over: Partial<FinanceRequest> = {}): FinanceRequest =>
  ({
    id: 'fr-x',
    requester,
    unit: 'fnl',
    project: null,
    alloc: 'al-x',
    category: 'Events',
    purpose: 'Test',
    requested: 400_000,
    approved: null,
    state: 'review',
    payee: '',
    method: 'Bank transfer',
    neededBy: null,
    evidence: [],
    ref: '',
    version: 1,
    review: null,
    returnNote: '',
    reason: '',
    dup: null,
    reconciledIn: null,
    history: [],
    createdBy: requester,
    createdAt: `${TODAY}T09:00`,
    ...over,
  });
const term = (over: Partial<IncomingTerm> = {}): IncomingTerm =>
  ({
    id: 'in-x',
    title: 'Client term',
    state: 'accepted',
    expected: 500_000,
    receipts: [],
    history: [],
    ...over,
  }) as unknown as IncomingTerm;

/** Loads the demo people with a small finance store; the reviewer holds every grant, the requester none. */
async function load(f: { allocations?: Allocation[]; requests?: FinanceRequest[]; incoming?: IncomingTerm[] }) {
  const db = await demoWorkspace();
  const [a, b] = db.people;
  reviewer = a?.id ?? '';
  requester = b?.id ?? '';
  const grants = Object.fromEntries(
    ['finReview', 'pay', 'invoice', 'budget'].map((g) => [g, [reviewer]]),
  ) as unknown as FnlStore['grants'];
  const store = {
    v: 1,
    grants,
    legal: [],
    register: [],
    allocations: f.allocations ?? [],
    requests: f.requests ?? [],
    payments: [],
    incoming: f.incoming ?? [],
    periods: [],
    drafts: {},
  } as unknown as FnlStore;
  loadWorkspace({ ...db, fnl: store });
  setSession({ me: reviewer });
}
const cur = (): Workspace => {
  const w = workspaceStore.get();
  if (!w) throw new Error('no workspace loaded');
  return w;
};
const store = () => cur().fnl as unknown as FnlStore;
const reqAt = (i: number): FinanceRequest => {
  const x = store().requests[i];
  if (!x) throw new Error(`no request ${String(i)}`);
  return x;
};

beforeEach(() => {
  setDemoClock(TODAY);
  resetTransactions();
  repo.saved.length = 0;
  configureTransactions({ repository: repo });
});

describe('finance dates (finance_payment, finance_incoming)', () => {
  it('today is fine, tomorrow is in the future', () => {
    expect(isFutureDate(TODAY)).toBe(false);
    expect(isFutureDate('2026-10-16')).toBe(false);
    expect(isFutureDate('2026-10-18')).toBe(true);
  });

  it('a payment dated tomorrow is refused and nothing is added', async () => {
    await load({ allocations: [alloc()], requests: [request({ state: 'approved', approved: 400_000 })] });
    const ok = await recordPayment('fr-x', { amount: 100_000, date: '2026-10-18', ref: 'TRX-1', evidence: '', note: '' });
    expect(ok).toBe(false);
    expect(store().payments).toHaveLength(0);
    expect(toastStore.get()?.msg).toBe('Use the date the payment was actually made.');
  });

  it('a payment dated today is recorded', async () => {
    await load({ allocations: [alloc()], requests: [request({ state: 'approved', approved: 400_000 })] });
    const ok = await recordPayment('fr-x', { amount: 100_000, date: TODAY, ref: 'TRX-1', evidence: '', note: '' });
    expect(ok).toBe(true);
    expect(store().payments).toHaveLength(1);
  });

  it('an invoice issued tomorrow is refused, one issued today is recorded', async () => {
    await load({ incoming: [term()] });
    expect(await recordInvoice('in-x', { ref: 'INV-1', url: '', on: '2026-10-18', due: null })).toBe(false);
    expect(store().incoming[0]?.state).toBe('accepted');
    expect(toastStore.get()?.msg).toBe('Use the date it was actually issued.');
    expect(await recordInvoice('in-x', { ref: 'INV-1', url: '', on: TODAY, due: null })).toBe(true);
    expect(store().incoming[0]?.state).toBe('invoiced');
  });

  it('a receipt dated tomorrow is refused, one dated today is recorded', async () => {
    await load({ incoming: [term({ state: 'invoiced' })] });
    expect(await recordReceipt('in-x', { amount: 100_000, date: '2026-10-18', ref: 'R-1', evidence: '' })).toBe(false);
    expect(store().incoming[0]?.receipts).toHaveLength(0);
    expect(toastStore.get()?.msg).toBe('Use the date the money actually arrived.');
    expect(await recordReceipt('in-x', { amount: 100_000, date: TODAY, ref: 'R-1', evidence: '' })).toBe(true);
    expect(store().incoming[0]?.receipts).toHaveLength(1);
  });
});

describe('approval needs an approved budget line with enough left (finance_approval)', () => {
  it('names the problem when there is no line, or the line is not approved', async () => {
    await load({ allocations: [alloc({ state: 'proposed' })], requests: [request(), request({ id: 'fr-y', alloc: null })] });
    const db = cur();
    const msg = 'This request has no approved budget line. Link one first.';
    expect(approvalBlock(db, reqAt(0), 100_000)).toBe(msg);
    expect(approvalBlock(db, reqAt(1), 100_000)).toBe(msg);
  });

  it('allows up to the remaining allocation and refuses one rupiah more', async () => {
    await load({ allocations: [alloc({ amount: 1_000_000 })], requests: [request()] });
    const db = cur();
    const x = reqAt(0);
    expect(approvalBlock(db, x, 1_000_000)).toBeNull();
    expect(approvalBlock(db, x, 1_000_001)).toBe(
      'Above the remaining allocation of Rp 1.000.000. Amend the allocation first; going over is an exception POL has not defined.',
    );
  });

  it('counts what other requests already took from the line', async () => {
    await load({
      allocations: [alloc({ amount: 1_000_000 })],
      requests: [request(), request({ id: 'fr-y', state: 'approved', approved: 700_000 })],
    });
    const db = cur();
    const x = reqAt(0);
    expect(approvalBlock(db, x, 300_000)).toBeNull();
    expect(approvalBlock(db, x, 300_001)).toContain('Rp 300.000');
  });

  it('approveFinance refuses above the line and leaves the request in review', async () => {
    await load({ allocations: [alloc({ amount: 300_000 })], requests: [request({ requested: 400_000 })] });
    const ok = await approveFinance('fr-x', 1, 400_000, '');
    expect(ok).toBe(false);
    expect(store().requests[0]?.state).toBe('review');
    expect(store().requests[0]?.approved).toBeNull();
    expect(toastStore.get()?.msg).toContain('Above the remaining allocation of Rp 300.000');
  });

  it('approveFinance refuses a request without a line, and approves one within the line', async () => {
    await load({ allocations: [alloc()], requests: [request({ alloc: null })] });
    expect(await approveFinance('fr-x', 1, 100_000, '')).toBe(false);
    expect(store().requests[0]?.state).toBe('review');
    await load({ allocations: [alloc()], requests: [request()] });
    expect(await approveFinance('fr-x', 1, 400_000, '')).toBe(true);
    expect(store().requests[0]).toMatchObject({ state: 'approved', approved: 400_000 });
  });
});

describe('amending an allocation (finance_budget)', () => {
  it('refuses the amount it already has', async () => {
    await load({ allocations: [alloc({ amount: 1_000_000 })] });
    const ok = await amendAllocation('al-x', 1_000_000, 'No change', false);
    expect(ok).toBe(false);
    expect(store().allocations[0]?.history).toHaveLength(0);
    expect(toastStore.get()?.msg).toBe('That is the current amount.');
  });

  it('saves a different amount with its reason', async () => {
    await load({ allocations: [alloc({ amount: 1_000_000 })] });
    expect(await amendAllocation('al-x', 1_200_000, 'Sponsor added', false)).toBe(true);
    expect(store().allocations[0]).toMatchObject({ amount: 1_200_000 });
    expect(store().allocations[0]?.history.at(-1)?.reason).toBe('Sponsor added');
  });
});
