/* Navigation for actions outside components (the prototype's go()). The router registers itself on start. */
type Navigate = (to: string, opts?: { replace?: boolean }) => void;

let navigateFn: Navigate | null = null;

export const registerNavigate = (fn: Navigate) => {
  navigateFn = fn;
};

/** Go to a page by its route, for example `work` or `projects/p-roadmap`. */
export function go(route: string, opts?: { replace?: boolean }) {
  const to = `/${route.replace(/^\/+/, '')}`;
  if (!navigateFn) throw new Error('Navigation is not ready');
  navigateFn(to, opts);
}
