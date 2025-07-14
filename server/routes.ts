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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user roles and schools
      const roles = await storage.getUserRoles(userId);
      const schools = await storage.getSchoolsByUser(userId);
      
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
      const userId = req.user.claims.sub;
      const userRoles = await storage.getUserRoles(userId);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.get('/api/user/current-role', isAuthenticated, async (req: any, res) => {
    try {
      const currentRoleId = req.session.currentRoleId;
      if (!currentRoleId) {
        // If no role is set, get the first active role
        const userId = req.user.claims.sub;
        const userRoles = await storage.getUserRoles(userId);
        const activeRoles = userRoles.filter(role => role.active);
        
        if (activeRoles.length > 0) {
          req.session.currentRoleId = activeRoles[0].id;
          return res.json(activeRoles[0]);
        }
        
        return res.json(null);
      }

      // Get the current role details
      const userId = req.user.claims.sub;
      const userRoles = await storage.getUserRoles(userId);
      const currentRole = userRoles.find(role => role.id === currentRoleId);
      
      if (!currentRole || !currentRole.active) {
        // Role no longer exists or is inactive, clear it
        req.session.currentRoleId = null;
        return res.json(null);
      }

      res.json(currentRole);
    } catch (error) {
      console.error("Error fetching current role:", error);
      res.status(500).json({ message: "Failed to fetch current role" });
    }
  });

  app.post('/api/user/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const { roleId } = req.body;
      const userId = req.user.claims.sub;

      // Verify the user has this role and it's active
      const userRoles = await storage.getUserRoles(userId);
      const targetRole = userRoles.find(role => role.id === roleId && role.active);

      if (!targetRole) {
        return res.status(400).json({ message: "Invalid role or role not active" });
      }

      // Set the current role in session
      req.session.currentRoleId = roleId;
      
      // Save session
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ success: true, currentRole: targetRole });
      });
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
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
      const userId = req.user.claims.sub;
      const schools = await storage.getSchoolsByUser(userId);
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
      
      // First, create or get the user record
      const user = await storage.upsertUser({
        id: staffData.email, // Use email as user ID for now
        email: staffData.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
      });
      
      // Then create user role for the new staff member
      const userRole = await storage.createUserRole({
        userId: user.id,
        schoolId,
        role: staffData.role,
        active: true,
        startDate: staffData.startDate
      });
      
      res.status(201).json(userRole);
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

  app.post("/api/families/:familyId/children", isAuthenticated, async (req, res) => {
    try {
      const child = await storage.createChild(req.body);
      res.json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Failed to create child" });
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

  // Tasks
  app.get('/api/tasks/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByUser(userId);
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
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdById: userId
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
      const userId = req.user.claims.sub;
      const channels = await storage.getChannelsByUser(userId);
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
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
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

  return httpServer;
}
