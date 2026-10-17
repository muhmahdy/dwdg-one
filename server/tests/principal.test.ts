import { describe, expect, it } from 'vitest';
import { bearerToken, resolvePrincipal } from '../src/lib/auth/principal.ts';
import { HttpError } from '../src/lib/errors.ts';
import { PERSON, fakeHub } from './helpers.ts';

const people = {
  'u-adm': PERSON({ id: 'adm', role: 'director', div: 'sng', isAdmin: true }),
  'u-pres': PERSON({ id: 'pres', role: 'president', div: null }),
  'u-vp': PERSON({ id: 'vpx', role: 'vp', div: null }),
  'u-brd': PERSON({ id: 'brd', role: 'board', div: null }),
  'u-mem': PERSON({ id: 'mem_ee', role: 'member', div: 'ee' }),
  'u-new': PERSON({ id: 'newbie', role: 'member', div: 'ee', status: 'pending' }),
  'u-odd': PERSON({ id: 'odd', role: 'wizard', div: 'moon' }),
};
const tokens: Record<string, string> = { 't-unlinked': 'u-nobody' };
for (const u of Object.keys(people)) tokens[`t-${u}`] = u;
const hub = fakeHub({ tokens, people });
const as = (t: string) => resolvePrincipal(hub, t);

describe('bearerToken', () => {
  it('reads "Bearer <token>" and nothing else', () => {
    expect(bearerToken('Bearer abc.def')).toBe('abc.def');
    expect(bearerToken('bearer abc')).toBe('abc');
    for (const bad of [undefined, '', 'abc', 'Basic abc', 'Bearer', 'Bearer a b']) expect(bearerToken(bad)).toBeNull();
  });
});

describe('resolvePrincipal', () => {
  it('refuses a missing or unknown token with 401', async () => {
    await expect(resolvePrincipal(hub, null)).rejects.toMatchObject({ status: 401, code: 'unauthenticated' });
    await expect(as('forged')).rejects.toBeInstanceOf(HttpError);
  });

  it('knows a signed-in account that is not linked to a person yet', async () => {
    expect(await as('t-unlinked')).toMatchObject({ personId: null, active: false, canWrite: false, rank: 0, role: null });
  });

  it('works out rank, write right and board status like the database helpers', async () => {
    expect(await as('t-u-mem')).toMatchObject({ personId: 'mem_ee', rank: 1, active: true, canWrite: true, board: false, top: false, div: 'ee' });
    expect(await as('t-u-pres')).toMatchObject({ rank: 5, top: true, canWrite: true });
    expect(await as('t-u-vp')).toMatchObject({ rank: 4, top: true });
    expect(await as('t-u-adm')).toMatchObject({ rank: 9, admin: true });
    expect(await as('t-u-brd')).toMatchObject({ rank: 0, board: true, canWrite: false });
  });

  it('gives a person who is not active no rights and no admin rank', async () => {
    expect(await as('t-u-new')).toMatchObject({ personId: 'newbie', active: false, canWrite: false });
    const hub2 = fakeHub({
      tokens: { x: 'u' },
      people: { u: PERSON({ status: 'pending', isAdmin: true, role: 'president' }) },
    });
    expect(await resolvePrincipal(hub2, 'x')).toMatchObject({ admin: false, top: false, canWrite: false });
  });

  it('ignores a role or division it does not know instead of trusting it', async () => {
    expect(await as('t-u-odd')).toMatchObject({ role: null, div: null, rank: 0 });
  });
});
