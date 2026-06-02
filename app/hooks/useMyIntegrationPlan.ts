// app/hooks/useMyIntegrationPlan.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { IntegrationPlanResponse } from "../types/integration.types";
import { getMyIntegrationPlan } from "../services/integration.service";

export function useMyIntegrationPlan() {
  const [plan, setPlan]       = useState<IntegrationPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyIntegrationPlan()
      .then(data  => { if (!cancelled) setPlan(data); })
      .catch(e    => { if (!cancelled) setError(e.message ?? "Erreur inconnue"); })
      .finally(   () => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  return { plan, loading, error, refetch };
}