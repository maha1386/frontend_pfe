// services/dashboard.service.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

//  Types 
export interface DashboardStats {
  total_collaborateurs: number;
  collaborateurs_actifs: number;
  collaborateurs_inactifs: number;
  documents_en_attente: number;
}

export interface RepartitionRole {
  role: string;
  total: number;
}

export interface NouveauxParMois {
  mois: string;
  total: number;
}

export interface ActiviteRecente {
  type: "collaborateur" | "document";
  message: string;
  role: string | null;
  date: string;
}

export interface DashboardData {
  stats: DashboardStats;
  repartition_roles: RepartitionRole[];
  nouveaux_par_mois: NouveauxParMois[];
  activite_recente: ActiviteRecente[];
}

//  GET /api/dashboard/stats 
export async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return await res.json();
}