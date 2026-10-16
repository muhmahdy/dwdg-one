/* One user action = one transaction (engineering-transactions, work_undo_archive, D45).
   The action changes a draft of the records, the screen state and the history together. The new state shows at once;
   the record changes go to the repository in order; feedback (toasts, the Undo entry) appears only after the save is
   confirmed (engineering-drafts: no success toast before commit). If the save fails, records, screen state and history
   return to how they were and the shared failure text is shown, as the prototype's DBCommit did. */
import { withDefaults } from './defaults';
import { produce, type Draft } from 'immer';
import { initialUi, type UiState } from '@/app/ui-state';
import { t } from '@/lib/i18n';
import { sessionStore } from '@/lib/session';
import { createStore } from '@/lib/store';
import type { Workspace } from '@/types/workspace';
import type { WorkspaceRepository } from './repository';
import { diff, isEmptyChange } from './shape';

export interface ActionContext {
  db: Draft<Workspace>;
  ui: Draft<UiState>;
  /** Replace the whole workspace (Redo restores a snapshot). */
  replaceDb: (next: Workspace) => void;
  /** Feedback after the save. With `undo`, the change joins the shared Undo stack and the toast offers Undo. */
  toast: (msg: string, undo?: UndoRecipe) => void;
}

export type UndoRecipe = (ctx: ActionContext) => void;

export interface UndoEntry {
  msg: string;
  undo: UndoRecipe;
}
interface RedoEntry {
  msg: string;
  after: Workspace;
  back: Workspace;
}
export interface History {
  u: UndoEntry[];
  r: RedoEntry[];
}

export interface ToastState {
  id: number;
  msg: string;
  undo: (() => void) | null;
}

export interface CommitEffects {
  before: Workspace;
  after: Workspace;
  origin: HTMLElement | null;
}

export const workspaceStore = createStore<Workspace | null>(null);
export const uiStore = createStore<UiState>(initialUi());
export const historyStore = createStore<History>({ u: [], r: [] });
export const toastStore = createStore<ToastState | null>(null);

const UNDO_LIMIT = 50;
const TOAST_MS = 6000;

let repository: WorkspaceRepository | null = null;
let effects: ((e: CommitEffects) => void) | null = null;
let queue: Promise<unknown> = Promise.resolve();
let generation = 0;
let toastSeq = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function configureTransactions(opts: { repository: WorkspaceRepository; effects?: (e: CommitEffects) => void }) {
  repository = opts.repository;
  effects = opts.effects ?? null;
}

/** The toast with Undo (work_undo_archive): one message at a time, gone after six seconds. */
export function showToast(msg: string, undo: (() => void) | null = null) {
  clearTimeout(toastTimer);
  toastStore.set({ id: ++toastSeq, msg, undo });
  toastTimer = setTimeout(() => {
    toastStore.set(null);
  }, TOAST_MS);
}

interface Root {
  db: Workspace;
  ui: UiState;
  hist: History;
}

interface Feedback {
  msg: string;
  undo?: UndoRecipe | undefined;
}

export interface ActOptions {
  /** Element that triggered the action, for the completion and pin effects. */
  origin?: HTMLElement | null;
  /** false for Undo and Redo, which should not replay celebration effects. */
  effects?: boolean;
  failureText?: string;
  /** Housekeeping the app does for itself (the demo Board record); the Board read-only rule does not apply. */
  system?: boolean;
  /** Runs inside the transaction once the next records are known (Undo uses it to record Redo). */
  after?: (ctx: { before: Root; next: Root; hist: Draft<History> }) => void;
}

const boardSignedIn = (db: Workspace) => {
  const me = db.people.find((p) => p.id === sessionStore.get().me);
  return !!me && (me.role === 'board' || !!me.board);
};

/** Runs one action. Resolves to true when it was saved (or changed nothing that needs saving), false when it was rolled back. */
export function act(recipe: (ctx: ActionContext) => void, options: ActOptions = {}): Promise<boolean> {
  const db = workspaceStore.get();
  if (!db) return Promise.resolve(false);
  // Board accounts are read-only everywhere (W101 acceptance 1): every write, approval and offer route is denied, 0 changes.
  if (!options.system && boardSignedIn(db)) {
    showToast(t('Board accounts are read-only. Nothing was changed.'));
    return Promise.resolve(false);
  }
  const before: Root = { db, ui: uiStore.get(), hist: historyStore.get() };
  const feedback: Feedback[] = [];
  let next = produce(before, (draft) => {
    recipe({
      db: draft.db,
      ui: draft.ui,
      replaceDb: (w) => {
        draft.db = w;
      },
      toast: (msg, undo) => feedback.push({ msg, undo }),
    });
  });
  if (options.after) {
    const after = options.after;
    next = produce(next, (draft) => {
      after({ before, next, hist: draft.hist });
    });
  }
  const changes = diff(before.db, next.db);
  const gen = generation;

  workspaceStore.set(next.db);
  uiStore.set(next.ui);
  historyStore.set(next.hist);

  const confirm = () => {
    for (const f of feedback) toastWithUndo(f.msg, f.undo);
    if (options.effects !== false && effects && before.db !== next.db)
      effects({ before: before.db, after: next.db, origin: options.origin ?? null });
  };
  if (isEmptyChange(changes)) {
    confirm();
    return Promise.resolve(true);
  }
  const repo = repository;
  if (!repo) throw new Error('Transactions are not configured with a repository.');

  const saved = queue.then(async () => {
    if (gen !== generation) return false; // an earlier save failed; this change was built on records that were rolled back
    try {
      await repo.apply(changes);
      confirm();
      return true;
    } catch (error) {
      generation++;
      // Return records and history to the state before this action (dropping any later, unsaved actions built on it).
      workspaceStore.set(before.db);
      historyStore.set(before.hist);
      // The screen state is restored only if nothing changed it since, so a slow failure never yanks a newer panel away.
      if (uiStore.get() === next.ui) uiStore.set(before.ui);
      showToast(t(options.failureText ?? 'Could not save. Your changes are still here. Please try again.'));
      console.error(error);
      return false;
    }
  });
  queue = saved;
  return saved;
}

function toastWithUndo(msg: string, undo: UndoRecipe | undefined) {
  if (!undo) {
    showToast(msg);
    return;
  }
  const entry: UndoEntry = { msg, undo };
  const h = historyStore.get();
  historyStore.set({ u: [...h.u, entry].slice(-UNDO_LIMIT), r: [] });
  showToast(msg, () => void undoLast(entry));
}

/* Undo runs the change's own reversal, which appends to Changes rather than erasing it. Redo puts back the state from
   just before that undo; like the prototype this is a whole-workspace snapshot (core/app.js shUndo/shRedo). */
export function undoLast(entry?: UndoEntry): Promise<boolean> {
  const h = historyStore.get();
  const e = entry ?? h.u[h.u.length - 1];
  if (!e) {
    showToast(t('Nothing to undo'));
    return Promise.resolve(false);
  }
  return act(
    (ctx) => {
      e.undo(ctx);
    },
    {
      effects: false,
      after: ({ before, next, hist }) => {
        // Entries are drafts inside the recipe; their undo function keeps its identity, so it names the entry.
        hist.u = hist.u.filter((x) => x.undo !== e.undo);
        hist.r.push({ msg: e.msg, after: before.db, back: next.db });
      },
    },
  ).then((ok) => {
    if (ok) showToast(t('Undone: {m}', { m: e.msg }));
    return ok;
  });
}

export function redoLast(): Promise<boolean> {
  const e = historyStore.get().r.at(-1);
  if (!e) {
    showToast(t('Nothing to redo'));
    return Promise.resolve(false);
  }
  return act(
    (ctx) => {
      ctx.replaceDb(e.after);
    },
    {
      effects: false,
      after: ({ hist }) => {
        hist.r.pop();
        hist.u.push({
          msg: e.msg,
          undo: (ctx) => {
            ctx.replaceDb(e.back);
          },
        });
      },
    },
  ).then((ok) => {
    if (ok) showToast(t('Redone: {m}', { m: e.msg }));
    return ok;
  });
}

/** Screen-state-only change (open a panel, switch a view). Never saves, never fails. */
export function setUi(recipe: (ui: Draft<UiState>) => void) {
  uiStore.set(produce(uiStore.get(), recipe));
}

/** Loads the workspace into the store (first load and refresh). Pending history is kept; it refers to records by id. */
export function loadWorkspace(w: Workspace) {
  workspaceStore.set(withDefaults(w));
}

/** Test helper: start every test from a clean slate. */
export function resetTransactions() {
  generation++;
  queue = Promise.resolve();
  workspaceStore.set(null);
  uiStore.set(initialUi());
  historyStore.set({ u: [], r: [] });
  toastStore.set(null);
  clearTimeout(toastTimer);
}
