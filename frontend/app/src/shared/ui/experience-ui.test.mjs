import test from 'node:test';
import assert from 'node:assert/strict';
import {completionSeries, renderActivityChart, escapeHtml, icon, dissolve, createOverlays} from './experience-ui.mjs';

test('completion series includes zero days and excludes unknown history and today from average', () => {
  const tasks = [{status:'done',completedAt:'2026-09-20'},{status:'done',completedAt:'2026-09-22'},{status:'done',completedAt:'2026-09-22'},{status:'done',completedAt:'2026-09-23'},{status:'progress',completedAt:'2026-09-22'}];
  const series = completionSeries(tasks,{start:'2026-09-20',days:5,today:'2026-09-23',recordedSince:'2026-09-21'});
  assert.deepEqual(series.entries.map(x => x.count),[1,0,2,1,0]);
  assert.deepEqual(series.entries.map(x => x.known),[false,true,true,true,false]);
  assert.deepEqual(series.entries.map(x => x.partial),[false,false,false,true,false]);
  assert.equal(series.average,1); assert.equal(series.averageDays,2);
});

test('missing recordedSince never invents zero-day history or an average', () => {
  const series = completionSeries([{status:'done',completedAt:'2026-09-22'}],{start:'2026-09-21',days:3,today:'2026-09-23'});
  assert.equal(series.average,null); assert.equal(series.averageDays,0);
  assert.ok(series.entries.every(x=>!x.known)); assert.equal(series.entries[1].count,1);
});

test('date arithmetic crosses leap days and year boundaries independent of daylight saving', () => {
  assert.deepEqual(completionSeries([],{start:'2024-02-28',days:3,today:'2024-03-03',recordedSince:'2024-02-28'}).entries.map(x=>x.date),['2024-02-28','2024-02-29','2024-03-01']);
  assert.deepEqual(completionSeries([],{start:'2026-12-31',days:2,today:'2027-01-03',recordedSince:'2026-12-31'}).entries.map(x=>x.date),['2026-12-31','2027-01-01']);
});

test('invalid dates and spans reject while malformed completion dates are ignored', () => {
  assert.throws(()=>completionSeries([],{start:'2026-02-30',today:'2026-03-01'}),TypeError);
  assert.throws(()=>completionSeries([],{start:'2026-03-01',days:0}),RangeError);
  assert.throws(()=>completionSeries([],{start:'2026-03-01',days:1.5}),RangeError);
  const series=completionSeries([{status:'done',completedAt:'2026-02-30'},{status:'done',completedAt:null}],{start:'2026-03-01',days:1,today:'2026-03-02',recordedSince:'2026-03-01'});
  assert.equal(series.average,0); assert.equal(series.entries[0].count,0);
});

test('reopened tasks are not counted as saved completions', () => {
  const series=completionSeries([{status:'todo',completedAt:null},{status:'progress',completedAt:'2026-09-22'},{status:'done',completedAt:'2026-09-22'}],{start:'2026-09-22',days:1,today:'2026-09-23',recordedSince:'2026-09-22'});
  assert.equal(series.average,1); assert.equal(series.entries[0].count,1);
});

test('a period containing only today has a partial count and no complete-day average', () => {
  const series=completionSeries([{status:'done',completedAt:'2026-09-23'}],{start:'2026-09-23',days:1,today:'2026-09-23',recordedSince:'2026-09-23'});
  assert.equal(series.average,null); assert.equal(series.entries[0].partial,true);
});

test('future completion dates cannot invent activity ahead of today', () => {
  const series=completionSeries([{status:'done',completedAt:'2026-09-24'}],{start:'2026-09-23',days:2,today:'2026-09-23',recordedSince:'2026-09-20'});
  assert.deepEqual(series.entries.map(x=>x.count),[0,0]);
  assert.equal(series.entries[1].known,false);
});

test('chart uses actual scaled values, chosen day, localized labels, and honest unknown history', () => {
  const series=completionSeries([{status:'done',completedAt:'2026-09-22'}],{start:'2026-09-21',days:3,today:'2026-09-23',recordedSince:'2026-09-22'});
  const html=renderActivityChart({series,selectedDate:'2026-09-22',locale:'id',variant:'bars'});
  assert.match(html,/Tugas selesai/); assert.match(html,/data-chart-date="2026-09-22" aria-pressed="true"/);
  assert.match(html,/--ux-bar-height:50\.000%/); assert.match(html,/--ux-bar-height:0\.000%/);
  assert.match(html,/Riwayat belum lengkap/); assert.match(html,/ux-chart-average/);
  assert.doesNotMatch(html,/NaN|undefined/);
});

test('empty and single-day charts remain valid and primitives escape labels', () => {
  assert.match(renderActivityChart({series:{entries:[]}}),/No activity/);
  const series=completionSeries([],{start:'2026-09-23',days:1,today:'2026-09-23'});
  assert.doesNotMatch(renderActivityChart({series,variant:'cells'}),/NaN|undefined/);
  assert.equal(escapeHtml('<b>"x" & \'y\''),'&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;');
  assert.match(icon('check'),/aria-hidden="true"/);
});

test('chart includes a readable daily-value list and distinct division icons',()=>{
  const series=completionSeries([],{start:'2026-09-01',days:28,today:'2026-09-29',recordedSince:'2026-09-01'});
  const html=renderActivityChart({series,variant:'cells'});
  assert.match(html,/<details class="ux-chart-values">/);assert.equal((html.match(/data-key="chart-value-/g)||[]).length,28);
  for(const name of ['compass','wallet','briefcase'])assert.notEqual(icon(name),icon('projects'));
});

test('compact portfolio plot has one selected-date readout and external range labels rather than date tiles',()=>{
  const series=completionSeries([{status:'done',completedAt:'2026-09-26'}],{start:'2026-08-30',days:28,today:'2026-09-26',recordedSince:'2026-08-30'});
  for(const locale of ['en','id']){
    const html=renderActivityChart({series,variant:'cells',selectedDate:'2026-09-26',locale});
    assert.equal((html.match(/<output class="ux-chart-selection"/g)||[]).length,1);
    assert.match(html,/<strong>1 (?:completed|selesai)<\/strong>/);
    assert.match(html,/class="ux-chart-range"/);
    assert.doesNotMatch(html,/class="ux-chart-day-label"/);
    assert.equal((html.match(/data-chart-date="2026-09-26" aria-pressed="true"/g)||[]).length,2);
    assert.match(html,locale==='id'?/Belum berakhir/:/Partial/);
  }
});

test('selecting an unobserved date never presents zero as its exact completion readout',()=>{
  const series=completionSeries([],{start:'2026-09-20',days:2,today:'2026-09-26',recordedSince:'2026-09-25'});
  const html=renderActivityChart({series,variant:'cells',selectedDate:'2026-09-20'});
  const readout=html.match(/<output[\s\S]*?<\/output>/)[0];
  assert.match(readout,/<strong>— completed<\/strong>/);
  assert.doesNotMatch(readout,/>0 completed/);
  assert.match(html,/Daily average unavailable/);
});

test('dissolve releases retained animations so keyed rows can remain visible after updates or undo',async()=>{
  let cancelled=0;
  const element={isConnected:true,style:{pointerEvents:'auto'},getBoundingClientRect:()=>({height:64}),animate:()=>({finished:Promise.resolve(),cancel(){cancelled++;}})};
  await dissolve(element);assert.equal(cancelled,2);assert.equal(element.style.pointerEvents,'auto');
});

test('task-count chart axes avoid fractional task labels',()=>{
  for(const count of [1,3,5]){const entries=[{date:'2026-09-26',count,known:true,partial:false}];const html=renderActivityChart({series:{entries,average:count,averageDays:1}});const axis=html.match(/class="ux-chart-axis"[\s\S]*?<\/div>/)?.[0];assert.doesNotMatch(axis,/[0-9]\.[0-9]/);}
});

test('unknown chart days use a dash rather than implying zero observed completions',()=>{
  const series=completionSeries([],{start:'2026-09-20',days:1,today:'2026-09-26',recordedSince:'2026-09-25'});
  const html=renderActivityChart({series,variant:'cells'});
  assert.match(html,/ux-chart-cell-count">—</);assert.match(html,/Unknown completion count/);assert.match(html,/<strong>— <small>completed/);
  assert.doesNotMatch(html,/<strong>0 <small>completed/);
});

// Small DOM doubles exercise lifecycle ownership without a browser or a DOM dependency.
function overlayEnvironment({viewport,motion='reduced',controlledTimers=false}={}){
  const frames=[],saved=new Map(),events=new Map(),windowEvents=new Map(),timers=new Map();let doc,elapsed=0,timerSequence=0;
  class ElementDouble{
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.style={overflow:'',setProperty(key,value){this[key]=value;}};this.dataset={};this.attributes=new Map();this.events=new Map();this.inert=false;this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};}
    get isConnected(){return this===doc?.body||Boolean(this.parentElement?.isConnected);}
    set className(value){this.classes=new Set(value.split(' '));}
    get className(){return [...this.classes].join(' ');}
    append(child){child.parentElement=this;this.children.push(child);}
    remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);this.parentElement=null;}
    set innerHTML(value){this.html=value;if(value.includes('ux-panel--')){const panel=new ElementDouble('section');panel.className='ux-panel';panel.append(new ElementDouble('input'));if(value.includes('data-overlay-action="confirm"'))for(const action of ['cancel','confirm']){const button=new ElementDouble('button');button.dataset.overlayAction=action;panel.append(button);}this.append(panel);}}
    hasAttribute(key){return this.attributes.has(key);}
    getAttribute(key){return this.attributes.get(key);}
    setAttribute(key,value){this.attributes.set(key,String(value));}
    contains(element){return element===this||this.children.some(child=>child.contains(element));}
    closest(selector){if(selector==='[inert]')return this.inert?this:this.parentElement?.closest(selector)||null;if(selector==='[data-overlay-action]')return this.dataset.overlayAction?this:this.parentElement?.closest(selector)||null;return null;}
    getClientRects(){return[{}];}
    getBoundingClientRect(){return{left:24,top:80,right:144,bottom:124,width:120,height:44};}
    querySelector(selector){if(selector==='.ux-panel')return this.children.find(x=>x.classList.contains('ux-panel'))||null;return this.children.find(x=>x.tagName==='INPUT')||null;}
    querySelectorAll(){return this.children.filter(x=>x.tagName==='INPUT');}
    addEventListener(type,fn){this.events.set(type,fn);}
    focus(){if(!this.closest('[inert]'))doc.activeElement=this;}
  }
  const body=new ElementDouble('body'),background=new ElementDouble('main'),trigger=new ElementDouble('button');trigger.setAttribute('id','trigger');background.append(trigger);body.append(background);
  doc={body,activeElement:trigger,documentElement:{dataset:{motion}},createElement:tag=>new ElementDouble(tag),addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type),querySelector:selector=>{const id=selector.match(/\[id="([^"]+)"\]/)?.[1];const search=element=>element.getAttribute('id')===id?element:element.children.map(search).find(Boolean);return id?search(body):null;}};
  const globals={document:doc,Element:ElementDouble,CSS:{escape:value=>value},window:{visualViewport:viewport,addEventListener:(type,fn)=>windowEvents.set(type,fn),removeEventListener:type=>windowEvents.delete(type)},innerWidth:1200,innerHeight:800,requestAnimationFrame:fn=>frames.push(fn)};
  if(controlledTimers){globals.setTimeout=(fn,delay=0)=>{const id=++timerSequence;timers.set(id,{fn,due:elapsed+delay});return id;};globals.clearTimeout=id=>timers.delete(id);}
  for(const[key,value]of Object.entries(globals)){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});}
  return{doc,background,trigger,ElementDouble,windowEvents,pressKey(key){const event={key,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};events.get('keydown')?.(event);return event;},advanceTime(ms){elapsed+=ms;let ready;while((ready=[...timers].find(([,timer])=>timer.due<=elapsed))){timers.delete(ready[0]);ready[1].fn();}},flushFrames(){while(frames.length)frames.shift()();},restore(){for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}};
}

function activeConfirmation(env){return env.doc.body.children.find(child=>child.className==='ux-portal').children.find(layer=>layer.classList.contains('ux-layer--confirm')&&!layer.inert);}
function acceptConfirmation(layer){const panel=layer.querySelector('.ux-panel'),button=panel.children.find(child=>child.dataset.overlayAction==='confirm');layer.events.get('click')({target:button});}

test('overlay viewport contracts when a mobile keyboard opens and restores when it closes',()=>{
  const events=new Map(),viewport={height:780,offsetTop:20,addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)};
  const env=overlayEnvironment({viewport}),ui=createOverlays();
  try{
    const portal=env.doc.body.children.find(child=>child.className==='ux-portal');
    assert.equal(portal.style['--ux-viewport-height'],'780px');assert.equal(portal.style['--ux-keyboard-inset'],'0px');
    viewport.height=440;events.get('resize')();
    assert.equal(portal.style['--ux-viewport-height'],'440px');assert.equal(portal.style['--ux-viewport-top'],'20px');assert.equal(portal.style['--ux-keyboard-inset'],'340px');
    viewport.height=800;viewport.offsetTop=0;events.get('resize')();
    assert.equal(portal.style['--ux-viewport-height'],'800px');assert.equal(portal.style['--ux-keyboard-inset'],'0px');
  }finally{ui.destroy();assert.equal(events.size,0);env.restore();}
});

test('retiring overlays cannot re-enter or submit during their exit animation',async()=>{
  const env=overlayEnvironment();let submitted=0;const ui=createOverlays();
  try{
    const panel=ui.open({kind:'inspector',title:'Edit',onSubmit:()=>submitted++}),layer=panel.parentElement;
    assert.equal(env.background.inert,true);
    const closing=ui.close(true);
    assert.equal(layer.inert,true);assert.equal(env.background.inert,false);
    env.flushFrames();assert.equal(layer.classList.contains('ux-entered'),false);
    let prevented=false;layer.events.get('submit')({preventDefault(){prevented=true;}});
    assert.equal(prevented,true);assert.equal(submitted,0);
    await closing;assert.equal(env.doc.activeElement,env.trigger);
  }finally{ui.destroy();env.restore();}
});

test('replacement overlay retains focus ownership and restores the rebuilt original trigger',async()=>{
  const env=overlayEnvironment(),ui=createOverlays();
  try{
    const first=ui.open({kind:'inspector',title:'First'});env.flushFrames();assert.equal(env.doc.activeElement,first.children[0]);
    const second=ui.open({kind:'dialog',title:'Second'});env.flushFrames();assert.equal(env.doc.activeElement,second.children[0]);
    await new Promise(resolve=>setTimeout(resolve,5));assert.equal(env.doc.activeElement,second.children[0]);
    env.trigger.remove();const replacement=new env.ElementDouble('button');replacement.setAttribute('id','trigger');env.background.append(replacement);
    await ui.close(true);assert.equal(env.doc.activeElement,replacement);assert.equal(env.background.inert,false);
  }finally{ui.destroy();env.restore();}
});

test('busy editor rejects duplicate submission and dismissal but remains usable after failure',async()=>{
  const env=overlayEnvironment();let submitted=0;const ui=createOverlays();
  try{
    const panel=ui.open({kind:'inspector',title:'Edit',onSubmit:()=>submitted++}),layer=panel.parentElement;
    panel.dataset.busy='true';layer.events.get('submit')({preventDefault(){}});
    assert.equal(submitted,0);assert.equal(await ui.close(),false);assert.equal(ui.isOpen(),true);
    delete panel.dataset.busy;layer.events.get('submit')({preventDefault(){}});assert.equal(submitted,1);assert.equal(ui.isOpen(),true);
    await ui.close(true);
  }finally{ui.destroy();env.restore();}
});

test('immediate close hands focus to the next inspector without a retiring-layer focus race',async()=>{
  const env=overlayEnvironment(),ui=createOverlays();
  try{
    const first=ui.open({kind:'inspector',title:'First'});env.flushFrames();
    const closed=ui.close(true,{waitForExit:false});
    assert.equal(first.parentElement.inert,true);assert.equal(env.doc.activeElement,env.trigger);assert.equal(env.background.inert,false);
    const next=ui.open({kind:'inspector',title:'Next'});env.flushFrames();
    assert.equal(await closed,true);assert.equal(env.doc.activeElement,next.children[0]);
    await new Promise(resolve=>setTimeout(resolve,5));assert.equal(env.doc.activeElement,next.children[0]);
    await ui.close(true);assert.equal(env.doc.activeElement,env.trigger);
  }finally{ui.destroy();env.restore();}
});

test('regular overlay close restores focus immediately while waitForExit retains the full animation wait',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const panel=ui.open({kind:'dialog',title:'Edit'}),layer=panel.parentElement;env.flushFrames();
    let settled=false;const closing=ui.close(true).then(result=>{settled=true;return result;});
    assert.equal(layer.inert,true);assert.equal(env.background.inert,false);assert.equal(env.doc.activeElement,env.trigger);
    await Promise.resolve();assert.equal(settled,false);assert.equal(layer.isConnected,true);
    env.advanceTime(299);await Promise.resolve();assert.equal(settled,false);assert.equal(layer.isConnected,true);
    env.advanceTime(1);assert.equal(await closing,true);assert.equal(layer.isConnected,false);assert.equal(env.doc.activeElement,env.trigger);
  }finally{ui.destroy();env.restore();}
});

test('popover Escape immediately restores its opener and retirement cannot steal subsequent inline editor focus',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const panel=ui.open({kind:'popover',title:'Owner',anchor:env.trigger}),layer=panel.parentElement;env.flushFrames();
    assert.equal(env.doc.activeElement,panel.children[0]);const escape=env.pressKey('Escape');
    assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);assert.equal(ui.isOpen(),false);
    assert.equal(layer.inert,true);assert.equal(env.doc.activeElement,env.trigger);assert.equal(env.background.inert,false);
    const editor=new env.ElementDouble('textarea');editor.setAttribute('id','one-res-content');env.background.append(editor);editor.focus();
    env.advanceTime(199);await Promise.resolve();assert.equal(layer.isConnected,true);assert.equal(env.doc.activeElement,editor);
    env.advanceTime(1);await Promise.resolve();assert.equal(layer.isConnected,false);assert.equal(env.doc.activeElement,editor);
  }finally{ui.destroy();env.restore();}
});

test('confirmation Escape restores the opener synchronously when the background becomes usable',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const confirmed=ui.confirm({title:'Leave note?'}),layer=activeConfirmation(env);env.flushFrames();
    assert.equal(env.background.inert,true);assert.equal(env.doc.activeElement,layer.querySelector('.ux-panel').children[0]);
    const escape=env.pressKey('Escape');
    assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);assert.equal(layer.inert,true);
    assert.equal(env.background.inert,false);assert.equal(env.doc.activeElement,env.trigger);assert.equal(await confirmed,false);
    env.advanceTime(300);await Promise.resolve();assert.equal(layer.isConnected,false);assert.equal(env.doc.activeElement,env.trigger);
  }finally{ui.destroy();env.restore();}
});

test('accepted confirmation restores before resolving and never steals the new Resources inline editor focus',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const confirmed=ui.confirm({title:'Replace draft?'}),layer=activeConfirmation(env);env.flushFrames();
    const continuation=confirmed.then(accepted=>{
      assert.equal(accepted,true);assert.equal(layer.inert,true);assert.equal(env.background.inert,false);assert.equal(env.doc.activeElement,env.trigger);
      const editor=new env.ElementDouble('textarea');editor.setAttribute('id','one-res-content');env.background.append(editor);editor.focus();return editor;
    });
    acceptConfirmation(layer);const editor=await continuation;assert.equal(env.doc.activeElement,editor);
    env.advanceTime(300);await Promise.resolve();assert.equal(layer.isConnected,false);assert.equal(env.doc.activeElement,editor);
  }finally{ui.destroy();env.restore();}
});

test('nested confirmation restores its underlying modal and replacement retains original focus ownership',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const original=ui.open({kind:'dialog',title:'Resource details'});env.flushFrames();const field=original.children[0];
    const first=ui.confirm({title:'Discard changes?'});env.flushFrames();assert.equal(original.parentElement.inert,true);
    env.pressKey('Escape');assert.equal(original.parentElement.inert,false);assert.equal(env.background.inert,true);assert.equal(env.doc.activeElement,field);assert.equal(await first,false);
    const next=ui.confirm({title:'Second confirmation'});env.flushFrames();
    const replacement=ui.open({kind:'inspector',title:'Replacement editor'});env.flushFrames();assert.equal(await next,false);
    assert.equal(original.parentElement.inert,true);assert.equal(env.background.inert,true);assert.equal(env.doc.activeElement,replacement.children[0]);
    env.advanceTime(300);await Promise.resolve();assert.equal(env.doc.activeElement,replacement.children[0]);assert.equal(original.isConnected,false);
    const closing=ui.close(true);assert.equal(env.doc.activeElement,env.trigger);env.advanceTime(300);assert.equal(await closing,true);assert.equal(env.background.inert,false);
  }finally{ui.destroy();env.restore();}
});

test('replacement confirmation retains the real opener rather than the retiring confirmation control',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const first=ui.confirm({title:'First'});env.flushFrames();const old=activeConfirmation(env);
    const next=ui.confirm({title:'Replacement'});env.flushFrames();const replacement=activeConfirmation(env);assert.notEqual(replacement,old);assert.equal(await first,false);
    env.advanceTime(300);await Promise.resolve();assert.equal(old.isConnected,false);assert.equal(env.doc.activeElement,replacement.querySelector('.ux-panel').children[0]);
    env.pressKey('Escape');assert.equal(env.background.inert,false);assert.equal(env.doc.activeElement,env.trigger);assert.equal(await next,false);
    env.advanceTime(300);await Promise.resolve();assert.equal(replacement.isConnected,false);assert.equal(env.doc.activeElement,env.trigger);
  }finally{ui.destroy();env.restore();}
});

test('overlay retirement after destroy cannot move focus away from the next application control',async()=>{
  const env=overlayEnvironment({motion:'full',controlledTimers:true}),ui=createOverlays();
  try{
    const panel=ui.open({kind:'dialog',title:'Edit'});env.flushFrames();const layer=panel.parentElement;
    const closing=ui.close(true);assert.equal(env.doc.activeElement,env.trigger);ui.destroy();
    const next=new env.ElementDouble('button');next.setAttribute('id','next-control');env.background.append(next);next.focus();
    env.advanceTime(300);assert.equal(await closing,true);assert.equal(layer.isConnected,false);assert.equal(env.doc.activeElement,next);
  }finally{ui.destroy();env.restore();}
});
