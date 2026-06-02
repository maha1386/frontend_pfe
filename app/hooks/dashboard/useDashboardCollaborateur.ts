"use client";

import { useState, useEffect } from "react";
import { UserDashboard } from "../../types/dashboard.types";

const API_URL = "http://127.0.0.1:8000/api";

async function fetchDashboardCollab(): Promise<UserDashboard> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/dashboard/collaborateur`, {
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

  return await res.json();
}

export function useDashboardCollab() {
  const [data, setData]       = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardCollab()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur inconnue"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}