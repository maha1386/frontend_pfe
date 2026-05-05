import { useState, useEffect } from 'react'
import { dashboardService } from '../service/dashboard.service'
import { UserDashboard } from '../types/dashboard.types'

export function useDashboard() {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const data = await dashboardService.getDashboard()
        setDashboard(data)
      } catch (err: any) {
        setError(err.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  return { dashboard, loading, error }
}