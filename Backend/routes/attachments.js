import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { logActivity } from './activities.js';

const router = express.Router();

// GET all attachments for a task
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const attachments = await db.all(`
      SELECT ta.*, u.full_name as uploaderName 
      FROM task_attachments ta
      LEFT JOIN users u ON ta.userId = u.id
      WHERE ta.taskId = ?
      ORDER BY ta.createdAt DESC
    `, [req.params.taskId]);
    res.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ message: 'Failed to fetch attachments' });
  }
});

// POST upload new attachment metadata
router.post('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const { fileName, fileSize, fileType, fileUrl } = req.body;
    if (!fileName) {
      return res.status(400).json({ message: 'fileName is required' });
    }

    const db = await getDb();
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const result = await db.run(`
      INSERT INTO task_attachments (taskId, userId, fileName, fileSize, fileType, fileUrl)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.params.taskId,
      req.user.id,
      fileName,
      fileSize || 1024,
      fileType || 'application/octet-stream',
      fileUrl || '#'
    ]);

    const newAttachment = await db.get(`
      SELECT ta.*, u.full_name as uploaderName 
      FROM task_attachments ta
      LEFT JOIN users u ON ta.userId = u.id
      WHERE ta.id = ?
    `, [result.lastID]);

    await logActivity(req.user.id, task.projectId, 'Uploaded Attachment', `Attached "${fileName}" to task "${task.title}"`);

    res.status(201).json(newAttachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Failed to save attachment' });
  }
});

// DELETE attachment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const attachment = await db.get('SELECT * FROM task_attachments WHERE id = ?', [req.params.id]);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    await db.run('DELETE FROM task_attachments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Failed to delete attachment' });
  }
});

export default router;
