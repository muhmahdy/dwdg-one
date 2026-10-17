import { z } from 'zod';

const schema = z.object({
  VITE_SUPABASE_URL: z.url().optional().or(z.literal('')),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  VITE_DEMO_MODE: z.enum(['true', 'false']).optional(),
  /** Where the workspace comes from: `supabase` (the browser asks Supabase directly), `bff` (through the server) or `demo`. */
  VITE_DATA_MODE: z.enum(['demo', 'supabase', 'bff']).optional().or(z.literal('')),
  /** Origin of the server for `bff` mode. Empty means the same origin (`/api`, proxied in development). */
  VITE_API_URL: z.string().optional(),
});

const parsed = schema.parse(import.meta.env);

export type DataMode = 'demo' | 'supabase' | 'bff';

/** `VITE_DEMO_MODE=true` stays the way to ask for demo mode (npm run dev:demo); otherwise `VITE_DATA_MODE`, default `supabase`. */
const requested = parsed.VITE_DATA_MODE;
const dataMode: DataMode =
  parsed.VITE_DEMO_MODE === 'true' ? 'demo' : requested === 'demo' || requested === 'bff' ? requested : 'supabase';

export const env = {
  supabaseUrl: parsed.VITE_SUPABASE_URL ?? '',
  supabaseKey: parsed.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
  dataMode,
  /** Demo mode (decision M9): in-memory demo workspace, persona picker, fixed demo date. Never in production builds. */
  demo: dataMode === 'demo',
  apiUrl: (parsed.VITE_API_URL ?? '').replace(/\/+$/, ''),
};

if (import.meta.env.PROD && env.demo && env.supabaseUrl) {
  throw new Error(
    'Demo mode must not be combined with a Supabase project: unset VITE_DEMO_MODE for production builds.',
  );
}
