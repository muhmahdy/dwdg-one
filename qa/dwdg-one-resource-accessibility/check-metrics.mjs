import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const states = JSON.parse(await readFile(new URL('render-metrics.json', root), 'utf8'));
const names = new Set(states.map(state => state.name));
assert.equal(states.length, 96);
assert.equal(names.size, 96, 'Every capture needs a unique state name');
for (const width of [1440, 1024, 390, 320]) {
  for (const language of ['en', 'id']) for (const theme of ['light', 'dark']) {
    assert(names.has(`default-${width}-${language}-${theme}`));
  }
}
for (const config of ['text-200-1440', 'text-200-390', 'spacing-320', 'combined-320', 'reflow-320x225']) {
  for (const language of ['en', 'id']) for (const theme of ['light', 'dark']) {
    for (const surface of ['list', 'file', 'reader', 'editor']) assert(names.has(`${config}-${language}-${theme}-${surface}`));
  }
}
for (const state of states) {
  assert(state.scrollWidth <= state.width + 1, `${state.name}: document overflow`);
  assert.equal(state.horizontalEscapes.length, 0, `${state.name}: visible control escapes`);
  assert(state.focus.top >= 0 && state.focus.bottom <= state.height + 1, `${state.name}: initial focus outside viewport`);
  assert.equal(state.focus.outline, 'solid 2px', `${state.name}: missing sampled focus outline`);
  if (state.name.endsWith('-editor')) {
    assert.equal(state.focus.id, 'one-res-title');
    if (state.footer.position === 'sticky') assert(state.focus.bottom < state.footer.rect.top, `${state.name}: title covered by actions`);
    if (state.height === 225) assert.equal(state.footer.position, 'static');
  }
  if (state.name.startsWith('default-') && state.width >= 1024) assert.equal(state.sidebarWidth, 216);
  if (state.name.startsWith('text-200-1440')) assert.equal(state.sidebarWidth, 432);
  if (state.name.startsWith('text-200') || state.name.startsWith('combined')) {
    const ordinaryTitle = states.find(candidate => candidate.name === `reflow-320x225-${state.language}-${state.theme}-${state.name.split('-').at(-1)}`);
    const titleBase = state.width === 1440 ? 24 : parseFloat(ordinaryTitle.typography.title);
    assert.equal(state.typography.title, `${titleBase * 2}px`);
    if (state.typography.noteBody) assert.equal(state.typography.noteBody, '32px');
  }
}
const keyboard = JSON.parse(await readFile(new URL('after-editor-keyboard.json', root), 'utf8'));
const metadata = JSON.parse(await readFile(new URL('metadata-keyboard.json', root), 'utf8'));
const shortKeyboard = JSON.parse(await readFile(new URL('short-editor-keyboard.json', root), 'utf8'));
for (const stop of [...keyboard, ...metadata]) {
  assert.equal(stop.covered, false, `Covered focus: ${stop.text || stop.id}`);
  assert(stop.top >= 56 && stop.bottom <= 844, `Offscreen focus: ${stop.text || stop.id}`);
}
assert(keyboard.some(stop => stop.id === 'one-res-content'));
assert(keyboard.some(stop => stop.tag === 'SUMMARY'));
assert(keyboard.some(stop => stop.text === 'Cancel'));
assert(keyboard.some(stop => stop.text === 'Save note'));
for (const id of ['one-res-description', 'one-res-owner', 'one-res-contributors', 'one-res-parent', 'one-res-change-note']) {
  assert(metadata.some(stop => stop.id === id));
}
for (const stop of shortKeyboard) {
  assert(stop.top >= 56 && stop.bottom <= stop.viewport, `Short-window focus: ${stop.text || stop.id}`);
  assert.equal(stop.footerPosition, 'static');
}
assert(shortKeyboard.some(stop => stop.id === 'one-res-content'));
assert(shortKeyboard.some(stop => stop.text === 'Save note'));
const result = {acceptedCaptures: states.length, documentOverflow: 0, horizontalControlEscapes: 0, initialFocusVisible: states.length, enlargedEditorStops: keyboard.length, expandedMetadataStops: metadata.length, shortEditorStops: shortKeyboard.length, coveredKeyboardStops: 0, nativeZoomVerified: false};
await writeFile(new URL('metrics-check.json', root), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
