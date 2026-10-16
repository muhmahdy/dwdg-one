/* Sections other modules add to the task panel, so the owner of a record sees where a task comes from in every view (an EE
   follow-up's relationship, a Consulting revision's deliverable). Each section renders nothing for tasks it does not own. */
import type { ComponentType } from 'react';
import type { Task } from '@/types/workspace';

export const TASK_PANEL_EXTRAS: ComponentType<{ task: Task }>[] = [];
export const registerTaskPanelSection = (section: ComponentType<{ task: Task }>) => {
  if (!TASK_PANEL_EXTRAS.includes(section)) TASK_PANEL_EXTRAS.push(section);
};
