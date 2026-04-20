"use client";

import { useState, useEffect } from "react";
import { IntegrationPlanResponse } from "../types/integration.types";
import { getMyIntegrationPlan } from "../service/integration.service";

// Hook personnalisé pour récupérer le plan d'intégration
export function useMyIntegrationPlan() {
  let [plan, setPlan] = useState<IntegrationPlanResponse | null>(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyIntegrationPlan()
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { plan, loading, error };
}