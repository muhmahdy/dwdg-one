/* Shown in place of a division's own feature until the Marcomit team switches that division on. */
import { divisionOf } from '@/app/config/org';
import { Icon } from '@/components/ui/Icon';
import { t } from '@/lib/i18n';
import type { DivisionId } from '@/types/workspace';

export function DivisionLocked({ d }: { d: DivisionId }) {
  const name = divisionOf(d)?.name;
  return (
    <div className="grid min-h-[60dvh] place-items-center p-8" role="status" data-testid="division-locked">
      <div className="max-w-md text-center">
        <Icon name="lock" className="mx-auto mb-3 !size-8 text-mute" />
        <p className="font-mono text-6xl leading-none font-semibold text-ink">205</p>
        {name && <h1 className="mt-4 type-title">{name}</h1>}
        <p className="mt-3 text-mute">
          {t(
            'Please contact the Marcomit team to unlock the full features of each division in dwdg. Core features stay available.',
          )}
        </p>
      </div>
    </div>
  );
}
