import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all components for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const components = await db.all(
      `SELECT c.*, u.full_name as leadName 
       FROM components c 
       LEFT JOIN users u ON c.leadId = u.id 
       WHERE c.projectId = ? 
       ORDER BY c.name ASC`,
      [req.params.projectId]
    );

    const formattedComponents = [];
    for (const comp of components) {
      const childTasks = await db.all('SELECT id FROM tasks WHERE componentId = ?', [comp.id]);
      formattedComponents.push({
        ...comp,
        taskCount: childTasks.length,
      });
    }

    res.json(formattedComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// POST create component
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, description, leadId } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO components (projectId, name, description, leadId)
       VALUES (?, ?, ?, ?)`,
      [projectId, name, description || '', leadId || null]
    );

    const newComponent = await db.get('SELECT * FROM components WHERE id = ?', [result.lastID]);
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

export default router;
