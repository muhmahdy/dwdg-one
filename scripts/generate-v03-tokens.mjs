import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'READ THIS IMPORTANT FOR EVERY AI', 'DWDG_Workspace_Codex_Pack_v0.3', 'dwdg_design_tokens_v0.3.json');
const output = resolve(root, 'v03-tokens.css');
const tokens = JSON.parse(readFileSync(source, 'utf8'));
const rules = [];
const add = (name, value) => rules.push(`  --v03-${name}: ${value};`);
const addPx = (name, value) => add(name, `${value}px`);
const kebab = name => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/([a-z])([0-9])/g, '$1-$2');

for (const [name, value] of Object.entries(tokens.color)) add(`color-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.spacing)) addPx(`space-${name}`, value);
for (const [name, value] of Object.entries(tokens.radius)) addPx(`radius-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.layout)) addPx(`layout-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.breakpoints)) addPx(`breakpoint-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.shadow)) add(`shadow-${kebab(name)}`, value);
for (const [name, value] of Object.entries(tokens.motion)) {
  if (name === 'spring') continue;
  add(name.endsWith('Ms') ? `motion-${name.slice(0, -2).toLowerCase()}` : `motion-${kebab(name)}`, name.endsWith('Ms') ? `${value}ms` : value);
}
for (const [name, value] of Object.entries(tokens.typography)) {
  if (typeof value === 'string') { add(`font-${kebab(name)}`, value); continue; }
  for (const [property, datum] of Object.entries(value)) {
    if (property === 'tabularNums') continue;
    const role = kebab(name);
    add(`type-${role}-${kebab(property)}`, ['size', 'line'].includes(property) ? `${datum}px` : property === 'trackingEm' ? `${datum}em` : datum);
  }
}
for (const [name, value] of Object.entries(tokens.button)) {
  const key = kebab(name);
  add(`button-${key}`, typeof value === 'number' ? `${value}px` : value);
}
add('prism-opacity', tokens.material.prismShader.defaultOpacity);
add('prism-grain-opacity', tokens.material.prismShader.grainPercentRange[0] / 100);
add('ambient-sage', tokens.material.backgroundAtmosphere.sageField);
add('ambient-warm', tokens.material.backgroundAtmosphere.warmField);

const css = `/* Generated from dwdg_design_tokens_v0.3.json. Run node scripts/generate-v03-tokens.mjs to refresh. */\n:root {\n${rules.join('\n')}\n}\n`;
writeFileSync(output, css);
