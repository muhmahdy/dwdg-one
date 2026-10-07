import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const states=read('render-metrics.json'),projects=read('project-metrics.json');
assert.equal(states.length,48);
const reference=states[0].rows.map(row=>row.id).sort();
assert.equal(new Set(reference).size,6);
let visibleRows=0;
for(const state of [...states,...projects]){
 assert.equal(state.scrollWidth,state.width,`${state.name}: document overflow`);
 assert.ok(state.name.endsWith(`${state.language}-${state.theme}`),`${state.name}: wrong language/theme`);
 if(state.scope!=='project')assert.deepEqual(state.rows.map(row=>row.id).sort(),reference,`${state.name}: IDs changed`);
 else assert.ok(state.rows.every(row=>reference.includes(row.id)),`${state.name}: duplicated project records`);
 const visible=state.rows.filter(row=>row.box.height>0);
 for(const [index,row] of visible.entries()){
  visibleRows++;
  assert.ok(row.box.height>=(state.width<1024?64:52),`${state.name}: row below minimum`);
  assert.equal(row.icon.width,20);assert.equal(row.icon.height,20);
  assert.equal(row.inset,'16px');assert.equal(row.gap,'12px');
  for(const control of [row.open,row.more]){
   assert.ok(control.width>=44&&control.height>=44,`${state.name}: small action`);
   assert.ok(control.x>=row.box.x&&control.x+control.width<=row.box.x+row.box.width+.1,`${state.name}: action escapes row`);
  }
  assert.ok(row.open.x+row.open.width<=row.more.x,`${state.name}: overlapping title/More`);
  if(row.people?.height){assert.ok(row.open.x+row.open.width<=row.people.x&&row.people.x+row.people.width<=row.more.x,`${state.name}: overlapping people`);}
  if(index)assert.ok(visible[index-1].box.y+visible[index-1].box.height<=row.box.y+.1,`${state.name}: overlapping rows`);
 }
}
const linear=channel=>{channel/=255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;};
const rgb=color=>color.startsWith('#')?[1,3,5].map(offset=>parseInt(color.slice(offset,offset+2),16)):color.match(/[\d.]+/g).slice(0,3).map(Number);
const luminance=color=>{const channels=rgb(color).map(linear);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
const contrasts=read('colors.json').map(state=>({language:state.language,theme:state.theme,surface:state.surface,samples:state.samples.filter(sample=>sample.color).map(sample=>{
 const a=luminance(sample.color),b=luminance(state.surface),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 assert.equal(sample.opacity,'1');assert.ok(ratio>=4.5,`${state.theme} ${sample.selector}: low text contrast`);
 return {...sample,ratio:Number(ratio.toFixed(2))};
})}));
const report={capturedStates:states.length,projectStates:projects.length,visibleRowsChecked:visibleRows,uniqueWorkspaceFixtureIds:reference.length,documentOverflow:0,rowOrControlOverlap:0,measuredControlMinimum:'44 x 44 CSS pixels',contrasts,limits:'Computed samples are ordinary unselected row foregrounds on the declared solid surface. This is not a complete app contrast, device, screen-reader or zoom audit.'};
writeFileSync(new URL('metrics-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
