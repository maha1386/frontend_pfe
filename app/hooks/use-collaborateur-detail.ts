// hooks/use-collaborateur-detail.ts

import { useState, useEffect } from "react";
import { getCollaborateurById, CollaborateurDetail } from "../services/collaborateur.service";

export function useCollaborateurDetail(id: number) {
  const [collaborateur, setCollaborateur] = useState<CollaborateurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getCollaborateurById(id)
      .then(setCollaborateur)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { collaborateur, loading, error };
}