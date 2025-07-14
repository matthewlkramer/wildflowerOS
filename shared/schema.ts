import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ======================== USER & ROLE MODELS ========================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { 
    enum: [
      "teacher_leader", "teacher", "assistant", "aide", "parent", 
      "board_member", "central_staff", "network_admin"
    ]
  }).notNull(),
  schoolId: uuid("school_id"),
  legalEntityId: uuid("legal_entity_id"),
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

// ======================== LEGAL ENTITIES & SCHOOLS ========================

export const legalEntities = pgTable("legal_entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  entityType: varchar("entity_type", { 
    enum: ["independent", "charter_single", "charter_multi", "partner"] 
  }),
  membershipStatus: varchar("membership_status", { 
    enum: ["member", "affiliated_non_member", "pre_member", "lapsed_member"] 
  }),
  EIN: varchar("ein", { length: 20 }),
  nonprofitStatusSource: varchar("nonprofit_status_source", { 
    enum: ["direct", "group_exemption"] 
  }),
  address: text("address"),
  status: varchar("status", { enum: ["active", "closed", "paused"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 80 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  status: varchar("status", { enum: ["active", "closed", "paused"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schoolYears = pgTable("school_years", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 20 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== CLASSROOMS ========================

export const classrooms = pgTable("classrooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").notNull().references(() => schools.id),
  name: varchar("name", { length: 100 }).notNull(),
  level: varchar("level", { 
    enum: [
      "infant", "toddler", "primary", "lower_elem", 
      "upper_elem", "junior_high", "high_school"
    ]
  }).notNull(),
  capacity: integer("capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== FAMILY & CHILDREN ========================

export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }),
  address: text("address"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 255 }),
  notes: text("notes"),
  primaryContactId: varchar("primary_contact_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  birthDate: timestamp("birth_date").notNull(),
  gender: varchar("gender", { length: 50 }),
  raceEthnicity: varchar("race_ethnicity", { length: 100 }),
  primaryLanguage: varchar("primary_language", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guardians = pgTable("guardians", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  relationship: varchar("relationship", { length: 40 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== ENROLLMENT & SCHOOL YEARS ========================

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").notNull().references(() => children.id),
  schoolId: uuid("school_id").notNull().references(() => schools.id),
  classroomId: uuid("classroom_id").references(() => classrooms.id),
  schoolYearId: uuid("school_year_id").references(() => schoolYears.id),
  status: varchar("status", { 
    enum: ["prospective", "enrolled", "graduated", "withdrawn"] 
  }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== BILLING, BUDGET, PAYMENTS ========================

export const billingSetups = pgTable("billing_setups", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id),
  billingSchedule: varchar("billing_schedule", { 
    enum: ["monthly", "yearly"] 
  }).notNull().default("monthly"),
  autopayEnabled: boolean("autopay_enabled").notNull().default(false),
  paymentMethod: varchar("payment_method", { 
    enum: ["bank_account", "credit_card", "manual"] 
  }).notNull().default("manual"),
  billRecipientName: varchar("bill_recipient_name", { length: 100 }),
  billRecipientEmail: varchar("bill_recipient_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id),
  billingSetupId: uuid("billing_setup_id").references(() => billingSetups.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { enum: ["pending", "paid", "overdue"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { 
    enum: ["bank_account", "credit_card", "manual"] 
  }),
  status: varchar("status", { enum: ["pending", "completed", "failed"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").notNull().references(() => schools.id),
  schoolYearId: uuid("school_year_id").notNull().references(() => schoolYears.id),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }),
  budgetNotes: text("budget_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== MESSAGING, TASKS, & COMMENTS ========================

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }),
  type: varchar("type", { 
    enum: [
      "public", "private", "board", "advisory", "dm", "task_comments"
    ]
  }).notNull(),
  schoolId: uuid("school_id").references(() => schools.id),
  legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id),
  taskId: uuid("task_id"), // for task_comments channel
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const channelMembers = pgTable("channel_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull().references(() => channels.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull().references(() => channels.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of file metadata/URLs
  sentAt: timestamp("sent_at").defaultNow(),
  readBy: jsonb("read_by"),
  threadId: uuid("thread_id"),
  isPinned: boolean("is_pinned"),
  isUrgent: boolean("is_urgent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  status: varchar("status", { 
    enum: ["open", "in_progress", "completed", "overdue", "canceled"] 
  }),
  createdById: varchar("created_by_id").references(() => users.id),
  commentChannelId: uuid("comment_channel_id").references(() => channels.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== KNOWLEDGE BASE ========================

export const knowledgePosts = pgTable("knowledge_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  authorId: varchar("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  visibility: varchar("visibility", { enum: ["public", "school", "private"] }),
  schoolId: uuid("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== RELATIONS ========================

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  guardians: many(guardians),
  sentMessages: many(messages),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  knowledgePosts: many(knowledgePosts),
  channelMemberships: many(channelMembers),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [userRoles.schoolId],
    references: [schools.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [userRoles.legalEntityId],
    references: [legalEntities.id],
  }),
}));

export const legalEntitiesRelations = relations(legalEntities, ({ many }) => ({
  schools: many(schools),
  userRoles: many(userRoles),
  channels: many(channels),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  legalEntity: one(legalEntities, {
    fields: [schools.legalEntityId],
    references: [legalEntities.id],
  }),
  classrooms: many(classrooms),
  enrollments: many(enrollments),
  budgets: many(budgets),
  channels: many(channels),
  userRoles: many(userRoles),
  knowledgePosts: many(knowledgePosts),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [classrooms.schoolId],
    references: [schools.id],
  }),
  enrollments: many(enrollments),
}));

export const familiesRelations = relations(families, ({ many }) => ({
  children: many(children),
  guardians: many(guardians),
  billingSetups: many(billingSetups),
  invoices: many(invoices),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  family: one(families, {
    fields: [children.familyId],
    references: [families.id],
  }),
  enrollments: many(enrollments),
}));

export const guardiansRelations = relations(guardians, ({ one }) => ({
  family: one(families, {
    fields: [guardians.familyId],
    references: [families.id],
  }),
  user: one(users, {
    fields: [guardians.userId],
    references: [users.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  child: one(children, {
    fields: [enrollments.childId],
    references: [children.id],
  }),
  school: one(schools, {
    fields: [enrollments.schoolId],
    references: [schools.id],
  }),
  classroom: one(classrooms, {
    fields: [enrollments.classroomId],
    references: [classrooms.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [enrollments.schoolYearId],
    references: [schoolYears.id],
  }),
}));

export const channelsRelations = relations(channels, ({ many, one }) => ({
  members: many(channelMembers),
  messages: many(messages),
  school: one(schools, {
    fields: [channels.schoolId],
    references: [schools.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [channels.legalEntityId],
    references: [legalEntities.id],
  }),
  task: one(tasks, {
    fields: [channels.taskId],
    references: [tasks.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "createdTasks",
  }),
  commentChannel: one(channels, {
    fields: [tasks.commentChannelId],
    references: [channels.id],
  }),
}));

// ======================== TYPES ========================

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = typeof classrooms.$inferInsert;
export type Family = typeof families.$inferSelect;
export type InsertFamily = typeof families.$inferInsert;
export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;

// ======================== SCHEMAS ========================

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertSchoolSchema = createInsertSchema(schools);
export const insertClassroomSchema = createInsertSchema(classrooms);
export const insertFamilySchema = createInsertSchema(families);
export const insertChildSchema = createInsertSchema(children);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertMessageSchema = createInsertSchema(messages);
export const insertChannelSchema = createInsertSchema(channels);
