const API = process.env.NEXT_PUBLIC_API_URL;

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export interface AvisResult {
  success: boolean;
  eligible: boolean;
  rythme: "bon" | "moyen" | "lent";
  score_sante: number;
  message: string;
  avis?: {
    id: number;
    etoiles: number;
    commentaire: string | null;
    rythme: string;
    score_sante: number;
    eligible: boolean;
    envoye_ia: boolean;
  };
}

export interface AvisExistant {
  success: boolean;
  a_deja_soumis: boolean;
  avis: AvisResult["avis"] | null;
}

// ── Soumettre un avis ────────────────────────────────────────
export async function submitAvis(
  onboardingId: number,
  etoiles: number,
  commentaire: string
): Promise<AvisResult> {
  const res = await fetch(
    `${API}/collaborateurs/onboarding/${onboardingId}/avis`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ etoiles, commentaire }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Erreur lors de l'envoi");
  return data;
}

// ── Récupérer l'avis existant ────────────────────────────────
export async function getAvisExistant(
  onboardingId: number
): Promise<AvisExistant> {
  const res = await fetch(
    `${API}/collaborateurs/onboarding/${onboardingId}/avis`,
    { headers: getHeaders() }
  );
  if (!res.ok) return { success: false, a_deja_soumis: false, avis: null };
  return res.json();
}