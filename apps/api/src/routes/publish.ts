import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { exportService } from "../services/exportService.js";

export const publishRouter = Router();

// Export timetable as JSON
publishRouter.get("/:timetableId/export/json", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  try {
    const context = await exportService.buildExportContext(req.params.timetableId);
    const json = exportService.generateJSON(context);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="timetable-${req.params.timetableId}.json"`);
    res.send(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    res.status(400).json({ error: message });
  }
});

// Export timetable as HTML
publishRouter.get("/:timetableId/export/html", requireAuth(["ADMIN", "COORDINATOR"]), async (req, res) => {
  try {
    const context = await exportService.buildExportContext(req.params.timetableId);
    const html = exportService.generateHTML(context);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename="timetable-${req.params.timetableId}.html"`);
    res.send(html);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    res.status(400).json({ error: message });
  }
});

// Publish timetable to college website (placeholder)
publishRouter.post("/:timetableId/publish", requireAuth(["ADMIN"]), async (req, res) => {
  const { collegeWebsiteUrl } = req.body;

  if (!collegeWebsiteUrl) {
    res.status(400).json({ error: "collegeWebsiteUrl is required" });
    return;
  }

  try {
    const context = await exportService.buildExportContext(req.params.timetableId);
    const html = exportService.generateHTML(context);

    // In a real implementation, this would push to the college website
    // For now, we mock the publishing
    res.json({
      status: "published",
      timetableId: req.params.timetableId,
      url: `${collegeWebsiteUrl}/timetables/${req.params.timetableId}`,
      format: "html",
      publishedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publishing failed";
    res.status(400).json({ error: message });
  }
});
