/** A new record id: prefix, time and a little randomness, readable like the prototype's (`t`, `n`, `c` …). */
export const uid = (prefix: string) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
