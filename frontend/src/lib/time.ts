/* Dates and times (engineering-time-tests, design-time). Dates are `YYYY-MM-DD`, instants `YYYY-MM-DDTHH:mm` in local
   time, times of day are minutes since midnight. "Today" comes from one clock: the real date, or the fixed demo date
   (Tuesday 6 Oct 2026) in demo mode so demo records always read coherently. */
import { MON, WD, t } from '@/lib/i18n';
import type { DateStr, Stamp } from '@/types/workspace';

let fixedToday: DateStr | null = null;

export const useDemoClock = (date: DateStr | null) => {
  fixedToday = date;
};

export const D = (s: DateStr) => new Date(`${s}T00:00:00`);
export const iso = (d: Date): DateStr =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = (): DateStr => fixedToday ?? iso(new Date());
export const nowStamp = (): Stamp => `${today()}T${new Date().toTimeString().slice(0, 5)}`;
export const nowMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};
export const addDays = (s: DateStr, n: number): DateStr => {
  const d = D(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const daysBetween = (a: DateStr, b: DateStr) => Math.round((D(b).getTime() - D(a).getTime()) / 864e5);
/** Minutes since midnight as `HH:mm`. */
export const mins = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
/** `HH:mm` as minutes since midnight. */
export const toMin = (v: string | null | undefined) => (v ? Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5)) : null);
export const dShort = (s: DateStr) => {
  const d = D(s);
  return `${d.getDate()} ${MON()[d.getMonth()] ?? ''}`;
};
export const dLong = (s: DateStr) => {
  const d = D(s);
  return `${WD()[d.getDay()] ?? ''} ${d.getDate()} ${MON()[d.getMonth()] ?? ''}`;
};
/** Monday = 1 … Sunday = 7. */
export const weekday = (s: DateStr) => {
  const w = D(s).getDay();
  return w === 0 ? 7 : w;
};
export const weekStart = (s: DateStr) => addDays(s, 1 - weekday(s));

/** "Yesterday", "14:05" for today, or a short date (core/app.js ago). */
export const ago = (at: Stamp) => {
  const d = daysBetween(at.slice(0, 10), today());
  return d <= 0 ? at.slice(11, 16) : d === 1 ? t('Yesterday') : dShort(at.slice(0, 10));
};
