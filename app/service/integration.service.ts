// src/services/integration.service.ts

import { IntegrationPlanResponse } from "../types/integration.types";

const API_URL = "http://localhost:8000/api";

export const getMyIntegrationPlan = async (): Promise<IntegrationPlanResponse> => {
  const res = await fetch(`${API_URL}/my-integration-plan`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement du plan d'intégration");
  }

  return res.json();
};