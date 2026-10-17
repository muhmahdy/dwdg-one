import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/bff/api';
import { bffWorkspaceRepository } from '@/lib/bff/workspace-repository';
import { divisionStatusStore, isDivisionOffline } from '@/lib/workspace/division-status';
import { SaveError } from '@/lib/workspace/repository';
import { resetTransactions, toastStore, workspaceStore } from '@/lib/workspace/transaction';

let session: { access_token: string } | null = { access_token: 'tok-123' };
vi.mock('@/lib/supabase/client', () => ({
  supabase: () => ({ auth: { getSession: () => Promise.resolve({ data: { session } }) } }),
}));

const fetchMock = vi.fn();
const reply = (status: number, body: unknown) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
const row = (id: string, doc: Record<string, unknown> = { id }) => ({ id, pos: 0, doc });

beforeEach(() => {
  session = { access_token: 'tok-123' };
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  divisionStatusStore.set({});
});
afterEach(() => {
  vi.unstubAllGlobals();
  resetTransactions();
});

describe('bff workspace repository: load', () => {
  it('asks the server with the access token, builds the workspace from the rows and keeps the division statuses', async () => {
    fetchMock.mockReturnValue(
      reply(200, {
        rows: { people: [row('mem_ee', { id: 'mem_ee', name: 'M' })], tasks: [row('t1')] },
        divisions: { ee: 'ok', hr: 'not_configured', fnl: 'unavailable' },
      }),
    );
    const ws = await bffWorkspaceRepository.load();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; headers: Record<string, string> }];
    expect(url).toBe('/api/workspace');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(ws.tasks).toEqual([{ id: 't1' }]);
    expect(divisionStatusStore.get()).toEqual({ ee: 'ok', hr: 'not_configured', fnl: 'unavailable' });
    expect(isDivisionOffline(divisionStatusStore.get(), 'hr')).toBe(true);
    expect(isDivisionOffline(divisionStatusStore.get(), 'ee')).toBe(false);
    expect(isDivisionOffline({}, 'hr')).toBe(false); // modes without a server never mark a division offline
  });

  it('refuses a reply that is not the expected shape', async () => {
    fetchMock.mockReturnValue(reply(200, { rows: 'nope' }));
    await expect(bffWorkspaceRepository.load()).rejects.toThrow();
  });

  it('fails without calling the server when nobody is signed in', async () => {
    session = null;
    await expect(bffWorkspaceRepository.load()).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('turns a server refusal into an ApiError with its status and code', async () => {
    fetchMock.mockReturnValue(reply(403, { error: 'not_linked' }));
    const err: unknown = await bffWorkspaceRepository.load().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 403, code: 'not_linked' });
  });
});

describe('bff workspace repository: apply', () => {
  it('posts the change set as JSON with the token', async () => {
    fetchMock.mockReturnValue(reply(200, { ok: true }));
    const changes = { tasks: { upsert: [row('t1', { zeta: 1, alpha: 2, id: 't1' })], delete: ['t0'] } };
    await bffWorkspaceRepository.apply(changes);
    const [url, init] = fetchMock.mock.calls[0] as [
      string,
      { method: string; body: string; headers: Record<string, string> },
    ];
    expect(url).toBe('/api/changes');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ changes }));
  });

  it.each([
    [403, 'forbidden'],
    [409, 'division_unavailable'],
    [500, 'internal_error'],
  ])('rejects with a SaveError when the server answers %i %s, so the store rolls back', async (status, code) => {
    fetchMock.mockReturnValue(reply(status, { error: code }));
    await expect(bffWorkspaceRepository.apply({ tasks: { upsert: [row('t1')] } })).rejects.toBeInstanceOf(SaveError);
  });

  it('after a partial save: rejects, then reloads what the server holds and says some changes were saved', async () => {
    fetchMock
      .mockReturnValueOnce(reply(502, { error: 'partial_save', applied: ['hub'], failed: ['sng'] }))
      .mockReturnValueOnce(
        reply(200, { rows: { people: [row('mem_ee')], tasks: [row('t_saved')] }, divisions: { sng: 'ok' } }),
      );
    await expect(bffWorkspaceRepository.apply({ tasks: { upsert: [row('t_saved')] } })).rejects.toBeInstanceOf(
      SaveError,
    );
    await vi.waitFor(() => {
      expect(workspaceStore.get()?.tasks.map((t) => t.id)).toEqual(['t_saved']);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe('/api/workspace');
    expect(toastStore.get()?.msg).toContain('saved');
  });

  it('does not reload after an ordinary refusal', async () => {
    fetchMock.mockReturnValue(reply(403, { error: 'forbidden' }));
    await expect(bffWorkspaceRepository.apply({ tasks: { upsert: [row('t1')] } })).rejects.toBeInstanceOf(SaveError);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects with a SaveError when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(bffWorkspaceRepository.apply({})).rejects.toBeInstanceOf(SaveError);
  });
});
