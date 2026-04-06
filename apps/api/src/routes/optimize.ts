import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requestOptimization } from "../services/solverClient.js";
import { assembleSolverInput } from "../services/solverInputAssembler.js";
import { OptimizeRequest } from "../types.js";

export const optimizeRouter = Router();

optimizeRouter.post("/", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const body = req.body as OptimizeRequest;

  if (!body.departmentId || !body.shiftId || !body.academicYear || body.semester === undefined) {
    res.status(400).json({
      error: "departmentId, shiftId, semester and academicYear are required"
    });
    return;
  }

  try {
    // Assemble rich solver input from database
    const solverInput = await assembleSolverInput(body.departmentId, body.shiftId, body.semester, body.academicYear);

    // Send to solver with full data context
    const solverResult = await requestOptimization({
      ...body,
      solverInput
    });

    res.status(202).json({
      status: "accepted",
      result: solverResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown optimization error";
    res.status(502).json({ error: message });
  }
});
