import { writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

/**
 * Export data to a file. Format is detected from file extension.
 * Supported: .json, .csv, .md
 *
 * @param {Array<object>} data
 * @param {string} filePath
 * @param {'repos'|'devs'} type
 */
export function exportData(data, filePath, type = 'repos') {
  const ext = extname(filePath).toLowerCase();
  const absPath = resolve(filePath);
  let content;

  switch (ext) {
    case '.json':
      content = JSON.stringify(data, null, 2);
      break;
    case '.csv':
      content = toCsv(data, type);
      break;
    case '.md':
      content = toMarkdown(data, type);
      break;
    default:
      throw new Error(`Unsupported export format: "${ext}". Use .json, .csv, or .md`);
  }

  writeFileSync(absPath, content, 'utf-8');
  return absPath;
}

function toCsv(data, type) {
  if (data.length === 0) return '';

  if (type === 'devs') {
    const header = 'Rank,Username,Display Name,Popular Repo,Description,Profile URL';
    const rows = data.map((d) =>
      [d.rank, d.username, csvEscape(d.displayName), csvEscape(d.popularRepo), csvEscape(d.popularRepoDescription), d.profileUrl].join(',')
    );
    return [header, ...rows].join('\n');
  }

  // repos
  const header = 'Rank,Owner,Name,Description,Language,Stars,Forks,Stars in Period,URL';
  const rows = data.map((r) =>
    [r.rank, r.owner, r.name, csvEscape(r.description), r.language || '', r.stars, r.forks, r.starsInPeriod, r.url].join(',')
  );
  return [header, ...rows].join('\n');
}

function toMarkdown(data, type) {
  if (data.length === 0) return '*(No data)*\n';

  if (type === 'devs') {
    const lines = [
      '| # | Developer | Name | Popular Repo | Description |',
      '|---|-----------|------|--------------|-------------|',
      ...data.map(
        (d) =>
          `| ${d.rank} | [@${d.username}](${d.profileUrl}) | ${d.displayName} | ${d.popularRepo ? `[${d.popularRepo}](${d.popularRepoUrl})` : '—'} | ${d.popularRepoDescription || '—'} |`
      ),
    ];
    return lines.join('\n') + '\n';
  }

  // repos
  const lines = [
    '| # | Repository | Description | ⭐ Stars | 🍴 Forks | Language | Period |',
    '|---|------------|-------------|---------|--------|----------|--------|',
    ...data.map(
      (r) =>
        `| ${r.rank} | [${r.owner}/${r.name}](${r.url}) | ${r.description || '—'} | ${r.stars} | ${r.forks} | ${r.language || '—'} | ${r.periodText || '—'} |`
    ),
  ];
  return lines.join('\n') + '\n';
}

function csvEscape(str) {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
