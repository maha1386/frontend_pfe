// services/notifications.service.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: `Bearer ${token ?? ""}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string; // UUID avec Laravel standard
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

// ─── GET /api/notifications ───────────────────────────────────────────────────

export async function getNotifications(): Promise<NotificationsResponse> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return {
    notifications: data.notifications,
    unread_count:  data.unread_count,
  };
}

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────

export async function marquerCommeLue(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
}

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────

export async function marquerToutesCommeLues(): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
}

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────

export async function supprimerNotification(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
}