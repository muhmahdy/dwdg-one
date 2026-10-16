/* The project brief on the Overview (work_overview): write the context, objectives and deliverables in one place and link the
   pages and files people need. Text is edited in place; saving makes a revision. From screens/plan.js briefSection. */
/* The brief editor keeps the prototype's document.execCommand: it is the only built-in rich-text command set for a
   contenteditable, and the saved HTML is always passed through cleanHtml. Replace it with a small editor library if one is adopted. */
/* eslint-disable @typescript-eslint/no-deprecated */
import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { LineGlyph } from '@/components/shared/art/task-icons';
import { LinkTile, RefTile } from '@/features/resources/components/Tiles';
import { host, isHttpsLoose, linkablePages, provOf, refInfo, type RefKind } from '@/features/resources/services/links';
import { projBrief } from '@/features/resources/services/resources';
import type { Project } from '@/types/workspace';
import { BRIEF_TEMPLATE, saveBrief } from '../services/brief';
import { BriefDoc, docClass } from './BriefDoc';

const TOOLS: [string, string, string][] = [
  ['h3', 'Heading', 'M6 4v16 M18 4v16 M6 12h12'],
  ['bold', 'Bold', 'M7 4h6a4 4 0 0 1 0 8H7Z M7 12h7a4 4 0 0 1 0 8H7Z'],
  ['italic', 'Italic', 'M14 4h-4 M14 20h-4 M14 4l-4 16'],
  ['insertUnorderedList', 'Bulleted list', 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01'],
  ['insertOrderedList', 'Numbered list', 'M10 6h10 M10 12h10 M10 18h10 M4 5l1-1v4 M4 14h2l-2 3h2'],
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The results under a link search: a pasted address, or a task, meeting, resource or project. */
export function LinkResults({
  p,
  q,
  onPick,
}: {
  p: Project;
  q: string;
  onPick: (target: { url: string } | { ref: { type: RefKind; id: string } }) => void;
}) {
  const pages = useWorkspace((db) => linkablePages(db, p, q));
  const infos = useWorkspace((db) => pages.map((x) => refInfo(db, x)));
  const url = isHttpsLoose(q) ? q : null;
  const item =
    'flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-1.5 text-d13h hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring';
  return (
    <div className="grid max-h-[280px] gap-0 overflow-auto rounded-[10px] bg-surface p-1.5 shadow-pop">
      {url && (
        <div
          className={item}
          role="menuitem"
          tabIndex={0}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            onPick({ url });
          }}
        >
          <LinkTile url={url} size="sm" />
          <span className="min-w-0 flex-1 truncate">{url}</span>
          <small className="text-d12 text-mute">{provOf(url)?.name ?? host(url)}</small>
        </div>
      )}
      {pages.map((x, i) => {
        const info = infos[i];
        return info ? (
          <div
            key={`${x.type}:${x.id}`}
            className={item}
            role="menuitem"
            tabIndex={0}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              onPick({ ref: { type: x.type, id: x.id } });
            }}
          >
            <RefTile target={{ type: x.type, id: x.id }} size="sm" />
            <span className="min-w-0 flex-1 truncate">{info.name}</span>
            <small className="text-d12 text-mute">{info.sub}</small>
          </div>
        ) : null;
      })}
      {!url && !pages.length && <div className="px-2.5 py-3.5 text-d13h text-mute">{t('No matches.')}</div>}
    </div>
  );
}

function Status({ projectId }: { projectId: string }) {
  const who = useWho();
  const state = useUi((u) => (u.noteState as Record<string, string> | undefined)?.[`brief:${projectId}`]);
  const r = useWorkspace((db) => db.resources.find((x) => x.project === projectId && x.brief && !x.archived));
  const base = 'inline-flex items-center gap-1 text-d12';
  if (state === 'failed')
    return (
      <span className={cn(base, 'text-danger')}>
        <Icon name="warning" size="xs" />
        {t('Could not save. Your text is still here.')}
      </span>
    );
  if (state === 'saved' && r)
    return (
      <span className={cn(base, 'text-green-ink')}>
        <Icon name="check" size="xs" />
        {t('Saved as revision {n}', { n: r.revisions })}
      </span>
    );
  if (state === 'dirty') return <span className={cn(base, 'text-mute')}>{t('Unsaved changes')}</span>;
  if (r?.editedAt && r.editedBy)
    return (
      <span className={cn(base, 'text-mute')}>
        {t('Revision {n}, {who}', { n: r.revisions, who: who.stamp(r.editedBy, r.editedAt) })}
      </span>
    );
  return null;
}

function Editor({ p }: { p: Project }) {
  const ed = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const [linking, setLinking] = useState(false);
  const [q, setQ] = useState('');
  const db = useWorkspace((w) => w);
  const r = projBrief(db, p);
  const draft = useUi((u) => (u.briefDraft as Record<string, string> | undefined)?.[p.id]);
  const initial = useRef(draft ?? r?.body ?? '');

  useEffect(() => {
    const el = ed.current;
    if (el) {
      el.innerHTML = initial.current;
      el.focus();
    }
    const keep = () => {
      const sel = window.getSelection();
      if (sel?.rangeCount && el?.contains(sel.anchorNode)) range.current = sel.getRangeAt(0).cloneRange();
    };
    document.addEventListener('selectionchange', keep);
    return () => {
      document.removeEventListener('selectionchange', keep);
    };
  }, []);

  const dirty = () => {
    const html = ed.current?.innerHTML ?? '';
    setUi((u) => {
      u.briefDraft = { ...(u.briefDraft ?? {}), [p.id]: html };
      u.noteState = { ...(u.noteState ?? {}), [`brief:${p.id}`]: 'dirty' };
    });
  };
  const restore = () => {
    const el = ed.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    if (range.current) sel.addRange(range.current);
    else {
      const r0 = document.createRange();
      r0.selectNodeContents(el);
      r0.collapse(false);
      sel.addRange(r0);
    }
  };
  const fmt = (cmd: string) => {
    restore();
    if (cmd === 'h3')
      document.execCommand('formatBlock', false, document.queryCommandValue('formatBlock') === 'h3' ? 'p' : 'h3');
    else document.execCommand(cmd);
    dirty();
  };
  const insert = (html: string) => {
    restore();
    document.execCommand('insertHTML', false, html);
    setLinking(false);
    setQ('');
    dirty();
  };
  const selected = () => window.getSelection()?.toString().trim() ?? '';
  const close = () => {
    setUi((u) => {
      u.briefEdit = null;
      const d = { ...((u.briefDraft as Record<string, string> | undefined) ?? {}) };
      const n = { ...((u.noteState as Record<string, string> | undefined) ?? {}) };
      u.briefDraft = Object.fromEntries(Object.entries(d).filter(([k]) => k !== p.id));
      u.noteState = Object.fromEntries(Object.entries(n).filter(([k]) => k !== `brief:${p.id}`));
    });
  };
  const save = () => {
    const html = ed.current?.innerHTML ?? '';
    void saveBrief(p.id, html).then((ok) => {
      setUi((u) => {
        const n = {
          ...((u.noteState as Record<string, string> | undefined) ?? {}),
          [`brief:${p.id}`]: ok ? 'saved' : 'failed',
        };
        u.noteState = n;
        if (ok) {
          u.briefEdit = null;
          u.briefDraft = Object.fromEntries(
            Object.entries((u.briefDraft as Record<string, string> | undefined) ?? {}).filter(([k]) => k !== p.id),
          );
        } else u.briefDraft = { ...(u.briefDraft ?? {}), [p.id]: html };
      });
    });
  };
  return (
    <>
      <div
        className="mb-2 flex flex-wrap items-center gap-0.5"
        role="toolbar"
        aria-label={t('Formatting')}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {TOOLS.map(([k, l, d]) => (
          <IconButton
            key={k}
            aria-label={t(l)}
            title={t(l)}
            onClick={() => {
              fmt(k);
            }}
          >
            <LineGlyph d={d} />
          </IconButton>
        ))}
        <Button
          small
          variant="ghost"
          onClick={() => {
            setLinking((v) => !v);
          }}
        >
          <Icon name="link" />
          {t('Link')}
        </Button>
        {!r && !draft && (
          <Button
            small
            variant="ghost"
            onClick={() => {
              if (ed.current) ed.current.innerHTML = BRIEF_TEMPLATE();
              dirty();
              ed.current?.focus();
            }}
          >
            <Icon name="list" />
            {t('Use the brief template')}
          </Button>
        )}
      </div>
      {linking && (
        <div className="relative z-[5] mb-2">
          <input
            className="h-[38px] w-full rounded-ctl border-0 bg-surface px-3 text-ink shadow-[0_0_0_1px_var(--line-strong)] type-body placeholder:text-mute roomy:h-[42px]"
            placeholder={t('Paste https:// link, or search a task, meeting, resource or project')}
            autoComplete="off"
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
          />
          <div className="absolute inset-x-0 top-[calc(100%+2px)]">
            <LinkResults
              p={p}
              q={q.trim()}
              onPick={(target) => {
                const txt = selected();
                if ('url' in target)
                  insert(
                    `<a href="${esc(target.url)}">${esc(txt || (provOf(target.url)?.name ?? host(target.url)))}</a>&nbsp;`,
                  );
                else
                  insert(
                    `<a data-ref="${target.ref.type}:${target.ref.id}" href="#">${esc(txt || (refInfo(db, target.ref)?.name ?? ''))}</a>&nbsp;`,
                  );
              }}
            />
          </div>
        </div>
      )}
      <div
        ref={ed}
        className={cn(
          docClass,
          'min-h-[220px] max-w-none rounded-sheet bg-surface px-[18px] py-4 shadow-[0_0_0_1px_var(--line-strong)] outline-none focus:shadow-[0_0_0_1.5px_var(--ink)]',
        )}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={t('Project brief')}
        onInput={dirty}
      />
      <div className="mt-[18px] flex gap-2">
        <Button small variant="primary" onClick={save}>
          {t('Save')}
        </Button>
        <Button small variant="ghost" onClick={close}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

export function BriefSection({ p, edit }: { p: Project; edit: boolean }) {
  const editing = useUi((u) => u.briefEdit === p.id);
  const r = useWorkspace((db) => projBrief(db, p));
  const startEdit = (template: boolean) => {
    setUi((u) => {
      u.briefEdit = p.id;
      if (template) u.briefDraft = { ...(u.briefDraft ?? {}), [p.id]: BRIEF_TEMPLATE() };
    });
  };
  return (
    <section className="mt-[22px] border-t border-line-strong pt-[18px]">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h2 className="m-0 type-h3">{t('Brief')}</h2>
        <span className="mr-auto" id="brief-state">
          <Status projectId={p.id} />
        </span>
        {!editing && edit && r && (
          <Button
            small
            onClick={() => {
              startEdit(false);
            }}
          >
            <Icon name="edit" />
            {t('Edit')}
          </Button>
        )}
      </div>
      {editing ? (
        <Editor p={p} />
      ) : r?.body ? (
        <BriefDoc html={r.body} />
      ) : (
        <div className="rounded-sheet bg-surface-2 px-[22px] py-5 text-d13h text-ink-2">
          <p className="m-0 max-w-[60ch]">
            {t(
              'No brief yet. Write the context, objectives and deliverables in one place, and link the pages and files people need.',
            )}
          </p>
          {edit && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Button
                small
                variant="primary"
                onClick={() => {
                  startEdit(true);
                }}
              >
                <Icon name="list" />
                {t('Start from the template')}
              </Button>
              <Button
                small
                onClick={() => {
                  startEdit(false);
                }}
              >
                <Icon name="edit" />
                {t('Write a blank brief')}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
