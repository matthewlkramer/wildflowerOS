# Wildflower Schools Network Platform

## Overview

This is a unified digital platform for the Wildflower Schools Network - a decentralized community of small, Montessori, teacher-led schools. The application serves teacher-leaders, staff, families, and administrators to manage school operations, student enrollment, communication, billing, and governance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 14, 2025
- **✅ RESOLVED: Fixed JSX syntax errors that were preventing application startup**
  - Fixed malformed div structure in families.tsx with missing closing tag for "pt-16" section
  - Fixed extra closing div tag in family-details.tsx after Dialog component
  - Corrected indentation issues throughout both components for proper JSX structure
  - Application now starts successfully and runs on port 5000
  - **CONFIRMED WORKING** - All JSX syntax errors resolved and app is operational
- **Implemented flexbox-based layout architecture**
  - Completely restructured app from fixed positioning to flexbox containers
  - Removed Replit development banner that could interfere with layout
  - Changed sidebar from fixed to flex-shrink-0 within flex container
  - Applied overflow-y-auto to main content areas for natural scrolling
  - Set height: 100% on html, body, and #root for proper flexbox flow
  - Created consistent layout structure across all pages using flex columns and rows
  - **IN PROGRESS** - Testing needed to confirm scrolling works on all pages
- **Enhanced calendar closures system with rule-based network defaults**
  - Added rule field to calendar_closures table for descriptive holiday rules
  - Made date field nullable for network default holidays that use rules instead of specific dates
  - Updated 10 network default holidays to use descriptive rules (e.g., "First Monday in September")
  - Modified frontend interface to show rules instead of dates for system holidays
  - Updated sorting logic to use predefined school year order instead of date-based sorting
  - System holidays now display flexible rules like "First Monday in September" instead of hardcoded dates
- **Fixed JSX syntax error** in family-details.tsx causing app startup failure
  - Added missing `</main>` and container closing tags
  - Corrected component structure and indentation
- **Fixed routing 404 flash issue** for School Settings navigation
  - Updated Sidebar component to use Wouter `Link` components instead of HTML `<a>` tags
  - Added proper client-side routing with active state detection
  - Eliminated brief 404 page flash when navigating to settings
- **Implemented complete classroom CRUD functionality**
  - Added edit classroom mutation with proper API integration
  - Added delete classroom mutation with confirmation flow
  - Created custom AlertDialog for delete confirmations replacing browser confirm()
  - Connected edit and delete buttons with proper click handlers
  - Added edit classroom dialog with form fields and validation
  - All classroom operations (create, read, update, delete) now fully functional
- **Migrated role system from enums to database tables for flexibility**
  - Created role_definitions table with core system roles supporting future customization
  - Replaced enum-based roles with database-driven role assignments
  - Updated user_roles table to reference role definitions instead of hardcoded values
  - Added support for network-wide, school-specific, and classroom-specific role scoping
  - Updated role selector to display only main role categories (parent, educator, board_director, systems_administrator)
  - System now supports custom roles per school while maintaining core operational roles
  - Created Matthew's complete role structure: parent (billing/custodian) at school level, educator (school admin + classroom guide) at school/classroom level, systems admin at network level
- **Implemented time-based role management with audit trail**
  - Added start_date (defaults to current timestamp) and end_date fields to user_roles table
  - Updated storage layer to filter roles by active status and time validity
  - Roles must be active=true and within start/end date range to be considered valid
  - Created API endpoints for role history and role termination
  - New roles automatically get start_date set to current timestamp
  - Role history preserved through soft deletion (setting active=false and end_date)
- **Completed 5-level hierarchical role system with embedded naming and CSV integration**
  - **Level 1 (Top Categories):** educator, parent, board, sysadmin (single word names)
  - **Level 2 (Sub-categories):** educator_admin, educator_classroom, parent_billing, parent_custodian, board_chair, etc.
  - **Level 3 (Phase Categories):** educator_admin_startup, educator_admin_ongoing, educator_classroom_lead, etc.
  - **Level 4 (CSV Categories):** educator_admin_startup_marketing, educator_admin_ongoing_finance, etc.
  - **Level 5 (Specific Tasks):** educator_admin_startup_marketing_logo, educator_admin_ongoing_finance_budget, etc.
  - **Hierarchical Naming System:** Full path embedded in role name (e.g., educator_classroom_assistant)
  - **Three Name Fields:** name (hierarchical), display_name (human readable), simple_name (single word)
  - **Removed category column** - hierarchy now determined from embedded naming structure
  - **Renamed isSystemRole to networkDefault** for consistency with other tables
  - **Example Full Hierarchy:** educator → educator_admin → educator_admin_startup → educator_admin_startup_marketing → educator_admin_startup_marketing_logo
  - **Startup Categories (10):** board, marketing, finances, licensing, facility, program, family, admissions, insurance, vendors
  - **Ongoing Categories (21):** admissions, assessment, board, communications, compliance, curriculum, data, equity, facility, family, finance, food, fundraising, hr, legal, licensing, health, support, technology, culture, liaison
  - **Sample Level 5 Roles:** community engagement, logo design, social media, website design, real estate search, renovation estimates, lease review, bookkeeper oversight, budget monitoring, payroll processing
  - **Classroom Roles:** educator_classroom_lead, educator_classroom_assistant, educator_classroom_aide
  - **Board Roles:** board_chair, board_treasurer, board_secretary, board_member
  - **Parent Roles:** parent_billing, parent_custodian
  - **Systems Admin Role:** sysadmin_administrator
  - **Storage Layer Updates:** Replaced category-based filtering with name prefix filtering for role queries
  - Updated IStorage interface to use getRolesByNamePrefix instead of getRolesByCategory
  - Addressed "Multiple Roles per Person" open issue with flexible role assignment system
  - User can now hold multiple simultaneous roles across different operational areas
- **Fixed role switcher to work with Level 1 hierarchy and made settings always visible in navigation**
  - Updated role switcher to extract Level 1 categories from hierarchical role names
  - Fixed role display names to match new Level 1 naming (board, educator, parent, sysadmin)
  - Made School Settings visible for all roles instead of disappearing on role changes
  - **Complete Level 5 CSV Integration:** Added all 155 specific tasks from CSV files
    - **33 startup tasks** covering board formation, marketing, finances, licensing, facility setup
    - **122 ongoing operational tasks** covering all daily school management responsibilities
    - **Full CSV mapping** from startup worksheet and ongoing operations spreadsheet
    - Tasks span from high-level (fundraising efforts) to specific (purchase printer/scanner/copier)
    - Complete coverage of Wildflower school operational requirements
- **Migrated all ID fields from varchar to UUID for consistency**
  - Updated users table ID from varchar to UUID with proper defaultRandom()
  - Updated all user_id foreign key references across all tables to UUID
  - Preserved user data and role assignments during migration
  - All ID fields now consistently use UUID format across the entire schema
  - Recreated foreign key constraints with proper UUID references
  - **Fixed role definition UUIDs:** Replaced simple repeating digit patterns with proper random UUIDs
    - Level 1 roles (board, educator, parent, systems_admin) now use proper UUIDs
    - Level 2 roles (all sub-categories) now use proper UUIDs instead of repeated patterns
    - Updated all foreign key references and maintained data integrity during migration
- **Completed functional role switching system with compact navigation**
  - Fixed apiRequest function call format to properly handle POST requests for role switching
  - Role switching now works seamlessly between all categories (Parent, Educator, Board Director, Systems Administrator)
  - Optimized top navigation layout with compact role selector (80px width) and tighter spacing
  - Grouped notifications, messages, and user profile with 4px spacing for better visual hierarchy
  - Simplified user avatar to display only profile circle without name/chevron for cleaner look
  - Added proper spacing between WildflowerOS logo and role selector for balanced layout
  - Category-based role switching automatically selects first available role in chosen category
- **Implemented multiple email address system for users**
  - Created email_addresses table linking to users table for flexible email management
  - Added support for multiple email types: personal, work_twf, work_wf_school, work_non_wf
  - Implemented primary email flag with unique constraint per user
  - Added comprehensive API endpoints for email CRUD operations
  - Login email automatically copied to email_addresses table as primary personal email
  - Storage layer methods handle email creation, update, deletion, and primary assignment
- **Simplified left navigation structure**
  - Removed "School Management" category and sub-items (Staff Management, Analytics)
  - Kept only "School Settings" as standalone navigation item for role-based access
  - Cleaner navigation hierarchy with direct access to essential school configuration
- **Enhanced top navigation spacing and usability**
  - Increased role selector width from 80px to 128px for better readability
  - Improved text sizing and icon spacing throughout top navigation bar
  - Added more spacing between notification icons and user profile section
  - Added chevron icon to user avatar dropdown for better visual indication across all device sizes
- **Updated mobile bottom navigation to mirror desktop sidebar**
  - Replaced generic mobile nav items with exact desktop sidebar navigation items
  - Added proper active state detection and routing with Wouter Link components
  - Integrated role-based school settings visibility for mobile users
  - Mobile navigation now provides consistent experience across all device sizes
- **Fixed school year creation functionality**
  - Resolved date handling issue where HTML date inputs were passing strings instead of Date objects
  - Added proper date conversion in createSchoolYear storage method
  - Added schoolId field to school_years table to associate years with specific schools (nullable for network-wide years)
  - Added networkDefault boolean field to identify network-wide default school years
  - Updated storage methods to return both school-specific and network-wide default years
  - Fixed Dialog accessibility warning by adding DialogDescription component
  - School year creation now works properly with start/end date validation
  - **CONFIRMED WORKING** - User successfully tested school year creation functionality
- **Implemented classroom program type differentiation**
  - Added programType field to classrooms table with enum values: continuous, school_year
  - Infant and toddler classrooms default to continuous program type
  - All other age levels default to school_year program type
  - Updated storage methods to auto-set program type based on classroom level
  - Program type can be explicitly overridden during classroom creation/editing
- **Completed comprehensive academic calendar system**
  - Created academic_calendars table linked to school years for calendar management
  - Added calendar_closures table for tracking holidays, breaks, and school closure dates
  - Implemented full CRUD operations for academic calendars and closures
  - Added first/last day of school date tracking
  - Built comprehensive academic calendar UI with school year overview, calendar settings, and holiday management
  - Added edit and delete functionality for school years with proper confirmation dialogs
  - Academic calendar dialog accessible through calendar button on each school year
  - Full API integration with proper error handling and toast notifications
  - **Removed hardcoded Academic Calendar placeholder data** and replaced with dynamic system
    - Eliminated static Fall Break, Winter Break, Spring Break display cards
    - Academic calendar now shows only real data from database through school year selection
    - Calendar management happens through individual school year dialogs, not static overview
- **Implemented comprehensive classroom scheduling and program offerings system**
  - Removed days-of-week fields from academic calendar (moved to classroom level)
  - Created classroom_schedules table with start/end dates, isActive flag, and operational days/hours
  - Continuous programs get schedules with optional end dates for flexibility
  - School year programs get schedules per school year with mid-year adjustment capability
  - Created program_offerings table for flexible enrollment options (full-day, half-day, before/after care)
  - Program offerings support different day combinations and time slots
  - Added comprehensive API routes for schedule and offering CRUD operations
  - Database changes applied successfully with proper foreign key relationships
  - Storage layer methods handle date conversions and active schedule detection
  - Academic calendar UI updated with explanatory note about classroom-level scheduling
- **Implemented comprehensive tuition plans and sliding scale pricing system**
  - Created tuition_plans table linking to program offerings with full pricing and billing frequency options
  - Each tuition plan references a sliding scale policy for flexible income-based pricing
  - Created sliding_scale_policies table for schools to manage pricing policies with start/end dates
  - Created sliding_scale_rules table with income ranges and discount percentages
  - Default sliding scale policy: 90% discount for <$50k income, 20% for $50k-$150k, 0% for >$150k
  - Tuition plans support monthly, quarterly, annually, and weekly billing frequencies
  - Schools can create new sliding scale policies and deactivate old ones while preserving history
  - Comprehensive API routes for tuition plan and sliding scale policy CRUD operations
  - Storage layer handles date conversions and policy activation/deactivation logic
  - System supports version control for sliding scale policies with proper audit trails
- **Implemented survey-based role assignment system for formal staff discussions**
  - Replaced drag-and-drop role assignment with formal survey and discussion process
  - Created role_survey_responses table with 3-question format per role: skill/experience (1-10), enthusiasm (1-10), growth interest (yes/no)
  - Built role assignment matrix showing survey responses with staff across top, roles down left side
  - Added radio button selection for final role assignments with color-coded assigned vs unassigned roles
  - Created final_role_assignments table for tracking official role assignments by school year
  - Survey grid interface allows staff to rate themselves for each role systematically
  - Assignment matrix displays all survey responses to guide formal discussion process
  - System ensures only one person can be assigned per role using unique constraints
  - Added assignment history tracking with school year context and audit trail
  - Fixed user ID references to use varchar instead of UUID for proper schema consistency
- **Completed functional school selector for educators without school assignments**
  - Added school selector popup that appears when educators switch to educator mode without school assignments
  - Created `/api/educator-admins` endpoint to fetch unique people with educator_admin roles at schools
  - Fixed duplicate user entries by grouping by user+school instead of showing multiple roles per person
  - Added fallback names using email prefix for users without first/last names (e.g., "matthew.kramer User")
  - Implemented session-based school context persistence with `/api/user/set-school-context` endpoint
  - Fixed React key duplication errors that were causing popup malfunction after selection
  - Updated current role endpoint to use emulated school ID for educators without direct school assignments
  - School selection now persists across page reloads and prevents popup re-triggering
  - Fixed React import error in school settings page that was causing crashes
  - **CONFIRMED WORKING** - User successfully tested school selection with proper persistence
- **Implemented comprehensive role-based settings interface**
  - Updated navigation label from "School Settings" to "Settings" for universal access
  - **System Administrator View:** Three-tab interface with Non-School Users, Schools, and Sensible Defaults
    - Sensible Defaults tab contains default templates for Roles, Role Assignments, School Years, Schedules, Tuition Plans, and Public Subsidies
    - Includes role definitions and assignment process templates that new schools will inherit
    - Default role assignment survey questions and workflow steps configurable at network level
    - Excludes staff and classroom tabs as they are not applicable for network-wide defaults
    - Default settings will be inherited by new schools upon creation
  - **Enhanced System Administrator functionality for school year management:**
    - **System Holidays component** replaces academic calendar overview in Sensible Defaults
      - Table of common school holidays with standard rules (Labor Day, Thanksgiving, Winter Break, etc.)
      - Add, edit, and delete holiday functionality with descriptive rules
      - Network-wide holiday templates that new schools can inherit
    - **Modified school year creation dialog** for system administrators
      - Changed subtitle to "Create a new school year with dates for outer boundaries"
      - Auto-populates dates to July 1 - June 30 when year is entered (e.g., "2024-2025" → July 1, 2024 - June 30, 2025)
      - Removed calendar icons from school year list items (no specific calendar management at system level)
    - System-level school year management focuses on outer boundary dates rather than specific academic calendars
  - **Parent View:** Family-focused settings with Family Info, Enrollment, Billing, and Communication tabs
    - Family information management and contact updates
    - Enrollment status and application management
    - Billing preferences and payment method management
    - Communication preference settings for school updates
  - **Board Member View:** Governance-focused interface with Meetings, Documents, Finances, and Policies tabs
    - Board meeting agendas, minutes, and scheduling
    - Access to bylaws, resolutions, and governance documents
    - Financial oversight with budgets and audit materials
    - Policy review and approval workflows
  - **Educator View:** Existing comprehensive school management interface (unchanged)
    - Staff management, classroom operations, school years, schedules, tuition plans, and subsidies
  - Role detection automatically renders appropriate interface based on user's current role prefix
  - All role views designed with placeholder content areas ready for future implementation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Styling**: CSS-in-JS with CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with conventional routes
- **WebSocket**: Real-time communication support
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: `/shared/schema.ts` for type-safe database operations
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Role-based access control with multiple roles per user
- **Roles**: teacher_leader, teacher, assistant, aide, parent, board_member, central_staff, network_admin

### Core Domain Models
- **Users & Roles**: Flexible role assignment with school/entity context
- **Schools & Classrooms**: Multi-school support with classroom management
  - **Education Levels**: Authentic Wildflower age ranges from original application
    - Infant (0-18 months), Toddler (18 months - 3 years), Primary (3-6 years)
    - Lower Elementary (6-9 years), Upper Elementary (9-12 years)
    - Junior High (12-15 years), High School (15-18 years)
- **Families & Children**: Family-centric enrollment and management
- **Tasks & Messages**: Communication and workflow management
- **Billing & Finance**: Tuition management and payment processing
- **Knowledge Base**: Posts, questions, answers, tags, ratings, and views
- **Onboarding**: Checklists, items, and completion tracking
- **Templates & Policies**: Document templates and policy management
- **Board Governance**: Meetings, resolutions, and voting system
- **Attendance & Assessments**: Student tracking and evaluation
- **Analytics**: Enrollment projections and fundraising analytics

### User Interface Components
- **Responsive Design**: Mobile-first with desktop optimization
- **Component Library**: Comprehensive shadcn/ui component set
- **Navigation**: Context-aware sidebar and mobile bottom navigation
- **Dashboard**: Role-specific widgets and quick actions
- **Real-time Updates**: WebSocket integration for live updates

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: OIDC redirect → session creation → user context retrieval
2. **API Requests**: RESTful endpoints with JSON payloads
3. **Real-time Events**: WebSocket for notifications and live updates
4. **Error Handling**: Centralized error boundaries with toast notifications

### Data Management
1. **Schema Definition**: Shared TypeScript types between client and server
2. **Validation**: Zod schemas for runtime type checking
3. **Queries**: TanStack Query with automatic caching and revalidation
4. **Mutations**: Optimistic updates with rollback on failure

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit OIDC provider
- **Build Tools**: Vite, TypeScript, PostCSS, Autoprefixer

### UI & Styling
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Icons**: Font Awesome (referenced in components)
- **Styling**: Tailwind CSS with custom design tokens

### Development Tools
- **Runtime Error Handling**: Replit error overlay for development
- **Code Splitting**: Vite-based automatic splitting
- **Hot Reload**: Vite HMR with React Fast Refresh

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Full-stack hot reload with Vite middleware
- **Database**: Neon development database with Drizzle migrations

### Production Build
- **Frontend**: Vite production build to `/dist/public`
- **Backend**: ESBuild bundling of Express server to `/dist`
- **Static Assets**: Served from Express in production mode
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID required

### Deployment Process
1. **Build Step**: `npm run build` creates optimized client and server bundles
2. **Database Migration**: `npm run db:push` applies schema changes
3. **Runtime**: Single Node.js process serving both API and static files
4. **Session Storage**: PostgreSQL sessions table for user authentication

## Architecture Decisions

### Database Choice
- **Problem**: Need reliable, scalable database with good TypeScript integration
- **Solution**: PostgreSQL with Drizzle ORM
- **Rationale**: Type-safe queries, excellent migration system, serverless-ready

### UI Framework Selection
- **Problem**: Need consistent, accessible UI components
- **Solution**: Radix UI with Tailwind CSS and shadcn/ui
- **Rationale**: Unstyled primitives with full customization, excellent accessibility

### Authentication Strategy
- **Problem**: Secure authentication for educational platform
- **Solution**: Replit OIDC with session-based auth
- **Rationale**: Leverages existing educational accounts, secure by default

### Real-time Communication
- **Problem**: Need live updates for collaborative features
- **Solution**: WebSocket integration with fallback to polling
- **Rationale**: Real-time user experience without complex infrastructure