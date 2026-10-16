/* The project brief (work_overview): ONE note resource linked to the project (brief: true), so it also appears in Resources and
   keeps revisions (resource_notes, resource_revisions). Links to pages inside dwdg’ONE are references to existing records,
   never copies (resource_references). From screens/plan.js cleanHtml, briefHtml, brief-save. */
import { logChange } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { Resource, Workspace } from '@/types/workspace';
import { refInfo } from '@/features/resources/services/links';

const ALLOWED = new Set(['H3', 'P', 'UL', 'OL', 'LI', 'B', 'STRONG', 'I', 'EM', 'A', 'BR']);

/** Only safe markup survives a save: headings, paragraphs, lists, emphasis and https or in-app links. */
export function cleanHtml(html: string): string {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const walk = (node: ParentNode) => {
    for (const c of [...node.childNodes]) {
      if (c.nodeType === 3) continue;
      if (!(c instanceof HTMLElement)) {
        c.remove();
        continue;
      }
      walk(c);
      if (c.tagName === 'DIV' || c.tagName === 'H1' || c.tagName === 'H2') {
        const n = document.createElement(c.tagName === 'DIV' ? 'p' : 'h3');
        n.append(...c.childNodes);
        c.replaceWith(n);
        continue;
      }
      if (!ALLOWED.has(c.tagName)) {
        c.replaceWith(...c.childNodes);
        continue;
      }
      for (const at of [...c.attributes])
        if (!(c.tagName === 'A' && (at.name === 'href' || at.name === 'data-ref'))) c.removeAttribute(at.name);
      if (c.tagName === 'A') {
        const h = c.getAttribute('href') ?? '';
        if (!h.startsWith('https://') && !c.dataset.ref) c.replaceWith(...c.childNodes);
        else if (!c.dataset.ref) {
          c.setAttribute('target', '_blank');
          c.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
  };
  walk(tpl.content);
  return tpl.innerHTML.trim();
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** In-app links render as chips that open the record; a removed record shows as unavailable instead of leaking a title. */
export function briefHtml(db: Workspace, html: string): string {
  const tpl = document.createElement('template');
  tpl.innerHTML = cleanHtml(html);
  for (const a of tpl.content.querySelectorAll<HTMLAnchorElement>('a[data-ref]')) {
    const [type = '', id = ''] = (a.dataset.ref ?? '').split(':');
    const info = refInfo(db, { type: type, id });
    const span = document.createElement('span');
    span.innerHTML = info
      ? `<a class="ref" data-open="${esc(`${type}:${id}`)}" tabindex="0">${esc(info.name)}</a>`
      : `<span class="ref gone">${esc(tr('Removed page'))}</span>`;
    if (span.firstChild) a.replaceWith(span.firstChild);
  }
  return tpl.innerHTML;
}

export const BRIEF_TEMPLATE = () =>
  ['Background', 'Objectives', 'Deliverables', 'People and roles', 'Timeline', 'Notes']
    .map((h) => `<h3>${esc(tr(h))}</h3><p><br></p>`)
    .join('');

/** Saves the editor's text as a new revision; creates the brief note the first time. Resolves false if the save failed. */
export function saveBrief(projectId: string, rawHtml: string): Promise<boolean> {
  const body = cleanHtml(rawHtml);
  return act(({ db }) => {
    const me = getMe();
    const p = db.projects.find((x) => x.id === projectId);
    if (!me || !p) return;
    let r = db.resources.find((x) => x.project === p.id && x.brief && !x.archived);
    const created = !r;
    if (!r) {
      const n: Resource = {
        id: uid('r'),
        kind: 'note',
        name: tr('{p} brief', { p: p.name }),
        div: p.div,
        parent: null,
        url: '',
        body: '',
        purpose: tr('The project brief, edited from the project Overview.'),
        project: p.id,
        meeting: null,
        owner: p.lead ?? me.id,
        contributors: [],
        createdBy: me.id,
        createdAt: nowStamp(),
        pinned: false,
        revisions: 0,
        archived: false,
        reports: [],
        brief: true,
        ref: null,
        editedBy: null,
        editedAt: null,
      };
      db.resources.push(n);
      r = db.resources[db.resources.length - 1];
    } else {
      const h = ((r.history as unknown[] | undefined) ?? []) as { n: number; body: string; at: string }[];
      h.push({ n: r.revisions, body: r.body, at: r.editedAt ?? r.createdAt });
      r.history = h;
    }
    if (!r) return;
    r.body = body;
    r.revisions++;
    r.editedAt = nowStamp();
    r.editedBy = me.id;
    logChange(
      db,
      p.div,
      created ? 'created note' : 'saved a revision of',
      { type: 'resource', id: r.id, name: r.name },
      created ? null : tr('Revision {n}', { n: r.revisions - 1 }),
      created ? null : tr('Revision {n}', { n: r.revisions }),
    );
  });
}
