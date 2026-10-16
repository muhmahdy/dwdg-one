/* Personal preferences that change what the whole app looks like or which pages exist: the look (D56), the release preview
   (D58) and the Google Calendar connection. Language and theme are plain session values (setSession). */
import { go } from '@/app/router/navigation';
import { SIMPLE_PAGES } from '@/app/router/routes';
import { t } from '@/lib/i18n';
import { setSession, type Look } from '@/lib/session';
import { getMe } from '@/lib/workspace/hooks';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import { act, historyStore, loadWorkspace, setUi, showToast } from '@/lib/workspace/transaction';

/** Switches the look. The panel and menu close; Simple keeps only its own pages, so another page returns to My Work. */
export function chooseLook(k: Look) {
  setSession((s) => {
    const { density: _density, ...rest } = s;
    return { ...rest, look: k };
  });
  setUi((u) => {
    u.insp = null;
    u.menu = null;
  });
  const page = window.location.pathname.split('/')[1] ?? 'work';
  if (k === 'simple' && !SIMPLE_PAGES.includes(page)) go('work');
}

/** Admin only: show or hide the pages planned for later releases (they stay in the code either way). */
export function setReleasePreview(on: boolean) {
  setSession({ preview: on });
  showToast(on ? t('Later features are shown to you') : t('Later features are hidden again'));
}

export function disconnectGoogleCalendar() {
  return act(({ db, toast }) => {
    const p = db.people.find((x) => x.id === getMe()?.id);
    if (!p) return;
    p.gcal = false;
    const id = p.id;
    toast(t('Disconnected. Your Google busy time no longer counts here.'), ({ db: d }) => {
      const x = d.people.find((y) => y.id === id);
      if (x) x.gcal = true;
    });
  });
}

/** Admin: let a waiting member in, or decline them. */
export function decideMember(id: string, approve: boolean) {
  return act(({ db, toast }) => {
    const p = db.people.find((x) => x.id === id);
    if (!p) return;
    p.status = approve ? 'active' : 'declined';
    toast(approve ? t('{who} can now sign in', { who: p.name }) : t('{who} was declined', { who: p.name }));
  });
}

/** Demo mode only: put the demo workspace back as it was seeded. Edits there live in memory, so nothing outside is touched. */
export async function resetDemoWorkspace() {
  loadWorkspace(await demoWorkspace());
  historyStore.set({ u: [], r: [] });
  setUi((u) => {
    u.insp = null;
    u.form = null;
  });
  showToast(t('Demo data reset'));
}
