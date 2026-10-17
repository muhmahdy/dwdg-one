/* db(slug): the service-role client of one division project. Only this server holds the URL and key. Callers must have
   checked who is asking BEFORE calling db(): the service role skips row level security, so the check in code is the only
   guard (spec §0.4). Nothing calls it yet in stage H2; the access rules arrive with the first division project (H3). */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../../config.ts';
import { getDivisionEnv, type DivisionId } from './registry.ts';

export class DivisionNotConfigured extends Error {
  readonly slug: string;

  constructor(slug: string) {
    super(`division_not_configured:${slug}`);
    this.name = 'DivisionNotConfigured';
    this.slug = slug;
  }
}

const cache = new Map<string, SupabaseClient>();

export function db(slug: DivisionId, env: Env = process.env): SupabaseClient {
  const env_ = getDivisionEnv(slug, env);
  if (!env_) throw new DivisionNotConfigured(slug);
  const cacheKey = `${slug}|${env_.url}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;
  const client = createClient(env_.url, env_.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  cache.set(cacheKey, client);
  return client;
}
