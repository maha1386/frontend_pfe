import { UserDashboard } from '../types/dashboard.types'

const API_URL = "http://127.0.0.1:8000/api"

const roleEndpointMap: Record<string, string> = {
  rh:                  "/dashboard/rh",
  manager:             "/dashboard/manager",
  new_collaborateur:   "/dashboard/collaborateur",
}

export const dashboardService = {
  async getDashboard(): Promise<UserDashboard> {
    const token = localStorage.getItem("token")
    const role  = localStorage.getItem("role") ?? ""

    const endpoint = roleEndpointMap[role] ?? "/dashboard/collaborateur"

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error("Erreur lors du chargement du dashboard")

    const data = await res.json()
    return data
  }
}