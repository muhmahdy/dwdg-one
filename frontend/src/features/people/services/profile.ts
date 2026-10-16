/* Your own profile fields: LinkedIn, phone, and whether the phone is hidden from others. Only you see a hidden phone. */
import { t } from '@/lib/i18n';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';

type Field = 'linkedin' | 'phone' | 'hidePhone';

export function setProfileField(field: Field, value: string | boolean) {
  return act(({ db, toast }) => {
    const me = getMe();
    const p = db.people.find((x) => x.id === me?.id);
    if (!p) return;
    const prev = p[field];
    if (field === 'hidePhone') p.hidePhone = value === true;
    else p[field] = typeof value === 'string' ? value.trim() : '';
    const id = p.id;
    toast(t('Profile saved'), ({ db: d }) => {
      const x = d.people.find((y) => y.id === id);
      if (!x) return;
      if (field === 'hidePhone') x.hidePhone = prev as boolean | undefined;
      else x[field] = prev as string | null | undefined;
    });
  });
}
