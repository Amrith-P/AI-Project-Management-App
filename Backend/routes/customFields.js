import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET custom fields for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const fields = await db.all(
      'SELECT * FROM custom_fields WHERE projectId = ? ORDER BY createdAt ASC',
      [req.params.projectId]
    );

    const parsedFields = fields.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : []
    }));

    res.json(parsedFields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// POST create custom field
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, fieldType = 'Text', options = [] } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId and name are required' });
    }

    const db = await getDb();
    const optionsStr = JSON.stringify(options);

    const result = await db.run(
      `INSERT INTO custom_fields (projectId, name, fieldType, options)
       VALUES (?, ?, ?, ?)`,
      [projectId, name, fieldType, optionsStr]
    );

    const newField = await db.get('SELECT * FROM custom_fields WHERE id = ?', [result.lastID]);
    newField.options = newField.options ? JSON.parse(newField.options) : [];

    res.status(201).json(newField);
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// GET task custom field values
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const values = await db.all(
      `SELECT val.*, cf.name as fieldName, cf.fieldType, cf.options
       FROM task_custom_field_values val
       JOIN custom_fields cf ON val.fieldId = cf.id
       WHERE val.taskId = ?`,
      [req.params.taskId]
    );

    const parsedValues = values.map(v => ({
      ...v,
      options: v.options ? JSON.parse(v.options) : []
    }));

    res.json(parsedValues);
  } catch (error) {
    console.error('Error fetching task field values:', error);
    res.status(500).json({ error: 'Failed to fetch custom field values' });
  }
});

// POST/PUT set custom field value for a task
router.post('/task/:taskId/value', verifyToken, async (req, res) => {
  try {
    const { fieldId, value } = req.body;
    const taskId = req.params.taskId;

    if (!fieldId) {
      return res.status(400).json({ error: 'fieldId is required' });
    }

    const db = await getDb();
    await db.run(
      `INSERT INTO task_custom_field_values (taskId, fieldId, value)
       VALUES (?, ?, ?)
       ON CONFLICT(taskId, fieldId) DO UPDATE SET value = excluded.value`,
      [taskId, fieldId, String(value)]
    );

    res.json({ message: 'Custom field value saved successfully' });
  } catch (error) {
    console.error('Error saving custom field value:', error);
    res.status(500).json({ error: 'Failed to save field value' });
  }
});

export default router;
