import { config } from "../config.js";
import { OptimizeRequest } from "../types.js";
import { SolverInputData } from "./solverInputAssembler.js";

interface SolverResponse {
  runId: string;
  score: number;
  conflicts: number;
  options: Array<{
    optionId: string;
    score: number;
    summary: string;
  }>;
}

interface EnrichedOptimizeRequest extends OptimizeRequest {
  solverInput?: SolverInputData;
}

export const requestOptimization = async (payload: EnrichedOptimizeRequest): Promise<SolverResponse> => {
  const response = await fetch(`${config.solverBaseUrl}/optimize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Solver request failed: ${response.status} ${text}`);
  }

  return (await response.json()) as SolverResponse;
};
