import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlanningStore, DEFAULT_DIRECTORY, MAX_DOCUMENT_BYTES, PlanningError, validateWorkspace, workspaceMarkdown } from './planner-store.mjs';

const STATIC_FILES = new Map([
  ['/', 'planner.html'], ['/planner.html', 'planner.html'],
  ['/planner.mjs', 'planner.mjs'], ['/planner.css', 'planner.css'],
  ['/editor-shell.html', 'editor-shell.html'],
  ['/dwdg-one-prd.html', 'dwdg-one-prd.html'],
  ['/README.md', 'README.md'], ['/PLANNER_GUIDE.md', 'PLANNER_GUIDE.md'],
  ['/AI_EDITING.md', 'AI_EDITING.md'], ['/PLANNER_CONTENT_REVIEW.md', 'PLANNER_CONTENT_REVIEW.md'],
  ['/ORGANIZATION_DIVISION_BLUEPRINT.md', 'ORGANIZATION_DIVISION_BLUEPRINT.md'],
  ['/DATA_OWNERSHIP_AUTHORITY.md', 'DATA_OWNERSHIP_AUTHORITY.md'],
  ['/TASK_CONTROLS_AVAILABILITY.md', 'TASK_CONTROLS_AVAILABILITY.md'],
]);
const MIME = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

async function readBody(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_DOCUMENT_BYTES + 16 * 1024) throw new PlanningError('Request exceeds the 64 MiB planning-document limit.', 413, 'BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new PlanningError('Request body must be valid JSON.', 400, 'INVALID_JSON'); }
}

/** Local-only editor server. This is not organizational authentication or production hosting. */
export function createPlannerServer(options = {}) {
  const directory = path.resolve(options.directory ?? DEFAULT_DIRECTORY);
  const store = options.store ?? createPlanningStore({ directory });
  const server = http.createServer(async (request, response) => {
    const port = server.address()?.port;
    const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
    const origins = new Set([...hosts].map(host => `http://${host}`));
    const send = (status, body, type = 'application/json; charset=utf-8', headers = {}) => {
      response.writeHead(status, {
        'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer', ...headers,
      });
      response.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
    };
    try {
      if (!hosts.has(request.headers.host?.toLowerCase())) throw new PlanningError('Host must be this loopback planner address.', 403, 'HOST_REJECTED');
      const url = new URL(request.url, `http://${request.headers.host}`);
      const api = url.pathname.startsWith('/api/');
      if (api && request.headers.origin && !origins.has(request.headers.origin)) throw new PlanningError('Only this local planner page may access its API.', 403, 'ORIGIN_REJECTED');
      if (api && request.headers['sec-fetch-site'] === 'cross-site') throw new PlanningError('Cross-site planner requests are not allowed.', 403, 'ORIGIN_REJECTED');
      if (url.pathname === '/api/validate' && request.method === 'POST') {
        if (!(request.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) throw new PlanningError('Validation requests require Content-Type application/json.', 415, 'CONTENT_TYPE_REJECTED');
        const body = await readBody(request);
        validateWorkspace(body?.document);
        const document = body.document;
        send(200, { valid: true, counts: { requirements: document.prd.nodes.length, wbs: document.wbs.length, cards: document.cards.length, activities: document.activities.length, stories: document.stories.length } });
        return;
      }
      if (url.pathname === '/api/workspace' && request.method === 'GET') {
        const result = await store.read();
        send(200, result, undefined, { ETag: `"${result.etag}"` });
        return;
      }
      if (url.pathname === '/api/workspace' && request.method === 'PUT') {
        if (!(request.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) throw new PlanningError('Save requests require Content-Type application/json.', 415, 'CONTENT_TYPE_REJECTED');
        const body = await readBody(request);
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new PlanningError('Save body must be an object.', 400, 'INVALID_BODY');
        const result = await store.save(body.document, body.baseEtag, { actor: body.actor, summary: body.summary });
        // Local absolute backup paths remain in the CLI; the page needs only the saved data.
        send(200, { document: result.document, etag: result.etag, ...(result.warning ? { warning: result.warning } : {}) }, undefined, { ETag: `"${result.etag}"` });
        return;
      }
      if (url.pathname === '/api/changes' && request.method === 'GET') {
        const { document, etag } = await store.read();
        send(200, { history: document.history, revision: document.revision, etag });
        return;
      }
      if (url.pathname === '/api/export/markdown' && request.method === 'GET') {
        const { document } = await store.read();
        send(200, workspaceMarkdown(document), 'text/markdown; charset=utf-8', { 'Content-Disposition': 'attachment; filename="PLANNING_WORKSPACE.md"' });
        return;
      }
      if (url.pathname === '/api/health' && request.method === 'GET') {
        send(200, { kind: 'dwdg-one-local-planner', localOnly: true, schemaVersion: 1 });
        return;
      }
      if (api) {
        send(request.method === 'OPTIONS' ? 403 : 404, { error: 'No matching planner API route.', code: 'NOT_FOUND' });
        return;
      }
      if (url.pathname === '/favicon.ico' && request.method === 'GET') { response.writeHead(204, { 'Cache-Control': 'no-store' }); response.end(); return; }
      if (!['GET', 'HEAD'].includes(request.method)) throw new PlanningError('Only GET and HEAD are available for pages.', 405, 'METHOD_NOT_ALLOWED');
      const file = STATIC_FILES.get(url.pathname);
      if (!file) { send(404, { error: 'Page not found.', code: 'NOT_FOUND' }); return; }
      let content;
      try { content = await fs.readFile(path.join(directory, file)); }
      catch (error) { if (error.code === 'ENOENT') { send(404, { error: `${file} is not available yet.`, code: 'NOT_FOUND' }); return; } throw error; }
      response.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
        'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'none'; form-action 'self'",
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (response.headersSent) { response.destroy(error); return; }
      send(error instanceof PlanningError ? error.status : 500, {
        error: error instanceof PlanningError ? error.message : 'Local planner operation failed. Saved files were not reset.',
        code: error.code ?? 'LOCAL_OPERATION_FAILED', ...(error.details?.length ? { details: error.details } : {}),
      });
      if (!(error instanceof PlanningError)) options.onError?.(error);
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.planningStore = store;
  return server;
}

export async function startPlannerServer(options = {}) {
  const port = options.port ?? 5174;
  if (!Number.isInteger(port) || port < 0 || port > 65_535) throw new Error('Port must be an integer from 0 to 65535.');
  const server = createPlannerServer(options);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portIndex = process.argv.indexOf('--port');
  const port = portIndex === -1 ? 5174 : Number(process.argv[portIndex + 1]);
  const directoryIndex = process.argv.indexOf('--directory');
  const directory = directoryIndex === -1 ? DEFAULT_DIRECTORY : process.argv[directoryIndex + 1];
  try {
    const server = await startPlannerServer({ port, directory, onError: error => console.error(error.message) });
    console.log(`DWDG’ONE planning app: http://127.0.0.1:${server.address().port}/`);
    console.log(`Saved workspace: ${server.planningStore.paths.stateFile}`);
    console.log('Local computer only. Stop with Ctrl+C. Existing production app and browser stores are unchanged.');
    const stop = () => server.close(() => process.exit(0));
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  } catch (error) { console.error(`Cannot start local planner: ${error.message}`); process.exitCode = 1; }
}
