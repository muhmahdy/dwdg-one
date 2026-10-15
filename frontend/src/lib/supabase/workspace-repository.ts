import { z } from 'zod';
import type { WorkspaceRepository } from '@/lib/workspace/repository';
import { SaveError } from '@/lib/workspace/repository';
import { compose } from '@/lib/workspace/shape';
import { supabase } from './client';

const rowsByTable = z.record(z.string(), z.array(z.object({ id: z.string(), pos: z.number(), doc: z.unknown() })));

/* Production: load_workspace() returns every row the signed-in person may see (RLS), apply_changes() saves one change
   set in one transaction. The payload is sent as text so nothing on the way can reorder the keys inside a record. */
export const supabaseWorkspaceRepository: WorkspaceRepository = {
  async load() {
    const { data, error } = await supabase().rpc('load_workspace');
    if (error) throw new Error(`load_workspace failed: ${error.message}`);
    return compose(rowsByTable.parse(data));
  },
  async apply(changes) {
    const { error } = await supabase().rpc('apply_changes', { p: JSON.stringify(changes) });
    if (error) throw new SaveError(`apply_changes failed: ${error.code ?? ''} ${error.message}`);
  },
};
