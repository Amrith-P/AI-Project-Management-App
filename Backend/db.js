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
    `);
    
    // Auto-migrate existing tasks table
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

    console.log('SQLite Database initialized');
  }
  return db;
};
