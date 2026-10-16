/* A meeting's place: a link shows as what it opens (Google Maps, Meet), anything else as written. */
import { t } from '@/lib/i18n';

export function WhereText({ where }: { where: string }) {
  if (!where) return <span className="text-mute">{t('Not set')}</span>;
  if (!/^https?:\/\//.test(where)) return <>{where}</>;
  const label = /maps|goo\.gl/.test(where)
    ? t('Open in Google Maps')
    : where.includes('meet.google')
      ? t('Join Google Meet')
      : where.replace(/^https?:\/\//, '');
  return (
    <a className="underline" href={where} target="_blank" rel="noopener">
      {label}
    </a>
  );
}
