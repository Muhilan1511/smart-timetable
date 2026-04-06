import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { repository } from "../db/repository.js";

interface AddFacultyAvailabilityBody {
  facultyId?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  availabilityType?: "AVAILABLE" | "NOT_AVAILABLE" | "PREFER_NOT";
}

interface CreateFixedClassBody {
  batchId?: string;
  subjectId?: string;
  facultyId?: string;
  classroomId?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  classType?: "LECTURE" | "PRACTICAL";
  locked?: boolean;
}

export const constraintsRouter = Router();

constraintsRouter.get("/faculty-availability", requireAuth(["ADMIN", "COORDINATOR"]), async (_req, res) => {
  const items = await repository.listFacultyAvailability();
  res.json({ items });
});

constraintsRouter.post("/faculty-availability", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const body = req.body as AddFacultyAvailabilityBody;
  if (!body.facultyId || !body.dayOfWeek || !body.startTime || !body.endTime) {
    res.status(400).json({ error: "facultyId, dayOfWeek, startTime and endTime are required" });
    return;
  }

  const created = await repository.addFacultyAvailability({
    facultyId: body.facultyId,
    dayOfWeek: body.dayOfWeek,
    startTime: body.startTime,
    endTime: body.endTime,
    availabilityType: body.availabilityType ?? "AVAILABLE"
  });

  res.status(201).json(created);
});

constraintsRouter.get("/fixed-classes", requireAuth(["ADMIN", "COORDINATOR"]), async (_req, res) => {
  const items = await repository.listFixedClasses();
  res.json({ items });
});

constraintsRouter.post("/fixed-classes", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const body = req.body as CreateFixedClassBody;

  if (!body.batchId || !body.subjectId || !body.facultyId || !body.classroomId || !body.dayOfWeek || !body.startTime || !body.endTime) {
    res.status(400).json({ error: "batchId, subjectId, facultyId, classroomId, dayOfWeek, startTime and endTime are required" });
    return;
  }

  try {
    const created = await repository.createFixedClass({
      batchId: body.batchId,
      subjectId: body.subjectId,
      facultyId: body.facultyId,
      classroomId: body.classroomId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      classType: body.classType ?? "LECTURE",
      locked: body.locked ?? true
    });

    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: "Unable to create fixed class. Ensure classroomId exists." });
  }
});
