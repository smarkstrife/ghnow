import { USER_AGENT } from '../config.js';

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;

/**
 * Fetch a URL with timeout, retries, and optional auth.
 * @param {string} url
 * @param {object} opts
 * @param {boolean} opts.useAuth - Whether to attach GITHUB_TOKEN if available
 * @param {number} opts.timeout - Timeout in ms
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, { useAuth = false, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const headers = {
    'User-Agent': USER_AGENT,
  };

  if (useAuth) {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        // Brief pause before retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  throw lastError;
}
