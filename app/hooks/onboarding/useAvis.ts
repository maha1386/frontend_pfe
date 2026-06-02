"use client";

import { useState, useEffect, useCallback } from "react";
import {
  submitAvis,
  getAvisExistant,
  AvisResult,
} from "../../services/avis.service";

interface UseAvisReturn {
  checking: boolean;
  submitted: boolean;
  loading: boolean;
  error: string | null;
  result: AvisResult | null;
  submit: (etoiles: number, commentaire: string) => Promise<void>;
}

export function useAvis(onboardingId: number): UseAvisReturn {
  const [checking, setChecking]   = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<AvisResult | null>(null);

  // Vérifier si un avis existe déjà au montage
  useEffect(() => {
    if (!onboardingId) return;
    getAvisExistant(onboardingId)
      .then((data) => setSubmitted(data.a_deja_soumis))
      .catch(() => setSubmitted(false))
      .finally(() => setChecking(false));
  }, [onboardingId]);

  const submit = useCallback(
    async (etoiles: number, commentaire: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await submitAvis(onboardingId, etoiles, commentaire);
        setResult(res);
        setSubmitted(true);
      } catch (e: any) {
        setError(e.message ?? "Une erreur s'est produite.");
      } finally {
        setLoading(false);
      }
    },
    [onboardingId]
  );

  return { checking, submitted, loading, error, result, submit };
}