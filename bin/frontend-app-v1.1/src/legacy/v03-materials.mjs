/**
 * Localized DWDG Prism treatment. The visual has a CSS-only static state;
 * this controller only enables bounded motion and low-amplitude pointer light.
 * mountPrism(document) survives route replacements and returns a disposer.
 */
const mounted = new WeakMap();

export function mountPrism(root = document) {
  mounted.get(root)?.();

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const transparency = matchMedia('(prefers-reduced-transparency: reduce)');
  const contrast = matchMedia('(prefers-contrast: more)');
  const mobile = matchMedia('(max-width: 767px)');
  const media = [motion, transparency, contrast, mobile];
  const states = new Map();
  const visible = new Set();
  let pendingSync = 0;
  let disposed = false;

  const staticMode = () => document.hidden || motion.matches || transparency.matches || contrast.matches;
  const budget = () => mobile.matches ? 1 : 2;

  const setLive = (element, state, live) => {
    if (state.live === live) return;
    state.live = live;
    element.classList.toggle('is-live', live);
    if (!live) {
      if (state.pointerFrame) cancelAnimationFrame(state.pointerFrame);
      state.pointerFrame = 0;
      element.style.removeProperty('--v03-pointer-x');
      element.style.removeProperty('--v03-pointer-y');
    }
  };

  const sync = () => {
    pendingSync = 0;
    const eligible = staticMode() ? [] : [...states.keys()]
      .filter(element => visible.has(element))
      .sort((a, b) => Number(b.dataset.prismPriority || 0) - Number(a.dataset.prismPriority || 0));
    const live = new Set(eligible.slice(0, budget()));
    states.forEach((state, element) => setLive(element, state, live.has(element)));
  };

  const scheduleSync = () => {
    if (!pendingSync && !disposed) pendingSync = requestAnimationFrame(sync);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= .05) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        scheduleSync();
      }, { threshold: [0, .05, .25] })
    : null;

  const register = element => {
    if (states.has(element)) return;
    const sheen = document.createElement('span');
    sheen.className = 'v03-prism-sheen';
    sheen.setAttribute('aria-hidden', 'true');
    element.prepend(sheen);
    const state = { sheen, live: false, pointerFrame: 0, rect: null, x: 0, y: 0 };
    const onEnter = event => {
      if (event.pointerType === 'touch') return;
      state.rect = element.getBoundingClientRect();
    };
    const onMove = event => {
      if (!state.live || event.pointerType === 'touch') return;
      const rect = state.rect || element.getBoundingClientRect();
      state.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2)) * 4;
      state.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2)) * 4;
      if (state.pointerFrame) return;
      state.pointerFrame = requestAnimationFrame(() => {
        state.pointerFrame = 0;
        element.style.setProperty('--v03-pointer-x', `${state.x.toFixed(2)}px`);
        element.style.setProperty('--v03-pointer-y', `${state.y.toFixed(2)}px`);
      });
    };
    const onLeave = () => {
      state.rect = null;
      element.style.removeProperty('--v03-pointer-x');
      element.style.removeProperty('--v03-pointer-y');
    };
    element.addEventListener('pointerenter', onEnter, { passive: true });
    element.addEventListener('pointermove', onMove, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });
    state.dispose = () => {
      setLive(element, state, false);
      observer?.unobserve(element);
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      sheen.remove();
    };
    states.set(element, state);
    observer?.observe(element);
  };

  const refresh = () => {
    if (disposed) return;
    for (const [element, state] of states) {
      if (!element.isConnected || (root !== document && !root.contains(element))) {
        visible.delete(element);
        state.dispose();
        states.delete(element);
      }
    }
    if (root instanceof Element && root.matches('.v03-prism')) register(root);
    root.querySelectorAll('.v03-prism').forEach(register);
    scheduleSync();
  };

  const mutationRoot = root === document ? document.documentElement : root;
  const mutation = new MutationObserver(refresh);
  mutation.observe(mutationRoot, { childList: true, subtree: true });
  refresh();
  document.addEventListener('visibilitychange', scheduleSync);
  window.addEventListener('resize', scheduleSync, { passive: true });
  media.forEach(query => query.addEventListener('change', scheduleSync));

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (pendingSync) cancelAnimationFrame(pendingSync);
    mutation.disconnect();
    observer?.disconnect();
    document.removeEventListener('visibilitychange', scheduleSync);
    window.removeEventListener('resize', scheduleSync);
    media.forEach(query => query.removeEventListener('change', scheduleSync));
    states.forEach((state, element) => state.dispose());
    states.clear();
    visible.clear();
    mounted.delete(root);
  };
  dispose.refresh = refresh;
  dispose.getLiveCount = () => [...states.values()].filter(state => state.live).length;
  mounted.set(root, dispose);
  return dispose;
}
