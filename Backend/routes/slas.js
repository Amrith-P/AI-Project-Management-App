import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET SLAs for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const slas = await db.all(
      'SELECT * FROM slas WHERE projectId = ? ORDER BY createdAt DESC',
      [req.params.projectId]
    );

    if (!slas || slas.length === 0) {
      // Default SLA rules if none configured yet
      return res.json([
        { id: 1, projectId: Number(req.params.projectId), issueType: 'Bug', priority: 'Urgent', responseHours: 1, resolutionHours: 4 },
        { id: 2, projectId: Number(req.params.projectId), issueType: 'Bug', priority: 'High', responseHours: 4, resolutionHours: 24 },
        { id: 3, projectId: Number(req.params.projectId), issueType: 'Task', priority: 'High', responseHours: 8, resolutionHours: 48 },
        { id: 4, projectId: Number(req.params.projectId), issueType: 'Bug', priority: 'Medium', responseHours: 12, resolutionHours: 72 }
      ]);
    }

    res.json(slas);
  } catch (error) {
    console.error('Error fetching SLAs:', error);
    res.status(500).json({ error: 'Failed to fetch SLAs' });
  }
});

// POST create / update SLA rule
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, issueType, priority, responseHours, resolutionHours } = req.body;
    if (!projectId || !issueType || !priority) {
      return res.status(400).json({ error: 'projectId, issueType, and priority are required' });
    }

    const db = await getDb();
    const existing = await db.get(
      'SELECT id FROM slas WHERE projectId = ? AND issueType = ? AND priority = ?',
      [projectId, issueType, priority]
    );

    if (existing) {
      await db.run(
        `UPDATE slas SET responseHours = ?, resolutionHours = ? WHERE id = ?`,
        [responseHours || 4, resolutionHours || 24, existing.id]
      );
    } else {
      await db.run(
        `INSERT INTO slas (projectId, issueType, priority, responseHours, resolutionHours)
         VALUES (?, ?, ?, ?, ?)`,
        [projectId, issueType, priority, responseHours || 4, resolutionHours || 24]
      );
    }

    const slas = await db.all('SELECT * FROM slas WHERE projectId = ?', [projectId]);
    res.status(201).json(slas);
  } catch (error) {
    console.error('Error saving SLA rule:', error);
    res.status(500).json({ error: 'Failed to save SLA rule' });
  }
});

export default router;
