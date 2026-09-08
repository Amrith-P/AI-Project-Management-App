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

---

### Phase 4: AI Automations Engine, Task Attachments, Gantt Schedule & Export Suite (COMPLETED)

#### Phase 4A: AI Automation Engine & Smart Rule Triggers
- **Backend**: `automations` table in `Backend/db.js`, `Backend/routes/automations.js` router, and `processAutomations()` trigger helper.
- **Frontend**: `AutomationModal.tsx` workflow rule builder with `⚡ AI Automations` button in `ProjectDetailsPage.tsx`.

#### Phase 4B: Task File Attachments & Asset Manager
- **Backend**: `task_attachments` table in `Backend/db.js` and `Backend/routes/attachments.js` router.
- **Frontend**: Attachments tab in `TaskDetailModal.tsx` with drag-and-drop uploader, file size display, download actions, and remove controls.

#### Phase 4C: Custom Sprint Planner & Gantt Schedule View
- **Backend**: `sprints` table in `Backend/db.js` and `Backend/routes/sprints.js` router.
- **Frontend**: `GanttTimelineView.tsx` visual Gantt chart with priority colors & status progress indicators added to `ProjectDetailsPage.tsx`.

#### Phase 4D: Executive Project Export Suite
- **Backend**: `GET /api/projects/:id/export` endpoint in `Backend/routes/projects.js`.
- **Frontend**: `ExportReportModal.tsx` interactive report exporter for Markdown (`.md`) and JSON (`.json`) files.

---

### Phase 5: Real-Time Socket.io Collaboration, AI Auto-Scheduler, Developer Webhooks & Theme Engine (COMPLETED)

#### Phase 5A: Real-Time Socket.io Collaboration & Live Team Chat
- **Backend**: Socket.io server integration in `Backend/server.js` and `Backend/socket.js`. Event rooms for project live drag-and-drop sync, live comment streams, and user online presence.
- **Frontend**: `SocketContext.tsx` provider, `ActiveUsersBar.tsx` presence badges, and live socket listeners on `Board.tsx` and `TaskDetailModal.tsx`.

#### Phase 5B: AI Autonomous Task Scheduler & Smart Workload Balancer
- **Backend**: `POST /api/ai/auto-schedule` route in `Backend/routes/ai.js` using Gemini to optimize task workload distribution, predict milestone completions, and detect dependency conflicts.
- **Frontend**: `AISchedulerModal.tsx` visual workload balancer with 1-click **"Apply AI Schedule"** action button in `ProjectDetailsPage.tsx`.

#### Phase 5C: GitHub / GitLab & Slack Webhook Integration System
- **Backend**: `webhooks` DB table in `Backend/db.js`, `Backend/routes/webhooks.js` router for GitHub commit/PR webhook handler (`#task-id` auto status transitions), and `slackNotifier.js` for outbound Slack alert webhooks.
- **Frontend**: `IntegrationsTab.tsx` in `SettingsPage.tsx` with GitHub webhook setup instructions and Slack notification trigger configuration.

#### Phase 5D: Dark/Light Theme System & Customizable Dashboard Builder
- **Frontend**: `themeSlice.ts` Redux state, `ThemeToggle.tsx` sun/moon switch in `Navbar.tsx`, and `DashboardCustomizeModal.tsx` allowing drag-and-drop widget layout customization in `DashboardPage.tsx`.

---

### Phase 6: Enterprise Multi-Tenant RBAC, AI Voice Assistant, Time Tracking & Billing Reports (COMPLETED)

#### Phase 6A: Multi-Tenant Workspace & Role-Based Access Control (RBAC)
- **Backend**: `requireRole(['Admin', 'Project Manager'])` middleware in `Backend/middleware/auth.js` enforcing read-only vs write permissions on project deletion, settings, and team changes.
- **Frontend**: `RoleGuard.tsx` component to conditionally render action controls based on active user role (`Admin`, `Manager`, `Developer`, `Viewer`).

#### Phase 6B: AI Voice & Speech Assistant ("Hey Copilot")
- **Frontend**: `AIVoiceButton.tsx` Web Speech API voice input controller with real-time waveform animation, speech-to-text transcription, and optional Text-to-Speech audio response readout in `AICopilotDrawer.tsx`.

#### Phase 6C: Live Time Tracker & Billable Hours Report Engine
- **Backend**: `task_time_logs` DB table in `Backend/db.js` and `Backend/routes/timeLogs.js` router.
- **Frontend**: `TaskTimerWidget.tsx` live stopwatch with start/pause/log controls in task details, and `TimeTrackingReportCard.tsx` billable vs non-billable hours breakdown in `AnalyticsPage.tsx`.

#### Phase 6D: Offline PWA Capabilities & Local Cache Sync
- **Frontend**: PWA `manifest.json` and service worker asset caching strategy for offline access and local sync.

---

### Phase 7: Jira-Style Enterprise Platform Expansion (`build.md` Spec) (COMPLETED)

#### Phase 7A: Project Keys & Issue Key System (`KEY-123`)
- **Backend**: Auto-generated project key (`key`) on `projects` table (e.g. `OB`) and formatted `issueKey` on `tasks` table (e.g. `OB-101`).
- **Frontend**: Issue Key badges rendered on `TaskCard.tsx`, `Board.tsx`, and `TaskDetailModal.tsx`.

#### Phase 7B: Epics, Releases / Versions & Components Engine
- **Backend**: `epics`, `versions`, and `components` DB tables in `Backend/db.js`, with CRUD routers (`epics.js`, `versions.js`, `components.js`).
- **Frontend**: Dedicated management views `EpicsPage.tsx`, `ReleasesPage.tsx`, and `ComponentsPage.tsx` with progress bars and child task tracking.

#### Phase 7C: Issue Dependencies & Link Manager
- **Backend**: `issue_links` DB table schema and `issueLinks.js` endpoint for linking tasks (`blocks`, `is blocked by`, `relates to`, `duplicates`).
- **Frontend**: "Linked Issues" tab in `TaskDetailModal.tsx` allowing issue linking by Issue Key.

#### Phase 7D: Board WIP Limits, Command Palette (`Cmd + K`) & JQL Saved Filters
- **Frontend**: Column WIP limit warnings in `Board.tsx`, global `CommandPalette.tsx` overlay modal (`Cmd + K`), and `AdvancedSearchPage.tsx` with JQL-style query filtering and saved presets.

---

### Phase 8: Advanced Automation Engine, Dynamic Custom Fields & Audit Trail System (COMPLETED)

#### Phase 8A: Visual Rule Automation Engine (WHEN / IF / THEN)
- **Backend**: `automationEngine.js` trigger execution engine (`WHEN status == Done AND type == Bug -> THEN notify reporter & add comment`).
- **Frontend**: `AutomationRuleBuilderModal.tsx` visual block rule builder.

#### Phase 8B: Dynamic Custom Fields System
- **Backend**: `custom_fields` and `task_custom_field_values` tables in `Backend/db.js` and `customFields.js` router.
- **Frontend**: `CustomFieldsManagerModal.tsx` in project settings and dynamic field renderer in `TaskDetailModal.tsx`.

#### Phase 8C: Enterprise Audit Trail System
- **Backend**: `audit_logs` table schema and `auditLogs.js` endpoint tracking security actions, permission changes, and project modifications.
- **Frontend**: `AuditLogsTab.tsx` in `SettingsPage.tsx` with filterable action timeline and user actor badges.

#### Phase 8D: Cumulative Flow Diagram (CFD) & Burnup Reports
- **Frontend**: Cumulative Flow Diagram (CFD) area chart and Sprint Burnup report card in `AnalyticsPage.tsx`.




