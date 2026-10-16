/* The version list of a decision packet (.versions): one row per version with its question, who submitted it, and its state. */
import { Link } from 'react-router';
import { Chip } from '@/components/shared/division-ui';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { PKT, type DecisionPacket } from '../services/sng-data';

export function PacketVersions({
  packets,
  currentId,
  submittedBy = false,
}: {
  packets: DecisionPacket[];
  currentId?: string;
  /** Prefix the stamp with "Submitted by", as on the initiative page. */
  submittedBy?: boolean;
}) {
  const who = useWho();
  return (
    <div className="grid gap-[3px]">
      {packets.map((x) => {
        const stamp = who.stamp(x.submittedBy, x.submittedAt);
        return (
          <Link
            key={x.id}
            to={`/decisions/${x.id}`}
            className={cn(
              'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5 text-ink no-underline hover:bg-hover',
              x.id === currentId && 'bg-sel-neutral',
            )}
          >
            <span className="text-d13 font-semibold">v{x.version}</span>
            <div className="min-w-0">
              <b className="text-d14 font-bold">{x.question}</b>
              <small className="block text-d13 text-mute">
                {submittedBy ? t('Submitted by {who}', { who: stamp }) : stamp}
              </small>
            </div>
            <Chip def={PKT[x.state]} pill="pill" />
          </Link>
        );
      })}
    </div>
  );
}
