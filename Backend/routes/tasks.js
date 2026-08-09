import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { logActivity } from './activities.js';

const router = express.Router();

// Helper to auto-recalculate project progress %
const updateProjectProgress = async (db, projectId) => {
  try {
    const tasks = await db.all('SELECT status FROM tasks WHERE projectId = ?', [projectId]);
    if (!tasks || tasks.length === 0) {
      await db.run('UPDATE projects SET progress = 0 WHERE id = ?', [projectId]);
      return;
    }
    const completed = tasks.filter(t => t.status === 'Done').length;
    const progress = Math.round((completed / tasks.length) * 100);
    await db.run('UPDATE projects SET progress = ? WHERE id = ?', [progress, projectId]);
  } catch (err) {
    console.error('Failed to update project progress:', err);
  }
};

// GET all tasks for logged-in user across all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    const tasks = await db.all(`
      SELECT tasks.*, projects.name as projectName, tm.email as assigneeEmail, u.full_name as assigneeName
      FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
      LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
      WHERE projects.ownerId = ? 
      ORDER BY tasks.updatedAt DESC
    `, [req.user.id]);
    
    const parsedTasks = tasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }));
    
    res.json(parsedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all tasks for a project
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all(`
      SELECT tasks.*, tm.email as assigneeEmail, u.full_name as assigneeName
      FROM tasks
      LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
      LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
      WHERE tasks.projectId = ? 
      ORDER BY tasks.position ASC
    `, [req.params.projectId]);
    
    const parsedTasks = tasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }));
    
    res.json(parsedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new task
router.post('/:projectId', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours } = req.body;
    const db = await getDb();
    
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const currentMax = await db.get('SELECT MAX(position) as maxPos FROM tasks WHERE projectId = ? AND status = ?', [req.params.projectId, status || 'Todo']);
    const newPosition = (currentMax.maxPos || 0) + 1;
    const labelsStr = labels ? JSON.stringify(labels) : null;
    const checklistStr = checklist ? JSON.stringify(checklist) : null;

    const result = await db.run(`
      INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.params.projectId, 
      title, 
      description || '', 
      status || 'Todo', 
      newPosition, 
      priority || 'Medium', 
      labelsStr,
      assigneeId || null,
      dueDate || null,
      checklistStr,
      estimatedHours || 0,
      spentHours || 0
    ]);
    
    await updateProjectProgress(db, req.params.projectId);
    await logActivity(req.user.id, project.id, 'Created Task', `Created task "${title}" in ${project.name}`);

    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    if (newTask.labels) newTask.labels = JSON.parse(newTask.labels);
    if (newTask.checklist) newTask.checklist = JSON.parse(newTask.checklist);

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update task details
router.put('/detail/:taskId', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours } = req.body;
    const db = await getDb();
    
    const task = await db.get(`
      SELECT tasks.*, projects.name as projectName FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      WHERE tasks.id = ? AND projects.ownerId = ?
    `, [req.params.taskId, req.user.id]);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const labelsStr = labels !== undefined ? JSON.stringify(labels) : task.labels;
    const checklistStr = checklist !== undefined ? JSON.stringify(checklist) : task.checklist;

    await db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, labels = ?, 
          assigneeId = ?, dueDate = ?, checklist = ?, estimatedHours = ?, spentHours = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || task.title, 
      description !== undefined ? description : task.description, 
      status || task.status, 
      priority || task.priority,
      labelsStr,
      assigneeId !== undefined ? assigneeId : task.assigneeId,
      dueDate !== undefined ? dueDate : task.dueDate,
      checklistStr,
      estimatedHours !== undefined ? estimatedHours : task.estimatedHours,
      spentHours !== undefined ? spentHours : task.spentHours,
      req.params.taskId
    ]);
    
    await updateProjectProgress(db, task.projectId);

    if (status && status !== task.status) {
      await logActivity(req.user.id, task.projectId, 'Task Status Changed', `Moved "${task.title}" to ${status}`);
    }

    const updatedTask = await db.get(`
      SELECT tasks.*, tm.email as assigneeEmail, u.full_name as assigneeName
      FROM tasks
      LEFT JOIN team_members tm ON tasks.assigneeId = tm.id
      LEFT JOIN users u ON tm.userId = u.id OR tm.email = u.email
      WHERE tasks.id = ?
    `, [req.params.taskId]);

    if (updatedTask.labels) updatedTask.labels = JSON.parse(updatedTask.labels);
    if (updatedTask.checklist) updatedTask.checklist = JSON.parse(updatedTask.checklist);

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update task positions (bulk)
router.put('/:projectId/positions', verifyToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    const db = await getDb();
    
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await db.run('BEGIN TRANSACTION');
    try {
      for (const task of tasks) {
        await db.run(`
          UPDATE tasks 
          SET status = ?, position = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND projectId = ?
        `, [task.status, task.position, task.id, req.params.projectId]);
      }
      await db.run('COMMIT');

      await updateProjectProgress(db, req.params.projectId);
      res.json({ message: 'Positions updated successfully' });
    } catch (txError) {
      await db.run('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a task
router.delete('/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    const task = await db.get(`
      SELECT tasks.* FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      WHERE tasks.id = ? AND projects.ownerId = ?
    `, [req.params.taskId, req.user.id]);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
    await updateProjectProgress(db, task.projectId);
    await logActivity(req.user.id, task.projectId, 'Deleted Task', `Deleted task "${task.title}"`);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET comments for a task
router.get('/comments/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const comments = await db.all(`
      SELECT tc.*, u.full_name as userName, u.email as userEmail
      FROM task_comments tc
      JOIN users u ON tc.userId = u.id
      WHERE tc.taskId = ?
      ORDER BY tc.createdAt ASC
    `, [req.params.taskId]);

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST comment on a task
router.post('/comments/:taskId', verifyToken, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO task_comments (taskId, userId, comment)
      VALUES (?, ?, ?)
    `, [req.params.taskId, req.user.id, comment.trim()]);

    const newComment = await db.get(`
      SELECT tc.*, u.full_name as userName, u.email as userEmail
      FROM task_comments tc
      JOIN users u ON tc.userId = u.id
      WHERE tc.id = ?
    `, [result.lastID]);

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE comment
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const comment = await db.get('SELECT * FROM task_comments WHERE id = ? AND userId = ?', [req.params.commentId, req.user.id]);
    if (!comment) return res.status(404).json({ message: 'Comment not found or unauthorized' });

    await db.run('DELETE FROM task_comments WHERE id = ?', [req.params.commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
