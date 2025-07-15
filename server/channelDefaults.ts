import { InsertChannel } from "@shared/schema";

// Network default channels (foundation channels)
export const networkDefaultChannels: Omit<InsertChannel, 'id' | 'createdAt' | 'updatedAt' | 'schoolId' | 'classroomId' | 'familyId'>[] = [
  {
    name: "general",
    description: "General network-wide discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-ops",
    description: "Foundation operations discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-mktgcomms",
    description: "Foundation marketing and communications",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-tech",
    description: "Foundation technology discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-radicle",
    description: "Foundation radicle discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-chartergrowth",
    description: "Foundation charter growth discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation",
    description: "Main foundation channel",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-partners",
    description: "Foundation partners discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "foundation-random",
    description: "Foundation random discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
];

// Network teacher channels
export const networkTeacherChannels: Omit<InsertChannel, 'id' | 'createdAt' | 'updatedAt' | 'schoolId' | 'classroomId' | 'familyId'>[] = [
  {
    name: "support-at",
    description: "Support for assistive technology",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "new-to-wildflower",
    description: "Welcome channel for new educators",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "cheers",
    description: "Network-wide celebrations and achievements",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "infants-and-toddlers",
    description: "Infant and toddler education discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "primary",
    description: "Primary education discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "lower-elementary",
    description: "Lower elementary discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "upper-elementary",
    description: "Upper elementary discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "adolescent",
    description: "Adolescent education discussions",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
  {
    name: "wildflower-principles",
    description: "Discussions about Wildflower principles",
    type: "public",
    scope: "network",
    legalEntityId: null,
    taskId: null,
    isArchived: false,
    canDelete: false,
    canArchive: false,
  },
];

// School-specific channel templates
export interface SchoolChannelTemplate {
  namePattern: string;
  description: string;
  type: "public" | "private";
  scope: "school";
  canDelete: boolean;
  canArchive: boolean;
}

export const schoolChannelTemplates: SchoolChannelTemplate[] = [
  {
    namePattern: "{schoolPrefix}",
    description: "Main {schoolName} channel",
    type: "public",
    scope: "school",
    canDelete: false,
    canArchive: false,
  },
  {
    namePattern: "{schoolPrefix}-admin",
    description: "{schoolName} administration discussions",
    type: "private",
    scope: "school",
    canDelete: false,
    canArchive: false,
  },
  {
    namePattern: "{schoolPrefix}-staff",
    description: "{schoolName} staff discussions",
    type: "private",
    scope: "school",
    canDelete: false,
    canArchive: false,
  },
  {
    namePattern: "{schoolPrefix}-families",
    description: "{schoolName} families channel",
    type: "public",
    scope: "school",
    canDelete: false,
    canArchive: false,
  },
  {
    namePattern: "{schoolPrefix}-random",
    description: "{schoolName} random discussions",
    type: "public",
    scope: "school",
    canDelete: true,
    canArchive: true,
  },
  {
    namePattern: "{schoolPrefix}-cheers",
    description: "{schoolName} celebration channel",
    type: "public",
    scope: "school",
    canDelete: true,
    canArchive: true,
  },
];

// Classroom channel templates
export interface ClassroomChannelTemplate {
  namePattern: string;
  description: string;
  type: "public" | "private";
  scope: "classroom";
  levels: string[];
  canDelete: boolean;
  canArchive: boolean;
}

export const classroomChannelTemplates: ClassroomChannelTemplate[] = [
  {
    namePattern: "{schoolPrefix}-primary",
    description: "Primary classroom discussions",
    type: "public",
    scope: "classroom",
    levels: ["primary"],
    canDelete: false,
    canArchive: false,
  },
  {
    namePattern: "{schoolPrefix}-elementary",
    description: "Elementary classroom discussions",
    type: "public",
    scope: "classroom",
    levels: ["lower_elem", "upper_elem"],
    canDelete: false,
    canArchive: false,
  },
];