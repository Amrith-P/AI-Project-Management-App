import crypto from 'crypto';
import { getDb } from '../db.js';

export const verifyApiKey = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer pat_')) {
    return next(); // Fallback to JWT or standard verifyToken
  }

  const rawKey = authHeader.split(' ')[1];
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  try {
    const db = await getDb();
    const apiKeyRecord = await db.get('SELECT * FROM api_keys WHERE keyHash = ?', [keyHash]);

    if (!apiKeyRecord) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const user = await db.get('SELECT id, full_name, email, role FROM users WHERE id = ?', [apiKeyRecord.userId]);
    if (!user) {
      return res.status(401).json({ error: 'Associated user account not found' });
    }

    // Update lastUsedAt timestamp asynchronously
    db.run('UPDATE api_keys SET lastUsedAt = CURRENT_TIMESTAMP WHERE id = ?', [apiKeyRecord.id]).catch(() => {});

    req.user = user;
    req.apiKey = apiKeyRecord;
    next();
  } catch (error) {
    console.error('API Key verification error:', error);
    res.status(500).json({ error: 'Internal auth error' });
  }
};
