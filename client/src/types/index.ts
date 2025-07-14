export interface DashboardStats {
  totalStudents: number;
  activeClassrooms: number;
  pendingTasks: number;
  monthlyRevenue: number;
}

export interface UserContext {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  roles: UserRole[];
  schools: School[];
}

export interface UserRole {
  id: string;
  role: "teacher_leader" | "teacher" | "assistant" | "aide" | "parent" | "board_member" | "central_staff" | "network_admin";
  schoolId?: string;
  legalEntityId?: string;
  active: boolean;
}

export interface School {
  id: string;
  name: string;
  shortName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: "active" | "closed" | "paused";
}

export interface Classroom {
  id: string;
  schoolId: string;
  name: string;
  level: "infant" | "toddler" | "primary" | "lower_elem" | "upper_elem" | "junior_high" | "high_school";
  capacity?: number;
  isActive: boolean;
  currentEnrollment?: number;
  enrollmentPercentage?: number;
}

export interface Family {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  primaryContactId?: string;
}

export interface Child {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: string;
  raceEthnicity?: string;
  primaryLanguage?: string;
  notes?: string;
}

export interface Enrollment {
  id: string;
  childId: string;
  schoolId: string;
  classroomId?: string;
  schoolYearId?: string;
  status: "prospective" | "enrolled" | "graduated" | "withdrawn";
  startDate?: string;
  endDate?: string;
  notes?: string;
  child?: Child;
  family?: Family;
  classroom?: Classroom;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedToId?: string;
  dueDate?: string;
  status?: "open" | "in_progress" | "completed" | "overdue" | "canceled";
  createdById?: string;
  commentChannelId?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  attachments?: any;
  sentAt: string;
  readBy?: any;
  threadId?: string;
  isPinned?: boolean;
  isUrgent?: boolean;
}

export interface Channel {
  id: string;
  name?: string;
  type: "public" | "private" | "board" | "advisory" | "dm" | "task_comments";
  schoolId?: string;
  legalEntityId?: string;
  taskId?: string;
}
