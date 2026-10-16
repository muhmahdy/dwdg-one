/* The Schedule's screen state lives in the shared ui object (calendar view and day, which layers show, the mini month, the
   draft being edited, the composer). Typed accessors keep the rest of the feature free of casts. */
import { addDays, D, iso, today } from '@/lib/time';
import { useUi } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { UiState } from '@/app/ui-state';
import type { DateStr } from '@/types/workspace';
import { ALL_LAYERS, type CalView, type Layers } from './calendar';
import type { ComposerState } from './composer';
import type { MeetingDraft } from './drafts';

/** Narrow screens open on Day; Week stays one tab away. */
export const defaultView = (): CalView => (window.innerWidth < 1000 ? 'day' : 'week');

export const getCalView = (u: UiState): CalView => (u.calView as CalView | null | undefined) ?? defaultView();
export const getCalDate = (u: UiState): DateStr => (u.calDate as DateStr | null | undefined) ?? today();
const getLayers = (u: UiState): Layers => (u.layers as Layers | undefined) ?? ALL_LAYERS;
const getMini = (u: UiState) => (u.mini as DateStr | null | undefined) ?? null;
const getDraft = (u: UiState) => (u.draft as MeetingDraft | null | undefined) ?? null;

export const useCalView = (): CalView => useUi(getCalView);
export const useCalDate = (): DateStr => useUi(getCalDate);
export const useLayers = (): Layers => useUi(getLayers);
export const useMiniMonth = (): DateStr | null => useUi(getMini);
export const useDraft = (): MeetingDraft | null => useUi(getDraft);
export const useComposer = (): ComposerState | null =>
  useUi((u) => (u.composer as ComposerState | null | undefined) ?? null);

export const setCalView = (view: CalView) => {
  setUi((u) => {
    u.calView = view;
  });
};
export const setCalDate = (date: DateStr) => {
  setUi((u) => {
    u.calDate = date;
    u.mini = null;
  });
};
export const goToday = () => {
  setCalDate(today());
};
/** Previous or next day, week or month, depending on the view. */
export const stepCalendar = (dir: 1 | -1) => {
  setUi((u) => {
    const v = getCalView(u);
    const a = getCalDate(u);
    u.mini = null;
    u.calDate =
      v === 'month'
        ? iso(new Date(D(a).getFullYear(), D(a).getMonth() + dir, 1))
        : addDays(a, dir * (v === 'day' ? 1 : 7));
  });
};
export const stepMini = (dir: 1 | -1) => {
  setUi((u) => {
    const base = D(getMini(u) ?? getCalDate(u));
    u.mini = iso(new Date(base.getFullYear(), base.getMonth() + dir, 1));
  });
};
export const toggleLayer = (key: keyof Layers) => {
  setUi((u) => {
    const cur = getLayers(u);
    u.layers = { ...cur, [key]: !cur[key] };
  });
};
export const showDay = (date: DateStr) => {
  setUi((u) => {
    u.calDate = date;
    u.calView = 'day';
    u.mini = null;
  });
};

export const patchDraft = (patch: Partial<MeetingDraft>) => {
  setUi((u) => {
    const d = getDraft(u);
    if (d) u.draft = { ...d, ...patch };
  });
};
export const openDraft = (d: MeetingDraft, panel: boolean) => {
  setUi((u) => {
    u.menu = null;
    u.draft = d;
    if (panel) u.insp = { type: 'event-edit' };
  });
};
export const closeDraft = () => {
  setUi((u) => {
    u.draft = null;
    if (u.insp?.type === 'event-edit') u.insp = null;
  });
};
