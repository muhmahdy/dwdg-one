import test from 'node:test';
import assert from 'node:assert/strict';
import {opticalPolicy,mountOptical} from './dwdg-one-optical.mjs';
test('optical prototype has static fallback for reduced motion, coarse pointer and hidden tabs',()=>{
 assert.equal(opticalPolicy({}),true);
 for(const value of [{enabled:false},{motion:'reduced'},{coarse:true},{reduced:true},{hidden:true}])assert.equal(opticalPolicy(value),false);
 assert.equal(opticalPolicy({motion:'full',reduced:true}),true);
});
test('unavailable WebGL retains static material without breaking the page',()=>{
 let attempts=0;const host={dataset:{}},canvas={parentElement:host,ownerDocument:{hidden:false,defaultView:{matchMedia:()=>({matches:false})}},getContext(){attempts++;return null;}};
 const effect=mountOptical(canvas);assert.equal(attempts,1);assert.equal(canvas.hidden,true);assert.equal(host.dataset.material,'static');effect.destroy();
});
test('disabled effect never initializes a GPU context',()=>{
 const host={dataset:{}},canvas={parentElement:host,ownerDocument:{hidden:false,defaultView:{matchMedia:()=>({matches:false})}},getContext(){throw Error('GPU should not initialize');}};
 mountOptical(canvas,{enabled:false});assert.equal(canvas.hidden,true);assert.equal(host.dataset.material,'static');
});
