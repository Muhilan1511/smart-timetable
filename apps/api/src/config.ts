import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toNumber(process.env.API_PORT, 4000),
  jwtSecret: process.env.JWT_SECRET ?? "local_dev_secret",
  solverBaseUrl: process.env.SOLVER_BASE_URL ?? "http://localhost:8000",
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://scheduler:scheduler@localhost:5432/scheduler"
};
