import express from 'express';
import crypto from 'crypto';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all API keys for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const keys = await db.all(
      'SELECT id, name, keyPrefix, scopes, lastUsedAt, createdAt FROM api_keys WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );

    const formattedKeys = keys.map(k => ({
      ...k,
      scopes: k.scopes ? JSON.parse(k.scopes) : ['read', 'write']
    }));

    res.json(formattedKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// POST generate new API Key
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, scopes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    // Generate secure random PAT token (e.g. pat_9f8a3b...)
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `pat_${randomBytes}`;
    const keyPrefix = rawKey.substring(0, 10) + '...';
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const scopesJson = JSON.stringify(scopes || ['read', 'write']);

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO api_keys (userId, name, keyHash, keyPrefix, scopes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, keyHash, keyPrefix, scopesJson]
    );

    const newRecord = await db.get('SELECT id, name, keyPrefix, scopes, createdAt FROM api_keys WHERE id = ?', [result.lastID]);

    // Return raw secret key ONLY ONCE upon creation
    res.status(201).json({
      ...newRecord,
      scopes: JSON.parse(newRecord.scopes),
      rawKey // The client must copy this immediately
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// DELETE revoke API Key
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM api_keys WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;
