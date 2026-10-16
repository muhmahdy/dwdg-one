/* People, batch membership and onboarding (hr_person, hr_onboarding, hr_exports, flow-hr-onboarding, W049): one person record,
   a checklist template applied as real tasks with owners and due dates, and a roster export that never carries private data.
   From divisions/div-hr-sng.js. */
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { hrStaff, isBoard, isTop } from '@/lib/roles';
import { addTaskDraft } from '@/features/work/services/task-actions';
import { divisionOf } from '@/app/config/org';
import { roleLabel } from '@/components/shared/Avatar';
import type { DivisionId, Person, PersonId } from '@/types/workspace';
import { hrDraft, hrOf, type OnboardingInstance, type OnboardingTemplate } from './hr-data';

export const canPeople = (m: Person | undefined) => !!m && !isBoard(m) && (hrStaff(m) || isTop(m) || m.admin);

export const EXPORT_IN = ['Name', 'Division', 'Role', 'Term', 'Date joined', 'Account state'];
export const EXPORT_OUT = [
  'Absence reasons',
  'Monitoring scores',
  'Support actions',
  'Candidate and reviewer notes',
  'Phone numbers',
];

export const obInst = (db: Parameters<typeof hrOf>[0], id: string) =>
  hrOf(db)?.onboarding.instances.find((x) => x.id === id);
export const obTpl = (db: Parameters<typeof hrOf>[0], id: string): OnboardingTemplate | undefined =>
  hrOf(db)?.onboarding.templates.find((x) => x.id === id);

/** Which checklist items already have their task (an item number is kept on the task). */
export const itemTasks = (db: Parameters<typeof hrOf>[0], x: OnboardingInstance) =>
  x.tasks.map((id) => db.tasks.find((v) => v.id === id)).filter((v) => !!v && !v.trashed);

export const itemOwner = (x: OnboardingInstance, owner: 'member' | 'buddy' | 'hr'): PersonId | null =>
  owner === 'member' ? x.person : owner === 'buddy' ? x.buddy : x.hrOwner;

export const startOnboarding = (person: PersonId, buddy: PersonId) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    if (!m) return;
    const x: OnboardingInstance = {
      id: uid('obi'),
      person,
      template: 'ob-v1',
      version: 1,
      buddy,
      hrOwner: m.id,
      tasks: [],
      appliedAt: null,
      appliedBy: null,
      createdBy: m.id,
      createdAt: nowStamp(),
    };
    hrDraft(db).onboarding.instances.push(x);
    ui.form = null;
    logChange(db, 'hr', 'started onboarding for', {
      type: 'link',
      id: x.id,
      name: db.people.find((p) => p.id === person)?.name ?? '',
      h: 'hr-people',
    });
    toast(t('Onboarding started'), ({ db: u }) => {
      const o = hrDraft(u).onboarding;
      o.instances = o.instances.filter((v) => v.id !== x.id);
    });
  });
};

/** Applying is idempotent: tasks that already exist are kept and only missing items are created (flow-hr-onboarding 5). */
export const applyChecklist = (instanceId: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const x = hrDraft(db).onboarding.instances.find((v) => v.id === instanceId);
    const tpl = x && hrDraft(db).onboarding.templates.find((v) => v.id === x.template);
    const p = x && db.people.find((v) => v.id === x.person);
    if (!x || !tpl || !p || !m || p.status !== 'active') return;
    const have = x.tasks.map((id) => db.tasks.find((v) => v.id === id)).filter((v) => !!v && !v.trashed);
    const made: string[] = [];
    tpl.items.forEach((it, i) => {
      if (have.some((v) => v?.obItem === i)) return;
      const owner = itemOwner(x, it.owner);
      if (!owner) return;
      const nt = addTaskDraft(db, it.title.replace('{name}', p.first), {
        owner,
        due: addDays(today(), it.days),
        div: 'hr',
      });
      if (!nt) return;
      nt.obItem = i;
      nt.onboarding = x.id;
      x.tasks.push(nt.id);
      made.push(nt.id);
      if (owner !== m.id) notify(db, owner, 'hr-task', { type: 'task', id: nt.id });
    });
    if (!x.appliedAt) {
      x.appliedAt = nowStamp();
      x.appliedBy = m.id;
    }
    ui.insp = null;
    toast(
      made.length
        ? made.length === 1
          ? t('{n} onboarding task created', { n: 1 })
          : t('{n} onboarding tasks created', { n: made.length })
        : t('Already applied. No new tasks were created.'),
      made.length
        ? ({ db: u }) => {
            for (const id of made) {
              const tk = u.tasks.find((v) => v.id === id);
              if (tk) tk.trashed = true;
            }
            const y = hrDraft(u).onboarding.instances.find((v) => v.id === instanceId);
            if (!y) return;
            y.tasks = y.tasks.filter((id) => !made.includes(id));
            if (!y.tasks.length) {
              y.appliedAt = null;
              y.appliedBy = null;
            }
          }
        : undefined,
    );
  });
};

/** Downloads the roster as CSV: only the fields listed as included, never private data. */
export function exportRoster(div: DivisionId | '') {
  const db = getDb();
  const rows = db.people
    .filter((p) => p.status === 'active' && (!div || p.div === div))
    .map((p) => [
      p.name,
      p.div ? (divisionOf(p.div)?.name ?? '') : 'Organization',
      roleLabel(p),
      'Batch 2026',
      p.joined ?? '',
      'Active',
    ]);
  const csv = [EXPORT_IN, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `dwdg-roster-${today()}.csv`;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 1000);
  void act(({ db: w }) => {
    logChange(w, 'hr', 'exported the roster', { type: 'link', id: 'roster', name: t('Roster'), h: 'hr-people' });
  }).then(() => {
    showToast(t('Roster exported'));
  });
}
