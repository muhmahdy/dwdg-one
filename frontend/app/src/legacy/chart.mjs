let chartSequence = 0;
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountCompletionChart(root, entries, note) {
  if (!root) return () => {};
  const id = `chart-activity-${++chartSequence}`;
  let selected = '', lastWidth = 0;
  const draw = () => {
    const width = Math.floor(root.clientWidth); if (!width || width === lastWidth) return; lastWidth = width;
    const height=150, left=28, top=12, bottom=120, right=width-18;
    const max=Math.max(2,Math.ceil(Math.max(...entries.map(e=>e.count))/2)*2);
    const step=(right-left)/Math.max(1,entries.length-1);
    const points=entries.map((e,i)=>({x:left+i*step,y:bottom-e.count/max*(bottom-top)}));
    const line=points.map((p,i)=>i===0?`M ${p.x} ${p.y}`:`L ${p.x} ${p.y}`).join(' ');
    const area=`${line} L ${right} ${bottom} L ${left} ${bottom} Z`;
    const labelCount=entries.length>7?Math.min(6,Math.max(2,Math.floor((right-left)/75)+1)):entries.length;
    const labels=new Set(Array.from({length:labelCount},(_,i)=>Math.round(i*(entries.length-1)/(labelCount-1))));
    root.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="Completed tasks by day"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c779" stop-opacity=".42"/><stop offset="1" stop-color="#dfeacc" stop-opacity=".08"/></linearGradient></defs>${[0,max/2,max].map(n=>{const y=bottom-n/max*(bottom-top);return `<line class="chart-grid" x1="${left}" x2="${right}" y1="${y}" y2="${y}"/><text class="chart-axis" x="${left-9}" y="${y+4}" text-anchor="end">${n}</text>`;}).join('')}<path class="chart-area" d="${area}" fill="url(#${id})"/><path class="chart-line" d="${line}"/>${entries.map((e,i)=>{const p=points[i],start=Math.max(left-8,p.x-step/2),end=Math.min(right+8,p.x+step/2);return `<g class="chart-day ${selected===e.date?'selected':''}" role="button" tabindex="0" data-chart-date="${e.date}" aria-label="${escape(e.label)}: ${e.count} ${e.count===1?'task':'tasks'} completed"><line class="chart-guide" x1="${p.x}" x2="${p.x}" y1="${top}" y2="${bottom}"/><circle class="chart-point ${entries.length>7&&e.count===0?'quiet':''}" cx="${p.x}" cy="${p.y}" r="${entries.length>7?2:3.5}"/><rect class="chart-hit" x="${start}" y="${top-5}" width="${end-start}" height="${bottom-top+10}" rx="3"/>${labels.has(i)?`<text class="chart-axis" x="${p.x}" y="144" text-anchor="${i===0?'start':i===entries.length-1?'end':'middle'}">${escape(e.axis)}</text>`:''}</g>`;}).join('')}</svg><div class="chart-tooltip" role="status" hidden></div>`;
  };
  const show = (target, persist=false) => {
    const group=target.closest('[data-chart-date]'); if(!group)return;
    const entry=entries.find(e=>e.date===group.dataset.chartDate); if(!entry)return;
    const tooltip=root.querySelector('.chart-tooltip'); tooltip.textContent=`${entry.label} · ${entry.count} completed`; tooltip.hidden=false;
    const bounds=group.getBoundingClientRect(), box=root.getBoundingClientRect();
    tooltip.style.left=`${Math.max(tooltip.offsetWidth/2,Math.min(box.width-tooltip.offsetWidth/2,bounds.x-box.x+bounds.width/2))}px`;
    if(persist){selected=entry.date;root.querySelectorAll('.chart-day').forEach(g=>g.classList.toggle('selected',g===group));note.classList.add('has-detail');note.textContent=`${entry.label} · ${entry.count} completed${entry.titles.length?': '+entry.titles.join(', '):'.'}`;}
  };
  const hover=e=>show(e.target), click=e=>show(e.target,true), key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(e.target,true);}};
  const hide=()=>{const tooltip=root.querySelector('.chart-tooltip');if(tooltip)tooltip.hidden=true;};
  root.addEventListener('pointerover',hover);root.addEventListener('pointerleave',hide);root.addEventListener('focusin',hover);root.addEventListener('focusout',hide);root.addEventListener('click',click);root.addEventListener('keydown',key);
  const resize=new ResizeObserver(draw);resize.observe(root);draw();
  return ()=>{resize.disconnect();root.removeEventListener('pointerover',hover);root.removeEventListener('pointerleave',hide);root.removeEventListener('focusin',hover);root.removeEventListener('focusout',hide);root.removeEventListener('click',click);root.removeEventListener('keydown',key);};
}
