// Disposable user-style simulation. It changes typography, not viewport or records.
// Native browser zoom must be reported separately from this text-only test.
export function installTextOverrides() {
 const params=new URLSearchParams(location.search),scale=params.get('text')==='200'?2:1,spacing=params.get('spacing')==='1';
 if(scale===1&&!spacing)return()=>{};
 const style=document.createElement('style');style.id='qa-text-overrides';
 // Copy only pixel typography declarations, retaining their media/container scope.
 // A declarative override applies to new nodes before their focus/scroll decisions.
 function typography(rule) {
  if(rule.selectorText&&rule.style){
   const declarations=['font-size','line-height'].flatMap(key=>{const value=rule.style.getPropertyValue(key).trim();return /^\d+(?:\.\d+)?px$/.test(value)?[`${key}:${parseFloat(value)*scale}px !important;`]:[];});
   return declarations.length?`${rule.selectorText}{${declarations.join('')}}`:'';
  }
  if(rule.cssRules){const inside=[...rule.cssRules].map(typography).join('');return inside?`${rule.cssText.slice(0,rule.cssText.indexOf('{'))}{${inside}}`:'';}
  return '';
 }
 const resize=scale===1?'':[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules].map(typography)).join('');
 style.textContent=resize+(spacing?'.one-preview, .one-preview *:not(svg,svg *) { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } .one-preview p { margin-bottom:2em !important; }':'');
 document.head.append(style);document.documentElement.dataset.qaText=String(scale*100);document.documentElement.dataset.qaSpacing=String(spacing);
 return()=>style.remove();
}
