/* Quick add (work_task_fields): type a task, @ to mention someone, an optional day word and time; the Due date chip opens the
   native date picker. A live line shows what was understood. The creator stays responsible. From screens/work.js. */
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { PeoplePicker, usePeoplePicker } from '@/components/shared/PeoplePicker';
import { Button } from '@/components/ui/Button';
import { DateGlyph } from '@/components/ui/DateGlyph';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { dLong, mins } from '@/lib/time';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import { parseQuick } from '../services/quick-add';
import { quickAddTask } from '../services/task-actions';

export function QuickAdd({
  inCard,
  project,
  milestone,
}: {
  inCard: boolean;
  project?: string | null;
  milestone?: string | null;
}) {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const db = useWorkspace((d) => d);
  const focusAsk = useUi((u) => u.focusQuickAdd);
  const q = parseQuick(db, text);
  const picker = usePeoplePicker(q.mentions, (id) => {
    const el = input.current;
    const p = db.people.find((x) => x.id === id);
    if (!el || !p) return;
    const pos = el.selectionStart ?? text.length;
    const before = text.slice(0, pos).replace(/@([A-Za-z]*)$/, `@${p.first} `);
    const next = before + text.slice(pos);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  });

  useEffect(() => {
    if (focusAsk) input.current?.focus();
  }, [focusAsk]);

  const onInput = (value: string, caret: number) => {
    setText(value);
    const at = /@([A-Za-z]*)$/.exec(value.slice(0, caret));
    if (at) picker.open(at[1] ?? '');
    else picker.close();
  };

  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!q.title.trim()) return;
    void quickAddTask(text, due || null, { project: project ?? null, milestone: milestone ?? null }).then((ok) => {
      if (!ok) return;
      setText('');
      setDue('');
      input.current?.focus();
    });
  };

  const showParsed = !picker.st.closed ? false : q.mentions.length > 0 || !!q.due || q.time != null;
  return (
    <>
      <form
        className={cn(
          'mt-[18px] flex h-11 items-center gap-2 rounded-[10px] bg-surface-2 pr-1.5 pl-3 text-mute phone:max-w-full phone:min-w-0',
          'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
          inCard && 'm-0 h-[54px] rounded-none bg-transparent pr-3 pl-4 shadow-[inset_0_-1px_0_var(--line)]',
        )}
        autoComplete="off"
        onSubmit={submit}
      >
        <span className={cn('grid place-items-center [&_.ic]:size-[18px]', inCard && 'text-green-ink')}>
          <Icon name="plus" />
        </span>
        <input
          ref={input}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-ink outline-none type-body placeholder:text-mute focus-visible:outline-none max-[760px]:text-[16px] max-[760px]:leading-6"
          name="title"
          value={text}
          placeholder={
            window.innerWidth < 760
              ? t('Add a task, @ to mention')
              : t('Add a task, for example: Sync with @Salsa Fri 14:00')
          }
          aria-label={t('Task title')}
          onChange={(e) => {
            onInput(e.target.value, e.target.selectionStart ?? e.target.value.length);
          }}
          onKeyDown={(e) => {
            if (picker.onKeyDown(e)) return;
          }}
        />
        <span className="relative inline-flex flex-none">
          <Button
            variant="ghost"
            small
            className={cn(
              'font-medium text-mute max-[760px]:px-2',
              due && 'bg-surface text-ink shadow-[0_0_0_1px_var(--line-strong)]',
            )}
            onClick={() => {
              const el = dateInput.current;
              if (!el) return;
              try {
                el.showPicker();
              } catch {
                el.focus();
              }
            }}
          >
            <DateGlyph kind="due" className="size-4" />
            <span className={cn('max-[760px]:hidden phone:hidden', due && 'max-[760px]:inline')}>
              {due ? dLong(due) : t('Due date')}
            </span>
          </Button>
          <input
            ref={dateInput}
            type="date"
            className="pointer-events-none absolute bottom-0 left-0 size-px opacity-0"
            name="due"
            tabIndex={-1}
            aria-label={t('Due date, optional')}
            value={due}
            onChange={(e) => {
              setDue(e.target.value);
            }}
          />
        </span>
        <Button small type="submit">
          {t('Add')}
        </Button>
      </form>
      <div className={cn('relative mt-1.5 empty:hidden', inCard && 'px-4')} aria-live="polite">
        <PeoplePicker view={picker.view} />
        {showParsed && (
          <div className="m-0 flex flex-wrap items-center gap-1.5 px-0.5">
            {q.mentions.map((id) => (
              <span
                key={id}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-round bg-fill pr-2.5 pl-1 text-d12h font-[550]"
              >
                <Avatar id={id} size="xs" />
                {db.people.find((p) => p.id === id)?.first}
              </span>
            ))}
            {q.due && (
              <span className="inline-flex h-[26px] items-center rounded-round bg-fill px-2.5 text-d12h font-[550]">
                {dLong(q.due)}
              </span>
            )}
            {q.time != null && (
              <span className="inline-flex h-[26px] items-center rounded-round bg-fill px-2.5 text-d12h font-[550]">
                {mins(q.time)}
              </span>
            )}
            {q.mentions.length > 0 && (
              <span className="text-mute type-small">
                {t('Mentioned people see who it is about. You stay responsible.')}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
