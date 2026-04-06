export type Role = "ADMIN" | "COORDINATOR";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

export interface OptimizeRequest {
  departmentId: string;
  shiftId: string;
  semester: number;
  academicYear: string;
  optionsCount?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  departmentId: string;
  isLab: boolean;
}

export interface FacultyAvailability {
  id: string;
  facultyId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  availabilityType: "AVAILABLE" | "NOT_AVAILABLE" | "PREFER_NOT";
}

export interface FixedClass {
  id: string;
  batchId: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classType: "LECTURE" | "PRACTICAL";
  locked: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayStart: string;
  dayEnd: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  durationYears: number;
}

export interface Batch {
  id: string;
  name: string;
  programId: string;
  academicYear: string;
  semester: number;
  studentCount: number;
  departmentId: string;
  shiftId: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  programId: string;
  credits: number;
  semester: number;
  theoryHours: number;
  practicalHours: number;
}

export interface Faculty {
  id: string;
  departmentId: string;
  specialization?: string;
  qualification?: string;
  teachingLoadMax: number;
}

export interface TimetableGeneration {
  id: string;
  departmentId: string;
  shiftId: string;
  academicYear: string;
  semester: number;
  status: "DRAFT" | "COORD_REVIEW" | "ADMIN_APPROVED" | "PUBLISHED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  qualityScore?: number;
  conflictCount?: number;
  notes?: string;
  publishedAt?: string;
  validFrom?: string;
  validUntil?: string;
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
  classType: "LECTURE" | "PRACTICAL";
  isTentative: boolean;
  createdAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  timetableId: string;
  status: "PENDING" | "COORD_REVIEW" | "ADMIN_REVIEW" | "APPROVED" | "REJECTED";
  currentReviewerId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  workflowId: string;
  reviewerId: string;
  action: "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED" | "RETURNED";
  comment?: string;
  timestamp: string;
}
