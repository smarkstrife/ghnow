// Constants and configuration for ghnow CLI

export const BASE_URL = 'https://github.com';
export const API_BASE_URL = 'https://api.github.com';

export const TRENDING_URL = `${BASE_URL}/trending`;
export const DEVELOPERS_URL = `${BASE_URL}/trending/developers`;

export const VALID_SINCE = ['daily', 'weekly', 'monthly'];

export const DEFAULTS = {
  since: 'daily',
  format: 'table',
  limit: 25,
};

export const USER_AGENT = 'ghnow-cli/1.0.0';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Build the trending repos URL with filters.
 */
export function buildTrendingUrl({ language, since, spoken } = {}) {
  let url = TRENDING_URL;
  if (language) {
    url += `/${encodeURIComponent(language)}`;
  }
  const params = new URLSearchParams();
  if (since && since !== 'daily') {
    params.set('since', since);
  }
  if (spoken) {
    params.set('spoken_language_code', spoken);
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Build the trending developers URL with filters.
 */
export function buildDevelopersUrl({ language, since } = {}) {
  let url = DEVELOPERS_URL;
  if (language) {
    url += `/${encodeURIComponent(language)}`;
  }
  const params = new URLSearchParams();
  if (since && since !== 'daily') {
    params.set('since', since);
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Build the GitHub API URL for a repo's README.
 */
export function buildReadmeApiUrl(owner, repo) {
  return `${API_BASE_URL}/repos/${owner}/${repo}/readme`;
}
