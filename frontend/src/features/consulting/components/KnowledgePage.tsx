/* Knowledge: reviewed methods, templates, cases and lessons. Each article keeps its source, exact versions and audience; a
   curator reviews one exact version before anyone else sees it, and restricted client material never appears, title included,
   for people outside its audience. From divisions/div-ee-cons.js knPage, artPage and INSP['kn-new'] (consulting_knowledge,
   W064, S058, S059). */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Chip, DivCrumb, Hint, Tag, td, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows, SearchField } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, fmtD, today } from '@/lib/time';
import { isBoard } from '@/lib/roles';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { CONS } from '@/features/external/services/ee-data';
import { DeniedPanel, isUrl, useFieldErrors } from '@/features/external/components/ext-parts';
import { canSeeProject } from '@/features/projects/services/access';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import { consOf, type Article, type KnVersion } from '../services/cons-data';
import {
  AUD,
  KKIND,
  KN,
  artOf,
  artStaff,
  canSeeArt,
  cohortOfProject,
  engOf,
  isCurator,
  pubV,
} from '../services/cons-rules';
import {
  contribute,
  defaultNextReview,
  publish,
  reportProblem,
  requestChanges,
  resolveReport,
  submitNewVersion,
  withdrawArticle,
} from '../services/knowledge';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function KnowledgeCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const a = route.id ? artOf(db, route.id) : undefined;
  const parts: [string, string][] = [['knowledge', t('Knowledge')]];
  if (a && canSeeArt(a, m)) parts.push(['', a.title]);
  return <DivCrumb d={CONS} parts={parts} />;
}

type Tab = 'library' | 'queue' | 'mine';

function KnowledgeList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const who = useWho();
  const stored = useUi((u) => (u.knTab === 'queue' || u.knTab === 'mine' ? u.knTab : 'library'));
  const [q, setQ] = useState('');
  useDivisionWorkspace(CONS);
  if (!m || isBoard(m)) return <Unavailable />;
  const kn = consOf(db).kn;
  const lib = kn.filter((a) => canSeeArt(a, m) && pubV(a));
  const queue = isCurator(m)
    ? kn.filter((a) => a.audience !== 'named' && a.versions.some((v) => v.state === 'review'))
    : [];
  const mine = kn.filter((a) => a.author === m.id);
  const tabs: [Tab, string, number][] = [
    ['library', 'Library', lib.length],
    ...(isCurator(m) ? [['queue', 'Review queue', queue.length] as [Tab, string, number]] : []),
    ...(mine.length ? [['mine', 'Your contributions', mine.length] as [Tab, string, number]] : []),
  ];
  const tab: Tab =
    stored === 'queue' && !isCurator(m) ? 'library' : stored === 'mine' && !mine.length ? 'library' : stored;
  const needle = q.trim().toLowerCase();
  const go = (id: string) => () => {
    void navigate(`/knowledge/${id}`);
  };
  const row = (a: Article) => {
    const p = pubV(a);
    const rep = a.reports.filter((x) => x.state === 'open').length;
    const due = !!a.nextReview && a.nextReview <= today();
    const last = a.versions[a.versions.length - 1];
    return (
      <tr
        key={a.id}
        className={trLink}
        tabIndex={0}
        role="link"
        onClick={go(a.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') go(a.id)();
        }}
      >
        <td className={cn(td, '[&_small]:text-d12')}>
          <b>{a.title}</b>
          <small className="text-mute">{t(KKIND[a.kind])}</small>
        </td>
        <td className={td}>
          {a.topics.length ? (
            <span className="inline-flex gap-1">
              {a.topics.map((x) => (
                <span key={x} className="inline-flex h-6 items-center rounded-chip bg-fill px-2 text-d13 text-ink-2">
                  {x}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-mute">{t('None')}</span>
          )}
        </td>
        <td className={td}>
          {p ? <span className="type-num">v{p.v}</span> : last && <Chip def={KN[last.state]} pill="pill-o" />}
        </td>
        <td className={td}>
          <span className="inline-flex items-center gap-1.5">
            {a.audience === 'named' && <Icon name="lock" size="xs" />}
            {t(AUD[a.audience])}
          </span>
        </td>
        <td className={td}>
          <PersonLink id={a.author} avatarClass="size-[22px]" />
        </td>
        <td className={td}>
          {a.nextReview ? (
            <>
              <span className="type-num">{dShort(a.nextReview)}</span>
              {due && (
                <>
                  {' '}
                  <State label={t('Review due')} icon="clock" tone="warn" />
                </>
              )}
            </>
          ) : (
            <span className="text-mute">{t('Not set')}</span>
          )}
        </td>
        <td className={cn(td, 'text-right')}>{rep ? <State label={String(rep)} icon="flag" tone="warn" /> : '0'}</td>
      </tr>
    );
  };
  const table = (rows: Article[], head: string) => (
    <div className={tblScroll}>
      <table className={tblClass}>
        <thead>
          <tr>
            <th className={th}>{t('Title')}</th>
            <th className={th}>{t('Topics')}</th>
            <th className={th}>{head}</th>
            <th className={th}>{t('Audience')}</th>
            <th className={th}>{t('Author')}</th>
            <th className={th}>{t('Next review')}</th>
            <th className={cn(th, 'text-right')}>{t('Reports')}</th>
          </tr>
        </thead>
        <tbody>{rows.map(row)}</tbody>
      </table>
    </div>
  );
  const shown = needle ? lib.filter((a) => [a.title, ...a.topics].join(' ').toLowerCase().includes(needle)) : lib;
  return (
    <Page wide>
      <PageHeader
        title={t('Knowledge')}
        sub={t('Reviewed methods, templates and lessons. Each article keeps its source, version and audience.')}
      >
        <Button
          variant="primary"
          onClick={() => {
            openPanel('kn-new');
          }}
        >
          <Icon name="plus" />
          {t('Contribute')}
        </Button>
      </PageHeader>
      <div className="mt-4 mb-2 max-w-full overflow-x-auto">
        <Segmented<Tab>
          label={t('View')}
          value={tab}
          onChange={(k) => {
            setUi((u) => {
              u.knTab = k;
            });
          }}
          options={tabs.map(([k, l, n]): [Tab, React.ReactNode] => [
            k,
            <>
              {t(l)} <span className="ml-1 text-mute type-num">{n}</span>
            </>,
          ])}
        />
      </div>
      {tab === 'queue' && isCurator(m) ? (
        <Rows>
          {queue.map((a) => {
            const v = a.versions.find((z) => z.state === 'review');
            if (!v) return null;
            return (
              <Row key={a.id} className="gap-2.5" onOpen={go(a.id)}>
                <Avatar id={v.by} size="sm" />
                <RowText
                  title={<b>{a.title}</b>}
                  sub={`${t('Version {v}: {n}', { v: v.v, n: v.note })}. ${t('Submitted by {who}', { who: who.stamp(v.by, v.at) })}`}
                />
                <Chip def={KN.review} pill="pill-o" />
              </Row>
            );
          })}
          {!queue.length && <EmptyLine>{t('Nothing waiting for review.')}</EmptyLine>}
        </Rows>
      ) : tab === 'mine' ? (
        table(mine, t('Version'))
      ) : lib.length ? (
        <>
          <SearchField
            label={t('Search titles and topics')}
            className="my-3.5 mb-1.5 w-[min(420px,100%)]"
            placeholder={t('Search titles and topics')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
          />
          {table(shown, t('Published'))}
        </>
      ) : (
        <Empty title={t('No published articles you can open')}>
          {t('Articles appear here once a curator publishes them to an audience that includes you.')}
        </Empty>
      )}
      <Hint>
        {t('Restricted client material never appears in this library or in search for people outside its audience.')}
      </Hint>
    </Page>
  );
}

// ---------- one article ----------
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-2">{children}</div>
);
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};
const openForm = (f: string) => () => {
  setUi((u) => {
    u.form = f;
  });
};
const CancelBtn = () => (
  <Button variant="ghost" onClick={closeForm}>
    {t('Cancel')}
  </Button>
);

function PublishForm({ a, v }: { a: Article; v: number }) {
  const [aud, setAud] = useState<Article['audience']>(a.audience === 'named' ? 'cons' : a.audience);
  const [next, setNext] = useState(a.nextReview ?? defaultNextReview());
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field label={t('Audience')} htmlFor="kn-aud" required>
        <SelectField
          id="kn-aud"
          value={aud}
          onChange={(x) => {
            setAud(x as Article['audience']);
          }}
          options={(Object.keys(AUD) as Article['audience'][])
            .filter((k) => k !== 'named')
            .map((k) => ({ value: k, label: t(AUD[k]) }))}
        />
      </Field>
      <Field label={t('Next review')} htmlFor="kn-next" required help={fe.help('next')} error={fe.bad('next')}>
        <DateField
          id="kn-next"
          value={next}
          onChange={(x) => {
            setNext(x);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Review note')} htmlFor="kn-rn">
        <input
          id="kn-rn"
          className={inputClass}
          value={note}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!next) return fe.fail('next', t('Choose the next review date.'));
            void publish(a.id, { audience: aud, nextReview: next, note: note.trim() });
          }}
        >
          {t('Publish version {v}', { v })}
        </Button>
        <CancelBtn />
      </Acts>
    </SubForm>
  );
}

function TextForm({
  id,
  label,
  help,
  required = true,
  rows = 3,
  action,
  variant = 'primary',
  empty,
  onSubmit,
}: {
  id: string;
  label: string;
  help?: string;
  required?: boolean;
  rows?: number;
  action: string;
  variant?: 'primary' | 'danger';
  empty: string;
  onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field label={label} htmlFor={id} required={required} help={fe.help('v', help)} error={fe.bad('v')}>
        <textarea
          id={id}
          className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
          rows={rows}
          value={v}
          autoFocus
          onChange={(e) => {
            setV(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant={variant}
          onClick={() => {
            if (!v.trim()) return fe.fail('v', empty);
            onSubmit(v.trim());
          }}
        >
          {action}
        </Button>
        <CancelBtn />
      </Acts>
    </SubForm>
  );
}

function VersionForm({ a }: { a: Article }) {
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field label={t('What changed')} htmlFor="kn-vn" required help={fe.help('note')} error={fe.bad('note')}>
        <input
          id="kn-vn"
          className={cn(inputClass, fe.bad('note') && invalidClass)}
          value={note}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Link to this version')} htmlFor="kn-vu" required help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="kn-vu"
          className={cn(inputClass, fe.bad('url') && invalidClass)}
          placeholder="https://"
          value={url}
          autoComplete="off"
          onChange={(e) => {
            setUrl(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <p className="my-2 text-mute type-small">
        {t('A new version goes to review. The published version stays until the curator publishes the new one.')}
      </p>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!note.trim()) return fe.fail('note', t('Say what changed.'));
            if (!url.trim() || !isUrl(url.trim())) return fe.fail('url', t('Paste the https link to this version.'));
            void submitNewVersion(a.id, { note: note.trim(), url: url.trim() });
          }}
        >
          {t('Submit version {v}', { v: a.versions.length + 1 })}
        </Button>
        <CancelBtn />
      </Acts>
    </SubForm>
  );
}

function ArticlePage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(CONS);
  const a = artOf(db, id);
  if (!a || !m || isBoard(m) || !canSeeArt(a, m)) return <Unavailable />;
  const p = pubV(a);
  const staff = artStaff(a, m);
  const vs = staff ? a.versions : a.versions.filter((v) => ['published', 'superseded'].includes(v.state));
  const inRev = a.versions.find((v) => v.state === 'review');
  const last = a.versions[a.versions.length - 1];
  const canCur = !!inRev && isCurator(m) && inRev.by !== m.id && a.audience !== 'named';
  const isAuthor = a.author === m.id || a.owner === m.id;
  let acts: React.ReactNode;
  if (form === 'kn-pub' && inRev) acts = <PublishForm a={a} v={inRev.v} />;
  else if (form === 'kn-chg')
    acts = (
      <TextForm
        id="kn-cn"
        label={t('What should change')}
        action={t('Request changes')}
        empty={t('Say what should change.')}
        onSubmit={(v) => {
          void requestChanges(a.id, v);
        }}
      />
    );
  else if (form === 'kn-ver') acts = <VersionForm a={a} />;
  else if (form === 'kn-rep')
    acts = (
      <TextForm
        id="kn-rp"
        label={t('What is wrong or out of date?')}
        help={t('Goes to {who}, who owns this article.', { who: who.first(a.owner) })}
        action={t('Send report')}
        empty={t('Describe the problem.')}
        onSubmit={(v) => {
          void reportProblem(a.id, v);
        }}
      />
    );
  else if (form === 'kn-wd')
    acts = (
      <TextForm
        id="kn-wr"
        label={t('Reason for withdrawing')}
        help={t('The history and every past use stay.')}
        rows={2}
        action={t('Withdraw')}
        variant="danger"
        empty={t('Give the reason.')}
        onSubmit={(v) => {
          void withdrawArticle(a.id, v);
        }}
      />
    );
  else
    acts = (
      <>
        <Acts>
          {canCur && (
            <>
              <Button variant="primary" onClick={openForm('kn-pub')}>
                {t('Publish version {v}', { v: inRev.v })}
              </Button>
              <Button onClick={openForm('kn-chg')}>{t('Request changes')}</Button>
            </>
          )}
          {isAuthor && !inRev && last?.state !== 'withdrawn' && (
            <Button onClick={openForm('kn-ver')}>
              <Icon name="upload" />
              {t('Submit a new version')}
            </Button>
          )}
          {p && (
            <Button variant="ghost" onClick={openForm('kn-rep')}>
              <Icon name="flag" />
              {t('Report a problem')}
            </Button>
          )}
          {isCurator(m) && p && a.audience !== 'named' && (
            <Button variant="ghost" onClick={openForm('kn-wd')}>
              {t('Withdraw')}
            </Button>
          )}
        </Acts>
        {inRev && isCurator(m) && inRev.by === m.id && (
          <p className="my-2 text-mute type-small">{t('You wrote this version, so another curator reviews it.')}</p>
        )}
      </>
    );
  const verRow = (v: KnVersion, i: number) => (
    <div
      key={v.v}
      className={cn(
        'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5',
        i === 0 && 'bg-sel-neutral',
      )}
    >
      <span className="text-d13 font-semibold">v{v.v}</span>
      <div className="min-w-0">
        <b className="text-d14 font-bold">{v.note}</b>
        <small className="block text-d13 text-mute">{who.stamp(v.by, v.at)}</small>
        {v.reviewedAt && v.reviewer && (
          <small className="block text-d13 text-mute">
            {t('Reviewed by {who}', { who: who.stamp(v.reviewer, v.reviewedAt) })}
            {v.reviewNote && `: ${v.reviewNote}`}
          </small>
        )}
      </div>
      <Chip def={KN[v.state]} pill="pill" />
    </div>
  );
  return (
    <Page wide>
      <PageHeader
        title={a.title}
        sub={
          <span className="flex flex-wrap items-center gap-1.5">
            <Tag>{t(KKIND[a.kind])}</Tag>
            {a.topics.map((x) => (
              <span key={x} className="inline-flex h-6 items-center rounded-chip bg-fill px-2 text-d13 text-ink-2">
                {x}
              </span>
            ))}
          </span>
        }
      >
        {p ? (
          <Chip def={[t('Published v{v}', { v: p.v }), 'check', 'green']} pill="pill" />
        ) : (
          last && <Chip def={KN[last.state]} pill="pill" />
        )}
      </PageHeader>
      {p && (
        <div className="mt-3.5 mb-1.5 flex max-w-[760px] items-center justify-between gap-3 rounded-ctl bg-surface-2 px-4 py-3 max-[600px]:flex-col max-[600px]:items-start">
          <div>
            <b>{t('Current version {v}', { v: p.v })}</b>
            <small className="block text-d13 text-mute">
              {p.note}.{' '}
              {p.reviewer && p.reviewedAt && t('Published by {who}', { who: who.stamp(p.reviewer, p.reviewedAt) })}
            </small>
          </div>
          {p.url && (
            <a
              className="inline-flex h-[var(--ctl-h-sm)] items-center gap-1.5 rounded-ctl bg-surface px-2.5 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)]"
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external" />
              {t('Open')}
            </a>
          )}
        </div>
      )}
      {acts}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Author')}>
          <PersonLink id={a.author} avatarClass="size-[22px]" />
        </MetaRow>
        <MetaRow label={t('Owner')}>
          <PersonLink id={a.owner} avatarClass="size-[22px]" />
        </MetaRow>
        <MetaRow label={t('Source')}>{a.source}</MetaRow>
        <MetaRow label={t('Permission')}>{a.perm}</MetaRow>
        <MetaRow label={t('Audience')}>
          {a.audience === 'named' ? (
            <>
              <Icon name="lock" size="xs" /> {a.named.map((x) => who.first(x)).join(', ')}
            </>
          ) : (
            t(AUD[a.audience])
          )}
        </MetaRow>
        <MetaRow label={t('Next review')}>
          {a.nextReview ? fmtD(a.nextReview) : <span className="text-mute">{t('Not set')}</span>}
        </MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(a.author, a.at)}</MetaRow>
      </Meta>
      <SectionHeading as="h2" count={vs.length}>
        {t('Versions')}
      </SectionHeading>
      <div className="grid gap-[3px]">{[...vs].reverse().map(verRow)}</div>
      {!staff && a.versions.length > vs.length && (
        <p className="my-2 text-mute type-small">
          {t('Versions not yet published are visible to the author and curators only.')}
        </p>
      )}
      <SectionHeading as="h2" count={a.uses.length}>
        {t('Used in')}
      </SectionHeading>
      <Rows>
        {a.uses.map((u) => {
          const pr = projOf(db, u.id);
          const c = cohortOfProject(db, u.id);
          const see = !!pr && canSeeProject(db, m, pr);
          const to = c
            ? `/cohorts/${c.id}`
            : u.type === 'project' && engOf(db, u.id)
              ? `/engagements/${u.id}`
              : `/projects/${u.id}`;
          return (
            <Row
              key={`${u.type}${u.id}`}
              className={cn('gap-2.5', !see && 'cursor-default')}
              {...(see
                ? {
                    onOpen: () => {
                      void navigate(to);
                    },
                  }
                : {})}
            >
              <Icon name={see ? 'projects' : 'lock'} />
              <RowText
                title={<b>{pr && see ? pr.name : t('A project you can’t open')}</b>}
                sub={`${t('Uses version {v}', { v: u.v })}${p && p.v > u.v ? `. ${t('Version {v} is newer; this use stays on version {u}.', { v: p.v, u: u.v })}` : ''}`}
              />
            </Row>
          );
        })}
        {!a.uses.length && <EmptyLine>{t('Not referenced yet.')}</EmptyLine>}
      </Rows>
      <SectionHeading as="h2" count={a.reports.length}>
        {t('Reports')}
      </SectionHeading>
      <Rows>
        {a.reports.map((x) => (
          <Row key={x.id} className="cursor-default gap-2.5 max-[600px]:flex-wrap">
            <Avatar id={x.by} size="sm" />
            <RowText
              title={<b>{x.reason}</b>}
              sub={`${who.stamp(x.by, x.at)}${typeof x.note === 'string' && x.note ? `. ${x.note}` : ''}`}
            />
            <Chip def={x.state === 'open' ? ['Open', 'flag', 'warn'] : ['Resolved', 'check', 'green']} pill="pill-o" />
            {x.state === 'open' && (a.owner === m.id || isCurator(m)) && (
              <Button
                small
                onClick={() => {
                  void resolveReport(a.id, x.id);
                }}
              >
                {t('Mark resolved')}
              </Button>
            )}
          </Row>
        ))}
        {!a.reports.length && <EmptyLine>{t('No reports.')}</EmptyLine>}
      </Rows>
    </Page>
  );
}

export function KnowledgePage({ route }: { route: Route }) {
  const m = useMe();
  if (!m || isBoard(m)) return <Unavailable />;
  return route.id ? <ArticlePage id={route.id} /> : <KnowledgeList />;
}

// ---------- contribute ----------
const PERMS = ['Sanitized. No client names, files or links.', 'Client permission recorded.', 'Internal material only.'];
function ContributePanel() {
  const m = useMe();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Article['kind']>('method');
  const [aud, setAud] = useState<Article['audience']>('cons');
  const [topics, setTopics] = useState('');
  const [src, setSrc] = useState('');
  const [perm, setPerm] = useState(PERMS[0] ?? '');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  if (!m || isBoard(m)) return <DeniedPanel head={t('Contribute')} />;
  return (
    <>
      <InspectorHead>{t('Contribute to Knowledge')}</InspectorHead>
      <p className="my-2 text-mute type-small">
        {t('A curator checks the source and permission, then reviews this exact version before anyone else sees it.')}
      </p>
      <Field label={t('Title')} htmlFor="kn-n-t" required help={fe.help('title')} error={fe.bad('title')}>
        <input
          id="kn-n-t"
          className={cn(inputClass, fe.bad('title') && invalidClass)}
          value={title}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Kind')} htmlFor="kn-n-k">
          <SelectField
            id="kn-n-k"
            value={kind}
            onChange={(v) => {
              setKind(v as Article['kind']);
            }}
            options={(Object.keys(KKIND) as Article['kind'][]).map((k) => ({ value: k, label: t(KKIND[k]) }))}
          />
        </Field>
        <Field label={t('Audience you suggest')} htmlFor="kn-n-a">
          <SelectField
            id="kn-n-a"
            value={aud}
            onChange={(v) => {
              setAud(v as Article['audience']);
            }}
            options={(Object.keys(AUD) as Article['audience'][])
              .filter((k) => k !== 'named')
              .map((k) => ({ value: k, label: t(AUD[k]) }))}
          />
        </Field>
      </Grid2>
      <Field label={t('Topics, comma separated')} htmlFor="kn-n-top">
        <input
          id="kn-n-top"
          className={inputClass}
          value={topics}
          autoComplete="off"
          onChange={(e) => {
            setTopics(e.target.value);
          }}
        />
      </Field>
      <Field
        label={t('Source')}
        htmlFor="kn-n-src"
        required
        help={fe.help('src', t('Where this comes from: an engagement, research, training or your own work.'))}
        error={fe.bad('src')}
      >
        <input
          id="kn-n-src"
          className={cn(inputClass, fe.bad('src') && invalidClass)}
          value={src}
          autoComplete="off"
          onChange={(e) => {
            setSrc(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Permission')} htmlFor="kn-n-perm" required>
        <SelectField
          id="kn-n-perm"
          value={perm}
          onChange={setPerm}
          options={PERMS.map((x) => ({ value: x, label: t(x) }))}
        />
      </Field>
      <Field label={t('Link to the draft')} htmlFor="kn-n-u" required help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="kn-n-u"
          className={cn(inputClass, fe.bad('url') && invalidClass)}
          placeholder="https://"
          value={url}
          autoComplete="off"
          onChange={(e) => {
            setUrl(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Note for the curator')} htmlFor="kn-n-note">
        <input
          id="kn-n-note"
          className={inputClass}
          value={note}
          autoComplete="off"
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <div className="mt-1 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!title.trim()) return fe.fail('title', t('Give a title.'));
            if (!src.trim()) return fe.fail('src', t('Name the source.'));
            if (!url.trim() || !isUrl(url.trim())) return fe.fail('url', t('Paste the https link to the draft.'));
            void contribute({
              title: title.trim(),
              kind,
              audience: aud,
              topics: topics
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
              source: src.trim(),
              perm,
              url: url.trim(),
              note: note.trim(),
            });
          }}
        >
          {t('Send for review')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}
PANELS['kn-new'] = ContributePanel;
