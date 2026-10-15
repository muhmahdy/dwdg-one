/* Shared screen state (the prototype's `ui` object): what is open and how each page is filtered. It is not saved;
   it lives as long as the tab. Feature modules read and change it through actions, so a failed save can roll it back
   together with the records (core/persistence.js). */

export interface Rect {
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

/** The side panel (inspector): a panel type plus whatever identifies its record. */
export interface InspectorRef {
  type: string;
  id?: string;
  kind?: string;
  [key: string]: unknown;
}

export interface MenuRef {
  type: string;
  rect: Rect;
  alignRight?: boolean;
  id?: string;
  width?: number;
  est?: number;
  up?: boolean;
  [key: string]: unknown;
}

export interface UiState {
  insp: InspectorRef | null;
  menu: MenuRef | null;
  palette: boolean;
  composer: unknown;
  draft: unknown;
  weekOffset: number;
  stage: string;
  q: string;
  folder: string | null;
  showDone: boolean;
  view: Record<string, string>;
  range: string;
  updFilter: string;
  form: string | null;
  acctSub: string;
  calScroll: number | null;
  /** Feature-specific state; each module documents its own keys. */
  [key: string]: unknown;
}

export const initialUi = (): UiState => ({
  insp: null,
  menu: null,
  palette: false,
  composer: null,
  draft: null,
  weekOffset: 0,
  stage: 'all',
  q: '',
  folder: null,
  showDone: false,
  view: {},
  range: '2w',
  updFilter: 'all',
  form: null,
  acctSub: '',
  calScroll: null,
});
