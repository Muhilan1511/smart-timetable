from typing import Optional
from pydantic import BaseModel, Field


class OptimizeRequest(BaseModel):
    departmentId: str
    shiftId: str
    semester: int = Field(ge=1, le=12)
    academicYear: str
    optionsCount: int = Field(default=3, ge=1, le=5)


class BatchInfo(BaseModel):
    id: str
    name: str
    studentCount: int
    shiftId: str


class ClassroomInfo(BaseModel):
    id: str
    name: str
    capacity: int
    isLab: bool


class SubjectInfo(BaseModel):
    id: str
    name: str
    code: str
    theoryHours: int
    practicalHours: int


class FacultyInfo(BaseModel):
    id: str
    specialization: Optional[str] = None
    teachingLoadMax: int


class AvailabilityInfo(BaseModel):
    facultyId: str
    dayOfWeek: str
    startTime: str
    endTime: str
    type: str


class FixedClassInfo(BaseModel):
    batchId: str
    subjectId: str
    facultyId: str
    classroomId: str
    dayOfWeek: str
    startTime: str
    endTime: str
    type: str
    locked: bool


class DepartmentInfo(BaseModel):
    id: str
    name: str


class ShiftInfo(BaseModel):
    id: str
    name: str
    startTime: str
    endTime: str


class SolverInputData(BaseModel):
    department: DepartmentInfo
    shift: ShiftInfo
    batches: list[BatchInfo]
    classrooms: list[ClassroomInfo]
    subjects: list[SubjectInfo]
    facultyMembers: list[FacultyInfo]
    availability: list[AvailabilityInfo]
    fixedClasses: list[FixedClassInfo]


class EnrichedOptimizeRequest(OptimizeRequest):
    solverInput: Optional[SolverInputData] = None


class TimetableOption(BaseModel):
    optionId: str
    score: float
    summary: str


class OptimizeResponse(BaseModel):
    runId: str
    score: float
    conflicts: int
    options: list[TimetableOption]
