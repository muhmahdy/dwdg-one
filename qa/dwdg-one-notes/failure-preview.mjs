import {mountPreview} from '/dwdg-one-preview.mjs';
import {RESOURCE_KEY} from '/dwdg-one-resources-data.mjs';

// A disposable browser fixture. It never reads or writes browser/product storage.
const memory=new Map();let unavailable=false;
const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>{if(unavailable&&key===RESOURCE_KEY)throw new Error('Illustrative unavailable storage');memory.set(key,value);}};
document.body.append(document.getElementById('notes-qa-shell').content.cloneNode(true));
document.getElementById('notes-qa-shell').remove();
const control=document.createElement('button');control.type='button';control.id='notes-qa-toggle';control.className='one-button';
control.style.cssText='position:fixed;right:12px;bottom:12px;z-index:1200;border:1px solid var(--one-line);font-size:12px';
const label=()=>{control.textContent=`QA fixture · Storage unavailable: ${unavailable?'On':'Off'}`;control.setAttribute('aria-pressed',String(unavailable));};
control.addEventListener('click',()=>{unavailable=!unavailable;label();});label();document.body.append(control);
mountPreview({storage});
