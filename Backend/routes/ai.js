import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to get Google AI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
};

// Intelligent Fallback Task Generator
const generateFallbackTasks = (projectName, projectDescription, count = 5) => {
  const descLower = (projectDescription || '').toLowerCase();
  const nameLower = (projectName || '').toLowerCase();

  const templates = [
    { title: 'Define Architecture & Technical Requirements', description: 'Document core system design, data flow, and technology choices.', priority: 'High', labels: ['Planning', 'Architecture'] },
    { title: 'Setup Development Environment & CI/CD Pipeline', description: 'Configure repository structure, environment variables, and build automation.', priority: 'Medium', labels: ['DevOps', 'Setup'] },
    { title: 'Design Database Schemas & Core Data Models', description: 'Create database migrations, relations, and initial seeds.', priority: 'High', labels: ['Database', 'Backend'] },
    { title: 'Build Core API Endpoints & Auth Middleware', description: 'Implement RESTful endpoints with input validation and security checks.', priority: 'High', labels: ['Backend', 'API'] },
    { title: 'Develop Interactive UI Components & Dashboard', description: 'Create responsive frontend views adhering to design system tokens.', priority: 'Medium', labels: ['Frontend', 'UI'] },
    { title: 'Integration Testing & Quality Assurance', description: 'Perform end-to-end testing across user flows and fix edge-case bugs.', priority: 'Medium', labels: ['QA', 'Testing'] },
    { title: 'User Documentation & Deployment Release', description: 'Prepare release notes, user guides, and deploy to production server.', priority: 'Low', labels: ['Deployment', 'Docs'] }
  ];

  if (descLower.includes('ai') || nameLower.includes('ai') || descLower.includes('model') || descLower.includes('llm')) {
    templates.unshift(
      { title: 'Integrate LLM API Provider & Prompt Templates', description: 'Configure AI client SDK, prompt parameters, and token safety limits.', priority: 'High', labels: ['AI', 'Integration'] },
      { title: 'Build AI Task Parsing & Schema Validation Engine', description: 'Ensure model responses strictly conform to structured JSON schemas.', priority: 'High', labels: ['AI', 'Backend'] }
    );
  }

  return templates.slice(0, count);
};

// POST /api/ai/generate-tasks
router.post('/generate-tasks', verifyToken, async (req, res) => {
  try {
    const { projectId, projectName, projectDescription, customPrompt, count = 5, autoInsert = false } = req.body;
    const db = await getDb();

    let project = null;
    if (projectId) {
      project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
    }

    const targetName = projectName || (project ? project.name : 'New Project');
    const targetDesc = projectDescription || (project ? project.description : '');

    let tasks = [];
    const aiClient = getAiClient();

    if (aiClient) {
      try {
        const prompt = `You are an expert AI Project Manager. Breakdown the following project into ${count} concrete, actionable tasks.
Project Name: ${targetName}
Project Description: ${targetDesc}
Additional Guidance: ${customPrompt || 'None'}

Return ONLY a JSON array of objects with the following keys:
- "title": concise task title
- "description": clear task action steps
- "priority": one of "Low", "Medium", "High"
- "labels": array of 1 to 3 short strings

Format: JSON array only, no markdown formatting around it.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const textResponse = response.text || '';
        const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        tasks = JSON.parse(cleanedJson);
      } catch (aiErr) {
        console.warn('Gemini API call failed, falling back to rule-based engine:', aiErr.message);
        tasks = generateFallbackTasks(targetName, targetDesc, count);
      }
    } else {
      tasks = generateFallbackTasks(targetName, targetDesc, count);
    }

    // If autoInsert is true and projectId is provided, batch insert into database
    if (autoInsert && projectId && tasks.length > 0) {
      const currentMax = await db.get('SELECT MAX(position) as maxPos FROM tasks WHERE projectId = ? AND status = ?', [projectId, 'Todo']);
      let startPos = (currentMax?.maxPos || 0) + 1;

      const insertedTasks = [];
      for (const t of tasks) {
        const labelsStr = JSON.stringify(t.labels || []);
        const result = await db.run(`
          INSERT INTO tasks (projectId, title, description, status, position, priority, labels)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [projectId, t.title, t.description || '', 'Todo', startPos++, t.priority || 'Medium', labelsStr]);

        const createdTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
        if (createdTask.labels) createdTask.labels = JSON.parse(createdTask.labels);
        insertedTasks.push(createdTask);
      }

      return res.status(201).json({
        source: aiClient ? 'ai' : 'smart-rules',
        message: `Successfully generated and added ${insertedTasks.length} tasks to project`,
        tasks: insertedTasks
      });
    }

    return res.json({
      source: aiClient ? 'ai' : 'smart-rules',
      tasks
    });
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ message: 'Failed to generate AI tasks', error: error.message });
  }
});

// POST /api/ai/project-summary
router.post('/project-summary', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = tasks.filter(t => t.status === 'Todo').length;
    const highPriorityCount = tasks.filter(t => t.priority === 'High').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let healthScore = 85;
    let riskLevel = 'Low';
    let summaryText = '';
    let keyRisks = [];
    let recommendedActions = [];

    if (totalTasks === 0) {
      healthScore = 50;
      riskLevel = 'Medium';
      summaryText = `Project "${project.name}" has no tasks created yet. Add initial project tasks or use AI task generation to start tracking progress.`;
      keyRisks = ['No tasks defined to track team progress.'];
      recommendedActions = ['Click "AI Task Assistant" to generate a initial task breakdown.'];
    } else if (completionRate > 75) {
      healthScore = 95;
      riskLevel = 'Low';
      summaryText = `Project "${project.name}" is making excellent progress with ${completionRate}% of tasks completed.`;
      keyRisks = ['Ensure final integration testing is scheduled before target end date.'];
      recommendedActions = ['Review remaining Todo items and conduct final QA walkthrough.'];
    } else if (todoTasks > inProgressTasks + completedTasks) {
      healthScore = 65;
      riskLevel = 'Medium';
      summaryText = `Project "${project.name}" has a large backlog of unstarted tasks (${todoTasks} remaining).`;
      keyRisks = ['Backlog accumulation may delay planned milestone dates.'];
      recommendedActions = ['Assign high-priority tasks to team members', 'Re-prioritize task backlog.'];
    } else {
      healthScore = 80;
      riskLevel = 'Low';
      summaryText = `Project "${project.name}" is active with ${inProgressTasks} tasks in progress and ${completedTasks} completed.`;
      keyRisks = highPriorityCount > 3 ? ['Multiple high priority tasks running concurrently.'] : ['Keep monitor on pending tasks.'];
      recommendedActions = ['Maintain current velocity', 'Check in on high-priority tasks.'];
    }

    const aiClient = getAiClient();
    if (aiClient && totalTasks > 0) {
      try {
        const prompt = `Analyze this project status and return a JSON object with:
- "healthScore": number from 0 to 100
- "riskLevel": "Low" | "Medium" | "High"
- "statusSummary": 2 sentence executive summary
- "keyRisks": array of strings (max 3)
- "recommendedActions": array of strings (max 3)

Project: ${project.name}
Total Tasks: ${totalTasks}, Completed: ${completedTasks}, In Progress: ${inProgressTasks}, Todo: ${todoTasks}
Tasks JSON: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })))}

Return ONLY valid JSON format without markdown ticks.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const textResponse = response.text || '';
        const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        healthScore = parsed.healthScore ?? healthScore;
        riskLevel = parsed.riskLevel ?? riskLevel;
        summaryText = parsed.statusSummary ?? summaryText;
        keyRisks = parsed.keyRisks ?? keyRisks;
        recommendedActions = parsed.recommendedActions ?? recommendedActions;
      } catch (err) {
        console.warn('Gemini API project summary failed, using calculated report:', err.message);
      }
    }

    res.json({
      projectId: project.id,
      projectName: project.name,
      totalTasks,
      completedTasks,
      completionRate,
      healthScore,
      riskLevel,
      statusSummary: summaryText,
      keyRisks,
      recommendedActions
    });
  } catch (error) {
    console.error('Error in project-summary:', error);
    res.status(500).json({ message: 'Failed to generate project summary', error: error.message });
  }
});

export default router;
