import { z } from 'zod';

const schema = z.object({
  HUB_SUPABASE_URL: z.url(),
  HUB_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  HUB_SUPABASE_SERVICE_KEY: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  CRON_SECRET: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  CORS_ORIGIN: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  CLIENT_IP_HEADER: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? 'x-forwarded-for' : v.toLowerCase()))
    .refine((v) => /^[a-z][a-z0-9-]*$/.test(v), 'a header name'),
});

export interface Config {
  hubUrl: string;
  hubPublishableKey: string;
  hubServiceKey: string;
  port: number;
  /** The shared secret of the scheduled jobs (`/api/cron/*`). Without it those routes are switched off. */
  cronSecret: string | undefined;
  /** Set only when the browser calls the server from another origin. */
  corsOrigin: string | undefined;
  /** The request header in which the host in front of the server puts the visitor's address (lower case). */
  clientIpHeader: string;
}

export type Env = Readonly<Record<string, string | undefined>>;

/** Reads the hub settings. Only the hub is required: the server must start with no division project at all. */
export function loadConfig(env: Env = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    // Name the variables, never print their values.
    const names = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    throw new Error(`Server settings are missing or invalid: ${names.join(', ')} (see server/.env.example)`);
  }
  const e = parsed.data;
  return {
    hubUrl: e.HUB_SUPABASE_URL,
    hubPublishableKey: e.HUB_SUPABASE_PUBLISHABLE_KEY,
    hubServiceKey: e.HUB_SUPABASE_SERVICE_KEY,
    port: e.PORT,
    cronSecret: e.CRON_SECRET,
    corsOrigin: e.CORS_ORIGIN,
    clientIpHeader: e.CLIENT_IP_HEADER,
  };
}
