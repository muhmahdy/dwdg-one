import { beforeAll, describe, expect, it } from 'vitest';
import { setDemoClock } from '@/lib/time';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import type { Person, Workspace } from '@/types/workspace';
import { busyFor, clashOf, coverage, nameList, overlaps } from './availability';
import { allDayItems, dayItems, ALL_LAYERS } from './calendar';
import { highlight, initialComposer, parseComposer } from './composer';
import { icsFor } from './ics';

let db: Workspace;
let me: Person;

beforeAll(async () => {
  setDemoClock('2026-10-06');
  db = await demoWorkspace();
  const found = db.people.find((p) => p.id === 'mahdy');
  if (!found) throw new Error('demo seed has no mahdy');
  me = found;
});

describe('availability evidence', () => {
  it('treats intervals as half-open', () => {
    expect(overlaps(540, 600, 570, 630)).toBe(true);
    expect(overlaps(540, 600, 600, 660)).toBe(false);
  });

  it('reports unknown when nothing is recorded, never free', () => {
    const quiet = db.people.find((p) => !p.gcal && !db.unavailable.some((u) => u.who === p.id));
    expect(quiet && coverage(db, quiet.id)).toBe('unknown');
  });

  it('shows a meeting title only to people invited to it', () => {
    const mt = db.meetings.find((m) => Object.keys(m.responses).length > 2 && m.state !== 'cancelled');
    if (!mt) throw new Error('no meeting in the demo seed');
    const guest = Object.keys(mt.responses).find((g) => g !== mt.organizer) ?? mt.organizer;
    const outsider = db.people.find((p) => !mt.responses[p.id]);
    if (!outsider) throw new Error('everyone is invited');
    const inside = busyFor(db, mt.organizer, guest, mt.date).list.find((b) => b.s === mt.start);
    const outside = busyFor(db, outsider.id, guest, mt.date).list.find((b) => b.s === mt.start);
    expect(inside?.label).toBe(mt.title);
    expect(outside?.label).not.toBe(mt.title);
  });

  it('finds the clash between two overlapping blocks', () => {
    const mt = db.meetings.find((m) => m.responses[me.id] === 'accepted' && m.state === 'planned');
    if (!mt) throw new Error('no accepted meeting');
    expect(clashOf(db, me.id, me.id, mt.date, mt.start + 15, mt.end - 15).length).toBeGreaterThan(0);
  });

  it('lists names with "and" and you for the viewer', () => {
    expect(nameList(db, me.id, [me.id, 'salsa'])).toMatch(/you.*Salsa/);
  });
});

describe('calendar layout', () => {
  it('lays overlapping items side by side and keeps lone items full width', () => {
    const items = dayItems(db, me, ALL_LAYERS, '2026-10-07');
    for (const it of items) expect(it.col).toBeLessThan(it.n);
    const lone = items.find((it) => it.n === 1);
    expect(lone === undefined || lone.col === 0).toBe(true);
  });

  it('puts date-only work in the all-day row, not in hours', () => {
    const due = allDayItems(db, me, ALL_LAYERS, '2026-10-06').filter((it) => it.kind === 'due');
    for (const it of due) expect(it.kind === 'due' && it.task.due).toBe('2026-10-06');
  });

  it('hides a layer when it is switched off', () => {
    const off = { ...ALL_LAYERS, meetings: false };
    expect(dayItems(db, me, off, '2026-10-07').some((it) => it.kind === 'meeting')).toBe(false);
  });
});

describe('meeting composer sentence', () => {
  const parse = (text: string) => parseComposer(db, me, initialComposer(text, {}));

  it('reads people, day, time and length from one sentence', () => {
    const c = parse('Coffee with Salsa Friday 10:00 for 30 min');
    expect(c.people).toContain('salsa');
    expect(c.date).toBe('2026-10-09');
    expect(c.start).toBe(600);
    expect(c.dur).toBe(30);
    expect(c.title).toBe('Coffee');
  });

  it('understands hours and Indonesian day words', () => {
    const c = parse('Review dengan Fikri besok 1 jam');
    expect(c.date).toBe('2026-10-07');
    expect(c.dur).toBe(60);
  });

  it('keeps a person taken off the sentence off the list', () => {
    const c = parseComposer(db, me, { ...initialComposer('Lunch with Salsa', {}), removed: ['salsa'] });
    expect(c.people).not.toContain('salsa');
  });

  it('marks what it understood in place', () => {
    const c = parse('Coffee with Salsa Friday');
    const marks = highlight(db, me, c.text, c.people);
    expect(marks.find((m) => m.cls === 'p')?.text).toBe('Salsa');
    expect(marks.find((m) => m.cls === 'd')?.text).toBe('Friday');
  });
});

describe('.ics export', () => {
  it('writes one event in Asia/Jakarta and escapes text', () => {
    const mt = db.meetings[0];
    if (!mt) throw new Error('no meeting');
    const ics = icsFor({ ...mt, title: 'A, B; C', where: 'Room 1' });
    expect(ics).toContain('TZID=Asia/Jakarta');
    expect(ics).toContain('SUMMARY:A\\, B\\; C');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
});
