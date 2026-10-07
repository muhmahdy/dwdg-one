import {resourceIdentityMarkup} from '/dwdg-one-resource-identity.mjs';
import {mountResourceMaterials} from '/dwdg-one-resource-material.mjs';

const stage=document.getElementById('identities'),report=document.getElementById('metrics');
const originalContext=HTMLCanvasElement.prototype.getContext;
let controller,gpu,fault='',options={enabled:true,motion:'system',solid:false,dark:false};
HTMLCanvasElement.prototype.getContext=function(type,...args){
 if(type==='webgl'&&fault==='unavailable')return null;
 const context=originalContext.call(this,type,...args);
 if(type==='webgl'&&context){gpu=context;if(fault==='compile'){const parameter=context.getShaderParameter.bind(context);context.getShaderParameter=(shader,key)=>key===context.COMPILE_STATUS?false:parameter(shader,key);}}
 return context;
};
function content(){return `<div class="stage">${['row','large','small'].map(size=>['folder','file'].map(kind=>`<button class="sample" data-resource-id="fixture-${kind}-${size}">${resourceIdentityMarkup({kind},{size})}<span>${kind==='folder'?'Working materials':'Reference document'} · ${size}</span></button>`).join('')).join('')}</div><div class="stage below"><button class="sample" data-resource-id="below">${resourceIdentityMarkup({kind:'folder'})}<span>Below the viewport</span></button></div>`;}
function metrics(){report.textContent=JSON.stringify({mode:fault||'normal',...controller.metrics()},null,2);}
function start(mode=''){controller?.destroy();fault=mode;gpu=null;options={enabled:true,motion:'system',solid:false,dark:false};document.documentElement.dataset.theme='light';document.documentElement.dataset.motion='system';document.documentElement.dataset.transparency='glass';stage.innerHTML=content();controller=mountResourceMaterials(stage,options);metrics();}
function update(next){options={...options,...next};document.documentElement.dataset.theme=options.dark?'dark':'light';document.documentElement.dataset.motion=options.motion;document.documentElement.dataset.transparency=options.solid?'solid':'glass';controller.refresh(options);metrics();}
document.getElementById('normal').onclick=()=>update({enabled:true,motion:'system',solid:false});
document.getElementById('off').onclick=()=>update({enabled:false});
document.getElementById('reduced').onclick=()=>update({enabled:true,motion:'reduced',solid:false});
document.getElementById('solid').onclick=()=>update({enabled:true,motion:'system',solid:true});
document.getElementById('theme').onclick=()=>update({dark:!options.dark});
document.getElementById('rerender').onclick=()=>{for(let index=0;index<10;index++){stage.innerHTML=content();controller.refresh(options);}metrics();};
document.getElementById('loss').onclick=()=>{gpu?.getExtension('WEBGL_lose_context')?.loseContext();setTimeout(metrics,200);};
document.getElementById('unavailable').onclick=()=>start('unavailable');
document.getElementById('compile').onclick=()=>start('compile');
document.getElementById('restore').onclick=()=>start();
document.getElementById('unmount').onclick=()=>{controller.destroy();metrics();};
document.getElementById('probe').onclick=metrics;
start();
