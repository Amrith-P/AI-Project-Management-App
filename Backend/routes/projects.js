import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { logActivity } from './activities.js';

const router = express.Router();

// GET all projects for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const projects = await db.all('SELECT * FROM projects WHERE ownerId = ? ORDER BY createdAt DESC', [req.user.id]);
    
    const formattedProjects = projects.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single project
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id]);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.tags = project.tags ? JSON.parse(project.tags) : [];
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, status, priority, category, visibility, startDate, endDate, tags, color } = req.body;
    const db = await getDb();
    
    const tagsString = tags ? JSON.stringify(tags) : JSON.stringify([]);
    
    const result = await db.run(`
      INSERT INTO projects (name, description, status, priority, category, visibility, ownerId, startDate, endDate, tags, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, status || 'Active', priority || 'Medium', category, visibility || 'Private', req.user.id, startDate, endDate, tagsString, color]);
    
    const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    newProject.tags = newProject.tags ? JSON.parse(newProject.tags) : [];
    
    await logActivity(req.user.id, newProject.id, 'Created Project', `Created new project "${newProject.name}"`);

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update project
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, status, priority, category, visibility, startDate, endDate, tags, color, progress } = req.body;
    const db = await getDb();
    
    const tagsString = tags ? JSON.stringify(tags) : JSON.stringify([]);
    
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await db.run(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, priority = ?, category = ?, visibility = ?, 
          startDate = ?, endDate = ?, tags = ?, color = ?, progress = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND ownerId = ?
    `, [name, description, status, priority, category, visibility, startDate, endDate, tagsString, color, progress ?? project.progress, req.params.id, req.user.id]);
    
    const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    updatedProject.tags = updatedProject.tags ? JSON.parse(updatedProject.tags) : [];
    
    await logActivity(req.user.id, updatedProject.id, 'Updated Project', `Updated project details for "${updatedProject.name}"`);

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE project
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    
    await logActivity(req.user.id, null, 'Deleted Project', `Deleted project "${project.name}"`);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
