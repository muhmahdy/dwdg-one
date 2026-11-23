import { describe, expect, it } from 'vitest';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import type { Person } from '@/types/workspace';
import { canSeeDashboard, dashboardMetrics, progressOf, stateOf, type Metric } from './org-dashboard';

const person = (over: Partial<Person>): Person => ({
  id: 'x',
  name: 'X',
  first: 'X',
  div: 'sng',
  role: 'member',
  photo: null,
  title: '',
  admin: false,
  hasSchedule: false,
  gcal: false,
  status: 'active',
  ...over,
});

const metric = (over: Partial<Metric>): Metric => ({
  k: 'm',
  div: 'ee',
  label: 'M',
  help: '',
  value: 0,
  target: null,
  ...over,
});

describe('organisation dashboard: who opens it', () => {
  it('Strategy & Growth, the President, the VP and the Admin; not other divisions, not the Board', () => {
    expect(canSeeDashboard(person({ div: 'sng' }))).toBe(true);
    expect(canSeeDashboard(person({ div: null, role: 'president' }))).toBe(true);
    expect(canSeeDashboard(person({ div: null, role: 'vp' }))).toBe(true);
    expect(canSeeDashboard(person({ div: 'ee', admin: true }))).toBe(true);
    expect(canSeeDashboard(person({ div: 'ee' }))).toBe(false);
    expect(canSeeDashboard(person({ div: null, role: 'board' }))).toBe(false);
    expect(canSeeDashboard(undefined)).toBe(false);
  });
});

describe('organisation dashboard: counting the demo workspace', () => {
  it('gives the President every metric, each a finite count and no share above its whole', async () => {
    const db = await demoWorkspace();
    const all = dashboardMetrics(db, person({ id: 'pres-x', div: null, role: 'president' }), '2026-11-16');
    expect(all.length).toBeGreaterThan(10);
    for (const x of all) {
      expect(x.hidden, x.k).toBeFalsy();
      if (x.value !== null) expect(Number.isFinite(x.value), x.k).toBe(true);
      if (x.value !== null && typeof x.of === 'number') expect(x.value, x.k).toBeLessThanOrEqual(x.of);
    }
    // The demo seeds competency profiles for about three in four members, so coverage is known and below 100%.
    const cov = all.find((x) => x.k === 'hr-competency');
    expect(cov?.value).toBeGreaterThan(0);
    expect(stateOf(cov ?? metric({}))).toBe('below');
  });

  it('shows a Strategy & Growth member other divisions as hidden, never as zero', async () => {
    const db = await demoWorkspace();
    const all = dashboardMetrics(db, person({ id: 'sng-x', div: 'sng' }), '2026-11-16');
    const ee = all.filter((x) => x.div === 'ee');
    expect(ee.length).toBeGreaterThan(0);
    for (const x of ee) {
      expect(x.hidden).toBe(true);
      expect(x.value).toBeNull();
      expect(stateOf(x)).toBe('hidden');
    }
    for (const x of all.filter((y) => y.div === 'sng')) expect(x.hidden).toBeFalsy();
  });
});

describe('organisation dashboard: targets', () => {
  it('reads each kind of target', () => {
    expect(stateOf(metric({ value: 4, target: { kind: 'atLeast', n: 4 } }))).toBe('met');
    expect(stateOf(metric({ value: 3, target: { kind: 'atLeast', n: 4 } }))).toBe('below');
    expect(stateOf(metric({ value: 4, target: { kind: 'moreThan', n: 4 } }))).toBe('below');
    expect(stateOf(metric({ value: 6, target: { kind: 'moreThan', n: 4 } }))).toBe('met');
    expect(stateOf(metric({ value: 6, target: { kind: 'range', n: 3, max: 5 } }))).toBe('below');
    expect(stateOf(metric({ value: 5, of: 5, target: { kind: 'all' } }))).toBe('met');
    expect(stateOf(metric({ value: 2, target: null }))).toBe('notarget');
  });

  it('never turns missing data into zero', () => {
    expect(stateOf(metric({ value: 0, of: 0, target: { kind: 'all' } }))).toBe('nodata');
    expect(stateOf(metric({ value: null }))).toBe('nodata');
    expect(stateOf(metric({ value: null, hidden: true }))).toBe('hidden');
    expect(progressOf(metric({ value: 0, of: 0 }))).toBeNull();
    expect(progressOf(metric({ value: 3, of: 4 }))).toBe(0.75);
    expect(progressOf(metric({ value: 9, target: { kind: 'atLeast', n: 4 } }))).toBe(1);
    expect(progressOf(metric({ value: 2, target: null }))).toBeNull();
  });
});
