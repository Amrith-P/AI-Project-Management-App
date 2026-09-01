import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all links for a task
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const links = await db.all(
      `SELECT il.*, t.issueKey as targetIssueKey, t.title as targetTitle, t.status as targetStatus 
       FROM issue_links il 
       JOIN tasks t ON il.targetTaskId = t.id 
       WHERE il.sourceTaskId = ?`,
      [req.params.taskId]
    );
    res.json(links);
  } catch (error) {
    console.error('Error fetching issue links:', error);
    res.status(500).json({ error: 'Failed to fetch issue links' });
  }
});

// POST link two issues by issueKey or taskId
router.post('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const { targetIssueKey, linkType = 'relates to' } = req.body;
    const sourceTaskId = req.params.taskId;

    if (!targetIssueKey) {
      return res.status(400).json({ error: 'targetIssueKey is required' });
    }

    const db = await getDb();
    const targetTask = await db.get(
      'SELECT id, issueKey FROM tasks WHERE LOWER(issueKey) = LOWER(?) OR id = ?',
      [targetIssueKey.trim(), parseInt(targetIssueKey, 10) || 0]
    );

    if (!targetTask) {
      return res.status(404).json({ error: `Target issue "${targetIssueKey}" not found` });
    }

    const result = await db.run(
      `INSERT INTO issue_links (sourceTaskId, targetTaskId, linkType)
       VALUES (?, ?, ?)`,
      [sourceTaskId, targetTask.id, linkType]
    );

    const newLink = await db.get(
      `SELECT il.*, t.issueKey as targetIssueKey, t.title as targetTitle, t.status as targetStatus 
       FROM issue_links il 
       JOIN tasks t ON il.targetTaskId = t.id 
       WHERE il.id = ?`,
      [result.lastID]
    );

    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error creating issue link:', error);
    res.status(500).json({ error: 'Failed to create issue link' });
  }
});

// DELETE issue link
router.delete('/:linkId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM issue_links WHERE id = ?', [req.params.linkId]);
    res.json({ message: 'Issue link removed' });
  } catch (error) {
    console.error('Error deleting issue link:', error);
    res.status(500).json({ error: 'Failed to delete issue link' });
  }
});

export default router;
