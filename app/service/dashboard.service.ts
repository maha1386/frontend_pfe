import { UserDashboard } from '../types/dashboard.types'

const API_URL = "http://127.0.0.1:8000/api"

export const dashboardService = {
  async getDashboard(): Promise<UserDashboard> {
    const token = localStorage.getItem("token")
    const res = await fetch(`${API_URL}/dashboard/collaborateur`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error("Erreur lors du chargement du dashboard")
    const data = await res.json()
    return data
  }
}