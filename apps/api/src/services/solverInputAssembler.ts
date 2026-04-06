import { repository } from "../db/repository.js";

export interface SolverInputData {
  department: {
    id: string;
    name: string;
  };
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  batches: Array<{
    id: string;
    name: string;
    studentCount: number;
    shiftId: string;
  }>;
  classrooms: Array<{
    id: string;
    name: string;
    capacity: number;
    isLab: boolean;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    theoryHours: number;
    practicalHours: number;
  }>;
  facultyMembers: Array<{
    id: string;
    specialization?: string;
    teachingLoadMax: number;
  }>;
  availability: Array<{
    facultyId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    type: "AVAILABLE" | "NOT_AVAILABLE" | "PREFER_NOT";
  }>;
  fixedClasses: Array<{
    batchId: string;
    subjectId: string;
    facultyId: string;
    classroomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    type: "LECTURE" | "PRACTICAL";
    locked: boolean;
  }>;
}

export const assembleSolverInput = async (
  departmentId: string,
  shiftId: string,
  semester: number,
  academicYear: string
): Promise<SolverInputData> => {
  // Fetch all required data in parallel
  const [departments, shifts, batches, classrooms, subjects, faculty, availability, fixedClasses] =
    await Promise.all([
      repository.listDepartments(),
      repository.listShifts(),
      repository.listBatches(departmentId, shiftId),
      repository.listClassrooms(),
      repository.listSubjects(),
      repository.listFaculty(departmentId),
      repository.listFacultyAvailability(),
      repository.listFixedClasses()
    ]);

  const department = departments.find((d) => d.id === departmentId);
  if (!department) {
    throw new Error(`Department ${departmentId} not found`);
  }

  const shift = shifts.find((s) => s.id === shiftId);
  if (!shift) {
    throw new Error(`Shift ${shiftId} not found`);
  }

  // Filter batches to only those matching department, shift, semester, and academic year
  const filteredBatches = batches.filter(
    (b) => b.departmentId === departmentId && b.shiftId === shiftId && b.semester === semester && b.academicYear === academicYear
  );

  // Get program IDs for subjects filtering
  const programIds = new Set(filteredBatches.map((b) => b.programId));

  // Filter subjects for the relevant programs and semester
  const filteredSubjects = subjects.filter((s) => programIds.has(s.programId) && s.semester === semester);

  // Filter classrooms to the department
  const deptClassrooms = classrooms.filter((c) => c.departmentId === departmentId);

  // Filter faculty to the department
  const deptFaculty = faculty;

  // Filter availability to only department faculty
  const deptFacultyIds = new Set(deptFaculty.map((f) => f.id));
  const deptAvailability = availability.filter((a) => deptFacultyIds.has(a.facultyId));

  // Filter fixed classes to the department's batches
  const batchIds = new Set(filteredBatches.map((b) => b.id));
  const deptFixedClasses = fixedClasses.filter((fc) => batchIds.has(fc.batchId));

  return {
    department: {
      id: department.id,
      name: department.name
    },
    shift: {
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime
    },
    batches: filteredBatches.map((b) => ({
      id: b.id,
      name: b.name,
      studentCount: b.studentCount,
      shiftId: b.shiftId
    })),
    classrooms: deptClassrooms.map((c) => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      isLab: c.isLab
    })),
    subjects: filteredSubjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      theoryHours: s.theoryHours,
      practicalHours: s.practicalHours
    })),
    facultyMembers: deptFaculty.map((f) => ({
      id: f.id,
      specialization: f.specialization,
      teachingLoadMax: f.teachingLoadMax
    })),
    availability: deptAvailability.map((a) => ({
      facultyId: a.facultyId,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      type: a.availabilityType
    })),
    fixedClasses: deptFixedClasses.map((fc) => ({
      batchId: fc.batchId,
      subjectId: fc.subjectId,
      facultyId: fc.facultyId,
      classroomId: fc.classroomId,
      dayOfWeek: fc.dayOfWeek,
      startTime: fc.startTime,
      endTime: fc.endTime,
      type: fc.classType,
      locked: fc.locked
    }))
  };
};
