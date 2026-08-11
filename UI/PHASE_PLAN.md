# Comprehensive Implementation Plan - Phase-by-Phase & Day-by-Day Split

This document details the exact **phase-by-phase and day-by-day roadmap** for completing and expanding the **AI Project Management Application**.

---

## Workspace Audit & Project Functions Overview

### 1. Existing System Functions (Audited)
- **Authentication**: JWT authentication, registration, login, protected routes (`auth.js`, `authSlice.ts`).
- **Project Management**: Project list, view project, create/edit project, category, priority (`projects.js`, `projectSlice.ts`).
- **Kanban Task Board**: Drag-and-drop columns (`Todo`, `Doing`, `Testing`, `Done`), task creation modal, position reordering (`tasks.js`, `Board.tsx`).
- **Team Management**: Team member invite, role assignment (`team.js`, `TeamPage.tsx`).
- **AI Engine**: Task breakdown generation and project health summary widget using Gemini 2.5 Flash with fallback rules (`ai.js`, `AIAssistantModal.tsx`, `AIInsightsWidget.tsx`).

### 2. Functional Gaps Identified for Repair
- Missing `DELETE /api/projects/:id` endpoint in backend.
- Project progress percentage is currently static/manual instead of dynamically calculated from completed tasks.
- Clicking Kanban task cards does not open a detail modal.
- `task_comments` table exists in DB schema, but has no API routes or UI components.
- No task assignee links to team members.
- `activities` table exists in DB, but has no logging helper or frontend feed.
- AI assistant is limited to static modals instead of an interactive slide-out AI Copilot Drawer.

---

## Open Questions & Strategy

1. **AI Task Execution**: The AI Copilot chat drawer can execute actions (e.g. creating tasks or changing task status) with a single click through interactive "Apply Action" buttons inside chat messages.
2. **Subtasks Storage**: Subtasks are stored as lightweight JSON arrays inside the task record for instant UI rendering and smooth drag-and-drop performance.

---

## Detailed Roadmap (Phase-by-Phase & Day-by-Day Split)

### Phase 2A: Core Fixes, Task Detail Drawer & Subtasks (Days 1 - 2)

#### Day 1: Backend Infrastructure & Schema Completion
- **Backend Updates**:
  - Add `DELETE /api/projects/:id` route to `Backend/routes/projects.js`.
  - Implement auto-calculation of project `progress` percentage whenever a task's status changes in `Backend/routes/tasks.js`.
  - Expand task endpoints (`POST`, `PUT`, `GET`) to support `assigneeId`, `dueDate`, `checklist`, `estimatedHours`, and `spentHours`.
- **Frontend Types & Store**:
  - Update `Task` interface in `UI/src/types/task.ts`.
  - Update `UI/src/store/slices/taskSlice.ts` with thunks for task deletion and detailed updates.

#### Day 2: Interactive Task Detail Modal & Kanban Card Enhancements
- **Task Detail Modal**:
  - Build `TaskDetailModal.tsx` allowing users to click any Kanban card or Task List item to open a slide-over/modal.
  - Features: Editable title/description, Priority picker, Status dropdown, Assignee selection from team members, Due date selector, Estimated vs Spent hours fields, and Subtask/Checklist manager with interactive checkboxes and progress bar.
- **Kanban Board Polish**:
  - Update `TaskCard.tsx` to render assignee initials/avatar badge, subtask progress ratio (e.g., `3/5`), comment count, and due date pill with overdue visual warning (red border/badge if past due date).

---

### Phase 2B: Task Comments Engine & Activity Log Feed (Days 3 - 4)

#### Day 3: Task Comments API & Activity Logger
- **Backend API**:
  - Create `Backend/routes/activities.js` router with `GET /api/activities`.
  - Create exportable `logActivity(ownerId, projectId, action, details)` helper.
  - Add routes in `tasks.js`: `GET /api/tasks/:taskId/comments`, `POST /api/tasks/:taskId/comments`, `DELETE /api/tasks/comments/:commentId`.
  - Trigger activity logging on key events (creating projects, moving tasks, assigning team members, adding comments).

#### Day 4: Discussion UI & Dashboard Activity Feed
- **Task Comments UI**:
  - Add Comments tab to `TaskDetailModal.tsx` with live comment timeline, user avatars, formatted timestamps, and comment posting form.
- **Dashboard Activity Feed**:
  - Create `ActivityFeed.tsx` timeline component.
  - Embed Activity Feed into `UI/src/pages/dashboard/DashboardPage.tsx` alongside key metric widgets.

---

### Phase 2C: AI Copilot Drawer & Smart Task Assistant (Days 5 - 6)

#### Day 5: AI Conversational API & Smart Prioritizer
- **Backend AI Endpoints**:
  - Create `POST /api/ai/chat` in `Backend/routes/ai.js`: Contextual chat endpoint accepting project state, task backlog, user query, and returning Gemini response + structured action cards.
  - Create `POST /api/ai/smart-prioritize`: AI algorithm to automatically reorder task backlog based on priority, deadlines, and current workload.

#### Day 6: AI Copilot Drawer Component & Interactive Quick Actions
- **AI Copilot Drawer**:
  - Build `AICopilotDrawer.tsx`: Slide-out panel accessible globally from top navigation header or floating button.
  - Add preset prompt buttons:
    - ⚡ *"Summarize project status & risks"*
    - 🎯 *"Auto-prioritize backlog"*
    - 📝 *"Draft release notes for completed tasks"*
    - 💡 *"Suggest missing QA tasks"*
  - Implement interactive action message cards: When AI suggests tasks or changes, render a 1-click **"Apply to Project"** button that executes the change directly in Redux/Database.

---

### Phase 2D: Team Workload Analytics & UI Design System Polish (Day 7)

#### Day 7: Workload Dashboard, Visual Polish & Verification
- **Team Workload Dashboard**:
  - Enhance `UI/src/pages/team/TeamPage.tsx` with member workload distribution cards (assigned tasks count, active vs completed tasks ratio, capacity indicator).
- **UI Design System Polish**:
  - Add glassmorphism container styles, vibrant gradient accents, subtle micro-animations (`animate-fade-in`, hover transformations), empty state illustrations, and toast notification alerts.
- **Verification**:
  - Run TypeScript build check (`npm run build` in `UI/`).
  - Run backend API check.
  - Perform full end-to-end verification across all user flows.

---

### Phase 3: AI Risk Predictor, Enterprise Analytics Dashboard, Notifications Engine & Global Search (COMPLETED)

#### Phase 3A: AI Risk Predictor & Health Scanner
- **Backend**: `POST /api/ai/risk-analysis`, `POST /api/ai/milestone-summary` in `Backend/routes/ai.js`.
- **Frontend**: `AIRiskPredictorWidget.tsx` integrated in `DashboardPage.tsx` and `ProjectDetailsPage.tsx`.

#### Phase 3B: Enterprise Analytics & Reporting Dashboard
- **Backend**: `GET /api/projects/:id/analytics` in `Backend/routes/projects.js`.
- **Frontend**: `AnalyticsPage.tsx` with velocity charts, priority distribution, workload capacity table, and 1-click CSV export. Added `/analytics` route to `App.tsx`, `Navbar.tsx`, and `Sidebar.tsx`.

#### Phase 3C: Real-Time In-App Notifications Engine
- **Database & Backend**: `notifications` table, `Backend/routes/notifications.js`, and `createNotification()` triggers on task assignments & comments.
- **Frontend**: `NotificationDropdown.tsx` in `Navbar.tsx` with unread badge counter, notification drawer, and Redux thunks (`notificationSlice.ts`).

#### Phase 3D: Global Search & Kanban Multi-Filter System
- **Backend & Frontend**: Search query, priority, assignee, and tag/label filters in `GET /api/projects/:projectId/tasks` and `BoardFilterBar.tsx` integrated into `Board.tsx`.
