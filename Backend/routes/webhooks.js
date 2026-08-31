import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { emitToProject } from '../socket.js';
import { sendSlackNotification } from '../utils/slackNotifier.js';

const router = express.Router();

// GET all user webhooks
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const webhooks = await db.all(
      'SELECT * FROM webhooks WHERE ownerId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// POST create a new webhook subscription
router.post('/', verifyToken, async (req, res) => {
  try {
    const { provider, webhookUrl, secret, events } = req.body;
    if (!provider || !webhookUrl) {
      return res.status(400).json({ error: 'Provider and webhookUrl are required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO webhooks (ownerId, provider, webhookUrl, secret, events)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, provider, webhookUrl, secret || '', JSON.stringify(events || ['*'])]
    );

    const newWebhook = await db.get('SELECT * FROM webhooks WHERE id = ?', [result.lastID]);
    res.status(201).json(newWebhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// DELETE webhook
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM webhooks WHERE id = ? AND ownerId = ?', [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: 'Webhook removed successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// POST incoming GitHub Webhook Handler
router.post('/github', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`[Webhook: GitHub] Event: ${event}`);

    // Process commit messages or PR titles for #TASK-ID references
    let taskUpdates = [];
    if (event === 'push' && payload.commits) {
      for (const commit of payload.commits) {
        const message = commit.message || '';
        const match = message.match(/#(task-|TASK-)?(\d+)/i);
        if (match) {
          const taskId = parseInt(match[2], 10);
          const db = await getDb();
          const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);

          if (task) {
            let newStatus = task.status;
            if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('close')) {
              newStatus = 'Done';
            } else if (message.toLowerCase().includes('wip') || message.toLowerCase().includes('start')) {
              newStatus = 'Doing';
            } else {
              newStatus = 'Testing';
            }

            await db.run('UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [
              newStatus,
              taskId,
            ]);

            emitToProject(task.projectId, 'task-moved', {
              projectId: task.projectId,
              taskId,
              newStatus,
              updatedBy: `GitHub (${commit.author?.name || 'Git'})`,
            });

            // Trigger Slack Notification if configured
            sendSlackNotification(task.projectId, {
              title: `Git Commit Linked to Task #${taskId}`,
              message: `Commit "${message}" updated status to *${newStatus}*`,
            });

            taskUpdates.push({ taskId, newStatus, commit: commit.id });
          }
        }
      }
    } else if (event === 'pull_request') {
      const pr = payload.pull_request;
      const title = pr?.title || '';
      const match = title.match(/#(task-|TASK-)?(\d+)/i);

      if (match && pr.merged) {
        const taskId = parseInt(match[2], 10);
        const db = await getDb();
        const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (task) {
          await db.run('UPDATE tasks SET status = "Done", updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [taskId]);
          emitToProject(task.projectId, 'task-moved', {
            projectId: task.projectId,
            taskId,
            newStatus: 'Done',
            updatedBy: 'GitHub PR Merge',
          });
          taskUpdates.push({ taskId, newStatus: 'Done', pr: pr.number });
        }
      }
    }

    res.json({ success: true, processedTasks: taskUpdates });
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);
    res.status(500).json({ error: 'Failed to process GitHub webhook' });
  }
});

export default router;
