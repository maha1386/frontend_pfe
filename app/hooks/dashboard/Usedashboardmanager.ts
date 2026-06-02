"use client";

import { useState, useEffect } from "react";

export interface DashboardStats {
  total_collaborateurs: number;
  collaborateurs_actifs: number;
  collaborateurs_inactifs: number;
  documents_en_attente: number;
  nouveaux_ce_mois: number;
}

export interface RepartitionRole {
  role: string;
  total: number;
}

export interface NouveauxParMois {
  mois: string;
  total: number;
}

export interface ActiviteItem {
  type: string;
  message: string;
  role?: string | null;
  date: string;
}

export type AlerteItem = {
  type: string;
  label: string;
  severity: "high" | "medium" | "low";
  user: string;
  detail: string;
};

export interface DashboardData {
  stats: DashboardStats;
  repartition_roles: RepartitionRole[];
  nouveaux_par_mois: NouveauxParMois[];
  activite_recente: ActiviteItem[];
  alertes_onboarding: AlerteItem[];
}

const API_URL = "http://127.0.0.1:8000/api";

async function fetchDashboardManager(): Promise<DashboardData> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/dashboard/manager`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Erreur ${res.status}`);
  }

  const json = await res.json();

  return {
    stats:              json.stats,
    repartition_roles:  json.repartition_roles,
    nouveaux_par_mois:  json.nouveaux_par_mois,
    activite_recente:   json.activite_recente,
    alertes_onboarding: json.alertes_onboarding,
  };
}

export function useDashboardManager() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardManager()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}