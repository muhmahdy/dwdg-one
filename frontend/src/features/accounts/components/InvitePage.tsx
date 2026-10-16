/* An invitation link opened while signed in: never accepts for the wrong person (flow-accept-landing 6, flow-accept-signin 3).
   The public version, for someone not signed in, is on the sign-in screen. From screens/accounts.js PAGES.invite. */
import { Link } from 'react-router';
import type { Route } from '@/app/router/routes';
import { buttonClass, Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Empty, Page } from '@/components/ui/page';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { acctOf } from '../services/acct-data';
import { inviteSwitch } from '../services/sign-in';
import { AcctCrumb } from './AccountsParts';

export const InviteCrumb = () => <AcctCrumb parts={[['', t('Invitation')]]} />;

export function InvitePage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const i = acctOf(db).invites.find((x) => x.id === route.id);
  const mine = !!i && i.person === m?.id;
  return (
    <Page>
      {mine ? (
        <Empty title={t('You already accepted this invitation')}>
          {t('Accepting again never creates a second account.')}
          <div className="mt-3">
            <Link className={buttonClass('primary')} to="/work">
              {t('Open My Work')}
            </Link>
          </div>
        </Empty>
      ) : (
        <Empty title={t('This invitation is for another account')}>
          {t('Sign out to open it with the invited Google account.')}
          <div className="mt-3">
            <Button
              onClick={() => {
                inviteSwitch(route.id);
              }}
            >
              <Icon name="logout" />
              {t('Sign out and open it')}
            </Button>
          </div>
        </Empty>
      )}
    </Page>
  );
}
