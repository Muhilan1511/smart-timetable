import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { initializeDatabase } from "./db/init.js";
import { authRouter } from "./routes/auth.js";
import { constraintsRouter } from "./routes/constraints.js";
import { masterRouter } from "./routes/master.js";
import { optimizeRouter } from "./routes/optimize.js";
import { setupRouter } from "./routes/setup.js";
import { timetableRouter } from "./routes/timetable.js";
import { workflowRouter } from "./routes/workflow.js";
import { publishRouter } from "./routes/publish.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "scheduler-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/master", masterRouter);
app.use("/api/v1/constraints", constraintsRouter);
app.use("/api/v1/setup", setupRouter);
app.use("/api/v1/optimize", optimizeRouter);
app.use("/api/v1/timetables", timetableRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/timetables", publishRouter);

const start = async (): Promise<void> => {
  await initializeDatabase();
  app.listen(config.port, () => {
    console.log(`API server running on port ${config.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
