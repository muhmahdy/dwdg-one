/** A stored record's document. */
export type Doc = Record<string, unknown>;

/** A document field the way the database's generated column reads it: `doc->>'key'`. Absent and null are null. */
export function text(doc: Doc, key: string): string | null {
  const v = doc[key];
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}
