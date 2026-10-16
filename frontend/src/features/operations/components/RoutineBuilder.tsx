/* The routine builder: one page, written as plain sentences, with a live preview of the next runs. Directors and co-directors set up
   routines for a division; anyone can make a task of their own repeat. From screens/work.js opsBuilder, obPreview. */
import { useLayoutEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import type { MenuRef } from '@/app/ui-state';
import { Avatar, roleLabel } from '@/components/shared/Avatar';
import { MENUS, MenuItem, closeMenu, openMenu } from '@/components/shared/menus';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { Button, IconButton } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { inputClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, Page } from '@/components/ui/page';
import { canCreateProject, rank } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t, WD, WDL } from '@/lib/i18n';
import { addDays, dLong, dShort, today, weekday, weekStart } from '@/lib/time';
import { useMe, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { jointIn } from '@/features/projects/services/access';
import { ENDED } from '@/features/projects/services/project-rules';
import { unitLeads } from '@/features/work/services/selectors';
import type { Routine } from '@/types/workspace';
import { canEditRt } from '../services/access';
import { occDates, ownerFor } from '../services/routines';
import { rtSentence, saveRoutine, type RoutineDraft } from '../services/routine-actions';

const DUE_OPTS: [number, string][] = [
  [0, 'Same day'],
  [1, '1 day later'],
  [2, '2 days later'],
  [3, '3 days later'],
  [7, 'A week later'],
];

const sec = 'grid justify-items-start gap-3.5 border-t border-line py-[22px]';
const secH = 'm-0 text-[15px] font-[650]';
const small = 'm-0 text-mute type-small';

const useDraft = (id: string | null, sub?: string) => {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const ws = useWs();
  const key = id ? `edit:${id}` : `new:${sub ?? ''}`;
  const draft = useUi((u) => u.rtDraft as RoutineDraft | null | undefined);
  useLayoutEffect(() => {
    if (!me || draft?.key === key) return;
    const r = id ? db.routines?.find((x) => x.id === id) : undefined;
    const personal = r ? r.personal : sub === 'personal';
    const next: RoutineDraft = r
      ? {
          key,
          id,
          name: r.name,
          icon: r.icon ?? null,
          personal: r.personal,
          unit: r.unit,
          cadence: r.cadence,
          every: r.every,
          start: r.start,
          dueOffset: r.dueOffset,
          owners: [...r.owners],
          rotate: r.rotate,
          checklist: r.checklist.map((s) => (typeof s === 'string' ? s : (s as { text: string }).text)),
          project: r.project,
          signoff: !r.personal && r.signoff !== false,
          signer: r.signer ?? r.createdBy,
        }
      : {
          key,
          id: null,
          name: '',
          icon: null,
          personal,
          unit: personal ? null : ws,
          cadence: 'weekly',
          every: 7,
          start: addDays(today(), 1),
          dueOffset: personal ? 0 : 2,
          owners: [me.id],
          rotate: !personal,
          checklist: [],
          project: null,
          signoff: !personal,
          signer: rank(me) >= 2 ? me.id : (unitLeads(db, ws)[0] ?? null),
        };
    setUi((u) => {
      u.rtDraft = next;
    });
  }, [key, me, draft?.key]);
  return draft?.key === key ? draft : null;
};

const update = (fn: (x: RoutineDraft) => void) => {
  setUi((u) => {
    const x = u.rtDraft as RoutineDraft | null | undefined;
    if (x) fn(x);
  });
};

function Seg({
  opts,
  cur,
  onPick,
}: {
  opts: [string | number, string][];
  cur: string | number;
  onPick: (k: string) => void;
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-[10px] bg-fill p-[3px]" role="radiogroup">
      {opts.map(([k, l]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={String(cur) === String(k)}
          className={cn(
            'h-7 rounded-[7px] border-0 bg-transparent px-3 text-d13 font-[550] text-mute roomy:h-8',
            String(cur) === String(k) && 'bg-surface text-ink shadow-sheet',
          )}
          onClick={() => {
            onPick(String(k));
          }}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}

function Preview({ x }: { x: RoutineDraft }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const from = x.id ? (today() >= x.start ? addDays(today(), 1) : x.start) : x.start;
  const r = x as unknown as Pick<
    Routine,
    | 'cadence'
    | 'every'
    | 'start'
    | 'dueOffset'
    | 'personal'
    | 'owners'
    | 'rotate'
    | 'signoff'
    | 'signer'
    | 'createdBy'
    | 'skips'
  >;
  const ds = x.start
    ? occDates({ cadence: x.cadence, every: x.every, start: x.start }, addDays(from, 400))
        .map((d, i) => [d, i] as const)
        .filter(([d]) => d >= from)
        .slice(0, 6)
    : [];
  const first = (id: string) => db.people.find((p) => p.id === id)?.first ?? '';
  return (
    <aside className="sticky top-4 grid gap-3.5 rounded-[18px] bg-surface-2 p-5 shadow-[inset_0_0_0_1px_var(--line)] max-[1000px]:static">
      <h3 className="m-0 text-d12h font-semibold text-mute">{t('How it will run')}</h3>
      <p className="m-0 text-[15.5px] leading-[1.55] text-ink">
        {rtSentence(db, { ...r, createdBy: me?.id ?? '', skips: [] } as never)}
      </p>
      <div className="grid">
        {ds.map(([d, i]) => {
          const ow = x.personal ? me?.id : x.owners.length ? ownerFor({ ...r, skips: [] }, i, d) : null;
          return (
            <div key={d} className="flex items-center gap-2.5 border-t border-line py-[9px] text-d13">
              <span className="w-[92px] flex-none font-semibold">{dLong(d)}</span>
              {ow ? (
                <>
                  <Avatar id={ow} size="xs" />
                  <span>{ow === me?.id ? t('You') : first(ow)}</span>
                </>
              ) : (
                <span className="text-mute">{t('Nobody yet')}</span>
              )}
              <small className="ml-auto text-d11h text-mute type-num">
                {t('due {d}', { d: dShort(addDays(d, x.dueOffset || 0)) })}
              </small>
            </div>
          );
        })}
        {!ds.length && <p className={small}>{t('Choose when it starts.')}</p>}
      </div>
      <p className={small}>
        {x.id
          ? t('Runs already done or started stay as they are. The rest follow the new plan.')
          : t('Each run becomes its own task in that person’s My Work, three weeks ahead.')}
      </p>
    </aside>
  );
}

const Row = ({ children, label }: { children: ReactNode; label?: string }) => (
  <div className="flex flex-wrap items-center gap-3 text-[14px]">
    {label && <span className="min-w-16 text-ink-2">{label}</span>}
    {children}
  </div>
);

function Builder({ x }: { x: RoutineDraft }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const wd = weekday(x.start || today());
  const pool = x.personal
    ? []
    : db.people
        .filter((p) => p.status === 'active' && p.div === x.unit && !x.owners.includes(p.id))
        .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  const projs = x.personal
    ? []
    : db.projects.filter((p) => (p.div === x.unit || (!!x.unit && jointIn(db, p, x.unit))) && !ENDED.includes(p.stage));
  const rot = x.owners.length > 1 && x.rotate;
  const name = (id: string) => db.people.find((p) => p.id === id)?.name ?? '';
  const leads = x.unit ? unitLeads(db, x.unit) : [];
  const save = () => {
    if (!me) return;
    if (!x.name.trim()) {
      flash('ob-name', t('Give it a name.'));
      return;
    }
    if (!x.start) {
      flash('ob-start', t('Choose the first run.'));
      return;
    }
    if (!x.id && x.start < today()) {
      flash('ob-start', t('The first run can’t be in the past.'));
      return;
    }
    if (!x.personal && !x.owners.length) {
      flash('ob-who', t('Choose at least one person.'));
      return;
    }
    void saveRoutine(x).then((id) => {
      if (id) go(`operations/${id}`);
    });
  };
  const flash = (field: string, msg: string) => {
    setUi((u) => {
      u.rtErr = { field, msg };
    });
  };
  const err = useUi((u) => u.rtErr as { field: string; msg: string } | null | undefined);
  const bad = (f: string) => err?.field === f;
  return (
    <div className="grid max-w-[1060px] grid-cols-[minmax(0,1fr)_330px] items-start gap-10 max-[1000px]:grid-cols-1">
      <div>
        <p className="m-0 text-d12h font-semibold text-mute">
          {x.id
            ? t('Edit routine')
            : x.personal
              ? t('New repeating task')
              : t('New routine for {d}', { d: divisionOf(x.unit)?.name ?? '' })}
        </p>
        <div className="my-2 mb-[18px] flex items-center gap-4">
          <button
            type="button"
            className="group/ic relative grid size-[60px] flex-none cursor-pointer place-items-center rounded-[18px] border-0 bg-fill p-0 text-ink-2 hover:bg-hover max-[760px]:size-[52px] max-[760px]:rounded-2xl"
            aria-label={t('Choose an icon')}
            onClick={(e) => {
              openMenu(e.currentTarget, {
                type: 'ticon',
                kind: 'routine',
                id: 'draft',
                more: false,
                width: 308,
                est: 430,
              });
            }}
          >
            {x.icon ? (
              <TaskIcon icon={x.icon} size="md" className="mr-0 size-7" />
            ) : (
              <Icon name="routine" className="size-7" />
            )}
            <i className="absolute -right-1 -bottom-1 grid size-[22px] place-items-center rounded-full bg-surface text-ink-2 opacity-0 shadow-[0_0_0_1px_var(--line-strong)] group-hover/ic:opacity-100">
              <Icon name="edit" size="xs" />
            </i>
          </button>
          <div className="min-w-0 flex-1">
            <input
              id="ob-name"
              className={cn(
                'w-full border-0 border-b-[1.5px] border-line bg-transparent py-1.5 type-title text-ink outline-none placeholder:text-faint focus:border-ink',
                bad('ob-name') && 'border-danger',
              )}
              value={x.name}
              placeholder={x.personal ? t('Name it, like Review my week') : t('Name it, like Weekly content posting')}
              aria-label={t('Name')}
              autoComplete="off"
              onChange={(e) => {
                const v = e.target.value;
                update((d) => {
                  d.name = v;
                });
                setUi((u) => {
                  u.rtErr = null;
                });
              }}
            />
            {bad('ob-name') && <span className="text-d12h text-danger">{err?.msg}</span>}
          </div>
        </div>
        <section className={sec}>
          <h3 className={secH}>{t('When does it come round?')}</h3>
          <Seg
            opts={[
              ['weekly', 'Every week'],
              ['2w', 'Every 2 weeks'],
              ['monthly', 'Every month'],
              ['custom', 'Every few days'],
            ]}
            cur={x.cadence}
            onPick={(k) => {
              update((d) => {
                d.cadence = k;
                d.every =
                  k === 'weekly' ? 7 : k === '2w' ? 14 : k === 'monthly' ? 30 : d.every && d.every < 7 ? d.every : 3;
              });
            }}
          />
          {(x.cadence === 'weekly' || x.cadence === '2w') && (
            <Row label={t('On')}>
              <div className="inline-flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('Day of the week')}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={wd === n}
                    aria-label={WDL()[n % 7]}
                    className={cn(
                      'h-10 w-11 cursor-pointer rounded-xl border-0 bg-fill p-0 text-d13 font-semibold text-ink-2 hover:bg-hover max-[760px]:w-10',
                      wd === n && 'bg-ink text-on-ink hover:bg-ink',
                    )}
                    onClick={() => {
                      update((d) => {
                        const base = d.start && d.start > today() ? d.start : addDays(today(), 1);
                        let s = addDays(weekStart(base), n - 1);
                        if (s < addDays(today(), 1)) s = addDays(s, 7);
                        d.start = s;
                      });
                    }}
                  >
                    {WD()[n % 7]}
                  </button>
                ))}
              </div>
            </Row>
          )}
          {x.cadence === 'custom' && (
            <Row label={t('Every')}>
              <input
                className={cn(inputClass, 'w-[76px]')}
                type="number"
                min={1}
                max={60}
                value={x.every || 7}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                  update((d) => {
                    d.every = v;
                  });
                }}
              />
              <span>{t('days')}</span>
            </Row>
          )}
          <Row label={t('First run')}>
            <div>
              <DateField
                id="ob-start"
                kind="start"
                label={t('First run')}
                value={x.start}
                onChange={(v) => {
                  if (v) {
                    update((d) => {
                      d.start = v;
                    });
                    setUi((u) => {
                      u.rtErr = null;
                    });
                  }
                }}
              />
              {bad('ob-start') && <span className="block text-d12h text-danger">{err?.msg}</span>}
            </div>
            {x.cadence === 'monthly' && <span className={small}>{t('Then the same day each month.')}</span>}
          </Row>
        </section>
        <section className={sec}>
          <h3 className={secH}>{t('When is each run due?')}</h3>
          <Seg
            opts={DUE_OPTS}
            cur={x.dueOffset || 0}
            onPick={(k) => {
              update((d) => {
                d.dueOffset = Number(k);
              });
            }}
          />
        </section>
        {!x.personal && (
          <section className={sec}>
            <h3 className={secH}>{t('Who does it?')}</h3>
            <Seg
              opts={[
                ['1', 'Take turns'],
                ['0', 'Same person every time'],
              ]}
              cur={x.rotate ? '1' : '0'}
              onPick={(k) => {
                update((d) => {
                  d.rotate = k === '1';
                  if (!d.rotate) d.owners = d.owners.slice(0, 1);
                });
              }}
            />
            <div id="ob-who" className="flex flex-wrap items-center gap-2">
              {x.owners.map((pid, i) => (
                <span key={pid} className="contents">
                  {i > 0 && rot && (
                    <span className="inline-grid text-faint">
                      <Icon name="right" size="xs" />
                    </span>
                  )}
                  <span className="inline-flex h-10 items-center gap-2 rounded-full bg-fill pr-1.5 pl-[5px] text-d13h font-[550]">
                    {rot && (
                      <span className="ml-[3px] grid size-[18px] place-items-center rounded-full bg-surface text-d10h text-ink-2 type-num">
                        {i + 1}
                      </span>
                    )}
                    <Avatar id={pid} size="sm" className="size-[30px]" />
                    <span>{name(pid)}</span>
                    {rot && i > 0 && (
                      <IconButton
                        className="size-[26px] rounded-full"
                        aria-label={t('Move earlier')}
                        onClick={() => {
                          update((d) => {
                            const a = d.owners[i - 1];
                            const b = d.owners[i];
                            if (a && b) {
                              d.owners[i - 1] = b;
                              d.owners[i] = a;
                            }
                          });
                        }}
                      >
                        <Icon name="left" size="xs" />
                      </IconButton>
                    )}
                    {x.owners.length > 1 && (
                      <IconButton
                        className="size-[26px] rounded-full"
                        aria-label={t('Remove {name}', { name: name(pid) })}
                        onClick={() => {
                          update((d) => {
                            d.owners.splice(i, 1);
                          });
                        }}
                      >
                        <Icon name="close" size="xs" />
                      </IconButton>
                    )}
                  </span>
                </span>
              ))}
              {(x.rotate || !x.owners.length) && pool.length > 0 ? (
                <AddOwner label={t('Add a person')} />
              ) : !x.rotate && pool.length > 0 ? (
                <AddOwner label={t('Change')} plain />
              ) : null}
            </div>
            {bad('ob-who') && <span className="text-d12h text-danger">{err?.msg}</span>}
            <p className={small}>
              {rot
                ? t('Each run goes to the next person in this order, then it starts again.')
                : t('Every run goes to the same person.')}
            </p>
          </section>
        )}
        {!x.personal && (
          <section className={sec}>
            <h3 className={secH}>{t('Who checks each run is done?')}</h3>
            <Seg
              opts={[
                ['1', 'A leader signs off'],
                ['0', 'Nobody, it counts when ticked'],
              ]}
              cur={x.signoff ? '1' : '0'}
              onPick={(k) => {
                update((d) => {
                  d.signoff = k === '1';
                });
              }}
            />
            {!x.signoff ? (
              <p className={small}>{t('A run counts as done as soon as the person ticks it.')}</p>
            ) : (
              <>
                <Row label={t('Signs off')}>
                  <SelectField
                    id="ob-signer"
                    className="max-w-[420px]"
                    value={x.signer ?? me?.id ?? ''}
                    people
                    onChange={(v) => {
                      update((d) => {
                        d.signer = v;
                      });
                    }}
                    options={leads.map((id) => ({ value: id, label: name(id) }))}
                  />
                </Row>
                <p className={small}>
                  {t(
                    'The person whose turn it is finishes the run; it counts as done once this leader signs it off. When it is the leader’s own turn, the next leader signs instead. Nobody signs off their own run.',
                  )}
                </p>
              </>
            )}
          </section>
        )}
        <section className={sec}>
          <h3 className={secH}>
            {t('Steps for each run')} <small className="ml-1.5 text-d12h font-[450] text-mute">{t('Optional')}</small>
          </h3>
          <div className="grid w-full max-w-[560px] gap-2">
            {x.checklist.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="grid size-6 flex-none place-items-center rounded-full bg-fill text-d11h text-ink-2 type-num">
                  {i + 1}
                </span>
                <input
                  className={cn(inputClass, 'min-w-0 flex-1')}
                  data-step={i}
                  value={s}
                  placeholder={t('Describe the step')}
                  autoFocus={s === '' && i === x.checklist.length - 1}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => {
                      d.checklist[i] = v;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      update((d) => {
                        d.checklist.splice(i + 1, 0, '');
                      });
                    } else if (e.key === 'Backspace' && !s) {
                      e.preventDefault();
                      update((d) => {
                        d.checklist.splice(i, 1);
                      });
                    }
                  }}
                />
                <IconButton
                  aria-label={t('Remove step')}
                  onClick={() => {
                    update((d) => {
                      d.checklist.splice(i, 1);
                    });
                  }}
                >
                  <Icon name="close" size="sm" />
                </IconButton>
              </div>
            ))}
            <button
              type="button"
              className="inline-flex h-[34px] cursor-pointer items-center gap-1.5 justify-self-start rounded-[10px] border-0 bg-transparent pr-4 pl-3 text-d13h font-[550] text-ink-2 shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:text-ink hover:shadow-[inset_0_0_0_1.5px_var(--ink-2)]"
              onClick={() => {
                update((d) => {
                  d.checklist.push('');
                });
              }}
            >
              <Icon name="plus" size="sm" />
              {t('Add a step')}
            </button>
          </div>
          <p className={small}>{t('Every run gets its own copy of these steps to tick off.')}</p>
        </section>
        {projs.length > 0 && (
          <section className={sec}>
            <h3 className={secH}>
              {t('Does it serve a project?')}{' '}
              <small className="ml-1.5 text-d12h font-[450] text-mute">{t('Optional')}</small>
            </h3>
            <SelectField
              id="ob-proj"
              className="max-w-[420px]"
              value={x.project ?? ''}
              onChange={(v) => {
                update((d) => {
                  d.project = v || null;
                });
              }}
              options={[
                { value: '', label: t('No, it stands on its own') },
                ...projs.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            <p className={small}>
              {t(
                'Most routines stand on their own. Link one only when it serves a project, like weekly posts for a campaign.',
              )}
            </p>
          </section>
        )}
        <div className="flex gap-2 border-t border-line pt-[22px]">
          <Button variant="primary" onClick={save}>
            {x.id ? t('Save for future runs') : x.personal ? t('Make it repeat') : t('Create routine')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setUi((u) => {
                u.rtDraft = null;
              });
              go(x.id ? `operations/${x.id}` : 'operations');
            }}
          >
            {t('Cancel')}
          </Button>
        </div>
      </div>
      <Preview x={x} />
    </div>
  );
}

function AddOwner({ label, plain = false }: { label: string; plain?: boolean }) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent pr-4 pl-3 text-d13h font-[550] text-ink-2 shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:text-ink hover:shadow-[inset_0_0_0_1.5px_var(--ink-2)]"
      onClick={(e) => {
        openMenu(e.currentTarget, { type: 'obpick' });
      }}
    >
      {!plain && <Icon name="plus" size="sm" />}
      {label}
    </button>
  );
}

function OwnerPick(_props: { menu: MenuRef }) {
  const db = useWorkspace((w) => w);
  const x = useUi((u) => u.rtDraft as RoutineDraft | null | undefined);
  if (!x) return null;
  const pool = db.people
    .filter((p) => p.status === 'active' && p.div === x.unit && !x.owners.includes(p.id))
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  if (!pool.length)
    return <div className="px-2.5 py-3.5 text-d13h text-mute">{t('Everyone in the division is already in.')}</div>;
  return (
    <>
      {pool.map((p) => (
        <MenuItem
          key={p.id}
          icon={<Avatar id={p.id} size="xs" />}
          extra={<small className="text-mute">{roleLabel(p)}</small>}
          onSelect={() => {
            closeMenu();
            update((d) => {
              if (d.rotate) d.owners.push(p.id);
              else d.owners = [p.id];
            });
          }}
        >
          {p.name}
        </MenuItem>
      ))}
    </>
  );
}
MENUS.obpick = OwnerPick;

export function RoutineBuilder({ id, sub }: { id: string | null; sub?: string | undefined }) {
  const me = useMe();
  const ws = useWs();
  const db = useWorkspace((w) => w);
  const r0 = id ? db.routines?.find((x) => x.id === id) : undefined;
  const x = useDraft(id, sub);
  if (!me) return null;
  const back = (
    <Link
      to="/operations"
      className="mt-3 inline-flex h-[var(--ctl-h)] items-center rounded-ctl bg-surface px-3 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover"
    >
      {t('Back to Operations')}
    </Link>
  );
  if (id && (!r0 || !canEditRt(me, r0)))
    return (
      <Page>
        <Empty title={t('You can’t edit this routine')}>
          {t('Co-directors and above edit their division’s routines.')}
          {back}
        </Empty>
      </Page>
    );
  if (!id && sub !== 'personal' && !canCreateProject(me, ws))
    return (
      <Page>
        <Empty title={t('Routines for a division are set up by co-directors and above')}>
          {t('You can still make a task of your own repeat.')}
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => {
              go('operations/new/personal');
            }}
          >
            {t('New repeating task')}
          </Button>
        </Empty>
      </Page>
    );
  if (!x) return null;
  return (
    <Page wide data-page="operation-builder">
      <Builder x={x} />
    </Page>
  );
}
