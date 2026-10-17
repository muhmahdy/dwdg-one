import type { WorkspaceRepository } from '@/lib/workspace/repository';
import { SaveError } from '@/lib/workspace/repository';
import { rowsByTable } from '@/lib/workspace/rows-schema';
import { compose } from '@/lib/workspace/shape';
import { supabase } from './client';

/* Production: load_workspace() returns every row the signed-in person may see (RLS), apply_changes() saves one change
   set in one transaction. The payload is sent as text so nothing on the way can reorder the keys inside a record. */
export const supabaseWorkspaceRepository: WorkspaceRepository = {
  async load() {
    const res: { data: unknown; error: { message: string } | null } = await supabase().rpc('load_workspace');
    if (res.error) throw new Error(`load_workspace failed: ${res.error.message}`);
    return compose(rowsByTable.parse(res.data));
  },
  async apply(changes) {
    const { error } = await supabase().rpc('apply_changes', { p: JSON.stringify(changes) });
    if (error) throw new SaveError(`apply_changes failed: ${error.code} ${error.message}`);
  },
};
