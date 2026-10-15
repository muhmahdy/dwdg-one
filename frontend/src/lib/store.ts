import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

/** A minimal external store: one value, replaced immutably, read by components through selectors. */
export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      for (const l of listeners) l();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Reads a slice of a store; the component re-renders only when `equal` says the slice changed. */
export function useStore<T, S>(store: Store<T>, selector: (value: T) => S, equal: (a: S, b: S) => boolean = Object.is): S {
  return useSyncExternalStoreWithSelector(store.subscribe, store.get, store.get, selector, equal);
}

/** Equality for selectors that build a new array or object: equal when every entry is the same. */
export function shallow<S>(a: S, b: S): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  return ka.length === kb.length && ka.every((k) => Object.is(ra[k], rb[k]));
}
