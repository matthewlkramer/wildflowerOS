import {
  users,
  userRoles,
  schools,
  schoolYears,
  budgets,
  classrooms,
  families,
  children,
  enrollments,
  tasks,
  messages,
  channels,
  channelMembers,
  billingSetups,
  invoices,
  payments,
  type User,
  type UpsertUser,
  type UserRole,
  type InsertUserRole,
  type School,
  type Classroom,
  type Family,
  type Child,
  type Enrollment,
  type Task,
  type InsertTask,
  type Message,
  type InsertMessage,
  type Channel,
  type InsertChannel,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User roles
  getUserRoles(userId: string): Promise<UserRole[]>;
  createUserRole(role: InsertUserRole): Promise<UserRole>;
  updateUserRole(id: string, role: Partial<InsertUserRole>): Promise<UserRole>;
  
  // Schools
  getSchools(): Promise<School[]>;
  getSchoolById(id: string): Promise<School | undefined>;
  getSchoolsByUser(userId: string): Promise<School[]>;
  
  // Classrooms
  getClassroomsBySchool(schoolId: string): Promise<Classroom[]>;
  getClassroomById(id: string): Promise<Classroom | undefined>;
  createClassroom(classroom: any): Promise<Classroom>;
  updateClassroom(id: string, classroom: any): Promise<Classroom>;
  deleteClassroom(id: string): Promise<void>;
  
  // Staff management
  getStaffBySchool(schoolId: string): Promise<UserRole[]>;
  
  // Tuition plans
  getTuitionPlansBySchool(schoolId: string): Promise<any[]>;
  createTuitionPlan(tuitionPlan: any): Promise<any>;
  
  // School years
  getSchoolYearsBySchool(schoolId: string): Promise<any[]>;
  createSchoolYear(schoolYear: any): Promise<any>;
  setActiveSchoolYear(yearId: string): Promise<any>;
  
  // Families
  getFamiliesBySchool(schoolId: string): Promise<Family[]>;
  getFamilyById(id: string): Promise<Family | undefined>;
  createFamily(family: any): Promise<Family>;
  updateFamily(id: string, family: any): Promise<Family>;
  
  // Children
  getChildrenByFamily(familyId: string): Promise<Child[]>;
  createChild(child: any): Promise<Child>;
  
  // Enrollments
  getEnrollmentsBySchool(schoolId: string): Promise<any[]>;
  getEnrollmentsByClassroom(classroomId: string): Promise<any[]>;
  getEnrollmentsByFamily(familyId: string): Promise<any[]>;
  createEnrollment(enrollment: any): Promise<any>;
  
  // Tasks
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksBySchool(schoolId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  
  // Messages and Channels
  getChannelsByUser(userId: string): Promise<Channel[]>;
  getMessagesByChannel(channelId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  // Billing and invoicing
  getBillingSetupByFamily(familyId: string): Promise<any>;
  createBillingSetup(billingSetup: any): Promise<any>;
  updateBillingSetup(familyId: string, billingSetup: any): Promise<any>;
  getInvoicesByFamily(familyId: string): Promise<any[]>;
  createInvoice(invoice: any): Promise<any>;
  getPaymentsByFamily(familyId: string): Promise<any[]>;

  // Dashboard stats
  getDashboardStats(schoolId: string): Promise<{
    totalStudents: number;
    activeClassrooms: number;
    pendingTasks: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.active, true)));
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const [userRole] = await db.insert(userRoles).values(role).returning();
    return userRole;
  }

  async updateUserRole(id: string, role: Partial<InsertUserRole>): Promise<UserRole> {
    const [userRole] = await db
      .update(userRoles)
      .set(role)
      .where(eq(userRoles.id, id))
      .returning();
    return userRole;
  }

  // Schools
  async getSchools(): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.status, "active"));
  }

  async getSchoolById(id: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }

  async getSchoolsByUser(userId: string): Promise<School[]> {
    return await db
      .select({
        id: schools.id,
        name: schools.name,
        shortName: schools.shortName,
        address: schools.address,
        city: schools.city,
        state: schools.state,
        zip: schools.zip,
        phone: schools.phone,
        email: schools.email,
        website: schools.website,
        status: schools.status,
        legalEntityId: schools.legalEntityId,
        createdAt: schools.createdAt,
        updatedAt: schools.updatedAt,
      })
      .from(schools)
      .innerJoin(userRoles, eq(userRoles.schoolId, schools.id))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.active, true),
        eq(schools.status, "active")
      ));
  }

  // Classrooms
  async getClassroomsBySchool(schoolId: string): Promise<Classroom[]> {
    return await db
      .select()
      .from(classrooms)
      .where(and(eq(classrooms.schoolId, schoolId), eq(classrooms.isActive, true)));
  }

  async getClassroomById(id: string): Promise<Classroom | undefined> {
    const [classroom] = await db.select().from(classrooms).where(eq(classrooms.id, id));
    return classroom;
  }

  async createClassroom(classroomData: any): Promise<Classroom> {
    const [classroom] = await db.insert(classrooms).values(classroomData).returning();
    return classroom;
  }

  async updateClassroom(id: string, classroomData: any): Promise<Classroom> {
    const [classroom] = await db
      .update(classrooms)
      .set({ ...classroomData, updatedAt: new Date() })
      .where(eq(classrooms.id, id))
      .returning();
    return classroom;
  }

  async deleteClassroom(id: string): Promise<void> {
    await db
      .update(classrooms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(classrooms.id, id));
  }

  // Staff management
  async getStaffBySchool(schoolId: string): Promise<UserRole[]> {
    return await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        role: userRoles.role,
        startDate: userRoles.startDate,
        active: userRoles.active,
        schoolId: userRoles.schoolId,
        firstName: sql<string>`split_part(${userRoles.userId}, '@', 1)`.as('firstName'),
        lastName: sql<string>`''`.as('lastName'),
        email: userRoles.userId,
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.schoolId, schoolId),
        eq(userRoles.active, true)
      ));
  }

  // Tuition plans (using budgets table as a placeholder)
  async getTuitionPlansBySchool(schoolId: string): Promise<any[]> {
    // Get the active school year for this school
    const [schoolYear] = await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);

    if (!schoolYear) {
      return [];
    }

    return await db
      .select()
      .from(budgets)
      .where(and(
        eq(budgets.schoolId, schoolId),
        eq(budgets.schoolYearId, schoolYear.id)
      ));
  }

  async createTuitionPlan(tuitionData: any): Promise<any> {
    // Get the active school year for this school  
    const [schoolYear] = await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);

    if (!schoolYear) {
      // Create a default school year if none exists
      const currentYear = new Date().getFullYear();
      const [newSchoolYear] = await db
        .insert(schoolYears)
        .values({
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(`${currentYear}-08-01`),
          endDate: new Date(`${currentYear + 1}-06-30`),
          isActive: true,
        })
        .returning();
      
      const budgetData = {
        schoolId: tuitionData.schoolId,
        schoolYearId: newSchoolYear.id,
        totalBudget: tuitionData.amount,
        budgetNotes: `${tuitionData.name} - ${tuitionData.description}`,
      };
      const [budget] = await db.insert(budgets).values(budgetData).returning();
      return { ...budget, name: tuitionData.name, level: tuitionData.level, schedule: tuitionData.schedule };
    }

    const budgetData = {
      schoolId: tuitionData.schoolId,
      schoolYearId: schoolYear.id,
      totalBudget: tuitionData.amount,
      budgetNotes: `${tuitionData.name} - ${tuitionData.description}`,
    };
    const [budget] = await db.insert(budgets).values(budgetData).returning();
    return { ...budget, name: tuitionData.name, level: tuitionData.level, schedule: tuitionData.schedule };
  }

  // School years
  async getSchoolYearsBySchool(schoolId: string): Promise<any[]> {
    return await db
      .select()
      .from(schoolYears)
      .orderBy(desc(schoolYears.startDate));
  }

  async createSchoolYear(schoolYearData: any): Promise<any> {
    const [schoolYear] = await db.insert(schoolYears).values(schoolYearData).returning();
    return schoolYear;
  }

  async setActiveSchoolYear(yearId: string): Promise<any> {
    // First, set all school years to inactive
    await db.update(schoolYears).set({ isActive: false });
    
    // Then set the selected year to active
    const [schoolYear] = await db
      .update(schoolYears)
      .set({ isActive: true })
      .where(eq(schoolYears.id, yearId))
      .returning();
    
    return schoolYear;
  }

  // Families
  async getFamiliesBySchool(schoolId: string): Promise<Family[]> {
    return await db
      .selectDistinct({
        id: families.id,
        name: families.name,
        address: families.address,
        phone: families.phone,
        email: families.email,
        notes: families.notes,
        primaryContactId: families.primaryContactId,
        createdAt: families.createdAt,
        updatedAt: families.updatedAt,
      })
      .from(families)
      .innerJoin(children, eq(children.familyId, families.id))
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(enrollments.schoolId, schoolId));
  }

  async getFamilyById(id: string): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family;
  }

  async createFamily(familyData: any): Promise<Family> {
    const [family] = await db.insert(families).values(familyData).returning();
    return family;
  }

  async updateFamily(id: string, familyData: any): Promise<Family> {
    const [family] = await db
      .update(families)
      .set({ ...familyData, updatedAt: new Date() })
      .where(eq(families.id, id))
      .returning();
    return family;
  }

  // Children
  async getChildrenByFamily(familyId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.familyId, familyId));
  }

  async createChild(childData: any): Promise<Child> {
    const [child] = await db.insert(children).values(childData).returning();
    return child;
  }

  // Enrollments
  async getEnrollmentsBySchool(schoolId: string): Promise<any[]> {
    return await db
      .select({
        id: enrollments.id,
        status: enrollments.status,
        startDate: enrollments.startDate,
        endDate: enrollments.endDate,
        child: {
          id: children.id,
          firstName: children.firstName,
          lastName: children.lastName,
          birthDate: children.birthDate,
        },
        family: {
          id: families.id,
          name: families.name,
          email: families.email,
        },
        classroom: {
          id: classrooms.id,
          name: classrooms.name,
          level: classrooms.level,
        },
      })
      .from(enrollments)
      .innerJoin(children, eq(children.id, enrollments.childId))
      .innerJoin(families, eq(families.id, children.familyId))
      .leftJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
      .where(eq(enrollments.schoolId, schoolId))
      .orderBy(desc(enrollments.createdAt));
  }

  async getEnrollmentsByClassroom(classroomId: string): Promise<any[]> {
    return await db
      .select({
        id: enrollments.id,
        status: enrollments.status,
        child: {
          id: children.id,
          firstName: children.firstName,
          lastName: children.lastName,
        },
        family: {
          id: families.id,
          name: families.name,
        },
      })
      .from(enrollments)
      .innerJoin(children, eq(children.id, enrollments.childId))
      .innerJoin(families, eq(families.id, children.familyId))
      .where(and(
        eq(enrollments.classroomId, classroomId),
        eq(enrollments.status, "enrolled")
      ));
  }

  async getEnrollmentsByFamily(familyId: string): Promise<any[]> {
    return await db
      .select({
        id: enrollments.id,
        childId: enrollments.childId,
        schoolId: enrollments.schoolId,
        classroomId: enrollments.classroomId,
        status: enrollments.status,
        startDate: enrollments.startDate,
        endDate: enrollments.endDate,
        notes: enrollments.notes,
        child: {
          id: children.id,
          firstName: children.firstName,
          lastName: children.lastName,
          birthDate: children.birthDate,
          familyId: children.familyId,
        },
        family: {
          id: families.id,
          name: families.name,
          email: families.email,
          phone: families.phone,
        },
        classroom: {
          id: classrooms.id,
          name: classrooms.name,
          level: classrooms.level,
        },
      })
      .from(enrollments)
      .leftJoin(children, eq(enrollments.childId, children.id))
      .leftJoin(families, eq(children.familyId, families.id))
      .leftJoin(classrooms, eq(enrollments.classroomId, classrooms.id))
      .where(eq(children.familyId, familyId));
  }

  async createEnrollment(enrollmentData: any): Promise<any> {
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    return enrollment;
  }

  // Tasks
  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksBySchool(schoolId: string): Promise<Task[]> {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        dueDate: tasks.dueDate,
        createdById: tasks.createdById,
        commentChannelId: tasks.commentChannelId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(userRoles, eq(userRoles.userId, tasks.assignedToId))
      .where(eq(userRoles.schoolId, schoolId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  // Messages and Channels
  async getChannelsByUser(userId: string): Promise<Channel[]> {
    return await db
      .select({
        id: channels.id,
        name: channels.name,
        type: channels.type,
        schoolId: channels.schoolId,
        legalEntityId: channels.legalEntityId,
        taskId: channels.taskId,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channels)
      .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
      .where(eq(channelMembers.userId, userId))
      .orderBy(desc(channels.updatedAt));
  }

  async getMessagesByChannel(channelId: string, limit = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, channelId))
      .orderBy(desc(messages.sentAt))
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const [newChannel] = await db.insert(channels).values(channel).returning();
    return newChannel;
  }

  // Billing and invoicing
  async getBillingSetupByFamily(familyId: string): Promise<any> {
    const [billingSetup] = await db
      .select()
      .from(billingSetups)
      .where(eq(billingSetups.familyId, familyId));
    return billingSetup;
  }

  async createBillingSetup(billingData: any): Promise<any> {
    const [billingSetup] = await db.insert(billingSetups).values(billingData).returning();
    return billingSetup;
  }

  async updateBillingSetup(familyId: string, billingData: any): Promise<any> {
    const [billingSetup] = await db
      .update(billingSetups)
      .set({ ...billingData, updatedAt: new Date() })
      .where(eq(billingSetups.familyId, familyId))
      .returning();
    return billingSetup;
  }

  async getInvoicesByFamily(familyId: string): Promise<any[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.familyId, familyId))
      .orderBy(desc(invoices.issueDate));
  }

  async createInvoice(invoiceData: any): Promise<any> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async getPaymentsByFamily(familyId: string): Promise<any[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.familyId, familyId))
      .orderBy(desc(payments.paymentDate));
  }

  // Dashboard stats
  async getDashboardStats(schoolId: string): Promise<{
    totalStudents: number;
    activeClassrooms: number;
    pendingTasks: number;
    monthlyRevenue: number;
  }> {
    // Total enrolled students
    const [studentsResult] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(and(
        eq(enrollments.schoolId, schoolId),
        eq(enrollments.status, "enrolled")
      ));

    // Active classrooms
    const [classroomsResult] = await db
      .select({ count: count() })
      .from(classrooms)
      .where(and(
        eq(classrooms.schoolId, schoolId),
        eq(classrooms.isActive, true)
      ));

    // Pending tasks for school staff
    const [tasksResult] = await db
      .select({ count: count() })
      .from(tasks)
      .innerJoin(userRoles, eq(userRoles.userId, tasks.assignedToId))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        sql`${tasks.status} IN ('open', 'in_progress')`
      ));

    return {
      totalStudents: studentsResult.count,
      activeClassrooms: classroomsResult.count,
      pendingTasks: tasksResult.count,
      monthlyRevenue: 42500, // This would be calculated from billing data
    };
  }
}

export const storage = new DatabaseStorage();
