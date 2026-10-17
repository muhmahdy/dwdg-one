import { z } from 'zod';
import { divisionStatusStore } from '@/lib/workspace/division-status';
import type { WorkspaceRepository } from '@/lib/workspace/repository';
import { SaveError } from '@/lib/workspace/repository';
import { rowsByTable } from '@/lib/workspace/rows-schema';
import { compose } from '@/lib/workspace/shape';
import { t } from '@/lib/i18n';
import { loadWorkspace, showToast } from '@/lib/workspace/transaction';
import { ApiError, api } from './api';

const status = z.enum(['ok', 'not_configured', 'inactive', 'unavailable']);
const loaded = z.object({
  rows: rowsByTable,
  divisions: z.record(z.string(), status),
});

/* `bff` data mode: the same two operations as the Supabase repository, answered by the server. The server returns the
   rows of every project the person may read, in the same shape as load_workspace(), plus which division projects it could
   not reach; the screens of those divisions then say "not connected" instead of showing empty data. */
/* The server saves the hub first and then each division project. If a division project fails after the hub saved, part of
   the change is stored and part is not. The screen cannot tell which, so it reloads what the server holds (the engine puts
   the store back first, then this lands) and says so. */
async function showWhatWasSaved() {
  try {
    loadWorkspace(await bffWorkspaceRepository.load());
    showToast(t('Some of your changes were saved and some were not. The page now shows what was saved.'));
  } catch (error) {
    console.error(error);
  }
}

export const bffWorkspaceRepository: WorkspaceRepository = {
  async load() {
    const body = loaded.parse(await api('/workspace'));
    divisionStatusStore.set(body.divisions);
    return compose(body.rows);
  },
  async apply(changes) {
    try {
      await api('/changes', { method: 'POST', body: JSON.stringify({ changes }) });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'partial_save') void showWhatWasSaved();
      throw new SaveError(`save failed: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  },
};
