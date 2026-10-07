import test from 'node:test';
import assert from 'node:assert/strict';
import {previewLegacyBackup} from './shared-backend.mjs';

const accountA = '10000000-0000-4000-8000-000000000001';
const accountB = '10000000-0000-4000-8000-000000000002';
const memberMap = {lead: accountA, member: accountB};

function backup() {
  return {
    version: 1,
    members: [
      {id: 'lead', name: 'Division lead'},
      {id: 'member', name: 'Member'}
    ],
    projects: [
      {id: 'p1', name: 'Shared workspace', division: 'Strategy & Growth',
        owner: 'lead', start: '2026-09-20', end: '2026-10-01'}
    ],
    tasks: [
      {id: 't1', projectId: 'p1', title: 'Review brief',
        assignee: 'member', status: 'progress',
        start: '2026-09-22', end: '2026-09-27'}
    ],
    events: [
      {id: 'e1', projectId: '', title: 'Personal planning',
        date: '2026-09-23', time: '09:30', duration: 30}
    ]
  };
}

test('preview accepts a mapped backup with a projectless personal event', () => {
  const result = previewLegacyBackup(backup(), memberMap);
  assert.equal(result.ready, true);
  assert.deepEqual(result.counts, {
    members: 2, projects: 1, tasks: 1, meetings: 1
  });
  assert.deepEqual(result.divisions, ['strategy_growth']);
});

test('preview rejects unknown divisions and an unmapped project lead', () => {
  const input = backup();
  input.projects[0].division = 'Unrecognized Team';
  input.projects[0].owner = 'unknown';
  const result = previewLegacyBackup(input, memberMap);
  assert.equal(result.ready, false);
  assert.deepEqual(result.unknownDivisions, ['Unrecognized Team']);
  assert.ok(result.invalidLinks.includes('p1'));
});

test('preview rejects duplicate IDs, impossible event dates, and unsupported task states', () => {
  const input = backup();
  input.projects.push({...input.projects[0]});
  input.tasks[0].status = 'in-review';
  input.events[0].date = '2026-02-30';
  input.events[0].time = '25:00';
  const result = previewLegacyBackup(input, memberMap);
  assert.equal(result.ready, false);
  assert.ok(result.invalidRecords.includes('duplicate IDs'));
  assert.ok(result.invalidRecords.includes('t1'));
  assert.ok(result.invalidRecords.includes('e1'));
});

test('preview requires every named legacy member to resolve to a real account UUID', () => {
  const result = previewLegacyBackup(backup(), {lead: accountA, member: 'member'});
  assert.equal(result.ready, false);
  assert.deepEqual(result.unmappedMembers, [{id: 'member', name: 'Member'}]);
});

test('preview rejects a dependency on a task in a different project', () => {
  const input = backup();
  input.projects.push({...input.projects[0], id: 'p2', name: 'Second project'});
  input.tasks.push({...input.tasks[0], id: 't2', projectId: 'p2', title: 'Other task'});
  input.tasks[0].dependsOn = 't2';
  const result = previewLegacyBackup(input, memberMap);
  assert.equal(result.ready, false);
  assert.deepEqual(result.invalidLinks, ['t1']);
});
