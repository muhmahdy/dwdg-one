import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {mountStageTips,renderStage} from './dwdg-one-stages.mjs';

function fixture(){
 const window=new Window({settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}}),doc=window.document;
 let elapsed=0,nextID=0;const scheduled=new Map();
 const schedule=(fn,delay)=>{const id=++nextID;scheduled.set(id,{fn,at:elapsed+delay});return id;},cancel=id=>scheduled.delete(id);
 const advance=ms=>{elapsed+=ms;for(const [id,job] of [...scheduled])if(job.at<=elapsed){scheduled.delete(id);job.fn();}};
 doc.body.innerHTML='<button id="stage" data-stage-tip="Work is underway." data-stage-tip-title="Active" aria-describedby="existing-help">Active</button><span id="existing-help">Existing help</span><button id="other">Other</button>';
 const tips=mountStageTips({document:doc,schedule,cancel});
 return {window,doc,advance,tips,button:doc.getElementById('stage'),cleanup:async()=>{tips.destroy();await window.happyDOM.close();}};
}

test('stage help waits half a second of keyboard focus and preserves other descriptions without moving focus',async()=>{
 const env=fixture();try{
  env.button.focus();env.advance(499);assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
  env.advance(1);const tip=env.doc.querySelector('[role="tooltip"]');assert.equal(tip.textContent,'ActiveWork is underway.');assert.equal(env.doc.activeElement,env.button);
  assert.equal(env.button.getAttribute('aria-describedby'),'existing-help one-stage-tooltip');
  env.button.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(env.doc.querySelector('[role="tooltip"]'),null);assert.equal(env.button.getAttribute('aria-describedby'),'existing-help');
 }finally{await env.cleanup();}
});

test('leaving before the delay, scrolling and retiring a menu remove stage help and pending timers',async()=>{
 const env=fixture();try{
  env.button.dispatchEvent(new env.window.PointerEvent('pointerover',{bubbles:true}));env.advance(200);
  env.button.dispatchEvent(new env.window.PointerEvent('pointerout',{bubbles:true,relatedTarget:env.doc.getElementById('other')}));env.advance(500);assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
  env.button.focus();env.advance(500);assert.ok(env.doc.querySelector('[role="tooltip"]'));env.doc.dispatchEvent(new env.window.Event('scroll'));assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
  env.doc.getElementById('other').focus();env.button.focus();env.advance(500);env.button.remove();await env.window.happyDOM.waitUntilComplete();assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
 }finally{await env.cleanup();}
});

test('the localized stage identity keeps a named label and an aria-hidden icon before its text',async()=>{
 const window=new Window();try{
  window.document.body.innerHTML=renderStage('review',(_,id)=>id);
  const stage=window.document.querySelector('.one-stage');assert.equal(stage.lastElementChild.textContent,'Ditinjau');assert.equal(stage.firstElementChild.getAttribute('aria-hidden'),'true');
  assert.match(stage.dataset.stageTip,/Hasil proyek/);assert.equal(stage.querySelectorAll('i').length,0);
 }finally{await window.happyDOM.close();}
});

test('moving over an option icon or label keeps one hover timer and leaving that child cancels help',async()=>{
 const env=fixture();try{
  env.button.innerHTML=renderStage('active',en=>en,{badge:false});
  const label=env.button.querySelector('.one-stage-name'),glyph=env.button.querySelector('.one-stage-icon');
  glyph.dispatchEvent(new env.window.PointerEvent('pointerover',{bubbles:true}));env.advance(300);
  label.dispatchEvent(new env.window.PointerEvent('pointerover',{bubbles:true}));env.advance(200);assert.ok(env.doc.querySelector('[role="tooltip"]'));
  label.dispatchEvent(new env.window.PointerEvent('pointerout',{bubbles:true,relatedTarget:env.doc.getElementById('other')}));env.advance(120);assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
 }finally{await env.cleanup();}
});

test('help retires visually without keeping an accessible description, and fast re-entry cancels stale retirement',async()=>{
 const env=fixture();try{
  env.button.focus();env.advance(500);const tooltip=env.doc.querySelector('[role="tooltip"]');assert.equal(tooltip.dataset.state,'open');
  env.doc.getElementById('other').focus();assert.equal(env.doc.querySelector('[role="tooltip"]'),null);assert.equal(tooltip.dataset.state,'closing');assert.equal(tooltip.getAttribute('aria-hidden'),'true');assert.equal(env.button.getAttribute('aria-describedby'),'existing-help');
  env.advance(99);assert.equal(tooltip.isConnected,true);env.advance(1);assert.equal(tooltip.isConnected,false);
  env.button.focus();env.advance(500);env.doc.getElementById('other').focus();env.advance(50);env.button.focus();env.advance(500);assert.equal(env.doc.querySelector('[role="tooltip"]'),tooltip);assert.equal(tooltip.dataset.state,'open');
 }finally{await env.cleanup();}
});

test('reduced motion removes dismissed help immediately',async()=>{
 const env=fixture();try{
  env.doc.documentElement.dataset.motion='reduced';env.button.focus();env.advance(500);const tooltip=env.doc.querySelector('[role="tooltip"]');assert.ok(tooltip);
  env.doc.getElementById('other').focus();assert.equal(tooltip.isConnected,false);assert.equal(env.doc.querySelector('.one-stage-tooltip'),null);
 }finally{await env.cleanup();}
});

test('Escape keeps help dismissed through restored focus until the next keyboard or pointer interaction',async()=>{
 const env=fixture();try{
  env.button.focus();env.advance(500);env.button.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  env.doc.getElementById('other').focus();env.button.focus();env.advance(1000);assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
  env.button.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true}));env.doc.getElementById('other').focus();env.button.focus();env.advance(500);assert.ok(env.doc.querySelector('[role="tooltip"]'));
  env.button.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));env.button.dispatchEvent(new env.window.PointerEvent('pointerover',{bubbles:true}));env.advance(500);assert.equal(env.doc.querySelector('[role="tooltip"]'),null);
  env.button.dispatchEvent(new env.window.PointerEvent('pointermove',{bubbles:true,movementX:1}));env.advance(500);assert.ok(env.doc.querySelector('[role="tooltip"]'));
 }finally{await env.cleanup();}
});
