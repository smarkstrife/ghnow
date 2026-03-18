import ora from 'ora';
import chalk from 'chalk';
import { fetchTrendingDevelopers } from '../scraper/developers.js';
import { formatDevsTable } from '../formatters/table.js';
import { formatDevsList } from '../formatters/list.js';
import { formatJson } from '../formatters/json.js';
import { exportData } from '../exporters/export.js';
import { DEFAULTS } from '../config.js';

/**
 * Handle the `devs` command.
 * @param {object} opts - CLI options
 */
export async function devsCommand(opts) {
  const {
    language,
    since = DEFAULTS.since,
    format = DEFAULTS.format,
    limit,
    export: exportPath,
  } = opts;

  const spinner = ora({
    text: chalk.cyan('Fetching trending developers…'),
    spinner: 'dots',
  }).start();

  try {
    const devs = await fetchTrendingDevelopers({ language, since });

    if (devs.length === 0) {
      spinner.warn(chalk.yellow('No trending developers found for the given filters.'));
      return;
    }

    spinner.succeed(chalk.green(`Found ${devs.length} trending developers`));
    console.log();

    const effectiveLimit = limit ? parseInt(limit, 10) : undefined;

    let output;
    switch (format) {
      case 'list':
        output = formatDevsList(devs, effectiveLimit);
        break;
      case 'json':
        output = formatJson(effectiveLimit ? devs.slice(0, effectiveLimit) : devs);
        break;
      case 'table':
      default:
        output = formatDevsTable(devs, effectiveLimit);
        break;
    }

    console.log(output);

    if (exportPath) {
      const dataToExport = effectiveLimit ? devs.slice(0, effectiveLimit) : devs;
      const absPath = exportData(dataToExport, exportPath, 'devs');
      console.log();
      console.log(chalk.green(`✔ Exported to ${absPath}`));
    }
  } catch (err) {
    spinner.fail(chalk.red('Failed to fetch trending developers'));
    console.error(chalk.red(err.message));
    process.exit(1);
  }
}
