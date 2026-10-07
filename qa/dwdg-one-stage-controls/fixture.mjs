import {mountPreview} from '/dwdg-one-preview.mjs';
import {createPreviewStore,PREVIEW_KEY} from '/dwdg-one-preview-data.mjs';

// In-memory same-code fixture: no product or browser records are read/written.
const memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
const store=createPreviewStore(storage),params=new URLSearchParams(location.search);
const state=JSON.parse(memory.get(PREVIEW_KEY));
state.preferences={...state.preferences,language:params.get('lang')==='id'?'id':'en',theme:params.get('theme')==='dark'?'dark':'light',motion:params.get('motion')==='reduced'?'reduced':'system',transparency:params.get('surface')==='solid'?'solid':'translucent'};
state.views.consulting={route:'projects',status:params.get('stage')||'all',query:'',lead:'all',sort:'target',scroll:0,selectedId:'',panel:''};
memory.set(PREVIEW_KEY,JSON.stringify(state));
const shell=document.getElementById('stage-qa-shell');document.body.append(shell.content.cloneNode(true));shell.remove();
const preview=mountPreview({storage});window.addEventListener('pagehide',()=>preview.destroy(),{once:true});
