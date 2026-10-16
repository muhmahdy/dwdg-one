/* A task title with its mentioned people inline: photo and name (owner request, 6 Oct; R001/R002). A mention never assigns
   the task. From screens/work.js taskTitle. */
import type { ReactNode } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { cn } from '@/lib/cn';
import { useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { PersonId, Task } from '@/types/workspace';

export const openPerson = (id: PersonId) => {
  setUi((u) => {
    u.palette = false;
    u.menu = null;
    u.form = null;
    u.insp = { type: 'person', id };
  });
};

export function PersonMention({ id, first, className }: { id: PersonId; first: string; className?: string }) {
  return (
    <a
      className={cn(
        'mx-px inline-flex h-[21px] cursor-pointer items-center gap-1.5 align-top font-semibold text-ink no-underline hover:underline',
        'comfortable:[&_.av]:mt-px comfortable:[&_.av]:size-[22px] comfortable:[&_.av]:text-[10px]',
        className,
      )}
      data-mention
      onClick={(e) => {
        e.stopPropagation();
        openPerson(id);
      }}
    >
      <Avatar id={id} size="xs" className="align-[-5px]" />
      {first}
    </a>
  );
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits the title so each mentioned person's first name (first occurrence, as a whole word) becomes a chip. */
export function TaskTitle({
  task,
  noIcon = false,
  mentionClass,
}: {
  task: Task;
  noIcon?: boolean;
  mentionClass?: string;
}) {
  const people = useWorkspace((db) => task.mentions.map((id) => db.people.find((p) => p.id === id)).filter((p) => !!p));
  let parts: (string | { id: PersonId; first: string })[] = [task.title];
  for (const p of people) {
    const re = new RegExp(`(^|[^\\w])${escapeRe(p.first)}(?![\\w])`);
    const i = parts.findIndex((x) => typeof x === 'string' && re.test(x));
    if (i < 0) continue;
    const s = parts[i] as string;
    const m = re.exec(s);
    if (!m) continue;
    const start = m.index + (m[1]?.length ?? 0);
    parts = [
      ...parts.slice(0, i),
      s.slice(0, start),
      { id: p.id, first: p.first },
      s.slice(start + p.first.length),
      ...parts.slice(i + 1),
    ];
  }
  const nodes: ReactNode[] = parts.map((x, i) =>
    typeof x === 'string' ? (
      x
    ) : (
      <PersonMention key={`${x.id}-${i}`} id={x.id} first={x.first} className={mentionClass} />
    ),
  );
  return (
    <>
      {!noIcon && <TaskIcon icon={task.icon} size="xs" />}
      {nodes}
    </>
  );
}
