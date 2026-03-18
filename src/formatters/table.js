import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Format a number with K/M suffixes for compact display.
 */
function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/**
 * Format trending repos as a rich table.
 * @param {Array<object>} repos
 * @param {number} limit
 * @returns {string}
 */
export function formatReposTable(repos, limit) {
  const items = limit ? repos.slice(0, limit) : repos;

  const table = new Table({
    head: [
      chalk.gray('#'),
      chalk.bold.cyan('Repository'),
      chalk.white('Description'),
      chalk.yellow('⭐'),
      chalk.green('🍴'),
      chalk.magenta('Language'),
      chalk.yellow('📈 Period'),
    ],
    colWidths: [5, 28, 40, 9, 8, 14, 16],
    wordWrap: true,
    style: {
      head: [],
      border: ['gray'],
    },
  });

  for (const repo of items) {
    table.push([
      chalk.gray(repo.rank),
      chalk.bold.cyan(`${repo.owner}/${repo.name}`),
      chalk.white(repo.description ? truncate(repo.description, 80) : chalk.dim('No description')),
      chalk.yellow(formatNum(repo.stars)),
      chalk.green(formatNum(repo.forks)),
      repo.language ? chalk.magenta(repo.language) : chalk.dim('—'),
      repo.periodText ? chalk.yellow(repo.periodText) : chalk.dim('—'),
    ]);
  }

  return table.toString();
}

/**
 * Format trending developers as a rich table.
 * @param {Array<object>} devs
 * @param {number} limit
 * @returns {string}
 */
export function formatDevsTable(devs, limit) {
  const items = limit ? devs.slice(0, limit) : devs;

  const table = new Table({
    head: [
      chalk.gray('#'),
      chalk.bold.cyan('Developer'),
      chalk.white('Name'),
      chalk.yellow('Popular Repo'),
      chalk.white('Description'),
    ],
    colWidths: [5, 22, 22, 28, 40],
    wordWrap: true,
    style: {
      head: [],
      border: ['gray'],
    },
  });

  for (const dev of items) {
    table.push([
      chalk.gray(dev.rank),
      chalk.bold.cyan(`@${dev.username}`),
      chalk.white(dev.displayName || dev.username),
      dev.popularRepo ? chalk.yellow(dev.popularRepo) : chalk.dim('—'),
      dev.popularRepoDescription ? chalk.white(truncate(dev.popularRepoDescription, 80)) : chalk.dim('—'),
    ]);
  }

  return table.toString();
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
