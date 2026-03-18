import { fetchWithRetry } from '../utils/http.js';
import { buildReadmeApiUrl } from '../config.js';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

/**
 * Fetch a repo's README and return both raw markdown and terminal-rendered output.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ raw: string, rendered: string }>}
 */
export async function fetchReadme(owner, repo) {
  const url = buildReadmeApiUrl(owner, repo);

  const response = await fetchWithRetry(url, { useAuth: true });
  const data = await response.json();

  if (!data.content) {
    throw new Error('No README content found for this repository.');
  }

  // Decode base64 content
  const raw = Buffer.from(data.content, 'base64').toString('utf-8');

  // Render markdown for terminal
  const marked = new Marked(markedTerminal());
  const rendered = marked.parse(raw);

  return { raw, rendered };
}
