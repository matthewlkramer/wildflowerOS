import {
  users,
  userRoles,
  roleDefinitions,
  schools,
  schoolYears,
  academicCalendars,
  calendarClosures,
  budgets,
  classrooms,
  classroomSchedules,
  programOfferings,
  tuitionPlans,
  slidingScalePolicies,
  slidingScaleRules,
  publicSubsidyPrograms,
  subsidyRates,
  childSubsidyAssignments,
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
  emailAddresses,
  type User,
  type UpsertUser,
  type UserRole,
  type InsertUserRole,
  type RoleDefinition,
  type InsertRoleDefinition,
  type School,
  type SchoolYear,
  type InsertSchoolYear,
  type AcademicCalendar,
  type InsertAcademicCalendar,
  type CalendarClosure,
  type InsertCalendarClosure,
  type ClassroomSchedule,
  type InsertClassroomSchedule,
  type ProgramOffering,
  type InsertProgramOffering,
  type TuitionPlan,
  type InsertTuitionPlan,
  type SlidingScalePolicy,
  type InsertSlidingScalePolicy,
  type SlidingScaleRule,
  type InsertSlidingScaleRule,
  type PublicSubsidyProgram,
  type InsertPublicSubsidyProgram,
  type SubsidyRate,
  type InsertSubsidyRate,
  type ChildSubsidyAssignment,
  type InsertChildSubsidyAssignment,
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
  type EmailAddress,
  type InsertEmailAddress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, isNull, or, lte, gte, gt } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email address operations
  getEmailAddressesByUser(userId: string): Promise<EmailAddress[]>;
  addEmailAddress(emailAddress: InsertEmailAddress): Promise<EmailAddress>;
  updateEmailAddress(id: string, emailAddress: Partial<InsertEmailAddress>): Promise<EmailAddress>;
  deleteEmailAddress(id: string): Promise<void>;
  setPrimaryEmailAddress(userId: string, emailId: string): Promise<void>;
  
  // User roles
  getUserRoles(userId: string): Promise<UserRole[]>;
  getAllUserRoles(userId: string): Promise<UserRole[]>; // Get all roles including inactive/expired
  createUserRole(role: InsertUserRole): Promise<UserRole>;
  updateUserRole(id: string, role: Partial<InsertUserRole>): Promise<UserRole>;
  endUserRole(id: string, endDate?: Date): Promise<UserRole>; // End a role while keeping history
  
  // Role definitions
  getRoleDefinitions(schoolId?: string): Promise<RoleDefinition[]>;
  getHierarchicalRoles(schoolId?: string): Promise<RoleDefinition[]>;
  getRolesByCategory(category: string, schoolId?: string): Promise<RoleDefinition[]>;
  createRoleDefinition(role: InsertRoleDefinition): Promise<RoleDefinition>;
  updateRoleDefinition(id: string, role: Partial<InsertRoleDefinition>): Promise<RoleDefinition>;
  deleteRoleDefinition(id: string): Promise<void>;
  
  // Staff and role assignments at school level
  getStaffBySchool(schoolId: string): Promise<any[]>;
  getStaffRoleAssignments(schoolId: string): Promise<any[]>;
  assignUserRole(assignment: InsertUserRole): Promise<UserRole>;
  updateUserRoleAssignment(id: string, assignment: Partial<InsertUserRole>): Promise<UserRole>;
  bulkUpdateRoleAssignments(schoolId: string, assignments: any[]): Promise<void>;
  
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
  getTuitionPlansByProgramOffering(programOfferingId: string): Promise<TuitionPlan[]>;
  getTuitionPlansByClassroom(classroomId: string): Promise<TuitionPlan[]>;
  createTuitionPlan(data: InsertTuitionPlan): Promise<TuitionPlan>;
  updateTuitionPlan(id: string, data: Partial<InsertTuitionPlan>): Promise<TuitionPlan>;
  deleteTuitionPlan(id: string): Promise<void>;
  
  // Sliding scale policies
  getSlidingScalePoliciesBySchool(schoolId: string): Promise<SlidingScalePolicy[]>;
  getActiveSlidingScalePoliciesBySchool(schoolId: string): Promise<SlidingScalePolicy[]>;
  getSlidingScalePolicyWithRules(policyId: string): Promise<any>;
  createSlidingScalePolicy(data: InsertSlidingScalePolicy, rules?: InsertSlidingScaleRule[]): Promise<SlidingScalePolicy>;
  updateSlidingScalePolicy(id: string, data: Partial<InsertSlidingScalePolicy>): Promise<SlidingScalePolicy>;
  deactivateSlidingScalePolicy(id: string): Promise<SlidingScalePolicy>;
  deleteSlidingScalePolicy(id: string): Promise<void>;
  
  // Public subsidy programs
  getPublicSubsidyProgramsBySchool(schoolId: string): Promise<PublicSubsidyProgram[]>;
  getActivePublicSubsidyProgramsBySchool(schoolId: string): Promise<PublicSubsidyProgram[]>;
  getPublicSubsidyProgramById(id: string): Promise<PublicSubsidyProgram | undefined>;
  createPublicSubsidyProgram(data: InsertPublicSubsidyProgram): Promise<PublicSubsidyProgram>;
  updatePublicSubsidyProgram(id: string, data: Partial<InsertPublicSubsidyProgram>): Promise<PublicSubsidyProgram>;
  deactivatePublicSubsidyProgram(id: string): Promise<PublicSubsidyProgram>;
  deletePublicSubsidyProgram(id: string): Promise<void>;
  
  // Subsidy rates
  getSubsidyRatesByProgram(programId: string): Promise<SubsidyRate[]>;
  getActiveSubsidyRatesByProgram(programId: string): Promise<SubsidyRate[]>;
  getSubsidyRateById(id: string): Promise<SubsidyRate | undefined>;
  createSubsidyRate(data: InsertSubsidyRate): Promise<SubsidyRate>;
  updateSubsidyRate(id: string, data: Partial<InsertSubsidyRate>): Promise<SubsidyRate>;
  deactivateSubsidyRate(id: string): Promise<SubsidyRate>;
  deleteSubsidyRate(id: string): Promise<void>;
  
  // Child subsidy assignments
  getChildSubsidyAssignmentsByChild(childId: string): Promise<ChildSubsidyAssignment[]>;
  getActiveChildSubsidyAssignmentsByChild(childId: string): Promise<ChildSubsidyAssignment[]>;
  getChildSubsidyAssignmentsByFamily(familyId: string): Promise<ChildSubsidyAssignment[]>;
  getChildSubsidyAssignmentsBySchool(schoolId: string): Promise<ChildSubsidyAssignment[]>;
  getChildSubsidyAssignmentById(id: string): Promise<ChildSubsidyAssignment | undefined>;
  createChildSubsidyAssignment(data: InsertChildSubsidyAssignment): Promise<ChildSubsidyAssignment>;
  updateChildSubsidyAssignment(id: string, data: Partial<InsertChildSubsidyAssignment>): Promise<ChildSubsidyAssignment>;
  endChildSubsidyAssignment(id: string, endDate?: Date): Promise<ChildSubsidyAssignment>;
  deleteChildSubsidyAssignment(id: string): Promise<void>;
  
  // School years
  getSchoolYearsBySchool(schoolId: string): Promise<SchoolYear[]>;
  getSchoolYearById(id: string): Promise<SchoolYear | undefined>;
  createSchoolYear(schoolYear: InsertSchoolYear): Promise<SchoolYear>;
  updateSchoolYear(id: string, schoolYear: Partial<InsertSchoolYear>): Promise<SchoolYear>;
  deleteSchoolYear(id: string): Promise<void>;
  setActiveSchoolYear(yearId: string): Promise<SchoolYear>;
  
  // Academic calendars
  getAcademicCalendarBySchoolYear(schoolYearId: string): Promise<AcademicCalendar | undefined>;
  createAcademicCalendar(calendar: InsertAcademicCalendar): Promise<AcademicCalendar>;
  updateAcademicCalendar(id: string, calendar: Partial<InsertAcademicCalendar>): Promise<AcademicCalendar>;
  deleteAcademicCalendar(id: string): Promise<void>;
  
  // Calendar closures
  getCalendarClosuresByCalendar(calendarId: string): Promise<CalendarClosure[]>;
  createCalendarClosure(closure: InsertCalendarClosure): Promise<CalendarClosure>;
  updateCalendarClosure(id: string, closure: Partial<InsertCalendarClosure>): Promise<CalendarClosure>;
  deleteCalendarClosure(id: string): Promise<void>;
  
  // Classroom schedules
  getSchedulesByClassroom(classroomId: string): Promise<any[]>;
  getActiveScheduleByClassroom(classroomId: string): Promise<any | undefined>;
  createClassroomSchedule(schedule: any): Promise<any>;
  updateClassroomSchedule(id: string, schedule: any): Promise<any>;
  deleteClassroomSchedule(id: string): Promise<void>;
  
  // Program offerings
  getProgramOfferingsByClassroom(classroomId: string): Promise<any[]>;
  getProgramOfferingsBySchoolYear(classroomId: string, schoolYearId: string): Promise<any[]>;
  createProgramOffering(offering: any): Promise<any>;
  updateProgramOffering(id: string, offering: any): Promise<any>;
  deleteProgramOffering(id: string): Promise<void>;
  
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
    
    // Automatically create email address record for the login email if it doesn't exist
    if (userData.email) {
      await db
        .insert(emailAddresses)
        .values({
          userId: user.id,
          email: userData.email,
          type: 'personal',
          isPrimary: true,
        })
        .onConflictDoNothing();
    }
    
    return user;
  }

  // Email address operations
  async getEmailAddressesByUser(userId: string): Promise<EmailAddress[]> {
    return await db
      .select()
      .from(emailAddresses)
      .where(eq(emailAddresses.userId, userId))
      .orderBy(desc(emailAddresses.isPrimary), emailAddresses.createdAt);
  }

  async addEmailAddress(emailAddress: InsertEmailAddress): Promise<EmailAddress> {
    const [newEmailAddress] = await db
      .insert(emailAddresses)
      .values(emailAddress)
      .returning();
    return newEmailAddress;
  }

  async updateEmailAddress(id: string, emailAddress: Partial<InsertEmailAddress>): Promise<EmailAddress> {
    const [updatedEmailAddress] = await db
      .update(emailAddresses)
      .set({ ...emailAddress, updatedAt: new Date() })
      .where(eq(emailAddresses.id, id))
      .returning();
    return updatedEmailAddress;
  }

  async deleteEmailAddress(id: string): Promise<void> {
    await db.delete(emailAddresses).where(eq(emailAddresses.id, id));
  }

  async setPrimaryEmailAddress(userId: string, emailId: string): Promise<void> {
    // First, unset all primary flags for this user
    await db
      .update(emailAddresses)
      .set({ isPrimary: false })
      .where(eq(emailAddresses.userId, userId));
    
    // Then set the specified email as primary
    await db
      .update(emailAddresses)
      .set({ isPrimary: true })
      .where(and(
        eq(emailAddresses.id, emailId),
        eq(emailAddresses.userId, userId)
      ));
  }

  // User roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const now = new Date();
    return await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.active, true),
          // Role must have started (or have no start date)
          or(isNull(userRoles.startDate), lte(userRoles.startDate, now)),
          // Role must not have ended (or have no end date)
          or(isNull(userRoles.endDate), gt(userRoles.endDate, now))
        )
      );
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    // Set default start date to now if not provided
    const roleData = {
      ...role,
      startDate: role.startDate || new Date(),
      active: role.active ?? true,
    };
    
    const [userRole] = await db.insert(userRoles).values(roleData).returning();
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

  // Get all user roles including inactive/expired ones for history
  async getAllUserRoles(userId: string): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .orderBy(desc(userRoles.startDate));
  }

  // End a user role while keeping history
  async endUserRole(id: string, endDate?: Date): Promise<UserRole> {
    const [userRole] = await db
      .update(userRoles)
      .set({ 
        endDate: endDate || new Date(),
        active: false 
      })
      .where(eq(userRoles.id, id))
      .returning();
    return userRole;
  }

  // Role definitions
  async getRoleDefinitions(schoolId?: string): Promise<RoleDefinition[]> {
    return await db
      .select()
      .from(roleDefinitions)
      .where(
        and(
          eq(roleDefinitions.active, true),
          schoolId ? eq(roleDefinitions.schoolId, schoolId) : isNull(roleDefinitions.schoolId)
        )
      );
  }

  async getHierarchicalRoles(schoolId?: string): Promise<RoleDefinition[]> {
    const whereClause = schoolId 
      ? and(
          eq(roleDefinitions.active, true),
          or(
            eq(roleDefinitions.schoolId, schoolId),
            and(
              isNull(roleDefinitions.schoolId),
              eq(roleDefinitions.networkDefault, true)
            )
          )
        )
      : and(
          eq(roleDefinitions.active, true),
          or(
            isNull(roleDefinitions.schoolId),
            eq(roleDefinitions.networkDefault, true)
          )
        );

    return await db
      .select()
      .from(roleDefinitions)
      .where(whereClause)
      .orderBy(roleDefinitions.category, roleDefinitions.subCategory, roleDefinitions.sortOrder);
  }

  async getRolesByCategory(category: string, schoolId?: string): Promise<RoleDefinition[]> {
    const whereClause = schoolId 
      ? and(
          eq(roleDefinitions.active, true),
          eq(roleDefinitions.category, category),
          or(
            eq(roleDefinitions.schoolId, schoolId),
            and(
              isNull(roleDefinitions.schoolId),
              eq(roleDefinitions.networkDefault, true)
            )
          )
        )
      : and(
          eq(roleDefinitions.active, true),
          eq(roleDefinitions.category, category),
          or(
            isNull(roleDefinitions.schoolId),
            eq(roleDefinitions.networkDefault, true)
          )
        );

    return await db
      .select()
      .from(roleDefinitions)
      .where(whereClause)
      .orderBy(roleDefinitions.subCategory, roleDefinitions.sortOrder);
  }

  async createRoleDefinition(role: InsertRoleDefinition): Promise<RoleDefinition> {
    const [newRole] = await db
      .insert(roleDefinitions)
      .values(role)
      .returning();
    return newRole;
  }

  async updateRoleDefinition(id: string, role: Partial<InsertRoleDefinition>): Promise<RoleDefinition> {
    const [updatedRole] = await db
      .update(roleDefinitions)
      .set(role)
      .where(eq(roleDefinitions.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRoleDefinition(id: string): Promise<void> {
    await db
      .update(roleDefinitions)
      .set({ active: false })
      .where(eq(roleDefinitions.id, id));
  }

  // Staff and role assignments at school level
  async getStaffBySchool(schoolId: string): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        eq(userRoles.active, true),
        eq(roleDefinitions.category, "educator")
      ))
      .groupBy(users.id, users.firstName, users.lastName, users.email, users.profileImageUrl);
  }

  async getStaffRoleAssignments(schoolId: string): Promise<any[]> {
    return await db
      .select({
        assignmentId: userRoles.id,
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        schoolId: userRoles.schoolId,
        classroomId: userRoles.classroomId,
        active: userRoles.active,
        startDate: userRoles.startDate,
        endDate: userRoles.endDate,
        roleName: roleDefinitions.name,
        roleDisplayName: roleDefinitions.displayName,
        roleCategory: roleDefinitions.category,
        roleSubCategory: roleDefinitions.subCategory,
        roleType: roleDefinitions.roleType,
        parentRoleId: roleDefinitions.parentRoleId,
        sortOrder: roleDefinitions.sortOrder,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(userRoles)
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .innerJoin(users, eq(users.id, userRoles.userId))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        eq(roleDefinitions.category, "educator"),
        eq(userRoles.active, true)
      ))
      .orderBy(users.lastName, users.firstName, roleDefinitions.sortOrder);
  }

  async assignUserRole(assignment: InsertUserRole): Promise<UserRole> {
    const [newAssignment] = await db
      .insert(userRoles)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateUserRoleAssignment(id: string, assignment: Partial<InsertUserRole>): Promise<UserRole> {
    const [updatedAssignment] = await db
      .update(userRoles)
      .set(assignment)
      .where(eq(userRoles.id, id))
      .returning();
    return updatedAssignment;
  }

  async bulkUpdateRoleAssignments(schoolId: string, assignments: any[]): Promise<void> {
    await db.transaction(async (tx) => {
      // First, end all current educator role assignments for this school
      await tx
        .update(userRoles)
        .set({ 
          active: false, 
          endDate: new Date() 
        })
        .where(and(
          eq(userRoles.schoolId, schoolId),
          eq(userRoles.active, true)
        ));

      // Then create new assignments
      if (assignments.length > 0) {
        await tx
          .insert(userRoles)
          .values(assignments.map(assignment => ({
            ...assignment,
            schoolId,
            active: true,
            startDate: new Date()
          })));
      }
    });
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
    // Set default program type based on level
    const programType = (classroomData.level === 'infant' || classroomData.level === 'toddler') 
      ? 'continuous' 
      : 'school_year';
    
    const [classroom] = await db.insert(classrooms).values({
      ...classroomData,
      programType: classroomData.programType || programType
    }).returning();
    return classroom;
  }

  async updateClassroom(id: string, classroomData: any): Promise<Classroom> {
    // Auto-set program type based on level if level is being updated and programType isn't explicitly set
    const updateData = { ...classroomData, updatedAt: new Date() };
    if (classroomData.level && !classroomData.programType) {
      updateData.programType = (classroomData.level === 'infant' || classroomData.level === 'toddler') 
        ? 'continuous' 
        : 'school_year';
    }
    
    const [classroom] = await db
      .update(classrooms)
      .set(updateData)
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
    const staffRoles = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        schoolId: userRoles.schoolId,
        classroomId: userRoles.classroomId,
        legalEntityId: userRoles.legalEntityId,
        active: userRoles.active,
        startDate: userRoles.startDate,
        endDate: userRoles.endDate,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: roleDefinitions.name, // Add role name for compatibility
        roleName: roleDefinitions.name,
        roleDisplayName: roleDefinitions.displayName,
        roleCategory: roleDefinitions.category,
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(userRoles.roleId, roleDefinitions.id))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        eq(userRoles.active, true),
        eq(roleDefinitions.category, 'educator') // Only show educator roles as staff
      ));

    // Process the data to handle role combinations and renaming
    const processedRoles = staffRoles.map(role => {
      // Rename School Administrator to Head of School
      if (role.roleName === 'school_admin') {
        return {
          ...role,
          roleDisplayName: 'Head of School',
          role: 'head_of_school'
        };
      }
      return role;
    });

    // Group by user and check for Teacher Leader combination
    const userGroups = processedRoles.reduce((acc, role) => {
      if (!acc[role.userId]) {
        acc[role.userId] = [];
      }
      acc[role.userId].push(role);
      return acc;
    }, {} as Record<string, any[]>);

    const finalRoles = [];
    for (const [userId, roles] of Object.entries(userGroups)) {
      const hasHeadOfSchool = roles.some(r => r.roleName === 'school_admin');
      const hasClassroomGuide = roles.some(r => r.roleName === 'classroom_guide');
      
      if (hasHeadOfSchool && hasClassroomGuide) {
        // Combine into Teacher Leader role
        const baseRole = roles[0];
        finalRoles.push({
          ...baseRole,
          roleDisplayName: 'Teacher Leader',
          role: 'teacher_leader',
          roleName: 'teacher_leader'
        });
      } else {
        // Keep individual roles
        finalRoles.push(...roles);
      }
    }

    return finalRoles;
  }



  // School years
  async getSchoolYearsBySchool(schoolId: string): Promise<any[]> {
    // Get both school-specific years and network-wide default years
    return await db
      .select()
      .from(schoolYears)
      .where(or(
        eq(schoolYears.schoolId, schoolId),
        eq(schoolYears.networkDefault, true)
      ))
      .orderBy(desc(schoolYears.startDate));
  }

  async createSchoolYear(schoolYearData: any): Promise<any> {
    // Convert date strings to Date objects if they exist
    const processedData = {
      ...schoolYearData,
      startDate: schoolYearData.startDate ? new Date(schoolYearData.startDate) : undefined,
      endDate: schoolYearData.endDate ? new Date(schoolYearData.endDate) : undefined,
    };
    
    const [schoolYear] = await db.insert(schoolYears).values(processedData).returning();
    return schoolYear;
  }

  async getSchoolYearById(id: string): Promise<SchoolYear | undefined> {
    const [schoolYear] = await db.select().from(schoolYears).where(eq(schoolYears.id, id));
    return schoolYear;
  }

  async updateSchoolYear(id: string, schoolYearData: Partial<InsertSchoolYear>): Promise<SchoolYear> {
    // Convert string dates to Date objects if provided
    const updateData: any = { ...schoolYearData };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    
    const [schoolYear] = await db
      .update(schoolYears)
      .set(updateData)
      .where(eq(schoolYears.id, id))
      .returning();
    return schoolYear;
  }

  async deleteSchoolYear(id: string): Promise<void> {
    await db.delete(schoolYears).where(eq(schoolYears.id, id));
  }

  async setActiveSchoolYear(yearId: string): Promise<SchoolYear> {
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

  // Academic calendars
  async getAcademicCalendarBySchoolYear(schoolYearId: string): Promise<AcademicCalendar | undefined> {
    const [calendar] = await db
      .select()
      .from(academicCalendars)
      .where(eq(academicCalendars.schoolYearId, schoolYearId));
    return calendar;
  }

  async createAcademicCalendar(calendarData: InsertAcademicCalendar): Promise<AcademicCalendar> {
    // Convert string dates to Date objects
    const firstDayOfSchool = calendarData.firstDayOfSchool ? new Date(calendarData.firstDayOfSchool) : null;
    const lastDayOfSchool = calendarData.lastDayOfSchool ? new Date(calendarData.lastDayOfSchool) : null;
    
    const [calendar] = await db
      .insert(academicCalendars)
      .values({
        ...calendarData,
        firstDayOfSchool,
        lastDayOfSchool,
      })
      .returning();
    return calendar;
  }

  async updateAcademicCalendar(id: string, calendarData: Partial<InsertAcademicCalendar>): Promise<AcademicCalendar> {
    // Convert string dates to Date objects if provided
    const updateData: any = { ...calendarData };
    if (updateData.firstDayOfSchool) {
      updateData.firstDayOfSchool = new Date(updateData.firstDayOfSchool);
    }
    if (updateData.lastDayOfSchool) {
      updateData.lastDayOfSchool = new Date(updateData.lastDayOfSchool);
    }
    
    const [calendar] = await db
      .update(academicCalendars)
      .set(updateData)
      .where(eq(academicCalendars.id, id))
      .returning();
    return calendar;
  }

  async deleteAcademicCalendar(id: string): Promise<void> {
    await db.delete(academicCalendars).where(eq(academicCalendars.id, id));
  }

  // Calendar closures
  async getCalendarClosuresByCalendar(calendarId: string): Promise<CalendarClosure[]> {
    return await db
      .select()
      .from(calendarClosures)
      .where(eq(calendarClosures.academicCalendarId, calendarId))
      .orderBy(asc(calendarClosures.date));
  }

  async createCalendarClosure(closureData: InsertCalendarClosure): Promise<CalendarClosure> {
    // Convert string date to Date object
    const date = closureData.date ? new Date(closureData.date) : new Date();
    
    const [closure] = await db
      .insert(calendarClosures)
      .values({
        ...closureData,
        date,
      })
      .returning();
    return closure;
  }

  async updateCalendarClosure(id: string, closureData: Partial<InsertCalendarClosure>): Promise<CalendarClosure> {
    // Convert string date to Date object if provided
    const updateData: any = { ...closureData };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    
    const [closure] = await db
      .update(calendarClosures)
      .set(updateData)
      .where(eq(calendarClosures.id, id))
      .returning();
    return closure;
  }

  async deleteCalendarClosure(id: string): Promise<void> {
    await db.delete(calendarClosures).where(eq(calendarClosures.id, id));
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
      .orderBy(desc(invoices.dueDate));
  }

  async createInvoice(invoiceData: any): Promise<any> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async getPaymentsByFamily(familyId: string): Promise<any[]> {
    return await db
      .select()
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.familyId, familyId))
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

  // Classroom schedules
  async getSchedulesByClassroom(classroomId: string): Promise<ClassroomSchedule[]> {
    return await db
      .select()
      .from(classroomSchedules)
      .where(eq(classroomSchedules.classroomId, classroomId))
      .orderBy(desc(classroomSchedules.startDate));
  }

  async getActiveScheduleByClassroom(classroomId: string): Promise<ClassroomSchedule | undefined> {
    const currentDate = new Date();
    const [schedule] = await db
      .select()
      .from(classroomSchedules)
      .where(and(
        eq(classroomSchedules.classroomId, classroomId),
        eq(classroomSchedules.isActive, true),
        lte(classroomSchedules.startDate, currentDate),
        or(
          isNull(classroomSchedules.endDate),
          gt(classroomSchedules.endDate, currentDate)
        )
      ))
      .orderBy(desc(classroomSchedules.startDate));
    return schedule;
  }

  async createClassroomSchedule(scheduleData: InsertClassroomSchedule): Promise<ClassroomSchedule> {
    // Convert string dates to Date objects if needed
    const processedData = {
      ...scheduleData,
      startDate: scheduleData.startDate instanceof Date ? scheduleData.startDate : new Date(scheduleData.startDate),
      endDate: scheduleData.endDate ? (scheduleData.endDate instanceof Date ? scheduleData.endDate : new Date(scheduleData.endDate)) : null,
    };

    const [schedule] = await db.insert(classroomSchedules).values(processedData).returning();
    return schedule;
  }

  async updateClassroomSchedule(id: string, scheduleData: Partial<InsertClassroomSchedule>): Promise<ClassroomSchedule> {
    // Convert string dates to Date objects if provided
    const updateData: any = { ...scheduleData, updatedAt: new Date() };
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }

    const [schedule] = await db
      .update(classroomSchedules)
      .set(updateData)
      .where(eq(classroomSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteClassroomSchedule(id: string): Promise<void> {
    await db.delete(classroomSchedules).where(eq(classroomSchedules.id, id));
  }

  // Program offerings
  async getProgramOfferingsByClassroom(classroomId: string): Promise<ProgramOffering[]> {
    return await db
      .select()
      .from(programOfferings)
      .where(eq(programOfferings.classroomId, classroomId))
      .orderBy(asc(programOfferings.startTime));
  }

  async getProgramOfferingsBySchoolYear(classroomId: string, schoolYearId: string): Promise<ProgramOffering[]> {
    return await db
      .select()
      .from(programOfferings)
      .where(and(
        eq(programOfferings.classroomId, classroomId),
        eq(programOfferings.schoolYearId, schoolYearId)
      ))
      .orderBy(asc(programOfferings.startTime));
  }

  async createProgramOffering(offeringData: InsertProgramOffering): Promise<ProgramOffering> {
    const [offering] = await db.insert(programOfferings).values(offeringData).returning();
    return offering;
  }

  async updateProgramOffering(id: string, offeringData: Partial<InsertProgramOffering>): Promise<ProgramOffering> {
    const [offering] = await db
      .update(programOfferings)
      .set({ ...offeringData, updatedAt: new Date() })
      .where(eq(programOfferings.id, id))
      .returning();
    return offering;
  }

  async deleteProgramOffering(id: string): Promise<void> {
    await db.delete(programOfferings).where(eq(programOfferings.id, id));
  }

  // Tuition Plans
  async getTuitionPlansByProgramOffering(programOfferingId: string): Promise<TuitionPlan[]> {
    return await db
      .select()
      .from(tuitionPlans)
      .where(eq(tuitionPlans.programOfferingId, programOfferingId))
      .orderBy(asc(tuitionPlans.name));
  }

  async getTuitionPlansByClassroom(classroomId: string): Promise<TuitionPlan[]> {
    return await db
      .select({
        id: tuitionPlans.id,
        programOfferingId: tuitionPlans.programOfferingId,
        slidingScalePolicyId: tuitionPlans.slidingScalePolicyId,
        name: tuitionPlans.name,
        fullPrice: tuitionPlans.fullPrice,
        billingFrequency: tuitionPlans.billingFrequency,
        isActive: tuitionPlans.isActive,
        createdAt: tuitionPlans.createdAt,
        updatedAt: tuitionPlans.updatedAt,
      })
      .from(tuitionPlans)
      .innerJoin(programOfferings, eq(tuitionPlans.programOfferingId, programOfferings.id))
      .where(eq(programOfferings.classroomId, classroomId))
      .orderBy(asc(tuitionPlans.name));
  }

  async createTuitionPlan(data: InsertTuitionPlan): Promise<TuitionPlan> {
    const [plan] = await db
      .insert(tuitionPlans)
      .values(data)
      .returning();
    return plan;
  }

  async updateTuitionPlan(id: string, data: Partial<InsertTuitionPlan>): Promise<TuitionPlan> {
    const [plan] = await db
      .update(tuitionPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tuitionPlans.id, id))
      .returning();
    return plan;
  }

  async deleteTuitionPlan(id: string): Promise<void> {
    await db.delete(tuitionPlans).where(eq(tuitionPlans.id, id));
  }

  // Sliding Scale Policies
  async getSlidingScalePoliciesBySchool(schoolId: string): Promise<SlidingScalePolicy[]> {
    return await db
      .select()
      .from(slidingScalePolicies)
      .where(eq(slidingScalePolicies.schoolId, schoolId))
      .orderBy(desc(slidingScalePolicies.createdAt));
  }

  async getActiveSlidingScalePoliciesBySchool(schoolId: string): Promise<SlidingScalePolicy[]> {
    const now = new Date();
    return await db
      .select()
      .from(slidingScalePolicies)
      .where(
        and(
          eq(slidingScalePolicies.schoolId, schoolId),
          eq(slidingScalePolicies.isActive, true),
          lte(slidingScalePolicies.startDate, now),
          or(
            isNull(slidingScalePolicies.endDate),
            gte(slidingScalePolicies.endDate, now)
          )
        )
      )
      .orderBy(desc(slidingScalePolicies.createdAt));
  }

  async getSlidingScalePolicyWithRules(policyId: string): Promise<any> {
    const [policy] = await db
      .select()
      .from(slidingScalePolicies)
      .where(eq(slidingScalePolicies.id, policyId));
    
    if (!policy) return null;

    const rules = await db
      .select()
      .from(slidingScaleRules)
      .where(eq(slidingScaleRules.policyId, policyId))
      .orderBy(asc(slidingScaleRules.minIncome));

    return { ...policy, rules };
  }

  async createSlidingScalePolicy(data: InsertSlidingScalePolicy, rules: InsertSlidingScaleRule[] = []): Promise<SlidingScalePolicy> {
    // Convert string dates to Date objects if needed
    const processedData: any = { ...data };
    if (processedData.startDate && typeof processedData.startDate === 'string') {
      processedData.startDate = new Date(processedData.startDate);
    }
    if (processedData.endDate && typeof processedData.endDate === 'string') {
      processedData.endDate = new Date(processedData.endDate);
    }

    const [policy] = await db
      .insert(slidingScalePolicies)
      .values(processedData)
      .returning();

    if (rules.length > 0) {
      const rulesWithPolicyId = rules.map(rule => ({
        ...rule,
        policyId: policy.id
      }));
      
      await db
        .insert(slidingScaleRules)
        .values(rulesWithPolicyId);
    }

    return policy;
  }

  async updateSlidingScalePolicy(id: string, data: Partial<InsertSlidingScalePolicy>): Promise<SlidingScalePolicy> {
    // Convert string dates to Date objects if needed
    const updateData: any = { ...data, updatedAt: new Date() };
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }

    const [policy] = await db
      .update(slidingScalePolicies)
      .set(updateData)
      .where(eq(slidingScalePolicies.id, id))
      .returning();
    return policy;
  }

  async deactivateSlidingScalePolicy(id: string): Promise<SlidingScalePolicy> {
    const [policy] = await db
      .update(slidingScalePolicies)
      .set({ 
        isActive: false,
        endDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(slidingScalePolicies.id, id))
      .returning();
    return policy;
  }

  async deleteSlidingScalePolicy(id: string): Promise<void> {
    await db.delete(slidingScalePolicies).where(eq(slidingScalePolicies.id, id));
  }

  // ======================== PUBLIC SUBSIDY PROGRAMS ========================
  
  async getPublicSubsidyProgramsBySchool(schoolId: string): Promise<PublicSubsidyProgram[]> {
    return await db
      .select()
      .from(publicSubsidyPrograms)
      .where(eq(publicSubsidyPrograms.schoolId, schoolId))
      .orderBy(asc(publicSubsidyPrograms.type), asc(publicSubsidyPrograms.name));
  }

  async getActivePublicSubsidyProgramsBySchool(schoolId: string): Promise<PublicSubsidyProgram[]> {
    const now = new Date();
    return await db
      .select()
      .from(publicSubsidyPrograms)
      .where(and(
        eq(publicSubsidyPrograms.schoolId, schoolId),
        eq(publicSubsidyPrograms.isActive, true),
        or(
          isNull(publicSubsidyPrograms.endDate),
          gte(publicSubsidyPrograms.endDate, now)
        )
      ))
      .orderBy(asc(publicSubsidyPrograms.type), asc(publicSubsidyPrograms.name));
  }

  async getPublicSubsidyProgramById(id: string): Promise<PublicSubsidyProgram | undefined> {
    const [program] = await db
      .select()
      .from(publicSubsidyPrograms)
      .where(eq(publicSubsidyPrograms.id, id));
    return program;
  }

  async createPublicSubsidyProgram(data: InsertPublicSubsidyProgram): Promise<PublicSubsidyProgram> {
    // Convert date strings to Date objects
    const insertData = { ...data };
    if (insertData.startDate && typeof insertData.startDate === 'string') {
      insertData.startDate = new Date(insertData.startDate);
    }
    if (insertData.endDate && typeof insertData.endDate === 'string') {
      insertData.endDate = new Date(insertData.endDate);
    }
    if (insertData.applicationDeadline && typeof insertData.applicationDeadline === 'string') {
      insertData.applicationDeadline = new Date(insertData.applicationDeadline);
    }

    const [program] = await db
      .insert(publicSubsidyPrograms)
      .values(insertData)
      .returning();
    return program;
  }

  async updatePublicSubsidyProgram(id: string, data: Partial<InsertPublicSubsidyProgram>): Promise<PublicSubsidyProgram> {
    const updateData = { ...data, updatedAt: new Date() };
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.applicationDeadline && typeof updateData.applicationDeadline === 'string') {
      updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    }

    const [program] = await db
      .update(publicSubsidyPrograms)
      .set(updateData)
      .where(eq(publicSubsidyPrograms.id, id))
      .returning();
    return program;
  }

  async deactivatePublicSubsidyProgram(id: string): Promise<PublicSubsidyProgram> {
    const [program] = await db
      .update(publicSubsidyPrograms)
      .set({ 
        isActive: false,
        endDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(publicSubsidyPrograms.id, id))
      .returning();
    return program;
  }

  async deletePublicSubsidyProgram(id: string): Promise<void> {
    await db.delete(publicSubsidyPrograms).where(eq(publicSubsidyPrograms.id, id));
  }

  // ======================== SUBSIDY RATES ========================
  
  async getSubsidyRatesByProgram(programId: string): Promise<SubsidyRate[]> {
    return await db
      .select()
      .from(subsidyRates)
      .where(eq(subsidyRates.programId, programId))
      .orderBy(asc(subsidyRates.childType), asc(subsidyRates.effectiveDate));
  }

  async getActiveSubsidyRatesByProgram(programId: string): Promise<SubsidyRate[]> {
    const now = new Date();
    return await db
      .select()
      .from(subsidyRates)
      .where(and(
        eq(subsidyRates.programId, programId),
        eq(subsidyRates.isActive, true),
        lte(subsidyRates.effectiveDate, now),
        or(
          isNull(subsidyRates.expirationDate),
          gte(subsidyRates.expirationDate, now)
        )
      ))
      .orderBy(asc(subsidyRates.childType), desc(subsidyRates.effectiveDate));
  }

  async getSubsidyRateById(id: string): Promise<SubsidyRate | undefined> {
    const [rate] = await db
      .select()
      .from(subsidyRates)
      .where(eq(subsidyRates.id, id));
    return rate;
  }

  async createSubsidyRate(data: InsertSubsidyRate): Promise<SubsidyRate> {
    const insertData = { ...data };
    if (insertData.effectiveDate && typeof insertData.effectiveDate === 'string') {
      insertData.effectiveDate = new Date(insertData.effectiveDate);
    }
    if (insertData.expirationDate && typeof insertData.expirationDate === 'string') {
      insertData.expirationDate = new Date(insertData.expirationDate);
    }

    const [rate] = await db
      .insert(subsidyRates)
      .values(insertData)
      .returning();
    return rate;
  }

  async updateSubsidyRate(id: string, data: Partial<InsertSubsidyRate>): Promise<SubsidyRate> {
    const updateData = { ...data, updatedAt: new Date() };
    if (updateData.effectiveDate && typeof updateData.effectiveDate === 'string') {
      updateData.effectiveDate = new Date(updateData.effectiveDate);
    }
    if (updateData.expirationDate && typeof updateData.expirationDate === 'string') {
      updateData.expirationDate = new Date(updateData.expirationDate);
    }

    const [rate] = await db
      .update(subsidyRates)
      .set(updateData)
      .where(eq(subsidyRates.id, id))
      .returning();
    return rate;
  }

  async deactivateSubsidyRate(id: string): Promise<SubsidyRate> {
    const [rate] = await db
      .update(subsidyRates)
      .set({ 
        isActive: false,
        expirationDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(subsidyRates.id, id))
      .returning();
    return rate;
  }

  async deleteSubsidyRate(id: string): Promise<void> {
    await db.delete(subsidyRates).where(eq(subsidyRates.id, id));
  }

  // ======================== CHILD SUBSIDY ASSIGNMENTS ========================
  
  async getChildSubsidyAssignmentsByChild(childId: string): Promise<ChildSubsidyAssignment[]> {
    return await db
      .select()
      .from(childSubsidyAssignments)
      .where(eq(childSubsidyAssignments.childId, childId))
      .orderBy(desc(childSubsidyAssignments.startDate));
  }

  async getActiveChildSubsidyAssignmentsByChild(childId: string): Promise<ChildSubsidyAssignment[]> {
    const now = new Date();
    return await db
      .select()
      .from(childSubsidyAssignments)
      .where(and(
        eq(childSubsidyAssignments.childId, childId),
        eq(childSubsidyAssignments.isActive, true),
        lte(childSubsidyAssignments.startDate, now),
        or(
          isNull(childSubsidyAssignments.endDate),
          gte(childSubsidyAssignments.endDate, now)
        )
      ))
      .orderBy(desc(childSubsidyAssignments.startDate));
  }

  async getChildSubsidyAssignmentsByFamily(familyId: string): Promise<ChildSubsidyAssignment[]> {
    return await db
      .select({
        id: childSubsidyAssignments.id,
        childId: childSubsidyAssignments.childId,
        programId: childSubsidyAssignments.programId,
        rateId: childSubsidyAssignments.rateId,
        startDate: childSubsidyAssignments.startDate,
        endDate: childSubsidyAssignments.endDate,
        applicationDate: childSubsidyAssignments.applicationDate,
        approvalDate: childSubsidyAssignments.approvalDate,
        applicationStatus: childSubsidyAssignments.applicationStatus,
        approvedAmount: childSubsidyAssignments.approvedAmount,
        familyIncomeAtApplication: childSubsidyAssignments.familyIncomeAtApplication,
        familySizeAtApplication: childSubsidyAssignments.familySizeAtApplication,
        externalId: childSubsidyAssignments.externalId,
        lastVerificationDate: childSubsidyAssignments.lastVerificationDate,
        nextVerificationDue: childSubsidyAssignments.nextVerificationDue,
        complianceNotes: childSubsidyAssignments.complianceNotes,
        caseworkerName: childSubsidyAssignments.caseworkerName,
        caseworkerPhone: childSubsidyAssignments.caseworkerPhone,
        caseworkerEmail: childSubsidyAssignments.caseworkerEmail,
        isActive: childSubsidyAssignments.isActive,
        createdAt: childSubsidyAssignments.createdAt,
        updatedAt: childSubsidyAssignments.updatedAt,
      })
      .from(childSubsidyAssignments)
      .innerJoin(children, eq(childSubsidyAssignments.childId, children.id))
      .where(eq(children.familyId, familyId))
      .orderBy(desc(childSubsidyAssignments.startDate));
  }

  async getChildSubsidyAssignmentsBySchool(schoolId: string): Promise<ChildSubsidyAssignment[]> {
    return await db
      .select({
        id: childSubsidyAssignments.id,
        childId: childSubsidyAssignments.childId,
        programId: childSubsidyAssignments.programId,
        rateId: childSubsidyAssignments.rateId,
        startDate: childSubsidyAssignments.startDate,
        endDate: childSubsidyAssignments.endDate,
        applicationDate: childSubsidyAssignments.applicationDate,
        approvalDate: childSubsidyAssignments.approvalDate,
        applicationStatus: childSubsidyAssignments.applicationStatus,
        approvedAmount: childSubsidyAssignments.approvedAmount,
        familyIncomeAtApplication: childSubsidyAssignments.familyIncomeAtApplication,
        familySizeAtApplication: childSubsidyAssignments.familySizeAtApplication,
        externalId: childSubsidyAssignments.externalId,
        lastVerificationDate: childSubsidyAssignments.lastVerificationDate,
        nextVerificationDue: childSubsidyAssignments.nextVerificationDue,
        complianceNotes: childSubsidyAssignments.complianceNotes,
        caseworkerName: childSubsidyAssignments.caseworkerName,
        caseworkerPhone: childSubsidyAssignments.caseworkerPhone,
        caseworkerEmail: childSubsidyAssignments.caseworkerEmail,
        isActive: childSubsidyAssignments.isActive,
        createdAt: childSubsidyAssignments.createdAt,
        updatedAt: childSubsidyAssignments.updatedAt,
      })
      .from(childSubsidyAssignments)
      .innerJoin(children, eq(childSubsidyAssignments.childId, children.id))
      .innerJoin(enrollments, eq(children.id, enrollments.childId))
      .where(eq(enrollments.schoolId, schoolId))
      .orderBy(desc(childSubsidyAssignments.startDate));
  }

  async getChildSubsidyAssignmentById(id: string): Promise<ChildSubsidyAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(childSubsidyAssignments)
      .where(eq(childSubsidyAssignments.id, id));
    return assignment;
  }

  async createChildSubsidyAssignment(data: InsertChildSubsidyAssignment): Promise<ChildSubsidyAssignment> {
    const insertData = { ...data };
    if (insertData.startDate && typeof insertData.startDate === 'string') {
      insertData.startDate = new Date(insertData.startDate);
    }
    if (insertData.endDate && typeof insertData.endDate === 'string') {
      insertData.endDate = new Date(insertData.endDate);
    }
    if (insertData.applicationDate && typeof insertData.applicationDate === 'string') {
      insertData.applicationDate = new Date(insertData.applicationDate);
    }
    if (insertData.approvalDate && typeof insertData.approvalDate === 'string') {
      insertData.approvalDate = new Date(insertData.approvalDate);
    }
    if (insertData.lastVerificationDate && typeof insertData.lastVerificationDate === 'string') {
      insertData.lastVerificationDate = new Date(insertData.lastVerificationDate);
    }
    if (insertData.nextVerificationDue && typeof insertData.nextVerificationDue === 'string') {
      insertData.nextVerificationDue = new Date(insertData.nextVerificationDue);
    }

    const [assignment] = await db
      .insert(childSubsidyAssignments)
      .values(insertData)
      .returning();
    return assignment;
  }

  async updateChildSubsidyAssignment(id: string, data: Partial<InsertChildSubsidyAssignment>): Promise<ChildSubsidyAssignment> {
    const updateData = { ...data, updatedAt: new Date() };
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.applicationDate && typeof updateData.applicationDate === 'string') {
      updateData.applicationDate = new Date(updateData.applicationDate);
    }
    if (updateData.approvalDate && typeof updateData.approvalDate === 'string') {
      updateData.approvalDate = new Date(updateData.approvalDate);
    }
    if (updateData.lastVerificationDate && typeof updateData.lastVerificationDate === 'string') {
      updateData.lastVerificationDate = new Date(updateData.lastVerificationDate);
    }
    if (updateData.nextVerificationDue && typeof updateData.nextVerificationDue === 'string') {
      updateData.nextVerificationDue = new Date(updateData.nextVerificationDue);
    }

    const [assignment] = await db
      .update(childSubsidyAssignments)
      .set(updateData)
      .where(eq(childSubsidyAssignments.id, id))
      .returning();
    return assignment;
  }

  async endChildSubsidyAssignment(id: string, endDate?: Date): Promise<ChildSubsidyAssignment> {
    const [assignment] = await db
      .update(childSubsidyAssignments)
      .set({ 
        endDate: endDate || new Date(),
        isActive: false,
        updatedAt: new Date() 
      })
      .where(eq(childSubsidyAssignments.id, id))
      .returning();
    return assignment;
  }

  async deleteChildSubsidyAssignment(id: string): Promise<void> {
    await db.delete(childSubsidyAssignments).where(eq(childSubsidyAssignments.id, id));
  }

  // ======================== TUITION CALCULATION FOR ENROLLMENT ========================
  
  // Legacy method needed for existing routes
  async getTuitionPlansBySchool(schoolId: string): Promise<TuitionPlan[]> {
    return await db
      .select({
        id: tuitionPlans.id,
        programOfferingId: tuitionPlans.programOfferingId,
        slidingScalePolicyId: tuitionPlans.slidingScalePolicyId,
        name: tuitionPlans.name,
        fullPrice: tuitionPlans.fullPrice,
        billingFrequency: tuitionPlans.billingFrequency,
        isActive: tuitionPlans.isActive,
        createdAt: tuitionPlans.createdAt,
        updatedAt: tuitionPlans.updatedAt,
      })
      .from(tuitionPlans)
      .innerJoin(programOfferings, eq(tuitionPlans.programOfferingId, programOfferings.id))
      .innerJoin(classrooms, eq(programOfferings.classroomId, classrooms.id))
      .where(eq(classrooms.schoolId, schoolId))
      .orderBy(asc(tuitionPlans.name));
  }

  // Calculate family tuition obligation based on program, income, and subsidies
  async calculateFamilyTuitionObligation(
    programOfferingId: string,
    familyIncome: number,
    familySize: number,
    childId: string
  ): Promise<{
    fullPrice: number;
    slidingScaleDiscount: number;
    subsidyAmount: number;
    familyObligation: number;
    calculations: {
      tuitionPlan: TuitionPlan;
      slidingScaleRule?: SlidingScaleRule;
      applicableSubsidies: Array<{
        program: PublicSubsidyProgram;
        rate: SubsidyRate;
        calculatedAmount: number;
      }>;
    };
  }> {
    // Get the tuition plan for this program offering
    const [tuitionPlan] = await db
      .select()
      .from(tuitionPlans)
      .where(and(
        eq(tuitionPlans.programOfferingId, programOfferingId),
        eq(tuitionPlans.isActive, true)
      ))
      .limit(1);

    if (!tuitionPlan) {
      throw new Error('No active tuition plan found for this program offering');
    }

    const fullPrice = parseFloat(tuitionPlan.fullPrice);
    let slidingScaleDiscount = 0;
    let subsidyAmount = 0;
    let applicableSubsidies: any[] = [];
    let slidingScaleRule: SlidingScaleRule | undefined;

    // Apply sliding scale discount based on family income
    if (tuitionPlan.slidingScalePolicyId) {
      const policy = await this.getSlidingScalePolicyWithRules(tuitionPlan.slidingScalePolicyId);
      if (policy && policy.rules) {
        // Find the applicable rule based on family income (adjusted for family size)
        const adjustedIncome = this.adjustIncomeForFamilySize(familyIncome, familySize, policy.baseFamilySize || 4, policy.familySizeAdjustment || 0.1);
        
        for (const rule of policy.rules) {
          const minIncome = parseFloat(rule.minIncomeThreshold || '0');
          const maxIncome = parseFloat(rule.maxIncomeThreshold || '999999999');
          
          if (adjustedIncome >= minIncome && adjustedIncome <= maxIncome) {
            slidingScaleRule = rule;
            slidingScaleDiscount = fullPrice * (parseFloat(rule.discountPercentage) / 100);
            break;
          }
        }
      }
    }

    // Calculate public subsidies
    const child = await db.select().from(children).where(eq(children.id, childId)).limit(1);
    if (child.length > 0) {
      const activeSubsidies = await this.getActiveChildSubsidyAssignmentsByChild(childId);
      
      for (const subsidyAssignment of activeSubsidies) {
        if (subsidyAssignment.applicationStatus === 'approved' && subsidyAssignment.approvedAmount) {
          const program = await this.getPublicSubsidyProgramById(subsidyAssignment.programId);
          const rate = await this.getSubsidyRateById(subsidyAssignment.rateId);
          
          if (program && rate) {
            const subsidyAmountForThisProgram = parseFloat(subsidyAssignment.approvedAmount);
            subsidyAmount += subsidyAmountForThisProgram;
            
            applicableSubsidies.push({
              program,
              rate,
              calculatedAmount: subsidyAmountForThisProgram,
            });
          }
        }
      }
    }

    // Calculate final family obligation
    const priceAfterSlidingScale = fullPrice - slidingScaleDiscount;
    const familyObligation = Math.max(0, priceAfterSlidingScale - subsidyAmount);

    return {
      fullPrice,
      slidingScaleDiscount,
      subsidyAmount,
      familyObligation,
      calculations: {
        tuitionPlan,
        slidingScaleRule,
        applicableSubsidies,
      },
    };
  }

  private adjustIncomeForFamilySize(
    income: number,
    actualFamilySize: number,
    baseFamilySize: number,
    adjustmentRate: number
  ): number {
    const sizeDifference = actualFamilySize - baseFamilySize;
    if (sizeDifference === 0) return income;
    
    // For larger families, we effectively reduce their income for qualification purposes
    // For smaller families, we increase their effective income
    const adjustmentFactor = 1 - (sizeDifference * adjustmentRate);
    return income * adjustmentFactor;
  }

  // Get available subsidy programs for a child based on age, grade, and eligibility
  async getEligibleSubsidyProgramsForChild(
    childId: string,
    schoolId: string,
    familyIncome: number,
    familySize: number
  ): Promise<Array<{
    program: PublicSubsidyProgram;
    eligibleRates: Array<{
      rate: SubsidyRate;
      estimatedAmount: number;
    }>;
  }>> {
    const [child] = await db.select().from(children).where(eq(children.id, childId));
    if (!child) return [];

    const childAgeMonths = this.calculateAgeInMonths(child.birthDate);
    const activePrograms = await this.getActivePublicSubsidyProgramsBySchool(schoolId);
    const eligiblePrograms: any[] = [];

    for (const program of activePrograms) {
      const rates = await this.getActiveSubsidyRatesByProgram(program.id);
      const eligibleRates: any[] = [];

      for (const rate of rates) {
        let isEligible = false;

        // Check age eligibility
        if (rate.minAgeMonths !== null && rate.maxAgeMonths !== null) {
          isEligible = childAgeMonths >= rate.minAgeMonths && childAgeMonths <= rate.maxAgeMonths;
        }

        // Check grade eligibility (would need child's current grade - for now assume eligible)
        if (rate.gradeLevel) {
          isEligible = true; // Would check against child's enrollment grade
        }

        // Check income eligibility
        if (isEligible && (rate.incomeEligibilityMin || rate.incomeEligibilityMax)) {
          const adjustedIncome = this.adjustIncomeForFamilySize(
            familyIncome,
            familySize,
            rate.baseFamilySize || 4,
            parseFloat(rate.familySizeAdjustment || '0.1')
          );

          const minIncome = parseFloat(rate.incomeEligibilityMin || '0');
          const maxIncome = parseFloat(rate.incomeEligibilityMax || '999999999');
          isEligible = adjustedIncome >= minIncome && adjustedIncome <= maxIncome;
        }

        if (isEligible) {
          const estimatedAmount = this.calculateSubsidyAmount(rate, familyIncome, familySize);
          eligibleRates.push({ rate, estimatedAmount });
        }
      }

      if (eligibleRates.length > 0) {
        eligiblePrograms.push({ program, eligibleRates });
      }
    }

    return eligiblePrograms;
  }

  private calculateAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const birth = new Date(dateOfBirth);
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Average days per month
  }

  private calculateSubsidyAmount(rate: SubsidyRate, familyIncome: number, familySize: number): number {
    const baseAmount = parseFloat(rate.baseAmount);
    
    // If there's income phase-out, calculate the reduced amount
    if (rate.incomePhaseOutStart && rate.incomePhaseOutEnd) {
      const adjustedIncome = this.adjustIncomeForFamilySize(
        familyIncome,
        familySize,
        rate.baseFamilySize || 4,
        parseFloat(rate.familySizeAdjustment || '0.1')
      );

      const phaseOutStart = parseFloat(rate.incomePhaseOutStart);
      const phaseOutEnd = parseFloat(rate.incomePhaseOutEnd);

      if (adjustedIncome >= phaseOutStart) {
        if (adjustedIncome >= phaseOutEnd) {
          return 0; // No subsidy above phase-out end
        }

        // Calculate reduced amount based on phase-out type
        const phaseOutProgress = (adjustedIncome - phaseOutStart) / (phaseOutEnd - phaseOutStart);
        
        switch (rate.phaseOutType) {
          case 'linear':
            return baseAmount * (1 - phaseOutProgress);
          case 'cliff':
            return 0; // Cliff means immediate cutoff at phase-out start
          case 'stepped':
            // Could implement stepped reductions here
            return baseAmount * (1 - Math.floor(phaseOutProgress * 4) / 4);
          default:
            return baseAmount * (1 - phaseOutProgress);
        }
      }
    }

    return baseAmount;
  }
}

export const storage = new DatabaseStorage();
