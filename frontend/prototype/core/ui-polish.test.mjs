import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const source = name => readFileSync(new URL(name, import.meta.url), 'utf8');
function environment() {
  const window = new Window({url:'http://localhost/frontend/prototype/?qa#/projects/p-live',width:375,height:800});
  window.document.body.innerHTML='<div id="app"><input id="draft" value="Saved value"></div><div id="layer"></div><div id="toast"></div>';
  const context=vm.createContext({window,document:window.document,location:window.location,history:window.history,
    getComputedStyle:window.getComputedStyle.bind(window),matchMedia:window.matchMedia.bind(window),innerWidth:375,innerHeight:800,scrollX:0,scrollY:0,
    NodeFilter:window.NodeFilter,Element:window.Element,HTMLElement:window.HTMLElement,MutationObserver:window.MutationObserver,
    addEventListener:window.addEventListener.bind(window),setTimeout,clearTimeout,queueMicrotask,console});
  Object.defineProperty(context,'UIPlacement',{get:()=>window.UIPlacement});
  return {window,context,run:code=>vm.runInContext(code,context),close:()=>window.happyDOM.abort()};
}
function polish() {const e=environment();e.run(source('./ui-polish.js'));return e;}

test('notification menu stays inside a 320px viewport and flips above a low anchor',async()=>{
  const e=polish();try{
    const p=e.window.UIPlacement.compute({left:280,right:312,top:500,bottom:532},{width:360,height:250},{left:0,top:0,width:320,height:568},{alignRight:true});
    assert.equal(p.width,304);assert.equal(p.left,8);assert.equal(p.side,'above');assert.ok(p.top>=8);assert.ok(p.top+250<=560);
  }finally{await e.close();}
});
test('tall menu chooses the larger side and leaves a usable internal scroll area',async()=>{
  const e=polish();try{
    const p=e.window.UIPlacement.compute({left:20,right:60,top:400,bottom:436},{width:264,height:1200},{left:0,top:0,width:375,height:667});
    assert.equal(p.side,'above');assert.equal(p.maxHeight,384);assert.equal(p.top,8);assert.ok(p.left+p.width<=367);
  }finally{await e.close();}
});
test('placement respects a shifted visual viewport during zoom or a mobile keyboard',async()=>{
  const e=polish();try{
    const p=e.window.UIPlacement.compute({left:25,right:85,top:460,bottom:495},{width:350,height:220},{left:80,top:200,width:240,height:300});
    assert.equal(p.width,224);assert.ok(p.left>=88);assert.ok(p.left+p.width<=312);assert.ok(p.top>=208);assert.ok(p.top+Math.min(220,p.maxHeight)<=492);
  }finally{await e.close();}
});
test('draft, focus, selection and field scroll survive replacement of the same form',async()=>{
  const e=polish();try{
    const app=e.window.document.getElementById('app'),draft=app.querySelector('input');
    draft.value='Unsubmitted draft';draft.focus();draft.setSelectionRange(3,10);draft.scrollLeft=14;
    const snapshot=e.window.UIPolish.capture(app);app.innerHTML='<input id="draft" value="Saved value">';
    const replacement=app.querySelector('input');replacement.getClientRects=()=>[{width:100,height:25}];
    e.window.UIPolish.restore(snapshot,app,{focus:true,values:true});
    assert.equal(replacement.value,'Unsubmitted draft');assert.equal(e.window.document.activeElement,replacement);
    assert.equal(replacement.selectionStart,3);assert.equal(replacement.selectionEnd,10);assert.equal(replacement.scrollLeft,14);
  }finally{await e.close();}
});
test('a newer saved field value takes precedence over an old draft',async()=>{
  const e=polish();try{
    const app=e.window.document.getElementById('app');app.querySelector('input').value='Unsubmitted draft';
    const snapshot=e.window.UIPolish.capture(app);app.innerHTML='<input id="draft" value="New saved value">';
    e.window.UIPolish.restore(snapshot,app,{focus:false});assert.equal(app.querySelector('input').value,'New saved value');
  }finally{await e.close();}
});
test('select drafts survive rerenders but cannot overwrite a newly saved selection',async()=>{
  const e=polish();try{
    const app=e.window.document.getElementById('app');
    const form=selected=>`<select id="assignee"><option value="a" ${selected==='a'?'selected':''}>A</option><option value="b" ${selected==='b'?'selected':''}>B</option><option value="c" ${selected==='c'?'selected':''}>C</option></select>`;
    // happy-dom does not implement HTMLOptionElement.defaultSelected; model its native attribute reflection.
    const install=selected=>{app.innerHTML=form(selected);for(const option of app.querySelectorAll('option'))Object.defineProperty(option,'defaultSelected',{get:()=>option.hasAttribute('selected')});app.querySelector('select').value=selected;};
    install('a');app.querySelector('select').value='b';const state=e.window.UIPolish.capture(app);
    install('a');e.window.UIPolish.restore(state,app,{focus:false});assert.equal(app.querySelector('select').value,'b');
    install('c');e.window.UIPolish.restore(state,app,{focus:false});assert.equal(app.querySelector('select').value,'c');
  }finally{await e.close();}
});
test('the reduced-motion preference suppresses action animation calls and completion ghosts',async()=>{
  const e=environment();try{
    e.context.matchMedia=()=>({matches:true,addEventListener(){}});e.run(source('./ui-polish.js'));
    e.window.document.getElementById('app').innerHTML='<button data-act="toggle" data-id="t1">Done</button><button class="pin-btn" data-k="project" data-id="p1"><span class="ic"></span></button>';
    let animated=0;for(const el of e.window.document.querySelectorAll('button,.ic')){el.getClientRects=()=>[{width:24,height:24}];el.animate=()=>{animated++;return {finished:Promise.resolve(),cancel(){}};};}
    e.window.UIEffects.complete('t1',{left:10,top:10,width:24,height:24});e.window.UIEffects.pin('project','p1');
    assert.equal(animated,0);assert.equal(e.window.document.querySelector('.ui-completion-fx'),null);
  }finally{await e.close();}
});

function overlays() {
  const e=environment(),document=e.window.document;
  document.getElementById('app').innerHTML='<button id="previous">Previous action</button><button id="opener">Open menu</button>';
  e.context.geometry=()=>{
    for(const el of document.querySelectorAll('*')){
      el.getClientRects=()=>[{width:100,height:30}];
      el.getBoundingClientRect=()=>({left:16,right:116,top:30,bottom:60,width:100,height:30});
    }
  };
  e.context.geometry();
  e.run(`
    const ui={menu:null,palette:false,insp:null,composer:null,draft:null};const CF={open:null};
    const ACT={'close-insp':()=>{ui.insp=null;}};
    function render(){}
    function cfClose(){CF.open=null;document.getElementById('cfpop')?.replaceChildren();}
    function renderLayer(){document.getElementById('layer').innerHTML=ui.menu?'<div class="pop popmenu" role="menu"><button id="item">Menu item</button></div>':ui.palette?'<div class="pop palette" role="dialog"><input id="first"><button id="last">Last control</button></div>':'';geometry();}
  `);
  e.run(source('./ui-polish.js'));
  return e;
}
test('a keyboard-opened menu returns focus to its opener, not an earlier pointer action',async()=>{
  const e=overlays();try{
    const d=e.window.document,previous=d.getElementById('previous'),opener=d.getElementById('opener');
    previous.dispatchEvent(new e.window.MouseEvent('pointerdown',{bubbles:true}));opener.focus();
    opener.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    e.run('ui.menu={type:"test",rect:{left:16,right:116,top:30,bottom:60}};renderLayer();');
    assert.equal(d.activeElement.id,'item');
    d.activeElement.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert.equal(e.run('ui.menu'),null);assert.equal(d.activeElement,opener);
  }finally{await e.close();}
});
test('a modal traps Tab and Escape closes a nested picker before its containing modal',async()=>{
  const e=overlays();try{
    const d=e.window.document;e.run('ui.palette=true;renderLayer();');
    const last=d.getElementById('last');last.focus();
    last.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    assert.equal(d.activeElement.id,'first');
    const picker=d.createElement('div');picker.id='cfpop';picker.innerHTML='<div class="pop cf-pop" role="dialog"><button id="day">12</button></div>';d.body.append(picker);e.context.geometry();
    e.run('CF.open={btn:document.getElementById("last")};');d.getElementById('day').focus();
    d.activeElement.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert.equal(e.run('CF.open'),null);assert.equal(e.run('ui.palette'),true);assert.equal(d.activeElement,last);
  }finally{await e.close();}
});
test('modal focus traversal skips an invisible native field behind a custom picker',async()=>{
  const e=overlays();try{
    const d=e.window.document;e.run('ui.palette=true;renderLayer();');
    const source=d.createElement('select');source.className='cf-src';source.tabIndex=-1;source.setAttribute('aria-hidden','true');source.innerHTML='<option>Hidden source</option>';
    d.querySelector('.palette').append(source);e.context.geometry();
    const last=d.getElementById('last');last.focus();last.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    assert.equal(d.activeElement.id,'first');
  }finally{await e.close();}
});
test('suspending a modal for QA restores its inert background and dismissal opener',async()=>{
  const e=overlays();try{
    const d=e.window.document,opener=d.getElementById('opener');opener.focus();
    e.run('ui.palette=true;renderLayer();');
    const state=e.window.UIPolish.snapshot();assert.equal(d.getElementById('app').inert,true);
    e.window.UIPolish.reset();assert.equal(d.getElementById('app').inert,false);
    e.window.UIPolish.resume(state);assert.equal(d.getElementById('app').inert,true);
    d.getElementById('first').focus();d.activeElement.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert.equal(e.run('ui.palette'),false);assert.equal(d.getElementById('app').inert,false);assert.equal(d.activeElement,opener);
  }finally{await e.close();}
});

function qaEnvironment() {
  const e=environment();
  e.run(`
    let db={marker:'live',people:[{id:'mahdy',status:'active',div:'sng'}],projects:[],tasks:[]};
    let session={me:'mahdy',ws:'sng',look:'compact',theme:'dark',lang:'id',custom:{preserve:true}};
    const ui={insp:null,menu:null,view:{custom:true},draft:{title:'Unsaved work'}};
    const UNDO={u:[{msg:'Live undo',undo:()=>42}],r:[]};const PH={s:[{k:'live'}],i:0,jump:false,want:undefined};
    const CF={open:null};let writes=0,throwSeed=false;
    function save(){writes++;return true;}function saveSession(){writes++;return true;}
    const PAGES={work:()=>{},projects:()=>{}};const SIMPLE_PAGES=['work','projects'];const MENUS={};
    const me=()=>db.people.find(p=>p.id===session.me),person=id=>db.people.find(p=>p.id===id),ws=()=>session.ws;
    const visibleDivs=()=>['sng'],capsFor=()=>[],look=()=>session.look,inShip=()=>true,isDone=t=>t.status==='done',taskDiv=()=> 'sng';
    function render(){document.documentElement.dataset.theme=session.theme;document.body.dataset.look=session.look;document.getElementById('app').innerHTML='<p>NaN</p>';save();saveSession();}
    function renderLayer(){}function cfClose(){CF.open=null;document.getElementById('cfpop')?.replaceChildren();}
    window.seedData=()=>{if(throwSeed)throw new Error('Seed failure');return {people:[{id:'mahdy',status:'active',div:'sng'}],projects:[],tasks:[]};};
    const original={db,session,save,saveSession,ui:{...ui},undo:UNDO.u,ph:PH.s};
  `);
  e.run(source('./qa.js'));
  return e;
}
test('QA matrix keeps separate findings for themes and restores live data, history and draft DOM',async()=>{
  const e=qaEnvironment();try{
    const document=e.window.document,draft=document.getElementById('draft');draft.value='Unsaved live draft';draft.focus();draft.setSelectionRange(1,5);
    const result=await e.window.QA.sweep({looks:['compact'],langs:['en'],themes:['light','dark'],accts:['mahdy'],routes:['work'],overlays:false});
    assert.equal(result.checked,2);assert.equal(result.count,2);assert.equal(new Set(result.details.map(x=>x.key)).size,2);
    assert.equal(e.run('db===original.db && session===original.session && save===original.save && saveSession===original.saveSession'),true);
    assert.equal(e.run('ui.draft===original.ui.draft && UNDO.u===original.undo && PH.s===original.ph'),true);
    assert.equal(e.run('writes'),0);assert.equal(e.window.location.hash,'#/projects/p-live');assert.equal(document.getElementById('draft'),draft);
    assert.equal(draft.value,'Unsaved live draft');assert.equal(document.activeElement,draft);assert.equal(draft.selectionStart,1);assert.equal(draft.selectionEnd,5);
    assert.equal(e.window.QA.running,false);assert.equal(document.getElementById('app').hasAttribute('inert'),false);
  }finally{await e.close();}
});
test('QA restores references and write functions even if setup crashes',async()=>{
  const e=qaEnvironment();try{
    e.run('throwSeed=true');const result=await e.window.QA.sweep({overlays:false});
    assert.equal(result.by['sweep-error'],1);assert.match(result.issues[0],/Seed failure/);
    assert.equal(e.run('db===original.db && session===original.session && save===original.save && saveSession===original.saveSession'),true);
    assert.equal(e.run('writes'),0);assert.ok(e.window.document.getElementById('draft'));assert.equal(e.window.QA.running,false);
  }finally{await e.close();}
});
