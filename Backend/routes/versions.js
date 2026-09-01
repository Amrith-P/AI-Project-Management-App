import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all releases/versions for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const versions = await db.all(
      'SELECT * FROM versions WHERE projectId = ? ORDER BY createdAt DESC',
      [req.params.projectId]
    );

    const formattedVersions = [];
    for (const v of versions) {
      const childTasks = await db.all('SELECT status FROM tasks WHERE versionId = ?', [v.id]);
      const total = childTasks.length;
      const completed = childTasks.filter(t => t.status === 'Done').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      formattedVersions.push({
        ...v,
        totalTasks: total,
        completedTasks: completed,
        progress,
      });
    }

    res.json(formattedVersions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// POST create version
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, description, startDate, releaseDate, status } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO versions (projectId, name, description, startDate, releaseDate, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, name, description || '', startDate || null, releaseDate || null, status || 'Unreleased']
    );

    const newVersion = await db.get('SELECT * FROM versions WHERE id = ?', [result.lastID]);
    res.status(201).json(newVersion);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

export default router;
