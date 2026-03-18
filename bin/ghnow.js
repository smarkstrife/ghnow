#!/usr/bin/env node

import { Command } from 'commander';
import { reposCommand } from '../src/commands/repos.js';
import { devsCommand } from '../src/commands/devs.js';
import { readmeCommand } from '../src/commands/readme.js';
import { VALID_SINCE } from '../src/config.js';

const program = new Command();

program
  .name('ghnow')
  .description('Browse GitHub trending repositories and developers from your terminal')
  .version('1.0.0');

// --- repos command (also the default) ---
const repos = program
  .command('repos', { isDefault: true })
  .description('Show trending repositories')
  .option('-l, --language <lang>', 'Filter by programming language (e.g., python, rust, javascript)')
  .option(`-s, --since <period>`, `Time range: ${VALID_SINCE.join(', ')}`, 'daily')
  .option('--spoken <code>', 'Filter by spoken language code (e.g., en, zh, es)')
  .option('-f, --format <type>', 'Output format: table, list, json', 'table')
  .option('-n, --limit <count>', 'Limit number of results')
  .option('-e, --export <file>', 'Export results to file (.json, .csv, .md)')
  .action((opts) => reposCommand(opts));

// --- devs command ---
program
  .command('devs')
  .description('Show trending developers')
  .option('-l, --language <lang>', 'Filter by programming language')
  .option(`-s, --since <period>`, `Time range: ${VALID_SINCE.join(', ')}`, 'daily')
  .option('-f, --format <type>', 'Output format: table, list, json', 'table')
  .option('-n, --limit <count>', 'Limit number of results')
  .option('-e, --export <file>', 'Export results to file (.json, .csv, .md)')
  .action((opts) => devsCommand(opts));

program
  .command('readme <repo>')
  .description('View a repository README in the terminal (format: owner/repo)')
  .option('-e, --export <file>', 'Save README as a markdown file instead of displaying')
  .action((repo, opts) => readmeCommand(repo, opts));

program.parse();
