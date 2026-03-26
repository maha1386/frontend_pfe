// hooks/use-collaborateur-detail.ts

import { useState, useEffect, useCallback } from "react";
import { getCollaborateurById, CollaborateurDetail } from "../../services/collaborateur.service";

export function useCollaborateurDetail(id: number) {
  const [collaborateur, setCollaborateur] = useState<CollaborateurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborateur = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getCollaborateurById(id)
      .then(setCollaborateur)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchCollaborateur();
  }, [fetchCollaborateur]);

  return { collaborateur, loading, error, refetch: fetchCollaborateur };
}