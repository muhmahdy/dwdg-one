import { z } from 'zod';

const schema = z.object({
  VITE_SUPABASE_URL: z.url().optional().or(z.literal('')),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  VITE_DEMO_MODE: z.enum(['true', 'false']).optional(),
});

const parsed = schema.parse(import.meta.env);

export const env = {
  supabaseUrl: parsed.VITE_SUPABASE_URL ?? '',
  supabaseKey: parsed.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
  /** Demo mode (decision M9): in-memory demo workspace, persona picker, fixed demo date. Never in production builds. */
  demo: parsed.VITE_DEMO_MODE === 'true',
};

if (import.meta.env.PROD && env.demo && env.supabaseUrl) {
  throw new Error('Demo mode must not be combined with a Supabase project: unset VITE_DEMO_MODE for production builds.');
}
