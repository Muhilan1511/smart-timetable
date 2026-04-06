import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { repository } from "../db/repository.js";

export const setupRouter = Router();

// Shifts
setupRouter.get("/shifts", requireAuth(["ADMIN", "COORDINATOR"]), async (_req, res) => {
  const items = await repository.listShifts();
  res.json({ items });
});

setupRouter.post("/shifts", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { name, startTime, endTime, dayStart, dayEnd } = req.body;
  if (!name || !startTime || !endTime || !dayStart || !dayEnd) {
    res.status(400).json({ error: "name, startTime, endTime, dayStart and dayEnd are required" });
    return;
  }

  try {
    const created = await repository.createShift({ name, startTime, endTime, dayStart, dayEnd });
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: "Shift name must be unique" });
  }
});

// Programs
setupRouter.get("/programs", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const departmentId = req.query.departmentId as string | undefined;
  const items = await repository.listPrograms(departmentId);
  res.json({ items });
});

setupRouter.post("/programs", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { name, code, departmentId, durationYears } = req.body;
  if (!name || !code || !departmentId || !durationYears) {
    res.status(400).json({ error: "name, code, departmentId and durationYears are required" });
    return;
  }

  try {
    const created = await repository.createProgram({ name, code, departmentId, durationYears });
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: "Program code must be unique" });
  }
});

// Batches
setupRouter.get("/batches", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const departmentId = req.query.departmentId as string | undefined;
  const shiftId = req.query.shiftId as string | undefined;
  const items = await repository.listBatches(departmentId, shiftId);
  res.json({ items });
});

setupRouter.post("/batches", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { name, programId, academicYear, semester, studentCount, departmentId, shiftId } = req.body;
  if (!name || !programId || !academicYear || !semester || !studentCount || !departmentId || !shiftId) {
    res.status(400).json({ error: "name, programId, academicYear, semester, studentCount, departmentId and shiftId are required" });
    return;
  }

  try {
    const created = await repository.createBatch({
      name,
      programId,
      academicYear,
      semester,
      studentCount,
      departmentId,
      shiftId
    });
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: "Batch already exists for this program/year/semester/shift combination" });
  }
});

// Subjects
setupRouter.get("/subjects", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const programId = req.query.programId as string | undefined;
  const semester = req.query.semester ? parseInt(req.query.semester as string) : undefined;
  const items = await repository.listSubjects(programId, semester);
  res.json({ items });
});

setupRouter.post("/subjects", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { name, code, programId, credits, semester, theoryHours, practicalHours } = req.body;
  if (!name || !code || !programId || !credits || !semester) {
    res.status(400).json({ error: "name, code, programId, credits and semester are required" });
    return;
  }

  try {
    const created = await repository.createSubject({
      name,
      code,
      programId,
      credits,
      semester,
      theoryHours: theoryHours || 0,
      practicalHours: practicalHours || 0
    });
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: "Subject code must be unique for this program and semester" });
  }
});

// Faculty
setupRouter.get("/faculty", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const departmentId = req.query.departmentId as string | undefined;
  const items = await repository.listFaculty(departmentId);
  res.json({ items });
});

setupRouter.post("/faculty", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { departmentId, specialization, qualification, teachingLoadMax } = req.body;
  if (!departmentId) {
    res.status(400).json({ error: "departmentId is required" });
    return;
  }

  try {
    const created = await repository.createFaculty({
      departmentId,
      specialization,
      qualification,
      teachingLoadMax: teachingLoadMax || 24
    });
    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: "Unable to create faculty. Ensure departmentId exists." });
  }
});
