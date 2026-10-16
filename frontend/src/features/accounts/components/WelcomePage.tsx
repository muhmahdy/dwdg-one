/* Welcome: the first sign-in after approval (flow-accept-landing 4-6, onboarding-first-view, onboarding-profile). Where the
   person sits in DWDG UII, four words they will see, what they can do, their onboarding and a few preferences.
   From screens/accounts.js PAGES.welcome. */
import { useState } from 'react';
import { Link } from 'react-router';
import { go } from '@/app/router/navigation';
import { Avatar, IdentityLine, roleLabel } from '@/components/shared/Avatar';
import { Button, buttonClass } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { SettingBox, SettingRow } from '@/components/ui/SettingRows';
import { inputClass } from '@/components/ui/forms';
import { Page, PageHeader, Rows } from '@/components/ui/page';
import { rank } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { divisionOf } from '@/app/config/org';
import { setSession } from '@/lib/session';
import { nowStamp } from '@/lib/time';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { onboardingTasks } from '@/features/hr/services/hr-data';
import { setProfileField } from '@/features/people/services/profile';
import { TaskRow } from '@/features/work/components/TaskRow';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { acctOf } from '../services/acct-data';
import { AcctCrumb, ByAt, DeltaList } from './AccountsParts';

export const WelcomeCrumb = () => <AcctCrumb parts={[['', t('Welcome')]]} />;

const WORDS: [string, string, string][] = [
  ['Workspace', 'folder', 'Your division’s space: its projects, operations, resources and history.'],
  ['Project', 'projects', 'Work with a goal and an end. Each has Overview, WBS, Work and Resources.'],
  ['Work', 'tasks', 'Tasks: what you do, in a list, a board or a timeline.'],
  ['Resources', 'note', 'Notes, folders and links. Files stay in your own Google Drive.'],
];

export function WelcomePage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const session = useSession((s) => s);
  const [li, setLi] = useState(m?.linkedin ?? '');
  const [ph, setPh] = useState(m?.phone ?? '');
  if (!m) return null;
  const inv = acctOf(db).invites.find((i) => i.person === m.id);
  const d = divisionOf(m.div);
  const lead = rank(m) >= 2;
  const lang = session.lang === 'id' ? 'id' : 'en';
  const theme = session.theme ?? 'system';
  const ob = onboardingTasks(db, m.id);
  const done = (to: string) => {
    void act(({ db: w }) => {
      const me = w.people.find((p) => p.id === m.id);
      if (me) me.welcomedAt = nowStamp();
    }).then(() => {
      go(to);
    });
  };
  return (
    <Page>
      <div className="mb-3.5 flex items-center gap-4 max-[600px]:items-start">
        <Avatar id={m.id} size="xl" />
        <PageHeader
          title={t('Welcome to dwdg’ONE, {name}', { name: m.first })}
          sub={t('You’re in. Here is your place in DWDG UII and what to do first.')}
        />
      </div>
      <SectionHeading as="h2">{t('Your membership')}</SectionHeading>
      <Meta className="mt-1 grid-cols-[148px_1fr] max-[600px]:grid-cols-[112px_1fr]">
        <MetaRow label={t('Organization')}>DWDG UII</MetaRow>
        <MetaRow label={t('Batch')}>2026</MetaRow>
        <MetaRow label={t('Workspace')}>
          {d ? (
            <>
              <BrandIcon id={d.icon} label={false} className="size-3.5" />
              {d.name}
            </>
          ) : (
            t('Presidency, all workspaces')
          )}
        </MetaRow>
        <MetaRow label={t('Role')}>
          <IdentityLine person={m} /> {roleLabel(m)}
        </MetaRow>
        <MetaRow label={t('Consultant function')}>{t('Yes, like every member')}</MetaRow>
        {inv && (
          <MetaRow label={t('Invited by')}>
            <ByAt id={inv.createdBy} at={inv.createdAt} />
          </MetaRow>
        )}
        {inv?.approvedBy && (
          <MetaRow label={t('Approved by')}>
            <ByAt id={inv.approvedBy} at={inv.approvedAt} />
          </MetaRow>
        )}
      </Meta>
      <p className="text-mute type-small">
        {t('Your role comes from your membership. Only an appointment changes it, never a task.')}
      </p>
      <SectionHeading as="h2">{t('Four words you will see')}</SectionHeading>
      <div className="grid grid-cols-4 gap-2 max-[899px]:grid-cols-2">
        {WORDS.map(([w, ic, text]) => (
          <div key={w} className="grid content-start gap-1.5 rounded-sheet bg-surface-2 p-3.5">
            <Icon name={ic} className="size-[18px] text-ink-2" />
            <b>{t(w)}</b>
            <p className="m-0 text-[length:12.5px] text-mute">{t(text)}</p>
          </div>
        ))}
      </div>
      <SectionHeading as="h2">{t('What you can do')}</SectionHeading>
      <DeltaList
        items={[
          t('See and run your own tasks in My Work.'),
          t('Offer a task to anyone. It waits until they accept, and declining has no penalty.'),
          t('Join consulting work whenever you accept an offer. Every member is also a consultant.'),
          lead
            ? t('Create projects, programs and routines in {d}.', { d: d ? d.short : 'DWDG' })
            : t('Co-Directors and above create projects. Ask yours when you need one.'),
        ].map((text) => ({ icon: 'check', text }))}
      />
      <SectionHeading as="h2" count={ob.length || null}>
        {t('Your onboarding')}
      </SectionHeading>
      {ob.length ? (
        <Rows>
          {ob.map((tk) => (
            <TaskRow key={tk.id} task={tk} owner />
          ))}
        </Rows>
      ) : (
        <p className="text-mute type-small">
          {t('HR adds your onboarding checklist. It appears in My Work as tasks with owners and dates.')}
        </p>
      )}
      <SectionHeading as="h2">{t('Profile and preferences')}</SectionHeading>
      <SettingBox>
        <SettingRow label={m.name} help={t('Your photo and name come from your Google account.')}>
          <Avatar id={m.id} size="lg" />
        </SettingRow>
        <SettingRow label="LinkedIn" help={t('Optional. Shown on your person panel.')}>
          <input
            className={cn(inputClass, 'w-[260px] max-[600px]:w-full')}
            aria-label="LinkedIn"
            value={li}
            placeholder="linkedin.com/in/…"
            onChange={(e) => {
              setLi(e.target.value);
            }}
            onBlur={() => {
              if (li.trim() !== (m.linkedin ?? '')) void setProfileField('linkedin', li);
            }}
          />
        </SettingRow>
        <SettingRow label={t('Phone')} help={t('Optional. You can hide it from others.')}>
          <input
            className={cn(inputClass, 'w-[260px] max-[600px]:w-full')}
            aria-label={t('Phone')}
            value={ph}
            placeholder="+62…"
            onChange={(e) => {
              setPh(e.target.value);
            }}
            onBlur={() => {
              if (ph.trim() !== (m.phone ?? '')) void setProfileField('phone', ph);
            }}
          />
        </SettingRow>
        <SettingRow label={t('Language')} help={t('Only changes the interface.')}>
          <Segmented
            value={lang}
            label={t('Language')}
            options={[
              ['en', 'English'],
              ['id', 'Bahasa Indonesia'],
            ]}
            onChange={(l) => {
              setSession({ lang: l });
            }}
          />
        </SettingRow>
        <SettingRow label={t('Theme')}>
          <Segmented
            value={theme}
            label={t('Theme')}
            options={[
              ['system', t('System')],
              ['light', t('Light')],
              ['dark', t('Dark')],
            ]}
            onChange={(v) => {
              setSession({ theme: v });
            }}
          />
        </SettingRow>
      </SettingBox>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            done('work');
          }}
        >
          {t('Open My Work')}
        </Button>
        {d && (
          <Link
            className={buttonClass('default')}
            to="/projects"
            onClick={(e) => {
              e.preventDefault();
              done('projects');
            }}
          >
            {t('See {d} projects', { d: d.short })}
          </Link>
        )}
      </div>
    </Page>
  );
}
