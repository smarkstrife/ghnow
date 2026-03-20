import crontab from 'crontab';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the global CLI entry point
const CLI_PATH = path.resolve(__dirname, '../../bin/ghnow.js');
const CRON_COMMENT = 'ghnow-digest';

/**
 * Add or update the system crontab for ghnow email digest.
 * @param {string} frequency "daily", "weekly", or "monthly"
 * @param {number} hour Hour to run the cron job (0-23)
 */
export function setupCron(frequency, hour = 8) {
  return new Promise((resolve, reject) => {
    crontab.load((err, tab) => {
      if (err) return reject(err);

      // 1. Remove any existing ghnow crons to prevent duplicates
      tab.remove({ comment: CRON_COMMENT });

      // 2. Determine cron expression
      let expression;
      if (frequency === 'daily') {
        expression = `0 ${hour} * * *`;
      } else if (frequency === 'weekly') {
        expression = `0 ${hour} * * 1`; // every Monday
      } else if (frequency === 'monthly') {
        expression = `0 ${hour} 1 * *`; // 1st of every month
      } else {
        return reject(new Error('Invalid frequency: ' + frequency));
      }

      // 3. Create new job
      // Node absolute path might vary, but in a crontab it's safest to just rely on system PATH 
      // or specify explicit node. We will try `node <absolute_path>`
      const command = `node ${CLI_PATH} email send-digest`;
      const job = tab.create(command, expression, CRON_COMMENT);

      if (!job) {
        return reject(new Error('Failed to create crontab job.'));
      }

      // 4. Save
      tab.save((saveErr) => {
        if (saveErr) return reject(saveErr);
        resolve(expression);
      });
    });
  });
}

/**
 * Remove the ghnow email digest from the system crontab.
 */
export function removeCron() {
  return new Promise((resolve, reject) => {
    crontab.load((err, tab) => {
      if (err) return reject(err);

      tab.remove({ comment: CRON_COMMENT });
      tab.save((saveErr) => {
        if (saveErr) return reject(saveErr);
        resolve();
      });
    });
  });
}
