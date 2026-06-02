const API = process.env.NEXT_PUBLIC_API_URL;

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export interface SuiviComment {
  id:               number;
  content:          string | null;
  user:             string;
  created_at:       string;
  link?:            string | null;
  has_attachment?:  boolean;
  download_url?:    string | null;
  attachment_name?: string | null;
}

export interface SuiviTask {
  id:             number;
  title:          string;
  status:         string;
  due_date:       string | null;
  day_name:       string;
  type:           string;
  onboarding_id:  number;
  collaborateur:  string;
  comments_count: number;
  comments:       SuiviComment[];
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

// ── Ajouter un commentaire sur une tâche de suivi ───────────
export async function addSuiviComment(
  taskId:      number,
  content?:    string,
  link?:       string,
  attachment?: File
): Promise<SuiviComment> {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  if (content)    formData.append("content",    content);
  if (link)       formData.append("link",       link);
  if (attachment) formData.append("attachment", attachment);

  const res = await fetch(`${API}/my/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Erreur");

  return {
    id:              data.data.id,
    content:         data.data.content         ?? null,
    user:            data.data.author?.name    ?? "—",
    created_at:      data.data.created_at,
    link:            data.data.link            ?? null,
    has_attachment:  data.data.has_attachment  ?? false,
    download_url:    data.data.download_url    ?? null,
    attachment_name: data.data.attachment_name ?? null,
  };
}

// ── Télécharger une pièce jointe avec token ──────────────────
export async function downloadAttachment(
  downloadUrl: string,
  fileName:    string
): Promise<void> {
  const token = localStorage.getItem("token");

  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });

  if (!res.ok) throw new Error("Impossible de télécharger le fichier");

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
export async function updateSuiviTaskStatus(
  taskId: number,
  status: string,
  rejectionReason?: string
): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Erreur");
}