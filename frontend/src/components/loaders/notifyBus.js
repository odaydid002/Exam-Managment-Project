const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(type, text, duration = 5000) {
  const payload = { type, text, duration };
  listeners.forEach((fn) => {
    try { fn(payload); } catch (e) { console.error('notifyBus listener error', e); }
  });
}

export default { subscribe, notify };