"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { IntegrationPlanComponent } from "../../../components/Integration/Integration";
import { useMyIntegrationPlan } from "../../hooks/useMyIntegrationPlan";

export default function IntegrationPlanPage() {
  const { plan, loading, error, refetch } = useMyIntegrationPlan();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId")
    ? Number(searchParams.get("taskId"))
    : null;

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 60, color: "#6b7280" }}>
      Chargement du plan d'intégration...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", marginTop: 60, color: "#dc2626" }}>
      Erreur : {error}
    </div>
  );

  if (!plan) return (
    <div style={{ textAlign: "center", marginTop: 60, color: "#6b7280" }}>
      Aucun plan d'intégration disponible.
    </div>
  );

  return (
    <IntegrationPlanComponent
      plan={plan}
      onRefresh={handleRefresh}
      highlightTaskId={taskId}
    />
  );
}