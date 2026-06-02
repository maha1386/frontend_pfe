// app/services/formation.service.ts

import { FormationApi } from "../types/formation.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function getMyFormations(): Promise<FormationApi[]> {
  const res = await fetch(`${API_URL}/my/formations`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message ?? `Erreur ${res.status} : chargement formations`);
  }

  const data = await res.json();
  return data.data as FormationApi[];
}