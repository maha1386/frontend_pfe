"use client"

import { Overview } from "../../components/Dashboard/Overview"
import { useDashboardCollab } from "../hooks/dashboard/useDashboardCollaborateur"

export default function DashboardPage() {
  const { data, loading, error } = useDashboardCollab()

  if (loading) return <p className="text-center mt-10">Chargement...</p>
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>
  if (!data) return <p className="text-center mt-10">Aucune donnée disponible</p>

  return <Overview dashboard={data} />
}