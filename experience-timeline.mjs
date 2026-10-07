import { iso, addDays, diffDays, validDate } from './model.mjs';

const WINDOW_DAYS = 21;
const DAY_UNITS = 36;
const ROW_UNITS = 72;

/** Pure geometry derived from saved dates; shared by the renderer and tests. */
export function buildTimelineModel(store, tasks, { selectedDate = iso(), projectId } = {}) {
  const selected = validDate(selectedDate) ? selectedDate : iso();
  const start = addDays(selected, -3), end = addDays(start, WINDOW_DAYS - 1);
  const ids = projectId ? new Set([projectId]) : new Set(tasks.map(task => task.projectId));
  const rows = tasks.map(task => ({ kind: 'task', id: task.id, projectId: task.projectId, record: task, start: task.start, end: task.end }));
  const milestones = Object.entries(store.extras.byProject).filter(([id]) => ids.has(id)).flatMap(([id, extra]) => extra.milestones.map(record => ({ kind: 'milestone', id: record.id, projectId: id, record, start: record.due_date, end: record.due_date })));
  milestones.sort((a, b) => (a.start || '9999').localeCompare(b.start || '9999') || a.record.title.localeCompare(b.record.title));
  rows.push(...milestones);
  rows.forEach((row, index) => {
    row.index = index;
    row.dated = validDate(row.start) && validDate(row.end);
    row.actualStart = row.dated ? diffDays(row.start, start) : null;
    row.actualEnd = row.dated ? diffDays(row.end, start) + 1 : null;
    row.left = row.dated ? Math.max(0, row.actualStart) : null;
    row.right = row.dated ? Math.min(WINDOW_DAYS, row.actualEnd) : null;
    row.visible = row.dated && row.right > row.left;
    row.clippedStart = row.visible && row.actualStart < 0;
    row.clippedEnd = row.visible && row.actualEnd > WINDOW_DAYS;
  });
  const taskRows = new Map(rows.filter(row => row.kind === 'task').map(row => [row.id, row]));
  const connections = [];
  for (const target of taskRows.values()) {
    const source = taskRows.get(target.record.dependsOn);
    if (!source || !source.dated || !target.dated || !source.visible || !target.visible) continue;
    // Never draw a connector at a clipped boundary as if it were a real date.
    if (source.actualEnd < 0 || source.actualEnd > WINDOW_DAYS || target.actualStart < 0 || target.actualStart >= WINDOW_DAYS) continue;
    const x1 = source.actualEnd * DAY_UNITS, x2 = target.actualStart * DAY_UNITS;
    const y1 = source.index * ROW_UNITS + ROW_UNITS / 2, y2 = target.index * ROW_UNITS + ROW_UNITS / 2;
    let path;
    if (x2 >= x1 + 16) {
      const middle = (x1 + x2) / 2;
      path = `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}`;
    } else {
      const turnRight = Math.min(WINDOW_DAYS * DAY_UNITS - 4, x1 + 12);
      const turnLeft = Math.max(4, x2 - 12), middleY = (y1 + y2) / 2;
      path = `M ${x1} ${y1} H ${turnRight} V ${middleY} H ${turnLeft} V ${y2} H ${x2}`;
    }
    connections.push({ from: source.id, to: target.id, path, x1, x2, y1, y2 });
  }
  return { start, end, days: WINDOW_DAYS, width: WINDOW_DAYS * DAY_UNITS, rowHeight: ROW_UNITS, rows, connections };
}

export function renderTimeline(ctx, tasks, options = {}) {
  const { store, t, icon, escapeHtml: h, formatDate, avatar } = ctx;
  const model = buildTimelineModel(store, tasks, options), today = iso();
  const date = value => validDate(value) ? formatDate(value, { day: 'numeric', month: 'short' }) : t('Date not set', 'Tanggal belum diatur');
  const project = id => store.core.projects.find(item => item.id === id);
  const task = id => store.core.tasks.find(item => item.id === id);
  const status = value => ({ todo: t('Not started', 'Belum dimulai'), progress: t('In progress', 'Sedang berjalan'), blocked: t('Blocked', 'Terhambat'), done: t('Completed', 'Selesai') })[value] || value;
  const todayIndex = diffDays(today, model.start), showToday = todayIndex >= 0 && todayIndex < model.days;
  const dayCells = Array.from({ length: model.days }, (_, index) => {
    const day = addDays(model.start, index), weekend = [0, 6].includes(new Date(`${day}T12:00:00`).getDay());
    return `<div class="et-day${weekend ? ' is-weekend' : ''}${day === today ? ' is-today' : ''}"><small>${h(formatDate(day, { weekday: 'narrow' }))}</small><strong>${Number(day.slice(-2))}</strong><span>${index === 0 || day.endsWith('-01') ? h(formatDate(day, { month: 'short' })) : ''}</span></div>`;
  }).join('');
  const taskAttributes = row => `data-action="timeline-task" data-id="${h(row.id)}"`;
  const milestoneAttributes = row => `data-action="record" data-collection="milestones" data-source="extras" data-project="${h(row.projectId)}" data-id="${h(row.id)}"`;
  const htmlRows = model.rows.map(row => {
    const record = row.record, milestone = row.kind === 'milestone', dependency = !milestone && record.dependsOn ? task(record.dependsOn) : null;
    const owner = milestone ? record.owner_id : record.assignee;
    const range = milestone ? date(row.start) : `${date(row.start)} — ${date(row.end)}`;
    const accessible = `${record.title} · ${range}${milestone ? ` · ${t('Milestone', 'Tonggak')}` : ` · ${status(record.status)}`}${dependency ? ` · ${t('Depends on', 'Bergantung pada')}: ${dependency.title}` : ''}`;
    const ownerName = store.core.members.find(item => item.id === owner)?.name || t('Unassigned', 'Belum ditugaskan');
    const label = `<div class="et-label"><button class="et-label-main" ${milestone ? milestoneAttributes(row) : `data-action="task" data-id="${h(row.id)}"`} aria-label="${h(accessible)}"><strong>${milestone ? '<i class="et-small-diamond" aria-hidden="true"></i>' : ''}${h(record.title)}</strong><small>${h(range)}${!options.projectId && project(row.projectId) ? ` · ${h(project(row.projectId).name)}` : ''}</small>${dependency ? `<span class="et-dependency-label">${icon('link')}<span>${h(dependency.title)}</span></span>` : ''}</button><span class="et-owner" title="${h(ownerName)}">${avatar ? avatar(owner) : h(ownerName.slice(0, 2))}</span></div>`;
    let mark;
    if (!row.visible) {
      mark = `<button class="et-outside" ${milestone ? milestoneAttributes(row) : taskAttributes(row)} aria-label="${h(accessible)}">${row.dated ? icon(row.actualEnd <= 0 ? 'left' : 'right') : icon('calendar')}<span>${h(row.dated ? t('Outside this window', 'Di luar rentang ini') : t('Add a target date', 'Tambah tanggal target'))}</span><small>${h(range)}</small></button>`;
    } else if (milestone) {
      const position = (row.actualStart + 0.5) / model.days * 100;
      mark = `<button class="et-milestone et-milestone-${h(record.status || 'planned')}" style="left:${position}%" ${milestoneAttributes(row)} aria-label="${h(accessible)}" title="${h(accessible)}"><span aria-hidden="true"></span><i>${h(record.title)}</i></button>`;
    } else {
      mark = `<button class="et-bar et-bar-${h(record.status)}${row.clippedStart ? ' clips-start' : ''}${row.clippedEnd ? ' clips-end' : ''}" style="left:${row.left / model.days * 100}%;width:${(row.right - row.left) / model.days * 100}%" ${taskAttributes(row)} aria-label="${h(accessible)}" title="${h(accessible)}">${row.clippedStart ? '<span class="et-continuation" aria-hidden="true">‹</span>' : ''}<span class="et-bar-copy">${h(record.title)}</span>${row.clippedEnd ? '<span class="et-continuation" aria-hidden="true">›</span>' : ''}</button>`;
    }
    return `<div class="et-row et-row-${row.kind}" data-key="timeline-${row.kind}-${h(row.id)}">${label}<div class="et-lane">${mark}</div></div>`;
  }).join('');
  const svg = model.connections.length ? `<svg class="et-connectors" viewBox="0 0 ${model.width} ${model.rows.length * model.rowHeight}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${model.connections.map(connection => `<path class="et-dependency-path" d="${connection.path}"/><path class="et-dependency-arrow" d="M ${connection.x2 - 4} ${connection.y2 - 3} L ${connection.x2} ${connection.y2} L ${connection.x2 - 4} ${connection.y2 + 3}"/>`).join('')}</svg>` : '';
  const countText = `${tasks.length} ${t('tasks', 'tugas')} · ${model.rows.length - tasks.length} ${t('milestones', 'tonggak')}`;
  return `<div class="et-root"><div class="et-toolbar"><div><h3>${h(date(model.start))} <span>—</span> ${h(date(model.end))}</h3><p>${h(countText)}</p></div><div class="et-window-controls"><button type="button" class="icon-button" data-action="timeline-shift" data-offset="-7" aria-label="${h(t('Show previous seven days', 'Lihat tujuh hari sebelumnya'))}">${icon('left')}</button><span>${model.days} ${h(t('days', 'hari'))}</span><button type="button" class="icon-button" data-action="timeline-shift" data-offset="7" aria-label="${h(t('Show next seven days', 'Lihat tujuh hari berikutnya'))}">${icon('right')}</button></div></div><div class="et-scroll" tabindex="0" role="region" aria-label="${h(t('Task dates and dependencies. Scroll horizontally to explore.', 'Tanggal tugas dan dependensi. Geser mendatar untuk menjelajahi.'))}"><div class="et-canvas"><div class="et-header"><div class="et-header-label"><strong>${h(t('Work & ownership', 'Pekerjaan & penanggung jawab'))}</strong><small>${h(t('Actual dates', 'Tanggal tercatat'))}</small></div><div class="et-days">${dayCells}</div></div>${model.rows.length ? `<div class="et-body">${showToday ? `<div class="et-today-field" aria-hidden="true"><span class="et-today-line" style="left:${(todayIndex + 0.5) / model.days * 100}%"><i></i></span></div>` : ''}${svg}${htmlRows}</div>` : `<div class="et-empty">${icon('gantt')}<strong>${h(t('No work in this view', 'Tidak ada pekerjaan di tampilan ini'))}</strong><p>${h(t('Add tasks or dated milestones, or clear your filters.', 'Tambahkan tugas atau tonggak bertanggal, atau hapus filter.'))}</p></div>`}</div></div><div class="et-footer"><span><i class="et-key-line"></i>${h(t('Saved prerequisite', 'Prasyarat tersimpan'))}</span><span><i class="et-small-diamond"></i>${h(t('Project milestone', 'Tonggak proyek'))}</span><span><i class="et-key-today"></i>${h(t('Today', 'Hari ini'))}</span><p>${h(t('Select a bar to adjust its dates. Hidden or off-window prerequisites are named beside the task.', 'Pilih batang untuk menyesuaikan tanggal. Prasyarat tersembunyi atau di luar rentang tertulis di samping tugas.'))}</p></div></div>`;
}
