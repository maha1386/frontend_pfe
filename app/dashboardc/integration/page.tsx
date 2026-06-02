"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { IntegrationPlanComponent } from "../../../components/Integration/Integration";
import { useMyIntegrationPlan } from "../../hooks/useMyIntegrationPlan";
import { AvisSection } from "../../../components/Integration/AvisSection";

export default function IntegrationPlanPage() {
  const { plan, loading, error, refetch } = useMyIntegrationPlan();
  const searchParams = useSearchParams();

  const taskId = searchParams.get("taskId")
    ? Number(searchParams.get("taskId"))
    : null;

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-20 gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Chargement du plan d'intégration...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center mt-20 gap-2 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center mt-20 text-gray-400 text-sm">
        Aucun plan d'intégration disponible.
      </div>
    );
  }

  return (
    <div>
      <IntegrationPlanComponent
        plan={plan}
        onRefresh={handleRefresh}
        highlightTaskId={taskId}
        avisSection={<AvisSection onboardingId={plan.id} />}
      />
    </div>
  );
}