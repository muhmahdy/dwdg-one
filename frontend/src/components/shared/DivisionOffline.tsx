/* Shown in place of a division's page when the server could not reach that division's project (`bff` data mode only). */
import { divisionOf } from '@/app/config/org';
import { t } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { divisionStatusStore } from '@/lib/workspace/division-status';
import type { DivisionId } from '@/types/workspace';

export function DivisionOffline({ d }: { d: DivisionId }) {
  const status = useStore(divisionStatusStore, (s) => s[d]);
  return (
    <div className="p-8" role="status" data-testid="division-offline">
      <h1 className="type-title">{divisionOf(d)?.name}</h1>
      <p className="mt-2 text-mute">
        {status === 'unavailable'
          ? t('This division cannot be reached right now. Try again in a few minutes.')
          : t('This division is not connected yet. Its records will appear here once it is switched on.')}
      </p>
    </div>
  );
}
