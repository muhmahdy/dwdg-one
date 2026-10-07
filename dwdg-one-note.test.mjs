import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {renderNote,parseNoteReferences,noteReferenceIds,referenceIDs,formatSelection} from './dwdg-one-note.mjs';

const markdown={contentFormat:'markdown'};
function documentFor(suite,text,options={}) {
  const window=new Window();suite.after(()=>window.happyDOM.close());
  window.document.body.innerHTML=renderNote(text,options);return window.document;
}
const expectCode=(callback,code)=>assert.throws(callback,error=>error.code===code);

test('legacy plain notes remain literal and readable without automatically enabling formatting or links',suite=>{
  const content='# Literal heading\n**Written markers** and [old link](https://example.com)\n<img src=x onerror=alert(1)>';
  const document=documentFor(suite,content);
  assert.equal(document.querySelectorAll('h1,strong,a,img,script').length,0);
  assert.ok(document.body.textContent.includes('# Literal heading'));
  assert.ok(document.body.textContent.includes('**Written markers**'));
  assert.ok(document.body.textContent.includes('<img src=x onerror=alert(1)>'));
  assert.equal(document.querySelectorAll('br').length,2);
  assert.deepEqual(noteReferenceIds('[brief](resource:r1)',{contentFormat:'plain'}),[]);
});

test('plain blank-line paragraphs stay distinct while single line breaks and Markdown-looking text remain literal',suite=>{
  const document=documentFor(suite,'First line\nSecond line\n\n## Literal heading\n**Literal marks**\n\nLast paragraph');
  assert.equal(document.querySelectorAll('p').length,3);assert.equal(document.querySelectorAll('br').length,2);
  assert.equal(document.querySelectorAll('h2,strong').length,0);
  assert.deepEqual([...document.querySelectorAll('p')].map(paragraph=>paragraph.textContent),['First lineSecond line','## Literal heading**Literal marks**','Last paragraph']);
});

test('explicit lightweight Markdown renders semantic headings, emphasis and both list kinds',suite=>{
  const document=documentFor(suite,'# Brief\n\n**Strong**, *emphasis*, __also strong__ and _also emphasis_.\nA second line.\n\n- First\n- Second\n\n1. Start\n2. Finish',markdown);
  assert.equal(document.querySelector('h1').textContent,'Brief');
  assert.deepEqual([...document.querySelectorAll('strong')].map(node=>node.textContent),['Strong','also strong']);
  assert.deepEqual([...document.querySelectorAll('em')].map(node=>node.textContent),['emphasis','also emphasis']);
  assert.deepEqual([...document.querySelectorAll('ul li')].map(node=>node.textContent),['First','Second']);
  assert.deepEqual([...document.querySelectorAll('ol li')].map(node=>node.textContent),['Start','Finish']);
  assert.equal(document.querySelectorAll('p br').length,1);
});

test('raw HTML, injected labels and executable or credential links create no executable elements',suite=>{
  const attacks=['javascript:alert(1)','data:text/html,<script>alert(1)</script>','file:///C:/private','http://example.com',
    'https://user:secret@example.com/path','https://user%40host:secret@example.com','https://example.com/evil\u0000path'];
  const source='<script>window.leaked=true</script>\n<img src=x onerror=alert(1)>\n'+attacks.map(url=>`[<svg onload=alert(1)>](${url})`).join('\n');
  const document=documentFor(suite,source,markdown);
  assert.equal(document.querySelectorAll('script,img,svg,a,[onload],[onerror]').length,0);
  assert.ok(document.body.textContent.includes('<script>window.leaked=true</script>'));
  assert.equal(document.defaultView.leaked,undefined);
});

test('safe HTTPS links retain meaningful URLs, parentheses and Unicode text with isolated external opening',suite=>{
  const document=documentFor(suite,'[Riset 😀](https://example.com/doc_(final)?q=one&lang=id)',markdown),link=document.querySelector('a');
  assert.equal(link.textContent,'Riset 😀');assert.equal(link.href,'https://example.com/doc_(final)?q=one&lang=id');
  assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
});

test('references display only canonical active permitted titles and suppress missing, archived, foreign and self identities',suite=>{
  const resources=[{id:'current',title:'Current note',workspaceId:'consulting',projectId:'p1'},
    {id:'brief',title:'Canonical brief <safe>',workspaceId:'consulting',projectId:'p2'},
    {id:'archived',title:'Private old title',workspaceId:'consulting',archived:true},
    {id:'foreign-secret-id',title:'Private foreign title',workspaceId:'hr'}];
  const source='[Misleading title](resource:brief) [PRIVATE LABEL](resource:archived) [FOREIGN LABEL](resource:foreign-secret-id) [DELETED TITLE](resource:missing-secret-id) [SELF LABEL](resource:current)';
  const document=documentFor(suite,source,{...markdown,resources,workspaceId:'consulting',sourceId:'current',t:(en,id)=>id});
  const buttons=document.querySelectorAll('button');assert.equal(buttons.length,1);
  assert.equal(buttons[0].textContent,'Canonical brief <safe>');assert.equal(buttons[0].dataset.action,'res-note-open-ref');assert.equal(buttons[0].dataset.id,'brief');
  assert.equal(buttons[0].type,'button');assert.equal(buttons[0].getAttribute('aria-label'),'Buka sumber daya: Canonical brief <safe>');
  assert.equal(document.querySelectorAll('.unavailable').length,4);
  for(const secret of ['Misleading title','PRIVATE LABEL','FOREIGN LABEL','DELETED TITLE','SELF LABEL','Private old title','Private foreign title','foreign-secret-id','missing-secret-id','resource:current'])assert.ok(!document.body.innerHTML.includes(secret),secret);
  assert.ok(document.body.textContent.includes('Sumber daya tidak tersedia'));assert.equal(document.querySelectorAll('safe').length,0);
});

test('reference parsing supplies exact source positions, unique IDs and ignores escaped or code-only examples',()=>{
  const source='😀 [first](resource:r1) [again](resource:r1)\n`[code](resource:r2)`\n```\n[fenced](resource:r3)\n```\n\\[escaped](resource:r4) [other](resource:r5) [web](https://example.com) [invalid](resource:bad id)';
  const references=parseNoteReferences(source);assert.deepEqual(references.map(reference=>reference.id),['r1','r1','r5']);
  for(const reference of references)assert.ok(source.slice(reference.start,reference.end).includes(`resource:${reference.id}`));
  assert.equal(references[0].start,3);assert.equal(references[0].label,'first');
  assert.deepEqual(noteReferenceIds(source),['r1','r5']);assert.deepEqual(referenceIDs(source),['r1','r5']);
  assert.deepEqual(noteReferenceIds(source,{format:'plain'}),[]);
  assert.deepEqual(noteReferenceIds(source,{contentFormat:'plain',format:'markdown'}),[]);
});

test('inline and fenced code remain inert readable examples in explicit Markdown',suite=>{
  const source='`<img onerror=alert(1)> [example](resource:r1)`\n\n```\n<script>alert(1)</script>\n[example](https://example.com)\n```';
  const document=documentFor(suite,source,markdown);
  assert.equal(document.querySelectorAll('a,button,img,script').length,0);assert.equal(document.querySelectorAll('code').length,2);
  assert.ok(document.querySelector('pre').textContent.includes('<script>alert(1)</script>'));
});

test('bold and italic selection preserves UTF-16 text, supports nested formatting and toggles without data loss',suite=>{
  const original='A😀中文B',bold=formatSelection(original,1,5,'bold');
  assert.equal(bold.text,'A**😀中文**B');assert.equal(bold.text.slice(bold.start,bold.end),'😀中文');
  assert.equal(bold.selectionStart,bold.start);assert.equal(bold.selectionEnd,bold.end);
  assert.equal(formatSelection(bold.text,bold.start,bold.end,'bold').text,original);
  const nested=formatSelection(bold.text,bold.start,bold.end,'italic');
  assert.equal(nested.text,'A***😀中文***B');const document=documentFor(suite,nested.text,markdown);
  assert.equal(document.querySelector('strong em').textContent,'😀中文');
  assert.equal(formatSelection(nested.text,nested.start,nested.end,'italic').text,bold.text);
  const split=formatSelection('A😀B',2,2,'bold');assert.equal(split.text,'A**😀**B');
  const empty=formatSelection('',0,0,'italic');assert.equal(empty.text,'**');assert.equal(empty.start,1);assert.equal(empty.end,1);
});

test('heading formatting changes selected complete lines and keeps surrounding paragraphs intact',()=>{
  const original='Before\nAlpha\nBeta\nAfter',start=original.indexOf('Alpha')+1,end=original.indexOf('Beta')+2;
  const heading=formatSelection(original,start,end,'heading',{level:2});assert.equal(heading.text,'Before\n## Alpha\n## Beta\nAfter');
  assert.equal(formatSelection(heading.text,heading.start,heading.end,'heading',{level:2}).text,original);
  const firstEmpty=formatSelection('\nAfter',0,0,'heading',{level:1});assert.equal(firstEmpty.text,'# \nAfter');
  expectCode(()=>formatSelection('Text',0,4,'heading',{level:7}),'action');
});

test('ordered and unordered actions act on selected lines without including the following line at a selection boundary',()=>{
  const original='One\nTwo\nKeep',end=original.indexOf('Keep');
  const ordered=formatSelection(original,0,end,'ordered');assert.equal(ordered.text,'1. One\n2. Two\nKeep');
  assert.equal(formatSelection(ordered.text,ordered.start,ordered.end,'ordered').text,original);
  const unordered=formatSelection(ordered.text,ordered.start,ordered.end,'unordered');assert.equal(unordered.text,'- One\n- Two\nKeep');
  assert.equal(formatSelection(unordered.text,unordered.start,unordered.end,'unordered').text,original);
});

test('link and reference insertion preserves readable labels, returns an editable selection and rejects unsafe destinations',suite=>{
  const inserted=formatSelection('Read this',5,9,'link',{url:'https://example.com/a_(b)',label:'Riset [2026] 😀'});
  assert.equal(inserted.text.slice(inserted.start,inserted.end),'Riset \\[2026\\] 😀');
  const document=documentFor(suite,inserted.text,markdown);assert.equal(document.querySelector('a').textContent,'Riset [2026] 😀');
  const reference=formatSelection('See ',4,4,'reference',{id:'resource-1',label:'Existing brief'});
  assert.deepEqual(noteReferenceIds(reference.text),['resource-1']);
  for(const url of ['javascript:alert(1)','data:text/html,attack','https://user:secret@example.com'])expectCode(()=>formatSelection('Text',0,4,'link',{url}),'url');
  expectCode(()=>formatSelection('Text',0,4,'reference',{id:'bad id'}),'reference');
  expectCode(()=>formatSelection('Text',0,4,'unknown'),'action');
});

test('long multilingual plain notes retain their content and explicit format precedence is predictable',suite=>{
  const content=Array.from({length:1000},(_,index)=>`kata${index}😀`).join(' ')+'\n**literal**';
  const document=documentFor(suite,content,{contentFormat:'plain',format:'markdown'});
  assert.equal(document.querySelectorAll('strong').length,0);assert.ok(document.body.textContent.includes('kata999😀'));
  assert.ok(document.body.textContent.includes('**literal**'));assert.equal(document.body.textContent.split(' ').length,1000);
  assert.equal(content.endsWith('**literal**'),true);
});
