// services/messaging.service.ts

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

export interface ConversationParticipant {
  id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string;
}

export interface LastMessage {
  body: string;
  created_at: string;
  sender_id: number;
}

export interface Conversation {
  id: number;
  other: ConversationParticipant;
  last_message: LastMessage | null;
  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedMessages {
  data: Message[];
  current_page: number;
  last_page: number;
  total: number;
}
export interface CollaborateurSearch {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// ─── GET /api/messaging/unread-count ─────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/messaging/unread-count`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return data.unread ?? 0;
}

// ─── GET /api/messaging/conversations ────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/messaging/conversations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

// ─── POST /api/messaging/conversations ───────────────────────────────────────

export async function createConversation(collaborateurId?: number): Promise<{ conversation_id: number }> {
  const res = await fetch(`${API_BASE}/messaging/conversations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(collaborateurId ? { collaborateur_id: collaborateurId } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Erreur ${res.status}`);
  }
  return res.json();
}

// ─── GET /api/messaging/conversations/:id/messages ───────────────────────────

export async function getMessages(conversationId: number, page = 1): Promise<PaginatedMessages> {
  const res = await fetch(
    `${API_BASE}/messaging/conversations/${conversationId}/messages?page=${page}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

// ─── POST /api/messaging/conversations/:id/messages ──────────────────────────

export async function sendMessage(conversationId: number, body: string): Promise<Message> {
  const res = await fetch(`${API_BASE}/messaging/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}
export async function searchCollaborateurs(query: string): Promise<CollaborateurSearch[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const res = await fetch(
    `${API_BASE}/messaging/collaborateurs/search?q=${encodeURIComponent(query.trim())}`,
    {
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}