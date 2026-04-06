import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { repository } from "../db/repository.js";

interface CreateDepartmentBody {
  name?: string;
  code?: string;
}

interface CreateClassroomBody {
  name?: string;
  capacity?: number;
  departmentId?: string;
  isLab?: boolean;
}

export const masterRouter = Router();

masterRouter.get("/departments", requireAuth(["ADMIN", "COORDINATOR"]), async (_req, res) => {
  const items = await repository.listDepartments();
  res.json({ items });
});

masterRouter.post("/departments", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const body = req.body as CreateDepartmentBody;
  if (!body.name || !body.code) {
    res.status(400).json({ error: "name and code are required" });
    return;
  }

  try {
    const created = await repository.createDepartment(body.name, body.code);
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: "Department code must be unique" });
  }
});

masterRouter.get("/classrooms", requireAuth(["ADMIN", "COORDINATOR"]), async (_req, res) => {
  const items = await repository.listClassrooms();
  res.json({ items });
});

masterRouter.post("/classrooms", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const body = req.body as CreateClassroomBody;
  if (!body.name || !body.departmentId || !body.capacity) {
    res.status(400).json({ error: "name, departmentId and capacity are required" });
    return;
  }

  try {
    const created = await repository.createClassroom({
      name: body.name,
      departmentId: body.departmentId,
      capacity: body.capacity,
      isLab: Boolean(body.isLab)
    });

    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: "Unable to create classroom. Ensure departmentId exists." });
  }
});
