import { select, input, password, checkbox } from '@inquirer/prompts';
import { getConfig, saveConfig } from '../email/config.js';
import { setupCron, removeCron } from '../email/cron.js';
import { sendEmailDigest } from '../email/send.js';
import chalk from 'chalk';

/**
 * Interactive setup flow for email digest
 */
export async function emailSetupCommand() {
  console.log(chalk.bold.blue('\n📧 ghnow Email Digest Setup'));
  console.log(chalk.gray('────────────────────────────\n'));

  try {
    const provider = await select({
      message: 'Email provider:',
      choices: [
        { name: 'SMTP (Gmail, custom server, etc.)', value: 'smtp' },
        { name: 'API (Resend — resend.com)', value: 'resend' },
      ],
    });

    let smtp = {};
    let resend = {};

    if (provider === 'smtp') {
      smtp.host = await input({ message: 'SMTP host (e.g., smtp.gmail.com):', default: 'smtp.gmail.com' });
      const portInput = await input({ message: 'SMTP port (e.g., 587 or 465):', default: '587' });
      smtp.port = parseInt(portInput, 10);
      smtp.user = await input({ message: 'SMTP user (your email):' });
      smtp.pass = await password({ message: 'SMTP password (use an app password for Gmail):' });
      smtp.secure = smtp.port === 465;
    } else {
      resend.apiKey = await password({ message: 'Resend API Key (starts with re_):' });
    }

    const recipient = await input({ message: 'Recipient email address:' });

    const content = await checkbox({
      message: 'What to include in the digest:',
      choices: [
        { name: 'Trending Repositories', value: 'repos', checked: true },
        { name: 'Trending Developers', value: 'devs', checked: true },
      ],
      validate: (ans) => ans.length > 0 || 'You must select at least one option.',
    });

    const language = await input({ message: 'Language filter (leave blank for all):' });

    const frequency = await select({
      message: 'Frequency:',
      choices: [
        { name: 'Daily (8:00 AM)', value: 'daily' },
        { name: 'Weekly (Monday 8:00 AM)', value: 'weekly' },
        { name: 'Monthly (1st of month 8:00 AM)', value: 'monthly' },
      ],
    });

    // Save configuration
    const newConfig = {
      provider,
      smtp,
      resend,
      recipient,
      content,
      language: language.trim() === '' ? null : language.trim(),
      frequency,
      enabled: true,
    };

    saveConfig({ email: newConfig });
    console.log(chalk.green('\n✔ Config saved to ~/.ghnow/config.json'));

    // Setup cron job (Linux/macOS only)
    try {
      if (process.platform === 'win32') {
        console.log(chalk.yellow('\n⚠ Note: Automatic cron scheduling is not supported on Windows.'));
        console.log(chalk.yellow(`  Please set up Task Scheduler to run: node bin/ghnow.js email send-digest`));
      } else {
        const expression = await setupCron(frequency);
        console.log(chalk.green(`✔ Cron job created: runs on '${expression}' schedule`));
      }
    } catch (err) {
      console.log(chalk.red(`\n✖ Failed to setup cron job: ${err.message}`));
      console.log(chalk.gray(`  Please ensure 'crontab' is available on your system.`));
    }

    console.log(chalk.blue('\nSending a test email...'));
    try {
      await sendEmailDigest();
      console.log(chalk.green('✔ Test email sent — check your inbox!'));
    } catch (err) {
      console.log(chalk.red(`✖ Failed to send test email: ${err.message}`));
      console.log(chalk.gray('  Please check your provider configuration and try running "ghnow email test" again later.'));
    }

  } catch (err) {
    if (err.name === 'ExitPromptError') {
       console.log(chalk.gray('\nSetup cancelled.'));
    } else {
       console.error(chalk.red('\nAn error occurred during setup:'), err);
    }
  }
}

/**
 * Send a test digest email right now
 */
export async function emailTestCommand() {
  console.log(chalk.blue('Sending test email digest...'));
  try {
    await sendEmailDigest();
    console.log(chalk.green('✔ Email sent successfully! Check your inbox.'));
  } catch (err) {
    console.error(chalk.red(`✖ Failed to send email: ${err.message}`));
    console.log(chalk.gray('Run "ghnow email setup" to configure your provider settings.'));
  }
}

/**
 * Display current email digest configuration
 */
export async function emailStatusCommand() {
  const appConfig = getConfig();
  const emailConfig = appConfig?.email;

  console.log(chalk.bold.blue('\n📧 Email Digest Status'));
  console.log(chalk.gray('──────────────────────'));

  if (!emailConfig || !emailConfig.enabled) {
    console.log(chalk.yellow('Status: Disabled (Run "ghnow email setup" to enable)'));
    return;
  }

  console.log(`Provider:     ${chalk.green(emailConfig.provider.toUpperCase())}`);
  if (emailConfig.provider === 'smtp') {
    console.log(`SMTP Host:    ${emailConfig.smtp.host}`);
  }
  console.log(`Recipient:    ${emailConfig.recipient}`);
  console.log(`Content:      ${emailConfig.content.join(' + ')}`);
  console.log(`Language:     ${emailConfig.language || 'All'}`);
  console.log(`Frequency:    ${emailConfig.frequency.charAt(0).toUpperCase() + emailConfig.frequency.slice(1)}`);
  console.log(`Last sent:    ${emailConfig.lastSent ? new Date(emailConfig.lastSent).toLocaleString() : 'Never'}`);
  console.log(`Cron active:  ${chalk.green('✔ Yes')}`);
  console.log();
}

/**
 * Disable email digest and remove cron job
 */
export async function emailDisableCommand() {
  try {
    if (process.platform !== 'win32') {
      await removeCron();
      console.log(chalk.green('✔ Cron job removed.'));
    }

    const appConfig = getConfig() || {};
    if (appConfig.email) {
      appConfig.email.enabled = false;
      saveConfig(appConfig);
      console.log(chalk.green("✔ Email digest disabled (config preserved — run 'ghnow email setup' to re-enable)"));
    } else {
      console.log(chalk.gray('Email digest is not configured.'));
    }
  } catch (err) {
    console.error(chalk.red(`✖ Error disabling email digest: ${err.message}`));
  }
}

/**
 * Hidden command invoked by cron to fetch and send digest
 */
export async function emailSendDigestCommand() {
  try {
    await sendEmailDigest();
  } catch (err) {
    console.error(`Failed to send automated digest: ${err.message}`);
    process.exit(1);
  }
}
