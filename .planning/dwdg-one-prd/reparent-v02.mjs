import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const groups={
  'product-planning':['vision','scope','organization','access','divisions'],
  'experience-planning':['user-flows','onboarding','workflows','resources','analytics','design','integrations'],
  'backend-planning':['data','security','engineering','changes'],
  'operations-planning':['infrastructure','costs','environments','releases','reliability'],
  'delivery-planning':['quality','roadmap','launch'],
  'planning-control':['decisions','prd-management']
};
const parents=new Map(Object.entries(groups).flatMap(([parent,ids])=>ids.map(id=>[id,parent])));
let changed=0;
for(const file of fs.readdirSync(here).filter(f=>/^sections-.*\.json$/.test(f))){
  const nodes=JSON.parse(fs.readFileSync(path.join(here,file),'utf8'));
  let dirty=false;
  for(const node of nodes)if(parents.has(node.id)&&node.parent!==parents.get(node.id)){
    if(node.parent!=='root')throw new Error('Unexpected previous parent on '+node.id);
    node.parent=parents.get(node.id);dirty=true;changed++;
  }
  if(dirty)fs.writeFileSync(path.join(here,file),JSON.stringify(nodes,null,2)+'\n');
}
console.log(changed+' branches grouped; stable IDs and requirement content retained.');
