/* My Work (D12 landing; work_home, work_my_tasks): today's date, the batch roadmap, quick add, then the tasks in date groups
   beside everything waiting for you. Comfortable puts the page on the canvas with white cards (R009, R016). From screens/work.js. */
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { MONTH, t, WDL } from '@/lib/i18n';
import { look } from '@/lib/session';
import { D, today } from '@/lib/time';
import { cn } from '@/lib/cn';
import { shallow } from '@/lib/store';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { myTasks } from '../services/selectors';
import { TaskGroups, groupTasks } from './MyWorkList';
import { ComfortableRail, CompactRail, useRailData } from './MyWorkRail';
import { QuickAdd } from './QuickAdd';
import { RoadmapShowButton, RoadmapStrip } from './RoadmapStrip';
import { TaskBoard } from './TaskBoard';
import { TaskTimeline } from './TaskTimeline';
import { useView, ViewSwitch } from './ViewSwitch';
import type { Person } from '@/types/workspace';

export const MyWorkCrumb = () => <b>{t('My Work')}</b>;

export function MyWorkPage() {
  const me = useMe();
  if (!me) return null;
  return <MyWork me={me} />;
}

function MyWork({ me }: { me: Person }) {
  const lk = useSession((s) => look(s));
  const view = useView('my');
  const [filter, setFilter] = useState('');
  const mine = useWorkspace((db) => myTasks(db, me.id), shallow);
  const rail = useRailData(me);
  const comfortable = lk === 'comfortable';
  const inCard = comfortable && view === 'list';
  const td = today();
  const shown = filter ? mine.filter((x) => x.title.toLowerCase().includes(filter.toLowerCase())) : mine;
  const rowCount = groupTasks(mine).rows.length;

  return (
    <div
      className={cn(
        '@container/mywork px-[var(--page-x)] pb-12 max-[760px]:pb-10',
        comfortable ? 'pt-2' : 'pt-6 max-[760px]:pt-[18px]',
      )}
      data-page="work"
      {...(comfortable ? { 'data-canvas': '' } : {})}
    >
      <div className={cn('flex flex-wrap items-center justify-between gap-3 gap-y-3', comfortable && 'px-1')}>
        <div>
          <h1 className="type-title comfortable:tracking-[-0.01em]">{t('My Work')}</h1>
          <p className="mt-1 text-d13h text-mute">
            {WDL()[D(td).getDay()]}, {D(td).getDate()} {MONTH()[D(td).getMonth()]}
          </p>
        </div>
        <div className="flex max-w-full flex-[0_1_auto] flex-wrap items-center justify-end gap-2">
          <RoadmapShowButton />
          <ViewSwitch scope="my" />
        </div>
      </div>
      <RoadmapStrip />
      {!inCard && <QuickAdd inCard={false} />}
      {view === 'list' ? (
        comfortable ? (
          <div className="mt-[18px] grid grid-cols-[minmax(0,1fr)] gap-[22px] @min-[944px]/mywork:items-start @min-[944px]/mywork:has-[>[data-rail]]:grid-cols-[minmax(0,1fr)_340px]">
            {(rail.responses.length > 0 || rail.meetings.length > 0 || rail.waiting.length > 0) && (
              <div data-rail className="@min-[944px]/mywork:col-start-2 @min-[944px]/mywork:row-start-1">
                <ComfortableRail data={rail} />
              </div>
            )}
            <section className="@container/cs-tasks min-w-0 @min-[944px]/mywork:col-start-1 @min-[944px]/mywork:row-start-1">
              <h3 className="mx-1.5 mt-0 mb-2 flex items-baseline gap-2 font-sans text-[15px] leading-5 font-semibold text-ink-2">
                {t('Tasks')}
                <span className="font-medium text-mute">{rowCount}</span>
              </h3>
              <div className="overflow-hidden rounded-card bg-surface shadow-card">
                <QuickAdd inCard />
                <div className="pb-2">
                  <TaskGroups mine={mine} />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_290px] items-start gap-8 @max-[880px]/mywork:grid-cols-[minmax(0,1fr)] @max-[880px]/mywork:gap-1.5">
            <div className="grid min-w-0">
              <TaskGroups mine={mine} />
            </div>
            <CompactRail data={rail} />
          </div>
        )
      ) : (
        <>
          {comfortable ? (
            <ComfortableRail data={rail} top />
          ) : (
            <div className="my-3">
              <CompactRail data={rail} only />
            </div>
          )}
          <div className="mt-4 mb-2.5 flex flex-wrap items-center gap-2">
            <label className="flex h-[var(--ctl-h)] w-[260px] items-center gap-2 rounded-ctl bg-fill px-2.5 text-d13 text-mute [&_.ic]:size-4">
              <Icon name="search" size="sm" />
              <input
                className="w-full border-0 bg-transparent font-[inherit] text-ink outline-none"
                placeholder={t('Filter my tasks')}
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
              />
            </label>
          </div>
          {view === 'board' ? <TaskBoard tasks={shown} /> : <TaskTimeline tasks={shown} mine />}
        </>
      )}
    </div>
  );
}
