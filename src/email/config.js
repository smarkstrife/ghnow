import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = path.join(os.homedir(), '.ghnow');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Get the full configuration object, creating it with defaults if it doesn't exist.
 * @returns {object} The configuration object
 */
export function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      email: {
        provider: null, // "smtp" or "resend"
        smtp: {
          host: '',
          port: 587,
          secure: false,
          user: '',
          pass: ''
        },
        resend: {
          apiKey: ''
        },
        recipient: '',
        content: ['repos', 'devs'], // "repos", "devs"
        language: null,
        frequency: 'daily',
        hour: 8,
        enabled: false,
        lastSent: null
      }
    };
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading config file:', err);
    return null;
  }
}

/**
 * Update the configuration object and save it to disk.
 * @param {object} newConfig The configuration object to save
 */
export function saveConfig(newConfig) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  // Read existing and merge
  let currentConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
      // Ignore parse errors, just overwrite
    }
  }

  const mergedConfig = { ...currentConfig, ...newConfig };
  
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf-8');
}
