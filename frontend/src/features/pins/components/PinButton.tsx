/* The Pin button on a project, program, operation or resource page: pins it to your own sidebar list (D59). */
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Pin } from '@/types/workspace';
import { isPinned, togglePin } from '../services/pins';

export function PinButton({ kind, id }: { kind: Pin['k']; id: string }) {
  const me = useMe();
  const on = useWorkspace((db) => (me ? isPinned(db, me, kind, id) : false));
  if (!me) return null;
  return (
    <Button
      small
      aria-pressed={on}
      className={cn(on && 'text-ink shadow-[0_0_0_1px_var(--ink)]')}
      onClick={() => {
        void togglePin(me, kind, id);
      }}
    >
      <Icon name="pin" />
      {on ? t('Pinned') : t('Pin')}
    </Button>
  );
}
