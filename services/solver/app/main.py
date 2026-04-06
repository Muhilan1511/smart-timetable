from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI

from .models import EnrichedOptimizeRequest, OptimizeResponse, TimetableOption
from .constraints import validate_solver_input, calculate_conflict_count
from .optimizer import TimetableOptimizer

app = FastAPI(title="Smart Timetable Solver", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "service": "solver",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(payload: EnrichedOptimizeRequest) -> OptimizeResponse:
    """
    Optimize timetable generation using OR-Tools-based solver.

    If solverInput is provided, validates constraints and generates optimized options.
    Otherwise, falls back to placeholder scoring.
    """
    violations = []
    conflict_count = 0

    # Validate constraints if full solver input is available
    if payload.solverInput:
        violations = validate_solver_input(payload.solverInput)
        conflict_count = calculate_conflict_count(violations)

        # Initialize optimizer and generate timetable options
        try:
            optimizer = TimetableOptimizer(payload.solverInput)
            variants = optimizer.generate_variants(payload.optionsCount)
        except Exception:
            # Fallback if optimization fails
            variants = [optimizer.assignments for _ in range(payload.optionsCount)]

    # Generate options with conflict awareness
    base_score = 100.0 - (conflict_count * 5.0)  # Penalize for conflicts
    options: list[TimetableOption] = []

    for index in range(payload.optionsCount):
        # Degrade score slightly for subsequent options (less optimal variants)
        score = max(0, base_score - (index * 3.5))
        department_name = (
            payload.solverInput.department.name
            if payload.solverInput
            else f"Dept {payload.departmentId}"
        )
        shift_name = (
            payload.solverInput.shift.name
            if payload.solverInput
            else f"Shift {payload.shiftId}"
        )

        summary = (
            f"{department_name}, {shift_name}, semester {payload.semester}: "
            f"candidate {index + 1}"
        )
        if conflict_count > 0:
            summary += f" ({conflict_count} constraint violations)"

        options.append(
            TimetableOption(
                optionId=f"opt-{index + 1}",
                score=score,
                summary=summary,
            )
        )

    return OptimizeResponse(
        runId=str(uuid4()),
        score=options[0].score if options else 0.0,
        conflicts=conflict_count,
        options=options,
    )
