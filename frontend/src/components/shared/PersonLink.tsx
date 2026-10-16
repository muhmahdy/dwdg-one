/* A person as a compact button that opens the person panel (D33): the avatar and a first or full name. */
import { Avatar } from '@/components/shared/Avatar';
import { openPerson } from '@/lib/open';
import { useWho } from '@/lib/people';
import type { PersonId } from '@/types/workspace';

export function PersonLink({ id, full = false }: { id: PersonId | null | undefined; full?: boolean }) {
  const who = useWho();
  if (!id) return <span className="text-mute">-</span>;
  return (
    <button
      type="button"
      className="inline-flex min-h-[26px] cursor-pointer items-center gap-1.5 rounded-chip border-0 bg-transparent py-0 pr-1.5 pl-0 font-[inherit] font-[550] whitespace-nowrap text-ink hover:bg-hover"
      onClick={() => {
        openPerson(id);
      }}
    >
      <Avatar id={id} size={full ? 'sm' : 'xs'} />
      <span>{full ? who.name(id) : who.first(id)}</span>
    </button>
  );
}
