import { marked } from 'marked';

/**
 * Generate the HTML email digest.
 * @param {Array} repos Trending repositories data
 * @param {Array} devs Trending developers data
 * @param {object} config User's email configuration
 * @returns {string} Fully rendered HTML email string
 */
export function generateHtmlDigest(repos = [], devs = [], config = {}) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const languageLabel = config.language ? ` • Language: ${config.language}` : '';
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #24292e; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
    h2 { color: #24292f; margin-top: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header p { color: #586069; }
    
    /* Repos Table */
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e1e4e8; }
    th { background-color: #f6f8fa; font-weight: 600; }
    .repo-name { font-weight: 600; color: #0366d6; text-decoration: none; font-size: 1.1em; }
    .desc { color: #586069; font-size: 0.9em; margin-top: 4px; }
    .stats { color: #586069; font-size: 0.85em; white-space: nowrap; }
    .rank { font-weight: bold; color: #24292e; }
    
    /* Devs Grid */
    .dev-item { border-bottom: 1px solid #e1e4e8; padding: 15px 0; display: flex; align-items: flex-start; }
    .dev-rank { font-weight: bold; margin-right: 15px; color: #586069; min-width: 25px; }
    .dev-details { flex-grow: 1; }
    .dev-name { font-weight: 600; font-size: 1.1em; }
    .dev-username { color: #586069; }
    .dev-repo { margin-top: 5px; font-size: 0.9em; }
    .dev-repo-link { color: #0366d6; text-decoration: none; font-weight: 600; }
    
    .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #6a737d; border-top: 1px solid #eaecef; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ghnow Digest 🚀</h1>
    <p>${config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)} Trending on GitHub<br>${dateStr}${languageLabel}</p>
  </div>
`;

  // Render Repositories
  if (repos && repos.length > 0) {
    html += `
  <h2>🔥 Trending Repositories</h2>
  <table>
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="75%">Repository</th>
        <th width="20%">Stats</th>
      </tr>
    </thead>
    <tbody>`;

    for (const repo of repos) {
      // Parse markdown in description
      const descHtml = repo.description ? marked.parseInline(repo.description) : '';
      
      html += `
      <tr>
        <td class="rank">${repo.rank}</td>
        <td>
          <a href="${repo.url}" class="repo-name">${repo.owner}/${repo.name}</a>
          <div class="desc">${descHtml}</div>
        </td>
        <td class="stats">
          ⭐ ${repo.stars.toLocaleString()}<br>
          ${repo.language ? `💻 ${repo.language}<br>` : ''}
          📈 ${repo.starsInPeriod.toLocaleString()} this ${getPeriodWord(config.frequency)}
        </td>
      </tr>`;
    }

    html += `
    </tbody>
  </table>`;
  }

  // Render Developers
  if (devs && devs.length > 0) {
    html += `
  <h2>👩‍💻 Trending Developers</h2>
  <div>`;

    for (const dev of devs) {
      const displayName = dev.displayName ? `${dev.displayName} ` : '';
      const repoDesc = dev.popularRepoDescription ? `<br><span class="desc">${marked.parseInline(dev.popularRepoDescription)}</span>` : '';
      
      html += `
    <div class="dev-item">
      <div class="dev-rank">#${dev.rank}</div>
      <div class="dev-details">
        <div>
          <a href="${dev.url}" class="repo-name">${displayName}</a>
          <span class="dev-username">(@${dev.username})</span>
        </div>
        ${dev.popularRepo ? `
        <div class="dev-repo">
          🔥 Popular repo: <a href="${dev.popularRepoUrl}" class="dev-repo-link">${dev.popularRepo}</a>
          ${repoDesc}
        </div>` : ''}
      </div>
    </div>`;
    }

    html += `
  </div>`;
  }

  if (repos.length === 0 && devs.length === 0) {
    html += `<p style="text-align: center; color: #586069; margin: 40px 0;">No trending data found for the current filters.</p>`;
  }

  html += `
  <div class="footer">
    <p>Sent via <strong>ghnow</strong> CLI tool.<br>
    To stop receiving these emails, run <code>ghnow email disable</code> in your terminal.</p>
  </div>
</body>
</html>`;

  return html;
}

// Helper
function getPeriodWord(frequency) {
  if (frequency === 'daily') return 'day';
  if (frequency === 'weekly') return 'week';
  if (frequency === 'monthly') return 'month';
  return 'period';
}
