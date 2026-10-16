/* Hand in and assess (owner, 11 Oct, D58), the way Google Classroom works: the doer hands in links and a message, the giver
   rates and accepts or returns with a comment. The box at the top of the task panel. From screens/handin.js hiBox. */
import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { Field, textareaClass, inputClass } from '@/components/ui/forms';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { ago } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import type { Task } from '@/types/workspace';
import { isDone } from '../../services/selectors';
import {
  canSignOff,
  isHandIn,
  lastSub,
  linkLabel,
  needsHandIn,
  RATING,
  RATING_ORDER,
  signerFor,
  subsOf,
  type Rating,
  type Submission,
} from '../../services/signoff';
import { assessHandIn, handIn, unsubmit } from '../../services/task-actions';

const box =
  'mt-3.5 mb-1.5 grid gap-2.5 rounded-[14px] bg-surface-2 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--line)] roomy:rounded-2xl roomy:p-4 [&_.field]:m-0';
const note = 'm-0 rounded-[10px] bg-surface px-3 py-2.5 whitespace-pre-line text-ink-2';
const rateChip = (k: Rating | null | undefined) =>
  k ? <State label={t(RATING[k][0])} icon={RATING[k][1]} tone={RATING[k][2]} /> : null;

const Head = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2 [&_b]:font-semibold [&_small]:text-d13 [&_small]:text-mute">
    {children}
  </div>
);

function LinkRow({ url, label }: { url: string; label?: string }) {
  return (
    <a
      className="flex min-h-12 items-center gap-2.5 rounded-[10px] bg-surface px-3 py-1.5 text-ink no-underline shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--line-strong)] roomy:rounded-xl"
      href={url}
      target="_blank"
      rel="noopener"
    >
      <Icon name="link" size="sm" className="size-[18px] flex-none text-green-ink" />
      <span className="grid min-w-0 flex-1">
        <b className="text-[14px] font-semibold">{label ?? linkLabel(url)}</b>
        <small className="truncate text-[13px] text-mute">{url.replace(/^https:\/\//, '')}</small>
      </span>
      <Icon name="external" size="sm" className="flex-none text-mute" />
    </a>
  );
}

function SubmissionBody({ s }: { s: Submission }) {
  return (
    <>
      {s.links.length ? (
        <div className="grid gap-1.5">
          {s.links.map((l) => (
            <LinkRow key={l.url} url={l.url} label={l.label} />
          ))}
        </div>
      ) : (
        <p className="my-3.5 text-mute type-small">{t('No work was attached.')}</p>
      )}
      {s.note && <p className={note}>{s.note}</p>}
    </>
  );
}

/** Earlier attempts: every assessed hand-in except the one already shown above. */
function History({ task }: { task: Task }) {
  const who = useWho();
  const cur = lastSub(task);
  const past = subsOf(task).filter((s) => s.review && s !== cur);
  if (!past.length) return null;
  return (
    <details>
      <summary className="cursor-pointer text-[14px] font-medium text-mute">
        {plural(past.length, '{n} earlier attempt', '{n} earlier attempts')}
      </summary>
      {past.map((s, i) => (
        <div key={s.id} className="mt-2.5 grid gap-1.5 border-t border-line pt-2.5">
          <div className="flex items-baseline gap-2">
            <b>{t('Attempt {n}', { n: i + 1 })}</b>
            <small className="text-mute">{who.stamp(s.by, s.at)}</small>
          </div>
          <SubmissionBody s={s} />
          {s.review && (
            <p className="my-3.5 type-small">
              <b>
                {t(s.review.result === 'accepted' ? 'Accepted by {who}' : 'Returned by {who}', {
                  who: who.first(s.review.by),
                })}
              </b>
              {s.review.comment ? `: ${s.review.comment}` : ''}
            </p>
          )}
        </div>
      ))}
    </details>
  );
}

interface Draft {
  links: string[];
  note: string;
  rating: Rating | null;
  comment: string;
  err: string;
  confirm: boolean;
}

/** The box at the top of the task panel. Empty when the task is not handed in to anyone. Key it by task id. */
export function HandInBox({ task }: { task: Task }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const focusFirst = useUi((u) => !!u.insp?.focusHandIn);
  const [d, setD] = useState<Draft>({ links: [''], note: '', rating: null, comment: '', err: '', confirm: false });
  const patch = (p: Partial<Draft>) => {
    setD((x) => ({ ...x, ...p }));
  };
  if (!me || !isHandIn(db, task)) return null;
  const mine = task.owner === me.id;
  const cur = lastSub(task);
  const giver = task.reviewer ?? signerFor(db, task);
  const giverName = who.first(giver);

  // Handed in, waiting for the giver
  if (task.status === 'review' && cur && !cur.review) {
    if (mine)
      return (
        <section className={box}>
          <Head>
            <State label={t('Handed in')} icon="check" tone="green" />
            <small>{t('To {who}, {when}', { who: giverName, when: ago(cur.at) })}</small>
          </Head>
          <SubmissionBody s={cur} />
          <div className="flex flex-wrap gap-2">
            <Button small onClick={() => void unsubmit(task.id)}>
              {t('Unsubmit')}
            </Button>
          </div>
          <p className="my-3.5 text-mute type-small">
            {t('{who} checks your work and accepts it or returns it with a comment.', { who: giverName })}
          </p>
          <History task={task} />
        </section>
      );
    if (canSignOff(db, me, task)) {
      const accept = () => {
        const r = assessHandIn(task.id, true, d.rating, d.comment);
        if (typeof r === 'string') patch({ err: r });
      };
      const giveBack = () => {
        if (!d.comment.trim()) {
          patch({ err: t('Say what needs to change, so {who} knows what to do.', { who: who.first(task.owner) }) });
          return;
        }
        void assessHandIn(task.id, false, null, d.comment);
      };
      return (
        <section className={box}>
          <Head>
            <Avatar id={task.owner} size="sm" />
            <b>{t('{who} handed in their work', { who: who.first(task.owner) })}</b>
            <small>{ago(cur.at)}</small>
          </Head>
          <SubmissionBody s={cur} />
          <Field label={t('How good is it?')}>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('Rating')}>
              {RATING_ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={d.rating === k}
                  className={cn(
                    'h-[38px] min-w-0 flex-1 cursor-pointer rounded-[19px] border-0 bg-surface px-2 shadow-[0_0_0_1px_var(--line-strong)] [&>span]:justify-center',
                    d.rating === k && 'shadow-[0_0_0_2px_var(--ink)]',
                  )}
                  onClick={() => {
                    patch({ rating: k, err: '' });
                  }}
                >
                  {rateChip(k)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('Comment')} htmlFor="hi-comment" optional={t('Needed when you return it')}>
            <textarea
              id="hi-comment"
              className={cn(textareaClass, 'min-h-16')}
              value={d.comment}
              onChange={(e) => {
                patch({ comment: e.target.value });
              }}
            />
          </Field>
          {d.err && (
            <p className="m-0 text-[14px] font-medium text-danger" role="alert">
              {d.err}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={accept}>
              <Icon name="check" />
              {t('Accept')}
            </Button>
            <Button onClick={giveBack}>{t('Return')}</Button>
          </div>
          <History task={task} />
        </section>
      );
    }
    return (
      <section className={box}>
        <Head>
          <State label={t('Handed in')} icon="check" tone="green" />
          <small>{t('Waiting for {who} to assess', { who: giverName })}</small>
        </Head>
        <SubmissionBody s={cur} />
      </section>
    );
  }

  // Accepted
  if (isDone(task) && cur?.review?.result === 'accepted')
    return (
      <section className={cn(box)}>
        <Head>
          <b>{t('Accepted, rated')}</b>
          {rateChip(cur.review.rating)}
          <small>{who.stamp(cur.review.by, cur.review.at)}</small>
        </Head>
        {cur.review.comment && <p className={note}>{cur.review.comment}</p>}
        <SubmissionBody s={cur} />
        <History task={task} />
      </section>
    );
  if (isDone(task)) return null;

  // Open: returned work first, then the hand-in form for the doer
  const back =
    cur?.review?.result === 'returned' ? (
      <div className="flex gap-2.5 rounded-[10px] bg-surface px-3 py-2.5">
        <Icon name="undo" size="sm" className="mt-0.5 size-[18px] flex-none text-warning-mark" />
        <div>
          <b className="block">{t('Returned by {who}', { who: who.first(cur.review.by) })}</b>
          <p className="mt-0.5 mb-0 whitespace-pre-line text-ink-2">{cur.review.comment}</p>
        </div>
      </div>
    ) : null;
  if (!mine || !needsHandIn(db, me, task))
    return back || subsOf(task).length ? (
      <section className={box}>
        {back}
        <p className="my-3.5 text-mute type-small">{t('Not handed in yet.')}</p>
        <History task={task} />
      </section>
    ) : (
      <section className={box}>
        <p className="my-3.5 text-mute type-small">
          {t('{who} hands this in when it is done.', { who: who.first(task.owner) })}
        </p>
      </section>
    );

  const send = (force: boolean) => {
    const r = handIn(task.id, { links: d.links, note: d.note }, force);
    if (r === 'confirm') patch({ confirm: true, err: '' });
    else if (typeof r === 'string') patch({ err: r });
  };
  return (
    <section className={box}>
      {back}
      <Head>
        <b>{t('Your work')}</b>
        <small>{t('Hand it in to {who}', { who: giverName })}</small>
      </Head>
      {d.links.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Icon name="link" size="sm" className="size-[18px] flex-none text-mute" />
          <input
            className={cn(inputClass, 'min-w-0 flex-1')}
            type="url"
            data-input="hi-link"
            autoFocus={focusFirst && i === 0}
            placeholder={t('Paste a link, for example a Google Doc')}
            aria-label={t('Link to your work')}
            value={v}
            onChange={(e) => {
              patch({ links: d.links.map((x, j) => (j === i ? e.target.value : x)), err: '' });
            }}
          />
          {d.links.length > 1 && (
            <button
              type="button"
              className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
              aria-label={t('Remove this link')}
              onClick={() => {
                patch({ links: d.links.filter((_, j) => j !== i) });
              }}
            >
              <Icon name="close" size="sm" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1 justify-self-start border-0 bg-transparent px-0 py-0.5 text-d13 font-semibold text-green-ink"
        onClick={() => {
          patch({ links: [...d.links, ''] });
        }}
      >
        <Icon name="plus" size="xs" /> {t('Add another link')}
      </button>
      <Field label={t('Message to {who}', { who: giverName })} htmlFor="hi-note" optional>
        <textarea
          id="hi-note"
          className={cn(textareaClass, 'min-h-16')}
          value={d.note}
          onChange={(e) => {
            patch({ note: e.target.value });
          }}
        />
      </Field>
      {d.err && (
        <p className="m-0 text-[14px] font-medium text-danger" role="alert">
          {d.err}
        </p>
      )}
      {d.confirm ? (
        <div className="rounded-[10px] bg-surface px-3 py-2.5">
          <p className="mx-0 mt-0 mb-2 font-medium">{t('Hand in without attaching your work?')}</p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              small
              onClick={() => {
                send(true);
              }}
            >
              {t('Hand in anyway')}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                patch({ confirm: false });
              }}
            >
              {t('Add a link')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => {
              send(false);
            }}
          >
            <Icon name="upload" />
            {t('Hand in to {who}', { who: giverName })}
          </Button>
        </div>
      )}
      <History task={task} />
    </section>
  );
}
