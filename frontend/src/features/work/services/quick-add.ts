/* Quick add understands @people, a day word and a time (work_task_fields). A mention never assigns the task: responsibility
   changes only through an accepted offer (access_delegation). From screens/work.js parseQuick. */
import { addDays, today, weekday } from '@/lib/time';
import type { PersonId, Workspace } from '@/types/workspace';

const DAYS_Q: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
  sen: 1,
  sel: 2,
  rab: 3,
  kam: 4,
  jum: 5,
  sab: 6,
  min: 7,
};

export interface Parsed {
  title: string;
  due: string | null;
  time: number | null;
  mentions: PersonId[];
}

export function parseQuick(db: Workspace, text: string): Parsed {
  let title = text;
  let due = null as string | null;
  let time = null as number | null;
  const mentions: PersonId[] = [];
  title = title.replace(/@([A-Za-z]+)/g, (m, n: string) => {
    const p = db.people.find((x) => x.status === 'active' && x.first.toLowerCase() === n.toLowerCase());
    if (!p) return m;
    if (!mentions.includes(p.id)) mentions.push(p.id);
    return p.first;
  });
  title = title.replace(/\b(today|tomorrow|hari ini|besok)\b/i, (_m, w: string) => {
    due = addDays(today(), /^(tomorrow|besok)$/i.test(w) ? 1 : 0);
    return '';
  });
  if (!due)
    title = title.replace(
      /\b(mon|tue|wed|thu|fri|sat|sun|senin|selasa|rabu|kamis|jumat|sabtu|minggu)[a-z]*\b/i,
      (_m, w: string) => {
        let n = (DAYS_Q[w.toLowerCase().slice(0, 3)] ?? 1) - weekday(today());
        if (n <= 0) n += 7;
        due = addDays(today(), n);
        return '';
      },
    );
  title = title.replace(/\b(?:at\s+|jam\s+|pukul\s+)?(\d{1,2})[:.](\d{2})\b/i, (m, a: string, b: string) => {
    if (+a > 23 || +b > 59) return m;
    time = +a * 60 + +b;
    return '';
  });
  return { title: title.replace(/\s{2,}/g, ' ').trim(), due, time, mentions };
}
