import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const source = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const work = source('../screens/work.js');
const keyStart = work.indexOf('ON_KEY.push(e => {');
const peopleKeys = work.slice(work.indexOf('const pmOpen ='),work.indexOf('\nObject.assign(ACT,',work.indexOf('const pmOpen ='))) + '\n' + work.slice(keyStart,work.indexOf('// Quick add:',keyStart));

function setup() {
  const window = new Window({url:'http://localhost/',width:320,height:360}), document = window.document;
  document.body.innerHTML = '<div id="app"><div id="scroller"><input id="tr-add" data-pm="tr"></div></div><div id="layer"></div><div id="pmfloat2" class="pm-host" data-key="tr"><div class="pm"><div class="pm-l"></div><div class="pm-r"><div class="mi act">Selected person</div></div></div></div>';
  const context = vm.createContext({window,document,innerWidth:320,innerHeight:360,getComputedStyle:window.getComputedStyle.bind(window),matchMedia:window.matchMedia.bind(window),
    addEventListener:window.addEventListener.bind(window),queueMicrotask,console});
  Object.defineProperty(context,'UIPlacement',{get:()=>window.UIPlacement});
  vm.runInContext('const ui={menu:null};function render(){}function renderLayer(){}',context);
  vm.runInContext(source('./ui-polish.js'),context);
  const host=document.getElementById('pmfloat2'), list=host.querySelector('.pm-r'), item=list.firstElementChild, input=document.getElementById('tr-add');
  const rect=(top,height,left=8,width=304)=>({top,bottom:top+height,left,right:left+width,width,height});
  input.getBoundingClientRect=()=>rect(50,30,250,50);
  Object.defineProperties(host,{offsetWidth:{get:()=>parseFloat(host.style.width)||304},scrollHeight:{get:()=>520},clientHeight:{get:()=>Math.min(520,parseFloat(host.style.maxHeight)||520)}});
  host.getBoundingClientRect=()=>rect(parseFloat(host.style.top)||0,host.clientHeight);
  Object.defineProperty(list,'clientHeight',{get:()=>240});
  list.getBoundingClientRect=()=>rect(host.getBoundingClientRect().top+246-host.scrollTop,240);
  item.getBoundingClientRect=()=>rect(list.getBoundingClientRect().top+400-list.scrollTop,40);
  return {window,document,host,list,item,input,context,close:()=>window.happyDOM.abort()};
}

test('keyboard-selected person stays visible in both a long list and a short viewport without moving the page',async()=>{
  const e=setup();try{
    const scroller=e.document.getElementById('scroller');scroller.scrollTop=90;e.input.focus();
    e.window.UIPlacement.peoplePlace(e.host,e.input,true);
    assert.equal(e.list.scrollTop,200);assert.equal(e.host.scrollTop,218);
    assert.ok(e.item.getBoundingClientRect().top>=e.host.getBoundingClientRect().top);
    assert.ok(e.item.getBoundingClientRect().bottom<=e.host.getBoundingClientRect().bottom);
    assert.equal(scroller.scrollTop,90);assert.equal(e.document.activeElement,e.input);
  }finally{await e.close();}
});

test('scrolling people results retains their DOM and position; page scroll only repositions the surface',async()=>{
  const e=setup();try{
    e.window.UIPlacement.peoplePlace(e.host,e.input);
    e.list.scrollTop=123;e.host.scrollTop=40;
    e.list.dispatchEvent(new e.window.Event('scroll',{bubbles:true}));
    assert.equal(e.host.querySelector('.pm-r'),e.list);assert.equal(e.list.scrollTop,123);assert.equal(e.host.scrollTop,40);
    e.input.getBoundingClientRect=()=>({left:20,right:70,top:100,bottom:130,width:50,height:30});
    e.document.getElementById('scroller').dispatchEvent(new e.window.Event('scroll',{bubbles:true}));
    assert.equal(e.host.style.top,'134px');assert.equal(e.list.scrollTop,123);assert.equal(e.host.scrollTop,40);
  }finally{await e.close();}
});

test('closing a nested people picker keeps its containing meeting form open',async()=>{
  const e=setup();try{
    e.host.querySelector('.pm').getClientRects=()=>[{width:304,height:200}];
    vm.runInContext(`ui.composer={text:'Keep this draft'};ui.pm={key:'tr',closed:false};const PICK={tr:{refresh(){document.getElementById('pmfloat2').replaceChildren();}}};`,e.context);
    e.input.focus();e.input.dispatchEvent(new e.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert.equal(vm.runInContext('ui.pm.closed',e.context),true);
    assert.equal(vm.runInContext('ui.composer.text',e.context),'Keep this draft');assert.equal(e.document.activeElement,e.input);
  }finally{await e.close();}
});

test('Tab in a people picker reaches its existing selection handler and retains the form draft',async()=>{
  const e=setup();try{
    e.host.querySelector('.pm').getClientRects=()=>[{width:304,height:200}];
    vm.runInContext(`ui.composer={text:'Keep this draft'};ui.pm={key:'tr',closed:false,level:'flat',idx:0,items:['member']};
      const ON_KEY=[];let selected=null;const PICK={tr:{pick(id){selected=id;ui.pm=null;document.getElementById('pmfloat2').replaceChildren();}}};`,e.context);
    vm.runInContext(peopleKeys,e.context);
    vm.runInContext('document.addEventListener("keydown",e=>ON_KEY.some(handle=>handle(e)));',e.context);
    e.input.focus();const key=new e.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});e.input.dispatchEvent(key);
    assert.equal(key.defaultPrevented,true);assert.equal(vm.runInContext('selected',e.context),'member');
    assert.equal(vm.runInContext('ui.composer.text',e.context),'Keep this draft');assert.equal(e.document.activeElement,e.input);
  }finally{await e.close();}
});
