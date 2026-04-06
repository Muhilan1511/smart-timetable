import { db } from "./client.js";

const schemaSql = `
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_lab BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_availability (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  availability_type TEXT NOT NULL CHECK (availability_type IN ('AVAILABLE', 'NOT_AVAILABLE', 'PREFER_NOT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixed_classes (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('LECTURE', 'PRACTICAL')),
  locked BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day_start TEXT NOT NULL,
  day_end TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  duration_years INTEGER NOT NULL CHECK (duration_years > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 12),
  student_count INTEGER NOT NULL CHECK (student_count > 0),
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, academic_year, semester, shift_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  credits DECIMAL(4,2) NOT NULL CHECK (credits > 0),
  semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 12),
  theory_hours INTEGER NOT NULL CHECK (theory_hours >= 0),
  practical_hours INTEGER NOT NULL CHECK (practical_hours >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, code, semester)
);

CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  specialization TEXT,
  qualification TEXT,
  teaching_load_max INTEGER NOT NULL DEFAULT 24 CHECK (teaching_load_max > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_generations (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 12),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COORD_REVIEW', 'ADMIN_APPROVED', 'PUBLISHED')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  quality_score DECIMAL(5,2),
  conflict_count INTEGER,
  notes TEXT,
  published_at TIMESTAMPTZ,
  valid_from DATE,
  valid_until DATE,
  UNIQUE(department_id, shift_id, academic_year, semester, status)
);

CREATE TABLE IF NOT EXISTS scheduled_classes (
  id TEXT PRIMARY KEY,
  timetable_id TEXT NOT NULL REFERENCES timetable_generations(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('LECTURE', 'PRACTICAL')),
  is_tentative BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_workflows (
  id TEXT PRIMARY KEY,
  timetable_id TEXT NOT NULL UNIQUE REFERENCES timetable_generations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COORD_REVIEW', 'ADMIN_REVIEW', 'APPROVED', 'REJECTED')),
  current_reviewer_id TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approval_history (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'RETURNED')),
  comment TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const initializeDatabase = async (): Promise<void> => {
  await db.query(schemaSql);
};
