"use client";

import { IntegrationPlanComponent } from "../../../components/Integration/Integration";
import { useMyIntegrationPlan } from "../../hook/useMyIntegrationPlan";

export default function IntegrationPlanPage() {
  const { plan, loading, error } = useMyIntegrationPlan();

  if (loading) {
    return <p className="text-center mt-10">Chargement du plan d'intégration...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">Erreur : {error}</p>;
  }

  if (!plan) {
    return <p className="text-center mt-10">Aucun plan d'intégration disponible</p>;
  }

  return <IntegrationPlanComponent plan={plan} />;
}