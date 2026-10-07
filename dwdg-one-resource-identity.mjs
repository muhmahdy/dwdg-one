import {escapeHtml as h,icon} from './experience-ui.mjs';
import {RESOURCE_KINDS} from './dwdg-one-resources-data.mjs';

/** Decorative identity only. Resource names, kinds and actions remain ordinary HTML. */
export function resourceIdentityMarkup(resource,{size='row'}={}) {
 const kind=resource?.kind||'file';
 const material=kind==='folder'||kind==='externalFolder'?'folder':kind==='file'?'file':'';
 const scale=['row','small','large'].includes(size)?size:'row';
 const classes=`one-res-identity${scale==='large'?' large':''}${material?' one-res-material':''}`;
 if(!material)return `<span class="${classes}" data-resource-kind="${h(kind)}" aria-hidden="true">${icon(RESOURCE_KINDS[kind]?.[2]||'file')}</span>`;
 return `<span class="${classes}" data-resource-kind="${h(kind)}" data-material-kind="${material}" data-material-size="${scale}" data-material="static" aria-hidden="true"><span class="one-material-static"><span class="one-material-backside"></span><span class="one-material-sheet"></span><span class="one-material-front"></span><span class="one-material-fold"></span><span class="one-material-rule"></span></span><canvas class="one-material-canvas" width="48" height="48" hidden aria-hidden="true"></canvas>${kind==='externalFolder'||kind==='file'?`<span class="one-material-external">${icon('external')}</span>`:''}</span>`;
}
