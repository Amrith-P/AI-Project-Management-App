import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all team members for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const members = await db.all(`
      SELECT tm.*, u.full_name as name 
      FROM team_members tm
      LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
      WHERE tm.ownerId = ?
      ORDER BY tm.createdAt DESC
    `, [req.user.id]);
    
    // Quick sync: if user joined after invite, update userId and status
    for (let m of members) {
      if (m.status === 'Pending' && m.name) {
        await db.run('UPDATE team_members SET status = "Active", userId = (SELECT id FROM users WHERE email = ?) WHERE id = ?', [m.email, m.id]);
        m.status = 'Active';
      }
    }
    
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST invite a new team member
router.post('/invite', verifyToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const db = await getDb();
    
    // Check if user is trying to invite themselves
    const owner = await db.get('SELECT email FROM users WHERE id = ?', [req.user.id]);
    if (owner.email === email) {
      return res.status(400).json({ message: 'You cannot invite yourself' });
    }

    // Check if already invited
    const existing = await db.get('SELECT * FROM team_members WHERE ownerId = ? AND email = ?', [req.user.id, email]);
    if (existing) {
      return res.status(400).json({ message: 'User already invited' });
    }

    // Check if user exists in the system
    const existingUser = await db.get('SELECT id, full_name FROM users WHERE email = ?', [email]);
    const status = existingUser ? 'Active' : 'Pending';
    const userId = existingUser ? existingUser.id : null;

    const result = await db.run(`
      INSERT INTO team_members (ownerId, email, userId, role, status)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, email, userId, role || 'Member', status]);
    
    const newMember = await db.get(`
      SELECT tm.*, u.full_name as name 
      FROM team_members tm
      LEFT JOIN users u ON tm.userId = u.id
      WHERE tm.id = ?
    `, [result.lastID]);

    res.status(201).json(newMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update role
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const db = await getDb();
    
    const member = await db.get('SELECT * FROM team_members WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id]);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await db.run('UPDATE team_members SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [role, req.params.id]);
    
    res.json({ id: member.id, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE member
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const member = await db.get('SELECT * FROM team_members WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id]);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await db.run('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
