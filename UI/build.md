Sure. Below is a **single copy-paste-ready prompt** you can give directly to an AI coding tool (Cursor, Claude Code, Lovable, Bolt, etc.) to build the Jira-style project management application.

# BUILD SPECIFICATION — JIRA-STYLE PROJECT MANAGEMENT APPLICATION

Build a production-quality, full-stack project management application inspired by Jira. Do NOT create a simple CRUD task manager. The application must behave like a professional Jira-style project management platform where Projects, Issues, Epics, Stories, Tasks, Bugs, Subtasks, Backlogs, Sprints, Boards, Workflows, Releases, Reports, Users, Teams, Permissions, Notifications, and Automation are interconnected through a single consistent data model.

The application must be professional, responsive, scalable, maintainable, and production-ready.

---

# 1. TECHNOLOGY STACK

Use:

* Frontend: React + Vite + JavaScript
* Styling: Tailwind CSS
* UI components: shadcn/ui
* Icons: Lucide React
* Routing: React Router DOM
* Server state: TanStack React Query
* Forms: React Hook Form
* Validation: Zod
* HTTP: Axios
* Tables: TanStack React Table
* Charts: Recharts
* Drag and drop: dnd-kit
* Backend: Node.js + Express
* Database: PostgreSQL
* Authentication: JWT with refresh-token support
* Password hashing: bcrypt
* Real-time: Socket.IO
* File storage: configurable storage abstraction
* API documentation: OpenAPI/Swagger
* Environment configuration: dotenv

Use clean modular architecture.

Do not put the entire application inside a few huge files.

---

# 2. CORE PRODUCT CONCEPT

The hierarchy must be:

Organization
↓
Teams
↓
Projects
↓
Epics
↓
Stories / Tasks / Bugs
↓
Subtasks

A Project contains:

* Project overview
* Board
* Backlog
* Sprints
* Issues
* Epics
* Timeline
* Calendar
* Releases
* Components
* Reports
* People
* Project settings
* Automation

Everything must use the same underlying issue data.

For example, changing an issue from "In Progress" to "Done" must update:

* Board
* Sprint progress
* Epic progress
* Release progress
* Dashboard
* Reports
* Notifications
* Issue history

Do not create duplicate task data for different views.

---

# 3. APPLICATION LAYOUT

Create a professional Jira-style application shell.

Desktop layout:

---

## TOP NAVIGATION

SIDEBAR                    MAIN CONTENT
|
|
|
-

Top navigation:

* Application logo
* Projects
* Issues
* Boards
* Plans
* Reports
* Global search
* Create button
* Notifications
* Help
* Settings
* User avatar

Sidebar must be project-aware.

When inside a project:

PROJECT NAME
PROJECT KEY

Overview
Board
Backlog
Timeline
Calendar
Issues
Epics
Releases
Reports
Components

---

Project settings

Sidebar must be collapsible.

Remember collapsed/expanded state.

---

# 4. DESIGN SYSTEM

Create a consistent professional design system.

Visual style:

* Modern enterprise SaaS
* Clean
* Minimal
* Dense but readable
* Professional
* Strong hierarchy
* Subtle borders
* Rounded cards
* Good spacing
* Consistent typography
* Excellent hover states
* Excellent focus states
* Smooth transitions

Use shadcn/ui wherever appropriate.

Use Tailwind utilities instead of writing unnecessary custom CSS.

Support:

* Light mode
* Dark mode
* System mode

Use semantic colors:

* Primary
* Background
* Surface
* Border
* Muted
* Success
* Warning
* Danger
* Info

Do not hardcode random colors throughout components.

---

# 5. AUTHENTICATION

Create:

* Login
* Register
* Forgot password
* Reset password
* Logout
* Session restoration

Login screen:

Logo

Welcome back

Email
Password

Remember me

Sign in

Forgot password?

Optional:

Continue with Google

After login:

1. Load current user
2. Load permissions
3. Load projects
4. Load notifications
5. Load preferences
6. Redirect to dashboard

Protect authenticated routes.

Protect API endpoints on the backend.

Never rely only on frontend authorization.

---

# 6. USER PROFILE

User menu:

Profile
Personal settings
Notifications
Keyboard shortcuts
Theme
Logout

Profile fields:

* Avatar
* Full name
* Email
* Job title
* Team
* Timezone
* Language
* About

Allow avatar upload.

---

# 7. DASHBOARD

Create a customizable dashboard.

Header:

Dashboard

* Add gadget

Widgets:

* Assigned to me
* Due soon
* Overdue
* Completed
* Sprint progress
* Recent activity
* Burndown
* Velocity
* Workload
* Project health
* Upcoming releases

Example:

Assigned to me
18

Due soon
5

Overdue
2

Completed
42

Use responsive grid layouts.

Dashboard widgets should be reusable.

---

# 8. PROJECT MANAGEMENT

Projects page:

Search projects

Filters:

* My projects
* Starred
* Recently viewed
* Project type

Each project card:

* Project icon
* Project name
* Project key
* Description
* Lead
* Status
* Progress

Actions:

Open
Star
Edit
Archive

---

# 9. CREATE PROJECT

Create project wizard.

STEP 1:

Choose template.

Templates:

* Scrum
* Kanban
* Bug tracking
* Project management

STEP 2:

Project details.

Fields:

Project name
Project key
Description
Project lead
Project type

STEP 3:

Team.

Add members.

Assign roles.

STEP 4:

Configuration.

Issue types:

* Epic
* Story
* Task
* Bug
* Subtask

Workflow:

* Basic
* Software development
* Custom

Board:

* Scrum
* Kanban

After creation automatically create:

* Project
* Members
* Roles
* Issue types
* Workflow
* Statuses
* Board
* Columns
* Permissions
* Notification rules

---

# 10. PROJECT OVERVIEW

Header:

PROJECT NAME
PROJECT KEY

Navigation:

Overview
Board
Backlog
Timeline
Calendar
Issues
Epics
Releases
Reports
Components

Overview content:

Project health

On track

Progress

Issue statistics:

Total
Completed
In Progress
Blocked
Overdue

Current sprint

Recent activity

Upcoming deadlines

Release progress

Team workload

---

# 11. ISSUE SYSTEM

Issues are the central entity.

Issue types:

* Epic
* Story
* Task
* Bug
* Subtask
* Improvement
* Request

Every issue must have:

* ID
* Issue key
* Project
* Type
* Summary
* Description
* Status
* Priority
* Assignee
* Reporter
* Parent
* Epic
* Sprint
* Version
* Component
* Labels
* Story points
* Start date
* Due date
* Created date
* Updated date
* Resolved date
* Rank

---

# 12. ISSUE KEY

Generate keys such as:

PROJECT-1
PROJECT-2
PROJECT-3

Example:

OB-123

The key must be unique inside the organization.

---

# 13. CREATE ISSUE

Global Create button must open a modal.

Fields:

Project
Issue type
Summary
Description
Assignee
Reporter
Priority
Labels
Sprint
Epic
Fix version
Component
Story points
Start date
Due date
Attachments

Buttons:

Cancel
Create

After creation:

* Create issue
* Add history record
* Update project counters
* Notify relevant users
* Update board/backlog
* Invalidate React Query caches
* Emit Socket.IO event

---

# 14. ISSUE DETAIL

Create a professional issue detail screen.

Header:

OB-123

Implement customer login

Actions:

Edit
Assign
Move
Link
Watch
More

Main content:

Description

Attachments

Subtasks

Linked issues

Activity

Comments

History

Work log

Right sidebar:

Status
Assignee
Reporter
Priority
Sprint
Story points
Epic
Labels
Component
Fix version
Due date

Every field should be editable where permission allows.

---

# 15. ISSUE COMMENTS

Support:

* Add comment
* Edit comment
* Delete comment
* @mentions
* Emoji
* Attachments
* Reactions

When mentioning a user:

@username

Send notification.

---

# 16. ISSUE HISTORY

Record every important change.

Examples:

Status:
To Do → In Progress

Assignee:
John → Amrith

Priority:
Medium → High

Sprint:
Sprint 14 → Sprint 15

Record:

* User
* Field
* Old value
* New value
* Timestamp

Display chronological activity timeline.

---

# 17. ISSUE ATTACHMENTS

Support:

* Upload
* Preview
* Download
* Delete

Image attachments should show thumbnails.

Display:

filename
file size
uploaded by
uploaded time

---

# 18. ISSUE LINKS

Support:

* Blocks
* Is blocked by
* Relates to
* Duplicates
* Is duplicated by
* Parent
* Child

Example:

OB-102 blocks OB-109

Display dependency visually.

---

# 19. WORKFLOW

Default workflow:

TO DO
↓
IN PROGRESS
↓
CODE REVIEW
↓
TESTING
↓
DONE

Allow:

Blocked
Cancelled
Reopened

Workflow must be configurable.

Transitions must support:

* Conditions
* Validators
* Required fields
* Post actions
* Notifications
* Automation

Example:

IN REVIEW
↓
Approve
↓
TESTING

IN REVIEW
↓
Request changes
↓
IN PROGRESS

---

# 20. TRANSITION MODAL

When moving an issue, optionally show:

Move issue to Testing

Environment
QA

Build number
2.4.1

QA owner
John

Comment

[Move]

The system must validate required fields before transition.

---

# 21. BACKLOG

Backlog screen:

Header:

Backlog
Create sprint

Show:

* Epics
* Issues
* Future sprints
* Active sprint

Issue row:

Drag handle
Issue key
Summary
Type
Priority
Assignee
Story points

Support drag-and-drop ranking.

---

# 22. ISSUE RANKING

Issues must have a persistent rank.

Dragging an issue must update its rank without renumbering every issue.

Use fractional/lexicographical ranking or another scalable ranking strategy.

Ranking must work:

* Within backlog
* Within sprint
* Between sprints
* On board

---

# 23. EPICS

Epic page:

Epic name
Epic key
Description
Owner
Status
Progress

Show child issues.

Example:

Authentication

Stories:

Login
Forgot password
MFA
Session management

Show:

Completed
In progress
Remaining
Story points

---

# 24. SPRINTS

Sprint fields:

* Sprint name
* Goal
* Start date
* End date
* Status

Statuses:

Future
Active
Completed

Create sprint.

Edit sprint.

Start sprint.

Complete sprint.

---

# 25. START SPRINT

Modal:

Sprint 15

Start date
End date

Sprint goal

Show:

Issues included
Story points
Assignees

Start Sprint button.

After starting:

* Mark sprint active
* Move selected issues to sprint
* Update board
* Notify members
* Record history

---

# 26. COMPLETE SPRINT

Modal:

Sprint 15

Completed:
18

Incomplete:
7

Move incomplete issues to:

Backlog

or

Sprint 16

After completion:

* Mark sprint completed
* Move unfinished issues
* Calculate velocity
* Generate sprint report
* Update dashboard
* Notify team

---

# 27. SCRUM BOARD

Board layout:

TO DO
IN PROGRESS
CODE REVIEW
TESTING
DONE

Each issue appears as a card.

Card:

Issue key
Issue type
Summary
Priority
Assignee
Story points
Labels

Drag issue between columns.

On drop:

1. Update UI optimistically
2. Send API request
3. Update status
4. Record history
5. Trigger automation
6. Notify users
7. Broadcast Socket.IO event

If API fails:

Rollback UI.

---

# 28. KANBAN BOARD

Support Kanban boards.

Columns:

Backlog
Selected
In Progress
Review
QA
Done

Support WIP limits.

Example:

IN PROGRESS
3 / 5

If exceeded:

Show warning.

---

# 29. BOARD FILTERS

Board filters:

* Assignee
* Issue type
* Priority
* Label
* Epic
* Sprint
* Component

Quick filters:

My issues
Unassigned
High priority
Blocked

Search issues.

---

# 30. TIMELINE

Create Gantt-style timeline.

Show:

* Epics
* Stories
* Start date
* End date
* Progress
* Dependencies
* Milestones

Support:

* Drag dates
* Resize duration
* Dependency lines
* Zoom
* Day/week/month/quarter

---

# 31. CALENDAR

Calendar views:

Month
Week
List

Show:

* Issue due dates
* Sprint dates
* Releases
* Milestones

Click event → open issue.

Drag event → change due date where permitted.

---

# 32. RELEASES

Release fields:

Version
Name
Description
Start date
Release date
Status

Statuses:

Unreleased
Released
Archived

Release dashboard:

Total issues
Completed
Remaining
Blocked

Progress bar.

Issues associated with release.

Release action.

---

# 33. COMPONENTS

Components:

Authentication
Payments
Notifications
Frontend
Backend
Database
Reporting

Each component:

Name
Description
Lead
Default assignee

Issues can belong to components.

---

# 34. ADVANCED SEARCH

Create powerful issue search.

Filters:

Project
Issue type
Status
Assignee
Reporter
Priority
Sprint
Epic
Label
Component
Version
Created date
Updated date
Due date

Support query syntax similar to:

project = OB
AND status = "In Progress"
AND assignee = amrith

Also provide visual filter builder.

---

# 35. SAVED FILTERS

Users can save searches.

Example:

My High Priority Issues

project = OB
AND assignee = currentUser()
AND priority = High

Allow:

* Save
* Rename
* Delete
* Share
* Favorite

---

# 36. REPORTS

Create:

1. Burndown
2. Burnup
3. Velocity
4. Created vs Resolved
5. Cumulative Flow
6. Sprint Report
7. Workload
8. Epic Progress
9. Release Progress
10. Issue Statistics

Use Recharts.

Charts must be interactive.

Hover should show detailed values.

---

# 37. BURNDOWN

Show:

Ideal remaining work
Actual remaining work

X axis:

Sprint days

Y axis:

Story points/issues

---

# 38. VELOCITY

Show previous sprints:

Sprint 10
42 points

Sprint 11
38 points

Sprint 12
47 points

Sprint 13
44 points

Show average velocity.

---

# 39. WORKLOAD

Display users:

Amrith
11 issues

John
7 issues

Sarah
5 issues

Rahul
9 issues

Allow filtering by:

* Sprint
* Project
* Status
* Issue type

---

# 40. PEOPLE

Project members page.

Columns:

User
Role
Team
Assigned issues
Completed issues

Roles:

Project Admin
Project Manager
Developer
QA
Reporter
Viewer

---

# 41. PERMISSIONS

Implement RBAC.

Global permissions:

System Admin
Organization Admin
User

Project permissions:

Browse
Create
Edit
Delete
Comment
Assign
Transition
Link
Attach
Manage project
Manage sprint
Manage releases
Manage settings

Backend must validate every permission.

---

# 42. ISSUE SECURITY

Allow issue-level visibility.

Example:

Normal issue:

Everyone

Confidential issue:

Managers only

HR issue:

HR team only

Do not rely on frontend hiding.

Backend must enforce visibility.

---

# 43. NOTIFICATIONS

Notification types:

* Assigned to you
* Mentioned you
* Commented
* Status changed
* Priority changed
* Due soon
* Overdue
* Sprint started
* Sprint completed
* Release approaching

Notification dropdown:

Unread indicator

Mark read

Mark all read

Open issue

---

# 44. REAL-TIME UPDATES

Use Socket.IO.

Events:

issue.created
issue.updated
issue.deleted
issue.statusChanged
issue.assigneeChanged
comment.created
sprint.started
sprint.completed
notification.created
board.updated

If one user moves an issue, other users viewing the board should see the change without refreshing.

---

# 45. AUTOMATION

Create an automation engine.

Automation structure:

WHEN
Condition
THEN

Example:

WHEN issue transitions to Done

IF issue type = Bug

THEN:

Notify reporter
Add comment
Set resolution

Another:

WHEN due date is tomorrow

THEN notify assignee

Another:

WHEN issue created

IF component = Backend

THEN assign Backend Lead

---

# 46. AUTOMATION BUILDER

UI:

Create automation

WHEN
[ Issue transitioned ]

IF
[ Issue Type ] [ equals ] [ Bug ]

THEN
[ Send notification ]

AND
[ Add comment ]

Save rule

Enable/disable automation.

Show execution history.

---

# 47. PROJECT SETTINGS

Sections:

General
Details
People
Permissions
Notifications
Issue types
Workflows
Screens
Fields
Components
Versions
Automation
Boards

Settings must be permission-protected.

---

# 48. WORKFLOW EDITOR

Create visual workflow editor.

Nodes:

TO DO

IN PROGRESS

CODE REVIEW

TESTING

DONE

Transitions shown as arrows.

Allow admin to:

* Add status
* Delete status
* Rename status
* Add transition
* Configure transition
* Add condition
* Add validator
* Add post action

---

# 49. CUSTOM FIELDS

Allow project administrators to create:

Text
Textarea
Number
Date
DateTime
Dropdown
Multi-select
Checkbox
User
Group
URL

Examples:

Customer ID
Environment
Severity
Business Impact
Department

Custom fields must be dynamically rendered on issue forms.

---

# 50. FORMS / REQUESTS

Create request forms.

Example:

New Feature Request

Name
Department
Priority
Description
Attachments

Submit.

Automatically create an issue.

Map form fields to issue fields.

---

# 51. GLOBAL SEARCH

Search:

Projects
Issues
Users
Boards
Epics
Releases

Search results grouped by type.

Example:

Issues

OB-123 Login failure
OB-127 MFA issue

Projects

Online Banking

Users

John Smith

---

# 52. COMMAND PALETTE

Support:

Cmd/Ctrl + K

Commands:

Create issue
Search issues
Open project
Go to backlog
Go to board
Start sprint
My issues
Settings
Logout

---

# 53. KEYBOARD SHORTCUTS

Support:

C = Create issue
/ = Search
? = Shortcut help

G then P = Projects
G then B = Boards
G then I = Issues

Issue:

E = Edit
A = Assign
M = Comment

Show shortcut help modal.

---

# 54. RESPONSIVE DESIGN

Desktop:

Full sidebar.

Tablet:

Collapsible sidebar.

Mobile:

Bottom navigation:

Home
Projects
Issues
Board
Profile

Board should support horizontal scrolling.

Issue details should become a full-screen mobile view.

---

# 55. LOADING STATES

Every async component needs proper loading UI.

Use:

* Skeletons
* Spinners
* Disabled buttons

Do not show blank screens.

---

# 56. EMPTY STATES

Example:

No issues found.

There are no issues matching your filters.

[Clear filters]

For empty projects:

No projects yet.

[Create project]

---

# 57. ERROR STATES

Example:

Unable to load issues.

[Retry]

API errors should produce meaningful toast messages.

Do not expose raw stack traces to users.

---

# 58. CONFIRMATION MODALS

Destructive actions must require confirmation.

Delete issue:

Delete OB-123?

This action cannot be undone.

[Cancel]
[Delete]

Archive project:

Archive this project?

[Cancel]
[Archive]

---

# 59. TOAST NOTIFICATIONS

Use toast notifications for:

Created
Updated
Deleted
Saved
Copied
Failed
Permission denied

Examples:

Issue created successfully.

Issue moved to Done.

Failed to update issue.

---

# 60. DATABASE MODEL

Create normalized PostgreSQL tables.

Core:

users
organizations
teams
projects
project_members
project_roles

issues
issue_types
issue_statuses
issue_priorities
issue_comments
issue_attachments
issue_history
issue_links

epics
sprints
sprint_issues

boards
board_columns

versions
components

workflows
workflow_statuses
workflow_transitions

custom_fields
issue_custom_field_values

notifications
notification_preferences

saved_filters

automation_rules
automation_executions

permissions
roles

audit_logs

---

# 61. ISSUE TABLE

Fields:

id
project_id
issue_key
issue_type_id
parent_id
summary
description
status_id
priority_id
assignee_id
reporter_id
epic_id
sprint_id
version_id
component_id
story_points
rank
start_date
due_date
created_at
updated_at
resolved_at

Add appropriate foreign keys and indexes.

---

# 62. BACKEND ARCHITECTURE

Use modular Express architecture.

Example:

src/

app.js

config/

modules/

auth/
users/
projects/
issues/
boards/
sprints/
epics/
versions/
components/
reports/
notifications/
automation/

shared/

middleware/
utils/
database/

Each module:

controller
service
repository
routes
validation

Do not place database logic directly inside controllers.

---

# 63. API STRUCTURE

Authentication:

POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout

Users:

GET /api/users
GET /api/users/:id
PATCH /api/users/:id

Projects:

GET /api/projects
POST /api/projects
GET /api/projects/:id
PATCH /api/projects/:id
DELETE /api/projects/:id

Issues:

GET /api/issues
POST /api/issues
GET /api/issues/:id
PATCH /api/issues/:id
DELETE /api/issues/:id

Comments:

GET /api/issues/:id/comments
POST /api/issues/:id/comments
PATCH /api/comments/:id
DELETE /api/comments/:id

Board:

GET /api/boards/:id
PATCH /api/boards/:id

Sprints:

GET /api/sprints
POST /api/sprints
POST /api/sprints/:id/start
POST /api/sprints/:id/complete

Reports:

GET /api/reports/burndown
GET /api/reports/velocity
GET /api/reports/workload

Notifications:

GET /api/notifications
PATCH /api/notifications/:id/read

Automation:

GET /api/automation
POST /api/automation
PATCH /api/automation/:id
DELETE /api/automation/:id

---

# 64. API VALIDATION

Every endpoint must validate input.

Use Zod or an equivalent validation layer.

Validate:

* IDs
* Required fields
* Dates
* Enum values
* Permissions
* File types
* Pagination
* Search parameters

Return consistent API errors:

{
success: false,
message: "Validation failed",
errors: [...]
}

---

# 65. API RESPONSE FORMAT

Successful response:

{
success: true,
data: {}
}

List response:

{
success: true,
data: [],
pagination: {
page: 1,
limit: 20,
total: 100,
totalPages: 5
}
}

Errors:

{
success: false,
message: "Unable to update issue"
}

---

# 66. PAGINATION

All large lists must be paginated.

Use:

page
limit
search
sort
order

Never load thousands of issues unnecessarily.

Use server-side pagination.

---

# 67. PERFORMANCE

Use:

* React Query caching
* Query invalidation
* Lazy loading
* Code splitting
* Virtualized lists where necessary
* Database indexes
* Pagination
* Debounced search
* Optimistic updates

Board should remain responsive even with hundreds/thousands of issues.

---

# 68. SECURITY

Implement:

* Password hashing
* JWT authentication
* Refresh token rotation
* HTTP-only cookies where appropriate
* CORS
* Helmet
* Rate limiting
* Input validation
* Authorization middleware
* SQL injection protection
* File upload validation
* Audit logging

Never trust client-supplied user IDs or permissions.

---

# 69. AUDIT LOG

Track:

Login
Logout
Project creation
Project deletion
Permission changes
Role changes
Issue creation
Issue deletion
Issue updates
Workflow changes
Automation changes

Display audit history to administrators.

---

# 70. DATA CONSISTENCY

When an issue changes status:

Transactionally handle:

1. Update issue
2. Insert history
3. Trigger automation
4. Create notification
5. Emit real-time event

Avoid partially completed updates.

---

# 71. UX DETAILS

Use:

* Tooltips
* Context menus
* Dropdown menus
* Breadcrumbs
* Tabs
* Drawers
* Dialogs
* Popovers
* Command menus
* Skeleton loaders
* Toasts

Every interactive element needs:

* Hover state
* Focus state
* Disabled state
* Loading state
* Error state where relevant

---

# 72. ISSUE CARD MICRO-UX

Issue card should support:

Hover:

Show quick actions.

Actions:

Edit
Assign
Move
More

Click:

Open issue detail.

Right click:

Context menu.

Drag:

Move issue.

Keyboard:

Enter = open
E = edit

---

# 73. ISSUE DETAIL MICRO-UX

Allow inline editing.

For example:

Priority

High

Click:

High
Medium
Low
Critical

Select value.

Save automatically.

Show:

Saved

or

Saving...

---

# 74. SEARCH UX

Search must be debounced.

Show recent searches.

Show suggestions while typing.

Example:

Search:

login

Suggestions:

Issues
OB-123 Login API
OB-124 Login UI

Projects
Online Banking

Users
John

Press Enter:

Full search results.

---

# 75. NOTIFICATION UX

Unread notification count.

Example:

Bell icon:

🔔 4

Dropdown:

4 unread notifications.

Click notification:

Open related issue.

Mark as read.

---

# 76. ACCESSIBILITY

Implement:

* Semantic HTML
* Keyboard navigation
* Focus management
* ARIA labels
* Accessible dialogs
* Accessible dropdowns
* Proper contrast
* Screen reader support

Do not make clickable divs where buttons should be used.

---

# 77. TESTING

Backend:

* Unit tests
* Service tests
* Repository tests
* API integration tests

Frontend:

* Component tests
* Hook tests
* Form tests

End-to-end:

* Login
* Create project
* Create issue
* Assign issue
* Move issue
* Create sprint
* Start sprint
* Complete sprint
* Release

---

# 78. PRODUCTION REQUIREMENTS

Provide:

.env.example

README.md

Database migrations

Seed data

API documentation

Error logging

Production build configuration

Health endpoint:

GET /api/health

Return:

{
status: "ok"
}

---

# 79. SEED DATA

Create demo organization.

Users:

Admin
Project Manager
Developer
QA
Viewer

Project:

Online Banking

Epics:

Authentication
Payments
Notifications

Issues:

At least 20 realistic issues.

Statuses:

To Do
In Progress
Code Review
Testing
Done

Create:

* One active sprint
* One future sprint
* One completed sprint
* One release
* Multiple components
* Multiple users
* Comments
* Notifications
* Issue history

The application should look populated immediately after running seed.

---

# 80. FINAL USER JOURNEY

The complete user workflow must be:

LOGIN
↓
DASHBOARD
↓
PROJECTS
↓
OPEN PROJECT
↓
PROJECT OVERVIEW
↓
CREATE EPIC
↓
CREATE STORIES
↓
CREATE TASKS
↓
PRIORITIZE BACKLOG
↓
CREATE SPRINT
↓
MOVE ISSUES INTO SPRINT
↓
START SPRINT
↓
OPEN BOARD
↓
DEVELOPER STARTS ISSUE
↓
TO DO → IN PROGRESS
↓
CODE REVIEW
↓
TESTING
↓
DONE
↓
SPRINT COMPLETED
↓
VELOCITY REPORT
↓
RELEASE
↓
PRODUCTION
↓
NEXT SPRINT

---

# 81. IMPORTANT IMPLEMENTATION RULES

Do NOT:

* Build only static UI
* Hardcode issue data
* Create disconnected mock pages
* Store everything in localStorage
* Trust frontend permissions
* Put all backend logic into controllers
* Put all frontend logic into App.jsx
* Duplicate issue data between board/backlog/reports
* Ignore loading/error states
* Ignore mobile responsiveness

DO:

* Build real API integration
* Build real database relationships
* Use reusable components
* Use reusable hooks
* Use React Query
* Use proper validation
* Use transactions
* Use authorization middleware
* Use optimistic updates where appropriate
* Use real-time events
* Maintain issue history
* Maintain audit logs
* Use pagination
* Use indexes
* Build reusable UI primitives

---

# 82. DEVELOPMENT ORDER

Implement in this order:

PHASE 1
Authentication
Users
Organization
Roles
Permissions

PHASE 2
Projects
Project members
Project settings

PHASE 3
Issue types
Statuses
Issues
Comments
Attachments
History

PHASE 4
Board
Columns
Drag/drop
Filters

PHASE 5
Epics
Backlog
Ranking
Sprints

PHASE 6
Timeline
Calendar
Dependencies
Releases
Components

PHASE 7
Reports
Dashboard
Analytics

PHASE 8
Notifications
Socket.IO
Real-time updates

PHASE 9
Automation
Custom fields
Forms

PHASE 10
Advanced search
Saved filters
Audit logs
Advanced permissions

PHASE 11
Performance
Security
Testing
Accessibility
Production hardening

---

# 83. ACCEPTANCE CRITERIA

The application is considered complete only when:

1. A user can register/login.
2. Admin can create projects.
3. Users can be added to projects.
4. Roles and permissions work.
5. Users can create issues.
6. Issues can be assigned.
7. Issues can be edited.
8. Issues can be commented on.
9. Attachments work.
10. Issue history is recorded.
11. Issues can be linked.
12. Epics work.
13. Backlog works.
14. Issue ranking works.
15. Sprints work.
16. Sprint start works.
17. Sprint completion works.
18. Scrum board works.
19. Kanban board works.
20. Drag/drop works.
21. Status transitions work.
22. Timeline works.
23. Calendar works.
24. Releases work.
25. Components work.
26. Reports work.
27. Dashboard works.
28. Notifications work.
29. Real-time updates work.
30. Automation works.
31. Custom fields work.
32. Advanced search works.
33. Saved filters work.
34. Permissions are enforced server-side.
35. Audit logging works.
36. Loading states exist.
37. Empty states exist.
38. Error handling exists.
39. Responsive design works.
40. Dark mode works.
41. Accessibility is implemented.
42. API validation exists.
43. Database migrations exist.
44. Seed data exists.
45. Tests exist.
46. Production build works.

---

# 84. FINAL QUALITY BAR

The final result should feel like a serious enterprise project-management platform, not a demo.

Prioritize:

1. Excellent information architecture
2. Fast navigation
3. Consistent UI
4. Strong issue management
5. Reliable workflows
6. Real data persistence
7. Correct permissions
8. Excellent board UX
9. Real-time collaboration
10. Professional reporting
11. Maintainable architecture
12. Production-grade error handling

Every feature should connect to the underlying project/issue model.

When implementing a feature, think about:

UI
↓
State
↓
API
↓
Validation
↓
Authorization
↓
Database
↓
History
↓
Notifications
↓
Real-time update
↓
Reports

Build the application incrementally, but ensure every completed module is fully functional before moving to the next module.
