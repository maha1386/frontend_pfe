// src/types/integration.ts

export type PhaseStatus = "not-started" | "in-progress" | "upcoming" | "completed";

export interface IntegrationTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface IntegrationPhase {
  phase: string;
  title: string;
  status: PhaseStatus;
  progress: number;
  tasks: IntegrationTask[];
}

export interface IntegrationPlan {
  user_id: number;
  phases: IntegrationPhase[];
}

// réponse API
export type IntegrationPlanResponse = IntegrationPlan;