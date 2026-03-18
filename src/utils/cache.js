import { CACHE_TTL_MS } from '../config.js';

const store = new Map();

/**
 * Get a cached value by key. Returns undefined if expired or missing.
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Set a cached value by key.
 */
export function cacheSet(key, value) {
  store.set(key, { value, timestamp: Date.now() });
}

/**
 * Clear the entire cache.
 */
export function cacheClear() {
  store.clear();
}
