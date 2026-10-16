/* The resource panel (resource_inspector) and the new-resource panel: details, purpose, the note editor with revisions, who is
   responsible, related work, and problems opening a link. From screens/plan.js INSP.res and INSP['new-res']. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { useRoute } from '@/app/router/routes';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button, IconButton, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMeeting, openOffer, openPerson } from '@/lib/open';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { isPinned, togglePin } from '@/features/pins/services/pins';
import { TaskRow } from '@/features/work/components/TaskRow';
import { Meta, MetaRow, PeopleSelect } from '@/features/work/components/task-panel/parts';
import { BriefDoc } from '@/features/projects/components/BriefDoc';
import { KIND, host, isHttps, refInfo } from '../services/links';
import {
  REPORT_REASONS,
  addContributor,
  archiveResource,
  canEditRes,
  canSeeRes,
  createResource,
  makeTaskFromResource,
  markFixed,
  moveResource,
  moveTargets,
  removeContributor,
  reportLink,
  resLinks,
  resOf,
  saveNote,
  setPurpose,
  type LinkReport,
} from '../services/resources';
import { ResourceTile } from './Tiles';

const h2 = 'm-0 type-h2';
const quiet = 'my-2.5 grid gap-2.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)]';
const linkBtn =
  'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 py-1 text-d13 text-mute hover:text-ink';

function NoteState({ id, body }: { id: string; body: string }) {
  const state = useUi((u) => (u.noteState as Record<string, string | null> | undefined)?.[id]);
  const draft = useUi((u) => (u.noteDraft as Record<string, string> | undefined)?.[id]);
  const rev = useWorkspace((db) => resOf(db, id)?.revisions ?? 0);
  if (state === 'failed')
    return (
      <span className="inline-flex items-center gap-1 text-d12 text-danger">
        <Icon name="warning" size="xs" />
        {t('Could not save. Your text is still here.')}
      </span>
    );
  if (draft != null && draft !== body) return <span className="text-d12 text-mute">{t('Unsaved changes')}</span>;
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1 text-d12 text-green-ink">
        <Icon name="check" size="xs" />
        {t('Saved as revision {n}', { n: rev })}
      </span>
    );
  return null;
}

function NoteEditor({ r, edit }: { r: { id: string; body: string; revisions: number }; edit: boolean }) {
  const draft = useUi((u) => (u.noteDraft as Record<string, string> | undefined)?.[r.id]);
  if (!edit) return <div className="max-w-[72ch] text-d16 leading-6 whitespace-pre-line">{r.body}</div>;
  return (
    <>
      <textarea
        id="r-body"
        className={cn(textareaClass, 'min-h-[200px] text-d15 leading-[23px]')}
        value={draft ?? r.body}
        onChange={(e) => {
          const v = e.target.value;
          setUi((u) => {
            u.noteDraft = { ...(u.noteDraft ?? {}), [r.id]: v };
            u.noteState = { ...(u.noteState ?? {}), [r.id]: null };
          });
        }}
      />
      <span className="text-d12h text-mute">
        {t('Saving makes revision {n}. Earlier text is kept.', { n: r.revisions + 1 })}
      </span>
      <div className="mt-2">
        <Button
          small
          onClick={() => {
            const body = draft ?? r.body;
            void saveNote(r.id, body).then((ok) => {
              setUi((u) => {
                const { [r.id]: _kept, ...others } = (u.noteDraft as Record<string, string> | undefined) ?? {};
                u.noteDraft = ok ? others : { ...others, [r.id]: body };
                u.noteState = {
                  ...(u.noteState ?? {}),
                  [r.id]: ok ? 'saved' : 'failed',
                };
              });
            });
          }}
        >
          {t('Save revision')}
        </Button>
      </div>
    </>
  );
}

function MoveField({ id }: { id: string }) {
  const r = useWorkspace((db) => resOf(db, id));
  const opts = useWorkspace((db) => {
    const x = resOf(db, id);
    return x ? moveTargets(db, x).map((f) => ({ value: f.id, label: f.name })) : [];
  });
  if (!r) return null;
  return (
    <Field label={t('Folder')} htmlFor="r-move">
      <SelectField
        id="r-move"
        value={r.parent ?? ''}
        options={[{ value: '', label: r.project ? t('Top of the project') : t('Top of the workspace') }, ...opts]}
        onChange={(v) => {
          void moveResource(id, v || null);
        }}
      />
    </Field>
  );
}

function MakeTask({ id, name }: { id: string; name: string }) {
  const me = useMe();
  const open = useUi((u) => u.form === 'rtask');
  const [title, setTitle] = useState(t('Follow up on {name}', { name }));
  const [who, setWho] = useState(me?.id ?? '');
  const [due, setDue] = useState('');
  const [err, setErr] = useState('');
  if (!open)
    return (
      <button
        type="button"
        className={linkBtn}
        onClick={() => {
          setUi((u) => {
            u.form = 'rtask';
          });
        }}
      >
        <Icon name="plus" size="xs" /> {t('Make a task from this')}
      </button>
    );
  return (
    <div className={quiet}>
      <Field label={t('Task')} htmlFor="rt-title" required help={err} error>
        <input
          id="rt-title"
          className={cn(inputClass, err && invalidClass)}
          value={title}
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Who')} htmlFor="rt-who">
          <PeopleSelect id="rt-who" value={who} onChange={setWho} />
        </Field>
        <Field label={t('Due')} htmlFor="rt-due" optional>
          <DateField id="rt-due" kind="due" label={t('Due')} value={due} onChange={setDue} />
        </Field>
      </Grid2>
      <p className="m-0 text-mute type-small">
        {t('For someone else this is sent as an offer. Nothing is assigned until they accept.')}
      </p>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            if (!title.trim()) {
              setErr(t('Give the task a title.'));
              return;
            }
            void makeTaskFromResource(id, { title: title.trim(), who, due: due || null });
          }}
        >
          {t('Create')}
        </Button>
        <Button
          small
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function ReportLink({ id, owner }: { id: string; owner: string }) {
  const open = useUi((u) => u.form === 'report');
  const [why, setWhy] = useState('notfound');
  const [note, setNote] = useState('');
  const first = useWho().first(owner);
  if (!open)
    return (
      <button
        type="button"
        className={linkBtn}
        onClick={() => {
          setUi((u) => {
            u.form = 'report';
          });
        }}
      >
        {t('Report it will not open')}
      </button>
    );
  return (
    <div className={quiet}>
      <Field label={t('What happens?')} htmlFor="rp-why">
        <SelectField
          id="rp-why"
          value={why}
          onChange={setWhy}
          options={Object.entries(REPORT_REASONS).map(([value, label]) => ({ value, label: t(label) }))}
        />
      </Field>
      <Field label={t('Details')} htmlFor="rp-note" optional>
        <input
          id="rp-note"
          className={inputClass}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <p className="m-0 text-mute type-small">
        {t('{who} is told. The link and its tasks stay as they are.', { who: first })}
      </p>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            void reportLink(id, why, note);
          }}
        >
          {t('Report')}
        </Button>
        <Button
          small
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function AddContributor({ id }: { id: string }) {
  const r = useWorkspace((db) => resOf(db, id));
  const people = useWorkspace((db) => db.people);
  if (!r) return null;
  const options = people
    .filter(
      (q) => q.status === 'active' && q.id !== r.owner && !r.contributors.includes(q.id) && (q.div === r.div || !q.div),
    )
    .map((q) => ({ value: q.id, label: q.name }));
  return (
    <div className="mt-2.5">
      <SelectField
        value=""
        label={t('Add a contributor')}
        people
        options={[{ value: '', label: t('Add a contributor') }, ...options]}
        onChange={(v) => {
          if (v) void addContributor(id, v);
        }}
      />
    </div>
  );
}

function ResourcePanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const r = resOf(db, insp.id);
  const [purpose, setPurposeText] = useState(r?.purpose ?? '');
  if (!me) return null;
  if (!r || !canSeeRes(me, r))
    return (
      <>
        <InspectorHead>{t('Resource')}</InspectorHead>
        <div className="grid gap-2 p-7">
          <b className="type-h3">{t('Not available')}</b>
          <p className="m-0 text-mute">{t('It was archived or is outside your workspace.')}</p>
        </div>
      </>
    );
  const edit = canEditRes(me, r);
  const p = r.project ? db.projects.find((x) => x.id === r.project) : undefined;
  const mt = r.meeting ? db.meetings.find((x) => x.id === r.meeting) : undefined;
  const tasks = resLinks(db, r);
  const offers = db.offers.filter((o) => o.resource === r.id && o.state === 'pending');
  const reports = (r.reports as LinkReport[]).filter((v) => v.state === 'open');
  const info = r.kind === 'link' && r.ref ? refInfo(db, r.ref) : null;
  const pinned = isPinned(db, me, 'res', r.id);
  return (
    <>
      <InspectorHead>{t(KIND[r.kind][0])}</InspectorHead>
      <div className="mt-3 mb-2.5 flex items-center gap-3">
        <ResourceTile r={r} large />
        <h2 className={h2}>{r.name}</h2>
      </div>
      {r.kind === 'link' && r.ref && (
        <div className="mb-3.5 flex items-center gap-2.5">
          {info ? (
            <Button variant="primary" onClick={info.open}>
              <Icon name="chevron" />
              {t('Open')} {info.name}
            </Button>
          ) : (
            <span className="text-mute">{t('Removed page')}</span>
          )}
        </div>
      )}
      {r.kind === 'link' && !r.ref && (
        <>
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
            <a
              className={buttonClass('primary', false, 'no-underline')}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external" />
              {t('Open link')}
            </a>
            <span className="text-mute type-small">{host(r.url)}</span>
          </div>
          <p className="mt-0 mb-3.5 text-mute type-small">
            {t('Access is managed in Drive, not here. Opening it never grants anyone access.')}
          </p>
        </>
      )}
      {r.kind === 'folder' && (
        <div className="mb-3.5">
          <Button
            onClick={() => {
              setUi((u) => {
                u.insp = null;
                u.folder = r.id;
                u.rq = '';
              });
            }}
          >
            <Icon name="folder" />
            {t('Open folder')}
          </Button>
        </div>
      )}
      <Field label={t('Purpose')} htmlFor="r-purpose" optional={t('Short note for others')}>
        {edit ? (
          <textarea
            id="r-purpose"
            className={cn(textareaClass, 'min-h-[60px]')}
            placeholder={t('What is this for? Who should use it?')}
            value={purpose}
            onChange={(e) => {
              setPurposeText(e.target.value);
            }}
            onBlur={() => {
              if (purpose.trim() !== r.purpose) void setPurpose(r.id, purpose);
            }}
          />
        ) : (
          <p className="m-0 type-small">{r.purpose || <span className="text-mute">{t('No purpose written.')}</span>}</p>
        )}
      </Field>
      {r.brief && (
        <>
          <BriefDoc html={r.body} small />
          <div className="mt-3.5">
            <Link className={buttonClass('default', true, 'no-underline')} to={`/projects/${r.project ?? ''}`}>
              <Icon name="edit" />
              {t('Edit in the project Overview')}
            </Link>
          </div>
        </>
      )}
      {r.kind === 'note' && !r.brief && (
        <div className="mb-3.5 grid gap-1.5">
          <label htmlFor="r-body" className="flex items-center gap-1.5 text-d13 font-[550]">
            {t('Note')}{' '}
            <span className="ml-auto font-normal">
              <NoteState id={r.id} body={r.body} />
            </span>
          </label>
          <NoteEditor r={r} edit={edit} />
        </div>
      )}
      {edit && <MoveField id={r.id} />}
      <div className="my-[18px] h-px bg-line-strong" />
      <h3 className="mt-0 mb-1.5 type-h3">{t('Responsible')}</h3>
      <div className="mt-1 grid gap-1.5 text-d13">
        <div className="flex items-center gap-2">
          <Avatar id={r.owner} size="sm" />
          <a
            className="cursor-pointer no-underline"
            onClick={() => {
              openPerson(r.owner);
            }}
          >
            {who.name(r.owner)}
          </a>
          <small className="text-mute">{t('owner')}</small>
        </div>
        {r.contributors.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <Avatar id={c} size="sm" />
            <a
              className="cursor-pointer no-underline"
              onClick={() => {
                openPerson(c);
              }}
            >
              {who.name(c)}
            </a>
            <small className="text-mute">{t('contributor')}</small>
            {edit && (
              <IconButton
                className="ml-auto size-6"
                aria-label={t('Remove {who}', { who: who.first(c) })}
                onClick={() => {
                  void removeContributor(r.id, c);
                }}
              >
                <Icon name="close" size="xs" />
              </IconButton>
            )}
          </div>
        ))}
      </div>
      {edit && <AddContributor id={r.id} />}
      <p className="my-2 text-mute type-small">
        {t('Being listed here does not change who can open the file in Drive.')}
      </p>
      <SectionHeading count={tasks.length + offers.length}>{t('Related work')}</SectionHeading>
      <div className="flex flex-col gap-[3px]">
        {tasks.map((x) => (
          <TaskRow key={x.id} task={x} owner noCtx />
        ))}
        {offers.map((o) => (
          <div
            key={o.id}
            className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
            role="button"
            tabIndex={0}
            onClick={() => {
              openOffer(o.id);
            }}
          >
            <Avatar id={o.to} size="xs" />
            <div className="min-w-0 flex-1">
              {o.title}
              <small className="block text-d12h text-mute">{t('Offered to {who}', { who: who.first(o.to) })}</small>
            </div>
            <State label={t('Waiting for an answer')} icon="clock" tone="ink2" />
          </div>
        ))}
        {!tasks.length && !offers.length && (
          <div className="px-2.5 py-3 text-d13h text-mute">{t('No tasks linked yet.')}</div>
        )}
      </div>
      <MakeTask id={r.id} name={r.name} />
      {r.kind === 'link' && (
        <>
          <SectionHeading count={reports.length}>{t('Problems opening it')}</SectionHeading>
          {reports.map((v) => (
            <Notice key={v.id} tone="warn" icon="warning" title={<b>{t(REPORT_REASONS[v.reason] ?? v.reason)}</b>}>
              <p>
                {t('Reported by {who}', { who: who.stamp(v.by, v.at) })}
                {v.note ? `: ${v.note}` : ''}
              </p>
              {r.owner === me.id && (
                <div className="mt-2">
                  <Button
                    small
                    onClick={() => {
                      void markFixed(r.id, v.id);
                    }}
                  >
                    {t('Fixed')}
                  </Button>
                </div>
              )}
            </Notice>
          ))}
          <ReportLink id={r.id} owner={r.owner} />
        </>
      )}
      <div className="my-[18px] h-px bg-line-strong" />
      <Meta>
        {p && (
          <MetaRow label={t('Project')}>
            <Link to={`/projects/${p.id}/resources`}>{p.name}</Link>
          </MetaRow>
        )}
        {mt && (
          <MetaRow label={t('Meeting')}>
            <a
              className="cursor-pointer"
              onClick={() => {
                openMeeting(mt.id);
              }}
            >
              {mt.title}
            </a>
          </MetaRow>
        )}
        <MetaRow label={t('Workspace')}>{divisionOf(r.div)?.short}</MetaRow>
        <MetaRow label={t('Created')}>
          <Avatar id={r.createdBy} size="xs" />
          {who.stamp(r.createdBy, r.createdAt)}
        </MetaRow>
        {r.editedAt && r.editedBy && <MetaRow label={t('Last saved')}>{who.stamp(r.editedBy, r.editedAt)}</MetaRow>}
      </Meta>
      <div className="mt-[18px] flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void togglePin(me, 'res', r.id);
          }}
        >
          <Icon name="pin" />
          {pinned ? t('Unpin') : t('Pin')}
        </Button>
        {edit && (
          <Button
            variant="danger"
            onClick={() => {
              void archiveResource(r.id);
            }}
          >
            <Icon name="archive" />
            {t('Archive')}
          </Button>
        )}
      </div>
    </>
  );
}

function NewResourcePanel({ insp }: { insp: InspectorRef }) {
  const ws = useWs();
  const db = useWorkspace((w) => w);
  const kind = (insp.kind as 'folder' | 'note' | 'link' | undefined) ?? 'note';
  const p = typeof insp.project === 'string' ? db.projects.find((x) => x.id === insp.project) : undefined;
  const pageFolder = useUi((u) => u.folder);
  const onResources = useRoute().page === 'resources';
  const folder =
    typeof insp.parent === 'string' && insp.parent
      ? resOf(db, insp.parent)
      : !p && pageFolder && onResources
        ? resOf(db, pageFolder)
        : undefined;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [purpose, setPurposeText] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const where = folder ? folder.name : p ? p.name : (divisionOf(ws)?.name ?? '');
  const save = () => {
    const e = {
      name: name.trim() ? undefined : t('Give it a name.'),
      url: kind === 'link' && !isHttps(url.trim()) ? t('Paste a full link starting with https://') : undefined,
    };
    setErrors(e);
    if (e.name || e.url) return;
    void createResource({
      kind,
      name: name.trim(),
      url: url.trim(),
      purpose: purpose.trim(),
      body,
      project: p?.id ?? null,
      parent: folder?.id ?? null,
      div: ws,
    });
  };
  return (
    <>
      <InspectorHead>
        {kind === 'folder' ? t('New folder') : kind === 'note' ? t('New note') : t('Add a link')}
      </InspectorHead>
      <h2 className="mt-3 mb-1 type-h2">
        {kind === 'link' ? t('Link a file or page') : kind === 'note' ? t('Write a note') : t('Name the folder')}
      </h2>
      <p className="mt-0 mb-3.5 text-mute type-small">{t('In {where}', { where })}</p>
      <Field label={t('Name')} htmlFor="n-name" required help={errors.name} error>
        <input
          id="n-name"
          className={cn(inputClass, errors.name && invalidClass)}
          value={name}
          autoFocus
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Field>
      {kind === 'link' && (
        <Field
          label={t('Link')}
          htmlFor="n-url"
          required
          help={errors.url ?? t('Files stay in your drive. Only the link is stored.')}
          error={!!errors.url}
        >
          <input
            id="n-url"
            className={cn(inputClass, errors.url && invalidClass)}
            placeholder="https://drive.google.com/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
          />
        </Field>
      )}
      <Field label={t('Purpose')} htmlFor="n-purpose" optional>
        <input
          id="n-purpose"
          className={inputClass}
          placeholder={t('What is this for?')}
          value={purpose}
          onChange={(e) => {
            setPurposeText(e.target.value);
          }}
        />
      </Field>
      {kind === 'note' && (
        <Field label={t('Note')} htmlFor="n-body">
          <textarea
            id="n-body"
            className={cn(textareaClass, 'min-h-[200px] text-d15 leading-[23px]')}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
            }}
          />
        </Field>
      )}
      <div className="mt-[18px] flex gap-2">
        <Button variant="primary" onClick={save}>
          {t('Save')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS.res = ResourcePanel;
PANELS['new-res'] = NewResourcePanel;
