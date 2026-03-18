# ghnow — Commands Guide

A complete reference of every command, option, and usage pattern.

---

## Quick Start

```bash
# Install globally (run once)
cd ~/Documents/cli_tools/github-trending
npm install
npm link

# Now `ghnow` is available everywhere
ghnow
```

---

## Commands

### 1. `ghnow repos` — Trending Repositories

> This is the **default command** — running `ghnow` with no subcommand is the same as `ghnow repos`.

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--language <lang>` | `-l` | Filter by programming language | All |
| `--since <period>` | `-s` | Time range: `daily`, `weekly`, `monthly` | `daily` |
| `--spoken <code>` | | Spoken language code (e.g., `en`, `zh`, `es`) | All |
| `--format <type>` | `-f` | Output format: `table`, `list`, `json` | `table` |
| `--limit <count>` | `-n` | Max number of results to display | All |
| `--export <file>` | `-e` | Export to file (`.json`, `.csv`, `.md`) | — |

#### Examples

```bash
# Today's trending repos (table format)
ghnow
ghnow repos

# Filter by language
ghnow repos -l python
ghnow repos -l rust
ghnow repos -l javascript

# Weekly / monthly trending
ghnow repos -s weekly
ghnow repos -s monthly

# Limit to top 5
ghnow repos -n 5

# Compact list format
ghnow repos -f list

# JSON output (great for piping to jq)
ghnow repos -f json
ghnow repos -f json | jq '.[].name'

# Combine filters
ghnow repos -l python -s weekly -n 10 -f list

# Filter by spoken language
ghnow repos --spoken en
ghnow repos --spoken zh

# Export to file
ghnow repos --export trending.json
ghnow repos --export trending.csv
ghnow repos --export trending.md
ghnow repos -l rust -s weekly --export rust_weekly.json
```

---

### 2. `ghnow devs` — Trending Developers

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--language <lang>` | `-l` | Filter by programming language | All |
| `--since <period>` | `-s` | Time range: `daily`, `weekly`, `monthly` | `daily` |
| `--format <type>` | `-f` | Output format: `table`, `list`, `json` | `table` |
| `--limit <count>` | `-n` | Max number of results to display | All |
| `--export <file>` | `-e` | Export to file (`.json`, `.csv`, `.md`) | — |

#### Examples

```bash
# Today's trending developers
ghnow devs

# Filter by language
ghnow devs -l javascript
ghnow devs -l python

# Weekly trending devs
ghnow devs -s weekly

# Top 5 in compact format
ghnow devs -n 5 -f list

# JSON output
ghnow devs -f json

# Export
ghnow devs --export developers.json
ghnow devs -l python --export python_devs.csv
```

---

### 3. `ghnow readme <owner/repo>` — View README

Fetches and renders a repository's README directly in your terminal with full Markdown formatting (headings, lists, links, code blocks, etc.).

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--export <file>` | `-e` | Save raw markdown to file instead of displaying | — |

#### Examples

```bash
# View in terminal
ghnow readme torvalds/linux
ghnow readme facebook/react
ghnow readme microsoft/vscode

# Save as markdown file (opens perfectly in VS Code, Obsidian, etc.)
ghnow readme sxyazi/yazi --export yazi.md
ghnow readme facebook/react --export react-readme.md
```

> **Tip:** When viewing in terminal, a highlighted tip will remind you of the export option.

> **Tip:** Set `GITHUB_TOKEN` for higher API rate limits (5,000/hr vs 60/hr):
> ```bash
> export GITHUB_TOKEN=ghp_your_token_here
> ```

---

### 4. `ghnow --help` — Help

```bash
# General help
ghnow --help

# Command-specific help
ghnow repos --help
ghnow devs --help
ghnow readme --help

# Version
ghnow --version
```

---

## Manual Testing Checklist

Copy-paste these commands to verify everything works:

```bash
# ─── SETUP ───
cd ~/Documents/cli_tools/github-trending

# ─── HELP ───
ghnow --help
ghnow --version
ghnow repos --help
ghnow devs --help
ghnow readme --help

# ─── TRENDING REPOS ───
ghnow                                    # default: today's repos, table
ghnow repos                              # same as above
ghnow repos -f table                     # explicit table format
ghnow repos -f list                      # compact list
ghnow repos -f json                      # JSON output
ghnow repos -n 5                         # limit to 5
ghnow repos -l python                    # Python only
ghnow repos -l rust                      # Rust only
ghnow repos -s weekly                    # weekly trending
ghnow repos -s monthly                   # monthly trending
ghnow repos -l python -s weekly -n 5     # combined filters
ghnow repos --spoken en                  # English spoken language
ghnow repos -f json | jq '.[0]'         # pipe JSON to jq

# ─── TRENDING DEVELOPERS ───
ghnow devs                               # today's devs, table
ghnow devs -f list                       # compact list
ghnow devs -f json                       # JSON
ghnow devs -l javascript                 # JS devs only
ghnow devs -s weekly                     # weekly
ghnow devs -n 10 -f list                 # top 10 compact

# ─── README VIEWER ───
ghnow readme facebook/react              # render React README
ghnow readme torvalds/linux              # render Linux README
ghnow readme nonexistent/repo-404        # should show error

# ─── README EXPORT ───
ghnow readme facebook/react --export /tmp/react.md && head -5 /tmp/react.md
ghnow readme torvalds/linux --export /tmp/linux.md && wc -l /tmp/linux.md

# ─── DATA EXPORT ───
ghnow repos -n 5 --export /tmp/test.json && cat /tmp/test.json
ghnow repos -n 5 --export /tmp/test.csv  && cat /tmp/test.csv
ghnow repos -n 5 --export /tmp/test.md   && cat /tmp/test.md
ghnow devs -n 5 --export /tmp/devs.json  && cat /tmp/devs.json

# ─── CLEANUP ───
rm -f /tmp/test.json /tmp/test.csv /tmp/test.md /tmp/devs.json /tmp/react.md /tmp/linux.md
```
