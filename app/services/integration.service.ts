// app/services/integration.service.ts

import { IntegrationPlanResponse, TaskStatus } from "../types/integration.types";
export type { TaskStatus };

const API_URL = "http://localhost:8000/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function getAuthHeadersMultipart(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    // Pas de Content-Type → browser gère le boundary multipart
  };
}

// ── GET /api/my/integration-plan ─────────────────────────────
export async function getMyIntegrationPlan(): Promise<IntegrationPlanResponse> {
  const res = await fetch(`${API_URL}/my/integration-plan`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

// ── PATCH /api/my/tasks/{task} ───────────────────────────────
export async function updateMyTask(
  taskId: number,
  status: TaskStatus
): Promise<void> {
  const res = await fetch(`${API_URL}/my/tasks/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur ${res.status}`);
  }
}

// ── POST /api/my/tasks/{task}/comments ───────────────────────
export async function addTaskComment(
  taskId: number,
  payload: { content?: string; link?: string; attachment?: File }
): Promise<void> {
  const form = new FormData();
  if (payload.content)    form.append("content", payload.content);
  if (payload.link)       form.append("link", payload.link);
  if (payload.attachment) form.append("attachment", payload.attachment);

  const res = await fetch(`${API_URL}/my/tasks/${taskId}/comments`, {
    method: "POST",
    headers: getAuthHeadersMultipart(),
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur ${res.status}`);
  }
}

// ── DELETE /api/my/comments/{comment} ────────────────────────
export async function deleteTaskComment(commentId: number): Promise<void> {
  const res = await fetch(`${API_URL}/my/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur ${res.status}`);
  }
}