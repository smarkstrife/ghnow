# Email Digest Guide & Verification

This guide outlines exactly what you can test to fully verify the `ghnow email` feature, along with real-world examples of how it can be configured.

## 1. Verify Configuration (`ghnow email status`)

After running setup, you can check that your choices were saved correctly.

**Test Command:**
```bash
ghnow email status
```
**Expected Outcome:** 
You should see a highlighted output showing your provider (SMTP/API), recipient, content preferences (Repos, Devs), language (if any), frequency, and whether the cron job is active.

## 2. Verify Manual Sending (`ghnow email test`)

If you want to receive an email immediately without waiting for the schedule, you can force a test run.

**Test Command:**
```bash
ghnow email test
```
**Expected Outcome:** 
"✔ Email sent successfully! Check your inbox."
You should receive an email with the `[ghnow] Your Daily/Weekly/Monthly GitHub Trending Digest 🔥` subject line.

## 3. Verify System Schedule (Cron)

When you choose a frequency (Daily, Weekly, Monthly), `ghnow` registers a background system task using `crontab`. You can verify this task was registered successfully.

**Test Command:**
```bash
crontab -l | grep ghnow
```
**Expected Outcome (depending on frequency):**
- Daily: `0 8 * * * node /path/to/bin/ghnow.js email send-digest # ghnow-digest`
- Weekly: `0 8 * * 1 node /path/to/bin/ghnow.js email send-digest # ghnow-digest`
- Monthly: `0 8 1 * * node /path/to/bin/ghnow.js email send-digest # ghnow-digest`

*(To view your entire cron list without filtering, run just `crontab -l`)*

## 4. Verify Disabling (`ghnow email disable`)

When you want to stop receiving emails, you can easily disable the digest. This preserves your config (so you don't have to re-enter SMTP details later) but completely stops the emails and removes the background task.

**Test Commands:**
```bash
ghnow email disable
crontab -l | grep ghnow
ghnow email status
```
**Expected Outcome:** 
1. `disable` should report success: "✔ Cron job removed." and "✔ Email digest disabled".
2. `crontab -l | grep ghnow` should return nothing (job removed).
3. `status` should state: "Status: Disabled (Run 'ghnow email setup' to enable)".

---

## Real-World Configuration Examples

When you run `ghnow email setup`, you can tune it for exactly what you care about.

### Example A: The AI Researcher (Python Only)
- **Use Case:** You only care about AI/ML repositories and developers.
- **Provider:** SMTP
- **Content:** ☑ Trending Repos, ☑ Trending Developers
- **Language Filter:** `python`
- **Frequency:** `Weekly`
- **Result:** Every Monday at 8 AM, you get an email with the top Python repos and devs from the past week.

### Example B: The JavaScript UI Dev
- **Use Case:** You build web apps and want to see the hottest new frontend tools.
- **Provider:** Resend API
- **Content:** ☑ Trending Repos (Leave Devs unchecked)
- **Language Filter:** `javascript` (or `typescript`)
- **Frequency:** `Daily`
- **Result:** Every day at 8 AM, you get a clean list of the top JS/TS repositories from that day.

### Example C: The Polyglot Tech Lead
- **Use Case:** You want to keep a pulse on the general tech ecosystem without language bias.
- **Provider:** SMTP
- **Content:** ☑ Trending Repos, ☑ Trending Developers
- **Language Filter:** *(Leave blank)*
- **Frequency:** `Monthly`
- **Result:** On the 1st of every month at 8 AM, you get a high-level digest of the absolute biggest repos and devs across all of GitHub for that month.
