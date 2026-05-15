const API = process.env.NEXT_PUBLIC_API_URL;

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export interface SuiviComment {
  id: number;
  content: string;
  user: string;
  created_at: string;
}

export interface SuiviTask {
  id: number;
  title: string;
  status: string;
  due_date: string | null;
  day_name: string;
  type: string;
  onboarding_id: number;
  collaborateur: string;
  comments_count: number;
  comments: SuiviComment[];
}

// ── Récupérer mes tâches de suivi ────────────────────────────
export async function getMesSuivis(): Promise<SuiviTask[]> {
  const res = await fetch(`${API}/my/suivis`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Erreur de chargement");
  return data.data;
}