import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {mountResourceMaterials,resourceMaterialPolicy,materialPixelSize} from './dwdg-one-resource-material.mjs';

function environment({failure='',coarse=false,reduced=false,hidden=false,offscreen=false,intersection=false}={}) {
  const window=new Window({url:'http://localhost/dwdg-one-preview.html'}),document=window.document;
  document.write('<!doctype html><body><article class="one-res-row" data-resource-id="folder-1"><span class="one-res-material" data-material-kind="folder" aria-hidden="true"><span class="one-res-material-fallback">Static folder</span></span><button data-action="res-open">Working materials</button></article><article class="one-res-row" data-resource-id="file-1"><span class="one-res-material large" data-size="large" data-material-kind="file" aria-hidden="true"><span class="one-res-material-fallback">Static file</span></span><button data-action="res-open">Reference document</button></article></body>');
  let now=0,rafId=0,contextLost=false;
  const pending=new Map(),rects=new Map(),media=new Map(),log={requests:0,draws:0,copies:[],uniforms:[],gpuCanvases:[],shaderSources:[],deletedShaders:[],deletedBuffers:[],deletedPrograms:[],lost:0,unobserved:[],disconnected:0};
  const hosts=()=>[...document.querySelectorAll('.one-res-material')];
  function measure(host,{width=40,height=40,top=100,left=100}={}){rects.set(host,{width,height,top,left,bottom:top+height,right:left+width});host.getBoundingClientRect=()=>rects.get(host);}
  hosts().forEach(host=>measure(host,{width:host.dataset.size==='large'?56:40,height:host.dataset.size==='large'?56:40,top:offscreen?1200:100}));
  Object.defineProperty(window,'devicePixelRatio',{configurable:true,value:3});Object.defineProperty(document,'hidden',{configurable:true,writable:true,value:hidden});
  Object.defineProperty(window.performance,'now',{configurable:true,value:()=>now});
  window.requestAnimationFrame=callback=>{const id=++rafId;pending.set(id,callback);return id;};window.cancelAnimationFrame=id=>pending.delete(id);
  window.matchMedia=query=>{if(!media.has(query)){const item=new window.EventTarget();item.matches=query.includes('pointer')?coarse:reduced;media.set(query,item);}return media.get(query);};
  let io;
  window.IntersectionObserver=intersection?class {constructor(callback){this.callback=callback;io=this;}observe(){}unobserve(host){log.unobserved.push(host);}disconnect(){log.disconnected++;}}:undefined;
  const gl={VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,ARRAY_BUFFER:5,STATIC_DRAW:6,FLOAT:7,TRIANGLE_STRIP:8,COLOR_BUFFER_BIT:9,RGBA:10,UNSIGNED_BYTE:11,NO_ERROR:0,
    createShader:type=>({type}),shaderSource(shader,source){log.shaderSources.push(source);},compileShader(){},getShaderParameter:()=>failure!=='compile',createProgram:()=>({type:'program'}),attachShader(){},linkProgram(){},getProgramParameter:()=>failure!=='link',useProgram(){},createBuffer:()=>({type:'buffer'}),bindBuffer(){},bufferData(){},getAttribLocation:()=>0,enableVertexAttribArray(){},vertexAttribPointer(){},getUniformLocation:(program,name)=>name,viewport(){},clearColor(){},clear(){},uniform1f:(name,value)=>log.uniforms.push({name,value}),drawArrays(){log.draws++;},readPixels(x,y,w,h,format,type,out){out.set([255,255,255,failure==='empty'?0:255]);},getError:()=>failure==='draw'?42:0,isContextLost:()=>contextLost,deleteShader:shader=>log.deletedShaders.push(shader),deleteBuffer:buffer=>log.deletedBuffers.push(buffer),deleteProgram:program=>log.deletedPrograms.push(program),getExtension:name=>name==='WEBGL_lose_context'?{loseContext(){log.lost++;}}:null};
  window.HTMLCanvasElement.prototype.getContext=function(type){if(type==='webgl'){log.requests++;log.gpuCanvases.push(this);return failure==='unavailable'?null:gl;}if(type==='2d'){if(failure==='2d')return null;return {clearRect(){},drawImage:(source,x,y,width,height)=>{if(failure==='blit')throw new Error('Copy failed');log.copies.push({source,width,height});}};}return null;};
  window.localStorage.setItem('dwdg-workspace-v1','existing saved records');
  return {window,document,root:document.body,hosts,measure,log,gl,pending,
    frame(time){now=time;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(time));},
    event(host,type,fields={}){const event=new window.Event(type,{bubbles:['focusin','focusout'].includes(type),cancelable:true});for(const [key,value]of Object.entries(fields))Object.defineProperty(event,key,{value});host.dispatchEvent(event);return event;},
    hidden(value){document.hidden=value;document.dispatchEvent(new window.Event('visibilitychange'));},
    media(query,value){const item=window.matchMedia(query);item.matches=value;item.dispatchEvent(new window.Event('change'));},
    intersect(host,value){io.callback([{target:host,isIntersecting:value}]);},
    contextLoss(){contextLost=true;return this.event(log.gpuCanvases[0],'webglcontextlost');},
    close:()=>window.happyDOM.close()
  };
}

test('resource policy keeps disabled, reduced, coarse, solid and hidden identities static with bounded DPR',()=>{
  assert.equal(resourceMaterialPolicy().render,true);
  for(const [input,reason]of [[{enabled:false},'disabled'],[{solid:true},'solid'],[{coarse:true},'coarse'],[{reduced:true},'reduced'],[{motion:'reduced'},'reduced'],[{motion:'off'},'reduced'],[{hidden:true},'hidden']])assert.deepEqual(resourceMaterialPolicy(input),{render:false,animate:false,dark:false,reason});
  assert.equal(resourceMaterialPolicy({motion:'full',reduced:true}).render,false,'OS reduced motion remains authoritative');
  assert.equal(materialPixelSize({width:40,height:40,dpr:3}),80);assert.equal(materialPixelSize({width:200,height:200,dpr:4}),96);assert.equal(materialPixelSize({width:200,height:200,dpr:4,large:true}),160);assert.equal(materialPixelSize({width:56,height:56,dpr:2,large:true}),112);assert.equal(materialPixelSize({width:20,height:20,dpr:1}),20);
});

test('many identities use one persistent GPU program, verified local copies, and no idle frames or record writes',async()=>{
  const env=environment(),controller=mountResourceMaterials(env.root);try{
    assert.equal(env.log.requests,1);assert.equal(controller.metrics().activeContexts,1);assert.equal(controller.metrics().enhancedHosts,2);assert.equal(env.log.copies.length,2);assert.deepEqual(env.log.copies.map(copy=>copy.width),[80,112]);assert.deepEqual(env.log.uniforms.filter(item=>item.name==='kind').map(item=>item.value),[0,1]);assert.equal(env.pending.size,0);assert.equal(controller.metrics().animatedDraws,0);
    for(const host of env.hosts()){assert.ok(host.querySelector('.one-res-material-fallback'),'Permanent fallback stays in the DOM');const canvas=host.querySelector('canvas');assert.equal(canvas.getAttribute('aria-hidden'),'true');assert.equal(canvas.getAttribute('tabindex'),null);assert.equal(canvas.style.pointerEvents,'none');assert.equal(canvas.dataset.draws,'1');}
    assert.deepEqual([...env.document.querySelectorAll('[data-action]')].map(button=>button.textContent),['Working materials','Reference document']);
    for(let index=0;index<10;index++)controller.refresh({dark:!!(index%2)});assert.equal(env.log.requests,1);assert.equal(env.log.shaderSources.length,2);assert.equal(env.pending.size,0);
    const removed=env.hosts()[0],oldRow=removed.parentElement;oldRow.remove();controller.refresh();assert.equal(controller.metrics().hosts,1);assert.equal(removed.querySelector('canvas'),null);env.event(oldRow,'pointerenter');assert.equal(env.pending.size,0,'Removed row listeners are detached');
    env.root.insertAdjacentHTML('beforeend','<article class="one-res-row"><span class="one-res-material" data-material-kind="externalFolder"><span class="one-res-material-fallback">Folder</span></span><button>Provider folder</button></article>');const added=env.hosts().at(-1);env.measure(added);controller.refresh();assert.equal(added.dataset.material,'webgl');assert.equal(env.log.requests,1);assert.equal(env.log.uniforms.filter(item=>item.name==='kind').at(-1).value,0);assert.equal(env.window.localStorage.getItem('dwdg-workspace-v1'),'existing saved records');
  }finally{controller.destroy();assert.equal(env.pending.size,0);assert.equal(env.log.deletedShaders.length,2);assert.equal(env.log.deletedPrograms.length,1);assert.equal(env.log.deletedBuffers.length,1);assert.equal(env.log.lost,1);assert.equal(controller.metrics().activeContexts,0);await env.close();}
});

test('hover and keyboard focus animate only for 180ms, and leave, hidden or changed policy immediately stop frames',async()=>{
  const env=environment(),controller=mountResourceMaterials(env.root),row=env.hosts()[0].parentElement;try{
    env.event(row,'pointerenter',{pointerType:'touch'});assert.equal(env.pending.size,0);env.event(row,'pointerenter',{pointerType:'mouse'});assert.equal(env.pending.size,1);env.frame(10);env.frame(100);env.frame(181);assert.equal(env.pending.size,0);assert.equal(controller.metrics().animatedHosts,0);assert.equal(controller.metrics().animatedDraws,3);
    env.event(row,'focusin');assert.equal(env.pending.size,1);env.event(row,'focusout');assert.equal(env.pending.size,0);env.event(row,'pointerenter');env.hidden(true);assert.equal(env.pending.size,0);assert.equal(controller.metrics().enhancedHosts,0);const stopped=env.log.draws;env.frame(300);assert.equal(env.log.draws,stopped);
    env.hidden(false);assert.equal(controller.metrics().enhancedHosts,2);assert.equal(env.log.requests,1);env.event(row,'pointerenter');env.media('(prefers-reduced-motion: reduce)',true);assert.equal(env.pending.size,0);assert.equal(controller.metrics().reason,'reduced');assert.equal(controller.metrics().enhancedHosts,0);env.event(row,'focusin');assert.equal(env.pending.size,0);
    env.media('(prefers-reduced-motion: reduce)',false);assert.equal(controller.metrics().enhancedHosts,2);env.event(row,'pointerenter');env.media('(pointer: coarse)',true);assert.equal(env.pending.size,0);assert.equal(controller.metrics().reason,'coarse');env.media('(pointer: coarse)',false);controller.refresh({solid:true});assert.equal(controller.metrics().enhancedHosts,0);assert.equal(controller.metrics().reason,'solid');assert.equal(controller.metrics().activeContexts,1,'The one tiny context is retained idle for future refresh, rather than recreated');const idle=env.log.draws;env.frame(1000);assert.equal(env.log.draws,idle);assert.equal(env.log.requests,1);
  }finally{controller.destroy();env.event(row,'pointerenter');assert.equal(env.pending.size,0);await env.close();}
});

test('initial static policies and offscreen hosts allocate no GPU, then viewport entry enhances lazily',async()=>{
  for(const [settings,options]of [[{}, {enabled:false}],[{}, {solid:true}],[{}, {motion:'reduced'}],[{coarse:true},{}],[{reduced:true},{}],[{hidden:true},{}],[{offscreen:true},{}]]){
    const env=environment(settings),controller=mountResourceMaterials(env.root,options);try{assert.equal(env.log.requests,0);assert.equal(controller.metrics().draws,0);assert.equal(controller.metrics().enhancedHosts,0);assert.equal(env.pending.size,0);for(const host of env.hosts())assert.equal(host.dataset.material,'static');}finally{controller.destroy();await env.close();}
  }
  const env=environment({offscreen:true}),controller=mountResourceMaterials(env.root);try{env.hosts().forEach(host=>env.measure(host));env.window.dispatchEvent(new env.window.Event('scroll'));assert.equal(env.log.requests,1);assert.equal(controller.metrics().enhancedHosts,2);env.event(env.hosts()[0].parentElement,'pointerenter');env.hosts().forEach(host=>env.measure(host,{top:1500}));env.window.dispatchEvent(new env.window.Event('scroll'));assert.equal(env.pending.size,0);assert.equal(controller.metrics().enhancedHosts,0);}finally{controller.destroy();await env.close();}
});

test('missing GPU, shader/link errors, empty output and 2D copy failures always expose the complete static fallback',async()=>{
  for(const failure of ['unavailable','compile','link','empty','draw','2d','blit']){
    const env=environment({failure}),controller=mountResourceMaterials(env.root);try{
      assert.equal(controller.metrics().enhancedHosts,0,failure);assert.equal(controller.metrics().activeContexts,0,failure);assert.equal(env.pending.size,0);for(const host of env.hosts()){assert.equal(host.dataset.material,'static');assert.ok(host.querySelector('.one-res-material-fallback'));for(const canvas of host.querySelectorAll('canvas'))assert.equal(canvas.hidden,true);}
      const requested=env.log.requests;controller.refresh();assert.equal(env.log.requests,requested,'Permanent failures do not repeatedly request contexts during rerender');
    }finally{controller.destroy();await env.close();}
  }
});

test('context loss cancels animation, removes GPU ownership, and keeps controls and fallback usable through refresh',async()=>{
  const env=environment(),controller=mountResourceMaterials(env.root);try{
    env.event(env.hosts()[0].parentElement,'pointerenter');assert.equal(env.pending.size,1);const event=env.contextLoss();assert.equal(event.defaultPrevented,true);assert.equal(env.pending.size,0);assert.equal(controller.metrics().activeContexts,0);assert.equal(controller.metrics().enhancedHosts,0);assert.equal(controller.metrics().reason,'context-lost');controller.refresh({dark:true});assert.equal(env.log.requests,1);assert.equal(env.document.querySelectorAll('button[data-action="res-open"]').length,2);assert.equal(env.window.localStorage.getItem('dwdg-workspace-v1'),'existing saved records');
  }finally{controller.destroy();await env.close();}
});

test('real markup placeholder canvases are reused once and remain hidden for the permanent fallback after destroy',async()=>{
  const env=environment(),placeholders=env.hosts().map(host=>{const canvas=env.document.createElement('canvas');canvas.className='one-material-canvas';canvas.hidden=true;host.append(canvas);return canvas;}),controller=mountResourceMaterials(env.root);try{
    env.hosts().forEach((host,index)=>{assert.equal(host.querySelectorAll('canvas').length,1);assert.equal(host.querySelector('canvas'),placeholders[index]);assert.equal(placeholders[index].hidden,false);});controller.refresh({dark:true});env.hosts().forEach(host=>assert.equal(host.querySelectorAll('canvas').length,1));
  }finally{controller.destroy();env.hosts().forEach((host,index)=>{assert.equal(host.querySelector('canvas'),placeholders[index]);assert.equal(placeholders[index].hidden,true);assert.equal(host.dataset.material,'static');});await env.close();}
});

test('intersection observation drops offscreen animation and is detached with removed hosts and controller destruction',async()=>{
  const env=environment({intersection:true}),controller=mountResourceMaterials(env.root);try{
    const host=env.hosts()[0];env.event(host.parentElement,'pointerenter');env.measure(host,{top:1500});env.intersect(host,false);assert.equal(host.dataset.material,'static');assert.equal(env.pending.size,0);env.measure(host);env.intersect(host,true);assert.equal(host.dataset.material,'webgl');host.parentElement.remove();controller.refresh();assert.ok(env.log.unobserved.includes(host));
  }finally{controller.destroy();assert.equal(env.log.disconnected,1);await env.close();}
});
