/* Several people can be responsible for one task, from any division (owner, round 8; R13). The first is the lead. Someone
   from the task's own division joins at once; someone from another division is asked and shares it after accepting
   (access_delegation). From screens/work.js respSection. */
import { useState, type ReactNode } from 'react';
import { divisionOf } from '@/app/config/org';
import { Avatar, IdentityLine } from '@/components/shared/Avatar';
import { PeoplePicker, usePeoplePicker } from '@/components/shared/PeoplePicker';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { inputClass } from '@/components/ui/forms';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { PersonId, Task } from '@/types/workspace';
import { personOf, taskDiv } from '../../services/selectors';
import { addAssignee, removeAssignee } from '../../services/task-actions';
import { rowClass } from '@/components/ui/page';
import { openPerson } from '@/lib/open';

function PersonRow({ id, label, note, extra }: { id: PersonId; label: ReactNode; note?: string; extra?: ReactNode }) {
  const p = useWorkspace((db) => personOf(db, id));
  if (!p) return null;
  return (
    <div
      className={cn(rowClass(false), 'group/pr')}
      tabIndex={0}
      role="button"
      onClick={() => {
        openPerson(id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openPerson(id);
      }}
    >
      <Avatar id={id} />
      <div className="min-w-0 flex-1 [&_small]:block [&_small]:text-d12h [&_small]:text-mute">
        <b className="block font-[550]">{p.name}</b>
        <small>
          {label}
          {note}
        </small>
      </div>
      <IdentityLine person={p} />
      {extra}
    </div>
  );
}

export function ResponsibleSection({ task, edit }: { task: Task; edit: boolean }) {
  const [adding, setAdding] = useState(false);
  const division = useWorkspace((db) => taskDiv(db, task));
  const people = useWorkspace((db) => db.people);
  const joined = task.assignees.filter((a) => a.state !== 'declined' && people.some((p) => p.id === a.id));
  const picker = usePeoplePicker([task.owner, ...joined.map((a) => a.id)], (id) => {
    void addAssignee(task.id, id);
  });
  const from = (id: PersonId) => {
    const q = people.find((p) => p.id === id);
    return q?.div && q.div !== division ? `, ${divisionOf(q.div)?.short ?? ''}` : '';
  };
  return (
    <>
      <h3 className="mt-4 mb-1.5 flex items-center gap-1.5 type-h3">
        {t('Responsible')} <span className="text-mute type-num">{1 + joined.length}</span>
        {edit && !adding && (
          <Button
            small
            variant="ghost"
            className="-my-1 ml-auto"
            onClick={() => {
              setAdding(true);
            }}
          >
            <Icon name="plus" />
            {t('Add')}
          </Button>
        )}
      </h3>
      {adding && (
        <div className="mb-2.5 grid gap-2">
          <div className="relative">
            <input
              className={inputClass}
              placeholder={t('Find someone in any division')}
              autoComplete="off"
              aria-label={t('Add people')}
              autoFocus
              onFocus={(e) => {
                picker.open(e.target.value.trim());
              }}
              onChange={(e) => {
                picker.open(e.target.value.trim());
              }}
              onKeyDown={(e) => {
                picker.onKeyDown(e);
              }}
            />
            <div className="absolute top-[calc(100%+4px)] left-0 z-[6]">
              <PeoplePicker view={picker.view} />
            </div>
          </div>
          <p className="text-mute type-small">
            {t(
              'People from {d} share it at once. Someone from another division is asked first and shares it after accepting.',
              {
                d: divisionOf(division)?.short ?? '',
              },
            )}
          </p>
          <div>
            <Button
              small
              onClick={() => {
                picker.close();
                setAdding(false);
              }}
            >
              {t('Done')}
            </Button>
          </div>
        </div>
      )}
      <div className="grid">
        <PersonRow id={task.owner} label={t('Lead')} note={from(task.owner)} />
        {joined.map((a) => (
          <PersonRow
            key={a.id}
            id={a.id}
            label={
              a.state === 'invited' ? (
                <span className="font-[550] text-warning">{t('Asked, not answered')}</span>
              ) : (
                t('Responsible')
              )
            }
            note={from(a.id)}
            extra={
              <>
                {edit && (
                  <button
                    type="button"
                    className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute opacity-0 group-hover/pr:opacity-100 hover:bg-hover hover:text-ink focus-visible:opacity-100 touch:opacity-100"
                    aria-label={t('Remove {who}', { who: people.find((p) => p.id === a.id)?.first ?? '' })}
                    onClick={(e) => {
                      e.stopPropagation();
                      void removeAssignee(task.id, a.id);
                    }}
                  >
                    <Icon name="close" size="xs" />
                  </button>
                )}
              </>
            }
          />
        ))}
      </div>
    </>
  );
}
