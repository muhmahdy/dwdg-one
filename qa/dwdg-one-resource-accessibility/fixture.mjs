import {mountPreview} from '/dwdg-one-preview.mjs';
import {createPreviewStore,WORKSPACES,peopleInWorkspace} from '/dwdg-one-preview-data.mjs';
import {createResourceStore,RESOURCE_KEY} from '/dwdg-one-resources-data.mjs';
import {installTextOverrides} from './text-overrides.mjs';

// Disposable same-code layout fixture. No browser/product storage is accessed.
const memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
const projects=createPreviewStore(storage),resources=createResourceStore(storage,{getProjectState:()=>projects.state});
const kept=new Set();
for(const workspace of WORKSPACES){
 const project=projects.state.projects.find(row=>row.workspaceId===workspace.id),people=peopleInWorkspace(workspace.id).filter(row=>row.workspaceId===workspace.id);
 const folder=resources.saveResource(workspace.id,project.id,{kind:'folder',title:'Working files',parentId:'',ownerId:people[0].id,contributorIds:[people[1].id]});
 const second=resources.saveResource(workspace.id,project.id,{kind:'folder',title:'Review',parentId:'',ownerId:'',contributorIds:[]});
 const note=resources.saveResource(workspace.id,project.id,{kind:'note',title:'Review notes',parentId:second.id,ownerId:people[0].id,contributorIds:[people[1].id],content:'Illustrative note for the Resources layout review.',contentFormat:'plain'});
 const long=resources.saveResource(workspace.id,project.id,{kind:'note',title:'A complete project handoff with the review history, responsibilities and next changes',parentId:folder.id,ownerId:people[1].id,contributorIds:[],content:'Illustrative long title. No real project records are used.',contentFormat:'plain'});
 const file=resources.saveResource(workspace.id,project.id,{kind:'file',title:'Reference PDF',parentId:folder.id,ownerId:people[0].id,contributorIds:[people[1].id],url:'https://example.com/illustrative-reference.pdf',accessNote:'Illustrative link for layout verification.'});
 const app=resources.saveResource(workspace.id,project.id,{kind:'app',title:'Campaign sheet',parentId:'',ownerId:'',contributorIds:[],url:'https://example.com/illustrative-sheet',accessNote:'Illustrative link for layout verification.'});
 resources.saveResource(workspace.id,project.id,{...note,contentFormat:'markdown',content:`## Review record\n\nIllustrative review notes. These records are only used to check the interface.\n\n- Confirm the resource title and owner.\n- Review the related task.\n\nOpen [Reference PDF](resource:${file.id}) and return to these notes.\n\nThe same [Reference PDF](resource:${file.id}) is also linked here.\n\n[External reference with a long address](https://example.com/illustrative-reference-with-a-long-address-for-wrapping-checks).`},note.id);
 for(const record of [folder,second,note,long,file,app])kept.add(record.id);
 projects.createTask(workspace.id,{projectId:project.id,resourceId:note.id,title:'Illustrative review task',ownerId:people[0].id,status:'todo'});
}
const snapshot=JSON.parse(memory.get(RESOURCE_KEY));snapshot.resources=snapshot.resources.filter(row=>kept.has(row.id));snapshot.revisions=snapshot.revisions.filter(row=>kept.has(row.resourceId));snapshot.events=[];snapshot.undo={};snapshot.views={};snapshot.drafts={};memory.set(RESOURCE_KEY,JSON.stringify(snapshot));
projects.saveUI({preferences:projects.state.preferences,views:{consulting:{route:'resources',scroll:0}},drafts:{}});
document.body.append(document.getElementById('density-qa-shell').content.cloneNode(true));document.getElementById('density-qa-shell').remove();
const preview=mountPreview({storage});
const removeTextOverrides=installTextOverrides();
document.querySelector('.one-demo-badge').textContent='Demo data';
window.addEventListener('pagehide',()=>{removeTextOverrides();preview.destroy();},{once:true});
