import ora from 'ora';
import chalk from 'chalk';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchReadme } from '../scraper/readme.js';

/**
 * Handle the `readme` command.
 * @param {string} repoArg - "owner/repo" string
 * @param {object} opts - CLI options
 */
export async function readmeCommand(repoArg, opts = {}) {
  // Parse owner/repo
  const parts = repoArg.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    console.error(chalk.red('Error: Please provide a valid repository in the format "owner/repo"'));
    console.error(chalk.dim('Example: ghnow readme torvalds/linux'));
    process.exit(1);
  }

  const [owner, repo] = parts;
  const exportPath = opts.export;

  const spinner = ora({
    text: chalk.cyan(`Fetching README for ${chalk.bold(`${owner}/${repo}`)}…`),
    spinner: 'dots',
  }).start();

  try {
    const { raw, rendered } = await fetchReadme(owner, repo);

    // Export to file
    if (exportPath) {
      const absPath = resolve(exportPath);
      writeFileSync(absPath, raw, 'utf-8');
      spinner.succeed(chalk.green(`README saved to ${chalk.bold(absPath)}`));
      return;
    }

    // Display in terminal
    spinner.succeed(chalk.green(`README for ${chalk.bold(`${owner}/${repo}`)}`));
    console.log(chalk.bgBlue.white.bold(' 💡 TIP ') + chalk.cyan(` Save as markdown: `) + chalk.white(`ghnow readme ${owner}/${repo} --export ${repo}.md`));
    console.log();
    console.log(rendered);
  } catch (err) {
    if (err.message.includes('404')) {
      spinner.fail(chalk.red(`Repository "${owner}/${repo}" not found or has no README.`));
    } else if (err.message.includes('403')) {
      spinner.fail(chalk.red('API rate limit exceeded. Set GITHUB_TOKEN env var for higher limits.'));
      console.error(chalk.dim('  export GITHUB_TOKEN=your_token_here'));
    } else {
      spinner.fail(chalk.red(`Failed to fetch README: ${err.message}`));
    }
    process.exit(1);
  }
}
