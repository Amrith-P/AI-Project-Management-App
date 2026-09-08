import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import teamRoutes from './routes/team.js';
import aiRoutes from './routes/ai.js';
import activitiesRoutes from './routes/activities.js';
import notificationsRoutes from './routes/notifications.js';
import automationsRoutes from './routes/automations.js';
import attachmentsRoutes from './routes/attachments.js';
import sprintsRoutes from './routes/sprints.js';
import webhooksRoutes from './routes/webhooks.js';
import timeLogsRoutes from './routes/timeLogs.js';
import epicsRoutes from './routes/epics.js';
import versionsRoutes from './routes/versions.js';
import componentsRoutes from './routes/components.js';
import issueLinksRoutes from './routes/issueLinks.js';
import customFieldsRoutes from './routes/customFields.js';
import auditLogsRoutes from './routes/auditLogs.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/sprints', sprintsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/time-logs', timeLogsRoutes);
app.use('/api/epics', epicsRoutes);
app.use('/api/versions', versionsRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/issue-links', issueLinksRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = createServer(app);
initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDatabase();
});

