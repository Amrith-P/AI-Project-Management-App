import { getDb } from '../db.js';

export async function sendSlackNotification(projectId, { title, message }) {
  try {
    const db = await getDb();
    // Fetch Slack webhook registered for the project owner or system
    const webhooks = await db.all(
      `SELECT webhookUrl FROM webhooks WHERE provider = 'slack' AND isActive = 1`
    );

    if (!webhooks || webhooks.length === 0) return;

    const payload = {
      text: `🚀 *AI Project Management App Notification*\n*${title}*\n${message}`,
    };

    for (const hook of webhooks) {
      if (hook.webhookUrl) {
        fetch(hook.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((err) => console.error('[Slack Notifier Error]:', err.message));
      }
    }
  } catch (error) {
    console.error('[Slack Notifier Exception]:', error.message);
  }
}
