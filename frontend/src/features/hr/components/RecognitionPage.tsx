/* Recognition: Member of the Month rounds, the publication packet HR hands to MCIT, and the announcements MCIT recorded. The
   decision and the actual announcement are separate steps. From divisions/div-hr-sng.js recognitionPage, roundPage, packetCard. */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { PersonLink } from '@/components/shared/PersonLink';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { rank } from '@/lib/access';
import { useWho } from '@/lib/people';
import { hrLead, isBoard } from '@/lib/roles';
import { addDays, dShort, fmtD, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { cyLabel, cysDef } from '../services/monitoring';
import { hrOf, monthName, type HrPacket, type HrRound } from '../services/hr-data';
import {
  CONSENT,
  PKS,
  acceptPacket,
  addNomination,
  answerConsent,
  canSeeRound,
  coverage,
  createPacket,
  eligibleFor,
  mcitReceiver,
  onPanel,
  openNextRound,
  pkOf,
  rdName,
  rdOf,
  rdsDef,
  recordAnnouncement,
  recordDecision,
  resolveFlag,
  returnPacket,
  sendPacket,
} from '../services/recognition';
import { Chip, DivCrumb, Hint, td, th, tblClass, tblScroll, trLink } from './HrParts';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function RecognitionCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const rd = route.id ? rdOf(db, route.id) : undefined;
  if (rd)
    return (
      <DivCrumb
        d="hr"
        parts={[
          ['recognition', t('Recognition')],
          ['', monthName(rd.month)],
        ]}
      />
    );
  return <DivCrumb d="hr" parts={[['recognition', t('Recognition')]]} />;
}

const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);

type PkForm = 'accept' | 'return' | 'pub' | null;

function PacketCard({ pk, link = false }: { pk: HrPacket; link?: boolean }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [form, setForm] = useState<PkForm>(null);
  const [agreed, setAgreed] = useState(pk.neededBy ?? '');
  const [why, setWhy] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState(today());
  const [err, setErr] = useState<'why' | 'url' | 'date' | null>(null);
  const rd = rdOf(db, pk.round);
  const recv = mcitReceiver(m, pk);
  const lead = hrLead(m);
  const person = db.people.find((p) => p.id === pk.person);
  const order = ['draft', 'requested', pk.state === 'returned' ? 'returned' : 'accepted', 'fulfilled'] as const;
  const idx = order.indexOf(pk.state as (typeof order)[number]);
  const cancel = (
    <Button
      small
      variant="ghost"
      onClick={() => {
        setForm(null);
      }}
    >
      {t('Cancel')}
    </Button>
  );
  const acts =
    pk.state === 'requested' && recv ? (
      <>
        <Button
          small
          variant="primary"
          onClick={() => {
            setForm('accept');
          }}
        >
          {t('Accept')}
        </Button>
        <Button
          small
          onClick={() => {
            setForm('return');
          }}
        >
          {t('Return')}
        </Button>
      </>
    ) : pk.state === 'accepted' && recv ? (
      <Button
        small
        variant="primary"
        onClick={() => {
          setForm('pub');
        }}
      >
        {t('Record the announcement')}
      </Button>
    ) : pk.state === 'draft' && lead ? (
      <Button
        small
        variant="primary"
        disabled={pk.consent.state !== 'given'}
        onClick={() => {
          void sendPacket(pk.id);
        }}
      >
        {t('Send to MCIT')}
      </Button>
    ) : pk.state === 'returned' && lead ? (
      <Button
        small
        variant="primary"
        onClick={() => {
          void sendPacket(pk.id);
        }}
      >
        {t('Send again')}
      </Button>
    ) : null;
  const end = (label: string, id: string, sub: string) => (
    <div className="grid gap-1 rounded-[10px] bg-surface-2 p-3">
      <small className="text-mute">{label}</small>
      <PersonLink id={id} />
      <small className="text-d12h text-mute">{sub}</small>
    </div>
  );
  return (
    <div className="grid max-w-[680px] content-start gap-1 rounded-sheet bg-surface p-4 shadow-sheet">
      <div className="flex flex-wrap items-center gap-2">
        <b>{pk.title}</b>
        <Chip def={PKS[pk.state]} pill="pill" />
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 max-[760px]:grid-cols-1">
        {end(t('From HR'), pk.createdBy, t('Packet v{v}', { v: pk.version }))}
        <span className="grid place-items-center text-mute max-[760px]:rotate-90">
          <Icon name="right" />
        </span>
        {end(
          t('To MCIT'),
          pk.receiver,
          pk.acceptedAt
            ? t('Accepted {d}', { d: dShort(pk.acceptedAt.slice(0, 10)) })
            : pk.requestedAt
              ? t('Requested {d}', { d: dShort(pk.requestedAt.slice(0, 10)) })
              : t('Not sent yet'),
        )}
      </div>
      <div className="mt-2 flex items-start gap-3 rounded-[10px] bg-surface-2 p-3 text-[length:13.5px]">
        {pk.photo && person?.photo && <Avatar id={pk.person} size="xl" className="size-11" />}
        <div>
          <b>{who.name(pk.person)}</b>
          <p className="mt-1 mb-0 text-ink-2">{pk.summary}</p>
        </div>
      </div>
      <Meta className="my-3 grid-cols-[110px_1fr]">
        <MetaRow label={t('Needed by')}>{pk.neededBy ? fmtD(pk.neededBy) : '-'}</MetaRow>
        <MetaRow label={t('Agreed date')}>
          {pk.agreedDate ? fmtD(pk.agreedDate) : <span className="text-mute">{t('Not agreed yet')}</span>}
        </MetaRow>
        <MetaRow label={t('Consent')}>
          <Chip def={CONSENT[pk.consent.state] ?? CONSENT.asked ?? ['', '', 'mute']} pill="pill" />
        </MetaRow>
        <MetaRow label={t('Contains')}>
          {t('Name, photo if approved, and this summary. Never scores, absence reasons or support notes.')}
        </MetaRow>
        {pk.announcement && (
          <MetaRow label={t('Announced')}>
            <a href={pk.announcement.url} target="_blank" rel="noopener noreferrer">
              {fmtD(pk.announcement.date)}
            </a>{' '}
            <small>{t('recorded by {who}', { who: who.first(pk.announcement.by) })}</small>
          </MetaRow>
        )}
        {pk.returnNote && <MetaRow label={t('Returned')}>{pk.returnNote}</MetaRow>}
      </Meta>
      <Steps labels={order.map((s) => t(PKS[s][0]))} current={idx} />
      {acts && <div className="mt-3 flex flex-wrap gap-2">{acts}</div>}
      {form === 'accept' && recv && (
        <SubForm>
          <Field
            label={t('Agreed announcement date')}
            htmlFor="hr-pk-agreed"
            help={t('The requested date is not agreed until you accept.')}
          >
            <DateField id="hr-pk-agreed" value={agreed} onChange={setAgreed} />
          </Field>
          <div className="flex gap-2">
            <Button
              small
              variant="primary"
              onClick={() => {
                void acceptPacket(pk.id, agreed || null).then(() => {
                  setForm(null);
                });
              }}
            >
              {t('Accept request')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      )}
      {form === 'return' && recv && (
        <SubForm>
          <Field
            label={t('What does HR need to do next?')}
            htmlFor="hr-pk-why"
            help={err === 'why' ? t('Name the next action for HR.') : undefined}
            error={err === 'why'}
          >
            <textarea
              id="hr-pk-why"
              className={cn(textareaClass, 'min-h-16', err === 'why' && invalidClass)}
              value={why}
              autoFocus
              onChange={(e) => {
                setWhy(e.target.value);
                setErr(null);
              }}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              small
              variant="primary"
              onClick={() => {
                if (!why.trim()) {
                  setErr('why');
                  return;
                }
                void returnPacket(pk.id, why.trim()).then(() => {
                  setForm(null);
                });
              }}
            >
              {t('Return to HR')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      )}
      {form === 'pub' && recv && (
        <SubForm>
          <Grid2>
            <Field
              label={t('Link to the published post')}
              htmlFor="hr-pk-url"
              help={err === 'url' ? t('Paste the https link to the post.') : undefined}
              error={err === 'url'}
            >
              <input
                id="hr-pk-url"
                className={cn(inputClass, err === 'url' && invalidClass)}
                placeholder="https://"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErr(null);
                }}
              />
            </Field>
            <Field
              label={t('Date it went out')}
              htmlFor="hr-pk-date"
              help={err === 'date' ? t('Choose the date.') : undefined}
              error={err === 'date'}
            >
              <DateField id="hr-pk-date" value={date} onChange={setDate} />
            </Field>
          </Grid2>
          <p className="my-2 text-mute type-small">
            {t('Record what happened outside the app. dwdg’ONE does not publish anything itself.')}
          </p>
          <div className="flex gap-2">
            <Button
              small
              variant="primary"
              onClick={() => {
                if (!url.trim().startsWith('https://')) {
                  setErr('url');
                  return;
                }
                if (!date) {
                  setErr('date');
                  return;
                }
                void recordAnnouncement(pk.id, url.trim(), date).then(() => {
                  setForm(null);
                });
              }}
            >
              {t('Save announcement')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      )}
      {link && rd && canSeeRound(m, rd) && (
        <Link className="mt-2 text-d13h" to={`/recognition/${rd.id}`}>
          {t('Open the round')}
        </Link>
      )}
    </div>
  );
}

function RecognitionList({ m }: { m: NonNullable<ReturnType<typeof useMe>> }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const who = useWho();
  const h = hrOf(db);
  const rounds = (h?.rounds ?? []).filter((rd) => canSeeRound(m, rd)).sort((a, b) => b.month.localeCompare(a.month));
  const packets = h?.packets ?? [];
  const forMcit = packets.filter((pk) => mcitReceiver(m, pk) && pk.state !== 'draft');
  const myConsent = packets.filter((pk) => pk.person === m.id && pk.consent.state === 'asked');
  const announced = packets.filter((pk) => pk.announcement);
  return (
    <Page wide>
      <PageHeader
        title={t('Recognition')}
        sub={t('Member of the Month. The decision and the actual announcement are separate steps.')}
      >
        {hrLead(m) && (
          <Button
            onClick={() => {
              void openNextRound();
            }}
          >
            <Icon name="plus" />
            {t('Open next round')}
          </Button>
        )}
      </PageHeader>
      {myConsent.map((pk) => (
        <Notice
          key={pk.id}
          icon="heart"
          title={<b>{t('You were chosen: {t}', { t: pk.title })}</b>}
          actions={
            <>
              <Button
                small
                variant="primary"
                onClick={() => {
                  void answerConsent(pk.id, 'given');
                }}
              >
                {t('Approve')}
              </Button>
              <Button
                small
                onClick={() => {
                  void answerConsent(pk.id, 'declined');
                }}
              >
                {t('Do not publish')}
              </Button>
            </>
          }
          className="mt-3"
        >
          <p>{t('MCIT will publish only what you approve: {s}', { s: pk.summary })}</p>
        </Notice>
      ))}
      {forMcit.length > 0 && (
        <>
          <SectionHeading as="h2" count={forMcit.length}>
            {t('Publication requests for MCIT')}
          </SectionHeading>
          <div className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 max-[760px]:grid-cols-1">
            {forMcit.map((pk) => (
              <PacketCard key={pk.id} pk={pk} link />
            ))}
          </div>
        </>
      )}
      {rounds.length > 0 && (
        <>
          <SectionHeading as="h2" count={rounds.length}>
            {t('Rounds')}
          </SectionHeading>
          <div className={tblScroll}>
            <table className={tblClass}>
              <thead>
                <tr>
                  <th className={th}>{t('Month')}</th>
                  <th className={th}>{t('Included cycles')}</th>
                  <th className={th}>{t('Coverage')}</th>
                  <th className={th}>{t('Decision')}</th>
                  <th className={th}>{t('Announcement')}</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((rd) => {
                  const cv = coverage(db, rd);
                  const pk = pkOf(db, rd.packet);
                  const fl = rd.flags.filter((f) => f.state === 'open').length;
                  return (
                    <tr
                      key={rd.id}
                      className={trLink}
                      tabIndex={0}
                      role="link"
                      onClick={() => {
                        void navigate(`/recognition/${rd.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void navigate(`/recognition/${rd.id}`);
                      }}
                    >
                      <td className={td}>
                        <b>{monthName(rd.month)}</b>
                      </td>
                      <td className={cn(td, 'type-small')}>{cv.map((x) => cyLabel(x.c)).join(', ')}</td>
                      <td className={td}>
                        {cv.every((x) => x.ok) ? (
                          <Chip def={['Complete', 'check', 'green']} pill="pill-o" />
                        ) : (
                          <Chip
                            def={[
                              plural(cv.filter((x) => !x.ok).length, '{n} cycle not final', '{n} cycles not final'),
                              'clock',
                              'warn',
                            ]}
                            pill="pill-o"
                          />
                        )}
                      </td>
                      <td className={td}>
                        <Chip def={rdsDef(rd.state)} pill="pill-o" />
                        {fl > 0 && (
                          <>
                            {' '}
                            <Chip def={['Review flagged', 'flag', 'danger']} pill="pill-o" />
                          </>
                        )}
                      </td>
                      <td className={td}>
                        {pk ? <Chip def={PKS[pk.state]} pill="pill-o" /> : <span className="text-mute">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <SectionHeading as="h2" count={announced.length}>
        {t('Announced')}
      </SectionHeading>
      {announced.length ? (
        <Rows>
          {announced.map((pk) => (
            <Row key={pk.id} className="cursor-default gap-2.5">
              <Avatar id={pk.person} />
              <RowText
                title={
                  <b>
                    {pk.title}: {who.name(pk.person)}
                  </b>
                }
                sub={pk.summary}
              />
              {pk.announcement && (
                <a
                  className={buttonClass('ghost', true, 'no-underline')}
                  href={pk.announcement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {fmtD(pk.announcement.date)}
                </a>
              )}
            </Row>
          ))}
        </Rows>
      ) : (
        <p className="text-mute type-small">
          {t('No announcement recorded yet. An award shows here only after MCIT records where and when it went out.')}
        </p>
      )}
      <Hint>
        {t('Eligibility, panel, ties and month attribution follow the plan’s proposal until HR adopts its rules.')}
      </Hint>
    </Page>
  );
}

function NominateForm({ rd, onDone }: { rd: HrRound; onDone: () => void }) {
  const db = useWorkspace((w) => w);
  const [p, setP] = useState('');
  const [why, setWhy] = useState('');
  const [err, setErr] = useState(false);
  const elig = eligibleFor(db, rd).filter((x) => !rd.shortlist.some((s) => s.p === x));
  return (
    <SubForm>
      <Field label={t('Member')} htmlFor="hr-nom-p">
        <SelectField
          id="hr-nom-p"
          people
          value={p || (elig[0] ?? '')}
          onChange={setP}
          options={elig.map((id) => ({ value: id, label: db.people.find((x) => x.id === id)?.name ?? id }))}
        />
      </Field>
      <Field
        label={t('Evidence of contribution')}
        htmlFor="hr-nom-why"
        required
        help={err ? t('Describe the contribution.') : t('Role-appropriate contribution, not a count of tasks.')}
        error={err}
      >
        <textarea
          id="hr-nom-why"
          className={cn(textareaClass, 'min-h-16', err && invalidClass)}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            setErr(false);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            const who = p || elig[0];
            if (!who) return;
            if (!why.trim()) {
              setErr(true);
              return;
            }
            void addNomination(rd.id, who, why.trim()).then(onDone);
          }}
        >
          {t('Add nomination')}
        </Button>
        <Button small variant="ghost" onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </SubForm>
  );
}

function RoundPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [nom, setNom] = useState(false);
  const [win, setWin] = useState<string | null>(null);
  const [why, setWhy] = useState('');
  const [whyErr, setWhyErr] = useState(false);
  const [pkNew, setPkNew] = useState(false);
  const [sum, setSum] = useState('');
  const [sumErr, setSumErr] = useState(false);
  const [photo, setPhoto] = useState(true);
  const [recv, setRecv] = useState('galih');
  const [need, setNeed] = useState(addDays(today(), 7));
  const rd = rdOf(db, id);
  if (!m || !rd) return <Unavailable />;
  const pk = pkOf(db, rd.packet);
  if (!canSeeRound(m, rd)) {
    if (pk && mcitReceiver(m, pk))
      return (
        <Page>
          <PageHeader
            title={pk.title}
            sub={t('You see the publication request only. The panel’s deliberation stays with HR.')}
          />
          <div className="mt-4">
            <PacketCard pk={pk} />
          </div>
        </Page>
      );
    return <Unavailable />;
  }
  const cv = coverage(db, rd);
  const full = cv.every((x) => x.ok);
  const panel = onPanel(m, rd);
  const lead = hrLead(m);
  const open = rd.state === 'open';
  const flags = rd.flags.filter((f) => f.state === 'open');
  const stamp = (pid: string, at: string) => who.stamp(pid, at);
  const winner = win ?? rd.shortlist[0]?.p ?? '-';
  const mcitLeads = db.people.filter((p) => p.status === 'active' && p.div === 'mcit' && rank(p) >= 2);
  return (
    <Page wide>
      <PageHeader title={rdName(rd)} sub={t(rd.eligibility)}>
        <Chip def={rdsDef(rd.state)} pill="pill" />
      </PageHeader>
      <Meta className="mt-4 mb-1.5 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Included cycles')}>
          <span className="grid gap-1">
            {cv.map((x) => (
              <span key={x.c.id}>
                <Link to={`/monitoring/${x.c.id}`}>{cyLabel(x.c)}</Link>{' '}
                <Chip
                  def={
                    x.ok
                      ? ['Final', 'check', 'green']
                      : x.open
                        ? [plural(x.open, '{n} correction open', '{n} corrections open'), 'undo', 'warn']
                        : cysDef(x.c.state)
                  }
                />
              </span>
            ))}
          </span>
        </MetaRow>
        <MetaRow label={t('Nominations')}>{t(rd.policy)}</MetaRow>
        <MetaRow label={t('Panel')}>
          {rd.panel.map((p) => (
            <PersonLink key={p} id={p} />
          ))}
        </MetaRow>
        <MetaRow label={t('Recused')}>
          {rd.recused.length ? (
            <span className="grid gap-1">
              {rd.recused.map((x) => (
                <span key={x.p}>
                  <PersonLink id={x.p} /> <small>{x.why}</small>
                </span>
              ))}
            </span>
          ) : (
            t('Nobody')
          )}
        </MetaRow>
        <MetaRow label={t('Created by')}>{stamp(rd.createdBy, rd.createdAt)}</MetaRow>
      </Meta>
      {flags.map((f) => (
        <Notice
          key={f.id}
          icon="flag"
          tone="error"
          title={<b>{t('Review flagged {d}', { d: dShort(f.at.slice(0, 10)) })}</b>}
          actions={
            panel ? (
              <>
                <Button
                  small
                  onClick={() => {
                    void resolveFlag(rd.id, f.id, 'confirmed');
                  }}
                >
                  {t('Confirm decision')}
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    void resolveFlag(rd.id, f.id, 'reopened');
                  }}
                >
                  {t('Reopen')}
                </Button>
              </>
            ) : undefined
          }
        >
          <p>
            {t(
              'A finalized score in cycle {c} was corrected ({who}). The decision stays as recorded until the panel reviews it.',
              {
                c: cyLabel(
                  db.hr
                    ? (hrOf(db)?.cycles.find((c) => c.id === f.cycle) ?? ({ start: '', end: '' } as never))
                    : ({ start: '', end: '' } as never),
                ),
                who: who.first(f.person),
              },
            )}
          </p>
        </Notice>
      ))}
      {rd.flags
        .filter((f) => f.state !== 'open')
        .map((f) => (
          <p key={f.id} className="my-2 text-mute type-small">
            {f.state === 'confirmed'
              ? t('Review on {d}: decision confirmed by {who}.', {
                  d: dShort((f.resolvedAt ?? '').slice(0, 10)),
                  who: who.first(f.by),
                })
              : t('Review on {d}: decision reopened by {who}.', {
                  d: dShort((f.resolvedAt ?? '').slice(0, 10)),
                  who: who.first(f.by),
                })}
          </p>
        ))}
      <SectionHeading as="h2" count={rd.shortlist.length}>
        {t('Shortlist')}
      </SectionHeading>
      <Rows>
        {rd.shortlist.length ? (
          rd.shortlist.map((s) => (
            <Row key={s.p} className="cursor-default gap-2.5">
              <Avatar id={s.p} />
              <RowText className="whitespace-normal" title={<b>{who.name(s.p)}</b>} sub={s.why} />
              <span className="flex-none text-mute type-small">
                {t('Nominated by {who}', { who: who.first(s.by) })}
              </span>
              {rd.decision?.winner === s.p && <Chip def={['Chosen', 'check', 'green']} pill="pill" />}
            </Row>
          ))
        ) : (
          <EmptyLine>{t('No nominations yet.')}</EmptyLine>
        )}
      </Rows>
      {open &&
        (panel || lead) &&
        (nom ? (
          <NominateForm
            rd={rd}
            onDone={() => {
              setNom(false);
            }}
          />
        ) : (
          <div className="mt-2 flex gap-2">
            <Button
              small
              onClick={() => {
                setNom(true);
              }}
            >
              <Icon name="plus" />
              {t('Nominate')}
            </Button>
          </div>
        ))}
      {rd.decision && (
        <>
          <SectionHeading as="h2">{t('Decision')}</SectionHeading>
          <Notice
            icon={rd.decision.noAward ? 'minus' : 'check'}
            tone={rd.decision.noAward ? 'info' : 'done'}
            title={
              <b>
                {rd.decision.noAward
                  ? t('No award this month')
                  : t('{who} chosen', { who: rd.decision.winner ? who.name(rd.decision.winner) : '' })}
              </b>
            }
          >
            <p>
              {rd.decision.rationale}
              <br />
              {t('Recorded by {who}, version {v}', {
                who: stamp(rd.decision.by, rd.decision.at),
                v: rd.decision.version,
              })}
            </p>
          </Notice>
        </>
      )}
      {open && panel && (
        <>
          <SectionHeading as="h2">{t('Decision')}</SectionHeading>
          {!full && (
            <Notice icon="clock" tone="warn" title={<b>{t('Coverage is not complete')}</b>}>
              <p>
                {t(
                  'Every included cycle must be finalized with no open correction before the panel decides. Nobody wins on task counts.',
                )}
              </p>
            </Notice>
          )}
          <Field label={t('Winner')} htmlFor="hr-rd-win">
            <SelectField
              id="hr-rd-win"
              people
              disabled={!full}
              value={winner}
              onChange={setWin}
              options={[
                ...rd.shortlist.map((s) => ({ value: s.p, label: who.name(s.p) })),
                { value: '-', label: t('No award this month') },
              ]}
            />
          </Field>
          <Field
            label={t('Rationale')}
            htmlFor="hr-rd-why"
            required
            help={whyErr ? t('Give the rationale.') : undefined}
            error={whyErr}
          >
            <textarea
              id="hr-rd-why"
              className={cn(textareaClass, 'min-h-16', whyErr && invalidClass)}
              disabled={!full}
              value={why}
              onChange={(e) => {
                setWhy(e.target.value);
                setWhyErr(false);
              }}
            />
          </Field>
          <Button
            variant="primary"
            disabled={!full || !rd.shortlist.length}
            onClick={() => {
              if (!why.trim()) {
                setWhyErr(true);
                return;
              }
              void recordDecision(rd.id, winner === '-' ? null : winner, why.trim());
            }}
          >
            {t('Record decision')}
          </Button>
        </>
      )}
      {rd.decision && !rd.decision.noAward && (
        <>
          <SectionHeading as="h2">{t('Publication')}</SectionHeading>
          {pk ? (
            <PacketCard pk={pk} />
          ) : lead ? (
            pkNew ? (
              <SubForm>
                <Field
                  label={t('Publishable summary')}
                  htmlFor="hr-pk-sum"
                  required
                  help={
                    sumErr
                      ? t('Write the summary MCIT may publish.')
                      : t('No scores, absence reasons or support notes. The member approves it first.')
                  }
                  error={sumErr}
                >
                  <textarea
                    id="hr-pk-sum"
                    className={cn(textareaClass, 'min-h-16', sumErr && invalidClass)}
                    value={sum}
                    autoFocus
                    onChange={(e) => {
                      setSum(e.target.value);
                      setSumErr(false);
                    }}
                  />
                </Field>
                <label className="my-1.5 mb-3 flex cursor-pointer items-center gap-2 text-[length:13.5px]">
                  <input
                    type="checkbox"
                    className="m-0 size-4 accent-ink"
                    checked={photo}
                    onChange={(e) => {
                      setPhoto(e.target.checked);
                    }}
                  />
                  {t('Include the member’s photo if they agree')}
                </label>
                <Grid2>
                  <Field label={t('Named receiver in MCIT')} htmlFor="hr-pk-recv">
                    <SelectField
                      id="hr-pk-recv"
                      people
                      value={recv}
                      onChange={setRecv}
                      options={mcitLeads.map((p) => ({ value: p.id, label: p.name }))}
                    />
                  </Field>
                  <Field label={t('Needed by')} htmlFor="hr-pk-need">
                    <DateField id="hr-pk-need" value={need} onChange={setNeed} />
                  </Field>
                </Grid2>
                <div className="flex gap-2">
                  <Button
                    small
                    variant="primary"
                    onClick={() => {
                      if (!sum.trim()) {
                        setSumErr(true);
                        return;
                      }
                      void createPacket({
                        round: rd.id,
                        summary: sum.trim(),
                        photo,
                        receiver: recv,
                        neededBy: need || null,
                      }).then(() => {
                        setPkNew(false);
                      });
                    }}
                  >
                    {t('Ask the member to approve')}
                  </Button>
                  <Button
                    small
                    variant="ghost"
                    onClick={() => {
                      setPkNew(false);
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                </div>
              </SubForm>
            ) : (
              <Button
                onClick={() => {
                  setPkNew(true);
                }}
              >
                {t('Prepare publication packet')}
              </Button>
            )
          ) : (
            <p className="text-mute type-small">{t('HR prepares the publication packet.')}</p>
          )}
        </>
      )}
    </Page>
  );
}

export function RecognitionPage({ route }: { route: Route }) {
  const m = useMe();
  useDivisionWorkspace('hr');
  if (!m) return null;
  if (isBoard(m)) return <Unavailable />;
  return route.id ? <RoundPage id={route.id} /> : <RecognitionList m={m} />;
}
