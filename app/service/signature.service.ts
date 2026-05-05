// services/signature.service.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignatureStatus {
  has_signature: boolean;
  signature_path: string | null;
}

export interface TokenResponse {
  token: string;
  url: string;
}

// ─── Générer token QR (collaborateur connecté) ────────────────────────────────

export async function genererToken(): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/signature/token`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return await res.json();
}

// ─── Vérifier token (mobile) ──────────────────────────────────────────────────

export async function verifierToken(token: string) {
  const res = await fetch(`${API_BASE}/sign/${token}`);
  if (!res.ok) throw new Error("Token invalide ou expiré");
  return await res.json();
}

// ─── Enregistrer signature (mobile) ──────────────────────────────────────────

export async function enregistrerSignature(token: string, signatureBase64: string) {
  const res = await fetch(`${API_BASE}/sign/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signature: signatureBase64 }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? "Erreur lors de l'enregistrement");
  }
  return await res.json();
}

// ─── Statut signature collaborateur connecté ──────────────────────────────────

export async function getSignatureStatus(): Promise<SignatureStatus> {
  const res = await fetch(`${API_BASE}/signature/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return await res.json();
}

// ─── Signer un document ───────────────────────────────────────────────────────

export async function signerDocument(documentId: number) {
  const res = await fetch(`${API_BASE}/signature/signer/${documentId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? "Erreur lors de la signature");
  }
  return await res.json();
}