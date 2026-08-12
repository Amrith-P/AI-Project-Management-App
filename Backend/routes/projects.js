import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { logActivity } from './activities.js';

const router = express.Router();

// GET all projects accessible to the authenticated user (owned, team member, or assigned tasks)
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    const projects = await db.all(`
      SELECT DISTINCT p.* 
      FROM projects p
      LEFT JOIN team_members tm ON tm.ownerId = p.ownerId AND (tm.userId = ? OR tm.email = ?)
      LEFT JOIN tasks t ON t.projectId = p.id AND (t.assigneeId = tm.id OR tm.userId = ? OR tm.email = ?)
      WHERE p.ownerId = ? 
         OR tm.id IS NOT NULL 
         OR t.id IS NOT NULL 
         OR p.visibility = 'Public'
      ORDER BY p.createdAt DESC
    `, [req.user.id, req.user.email, req.user.id, req.user.email, req.user.id]);
    
    const formattedProjects = projects.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching accessible projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single project details if user has access
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const project = await db.get(`
      SELECT DISTINCT p.* 
      FROM projects p
      LEFT JOIN team_members tm ON tm.ownerId = p.ownerId AND (tm.userId = ? OR tm.email = ?)
      LEFT JOIN tasks t ON t.projectId = p.id AND (t.assigneeId = tm.id OR tm.userId = ? OR tm.email = ?)
      WHERE p.id = ? AND (p.ownerId = ? OR tm.id IS NOT NULL OR t.id IS NOT NULL OR p.visibility = 'Public')
    `, [req.user.id, req.user.email, req.user.id, req.user.email, req.params.id, req.user.id]);
    
    if (!project) return res.status(404).json({ message: 'Project not found or access restricted' });
    
    project.tags = project.tags ? JSON.parse(project.tags) : [];
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET export full project report (JSON + Markdown report format)
router.get('/:id/export', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ? ORDER BY position ASC', [req.params.id]);
    const activities = await db.all('SELECT * FROM activities WHERE projectId = ? ORDER BY createdAt DESC LIMIT 20', [req.params.id]);

    const formattedTasks = tasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }));

    const markdownReport = `# Executive Project Report: ${project.name}
**Status**: ${project.status} | **Priority**: ${project.priority} | **Progress**: ${project.progress}%
**Category**: ${project.category || 'N/A'} | **Visibility**: ${project.visibility}
**Created At**: ${new Date(project.createdAt).toLocaleDateString()}

---

## 📌 Project Overview
${project.description || 'No description provided.'}

---

## 📋 Task Breakdown (${formattedTasks.length} Total Tasks)
${formattedTasks.length > 0 ? formattedTasks.map(t => `### [${t.status}] ${t.title} (${t.priority} Priority)
- **Description**: ${t.description || 'N/A'}
- **Due Date**: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Unscheduled'}
- **Estimated vs Spent**: ${t.spentHours || 0} / ${t.estimatedHours || 0} hrs
- **Checklist Progress**: ${(t.checklist || []).filter(c => c.completed).length}/${(t.checklist || []).length} items
`).join('\n') : '*No tasks in project backlog.*'}

---

## ⏱ Recent Activity Timeline
${activities.length > 0 ? activities.map(a => `- **${a.action}**: ${a.details} *(${new Date(a.createdAt).toLocaleString()})*`).join('\n') : '*No activity logged yet.*'}
`;

    res.json({
      project,
      tasks: formattedTasks,
      activities,
      markdownReport
    });
  } catch (error) {
    console.error('Project export error:', error);
    res.status(500).json({ message: 'Failed to export project report' });
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
        SELECT DISTINCT tasks.*, tm.email as assigneeEmail, u.full_name as assigneeName
        FROM tasks
        JOIN projects ON tasks.projectId = projects.id
        LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
        LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
        WHERE projects.ownerId = ? OR tm.userId = ? OR tm.email = ?
      `, [req.user.id, req.user.id, req.user.email]);
    } else {
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
    
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await db.run(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, priority = ?, category = ?, visibility = ?, 
          startDate = ?, endDate = ?, tags = ?, color = ?, progress = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, status, priority, category, visibility, startDate, endDate, tagsString, color, progress ?? project.progress, req.params.id]);
    
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
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
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
