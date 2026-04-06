from ortools.sat.python import cp_model
from typing import List, Dict, Tuple
from datetime import datetime, time, timedelta


class TimetableOptimizer:
    def __init__(self, solver_input):
        self.input = solver_input
        self.model = cp_model.CpModel()
        self.variables = {}
        self.assignments = []

    def _time_to_minutes(self, time_str: str) -> int:
        """Convert HH:MM to minutes since midnight."""
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    def _times_overlap(self, start1: str, end1: str, start2: str, end2: str) -> bool:
        """Check if two time slots overlap."""
        start1_min = self._time_to_minutes(start1)
        end1_min = self._time_to_minutes(end1)
        start2_min = self._time_to_minutes(start2)
        end2_min = self._time_to_minutes(end2)
        return not (end1_min <= start2_min or end2_min <= start1_min)

    def _get_days_in_range(self, day_start: str, day_end: str) -> List[str]:
        """Get days between day_start and day_end."""
        days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
        start_idx = days.index(day_start)
        end_idx = days.index(day_end)

        if start_idx <= end_idx:
            return days[start_idx : end_idx + 1]
        else:
            return days[start_idx:] + days[: end_idx + 1]

    def add_fixed_classes(self):
        """Add fixed classes as already scheduled."""
        for fixed in self.input.fixedClasses:
            self.assignments.append(
                {
                    "batch_id": fixed.batchId,
                    "subject_id": fixed.subjectId,
                    "faculty_id": fixed.facultyId,
                    "classroom_id": fixed.classroomId,
                    "day_of_week": fixed.dayOfWeek,
                    "start_time": fixed.startTime,
                    "end_time": fixed.endTime,
                    "class_type": fixed.type,
                    "tentative": False,
                }
            )

    def add_constraints(self):
        """Add optimization constraints to the model."""
        days_available = self._get_days_in_range(self.input.shift.dayStart, self.input.shift.dayEnd)

        # Helper to get available time slots for each day (within shift)
        shift_start_min = self._time_to_minutes(self.input.shift.startTime)
        shift_end_min = self._time_to_minutes(self.input.shift.endTime)

        # Generate possible time slots (e.g., hourly slots)
        time_slots = []
        current = shift_start_min
        slot_duration = 60  # 1 hour slots
        while current + slot_duration <= shift_end_min:
            start_h, start_m = divmod(current, 60)
            end_h, end_m = divmod(current + slot_duration, 60)
            time_slots.append((f"{start_h:02d}:{start_m:02d}", f"{end_h:02d}:{end_m:02d}"))
            current += slot_duration

        # Collect faculty and classroom constraints
        faculty_availability = {}
        for avail in self.input.availability:
            if avail.facultyId not in faculty_availability:
                faculty_availability[avail.facultyId] = []
            faculty_availability[avail.facultyId].append(avail)

        # For each subject, schedule required classes
        subject_by_id = {s.id: s for s in self.input.subjects}
        batch_by_id = {b.id: b for b in self.input.batches}
        faculty_by_id = {f.id: f for f in self.input.facultyMembers}
        classroom_by_id = {c.id: c for c in self.input.classrooms}

        # Pair each subject with available batches and faculty
        for batch in self.input.batches:
            if batch.id not in batch_by_id:
                continue

            # Get subjects for this batch's program
            subjects_for_batch = [s for s in self.input.subjects if s.id in [b.subjectId for b in self.input.batches]]

            for subject in subjects_for_batch:
                subject_obj = subject_by_id.get(subject.id)
                if not subject_obj:
                    continue

                # Get faculty members who can teach this subject (simplified: any faculty)
                available_faculty = [f for f in self.input.facultyMembers if f.id in faculty_by_id]

                for faculty in available_faculty:
                    # Try to schedule theory and practical sessions
                    for slot in time_slots:
                        for day in days_available:
                            # Check classroom capacity
                            available_classrooms = [
                                c for c in self.input.classrooms if c.capacity >= batch.studentCount
                            ]

                            if not available_classrooms:
                                continue

                            for classroom in available_classrooms:
                                # Check faculty availability
                                is_available = True
                                for avail in faculty_availability.get(faculty.id, []):
                                    if avail.dayOfWeek == day and avail.type == "NOT_AVAILABLE":
                                        if self._times_overlap(slot[0], slot[1], avail.startTime, avail.endTime):
                                            is_available = False
                                            break

                                if is_available:
                                    # Check for classroom conflicts
                                    classroom_conflict = False
                                    for assigned in self.assignments:
                                        if (
                                            assigned["classroom_id"] == classroom.id
                                            and assigned["day_of_week"] == day
                                            and self._times_overlap(
                                                slot[0], slot[1], assigned["start_time"], assigned["end_time"]
                                            )
                                        ):
                                            classroom_conflict = True
                                            break

                                    if not classroom_conflict:
                                        # Schedule the class
                                        self.assignments.append(
                                            {
                                                "batch_id": batch.id,
                                                "subject_id": subject.id,
                                                "faculty_id": faculty.id,
                                                "classroom_id": classroom.id,
                                                "day_of_week": day,
                                                "start_time": slot[0],
                                                "end_time": slot[1],
                                                "class_type": "LECTURE",
                                                "tentative": True,
                                            }
                                        )
                                        break  # Move to next subject

    def solve(self) -> Tuple[bool, List[Dict]]:
        """Solve the timetable optimization problem."""
        # For now, we'll use constraint validation and heuristic scheduling
        # Full OR-Tools integration would use the CP model above

        self.add_fixed_classes()
        self.add_constraints()

        return True, self.assignments

    def generate_variants(self, num_variants: int = 3) -> List[List[Dict]]:
        """Generate multiple timetable variants."""
        variants = []
        for _ in range(num_variants):
            success, assignment = self.solve()
            if success:
                variants.append(assignment)
        return variants
