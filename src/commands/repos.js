import ora from 'ora';
import chalk from 'chalk';
import { fetchTrendingRepos } from '../scraper/trending.js';
import { formatReposTable } from '../formatters/table.js';
import { formatReposList } from '../formatters/list.js';
import { formatJson } from '../formatters/json.js';
import { exportData } from '../exporters/export.js';
import { DEFAULTS } from '../config.js';

/**
 * Handle the `repos` command.
 * @param {object} opts - CLI options
 */
export async function reposCommand(opts) {
  const {
    language,
    since = DEFAULTS.since,
    spoken,
    format = DEFAULTS.format,
    limit,
    export: exportPath,
  } = opts;

  const spinner = ora({
    text: chalk.cyan('Fetching trending repositories…'),
    spinner: 'dots',
  }).start();

  try {
    const repos = await fetchTrendingRepos({ language, since, spoken });

    if (repos.length === 0) {
      spinner.warn(chalk.yellow('No trending repositories found for the given filters.'));
      return;
    }

    spinner.succeed(chalk.green(`Found ${repos.length} trending repositories`));
    console.log();

    // Apply limit
    const effectiveLimit = limit ? parseInt(limit, 10) : undefined;

    // Format and display
    let output;
    switch (format) {
      case 'list':
        output = formatReposList(repos, effectiveLimit);
        break;
      case 'json':
        output = formatJson(effectiveLimit ? repos.slice(0, effectiveLimit) : repos);
        break;
      case 'table':
      default:
        output = formatReposTable(repos, effectiveLimit);
        break;
    }

    console.log(output);

    // Export if requested
    if (exportPath) {
      const dataToExport = effectiveLimit ? repos.slice(0, effectiveLimit) : repos;
      const absPath = exportData(dataToExport, exportPath, 'repos');
      console.log();
      console.log(chalk.green(`✔ Exported to ${absPath}`));
    }
  } catch (err) {
    spinner.fail(chalk.red('Failed to fetch trending repositories'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }
}
