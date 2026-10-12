/* Atomic local interactions. Existing commands keep their domain rules and Undo callbacks;
   feedback and rendering wait until their one localStorage write has succeeded. */
'use strict';
const DBCommit = (() => {
  let active = null;
  const copies = new WeakMap();
  const plain = v => !!v && typeof v === 'object' && (Array.isArray(v) || Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

  // Remember original references as well as values. Restoring removed array members must not
  // replace the objects captured by existing Undo closures. DOM nodes/rects remain opaque.
  function snapshot(value) {
    const seen = new Map();
    function take(v) {
      if (!plain(v)) return {value: v};
      if (seen.has(v)) return seen.get(v);
      const node = {ref: v, entries: [], length: Array.isArray(v) ? v.length : null};
      seen.set(v, node);
      node.entries = Object.keys(v).map(k => [k, take(v[k])]);
      return node;
    }
    return take(value);
  }
  function restore(root) {
    const seen = new Set();
    function put(node) {
      if (!node.ref) return node.value;
      const value = node.ref;
      if (seen.has(node)) return value;
      seen.add(node);
      const keys = new Set(node.entries.map(([k]) => k));
      Object.keys(value).forEach(k => { if (!keys.has(k)) delete value[k]; });
      if (node.length !== null) value.length = node.length;
      node.entries.forEach(([k, child]) => { value[k] = put(child); });
      return value;
    }
    return put(root);
  }
  // History keeps its existing JSON-shaped snapshots while remembering the original
  // graph privately. Redo must not orphan objects captured by older Undo callbacks.
  function copy(value) {
    const valueCopy = JSON.parse(JSON.stringify(value));
    copies.set(valueCopy, snapshot(value));
    return valueCopy;
  }
  function restoreCopy(valueCopy) {
    const state = copies.get(valueCopy);
    if (!state) throw new Error('This history snapshot is no longer available.');
    return restore(state);
  }
  const rectOf = el => {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    const r = el.getBoundingClientRect();
    return {x: r.x, y: r.y, top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height};
  };
  function run(change, options = {}) {
    if (active) {
      if (!active.originRect && options.originRect) active.originRect = options.originRect;
      return change();
    }
    const oldDb = db, roots = [snapshot(db), snapshot(ui), snapshot(UNDO)];
    const states = new Map((db.tasks || []).map(t => [t.id, t.status]));
    const pinKeys = new Set(Object.entries(db.pins || {}).flatMap(([who, pins]) => pins.map(p => `${who}|${p.k}|${p.id}`)));
    const original = {save, render, renderLayer, toast, showToast};
    const tx = {write: false, render: false, layer: false, feedback: [], originRect: options.originRect || null};
    active = tx;
    save = () => { tx.write = true; return true; };
    render = () => { tx.render = true; };
    renderLayer = () => { tx.layer = true; };
    toast = (...args) => { tx.feedback.push(() => original.toast(...args)); };
    showToast = (...args) => { tx.feedback.push(() => original.showToast(...args)); };
    let error, committed = true;
    try {
      change();
      if (tx.write) {
        try { committed = original.save() === true; } catch { committed = false; }
      }
    } catch (e) { error = e; committed = false; }
    finally {
      save = original.save; render = original.render; renderLayer = original.renderLayer;
      toast = original.toast; showToast = original.showToast; active = null;
    }
    if (!committed) {
      db = oldDb; roots.forEach(restore);
      // No queued render has run: retain the live fields, selection and focus, including
      // older form drafts that exist only in the DOM. Undo may have painted its buttons.
      if (typeof paintHistBtns === 'function') paintHistBtns();
      original.showToast(L(options.failureText || 'Could not save. Your changes are still here. Please try again.'));
      if (error) throw error;
      return false;
    }
    if (tx.render) original.render(); else if (tx.layer) original.renderLayer();
    tx.feedback.forEach(send => send());
    if (tx.write && options.effects !== false && typeof UIEffects !== 'undefined') {
      (db.tasks || []).filter(t => states.has(t.id) && states.get(t.id) !== 'done' && t.status === 'done').forEach(t => UIEffects.complete?.(t.id, tx.originRect));
      const who = session.me;
      ((db.pins || {})[who] || []).filter(p => !pinKeys.has(`${who}|${p.k}|${p.id}`)).forEach(p => UIEffects.pin?.(p.k, p.id));
    }
    return true;
  }
  function wrapActions(registry, names) {
    names.forEach(name => {
      const action = registry[name];
      if (!action) return;
      registry[name] = function (...args) { return run(() => action.apply(this, args), {originRect: rectOf(args[0])}); };
    });
  }
  return {run, snapshot, restore, copy, restoreCopy, wrapActions};
})();
