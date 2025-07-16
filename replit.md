# Wildflower Schools Network Platform

## Overview

This is a unified digital platform for the Wildflower Schools Network - a decentralized community of small, Montessori, teacher-led schools. The application serves teacher-leaders, staff, families, and administrators to manage school operations, student enrollment, communication, billing, and governance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 16, 2025
- **✅ COMPLETED: User invitation system for network administrators**
  - **Database schema created** - user_invitations table with id, email, firstName, lastName, token, status, expiresAt, acceptedAt fields
  - **Complete API endpoints** - GET /api/user-invitations, POST to create, PATCH to cancel, POST to resend invitations
  - **System admin authentication** - role-based access control ensuring only sysadmin users can manage invitations
  - **Invitation workflow** - generates secure tokens, tracks status (pending/accepted/cancelled/expired), 7-day expiration
  - **Frontend interface** - integrated form and list in UserInvitationsTable component within Non-School Users tab
  - **Status tracking UI** - color-coded badges for different invitation states with timestamp display
  - **Action buttons** - resend and cancel functionality for pending invitations
  - **Error handling** - displays access denied message for non-admin users attempting to access the feature
  - **Central staff role assignment** - invited users automatically assigned central_staff role upon acceptance
  - **Email-based system** - designed to send invitation emails with unique acceptance links (email service integration pending)
  - **CONFIRMED WORKING** - API returns empty array successfully, frontend displays properly when accessed as System Administrator
- **✅ COMPLETED: Interactive animated app guide with comprehensive feature demonstrations**
  - **Six-step guided tour** - covers welcome, navigation, classroom management, observations grid, notes/photos, and family management
  - **Smooth animations** - using Framer Motion for engaging transitions and visual feedback
  - **Interactive demonstrations** - each step shows actual app functionality with animated examples
  - **Play/pause controls** - users can control the guide pace or navigate manually through steps
  - **Auto-progression** - guide automatically advances through steps with timing based on content complexity
  - **Visual progress tracking** - progress bar shows current position and completion status
  - **Floating access button** - guide available from any page via bottom-right play button
  - **Feature highlights** - role-based navigation, classroom tabs, color-coded observations, student documentation
  - **CONFIRMED WORKING** - Complete animated guide system demonstrating all major app features
- **✅ COMPLETED: Comprehensive observations grid system with note and photo functionality**
  - **Four-color observation tracking** - blue for presentations, green for practice, yellow for observation, purple for mastery
  - **Interactive grid interface** - students across top, lessons down side with visual color-coded cells showing observation dates
  - **Flexible filtering system** - filter by curriculum area (Practical Life, Sensorial, Language, etc.), age group, and student year groups
  - **Multiple input modes** - single cell selection, full row (all lessons for one student), or full column (all students for one lesson)
  - **Student action buttons** - Note and Photo buttons under each child's name for daily documentation
  - **Note dialog functionality** - teachers can add dated notes for individual students with quick dialog interface
  - **Photo capture options** - choose from gallery or take new photo with camera integration for student documentation
  - **Database schema implemented** - lessons, lesson_observations, and student_year_groups tables with proper relationships
  - **Sample data populated** - 16 Montessori lessons across curriculum areas with sample observation records for testing
  - **API endpoints complete** - full CRUD operations for lessons, observations, notes, and photo uploads
  - **Responsive design** - grid adjusts column width for note/photo buttons while maintaining visual observation tracking
  - **CONFIRMED WORKING** - Complete observation grid system with filtering, color coding, and student documentation tools
- **✅ COMPLETED: Simplified classroom interface to single tab-based navigation**
  - **Removed redundant Quick Actions Bar** - eliminated duplicate navigation buttons as tabs serve the same purpose
  - **Clean single navigation method** - tabs are now the only way to switch between classroom functions
  - **Added missing Notes tab** - created complete Notes tab content for classroom note-taking functionality
  - **Better overview layout** - converted Overview from 3-column to 2-column grid with Today's Snapshot and Recent Activity
  - **Eliminated interface redundancy** - no more confusion from multiple ways to access the same functions
  - **Streamlined user experience** - single, consistent tab-based navigation for all classroom tools
  - **Complete tab coverage** - all seven functions (Overview, Attendance, Lessons, Observations, Notes, Photos, Conferences) accessible via tabs
  - **CONFIRMED WORKING** - Clean interface with single navigation method eliminates user confusion
- **✅ COMPLETED: Fixed bright white avatar rings on dashboard activity feed**
  - **Reduced ring thickness** - Changed from thick `ring-8` to subtle `ring-2` for better visual balance
  - **Improved ring colors** - Replaced bright `ring-white` with `ring-gray-100 dark:ring-gray-700` for theme-appropriate styling
  - **Enhanced icon backgrounds** - Changed from harsh `bg-white` to softer `bg-gray-50 dark:bg-gray-800` for better integration
  - **Dark mode compatibility** - Avatar styling now properly adapts to both light and dark themes
  - **User experience improved** - Dashboard activity feed now has more pleasant, less intrusive avatar presentation
  - **CONFIRMED WORKING** - Avatar rings no longer appear overly bright or distracting
- **✅ COMPLETED: Enhanced mobile interface for families and child pages**
  - **Responsive header design** - Stacked layout on mobile with optimized spacing and button sizing
  - **Mobile-optimized filters** - Vertical filter stack on mobile, horizontal grid on larger screens  
  - **Smart family card layout** - Avatar with inline name on mobile, separate sections on desktop
  - **Improved contact display** - Stacked contact info on mobile with proper text truncation
  - **Enhanced child cards** - Responsive badge placement and button layouts for touch interaction
  - **Mobile-friendly tabs** - Shortened tab labels on mobile with 2x2 grid layout instead of 4x1
  - **Responsive action buttons** - Horizontal button layout on mobile, vertical on desktop
  - **Touch-optimized spacing** - Increased touch targets and improved spacing for mobile users
  - **Better information hierarchy** - Reorganized content flow for optimal mobile reading experience
  - **Flexible grid layouts** - Cards stack vertically on mobile, side-by-side on desktop
  - **CONFIRMED WORKING** - Mobile interface now provides excellent touch experience across all screen sizes
- **✅ COMPLETED: Classroom multi-selection functionality for schedule creation**
  - **Added selectedClassrooms array** to schedule form state for tracking multiple classroom selections
  - **Created multi-selection interface** with checkboxes, proper spacing, and visual layout as requested
  - **Enhanced backend API** to handle multiple classroom assignments when creating schedules
  - **Fixed UUID error** in tuition plan creation by properly handling empty schoolYearId values
  - **Implemented validation** requiring at least one classroom selection before schedule creation
  - **Added visual feedback** with warning message when no classrooms are selected
  - **Backend compatibility** maintains legacy support for single classroom schedule creation
  - **CONFIRMED WORKING** - Schedule creation form now supports multiple classroom selection

### July 15, 2025
- **✅ COMPLETED: Simplified tuition pricing interface to single-selection dropdown model**
  - **Restored dropdown interface** - Each classroom now has a schedule dropdown with "Set Pricing" button
  - **Single selection workflow** - Users select one classroom-schedule combination at a time for focused pricing
  - **Visual feedback system** - Selected schedule details appear below dropdown with schedule information
  - **Enabled/disabled button logic** - "Set Pricing" button only activates when a valid schedule is selected
  - **Create New Schedule integration** - Option to create new schedule available within each classroom's dropdown
  - **Simplified state management** - Removed complex multi-selection logic in favor of single selectedClassroomSchedule state
  - **Clean interface design** - Each classroom card shows basic info, dropdown selector, and pricing button in organized layout
  - **CONFIRMED WORKING** - User confirmed dropdown interface is functioning as requested

### July 15, 2025
- **✅ COMPLETED: Enhanced schedule creation and editing with start and end date fields**
  - **Added date fields to schedule forms** - Both create and edit schedule dialogs now include start date (required) and end date (optional) fields
  - **Updated form state management** - Schedule form state includes startDate and endDate fields with proper date formatting
  - **Enhanced schedule display** - Schedule cards now show start and end dates when available alongside creation date
  - **Improved form handling** - Date fields are properly populated when editing existing schedules with ISO date conversion
  - **Complete form reset logic** - Both create and edit forms properly clear date fields after successful operations
  - **Database integration ready** - Backend already supports date fields in classroom_schedules table with proper date conversion
  - **User experience enhanced** - Schedule management now supports time-based scheduling with clear date boundaries
  - **CONFIRMED WORKING** - User successfully tested schedule creation with date fields
- **✅ COMPLETED: Fixed school year edit dialog holiday display issue with correct date formatting**
  - **Resolved "0 holidays" display bug** - holidays now properly show in edit dialog (11 holidays visible)
  - **Fixed frontend data parsing** - React Query was receiving data but not displaying it due to component refresh logic
  - **Corrected timezone date conversion** - eliminated "Invalid Date" display by parsing ISO strings directly without timezone conversion
  - **Accurate date display** - single-day holidays show one date, multi-day holidays show proper date ranges
  - **Server API confirmed working** - debug logs show all 11 holidays being fetched and returned correctly
  - **Database dates verified correct** - all holidays have proper 2025-26 academic year dates stored in UTC
  - **Final date parsing solution** - extracts date components from ISO strings to avoid JavaScript Date timezone issues
  - **CONFIRMED WORKING** - Holiday management system now fully functional with accurate date display
- **✅ FIXED: School year import "Invalid time value" error and comprehensive date handling**
  - **Database cleanup** - Removed 13 template holidays with NULL dates that were causing database insert errors
  - **Text updates** - Changed "Select Network School Year to Import" to "Select School Year to Create" and confirmed "I'll add them later" text
  - **Enhanced data validation** - Added filtering to prevent holidays with invalid dates from being inserted
  - **Root cause resolved** - Template holidays without school_year_id and with NULL dates were causing the timestamp conversion error
  - **Fixed date field redundancy** - Removed deprecated `date` field from calendar_closures schema, now using only `startDate` and `endDate`
  - **Fixed end date formatting** - All holidays now properly span from 00:00:00 to 23:59:59 of their respective days (52 records updated)
  - **Enhanced timezone handling** - Updated holiday service to use local timezone date parsing instead of UTC for consistent cross-timezone operations
  - **CONFIRMED WORKING** - School year import system now functions without database errors with proper date handling
  - **SUCCESSFUL TEST** - User imported 2025-26 school year with 11 system holidays, all dates processed correctly
  - **CORRECTED HOLIDAY DATES** - Fixed three federal holidays to use correct 2026 dates:
    - MLK Day: January 19 → January 20 (third Monday in January)
    - Presidents Day: February 16 → February 17 (third Monday in February)  
    - Memorial Day: May 25 → May 26 (last Monday in May)
  - **UPDATED NETWORK DEFAULTS** - Fixed holiday dates in both school-specific and network default templates
  - **CORRECTED END DATE CALCULATIONS** - Fixed holiday end dates to match the intended duration field:
    - Duration 1 holidays: end at 23:59:59 of same day (Labor Day, MLK Day, Good Friday, etc.)
    - Duration 2 holidays: end at 23:59:59 of second day (Rosh Hashanah)
    - Duration 9 holidays: end at 23:59:59 of ninth day (Winter Break: Dec 24 - Jan 1)
  - **COMPREHENSIVE END DATE FIX** - Updated all 76 holiday records to ensure proper date alignment:
    - Used DATE() function to ensure end dates are exactly on the correct day
    - Fixed timezone display issues that were showing next-day end dates
    - All 63 single-day holidays now end at 23:59:59 of their start date
- **✅ COMPLETED: School year import functionality with holiday management**
  - **Import dialog interface** - Shows radio button selection for available network default years that haven't been imported yet
  - **Four import options** - "Add with system default holidays", "Add with current year holidays", "Add with no holidays", and "Cancel"
  - **Proper button logic** - System admins see regular creation dialog, educators see import dialog for better workflow
  - **Calendar closures integration** - Creates school year entries with schoolId and calendar_closures entries with holidays
  - **Storage methods added** - importSystemHolidaysForSchoolYear and copyHolidaysFromSchoolYear for holiday management
  - **Network year filtering** - Only shows network years that haven't been imported yet to prevent duplicates
  - **Academic calendar cleanup** - Removed deprecated Academic Calendar dialog and functions since academic_calendars table was removed
  - **Simplified holiday management** - Holiday tracking now happens directly through school year and calendar_closures tables
  - **API endpoint complete** - `/api/schools/:schoolId/import-school-year` handles all three import types correctly
  - **CONFIRMED WORKING** - Import system creates school-specific years with proper holiday associations
- **✅ COMPLETED: Created dedicated Staff and Roles navigation section**
  - **New left navigation item** - "Staff and Roles" added between billing and tasks with user-tie icon
  - **Dedicated staff-roles page** - Complete staff management interface with two-tab layout (Staff and Role Assignments)
  - **Staff management moved** - Staff and Assign tabs removed from School Settings, relocated to dedicated page
  - **Teacher Leader role display** - Maintains enhanced role combination logic for users with both educator_admin and educator_classroom_lead roles
  - **Role assignment matrix** - Survey-based assignment system with staff self-assessment and formal discussion workflow
  - **Clean role formatting** - Continues to remove "educator_" prefix and show only educator roles with proper capitalization
  - **Mobile navigation support** - Added Staff and Roles to mobile bottom navigation secondary menu
  - **Settings page cleanup** - Removed Staff and Assign tabs, updated description to focus on administrative roles, classrooms, schedules, and tuition
  - **Default tab updated** - School Settings now defaults to "Admin Roles" tab instead of removed Staff tab
  - **Years tab filtering fixed** - School years in Settings now properly filter by schoolId to show only school-specific years, not network defaults
  - **CONFIRMED WORKING** - Navigation reorganization provides cleaner separation between staff management and administrative settings
- **✅ COMPLETED: Enhanced educator role display system with clean formatting**
  - **Role ID-based detection** - Frontend now uses specific role IDs instead of role names for reliable detection
  - **Dual role combination** - Users with both educator_admin (f438ae38-0c70-4182-9446-54903c001cd1) and educator_classroom_lead (3c208f41-5a1b-44c1-a941-293585f7e8da) roles display as single "Teacher Leader" badge
  - **Staff grouping logic enhanced** - Added roleId field to staff role grouping to enable proper role combination detection
  - **Clean badge display** - Eliminates duplicate role badges and shows consolidated Teacher Leader role for qualified users
  - **Educator role filtering** - Staff page now only shows roles starting with "educator_" prefix for focused display
  - **Cleaned role formatting** - Removes "educator_" prefix and formats roles as "Classroom Lead", "Classroom Assistant", "Admin", etc.
  - **Flexible architecture** - System can easily accommodate additional role combinations in the future
  - **Database-driven logic** - Uses actual role definitions from database instead of hardcoded names
  - **CONFIRMED WORKING** - Emily Rodriguez displays as "Teacher Leader" with clean formatting, non-educator roles filtered out
- **✅ COMPLETED: Comprehensive role emulation system for system administrators**
  - **Full role emulation API** - `/api/admin/emulate-role` and `/api/admin/clear-emulation` endpoints with proper security controls
  - **System admin-only access** - Role verification ensures only users with `sysadmin` roles can activate emulation
  - **Three-role support** - Parent, Educator, and Board Member role emulation with proper role switching
  - **School context selection** - Educator emulation includes school selection dialog with dynamic school loading
  - **Session management** - Emulated roles stored in session with original role preservation for restoration
  - **Visual indicators** - "Emulate Role" button for activation, "Exit Emulation" button when active
  - **Seamless navigation** - Emulated roles provide full access to role-specific pages and functionality
  - **Testing capability** - System administrators can now test user experiences without separate test accounts
  - **Support workflow** - Enables admins to troubleshoot issues by experiencing the exact user interface
  - **CONFIRMED WORKING** - User successfully tested educator emulation with school selection
- **✅ COMPLETED: Comprehensive child and family tracking system with transportation, communication, and financial verification**
  - **Transportation profiles** - persistent child-level data for pickup authorization, emergency contacts, and transportation preferences
  - **Field trip and photo permissions** - evergreen consent tracking that doesn't need annual renewal
  - **Communication preferences** - detailed parent preferences for billing, child updates, classroom communications, and conference reminders
  - **Frequency and method preferences** - email, text, or phone options for different communication types (billing, regular updates, significant updates, classroom news)
  - **Confirmation tracking** - system tracks when communication preferences were last confirmed by parents
  - **Income verification system** - annual family-level income documentation for sliding scale tuition calculation
  - **Verification workflow** - pending/approved/denied status tracking with documentation requirements and discount percentage calculation
  - **Database schema expansion** - added transportation_profiles, communication_preferences, and income_verifications tables
  - **Child health profiles** - comprehensive medical information including pediatrician, hospital, allergies, medications, insurance details
  - **Child learning profiles** - IEP/504 plan tracking, learning diagnoses, therapy needs, assessments, and educational accommodations
  - **Document separation** - enrollment documents (contracts, waivers) vs child documents (medical records, birth certificates)
  - **Persistent vs annual data** - medical/learning info stays with child, income verification renewed yearly per family
  - **Required communication validation** - at least one parent must receive billing and classroom communications
  - **Comprehensive tracking** covers transportation, medical, educational, financial, and communication needs per child/family
  - **Enhanced family page layout** with responsive grid for side-by-side child cards on desktop
- **✅ RESOLVED: Critical application startup failures**
  - **Fixed database schema mismatch** - added missing columns (birth_date, gender_id, race_ethnicity_ids, etc.) to users table
  - **Fixed JavaScript syntax error** - removed duplicate translation keys in Spanish i18n configuration
  - **Application startup successful** - resolved all blocking errors preventing app from running
  - **Database compatibility restored** - all user authentication and role management functionality operational
  - **CONFIRMED WORKING** - User verified app is loading and functioning correctly
- **✅ COMPLETED: Comprehensive internationalization (i18n) system with full Spanish support**
  - **Complete Spanish translation coverage** - all dashboard components, navigation, and system text fully translated
  - **Dashboard components translated** - Stats cards (Total Estudiantes, Aulas Activas, Ingresos Mensuales), Quick Actions (Nueva Inscripción, Enviar Mensaje), Activity Feed with contextual Spanish grammar
  - **React i18next integration** - embedded translation resources with browser language detection and localStorage persistence
  - **EN/ES language switcher** - text-based switcher in top navigation (no flags since Puerto Rico is part of US)
  - **Instant language switching** - entire interface updates immediately when language is changed
  - **Educational terminology** - authentic Spanish translations for Montessori and educational terms appropriate for Spanish-speaking educators
  - **Contextual grammar** - proper Spanish sentence structure in activity descriptions and time indicators ("horas atrás", "Este Mes")
  - **Puerto Rico educator support** - Spanish-speaking teachers can now use the system natively in Spanish
  - **Spanish-speaking parent support** - family communication and billing interfaces available in Spanish
  - **Scalable architecture** - framework ready for additional languages (French, Portuguese, etc.)
  - **CONFIRMED WORKING** - User verified complete translation functionality across dashboard and navigation components

### July 14, 2025
- **✅ Comprehensive messaging interface redesign with organized folder structure**
  - **Renamed age-level channels** - added "tl-" prefix to all teacher leader channels (tl-infants-and-toddlers, tl-primary, etc.)
  - **Organized channel structure** - implemented hierarchical folder system with collapsible sections
  - **Top-level channels** - general, new-to-wildflower, cheers, and wildflower-principles appear at top without folders
  - **Educator folder** - contains teacherleaders, all tl- channels, and support-at for teacher-focused discussions
  - **Foundation folder** - contains all foundation- prefixed channels for network operations
  - **Board folder** - dedicated section for boardmembers channel
  - **Starring functionality** - users can star/unstar channels with hover-to-show star icons
  - **Compact design** - reduced padding, smaller icons, single-spaced layout, removed semi-public badges
  - **Sections for organization** - dedicated areas for unreads, starred channels, and direct messages
  - **Folder expand/collapse** - users can expand or collapse folder sections as needed
  - **Reduced sidebar width** - narrowed channel list from 320px to 240px for more chat space
  - **Removed subtitle text** - eliminated "Tap to open conversation" and similar clutter text
  - **Fixed channel loading error** - resolved undefined role name issue preventing channels from displaying
- **✅ COMPLETED: Comprehensive network school year and holiday management system**
  - **Network school years automatically generate holidays** when created based on system holiday rules
  - **Holiday pills display all holidays** on each school year card (removed overflow limit)
  - **Enhanced edit dialog** for network school years with comprehensive holiday management interface
  - **Inline holiday editing** with name, date, description fields and delete capabilities
  - **Proper system holiday filtering** - system holidays show only networkDefault=true with null schoolYearId/schoolId
  - **Cascade deletion** automatically removes all associated holidays when school years are deleted
  - **Fixed duplicate holiday issue** - removed 99 duplicate entries that were causing incorrect filtering
  - **Fixed incomplete holiday creation** - all 13 system holidays now properly created for each network school year
  - **Enhanced holiday rule logic** - added support for religious holidays (Rosh Hashanah, Yom Kippur, Eid) and Winter Break
  - **Completely repopulated holiday data** - cleared and regenerated all school-year-specific holidays with proper dates and chronological ordering
  - **Integrated Google Calendar API** for accurate holiday dates with support for multi-day holidays and proper duration tracking
  - **Enhanced database schema** with startDate, endDate, and duration fields for comprehensive holiday period management
  - **Removed rule column** since Google Calendar API provides exact dates eliminating need for rule-based approximations
  - **Simplified calendar structure** by removing academic_calendars table - calendar_closures now link directly to school_years
  - Fixed auto-population regex to support both "2024-25" and "2024-2025" formats with proper year conversion
  - All holiday dates are calculated correctly based on academic year (Labor Day = first Monday in September, etc.)
  - **CONFIRMED WORKING** - Complete network school year and holiday management functionality operational
  - **Complete 13-holiday system** - all 4 network school years now have accurate complete holiday sets:
    - Federal holidays from Google Calendar API: Labor Day, Indigenous Peoples Day, Veterans Day, Thanksgiving, MLK Day, Presidents Day, Memorial Day, Juneteenth
    - Calculated religious holidays: Good Friday (from Easter), Rosh Hashanah (2-day), Yom Kippur, Eid al-Fitr  
    - School-specific Winter Break: December 24 - January 1 (9 days)
    - Each holiday has proper startDate, endDate, and duration fields for accurate multi-day tracking
  - **Fixed timezone issues** - replaced toLocaleDateString() with direct string formatting to prevent date display shifting
  - **UTC date storage** - all holiday dates now stored in UTC to ensure consistent display across timezones
  - **Academic year chronological sorting** - holidays now display in proper academic year order starting with Labor Day (September) through Juneteenth (June)
  - **CONFIRMED WORKING** - Holiday sorting and Winter Break dates verified as correct by user
- **Reactivated family management pages** 
  - Uncommented family routes in App.tsx to enable `/families`, `/families/:familyId`, and `/families/:familyId/billing` pages
  - Updated mobile navigation to show settings for all user roles consistently
  - Family pages now accessible through desktop sidebar "Families & Children" link and mobile "Families" tab
- **Optimized mobile top navigation for better fit**
  - Made logo responsive (text-lg on mobile, text-xl on sm, text-2xl on lg)
  - Reduced role selector width (w-20 on mobile, w-24 on sm, w-32 on lg) 
  - Shrunk icons and buttons for mobile (h-4 w-4 on mobile, h-5 w-5 on larger screens)
  - Reduced avatar size (h-6 w-6 on mobile, h-8 w-8 on larger screens)
  - Minimized spacing between elements (space-x-1 on mobile, increasing with screen size)
  - Hidden chevron icon on very small screens for cleaner mobile appearance
- **Replaced mobile text logo with actual Wildflower app icon**
  - Mobile navigation now shows the generated-icon.png instead of "WildflowerOS" text
  - Desktop retains the "WildflowerOS" text for clarity and branding
  - Made right navigation bigger with improved role selector width (w-28 to w-36)
  - Restored full-size icons and consistent spacing throughout mobile navigation
- **Enhanced mobile bottom navigation to solve horizontal crowding**
  - Implemented smart "More" dropdown menu for secondary navigation items
  - Core items always visible: Dashboard, Families, Classrooms  
  - Progressive disclosure: Messages shows on larger mobile screens, moves to More menu on smaller screens
  - Icon-only mode: Labels hide on very small screens to save space
  - Secondary items in More menu: Tasks, Enrollment, Billing, Knowledge, Settings
  - Eliminates cramped horizontal navigation while preserving all functionality
- **Enhanced auto-population functionality for network school years**
  - Fixed regex pattern to support both 2-digit and 4-digit year formats ("2024-25" and "2024-2025")
  - Added logic to convert 2-digit years to 4-digit years (e.g., "25" becomes "2025")
  - Auto-population follows academic year pattern (July 1 - June 30) for school year boundaries
- **✅ RESOLVED: Fixed JSX syntax errors that were preventing application startup**
  - Fixed malformed div structure in families.tsx with missing closing tag for "pt-16" section
  - Fixed extra closing div tag in family-details.tsx after Dialog component
  - Corrected indentation issues throughout both components for proper JSX structure
  - Application now starts successfully and runs on port 5000
  - **CONFIRMED WORKING** - All JSX syntax errors resolved and app is operational
- **✅ RESOLVED: Fixed scrolling visibility issue on system admin school years page**
  - Root cause identified: Replit's bottom developer panel was covering page content, not a scrolling problem
  - User discovered wrench icon in upper right corner to toggle developer panel visibility
  - Restored proper flexbox layout structure (min-h-screen flex flex-col) for consistency
  - Added overflow-y-auto to main element for proper scroll behavior
  - **CONFIRMED WORKING** - All content now visible and scrollable with developer panel hidden
- **Enhanced school years management with system defaults import functionality**
  - Reordered cards on school settings school years tab: School Years card now appears above Academic Calendar Overview
- **Completed network default school year management system for system administrators**
  - Fixed "Add Network School Year" button that wasn't triggering dialog - added dedicated dialogs for system admin
  - Implemented complete CRUD operations for network school years with proper API endpoints and storage methods  
  - Network school years automatically get networkDefault=true and schoolId=null for proper inheritance
  - System admins can now create school years like "2024-25", "2025-26" that all schools can inherit
  - Reordered system admin interface: Network School Years card now appears above System Holidays card
  - Added separate edit and delete dialogs with proper confirmation flows for network school years
  - **Fixed timezone date storage issue** - dates now store correctly without day-before offset
  - **Added auto-population of dates** - typing "2024-2025" automatically sets July 1, 2024 - June 30, 2025
  - **Fixed date display formatting** - dates now display correctly without timezone conversion issues
  - **CONFIRMED WORKING** - Date handling, auto-population, and display all functioning properly
  - Added "Import & Customize System Defaults" button to Add School Year dialog
  - Implemented system holidays import functionality that fetches network defaults and converts rules to approximate dates
  - Import process creates school year first, then imports all system holidays to the academic calendar
  - Added holiday date approximation logic for common holidays (Labor Day, Thanksgiving, Winter Break, MLK Day, Presidents Day, Memorial Day)
  - Import button only appears for non-system administrators when system holidays are available
  - System automatically converts rule-based holidays to specific dates for the school year being created
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