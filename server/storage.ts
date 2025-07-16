import {
  users,
  userRoles,
  roleDefinitions,
  schools,
  schoolYears,

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
  guardians,
  enrollments,
  attendance,
  tasks,
  messages,
  channels,
  channelMembers,
  billingSetups,
  invoices,
  payments,
  emailAddresses,
  genders,
  raceEthnicities,
  languages,

  type User,
  type UpsertUser,
  type UserRole,
  type InsertUserRole,
  type RoleDefinition,
  type InsertRoleDefinition,
  type School,
  type SchoolYear,
  type InsertSchoolYear,

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
  type Guardian,
  type InsertGuardian,
  type Enrollment,
  type Attendance,
  type InsertAttendance,
  type Task,
  type InsertTask,
  type Message,
  type InsertMessage,
  type Channel,
  type InsertChannel,
  type EmailAddress,
  type InsertEmailAddress,
  type Gender,
  type RaceEthnicity,
  type Language,
  
  // Lessons and Observations
  lessons,
  lessonObservations,
  studentYearGroups,
  type Lesson,
  type InsertLesson,
  type LessonObservation,
  type InsertLessonObservation,
  type StudentYearGroup,
  type InsertStudentYearGroup,

} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, isNull, isNotNull, or, lte, gte, gt, like } from "drizzle-orm";
import { HolidayService } from "./holidayService";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
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
  getRolesByNamePrefix(namePrefix: string, schoolId?: string): Promise<RoleDefinition[]>;
  createRoleDefinition(role: InsertRoleDefinition): Promise<RoleDefinition>;
  updateRoleDefinition(id: string, role: Partial<InsertRoleDefinition>): Promise<RoleDefinition>;
  deleteRoleDefinition(id: string): Promise<void>;
  
  // Staff and role assignments at school level
  getStaffBySchool(schoolId: string): Promise<any[]>;
  getStaffRoleAssignments(schoolId: string): Promise<any[]>;
  assignUserRole(assignment: InsertUserRole): Promise<UserRole>;
  updateUserRoleAssignment(id: string, assignment: Partial<InsertUserRole>): Promise<UserRole>;
  bulkUpdateRoleAssignments(schoolId: string, assignments: any[]): Promise<void>;
  getEducatorAdminsForEmulation(): Promise<any[]>;
  
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
  createStaffMember(staffData: {
    firstName: string;
    lastName: string;
    email: string;
    coreRole: string;
    schoolId: string;
    startDate: Date;
  }): Promise<{ user: User; roles: UserRole[] }>;
  getEducatorAdminsForEmulation(): Promise<any[]>;
  
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
  
  // Network school years (for system admin defaults)
  getNetworkSchoolYears(): Promise<SchoolYear[]>;
  createNetworkSchoolYear(schoolYear: InsertSchoolYear): Promise<SchoolYear>;
  updateNetworkSchoolYear(id: string, schoolYear: Partial<InsertSchoolYear>): Promise<SchoolYear>;
  deleteNetworkSchoolYear(id: string): Promise<void>;
  
  // Calendar closures
  getCalendarClosuresBySchoolYear(schoolYearId: string): Promise<CalendarClosure[]>;
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
  getChildById(id: string): Promise<Child | undefined>;
  createChild(child: any): Promise<Child>;
  updateChild(id: string, child: any): Promise<Child>;
  
  // Demographic reference data
  getGenders(): Promise<Gender[]>;
  getRaceEthnicities(): Promise<RaceEthnicity[]>;
  getLanguages(): Promise<Language[]>;
  
  // Enrollments
  getEnrollmentsBySchool(schoolId: string): Promise<any[]>;
  getEnrollmentsByClassroom(classroomId: string): Promise<any[]>;
  getEnrollmentsByFamily(familyId: string): Promise<any[]>;
  createEnrollment(enrollment: any): Promise<any>;
  
  // Tasks
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksBySchool(schoolId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
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

  // Attendance operations
  saveAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByClassroomAndDate(classroomId: string, date: string): Promise<Attendance[]>;
  getCurrentAttendanceByClassroomAndDate(classroomId: string, date: string): Promise<Attendance[]>;
  getAttendanceHistoryByClassroom(classroomId: string): Promise<{ date: string; recordCount: number }[]>;
  getAttendanceRecordsByClassroomAndDate(classroomId: string, date: string): Promise<any[]>;
  
  // Lessons and Observations
  getLessonsByClassroom(classroomId: string, filters?: {
    curriculumArea?: string;
    ageGroup?: string;
    presentedToYearGroup?: string;
    schoolYearId?: string;
  }): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Lesson observations for the grid
  getLessonObservationsByClassroom(classroomId: string, filters?: {
    observationType?: string[];
    studentIds?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<LessonObservation[]>;
  getLessonObservationsByStudent(studentId: string, classroomId: string): Promise<LessonObservation[]>;
  createLessonObservation(observation: InsertLessonObservation): Promise<LessonObservation>;
  createBulkLessonObservations(observations: InsertLessonObservation[]): Promise<LessonObservation[]>;
  updateLessonObservation(id: string, observation: Partial<InsertLessonObservation>): Promise<LessonObservation>;
  deleteLessonObservation(id: string): Promise<void>;
  
  // Student year groups for filtering
  getStudentYearGroupsByClassroom(classroomId: string, schoolYearId?: string): Promise<StudentYearGroup[]>;
  createStudentYearGroup(yearGroup: InsertStudentYearGroup): Promise<StudentYearGroup>;
  updateStudentYearGroup(id: string, yearGroup: Partial<InsertStudentYearGroup>): Promise<StudentYearGroup>;
  deleteStudentYearGroup(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Remove id from userData if present to let UUID generate automatically
    const { id, ...userDataWithoutId } = userData;
    
    const [user] = await db
      .insert(users)
      .values(userDataWithoutId)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userDataWithoutId,
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
    const whereClause = schoolId 
      ? and(
          eq(roleDefinitions.active, true),
          or(
            eq(roleDefinitions.schoolId, schoolId),
            isNull(roleDefinitions.schoolId)
          )
        )
      : eq(roleDefinitions.active, true);

    return await db
      .select()
      .from(roleDefinitions)
      .where(whereClause)
      .orderBy(roleDefinitions.level, roleDefinitions.name);
  }

  async getHierarchicalRoles(schoolId?: string): Promise<RoleDefinition[]> {
    const whereClause = schoolId 
      ? and(
          eq(roleDefinitions.active, true),
          or(
            eq(roleDefinitions.schoolId, schoolId),
            isNull(roleDefinitions.schoolId)
          )
        )
      : eq(roleDefinitions.active, true);

    return await db
      .select()
      .from(roleDefinitions)
      .where(whereClause)
      .orderBy(roleDefinitions.level, roleDefinitions.name);
  }

  async getRolesByNamePrefix(namePrefix: string, schoolId?: string): Promise<RoleDefinition[]> {
    const whereClause = schoolId 
      ? and(
          eq(roleDefinitions.active, true),
          sql`${roleDefinitions.name} LIKE ${namePrefix + '%'}`,
          or(
            eq(roleDefinitions.schoolId, schoolId),
            isNull(roleDefinitions.schoolId)
          )
        )
      : and(
          eq(roleDefinitions.active, true),
          sql`${roleDefinitions.name} LIKE ${namePrefix + '%'}`
        );

    return await db
      .select()
      .from(roleDefinitions)
      .where(whereClause)
      .orderBy(roleDefinitions.displayName);
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
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(userRoles)
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .innerJoin(users, eq(users.id, userRoles.userId))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        sql`${roleDefinitions.name} LIKE 'educator%'`,
        eq(userRoles.active, true)
      ))
      .orderBy(users.lastName, users.firstName, roleDefinitions.displayName);
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

  // Get educator admins for emulation
  async getEducatorAdminsForEmulation(): Promise<any[]> {
    console.log('Fetching educator admins for emulation...');
    
    // Get unique users who have educator_admin roles
    const rawEducators = await db
      .select({
        userId: userRoles.userId,
        schoolId: userRoles.schoolId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        schoolName: schools.name,
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(userRoles.roleId, roleDefinitions.id))
      .innerJoin(schools, eq(userRoles.schoolId, schools.id))
      .where(and(
        eq(userRoles.active, true),
        like(roleDefinitions.name, 'educator_admin%'),
        isNotNull(userRoles.schoolId)
      ));

    // Group by user+school to avoid duplicates
    const uniqueEducators = rawEducators.reduce((acc, educator) => {
      const key = `${educator.userId}-${educator.schoolId}`;
      if (!acc[key]) {
        acc[key] = {
          ...educator,
          // Use email prefix as fallback name if firstName/lastName are null
          firstName: educator.firstName || educator.email?.split('@')[0] || 'Unknown',
          lastName: educator.lastName || 'User',
          roleDisplayName: 'Educator Admin'
        };
      }
      return acc;
    }, {} as Record<string, any>);

    const educators = Object.values(uniqueEducators);
    console.log('Found unique educators:', educators.length, educators);
    return educators;
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

      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(userRoles.roleId, roleDefinitions.id))
      .where(and(
        eq(userRoles.schoolId, schoolId),
        eq(userRoles.active, true),
        sql`${roleDefinitions.name} LIKE 'educator%'` // Only show educator roles as staff
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

  async createStaffMember(staffData: {
    firstName: string;
    lastName: string;
    email: string;
    coreRole: string;
    schoolId: string;
    startDate: Date;
  }): Promise<{ user: User; roles: UserRole[] }> {
    // Check if user already exists
    let user = await this.getUserByEmail(staffData.email);
    
    if (!user) {
      // Create new user
      user = await this.upsertUser({
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        profileImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${staffData.firstName} ${staffData.lastName}`,
      });
    }

    // Define role mappings based on core role
    const roleMapping: Record<string, string[]> = {
      'teacher_leader': ['educator_admin', 'educator_classroom_guide'],
      'teacher': ['educator_classroom_guide'],
      'assistant': ['educator_classroom_assistant'],
      'aide': ['educator_assistant_aide']
    };

    const rolesToAssign = roleMapping[staffData.coreRole] || [];
    const createdRoles: UserRole[] = [];

    // Create role assignments
    for (const roleName of rolesToAssign) {
      // Find the role definition
      const roleDefinitions = await this.getRolesByNamePrefix(roleName, staffData.schoolId);
      const roleDefinition = roleDefinitions.find(r => r.name === roleName);
      
      if (roleDefinition) {
        const userRole = await this.createUserRole({
          userId: user.id,
          roleId: roleDefinition.id,
          schoolId: staffData.schoolId,
          startDate: staffData.startDate,
          active: true
        });
        createdRoles.push(userRole);
      }
    }

    return { user, roles: createdRoles };
  }



  // School years
  async getSchoolYearsBySchool(schoolId: string): Promise<any[]> {
    // Get only school-specific years (not network defaults)
    return await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.schoolId, schoolId))
      .orderBy(desc(schoolYears.startDate));
  }

  async getSchoolYearsIncludingDefaults(schoolId: string): Promise<any[]> {
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
    // Convert date strings to Date objects with proper timezone handling
    const processedData = {
      ...schoolYearData,
      startDate: schoolYearData.startDate instanceof Date 
        ? schoolYearData.startDate 
        : schoolYearData.startDate 
          ? new Date(schoolYearData.startDate + (schoolYearData.startDate.includes('T') ? '' : 'T00:00:00'))
          : undefined,
      endDate: schoolYearData.endDate instanceof Date 
        ? schoolYearData.endDate 
        : schoolYearData.endDate 
          ? new Date(schoolYearData.endDate + (schoolYearData.endDate.includes('T') ? '' : 'T00:00:00'))
          : undefined,
    };
    
    const [schoolYear] = await db.insert(schoolYears).values(processedData).returning();
    return schoolYear;
  }

  async getSchoolYearById(id: string): Promise<SchoolYear | undefined> {
    const [schoolYear] = await db.select().from(schoolYears).where(eq(schoolYears.id, id));
    return schoolYear;
  }

  async updateSchoolYear(id: string, schoolYearData: Partial<InsertSchoolYear>): Promise<SchoolYear> {
    // Convert string dates to Date objects with proper timezone handling
    const updateData: any = { ...schoolYearData };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate + 'T00:00:00');
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate + 'T00:00:00');
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

  // ======================== NETWORK SCHOOL YEARS (SYSTEM ADMIN DEFAULTS) ========================

  async getNetworkSchoolYears(): Promise<SchoolYear[]> {
    return await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.networkDefault, true))
      .orderBy(desc(schoolYears.startDate));
  }

  async createNetworkSchoolYear(schoolYearData: any): Promise<SchoolYear> {
    // Convert date strings to Date objects with proper timezone handling
    const processedData = {
      ...schoolYearData,
      networkDefault: true,
      schoolId: null, // Network defaults have no specific school
      startDate: schoolYearData.startDate ? new Date(schoolYearData.startDate + 'T00:00:00') : undefined,
      endDate: schoolYearData.endDate ? new Date(schoolYearData.endDate + 'T00:00:00') : undefined,
    };
    
    const [schoolYear] = await db.insert(schoolYears).values(processedData).returning();
    
    // Create network default holidays for this school year based on system holiday rules
    if (schoolYear.startDate) {
      await this.createNetworkDefaultHolidays(schoolYear);
    }
    
    return schoolYear;
  }

  private async createNetworkDefaultHolidays(schoolYear: SchoolYear): Promise<void> {
    const holidayService = new HolidayService();
    const startDate = new Date(schoolYear.startDate!);
    const year = startDate.getFullYear();
    
    // Get holiday periods from Google Calendar API with proper durations
    const holidayPeriods = await holidayService.getHolidaysForYear(year);
    
    // Create network default holidays for this specific year
    const holidayPromises = Array.from(holidayPeriods.values()).map(async (holidayPeriod) => {
      return db.insert(calendarClosures).values({
        name: holidayPeriod.name,
        description: `${holidayPeriod.duration} day${holidayPeriod.duration > 1 ? 's' : ''} holiday`,
        date: holidayPeriod.startDate, // Backward compatibility
        startDate: holidayPeriod.startDate,
        endDate: holidayPeriod.endDate,
        duration: holidayPeriod.duration,
        networkDefault: true,
        schoolId: null, // Network defaults
        schoolYearId: schoolYear.id, // Link to the network school year
        active: true
      });
    });
    
    await Promise.all(holidayPromises);
  }

  // Helper methods for date calculations
  private getFirstMondayOfMonth(year: number, month: number): Date {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const daysToAdd = day === 0 ? 1 : (8 - day);
    return new Date(year, month, 1 + daysToAdd);
  }

  private getNthMondayOfMonth(year: number, month: number, n: number): Date {
    const firstMonday = this.getFirstMondayOfMonth(year, month);
    return new Date(firstMonday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
  }

  private getNthThursdayOfMonth(year: number, month: number, n: number): Date {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const daysToAdd = day === 0 ? 4 : (4 - day + 7) % 7;
    const firstThursday = new Date(year, month, 1 + daysToAdd);
    return new Date(firstThursday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
  }

  private getLastMondayOfMonth(year: number, month: number): Date {
    const lastDay = new Date(year, month + 1, 0);
    const day = lastDay.getDay();
    const daysToSubtract = day === 1 ? 0 : (day === 0 ? 6 : day - 1);
    return new Date(lastDay.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  }

  async updateNetworkSchoolYear(id: string, schoolYearData: Partial<InsertSchoolYear>): Promise<SchoolYear> {
    // Convert string dates to Date objects with proper timezone handling
    const updateData: any = { ...schoolYearData };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate + 'T00:00:00');
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate + 'T00:00:00');
    }
    
    const [schoolYear] = await db
      .update(schoolYears)
      .set(updateData)
      .where(and(
        eq(schoolYears.id, id),
        eq(schoolYears.networkDefault, true) // Only update network defaults
      ))
      .returning();
    return schoolYear;
  }

  async deleteNetworkSchoolYear(id: string): Promise<void> {
    // The foreign key constraint with cascade deletion on calendar_closures.school_year_id
    // will automatically delete all associated holidays when the school year is deleted
    await db.delete(schoolYears).where(and(
      eq(schoolYears.id, id),
      eq(schoolYears.networkDefault, true) // Only delete network defaults
    ));
  }

  // Calendar closures
  async getCalendarClosuresBySchoolYear(schoolYearId: string): Promise<CalendarClosure[]> {
    // First, check if this is a network default school year or school-specific year
    const schoolYear = await this.getSchoolYearById(schoolYearId);
    console.log(`DEBUG Storage: School year for ${schoolYearId}:`, { 
      id: schoolYear?.id, 
      name: schoolYear?.name, 
      networkDefault: schoolYear?.networkDefault, 
      schoolId: schoolYear?.schoolId 
    });
    
    if (!schoolYear) return [];

    let holidays;
    
    if (schoolYear.networkDefault && !schoolYear.schoolId) {
      console.log('DEBUG Storage: Fetching network default holidays');
      // For network default school years, get network default holidays
      holidays = await db
        .select()
        .from(calendarClosures)
        .where(
          and(
            eq(calendarClosures.schoolYearId, schoolYearId),
            eq(calendarClosures.networkDefault, true),
            isNull(calendarClosures.schoolId)
          )
        );
    } else {
      console.log('DEBUG Storage: Fetching school-specific holidays');
      // For school-specific school years, get school-specific holidays
      holidays = await db
        .select()
        .from(calendarClosures)
        .where(
          and(
            eq(calendarClosures.schoolYearId, schoolYearId),
            eq(calendarClosures.active, true)
          )
        );
    }
    
    console.log(`DEBUG Storage: Found ${holidays.length} holidays before sorting`);
    
    // Sort in academic year order starting with Labor Day (September)
    const academicYearOrder = [
      'Labor Day',
      'Rosh Hashanah',
      'Indigenous Peoples Day', 
      'Yom Kippur',
      'Veterans Day',
      'Thanksgiving',
      'Winter Break',
      'MLK Day',
      'Presidents Day',
      'Good Friday',
      'Eid',
      'Memorial Day',
      'Juneteenth'
    ];
    
    return holidays.sort((a, b) => {
      const indexA = academicYearOrder.indexOf(a.name);
      const indexB = academicYearOrder.indexOf(b.name);
      
      // If both are in the predefined order, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the predefined order, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Otherwise sort by date
      const dateA = new Date(a.startDate || a.date || '');
      const dateB = new Date(b.startDate || b.date || '');
      return dateA.getTime() - dateB.getTime();
    });
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

  // School year import methods
  async getActiveSchoolYear(schoolId: string): Promise<SchoolYear | undefined> {
    const [activeYear] = await db
      .select()
      .from(schoolYears)
      .where(and(
        eq(schoolYears.schoolId, schoolId),
        eq(schoolYears.isActive, true)
      ));
    return activeYear;
  }

  async getMostRecentSchoolYear(schoolId: string): Promise<SchoolYear | undefined> {
    const [recentYear] = await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.schoolId, schoolId))
      .orderBy(desc(schoolYears.startDate))
      .limit(1);
    return recentYear;
  }

  async importSystemHolidaysForSchoolYear(schoolYearId: string): Promise<void> {
    const schoolYear = await this.getSchoolYearById(schoolYearId);
    if (!schoolYear) return;

    // Find the matching network school year to get its holidays
    const networkSchoolYear = await db
      .select()
      .from(schoolYears)
      .where(and(
        eq(schoolYears.name, schoolYear.name),
        eq(schoolYears.networkDefault, true)
      ))
      .limit(1);

    if (networkSchoolYear.length === 0) {
      console.log(`No network school year found for ${schoolYear.name}`);
      return;
    }

    // Get network default holidays that match BOTH network_default=true AND the specific school year ID
    // Also ensure dates are not null to avoid invalid date errors
    const networkHolidays = await db
      .select()
      .from(calendarClosures)
      .where(and(
        eq(calendarClosures.networkDefault, true),
        eq(calendarClosures.schoolYearId, networkSchoolYear[0].id),
        isNull(calendarClosures.schoolId),
        isNotNull(calendarClosures.startDate),
        isNotNull(calendarClosures.endDate)
      ));
      


    // Create school-specific holidays for this school year, filtering out those outside school year dates
    const schoolHolidays = networkHolidays
      .filter(holiday => {
        // Check if holiday falls within school year dates
        const holidayDate = holiday.startDate;
        if (!holidayDate) return false;
        
        const holidayDateObj = new Date(holidayDate);
        const schoolStartDate = new Date(schoolYear.startDate);
        const schoolEndDate = new Date(schoolYear.endDate);
        
        return holidayDateObj >= schoolStartDate && holidayDateObj <= schoolEndDate;
      })
      .map(holiday => {
        // Safely handle date conversion with validation
        const safeDate = (dateValue: any) => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return null;
          return date;
        };

        return {
          schoolId: schoolYear.schoolId,
          schoolYearId: schoolYearId,
          name: holiday.name,
          description: holiday.description,
          // Handle date conversion properly with validation
          startDate: safeDate(holiday.startDate),
          endDate: safeDate(holiday.endDate),
          duration: holiday.duration || 1,
          networkDefault: false,
          active: true
        };
      })
      .filter(holiday => {
        // Filter out holidays with invalid dates to prevent database errors
        const hasValidDate = holiday.startDate;
        if (!hasValidDate) {
          console.log(`Filtering out holiday ${holiday.name} - no valid startDate`);
        }
        return hasValidDate;
      });

    if (schoolHolidays.length > 0) {
      await db.insert(calendarClosures).values(schoolHolidays);
    }
  }

  async copyHolidaysFromSchoolYear(fromSchoolYearId: string, toSchoolYearId: string): Promise<void> {
    const toSchoolYear = await this.getSchoolYearById(toSchoolYearId);
    if (!toSchoolYear) return;

    // Get holidays from the source school year
    const sourceHolidays = await db
      .select()
      .from(calendarClosures)
      .where(and(
        eq(calendarClosures.schoolYearId, fromSchoolYearId),
        eq(calendarClosures.active, true)
      ));

    // Find the matching network school year to get updated holiday dates
    const networkSchoolYear = await db
      .select()
      .from(schoolYears)
      .where(and(
        eq(schoolYears.name, toSchoolYear.name),
        eq(schoolYears.networkDefault, true)
      ))
      .limit(1);

    if (networkSchoolYear.length === 0) {
      console.log(`No network school year found for ${toSchoolYear.name}`);
      return;
    }

    // Get network default holidays that match BOTH network_default=true AND the specific school year ID
    const networkHolidays = await db
      .select()
      .from(calendarClosures)
      .where(and(
        eq(calendarClosures.networkDefault, true),
        eq(calendarClosures.schoolYearId, networkSchoolYear[0].id),
        isNull(calendarClosures.schoolId)
      ));

    // Create a map of network holidays by name for quick lookup
    const networkHolidayMap = new Map(
      networkHolidays.map(holiday => [holiday.name, holiday])
    );

    // Create holidays for the new school year with updated dates from network defaults
    const newHolidays = sourceHolidays
      .map(holiday => {
        // Try to find matching network holiday to get updated dates for the new year
        const networkHoliday = networkHolidayMap.get(holiday.name);
        
        // Safely handle date conversion with validation
        const safeDate = (dateValue: any) => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            console.log(`Invalid date value: ${dateValue} for holiday ${holiday.name} in copyHolidays`);
            return null;
          }
          return date;
        };

        return {
          schoolId: toSchoolYear.schoolId,
          schoolYearId: toSchoolYearId,
          name: holiday.name,
          description: holiday.description,
          // Use network holiday dates for the new year if available, otherwise use original dates
          startDate: networkHoliday?.startDate ? safeDate(networkHoliday.startDate) : 
                     safeDate(holiday.startDate),
          endDate: networkHoliday?.endDate ? safeDate(networkHoliday.endDate) : 
                   safeDate(holiday.endDate),
          duration: networkHoliday?.duration || holiday.duration || 1,
          networkDefault: false,
          active: true
        };
      })
      .filter(holiday => {
        // Check if holiday falls within school year dates and has valid date
        const holidayDate = holiday.startDate;
        if (!holidayDate) {
          console.log(`Filtering out holiday ${holiday.name} in copyHolidays - no valid startDate`);
          return false;
        }
        
        const holidayDateObj = new Date(holidayDate);
        const schoolStartDate = new Date(toSchoolYear.startDate);
        const schoolEndDate = new Date(toSchoolYear.endDate);
        
        return holidayDateObj >= schoolStartDate && holidayDateObj <= schoolEndDate;
      });

    if (newHolidays.length > 0) {
      await db.insert(calendarClosures).values(newHolidays);
    }
  }

  // Families
  async getFamiliesBySchool(schoolId: string): Promise<Family[]> {
    return await db
      .selectDistinct({
        id: families.id,
        name: families.name,
        lastName: families.lastName,
        address: families.address,
        phone: families.phone,
        email: families.email,
        notes: families.notes,
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

  async getChildById(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async createChild(childData: any): Promise<Child> {
    const [child] = await db.insert(children).values(childData).returning();
    return child;
  }

  async updateChild(id: string, childData: any): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({
        ...childData,
        updatedAt: new Date(),
      })
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  // Demographic reference data
  async getGenders(): Promise<Gender[]> {
    return await db
      .select()
      .from(genders)
      .where(eq(genders.active, true))
      .orderBy(genders.sortOrder, genders.name);
  }

  async getRaceEthnicities(): Promise<RaceEthnicity[]> {
    return await db
      .select()
      .from(raceEthnicities)
      .where(eq(raceEthnicities.active, true))
      .orderBy(raceEthnicities.sortOrder, raceEthnicities.name);
  }

  async getLanguages(): Promise<Language[]> {
    return await db
      .select()
      .from(languages)
      .where(eq(languages.active, true))
      .orderBy(languages.sortOrder, languages.nameEnglish);
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
        },
        classroom: {
          id: classrooms.id,
          name: classrooms.name,
          level: classrooms.level,
        },
        school: {
          id: schools.id,
          name: schools.name,
        },
      })
      .from(enrollments)
      .innerJoin(children, eq(children.id, enrollments.childId))
      .innerJoin(families, eq(families.id, children.familyId))
      .leftJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
      .leftJoin(schools, eq(schools.id, enrollments.schoolId))
      .where(eq(enrollments.schoolId, schoolId))
      .orderBy(desc(enrollments.createdAt));
  }

  async getAllEnrollments(): Promise<any[]> {
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
        school: {
          id: schools.id,
          name: schools.name,
        },
      })
      .from(enrollments)
      .innerJoin(children, eq(children.id, enrollments.childId))
      .innerJoin(families, eq(families.id, children.familyId))
      .leftJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
      .leftJoin(schools, eq(schools.id, enrollments.schoolId))
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

  // Family Adults (Users with parent roles)
  async getFamilyAdults(familyId: string): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          homeAddress: users.homeAddress,
          profileImageUrl: users.profileImageUrl,
          relationship: guardians.relationship,
          guardianId: guardians.id
        })
        .from(guardians)
        .innerJoin(users, eq(guardians.userId, users.id))
        .where(eq(guardians.familyId, familyId))
        .orderBy(users.firstName, users.lastName);
      
      return result;
    } catch (error) {
      console.error("Error fetching family adults:", error);
      return [];
    }
  }

  async getUsersWithParentRole(): Promise<User[]> {
    return await db
      .selectDistinct({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        homeAddress: users.homeAddress,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .where(
        and(
          sql`${roleDefinitions.name} LIKE 'parent%'`,
          eq(userRoles.active, true)
        )
      )
      .orderBy(users.firstName, users.lastName);
  }

  // Tasks
  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getAllTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksBySchool(schoolId: string): Promise<Task[]> {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
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
    // Get channels user is member of
    const memberChannels = await db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        type: channels.type,
        scope: channels.scope,
        schoolId: channels.schoolId,
        classroomId: channels.classroomId,
        legalEntityId: channels.legalEntityId,
        taskId: channels.taskId,
        isArchived: channels.isArchived,
        canDelete: channels.canDelete,
        canArchive: channels.canArchive,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channels)
      .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
      .where(eq(channelMembers.userId, userId))
      .orderBy(desc(channels.updatedAt));

    return memberChannels.map(channel => ({
      ...channel,
      familyId: null // Add missing field for type compatibility
    }));
  }

  async getAllChannels(): Promise<Channel[]> {
    const results = await db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        type: channels.type,
        scope: channels.scope,
        schoolId: channels.schoolId,
        classroomId: channels.classroomId,
        legalEntityId: channels.legalEntityId,
        taskId: channels.taskId,
        isArchived: channels.isArchived,
        canDelete: channels.canDelete,
        canArchive: channels.canArchive,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channels)
      .orderBy(desc(channels.updatedAt));

    return results.map(channel => ({
      ...channel,
      familyId: null // Add missing field for type compatibility
    }));
  }

  async getMessagesByChannel(channelId: string, limit = 50): Promise<any[]> {
    return await db
      .select({
        id: messages.id,
        channelId: messages.channelId,
        senderId: messages.senderId,
        content: messages.content,
        attachments: messages.attachments,
        sentAt: messages.sentAt,
        readBy: messages.readBy,
        threadId: messages.threadId,
        isPinned: messages.isPinned,
        isUrgent: messages.isUrgent,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, SPLIT_PART(${users.email}, '@', 1))`,
        senderEmail: users.email,
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.senderId))
      .where(eq(messages.channelId, channelId))
      .orderBy(messages.sentAt)
      .limit(limit);
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const [newChannel] = await db.insert(channels).values(channel).returning();
    return newChannel;
  }

  async archiveChannel(channelId: string): Promise<Channel> {
    const [updatedChannel] = await db
      .update(channels)
      .set({ isArchived: true })
      .where(eq(channels.id, channelId))
      .returning();
    return updatedChannel;
  }

  async deleteChannel(channelId: string): Promise<void> {
    await db.delete(channels).where(eq(channels.id, channelId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Default subscription logic based on role
  async assignDefaultChannelSubscriptions(userId: string): Promise<void> {
    const userRoles = await this.getUserRoles(userId);
    const roleNames = userRoles.map(r => r.name);
    
    // Check role categories
    const isEducator = roleNames.some(name => name.startsWith('educator'));
    const isEducatorAdmin = roleNames.some(name => name.includes('educator_admin'));
    const isBoardMember = roleNames.some(name => name.startsWith('board'));
    const isPartner = roleNames.some(name => name.startsWith('partner'));
    const isSysAdmin = roleNames.some(name => name.startsWith('sysadmin'));
    
    // Everyone gets subscribed to 'general'
    await this.subscribeToChannelByName(userId, 'general');
    
    // Educator admins get subscribed to teacherleaders
    if (isEducatorAdmin) {
      await this.subscribeToChannelByName(userId, 'teacherleaders');
    }
    
    // Board members get subscribed to boardmembers
    if (isBoardMember) {
      await this.subscribeToChannelByName(userId, 'boardmembers');
    }
    
    // Partners and system admins get foundation channels
    if (isPartner || isSysAdmin) {
      const foundationChannels = [
        'foundation-ops', 'foundation-mktgcomms', 'foundation-tech', 
        'foundation-radicle', 'foundation-chartergrowth', 'foundation', 
        'foundation-partners', 'foundation-random'
      ];
      for (const channelName of foundationChannels) {
        await this.subscribeToChannelByName(userId, channelName);
      }
    }
    
    // TODO: Subscribe educators to age-level channels they teach
    // TODO: Subscribe families to their school and classroom channels
  }

  async subscribeToChannelByName(userId: string, channelName: string): Promise<void> {
    const channel = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.name, channelName))
      .limit(1);
      
    if (channel.length > 0) {
      await this.subscribeUserToChannel(userId, channel[0].id);
    }
  }

  async subscribeUserToChannel(userId: string, channelId: string): Promise<void> {
    const existingMembership = await db
      .select()
      .from(channelMembers)
      .where(
        and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId)
        )
      );

    if (existingMembership.length === 0) {
      await db.insert(channelMembers).values({
        channelId: channelId,
        userId: userId,
        joinedAt: new Date(),
        lastReadAt: new Date(),
      });
    }
  }

  // Channel membership management
  async assignUserToNetworkChannels(userId: string): Promise<void> {
    // Get all network channels
    const networkChannels = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.scope, "network"));

    // Assign user to each network channel if not already assigned
    for (const channel of networkChannels) {
      const existingMembership = await db
        .select()
        .from(channelMembers)
        .where(
          and(
            eq(channelMembers.channelId, channel.id),
            eq(channelMembers.userId, userId)
          )
        );

      if (existingMembership.length === 0) {
        await db.insert(channelMembers).values({
          channelId: channel.id,
          userId: userId,
          joinedAt: new Date(),
          lastReadAt: new Date(),
        });
      }
    }
  }

  async assignUserToSchoolChannels(userId: string, schoolId: string): Promise<void> {
    // Get all school channels for the specific school
    const schoolChannels = await db
      .select({ id: channels.id })
      .from(channels)
      .where(
        and(
          eq(channels.scope, "school"),
          eq(channels.schoolId, schoolId)
        )
      );

    // Assign user to each school channel if not already assigned
    for (const channel of schoolChannels) {
      const existingMembership = await db
        .select()
        .from(channelMembers)
        .where(
          and(
            eq(channelMembers.channelId, channel.id),
            eq(channelMembers.userId, userId)
          )
        );

      if (existingMembership.length === 0) {
        await db.insert(channelMembers).values({
          channelId: channel.id,
          userId: userId,
          joinedAt: new Date(),
          lastReadAt: new Date(),
        });
      }
    }
  }

  // Channel initialization and management
  async initializeNetworkChannels(): Promise<void> {
    const { networkDefaultChannels, networkTeacherChannels } = await import('./channelDefaults');
    
    for (const channelData of [...networkDefaultChannels, ...networkTeacherChannels]) {
      const existingChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.name, channelData.name),
            eq(channels.scope, "network")
          )
        );
      
      if (existingChannel.length === 0) {
        await db.insert(channels).values(channelData);
      }
    }
  }

  async initializeSchoolChannels(schoolId: string): Promise<void> {
    const { schoolChannelTemplates } = await import('./channelDefaults');
    
    // Get school info to create proper channel names
    const schoolInfo = await db
      .select({ shortName: schools.shortName, name: schools.name })
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);
    
    if (schoolInfo.length === 0) return;
    
    const school = schoolInfo[0];
    const schoolPrefix = school.shortName || school.name.toLowerCase().replace(/\s+/g, '');
    
    for (const template of schoolChannelTemplates) {
      const channelName = template.namePattern.replace('{schoolPrefix}', schoolPrefix);
      
      const existingChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.name, channelName),
            eq(channels.schoolId, schoolId),
            eq(channels.scope, "school")
          )
        );
      
      if (existingChannel.length === 0) {
        await db.insert(channels).values({
          name: channelName,
          description: template.description.replace('{schoolName}', school.name),
          type: template.type,
          scope: "school",
          schoolId: schoolId,
          classroomId: null,
          familyId: null,
          legalEntityId: null,
          taskId: null,
          isArchived: false,
          canDelete: template.canDelete,
          canArchive: template.canArchive,
        });
      }
    }
  }

  async initializeClassroomChannels(classroomId: string): Promise<void> {
    const { classroomChannelTemplates } = await import('./channelDefaults');
    
    // Get classroom and school info
    const classroomInfo = await db
      .select({ 
        level: classrooms.level,
        schoolId: classrooms.schoolId,
        msgDisplayName: schools.msgDisplayName,
        schoolName: schools.name 
      })
      .from(classrooms)
      .leftJoin(schools, eq(schools.id, classrooms.schoolId))
      .where(eq(classrooms.id, classroomId))
      .limit(1);
    
    if (classroomInfo.length === 0) return;
    
    const classroom = classroomInfo[0];
    const displayName = classroom.msgDisplayName || classroom.schoolName?.toLowerCase().replace(/\s+/g, '') || 'school';
    
    // Create 1 channel per classroom using msgDisplayName-ageLevel pattern
    for (const template of classroomChannelTemplates) {
      const channelName = template.namePattern
        .replace('{msgDisplayName}', displayName)
        .replace('{level}', classroom.level);
      
      const existingChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.name, channelName),
            eq(channels.classroomId, classroomId),
            eq(channels.scope, "classroom")
          )
        );
      
      if (existingChannel.length === 0) {
        await db.insert(channels).values({
          name: channelName,
          description: template.description
            .replace('{schoolName}', classroom.schoolName || 'School')
            .replace('{level}', classroom.level),
          type: template.type,
          scope: "classroom",
          schoolId: classroom.schoolId,
          classroomId: classroomId,
          familyId: null,
          legalEntityId: null,
          taskId: null,
          isArchived: false,
          canDelete: template.canDelete,
          canArchive: template.canArchive,
        });
      }
    }
  }

  async createFamilyChannel(familyId: string): Promise<void> {
    // Get family info with children names
    const familyInfo = await db
      .select({
        familyName: families.name,
        familyLastName: families.lastName,
        schoolId: enrollments.schoolId,
        schoolShortName: schools.shortName,
        schoolName: schools.name
      })
      .from(families)
      .leftJoin(children, eq(children.familyId, families.id))
      .leftJoin(enrollments, eq(enrollments.childId, children.id))
      .leftJoin(schools, eq(schools.id, enrollments.schoolId))
      .where(eq(families.id, familyId))
      .limit(1);
    
    if (familyInfo.length === 0) return;
    
    const family = familyInfo[0];
    const schoolPrefix = family.schoolShortName || family.schoolName?.toLowerCase().replace(/\s+/g, '') || 'unknown';
    
    // Get children's first names
    const children = await db
      .select({ firstName: children.firstName })
      .from(children)
      .where(eq(children.familyId, familyId))
      .orderBy(children.firstName);
    
    const childrenNames = children.map(c => c.firstName?.toLowerCase()).filter(Boolean).join('');
    const familyLastNamePart = family.familyLastName?.toLowerCase() || 'family';
    const channelName = `${schoolPrefix}-families-${familyLastNamePart}${childrenNames}`;
    
    const existingChannel = await db
      .select()
      .from(channels)
      .where(
        and(
          eq(channels.familyId, familyId),
          eq(channels.scope, "family")
        )
      );
    
    if (existingChannel.length === 0) {
      await db.insert(channels).values({
        name: channelName,
        description: `Private family channel for ${family.familyLastName || family.familyName || 'Family'}`,
        type: "private",
        scope: "family",
        schoolId: family.schoolId,
        classroomId: null,
        familyId: familyId,
        legalEntityId: null,
        taskId: null,
        isArchived: false,
        canDelete: false,
        canArchive: true,
      });
    }
  }

  async initializeSchoolChannels(schoolId: string): Promise<void> {
    const { schoolChannelTemplates } = await import('./channelDefaults');
    
    const [school] = await db.select().from(schools).where(eq(schools.id, schoolId));
    if (!school) return;
    
    const schoolPrefix = school.msgDisplayName || school.shortName || school.name.toLowerCase().replace(/\s+/g, '');
    
    for (const template of schoolChannelTemplates) {
      const channelName = template.suffix ? `${schoolPrefix}${template.suffix}` : schoolPrefix;
      
      const existingChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.name, channelName),
            eq(channels.schoolId, schoolId)
          )
        );
      
      if (existingChannel.length === 0) {
        await db.insert(channels).values({
          name: channelName,
          description: template.description,
          type: template.type,
          scope: template.scope,
          schoolId: schoolId,
          legalEntityId: null,
          taskId: null,
          isArchived: false,
          canDelete: true,
          canArchive: true,
        });
      }
    }
  }

  async initializeClassroomChannels(schoolId: string, classroomId: string, level: string): Promise<void> {
    const { classroomChannelTemplates } = await import('./channelDefaults');
    
    const [school] = await db.select().from(schools).where(eq(schools.id, schoolId));
    if (!school) return;
    
    const schoolPrefix = school.msgDisplayName || school.shortName || school.name.toLowerCase().replace(/\s+/g, '');
    
    // Find matching template based on classroom level
    const template = classroomChannelTemplates.find(t => 
      t.levelSuffix.includes(level) || level.includes(t.levelSuffix.replace('-', ''))
    );
    
    if (template) {
      const channelName = `${schoolPrefix}${template.levelSuffix}`;
      
      const existingChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.name, channelName),
            eq(channels.classroomId, classroomId)
          )
        );
      
      if (existingChannel.length === 0) {
        await db.insert(channels).values({
          name: channelName,
          description: template.description,
          type: "public",
          scope: "classroom",
          schoolId: schoolId,
          classroomId: classroomId,
          legalEntityId: null,
          taskId: null,
          isArchived: false,
          canDelete: true,
          canArchive: true,
        });
      }
    }
  }

  // Family Channel Management
  async createFamilyChannel(familyId: string, schoolId: string): Promise<Channel> {
    // Get family details to create channel name
    const [family] = await db.select().from(families).where(eq(families.id, familyId));
    if (!family) {
      throw new Error("Family not found");
    }

    // Get school display name for channel prefix
    const [school] = await db.select().from(schools).where(eq(schools.id, schoolId));
    if (!school) {
      throw new Error("School not found");
    }

    // Create channel name: {school_msgDisplayName}-families-{lastname}{firstnames}
    const schoolPrefix = school.msgDisplayName || school.shortName || school.name.toLowerCase().replace(/\s+/g, '');
    
    // Get parent names for channel suffix
    const parents = await this.getParentsByFamily(familyId);
    const parentNames = parents.map(p => {
      const firstName = p.firstName?.toLowerCase().replace(/[^a-z]/g, '') || '';
      return firstName;
    }).join('');
    
    const familyLastName = family.lastName?.toLowerCase().replace(/[^a-z]/g, '') || 'family';
    const channelName = `${schoolPrefix}-families-${familyLastName}${parentNames}`;

    // Create the channel
    const channelData = {
      name: channelName,
      description: `Private family communication channel for ${family.lastName} family`,
      type: "private" as const,
      scope: "family" as const,
      schoolId: schoolId,
      familyId: familyId,
      isArchived: false,
      canDelete: true,
      canArchive: true,
    };

    const [newChannel] = await db.insert(channels).values(channelData).returning();

    // Add family members and school educators to the channel
    await this.addFamilyChannelMembers(newChannel.id, familyId, schoolId);

    return newChannel;
  }

  async addFamilyChannelMembers(channelId: string, familyId: string, schoolId: string): Promise<void> {
    // Get all parents/guardians for this family
    const parents = await this.getParentsByFamily(familyId);
    
    // Get all educators at this school
    const educators = await this.getEducatorsBySchool(schoolId);

    // Add all members to the channel
    const memberData = [
      ...parents.map(parent => ({
        channelId,
        userId: parent.id,
        joinedAt: new Date(),
      })),
      ...educators.map(educator => ({
        channelId,
        userId: educator.id,
        joinedAt: new Date(),
      })),
    ];

    if (memberData.length > 0) {
      await db.insert(channelMembers).values(memberData);
    }
  }

  async getParentsByFamily(familyId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .where(
        and(
          like(roleDefinitions.name, 'parent%'),
          eq(userRoles.active, true),
          eq(userRoles.familyId, familyId)
        )
      );
    return result;
  }

  async getEducatorsBySchool(schoolId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roleDefinitions, eq(roleDefinitions.id, userRoles.roleId))
      .where(
        and(
          like(roleDefinitions.name, 'educator%'),
          eq(userRoles.schoolId, schoolId),
          eq(userRoles.active, true)
        )
      );
    return result;
  }

  async archiveFamilyChannel(familyId: string): Promise<void> {
    await db
      .update(channels)
      .set({ isArchived: true })
      .where(
        and(
          eq(channels.familyId, familyId),
          eq(channels.scope, "family")
        )
      );
  }

  async updateFamilyChannelAccess(familyId: string, schoolId: string): Promise<void> {
    // Get the family channel
    const [familyChannel] = await db
      .select()
      .from(channels)
      .where(
        and(
          eq(channels.familyId, familyId),
          eq(channels.scope, "family"),
          eq(channels.isArchived, false)
        )
      );

    if (!familyChannel) {
      return; // No active family channel found
    }

    // Remove all existing members
    await db.delete(channelMembers).where(eq(channelMembers.channelId, familyChannel.id));

    // Re-add current family members and school educators
    await this.addFamilyChannelMembers(familyChannel.id, familyId, schoolId);
  }

  async checkFamilyEnrollmentStatus(familyId: string): Promise<boolean> {
    const activeEnrollments = await db
      .select()
      .from(enrollments)
      .innerJoin(children, eq(children.id, enrollments.childId))
      .where(
        and(
          eq(children.familyId, familyId),
          eq(enrollments.status, "enrolled")
        )
      );
    
    return activeEnrollments.length > 0;
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

  async createTuitionPlan(data: any): Promise<TuitionPlan> {
    // Calculate pricing metrics based on schedule and school year
    const calculatedData = await this.calculateTuitionMetrics(data);
    const [plan] = await db.insert(tuitionPlans).values(calculatedData).returning();
    return plan;
  }

  private async calculateTuitionMetrics(tuitionData: any): Promise<any> {
    const { classroomScheduleId, schoolYearId, fullPrice, billingFrequency } = tuitionData;
    
    // Get schedule details
    const [schedule] = await db
      .select()
      .from(classroomSchedules)
      .where(eq(classroomSchedules.id, classroomScheduleId));
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Calculate hours per week from schedule
    const daysPerWeek = [
      schedule.mondayOpen,
      schedule.tuesdayOpen,
      schedule.wednesdayOpen,
      schedule.thursdayOpen,
      schedule.fridayOpen,
      schedule.saturdayOpen,
      schedule.sundayOpen
    ].filter(Boolean).length;

    const startTime = schedule.startTime || '08:00:00';
    const endTime = schedule.endTime || '15:00:00';
    
    // Calculate hours per day
    const startHour = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
    const endHour = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
    const hoursPerDay = endHour - startHour;
    const hoursPerWeek = hoursPerDay * daysPerWeek;

    // Calculate weeks per year from school year if provided
    let weeksPerYear = 52; // default for continuous programs
    let totalHoursPerYear = hoursPerWeek * weeksPerYear;

    if (schoolYearId) {
      const [schoolYear] = await db
        .select()
        .from(schoolYears)
        .where(eq(schoolYears.id, schoolYearId));
      
      if (schoolYear && schoolYear.startDate && schoolYear.endDate) {
        // Get holidays for this school year
        const holidays = await db
          .select()
          .from(calendarClosures)
          .where(eq(calendarClosures.schoolYearId, schoolYearId));
        
        // Calculate total days in school year
        const startDate = new Date(schoolYear.startDate);
        const endDate = new Date(schoolYear.endDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate holiday days
        const holidayDays = holidays.reduce((total, holiday) => {
          return total + (holiday.duration || 1);
        }, 0);
        
        // Calculate school days (weekdays only, minus holidays)
        const schoolDays = Math.floor(totalDays * (5/7)) - holidayDays; // rough estimate of weekdays
        weeksPerYear = Math.floor(schoolDays / 5); // convert to weeks
        totalHoursPerYear = hoursPerWeek * weeksPerYear;
      }
    }

    // Calculate price per hour based on billing frequency
    let pricePerHour = 0;
    const fullPriceNum = parseFloat(fullPrice.toString());
    
    switch (billingFrequency) {
      case 'weekly':
        pricePerHour = fullPriceNum / hoursPerWeek;
        break;
      case 'monthly':
        pricePerHour = (fullPriceNum * 12) / totalHoursPerYear;
        break;
      case 'annually':
        pricePerHour = fullPriceNum / totalHoursPerYear;
        break;
    }

    return {
      ...tuitionData,
      hoursPerWeek: hoursPerWeek.toFixed(2),
      weeksPerYear,
      totalHoursPerYear: totalHoursPerYear.toFixed(2),
      pricePerHour: pricePerHour.toFixed(4)
    };
  }

  async getTuitionPlansWithCalculations(schoolId: string): Promise<any[]> {
    // Since tuition plans might not exist yet, just return empty for now
    // This will be populated when plans are created
    return [];
  }

  async getClassroomsWithSchedulesForTuition(schoolId: string): Promise<any[]> {
    // Get all classrooms for the school
    const schoolClassrooms = await db
      .select()
      .from(classrooms)
      .where(and(
        eq(classrooms.schoolId, schoolId),
        eq(classrooms.isActive, true)
      ))
      .orderBy(asc(classrooms.name));

    // Get all schedules for the school - they exist independently until linked via tuition
    const allSchedules = await db
      .select()
      .from(classroomSchedules)
      .where(and(
        eq(classroomSchedules.schoolId, schoolId),
        eq(classroomSchedules.isActive, true),
        eq(classroomSchedules.networkDefault, false)
      ))
      .orderBy(asc(classroomSchedules.name));

    // For tuition planning, show all possible classroom-schedule combinations
    // This allows flexible linking at tuition creation time
    const classroomsWithSchedules = schoolClassrooms.map((classroom) => {
      return {
        ...classroom,
        schedules: allSchedules // All schedules are available for any classroom in tuition context
      };
    });

    return classroomsWithSchedules;
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

  // ======================== CLASSROOM SCHEDULES ========================
  
  async getClassroomSchedulesBySchool(schoolId: string): Promise<ClassroomSchedule[]> {
    return await db
      .select()
      .from(classroomSchedules)
      .where(and(
        eq(classroomSchedules.schoolId, schoolId),
        eq(classroomSchedules.networkDefault, false)
      ))
      .orderBy(asc(classroomSchedules.name));
  }

  async getNetworkDefaultSchedules(): Promise<ClassroomSchedule[]> {
    return await db
      .select()
      .from(classroomSchedules)
      .where(eq(classroomSchedules.networkDefault, true))
      .orderBy(asc(classroomSchedules.level), asc(classroomSchedules.name));
  }

  async getNetworkDefaultSchedulesByLevel(level: string): Promise<ClassroomSchedule[]> {
    return await db
      .select()
      .from(classroomSchedules)
      .where(and(
        eq(classroomSchedules.networkDefault, true),
        eq(classroomSchedules.level, level)
      ))
      .orderBy(asc(classroomSchedules.name));
  }

  async createClassroomSchedule(data: any): Promise<ClassroomSchedule> {
    const insertData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    };

    const [schedule] = await db
      .insert(classroomSchedules)
      .values(insertData)
      .returning();
    return schedule;
  }

  async createNetworkDefaultSchedule(data: any): Promise<ClassroomSchedule> {
    const insertData = {
      ...data,
      networkDefault: true,
      schoolId: null,
      classroomId: null,
      startDate: null,
      endDate: null,
    };

    const [schedule] = await db
      .insert(classroomSchedules)
      .values(insertData)
      .returning();
    return schedule;
  }

  async updateClassroomSchedule(id: string, data: any): Promise<ClassroomSchedule> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };

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

  async importNetworkSchedulesToSchool(schoolId: string): Promise<{ schedules: ClassroomSchedule[], classroomAssignments: any[] }> {
    // Get all classrooms for this school
    const schoolClassrooms = await db
      .select()
      .from(classrooms)
      .where(and(
        eq(classrooms.schoolId, schoolId),
        eq(classrooms.isActive, true)
      ));

    const importedSchedules: ClassroomSchedule[] = [];
    const classroomAssignments: any[] = [];

    // For each classroom, import matching network default schedules
    for (const classroom of schoolClassrooms) {
      const networkSchedules = await this.getNetworkDefaultSchedulesByLevel(classroom.level);
      
      for (const networkSchedule of networkSchedules) {
        // Create school-specific version of the network schedule
        const schoolSchedule = await this.createClassroomSchedule({
          classroomId: classroom.id,
          schoolId: schoolId,
          name: networkSchedule.name,
          level: networkSchedule.level,
          networkDefault: false,
          mondayOpen: networkSchedule.mondayOpen,
          tuesdayOpen: networkSchedule.tuesdayOpen,
          wednesdayOpen: networkSchedule.wednesdayOpen,
          thursdayOpen: networkSchedule.thursdayOpen,
          fridayOpen: networkSchedule.fridayOpen,
          saturdayOpen: networkSchedule.saturdayOpen,
          sundayOpen: networkSchedule.sundayOpen,
          startTime: networkSchedule.startTime,
          endTime: networkSchedule.endTime,
          isActive: true
        });

        importedSchedules.push(schoolSchedule);
        classroomAssignments.push({
          classroomId: classroom.id,
          classroomName: classroom.name,
          scheduleId: schoolSchedule.id,
          scheduleName: schoolSchedule.name
        });
      }
    }

    return { schedules: importedSchedules, classroomAssignments };
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


  // System holidays methods (using calendar_closures with network_default=true)
  async getSystemHolidays(): Promise<CalendarClosure[]> {
    const holidays = await db.select().from(calendarClosures).where(
      and(
        eq(calendarClosures.networkDefault, true),
        eq(calendarClosures.active, true),
        isNull(calendarClosures.schoolYearId), // System holidays don't belong to specific school years
        isNull(calendarClosures.schoolId) // System holidays don't belong to specific schools
      )
    );
    
    // Sort in logical school year order (September to August)
    const schoolYearOrder = [
      'Labor Day',
      'Rosh Hashanah',
      'Indigenous Peoples Day', 
      'Yom Kippur',
      'Veterans Day',
      'Thanksgiving',
      'Winter Break',
      'MLK Day',
      'Presidents Day',
      'Good Friday',
      'Eid',
      'Memorial Day',
      'Juneteenth'
    ];
    
    return holidays.sort((a, b) => {
      const indexA = schoolYearOrder.indexOf(a.name);
      const indexB = schoolYearOrder.indexOf(b.name);
      
      // If both are in the predefined order, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the predefined order, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Otherwise sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  async createSystemHoliday(holiday: InsertCalendarClosure): Promise<CalendarClosure> {
    const [newHoliday] = await db
      .insert(calendarClosures)
      .values({
        ...holiday,
        networkDefault: true,
        schoolYearId: null, // System holidays don't belong to specific school years
        schoolId: null, // System holidays don't belong to specific schools
      })
      .returning();
    return newHoliday;
  }

  async updateSystemHoliday(id: string, updates: Partial<InsertCalendarClosure>): Promise<CalendarClosure> {
    const [updatedHoliday] = await db
      .update(calendarClosures)
      .set(updates)
      .where(eq(calendarClosures.id, id))
      .returning();
    return updatedHoliday;
  }

  async deleteSystemHoliday(id: string): Promise<void> {
    await db
      .update(calendarClosures)
      .set({ active: false })
      .where(eq(calendarClosures.id, id));
  }

  async getNetworkHolidaysBySchoolYear(schoolYearName: string): Promise<CalendarClosure[]> {
    // Get network default holidays for a specific school year
    const holidays = await db
      .select()
      .from(calendarClosures)
      .where(
        and(
          eq(calendarClosures.networkDefault, true),
          eq(calendarClosures.active, true),
          isNotNull(calendarClosures.date) // Only holidays with actual dates
        )
      )
      .orderBy(asc(calendarClosures.date));
    
    // Filter by school year based on dates
    if (schoolYearName) {
      const yearMatch = schoolYearName.match(/(\d{4})/);
      if (yearMatch) {
        const startYear = parseInt(yearMatch[1]);
        const schoolYearStart = new Date(startYear, 6, 1); // July 1
        const schoolYearEnd = new Date(startYear + 1, 5, 30); // June 30 next year
        
        return holidays.filter(holiday => {
          if (!holiday.date) return false;
          const holidayDate = new Date(holiday.date);
          return holidayDate >= schoolYearStart && holidayDate <= schoolYearEnd;
        });
      }
    }
    
    return holidays;
  }

  // Attendance operations
  async saveAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    // First, mark any existing records for this student/date as not current
    await db
      .update(attendance)
      .set({ isCurrent: false })
      .where(and(
        eq(attendance.studentId, attendanceData.studentId),
        eq(sql`date(${attendance.date})`, sql`date(${attendanceData.date})`)
      ));

    // Insert new record as current
    const [savedAttendance] = await db
      .insert(attendance)
      .values({
        ...attendanceData,
        isCurrent: true,
        updatedAt: new Date(),
      })
      .returning();
    
    return savedAttendance;
  }

  async getCurrentAttendanceByClassroomAndDate(classroomId: string, date: string): Promise<Attendance[]> {
    const targetDate = new Date(date);
    
    return await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.classroomId, classroomId),
        eq(sql`date(${attendance.date})`, sql`date(${targetDate})`),
        eq(attendance.isCurrent, true)
      ));
  }

  async getAttendanceByClassroomAndDate(classroomId: string, date: string): Promise<Attendance[]> {
    const targetDate = new Date(date);
    
    return await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.classroomId, classroomId),
        eq(sql`date(${attendance.date})`, sql`date(${targetDate})`)
      ))
      .orderBy(desc(attendance.enteredAt));
  }

  async getAttendanceHistoryByClassroom(classroomId: string): Promise<{ date: string; recordCount: number }[]> {
    const results = await db
      .select({
        date: sql<string>`date(${attendance.date})`,
        recordCount: sql<number>`count(*)`
      })
      .from(attendance)
      .where(eq(attendance.classroomId, classroomId))
      .groupBy(sql`date(${attendance.date})`)
      .orderBy(desc(sql`date(${attendance.date})`));
    
    return results;
  }

  async getAttendanceRecordsByClassroomAndDate(classroomId: string, date: string): Promise<any[]> {
    const targetDate = new Date(date);
    
    const results = await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        isPresent: attendance.isPresent,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        method: attendance.method,
        notes: attendance.notes,
        enteredAt: attendance.enteredAt,
        enteredBy: attendance.enteredBy,
        isCurrent: attendance.isCurrent,
        correctionReason: attendance.correctionReason,
        studentFirstName: children.firstName,
        studentLastName: children.lastName,
        enteredByFirstName: users.firstName,
        enteredByLastName: users.lastName,
        enteredByEmail: users.email,
      })
      .from(attendance)
      .leftJoin(enrollments, eq(attendance.studentId, enrollments.id))
      .leftJoin(children, eq(enrollments.childId, children.id))
      .leftJoin(users, eq(attendance.enteredBy, users.id))
      .where(and(
        eq(attendance.classroomId, classroomId),
        eq(sql`date(${attendance.date})`, sql`date(${targetDate})`)
      ))
      .orderBy(children.firstName, children.lastName, desc(attendance.enteredAt));
    
    return results;
  }

  // ======================== LESSONS AND OBSERVATIONS ========================

  async getLessonsByClassroom(classroomId: string, filters?: {
    curriculumArea?: string;
    ageGroup?: string;
    presentedToYearGroup?: string;
    schoolYearId?: string;
  }): Promise<Lesson[]> {
    let query = db.select().from(lessons);
    
    const conditions = [
      or(
        eq(lessons.schoolId, classroomId), // School-specific lessons
        eq(lessons.networkDefault, true)   // Network-wide lessons
      )
    ];
    
    if (filters?.curriculumArea) {
      conditions.push(eq(lessons.curriculumArea, filters.curriculumArea));
    }
    
    if (filters?.ageGroup) {
      conditions.push(eq(lessons.ageGroup, filters.ageGroup));
    }
    
    return await query
      .where(and(...conditions))
      .orderBy(lessons.curriculumArea, lessons.sequence, lessons.name);
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set({ ...lesson, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Lesson observations for the grid
  async getLessonObservationsByClassroom(classroomId: string, filters?: {
    observationType?: string[];
    studentIds?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<LessonObservation[]> {
    let query = db.select().from(lessonObservations);
    
    const conditions = [eq(lessonObservations.classroomId, classroomId)];
    
    if (filters?.observationType && filters.observationType.length > 0) {
      conditions.push(
        or(...filters.observationType.map(type => eq(lessonObservations.observationType, type)))
      );
    }
    
    if (filters?.studentIds && filters.studentIds.length > 0) {
      conditions.push(
        or(...filters.studentIds.map(id => eq(lessonObservations.studentId, id)))
      );
    }
    
    if (filters?.startDate) {
      conditions.push(gte(lessonObservations.observationDate, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(lessonObservations.observationDate, filters.endDate));
    }
    
    return await query
      .where(and(...conditions))
      .orderBy(lessonObservations.observationDate);
  }

  async getLessonObservationsByStudent(studentId: string, classroomId: string): Promise<LessonObservation[]> {
    return await db
      .select()
      .from(lessonObservations)
      .where(and(
        eq(lessonObservations.studentId, studentId),
        eq(lessonObservations.classroomId, classroomId)
      ))
      .orderBy(lessonObservations.observationDate);
  }

  async createLessonObservation(observation: InsertLessonObservation): Promise<LessonObservation> {
    const [newObservation] = await db
      .insert(lessonObservations)
      .values(observation)
      .returning();
    return newObservation;
  }

  async createBulkLessonObservations(observations: InsertLessonObservation[]): Promise<LessonObservation[]> {
    const newObservations = await db
      .insert(lessonObservations)
      .values(observations)
      .returning();
    return newObservations;
  }

  async updateLessonObservation(id: string, observation: Partial<InsertLessonObservation>): Promise<LessonObservation> {
    const [updatedObservation] = await db
      .update(lessonObservations)
      .set({ ...observation, updatedAt: new Date() })
      .where(eq(lessonObservations.id, id))
      .returning();
    return updatedObservation;
  }

  async deleteLessonObservation(id: string): Promise<void> {
    await db.delete(lessonObservations).where(eq(lessonObservations.id, id));
  }

  // Student year groups for filtering
  async getStudentYearGroupsByClassroom(classroomId: string, schoolYearId?: string): Promise<StudentYearGroup[]> {
    const conditions = [eq(studentYearGroups.classroomId, classroomId)];
    
    if (schoolYearId) {
      conditions.push(eq(studentYearGroups.schoolYearId, schoolYearId));
    }
    
    return await db
      .select()
      .from(studentYearGroups)
      .where(and(...conditions))
      .orderBy(studentYearGroups.yearGroup);
  }

  async createStudentYearGroup(yearGroup: InsertStudentYearGroup): Promise<StudentYearGroup> {
    const [newYearGroup] = await db
      .insert(studentYearGroups)
      .values(yearGroup)
      .returning();
    return newYearGroup;
  }

  async updateStudentYearGroup(id: string, yearGroup: Partial<InsertStudentYearGroup>): Promise<StudentYearGroup> {
    const [updatedYearGroup] = await db
      .update(studentYearGroups)
      .set({ ...yearGroup, updatedAt: new Date() })
      .where(eq(studentYearGroups.id, id))
      .returning();
    return updatedYearGroup;
  }

  async deleteStudentYearGroup(id: string): Promise<void> {
    await db.delete(studentYearGroups).where(eq(studentYearGroups.id, id));
  }

  // ======================== USER INVITATIONS ========================
  
  async createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation> {
    const [created] = await this.db
      .insert(userInvitationsTable)
      .values(invitation)
      .returning();
    return created;
  }

  async getUserInvitations(): Promise<UserInvitation[]> {
    const invitations = await this.db
      .select()
      .from(userInvitationsTable)
      .orderBy(desc(userInvitationsTable.createdAt));
    return invitations;
  }

  async getUserInvitationByToken(token: string): Promise<UserInvitation | null> {
    const [invitation] = await this.db
      .select()
      .from(userInvitationsTable)
      .where(eq(userInvitationsTable.token, token))
      .limit(1);
    return invitation || null;
  }

  async updateUserInvitation(id: string, updates: Partial<UserInvitation>): Promise<UserInvitation> {
    const [updated] = await this.db
      .update(userInvitationsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userInvitationsTable.id, id))
      .returning();
    return updated;
  }

  async deleteUserInvitation(id: string): Promise<void> {
    await this.db
      .delete(userInvitationsTable)
      .where(eq(userInvitationsTable.id, id));
  }

  async getCurrentUserRole(userId: string): Promise<any> {
    const [role] = await this.db
      .select({
        id: userRoles.id,
        name: roleDefinitions.name,
        displayName: roleDefinitions.displayName,
        roleName: roleDefinitions.name,
        schoolId: userRoles.schoolId,
        classroomId: userRoles.classroomId
      })
      .from(userRoles)
      .innerJoin(roleDefinitions, eq(userRoles.roleId, roleDefinitions.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.active, true),
          or(
            isNull(userRoles.startDate),
            lte(userRoles.startDate, new Date())
          ),
          or(
            isNull(userRoles.endDate),
            gte(userRoles.endDate, new Date())
          )
        )
      )
      .orderBy(desc(userRoles.startDate))
      .limit(1);

    return role || null;
  }
}

export const storage = new DatabaseStorage();
