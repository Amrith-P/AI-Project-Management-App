import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET all tasks for logged-in user across all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    
    // Join tasks with projects to ensure user is the owner, and also fetch project name
    const tasks = await db.all(`
      SELECT tasks.*, projects.name as projectName 
      FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      WHERE projects.ownerId = ? 
      ORDER BY tasks.updatedAt DESC
    `, [req.user.id]);
    
    const parsedTasks = tasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : []
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
    
    // Check if user has access to the project
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ? ORDER BY position ASC', [req.params.projectId]);
    
    // Parse labels back to array
    const parsedTasks = tasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : []
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
    const { title, description, status, priority, labels } = req.body;
    const db = await getDb();
    
    // Check if user has access to the project
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Get max position for the new task
    const currentMax = await db.get('SELECT MAX(position) as maxPos FROM tasks WHERE projectId = ? AND status = ?', [req.params.projectId, status || 'Todo']);
    const newPosition = (currentMax.maxPos || 0) + 1;
    const labelsStr = labels ? JSON.stringify(labels) : null;

    const result = await db.run(`
      INSERT INTO tasks (projectId, title, description, status, position, priority, labels)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.params.projectId, title, description, status || 'Todo', newPosition, priority || 'Medium', labelsStr]);
    
    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    if (newTask.labels) newTask.labels = JSON.parse(newTask.labels);
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update task details
router.put('/detail/:taskId', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, labels } = req.body;
    const db = await getDb();
    
    // Get task and verify project ownership
    const task = await db.get(`
      SELECT tasks.* FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      WHERE tasks.id = ? AND projects.ownerId = ?
    `, [req.params.taskId, req.user.id]);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const labelsStr = labels ? JSON.stringify(labels) : task.labels;

    await db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, labels = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || task.title, 
      description !== undefined ? description : task.description, 
      status || task.status, 
      priority || task.priority,
      labelsStr,
      req.params.taskId
    ]);
    
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (updatedTask.labels) updatedTask.labels = JSON.parse(updatedTask.labels);
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update task positions (bulk)
router.put('/:projectId/positions', verifyToken, async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, status, position }
    const db = await getDb();
    
    // Verify project ownership
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [req.params.projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Use a transaction for bulk update
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
    
    // Verify project ownership
    const task = await db.get(`
      SELECT tasks.* FROM tasks 
      JOIN projects ON tasks.projectId = projects.id 
      WHERE tasks.id = ? AND projects.ownerId = ?
    `, [req.params.taskId, req.user.id]);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
