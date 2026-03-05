// services/collaborateur.service.ts

import { Collaborateur } from "../types/collaborateur.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export interface CollaborateursResponse {
  data: Collaborateur[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

export interface CreateCollaborateurPayload {
  last_name: string;
  first_name: string;
  email: string;
  phone_number: string;
  date_of_hire: string;
  role: string;

}

export interface CreateCollaborateurResponse {
  message: string;
  user: {
    email: string;
    password_temporaire: string;
  };
}
export interface Role {
  id: number;
  name: string;
}
export interface CollaborateurDetail {
  id: number;
  last_name: string;
  first_name: string;
  email: string;
  phone_number: string;
  date_of_hire: string;
  active: boolean;
  role: string;
}
export async function getCollaborateurById(id: number): Promise<CollaborateurDetail> {
  const res = await fetch(`${API_BASE}/collaborateurs/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status} : collaborateur introuvable`);
  const data = await res.json();
  return data.collaborateur;
}

export async function getRoles(): Promise<Role[]> {
  const res = await fetch(`${API_BASE}/roles`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erreur ${res.status} : impossible de récupérer les rôles`);
  
  const data = await res.json();

  console.log("roles backend :", data);

  // sécurité : si data.roles n'est pas un array, retourne un tableau vide
  return Array.isArray(data.roles) ? data.roles : [];
}
// GET /api/collaborateurs
export async function getCollaborateurs(page = 1): Promise<CollaborateursResponse> {
  const res = await fetch(`${API_BASE}/collaborateurs?page=${page}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status} : impossible de récupérer les collaborateurs`);
  const json = await res.json();
  const p = json.collaborateurs;
  return {
    data: p.data,
    current_page: p.current_page,
    last_page: p.last_page,
    total: p.total,
    from: p.from,
    to: p.to,
  };
}
// POST /api/collaborateurs
export async function createCollaborateur(
  payload: CreateCollaborateurPayload
): Promise<CreateCollaborateurResponse> {
  const res = await fetch(`${API_BASE}/collaborateurs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 422 && data.errors) {
      const error = new Error("Validation échouée") as Error & {
        validationErrors: Record<string, string>;
      };
      error.validationErrors = Object.fromEntries(
        Object.entries(data.errors).map(([key, val]) => [key, (val as string[])[0]])
      );
      throw error;
    }
    throw new Error(data.message ?? `Erreur ${res.status}`);
  }
  return data;
}

// PATCH /api/staff/:id/toggle-active
export async function toggleCollaborateurActive(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/staff/${id}/toggle-active`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? `Erreur ${res.status}`);
  }
}