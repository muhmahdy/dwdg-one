/* Pinned (owner, 11 Oct, D59): each person's short list of items they come back to, shown in the sidebar with each item's
   own art (reference R012's saved views). Port of screens/pins.js; the list starts from the person's current work. */
import { Link } from 'react-router';
import { useRoute } from '@/app/router/routes';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { shallow } from '@/lib/store';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { visiblePins, type ResolvedPin } from '../services/pins';

export function PinnedLinks({ linkClass, onClass }: { linkClass: string; onClass: string }) {
  const me = useMe();
  const route = useRoute();
  const pins = useWorkspace(
    (db) => (me ? visiblePins(db, me).slice(0, 8) : []),
    (a, b) => shallow(a.map(pinKey), b.map(pinKey)),
  );
  if (!pins.length)
    return <p className="mx-2.5 mt-0.5 mb-1.5 text-d13 text-mute">{t('Pin anything from its page.')}</p>;
  return pins.map((p) => {
    const on =
      (p.k === 'project' && route.page === 'projects') ||
      (p.k === 'program' && route.page === 'programs') ||
      (p.k === 'routine' && route.page === 'operations');
    const cls = cn(linkClass, on && route.id === p.id && onClass);
    const key = `${p.k}|${p.id}`;
    if (p.k === 'res')
      return (
        <a
          key={key}
          href="/resources"
          className={cls}
          data-pin-link={key}
          onClick={(e) => {
            e.preventDefault();
            setUi((u) => void (u.insp = { type: 'res', id: p.id }));
          }}
        >
          <span className="w-[22px] flex-none" />
          <span className="min-w-0 flex-1 truncate">{p.name}</span>
        </a>
      );
    return (
      <Link key={key} to={p.href} className={cls} data-pin-link={key}>
        <span className="w-[22px] flex-none" />
        <span className="min-w-0 flex-1 truncate">{p.name}</span>
      </Link>
    );
  });
}

const pinKey = (p: ResolvedPin) => `${p.k}|${p.id}|${p.name}`;
