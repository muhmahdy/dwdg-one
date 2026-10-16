/* The side panel (design-inspector, measure-inspector): one panel per record type, registered by each feature (the
   prototype's INSP table). Escape or the close button closes it; focus moves into it when it opens. */
import { useLayoutEffect, useRef, type ComponentType, type ReactNode } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { Icon } from '@/components/ui/Icon';
import { t } from '@/lib/i18n';
import { useUi } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';

export const PANELS: Record<string, ComponentType<{ insp: InspectorRef }>> = {};

export const closeInspector = () => {
  setUi((u) => {
    u.insp = null;
    u.form = null;
  });
};

/** The panel header: a quiet label and the close button. */
export function InspectorHead({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 text-d12h font-medium text-mute">
      <span className="mr-auto">{children}</span>
      <button
        type="button"
        className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
        aria-label={t('Close')}
        onClick={closeInspector}
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

export function Inspector() {
  const insp = useUi((u) => u.insp);
  const ref = useRef<HTMLDivElement>(null);
  const key = insp ? `${insp.type}:${insp.id ?? ''}` : '';
  useLayoutEffect(() => {
    if (!key) return;
    const first = ref.current?.querySelector<HTMLElement>(
      'button:not(:disabled),a[href],input:not(:disabled),textarea,select,[tabindex]:not([tabindex="-1"])',
    );
    first?.focus({ preventScroll: true });
  }, [key]);
  if (!insp) return null;
  const Panel = PANELS[insp.type];
  return (
    <div
      ref={ref}
      className="px-[22px] pt-[18px] pb-7 roomy:px-6 roomy:pt-5 roomy:pb-8"
      onKeyDown={(e) => {
        if (e.key === 'Escape') closeInspector();
      }}
    >
      {Panel ? (
        <Panel key={key} insp={insp} />
      ) : (
        <>
          <InspectorHead>{insp.type}</InspectorHead>
          <p className="mt-3 text-mute" data-testid="migration-pending">
            Not migrated yet: panel <code>{insp.type}</code>.
          </p>
        </>
      )}
    </div>
  );
}
