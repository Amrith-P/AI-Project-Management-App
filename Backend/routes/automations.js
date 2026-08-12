import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import { logActivity } from './activities.js';

const router = express.Router();

// Helper function to trigger automation rules when events occur in the system
export const processAutomations = async (projectId, triggerEvent, context = {}) => {
  try {
    const db = await getDb();
    const rules = await db.all(
      'SELECT * FROM automations WHERE projectId = ? AND triggerEvent = ? AND isActive = 1',
      [projectId, triggerEvent]
    );

    for (const rule of rules) {
      const config = rule.config ? JSON.parse(rule.config) : {};

      if (rule.actionType === 'notify_owner') {
        const project = await db.get('SELECT ownerId, name FROM projects WHERE id = ?', [projectId]);
        if (project) {
          await createNotification(
            project.ownerId,
            `⚡ Automation Triggered: ${triggerEvent}`,
            `Automation rule fired on project "${project.name}": ${context.taskTitle || 'Task updated'}`,
            'info',
            `/projects/${projectId}`
          );
        }
      } else if (rule.actionType === 'auto_assign') {
        if (context.taskId && config.targetAssigneeId) {
          await db.run('UPDATE tasks SET assigneeId = ? WHERE id = ?', [config.targetAssigneeId, context.taskId]);
          await logActivity(context.userId || 1, projectId, 'Automation Action', `Auto-assigned task to member #${config.targetAssigneeId}`);
        }
      } else if (rule.actionType === 'auto_complete_checklist') {
        if (context.taskId) {
          await logActivity(context.userId || 1, projectId, 'Automation Action', `Auto-processed checklist rule for task #${context.taskId}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to process automations:', error);
  }
};

// GET all automation rules for a project
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const rules = await db.all(
      'SELECT * FROM automations WHERE projectId = ? ORDER BY createdAt DESC',
      [req.params.projectId]
    );
    const parsed = rules.map(r => ({ ...r, config: r.config ? JSON.parse(r.config) : {} }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ message: 'Failed to fetch automations' });
  }
});

// POST create a new automation rule
router.post('/:projectId', verifyToken, async (req, res) => {
  try {
    const { triggerEvent, actionType, config } = req.body;
    if (!triggerEvent || !actionType) {
      return res.status(400).json({ message: 'triggerEvent and actionType are required' });
    }

    const db = await getDb();
    const configStr = config ? JSON.stringify(config) : '{}';

    const result = await db.run(`
      INSERT INTO automations (projectId, triggerEvent, actionType, config)
      VALUES (?, ?, ?, ?)
    `, [req.params.projectId, triggerEvent, actionType, configStr]);

    const newRule = await db.get('SELECT * FROM automations WHERE id = ?', [result.lastID]);
    newRule.config = newRule.config ? JSON.parse(newRule.config) : {};

    await logActivity(req.user.id, req.params.projectId, 'Created Automation', `Created automation rule: ${triggerEvent} -> ${actionType}`);

    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ message: 'Failed to create automation' });
  }
});

// PUT toggle or update automation rule
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { isActive, config } = req.body;
    const db = await getDb();
    const rule = await db.get('SELECT * FROM automations WHERE id = ?', [req.params.id]);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });

    const configStr = config !== undefined ? JSON.stringify(config) : rule.config;
    const activeVal = isActive !== undefined ? (isActive ? 1 : 0) : rule.isActive;

    await db.run('UPDATE automations SET isActive = ?, config = ? WHERE id = ?', [activeVal, configStr, req.params.id]);
    const updated = await db.get('SELECT * FROM automations WHERE id = ?', [req.params.id]);
    updated.config = updated.config ? JSON.parse(updated.config) : {};

    res.json(updated);
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ message: 'Failed to update automation' });
  }
});

// DELETE automation rule
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM automations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Automation rule deleted' });
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ message: 'Failed to delete automation' });
  }
});

export default router;
