import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

export const createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO notifications (userId, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, type, link]
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// GET notifications for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const notifications = await db.all(
      `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run(
      `UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
});

// Mark all as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run(
      `UPDATE notifications SET isRead = 1 WHERE userId = ?`,
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run(
      `DELETE FROM notifications WHERE id = ? AND userId = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error deleting notification' });
  }
});

export default router;
