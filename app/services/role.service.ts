// services/role.service.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: `Bearer ${token ?? ""}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

// Types

export interface Role {
  id: number;
  name: string;
}

export interface CreateRolePayload {
  name: string;
}

export interface UpdateRolePayload {
  name: string;
}

// GET /api/roles 

export async function getRoles(): Promise<Role[]> {
  const res = await fetch(`${API_BASE}/roles`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erreur ${res.status} : impossible de récupérer les rôles`);
  const data = await res.json();
  return Array.isArray(data.roles) ? data.roles : [];
}

// POST /api/roles 

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const res = await fetch(`${API_BASE}/roles`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 409) throw new Error(data.message ?? "Ce rôle existe déjà");
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
  return data.role;
}

//  PATCH /api/roles/role/:id 

export async function updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
  const res = await fetch(`${API_BASE}/roles/role/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 403) throw new Error(data.message ?? "Rôle protégé");
    if (res.status === 409) throw new Error(data.message ?? "Ce rôle existe déjà");
    throw new Error(data.message ?? `Erreur ${res.status}`);
  }
  return data.role;
}

// DELETE /api/roles/:id

export async function deleteRole(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 403) throw new Error(data.message ?? "Rôle protégé");
    if (res.status === 400) throw new Error(data.message ?? "Des collaborateurs utilisent ce rôle");
    throw new Error(data.message ?? `Erreur ${res.status}`);
  }
}