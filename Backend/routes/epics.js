import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all epics for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const epics = await db.all(
      'SELECT * FROM epics WHERE projectId = ? ORDER BY createdAt DESC',
      [req.params.projectId]
    );

    // Calculate progress per epic based on child tasks
    const formattedEpics = [];
    for (const epic of epics) {
      const childTasks = await db.all('SELECT status FROM tasks WHERE epicId = ?', [epic.id]);
      const total = childTasks.length;
      const completed = childTasks.filter(t => t.status === 'Done').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      formattedEpics.push({
        ...epic,
        totalTasks: total,
        completedTasks: completed,
        progress,
      });
    }

    res.json(formattedEpics);
  } catch (error) {
    console.error('Error fetching epics:', error);
    res.status(500).json({ error: 'Failed to fetch epics' });
  }
});

// POST create epic
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, summary, color } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    const db = await getDb();
    const project = await db.get('SELECT key FROM projects WHERE id = ?', [projectId]);
    const epicKey = `${project?.key || 'PROJ'}-EPIC-${Date.now().toString().slice(-4)}`;

    const result = await db.run(
      `INSERT INTO epics (projectId, key, name, summary, color)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, epicKey, name, summary || '', color || '#6366f1']
    );

    const newEpic = await db.get('SELECT * FROM epics WHERE id = ?', [result.lastID]);
    res.status(201).json(newEpic);
  } catch (error) {
    console.error('Error creating epic:', error);
    res.status(500).json({ error: 'Failed to create epic' });
  }
});

export default router;
