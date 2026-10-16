/* Documents & register: every number issued with its exact version and signature state; a void keeps its number and reason.
   From divisions/div-fnl-mcit.js registerPage (legal_numbering, legal_number_void, legal_export). */
import { Chip, DivCrumb } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { t } from '@/lib/i18n';
import { dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { FNL, LST, LTYPE, fnlFull, fnlOf, lrOf, rgOf, type RegisterEntry } from '../services/fnl-data';
import { exportRegister } from '../services/finance';
import { GrantsBox, Who } from './fnl-parts';
import { LinkRow, Tbl, Td, Th } from './fnl-table';

export const RegisterCrumb = () => <DivCrumb d={FNL} parts={[['register', t('Documents & register')]]} />;

function Row({ g }: { g: RegisterEntry }) {
  const db = useWorkspace((w) => w);
  const x = lrOf(db, g.req);
  return (
    <LinkRow to={`fnl-requests/${g.req}`}>
      <Td>
        <span className={cn('font-semibold', g.state === 'void' && 'text-mute line-through')}>{g.no}</span>
      </Td>
      <Td>
        <b>{x ? x.title : t('Removed request')}</b>
        <small className="block text-mute">{t(LTYPE[g.type as keyof typeof LTYPE][0])}</small>
      </Td>
      <Td>{x ? x.counterpart || t('Internal') : ''}</Td>
      <Td className="type-num">v{g.version}</Td>
      <Td>{x && <Chip def={LST[x.stage]} pill="pill" />}</Td>
      <Td>
        {dShort(g.issuedAt.slice(0, 10))} <Who id={g.issuedBy} />
      </Td>
      <Td>
        {g.state === 'void' ? (
          <>
            <Chip def={['Void', 'close', 'mute']} pill="pill" />
            <small className="block text-mute">
              {g.voidReason}
              {g.reissue ? ` → ${rgOf(db, g.reissue)?.no ?? ''}` : ''}
            </small>
          </>
        ) : (
          <>
            <Chip def={['Issued', 'check', 'green']} pill="pill" />
            {g.replaces && (
              <small className="block text-mute">{t('Replaces {no}', { no: rgOf(db, g.replaces)?.no ?? '' })}</small>
            )}
          </>
        )}
      </Td>
    </LinkRow>
  );
}

export function RegisterPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const f = useUi((u) => u.view.fnlrg ?? 'all');
  useDivisionWorkspace(FNL);
  if (!fnlFull(m)) {
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  }
  const s = fnlOf(db);
  const list = s.register.filter((g) => f === 'all' || g.state === f).sort((a, b) => b.seq - a.seq);
  const issued = s.register.filter((g) => g.state === 'issued').length;
  const voids = s.register.length - issued;
  const next = Math.max(0, ...s.register.map((g) => g.seq)) + 1;
  return (
    <Page wide>
      <PageHeader
        title={t('Documents & register')}
        sub={t('Every number issued, with its exact version and signature state. A void keeps its number and reason.')}
      >
        <Button
          onClick={() => {
            void exportRegister();
          }}
        >
          <Icon name="download" />
          {t('Export CSV')}
        </Button>
      </PageHeader>
      <Notice icon="info" tone="warn" className="mt-3 mb-3" title={<b>{t('Number format not adopted')}</b>}>
        <p>
          {t(
            '{f} is proposed. Numbers here are provisional labels for the walkthrough. The real build issues each number on the server, one at a time, so two people can never get the same number.',
            { f: s.policy.format },
          )}
        </p>
      </Notice>
      <div className="mt-[18px] mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <Segmented<string>
          label={t('Show')}
          value={f}
          onChange={(k) => {
            setUi((u) => {
              u.view.fnlrg = k;
            });
          }}
          options={[
            ['all', t('All')],
            ['issued', t('Issued')],
            ['void', t('Void')],
          ]}
        />
        <span className="text-mute type-small">
          {t('{i} issued, {v} void. Next number {n}. No number is reused.', {
            i: issued,
            v: voids,
            n: String(next).padStart(3, '0'),
          })}
        </span>
      </div>
      <Tbl
        head={
          <>
            <Th>{t('Number')}</Th>
            <Th>{t('Document')}</Th>
            <Th>{t('Party')}</Th>
            <Th>{t('Version')}</Th>
            <Th>{t('Request state')}</Th>
            <Th>{t('Issued')}</Th>
            <Th>{t('State')}</Th>
          </>
        }
      >
        {list.map((g) => (
          <Row key={g.id} g={g} />
        ))}
      </Tbl>
      <GrantsBox grants={s.grants} keys={['issue', 'sign', 'legalReview']} />
    </Page>
  );
}
