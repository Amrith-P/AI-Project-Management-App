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

// GET analytics for a specific project or all user projects
router.get('/:id/analytics', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const projectId = req.params.id;

    let tasks = [];
    if (projectId === 'all') {
      tasks = await db.all(`
        SELECT tasks.*, tm.email as assigneeEmail, u.full_name as assigneeName
        FROM tasks
        JOIN projects ON tasks.projectId = projects.id
        LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
        LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
        WHERE projects.ownerId = ?
      `, [req.user.id]);
    } else {
      const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      tasks = await db.all(`
        SELECT tasks.*, tm.email as assigneeEmail, u.full_name as assigneeName
        FROM tasks
        LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
        LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
        WHERE tasks.projectId = ?
      `, [projectId]);
    }

    const totalTasks = tasks.length;
    const statusCounts = { Todo: 0, Doing: 0, Testing: 0, Done: 0 };
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    let totalEstimated = 0;
    let totalSpent = 0;
    const assigneeMap = {};

    tasks.forEach(t => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
      totalEstimated += t.estimatedHours || 0;
      totalSpent += t.spentHours || 0;

      const assigneeKey = t.assigneeName || t.assigneeEmail || 'Unassigned';
      if (!assigneeMap[assigneeKey]) {
        assigneeMap[assigneeKey] = { name: assigneeKey, total: 0, completed: 0, spentHours: 0 };
      }
      assigneeMap[assigneeKey].total++;
      if (t.status === 'Done') assigneeMap[assigneeKey].completed++;
      assigneeMap[assigneeKey].spentHours += t.spentHours || 0;
    });

    const completionRate = totalTasks > 0 ? Math.round((statusCounts.Done / totalTasks) * 100) : 0;
    const assigneeWorkload = Object.values(assigneeMap);

    res.json({
      totalTasks,
      statusCounts,
      priorityCounts,
      completionRate,
      totalEstimated,
      totalSpent,
      assigneeWorkload
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
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
