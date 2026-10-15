// A bounded local WebGL prototype. Reading surfaces and resource labels remain ordinary HTML.
const vertex=`attribute vec2 position; varying vec2 uv; void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision mediump float;
varying vec2 uv; uniform float phase; uniform float dark;
void main(){
 vec2 p=uv*.98;float r=length(p);float edge=1.-smoothstep(.88,.98,r);
 float dome=sqrt(max(0.,1.-r*r));
 float band=sin((p.x*.8+p.y*.5)*7.+phase*.6+dome*4.);
 vec3 mineral=mix(vec3(.64,.78,.79),vec3(.81,.87,.64),.5+.5*band);
 vec3 base=mix(vec3(.91,.95,.97),vec3(.29,.39,.43),dark);
 vec3 color=mix(base,mineral,.6*dome);
 float highlight=pow(max(0.,dot(normalize(vec3(p,dome)),normalize(vec3(-.6,.8,1.3)))),16.);
 color+=highlight*.4;
 color+=vec3(.65)*smoothstep(.77,.91,r)*edge*.45;
 float shade=.75+.25*dome; color*=shade;
 gl_FragColor=vec4(color*edge,edge);
}`;

export function opticalPolicy({enabled=true,motion='system',coarse=false,reduced=false,hidden=false}={}) {
 return enabled&&!coarse&&!hidden&&motion!=='reduced'&&!(motion!=='full'&&reduced);
}
export function mountOptical(canvas,{enabled=true,motion='system',dark=false}={}) {
 if(!canvas)return {destroy(){},setDark(){}};
 const host=canvas.parentElement,win=canvas.ownerDocument.defaultView,doc=canvas.ownerDocument;
 const coarse=win.matchMedia?.('(pointer: coarse)').matches||false,reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
 let gl,program,buffer,frame=0,disposed=false,started=0,phase=0,draws=0;
 const shaders=[];
 const fallback=()=>{canvas.hidden=true;if(host)host.dataset.material='static';};
 if(!opticalPolicy({enabled,motion,coarse,reduced,hidden:doc.hidden})){fallback();return {destroy(){},setDark(){}};}
 const draw=()=>{
  if(disposed||doc.hidden||!gl||gl.isContextLost())return;
  gl.uniform1f(gl.getUniformLocation(program,'phase'),phase);
  gl.uniform1f(gl.getUniformLocation(program,'dark'),dark?1:0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);draws++;canvas.dataset.draws=String(draws);
 };
 const tick=now=>{frame=0;if(disposed||doc.hidden)return;phase=Math.min(1,(now-started)/600)*3.14;draw();if(now-started<600)frame=win.requestAnimationFrame(tick);};
 const animate=()=>{if(disposed||doc.hidden)return;win.cancelAnimationFrame(frame);started=win.performance.now();frame=win.requestAnimationFrame(tick);};
 const lost=event=>{event.preventDefault();win.cancelAnimationFrame(frame);fallback();};
 const visibility=()=>{win.cancelAnimationFrame(frame);frame=0;if(!doc.hidden)draw();};
 try {
  gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});
  if(!gl)throw new Error('No WebGL');
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader failed');}
  program=gl.createProgram();shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program failed');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.viewport(0,0,canvas.width,canvas.height);
  canvas.hidden=false;host.dataset.material='webgl';draw();
  canvas.addEventListener('webglcontextlost',lost);host.addEventListener('pointerenter',animate);doc.addEventListener('visibilitychange',visibility);
 }catch{fallback();if(gl&&!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.filter(Boolean).forEach(shader=>gl.deleteShader(shader));}return {destroy(){},setDark(){}};}
 return {setDark(value){dark=value;draw();},get draws(){return draws;},destroy(){disposed=true;win.cancelAnimationFrame(frame);canvas.removeEventListener('webglcontextlost',lost);host?.removeEventListener('pointerenter',animate);doc.removeEventListener('visibilitychange',visibility);if(gl&&!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));gl.getExtension('WEBGL_lose_context')?.loseContext();}}};
}
