import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertMessageSchema, insertChannelSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email (fallback for old sessions)
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user roles and schools using the actual user ID
      const roles = await storage.getUserRoles(user.id);
      const schools = await storage.getSchoolsByUser(user.id);
      
      res.json({
        ...user,
        roles,
        schools
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User role management routes
  app.get('/api/user/roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userRoles = await storage.getUserRoles(user.id);
      
      // Get role definitions once (more efficient)
      const roleDefinitions = await storage.getRoleDefinitions();
      
      // Enrich user roles with role definition data
      const rolesWithDefinitions = userRoles.map((userRole) => {
        const roleDefinition = roleDefinitions.find(rd => rd.id === userRole.roleId);
        return {
          ...userRole,
          roleName: roleDefinition?.name,
          roleDisplayName: roleDefinition?.displayName,
          roleCategory: roleDefinition?.category,
          roleDescription: roleDefinition?.description
        };
      });
      
      res.json(rolesWithDefinitions);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.get('/api/user/current-role', isAuthenticated, async (req: any, res) => {
    try {
      const currentRoleId = req.session.currentRoleId;
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if we're in emulation mode
      if (req.session.emulationMode && currentRoleId === 'emulated-role') {
        const emulationMode = req.session.emulationMode;
        const syntheticRole = {
          id: 'emulated-role',
          userId: user.id,
          roleId: emulationMode.emulatedRoleDefinition.id,
          schoolId: emulationMode.schoolId || null,
          active: true,
          roleName: emulationMode.emulatedRoleDefinition.name,
          roleDisplayName: emulationMode.emulatedRoleDefinition.displayName,
          roleCategory: emulationMode.emulatedRoleDefinition.category,
          roleDescription: emulationMode.emulatedRoleDefinition.description,
          isEmulated: true
        };
        return res.json(syntheticRole);
      }
      
      const userRoles = await storage.getUserRoles(user.id);
      
      // Get role definitions for enrichment
      const roleDefinitions = await storage.getRoleDefinitions();
      
      if (!currentRoleId) {
        // If no role is set, get the first active role
        const activeRoles = userRoles.filter(role => role.active);
        
        if (activeRoles.length > 0) {
          req.session.currentRoleId = activeRoles[0].id;
          const roleDefinition = roleDefinitions.find(rd => rd.id === activeRoles[0].roleId);
          const enrichedRole = {
            ...activeRoles[0],
            roleName: roleDefinition?.name,
            roleDisplayName: roleDefinition?.displayName,
            roleCategory: roleDefinition?.category,
            roleDescription: roleDefinition?.description
          };
          return res.json(enrichedRole);
        }
        
        return res.json(null);
      }

      // Get the current role details
      const currentRole = userRoles.find(role => role.id === currentRoleId);
      
      if (!currentRole || !currentRole.active) {
        // Role no longer exists or is inactive, clear it
        req.session.currentRoleId = null;
        return res.json(null);
      }

      // Enrich with role definition
      const roleDefinition = roleDefinitions.find(rd => rd.id === currentRole.roleId);
      let enrichedRole = {
        ...currentRole,
        roleName: roleDefinition?.name,
        roleDisplayName: roleDefinition?.displayName,
        roleCategory: roleDefinition?.category,
        roleDescription: roleDefinition?.description
      };

      // If educator role without school ID, check for emulated school context
      if (roleDefinition?.name?.startsWith('educator') && !enrichedRole.schoolId && req.session.emulatedSchoolId) {
        console.log('Using emulated school ID:', req.session.emulatedSchoolId);
        enrichedRole.schoolId = req.session.emulatedSchoolId;
      }

      res.json(enrichedRole);
    } catch (error) {
      console.error("Error fetching current role:", error);
      res.status(500).json({ message: "Failed to fetch current role" });
    }
  });

  app.post('/api/user/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const { roleId } = req.body;
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify the user has this role and it's active
      const userRoles = await storage.getUserRoles(user.id);
      const targetRole = userRoles.find(role => role.id === roleId && role.active);

      if (!targetRole) {
        return res.status(400).json({ message: "Invalid role or role not active" });
      }

      // Enrich with role definition
      const roleDefinitions = await storage.getRoleDefinitions();
      const roleDefinition = roleDefinitions.find(rd => rd.id === targetRole.roleId);
      const enrichedRole = {
        ...targetRole,
        roleName: roleDefinition?.name,
        roleDisplayName: roleDefinition?.displayName,
        roleCategory: roleDefinition?.category,
        roleDescription: roleDefinition?.description
      };

      // Set the current role in session
      req.session.currentRoleId = roleId;
      
      // Save session
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ success: true, currentRole: enrichedRole });
      });
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // Get schools for emulation
  app.get('/api/schools', isAuthenticated, async (req: any, res) => {
    try {
      const schools = await storage.getSchools();
      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  // System admin role emulation system
  app.post('/api/admin/emulate-role', isAuthenticated, async (req: any, res) => {
    try {
      const { roleType, schoolId } = req.body;
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a system admin
      const userRoles = await storage.getUserRoles(user.id);
      const roleDefinitions = await storage.getRoleDefinitions();
      const isSystemAdmin = userRoles.some(role => {
        const roleDefinition = roleDefinitions.find(rd => rd.id === role.roleId);
        return roleDefinition?.name?.startsWith('sysadmin') && role.active;
      });
      
      if (!isSystemAdmin) {
        return res.status(403).json({ message: "Only system administrators can emulate roles" });
      }
      
      // Store original role for restoration
      const originalRoleId = req.session.currentRoleId;
      
      // Create a synthetic role for emulation
      const emulatedRoleDefinition = roleDefinitions.find(rd => rd.name.startsWith(roleType));
      
      if (!emulatedRoleDefinition) {
        return res.status(400).json({ message: "Invalid role type for emulation" });
      }
      
      // Set emulation mode in session
      req.session.emulationMode = {
        roleType,
        schoolId,
        originalRoleId,
        emulatedRoleDefinition
      };
      
      // Create synthetic role object for current session
      const syntheticRole = {
        id: 'emulated-role',
        userId: user.id,
        roleId: emulatedRoleDefinition.id,
        schoolId: schoolId || null,
        active: true,
        roleName: emulatedRoleDefinition.name,
        roleDisplayName: emulatedRoleDefinition.displayName,
        roleCategory: emulatedRoleDefinition.category,
        roleDescription: emulatedRoleDefinition.description
      };
      
      // Set as current role
      req.session.currentRoleId = 'emulated-role';
      req.session.emulatedSchoolId = schoolId;
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving emulation session:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ 
          success: true,
          message: "Role emulation activated",
          emulatingRole: roleType,
          schoolId: schoolId || null,
          currentRole: syntheticRole
        });
      });
    } catch (error) {
      console.error("Error setting role emulation:", error);
      res.status(500).json({ message: "Failed to set role emulation" });
    }
  });

  app.post('/api/admin/clear-emulation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a system admin
      const userRoles = await storage.getUserRoles(user.id);
      const roleDefinitions = await storage.getRoleDefinitions();
      const isSystemAdmin = userRoles.some(role => {
        const roleDefinition = roleDefinitions.find(rd => rd.id === role.roleId);
        return roleDefinition?.name?.startsWith('sysadmin') && role.active;
      });
      
      if (!isSystemAdmin) {
        return res.status(403).json({ message: "Only system administrators can clear emulation" });
      }
      
      // Restore original role if it was stored
      if (req.session.emulationMode?.originalRoleId) {
        req.session.currentRoleId = req.session.emulationMode.originalRoleId;
      } else {
        // Find first sysadmin role
        const sysadminRole = userRoles.find(role => role.roleName?.startsWith('sysadmin') && role.active);
        if (sysadminRole) {
          req.session.currentRoleId = sysadminRole.id;
        }
      }
      
      // Clear emulation mode
      req.session.emulationMode = null;
      req.session.emulatedSchoolId = null;
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ success: true, message: "Role emulation cleared" });
      });
    } catch (error) {
      console.error("Error clearing role emulation:", error);
      res.status(500).json({ message: "Failed to clear role emulation" });
    }
  });

  // Get educator admins for emulation (used by school selector)
  app.get('/api/educator-admins', isAuthenticated, async (req: any, res) => {
    try {
      console.log('API: Fetching educator admins for emulation');
      const educators = await storage.getEducatorAdminsForEmulation();
      console.log('API: Found', educators.length, 'educators');
      res.json(educators);
    } catch (error) {
      console.error("Error fetching educator admins:", error);
      res.status(500).json({ message: "Failed to fetch educator admins" });
    }
  });

  // Set school context for emulation
  app.post('/api/user/set-school-context', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.body;
      console.log('Setting school context to:', schoolId);
      req.session.emulatedSchoolId = schoolId;
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ success: true, schoolId });
      });
    } catch (error) {
      console.error("Error setting school context:", error);
      res.status(500).json({ message: "Failed to set school context" });
    }
  });

  // Get all user roles including history
  app.get('/api/user/roles/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const allRoles = await storage.getAllUserRoles(user.id);
      
      // Get role definitions for enrichment
      const roleDefinitions = await storage.getRoleDefinitions();
      
      // Enrich roles with definition details
      const enrichedRoles = allRoles.map(role => {
        const roleDefinition = roleDefinitions.find(rd => rd.id === role.roleId);
        return {
          ...role,
          roleName: roleDefinition?.name,
          roleDisplayName: roleDefinition?.displayName,
          roleCategory: roleDefinition?.category,
          roleDescription: roleDefinition?.description
        };
      });
      
      res.json(enrichedRoles);
    } catch (error) {
      console.error("Error fetching user role history:", error);
      res.status(500).json({ message: "Failed to fetch role history" });
    }
  });

  // End a user role (archive it)
  app.post('/api/user/roles/:id/end', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { endDate } = req.body;
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify the user owns this role
      const userRoles = await storage.getAllUserRoles(user.id);
      const targetRole = userRoles.find(role => role.id === id);
      
      if (!targetRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      // End the role
      const endedRole = await storage.endUserRole(id, endDate ? new Date(endDate) : undefined);
      
      // Clear current role if it was the active one
      if (req.session.currentRoleId === id) {
        req.session.currentRoleId = null;
      }
      
      res.json({ success: true, role: endedRole });
    } catch (error) {
      console.error("Error ending user role:", error);
      res.status(500).json({ message: "Failed to end role" });
    }
  });

  // Email address management
  app.get('/api/user/emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const emails = await storage.getEmailAddressesByUser(userId);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching user emails:", error);
      res.status(500).json({ message: "Failed to fetch user emails" });
    }
  });

  app.post('/api/user/emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const emailData = { ...req.body, userId };
      const email = await storage.addEmailAddress(emailData);
      res.status(201).json(email);
    } catch (error) {
      console.error("Error adding email:", error);
      res.status(500).json({ message: "Failed to add email address" });
    }
  });

  app.put('/api/user/emails/:emailId', isAuthenticated, async (req: any, res) => {
    try {
      const { emailId } = req.params;
      const email = await storage.updateEmailAddress(emailId, req.body);
      res.json(email);
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(500).json({ message: "Failed to update email address" });
    }
  });

  app.delete('/api/user/emails/:emailId', isAuthenticated, async (req: any, res) => {
    try {
      const { emailId } = req.params;
      await storage.deleteEmailAddress(emailId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ message: "Failed to delete email address" });
    }
  });

  app.patch('/api/user/emails/:emailId/set-primary', isAuthenticated, async (req: any, res) => {
    try {
      const { emailId } = req.params;
      const userId = req.user.id;
      await storage.setPrimaryEmailAddress(userId, emailId);
      res.status(204).send();
    } catch (error) {
      console.error("Error setting primary email:", error);
      res.status(500).json({ message: "Failed to set primary email" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats/:schoolId', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const stats = await storage.getDashboardStats(schoolId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Schools
  app.get('/api/schools', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const schools = await storage.getSchoolsByUser(user.id);
      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  app.get('/api/schools/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const school = await storage.getSchoolById(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      res.json(school);
    } catch (error) {
      console.error("Error fetching school:", error);
      res.status(500).json({ message: "Failed to fetch school" });
    }
  });

  // Classrooms
  app.get('/api/schools/:schoolId/classrooms', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const classrooms = await storage.getClassroomsBySchool(schoolId);
      
      // Get enrollment counts for each classroom
      const classroomsWithCounts = await Promise.all(
        classrooms.map(async (classroom) => {
          const enrollments = await storage.getEnrollmentsByClassroom(classroom.id);
          return {
            ...classroom,
            currentEnrollment: enrollments.length,
            enrollmentPercentage: classroom.capacity ? Math.round((enrollments.length / classroom.capacity) * 100) : 0
          };
        })
      );
      
      res.json(classroomsWithCounts);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      res.status(500).json({ message: "Failed to fetch classrooms" });
    }
  });

  app.post('/api/schools/:schoolId/classrooms', isAuthenticated, async (req: any, res) => {
    try {
      const classroom = await storage.createClassroom(req.body);
      res.status(201).json(classroom);
    } catch (error) {
      console.error("Error creating classroom:", error);
      res.status(500).json({ message: "Failed to create classroom" });
    }
  });

  app.patch('/api/classrooms/:classroomId', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const classroom = await storage.updateClassroom(classroomId, req.body);
      res.json(classroom);
    } catch (error) {
      console.error("Error updating classroom:", error);
      res.status(500).json({ message: "Failed to update classroom" });
    }
  });

  app.delete('/api/classrooms/:classroomId', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      await storage.deleteClassroom(classroomId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting classroom:", error);
      res.status(500).json({ message: "Failed to delete classroom" });
    }
  });

  // Get individual classroom details
  app.get('/api/classrooms/:classroomId', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const classroom = await storage.getClassroomById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      res.json(classroom);
    } catch (error) {
      console.error("Error fetching classroom:", error);
      res.status(500).json({ message: "Failed to fetch classroom" });
    }
  });

  // Get students in a classroom
  app.get('/api/classrooms/:classroomId/students', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const students = await storage.getEnrollmentsByClassroom(classroomId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching classroom students:", error);
      res.status(500).json({ message: "Failed to fetch classroom students" });
    }
  });

  // Staff management
  app.get('/api/schools/:schoolId/staff', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const staff = await storage.getStaffBySchool(schoolId);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post('/api/schools/:schoolId/staff', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const staffData = req.body;
      
      // Use the new createStaffMember method
      const result = await storage.createStaffMember({
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        coreRole: staffData.coreRole,
        schoolId,
        startDate: staffData.startDate ? new Date(staffData.startDate) : new Date()
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding staff:", error);
      res.status(500).json({ message: "Failed to add staff member" });
    }
  });

  // Tuition plans
  app.get('/api/schools/:schoolId/tuition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const tuitionPlans = await storage.getTuitionPlansBySchool(schoolId);
      res.json(tuitionPlans);
    } catch (error) {
      console.error("Error fetching tuition plans:", error);
      res.status(500).json({ message: "Failed to fetch tuition plans" });
    }
  });

  app.post('/api/schools/:schoolId/tuition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const tuitionPlan = await storage.createTuitionPlan(req.body);
      res.status(201).json(tuitionPlan);
    } catch (error) {
      console.error("Error creating tuition plan:", error);
      res.status(500).json({ message: "Failed to create tuition plan" });
    }
  });

  // School years
  app.get('/api/schools/:schoolId/school-years', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const schoolYears = await storage.getSchoolYearsBySchool(schoolId);
      res.json(schoolYears);
    } catch (error) {
      console.error("Error fetching school years:", error);
      res.status(500).json({ message: "Failed to fetch school years" });
    }
  });

  app.post('/api/schools/:schoolId/school-years', isAuthenticated, async (req: any, res) => {
    try {
      const schoolYear = await storage.createSchoolYear(req.body);
      res.status(201).json(schoolYear);
    } catch (error) {
      console.error("Error creating school year:", error);
      res.status(500).json({ message: "Failed to create school year" });
    }
  });

  app.get('/api/school-years/:yearId', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      const schoolYear = await storage.getSchoolYearById(yearId);
      if (!schoolYear) {
        return res.status(404).json({ message: "School year not found" });
      }
      res.json(schoolYear);
    } catch (error) {
      console.error("Error fetching school year:", error);
      res.status(500).json({ message: "Failed to fetch school year" });
    }
  });

  app.patch('/api/school-years/:yearId', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      const schoolYear = await storage.updateSchoolYear(yearId, req.body);
      res.json(schoolYear);
    } catch (error) {
      console.error("Error updating school year:", error);
      res.status(500).json({ message: "Failed to update school year" });
    }
  });

  app.delete('/api/school-years/:yearId', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      await storage.deleteSchoolYear(yearId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting school year:", error);
      res.status(500).json({ message: "Failed to delete school year" });
    }
  });

  app.patch('/api/school-years/:yearId/set-active', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      const schoolYear = await storage.setActiveSchoolYear(yearId);
      res.json(schoolYear);
    } catch (error) {
      console.error("Error setting active school year:", error);
      res.status(500).json({ message: "Failed to set active school year" });
    }
  });

  // Import school year from network defaults
  app.post('/api/schools/:schoolId/import-school-year', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { networkYearId, importType, schoolStartDate, schoolEndDate } = req.body;
      
      // Validate date inputs
      if (!schoolStartDate || !schoolEndDate) {
        return res.status(400).json({ message: "School start date and end date are required" });
      }
      
      // Get the network school year
      const networkYear = await storage.getSchoolYearById(networkYearId);
      if (!networkYear) {
        return res.status(404).json({ message: "Network school year not found" });
      }
      
      // Safely convert dates with validation
      const startDate = new Date(schoolStartDate);
      const endDate = new Date(schoolEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format provided" });
      }
      
      // Create the school-specific year with custom dates
      const schoolYear = await storage.createSchoolYear({
        schoolId,
        name: networkYear.name,
        startDate,
        endDate,
        isActive: false,
        networkDefault: false
      });
      
      // Handle holiday import based on type
      if (importType === 'system_holidays') {
        // Import system default holidays for this year
        await storage.importSystemHolidaysForSchoolYear(schoolYear.id);
      } else if (importType === 'current_year_holidays') {
        // Copy holidays from most recent school year (active or latest)
        const activeYear = await storage.getActiveSchoolYear(schoolId);
        if (activeYear) {
          await storage.copyHolidaysFromSchoolYear(activeYear.id, schoolYear.id);
        } else {
          // If no active year, get the most recent school year
          const recentYear = await storage.getMostRecentSchoolYear(schoolId);
          if (recentYear) {
            await storage.copyHolidaysFromSchoolYear(recentYear.id, schoolYear.id);
          }
        }
      }
      // For 'no_holidays', we don't add any holidays
      
      res.status(201).json(schoolYear);
    } catch (error) {
      console.error("Error importing school year:", error);
      res.status(500).json({ message: "Failed to import school year" });
    }
  });

  // Academic Calendar routes
  app.get('/api/school-years/:yearId/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      const calendar = await storage.getAcademicCalendarBySchoolYear(yearId);
      res.json(calendar);
    } catch (error) {
      console.error("Error fetching academic calendar:", error);
      res.status(500).json({ message: "Failed to fetch academic calendar" });
    }
  });

  app.post('/api/school-years/:yearId/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const { yearId } = req.params;
      const calendarData = { ...req.body, schoolYearId: yearId };
      const calendar = await storage.createAcademicCalendar(calendarData);
      res.status(201).json(calendar);
    } catch (error) {
      console.error("Error creating academic calendar:", error);
      res.status(500).json({ message: "Failed to create academic calendar" });
    }
  });

  app.patch('/api/academic-calendars/:calendarId', isAuthenticated, async (req: any, res) => {
    try {
      const { calendarId } = req.params;
      const calendar = await storage.updateAcademicCalendar(calendarId, req.body);
      res.json(calendar);
    } catch (error) {
      console.error("Error updating academic calendar:", error);
      res.status(500).json({ message: "Failed to update academic calendar" });
    }
  });

  app.delete('/api/academic-calendars/:calendarId', isAuthenticated, async (req: any, res) => {
    try {
      const { calendarId } = req.params;
      await storage.deleteAcademicCalendar(calendarId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting academic calendar:", error);
      res.status(500).json({ message: "Failed to delete academic calendar" });
    }
  });

  // Calendar Closure routes
  app.get('/api/academic-calendars/:calendarId/closures', isAuthenticated, async (req: any, res) => {
    try {
      const { calendarId } = req.params;
      const closures = await storage.getCalendarClosuresByCalendar(calendarId);
      res.json(closures);
    } catch (error) {
      console.error("Error fetching calendar closures:", error);
      res.status(500).json({ message: "Failed to fetch calendar closures" });
    }
  });

  app.get('/api/school-years/:schoolYearId/closures', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolYearId } = req.params;
      console.log(`DEBUG: Fetching closures for school year: ${schoolYearId}`);
      const closures = await storage.getCalendarClosuresBySchoolYear(schoolYearId);
      console.log(`DEBUG: Found ${closures.length} closures:`, closures.map(c => c.name));
      res.json(closures);
    } catch (error) {
      console.error("Error fetching school year closures:", error);
      res.status(500).json({ message: "Failed to fetch school year closures" });
    }
  });

  app.post('/api/school-years/:schoolYearId/closures', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolYearId } = req.params;
      const closureData = { ...req.body, schoolYearId };
      const closure = await storage.createCalendarClosure(closureData);
      res.status(201).json(closure);
    } catch (error) {
      console.error("Error creating calendar closure:", error);
      res.status(500).json({ message: "Failed to create calendar closure" });
    }
  });

  app.patch('/api/calendar-closures/:closureId', isAuthenticated, async (req: any, res) => {
    try {
      const { closureId } = req.params;
      const closure = await storage.updateCalendarClosure(closureId, req.body);
      res.json(closure);
    } catch (error) {
      console.error("Error updating calendar closure:", error);
      res.status(500).json({ message: "Failed to update calendar closure" });
    }
  });

  app.delete('/api/calendar-closures/:closureId', isAuthenticated, async (req: any, res) => {
    try {
      const { closureId } = req.params;
      await storage.deleteCalendarClosure(closureId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calendar closure:", error);
      res.status(500).json({ message: "Failed to delete calendar closure" });
    }
  });

  // Classroom Schedules
  app.get('/api/schools/:schoolId/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const schedules = await storage.getClassroomSchedulesBySchool(schoolId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching school schedules:", error);
      res.status(500).json({ message: "Failed to fetch school schedules" });
    }
  });

  app.get('/api/network/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const schedules = await storage.getNetworkDefaultSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching network default schedules:", error);
      res.status(500).json({ message: "Failed to fetch network default schedules" });
    }
  });

  app.post('/api/schools/:schoolId/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { classroomIds, ...scheduleData } = req.body;
      
      if (classroomIds && Array.isArray(classroomIds) && classroomIds.length > 0) {
        // Create a schedule for each selected classroom
        const createdSchedules = [];
        for (const classroomId of classroomIds) {
          const schedule = await storage.createClassroomSchedule({
            ...scheduleData,
            schoolId,
            classroomId,
            networkDefault: false
          });
          createdSchedules.push(schedule);
        }
        res.status(201).json(createdSchedules);
      } else {
        // Fallback for single schedule creation (legacy support)
        const schedule = await storage.createClassroomSchedule({
          ...scheduleData,
          schoolId,
          networkDefault: false
        });
        res.status(201).json(schedule);
      }
    } catch (error) {
      console.error("Error creating school schedule:", error);
      res.status(500).json({ message: "Failed to create school schedule" });
    }
  });

  app.post('/api/network/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const schedule = await storage.createNetworkDefaultSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating network default schedule:", error);
      res.status(500).json({ message: "Failed to create network default schedule" });
    }
  });

  app.patch('/api/schedules/:scheduleId', isAuthenticated, async (req: any, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.updateClassroomSchedule(scheduleId, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  app.delete('/api/schedules/:scheduleId', isAuthenticated, async (req: any, res) => {
    try {
      const { scheduleId } = req.params;
      await storage.deleteClassroomSchedule(scheduleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  app.post('/api/schools/:schoolId/schedules/import-network-defaults', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const result = await storage.importNetworkSchedulesToSchool(schoolId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error importing network schedules:", error);
      res.status(500).json({ message: "Failed to import network schedules" });
    }
  });

  app.get('/api/classrooms/:classroomId/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const schedules = await storage.getSchedulesByClassroom(classroomId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching classroom schedules:", error);
      res.status(500).json({ message: "Failed to fetch classroom schedules" });
    }
  });

  app.get('/api/classrooms/:classroomId/schedules/active', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const schedule = await storage.getActiveScheduleByClassroom(classroomId);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching active classroom schedule:", error);
      res.status(500).json({ message: "Failed to fetch active classroom schedule" });
    }
  });

  app.post('/api/classrooms/:classroomId/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const scheduleData = { ...req.body, classroomId };
      const schedule = await storage.createClassroomSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating classroom schedule:", error);
      res.status(500).json({ message: "Failed to create classroom schedule" });
    }
  });

  app.patch('/api/classroom-schedules/:scheduleId', isAuthenticated, async (req: any, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.updateClassroomSchedule(scheduleId, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating classroom schedule:", error);
      res.status(500).json({ message: "Failed to update classroom schedule" });
    }
  });

  app.delete('/api/classroom-schedules/:scheduleId', isAuthenticated, async (req: any, res) => {
    try {
      const { scheduleId } = req.params;
      await storage.deleteClassroomSchedule(scheduleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting classroom schedule:", error);
      res.status(500).json({ message: "Failed to delete classroom schedule" });
    }
  });

  // Program Offerings
  app.get('/api/classrooms/:classroomId/program-offerings', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const { schoolYearId } = req.query;
      
      let offerings;
      if (schoolYearId) {
        offerings = await storage.getProgramOfferingsBySchoolYear(classroomId, schoolYearId as string);
      } else {
        offerings = await storage.getProgramOfferingsByClassroom(classroomId);
      }
      
      res.json(offerings);
    } catch (error) {
      console.error("Error fetching program offerings:", error);
      res.status(500).json({ message: "Failed to fetch program offerings" });
    }
  });

  app.post('/api/classrooms/:classroomId/program-offerings', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const offeringData = { ...req.body, classroomId };
      const offering = await storage.createProgramOffering(offeringData);
      res.status(201).json(offering);
    } catch (error) {
      console.error("Error creating program offering:", error);
      res.status(500).json({ message: "Failed to create program offering" });
    }
  });

  app.patch('/api/program-offerings/:offeringId', isAuthenticated, async (req: any, res) => {
    try {
      const { offeringId } = req.params;
      const offering = await storage.updateProgramOffering(offeringId, req.body);
      res.json(offering);
    } catch (error) {
      console.error("Error updating program offering:", error);
      res.status(500).json({ message: "Failed to update program offering" });
    }
  });

  app.delete('/api/program-offerings/:offeringId', isAuthenticated, async (req: any, res) => {
    try {
      const { offeringId } = req.params;
      await storage.deleteProgramOffering(offeringId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting program offering:", error);
      res.status(500).json({ message: "Failed to delete program offering" });
    }
  });

  // Tuition Plans
  app.get('/api/program-offerings/:offeringId/tuition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { offeringId } = req.params;
      const plans = await storage.getTuitionPlansByProgramOffering(offeringId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching tuition plans:", error);
      res.status(500).json({ message: "Failed to fetch tuition plans" });
    }
  });

  app.get('/api/classrooms/:classroomId/tuition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const plans = await storage.getTuitionPlansByClassroom(classroomId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching classroom tuition plans:", error);
      res.status(500).json({ message: "Failed to fetch classroom tuition plans" });
    }
  });

  app.get('/api/schools/:schoolId/tuition-overview', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const classrooms = await storage.getClassroomsWithSchedulesForTuition(schoolId);
      const plans = await storage.getTuitionPlansWithCalculations(schoolId);
      res.json({ classrooms, plans });
    } catch (error) {
      console.error("Error fetching tuition overview:", error);
      res.status(500).json({ message: "Failed to fetch tuition overview" });
    }
  });

  app.post('/api/tuition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await storage.createTuitionPlan(req.body);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating tuition plan:", error);
      res.status(500).json({ message: "Failed to create tuition plan" });
    }
  });

  app.patch('/api/tuition-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      const plan = await storage.updateTuitionPlan(planId, req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error updating tuition plan:", error);
      res.status(500).json({ message: "Failed to update tuition plan" });
    }
  });

  app.delete('/api/tuition-plans/:planId', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      await storage.deleteTuitionPlan(planId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tuition plan:", error);
      res.status(500).json({ message: "Failed to delete tuition plan" });
    }
  });

  // Sliding Scale Policies
  app.get('/api/schools/:schoolId/sliding-scale-policies', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { active } = req.query;
      
      let policies;
      if (active === 'true') {
        policies = await storage.getActiveSlidingScalePoliciesBySchool(schoolId);
      } else {
        policies = await storage.getSlidingScalePoliciesBySchool(schoolId);
      }
      
      res.json(policies);
    } catch (error) {
      console.error("Error fetching sliding scale policies:", error);
      res.status(500).json({ message: "Failed to fetch sliding scale policies" });
    }
  });

  app.get('/api/sliding-scale-policies/:policyId', isAuthenticated, async (req: any, res) => {
    try {
      const { policyId } = req.params;
      const policy = await storage.getSlidingScalePolicyWithRules(policyId);
      if (!policy) {
        return res.status(404).json({ message: "Sliding scale policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching sliding scale policy:", error);
      res.status(500).json({ message: "Failed to fetch sliding scale policy" });
    }
  });

  app.post('/api/schools/:schoolId/sliding-scale-policies', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { rules, ...policyData } = req.body;
      const policy = await storage.createSlidingScalePolicy(
        { ...policyData, schoolId },
        rules || []
      );
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating sliding scale policy:", error);
      res.status(500).json({ message: "Failed to create sliding scale policy" });
    }
  });

  app.patch('/api/sliding-scale-policies/:policyId', isAuthenticated, async (req: any, res) => {
    try {
      const { policyId } = req.params;
      const policy = await storage.updateSlidingScalePolicy(policyId, req.body);
      res.json(policy);
    } catch (error) {
      console.error("Error updating sliding scale policy:", error);
      res.status(500).json({ message: "Failed to update sliding scale policy" });
    }
  });

  app.post('/api/sliding-scale-policies/:policyId/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const { policyId } = req.params;
      const policy = await storage.deactivateSlidingScalePolicy(policyId);
      res.json(policy);
    } catch (error) {
      console.error("Error deactivating sliding scale policy:", error);
      res.status(500).json({ message: "Failed to deactivate sliding scale policy" });
    }
  });

  app.delete('/api/sliding-scale-policies/:policyId', isAuthenticated, async (req: any, res) => {
    try {
      const { policyId } = req.params;
      await storage.deleteSlidingScalePolicy(policyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sliding scale policy:", error);
      res.status(500).json({ message: "Failed to delete sliding scale policy" });
    }
  });

  // ======================== PUBLIC SUBSIDY PROGRAMS ========================

  app.get('/api/schools/:schoolId/public-subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const programs = await storage.getPublicSubsidyProgramsBySchool(schoolId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching public subsidy programs:", error);
      res.status(500).json({ message: "Failed to fetch public subsidy programs" });
    }
  });

  app.get('/api/schools/:schoolId/public-subsidies/active', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const programs = await storage.getActivePublicSubsidyProgramsBySchool(schoolId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching active public subsidy programs:", error);
      res.status(500).json({ message: "Failed to fetch active public subsidy programs" });
    }
  });

  app.get('/api/public-subsidies/:programId', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const program = await storage.getPublicSubsidyProgramById(programId);
      if (!program) {
        return res.status(404).json({ message: "Public subsidy program not found" });
      }
      res.json(program);
    } catch (error) {
      console.error("Error fetching public subsidy program:", error);
      res.status(500).json({ message: "Failed to fetch public subsidy program" });
    }
  });

  app.post('/api/schools/:schoolId/public-subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const programData = { ...req.body, schoolId };
      const program = await storage.createPublicSubsidyProgram(programData);
      res.status(201).json(program);
    } catch (error) {
      console.error("Error creating public subsidy program:", error);
      res.status(500).json({ message: "Failed to create public subsidy program" });
    }
  });

  app.patch('/api/public-subsidies/:programId', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const program = await storage.updatePublicSubsidyProgram(programId, req.body);
      res.json(program);
    } catch (error) {
      console.error("Error updating public subsidy program:", error);
      res.status(500).json({ message: "Failed to update public subsidy program" });
    }
  });

  app.post('/api/public-subsidies/:programId/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const program = await storage.deactivatePublicSubsidyProgram(programId);
      res.json(program);
    } catch (error) {
      console.error("Error deactivating public subsidy program:", error);
      res.status(500).json({ message: "Failed to deactivate public subsidy program" });
    }
  });

  app.delete('/api/public-subsidies/:programId', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      await storage.deletePublicSubsidyProgram(programId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting public subsidy program:", error);
      res.status(500).json({ message: "Failed to delete public subsidy program" });
    }
  });

  // ======================== SUBSIDY RATES ========================

  app.get('/api/public-subsidies/:programId/rates', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const rates = await storage.getSubsidyRatesByProgram(programId);
      res.json(rates);
    } catch (error) {
      console.error("Error fetching subsidy rates:", error);
      res.status(500).json({ message: "Failed to fetch subsidy rates" });
    }
  });

  app.get('/api/public-subsidies/:programId/rates/active', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const rates = await storage.getActiveSubsidyRatesByProgram(programId);
      res.json(rates);
    } catch (error) {
      console.error("Error fetching active subsidy rates:", error);
      res.status(500).json({ message: "Failed to fetch active subsidy rates" });
    }
  });

  app.get('/api/subsidy-rates/:rateId', isAuthenticated, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      const rate = await storage.getSubsidyRateById(rateId);
      if (!rate) {
        return res.status(404).json({ message: "Subsidy rate not found" });
      }
      res.json(rate);
    } catch (error) {
      console.error("Error fetching subsidy rate:", error);
      res.status(500).json({ message: "Failed to fetch subsidy rate" });
    }
  });

  app.post('/api/public-subsidies/:programId/rates', isAuthenticated, async (req: any, res) => {
    try {
      const { programId } = req.params;
      const rateData = { ...req.body, programId };
      const rate = await storage.createSubsidyRate(rateData);
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating subsidy rate:", error);
      res.status(500).json({ message: "Failed to create subsidy rate" });
    }
  });

  app.patch('/api/subsidy-rates/:rateId', isAuthenticated, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      const rate = await storage.updateSubsidyRate(rateId, req.body);
      res.json(rate);
    } catch (error) {
      console.error("Error updating subsidy rate:", error);
      res.status(500).json({ message: "Failed to update subsidy rate" });
    }
  });

  app.post('/api/subsidy-rates/:rateId/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      const rate = await storage.deactivateSubsidyRate(rateId);
      res.json(rate);
    } catch (error) {
      console.error("Error deactivating subsidy rate:", error);
      res.status(500).json({ message: "Failed to deactivate subsidy rate" });
    }
  });

  app.delete('/api/subsidy-rates/:rateId', isAuthenticated, async (req: any, res) => {
    try {
      const { rateId } = req.params;
      await storage.deleteSubsidyRate(rateId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subsidy rate:", error);
      res.status(500).json({ message: "Failed to delete subsidy rate" });
    }
  });

  // ======================== CHILD SUBSIDY ASSIGNMENTS ========================

  app.get('/api/children/:childId/subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.params;
      const assignments = await storage.getChildSubsidyAssignmentsByChild(childId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching child subsidy assignments:", error);
      res.status(500).json({ message: "Failed to fetch child subsidy assignments" });
    }
  });

  app.get('/api/children/:childId/subsidies/active', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.params;
      const assignments = await storage.getActiveChildSubsidyAssignmentsByChild(childId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching active child subsidy assignments:", error);
      res.status(500).json({ message: "Failed to fetch active child subsidy assignments" });
    }
  });

  app.get('/api/families/:familyId/subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { familyId } = req.params;
      const assignments = await storage.getChildSubsidyAssignmentsByFamily(familyId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching family subsidy assignments:", error);
      res.status(500).json({ message: "Failed to fetch family subsidy assignments" });
    }
  });

  app.get('/api/schools/:schoolId/subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const assignments = await storage.getChildSubsidyAssignmentsBySchool(schoolId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching school subsidy assignments:", error);
      res.status(500).json({ message: "Failed to fetch school subsidy assignments" });
    }
  });

  app.get('/api/child-subsidies/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await storage.getChildSubsidyAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Child subsidy assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching child subsidy assignment:", error);
      res.status(500).json({ message: "Failed to fetch child subsidy assignment" });
    }
  });

  app.post('/api/children/:childId/subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.params;
      const assignmentData = { ...req.body, childId };
      const assignment = await storage.createChildSubsidyAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating child subsidy assignment:", error);
      res.status(500).json({ message: "Failed to create child subsidy assignment" });
    }
  });

  app.patch('/api/child-subsidies/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await storage.updateChildSubsidyAssignment(assignmentId, req.body);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating child subsidy assignment:", error);
      res.status(500).json({ message: "Failed to update child subsidy assignment" });
    }
  });

  app.post('/api/child-subsidies/:assignmentId/end', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      const { endDate } = req.body;
      const assignment = await storage.endChildSubsidyAssignment(assignmentId, endDate ? new Date(endDate) : undefined);
      res.json(assignment);
    } catch (error) {
      console.error("Error ending child subsidy assignment:", error);
      res.status(500).json({ message: "Failed to end child subsidy assignment" });
    }
  });

  app.delete('/api/child-subsidies/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      await storage.deleteChildSubsidyAssignment(assignmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting child subsidy assignment:", error);
      res.status(500).json({ message: "Failed to delete child subsidy assignment" });
    }
  });

  // ======================== TUITION CALCULATION FOR ENROLLMENT ========================

  app.post('/api/enrollment/calculate-tuition', isAuthenticated, async (req: any, res) => {
    try {
      const { programOfferingId, familyIncome, familySize, childId } = req.body;
      
      if (!programOfferingId || !familyIncome || !familySize || !childId) {
        return res.status(400).json({ message: "Missing required fields: programOfferingId, familyIncome, familySize, childId" });
      }

      const calculation = await storage.calculateFamilyTuitionObligation(
        programOfferingId,
        parseFloat(familyIncome),
        parseInt(familySize),
        childId
      );
      
      res.json(calculation);
    } catch (error) {
      console.error("Error calculating family tuition obligation:", error);
      res.status(500).json({ message: "Failed to calculate family tuition obligation" });
    }
  });

  app.get('/api/children/:childId/eligible-subsidies', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.params;
      const { schoolId, familyIncome, familySize } = req.query;
      
      if (!schoolId || !familyIncome || !familySize) {
        return res.status(400).json({ message: "Missing required query parameters: schoolId, familyIncome, familySize" });
      }

      const eligiblePrograms = await storage.getEligibleSubsidyProgramsForChild(
        childId,
        schoolId as string,
        parseFloat(familyIncome as string),
        parseInt(familySize as string)
      );
      
      res.json(eligiblePrograms);
    } catch (error) {
      console.error("Error fetching eligible subsidy programs:", error);
      res.status(500).json({ message: "Failed to fetch eligible subsidy programs" });
    }
  });

  // ======================== HIERARCHICAL ROLE MANAGEMENT ========================

  // Get all role definitions
  app.get('/api/roles', isAuthenticated, async (req: any, res) => {
    try {
      const roles = await storage.getRoleDefinitions();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching role definitions:", error);
      res.status(500).json({ message: "Failed to fetch role definitions" });
    }
  });

  // Get only educator role definitions
  app.get('/api/roles/educator', isAuthenticated, async (req: any, res) => {
    try {
      const roles = await storage.getRolesByNamePrefix('educator');
      res.json(roles);
    } catch (error) {
      console.error("Error fetching educator role definitions:", error);
      res.status(500).json({ message: "Failed to fetch educator role definitions" });
    }
  });

  // Get only educator admin role definitions
  app.get('/api/roles/educator_admin', isAuthenticated, async (req: any, res) => {
    try {
      const roles = await storage.getRolesByNamePrefix('educator_admin');
      res.json(roles);
    } catch (error) {
      console.error("Error fetching educator admin role definitions:", error);
      res.status(500).json({ message: "Failed to fetch educator admin role definitions" });
    }
  });

  // Get only educator admin ongoing role definitions
  app.get('/api/roles/educator_admin_ongoing', isAuthenticated, async (req: any, res) => {
    try {
      const roles = await storage.getRolesByNamePrefix('educator_admin_ongoing');
      res.json(roles);
    } catch (error) {
      console.error("Error fetching educator admin ongoing role definitions:", error);
      res.status(500).json({ message: "Failed to fetch educator admin ongoing role definitions" });
    }
  });

  // Get all educators with admin roles across all schools for emulation
  app.get('/api/educators/admin-roles', isAuthenticated, async (req: any, res) => {
    try {
      const educators = await storage.getEducatorAdminsForEmulation();
      res.json(educators);
    } catch (error) {
      console.error("Error fetching educator admins for emulation:", error);
      res.status(500).json({ message: "Failed to fetch educator admins" });
    }
  });

  app.get('/api/schools/:schoolId/roles/hierarchical', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const roles = await storage.getHierarchicalRoles(schoolId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching hierarchical roles:", error);
      res.status(500).json({ message: "Failed to fetch hierarchical roles" });
    }
  });

  app.get('/api/schools/:schoolId/roles/category/:category', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId, category } = req.params;
      const roles = await storage.getRolesByCategory(category, schoolId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles by category:", error);
      res.status(500).json({ message: "Failed to fetch roles by category" });
    }
  });

  app.get('/api/schools/:schoolId/staff', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const staff = await storage.getStaffBySchool(schoolId);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching school staff:", error);
      res.status(500).json({ message: "Failed to fetch school staff" });
    }
  });

  app.get('/api/schools/:schoolId/staff/role-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const assignments = await storage.getStaffRoleAssignments(schoolId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching staff role assignments:", error);
      res.status(500).json({ message: "Failed to fetch staff role assignments" });
    }
  });

  app.post('/api/schools/:schoolId/staff/role-assignments/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const { assignments } = req.body;
      
      await storage.bulkUpdateRoleAssignments(schoolId, assignments);
      res.json({ message: "Role assignments updated successfully" });
    } catch (error) {
      console.error("Error updating role assignments:", error);
      res.status(500).json({ message: "Failed to update role assignments" });
    }
  });

  app.post('/api/role-definitions', isAuthenticated, async (req: any, res) => {
    try {
      const role = await storage.createRoleDefinition(req.body);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role definition:", error);
      res.status(500).json({ message: "Failed to create role definition" });
    }
  });

  app.patch('/api/role-definitions/:roleId', isAuthenticated, async (req: any, res) => {
    try {
      const { roleId } = req.params;
      const role = await storage.updateRoleDefinition(roleId, req.body);
      res.json(role);
    } catch (error) {
      console.error("Error updating role definition:", error);
      res.status(500).json({ message: "Failed to update role definition" });
    }
  });

  app.delete('/api/role-definitions/:roleId', isAuthenticated, async (req: any, res) => {
    try {
      const { roleId } = req.params;
      await storage.deleteRoleDefinition(roleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role definition:", error);
      res.status(500).json({ message: "Failed to delete role definition" });
    }
  });

  // Families
  app.get('/api/schools/:schoolId/families', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const families = await storage.getFamiliesBySchool(schoolId);
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ message: "Failed to fetch families" });
    }
  });

  app.get("/api/families/:familyId", isAuthenticated, async (req, res) => {
    try {
      const family = await storage.getFamilyById(req.params.familyId);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Failed to fetch family" });
    }
  });

  app.patch("/api/families/:familyId", isAuthenticated, async (req, res) => {
    try {
      const family = await storage.updateFamily(req.params.familyId, req.body);
      res.json(family);
    } catch (error) {
      console.error("Error updating family:", error);
      res.status(500).json({ message: "Failed to update family" });
    }
  });

  app.get("/api/families/:familyId/children", isAuthenticated, async (req, res) => {
    try {
      const children = await storage.getChildrenByFamily(req.params.familyId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  // Family Adults endpoints (simplified approach using existing users)
  app.get("/api/families/:familyId/adults", isAuthenticated, async (req, res) => {
    try {
      const adults = await storage.getFamilyAdults(req.params.familyId);
      res.json(adults);
    } catch (error) {
      console.error("Error fetching family adults:", error);
      res.status(500).json({ message: "Failed to fetch family adults" });
    }
  });

  // Get users with parent roles for adding to families
  app.get("/api/users/parents", isAuthenticated, async (req, res) => {
    try {
      const parents = await storage.getUsersWithParentRole();
      res.json(parents);
    } catch (error) {
      console.error("Error fetching parent users:", error);
      res.status(500).json({ message: "Failed to fetch parent users" });
    }
  });

  app.post("/api/families/:familyId/children", isAuthenticated, async (req, res) => {
    try {
      const child = await storage.createChild(req.body);
      res.json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Failed to create child" });
    }
  });

  app.get("/api/children/:childId", isAuthenticated, async (req, res) => {
    try {
      const child = await storage.getChildById(req.params.childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });

  app.patch("/api/children/:childId", isAuthenticated, async (req, res) => {
    try {
      const child = await storage.updateChild(req.params.childId, req.body);
      res.json(child);
    } catch (error) {
      console.error("Error updating child:", error);
      res.status(500).json({ message: "Failed to update child" });
    }
  });

  // Demographic reference data endpoints
  app.get("/api/genders", isAuthenticated, async (req, res) => {
    try {
      const genders = await storage.getGenders();
      res.json(genders);
    } catch (error) {
      console.error("Error fetching genders:", error);
      res.status(500).json({ message: "Failed to fetch genders" });
    }
  });

  app.get("/api/race-ethnicities", isAuthenticated, async (req, res) => {
    try {
      const raceEthnicities = await storage.getRaceEthnicities();
      res.json(raceEthnicities);
    } catch (error) {
      console.error("Error fetching race/ethnicities:", error);
      res.status(500).json({ message: "Failed to fetch race/ethnicities" });
    }
  });

  app.get("/api/languages", isAuthenticated, async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  // Update user demographic information
  app.patch('/api/user/demographics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      const { birthDate, genderId, genderOther, raceEthnicityIds, raceEthnicityOther, primaryLanguageIds, primaryLanguageOther } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        birthDate: birthDate ? new Date(birthDate) : undefined,
        genderId,
        genderOther,
        raceEthnicityIds,
        raceEthnicityOther,
        primaryLanguageIds,
        primaryLanguageOther,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user demographics:", error);
      res.status(500).json({ message: "Failed to update user demographics" });
    }
  });

  app.get("/api/families/:familyId/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByFamily(req.params.familyId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollment = await storage.createEnrollment(req.body);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.get("/api/families/:familyId/billing", isAuthenticated, async (req, res) => {
    try {
      const billingSetup = await storage.getBillingSetupByFamily(req.params.familyId);
      res.json(billingSetup);
    } catch (error) {
      console.error("Error fetching billing setup:", error);
      res.status(500).json({ message: "Failed to fetch billing setup" });
    }
  });

  app.post("/api/families/:familyId/billing", isAuthenticated, async (req, res) => {
    try {
      const billingSetup = await storage.createBillingSetup(req.body);
      res.json(billingSetup);
    } catch (error) {
      console.error("Error creating billing setup:", error);
      res.status(500).json({ message: "Failed to create billing setup" });
    }
  });

  app.patch("/api/families/:familyId/billing", isAuthenticated, async (req, res) => {
    try {
      const billingSetup = await storage.updateBillingSetup(req.params.familyId, req.body);
      res.json(billingSetup);
    } catch (error) {
      console.error("Error updating billing setup:", error);
      res.status(500).json({ message: "Failed to update billing setup" });
    }
  });

  app.get("/api/families/:familyId/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByFamily(req.params.familyId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/families/:familyId/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/families/:familyId/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByFamily(req.params.familyId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/schools/:schoolId/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const enrollments = await storage.getEnrollmentsBySchool(schoolId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Get all enrollments across all schools (for system administrators)
  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const enrollments = await storage.getAllEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      res.status(500).json({ message: "Failed to fetch all enrollments" });
    }
  });

  // Tasks
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const tasks = await storage.getTasksByUser(user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/schools/:schoolId/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      const tasks = await storage.getTasksBySchool(schoolId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching school tasks:", error);
      res.status(500).json({ message: "Failed to fetch school tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdById: user.id
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Messages and Channels
  app.get('/api/channels/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const channels = await storage.getChannelsByUser(user.id);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching user channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.get('/api/channels/:channelId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessagesByChannel(channelId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: user.id
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Get user's channels
  app.get('/api/channels/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user not found by ID, try to find by email
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const channels = await storage.getChannelsByUser(user.id);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching user channels:", error);
      res.status(500).json({ message: "Failed to fetch user channels" });
    }
  });

  // Initialize network channels
  app.post('/api/channels/initialize-network', isAuthenticated, async (req: any, res) => {
    try {
      await storage.initializeNetworkChannels();
      res.json({ message: "Network channels initialized successfully" });
    } catch (error) {
      console.error("Error initializing network channels:", error);
      res.status(500).json({ message: "Failed to initialize network channels" });
    }
  });

  app.post('/api/channels', isAuthenticated, async (req: any, res) => {
    try {
      const channelData = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid channel data", errors: error.errors });
      }
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Network School Years endpoints (for system admin defaults)
  app.get("/api/network-school-years", isAuthenticated, async (req, res) => {
    try {
      const schoolYears = await storage.getNetworkSchoolYears();
      res.json(schoolYears);
    } catch (error) {
      console.error("Error fetching network school years:", error);
      res.status(500).json({ error: "Failed to fetch network school years" });
    }
  });

  app.post("/api/network-school-years", isAuthenticated, async (req, res) => {
    try {
      const schoolYear = await storage.createNetworkSchoolYear(req.body);
      res.json(schoolYear);
    } catch (error) {
      console.error("Error creating network school year:", error);
      res.status(500).json({ error: "Failed to create network school year" });
    }
  });

  app.patch("/api/network-school-years/:yearId", isAuthenticated, async (req, res) => {
    try {
      const { yearId } = req.params;
      const schoolYear = await storage.updateNetworkSchoolYear(yearId, req.body);
      res.json(schoolYear);
    } catch (error) {
      console.error("Error updating network school year:", error);
      res.status(500).json({ error: "Failed to update network school year" });
    }
  });

  app.delete("/api/network-school-years/:yearId", isAuthenticated, async (req, res) => {
    try {
      const { yearId } = req.params;
      await storage.deleteNetworkSchoolYear(yearId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting network school year:", error);
      res.status(500).json({ error: "Failed to delete network school year" });
    }
  });

  // System holidays endpoints
  app.get("/api/system-holidays", isAuthenticated, async (req, res) => {
    try {
      const holidays = await storage.getSystemHolidays();
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching system holidays:", error);
      res.status(500).json({ error: "Failed to fetch system holidays" });
    }
  });

  app.post("/api/system-holidays", isAuthenticated, async (req, res) => {
    try {
      const holiday = await storage.createSystemHoliday(req.body);
      res.json(holiday);
    } catch (error) {
      console.error("Error creating system holiday:", error);
      res.status(500).json({ error: "Failed to create system holiday" });
    }
  });

  app.put("/api/system-holidays/:id", isAuthenticated, async (req, res) => {
    try {
      const holiday = await storage.updateSystemHoliday(req.params.id, req.body);
      res.json(holiday);
    } catch (error) {
      console.error("Error updating system holiday:", error);
      res.status(500).json({ error: "Failed to update system holiday" });
    }
  });

  app.delete("/api/system-holidays/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSystemHoliday(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting system holiday:", error);
      res.status(500).json({ error: "Failed to delete system holiday" });
    }
  });

  app.get("/api/network-holidays/:schoolYearName", isAuthenticated, async (req, res) => {
    try {
      const { schoolYearName } = req.params;
      const holidays = await storage.getNetworkHolidaysBySchoolYear(schoolYearName);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching network holidays:", error);
      res.status(500).json({ error: "Failed to fetch network holidays" });
    }
  });

  // Channel and Message routes
  app.get('/api/channels/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const channels = await storage.getChannelsByUser(user.id);
      res.json(channels);
    } catch (error) {
      console.error('Error fetching user channels:', error);
      res.status(500).json({ message: 'Failed to fetch user channels' });
    }
  });

  app.get('/api/channels/:channelId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getMessagesByChannel(channelId, limit);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      res.status(500).json({ message: 'Failed to fetch channel messages' });
    }
  });

  app.post('/api/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const channelData = {
        ...req.body,
        createdById: user.id,
      };
      
      const parsed = insertChannelSchema.parse(channelData);
      const channel = await storage.createChannel(parsed);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
      }
      console.error('Error creating channel:', error);
      res.status(500).json({ message: 'Failed to create channel' });
    }
  });

  app.post('/api/channels/:channelId/archive', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const channel = await storage.archiveChannel(channelId);
      res.json(channel);
    } catch (error) {
      console.error('Error archiving channel:', error);
      res.status(500).json({ message: 'Failed to archive channel' });
    }
  });

  app.delete('/api/channels/:channelId', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      await storage.deleteChannel(channelId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting channel:', error);
      res.status(500).json({ message: 'Failed to delete channel' });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const messageData = {
        ...req.body,
        senderId: user.id,
        sentAt: new Date(),
      };
      
      const parsed = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(parsed);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  });

  // Channel initialization routes
  app.post('/api/channels/initialize-network', isAuthenticated, async (req: any, res) => {
    try {
      await storage.initializeNetworkChannels();
      res.status(200).json({ message: 'Network channels initialized' });
    } catch (error) {
      console.error('Error initializing network channels:', error);
      res.status(500).json({ message: 'Failed to initialize network channels' });
    }
  });

  app.post('/api/schools/:schoolId/channels/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolId } = req.params;
      await storage.initializeSchoolChannels(schoolId);
      res.status(200).json({ message: 'School channels initialized' });
    } catch (error) {
      console.error('Error initializing school channels:', error);
      res.status(500).json({ message: 'Failed to initialize school channels' });
    }
  });

  app.post('/api/classrooms/:classroomId/channels/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const { schoolId, level } = req.body;
      
      if (!schoolId || !level) {
        return res.status(400).json({ message: 'schoolId and level are required' });
      }

      await storage.initializeClassroomChannels(schoolId, classroomId, level);
      res.status(200).json({ message: 'Classroom channels initialized' });
    } catch (error) {
      console.error('Error initializing classroom channels:', error);
      res.status(500).json({ message: 'Failed to initialize classroom channels' });
    }
  });

  // Family channel management routes
  app.post('/api/families/:familyId/channel', isAuthenticated, async (req: any, res) => {
    try {
      const { familyId } = req.params;
      const { schoolId } = req.body;
      
      if (!schoolId) {
        return res.status(400).json({ message: 'schoolId is required' });
      }

      const channel = await storage.createFamilyChannel(familyId, schoolId);
      res.status(201).json(channel);
    } catch (error) {
      console.error('Error creating family channel:', error);
      res.status(500).json({ message: 'Failed to create family channel' });
    }
  });

  app.post('/api/families/:familyId/channel/archive', isAuthenticated, async (req: any, res) => {
    try {
      const { familyId } = req.params;
      await storage.archiveFamilyChannel(familyId);
      res.status(200).json({ message: 'Family channel archived' });
    } catch (error) {
      console.error('Error archiving family channel:', error);
      res.status(500).json({ message: 'Failed to archive family channel' });
    }
  });

  app.post('/api/families/:familyId/channel/update-access', isAuthenticated, async (req: any, res) => {
    try {
      const { familyId } = req.params;
      const { schoolId } = req.body;
      
      if (!schoolId) {
        return res.status(400).json({ message: 'schoolId is required' });
      }

      await storage.updateFamilyChannelAccess(familyId, schoolId);
      res.status(200).json({ message: 'Family channel access updated' });
    } catch (error) {
      console.error('Error updating family channel access:', error);
      res.status(500).json({ message: 'Failed to update family channel access' });
    }
  });

  // Auto-archive family channels when no active enrollments
  app.post('/api/families/:familyId/check-enrollment', isAuthenticated, async (req: any, res) => {
    try {
      const { familyId } = req.params;
      const hasActiveEnrollments = await storage.checkFamilyEnrollmentStatus(familyId);
      
      if (!hasActiveEnrollments) {
        await storage.archiveFamilyChannel(familyId);
        res.json({ archived: true, message: 'Family channel archived due to no active enrollments' });
      } else {
        res.json({ archived: false, message: 'Family has active enrollments' });
      }
    } catch (error) {
      console.error('Error checking family enrollment:', error);
      res.status(500).json({ message: 'Failed to check family enrollment status' });
    }
  });

  // ======================== CHANNEL TEST ENDPOINTS ========================
  
  // Channel Test Endpoint (no auth for testing)
  app.get('/api/channel-test', async (req: Request, res: Response) => {
    try {
      console.log('Channel test endpoint called');
      const channels = await storage.getAllChannels();
      console.log('Successfully retrieved channels:', channels.length);
      res.json(channels);
    } catch (error) {
      console.error('Error getting channels:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
      res.status(500).json({ error: 'Failed to get channels', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Initialize network channels (no auth for testing)
  app.post('/api/channel-test/initialize-network', async (req: Request, res: Response) => {
    try {
      await storage.initializeNetworkChannels();
      res.json({ message: 'Network channels initialized successfully' });
    } catch (error) {
      console.error('Error initializing network channels:', error);
      res.status(500).json({ error: 'Failed to initialize network channels' });
    }
  });

  // Initialize school channels (no auth for testing)
  app.post('/api/channel-test/initialize-school/:schoolId', async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      await storage.initializeSchoolChannels(schoolId);
      res.json({ message: 'School channels initialized successfully' });
    } catch (error) {
      console.error('Error initializing school channels:', error);
      res.status(500).json({ error: 'Failed to initialize school channels' });
    }
  });

  // Initialize classroom channels (no auth for testing)
  app.post('/api/channel-test/initialize-classroom/:classroomId', async (req: Request, res: Response) => {
    try {
      const { classroomId } = req.params;
      await storage.initializeClassroomChannels(classroomId);
      res.json({ message: 'Classroom channels initialized successfully' });
    } catch (error) {
      console.error('Error initializing classroom channels:', error);
      res.status(500).json({ error: 'Failed to initialize classroom channels' });
    }
  });

  // Auto-assign current user to all network channels (no auth for testing)
  app.post('/api/channel-test/join-network/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      await storage.assignUserToNetworkChannels(userId);
      res.json({ message: 'User assigned to network channels successfully' });
    } catch (error) {
      console.error('Error assigning user to network channels:', error);
      res.status(500).json({ error: 'Failed to assign user to network channels' });
    }
  });

  // ======================== ATTENDANCE ========================

  // Save daily attendance for a classroom
  app.post('/api/classrooms/:classroomId/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const { date, attendance: attendanceData, correctionReason } = req.body;

      if (!date || !attendanceData) {
        return res.status(400).json({ message: "Missing required fields: date, attendance" });
      }

      // Get current user ID
      const userId = req.user.dbUserId || req.user.claims.sub;
      let user = await storage.getUser(userId);
      if (!user && req.user.claims.email) {
        user = await storage.getUserByEmail(req.user.claims.email);
      }

      // Get all students for this classroom
      const students = await storage.getEnrollmentsByClassroom(classroomId);
      const savedAttendance = [];

      // Save attendance for each student
      for (const studentId of Object.keys(attendanceData)) {
        const student = students.find(s => s.id === studentId);
        if (!student) {
          continue; // Skip if student not found
        }

        const attendanceRecord = {
          classroomId,
          studentId,
          date: new Date(date),
          isPresent: attendanceData[studentId],
          method: 'teacher' as const,
          checkInTime: attendanceData[studentId] ? new Date() : null,
          enteredBy: user?.id || null,
          correctionReason: correctionReason || null,
        };

        const saved = await storage.saveAttendance(attendanceRecord);
        savedAttendance.push(saved);
      }

      res.status(201).json(savedAttendance);
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ message: "Failed to save attendance" });
    }
  });

  // Family check-in for individual student
  app.post('/api/classrooms/:classroomId/check-in/:studentId', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId, studentId } = req.params;
      const { timestamp } = req.body;

      const attendanceRecord = {
        classroomId,
        studentId,
        date: new Date(),
        isPresent: true,
        method: 'family_tablet' as const,
        checkInTime: timestamp ? new Date(timestamp) : new Date(),
      };

      const saved = await storage.saveAttendance(attendanceRecord);
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error checking in student:", error);
      res.status(500).json({ message: "Failed to check in student" });
    }
  });

  // Get current attendance for a classroom on a specific date
  app.get('/api/classrooms/:classroomId/attendance/:date/current', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId, date } = req.params;
      const attendance = await storage.getCurrentAttendanceByClassroomAndDate(classroomId, date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching current attendance:", error);
      res.status(500).json({ message: "Failed to fetch current attendance" });
    }
  });

  // Get all attendance records for a classroom on a specific date
  app.get('/api/classrooms/:classroomId/attendance/:date', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId, date } = req.params;
      const records = await storage.getAttendanceRecordsByClassroomAndDate(classroomId, date);
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Get attendance history for a classroom
  app.get('/api/classrooms/:classroomId/attendance-history', isAuthenticated, async (req: any, res) => {
    try {
      const { classroomId } = req.params;
      const history = await storage.getAttendanceHistoryByClassroom(classroomId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      res.status(500).json({ message: "Failed to fetch attendance history" });
    }
  });

  // QR code check-in endpoint (public endpoint for families)
  app.post('/api/qr-checkin/:classroomId/:studentId', async (req: any, res) => {
    try {
      const { classroomId, studentId } = req.params;

      const attendanceRecord = {
        classroomId,
        studentId,
        date: new Date(),
        isPresent: true,
        method: 'qr_code' as const,
        checkInTime: new Date(),
        enteredBy: null, // QR code check-ins don't have a logged-in user
      };

      const saved = await storage.saveAttendance(attendanceRecord);
      res.status(201).json({ message: "Student checked in successfully", attendance: saved });
    } catch (error) {
      console.error("Error QR check-in:", error);
      res.status(500).json({ message: "Failed to check in student" });
    }
  });

  return httpServer;
}
