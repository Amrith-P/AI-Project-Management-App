import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

export const logActivity = async (ownerId, projectId, action, details) => {
  try {
    const db = await getDb();
    await db.run(`
      INSERT INTO activities (ownerId, projectId, action, details)
      VALUES (?, ?, ?, ?)
    `, [ownerId, projectId || null, action, details || '']);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// GET recent activities for the logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const activities = await db.all(`
      SELECT a.*, p.name as projectName
      FROM activities a
      LEFT JOIN projects p ON a.projectId = p.id
      WHERE a.ownerId = ?
      ORDER BY a.createdAt DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

export default router;
