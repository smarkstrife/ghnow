import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { fetchTrendingRepos } from '../scraper/trending.js';
import { fetchTrendingDevelopers } from '../scraper/developers.js';
import { generateHtmlDigest } from './template.js';
import { getConfig, saveConfig } from './config.js';

/**
 * Gather data and send the email digest based on user config.
 */
export async function sendEmailDigest() {
  const appConfig = getConfig();
  const emailConfig = appConfig?.email;

  if (!emailConfig || !emailConfig.enabled || !emailConfig.provider || !emailConfig.recipient) {
    throw new Error('Email digest is not configured or is disabled. Run "ghnow email setup".');
  }

  const { provider, smtp, resend, recipient, content, language, frequency } = emailConfig;
  
  // Since parameter maps slightly differently to GitHub options
  // ghnow internal is 'daily', 'weekly', 'monthly'. GitHub is 'daily', 'weekly', 'monthly'.
  let repos = [];
  let devs = [];

  // 1. Fetch data
  if (content.includes('repos')) {
    try {
      repos = await fetchTrendingRepos({ language, since: frequency });
    } catch (e) {
      console.error('Failed to fetch trending repos for email:', e.message);
    }
  }

  if (content.includes('devs')) {
    try {
      devs = await fetchTrendingDevelopers({ language, since: frequency });
    } catch (e) {
      console.error('Failed to fetch trending devs for email:', e.message);
    }
  }

  if (repos.length === 0 && devs.length === 0) {
    console.warn('No trending data found to send.');
    // Optional: throw or return early? We'll send an empty state email as proof it ran.
  }

  // 2. Generate HTML
  const htmlResult = generateHtmlDigest(repos, devs, emailConfig);
  
  const subjectPrefix = frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Monthly';
  const subject = `[ghnow] Your ${subjectPrefix} GitHub Trending Digest 🔥`;

  // 3. Send Email
  if (provider === 'smtp') {
    await sendViaSmtp(smtp, recipient, subject, htmlResult);
  } else if (provider === 'resend') {
    await sendViaResend(resend.apiKey, recipient, subject, htmlResult);
  } else {
    throw new Error(`Unknown email provider: ${provider}`);
  }

  // 4. Update config lastSent
  emailConfig.lastSent = new Date().toISOString();
  saveConfig({ email: emailConfig });
  
  return true;
}

async function sendViaSmtp(smtpConfig, to, subject, html) {
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    throw new Error('SMTP configuration is incomplete.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: parseInt(smtpConfig.port, 10),
    secure: smtpConfig.secure || (parseInt(smtpConfig.port, 10) === 465), 
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  await transporter.sendMail({
    from: `"ghnow CLI" <${smtpConfig.user}>`,
    to,
    subject,
    html,
  });
}

async function sendViaResend(apiKey, to, subject, html) {
  if (!apiKey) {
    throw new Error('Resend API key is missing.');
  }

  const resend = new Resend(apiKey);
  
  const { data, error } = await resend.emails.send({
    from: 'ghnow <onboarding@resend.dev>', // Default Resend testing domain
    to: [to],
    subject: subject,
    html: html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}
