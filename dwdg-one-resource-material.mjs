// Resource identities are decorative. One shared GPU surface serves bounded local canvases;
// ordinary HTML keeps every resource name, action, and permanent static fallback.
const VERTEX=`attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,0.0,1.0);}`;
const FRAGMENT=`precision mediump float;
varying vec2 uv;uniform float kind;uniform float dark;uniform float phase;uniform float pixel;
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}
vec4 over(vec4 under,vec3 color,float alpha){alpha=clamp(alpha,0.0,1.0);return vec4(color*alpha+under.rgb*(1.0-alpha),alpha+under.a*(1.0-alpha));}
vec4 shadow(vec4 under,float d,float opacity){return over(under,vec3(0.08,0.12,0.09),opacity*(1.0-smoothstep(-0.015,0.12,d)));}
vec4 coat(vec4 under,float d,vec3 color,vec2 p,float opacity,float polish){
 float a=(1.0-smoothstep(-pixel,pixel,d))*opacity;
 float light=0.93+0.055*p.y-0.025*p.x;
 float rim=exp(-abs(d+0.017)/0.022)*(0.09+0.07*clamp(p.y-p.x,0.0,1.0));
 float sheen=exp(-pow((p.x+p.y*0.42+0.38-phase*0.92)/0.18,2.0))*polish;
 return over(under,clamp(color*light+vec3(rim+sheen),0.0,1.0),a);
}
void main(){
 vec2 p=uv;vec4 c=vec4(0.0);
 vec3 jadeBack=mix(vec3(0.43,0.59,0.48),vec3(0.29,0.41,0.33),dark);
 vec3 jadeFront=mix(vec3(0.72,0.85,0.76),vec3(0.56,0.70,0.60),dark);
 vec3 paper=mix(vec3(1.0,0.995,0.98),vec3(0.96,0.98,0.93),dark);
 if(kind<0.5){
   // A tabbed rear, two independent paper layers, and a rounded translucent front flap.
   float rear=min(box(p-vec2(-0.01,-0.05),vec2(0.73,0.51),0.10),box(p-vec2(-0.39,0.47),vec2(0.33,0.15),0.08));
   float rearShadow=min(box(p-vec2(0.025,-0.105),vec2(0.73,0.51),0.10),box(p-vec2(-0.355,0.415),vec2(0.33,0.15),0.08));
   c=shadow(c,rearShadow,mix(0.15,0.24,dark));c=coat(c,rear,jadeBack,p,1.0,0.04);
   vec2 inset=p-vec2(0.045,0.03);inset.x+=inset.y*0.035;
   float sheetBack=box(inset,vec2(0.60,0.42),0.085);
   c=shadow(c,box(inset-vec2(0.018,-0.025),vec2(0.60,0.42),0.085),0.10);
   c=coat(c,sheetBack,mix(paper,vec3(0.82,0.88,0.82),0.14),p,1.0,0.025);
   float sheet=box(p-vec2(-0.005,-0.015),vec2(0.58,0.39),0.07);
   c=coat(c,sheet,paper,p,1.0,0.02);
   vec2 flap=p-vec2(0.015,-0.25);flap.x*=1.0+max(flap.y+0.33,0.0)*0.055;
   float front=box(flap,vec2(0.77,0.33),0.105);
   c=shadow(c,box(flap-vec2(0.0,-0.025),vec2(0.77,0.33),0.105),0.11);
   c=coat(c,front,jadeFront,p,0.98,0.075);
 }else{
   // A separate jade-backed sheet supports a white page with a real cut corner and fold.
   float stack=box(p-vec2(-0.11,-0.13),vec2(0.61,0.72),0.09);
   c=shadow(c,box(p-vec2(-0.08,-0.18),vec2(0.61,0.72),0.09),mix(0.15,0.24,dark));
   c=coat(c,stack,jadeBack,p,1.0,0.025);
   float innerPage=max(box(p-vec2(0.015,-0.055),vec2(0.57,0.735),0.06),p.x+p.y-1.04);
   c=coat(c,innerPage,mix(paper,vec3(0.82,0.88,0.82),0.14),p,1.0,0.02);
   float page=max(box(p-vec2(0.08,0.01),vec2(0.58,0.78),0.065),p.x+p.y-1.14);
   c=shadow(c,max(box(p-vec2(0.095,-0.005),vec2(0.58,0.78),0.065),p.x+p.y-1.14),0.10);
   c=coat(c,page,paper,p,1.0,0.035);
   float fold=max(max(0.35-p.x,0.485-p.y),p.x+p.y-1.14);
   c=shadow(c,max(max(0.36-p.x,0.465-p.y),p.x+p.y-1.14),0.12);
   c=coat(c,fold,mix(paper,vec3(0.81,0.88,0.81),0.20),p,1.0,0.08);
   float rule=min(box(p-vec2(0.06,0.12),vec2(0.30,0.024),0.024),min(box(p-vec2(0.06,-0.14),vec2(0.30,0.024),0.024),box(p-vec2(-0.02,-0.40),vec2(0.22,0.024),0.024)));
   c=over(c,mix(vec3(0.44,0.59,0.47),vec3(0.39,0.52,0.42),dark),(1.0-smoothstep(-pixel,pixel,rule))*0.28);
 }
 gl_FragColor=c;
}`;

export function resourceMaterialPolicy({enabled=true,motion='system',dark=false,solid=false,coarse=false,reduced=false,hidden=false}={}) {
  const reason=!enabled?'disabled':solid?'solid':coarse?'coarse':reduced||motion==='reduced'||motion==='off'?'reduced':hidden?'hidden':'';
  return Object.freeze({render:!reason,animate:!reason,dark:!!dark,reason});
}

export function materialPixelSize({width=40,height=40,dpr=1,large=false}={}) {
  const size=Math.max(1,Number(width)||1,Number(height)||1),ratio=Math.min(2,Math.max(1,Number(dpr)||1));
  return Math.min(large?160:96,Math.max(1,Math.ceil(size*ratio)));
}

/** Persistent controller: refresh after shell rendering; never inspect or mutate resource records. */
export function mountResourceMaterials(root,{enabled=true,motion='system',dark=false,solid=false}={}) {
  if(!root?.ownerDocument)return {refresh(){},destroy(){},metrics:()=>Object.freeze({hosts:0,enhancedHosts:0,contextsCreated:0,activeContexts:0,draws:0,animatedDraws:0,pendingFrames:0,reason:'no-root'})};
  const doc=root.ownerDocument,win=doc.defaultView;
  let options={enabled,motion,dark,solid},disposed=false,failed='',gl=null,gpuCanvas=null,program=null,buffer=null,frame=0,draws=0,animatedDraws=0,contextsCreated=0;
  const shaders=[],entries=new Map(),animations=new Map(),locations={};
  const coarse=win.matchMedia?.('(pointer: coarse)'),reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const policy=()=>resourceMaterialPolicy({...options,coarse:!!coarse?.matches,reduced:!!reduced?.matches,hidden:!!doc.hidden});
  const visible=host=>{const r=host.getBoundingClientRect();return host.isConnected&&r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<win.innerWidth&&r.top<win.innerHeight;};
  const fallback=(entry,reason='static')=>{entry.host.dataset.material='static';entry.reason=reason;if(entry.canvas)entry.canvas.hidden=true;};
  function stopFrames(){if(frame)win.cancelAnimationFrame(frame);frame=0;animations.clear();}
  function releaseGPU({lost=false}={}) {
    if(gpuCanvas)gpuCanvas.removeEventListener('webglcontextlost',contextLost);
    if(gl&&!lost&&!gl.isContextLost()){
      if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.filter(Boolean).forEach(shader=>gl.deleteShader(shader));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    gl=null;gpuCanvas=null;program=null;buffer=null;shaders.length=0;
  }
  function fail(reason){failed=reason;stopFrames();entries.forEach(entry=>fallback(entry,reason));releaseGPU({lost:reason==='context-lost'});}
  function contextLost(event){event.preventDefault();fail('context-lost');}
  function ensureGPU() {
    if(gl)return true;if(failed||!policy().render)return false;
    try{
      gpuCanvas=doc.createElement('canvas');gpuCanvas.width=96;gpuCanvas.height=96;
      gl=gpuCanvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});
      if(!gl)throw new Error('unavailable');contextsCreated++;gpuCanvas.addEventListener('webglcontextlost',contextLost);
      for(const [type,source]of [[gl.VERTEX_SHADER,VERTEX],[gl.FRAGMENT_SHADER,FRAGMENT]]){
        const shader=gl.createShader(type);if(!shader)throw new Error('shader');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('shader');
      }
      program=gl.createProgram();if(!program)throw new Error('program');shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('program');gl.useProgram(program);
      buffer=gl.createBuffer();if(!buffer)throw new Error('buffer');gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      for(const key of ['kind','dark','phase','pixel'])locations[key]=gl.getUniformLocation(program,key);
      return true;
    }catch{fail('gpu-unavailable');return false;}
  }
  function draw(entry,phase=0,animated=false) {
    if(disposed||failed||!policy().render||!visible(entry.host)){fallback(entry,failed||policy().reason||'offscreen');return false;}
    try{
      if(!entry.canvas){entry.canvas=entry.host.querySelector(':scope > canvas.one-material-canvas,:scope > canvas.one-res-material-canvas');entry.ownedCanvas=!entry.canvas;entry.canvas||=doc.createElement('canvas');entry.canvas.classList.add('one-res-material-canvas','one-material-canvas');entry.canvas.setAttribute('aria-hidden','true');entry.canvas.setAttribute('role','presentation');entry.canvas.style.pointerEvents='none';entry.canvas.hidden=true;entry.ctx=entry.canvas.getContext('2d',{alpha:true});if(!entry.ctx)throw new Error('blit');if(entry.ownedCanvas)entry.host.append(entry.canvas);}
      if(!ensureGPU())return false;
      if(gl.isContextLost())throw new Error('context');
      const rect=entry.host.getBoundingClientRect(),size=materialPixelSize({width:rect.width,height:rect.height,dpr:win.devicePixelRatio,large:entry.host.dataset.size==='large'||entry.host.dataset.materialSize==='large'||entry.host.classList.contains('large')});
      if(gpuCanvas.width!==size||gpuCanvas.height!==size){gpuCanvas.width=size;gpuCanvas.height=size;}
      gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      gl.uniform1f(locations.kind,entry.kind==='folder'?0:1);gl.uniform1f(locations.dark,options.dark?1:0);gl.uniform1f(locations.phase,phase);gl.uniform1f(locations.pixel,2/size);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      if(!entry.verified){const sample=new Uint8Array(4);gl.readPixels(Math.floor(size/2),Math.floor(size/2),1,1,gl.RGBA,gl.UNSIGNED_BYTE,sample);if(!sample[3])throw new Error('empty');}
      if(gl.getError()!==gl.NO_ERROR)throw new Error('draw');
      if(entry.canvas.width!==size||entry.canvas.height!==size){entry.canvas.width=size;entry.canvas.height=size;}
      entry.ctx.clearRect(0,0,size,size);entry.ctx.drawImage(gpuCanvas,0,0,size,size);entry.verified=true;entry.canvas.hidden=false;entry.host.dataset.material='webgl';entry.reason='';entry.draws=(entry.draws||0)+1;entry.canvas.dataset.draws=String(entry.draws);draws++;if(animated)animatedDraws++;return true;
    }catch{fail('render-failed');return false;}
  }
  function tick(now){frame=0;if(disposed||!policy().animate){stopFrames();return;}
    for(const [entry,start]of animations){if(!visible(entry.host)){animations.delete(entry);fallback(entry,'offscreen');continue;}const progress=Math.min(1,Math.max(0,(now-start)/180));draw(entry,Math.sin(progress*Math.PI),true);if(progress>=1)animations.delete(entry);}
    if(animations.size&&!failed)frame=win.requestAnimationFrame(tick);
  }
  function animate(entry,event){if(disposed||event?.pointerType==='touch'||!policy().animate||!visible(entry.host)||failed)return;animations.set(entry,win.performance.now());if(!frame)frame=win.requestAnimationFrame(tick);}
  function stopEntry(entry,event){if(event?.relatedTarget&&entry.anchor.contains(event.relatedTarget))return;animations.delete(entry);if(!animations.size&&frame){win.cancelAnimationFrame(frame);frame=0;}if(entry.host.dataset.material==='webgl')draw(entry);}
  function detach(entry){animations.delete(entry);observer?.unobserve(entry.host);for(const [type,listener]of entry.listeners)entry.anchor.removeEventListener(type,listener);fallback(entry);if(entry.ownedCanvas)entry.canvas?.remove();else entry.ctx?.clearRect(0,0,entry.canvas.width,entry.canvas.height);entries.delete(entry.host);}
  const observer=typeof win.IntersectionObserver==='function'?new win.IntersectionObserver(changes=>{if(disposed)return;for(const change of changes){const entry=entries.get(change.target);if(!entry)continue;if(change.isIntersecting)draw(entry);else {stopEntry(entry);fallback(entry,'offscreen');}}}):null;
  function refresh(next={}) {
    if(disposed)return;options={...options,...next};stopFrames();
    const hosts=new Set([...root.querySelectorAll('.one-res-material')].filter(host=>['folder','file','externalFolder'].includes(host.dataset.materialKind)));
    for(const entry of entries.values())if(!hosts.has(entry.host))detach(entry);
    for(const host of hosts){let entry=entries.get(host);const kind=host.dataset.materialKind==='externalFolder'?'folder':host.dataset.materialKind;
      if(entry&&entry.kind!==kind){detach(entry);entry=null;}
      if(!entry){const anchor=host.closest('.one-res-row,[data-resource-id],button')||host.parentElement||host;entry={host,kind,anchor,canvas:null,ctx:null,verified:false,reason:'static',listeners:[]};entries.set(host,entry);fallback(entry);
        entry.listeners=[['pointerenter',event=>animate(entry,event)],['pointerleave',event=>stopEntry(entry,event)],['focusin',event=>animate(entry,event)],['focusout',event=>stopEntry(entry,event)]];for(const [type,listener]of entry.listeners)anchor.addEventListener(type,listener);observer?.observe(host);
      }
      if(policy().render&&visible(host))draw(entry);else fallback(entry,policy().reason||'offscreen');
    }
  }
  const visibility=()=>{stopFrames();const current=policy();entries.forEach(entry=>current.render&&visible(entry.host)?draw(entry):fallback(entry,current.reason||'offscreen'));};
  const viewport=()=>{if(disposed)return;for(const entry of entries.values())if(visible(entry.host)&&policy().render){if(entry.host.dataset.material!=='webgl')draw(entry);}else{animations.delete(entry);fallback(entry,policy().reason||'offscreen');}if(!animations.size&&frame){win.cancelAnimationFrame(frame);frame=0;}};
  const resize=()=>refresh();
  const mediaChanged=()=>{stopFrames();visibility();};
  const mediaListen=(media,add)=>{if(media?.addEventListener)media[add?'addEventListener':'removeEventListener']('change',mediaChanged);else media?.[add?'addListener':'removeListener']?.(mediaChanged);};
  doc.addEventListener('visibilitychange',visibility);win.addEventListener('scroll',viewport,{passive:true,capture:true});win.addEventListener('resize',resize);mediaListen(coarse,true);mediaListen(reduced,true);refresh();
  // Policy changes and an empty resource page deliberately retain the one small allocation,
  // with zero queued frames. Refresh reuses it; failures and destroy release it completely.
  // activeContexts describes an allocated context, not a running animation.
  return {refresh,
    metrics:()=>Object.freeze({hosts:entries.size,enhancedHosts:[...entries.values()].filter(entry=>entry.host.dataset.material==='webgl').length,contextsCreated,activeContexts:gl?1:0,draws,animatedDraws,pendingFrames:frame?1:0,animatedHosts:animations.size,reason:failed||policy().reason||'',maxPixels:Math.max(0,...[...entries.values()].map(entry=>entry.canvas?.width||0))}),
    destroy(){if(disposed)return;disposed=true;stopFrames();observer?.disconnect();for(const entry of [...entries.values()])detach(entry);doc.removeEventListener('visibilitychange',visibility);win.removeEventListener('scroll',viewport,true);win.removeEventListener('resize',resize);mediaListen(coarse,false);mediaListen(reduced,false);releaseGPU();}
  };
}
