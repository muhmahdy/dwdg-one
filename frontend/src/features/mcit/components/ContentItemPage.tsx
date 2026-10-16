/* One content item: the separate dates (internal due, approval, planned and actual publication per channel), versions reviewed one
   exact version at a time, scheduling, publication recorded per channel with evidence (never posted by the app), corrections
   and takedowns, cancellation and the history. From divisions/div-fnl-mcit.js contentItemPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { State, TaskStatusMark } from '@/components/ui/StatusBadge';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, fmtD, nowStamp, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { taskOf } from '@/features/work/services/selectors';
import { isBoardP, okDate, safeUrl } from '@/features/fnl/services/fnl-data';
import {
  Acts,
  Box,
  ByAt,
  HistoryList,
  LinkOut,
  Links,
  NextBox,
  Note,
  Who,
  fmtDT,
  useFieldErrors,
} from '@/features/fnl/components/fnl-parts';
import { Tbl, Td, Th } from '@/features/fnl/components/fnl-table';
import {
  cancelContent,
  decideContent,
  moveChannelDate,
  okTime,
  recordCorrection,
  recordFailure,
  recordPublication,
  scheduleContent,
  sendContentVersion,
  startContent,
} from '../services/content';
import {
  CORDER,
  CST,
  MC,
  brOf,
  chName,
  cLatest,
  cmpOf,
  ctOf,
  mcFull,
  mcLead,
  mcitOf,
  mg,
  pubCount,
  stale,
  type Content,
  type ContentVersion,
} from '../services/mcit-data';

const openForm = (f: string) => () => {
  setUi((u) => {
    u.form = f;
  });
};
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};
const Cancel = ({ label }: { label?: string }) => (
  <Button variant="ghost" onClick={closeForm}>
    {label ?? t('Cancel')}
  </Button>
);
const StaleChip = () => <Chip def={['Approval stale', 'warning', 'danger']} />;

function DatesTable({ c }: { c: Content }) {
  const lv = cLatest(c);
  const approvedAt = c.versions.find((v) => v.v === c.approvedV)?.decision?.at ?? '';
  return (
    <Tbl
      head={
        <>
          <Th>{t('Date')}</Th>
          <Th>{t('Who')}</Th>
          <Th>{t('When')}</Th>
          <Th>{t('State')}</Th>
        </>
      }
    >
      <tr>
        <Td>
          <b>{t('Internal due')}</b>
          <small className="text-mute">{t('Version ready for review')}</small>
        </Td>
        <Td>
          <Who id={c.executor} />
        </Td>
        <Td>
          {c.due ? <span className="type-num">{fmtD(c.due)}</span> : <span className="text-mute">{t('Not set')}</span>}
        </Td>
        <Td>
          {lv ? (
            <Chip def={['Version sent', 'check', 'green']} />
          ) : c.due && c.due < today() ? (
            <Chip def={['Past due', 'warning', 'danger']} />
          ) : (
            <Chip def={['Open', 'circle', 'mute']} />
          )}
        </Td>
      </tr>
      <tr>
        <Td>
          <b>{t('Approval')}</b>
          <small className="text-mute">{t('On an exact version')}</small>
        </Td>
        <Td>
          <Who id={c.reviewer} />
        </Td>
        <Td>{c.approvedV ? fmtDT(approvedAt) : '–'}</Td>
        <Td>
          {c.approvedV ? (
            stale(c) ? (
              <StaleChip />
            ) : (
              <State label={t('Approved v{v}', { v: c.approvedV })} icon="check" tone="green" />
            )
          ) : (
            <Chip def={['Not approved', 'circle', 'mute']} />
          )}
        </Td>
      </tr>
      {c.channels.map((ch) => (
        <ChannelDates key={ch.ch} c={c} idx={c.channels.indexOf(ch)} />
      ))}
    </Tbl>
  );
}
function ChannelDates({ c, idx }: { c: Content; idx: number }) {
  const ch = c.channels[idx];
  if (!ch) return null;
  return (
    <>
      <tr>
        <Td>
          <b>{t('Planned publication')}</b>
          <small className="text-mute">{chName(ch.ch)}</small>
        </Td>
        <Td>
          <Who id={c.executor} />
        </Td>
        <Td className="type-num">{fmtDT(ch.planned)}</Td>
        <Td>
          {ch.pub ? (
            <Chip def={['Published', 'globe', 'green']} />
          ) : ch.planned.slice(0, 10) < today() ? (
            <Chip def={['Planned date passed, not published', 'warning', 'warn']} />
          ) : (
            <Chip def={['Planned', 'calendar', 'ink']} />
          )}
        </Td>
      </tr>
      <tr>
        <Td>
          <b>{t('Actual publication')}</b>
          <small className="text-mute">{chName(ch.ch)}</small>
        </Td>
        <Td>{ch.pub ? <Who id={ch.pub.by} /> : '–'}</Td>
        <Td className="type-num">
          {ch.pub ? fmtDT(ch.pub.at) : <span className="text-mute">{t('Not recorded')}</span>}
        </Td>
        <Td>
          {ch.pub ? (
            ch.pub.basis === 'url' ? (
              <LinkOut label={t('Public link')} url={ch.pub.url} />
            ) : (
              <Chip def={['Attested, no link', 'info', 'ink2']} />
            )
          ) : ch.failed ? (
            <Chip def={['Failed, follow-up open', 'warning', 'danger']} />
          ) : (
            '–'
          )}
        </Td>
      </tr>
    </>
  );
}

function ReviewForm({ c, lv }: { c: Content; lv: ContentVersion }) {
  const who = useWho();
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('What must change')}
        htmlFor="mc-rv-why"
        required
        help={fe.help(
          'v',
          t('Linked to version {v}. A revision task goes to {who}.', { v: lv.v, who: who.first(c.executor) }),
        )}
        error={fe.bad('v')}
      >
        <textarea
          id="mc-rv-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!why.trim()) return fe.fail('v', t('Say what must change.'));
            void decideContent(c.id, 'revision', lv.v, why.trim());
          }}
        >
          {t('Request changes')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

function VersionForm({ c }: { c: Content }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const fe = useFieldErrors();
  const lv = cLatest(c);
  return (
    <Box>
      <Field label={t('What changed')} htmlFor="mc-v-label" required help={fe.help('label')} error={fe.bad('label')}>
        <input
          id="mc-v-label"
          className={cn(inputClass, fe.bad('label') && invalidClass)}
          value={label}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setLabel(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Link to this version')}
        htmlFor="mc-v-url"
        required
        help={fe.help('url', t('Canva, Drive or Docs. The link records which file was reviewed.'))}
        error={fe.bad('url')}
      >
        <input
          id="mc-v-url"
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
      {c.approvedV && (
        <p className="my-2 text-d13">
          <Icon name="warning" size="sm" />{' '}
          {t('Version {v} is approved. Sending a new version makes that approval stale until it is reviewed again.', {
            v: c.approvedV,
          })}
        </p>
      )}
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!label.trim()) return fe.fail('label', t('Say what changed.'));
            if (!safeUrl(url.trim())) return fe.fail('url', t('Paste the https link to this version.'));
            void sendContentVersion(c.id, { label: label.trim(), url: url.trim() });
          }}
        >
          {t('Send v{v} for review', { v: (lv?.v ?? 0) + 1 })}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function VersionsSection({ c }: { c: Content }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const lv = cLatest(c);
  const board = isBoardP(m);
  const canRev = c.stage === 'review' && mg(db, 'review', m?.id) && !!lv && lv.by !== m?.id && !board;
  const canVer =
    ['drafting', 'revision', 'review', 'approved', 'scheduled'].includes(c.stage) && c.executor === m?.id && !board;
  const decChip = (ver: ContentVersion, i: number) =>
    ver.decision ? (
      <Chip
        def={
          ver.decision.kind === 'approved'
            ? c.approvedV === ver.v
              ? ['Approved', 'check', 'green']
              : ['Approved earlier', 'check', 'mute']
            : ['Changes requested', 'undo', 'warn']
        }
        pill="pill"
      />
    ) : i === c.versions.length - 1 && c.stage === 'review' ? (
      <Chip def={['Waiting for review', 'clock', 'warn']} pill="pill" />
    ) : (
      <Chip def={['Not reviewed', 'minus', 'mute']} pill="pill" />
    );
  return (
    <>
      <SectionHeading as="h2" count={c.versions.length}>
        {t('Versions')}
      </SectionHeading>
      {stale(c) && lv && (
        <Notice icon="warning" tone="warn" className="mt-3 mb-3" title={<b>{t('Approval stale')}</b>}>
          <p>
            {t(
              'Version {a} was approved. Version {b} changed the content, so it needs its own review before it can be scheduled or published.',
              {
                a: c.approvedV ?? 0,
                b: lv.v,
              },
            )}
          </p>
        </Notice>
      )}
      {c.versions.length ? (
        <div className="flex flex-col gap-[3px]">
          {[...c.versions].reverse().map((ver, j) => {
            const i = c.versions.length - 1 - j;
            return (
              <div
                key={ver.v}
                className={cn(
                  'grid min-h-12 grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5 hover:bg-hover max-[760px]:grid-cols-[36px_1fr]',
                  i === c.versions.length - 1 && 'bg-sel-neutral',
                )}
              >
                <span className="font-mono text-[14px] font-semibold">v{ver.v}</span>
                <div className="min-w-0">
                  <b className="text-d14 font-bold">{ver.label}</b>
                  <small className="block text-d13 text-mute">
                    {who.name(ver.by)}, {fmtDT(ver.at)} ·{' '}
                    <a href={ver.url} target="_blank" rel="noopener noreferrer">
                      {t('Open')}
                    </a>
                  </small>
                  {ver.decision && (
                    <small className="block text-d13 text-mute">
                      {t('{who}, {d}', { who: who.name(ver.decision.by), d: fmtDT(ver.decision.at) })}
                      {ver.decision.reason && `: ${ver.decision.reason}`}
                    </small>
                  )}
                </div>
                {decChip(ver, i)}
              </div>
            );
          })}
        </div>
      ) : (
        <Note>{t('No version yet.')}</Note>
      )}
      {canRev ? (
        form === 'c-rev' ? (
          <ReviewForm c={c} lv={lv} />
        ) : (
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                void decideContent(c.id, 'approved', lv.v, '');
              }}
            >
              <Icon name="check" />
              {t('Approve v{v}', { v: lv.v })}
            </Button>
            <Button onClick={openForm('c-rev')}>{t('Request changes')}</Button>
          </Acts>
        )
      ) : (
        c.stage === 'review' &&
        mg(db, 'review', m?.id) &&
        lv?.by === m?.id && <Note>{t('You made this version, so another reviewer decides.')}</Note>
      )}
      {canVer &&
        (form === 'c-ver' ? (
          <VersionForm c={c} />
        ) : (
          <Acts>
            <Button
              variant={['drafting', 'revision'].includes(c.stage) ? 'primary' : 'default'}
              onClick={openForm('c-ver')}
            >
              <Icon name="upload" />
              {t('Send version {v}', { v: (lv?.v ?? 0) + 1 })}
            </Button>
          </Acts>
        ))}
    </>
  );
}

function PublishForm({ c, idx }: { c: Content; idx: number }) {
  const [basis, setBasis] = useState<'url' | 'attest'>('url');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowStamp().slice(11, 16));
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field label={t('Evidence')} htmlFor="mc-p-basis">
        <SelectField
          id="mc-p-basis"
          value={basis}
          onChange={(v) => {
            setBasis(v as 'url' | 'attest');
          }}
          options={[
            { value: 'url', label: t('Public link') },
            { value: 'attest', label: t('Attestation, no link (for example a story)') },
          ]}
        />
      </Field>
      <Field label={t('Public link')} htmlFor="mc-p-url" help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="mc-p-url"
          className={cn(inputClass, fe.bad('url') && invalidClass)}
          placeholder="https://"
          value={url}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setUrl(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Published on')} htmlFor="mc-p-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="mc-p-date"
            value={date}
            max={today()}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Time')} htmlFor="mc-p-time" required help={fe.help('time')} error={fe.bad('time')}>
          <input
            id="mc-p-time"
            className={cn(inputClass, fe.bad('time') && invalidClass)}
            value={time}
            inputMode="numeric"
            autoComplete="off"
            onChange={(e) => {
              setTime(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Field
        label={t('Note')}
        htmlFor="mc-p-note"
        help={fe.help('note', t('Required for an attestation: who saw it and where.'))}
        error={fe.bad('note')}
      >
        <input
          id="mc-p-note"
          className={cn(inputClass, fe.bad('note') && invalidClass)}
          value={note}
          autoComplete="off"
          onChange={(e) => {
            setNote(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (basis === 'url' && !safeUrl(url.trim()))
              return fe.fail('url', t('Paste the https link to the public post.'));
            if (basis === 'attest' && !note.trim()) return fe.fail('note', t('Say who saw it and where.'));
            if (!okDate(date) || !okTime(time) || `${date}T${time}` > nowStamp())
              return fe.fail('date', t('Use the actual publication time, not a future one.'));
            void recordPublication(c.id, idx, { basis, url: url.trim(), date, time, note: note.trim() });
          }}
        >
          {t('Record publication')}
        </Button>
        <Button onClick={openForm(`chf-${String(idx)}`)}>{t('It failed')}</Button>
        <Cancel />
      </Acts>
      <Note>{t('Records version {v}. The app never posts for you.', { v: c.approvedV ?? 0 })}</Note>
    </Box>
  );
}

function FailForm({ c, idx }: { c: Content; idx: number }) {
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field
        label={t('What went wrong')}
        htmlFor="mc-f-why"
        required
        help={fe.help('v', t('A follow-up task goes to the executor. Other channels keep their own state.'))}
        error={fe.bad('v')}
      >
        <textarea
          id="mc-f-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!why.trim()) return fe.fail('v', t('Say what went wrong.'));
            void recordFailure(c.id, idx, why.trim());
          }}
        >
          {t('Record failure')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function MoveForm({ c, idx }: { c: Content; idx: number }) {
  const ch = c.channels[idx];
  const [date, setDate] = useState(ch?.planned.slice(0, 10) ?? today());
  const [time, setTime] = useState(ch?.planned.slice(11, 16) ?? '19:00');
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field label={t('New planned date')} htmlFor="mc-d-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="mc-d-date"
            value={date}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Time')} htmlFor="mc-d-time" required>
          <input
            id="mc-d-time"
            className={inputClass}
            value={time}
            inputMode="numeric"
            autoComplete="off"
            onChange={(e) => {
              setTime(e.target.value);
            }}
          />
        </Field>
      </Grid2>
      <Field
        label={t('Reason')}
        htmlFor="mc-d-why"
        required
        help={fe.help('why', t('The executor and reviewer are told. Approval and history do not change.'))}
        error={fe.bad('why')}
      >
        <input
          id="mc-d-why"
          className={cn(inputClass, fe.bad('why') && invalidClass)}
          value={why}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!okDate(date) || !okTime(time)) return fe.fail('date', t('Choose a date and a time.'));
            if (!why.trim()) return fe.fail('why', t('Give the reason.'));
            void moveChannelDate(c.id, idx, { date, time, why: why.trim() });
          }}
        >
          {t('Move planned date')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function ChannelSection({ c }: { c: Content }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const pub = mg(db, 'publish', m?.id);
  const board = isBoardP(m);
  return (
    <>
      <SectionHeading as="h2" count={`${String(pubCount(c))}/${String(c.channels.length)}`}>
        {t('Publication by channel')}
      </SectionHeading>
      <Rows>
        {c.channels.map((ch, i) => (
          <div key={ch.ch}>
            <Row className="cursor-default flex-wrap gap-2.5">
              <RowText
                title={<b>{chName(ch.ch)}</b>}
                className="whitespace-normal"
                sub={
                  <>
                    {t('Planned {d}', { d: fmtDT(ch.planned) })}
                    {ch.pub && (
                      <>
                        {' · '}
                        {t('Published {d} by {who}', { d: fmtDT(ch.pub.at), who: who.first(ch.pub.by) })}
                        {ch.pub.v ? ` · v${String(ch.pub.v)}` : ''}
                        {ch.pub.note ? ` · ${ch.pub.note}` : ''}
                      </>
                    )}
                    {ch.failed && ` · ${t('Failed: {r}', { r: ch.failed.reason })}`}
                  </>
                }
              />
              {ch.pub ? (
                ch.pub.basis === 'url' ? (
                  <LinkOut label={t('Public link')} url={ch.pub.url} />
                ) : (
                  <Chip def={['Attested, no link', 'info', 'ink2']} pill="pill" />
                )
              ) : ch.failed ? (
                <Chip def={['Failed, follow-up open', 'warning', 'danger']} pill="pill" />
              ) : ch.planned.slice(0, 10) < today() ? (
                <Chip def={['Planned date passed, not published', 'warning', 'warn']} pill="pill" />
              ) : (
                <Chip def={['Not published', 'circle', 'mute']} pill="pill" />
              )}
              {!ch.pub && pub && !board && c.stage === 'scheduled' && (
                <Button small onClick={openForm(`ch-${String(i)}`)}>
                  {t('Record')}
                </Button>
              )}
              {!ch.pub &&
                pub &&
                !board &&
                ['approved', 'scheduled', 'review', 'drafting', 'idea', 'revision'].includes(c.stage) && (
                  <Button small variant="ghost" onClick={openForm(`chd-${String(i)}`)}>
                    {t('Move date')}
                  </Button>
                )}
            </Row>
            {form === `ch-${String(i)}` && <PublishForm c={c} idx={i} />}
            {form === `chf-${String(i)}` && <FailForm c={c} idx={i} />}
            {form === `chd-${String(i)}` && <MoveForm c={c} idx={i} />}
          </div>
        ))}
      </Rows>
      {c.stage === 'approved' && pub && !stale(c) && !board && (
        <>
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                void scheduleContent(c.id);
              }}
            >
              <Icon name="calendar" />
              {t('Schedule v{v}', { v: c.approvedV ?? 0 })}
            </Button>
          </Acts>
          <Note>{t('Scheduling records the plan. Nothing is posted by the app.')}</Note>
        </>
      )}
    </>
  );
}

function CorrectionForm({ id }: { id: string }) {
  const [why, setWhy] = useState('');
  const [url, setUrl] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('What was corrected or taken down, and why')}
        htmlFor="mc-k-why"
        required
        help={fe.help('why')}
        error={fe.bad('why')}
      >
        <textarea
          id="mc-k-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Evidence link')} htmlFor="mc-k-url" help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="mc-k-url"
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
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!why.trim()) return fe.fail('why', t('Say what changed and why.'));
            if (url.trim() && !safeUrl(url.trim())) return fe.fail('url', t('Links must start with https://.'));
            void recordCorrection(id, { why: why.trim(), url: url.trim() });
          }}
        >
          {t('Record correction')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

function CancelForm({ id }: { id: string }) {
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('Reason for canceling')}
        htmlFor="mc-x-why"
        required
        help={fe.help('why', t('Ends reminders and publication duties. History stays.'))}
        error={fe.bad('why')}
      >
        <textarea
          id="mc-x-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          value={why}
          autoFocus
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="danger"
          onClick={() => {
            if (!why.trim()) return fe.fail('why', t('Give a reason.'));
            void cancelContent(id, why.trim());
          }}
        >
          {t('Cancel content')}
        </Button>
        <Cancel label={t('Keep it')} />
      </Acts>
    </>
  );
}

export function ContentItemPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(MC);
  const c = ctOf(db, id);
  if (!c || !mcFull(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const s = mcitOf(db);
  const lv = cLatest(c);
  const board = isBoardP(m);
  const pubG = mg(db, 'publish', m?.id);
  const cmp = cmpOf(db, c.campaign);
  const first = who.first;
  const nextMap: Partial<Record<Content['stage'], [string | null, string]>> = {
    idea: [c.executor, t('{who} starts drafting.', { who: first(c.executor) })],
    drafting: [
      c.executor,
      t('{who} sends a version for review by {d}.', {
        who: first(c.executor),
        d: c.due ? dShort(c.due) : t('the internal due date'),
      }),
    ],
    review: [c.reviewer, t('{who} reviews version {v}.', { who: first(c.reviewer), v: lv?.v ?? 1 })],
    revision: [c.executor, t('{who} sends a new version.', { who: first(c.executor) })],
    approved: [s.grants.publish[0] ?? null, t('Schedule the approved version.')],
    scheduled: [s.grants.publish[0] ?? null, t('Publish on each channel outside the app, then record it here.')],
    published: [null, t('Published on every channel.')],
    cancelled: [null, t('Canceled. The history stays.')],
    archived: [null, t('Archived.')],
  };
  const next = nextMap[c.stage] ?? [null, ''];
  const task = c.task ? taskOf(db, c.task) : undefined;
  const brief = c.fromBrief ? brOf(db, c.fromBrief) : undefined;
  const stepIdx = { idea: 0, drafting: 1, review: 2, revision: 1, approved: 3, scheduled: 4, published: 6 }[
    c.stage as 'idea'
  ] as number | undefined;
  const canCancel =
    !['published', 'cancelled', 'archived'].includes(c.stage) &&
    (mcLead(m) || c.createdBy === m?.id || mg(db, 'review', m?.id)) &&
    !board;
  return (
    <Page>
      <PageHeader title={c.title} sub={`${c.kind}${cmp ? ` · ${cmp.name}` : ` · ${t('No campaign')}`}`}>
        {stale(c) && <Chip def={['Approval stale', 'warning', 'danger']} pill="pill-o" />}
        <Chip def={CST[c.stage]} pill="pill-o" />
      </PageHeader>
      {CORDER.includes(c.stage) && (
        <Steps
          className="mt-4 mb-1.5 max-w-[760px]"
          labels={[t('Idea'), t('Drafting'), t('In review'), t('Approved'), t('Scheduled'), t('Published')]}
          current={stepIdx ?? 0}
        />
      )}
      <NextBox who={next[0]} text={next[1]} />
      {c.cancel && (
        <Notice icon="close" className="mt-3 mb-3" title={<b>{t('Canceled')}</b>}>
          <p>{t('{who}: {r}', { who: who.name(c.cancel.by), r: c.cancel.reason })}</p>
        </Notice>
      )}
      <DatesTable c={c} />
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={c.createdBy} at={c.createdAt} />
        </MetaRow>
        <MetaRow label={t('Executor')}>
          <Who id={c.executor} />
        </MetaRow>
        <MetaRow label={t('Reviewer')}>
          <Who id={c.reviewer} />
        </MetaRow>
        <MetaRow label={t('Campaign')}>{cmp ? cmp.name : <span className="text-mute">{t('None')}</span>}</MetaRow>
        {task && (
          <MetaRow label={t('Task')}>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-left text-d13h text-ink underline decoration-line-strong underline-offset-2"
              onClick={() => {
                openTask(task.id);
              }}
            >
              {task.title}
            </button>{' '}
            <TaskStatusMark status={task.status} />
          </MetaRow>
        )}
        {c.brief && (
          <MetaRow label={t('Brief')}>
            <span className="whitespace-pre-line">{c.brief}</span>
          </MetaRow>
        )}
        {brief && (
          <MetaRow label={t('Requested in')}>
            <Link to={`/it-requests/${brief.id}`}>{brief.title}</Link>
          </MetaRow>
        )}
        <MetaRow label={t('Assets')}>
          {c.assets.length ? (
            <Links>
              {c.assets.map((a) => (
                <LinkOut key={a.url} label={a.label} url={a.url} />
              ))}
            </Links>
          ) : (
            <span className="text-mute">{t('None linked')}</span>
          )}
        </MetaRow>
      </Meta>
      {c.stage === 'idea' && (c.executor === m?.id || mcLead(m)) && !board && (
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              void startContent(c.id);
            }}
          >
            {t('Start drafting')}
          </Button>
        </Acts>
      )}
      <VersionsSection c={c} />
      <ChannelSection c={c} />
      {(c.corrections.length > 0 || (pubCount(c) > 0 && pubG && !board)) && (
        <>
          <SectionHeading as="h2" count={c.corrections.length}>
            {t('Corrections and takedowns')}
          </SectionHeading>
          {c.corrections.map((k) => (
            <Box key={k.at}>
              <p className="text-d13 text-mute">
                <ByAt id={k.by} at={k.at} />
              </p>
              <p className="whitespace-pre-line">{k.reason}</p>
              {k.url && <LinkOut label={t('Evidence')} url={k.url} />}
            </Box>
          ))}
          {pubCount(c) > 0 &&
            pubG &&
            !board &&
            (form === 'c-corr' ? (
              <CorrectionForm id={c.id} />
            ) : (
              <Acts>
                <Button variant="ghost" onClick={openForm('c-corr')}>
                  {t('Record a correction or takedown')}
                </Button>
              </Acts>
            ))}
        </>
      )}
      <SectionHeading as="h2" count={c.history.length}>
        {t('History')}
      </SectionHeading>
      <HistoryList rows={c.history} />
      {canCancel &&
        (form === 'c-cancel' ? (
          <CancelForm id={c.id} />
        ) : (
          <Acts className="mt-7">
            <Button variant="ghost" onClick={openForm('c-cancel')}>
              {t('Cancel content')}
            </Button>
          </Acts>
        ))}
    </Page>
  );
}
