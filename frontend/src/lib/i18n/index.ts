/* English is the default; Bahasa Indonesia is one tap away (design-languages, D7). Keys are the exact English strings;
   {name} placeholders are filled from `vars`. Missing keys fall back to English. User content is never translated.
   The dictionary is the prototype's own (core/i18n.js plus every screen's additions), extracted unchanged. */
import dictionary from './dictionary.id.json';

export type Lang = 'en' | 'id';
export type Vars = Record<string, string | number>;

const ID: Record<string, string> = dictionary;
let current: Lang = 'en';

export const setLang = (l: Lang) => {
  current = l;
};
export const lang = (): Lang => current;

export function t(s: string, vars?: Vars): string {
  let out = current === 'id' ? (ID[s] ?? s) : s;
  if (vars) for (const k in vars) out = out.split(`{${k}}`).join(String(vars[k]));
  return out;
}

/** "{n} task" / "{n} tasks", with the count filled in. */
export const plural = (n: number, one: string, many: string) => t(n === 1 ? one : many, { n });

export const MON = () =>
  current === 'id'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH = () =>
  current === 'id'
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WD = () => (current === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
export const WDL = () =>
  current === 'id'
    ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
