/* Competency matrix (HR brief "Competency Matrix", Consulting brief "maintained jointly with HR"): every active member against
   the framework's competencies, coverage against the 100% target, and the competencies the organisation is thinnest on.
   HR, the President, the VP and the Admin see and change it; Consulting reads who is ready when it staffs an engagement
   (features/consulting/components/StaffingPage.tsx). /competencies/:person opens that member's profile. */
import { useEffect, useState } from 'react';
import { DIVS, divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { roleText } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Button } from '@/components/ui/Button';
import { Field, Segmented, inputClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, NotAvailable, Page, PageHeader, SearchField } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { fmtD } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { Person } from '@/types/workspace';
import {
  FRAMEWORK,
  LEVELS,
  READY,
  canEditComps,
  canSeeMatrix,
  isRated,
  levelOf,
  matrixPeople,
  profileOf,
  readyCounts,
  saveProfile,
} from '../services/competency';
import { DivCrumb, Hint, td, th, tblClass, tblScroll, trLink } from './HrParts';

export const CompetencyCrumb = () => <DivCrumb d="hr" parts={[['competencies', t('Competency matrix')]]} />;

export const openProfile = (id: string) => {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.insp = { type: 'hr-comp', id };
  });
};

/** One level as a small square: a dash when not rated, green from Independent up. */
function LevelCell({ v }: { v: number | null }) {
  const def = v === null ? null : LEVELS[v];
  return (
    <span
      title={def ? `${t(def[0])}: ${t(def[1])}` : t('Not rated')}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-[7px] text-d12 font-semibold type-num',
        v === null && 'text-faint shadow-[inset_0_0_0_1px_var(--line-strong)]',
        v !== null && v < READY && 'bg-fill text-ink-2',
        v !== null && v >= READY && 'bg-green-soft text-green-ink',
      )}
    >
            {v ?? '–'}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[180px] flex-1 rounded-[10px] bg-surface px-4 py-3 shadow-sheet">
      <div className="text-mute type-caption">{label}</div>
      <div className="mt-1 type-h2 type-num">{value}</div>
      {sub && <div className="mt-0.5 text-mute type-small">{sub}</div>}
    </div>
  );
}

export function CompetencyPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const open = useUi((u) => (u.insp?.type === 'hr-comp' ? u.insp.id : undefined));
  const [div, setDiv] = useState('');
  const [q, setQ] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  useDivisionWorkspace('hr');
  // A link to /competencies/:person (from Changes) opens that member's profile.
  useEffect(() => {
    if (route.id) openProfile(route.id);
  }, [route.id]);
  if (!canSeeMatrix(m)) return <NotAvailable />;

  const everyone = matrixPeople(db);
  const rated = everyone.filter((p) => isRated(profileOf(db, p.id)));
  const pct = everyone.length ? Math.round((rated.length / everyone.length) * 100) : 0;
  const ready = readyCounts(db, rated);
  const thin = [...FRAMEWORK.competencies].sort((a, b) => (ready[a.k] ?? 0) - (ready[b.k] ?? 0)).slice(0, 3);
  const needle = q.trim().toLowerCase();
  const rows = everyone
    .filter((p) => !div || p.div === div)
    .filter((p) => !needle || p.name.toLowerCase().includes(needle))
    .filter((p) => !onlyMissing || !isRated(profileOf(db, p.id)))
    .sort((a, b) => (a.div ?? '').localeCompare(b.div ?? '') || a.name.localeCompare(b.name));

  return (
    <Page wide>
      <PageHeader
        title={t('Competency matrix')}
        sub={t('A level per competency for every member. Consulting staffs engagements from it; HR keeps it current.')}
      />
      {FRAMEWORK.proposed && (
        <Notice
          icon="info"
          className="mt-4"
          title={<b>{t('Framework {v} is a proposal', { v: FRAMEWORK.version })}</b>}
        >
          <p>{t('Agree the competencies and levels with Consulting Knowledge before the first full review.')}</p>
        </Notice>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Stat
          label={t('Members with a profile')}
          value={`${String(rated.length)} / ${String(everyone.length)}`}
          sub={t('{p}% of the 100% target', { p: pct })}
        />
        <Stat
          label={t('Thinnest competencies')}
          value={thin.map((x) => t(x.short)).join(', ')}
          sub={t('Fewest members at Independent or above')}
        />
      </div>

      <div className="mt-4 mb-2.5 flex flex-wrap items-center gap-2">
        <SearchField
          label={t('Search by name')}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
        />
        <SelectField
          small
          label={t('Division')}
          value={div}
          onChange={setDiv}
          options={[{ value: '', label: t('All divisions') }, ...DIVS.map((d) => ({ value: d.id, label: d.name }))]}
        />
        <label className="flex cursor-pointer items-center gap-2 text-d13">
          <input
            type="checkbox"
            className="m-0 size-4 accent-ink"
            checked={onlyMissing}
            onChange={(e) => {
              setOnlyMissing(e.target.checked);
            }}
          />
          {t('Only members without a profile')}
        </label>
        <span className="flex-1" />
        <span className="text-mute type-small">{plural(rows.length, '{n} person', '{n} people')}</span>
      </div>

      {rows.length ? (
        <div className={tblScroll}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Member')}</th>
                <th className={th}>{t('Division')}</th>
                {FRAMEWORK.competencies.map((x) => (
                  <th key={x.k} className={cn(th, 'text-center')} title={t(x.desc)}>
                    {t(x.short)}
                  </th>
                ))}
                <th className={th}>{t('Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p: Person) => {
                const c = profileOf(db, p.id);
                return (
                  <tr
                    key={p.id}
                    className={cn(trLink, open === p.id && '[&>td]:bg-sel')}
                    tabIndex={0}
                    onClick={() => {
                      openProfile(p.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openProfile(p.id);
                    }}
                  >
                    <td className={td}>
                      <PersonLink id={p.id} full />
                    </td>
                    <td className={td}>{p.div ? divisionOf(p.div)?.short : t('Organization')}</td>
                    {FRAMEWORK.competencies.map((x) => (
                      <td key={x.k} className={cn(td, 'text-center')}>
                        <LevelCell v={levelOf(c, x.k)} />
                      </td>
                    ))}
                    <td className={cn(td, 'type-num')}>
                      {c ? fmtD(c.at.slice(0, 10)) : <span className="text-mute">{t('No profile')}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={t('No one matches')}>{t('Change the search or the division.')}</Empty>
      )}

      <SectionHeading as="h2">{t('Levels')}</SectionHeading>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {LEVELS.map(([label, meaning], i) => (
          <span key={label} className="inline-flex items-center gap-2 text-d13">
            <LevelCell v={i} />
            <span>
              <b className="font-semibold">{t(label)}</b> <span className="text-mute">{t(meaning)}</span>
            </span>
          </span>
        ))}
      </div>
      <Hint>
        {t(
          'Staffing shows Consulting only the competencies a member is ready for (Independent or above). Lower levels are for development with HR and are never shown there.',
        )}
      </Hint>
    </Page>
  );
}

// ---------- the profile panel ----------
type Draft = Record<string, number | null>;

function ProfilePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const pid = insp.id ?? '';
  const p = db.people.find((x) => x.id === pid);
  const c = profileOf(db, pid);
  const may = canEditComps(m);
  const [levels, setLevels] = useState<Draft>(() =>
    Object.fromEntries(FRAMEWORK.competencies.map((x) => [x.k, levelOf(c, x.k)])),
  );
  const [sectors, setSectors] = useState(c?.sectors ?? '');
  const [evidence, setEvidence] = useState(c?.evidence ?? '');
  if (!p || !canSeeMatrix(m)) return <InspectorHead>{t('Competency profile')}</InspectorHead>;
  const choices: [string, string][] = [
    ['none', '–'],
    ...LEVELS.map((_, i): [string, string] => [String(i), String(i)]),
  ];
  return (
    <>
      <InspectorHead>{t('Competency profile')}</InspectorHead>
      <h2 className="mt-3 mb-0.5 type-h2">{p.name}</h2>
      <p className="m-0 text-mute type-small">{roleText(p)}</p>
      <p className="mt-1 mb-3 text-mute type-small">
        {c ? t('Last changed by {who}', { who: who.stamp(c.by, c.at) }) : t('No profile yet.')}
        {c && c.history.length > 0 && ` ${plural(c.history.length, '{n} earlier version', '{n} earlier versions')}`}
      </p>
      {FRAMEWORK.competencies.map((x) => {
        const v = levels[x.k] ?? null;
        return (
          <div key={x.k} className="mb-3 grid gap-1.5">
            <div className="flex items-baseline gap-2">
              <b className="text-d13 font-[550]">{t(x.name)}</b>
              <span className="ml-auto text-mute type-small">
                {v === null ? t('Not rated') : t(LEVELS[v]?.[0] ?? '')}
              </span>
            </div>
            <span className="text-d12h text-mute">{t(x.desc)}</span>
            {may ? (
              <Segmented
                label={t(x.name)}
                value={v === null ? 'none' : String(v)}
                options={choices}
                onChange={(k) => {
                  setLevels((d) => ({ ...d, [x.k]: k === 'none' ? null : Number(k) }));
                }}
              />
            ) : (
              <LevelCell v={v} />
            )}
          </div>
        );
      })}
      <Field label={t('Sectors known')} htmlFor="hr-cm-sec" optional>
        {may ? (
          <input
            id="hr-cm-sec"
            className={inputClass}
            value={sectors}
            placeholder={t('For example: retail, F&B, education')}
            onChange={(e) => {
              setSectors(e.target.value);
            }}
          />
        ) : (
          <span className="text-d13">{sectors || t('Not recorded')}</span>
        )}
      </Field>
      <Field
        label={t('Evidence')}
        htmlFor="hr-cm-ev"
        optional
        help={may ? t('What the levels rest on: a module, a dummy case, a project. No private notes.') : undefined}
      >
        {may ? (
          <textarea
            id="hr-cm-ev"
            className={textareaClass}
            value={evidence}
            onChange={(e) => {
              setEvidence(e.target.value);
            }}
          />
        ) : (
          <span className="text-d13 whitespace-pre-wrap">{evidence || t('Not recorded')}</span>
        )}
      </Field>
      {may && (
        <div className="mt-1 flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              void saveProfile(pid, { levels, sectors: sectors.trim(), evidence: evidence.trim() });
            }}
          >
            {t('Save profile')}
          </Button>
          <Button variant="ghost" onClick={closeInspector}>
            {t('Cancel')}
          </Button>
        </div>
      )}
    </>
  );
}
// A new person opens a fresh panel (its drafts start from that person's saved levels).
PANELS['hr-comp'] = ({ insp }: { insp: InspectorRef }) => <ProfilePanel key={insp.id ?? ''} insp={insp} />;
