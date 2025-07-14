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
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
  email: varchar("email", { length: 255 }).unique(), // This remains as the login email
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailAddresses = pgTable("email_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  type: varchar("type", { 
    enum: ["personal", "work_twf", "work_wf_school", "work_non_wf"] 
  }).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueEmail: unique().on(table.email),
}));

// Role definitions - can be customized per school or used network-wide
export const roleDefinitions = pgTable("role_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { 
    enum: ["parent", "educator", "board_director", "systems_administrator"] 
  }).notNull(),
  isSystemRole: boolean("is_system_role").notNull().default(false), // Core roles that can't be modified
  schoolId: uuid("school_id"), // If null, available network-wide
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User role assignments
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  roleId: uuid("role_id").notNull().references(() => roleDefinitions.id),
  schoolId: uuid("school_id"), // Scope: which school this role applies to
  classroomId: uuid("classroom_id"), // Scope: which classroom this role applies to  
  legalEntityId: uuid("legal_entity_id"), // Scope: which legal entity this role applies to
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date").defaultNow(),
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
  schoolId: uuid("school_id").references(() => schools.id),
  name: varchar("name", { length: 50 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(false),
  networkDefault: boolean("network_default").notNull().default(false),
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

// ======================== DEFAULT BUDGET CATEGORIES ========================

export const defaultBudgetCategories = pgTable("default_budget_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }),
  description: text("description"),
  isVisibleInAddRevenue: boolean("is_visible_in_add_revenue").default(true),
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

export const knowledgeTags = pgTable("knowledge_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgePostTags = pgTable("knowledge_post_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => knowledgePosts.id),
  tagId: uuid("tag_id").notNull().references(() => knowledgeTags.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeQuestions = pgTable("knowledge_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => knowledgePosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  question: text("question").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeAnswers = pgTable("knowledge_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull().references(() => knowledgeQuestions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  answer: text("answer").notNull(),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeRatings = pgTable("knowledge_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => knowledgePosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeLikes = pgTable("knowledge_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => knowledgePosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeViews = pgTable("knowledge_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => knowledgePosts.id),
  userId: varchar("user_id").references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// ======================== ONBOARDING & CHECKLISTS ========================

export const onboardingChecklists = pgTable("onboarding_checklists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["network", "school", "role"] }).notNull(),
  schoolId: uuid("school_id").references(() => schools.id),
  role: varchar("role", { 
    enum: [
      "teacher_leader", "teacher", "assistant", "aide", "parent", 
      "board_member", "central_staff", "network_admin"
    ]
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingItems = pgTable("onboarding_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistId: uuid("checklist_id").notNull().references(() => onboardingChecklists.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  dueInDays: integer("due_in_days"), // Days after onboarding start
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingCompletions = pgTable("onboarding_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").notNull().references(() => onboardingItems.id),
  userId: varchar("user_id").references(() => users.id),
  familyId: uuid("family_id").references(() => families.id),
  completedAt: timestamp("completed_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ======================== TEMPLATES & POLICIES ========================

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["email", "document", "form", "policy"] }).notNull(),
  content: text("content").notNull(),
  schoolId: uuid("school_id").references(() => schools.id),
  legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id),
  isActive: boolean("is_active").notNull().default(true),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const policyDocuments = pgTable("policy_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  fileUrl: varchar("file_url", { length: 255 }),
  version: varchar("version", { length: 20 }),
  schoolId: uuid("school_id").references(() => schools.id),
  legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id),
  isActive: boolean("is_active").notNull().default(true),
  approvedAt: timestamp("approved_at"),
  approvedById: varchar("approved_by_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== ATTENDANCE & ASSESSMENTS ========================

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").notNull().references(() => children.id),
  date: timestamp("date").notNull(),
  status: varchar("status", { enum: ["present", "absent", "late", "early_departure"] }).notNull(),
  arrivalTime: timestamp("arrival_time"),
  departureTime: timestamp("departure_time"),
  notes: text("notes"),
  recordedById: varchar("recorded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id").notNull().references(() => children.id),
  assessorId: varchar("assessor_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ["observation", "portfolio", "standardized", "developmental"] }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  results: jsonb("results"), // Flexible structure for different assessment types
  assessmentDate: timestamp("assessment_date").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======================== BOARD MEETINGS & RESOLUTIONS ========================

export const boardMeetings = pgTable("board_meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  meetingDate: timestamp("meeting_date").notNull(),
  location: varchar("location", { length: 255 }),
  agenda: text("agenda"),
  minutes: text("minutes"),
  legalEntityId: uuid("legal_entity_id").notNull().references(() => legalEntities.id),
  status: varchar("status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] }).notNull().default("scheduled"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const boardResolutions = pgTable("board_resolutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").references(() => boardMeetings.id),
  policyDocumentId: uuid("policy_document_id").references(() => policyDocuments.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resolutionText: text("resolution_text").notNull(),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  votesAbstain: integer("votes_abstain").default(0),
  status: varchar("status", { enum: ["proposed", "approved", "rejected", "tabled"] }).notNull().default("proposed"),
  adoptedAt: timestamp("adopted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const boardVotes = pgTable("board_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  resolutionId: uuid("resolution_id").notNull().references(() => boardResolutions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  vote: varchar("vote", { enum: ["for", "against", "abstain"] }).notNull(),
  comment: text("comment"),
  votedAt: timestamp("voted_at").defaultNow(),
});

// ======================== ANALYTICS & PROJECTIONS ========================

export const enrollmentProjections = pgTable("enrollment_projections", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").notNull().references(() => schools.id),
  schoolYearId: uuid("school_year_id").notNull().references(() => schoolYears.id),
  classroomLevel: varchar("classroom_level", { 
    enum: [
      "infant", "toddler", "primary", "lower_elem", 
      "upper_elem", "junior_high", "high_school"
    ]
  }).notNull(),
  projectedEnrollment: integer("projected_enrollment").notNull(),
  actualEnrollment: integer("actual_enrollment"),
  openSlots: integer("open_slots"),
  waitlistCount: integer("waitlist_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundraisingAnalytics = pgTable("fundraising_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").references(() => schools.id),
  legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id),
  period: varchar("period", { length: 20 }).notNull(), // e.g., "2024-Q1", "2024"
  totalRaised: decimal("total_raised", { precision: 12, scale: 2 }),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  donorCount: integer("donor_count"),
  averageDonation: decimal("average_donation", { precision: 10, scale: 2 }),
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
  emailAddresses: many(emailAddresses),
}));

export const emailAddressesRelations = relations(emailAddresses, ({ one }) => ({
  user: one(users, {
    fields: [emailAddresses.userId],
    references: [users.id],
  }),
}));

export const roleDefinitionsRelations = relations(roleDefinitions, ({ one, many }) => ({
  school: one(schools, {
    fields: [roleDefinitions.schoolId],
    references: [schools.id],
  }),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  roleDefinition: one(roleDefinitions, {
    fields: [userRoles.roleId],
    references: [roleDefinitions.id],
  }),
  school: one(schools, {
    fields: [userRoles.schoolId],
    references: [schools.id],
  }),
  classroom: one(classrooms, {
    fields: [userRoles.classroomId],
    references: [classrooms.id],
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

export const knowledgePostsRelations = relations(knowledgePosts, ({ one, many }) => ({
  author: one(users, {
    fields: [knowledgePosts.authorId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [knowledgePosts.schoolId],
    references: [schools.id],
  }),
  tags: many(knowledgePostTags),
  questions: many(knowledgeQuestions),
  ratings: many(knowledgeRatings),
  likes: many(knowledgeLikes),
  views: many(knowledgeViews),
}));

export const knowledgeTagsRelations = relations(knowledgeTags, ({ many }) => ({
  posts: many(knowledgePostTags),
}));

export const knowledgePostTagsRelations = relations(knowledgePostTags, ({ one }) => ({
  post: one(knowledgePosts, {
    fields: [knowledgePostTags.postId],
    references: [knowledgePosts.id],
  }),
  tag: one(knowledgeTags, {
    fields: [knowledgePostTags.tagId],
    references: [knowledgeTags.id],
  }),
}));

export const knowledgeQuestionsRelations = relations(knowledgeQuestions, ({ one, many }) => ({
  post: one(knowledgePosts, {
    fields: [knowledgeQuestions.postId],
    references: [knowledgePosts.id],
  }),
  user: one(users, {
    fields: [knowledgeQuestions.userId],
    references: [users.id],
  }),
  answers: many(knowledgeAnswers),
}));

export const knowledgeAnswersRelations = relations(knowledgeAnswers, ({ one }) => ({
  question: one(knowledgeQuestions, {
    fields: [knowledgeAnswers.questionId],
    references: [knowledgeQuestions.id],
  }),
  user: one(users, {
    fields: [knowledgeAnswers.userId],
    references: [users.id],
  }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  child: one(children, {
    fields: [attendanceRecords.childId],
    references: [children.id],
  }),
  recordedBy: one(users, {
    fields: [attendanceRecords.recordedById],
    references: [users.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  child: one(children, {
    fields: [assessments.childId],
    references: [children.id],
  }),
  assessor: one(users, {
    fields: [assessments.assessorId],
    references: [users.id],
  }),
}));

export const boardMeetingsRelations = relations(boardMeetings, ({ one, many }) => ({
  legalEntity: one(legalEntities, {
    fields: [boardMeetings.legalEntityId],
    references: [legalEntities.id],
  }),
  createdBy: one(users, {
    fields: [boardMeetings.createdById],
    references: [users.id],
  }),
  resolutions: many(boardResolutions),
}));

export const boardResolutionsRelations = relations(boardResolutions, ({ one, many }) => ({
  meeting: one(boardMeetings, {
    fields: [boardResolutions.meetingId],
    references: [boardMeetings.id],
  }),
  policyDocument: one(policyDocuments, {
    fields: [boardResolutions.policyDocumentId],
    references: [policyDocuments.id],
  }),
  votes: many(boardVotes),
}));

export const boardVotesRelations = relations(boardVotes, ({ one }) => ({
  resolution: one(boardResolutions, {
    fields: [boardVotes.resolutionId],
    references: [boardResolutions.id],
  }),
  user: one(users, {
    fields: [boardVotes.userId],
    references: [users.id],
  }),
}));

export const onboardingChecklistsRelations = relations(onboardingChecklists, ({ one, many }) => ({
  school: one(schools, {
    fields: [onboardingChecklists.schoolId],
    references: [schools.id],
  }),
  items: many(onboardingItems),
}));

export const onboardingItemsRelations = relations(onboardingItems, ({ one, many }) => ({
  checklist: one(onboardingChecklists, {
    fields: [onboardingItems.checklistId],
    references: [onboardingChecklists.id],
  }),
  completions: many(onboardingCompletions),
}));

export const onboardingCompletionsRelations = relations(onboardingCompletions, ({ one }) => ({
  item: one(onboardingItems, {
    fields: [onboardingCompletions.itemId],
    references: [onboardingItems.id],
  }),
  user: one(users, {
    fields: [onboardingCompletions.userId],
    references: [users.id],
  }),
  family: one(families, {
    fields: [onboardingCompletions.familyId],
    references: [families.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  school: one(schools, {
    fields: [templates.schoolId],
    references: [schools.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [templates.legalEntityId],
    references: [legalEntities.id],
  }),
  createdBy: one(users, {
    fields: [templates.createdById],
    references: [users.id],
  }),
}));

export const policyDocumentsRelations = relations(policyDocuments, ({ one, many }) => ({
  school: one(schools, {
    fields: [policyDocuments.schoolId],
    references: [schools.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [policyDocuments.legalEntityId],
    references: [legalEntities.id],
  }),
  approvedBy: one(users, {
    fields: [policyDocuments.approvedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [policyDocuments.createdById],
    references: [users.id],
  }),
  resolutions: many(boardResolutions),
}));

export const enrollmentProjectionsRelations = relations(enrollmentProjections, ({ one }) => ({
  school: one(schools, {
    fields: [enrollmentProjections.schoolId],
    references: [schools.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [enrollmentProjections.schoolYearId],
    references: [schoolYears.id],
  }),
}));

export const fundraisingAnalyticsRelations = relations(fundraisingAnalytics, ({ one }) => ({
  school: one(schools, {
    fields: [fundraisingAnalytics.schoolId],
    references: [schools.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [fundraisingAnalytics.legalEntityId],
    references: [legalEntities.id],
  }),
}));

// ======================== TYPES ========================

// ======================== TYPE EXPORTS ========================

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type EmailAddress = typeof emailAddresses.$inferSelect;
export type InsertEmailAddress = typeof emailAddresses.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
export type RoleDefinition = typeof roleDefinitions.$inferSelect;
export type InsertRoleDefinition = typeof roleDefinitions.$inferInsert;
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

// Knowledge Base types
export type KnowledgePost = typeof knowledgePosts.$inferSelect;
export type InsertKnowledgePost = typeof knowledgePosts.$inferInsert;
export type KnowledgeTag = typeof knowledgeTags.$inferSelect;
export type InsertKnowledgeTag = typeof knowledgeTags.$inferInsert;
export type KnowledgeQuestion = typeof knowledgeQuestions.$inferSelect;
export type InsertKnowledgeQuestion = typeof knowledgeQuestions.$inferInsert;
export type KnowledgeAnswer = typeof knowledgeAnswers.$inferSelect;
export type InsertKnowledgeAnswer = typeof knowledgeAnswers.$inferInsert;

// Onboarding types
export type OnboardingChecklist = typeof onboardingChecklists.$inferSelect;
export type InsertOnboardingChecklist = typeof onboardingChecklists.$inferInsert;
export type OnboardingItem = typeof onboardingItems.$inferSelect;
export type InsertOnboardingItem = typeof onboardingItems.$inferInsert;
export type OnboardingCompletion = typeof onboardingCompletions.$inferSelect;
export type InsertOnboardingCompletion = typeof onboardingCompletions.$inferInsert;

// Template and Policy types
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type PolicyDocument = typeof policyDocuments.$inferSelect;
export type InsertPolicyDocument = typeof policyDocuments.$inferInsert;

// Board and Governance types
export type BoardMeeting = typeof boardMeetings.$inferSelect;
export type InsertBoardMeeting = typeof boardMeetings.$inferInsert;
export type BoardResolution = typeof boardResolutions.$inferSelect;
export type InsertBoardResolution = typeof boardResolutions.$inferInsert;
export type BoardVote = typeof boardVotes.$inferSelect;
export type InsertBoardVote = typeof boardVotes.$inferInsert;

// Attendance and Assessment types
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

// Analytics types
export type EnrollmentProjection = typeof enrollmentProjections.$inferSelect;
export type InsertEnrollmentProjection = typeof enrollmentProjections.$inferInsert;
export type FundraisingAnalytics = typeof fundraisingAnalytics.$inferSelect;
export type InsertFundraisingAnalytics = typeof fundraisingAnalytics.$inferInsert;

// ======================== ZOD SCHEMAS ========================

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertRoleDefinitionSchema = createInsertSchema(roleDefinitions);
export const insertSchoolSchema = createInsertSchema(schools);
export const insertClassroomSchema = createInsertSchema(classrooms);
export const insertFamilySchema = createInsertSchema(families);
export const insertChildSchema = createInsertSchema(children);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertMessageSchema = createInsertSchema(messages);
export const insertChannelSchema = createInsertSchema(channels);
export const insertKnowledgePostSchema = createInsertSchema(knowledgePosts);
export const insertKnowledgeTagSchema = createInsertSchema(knowledgeTags);
export const insertOnboardingChecklistSchema = createInsertSchema(onboardingChecklists);
export const insertOnboardingItemSchema = createInsertSchema(onboardingItems);
export const insertTemplateSchema = createInsertSchema(templates);
export const insertPolicyDocumentSchema = createInsertSchema(policyDocuments);
export const insertBoardMeetingSchema = createInsertSchema(boardMeetings);
export const insertBoardResolutionSchema = createInsertSchema(boardResolutions);
export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords);
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertEmailAddressSchema = createInsertSchema(emailAddresses);
