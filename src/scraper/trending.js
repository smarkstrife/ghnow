import * as cheerio from 'cheerio';
import { fetchWithRetry } from '../utils/http.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { buildTrendingUrl, BASE_URL } from '../config.js';

/**
 * Parse a compact number string like "1,234" or "90,781" to a number.
 */
function parseCount(text) {
  if (!text) return 0;
  return parseInt(text.replace(/,/g, '').trim(), 10) || 0;
}

/**
 * Parse trending repos HTML into structured data.
 * @param {string} html - Raw HTML of the trending page
 * @returns {Array<object>}
 */
export function parseTrendingHtml(html) {
  const $ = cheerio.load(html);
  const repos = [];

  $('article.Box-row').each((index, el) => {
    const $el = $(el);

    // Repo link: h2.h3 a with href like "/owner/repo"
    const repoLink = $el.find('h2.h3 a').first();
    const href = (repoLink.attr('href') || '').trim();
    const parts = href.split('/').filter(Boolean);
    const owner = parts[0] || '';
    const name = parts[1] || '';

    // Description
    const description = $el.find('p.col-9').text().trim() || '';

    // Language
    const language = $el.find('span[itemprop="programmingLanguage"]').text().trim() || null;

    // Stars and forks from links
    const starsLink = $el.find(`a[href="/${owner}/${name}/stargazers"]`);
    const forksLink = $el.find(`a[href="/${owner}/${name}/forks"]`);
    const stars = parseCount(starsLink.text());
    const forks = parseCount(forksLink.text());

    // Stars in period (e.g., "3,050 stars today")
    const periodText = $el.find('span.float-sm-right').text().trim();
    const starsInPeriod = parseCount(periodText);

    // Built-by avatars
    const builtBy = [];
    $el.find('img.avatar').each((_i, img) => {
      const alt = $(img).attr('alt') || '';
      // alt is usually like "@username"
      const username = alt.startsWith('@') ? alt.slice(1) : alt;
      if (username) builtBy.push(username);
    });

    if (owner && name) {
      repos.push({
        rank: index + 1,
        owner,
        name,
        description,
        language,
        stars,
        forks,
        starsInPeriod,
        periodText: periodText || null,
        builtBy,
        url: `${BASE_URL}/${owner}/${name}`,
      });
    }
  });

  return repos;
}

/**
 * Fetch and parse trending repositories.
 * @param {object} opts - { language, since, spoken }
 * @returns {Promise<Array<object>>}
 */
export async function fetchTrendingRepos(opts = {}) {
  const url = buildTrendingUrl(opts);
  const cacheKey = `trending:${url}`;

  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(url);
  const html = await response.text();
  const repos = parseTrendingHtml(html);

  cacheSet(cacheKey, repos);
  return repos;
}
