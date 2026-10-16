/* The Operations page: the board, one operation, or the builder, by route. */
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { MENUS, MenuItem, closeMenu } from '@/components/shared/menus';
import { Icon } from '@/components/ui/Icon';
import { t } from '@/lib/i18n';
import { useWorkspace, useWs } from '@/lib/workspace/hooks';
import { deleteRoutine } from '../services/routine-actions';
import { OperationBoard } from './OperationBoard';
import { OperationDetail } from './OperationDetail';
import { RoutineBuilder } from './RoutineBuilder';

export const OperationsCrumb = ({ route }: { route: Route }) => {
  const ws = useWs();
  const r = useWorkspace((db) => db.routines?.find((x) => x.id === route.id));
  const short = divisionOf(ws)?.short;
  const sep = <i className="mx-1.5 text-faint not-italic">/</i>;
  if (route.id === 'new')
    return (
      <>
        {short}
        {sep}
        <Link to="/operations" className="no-underline">
          {t('Operations')}
        </Link>
        {sep}
        <b>{route.sub === 'personal' ? t('New repeating task') : t('New routine')}</b>
      </>
    );
  if (route.id)
    return (
      <>
        {short}
        {sep}
        <Link to="/operations" className="no-underline">
          {t('Operations')}
        </Link>
        {sep}
        <b>{r?.name ?? ''}</b>
      </>
    );
  return (
    <>
      {short}
      {sep}
      <b>{t('Operations')}</b>
    </>
  );
};

export function OperationsPage({ route }: { route: Route }) {
  if (route.id === 'new') return <RoutineBuilder id={null} sub={route.sub} />;
  if (route.id && route.sub === 'edit') return <RoutineBuilder id={route.id} />;
  if (route.id) return <OperationDetail id={route.id} />;
  return <OperationBoard />;
}

function MoreMenu({ menu }: { menu: { id?: string | undefined } }) {
  return (
    <MenuItem
      icon={<Icon name="trash" />}
      className="text-danger [&_.ic]:text-danger"
      onSelect={() => {
        closeMenu();
        void deleteRoutine(menu.id ?? '');
      }}
    >
      {t('Delete routine')}
    </MenuItem>
  );
}
MENUS.opmore = MoreMenu;
