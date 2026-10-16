/* The three checks of the ready-for-invoice gate (legal_bast_gate): PKS signed, BAST signed, delivery evidence checked. Each is
   read from its own record, never from a percentage. Shown on the BAST request and on the incoming term. */
import { Link } from 'react-router';
import { Chip } from '@/components/shared/division-ui';
import { t } from '@/lib/i18n';
import { useWorkspace } from '@/lib/workspace/hooks';
import { LST, gateOf, type LegalRequest } from '../services/fnl-data';
import { ByAt, LinkOut } from './fnl-parts';

export function GateChecks({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const gate = gateOf(db, x);
  const items = [
    {
      ok: gate.pksOk,
      label: t('PKS signed by every party'),
      sub: gate.pks ? (
        <>
          <Link to={`/fnl-requests/${gate.pks.id}`}>{gate.pks.title}</Link> <Chip def={LST[gate.pks.stage]} />
        </>
      ) : (
        <span className="text-mute">{t('No PKS linked')}</span>
      ),
    },
    { ok: gate.bastOk, label: t('BAST signed by every party'), sub: <Chip def={LST[x.stage]} /> },
    {
      ok: !!gate.del,
      label: t('Delivery evidence checked by Legal'),
      sub: gate.del ? (
        <>
          <LinkOut label={t('Delivery evidence')} url={gate.del.url} /> <ByAt id={gate.del.by} at={gate.del.at} />
        </>
      ) : (
        <span className="text-mute">{t('Not checked yet')}</span>
      ),
    },
  ];
  return (
    <div className="grid max-w-[760px] gap-[3px]">
      {items.map((i) => (
        <div
          key={i.label}
          className="grid grid-cols-[110px_1fr] items-start gap-3 rounded-ctl bg-surface-2 px-3 py-2.5 text-d13h max-[760px]:grid-cols-1 max-[760px]:gap-1"
        >
          <Chip def={i.ok ? ['Done', 'check', 'green'] : ['Missing', 'circle', 'mute']} />
          <div>
            <b className="font-semibold">{i.label}</b>
            <div className="mt-0.5 text-d13 text-mute">{i.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const GateChip = ({ ok, exception }: { ok: boolean; exception: boolean }) =>
  ok ? (
    <Chip def={['Ready for invoice', 'check', 'green']} />
  ) : exception ? (
    <Chip def={['Exception recorded', 'warning', 'warn']} />
  ) : (
    <Chip def={['Not ready for invoice', 'lock', 'mute']} />
  );
