/* One operation's page: its rhythm, this run, what is coming up, its history, who does it and the steps for each run.
   From screens/work.js opsDetail. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import { Avatar } from '@/components/shared/Avatar';
import { RoutineObject } from '@/components/shared/art/objects';
import { openMenu } from '@/components/shared/menus';
import { Button, IconButton } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { Empty, Page } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t, WD } from '@/lib/i18n';
import { D, addDays, dLong, dShort, today, weekStart } from '@/lib/time';
import { openTask } from '@/lib/open';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { ArtEdit } from '@/features/looks/components/Looks';
import { PeopleBlock } from '@/features/collaboration/components/PeopleBlock';
import { PinButton } from '@/features/pins/components/PinButton';
import { ProgramChip } from '@/features/programs/components/ProgramChip';
import { canEditTask, isDone } from '@/features/work/services/selectors';
import { canSignOff, signerFor } from '@/features/work/services/signoff';
import { setStatus } from '@/features/work/services/task-actions';
import type { Routine, Task } from '@/types/workspace';
import { canEditRt, canSeeRt } from '../services/access';
import { openAsks, rtBeats, type Beat } from '../services/routines';
import { decideRunAsk, skipRun, toggleStep, askLine } from '../services/run-actions';
import { moveRun, pauseRoutine, rtSentence, unskipRun } from '../services/routine-actions';
import { RunWord, Rhythm } from './Rhythm';

const h2 =
  'mt-[30px] mb-3.5 flex items-center gap-2 border-t border-line pt-[22px] text-[15px] type-h3 comfortable:mx-1.5';

export function DoneButton({ task }: { task: Task }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const sg = signerFor(db, task);
  const sgFirst = db.people.find((p) => p.id === (task.reviewer ?? sg))?.first ?? '';
  if (task.status === 'review')
    return canSignOff(db, me, task) ? (
      <>
        <Button
          variant="primary"
          onClick={() => {
            void setStatus(task.id, 'done');
          }}
        >
          <Icon name="check" />
          {t('Sign off')}
        </Button>
        <Button
          onClick={() => {
            openTask(task.id);
          }}
        >
          {t('Ask for changes')}
        </Button>
      </>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-d13 text-ink-2">
        <Icon name="clock" size="xs" />
        {t('Waiting for {who} to sign off.', { who: sgFirst })}
      </span>
    );
  if (!canEditTask(db, me, task) && !canSignOff(db, me, task)) return null;
  return (
    <Button
      variant="primary"
      onClick={() => {
        void setStatus(task.id, 'done');
      }}
    >
      <Icon name="check" />
      {sg && !canSignOff(db, me, task)
        ? t('Done, send to {who}', { who: db.people.find((p) => p.id === sg)?.first ?? '' })
        : t('Mark done')}
    </Button>
  );
}

function MoveForm({ id, from, className }: { id: string; from: string; className?: string }) {
  const [v, setV] = useState(from);
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-d13', className)}>
      <label htmlFor="op-mv">{t('Move this run to')}</label>
      <DateField id="op-mv" kind="due" label={t('Move this run to')} value={v} onChange={setV} />
      <Button
        small
        variant="primary"
        onClick={() => {
          void moveRun(id, v);
        }}
      >
        {t('Move')}
      </Button>
      <Button
        small
        variant="ghost"
        onClick={() => {
          setUi((u) => {
            u.form = null;
          });
        }}
      >
        {t('Cancel')}
      </Button>
    </div>
  );
}

function RunLine({ b, r, can }: { b: Beat; r: Routine; can: boolean }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const form = useUi((u) => u.form);
  const x = b.t;
  const day = (
    <span className="flex items-baseline gap-1.5 text-d12h text-ink-2 type-num">
      <b className="font-sans font-semibold text-ink">{WD()[D(b.d).getDay()]}</b>
      {dShort(b.d)}
    </span>
  );
  if (x && form === `op-move:${x.id}`)
    return (
      <div className="grid min-h-12 grid-cols-[92px_minmax(0,1fr)] items-center gap-3.5 rounded-[10px] bg-surface-2 px-2 py-1.5 max-[760px]:grid-cols-1">
        {day}
        <MoveForm id={x.id} from={b.d} />
      </div>
    );
  const cl = x?.checklist ?? [];
  const name = (id: string) => db.people.find((p) => p.id === id)?.name ?? '';
  const skipBtn = (occ: string, label: string) => (
    <Button
      small
      variant="ghost"
      onClick={() => {
        void skipRun(r.id, occ);
      }}
    >
      {label}
    </Button>
  );
  return (
    <div
      className={cn(
        'grid min-h-12 grid-cols-[92px_minmax(0,1fr)_auto_128px] items-center gap-3.5 border-t border-line px-2 py-1.5 text-d13h first:border-t-0 max-[760px]:grid-cols-[70px_minmax(0,1fr)_auto]',
        x && 'cursor-pointer hover:rounded-[10px] hover:bg-hover',
      )}
      {...(x
        ? {
            role: 'button',
            tabIndex: 0,
            onClick: () => {
              openTask(x.id);
            },
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' && e.target === e.currentTarget) openTask(x.id);
            },
          }
        : {})}
    >
      {day}
      <span className={cn('flex min-w-0 items-center gap-2', (b.st === 'plan' || b.st === 'skip') && 'text-mute')}>
        {b.owner ? (
          <>
            <Avatar id={b.owner} size="xs" className={cn(b.st === 'plan' && 'opacity-55')} />
            <span className="truncate">{b.owner === me?.id ? t('You') : name(b.owner)}</span>
          </>
        ) : (
          <span className="text-mute">{t('Nobody, skipped')}</span>
        )}
      </span>
      <span className="inline-flex items-center gap-2">
        <RunWord b={b} />
        {cl.length > 0 && x && (b.st === 'now' || b.st === 'miss' || b.st === 'rev') && (
          <small className="text-d11h text-mute type-num">
            {cl.filter((c) => c.done).length}/{cl.length}
          </small>
        )}
      </span>
      <span
        className="inline-flex gap-0.5 justify-self-end max-[760px]:hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {can && b.st === 'skip' && b.d > today() ? (
          <Button
            small
            variant="ghost"
            onClick={() => {
              void unskipRun(r.id, b.d);
            }}
          >
            {t('Restore')}
          </Button>
        ) : can && b.st === 'up' && x ? (
          <>
            <Button
              small
              variant="ghost"
              onClick={() => {
                setUi((u) => {
                  u.form = `op-move:${x.id}`;
                });
              }}
            >
              {t('Move')}
            </Button>
            {skipBtn(x.occ ?? b.d, t('Skip'))}
          </>
        ) : can && b.st === 'plan' ? (
          skipBtn(x?.occ ?? b.d, t('Skip'))
        ) : null}
      </span>
    </div>
  );
}

function Asks({ r, can }: { r: Routine; can: boolean }) {
  const db = useWorkspace((w) => w);
  const asks = openAsks(r);
  if (!asks.length) return null;
  return (
    <div className="mb-4 grid gap-0.5 rounded-2xl bg-surface-2 px-3.5 pt-3.5 pb-2 shadow-[inset_0_0_0_1px_var(--line)]">
      <h3 className="mb-1.5 flex gap-1.5 text-d12h font-[650] text-ink-2">
        {t('Requests')} <span className="text-faint type-num">{asks.length}</span>
      </h3>
      {asks.map((a, i) => (
        <div key={a.id} className={cn('flex items-center gap-3 py-2', i > 0 && 'border-t border-line')}>
          <Avatar id={a.by} size="sm" />
          <div className="grid min-w-0 flex-1">
            <b className="text-d13h font-semibold">{askLine(db.people.find((p) => p.id === a.by)?.first ?? '', a)}</b>
            <small className="text-d12h text-ink-2">{a.reason}</small>
          </div>
          {can && (
            <span className="flex flex-none gap-1.5">
              <Button
                small
                variant="ghost"
                onClick={() => {
                  void decideRunAsk(r.id, a.id, false);
                }}
              >
                {t('Decline')}
              </Button>
              <Button
                small
                variant="primary"
                onClick={() => {
                  void decideRunAsk(r.id, a.id, true);
                }}
              >
                {t('Approve')}
              </Button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function OperationDetail({ id }: { id: string }) {
  const me = useMe();
  const db = useWorkspace((x) => x);
  const form = useUi((u) => u.form);
  const r = db.routines?.find((x) => x.id === id);
  if (!me) return null;
  if (!r || !canSeeRt(db, me, r))
    return (
      <Page>
        <Empty title={t('This routine isn’t available')}>
          {t('It may have been deleted, or it belongs to a division you can’t see.')}
          <Link
            to="/operations"
            className="mt-3 inline-flex h-[var(--ctl-h)] items-center rounded-ctl bg-surface px-3 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover"
          >
            {t('Back to Operations')}
          </Link>
        </Empty>
      </Page>
    );
  const can = canEditRt(me, r);
  const all = rtBeats(db, r, '2000-01-01', addDays(today(), 120));
  const open = all.filter((b) => b.t && !isDone(b.t));
  const cur = open.find((b) => b.d <= today()) ?? null;
  const coming = all.filter((b) => b !== cur && b.d > today()).slice(0, 6);
  const past = all
    .filter((b) => b !== cur && b.d <= today() && b.st !== 'plan')
    .reverse()
    .slice(0, 12);
  const nextB = all.find((b) => b.d > today() && b.st !== 'skip');
  const curT = cur?.t;
  const canStep = !!curT && canEditTask(db, me, curT);
  const cl = curT?.checklist ?? [];
  const first = (pid: string) => db.people.find((p) => p.id === pid)?.first ?? '';
  const name = (pid: string) => db.people.find((p) => p.id === pid)?.name ?? '';
  const nextOwner = nextB?.owner ?? null;
  const made = r.at.slice(0, 10);
  const project = r.project ? db.projects.find((p) => p.id === r.project) : undefined;
  const div = r.unit ? divisionOf(r.unit) : undefined;
  return (
    <Page wide data-page="operation" canvas={false}>
      <div className="mt-0.5 mb-5 flex items-center gap-4 max-[760px]:flex-wrap" data-art-host="">
        <ArtEdit kind="routine" x={r}>
          <RoutineObject routine={r} size="hero" />
        </ArtEdit>
        <div className="min-w-0">
          <h1 className="m-0 type-title comfortable:tracking-[-0.01em]">{r.name}</h1>
          <p className="mt-1 mb-0 text-[14px] leading-normal text-ink-2">{rtSentence(db, r)}</p>
        </div>
        <div className="ml-auto flex flex-none items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full">
          {r.paused ? (
            <State label={t('Paused')} icon="hand" tone="warn" />
          ) : (
            <State label={t('Running')} icon="activity" tone="green" />
          )}
          <PinButton kind="routine" id={r.id} />
          {can && (
            <>
              <Button
                onClick={() => {
                  go(`operations/${r.id}/edit`);
                }}
              >
                <Icon name="edit" />
                {t('Edit')}
              </Button>
              <Button
                onClick={() => {
                  void pauseRoutine(r.id);
                }}
              >
                <Icon name={r.paused ? 'right' : 'hand'} />
                {r.paused ? t('Resume') : t('Pause')}
              </Button>
              <IconButton
                aria-haspopup="menu"
                aria-label={t('More')}
                onClick={(e) => {
                  openMenu(e.currentTarget, { type: 'opmore', id: r.id });
                }}
              >
                <Icon name="more" />
              </IconButton>
            </>
          )}
        </div>
      </div>
      <div className="mb-[26px] rounded-2xl bg-surface-2 px-4 py-1 shadow-[inset_0_0_0_1px_var(--line)]">
        <Rhythm items={[{ r }]} solo lo={addDays(weekStart(today()), -42)} weeks={14} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-9 max-[1000px]:grid-cols-1">
        <div className="min-w-0">
          <Asks r={r} can={can} />
          {cur && curT ? (
            <div className="grid gap-4 rounded-[18px] bg-surface px-[18px] pt-[18px] pb-4 shadow-[0_0_0_1px_var(--line-strong),0_16px_34px_-26px_rgb(22_22_21/45%)]">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-d12h font-semibold text-mute">{t('This run')}</span>
                <RunWord b={cur} />
              </div>
              <div className="flex items-center gap-3.5">
                <Avatar id={curT.owner} size="lg" className="size-12" />
                <span>
                  <b className="block text-[18px] font-[650] tracking-[-0.01em]">
                    {curT.owner === me.id ? t('Your turn') : name(curT.owner)}
                  </b>
                  <small className="text-d13 text-mute">
                    {dLong(cur.d)}
                    {curT.due !== cur.d ? `, ${t('due {d}', { d: dLong(curT.due ?? '') })}` : ''}
                  </small>
                </span>
              </div>
              {cl.length > 0 && (
                <div className="grid gap-px rounded-xl bg-surface-2 px-1 py-1.5">
                  {cl.map((c, i) => (
                    <label
                      key={i}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-[7px] hover:bg-hover',
                        canStep || 'cursor-default',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-[3px] accent-ink"
                        checked={c.done}
                        disabled={!canStep}
                        onChange={(e) => {
                          void toggleStep(curT.id, i, e.target.checked);
                        }}
                      />
                      <span className={cn(c.done && 'text-mute line-through')}>{c.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {form === `op-move:${curT.id}` && <MoveForm id={curT.id} from={cur.d} />}
              <div className="flex flex-wrap gap-2">
                <DoneButton task={curT} />
                <Button
                  onClick={() => {
                    openTask(curT.id);
                  }}
                >
                  {t('Open the task')}
                </Button>
                {can && cur.st !== 'rev' && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setUi((u) => {
                          u.form = `op-move:${curT.id}`;
                        });
                      }}
                    >
                      {t('Move')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        void skipRun(r.id, curT.occ ?? cur.d);
                      }}
                    >
                      {t('Skip this run')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5 rounded-[18px] bg-surface-2 px-[18px] pt-[18px] pb-4 shadow-[inset_0_0_0_1px_var(--line)]">
              <span className="text-d12h font-semibold text-mute">{t('This run')}</span>
              <p className="m-0 text-[14px] text-ink-2">
                {r.paused
                  ? t('Paused. Nothing new is made until someone resumes it.')
                  : nextB
                    ? t('Nothing open right now. Next run {d}, {who}.', {
                        d: dLong(nextB.d),
                        who:
                          nextB.owner === me.id
                            ? t('your turn')
                            : t('{name}’s turn', { name: first(nextB.owner ?? '') }),
                      })
                    : t('Nothing open right now.')}
              </p>
            </div>
          )}
          <h2 className={h2}>{t('Coming up')}</h2>
          {coming.length ? (
            <div className="grid">
              {coming.map((b) => (
                <RunLine key={`${b.d}-${b.st}`} b={b} r={r} can={can} />
              ))}
            </div>
          ) : (
            <p className="mb-1 text-mute type-small">
              {r.paused ? t('Paused, nothing coming up.') : t('Nothing coming up.')}
            </p>
          )}
          <h2 className={h2}>{t('History')}</h2>
          {past.length ? (
            <div className="grid">
              {past.map((b) => (
                <RunLine key={`${b.d}-${b.st}`} b={b} r={r} can={can} />
              ))}
            </div>
          ) : (
            <p className="mb-1 text-mute type-small">{t('No past runs yet.')}</p>
          )}
        </div>
        <aside className="grid">
          {!r.personal && (
            <section className="pb-[18px]">
              <PeopleBlock
                kind="routine"
                x={r}
                rotation
                flush
                title={r.rotate && r.owners.length > 1 ? t('Takes turns, in this order') : t('Done by')}
              />
              {nextOwner && (
                <p className="mt-2 text-mute type-small">
                  {t('Up next')}: <b>{name(nextOwner)}</b>
                </p>
              )}
            </section>
          )}
          <section className="border-t border-line py-[18px]">
            <h3 className="mb-3 text-d12h font-semibold text-mute">{t('Steps for each run')}</h3>
            {r.checklist.length ? (
              <ol className="m-0 grid list-decimal gap-2 pl-5 text-d13h">
                {r.checklist.map((s, i) => (
                  <li key={i}>{typeof s === 'string' ? s : (s as { text: string }).text}</li>
                ))}
              </ol>
            ) : (
              <p className="m-0 text-mute type-small">{can ? t('No steps. Add them with Edit.') : t('No steps.')}</p>
            )}
          </section>
          <section className="border-t border-line py-[18px]">
            <h3 className="mb-3 text-d12h font-semibold text-mute">{t('About')}</h3>
            <div className="grid gap-2.5 text-d13">
              <div className="flex items-center gap-2.5">
                <span className="w-[82px] flex-none text-mute">{t('Belongs to')}</span>
                {r.personal ? (
                  <span>{t('You only')}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <BrandIcon id={div?.icon ?? ''} label={false} className="size-4" />
                    {div?.name}
                  </span>
                )}
              </div>
              {!r.personal && (
                <div className="flex items-center gap-2.5">
                  <span className="w-[82px] flex-none text-mute">{t('Program')}</span>
                  <ProgramChip kind="routine" x={r} />
                  {!r.program && <span className="text-mute">{t('None')}</span>}
                </div>
              )}
              {project && (
                <div className="flex items-center gap-2.5">
                  <span className="w-[82px] flex-none text-mute">{t('Serves')}</span>
                  <Link to={`/projects/${project.id}`} className="underline underline-offset-[3px]">
                    {project.name}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="w-[82px] flex-none text-mute">{t('Created by')}</span>
                <span>
                  {first(r.createdBy)}, {dShort(made)}
                </span>
              </div>
            </div>
            <p className="mt-3.5 leading-normal text-mute type-small">
              {t(
                'Each run is its own task in that person’s My Work, three weeks ahead. Finishing one never finishes another. Edits change future runs only.',
              )}
            </p>
          </section>
        </aside>
      </div>
    </Page>
  );
}
