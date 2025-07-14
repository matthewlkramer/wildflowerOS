# Wildflower Schools Network Platform

## Overview

This is a unified digital platform for the Wildflower Schools Network - a decentralized community of small, Montessori, teacher-led schools. The application serves teacher-leaders, staff, families, and administrators to manage school operations, student enrollment, communication, billing, and governance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 14, 2025
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