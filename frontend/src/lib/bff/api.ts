/* The server in front of the Supabase projects (`bff` data mode). The browser keeps Supabase only for signing in; every
   record goes through /api with the person's own access token, and the server checks it with Supabase again. */
import { env } from '@/app/config/env';
import { supabase } from '@/lib/supabase/client';

/** A refusal from the server: the HTTP status and its short code (`forbidden`, `division_unavailable`, ...). */
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(`${status} ${code}`);
    this.status = status;
    this.code = code;
  }
}

export async function api(path: string, init: { method?: 'GET' | 'POST'; body?: string } = {}): Promise<unknown> {
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError(401, 'unauthenticated');
  const res = await fetch(`${env.apiUrl}/api${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    ...(init.body ? { body: init.body } : {}),
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const code = typeof body === 'object' && body !== null && 'error' in body ? String(body.error) : 'error';
    throw new ApiError(res.status, code);
  }
  return body;
}
