"use client"

import { Overview } from "../../../components/Dashboard/Overview"
import { useDashboard } from "../../hook/useDashboard"

export default function DashboardPage() {
  const { dashboard, loading, error } = useDashboard()

  if (loading) return <p className="text-center mt-10">Chargement...</p>
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>
  if (!dashboard) return <p className="text-center mt-10">Aucune donnée disponible</p>

  return <Overview dashboard={dashboard} />
}