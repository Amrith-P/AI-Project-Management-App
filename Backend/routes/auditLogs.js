import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Audit log recorder helper
export const logAudit = async (userId, userName, action, entityType, entityId, details) => {
  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO audit_logs (userId, userName, action, entityType, entityId, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, userName || 'System', action, entityType || null, entityId || null, details || '']
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

// GET all audit logs (for Admins / Managers)
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(
      'SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 100'
    );
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
