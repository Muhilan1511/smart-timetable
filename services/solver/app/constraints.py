from typing import Optional
from datetime import time


def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes since midnight."""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def times_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Check if two time slots overlap."""
    start1_min = time_to_minutes(start1)
    end1_min = time_to_minutes(end1)
    start2_min = time_to_minutes(start2)
    end2_min = time_to_minutes(end2)

    return not (end1_min <= start2_min or end2_min <= start1_min)


def validate_solver_input(data):
    """Validate the solver input data and return constraint violations."""
    violations = []

    # Check faculty availability conflicts
    for fixed_class in data.fixedClasses:
        faculty_id = fixed_class.facultyId
        class_day = fixed_class.dayOfWeek
        class_start = fixed_class.startTime
        class_end = fixed_class.endTime

        # Find availability constraints for this faculty
        faculty_avail = [
            a
            for a in data.availability
            if a.facultyId == faculty_id and a.dayOfWeek == class_day
        ]

        for avail in faculty_avail:
            if avail.type == "NOT_AVAILABLE":
                if times_overlap(class_start, class_end, avail.startTime, avail.endTime):
                    violations.append(
                        f"Faculty {faculty_id} not available for class on {class_day} {class_start}-{class_end}"
                    )

    # Check classroom capacity
    for fixed_class in data.fixedClasses:
        classroom = next(
            (c for c in data.classrooms if c.id == fixed_class.classroomId), None
        )
        batch = next((b for b in data.batches if b.id == fixed_class.batchId), None)

        if classroom and batch:
            if batch.studentCount > classroom.capacity:
                violations.append(
                    f"Batch {batch.name} ({batch.studentCount} students) exceeds classroom {classroom.name} capacity ({classroom.capacity})"
                )

    # Check for classroom double-booking
    for i, fc1 in enumerate(data.fixedClasses):
        for fc2 in data.fixedClasses[i + 1 :]:
            if (
                fc1.classroomId == fc2.classroomId
                and fc1.dayOfWeek == fc2.dayOfWeek
                and times_overlap(fc1.startTime, fc1.endTime, fc2.startTime, fc2.endTime)
            ):
                violations.append(
                    f"Classroom {fc1.classroomId} double-booked on {fc1.dayOfWeek} {fc1.startTime}-{fc1.endTime}"
                )

    return violations


def calculate_conflict_count(violations: list[str]) -> int:
    """Return the count of constraint violations."""
    return len(violations)
