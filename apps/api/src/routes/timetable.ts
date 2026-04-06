import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { repository } from "../db/repository.js";
import { ScheduledClass } from "../types.js";

export const timetableRouter = Router();

// Get timetables
timetableRouter.get("/", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const departmentId = req.query.departmentId as string | undefined;
  const shiftId = req.query.shiftId as string | undefined;
  const status = req.query.status as string | undefined;

  const items = await repository.listTimetables(departmentId, shiftId, status);
  res.json({ items });
});

// Get single timetable
timetableRouter.get("/:id", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const timetable = await repository.getTimetable(req.params.id);
  if (!timetable) {
    res.status(404).json({ error: "Timetable not found" });
    return;
  }

  const scheduledClasses = await repository.getScheduledClassesForTimetable(timetable.id);
  const workflow = await repository.getApprovalWorkflow(timetable.id);

  res.json({
    timetable,
    scheduledClasses,
    workflow
  });
});

// Create timetable (after optimization)
timetableRouter.post("/", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { departmentId, shiftId, academicYear, semester, createdBy, qualityScore, conflictCount, scheduledClasses } = req.body;

  if (!departmentId || !shiftId || !academicYear || !semester || !createdBy) {
    res.status(400).json({ error: "departmentId, shiftId, academicYear, semester and createdBy are required" });
    return;
  }

  try {
    const timetable = await repository.createTimetable({
      departmentId,
      shiftId,
      academicYear,
      semester,
      createdBy,
      status: "DRAFT",
      qualityScore,
      conflictCount
    });

    // Create workflow immediately
    await repository.createApprovalWorkflow(timetable.id);

    // Bulk create scheduled classes if provided
    let classes: ScheduledClass[] = [];
    if (scheduledClasses && Array.isArray(scheduledClasses) && scheduledClasses.length > 0) {
      const classesWithTimetableId = scheduledClasses.map((c: any) => ({
        ...c,
        timetableId: timetable.id
      }));
      classes = await repository.bulkCreateScheduledClasses(classesWithTimetableId);
    }

    res.status(201).json({ timetable, classes });
  } catch (error) {
    res.status(400).json({ error: "Unable to create timetable" });
  }
});

// Update timetable status
timetableRouter.patch("/:id/status", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  const updated = await repository.updateTimetableStatus(req.params.id, status, notes);
  if (!updated) {
    res.status(404).json({ error: "Timetable not found" });
    return;
  }

  res.json(updated);
});

// Publish timetable
timetableRouter.post("/:id/publish", requireAuth(["ADMIN"]), async (req, res) => {
  const { validFrom, validUntil } = req.body;

  if (!validFrom || !validUntil) {
    res.status(400).json({ error: "validFrom and validUntil are required" });
    return;
  }

  const published = await repository.publishTimetable(req.params.id, validFrom, validUntil);
  if (!published) {
    res.status(404).json({ error: "Timetable not found" });
    return;
  }

  res.json(published);
});
