import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { repository } from "../db/repository.js";
import { AuthTokenPayload } from "../types.js";

type RequestWithUser = any;

export const workflowRouter = Router();

// Get workflow for timetable
workflowRouter.get("/:timetableId", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const workflow = await repository.getApprovalWorkflow(req.params.timetableId);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const history = await repository.getApprovalHistory(workflow.id);

  res.json({
    workflow,
    history
  });
});

// Submit for coordinator review
workflowRouter.post("/:timetableId/submit-review", requireAuth(["COORDINATOR"]), async (req, res) => {
  const workflow = await repository.getApprovalWorkflow(req.params.timetableId);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const user = (req as RequestWithUser).user as AuthTokenPayload;

  // Update workflow status
  const updated = await repository.updateWorkflowStatus(workflow.id, "COORD_REVIEW", user.sub);

  // Add history entry
  await repository.addApprovalHistoryEntry(workflow.id, user.sub, "SUBMITTED", req.body.comment);

  res.json(updated);
});

// Approve (admin action)
workflowRouter.post("/:timetableId/approve", requireAuth(["ADMIN"]), async (req, res) => {
  const workflow = await repository.getApprovalWorkflow(req.params.timetableId);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const user = (req as RequestWithUser).user as AuthTokenPayload;

  // Update workflow status
  const updated = await repository.updateWorkflowStatus(workflow.id, "APPROVED", user.sub);

  // Add history entry
  await repository.addApprovalHistoryEntry(workflow.id, user.sub, "APPROVED", req.body.comment);

  res.json(updated);
});

// Reject
workflowRouter.post("/:timetableId/reject", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: "reason is required" });
    return;
  }

  const workflow = await repository.getApprovalWorkflow(req.params.timetableId);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const user = (req as RequestWithUser).user as AuthTokenPayload;

  // Update workflow status
  const updated = await repository.updateWorkflowStatus(workflow.id, "REJECTED", user.sub, reason);

  // Add history entry
  await repository.addApprovalHistoryEntry(workflow.id, user.sub, "REJECTED", reason);

  res.json(updated);
});

// Return for rework
workflowRouter.post("/:timetableId/return", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: "reason is required" });
    return;
  }

  const workflow = await repository.getApprovalWorkflow(req.params.timetableId);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  const user = (req as RequestWithUser).user as AuthTokenPayload;

  // Update workflow status back to draft
  const updated = await repository.updateWorkflowStatus(workflow.id, "PENDING", user.sub);

  // Add history entry
  await repository.addApprovalHistoryEntry(workflow.id, user.sub, "RETURNED", reason);

  res.json(updated);
});
