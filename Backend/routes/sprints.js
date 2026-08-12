import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { logActivity } from './activities.js';

const router = express.Router();

// GET all sprints for a project
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const sprints = await db.all(
      'SELECT * FROM sprints WHERE projectId = ? ORDER BY startDate ASC',
      [req.params.projectId]
    );

    // Attach task metrics per sprint
    const enriched = [];
    for (const s of sprints) {
      const tasks = await db.all('SELECT status FROM tasks WHERE sprintId = ?', [s.id]);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Done').length;
      enriched.push({ ...s, totalTasks, completedTasks });
    }

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ message: 'Failed to fetch sprints' });
  }
});

// POST create sprint
router.post('/:projectId', verifyToken, async (req, res) => {
  try {
    const { name, startDate, endDate, goal } = req.body;
    if (!name) return res.status(400).json({ message: 'Sprint name is required' });

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO sprints (projectId, name, startDate, endDate, goal, status)
      VALUES (?, ?, ?, ?, ?, 'Planning')
    `, [req.params.projectId, name, startDate, endDate, goal || '']);

    const newSprint = await db.get('SELECT * FROM sprints WHERE id = ?', [result.lastID]);
    await logActivity(req.user.id, req.params.projectId, 'Created Sprint', `Created sprint "${name}"`);

    res.status(201).json(newSprint);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ message: 'Failed to create sprint' });
  }
});

// PUT update sprint status or dates
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, startDate, endDate, status, goal } = req.body;
    const db = await getDb();
    const sprint = await db.get('SELECT * FROM sprints WHERE id = ?', [req.params.id]);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

    await db.run(`
      UPDATE sprints 
      SET name = ?, startDate = ?, endDate = ?, status = ?, goal = ?
      WHERE id = ?
    `, [
      name || sprint.name,
      startDate !== undefined ? startDate : sprint.startDate,
      endDate !== undefined ? endDate : sprint.endDate,
      status || sprint.status,
      goal !== undefined ? goal : sprint.goal,
      req.params.id
    ]);

    const updated = await db.get('SELECT * FROM sprints WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ message: 'Failed to update sprint' });
  }
});

export default router;
