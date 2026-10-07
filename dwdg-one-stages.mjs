import {escapeHtml as h,icon} from './experience-ui.mjs';
import {STATUS_LABELS} from './dwdg-one-preview-data.mjs';

export const PROJECT_STAGE_ORDER=Object.freeze(['draft','planned','active','review','completed','hold','cancelled','archived']);
const stages={
 all:{icon:'filter',label:['All stages','Semua tahap'],tip:['Show projects at every stage.','Tampilkan proyek pada semua tahap.']},
 draft:{icon:'edit',tip:['Project details are still being defined.','Detail proyek masih sedang disusun.']},
 planned:{icon:'calendar',tip:['The project is planned, but work has not started.','Proyek sudah direncanakan, tetapi pekerjaan belum dimulai.']},
 active:{icon:'circle',tip:['Work on this project is underway.','Pekerjaan pada proyek ini sedang berjalan.']},
 review:{icon:'search',tip:['The project output is being checked before completion.','Hasil proyek sedang diperiksa sebelum dinyatakan selesai.']},
 hold:{icon:'hand',tip:['Work is paused. The project can be resumed.','Pekerjaan dijeda. Proyek dapat dilanjutkan kembali.']},
 completed:{icon:'check',tip:['The project is marked complete. Task progress is tracked separately.','Proyek ditandai selesai. Progres tugas dicatat secara terpisah.']},
 cancelled:{icon:'close',tip:['The project was stopped without being completed.','Proyek dihentikan sebelum selesai.']},
 archived:{icon:'archive',tip:['Kept for reference outside ongoing work.','Disimpan sebagai referensi di luar pekerjaan yang sedang berjalan.']}
};
export function stageLabel(stage,t){return t(...(stages[stage]?.label||STATUS_LABELS[stage]||[stage,stage]));}
export function stageTip(stage,t){return stages[stage]?t(...stages[stage].tip):'';}
export function stageTipAttributes(stage,t){return `data-stage-tip="${h(stageTip(stage,t))}" data-stage-tip-title="${h(stageLabel(stage,t))}"`;}
export function renderStage(stage,t,{badge=true}={}) {
 const key=Object.hasOwn(stages,stage)?stage:'draft';
 return `<span class="${badge?'one-status ':''}one-stage ${h(key)}" ${stageTipAttributes(stage,t)}><span class="one-stage-icon" aria-hidden="true">${icon(stages[key].icon)}</span><span class="one-stage-name">${h(stageLabel(stage,t))}</span></span>`;
}

/** Delayed, nonmodal help. No storage writes, focus moves or native title tooltips. */
export function mountStageTips({document:doc=globalThis.document,delay=500,schedule=globalThis.setTimeout,cancel=globalThis.clearTimeout}={}) {
 const win=doc.defaultView,tooltip=doc.createElement('div');
 tooltip.id='one-stage-tooltip';tooltip.className='one-stage-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;
 const heading=doc.createElement('strong'),text=doc.createElement('p');tooltip.append(heading,text);
 let anchor=null,timer=null,leaveTimer=null,retireTimer=null,destroyed=false,escapeDismissed=false;
 function clearTimers(){if(timer!==null)cancel(timer);if(leaveTimer!==null)cancel(leaveTimer);if(retireTimer!==null)cancel(retireTimer);timer=leaveTimer=retireTimer=null;}
 function finishHide(){tooltip.hidden=true;tooltip.remove();tooltip.dataset.state='closed';tooltip.setAttribute('role','tooltip');tooltip.removeAttribute('aria-hidden');}
 function reducedMotion(){const mode=doc.documentElement.dataset.motion;return mode==='reduced'||mode!=='full'&&win.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 function hide({immediate=false}={}){
  clearTimers();if(anchor){const ids=(anchor.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==tooltip.id);if(ids.length)anchor.setAttribute('aria-describedby',ids.join(' '));else anchor.removeAttribute('aria-describedby');}
  anchor=null;
  if(immediate||destroyed||tooltip.hidden||!tooltip.isConnected||reducedMotion())return finishHide();
  tooltip.dataset.state='closing';tooltip.removeAttribute('role');tooltip.setAttribute('aria-hidden','true');
  retireTimer=schedule(()=>{retireTimer=null;finishHide();},100);
 }
 function show(){
  timer=null;if(destroyed||!anchor?.isConnected||anchor.closest('[inert],.ux-leaving,[hidden]'))return hide();
  heading.textContent=anchor.dataset.stageTipTitle||'';text.textContent=anchor.dataset.stageTip;
  tooltip.dataset.state='open';tooltip.setAttribute('role','tooltip');tooltip.removeAttribute('aria-hidden');
  (anchor.closest('.ux-portal')||doc.body).append(tooltip);tooltip.hidden=false;
  const ids=new Set((anchor.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add(tooltip.id);anchor.setAttribute('aria-describedby',[...ids].join(' '));
  const box=anchor.getBoundingClientRect(),tip=tooltip.getBoundingClientRect(),margin=8,width=win.innerWidth,height=win.innerHeight;
  let left=box.right+margin,top=box.top+(box.height-tip.height)/2;
  if(left+tip.width>width-margin){left=box.left-tip.width-margin;if(left<margin){left=box.left;top=box.bottom+margin;if(top+tip.height>height-margin)top=box.top-tip.height-margin;}}
  tooltip.style.left=`${Math.max(margin,Math.min(left,width-tip.width-margin))}px`;
  tooltip.style.top=`${Math.max(margin,Math.min(top,height-tip.height-margin))}px`;
 }
 function enter(target){
  const next=target?.closest?.('button[data-stage-tip]')||target?.closest?.('[data-stage-tip]');if(!next?.dataset.stageTip||next.closest('[disabled],[inert]'))return;
  if(next===anchor){if(leaveTimer!==null)cancel(leaveTimer);leaveTimer=null;return;}
  hide();anchor=next;timer=schedule(show,delay);
 }
 const over=event=>{if(escapeDismissed)return;if(tooltip.contains(event.target)){if(leaveTimer!==null)cancel(leaveTimer);leaveTimer=null;}else enter(event.target);};
 const move=event=>{if(escapeDismissed&&(event.movementX||event.movementY)){escapeDismissed=false;enter(event.target);}};
 function out(event){
  if(!anchor)return;const from=event.target?.closest?.('button[data-stage-tip]')||event.target?.closest?.('[data-stage-tip]');
  if((from===anchor||tooltip.contains(event.target))&&!anchor.contains(event.relatedTarget)&&!tooltip.contains(event.relatedTarget)){
   if(tooltip.hidden)hide();else {if(leaveTimer!==null)cancel(leaveTimer);leaveTimer=schedule(hide,120);}
  }
 }
 const focus=event=>{if(!escapeDismissed)enter(event.target);};
 const blur=event=>{if(anchor?.contains(event.target)&&!anchor.contains(event.relatedTarget)&&!tooltip.contains(event.relatedTarget))hide();};
 const key=event=>{escapeDismissed=event.key==='Escape';if(escapeDismissed)hide();};
 const pointerDown=()=>{escapeDismissed=false;hide();};
 const observer=new win.MutationObserver(()=>{if(anchor&&(!anchor.isConnected||anchor.closest('.ux-leaving,[inert],[hidden]')))hide({immediate:true});});
 observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','inert','hidden']});
 doc.addEventListener('pointerover',over);doc.addEventListener('pointermove',move);doc.addEventListener('pointerout',out);doc.addEventListener('focusin',focus);doc.addEventListener('focusout',blur);
 doc.addEventListener('keydown',key,true);doc.addEventListener('pointerdown',pointerDown,true);doc.addEventListener('scroll',hide,true);doc.addEventListener('visibilitychange',hide);win.addEventListener('resize',hide);
 return {hide,destroy(){destroyed=true;hide();observer.disconnect();doc.removeEventListener('pointerover',over);doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerout',out);doc.removeEventListener('focusin',focus);doc.removeEventListener('focusout',blur);doc.removeEventListener('keydown',key,true);doc.removeEventListener('pointerdown',pointerDown,true);doc.removeEventListener('scroll',hide,true);doc.removeEventListener('visibilitychange',hide);win.removeEventListener('resize',hide);}};
}
