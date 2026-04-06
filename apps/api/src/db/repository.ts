import { randomUUID } from "node:crypto";
import { db } from "./client.js";
import { ApprovalHistoryEntry, ApprovalWorkflow, Batch, Classroom, Department, Faculty, FacultyAvailability, FixedClass, Program, ScheduledClass, Shift, Subject, TimetableGeneration } from "../types.js";

const mapClassroom = (row: {
  id: string;
  name: string;
  capacity: number;
  department_id: string;
  is_lab: boolean;
}): Classroom => ({
  id: row.id,
  name: row.name,
  capacity: row.capacity,
  departmentId: row.department_id,
  isLab: row.is_lab
});

const mapFacultyAvailability = (row: {
  id: string;
  faculty_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  availability_type: "AVAILABLE" | "NOT_AVAILABLE" | "PREFER_NOT";
}): FacultyAvailability => ({
  id: row.id,
  facultyId: row.faculty_id,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  availabilityType: row.availability_type
});

const mapFixedClass = (row: {
  id: string;
  batch_id: string;
  subject_id: string;
  faculty_id: string;
  classroom_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  class_type: "LECTURE" | "PRACTICAL";
  locked: boolean;
}): FixedClass => ({
  id: row.id,
  batchId: row.batch_id,
  subjectId: row.subject_id,
  facultyId: row.faculty_id,
  classroomId: row.classroom_id,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  classType: row.class_type,
  locked: row.locked
});

const mapShift = (row: {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  day_start: string;
  day_end: string;
}): Shift => ({
  id: row.id,
  name: row.name,
  startTime: row.start_time,
  endTime: row.end_time,
  dayStart: row.day_start,
  dayEnd: row.day_end
});

const mapProgram = (row: {
  id: string;
  name: string;
  code: string;
  department_id: string;
  duration_years: number;
}): Program => ({
  id: row.id,
  name: row.name,
  code: row.code,
  departmentId: row.department_id,
  durationYears: row.duration_years
});

const mapBatch = (row: {
  id: string;
  name: string;
  program_id: string;
  academic_year: string;
  semester: number;
  student_count: number;
  department_id: string;
  shift_id: string;
}): Batch => ({
  id: row.id,
  name: row.name,
  programId: row.program_id,
  academicYear: row.academic_year,
  semester: row.semester,
  studentCount: row.student_count,
  departmentId: row.department_id,
  shiftId: row.shift_id
});

const mapSubject = (row: {
  id: string;
  name: string;
  code: string;
  program_id: string;
  credits: string;
  semester: number;
  theory_hours: number;
  practical_hours: number;
}): Subject => ({
  id: row.id,
  name: row.name,
  code: row.code,
  programId: row.program_id,
  credits: parseFloat(row.credits),
  semester: row.semester,
  theoryHours: row.theory_hours,
  practicalHours: row.practical_hours
});

const mapFaculty = (row: {
  id: string;
  department_id: string;
  specialization?: string;
  qualification?: string;
  teaching_load_max: number;
}): Faculty => ({
  id: row.id,
  departmentId: row.department_id,
  specialization: row.specialization,
  qualification: row.qualification,
  teachingLoadMax: row.teaching_load_max
});

const mapTimetableGeneration = (row: {
  id: string;
  department_id: string;
  shift_id: string;
  academic_year: string;
  semester: number;
  status: "DRAFT" | "COORD_REVIEW" | "ADMIN_APPROVED" | "PUBLISHED";
  created_by: string;
  created_at: string;
  updated_at: string;
  quality_score?: number;
  conflict_count?: number;
  notes?: string;
  published_at?: string;
  valid_from?: string;
  valid_until?: string;
}): TimetableGeneration => ({
  id: row.id,
  departmentId: row.department_id,
  shiftId: row.shift_id,
  academicYear: row.academic_year,
  semester: row.semester,
  status: row.status,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  qualityScore: row.quality_score ? parseFloat(row.quality_score.toString()) : undefined,
  conflictCount: row.conflict_count,
  notes: row.notes,
  publishedAt: row.published_at,
  validFrom: row.valid_from,
  validUntil: row.valid_until
});

const mapScheduledClass = (row: {
  id: string;
  timetable_id: string;
  batch_id: string;
  subject_id: string;
  faculty_id: string;
  classroom_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  class_type: "LECTURE" | "PRACTICAL";
  is_tentative: boolean;
  created_at: string;
}): ScheduledClass => ({
  id: row.id,
  timetableId: row.timetable_id,
  batchId: row.batch_id,
  subjectId: row.subject_id,
  facultyId: row.faculty_id,
  classroomId: row.classroom_id,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  classType: row.class_type,
  isTentative: row.is_tentative,
  createdAt: row.created_at
});

const mapApprovalWorkflow = (row: {
  id: string;
  timetable_id: string;
  status: "PENDING" | "COORD_REVIEW" | "ADMIN_REVIEW" | "APPROVED" | "REJECTED";
  current_reviewer_id?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}): ApprovalWorkflow => ({
  id: row.id,
  timetableId: row.timetable_id,
  status: row.status,
  currentReviewerId: row.current_reviewer_id,
  rejectionReason: row.rejection_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at
});

const mapApprovalHistoryEntry = (row: {
  id: string;
  workflow_id: string;
  reviewer_id: string;
  action: "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED" | "RETURNED";
  comment?: string;
  timestamp: string;
}): ApprovalHistoryEntry => ({
  id: row.id,
  workflowId: row.workflow_id,
  reviewerId: row.reviewer_id,
  action: row.action,
  comment: row.comment,
  timestamp: row.timestamp
});

export const repository = {
  async createDepartment(name: string, code: string): Promise<Department> {
    const result = await db.query<Department>(
      `INSERT INTO departments (id, name, code) VALUES ($1, $2, $3) RETURNING id, name, code`,
      [randomUUID(), name, code]
    );
    return result.rows[0];
  },

  async listDepartments(): Promise<Department[]> {
    const result = await db.query<Department>(`SELECT id, name, code FROM departments ORDER BY name`);
    return result.rows;
  },

  async createClassroom(payload: Omit<Classroom, "id">): Promise<Classroom> {
    const result = await db.query(
      `INSERT INTO classrooms (id, name, capacity, department_id, is_lab)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, capacity, department_id, is_lab`,
      [randomUUID(), payload.name, payload.capacity, payload.departmentId, payload.isLab]
    );

    return mapClassroom(result.rows[0]);
  },

  async listClassrooms(): Promise<Classroom[]> {
    const result = await db.query(
      `SELECT id, name, capacity, department_id, is_lab FROM classrooms ORDER BY name`
    );
    return result.rows.map(mapClassroom);
  },

  async addFacultyAvailability(payload: Omit<FacultyAvailability, "id">): Promise<FacultyAvailability> {
    const result = await db.query(
      `INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time, availability_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, faculty_id, day_of_week, start_time, end_time, availability_type`,
      [
        randomUUID(),
        payload.facultyId,
        payload.dayOfWeek,
        payload.startTime,
        payload.endTime,
        payload.availabilityType
      ]
    );

    return mapFacultyAvailability(result.rows[0]);
  },

  async listFacultyAvailability(): Promise<FacultyAvailability[]> {
    const result = await db.query(
      `SELECT id, faculty_id, day_of_week, start_time, end_time, availability_type
       FROM faculty_availability
       ORDER BY day_of_week, start_time`
    );

    return result.rows.map(mapFacultyAvailability);
  },

  async createFixedClass(payload: Omit<FixedClass, "id">): Promise<FixedClass> {
    const result = await db.query(
      `INSERT INTO fixed_classes (id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, locked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, locked`,
      [
        randomUUID(),
        payload.batchId,
        payload.subjectId,
        payload.facultyId,
        payload.classroomId,
        payload.dayOfWeek,
        payload.startTime,
        payload.endTime,
        payload.classType,
        payload.locked
      ]
    );

    return mapFixedClass(result.rows[0]);
  },

  async listFixedClasses(): Promise<FixedClass[]> {
    const result = await db.query(
      `SELECT id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, locked
       FROM fixed_classes
       ORDER BY day_of_week, start_time`
    );

    return result.rows.map(mapFixedClass);
  },

  async createShift(payload: Omit<Shift, "id">): Promise<Shift> {
    const result = await db.query(
      `INSERT INTO shifts (id, name, start_time, end_time, day_start, day_end)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, start_time, end_time, day_start, day_end`,
      [randomUUID(), payload.name, payload.startTime, payload.endTime, payload.dayStart, payload.dayEnd]
    );
    return mapShift(result.rows[0]);
  },

  async listShifts(): Promise<Shift[]> {
    const result = await db.query(
      `SELECT id, name, start_time, end_time, day_start, day_end FROM shifts ORDER BY name`
    );
    return result.rows.map(mapShift);
  },

  async createProgram(payload: Omit<Program, "id">): Promise<Program> {
    const result = await db.query(
      `INSERT INTO programs (id, name, code, department_id, duration_years)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, code, department_id, duration_years`,
      [randomUUID(), payload.name, payload.code, payload.departmentId, payload.durationYears]
    );
    return mapProgram(result.rows[0]);
  },

  async listPrograms(departmentId?: string): Promise<Program[]> {
    let query = `SELECT id, name, code, department_id, duration_years FROM programs`;
    if (departmentId) {
      query += ` WHERE department_id = $1`;
      const result = await db.query(query, [departmentId]);
      return result.rows.map(mapProgram);
    }
    const result = await db.query(query + ` ORDER BY name`);
    return result.rows.map(mapProgram);
  },

  async createBatch(payload: Omit<Batch, "id">): Promise<Batch> {
    const result = await db.query(
      `INSERT INTO batches (id, name, program_id, academic_year, semester, student_count, department_id, shift_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, program_id, academic_year, semester, student_count, department_id, shift_id`,
      [
        randomUUID(),
        payload.name,
        payload.programId,
        payload.academicYear,
        payload.semester,
        payload.studentCount,
        payload.departmentId,
        payload.shiftId
      ]
    );
    return mapBatch(result.rows[0]);
  },

  async listBatches(departmentId?: string, shiftId?: string): Promise<Batch[]> {
    let query = `SELECT id, name, program_id, academic_year, semester, student_count, department_id, shift_id FROM batches`;
    const params: string[] = [];
    const conditions: string[] = [];

    if (departmentId) {
      conditions.push(`department_id = $${params.length + 1}`);
      params.push(departmentId);
    }
    if (shiftId) {
      conditions.push(`shift_id = $${params.length + 1}`);
      params.push(shiftId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY name`;

    const result = await db.query(query, params);
    return result.rows.map(mapBatch);
  },

  async createSubject(payload: Omit<Subject, "id">): Promise<Subject> {
    const result = await db.query(
      `INSERT INTO subjects (id, name, code, program_id, credits, semester, theory_hours, practical_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, code, program_id, credits, semester, theory_hours, practical_hours`,
      [
        randomUUID(),
        payload.name,
        payload.code,
        payload.programId,
        payload.credits,
        payload.semester,
        payload.theoryHours,
        payload.practicalHours
      ]
    );
    return mapSubject(result.rows[0]);
  },

  async listSubjects(programId?: string, semester?: number): Promise<Subject[]> {
    let query = `SELECT id, name, code, program_id, credits, semester, theory_hours, practical_hours FROM subjects`;
    const params: string[] = [];
    const conditions: string[] = [];

    if (programId) {
      conditions.push(`program_id = $${params.length + 1}`);
      params.push(programId);
    }
    if (semester !== undefined) {
      conditions.push(`semester = $${params.length + 1}`);
      params.push(semester.toString());
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY code`;

    const result = await db.query(query, params);
    return result.rows.map(mapSubject);
  },

  async createFaculty(payload: Omit<Faculty, "id">): Promise<Faculty> {
    const result = await db.query(
      `INSERT INTO faculty (id, department_id, specialization, qualification, teaching_load_max)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, department_id, specialization, qualification, teaching_load_max`,
      [
        randomUUID(),
        payload.departmentId,
        payload.specialization || null,
        payload.qualification || null,
        payload.teachingLoadMax
      ]
    );
    return mapFaculty(result.rows[0]);
  },

  async listFaculty(departmentId?: string): Promise<Faculty[]> {
    let query = `SELECT id, department_id, specialization, qualification, teaching_load_max FROM faculty`;
    if (departmentId) {
      query += ` WHERE department_id = $1`;
      const result = await db.query(query, [departmentId]);
      return result.rows.map(mapFaculty);
    }
    const result = await db.query(query + ` ORDER BY id`);
    return result.rows.map(mapFaculty);
  },

  async createTimetable(payload: Omit<TimetableGeneration, "id" | "createdAt" | "updatedAt">): Promise<TimetableGeneration> {
    const result = await db.query(
      `INSERT INTO timetable_generations (id, department_id, shift_id, academic_year, semester, status, created_by, quality_score, conflict_count, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, department_id, shift_id, academic_year, semester, status, created_by, created_at, updated_at, quality_score, conflict_count, notes, published_at, valid_from, valid_until`,
      [
        randomUUID(),
        payload.departmentId,
        payload.shiftId,
        payload.academicYear,
        payload.semester,
        payload.status ?? "DRAFT",
        payload.createdBy,
        payload.qualityScore ?? null,
        payload.conflictCount ?? null,
        payload.notes ?? null
      ]
    );
    return mapTimetableGeneration(result.rows[0]);
  },

  async getTimetable(id: string): Promise<TimetableGeneration | null> {
    const result = await db.query(
      `SELECT id, department_id, shift_id, academic_year, semester, status, created_by, created_at, updated_at, quality_score, conflict_count, notes, published_at, valid_from, valid_until
       FROM timetable_generations WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? mapTimetableGeneration(result.rows[0]) : null;
  },

  async listTimetables(departmentId?: string, shiftId?: string, status?: string): Promise<TimetableGeneration[]> {
    let query = `SELECT id, department_id, shift_id, academic_year, semester, status, created_by, created_at, updated_at, quality_score, conflict_count, notes, published_at, valid_from, valid_until FROM timetable_generations`;
    const params: string[] = [];
    const conditions: string[] = [];

    if (departmentId) {
      conditions.push(`department_id = $${params.length + 1}`);
      params.push(departmentId);
    }
    if (shiftId) {
      conditions.push(`shift_id = $${params.length + 1}`);
      params.push(shiftId);
    }
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);
    return result.rows.map(mapTimetableGeneration);
  },

  async updateTimetableStatus(id: string, status: string, notes?: string): Promise<TimetableGeneration | null> {
    const result = await db.query(
      `UPDATE timetable_generations SET status = $1, updated_at = NOW(), notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING id, department_id, shift_id, academic_year, semester, status, created_by, created_at, updated_at, quality_score, conflict_count, notes, published_at, valid_from, valid_until`,
      [status, notes || null, id]
    );
    return result.rows.length > 0 ? mapTimetableGeneration(result.rows[0]) : null;
  },

  async publishTimetable(id: string, validFrom: string, validUntil: string): Promise<TimetableGeneration | null> {
    const result = await db.query(
      `UPDATE timetable_generations SET status = $1, published_at = NOW(), valid_from = $2, valid_until = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, department_id, shift_id, academic_year, semester, status, created_by, created_at, updated_at, quality_score, conflict_count, notes, published_at, valid_from, valid_until`,
      ["PUBLISHED", validFrom, validUntil, id]
    );
    return result.rows.length > 0 ? mapTimetableGeneration(result.rows[0]) : null;
  },

  async createScheduledClass(payload: Omit<ScheduledClass, "id" | "createdAt">): Promise<ScheduledClass> {
    const result = await db.query(
      `INSERT INTO scheduled_classes (id, timetable_id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, is_tentative)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, timetable_id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, is_tentative, created_at`,
      [
        randomUUID(),
        payload.timetableId,
        payload.batchId,
        payload.subjectId,
        payload.facultyId,
        payload.classroomId,
        payload.dayOfWeek,
        payload.startTime,
        payload.endTime,
        payload.classType,
        payload.isTentative
      ]
    );
    return mapScheduledClass(result.rows[0]);
  },

  async bulkCreateScheduledClasses(classes: Omit<ScheduledClass, "id" | "createdAt">[]): Promise<ScheduledClass[]> {
    if (classes.length === 0) return [];

    const values = classes
      .map(
        (c, i) =>
          `('${randomUUID()}', '${c.timetableId}', '${c.batchId}', '${c.subjectId}', '${c.facultyId}', '${c.classroomId}', '${c.dayOfWeek}', '${c.startTime}', '${c.endTime}', '${c.classType}', ${c.isTentative})`
      )
      .join(",");

    const result = await db.query(
      `INSERT INTO scheduled_classes (id, timetable_id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, is_tentative)
       VALUES ${values}
       RETURNING id, timetable_id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, is_tentative, created_at`
    );
    return result.rows.map(mapScheduledClass);
  },

  async getScheduledClassesForTimetable(timetableId: string): Promise<ScheduledClass[]> {
    const result = await db.query(
      `SELECT id, timetable_id, batch_id, subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time, class_type, is_tentative, created_at
       FROM scheduled_classes WHERE timetable_id = $1 ORDER BY day_of_week, start_time`,
      [timetableId]
    );
    return result.rows.map(mapScheduledClass);
  },

  async createApprovalWorkflow(timetableId: string): Promise<ApprovalWorkflow> {
    const result = await db.query(
      `INSERT INTO approval_workflows (id, timetable_id, status)
       VALUES ($1, $2, $3)
       RETURNING id, timetable_id, status, current_reviewer_id, rejection_reason, created_at, updated_at, completed_at`,
      [randomUUID(), timetableId, "PENDING"]
    );
    return mapApprovalWorkflow(result.rows[0]);
  },

  async getApprovalWorkflow(timetableId: string): Promise<ApprovalWorkflow | null> {
    const result = await db.query(
      `SELECT id, timetable_id, status, current_reviewer_id, rejection_reason, created_at, updated_at, completed_at
       FROM approval_workflows WHERE timetable_id = $1`,
      [timetableId]
    );
    return result.rows.length > 0 ? mapApprovalWorkflow(result.rows[0]) : null;
  },

  async updateWorkflowStatus(workflowId: string, status: string, reviewerId?: string, rejectionReason?: string): Promise<ApprovalWorkflow | null> {
    const result = await db.query(
      `UPDATE approval_workflows 
       SET status = $1, current_reviewer_id = COALESCE($2, current_reviewer_id), rejection_reason = COALESCE($3, rejection_reason), updated_at = NOW()
       WHERE id = $4
       RETURNING id, timetable_id, status, current_reviewer_id, rejection_reason, created_at, updated_at, completed_at`,
      [status, reviewerId || null, rejectionReason || null, workflowId]
    );
    return result.rows.length > 0 ? mapApprovalWorkflow(result.rows[0]) : null;
  },

  async addApprovalHistoryEntry(workflowId: string, reviewerId: string, action: string, comment?: string): Promise<ApprovalHistoryEntry> {
    const result = await db.query(
      `INSERT INTO approval_history (id, workflow_id, reviewer_id, action, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, workflow_id, reviewer_id, action, comment, timestamp`,
      [randomUUID(), workflowId, reviewerId, action, comment || null]
    );
    return mapApprovalHistoryEntry(result.rows[0]);
  },

  async getApprovalHistory(workflowId: string): Promise<ApprovalHistoryEntry[]> {
    const result = await db.query(
      `SELECT id, workflow_id, reviewer_id, action, comment, timestamp FROM approval_history
       WHERE workflow_id = $1 ORDER BY timestamp DESC`,
      [workflowId]
    );
    return result.rows.map(mapApprovalHistoryEntry);
  }
};
