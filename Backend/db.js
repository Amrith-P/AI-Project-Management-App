import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export const getDb = async () => {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        priority TEXT DEFAULT 'Medium',
        category TEXT,
        visibility TEXT DEFAULT 'Private',
        progress INTEGER DEFAULT 0,
        ownerId INTEGER NOT NULL,
        startDate DATETIME,
        endDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        color TEXT,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Todo',
        position INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'Medium',
        labels TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ownerId INTEGER NOT NULL,
        email TEXT NOT NULL,
        userId INTEGER,
        role TEXT DEFAULT 'Member',
        status TEXT DEFAULT 'Pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users (id),
        FOREIGN KEY (userId) REFERENCES users (id),
        UNIQUE(ownerId, email)
      );

      CREATE TABLE IF NOT EXISTS task_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        comment TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ownerId INTEGER NOT NULL,
        projectId INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        link TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS automations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        triggerEvent TEXT NOT NULL,
        actionType TEXT NOT NULL,
        config TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS task_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        fileName TEXT NOT NULL,
        fileSize INTEGER DEFAULT 0,
        fileType TEXT,
        fileUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS sprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        name TEXT NOT NULL,
        startDate DATETIME,
        endDate DATETIME,
        status TEXT DEFAULT 'Planning',
        goal TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ownerId INTEGER NOT NULL,
        provider TEXT NOT NULL,
        webhookUrl TEXT NOT NULL,
        secret TEXT,
        events TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS task_time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        durationMinutes INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        isBillable INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS epics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        key TEXT,
        name TEXT NOT NULL,
        summary TEXT,
        color TEXT DEFAULT '#6366f1',
        status TEXT DEFAULT 'In Progress',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        startDate DATETIME,
        releaseDate DATETIME,
        status TEXT DEFAULT 'Unreleased',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        leadId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS issue_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sourceTaskId INTEGER NOT NULL,
        targetTaskId INTEGER NOT NULL,
        linkType TEXT DEFAULT 'relates to',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sourceTaskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (targetTaskId) REFERENCES tasks (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        name TEXT NOT NULL,
        fieldType TEXT DEFAULT 'Text',
        options TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS task_custom_field_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        fieldId INTEGER NOT NULL,
        value TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (fieldId) REFERENCES custom_fields (id) ON DELETE CASCADE,
        UNIQUE(taskId, fieldId)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        userName TEXT,
        action TEXT NOT NULL,
        entityType TEXT,
        entityId INTEGER,
        details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        name TEXT NOT NULL,
        nodes TEXT,
        transitions TEXT,
        isDefault INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS slas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        issueType TEXT DEFAULT 'Bug',
        priority TEXT DEFAULT 'High',
        responseHours REAL DEFAULT 4,
        resolutionHours REAL DEFAULT 24,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        keyHash TEXT NOT NULL,
        keyPrefix TEXT NOT NULL,
        scopes TEXT,
        lastUsedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    
    // Auto-migrate existing tables
    try {
      await db.exec('ALTER TABLE projects ADD COLUMN key TEXT');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "Project Manager"');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT "Medium"');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN labels TEXT');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN dueDate DATETIME');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN assigneeId INTEGER');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN checklist TEXT');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN estimatedHours REAL DEFAULT 0');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN spentHours REAL DEFAULT 0');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN sprintId INTEGER');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN issueKey TEXT');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN epicId INTEGER');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN versionId INTEGER');
    } catch (e) { /* Column might already exist */ }
    try {
      await db.exec('ALTER TABLE tasks ADD COLUMN componentId INTEGER');
    } catch (e) { /* Column might already exist */ }

    console.log('SQLite Database initialized');
  }
  return db;
};
