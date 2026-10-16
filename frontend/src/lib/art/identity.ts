/* Visual identity art (design-resource-identity, design-shaders; owner reviews O3/O4, D59, D65), from screens/plan.js.
   Every project, program, operation and resource has a look {f: shader family, p: palette}, chosen once and saved.
   Rules from design-shaders: one shared offscreen WebGL context, still images by default, animation only while hovered and
   never in a background tab or under reduced motion, a CSS gradient when WebGL is missing. Text never sits on the art. */
import type { Look } from '@/types/workspace';

export const PALS: [name: string, c1: string, c2: string, c3: string][] = [
  ['Sage', '#86A38A', '#3E5E48', '#CFDDC9'],
  ['Coral', '#D08470', '#8A4235', '#F0CBBE'],
  ['Olive', '#A8B45A', '#5B6827', '#DCE1AE'],
  ['Violet', '#8F7FAD', '#4F426E', '#D3CAE3'],
  ['Ochre', '#C79C55', '#7A5A25', '#E8D3A8'],
  ['Emerald', '#479C78', '#1F5C45', '#AEDAC4'],
  ['Slate', '#7189AA', '#36496A', '#C6D2E3'],
  ['Terracotta', '#B96F52', '#6D3826', '#E5C2AE'],
  ['Teal', '#5F9799', '#2D5658', '#BBD6D5'],
  ['Plum', '#9C6283', '#5B2E49', '#DDBDCF'],
];
export const FAMILIES = [
  'Flow',
  'Caustic',
  'Contour',
  'Pixel',
  'Grain',
  'Orbit',
  'Waves',
  'Cells',
  'Haze',
  'ASCII',
  'Halftone',
  'Stripes',
  'Bloom',
  'Truchet',
  'Prism',
  'Weave',
  'Glitch',
  'Marble',
  'Aurora',
  'Lights',
];
/** Families 0 to 7 are shader modes 0 to 7; modes 8 to 10 belong to resources (folder, note, link), so families 8 and up are modes 11 and up. */
export const famMode = (f: number) => (f < 8 ? f : f + 3);
export const RES_MODE = { folder: 8, note: 9, link: 10 } as const;
export const pal = (p: number) => PALS[p] ?? PALS[0] ?? ['', '#999', '#999', '#999'];

/** A stable number in [0, 1) for a string (FNV-1a with an avalanche finish). */
export function hash(str: string): number {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** The least-used family and palette among siblings, ties broken by the record's own seed. */
export function pickLook(sibs: Look[], seed: number): Look {
  const fu = FAMILIES.map((_, i) => sibs.filter((x) => x.f === i).length);
  const pu = PALS.map((_, i) => sibs.filter((x) => x.p === i).length);
  const minF = Math.min(...fu);
  const minP = Math.min(...pu);
  const fs = fu.flatMap((n, i) => (n === minF ? [i] : []));
  const ps = pu.flatMap((n, i) => (n === minP ? [i] : []));
  return { f: fs[Math.floor(seed * fs.length)] ?? 0, p: ps[Math.floor(hash(String(seed)) * ps.length)] ?? 0 };
}

const FS = `precision mediump float;
uniform vec2 r; uniform float t, s; uniform vec3 c1, c2, c3; uniform int mode;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + s * 91.7) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int k = 0; k < 5; k++){ v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
void main(){
  float ar = r.x / r.y; vec2 uv = gl_FragCoord.xy / r, q = vec2(uv.x * ar, uv.y), p = q * (1.4 + s * .9) + s * 13.;
  vec3 col;
  if (mode == 0) { float f = fbm(p * .9 + vec2(0., t * .05)); float v = sin((p.x + f * 3.) * 3.2 + t * .4); col = mix(c1, c2, smoothstep(-.7, .7, v)); col = mix(col, c3, smoothstep(.8, 1., abs(v)) * .55); }
  else if (mode == 1) { vec2 z = p * 1.4; float c = 0.; for (int i = 0; i < 3; i++) { z += vec2(sin(z.y * 1.7 + t * .3), cos(z.x * 1.5 - t * .25)) * .45; c += .5 / (abs(sin(z.x) + cos(z.y)) * 3. + .6); } col = mix(c2, c1, clamp(c * .7, 0., 1.)); col = mix(col, c3, clamp(c * .45 - .3, 0., 1.)); }
  else if (mode == 2) { float e = fbm(p * 1.2 + t * .03); float l = abs(fract(e * 9.) - .5); col = mix(c1, c2, e); col = mix(c3, col, smoothstep(.03, .14, l)); }
  else if (mode == 3) { vec2 g = floor(q * 7.) / 7.; float f = fbm(g * 2.4 + s * 10. + t * .05); col = mix(c1, c2, step(.48, f) * .55 + f * .45); col = mix(col, c3, step(.66, f) * .7); }
  else if (mode == 4) { float d = fbm(p * 1.1 + t * .04); float gr = h(floor(gl_FragCoord.xy / 1.5)); col = mix(c2, c1, d); col = mix(col, c3, step(1.05 - d * .9, gr) * .75); }
  else if (mode == 5) { vec2 d = q - vec2(ar * (.2 + s * .3), .1 + s * .2); float rad = length(d); float ring = abs(sin(rad * 13. - t * .4)); col = mix(c2, c1, smoothstep(0., 1.1, rad)); col = mix(c3, col, smoothstep(0., .2, ring)); }
  else if (mode == 6) { vec2 A = vec2(.15 + s * .3, .25), B = vec2(ar * .9, .8 - s * .3); float v = (sin(length(q - A) * 26. - t * .8) + sin(length(q - B) * 21. - t * .6)) * .5; col = mix(c1, c2, v * .5 + .5); col = mix(col, c3, smoothstep(.65, 1., v) * .6); }
  else if (mode == 7) { vec2 g = p * 1.6, i0 = floor(g), f0 = fract(g); float md = 8.; for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 o = vec2(float(x), float(y)); vec2 pt = vec2(h(i0 + o), h(i0 + o + 7.)); pt = .5 + .4 * sin(t * .3 + 6.2831 * pt); md = min(md, length(o + pt - f0)); } col = mix(c1, c2, smoothstep(0., .8, md)); col = mix(c3, col, smoothstep(.02, .09, md)); }
  else if (mode == 8) { float b = sin((p.y + fbm(p * 1.4 + .08 * t) * 1.8) * 5.); col = mix(c2, c1, b * .5 + .5); col = mix(col, c3, smoothstep(.55, .95, fbm(p * 2.6 - .05 * t)) * .6); }
  else if (mode == 9) { float f = fbm(p * vec2(6., 1.1) + .03 * t); col = mix(vec3(.86, .87, .86), mix(vec3(.86), c2, .35), f); col -= .06 * smoothstep(.44, .5, fract(uv.y * 6.)) * smoothstep(.56, .5, fract(uv.y * 6.)); }
else if (mode == 11) { vec2 A = vec2(ar * (.15 + .7 * h(vec2(3., 1.))), .15 + .7 * h(vec2(3., 2.))) + .07 * vec2(sin(t * .3), cos(t * .25)), B = vec2(ar * (.15 + .7 * h(vec2(4., 3.))), .15 + .7 * h(vec2(4., 4.))) + .07 * vec2(cos(t * .27), sin(t * .33)), C = vec2(ar * (.15 + .7 * h(vec2(5., 5.))), .15 + .7 * h(vec2(5., 6.)));
    col = mix(c3, c1, .3); col = mix(col, c1, exp(-dot(q - A, q - A) * 3.)); col = mix(col, c2, exp(-dot(q - B, q - B) * 3.5) * .95); col = mix(col, c3 * 1.06, exp(-dot(q - C, q - C) * 4.) * .9); col += (h(gl_FragCoord.xy + 3.) - .5) * .03; }
  else if (mode == 12) { float cs = max(6., floor(r.y / 8.)); vec2 cl = floor(gl_FragCoord.xy / cs), f = fract(gl_FragCoord.xy / cs) - .5; float v = smoothstep(.28, .72, fbm(cl * .2 + vec2(s * 7. + t * .12, s * 3.))), lv = floor(clamp(v, 0., .999) * 7.);
    float hb = step(abs(f.y), .07) * step(abs(f.x), .32), vb = step(abs(f.x), .07) * step(abs(f.y), .32), d1 = step(abs(f.x - f.y), .09) * step(abs(f.x), .3), d2 = step(abs(f.x + f.y), .09) * step(abs(f.x), .3);
    float hs = max(step(abs(abs(f.y) - .17), .055) * step(abs(f.x), .34), step(abs(abs(f.x) - .17), .055) * step(abs(f.y), .34)), g = 0.;
    if (lv < 2.) g = 0.; else if (lv < 3.) g = step(length(f - vec2(0., -.22)), .1); else if (lv < 4.) g = hb; else if (lv < 5.) g = max(hb, vb); else if (lv < 6.) g = max(d1, d2); else g = hs;
    col = mix(c2 * .9, c2, uv.y); col = mix(col, mix(c3, c1, step(.75, v)), g); }
  else if (mode == 13) { float cs = max(5., floor(r.y / 12.)); vec2 g = mat2(.866, -.5, .5, .866) * (gl_FragCoord.xy / cs), cl = floor(g), f = fract(g) - .5; float v = fbm(cl * .11 + s * 5. + t * .04) * .85 + (1. - uv.y) * .3;
    float rad = clamp(v - .15, .04, .9) * .62; col = mix(c3, c2, 1. - smoothstep(rad - .07, rad + .07, length(f))); col = mix(col, c1, step(.75, v) * .35); }
  else if (mode == 14) { float w = fbm(p * .8 + t * .04) * 2.2, v = fract((q.x + q.y * .55) * (5. + s * 3.) + w); col = mix(c3, c2, smoothstep(.47, .53, v) - smoothstep(.97, 1., v)); col = mix(col, c1, smoothstep(.5, 1.6, w) * .5); }
  else if (mode == 15) { vec2 o = vec2(ar * (.25 + .5 * s), .05 + .3 * h(vec2(2., 8.))); float g2 = smoothstep(1.25, 0., length(q - o) * 1.1 + fbm(p * .7 + t * .05) * .35); col = mix(mix(c2, c1, .35), c1, g2); col = mix(col, c3 * 1.08, smoothstep(.45, 1., g2)); col += (h(gl_FragCoord.xy * 1.37 + 11.) - .5) * .11; }
  else if (mode == 16) { vec2 g = q * (4.5 + s * 3.) + vec2(t * .04, 0.), i = floor(g), f = fract(g); if (h(i) > .5) f.x = 1. - f.x; float d = min(abs(length(f) - .5), abs(length(f - 1.) - .5));
    col = mix(mix(c1, c3, step(.5, h(i + 3.)) * .45), c2, 1. - smoothstep(.07, .11, d)); }
  else if (mode == 17) { float a = q.x * .85 + q.y * .5 + fbm(p * .6 + t * .05) * .6, k = fract(a * 2.1); vec3 sp = .5 + .5 * cos(6.2831 * (k + vec3(0., .33, .67))); col = mix(mix(c2, c1, k), mix(c3, sp, .45), smoothstep(.5, 1., k) * .7); }
  else if (mode == 18) { vec2 g = q * (7. + s * 4.), i = floor(g), f = fract(g); float ov = mod(i.x + i.y, 2.), hx = smoothstep(.1, .16, f.y) * smoothstep(.9, .84, f.y), vx = smoothstep(.1, .16, f.x) * smoothstep(.9, .84, f.x);
    float sh = ov > .5 ? hx * (.7 + .3 * sin(f.x * 3.1416)) : vx * (.7 + .3 * sin(f.y * 3.1416)); col = mix(c2, ov > .5 ? c1 : c3, sh); }
  else if (mode == 19) { float row = floor(uv.y * (16. + s * 14.)), sh = (h(vec2(row, floor(t * .6))) - .5) * .6 * step(.55, h(vec2(row, 9.))), v = fbm(vec2((q.x + sh) * 1.6, row * .33) + s * 4.);
    col = mix(c2, c1, smoothstep(.3, .7, v)); col = mix(col, c3, step(.7, v)); col *= .9 + .1 * step(.5, fract(gl_FragCoord.y / 3.)); }
  else if (mode == 20) { vec2 w1 = vec2(fbm(p + t * .03), fbm(p + 5.2)), w2 = vec2(fbm(p + 4. * w1 + 1.7), fbm(p + 4. * w1 + 9.2)); float v = fbm(p + 4. * w2);
    col = mix(c3, c1, smoothstep(.3, .75, v)); float vein = 1. - smoothstep(.0, .06, abs(fract(v * 4. + w2.x) - .5) - .02); col = mix(col, c2, vein * .85); }
  else if (mode == 21) { col = mix(c2 * .8, c2, uv.y); for (int i = 0; i < 3; i++) { float fi = float(i), x = q.x * 1.3 + fbm(vec2(q.y * 1.2 + fi * 3.1, t * .06 + fi)) * 1.4 + fi * .37 + s, z = (fract(x) - .5) * 5., b = exp(-z * z) * smoothstep(-.1, .9, uv.y); col = mix(col, fi < 1. ? c3 : mix(c1, c3, .5), b * (.55 + .45 * n(vec2(x * 38., q.y * 1.5))) * .95); } }
  else if (mode == 22) { float cs = max(4., floor(r.y / 13.)); vec2 cl = floor(gl_FragCoord.xy / cs), f = fract(gl_FragCoord.xy / cs) - .5; float v = fbm(cl * .09 + s * 6. + vec2(t * .1, 0.)), on = step(.5, v), d = length(f);
    col = c2 * .82; col = mix(col, mix(mix(c2, c1, .6), c3, on), 1. - smoothstep(.27, .35, d)); col = mix(col, c3, on * (1. - smoothstep(0., .5, d)) * .2); }
  else { vec2 d = uv - .5; d.x *= ar; float an = atan(d.y, d.x) + length(d) * 7. - t * .35; col = mix(c1, c2, sin(an * 3.) * .5 + .5); col = mix(col, c3, fbm(p * 1.6) * .5); }
  gl_FragColor = vec4(col, 1.);
}`;

type Uniforms = Record<'r' | 't' | 's' | 'c1' | 'c2' | 'c3' | 'mode', WebGLUniformLocation | null>;
let gl: WebGLRenderingContext | null = null;
let cv: HTMLCanvasElement | null = null;
let U: Uniforms | null = null;
let ok: boolean | null = null;
const cache = new Map<string, string>();

function init(): boolean {
  if (ok !== null) return ok;
  try {
    cv = document.createElement('canvas');
    gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return (ok = false);
    const g = gl;
    const sh = (type: number, src: string) => {
      const x = g.createShader(type);
      if (!x) throw new Error('createShader failed');
      g.shaderSource(x, src);
      g.compileShader(x);
      if (!g.getShaderParameter(x, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(x) ?? 'shader');
      return x;
    };
    const pr = g.createProgram();
    g.attachShader(pr, sh(g.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'));
    g.attachShader(pr, sh(g.FRAGMENT_SHADER, FS));
    g.linkProgram(pr);
    g.useProgram(pr);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const at = g.getAttribLocation(pr, 'a');
    g.enableVertexAttribArray(at);
    g.vertexAttribPointer(at, 2, g.FLOAT, false, 0, 0);
    const loc = (k: string) => g.getUniformLocation(pr, k);
    U = { r: loc('r'), t: loc('t'), s: loc('s'), c1: loc('c1'), c2: loc('c2'), c3: loc('c3'), mode: loc('mode') };
    ok = true;
  } catch (err) {
    console.warn('Identity art falls back to gradients:', err instanceof Error ? err.message : err);
    ok = false;
  }
  return ok;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function draw(key: string, mode: number, p: number, w: number, h: number, t: number) {
  if (!gl || !cv || !U) return;
  const c = pal(p);
  cv.width = w;
  cv.height = h;
  gl.viewport(0, 0, w, h);
  gl.uniform2f(U.r, w, h);
  gl.uniform1f(U.t, t);
  gl.uniform1f(U.s, hash(key));
  gl.uniform1i(U.mode, mode);
  gl.uniform3fv(U.c1, rgb(c[1]));
  gl.uniform3fv(U.c2, rgb(c[2]));
  gl.uniform3fv(U.c3, rgb(c[3]));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/** A still image of the art at a pixel size, cached; null when WebGL is unavailable (the gradient shows instead). */
export function still(key: string, mode: number, p: number, w: number, h: number): string | null {
  if (!init() || !cv) return null;
  const k = `${key}|${mode}|${p}|${w}x${h}`;
  let url = cache.get(k);
  if (!url) {
    draw(key, mode, p, w, h, hash(key) * 20);
    url = cv.toDataURL('image/png');
    cache.set(k, url);
  }
  return url;
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let anim: { el: HTMLElement; c: HTMLCanvasElement; raf: number } | null = null;

/** Animates one tile while its host is hovered (one at a time). */
export function play(el: HTMLElement) {
  if (anim?.el === el) return;
  stop();
  if (!el.isConnected || !init() || reduced() || document.hidden) return;
  const r = el.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement('canvas');
  c.width = Math.round(r.width * dpr);
  c.height = Math.round(r.height * dpr);
  c.className = 'absolute inset-0 size-full motion-reduce:hidden';
  el.appendChild(c);
  const ctx = c.getContext('2d');
  const key = el.dataset.idn ?? '';
  const mode = Number(el.dataset.mode);
  const p = Number(el.dataset.pal);
  const t0 = performance.now();
  const base = hash(key) * 20;
  const loop = (now: number) => {
    if (anim?.el !== el) return;
    if (!el.isConnected || document.hidden || reduced()) {
      stop();
      return;
    }
    draw(key, mode, p, c.width, c.height, base + (now - t0) / 1000);
    if (cv) ctx?.drawImage(cv, 0, 0);
    anim.raf = requestAnimationFrame(loop);
  };
  anim = { el, c, raf: requestAnimationFrame(loop) };
}

export function stop() {
  if (!anim) return;
  cancelAnimationFrame(anim.raf);
  anim.c.remove();
  anim = null;
}

/** One listener for the whole app: hovering an art host plays its first tile (plan.js mouseover handler). */
export function installArtHover() {
  const over = (e: MouseEvent) => {
    const host = (e.target as Element | null)?.closest('[data-art-host]');
    const el = host?.querySelector<HTMLElement>('[data-idn]');
    if (el) play(el);
    else stop();
  };
  const hide = () => {
    if (document.hidden) stop();
  };
  document.addEventListener('mouseover', over);
  document.addEventListener('visibilitychange', hide);
  return () => {
    document.removeEventListener('mouseover', over);
    document.removeEventListener('visibilitychange', hide);
  };
}
