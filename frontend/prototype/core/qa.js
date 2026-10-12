/* Opt-in prototype QA (?qa). On-page controls run against fresh demo data, suppress writes,
   then restore the original runtime and DOM in finally. Run 375/800px for the matrix and
   320/1280/1440px with longText:true for boundaries. Geometry checks supplement visual review. */
'use strict';
(() => {
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  const replace = (target, values) => { for (const key of Object.keys(target)) delete target[key]; Object.assign(target, values); };
  const baseline = () => ({insp:null,menu:null,palette:false,composer:null,draft:null,weekOffset:0,stage:'all',q:'',folder:null,showDone:false,view:{},range:'2w',updFilter:'all',form:null,
    calView:null,calDate:null,layers:{meetings:true,away:true,google:true,due:true},ua:null});
  const attrs = el => [...el.attributes].map(a => [a.name,a.value]);
  const restoreAttrs = (el, list) => { for (const a of [...el.attributes]) el.removeAttribute(a.name); for (const [k,v] of list) el.setAttribute(k,v); };
  const skip = '.sr,.r9-tt,.gantt,.ptl-scroll,.wbs-scroll,.wtree-wrap,.op-rhythm,.ob,.f-pgrow,.f-chips,.seg,.tabs,.pf-cyl,.f-kinds,.cs-tabbar,.tabbar,.f-dock,.row .t,.hr-scroll,.omx,.tl,.wstrip,.ptl2';
  const visible = el => { const r=el.getBoundingClientRect(),cs=getComputedStyle(el); return r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden' && !el.closest('[hidden]'); };
  const issueKey = (kind,ctx,text) => [kind,innerWidth,innerHeight,ctx.lk,ctx.lg,ctx.a,ctx.theme,ctx.ws,ctx.r,ctx.context,text].join('|');
  // Uses the actual action registry and transaction/history code. The surrounding sweep owns isolation;
  // this writer is only an in-memory persistence stand-in, including its explicit failure mode.
  async function interactionChecks() {
    const results=[],feedback=[],effects=[],hooks={save,showToast,complete:window.UIEffects?.complete,pin:window.UIEffects?.pin};
    let fail=false,writes=0,saved=JSON.stringify(db);
    const require=(condition,message)=>{if(!condition)throw new Error(message);};
    const check=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(error){results.push({name,pass:false,detail:error.message});}};
    save=()=>{writes++;if(fail)return false;saved=JSON.stringify(db);return true;};
    showToast=message=>{feedback.push(message);document.getElementById('toast').textContent=message;};
    if(window.UIEffects){window.UIEffects.complete=(...args)=>effects.push(['complete',...args]);window.UIEffects.pin=(...args)=>effects.push(['pin',...args]);}
    try {
      const template=db.tasks.find(t=>t.owner==='mahdy') || db.tasks[0];
      const task={...JSON.parse(JSON.stringify(template)),id:'qa-completion',title:'QA temporary completion',status:'todo',owner:'mahdy',createdBy:'mahdy',givenBy:null,signoffMode:'off',signer:null,reviewer:null,project:null,routine:null,parent:null,phase:false,deps:[],assignees:[],submissions:[],doneAt:null};
      db.tasks.push(task);db.pins=db.pins || {};db.pins.mahdy=[];ui.insp={type:'task',id:task.id};render();
      const draft=document.getElementById('f-title');if(draft)draft.value='Unsaved QA title';
      const before=JSON.stringify(db),button=document.createElement('button');button.dataset.s='done';button.dataset.id=task.id;
      saved=before;fail=true;
      check('Failed completion retains records, history, draft and honest feedback',()=>{
        require(ACT['set-status'](button,task.id)===false,'The failed completion did not report failure.');
        require(JSON.stringify(db)===before && UNDO.u.length===0 && effects.length===0,'A failed completion changed records, history or effects.');
        require(!draft || draft.value==='Unsaved QA title','The entered title draft was lost.');
        require(feedback.at(-1)===L('Could not save. Your changes are still here. Please try again.'),'The save failure was not reported.');
      });
      fail=false;const startWrites=writes;
      check('Rapid repeated completion commits once and survives saved-data parsing',()=>{
        for(let i=0;i<3;i++)ACT['set-status'](button,task.id);
        require(task.status==='done' && writes===startWrites+1 && UNDO.u.length===1,'Repeated completion duplicated writes or history.');
        require(JSON.parse(saved).tasks.find(t=>t.id===task.id).status==='done','Saved data did not contain the completion.');
        require(effects.filter(x=>x[0]==='complete').length===1,'Completion effect did not occur exactly once.');
      });
      let entry=UNDO.u.at(-1);fail=true;
      check('Failed Undo leaves completion and its history entry intact',()=>{require(shUndo()===false && task.status==='done' && UNDO.u.at(-1)===entry && UNDO.r.length===0,'Failed Undo changed state or removed history.');});
      fail=false;
      check('Successful Undo preserves record identity and saves the reversal',()=>{require(shUndo()===true && taskOf(task.id)===task && task.status==='todo' && JSON.parse(saved).tasks.find(t=>t.id===task.id).status==='todo','Undo did not persist the reversal on the original record.');});
      entry=UNDO.r.at(-1);fail=true;
      check('Failed Redo preserves the redo entry',()=>{require(shRedo()===false && task.status==='todo' && UNDO.r.at(-1)===entry,'Failed Redo changed state or removed history.');});
      fail=false;
      check('Successful Redo restores completion without replaying its effect',()=>{const n=effects.length;require(shRedo()===true && task.status==='done' && effects.length===n,'Redo failed or replayed an action effect.');});
      const project=db.projects.find(p=>p.div==='sng' && !['cancelled','archived'].includes(p.stage));
      fail=true;
      check('Failed pin leaves pins and history unchanged',()=>{const state=JSON.stringify(db),count=UNDO.u.length;require(togglePin('project',project.id)===false && JSON.stringify(db)===state && UNDO.u.length===count,'Failed pin leaked into data or history.');});
      fail=false;
      check('Pin, failed pin Undo, and successful pin Undo use the same history',()=>{
        require(togglePin('project',project.id)===true && db.pins.mahdy.some(p=>p.id===project.id),'Pin did not persist.');
        const held=UNDO.u.at(-1);fail=true;require(shUndo()===false && UNDO.u.at(-1)===held && db.pins.mahdy.some(p=>p.id===project.id),'Failed pin Undo changed history.');
        fail=false;require(shUndo()===true && !db.pins.mahdy.some(p=>p.id===project.id),'Pin Undo did not remove the pin.');
        require(shUndo()===true && taskOf(task.id)===task && task.status==='todo','An older completion Undo lost its record reference.');
      });
      const review={...JSON.parse(JSON.stringify(task)),id:'qa-review',title:'QA temporary hand-in',owner:'salsa',createdBy:'mahdy',signer:'mahdy',signoffMode:'on',status:'todo',submissions:[]};
      db.tasks.push(review);session.me='salsa';ui.insp={type:'task',id:review.id};ui.hi={id:review.id,links:['https://example.com/qa-work'],note:'Keep this note',rating:null,comment:''};render();
      fail=true;
      check('Failed hand-in retains links and note without sending a review notice',()=>{
        const state=JSON.stringify(db),draft=ui.hi;require(ACT['hand-in']({dataset:{}},review.id)===false && JSON.stringify(db)===state && ui.hi===draft && ui.hi.note==='Keep this note','Failed hand-in changed data or lost the draft.');
      });
      fail=false;
      check('Hand-in submits for review without a completion effect',()=>{const n=effects.filter(x=>x[0]==='complete').length;ACT['hand-in']({dataset:{}},review.id);require(review.status==='review' && review.submissions.length===1 && effects.filter(x=>x[0]==='complete').length===n,'Hand-in skipped review, duplicated submission, or celebrated completion.');});
      session.me='mahdy';ui.hi={id:review.id,links:[],note:'',rating:'excellent',comment:'Keep my assessment'};render();fail=true;
      check('Failed assessment preserves its comment and the original submission',()=>{
        const state=JSON.stringify(db),submission=review.submissions[0],draft=ui.hi;
        require(ACT['hi-accept']({},review.id)===false && JSON.stringify(db)===state && review.submissions[0]===submission && ui.hi===draft && ui.hi.comment==='Keep my assessment','Failed assessment changed records or discarded entered feedback.');
      });
      fail=false;
      check('Successful assessment saves the rating and completed status',()=>{ACT['hi-accept']({},review.id);const reloaded=JSON.parse(saved).tasks.find(t=>t.id===review.id);require(review.status==='done' && reloaded.rating==='excellent' && reloaded.submissions[0].review.result==='accepted','Accepted assessment was not stored completely.');});
      // Enable the real focus controller only for this synchronous fixture; the snapshot restores it afterwards.
      check('Escape closes a nested picker first, then returns focus from its dialog',()=>{
        if(!window.UIPolish)throw new Error('Focus controller is unavailable.');
        QA.running=false;window.UIPolish.reset();
        for(const id of ['app','layer','cfpop','pmfloat','pmfloat2']){const root=document.getElementById(id);if(root)root.inert=false;}
        try{
          ui.insp=null;ui.hi=null;render();const opener=document.querySelector('#app [data-act="palette"]');require(opener,'Search opener is unavailable.');
          opener.focus();opener.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}));ui.palette=true;renderLayer();
          const dialog=document.querySelector('#layer .palette'),input=document.createElement('input');input.type='date';input.id='qa-focus-date';input.className='input';input.value=today();dialog.append(input);cfUpgrade(dialog);
          const field=dialog.querySelector('button.cf');field.focus();cfOpen(field);document.querySelector('#cfpop button')?.focus();
          document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
          require(!CF.open && ui.palette && document.activeElement===field,'First Escape closed the parent or lost picker focus.');
          document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
          require(!ui.palette && document.activeElement===opener,'Dialog dismissal did not return focus to its opener.');
        }finally{QA.running=true;window.UIPolish.reset();}
      });
    }finally{
      save=hooks.save;showToast=hooks.showToast;if(window.UIEffects){window.UIEffects.complete=hooks.complete;window.UIEffects.pin=hooks.pin;}
    }
    return {results,writes,storage:'Isolated in-memory writer; saved JSON parsed to verify reload data. No browser storage writes.'};
  }
  const QA = window.QA = {
    running:false,cancelled:false,last:null,issueKey,
    routes() {
      const m=me(),w=ws(),routes=['work','schedule','updates','updates/activity','projects','programs','operations','resources','organisation','settings'];
      for (const [page] of capsFor(w,m)) routes.push(page);
      const project=db.projects.find(p=>p.div===w && !p.archived);
      if (project) for (const sub of ['','/wbs','/work','/resources']) routes.push(`projects/${project.id}${sub}`);
      const program=(db.programs || []).find(g=>typeof pgDivs==='function' && pgDivs(g).includes(w));
      if (program) routes.push(`programs/${program.id}`);
      const routine=(db.routines || []).find(r=>r.unit===w && !r.personal);
      if (routine) routes.push(`operations/${routine.id}`);
      if (routes.includes('performance')) routes.push(`performance/${m.id}`);
      return [...new Set(routes)].filter(r=>PAGES[r.split('/')[0]] && inShip(r.split('/')[0]) && (look()!=='simple' || SIMPLE_PAGES.includes(r.split('/')[0])));
    },
    cancel() { QA.cancelled=true; },
    async sweep(opt={}) {
      if (QA.running) throw new Error('A QA sweep is already running.');
      const roots=['app','layer','cfpop','pmfloat','pmfloat2','toast'].map(id=>{const el=document.getElementById(id);return {id,el,attrs:el?attrs(el):null};});
      const keep={db,session,save,saveSession,ui:{...ui},undo:{...UNDO},ph:{...PH},cf:typeof CF==='undefined'?null:{...CF},hash:location.hash,history:history.state,
        html:attrs(document.documentElement),body:attrs(document.body),focus:document.activeElement,scrollX,scrollY,toastUndo:document.getElementById('toast')?._undo,polish:window.UIPolish?.snapshot?.(),
        selection:typeof document.activeElement.selectionStart==='number'?[document.activeElement.selectionStart,document.activeElement.selectionEnd,document.activeElement.selectionDirection]:null,
        scrollers:[...document.querySelectorAll('#app *,#layer *,#cfpop *,#pmfloat *,#pmfloat2 *')].filter(el=>el.scrollTop || el.scrollLeft).map(el=>({el,top:el.scrollTop,left:el.scrollLeft}))};
      const out=[],seen=new Set(),coverage=[],data=new Set();let interactions=null;
      const add=(kind,ctx,value)=>{const txt=String(value),key=issueKey(kind,ctx,txt);if(!seen.has(key)){seen.add(key);out.push({key,k:kind,...ctx,txt:txt.slice(0,180)});}};
      const walk=value=>{if(typeof value==='string' && value.trim().length>3)data.add(value.trim());else if(value && typeof value==='object')Object.values(value).forEach(walk);};
      const lockKeys=event=>{if(!event.target.closest?.('#qa-panel')){if(event.key==='Escape')QA.cancel();event.preventDefault();event.stopImmediatePropagation();}};
      const stable=document.createElement('style');stable.textContent='#app *,#layer *,#cfpop *,#pmfloat *{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
      const inspect=ctx=>{
        coverage.push({...ctx});
        const all=['app','layer','cfpop','pmfloat','pmfloat2'].map(id=>document.getElementById(id)).filter(Boolean),sc=document.getElementById('scroller');
        if(document.documentElement.scrollWidth>innerWidth+1)add('page-scrolls-sideways',ctx,`${document.documentElement.scrollWidth} > ${innerWidth}`);
        if(sc && sc.scrollWidth>sc.clientWidth+1)add('page-scrolls-sideways',ctx,`content ${sc.scrollWidth} > ${sc.clientWidth}`);
        for(const root of all){
          const txt=root.innerText || root.textContent,bad=txt.match(/.{0,30}(\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b).{0,30}/);if(bad)add('undefined',ctx,bad[0]);
          for(const el of root.querySelectorAll('b,span,small,a,button,h1,h2,h3,p,label,em,strong,td,dd,dt')){
            if(!visible(el) || el.closest(skip))continue;
            const cs=getComputedStyle(el),text=el.textContent.trim(),r=el.getBoundingClientRect();
            const faded=cs.textOverflow==='ellipsis' || (cs.maskImage && cs.maskImage!=='none') || (cs.webkitMaskImage && cs.webkitMaskImage!=='none');
            if(text.length>2 && el.children.length<=2 && el.clientWidth && el.scrollWidth>el.clientWidth+2 && cs.overflowX!=='visible' && !faded)add('cut-off',ctx,`${el.tagName.toLowerCase()}.${el.className} "${text}"`);
            if(el.matches('button,a,h1,h2') && (r.right>innerWidth+1 || r.left< -1))add('off-screen',ctx,`${el.tagName.toLowerCase()}.${el.className} "${text.slice(0,65)}"`);
          }
          for(const el of root.querySelectorAll('.popmenu,.cf-pop,.palette,.comp,.qcard,.pm')){
            if(!visible(el))continue;const r=el.getBoundingClientRect();
            if(r.left< -1 || r.right>innerWidth+1 || r.top< -1 || r.bottom>innerHeight+1)add('overlay-off-screen',ctx,`${el.className}: ${[r.left,r.top,r.right,r.bottom].map(Math.round).join(',')}`);
          }
          if(ctx.lg==='id'){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
            while((node=walker.nextNode())){const t=node.textContent.trim();if(t.length<4 || data.has(t) || /Project Associates|Knowledge|TnD/.test(t) || node.parentElement.closest('.ql-editor,.brief,.doc,script,style'))continue;
              if(/\b(the|your|and|with|this|that|from|will|have|tasks?|projects?|nothing|open|add|show|waiting|done|due|people|work)\b/i.test(t) && ![...data].some(d=>d.length>6 && t.includes(d)))add('english-in-id',ctx,t);
            }
          }
        }
      };
      const show=async ctx=>{render();await tick();await tick();walk(db);inspect(ctx);opt.onProgress?.({checked:coverage.length,issues:out.length,...ctx});};
      const clearOverlay=()=>{if(typeof cfClose==='function')cfClose();ui.insp=null;ui.form=null;ui.menu=null;ui.palette=false;ui.composer=null;ui.draft=null;};
      QA.running=true;QA.cancelled=false;
      try{
        window.UIPolish?.reset?.();
        for(const root of roots)if(root.el){root.fragment=document.createDocumentFragment();root.fragment.append(...root.el.childNodes);root.el.inert=true;}
        document.head.append(stable);document.addEventListener('keydown',lockKeys,true);
        save=()=>true;saveSession=()=>true;db=window.seedData();session={me:'mahdy',ws:'sng',lang:'en',look:'comfortable',theme:'light',preview:false};
        replace(ui,baseline());replace(UNDO,{u:[],r:[]});replace(PH,{s:[],i:-1,jump:false,want:undefined});if(typeof CF!=='undefined')CF.open=null;
        for(const name of ['ensureHrData','ensureSngData','ensureFnlData','ensureMcitData'])window[name]?.();
        history.replaceState(keep.history,'','#/work');render();await tick();
        if(opt.longText){const suffix=' — Quarterly coordination and delivery follow-up with all assigned contributors';for(const t of db.tasks)t.title+=suffix;for(const p of db.projects)p.name+=suffix;}
        walk(db);
        if(opt.interactions){interactions=await interactionChecks();for(const result of interactions.results)if(!result.pass)add('interaction',{lk:session.look,lg:session.lang,a:session.me,theme:session.theme,ws:session.ws,r:'work',context:result.name},result.detail);}
        outer:for(const lk of opt.looks || ['comfortable','compact','simple'])for(const lg of opt.langs || ['en','id'])for(const theme of opt.themes || ['light','dark'])for(const a of opt.accts || ['mahdy','salsa','fadhil']){
          if(!db.people.some(p=>p.id===a && p.status==='active'))continue;
          session={me:a,look:lk,lang:lg,theme,ws:person(a).div || 'sng',preview:false};
          for(const workspace of opt.workspaces || visibleDivs(me())){
            if(!visibleDivs(me()).includes(workspace))continue;session.ws=workspace;
            const routes=opt.routes?[...opt.routes]:QA.routes();
            for(const r of routes){
              if(QA.cancelled)break outer;
              replace(ui,baseline());if(typeof cfClose==='function')cfClose();history.replaceState(keep.history,'','#/'+r);
              const ctx={lk,lg,theme,a,ws:workspace,r,context:'page'};
              try{await show(ctx);}catch(error){add('crash',ctx,error.message);continue;}
              // Account tabs enforce their own role visibility. Follow only destinations actually offered to this account.
              if(!opt.routes && r==='members'){
                const offered=[...document.querySelectorAll('.acct-tabs [data-h]')].map(el=>el.dataset.h);
                const member=document.querySelector('.acct a[href^="#/members/"]');if(member)offered.push(member.getAttribute('href').slice(2));
                for(const next of offered)if(!routes.includes(next))routes.push(next);
              }
              if(opt.overlays===false || !['work','projects','settings','schedule'].includes(r))continue;
              try{
                const buttons=[...document.querySelectorAll('#app [data-menu]')].filter(visible),menus=new Set();
                for(const button of buttons){if(QA.cancelled)break outer;const type=button.dataset.menu;if(menus.has(type) || !MENUS[type])continue;menus.add(type);
                  ui.menu={type,rect:button.getBoundingClientRect(),id:button.dataset.id,alignRight:true,up:!!button.dataset.up,width:type==='sbell'?360:272};
                  renderLayer();await tick();await tick();inspect({...ctx,context:`menu:${type}`});ui.menu=null;renderLayer();
                }
                if(r==='work'){
                  ui.palette=true;renderLayer();await tick();inspect({...ctx,context:'search'});ui.palette=false;
                  const task=db.tasks.find(t=>!t.trashed && t.owner===a && !isDone(t)) || db.tasks.find(t=>!t.trashed && visibleDivs(me()).includes(taskDiv(t)));
                  if(task){ui.insp={type:'task',id:task.id};await show({...ctx,context:'inspector'});if(typeof cfUpgrade==='function')cfUpgrade();
                    const fields=[...document.querySelectorAll('.insp-sheet button.cf')].filter(b=>!b.disabled && visible(b));
                    for(const button of fields.slice(0,2)){cfOpen(button);await tick();await tick();inspect({...ctx,context:`inspector-picker:${button.dataset.cfFor}`});cfClose();}
                  }
                }
                if(r==='schedule' && typeof newDraft==='function'){
                  ui.draft=newDraft(today(),9*60,10*60,{x:innerWidth-28,y:innerHeight-50});renderLayer();await tick();await tick();inspect({...ctx,context:'schedule-quick-card'});ui.draft=null;
                  ui.composer={text:'',title:'',date:today(),dur:30,manual:[],removed:[],people:[],start:9*60,where:'',touched:false,agenda:'',project:null,notetaker:null,more:true,ack:false};
                  renderLayer();await tick();await tick();inspect({...ctx,context:'meeting-composer'});
                  if(typeof PICK!=='undefined' && PICK.cp){ui.pm={key:'cp',group:'sng',idx:0,level:2,q:''};PICK.cp.refresh();await tick();await tick();inspect({...ctx,context:'composer-people-picker'});}
                }
                clearOverlay();
              }catch(error){add('crash',{...ctx,context:'overlays'},error.message);clearOverlay();}
            }
          }
        }
      }catch(error){add('sweep-error',{lk:session.look,lg:session.lang,a:session.me,theme:session.theme,ws:session.ws,r:location.hash,context:'setup'},error.message);}
      finally{
        try{
          if(typeof cfClose==='function')cfClose();window.UIPolish?.reset?.();db=keep.db;session=keep.session;replace(ui,keep.ui);replace(UNDO,keep.undo);replace(PH,keep.ph);
          history.replaceState(keep.history,'',keep.hash || location.pathname+location.search);
          for(const root of roots){if(root.el && root.fragment){root.el.replaceChildren(root.fragment);restoreAttrs(root.el,root.attrs);}else if(!root.el)document.getElementById(root.id)?.remove();}
          restoreAttrs(document.documentElement,keep.html);restoreAttrs(document.body,keep.body);if(typeof CF!=='undefined' && keep.cf)replace(CF,keep.cf);
          window.UIPolish?.resume?.(keep.polish);
          const toast=document.getElementById('toast');if(toast)toast._undo=keep.toastUndo;
          for(const item of keep.scrollers){item.el.scrollTop=item.top;item.el.scrollLeft=item.left;}
          keep.focus?.focus?.({preventScroll:true});if(keep.selection && keep.focus?.setSelectionRange)keep.focus.setSelectionRange(...keep.selection);window.scrollTo(keep.scrollX,keep.scrollY);
        }finally{stable.remove();document.removeEventListener('keydown',lockKeys,true);save=keep.save;saveSession=keep.saveSession;QA.running=false;}
      }
      const by={};out.forEach(x=>by[x.k]=(by[x.k] || 0)+1);
      return QA.last={width:innerWidth,height:innerHeight,count:out.length,checked:coverage.length+(interactions?.results.length || 0),cancelled:QA.cancelled,longText:!!opt.longText,by,coverage,details:out,interactions,
        issues:out.map(x=>`${x.k} | ${x.lk} ${x.lg} ${x.theme} ${x.a} ${x.ws} | ${x.r} | ${x.context} | ${x.txt}`)};
    },
    mount(){
      if(document.getElementById('qa-panel'))return;
      const panel=document.createElement('details');panel.id='qa-panel';panel.style.cssText='position:fixed;z-index:20000;bottom:8px;left:8px;max-width:calc(100vw - 16px);width:310px;background:Canvas;color:CanvasText;border:1px solid GrayText;border-radius:10px;padding:8px;font:12px/1.4 system-ui;box-shadow:0 3px 18px #0002';
      panel.innerHTML='<summary style="cursor:pointer;font-weight:600">Prototype QA</summary><form style="display:grid;gap:6px;margin-top:8px"><label>Look <select name="look"><option value="all">All three</option><option>comfortable</option><option>compact</option><option>simple</option></select></label><label>Language <select name="lang"><option value="all">English + Indonesian</option><option>en</option><option>id</option></select></label><label>Theme <select name="theme"><option value="all">Light + dark</option><option>light</option><option>dark</option></select></label><label>Account <select name="account"><option value="all">Admin, member + president</option><option>mahdy</option><option>salsa</option><option>fadhil</option></select></label><label><input name="long" type="checkbox"> Long demo titles</label><div><button type="submit">Run layout checks</button> <button type="button" name="interactions">Run interaction checks</button> <button type="button" name="cancel" disabled>Cancel</button></div></form><output style="display:block;margin-top:6px" aria-live="polite">Uses temporary demo data; restores your screen and drafts.</output><pre hidden style="white-space:pre-wrap;overflow:auto;max-height:35vh;font:10px/1.4 monospace"></pre>';
      document.body.append(panel);const form=panel.querySelector('form'),output=panel.querySelector('output'),pre=panel.querySelector('pre'),run=form.querySelector('[type=submit]'),cancel=form.elements.cancel,interactionButton=form.elements.interactions;
      cancel.onclick=()=>QA.cancel();
      const start=async interactionMode=>{const options={longText:!interactionMode && form.elements.long.checked};
        for(const [field,key] of [['look','looks'],['lang','langs'],['theme','themes'],['account','accts']])if(form.elements[field].value!=='all')options[key]=[form.elements[field].value];
        if(interactionMode){options.interactions=true;options.accts=[];}
        run.disabled=true;interactionButton.disabled=true;cancel.disabled=false;pre.hidden=true;output.textContent=interactionMode?'Checking saving, Undo and keyboard focus with temporary demo data…':'Starting layout checks…';
        options.onProgress=x=>{output.textContent=`Checking ${x.lk} / ${x.lg} / ${x.theme} / ${x.ws}: ${x.r} (${x.checked} views)`;};
        try{const result=await QA.sweep(options);output.textContent=`${result.cancelled?'Cancelled':'Finished'}: ${result.checked} ${interactionMode?'interaction checks':'views'}; ${result.count} findings at ${result.width} × ${result.height}. Original screen restored.`;pre.textContent=JSON.stringify(result,null,2);pre.hidden=false;}
        catch(error){output.textContent=`QA failed: ${error.message}`;}finally{run.disabled=false;interactionButton.disabled=false;cancel.disabled=true;}
      };
      form.addEventListener('submit',event=>{event.preventDefault();event.stopPropagation();start(false);});interactionButton.addEventListener('click',()=>start(true));
    },
  };
  QA.mount();
})();

