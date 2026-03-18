import chalk from 'chalk';

/**
 * Format a number with K/M suffixes.
 */
function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/**
 * Format trending repos as a compact list.
 * @param {Array<object>} repos
 * @param {number} limit
 * @returns {string}
 */
export function formatReposList(repos, limit) {
  const items = limit ? repos.slice(0, limit) : repos;

  return items
    .map((repo) => {
      const rank = chalk.gray(`#${String(repo.rank).padStart(2)}`);
      const stars = chalk.yellow(`⭐ ${formatNum(repo.stars).padStart(6)}`);
      const name = chalk.bold.cyan(`${repo.owner}/${repo.name}`);
      const lang = repo.language ? chalk.magenta(`[${repo.language}]`) : '';
      const desc = repo.description ? chalk.dim(` — ${truncate(repo.description, 60)}`) : '';
      const period = repo.periodText ? chalk.yellow(` (${repo.periodText})`) : '';

      return `${rank}  ${stars}  ${name} ${lang}${desc}${period}`;
    })
    .join('\n');
}

/**
 * Format trending developers as a compact list.
 * @param {Array<object>} devs
 * @param {number} limit
 * @returns {string}
 */
export function formatDevsList(devs, limit) {
  const items = limit ? devs.slice(0, limit) : devs;

  return items
    .map((dev) => {
      const rank = chalk.gray(`#${String(dev.rank).padStart(2)}`);
      const username = chalk.bold.cyan(`@${dev.username}`);
      const displayName = dev.displayName && dev.displayName !== dev.username
        ? chalk.white(` (${dev.displayName})`)
        : '';
      const repo = dev.popularRepo ? chalk.yellow(` 🔥 ${dev.popularRepo}`) : '';
      const desc = dev.popularRepoDescription
        ? chalk.dim(` — ${truncate(dev.popularRepoDescription, 50)}`)
        : '';

      return `${rank}  ${username}${displayName}${repo}${desc}`;
    })
    .join('\n');
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
