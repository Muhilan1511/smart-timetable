// Shared Types
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "ADMIN" | "COORDINATOR";
  lastLoginAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  qualification: string;
}

export interface Classroom {
  id: string;
  buildingName: string;
  roomNumber: string;
  capacity: number;
  facilities?: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
}

export interface Batch {
  id: string;
  programId: string;
  semester: number;
  academicYear: string;
  strength: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  creditHours: number;
}

export interface TimetableGeneration {
  id: string;
  departmentId: string;
  shiftId: string;
  academicYear: string;
  semester: number;
  status: "DRAFT" | "COORD_REVIEW" | "ADMIN_APPROVED" | "PUBLISHED";
  qualityScore?: number;
  conflictCount?: number;
  publishedAt?: string;
  createdAt: string;
}

export interface ScheduledClass {
  id: string;
  timetableId: string;
  batchId: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classType: "LECTURE" | "TUTORIAL" | "PRACTICAL";
  tentative: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  timetableId: string;
  status: "PENDING" | "COORD_REVIEW" | "ADMIN_REVIEW" | "APPROVED" | "REJECTED";
  currentReviewerId?: string;
  history: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  id: string;
  workflowId: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "RETURNED";
  reviewerId: string;
  comment?: string;
  timestamp: string;
}

// Store/State Types
export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  currentSection: "master" | "setup" | "constraints" | "timetables" | "workflows";
}
