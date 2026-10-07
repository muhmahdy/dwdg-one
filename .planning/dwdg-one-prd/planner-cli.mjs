import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlanningStore, DEFAULT_DIRECTORY, validateWorkspace, workspaceMarkdown } from './planner-store.mjs';

const HELP = `DWDG’ONE local planning CLI

Usage: node .planning/dwdg-one-prd/planner-cli.mjs <command> [arguments]
  show                         Print {document,etag}, preserving all fields
  list [cards|wbs|stories|activities|prd|history]
                               Print compact IDs, titles and statuses
  export <destination.json>    Write the complete portable workspace document
  export <destination.md>      Write a readable Markdown export
  check [document.json]        Validate a file, or the current saved workspace
  apply <document.json> --base <etag> --actor <name> --summary <description>
                               Validate and save a complete edited workspace;
                               reject a stale hash; retain history and back up
  patch <operations.json> --base <etag> --actor <name> --summary <description>
                               Apply JSON Patch add/replace/remove/test operations
  help

Optional: --directory <planner directory> (defaults to this script’s directory).
Use show before editing and retain its etag. export writes a document, not an API
envelope. Browser and CLI use the same file lock, validator and saved state.
No arbitrary file path from document data is used for persistence. Actor labels
are user-provided; this local planning log is not a production security audit.
Prefer CLI/API updates while the app is open. Direct JSON edits are detected on
the next read, but external editors do not honor locks or create automatic
history/backups. Do not edit the generated PLANNING_WORKSPACE.md as source.
`;

function parseArguments(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { positional: ['help'], flags: {} };
  const positional = [];
  const flags = {};
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (value.startsWith('--')) {
      const key = value.slice(2);
      if (!['directory', 'base', 'actor', 'summary', 'check'].includes(key)) throw new Error(`Unknown flag --${key}.`);
      if (key === 'check') flags.check = true;
      else {
        if (!argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`--${key} requires a value.`);
        flags[key] = argv[++index];
      }
    } else positional.push(value);
  }
  return { positional, flags };
}

function patchSegments(pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) throw new Error('Patch path must be a JSON pointer starting with /.');
  const segments = pointer.slice(1).split('/').map(value => value.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (segments.some(value => ['__proto__', 'prototype', 'constructor'].includes(value))) throw new Error('Unsafe patch path.');
  return segments;
}
/** Small, explicit JSON Patch subset for other AI CLIs; not an implicit merge. */
export function applyJsonPatch(document, operations) {
  if (!Array.isArray(operations)) throw new Error('Patch file must be an array of operations.');
  if (operations.length > 100_000) throw new Error('Too many patch operations.');
  const next = JSON.parse(JSON.stringify(document));
  for (const operation of operations) {
    if (!operation || !['add', 'replace', 'remove', 'test'].includes(operation.op)) throw new Error('Supported patch operations: add, replace, remove, test.');
    const segments = patchSegments(operation.path);
    let parent = next;
    for (const key of segments.slice(0, -1)) {
      if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, key)) throw new Error(`Patch parent does not exist: ${operation.path}.`);
      parent = parent[key];
    }
    const key = segments.at(-1);
    if (!parent || typeof parent !== 'object') throw new Error(`Patch parent is not an object: ${operation.path}.`);
    if (Array.isArray(parent)) {
      const append = key === '-';
      if ((!append && !/^(0|[1-9]\d*)$/.test(key)) || (append && operation.op !== 'add')) throw new Error(`Invalid array patch index: ${operation.path}.`);
      const index = append ? parent.length : Number(key);
      if (!Number.isSafeInteger(index) || index < 0 || index > parent.length || (index === parent.length && operation.op !== 'add')) throw new Error(`Array patch index is out of bounds: ${operation.path}.`);
      if (operation.op === 'test') {
        if (JSON.stringify(parent[index]) !== JSON.stringify(operation.value)) throw new Error(`Patch test failed: ${operation.path}.`);
      } else if (operation.op === 'remove') parent.splice(index, 1);
      else {
        if (!Object.hasOwn(operation, 'value')) throw new Error('add/replace requires value.');
        if (operation.op === 'add') parent.splice(index, 0, operation.value);
        else parent[index] = operation.value;
      }
    } else {
      if (operation.op !== 'add' && !Object.hasOwn(parent, key)) throw new Error(`Patch target does not exist: ${operation.path}.`);
      if (operation.op === 'test') {
        if (JSON.stringify(parent[key]) !== JSON.stringify(operation.value)) throw new Error(`Patch test failed: ${operation.path}.`);
      } else if (operation.op === 'remove') delete parent[key];
      else {
        if (!Object.hasOwn(operation, 'value')) throw new Error('add/replace requires value.');
        parent[key] = operation.value;
      }
    }
  }
  return validateWorkspace(next);
}

export async function runCli(argv, output = value => console.log(value)) {
  const { positional, flags } = parseArguments(argv);
  const command = flags.check ? 'check' : positional[0] ?? 'help';
  const argument = flags.check ? positional[0] : positional[1];
  if (['help', '-h', '--help'].includes(command)) { output(HELP); return; }
  const store = createPlanningStore({ directory: flags.directory ?? DEFAULT_DIRECTORY });
  const print = value => output(JSON.stringify(value, null, 2));
  if (command === 'check') {
    const document = argument ? JSON.parse(await fs.readFile(path.resolve(argument), 'utf8')) : (await store.read()).document;
    validateWorkspace(document);
    print({ valid: true, revision: document.revision, requirements: document.prd.nodes.length, wbs: document.wbs.length, cards: document.cards.length, stories: document.stories.length });
    return;
  }
  if (command === 'show') { print(await store.read()); return; }
  if (command === 'list') {
    const collection = argument ?? 'cards';
    if (!['cards', 'wbs', 'stories', 'activities', 'prd', 'history'].includes(collection)) throw new Error('Choose cards, wbs, stories, activities, prd or history.');
    const { document, etag } = await store.read();
    const items = collection === 'prd' ? document.prd.nodes : document[collection];
    print({ revision: document.revision, etag, collection, items: items.map(item => ({ id: item.id, title: item.title ?? item.action ?? item.summary, ...(item.status ? { status: item.status } : {}), ...(item.owner ? { owner: item.owner } : {}) })) });
    return;
  }
  if (command === 'export') {
    if (!argument) throw new Error('export requires a destination .json or .md path.');
    const destination = path.resolve(argument);
    if ([store.paths.stateFile, store.paths.seedFile, store.paths.markdownFile, store.paths.lockFile].includes(destination)) throw new Error('Export cannot overwrite saved source files; use apply to save a reviewed revision.');
    const { document, etag } = await store.read();
    const extension = path.extname(destination).toLowerCase();
    if (!['.json', '.md'].includes(extension)) throw new Error('Export destination must end in .json or .md.');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, extension === '.json' ? `${JSON.stringify(document, null, 2)}\n` : workspaceMarkdown(document), { encoding: 'utf8', flag: 'wx' });
    print({ exported: destination, revision: document.revision, etag });
    return;
  }
  if (command === 'apply' || command === 'patch') {
    if (!argument || !flags.base || !flags.actor || !flags.summary) throw new Error(`${command} requires a file, --base <etag>, --actor <name>, and --summary <description>.`);
    const input = JSON.parse(await fs.readFile(path.resolve(argument), 'utf8'));
    const document = command === 'patch' ? applyJsonPatch((await store.read()).document, input) : input;
    const result = await store.save(document, flags.base, { actor: flags.actor, summary: flags.summary });
    print({ saved: true, revision: result.document.revision, etag: result.etag, backupFile: result.backupFile, stateFile: store.paths.stateFile, ...(result.warning ? { warning: result.warning } : {}) });
    return;
  }
  throw new Error(`Unknown command ${command}. Use help.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await runCli(process.argv.slice(2)); }
  catch (error) {
    console.error(JSON.stringify({ error: error.message, code: error.code ?? 'CLI_ERROR', ...(error.details?.length ? { details: error.details } : {}) }, null, 2));
    process.exitCode = error.code === 'REVISION_CONFLICT' ? 3 : 1;
  }
}
