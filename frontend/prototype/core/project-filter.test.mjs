import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../screens/plan.js', import.meta.url), 'utf8');
const start = source.indexOf('MENUS.pfilter =');
const filter = source.slice(start, source.indexOf('// View options', start));

function renderFilter({high = false, scope = 'ws'} = {}) {
  const context = vm.createContext({high, scope});
  vm.runInContext(`
    const ui = {pscope:scope};
    const MENUS = {stage:()=>'<button data-act="stage">Stage choice</button>',pviewopts:()=>'<button data-act="psort">Sort choice</button>'};
    const me = ()=>({id:'member'}), ws = ()=>'sng', div = ()=>({short:'SNG'}), isHigh = ()=>high;
    const esc = text=>text, icon = ()=>'<svg></svg>', scopeList = key=>Array.from({length:key==='shared'?2:1});
    const L = (text,vars)=>vars?text.replace('{d}',vars.d):text;
  `, context);
  vm.runInContext(filter, context);
  // This menu opens independently of projects(), so its view/body locals do not exist.
  return vm.runInContext('MENUS.pfilter()', context);
}

test('project filter opens without page locals and keeps scope, stage and sort choices', () => {
  const html = renderFilter({scope:'shared'});
  assert.match(html, /data-k="shared"[^>]+aria-checked="true"/);
  assert.match(html, /Shared with SNG<\/span><small>2<\/small>/);
  assert.match(html, /data-act="stage"/);
  assert.match(html, /data-act="psort"/);
  assert.doesNotMatch(html, /data-k="all"/);
});

test('project filter includes all divisions for leadership', () => {
  const html = renderFilter({high:true,scope:'all'});
  assert.match(html, /data-k="all"[^>]+aria-checked="true"/);
  assert.match(html, /All divisions/);
});
