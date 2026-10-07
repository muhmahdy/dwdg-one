// Lightweight notes only. Text is escaped; allowed links and resource actions are created explicitly.
const html = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const validReference = value => typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,255}$/.test(value);
const unescapeLabel = value => value.replace(/\\([\\\[\]()*_])/g,'$1');
function error(code) {const result=new Error(code);result.code=code;return result;}
function safeLink(value) {
  if(typeof value!=='string')return null;
  const text=value.trim();if(!text||/[\u0000-\u0020\u007f]/.test(text))return null;
  try {const url=new URL(text);return url.protocol==='https:'&&url.hostname&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
function escapedAt(text,index) {let count=0;while(index>0&&text[--index]==='\\')count++;return count%2===1;}
function closing(text,marker,start) {
  let index=text.indexOf(marker,start);
  while(index!==-1) {
    if(!escapedAt(text,index)) {
      if(marker.length===2)while(text[index+marker.length]===marker[0])index++;
      return index;
    }
    index=text.indexOf(marker,index+marker.length);
  }
  return -1;
}
function readLink(text,start) {
  if(text[start]!=='['||escapedAt(text,start))return null;
  let index=start+1,brackets=1;
  for(;index<text.length;index++) {
    if(text[index]==='\\'){index++;continue;}
    if(text[index]==='\n'||text[index]==='\r')return null;
    if(text[index]==='[')brackets++;
    if(text[index]===']'&&!--brackets)break;
  }
  if(brackets||text[index+1]!=='(')return null;
  const label=unescapeLabel(text.slice(start+1,index)),destinationStart=index+2;
  let parentheses=1;index=destinationStart;
  for(;index<text.length;index++) {
    if(text[index]==='\\'){index++;continue;}
    if(text[index]==='\n'||text[index]==='\r')return null;
    if(text[index]==='(')parentheses++;
    if(text[index]===')'&&!--parentheses)break;
  }
  if(parentheses)return null;
  return {label,destination:text.slice(destinationStart,index).replace(/\\([\\()])/g,'$1').trim(),start,end:index+1};
}

export function parseNoteReferences(content) {
  const text=String(content??''),references=[];let fenced=false;
  for(let index=0;index<text.length;index++) {
    if(index===0||text[index-1]==='\n') {
      const end=text.indexOf('\n',index),line=text.slice(index,end===-1?text.length:end);
      if(/^\s*```/.test(line)){fenced=!fenced;index=end===-1?text.length:end;continue;}
    }
    if(fenced)continue;
    if(text[index]==='`'&&!escapedAt(text,index)){const end=closing(text,'`',index+1);if(end!==-1){index=end;continue;}}
    const link=readLink(text,index);if(!link)continue;
    if(link.destination.startsWith('resource:')) {
      const id=link.destination.slice(9);if(validReference(id))references.push({id,label:link.label,start:link.start,end:link.end});
    }
    index=link.end-1;
  }
  return references;
}

export function noteReferenceIds(content,{contentFormat,format}={}) {
  if((contentFormat??format??'markdown')!=='markdown')return [];
  return [...new Set(parseNoteReferences(content).map(reference=>reference.id))];
}
export {noteReferenceIds as referenceIDs};

export function renderNote(content,options={}) {
  const text=String(content??'').replace(/\r\n?/g,'\n'),format=options.contentFormat??options.format??'plain';
  const t=options.t||((english)=>english),unavailable=t('Unavailable resource','Sumber daya tidak tersedia');
  if(format!=='markdown')return text?text.split(/\n[ \t]*\n(?:[ \t]*\n)*/).map(paragraph=>`<p>${html(paragraph).replace(/\n/g,'<br>')}</p>`).join(''):'';
  // Only the caller's available canonical records supply reference identities.
  // Keep unavailable references neutral even for legacy callers; saved labels
  // can contain private titles and must never become a read-only fallback.
  const resources=new Map((options.resources||[]).filter(resource=>resource.workspaceId===options.workspaceId&&!resource.archived&&!resource.deleted&&!resource.deletedAt&&resource.id!==options.sourceId).map(resource=>[resource.id,resource]));
  const action=options.referenceAction||'res-note-open-ref';
  function inline(value,depth=0) {
    if(depth>12)return html(value);
    let result='';
    for(let index=0;index<value.length;) {
      const character=value[index];
      if(character==='\\'&&index+1<value.length&&/[\\`*_\[\]()#]/.test(value[index+1])){result+=html(value[index+1]);index+=2;continue;}
      if(character==='`') {const end=closing(value,'`',index+1);if(end!==-1){result+=`<code>${html(value.slice(index+1,end))}</code>`;index=end+1;continue;}}
      const link=readLink(value,index);
      if(link) {
        if(link.destination.startsWith('resource:')) {
          const id=link.destination.slice(9),resource=validReference(id)?resources.get(id):null;
          result+=resource?`<button type="button" class="one-note-reference" data-action="${html(action)}" data-id="${html(id)}" aria-label="${html(t('Open resource','Buka sumber daya')+': '+resource.title)}">${html(resource.title)}</button>`:`<span class="one-note-reference unavailable">${html(unavailable)}</span>`;
        }else {
          const url=safeLink(link.destination);
          result+=url?`<a class="one-note-link" href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(link.label||url)}</a>`:`<span class="one-note-link-unavailable">${html(link.label)}</span>`;
        }
        index=link.end;continue;
      }
      const strong=value.startsWith('**',index)?'**':value.startsWith('__',index)?'__':'';
      const emphasis=strong||((character==='*'||character==='_')?character:'');
      const intraword=character==='_'&&/[\p{L}\p{N}]/u.test(value[index-1]||'')&&/[\p{L}\p{N}]/u.test(value[index+1]||'');
      if(emphasis&&!intraword) {
        const end=closing(value,emphasis,index+emphasis.length),body=end===-1?'':value.slice(index+emphasis.length,end);
        if(body&&body.trim()===body){const tag=strong?'strong':'em';result+=`<${tag}>${inline(body,depth+1)}</${tag}>`;index=end+emphasis.length;continue;}
      }
      result+=character==='\n'?'<br>':html(character);index++;
    }
    return result;
  }
  const lines=text.split('\n'),blocks=[];let paragraph=[],list=[],listType='',fence=null;
  const flushParagraph=()=>{if(paragraph.length){blocks.push(`<p>${inline(paragraph.join('\n'))}</p>`);paragraph=[];}};
  const flushList=()=>{if(list.length){blocks.push(`<${listType}>${list.map(value=>`<li>${inline(value)}</li>`).join('')}</${listType}>`);list=[];listType='';}};
  for(const line of lines) {
    if(/^\s*```/.test(line)){flushParagraph();flushList();if(fence===null)fence=[];else{blocks.push(`<pre><code>${html(fence.join('\n'))}</code></pre>`);fence=null;}continue;}
    if(fence!==null){fence.push(line);continue;}
    if(!line.trim()){flushParagraph();flushList();continue;}
    const heading=line.match(/^ {0,3}(#{1,6})\s+(.+)$/);
    if(heading){flushParagraph();flushList();blocks.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);continue;}
    const unordered=line.match(/^\s*[-+*]\s+(.+)$/),ordered=line.match(/^\s*\d+[.)]\s+(.+)$/);
    if(unordered||ordered){flushParagraph();const type=unordered?'ul':'ol';if(listType&&listType!==type)flushList();listType=type;list.push((unordered||ordered)[1]);continue;}
    flushList();paragraph.push(line);
  }
  flushParagraph();flushList();if(fence!==null)blocks.push(`<pre><code>${html(fence.join('\n'))}</code></pre>`);
  return blocks.join('');
}

function rangeFor(text,start,end) {
  let first=Math.max(0,Math.min(text.length,Number.isFinite(start)?Math.trunc(start):0));
  let last=Math.max(0,Math.min(text.length,Number.isFinite(end)?Math.trunc(end):first));
  if(first>last)[first,last]=[last,first];
  const splitsSurrogate=index=>index>0&&index<text.length&&/[\uD800-\uDBFF]/.test(text[index-1])&&/[\uDC00-\uDFFF]/.test(text[index]);
  if(splitsSurrogate(first))first--;if(splitsSurrogate(last))last++;
  return [first,last];
}
const markdownLabel=value=>String(value).replace(/\\/g,'\\\\').replace(/\[/g,'\\[').replace(/\]/g,'\\]');
function selectionResult(text,start,end) {return {text,start,end,selectionStart:start,selectionEnd:end};}

export function formatSelection(content,start,end,action,param={}) {
  const text=String(content??''),[first,last]=rangeFor(text,start,end),selected=text.slice(first,last);
  const configuration=param&&typeof param==='object'?param:{};
  if(action==='bold'||action==='italic') {
    const marker=action==='bold'?'**':'*';
    let before=0,after=0;while(text[first-before-1]==='*')before++;while(text[last+after]==='*')after++;
    const existing=action==='bold'?before>=2&&after>=2:before%2===1&&after%2===1;
    if(existing) {
      return selectionResult(text.slice(0,first-marker.length)+selected+text.slice(last+marker.length),first-marker.length,last-marker.length);
    }
    const replacement=marker+selected+marker;
    return selectionResult(text.slice(0,first)+replacement+text.slice(last),first+marker.length,first+marker.length+selected.length);
  }
  if(action==='link'||action==='reference') {
    const value=typeof param==='string'?param:action==='link'?configuration.url:configuration.id;
    const destination=action==='link'?safeLink(value):validReference(value)?`resource:${value}`:null;
    if(!destination)throw error(action==='link'?'url':'reference');
    const label=markdownLabel(configuration.label!==undefined?configuration.label:selected||value),replacement=`[${label}](${destination})`;
    return selectionResult(text.slice(0,first)+replacement+text.slice(last),first+1,first+1+label.length);
  }
  if(['heading','unordered','ordered'].includes(action)) {
    const blockStart=first===0?0:text.lastIndexOf('\n',first-1)+1;
    const endAnchor=last>first&&text[last-1]==='\n'?last-1:last;
    const following=text.indexOf('\n',endAnchor),blockEnd=following===-1?text.length:following;
    const lines=text.slice(blockStart,blockEnd).split('\n');let replacement;
    if(action==='heading') {
      const level=typeof param==='number'?param:configuration.level??2;if(!Number.isInteger(level)||level<1||level>6)throw error('action');
      const prefix='#'.repeat(level)+' ',remove=lines.every(line=>line.startsWith(prefix));
      replacement=lines.map(line=>remove?line.slice(prefix.length):prefix+line.replace(/^#{1,6}\s+/, '')).join('\n');
    }else {
      const own=action==='unordered'?/^\s*[-+*]\s+/:/^\s*\d+[.)]\s+/;
      const remove=lines.every(line=>own.test(line));
      replacement=lines.map((line,index)=>remove?line.replace(own,''):(action==='unordered'?'- ':`${index+1}. `)+line.replace(/^\s*(?:[-+*]|\d+[.)])\s+/, '')).join('\n');
    }
    return selectionResult(text.slice(0,blockStart)+replacement+text.slice(blockEnd),blockStart,blockStart+replacement.length);
  }
  throw error('action');
}
