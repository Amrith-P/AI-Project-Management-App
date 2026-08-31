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
    const inProgressTasks = tasks.filter(t => t.status === 'Doing' || t.status === 'In Progress').length;
    const todoTasks = tasks.filter(t => t.status === 'Todo').length;
    const highPriorityCount = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;

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

// POST /api/ai/chat (Interactive AI Copilot Drawer endpoint)
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, projectId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const db = await getDb();
    let project = null;
    let tasks = [];

    if (projectId) {
      project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
      if (project) {
        tasks = await db.all('SELECT title, status, priority, dueDate FROM tasks WHERE projectId = ?', [projectId]);
      }
    } else {
      tasks = await db.all(`
        SELECT t.title, t.status, t.priority, p.name as projectName 
        FROM tasks t 
        JOIN projects p ON t.projectId = p.id 
        WHERE p.ownerId = ? 
        LIMIT 20
      `, [req.user.id]);
    }

    const aiClient = getAiClient();
    let replyText = '';
    let actionCards = [];

    if (aiClient) {
      try {
        const prompt = `You are AI Copilot, a helpful AI Project Manager assistant.
Context:
${project ? `Active Project: ${project.name} (${project.status}, Progress: ${project.progress}%)` : 'Workspace Overview'}
Current Tasks: ${JSON.stringify(tasks.slice(0, 15))}

User Question: "${message}"

Answer concisely and clearly. If the user asks to generate tasks, suggest release notes, or re-prioritize, provide helpful recommendations. Return response as a JSON object with:
- "replyText": markdown formatted answer string
- "suggestedAction": optional object with key "type" ("generate_tasks" | "release_notes" | "summary") and optional payload.

Return ONLY valid JSON format.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const textResponse = response.text || '';
        const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        replyText = parsed.replyText || textResponse;
        if (parsed.suggestedAction) {
          actionCards.push(parsed.suggestedAction);
        }
      } catch (err) {
        console.warn('Gemini chat failed, using fallback copilot:', err.message);
      }
    }

    if (!replyText) {
      const msgLower = message.toLowerCase();
      if (msgLower.includes('risk') || msgLower.includes('bottleneck')) {
        replyText = `Based on your task backlog, high-priority unassigned tasks represent your primary risk factor. Make sure tasks are assigned to team members and due dates are specified.`;
      } else if (msgLower.includes('release') || msgLower.includes('note')) {
        const doneTasks = tasks.filter(t => t.status === 'Done');
        replyText = `### Release Notes Draft\n\n**Completed Highlights (${doneTasks.length} items)**:\n` +
          (doneTasks.length > 0 ? doneTasks.map(t => `- ✅ ${t.title}`).join('\n') : '- Finalized core architecture and setup.');
      } else if (msgLower.includes('task') || msgLower.includes('add') || msgLower.includes('generate')) {
        replyText = `I can help create additional tasks for your project. Click below to generate recommended QA & Integration tasks!`;
        actionCards.push({
          type: 'generate_tasks',
          title: 'Generate Recommended QA & Testing Tasks'
        });
      } else {
        replyText = `I am your project AI Copilot. You can ask me to summarize project health, identify overdue tasks, generate release notes, or recommend subtasks!`;
      }
    }

    res.json({
      replyText,
      actionCards
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: 'Failed to process AI chat request' });
  }
});

// POST /api/ai/smart-prioritize (AI Auto-Reordering)
router.post('/smart-prioritize', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId]);

    // Priority rank logic
    const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    
    // Sort tasks by priority descending, then dueDate ascending
    tasks.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 2;
      const weightB = priorityWeight[b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    // Update positions in DB
    await db.run('BEGIN TRANSACTION');
    try {
      let pos = 1;
      for (const t of tasks) {
        await db.run('UPDATE tasks SET position = ? WHERE id = ?', [pos++, t.id]);
      }
      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }

    const reorderedTasks = await db.all('SELECT * FROM tasks WHERE projectId = ? ORDER BY position ASC', [projectId]);
    const parsed = reorderedTasks.map(t => ({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
      checklist: t.checklist ? JSON.parse(t.checklist) : []
    }));

    res.json({
      message: 'Tasks successfully prioritized by urgency & priority',
      tasks: parsed
    });
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    res.status(500).json({ message: 'Failed to prioritize tasks' });
  }
});

// POST /api/ai/risk-analysis (Deep risk evaluation endpoint)
router.post('/risk-analysis', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    const db = await getDb();

    let project = null;
    let tasks = [];
    if (projectId && projectId !== 'all') {
      project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
      if (project) {
        tasks = await db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId]);
      }
    } else {
      tasks = await db.all(`
        SELECT tasks.* FROM tasks 
        JOIN projects ON tasks.projectId = projects.id 
        WHERE projects.ownerId = ?
      `, [req.user.id]);
    }

    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done');
    const unassignedHighPriority = tasks.filter(t => !t.assigneeId && (t.priority === 'High' || t.priority === 'Critical') && t.status !== 'Done');
    const blockedCount = tasks.filter(t => t.status === 'Testing' || t.status === 'Doing').length;

    let riskScore = 15; // default low risk
    const warningItems = [];
    const recommendedFixes = [];

    if (overdueTasks.length > 0) {
      riskScore += overdueTasks.length * 20;
      warningItems.push(`${overdueTasks.length} task(s) are past due date.`);
      recommendedFixes.push('Reschedule or reassign overdue tasks.');
    }

    if (unassignedHighPriority.length > 0) {
      riskScore += unassignedHighPriority.length * 15;
      warningItems.push(`${unassignedHighPriority.length} high priority task(s) have no assignee.`);
      recommendedFixes.push('Assign team members to unassigned high priority tasks.');
    }

    if (tasks.length === 0) {
      riskScore = 30;
      warningItems.push('Project has no tasks created yet.');
      recommendedFixes.push('Use AI Task Generation to outline initial tasks.');
    }

    riskScore = Math.min(Math.max(riskScore, 5), 100);
    const riskLevel = riskScore > 65 ? 'Critical' : riskScore > 40 ? 'High' : riskScore > 20 ? 'Medium' : 'Low';

    const aiClient = getAiClient();
    let aiInsights = null;

    if (aiClient && tasks.length > 0) {
      try {
        const prompt = `Perform a risk assessment on this project backlog:
Project: ${project ? project.name : 'All Projects'}
Total Tasks: ${tasks.length}, Overdue: ${overdueTasks.length}, Unassigned Critical: ${unassignedHighPriority.length}

Return a JSON object:
- "riskScore": number 0-100
- "riskLevel": "Low" | "Medium" | "High" | "Critical"
- "summary": string (1-2 sentences)
- "warningItems": array of strings
- "recommendedFixes": array of strings

Return ONLY valid JSON format.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const cleanedJson = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
        aiInsights = JSON.parse(cleanedJson);
      } catch (err) {
        console.warn('Gemini risk analysis failed, returning rule-based analysis:', err.message);
      }
    }

    res.json(aiInsights || {
      riskScore,
      riskLevel,
      summary: `Risk evaluation completed. Project health score is ${100 - riskScore}/100.`,
      warningItems,
      recommendedFixes
    });
  } catch (error) {
    console.error('Error in risk-analysis:', error);
    res.status(500).json({ message: 'Failed to perform risk analysis' });
  }
});

// POST /api/ai/milestone-summary (AI Sprint / Executive update report)
router.post('/milestone-summary', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    const db = await getDb();

    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId]);
    const completedTasks = tasks.filter(t => t.status === 'Done');

    const summaryReport = `### Executive Summary: ${project.name}
**Status**: ${project.status} | **Progress**: ${project.progress}%

#### Completed Milestones (${completedTasks.length}/${tasks.length}):
${completedTasks.length > 0 ? completedTasks.map(t => `- ✅ **${t.title}**`).join('\n') : '- Initial project kickoff completed.'}
`;

    res.json({ summaryReport });
  } catch (error) {
    console.error('Error in milestone-summary:', error);
    res.status(500).json({ message: 'Failed to generate milestone summary' });
  }
});

// POST /api/ai/auto-schedule (Smart Workload Balancer & AI Task Scheduler)
router.post('/auto-schedule', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND ownerId = ?', [projectId, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId]);
    const teamMembers = await db.all(
      `SELECT tm.id as memberId, tm.role, u.full_name as name, u.email 
       FROM team_members tm 
       LEFT JOIN users u ON tm.userId = u.id 
       WHERE tm.ownerId = ?`,
      [req.user.id]
    );

    const owner = await db.get('SELECT id as memberId, role, full_name as name, email FROM users WHERE id = ?', [req.user.id]);
    const allMembers = [owner, ...teamMembers].filter(Boolean);

    // Calculate current workload per member
    const memberWorkloadMap = new Map();
    allMembers.forEach(m => {
      memberWorkloadMap.set(m.memberId || m.id, { name: m.name || m.email, count: 0 });
    });

    tasks.forEach(t => {
      if (t.assigneeId && memberWorkloadMap.has(t.assigneeId)) {
        const item = memberWorkloadMap.get(t.assigneeId);
        item.count += 1;
      }
    });

    // Auto-schedule algorithm: assign unassigned tasks to member with lowest count & set realistic due dates
    const unassignedTasks = tasks.filter(t => !t.assigneeId && t.status !== 'Done');
    const reassignments = [];
    const dependencyWarnings = [];

    let today = new Date();
    let dayOffset = 1;

    for (const t of unassignedTasks) {
      // Find member with lowest current load
      let leastLoaded = allMembers[0];
      let minCount = Infinity;
      allMembers.forEach(m => {
        const load = memberWorkloadMap.get(m.memberId || m.id)?.count || 0;
        if (load < minCount) {
          minCount = load;
          leastLoaded = m;
        }
      });

      const memberId = leastLoaded.memberId || leastLoaded.id;
      const suggestedDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dayOffset += 2;

      reassignments.push({
        taskId: t.id,
        taskTitle: t.title,
        priority: t.priority,
        suggestedAssigneeId: memberId,
        suggestedAssigneeName: leastLoaded.name || leastLoaded.email,
        suggestedDueDate: suggestedDate,
        reason: `Assigned based on workload capacity (${minCount} active tasks)`
      });

      // Update map for next iteration
      const item = memberWorkloadMap.get(memberId);
      if (item) item.count += 1;
    }

    // Check for high-priority tasks missing due dates
    tasks.forEach(t => {
      if (t.priority === 'High' && !t.dueDate && t.status !== 'Done') {
        dependencyWarnings.push(`High priority task "${t.title}" lacks a target due date.`);
      }
    });

    res.json({
      projectId,
      projectName: project.name,
      totalTasks: tasks.length,
      unassignedCount: unassignedTasks.length,
      reassignments,
      dependencyWarnings,
      summary: `AI Auto-Scheduler analyzed ${allMembers.length} team members and generated ${reassignments.length} optimal task assignment recommendations.`
    });
  } catch (error) {
    console.error('Error in auto-schedule:', error);
    res.status(500).json({ message: 'Failed to auto-schedule tasks', error: error.message });
  }
});

export default router;
