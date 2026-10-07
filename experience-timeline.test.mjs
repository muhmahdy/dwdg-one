import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTimelineModel,renderTimeline} from './experience-timeline.mjs';
import {makeSeed} from './model.mjs';
import {escapeHtml,icon} from './experience-ui.mjs';
const core=makeSeed('2026-09-26');
const store={core,extras:{byProject:{onboard:{milestones:[{id:'m1',title:'Review checkpoint',due_date:'2026-09-28'}]},bootcamp:{milestones:[{id:'m2',title:'Other project',due_date:'2026-09-30'}]}}}};
test('timeline uses inclusive actual dates and draws saved dependencies only',()=>{
 const tasks=[{id:'a',projectId:'onboard',title:'First',start:'2026-09-24',end:'2026-09-26'}, {id:'b',projectId:'onboard',title:'Next',start:'2026-09-28',end:'2026-09-29',dependsOn:'a'}];
 const result=buildTimelineModel(store,tasks,{selectedDate:'2026-09-26',projectId:'onboard'});
 assert.equal(result.start,'2026-09-23');assert.equal(result.end,'2026-10-13');
 assert.equal(result.rows[0].right-result.rows[0].left,3);
 assert.equal(result.connections.length,1);assert.equal(result.connections[0].from,'a');assert.equal(result.connections[0].to,'b');
 assert.equal(result.rows.filter(x=>x.kind==='milestone').length,1);
});
test('empty project preserves its milestones and off-window dates are not fabricated at the edge',()=>{
 const result=buildTimelineModel(store,[],{selectedDate:'2026-11-26',projectId:'onboard'});
 assert.equal(result.rows.length,1);assert.equal(result.rows[0].visible,false);assert.equal(result.connections.length,0);
 assert.equal(result.rows[0].start,'2026-09-28');
});
test('timeline contains accessible milestone actions and escapes saved content',()=>{
 const ctx={store,t:(en)=>en,icon,escapeHtml,formatDate:x=>x,avatar:()=>''};
 const html=renderTimeline(ctx,[{id:'x',projectId:'onboard',title:'<unsafe>',start:'2026-09-25',end:'2026-09-27',status:'todo'}],{selectedDate:'2026-09-26',projectId:'onboard'});
 assert.ok(html.includes('&lt;unsafe&gt;'));assert.ok(html.includes('data-collection="milestones"'));assert.ok(html.includes('data-project="onboard"'));assert.ok(html.includes('data-offset="7"'));assert.ok(!html.includes('Other project'));
});
