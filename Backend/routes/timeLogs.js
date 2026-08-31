import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET time logs for a specific task or user
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(
      `SELECT ttl.*, u.full_name as userName 
       FROM task_time_logs ttl 
       LEFT JOIN users u ON ttl.userId = u.id 
       WHERE ttl.taskId = ? 
       ORDER BY ttl.createdAt DESC`,
      [req.params.taskId]
    );
    res.json(logs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

// GET analytics summary report of billable hours per project
router.get('/analytics/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(
      `SELECT ttl.*, t.title as taskTitle, u.full_name as userName 
       FROM task_time_logs ttl 
       JOIN tasks t ON ttl.taskId = t.id 
       LEFT JOIN users u ON ttl.userId = u.id 
       WHERE t.projectId = ?`,
      [req.params.projectId]
    );

    const totalMinutes = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const billableMinutes = logs
      .filter((l) => l.isBillable === 1)
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const nonBillableMinutes = totalMinutes - billableMinutes;

    res.json({
      totalHours: (totalMinutes / 60).toFixed(1),
      billableHours: (billableMinutes / 60).toFixed(1),
      nonBillableHours: (nonBillableMinutes / 60).toFixed(1),
      logsCount: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Error fetching time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch time analytics' });
  }
});

// POST log time on a task
router.post('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const { durationMinutes, description, isBillable = 1 } = req.body;
    const taskId = req.params.taskId;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({ error: 'Valid durationMinutes is required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO task_time_logs (taskId, userId, durationMinutes, description, isBillable)
       VALUES (?, ?, ?, ?, ?)`,
      [taskId, req.user.id, durationMinutes, description || '', isBillable ? 1 : 0]
    );

    // Also update spentHours on task
    const allTaskLogs = await db.all(
      'SELECT SUM(durationMinutes) as totalMins FROM task_time_logs WHERE taskId = ?',
      [taskId]
    );
    const totalSpentHours = (allTaskLogs[0]?.totalMins || 0) / 60;
    await db.run('UPDATE tasks SET spentHours = ? WHERE id = ?', [totalSpentHours, taskId]);

    const newLog = await db.get('SELECT * FROM task_time_logs WHERE id = ?', [result.lastID]);
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error logging time:', error);
    res.status(500).json({ error: 'Failed to log time' });
  }
});

export default router;
