/* My tasks in the Simple look: today's date, one big add field, what is waiting for you, then the tasks in plain groups
   (Overdue, Today, This week, Later, No date). Finished tasks hide behind one button. From screens/simple.js sWork. */
import { useState } from 'react';
import { MONTH, plural, t, WDL } from '@/lib/i18n';
import { D, addDays, today, weekStart } from '@/lib/time';
import { shallow } from '@/lib/store';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { QuickAdd } from '@/features/work/components/QuickAdd';
import { useRailData } from '@/features/work/components/MyWorkRail';
import { isDone, myTasks } from '@/features/work/services/selectors';
import type { Person, Task } from '@/types/workspace';
import { Card, Empty, MoreButton, Page, PageHead, Section, TaskRow, byDue } from './parts';

export function SimpleWork() {
  const me = useMe();
  return me ? <Inner me={me} /> : null;
}

function Inner({ me }: { me: Person }) {
  const [showDone, setShowDone] = useState(false);
  const mine = useWorkspace((db) => myTasks(db, me.id), shallow);
  const rail = useRailData(me);
  const td = today();
  const seen = new Set<string>();
  const rows: Task[] = [];
  mine
    .filter((x) => !isDone(x))
    .sort(byDue)
    .forEach((x) => {
      if (x.routine) {
        if (seen.has(x.routine)) return;
        seen.add(x.routine);
      }
      rows.push(x);
    });
  const we = addDays(weekStart(td), 6);
  const done = mine.filter(isDone).sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''));
  const groups: [string, string, Task[], boolean?][] = [
    ['late', 'Overdue', rows.filter((x) => x.due && x.due < td), true],
    ['today', 'Today', rows.filter((x) => x.due === td)],
    ['week', 'This week', rows.filter((x) => x.due && x.due > td && x.due <= we)],
    ['later', 'Later', rows.filter((x) => x.due && x.due > we)],
    ['nodate', 'No date', rows.filter((x) => !x.due)],
  ];
  return (
    <Page>
      <div className="mx-auto max-w-[720px]">
        <PageHead
          title={t('My tasks')}
          sub={`${WDL()[D(td).getDay()] ?? ''}, ${String(D(td).getDate())} ${MONTH()[D(td).getMonth()] ?? ''}`}
        />
        <Card>
          <QuickAdd inCard />
        </Card>
        {rail.responses.length > 0 && (
          <Section title={t('Waiting for you')} n={rail.responses.length}>
            {rail.responses.map((node, i) => (
              <div key={i}>{node}</div>
            ))}
          </Section>
        )}
        {groups
          .filter((g) => g[2].length)
          .map(([k, l, ts, late]) => (
            <Section key={k} title={t(l)} n={ts.length} {...(late ? { late } : {})}>
              {ts.map((x, i) => (
                <TaskRow key={x.id} task={x} first={i === 0} />
              ))}
            </Section>
          ))}
        {!rows.length && (
          <Empty title={t('You’re all caught up')}>{t('Add a task above when something new comes up.')}</Empty>
        )}
        {done.length > 0 && (
          <>
            <MoreButton
              on={showDone}
              onClick={() => {
                setShowDone(!showDone);
              }}
            >
              {showDone
                ? t('Hide completed tasks')
                : plural(done.length, 'Show {n} completed task', 'Show {n} completed tasks')}
            </MoreButton>
            {showDone && (
              <Section title={t('Completed')} n={done.length}>
                {done.map((x, i) => (
                  <TaskRow key={x.id} task={x} first={i === 0} />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
