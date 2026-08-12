import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

export const seedDatabase = async () => {
  try {
    const db = await getDb();

    // Check if seeded Project Lead 1 exists
    const existingLead1 = await db.get('SELECT * FROM users WHERE email = ?', ['projectlead1@gmail.com']);
    
    // Hash common password 'P@ssw0rd'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('P@ssw0rd', salt);

    if (!existingLead1) {
      console.log('Seeding extended roles (Project Lead 1 and 6 Developers)...');

      // Get or create Project Manager
      let manager = await db.get('SELECT * FROM users WHERE email = ?', ['manager@gmail.com']);
      let managerId;
      if (!manager) {
        const mRes = await db.run(
          'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Project Manager', 'manager@gmail.com', hashedPassword, 'Project Manager']
        );
        managerId = mRes.lastID;
      } else {
        managerId = manager.id;
      }

      // Get or create Tech Lead (Lead 1)
      let techlead = await db.get('SELECT * FROM users WHERE email = ?', ['techlead@gmail.com']);
      let techleadId;
      if (!techlead) {
        const tlRes = await db.run(
          'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Tech Lead (Lead 1)', 'techlead@gmail.com', hashedPassword, 'Tech Lead']
        );
        techleadId = tlRes.lastID;
      } else {
        techleadId = techlead.id;
      }

      // Create Project Lead 1 (Lead 2)
      const pl1Res = await db.run(
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Project Lead 1', 'projectlead1@gmail.com', hashedPassword, 'Tech Lead']
      );
      const projectlead1Id = pl1Res.lastID;

      // Create 3 Developers under Lead 1 (techlead@gmail.com)
      const dev1Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 1', 'developer1@gmail.com', hashedPassword, 'Developer']);
      const dev1Id = dev1Res.lastID;

      const dev2Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 2', 'developer2@gmail.com', hashedPassword, 'Developer']);
      const dev2Id = dev2Res.lastID;

      const dev3Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 3', 'developer3@gmail.com', hashedPassword, 'Developer']);
      const dev3Id = dev3Res.lastID;

      // Create 3 Developers under Lead 2 (projectlead1@gmail.com)
      const dev4Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 4', 'developer4@gmail.com', hashedPassword, 'Developer']);
      const dev4Id = dev4Res.lastID;

      const dev5Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 5', 'developer5@gmail.com', hashedPassword, 'Developer']);
      const dev5Id = dev5Res.lastID;

      const dev6Res = await db.run('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Developer 6', 'developer6@gmail.com', hashedPassword, 'Developer']);
      const dev6Id = dev6Res.lastID;

      // Register all in team_members for Manager & Leads
      const addMember = async (ownerId, email, userId, role) => {
        try {
          const res = await db.run(
            'INSERT OR IGNORE INTO team_members (ownerId, email, userId, role, status) VALUES (?, ?, ?, ?, ?)',
            [ownerId, email, userId, role, 'Active']
          );
          return res.lastID;
        } catch (e) {
          return null;
        }
      };

      // Add to Manager team
      await addMember(managerId, 'projectlead1@gmail.com', projectlead1Id, 'Tech Lead');
      await addMember(managerId, 'developer1@gmail.com', dev1Id, 'Developer');
      await addMember(managerId, 'developer2@gmail.com', dev2Id, 'Developer');
      await addMember(managerId, 'developer3@gmail.com', dev3Id, 'Developer');
      await addMember(managerId, 'developer4@gmail.com', dev4Id, 'Developer');
      await addMember(managerId, 'developer5@gmail.com', dev5Id, 'Developer');
      await addMember(managerId, 'developer6@gmail.com', dev6Id, 'Developer');

      // Add developers under Tech Lead (Lead 1)
      const tmDev1 = await addMember(techleadId, 'developer1@gmail.com', dev1Id, 'Developer');
      const tmDev2 = await addMember(techleadId, 'developer2@gmail.com', dev2Id, 'Developer');
      const tmDev3 = await addMember(techleadId, 'developer3@gmail.com', dev3Id, 'Developer');

      // Add developers under Project Lead 1 (Lead 2)
      const tmDev4 = await addMember(projectlead1Id, 'developer4@gmail.com', dev4Id, 'Developer');
      const tmDev5 = await addMember(projectlead1Id, 'developer5@gmail.com', dev5Id, 'Developer');
      const tmDev6 = await addMember(projectlead1Id, 'developer6@gmail.com', dev6Id, 'Developer');

      // Seed Project for Project Lead 1
      const pl1Proj = await db.run(`
        INSERT INTO projects (name, description, status, priority, category, visibility, progress, ownerId, startDate, endDate, tags, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'E-Commerce Microservices Infrastructure',
        'Scalable payment processing, product catalog search engine, and real-time inventory management services.',
        'Active',
        'High',
        'E-Commerce & Backend',
        'Public',
        50,
        projectlead1Id,
        '2026-08-01',
        '2026-09-30',
        JSON.stringify(['Microservices', 'Node.js', 'PostgreSQL', 'Stripe']),
        '#10b981'
      ]);

      const pl1ProjId = pl1Proj.lastID;

      // Add Tasks for Lead 1's project (assigned to Developer 1, 2, 3)
      let managerProj = await db.get('SELECT id FROM projects WHERE ownerId = ? LIMIT 1', [managerId]);
      const managerProjId = managerProj ? managerProj.id : pl1ProjId;

      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        managerProjId,
        'Frontend State Management Optimization',
        'Optimize Redux Toolkit store queries and cache invalidation.',
        'Doing',
        5,
        'High',
        JSON.stringify(['Frontend', 'Redux']),
        tmDev1 || dev1Id,
        '2026-08-25',
        JSON.stringify([{ id: '1', text: 'Refactor slices', completed: true }]),
        16,
        10
      ]);

      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        managerProjId,
        'Database Query Indexing & Performance Tuning',
        'Index SQLite foreign keys and optimize SQL JOIN queries.',
        'Todo',
        6,
        'Medium',
        JSON.stringify(['Database', 'SQL']),
        tmDev2 || dev2Id,
        '2026-08-28',
        JSON.stringify([{ id: '1', text: 'Analyze slow logs', completed: false }]),
        12,
        2
      ]);

      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        managerProjId,
        'API Webhook Gateway Integration',
        'Implement incoming webhook listeners for stripe payment events.',
        'Testing',
        7,
        'High',
        JSON.stringify(['API', 'Webhooks']),
        tmDev3 || dev3Id,
        '2026-08-22',
        JSON.stringify([{ id: '1', text: 'Write event parser', completed: true }]),
        18,
        14
      ]);

      // Add Tasks for Lead 2's project (assigned to Developer 4, 5, 6)
      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pl1ProjId,
        'Stripe Payment Gateway Integration',
        'Build secure checkout session handler and webhook signature verification.',
        'Doing',
        1,
        'Critical',
        JSON.stringify(['Payments', 'Stripe']),
        tmDev4 || dev4Id,
        '2026-08-20',
        JSON.stringify([{ id: '1', text: 'Configure test API keys', completed: true }]),
        20,
        12
      ]);

      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pl1ProjId,
        'Product Catalog Elasticsearch API',
        'Implement full-text fuzzy search API with category facets.',
        'Todo',
        2,
        'High',
        JSON.stringify(['Search', 'Elasticsearch']),
        tmDev5 || dev5Id,
        '2026-08-26',
        JSON.stringify([{ id: '1', text: 'Create search index mapping', completed: false }]),
        15,
        4
      ]);

      await db.run(`
        INSERT INTO tasks (projectId, title, description, status, position, priority, labels, assigneeId, dueDate, checklist, estimatedHours, spentHours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pl1ProjId,
        'Real-time Inventory Redis Pub/Sub',
        'Build Redis cache layer for stock availability counters during checkout.',
        'Done',
        3,
        'High',
        JSON.stringify(['Redis', 'Caching']),
        tmDev6 || dev6Id,
        '2026-08-15',
        JSON.stringify([{ id: '1', text: 'Setup Redis cluster client', completed: true }]),
        14,
        14
      ]);

      console.log('Database successfully updated with Project Lead 1 and 6 Developers!');
    }
  } catch (err) {
    console.error('Database seeding error:', err);
  }
};
