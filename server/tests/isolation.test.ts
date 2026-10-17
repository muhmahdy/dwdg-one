/* The browser must never see a division URL, a service key or any code of the server. These checks read the app's source,
   so a careless import or a copied variable name fails here before it can reach a build. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const frontend = join(import.meta.dirname, '../../frontend');

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|tsx|js|mjs|html|css)$/.test(name)) out.push(p);
  }
  return out;
}

describe('the browser app and the server stay apart', () => {
  const sources = files(join(frontend, 'src')).concat(files(join(frontend, 'public')), [join(frontend, 'index.html')]);

  it('reads some files (the check is not vacuous)', () => {
    expect(sources.length).toBeGreaterThan(100);
  });

  it('names no server variable and imports nothing from the server', () => {
    const bad = /SERVICE_KEY|SPOKE_[A-Z]+_|HUB_SUPABASE|@dwdg\/server|from ['"][./@a-z-]*\/server\//;
    const hits = sources.filter((f) => bad.test(readFileSync(f, 'utf8'))).map((f) => relative(frontend, f));
    expect(hits).toEqual([]);
  });

  it('puts no service key into a VITE_ variable', () => {
    const risky = /^\s*VITE_[A-Z_]*(SERVICE|SECRET|DATABASE_URL)/m;
    for (const name of ['.env.example', '.env.local', '.env']) {
      let text = '';
      try {
        text = readFileSync(join(frontend, name), 'utf8');
      } catch {
        continue; // the file does not exist on this machine
      }
      expect(risky.test(text), name).toBe(false);
    }
  });
});
