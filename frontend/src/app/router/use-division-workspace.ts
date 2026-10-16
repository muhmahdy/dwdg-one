/* Opening a division tool switches the sidebar to that workspace when the viewer can see it (design-navigation: capabilities
   sit in their workspace). */
import { useEffect } from 'react';
import { visibleDivs } from '@/lib/access';
import { sessionStore, setSession } from '@/lib/session';
import { useMe } from '@/lib/workspace/hooks';
import type { DivisionId } from '@/types/workspace';

export function useDivisionWorkspace(d: DivisionId) {
  const me = useMe();
  useEffect(() => {
    if (me && visibleDivs(me).includes(d) && sessionStore.get().ws !== d) setSession({ ws: d });
  }, [me, d]);
}
