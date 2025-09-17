# Current WildflowerOS Application Inventory

## Routing & Page Purposes
- **Landing (`/`)** – Public marketing/login gateway shown whenever authentication is missing or loading, with a sign-in redirect to `/api/login`. [Source: `client/src/App.tsx`, `client/src/pages/landing.tsx`]
- **Accept Invitation (`/accept-invitation`)** – Standalone public flow that consumes an invitation token and activates the invited user. [Source: `client/src/App.tsx`, `client/src/pages/accept-invitation.tsx`]
- **Dashboard (`/`)** – Authenticated hub that loads stats, activity, upcoming tasks, quick actions, classroom overview, and family management widgets for the current school context. Includes export action placeholder. [Source: `client/src/App.tsx`, `client/src/pages/dashboard.tsx`]
- **Families (`/families`)** – Filterable family roster with search, status, and classroom filters plus card-level navigation/actions. [Source: `client/src/App.tsx`, `client/src/pages/families.tsx`]
- **Family Details (`/families/:familyId`)** – Tabbed detail record covering overview, enrollment, billing, and communication placeholders with dialogs for adults and children. [Source: `client/src/App.tsx`, `client/src/pages/family-details.tsx`]
- **Family Billing (`/families/:familyId/billing`)** – Billing workspace for invoice creation, billing setup management, and recent invoice tables. [Source: `client/src/App.tsx`, `client/src/pages/family-billing.tsx`]
- **Child Details (`/children/:childId`)** – Child profile tabs for demographics, health/learning/transportation, and enrollment history with edit dialogs. [Source: `client/src/App.tsx`, `client/src/pages/child-details.tsx`]
- **Classrooms (`/classrooms`)** – Classroom grid with level filters, enrollment statistics, and quick actions for attendance and observations. [Source: `client/src/App.tsx`, `client/src/pages/classrooms.tsx`]
- **Classroom Detail (`/classrooms/:classroomId`)** – Deep classroom view covering roster, schedule, attendance, lessons, and observation hooks. [Source: `client/src/App.tsx`, `client/src/pages/classroom-detail.tsx`]
- **Messages (`/messages`)** – Channel-based messaging UI with member list, message composer, and filters. [Source: `client/src/App.tsx`, `client/src/pages/messages.tsx`]
- **Enhanced Messages (`/enhanced-messages`)** – Experimental messaging experience with alternate layouts and urgent/pinned handling. [Source: `client/src/App.tsx`, `client/src/pages/enhanced-messages.tsx`]
- **Channel Test (`/channel-test`)** – Diagnostic page to test channel creation, member management, and message posting. [Source: `client/src/App.tsx`, `client/src/pages/channel-test.tsx`]
- **Tasks (`/tasks`)** – Task management list with filters, status/priority badges, overdue indicators, and creation/edit placeholders. [Source: `client/src/App.tsx`, `client/src/pages/tasks.tsx`]
- **Staff Roles (`/staff-roles`)** – Administration view for staff assignments, role grouping, and invitation management triggers. [Source: `client/src/App.tsx`, `client/src/pages/staff-roles.tsx`]
- **School Settings (`/settings`)** – Configurable tabs for school profile, calendars, schedules, tuition, subsidies, and more, each with CRUD dialogs. [Source: `client/src/App.tsx`, `client/src/pages/school-settings.tsx`]
- **Not Found** – Fallback page for unmatched routes. [Source: `client/src/App.tsx`, `client/src/pages/not-found.tsx`]

## Shared Layout & Reusable Components
- **App Shell** – `TopNavigation`, `Sidebar`, and `MobileBottomNav` orchestrated via `AppLayout` to provide role-aware navigation, school context, emulation dialogs, and responsive navigation chrome. [Source: `client/src/layouts/AppLayout.tsx`, `client/src/components/layout/TopNavigation.tsx`, `client/src/components/layout/Sidebar.tsx`, `client/src/components/layout/MobileBottomNav.tsx`]
- **Dashboard Widgets** – `StatsCards`, `ActivityFeed`, `UpcomingTasks`, `QuickActions`, `ClassroomOverview`, and `FamilyManagement` compose the dashboard and can be reused on other pages for analytics or quick actions. [Source: `client/src/pages/dashboard.tsx`, `client/src/components/dashboard/*`, `client/src/components/families/FamilyManagement.tsx`]
- **Family Components** – Cards, tab panels, and dialogs under `client/src/components/families` support family list/detail/billing workflows (adults CRUD, child dialogs, billing setup forms).
- **Messaging Components** – Channel list, message composer, and conversation panes under `client/src/components/messaging` drive both standard and enhanced messaging pages.
- **UI Toolkit** – Shared primitives in `client/src/components/ui` (buttons, inputs, tabs, tables, badges, dialogs, toasts, tooltips) ensure consistent interaction patterns across pages.
- **Utility Components** – `AppGuide`, `LanguageSwitcher`, and `ObservationsGrid` surface contextual guidance, localization controls, and observation reporting reused across modules. [Source: `client/src/components/AppGuide.tsx`, `client/src/components/LanguageSwitcher.tsx`, `client/src/components/ObservationsGrid.tsx`]

## User Roles & Visibility Considerations
- **User Context** – Auth flow fetches current user, roles, and schools, storing the active role in session for role-aware gating. [Source: `client/src/hooks/useAuth.ts`, `server/routes.ts`]
- **Role Definitions** – Hierarchical `roleDefinitions` table with categories, display names, and network defaults; `userRoles` table scopes assignments to schools/classrooms/legal entities with active flags and effective dates. [Source: `shared/schema.ts`]
- **Emulation & Switching** – API endpoints expose `/api/user/roles`, `/api/user/current-role`, and emulation state; top navigation uses them to allow system administrators to emulate other roles or switch contexts. [Source: `server/routes.ts`, `client/src/components/layout/TopNavigation.tsx`]
- **Access Constraints** – Delete-user endpoint checks for `sysadmin_administrator` role; many pages (e.g., staff roles, settings) assume educator/admin contexts when rendering actions. [Source: `server/routes.ts`, `client/src/pages/staff-roles.tsx`, `client/src/pages/school-settings.tsx`]

## Core Data Structures & Supporting Tables
- **Identity & Roles** – `users`, `emailAddresses`, `roleDefinitions`, `userRoles` tables capture demographic info, multiple emails, hierarchical roles, scoped assignments, and activation windows. [Source: `shared/schema.ts`]
- **Organizations** – `legalEntities`, `schools`, `schoolYears`, `calendarClosures` define organizational hierarchy and academic calendars feeding school settings and dashboard context. [Source: `shared/schema.ts`]
- **Programs & Classrooms** – Tables for classroom schedules, program offerings, tuition plans, subsidies, and classroom records support classroom views and enrollment/billing logic. [Source: `shared/schema.ts`]
- **Families & Students** – `families`, `children`, `familyAdults`, `childHealthProfiles`, `childLearningProfiles`, `transportationProfiles`, and `enrollments` back family/child detail tabs, demographic capture, and enrollment status flows. [Source: `shared/schema.ts`]
- **Billing & Finance** – `billingSetups`, `invoices`, `payments`, `budgets`, and related ledger tables drive the billing dashboard and financial summaries. [Source: `shared/schema.ts`]
- **Tasks & Messaging** – `tasks`, `taskTemplates`, `channels`, `channelMembers`, `messages`, `channelTemplates` provide task lifecycle tracking and communication infrastructure. [Source: `shared/schema.ts`]
- **Invitations & Onboarding** – `userInvitationsTable` stores tokens, statuses, and metadata for the public invitation acceptance flow. [Source: `shared/schema.ts`]

## Page-Level Actions & Interactions
- **Authentication** – `useAuth` hook triggers `/api/auth/user`; landing page initiates `/api/login` redirects when sessions expire. [Source: `client/src/hooks/useAuth.ts`, `client/src/pages/landing.tsx`, `client/src/pages/dashboard.tsx`]
- **Families** – List filters execute client-side queries; cards link to detail, billing, and messaging; detail tabs expose dialogs for editing family info, adding/removing adults, managing children, and launching enrollments defaulted to "prospective" status. [Source: `client/src/pages/families.tsx`, `client/src/pages/family-details.tsx`]
- **Billing** – Create invoice dialog collects amount/description/due date; billing setup dialog toggles autopay, payment methods, schedules, and recipient contacts; invoice rows offer download/edit placeholders. [Source: `client/src/pages/family-billing.tsx`]
- **Child Profiles** – Actions cover editing demographics, managing health/learning/transportation profiles, and viewing enrollment timeline with status badges. [Source: `client/src/pages/child-details.tsx`]
- **Classrooms** – Index filters by name/level and exposes attendance/observation quick actions; detail view manages roster, schedules, attendance logs, lessons, and observation reports. [Source: `client/src/pages/classrooms.tsx`, `client/src/pages/classroom-detail.tsx`]
- **Tasks** – Filters by search/status/priority; cards display due-date warnings and status chips; new task button reserved for future modal/drawer composer integrating priority, due date, and assignee. [Source: `client/src/pages/tasks.tsx`]
- **Messaging** – Standard and enhanced messaging pages let users browse channels, view members, post messages, toggle urgent/pinned flags, and manage attachments; channel test page enables creation and membership experiments against the API. [Source: `client/src/pages/messages.tsx`, `client/src/pages/enhanced-messages.tsx`, `client/src/pages/channel-test.tsx`]
- **Staff & Settings** – Staff roles page orchestrates role assignment grids and invitation dialogs; school settings tabs load and mutate calendar, schedule, tuition, subsidy, and profile data. [Source: `client/src/pages/staff-roles.tsx`, `client/src/pages/school-settings.tsx`]

## API Surface & Storage Layer Highlights
- **Route Registration** – `server/routes.ts` wires auth, user role, classroom, family, task, messaging, invitation, and emulation endpoints; also configures WebSocket server for live messaging. [Source: `server/routes.ts`]
- **Storage Abstraction** – `server/storage.ts` centralizes CRUD for all major tables, including helpers for dashboard stats, classroom rosters, billing, messaging, tasks, and invitation lifecycle. [Source: `server/storage.ts`]
- **Email & Holidays** – `emailService.ts` sends invitation emails; `holidayService.ts` populates calendar closures for school schedules. [Source: `server/emailService.ts`, `server/holidayService.ts`]

## Front-End Data Contracts
- **TypeScript Interfaces** – `DashboardStats`, `UserContext`, `UserRole`, `School`, `Classroom`, `Family`, `Child`, `Enrollment`, `Task`, `Message`, and `Channel` interfaces define the shapes used throughout hooks and components for consistent data handling. [Source: `client/src/types/index.ts`]
- **Query Client** – React Query client configured in `client/src/lib/queryClient.ts` standardizes caching and mutation patterns across pages. [Source: `client/src/lib/queryClient.ts`]

## Suggested Next Steps for Spec Authoring
- Review each page section above and adjust scope/actions per desired rebuild goals.
- Decide which experimental messaging flows (enhanced/channel-test) should ship in the refreshed app.
- Clarify adult/guardian data requirements for families, attendance/observation flows for classrooms, and task creation UX before implementation restarts.
