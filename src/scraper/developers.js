import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils/http.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { buildDevelopersUrl, BASE_URL } from '../config.js';

/**
 * Parse trending developers HTML into structured data.
 * @param {string} html
 * @returns {Array<object>}
 */
export function parseDevelopersHtml(html) {
  const $ = cheerio.load(html);
  const developers = [];

  $('article.Box-row').each((index, el) => {
    const $el = $(el);

    // Display name: h1.h3 a
    const displayName = $el.find('h1.h3 a').text().trim() || '';

    // Username: p.f4 a
    const usernameLink = $el.find('p.f4 a');
    const username = usernameLink.text().trim() || '';

    // Avatar
    const avatar = $el.find('img.avatar-user').attr('src') || '';

    // Popular repo: h1.h4 a
    const repoLink = $el.find('h1.h4 a');
    const popularRepo = repoLink.text().trim() || '';
    const repoHref = repoLink.attr('href') || '';

    // Repo description
    const popularRepoDescription = $el.find('div.f6.color-fg-muted.mt-1').text().trim() || '';

    if (username) {
      developers.push({
        rank: index + 1,
        username,
        displayName: displayName || username,
        avatar,
        popularRepo,
        popularRepoUrl: repoHref ? `${BASE_URL}${repoHref}` : '',
        popularRepoDescription,
        profileUrl: `${BASE_URL}/${username}`,
      });
    }
  });

  return developers;
}

/**
 * Fetch and parse trending developers.
 * @param {object} opts - { language, since }
 * @returns {Promise<Array<object>>}
 */
export async function fetchTrendingDevelopers(opts = {}) {
  const url = buildDevelopersUrl(opts);
  const cacheKey = `developers:${url}`;

  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(url);
  const html = await response.text();
  const developers = parseDevelopersHtml(html);

  cacheSet(cacheKey, developers);
  return developers;
}
