// The lens only filters the backdrop. Labels and hit targets stay in ordinary DOM.
const SVG = 'http://www.w3.org/2000/svg';
let sequence = 0;
export function mountMaterials(root = document) {
  const queries = ['(prefers-reduced-motion: reduce)', '(prefers-reduced-transparency: reduce)', '(prefers-contrast: more)'].map(q => matchMedia(q));
  const art = [...root.querySelectorAll('.project-artwork')];
  const visible = new Set();
  const syncArt = () => art.forEach(el => el.classList.toggle('in-view', visible.has(el) && !document.hidden && !queries[0].matches));
  const observer = new IntersectionObserver(entries => { entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)); syncArt(); });
  art.forEach(el => observer.observe(el));
  document.addEventListener('visibilitychange', syncArt);

  const surfaces = [...root.querySelectorAll('.page-tools, .mobile-nav')];
  const host = document.createElementNS(SVG, 'svg');
  host.setAttribute('class', 'material-filters'); host.setAttribute('aria-hidden', 'true');
  host.setAttribute('width', '0'); host.setAttribute('height', '0');
  const defs = document.createElementNS(SVG, 'defs'); host.append(defs); document.body.append(host);
  const chromium = /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/Firefox|OPR\//.test(navigator.userAgent);
  const instances = surfaces.map(surface => {
    surface.classList.add('glass-surface');
    const lens = document.createElement('span'); lens.className = 'glass-lens'; lens.setAttribute('aria-hidden', 'true'); surface.prepend(lens);
    const filter = document.createElementNS(SVG, 'filter');
    const id = `glass-edge-${++sequence}`;
    filter.id = id; filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x', '0'); filter.setAttribute('y', '0'); filter.setAttribute('width', '100%'); filter.setAttribute('height', '100%');
    const map = document.createElementNS(SVG, 'feImage'); map.setAttribute('result', 'map'); map.setAttribute('preserveAspectRatio', 'none');
    const displacement = document.createElementNS(SVG, 'feDisplacementMap');
    for (const [key, value] of Object.entries({in:'SourceGraphic', in2:'map', scale:'8', xChannelSelector:'R', yChannelSelector:'G'})) displacement.setAttribute(key,value);
    filter.append(map, displacement); defs.append(filter);
    let previousSize = '', timer;
    const update = () => {
      clearTimeout(timer);
      const bounds = surface.getBoundingClientRect();
      const enabled = chromium && !queries[1].matches && !queries[2].matches && bounds.width > 0 && bounds.height > 0;
      surface.classList.toggle('has-refraction', enabled);
      if (!enabled) return;
      const width = Math.round(bounds.width), height = Math.round(bounds.height);
      const radius = Math.min(parseFloat(getComputedStyle(surface).borderTopLeftRadius), height / 2, width / 2);
      const key = `${width}/${height}/${radius}`; if (key === previousSize) return; previousSize = key;
      // Signed distance to a rounded rectangle produces an eight-pixel curved rim.
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'), pixels = ctx.createImageData(width,height);
      for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
        const px=x-width/2+.5, py=y-height/2+.5;
        const qx=Math.abs(px)-(width/2-radius), qy=Math.abs(py)-(height/2-radius);
        const ox=Math.max(qx,0), oy=Math.max(qy,0), len=Math.hypot(ox,oy);
        const distance=-(len+Math.min(Math.max(qx,qy),0)-radius);
        const bend=distance>=0&&distance<8?Math.sin(distance/8*Math.PI):0;
        const nx=len?ox/len:(qx>qy?1:0), ny=len?oy/len:(qy>=qx?1:0);
        const i=(y*width+x)*4;
        pixels.data[i]=128+Math.sign(px)*nx*bend*110; pixels.data[i+1]=128+Math.sign(py)*ny*bend*110; pixels.data[i+2]=128; pixels.data[i+3]=255;
      }
      ctx.putImageData(pixels,0,0); map.setAttribute('href',canvas.toDataURL());
      lens.style.setProperty('--lens-filter', `url(#${id})`);
    };
    const resize = new ResizeObserver(() => { clearTimeout(timer); timer=setTimeout(update,120); });
    resize.observe(surface); update();
    return {update, dispose:()=>{clearTimeout(timer);resize.disconnect();lens.remove();surface.classList.remove('has-refraction','glass-surface');}};
  });
  const sync = () => {syncArt(); instances.forEach(i=>i.update());};
  queries.forEach(q=>q.addEventListener('change',sync));
  return () => {observer.disconnect();document.removeEventListener('visibilitychange',syncArt);queries.forEach(q=>q.removeEventListener('change',sync));instances.forEach(i=>i.dispose());host.remove();};
}
