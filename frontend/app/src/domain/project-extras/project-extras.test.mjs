import test from 'node:test';
import assert from 'node:assert/strict';
import {mountProjectExtras} from './project-extras.mjs';

class FakeElement {
  constructor() {
    this.innerHTML = '';
    this.listeners = {};
    this.alert = {hidden: true, textContent: '', setAttribute() {}, focus() {}};
  }
  addEventListener(name, callback) {this.listeners[name] = callback;}
  removeEventListener(name) {delete this.listeners[name];}
  querySelector(selector) {return selector === '.px-form-error' ? this.alert : null;}
  querySelectorAll() {return [];}
  contains() {return true;}
  replaceChildren() {this.innerHTML = '';}
}
globalThis.Element = FakeElement;
globalThis.document = {activeElement: null};
globalThis.FormData = class {
  constructor(form) {this.values = form.values;}
  *[Symbol.iterator]() {yield* Object.entries(this.values);}
};

const tick = () => new Promise(resolve => setImmediate(resolve));
const project = {id: 'project-1', name: 'Website'};
const emptyRecords = () => ({milestones: [], blockers: [], dependencies: [], decisions: [], documents: []});
function click(container, px, extra = {}) {
  container.listeners.click({target: {closest: () => ({dataset: {px, ...extra}})}});
}
function documentForm(file, externalUrl = '') {
  const upload = {files: file ? [file] : []};
  const status = {hidden: true, textContent: ''};
  return {
    values: {title: 'Board minutes', external_url: externalUrl, version_label: 'v1', notes: 'Approved record', sensitivity: 'normal'},
    upload,
    status,
    matches: selector => selector === '[data-px-form]',
    querySelector: selector => selector === '[name="upload_file"]' ? upload : selector === '.px-upload-status' ? status : null,
  };
}
async function openDocumentForm(container) {
  await tick();
  click(container, 'tab', {type: 'documents'});
  click(container, 'add', {type: 'documents'});
}

test('shared document upload uses private backend, and signed download opens the file', async () => {
  const container = new FakeElement();
  const rows = emptyRecords();
  const calls = [];
  const backend = {
    listProjectExtras: async () => rows,
    upsertProjectExtra: async () => {throw new Error('URL flow should not run');},
    deleteProjectExtra: async () => {},
    uploadDocument: async (record, file) => {
      calls.push({record, file});
      const saved = {...record, storage_path: `${record.id}/${file.name}`, external_url: null};
      rows.documents.push(saved);
      return saved;
    },
    getDocumentDownloadUrl: async doc => {
      calls.push({download: doc});
      return 'https://private.example.test/signed';
    },
  };
  let opened;
  const popup = {opener: {}, closed: false, location: {replace: url => {opened = url;}}, close() {this.closed = true;}};
  globalThis.window = {open: () => popup, location: {assign: url => {opened = url;}}};
  const dispose = mountProjectExtras(container, {project, backend, sharedConfigured: true, canEdit: true});
  await openDocumentForm(container);
  assert.match(container.innerHTML, /name="upload_file"/);
  assert.match(container.innerHTML, /Document URL/);
  const file = new File(['minutes'], 'minutes.pdf', {type: 'application/pdf'});
  const form = documentForm(file);
  container.listeners.submit({target: form, preventDefault() {}});
  await tick();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].file, file);
  assert.equal(calls[0].record.title, 'Board minutes');
  assert.equal(calls[0].record.external_url, null);
  assert.match(container.innerHTML, /Open private file/);
  click(container, 'file', {id: rows.documents[0].id});
  await tick();
  assert.equal(calls[1].download, rows.documents[0]);
  assert.equal(opened, 'https://private.example.test/signed');
  assert.equal(popup.opener, null);
  dispose();
});

test('failed and oversized uploads keep the selected file and form draft', async () => {
  const container = new FakeElement();
  let uploadCalls = 0;
  const backend = {
    listProjectExtras: async () => emptyRecords(),
    upsertProjectExtra: async () => {},
    deleteProjectExtra: async () => {},
    uploadDocument: async () => {uploadCalls++; throw new Error('Storage unavailable');},
  };
  const dispose = mountProjectExtras(container, {project, backend, sharedConfigured: true, canEdit: true});
  await openDocumentForm(container);
  const file = new File(['minutes'], 'minutes.pdf');
  const form = documentForm(file);
  container.listeners.submit({target: form, preventDefault() {}});
  await tick();
  assert.equal(uploadCalls, 1);
  assert.equal(form.upload.files[0], file);
  assert.equal(form.values.title, 'Board minutes');
  assert.match(container.alert.textContent, /Storage unavailable/);
  assert.match(container.innerHTML, /name="upload_file"/);

  const largeFile = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf');
  const largeForm = documentForm(largeFile);
  container.listeners.submit({target: largeForm, preventDefault() {}});
  await tick();
  assert.equal(uploadCalls, 1);
  assert.match(container.alert.textContent, /larger than 10 MB/);
  assert.equal(largeForm.upload.files[0], largeFile);
  dispose();
});

test('completed upload remains visible when the following list refresh fails', async () => {
  const container = new FakeElement();
  let loads = 0;
  let uploads = 0;
  const backend = {
    listProjectExtras: async () => {
      if (++loads > 1) throw new Error('Network interrupted');
      return emptyRecords();
    },
    upsertProjectExtra: async () => {},
    deleteProjectExtra: async () => {},
    uploadDocument: async (record, file) => {
      uploads++;
      return {...record, external_url: null, storage_path: `${record.id}/${file.name}`};
    },
  };
  const dispose = mountProjectExtras(container, {project, backend, sharedConfigured: true, canEdit: true});
  await openDocumentForm(container);
  container.listeners.submit({target: documentForm(new File(['ok'], 'minutes.pdf')), preventDefault() {}});
  await tick();
  assert.equal(uploads, 1);
  assert.match(container.innerHTML, /Open private file/);
  assert.match(container.innerHTML, /File uploaded, but the project list could not refresh/);
  assert.doesNotMatch(container.innerHTML, /data-px-form/);
  dispose();
});

test('local preview keeps the document URL flow and offers no upload', async () => {
  const container = new FakeElement();
  const entries = new Map();
  globalThis.localStorage = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  const dispose = mountProjectExtras(container, {project, sharedConfigured: false, canEdit: true});
  await openDocumentForm(container);
  assert.doesNotMatch(container.innerHTML, /name="upload_file"/);
  const form = documentForm(undefined, 'https://example.test/minutes');
  container.listeners.submit({target: form, preventDefault() {}});
  await tick();
  assert.match(container.innerHTML, /https:\/\/example.test\/minutes/);
  assert.equal(entries.has('dwdg-project-extras-v1'), true);
  assert.equal(entries.has('dwdg-workspace-v1'), false);
  dispose();
});
