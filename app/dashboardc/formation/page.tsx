"use client";

import { Formations } from "../../../components/Formation/Formations";
import { useFormations } from "../../hook/useFormations";

export default function FormationsPage() {
  const { formations, loading, error } = useFormations();

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  if (!formations || formations.length === 0) {
    return <p className="text-center mt-10">Aucune formation disponible</p>;
  }

  return <Formations formations={formations} />;
}