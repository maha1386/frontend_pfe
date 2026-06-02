"use client";

import { Formations } from "../../../components/Formation/Formations";
import { useFormations } from "../../hooks/useFormations";

export default function FormationsPage() {
  const { formations, stats, current, certifications, loading, error } = useFormations();

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error)   return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <Formations
      formations={formations}
      stats={stats}
      current={current}
      certifications={certifications}
    />
  );
}