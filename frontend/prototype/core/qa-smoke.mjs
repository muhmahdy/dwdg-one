/* Non-visual smoke harness for the classic prototype scripts. No browser/profile or filesystem writes.
   node frontend/prototype/core/qa-smoke.mjs [comfortable|compact|simple] [overlays|interactions]
   Real geometry is verified by the opt-in browser QA panel; happy-dom only catches runtime failures. */
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Window} from 'happy-dom';
const root=new URL('../',import.meta.url),read=path=>readFileSync(new URL(path,root),'utf8');
const window=new Window({url:'http://localhost/frontend/prototype/?qa#/work',width:800,height:800});
window.document.body.innerHTML='<div id="app"></div><div id="layer"></div><div id="toast"></div>';
window.localStorage.setItem('dwdg-one-proto-session',JSON.stringify({me:'mahdy',ws:'sng',theme:'light',look:'comfortable'}));
const context=vm.createContext({window,document:window.document,location:window.location,history:window.history,navigator:window.navigator,
  localStorage:window.localStorage,sessionStorage:window.sessionStorage,Node:window.Node,NodeFilter:window.NodeFilter,
  Element:window.Element,HTMLElement:window.HTMLElement,HTMLInputElement:window.HTMLInputElement,Event:window.Event,MouseEvent:window.MouseEvent,KeyboardEvent:window.KeyboardEvent,
  MutationObserver:window.MutationObserver,ResizeObserver:window.ResizeObserver,
  getComputedStyle:window.getComputedStyle.bind(window),matchMedia:window.matchMedia.bind(window),addEventListener:window.addEventListener.bind(window),
  innerWidth:800,innerHeight:800,scrollX:0,scrollY:0,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},
  setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,URL,URLSearchParams,structuredClone,performance,console});
for(const name of ['QA','UIPlacement','UIPolish','UIEffects','DBCommit'])Object.defineProperty(context,name,{get:()=>window[name]});
const run=code=>vm.runInContext(code,context);
try {
  for(const match of read('index.html').matchAll(/<script src="([^"]+)"/g))run(read(match[1]));
  run(read('core/qa.js'));
  const before=run('JSON.stringify({db,session,ui,PH})'),stored=window.localStorage.getItem('dwdg-one-proto-v2');
  const overlayMode=process.argv[3]==='overlays',interactions=process.argv[3]==='interactions';
  const result=await window.QA.sweep({looks:[process.argv[2] || 'comfortable'],langs:['en','id'],themes:overlayMode?['light']:['light','dark'],accts:['mahdy'],overlays:overlayMode,
    ...(overlayMode?{routes:['work','schedule'],workspaces:['sng']}:{}),...(interactions?{interactions:true,accts:[]}: {})});
  const runtimeIssues=result.details.filter(x=>['crash','sweep-error','undefined','interaction'].includes(x.k));
  const restored=before===run('JSON.stringify({db,session,ui,PH})') && stored===window.localStorage.getItem('dwdg-one-proto-v2');
  console.log(JSON.stringify({checked:result.checked,restored,runtimeIssues,interactions:result.interactions},null,2));
  if(runtimeIssues.length || !restored)process.exitCode=1;
}finally{await window.happyDOM.abort();}
