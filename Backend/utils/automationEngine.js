import { getDb } from '../db.js';
import { createNotification } from '../routes/notifications.js';
import { logActivity } from '../routes/activities.js';

export const runAutomationEngine = async (projectId, triggerEvent, payload) => {
  try {
    const db = await getDb();
    const rules = await db.all(
      'SELECT * FROM automations WHERE projectId = ? AND isActive = 1 AND triggerEvent = ?',
      [projectId, triggerEvent]
    );

    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
      let config = {};
      try {
        config = rule.config ? JSON.parse(rule.config) : {};
      } catch (e) { /* ignore parse error */ }

      // Example Action: POST_COMMENT
      if (rule.actionType === 'POST_COMMENT' && payload.taskId) {
        const commentText = config.commentText || `🤖 Automation Triggered: [${rule.triggerEvent}] executed successfully.`;
        await db.run(
          'INSERT INTO task_comments (taskId, userId, comment) VALUES (?, ?, ?)',
          [payload.taskId, payload.userId || 1, commentText]
        );
        await logActivity(payload.userId || 1, projectId, 'Automation Triggered', `Rule #${rule.id} posted comment on task #${payload.taskId}`);
      }

      // Example Action: SEND_NOTIFICATION
      if (rule.actionType === 'SEND_NOTIFICATION' && payload.userId) {
        await createNotification(
          payload.userId,
          '⚡ Automation Alert',
          config.message || `Automation rule "${rule.triggerEvent}" triggered on your task.`,
          'info',
          `/projects/${projectId}`
        );
      }
    }
  } catch (err) {
    console.error('Error running automation engine:', err);
  }
};
