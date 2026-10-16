/* Settings (work_settings, work_reminders): personal preferences apart from administration: your account, language, theme and
   look, the Google Calendar connection, your data, and for the Admin the members waiting and the release preview.
   From screens/plan.js PAGES.settings. */
import { SettingBox, SettingRow } from '@/components/ui/SettingRows';
import { Link } from 'react-router';
import { env } from '@/app/config/env';
import { divisionOf } from '@/app/config/org';
import { Avatar, IdentityLine, roleText } from '@/components/shared/Avatar';
import { Button, buttonClass } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SectionHeading, SubHeading } from '@/components/ui/Headings';
import { State } from '@/components/ui/StatusBadge';
import { Page, PageHeader } from '@/components/ui/page';
import { t } from '@/lib/i18n';
import { look, setSession, type Look, type Theme } from '@/lib/session';
import { useMe, useSession, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { signOut } from '@/features/auth/services/session';
import { connectGoogleCalendar } from '@/features/schedule/services/meeting-actions';
import {
  chooseLook,
  decideMember,
  disconnectGoogleCalendar,
  resetDemoWorkspace,
  setReleasePreview,
} from '../services/preferences';

export const SettingsCrumb = () => <b>{t('Settings')}</b>;

const LOOK_HELP: Record<Look, string> = {
  simple: 'Simple: only My Work, Projects and Schedule, with bigger text and fewer choices.',
  comfortable: 'Comfortable: every feature, calm and easy to read.',
  compact: 'Compact: every feature, dense, for people who want more on the screen.',
};

function PendingMembers() {
  const pending = useWorkspace((db) => db.people.filter((p) => p.status === 'pending'));
  return (
    <div className="px-4 pb-1.5">
      <SubHeading>{t('Members waiting for approval')}</SubHeading>
      <div className="flex flex-col gap-[3px] pb-1.5">
        {pending.length ? (
          pending.map((p) => (
            <div key={p.id} className="flex min-h-[var(--row-h)] items-center gap-3 rounded-ctl px-2.5 py-1.5">
              <Avatar id={p.id} />
              <div className="min-w-0 flex-1">
                <b className="font-semibold">{p.name}</b>
                <small className="block text-d12h text-mute">
                  {t('Asked to join {d}', { d: divisionOf(p.div)?.name ?? '' })}
                </small>
              </div>
              <Button
                small
                variant="ghost"
                onClick={() => {
                  void decideMember(p.id, false);
                }}
              >
                {t('Decline')}
              </Button>
              <Button
                small
                variant="primary"
                onClick={() => {
                  void decideMember(p.id, true);
                }}
              >
                {t('Approve')}
              </Button>
            </div>
          ))
        ) : (
          <div className="px-2.5 py-3 text-d13h text-mute">{t('No one is waiting.')}</div>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const me = useMe();
  const session = useSession((s) => s);
  const resetting = useUi((u) => u.form === 'reset');
  if (!me) return null;
  const lang = session.lang === 'id' ? 'id' : 'en';
  const theme: Theme = session.theme ?? 'light';
  const lk = look(session);
  return (
    <Page data-page="settings">
      <PageHeader title={t('Settings')} className="mt-[17px] compact:mt-4 simple:mt-5" />
      <SectionHeading as="h2">{t('Your account')}</SectionHeading>
      <SettingBox>
        <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Avatar id={me.id} size="lg" className="simple:size-12 simple:text-[17px]" />
            <div>
              <b className="block font-semibold">{me.name}</b>
              <small className="block text-d12h text-mute">{roleText(me)}</small>
            </div>
          </div>
          <IdentityLine person={me} />
        </div>
        <SettingRow label={t('Sign-in')} help={t('Google account. Your photo and name come from it.')}>
          <Button
            small
            onClick={() => {
              void signOut();
            }}
          >
            <Icon name="logout" />
            {t('Sign out')}
          </Button>
        </SettingRow>
      </SettingBox>

      <SectionHeading as="h2">{t('Preferences')}</SectionHeading>
      <SettingBox>
        <SettingRow
          label={t('Language')}
          help={t('Only changes the interface. What people write is never translated.')}
        >
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
        <SettingRow label={t('Look')} help={t(LOOK_HELP[lk])}>
          <Segmented
            value={lk}
            label={t('Look')}
            options={[
              ['simple', t('Simple')],
              ['comfortable', t('Comfortable')],
              ['compact', t('Compact')],
            ]}
            onChange={chooseLook}
          />
        </SettingRow>
        <SettingRow
          label={t('Reminders')}
          help={t('They arrive in Updates. Email or phone notifications while the app is closed are not decided yet.')}
        >
          <Link to="/updates" className={buttonClass('default', true, 'no-underline')}>
            <Icon name="bell" />
            {t('Open Updates')}
          </Link>
        </SettingRow>
      </SettingBox>

      <SectionHeading as="h2">{t('Connections')}</SectionHeading>
      <SettingBox>
        <SettingRow
          label="Google Calendar"
          help={
            me.gcal
              ? t(
                  'Connected. dwdg’ONE meetings appear in your Google Calendar and your Google busy time counts as unavailable. Others never see your event titles. Prototype: simulated.',
                )
              : t('Not connected. Your availability comes only from the unavailable time you record here.')
          }
        >
          {me.gcal ? (
            <>
              <State label={t('Connected')} icon="check" tone="green" />
              <Button
                small
                onClick={() => {
                  void disconnectGoogleCalendar();
                }}
              >
                {t('Disconnect')}
              </Button>
            </>
          ) : (
            <Button
              small
              onClick={() => {
                void connectGoogleCalendar();
              }}
            >
              <Icon name="calendar" />
              {t('Connect')}
            </Button>
          )}
        </SettingRow>
      </SettingBox>

      <SectionHeading as="h2">{t('Your data')}</SectionHeading>
      <SettingBox>
        <SettingRow
          label={t('Export your data')}
          help={t('Arrives with the real build. The prototype keeps everything in this browser only.')}
        >
          <Button small disabled>
            <Icon name="download" />
            {t('Export')}
          </Button>
        </SettingRow>
      </SettingBox>

      {me.admin && (
        <>
          <SectionHeading as="h2">
            {t('Administration')}{' '}
            <span className="ml-1 inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
              Admin
            </span>
          </SectionHeading>
          <p className="mb-2 text-mute type-small">
            {t('Organization settings. Only the Admin sees this section. Environment: prototype on this device.')}
          </p>
          <SettingBox>
            <PendingMembers />
          </SettingBox>
          <SectionHeading as="h2">{t('Release')}</SectionHeading>
          <SettingBox>
            <SettingRow
              label={t('Features planned for later')}
              help={t(
                'Ship 1 is time and task management. Turn this on to demo the division tools and other pages that come later. Only you see them.',
              )}
            >
              <Segmented
                value={session.preview ? 'on' : 'off'}
                label={t('Features planned for later')}
                options={[
                  ['off', t('Hidden')],
                  ['on', t('Shown')],
                ]}
                onChange={(v) => {
                  setReleasePreview(v === 'on');
                }}
              />
            </SettingRow>
          </SettingBox>
        </>
      )}

      {env.demo && (
        <>
          <SectionHeading as="h2">{t('Prototype')}</SectionHeading>
          <Notice tone="info" icon="info" title={<b>{t('Saved on this device only')}</b>}>
            <p>{t('Demo data lives in this browser. Nothing is sent anywhere.')}</p>
            <div className="mt-2.5 flex gap-1.5">
              {resetting ? (
                <>
                  <Button
                    small
                    variant="danger"
                    onClick={() => {
                      void resetDemoWorkspace();
                    }}
                  >
                    {t('Yes, reset')}
                  </Button>
                  <Button
                    small
                    variant="ghost"
                    onClick={() => {
                      setUi((u) => void (u.form = null));
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                </>
              ) : (
                <Button
                  small
                  onClick={() => {
                    setUi((u) => void (u.form = 'reset'));
                  }}
                >
                  {t('Reset demo data')}
                </Button>
              )}
            </div>
          </Notice>
        </>
      )}
    </Page>
  );
}
