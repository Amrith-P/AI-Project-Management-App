import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// DEFAULT WORKFLOW PRESET NODES & TRANSITIONS
const DEFAULT_WORKFLOW_NODES = [
  { id: 'node-todo', label: 'To Do', category: 'Open', color: '#64748b', position: { x: 100, y: 150 } },
  { id: 'node-doing', label: 'In Progress', category: 'In Progress', color: '#3b82f6', position: { x: 350, y: 150 } },
  { id: 'node-testing', label: 'In Review / QA', category: 'In Progress', color: '#a855f7', position: { x: 600, y: 150 } },
  { id: 'node-done', label: 'Done', category: 'Closed', color: '#10b981', position: { x: 850, y: 150 } }
];

const DEFAULT_WORKFLOW_TRANSITIONS = [
  { id: 't1', from: 'node-todo', to: 'node-doing', name: 'Start Work', requiredFields: [] },
  { id: 't2', from: 'node-doing', to: 'node-testing', name: 'Submit for Review', requiredFields: ['estimatedHours'] },
  { id: 't3', from: 'node-testing', to: 'node-done', name: 'Approve & Pass QA', requiredFields: [] },
  { id: 't4', from: 'node-testing', to: 'node-doing', name: 'Request Changes', requiredFields: [] }
];

// GET workflow definition for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const db = await getDb();
    const workflow = await db.get(
      'SELECT * FROM workflows WHERE projectId = ? ORDER BY createdAt DESC LIMIT 1',
      [req.params.projectId]
    );

    if (!workflow) {
      return res.json({
        projectId: Number(req.params.projectId),
        name: 'Standard Software Development Workflow',
        nodes: DEFAULT_WORKFLOW_NODES,
        transitions: DEFAULT_WORKFLOW_TRANSITIONS,
        isDefault: true
      });
    }

    res.json({
      ...workflow,
      nodes: workflow.nodes ? JSON.parse(workflow.nodes) : DEFAULT_WORKFLOW_NODES,
      transitions: workflow.transitions ? JSON.parse(workflow.transitions) : DEFAULT_WORKFLOW_TRANSITIONS
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// POST save / update workflow
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, nodes, transitions } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM workflows WHERE projectId = ?', [projectId]);

    const nodesJson = JSON.stringify(nodes || DEFAULT_WORKFLOW_NODES);
    const transitionsJson = JSON.stringify(transitions || DEFAULT_WORKFLOW_TRANSITIONS);

    if (existing) {
      await db.run(
        `UPDATE workflows SET name = ?, nodes = ?, transitions = ?, isDefault = 0 WHERE id = ?`,
        [name || 'Custom Workflow', nodesJson, transitionsJson, existing.id]
      );
    } else {
      await db.run(
        `INSERT INTO workflows (projectId, name, nodes, transitions, isDefault) VALUES (?, ?, ?, ?, 0)`,
        [projectId, name || 'Custom Workflow', nodesJson, transitionsJson]
      );
    }

    const updated = await db.get('SELECT * FROM workflows WHERE projectId = ?', [projectId]);
    res.json({
      ...updated,
      nodes: JSON.parse(updated.nodes),
      transitions: JSON.parse(updated.transitions)
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

export default router;
