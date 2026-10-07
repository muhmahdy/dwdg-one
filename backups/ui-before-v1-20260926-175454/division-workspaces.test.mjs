import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDivisionSeed, makeDivisionDemoData, validateDivisionState,
  budgetBalance, mountDivisionWorkspace
} from './division-workspaces.mjs';

const DAY = '2026-09-23';

class FakeContainer {
  constructor() {
    this.innerHTML = '';
    this.listeners = new Map();
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type) { this.listeners.delete(type); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  contains() { return true; }
  replaceChildren() { this.innerHTML = ''; }
  click(dataset) {
    this.listeners.get('click')({
      target: {closest: () => ({dataset})}
    });
  }
}

async function withFakeDom(run) {
  const originalElement = globalThis.Element;
  const originalCSS = globalThis.CSS;
  globalThis.Element = FakeContainer;
  globalThis.CSS = {escape: value => String(value)};
  try { return await run(); }
  finally {
    if (originalElement === undefined) delete globalThis.Element;
    else globalThis.Element = originalElement;
    if (originalCSS === undefined) delete globalThis.CSS;
    else globalThis.CSS = originalCSS;
  }
}

test('production division state is empty while stages remain editable defaults', () => {
  const seed = makeDivisionSeed(DAY);
  const demo = makeDivisionDemoData(DAY);
  assert.equal(validateDivisionState(seed).ok, true);
  assert.equal(seed.initiatives.length, 0);
  assert.equal(seed.financeRequests.length, 0);
  assert.equal(seed.candidates.length, 0);
  assert.equal(seed.deliverables.length, 0);
  assert.equal(seed.activity.length, 0);
  assert.ok(seed.stages.initiatives.some(stage => stage.id === 'proposed'));
  assert.ok(seed.stages.financeRequests.some(stage => stage.id === 'approved'));
  assert.ok(demo.initiatives.length > 0);
  assert.equal(seed.initiatives.length, 0);
});

test('budget balance separates new allocation, commitments, paid expenses, and pending requests', () => {
  const data = makeDivisionSeed(DAY);
  data.budgets = [
    {id: 'operations', title: 'Operations', allocated: 1_000_000},
    {id: 'events', title: 'Events', allocated: 500_000}
  ];
  data.financeRequests = [
    {id: 'allocation', title: 'Extra allocation', type: 'budget', budgetId: 'operations', amount: 200_000, stageId: 'approved'},
    {id: 'commitment', title: 'Print', type: 'expense', budgetId: 'operations', amount: 300_000, stageId: 'approved'},
    {id: 'paid', title: 'Transport', type: 'expense', budgetId: 'operations', amount: 100_000, stageId: 'paid'},
    {id: 'pending', title: 'Proposed equipment', type: 'expense', budgetId: 'operations', amount: 400_000, stageId: 'submitted'},
    {id: 'rejected', title: 'Rejected purchase', type: 'expense', budgetId: 'operations', amount: 50_000, stageId: 'rejected'}
  ];
  assert.deepEqual(budgetBalance(data, 'operations'), {
    allocated: 1_200_000, committed: 300_000, paid: 100_000, remaining: 800_000
  });
  assert.deepEqual(budgetBalance(data, 'events'), {
    allocated: 500_000, committed: 0, paid: 0, remaining: 500_000
  });
});

test('division validation rejects duplicate stages, unknown transitions, invalid dates, and unsafe IDR', () => {
  const duplicate = makeDivisionSeed(DAY);
  duplicate.stages.content.push({...duplicate.stages.content[0]});
  assert.ok(validateDivisionState(duplicate).errors.some(error => error.includes('duplicate stage ID')));

  const unknownStage = makeDivisionSeed(DAY);
  unknownStage.initiatives.push({
    id: 'i', title: 'Plan', stageId: 'unconfigured', horizon: 'now'
  });
  assert.ok(validateDivisionState(unknownStage).errors.some(error => error.includes('unknown stage')));

  const badDate = makeDivisionSeed(DAY);
  badDate.candidates.push({
    id: 'c', title: 'Candidate', stageId: 'applied', dueDate: '2026-02-30'
  });
  assert.ok(validateDivisionState(badDate).errors.some(error => error.includes('invalid dueDate')));

  const unsafeAmount = makeDivisionSeed(DAY);
  unsafeAmount.budgets.push({
    id: 'b', title: 'Budget', allocated: Number.MAX_SAFE_INTEGER + 1
  });
  assert.ok(validateDivisionState(unsafeAmount).errors.some(error => error.includes('integer IDR')));
});

test('financial requests require an existing budget while legal requests may have none', () => {
  const data = makeDivisionSeed(DAY);
  data.financeRequests.push({
    id: 'expense', title: 'Supplies', type: 'expense', budgetId: '',
    amount: 100_000, stageId: 'submitted'
  });
  assert.ok(validateDivisionState(data).errors.some(error => error.includes('budget line')));
  data.financeRequests[0].type = 'legal';
  data.financeRequests[0].amount = 0;
  assert.equal(validateDivisionState(data).ok, true);
});

test('restricted HR and finance records are absent from nonmember views', async () => {
  await withFakeDom(async () => {
    const data = makeDivisionDemoData(DAY);
    const hr = new FakeContainer();
    const disposeHr = mountDivisionWorkspace(hr, {
      slug: 'human-resource', data, canViewSensitive: false
    });
    assert.match(hr.innerHTML, /records are restricted/i);
    assert.doesNotMatch(hr.innerHTML, /Community program applicant/);
    disposeHr();

    const finance = new FakeContainer();
    const disposeFinance = mountDivisionWorkspace(finance, {
      slug: 'legal-finance', data, canViewSensitive: false
    });
    assert.match(finance.innerHTML, /Financial and legal detail is restricted/i);
    assert.doesNotMatch(finance.innerHTML, /Print workshop materials/);
    disposeFinance();

    const permitted = new FakeContainer();
    const disposePermitted = mountDivisionWorkspace(permitted, {
      slug: 'human-resource', data, canViewSensitive: true
    });
    assert.match(permitted.innerHTML, /Community program applicant/);
    disposePermitted();
  });
});

test('stage reorder submits an authoritative change; protected stages cannot be removed', async () => {
  await withFakeDom(async () => {
    const data = makeDivisionSeed(DAY);
    const container = new FakeContainer();
    const changes = [];
    const dispose = mountDivisionWorkspace(container, {
      slug: 'strategy-growth', data, canEdit: true,
      onChange: async (next, message) => {
        changes.push({next: structuredClone(next), message});
        return next;
      }
    });
    container.click({dw: 'stage-move', group: 'initiatives', id: 'proposed', dir: '1'});
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(changes.length, 1);
    assert.deepEqual(changes[0].next.stages.initiatives.slice(0, 2).map(x => x.id),
      ['researching', 'proposed']);
    assert.equal(data.stages.initiatives[0].id, 'proposed');

    container.click({dw: 'stage-remove', group: 'initiatives', id: 'completed'});
    assert.equal(changes.length, 1);
    assert.match(container.innerHTML, /built-in workflow/i);
    dispose();
    assert.equal(container.listeners.size, 0);
  });
});

test('ordinary division members can edit records but cannot change workflow stages', async () => {
  await withFakeDom(async () => {
    const container = new FakeContainer();
    let writes = 0;
    const dispose = mountDivisionWorkspace(container, {
      slug: 'strategy-growth', data: makeDivisionSeed(DAY),
      canEdit: true, canManageStages: false,
      onChange: async next => {writes += 1; return next;}
    });
    container.click({dw: 'tab', tab: 'workflow'});
    assert.doesNotMatch(container.innerHTML, /data-dw="stage-add"/);
    container.click({dw: 'stage-move', group: 'initiatives', id: 'proposed', dir: '1'});
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(writes, 0);
    dispose();
  });
});

test('invited requester sees only their finance requests and can start a new one', async () => {
  await withFakeDom(async () => {
    const data = makeDivisionDemoData(DAY);
    data.financeRequests[0].requesterId = 'requester';
    data.financeRequests[1].requesterId = 'someone-else';
    const container = new FakeContainer();
    const dispose = mountDivisionWorkspace(container, {
      slug: 'legal-finance', data, currentUserId: 'requester',
      canViewSensitive: false, canSubmitFinanceRequest: true
    });
    assert.match(container.innerHTML, /Print workshop materials/);
    assert.doesNotMatch(container.innerHTML, /Review event agreement/);
    assert.match(container.innerHTML, /data-dw="add" data-entity="financeRequests"/);
    assert.doesNotMatch(container.innerHTML, /Budget flow/);
    dispose();
  });
});

test('approval controls never appear for the requester, even when they have approver permission', async () => {
  await withFakeDom(async () => {
    const data = makeDivisionDemoData(DAY);
    for (const request of data.financeRequests) request.requesterId = 'member-1';
    const own = new FakeContainer();
    const disposeOwn = mountDivisionWorkspace(own, {
      slug: 'legal-finance', data, canViewSensitive: true,
      canApprove: true, currentUserId: 'member-1'
    });
    assert.doesNotMatch(own.innerHTML, /data-dw="approve"/);
    disposeOwn();

    const other = new FakeContainer();
    const disposeOther = mountDivisionWorkspace(other, {
      slug: 'legal-finance', data, canViewSensitive: true,
      canApprove: true, currentUserId: 'member-2'
    });
    assert.match(other.innerHTML, /data-dw="approve"/);
    disposeOther();
  });
});

test('finance approval transition updates state only for another designated approver', async () => {
  await withFakeDom(async () => {
    const data = makeDivisionDemoData(DAY);
    data.financeRequests[0].requesterId = 'requester';
    const own = new FakeContainer();
    let ownChanges = 0;
    const disposeOwn = mountDivisionWorkspace(own, {
      slug: 'legal-finance', data, canViewSensitive: true,
      canApprove: true, currentUserId: 'requester',
      onChange: async () => {ownChanges += 1;}
    });
    own.click({dw: 'approve', id: data.financeRequests[0].id});
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(ownChanges, 0);
    disposeOwn();

    const other = new FakeContainer();
    let saved;
    const disposeOther = mountDivisionWorkspace(other, {
      slug: 'legal-finance', data, canViewSensitive: true,
      canApprove: true, currentUserId: 'approver',
      onChange: async next => {saved = structuredClone(next); return next;}
    });
    other.click({dw: 'approve', id: data.financeRequests[0].id});
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(saved.financeRequests[0].stageId, 'approved');
    assert.equal(saved.financeRequests[0].approverId, 'approver');
    assert.equal(budgetBalance(saved, data.budgets[0].id).committed, 420_000);
    disposeOther();
  });
});
