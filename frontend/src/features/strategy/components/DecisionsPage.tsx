/* Research & decisions: the decision queue, the sources across initiatives, the outcome reviews, one decision packet with its
   options and the designated reviewer's decision, and the packet builder. From divisions/div-hr-sng.js decisionsPage,
   packetPage and packetBuilder. */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { PersonLink } from '@/components/shared/PersonLink';
import {
  Chip,
  DivCrumb,
  Hint,
  Locked,
  td,
  th,
  tblClass,
  tblScroll,
  trLink,
  Tag,
} from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { rank } from '@/lib/access';
import { useWho } from '@/lib/people';
import { dShort, fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import { PacketVersions } from './PacketVersions';
import {
  DEPS,
  OUTC,
  PKT,
  initiativeOf,
  latestPacket,
  packetOf,
  packetsOf,
  sngOf,
  type PacketChoice,
  type PacketOption,
} from '../services/sng-data';
import {
  canEditInitiative,
  canSeeSource,
  canSng,
  decidePacket,
  defaultReviewer,
  submitPacket,
} from '../services/strategy';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function DecisionsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  if (route.id === 'new')
    return (
      <DivCrumb
        d="sng"
        parts={[
          ['decisions', t('Research & decisions')],
          ['', t('New packet')],
        ]}
      />
    );
  const p = route.id ? packetOf(db, route.id) : undefined;
  if (p)
    return (
      <DivCrumb
        d="sng"
        parts={[
          ['decisions', t('Research & decisions')],
          ['', `v${p.version}`],
        ]}
      />
    );
  return <DivCrumb d="sng" parts={[['decisions', t('Research & decisions')]]} />;
}

type Tab = 'queue' | 'research' | 'reviews';
const TABS: [Tab, string][] = [
  ['queue', 'Decision queue'],
  ['research', 'Research'],
  ['reviews', 'Outcome reviews'],
];

function DecisionsList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const who = useWho();
  const tab = useUi<Tab>((u) => (u.sngTab === 'research' || u.sngTab === 'reviews' ? u.sngTab : 'queue'));
  useDivisionWorkspace('sng');
  if (!m || !canSng(m)) return <Unavailable />;
  const s = sngOf(db);
  const mineQ = s.packets.filter((p) => p.state === 'pending' && p.reviewer === m.id);
  const go = (to: string) => () => {
    void navigate(to);
  };
  const key = (to: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void navigate(to);
  };
  const srcs = s.initiatives.flatMap((i) => i.sources.map((x) => ({ x, i })));
  const appr = s.initiatives.filter((i) => i.stage === 'approved');
  return (
    <Page wide>
      <PageHeader
        title={t('Research & decisions')}
        sub={t('Decision packets, the sources behind them and the outcome reviews that follow.')}
      />
      <div className="mt-[18px] mb-1.5 flex gap-6 shadow-[inset_0_-1px_0_var(--line)]" role="tablist">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={cn(
              'relative inline-flex h-10 flex-none cursor-pointer items-center border-0 bg-transparent p-0 font-[550] whitespace-nowrap text-mute',
              tab === k &&
                "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-[2px] after:bg-ink after:content-['']",
            )}
            onClick={() => {
              setUi((u) => {
                u.sngTab = k;
              });
            }}
          >
            {t(l)}
          </button>
        ))}
      </div>
      {tab === 'queue' && (
        <>
          {mineQ.length > 0 && (
            <>
              <SectionHeading as="h2" count={mineQ.length}>
                {t('Waiting for your decision')}
              </SectionHeading>
              <Rows>
                {mineQ.map((p) => (
                  <Row key={p.id} className="gap-2.5" onOpen={go(`/decisions/${p.id}`)}>
                    <Avatar id={p.submittedBy} />
                    <RowText
                      title={<b>{p.question}</b>}
                      sub={t('Version {v} from {who}', { v: p.version, who: who.first(p.submittedBy) })}
                    />
                    <Chip def={PKT.pending} pill="pill-o" />
                  </Row>
                ))}
              </Rows>
            </>
          )}
          <SectionHeading as="h2" count={s.packets.length}>
            {t('All decision packets')}
          </SectionHeading>
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Question')}</th>
                  <th className={th}>{t('Version')}</th>
                  <th className={th}>{t('Reviewer')}</th>
                  <th className={th}>{t('Submitted')}</th>
                  <th className={th}>{t('State')}</th>
                </tr>
              </thead>
              <tbody>
                {[...s.packets]
                  .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
                  .map((p) => (
                    <tr
                      key={p.id}
                      className={trLink}
                      tabIndex={0}
                      role="link"
                      onClick={go(`/decisions/${p.id}`)}
                      onKeyDown={key(`/decisions/${p.id}`)}
                    >
                      <td className={td}>
                        <b>{p.question}</b>
                        <small className="mt-0.5 block text-d13 font-normal text-mute">
                          {initiativeOf(db, p.initiative)?.title ?? ''}
                        </small>
                      </td>
                      <td className={cn(td, 'type-num')}>v{p.version}</td>
                      <td className={td}>
                        <PersonLink id={p.reviewer} />
                      </td>
                      <td className={cn(td, 'type-num')}>{dShort(p.submittedAt.slice(0, 10))}</td>
                      <td className={td}>
                        <Chip def={PKT[p.state]} pill="pill-o" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === 'research' && (
        <>
          <SectionHeading as="h2" count={srcs.length}>
            {t('Sources across initiatives')}
          </SectionHeading>
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Source')}</th>
                  <th className={th}>{t('Initiative')}</th>
                  <th className={th}>{t('Observed')}</th>
                  <th className={th}>{t('Finding')}</th>
                  <th className={th}>{t('Added by')}</th>
                </tr>
              </thead>
              <tbody>
                {srcs.map(({ x, i }) => (
                  <tr
                    key={x.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go(`/initiatives/${i.id}`)}
                    onKeyDown={key(`/initiatives/${i.id}`)}
                  >
                    <td className={td}>
                      <b>{x.title}</b>
                    </td>
                    <td className={cn(td, 'type-small')}>{i.title}</td>
                    <td className={td}>
                      {x.observed ? (
                        <span className="type-num">{dShort(x.observed)}</span>
                      ) : (
                        <Tag unknown>{t('Date unknown')}</Tag>
                      )}
                    </td>
                    <td className={cn(td, 'max-w-[360px] min-w-[220px] text-d13 whitespace-normal text-ink-2')}>
                      {canSeeSource(m, x) ? x.finding : <Locked>{t('Restricted source')}</Locked>}
                    </td>
                    <td className={td}>
                      <PersonLink id={x.addedBy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Hint>{t('Research notes stay in Resources and link here; there is no second research database.')}</Hint>
        </>
      )}
      {tab === 'reviews' && (
        <>
          <SectionHeading as="h2" count={appr.length}>
            {t('Approved initiatives')}
          </SectionHeading>
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Initiative')}</th>
                  <th className={th}>{t('Delivery project')}</th>
                  <th className={th}>{t('Metric')}</th>
                  <th className={cn(th, 'text-right')}>{t('Observations')}</th>
                  <th className={th}>{t('Review date')}</th>
                  <th className={th}>{t('Outcome')}</th>
                </tr>
              </thead>
              <tbody>
                {appr.map((i) => (
                  <tr
                    key={i.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go(`/initiatives/${i.id}`)}
                    onKeyDown={key(`/initiatives/${i.id}`)}
                  >
                    <td className={td}>
                      <b>{i.title}</b>
                    </td>
                    <td className={td}>
                      {projOf(db, i.project)?.name ?? <Chip def={['Not linked', 'warning', 'warn']} pill="pill-o" />}
                    </td>
                    <td className={cn(td, 'type-small')}>
                      {i.metric?.name ?? <span className="text-mute">{t('No metric')}</span>}
                    </td>
                    <td className={cn(td, 'text-right')}>{i.observations.length}</td>
                    <td className={cn(td, 'type-num')}>
                      {i.reviewDate ? (
                        <>
                          {dShort(i.reviewDate)}
                          {!i.outcome && i.reviewDate < today() && (
                            <>
                              {' '}
                              <Chip def={['Review overdue', 'clock', 'danger']} />
                            </>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={td}>
                      {i.outcome ? (
                        <Chip def={OUTC[i.outcome.state]} pill="pill-o" />
                      ) : (
                        <Chip def={['Not reviewed yet', 'circle', 'mute']} pill="pill-o" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Hint>
            {t(
              'Without a dated source or baseline the outcome stays Inconclusive. No impact or health score is calculated.',
            )}
          </Hint>
        </>
      )}
    </Page>
  );
}

// ---------- one packet ----------
function PacketPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const choice = useUi<PacketChoice>((u) =>
    u.sngChoice === 'hold' || u.sngChoice === 'rejected' ? u.sngChoice : 'approved',
  );
  const [opt, setOpt] = useState<string | null>(null);
  const [why, setWhy] = useState('');
  const [cond, setCond] = useState('');
  const [date, setDate] = useState('');
  const [noDate, setNoDate] = useState(false);
  const [err, setErr] = useState<'why' | 'date' | null>(null);
  useDivisionWorkspace('sng');
  const p = packetOf(db, id);
  if (!m || !p) return <Unavailable />;
  if (!canSng(m) && p.reviewer !== m.id) return <Unavailable />;
  const i = initiativeOf(db, p.initiative);
  if (!i) return <Unavailable />;
  const all = packetsOf(db, i);
  const newer = all.find((x) => x.version > p.version);
  const rev = p.reviewer === m.id && p.state === 'pending' && !newer;
  const optVal = opt ?? String(p.recommend);
  const chosen = p.decision?.option;
  const submit = () => {
    if (!why.trim()) {
      setErr('why');
      return;
    }
    if (choice === 'hold' && !date && !noDate) {
      setErr('date');
      return;
    }
    void decidePacket(p.id, p.version, {
      choice,
      option: choice === 'approved' ? Number(optVal) : null,
      rationale: why.trim(),
      conditions: choice === 'approved' ? cond.trim() : '',
      reviewDate: date || null,
      noDate,
    }).then(() => {
      setUi((u) => {
        u.sngChoice = null;
      });
    });
  };
  const verbs: Record<PacketChoice, string> = {
    approved: 'Approve version {v}',
    hold: 'Hold version {v}',
    rejected: 'Reject version {v}',
  };
  return (
    <Page wide>
      <PageHeader
        title={p.question}
        sub={
          <>
            <Link to={`/initiatives/${i.id}`}>{i.title}</Link>, {t('decision packet v{v}', { v: p.version })}
          </>
        }
      >
        <Chip def={PKT[p.state]} pill="pill" />
      </PageHeader>
      <Meta
        className={cn(
          'mt-4 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap',
          newer || p.decision || p.state === 'pending' ? 'mb-3' : 'mb-1.5',
        )}
      >
        <MetaRow label={t('Designated reviewer')}>
          <PersonLink id={p.reviewer} />
        </MetaRow>
        <MetaRow label={t('Submitted by')}>{who.stamp(p.submittedBy, p.submittedAt)}</MetaRow>
        <MetaRow label={t('Initiative owner')}>
          <PersonLink id={i.owner} />
        </MetaRow>
        <MetaRow label={t('Affected units')}>
          {i.affected.length ? i.affected.map((u) => divisionOf(u)?.short).join(', ') : t('SnG only')}
        </MetaRow>
      </Meta>
      {newer && (
        <Notice
          icon="archive"
          tone="warn"
          title={<b>{t('Version {v} replaced this packet', { v: newer.version })}</b>}
          actions={
            <Link className={buttonClass('default', true, 'no-underline')} to={`/decisions/${newer.id}`}>
              {t('Open version {v}', { v: newer.version })}
            </Link>
          }
        >
          <p>{t('A decision on this version would be stale, so it cannot be recorded here. Nothing was changed.')}</p>
        </Notice>
      )}
      {p.decision && (
        <Notice
          icon={PKT[p.decision.choice][1]}
          tone={p.decision.choice === 'approved' ? 'done' : p.decision.choice === 'hold' ? 'info' : 'error'}
          title={
            <b>
              {t('{c} by {who}', { c: t(PKT[p.decision.choice][0]), who: who.stamp(p.decision.by, p.decision.at) })}
            </b>
          }
        >
          <p>
            {p.decision.option != null && `${t('Option: {o}.', { o: p.options[p.decision.option]?.title ?? '' })} `}
            {p.decision.rationale}
            {p.decision.conditions && ` ${t('Conditions: {c}', { c: p.decision.conditions })}`}{' '}
            {p.decision.reviewDate
              ? t('Review on {d}.', { d: fmtD(p.decision.reviewDate) })
              : p.decision.noDate
                ? t('No review date, set on purpose.')
                : ''}{' '}
            {t('Decided on version {v}.', { v: p.version })}
          </p>
        </Notice>
      )}
      {p.state === 'pending' && !rev && !newer && (
        <Notice icon="clock" title={<b>{t('Waiting for {who}', { who: who.name(p.reviewer) })}</b>}>
          <p>{t('Only the designated reviewer decides. A VP title alone does not grant approval.')}</p>
        </Notice>
      )}
      <SectionHeading as="h2" count={p.options.length}>
        {t('Options')}
      </SectionHeading>
      <div className="my-1 mb-3.5 grid grid-cols-3 gap-2 max-[760px]:grid-cols-1">
        {p.options.map((o, n) => (
          <div
            key={`${o.title}${String(n)}`}
            className={cn(
              'rounded-[10px] bg-surface-2 p-3.5 text-d13',
              n === p.recommend && 'bg-sel',
              chosen === n && 'shadow-[inset_0_0_0_1.5px_var(--ink)]',
            )}
          >
            <b className="mb-2 block text-d14 font-bold">{o.title}</b>
            <div className={cn('-mt-0.5 mb-2 flex gap-1.5', n !== p.recommend && chosen !== n && 'hidden')}>
              {n === p.recommend && (
                <span className="inline-flex h-6 items-center rounded-chip bg-green-soft px-2 text-d13 font-semibold text-green-ink">
                  {t('Recommended')}
                </span>
              )}
              {chosen === n && (
                <span className="inline-flex h-6 items-center rounded-chip bg-ink px-2 text-d13 font-semibold text-on-ink">
                  {t('Chosen')}
                </span>
              )}
            </div>
            <dl className="m-0 grid grid-cols-[72px_1fr] gap-x-2 gap-y-1">
              <dt className="text-mute">{t('Benefit')}</dt>
              <dd className="m-0">{o.benefit}</dd>
              <dt className="text-mute">{t('Cost')}</dt>
              <dd className="m-0 type-num">{o.cost}</dd>
              <dt className="text-mute">{t('Risk')}</dt>
              <dd className="m-0">{o.risk}</dd>
              <dt className="text-mute">{t('Unknown')}</dt>
              <dd className="m-0">{o.uncertainty}</dd>
              <dt className="text-mute">{t('Owner')}</dt>
              <dd className="m-0">{who.first(o.owner)}</dd>
            </dl>
          </div>
        ))}
      </div>
      <div className="my-1.5 mb-1 grid gap-3.5">
        {(
          [
            [t('Assumptions'), p.assumptions],
            [t('Open questions'), p.open],
            [t('Success evidence'), p.success],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k}>
            <small className="mb-0.5 block text-mute type-caption">{k}</small>
            <p className="m-0">{v || <span className="text-mute">{t('Not provided')}</span>}</p>
          </div>
        ))}
      </div>
      {i.deps.length > 0 && (
        <>
          <SectionHeading as="h2" count={i.deps.length}>
            {t('Dependencies')}
          </SectionHeading>
          <Rows>
            {i.deps.map((d) => (
              <Row key={d.id} className="cursor-default gap-2.5">
                <Avatar id={d.to} size="sm" />
                <RowText
                  title={<b>{d.action}</b>}
                  sub={`${divisionOf(d.unit)?.short ?? ''}, ${t('needed by {d}', { d: dShort(d.neededBy) })}`}
                />
                <Chip def={DEPS[d.state]} pill="pill-o" />
              </Row>
            ))}
          </Rows>
        </>
      )}
      {rev && (
        <>
          <SectionHeading as="h2">{t('Your decision')}</SectionHeading>
          <Segmented<PacketChoice>
            label={t('Decision')}
            value={choice}
            onChange={(k) => {
              setUi((u) => {
                u.sngChoice = k;
              });
            }}
            options={[
              ['approved', t('Approve')],
              ['hold', t('Hold')],
              ['rejected', t('Reject')],
            ]}
          />
          <div>
            {choice === 'approved' && (
              <Field label={t('Option')} htmlFor="sng-dc-opt" className="mb-0">
                <SelectField
                  id="sng-dc-opt"
                  value={optVal}
                  onChange={setOpt}
                  options={p.options.map((o, n) => ({ value: String(n), label: o.title }))}
                />
              </Field>
            )}
            <Field
              label={t('Rationale')}
              htmlFor="sng-dc-why"
              className="mb-1.5"
              required
              help={err === 'why' ? t('Give the rationale.') : undefined}
              error={err === 'why'}
            >
              <textarea
                id="sng-dc-why"
                className={cn(textareaClass, 'min-h-16', err === 'why' && invalidClass)}
                value={why}
                onChange={(e) => {
                  setWhy(e.target.value);
                  setErr(null);
                }}
              />
            </Field>
            {choice === 'approved' && (
              <Field label={t('Conditions')} htmlFor="sng-dc-cond" optional className="mb-0">
                <input
                  id="sng-dc-cond"
                  className={inputClass}
                  value={cond}
                  onChange={(e) => {
                    setCond(e.target.value);
                  }}
                />
              </Field>
            )}
            <Field
              label={
                <>
                  {t('Review date')}
                  {choice === 'hold' && <span className="text-danger"> *</span>}
                </>
              }
              htmlFor="sng-dc-date"
              className="mb-1.5"
              {...(choice === 'hold' ? {} : { optional: true })}
              help={err === 'date' ? t('Set the next review date or leave it unset on purpose.') : undefined}
              error={err === 'date'}
            >
              <DateField
                id="sng-dc-date"
                value={date}
                onChange={(v) => {
                  setDate(v);
                  setErr(null);
                }}
              />
            </Field>
            {choice === 'hold' && (
              <label className="my-1.5 mb-3 flex cursor-pointer items-center gap-2 text-[length:13.5px]">
                <input
                  type="checkbox"
                  className="m-0 size-4 accent-ink"
                  checked={noDate}
                  onChange={(e) => {
                    setNoDate(e.target.checked);
                    setErr(null);
                  }}
                />
                {t('Leave the review date unset on purpose')}
              </label>
            )}
          </div>
          <Button variant={choice === 'rejected' ? 'danger' : 'primary'} onClick={submit}>
            {t(verbs[choice], { v: p.version })}
          </Button>
          <p className="mt-3 text-mute type-small">
            {t('Approving does not create a project or set a start date. The owner links the delivery project next.')}
          </p>
        </>
      )}
      <SectionHeading as="h2" count={all.length}>
        {t('Versions')}
      </SectionHeading>
      <PacketVersions packets={all} currentId={p.id} />
    </Page>
  );
}

// ---------- the builder ----------
const BLANK = (owner: string): PacketOption => ({ title: '', benefit: '', cost: '', risk: '', uncertainty: '', owner });

function PacketBuilder({ initiative }: { initiative: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const i = initiativeOf(db, initiative);
  const lp = i ? latestPacket(db, i) : undefined;
  const [q, setQ] = useState(lp?.question ?? '');
  const [rows, setRows] = useState<PacketOption[]>(() => {
    const base = lp ? lp.options : [BLANK(i?.owner ?? ''), BLANK(i?.owner ?? '')];
    return [...base, BLANK(i?.owner ?? '')].slice(0, 3);
  });
  const [rec, setRec] = useState(String(lp?.recommend ?? 0));
  const [reviewer, setReviewer] = useState(lp?.reviewer ?? (i ? (defaultReviewer(db, i) ?? '') : ''));
  const [assume, setAssume] = useState(lp?.assumptions ?? '');
  const [open, setOpen] = useState(lp?.open ?? '');
  const [success, setSuccess] = useState(lp?.success ?? '');
  const [err, setErr] = useState<'q' | 'opt' | null>(null);
  useDivisionWorkspace('sng');
  if (!m || !i || !canSng(m) || !canEditInitiative(m, i)) return <Unavailable />;
  const nv = (lp?.version ?? 0) + 1;
  const people = db.people.filter((p) => p.status === 'active');
  const set = (n: number, k: keyof PacketOption, v: string) => {
    setRows(rows.map((r, j) => (j === n ? { ...r, [k]: v } : r)));
    setErr(null);
  };
  const submit = () => {
    if (!q.trim()) {
      setErr('q');
      return;
    }
    const options = rows.filter((r) => r.title.trim());
    if (!options.length) {
      setErr('opt');
      return;
    }
    void submitPacket(i.id, {
      question: q.trim(),
      options,
      recommend: Number(rec),
      assumptions: assume,
      open,
      success,
      reviewer,
    });
  };
  return (
    <Page>
      <PageHeader
        title={t('Decision packet v{v}', { v: nv })}
        sub={<Link to={`/initiatives/${i.id}`}>{i.title}</Link>}
      />
      {lp?.state === 'pending' && (
        <Notice
          icon="archive"
          tone="warn"
          title={<b>{t('Version {v} is still waiting for a decision', { v: lp.version })}</b>}
        >
          <p>{t('Submitting this version replaces it. A decision on the old version can no longer be recorded.')}</p>
        </Notice>
      )}
      <div>
        <Field
          label={t('Question to decide')}
          htmlFor="sng-pk-q"
          className="mb-[25px]"
          required
          help={err === 'q' ? t('Write the question to decide.') : undefined}
          error={err === 'q'}
        >
          <input
            id="sng-pk-q"
            className={cn(inputClass, err === 'q' && invalidClass)}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setErr(null);
            }}
          />
        </Field>
      </div>
      <SectionHeading as="h2">{t('Options')}</SectionHeading>
      {rows.map((o, n) => (
        <div key={n} className="my-2 rounded-[10px] bg-surface-2 p-3.5">
          <b className="mb-2 block">
            {t('Option {n}', { n: n + 1 })}
            {n === 2 && <span className="text-mute type-small"> {t('Optional')}</span>}
          </b>
          <Field
            label={t('Title')}
            htmlFor={`sng-o${n}-t`}
            className="mb-2"
            help={n === 0 && err === 'opt' ? t('Describe at least one option.') : undefined}
            error={n === 0 && err === 'opt'}
          >
            <input
              id={`sng-o${n}-t`}
              className={cn(inputClass, n === 0 && err === 'opt' && invalidClass)}
              value={o.title}
              onChange={(e) => {
                set(n, 'title', e.target.value);
              }}
            />
          </Field>
          <Grid2>
            <Field label={t('Benefit')} htmlFor={`sng-o${n}-b`} className="mb-2">
              <input
                id={`sng-o${n}-b`}
                className={inputClass}
                value={o.benefit}
                onChange={(e) => {
                  set(n, 'benefit', e.target.value);
                }}
              />
            </Field>
            <Field label={t('Cost or resources')} htmlFor={`sng-o${n}-c`} className="mb-2">
              <input
                id={`sng-o${n}-c`}
                className={inputClass}
                value={o.cost}
                onChange={(e) => {
                  set(n, 'cost', e.target.value);
                }}
              />
            </Field>
          </Grid2>
          <Grid2>
            <Field label={t('Risk')} htmlFor={`sng-o${n}-r`} className="mb-2">
              <input
                id={`sng-o${n}-r`}
                className={inputClass}
                value={o.risk}
                onChange={(e) => {
                  set(n, 'risk', e.target.value);
                }}
              />
            </Field>
            <Field label={t('What is unknown')} htmlFor={`sng-o${n}-u`} className="mb-2">
              <input
                id={`sng-o${n}-u`}
                className={inputClass}
                value={o.uncertainty}
                onChange={(e) => {
                  set(n, 'uncertainty', e.target.value);
                }}
              />
            </Field>
          </Grid2>
          <Field label={t('Owner')} htmlFor={`sng-o${n}-o`} className="mb-2">
            <SelectField
              id={`sng-o${n}-o`}
              people
              value={o.owner || i.owner}
              onChange={(v) => {
                set(n, 'owner', v);
              }}
              options={people.map((x) => ({ value: x.id, label: x.name }))}
            />
          </Field>
        </div>
      ))}
      <Grid2>
        <Field label={t('Recommended option')} htmlFor="sng-pk-rec" className="mb-0">
          <SelectField
            id="sng-pk-rec"
            value={rec}
            onChange={setRec}
            options={[0, 1, 2].map((n) => ({ value: String(n), label: t('Option {n}', { n: n + 1 }) }))}
          />
        </Field>
        <Field
          label={t('Designated reviewer')}
          htmlFor="sng-pk-rev"
          className="mb-0"
          help={t(
            'Proposed: SnG Director for SnG-only work, the VP when other units are affected, the President for organization-wide work.',
          )}
        >
          <SelectField
            id="sng-pk-rev"
            people
            value={reviewer}
            onChange={setReviewer}
            options={people.filter((x) => rank(x) >= 3 || x.admin).map((x) => ({ value: x.id, label: x.name }))}
          />
        </Field>
      </Grid2>
      <Field label={t('Assumptions')} htmlFor="sng-pk-a" className="mb-0">
        <textarea
          id="sng-pk-a"
          className={cn(textareaClass, 'min-h-16')}
          value={assume}
          onChange={(e) => {
            setAssume(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Open questions')} htmlFor="sng-pk-o" className="mb-0">
        <textarea
          id="sng-pk-o"
          className={cn(textareaClass, 'min-h-16')}
          value={open}
          onChange={(e) => {
            setOpen(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Success evidence')} htmlFor="sng-pk-s" className="mb-0">
        <textarea
          id="sng-pk-s"
          className={cn(textareaClass, 'min-h-16')}
          placeholder={t('What will be measured, from which source')}
          value={success}
          onChange={(e) => {
            setSuccess(e.target.value);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" onClick={submit}>
          {t('Submit for decision')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            void navigate(`/initiatives/${i.id}`);
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </Page>
  );
}

export function DecisionsPage({ route }: { route: Route }) {
  if (route.id === 'new') return <PacketBuilder initiative={route.sub ?? ''} />;
  if (route.id) return <PacketPage id={route.id} />;
  return <DecisionsList />;
}
